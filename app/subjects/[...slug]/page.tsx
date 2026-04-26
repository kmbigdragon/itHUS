import { MDXRemote } from "next-mdx-remote/rsc";
import {
  getContentBySlug,
  buildBreadcrumb,
  getFolderContents,
} from "@/utils/slug";
import Link from "next/link";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import { FaJs, FaPython, FaJava, FaHtml5, FaCss3 } from "react-icons/fa6";
import { SiTypescript, SiRust, SiGnometerminal } from "react-icons/si";

type PageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

const langIcons: Record<string, React.ReactNode> = {
  js: <FaJs className="text-yellow-400" />,
  javascript: <FaJs className="text-yellow-400" />,
  ts: <SiTypescript className="text-blue-400" />,
  typescript: <SiTypescript className="text-blue-400" />,
  python: <FaPython className="text-blue-300" />,
  java: <FaJava className="text-red-400" />,
  html: <FaHtml5 className="text-orange-400" />,
  css: <FaCss3 className="text-blue-500" />,
  rust: <SiRust className="text-orange-600" />,
  bash: <SiGnometerminal className="text-gray-400" />,
  sh: <SiGnometerminal className="text-gray-400" />,
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

  return (
    <div className="relative rounded-lg bg-secondary/20 mb-4">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-secondary/30 text-sm text-primary/60">
        {icon && <span className="text-base">{icon}</span>}
        <span>{lang}</span>
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
      {data && (
        <>
          <h1 className="text-3xl font-bold mb-6 wrap-break-word">
            {data.title}
          </h1>

          <article className="[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_p]:mb-4 max-w-none wrap-break-word">
            {" "}
            <MDXRemote
              source={data.content}
              components={{
                code: CodeBlock,
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
    </div>
  );
}
