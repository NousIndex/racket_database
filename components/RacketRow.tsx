import Link from 'next/link';
import Image from 'next/image';
import type { Racket } from '@/lib/types';
import { getValue } from '@/lib/sourced';
import { fmt, fmtPrice } from '@/lib/format';
import { SourceBadge } from './SourceBadge';
import { CompareButton } from './CompareButton';

interface Props {
  racket: Racket;
}

export function RacketRow({ racket }: Props) {
  const balance = racket.balanceCategory;
  const flex = racket.flexCategory;
  const perf = getValue(racket.performance);
  const series = getValue(racket.series);
  const firstImage = racket.image_urls?.[0];

  return (
    <article className="grid grid-cols-[80px_1fr_auto] md:grid-cols-[112px_1fr_auto] gap-5 md:gap-7 py-6 border-b border-rule items-center">
      <Link href={`/rackets/${racket.slug}`} className="block w-20 h-20 md:w-28 md:h-28 bg-sheet border border-rule grid place-items-center overflow-hidden">
        {firstImage ? (
          <Image
            src={firstImage}
            alt={`${racket.brand} ${racket.displayName}`}
            width={112}
            height={112}
            className="max-w-[88%] max-h-[88%] object-contain"
            loading="lazy"
            unoptimized
          />
        ) : (
          <span className="text-dim text-xs">No image</span>
        )}
      </Link>

      <div className="min-w-0">
        <div className="font-sans text-[11px] tracking-wider uppercase text-dim mb-1">
          <SourceBadge source={racket.balance?.source ?? racket.price_min?.source} variant="dot" />
          <span className="ml-1.5">{racket.brand}{series ? ` · ${series}` : ''}</span>
        </div>
        <h2 className="text-xl md:text-2xl font-serif font-medium tracking-tight">
          <Link href={`/rackets/${racket.slug}`} className="hover:text-accent">
            {racket.displayName}
          </Link>
        </h2>
        <dl className="font-sans text-[13px] mt-2 flex flex-wrap gap-x-5 gap-y-1 text-dim">
          <div><dt className="inline">Balance</dt><dd className="inline ml-1.5 text-ink">{fmt(balance)}</dd></div>
          <div><dt className="inline">Flex</dt><dd className="inline ml-1.5 text-ink">{fmt(flex)}</dd></div>
          <div><dt className="inline">Style</dt><dd className="inline ml-1.5 text-ink">{fmt(perf)}</dd></div>
        </dl>
      </div>

      <div className="text-right font-sans flex flex-col items-end gap-2">
        <div className="text-lg font-semibold tabular-nums">{fmtPrice(racket)}</div>
        <CompareButton slug={racket.slug} />
      </div>
    </article>
  );
}
