import Link from "next/link";
import { prisma } from "@/lib/db";
import { padTicket, tagList } from "@/lib/auth";
import { JoinForm } from "@/components/join-form";
import { getSessionUser } from "@/lib/auth";

export default async function Home() {
  const me = await getSessionUser();
  const board = await prisma.listing.findMany({
    orderBy: { number: "asc" },
    take: 8,
  });
  return (
    <main className="max-w-5xl mx-auto px-5 py-10">
      <p className="display text-sm tracking-[0.2em] uppercase text-mute mb-3">
        Front of house
      </p>
      <h1 className="display text-5xl md:text-6xl font-semibold leading-[0.95] mb-5">
        Take a tool you can
        <br />
        actually run.
      </h1>
      <p className="max-w-xl text-lg mb-10">
        GitHub repos, Hugging Face models, self-hosted apps. Open one. Leave with
        the official page. Book a person if it stalls.
      </p>

      {!me ? (
        <section className="ticket p-6 max-w-lg mb-14">
          <h2 className="display text-sm tracking-widest uppercase mb-4">House list</h2>
          <JoinForm />
        </section>
      ) : (
        <p className="mb-10">
          <Link className="btn" href="/you">
            Tab
          </Link>
        </p>
      )}

      <div className="flex items-end justify-between mb-4">
        <h2 className="display text-2xl">The board</h2>
        <Link href="/find" className="nav-link">
          Full board →
        </Link>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {board.map((item) => (
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
