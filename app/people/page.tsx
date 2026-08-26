import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function PeoplePage() {
  const people = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { listings: true, takes: true } } },
  });
  return (
    <main className="max-w-3xl mx-auto px-5 py-10">
      <h1 className="display text-4xl mb-6">People</h1>
      {people.length === 0 && <p className="text-mute">Empty room.</p>}
      <ul className="space-y-3">
        {people.map((p) => (
          <li key={p.id} className="ticket p-4">
            <Link href={`/u/${p.slug}`} className="display text-xl">
              {p.name || p.slug}
            </Link>
            {p.bio && <p className="text-sm mt-1">{p.bio}</p>}
            <p className="text-xs text-mute mt-2">
              {p._count.listings} listed · {p._count.takes} taken
              {p.takesMeetings ? " · meetings" : ""}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
