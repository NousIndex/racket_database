'use client';

import { CURRENCIES, CurrencyCode, DEFAULT_CURRENCY } from '@/lib/currency';
import { useCurrency } from '@/lib/useCurrency';

export function CurrencySelector() {
  const { currency, setCurrency, hydrated, ratesLive } = useCurrency();
  const value = hydrated ? currency : DEFAULT_CURRENCY;
  const title = ratesLive
    ? 'Display currency — converted at live mid-market rates (approximate)'
    : 'Display currency — converted at approximate rates';

  return (
    <label
      className="font-sans text-[11px] tracking-widest uppercase text-dim flex items-center gap-1.5"
      title={title}
    >
      <span className="sr-only">Display currency</span>
      <span aria-hidden="true">¤</span>
      <select
        value={value}
        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        aria-label="Display currency"
        className="bg-paper text-dim hover:text-ink uppercase tracking-widest text-[11px] cursor-pointer focus:outline-none"
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code} className="bg-sheet text-ink normal-case tracking-normal">
            {c.code}
          </option>
        ))}
      </select>
    </label>
  );
}
