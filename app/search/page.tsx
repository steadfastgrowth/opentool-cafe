import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { padTicket } from "@/lib/auth";
import { Avatar } from "@/components/avatar";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q || "").trim();
  const prisma = await getPrisma();
  const like = query.toLowerCase();

  const [people, tools, posts] = query
    ? await Promise.all([
        prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 80 }),
        prisma.listing.findMany({ orderBy: { number: "asc" }, take: 80 }),
        prisma.post.findMany({ orderBy: { createdAt: "desc" }, include: { author: true }, take: 80 }),
      ])
    : [[], [], []];

  const peopleHit = people.filter((p) =>
    `${p.name || ""} ${p.slug} ${p.bio || ""} ${p.skills || ""} ${p.offering || ""}`.toLowerCase().includes(like),
  );
  const toolHit = tools.filter((l) =>
    `${l.name} ${l.oneLiner} ${l.tags} ${l.body}`.toLowerCase().includes(like),
  );
  const postHit = posts.filter((p) =>
    `${p.title} ${p.body} ${p.tags} ${p.author.name || ""} ${p.author.slug}`.toLowerCase().includes(like),
  );

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-5 py-8 boot">
      <h1 className="display text-4xl mb-4">Search</h1>
      <form action="/search" role="search" className="mb-8">
        <label className="lbl" htmlFor="search-q">
          people, tools, posts
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input id="search-q" name="q" defaultValue={query} className="field" autoFocus />
          <button className="btn sm:w-auto" type="submit">
            Search
          </button>
        </div>
      </form>

      {!query && <p className="text-dim">Type a name, a tool, or a pin.</p>}

      {query && (
        <div className="space-y-10">
          <section>
            <h2 className="display text-2xl mb-3">People · {peopleHit.length}</h2>
            {peopleHit.length === 0 ? (
              <p className="text-dim">None.</p>
            ) : (
              <ul className="space-y-2">
                {peopleHit.map((p) => (
                  <li key={p.id}>
                    <Link href={`/u/${p.slug}`} className="ticket p-3 flex gap-3 no-underline items-center">
                      <Avatar name={p.name || p.slug} src={p.avatarUrl} size={44} />
                      <div>
                        <div className="display text-lg">{p.name || p.slug}</div>
                        <p className="text-sm text-dim">@{p.slug}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h2 className="display text-2xl mb-3">Tools · {toolHit.length}</h2>
            {toolHit.length === 0 ? (
              <p className="text-dim">None.</p>
            ) : (
              <ul className="space-y-2">
                {toolHit.map((l) => (
                  <li key={l.id}>
                    <Link href={`/l/${l.slug}`} className="ticket p-3 block no-underline">
                      <span className="font-mono text-[11px] text-dim">#{padTicket(l.number)}</span>
                      <div className="display text-lg">{l.name}</div>
                      <p className="text-sm text-dim">{l.oneLiner}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h2 className="display text-2xl mb-3">Posts · {postHit.length}</h2>
            {postHit.length === 0 ? (
              <p className="text-dim">None.</p>
            ) : (
              <ul className="space-y-2">
                {postHit.map((p) => (
                  <li key={p.id}>
                    <Link href={`/board/${p.id}`} className="ticket p-3 block no-underline">
                      <span className="font-mono text-[11px] text-mark">{p.kind}</span>
                      <div className="display text-lg">{p.title}</div>
                      <p className="text-sm text-dim">@{p.author.slug}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
