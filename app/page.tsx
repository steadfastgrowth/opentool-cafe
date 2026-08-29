import { Link } from "@/components/link";
import { getPrisma } from "@/lib/db";
import { padTicket, tagList, getSessionUser } from "@/lib/auth";
import { Stage } from "@/components/stage";
import { FeedList, postToFeed } from "@/components/feed";
import { postCardSelect } from "@/lib/person";
import { menuSort } from "@/lib/menu";

type MenuItem = {
  id: string;
  slug: string;
  number: number;
  name: string;
  oneLiner: string;
  claimed: boolean;
  tags: string;
};

const PREVIEW = 6;

export default async function Home() {
  const prisma = await getPrisma();
  const me = await getSessionUser();

  if (me) {
    const follows = await prisma.follow.findMany({
      where: { followerId: me.id },
      select: { followingId: true },
    });
    const ids = follows.map((f: { followingId: string }) => f.followingId);

    const [followedPosts, latestPosts, tools] = await Promise.all([
      ids.length
        ? prisma.post.findMany({
            where: { authorId: { in: ids } },
            orderBy: { createdAt: "desc" },
            select: postCardSelect,
            take: PREVIEW,
          })
        : Promise.resolve([]),
      prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        select: postCardSelect,
        take: PREVIEW,
      }),
      prisma.listing.findMany({ take: 80 }),
    ]);
    const fromFollows = ids.length > 0;
    const posts = fromFollows ? followedPosts : latestPosts;
    const menu = menuSort(tools as MenuItem[]).slice(0, PREVIEW);

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
              <p className="font-mono text-[11px] text-dim uppercase tracking-widest mb-4">
                {fromFollows ? "From people you follow" : "Latest on the board"}
              </p>
              {posts.length === 0 ? (
                fromFollows ? (
                  <p className="text-dim">
                    Quiet from your table. <Link href="/people">Find people</Link> or{" "}
                    <Link href="/board">see the latest</Link>.
                  </p>
                ) : (
                  <p className="text-dim">
                    Quiet. Pin something, or <Link href="/people">follow someone</Link>.
                  </p>
                )
              ) : (
                <FeedList items={posts.map(postToFeed)} />
              )}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Link href="/board" className="btn no-underline sm:w-auto">
                  Full board
                </Link>
                {fromFollows ? (
                  <Link href="/board?feed=following" className="btn btn-ghost no-underline sm:w-auto">
                    Following
                  </Link>
                ) : (
                  <Link href="/people" className="btn btn-ghost no-underline sm:w-auto">
                    People
                  </Link>
                )}
              </div>
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
                  {menu.map((item) => (
                    <Link key={item.id} href={`/l/${item.slug}`} className="ticket p-4 block no-underline">
                      <div className="font-mono text-[11px] text-dim">#{padTicket(item.number)}</div>
                      <div className="display text-xl font-semibold">{item.name}</div>
                      <p className="text-sm mt-1 text-dim line-clamp-2">{item.oneLiner}</p>
                      <p className="font-mono text-[11px] text-mark mt-2">
                        {item.claimed ? "claimed" : "unclaimed"}
                        {item.tags ? ` · ${tagList(item.tags).join(" · ")}` : ""}
                      </p>
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

  const board = menuSort((await prisma.listing.findMany()) as MenuItem[]).slice(0, PREVIEW);
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
          Full menu
        </Link>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {board.map((item) => (
          <Link key={item.id} href={`/l/${item.slug}`} className="ticket p-4 block no-underline">
            <div className="font-mono text-[11px] text-dim">#{padTicket(item.number)}</div>
            <div className="display text-xl font-semibold">{item.name}</div>
            <p className="text-sm mt-1 text-dim line-clamp-2">{item.oneLiner}</p>
            <p className="font-mono text-[11px] text-mark mt-2">
              {item.claimed ? "claimed" : "unclaimed"}
              {item.tags ? ` · ${tagList(item.tags).join(" · ")}` : ""}
            </p>
          </Link>
        ))}
      </div>
    </Stage>
  );
}
