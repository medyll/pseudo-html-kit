# pseudo-kit — Project Context

## Project Overview

**pseudo-kit** is a vanilla HTML component system for building layouts using pseudo-HTML descriptors. It requires no build step, no framework, and no dependencies.

### Core Concepts

- **Pseudo-HTML**: HTML files with custom component tags (`<button-pk>`, `<card>`, `<navbar>`) that are resolved at runtime
- **Runtime**: Browser (`pseudo-kit-client.js`) and Node.js server (`pseudo-kit-server.js`) that resolve component tags into full templates
- **Component Library**: `pseudo-kit-assets` with 61 production-ready components (23 atoms, 22 molecules, 16 organisms)
- **Framework Adapters**: React (`pseudo-kit-react`) and Svelte (`pseudo-kit-svelte`) adapters
- **Theme System**: CSS layers with tokens, utilities, and brand skins (Netflix, Amazon, Facebook)

### Key Features

- **7.7 KB gzip** client runtime
- **WCAG 2.2 AA** compliant
- **SSR support** with hydration
- **Reactive state** proxy connecting JS state to CSS via `data-*` attributes
- **Scoped CSS** via `@scope` and `adoptedStyleSheets`
- **Slot system** for content projection (default + named slots)
- **Loop rendering** for list components

## Technology Stack

| Category | Technology |
|----------|------------|
| Runtime | Vanilla JavaScript (ES Modules) |
| Testing | Vitest (unit), Playwright (E2E), Happy DOM |
| Package Manager | pnpm (workspace) |
| Node Version | >=22.0.0 |
| CSS | CSS Layers, @scope, adoptedStyleSheets, light-dark() |
| Browser Support | Chrome 118+, Firefox 128+, Safari 17.4+ |

## Project Structure

```
pseudo-html-kit/
├── src/
│   ├── client/           # Browser runtime (pseudo-kit-client.js)
│   ├── server/           # Node.js runtime (pseudo-kit-server.js)
│   ├── shared/           # Shared registry and state modules
│   ├── pseudo-assets/    # Component library (atoms, molecules, organisms)
│   ├── pseudo-kit-react/ # React adapter package
│   ├── pseudo-kit-svelte/# Svelte adapter package
│   ├── pseudo-canvas/    # Visual design exploration tools
│   └── www/              # Demo site
├── tests/                # Unit, integration, and E2E tests
├── docs/                 # Documentation site
├── bmad/                 # BMAD methodology artifacts
├── scripts/              # Build and utility scripts
└── bin/                  # CLI entry point (pseudo-kit-init.js)
```

## Building and Running

### Installation

```bash
pnpm install
```

### Development Commands

```bash
# Run unit tests (Node.js)
pnpm test

# Run client-side tests (Vitest + Happy DOM)
pnpm test:client
pnpm test:components
pnpm test:viewer

# Run E2E tests (Playwright)
pnpm test:e2e
pnpm test:e2e:ui       # Open Playwright UI
pnpm test:e2e:debug    # Debug mode

# Run accessibility tests
pnpm test:a11y

# Run all tests
pnpm test:all

# Lint code
pnpm lint
pnpm lint:fix

# Serve demo site
pnpm serve
pnpm serve:src

# Generate documentation
pnpm generate:docs
pnpm generate:context

# Check bundle size
pnpm check:bundle
```

### Test Files

| File | Purpose |
|------|---------|
| `tests/registry-shared.test.js` | Shared registry module tests |
| `tests/state-shared.test.js` | State management tests |
| `tests/pseudo-kit-server.test.js` | Server-side rendering tests |
| `tests/canvas-validator.test.js` | Layout validator tests |
| `tests/canvas-normalize.test.js` | Canvas normalization tests |
| `tests/*.client.test.js` | Browser runtime tests |
| `tests/*.e2e.js` | End-to-end Playwright tests |
| `tests/a11y-audit.a11y.e2e.js` | Accessibility audit tests |

## Development Conventions

### Code Style

- **ES Modules** only (`"type": "module"` in package.json)
- **JSDoc** annotations for all public APIs
- **Strict mode** (`'use strict'`) in all files
- **Naming**: `-pk` suffix for component tags to avoid HTML conflicts

### Component File Structure

```html
<template>
  <!-- Component HTML structure -->
</template>

<style>
  @layer components {
    @scope (component-name) {
      /* Scoped CSS rules */
    }
  }
</style>

<script>
  // Component logic (el, state, emit, renderLoop available)
</script>
```

### CSS Architecture

- **Layers**: `theme.reset` → `theme.tokens` → `theme.palette` → `skin` → `components`
- **Scope**: `@scope (tag-name)` for component isolation
- **Motion**: All components include `prefers-reduced-motion` guards
- **Focus**: Use `:focus-visible` for keyboard-only focus rings

### Testing Practices

- **Unit tests**: Vitest with Happy DOM for client-side code
- **E2E tests**: Playwright for cross-browser testing
- **Accessibility**: Automated WCAG 2.2 AA audits via `@axe-core/playwright`
- **Coverage**: 100% thresholds enforced for client code

### Commit Conventions

- Follow conventional commits pattern
- Reference sprint numbers and task IDs
- Include test coverage in commits

## Key APIs

### Client Runtime

```javascript
import PseudoKit from 'pseudo-html-kit';

// Register components
PseudoKit.register({ name: 'my-component', src: '/components/my-component.html' });

// Initialize runtime
PseudoKit.init();

// Render loops
PseudoKit.renderLoop('container-id', dataArray);

// Reactive state
PseudoKit.state.focusMode = true;  // Sets :root[data-focus-mode]

// Event dispatching (inside component scripts)
emit(el, 'event:name', { detail: 'data' });
```

### Server Runtime

```javascript
import { renderComponent, validateLayout } from 'pseudo-html-kit/server';

// Render component to HTML string
const html = await renderComponent('my-component', { props });

// Validate layout file
const result = await validateLayout(layoutPath);
```

### React Adapter

```javascript
import { PseudoKitProvider, useComponent, usePseudoKit } from 'pseudo-kit-react';

// Wrap app
<PseudoKitProvider>
  <App />
</PseudoKitProvider>

// Use in components
const MyComponent = useComponent('my-component');
```

### Svelte Adapter

```svelte
<script>
  import { createPseudoKit } from 'pseudo-kit-svelte';
  const MyComponent = createPseudoKit('my-component');
</script>
```

## Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, exports |
| `vitest.config.js` | Vitest test configuration |
| `playwright.config.js` | E2E test configuration |
| `playwright.a11y.config.js` | Accessibility test configuration |
| `pnpm-workspace.yaml` | Monorepo workspace config |

## Related Documentation

- `README.md` — Full API reference and usage guide
- `CHANGELOG.md` — Version history
- `bmad/` — BMAD methodology artifacts and decisions
- `docs/index.html` — Documentation site source
- `AUTONOMOUS-SESSION-SUMMARY.md` — Session summaries
