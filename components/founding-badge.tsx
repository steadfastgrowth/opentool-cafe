import { padMember } from "@/lib/founding";

export function FoundingBadge({ n, compact = false }: { n: number | null; compact?: boolean }) {
  const numbered = n != null;
  const label = n === 0 ? "House #000" : numbered ? `Regular #${padMember(n)}` : "House badge";
  return (
    <span className={compact ? "founding-badge founding-badge-sm" : "founding-badge"} title={label}>
      <span className="founding-badge-face" aria-hidden>
        {numbered ? `#${padMember(n)}` : "\u00a0"}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
