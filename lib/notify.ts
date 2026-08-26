function fromAddress() {
  const raw = process.env.RESEND_FROM || "login@opentool.cafe";
  if (raw.includes("<")) return raw;
  return `Open Tool Cafe <${raw}>`;
}

export async function sendResend(opts: { to: string; subject: string; text: string }) {
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

export function notifyAddress() {
  return (process.env.NOTIFY_EMAIL || "").trim();
}

export async function notifyDesk(subject: string, text: string) {
  const to = notifyAddress();
  if (!to) return;
  try {
    await sendResend({ to, subject, text });
  } catch {
    // never block the cafe on desk mail
  }
}
