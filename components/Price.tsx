'use client';

import type { Racket } from '@/lib/types';
import { fmtPrice } from '@/lib/format';
import { useCurrency } from '@/lib/useCurrency';

interface Props {
  racket: Racket;
  className?: string;
}

// Renders a price in the user's chosen currency. Before hydration we render
// the native price so SSR markup matches the first client paint.
export function Price({ racket, className }: Props) {
  const { currency, rates, hydrated } = useCurrency();
  const text = hydrated ? fmtPrice(racket, currency, rates) : fmtPrice(racket);
  return <span className={className}>{text}</span>;
}
