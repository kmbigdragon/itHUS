import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { getContentBySlug, buildBreadcrumb, getPrevNext } from "@/utils/slug";
import Link from "next/link";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import {
  FaJs,
  FaPython,
  FaJava,
  FaHtml5,
  FaCss3,
  FaGolang,
} from "react-icons/fa6";
import {
  SiTypescript,
  SiRust,
  SiGnometerminal,
  SiCplusplus,
} from "react-icons/si";
import { TbSql } from "react-icons/tb";
import {
  LuArrowLeft,
  LuArrowRight,
  LuChevronRight,
  LuDownload,
  LuExternalLink,
  LuFileDown,
  LuFileText,
  LuFolder,
} from "react-icons/lu";
import { SimplexTable } from "@/components/mdx/SimplexTable";
import { SimplexSolver } from "@/components/mdx/SimplexSolver";
import { TwoPhaseSimplexSolver } from "@/components/mdx/TwoPhaseSimplexSolver";
import { Formula } from "@/components/mdx/Formula";
import { CompletedBadge } from "@/components/CompletedBadge";
import {
  buildTree,
  findNode,
  findFirstFile,
  type TreeNode,
} from "@/utils/tree";
import {
  describeCount,
  getSubjectCode,
  getSubjectTitle,
  isCompletedSubject,
} from "@/utils/subjects";

export { generateStaticParams } from "@/utils/slug";

type PageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

const langIcons: Record<string, React.ReactNode> = {
  c: <SiCplusplus className="text-blue-500" />,
  cpp: <SiCplusplus className="text-blue-500" />,
  js: <FaJs className="text-yellow-400" />,
  javascript: <FaJs className="text-yellow-400" />,
  ts: <SiTypescript className="text-blue-400" />,
  typescript: <SiTypescript className="text-blue-400" />,
  python: <FaPython className="text-blue-300" />,
  go: <FaGolang className="text-blue-400" />,
  java: <FaJava className="text-red-400" />,
  html: <FaHtml5 className="text-orange-400" />,
  css: <FaCss3 className="text-blue-500" />,
  rust: <SiRust className="text-orange-600" />,
  bash: <SiGnometerminal className="text-gray-400" />,
  sh: <SiGnometerminal className="text-gray-400" />,
  sql: <TbSql className="text-blue-400" />,
};

const langNames: Record<string, string> = {
  c: "C",
  cpp: "C++",
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  python: "Python",
  go: "Golang",
  java: "Java",
  html: "HTML",
  css: "CSS",
  rust: "Rust",
  bash: "Bash",
  sh: "Shell",
  sql: "SQL",
};

export function CodeBlock({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"code">) {
  const lang = className?.replace("language-", "");

  if (!lang) {
    return (
      <code className="font-mono bg-secondary/30 px-1 rounded" {...props}>
        {children}
      </code>
    );
  }

  const icon = langIcons[lang];
  const name = langNames[lang];

  return (
    <div className="relative rounded-lg bg-secondary/20 mb-4">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-base/30 text-sm text-base/70 bg-primary rounded-t-lg">
        {icon && <span className="text-base">{icon}</span>}
        <span>{name}</span>
      </div>
      <pre className="overflow-x-auto p-4">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}

/* =========================
   BREADCRUMB
   Không lặp lại trang hiện tại vì tiêu đề đã nằm ngay bên dưới
========================= */
function Breadcrumb({ items }: { items: { name: string; href: string }[] }) {
  return (
    <nav aria-label="Đường dẫn" className="mb-4 text-sm text-primary/60">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <li>
          <Link
            href="/subjects"
            className="transition-colors hover:text-secondary"
          >
            Môn học
          </Link>
        </li>
        {items.map((item, i) => {
          // cấp môn học chỉ hiện mã môn cho gọn
          const label =
            i === 0 ? (getSubjectCode(item.name) ?? item.name) : item.name;
          return (
            <li key={item.href} className="flex min-w-0 items-center gap-1.5">
              <LuChevronRight
                aria-hidden
                className="shrink-0 text-primary/30"
              />
              <Link
                href={item.href}
                title={item.name}
                className="max-w-[16rem] truncate transition-colors hover:text-secondary"
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* =========================
   DANH SÁCH NỘI DUNG THƯ MỤC
========================= */
function ItemRow({ node }: { node: TreeNode }) {
  const Icon =
    node.kind === "folder"
      ? LuFolder
      : node.kind === "pdf"
        ? LuFileDown
        : LuFileText;

  return (
    <li>
      <Link
        href={`/subjects/${node.path}`}
        className="flex items-start gap-3 rounded-lg px-3 py-2 text-sm text-primary/85 transition-colors hover:bg-accent/15 hover:text-primary"
      >
        <Icon aria-hidden className="mt-0.5 shrink-0 text-primary/40" />
        <span className="min-w-0 flex-1">{node.name}</span>
        {node.kind === "folder" && (
          <span className="shrink-0 text-xs text-primary/45">
            {describeCount(node.lessons, node.pdfs)}
          </span>
        )}
      </Link>
    </li>
  );
}

function FolderContents({ nodes }: { nodes: TreeNode[] }) {
  // Gom các file liền nhau thành một khối, mỗi thư mục con là một khối riêng
  const blocks: (
    { type: "files"; items: TreeNode[] } | { type: "folder"; node: TreeNode }
  )[] = [];
  for (const node of nodes) {
    const last = blocks.at(-1);
    if (node.isFile) {
      if (last?.type === "files") last.items.push(node);
      else blocks.push({ type: "files", items: [node] });
    } else {
      blocks.push({ type: "folder", node });
    }
  }

  return (
    <div className="space-y-4">
      {blocks.map((block) =>
        block.type === "files" ? (
          <ul
            key={block.items[0].path}
            className="rounded-xl border border-primary/10 bg-white p-2"
          >
            {block.items.map((n) => (
              <ItemRow key={n.path} node={n} />
            ))}
          </ul>
        ) : (
          <section
            key={block.node.path}
            className="overflow-hidden rounded-xl border border-primary/10 bg-white"
          >
            <Link
              href={`/subjects/${block.node.path}`}
              className="flex items-baseline justify-between gap-4 border-b border-primary/10 px-5 py-3 transition-colors hover:bg-accent/10"
            >
              <h2 className="font-semibold text-primary">{block.node.name}</h2>
              <span className="shrink-0 text-xs text-primary/50">
                {describeCount(block.node.lessons, block.node.pdfs)}
              </span>
            </Link>
            {block.node.children && block.node.children.length > 0 ? (
              <ul className="p-2">
                {block.node.children.map((n) => (
                  <ItemRow key={n.path} node={n} />
                ))}
              </ul>
            ) : (
              <p className="px-5 py-3 text-sm text-primary/50">Chưa có bài.</p>
            )}
          </section>
        ),
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-primary/20 px-6 py-14 text-center">
      <p className="font-medium text-primary/70">Mục này chưa có nội dung.</p>
      <Link
        href="/subjects"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:underline"
      >
        <LuArrowLeft aria-hidden /> Xem các môn đã có bài
      </Link>
    </div>
  );
}

/* =========================
   PAGE
========================= */
export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const data = getContentBySlug(slug);
  const node = findNode(buildTree(), slug);
  if (!data && !node) notFound();

  const breadcrumb = buildBreadcrumb(slug);
  const currentHref = `/subjects/${slug.join("/")}`;
  const { prev, next } = getPrevNext(currentHref);

  const isSubjectRoot = slug.length === 1 && node && !node.isFile;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {!isSubjectRoot && <Breadcrumb items={breadcrumb.slice(0, -1)} />}

      {/* ================= FILE ================= */}
      {data && data.type === "mdx" && (
        <>
          <h1 className="text-3xl font-bold text-primary mb-6 wrap-break-word">
            {data.title}
          </h1>

          <article className="leading-7 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 [&_p]:mb-4 [&_a]:text-secondary [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-primary [&_hr]:my-8 [&_hr]:border-primary/10 [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden [&_.katex]:max-w-full max-w-none wrap-break-word">
            <MDXRemote
              source={data.content}
              components={{
                code: CodeBlock,
                SimplexTable,
                SimplexSolver,
                TwoPhaseSimplexSolver,
                Formula,
              }}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm, remarkMath],
                  rehypePlugins: [rehypeKatex],
                },
              }}
            />
          </article>
        </>
      )}

      {data && data.type === "pdf" && (
        <>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="text-3xl font-bold text-primary wrap-break-word">
              {data.title}
            </h1>
            <div className="flex shrink-0 gap-2">
              <a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-primary/15 px-3 py-2 text-sm font-medium text-primary transition-colors hover:border-accent hover:bg-accent/10"
              >
                <LuExternalLink aria-hidden /> Mở tab mới
              </a>
              <a
                href={data.url}
                download={`${data.title}.pdf`}
                className="inline-flex items-center gap-2 rounded-lg border border-primary/15 px-3 py-2 text-sm font-medium text-primary transition-colors hover:border-accent hover:bg-accent/10"
              >
                <LuDownload aria-hidden /> Tải xuống
              </a>
            </div>
          </div>
          <div className="w-full overflow-hidden rounded-xl border border-primary/10">
            <iframe
              src={data.url}
              className="h-[80vh] w-full"
              title={data.title}
            />
          </div>
          <p className="mt-3 text-sm text-primary/50 sm:hidden">
            Nếu file không hiện trên điện thoại, hãy bấm “Mở tab mới”.
          </p>
        </>
      )}

      {/* ================= FOLDER ================= */}
      {!data && node && !node.isFile && (
        <>
          {isSubjectRoot ? (
            <header className="mb-8">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <span className="font-mono text-sm font-semibold text-secondary">
                  {getSubjectCode(node.name)}
                </span>
                {isCompletedSubject(node.name) && (
                  <CompletedBadge variant="label" />
                )}
              </div>
              <h1 className="text-3xl font-bold text-primary wrap-break-word">
                {getSubjectTitle(node.name)}
              </h1>
              <p className="mt-2 text-sm text-primary/60">
                {describeCount(node.lessons, node.pdfs)}
              </p>
              {(() => {
                const first = findFirstFile(node);
                return (
                  first && (
                    <Link
                      href={`/subjects/${first.path}`}
                      className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-accent/80"
                    >
                      Bắt đầu đọc <LuArrowRight aria-hidden />
                    </Link>
                  )
                );
              })()}
            </header>
          ) : (
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-primary wrap-break-word">
                {node.name}
              </h1>
              <p className="mt-1 text-sm text-primary/60">
                {describeCount(node.lessons, node.pdfs)}
              </p>
            </header>
          )}

          {node.children && node.children.length > 0 ? (
            <FolderContents nodes={node.children} />
          ) : (
            <EmptyState />
          )}
        </>
      )}

      {/* ================= BÀI TRƯỚC / BÀI SAU ================= */}
      {(prev || next) && (
        <nav
          aria-label="Chuyển bài"
          className="mt-12 grid gap-3 border-t border-primary/10 pt-6 sm:grid-cols-2"
        >
          {prev && (
            <Link
              href={prev.href}
              className="group flex items-center gap-3 rounded-lg border border-primary/10 px-4 py-3 transition-colors hover:border-accent hover:bg-accent/10"
            >
              <LuArrowLeft
                aria-hidden
                className="shrink-0 text-primary/40 transition-colors group-hover:text-secondary"
              />
              <div className="min-w-0">
                <div className="mb-0.5 text-xs text-primary/50">Bài trước</div>
                <div className="truncate text-sm font-medium text-primary/80 group-hover:text-primary">
                  {prev.title}
                </div>
              </div>
            </Link>
          )}

          {next && (
            <Link
              href={next.href}
              className="group flex items-center justify-end gap-3 rounded-lg border border-primary/10 px-4 py-3 text-right transition-colors hover:border-accent hover:bg-accent/10 sm:col-start-2"
            >
              <div className="min-w-0">
                <div className="mb-0.5 text-xs text-primary/50">
                  Bài tiếp theo
                </div>
                <div className="truncate text-sm font-medium text-primary/80 group-hover:text-primary">
                  {next.title}
                </div>
              </div>
              <LuArrowRight
                aria-hidden
                className="shrink-0 text-primary/40 transition-colors group-hover:text-secondary"
              />
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
