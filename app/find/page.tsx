import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { padTicket, tagList } from "@/lib/auth";

export default async function FindPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const prisma = await getPrisma();
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
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 boot">
      <div className="stage">
        <div className="receipt">
          <span className="dots flex gap-1" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          The menu
        </div>
        <div className="p-4 sm:p-10">
          <h1 className="display text-4xl mb-6">The menu</h1>
          <form className="flex flex-col sm:flex-row gap-3 mb-4 max-w-lg" role="search">
            <label className="sr-only" htmlFor="menu-q">
              Search the menu
            </label>
            <input id="menu-q" name="q" defaultValue={q || ""} className="field" placeholder="Search" />
            <button className="btn sm:w-auto" type="submit">
              Search
            </button>
          </form>
          <div className="flex flex-wrap gap-2 mb-8">
            <Link href="/find" className="font-mono text-[11px] border border-line px-2 py-1">
              all
            </Link>
            {tags.map((t) => (
              <Link
                key={t}
                href={`/find?tag=${encodeURIComponent(t)}`}
                className="font-mono text-[11px] border border-line px-2 py-1"
              >
                {t}
              </Link>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {filtered.map((item) => (
              <Link key={item.id} href={`/l/${item.slug}`} className="ticket p-4 block no-underline">
                <div className="font-mono text-[11px] text-dim">#{padTicket(item.number)}</div>
                <div className="display text-xl font-semibold">{item.name}</div>
                <p className="text-sm mt-1 text-dim">{item.oneLiner}</p>
                <p className="font-mono text-[11px] text-mark mt-2">{tagList(item.tags).join(" · ")}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
