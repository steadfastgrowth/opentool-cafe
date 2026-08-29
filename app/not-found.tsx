import { Link } from "@/components/link";

export default function NotFound() {
  return (
    <main className="max-w-xl mx-auto px-4 py-16">
      <h1 className="display text-4xl mb-3">Ticket not found</h1>
      <p className="text-dim mb-6">That seat is empty. Try the board or the menu.</p>
      <div className="flex flex-col sm:flex-row gap-3 max-w-md">
        <Link href="/" className="btn no-underline sm:w-auto">
          Home
        </Link>
        <Link href="/board" className="btn btn-ghost no-underline sm:w-auto">
          Board
        </Link>
        <Link href="/find" className="btn btn-ghost no-underline sm:w-auto">
          Menu
        </Link>
      </div>
    </main>
  );
}
