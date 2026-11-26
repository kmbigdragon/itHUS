"use client";

import { CompletedBadge } from "@/components/CompletedBadge";
import { isCompletedSubject } from "@/utils/subjects";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  LuCornerDownLeft,
  LuFileDown,
  LuFileText,
  LuFolder,
  LuSearch,
  LuX,
} from "react-icons/lu";

type SearchItem = {
  title: string;
  href: string;
  kind: "folder" | "lesson" | "pdf";
  context: string;
};

/** Sự kiện để nơi khác (ví dụ nút ở trang chủ) mở hộp tìm kiếm */
export const OPEN_SEARCH_EVENT = "ithus:open-search";

const MAX_RESULTS = 40;

/** Bỏ dấu để gõ "thuat toan" vẫn ra "Thuật toán" */
function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();
}

function search(index: SearchItem[], query: string) {
  const q = normalize(query.trim());
  if (!q) return [];
  const tokens = q.split(/\s+/);

  const scored: { item: SearchItem; score: number }[] = [];
  for (const item of index) {
    const title = normalize(item.title);
    const haystack = `${title} ${normalize(item.context)}`;
    if (!tokens.every((t) => haystack.includes(t))) continue;

    let score = 0;
    if (title.includes(q)) score += 2;
    if (tokens.every((t) => title.includes(t))) score += 2;
    if (item.kind === "lesson") score += 1;
    scored.push({ item, score });
  }

  // sort ổn định: cùng điểm thì giữ thứ tự mục lục
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map((s) => s.item);
}

function KindIcon({ kind }: { kind: SearchItem["kind"] }) {
  const Icon =
    kind === "folder" ? LuFolder : kind === "pdf" ? LuFileDown : LuFileText;
  return <Icon aria-hidden className="mt-0.5 shrink-0 text-accent/60" />;
}

export function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchItem[] | null>(null);
  const [error, setError] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(
    () => (index ? search(index, query) : []),
    [index, query],
  );
  const suggestions = useMemo(
    () =>
      (index ?? []).filter(
        (i) =>
          i.kind === "folder" &&
          i.context === "" &&
          isCompletedSubject(i.title),
      ),
    [index],
  );
  const shown = query.trim() ? results : suggestions;

  function openSearch() {
    setQuery("");
    setActive(0);
    setOpen(true);
  }

  function close() {
    setOpen(false);
  }

  // Phím tắt: Ctrl/⌘ + K hoặc "/" để mở, Esc để đóng
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        openSearch();
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        openSearch();
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpenEvent = () => openSearch();

    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpenEvent);
    };
  }, []);

  // Khi mở: khoá cuộn trang, focus ô nhập, tải chỉ mục (một lần)
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => inputRef.current?.focus(), 30);

    if (!index) {
      fetch("/api/search")
        .then((r) => r.json())
        .then((data: SearchItem[]) => {
          setIndex(data);
          setError(false);
        })
        .catch(() => setError(true));
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      clearTimeout(timer);
    };
  }, [open, index]);

  // Giữ mục đang chọn trong tầm nhìn khi dùng phím mũi tên
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (shown.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % shown.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + shown.length) % shown.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = shown[Math.min(active, shown.length - 1)];
      if (item) {
        close();
        router.push(item.href);
      }
    }
  }

  return (
    <>
      {/* Nút mở: dạng ô tìm kiếm trên desktop, chỉ biểu tượng trên điện thoại */}
      <button
        type="button"
        onClick={openSearch}
        aria-label="Tìm kiếm"
        className="flex items-center gap-2 rounded-lg p-2 text-base/80 transition-colors hover:text-base md:w-56 md:border md:border-base/20 md:bg-base/5 md:px-3 md:py-1.5 md:text-sm md:text-base/60 md:hover:border-base/40 md:hover:text-base/90"
      >
        <LuSearch aria-hidden size={18} className="shrink-0 md:size-4" />
        <span className="hidden flex-1 text-left md:inline">
          Tìm bài học...
        </span>
        <kbd className="hidden rounded border border-base/20 px-1.5 font-mono text-[11px] text-base/50 md:inline">
          Ctrl K
        </kbd>
      </button>

      {/* Portal ra body: navbar có backdrop-blur nên "fixed" bên trong nó sẽ bị giới hạn trong navbar */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[70] flex items-start justify-center bg-black/50 px-4 pt-[12vh]"
            onClick={close}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Tìm kiếm"
              className="flex max-h-[75vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-primary shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Ô nhập */}
              <div className="flex items-center gap-3 px-4 py-3">
                <LuSearch aria-hidden className="shrink-0 text-accent" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onInputKeyDown}
                  placeholder="Tên bài, thuật toán, mã môn học..."
                  aria-label="Từ khoá tìm kiếm"
                  className="min-w-0 flex-1 bg-transparent text-base outline-none focus-visible:outline-none placeholder:text-accent/50"
                />
                <button
                  type="button"
                  onClick={close}
                  aria-label="Đóng"
                  className="rounded p-1 text-accent/60 transition-colors hover:text-accent"
                >
                  <LuX size={18} />
                </button>
              </div>

              {/* Nội dung */}
              <div className="min-h-0 flex-1 overflow-y-auto">
                {error && (
                  <p className="px-4 py-6 text-center text-sm text-accent/70">
                    Không tải được dữ liệu tìm kiếm. Thử lại sau nhé.
                  </p>
                )}

                {!error && !index && (
                  <p className="px-4 py-6 text-center text-sm text-accent/60">
                    Đang tải...
                  </p>
                )}

                {index && !query.trim() && suggestions.length > 0 && (
                  <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-accent/50">
                    Môn đã hoàn thành
                  </p>
                )}

                {index && shown.length > 0 && (
                  <ul ref={listRef} className="p-2">
                    {shown.map((item, i) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          data-index={i}
                          onClick={close}
                          onMouseMove={() => setActive(i)}
                          className={`flex items-start gap-3 rounded-lg px-3 py-2.5 ${
                            i === active ? "bg-secondary" : ""
                          }`}
                        >
                          <KindIcon kind={item.kind} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-sm text-base">
                              <span className="truncate">{item.title}</span>
                              {item.context === "" &&
                                isCompletedSubject(item.title) && (
                                  <CompletedBadge colorClass="text-accent" />
                                )}
                            </div>
                            {item.context && (
                              <div className="truncate text-xs text-accent/70">
                                {item.context}
                              </div>
                            )}
                          </div>
                          {i === active && (
                            <LuCornerDownLeft
                              aria-hidden
                              className="mt-1 hidden shrink-0 text-accent/60 sm:block"
                            />
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {index && query.trim() && results.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-accent/70">
                    Không tìm thấy kết quả cho &quot;{query}&quot;
                  </p>
                )}
              </div>

              <div className="hidden gap-4 border-t border-accent/15 px-4 py-2 text-xs text-accent/50 sm:flex">
                <span>
                  <kbd className="rounded bg-accent/10 px-1 py-0.5">↑</kbd>{" "}
                  <kbd className="rounded bg-accent/10 px-1 py-0.5">↓</kbd> chọn
                </span>
                <span>
                  <kbd className="rounded bg-accent/10 px-1 py-0.5">Enter</kbd>{" "}
                  mở
                </span>
                <span>
                  <kbd className="rounded bg-accent/10 px-1 py-0.5">Esc</kbd>{" "}
                  đóng
                </span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
