/**
 * @fileoverview pseudo-kit-react/ssr — unit tests
 *
 * Tests renderComponent() and hydrateMarker() using tmp component files
 * written to the OS temp directory.
 *
 * Run: npx vitest run (from src/pseudo-kit-react/)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { writeFile, unlink, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { renderComponent, hydrateMarker } from '../src/ssr.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const TMP = join(tmpdir(), 'pk-ssr-test');

const BUTTON_SRC = `<!--
  @component button-pk
-->
<template>
  <button class="button" type="button">
    <slot>Button</slot>
  </button>
</template>
<style>
  .button { display: inline-flex; }
</style>`;

const NO_TEMPLATE_SRC = `<style>.foo { color: red; }</style>`;

let buttonPath;
let noTemplatePath;

beforeAll(async () => {
  await mkdir(TMP, { recursive: true });
  buttonPath = join(TMP, 'button-pk.html');
  noTemplatePath = join(TMP, 'no-template.html');
  await writeFile(buttonPath, BUTTON_SRC, 'utf8');
  await writeFile(noTemplatePath, NO_TEMPLATE_SRC, 'utf8');
});

afterAll(async () => {
  await unlink(buttonPath).catch(() => {});
  await unlink(noTemplatePath).catch(() => {});
});

// ── renderComponent ───────────────────────────────────────────────────────────

describe('renderComponent()', () => {
  it('returns a string', async () => {
    const result = await renderComponent(buttonPath);
    expect(typeof result).toBe('string');
  });

  it('wraps output in the correct custom-element tag', async () => {
    const result = await renderComponent(buttonPath);
    expect(result).toMatch(/^<button-pk /);
    expect(result).toMatch(/<\/button-pk>$/);
  });

  it('includes the template inner HTML', async () => {
    const result = await renderComponent(buttonPath);
    expect(result).toContain('<button class="button"');
    expect(result).toContain('<slot>Button</slot>');
  });

  it('adds data-pk-ssr attribute with component name', async () => {
    const result = await renderComponent(buttonPath);
    expect(result).toContain('data-pk-ssr="button-pk"');
  });

  it('adds data-pk-resolved attribute (hydration guard)', async () => {
    const result = await renderComponent(buttonPath);
    expect(result).toContain('data-pk-resolved');
  });

  it('serializes string props as HTML attributes', async () => {
    const result = await renderComponent(buttonPath, { variant: 'primary', size: 'lg' });
    expect(result).toContain('variant="primary"');
    expect(result).toContain('size="lg"');
  });

  it('serializes boolean true props as bare attributes', async () => {
    const result = await renderComponent(buttonPath, { disabled: true });
    expect(result).toContain('disabled');
    expect(result).not.toContain('disabled="true"');
  });

  it('omits boolean false props', async () => {
    const result = await renderComponent(buttonPath, { disabled: false });
    expect(result).not.toContain('disabled');
  });

  it('omits null and undefined props', async () => {
    const result = await renderComponent(buttonPath, { foo: null, bar: undefined });
    expect(result).not.toContain('foo=');
    expect(result).not.toContain('bar=');
  });

  it('escapes double quotes in prop values', async () => {
    const result = await renderComponent(buttonPath, { label: 'Say "hello"' });
    expect(result).toContain('label="Say &quot;hello&quot;"');
  });

  it('works with no props (empty object default)', async () => {
    const result = await renderComponent(buttonPath);
    // Should not contain spurious attributes between the tag name and data-pk-ssr
    expect(result).toMatch(/^<button-pk data-pk-ssr=/);
  });

  it('throws when file has no <template>', async () => {
    await expect(renderComponent(noTemplatePath)).rejects.toThrow(
      '[pseudo-kit-react/ssr] No <template> found'
    );
  });

  it('throws when file does not exist', async () => {
    await expect(renderComponent(join(TMP, 'nonexistent.html'))).rejects.toThrow();
  });
});

// ── hydrateMarker ─────────────────────────────────────────────────────────────

describe('hydrateMarker()', () => {
  it('returns an HTML comment', () => {
    const marker = hydrateMarker('button-pk');
    expect(marker).toBe('<!--pk-ssr:button-pk-->');
  });

  it('includes the component name', () => {
    const marker = hydrateMarker('my-widget');
    expect(marker).toContain('my-widget');
  });
});
