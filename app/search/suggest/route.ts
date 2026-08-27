import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { padTicket, tagList } from "@/lib/auth";
import { clientIp } from "@/lib/request";
import { rateLimit, WINDOW_1M } from "@/lib/rate-limit";

type Hit = { kind: "person" | "tool" | "topic"; href: string; title: string; sub?: string };

function rank(hay: string, q: string) {
  const h = hay.toLowerCase();
  if (h === q) return 0;
  if (h.startsWith(q)) return 1;
  if (h.includes(q)) return 2;
  return 9;
}

export async function GET(req: NextRequest) {
  const ip = await clientIp();
  const gated = await rateLimit(`suggest:ip:${ip}`, 60, WINDOW_1M);
  if (!gated.ok) return NextResponse.json({ hits: [] }, { status: 429 });

  const q = (req.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
  if (q.length < 2 || q.length > 80) return NextResponse.json({ hits: [] });

  const prisma = await getPrisma();
  const [people, tools, posts] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [{ slug: { contains: q } }, { name: { contains: q } }, { skills: { contains: q } }],
      },
      take: 24,
    }),
    prisma.listing.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { slug: { contains: q } },
          { tags: { contains: q } },
          { oneLiner: { contains: q } },
        ],
      },
      take: 24,
    }),
    prisma.post.findMany({
      where: { OR: [{ title: { contains: q } }, { tags: { contains: q } }] },
      take: 24,
    }),
  ]);

  const personHits: Hit[] = people
    .map((p: { slug: string; name: string | null }) => ({
      kind: "person" as const,
      href: `/u/${p.slug}`,
      title: p.name || p.slug,
      sub: `@${p.slug}`,
      r: Math.min(rank(p.slug, q), rank(p.name || "", q)),
    }))
    .sort((a: { r: number }, b: { r: number }) => a.r - b.r)
    .slice(0, 5)
    .map(({ r, ...h }: Hit & { r: number }) => {
      void r;
      return h;
    });

  const toolHits: Hit[] = tools
    .map((l: { slug: string; name: string; number: number; tags: string }) => ({
      kind: "tool" as const,
      href: `/l/${l.slug}`,
      title: l.name,
      sub: `#${padTicket(l.number)}`,
      r: Math.min(rank(l.name, q), rank(l.slug, q), rank(l.tags, q)),
    }))
    .sort((a: { r: number }, b: { r: number }) => a.r - b.r)
    .slice(0, 5)
    .map(({ r, ...h }: Hit & { r: number }) => {
      void r;
      return h;
    });

  const topics = new Map<string, Hit>();
  for (const l of tools as { tags: string }[]) {
    for (const tag of tagList(l.tags)) {
      if (rank(tag, q) > 2) continue;
      const key = tag.toLowerCase();
      if (!topics.has(key)) {
        topics.set(key, { kind: "topic", href: `/search?q=${encodeURIComponent(tag)}`, title: tag });
      }
    }
  }
  for (const p of posts as { tags: string }[]) {
    for (const tag of tagList(p.tags)) {
      if (rank(tag, q) > 2) continue;
      const key = tag.toLowerCase();
      if (!topics.has(key)) {
        topics.set(key, { kind: "topic", href: `/search?q=${encodeURIComponent(tag)}`, title: tag });
      }
    }
  }

  const hits = [...personHits, ...toolHits, ...[...topics.values()].slice(0, 4)];
  return NextResponse.json({ hits });
}
