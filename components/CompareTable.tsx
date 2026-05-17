'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import type { Racket, Sourced } from '@/lib/types';
import { getSource } from '@/lib/sourced';
import { fmt, fmtPrice } from '@/lib/format';
import { SourceBadge } from './SourceBadge';
import { useCurrency } from '@/lib/useCurrency';

type SourcedKey =
  | 'series' | 'product_tier' | 'balance' | 'shaft_flex' | 'player_type'
  | 'performance' | 'stringing_advice' | 'string_pattern' | 'racquet_length'
  | 'weight_grip_options' | 'materials' | 'tech_specs';

const FIELDS: { label: string; key: SourcedKey }[] = [
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
];

interface Props {
  rackets: Racket[];
}

export function CompareTable({ rackets }: Props) {
  const [diffsOnly, setDiffsOnly] = useState(false);
  const { currency, rates, hydrated } = useCurrency();
  const priced = (r: Racket) =>
    hydrated ? fmtPrice(r, currency, rates) : fmtPrice(r);

  if (rackets.length < 2) {
    return (
      <div className="px-6 md:px-12 py-20 text-center font-sans text-dim">
        Add at least two rackets from the <Link className="underline" href="/">browse view</Link> to compare.
      </div>
    );
  }

  const colCount = rackets.length;
  const colTemplate = `200px repeat(${colCount}, minmax(0, 1fr))`;

  // Pre-compute which rows differ
  const rows = FIELDS.map(({ label, key }) => {
    const cells = rackets.map((r) => {
      const sv = r[key] as Sourced<string | string[]>;
      const value = sv?.value ?? null;
      const source = sv?.source ?? null;
      const display = Array.isArray(value) ? value.join(' · ') : (value as string | number | null);
      return { display, source };
    });
    const norm = cells.map((c) => (c.display ?? '').toString().trim().toLowerCase());
    const differs = !norm.every((v) => v === norm[0]);
    return { label, key, cells, differs };
  });

  // Price row
  const priceCells = rackets.map((r) => ({ display: priced(r), source: getSource(r.price_min) }));
  const priceDiffers = !priceCells.every((c) => c.display === priceCells[0].display);

  const visibleRows = diffsOnly ? rows.filter((r) => r.differs) : rows;

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pb-20">
      <div className="flex justify-between items-end mb-4 gap-4 flex-wrap">
        <p className="font-sans text-sm text-dim max-w-xl">
          Cells in <span className="bg-highlight px-1">cream</span> mark spec disagreements across the selected rackets.
          Source tier is tagged on every value.
        </p>
        <label className="font-sans text-sm flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={diffsOnly}
            onChange={(e) => setDiffsOnly(e.target.checked)}
            className="accent-accent"
          />
          Show differences only
        </label>
      </div>

      <div className="border-y-2 border-ink overflow-x-auto -mx-6 md:mx-0">
        <div className="min-w-[640px]">
          {/* Header row */}
          <div className="grid border-b border-rule" style={{ gridTemplateColumns: colTemplate }}>
            <div />
            {rackets.map((r) => (
              <div key={r.slug} className="p-4 border-l border-rule">
                <Link href={`/rackets/${r.slug}`} className="block hover:text-accent">
                  <div className="w-20 h-20 bg-sheet border border-rule grid place-items-center overflow-hidden mb-3">
                    {r.image_urls?.[0] && (
                      <Image
                        src={r.image_urls[0]}
                        alt=""
                        width={80}
                        height={80}
                        className="max-w-[88%] max-h-[88%] object-contain"
                        unoptimized
                      />
                    )}
                  </div>
                  <div className="font-sans text-[10px] tracking-wider uppercase text-dim mb-1">{r.brand}</div>
                  <div className="font-serif text-base md:text-lg font-medium leading-tight">{r.displayName}</div>
                  <div className="font-sans text-xs text-accent font-semibold mt-2 tabular-nums">{priced(r)}</div>
                </Link>
              </div>
            ))}
          </div>

          {/* Price row */}
          <Row
            label="Price"
            cells={priceCells}
            differs={priceDiffers}
            colTemplate={colTemplate}
          />

          {visibleRows.map((row) => (
            <Row
              key={String(row.key)}
              label={row.label}
              cells={row.cells}
              differs={row.differs}
              colTemplate={colTemplate}
            />
          ))}
        </div>
      </div>

      <p className="font-sans text-xs text-dim mt-4">
        Source tiers: <span className="text-accent font-semibold">MFR</span> manufacturer ·
        <span className="tier-dst-fg font-semibold ml-1">DST</span> distributor ·
        <span className="tier-ret-fg font-semibold ml-1">RET</span> retailer.
        Manufacturer-sourced values are the most authoritative.
      </p>
    </div>
  );
}

function Row({
  label,
  cells,
  differs,
  colTemplate,
}: {
  label: string;
  cells: { display: string | number | null; source: string | null }[];
  differs: boolean;
  colTemplate: string;
}) {
  return (
    <div className="grid border-b border-rule last:border-b-0" style={{ gridTemplateColumns: colTemplate }}>
      <div className="font-sans text-[11px] tracking-wider uppercase text-dim p-4 bg-paper/50">{label}</div>
      {cells.map((c, i) => (
        <div
          key={i}
          className={`p-4 border-l border-rule font-sans text-sm ${differs ? 'bg-highlight font-semibold' : ''}`}
        >
          {fmt(c.display)}
          {c.source && <SourceBadge source={c.source} />}
        </div>
      ))}
    </div>
  );
}
