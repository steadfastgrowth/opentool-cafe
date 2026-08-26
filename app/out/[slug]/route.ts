import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { track } from "@/lib/track";

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
  const me = await getSessionUser();
  await prisma.click.create({
    data: {
      listingId: listing.id,
      userId: me?.id,
      referrer: req.headers.get("referer"),
    },
  });
  await track("outbound", { path: `/out/${slug}`, listingId: listing.id, userId: me?.id });
  return NextResponse.redirect(listing.officialUrl, { status: 302 });
}
