export function FoundingStar({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={compact ? "founding-star founding-star-sm" : "founding-star"}
      title="One of the first 100 regulars"
    >
      <span className="founding-star-glyph" aria-hidden>
        ★
      </span>
      {compact ? null : <span className="founding-star-label">first 100</span>}
      <span className="sr-only">First 100 regular</span>
    </span>
  );
}
