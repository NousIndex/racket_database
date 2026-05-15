// Schema for rackets.json. Every spec field is either null or a SourcedValue.

export type Source =
  | 'yonex_us'
  | 'victor_global'
  | 'li_ning_family'
  | `badminton_warehouse_${string}`
  | string;

export interface SourcedValue<T> {
  value: T;
  source: Source;
}

export type Sourced<T> = SourcedValue<T> | null;

export interface RawRacket {
  brand: string;
  model: string;
  raw_titles?: string[];
  parent_sku: Sourced<string>;
  series: Sourced<string>;
  product_tier: Sourced<string>;
  balance: Sourced<string>;
  shaft_flex: Sourced<string>;
  player_type: Sourced<string>;
  performance: Sourced<string>;
  stringing_advice: Sourced<string>;
  string_pattern: Sourced<string>;
  racquet_length: Sourced<string>;
  weight_grip_options: Sourced<string[]>;
  materials: Sourced<string[]>;
  tech_specs: Sourced<string[]>;
  price_min: Sourced<number>;
  price_max: Sourced<number>;
  currency: Sourced<string>;
  image_urls: string[];
  source_urls: Record<string, string>;
  descriptions: Record<string, string>;
  raw_specs: Record<string, Record<string, unknown>>;
  scraped_at?: string;
}

// Normalized values after cleaning
export type BalanceCategory =
  | 'Head Heavy'
  | 'Head Light'
  | 'Even'
  | 'Slightly Head Heavy'
  | 'Slightly Head Light'
  | 'Normal';

export type FlexCategory = 'Hi-Flex' | 'Medium' | 'Stiff' | 'Extra Stiff';

export type SourceTier = 'manufacturer' | 'distributor' | 'retailer' | 'unknown';

// A normalized racket: enums whitelisted, model name cleaned, slug attached.
// Original SourcedValue fields are kept so source attribution survives.
export interface Racket extends RawRacket {
  slug: string;
  displayName: string;
  balanceCategory: BalanceCategory | null;
  flexCategory: FlexCategory | null;
}
