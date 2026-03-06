# Sprint 09 — Interaction Components Migration (2026 HTML/CSS APIs)

**Duration:** 2026-03-06 -> 2026-03-20
**Capacity:** 1 dev, ~10 dev-days

## Sprint Goal

Migrate modal, dropdown, tooltip, and notification components from JS-driven behavior to native 2026 HTML/CSS APIs (`<dialog>`, Popover, Anchor Positioning, Interest Invokers) with progressive enhancement fallbacks.

## Stories

| ID | Epic | Title | Points | Priority | Dep |
|---|---|---|---|---|---|
| S9-01 | Migration | Modal: migrate to `<dialog>` + Invoker Commands | 5 | Must | — |
| S9-02 | Migration | Dropdown: migrate to Popover API + `popovertarget` | 5 | Must | — |
| S9-03 | Migration | Tooltip: CSS Anchor Positioning progressive enhancement | 3 | Must | — |
| S9-04 | Migration | Notification: autodismiss animation + Interest Invokers | 3 | Must | — |
| S9-05 | Testing | Unit test mocks + updates for new APIs | 3 | Must | S9-01..04 |
| S9-06 | Testing | E2E tests for native API behavior (Playwright) | 3 | Should | S9-05 |
| S9-07 | QA | Cross-browser fallback validation (Firefox, WebKit) | 2 | Should | S9-06 |

**Total:** 24 points

## Dependencies

- S9-01 and S9-02 share Invoker Commands pattern — can be done in parallel
- S9-03 is CSS-only, fully independent
- S9-04 is additive (new `autodismiss` prop), independent
- S9-05 must wait for all 4 component stories
- S9-06 and S9-07 are sequential (E2E before cross-browser)

## Execution Order

```
Phase A (parallel):  S9-01 + S9-02 + S9-03 + S9-04
Phase B (sequential): S9-05 -> S9-06 -> S9-07
```

## Definition of Done (sprint-level)

- [ ] All 4 components migrated to native APIs
- [ ] Fallback behavior works in Chrome 118+, Firefox 128+, Safari 17.4+
- [ ] Native behavior works in Chrome 146+
- [ ] All existing molecule tests pass (0 regressions)
- [ ] New E2E tests covering native API paths
- [ ] `pnpm test` green (434+ tests)
- [ ] No accessibility regressions

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| happy-dom lacks `<dialog>` / Popover API | Unit tests need mocks | S9-05 creates mock layer |
| `commandfor`/`command` vs `popovertarget` for `<dialog>` | Modal trigger syntax unclear | Verify Chrome 146 spec; fallback to JS `.showModal()` call |
| Anchor Positioning not in Firefox stable | Tooltip fallback path is critical | Existing absolute CSS preserved via `@supports not` |
| Interest Invokers only in Chrome 146 | Notification `:interest` limited reach | `:hover` + `:focus-within` cover all browsers; `:interest` is enhancement |

## Traces

- PRD: `bmad/artifacts/prd-phase1-migration.md` (MIG-01 to MIG-13, FB-01 to FB-07)
- Tech Spec: `bmad/artifacts/tech-spec-phase1-migration.md`
