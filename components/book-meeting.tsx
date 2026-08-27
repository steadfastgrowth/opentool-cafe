import { bookMeeting } from "@/app/actions";
import { bookingUrl } from "@/lib/urls";

export function BookMeeting({
  host,
  meId,
  listingId,
  listingCopy = false,
}: {
  host: { id: string; takesMeetings: boolean; calendarUrl: string | null };
  meId: string | null;
  listingId?: string;
  listingCopy?: boolean;
}) {
  if (!host.takesMeetings) return null;
  if (meId && meId === host.id) return null;
  const cal = bookingUrl(host.calendarUrl);
  if (cal) {
    return (
      <div className="ticket p-6 mt-10 space-y-3 max-w-md">
        <h2 className="display text-xl">Book a meeting</h2>
        <a className="btn no-underline" href={cal} target="_blank" rel="noreferrer">
          Book
        </a>
      </div>
    );
  }
  if (!meId) return null;
  return (
    <form action={bookMeeting} className="ticket p-6 mt-10 space-y-3 max-w-md">
      <h2 className="display text-xl">Book a meeting</h2>
      <input type="hidden" name="toUserId" value={host.id} />
      {listingId ? <input type="hidden" name="listingId" value={listingId} /> : null}
      <label className="lbl" htmlFor={listingId ? "meet-kind" : "profile-meet-kind"}>
        kind
      </label>
      <select id={listingId ? "meet-kind" : "profile-meet-kind"} name="kind" className="field">
        {listingCopy ? (
          <>
            <option value="buy">Need help installing</option>
            <option value="sell">Offer to install</option>
          </>
        ) : (
          <>
            <option value="buy">Need help</option>
            <option value="sell">Offer help</option>
          </>
        )}
      </select>
      <label className="lbl" htmlFor={listingId ? "meet-note" : "profile-meet-note"}>
        note
      </label>
      <textarea id={listingId ? "meet-note" : "profile-meet-note"} name="note" className="field" rows={3} />
      <button className="btn" type="submit">
        Book
      </button>
    </form>
  );
}
