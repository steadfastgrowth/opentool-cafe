import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser, padTicket } from "@/lib/auth";
import { bookMeeting } from "@/app/actions";

function ext(href: string | null, label: string) {
  if (!href) return null;
  const url = href.startsWith("http") ? href : `https://${href}`;
  return (
    <a className="underline mr-3" href={url} rel="noreferrer">
      {label}
    </a>
  );
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const person = await prisma.user.findUnique({
    where: { slug },
    include: {
      listings: { orderBy: { number: "asc" } },
      takes: { include: { listing: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!person) notFound();
  const me = await getSessionUser();

  return (
    <main className="max-w-3xl mx-auto px-5 py-10">
      <h1 className="display text-5xl">{person.name || person.slug}</h1>
      {person.bio && <p className="mt-3 text-lg">{person.bio}</p>}
      <p className="mt-4 text-sm">
        {ext(person.github, "GitHub")}
        {ext(person.x, "X")}
        {ext(person.huggingface, "Hugging Face")}
        {ext(person.linkedin, "LinkedIn")}
        {ext(person.website, "Site")}
      </p>

      <h2 className="display text-2xl mt-10 mb-3">Listed</h2>
      {person.listings.length === 0 ? (
        <p className="text-mute">None.</p>
      ) : (
        <ul className="space-y-2">
          {person.listings.map((l) => (
            <li key={l.id}>
              <Link href={`/l/${l.slug}`}>
                #{padTicket(l.number)} {l.name}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2 className="display text-2xl mt-10 mb-3">Taken</h2>
      {person.takes.length === 0 ? (
        <p className="text-mute">None.</p>
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
          <select name="kind" className="field">
            <option value="buy">Need help</option>
            <option value="sell">Offer help</option>
          </select>
          <textarea name="note" className="field" rows={3} />
          <button className="btn" type="submit">
            Book
          </button>
        </form>
      )}
    </main>
  );
}
