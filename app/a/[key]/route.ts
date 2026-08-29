import { getAvatars } from "@/lib/r2";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(_req: Request, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params;
  const m = /^[a-z0-9_-]{8,64}\.(jpg|png|webp)$/i.exec(key);
  if (!m) return new Response("Not found", { status: 404 });
  const bucket = await getAvatars();
  if (!bucket) return new Response("Not found", { status: 404 });
  const obj = await bucket.get(key);
  if (!obj) return new Response("Not found", { status: 404 });
  const ext = m[1].toLowerCase();
  return new Response(obj.body, {
    headers: {
      "content-type": TYPES[ext] || "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
