import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { Avatar } from "@/components/avatar";

export default async function PeoplePage() {
  const prisma = await getPrisma();
  const people = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { listings: true, takes: true, posts: true } } },
  });
  return (
    <main className="max-w-3xl mx-auto px-5 py-10">
      <h1 className="display text-4xl mb-6">People</h1>
      {people.length === 0 && <p className="text-dim">Empty room. Join and get a cup.</p>}
      <ul className="space-y-3">
        {people.map((p) => (
          <li key={p.id} className="ticket p-4">
            <Link href={`/u/${p.slug}`} className="flex gap-3 no-underline items-start">
              <Avatar name={p.name || p.slug} src={p.avatarUrl} size={80} />
              <div className="min-w-0">
                <div className="display text-xl">{p.name || p.slug}</div>
                {p.bio && <p className="text-sm mt-1">{p.bio}</p>}
                {p.offering && <p className="text-sm text-dim mt-1">Offers: {p.offering}</p>}
                {p.lookingFor && <p className="text-sm text-dim">Wants: {p.lookingFor}</p>}
                <p className="text-xs text-dim mt-2">
                  {p._count.listings} listed · {p._count.takes} taken · {p._count.posts} posts
                  {p.takesMeetings ? " · meetings" : ""}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
