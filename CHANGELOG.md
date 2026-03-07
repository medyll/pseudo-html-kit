# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-03-07

### Added
- **Select** — `appearance: base-select` (2026 Listbox API) + `::picker(select)` CSS + `@supports` gate for fully styleable native select (S11-01)
- **Combobox** — new molecule with filter input, Popover listbox, and CSS Anchor Positioning (S11-01)
- **Textarea** — Anchor Positioning for anchored character-count hint badge + `field-sizing: content` for JS-free auto-grow (S11-02)
- **Accordion** — new organism using `<details>/<summary>` semantics with View Transitions API animation and `exclusive` attribute for accordion mode (S11-03)
- **Modal** — `<dialog>` + Invoker Commands API (S9-01)
- **Dropdown** — Popover API + `popovertarget` (S9-02)
- **Tooltip** — CSS Anchor Positioning zero-JS (S9-03)
- **Notification** — Interest Invokers / `:interest` pseudo-class (S9-04)
- **Input** — HTML5 Constraint Validation API + Popover inline error hints (S10-01)
- **Checkbox / Radio** — `:checked` / `:invalid` + `indeterminate` state (S10-03)
- **Grid** — CSS Grid Lanes + Container Queries + flexbox fallback (S10-05)
- `test:components` npm script; atoms/molecules now included in `test:all`
- Total: 592 tests (381 vitest + 211 node:test), 0 failures

### Fixed
- HAPPY-DOM-02: `<script>` tag executed by DOMParser in happy-dom — stripped before parsing in `_loadComponent`
- 26 previously failing vitest tests resolved by HAPPY-DOM-02 fix

## [0.3.0] - 2026-03-03

### Added
- Added broad component unit coverage for pseudo-assets:
  - `tests/atoms.client.test.js` (atoms)
  - `tests/molecules.client.test.js` (molecules)
  - `tests/organisms.client.test.js` (organisms)
- Added Playwright + axe accessibility audit workflow:
  - `playwright.a11y.config.js`
  - `tests/a11y-audit.a11y.e2e.js`
  - `src/a11y-audit.html`
- Added `pnpm test:a11y` script.
- Added `pseudo-kit-react` workspace package with:
  - `useComponent(url)` hook
  - `usePseudoKit(urls)` hook
  - package scaffold and demo page.

### Changed
- Upgraded pseudo-assets component headers to richer JSDoc metadata patterns (`@prop` / `@slot`) for improved DX and generation context.
- Updated BMAD sprint/state artifacts to mark Sprint 08 completion and v0.3.0 release readiness.

### Fixed
- Fixed all Critical and Serious accessibility findings in Sprint 08 audit scope (0 Critical / 0 Serious in audit run).

## [0.2.0] - 2026-03-02

### Added
- Published `pseudo-kit` core runtime and `pseudo-stack-assets` package baseline.
- Delivered pseudo-assets component library (atoms, molecules, organisms), frame skeletons, viewer, and demo apps.

[0.3.0]: https://github.com/example/pseudo-html-kit/releases/tag/v0.3.0
[0.2.0]: https://github.com/example/pseudo-html-kit/releases/tag/v0.2.0
