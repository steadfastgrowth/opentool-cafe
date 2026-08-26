import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { padTicket, tagList, getSessionUser } from "@/lib/auth";
import { Stage } from "@/components/stage";

const PREVIEW = 6;

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

    const [followedPosts, extraPosts, tools] = await Promise.all([
      prisma.post.findMany({
        where: authorFilter,
        orderBy: { createdAt: "desc" },
        include: { author: true },
        take: PREVIEW,
      }),
      prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        include: { author: true },
        take: PREVIEW,
      }),
      prisma.listing.findMany({ orderBy: { number: "asc" }, take: PREVIEW }),
    ]);

    const seen = new Set<string>();
    const posts = [];
    for (const p of [...followedPosts, ...extraPosts]) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      posts.push(p);
    }

    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 boot">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="stage">
            <div className="receipt">
              <span className="dots flex gap-1" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              The board
            </div>
            <div className="p-4 sm:p-8">
              <div className="flex items-end justify-between gap-3 mb-6">
                <h1 className="display text-4xl">The board</h1>
                <Link href="/board/new" className="btn sm:w-auto no-underline">
                  Post
                </Link>
              </div>
              {posts.length === 0 ? (
                <p className="text-dim">Quiet. Pin something.</p>
              ) : (
                <div className="grid gap-3">
                  {posts.slice(0, PREVIEW).map((p) => (
                    <Link key={p.id} href={`/board/${p.id}`} className="ticket p-4 block no-underline">
                      <div className="font-mono text-[11px] text-dim">{p.kind}</div>
                      <div className="display text-xl font-semibold">{p.title}</div>
                      <p className="text-sm mt-1 text-dim line-clamp-2">{p.body}</p>
                      <p className="font-mono text-[11px] text-mark mt-2">@{p.author.slug}</p>
                    </Link>
                  ))}
                </div>
              )}
              <Link href="/board" className="btn mt-6 no-underline sm:w-auto">
                Full board
              </Link>
            </div>
          </div>

          <div className="stage">
            <div className="receipt">
              <span className="dots flex gap-1" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              The menu
            </div>
            <div className="p-4 sm:p-8">
              <div className="flex items-end justify-between gap-3 mb-6">
                <h1 className="display text-4xl">The menu</h1>
                <Link href="/list" className="btn btn-ghost sm:w-auto no-underline">
                  List a tool
                </Link>
              </div>
              {tools.length === 0 ? (
                <p className="text-dim">Kitchen’s empty.</p>
              ) : (
                <div className="grid gap-3">
                  {tools.map((item) => (
                    <Link key={item.id} href={`/l/${item.slug}`} className="ticket p-4 block no-underline">
                      <div className="font-mono text-[11px] text-dim">#{padTicket(item.number)}</div>
                      <div className="display text-xl font-semibold">{item.name}</div>
                      <p className="text-sm mt-1 text-dim line-clamp-2">{item.oneLiner}</p>
                      <p className="font-mono text-[11px] text-mark mt-2">{tagList(item.tags).join(" · ")}</p>
                    </Link>
                  ))}
                </div>
              )}
              <Link href="/find" className="btn mt-6 no-underline sm:w-auto">
                Full menu
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const board = await prisma.listing.findMany({
    orderBy: { number: "asc" },
    take: PREVIEW,
  });
  return (
    <Stage label="Front of house">
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
      <section className="mb-14">
        <p className="font-mono text-[11px] tracking-widest uppercase text-dim mb-3">Step 01 · take a seat</p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md">
          <Link href="/join" className="btn no-underline sm:w-auto">
            Join
          </Link>
          <Link href="/login" className="btn btn-ghost no-underline sm:w-auto">
            Login
          </Link>
        </div>
      </section>
      <div className="flex items-end justify-between mb-4">
        <h2 className="display text-2xl">The menu</h2>
        <Link href="/find" className="btn sm:w-auto no-underline">
          Join for full menu
        </Link>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {board.map((item) => (
          <Link key={item.id} href={`/l/${item.slug}`} className="ticket p-4 block no-underline">
            <div className="font-mono text-[11px] text-dim">#{padTicket(item.number)}</div>
            <div className="display text-xl font-semibold">{item.name}</div>
            <p className="text-sm mt-1 text-dim line-clamp-2">{item.oneLiner}</p>
            <p className="font-mono text-[11px] text-mark mt-2">{tagList(item.tags).join(" · ")}</p>
          </Link>
        ))}
      </div>
    </Stage>
  );
}
