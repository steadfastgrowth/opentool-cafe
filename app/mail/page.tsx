import { Link } from "@/components/link";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { Stage } from "@/components/stage";

function hhmm(d: Date) {
  return d.toISOString().slice(11, 16);
}

export default async function MailPage() {
  const prisma = await getPrisma();
  const me = await getSessionUser();
  if (!me) redirect("/join?next=/mail");

  const rows = await prisma.directMessage.findMany({
    where: { OR: [{ fromUserId: me.id }, { toUserId: me.id }] },
    include: { fromUser: true, toUser: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const seen = new Set<string>();
  const threads: {
    slug: string;
    preview: string;
    unread: number;
    at: Date;
  }[] = [];

  for (const row of rows) {
    const other = row.fromUserId === me.id ? row.toUser : row.fromUser;
    if (seen.has(other.id)) continue;
    seen.add(other.id);
    const unread = await prisma.directMessage.count({
      where: { fromUserId: other.id, toUserId: me.id, readAt: null },
    });
    threads.push({
      slug: other.slug,
      preview: row.body,
      unread,
      at: row.createdAt,
    });
  }

  return (
    <Stage label="Mail" wide={false}>
      <p className="font-mono text-[11px] text-dim mb-6">$ ls ~/mail</p>
      {threads.length === 0 ? (
        <p className="tty text-dim">
          empty. <Link href="/people">people</Link>
        </p>
      ) : (
        <div className="tty">
          {threads.map((t) => (
            <Link key={t.slug} href={`/mail/${t.slug}`} className="tty-row no-underline">
              <span className="tty-time">{hhmm(t.at)}</span>
              <span className="tty-who">
                {t.unread > 0 ? `*@${t.slug}` : `@${t.slug}`}
              </span>
              <span className="line-clamp-1">{t.preview}</span>
            </Link>
          ))}
        </div>
      )}
    </Stage>
  );
}
