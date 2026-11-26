import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { findFileBySlug, pdfUrl } from "@/utils/slug";
import { buildTree, type TreeNode } from "@/utils/tree";

const CONTENT_PATH = path.join(process.cwd(), "content");

/*
 * PDF giờ là file tĩnh trong public/pdf/ (xem utils/slug.ts).
 * Route này chỉ còn chuyển hướng các link cũ /api/content/... sang file tĩnh.
 * Mọi chuyển hướng được dựng sẵn lúc build nên không cần chạy function.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  const slugs: { slug: string[] }[] = [];
  (function collect(nodes: TreeNode[]) {
    for (const n of nodes) {
      if (n.kind === "pdf") slugs.push({ slug: n.path.split("/") });
      if (n.children) collect(n.children);
    }
  })(buildTree());
  return slugs;
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const filePath = findFileBySlug(slug, CONTENT_PATH);

  if (!filePath || !/\.pdf$/i.test(filePath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(null, {
    status: 308,
    headers: { Location: pdfUrl(filePath) },
  });
}
