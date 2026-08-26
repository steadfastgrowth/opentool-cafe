import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
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
  return NextResponse.redirect(listing.officialUrl, { status: 302 });
}
