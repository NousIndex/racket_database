'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CURRENCIES,
  CurrencyCode,
  DEFAULT_CURRENCY,
  FALLBACK_RATES,
  Rates,
  isSupportedCurrency,
} from './currency';

const CUR_KEY = 'racket-companion:currency';
const CUR_EVENT = 'racket-companion:currency-change';
const RATES_KEY = 'racket-companion:rates';
const RATES_EVENT = 'racket-companion:rates-change';
const RATES_TTL_MS = 12 * 60 * 60 * 1000;
const API_URL = 'https://open.er-api.com/v6/latest/USD';

interface CachedRates {
  rates: Rates;
  fetchedAt: number;
}

function readCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;
  try {
    const v = window.localStorage.getItem(CUR_KEY);
    return isSupportedCurrency(v) ? v : DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
}

function writeCurrency(c: CurrencyCode) {
  try {
    window.localStorage.setItem(CUR_KEY, c);
    window.dispatchEvent(new CustomEvent(CUR_EVENT));
  } catch {}
}

function readRates(): CachedRates | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(RATES_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (obj && obj.rates && typeof obj.fetchedAt === 'number') return obj as CachedRates;
    return null;
  } catch {
    return null;
  }
}

function writeRates(r: CachedRates) {
  try {
    window.localStorage.setItem(RATES_KEY, JSON.stringify(r));
    window.dispatchEvent(new CustomEvent(RATES_EVENT));
  } catch {}
}

let fetchInFlight: Promise<void> | null = null;

function ensureRates() {
  if (typeof window === 'undefined') return;
  const cached = readRates();
  if (cached && Date.now() - cached.fetchedAt < RATES_TTL_MS) return;
  if (fetchInFlight) return;
  fetchInFlight = fetch(API_URL)
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
    .then((data) => {
      if (!data || !data.rates || typeof data.rates !== 'object') return;
      const next: Rates = {};
      for (const c of CURRENCIES) {
        const v = data.rates[c.code];
        if (typeof v === 'number' && v > 0) next[c.code] = v;
      }
      next.USD = 1;
      if (Object.keys(next).length < 2) return;
      writeRates({ rates: next, fetchedAt: Date.now() });
    })
    .catch(() => {})
    .finally(() => {
      fetchInFlight = null;
    });
}

export function useCurrency() {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [rates, setRates] = useState<Rates>(FALLBACK_RATES);
  const [ratesLive, setRatesLive] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCurrencyState(readCurrency());
    const cached = readRates();
    if (cached) {
      setRates({ ...FALLBACK_RATES, ...cached.rates });
      setRatesLive(true);
    }
    setHydrated(true);
    ensureRates();

    const syncCurrency = () => setCurrencyState(readCurrency());
    const syncRates = () => {
      const c = readRates();
      if (c) {
        setRates({ ...FALLBACK_RATES, ...c.rates });
        setRatesLive(true);
      }
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === CUR_KEY) syncCurrency();
      if (e.key === RATES_KEY) syncRates();
    };
    window.addEventListener(CUR_EVENT, syncCurrency);
    window.addEventListener(RATES_EVENT, syncRates);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(CUR_EVENT, syncCurrency);
      window.removeEventListener(RATES_EVENT, syncRates);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    writeCurrency(c);
  }, []);

  return { currency, setCurrency, rates, ratesLive, hydrated };
}
