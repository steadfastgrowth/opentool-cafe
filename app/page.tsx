import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { padTicket, tagList, getSessionUser } from "@/lib/auth";
import { JoinForm } from "@/components/join-form";
import { FeedList, type FeedRow } from "@/components/feed";

export default async function Home() {
  const prisma = await getPrisma();
  const me = await getSessionUser();

  if (me) {
    const follows = await prisma.follow.findMany({
      where: { followerId: me.id },
      select: { followingId: true },
    });
    const ids = follows.map((f) => f.followingId);
    const authorFilter = ids.length ? { authorId: { in: ids } } : undefined;
    const ownerFilter = ids.length ? { ownerId: { in: ids } } : undefined;

    const [followedPosts, extraPosts, followedTools, extraTools] = await Promise.all([
      prisma.post.findMany({
        where: authorFilter,
        orderBy: { createdAt: "desc" },
        include: { author: true },
        take: 24,
      }),
      prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        include: { author: true },
        take: 16,
      }),
      prisma.listing.findMany({
        where: ownerFilter,
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
      prisma.listing.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
    ]);

    const seen = new Set<string>();
    const items: FeedRow[] = [];
    for (const p of [...followedPosts, ...extraPosts]) {
      const key = `post-${p.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({
        type: "post",
        at: p.createdAt,
        id: p.id,
        title: p.title,
        body: p.body,
        kind: p.kind,
        href: `/board/${p.id}`,
        authorName: p.author.name || p.author.slug,
        authorSlug: p.author.slug,
        authorAvatar: p.author.avatarUrl,
      });
    }
    for (const l of [...followedTools, ...extraTools]) {
      const key = `tool-${l.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({
        type: "tool",
        at: l.createdAt,
        id: l.id,
        title: l.name,
        body: l.oneLiner,
        href: `/l/${l.slug}`,
        number: l.number,
      });
    }
    items.sort((a, b) => b.at.getTime() - a.at.getTime());

    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-5 py-8 boot">
        <div className="flex items-end justify-between gap-3 mb-6">
          <div>
            <p className="display text-sm tracking-[0.2em] uppercase text-mark mb-2">Now serving</p>
            <h1 className="display text-4xl">Your tab</h1>
            <p className="text-dim mt-2">
              {ids.length
                ? "People you follow, then the rest of the cafe. Chronological. No ranking."
                : "Follow people to pin their posts up top. Until then, the whole cafe."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <Link href="/board/new" className="btn sm:w-auto no-underline">
              Post
            </Link>
            <Link href="/tip" className="btn btn-ghost sm:w-auto no-underline tip-nav">
              Tip
            </Link>
          </div>
        </div>
        <FeedList items={items.slice(0, 40)} />
      </main>
    );
  }

  const board = await prisma.listing.findMany({
    orderBy: { number: "asc" },
    take: 8,
  });
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 boot">
      <div className="stage">
        <div className="receipt">
          <span className="dots flex gap-1" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          Front of house
        </div>
        <div className="p-4 sm:p-10">
          <p className="display text-[12px] tracking-[0.22em] text-mark mb-4">OPEN TOOL CAFE</p>
          <h1 className="display text-[2.15rem] sm:text-6xl font-semibold tracking-tight leading-[1.02] sm:leading-[0.95] mb-5">
            Welcome to open tool cafe,
            <br className="hidden sm:block" />
            can I take your order?
            <span className="caret" aria-hidden />
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-dim mb-10">
            Share and download open source tools, connect with other founders and builders, enjoy some java.
          </p>
          <section className="max-w-md mb-14">
            <p className="font-mono text-[11px] tracking-widest uppercase text-dim mb-3">Step 01 · sign up</p>
            <JoinForm />
          </section>
          <div className="flex items-end justify-between mb-4">
            <h2 className="display text-2xl">The menu</h2>
            <Link href="/search" className="nav-link">
              Search →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {board.map((item) => (
              <Link key={item.id} href={`/l/${item.slug}`} className="ticket p-4 block no-underline">
                <div className="font-mono text-[11px] text-dim">#{padTicket(item.number)}</div>
                <div className="display text-xl font-semibold">{item.name}</div>
                <p className="text-sm mt-1 text-dim">{item.oneLiner}</p>
                <p className="font-mono text-[11px] text-mark mt-2">{tagList(item.tags).join(" · ")}</p>
              </Link>
            ))}
          </div>
          <Link href="/tip" className="tip-banner mt-10 block no-underline">
            <span className="font-mono text-[11px] tracking-widest uppercase">Leave a tip</span>
            <span className="display text-2xl block mt-1">The jar is on the counter.</span>
            <span className="text-sm">X or card. Keeps the cafe open.</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
