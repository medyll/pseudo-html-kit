# Sprint 19 — Final Accessibility Pass + Performance Budget

**Duration:** 2026-03-12 → 2026-03-25
**Capacity:** 20 story points

## Sprint Goal

Achieve full WCAG 2.2 AA compliance by applying `prefers-reduced-motion` and `:focus-visible` to the remaining components, validate the bundle performance budget, wire `aria-label` on date-picker, and run an automated color-contrast audit — clearing the last gates before v1.0.0.

> ⚠️ VSCode extension deliberately deferred — lowest backlog priority. Do NOT schedule.

## Stories

| ID | Epic | Title | Points | Priority | Assignee |
|---|---|---|---|---|---|
| S19-01 | A11y | Add `prefers-reduced-motion` + `:focus-visible` to remaining 29 transition components | 8 | Must | frontend-team |
| S19-02 | A11y | Wire `aria-label` on `molecules/date-picker-pk.html` input | 2 | Must | frontend-team |
| S19-03 | A11y | axe-core Playwright color-contrast audit (automated) | 5 | Must | qa-team |
| S19-04 | Perf | Bundle size CI step — validate `pseudo-kit-client.js` ≤ 12 KB gzip | 3 | Must | infra-team |

**Total:** 18 points

## Dependencies
- S19-01: no external deps — pure CSS changes across component files
- S19-02: no external deps — small script patch on date-picker-pk.html
- S19-03: requires Playwright already installed (✅ done), needs `axe-core` npm package
- S19-04: requires bundled pseudo-kit-client.js size measurement script

## Definition of Done (sprint-level)
- [x] S19-01: 24 components patched with `@media (prefers-reduced-motion: reduce)` guard; 8 interactive components received explicit `:focus-visible` rules
- [x] S19-02: `date-picker-pk` now forwards `label`/`aria-label` + `name` props to inner input
- [ ] S19-03: Playwright axe-core run passes with 0 color-contrast violations across all demo pages
- [x] S19-04: `scripts/check-bundle-size.js` added; client 7.7 KB gzip ✅ server 4.4 KB gzip ✅ (both within budget); `check:bundle` npm script added
- [x] All unit tests green — 345 passing

## Risks
- S19-01 is wide (29 files) but mechanical — low implementation risk, moderate review effort
- S19-03 may surface new contrast issues in custom theme demos — mitigate by auditing default tokens only
- S19-04 bundle size should comfortably pass; risk only if recent additions inflated size unexpectedly

*Created by bmad-master: 2026-03-11.*
