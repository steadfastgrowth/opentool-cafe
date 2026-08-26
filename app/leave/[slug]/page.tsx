import { Link } from "@/components/link";
import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/db";
import { parseHttpUrl } from "@/lib/urls";

export default async function LeavePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const prisma = await getPrisma();
  const listing = await prisma.listing.findUnique({ where: { slug } });
  if (!listing) notFound();
  const dest = parseHttpUrl(listing.officialUrl);
  if (!dest) notFound();
  return (
    <main className="max-w-md mx-auto px-5 py-16">
      <h1 className="display text-4xl mb-4">Leaving the cafe</h1>
      <p className="mb-4">
        This tool is hosted at <span className="font-mono">{dest.hostname}</span>, not on the usual
        GitHub / Hugging Face list.
      </p>
      <p className="text-sm text-dim mb-6">{dest.toString()}</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <a className="btn no-underline" href={dest.toString()} target="_blank" rel="noreferrer">
          Continue
        </a>
        <Link className="btn btn-ghost no-underline" href={`/l/${slug}`}>
          Back
        </Link>
      </div>
    </main>
  );
}
