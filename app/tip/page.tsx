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
  return (
    <main className="max-w-md mx-auto px-5 py-16">
      <h1 className="display text-4xl mb-3">Tip jar</h1>
      <p className="mb-6">
        {stripe
          ? "Stripe checkout is on. Card goes through Stripe, then back to the cafe."
          : "Stripe key not set yet — this logs the tip at the desk. Drop STRIPE_SECRET_KEY to take cards."}
      </p>
      {q.ok && <p className="mb-4">Logged. Thanks.</p>}
      {q.err === "amount" && (
        <p className="mb-4" style={{ color: "var(--bad)" }}>
          Pick an amount.
        </p>
      )}
      {q.err === "cancel" && <p className="mb-4">Checkout cancelled.</p>}
      <form action={leaveTip} className="ticket p-6 space-y-3">
        <div>
          <label className="lbl">amount</label>
          <select name="amount" className="field" defaultValue="5">
            <option value="5">$5</option>
            <option value="15">$15</option>
            <option value="50">$50</option>
            <option value="other">other</option>
          </select>
        </div>
        <div>
          <label className="lbl">other amount (USD)</label>
          <input name="otherAmount" className="field" inputMode="decimal" placeholder="25" />
        </div>
        <div>
          <label className="lbl">email</label>
          <input name="email" className="field" defaultValue={me?.email || ""} />
        </div>
        <div>
          <label className="lbl">note</label>
          <input name="note" className="field" />
        </div>
        <button className="btn" type="submit">
          {stripe ? "Pay with Stripe" : "Leave a tip"}
        </button>
      </form>
    </main>
  );
}
