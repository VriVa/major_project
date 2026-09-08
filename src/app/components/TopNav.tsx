"use client";

import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "PIPELINE",  href: "#pipeline"  },
  { label: "TOKENIZER", href: "#tokenizer" },
  { label: "LIVE DEMO", href: "#classify" },
  { label: "TAPT",      href: "#tapt"     },
  { label: "RESULTS",   href: "#results"   },
  { label: "RESPONSE",  href: "/response-center" },
] as const;

export default function TopNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        "border-b border-[#2b2b2b]",
        scrolled
          ? "bg-[#050505]/90 backdrop-blur-md"
          : "bg-[#050505]/80 backdrop-blur-sm",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-[1040px] items-center justify-between px-6 py-4">

        {/* ── Left: brand ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <span
            className="block h-2.5 w-2.5 rounded-full bg-[#f3f3f3] glow-amber shrink-0"
            aria-hidden="true"
          />
          <span className="font-display font-bold tracking-[0.18em] uppercase text-[#f3f3f3] text-sm sm:text-base select-none">
            CRISISX
          </span>
        </div>

        {/* ── Right: nav links ─────────────────────────────────────────── */}
        <nav aria-label="Section navigation">
          <ul className="flex items-center gap-4 sm:gap-6">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  className={[
                    "font-mono text-[0.72rem] sm:text-[0.78rem] tracking-[0.14em] uppercase text-[#b8b8b8]",
                    "transition-colors duration-150",
                    "hover:text-[#f3f3f3]",
                  ].join(" ")}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

      </div>
    </header>
  );
}
