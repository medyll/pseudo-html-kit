# Sprint 11 — v0.4.0 GA: Deferred Migrations + Formal Release

**Status:** In Progress  
**Duration:** 2026-03-28 → 2026-04-10 (2 weeks)  
**Capacity:** 1 dev, ~8 dev-days  

---

## Sprint Goal

Complete the four deferred Sprint 10 stories to finalize v0.4.0 scope: Select/Combobox (new Listbox API), Textarea anchor-positioning hints, Accordion + View Transitions, and the formal v0.4.0 GA release.

---

## Pre-Sprint Fix ✅ DONE

| Issue | Description | Resolution |
|:------|:------------|:----------|
| HAPPY-DOM-02 | happy-dom executes `<script>` during DOMParser, causing 26 test failures | Strip `<script>` from HTML before DOMParser in `_loadComponent` |
| test:all gap | atoms/molecules vitest tests excluded from CI run | Added `test:components` + included in `test:all` |
| input-pk test | Test checked `.input__error` (removed in S10-01) | Updated to `.input__error-fallback` |

**Result:** 301 vitest + 208 node:test = 509 tests passing, 0 failures.

---

## Stories

| ID | Title | Estimate | Status |
|:---|:------|:--------:|:------:|
| S11-01 | **Select:** Listbox + Combobox (new Listbox API) | 5 | ✅ done |
| S11-02 | **Textarea:** Anchor Positioning for auto-resize hints | 3 | ✅ done |
| S11-03 | **Accordion:** CSS `@supports` + View Transitions API | 3 | ✅ done |
| S11-04 | **v0.4.0 GA Release** (finalize, tag, publish via CI) | 3 | ✅ done |

**Total:** 14 pts

---

## Definition of Done (Sprint)

- [ ] All 4 stories pass Acceptance Criteria
- [ ] `npx vitest run` → 0 failures
- [ ] `npm test` → 0 failures
- [ ] `npm run test:e2e` → 0 failures
- [ ] v0.4.0 release notes finalized
- [ ] Git tag `v0.4.0` pushed (CI handles publish)
