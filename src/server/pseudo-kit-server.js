/**
 * @fileoverview pseudo-kit-server.js — Node.js server runtime for pseudo-kit.
 *
 * Responsibilities:
 *  - Register components server-side (same registry as client via shared module)
 *  - Resolve component file paths
 *  - Render component HTML server-side (SSR)
 *  - Validate pseudo-HTML layout files against registered components
 *  - Generate base CSS from registered component definitions
 *
 * Node.js ESM only. No browser APIs.
 * Requires: shared/registry-shared.js, node:fs/promises, node:path, node:url
 *
 * @module pseudo-kit-server
 * @version 0.1.0
 */

'use strict';

import { readFile }                          from 'node:fs/promises';
import { resolve, dirname, extname, basename } from 'node:path';
import { fileURLToPath }                     from 'node:url';

import {
  register_shared,
  lookup_shared,
  all_shared,
  isRegistered_shared,
} from '../shared/registry-shared.js';

import {
  serialize_shared,
  serializeToTag_shared,
  defaultState_shared,
} from '../shared/state-shared.js';

// ─────────────────────────────────────────────────────────────────────────────
// PATH RESOLUTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolves a component src (URL or relative path) to an absolute filesystem path.
 * Handles both file:// URLs (from import.meta.url) and relative path strings.
 *
 * @param {string} src      - The src from a ComponentDefinition.
 * @param {string} [base]   - Base directory for relative paths. Defaults to process.cwd().
 * @returns {string} Absolute filesystem path.
 *
 * @example
 * resolvePath_server('file:///project/components/panel.html')
 * // → '/project/components/panel.html'
 *
 * resolvePath_server('components/panel.html', '/project')
 * // → '/project/components/panel.html'
 */
function resolvePath_server(src, base = process.cwd()) {
  if (src.startsWith('file://')) {
    return fileURLToPath(src);
  }
  return resolve(base, src);
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT LOADING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ParsedComponent
 * @property {string}      name    - Tag name.
 * @property {string|null} template - Raw inner HTML of the <template> block.
 * @property {string|null} style    - Raw CSS from the <style> block.
 * @property {string|null} script   - Raw JS from the <script> block.
 */

/**
 * Reads and parses a component .html file on the server.
 * Extracts <template>, <style>, and <script> blocks as raw strings.
 * Does not execute scripts or apply styles — SSR only.
 *
 * @param {string} src   - Absolute filesystem path to the component .html file.
 * @param {string} name  - Component tag name (for error messages).
 * @returns {Promise<ParsedComponent>}
 * @throws {Error} If the file cannot be read.
 *
 * @example
 * const parsed = await loadComponent_server('/project/components/chat-bubble.html', 'chat-bubble');
 * console.log(parsed.template); // raw HTML string
 */
async function loadComponent_server(src, name) {
  let html;

  try {
    html = await readFile(src, 'utf-8');
  } catch (err) {
    throw new Error(`[pseudo-kit/server] Cannot read component "${name}" at "${src}": ${err.message}`);
  }

  // Minimal regex-based extraction — no DOM parser on Node.js
  const template = _extractBlock(html, 'template');
  const style    = _extractBlock(html, 'style');
  const script   = _extractBlock(html, 'script');

  return { name, template, style, script };
}

/**
 * Extracts the inner content of an HTML block tag from a raw HTML string.
 *
 * @param {string} html    - Raw HTML content of the component file.
 * @param {string} tagName - Tag to extract ('template', 'style', 'script').
 * @returns {string|null}  - Inner content, or null if the tag is absent.
 */
function _extractBlock(html, tagName) {
  const re = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = html.match(re);
  return match ? match[1].trim() : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SSR — SERVER-SIDE RENDERING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders a component to an HTML string server-side.
 * Replaces <slot /> in the template with the provided inner content.
 *
 * If the <slot> declares data-* attributes, they are forwarded to each top-level
 * element in the children string — unless the child already has that attribute.
 * This mirrors the client-side _stampTemplate behaviour.
 *
 * Applies props as HTML attributes on the component root tag.
 *
 * Note: script blocks are NOT executed server-side.
 * Interactive behaviour is hydrated client-side by pseudo-kit-client.js.
 *
 * @param {string}            name          - Component tag name.
 * @param {Object}            [props={}]    - Props to apply as HTML attributes.
 * @param {string}            [children=''] - Inner HTML to inject into <slot />.
 * @param {string}            [base]        - Base path for resolving the component file.
 * @returns {Promise<string>} Rendered HTML string.
 *
 * @example
 * const html = await renderComponent_server('chat-bubble', {
 *   role: 'coherence-alert',
 * }, '<span>Aria appears in two places at once.</span>');
 */
async function renderComponent_server(name, props = {}, children = '', base) {
  const def = lookup_shared(name);
  if (!def) {
    throw new Error(`[pseudo-kit/server] Component "${name}" is not registered.`);
  }

  const path   = resolvePath_server(def.src, base);
  const parsed = await loadComponent_server(path, name);

  let inner = children;

  if (parsed.template) {
    // Extract data-* declared on the <slot>
    const slotAttrRe  = /<slot([^>]*)\/?\s*>/i;
    const slotMatch   = parsed.template.match(slotAttrRe);
    const slotData    = {};

    if (slotMatch) {
      const attrsStr  = slotMatch[1];
      const dataAttrRe = /(data-[a-z0-9-]+)(?:="([^"]*)")?/gi;
      let attrMatch;
      while ((attrMatch = dataAttrRe.exec(attrsStr)) !== null) {
        slotData[attrMatch[1]] = attrMatch[2] ?? '';
      }
    }

    // Forward slot data-* to top-level elements in children (if not already set)
    if (Object.keys(slotData).length > 0 && children) {
      inner = children.replace(/<([a-z][a-z0-9-]*)(\s[^>]*)?>/gi, (match, tag, attrs = '') => {
        let extra = '';
        for (const [key, val] of Object.entries(slotData)) {
          // Only add if not already present in the tag's attributes
          if (!attrs.includes(key)) {
            extra += ` ${key}="${val}"`;
          }
        }
        return `<${tag}${attrs}${extra}>`;
      });
    }

    // Replace <slot /> with wrapper + (enriched) children
    const slotName    = (parsed.template.match(/<slot[^>]*\sname="([^"]+)"/) ?? [])[1] ?? 'default';
    const slotPropsAttr = Object.keys(slotData).length > 0
      ? ` data-slot-props='${JSON.stringify(slotData)}'`
      : '';

    const wrappedChildren =
      `<pk-slot style="display:contents" data-slot-component="${name}" data-slot-name="${slotName}"${slotPropsAttr}>${inner}</pk-slot>`;

    inner = parsed.template.replace(/<slot[^>]*\/?\s*>/i, wrappedChildren);
  }

  // Serialize props to HTML attribute string
  const attrs = Object.entries(props)
    .map(([k, v]) => v === true ? k : `${k}="${String(v).replace(/"/g, '&quot;')}"`)
    .join(' ');

  return `<${name}${attrs ? ' ' + attrs : ''}>${inner}</${name}>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS GENERATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates the base CSS for all registered components by reading their <style> blocks.
 * Output is a single CSS string ready to be written to a file or injected into a <style> tag.
 *
 * Wraps each component's CSS in a comment banner for traceability.
 *
 * @param {string} [base] - Base path for resolving component files.
 * @returns {Promise<string>} Concatenated CSS string for all registered components.
 *
 * @example
 * const css = await generateCSS_server();
 * await writeFile('dist/components.css', css, 'utf-8');
 */
async function generateCSS_server(base) {
  const parts = [];

  for (const def of all_shared()) {
    const path = resolvePath_server(def.src, base);

    try {
      const parsed = await loadComponent_server(path, def.name);
      if (parsed.style) {
        parts.push(`/* ── ${def.name} ── */\n${parsed.style}`);
      }
    } catch (err) {
      console.warn(`[pseudo-kit/server] generateCSS: skipping "${def.name}": ${err.message}`);
    }
  }

  return parts.join('\n\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ValidationResult
 * @property {boolean}  valid    - True if no errors were found.
 * @property {string[]} errors   - List of error messages.
 * @property {string[]} warnings - List of warning messages.
 */

/**
 * Validates a pseudo-HTML layout file against the registered component registry.
 *
 * Checks:
 *  - Every custom tag used in the layout is either a registered component or a known layout element.
 *  - Every component used has a registered src path.
 *  - loop="" appears only on direct children of data-bound containers.
 *
 * Does NOT validate attribute types or data shapes (reserved for a future schema pass).
 *
 * @param {string} layoutPath - Absolute path to the pseudo-HTML layout file.
 * @returns {Promise<ValidationResult>}
 *
 * @example
 * const result = await validate_server('/project/sive-layout.html');
 * if (!result.valid) {
 *   result.errors.forEach(e => console.error(e));
 * }
 */
async function validate_server(layoutPath) {
  const errors   = [];
  const warnings = [];

  let html;
  try {
    html = await readFile(layoutPath, 'utf-8');
  } catch (err) {
    return {
      valid: false,
      errors: [`Cannot read layout file at "${layoutPath}": ${err.message}`],
      warnings: [],
    };
  }

  // Extract all custom tag names used in the layout (tags containing a hyphen or registered names)
  const tagRe   = /<([a-z][a-z0-9-]*)/gi;
  const usedTags = new Set();
  let match;

  while ((match = tagRe.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    // Custom elements must contain a hyphen, OR be registered by name
    if (tag.includes('-') || isRegistered_shared(tag)) {
      usedTags.add(tag);
    }
  }

  // Known layout elements — declared with element="*" in <template>, pure CSS, no component file
  const layoutElements = new Set([
    'row', 'column', 'grid', 'cell', 'stack', 'spacer',
  ]);

  for (const tag of usedTags) {
    if (layoutElements.has(tag)) continue; // layout element, skip

    if (!isRegistered_shared(tag)) {
      errors.push(`Unknown component <${tag}> used in layout but not registered.`);
    }
  }

  // Check loop="" usage — warn if loop element has no sibling or parent with data=""
  const loopRe = /<([a-z][a-z0-9-]*)[^>]*\bloop=""/gi;
  while ((match = loopRe.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    warnings.push(`<${tag} loop=""> detected — ensure its container provides a data source.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @namespace PseudoKitServer
 */
const PseudoKitServer = {

  /**
   * Serializes app state to an HTML <script> tag for SSR hydration.
   * Inject the result before </body> in the server-rendered HTML.
   * The client reads it via deserializeFromTag_shared() on load.
   *
   * @param {Partial<import('../shared/state-shared.js').AppState>} [state={}]
   * @returns {string} HTML string: `<script id="pk-state" type="application/json">...</script>`
   *
   * @example
   * const html = `
   *   ${await PseudoKitServer.renderComponent('panel', {}, innerHtml)}
   *   ${PseudoKitServer.serializeState({ tabCoherenceActive: true })}
   * `;
   */
  serializeState: serializeToTag_shared,

  /**
   * Registers a component server-side.
   * Delegates to {@link register_shared}.
   *
   * @param {import('../shared/registry-shared.js').ImportMeta|import('../shared/registry-shared.js').ManualRegistration} input
   * @returns {typeof PseudoKitServer} For chaining.
   */
  register(input) {
    register_shared(input);
    return this;
  },

  /**
   * Resolves a component src to an absolute filesystem path.
   * @type {typeof resolvePath_server}
   */
  resolvePath: resolvePath_server,

  /**
   * Renders a component to an HTML string.
   * @type {typeof renderComponent_server}
   */
  renderComponent: renderComponent_server,

  /**
   * Generates the base CSS for all registered components.
   * @type {typeof generateCSS_server}
   */
  generateCSS: generateCSS_server,

  /**
   * Validates a pseudo-HTML layout file against the registry.
   * @type {typeof validate_server}
   */
  validate: validate_server,

};

export default PseudoKitServer;
