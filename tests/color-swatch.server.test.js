/**
 * @fileoverview color-swatch.server.test.js
 * Test that color-swatch-pk server rendering includes accessible listbox/options
 */
import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

import PseudoKitServer from '../src/server/pseudo-kit-server.js';
import { reset_shared } from '../src/shared/registry-shared.js';

const TMP = join(process.cwd(), 'tmp-color-swatch-test');

const FIXTURES = {
  'color-swatch-pk.html': `
<template>
  <div class="color-swatch-pk" role="listbox" tabindex="0" aria-label="Colors">
    <div role="option" data-value="#f00">Red</div>
    <div role="option" data-value="#0f0">Green</div>
  </div>
</template>
`};

async function setup() {
  await mkdir(TMP, { recursive: true });
  for (const [name, content] of Object.entries(FIXTURES)) {
    await writeFile(join(TMP, name), content, 'utf-8');
  }
}
async function teardown() { await rm(TMP, { recursive: true, force: true }); }

function reg(name, file) {
  PseudoKitServer.register({ name, src: join(TMP, file ?? `${name}.html`) });
}

describe('color-swatch-pk server render', () => {
  before(async () => setup());
  after(async () => teardown());
  beforeEach(() => reset_shared());

  it('renders a listbox with options', async () => {
    reg('color-swatch-pk');
    const html = await PseudoKitServer.renderComponent('color-swatch-pk', {}, '', TMP);
    assert.ok(html.includes('role="listbox"'), 'listbox role missing');
    assert.ok(html.includes('role="option"'), 'no option found');
  });
});
