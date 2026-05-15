'use client';

import { useCompareSelection } from '@/lib/useCompareSelection';

interface Props {
  slug: string;
  className?: string;
}

export function CompareButton({ slug, className = '' }: Props) {
  const { list, hydrated, toggle } = useCompareSelection();
  const selected = list.includes(slug);
  // Avoid hydration mismatch: render neutral state until hydrated.
  const label = !hydrated ? 'Add to compare' : selected ? '✓ In compare' : 'Add to compare';

  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={selected}
      className={`font-sans text-xs px-3.5 py-1.5 rounded-full border transition ${
        selected
          ? 'bg-ink text-paper border-ink'
          : 'bg-transparent text-ink border-ink hover:bg-ink hover:text-paper'
      } ${className}`}
    >
      {label}
    </button>
  );
}
