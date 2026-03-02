# Copilot Instructions — pseudo-kit

## Commands

```bash
# Server-side and shared tests (Node built-in test runner — no vitest)
npm test
# Run a single server/shared test file
node --test tests/registry-shared.test.js
node --test tests/state-shared.test.js
node --test tests/pseudo-kit-server.test.js

# Client tests (vitest + happy-dom)
npm run test:client
# Run a single client test file
npx vitest run tests/pseudo-kit-client.client.test.js

# All tests
npm run test:all

# Coverage (client only — 100% threshold enforced)
npm run test:coverage

# Validate a pseudo-HTML canvas file (checks spec conformity + registry completeness)
npm run validate -- path/to/canvas.html
npm run validate:json -- path/to/canvas.html    # JSON output

# Normalize a canvas file (renames obsolete attrs, adds missing component-role/role)
npm run normalize -- path/to/canvas.html        # writes canvas.normalized.html
npm run normalize:write -- path/to/canvas.html  # in-place
```

Node ≥ 22 required. No build step anywhere in the project.

---

## Architecture

pseudo-kit is a **vanilla HTML component system** with no build step, no framework, no `customElements.define()`. Custom tag names (`<panel>`, `<chat-bubble>`) are unknown elements — the browser renders them as inline boxes; CSS `@scope` blocks inside `@layer components` give them their layout and appearance.

### Module map

| Path | Environment | Purpose |
|---|---|---|
| `src/client/pseudo-kit-client.js` | Browser only | Runtime: MutationObserver, template stamping, named/default slot resolution, `<pk-slot>` wrappers, CSS via `CSSStyleSheet` API, script sandboxing, loop rendering, reactive state proxy |
| `src/server/pseudo-kit-server.js` | Node.js only | SSR rendering, CSS generation, layout file validation |
| `src/shared/registry-shared.js` | Both | Component registry — singleton `Map`, no DOM/Node APIs |
| `src/shared/state-shared.js` | Both | State serialization (server → HTML tag) and deserialization (client ← HTML tag) |
| `src/shared/index.js` | Both | Barrel re-export of both shared modules |
| `src/server/canvas-validator.js` | Node.js | Validates pseudo-HTML canvas: spec conformity, registry completeness, inter-frame consistency; produces a `manifestText` for LLM consumption |
| `src/server/canvas-normalize.js` | Node.js | Corrects obsolete attribute names, injects missing `component-role` and `role` attributes |
| `src/pseudo-assets/` | Both | Pre-built component library (66 assets: atoms/molecules/organisms + 20 page frames + 3 demo apps + viewer) |

### Shared registry singleton
`registry-shared.js` holds a module-level `Map`. Both client and server import the same module; in browser ESM the instance is shared across all imports in the page. On the server, call `reset_shared()` in `beforeEach`/`after` test hooks to avoid cross-test contamination.

### SSR ↔ CSR hydration handshake
1. Server renders a component with `renderComponent_server()`, wrapping slot content in `<pk-slot style="display:contents" data-slot-component="..." data-slot-name="...">`.
2. Client detects hydration via `el.querySelector(':scope > pk-slot') !== null` — skips template stamping if true, still runs scripts and loops.
3. State is serialized server-side into `<script id="pk-state" type="application/json">...</script>` (via `serializeToTag_shared()`), injected before `</body>`. Client reads it with `deserializeFromTag_shared()` on init.

### Reactive state proxy
`PseudoKit.state` is a `Proxy` over a plain object. Any write converts the key camelCase → kebab-case and sets/removes a `data-*` attribute on `document.documentElement`. CSS `:has()` selectors react — no JS event bus for UI visibility.

```js
PseudoKit.state.focusMode = true;
// → document.documentElement.setAttribute('data-focus-mode', '')
// CSS: :root[data-focus-mode] panel#ai-panel { display: none; }
```

### CSS management (client)
All component styles are inserted into a single `CSSStyleSheet` adopted on `document` (no `<style>` DOM injection). A `Map<name, ruleIndex>` tracks positions so rules are replaced in-place on re-registration.

---

## pseudo-HTML canvas format

A canvas file is the source of truth for LLM code generation. It has three sections:

```html
<component-registry>
  <!-- Component declarations — defines every component used in frames -->
  <chat-bubble
    props="id:string"
    data="entity:string; confidence:number"
    on="select:string"
    layer="components"
    component-role="Displays a single coherence alert"
  />
  <!-- Layout elements (no component file needed) -->
  <row     element="row"    layer="layout" />
  <column  element="column" layer="layout" />
</component-registry>

<!-- Frames — actual usage of components in screen contexts -->
<frame id="review-screen">
  <column id="coherence-alerts">
    <chat-bubble role="coherence-alert" loop="" />
  </column>
</frame>

<style>
  /* @layer base, layout, components, utils — global styles */
</style>
```

### Attribute model (see `src/pseudo-html/SPEC.md` for full spec)

| Attribute | Context | Meaning |
|---|---|---|
| `props="field:type; ..."` | template | Structural config, parent-set, immutable at runtime |
| `data="field:type; ..."` | template | State the app reads/writes at runtime |
| `on="event:type; ..."` | template | CustomEvents emitted; format `eventName:payloadType` |
| `element="name"` | template | Layout primitive — CSS only, no component file |
| `layer="base\|layout\|components\|utils"` | template | CSS `@layer` target |
| `component-role="..."` | template | Purpose description for LLM context |
| `types-reference="TypeA TypeB"` | template | Space-separated TS types linked to this component |
| `when-visible="..."` / `when-hidden="..."` | instance | Trigger condition (free-text) |
| `behavior="..."` | instance | Runtime logic (free-text) |
| `role="..."` | instance | Purpose of this instance in its frame |
| `loop=""` | instance | Boolean — marks child as repeated template for parent's data |
| `note="..."` | both | LLM/dev annotation — never implemented |

### Type grammar

```
field:type              required
field:type?             optional
type[]                  array
enum(a|b|c)             enum
[field:type, ...]       object
[field:type, ...][]     array of objects
field1:type; field2:type?   semicolon separator
```

### `props` vs `data` decision rule
- If the parent configures it or can disable it → `props`.
- If the app reads or writes it at runtime → `data`.

### Obsolete attributes (auto-fixed by `canvas-normalize`)
`fields` → `data`, `visible-when` → `when-visible`, `hidden-when` → `when-hidden`

---

## Component files

Each `.html` component has exactly three optional sections, always in this order:

```html
<template>
  <!-- structural markup; <slot /> for default, <slot name="x" /> for named -->
  <!-- data-* on <slot> are forwarded to injected children (parent can override) -->
</template>

<style>
  @layer components {
    @scope (chat-bubble) {
      :scope { border-radius: 8px; padding: 8px 12px; }
    }
  }
</style>

<!-- Inline script — evaluated via new Function() in component context -->
<script>
  el.addEventListener('click', () => emit(el, 'select', { id: el.dataset.id }));
</script>

<!-- OR — Module script — dynamically imported; self-registers via import.meta -->
<script type="module" src="./chat-bubble.js"></script>
```

**Inline script sandbox** — available globals: `el` (the component element), `state` (`PseudoKit.state`), `emit`, `renderLoop`, `register`.

**Module script self-registration:**
```js
// components/chat-bubble.js
import PseudoKit from '../pseudo-kit-client.js';
PseudoKit.register(import.meta); // name derived from filename: chat-bubble.js → 'chat-bubble'
```

---

## CSS architecture

Layer order is always declared first: `@layer base, layout, components, utils;`

| Layer | Content |
|---|---|
| `base` | CSS vars (`--color-bg`, `--color-text`, `--color-primary`, `--color-secondary`, `--color-accent`, `--color-complementary`), theme switching |
| `layout` | Layout primitives with dual selectors: `.row, row { display: flex; }` |
| `components` | Per-component `@scope` blocks |
| `utils` | Utility classes |

**Theme toggle — zero JS:** hidden `<input type="checkbox" id="theme-toggle" />` + `:root:has(#theme-toggle:checked) { --color-bg: #fff; ... }`. The `button-theme` component is a `<label for="theme-toggle">`.

**Conditional display — prefer CSS over JS:**
```css
/* when-hidden="focus-mode is active" */
:root[data-focus-mode] panel#ai-panel { display: none; }

/* when-visible="tab-suggestions-active" */
panel#tab-content-suggestions { display: none; }
:root[data-tab-suggestions-active] panel#tab-content-suggestions { display: flex; }
```

**Component scoping:**
```css
@layer components {
  @scope (panel) {
    :scope { display: flex; flex-direction: column; }
    :scope[resizable] { resize: horizontal; }
  }
}
```

---

## Key conventions

### Naming
- Shared (isomorphic) functions: `_shared` suffix — `register_shared`, `lookup_shared`, `serialize_shared`.
- Server-only functions: `_server` suffix — `renderComponent_server`, `validate_server`.
- Private/internal functions: `_` prefix — `_stampTemplate`, `_evalScript`, `_upsertComponentStyle`.
- Component tag names and file names: `kebab-case`.
- Asset library components: `-pk` suffix — `card-pk`, `navbar-pk`, `button-pk`.
- Layout file hierarchy: `screen-*` > `panel-*` > `section-*` > `card-*`.

### `loop=""` — the one JS-required pattern
```js
PseudoKit.renderLoop('coherence-alerts', [
  { entity: 'Aria', confidence: 0.9 },
]);
// Clones the [loop] child, sets item fields as data-* attributes, resolves new components
```

### `on` events → CustomEvent
```js
// on="accept:string; reject:string"
emit(el, 'accept', { id: changeId }); // bubbles:true, composed:true
```

### Registration patterns
```js
// Manual (app bootstrap)
PseudoKit
  .register({ name: 'panel',       src: 'components/panel.html' })
  .register({ name: 'chat-bubble', src: 'components/chat-bubble.html' })
  .init();

// Auto (from inside the component's module file)
PseudoKit.register(import.meta); // name = filename stem
```

---

## Tests

### Server/shared tests (`node:test`)
- Use `node:test` + `node:assert/strict` — no vitest, no describe wrapper needed.
- Files: `tests/*.test.js` (not `*.client.test.js`).
- Always call `reset_shared()` from `registry-shared.js` in `beforeEach` / `after` to clear the registry.
- Server tests create fixtures in `os.tmpdir()` via `node:fs/promises`; clean up in `after()`.

### Client tests (vitest + happy-dom)
- Files: `tests/*.client.test.js` — vitest picks them up via `vitest.config.js`.
- Environment: `happy-dom`. Polyfill `document.adoptedStyleSheets` manually if missing.
- Mock `fetch` with `vi.stubGlobal` to serve fixture component HTML strings.
- DOM must be set up **before** importing `pseudo-kit-client.js` (module-level side effects).
- Reset `reset_shared()` and `vi.restoreAllMocks()` in `beforeEach`.
- Coverage is enforced at 100% for all metrics on `src/client/**`.

---

## pseudo-assets library

Pre-built component library: 17 atoms, 16 molecules, 13 organisms, 20 page frames, 3 demo apps (Netflix/Amazon/Facebook-style), component viewer.

All component tags are suffixed `-pk` to avoid conflicts with native HTML elements.

```js
import { components, componentNames, frames, componentsMeta } from 'pseudo-assets';

// Register one component
PseudoKit.register({ name: componentNames.card, src: components.card }); // → 'card-pk'

// Register all at once
Object.entries(components).forEach(([key, src]) =>
  PseudoKit.register({ name: componentNames[key], src })
);
PseudoKit.init();
```

Demo apps are served with any HTTP server — no build step: `npx serve pseudo-assets/demos/netflix/`.

---

## Code generation from pseudo-HTML

The canvas validator produces a `manifestText` (Markdown) intended as LLM context for component generation:

```js
import { validateCanvas } from './src/server/canvas-validator.js';

const result = await validateCanvas('/path/to/canvas.html');
// result.manifestText → pass to LLM as system context
// result.manifest    → structured array of ManifestEntry objects
// result.errors      → spec violations (block generation)
// result.warnings    → inconsistencies (review before generating)
```

### Generation workflow (all targets)
1. Read `[spec:attribute-model]`, `[spec:type-grammar]`, `[spec:state-refs]` from the file header.
2. Parse `<component-registry>`: `element="*"` → layout primitive (CSS only, no file); no `element` → component to implement.
3. Identify the target: screen (full tree) or component (declaration + all instances for context).
4. Generate following the target reference:
   - **Vanilla / pseudo-kit**: `src/pseudo-skills/PSEUDO-KIT.md`
   - **React**: `src/pseudo-skills/REACT.md`
   - **Svelte 5**: `src/pseudo-skills/SVELTE.md` — **mandatory pre-read**: `src/pseudo-skills/pseudo-svelte-5-reference.md`

### Framework mapping quick reference

| Pseudo-HTML | React | Svelte 5 |
|---|---|---|
| `props="*"` | TypeScript props interface | `let { ... }: Props = $props()` |
| `data="*"` | `useState` / store | `$state()` if internal, `$props()` if passed in |
| `on="event:type"` | `onEvent` callback prop | `onEvent` callback prop |
| `when-visible="..."` | `{condition && <C />}` | `{#if condition}<C />{/if}` |
| `loop=""` | `.map((item) => <C key={item.id} />)` | `{#each items as item (item.id)}<C />{/each}` |
| `<slot />` | `{children}` | `{@render children()}` |
| `<slot name="x" />` | separate named prop | named snippet `{@render x()}` |
| `behavior="..."` | custom hook or component body | `$effect()`, `$derived()` |
| `types-reference="T"` | `import { T } from '@/types'` | `import type { T } from '$lib/types'` |

### Svelte 5 — critical rules (LLMs frequently regress)
Never use: `export let`, `$:`, `on:click`, `createEventDispatcher`, `<slot />`, Svelte stores.  
Always use: `$props()`, `$state()`, `$derived()`, `$effect()`, `onclick={...}`, `{@render children()}`, `.svelte.ts` state files.

When a Svelte 4 pattern is used and corrected during generation, append it to the `[Non-regression log]` section of `src/pseudo-skills/pseudo-svelte-5-reference.md`.

---

## Common mistakes to avoid in canvas files

| Wrong | Correct |
|---|---|
| `fields="..."` | `data="..."` |
| `visible-when="..."` | `when-visible="..."` |
| `hidden-when="..."` | `when-hidden="..."` |
| `props` on layout elements | Layout elements have no props/data/on |
| Logic in `note` | `note` = annotation, `behavior` = logic |
| `<row>`, `<column>` as components | They are layout primitives (`element="row"`) |
| Omitting `role` on instances | Every instance needs a contextual `role` |
| `[brackets]` as identifiers | Comments only — use `id` attributes |
| `<loop>` wrapper tag | Use `loop=""` on the child element itself |
