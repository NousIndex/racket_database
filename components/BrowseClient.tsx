'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Racket } from '@/lib/types';
import { getValue } from '@/lib/sourced';
import { fmtPriceNumeric } from '@/lib/format';
import { RacketRow } from './RacketRow';
import { RacketCard } from './RacketCard';
import { RacketTable } from './RacketTable';
import { CompareDrawer } from './CompareDrawer';

type SortKey = 'brand-asc' | 'brand-desc' | 'model' | 'price-asc' | 'price-desc';
type ViewKey = 'list' | 'grid' | 'table';
const VIEW_STORAGE_KEY = 'racketdb:view';

interface Props {
  rackets: Racket[];
}

const ALL = 'All';

export function BrowseClient({ rackets }: Props) {
  const priceCeiling = useMemo(() => {
    let max = 0;
    rackets.forEach((r) => {
      const pr = getValue(r.price_min) ?? 0;
      if (pr > max) max = pr;
    });
    return Math.ceil(max / 25) * 25 || 400;
  }, [rackets]);

  const [brand, setBrand] = useState<string>(ALL);
  const [balance, setBalance] = useState<string>(ALL);
  const [flex, setFlex] = useState<string>(ALL);
  const [style, setStyle] = useState<string>(ALL);
  const [maxPrice, setMaxPrice] = useState<number>(priceCeiling);
  const [sort, setSort] = useState<SortKey>('brand-desc');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<ViewKey>('list');

  // Restore persisted view after hydration so SSR markup stays stable.
  useEffect(() => {
    const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (saved === 'list' || saved === 'grid' || saved === 'table') setView(saved);
  }, []);
  useEffect(() => {
    window.localStorage.setItem(VIEW_STORAGE_KEY, view);
  }, [view]);

  const facets = useMemo(() => {
    const brands = new Set<string>();
    const balances = new Set<string>();
    const flexes = new Set<string>();
    const styles = new Set<string>();
    rackets.forEach((r) => {
      brands.add(r.brand);
      if (r.balanceCategory) balances.add(r.balanceCategory);
      if (r.flexCategory) flexes.add(r.flexCategory);
      if (r.styleCategory) styles.add(r.styleCategory);
    });
    return {
      brands: [...brands].sort(),
      balances: [...balances].sort(),
      flexes: [...flexes].sort(),
      styles: [...styles].sort(),
    };
  }, [rackets]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rackets.filter((r) => {
      if (brand !== ALL && r.brand !== brand) return false;
      if (balance !== ALL && r.balanceCategory !== balance) return false;
      if (flex !== ALL && r.flexCategory !== flex) return false;
      if (style !== ALL && r.styleCategory !== style) return false;
      const pr = getValue(r.price_min) ?? 0;
      if (pr > maxPrice) return false;
      if (q) {
        const hay = `${r.brand} ${r.displayName} ${getValue(r.series) ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list.sort((a, b) => {
      if (sort === 'brand-asc') return a.brand.localeCompare(b.brand) || a.displayName.localeCompare(b.displayName);
      if (sort === 'brand-desc') return b.brand.localeCompare(a.brand) || a.displayName.localeCompare(b.displayName);
      if (sort === 'model') return a.displayName.localeCompare(b.displayName);
      if (sort === 'price-asc') return fmtPriceNumeric(a) - fmtPriceNumeric(b);
      if (sort === 'price-desc') return fmtPriceNumeric(b) - fmtPriceNumeric(a);
      return 0;
    });
    return list;
  }, [rackets, brand, balance, flex, style, maxPrice, sort, query]);

  return (
    <>
      <div className="border-y border-rule bg-paper">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex flex-wrap gap-x-5 gap-y-3 items-center font-sans text-sm">
          <Field label="Brand" value={brand} onChange={setBrand} options={[ALL, ...facets.brands]} />
          <Field label="Balance" value={balance} onChange={setBalance} options={[ALL, ...facets.balances]} />
          <Field label="Flex" value={flex} onChange={setFlex} options={[ALL, ...facets.flexes]} />
          <Field label="Style" value={style} onChange={setStyle} options={[ALL, ...facets.styles]} />
          <label className="flex items-center gap-2">
            <span className="text-dim">Max price</span>
            <input
              type="range"
              min={25}
              max={priceCeiling}
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
              { value: 'brand-desc', label: 'Brand Z→A' },
              { value: 'brand-asc', label: 'Brand A→Z' },
              { value: 'model', label: 'Model A→Z' },
              { value: 'price-asc', label: 'Price ↑' },
              { value: 'price-desc', label: 'Price ↓' },
            ]}
          />
          <div className="flex-1" />
          <ViewSwitcher view={view} onChange={setView} />
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
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 pb-8">
            {filtered.map((r) => <RacketCard key={r.slug} racket={r} />)}
          </div>
        ) : view === 'table' ? (
          <RacketTable rackets={filtered} />
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

const VIEW_OPTIONS: { value: ViewKey; label: string }[] = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
  { value: 'table', label: 'Table' },
];

function ViewSwitcher({ view, onChange }: { view: ViewKey; onChange: (v: ViewKey) => void }) {
  return (
    <div
      role="radiogroup"
      aria-label="View"
      className="flex items-center border border-rule rounded overflow-hidden"
    >
      {VIEW_OPTIONS.map((o) => {
        const active = o.value === view;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`px-2.5 py-1.5 border-l border-rule first:border-l-0 transition-colors ${
              active ? 'bg-ink text-paper' : 'bg-sheet hover:bg-paper text-dim hover:text-ink'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
