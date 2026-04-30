import { NextRequest, NextResponse } from "next/server";
import { getAllContent } from "@/utils/slug";

export const dynamic = "force-static";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const items = getAllContent();
  const results = q
    ? items.filter(
        (i) =>
          i.title.toLowerCase().includes(q.toLowerCase()) ||
          i.href.toLowerCase().includes(q.toLowerCase())
      )
    : [];
  return NextResponse.json(results);
}