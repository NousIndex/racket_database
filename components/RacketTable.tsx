import Link from 'next/link';
import Image from 'next/image';
import type { Racket } from '@/lib/types';
import { fmt, fmtPrice } from '@/lib/format';
import { CompareButton } from './CompareButton';

interface Props {
  rackets: Racket[];
}

export function RacketTable({ rackets }: Props) {
  return (
    <div className="overflow-x-auto -mx-6 md:-mx-12">
      <table className="w-full font-sans text-sm border-collapse">
        <thead>
          <tr className="text-left text-[11px] tracking-wider uppercase text-dim border-y-2 border-ink">
            <th className="py-2 pl-6 md:pl-12 pr-2 w-12"></th>
            <th className="py-2 px-2">Brand</th>
            <th className="py-2 px-2">Model</th>
            <th className="py-2 px-2">Balance</th>
            <th className="py-2 px-2">Flex</th>
            <th className="py-2 px-2">Style</th>
            <th className="py-2 px-2 text-right">Price</th>
            <th className="py-2 pl-2 pr-6 md:pr-12 w-24"></th>
          </tr>
        </thead>
        <tbody>
          {rackets.map((r) => {
            const firstImage = r.image_urls?.[0];
            return (
              <tr key={r.slug} className="border-b border-rule hover:bg-sheet/60">
                <td className="py-2 pl-6 md:pl-12 pr-2">
                  <Link
                    href={`/rackets/${r.slug}`}
                    className="block w-10 h-10 bg-sheet border border-rule grid place-items-center overflow-hidden"
                  >
                    {firstImage ? (
                      <Image
                        src={firstImage}
                        alt=""
                        width={40}
                        height={40}
                        className="max-w-[88%] max-h-[88%] object-contain"
                        loading="lazy"
                        unoptimized
                      />
                    ) : null}
                  </Link>
                </td>
                <td className="py-2 px-2 text-dim whitespace-nowrap">{r.brand}</td>
                <td className="py-2 px-2">
                  <Link href={`/rackets/${r.slug}`} className="hover:text-accent">
                    {r.displayName}
                  </Link>
                </td>
                <td className="py-2 px-2 whitespace-nowrap">{fmt(r.balanceCategory)}</td>
                <td className="py-2 px-2 whitespace-nowrap">{fmt(r.flexCategory)}</td>
                <td className="py-2 px-2 whitespace-nowrap">{fmt(r.styleCategory)}</td>
                <td className="py-2 px-2 text-right tabular-nums whitespace-nowrap">{fmtPrice(r)}</td>
                <td className="py-2 pl-2 pr-6 md:pr-12 text-right">
                  <CompareButton slug={r.slug} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
