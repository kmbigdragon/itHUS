import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--color-primary) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow */}
      <div className="absolute w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center flex flex-col items-center gap-6">
        {/* 404 số lớn */}
        <div className="relative">
          <span className="text-[160px] sm:text-[220px] font-black leading-none tracking-tighter text-primary/5 select-none">
            404
          </span>
          <span className="absolute inset-0 flex items-center justify-center text-5xl sm:text-6xl font-black text-primary/80 tracking-tight">
            404
          </span>
        </div>

        <div className="flex flex-col items-center gap-2 -mt-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-primary/80">
            Trang không tồn tại
          </h1>
          <p className="text-sm text-primary/40 max-w-xs">
            Trang bạn đang tìm kiếm đã bị xóa, đổi tên hoặc chưa được tạo.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Link
            href="/"
            className="px-6 py-2.5 rounded-lg bg-accent text-background text-sm font-medium hover:bg-accent/80 transition"
          >
            Về trang chủ
          </Link>
          <Link
            href="/subjects"
            className="px-6 py-2.5 rounded-lg border border-primary/20 text-primary/60 text-sm font-medium hover:border-primary/40 hover:text-primary/80 transition"
          >
            Xem môn học
          </Link>
        </div>
      </div>
    </div>
  );
}
