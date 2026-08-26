import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { deletePost } from "@/app/actions";
import { Avatar } from "@/components/avatar";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const prisma = await getPrisma();
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: true },
  });
  if (!post) notFound();
  const me = await getSessionUser();
  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <p className="font-mono text-[11px] text-mark uppercase tracking-widest mb-2">{post.kind}</p>
      <h1 className="display text-4xl mb-4">{post.title}</h1>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/u/${post.author.slug}`} className="no-underline">
          <Avatar name={post.author.name || post.author.slug} src={post.author.avatarUrl} size={72} />
        </Link>
        <div>
          <Link href={`/u/${post.author.slug}`} className="display text-xl">
            {post.author.name || post.author.slug}
          </Link>
          {post.author.offering && <p className="text-sm text-dim">{post.author.offering}</p>}
        </div>
      </div>
      <div className="ticket p-5 whitespace-pre-wrap leading-relaxed">{post.body}</div>
      {post.tags && <p className="font-mono text-[11px] text-mark mt-4">{post.tags}</p>}
      {me?.id === post.authorId && (
        <form action={deletePost} className="mt-6">
          <input type="hidden" name="id" value={post.id} />
          <button className="btn btn-ghost sm:w-auto" type="submit">
            Take it down
          </button>
        </form>
      )}
    </main>
  );
}
