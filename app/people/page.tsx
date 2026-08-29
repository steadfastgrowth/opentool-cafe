import { Link } from "@/components/link";
import { getPrisma } from "@/lib/db";
import { Avatar } from "@/components/avatar";
import { Stage } from "@/components/stage";

export default async function PeoplePage() {
  const prisma = await getPrisma();
  const people = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { listings: true, takes: true, posts: true } } },
  });
  return (
    <Stage label="People">
      <h1 className="display text-4xl mb-6">People</h1>
      {people.length === 0 && <p className="text-dim">Empty room.</p>}
      <div className="grid md:grid-cols-2 gap-3">
        {people.map((p) => (
          <Link key={p.id} href={`/u/${p.slug}`} className="ticket p-4 flex gap-3 no-underline items-start">
            <Avatar name={p.name || p.slug} src={p.avatarUrl} size={56} />
            <div className="min-w-0">
              <div className="display text-xl font-semibold">{p.name || p.slug}</div>
              {p.bio && <p className="text-sm mt-1 text-dim line-clamp-2">{p.bio}</p>}
              <p className="font-mono text-[11px] text-mark mt-2">
                {p._count.listings} listed · {p._count.posts} posts
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Stage>
  );
}
