import { getPrisma } from "./db";

export async function rateLimit(key: string, limit: number, windowMs: number) {
  const prisma = await getPrisma();
  const now = Date.now();
  const row = await prisma.rateLimit.findUnique({ where: { key } });
  if (!row || row.resetAt.getTime() <= now) {
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, resetAt: new Date(now + windowMs) },
      update: { count: 1, resetAt: new Date(now + windowMs) },
    });
    return { ok: true, remaining: limit - 1 };
  }
  if (row.count >= limit) {
    return { ok: false, remaining: 0 };
  }
  await prisma.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });
  return { ok: true, remaining: limit - row.count - 1 };
}

export const WINDOW_15M = 15 * 60 * 1000;
export const WINDOW_1M = 60 * 1000;
