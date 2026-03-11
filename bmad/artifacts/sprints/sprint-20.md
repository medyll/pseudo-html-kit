# Sprint 20 — Doc Site + LLM Context Pack

**Duration:** 2026-03-26 → 2026-04-08
**Capacity:** 20 story points

## Sprint Goal

Deliver the pseudo-html-kit documentation site (static HTML, dogfooding the library itself) and generate the machine-readable `pseudo-kit-context.json` LLM context pack — two of the three remaining v1.0.0 gates.

> ⚠️ VSCode extension deliberately deferred — lowest backlog priority. Do NOT schedule.

## Stories

| ID | Epic | Title | Points | Priority | Assignee |
|---|---|---|---|---|---|
| S20-01 | Docs | LLM context pack — generate `pseudo-kit-context.json` from JSDoc headers | 5 | Should | developer |
| S20-02 | Docs | Doc site — `docs/index.html` Getting Started + Components reference | 8 | Must | developer |
| S20-03 | Docs | Doc site — Framework Adapters (React + Svelte) + CLI sections | 3 | Must | developer |
| S20-04 | Release | v0.7.0 changelog + release notes | 2 | Must | developer |

**Total:** 18 points

## Dependencies
- S20-01: reads all component `.html` files (already in codebase)
- S20-02: depends on S20-01 for props/slots data; uses pseudo-html-kit itself for live demos
- S20-03: depends on S20-02 (appends sections to same doc site)
- S20-04: independent — can run in parallel

## Definition of Done (sprint-level)
- [x] S20-01: `pseudo-kit-context.json` — 61 components, props, slots, layer, example; `pnpm generate:context`
- [x] S20-02: `docs/index.html` (4,190 lines) — Getting Started + full component reference, props tables, slots tables, template examples
- [x] S20-03: Framework Adapters (React SSR + Svelte 5) + CLI + Accessibility sections in doc site
- [x] S20-04: `CHANGELOG-v0.7.0.md` written; `package.json` bumped to v0.7.0
- [x] All tests green — 345 vitest · 0 failures · bundle 7.7 KB ✅

## Risks
- S20-01 JSDoc parsing is regex-based — prop/slot extraction may miss edge cases in older components; review manually after generation
- S20-02 doc site size: keeping it a single HTML file simplifies hosting; can be split later

*Created by bmad-master: 2026-03-11.*
