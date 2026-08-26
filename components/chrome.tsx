import Link from "next/link";

export function Chrome({
  signedIn,
  slug,
}: {
  signedIn: boolean;
  slug: string | null;
}) {
  return (
    <header className="border-b border-line px-5 py-3 flex items-center justify-between gap-4">
      <Link href="/" className="display font-semibold tracking-wide text-lg">
        opentool.cafe
      </Link>
      <nav className="flex gap-4 items-center">
        <Link className="nav-link" href="/">
          cafe
        </Link>
        <Link className="nav-link" href="/list">
          makers
        </Link>
        <Link className="nav-link" href="/find">
          board
        </Link>
        <Link className="nav-link" href="/people">
          people
        </Link>
        <Link className="nav-link" href={signedIn ? "/you" : "/join"}>
          {signedIn ? slug || "you" : "you"}
        </Link>
      </nav>
    </header>
  );
}
