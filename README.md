# Racket Database

A static-data Next.js site that browses, details, and compares badminton rackets from the `rackets.json` scraper output. Editorial spec-sheet aesthetic — serif headlines, source-attributed values, side-by-side diff comparison for up to 4 rackets.

## Setup

```bash
cd web
npm install
npm run dev
```

Open <http://localhost:3000>.

The `predev` and `prebuild` scripts copy `../rackets.json` into `public/` automatically.

### Point at a different rackets.json

Set the `RACKETS_JSON` environment variable to an absolute or relative path:

```bash
# macOS / Linux
RACKETS_JSON=/path/to/other-rackets.json npm run dev

# Windows PowerShell
$env:RACKETS_JSON = "C:\path\to\other-rackets.json"; npm run dev
```

If the file moves or you re-run the scraper, run `node scripts/copy-data.mjs` to refresh `public/rackets.json` without restarting the dev server (or just `npm run dev` again — `predev` does it for you).

## What's where

```
web/
  app/
    page.tsx                     Browse view (server) + filter client wrapper
    rackets/[slug]/page.tsx      Detail view (statically generated per racket)
    compare/page.tsx             Compare view (reads ?ids=slug1,slug2 from URL)
    layout.tsx, globals.css      Shell, fonts, colors
  components/
    BrowseClient.tsx             Filter/sort/search state, renders rows
    RacketRow.tsx                One row in the list
    CompareDrawer.tsx            Sticky selection drawer (bottom)
    CompareButton.tsx            Toggle add-to-compare
    CompareTable.tsx             Side-by-side diff table
    ImageCarousel.tsx            Detail-view image gallery
    SourceBadge.tsx              MFR/DST/RET tier pill or dot
  lib/
    types.ts                     RawRacket schema + normalized Racket
    data.ts                      Load + normalize rackets.json
    normalize.ts                 Balance/flex whitelist, model-name cleaner
    sourced.ts                   getValue/getSource/sourceTier helpers
    format.ts                    fmt, fmtPrice
    slug.ts                      brand + model → URL slug
    useCompareSelection.ts       localStorage-backed compare state
  scripts/
    copy-data.mjs                Prebuild step that imports rackets.json
```

## Data handling

`lib/normalize.ts` enforces a whitelist of valid `balance` and `shaft_flex` values. Anything outside (e.g. `"and a hi-flex shaft"` from misparsed retailer descriptions) is normalized to `null` — the UI renders these as "—" rather than displaying garbage. Source attribution survives so you can still see who reported nonsense.

Source tiers, used to color attribution badges:

| Tier         | Sources                                  | Badge |
| ------------ | ---------------------------------------- | ----- |
| Manufacturer | `yonex_us`, `victor_global`              | MFR (accent) |
| Distributor  | `li_ning_family`                         | DST (stone) |
| Retailer     | `badminton_warehouse_*`                  | RET (pale) |

## URLs

| Path                                  | Notes |
| ------------------------------------- | ----- |
| `/`                                   | Browse — filters via URL-state-less client component |
| `/rackets/yonex-astrox-99-tour`       | Statically pre-rendered per slug |
| `/compare?ids=yonex-astrox-99-tour,victor-drivex-12-o` | Up to 4 ids; shareable |

## Deploy

Works out of the box on Vercel, Netlify, or Cloudflare Pages — `npm run build` emits a static-friendly Next build, prebuild copies the data, no env config needed. To deploy with a custom data file, set `RACKETS_JSON` in your platform's environment variables.

## Scripts

| Script              | What |
| ------------------- | ---- |
| `npm run dev`       | Copy data, start dev server |
| `npm run build`     | Copy data, build production output |
| `npm run start`     | Serve production build |
| `npm run typecheck` | tsc --noEmit |
| `npm run lint`      | Next lint |
