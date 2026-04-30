import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { cache } from "react";

const CONTENT_PATH = path.join(process.cwd(), "content");

/* =========================
   NORMALIZE / SLUG
========================= */
export function toSlug(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[–—]/g, "-") // fix dash unicode
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // bỏ ký tự lạ
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function getDisplayName(name: string) {
  return name
    .replace(/\.(mdx|pdf)$/i, "")
    .replace(/-/g, " ")
    .trim();
}

/* =========================
   FIND FILE (MDX/mdx)
========================= */
export function findFileBySlug(slug: string[], dir: string): string | null {
  if (!slug || slug.length === 0) return null;

  const [current, ...rest] = slug;
  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    const name = entry.replace(/\.(mdx|pdf)$/i, "");
    const normalized = toSlug(name);

    if (normalized === current) {
      // 📁 Folder
      if (stat.isDirectory()) {
        if (rest.length > 0) {
          return findFileBySlug(rest, fullPath);
        }

        // 👉 thử index.mdx / index.MDX
        const indexFiles = ["index.mdx", "index.MDX"];
        for (const file of indexFiles) {
          const indexPath = path.join(fullPath, file);
          if (fs.existsSync(indexPath)) return indexPath;
        }

        return null;
      }

      // 📄 File
      if (stat.isFile() && /\.(mdx|pdf)$/i.test(entry)) return fullPath; // ← thêm pdf
    }
  }

  return null;
}

/* =========================
   GET CONTENT
========================= */
export const getContentBySlug = cache(function (slug: string[]) {
  const filePath = findFileBySlug(slug, CONTENT_PATH);
  if (!filePath) return null;
  let fileName = path.basename(filePath);
  const isPdf = /\.pdf$/i.test(fileName);

  if (isPdf) {
    return {
      type: "pdf" as const,
      title: getDisplayName(fileName.replace(/\.pdf$/i, "")),
      url: `/pdfs/${slug.join("/")}.pdf`,
    };
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  fileName = path.basename(filePath).replace(/\.(mdx)$/i, "");

  return {
    type: "mdx" as const,
    content,
    title: getDisplayName(fileName),
  };
});

let cachedContent: { title: string; href: string; subject: string }[] | null =
  null;

export const getAllContent = cache(function () {
  if (cachedContent) return cachedContent;

  const results: { title: string; href: string; subject: string }[] = [];

  function walk(dir: string, slugParts: string[], subject: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const nameWithoutExt = entry.name.replace(/\.mdx?$/i, "");
      const newSlug = [...slugParts, toSlug(nameWithoutExt)];
      const currentSubject = subject || getDisplayName(nameWithoutExt);

      if (entry.isDirectory()) {
        results.push({
          title: getDisplayName(nameWithoutExt),
          href: `/subjects/${newSlug.join("/")}`,
          subject: currentSubject,
        });
        walk(path.join(dir, entry.name), newSlug, currentSubject);
      } else if (entry.name.match(/\.mdx?$/i)) {
        const raw = fs.readFileSync(path.join(dir, entry.name), "utf-8");
        const { data } = matter(raw);
        results.push({
          title: data.title ?? getDisplayName(nameWithoutExt),
          href: `/subjects/${newSlug.join("/")}`,
          subject: currentSubject,
        });
      }
    }
  }

  walk(CONTENT_PATH, [], "");

  cachedContent = results;
  return results;
});

/* =========================
   FIND FOLDER
========================= */
export function findFolderBySlug(slug: string[], dir: string): string | null {
  if (!slug.length) return dir;

  const [current, ...rest] = slug;
  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (!stat.isDirectory()) continue;

    if (toSlug(entry) === current) {
      return findFolderBySlug(rest, fullPath);
    }
  }

  return null;
}

/* =========================
   GET FOLDER CONTENTS
========================= */
export function getFolderContents(slug: string[]) {
  const folderPath = findFolderBySlug(slug, CONTENT_PATH);

  if (!folderPath) return null;

  const entries = fs.readdirSync(folderPath);

  return entries.map((entry) => {
    const fullPath = path.join(folderPath, entry);
    const stat = fs.statSync(fullPath);

    const name = entry.replace(/\.(mdx|pdf)$/i, "");

    return {
      name,
      title: getDisplayName(name),
      slug: toSlug(name),
      isFolder: stat.isDirectory(),
    };
  });
}

/* =========================
   STATIC PATHS
========================= */
export function getAllPaths(dir: string, base: string[] = []) {
  const entries = fs.readdirSync(dir);

  let paths: string[][] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      paths = paths.concat(getAllPaths(fullPath, [...base, toSlug(entry)]));
    } else if (/\.(mdx|pdf)$/i.test(entry)) {
      const rawName = entry.replace(/\.(mdx|pdf)$/i, "");

      paths.push([...base, toSlug(rawName)]);
    }
  }

  return paths;
}

export async function generateStaticParams() {
  const paths = getAllPaths(CONTENT_PATH);

  return paths.map((slug) => ({ slug }));
}

/* =========================
   BREADCRUMB
========================= */

export function buildBreadcrumb(slug: string[]) {
  const result = [];

  let currentDir = CONTENT_PATH;

  for (let i = 0; i < slug.length; i++) {
    const segment = slug[i];
    const entries = fs.readdirSync(currentDir);

    const match = entries.find((entry) => {
      const name = entry.replace(/\.(mdx|pdf)$/i, "");
      return toSlug(name) === segment;
    });

    if (!match) break;

    const fullPath = path.join(currentDir, match);
    const stat = fs.statSync(fullPath);

    const name = match.replace(/\.(mdx|pdf)$/i, "");

    // 🔥 ALWAYS push (file OR folder)
    result.push({
      name: getDisplayName(name),
      href: "/subjects/" + slug.slice(0, i + 1).join("/"),
    });

    // 🔥 IMPORTANT: nếu là folder thì đi tiếp
    if (stat.isDirectory()) {
      currentDir = fullPath;
    }
  }

  return result;
}

export function getFolderRealName(slug: string[]) {
  let dir = path.join(process.cwd(), "content");

  for (const segment of slug) {
    const entries = fs.readdirSync(dir);

    const match = entries.find((entry) => {
      const name = entry.replace(/\.(mdx|pdf)$/i, "");
      return toSlug(name) === segment;
    });

    if (!match) return segment;

    dir = path.join(dir, match);
  }

  return getDisplayName(path.basename(dir));
}

export function getOrderedFiles() {
  const results: { href: string; title: string; subject: string }[] = [];

  function walk(dir: string, slugParts: string[], subject: string) {
    const entries = fs
      .readdirSync(dir, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      const nameWithoutExt = entry.name.replace(/\.mdx?$/i, "");
      const newSlug = [...slugParts, toSlug(nameWithoutExt)];
      const currentSubject = subject || toSlug(nameWithoutExt);

      if (entry.isDirectory()) {
        // đi sâu vào folder, không push folder vào list
        walk(path.join(dir, entry.name), newSlug, currentSubject);
      } else if (entry.name.match(/\.mdx?$/i)) {
        const raw = fs.readFileSync(path.join(dir, entry.name), "utf-8");
        const { data } = matter(raw);
        results.push({
          href: `/subjects/${newSlug.join("/")}`,
          title: data.title ?? getDisplayName(nameWithoutExt),
          subject: currentSubject,
        });
      }
    }
  }

  // walk từng môn riêng để không cross subject
  const subjects = fs
    .readdirSync(CONTENT_PATH, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const subject of subjects) {
    walk(
      path.join(CONTENT_PATH, subject.name),
      [toSlug(subject.name)],
      toSlug(subject.name),
    );
  }

  return results;
}

export function getPrevNext(currentHref: string) {
  const files = getOrderedFiles();
  const currentSubject = files.find((f) => f.href === currentHref)?.subject;

  // chỉ lấy các file cùng môn
  const subjectFiles = files.filter((f) => f.subject === currentSubject);
  const index = subjectFiles.findIndex((f) => f.href === currentHref);

  if (index === -1) return { prev: null, next: null };

  return {
    prev: index > 0 ? subjectFiles[index - 1] : null,
    next: index < subjectFiles.length - 1 ? subjectFiles[index + 1] : null,
  };
}
