import { Link } from "@/components/link";
import { getPrisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { Stage } from "@/components/stage";

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
    <Stage label="The board">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <h1 className="display text-4xl">The board</h1>
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
      <div className="flex flex-wrap gap-2 mb-8">
        {KINDS.map((k) => (
          <Link
            key={k.id}
            href={k.id === "all" ? "/board" : `/board?kind=${k.id}`}
            className="font-mono text-[11px] border border-line px-2 py-1"
          >
            {k.label}
          </Link>
        ))}
      </div>
      {posts.length === 0 && <p className="text-dim">Empty board. First pin wins.</p>}
      <div className="grid md:grid-cols-2 gap-3">
        {posts.map((p) => (
          <Link key={p.id} href={`/board/${p.id}`} className="ticket p-4 block no-underline">
            <div className="font-mono text-[11px] text-dim">{p.kind}</div>
            <div className="display text-xl font-semibold">{p.title}</div>
            <p className="text-sm mt-1 text-dim line-clamp-2">{p.body}</p>
            <p className="font-mono text-[11px] text-mark mt-2">
              @{p.author.slug}
              {p.tags ? ` · ${p.tags}` : ""}
            </p>
          </Link>
        ))}
      </div>
    </Stage>
  );
}
