"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function MoreMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="nav-more">
      {open ? (
        <button type="button" className="menu-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />
      ) : null}
      <button
        type="button"
        className="mobile-menu-btn"
        aria-expanded={open}
        aria-label={open ? "Close more" : "Open more"}
        onClick={() => setOpen((v) => !v)}
      >
        more
      </button>
      {open ? (
        <div className="mobile-drawer" onClickCapture={() => setOpen(false)}>
          <nav className="flex flex-col" aria-label="More">
            {children}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
