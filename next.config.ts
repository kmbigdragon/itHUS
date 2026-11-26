import type { NextConfig } from "next";

/**
 * Thời gian Cloudflare giữ HTML và dữ liệu điều hướng (RSC) của các trang.
 * Chỉ Cloudflare đọc header này, trình duyệt vẫn hỏi lại mỗi lần như cũ.
 * Header chỉ có tác dụng khi bật Cache Rule "Eligible for cache" trên Cloudflare.
 * - max-age=3600: giữ bản đã cache 1 giờ
 * - stale-while-revalidate=86400: hết hạn thì vẫn trả bản cũ ngay, lấy bản mới ở nền (tối đa 1 ngày)
 */
const CLOUDFLARE_PAGE_CACHE = "public, max-age=3600, stale-while-revalidate=86400";

const cloudflarePageCache = [
  { key: "Cloudflare-CDN-Cache-Control", value: CLOUDFLARE_PAGE_CACHE },
];

const nextConfig: NextConfig = {
  reactCompiler: true,

  // File trong public/ (PDF, hình) do CDN phục vụ trực tiếp, function không đọc tới:
  // không đóng gói vào serverless function cho nhẹ, khởi động nhanh hơn
  outputFileTracingExcludes: {
    "*": ["public/**/*"],
  },

  async headers() {
    return [
      { source: "/", headers: cloudflarePageCache },
      { source: "/subjects", headers: cloudflarePageCache },
      { source: "/subjects/:path*", headers: cloudflarePageCache },
      { source: "/api/search", headers: cloudflarePageCache },
      { source: "/api/content/:path*", headers: cloudflarePageCache },
    ];
  },
};

export default nextConfig;
