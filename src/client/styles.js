/**
 * @fileoverview client/styles.js — CSS stylesheet management for pseudo-kit.
 *
 * Manages component styles via adoptedStyleSheets API with fallback to <style> tag.
 * No DOM injection — all rules are managed in a single shared stylesheet.
 */

'use strict';

/**
 * The single adoptable CSSStyleSheet used for all component styles.
 * @type {CSSStyleSheet|null}
 */
const componentSheet = (typeof CSSStyleSheet !== 'undefined') ? new CSSStyleSheet() : null;

/**
 * Fallback <style> tag for environments without adoptedStyleSheets.
 * @type {HTMLStyleElement|null}
 */
let styleTagFallback = null;

/**
 * Index of known @scope rule positions, keyed by component name.
 * @type {Map<string, number>}
 */
const scopeRuleIndex = new Map();

// Initialize stylesheet on module load
(function _initStylesheet() {
  try {
    if (componentSheet && 'adoptedStyleSheets' in document) {
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, componentSheet];
    } else {
      styleTagFallback = document.createElement('style');
      styleTagFallback.setAttribute('data-pk-component-styles', '');
      document.head.appendChild(styleTagFallback);
    }
  } catch (err) {
    console.warn('[pseudo-kit] adoptedStyleSheets not available, using <style> fallback');
    styleTagFallback = document.createElement('style');
    styleTagFallback.setAttribute('data-pk-component-styles', '');
    document.head.appendChild(styleTagFallback);
  }
})();

/**
 * Registers or updates a component's CSS in the shared stylesheet.
 *
 * @param {string} name - Component tag name (e.g. "chat-bubble").
 * @param {string} css  - Raw CSS from <style> block.
 */
export function upsertComponentStyle(name, css) {
  try {
    if (componentSheet) {
      if (scopeRuleIndex.has(name)) {
        const idx = scopeRuleIndex.get(name);
        componentSheet.deleteRule(idx);
        componentSheet.insertRule(css, idx);
      } else {
        const idx = componentSheet.cssRules.length;
        componentSheet.insertRule(css, idx);
        scopeRuleIndex.set(name, idx);
      }
    } else if (styleTagFallback) {
      styleTagFallback.textContent += `\n/* ${name} */\n` + css;
    } else {
      console.warn(`[pseudo-kit] No stylesheet mechanism available for "${name}"`);
    }
  } catch (err) {
    console.warn(`[pseudo-kit] Could not insert CSS for "${name}": ${err.message}`);
    if (!styleTagFallback) {
      styleTagFallback = document.createElement('style');
      styleTagFallback.setAttribute('data-pk-component-styles', '');
      document.head.appendChild(styleTagFallback);
      styleTagFallback.textContent += `\n/* ${name} */\n` + css;
    }
  }
}
