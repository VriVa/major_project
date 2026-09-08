"use client";

import { useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   HumAID taxonomy (exact strings the model must return)
──────────────────────────────────────────────────────────────────────── */

const CATEGORIES = [
  "caution and advice",
  "displaced people and evacuations",
  "infrastructure and utility damage",
  "injured or dead people",
  "missing or found people",
  "not humanitarian",
  "other relevant information",
  "requests or urgent needs",
  "rescue/volunteering or donation effort",
  "sympathy and support",
] as const;

type Category = (typeof CATEGORIES)[number];

/* ────────────────────────────────────────────────────────────────────────
   Classification logic
──────────────────────────────────────────────────────────────────────── */

interface ClassifyResult {
  category: Category | string;
  reason:   string;
}

function buildPrompt(tweet: string): string {
  const numbered = CATEGORIES.map((c, i) => `${i + 1}. ${c}`).join("\n");
  return [
    "You are a disaster-response tweet classifier following the HumAID taxonomy.",
    "Classify the tweet below into exactly one of these ten categories:",
    numbered,
    "",
    `Tweet (any language): "${tweet}"`,
    "",
    "Respond ONLY with strict JSON, no markdown fences:",
    `{"category": "<one of the ten categories exactly as written>", "reason": "<one sentence, under 25 words>"}`,
  ].join("\n");
}

async function classifyTweet(tweet: string, model: string): Promise<ClassifyResult> {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "classify", tweet, model }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error ?? `HTTP ${res.status}`);
  }

  return {
    category: data?.category ?? "other relevant information",
    reason: data?.reason ?? "Classified successfully.",
  };
}

/* ────────────────────────────────────────────────────────────────────────
   Component
──────────────────────────────────────────────────────────────────────── */

const DEFAULT_TWEET  = "সাহায্য দরকার, আমাদের এলাকায় বাঁধ ভেঙে গেছে, মানুষ আটকে আছে";
const DEFAULT_MODEL  = "gemini-2.0-flash";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

export default function ClassifyDemo() {
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [tweet, setTweet] = useState(DEFAULT_TWEET);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [result, setResult] = useState<ClassifyResult | null>(null);

  const loading = status.kind === "loading";

  async function handleClassify() {
    if (!tweet.trim()) {
      setStatus({ kind: "error", message: "Tweet cannot be empty." });
      return;
    }

    setStatus({ kind: "loading" });
    setResult(null);

    try {
      const r = await classifyTweet(tweet, model);
      setResult(r);
      setStatus({ kind: "idle" });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Unknown error.",
      });
    }
  }

  function handleClear() {
    setTweet("");
    setResult(null);
    setStatus({ kind: "idle" });
  }

  return (
    <div className="space-y-10">

      {/* ── Section header ──────────────────────────────────────────── */}
      <div className="space-y-3 max-w-2xl">
        <h2 className="font-display font-bold text-2xl sm:text-4xl text-[#f3f3f3] leading-tight">
          Live classification demo
        </h2>
        <p className="font-body text-base sm:text-lg text-[#b8b8b8] leading-relaxed">
          This uses the project&apos;s configured inference backend to classify a tweet into one of
          the ten HumAID categories in real time.
        </p>
      </div>

      {/* ── Main card ───────────────────────────────────────────────── */}
      <div className="rounded-lg border border-[#2A3438] bg-[#161D20] p-5 space-y-5">

        {/* ── Row 2: Tweet textarea ────────────────────────────────── */}
        <div className="space-y-1.5">
          <label
            htmlFor="cx-tweet"
            className="block font-mono text-[11px] uppercase tracking-widest text-[#b8b8b8]"
          >
            Tweet
          </label>
          <textarea
            id="cx-tweet"
            value={tweet}
            onChange={(e) => setTweet(e.target.value)}
            rows={3}
            spellCheck={false}
            placeholder="Enter a crisis tweet in any language…"
            className={[
              "w-full resize-none rounded border border-[#2b2b2b] bg-[#111111]",
              "px-3 py-2.5 font-mono text-base text-[#f3f3f3] placeholder-[#b8b8b8]/60",
              "focus:outline-none focus:border-[#f3f3f3]/80 transition-colors",
            ].join(" ")}
          />
        </div>

        {/* ── Row 3: Buttons ───────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <button
            id="cx-classify-btn"
            onClick={handleClassify}
            disabled={loading}
            className={[
              "inline-flex items-center gap-2 rounded px-5 py-2.5",
              "bg-[#f3f3f3] text-[#050505] font-display font-semibold text-sm sm:text-base",
              "hover:bg-[#d9d9d9] active:scale-[0.98] transition-all",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
            ].join(" ")}
          >
            {loading ? (
              <>
                <Spinner />
                Classifying…
              </>
            ) : (
              "Classify tweet"
            )}
          </button>

          <button
            id="cx-clear-btn"
            onClick={handleClear}
            disabled={loading}
            className={[
              "rounded px-4 py-2.5 font-display font-semibold text-sm sm:text-base",
              "border border-[#2b2b2b] text-[#b8b8b8]",
              "hover:border-[#d9d9d9]/60 hover:text-[#f3f3f3] transition-colors",
              "disabled:opacity-40 disabled:cursor-not-allowed",
            ].join(" ")}
          >
            Clear
          </button>
        </div>

        {/* ── Status line ─────────────────────────────────────────── */}
        {status.kind !== "idle" && (
          <p
            className={[
              "font-mono text-xs sm:text-sm",
              status.kind === "loading" ? "text-[#b8b8b8]" : "text-[#f3f3f3]",
            ].join(" ")}
            role={status.kind === "error" ? "alert" : undefined}
          >
            {status.kind === "loading"
              ? "↻  Calling model…"
              : `✗  ${status.message}`}
          </p>
        )}
      </div>

      {/* ── Result panel ────────────────────────────────────────────── */}
      {result && (
        <div className="rounded-lg border border-[#5FC9BC]/30 bg-[#5FC9BC]/5 p-5 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#b8b8b8]">
              Category
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full border border-[#f3f3f3]/30 bg-[#f3f3f3]/5 font-mono text-xs font-medium text-[#f3f3f3]">
              {result.category}
            </span>
          </div>
          <p className="font-body text-base text-[#b8b8b8] leading-relaxed">
            {result.reason}
          </p>
        </div>
      )}

      {/* ── Helper / disclaimer ─────────────────────────────────────── */}
      <div className="space-y-2 border-t border-[#2A3438] pt-5">
        <p className="font-mono text-[11px] text-[#b8b8b8]/80 leading-relaxed">
          The live classifier is a demonstration layer prompted with the HumAID taxonomy and may vary
          from benchmark scores depending on the text and model behavior.
        </p>
      </div>

    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Inline spinner
──────────────────────────────────────────────────────────────────────── */

function Spinner() {
  return (
    <svg
      className="w-3.5 h-3.5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
      />
    </svg>
  );
}
