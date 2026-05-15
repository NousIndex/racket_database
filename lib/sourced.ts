import type { Sourced, SourceTier } from './types';

export function getValue<T>(sv: Sourced<T>): T | null {
  if (sv == null) return null;
  return sv.value;
}

export function getSource<T>(sv: Sourced<T>): string | null {
  if (sv == null) return null;
  return sv.source;
}

export function sourceTier(source: string | null | undefined): SourceTier {
  if (!source) return 'unknown';
  if (source === 'yonex_us' || source === 'victor_global') return 'manufacturer';
  if (source === 'li_ning_family') return 'distributor';
  if (source.startsWith('badminton_warehouse_')) return 'retailer';
  return 'unknown';
}

const TIER_RANK: Record<SourceTier, number> = {
  manufacturer: 3,
  distributor: 2,
  retailer: 1,
  unknown: 0,
};

export function tierRank(tier: SourceTier): number {
  return TIER_RANK[tier];
}

export function sourceLabel(source: string | null | undefined): string {
  if (!source) return '—';
  return source
    .replace(/^badminton_warehouse_/, 'BW · ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
