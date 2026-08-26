import { beginOAuth } from "@/lib/oauth";
import { NextRequest } from "next/server";

export function GET(req: NextRequest) {
  return beginOAuth("github", req);
}
