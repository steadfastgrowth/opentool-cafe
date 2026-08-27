import { Link } from "@/components/link";
import { notFound, redirect } from "next/navigation";
import { getPrisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { addComment, deletePost, toggleLike } from "@/app/actions";
import { Avatar } from "@/components/avatar";

export default async function PostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ err?: string }>;
}) {
  const prisma = await getPrisma();
  const { id } = await params;
  const q = await searchParams;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: true,
      likes: true,
      comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!post) notFound();
  const me = await getSessionUser();
  const liked = Boolean(me && post.likes.some((l: { userId: string }) => l.userId === me.id));

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/board" className="text-sm text-dim">
        ← the board
      </Link>
      <p className="font-mono text-[11px] text-mark uppercase tracking-widest mb-2 mt-4">{post.kind}</p>
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

      <div className="flex flex-wrap gap-3 mt-6">
        {me ? (
          <form action={toggleLike}>
            <input type="hidden" name="postId" value={post.id} />
            <button className="btn sm:w-auto" type="submit">
              {liked ? "Liked" : "Like"} · {post.likes.length}
            </button>
          </form>
        ) : (
          <Link href="/join" className="btn sm:w-auto no-underline">
            Like · {post.likes.length}
          </Link>
        )}
        {me && me.id !== post.authorId && (
          <Link href={`/mail/${post.author.slug}`} className="btn btn-ghost sm:w-auto no-underline">
            Message
          </Link>
        )}
      </div>

      {me?.id === post.authorId && (
        <form action={deletePost} className="mt-6">
          <input type="hidden" name="id" value={post.id} />
          <button className="btn btn-ghost sm:w-auto" type="submit">
            Take it down
          </button>
        </form>
      )}

      <section className="mt-12">
        <h2 className="display text-2xl mb-4">Comments · {post.comments.length}</h2>
        {post.comments.length === 0 && <p className="text-dim mb-6">None yet.</p>}
        <ul className="comment-list mb-8">
          {post.comments.map(
            (c: {
              id: string;
              body: string;
              user: { slug: string; name: string | null; avatarUrl: string | null };
            }) => (
              <li key={c.id} className="comment">
                <Link href={`/u/${c.user.slug}`} className="no-underline shrink-0">
                  <Avatar name={c.user.name || c.user.slug} src={c.user.avatarUrl} size={36} />
                </Link>
                <div>
                  <Link href={`/u/${c.user.slug}`} className="font-mono text-[11px] text-mark">
                    @{c.user.slug}
                  </Link>
                  <p className="mt-1 whitespace-pre-wrap leading-relaxed">{c.body}</p>
                </div>
              </li>
            ),
          )}
        </ul>
        {q.err === "comment" && <p className="mb-3">Need a comment, under 2000 characters.</p>}
        {q.err === "rate" && <p className="mb-3">Too many comments. Wait a few minutes.</p>}
        {me ? (
          <form action={addComment} className="comment-form space-y-3">
            <input type="hidden" name="postId" value={post.id} />
            <label className="lbl" htmlFor="comment-body">
              comment
            </label>
            <textarea id="comment-body" name="body" className="field" rows={3} required maxLength={2000} />
            <button className="btn sm:w-auto" type="submit">
              Post comment
            </button>
          </form>
        ) : (
          <Link href="/join" className="btn sm:w-auto no-underline">
            Join to comment
          </Link>
        )}
      </section>
    </main>
  );
}
