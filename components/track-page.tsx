"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function visitorId() {
  try {
    const key = "otc_vid";
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return "";
  }
}

function referrer() {
  try {
    if (!document.referrer) return "";
    const u = new URL(document.referrer);
    if (u.host === location.host) return "";
    return `${u.host}${u.pathname}`.slice(0, 240);
  } catch {
    return "";
  }
}

export function TrackPage() {
  const path = usePathname();
  useEffect(() => {
    if (!path || path.startsWith("/admin") || path.startsWith("/auth/")) return;
    const body = JSON.stringify({
      name: "page_view",
      path,
      ref: referrer(),
      visitorId: visitorId(),
    });
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
