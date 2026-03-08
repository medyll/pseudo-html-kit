import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import PseudoKitServer from '../src/server/pseudo-kit-server.js';
import { reset_shared } from '../src/shared/registry-shared.js';

const TMP = join(tmpdir(), 'pseudo-kit-render-hydration');

before(async () => {
  await mkdir(TMP, { recursive: true });
});

after(async () => {
  await rm(TMP, { recursive: true, force: true });
});

describe('renderComponent hydration marker', () => {
  before(() => reset_shared());

  it('adds data-pk-hydrated="true" when component has a template', async () => {
    const name = 'thyd-template';
    const file = join(TMP, `${name}.html`);
    const content = `\n<template>\n  <div class="x"><slot/></div>\n</template>\n`;
    await writeFile(file, content, 'utf-8');

    PseudoKitServer.register({ name, src: file });
    const html = await PseudoKitServer.renderComponent(name, {}, '<span>hi</span>', TMP);
    assert.ok(html.includes('data-pk-hydrated="true"'), 'rendered HTML should include hydrated marker');
  });

  it('does not add data-pk-hydrated when component has no template', async () => {
    const name = 'thyd-no-template';
    const file = join(TMP, `${name}.html`);
    const content = `<style>@layer components { @scope (bare) { :scope {} } }</style>`;
    await writeFile(file, content, 'utf-8');

    PseudoKitServer.register({ name, src: file });
    const html = await PseudoKitServer.renderComponent(name, {}, '', TMP);
    assert.ok(!html.includes('data-pk-hydrated="true"'), 'rendered HTML should NOT include hydrated marker');
  });

});
