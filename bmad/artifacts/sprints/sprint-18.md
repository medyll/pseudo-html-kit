# Sprint 18 — Accessibility Audit + React SSR + v1.0.0 Planning

**Duration:** 2026-05-06 → 2026-05-19
**Capacity:** 18 story points

## Sprint Goal
Run a WCAG 2.2 AA accessibility audit on all 52 components, add a React SSR adapter to pseudo-kit-react, and produce a v1.0.0 planning document — setting up the final API-lock release.

> ⚠️ VSCode extension deliberately deferred — lowest backlog priority.

## Stories

| ID | Epic | Title | Points | Priority | Assignee |
|---|---|---|---|---|---|
| S18-01 | A11y | WCAG 2.2 AA audit — all 52 components (automated + manual review) | 5 | Must | qa-team |
| S18-02 | DX | `pseudo-kit-react` SSR adapter — `renderToString` + hydration marker | 5 | Should | frontend-team |
| S18-03 | Planning | v1.0.0 planning document — API lock, doc site spec, perf budget | 3 | Must | pm |

**Total:** 13 points

## Dependencies
- S18-01: needs all component files readable (already done)
- S18-02: depends on existing pseudo-kit-server.js + pseudo-kit-react v0.3.0
- S18-03: independent — can run in parallel with S18-01/02

## Definition of Done (sprint-level)
- [x] S18-01: audit report at `bmad/artifacts/a11y-audit-v0.6.0.md` — all WCAG AA gaps documented with severity
- [x] S18-02: `renderComponent(url, props)` SSR function in pseudo-kit-react + tests (15 tests added)
- [x] S18-03: `bmad/artifacts/prd-v1.0.0.md` drafted with acceptance criteria for each v1.0.0 goal
- [x] All tests green — 656 passing (29 react, up from 14)

## Backlog (deferred, not in this sprint)
- VSCode extension — syntax highlight + autocomplete (lowest priority, end of backlog)
- LLM context pack generation
- Performance budget tooling

*Created by bmad-master: 2026-03-11.*
