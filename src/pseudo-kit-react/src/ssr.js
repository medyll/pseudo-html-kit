/**
 * pseudo-kit-react/ssr
 * Server-side rendering utilities for pseudo-html-kit components.
 *
 * Usage (Node.js / SSR framework):
 *   import { renderComponent, hydrateMarker } from 'pseudo-kit-react/ssr';
 *
 *   const html = await renderComponent('/path/to/button-pk.html', {
 *     variant: 'primary',
 *     label: 'Click me',
 *   });
 *   // → '<button-pk variant="primary" data-pk-ssr="button-pk">…template…</button-pk>'
 *
 * On the client, pass the same component URL to useComponent() / PseudoKitProvider
 * — PseudoKit.init() will skip re-stamping elements that already carry data-pk-resolved.
 *
 * NOTE: This module uses Node.js `fs/promises` and is intentionally NOT bundled with
 * the browser-side entry. Import only in server/build contexts.
 */

import { readFile } from 'node:fs/promises';

/**
 * Extract the inner content of the first `<template>` block in a component file.
 * Returns null if no template is found.
 *
 * @param {string} source - Raw component HTML source
 * @returns {string|null}
 */
function extractTemplate(source) {
  const match = source.match(/<template>([\s\S]*?)<\/template>/i);
  return match ? match[1].trim() : null;
}

/**
 * Derive the custom-element tag name from a file URL/path.
 * e.g. '/components/button-pk.html' → 'button-pk'
 *
 * @param {string} filePath
 * @returns {string}
 */
function nameFromPath(filePath) {
  return filePath.split(/[/\\]/).pop().replace(/\.html$/, '');
}

/**
 * Serialize a props object to an HTML attribute string.
 * Boolean props are rendered as bare attributes (no value) when truthy,
 * and omitted when falsy.
 *
 * @param {Record<string, unknown>} props
 * @returns {string}
 */
function serializeProps(props) {
  return Object.entries(props)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => {
      if (v === true) return k;
      const escaped = String(v).replace(/"/g, '&quot;');
      return `${k}="${escaped}"`;
    })
    .join(' ');
}

/**
 * Render a pseudo-html-kit component to an HTML string.
 *
 * The function:
 * 1. Reads the component `.html` file from `filePath`
 * 2. Extracts the `<template>` inner HTML
 * 3. Wraps it in the custom-element tag with serialized props
 * 4. Adds `data-pk-ssr` and `data-pk-resolved` markers for client hydration
 *
 * @param {string} filePath - Absolute or relative (cwd-based) path to the component `.html` file
 * @param {Record<string, unknown>} [props={}] - Props to serialize as HTML attributes
 * @returns {Promise<string>} HTML string ready to inject into a server-rendered page
 */
export async function renderComponent(filePath, props = {}) {
  const source = await readFile(filePath, 'utf8');
  const name = nameFromPath(filePath);
  const templateContent = extractTemplate(source);

  if (!templateContent) {
    throw new Error(`[pseudo-kit-react/ssr] No <template> found in ${filePath}`);
  }

  const attrString = serializeProps(props);
  const attrPart = attrString ? ` ${attrString}` : '';

  // data-pk-ssr  → signals server-rendered origin (useful for debugging)
  // data-pk-resolved → prevents PseudoKit.init() from re-stamping this element
  return `<${name}${attrPart} data-pk-ssr="${name}" data-pk-resolved>${templateContent}</${name}>`;
}

/**
 * Return an HTML comment hydration marker string for a component name.
 * Insert this immediately before or after the component element in your SSR output
 * when you need explicit boundary markers (optional — most use cases only need renderComponent).
 *
 * @param {string} name - Component name e.g. 'button-pk'
 * @returns {string}
 */
export function hydrateMarker(name) {
  return `<!--pk-ssr:${name}-->`;
}
