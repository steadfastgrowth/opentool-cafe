import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { Clock } from "./clock";

const links = [
  { href: "/", label: "cafe" },
  { href: "/board", label: "board" },
  { href: "/list", label: "makers" },
  { href: "/find", label: "menu" },
  { href: "/people", label: "people" },
] as const;

export async function Chrome({
  signedIn,
  slug,
}: {
  signedIn: boolean;
  slug: string | null;
}) {
  const prisma = await getPrisma();
  const board = await prisma.listing.findMany({
    orderBy: { number: "asc" },
    select: { name: true, number: true },
    take: 12,
  });
  const items = [
    "now serving",
    ...board.map((b) => `#${String(b.number).padStart(3, "0")} ${b.name}`),
  ];
  const loop = [...items, ...items];
  const youHref = signedIn ? "/you" : "/join";
  const youLabel = signedIn ? slug || "you" : "you";
  return (
    <header className="sticky top-0 z-40">
      <div className="px-4 sm:px-5 pt-[max(0.65rem,env(safe-area-inset-top))] pb-3 flex items-center justify-between gap-3 bg-[#fff8ea]">
        <Link href="/" className="flex items-end gap-2 no-underline min-w-0">
          <span className="flex flex-col items-center shrink-0" aria-hidden>
            <span className="steam">
              <b />
              <b />
              <b />
            </span>
            <span className="cup" />
          </span>
          <span className="wordmark text-[14px] sm:text-[17px] leading-none pb-0.5 truncate">
            opentool.cafe
          </span>
        </Link>
        <nav className="hidden sm:flex gap-4 items-center text-dim shrink-0">
          {links.map((l) => (
            <Link key={l.href} className="nav-link" href={l.href}>
              {l.label}
            </Link>
          ))}
          <Link className="nav-link" href={youHref}>
            {youLabel}
          </Link>
          <Clock />
        </nav>
        <details className="sm:hidden relative">
          <summary className="mobile-menu-btn">menu</summary>
          <div className="mobile-drawer">
            {links.map((l) => (
              <Link key={l.href} className="nav-link py-2" href={l.href}>
                {l.label}
              </Link>
            ))}
            <Link className="nav-link py-2" href={youHref}>
              {youLabel}
            </Link>
          </div>
        </details>
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
