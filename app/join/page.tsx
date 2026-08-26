import { JoinForm } from "@/components/join-form";
import { OAuthButtons } from "@/components/oauth-buttons";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const me = await getSessionUser();
  if (me) redirect("/you");
  const q = await searchParams;
  const err = {
    email: "Need a real email.",
    link: "Code or link expired. Ask again.",
    oauth: "GitHub didn't finish.",
    mail: "Could not send the login email. Try password, or wait and retry.",
    password: "Password needs at least 8 characters.",
    exists: "That email already has a password. Sign in.",
    usecode: "That email already has an account. Use GitHub or email a code, then set a password on /you.",
    login: "Email or password didn't match.",
    rate: "Too many tries. Wait a few minutes.",
  }[q.err || ""];
  return (
    <main className="max-w-md mx-auto px-5 py-16">
      <h1 className="display text-4xl mb-3">Join the cafe</h1>
      <p className="text-dim mb-6">GitHub, email and password, or a 6-digit code to that inbox.</p>
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
    </main>
  );
}
