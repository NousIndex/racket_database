import type { BalanceCategory, FlexCategory, RawRacket, Sourced, StyleCategory } from './types';

// Lookup keys for the maps below. Input is lowercased and any run of
// dashes/underscores/spaces collapses to a single space, so "Head-Heavy",
// "head_heavy", and "HEAD HEAVY" all hit the same entry.
function categoryKey(s: string): string {
  return s.trim().toLowerCase().replace(/[\s_-]+/g, ' ');
}

// Whitelist of recognized balance values. Anything not in this map is treated
// as polluted scraper output and dropped (rendered as blank on the home page).
const BALANCE_MAP: Record<string, BalanceCategory> = {
  'head heavy': 'Head Heavy',
  'headheavy': 'Head Heavy',
  'head heavy balance': 'Head Heavy',
  'hh': 'Head Heavy',
  'head light': 'Head Light',
  'headlight': 'Head Light',
  'even': 'Even',
  'even balance': 'Even',
  'even balanced': 'Even',
  // Gosen's scale uses "Medium"/"Middle"/"Medium Balanced" for centered balance.
  'medium': 'Even',
  'middle': 'Even',
  'medium balanced': 'Even',
  'normal': 'Normal',
  'slightly head heavy': 'Slightly Head Heavy',
  'slight head heavy': 'Slightly Head Heavy',
  'slightly head light': 'Slightly Head Light',
};

const FLEX_MAP: Record<string, FlexCategory> = {
  'hi flex': 'Hi-Flex',
  'hiflex': 'Hi-Flex',
  'flex': 'Hi-Flex',
  'flexible': 'Hi-Flex',
  'flexibility': 'Hi-Flex',
  'ultra flexible': 'Hi-Flex',
  'soft': 'Hi-Flex',
  'slight soft': 'Hi-Flex',
  'extra soft': 'Hi-Flex',
  'medium': 'Medium',
  'med': 'Medium',
  'mid flex': 'Medium',
  // Li-Ning scale: Flexible / Medium Flexible / Medium / Stiff. The "Flexible"
  // modifier softens medium but it still buckets closer to Medium than Hi-Flex.
  'medium flexible': 'Medium',
  'stiff': 'Stiff',
  // "Medium Stiff" / "Slight(ly) Stiff" sit between Medium and Stiff; the
  // "Stiff" noun is dominant so they bucket up rather than down.
  'medium stiff': 'Stiff',
  'slight stiff': 'Stiff',
  'slightly stiff': 'Stiff',
  'extra stiff': 'Extra Stiff',
  'extrastiff': 'Extra Stiff',
};

export function normalizeBalance(raw: string | null | undefined): BalanceCategory | null {
  if (!raw) return null;
  return BALANCE_MAP[categoryKey(raw)] ?? null;
}

export function normalizeFlex(raw: string | null | undefined): FlexCategory | null {
  if (!raw) return null;
  return FLEX_MAP[categoryKey(raw)] ?? null;
}

// Derive playing style from balance: head-heavy frames generate power,
// head-light frames swing faster, centered frames are easier to control.
export function inferStyle(balance: BalanceCategory | null): StyleCategory | null {
  if (!balance) return null;
  if (balance === 'Head Heavy' || balance === 'Slightly Head Heavy') return 'Power';
  if (balance === 'Head Light' || balance === 'Slightly Head Light') return 'Speed';
  return 'Control';
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

// Some scrapers (e.g. hundred_my) dump everything into raw_specs instead of the
// structured fields. Map known raw keys → structured fields so they appear in
// the main spec table rather than only under "Additional details".
type ScalarField =
  | 'balance' | 'shaft_flex' | 'player_type' | 'product_tier' | 'series'
  | 'string_pattern' | 'racquet_length' | 'stringing_advice' | 'parent_sku'
  | 'performance';
type ArrayField = 'materials' | 'tech_specs';

const SCALAR_KEY_MAP: Record<string, ScalarField> = {
  'balance': 'balance',
  'shaft flex': 'shaft_flex',
  'flex': 'shaft_flex',
  'flexibility': 'shaft_flex',
  'tahap kekerasan': 'shaft_flex',
  'player type': 'player_type',
  'playing style': 'player_type',
  'player level': 'product_tier',
  'level': 'product_tier',
  'series': 'series',
  'product range': 'series',
  'string pattern': 'string_pattern',
  'length': 'racquet_length',
  'racket length': 'racquet_length',
  'racquet length': 'racquet_length',
  'total length': 'racquet_length',
  'stringing': 'stringing_advice',
  'string tension': 'stringing_advice',
  'tension': 'stringing_advice',
  'maximum racket tension': 'stringing_advice',
  'ketegangan tali': 'stringing_advice',
  'parent sku': 'parent_sku',
  'sku': 'parent_sku',
  'performance': 'performance',
};

const ARRAY_KEY_MAP: Record<string, ArrayField> = {
  'material': 'materials',
  'materials': 'materials',
  'bahan bingkai': 'materials',
  'technologies': 'tech_specs',
  'tech specs': 'tech_specs',
};

const WEIGHT_KEYS = new Set(['weight', 'weight g', 'unstrung weight', 'berat']);
const GRIP_KEYS = new Set(['racket grip size', 'grip size', 'saiz grip']);

function normalizeKey(k: string): string {
  return k.trim().toLowerCase().replace(/[\s_-]+/g, ' ');
}

type Overrides = Partial<Pick<RawRacket,
  | 'balance' | 'shaft_flex' | 'player_type' | 'product_tier' | 'series'
  | 'string_pattern' | 'racquet_length' | 'stringing_advice' | 'parent_sku'
  | 'performance' | 'materials' | 'tech_specs' | 'weight_grip_options'
>>;

export function promoteRawSpecs(r: RawRacket): {
  overrides: Overrides;
  remainingRawSpecs: RawRacket['raw_specs'];
} {
  const overrides: Overrides = {};
  // "<source>::<original_key>" entries to strip from raw_specs.
  const promotedKeys = new Set<string>();

  for (const [source, specs] of Object.entries(r.raw_specs || {})) {
    let weightVal: string | null = null;
    let gripVal: string | null = null;
    const weightOrGripKeys: string[] = [];

    for (const [origKey, rawVal] of Object.entries(specs || {})) {
      const val = typeof rawVal === 'string' ? rawVal.trim() : null;
      if (!val) continue;
      const key = normalizeKey(origKey);

      if (WEIGHT_KEYS.has(key)) {
        if (!weightVal) weightVal = val;
        weightOrGripKeys.push(origKey);
        continue;
      }
      if (GRIP_KEYS.has(key)) {
        if (!gripVal) gripVal = val;
        weightOrGripKeys.push(origKey);
        continue;
      }

      const scalar = SCALAR_KEY_MAP[key];
      if (scalar) {
        const current = overrides[scalar] ?? r[scalar];
        if (current?.value != null) continue;
        overrides[scalar] = { value: val, source };
        promotedKeys.add(`${source}::${origKey}`);
        continue;
      }

      const arr = ARRAY_KEY_MAP[key];
      if (arr) {
        const current = overrides[arr] ?? r[arr];
        if (current?.value != null) continue;
        overrides[arr] = { value: [val], source };
        promotedKeys.add(`${source}::${origKey}`);
      }
    }

    const existingWGO = overrides.weight_grip_options ?? r.weight_grip_options;
    if (!existingWGO?.value && (weightVal || gripVal)) {
      const combined = weightVal && gripVal
        ? `${weightVal} / ${gripVal}`
        : (weightVal ?? gripVal!);
      overrides.weight_grip_options = { value: [combined], source };
      for (const k of weightOrGripKeys) promotedKeys.add(`${source}::${k}`);
    }
  }

  // Rebuild raw_specs without the promoted keys.
  const remainingRawSpecs: RawRacket['raw_specs'] = {};
  for (const [source, specs] of Object.entries(r.raw_specs || {})) {
    const remaining: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(specs || {})) {
      if (!promotedKeys.has(`${source}::${k}`)) remaining[k] = v;
    }
    if (Object.keys(remaining).length > 0) remainingRawSpecs[source] = remaining;
  }

  return { overrides, remainingRawSpecs };
}
