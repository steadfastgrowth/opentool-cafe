import { getPrisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const prisma = await getPrisma();
  const me = await getSessionUser();
  if (!me) return Response.json({ ok: false }, { status: 401 });
  const { slug } = await ctx.params;
  const person = await prisma.user.findUnique({ where: { slug } });
  if (!person || person.id === me.id) return Response.json({ ok: false }, { status: 404 });
  const rows = await prisma.directMessage.findMany({
    where: {
      OR: [
        { fromUserId: me.id, toUserId: person.id },
        { fromUserId: person.id, toUserId: me.id },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: { id: true, body: true, fromUserId: true, createdAt: true },
  });
  return Response.json({
    ok: true,
    messages: rows.map((r: { id: string; body: string; fromUserId: string; createdAt: Date }) => ({
      id: r.id,
      body: r.body,
      from: r.fromUserId === me.id ? me.slug : person.slug,
      at: r.createdAt,
    })),
  });
}
