import type { ReactNode } from "react";

type Props = {
  title?: string; // tên công thức, hiện phía trên phần thân
  children: ReactNode;
};

export function Formula({ title, children }: Props) {
  return (
    <div className="my-6 rounded-r-lg border-l-4 border-secondary bg-accent/15 px-4 py-3 [&_.katex-display]:my-2 [&_p:last-child]:mb-0">
      {title && (
        <div className="mb-1 text-sm font-semibold text-secondary">{title}</div>
      )}
      {children}
    </div>
  );
}
