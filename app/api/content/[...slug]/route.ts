import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { findFileBySlug } from "@/utils/slug";

const CONTENT_PATH = path.join(process.cwd(), "content");

export const dynamic = "force-static";

export { generateStaticParams } from "@/utils/slug";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const filePath = findFileBySlug(slug, CONTENT_PATH);
  
  if (!filePath || !/\.pdf$/i.test(filePath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const file = fs.readFileSync(filePath);
  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
    },
  });
}