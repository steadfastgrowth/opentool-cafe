import { JoinForm } from "@/components/join-form";
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
  return (
    <main className="max-w-md mx-auto px-5 py-16">
      <h1 className="display text-4xl mb-6">Join</h1>
      {q.err === "email" && <p className="text-sm mb-3" style={{ color: "var(--bad)" }}>Need a real email.</p>}
      {q.err === "link" && <p className="text-sm mb-3" style={{ color: "var(--bad)" }}>Link expired. Ask again.</p>}
      <div className="ticket p-6">
        <JoinForm />
      </div>
    </main>
  );
}
