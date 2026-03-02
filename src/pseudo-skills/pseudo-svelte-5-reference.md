# PSEUDO-SVELTE-5-REFERENCE

> ⚠️ Read this file before writing ANY Svelte code.
> LLMs frequently regress to Svelte 4 syntax. Every rule here has a non-regression note.
> When a regression is detected during generation, append it to the [Non-regression log] at the bottom.

---

## Mandatory: what changed from Svelte 4

| ❌ Svelte 4 — NEVER USE | ✅ Svelte 5 — ALWAYS USE |
|---|---|
| `export let prop` | `let { prop } = $props()` |
| `let count = 0` (implicit reactive) | `let count = $state(0)` |
| `$: derived = value * 2` | `const derived = $derived(value * 2)` |
| `$: { sideEffect() }` | `$effect(() => { sideEffect() })` |
| `on:click={handler}` | `onclick={handler}` |
| `on:submit`, `on:input`, etc. | `onsubmit`, `oninput`, etc. |
| `createEventDispatcher` | callback props |
| `<slot />` | `{@render children()}` |
| `<slot name="x" />` | named snippets: `{@render x()}` |
| Svelte stores (`writable`, `readable`) | `.svelte.ts` files with `$state` |
| `$store` syntax | direct access via imported state object |
| `beforeUpdate` / `afterUpdate` | `$effect.pre()` / `$effect()` |
| `onMount` (for reactive logic) | `$effect()` |
| `<svelte:component this={C}>` | `{@const C = component}{#if C}<C />{/if}` or dynamic import |

---

## Runes — complete reference

### `$state` — reactive state
```svelte
<script lang="ts">
  let count = $state(0)
  let items = $state<string[]>([])

  // $state.raw — not deeply proxied, mutations must replace the value
  let raw = $state.raw({ x: 0 })
</script>
```

### `$derived` — computed, never use `$:`
```svelte
<script lang="ts">
  const double = $derived(count * 2)

  // $derived.by — for multi-line derivations
  const sorted = $derived.by(() => {
    return [...items].sort((a, b) => a.localeCompare(b))
  })
</script>
```

### `$effect` — side effects, never use `$:` blocks
```svelte
<script lang="ts">
  $effect(() => {
    // runs after DOM updates, browser-only context
    const handler = () => console.log('resized')
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler) // cleanup
  })

  // $effect.pre — runs before DOM updates
  $effect.pre(() => {
    // use for reading DOM before Svelte touches it
  })
</script>
```

### `$props` — never use `export let`
```svelte
<script lang="ts">
  // required prop
  let { label }: { label: string } = $props()

  // optional prop with default
  let { icon = null }: { icon?: string | null } = $props()

  // full interface pattern (preferred)
  interface Props { id: string; label: string; icon?: string }
  let { id, label, icon }: Props = $props()

  // rest props — spread to root element
  let { id, ...rest } = $props()

  // bindable — parent can use bind:value
  let { value = $bindable('') } = $props()
</script>
```

### `$bindable` — two-way binding
```svelte
<!-- Child -->
<script lang="ts">
  let { value = $bindable('') } = $props()
</script>
<input bind:value />

<!-- Parent -->
<Child bind:value={myValue} />
```

---

## Events — property syntax only

```svelte
<!-- ❌ NEVER — Svelte 4 directive syntax -->
<button on:click={handler}>
<form on:submit|preventDefault={handler}>

<!-- ✅ ALWAYS — Svelte 5 property syntax -->
<button onclick={handler}>
<form onsubmit={(e) => { e.preventDefault(); handler(e) }}>
<input oninput={(e) => (value = e.currentTarget.value)}>

<!-- shorthand when prop name matches handler name -->
<button {onclick}>
```

**No `createEventDispatcher`.** Use callback props instead:

```svelte
<!-- ❌ NEVER -->
<script>
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()
  dispatch('accept', { id })
</script>

<!-- ✅ ALWAYS -->
<script lang="ts">
  let { onAccept }: { onAccept: (id: string) => void } = $props()
</script>
<button onclick={() => onAccept(id)}>Accept</button>
```

---

## Snippets — replacing all slot patterns

```svelte
<!-- ❌ NEVER — Svelte 4 slots -->
<slot />
<slot name="header" />
<svelte:fragment slot="header">...</svelte:fragment>

<!-- ✅ ALWAYS — Svelte 5 snippets -->

<!-- Component that accepts children -->
<script lang="ts">
  import type { Snippet } from 'svelte'
  let { children }: { children: Snippet } = $props()
</script>
{@render children()}

<!-- Named snippets -->
<script lang="ts">
  import type { Snippet } from 'svelte'
  let { header, body }: { header: Snippet; body: Snippet } = $props()
</script>
{@render header()}
{@render body()}

<!-- Usage in parent -->
<Panel>
  {#snippet header()}<Toolbar />{/snippet}
  {#snippet body()}<TextZone />{/snippet}
</Panel>

<!-- Snippet with parameters -->
{#snippet item(name: string)}
  <span>{name}</span>
{/snippet}
{@render item('hello')}
```

---

## Shared state — no stores

```ts
// ❌ NEVER — Svelte 4 store
import { writable } from 'svelte/store'
export const count = writable(0)

// ✅ ALWAYS — .svelte.ts module
// $lib/state/app.svelte.ts
export const appState = $state({
  focusMode: false,
  aiRunning: false
})

// usage in any component — no $ prefix, direct access
import { appState } from '$lib/state/app.svelte'
appState.focusMode = true
```

---

## Lifecycle — use effects, not callbacks

```svelte
<!-- ❌ NEVER for reactive logic -->
<script>
  import { onMount, beforeUpdate, afterUpdate } from 'svelte'
  onMount(() => { ... })
  beforeUpdate(() => { ... })
  afterUpdate(() => { ... })
</script>

<!-- ✅ ALWAYS -->
<script lang="ts">
  $effect(() => { /* replaces onMount + afterUpdate */ })
  $effect.pre(() => { /* replaces beforeUpdate */ })
</script>
```

`onMount` is still valid for non-reactive setup (e.g. third-party library init), but not for anything that depends on reactive state.

---

## Non-regression log

> When a regression is detected during generation (wrong syntax used, then corrected),
> append an entry here with the pattern and the fix. This grows the reference over time.

### Format
```
[DATE] [CONTEXT] — what went wrong → what is correct
```

### Entries

*(empty — append here when regressions are detected)*
