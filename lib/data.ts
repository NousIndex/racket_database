import fs from 'node:fs';
import path from 'node:path';
import { cache } from 'react';
import type { RawRacket, Racket } from './types';
import { cleanModelName, normalizeBalance, normalizeFlex, promoteRawSpecs } from './normalize';
import { getValue } from './sourced';
import { makeSlug } from './slug';

// Loaded once per build (module scope). cache() also dedupes within a render.
export const getRackets = cache((): Racket[] => {
  const file = path.join(process.cwd(), 'public', 'rackets.json');
  if (!fs.existsSync(file)) {
    throw new Error(
      `rackets.json not found at ${file}. Run \`npm run dev\` or \`npm run build\` (prebuild copies it from ../rackets.json).`
    );
  }
  const raw: RawRacket[] = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const slugCount = new Map<string, number>();

  return raw.map((r): Racket => {
    const base = makeSlug(r.brand, r.model);
    const n = slugCount.get(base) ?? 0;
    slugCount.set(base, n + 1);
    const slug = n === 0 ? base : `${base}-${n + 1}`;

    const { overrides, remainingRawSpecs } = promoteRawSpecs(r);
    const merged = { ...r, ...overrides, raw_specs: remainingRawSpecs };

    return {
      ...merged,
      slug,
      displayName: cleanModelName(r.model) || r.model,
      balanceCategory: normalizeBalance(getValue(merged.balance)),
      flexCategory: normalizeFlex(getValue(merged.shaft_flex)),
    };
  });
});

export function getRacketBySlug(slug: string): Racket | undefined {
  return getRackets().find((r) => r.slug === slug);
}

export function getRacketsBySlugs(slugs: string[]): Racket[] {
  const all = getRackets();
  const map = new Map(all.map((r) => [r.slug, r]));
  return slugs.map((s) => map.get(s)).filter((r): r is Racket => r != null);
}
