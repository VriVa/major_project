/* ────────────────────────────────────────────────────────────────────────
   Types
──────────────────────────────────────────────────────────────────────── */

interface BarRow {
  label: string;
  value: number;
}

interface BarChartProps {
  title: string;
  rows: BarRow[];
  max: number;
  unit?: string;
  colorFor: (label: string) => string;
}

/* ────────────────────────────────────────────────────────────────────────
   Model colour map (shared across charts)
──────────────────────────────────────────────────────────────────────── */

const MODEL_COLORS: Record<string, string> = {
  BERT:       "#f3f3f3",
  DistilBERT: "#d1d1d1",
  RoBERTa:    "#a8a8a8",
  BERTweet:   "#7e7e7e",
  MuRIL:      "#eaeaea",
  IndicBERT:  "#c6c6c6",
  "XLM-R":    "#9b9b9b",
  mBERT:      "#b8b8b8",
};

function colorFor(label: string): string {
  return MODEL_COLORS[label] ?? "#b8b8b8";
}

/* ────────────────────────────────────────────────────────────────────────
   BarChart — reusable, self-contained
──────────────────────────────────────────────────────────────────────── */

function BarChart({ title, rows, max, unit = "", colorFor: getColor }: BarChartProps) {
  return (
    <div className="rounded-lg border border-[#2A3438] bg-[#161D20] p-5 space-y-5 flex flex-col">
      <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#b8b8b8]">
        {title}
      </h3>

      <div className="flex flex-col gap-3">
        {rows.map(({ label, value }) => {
          const pct = Math.max(2, (value / max) * 100);
          const color = getColor(label);
          const isZero = value === 0;

          return (
            <div
              key={label}
              className="grid items-center gap-x-3"
              style={{ gridTemplateColumns: "90px 1fr 64px" }}
            >
              <span className="font-mono text-xs text-[#b8b8b8] truncate">{label}</span>

              <div
                className="relative h-5 rounded overflow-hidden"
                style={{ background: "#1C2427" }}
                role="img"
                aria-label={`${label}: ${value}${unit}`}
              >
                {!isZero && (
                  <div
                    className="absolute inset-y-0 left-0 rounded transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: color,
                      opacity: 0.85,
                    }}
                  />
                )}
              </div>

              <span
                className="font-mono text-xs text-right tabular-nums"
                style={{ color: isZero ? "#2A3438" : color }}
              >
                {value}{unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Chart data
──────────────────────────────────────────────────────────────────────── */

const F1_ROWS: BarRow[] = [
  { label: "MuRIL",      value: 0.6146 },
  { label: "XLM-R",      value: 0.5660 },
  { label: "mBERT",      value: 0.3471 },
  { label: "IndicBERT",  value: 0.1683 },
  { label: "BERT",       value: 0.0992 },
  { label: "RoBERTa",    value: 0.0859 },
  { label: "DistilBERT", value: 0.0842 },
  { label: "BERTweet",   value: 0.0755 },
];

const UNK_ROWS: BarRow[] = [
  { label: "BERT",       value: 52.75 },
  { label: "DistilBERT", value: 52.75 },
  { label: "RoBERTa",    value: 0.00 },
  { label: "BERTweet",   value: 0.00 },
  { label: "MuRIL",      value: 0.04 },
  { label: "IndicBERT",  value: 0.00 },
  { label: "XLM-R",      value: 0.00 },
];

const LATENCY_ROWS: BarRow[] = [
  { label: "DistilBERT", value: 8.084 },
  { label: "IndicBERT",  value: 12.276 },
  { label: "XLM-R",      value: 14.564 },
  { label: "MuRIL",      value: 14.602 },
  { label: "BERT",       value: 14.868 },
  { label: "RoBERTa",    value: 15.240 },
  { label: "BERTweet",   value: 15.293 },
];

const TAPT_BASELINE_ROWS: BarRow[] = [
  { label: "MuRIL",      value: 0.6146 },
  { label: "IndicBERT",  value: 0.1683 },
  { label: "BERT",       value: 0.0992 },
  { label: "DistilBERT", value: 0.0842 },
  { label: "RoBERTa",    value: 0.0859 },
  { label: "BERTweet",   value: 0.0755 },
];

const TAPT_ROWS: BarRow[] = [
  { label: "MuRIL",      value: 0.6028 },
  { label: "IndicBERT",  value: 0.1308 },
  { label: "BERT",       value: 0.1060 },
  { label: "DistilBERT", value: 0.0963 },
  { label: "RoBERTa",    value: 0.0734 },
  { label: "BERTweet",   value: 0.0607 },
];

/* ────────────────────────────────────────────────────────────────────────
   Section
──────────────────────────────────────────────────────────────────────── */

export function TaptSection() {
  return (
    <div className="space-y-8">
      <div className="space-y-3 max-w-3xl">
        <h2 id="tapt" className="font-display font-bold text-2xl sm:text-4xl text-[#f3f3f3] leading-tight">
          Does extra crisis-domain pretraining help?
        </h2>
        <p className="font-body text-base sm:text-lg text-[#b8b8b8] leading-relaxed">
          Task-adaptive pretraining (TAPT) was applied to six of the seven models. XLM-R was excluded — continued pretraining was estimated at 20–30 GPU-hours versus 45–90 minutes for every other model.
        </p>
      </div>

      <div className="grid grid-cols-1 min-[760px]:grid-cols-2 gap-5">
        <BarChart
          title="Baseline avg. Indic F1"
          rows={TAPT_BASELINE_ROWS}
          max={0.6146}
          colorFor={colorFor}
        />
        <BarChart
          title="TAPT avg. Indic F1"
          rows={TAPT_ROWS}
          max={0.6146}
          colorFor={colorFor}
        />
      </div>

      <p className="font-mono text-[11px] leading-relaxed text-[#b8b8b8]/80">
        TAPT does not close the cross-lingual gap — MuRIL remains strongest by a wide margin whether or not additional pretraining is applied.
      </p>
    </div>
  );
}

export default function ResultsSection() {
  return (
    <div className="space-y-10">
      <div className="space-y-3 max-w-2xl">
        <h2 className="font-display font-bold text-2xl sm:text-4xl text-[#f3f3f3] leading-tight">
          What the model comparison shows
        </h2>
        <p className="font-body text-base sm:text-lg text-[#b8b8b8] leading-relaxed">
          A quick look at how the strongest multilingual and Indic-aware models differ in robustness,
          token coverage, and latency.
        </p>
      </div>

      <div className="grid grid-cols-1 min-[760px]:grid-cols-2 gap-5">
        <BarChart
          title="Avg. Indic Macro-F1"
          rows={F1_ROWS}
          max={0.6146}
          colorFor={colorFor}
        />
        <BarChart
          title="UNK-token rate on Telugu"
          rows={UNK_ROWS}
          max={52.75}
          unit="%"
          colorFor={colorFor}
        />
      </div>

      <div className="grid grid-cols-1 gap-5">
        <BarChart
          title="End-to-end latency, ms"
          rows={LATENCY_ROWS}
          max={15.293}
          unit=""
          colorFor={colorFor}
        />
      </div>

      <p className="font-mono text-[11px] leading-relaxed text-[#b8b8b8]/80">
        XLM-R is no longer the slowest model in the updated deployment run — it now ranks second by latency, though it still carries the largest checkpoint and VRAM footprint (1,081.8 MB / 1,320.7 MB).
      </p>

      {/* <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2">
        {Object.entries(MODEL_COLORS).map(([name, color]) => (
          <span key={name} className="flex items-center gap-1.5 font-mono text-[11px] text-[#b8b8b8]">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: color, opacity: 0.85 }}
              aria-hidden="true"
            />
            {name}
          </span>
        ))}
      </div> */}
    </div>
  );
}
