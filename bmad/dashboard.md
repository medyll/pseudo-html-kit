# 📋 BMAD Dashboard — pseudo-html-kit

> **Sync:** 2026-03-03 | **Phase:** Implementation (Sprint 08 complete) | **Progress:** 100% — v0.3.0 ready | **Team:** 3 devs | **Timeline:** 8 sprints × 1 semaine

---

## 🚀 Release Status

| Component | Status | Link |
|:---|:---:|:---|
| **pseudo-kit** | ✅ Published v0.2.0 | [npm](https://www.npmjs.com/package/pseudo-kit) |
| **pseudo-canvas** | ✅ v0.2.0 | Part of monorepo |
| **pseudo-stack-assets** | ✅ v0.2.0 | Part of monorepo |
| **pseudo-kit-react** | 🆕 v0.1.0 scaffold | `src/pseudo-kit-react/` |
| **README** | ✅ Consumer-focused | Enhanced with Installation, Development, Release sections |

**v0.3.0 ready for release** — Sprint 08 complete (all 9 stories done).

---

## 🏗️ Workflow Status

| Phase | Status | Artifact |
|:------|:------:|:---------|
| **1 – Analysis** | ✅ Done | [product-brief.md](artifacts/product-brief.md) |
| **2 – Planning** | ✅ Done | [prd.md](artifacts/prd.md) · [tech-spec.md](artifacts/tech-spec.md) |
| **3 – Solutioning** | ✅ Done | [architecture.md](artifacts/architecture.md) |
| **4 – Implementation** | ✅ Done | [sprints/](artifacts/sprints/) |

---

## 🏃 Sprint Roadmap (8 semaines)

| Sprint | Semaine | Thème | Pts | Epic | Status |
|:-------|:-------:|:------|:---:|:-----|:------:|
| [Sprint 1](artifacts/sprints/sprint-01.md) | W1 | Foundation & Atoms | 25 | PKA-001 + PKA-002 | ✅ |
| [Sprint 2](artifacts/sprints/sprint-02.md) | W2 | Molecules | 21 | PKA-002 | ✅ |
| [Sprint 3](artifacts/sprints/sprint-03.md) | W3 | Organisms | 28 | PKA-002 | ✅ |
| [Sprint 4](artifacts/sprints/sprint-04.md) | W4 | Frames (20 squelettes vides) | 29 | PKA-003 | ✅ |
| [Sprint 5](artifacts/sprints/sprint-05.md) | W5 | pseudo-canvas-viewer | 28 | PKA-004 | ✅ |
| [Sprint 6](artifacts/sprints/sprint-06.md) | W6 | Demos Netflix & Amazon | 22 | PKA-005/006 | ✅ |
| [Sprint 7](artifacts/sprints/sprint-07.md) | W7 | Demo Facebook + SSR + Publish | 22 | PKA-007 + core | ✅ |
| [Sprint 8](artifacts/sprints/sprint-08.md) | W8 | Quality, DX & Framework Reach | 45 | v0.3.0 | ✅ |

**Total : 220 pts · 8 semaines · 3 devs — Sprint 08 complete ✅**

---

## 🎯 Backlog

| ID | Feature | Sprint | Status |
|:---|:--------|:------:|:------:|
| PKA-001 | `pseudo-kit-assets` scaffold + barrel | S1 | ✅ |
| PKA-002 | 46 composants (17 atoms + 16 molecules + 13 organisms) | S1→S3 | ✅ |
| PKA-003 | 20 frames squelettes vides | S4 | ✅ |
| PKA-004 | `pseudo-canvas-viewer.html` (Figma-style) | S5 | ✅ |
| PKA-005 | Netflix demo app | S6 | ✅ |
| PKA-006 | Amazon demo app | S6 | ✅ |
| PKA-007 | Facebook demo app | S7 | ✅ |

---

## 🏛️ Architecture (locked)

```
pseudo-kit-assets/ (npm package)
├── components/atoms/      (17) — @scope, mobile-first, named+default slots
├── components/molecules/  (16) — idem
├── components/organisms/  (13) — idem
├── frames/                (20) — squelettes vides, named slots uniquement
├── index.js               — components + frames (URLs) + componentsMeta + framesMeta
├── demos/
│   ├── netflix/   tokens.css + index.html
│   ├── amazon/    tokens.css + index.html
│   └── facebook/  tokens.css + index.html
└── viewer/
    └── pseudo-canvas-viewer.html  — drag-and-drop + ?canvas= + ?assets=auto

pseudo-kit-react/ (new — v0.1.0)
├── src/index.js           — useComponent() + usePseudoKit() hooks
├── demo/index.html        — browser demo (React 18 CDN)
└── README.md
```

**Peer dep:** `pseudo-html-kit` | **Browser min:** Chrome 118 / FF 128 / Safari 17.4

---

## ✅ Sprint 08 — All Stories Complete

| Story | Epic | Points | Status |
|:------|:-----|:------:|:------:|
| [S8-01](artifacts/stories/S8-01.md) | A – Unit Tests — Atoms (17) | 8 | ✅ |
| [S8-02](artifacts/stories/S8-02.md) | A – Unit Tests — Molecules (16) | 7 | ✅ |
| [S8-03](artifacts/stories/S8-03.md) | A – Unit Tests — Organisms (13) | 6 | ✅ |
| [S8-04](artifacts/stories/S8-04.md) | B – A11y audit (axe-core) | 5 | ✅ |
| [S8-05](artifacts/stories/S8-05.md) | B – A11y fixes (Critical + Serious) | 5 | ✅ |
| [S8-06](artifacts/stories/S8-06.md) | C – JSDoc — Atoms + Molecules | 4 | ✅ |
| [S8-07](artifacts/stories/S8-07.md) | C – JSDoc — Organisms + Frames | 3 | ✅ |
| [S8-08](artifacts/stories/S8-08.md) | D – pseudo-kit-react scaffold | 3 | ✅ |
| [S8-09](artifacts/stories/S8-09.md) | D – `useComponent` hook | 4 | ✅ |

**45 / 45 points delivered. Sprint 08 Definition of Done met.**

---

## 🧪 QA

| Metric | Value |
|:-------|:------|
| Test plan | ✅ Done |
| Last run | 2026-03-03 |
| Coverage | 434 tests — 208 node:test + 51 vitest + 63 vitest (atoms) + 53 vitest (molecules) + 39 vitest (organisms) + 20 vitest (viewer) + 12 Playwright E2E |
| A11y | 0 Critical / 0 Serious (axe-core via Playwright) |
| Open bugs | 0 |

### 🐛 Bugs

| ID | Title | Status |
|:---|:------|:------:|
| HAPPY-DOM-01 | happy-dom nests script/style inside template content for self-closing tags | ✅ Fixed |

---

## 👉 Next Step

Sprint 08 complete. v0.3.0 ready.

**Suggested:** `/doc` — CHANGELOG update + v0.3.0 release notes, then publish CI.

---

## 🛠️ Actions

- `/next` — Orchestrator chains next step
- `/update-dashboard` — Refresh dashboard
- `/doc` — Generate CHANGELOG + release notes for v0.3.0
