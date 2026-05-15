'use client';

import Image from 'next/image';
import { useState } from 'react';

interface Props {
  images: string[];
  alt: string;
}

export function ImageCarousel({ images, alt }: Props) {
  const [active, setActive] = useState(0);
  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/3] bg-sheet border border-rule grid place-items-center text-dim font-sans text-sm">
        No images available
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-[4/3] bg-sheet border border-rule grid place-items-center overflow-hidden">
        <Image
          key={images[active]}
          src={images[active]}
          alt={alt}
          width={800}
          height={600}
          className="max-w-[92%] max-h-[92%] object-contain"
          priority
          unoptimized
        />
      </div>
      {images.length > 1 && (
        <ul className="flex gap-2 mt-3 flex-wrap" role="tablist" aria-label="Product images">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Image ${i + 1} of ${images.length}`}
                onClick={() => setActive(i)}
                className={`w-16 h-16 bg-sheet border grid place-items-center overflow-hidden transition ${
                  i === active ? 'border-accent ring-1 ring-accent' : 'border-rule hover:border-ink'
                }`}
              >
                <Image src={src} alt="" width={64} height={64} className="max-w-[88%] max-h-[88%] object-contain" unoptimized />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
