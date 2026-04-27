# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project nature

A SvelteKit clone of USDA NASS [QuickStats](https://quickstats.nass.usda.gov/), backed by the [NASS API](https://quickstats.nass.usda.gov/api). The repo is set up as both a SvelteKit showcase app (`src/routes`) and a packageable Svelte component library (`src/lib`, exported via `package.json` "exports" → `dist/index.js`). `src/lib/index.js` is currently empty — adding to the library means re-exporting components from there.

Uses **Svelte 5 (Runes mode)** — `$state`, `$props`, `$derived`, `$effect`, `$bindable`. JS, not TS (`jsconfig.json`). Tailwind CSS for styling.

## Commands

```bash
npm run dev          # vite dev server
npm run build        # vite build && npm run package (builds both app and library)
npm run package      # build library to dist/ via @sveltejs/package + publint
npm run preview      # preview production build
npm run check        # svelte-check against jsconfig.json
npm run check:watch  # svelte-check in watch mode
npm run lint         # prettier --check . && eslint .
npm run format       # prettier --write .
```

No test framework is configured.

## Required environment

`PRIVATE_QUICKSTATS_API_KEY` must be set in `.env` — without it, all three `/api/*` endpoints will fail. Get a key from the NASS API page.

## Architecture

The data flow is a three-level cascade: **selector tree → API proxies → NASS**.

### Selector tree (`src/lib/selector_tree.js`)

The single source of truth for the UI. Each selector entry declares:

- `key` — the NASS API parameter name (e.g. `commodity_desc`, `state_name`)
- `depends` — list of *other* selector keys whose current selections constrain this selector's available choices. This is what makes filters cascade.
- `group` — UI grouping (`what` / `where` / `when`) used to lay out Chooser components in `Browser.svelte`.
- `dependency: 'hard'` — used on `group_desc` and `county_name` (semantic only at present; not branched on in code).

When adding a new filter dimension, add it here and it will automatically appear under the appropriate group in `Browser.svelte`. The `depends` array determines which currently-selected params get forwarded to `/api/options` to populate this selector's choices.

### Component flow

`+page.svelte` → `Browser.svelte` (owns `search_params` and `table` state) → fans out to:

- One `Chooser.svelte` per selector. On mount and whenever any of its declared `depends` change, it `fetch`es `/api/options` with only the relevant subset of `search_params` plus `param=<its own key>`, and renders the result as a `<select multiple>`. On change it calls `updater(key, selection)` which writes back into `Browser`'s `search_params`.
- `Counter.svelte` — derives a search string from the full `search_params`, hits `/api/counts` reactively, and only exposes the "Get data" button when the count is ≤ `MAX_RECORDS` (50,000). On click, fetches `/api/get` (CSV) and writes the response text into the bound `table` prop.
- `Table.svelte` — renders the first 10 lines of the CSV plus a "Download CSV" button that builds a Blob client-side.

State ownership pattern: `Browser` owns `search_params` and `table`; children mutate via `$bindable()` props or an `updater` callback. `Chooser` uses `$bindable()` for `search_params` even though it only reads from it — pay attention if changing this.

### API layer (`src/routes/api/{options,counts,get}/+server.js`)

Three thin pass-through proxies whose only purpose is to attach `PRIVATE_QUICKSTATS_API_KEY` server-side and forward to:

- `/api/options` → `https://quickstats.nass.usda.gov/api/get_param_values/`
- `/api/counts` → `https://quickstats.nass.usda.gov/api/get_counts/`
- `/api/get` → `https://quickstats.nass.usda.gov/api/api_GET/` (forces `format=CSV`)

Note: each handler appends `key` to `url.searchParams` but then forwards `url.search` — confirm whether the appended key actually reaches NASS if you debug auth issues.

### Service worker (`src/service-worker.js`)

Caches build assets and **caches `/api/options` responses** specifically (cache-first with network fallback). Other requests are network-first with cache fallback. If you change the options API contract or selector cascading semantics, expect stale clients to keep serving old option lists until the cache version rolls.

## Style and tooling notes

- ESLint flat config (`eslint.config.js`) using `js.configs.recommended` + `eslint-plugin-svelte` flat recommended + prettier compat. Ignores `build/`, `.svelte-kit/`, `dist/`.
- `peerDependencies` pin svelte `^4.0.0` while `devDependencies` use svelte `^5.0.0` — the peer range is stale relative to the actual code (which uses runes). Update before publishing the library.
