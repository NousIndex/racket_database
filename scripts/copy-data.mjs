#!/usr/bin/env node
// Copy rackets.json into web/public/ before dev/build.
// Override location with RACKETS_JSON env var.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(__dirname, '..');
const defaultSrc = resolve(webRoot, '..', 'rackets.json');
const src = process.env.RACKETS_JSON ? resolve(process.env.RACKETS_JSON) : defaultSrc;
const dst = resolve(webRoot, 'public', 'rackets.json');

if (!existsSync(src)) {
  console.error(`[copy-data] rackets.json not found at ${src}`);
  console.error(`[copy-data] Set RACKETS_JSON env var to point at a different file.`);
  process.exit(1);
}

mkdirSync(dirname(dst), { recursive: true });
copyFileSync(src, dst);
console.log(`[copy-data] ${src} → ${dst}`);
