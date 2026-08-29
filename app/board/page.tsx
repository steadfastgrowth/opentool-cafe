import { Link } from "@/components/link";
import { getPrisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { Stage } from "@/components/stage";
import { FeedList, postToFeed } from "@/components/feed";
import { postCardSelect } from "@/lib/person";

const KINDS = [
  { id: "all", label: "all" },
  { id: "help", label: "need help" },
  { id: "collab", label: "collab" },
  { id: "service", label: "services" },
  { id: "bulletin", label: "bulletin" },
];

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; feed?: string }>;
}) {
  const prisma = await getPrisma();
  const { kind, feed } = await searchParams;
  const me = await getSessionUser();
  const followingFeed = Boolean(me && feed === "following");

  let authorFilter: { authorId: { in: string[] } } | undefined;
  if (followingFeed && me) {
    const follows = await prisma.follow.findMany({
      where: { followerId: me.id },
      select: { followingId: true },
    });
    const ids = follows.map((f: { followingId: string }) => f.followingId);
    authorFilter = ids.length ? { authorId: { in: ids } } : { authorId: { in: [] } };
  }

  const posts =
    followingFeed && authorFilter?.authorId.in.length === 0
      ? []
      : await prisma.post.findMany({
          where: {
            ...(kind && kind !== "all" ? { kind } : {}),
            ...(authorFilter || {}),
          },
          orderBy: { createdAt: "desc" },
          select: postCardSelect,
          take: 80,
        });

  return (
    <Stage label="The board">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <h1 className="display text-4xl">The board</h1>
        {me ? (
          <Link href="/board/new" className="btn sm:w-auto no-underline">
            Post
          </Link>
        ) : (
          <Link href="/join" className="btn sm:w-auto no-underline">
            Join to post
          </Link>
        )}
      </div>
      {me ? (
        <div className="flex flex-wrap gap-2 mb-4">
          <Link href={kind && kind !== "all" ? `/board?kind=${kind}` : "/board"} className="font-mono text-[11px] border border-line px-2 py-1">
            latest
          </Link>
          <Link
            href={kind && kind !== "all" ? `/board?feed=following&kind=${kind}` : "/board?feed=following"}
            className="font-mono text-[11px] border border-line px-2 py-1"
          >
            following
          </Link>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2 mb-8">
        {KINDS.map((k) => {
          const params = new URLSearchParams();
          if (followingFeed) params.set("feed", "following");
          if (k.id !== "all") params.set("kind", k.id);
          const qs = params.toString();
          return (
            <Link
              key={k.id}
              href={qs ? `/board?${qs}` : "/board"}
              className="font-mono text-[11px] border border-line px-2 py-1"
            >
              {k.label}
            </Link>
          );
        })}
      </div>
      {posts.length === 0 && followingFeed ? (
        <p className="text-dim">
          Follow someone, then their pins land here. <Link href="/people">People</Link>
        </p>
      ) : posts.length === 0 ? (
        <p className="text-dim">Empty board. First pin wins.</p>
      ) : (
        <FeedList items={posts.map(postToFeed)} />
      )}
    </Stage>
  );
}
