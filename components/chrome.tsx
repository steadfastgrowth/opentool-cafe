import Link from "next/link";
import { prisma } from "@/lib/db";
import { Clock } from "./clock";

export async function Chrome({
  signedIn,
  slug,
}: {
  signedIn: boolean;
  slug: string | null;
}) {
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
  return (
    <header>
      <div className="px-5 py-3 flex items-center justify-between gap-4 bg-[#fff8ea]">
        <Link href="/" className="flex items-end gap-2 no-underline">
          <span className="flex flex-col items-center" aria-hidden>
            <span className="steam">
              <b />
              <b />
              <b />
            </span>
            <span className="cup" />
          </span>
          <span className="wordmark text-[15px] sm:text-[17px] leading-none pb-0.5">
            opentool.cafe
          </span>
        </Link>
        <nav className="flex gap-4 items-center text-dim">
          <Link className="nav-link" href="/">
            cafe
          </Link>
          <Link className="nav-link" href="/list">
            makers
          </Link>
          <Link className="nav-link" href="/find">
            board
          </Link>
          <Link className="nav-link" href="/people">
            people
          </Link>
          <Link className="nav-link" href={signedIn ? "/you" : "/join"}>
            {signedIn ? slug || "you" : "you"}
          </Link>
          <Clock />
        </nav>
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
