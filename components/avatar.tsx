export function Avatar({
  name,
  src,
  size = 96,
}: {
  name: string;
  src?: string | null;
  size?: number;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className="object-cover border-2 border-paper shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="inline-flex items-center justify-center border-2 border-paper bg-foam shrink-0 font-mono"
      style={{ width: size, height: size, fontSize: Math.max(12, Math.round(size * 0.32)) }}
      aria-hidden
    >
      {initials || "?"}
    </div>
  );
}
