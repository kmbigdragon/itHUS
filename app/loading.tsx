export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="w-10 h-10 rounded-full border-2 border-primary/10 border-t-accent animate-spin" />
        <p className="text-sm text-primary/40">Đang tải...</p>
      </div>
    </div>
  );
}
