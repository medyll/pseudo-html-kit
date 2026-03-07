import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

// DOM polyfills
if (!document.adoptedStyleSheets) Object.defineProperty(document, 'adoptedStyleSheets', { value: [], writable: true });

import PseudoKit from '../src/client/pseudo-kit-client.js';
import { reset_shared } from '../src/shared/registry-shared.js';

const ORG_DIR = join(dirname(fileURLToPath(import.meta.url)), '../src/pseudo-assets/components/organisms');
function readOrganism(filename) { return readFileSync(join(ORG_DIR, filename), 'utf8'); }

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

beforeEach(() => {
  reset_shared();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('carousel-pk', () => {
  const HTML = readOrganism('carousel-pk.html');
  const SRC = 'components/organisms/carousel-pk.html';

  it('resolves and stamps track', async () => {
    const obs = registerAndInit('carousel-pk', SRC, HTML);
    document.body.innerHTML = '<carousel-pk><div>One</div><div>Two</div></carousel-pk>';
    PseudoKit.init(document.body);
    await new Promise(r => setTimeout(r, 0));
    expect(document.querySelector('carousel-pk').dataset.pkResolved).toBe('true');
    expect(document.querySelector('.carousel__track')).toBeTruthy();
    obs.disconnect();
  });
});
