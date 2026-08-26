import Link from "next/link";

export function Footer() {
  return (
    <footer className="max-w-5xl mx-auto px-5 py-10 text-xs text-dim flex flex-wrap gap-x-4 gap-y-2">
      <span>Session cookie only.</span>
      <Link href="/privacy">privacy</Link>
      <Link href="/terms">house rules</Link>
      <a href="https://github.com/steadfastgrowth/opentool-cafe" rel="noreferrer">
        source
      </a>
    </footer>
  );
}
