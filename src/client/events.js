/**
 * @fileoverview client/events.js — Event dispatching for pseudo-kit.
 */

'use strict';

/**
 * Dispatches a CustomEvent from a component element.
 * @param {Element} el - Element to dispatch from.
 * @param {string} name - Event name.
 * @param {*} [detail] - Optional payload.
 */
export function emit(el, name, detail = null) {
  el.dispatchEvent(new CustomEvent(name, {
    bubbles: true,
    composed: true,
    detail,
  }));
}
