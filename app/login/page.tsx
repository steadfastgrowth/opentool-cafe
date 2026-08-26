import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { OAuthButtons } from "@/components/oauth-buttons";
import { getSessionUser, rememberNext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Stage } from "@/components/stage";

export default async function LoginPage({
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
    login: "Email or password didn't match.",
    rate: "Too many tries. Wait a few minutes.",
  }[q.err || ""];
  return (
    <Stage label="Login" wide={false}>
      <h1 className="display text-4xl mb-3">Login</h1>
      <p className="text-dim mb-6">GitHub, email and password, or a 6-digit code.</p>
      {err && (
        <p className="text-sm mb-3" style={{ color: "var(--bad)" }}>
          {err}
        </p>
      )}
      <div className="ticket p-6 space-y-5">
        <OAuthButtons />
        <p className="font-mono text-[11px] tracking-widest uppercase text-dim">or email</p>
        <LoginForm />
      </div>
      <p className="mt-6 text-sm text-dim">
        New here? <Link href={q.next ? `/join?next=${encodeURIComponent(q.next)}` : "/join"}>Join</Link>
      </p>
    </Stage>
  );
}
