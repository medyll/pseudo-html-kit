#!/usr/bin/env node
/**
 * generate-docs.js
 * Generates docs/index.html — the pseudo-html-kit documentation site.
 *
 * The site dogfoods pseudo-html-kit itself for UI components.
 * Component API data is read from pseudo-kit-context.json.
 *
 * Usage:
 *   node scripts/generate-docs.js
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT    = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTEXT = JSON.parse(readFileSync(join(ROOT, 'pseudo-kit-context.json'), 'utf8'));
const PKG     = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

// ── Helpers ───────────────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function layerBadge(layer) {
  const colors = { atoms: '#3b82f6', molecules: '#8b5cf6', organisms: '#10b981' };
  const bg = colors[layer] || '#64748b';
  return `<span style="background:${bg};color:#fff;font-size:.65rem;font-weight:600;padding:.1rem .45rem;border-radius:.25rem;vertical-align:middle;text-transform:uppercase;letter-spacing:.05em">${layer}</span>`;
}

function propsTable(props) {
  if (!props || props.length === 0) return '<p style="color:#718096;font-size:.8rem;font-style:italic">No props.</p>';
  const rows = props.map(p => `
        <tr>
          <td><code>${escHtml(p.name)}</code></td>
          <td style="color:#7c3aed">${escHtml(p.type)}</td>
          <td>${p.required ? '<span style="color:#ef4444;font-weight:600">required</span>' : `<em style="color:#718096">${p.default !== undefined ? escHtml(p.default) : '—'}</em>`}</td>
          <td>${escHtml(p.description || '')}</td>
        </tr>`).join('');
  return `
      <table class="doc-table">
        <thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
        <tbody>${rows}
        </tbody>
      </table>`;
}

function slotsTable(slots) {
  if (!slots || slots.length === 0) return '<p style="color:#718096;font-size:.8rem;font-style:italic">No slots.</p>';
  const rows = slots.map(s => `
        <tr>
          <td><code>${escHtml(s.name)}</code></td>
          <td>${escHtml(s.description || '')}</td>
        </tr>`).join('');
  return `
      <table class="doc-table">
        <thead><tr><th>Slot</th><th>Description</th></tr></thead>
        <tbody>${rows}
        </tbody>
      </table>`;
}

function componentSection(comp) {
  const anchor = comp.name;
  return `
    <section class="doc-component" id="${escHtml(anchor)}">
      <h3>${layerBadge(comp.layer)} <code>&lt;${escHtml(comp.name)}&gt;</code></h3>
      <div class="doc-tabs" role="tablist" aria-label="${escHtml(comp.name)} API tabs">
        <button class="doc-tab doc-tab--active" data-target="${escHtml(anchor)}-props" aria-selected="true" role="tab">Props</button>
        <button class="doc-tab" data-target="${escHtml(anchor)}-slots" aria-selected="false" role="tab">Slots</button>
        <button class="doc-tab" data-target="${escHtml(anchor)}-example" aria-selected="false" role="tab">Template</button>
      </div>
      <div id="${escHtml(anchor)}-props" class="doc-tab-panel">
        ${propsTable(comp.props)}
      </div>
      <div id="${escHtml(anchor)}-slots" class="doc-tab-panel" hidden>
        ${slotsTable(comp.slots)}
      </div>
      <div id="${escHtml(anchor)}-example" class="doc-tab-panel" hidden>
        <pre class="doc-pre"><code>${escHtml(`<${comp.name}>\n  …\n</${comp.name}>`)}</code></pre>
      </div>
    </section>`;
}

function layerSection(layer, title) {
  const comps = CONTEXT.components.filter(c => c.layer === layer);
  // De-duplicate by name (breadcrumb.html + breadcrumb-pk.html both exist)
  const seen = new Set();
  const unique = comps.filter(c => {
    if (seen.has(c.name)) return false;
    seen.add(c.name);
    return true;
  });
  return `
  <section id="${layer}">
    <h2>${title} <span style="color:#a0aec0;font-size:.875rem">(${unique.length})</span></h2>
    ${unique.map(componentSection).join('\n')}
  </section>`;
}

// ── Nav items ─────────────────────────────────────────────────────────────────

function navSection(layer) {
  const comps = CONTEXT.components.filter(c => c.layer === layer);
  const seen = new Set();
  return comps.filter(c => {
    if (seen.has(c.name)) return false;
    seen.add(c.name);
    return true;
  }).map(c => `<li><a href="#${c.name}" class="nav-link">&lt;${c.name}&gt;</a></li>`).join('\n        ');
}

// ── HTML document ─────────────────────────────────────────────────────────────

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>pseudo-html-kit v${PKG.version} — Documentation</title>
  <style>
    :root {
      --color-primary: #1d4ed8;
      --color-primary-contrast: #ffffff;
      --color-primary-hover: #2563eb;
      --color-surface-1: #ffffff;
      --color-surface-2: #f1f5f9;
      --color-surface-3: #e2e8f0;
      --color-text: #1a202c;
      --color-text-muted: #4a5568;
      --color-border: #cbd5e0;
      --color-danger: #ef4444;
      --color-danger-hover: #dc2626;
      --color-success: #10b981;
      --color-info: #3b82f6;
      --color-info-light: #eff6ff;
      --color-info-dark: #1e40af;
      --color-success-light: #f0fdf4;
      --color-success-dark: #15803d;
      --color-warning: #f59e0b;
      --color-warning-light: #fffbeb;
      --color-warning-dark: #92400e;
      --color-danger-light: #fef2f2;
      --color-danger-dark: #991b1b;
      --font-sans: system-ui, -apple-system, sans-serif;
      --font-mono: 'Fira Code', 'Cascadia Code', monospace;
      --radius-sm: .25rem;
      --radius-md: .375rem;
      --radius-full: 9999px;
      --text-xs: .75rem;
      --text-sm: .875rem;
      --text-base: 1rem;
      --shadow-sm: 0 1px 2px rgba(0,0,0,.05);
      --shadow-md: 0 4px 12px rgba(0,0,0,.1);
      --z-modal: 500;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--font-sans);
      font-size: 16px;
      background: var(--color-surface-2);
      color: var(--color-text);
      display: flex;
      min-height: 100vh;
    }

    /* ── Sidebar nav ──────────────────────────────────────────────────────── */
    .doc-sidebar {
      width: 240px;
      min-height: 100vh;
      background: #0f172a;
      color: #94a3b8;
      padding: 1.5rem 0;
      position: sticky;
      top: 0;
      overflow-y: auto;
      flex-shrink: 0;
    }
    .doc-sidebar-brand {
      padding: 0 1.25rem 1.25rem;
      border-bottom: 1px solid #1e293b;
      margin-bottom: 1rem;
    }
    .doc-sidebar-brand h1 {
      color: #f8fafc;
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: -.01em;
    }
    .doc-sidebar-brand .version {
      font-size: .7rem;
      color: #475569;
      margin-top: .125rem;
    }
    .doc-sidebar-section { padding: .5rem 1.25rem .25rem; }
    .doc-sidebar-section h2 {
      font-size: .625rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .1em;
      color: #475569;
      margin-bottom: .375rem;
    }
    .doc-sidebar ul { list-style: none; }
    .nav-link {
      display: block;
      font-size: .75rem;
      color: #94a3b8;
      padding: .2rem .5rem;
      border-radius: .25rem;
      text-decoration: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .nav-link:hover { color: #f8fafc; background: #1e293b; }
    .nav-link-section {
      display: block;
      font-size: .8125rem;
      color: #94a3b8;
      padding: .3rem .5rem;
      border-radius: .25rem;
      text-decoration: none;
    }
    .nav-link-section:hover { color: #f8fafc; background: #1e293b; }

    /* ── Main content ─────────────────────────────────────────────────────── */
    .doc-main {
      flex: 1;
      padding: 2rem 2.5rem;
      max-width: 960px;
    }

    .doc-hero {
      background: linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%);
      color: #fff;
      border-radius: .75rem;
      padding: 2.5rem;
      margin-bottom: 2.5rem;
    }
    .doc-hero h1 { font-size: 1.875rem; font-weight: 800; margin-bottom: .5rem; }
    .doc-hero p  { opacity: .85; font-size: 1.0625rem; max-width: 56ch; }
    .doc-hero .badge-row { margin-top: 1.25rem; display: flex; gap: .5rem; flex-wrap: wrap; }
    .doc-badge {
      background: rgba(255,255,255,.15);
      border-radius: 99px;
      padding: .25rem .75rem;
      font-size: .75rem;
      font-weight: 600;
      backdrop-filter: blur(4px);
    }

    section { margin-bottom: 3rem; }
    section > h2 {
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--color-text);
      padding-bottom: .625rem;
      border-bottom: 2px solid var(--color-border);
      margin-bottom: 1.5rem;
    }

    /* ── Code blocks ──────────────────────────────────────────────────────── */
    .doc-pre {
      background: #0f172a;
      color: #e2e8f0;
      border-radius: .5rem;
      padding: 1rem 1.25rem;
      overflow-x: auto;
      font-family: var(--font-mono);
      font-size: .8125rem;
      line-height: 1.7;
    }
    code { font-family: var(--font-mono); font-size: .875em; }
    :not(.doc-pre) > code {
      background: var(--color-surface-3);
      border-radius: .2rem;
      padding: .1rem .35rem;
      color: #7c3aed;
    }

    /* ── Component sections ───────────────────────────────────────────────── */
    .doc-component {
      background: var(--color-surface-1);
      border: 1px solid var(--color-border);
      border-radius: .5rem;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1rem;
    }
    .doc-component h3 {
      font-size: .9375rem;
      font-weight: 600;
      margin-bottom: .75rem;
      display: flex;
      align-items: center;
      gap: .5rem;
      flex-wrap: wrap;
    }

    /* ── Mini tabs (props / slots / template) ─────────────────────────────── */
    .doc-tabs { display: flex; gap: .25rem; margin-bottom: .75rem; }
    .doc-tab {
      padding: .25rem .75rem;
      border-radius: .25rem;
      border: 1px solid var(--color-border);
      background: var(--color-surface-2);
      color: var(--color-text-muted);
      font-size: .75rem;
      font-weight: 500;
      cursor: pointer;
    }
    .doc-tab--active, .doc-tab:hover { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
    .doc-tab-panel[hidden] { display: none; }

    /* ── Tables ───────────────────────────────────────────────────────────── */
    .doc-table {
      width: 100%;
      border-collapse: collapse;
      font-size: .8125rem;
    }
    .doc-table th {
      text-align: left;
      padding: .375rem .625rem;
      background: var(--color-surface-2);
      border: 1px solid var(--color-border);
      font-weight: 600;
      color: var(--color-text-muted);
      font-size: .75rem;
    }
    .doc-table td {
      padding: .375rem .625rem;
      border: 1px solid var(--color-border);
      vertical-align: top;
    }
    .doc-table tr:nth-child(even) td { background: var(--color-surface-2); }

    /* ── Getting started highlight boxes ─────────────────────────────────── */
    .doc-box {
      background: var(--color-surface-1);
      border: 1px solid var(--color-border);
      border-radius: .5rem;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.25rem;
    }
    .doc-box h3 { font-size: 1rem; font-weight: 600; margin-bottom: .75rem; }
    .doc-box p, .doc-box li { font-size: .9375rem; line-height: 1.65; color: #374151; margin-bottom: .5rem; }
    .doc-box ul { padding-left: 1.25rem; }

    .doc-callout {
      border-left: 4px solid var(--color-primary);
      background: var(--color-info-light);
      color: var(--color-info-dark);
      border-radius: 0 .375rem .375rem 0;
      padding: .875rem 1rem;
      font-size: .875rem;
      margin: 1rem 0;
    }

    /* ── Footer ───────────────────────────────────────────────────────────── */
    .doc-footer {
      margin-top: 4rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--color-border);
      color: var(--color-text-muted);
      font-size: .8125rem;
      text-align: center;
    }
    .doc-footer a { color: var(--color-primary); text-decoration: none; }

    @media (max-width: 768px) {
      body { flex-direction: column; }
      .doc-sidebar { width: 100%; min-height: auto; position: static; }
      .doc-main { padding: 1rem; }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { transition: none !important; animation: none !important; }
    }
  </style>
</head>
<body>

<!-- ── Sidebar ──────────────────────────────────────────────────────────────── -->
<nav class="doc-sidebar" aria-label="Documentation navigation">
  <div class="doc-sidebar-brand">
    <h1>pseudo-html-kit</h1>
    <div class="version">v${PKG.version} — Documentation</div>
  </div>

  <div class="doc-sidebar-section">
    <h2>Guide</h2>
    <ul>
      <li><a href="#getting-started" class="nav-link-section">Getting Started</a></li>
      <li><a href="#framework-adapters" class="nav-link-section">Framework Adapters</a></li>
      <li><a href="#cli" class="nav-link-section">CLI</a></li>
      <li><a href="#accessibility" class="nav-link-section">Accessibility</a></li>
    </ul>
  </div>

  <div class="doc-sidebar-section">
    <h2>Atoms <span style="color:#3b82f6">${CONTEXT.components.filter(c => { const s = new Set(); return c.layer === 'atoms' && !s.has(c.name) && s.add(c.name); }).length}</span></h2>
    <ul>
      ${navSection('atoms')}
    </ul>
  </div>

  <div class="doc-sidebar-section">
    <h2>Molecules <span style="color:#8b5cf6">${[...new Set(CONTEXT.components.filter(c => c.layer === 'molecules').map(c => c.name))].length}</span></h2>
    <ul>
      ${navSection('molecules')}
    </ul>
  </div>

  <div class="doc-sidebar-section">
    <h2>Organisms <span style="color:#10b981">${[...new Set(CONTEXT.components.filter(c => c.layer === 'organisms').map(c => c.name))].length}</span></h2>
    <ul>
      ${navSection('organisms')}
    </ul>
  </div>
</nav>

<!-- ── Main ─────────────────────────────────────────────────────────────────── -->
<main class="doc-main">

  <div class="doc-hero">
    <h1>pseudo-html-kit</h1>
    <p>Vanilla HTML component system — no build step, no framework. Drop-in custom elements with scoped CSS and progressive enhancement.</p>
    <div class="badge-row">
      <span class="doc-badge">v${PKG.version}</span>
      <span class="doc-badge">WCAG 2.2 AA ✓</span>
      <span class="doc-badge">${CONTEXT.total} Components</span>
      <span class="doc-badge">7.7 KB gzip</span>
      <span class="doc-badge">Zero dependencies</span>
    </div>
  </div>

  <!-- ── Getting Started ────────────────────────────────────────────────────── -->
  <section id="getting-started">
    <h2>Getting Started</h2>

    <div class="doc-box">
      <h3>Option 1 — CDN (recommended for prototyping)</h3>
      <p>Add the client script and register your components:</p>
      <pre class="doc-pre"><code>&lt;!-- 1. Load the runtime --&gt;
&lt;script type="module"&gt;
  import PseudoKit from 'https://cdn.jsdelivr.net/npm/pseudo-html-kit/src/client/pseudo-kit-client.js';

  // 2. Register components
  PseudoKit.register({ name: 'button-pk', src: '/components/button-pk.html' });
  PseudoKit.register({ name: 'input-pk',  src: '/components/input-pk.html' });

  // 3. Stamp the page
  await PseudoKit.init();
&lt;/script&gt;

&lt;!-- 4. Use them --&gt;
&lt;button-pk variant="primary"&gt;Save&lt;/button-pk&gt;
&lt;input-pk name="email" type="email" placeholder="Email"&gt;&lt;/input-pk&gt;</code></pre>
    </div>

    <div class="doc-box">
      <h3>Option 2 — npm</h3>
      <pre class="doc-pre"><code>npm install pseudo-html-kit
# or
pnpm add pseudo-html-kit</code></pre>
      <pre class="doc-pre"><code>import PseudoKit from 'pseudo-html-kit';

PseudoKit.register({ name: 'button-pk', src: new URL('./button-pk.html', import.meta.url).href });
await PseudoKit.init();</code></pre>
    </div>

    <div class="doc-box">
      <h3>How it works</h3>
      <ul>
        <li>Each component is a plain <code>.html</code> file with <code>&lt;template&gt;</code>, <code>&lt;style&gt;</code>, and optional <code>&lt;script&gt;</code> sections.</li>
        <li><code>PseudoKit.register()</code> fetches and caches the component definition.</li>
        <li><code>PseudoKit.init()</code> scans the DOM, stamps matching elements, and runs scripts — no Shadow DOM.</li>
        <li>Props are HTML attributes on the host element. Slots are named <code>slot=""</code> children.</li>
        <li>CSS uses <code>@scope</code> for isolation — no class name collisions.</li>
      </ul>
      <div class="doc-callout">
        <strong>Progressive enhancement:</strong> host elements render as plain custom elements before PseudoKit resolves, so they don't block render. The <code>data-pk-resolved</code> attribute signals when stamping is complete.
      </div>
    </div>

    <div class="doc-box">
      <h3>Design tokens</h3>
      <p>All components consume CSS custom properties for theming. Override at <code>:root</code> or on any ancestor:</p>
      <pre class="doc-pre"><code>:root {
  --color-primary: #6d28d9;
  --color-primary-contrast: #fff;
  --font-sans: 'Inter', system-ui, sans-serif;
  --radius-md: .5rem;
}</code></pre>
    </div>
  </section>

  <!-- ── Atoms ──────────────────────────────────────────────────────────────── -->
  ${layerSection('atoms', 'Atoms')}

  <!-- ── Molecules ──────────────────────────────────────────────────────────── -->
  ${layerSection('molecules', 'Molecules')}

  <!-- ── Organisms ──────────────────────────────────────────────────────────── -->
  ${layerSection('organisms', 'Organisms')}

  <!-- ── Framework Adapters ─────────────────────────────────────────────────── -->
  <section id="framework-adapters">
    <h2>Framework Adapters</h2>

    <div class="doc-box">
      <h3>React 18+ — <code>pseudo-kit-react</code></h3>
      <p>Install the adapter:</p>
      <pre class="doc-pre"><code>npm install pseudo-kit-react</code></pre>
      <p>Use hooks inside your components:</p>
      <pre class="doc-pre"><code>import { useComponent, PseudoKitProvider } from 'pseudo-kit-react';

// Provider approach — loads multiple components once
function App() {
  return (
    &lt;PseudoKitProvider components={['/button-pk.html', '/input-pk.html']}&gt;
      &lt;MyPage /&gt;
    &lt;/PseudoKitProvider&gt;
  );
}

// Hook approach — load on demand
function MyButton() {
  const { ready } = useComponent('/button-pk.html');
  if (!ready) return &lt;span&gt;Loading…&lt;/span&gt;;
  return &lt;button-pk variant="primary"&gt;Click me&lt;/button-pk&gt;;
}</code></pre>

      <p>SSR / server rendering:</p>
      <pre class="doc-pre"><code>import { renderComponent } from 'pseudo-kit-react/ssr';

// In your server route / RSC
const html = await renderComponent('/path/to/button-pk.html', {
  variant: 'primary',
  label: 'Save',
});
// → &lt;button-pk variant="primary" data-pk-ssr="button-pk" data-pk-resolved&gt;…&lt;/button-pk&gt;</code></pre>
    </div>

    <div class="doc-box">
      <h3>Svelte 5 — <code>pseudo-kit-svelte</code></h3>
      <p>Install the adapter:</p>
      <pre class="doc-pre"><code>npm install pseudo-kit-svelte</code></pre>
      <p>Use in a Svelte component:</p>
      <pre class="doc-pre"><code>&lt;script&gt;
  import { pseudoKit } from 'pseudo-kit-svelte';
  import { onMount } from 'svelte';

  onMount(() => {
    const { ready } = pseudoKit(['/button-pk.html', '/card-pk.html']);
    ready.then(() => console.log('PseudoKit ready'));
  });
&lt;/script&gt;

&lt;button-pk variant="primary"&gt;Hello Svelte&lt;/button-pk&gt;</code></pre>
    </div>
  </section>

  <!-- ── CLI ────────────────────────────────────────────────────────────────── -->
  <section id="cli">
    <h2>CLI</h2>

    <div class="doc-box">
      <h3><code>pseudo-kit init</code></h3>
      <p>Scaffold a new project with a ready-to-run structure:</p>
      <pre class="doc-pre"><code># One-shot scaffold (no install needed)
npx pseudo-kit init my-app

# Or scaffold into current directory
npx pseudo-kit init .</code></pre>
      <p>Generated structure:</p>
      <pre class="doc-pre"><code>my-app/
├── index.html          ← entry point (loads PseudoKit)
├── demo.html           ← sample component demo
├── components/         ← put your .html component files here
└── package.json        ← npm/pnpm project scaffold</code></pre>
      <div class="doc-callout">
        The scaffold is idempotent — running it on an existing project only adds missing files.
      </div>
    </div>
  </section>

  <!-- ── Accessibility ──────────────────────────────────────────────────────── -->
  <section id="accessibility">
    <h2>Accessibility</h2>

    <div class="doc-box">
      <h3>WCAG 2.2 AA Compliance</h3>
      <p>pseudo-html-kit v${PKG.version} is <strong>WCAG 2.2 Level AA compliant</strong> after the S18-01 and S19 accessibility sprints.</p>
      <ul>
        <li>✅ All interactive components use <code>:focus-visible</code> for keyboard-only focus rings</li>
        <li>✅ All animated components respect <code>prefers-reduced-motion</code></li>
        <li>✅ 0 color-contrast violations (WCAG 1.4.3 AA) with default design tokens</li>
        <li>✅ Full ARIA landmark and role coverage (<code>&lt;nav&gt;</code>, <code>&lt;dialog&gt;</code>, <code>role="tablist"</code>, <code>role="status"</code>)</li>
        <li>✅ Keyboard navigation: Tab, Arrow keys, Escape, Enter, Space — all standard patterns implemented</li>
      </ul>
      <div class="doc-callout">
        <strong>Note:</strong> Page-level skip links, <code>lang</code> attribute, and <code>&lt;main&gt;</code> landmarks are host-page responsibilities — not part of the component library.
      </div>
    </div>

    <div class="doc-box">
      <h3>Running the audit locally</h3>
      <pre class="doc-pre"><code># axe-core Playwright a11y audit (Chromium)
pnpm test:a11y

# Bundle size check
pnpm check:bundle</code></pre>
    </div>
  </section>

  <footer class="doc-footer">
    <p>pseudo-html-kit v${PKG.version} &nbsp;·&nbsp; ${CONTEXT.total} components &nbsp;·&nbsp; WCAG 2.2 AA &nbsp;·&nbsp; <a href="https://github.com/pseudo-html-kit/pseudo-html-kit">GitHub</a></p>
    <p style="margin-top:.25rem">Generated by <code>pnpm generate:docs</code> on ${new Date().toISOString().slice(0, 10)}</p>
  </footer>

</main>

<!-- ── Mini tab widget (no framework) ───────────────────────────────────────── -->
<script>
document.querySelectorAll('.doc-tabs').forEach(tablist => {
  const tabs   = [...tablist.querySelectorAll('.doc-tab')];
  const panels = tabs.map(t => document.getElementById(t.dataset.target));

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t, j) => {
        const active = i === j;
        t.classList.toggle('doc-tab--active', active);
        t.setAttribute('aria-selected', String(active));
        if (panels[j]) panels[j].hidden = !active;
      });
    });
  });
});
</script>

</body>
</html>`;

// ── Write ─────────────────────────────────────────────────────────────────────

mkdirSync(join(ROOT, 'docs'), { recursive: true });
const outPath = join(ROOT, 'docs', 'index.html');
writeFileSync(outPath, html, 'utf8');

console.log(`✅ docs/index.html written → ${outPath}`);
console.log(`   ${CONTEXT.total} components documented`);
console.log(`   Sections: Getting Started · Atoms · Molecules · Organisms · Framework Adapters · CLI · Accessibility`);
