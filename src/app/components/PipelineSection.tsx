/* ── Types ────────────────────────────────────────────────────────────── */

type PillVariant = "red" | "teal";

interface Pill {
  label: string;
  variant: PillVariant;
}

interface Step {
  num: string;
  title: string;
  description: string;
  pills?: Pill[];
}

/* ── Data ─────────────────────────────────────────────────────────────── */

const STEPS: Step[] = [
  {
    num: "01",
    title: "Tweet arrives, language unknown",
    description:
      "A disaster-area post lands on an edge device with no guaranteed connectivity; could be English, Hindi, Bengali, Tamil, Telugu, Malayalam, or Marathi.",
  },
  {
    num: "02",
    title: "Tokenizer splits it into subwords",
    description:
      "Every encoder has a fixed vocabulary from pretraining. English-centric WordPiece models (BERT, DistilBERT) either map unfamiliar scripts to [UNK] or blow up sequence length. This is an important prerequisite for downstream transfer: the tokenization choice determines whether the model can even represent the input coherently.",
    pills: [
      { label: "UNK trap — BERT family",          variant: "red"  },
      { label: "sequence expansion — byte-BPE",   variant: "red"  },
      { label: "clean split — MuRIL / IndicBERT", variant: "teal" },
    ],
  },
  {
    num: "03",
    title: "Encoder produces contextual representations",
    description:
      "The fine-tuned transformer (trained on 114,660 English tweets only) encodes the token sequence; if step 2 already destroyed the input, no amount of encoder capacity recovers it.",
  },
  {
    num: "04",
    title: "Classification head scores 10 categories",
    description:
      "HumAID taxonomy: caution/advice · displaced people · infrastructure damage · injured/dead · missing/found · not humanitarian · other relevant info · requests/urgent needs · rescue/donation · sympathy/support.",
  },
  {
    num: "05",
    title: "Category reaches the responder",
    description:
      "On a compatible tokenizer this is a working zero-shot pipeline with no target-language training data required; on an incompatible one the category is close to noise (measured macro-F1 falls below 0.10 for English-centric models).",
  },
];

/* ── Pill component ───────────────────────────────────────────────────── */

const PILL_STYLES: Record<PillVariant, string> = {
  red:  "border-[#f3f3f3]/30 text-[#f3f3f3] bg-[#f3f3f3]/5",
  teal: "border-[#d9d9d9]/35 text-[#d9d9d9] bg-[#d9d9d9]/5",
};

function Tag({ label, variant }: Pill) {
  return (
    <span
      className={[
        "inline-block rounded px-2 py-0.5",
        "border font-mono text-[11px] tracking-wide leading-none",
        PILL_STYLES[variant],
      ].join(" ")}
    >
      {label}
    </span>
  );
}

/* ── Step row ─────────────────────────────────────────────────────────── */

function StepRow({ step, first }: { step: Step; first: boolean }) {
  return (
    <li
      className={[
        "flex gap-6 py-7",
        first ? "" : "border-t border-[#2A3438]",
      ].join(" ")}
    >
      {/* Step number */}
      <span
        aria-hidden="true"
        className="font-mono text-sm font-medium text-[#f3f3f3] tabular-nums shrink-0 pt-[3px] w-7"
      >
        {step.num}
      </span>

      {/* Content */}
      <div className="space-y-2.5 min-w-0">
        <h3 className="font-display font-semibold text-[1.15rem] sm:text-[1.35rem] leading-snug text-[#f3f3f3]">
          {step.title}
        </h3>

        <p className="font-body text-base leading-relaxed text-[#b8b8b8]">
          {step.description}
        </p>

        {step.pills && step.pills.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {step.pills.map((pill) => (
              <Tag key={pill.label} {...pill} />
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

/* ── Section ──────────────────────────────────────────────────────────── */

export default function PipelineSection() {
  return (
    <div className="space-y-10">

      {/* Section header */}
      <div className="space-y-3 max-w-2xl">
        <h2 className="font-display font-bold text-2xl sm:text-4xl text-[#f3f3f3] leading-tight">
          How a tweet moves through the system
        </h2>
        <p className="font-body text-base sm:text-lg text-[#b8b8b8] leading-relaxed">
          The path from a raw social-media post to a triage category. The key failure point is the
          tokenization step: if the text breaks badly early, the model cannot reason effectively about
          the message that follows.
        </p>
      </div>

      {/* Steps list */}
      <ol aria-label="Pipeline steps">
        {STEPS.map((step, i) => (
          <StepRow key={step.num} step={step} first={i === 0} />
        ))}
      </ol>

    </div>
  );
}
