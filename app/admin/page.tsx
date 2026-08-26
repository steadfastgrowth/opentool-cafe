import { cookies } from "next/headers";
import { getPrisma } from "@/lib/db";
import { redirect } from "next/navigation";

async function login(formData: FormData) {
  "use server";
  const password = String(formData.get("password") || "");
  if (password !== (process.env.ADMIN_PASSWORD || "cafe-desk")) {
    redirect("/admin?err=1");
  }
  const jar = await cookies();
  jar.set("opentool_admin", "1", { httpOnly: true, path: "/", maxAge: 60 * 60 * 12 });
  redirect("/admin");
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const q = await searchParams;
  const jar = await cookies();
  const ok = jar.get("opentool_admin")?.value === "1";
  if (!ok) {
    return (
      <main className="max-w-sm mx-auto px-5 py-16">
        <h1 className="display text-3xl mb-4">Desk</h1>
        {q.err && <p className="text-sm mb-3">Wrong password.</p>}
        <form action={login} className="ticket p-6 space-y-3">
          <input name="password" type="password" className="field" placeholder="password" />
          <button className="btn" type="submit">
            Enter
          </button>
        </form>
      </main>
    );
  }
  const prisma = await getPrisma();
  const listings = await prisma.listing.findMany({
    orderBy: { number: "asc" },
    include: { _count: { select: { clicks: true, takes: true } } },
  });
  const users = await prisma.user.count();
  const tips = await prisma.tip.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  const meetings = await prisma.meetingRequest.count();
  return (
    <main className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="display text-4xl mb-4">Desk</h1>
      <p className="mb-6 text-sm">
        {users} people · {meetings} meetings · {tips.length} recent tips
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-line">
            <th className="py-2">#</th>
            <th>tool</th>
            <th>clicks</th>
            <th>takes</th>
            <th>claimed</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((l) => (
            <tr key={l.id} className="border-b border-line/40">
              <td className="py-2">{l.number}</td>
              <td>{l.name}</td>
              <td>{l._count.clicks}</td>
              <td>{l._count.takes}</td>
              <td>{l.claimed ? "yes" : "no"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="display text-2xl mt-10 mb-3">Tips</h2>
      <ul className="text-sm space-y-1">
        {tips.map((t) => (
          <li key={t.id}>
            ${t.amount} · {t.email || "anon"} · {t.note || ""}
          </li>
        ))}
      </ul>
    </main>
  );
}
