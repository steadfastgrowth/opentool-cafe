import Link from "next/link";
import { prisma } from "@/lib/db";
import { padTicket, tagList } from "@/lib/auth";

export default async function FindPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { q, tag } = await searchParams;
  const all = await prisma.listing.findMany({ orderBy: { number: "asc" } });
  const tags = Array.from(new Set(all.flatMap((l) => tagList(l.tags)))).sort();
  const filtered = all.filter((l) => {
    const hay = `${l.name} ${l.oneLiner} ${l.tags}`.toLowerCase();
    if (q && !hay.includes(q.toLowerCase())) return false;
    if (tag && !tagList(l.tags).includes(tag)) return false;
    return true;
  });
  return (
    <main className="max-w-5xl mx-auto px-5 py-10">
      <h1 className="display text-4xl mb-6">The board</h1>
      <form className="flex gap-2 mb-4">
        <input name="q" defaultValue={q || ""} className="field" placeholder="Search" />
        <button className="btn" type="submit">
          Search
        </button>
      </form>
      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/find" className="text-xs border border-line px-2 py-1">
          all
        </Link>
        {tags.map((t) => (
          <Link key={t} href={`/find?tag=${encodeURIComponent(t)}`} className="text-xs border border-line px-2 py-1">
            {t}
          </Link>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {filtered.map((item) => (
          <Link key={item.id} href={`/l/${item.slug}`} className="ticket p-4 block">
            <div className="display text-xs text-mute">#{padTicket(item.number)}</div>
            <div className="display text-xl font-semibold">{item.name}</div>
            <p className="text-sm mt-1">{item.oneLiner}</p>
            <p className="text-xs text-mute mt-2">{tagList(item.tags).join(" · ")}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
