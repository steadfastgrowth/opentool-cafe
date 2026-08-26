import { Link } from "@/components/link";
import { notFound, redirect } from "next/navigation";
import { getPrisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { sendDirectMessage } from "@/app/actions";
import { Stage } from "@/components/stage";
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
    <Stage label="Mail" wide={false}>
      <RefreshMail />
      <p className="font-mono text-[11px] text-dim">
        $ talk @{person.slug}{" "}
        <Link href="/mail">exit</Link>
        {" · "}
        <Link href={`/u/${person.slug}`}>profile</Link>
      </p>
      <div className="tty mt-6 mb-2">
        {messages.length === 0 && <p className="text-dim">no traffic yet.</p>}
        {messages.map((m: { id: string; body: string; fromUserId: string; createdAt: Date }) => (
          <div key={m.id} className="tty-line">
            <span className="tty-time">{hhmm(m.createdAt)}</span>
            <span className="tty-who">{m.fromUserId === me.id ? "you>" : `@${person.slug}>`}</span>
            <span>{m.body}</span>
          </div>
        ))}
      </div>
      {q.err === "fields" && <p className="tty mb-2">need a line, under 2000.</p>}
      {q.err === "rate" && <p className="tty mb-2">rate limit. wait.</p>}
      <form action={sendDirectMessage} className="tty-prompt">
        <input type="hidden" name="slug" value={person.slug} />
        <label className="tty-who shrink-0" htmlFor="dm-body">
          you$
        </label>
        <input id="dm-body" name="body" className="field" required maxLength={2000} autoComplete="off" />
        <button className="btn btn-ghost" type="submit">
          enter
        </button>
      </form>
    </Stage>
  );
}
