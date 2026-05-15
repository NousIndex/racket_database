import { sourceLabel, sourceTier } from '@/lib/sourced';
import type { SourceTier } from '@/lib/types';

const TIER_STYLES: Record<SourceTier, string> = {
  manufacturer: 'bg-accent/10 text-accent border-accent/20',
  distributor: 'tier-dst-bg tier-dst-fg tier-rule-soft border',
  retailer: 'tier-ret-bg tier-ret-fg tier-rule-soft border',
  unknown: 'tier-ret-bg tier-ret-fg tier-rule-soft border opacity-70',
};

const TIER_SHORT: Record<SourceTier, string> = {
  manufacturer: 'MFR',
  distributor: 'DST',
  retailer: 'RET',
  unknown: '—',
};

interface Props {
  source: string | null | undefined;
  variant?: 'pill' | 'dot';
}

export function SourceBadge({ source, variant = 'pill' }: Props) {
  const tier = sourceTier(source);
  if (variant === 'dot') {
    return (
      <span
        className={`inline-block w-1.5 h-1.5 rounded-full ${
          tier === 'manufacturer' ? 'bg-accent' : tier === 'distributor' ? 'bg-dim' : 'bg-dim/60'
        }`}
        title={sourceLabel(source)}
        aria-label={`Source: ${sourceLabel(source)}`}
      />
    );
  }
  return (
    <span
      className={`inline-block font-sans text-[9px] tracking-wider px-1.5 py-0.5 rounded border align-middle ml-1.5 ${TIER_STYLES[tier]}`}
      title={sourceLabel(source)}
    >
      {TIER_SHORT[tier]}
    </span>
  );
}
