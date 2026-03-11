# Release Notes — v0.6.0 GA

**Release date:** 2026-03-11
**Type:** Minor — DX milestone complete

## What's new

### Framework Bridges
Two new framework adapters ship with v0.6.0:

- **`pseudo-kit-react` v0.3.0** — React 18 hooks with 14 unit tests. Stable, production-ready.
- **`pseudo-kit-svelte` v0.1.0** — Svelte 5-compatible async functions (`createComponent`, `createComponents`, `pseudoKit`, `initPseudoKit`) with 18 unit tests. Compiler-agnostic — works in any JS context.

### Canvas live reload
The pseudo-canvas-viewer now supports `?watch=1` for continuous file watching during development.

### CLI scaffold
`npx pseudo-kit init [dir]` creates a ready-to-run project in seconds.

## Coverage
641 tests passing — 226 node:test + 377 vitest (345 main + 14 react + 18 svelte) + 38 E2E · 0 failures

## Roadmap — What's next (v0.7.0)
- VSCode extension — syntax highlighting + autocomplete for pseudo-html `.html` files
- `pseudo-kit-react` SSR adapter
- Full accessibility audit (WCAG 2.2 AA for all 52 components)
- v1.0.0 planning
