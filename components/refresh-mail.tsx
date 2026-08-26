"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function RefreshMail() {
  const router = useRouter();
  useEffect(() => {
    const tick = window.setInterval(() => {
      if (document.hidden) return;
      const note = document.getElementById("dm-body");
      if (note instanceof HTMLTextAreaElement) {
        if (document.activeElement === note) return;
        if (note.value.trim()) return;
      }
      router.refresh();
    }, 8000);
    return () => window.clearInterval(tick);
  }, [router]);
  return null;
}
