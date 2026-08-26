"use client";

import { useEffect, useState } from "react";

type Row = { id: string; body: string; from: string; at: string };

function hhmm(iso: string) {
  try {
    return new Date(iso).toISOString().slice(11, 16);
  } catch {
    return "";
  }
}

function pinBottom() {
  const log = document.getElementById("tty-log");
  if (log) log.scrollTop = log.scrollHeight;
}

export function TtyLog({
  slug,
  initial,
}: {
  slug: string;
  initial: Row[];
}) {
  const [rows, setRows] = useState(initial);
  useEffect(() => {
    pinBottom();
    document.getElementById("dm-body")?.focus();
    const tick = window.setInterval(async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/mail/${encodeURIComponent(slug)}/feed`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { ok?: boolean; messages?: Row[] };
        if (!data.ok || !data.messages) return;
        setRows((prev) => {
          if (prev.length === data.messages!.length && prev.at(-1)?.id === data.messages!.at(-1)?.id) return prev;
          return data.messages!;
        });
      } catch {
        // keep the pane
      }
    }, 4000);
    return () => window.clearInterval(tick);
  }, [slug]);
  useEffect(() => {
    pinBottom();
  }, [rows]);
  return (
    <>
      {rows.length === 0 && <p className="tty-meta">no traffic yet.</p>}
      {rows.map((m) => (
        <p key={m.id} className="tty-line">
          <span className="tty-time">{hhmm(m.at)}</span>
          <span className="tty-who">{m.from}&gt;</span>
          <span className="tty-body">{m.body}</span>
        </p>
      ))}
    </>
  );
}
