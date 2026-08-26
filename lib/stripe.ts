function secret() {
  return (process.env.STRIPE_SECRET_KEY || "").trim();
}

export function stripeReady() {
  return secret().startsWith("sk_");
}

export function stripePublishable() {
  return (process.env.STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "").trim();
}

export async function stripeForm(path: string, body: Record<string, string>) {
  const key = secret();
  if (!key) throw new Error("stripe off");
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body),
  });
  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const err = json.error as { message?: string } | undefined;
    throw new Error(err?.message || `stripe ${res.status}`);
  }
  return json;
}
