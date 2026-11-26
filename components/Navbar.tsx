"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { LuMenu, LuX } from "react-icons/lu";
import { SearchBar } from "./SearchBar";

const links = [
  { href: "/", label: "Trang chủ" },
  { href: "/subjects", label: "Môn học" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function Navbar() {
  const pathname = usePathname();

  // Gắn trạng thái mở với pathname: chuyển trang là menu tự đóng
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuPath(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuPath(null);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-primary/90 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 h-16">
        {/* Logo */}
        <Link
          href="/"
          aria-label="itHUS - Trang chủ"
          className="flex shrink-0 items-center gap-3 group"
        >
          <Image
            src="/itHUS_LOGO.webp"
            alt="itHUS"
            width={120}
            height={60}
            loading="eager"
            className="h-9 w-auto transition-all duration-300 group-hover:drop-shadow-[0_0_8px_var(--color-accent)]"
          />

          <div className="flex pl-0.5 text-base/30 justify-center items-center">
            <FaXmark />
          </div>

          <Image
            src="/BIGDRAGONLOGO.webp"
            alt="bigdragon"
            width={120}
            height={60}
            loading="eager"
            className="h-9 w-auto transition-all duration-300 group-hover:drop-shadow-[0_0_8px_var(--color-accent)]"
          />
        </Link>

        <div className="flex items-center gap-2 md:gap-6">
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                    active
                      ? "bg-base/10 text-base"
                      : "text-base/70 hover:bg-base/5 hover:text-base"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          <SearchBar />

          {/* Mobile Menu */}
          <div ref={menuRef} className="relative md:hidden">
            <button
              type="button"
              onClick={() => setMenuPath(menuOpen ? null : pathname)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
              className="rounded-lg p-2 text-base transition-colors hover:bg-base/10"
            >
              {menuOpen ? <LuX size={22} /> : <LuMenu size={22} />}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-3 w-48 overflow-hidden rounded-lg bg-secondary shadow-lg">
                <div className="flex flex-col p-1.5">
                  {links.map((l) => {
                    const active = isActive(pathname, l.href);
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={() => setMenuPath(null)}
                        aria-current={active ? "page" : undefined}
                        className={`rounded-md px-3 py-2.5 transition-colors ${
                          active
                            ? "bg-primary/40 font-medium text-base"
                            : "text-base/75 hover:bg-primary/30 hover:text-base"
                        }`}
                      >
                        {l.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
