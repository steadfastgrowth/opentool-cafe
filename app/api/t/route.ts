import { NextRequest, NextResponse } from "next/server";
import { track } from "@/lib/track";

const ALLOWED = new Set([
  "page_view",
  "join_github",
  "join_password",
  "join_code",
  "take",
  "outbound",
  "search",
  "meet",
]);

export async function POST(req: NextRequest) {
  let name = "page_view";
  let path: string | null = null;
  try {
    const body = (await req.json()) as { name?: string; path?: string };
    if (body.name && ALLOWED.has(body.name)) name = body.name;
    if (typeof body.path === "string") path = body.path;
  } catch {
    path = req.nextUrl.pathname;
  }
  await track(name, { path });
  return new NextResponse(null, { status: 204 });
}
