import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import matter from "gray-matter";
import { cache } from "react";
import { getSubjectCode } from "./subjects";

const CONTENT_PATH = path.join(process.cwd(), "content");

/* =========================
   PDF TĨNH
   File PDF nằm ở public/pdf/ với cấu trúc thư mục y hệt content/,
   để Netlify phục vụ như file tĩnh và Cloudflare cache được.
   Các hàm bên dưới xem content/ và public/pdf/ như MỘT thư mục:
   đường dẫn của PDF vẫn viết theo content/ (đường dẫn "ảo").
========================= */
// turbopackIgnore: PDF chỉ cần lúc build, không đóng gói thư mục này vào serverless function
const PDF_PATH = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "pdf");
const PDF_URL_BASE = "/pdf";

/** Thư mục tương ứng bên public/pdf của một thư mục trong content/ */
function pdfMirrorOf(contentPath: string) {
  return path.join(PDF_PATH, path.relative(CONTENT_PATH, contentPath));
}

/** Liệt kê thư mục: phần trong content/ gộp với thư mục con và file .pdf bên public/pdf/ */
function listDir(dir: string): string[] {
  const names = new Set<string>();
  if (fs.existsSync(dir)) {
    for (const entry of fs.readdirSync(dir)) names.add(entry);
  }

  const mirror = pdfMirrorOf(dir);
  if (fs.existsSync(mirror)) {
    for (const entry of fs.readdirSync(mirror)) {
      const isDir = fs.statSync(path.join(mirror, entry)).isDirectory();
      if (isDir || /\.pdf$/i.test(entry)) names.add(entry);
    }
  }

  return [...names];
}

/** stat của một đường dẫn ảo: tìm trong content/ trước, không có thì tìm bên public/pdf/ */
export function statEntry(fullPath: string): fs.Stats {
  return fs.existsSync(fullPath)
    ? fs.statSync(fullPath)
    : fs.statSync(pdfMirrorOf(fullPath));
}

const pdfVersions = new Map<string, string>();

/**
 * URL tĩnh của một file PDF (nhận đường dẫn ảo trong content/).
 * Kèm ?v=<mã băm nội dung> nên có thể cache rất lâu: thay file thì URL tự đổi.
 */
export function pdfUrl(contentPath: string): string {
  const file = pdfMirrorOf(contentPath);
  if (!fs.existsSync(file)) {
    throw new Error(
      `File PDF phải nằm trong public/pdf/ (cùng cấu trúc với content/): ${path.relative(process.cwd(), file)}`,
    );
  }

  let version = pdfVersions.get(file);
  if (!version) {
    version = createHash("md5")
      .update(fs.readFileSync(file))
      .digest("hex")
      .slice(0, 10);
    pdfVersions.set(file, version);
  }

  const rel = path
    .relative(CONTENT_PATH, contentPath)
    .split(path.sep)
    .map(encodeURIComponent)
    .join("/");
  return `${PDF_URL_BASE}/${rel}?v=${version}`;
}

/* =========================
   SORT
   So sánh theo tiếng Việt và theo số ("Chương 2" đứng trước "Chương 10")
========================= */
const collator = new Intl.Collator("vi", { numeric: true });

export function compareNames(a: string, b: string) {
  return collator.compare(a, b);
}

export function readDirSorted(dir: string): string[] {
  return listDir(dir).sort(compareNames);
}

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
  const entries = listDir(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = statEntry(fullPath);

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
      url: pdfUrl(filePath),
    };
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { content } = matter(raw);
  fileName = path.basename(filePath).replace(/\.(mdx)$/i, "");

  return {
    type: "mdx" as const,
    content,
    title: getDisplayName(fileName),
  };
});

export type SearchItem = {
  title: string;
  href: string;
  kind: "folder" | "lesson" | "pdf";
  /** Đường dẫn cha, ví dụ "MAT3323 › Chương 3 – Cây bao trùm nhỏ nhất" */
  context: string;
};

let cachedContent: SearchItem[] | null = null;

export const getAllContent = cache(function () {
  if (cachedContent) return cachedContent;

  const results: SearchItem[] = [];

  function walk(dir: string, slugParts: string[], trail: string[]) {
    for (const entry of readDirSorted(dir)) {
      const fullPath = path.join(dir, entry);
      const isDir = statEntry(fullPath).isDirectory();
      const isPdf = /\.pdf$/i.test(entry);
      const isMdx = /\.mdx$/i.test(entry);
      if (!isDir && !isPdf && !isMdx) continue;

      const nameWithoutExt = entry.replace(/\.(mdx|pdf)$/i, "");
      const newSlug = [...slugParts, toSlug(nameWithoutExt)];
      const title = getDisplayName(nameWithoutExt);

      results.push({
        title,
        href: `/subjects/${newSlug.join("/")}`,
        kind: isDir ? "folder" : isPdf ? "pdf" : "lesson",
        context: trail.join(" › "),
      });

      if (isDir) {
        // cấp môn học chỉ hiện mã môn cho gọn
        const label = trail.length === 0 ? (getSubjectCode(title) ?? title) : title;
        walk(fullPath, newSlug, [...trail, label]);
      }
    }
  }

  walk(CONTENT_PATH, [], []);

  cachedContent = results;
  return results;
});

/* =========================
   FIND FOLDER
========================= */
export function findFolderBySlug(slug: string[], dir: string): string | null {
  if (!slug.length) return dir;

  const [current, ...rest] = slug;
  const entries = listDir(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = statEntry(fullPath);

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

  const entries = readDirSorted(folderPath);

  return entries.map((entry) => {
    const fullPath = path.join(folderPath, entry);
    const stat = statEntry(fullPath);

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
  const entries = listDir(dir);

  let paths: string[][] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = statEntry(fullPath);

    if (stat.isDirectory()) {
      const folderSlug = [...base, toSlug(entry)];
      // dựng sẵn cả trang môn / trang chương, không để render lúc có người vào
      paths.push(folderSlug);
      paths = paths.concat(getAllPaths(fullPath, folderSlug));
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
    const entries = listDir(currentDir);

    const match = entries.find((entry) => {
      const name = entry.replace(/\.(mdx|pdf)$/i, "");
      return toSlug(name) === segment;
    });

    if (!match) break;

    const fullPath = path.join(currentDir, match);
    const stat = statEntry(fullPath);

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
    const entries = listDir(dir);

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
      .sort((a, b) => compareNames(a.name, b.name));

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
    .sort((a, b) => compareNames(a.name, b.name));

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
