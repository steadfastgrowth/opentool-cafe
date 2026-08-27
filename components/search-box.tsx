"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/components/link";

type Hit = { kind: "person" | "tool" | "topic"; href: string; title: string; sub?: string };

export function SearchBox({
  id,
  defaultValue = "",
  className,
  autoFocus,
  placeholder = "Search",
}: {
  id?: string;
  defaultValue?: string;
  className?: string;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  const reactId = useId();
  const inputId = id || `q-${reactId}`;
  const listId = `${inputId}-list`;
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState(defaultValue);
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      setHits([]);
      setOpen(false);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/search/suggest?q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        if (!res.ok) return;
        const data = (await res.json()) as { hits?: Hit[] };
        const next = Array.isArray(data.hits) ? data.hits : [];
        setHits(next);
        setOpen(next.length > 0);
        setActive(0);
      } catch {
        /* aborted or network */
      }
    }, 120);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function go(href?: string) {
    if (href) {
      router.push(href);
      setOpen(false);
      return;
    }
    const query = q.trim();
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="search-box" ref={wrapRef}>
      <form
        action="/search"
        role="search"
        onSubmit={(e) => {
          if (open && hits[active]) {
            e.preventDefault();
            go(hits[active].href);
          }
        }}
      >
        <label className="sr-only" htmlFor={inputId}>
          Search
        </label>
        <input
          id={inputId}
          name="q"
          className={className}
          placeholder={placeholder}
          value={q}
          autoComplete="off"
          autoFocus={autoFocus}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => {
            if (hits.length) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (!open || hits.length === 0) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => (i + 1) % hits.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => (i - 1 + hits.length) % hits.length);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />
      </form>
      {open && hits.length > 0 ? (
        <ul id={listId} className="search-suggest" role="listbox">
          {hits.map((h, i) => (
            <li key={`${h.kind}-${h.href}-${h.title}`} role="option" aria-selected={i === active}>
              <Link
                href={h.href}
                className={i === active ? "search-hit on" : "search-hit"}
                onMouseEnter={() => setActive(i)}
                onClick={() => setOpen(false)}
              >
                <span className="search-hit-kind">{h.kind}</span>
                <span className="search-hit-title">{h.title}</span>
                {h.sub ? <span className="search-hit-sub">{h.sub}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
