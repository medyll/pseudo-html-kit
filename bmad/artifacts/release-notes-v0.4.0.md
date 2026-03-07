# Release Notes — v0.4.0 GA

**Release Date:** 2026-03-07  
**Sprints:** Sprint 09 · Sprint 10 · Sprint 11 (fully complete)

---

## 🎯 Headline

**v0.4.0 ships the full 2026 Web Platform API migration.** All four interaction components (Sprint 9), three form controls (Sprint 10), and three additional components (Sprint 11) now leverage native browser APIs with zero-JS paths on modern browsers and graceful fallbacks everywhere else.

---

## 🆕 What's New

### Sprint 9 — Interaction Components (S9-01 → S9-07)

| Component | API(s) | Fallback |
|:----------|:-------|:---------|
| **Modal** | `<dialog>`, Invoker Commands | JS `.showModal()` |
| **Dropdown** | Popover API, `popovertarget` | CSS `[open]` + JS |
| **Tooltip** | CSS Anchor Positioning | `position: absolute` |
| **Notification** | Interest Invokers, `:interest` | `:hover/:focus-within` |

### Sprint 10 — Form Controls (S10-01, S10-03, S10-05)

| Component | API(s) | Fallback |
|:----------|:-------|:---------|
| **Input** | HTML5 Constraint Validation, Popover hints | JS error message |
| **Checkbox / Radio** | `:checked`, `:invalid`, `indeterminate` | Attribute-based states |
| **Grid** | CSS Grid Lanes, Container Queries | Flexbox |

### Sprint 11 — Form Controls + Layout GA (S11-01 → S11-04)

| Component | API(s) | Notes |
|:----------|:-------|:------|
| **Select** | `appearance: base-select`, `::picker(select)`, `@supports selector(::picker(select))` | New atom — fully styleable native select on Chrome 135+ |
| **Combobox** | Popover API, CSS Anchor Positioning | New molecule — filter input + listbox |
| **Textarea** | Anchor Positioning, `field-sizing: content` | Anchored char-count hint badge; auto-grow without JS |
| **Accordion** | `<details>/<summary>`, View Transitions API | New organism — smooth open/close; `exclusive` mode |

---

## ✅ Quality Gates

| Check | Status | Details |
|:------|:------:|:--------|
| **vitest (atoms)** | ✅ 69 / 69 | Including 3 new textarea hint tests |
| **vitest (molecules)** | ✅ 57 / 57 | Including combobox tests |
| **vitest (organisms)** | ✅ 44 / 44 | Including 5 new accordion tests |
| **vitest (client)** | ✅ 51 / 51 | pseudo-kit-client core |
| **vitest (viewer)** | ✅ 20 / 20 | pseudo-canvas-viewer |
| **node:test (server/shared)** | ✅ 211 / 211 | No regressions |
| **node:test (index)** | ✅ 81 / 81 | accordion-pk, select-pk, combobox-pk exported |
| **Total** | ✅ 533 passing | 0 failures |

---

## 📊 Sprint 11 Implementation Summary

| Story | Component | Points | Tests Added |
|:------|:----------|:------:|:-----------:|
| S11-01 | select-pk (atom) + combobox-pk (molecule) | 5 | 4 + 4 |
| S11-02 | textarea-pk (anchor hint + auto-grow) | 3 | 3 |
| S11-03 | accordion-pk (new organism) | 3 | 5 |
| S11-04 | v0.4.0 GA release | 3 | — |

---

## 🔄 Migration / Upgrade Guide

**No breaking changes.** All existing component APIs are backward-compatible.

### New opt-in attributes

```html
<!-- textarea-pk: character-count hint (new) -->
<textarea-pk name="bio" maxlength="500"></textarea-pk>

<!-- accordion-pk: exclusive mode (new organism) -->
<accordion-pk exclusive>
  <details><summary>Panel 1</summary><div class="accordion__content">…</div></details>
  <details><summary>Panel 2</summary><div class="accordion__content">…</div></details>
</accordion-pk>

<!-- select-pk: base-select activates automatically on Chrome 135+ -->
<select-pk name="country">
  <option value="us">United States</option>
</select-pk>
```

### Registration

```js
import { components, componentNames } from 'pseudo-assets';

// Register new Sprint 11 components
PseudoKit
  .register({ name: componentNames.select,   src: components.select })
  .register({ name: componentNames.combobox, src: components.combobox })
  .register({ name: componentNames.accordion, src: components.accordion })
  .init();
```

---

## 🚀 Deployment Notes

- **No build step** — vanilla HTML/CSS/JS throughout
- **CI publishes** — `git tag v0.4.0` triggers the pipeline; never run `npm publish` manually
- **Browser support:** Chrome 118+, Firefox 128+, Safari 17.4+ (with progressive enhancement to Chrome 135+ for base-select, Chrome 125+ for anchor positioning, Chrome 111+ for View Transitions)

---

## 🔗 References

- **Sprint 11:** [sprint-11.md](sprints/sprint-11.md)
- **Sprint 10:** [sprint-10.md](sprints/sprint-10.md)
- **Sprint 9:** [sprint-09.md](sprints/sprint-09.md)
- **Tech Spec:** [tech-spec-phase1-migration.md](tech-spec-phase1-migration.md)
- **Changelog:** [CHANGELOG-v0.4.0.md](../../CHANGELOG-v0.4.0.md)
