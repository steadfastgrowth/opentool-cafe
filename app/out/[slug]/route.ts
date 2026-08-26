import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { track } from "@/lib/track";
import { hostAllowed, parseHttpUrl } from "@/lib/urls";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const prisma = await getPrisma();
  const { slug } = await params;
  const listing = await prisma.listing.findUnique({ where: { slug } });
  if (!listing) {
    return NextResponse.redirect(new URL("/find", req.url));
  }
  const dest = parseHttpUrl(listing.officialUrl);
  if (!dest) {
    return NextResponse.redirect(new URL("/find", req.url));
  }
  if (!hostAllowed(listing.officialUrl)) {
    return NextResponse.redirect(new URL(`/leave/${slug}`, req.url));
  }
  const me = await getSessionUser();
  await prisma.click.create({
    data: {
      listingId: listing.id,
      userId: me?.id,
      referrer: (req.headers.get("referer") || "").slice(0, 240) || null,
    },
  });
  await track("outbound", { path: `/out/${slug}`, listingId: listing.id, userId: me?.id });
  return NextResponse.redirect(dest.toString(), { status: 302 });
}
