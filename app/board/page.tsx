import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { Avatar } from "@/components/avatar";

const KINDS = [
  { id: "all", label: "all" },
  { id: "help", label: "need help" },
  { id: "collab", label: "collab" },
  { id: "service", label: "services" },
  { id: "bulletin", label: "bulletin" },
];

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const prisma = await getPrisma();
  const { kind } = await searchParams;
  const me = await getSessionUser();
  const posts = await prisma.post.findMany({
    where: kind && kind !== "all" ? { kind } : undefined,
    orderBy: { createdAt: "desc" },
    include: { author: true },
    take: 80,
  });
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-5 py-8 boot">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <p className="display text-sm tracking-[0.2em] uppercase text-mark mb-2">Cork board</p>
          <h1 className="display text-4xl">Bulletin</h1>
          <p className="text-dim mt-2 max-w-xl">
            Need help, want a collaborator, or offering a service. Pin it on the board.
          </p>
        </div>
        {me ? (
          <Link href="/board/new" className="btn sm:w-auto no-underline">
            Post
          </Link>
        ) : (
          <Link href="/join" className="btn sm:w-auto no-underline">
            Join to post
          </Link>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {KINDS.map((k) => (
          <Link
            key={k.id}
            href={k.id === "all" ? "/board" : `/board?kind=${k.id}`}
            className="font-mono text-[11px] border-2 border-paper px-2 py-1"
          >
            {k.label}
          </Link>
        ))}
      </div>
      {posts.length === 0 && <p className="text-dim">Empty board. First pin wins.</p>}
      <ul className="space-y-3">
        {posts.map((p) => (
          <li key={p.id} className="ticket p-4">
            <Link href={`/board/${p.id}`} className="block no-underline">
              <div className="flex gap-3">
                <Avatar name={p.author.name || p.author.slug} src={p.author.avatarUrl} size={56} />
                <div className="min-w-0">
                  <p className="font-mono text-[11px] text-mark uppercase tracking-widest">{p.kind}</p>
                  <h2 className="display text-xl">{p.title}</h2>
                  <p className="text-sm text-dim mt-1 line-clamp-2">{p.body}</p>
                  <p className="font-mono text-[11px] mt-2 text-dim">
                    {p.author.name || p.author.slug}
                    {p.tags ? ` · ${p.tags}` : ""}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
