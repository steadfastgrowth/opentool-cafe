import { finishGithub } from "@/lib/oauth";
import { NextRequest } from "next/server";

export function GET(req: NextRequest) {
  return finishGithub(req);
}
