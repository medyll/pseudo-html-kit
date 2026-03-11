# CHANGELOG — v0.6.0 GA

> Released: 2026-03-11

## v0.6.0 Milestone — Developer Experience + Framework Bridges

This release completes the v0.6.0 DX milestone: framework adapters, live reload, and CLI scaffold.

---

## New Packages

### `pseudo-kit-react` v0.3.0
- Source renamed to `src/index.jsx`
- 14 unit tests (vitest + jsdom + @vitejs/plugin-react)
- Exports: `useComponent`, `usePseudoKit`, `usePseudoKitReady`, `useRegisterComponent`, `PseudoKitProvider`

### `pseudo-kit-svelte` v0.1.0 (new)
- Plain async JS API compatible with Svelte 5 `$effect` / `onMount`
- Exports: `createComponent`, `createComponents`, `pseudoKit`, `initPseudoKit`, `nameFromUrl`
- 18 unit tests (vitest + happy-dom)
- No Svelte compiler dependency — works in any JS environment

---

## Canvas Viewer — Live Reload
- `?canvas=file.html&watch=1` polls via `fetch HEAD` every 1s
- Reloads on `ETag` / `Last-Modified` change
- Shows watch status and reload toasts

---

## CLI — `npx pseudo-kit init`
- Scaffolds `index.html`, `demo.html`, `components/`, `package.json`
- Idempotent — existing files skipped
- `--help` flag prints usage

---

## Test Delta (cumulative from v0.5.1)

| Suite | v0.5.1 | v0.6.0 | Delta |
|---|---|---|---|
| node:test (main) | 226 | 226 | — |
| vitest (main) | 345 | 345 | — |
| vitest (react adapter) | 0 | 14 | +14 |
| vitest (svelte adapter) | 0 | 18 | +18 |
| E2E Chromium | 38 | 38 | — |
| **Total** | **609** | **641** | **+32** |

---

## Sprint 17 Stories

| ID | Title | Status |
|---|---|---|
| S17-01 | pseudo-kit-svelte adapter | ✅ done |
| S17-02 | pseudo-kit-svelte unit tests | ✅ done |
| S17-03 | v0.6.0 GA release | ✅ done |
