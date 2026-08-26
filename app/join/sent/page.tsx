import { verifyLoginCode } from "@/app/actions";

export default async function SentPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; err?: string }>;
}) {
  const q = await searchParams;
  const email = q.email || "";
  return (
    <main className="max-w-md mx-auto px-5 py-16">
      <h1 className="display text-4xl mb-4">Check your email</h1>
      <p className="mb-6">
        We sent a 6-digit code{email ? ` to ${email}` : ""}. Same mail has a login link.
      </p>
      {q.err === "code" && (
        <p className="text-sm mb-3" style={{ color: "var(--bad)" }}>
          That code didn&apos;t work. Try again or request a new one.
        </p>
      )}
      <form action={verifyLoginCode} className="ticket p-6 space-y-4">
        <input type="hidden" name="email" value={email} />
        <div>
          <label className="lbl" htmlFor="code">
            6-digit code
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            className="field"
          />
        </div>
        <button className="btn" type="submit">
          Enter the cafe
        </button>
      </form>
    </main>
  );
}
