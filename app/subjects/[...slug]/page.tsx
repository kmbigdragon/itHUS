import { MDXRemote } from "next-mdx-remote/rsc";
import {
  getContentBySlug,
  buildBreadcrumb,
  getFolderContents,
  getPrevNext,
} from "@/utils/slug";
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
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa6";
import {
  SiTypescript,
  SiRust,
  SiGnometerminal,
  SiCplusplus,
} from "react-icons/si";
import { TbSql } from "react-icons/tb";
import { SimplexTable } from "@/components/mdx/SimplexTable";
import { SimplexSolver } from "@/components/mdx/SimplexSolver";
import { TwoPhaseSimplexSolver } from "@/components/mdx/TwoPhaseSimplexSolver";

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

export function CodeBlock({ children, className, ...props }: any) {
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

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const breadcrumb = buildBreadcrumb(slug);
  const data = getContentBySlug(slug);
  const list = getFolderContents(slug);

  const currentHref = `/subjects/${slug.join("/")}`;
  const { prev, next } = getPrevNext(currentHref);

  return (
    <div className="max-w-[98vw] lg:max-w-4xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-primary/60 mb-4 flex flex-wrap gap-2">
        <Link href="/subjects" className="hover:text-accent shrink-0">
          Môn học
        </Link>

        {breadcrumb.map((item, i) => (
          <span key={i} className="flex gap-2 min-w-0">
            <span className="shrink-0">/</span>
            <Link
              href={item.href}
              className="hover:text-accent truncate max-w-28"
            >
              {item.name}
            </Link>
          </span>
        ))}
      </nav>

      {/* ================= FILE ================= */}
      {data && data.type === "mdx" && (
        <>
          <h1 className="text-3xl font-bold mb-6 wrap-break-word">
            {data.title}
          </h1>

          <article className="[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_p]:mb-4 [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden [&_.katex]:max-w-full max-w-none wrap-break-word">
            {" "}
            <MDXRemote
              source={data.content}
              components={{
                code: CodeBlock,
                SimplexTable,
                SimplexSolver,
                TwoPhaseSimplexSolver,
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
          <h1 className="text-3xl font-bold mb-6">{data.title}</h1>
          <div className="w-full rounded-xl overflow-hidden border border-primary/10">
            <iframe
              src={data.url}
              className="w-full"
              style={{ height: "80vh" }}
              title={data.title}
            />
          </div>
        </>
      )}

      {/* ================= FOLDER ================= */}
      {!data && list && list.length > 0 && (
        <>
          <h1 className="text-2xl font-bold mb-6">{breadcrumb.at(-1)?.name}</h1>

          <div className="grid md:grid-cols-2 gap-3">
            {list.map((item) => (
              <Link
                key={item.slug}
                href={`/subjects/${[...slug, item.slug].join("/")}`}
                className="p-4 rounded-lg bg-secondary/20 hover:bg-accent/20 transition truncate"
              >
                {item.isFolder ? "📂" : "📝"} {item.title}
              </Link>
            ))}
          </div>
        </>
      )}

      {/* ================= EMPTY ================= */}
      {!data && (!list || list.length === 0) && (
        <>
          <h1 className="text-2xl font-bold mb-6">{breadcrumb.at(-1)?.name}</h1>

          <div className="text-center py-20 text-primary/50">
            Không tìm thấy nội dung
          </div>
        </>
      )}

      <div className="flex justify-between gap-4 mt-12 pt-6 border-t border-primary/10">
        {prev ? (
          <Link
            href={prev.href}
            className="group flex items-center gap-3 px-4 py-3 rounded-lg border border-primary/10 hover:border-accent/40 hover:bg-accent/5 transition max-w-[45%]"
          >
            <FaChevronLeft className="shrink-0 text-primary/40 group-hover:text-accent transition" />
            <div className="min-w-0">
              <div className="text-xs text-primary/40 mb-0.5">Bài trước</div>
              <div className="text-sm font-medium text-primary/70 group-hover:text-accent transition truncate">
                {prev.title}
              </div>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={next.href}
            className="group flex items-center gap-3 px-4 py-3 rounded-lg border border-primary/10 hover:border-accent/40 hover:bg-accent/5 transition max-w-[45%] ml-auto text-right"
          >
            <div className="min-w-0">
              <div className="text-xs text-primary/40 mb-0.5">
                Bài tiếp theo
              </div>
              <div className="text-sm font-medium text-primary/70 group-hover:text-accent transition truncate">
                {next.title}
              </div>
            </div>
            <FaChevronRight className="shrink-0 text-primary/40 group-hover:text-accent transition" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
