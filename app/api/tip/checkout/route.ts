import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { stripeForm, stripePublishable, stripeReady } from "@/lib/stripe";
import { clientIp } from "@/lib/request";
import { rateLimit, WINDOW_15M } from "@/lib/rate-limit";

function centsFrom(amount: string, other: string) {
  const raw = amount === "other" ? other : amount;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1 || n > 500) return 0;
  return Math.round(n * 100);
}

export async function POST(req: NextRequest) {
  if (!stripeReady()) {
    return NextResponse.json({ error: "stripe off" }, { status: 503 });
  }
  const ip = await clientIp();
  const gated = await rateLimit(`checkout:ip:${ip}`, 10, WINDOW_15M);
  if (!gated.ok) return NextResponse.json({ error: "rate" }, { status: 429 });
  const body = (await req.json().catch(() => ({}))) as {
    amount?: string;
    otherAmount?: string;
    email?: string;
    note?: string;
  };
  const cents = centsFrom(String(body.amount || ""), String(body.otherAmount || ""));
  if (!cents) return NextResponse.json({ error: "amount" }, { status: 400 });

  const me = await getSessionUser();
  const email = String(body.email || me?.email || "").trim();
  const note = String(body.note || "").trim();
  const origin = process.env.APP_URL || "https://opentool.cafe";
  const pk = stripePublishable();
  const prisma = await getPrisma();
  const tip = await prisma.tip.create({
    data: {
      userId: me?.id,
      email: email || null,
      amount: String(cents / 100),
      note: note || null,
      status: "pending",
    },
  });

  const fields: Record<string, string> = {
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(cents),
    "line_items[0][price_data][product_data][name]": "Open Tool Cafe tip",
    "metadata[tipId]": tip.id,
    "metadata[project]": "opentool.cafe",
  };
  if (email) fields.customer_email = email;

  if (pk.startsWith("pk_")) {
    fields.ui_mode = "embedded";
    fields.redirect_on_completion = "if_required";
    fields.return_url = `${origin}/tip?ok=1&session_id={CHECKOUT_SESSION_ID}`;
  } else {
    fields.success_url = `${origin}/tip?ok=1`;
    fields.cancel_url = `${origin}/tip?err=cancel`;
  }

  try {
    const session = await stripeForm("/checkout/sessions", fields);
    const id = String(session.id || "");
    if (id) {
      await prisma.tip.update({ where: { id: tip.id }, data: { stripeId: id } });
    }
    return NextResponse.json({
      clientSecret: session.client_secret || null,
      url: session.url || null,
      publishableKey: pk.startsWith("pk_") ? pk : null,
    });
  } catch (e) {
    return NextResponse.json({ error: "checkout" }, { status: 502 });
  }
}
