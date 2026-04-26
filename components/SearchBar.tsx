"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FaSearch } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ title: string; href: string; subject: string }[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      setQuery("");
      setResults([]);
      setSearched(false);
      document.body.style.overflow = "";
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`,
      ).then((r) => r.json());
      setResults(data);
    } catch (e) {
      console.error("Search error:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-base text-2xl hover:text-base/30 transition"
        aria-label="Tìm kiếm"
      >
        <FaSearch size={18} />
      </button>

      {open && (
        <div
          className="absolute top-0 left-0 w-screen h-screen inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-primary text-primary rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-accent/10">
              <FaSearch className="text-accent shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Tìm kiếm bài viết..."
                className="flex-1 bg-transparent outline-none text-accent placeholder:text-accent/40"
              />
              <button
                onClick={() => setOpen(false)}
                className="text-accent/40 hover:text-accent transition"
              >
                <IoClose size={20} />
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div className="px-4 py-6 text-center text-accent/40 text-sm">
                Đang tìm kiếm...
              </div>
            )}

            {/* Kết quả */}
            {!loading && results.length > 0 && (
              <div className="max-h-72 overflow-y-auto">
                {results.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent/10 transition border-b border-accent/5 last:border-0"
                  >
                    <FaSearch size={12} className="text-accent/30 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm truncate text-accent">
                        {item.title}
                      </div>
                      <div className="text-xs text-accent/40 truncate">
                        {item.subject}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Không có kết quả */}
            {!loading && searched && results.length === 0 && (
              <div className="px-4 py-6 text-center text-accent/40 text-sm">
                Không tìm thấy kết quả cho &quot;{query}&quot;
              </div>
            )}

            <div className="px-4 py-2 text-xs text-accent/30 border-t border-accent/10">
              Nhấn <kbd className="px-1 py-0.5 rounded bg-accent/10">Enter</kbd>{" "}
              để tìm ·{" "}
              <kbd className="px-1 py-0.5 rounded bg-accent/10">Esc</kbd> để
              đóng
            </div>
          </div>
        </div>
      )}
    </>
  );
}
