import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getRacketBySlug, getRackets } from '@/lib/data';
import { getValue } from '@/lib/sourced';
import { fmt, fmtPrice } from '@/lib/format';
import { ImageCarousel } from '@/components/ImageCarousel';
import { SourceBadge } from '@/components/SourceBadge';
import { CompareButton } from '@/components/CompareButton';
import type { Racket, Sourced } from '@/lib/types';

type SourcedKey =
  | 'series' | 'product_tier' | 'balance' | 'shaft_flex' | 'player_type'
  | 'performance' | 'stringing_advice' | 'string_pattern' | 'racquet_length'
  | 'weight_grip_options' | 'materials' | 'tech_specs' | 'parent_sku';

export function generateStaticParams() {
  return getRackets().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const r = getRacketBySlug(slug);
  if (!r) return { title: 'Not found' };
  return {
    title: `${r.brand} ${r.displayName} — Racket Database`,
    description: Object.values(r.descriptions || {})[0]?.slice(0, 160),
  };
}

const SPEC_FIELDS: { label: string; key: SourcedKey }[] = [
  { label: 'Series', key: 'series' },
  { label: 'Tier', key: 'product_tier' },
  { label: 'Balance', key: 'balance' },
  { label: 'Shaft flex', key: 'shaft_flex' },
  { label: 'Player type', key: 'player_type' },
  { label: 'Style', key: 'performance' },
  { label: 'Stringing', key: 'stringing_advice' },
  { label: 'String pattern', key: 'string_pattern' },
  { label: 'Length', key: 'racquet_length' },
  { label: 'Weight / grip', key: 'weight_grip_options' },
  { label: 'Materials', key: 'materials' },
  { label: 'Technologies', key: 'tech_specs' },
  { label: 'Parent SKU', key: 'parent_sku' },
];

export default async function RacketPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const racket = getRacketBySlug(slug);
  if (!racket) notFound();

  const description = Object.entries(racket.descriptions || {});
  const rawSpecs = Object.entries(racket.raw_specs || {}).flatMap(([source, fields]) =>
    Object.entries(fields).map(([k, v]) => ({ source, label: k, value: v as unknown }))
  );

  const sourceLinks = Object.entries(racket.source_urls || {});

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-12 pt-6 pb-32">
      <Link href="/" className="font-sans text-xs text-dim hover:text-ink underline underline-offset-2">
        ← All rackets
      </Link>

      <div className="grid md:grid-cols-2 gap-10 md:gap-16 mt-6">
        <div>
          <ImageCarousel images={racket.image_urls || []} alt={`${racket.brand} ${racket.displayName}`} />
        </div>

        <div>
          <div className="font-sans text-[11px] tracking-widest uppercase text-dim mb-3">
            {racket.brand}{getValue(racket.series) ? ` · ${getValue(racket.series)}` : ''}
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-normal tracking-tight leading-[1.05]">
            {racket.displayName}
          </h1>
          <div className="font-sans text-2xl text-accent font-semibold mt-4 tabular-nums">
            {fmtPrice(racket)}
          </div>
          <div className="mt-5">
            <CompareButton slug={racket.slug} />
          </div>

          <dl className="mt-10 border-y-2 border-ink">
            {SPEC_FIELDS.map(({ label, key }) => {
              const sv = racket[key] as Sourced<string | string[]>;
              const value = sv?.value ?? null;
              const source = sv?.source ?? null;
              const display = Array.isArray(value) ? value.join(' · ') : (value as string | number | null);
              return (
                <div key={String(key)} className="grid grid-cols-[140px_1fr] border-b border-rule last:border-b-0">
                  <dt className="font-sans text-[11px] tracking-wider uppercase text-dim py-3 px-1">{label}</dt>
                  <dd className="py-3 px-1 font-sans text-sm">
                    {fmt(display)}
                    {source && <SourceBadge source={source} />}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>

      {description.length > 0 && (
        <section className="mt-16 max-w-3xl">
          <h2 className="font-sans text-[11px] tracking-widest uppercase text-dim mb-6">From the sources</h2>
          <div className="space-y-8">
            {description.map(([source, text]) => (
              <article key={source}>
                <div className="font-sans text-[11px] tracking-wider uppercase text-dim mb-2">
                  <SourceBadge source={source} />
                </div>
                <p className="font-serif text-lg leading-relaxed text-ink">{text}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {rawSpecs.length > 0 && (
        <section className="mt-16 max-w-3xl">
          <h2 className="font-sans text-[11px] tracking-widest uppercase text-dim mb-4">Additional details</h2>
          <dl className="font-sans text-sm">
            {rawSpecs.map((row, i) => (
              <div key={i} className="grid grid-cols-[180px_1fr] border-b border-rule py-2">
                <dt className="text-dim">
                  {row.label}
                  <SourceBadge source={row.source} />
                </dt>
                <dd>{fmt(Array.isArray(row.value) ? row.value.join(', ') : (row.value as string))}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {sourceLinks.length > 0 && (
        <section className="mt-16 max-w-3xl">
          <h2 className="font-sans text-[11px] tracking-widest uppercase text-dim mb-4">Source pages</h2>
          <ul className="font-sans text-sm space-y-2">
            {sourceLinks.map(([source, url]) => (
              <li key={source}>
                <SourceBadge source={source} />{' '}
                <a href={url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-accent break-all">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
