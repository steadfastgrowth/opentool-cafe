import { Link } from "@/components/link";
import { notFound, redirect } from "next/navigation";
import { getPrisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { sendDirectMessage } from "@/app/actions";
import { RefreshMail } from "@/components/refresh-mail";

function hhmm(d: Date) {
  return d.toISOString().slice(11, 16);
}

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
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <RefreshMail />
      <div className="tty-screen">
        <div className="tty-bar">
          <span>
            mail — {me.slug} ↔ {person.slug}
          </span>
          <span>
            <Link href="/mail">exit</Link>
            {"  "}
            <Link href={`/u/${person.slug}`}>whois</Link>
          </span>
        </div>
        <div className="tty-log" id="tty-log">
          <p className="tty-meta">$ talk {person.slug}</p>
          {messages.length === 0 && <p className="tty-meta">no traffic yet.</p>}
          {messages.map((m: { id: string; body: string; fromUserId: string; createdAt: Date }) => (
            <p key={m.id} className="tty-line">
              <span className="tty-time">{hhmm(m.createdAt)}</span>
              <span className="tty-who">{m.fromUserId === me.id ? `${me.slug}>` : `${person.slug}>`}</span>
              <span className="tty-body">{m.body}</span>
            </p>
          ))}
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
