import { getSessionUser } from "@/lib/auth";
import { stripeReady } from "@/lib/stripe";
import { TipCheckout } from "@/components/tip-checkout";

export default async function TipPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string; session_id?: string }>;
}) {
  const me = await getSessionUser();
  const q = await searchParams;
  const xTip = process.env.TIP_X_URL || "";
  const stripe = stripeReady();
  return (
    <main className="max-w-xl mx-auto px-4 sm:px-5 py-12">
      <div className="tip-banner mb-8">
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase">The jar</p>
        <h1 className="display text-5xl mt-2">Leave a tip</h1>
        <p className="mt-3 text-lg">Keeps the lights on. Card on this page.</p>
      </div>
      {q.ok && <p className="mb-4">Thanks.</p>}
      {q.err === "cancel" && <p className="mb-4">Checkout cancelled.</p>}

      {xTip && (
        <a className="btn mb-6 no-underline" href={xTip} rel="noreferrer">
          Tip on X
        </a>
      )}

      {stripe ? (
        <TipCheckout emailDefault={me?.email || ""} />
      ) : (
        <p className="text-sm text-dim">Card checkout is off until Stripe is set on the Worker.</p>
      )}
    </main>
  );
}
