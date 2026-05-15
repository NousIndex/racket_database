import { cleanModelName } from './normalize';

export function makeSlug(brand: string, model: string): string {
  const cleaned = `${brand}-${cleanModelName(model)}`;
  return cleaned
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
