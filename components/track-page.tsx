"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function TrackPage() {
  const path = usePathname();
  useEffect(() => {
    if (!path || path.startsWith("/admin") || path.startsWith("/auth/")) return;
    const body = JSON.stringify({ name: "page_view", path });
    const url = "/api/t";
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
      return;
    }
    fetch(url, { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(
      () => {},
    );
  }, [path]);
  return null;
}
