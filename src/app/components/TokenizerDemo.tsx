"use client";

import { useCallback, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   Types
──────────────────────────────────────────────────────────────────────── */

type Model =
  | "BERT"
  | "DistilBERT"
  | "RoBERTa"
  | "BERTweet"
  | "IndicBERT"
  | "MuRIL"
  | "XLM-R";
type Language = "Hindi" | "Bengali" | "Tamil" | "Telugu" | "Malayalam" | "Marathi";

/** [fertility (tokens/word), unk%] */
type Stats = [number, number];

/* ────────────────────────────────────────────────────────────────────────
   Table II — exact values from the revised paper
──────────────────────────────────────────────────────────────────────── */

const TABLE_II: Record<Language, Record<Model, Stats>> = {
  Hindi: {
    BERT:      [3.12, 3.83],
    DistilBERT: [3.12, 3.83],
    RoBERTa:   [7.49, 0.00],
    BERTweet:  [4.06, 0.00],
    IndicBERT: [1.96, 0.00],
    MuRIL:     [1.59, 0.00],
    "XLM-R":   [1.79, 0.00],
  },
  Bengali: {
    BERT:      [4.71, 1.34],
    DistilBERT: [4.71, 1.34],
    RoBERTa:   [12.27, 0.00],
    BERTweet:  [5.47, 0.00],
    IndicBERT: [2.64, 0.00],
    MuRIL:     [1.83, 0.02],
    "XLM-R":   [2.39, 0.00],
  },
  Tamil: {
    BERT:      [3.27, 18.13],
    DistilBERT: [3.27, 18.13],
    RoBERTa:   [22.81, 0.00],
    BERTweet:  [7.71, 0.00],
    IndicBERT: [3.58, 0.00],
    MuRIL:     [2.20, 0.04],
    "XLM-R":   [2.80, 0.00],
  },
  Telugu: {
    BERT:      [1.65, 52.75],
    DistilBERT: [1.65, 52.75],
    RoBERTa:   [19.00, 0.00],
    BERTweet:  [6.46, 0.00],
    IndicBERT: [3.03, 0.00],
    MuRIL:     [2.49, 0.04],
    "XLM-R":   [2.67, 0.00],
  },
  Malayalam: {
    BERT:      [1.66, 52.62],
    DistilBERT: [1.66, 52.62],
    RoBERTa:   [22.10, 0.00],
    BERTweet:  [7.54, 0.00],
    IndicBERT: [3.58, 0.00],
    MuRIL:     [2.49, 0.01],
    "XLM-R":   [2.84, 0.00],
  },
  Marathi: {
    BERT:      [4.01, 4.32],
    DistilBERT: [4.01, 4.32],
    RoBERTa:   [10.20, 0.00],
    BERTweet:  [5.67, 0.00],
    IndicBERT: [2.56, 0.00],
    MuRIL:     [2.03, 0.01],
    "XLM-R":   [2.29, 0.00],
  },
};

const MODELS: Model[] = ["BERT", "DistilBERT", "RoBERTa", "BERTweet", "IndicBERT", "MuRIL", "XLM-R"];
const LANGUAGES: Language[] = ["Hindi", "Bengali", "Tamil", "Telugu", "Malayalam", "Marathi"];
const DEFAULT_TEXT = "building collapsed, people trapped, need rescue team now";

/* ────────────────────────────────────────────────────────────────────────
   Tokenisation simulation
──────────────────────────────────────────────────────────────────────── */

interface Token {
  text:  string;
  isUnk: boolean;
}

interface ModelResult {
  model:     Model;
  tokens:    Token[];
  fertility: number;
  unkPct:    number;
}

function approximateTokensFromStats(words: string[], fertility: number, unkPct: number): Token[] {
  const tokens: Token[] = [];
  for (const word of words) {
    const pieceCount = Math.max(1, Math.round(fertility));
    for (let i = 0; i < pieceCount; i++) {
      const isUnk = (i === 0 && word.length > 0 && (word.charCodeAt(0) >= 0x0900 || word.charCodeAt(0) >= 0x0c00)) ? false : (i === 0 && unkPct > 0 && (unkPct >= 50 || (word.length % 3 === 0 && unkPct > 0))); // deterministic fallback only
      let text: string;
      if (unkPct > 0 && (i === 0 && word.length % 3 === 0) && Math.round(unkPct) > 0) {
        text = "[UNK]";
      } else if (i === 0) {
        text = pieceCount > 1
          ? word.slice(0, Math.max(3, Math.ceil(word.length / pieceCount))) + "▸"
          : word;
      } else {
        text = "##" + i;
      }
      tokens.push({ text, isUnk: text === "[UNK]" });
    }
  }
  return tokens;
}

async function fetchLiveTokenization(text: string, language: Language): Promise<ModelResult[]> {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "tokenize", text, language }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error ?? `HTTP ${res.status}`);
  }

  return (data?.models ?? []).map((entry: any) => ({
    model: entry.model,
    fertility: Number(entry.fertility ?? 0),
    unkPct: Number(entry.unkPct ?? 0),
    tokens: Array.isArray(entry.tokens)
      ? entry.tokens.map((token: any) => ({
          text: String(token.text ?? ""),
          isUnk: Boolean(token.isUnk),
        }))
      : [],
  }));
}

function runFallbackSimulation(text: string, language: Language): ModelResult[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  return MODELS.map((model) => {
    const [fertility, unkPct] = TABLE_II[language][model];
    const tokens = approximateTokensFromStats(words, fertility, unkPct);
    return { model, tokens, fertility, unkPct };
  });
}

/* ────────────────────────────────────────────────────────────────────────
   Token pill
──────────────────────────────────────────────────────────────────────── */

function TokenPill({ token }: { token: Token }) {
  if (token.isUnk) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded border border-[#d9d9d9]/40 bg-[#d9d9d9]/5 text-[#f3f3f3] font-mono text-[11px] leading-none whitespace-nowrap">
        {token.text}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded border border-[#f3f3f3]/20 bg-[#f3f3f3]/5 text-[#f3f3f3] font-mono text-[11px] leading-none whitespace-nowrap">
      {token.text}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Model lane
──────────────────────────────────────────────────────────────────────── */

function ModelLane({ result, first }: { result: ModelResult; first: boolean }) {
  return (
    <div
      className={[
        "grid gap-x-4 gap-y-2 py-4 items-start",
        "grid-cols-[80px_1fr_auto]",
        first ? "" : "border-t border-[#2A3438]",
      ].join(" ")}
    >
      {/* Col 1: model name */}
      <span className="font-mono text-xs text-[#b8b8b8] pt-0.5 leading-none">
        {result.model}
      </span>

      {/* Col 2: token pills */}
      <div className="flex flex-wrap gap-1.5">
        {result.tokens.map((tok, i) => (
          <TokenPill key={i} token={tok} />
        ))}
      </div>

      {/* Col 3: stats */}
      <div className="text-right whitespace-nowrap pt-0.5">
        <span className="font-mono text-[11px] text-[#b8b8b8]">
          {result.fertility.toFixed(2)}
          <span className="text-[#f3f3f3] mx-1">·</span>
        </span>
        <span
          className={[
            "font-mono text-[11px]",
            result.unkPct > 10
              ? "text-[#f3f3f3]"
              : result.unkPct > 0
              ? "text-[#d9d9d9]"
              : "text-[#eaeaea]",
          ].join(" ")}
        >
          {result.unkPct.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Main component
──────────────────────────────────────────────────────────────────────── */

export default function TokenizerDemo() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [language, setLanguage] = useState<Language>("Hindi");
  const [results, setResults] = useState<ModelResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const tokenize = useCallback(async () => {
    if (!text.trim()) {
      setResults([]);
      setErrorMessage(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const liveResults = await fetchLiveTokenization(text, language);
      if (liveResults.length > 0) {
        setResults(liveResults);
        setErrorMessage(null);
        return;
      }

      setResults([]);
      setErrorMessage("Tokenization is currently unavailable. Please try again later.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      const isQuotaError = /429|quota|rate limit|resource exhausted|limit reached/i.test(msg);

      setResults([]);
      setErrorMessage(
        isQuotaError
          ? "Tokenization is currently unavailable because the Gemini API limit has been reached. Please try again later."
          : "Tokenization is currently unavailable. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  }, [text, language]);

  return (
    <div className="space-y-10">

      {/* ── Section header ──────────────────────────────────────────── */}
      <div className="space-y-3 max-w-2xl">
        <h2 className="font-display font-bold text-2xl sm:text-4xl text-[#f3f3f3] leading-tight">
          Try the tokenizer, live
        </h2>
        <p className="font-body text-base sm:text-lg text-[#b8b8b8] leading-relaxed">
          Type a short crisis-style message and pick a language to compare how each model breaks the
          text into subwords and where the unknown-token risk rises.
        </p>
      </div>

      {/* ── Input card ──────────────────────────────────────────────── */}
      <div className="rounded-lg border border-[#2A3438] bg-[#161D20] p-5 space-y-4">

        {/* Controls row */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start">

          {/* Textarea */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            spellCheck={false}
            placeholder="Enter a crisis tweet…"
            className={[
              "flex-1 resize-none rounded border border-[#2b2b2b] bg-[#111111]",
              "px-3 py-2.5 font-mono text-base text-[#f3f3f3] placeholder-[#b8b8b8]/60",
              "focus:outline-none focus:border-[#f3f3f3]/80 transition-colors",
            ].join(" ")}
          />

          {/* Language select */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className={[
              "rounded border border-[#2b2b2b] bg-[#111111]",
              "px-3 py-2.5 font-mono text-base text-[#f3f3f3]",
              "focus:outline-none focus:border-[#f3f3f3]/80 transition-colors",
              "sm:w-36 cursor-pointer",
            ].join(" ")}
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Button */}
        <button
          onClick={() => void tokenize()}
          disabled={isLoading}
          className={[
            "inline-flex items-center gap-2 rounded px-5 py-2.5",
            "bg-[#f3f3f3] text-[#050505] font-display font-semibold text-sm sm:text-base",
            "hover:bg-[#d9d9d9] active:scale-[0.98] transition-all",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100",
          ].join(" ")}
        >
          {isLoading ? "Tokenizing…" : "Tokenize across models"}
        </button>
      </div>

      {errorMessage && (
        <p className="rounded border border-[#E15B4F]/30 bg-[#E15B4F]/10 px-3 py-2 font-mono text-xs text-[#F5C3B8] leading-relaxed">
          {errorMessage}
        </p>
      )}

      {/* ── Column headers ──────────────────────────────────────────── */}
      {results.length > 0 && (
        <>
          <div className="grid gap-x-4 grid-cols-[80px_1fr_auto] px-0">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#b8b8b8]/80">
              Model
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#b8b8b8]/80">
              Tokens
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#b8b8b8]/80 text-right">
              fert · unk%
            </span>
          </div>

          {/* ── Model lanes ─────────────────────────────────────────── */}
          <div className="rounded-lg border border-[#2A3438] bg-[#161D20] divide-y-0 px-5">
            {results.map((r, i) => (
              <ModelLane key={r.model} result={r} first={i === 0} />
            ))}
          </div>
        </>
      )}

      {/* ── Disclaimer note ─────────────────────────────────────────── */}
      <p className="font-mono text-[11px] leading-relaxed text-[#b8b8b8]/80 border-t border-[#2b2b2b] pt-5">
        <span className="text-[#f3f3f3]">Token behavior:</span> the app compares each model&apos;s splitting
        pattern and unknown-token risk to show how different vocabularies react to the same message.
      </p>
      <p className="font-mono text-[11px] leading-relaxed text-[#b8b8b8]/80">
        DistilBERT reuses BERT&apos;s WordPiece vocabulary and tokenizer, so its values are identical to BERT&apos;s by construction.
      </p>

    </div>
  );
}
