# PRD — pseudo-html-kit Phase 1: Interaction Components Migration

> **Status:** Draft v1.0
> **Author:** PM Agent (BMAD)
> **Date:** 2026-03-06
> **Phase:** Planning (v0.4.0 cycle)
> **Parent PRD:** `bmad/artifacts/prd.md` (v0.3.0 baseline)

---

## Overview

Migrate 4 interaction components (modal, tooltip, dropdown, notification) from JavaScript-driven behavior to native 2026 HTML/CSS APIs. This eliminates custom JS for toggle/position/dismiss logic, reduces bundle weight, and aligns pseudo-kit-assets with the modern platform.

The migration targets Chrome 146+, Firefox 128+, and Safari 18+ with progressive enhancement fallbacks for older browsers.

---

## Goals & Success Metrics

| Goal | Metric | Target |
|---|---|---|
| JS elimination | Lines of inline `<script>` removed across 4 components | >= 80% reduction |
| Native API adoption | Components using `<dialog>`, Anchor Positioning, Invoker Commands, Interest Invokers | 4/4 |
| Backward compatibility | Existing tests passing after migration | 100% (0 regressions) |
| Fallback coverage | Components functional in browsers without new APIs | Graceful degradation via feature detection |
| Accessibility parity | ARIA attributes preserved post-migration | No a11y regressions |
| Performance | No layout shift introduced by migration | CLS = 0 on affected demo pages |

---

## User Personas

Inherited from parent PRD. Primary persona impacted: **Vanilla JS Developer** — benefits from less JS to understand, debug, and maintain.

---

## Use Cases

### UC-M01 — Open/close a modal without JS

**Actor:** Vanilla JS Developer
**Trigger:** User clicks a button to open a dialog
**Flow:**
1. Developer places `<button popovertarget="modal-login">Open</button>` in layout
2. Browser natively opens `<dialog id="modal-login">` — no JS handler needed
3. Close via backdrop click or `<button popovertarget="modal-login" popovertargetaction="close">`
4. `::backdrop` pseudo-element handles overlay styling
**Expected outcome:** Modal opens/closes with zero JS, full keyboard/focus-trap support from `<dialog>`
**Edge cases:**
- Browser without `popovertarget` support -> fallback JS toggle script loaded
- SSR: `<dialog>` renders closed by default, hydration adds no extra attributes

### UC-M02 — Position a tooltip with CSS Anchor Positioning

**Actor:** Vanilla JS Developer
**Trigger:** User hovers/focuses a tooltip trigger
**Flow:**
1. Trigger element declares `anchor-name: --tooltip-{id}`
2. Tooltip content uses `position-anchor: --tooltip-{id}` + `position-area: top`
3. Browser computes position natively — no JS `getBoundingClientRect()` calls
4. Developer overrides position via `--pos` custom property
**Expected outcome:** Tooltip positioned by CSS engine, follows anchor on scroll/resize
**Edge cases:**
- Browser without Anchor Positioning -> existing `position: absolute` CSS fallback
- Viewport edge collision: `position-try-fallbacks` provides automatic flip

### UC-M03 — Toggle a dropdown with Invoker Commands

**Actor:** Vanilla JS Developer
**Trigger:** User clicks dropdown trigger button
**Flow:**
1. Trigger button uses `popovertarget="dropdown-{id}"` + `popovertargetaction="toggle"`
2. Menu `<ul popover>` shows/hides natively
3. Light-dismiss (click outside) closes the menu automatically
4. No JS event listeners needed
**Expected outcome:** Dropdown toggles with native popover behavior, auto-dismisses
**Edge cases:**
- Nested dropdowns: each has unique `id`, independent popover stacking
- Browser without popover -> fallback JS toggle

### UC-M04 — Auto-dismiss notification with Interest Invokers

**Actor:** Vanilla JS Developer
**Trigger:** Notification appears after an action
**Flow:**
1. Notification element declares `interesttarget` attribute
2. CSS animation `autoDismiss` fades out after 5s
3. If user hovers/focuses (`:interest` pseudo-class), animation pauses
4. When interest lost, animation resumes and notification fades
**Expected outcome:** No `setTimeout` JS needed for auto-dismiss; hover pauses dismissal natively
**Edge cases:**
- Browser without Interest Invokers -> fallback JS setTimeout implementation
- `dismissible` prop still works: close button removes element from DOM

---

## Functional Requirements

### Component Migrations

| ID | Requirement | Priority | Component | Notes |
|---|---|---|---|---|
| MIG-01 | Modal uses `<dialog>` element as root | Must | modal | Replace `<div class="modal">` with `<dialog>` |
| MIG-02 | Modal open/close via Invoker Commands (`popovertarget`) | Must | modal | External trigger buttons control dialog |
| MIG-03 | Modal `::backdrop` replaces `.modal__backdrop` div | Must | modal | Remove manual backdrop element |
| MIG-04 | Tooltip uses CSS Anchor Positioning (`anchor-name` / `position-anchor`) | Must | tooltip | Replace JS-based or absolute positioning |
| MIG-05 | Tooltip supports `position-area` with `--pos` custom property override | Should | tooltip | Default: `top`; accepts `bottom`, `left`, `right` |
| MIG-06 | Tooltip uses `position-try-fallbacks` for viewport edge handling | Should | tooltip | Auto-flip when clipped |
| MIG-07 | Dropdown menu uses `popover` attribute | Must | dropdown | Native show/hide, light-dismiss |
| MIG-08 | Dropdown trigger uses `popovertarget` + `popovertargetaction="toggle"` | Must | dropdown | No JS click handler |
| MIG-09 | Notification auto-dismiss via CSS animation (no JS `setTimeout`) | Must | notification | `animation: autoDismiss 5s forwards` |
| MIG-10 | Notification pause-on-hover via `:interest` pseudo-class | Should | notification | Interest Invokers API |
| MIG-11 | All 4 components retain existing slot interfaces | Must | all | No breaking changes to slot names |
| MIG-12 | All 4 components retain existing props/attributes | Must | all | `open`, `size`, `position`, `variant`, etc. |
| MIG-13 | All 4 components retain ARIA attributes | Must | all | `role`, `aria-modal`, `aria-live`, etc. |

### Feature Detection & Fallbacks

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FB-01 | Feature detection script for Invoker Commands (`popovertarget` in HTMLButtonElement) | Must | Shared utility |
| FB-02 | Feature detection for CSS Anchor Positioning (`CSS.supports('position-anchor', ...)`) | Must | Shared utility |
| FB-03 | Feature detection for Interest Invokers (`interesttarget` in HTMLElement) | Must | Shared utility |
| FB-04 | Fallback: load legacy JS toggle for modal/dropdown when Invoker Commands unavailable | Must | Dynamic import |
| FB-05 | Fallback: keep `position: absolute` CSS for tooltip when Anchor Positioning unavailable | Must | CSS `@supports` |
| FB-06 | Fallback: JS `setTimeout` for notification when Interest Invokers unavailable | Must | Dynamic import |
| FB-07 | Feature detection module as shared utility in `src/shared/` or component-level `<script>` | Should | Avoid duplication |

### Testing

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| TST-01 | Existing 16 molecule tests pass without modification (or with minimal adaptation) | Must | `tests/molecules.client.test.js` |
| TST-02 | New tests for native API behavior (dialog open/close, popover toggle) | Should | Vitest + happy-dom |
| TST-03 | E2E tests in Chrome 146+ validating native behavior | Should | Playwright Chromium |
| TST-04 | E2E tests in Firefox/WebKit validating fallback behavior | Could | Playwright multi-browser |
| TST-05 | No accessibility regressions (a11y audit passes) | Must | `playwright.a11y.config.js` |

---

## Non-Functional Requirements

| Category | Requirement | Acceptance Criteria |
|---|---|---|
| Performance | No additional render pass from migration | Same or fewer reflows measured via DevTools |
| CSS isolation | Migrated components still use `@scope` | No style leakage |
| Compatibility | Native path: Chrome 146+, Firefox 128+, Safari 18+ | Tested in Playwright |
| Compatibility | Fallback path: Chrome 118+, Firefox 128+, Safari 17.4+ | Existing browser targets preserved |
| SSR | Server rendering unaffected | `<dialog>` / `popover` render as static HTML; hydration adds behavior |
| File size | No component exceeds 10 KB | Same constraint as parent PRD |

---

## Implementation Plan (Ordered)

| Step | Component | API | Estimated Complexity | Dependencies |
|---|---|---|---|---|
| 1 | Feature detection utility | All 3 APIs | Low | None |
| 2 | Modal | `<dialog>` + Invoker Commands | Medium | Step 1 |
| 3 | Dropdown | Invoker Commands (`popover`) | Medium | Step 1 |
| 4 | Tooltip | CSS Anchor Positioning | Medium | Step 1 |
| 5 | Notification | Interest Invokers | Low-Medium | Step 1 |
| 6 | Integration testing | All | Medium | Steps 2-5 |

---

## Out of Scope

- Migration of non-interaction components (card, breadcrumb, pagination, etc.)
- New components not in the existing catalogue
- CSS Container Queries migration (separate phase)
- View Transitions API adoption (separate phase)
- Scroll-driven animations (separate phase)
- Design system / theming changes

---

## Dependencies

| Dependency | Type | Notes |
|---|---|---|
| `pseudo-html-kit` v0.3.0 | Peer | Current runtime — no runtime changes expected |
| Chrome 146+ | Browser | Required for native Invoker Commands + Interest Invokers |
| `<dialog>` element | Platform | Supported since Chrome 37, Firefox 98, Safari 15.4 |
| CSS Anchor Positioning | Platform | Chrome 125+, Firefox experimental, Safari TBD |
| Popover API | Platform | Chrome 114+, Firefox 125+, Safari 17+ |
| Interest Invokers | Platform | Chrome 146+ (newest API, most limited support) |

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Interest Invokers not shipped in Safari/Firefox | Notification fallback required long-term | Medium | FB-06 fallback; CSS-only animation still works without `:interest` |
| Anchor Positioning incomplete in Firefox | Tooltip fallback needed | Medium | FB-05 `@supports` block; existing absolute positioning preserved |
| happy-dom doesn't support `<dialog>` / `popover` | Test environment gaps | High | Mock `showModal()` / `hidePopover()` in test setup; E2E covers real behavior |
| SSR hydration mismatch with `<dialog>` | Server/client HTML diff | Low | `<dialog>` renders closed; `open` attribute added client-side only |

---

## Open Questions

- [ ] Should the feature detection utility be a standalone module (`src/shared/feature-detect.js`) or inline per component?
- [ ] Should `<dialog>` use `showModal()` (with focus trap) or `show()` (without) as default?
- [ ] Interest Invokers: confirm `:interest` pseudo-class syntax is stable in Chrome 146 spec
- [ ] Should fallback scripts be bundled in the component or lazy-loaded from a separate file?

---

## Revision History

| Date | Author | Change |
|---|---|---|
| 2026-03-06 | PM Agent (BMAD) | Initial draft from user migration plan |
