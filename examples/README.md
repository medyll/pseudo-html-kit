# Examples

Runnable demos showing pseudo-kit features from simple to advanced.

## How to run

```bash
# From the project root
npx serve . -p 3000

# Then open in browser:
# http://localhost:3000/examples/01-hello-world.html
```

## Examples

| # | File | Description |
|---|------|-------------|
| 01 | [01-hello-world.html](01-hello-world.html) | Minimal component (template + script) |
| 02 | [02-slots.html](02-slots.html) | Default + named slots |
| 03 | [03-loops.html](03-loops.html) | Render lists from data |
| 04 | [04-state.html](04-state.html) | Reactive state + CSS |
| 05 | [05-ssr.html](05-ssr.html) | Server-side rendering + hydration |

## Component files

Components are in [`components/`](components/):

| File | Used by |
|------|---------|
| [01-greeting.html](components/01-greeting.html) | Example 01 |
| [02-card.html](components/02-card.html) | Example 02 |
| [03-product-tile.html](components/03-product-tile.html) | Example 03 |
| [05-greeting-ssr.html](components/05-greeting-ssr.html) | Example 05 |
