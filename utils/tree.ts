import path from "path";
import { cache } from "react";
import { toSlug, getDisplayName, readDirSorted, statEntry } from "./slug";

const CONTENT_PATH = path.join(process.cwd(), "content");

export type TreeNode = {
  name: string;
  slug: string;
  path: string;
  isFile: boolean;
  kind: "folder" | "lesson" | "pdf";
  /** Số bài .mdx bên trong (file .mdx tính là 1) */
  lessons: number;
  /** Số file .pdf bên trong (file .pdf tính là 1) */
  pdfs: number;
  children?: TreeNode[];
};

function walk(dir: string, base: string[]): TreeNode[] {
  const result: TreeNode[] = [];

  for (const entry of readDirSorted(dir)) {
    const fullPath = path.join(dir, entry);
    // PDF nằm ở public/pdf/ nhưng vẫn hiện đúng chỗ như khi còn trong content/
    const stat = statEntry(fullPath);

    const name = entry.replace(/\.(mdx|pdf)$/i, "");
    const slug = toSlug(name);
    const nodePath = [...base, slug].join("/");

    if (stat.isDirectory()) {
      const children = walk(fullPath, [...base, slug]);
      result.push({
        name: getDisplayName(entry),
        slug,
        path: nodePath,
        isFile: false,
        kind: "folder",
        lessons: children.reduce((sum, c) => sum + c.lessons, 0),
        pdfs: children.reduce((sum, c) => sum + c.pdfs, 0),
        children,
      });
    } else if (/\.(mdx|pdf)$/i.test(entry)) {
      const isPdf = /\.pdf$/i.test(entry);
      result.push({
        name: getDisplayName(name),
        slug,
        path: nodePath,
        isFile: true,
        kind: isPdf ? "pdf" : "lesson",
        lessons: isPdf ? 0 : 1,
        pdfs: isPdf ? 1 : 0,
      });
    }
  }

  return result;
}

export const buildTree = cache(function (): TreeNode[] {
  return walk(CONTENT_PATH, []);
});

export function findNode(tree: TreeNode[], slug: string[]): TreeNode | null {
  let nodes: TreeNode[] | undefined = tree;
  let found: TreeNode | null = null;

  for (const part of slug) {
    found = nodes?.find((n) => n.slug === part) ?? null;
    if (!found) return null;
    nodes = found.children;
  }

  return found;
}

/** Bài đầu tiên (theo thứ tự hiển thị) bên trong một thư mục, ưu tiên bài .mdx */
export function findFirstFile(node: TreeNode): TreeNode | null {
  const files: TreeNode[] = [];
  (function collect(n: TreeNode) {
    if (n.isFile) files.push(n);
    n.children?.forEach(collect);
  })(node);

  return files.find((f) => f.kind === "lesson") ?? files[0] ?? null;
}
