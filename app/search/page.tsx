import { Link } from "@/components/link";
import { getPrisma } from "@/lib/db";
import { padTicket } from "@/lib/auth";
import { Avatar } from "@/components/avatar";
import { Stage } from "@/components/stage";
import { SearchBox } from "@/components/search-box";

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
  const toolHit = tools.filter((l) => `${l.name} ${l.oneLiner} ${l.tags} ${l.body}`.toLowerCase().includes(like));
  const postHit = posts.filter((p) =>
    `${p.title} ${p.body} ${p.tags} ${p.author.name || ""} ${p.author.slug}`.toLowerCase().includes(like),
  );

  return (
    <Stage label="Search">
      <h1 className="display text-4xl mb-6">Search</h1>
      <div className="mb-8 max-w-lg search-page-box">
        <SearchBox id="search-q" defaultValue={query} className="field" autoFocus />
      </div>

      {!query && <p className="text-dim">Type a name, a tool, or a post.</p>}

      {query && (
        <div className="space-y-10">
          <section>
            <h2 className="display text-2xl mb-3">People · {peopleHit.length}</h2>
            {peopleHit.length === 0 ? (
              <p className="text-dim">None.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {peopleHit.map((p) => (
                  <Link key={p.id} href={`/u/${p.slug}`} className="ticket p-4 flex gap-3 no-underline items-center">
                    <Avatar name={p.name || p.slug} src={p.avatarUrl} size={44} />
                    <div>
                      <div className="display text-xl font-semibold">{p.name || p.slug}</div>
                      <p className="font-mono text-[11px] text-mark">@{p.slug}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
          <section>
            <h2 className="display text-2xl mb-3">Menu · {toolHit.length}</h2>
            {toolHit.length === 0 ? (
              <p className="text-dim">None.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {toolHit.map((l) => (
                  <Link key={l.id} href={`/l/${l.slug}`} className="ticket p-4 block no-underline">
                    <div className="font-mono text-[11px] text-dim">#{padTicket(l.number)}</div>
                    <div className="display text-xl font-semibold">{l.name}</div>
                    <p className="text-sm mt-1 text-dim line-clamp-2">{l.oneLiner}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>
          <section>
            <h2 className="display text-2xl mb-3">Board · {postHit.length}</h2>
            {postHit.length === 0 ? (
              <p className="text-dim">None.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {postHit.map((p) => (
                  <Link key={p.id} href={`/board/${p.id}`} className="ticket p-4 block no-underline">
                    <div className="font-mono text-[11px] text-dim">{p.kind}</div>
                    <div className="display text-xl font-semibold">{p.title}</div>
                    <p className="font-mono text-[11px] text-mark mt-2">@{p.author.slug}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </Stage>
  );
}
