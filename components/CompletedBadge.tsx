import { FaCircleCheck } from "react-icons/fa6";

type Props = {
  /** "icon": chỉ hiện tích, "label": tích kèm chữ "Đã hoàn thành" */
  variant?: "icon" | "label";
  className?: string;
  /** Màu của tích (chỉ dùng cho "icon"), đổi khi nằm trên nền tối */
  colorClass?: string;
};

export function CompletedBadge({
  variant = "icon",
  className = "",
  colorClass = "text-secondary",
}: Props) {
  if (variant === "icon") {
    return (
      <FaCircleCheck
        role="img"
        aria-label="Đã hoàn thành"
        title="Đã hoàn thành"
        className={`shrink-0 ${colorClass} ${className}`}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary ${className}`}
    >
      <FaCircleCheck aria-hidden className="shrink-0" />
      Đã hoàn thành
    </span>
  );
}
