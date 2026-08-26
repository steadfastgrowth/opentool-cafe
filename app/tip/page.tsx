import { leaveTip } from "@/app/actions";
import { getSessionUser } from "@/lib/auth";

export default async function TipPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const me = await getSessionUser();
  const q = await searchParams;
  const stripe = Boolean(process.env.STRIPE_SECRET_KEY);
  const xTip = process.env.TIP_X_URL || "";
  return (
    <main className="max-w-xl mx-auto px-4 sm:px-5 py-12">
      <div className="tip-banner mb-8">
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase">The jar</p>
        <h1 className="display text-5xl mt-2">Leave a tip</h1>
        <p className="mt-3 text-lg">
          Keeps the lights on. X money if you have it. Card if you don&apos;t.
        </p>
      </div>
      {q.ok && <p className="mb-4">Logged. Thanks.</p>}
      {q.err === "amount" && (
        <p className="mb-4" role="alert">
          Pick an amount.
        </p>
      )}
      {q.err === "cancel" && <p className="mb-4">Checkout cancelled.</p>}

      {xTip && (
        <a className="btn mb-6 no-underline" href={xTip} rel="noreferrer">
          Tip on X
        </a>
      )}

      <form action={leaveTip} className="ticket p-6 space-y-4">
        <div>
          <label className="lbl" htmlFor="tip-amount">
            amount
          </label>
          <select id="tip-amount" name="amount" className="field" defaultValue="5">
            <option value="5">$5</option>
            <option value="15">$15</option>
            <option value="50">$50</option>
            <option value="other">other</option>
          </select>
        </div>
        <div>
          <label className="lbl" htmlFor="tip-other">
            other amount (USD)
          </label>
          <input id="tip-other" name="otherAmount" className="field" inputMode="decimal" />
        </div>
        <div>
          <label className="lbl" htmlFor="tip-email">
            email
          </label>
          <input id="tip-email" name="email" className="field" defaultValue={me?.email || ""} autoComplete="email" />
        </div>
        <div>
          <label className="lbl" htmlFor="tip-note">
            note
          </label>
          <input id="tip-note" name="note" className="field" />
        </div>
        <button className="btn" type="submit">
          {stripe ? "Pay with card" : "Leave a tip"}
        </button>
        {!stripe && (
          <p className="text-sm text-dim">
            Card checkout is off until Stripe is set. This still logs the tip at the desk. Send the X money
            profile URL and I&apos;ll put it on the big button.
          </p>
        )}
      </form>
    </main>
  );
}
