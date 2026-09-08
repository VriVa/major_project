const STATS = [
  {
    value: "0.6146",
    label: "MuRIL avg. Indic F1",
    accent: "text-[#5FC9BC]",
  },
  {
    value: "0.0842",
    label: "DistilBERT avg. Indic F1",
    accent: "text-[#E15B4F]",
  },
  {
    value: "52.75%",
    label: "BERT UNK-rate, Telugu",
    accent: "text-[#F2A93B]",
  },
  {
    value: "22.81",
    label: "RoBERTa tokens/word, Tamil",
    accent: "text-[#5FC9BC]",
  },
] as const;

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-headline"
      className="pt-36 pb-20 px-6"
    >
      <div className="mx-auto max-w-[1040px] space-y-10">

        {/* ── Eyebrow label ─────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <span className="block h-px w-10 bg-[#d9d9d9]" aria-hidden="true" />
          <p className="font-mono text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-[#d9d9d9]">
            Disaster-Response Tweet Classification
          </p>
        </div>

        {/* ── Headline ──────────────────────────────────────────────── */}
        <h1
          id="hero-headline"
          className="headline-clamp font-display font-bold tracking-tight text-[#f3f3f3] max-w-4xl"
        >
          One tweet, seven tokenizers,{" "}
          <span className="text-[#d9d9d9]">wildly different outcomes.</span>
        </h1>

        {/* ── Lede paragraph ────────────────────────────────────────── */}
        <p className="font-body text-lg sm:text-xl text-[#b8b8b8] max-w-3xl leading-relaxed">
          A step-by-step tokenizer walkthrough examining how an English-trained crisis
          classifier reads — or fundamentally fails to read — disaster tweets written
          in&nbsp;Hindi, Bengali, Tamil, Telugu, Malayalam, and Marathi. We trace each
          token through seven distinct models and surface exactly where meaning
          collapses.
        </p>

      </div>
    </section>
  );
}
