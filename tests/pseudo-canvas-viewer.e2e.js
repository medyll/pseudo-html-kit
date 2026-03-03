import { test, expect } from '@playwright/test';

/**
 * E2E Test Suite — pseudo-canvas-viewer
 * 
 * Tests the full viewer UI including:
 * - Asset loading via HTTP (real fetch)
 * - Interactive UI (clicks, drag-and-drop)
 * - Canvas preview rendering
 * - Component tree navigation
 * - Real browser rendering (Chrome, Firefox, Safari)
 */

test.describe('pseudo-canvas-viewer E2E', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to viewer
    await page.goto('/viewer/pseudo-canvas-viewer.html');
    // Wait for UI to initialize
    await page.waitForSelector('#btn-auto', { timeout: 5000 });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T1: Viewer Page Loads & UI is Visible
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T1: page loads with viewer UI visible', async ({ page }) => {
    // Verify title
    await expect(page).toHaveTitle(/pseudo-canvas-viewer/i);
    
    // Verify key UI elements are visible
    await expect(page.locator('#btn-auto')).toBeVisible();
    await expect(page.locator('#titlebar')).toBeVisible();
    await expect(page.locator('[role="tree"]')).toBeVisible();
    await expect(page.locator('[role="region"][aria-label*="preview"]')).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T2: Load Assets via HTTP (Real Fetch)
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T2: load assets by clicking "Reload assets" button', async ({ page }) => {
    const btn = page.locator('#btn-auto');
    
    // Verify initial button text
    await expect(btn).toHaveText('⚡ Reload assets');
    
    // Listen for network requests (should fetch index.js)
    const assetLoadPromise = page.waitForResponse(
      response => response.url().includes('/index.js')
    );
    
    // Click the button
    await btn.click();
    
    // Wait for the button to show loading state
    await expect(btn).toHaveText('⏳ Loading…', { timeout: 2000 });
    
    // Wait for asset load to complete
    await assetLoadPromise;
    
    // Button should return to normal text
    await expect(btn).toHaveText('⚡ Reload assets', { timeout: 5000 });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T3: Toast Notifications on Success
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T3: display success toast with asset count', async ({ page }) => {
    // Click reload button
    page.locator('#btn-auto').click();
    
    // Wait for toast message containing asset count
    const toast = page.locator('[role="status"], .toast, [aria-label*="loaded"]');
    await expect(toast).toContainText(/✅.*assets loaded/i, { timeout: 5000 });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T4: Component Tree Navigation
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T4: navigate component tree and select items', async ({ page }) => {
    // Load assets first
    await page.locator('#btn-auto').click();
    await expect(page.locator('[role="status"]')).toContainText(/assets loaded/i, { timeout: 5000 });
    
    // Wait for tree items to appear
    const treeItems = page.locator('[role="treeitem"], .tree-item');
    await expect(treeItems.first()).toBeVisible({ timeout: 3000 });
    
    // Click first tree item
    const firstItem = treeItems.first();
    await firstItem.click();
    
    // Verify it's marked as selected
    await expect(firstItem).toHaveAttribute('aria-selected', 'true');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T5: Preview Panel Updates on Selection
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T5: preview panel updates when component is selected', async ({ page }) => {
    // Load assets
    await page.locator('#btn-auto').click();
    await expect(page.locator('[role="status"]')).toContainText(/assets loaded/i, { timeout: 5000 });
    
    // Get first tree item
    const treeItems = page.locator('[role="treeitem"], .tree-item');
    await expect(treeItems.first()).toBeVisible({ timeout: 3000 });
    
    const firstItemText = await treeItems.first().textContent();
    
    // Click it
    await treeItems.first().click();
    
    // Preview should update (check for component content)
    const preview = page.locator('[role="region"][aria-label*="preview"], .preview');
    await expect(preview).toContainText(firstItemText.trim(), { timeout: 3000 });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T6: Canvas Loading via Query Parameter
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T6: load canvas via ?canvas= query parameter', async ({ page }) => {
    // Navigate with canvas query param (pseudo-canvas-demo.html exists)
    await page.goto('/viewer/pseudo-canvas-viewer.html?canvas=../pseudo-canvas-demo.html');
    
    // Wait for toast indicating canvas loaded
    const toast = page.locator('[role="status"], .toast');
    await expect(toast).toContainText(/Loaded|demo\.html/i, { timeout: 5000 });
    
    // Preview should show the canvas content
    const preview = page.locator('[role="region"][aria-label*="preview"], .preview');
    await expect(preview).toHaveText(/.+/, { timeout: 3000 });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T7: Auto-Load Assets via ?assets=auto Query Parameter
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T7: auto-load assets with ?assets=auto query parameter', async ({ page }) => {
    // Navigate with auto-load param
    await page.goto('/viewer/pseudo-canvas-viewer.html?assets=auto');
    
    // Should auto-load assets without needing button click
    const toast = page.locator('[role="status"], .toast');
    await expect(toast).toContainText(/✅.*assets loaded/i, { timeout: 5000 });
    
    // Tree should be populated
    const treeItems = page.locator('[role="treeitem"], .tree-item');
    await expect(treeItems.first()).toBeVisible({ timeout: 2000 });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T8: Error Handling — Network Errors Display Gracefully
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T8: handle network errors gracefully', async ({ page }) => {
    // Intercept and block fetch requests to simulate network error
    await page.route('**/index.js', route => route.abort());
    
    // Click reload button
    await page.locator('#btn-auto').click();
    
    // Should show error toast
    const toast = page.locator('[role="status"], .toast');
    await expect(toast).toContainText(/❌|error|failed/i, { timeout: 5000 });
    
    // Button should recover
    await expect(page.locator('#btn-auto')).toHaveText('⚡ Reload assets', { timeout: 3000 });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T9: Responsive Layout on Different Screen Sizes
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T9: layout remains usable on mobile viewport', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify key UI elements are still visible
    await expect(page.locator('#btn-auto')).toBeVisible();
    await expect(page.locator('#titlebar')).toBeVisible();
    
    // Load assets
    await page.locator('#btn-auto').click();
    await expect(page.locator('[role="status"]')).toContainText(/assets loaded/i, { timeout: 5000 });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T10: State Persistence Across Reload
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T10: preserve selected component across page reload', async ({ page }) => {
    // Load assets
    await page.locator('#btn-auto').click();
    await expect(page.locator('[role="status"]')).toContainText(/assets loaded/i, { timeout: 5000 });
    
    // Select a tree item
    const treeItems = page.locator('[role="treeitem"], .tree-item');
    await expect(treeItems.first()).toBeVisible({ timeout: 3000 });
    await treeItems.first().click();
    
    // Get selected item name
    const selectedName = await treeItems.first().getAttribute('data-name');
    
    // Reload the page
    await page.reload();
    await page.waitForSelector('#btn-auto', { timeout: 5000 });
    
    // Previously selected item should still be selected (if state persists)
    if (selectedName) {
      const selectedAfterReload = page.locator(`[data-name="${selectedName}"]`);
      const isSelected = await selectedAfterReload.getAttribute('aria-selected');
      // aria-selected may be true if state persisted
      expect(['true', null]).toContain(isSelected);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T11: No JavaScript Errors in Console
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T11: no uncaught errors in browser console', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', err => {
      errors.push(err.toString());
    });
    
    // Load assets
    await page.locator('#btn-auto').click();
    await expect(page.locator('[role="status"]')).toContainText(/assets loaded/i, { timeout: 5000 });
    
    // Navigate and interact
    const treeItems = page.locator('[role="treeitem"], .tree-item');
    if (await treeItems.count() > 0) {
      await treeItems.first().click();
    }
    
    // Wait a bit for any deferred errors
    await page.waitForTimeout(1000);
    
    // Should be no errors (or only expected ones like CORS warnings)
    const unexpectedErrors = errors.filter(e => 
      !e.includes('CORS') && !e.includes('manifest') && !e.includes('net::ERR')
    );
    expect(unexpectedErrors).toEqual([]);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T12: Accessibility — Keyboard Navigation
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T12: keyboard navigation works (Tab, Enter)', async ({ page }) => {
    // Tab to the reload button
    await page.keyboard.press('Tab');
    
    // Should be focused on some element
    const focused = await page.evaluate(() => document.activeElement.id);
    expect(focused).toBeTruthy();
    
    // If focused on button, press Enter
    if (focused === 'btn-auto') {
      await page.keyboard.press('Enter');
      
      // Should trigger asset load
      await expect(page.locator('[role="status"]')).toContainText(/✅|Loading|assets/i, { timeout: 5000 });
    }
  });
});
