export const FOUNDING_LIMIT = 100;

export async function takeFoundingSeat(prisma: {
  user: { count: (args: { where: { founding: boolean } }) => Promise<number> };
}): Promise<boolean> {
  const taken = await prisma.user.count({ where: { founding: true } });
  return taken < FOUNDING_LIMIT;
}
