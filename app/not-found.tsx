import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
      {/* Content */}
      <div className="text-center flex flex-col items-center gap-6">
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
          <p className="text-sm text-primary/60 max-w-xs">
            Trang bạn đang tìm kiếm đã bị xóa, đổi tên hoặc chưa được tạo.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Link
            href="/"
            className="px-6 py-2.5 rounded-lg bg-accent text-primary text-sm font-semibold hover:bg-accent/85 transition-colors"
          >
            Về trang chủ
          </Link>
          <Link
            href="/subjects"
            className="px-6 py-2.5 rounded-lg border border-primary/20 text-primary/70 text-sm font-medium hover:border-accent hover:bg-accent/10 hover:text-primary transition-colors"
          >
            Xem môn học
          </Link>
        </div>
      </div>
    </div>
  );
}
