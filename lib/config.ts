export function appUrl(reqUrl?: string) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  if (reqUrl) return new URL(reqUrl).origin;
  return "http://127.0.0.1:4330";
}

export function stripeEnabled() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
