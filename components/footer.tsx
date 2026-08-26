import Link from "next/link";

const links = [
  { href: "/about", label: "about" },
  { href: "/faq", label: "faq" },
  { href: "/help", label: "help" },
  { href: "/rules", label: "rules" },
  { href: "/terms", label: "terms" },
  { href: "/privacy", label: "privacy" },
  { href: "/tip", label: "tip" },
] as const;

export function Footer() {
  return (
    <footer className="site-footer">
      <nav aria-label="Cafe">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={l.href === "/tip" ? "tip-nav" : undefined}>
            {l.label}
          </Link>
        ))}
        <a href="https://github.com/steadfastgrowth/opentool-cafe" rel="noreferrer">
          source
        </a>
      </nav>
      <p>opentool.cafe · take a seat</p>
    </footer>
  );
}
