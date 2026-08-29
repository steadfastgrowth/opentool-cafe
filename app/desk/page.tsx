import { Link } from "@/components/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { markDeskRead, openNotice } from "@/app/actions";
import { Avatar } from "@/components/avatar";
import { noticeLine } from "@/lib/notice";
import { publicAuthorSelect, type PublicAuthor } from "@/lib/person";
import { ago } from "@/lib/time";
import { Stage } from "@/components/stage";

const FILTERS = [
  { id: "all", label: "all" },
  { id: "follow", label: "follows" },
  { id: "like", label: "likes" },
  { id: "comment", label: "comments" },
] as const;

export default async function DeskPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const me = await getSessionUser();
  if (!me) redirect("/join?next=/desk");
  const prisma = await getPrisma();
  const { kind } = await searchParams;
  const filter = FILTERS.some((f) => f.id === kind && f.id !== "all") ? kind : undefined;

  const notices = await prisma.notice.findMany({
    where: {
      toUserId: me.id,
      kind: filter ? filter : { not: "mail" },
    },
    include: { fromUser: { select: publicAuthorSelect } },
    orderBy: { createdAt: "desc" },
    take: 80,
  });
  const unread = notices.filter((n: { readAt: Date | null }) => !n.readAt).length;

  return (
    <Stage label="Desk" wide={false}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="display text-4xl">Desk</h1>
          <p className="text-dim mt-1">Likes, comments, and follows. Mail stays in mail.</p>
        </div>
        {unread > 0 ? (
          <form action={markDeskRead}>
            <button className="btn btn-ghost sm:w-auto" type="submit">
              Mark all read
            </button>
          </form>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {FILTERS.map((k) => (
          <Link
            key={k.id}
            href={k.id === "all" ? "/desk" : `/desk?kind=${k.id}`}
            className="font-mono text-[11px] border border-line px-2 py-1"
          >
            {k.label}
          </Link>
        ))}
      </div>
      {notices.length === 0 ? (
        <p className="text-dim">Quiet desk. Follow people and pin notes — activity lands here.</p>
      ) : (
        <ul className="space-y-2">
          {notices.map((n: { id: string; kind: string; readAt: Date | null; createdAt: Date; fromUser: PublicAuthor }) => (
            <li key={n.id}>
              <form action={openNotice}>
                <input type="hidden" name="id" value={n.id} />
                <button className={`desk-row ${n.readAt ? "" : "unread"}`} type="submit">
                  <Avatar name={n.fromUser.name || n.fromUser.slug} src={n.fromUser.avatarUrl} size={44} />
                  <span className="min-w-0 text-left">
                    <span className="block">
                      <span className="desk-kind">{n.kind}</span>
                      {noticeLine(n.kind, n.fromUser.slug)}
                      {n.readAt ? null : <span className="desk-new">new</span>}
                    </span>
                    <time className="font-mono text-[11px] text-dim" dateTime={n.createdAt.toISOString()}>
                      {ago(n.createdAt)}
                    </time>
                  </span>
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </Stage>
  );
}
