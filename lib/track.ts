import { getPrisma } from "./db";

export async function track(
  name: string,
  opts?: { path?: string | null; listingId?: string | null; userId?: string | null },
) {
  try {
    const prisma = await getPrisma();
    await prisma.event.create({
      data: {
        name: name.slice(0, 64),
        path: opts?.path?.slice(0, 240) || null,
        listingId: opts?.listingId || null,
        userId: opts?.userId || null,
      },
    });
  } catch {
    // never break the request for analytics
  }
}
