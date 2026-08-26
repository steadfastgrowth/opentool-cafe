import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { notifyDesk } from "@/lib/notify";

export async function GET(req: NextRequest) {
  const expected = (process.env.DESK_CRON_SECRET || "").trim();
  const got = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!expected || got !== expected) {
    return NextResponse.json({ error: "no" }, { status: 401 });
  }
  const prisma = await getPrisma();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [users, events, takes, tips] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: since } } }),
    prisma.event.groupBy({
      by: ["name"],
      where: { createdAt: { gte: since } },
      _count: { name: true },
    }),
    prisma.take.count({ where: { createdAt: { gte: since } } }),
    prisma.tip.count({ where: { createdAt: { gte: since }, status: "paid" } }),
  ]);
  const totalPeople = await prisma.user.count();
  const ev = Object.fromEntries(events.map((e: { name: string; _count: { name: number } }) => [e.name, e._count.name]));
  const text = [
    "Last 24h at opentool.cafe",
    `new regulars: ${users}`,
    `takes: ${takes}`,
    `paid tips: ${tips}`,
    `page views: ${ev.page_view || 0}`,
    `outbound: ${ev.outbound || 0}`,
    `joins github/password/code: ${ev.join_github || 0}/${ev.join_password || 0}/${ev.join_code || 0}`,
    `people total: ${totalPeople}`,
    "https://opentool.cafe/admin",
  ].join("\n");
  await notifyDesk("Cafe: daily ticket", text);
  return NextResponse.json({ ok: true, users, takes, tips, events: ev, totalPeople });
}
