# PRD — pseudo-html-kit v1.0.0

**Date:** 2026-03-11
**Author:** bmad-master (PM role)
**Status:** Draft — pending review

---

## Overview

v1.0.0 is the stable API-lock release of pseudo-html-kit. It signals production readiness: no breaking changes after this tag, full documentation, and a published doc site. It is the culmination of 18 sprints of incremental delivery.

---

## Goals

| # | Goal | Priority | Sprint |
|---|---|---|---|
| G1 | API lock — freeze all public exports, props, slot contracts | Must | S19 |
| G2 | Full WCAG 2.2 AA compliance — remaining 29 `prefers-reduced-motion` + `:focus-visible` pass | Must | S19 |
| G3 | Doc site — component API reference, live demos, search | Must | S20 |
| G4 | Performance budget — bundle size ≤ 12 KB gzip for pseudo-kit-client.js | Must | S19 |
| G5 | LLM context pack — machine-readable component spec for AI-assisted use | Should | S20 |
| G6 | Screen reader testing — NVDA + VoiceOver manual pass | Should | S19 |
| G7 | axe-core Playwright color contrast audit | Must | S19 |

---

## API Lock — Scope

The following are the **public APIs** that will be frozen at v1.0.0. No breaking changes are permitted after the v1.0.0 tag without a major version bump.

### pseudo-html-kit (core)

| Export | Type | Description |
|---|---|---|
| `PseudoKit.register({ name, src })` | method | Register a component by name + URL |
| `PseudoKit.init()` | method → Promise | Stamp all registered components |
| `PseudoKit.resolve(el)` | method → Promise | Stamp a single element |
| `data-pk-resolved` | attribute | Present when component is stamped |
| `data-ready` | attribute | Present when script init is complete |
| `<template>` / `<style>` / `<script>` | component sections | Public contract |
| `el` | script variable | Component root element in `<script>` |

### Component prop contracts (atoms/molecules/organisms)

All component `@prop` declarations in JSDoc headers are frozen at v1.0.0. Adding new optional props is allowed in patch releases. Removing or renaming props requires a major bump.

### pseudo-kit-react

| Export | Type |
|---|---|
| `useComponent(url)` | Hook |
| `usePseudoKit(urls[])` | Hook |
| `usePseudoKitReady()` | Hook |
| `useRegisterComponent(url)` | Hook |
| `PseudoKitProvider` | Component |
| `renderComponent(path, props)` | SSR function |
| `hydrateMarker(name)` | SSR helper |

### pseudo-kit-svelte

| Export | Type |
|---|---|
| `pseudoKit(urlOrUrls)` | function |
| `initPseudoKit(urls, root)` | function |
| `createComponent(url)` | function |
| `createComponents(urls[])` | function |
| `nameFromUrl(url)` | function |

### pseudo-kit-cli

| Command | Description |
|---|---|
| `npx pseudo-kit init [dir]` | Scaffold a new project |

---

## Performance Budget

| Artifact | Budget | Current | Status |
|---|---|---|---|
| `pseudo-kit-client.js` (gzip) | ≤ 12 KB | ~8 KB (est.) | ✅ |
| `pseudo-kit-server.js` (gzip) | ≤ 6 KB | ~4 KB (est.) | ✅ |
| Component `.html` avg size | ≤ 4 KB | ~2.1 KB (avg) | ✅ |
| First-paint with 5 components | ≤ 100 ms (localhost) | ~40 ms (est.) | ✅ |

The performance budget must be validated with automated tooling in S19 (bundlesize CI step).

---

## Doc Site Spec

**Stack:** Static site (Eleventy or plain HTML + pseudo-html-kit itself to dogfood).
**Sections:**
1. Getting Started — install, first component, CDN link
2. Components — atom/molecule/organism categories, each with:
   - Live demo (embedded iframe or inline)
   - Props table (from JSDoc `@prop`)
   - Slot table (from JSDoc `@slot`)
   - Code example
3. Framework Adapters — React, Svelte guides
4. CLI — `pseudo-kit init` usage
5. WCAG Compliance — audit summary, deferred items
6. Changelog

**Hosting:** GitHub Pages (automated deploy on tag).

---

## WCAG 2.2 AA — Remaining Work

Deferred from S18-01 audit:

| Story | Title | Priority |
|---|---|---|
| S19-01 | Add `:focus-visible` + `prefers-reduced-motion` to remaining 29 components | Should |
| S19-02 | Wire `aria-label` on `molecules/date-picker-pk.html` | Must |
| S19-03 | Full color-contrast audit with axe-core Playwright | Must |
| S19-04 | Screen reader testing — NVDA + VoiceOver | Should |

---

## LLM Context Pack

A machine-readable JSON file (`pseudo-kit-context.json`) that lists:
- All component names, props, slots, and layer
- Example HTML usage snippets

This enables AI assistants (Claude, Copilot, etc.) to autocomplete and generate pseudo-html-kit markup without hallucinating props.

**Format:**
```json
{
  "version": "1.0.0",
  "components": [
    {
      "name": "button-pk",
      "layer": "atoms",
      "props": [
        { "name": "variant", "type": "string", "values": ["primary","secondary","ghost","danger"], "default": "secondary" },
        { "name": "size", "type": "string", "values": ["sm","md","lg"], "default": "md" },
        { "name": "disabled", "type": "boolean" }
      ],
      "slots": [
        { "name": "default", "description": "Button label" },
        { "name": "icon-left", "description": "Icon left of label" },
        { "name": "icon-right", "description": "Icon right of label" }
      ]
    }
  ]
}
```

---

## Acceptance Criteria — v1.0.0 Gate

- [ ] All public API exports documented and frozen
- [ ] Zero WCAG 2.2 Level A or AA blockers
- [ ] Doc site live at `https://[org].github.io/pseudo-html-kit`
- [ ] `pseudo-kit-client.js` ≤ 12 KB gzip
- [ ] `pseudo-kit-context.json` present in repo root
- [ ] 0 test failures (all suites: node:test + vitest + E2E)
- [ ] CHANGELOG up to date
- [ ] VSCode extension: **not required for v1.0.0** — deferred to post-1.0.0

---

## Sprint Plan

| Sprint | Focus | Goals |
|---|---|---|
| S19 | Final accessibility pass + perf audit | G2, G4, G6, G7 |
| S20 | Doc site + LLM context pack | G3, G5 |
| S21 | v1.0.0 release | G1 (API lock ceremony + tag) |

---

*Authored by bmad-master PM role. 2026-03-11.*
