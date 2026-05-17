import type { Racket } from './types';
import { getValue } from './sourced';
import { convertPrice, Rates, symbolFor } from './currency';

export function fmt(v: unknown): string {
  if (v == null || v === '') return '—';
  if (Array.isArray(v)) return v.length ? v.join(' · ') : '—';
  return String(v);
}

// Renders a price in either its native currency (no extra args) or the user's
// chosen display currency (when `displayCurrency` + `rates` are passed).
// Converted prices are prefixed with "≈" since mid-market rates are approximate.
export function fmtPrice(
  r: Racket,
  displayCurrency?: string,
  rates?: Rates,
): string {
  const lo = getValue(r.price_min);
  if (lo == null) return '—';
  const hi = getValue(r.price_max);
  const native = getValue(r.currency) ?? 'USD';

  let loOut = lo;
  let hiOut = hi;
  let useCur = native;
  let approx = false;

  if (displayCurrency && rates && displayCurrency !== native) {
    const cLo = convertPrice(lo, native, displayCurrency, rates);
    if (cLo != null) {
      loOut = cLo;
      if (hi != null) {
        const cHi = convertPrice(hi, native, displayCurrency, rates);
        if (cHi != null) hiOut = cHi;
      }
      useCur = displayCurrency;
      approx = true;
    }
  }

  const sym = symbolFor(useCur);
  const prefix = approx ? '≈' : '';
  const fmtN = (n: number) =>
    approx
      ? Math.round(n).toLocaleString()
      : Number.isInteger(n)
        ? n.toFixed(0)
        : n.toFixed(2);

  if (hiOut == null || hiOut === loOut) return `${prefix}${sym}${fmtN(loOut)}`;
  return `${prefix}${sym}${fmtN(loOut)}–${sym}${fmtN(hiOut)}`;
}

export function fmtPriceNumeric(
  r: Racket,
  displayCurrency?: string,
  rates?: Rates,
): number {
  const lo = getValue(r.price_min);
  if (lo == null) return Number.POSITIVE_INFINITY;
  const native = getValue(r.currency) ?? 'USD';
  if (!displayCurrency || !rates || displayCurrency === native) return lo;
  const c = convertPrice(lo, native, displayCurrency, rates);
  return c ?? lo;
}
