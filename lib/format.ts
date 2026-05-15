import type { Racket } from './types';
import { getValue } from './sourced';

export function fmt(v: unknown): string {
  if (v == null || v === '') return '—';
  if (Array.isArray(v)) return v.length ? v.join(' · ') : '—';
  return String(v);
}

export function fmtPrice(r: Racket): string {
  const lo = getValue(r.price_min);
  const hi = getValue(r.price_max);
  const cur = getValue(r.currency) ?? 'USD';
  const symbol = cur === 'USD' ? '$' : `${cur} `;
  if (lo == null) return '—';
  const loF = Number.isInteger(lo) ? lo.toFixed(0) : lo.toFixed(2);
  if (hi == null || hi === lo) return `${symbol}${loF}`;
  const hiF = Number.isInteger(hi) ? hi.toFixed(0) : hi.toFixed(2);
  return `${symbol}${loF}–${symbol}${hiF}`;
}

export function fmtPriceNumeric(r: Racket): number {
  return getValue(r.price_min) ?? Number.POSITIVE_INFINITY;
}
