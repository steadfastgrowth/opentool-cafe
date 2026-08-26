export function Stage({
  label,
  children,
  wide = true,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <main className={`${wide ? "max-w-6xl" : "max-w-3xl"} mx-auto px-4 sm:px-6 py-8 boot`}>
      <div className="stage">
        <div className="receipt">
          <span className="dots flex gap-1" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          {label}
        </div>
        <div className="p-4 sm:p-10">{children}</div>
      </div>
    </main>
  );
}
