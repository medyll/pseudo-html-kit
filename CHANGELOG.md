# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
