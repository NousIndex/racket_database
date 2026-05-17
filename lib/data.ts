import fs from 'node:fs';
import path from 'node:path';
import { cache } from 'react';
import type { RawRacket, Racket } from './types';
import { cleanModelName, inferStyle, normalizeBalance, normalizeFlex, promoteRawSpecs } from './normalize';
import { getValue } from './sourced';
import { makeSlug } from './slug';

// Per-source filename patterns for non-product images (brand logos, generic
// technology/feature icons reused across every racket page). The scraper has
// no way to tell these apart from real product photos, so we drop them here.
const JUNK_IMAGE_PATTERNS: { host: string; patterns: RegExp[] }[] = [
  {
    host: 'carlton-sports.com',
    patterns: [
      /\/carlton_sports_logo[^/]*$/i,
      /\/Carlton-Logo_[^/]*$/,
      /\/tech_[a-z0-9]+@2x\.png$/i,
      /\/JHM-Graphite\.png$/i,
      /\/Stabilisor-Top-Cap\.png$/i,
      /\/RExtreme-Tension-Frame\.png$/i,
    ],
  },
  {
    // Felet's scraper consistently emits four junk entries via this resize
    // proxy (the brand logo, a generic Asset_NN decoration, the no_image
    // placeholder, and a full-res duplicate of the product image that's
    // already present at its cdn1.sgliteasset.com /cached/ thumbnail URL).
    host: 'erp-image.sgliteasset.com',
    patterns: [/\/_next\/image\?/],
  },
  {
    // FZ Forza pages mix the brand logo and feature-tech illustrations
    // (Kevlar, numbered Artwork-N) into the gallery. Real product images use
    // a strict FZ{sku}_..._-scaled.{ext} filename, so these patterns can't
    // collide with legitimate photos. Served from both fz-forza.com directly
    // and via i0.wp.com/fz-forza.com (Jetpack CDN) — substring match catches
    // both.
    host: 'fz-forza.com',
    patterns: [
      /\/FZ-FORZA-logo-[^/]*$/i,
      /\/Kevlar\.png(?:\?|$)/i,
      /\/Artwork-\d+\.png(?:\?|$)/i,
    ],
  },
];

function isJunkImage(url: string): boolean {
  return JUNK_IMAGE_PATTERNS.some(
    ({ host, patterns }) => url.includes(host) && patterns.some((p) => p.test(url))
  );
}

// Strip whitespace, dashes, underscores, dots so "GP-X 88" and "GP-X-88" and
// "gpx88" all collapse to the same key. Used to match a racket's model string
// against the model token embedded in image filenames.
function modelMatchKey(s: string | null | undefined): string {
  if (!s) return '';
  return s.toLowerCase().replace(/[\s_\-.]+/g, '');
}

// Carlton's product gallery silently includes cross-sell thumbnails of *other*
// rackets (e.g. AIREDGE-LITE-81 thumbnails appearing in GP-X 88's gallery).
// Drop a Carlton image only when its filename matches a DIFFERENT Carlton
// model's identifier — never when it matches the racket's own model, and never
// when it matches nothing (some legitimate own-images use truncated names).
function isCarltonCrossSell(
  url: string,
  ownKey: string,
  carltonKeys: Set<string>
): boolean {
  if (!url.includes('carlton-sports.com')) return false;
  const basename = url.split('/').pop() ?? '';
  const normalized = modelMatchKey(basename);
  if (ownKey && normalized.includes(ownKey)) return false;
  for (const key of carltonKeys) {
    if (key && key !== ownKey && normalized.includes(key)) return true;
  }
  return false;
}

function cleanImageUrls(
  urls: string[] | null | undefined,
  ownKey: string,
  carltonKeys: Set<string>
): string[] {
  if (!urls) return [];
  return urls.filter((url) => !isJunkImage(url) && !isCarltonCrossSell(url, ownKey, carltonKeys));
}

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

  const carltonKeys = new Set(
    raw
      .filter((r) => r.brand?.toLowerCase() === 'carlton')
      .map((r) => modelMatchKey(r.model))
      .filter(Boolean)
  );

  return raw.map((r): Racket => {
    const base = makeSlug(r.brand, r.model);
    const n = slugCount.get(base) ?? 0;
    slugCount.set(base, n + 1);
    const slug = n === 0 ? base : `${base}-${n + 1}`;

    const ownKey =
      r.brand?.toLowerCase() === 'carlton' ? modelMatchKey(r.model) : '';
    const { overrides, remainingRawSpecs } = promoteRawSpecs(r);
    const merged = {
      ...r,
      ...overrides,
      raw_specs: remainingRawSpecs,
      image_urls: cleanImageUrls(r.image_urls, ownKey, carltonKeys),
    };

    const balanceCategory = normalizeBalance(getValue(merged.balance));
    return {
      ...merged,
      slug,
      displayName: cleanModelName(r.model) || r.model,
      balanceCategory,
      flexCategory: normalizeFlex(getValue(merged.shaft_flex)),
      styleCategory: inferStyle(balanceCategory),
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
