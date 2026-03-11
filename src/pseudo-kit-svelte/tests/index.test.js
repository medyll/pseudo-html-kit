/**
 * @fileoverview pseudo-kit-svelte — unit tests
 *
 * Tests the exported functions using plain JS (no Svelte compiler required).
 * Rune-based integration ($state, $effect) is covered in integration examples only.
 *
 * Run: npx vitest run (from src/pseudo-kit-svelte/)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nameFromUrl, createComponent, createComponents, pseudoKit, initPseudoKit } from '../src/index.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeMock() {
  return {
    register: vi.fn(),
    init: vi.fn().mockResolvedValue(undefined),
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  delete globalThis.PseudoKit;
});

// ── nameFromUrl ───────────────────────────────────────────────────────────────

describe('nameFromUrl', () => {
  it('extracts tag name from absolute URL', () => {
    expect(nameFromUrl('/components/button-pk.html')).toBe('button-pk');
  });

  it('extracts tag name from filename only', () => {
    expect(nameFromUrl('card-pk.html')).toBe('card-pk');
  });

  it('handles deeply nested paths', () => {
    expect(nameFromUrl('https://cdn.example.com/v1/atoms/badge.html')).toBe('badge');
  });
});

// ── createComponent ───────────────────────────────────────────────────────────

describe('createComponent', () => {
  it('calls PseudoKit.register with derived name and src', async () => {
    const mock = makeMock();
    globalThis.PseudoKit = mock;
    await createComponent('/components/button-pk.html');
    expect(mock.register).toHaveBeenCalledWith({ name: 'button-pk', src: '/components/button-pk.html' });
  });

  it('calls PseudoKit.init after registering', async () => {
    const mock = makeMock();
    globalThis.PseudoKit = mock;
    await createComponent('/components/button-pk.html');
    expect(mock.init).toHaveBeenCalled();
  });

  it('resolves without throwing when url is empty', async () => {
    globalThis.PseudoKit = makeMock();
    await expect(createComponent('')).resolves.toBeUndefined();
    expect(globalThis.PseudoKit.register).not.toHaveBeenCalled();
  });

  it('warns and returns when PseudoKit is absent', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await createComponent('/components/button-pk.html');
    expect(warnSpy).toHaveBeenCalled();
  });
});

// ── createComponents ──────────────────────────────────────────────────────────

describe('createComponents', () => {
  it('registers all provided URLs', async () => {
    const mock = makeMock();
    globalThis.PseudoKit = mock;
    await createComponents(['/a/card-pk.html', '/a/badge.html']);
    expect(mock.register).toHaveBeenCalledTimes(2);
    expect(mock.register).toHaveBeenCalledWith({ name: 'card-pk', src: '/a/card-pk.html' });
    expect(mock.register).toHaveBeenCalledWith({ name: 'badge', src: '/a/badge.html' });
  });

  it('calls PseudoKit.init once for all components', async () => {
    const mock = makeMock();
    globalThis.PseudoKit = mock;
    await createComponents(['/a/card-pk.html', '/a/badge.html']);
    expect(mock.init).toHaveBeenCalledTimes(1);
  });

  it('resolves immediately when given an empty array', async () => {
    globalThis.PseudoKit = makeMock();
    await expect(createComponents([])).resolves.toBeUndefined();
    expect(globalThis.PseudoKit.register).not.toHaveBeenCalled();
  });

  it('warns and returns when PseudoKit is absent', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await createComponents(['/x/foo.html']);
    expect(warnSpy).toHaveBeenCalled();
  });
});

// ── pseudoKit ─────────────────────────────────────────────────────────────────

describe('pseudoKit', () => {
  it('returns an object with a ready promise', () => {
    globalThis.PseudoKit = makeMock();
    const result = pseudoKit(['/components/button-pk.html']);
    expect(result).toHaveProperty('ready');
    expect(result.ready).toBeInstanceOf(Promise);
  });

  it('resolves ready promise after init', async () => {
    globalThis.PseudoKit = makeMock();
    const { ready } = pseudoKit(['/components/button-pk.html']);
    await expect(ready).resolves.toBeUndefined();
  });

  it('accepts a single string url', async () => {
    const mock = makeMock();
    globalThis.PseudoKit = mock;
    const { ready } = pseudoKit('/components/button-pk.html');
    await ready;
    expect(mock.register).toHaveBeenCalledWith({ name: 'button-pk', src: '/components/button-pk.html' });
  });
});

// ── initPseudoKit ─────────────────────────────────────────────────────────────

describe('initPseudoKit', () => {
  it('registers all URLs and calls PseudoKit.init with root element', async () => {
    const mock = makeMock();
    globalThis.PseudoKit = mock;
    const root = document.createElement('div');
    await initPseudoKit(['/components/button-pk.html'], root);
    expect(mock.register).toHaveBeenCalledWith({ name: 'button-pk', src: '/components/button-pk.html' });
    expect(mock.init).toHaveBeenCalledWith(root);
  });

  it('uses document.body as default root', async () => {
    const mock = makeMock();
    globalThis.PseudoKit = mock;
    await initPseudoKit(['/components/badge.html']);
    expect(mock.init).toHaveBeenCalledWith(document.body);
  });

  it('resolves immediately when given empty urls', async () => {
    globalThis.PseudoKit = makeMock();
    await expect(initPseudoKit([])).resolves.toBeUndefined();
    expect(globalThis.PseudoKit.register).not.toHaveBeenCalled();
  });

  it('warns and returns when PseudoKit is absent', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await initPseudoKit(['/x/foo.html']);
    expect(warnSpy).toHaveBeenCalled();
  });
});
