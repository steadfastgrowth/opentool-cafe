import { headers } from "next/headers";

export async function clientIp() {
  const h = await headers();
  const cf = h.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}

export function cookieSecure() {
  const url = process.env.APP_URL || "";
  return url.startsWith("https://");
}
