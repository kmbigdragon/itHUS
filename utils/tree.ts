import fs from "fs";
import path from "path";
import { toSlug, getDisplayName } from "./slug";

const CONTENT_PATH = path.join(process.cwd(), "content");

export type TreeNode = {
  name: string;
  slug: string;
  path: string;
  children?: TreeNode[];
  isFile: boolean;
};

export function buildTree(dir = CONTENT_PATH, base: string[] = []): TreeNode[] {
  const entries = fs.readdirSync(dir);

  const result: TreeNode[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    const name = entry.replace(/\.(mdx|pdf)$/i, "");
    const slug = toSlug(name);

    if (stat.isDirectory()) {
      result.push({
        name: getDisplayName(entry),
        slug,
        path: [...base, slug].join("/"),
        isFile: false,
        children: buildTree(fullPath, [...base, slug]),
      });
    } else if (/\.(mdx|pdf)$/i.test(entry)) {
      result.push({
        name: getDisplayName(name),
        slug,
        path: [...base, slug].join("/"),
        isFile: true,
      });
    }
  }

  return result;
}
