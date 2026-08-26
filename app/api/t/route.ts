import { NextRequest, NextResponse } from "next/server";
import { track } from "@/lib/track";
import { clientIp } from "@/lib/request";
import { rateLimit, WINDOW_1M } from "@/lib/rate-limit";

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
  const ip = await clientIp();
  const gated = await rateLimit(`track:ip:${ip}`, 40, WINDOW_1M);
  if (!gated.ok) return new NextResponse(null, { status: 204 });
  const origin = req.headers.get("origin") || "";
  const app = process.env.APP_URL || "https://opentool.cafe";
  if (origin && !origin.startsWith(app) && !origin.includes("opentool.cafe")) {
    return new NextResponse(null, { status: 204 });
  }
  let name = "page_view";
  let path: string | null = null;
  let ref: string | null = null;
  let visitorId: string | null = null;
  try {
    const body = (await req.json()) as { name?: string; path?: string; ref?: string; visitorId?: string };
    if (body.name && ALLOWED.has(body.name)) name = body.name;
    if (typeof body.path === "string") path = body.path;
    if (typeof body.ref === "string") ref = body.ref;
    if (typeof body.visitorId === "string") visitorId = body.visitorId;
  } catch {
    path = req.nextUrl.pathname;
  }
  await track(name, { path, ref, visitorId });
  return new NextResponse(null, { status: 204 });
}
