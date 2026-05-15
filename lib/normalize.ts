import type { BalanceCategory, FlexCategory, Sourced } from './types';

// Whitelist of recognized balance values (after lowercasing/trimming).
// Anything not in this map is treated as polluted scraper output and dropped.
const BALANCE_MAP: Record<string, BalanceCategory> = {
  'head heavy': 'Head Heavy',
  'head-heavy': 'Head Heavy',
  'headheavy': 'Head Heavy',
  'hh': 'Head Heavy',
  'head light': 'Head Light',
  'head-light': 'Head Light',
  'headlight': 'Head Light',
  'even': 'Even',
  'even balanced': 'Even',
  'even balance': 'Even',
  'normal': 'Normal',
  'slightly head heavy': 'Slightly Head Heavy',
  'slightly head-heavy': 'Slightly Head Heavy',
  'slightly head light': 'Slightly Head Light',
  'slightly head-light': 'Slightly Head Light',
};

const FLEX_MAP: Record<string, FlexCategory> = {
  'hi-flex': 'Hi-Flex',
  'hi flex': 'Hi-Flex',
  'hiflex': 'Hi-Flex',
  'flexible': 'Hi-Flex',
  'flex': 'Hi-Flex',
  'medium': 'Medium',
  'med': 'Medium',
  'stiff': 'Stiff',
  'extra stiff': 'Extra Stiff',
  'extra-stiff': 'Extra Stiff',
  'extrastiff': 'Extra Stiff',
};

export function normalizeBalance(raw: string | null | undefined): BalanceCategory | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  return BALANCE_MAP[key] ?? null;
}

export function normalizeFlex(raw: string | null | undefined): FlexCategory | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  return FLEX_MAP[key] ?? null;
}

// Strip retail cruft from model names: " BADMINTON RACKET..." suffixes,
// trailing ": <prose>" tag-lines, redundant trademark/edition tags.
export function cleanModelName(name: string | null | undefined): string {
  if (!name) return '';
  let n = name;
  n = n.replace(/\s*BADMINTON RACKET.*$/i, '');
  n = n.replace(/\s*:\s*[A-Z].*$/, '');
  n = n.replace(/\s+/g, ' ').trim();
  return n;
}

// Returns the normalized value plus the original SourcedValue so source attribution
// is preserved even when the displayed value is the cleaned form.
export function normalizedSourced<T>(
  sv: Sourced<string>,
  normalizer: (s: string | null) => T | null
): { value: T | null; source: string | null; rawValue: string | null; valid: boolean } {
  const raw = sv == null ? null : sv.value;
  const v = normalizer(raw);
  return {
    value: v,
    source: sv?.source ?? null,
    rawValue: raw,
    valid: raw != null && v != null,
  };
}
