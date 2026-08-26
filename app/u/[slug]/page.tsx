import type { Metadata } from "next";
import { Link } from "@/components/link";
import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/db";
import { getSessionUser, padTicket } from "@/lib/auth";
import { bookMeeting } from "@/app/actions";
import { Avatar } from "@/components/avatar";
import { FollowButton } from "@/components/follow-button";

function ext(href: string | null, label: string) {
  if (!href) return null;
  const url = href.startsWith("http") ? href : `https://${href}`;
  return (
    <a className="chip" href={url} target="_blank" rel="noreferrer">
      {label}
    </a>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const prisma = await getPrisma();
  const { slug } = await params;
  const person = await prisma.user.findUnique({ where: { slug } });
  if (!person) return { title: "Not found · Open Tool Cafe" };
  const title = `${person.name || person.slug} · Open Tool Cafe`;
  const description = person.bio || person.offering || `Builder at Open Tool Cafe. @${person.slug}`;
  return {
    title,
    description,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const prisma = await getPrisma();
  const { slug } = await params;
  const person = await prisma.user.findUnique({
    where: { slug },
    include: {
      listings: { orderBy: { number: "asc" } },
      takes: { include: { listing: true }, orderBy: { createdAt: "desc" } },
      posts: { orderBy: { createdAt: "desc" }, take: 20 },
      _count: { select: { followers: true, following: true, posts: true, listings: true } },
    },
  });
  if (!person) notFound();
  const me = await getSessionUser();
  const isMe = me?.id === person.id;
  const following = Boolean(
    me &&
      (await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: me.id, followingId: person.id } },
      })),
  );

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-5 py-8 boot">
      <section className="profile-hero mb-8">
        <div className="profile-cover" aria-hidden="true" />
        <div className="px-5 pb-6 -mt-12">
          <Avatar name={person.name || person.slug} src={person.avatarUrl} size={112} />
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mt-4">
            <div>
              <h1 className="display text-4xl sm:text-5xl">{person.name || person.slug}</h1>
              <p className="font-mono text-dim mt-1">@{person.slug}</p>
            </div>
            <div className="flex gap-2">
              {isMe ? (
                <Link href="/you" className="btn btn-ghost sm:w-auto no-underline">
                  Edit
                </Link>
              ) : me ? (
                <>
                  <FollowButton slug={person.slug} following={following} />
                  <Link href={`/mail/${person.slug}`} className="btn sm:w-auto no-underline">
                    Message
                  </Link>
                </>
              ) : (
                <Link href="/join" className="btn sm:w-auto no-underline">
                  Follow
                </Link>
              )}
            </div>
          </div>
          {person.bio && <p className="mt-4 text-lg">{person.bio}</p>}
          {person.offering && <p className="mt-2">Can help: {person.offering}</p>}
          {person.lookingFor && <p className="text-dim">Looking for: {person.lookingFor}</p>}
          {person.skills && <p className="font-mono text-[12px] text-mark mt-2">{person.skills}</p>}
          <p className="mt-4 font-mono text-sm">
            <strong>{person._count.followers}</strong> followers · <strong>{person._count.following}</strong>{" "}
            following · <strong>{person._count.posts}</strong> posts · <strong>{person._count.listings}</strong>{" "}
            tools
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {ext(person.github, "GitHub")}
            {ext(person.x, "X")}
            {ext(person.huggingface, "Hugging Face")}
            {ext(person.linkedin, "LinkedIn")}
            {ext(person.website, "Site")}
          </div>
        </div>
      </section>

      <h2 className="display text-2xl mb-3">On the board</h2>
      {person.posts.length === 0 ? (
        <p className="text-dim">No pins yet.</p>
      ) : (
        <ul className="space-y-2 mb-10">
          {person.posts.map((p) => (
            <li key={p.id}>
              <Link href={`/board/${p.id}`} className="ticket p-3 block no-underline">
                <span className="font-mono text-[11px] text-mark">{p.kind}</span>
                <div className="display text-xl">{p.title}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2 className="display text-2xl mb-3">Listed</h2>
      {person.listings.length === 0 ? (
        <p className="text-dim">None.</p>
      ) : (
        <ul className="space-y-2 mb-10">
          {person.listings.map((l) => (
            <li key={l.id}>
              <Link href={`/l/${l.slug}`} className="ticket p-3 block no-underline">
                #{padTicket(l.number)} {l.name}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2 className="display text-2xl mb-3">Ordered</h2>
      {person.takes.length === 0 ? (
        <p className="text-dim">None.</p>
      ) : (
        <ul className="space-y-2">
          {person.takes.map((t) => (
            <li key={t.id}>
              <Link href={`/l/${t.listing.slug}`}>{t.listing.name}</Link>
            </li>
          ))}
        </ul>
      )}

      {person.takesMeetings && me && me.id !== person.id && (
        <form action={bookMeeting} className="ticket p-6 mt-10 space-y-3 max-w-md">
          <h2 className="display text-xl">Book a meeting</h2>
          <input type="hidden" name="toUserId" value={person.id} />
          <label className="lbl" htmlFor="profile-meet-kind">
            kind
          </label>
          <select id="profile-meet-kind" name="kind" className="field">
            <option value="buy">Need help</option>
            <option value="sell">Offer help</option>
          </select>
          <label className="lbl" htmlFor="profile-meet-note">
            note
          </label>
          <textarea id="profile-meet-note" name="note" className="field" rows={3} />
          <button className="btn" type="submit">
            Book
          </button>
        </form>
      )}
    </main>
  );
}
