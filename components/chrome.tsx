import { Link } from "@/components/link";
import { getPrisma } from "@/lib/db";
import { Avatar } from "@/components/avatar";
import { menuSort } from "@/lib/menu";
import { MoreMenu } from "@/components/more-menu";
import { SearchBox } from "@/components/search-box";

function unreadFor(href: string, mailUnread: number, deskUnread: number) {
  if (href === "/mail") return mailUnread;
  if (href === "/desk") return deskUnread;
  return 0;
}

function NavLabel({
  href,
  label,
  mailUnread,
  deskUnread,
}: {
  href: string;
  label: string;
  mailUnread: number;
  deskUnread: number;
}) {
  const n = unreadFor(href, mailUnread, deskUnread);
  return (
    <>
      {label}
      {n > 0 ? <span className="nav-badge">{n > 99 ? "99+" : n}</span> : null}
    </>
  );
}

export async function Chrome({
  signedIn,
  slug,
  avatarUrl,
  name,
  mailUnread = 0,
  deskUnread = 0,
}: {
  signedIn: boolean;
  slug: string | null;
  avatarUrl?: string | null;
  name?: string | null;
  mailUnread?: number;
  deskUnread?: number;
}) {
  const links = signedIn
    ? ([
        { href: "/find", label: "menu" },
        { href: "/board", label: "board" },
        { href: "/people", label: "people" },
        { href: "/mail", label: "mail" },
        { href: "/desk", label: "desk" },
      ] as const)
    : ([
        { href: "/find", label: "menu" },
        { href: "/board", label: "board" },
        { href: "/tip", label: "tip" },
      ] as const);
  const prisma = await getPrisma();
  const raw = (await prisma.listing.findMany({ take: 40 })) as {
    number: number;
    name: string;
    claimed: boolean;
  }[];
  const board = menuSort(raw).slice(0, 12);
  const items = ["now serving", ...board.map((b) => `#${String(b.number).padStart(3, "0")} ${b.name}`)];
  const loop = [...items, ...items];
  return (
    <header className="sticky top-0 z-40">
      <div className={signedIn ? "nav-bar is-in" : "nav-bar"}>
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
            {links.map((l) => {
              const n = unreadFor(l.href, mailUnread, deskUnread);
              return (
                <Link
                  key={l.href}
                  className={[
                    "nav-link",
                    l.href === "/tip" ? "tip-nav" : "",
                    n > 0 ? "has-unread" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  href={l.href}
                >
                  <NavLabel href={l.href} label={l.label} mailUnread={mailUnread} deskUnread={deskUnread} />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="nav-end">
          <div className="nav-search-wrap">
            <SearchBox id="nav-q" className="nav-search" />
          </div>
          {signedIn ? (
            <nav className="nav-alerts" aria-label="Inbox">
              <Link className={mailUnread > 0 ? "nav-link has-unread" : "nav-link"} href="/mail">
                mail
                {mailUnread > 0 ? <span className="nav-badge">{mailUnread > 99 ? "99+" : mailUnread}</span> : null}
              </Link>
              <Link className={deskUnread > 0 ? "nav-link has-unread" : "nav-link"} href="/desk">
                desk
                {deskUnread > 0 ? <span className="nav-badge">{deskUnread > 99 ? "99+" : deskUnread}</span> : null}
              </Link>
            </nav>
          ) : null}
          {signedIn && slug ? (
            <Link href={`/u/${slug}`} className="nav-avatar" aria-label="Your public profile">
              <Avatar name={name || slug} src={avatarUrl} size={32} />
            </Link>
          ) : (
            <Link className="nav-link" href="/join">
              join
            </Link>
          )}
          <MoreMenu>
            {links.map((l) => {
              const n = unreadFor(l.href, mailUnread, deskUnread);
              return (
                <Link
                  key={l.href}
                  className={["nav-link py-2", n > 0 ? "has-unread" : ""].filter(Boolean).join(" ")}
                  href={l.href}
                >
                  <NavLabel href={l.href} label={l.label} mailUnread={mailUnread} deskUnread={deskUnread} />
                </Link>
              );
            })}
            <Link className="nav-link py-2" href="/search">
              search
            </Link>
            {signedIn ? (
              <Link className="nav-link py-2 tip-nav" href="/tip">
                tip
              </Link>
            ) : null}
            {signedIn && slug ? (
              <Link className="nav-link py-2" href="/you">
                edit profile
              </Link>
            ) : (
              <Link className="nav-link py-2" href="/join">
                join
              </Link>
            )}
          </MoreMenu>
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
