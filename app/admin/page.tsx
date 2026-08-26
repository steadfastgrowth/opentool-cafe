import { getPrisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { adminPasswordOk, isAdmin, setAdminCookie } from "@/lib/admin";
import { clientIp } from "@/lib/request";
import { rateLimit, WINDOW_15M } from "@/lib/rate-limit";
import type { Metadata } from "next";
import { Stage } from "@/components/stage";

export const metadata: Metadata = { robots: { index: false, follow: false } };

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
      <Stage label="Desk" wide={false}>
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
      </Stage>
    );
  }

  const prisma = await getPrisma();
  const since1 = new Date(Date.now() - 864e5);
  const since7 = new Date(Date.now() - 7 * 864e5);
  const since14 = new Date(Date.now() - 14 * 864e5);

  const [listings, users, meetings, viewsAll, windowEvents, tips] = await Promise.all([
    prisma.listing.findMany({
      orderBy: { number: "asc" },
      include: { _count: { select: { clicks: true, takes: true } } },
    }),
    prisma.user.count(),
    prisma.meetingRequest.count(),
    prisma.event.count({ where: { name: "page_view" } }),
    prisma.event.findMany({
      where: { createdAt: { gte: since14 } },
      select: { name: true, path: true, ref: true, visitorId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 8000,
    }),
    prisma.tip.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  const views1 = windowEvents.filter((e) => e.name === "page_view" && e.createdAt >= since1).length;
  const views7 = windowEvents.filter((e) => e.name === "page_view" && e.createdAt >= since7).length;
  const uniq7 = new Set(
    windowEvents.filter((e) => e.name === "page_view" && e.createdAt >= since7 && e.visitorId).map((e) => e.visitorId),
  ).size;
  const joins7 = windowEvents.filter((e) => e.name.startsWith("join_") && e.createdAt >= since7).length;

  const byDay = new Map<string, number>();
  for (const e of windowEvents) {
    if (e.name !== "page_view") continue;
    const d = e.createdAt.toISOString().slice(0, 10);
    byDay.set(d, (byDay.get(d) || 0) + 1);
  }
  const days = [...byDay.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 14);

  const paths = new Map<string, number>();
  const refs = new Map<string, number>();
  for (const e of windowEvents.filter((x) => x.name === "page_view" && x.createdAt >= since7)) {
    if (e.path) paths.set(e.path, (paths.get(e.path) || 0) + 1);
    if (e.ref) refs.set(e.ref, (refs.get(e.ref) || 0) + 1);
  }
  const topPaths = [...paths.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
  const topRefs = [...refs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

  const names = new Map<string, number>();
  for (const e of windowEvents) names.set(e.name, (names.get(e.name) || 0) + 1);
  const eventRows = [...names.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <Stage label="Desk">
      <h1 className="display text-4xl mb-2">Desk</h1>
      <p className="text-dim mb-8">First-party traffic. No Google. Last 14 days of events in the window.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {[
          ["views · 24h", views1],
          ["views · 7d", views7],
          ["visitors · 7d", uniq7],
          ["joins · 7d", joins7],
        ].map(([label, value]) => (
          <div key={String(label)} className="ticket p-4">
            <p className="font-mono text-[11px] text-dim uppercase tracking-widest">{label}</p>
            <p className="display text-3xl mt-1">{value}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-dim mb-8">
        {users} people · {meetings} meetings · {viewsAll} page views all-time
      </p>

      <h2 className="display text-2xl mb-3">Views by day</h2>
      <table className="w-full text-sm mb-10">
        <tbody>
          {days.map(([d, c]) => (
            <tr key={d} className="border-b border-line/40">
              <td className="py-2 font-mono">{d}</td>
              <td>{c}</td>
            </tr>
          ))}
          {days.length === 0 && (
            <tr>
              <td className="py-2 text-dim">No views yet.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div>
          <h2 className="display text-2xl mb-3">Top pages · 7d</h2>
          <table className="w-full text-sm">
            <tbody>
              {topPaths.map(([p, c]) => (
                <tr key={p} className="border-b border-line/40">
                  <td className="py-2 font-mono">{p}</td>
                  <td>{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h2 className="display text-2xl mb-3">Referrers · 7d</h2>
          <table className="w-full text-sm">
            <tbody>
              {topRefs.length === 0 ? (
                <tr>
                  <td className="py-2 text-dim">Direct / none yet.</td>
                </tr>
              ) : (
                topRefs.map(([p, c]) => (
                  <tr key={p} className="border-b border-line/40">
                    <td className="py-2 font-mono">{p}</td>
                    <td>{c}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="display text-2xl mb-3">Events · 14d</h2>
      <table className="w-full text-sm mb-10">
        <tbody>
          {eventRows.map(([name, c]) => (
            <tr key={name} className="border-b border-line/40">
              <td className="py-2">{name}</td>
              <td>{c}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="display text-2xl mb-3">Tools</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-line">
            <th className="py-2" scope="col">
              #
            </th>
            <th scope="col">tool</th>
            <th scope="col">clicks</th>
            <th scope="col">takes</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((l) => (
            <tr key={l.id} className="border-b border-line/40">
              <td className="py-2">{l.number}</td>
              <td>{l.name}</td>
              <td>{l._count.clicks}</td>
              <td>{l._count.takes}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="display text-2xl mt-10 mb-3">Tips</h2>
      <ul className="text-sm space-y-1">
        {tips.map((t) => (
          <li key={t.id}>
            ${t.amount} · {t.status} · {t.email || "anon"}
          </li>
        ))}
        {tips.length === 0 && <li className="text-dim">None yet.</li>}
      </ul>
    </Stage>
  );
}
