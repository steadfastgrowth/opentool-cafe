import { getPrisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { adminPasswordOk, isAdmin, setAdminCookie } from "@/lib/admin";
import { clientIp } from "@/lib/request";
import { rateLimit, WINDOW_15M } from "@/lib/rate-limit";

async function login(formData: FormData) {
  "use server";
  const ip = await clientIp();
  const gated = await rateLimit(`admin:ip:${ip}`, 8, WINDOW_15M);
  if (!gated.ok) redirect("/admin?err=1");
  const password = String(formData.get("password") || "");
  if (!adminPasswordOk(password)) {
    redirect("/admin?err=1");
  }
  const ok = await setAdminCookie();
  if (!ok) redirect("/admin?err=1");
  redirect("/admin");
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const q = await searchParams;
  const ok = await isAdmin();
  if (!ok) {
    return (
      <main className="max-w-sm mx-auto px-5 py-16">
        <h1 className="display text-3xl mb-4">Desk</h1>
        {q.err && (
          <p className="text-sm mb-3" role="alert">
            Wrong password.
          </p>
        )}
        <form action={login} className="ticket p-6 space-y-3">
          <label className="lbl" htmlFor="admin-password">
            password
          </label>
          <input id="admin-password" name="password" type="password" className="field" autoComplete="current-password" />
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
  const events = await prisma.event.groupBy({
    by: ["name"],
    _count: { name: true },
    orderBy: { _count: { name: "desc" } },
  });
  const recent = await prisma.event.findMany({ orderBy: { createdAt: "desc" }, take: 40 });
  const views = events.find((e) => e.name === "page_view")?._count.name || 0;
  const outbound = events.find((e) => e.name === "outbound")?._count.name || 0;
  return (
    <main className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="display text-4xl mb-4">Desk</h1>
      <p className="mb-6 text-sm">
        {users} people · {meetings} meetings · {views} page views · {outbound} outbound clicks
      </p>
      <h2 className="display text-2xl mb-3">Events</h2>
      <table className="w-full text-sm mb-10">
        <caption className="sr-only">Site event counts</caption>
        <thead>
          <tr className="text-left border-b border-line">
            <th className="py-2" scope="col">
              event
            </th>
            <th scope="col">count</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.name} className="border-b border-line/40">
              <td className="py-2">{e.name}</td>
              <td>{e._count.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="display text-2xl mb-3">Tools</h2>
      <table className="w-full text-sm">
        <caption className="sr-only">Listing click and take counts</caption>
        <thead>
          <tr className="text-left border-b border-line">
            <th className="py-2" scope="col">
              #
            </th>
            <th scope="col">tool</th>
            <th scope="col">clicks</th>
            <th scope="col">takes</th>
            <th scope="col">claimed</th>
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
      <h2 className="display text-2xl mt-10 mb-3">Recent</h2>
      <ul className="text-sm space-y-1 font-mono">
        {recent.map((e) => (
          <li key={e.id}>
            {e.name}
            {e.path ? ` · ${e.path}` : ""}
          </li>
        ))}
      </ul>
      <h2 className="display text-2xl mt-10 mb-3">Tips</h2>
      <ul className="text-sm space-y-1">
        {tips.map((t) => (
          <li key={t.id}>
            ${t.amount} · {t.status} · {t.email || "anon"}
          </li>
        ))}
      </ul>
    </main>
  );
}
