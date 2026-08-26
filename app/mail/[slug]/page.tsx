import { Link } from "@/components/link";
import { notFound, redirect } from "next/navigation";
import { getPrisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { sendDirectMessage } from "@/app/actions";
import { Stage } from "@/components/stage";
import { Avatar } from "@/components/avatar";

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
      <Link href="/mail" className="text-sm text-dim">
        ← mail
      </Link>
      <div className="flex items-center gap-3 mt-4 mb-8">
        <Avatar name={person.name || person.slug} src={person.avatarUrl} size={56} />
        <div>
          <h1 className="display text-3xl">{person.name || person.slug}</h1>
          <Link href={`/u/${person.slug}`} className="font-mono text-[11px] text-mark">
            @{person.slug}
          </Link>
        </div>
      </div>
      <div className="grid gap-3 mb-8">
        {messages.length === 0 && <p className="text-dim">No notes yet.</p>}
        {messages.map((m: { id: string; body: string; fromUserId: string; createdAt: Date }) => (
          <div key={m.id} className="ticket p-4">
            <p className="font-mono text-[11px] text-dim">{m.fromUserId === me.id ? "you" : `@${person.slug}`}</p>
            <p className="mt-2 whitespace-pre-wrap">{m.body}</p>
          </div>
        ))}
      </div>
      {q.err === "fields" && <p className="mb-3">Need a note, under 2000 characters.</p>}
      {q.err === "rate" && <p className="mb-3">Too many notes. Wait a few minutes.</p>}
      <form action={sendDirectMessage} className="ticket p-5 space-y-3">
        <input type="hidden" name="slug" value={person.slug} />
        <label className="lbl" htmlFor="dm-body">
          note
        </label>
        <textarea id="dm-body" name="body" className="field" rows={4} required maxLength={2000} />
        <button className="btn sm:w-auto" type="submit">
          Send
        </button>
      </form>
    </Stage>
  );
}
