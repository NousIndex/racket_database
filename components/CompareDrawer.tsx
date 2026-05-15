'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import type { Racket } from '@/lib/types';
import { useCompareSelection, MAX_COMPARE } from '@/lib/useCompareSelection';

interface Props {
  rackets: Racket[];
}

export function CompareDrawer({ rackets }: Props) {
  const { list, hydrated, remove, clear } = useCompareSelection();
  const lookup = useMemo(() => new Map(rackets.map((r) => [r.slug, r])), [rackets]);
  const items = list.map((slug) => lookup.get(slug)).filter((r): r is Racket => r != null);

  if (!hydrated || items.length === 0) return null;

  const href = `/compare?ids=${items.map((r) => r.slug).join(',')}`;
  const canCompare = items.length >= 2;

  return (
    <div
      role="region"
      aria-label="Compare selection"
      className="fixed left-0 right-0 bottom-0 bg-sheet border-t border-rule shadow-[0_-10px_30px_rgba(0,0,0,0.04)] z-30"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-3 md:py-4 flex flex-wrap items-center gap-3 md:gap-4 font-sans text-sm">
        <span className="text-[11px] tracking-wider uppercase text-dim">Compare ({items.length}/{MAX_COMPARE})</span>
        <ul className="flex flex-wrap gap-2 flex-1 min-w-0">
          {items.map((r) => (
            <li
              key={r.slug}
              className="flex items-center gap-2 pl-1 pr-2 py-1 border border-rule rounded-full bg-paper max-w-full"
            >
              <span className="w-7 h-7 bg-sheet border border-rule rounded-full grid place-items-center overflow-hidden shrink-0">
                {r.image_urls?.[0] && (
                  <Image src={r.image_urls[0]} alt="" width={28} height={28} className="object-contain max-w-[80%] max-h-[80%]" unoptimized />
                )}
              </span>
              <span className="text-xs truncate max-w-[140px]">{r.displayName}</span>
              <button
                type="button"
                onClick={() => remove(r.slug)}
                aria-label={`Remove ${r.displayName} from compare`}
                className="text-accent hover:text-ink text-base leading-none px-1"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-dim hover:text-ink underline underline-offset-2"
        >
          Clear
        </button>
        {canCompare ? (
          <Link
            href={href}
            className="bg-ink text-paper text-xs tracking-wider uppercase px-5 py-2.5 rounded-full hover:bg-accent transition"
          >
            Read side-by-side →
          </Link>
        ) : (
          <span className="text-xs text-dim">Add another to compare</span>
        )}
      </div>
    </div>
  );
}
