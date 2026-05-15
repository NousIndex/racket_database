'use client';

import { useMemo, useState } from 'react';
import type { Racket } from '@/lib/types';
import { getValue } from '@/lib/sourced';
import { fmtPriceNumeric } from '@/lib/format';
import { RacketRow } from './RacketRow';
import { CompareDrawer } from './CompareDrawer';

type SortKey = 'brand' | 'model' | 'price-asc' | 'price-desc';

interface Props {
  rackets: Racket[];
}

const ALL = 'All';

export function BrowseClient({ rackets }: Props) {
  const [brand, setBrand] = useState<string>(ALL);
  const [balance, setBalance] = useState<string>(ALL);
  const [flex, setFlex] = useState<string>(ALL);
  const [performance, setPerformance] = useState<string>(ALL);
  const [maxPrice, setMaxPrice] = useState<number>(400);
  const [sort, setSort] = useState<SortKey>('brand');
  const [query, setQuery] = useState('');

  const facets = useMemo(() => {
    const brands = new Set<string>();
    const balances = new Set<string>();
    const flexes = new Set<string>();
    const perfs = new Set<string>();
    let priceCeiling = 0;
    rackets.forEach((r) => {
      brands.add(r.brand);
      if (r.balanceCategory) balances.add(r.balanceCategory);
      if (r.flexCategory) flexes.add(r.flexCategory);
      const p = getValue(r.performance);
      if (p) perfs.add(p);
      const pr = getValue(r.price_min) ?? 0;
      if (pr > priceCeiling) priceCeiling = pr;
    });
    return {
      brands: [...brands].sort(),
      balances: [...balances].sort(),
      flexes: [...flexes].sort(),
      perfs: [...perfs].sort(),
      priceCeiling: Math.ceil(priceCeiling / 25) * 25 || 400,
    };
  }, [rackets]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rackets.filter((r) => {
      if (brand !== ALL && r.brand !== brand) return false;
      if (balance !== ALL && r.balanceCategory !== balance) return false;
      if (flex !== ALL && r.flexCategory !== flex) return false;
      if (performance !== ALL && getValue(r.performance) !== performance) return false;
      const pr = getValue(r.price_min) ?? 0;
      if (pr > maxPrice) return false;
      if (q) {
        const hay = `${r.brand} ${r.displayName} ${getValue(r.series) ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list.sort((a, b) => {
      if (sort === 'brand') return a.brand.localeCompare(b.brand) || a.displayName.localeCompare(b.displayName);
      if (sort === 'model') return a.displayName.localeCompare(b.displayName);
      if (sort === 'price-asc') return fmtPriceNumeric(a) - fmtPriceNumeric(b);
      if (sort === 'price-desc') return fmtPriceNumeric(b) - fmtPriceNumeric(a);
      return 0;
    });
    return list;
  }, [rackets, brand, balance, flex, performance, maxPrice, sort, query]);

  return (
    <>
      <div className="border-y border-rule bg-paper">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex flex-wrap gap-x-5 gap-y-3 items-center font-sans text-sm">
          <Field label="Brand" value={brand} onChange={setBrand} options={[ALL, ...facets.brands]} />
          <Field label="Balance" value={balance} onChange={setBalance} options={[ALL, ...facets.balances]} />
          <Field label="Flex" value={flex} onChange={setFlex} options={[ALL, ...facets.flexes]} />
          <Field label="Style" value={performance} onChange={setPerformance} options={[ALL, ...facets.perfs]} />
          <label className="flex items-center gap-2">
            <span className="text-dim">Max price</span>
            <input
              type="range"
              min={25}
              max={facets.priceCeiling}
              step={5}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-32"
              aria-label="Maximum price"
            />
            <span className="tabular-nums w-14">${maxPrice}</span>
          </label>
          <Field
            label="Sort"
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
            options={[
              { value: 'brand', label: 'Brand A→Z' },
              { value: 'model', label: 'Model A→Z' },
              { value: 'price-asc', label: 'Price ↑' },
              { value: 'price-desc', label: 'Price ↓' },
            ]}
          />
          <div className="flex-1" />
          <label className="flex items-center gap-2">
            <span className="sr-only">Search model</span>
            <input
              type="search"
              placeholder="Search model…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-2.5 py-1.5 border border-rule rounded bg-sheet w-48 md:w-64"
            />
          </label>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-12 pb-32">
        <div className="font-sans text-xs text-dim py-4 tabular-nums">
          {filtered.length} {filtered.length === 1 ? 'racket' : 'rackets'}
        </div>
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-dim font-sans">No rackets match these filters.</div>
        ) : (
          filtered.map((r) => <RacketRow key={r.slug} racket={r} />)
        )}
      </main>

      <CompareDrawer rackets={rackets} />
    </>
  );
}

type Option = string | { value: string; label: string };

function Field({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-dim">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2 py-1.5 border border-rule rounded bg-sheet"
      >
        {options.map((o) => {
          const v = typeof o === 'string' ? o : o.value;
          const l = typeof o === 'string' ? o : o.label;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </label>
  );
}
