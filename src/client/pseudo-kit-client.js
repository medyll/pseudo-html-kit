/**
 * @fileoverview pseudo-kit-client.js — Browser runtime for pseudo-kit.
 *
 * No framework. No build step. No dependencies.
 * Targets: Chrome 118+, Firefox 128+, Safari 17.4+
 *
 * @module pseudo-kit-client
 */

'use strict';

import { register_shared } from '../shared/registry-shared.js';
import { createState } from './state.js';
import { observe, resolveTree, resolveComponent, collectComponents } from './resolver.js';
import { emit } from './events.js';

// Create the state proxy
const state = createState();

/**
 * Renders a loop="" template with a data array.
 * @param {string} containerId
 * @param {Object[]} data
 */
function renderLoop(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`[pseudo-kit] renderLoop: #${containerId} not found`);
    return;
  }

  const template = container.querySelector('[loop], [data-pk-loop-template]');
  if (!template) {
    console.warn(`[pseudo-kit] renderLoop: no loop="" element in #${containerId}`);
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const item of data) {
    const clone = template.cloneNode(true);
    clone.removeAttribute('loop');
    delete clone.dataset.pkLoopTemplate;
    delete clone.dataset.pkResolved;

    for (const [key, value] of Object.entries(item)) {
      clone.dataset[key] = value;
    }

    fragment.appendChild(clone);
  }

  template.replaceWith(fragment);

  // Resolve newly created components
  for (const el of collectComponents(container)) {
    resolveComponent(el, PseudoKit);
  }
}

/**
 * @namespace PseudoKit
 * @description Public client API for the pseudo-kit runtime.
 */
const PseudoKit = {

  /**
   * Global reactive state proxy.
   * Writing a value updates a data-* attribute on :root for CSS.
   *
   * @type {Object}
   *
   * @example
   * PseudoKit.state.focusMode = true;
   * // :root gets attribute data-focus-mode=""
   */
  state,

  /**
   * Registers a component — manual or auto (import.meta).
   *
   * @param {Object} input - { name, src } or import.meta
   * @returns {typeof PseudoKit} For chaining.
   *
   * @example
   * // Manual
   * PseudoKit.register({ name: 'button', src: './button.html' });
   *
   * // Auto (from inside component)
   * PseudoKit.register(import.meta);
   */
  register(input) {
    register_shared(input);
    return this;
  },

  /**
   * Starts the pseudo-kit runtime.
   *
   * @param {Element} [root=document.body] - Root element to observe.
   * @returns {MutationObserver} The active observer.
   *
   * @example
   * PseudoKit.init();
   * PseudoKit.init(document.getElementById('app-root'));
   */
  init(root = document.body) {
    return observe(root, PseudoKit);
  },

  /**
   * Resolves a single component element.
   *
   * @param {Element} el - Component element to resolve.
   * @returns {Promise<void>}
   */
  async resolve(el) {
    await resolveComponent(el, PseudoKit);
  },

  /**
   * Renders a loop="" template with a data array.
   *
   * @param {string} containerId - Container ID holding the loop template.
   * @param {Object[]} data - Array of data objects.
   */
  renderLoop,

  /**
   * Dispatches a CustomEvent from a component element.
   *
   * @param {Element} el - Element to dispatch from.
   * @param {string} name - Event name.
   * @param {*} [detail] - Optional payload.
   */
  emit,

};

export default PseudoKit;
