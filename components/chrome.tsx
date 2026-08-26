import { Link } from "@/components/link";
import { getPrisma } from "@/lib/db";
import { Avatar } from "@/components/avatar";

export async function Chrome({
  signedIn,
  slug,
  avatarUrl,
  name,
}: {
  signedIn: boolean;
  slug: string | null;
  avatarUrl?: string | null;
  name?: string | null;
}) {
  const links = signedIn
    ? ([
        { href: "/find", label: "menu" },
        { href: "/board", label: "board" },
        { href: "/mail", label: "mail" },
        { href: "/tip", label: "tip" },
      ] as const)
    : ([
        { href: "/find", label: "menu" },
        { href: "/board", label: "board" },
        { href: "/tip", label: "tip" },
      ] as const);
  const prisma = await getPrisma();
  const board = await prisma.listing.findMany({
    orderBy: { number: "asc" },
    select: { name: true, number: true },
    take: 12,
  });
  const items = ["now serving", ...board.map((b) => `#${String(b.number).padStart(3, "0")} ${b.name}`)];
  const loop = [...items, ...items];
  return (
    <header className="sticky top-0 z-40">
      <div className="nav-bar">
        <Link href="/" className="nav-mark" aria-label="Open Tool Cafe home">
          <span className="steam">
            <b />
            <b />
            <b />
          </span>
          <span className="cup" />
        </Link>
        <div className="nav-word-row">
          <Link href="/" className="wordmark">
            opentool.cafe
          </Link>
          <nav className="nav-links" aria-label="Primary">
            {links.map((l) => (
              <Link key={l.href} className={l.href === "/tip" ? "nav-link tip-nav" : "nav-link"} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="nav-end">
          <form action="/search" role="search" className="nav-search-wrap">
            <label className="sr-only" htmlFor="nav-q">
              Search
            </label>
            <input id="nav-q" name="q" className="nav-search" placeholder="Search" />
          </form>
          {signedIn && slug ? (
            <Link href={`/u/${slug}`} className="nav-avatar" aria-label="Your public profile">
              <Avatar name={name || slug} src={avatarUrl} size={32} />
            </Link>
          ) : (
            <Link className="nav-link" href="/join">
              join
            </Link>
          )}
          <details className="nav-more">
            <summary className="mobile-menu-btn" aria-label="Open more">
              more
            </summary>
            <div className="mobile-drawer">
              <nav className="flex flex-col" aria-label="Mobile">
                {links.map((l) => (
                  <Link key={l.href} className="nav-link py-2" href={l.href}>
                    {l.label}
                  </Link>
                ))}
                <Link className="nav-link py-2" href="/search">
                  search
                </Link>
                {signedIn && slug ? (
                  <Link className="nav-link py-2" href="/you">
                    edit profile
                  </Link>
                ) : (
                  <Link className="nav-link py-2" href="/join">
                    join
                  </Link>
                )}
              </nav>
            </div>
          </details>
        </div>
      </div>
      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          {loop.map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
      </div>
    </header>
  );
}
