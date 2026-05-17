'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Racket } from '@/lib/types';
import { fmtPriceNumeric } from '@/lib/format';
import { useCurrency } from '@/lib/useCurrency';
import { DEFAULT_CURRENCY, symbolFor } from '@/lib/currency';
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

export function BrowseClient({ rackets }: Props) {
  const { currency, rates, hydrated } = useCurrency();
  const cur = hydrated ? currency : undefined;
  const ratesArg = hydrated ? rates : undefined;

  const priceCeiling = useMemo(() => {
    let max = 0;
    rackets.forEach((r) => {
      const pr = fmtPriceNumeric(r, cur, ratesArg);
      if (Number.isFinite(pr) && pr > max) max = pr;
    });
    const step = max > 1000 ? 100 : 25;
    return Math.ceil(max / step) * step || 400;
  }, [rackets, cur, ratesArg]);

  const [brand, setBrand] = useState<Set<string>>(new Set());
  const [balance, setBalance] = useState<Set<string>>(new Set());
  const [flex, setFlex] = useState<Set<string>>(new Set());
  const [style, setStyle] = useState<Set<string>>(new Set());
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

  // When the currency (or live rates) shift, reset the slider to the new ceiling
  // so a prior value in a different unit doesn't silently exclude rackets.
  useEffect(() => {
    setMaxPrice(priceCeiling);
  }, [priceCeiling]);

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

  const activeFilterCount =
    brand.size + balance.size + flex.size + style.size + (maxPrice < priceCeiling ? 1 : 0);

  const clearAll = () => {
    setBrand(new Set());
    setBalance(new Set());
    setFlex(new Set());
    setStyle(new Set());
    setMaxPrice(priceCeiling);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rackets.filter((r) => {
      if (brand.size > 0 && !brand.has(r.brand)) return false;
      if (balance.size > 0 && (!r.balanceCategory || !balance.has(r.balanceCategory))) return false;
      if (flex.size > 0 && (!r.flexCategory || !flex.has(r.flexCategory))) return false;
      if (style.size > 0 && (!r.styleCategory || !style.has(r.styleCategory))) return false;
      const pr = fmtPriceNumeric(r, cur, ratesArg);
      if (Number.isFinite(pr) && pr > maxPrice) return false;
      if (q) {
        const hay = `${r.brand} ${r.displayName} ${r.series?.value ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list.sort((a, b) => {
      if (sort === 'brand-asc') return a.brand.localeCompare(b.brand) || a.displayName.localeCompare(b.displayName);
      if (sort === 'brand-desc') return b.brand.localeCompare(a.brand) || a.displayName.localeCompare(b.displayName);
      if (sort === 'model') return a.displayName.localeCompare(b.displayName);
      if (sort === 'price-asc') return fmtPriceNumeric(a, cur, ratesArg) - fmtPriceNumeric(b, cur, ratesArg);
      if (sort === 'price-desc') return fmtPriceNumeric(b, cur, ratesArg) - fmtPriceNumeric(a, cur, ratesArg);
      return 0;
    });
    return list;
  }, [rackets, brand, balance, flex, style, maxPrice, sort, query, cur, ratesArg]);

  return (
    <>
      <div className="border-y border-rule bg-paper">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex flex-wrap gap-x-5 gap-y-3 items-center font-sans text-sm">
          <MultiField label="Brand" selected={brand} onChange={setBrand} options={facets.brands} />
          <MultiField label="Balance" selected={balance} onChange={setBalance} options={facets.balances} />
          <MultiField label="Flex" selected={flex} onChange={setFlex} options={facets.flexes} />
          <MultiField label="Style" selected={style} onChange={setStyle} options={facets.styles} />
          <label className="flex items-center gap-2">
            <span className="text-dim">Max price</span>
            <input
              type="range"
              min={Math.max(5, Math.round(priceCeiling / 50))}
              max={priceCeiling}
              step={priceCeiling > 1000 ? 25 : 5}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-32"
              aria-label="Maximum price"
            />
            <span className="tabular-nums w-20">
              {symbolFor(hydrated ? currency : DEFAULT_CURRENCY)}{maxPrice}
            </span>
          </label>
          <SingleField
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
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-dim hover:text-accent underline underline-offset-2"
            >
              Clear filters ({activeFilterCount})
            </button>
          )}
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

type SingleOption = { value: string; label: string };

function SingleField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: SingleOption[];
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-dim">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2 py-1.5 border border-rule rounded bg-sheet"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function MultiField({
  label,
  selected,
  onChange,
  options,
}: {
  label: string;
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = (v: string) => {
    const next = new Set(selected);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    onChange(next);
  };

  const count = selected.size;
  const summary =
    count === 0
      ? 'All'
      : count === 1
        ? Array.from(selected)[0]
        : `${count} selected`;

  return (
    <div ref={ref} className="relative flex items-center gap-2">
      <span className="text-dim">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`px-2 py-1.5 border rounded bg-sheet flex items-center gap-1.5 min-w-[7rem] text-left ${
          count > 0 ? 'border-accent text-accent' : 'border-rule'
        }`}
      >
        <span className="truncate max-w-[10rem]">{summary}</span>
        <span aria-hidden="true" className="text-dim text-xs">▾</span>
      </button>
      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-30 top-full left-0 mt-1 bg-sheet border border-rule rounded shadow-lg max-h-72 overflow-y-auto min-w-[12rem]"
        >
          {count > 0 && (
            <button
              type="button"
              onClick={() => onChange(new Set())}
              className="block w-full text-left px-3 py-1.5 text-dim hover:bg-paper border-b border-rule text-xs uppercase tracking-wider"
            >
              Clear
            </button>
          )}
          {options.map((o) => {
            const isOn = selected.has(o);
            return (
              <label
                key={o}
                className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-sm hover:bg-paper ${
                  isOn ? 'text-accent' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={isOn}
                  onChange={() => toggle(o)}
                  className="accent-accent"
                />
                <span>{o}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
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
