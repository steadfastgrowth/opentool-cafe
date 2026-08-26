"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

function pinBottom() {
  const log = document.getElementById("tty-log");
  if (log) log.scrollTop = log.scrollHeight;
}

export function RefreshMail() {
  const router = useRouter();
  useEffect(() => {
    pinBottom();
    document.getElementById("dm-body")?.focus();
    const tick = window.setInterval(() => {
      if (document.hidden) return;
      const note = document.getElementById("dm-body");
      if (note instanceof HTMLInputElement || note instanceof HTMLTextAreaElement) {
        if (document.activeElement === note) return;
        if (note.value.trim()) return;
      }
      router.refresh();
    }, 8000);
    return () => window.clearInterval(tick);
  }, [router]);
  return null;
}
