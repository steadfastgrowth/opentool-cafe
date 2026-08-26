import { Link } from "@/components/link";
import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/db";
import { getSessionUser, padTicket, tagList, githubOwnerFromUrl } from "@/lib/auth";
import { bookMeeting, claimListing, takeListing } from "@/app/actions";
import { JoinForm } from "@/components/join-form";

export default async function ListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ err?: string }>;
}) {
  const prisma = await getPrisma();
  const { slug } = await params;
  const q = await searchParams;
  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: { owner: true },
  });
  if (!listing) notFound();
  const me = await getSessionUser();
  const ownerPath = githubOwnerFromUrl(listing.officialUrl);
  const canClaim =
    me &&
    ownerPath &&
    me.githubHandle &&
    ownerPath === me.githubHandle.toLowerCase() &&
    (!listing.claimed || listing.ownerId === me.id);
  const alreadyTook =
    me &&
    (await prisma.take.findUnique({
      where: { listingId_userId: { listingId: listing.id, userId: me.id } },
    }));

  return (
    <main className="max-w-3xl mx-auto px-5 py-10">
      <Link href="/find" className="text-sm text-mute">
        ← the menu
      </Link>
      <p className="display text-xs text-mute mt-4">ticket · {listing.slug}</p>
      <h1 className="display text-5xl font-semibold mt-1">{listing.name}</h1>
      <p className="text-lg mt-3">{listing.oneLiner}</p>
      <p className="text-sm text-mute mt-2">{tagList(listing.tags).join(" · ")}</p>
      <p className="mt-4">{listing.body}</p>
      {listing.owner && (
        <p className="mt-4 text-sm">
          Listed by{" "}
          <Link className="underline" href={`/u/${listing.owner.slug}`}>
            {listing.owner.name || listing.owner.slug}
          </Link>
          {listing.claimed ? " · claimed" : " · unclaimed github"}
        </p>
      )}
      {q.err === "github" && (
        <p className="mt-3 text-sm" style={{ color: "var(--bad)" }}>
          GitHub handle on the profile has to match the repo owner.
        </p>
      )}
      {q.err === "claimed" && (
        <p className="mt-3 text-sm" style={{ color: "var(--bad)" }}>
          Already claimed.
        </p>
      )}

      <div className="flex flex-wrap gap-3 mt-8">
        {me ? (
          <form action={takeListing.bind(null, listing.id)}>
            <button className="btn" type="submit">
              {alreadyTook ? "Open again" : "Take"}
            </button>
          </form>
        ) : (
          <Link className="btn" href="/join">
            Take
          </Link>
        )}
        <a className="btn btn-ghost" href={`/out/${listing.slug}`} target="_blank" rel="noreferrer">
          Open tool
        </a>
        {canClaim && !listing.claimed && (
          <form action={claimListing.bind(null, listing.id)}>
            <button className="btn btn-ghost" type="submit">
              Claim
            </button>
          </form>
        )}
      </div>

      {!me && (
        <div className="ticket p-6 mt-10 max-w-md">
          <JoinForm />
        </div>
      )}

      {listing.owner && listing.owner.takesMeetings && me && me.id !== listing.owner.id && (
        <form action={bookMeeting} className="ticket p-6 mt-10 space-y-3 max-w-md">
          <h2 className="display text-xl">Book a meeting</h2>
          <input type="hidden" name="toUserId" value={listing.owner.id} />
          <input type="hidden" name="listingId" value={listing.id} />
          <select name="kind" className="field" id="meet-kind" aria-label="Meeting type">
            <option value="buy">Need help installing</option>
            <option value="sell">Offer to install</option>
          </select>
          <label className="lbl" htmlFor="meet-note">
            note
          </label>
          <textarea id="meet-note" name="note" className="field" rows={3} />
          <button className="btn" type="submit">
            Book
          </button>
        </form>
      )}
    </main>
  );
}
