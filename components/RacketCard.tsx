import Link from 'next/link';
import Image from 'next/image';
import type { Racket } from '@/lib/types';
import { getValue } from '@/lib/sourced';
import { fmt } from '@/lib/format';
import { CompareButton } from './CompareButton';
import { Price } from './Price';

interface Props {
  racket: Racket;
}

export function RacketCard({ racket }: Props) {
  const balance = racket.balanceCategory;
  const flex = racket.flexCategory;
  const style = racket.styleCategory;
  const series = getValue(racket.series);
  const firstImage = racket.image_urls?.[0];
  const specBits = [balance, flex, style].filter(Boolean).join(' · ') || '—';

  return (
    <article className="border border-rule bg-sheet flex flex-col">
      <Link
        href={`/rackets/${racket.slug}`}
        className="aspect-square bg-paper border-b border-rule grid place-items-center overflow-hidden"
      >
        {firstImage ? (
          <Image
            src={firstImage}
            alt={`${racket.brand} ${racket.displayName}`}
            width={300}
            height={300}
            className="max-w-[85%] max-h-[85%] object-contain"
            loading="lazy"
            unoptimized
          />
        ) : (
          <span className="text-dim text-xs font-sans">No image</span>
        )}
      </Link>

      <div className="p-3 flex flex-col gap-1 flex-1">
        <div className="font-sans text-[10px] tracking-widest uppercase text-dim truncate">
          {racket.brand}{series ? ` · ${series}` : ''}
        </div>
        <h2 className="font-serif text-base md:text-lg leading-tight">
          <Link href={`/rackets/${racket.slug}`} className="hover:text-accent">
            {racket.displayName}
          </Link>
        </h2>
        <div className="font-sans text-[11px] text-dim mt-auto pt-2">{fmt(specBits)}</div>
        <div className="flex items-center justify-between mt-1.5 gap-2">
          <Price racket={racket} className="font-sans font-semibold tabular-nums text-sm" />
          <CompareButton slug={racket.slug} />
        </div>
      </div>
    </article>
  );
}
