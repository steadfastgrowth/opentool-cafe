import { Link } from "@/components/link";
import { getPrisma } from "@/lib/db";
import { getSessionUser, padTicket, tagList } from "@/lib/auth";
import { Stage } from "@/components/stage";

export default async function FindPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const me = await getSessionUser();
  if (!me) {
    return (
      <Stage label="The menu" wide={false}>
        <h1 className="display text-4xl mb-3">The menu</h1>
        <p className="text-lg text-dim mb-8">
          Take a seat to see the full list of open source tools. Guests get a taste on the front page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md">
          <Link href="/join?next=/find" className="btn no-underline sm:w-auto">
            Join to see the menu
          </Link>
          <Link href="/login?next=/find" className="btn btn-ghost no-underline sm:w-auto">
            Login
          </Link>
        </div>
      </Stage>
    );
  }

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
    <Stage label="The menu">
      <h1 className="display text-4xl mb-6">The menu</h1>
      <p className="mb-6">
        <Link href="/list">List a repo</Link>
      </p>
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
