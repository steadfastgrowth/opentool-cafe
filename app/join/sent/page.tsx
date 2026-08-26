import Link from "next/link";

export default async function SentPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; opt?: string }>;
}) {
  const q = await searchParams;
  const reveal = process.env.AUTH_DEV_REVEAL === "1";
  const href =
    q.t ? `/auth/magic?token=${encodeURIComponent(q.t)}&opt=${q.opt === "1" ? "1" : "0"}` : "/join";
  return (
    <main className="max-w-md mx-auto px-5 py-16">
      <h1 className="display text-4xl mb-4">Check the desk</h1>
      <p className="mb-6">A login link was made for that email.</p>
      {reveal && q.t ? (
        <p>
          Local only: <Link className="underline" href={href}>open the link</Link>
        </p>
      ) : (
        <p className="text-mute text-sm">Mail is not wired yet. AUTH_DEV_REVEAL prints the link in local.</p>
      )}
    </main>
  );
}
