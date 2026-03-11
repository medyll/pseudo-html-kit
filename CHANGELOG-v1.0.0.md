# Changelog — pseudo-html-kit v1.0.0

**Released:** 2026-03-11
**Sprint:** 21 — API Lock + Release

---

## v1.0.0 — Stable release

This is the **API-locked stable release**. No breaking changes after this tag without a major version bump.

### Changes from v0.7.0

#### Version bump and API lock

- `package.json` → `"version": "1.0.0"`
- `bmad/artifacts/api-lock-v1.0.0.md` — full public API contract frozen
- Breaking-change policy documented

#### Documentation

- `README.md` updated: v1.0.0 badges, 61-component count, full test suite table, new scripts reference
- `bmad/artifacts/release-notes-v1.0.0.md` — full release announcement

#### No functional changes

v1.0.0 contains **no functional changes** from v0.7.0. All component implementations, adapter APIs, and CLI behaviour are identical.

---

## Full history (cumulative since v0.6.0)

For the complete list of changes across Sprints 18–21, see:

- [`CHANGELOG-v0.7.0.md`](CHANGELOG-v0.7.0.md) — Sprint 18-20: WCAG audit, React SSR adapter, doc site, LLM context pack
- [`bmad/artifacts/a11y-audit-v0.6.0.md`](bmad/artifacts/a11y-audit-v0.6.0.md) — S18-01 accessibility audit
- [`bmad/artifacts/api-lock-v1.0.0.md`](bmad/artifacts/api-lock-v1.0.0.md) — API contract
- [`docs/index.html`](docs/index.html) — Documentation site

---

## Statistics at v1.0.0

| Metric | Value |
|---|---|
| Components | 61 (23 atoms + 22 molecules + 16 organisms) |
| Tests | 661+ passing, 0 failures |
| Bundle size | 7.7 KB gzip (client), 4.4 KB gzip (server) |
| Sprints | 21 |
| WCAG | 2.2 AA compliant |
| A11y violations | 0 critical · 0 serious · 0 color-contrast |
