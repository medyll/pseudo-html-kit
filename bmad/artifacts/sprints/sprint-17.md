# Sprint 17 — pseudo-kit-svelte adapter + v0.6.0 GA

**Duration:** 2026-04-22 → 2026-05-05
**Capacity:** 18 story points

## Sprint Goal
Ship a `pseudo-kit-svelte` Svelte 5 adapter with `$state`/`$props` bridge and full unit tests, then release v0.6.0 GA — completing the DX framework bridges milestone.

## Stories

| ID | Epic | Title | Points | Priority | Assignee |
|---|---|---|---|---|---|
| S17-01 | DX | `pseudo-kit-svelte` package scaffold + Svelte 5 rune-based hooks | 5 | Should | frontend-team |
| S17-02 | DX | `pseudo-kit-svelte` unit tests | 3 | Should | qa-team |
| S17-03 | Release | v0.6.0 GA release — changelog, release notes, stable tag | 3 | Must | developer |

**Total:** 11 points

## Dependencies
- S17-02 depends on S17-01
- S17-03 depends on S17-01 + S17-02

## Definition of Done (sprint-level)
- [ ] S17-01: pseudo-kit-svelte package with `createComponent`, `createComponents` Svelte 5 functions
- [ ] S17-02: unit tests passing for Svelte adapter
- [ ] S17-03: v0.6.0 GA released, CHANGELOG complete

## Risks
- Svelte 5 runes (`$state`, `$effect`) cannot be tested outside a real Svelte compile step — unit tests will use the adapter's non-rune internal API surface
- Svelte compiler not available in the project — adapter must be pure JS with optional Svelte integration

*Created by bmad-master next --auto: 2026-03-11.*
