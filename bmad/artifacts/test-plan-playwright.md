# Playwright E2E Test Plan — pseudo-canvas-viewer

**Version:** 0.2.0  
**Date:** 2026-03-02  
**Status:** Ready for execution

---

## Overview

Comprehensive E2E test suite for the pseudo-canvas-viewer using **Playwright**. Tests real browser interactions, HTTP asset loading, and user workflows across Chrome, Firefox, and Safari.

### Why Playwright?

- ✅ Real browser rendering (not mocked)
- ✅ HTTP server integration (tests actual asset loading)
- ✅ Multi-browser coverage (Chromium, Firefox, WebKit)
- ✅ Visual regression detection
- ✅ Accessibility testing (keyboard navigation, ARIA)
- ✅ Network interception (error simulation)
- ✅ Responsive design testing

---

## Test Cases (12 E2E tests)

### T1: Page Loads & UI is Visible
- **Goal:** Verify viewer initializes and all major UI components are rendered
- **Steps:**
  1. Navigate to `/viewer/pseudo-canvas-viewer.html`
  2. Wait for `#btn-auto` element
  3. Assert title contains "pseudo-canvas-viewer"
  4. Assert key elements visible: titlebar, tree, preview
- **Pass Criteria:** All elements visible, no console errors

### T2: Load Assets via HTTP (Real Fetch)
- **Goal:** Test realistic asset loading with network request
- **Steps:**
  1. Click "Reload assets" button
  2. Monitor network requests (should fetch `/index.js`)
  3. Assert button shows loading state
  4. Wait for assets to load
  5. Assert button returns to normal text
- **Pass Criteria:** Button state transitions correct, no MIME type errors

### T3: Toast Notifications on Success
- **Goal:** Verify success feedback when assets load
- **Steps:**
  1. Click reload button
  2. Wait for toast message
  3. Assert toast contains "✅" + asset count
- **Pass Criteria:** Toast displays with correct count

### T4: Component Tree Navigation
- **Goal:** Test tree item selection and interaction
- **Steps:**
  1. Load assets
  2. Wait for tree items to appear
  3. Click first tree item
  4. Assert item marked as selected
- **Pass Criteria:** Item has `aria-selected="true"`

### T5: Preview Panel Updates
- **Goal:** Verify preview updates when selecting components
- **Steps:**
  1. Load assets
  2. Click a tree item
  3. Assert preview content updates to match selected item
- **Pass Criteria:** Preview text matches selected component name

### T6: Canvas Loading via Query Parameter
- **Goal:** Test loading custom canvas files
- **Steps:**
  1. Navigate with `?canvas=../pseudo-canvas-demo.html`
  2. Wait for toast
  3. Assert canvas loaded message
  4. Verify preview shows content
- **Pass Criteria:** Canvas loads without errors

### T7: Auto-Load Assets via ?assets=auto
- **Goal:** Test auto-load on page init
- **Steps:**
  1. Navigate with `?assets=auto`
  2. Don't click button
  3. Wait for assets to load automatically
  4. Assert toast and populated tree
- **Pass Criteria:** Assets auto-loaded without user interaction

### T8: Error Handling — Network Errors
- **Goal:** Graceful error display on network failures
- **Steps:**
  1. Block `/index.js` fetch (Playwright route intercept)
  2. Click reload button
  3. Assert error toast displayed
  4. Assert button recovers to normal state
- **Pass Criteria:** Error toast + button recovery

### T9: Responsive Layout (Mobile)
- **Goal:** Verify viewer works on mobile viewport
- **Steps:**
  1. Set viewport to 375×667 (iPhone SE)
  2. Load assets
  3. Assert key UI elements visible and functional
- **Pass Criteria:** No layout breaks, all buttons accessible

### T10: State Persistence Across Reload
- **Goal:** Test localStorage state preservation
- **Steps:**
  1. Load assets and select a component
  2. Reload page
  3. Assert same component still selected (if implemented)
- **Pass Criteria:** State restored (or gracefully degrades)

### T11: No JavaScript Errors
- **Goal:** Ensure no uncaught console errors
- **Steps:**
  1. Capture all console messages and page errors
  2. Load assets, navigate tree, select items
  3. Assert no error messages (except expected network ones)
- **Pass Criteria:** Zero uncaught errors

### T12: Keyboard Navigation & Accessibility
- **Goal:** Test keyboard-only navigation
- **Steps:**
  1. Tab to reload button
  2. Press Enter to trigger load
  3. Assert assets load via keyboard
- **Pass Criteria:** Fully operable via keyboard

---

## Test Configuration

### Browsers Tested
- **Chromium** (desktop)
- **Firefox** (desktop)
- **WebKit** (Safari)

### Environment
- **Base URL:** `http://localhost:3000`
- **Web Server:** Auto-started (`npx serve src/pseudo-canvas/ -p 3000`)
- **Parallelization:** Yes (4 workers default, 1 in CI)
- **Retries:** 0 local, 2 in CI
- **Timeout per test:** 30s default

### Artifacts
- **Screenshots:** On failure (saved to `test-results/`)
- **Videos:** Configurable per test
- **Trace:** On first retry (for debugging)
- **HTML Report:** Generated after run

---

## Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive, watch mode)
npm run test:e2e:ui

# Debug single test (opens inspector)
npm run test:e2e:debug

# Run all tests (unit + client + E2E)
npm run test:all

# Run specific test file
npx playwright test tests/pseudo-canvas-viewer.e2e.js

# Run specific test by name
npx playwright test -g "E2E-T2"

# Generate HTML report after run
npx playwright show-report
```

---

## Expected Results

**Test Coverage:** 12 E2E scenarios  
**Browser Coverage:** 3 browsers (Chromium, Firefox, WebKit)  
**Total Runs:** 36 test instances (12 × 3 browsers)

**Success Criteria:**
- ✅ All 36 instances pass
- ✅ No console errors (except expected network ones)
- ✅ < 1% flakiness
- ✅ Average duration < 45s per test file

---

## CI Integration

Add to GitHub Actions workflow:

```yaml
- name: Run E2E tests
  run: npm run test:e2e
  
- name: Upload test results
  uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 7
```

---

## Known Limitations & Future Enhancements

| Item | Status | Notes |
|---|---|---|
| Drag-and-drop testing | ⏳ Pending | Requires advanced Playwright interaction APIs |
| Visual regression | ⏳ Pending | Can add Percy or Argos snapshot testing |
| Performance metrics | ⏳ Pending | Can measure asset load times, render times |
| Accessibility audit | ⏳ Pending | Can integrate axe-core for a11y checks |

---

## Next Steps

1. ✅ Create `playwright.config.js`
2. ✅ Create `tests/pseudo-canvas-viewer.e2e.js` (12 tests)
3. ⏳ Update `package.json` with E2E commands
4. ⏳ Run initial test suite: `npm run test:e2e`
5. ⏳ Fix any failures and iterate
6. ⏳ Integrate into CI pipeline
7. ⏳ Generate HTML report: `npx playwright show-report`

---

## Test Execution Example

```
npx playwright test --config playwright.config.js

Running 36 tests using 4 workers
[chromium] E2E-T1: page loads... ✓
[chromium] E2E-T2: load assets... ✓
[chromium] E2E-T3: toast notifications... ✓
...
[webkit] E2E-T12: keyboard navigation... ✓

✓ 36 passed (2m 15s)
To show HTML report, run: npx playwright show-report
```

---

## Maintenance

- **Review** test cases quarterly for flakiness
- **Update** selectors if viewer HTML structure changes
- **Add** new tests when new viewer features are added
- **Monitor** CI times and optimize slow tests
- **Archive** test results for trend analysis
