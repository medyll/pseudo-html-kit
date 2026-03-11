# Release Notes — pseudo-html-kit v1.0.0

**Released:** 2026-03-11
**Type:** Stable release — API locked

---

## 🎉 pseudo-html-kit v1.0.0 is here

After 21 sprints and a full development lifecycle — from scaffold to stable release — **pseudo-html-kit v1.0.0** is the production-ready, API-locked release of the vanilla HTML component system.

---

## What's included

### 61 production-ready components

| Layer | Count | Components |
|---|---|---|
| Atoms | 23 | avatar, badge, button, checkbox, chip, date-picker, divider, icon, image, input, label, loader, progress-bar, progress, radio, rating, select, skeleton, slider, spinner, tag, textarea, toggle |
| Molecules | 22 | breadcrumb, card, card-media, carousel, color-swatch, combobox, date-picker, dropdown, form-field, grid, list-item, menu-item, modal, notification, pagination, price-tag, product-tile, search-bar, tab-bar, tooltip, user-info |
| Organisms | 16 | accordion, carousel, cart-summary, comment-thread, content-row, feed-post, footer, hero-banner, navbar, product-detail, profile-card, sidebar, story-ring, tabs, thumbnail-grid, topbar |

### Framework adapters

| Package | Exports | Tests |
|---|---|---|
| `pseudo-kit-react` | `useComponent`, `usePseudoKit`, `usePseudoKitReady`, `useRegisterComponent`, `PseudoKitProvider`, `renderComponent` (SSR), `hydrateMarker` | 29 |
| `pseudo-kit-svelte` | `pseudoKit`, `initPseudoKit`, `createComponent`, `createComponents`, `nameFromUrl` | 18 |
| `pseudo-kit-cli` | `npx pseudo-kit init` | — |

### WCAG 2.2 AA compliance

- ✅ 0 critical/serious axe-core violations
- ✅ 0 color-contrast violations (WCAG 1.4.3 AA)
- ✅ All interactive elements use `:focus-visible`
- ✅ All animated components respect `prefers-reduced-motion`
- ✅ Full ARIA landmark and keyboard navigation coverage

### Performance

| Artifact | Size | Budget |
|---|---|---|
| `pseudo-kit-client.js` | 7.7 KB gzip | ≤ 12 KB ✅ |
| `pseudo-kit-server.js` | 4.4 KB gzip | ≤ 6 KB ✅ |
| Component avg size | ~2.1 KB | ≤ 4 KB ✅ |

### Documentation

- `docs/index.html` — full component reference with props/slots tables, framework adapter guides, CLI docs, accessibility summary
- `pseudo-kit-context.json` — machine-readable LLM context pack (61 components, all props/slots)

---

## API stability

The v1.0.0 API is **frozen**. No breaking changes will be made without a major version bump. See `bmad/artifacts/api-lock-v1.0.0.md` for the full contract.

---

## Test coverage

661+ tests · 0 failures · Chromium E2E · axe-core a11y

---

## Upgrade from v0.7.x

No migration needed. v1.0.0 is a drop-in upgrade with no API changes from v0.7.0.

```bash
npm install pseudo-html-kit@1.0.0
```

---

## What's next (post-1.0.0)

- VSCode extension — syntax highlighting + autocomplete for `.html` component files (deferred by design)
- Screen reader manual testing (NVDA + VoiceOver) — follow-up to S19-04
- AAA color contrast improvements (1 remaining `color-contrast-enhanced` violation)
- GitHub Pages deployment of `docs/index.html`

---

*pseudo-html-kit — 21 sprints · 61 components · WCAG 2.2 AA · 7.7 KB.*
