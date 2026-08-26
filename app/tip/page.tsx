import { getSessionUser } from "@/lib/auth";
import { stripeReady } from "@/lib/stripe";
import { TipCheckout } from "@/components/tip-checkout";
import { Stage } from "@/components/stage";

export default async function TipPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string; session_id?: string }>;
}) {
  const me = await getSessionUser();
  const q = await searchParams;
  const stripe = stripeReady();
  return (
    <Stage label="The jar" wide={false}>
      <h1 className="display text-4xl mb-3">Leave a tip</h1>
      <p className="text-lg text-dim mb-8">Keeps the lights on. Card on this page.</p>
      {q.ok && <p className="mb-4">Thanks.</p>}
      {q.err === "cancel" && <p className="mb-4">Checkout cancelled.</p>}

      {stripe ? (
        <TipCheckout emailDefault={me?.email || ""} />
      ) : (
        <p className="text-sm text-dim">Card checkout is off until Stripe is set on the Worker.</p>
      )}
    </Stage>
  );
}
