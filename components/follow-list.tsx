import { notFound } from "next/navigation";
import { Link } from "@/components/link";
import { getPrisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { PersonRow } from "@/components/person-row";
import { Stage } from "@/components/stage";
import { publicPersonSelect, type PublicPerson } from "@/lib/person";

export async function FollowList({
  slug,
  direction,
}: {
  slug: string;
  direction: "followers" | "following";
}) {
  const prisma = await getPrisma();
  const person = await prisma.user.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true },
  });
  if (!person) notFound();
  const me = await getSessionUser();

  const people =
    direction === "followers"
      ? (
          await prisma.follow.findMany({
            where: { followingId: person.id },
            orderBy: { createdAt: "desc" },
            include: { follower: { select: publicPersonSelect } },
          })
        ).map((r: { follower: PublicPerson }) => r.follower)
      : (
          await prisma.follow.findMany({
            where: { followerId: person.id },
            orderBy: { createdAt: "desc" },
            include: { following: { select: publicPersonSelect } },
          })
        ).map((r: { following: PublicPerson }) => r.following);
  const myFollows = new Set<string>();
  if (me && people.length) {
    const follows = await prisma.follow.findMany({
      where: { followerId: me.id, followingId: { in: people.map((p: PublicPerson) => p.id) } },
      select: { followingId: true },
    });
    for (const f of follows) myFollows.add(f.followingId);
  }

  const title = direction === "followers" ? "Followers" : "Following";
  const empty =
    direction === "followers" ? "Nobody at this table yet." : "Not following anyone.";

  return (
    <Stage label={title} wide={false}>
      <p className="font-mono text-[11px] text-dim mb-2">
        <Link href={`/u/${person.slug}`}>← @{person.slug}</Link>
      </p>
      <h1 className="display text-4xl mb-2">{title}</h1>
      <p className="text-dim mb-6">
        {person.name || person.slug} · {people.length}
      </p>
      {people.length === 0 ? (
        <p className="text-dim">{empty}</p>
      ) : (
        <div className="grid gap-3">
          {people.map((p: PublicPerson) => (
            <PersonRow
              key={p.id}
              person={p}
              following={myFollows.has(p.id)}
              meId={me?.id ?? null}
            />
          ))}
        </div>
      )}
    </Stage>
  );
}
