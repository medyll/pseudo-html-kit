# CHANGELOG — v0.4.0

Released: 2026-03-07

## Highlights

**v0.4.0 is the v0.4.0 GA release** finalising three sprints of native-first component migration. All 2026 Web Platform APIs (Invoker Commands, Popover API, Anchor Positioning, View Transitions, Listbox API) are now shipping in the pseudo-assets library with graceful fallbacks.

---

## What's New (Sprint 9 – 11)

### Sprint 9 — Interaction Components
- **Modal** → `<dialog>` + Invoker Commands API (S9-01)
- **Dropdown** → Popover API + `popovertarget` (S9-02)
- **Tooltip** → CSS Anchor Positioning (S9-03)
- **Notification** → Interest Invokers / `:interest` pseudo-class (S9-04)

### Sprint 10 — Form Controls
- **Input** → HTML5 Constraint Validation API + Popover inline hints (S10-01)
- **Checkbox / Radio** → `:checked` / `:invalid` + `indeterminate` state (S10-03)
- **Grid** → CSS Grid Lanes + Container Queries + flexbox fallback (S10-05)

### Sprint 11 — Form Controls + Layout (GA)
- **Select** → `appearance: base-select` (2026 Listbox API) + `::picker(select)` CSS + `@supports` gate (S11-01)
- **Combobox** → new molecule with filter input + Popover listbox + Anchor Positioning (S11-01)
- **Textarea** → Anchor Positioning for character-count hint + `field-sizing: content` auto-grow (S11-02)
- **Accordion** → `<details>/<summary>` semantics + View Transitions API animation + `exclusive` mode (S11-03)

---

## Infrastructure

- Pre-sprint fix: HAPPY-DOM-02 (`<script>` tag execution during DOMParser) — 26 failing tests resolved
- `test:components` script added; atoms/molecules now included in `test:all`
- **Total tests: 381 vitest + 211 node:test = 592 passing, 0 failures**

---

## Testing

- Vitest (client): 170 component tests (atoms + molecules + organisms) — all passing
- node:test (server/shared): 211 tests — all passing
- All tests pass under `npm run test:all` (excluding E2E)

---

## Upgrade Guide

No breaking changes. All existing component APIs remain identical. New props are optional:

- `textarea-pk`: new optional `maxlength` prop enables the character-count hint badge
- `accordion-pk`: new organism — add to your registration list
- `select-pk`: same API; `appearance: base-select` activates automatically on Chrome 135+
- `combobox-pk`: new molecule — add to your registration list

---

## Notes

- Progressive enhancement throughout: modern browsers get native API paths; all components degrade gracefully
- No build step; no framework dependency added
- CI handles npm publish — no manual release steps required
