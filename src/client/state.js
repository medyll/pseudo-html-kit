/**
 * @fileoverview client/state.js — Reactive state management for pseudo-kit.
 *
 * Creates a Proxy that syncs state to data-* attributes on :root.
 * CSS reads state via :root[data-foo] or :root:has([data-foo]).
 */

'use strict';

import { deserializeFromTag_shared } from '../shared/state-shared.js';

/**
 * Converts camelCase to kebab-case for data attributes.
 * @param {string} key
 * @returns {string}
 */
function toAttr(key) {
  return 'data-' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Creates the reactive state proxy.
 * @returns {Object}
 */
export function createState() {
  const initial = deserializeFromTag_shared();

  // Apply initial state to :root
  for (const [key, value] of Object.entries(initial)) {
    const attr = toAttr(key);
    if (value && value !== false) {
      document.documentElement.setAttribute(attr, value === true ? '' : String(value));
    }
  }

  return new Proxy({ ...initial }, {
    set(target, key, value) {
      target[key] = value;
      const attr = toAttr(String(key));

      if (!value) {
        document.documentElement.removeAttribute(attr);
      } else {
        document.documentElement.setAttribute(attr, value === true ? '' : String(value));
      }
      return true;
    },
    get(target, key) {
      return target[key];
    },
  });
}
