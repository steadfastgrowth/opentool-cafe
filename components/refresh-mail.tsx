"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function RefreshMail() {
  const router = useRouter();
  useEffect(() => {
    const tick = window.setInterval(() => router.refresh(), 8000);
    return () => window.clearInterval(tick);
  }, [router]);
  return null;
}
