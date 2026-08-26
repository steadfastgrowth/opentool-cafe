import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { verifyStripeSignature } from "@/lib/stripe-webhook";

export async function POST(req: NextRequest) {
  const secret = (process.env.STRIPE_WEBHOOK_SECRET || "").trim();
  const raw = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!verifyStripeSignature(raw, sig, secret)) {
    return NextResponse.json({ error: "sig" }, { status: 400 });
  }
  let event: { type?: string; data?: { object?: { id?: string; metadata?: { tipId?: string } } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "json" }, { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const obj = event.data?.object;
    const tipId = obj?.metadata?.tipId;
    const prisma = await getPrisma();
    if (tipId) {
      await prisma.tip.updateMany({
        where: { id: tipId },
        data: { status: "paid", stripeId: obj?.id || undefined },
      });
    } else if (obj?.id) {
      await prisma.tip.updateMany({
        where: { stripeId: obj.id },
        data: { status: "paid" },
      });
    }
  }
  return NextResponse.json({ ok: true });
}
