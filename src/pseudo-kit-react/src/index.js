/**
 * pseudo-kit-react
 * Thin React adapter for pseudo-html-kit components.
 *
 * Usage:
 *   import { useComponent, usePseudoKit } from 'pseudo-kit-react';
 *
 *   function MyComponent() {
 *     const { ready } = useComponent('/path/to/button-pk.html');
 *     if (!ready) return null;
 *     return <button-pk variant="primary">Click me</button-pk>;
 *   }
 */

import { useEffect, useState } from 'react';

/**
 * Derive a component name from a URL filename stem.
 * e.g. '/components/button-pk.html' → 'button-pk'
 *
 * @param {string} url
 * @returns {string}
 */
function _nameFromUrl(url) {
  return url.split('/').pop().replace(/\.html$/, '');
}

/**
 * Load and register a single pseudo-html-kit component by URL.
 *
 * @param {string} url - Absolute or relative URL to the component `.html` file.
 * @returns {{ ready: boolean }}
 */
export function useComponent(url) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!url) return;

    const PseudoKit = globalThis.PseudoKit;
    if (!PseudoKit) {
      console.warn('[pseudo-kit-react] PseudoKit not found on globalThis. Make sure pseudo-kit-client.js is loaded before using this hook.');
      return;
    }

    const name = _nameFromUrl(url);
    PseudoKit.register({ name, src: url });
    PseudoKit.init().then(() => setReady(true));
  }, [url]);

  return { ready };
}

/**
 * Load and register multiple pseudo-html-kit components at once.
 *
 * @param {string[]} urls - Array of URLs to component `.html` files.
 * @returns {{ ready: boolean }}
 */
export function usePseudoKit(urls) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!urls || urls.length === 0) return;

    const PseudoKit = globalThis.PseudoKit;
    if (!PseudoKit) {
      console.warn('[pseudo-kit-react] PseudoKit not found on globalThis. Make sure pseudo-kit-client.js is loaded before using this hook.');
      return;
    }

    urls.forEach((url) => {
      const name = _nameFromUrl(url);
      PseudoKit.register({ name, src: url });
    });

    PseudoKit.init().then(() => setReady(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls.join(',')]);

  return { ready };
}
