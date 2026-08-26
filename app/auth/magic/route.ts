import { NextRequest, NextResponse } from "next/server";
import { consumeMagic } from "@/app/actions";
import { clientIp } from "@/lib/request";
import { rateLimit, WINDOW_15M } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  if (!token) {
    return NextResponse.redirect(new URL("/join?err=link", req.url));
  }
  const ip = await clientIp();
  const gated = await rateLimit(`magiclink:ip:${ip}`, 12, WINDOW_15M);
  if (!gated.ok) {
    return NextResponse.redirect(new URL("/join?err=rate", req.url));
  }
  await consumeMagic(token);
  return NextResponse.redirect(new URL("/you", req.url));
}
