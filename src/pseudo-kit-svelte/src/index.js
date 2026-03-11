/**
 * pseudo-kit-svelte
 * Thin Svelte 5 adapter for pseudo-html-kit components.
 *
 * Exposes a vanilla JS API that integrates cleanly with Svelte 5 runes.
 *
 * Usage in a Svelte 5 component:
 *
 *   <script>
 *     import { createComponent } from 'pseudo-kit-svelte';
 *     let ready = $state(false);
 *     $effect(() => {
 *       createComponent('/components/button-pk.html').then(() => { ready = true; });
 *     });
 *   </script>
 *
 *   {#if ready}
 *     <button-pk variant="primary">Click me</button-pk>
 *   {/if}
 *
 * Or with the store-based helper (works with both Svelte 4 stores and Svelte 5):
 *
 *   import { pseudoKit } from 'pseudo-kit-svelte';
 *   const { ready } = pseudoKit(['/components/button-pk.html', '/components/card.html']);
 */

/**
 * Derive a component tag name from a URL filename stem.
 * e.g. '/components/button-pk.html' → 'button-pk'
 *
 * @param {string} url
 * @returns {string}
 */
export function nameFromUrl(url) {
  return url.split('/').pop().replace(/\.html$/, '');
}

/**
 * Load and register a single pseudo-html-kit component by URL.
 * Resolves when the component is ready to use.
 *
 * @param {string} url - Absolute or relative URL to the component `.html` file
 * @returns {Promise<void>}
 */
export async function createComponent(url) {
  if (!url) return;

  const PseudoKit = globalThis.PseudoKit;
  if (!PseudoKit) {
    console.warn('[pseudo-kit-svelte] PseudoKit not found on globalThis. Make sure pseudo-kit-client.js is loaded before calling createComponent.');
    return;
  }

  const name = nameFromUrl(url);
  PseudoKit.register({ name, src: url });
  await PseudoKit.init();
}

/**
 * Load and register multiple pseudo-html-kit components at once.
 * Resolves when all components are ready to use.
 *
 * @param {string[]} urls - Array of component `.html` file URLs
 * @returns {Promise<void>}
 */
export async function createComponents(urls) {
  if (!urls || urls.length === 0) return;

  const PseudoKit = globalThis.PseudoKit;
  if (!PseudoKit) {
    console.warn('[pseudo-kit-svelte] PseudoKit not found on globalThis. Make sure pseudo-kit-client.js is loaded before calling createComponents.');
    return;
  }

  urls.forEach((url) => {
    PseudoKit.register({ name: nameFromUrl(url), src: url });
  });

  await PseudoKit.init();
}

/**
 * Observable-friendly helper that returns a plain object with a `ready` promise.
 * Works with Svelte 5 runes, Svelte 4 stores, or plain JS async/await.
 *
 * @param {string | string[]} urlOrUrls - One URL or array of URLs
 * @returns {{ ready: Promise<void> }}
 */
export function pseudoKit(urlOrUrls) {
  const urls = Array.isArray(urlOrUrls) ? urlOrUrls : [urlOrUrls];
  return {
    ready: createComponents(urls),
  };
}

/**
 * Init helper — registers a list of components and runs PseudoKit.init on a
 * given root element. Designed for use in Svelte's `onMount` or `$effect`.
 *
 * @param {string[]} urls - Component URLs to register
 * @param {Element} [root] - Root element to init (defaults to document.body)
 * @returns {Promise<void>}
 */
export async function initPseudoKit(urls, root) {
  if (!urls || urls.length === 0) return;

  const PseudoKit = globalThis.PseudoKit;
  if (!PseudoKit) {
    console.warn('[pseudo-kit-svelte] PseudoKit not found on globalThis.');
    return;
  }

  urls.forEach((url) => {
    PseudoKit.register({ name: nameFromUrl(url), src: url });
  });

  await PseudoKit.init(root || document.body);
}
