import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

if (!document.adoptedStyleSheets) Object.defineProperty(document, 'adoptedStyleSheets', { value: [], writable: true });

import PseudoKit from '../src/client/pseudo-kit-client.js';
import { reset_shared } from '../src/shared/registry-shared.js';

const ATOMS_DIR = join(dirname(fileURLToPath(import.meta.url)), '../src/pseudo-assets/components/atoms');
function readAtom(filename) { return readFileSync(join(ATOMS_DIR, filename), 'utf8'); }

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

describe('date-picker-pk', () => {
  const HTML = readAtom('date-picker-pk.html');
  const SRC = 'components/atoms/date-picker-pk.html';

  it('resolves and contains an input[type=date] or fallback popover', async () => {
    const obs = registerAndInit('date-picker-pk', SRC, HTML);
    document.body.innerHTML = '<date-picker-pk></date-picker-pk>';
    PseudoKit.init(document.body);
    await new Promise(r => setTimeout(r, 0));
    expect(document.querySelector('date-picker-pk').dataset.pkResolved).toBe('true');
    expect(document.querySelector('input[type="date"]') || document.querySelector('.date-picker__popover')).toBeTruthy();
    obs.disconnect();
  });
});
