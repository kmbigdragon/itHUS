import { NextResponse } from "next/server";
import { getAllContent } from "@/utils/slug";

// Trả về toàn bộ chỉ mục (vài trăm mục), việc lọc làm ở phía client
// để kết quả hiện ngay khi gõ.
export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(getAllContent());
}
