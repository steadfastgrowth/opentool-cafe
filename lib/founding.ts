export const HOST_SLUG = "steadfast";
export const FOUNDING_LIMIT = 100;

export function padMember(n: number) {
  return String(n).padStart(3, "0");
}

export async function nextMemberSeat(
  prisma: {
    user: {
      aggregate: (args: { _max: { memberNumber: true } }) => Promise<{ _max: { memberNumber: number | null } }>;
    };
  },
  slug: string,
): Promise<{ founding: boolean; memberNumber: number | null }> {
  if (slug === HOST_SLUG) return { founding: true, memberNumber: 0 };
  const agg = await prisma.user.aggregate({ _max: { memberNumber: true } });
  const max = agg._max.memberNumber;
  const n = max == null ? 1 : max + 1;
  return { founding: n <= FOUNDING_LIMIT, memberNumber: n };
}
