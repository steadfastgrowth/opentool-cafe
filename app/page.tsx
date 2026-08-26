import Link from "next/link";
import { prisma } from "@/lib/db";
import { padTicket, tagList, getSessionUser } from "@/lib/auth";
import { JoinForm } from "@/components/join-form";

export default async function Home() {
  const me = await getSessionUser();
  const board = await prisma.listing.findMany({
    orderBy: { number: "asc" },
    take: 8,
  });
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 boot">
      <div className="stage">
        <div className="receipt">
          <span className="dots flex gap-1">
            <span />
            <span />
            <span />
          </span>
          Front of house
        </div>
        <div className="p-6 sm:p-10">
          <p className="display text-[12px] tracking-[0.22em] text-mark mb-4">
            OPEN TOOL CAFE
          </p>
          <h1 className="display text-5xl sm:text-6xl font-semibold tracking-tight leading-[0.95] mb-5">
            Take a tool you can
            <br />
            actually run.
            <span className="caret" aria-hidden />
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-dim mb-10">
            GitHub repos, Hugging Face models, self-hosted apps. Open one. Leave
            with the official page.
          </p>

          <div className="grid md:grid-cols-3 gap-3 mb-12">
            <div className="ticket p-4">
              <div className="font-mono text-[11px] text-mark">01</div>
              <h2 className="display text-xl font-semibold mt-1">House list</h2>
              <p className="text-sm text-dim mt-2">Join. Then take a tool.</p>
            </div>
            <div className="ticket p-4">
              <div className="font-mono text-[11px] text-mark">02</div>
              <h2 className="display text-xl font-semibold mt-1">Take a repo</h2>
              <p className="text-sm text-dim mt-2">Every ticket is GitHub or Hugging Face.</p>
            </div>
            <div className="ticket p-4">
              <div className="font-mono text-[11px] text-mark">03</div>
              <h2 className="display text-xl font-semibold mt-1">Book help</h2>
              <p className="text-sm text-dim mt-2">Same tab if it stalls.</p>
            </div>
          </div>

          {!me ? (
            <section className="max-w-md mb-14">
              <p className="font-mono text-[11px] tracking-widest uppercase text-dim mb-3">
                Step 01 · house list
              </p>
              <JoinForm />
            </section>
          ) : (
            <p className="mb-14">
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
              <Link key={item.id} href={`/l/${item.slug}`} className="ticket p-4 block no-underline">
                <div className="font-mono text-[11px] text-dim">#{padTicket(item.number)}</div>
                <div className="display text-xl font-semibold">{item.name}</div>
                <p className="text-sm mt-1 text-dim">{item.oneLiner}</p>
                <p className="font-mono text-[11px] text-mark mt-2">
                  {tagList(item.tags).join(" · ")}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
