import { Link } from "@/components/link";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { Stage } from "@/components/stage";
import { Avatar } from "@/components/avatar";

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
    name: string;
    avatarUrl: string | null;
    preview: string;
    unread: number;
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
      name: other.name || other.slug,
      avatarUrl: other.avatarUrl,
      preview: row.body,
      unread,
    });
  }

  return (
    <Stage label="Mail" wide={false}>
      <h1 className="display text-4xl mb-3">Mail</h1>
      <p className="text-dim mb-8">Notes between regulars. Open a profile to start one.</p>
      {threads.length === 0 ? (
        <p className="text-dim">
          Empty. <Link href="/people">People</Link>
        </p>
      ) : (
        <div className="grid gap-3">
          {threads.map((t) => (
            <Link key={t.slug} href={`/mail/${t.slug}`} className="ticket p-4 flex gap-3 no-underline items-start">
              <Avatar name={t.name} src={t.avatarUrl} size={48} />
              <div className="min-w-0">
                <div className="display text-xl">
                  {t.name}
                  {t.unread > 0 ? ` · ${t.unread}` : ""}
                </div>
                <p className="text-sm text-dim line-clamp-2 mt-1">{t.preview}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Stage>
  );
}
