import TopNav from "./components/TopNav";
import Hero from "./components/Hero";
import PipelineSection from "./components/PipelineSection";
import TokenizerDemo from "./components/TokenizerDemo";
import ClassifyDemo from "./components/ClassifyDemo";
import ResultsSection, { TaptSection } from "./components/ResultsSection";
import Footer from "./components/Footer";


function Section({
  id,
  children,
  className = "",
}: {
  id: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-label={id}
      className={`border-t border-[#2A3438] py-16 px-6 scroll-mt-16 ${className}`}
    >
      <div className="mx-auto max-w-[1040px]">{children}</div>
    </section>
  );
}



/* ── Page  */
export default function Home() {
  return (
    <>
      <TopNav />

      <main>
        {/* Hero lives outside the section grid — has its own top padding */}
        <Hero />

        {/* ── Section: Pipeline ─────────────────────────────────────── */}
        <Section id="pipeline">
          <PipelineSection />
        </Section>

        {/* ── Section: Tokenizer ────────────────────────────────────── */}
        <Section id="tokenizer">
          <TokenizerDemo />
        </Section>

        {/* ── Section: Classify ─────────────────────────────────────── */}
        <Section id="classify">
          <ClassifyDemo />
        </Section>

        {/* ── Section: TAPT ablation ────────────────────────────────── */}
        <Section id="tapt">
          <TaptSection />
        </Section>

        {/* ── Section: Results ──────────────────────────────────────── */}
        <Section id="results">
          <ResultsSection />
        </Section>
      </main>

      <Footer />
    </>
  );
}
