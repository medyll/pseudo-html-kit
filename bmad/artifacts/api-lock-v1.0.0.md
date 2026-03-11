# API Lock — pseudo-html-kit v1.0.0

**Date:** 2026-03-11
**Status:** LOCKED — effective from v1.0.0 tag

This document defines the public API surface of pseudo-html-kit v1.0.0.
**No breaking changes** are permitted to any item in this document without a major version bump (v2.0.0).

---

## Breaking-Change Policy

| Change type | Version bump required |
|---|---|
| Remove or rename a public export | Major |
| Remove or rename a component prop or slot | Major |
| Change a prop's type or accepted values | Major |
| Remove a public HTML attribute contract (`data-pk-resolved`, `data-ready`) | Major |
| Add a **required** prop to an existing component | Major |
| Remove a script variable available inside `<script>` blocks (`el`) | Major |
| Add a new **optional** prop or slot | Minor (non-breaking) |
| Add a new component | Minor (non-breaking) |
| Add a new export to an adapter package | Minor (non-breaking) |
| Bug fix that does not change public contract | Patch |
| CSS/style changes that do not affect layout API | Patch |

---

## Core — `pseudo-html-kit` (pseudo-kit-client.js)

### Runtime API

```js
import PseudoKit from 'pseudo-html-kit';
```

| Export | Signature | Status |
|---|---|---|
| `PseudoKit` (default) | `object` | 🔒 Locked |
| `PseudoKit.register(def)` | `({ name: string, src: string }) → void` | 🔒 Locked |
| `PseudoKit.init(root?)` | `(root?: Element) → Promise<void>` | 🔒 Locked |
| `PseudoKit.resolve(el)` | `(el: Element) → Promise<void>` | 🔒 Locked |

### Stamping contract

| Attribute | Set by | Meaning | Status |
|---|---|---|---|
| `data-pk-resolved` | PseudoKit | Component template has been stamped | 🔒 Locked |
| `data-pk-resolved="true"` | Legacy alias | Same — both forms accepted | 🔒 Locked |
| `data-ready` | Component script | Script init complete | 🔒 Locked |
| `data-pk-ssr` | SSR renderer | Server-rendered — skip re-stamp | 🔒 Locked |

### Component file contract

Each `.html` component file may contain:

| Section | Required | Status |
|---|---|---|
| `<template>` | Yes | 🔒 Locked |
| `<style>` | No | 🔒 Locked |
| `<script>` | No | 🔒 Locked |

Inside `<script>`, the variable `el` refers to the host element. This is the **only** injected variable.

---

## Component prop contracts

All `@prop` declarations in component JSDoc headers are frozen. Listed below by component.

### Atoms

| Component | Frozen props | Frozen slots |
|---|---|---|
| `avatar-pk` | size, shape, initials, aria-label | default |
| `badge-pk` | variant, size, pill, dot | default |
| `button-pk` | label, variant, size, disabled, type | default, icon-left, icon-right |
| `checkbox-pk` | name, id, value, checked, disabled, required | default |
| `chip-pk` | label, variant, removable, size | default |
| `date-picker-pk` (atom) | type | default |
| `divider-pk` | orientation, spacing | default |
| `icon-pk` | size, color, aria-label | default |
| `image-pk` | src, alt, ratio, fit, loading, rounded | default |
| `input-pk` | name, id, type, value, placeholder, disabled, required, readonly, min, max, aria-label | default, hint |
| `label-pk` | for, required, size | default |
| `loader-pk` | size, variant, aria-label | — |
| `progress-bar-pk` | value, max, label, variant, size, animated | — |
| `progress-pk` | value, max, label, variant, size | — |
| `radio-pk` | name, id, value, checked, disabled, required | default |
| `rating-pk` | value, max, readonly, aria-label | — |
| `select-pk` | name, id, value, disabled, required, aria-label | default |
| `skeleton-pk` | variant, width, height, animated | — |
| `slider-pk` | name, min, max, step, value, disabled, label, variant | — |
| `spinner-pk` | size, variant, aria-label | — |
| `tag-pk` | variant, size, removable | default |
| `textarea-pk` | name, id, value, placeholder, disabled, required, readonly, rows, aria-label | — |
| `toggle-pk` | name, id, checked, disabled, size | label |

### Molecules

| Component | Frozen props | Frozen slots |
|---|---|---|
| `breadcrumb-pk` | label, separator | items |
| `card-pk` | variant, shadow, padding, href, hoverable | header, default, footer, actions |
| `card-media-pk` | src, alt, ratio, fit | default |
| `carousel-pk` | — | default |
| `color-swatch-pk` | value | default |
| `combobox-pk` | name, id, placeholder, disabled, aria-label | default |
| `date-picker-pk` (molecule) | label, name | default |
| `dropdown-pk` | label, disabled, align, open | trigger, items |
| `form-field-pk` | name, error, hint, required, disabled | label, default |
| `grid-pk` | display, cols, gap, minItemWidth, containerQueries | default |
| `list-item-pk` | primary, secondary, disabled, href, selected, divider | leading, trailing |
| `menu-item-pk` | label, disabled, href, active, variant, shortcut | icon |
| `modal-pk` | title, open, size, closeable | header, default, footer |
| `notification-pk` | message, variant, dismissible, icon | default, action |
| `pagination-pk` | page, total, aria-label, size | — |
| `price-tag-pk` | price, currency, discount, original, size | default |
| `product-tile-pk` | title, price, currency, badge, href, loading, variant | media, default, actions |
| `search-bar-pk` | placeholder, value, aria-label, disabled | prefix, suffix |
| `tab-bar-pk` | active, aria-label | tab-1, tab-2, tab-3 |
| `tooltip-pk` | position, delay, aria-label | default, content |
| `user-info-pk` | name, size, href, secondary | avatar, role |

### Organisms

| Component | Frozen props | Frozen slots |
|---|---|---|
| `accordion-pk` | exclusive | default |
| `carousel-pk` | autoplay, interval | default |
| `cart-summary-pk` | currency, total, shipping | title, items, actions |
| `comment-thread-pk` | count, aria-label | default, composer |
| `content-row-pk` | title, href, see-all-label, aria-label | title, default |
| `feed-post-pk` | variant, timestamp, likes, comments, aria-label | avatar, header, default, media, actions |
| `footer-pk` | aria-label | brand, links, social, legal |
| `hero-banner-pk` | headline, subheadline, align, variant, overlay | media, default, cta |
| `navbar-pk` | sticky, transparent, aria-label | logo, links, actions |
| `product-detail-pk` | title, variant, aria-label | media, info, actions |
| `profile-card-pk` | name, bio, aria-label | avatar, default, actions |
| `sidebar-pk` | open, position, overlay, width | header, default, footer |
| `story-ring-pk` | label, size, aria-label | default, label |
| `tabs-pk` | variant, active | tabs, panels |
| `thumbnail-grid-pk` | columns, gap, aria-label | default |
| `topbar-pk` | sticky, aria-label | leading, title, actions |

---

## Adapter packages

### `pseudo-kit-react` (v0.3.0+)

```js
import {
  useComponent,       // (url: string) → { ready: boolean }
  usePseudoKit,       // (urls: string[]) → { ready: boolean }
  usePseudoKitReady,  // () → { ready: boolean }
  useRegisterComponent, // (url: string) → { ready: boolean }
  PseudoKitProvider,  // React component — { components, baseUrl, children }
} from 'pseudo-kit-react';

import {
  renderComponent,  // (filePath: string, props?: Record<string, unknown>) → Promise<string>
  hydrateMarker,    // (name: string) → string
} from 'pseudo-kit-react/ssr';
```

All 7 exports above are frozen.

### `pseudo-kit-svelte`

```js
import {
  pseudoKit,       // (urlOrUrls: string | string[]) → { ready: Promise<void> }
  initPseudoKit,   // (urls: string[], root?: Element) → Promise<void>
  createComponent, // (url: string) → Promise<{ name: string, def: object }>
  createComponents,// (urls: string[]) → Promise<Array<...>>
  nameFromUrl,     // (url: string) → string
} from 'pseudo-kit-svelte';
```

All 5 exports above are frozen.

### `pseudo-kit-cli`

```sh
npx pseudo-kit init [dir]   # scaffold a project
npx pseudo-kit init --help  # usage
```

Command signature and generated file structure are frozen.

---

## Generated artifacts (non-API, regenerable)

These files are outputs of scripts — **not** part of the API contract. They may be regenerated by maintainers without a version bump:

| File | Generator | Notes |
|---|---|---|
| `pseudo-kit-context.json` | `pnpm generate:context` | Regenerated on component changes |
| `docs/index.html` | `pnpm generate:docs` | Regenerated on component/doc changes |
| `bmad/artifacts/a11y-audit-*.md` | `pnpm test:a11y` | Regenerated on audit runs |
| `bmad/artifacts/color-contrast-audit-*.md` | `pnpm test:a11y` | Regenerated on audit runs |

---

## What is NOT locked

- Internal implementation details of components (CSS class names, DOM structure inside templates)
- `@keyframes` animation names
- The content of `<script>` blocks beyond the `el` variable
- Default slot content (placeholder text like "Button", "Modal content")
- Internal BMAD tooling (`bmad/`, `scripts/`)
- Dev dependencies

---

*Authored by bmad-master architect role. Effective from v1.0.0 tag. 2026-03-11.*
