# Sprint 21 — API Lock + v1.0.0 Release

**Duration:** 2026-04-09 → 2026-04-22
**Capacity:** 12 story points

## Sprint Goal

Freeze the public API contract, write the v1.0.0 release notes, update the root README, regenerate all documentation artifacts, and tag v1.0.0 — completing the 21-sprint journey from scaffold to stable release.

> ⚠️ VSCode extension deliberately deferred — lowest backlog priority. Do NOT schedule.

## Stories

| ID | Epic | Title | Points | Priority | Assignee |
|---|---|---|---|---|---|
| S21-01 | Release | API lock document — freeze all public contracts, write breaking-change policy | 3 | Must | architect |
| S21-02 | Release | Update root README to v1.0.0 standard (user + API + dev sections) | 3 | Must | developer |
| S21-03 | Release | v1.0.0 release notes + final changelog | 3 | Must | developer |
| S21-04 | Release | Final verification — run all test suites, regenerate context + docs, tag v1.0.0 | 3 | Must | developer |

**Total:** 12 points

## Dependencies
- S21-01: independent
- S21-02: independent (reads prd-v1.0.0.md, existing README)
- S21-03: depends on S21-01 (API lock content) and S21-02 (README done)
- S21-04: depends on all — final gate

## Definition of Done (sprint-level)
- [x] S21-01: `bmad/artifacts/api-lock-v1.0.0.md` — all 61 component prop/slot contracts frozen; breaking-change policy documented
- [x] S21-02: `README.md` updated — v1.0.0 badges, 61-component count, full test suite table, new scripts
- [x] S21-03: `bmad/artifacts/release-notes-v1.0.0.md` + `CHANGELOG-v1.0.0.md` written
- [x] S21-04: 345 vitest + bundle checks ✅; `pseudo-kit-context.json` (v1.0.0) regenerated; `docs/index.html` regenerated; `package.json` = v1.0.0
- [x] VSCode extension: NOT included — deferred (as intended)

*Created by bmad-master: 2026-03-11.*
