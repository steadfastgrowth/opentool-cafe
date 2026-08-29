import { Link } from "@/components/link";
import { Avatar } from "@/components/avatar";
import { padTicket } from "@/lib/auth";
import { ago } from "@/lib/time";
import type { PublicAuthor } from "@/lib/person";

export type FeedRow =
  | {
      type: "post";
      at: Date;
      id: string;
      title: string;
      body: string;
      kind: string;
      href: string;
      authorName: string;
      authorSlug: string;
      authorAvatar: string | null;
      likes: number;
      comments: number;
    }
  | {
      type: "tool";
      at: Date;
      id: string;
      title: string;
      body: string;
      href: string;
      number: number;
    };

export function postToFeed(p: {
  id: string;
  title: string;
  body: string;
  kind: string;
  createdAt: Date;
  author: PublicAuthor;
  _count: { likes: number; comments: number };
}): FeedRow {
  return {
    type: "post",
    at: p.createdAt,
    id: p.id,
    title: p.title,
    body: p.body,
    kind: p.kind,
    href: `/board/${p.id}`,
    authorName: p.author.name || p.author.slug,
    authorSlug: p.author.slug,
    authorAvatar: p.author.avatarUrl,
    likes: p._count.likes,
    comments: p._count.comments,
  };
}

export function FeedList({ items }: { items: FeedRow[] }) {
  if (items.length === 0) {
    return <p className="text-dim">Quiet so far. Post on the board or list a tool.</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={`${item.type}-${item.id}`}>
          <Link href={item.href} className="ticket p-4 block no-underline">
            {item.type === "post" ? (
              <div className="flex gap-3">
                <Avatar name={item.authorName} src={item.authorAvatar} size={48} />
                <div className="min-w-0">
                  <p className="font-mono text-[11px] text-mark uppercase tracking-widest">
                    {item.kind} · @{item.authorSlug} · {ago(item.at)}
                  </p>
                  <h2 className="display text-xl mt-0.5">{item.title}</h2>
                  <p className="text-sm text-dim mt-1 line-clamp-2">{item.body}</p>
                  <p className="font-mono text-[11px] text-dim mt-2">
                    {item.likes} likes · {item.comments} comments
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="font-mono text-[11px] text-mark uppercase tracking-widest">
                  tool · #{padTicket(item.number)} · {ago(item.at)}
                </p>
                <h2 className="display text-xl mt-0.5">{item.title}</h2>
                <p className="text-sm text-dim mt-1">{item.body}</p>
              </div>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
