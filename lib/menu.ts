export function menuSort<T>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const ac = Number(Boolean((a as { claimed?: unknown }).claimed));
    const bc = Number(Boolean((b as { claimed?: unknown }).claimed));
    if (ac !== bc) return bc - ac;
    const an = Number((a as { number?: unknown }).number || 0);
    const bn = Number((b as { number?: unknown }).number || 0);
    return an - bn;
  });
}
