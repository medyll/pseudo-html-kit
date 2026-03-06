# Sprint 10 Developer Guide — Form Controls & Layout (v0.4.0-beta)

**Sprint Duration:** 2026-03-13 → 2026-03-27 (2 weeks)  
**Scope:** 17 pts / 4 stories  
**Status:** Ready for development start

---

## 🚀 Quick Start

### Before You Begin
1. Read this file (you're here ✓)
2. Review `bmad/artifacts/sprints/sprint-10.md` (full sprint plan)
3. Check `bmad/artifacts/stories/S10-*.md` (each story file)

### For S10-01 (Input Validation)
- Start with: `S10-01-MIGRATION-GUIDE.md` (complete template)
- Run tests: `npm run test:client` (scaffold in `tests/s10-01-input-validation.test.js`)
- Reference: `bmad/artifacts/stories/S10-01.md` (acceptance criteria)

---

## 📋 Stories Overview

### S10-01: Input Validation (5 pts) — **IN PROGRESS**
**Migration:** Custom JS validation → HTML5 constraint validation API + Popover API

**What's ready:**
- ✅ `S10-01-MIGRATION-GUIDE.md` — Complete HTML template with all patterns
- ✅ `tests/s10-01-input-validation.test.js` — 40+ test cases (vitest scaffold)
- ✅ `bmad/artifacts/stories/S10-01.md` — Full story spec

**Your task:**
1. Open `S10-01-MIGRATION-GUIDE.md`
2. Copy the template into `src/pseudo-assets/components/atoms/input-pk.html`
3. Run `npm run test:client` — tests should mostly pass
4. Debug any failures
5. Commit: `feat(S10-01): Input validation with HTML5 constraint API`

**Browser support:** Chrome 118+, Firefox 128+, Safari 17.4+

---

### S10-03: Checkbox/Radio (3 pts) — PENDING
**Migration:** Custom JS toggle → CSS `:checked` + `:invalid` pseudo-classes

**What's ready:**
- ✅ `bmad/artifacts/stories/S10-03.md` — Full story spec + acceptance criteria
- ⏳ No template yet (you'll create it from scratch)

**Your task:**
1. Read `S10-03.md` acceptance criteria
2. Update `checkbox-pk.html` and `radio-pk.html`
3. Remove JS attribute watchers
4. Add CSS `:checked`, `:invalid`, `:user-invalid` selectors
5. Write unit tests (vitest)
6. Commit: `feat(S10-03): Checkbox/Radio with CSS pseudo-classes`

**Key pattern:** No JS needed for visual state — CSS handles it.

---

### S10-05: Grid Lanes (5 pts) — PENDING
**Migration:** Flexbox grid → CSS Grid Lanes + Container Queries

**What's ready:**
- ✅ `bmad/artifacts/stories/S10-05.md` — Full story spec + technical notes
- ⏳ No template yet

**Your task:**
1. Read `S10-05.md` technical notes
2. Create `src/pseudo-assets/components/molecules/grid-pk.html`
3. Implement CSS Grid Lanes: `display: grid-lanes;`
4. Add Container Queries: `@container (min-width: ...) { }`
5. Fallback CSS for Firefox/Safari: `@supports not (display: grid-lanes) { display: flex; }`
6. Write unit tests (vitest)
7. Commit: `feat(S10-05): Grid Lanes with Container Queries`

**Browser support:** Chrome 146+ (native), Firefox/Safari (flexbox fallback)

---

### S10-07: E2E + Unit Tests (4 pts) — PENDING
**Task:** Comprehensive test coverage for S10-01, S10-03, S10-05

**What's ready:**
- ✅ `bmad/artifacts/stories/S10-07.md` — Full test plan + test structure
- ⏳ Playwright fixture needs creation

**Your task:**
1. Create `tests/fixtures/form-layout-test-page.html`
2. Create `tests/migration-e2e-forms.e2e.js` (Playwright)
3. Add browser-conditional test guards (Chromium vs Firefox/Safari)
4. Target: 12+ E2E tests + 15+ unit tests
5. Run: `npm run test:all` — all 65+ tests pass
6. Verify: `npm run test:coverage` — maintain 100%
7. Commit: `test(S10-07): E2E + unit tests for form/layout migrations`

---

## 🔧 Development Workflow

### Daily Standup Checklist
- [ ] Which story are you working on?
- [ ] What's the blocker (if any)?
- [ ] When do you expect it done?

### Before You Commit
```bash
# 1. Run all tests
npm run test:all

# 2. Check coverage (must be 100%)
npm run test:coverage

# 3. Run linter
npm run lint

# 4. Check for console errors
npm run test:client 2>&1 | grep -i error
```

### Commit Message Template
```
feat(S10-XX): Component migration summary

- Bullet 1: What changed
- Bullet 2: Browser support
- Bullet 3: Test coverage

Co-authored-by: [Your Name] <email>
```

---

## 🧪 Testing Strategy

### Unit Tests (vitest + happy-dom)
- File: `tests/s10-XX-*.test.js`
- Coverage: 100% on `src/client/**`
- Mock Popover API, Container Queries (happy-dom limitations)
- Run: `npm run test:client`

### E2E Tests (Playwright)
- File: `tests/migration-e2e-forms.e2e.js`
- Projects: Chromium, Firefox, WebKit
- Guards: `test.skip(browserName === 'chromium', ...)` for fallback-only tests
- Run: `npx playwright test tests/migration-e2e-forms.e2e.js`

### Full Test Suite
```bash
npm run test:all  # Runs all tests (unit + E2E)
```

---

## 📚 Reference Files

### Story Specifications
- `bmad/artifacts/stories/S10-01.md` — Input validation spec
- `bmad/artifacts/stories/S10-03.md` — Checkbox/Radio spec
- `bmad/artifacts/stories/S10-05.md` — Grid Lanes spec
- `bmad/artifacts/stories/S10-07.md` — Testing spec

### Implementation Guides
- `S10-01-MIGRATION-GUIDE.md` — Complete HTML template (use this!)
- `tests/s10-01-input-validation.test.js` — Test scaffold

### Project Documentation
- `bmad/status.yaml` — Current project phase
- `bmad/dashboard.md` — Interactive dashboard
- `CHANGELOG-v0.4.0-alpha.md` — Previous release notes

### Technical References
- `bmad/artifacts/prd-phase1-migration.md` — PRD for API migrations
- `bmad/artifacts/tech-spec-phase1-migration.md` — Technical design
- `src/client/pseudo-kit-client.js` — Runtime library (read if questions)

---

## ✅ Definition of Done (Story-Level)

### S10-01 Done When:
- [ ] HTML5 constraint validation working (required, pattern, min, max)
- [ ] Popover API error hints showing
- [ ] Fallback error span for older browsers
- [ ] :invalid, :valid, :user-invalid CSS working
- [ ] Unit tests passing (8 tests)
- [ ] No console errors
- [ ] aria-describedby linking error to input

### S10-03 Done When:
- [ ] :checked pseudo-class applies on checkbox/radio click
- [ ] :invalid for required unchecked
- [ ] Indeterminate state working
- [ ] Unit tests passing (6 tests)
- [ ] No JS attribute watchers
- [ ] Accessibility maintained

### S10-05 Done When:
- [ ] CSS Grid Lanes rendering (Chrome 146+)
- [ ] Container Queries working
- [ ] Fallback to flexbox (Firefox/Safari)
- [ ] Unit tests passing (8 tests)
- [ ] No layout jank
- [ ] Custom properties responding to container size

### S10-07 Done When:
- [ ] E2E tests passing (12+)
- [ ] Unit tests passing (65+)
- [ ] Coverage 100% on src/client/**
- [ ] All 3 browsers passing
- [ ] No a11y regressions
- [ ] CHANGELOG-v0.4.0-beta.md drafted

---

## 🆘 Troubleshooting

### Tests fail with "Popover is not defined"
- **Fix:** Use mock in vitest setup (see S10-01-MIGRATION-GUIDE.md section)

### Container Queries don't work in Firefox
- **Expected:** They're Chrome-only (146+). Fallback flexbox should kick in.
- **Verify:** Check `@supports not (container-type: inline-size)` CSS applies

### Grid Lanes layout is broken in Safari
- **Expected:** Grid Lanes not in Safari 18 yet. Flexbox fallback should render.
- **Verify:** Check `@supports not (display: grid-lanes)` flexbox renders correctly

### E2E tests hang on Playwright
- **Fix:** Check if `tests/fixtures/migration-test-page.html` is being served
- **Fix:** Ensure `npx serve . -p 3000` is running in separate terminal

---

## 📞 Questions?

Refer to:
1. `bmad/artifacts/sprints/sprint-10.md` — Sprint overview + risks
2. `bmad/artifacts/stories/S10-XX.md` — Specific story details
3. `S10-01-MIGRATION-GUIDE.md` — Implementation patterns
4. `bmad/dashboard.md` — Project status + next steps

---

## 🎯 Success Criteria (Sprint-Level)

✅ **Your sprint is done when:**
- All 4 stories marked `done` in `bmad/status.yaml`
- `npm run test:all` passes (65+ tests)
- `npm run test:coverage` shows 100%
- No critical/serious A11y violations (axe-core)
- CHANGELOG-v0.4.0-beta.md drafted
- 4 git commits (one per story)

**Estimated:** 8 dev-days (achievable in 2 weeks with focused work)

---

**Good luck! See you on the other side. 🚀**

Generated: 2026-03-06  
Status: Sprint 10 ready for development
