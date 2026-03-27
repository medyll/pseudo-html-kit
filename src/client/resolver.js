/**
 * @fileoverview client/resolver.js — Component resolution for pseudo-kit.
 *
 * Handles DOM observation, component loading, and template stamping.
 */

'use strict';

import { lookup_shared, all_shared } from '../shared/registry-shared.js';
import { upsertComponentStyle } from './styles.js';
import { stampTemplate } from './slots.js';
import { emit } from './events.js';

/**
 * Detects if a component was server-rendered (SSR hydration).
 * @param {Element} el
 * @returns {boolean}
 */
export function isSSRHydrated(el) {
  if (el.dataset.pkHydrated === 'true' || el.hasAttribute('data-pk-hydrated')) return true;

  for (let c = el.firstElementChild; c; c = c.nextElementSibling) {
    if (c.tagName.toLowerCase() === 'pk-slot') return true;
  }
  return false;
}

/**
 * Loads and parses a component .html file.
 * @param {Object} def - Component definition.
 */
export async function loadComponent(def) {
  const res = await fetch(def.src);

  if (!res.ok) {
    throw new Error(`[pseudo-kit] Failed to load "${def.name}" from "${def.src}" (${res.status})`);
  }

  const html = await res.text();

  // Extract script before DOMParser (happy-dom executes scripts during parse)
  const rawScriptMatch = html.match(/<script([^>]*)>([\s\S]*?)<\/script>/i);
  const rawScriptAttrs = rawScriptMatch?.[1] ?? '';
  const rawScriptText = rawScriptMatch?.[2]?.trim() ?? null;

  const htmlForParsing = rawScriptMatch
    ? html.slice(0, rawScriptMatch.index) + html.slice(rawScriptMatch.index + rawScriptMatch[0].length)
    : html;

  const doc = new DOMParser().parseFromString(htmlForParsing, 'text/html');
  const tpl = doc.querySelector('template');
  const styleEl = doc.querySelector('style');

  def.template = tpl
    ? document.importNode(tpl.content, true)
    : document.createDocumentFragment();

  // Remove script/style from template content
  def.template.querySelectorAll('script, style').forEach(el => el.remove());

  def.style = styleEl?.textContent ?? null;

  // Handle module scripts vs inline scripts
  if (rawScriptMatch) {
    const isModule = /type\s*=\s*["']module["']/i.test(rawScriptAttrs);
    const srcMatch = rawScriptAttrs.match(/src\s*=\s*["']([^"']+)["']/i);
    const moduleSrc = srcMatch?.[1] ?? null;

    if (isModule && moduleSrc) {
      try {
        const base = new URL(def.src, globalThis.location?.href ?? 'http://localhost/').href;
        const moduleUrl = new URL(moduleSrc, base).href;
        import(moduleUrl).catch(err =>
          console.error(`[pseudo-kit] Failed to import module for "${def.name}":`, err)
        );
      } catch (err) {
        console.error(`[pseudo-kit] Failed to import module for "${def.name}":`, err);
      }
      def.script = null;
    } else {
      def.script = rawScriptText;
    }
  } else {
    def.script = null;
  }

  def.loaded = true;
}

/**
 * Resolves a single component element.
 * @param {Element} el
 * @param {Object} PseudoKit - The PseudoKit API object.
 */
export async function resolveComponent(el, PseudoKit) {
  const name = el.tagName.toLowerCase();
  const def = lookup_shared(name);

  if (!def) return;
  if (el.dataset.pkResolved) return;

  if (!def.loaded) {
    await loadComponent(def);
  }

  if (isSSRHydrated(el)) {
    el.dataset.pkHydrated = 'true';
  } else {
    stampTemplate(el, def);
  }

  if (def.style) {
    upsertComponentStyle(name, def.style);
  }

  // Evaluate script
  if (def.script) {
    try {
      const fn = new Function('el', 'state', 'emit', 'renderLoop', 'register', def.script);
      fn.call(el, el, PseudoKit.state, emit, PseudoKit.renderLoop, lookup_shared);
    } catch (err) {
      console.error(`[pseudo-kit] Script error in "${def.name}":`, err);
    }
  }

  // Mark loops
  el.querySelectorAll('[loop]').forEach(loopEl => {
    loopEl.dataset.pkLoopTemplate = 'true';
  });

  el.dataset.pkResolved = 'true';
}

/**
 * Collects all elements matching registered component names.
 * @param {Element} root
 * @returns {Element[]}
 */
export function collectComponents(root) {
  const names = all_shared().map(d => d.name);
  if (!names.length) return [];

  const selector = names.join(', ');
  const results = [];

  if (root.matches?.(selector)) results.push(root);
  results.push(...root.querySelectorAll(selector));

  return results;
}

/**
 * Resolves all components in a tree.
 * @param {Element} root
 * @param {Object} PseudoKit
 */
export async function resolveTree(root, PseudoKit) {
  for (const el of collectComponents(root)) {
    await resolveComponent(el, PseudoKit);
  }
}

/**
 * Starts observing the DOM for components.
 * @param {Element} root
 * @param {Object} PseudoKit
 * @returns {MutationObserver}
 */
export function observe(root, PseudoKit) {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        resolveTree(node, PseudoKit).catch(err =>
          console.error('[pseudo-kit]', err.message ?? err)
        );
      }
    }
  });

  observer.observe(root, { childList: true, subtree: true });
  resolveTree(root, PseudoKit).catch(err =>
    console.error('[pseudo-kit]', err.message ?? err)
  );

  return observer;
}
