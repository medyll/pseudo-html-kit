# REACT — Generating React from Pseudo-HTML

> Always read `SPEC.md` before this document.

---

## Component mapping

| Pseudo-HTML | React |
|---|---|
| Layout element (`element="row"`) | `<div className="row">` |
| Component declaration | Functional component with typed props |
| `props="*"` | TypeScript props interface |
| `data="*"` | `useState` / `useReducer` / store |
| `on="*"` | Callback props (`onAccept`, `onChange`…) |
| `when-visible="*"` | Conditional render: `{condition && <Component />}` |
| `when-hidden="*"` | Inverse conditional or CSS visibility |
| `behavior="*"` | Component body logic or custom hook |
| `loop=""` | `.map()` over data array |
| `types-reference="TypeA TypeB"` | `import { TypeA, TypeB } from '@/types'` |
| `layer="components"` | Scoped CSS module or `@scope` block |

---

## Props interface

Derive the TypeScript interface directly from `props` and `data`:

```tsx
// pseudo-HTML
// <diff-view
//   props="id:string"
//   data="changes:[id:string, type:enum(add|remove|replace), diff:string][]"
//   on="accept:string; reject:string"
//   types-reference="DiffChange"
// />

import { DiffChange } from '@/types'

interface DiffViewProps {
  id: string
  changes: DiffChange[]
  onAccept: (id: string) => void
  onReject: (id: string) => void
}
```

- `props` fields → required props (no `?`) or optional (`?` suffix)
- `data` fields → props passed in or managed via state, depending on architecture
- `on` events → `on` prefix + PascalCase: `accept` → `onAccept`

---

## Conditional rendering

```tsx
// when-visible="tab-suggestions-active"
{tabSuggestionsActive && <SuggestionsPanel />}

// when-hidden="focus-mode is active"
{!focusMode && <AiPanel />}
```

For complex free-text `when-*` expressions, derive the condition from `[spec:state-refs]` in the layout file header.

---

## loop=""

```tsx
// pseudo-HTML
// <chat-bubble role="coherence-alert" data="entity:string; confidence:number" loop="" />

{alerts.map((alert) => (
  <ChatBubble
    key={alert.id}
    role="coherence-alert"
    entity={alert.entity}
    confidence={alert.confidence}
  />
))}
```

---

## Inner content from template

When a component declares inner content in `<template>`, include it in the component implementation — not injected from outside:

```tsx
// template declares: <panel> contains <resize-handle> and <spinner>

function Panel({ id, resizable, children }: PanelProps) {
  return (
    <div className="panel" id={id}>
      {children}
      {resizable && <ResizeHandle />}
      <Spinner when={loading} />
    </div>
  )
}
```

---

## Theme toggle

`button-theme` renders as a `<label>` bound to `#theme-toggle`. In React, the hidden checkbox lives at the app root:

```tsx
// App root
<>
  <input type="checkbox" id="theme-toggle" hidden />
  <Column id="app-root" className="column full-height">
    ...
  </Column>
</>
```

```tsx
// ButtonTheme component
function ButtonTheme() {
  return <label htmlFor="theme-toggle">Toggle theme</label>
}
```

---

## CSS

Use the `<style>` block from the layout file as-is, or import it as a global stylesheet. Component-level styles use `@scope` inside `@layer components`. Do not use CSS Modules — the `@scope` approach is the project convention.

---

## File structure convention

```
src/
  components/
    Panel/
      Panel.tsx
      Panel.css        ← @scope styles for this component
  screens/
    MainScreen.tsx
  types/
    index.ts           ← types referenced via types-reference
```
