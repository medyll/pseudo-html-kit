import { describe, it, expect, vi } from 'vitest';

// Polyfill adoptedStyleSheets if missing (tests rely on importing client module)
if (!document.adoptedStyleSheets) {
  Object.defineProperty(document, 'adoptedStyleSheets', {
    value: [], writable: true,
  });
}

describe('Client hydration from pk-state tag', () => {
  it('hydrates initial state from <script id="pk-state"> and sets :root data-*', async () => {
    // Ensure a clean document
    document.documentElement.getAttributeNames().forEach(attr => { if (attr.startsWith('data-')) document.documentElement.removeAttribute(attr); });

    // Inject pk-state script before importing the client module
    const state = { focusMode: true, step: '2b', tabSuggestionsActive: false };
    const script = document.createElement('script');
    script.id = 'pk-state';
    script.type = 'application/json';
    script.textContent = JSON.stringify(state);
    document.body.appendChild(script);

    // Dynamic import to ensure the module reads the tag at import time
    const mod = await import('../src/client/pseudo-kit-client.js');
    const PseudoKit = mod.default;

    // The client should have applied initial state to :root
    expect(document.documentElement.hasAttribute('data-focus-mode')).toBe(true);
    expect(document.documentElement.getAttribute('data-step')).toBe('2b');

    // And the exported state proxy should reflect the values
    expect(PseudoKit.state.focusMode).toBe(true);
    expect(PseudoKit.state.step).toBe('2b');

    // Cleanup: remove injected script
    document.getElementById('pk-state')?.remove();
  });
});
