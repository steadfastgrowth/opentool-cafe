import { Link } from "@/components/link";
import { notFound, redirect } from "next/navigation";
import { getPrisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { sendDirectMessage } from "@/app/actions";
import { TtyLog } from "@/components/tty-log";

export default async function MailThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ err?: string }>;
}) {
  const prisma = await getPrisma();
  const me = await getSessionUser();
  if (!me) redirect("/join");
  const { slug } = await params;
  const q = await searchParams;
  const person = await prisma.user.findUnique({ where: { slug } });
  if (!person || person.id === me.id) notFound();

  await prisma.directMessage.updateMany({
    where: { fromUserId: person.id, toUserId: me.id, readAt: null },
    data: { readAt: new Date() },
  });
  await prisma.notice.updateMany({
    where: { toUserId: me.id, fromUserId: person.id, kind: "mail", readAt: null },
    data: { readAt: new Date() },
  });

  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [
        { fromUserId: me.id, toUserId: person.id },
        { fromUserId: person.id, toUserId: me.id },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return (
    <main className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
      <div className="tty-screen">
        <div className="tty-bar">
          <span>
            {me.slug} ↔ {person.slug}
          </span>
          <span>
            <Link href="/mail">exit</Link>
            {"  "}
            <Link href={`/u/${person.slug}`}>whois</Link>
          </span>
        </div>
        <div className="tty-log" id="tty-log">
          <p className="tty-meta">$ talk {person.slug}</p>
          <TtyLog
            slug={person.slug}
            meSlug={me.slug}
            initial={messages.map((m: { id: string; body: string; fromUserId: string; createdAt: Date }) => ({
              id: m.id,
              body: m.body,
              from: m.fromUserId === me.id ? me.slug : person.slug,
              at: typeof m.createdAt === "string" ? m.createdAt : m.createdAt.toISOString(),
            }))}
          />
          {q.err === "fields" && <p className="tty-meta">need a line, under 2000.</p>}
          {q.err === "rate" && <p className="tty-meta">rate limit. wait.</p>}
        </div>
        <form action={sendDirectMessage} className="tty-prompt">
          <input type="hidden" name="slug" value={person.slug} />
          <label className="tty-who" htmlFor="dm-body">
            {me.slug}$
          </label>
          <input id="dm-body" name="body" className="tty-input" required maxLength={2000} autoComplete="off" spellCheck={false} />
        </form>
      </div>
    </main>
  );
}
