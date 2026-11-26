import type { ReactNode } from "react";
import { FaGithub } from "react-icons/fa";
import { LuArrowUpRight, LuBookOpen } from "react-icons/lu";

const REPO_URL = "https://github.com/kmbigdragon/itHUS";

function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-base/10 px-1.5 py-0.5 font-mono text-[0.85em] text-base">
      {children}
    </code>
  );
}

const steps: { title: string; body: ReactNode }[] = [
  {
    title: "Fork và chạy thử ở máy",
    body: (
      <>
        Fork kho mã về tài khoản của bạn, cài thư viện bằng{" "}
        <InlineCode>pnpm install</InlineCode> rồi chạy{" "}
        <InlineCode>pnpm dev</InlineCode>.
      </>
    ),
  },
  {
    title: "Viết hoặc sửa bài",
    body: (
      <>
        Mỗi bài là một file <InlineCode>.mdx</InlineCode> trong thư mục{" "}
        <InlineCode>content/</InlineCode>, xếp theo môn và chương. Công thức
        viết bằng LaTeX.
      </>
    ),
  },
  {
    title: "Gửi Pull Request",
    body: "Ghi ngắn gọn bạn đã thêm hoặc sửa gì. Mình sẽ đọc, góp ý rồi đưa lên trang.",
  },
];

/** Các dòng trong thẻ lệnh: "#" là chú thích, "$" là lệnh */
const commands = [
  "# Lấy mã nguồn về máy (sau khi fork)",
  "$ git clone https://github.com/<tên-bạn>/itHUS.git",
  "$ cd itHUS",
  "",
  "# Cài thư viện và chạy",
  "$ pnpm install",
  "$ pnpm dev",
  "",
  "# Mở http://localhost:3000 rồi viết bài trong content/",
];

export function ContributeSection() {
  return (
    <section
      id="dong-gop"
      aria-labelledby="dong-gop-title"
      className="bg-primary px-5 py-16 text-base sm:px-6 md:py-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Nội dung */}
        <div>
          <h2
            id="dong-gop-title"
            className="text-2xl font-bold sm:text-3xl"
          >
            Cùng đóng góp cho itHUS
          </h2>
          <p className="mt-4 max-w-xl leading-relaxed text-base/75">
            itHUS là dự án mã nguồn mở. Nếu bạn thấy bài nào sai hoặc còn
            thiếu, hay có ghi chép môn học muốn chia sẻ, hãy gửi lên GitHub để
            mọi người cùng dùng.
          </p>

          <ol className="mt-8 space-y-5">
            {steps.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span
                  aria-hidden
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/40 text-sm font-semibold text-accent"
                >
                  {i + 1}
                </span>
                <div className="pt-1">
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-base/70">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-accent px-6 py-3.5 font-semibold text-primary transition-colors hover:bg-accent/85"
            >
              <FaGithub aria-hidden size={18} /> Xem trên GitHub
            </a>
            <a
              href={`${REPO_URL}#readme`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-base/30 px-6 py-3.5 font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              <LuBookOpen aria-hidden /> Hướng dẫn đóng góp
            </a>
          </div>

          <p className="mt-6 text-sm text-base/60">
            Chưa quen Git? Bạn vẫn có thể{" "}
            <a
              href={`${REPO_URL}/issues/new`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-2 transition-colors hover:text-base"
            >
              mở một issue
            </a>{" "}
            để báo lỗi hoặc gợi ý bài mới.
          </p>
        </div>

        {/* Thẻ kho mã */}
        <div className="min-w-0 overflow-hidden rounded-xl border border-base/10 bg-black/20">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 border-b border-base/10 px-5 py-4 transition-colors hover:bg-base/5"
          >
            <FaGithub aria-hidden size={22} className="shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-mono text-sm">
                <span className="text-base/60">kmbigdragon/</span>
                <span className="font-semibold">itHUS</span>
              </div>
              <div className="truncate text-xs text-base/50">
                Ghi chép các môn Toán – Tin, HUS
              </div>
            </div>
            <LuArrowUpRight
              aria-hidden
              className="shrink-0 text-base/40 transition-colors group-hover:text-accent"
            />
          </a>

          <pre className="overflow-x-auto px-5 py-5 font-mono text-[13px] leading-7">
            <code>
              {commands.map((line, i) => (
                <span key={i} className="block min-h-7">
                  {line.startsWith("#") ? (
                    <span className="text-base/40">{line}</span>
                  ) : line.startsWith("$") ? (
                    <>
                      <span className="select-none text-accent">$ </span>
                      <span className="text-base/90">{line.slice(2)}</span>
                    </>
                  ) : null}
                </span>
              ))}
            </code>
          </pre>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-base/10 px-5 py-3 text-xs text-base/50">
            <span>Next.js · MDX · KaTeX · Tailwind CSS</span>
            <span>Giấy phép MIT</span>
          </div>
        </div>
      </div>
    </section>
  );
}
