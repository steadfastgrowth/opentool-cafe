import { appUrl } from "./config";

function fromAddress() {
  const raw = process.env.RESEND_FROM || "login@opentool.cafe";
  if (raw.includes("<")) return raw;
  return `Open Tool Cafe <${raw}>`;
}

function youUrl() {
  return `${appUrl()}/you`;
}

async function sendTextMail(opts: { to: string; subject: string; text: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY missing");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [opts.to],
      subject: opts.subject,
      text: opts.text,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`resend ${res.status} ${body.slice(0, 200)}`);
  }
}

export async function sendLeadNotice(opts: {
  to: string;
  listingName: string;
  listingSlug: string;
  fromName: string;
  fromSlug: string;
  fromEmail: string;
}) {
  const origin = appUrl();
  const text = [
    `${opts.fromName} took ${opts.listingName} and opted in.`,
    "",
    `Profile: ${origin}/u/${opts.fromSlug}`,
    `Email: ${opts.fromEmail}`,
    `Ticket: ${origin}/l/${opts.listingSlug}`,
    `Desk: ${youUrl()}`,
    "",
    `Turn builder mail off: ${youUrl()}`,
  ].join("\n");
  await sendTextMail({
    to: opts.to,
    subject: `Take on ${opts.listingName}`,
    text,
  });
}

export async function sendMeetingNotice(opts: {
  to: string;
  kind: string;
  fromName: string;
  fromSlug: string;
  listingName?: string | null;
  note?: string | null;
}) {
  const origin = appUrl();
  const kind = opts.kind === "sell" ? "offered help" : "asked for help";
  const lines = [
    `${opts.fromName} ${kind}.`,
    "",
    `Profile: ${origin}/u/${opts.fromSlug}`,
  ];
  if (opts.listingName) lines.push(`Tool: ${opts.listingName}`);
  if (opts.note) {
    lines.push("", opts.note);
  }
  lines.push("", `Desk: ${youUrl()}`, "", `Turn builder mail off: ${youUrl()}`);
  await sendTextMail({
    to: opts.to,
    subject: opts.listingName ? `Meeting · ${opts.listingName}` : "Meeting request",
    text: lines.join("\n"),
  });
}

export async function sendLoginEmail(opts: {
  email: string;
  code: string;
  token: string;
  optIn: boolean;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY missing");
  const origin = appUrl();
  const link = `${origin}/auth/magic?token=${encodeURIComponent(opts.token)}&opt=${opts.optIn ? "1" : "0"}`;
  const text = [
    `Your Open Tool Cafe login code is ${opts.code}.`,
    "",
    "It expires in 30 minutes.",
    "",
    `Or open this link: ${link}`,
  ].join("\n");
  const html = `<p>Your Open Tool Cafe login code is <strong style="font-size:1.4em;letter-spacing:0.12em">${opts.code}</strong>.</p>
<p>It expires in 30 minutes.</p>
<p><a href="${link}">Or tap this login link</a></p>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [opts.email],
      subject: `${opts.code} is your cafe login code`,
      text,
      html,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`resend ${res.status} ${body.slice(0, 200)}`);
  }
}
