"use client";

import { FormEvent, useState } from "react";

declare global {
  interface Window {
    Stripe?: (pk: string) => {
      initEmbeddedCheckout: (opts: { clientSecret: string }) => Promise<{
        mount: (sel: string) => void;
        destroy: () => void;
      }>;
    };
  }
}

function loadStripeJs() {
  return new Promise<void>((resolve, reject) => {
    if (window.Stripe) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://js.stripe.com/v3/"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("stripe.js")), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = "https://js.stripe.com/v3/";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("stripe.js"));
    document.head.appendChild(s);
  });
}

export function TipCheckout({ emailDefault }: { emailDefault: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/tip/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: String(fd.get("amount") || ""),
          otherAmount: String(fd.get("otherAmount") || ""),
          email: String(fd.get("email") || ""),
          note: String(fd.get("note") || ""),
        }),
      });
      const data = (await res.json()) as {
        clientSecret?: string | null;
        url?: string | null;
        publishableKey?: string | null;
        error?: string;
      };
      if (!res.ok) {
        setErr(data.error === "amount" ? "Pick an amount." : data.error || "Checkout failed.");
        setBusy(false);
        return;
      }
      if (data.clientSecret && data.publishableKey && window) {
        await loadStripeJs();
        if (!window.Stripe) throw new Error("stripe.js");
        const checkout = await window.Stripe(data.publishableKey).initEmbeddedCheckout({
          clientSecret: data.clientSecret,
        });
        setOpen(true);
        checkout.mount("#tip-embed");
        setBusy(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setErr("Checkout did not start.");
    } catch {
      setErr("Checkout failed.");
    }
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      {!open && (
        <form onSubmit={onSubmit} className="ticket p-6 space-y-4">
          <div>
            <label className="lbl" htmlFor="tip-amount">
              amount
            </label>
            <select id="tip-amount" name="amount" className="field" defaultValue="5">
              <option value="5">$5</option>
              <option value="15">$15</option>
              <option value="50">$50</option>
              <option value="other">other</option>
            </select>
          </div>
          <div>
            <label className="lbl" htmlFor="tip-other">
              other amount (USD)
            </label>
            <input id="tip-other" name="otherAmount" className="field" inputMode="decimal" />
          </div>
          <div>
            <label className="lbl" htmlFor="tip-email">
              email
            </label>
            <input
              id="tip-email"
              name="email"
              className="field"
              defaultValue={emailDefault}
              autoComplete="email"
            />
          </div>
          <div>
            <label className="lbl" htmlFor="tip-note">
              note
            </label>
            <input id="tip-note" name="note" className="field" />
          </div>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Opening checkout…" : "Leave a tip"}
          </button>
          {err && (
            <p className="text-sm" role="alert">
              {err}
            </p>
          )}
        </form>
      )}
      <div id="tip-embed" className={open ? "ticket p-2 overflow-hidden" : ""} />
    </div>
  );
}
