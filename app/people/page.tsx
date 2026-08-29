import { getPrisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { PersonRow } from "@/components/person-row";
import { Stage } from "@/components/stage";
import { publicPersonSelect, type PublicPerson } from "@/lib/person";

export default async function PeoplePage() {
  const prisma = await getPrisma();
  const me = await getSessionUser();
  const people = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: publicPersonSelect,
    take: 120,
  });
  const myFollows = new Set<string>();
  if (me && people.length) {
    const follows = await prisma.follow.findMany({
      where: { followerId: me.id, followingId: { in: people.map((p: PublicPerson) => p.id) } },
      select: { followingId: true },
    });
    for (const f of follows) myFollows.add(f.followingId);
  }
  return (
    <Stage label="People">
      <h1 className="display text-4xl mb-6">People</h1>
      {people.length === 0 && <p className="text-dim">Empty room.</p>}
      <div className="grid md:grid-cols-2 gap-3">
        {people.map((p: PublicPerson) => (
          <PersonRow key={p.id} person={p} following={myFollows.has(p.id)} meId={me?.id ?? null} />
        ))}
      </div>
    </Stage>
  );
}
