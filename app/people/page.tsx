import { Link } from "@/components/link";
import { getPrisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { Avatar } from "@/components/avatar";
import { Stage } from "@/components/stage";
import { FollowButton } from "@/components/follow-button";

export default async function PeoplePage() {
  const prisma = await getPrisma();
  const me = await getSessionUser();
  const people = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { listings: true, takes: true, posts: true, followers: true } } },
  });
  const followingIds = new Set(
    me
      ? (
          await prisma.follow.findMany({
            where: { followerId: me.id },
            select: { followingId: true },
          })
        ).map((f) => f.followingId)
      : [],
  );
  return (
    <Stage label="People">
      <h1 className="display text-4xl mb-6">People</h1>
      {people.length === 0 && <p className="text-dim">Empty room.</p>}
      <div className="people-grid">
        {people.map((p) => (
          <div key={p.id} className="person-row ticket p-4">
            <Link className="person-avatar no-underline" href={`/u/${p.slug}`}>
              <Avatar name={p.name || p.slug} src={p.avatarUrl} size={56} />
            </Link>
            <div className="person-meta">
              <Link className="display text-xl font-semibold no-underline" href={`/u/${p.slug}`}>
                {p.name || p.slug}
              </Link>
              <p className="font-mono text-[11px] text-mark">@{p.slug}</p>
              {p.bio && <p className="text-sm mt-1 text-dim line-clamp-2">{p.bio}</p>}
              <p className="font-mono text-[11px] text-dim mt-2">
                {p._count.followers} followers · {p._count.posts} posts
              </p>
            </div>
            {me && me.id !== p.id ? <FollowButton slug={p.slug} following={followingIds.has(p.id)} /> : null}
          </div>
        ))}
      </div>
    </Stage>
  );
}
