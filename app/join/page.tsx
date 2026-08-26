import { Link } from "@/components/link";
import { JoinForm } from "@/components/join-form";
import { OAuthButtons } from "@/components/oauth-buttons";
import { getSessionUser, rememberNext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Stage } from "@/components/stage";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string; next?: string }>;
}) {
  const me = await getSessionUser();
  if (me) redirect("/you");
  const q = await searchParams;
  await rememberNext(q.next);
  const err = {
    email: "Need a real email.",
    link: "Code or link expired. Ask again.",
    oauth: "GitHub didn't finish.",
    mail: "Could not send the login email. Try password, or wait and retry.",
    password: "Password needs at least 8 characters.",
    match: "Passwords didn't match.",
    exists: "That email already has a password. Sign in.",
    usecode: "That email already has an account. Use GitHub or email a code, then set a password on /you.",
    login: "Email or password didn't match.",
    rate: "Too many tries. Wait a few minutes.",
  }[q.err || ""];
  return (
    <Stage label="Join" wide={false}>
      <h1 className="display text-4xl mb-3">Join the cafe</h1>
      <p className="text-dim mb-6">GitHub, or email with a password you confirm.</p>
      {err && (
        <p className="text-sm mb-3" style={{ color: "var(--bad)" }}>
          {err}
        </p>
      )}
      <div className="ticket p-6 space-y-5">
        <OAuthButtons />
        <p className="font-mono text-[11px] tracking-widest uppercase text-dim">or email</p>
        <JoinForm />
      </div>
      <p className="mt-4 text-sm text-dim">
        By joining you agree to the <Link href="/rules">rules</Link>, <Link href="/terms">terms</Link>, and{" "}
        <Link href="/privacy">privacy</Link> policy.
      </p>
      <p className="mt-6 text-sm text-dim">
        Already have a seat? <Link href={q.next ? `/login?next=${encodeURIComponent(q.next)}` : "/login"}>Login</Link>
      </p>
    </Stage>
  );
}
