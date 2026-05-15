import Link from 'next/link';
import type { Metadata } from 'next';
import { getRacketsBySlugs } from '@/lib/data';
import { CompareTable } from '@/components/CompareTable';

interface Props {
  searchParams: Promise<{ ids?: string }>;
}

function parseIds(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default async function ComparePage({ searchParams }: Props) {
  const { ids } = await searchParams;
  const idList = parseIds(ids);
  const rackets = getRacketsBySlugs(idList).slice(0, 4);
  const missing = idList.filter((id) => !rackets.find((r) => r.slug === id));

  return (
    <>
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-12 md:pt-14 pb-6">
        <div className="font-sans text-[11px] tracking-widest uppercase text-accent mb-3">Side by side</div>
        <h1 className="text-3xl md:text-5xl font-serif font-normal tracking-tight leading-[1.05]">
          {rackets.length >= 2
            ? rackets.map((r) => r.displayName).join(' · ')
            : 'A study in contrast'}
        </h1>
        <p className="mt-4 font-serif text-base md:text-lg text-dim max-w-2xl leading-relaxed">
          Up to four rackets, laid down end to end. Every disagreement marked, every value attributed.
        </p>
        {missing.length > 0 && (
          <p className="mt-4 font-sans text-sm text-accent">
            Could not find {missing.length} racket(s): {missing.join(', ')}
          </p>
        )}
        {rackets.length < 2 && (
          <p className="mt-6 font-sans text-sm">
            <Link href="/" className="underline underline-offset-2">← Pick rackets from the browse view</Link>
          </p>
        )}
      </section>
      <CompareTable rackets={rackets} />
    </>
  );
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { ids } = await searchParams;
  const rackets = getRacketsBySlugs(parseIds(ids)).slice(0, 4);
  if (rackets.length < 2) return { title: 'Compare — Racket Database' };
  return {
    title: `${rackets.map((r) => r.displayName).join(' vs ')} — Racket Database`,
  };
}

export const dynamic = 'force-dynamic';
