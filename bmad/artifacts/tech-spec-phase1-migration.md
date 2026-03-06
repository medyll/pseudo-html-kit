# Tech Spec — Phase 1: Interaction Components Migration

> **Status:** Draft v1.0
> **Author:** PM Agent (BMAD)
> **Date:** 2026-03-06
> **Traces to:** [prd-phase1-migration.md](prd-phase1-migration.md) (MIG-01 to MIG-13, FB-01 to FB-07)

---

## Stack

| Layer | Technology | Justification |
|---|---|---|
| Runtime (client) | Vanilla JS ESM, browser | Existing — no change |
| CSS | `@scope` (native CSS) | Existing — no change |
| New: Dialog API | `<dialog>` element | MIG-01 — native modal semantics |
| New: Popover API | `popover` attribute | MIG-07 — native show/hide + light-dismiss |
| New: Invoker Commands | `popovertarget` / `popovertargetaction` | MIG-02, MIG-08 — declarative open/close |
| New: Anchor Positioning | `anchor-name` / `position-anchor` / `position-area` | MIG-04 — CSS-based tooltip positioning |
| New: Interest Invokers | `interesttarget` / `:interest` | MIG-10 — hover/focus state for notification |
| Test (client) | Vitest + happy-dom | Existing — needs mocks for new APIs |
| Test (E2E) | Playwright (Chromium, Firefox, WebKit) | Existing — real browser validation |

---

## System Architecture Overview

```
                    pseudo-kit-client.js (unchanged)
                           │
              ┌────────────┼────────────┐
              │            │            │
         MutationObserver  │    CSSStyleSheet
         (DOM scanning)    │    (adopted styles)
              │            │            │
              ▼            ▼            ▼
         ┌─────────────────────────────────┐
         │   Component .html files         │
         │   <template> + <style> + <script>│
         ├─────────────────────────────────┤
         │ BEFORE (v0.3.0)                 │
         │  modal:  <div class="modal">    │
         │  tooltip: position:absolute     │
         │  dropdown: display:none toggle  │
         │  notif:  no auto-dismiss        │
         ├─────────────────────────────────┤
         │ AFTER (v0.4.0)                  │
         │  modal:  <dialog> + ::backdrop  │
         │  tooltip: anchor positioning    │
         │  dropdown: <ul popover>         │
         │  notif:  CSS animation+:interest│
         └─────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │  Fallback   │
                    │  detection  │
                    │ (per-component │
                    │  <script>)  │
                    └─────────────┘
```

**Key constraint:** The runtime (`pseudo-kit-client.js`) is **not modified**. All changes are scoped to the 4 component `.html` files and their `<template>`, `<style>`, and `<script>` blocks.

---

## Component-Level Design

### 1. Modal (`modal.html`) — `<dialog>` + Invoker Commands

**Current state:** `<div class="modal" role="dialog">` with CSS `display: none / flex` toggle via `[open]` attribute. Manual `.modal__backdrop` div. Script forwards ARIA attributes only.

**Target state:**

```html
<template>
  <dialog class="modal" aria-labelledby="modal-title">
    <div class="modal__container">
      <div class="modal__header">
        <slot name="header">
          <span class="modal__title" id="modal-title">Modal</span>
        </slot>
        <button class="modal__close" type="button" aria-label="Close">✕</button>
      </div>
      <div class="modal__body">
        <slot>Modal content</slot>
      </div>
      <div class="modal__footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </dialog>
</template>
```

**Changes breakdown:**

| Area | Before | After | Rationale |
|---|---|---|---|
| Root element | `<div class="modal" role="dialog" aria-modal="true">` | `<dialog class="modal">` | `<dialog>` provides native `role="dialog"` + `aria-modal` + focus trap |
| Backdrop | `<div class="modal__backdrop">` (manual) | `<dialog>::backdrop` (native) | Eliminates DOM node; `::backdrop` handled by browser |
| Open/close | `[open]` attribute + CSS `display` | `dialog.showModal()` / `dialog.close()` | Native focus management, Escape key handling, top-layer stacking |
| External trigger | None (JS sets `[open]`) | `<button popovertarget="modal-{id}">` (Invoker Commands) | Declarative open/close from outside the component |
| Close button | `<button class="modal__close">` (needs JS click handler) | `<button class="modal__close" popovertargetaction="close">` | Declarative close via Invoker Commands |
| ARIA | Manual `role="dialog"` + `aria-modal="true"` | Implicit from `<dialog>` | Less code, guaranteed correct semantics |

**CSS changes:**

```css
@scope (dialog.modal) {
  :scope {
    /* Remove: display: none; position: fixed; inset: 0; */
    /* <dialog> is hidden by default, shown via showModal() */
    border: none;
    padding: 0;
    max-width: 32rem;
    max-height: calc(100dvh - 2rem);
    background: transparent;
    /* dialog[open] is native — no custom [open] selector needed */
  }

  ::backdrop {
    background: rgba(0, 0, 0, .5);
  }

  /* Container, header, body, footer styles: unchanged */
  /* Size variants: :scope[size="sm/lg/fullscreen"] — keep as-is */
}
```

**Script block:**

```js
// Feature detection + fallback
const dialog = el.querySelector('dialog.modal');
if (!dialog) return;

// Close button wiring (works regardless of Invoker Commands support)
const closeBtn = dialog.querySelector('.modal__close');
if (closeBtn) closeBtn.addEventListener('click', () => dialog.close());

// Backdrop click-to-close
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) dialog.close();
});

// Open API: observe host [open] attribute for programmatic control
const obs = new MutationObserver(() => {
  if (el.hasAttribute('open') && !dialog.open) dialog.showModal();
  else if (!el.hasAttribute('open') && dialog.open) dialog.close();
});
obs.observe(el, { attributes: true, attributeFilter: ['open'] });

// Sync: when dialog closes natively (Escape key), remove host [open]
dialog.addEventListener('close', () => el.removeAttribute('open'));

// Forward title prop
if (el.hasAttribute('title')) {
  const titleEl = dialog.querySelector('.modal__title');
  if (titleEl) titleEl.textContent = el.getAttribute('title');
}
```

**SSR impact:** `<dialog>` renders as closed HTML. No `open` attribute on server. Client hydration calls `showModal()` only when host `[open]` is set.

---

### 2. Tooltip (`tooltip.html`) — CSS Anchor Positioning

**Current state:** CSS-only tooltip using `position: absolute` with manual positioning per direction (top/bottom/left/right). Arrow via `::after` pseudo-element. Show on `:hover` / `:focus-visible`.

**Target state:** Dual-path CSS — Anchor Positioning when supported, fallback to current absolute positioning.

**Template: unchanged.** No HTML modifications needed.

**CSS changes (progressive enhancement via `@supports`):**

```css
@scope (.tooltip) {
  :scope {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  /* ── Fallback: existing absolute positioning (unchanged) ── */
  .tooltip__content {
    position: absolute;
    z-index: var(--z-tooltip, 600);
    /* ... existing styles ... */
    bottom: calc(100% + .4rem);
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    visibility: hidden;
    transition: opacity .15s, visibility .15s;
  }

  /* ... existing position="bottom/left/right" rules ... */

  /* ── Native: Anchor Positioning (Chrome 125+) ── */
  @supports (anchor-name: --x) {
    :scope {
      anchor-name: --tooltip-anchor;
    }

    .tooltip__content {
      /* Override absolute positioning */
      position: fixed;
      position-anchor: --tooltip-anchor;
      position-area: var(--pos, top);
      margin: 0;
      /* Reset manual transforms */
      left: auto;
      bottom: auto;
      top: auto;
      right: auto;
      transform: none;
      /* Auto-flip when clipped */
      position-try-fallbacks: flip-block, flip-inline;
    }

    /* Position prop maps to custom property */
    :scope[position="top"]    { --pos: top; }
    :scope[position="bottom"] { --pos: bottom; }
    :scope[position="left"]   { --pos: left; }
    :scope[position="right"]  { --pos: right; }

    /* Arrow adjustments for anchor positioning */
    .tooltip__content::after {
      /* Arrow position auto-adjusts with position-area */
      position-anchor: --tooltip-anchor;
    }
  }

  /* Show on hover/focus — same as before */
  :scope:hover .tooltip__content,
  .tooltip__trigger:focus-visible ~ .tooltip__content {
    opacity: 1;
    visibility: visible;
  }
}
```

**Script block:** None needed. Pure CSS solution.

**Key decisions:**
- `anchor-name` is set on `:scope` (the `.tooltip` wrapper), not on the trigger — simpler, one anchor per tooltip instance
- `position-try-fallbacks: flip-block, flip-inline` handles viewport edge cases natively
- Fallback CSS is preserved verbatim inside the same `@scope` block, overridden only when `@supports (anchor-name: --x)` matches
- No unique `--tooltip-{uuid}` needed — each tooltip instance has its own scope, so `--tooltip-anchor` is unambiguous within scope

---

### 3. Dropdown (`dropdown.html`) — Popover API + Invoker Commands

**Current state:** `<ul class="dropdown__menu">` hidden via `display: none`, shown when host has `[open]` attribute. No JS in the component (attribute-driven CSS).

**Target state:**

```html
<template>
  <div class="dropdown">
    <button class="dropdown__trigger" type="button"
            aria-haspopup="listbox" aria-expanded="false"
            popovertarget="dropdown-menu">
      <slot name="trigger">Options</slot>
      <span class="dropdown__arrow" aria-hidden="true">▾</span>
    </button>
    <ul class="dropdown__menu" id="dropdown-menu" popover role="listbox">
      <slot name="items"></slot>
    </ul>
  </div>
</template>
```

**Changes breakdown:**

| Area | Before | After | Rationale |
|---|---|---|---|
| Menu element | `<ul class="dropdown__menu">` | `<ul class="dropdown__menu" popover id="dropdown-menu">` | Native popover show/hide + light-dismiss |
| Trigger button | No popover link | `popovertarget="dropdown-menu"` | Declarative toggle without JS |
| Open/close | CSS `:scope[open] .dropdown__menu { display: block }` | Popover API manages visibility | Browser handles show/hide, stacking, light-dismiss |
| Click-outside | Not implemented | Native light-dismiss from `popover` | Free behavior from platform |

**CSS changes:**

```css
@scope (.dropdown) {
  :scope {
    position: relative;
    display: inline-block;
  }

  /* Trigger styles: unchanged */

  .dropdown__menu {
    /* Keep visual styling */
    z-index: var(--z-dropdown, 200);
    min-width: 12rem;
    margin: 0;
    padding: .25rem 0;
    list-style: none;
    background-color: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius-md, .375rem);
    box-shadow: 0 4px 16px rgba(0,0,0,.1);
  }

  /* Popover positioning — anchor to trigger */
  @supports (anchor-name: --x) {
    .dropdown__trigger {
      anchor-name: --dropdown-trigger;
    }
    .dropdown__menu {
      position-anchor: --dropdown-trigger;
      position-area: bottom span-right;
      margin-top: .25rem;
    }
    :scope[align="right"] .dropdown__menu {
      position-area: bottom span-left;
    }
  }

  /* Fallback: absolute positioning (browsers without anchor-name) */
  @supports not (anchor-name: --x) {
    .dropdown__menu {
      position: absolute;
      top: calc(100% + .25rem);
      left: 0;
    }
    :scope[align="right"] .dropdown__menu {
      left: auto;
      right: 0;
    }
  }

  /* Arrow rotation synced to popover state */
  .dropdown__menu:popover-open ~ .dropdown__arrow,
  :scope[open] .dropdown__arrow {
    transform: rotate(180deg);
  }
}
```

**Script block:**

```js
const trigger = el.querySelector('.dropdown__trigger');
const menu = el.querySelector('.dropdown__menu');
if (!trigger || !menu) return;

// Generate unique ID to avoid conflicts when multiple dropdowns exist
const uid = 'dd-' + Math.random().toString(36).slice(2, 8);
menu.id = uid;
trigger.setAttribute('popovertarget', uid);

// Sync aria-expanded with popover state
menu.addEventListener('toggle', (e) => {
  const open = e.newState === 'open';
  trigger.setAttribute('aria-expanded', String(open));
  if (open) el.setAttribute('open', '');
  else el.removeAttribute('open');
});

// Fallback: if popover not supported, wire manual toggle
if (!('popover' in HTMLElement.prototype)) {
  menu.removeAttribute('popover');
  trigger.removeAttribute('popovertarget');
  trigger.addEventListener('click', () => {
    const isOpen = el.hasAttribute('open');
    if (isOpen) el.removeAttribute('open');
    else el.setAttribute('open', '');
  });
  // Click-outside fallback
  document.addEventListener('click', (e) => {
    if (!el.contains(e.target)) el.removeAttribute('open');
  });
}

// Disabled state
if (el.hasAttribute('disabled')) {
  trigger.disabled = true;
}
```

---

### 4. Notification (`notification.html`) — CSS Animation + Interest Invokers

**Current state:** Static notification with variant colors and dismiss button. No auto-dismiss. No JS.

**Target state:** CSS-driven auto-dismiss with hover-pause via `:interest` pseudo-class.

**Template changes:**

```html
<template>
  <div class="notification" role="alert">
    <span class="notification__icon" aria-hidden="true"></span>
    <div class="notification__content">
      <slot>Notification message</slot>
    </div>
    <div class="notification__action">
      <slot name="action"></slot>
    </div>
    <button class="notification__dismiss" type="button" aria-label="Dismiss">✕</button>
  </div>
</template>
```

**Template: unchanged.** All behavior added via CSS and script.

**CSS additions (appended to existing styles):**

```css
/* Auto-dismiss animation */
:scope[autodismiss] {
  animation: pk-notif-dismiss var(--dismiss-duration, 5s) linear forwards;
}

/* Pause on hover/focus (all browsers) */
:scope[autodismiss]:hover,
:scope[autodismiss]:focus-within {
  animation-play-state: paused;
}

/* Interest Invokers enhancement (Chrome 146+) */
@supports selector(:interest) {
  :scope[autodismiss]:interest {
    animation-play-state: paused;
  }
}

@keyframes pk-notif-dismiss {
  0%   { opacity: 1; transform: translateY(0); }
  80%  { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-.5rem); pointer-events: none; }
}
```

**Script block:**

```js
// Dismiss button
const dismissBtn = el.querySelector('.notification__dismiss');
if (dismissBtn) {
  dismissBtn.addEventListener('click', () => el.remove());
}

// Auto-dismiss: remove from DOM after animation ends
if (el.hasAttribute('autodismiss')) {
  const inner = el.querySelector('.notification');
  if (inner) {
    inner.addEventListener('animationend', (e) => {
      if (e.animationName === 'pk-notif-dismiss') el.remove();
    });
  }

  // Fallback for browsers without CSS animation support or interest invokers
  // The CSS :hover/:focus-within handles pause in all browsers
  // Interest invokers (:interest) adds keyboard-focus-proximity pause in Chrome 146+
}
```

**New prop:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `autodismiss` | boolean | absent | Enables auto-dismiss animation (5s default) |
| `--dismiss-duration` | CSS custom property | `5s` | Override dismiss timing |

---

## Feature Detection Strategy

**Decision: per-component `<script>` blocks** (not a shared module).

Rationale:
- Components are independently loadable — no import dependency on a shared util
- Detection logic is 1-3 lines per component — not worth abstracting
- Each component handles its own fallback inline

**Detection patterns used:**

| API | Detection | Used by |
|---|---|---|
| Popover API | `'popover' in HTMLElement.prototype` | dropdown |
| `<dialog>.showModal()` | `typeof HTMLDialogElement !== 'undefined'` | modal |
| Anchor Positioning | `@supports (anchor-name: --x)` (CSS-only) | tooltip, dropdown |
| Interest Invokers | `@supports selector(:interest)` (CSS-only) | notification |

Note: Tooltip and notification use **CSS-only** progressive enhancement (`@supports`). No JS feature detection needed for those.

---

## Data Model

No data model changes. Components are stateless UI elements. The reactive state proxy (`data-*` on `:root`) is unaffected.

---

## Integration Points

| System | Impact | Notes |
|---|---|---|
| `pseudo-kit-client.js` | **None** | Runtime unchanged. It stamps `<template>`, injects `<style>`, executes `<script>` — all of which still work |
| `pseudo-kit-server.js` (SSR) | **Minimal** | `<dialog>` renders as `<dialog class="modal">` (closed). `[popover]` renders as attribute. No server logic change |
| `CSSStyleSheet` (adopted styles) | **None** | `@scope` blocks still inserted via `insertRule`. `@supports` nesting works natively |
| Existing demos | **None initially** | Demos use host `[open]` attribute — scripts preserve backward compat |
| Canvas viewer | **None** | Viewer renders components as-is |

---

## Security Considerations

- `<dialog>` with `showModal()` creates a top-layer element — cannot be covered by other content (prevents clickjacking)
- Popover API uses browser-managed stacking — eliminates z-index race conditions
- No `eval()`, no dynamic script injection, no new attack surface
- Click-outside fallback for dropdown uses `document.addEventListener` — scoped, no global pollution

---

## Performance Considerations

- **`<dialog>.showModal()`** promotes element to top-layer — single compositor promotion, no reflow
- **Popover API** uses the same top-layer mechanism — no z-index recalculation
- **Anchor Positioning** computed by CSS engine in layout pass — replaces JS `getBoundingClientRect()` calls (which force layout thrashing)
- **CSS animations** for notification run on compositor thread — no main-thread blocking
- **Net JS reduction:** ~30 lines removed (manual toggle handlers), ~25 lines added (fallback + lifecycle), net -5 lines

---

## Testing Strategy

### Unit Tests (Vitest + happy-dom)

**Problem:** happy-dom does not implement `<dialog>`, Popover API, Anchor Positioning, or Interest Invokers.

**Solution:** Mock the minimum surface needed:

```js
// In test setup / beforeEach:

// 1. Mock <dialog> API
if (!globalThis.HTMLDialogElement) {
  class MockDialog extends HTMLElement {
    open = false;
    showModal() { this.open = true; this.setAttribute('open', ''); }
    close() { this.open = false; this.removeAttribute('open'); this.dispatchEvent(new Event('close')); }
  }
  globalThis.HTMLDialogElement = MockDialog;
  // Register <dialog> in happy-dom
}

// 2. Mock Popover API
HTMLElement.prototype.showPopover ??= function() { this.setAttribute('popover-open', ''); this.dispatchEvent(new ToggleEvent('toggle', { newState: 'open', oldState: 'closed' })); };
HTMLElement.prototype.hidePopover ??= function() { this.removeAttribute('popover-open'); this.dispatchEvent(new ToggleEvent('toggle', { newState: 'closed', oldState: 'open' })); };
```

**Test cases per component:**

| Component | Test | Assertion |
|---|---|---|
| modal | Resolves with `<dialog>` root | `querySelector('dialog.modal')` exists |
| modal | Opens via `showModal()` when host `[open]` set | `dialog.open === true` |
| modal | Closes on Escape / close button | `dialog.open === false`, host `[open]` removed |
| modal | Preserves slots (header, default, footer) | Slot content present in dialog |
| modal | Size variants apply | Container has correct `max-width` class/attribute |
| tooltip | Resolves unchanged | `querySelector('.tooltip')` exists |
| tooltip | `@supports` block present in CSS | Style text contains `anchor-name` |
| tooltip | Fallback positioning preserved | `.tooltip__content` has `position: absolute` |
| dropdown | Menu has `[popover]` attribute | `menu.hasAttribute('popover')` |
| dropdown | Unique ID generated | `menu.id` starts with `dd-` |
| dropdown | `aria-expanded` syncs with toggle event | Trigger attribute updates |
| dropdown | Fallback: manual toggle when popover unsupported | `[open]` toggles on click |
| notification | Resolves with role="alert" | Unchanged from current |
| notification | `[autodismiss]` triggers animation class | CSS contains `pk-notif-dismiss` |
| notification | Dismiss button removes element | `el.parentNode === null` after click |

### E2E Tests (Playwright)

Run in **Chromium 146+** for native API validation:

| Test | Browser | Validates |
|---|---|---|
| Modal opens/closes via `popovertarget` button | Chromium | Invoker Commands |
| Modal traps focus (Tab cycle) | Chromium | `<dialog>` focus management |
| Modal closes on Escape | Chromium | Native `<dialog>` behavior |
| Tooltip positions correctly at viewport edge | Chromium | Anchor Positioning + `position-try-fallbacks` |
| Dropdown opens/closes with light-dismiss | Chromium | Popover API |
| Dropdown closes on outside click | Chromium, Firefox | Popover + fallback |
| Notification auto-dismisses after 5s | Chromium | CSS animation |
| Notification pauses on hover | Chromium | `:interest` or `:hover` |

### Backward Compatibility Tests

Run in **Firefox / WebKit** (which may lack some APIs):

| Test | Validates |
|---|---|
| Modal opens/closes via fallback JS | `showModal()` polyfill path |
| Dropdown toggles via fallback click handler | Non-popover path |
| Tooltip positions correctly with absolute CSS | `@supports not` path |
| Notification auto-dismisses with CSS animation | Works without `:interest` |

---

## Migration Sequence (Implementation Order)

```
Step 1: Modal (highest impact, most structural change)
  └─ Validate <dialog> in tests + E2E before proceeding

Step 2: Dropdown (shares Invoker Commands pattern with modal)
  └─ Popover API adds light-dismiss for free

Step 3: Tooltip (CSS-only change, lowest risk)
  └─ Pure @supports progressive enhancement

Step 4: Notification (new feature: autodismiss)
  └─ Additive change, no breaking modifications

Step 5: Integration test pass
  └─ pnpm test (all 434+ tests)
  └─ Playwright E2E in Chromium + Firefox + WebKit
```

---

## Files Modified

```
src/pseudo-assets/components/molecules/
├── modal.html           # <dialog> + Invoker Commands + fallback script
├── tooltip.html         # @supports (anchor-name) progressive enhancement
├── dropdown.html        # popover + popovertarget + fallback script
└── notification.html    # autodismiss animation + :interest + dismiss script

tests/
├── molecules.client.test.js  # Update 4 component test blocks + add mocks
└── (new) migration-e2e.e2e.js  # E2E tests for native API behavior
```

**No changes to:**
- `src/client/pseudo-kit-client.js`
- `src/server/pseudo-kit-server.js`
- `src/shared/*.js`
- Other component files
- Demo apps (existing `[open]` attribute usage preserved)

---

## Open Technical Questions

- [ ] `<dialog>` + `popovertarget`: The Invoker Commands spec ties `popovertarget` to popover elements. For `<dialog>`, the equivalent is `commandfor` + `command="show-modal"` (Command Invokers). Verify which syntax is shipping in Chrome 146.
- [ ] Popover API `anchor` attribute vs CSS `anchor-name`: Should dropdown use the HTML `anchor` attribute (simpler) or CSS `anchor-name` (consistent with tooltip)?
- [ ] happy-dom `<dialog>` support: Check if happy-dom v16+ has native `<dialog>` — may eliminate the need for mocks.
- [ ] `ToggleEvent` constructor: Verify happy-dom supports `new ToggleEvent()` for popover toggle event simulation.

---

## Revision History

| Date | Author | Change |
|---|---|---|
| 2026-03-06 | PM Agent (BMAD) | Initial draft from PRD-phase1-migration |
