import { Link } from "@/components/link";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

function hhmm(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
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
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="tty-screen">
        <div className="tty-bar">
          <span>mail@opentool.cafe</span>
          <span>~/{me.slug}</span>
        </div>
        <div className="tty-log" id="tty-log">
          <p className="tty-meta">$ ls ~/mail</p>
          {threads.length === 0 ? (
            <p className="tty-meta">
              0 sessions. <Link href="/people">cd ../people</Link>
            </p>
          ) : (
            threads.map((t) => (
              <Link key={t.slug} href={`/mail/${t.slug}`} className={t.unread > 0 ? "tty-row unread" : "tty-row"}>
                <span className="tty-time">{hhmm(t.at)}</span>
                <span className="tty-who">
                  {t.slug}
                  {t.unread > 0 ? ` · ${t.unread} new` : ""}
                </span>
                <span className="tty-body">{t.preview}</span>
              </Link>
            ))
          )}
        </div>
        <p className="tty-status">
          {me.slug}$ <span className="tty-caret" aria-hidden />
        </p>
      </div>
    </main>
  );
}
