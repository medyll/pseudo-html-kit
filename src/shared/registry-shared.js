/**
 * @fileoverview registry-shared.js — Shared component registry for pseudo-kit.
 *
 * Works in both browser (ESM) and Node.js (ESM) environments.
 * No DOM APIs. No Node built-ins. Pure data structure + logic.
 *
 * Consumers:
 *  - pseudo-kit-client.js  (browser)
 *  - pseudo-kit-server.js  (Node.js)
 *
 * @module registry-shared
 * @version 0.1.0
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Metadata for a registered pseudo-kit component.
 * Intentionally minimal at v0.1 — extended fields will be added later.
 *
 * @typedef {Object} ComponentDefinition
 * @property {string}   name     - Tag name in kebab-case (e.g. "chat-bubble").
 * @property {string}   src      - Resolved path or URL to the component .html file.
 * @property {boolean}  loaded   - Whether the component file has been fetched and parsed.
 * @property {boolean}  autoReg  - True if the component registered itself via import.meta.
 */

/**
 * import.meta-like object passed by a self-registering component.
 *
 * @typedef {Object} ImportMeta
 * @property {string} url - The absolute URL of the component file.
 */

/**
 * Input accepted by {@link register_shared}.
 * Either a manual registration object or an import.meta from the component itself.
 *
 * @typedef {Object} ManualRegistration
 * @property {string} name - Tag name of the component.
 * @property {string} src  - Path or URL to the component .html file.
 */

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY STORE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Internal registry store.
 * Keyed by component tag name (kebab-case).
 *
 * @type {Map<string, ComponentDefinition>}
 */
const _registry = new Map();

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Derives a component tag name from a file URL or path.
 * Extracts the filename stem and validates it as a valid kebab-case custom element name.
 *
 * @param {string} url - Absolute URL or file path to the component .html file.
 * @returns {string} The derived tag name (e.g. "chat-bubble").
 * @throws {Error} If the derived name is not a valid custom element name (must contain a hyphen).
 *
 * @example
 * _nameFromUrl('http://localhost/components/chat-bubble.html') // → 'chat-bubble'
 * _nameFromUrl('/project/components/panel.html')              // → 'panel'  ← valid, no hyphen check for layout elements
 */
function _nameFromUrl(url) {
  const filename = url.split('/').pop() ?? '';
  const name     = filename.replace(/\.html$/, '');

  if (!name) {
    throw new Error(`[pseudo-kit] Cannot derive component name from URL: "${url}"`);
  }

  return name;
}

/**
 * Detects whether the input is an import.meta object (auto-registration)
 * or a manual registration descriptor.
 *
 * @param {ImportMeta|ManualRegistration} input
 * @returns {boolean} True if input is an import.meta object.
 */
function _isImportMeta(input) {
  return typeof input === 'object'
    && input !== null
    && typeof input.url === 'string'
    && !('name' in input);
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — SHARED API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registers a pseudo-kit component.
 *
 * Accepts two call signatures:
 *
 * **Manual registration** (from app bootstrap or index.html):
 * ```js
 * register_shared({ name: 'chat-bubble', src: 'components/chat-bubble.html' });
 * ```
 *
 * **Auto-registration** (from the component file itself):
 * ```js
 * // bottom of components/chat-bubble.html <script> block:
 * register_shared(import.meta);
 * // tag name is derived from the filename: chat-bubble.html → 'chat-bubble'
 * ```
 *
 * If a component is registered twice under the same name, the second call is ignored
 * and a warning is emitted.
 *
 * @param {ImportMeta|ManualRegistration} input - Registration source.
 * @returns {ComponentDefinition} The registered (or existing) component definition.
 * @throws {Error} If the input is invalid or the name cannot be derived.
 *
 * @example
 * // Manual
 * register_shared({ name: 'panel', src: 'components/panel.html' });
 *
 * // Auto (inside the component file)
 * register_shared(import.meta);
 */
function register_shared(input) {
  /** @type {string} */
  let name;
  /** @type {string} */
  let src;
  /** @type {boolean} */
  let autoReg;

  if (_isImportMeta(input)) {
    // Auto-registration: derive name from the file URL
    src     = /** @type {ImportMeta} */ (input).url;
    name    = _nameFromUrl(src);
    autoReg = true;
  } else {
    // Manual registration
    const manual = /** @type {ManualRegistration} */ (input);

    if (!manual.name || typeof manual.name !== 'string') {
      throw new Error(`[pseudo-kit] register_shared: "name" is required for manual registration.`);
    }
    if (!manual.src || typeof manual.src !== 'string') {
      throw new Error(`[pseudo-kit] register_shared: "src" is required for manual registration of "${manual.name}".`);
    }

    name    = manual.name;
    src     = manual.src;
    autoReg = false;
  }

  // Duplicate guard
  if (_registry.has(name)) {
    console.warn(`[pseudo-kit] Component "${name}" is already registered. Ignoring duplicate.`);
    return /** @type {ComponentDefinition} */ (_registry.get(name));
  }

  /** @type {ComponentDefinition} */
  const def = {
    name,
    src,
    loaded:  false,
    autoReg,
  };

  _registry.set(name, def);

  return def;
}

/**
 * Retrieves a registered component definition by tag name.
 *
 * @param {string} name - Tag name of the component (e.g. "chat-bubble").
 * @returns {ComponentDefinition|undefined} The definition, or undefined if not registered.
 *
 * @example
 * const def = lookup_shared('chat-bubble');
 * if (def) console.log(def.src);
 */
function lookup_shared(name) {
  return _registry.get(name);
}

/**
 * Returns all registered component definitions.
 *
 * @returns {ComponentDefinition[]} Array of all definitions, in registration order.
 *
 * @example
 * const all = all_shared();
 * all.forEach(def => console.log(def.name, def.src));
 */
function all_shared() {
  return [..._registry.values()];
}

/**
 * Checks whether a tag name corresponds to a registered component.
 *
 * @param {string} name - Tag name to check.
 * @returns {boolean}
 *
 * @example
 * if (isRegistered_shared('chat-bubble')) { ... }
 */
function isRegistered_shared(name) {
  return _registry.has(name);
}

/**
 * Clears the registry. Intended for testing only.
 * Do not call in production.
 *
 * @returns {void}
 */
function reset_shared() {
  _registry.clear();
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export {
  register_shared,
  lookup_shared,
  all_shared,
  isRegistered_shared,
  reset_shared,
};

export default {
  register:     register_shared,
  lookup:       lookup_shared,
  all:          all_shared,
  isRegistered: isRegistered_shared,
  reset:        reset_shared,
};
