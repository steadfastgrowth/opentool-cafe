import { appUrl } from "./config";

function fromAddress() {
  const raw = process.env.RESEND_FROM || "login@opentool.cafe";
  if (raw.includes("<")) return raw;
  return `Open Tool Cafe <${raw}>`;
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
