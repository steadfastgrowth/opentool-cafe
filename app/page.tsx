import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { padTicket, tagList, getSessionUser } from "@/lib/auth";
import { JoinForm } from "@/components/join-form";

export default async function Home() {
  const prisma = await getPrisma();
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
        <div className="p-4 sm:p-10">
          <p className="display text-[12px] tracking-[0.22em] text-mark mb-4">
            OPEN TOOL CAFE
          </p>
          <h1 className="display text-[2.15rem] sm:text-6xl font-semibold tracking-tight leading-[1.02] sm:leading-[0.95] mb-5">
            Welcome to open tool cafe,
            <br className="hidden sm:block" />
            can I take your order?
            <span className="caret" aria-hidden />
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-dim mb-10">
            Share and download open source tools, connect with other founders
            and builders, enjoy some java.
          </p>

          <div className="grid md:grid-cols-3 gap-3 mb-12">
            <div className="ticket p-4">
              <div className="font-mono text-[11px] text-mark">01</div>
              <h2 className="display text-xl font-semibold mt-1">Sign up</h2>
              <p className="text-sm text-dim mt-2">Read the menu. See what&apos;s brewing.</p>
            </div>
            <div className="ticket p-4">
              <div className="font-mono text-[11px] text-mark">02</div>
              <h2 className="display text-xl font-semibold mt-1">Find new tools</h2>
              <p className="text-sm text-dim mt-2">
                Repos, Hugging Face models, whatever the community shares.
              </p>
            </div>
            <div className="ticket p-4">
              <div className="font-mono text-[11px] text-mark">03</div>
              <h2 className="display text-xl font-semibold mt-1">Connect</h2>
              <p className="text-sm text-dim mt-2">
                Meet other builders, book time with a founder, talk to users.
              </p>
            </div>
          </div>

          {!me ? (
            <section className="max-w-md mb-14">
              <p className="font-mono text-[11px] tracking-widest uppercase text-dim mb-3">
                Step 01 · sign up
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
            <h2 className="display text-2xl">The menu</h2>
            <Link href="/find" className="nav-link">
              Full menu →
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
