// Currency support for the price display. Rates are USD-base
// (i.e. `rates.EUR = 0.92` means "1 USD = 0.92 EUR").

export type CurrencyCode = 'USD' | 'EUR' | 'SGD' | 'MYR';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  label: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', label: 'USD' },
  { code: 'EUR', symbol: '€', label: 'EUR' },
  { code: 'SGD', symbol: 'S$', label: 'SGD' },
  { code: 'MYR', symbol: 'RM', label: 'MYR' },
];

export const DEFAULT_CURRENCY: CurrencyCode = 'USD';

// Approximate mid-market rates used until the live rates API responds, and as a
// fallback when the network is unavailable. Updated occasionally by hand.
export const FALLBACK_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  SGD: 1.35,
  MYR: 4.70,
};

export type Rates = Record<string, number>;

export function isSupportedCurrency(code: unknown): code is CurrencyCode {
  return code === 'USD' || code === 'EUR' || code === 'SGD' || code === 'MYR';
}

export function symbolFor(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? `${code} `;
}

// Convert `amount` from `from` to `to` using `rates` (USD-base). Returns null
// when either currency is missing from the table.
export function convertPrice(
  amount: number,
  from: string,
  to: string,
  rates: Rates,
): number | null {
  if (!Number.isFinite(amount)) return null;
  if (from === to) return amount;
  const fr = rates[from];
  const tr = rates[to];
  if (!fr || !tr || fr <= 0 || tr <= 0) return null;
  return (amount / fr) * tr;
}
