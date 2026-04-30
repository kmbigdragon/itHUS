"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * NavigationProgress
 * - Hiện progress bar ngay khi bắt đầu navigate (pathname chưa đổi)
 * - Tự động complete khi trang mới đã render xong
 *
 * Dùng: đặt component này trong layout.tsx (root layout), bên ngoài {children}
 * Ví dụ:
 *   <NavigationProgress />
 *   {children}
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPathname = useRef(pathname);
  const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Khi pathname THAY ĐỔI → trang đã render xong → complete bar
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      completBar();
    }
  }, [pathname]);

  function startBar() {
    // Xóa timer cũ nếu có
    if (timerRef.current) clearInterval(timerRef.current);
    if (completeTimer.current) clearTimeout(completeTimer.current);

    setProgress(0);
    setVisible(true);

    // Tăng dần đến ~85%, không bao giờ đến 100% (chờ trang load xong)
    let current = 0;
    timerRef.current = setInterval(() => {
      current += Math.random() * 12 + 3; // tăng ngẫu nhiên 3–15%
      if (current > 85) {
        current = 85;
        if (timerRef.current) clearInterval(timerRef.current);
      }
      setProgress(current);
    }, 200);
  }

  function completBar() {
    if (timerRef.current) clearInterval(timerRef.current);

    setProgress(100);

    // Ẩn bar sau khi complete
    completeTimer.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 400);
  }

  // Intercept tất cả click vào <a> để bắt đầu loading
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Chỉ xử lý internal links
      const isInternal =
        href.startsWith("/") ||
        href.startsWith(window.location.origin);

      const isSamePage = href === window.location.pathname;
      const opensNewTab =
        target.getAttribute("target") === "_blank";

      if (isInternal && !isSamePage && !opensNewTab) {
        startBar();
      }
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        height: "3px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          transition:
            progress === 100
              ? "width 0.2s ease-out"
              : "width 0.3s ease-in-out",
          background: "var(--color-accent, #6366f1)",
          boxShadow: "0 0 8px var(--color-accent, #6366f1)",
          borderRadius: "0 2px 2px 0",
        }}
      />
    </div>
  );
}