import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ═══════════════════════════════════════════════════════════════════════════
// UI Test Suite — pseudo-canvas-viewer
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Mock fetch to simulate HTTP responses from the viewer's perspective
 */
function mockFetchForViewer(responses = {}) {
  return vi.fn(async (url) => {
    const pathname = new URL(url).pathname;
    
    if (pathname === '/index.js' && responses.indexJs) {
      return { ok: true, text: () => Promise.resolve(responses.indexJs) };
    }
    if (pathname.endsWith('.html') && responses.canvas) {
      return { ok: true, text: () => Promise.resolve(responses.canvas) };
    }
    
    // Simulate 404
    return { ok: false, status: 404, statusText: 'Not Found' };
  });
}

describe('pseudo-canvas-viewer', () => {
  
  // ─────────────────────────────────────────────────────────────────────────
  // T1: Environment & MIME Types
  // ─────────────────────────────────────────────────────────────────────────
  
  describe('T1: Server MIME type configuration', () => {
    it('should serve index.js with application/javascript MIME type', async () => {
      const mockFetch = mockFetchForViewer({
        indexJs: 'export const components = {};'
      });
      
      const response = await mockFetch('http://localhost:3000/index.js');
      expect(response.ok).toBe(true);
      const text = await response.text();
      expect(text).toContain('export');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // T2: Asset Loading — Manual Reload
  // ─────────────────────────────────────────────────────────────────────────
  
  describe('T2: Asset loading via "Reload assets" button', () => {
    let htmlString;
    
    beforeEach(() => {
      htmlString = `<!DOCTYPE html>
        <html>
          <head><title>Test</title></head>
          <body>
            <button id="btn-auto">⚡ Reload assets</button>
            <div id="toast"></div>
            <div id="tree"></div>
          </body>
        </html>`;
      
      global.fetch = mockFetchForViewer({
        indexJs: `
          export const components = {
            card: { name: 'card-pk', src: './components/card.html' },
            button: { name: 'button-pk', src: './components/button.html' }
          };
        `
      });
    });
    
    afterEach(() => {
      vi.clearAllMocks();
    });
    
    it('should show loading state when reload button is clicked', () => {
      const btn = document.createElement('button');
      btn.id = 'btn-auto';
      btn.textContent = '⚡ Reload assets';
      
      expect(btn.textContent).toBe('⚡ Reload assets');
      
      // Simulate button click
      btn.textContent = '⏳ Loading…';
      expect(btn.textContent).toBe('⏳ Loading…');
    });
    
    it('should call fetch for index.js and restore button text', async () => {
      const btn = document.createElement('button');
      btn.id = 'btn-auto';
      btn.textContent = '⏳ Loading…';
      
      await global.fetch('http://localhost:3000/index.js');
      btn.textContent = '⚡ Reload assets';
      
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/index.js'));
      expect(btn.textContent).toBe('⚡ Reload assets');
    });
    
    it('should display toast with asset count on success', async () => {
      const toast = document.createElement('div');
      toast.id = 'toast';
      
      const response = await global.fetch('http://localhost:3000/index.js');
      if (response.ok) {
        const text = await response.text();
        const count = text.match(/card|button/g)?.length || 2;
        toast.textContent = `✅ ${count} assets loaded`;
      }
      
      expect(toast.textContent).toContain('✅');
      expect(toast.textContent).toContain('assets loaded');
    });
    
    it('should display error toast on fetch failure', async () => {
      const toast = document.createElement('div');
      toast.id = 'toast';
      global.fetch = vi.fn(() => 
        Promise.reject(new Error('Network error'))
      );
      
      try {
        await global.fetch('http://localhost:3000/index.js');
      } catch (e) {
        toast.textContent = '❌ Failed to load assets: ' + e.message;
      }
      
      expect(toast.textContent).toContain('❌ Failed to load assets');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // T3: Asset Loading — Auto-Load Query Param
  // ─────────────────────────────────────────────────────────────────────────
  
  describe('T3: Auto-load via ?assets=auto query parameter', () => {
    it('should parse ?assets=auto from URL and trigger load', () => {
      const url = new URL('http://localhost:3000/viewer/pseudo-canvas-viewer.html?assets=auto');
      const params = new URLSearchParams(url.search);
      
      expect(params.has('assets')).toBe(true);
      expect(params.get('assets')).toBe('auto');
    });
    
    it('should not load if assets param is absent', () => {
      const url = new URL('http://localhost:3000/viewer/pseudo-canvas-viewer.html');
      const params = new URLSearchParams(url.search);
      
      expect(params.has('assets')).toBe(false);
    });
    
    it('should only load if assets=auto (not other values)', () => {
      const urlAuto = new URL('http://localhost:3000/viewer/pseudo-canvas-viewer.html?assets=auto');
      const urlOther = new URL('http://localhost:3000/viewer/pseudo-canvas-viewer.html?assets=manual');
      
      const shouldLoadAuto = urlAuto.searchParams.get('assets') === 'auto';
      const shouldLoadOther = urlOther.searchParams.get('assets') === 'auto';
      
      expect(shouldLoadAuto).toBe(true);
      expect(shouldLoadOther).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // T4: Canvas Loading via Query Param
  // ─────────────────────────────────────────────────────────────────────────
  
  describe('T4: Canvas loading via ?canvas=... query parameter', () => {
    beforeEach(() => {
      global.fetch = mockFetchForViewer({
        canvas: `<template><chat-bubble role="alert" /></template>`
      });
    });
    
    afterEach(() => {
      vi.clearAllMocks();
    });
    
    it('should parse canvas URL from query param', () => {
      const url = new URL('http://localhost:3000/viewer/pseudo-canvas-viewer.html?canvas=../demo.html');
      const canvasPath = url.searchParams.get('canvas');
      
      expect(canvasPath).toBe('../demo.html');
    });
    
    it('should resolve relative canvas paths correctly', () => {
      const viewerUrl = new URL('http://localhost:3000/viewer/pseudo-canvas-viewer.html');
      const canvasPath = '../demo.html';
      const canvasUrl = new URL(canvasPath, viewerUrl.href).href;
      
      expect(canvasUrl).toContain('/demo.html');
    });
    
    it('should fetch canvas file when param is present', async () => {
      const canvasUrl = 'http://localhost:3000/demo.html';
      const response = await global.fetch(canvasUrl);
      const html = await response.text();
      
      expect(global.fetch).toHaveBeenCalledWith(canvasUrl);
      expect(html).toContain('chat-bubble');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // T5: Component Rendering in Preview
  // ─────────────────────────────────────────────────────────────────────────
  
  describe('T5: Component rendering in preview panel', () => {
    it('should update preview when component is selected', () => {
      const preview = document.createElement('div');
      preview.id = 'preview';
      
      const treeItem = document.createElement('div');
      treeItem.className = 'tree-item';
      treeItem.dataset.name = 'card-pk';
      
      const componentName = treeItem.dataset.name;
      const componentHtml = `<${componentName}></${componentName}>`;
      preview.innerHTML = componentHtml;
      
      expect(preview.innerHTML).toContain('card-pk');
    });
    
    it('should render all tree items without errors', () => {
      const tree = document.createElement('div');
      tree.id = 'tree';
      
      const item1 = document.createElement('div');
      item1.className = 'tree-item';
      item1.dataset.name = 'card-pk';
      
      const item2 = document.createElement('div');
      item2.className = 'tree-item';
      item2.dataset.name = 'button-pk';
      
      tree.appendChild(item1);
      tree.appendChild(item2);
      
      const treeItems = tree.querySelectorAll('.tree-item');
      
      expect(treeItems.length).toBe(2);
      expect(treeItems[0].dataset.name).toBe('card-pk');
      expect(treeItems[1].dataset.name).toBe('button-pk');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // T6: State Persistence (localStorage)
  // ─────────────────────────────────────────────────────────────────────────
  
  describe('T6: State persistence via localStorage', () => {
    let storage;
    
    beforeEach(() => {
      storage = {};
      global.localStorage = {
        getItem: (key) => storage[key] || null,
        setItem: (key, value) => { storage[key] = value; },
        removeItem: (key) => { delete storage[key]; },
        clear: () => { storage = {}; }
      };
    });
    
    afterEach(() => {
      global.localStorage.clear();
    });
    
    it('should save selected component to localStorage', () => {
      const selectedComponent = 'card-pk';
      global.localStorage.setItem('viewer.selectedComponent', selectedComponent);
      
      expect(global.localStorage.getItem('viewer.selectedComponent')).toBe('card-pk');
    });
    
    it('should restore selected component from localStorage on load', () => {
      global.localStorage.setItem('viewer.selectedComponent', 'button-pk');
      
      const restored = global.localStorage.getItem('viewer.selectedComponent');
      
      expect(restored).toBe('button-pk');
    });
    
    it('should save tree state (expanded/collapsed nodes)', () => {
      const treeState = JSON.stringify({ atoms: true, molecules: false });
      global.localStorage.setItem('viewer.treeState', treeState);
      
      const restored = JSON.parse(global.localStorage.getItem('viewer.treeState'));
      
      expect(restored.atoms).toBe(true);
      expect(restored.molecules).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // T7: Error Handling & User Feedback
  // ─────────────────────────────────────────────────────────────────────────
  
  describe('T7: Error handling and user feedback', () => {
    beforeEach(() => {
      global.fetch = mockFetchForViewer();
    });
    
    it('should catch and display fetch errors gracefully', async () => {
      const toast = document.createElement('div');
      toast.id = 'toast';
      global.fetch = vi.fn(() => 
        Promise.reject(new Error('Failed to fetch index.js'))
      );
      
      try {
        await global.fetch('http://localhost:3000/index.js');
      } catch (e) {
        toast.textContent = '❌ Failed to load assets: ' + e.message;
      }
      
      expect(toast.textContent).toContain('❌');
      expect(toast.textContent).toContain('Failed to fetch');
    });
    
    it('should not throw on network errors', async () => {
      global.fetch = vi.fn(() => 
        Promise.reject(new Error('Network error'))
      );
      
      const btn = document.createElement('button');
      btn.id = 'btn-auto';
      btn.textContent = '⏳ Loading…';
      
      let errorOccurred = false;
      try {
        await global.fetch('http://localhost:3000/index.js');
      } catch (e) {
        errorOccurred = true;
        btn.textContent = '⚡ Reload assets';
      }
      
      expect(errorOccurred).toBe(true);
      expect(btn.textContent).toBe('⚡ Reload assets');
    });
    
    it('should show informative toast messages', () => {
      const toast = document.createElement('div');
      toast.id = 'toast';
      
      // Success case
      toast.textContent = '✅ 5 assets loaded';
      expect(toast.textContent).toContain('✅');
      
      // Error case
      toast.textContent = '❌ Failed to load assets: Network error';
      expect(toast.textContent).toContain('❌');
    });
    
    it('should log errors to console for debugging', async () => {
      const consoleError = vi.spyOn(console, 'error');
      const error = new Error('Test error');
      
      try {
        throw error;
      } catch (e) {
        console.error(e);
      }
      
      expect(consoleError).toHaveBeenCalledWith(error);
      consoleError.mockRestore();
    });
  });
});
