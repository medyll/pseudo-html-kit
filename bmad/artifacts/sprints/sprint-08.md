# Sprint 08 – Quality, DX & Framework Reach

**Duration:** 2026-03-03 → 2026-03-10
**Capacity:** 3 devs · ~45 story points
**Version target:** v0.3.0

## Sprint Goal

Harden the library with per-component unit tests and accessibility fixes, improve developer experience with JSDoc annotations, and open the kit to the React ecosystem with a thin wrapper adapter.

---

## Stories

| ID | Epic | Title | Points | Priority | Assignee |
|---|---|---|---|---|---|
| S8-01 | A – Unit Tests | Vitest unit tests — Atoms (17 components) | 8 | Must | ✅ |
| S8-02 | A – Unit Tests | Vitest unit tests — Molecules (16 components) | 7 | Must | ✅ |
| S8-03 | A – Unit Tests | Vitest unit tests — Organisms (13 components) | 6 | Must | ✅ |
| S8-04 | B – A11y | Automated a11y audit (axe-core via Playwright) on all 46 components | 5 | Must | ✅ |
| S8-05 | B – A11y | Fix Critical + Serious a11y violations surfaced by S8-04 | 5 | Must | ✅ |
| S8-06 | C – JSDoc | JSDoc `@prop` / `@slot` / `@event` annotations — Atoms + Molecules | 4 | Should | ✅ |
| S8-07 | C – JSDoc | JSDoc `@prop` / `@slot` / `@event` annotations — Organisms + Frames | 3 | Should | ✅ |
| S8-08 | D – React | `pseudo-kit-react` package scaffold (peerDep: react ≥ 18) | 3 | Should | ✅ |
| S8-09 | D – React | `useComponent(url)` hook — loads + registers a pseudo-html-kit component | 4 | Should | ✅ |

**Total: 45 points**

---

## Dependencies

- S8-04 depends on S8-01/02/03 test infra being in place (shared fixtures)
- S8-05 depends on S8-04 audit results
- S8-09 depends on S8-08 scaffold

---

## Definition of Done (sprint-level)

- [ ] All Must stories completed and reviewed
- [ ] Unit tests: ≥ 1 test per component public API (render, slots, props)
- [ ] A11y: 0 Critical / 0 Serious axe violations across 46 components
- [ ] JSDoc: all components have `@prop`, `@slot` annotations
- [ ] React adapter: `useComponent` hook demo working in a plain React 18 app
- [ ] Tests passing: node:test + vitest + E2E (existing 12 scenarios still green)
- [ ] CHANGELOG updated for v0.3.0

---

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Component unit test scope creep (46 components) | High | Batch via test generator helper; timebox to 2 min/component |
| A11y violations too numerous to fix in 1 sprint | Medium | Fix Critical + Serious only; log Moderate as backlog items |
| React adapter complexity (SSR + hydration) | Medium | Ship client-side only in v0.3.0; SSR adapter deferred to v0.4.0 |
