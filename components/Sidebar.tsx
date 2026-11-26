"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LuArrowLeft,
  LuChevronRight,
  LuFileDown,
  LuFileText,
  LuListTree,
  LuX,
} from "react-icons/lu";
import { CompletedBadge } from "@/components/CompletedBadge";
import {
  getSubjectCode,
  getSubjectTitle,
  isCompletedSubject,
} from "@/utils/subjects";
import type { TreeNode } from "@/utils/tree";

/* Môn học đang xem, lấy từ /subjects/[môn]/... */
function useCurrentSubject(tree: TreeNode[]) {
  const pathname = usePathname();
  const slug = pathname.split("/")[2];
  return slug ? (tree.find((n) => n.slug === slug) ?? null) : null;
}

/* =========================
   DESKTOP: cột mục lục bên trái (từ xl trở lên)
========================= */
export default function Sidebar({ tree }: { tree: TreeNode[] }) {
  const subject = useCurrentSubject(tree);
  if (!subject) return null;

  return (
    <aside
      data-scroll-container
      className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-72 shrink-0 self-start overflow-y-auto border-r border-primary/10 bg-primary/5 px-3 py-6 xl:block"
    >
      <SubjectNav subject={subject} />
    </aside>
  );
}

/* =========================
   MOBILE / TABLET: thanh "Mục lục" + ngăn kéo
========================= */
export function MobileSubjectBar({ tree }: { tree: TreeNode[] }) {
  const pathname = usePathname();
  const subject = useCurrentSubject(tree);

  // Gắn trạng thái mở với pathname: chuyển trang là tự đóng
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPath(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!subject) return null;

  return (
    <>
      <div className="sticky top-16 z-30 border-b border-primary/10 bg-white xl:hidden">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-2 sm:px-6">
          <button
            type="button"
            onClick={() => setOpenPath(pathname)}
            aria-expanded={open}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-primary/15 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:border-accent hover:bg-accent/10"
          >
            <LuListTree aria-hidden /> Mục lục
          </button>
          <span className="min-w-0 truncate text-sm text-primary/60">
            <span className="font-mono text-xs font-semibold text-secondary">
              {getSubjectCode(subject.name)}
            </span>{" "}
            {getSubjectTitle(subject.name)}
          </span>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[60] xl:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mục lục môn học"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenPath(null)}
          />
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-primary/10 px-4 py-3">
              <span className="font-semibold text-primary">Mục lục</span>
              <button
                type="button"
                onClick={() => setOpenPath(null)}
                aria-label="Đóng mục lục"
                className="rounded-md p-1.5 text-primary/60 transition-colors hover:bg-accent/15 hover:text-primary"
              >
                <LuX size={18} />
              </button>
            </div>
            <div
              data-scroll-container
              className="flex-1 overflow-y-auto px-3 py-4"
            >
              <SubjectNav
                subject={subject}
                onNavigate={() => setOpenPath(null)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================
   NỘI DUNG MỤC LỤC
========================= */
function SubjectNav({
  subject,
  onNavigate,
}: {
  subject: TreeNode;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const rootHref = `/subjects/${subject.path}`;
  const isRoot = pathname === rootHref;

  return (
    <nav aria-label="Mục lục môn học">
      <Link
        href="/subjects"
        onClick={onNavigate}
        className="mb-4 inline-flex items-center gap-1.5 px-2 text-sm text-primary/60 transition-colors hover:text-secondary"
      >
        <LuArrowLeft aria-hidden /> Tất cả môn học
      </Link>

      <Link
        href={rootHref}
        onClick={onNavigate}
        aria-current={isRoot ? "page" : undefined}
        className={`mb-4 block rounded-lg px-2 py-2 transition-colors ${
          isRoot ? "bg-accent/25" : "hover:bg-accent/15"
        }`}
      >
        <span className="flex items-center gap-1.5 font-mono text-xs font-semibold text-secondary">
          {getSubjectCode(subject.name)}
          {isCompletedSubject(subject.name) && <CompletedBadge />}
        </span>
        <span className="mt-0.5 block font-semibold leading-snug text-primary">
          {getSubjectTitle(subject.name)}
        </span>
      </Link>

      <TreeList nodes={subject.children ?? []} onNavigate={onNavigate} />
    </nav>
  );
}

function TreeList({
  nodes,
  onNavigate,
}: {
  nodes: TreeNode[];
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-0.5">
      {nodes.map((node) =>
        node.isFile ? (
          <FileItem key={node.path} node={node} onNavigate={onNavigate} />
        ) : (
          <FolderItem key={node.path} node={node} onNavigate={onNavigate} />
        ),
      )}
    </ul>
  );
}

function FileItem({
  node,
  onNavigate,
}: {
  node: TreeNode;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const href = `/subjects/${node.path}`;
  const isActive = pathname === href;
  const ref = useRef<HTMLAnchorElement>(null);

  // Cuộn mục lục để bài đang đọc nằm trong tầm nhìn
  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(() => {
      const el = ref.current;
      const container = el?.closest("[data-scroll-container]");
      if (!el || !container) return;
      const r = el.getBoundingClientRect();
      const c = container.getBoundingClientRect();
      if (r.top < c.top || r.bottom > c.bottom) {
        container.scrollTop += r.top - c.top - c.height / 3;
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [isActive]);

  const Icon = node.kind === "pdf" ? LuFileDown : LuFileText;

  return (
    <li>
      <Link
        ref={ref}
        href={href}
        onClick={onNavigate}
        aria-current={isActive ? "page" : undefined}
        className={`flex items-start gap-2 rounded-md px-2 py-1.5 text-sm leading-snug transition-colors ${
          isActive
            ? "bg-accent font-semibold text-primary"
            : "text-primary/75 hover:bg-accent/15 hover:text-primary"
        }`}
      >
        <Icon
          aria-hidden
          className={`mt-0.5 shrink-0 ${isActive ? "text-primary" : "text-primary/40"}`}
        />
        <span className="min-w-0">{node.name}</span>
      </Link>
    </li>
  );
}

function FolderItem({
  node,
  onNavigate,
}: {
  node: TreeNode;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const href = `/subjects/${node.path}`;
  const isActive = pathname === href;
  const isAncestor = pathname === href || pathname.startsWith(href + "/");

  // Người dùng bấm mở/đóng trên trang hiện tại thì theo lựa chọn đó;
  // sang trang khác thì tự mở thư mục chứa bài đang đọc.
  const [toggle, setToggle] = useState<{ path: string; open: boolean } | null>(
    null,
  );
  const open =
    toggle && toggle.path === pathname
      ? toggle.open
      : isAncestor || (toggle?.open ?? false);

  return (
    <li>
      <div className="flex items-start">
        <button
          type="button"
          onClick={() => setToggle({ path: pathname, open: !open })}
          aria-expanded={open}
          aria-label={open ? `Thu gọn ${node.name}` : `Mở ${node.name}`}
          className="mt-0.5 shrink-0 rounded-md p-1.5 text-primary/50 transition-colors hover:bg-accent/15 hover:text-primary"
        >
          <LuChevronRight
            aria-hidden
            className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          />
        </button>
        <Link
          href={href}
          onClick={onNavigate}
          aria-current={isActive ? "page" : undefined}
          className={`min-w-0 flex-1 rounded-md px-1.5 py-1.5 text-sm font-semibold leading-snug transition-colors ${
            isActive
              ? "bg-accent/25 text-primary"
              : "text-primary/90 hover:bg-accent/15 hover:text-primary"
          }`}
        >
          {node.name}
        </Link>
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
        inert={!open}
      >
        <div className="overflow-hidden">
          {node.children && node.children.length > 0 && (
            <div className="ml-3.5 mt-0.5 border-l border-primary/10 pl-2">
              <TreeList nodes={node.children} onNavigate={onNavigate} />
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
