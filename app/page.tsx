import { getRackets } from '@/lib/data';
import { BrowseClient } from '@/components/BrowseClient';

export default function BrowsePage() {
  const rackets = getRackets();
  return (
    <>
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-12 md:pt-16 pb-7">
        <div className="max-w-4xl">
          <div className="font-sans text-[11px] tracking-widest uppercase text-accent mb-3">A Field Guide</div>
          <h1 className="text-4xl md:text-6xl font-serif font-normal tracking-tight leading-[1.05]">
            Pick the racket that picks the rally.
          </h1>
          <p className="mt-4 font-serif text-lg text-dim max-w-2xl leading-relaxed">
            Every spec, sourced and attributed. {rackets.length} rackets, lined up so the differences read like a poem — quiet and exact.
          </p>
        </div>
      </section>
      <BrowseClient rackets={rackets} />
    </>
  );
}
