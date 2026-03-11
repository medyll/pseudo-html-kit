# Changelog — pseudo-html-kit v0.7.0

**Released:** 2026-03-11
**Sprints:** 18 · 19 · 20

---

## What's new in v0.7.0

### Accessibility — WCAG 2.2 AA (Sprint 18–19)

- **WCAG audit**: 61-component scan — 3 critical `:focus` → `:focus-visible` bugs fixed (input-pk, select-pk, textarea-pk)
- **prefers-reduced-motion**: Guards added to all 28 animated/transitioning components (button-pk, accordion-pk, tabs-pk, notification-pk, checkbox-pk, radio-pk, toggle-pk, progress-bar-pk, grid-pk, card-pk, combobox-pk, dropdown-pk, list-item-pk, menu-item-pk, modal-pk, pagination-pk, product-tile-pk, search-bar-pk, tab-bar-pk, tooltip-pk, feed-post-pk, navbar-pk, sidebar-pk, story-ring-pk, chip-pk, image-pk, input-pk, slider-pk, textarea-pk, select-pk, progress-pk, rating-pk, breadcrumb-pk)
- **:focus-visible outlines**: Explicit focus rings added to 8 interactive components that previously relied on browser defaults (chip-pk, modal-pk, notification-pk, product-tile-pk, search-bar-pk, navbar-pk, feed-post-pk, content-row-pk)
- **date-picker-pk**: `label`/`aria-label`/`name` props forwarded to inner `<input type="date">` (WCAG 1.3.1, 4.1.2); removed invalid `aria-haspopup/aria-expanded` from input
- **axe-core color contrast audit**: 0 WCAG 1.4.3 AA violations with default design tokens
- **a11y harness updated**: Now covers 55+ components including checkbox-pk, radio-pk, select-pk, slider-pk, progress-pk, accordion-pk, tabs-pk, combobox-pk, date-picker-pk (molecule)

### React SSR adapter (Sprint 18 — S18-02)

New `pseudo-kit-react/ssr` entry point:

```js
import { renderComponent, hydrateMarker } from 'pseudo-kit-react/ssr';

// Server-side render a component to HTML string
const html = await renderComponent('/path/to/button-pk.html', {
  variant: 'primary',
  disabled: true,
});
// → <button-pk variant="primary" disabled data-pk-ssr="button-pk" data-pk-resolved>…</button-pk>
```

- `renderComponent(filePath, props)` — reads the `.html` file, extracts `<template>`, serializes props, adds `data-pk-ssr` + `data-pk-resolved` hydration markers
- `hydrateMarker(name)` — returns `<!--pk-ssr:name-->` boundary comment
- Boolean props rendered as bare attributes; double quotes escaped; `null`/`undefined`/`false` props omitted
- 15 unit tests added

### Performance budget (Sprint 19 — S19-04)

New `scripts/check-bundle-size.js`:

```
✅ PASS  pseudo-kit-client.js  raw: 27.1 KB  gzip: 7.7 KB  budget: ≤ 12 KB
✅ PASS  pseudo-kit-server.js  raw: 15.1 KB  gzip: 4.4 KB  budget: ≤ 6 KB
```

```sh
pnpm check:bundle
```

### LLM context pack (Sprint 20 — S20-01)

New `pseudo-kit-context.json` at repo root — machine-readable component API reference for AI assistants (Claude, Copilot, etc.):

```json
{
  "version": "0.7.0",
  "total": 61,
  "components": [
    { "name": "button-pk", "layer": "atoms", "props": [...], "slots": [...], "example": "..." }
  ]
}
```

Regenerate with: `pnpm generate:context`

### Documentation site (Sprint 20 — S20-02/03)

New `docs/index.html` — static documentation site that dogfoods pseudo-html-kit:

- Getting Started (CDN + npm + design tokens)
- Full component reference: 61 components with props tables, slots tables, and template examples
- Framework Adapters: React 18 + Svelte 5 guides
- CLI: `pseudo-kit init` usage
- Accessibility compliance summary

Regenerate with: `pnpm generate:docs`

### v1.0.0 planning (Sprint 18 — S18-03)

- `bmad/artifacts/prd-v1.0.0.md` — API lock specification, doc site spec, performance budget, LLM context pack spec, sprint plan (S19 → S20 → S21)

---

## Bug fixes

- `date-picker-pk` (molecule): removed `aria-haspopup="dialog"` and `aria-expanded="false"` from `<input type="date">` — these attributes are prohibited on date inputs (axe-core `aria-allowed-attr` violation)
- `a11y-audit.html` harness: removed `aria-labelledby` from `<modal-pk>` host element (no role — axe-core `aria-prohibited-attr` violation)

---

## Test coverage

| Suite | Tests | Status |
|---|---|---|
| node:test (server) | 226 | ✅ |
| vitest main | 345 | ✅ |
| vitest react | 29 | ✅ |
| vitest svelte | 18 | ✅ |
| E2E Chromium | 38 | ✅ |
| A11y (axe-core) | 5 | ✅ |
| **Total** | **661** | ✅ |

---

## New scripts

| Script | Description |
|---|---|
| `pnpm check:bundle` | Validate bundle size against v1.0.0 budget |
| `pnpm generate:context` | Regenerate `pseudo-kit-context.json` |
| `pnpm generate:docs` | Regenerate `docs/index.html` |

---

## Migration from v0.6.x

No breaking changes. v0.7.0 is a pure additive release:

- All existing component props and slots unchanged
- All public API methods unchanged
- New: `pseudo-kit-react/ssr` export (additive)
- New: `pseudo-kit-context.json` (new file, not a breaking change)
- New: `docs/index.html` (new file)
- CSS changes: `@media (prefers-reduced-motion: reduce)` guards added to 28 components — no visible change for users without `prefers-reduced-motion: reduce` set
