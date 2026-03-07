import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

if (!document.adoptedStyleSheets) Object.defineProperty(document, 'adoptedStyleSheets', { value: [], writable: true });

import PseudoKit from '../src/client/pseudo-kit-client.js';
import { reset_shared } from '../src/shared/registry-shared.js';

const MOL_DIR = join(dirname(fileURLToPath(import.meta.url)), '../src/pseudo-assets/components/molecules');
function readMolecule(filename) { return readFileSync(join(MOL_DIR, filename), 'utf8'); }

function mockFetch(map) {
  vi.stubGlobal('fetch', vi.fn((url) => {
    const content = map[url] ?? map['*'];
    if (content === undefined) return Promise.resolve({ ok: false, status: 404 });
    return Promise.resolve({ ok: true, text: () => Promise.resolve(content) });
  }));
}

function registerAndInit(name, src, htmlContent) {
  mockFetch({ [src]: htmlContent });
  PseudoKit.register({ name, src });
  return PseudoKit.init(document.body);
}

beforeEach(() => { reset_shared(); document.body.innerHTML = ''; vi.restoreAllMocks(); });

describe('color-swatch-pk', () => {
  const HTML = readMolecule('color-swatch-pk.html');
  const SRC = 'components/molecules/color-swatch-pk.html';

  it('resolves and initializes swatches', async () => {
    const obs = registerAndInit('color-swatch-pk', SRC, HTML);
    document.body.innerHTML = '<color-swatch-pk><button data-value="#f00" style="background:#f00"></button><button data-value="#0f0" style="background:#0f0"></button></color-swatch-pk>';
    PseudoKit.init(document.body);
    await new Promise(r => setTimeout(r, 0));
    expect(document.querySelector('color-swatch-pk').dataset.pkResolved).toBe('true');
    expect(document.querySelectorAll('color-swatch-pk button').length).toBe(2);
    obs.disconnect();
  });
});
