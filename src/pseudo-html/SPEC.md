# SPEC — Pseudo-HTML Attribute Model & Conventions

## Attribute model

| Attribute | Belongs in | Purpose |
|---|---|---|
| `props="*"` | template + instance | Structural/functional configuration. Template = defaults. Instance = overrides. |
| `data="*"` | template + instance | Business data fields bound to component state. |
| `on="*"` | template | Events emitted. Format: `eventName:payloadType` |
| `when-*="*"` | instance | Triggers the component reacts to. Free-text, read by LLM. |
| `behavior="*"` | instance | Runtime logic that cannot be typed. Free-text. |
| `note="*"` | template + instance | Annotation for LLM/docs. Never rendered or implemented. |
| `element="*"` | template | Native/primitive element. Format: `name` or `name.modifier`. Not a component to create. |
| `layer="*"` | template | CSS `@layer`: `base`, `layout`, `components`, `utils` |
| `loop=""` | instance | Marks an element as repeated for each item in the parent data source. Boolean, empty value. |
| `types-reference="*"` | template | Space-separated TS types linked to this component. |
| `component-role="*"` | template only | Purpose of the component at declaration level. |
| `role="*"` | instance only | Purpose of this instance in context. |

---

## Key distinctions

### props vs data
- `props` = configuration passed by the parent. Does not change at runtime unless re-rendered.
- `data` = state the component exposes to the app. Changes at runtime.
- Rule: if a parent could configure or disable it → `props`. If the app reads/writes it → `data`.

### behavior vs when-*
- `when-*` = a condition or trigger (when does something happen).
- `behavior` = what happens and how (the logic itself).
- They often pair: `when-visible="ai-running"` + `behavior="Shows a spinner animation."`

### note vs behavior
- `note` = for the reader (LLM, dev). Never affects implementation.
- `behavior` = for the implementer. Describes runtime logic.

### template inner content vs instance content
- Inner content in `<template>` = functional parts that belong to the component itself.
- Content in an instance = contextual content injected at the screen level.
- Both coexist: template declares the fixed structure, instances add their own content.

---

## Type grammar

```
Primitives        string, number, boolean, void
Optional          type?              →  label:string?
Required          type               →  id:string   (no qualifier = required)
Enum              enum(a|b|c)        →  type:enum(text|password)
Array             type[]             →  tags:string[]
Object            [field:type, ...]  →  point:[label:string, date:string]
Array of objects  [field:type, ...][]
Separator         ;                  →  props="id:string; label:string?"
```

---

## Layout elements

Layout elements are native HTML primitives, not components to implement. Declared in `<template>` with `element="*"` and no props.

```html
<row     element="row"                layer="layout" />
<column  element="column"             layer="layout" />
<column  element="column.full-height" layer="layout" />
<grid    element="grid"               layer="layout" />
<cell    element="cell"               layer="layout" />
<stack   element="stack"              layer="layout" />
<spacer  element="spacer"             layer="layout" />
```

Dot notation (`column.full-height`) maps to a CSS class modifier.

---

## CSS architecture

The `<style>` block at the bottom of the file is the base style source of truth.

### Layer order
```css
@layer base, layout, components, utils;
```
- `base` — CSS vars, theme colours
- `layout` — layout primitives
- `components` — component styles via `@scope`
- `utils` — utility classes, populated by implementation

### Theme switching — no JavaScript
```css
:root { --color-bg: #0f0f0f; /* dark defaults */ }
:root:has(#theme-toggle:checked) { --color-bg: #ffffff; /* light overrides */ }
```
A hidden `<input type="checkbox" id="theme-toggle" />` drives the theme. `button-theme` is a `<label>` bound to it.

### CSS vars — colour tokens
```css
--color-bg, --color-text
--color-primary, --color-secondary
--color-accent, --color-complementary
```

### Component scoping
```css
@layer components {
  @scope (.panel) {
    :scope { display: flex; flex-direction: column; }
  }
}
```

### Inline style blocks
```html
<panel id="ai-panel" layer="components">
  <style>
    @scope (#ai-panel) {
      :scope { min-width: 300px; }
    }
  </style>
</panel>
```

### Dual selectors for layout elements
```css
.row, row   { display: flex; flex-direction: row; }
```
Makes the pseudo-HTML file directly renderable as a browser wireframe.

---

## loop=""

`loop=""` on a child element means: repeat this element for each item in the parent data source.

```html
<column id="coherence-alerts">
  <chat-bubble role="coherence-alert" data="entity:string; confidence:number" loop="" />
</column>
```

The parent provides the data source. The child with `loop=""` is the repeated template. No wrapper element needed.

---

## Conventions

- `<template>` declares every component before it is used in the body.
- Layout elements have no `props` — the LLM infers HTML/CSS attributes.
- `[bracket-labels]` in comments are navigation anchors only — no semantic value.
- Component IDs use kebab-case. Actions use kebab-case verbs.
- `when-*` and `behavior` values are free-text interpreted by LLM.
- `types-reference` links to existing TS types in the codebase; LLM resolves them.
