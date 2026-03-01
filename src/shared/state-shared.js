/**
 * @fileoverview state-shared.js — Shared state model for pseudo-kit.
 *
 * Works in both browser (ESM) and Node.js (ESM) environments.
 * No DOM APIs. No Node built-ins. Pure data structure + serialization.
 *
 * On the server: state is serialized into the HTML as a <script> tag
 * so the client can hydrate without a network round-trip.
 *
 * On the client: state is deserialized from the HTML, then a reactive
 * proxy is built on top by pseudo-kit-client.js.
 *
 * Consumers:
 *  - pseudo-kit-client.js  (hydrates from serialized state)
 *  - pseudo-kit-server.js  (serializes state into HTML)
 *
 * @module state-shared
 * @version 0.1.0
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shape of the application state.
 * Keys match [spec:state-refs] from the pseudo-HTML layout file.
 *
 * @typedef {Object} AppState
 * @property {boolean}          focusMode              - Focus mode hides the AI panel.
 * @property {boolean}          aiRunning              - AI is currently processing.
 * @property {boolean}          suggestionsAvailable   - New suggestions are ready.
 * @property {boolean}          tabSuggestionsActive   - Suggestions tab is active.
 * @property {boolean}          tabCoherenceActive     - Coherence tab is active.
 * @property {boolean}          tabStyleActive         - Style tab is active.
 * @property {boolean}          tabHistoryActive       - History tab is active.
 * @property {boolean}          diffLaunched           - Version diff is visible.
 * @property {number|'2b'|'2c'} step                   - Onboarding step.
 */

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT STATE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default application state.
 * Used as the baseline for both server-side rendering and client-side init.
 *
 * @type {AppState}
 */
const DEFAULT_STATE = Object.freeze({
  focusMode:            false,
  aiRunning:            false,
  suggestionsAvailable: false,
  tabSuggestionsActive: true,
  tabCoherenceActive:   false,
  tabStyleActive:       false,
  tabHistoryActive:     false,
  diffLaunched:         false,
  step:                 1,
});

// ─────────────────────────────────────────────────────────────────────────────
// SERIALIZATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The attribute name used on <script type="application/json"> to identify
 * the serialized pseudo-kit state in the HTML document.
 *
 * @type {string}
 */
const STATE_SCRIPT_ID = 'pk-state';

/**
 * Serializes an AppState object to a JSON string.
 * Used server-side to embed state into the HTML response.
 *
 * @param {Partial<AppState>} state - State to serialize. Missing keys fall back to DEFAULT_STATE.
 * @returns {string} JSON string.
 *
 * @example
 * const json = serialize_shared({ focusMode: true });
 * // '{"focusMode":true,"aiRunning":false,...}'
 */
function serialize_shared(state) {
  return JSON.stringify({ ...DEFAULT_STATE, ...state });
}

/**
 * Generates an HTML <script> tag embedding the serialized state.
 * To be injected into the server-rendered HTML, typically before </body>.
 *
 * @param {Partial<AppState>} [state={}] - Initial state overrides.
 * @returns {string} HTML string: `<script id="pk-state" type="application/json">...</script>`
 *
 * @example
 * const tag = serializeToTag_shared({ tabCoherenceActive: true });
 * // '<script id="pk-state" type="application/json">{"focusMode":false,...}</script>'
 */
function serializeToTag_shared(state = {}) {
  return `<script id="${STATE_SCRIPT_ID}" type="application/json">${serialize_shared(state)}</script>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// DESERIALIZATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deserializes a JSON string back to an AppState object.
 * Falls back to DEFAULT_STATE for any missing or invalid keys.
 *
 * @param {string} json - JSON string produced by {@link serialize_shared}.
 * @returns {AppState}
 * @throws {Error} If the JSON is malformed.
 *
 * @example
 * const state = deserialize_shared('{"focusMode":true}');
 * state.focusMode // true
 * state.aiRunning // false (default)
 */
function deserialize_shared(json) {
  try {
    const parsed = JSON.parse(json);
    return { ...DEFAULT_STATE, ...parsed };
  } catch (err) {
    throw new Error(`[pseudo-kit/state] Failed to deserialize state: ${err.message}`);
  }
}

/**
 * Reads the serialized state from a <script id="pk-state" type="application/json"> tag
 * in the current HTML document (browser only).
 *
 * Returns DEFAULT_STATE if the tag is absent — safe to call on a non-SSR page.
 *
 * @returns {AppState}
 *
 * @example
 * // Browser only
 * const state = deserializeFromTag_shared();
 * // reads from <script id="pk-state" type="application/json"> if present
 */
function deserializeFromTag_shared() {
  // Guard: not available in Node.js
  if (typeof document === 'undefined') {
    return { ...DEFAULT_STATE };
  }

  const tag = document.getElementById(STATE_SCRIPT_ID);
  if (!tag) {
    return { ...DEFAULT_STATE };
  }

  return deserialize_shared(tag.textContent ?? '{}');
}

// ─────────────────────────────────────────────────────────────────────────────
// MERGING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Merges a partial state patch into a full AppState.
 * Keys not present in the patch retain their current values.
 *
 * @param {AppState}          current - The current full state.
 * @param {Partial<AppState>} patch   - Partial overrides to apply.
 * @returns {AppState} New merged state object (does not mutate current).
 *
 * @example
 * const next = merge_shared(current, { focusMode: true });
 */
function merge_shared(current, patch) {
  return { ...current, ...patch };
}

/**
 * Returns a fresh copy of the default state.
 * Useful for resetting state in tests or on navigation.
 *
 * @returns {AppState}
 */
function defaultState_shared() {
  return { ...DEFAULT_STATE };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export {
  DEFAULT_STATE,
  STATE_SCRIPT_ID,
  serialize_shared,
  serializeToTag_shared,
  deserialize_shared,
  deserializeFromTag_shared,
  merge_shared,
  defaultState_shared,
};

export default {
  DEFAULT_STATE,
  STATE_SCRIPT_ID,
  serialize:            serialize_shared,
  serializeToTag:       serializeToTag_shared,
  deserialize:          deserialize_shared,
  deserializeFromTag:   deserializeFromTag_shared,
  merge:                merge_shared,
  defaultState:         defaultState_shared,
};
