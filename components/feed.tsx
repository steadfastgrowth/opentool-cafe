import { Link } from "@/components/link";
import { Avatar } from "@/components/avatar";
import { padTicket } from "@/lib/auth";

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
                    {item.kind} · @{item.authorSlug}
                  </p>
                  <h2 className="display text-xl mt-0.5">{item.title}</h2>
                  <p className="text-sm text-dim mt-1 line-clamp-2">{item.body}</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="font-mono text-[11px] text-mark uppercase tracking-widest">
                  tool · #{padTicket(item.number)}
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
