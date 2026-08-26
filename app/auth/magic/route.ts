import { NextRequest, NextResponse } from "next/server";
import { consumeMagic } from "@/app/actions";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  const opt = req.nextUrl.searchParams.get("opt") === "1";
  if (!token) {
    return NextResponse.redirect(new URL("/join?err=link", req.url));
  }
  await consumeMagic(token, opt);
  return NextResponse.redirect(new URL("/you", req.url));
}
