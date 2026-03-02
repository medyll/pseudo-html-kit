# SVELTE — Pseudo-HTML → Svelte 5

> Always read `SPEC.md` before this document.
> Always read `pseudo-svelte-5-reference.md` before writing any Svelte 5 code.
> ⚠️ LLMs frequently regress to Svelte 4 syntax. The reference file is mandatory.

---

## Component mapping

| Pseudo-HTML | Svelte 5 |
|---|---|
| Layout element (`element="row"`) | `<div class="row">` |
| Component declaration | `.svelte` SFC, `<script lang="ts">` |
| `props="*"` | `$props()` with TypeScript interface |
| `data="*"` | `$state()` if internal — `$props()` if passed in |
| `on="*"` | callback props (`onAccept`, `onReject`…) |
| `when-visible="*"` | `{#if condition}` |
| `when-hidden="*"` | `{#if !condition}` |
| `behavior="*"` | `$effect()`, `$derived()`, or inline logic |
| `loop=""` | `{#each items as item (item.id)}` — always keyed |
| `types-reference="TypeA TypeB"` | `import type { TypeA, TypeB } from '$lib/types'` |
| Inner content from template | `{@render children()}` via snippets |
| Shared app state (`[spec:state-refs]`) | `.svelte.ts` file with `$state` |

---

## Props interface

Derive the TypeScript interface directly from `props`, `data`, and `on`:

```svelte
<!--
  pseudo-HTML:
  <diff-view
    props="id:string"
    data="changes:[id:string, type:enum(add|remove|replace), diff:string][]"
    on="accept:string; reject:string"
    types-reference="DiffChange"
  />
-->

<script lang="ts">
  import type { DiffChange } from '$lib/types'

  interface Props {
    id: string
    changes: DiffChange[]
    onAccept: (id: string) => void
    onReject: (id: string) => void
  }

  let { id, changes, onAccept, onReject }: Props = $props()
</script>
```

- `props` fields → `$props()` entries, required unless marked `?`
- `data` fields → `$state()` if internal, `$props()` if passed in
- `on` events → callback props: `accept` → `onAccept`

---

## Inner content from template

When a component declares inner content in `<template>`, it belongs to the component — not injected from outside. Instance-level content comes in via `{@render children()}`:

```svelte
<!-- panel declares: <resize-handle> and <spinner> as inner content -->

<script lang="ts">
  import type { Snippet } from 'svelte'
  let { id, resizable, children }: Props = $props()
  let loading = $state(false)
</script>

<div class="panel" {id}>
  {@render children()}
  {#if resizable}<ResizeHandle />{/if}
  <Spinner visible={loading} />
</div>
```

---

## loop=""

```svelte
<!-- pseudo-HTML: <chat-bubble role="coherence-alert" loop="" /> -->

{#each alerts as alert (alert.id)}
  <ChatBubble role="coherence-alert" entity={alert.entity} confidence={alert.confidence} />
{/each}
```

---

## Shared state — app state-refs

`[spec:state-refs]` from the layout file maps to a `.svelte.ts` state module:

```ts
// $lib/state/app.svelte.ts
export const appState = $state({
  focusMode: false,
  aiRunning: false,
  suggestionsAvailable: false,
  activeTab: 'tab-suggestions' as TabId,
  tabSuggestionsActive: true,
  tabCoherenceActive: false,
  tabStyleActive: false,
  tabHistoryActive: false,
  diffLaunched: false,
  step: 1 as number | '2b' | '2c'
})
```

---

## behavior → Svelte 5 patterns

| behavior | Svelte 5 |
|---|---|
| "Autosaves every 30s" | `$effect(() => { const t = setInterval(save, 30000); return () => clearInterval(t) })` |
| "Triggers ai-spinner on change" | `$effect(() => { if (value) appState.aiRunning = true })` |
| "Hides when focus-mode" | `{#if !appState.focusMode}` |
| "Click opens ai-panel" | `onclick={() => appState.focusMode = false}` |

---

## Theme toggle

No Svelte state needed — CSS `:has()` handles it entirely:

```svelte
<!-- App root -->
<input type="checkbox" id="theme-toggle" hidden />
<div id="app-root" class="column full-height">
  {@render children()}
</div>

<!-- ButtonTheme.svelte -->
<label for="theme-toggle">Toggle theme</label>
```

---

## CSS

Global styles from the layout file → `app.css`. Per-component styles in the `.svelte` `<style>` block:

```svelte
<style>
  @layer components {
    @scope (.panel) {
      :scope { display: flex; flex-direction: column; overflow: hidden; }
    }
  }
</style>
```

---

## File structure

```
src/
  lib/
    components/
      Panel.svelte
      Toolbar.svelte
      DiffView.svelte
      ChatBubble.svelte
      TabBar.svelte
      Overlay.svelte
      Badge.svelte
      Spinner.svelte
      TextZone.svelte
      Timeline.svelte
      ButtonTheme.svelte
      ResizeHandle.svelte
    layouts/
      screen-main.svelte
      screen-onboarding.svelte
      screen-review.svelte
      panel-editor.svelte
      panel-ai.svelte
    state/
      app.svelte.ts
    types/
      index.ts
  routes/
    +page.svelte
  app.css
```
