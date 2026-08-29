import type { PrismaClient } from "@prisma/client";

type Kind = "like" | "comment" | "follow" | "mail";

export async function pingNotice(
  prisma: PrismaClient,
  input: {
    toUserId: string;
    fromUserId: string;
    kind: Kind;
    href: string;
    postId?: string | null;
  },
) {
  if (input.toUserId === input.fromUserId) return;
  try {
    const existing = await prisma.notice.findFirst({
      where: {
        toUserId: input.toUserId,
        fromUserId: input.fromUserId,
        kind: input.kind,
        href: input.href,
        readAt: null,
      },
    });
    if (existing) return;
    await prisma.notice.create({
      data: {
        toUserId: input.toUserId,
        fromUserId: input.fromUserId,
        kind: input.kind,
        href: input.href,
        postId: input.postId || null,
      },
    });
  } catch {
    // Desk is optional. Do not fail the click.
  }
}

export async function dropUnreadNotice(
  prisma: PrismaClient,
  input: { toUserId: string; fromUserId: string; kind: Kind; href: string },
) {
  try {
    await prisma.notice.deleteMany({
      where: {
        toUserId: input.toUserId,
        fromUserId: input.fromUserId,
        kind: input.kind,
        href: input.href,
        readAt: null,
      },
    });
  } catch {
    // ignore
  }
}

export function noticeLine(kind: string, slug: string) {
  if (kind === "like") return `@${slug} liked your post`;
  if (kind === "comment") return `@${slug} commented on your post`;
  if (kind === "follow") return `@${slug} followed you`;
  if (kind === "mail") return `@${slug} sent mail`;
  return `@${slug}`;
}
