# Architecture: pseudo-canvas Restructuring

**Status**: Active  
**Created**: 2026-03-02  
**Phase**: Solutioning

---

## Chosen Approach

**Split responsibilities** between development tools and asset inventory:
- `pseudo-canvas` workspace package exports viewer + demos (Figma-like tools)
- `pseudo-assets` subdirectory contains components + frames (asset inventory, non-published)

This clarifies that the viewer and demos are infrastructure for canvas-based development, not consumer-facing assets.

---

## System Context Diagram

```
┌─────────────────────────────────────────────────────┐
│              pseudo-kit (root)                       │
│  ┌──────────────────────────────────────────────┐   │
│  │  src/client/                                 │   │
│  │  src/server/                                 │   │
│  │  src/shared/                                 │   │
│  │  (core rendering, validation, serialization) │   │
│  └──────────────────────────────────────────────┘   │
│                     △                                │
│                     │ depends on                      │
│  ┌──────────────────┴──────────────────────────┐   │
│  │   src/pseudo-canvas/ (workspace pkg)         │   │
│  │  ┌─────────────────────────────────────┐    │   │
│  │  │ viewer/                             │    │   │
│  │  │ ├─ pseudo-canvas-viewer.html       │    │   │
│  │  │ └─ (Figma-style canvas viewer)      │    │   │
│  │  ├─ demos/                            │    │   │
│  │  │ ├─ pseudo-canvas-demo.html (dev canvas) │   │
│  │  │ ├─ netflix/                        │    │   │
│  │  │ ├─ amazon/                         │    │   │
│  │  │ └─ facebook/                       │    │   │
│  │  ├─ assets/ (non-package)             │    │   │
│  │  │ ├─ components/ (50+)               │    │   │
│  │  │ ├─ frames/ (20+)                   │    │   │
│  │  │ └─ index.js (exports library)      │    │   │
│  │  ├─ index.js (exports viewer + demos) │    │   │
│  │  └─ package.json                      │    │   │
│  └─────────────────────────────────────────┘    │   │
│                                                  │   │
│  ┌─────────────────────────────────────────┐   │   │
│  │ tests/                                  │   │   │
│  │ (all tests updated for new paths)       │   │   │
│  └─────────────────────────────────────────┘   │   │
└─────────────────────────────────────────────────┘
```

---

## Components

### `pseudo-canvas` Workspace Package

**Responsibility**: Provide Figma-like tools + demo apps for pseudo-HTML canvas development

**Structure**:
```
src/pseudo-canvas/
├── package.json (npm workspace package)
├── index.js (exports viewer)
├── viewer/
│   ├── pseudo-canvas-viewer.html
│   └── (Figma-style drag-drop, ?canvas=, ?assets=auto)
├── demos/
│   ├── pseudo-canvas-demo.html (synced copy from src/shared/)
│   ├── netflix/
│   ├── amazon/
│   └── facebook/
└── README.md
```

**Exports**:
```js
// pseudo-canvas/index.js
export { default as viewer } from './viewer/pseudo-canvas-viewer.html';
// Demos accessed via file paths, not imports
```

**Technology**:
- Vanilla HTML + CSS (no build)
- Module scripts (`type="module"`)
- Depends on `pseudo-kit` (shared, server, client)

**Interfaces**:
- **Imports**: `pseudo-kit` (core), `node:fs` (server-side validation)
- **Exports**: Viewer HTML, demo canvas files, component/frame library index

**Scaling**:
- Demos are static HTML files
- Viewer is single-page Figma-like app with `PseudoKit` runtime
- No backend; all processing is client-side or SSR via `pseudo-kit` server

---

### `assets/` Subdirectory (non-package)

**Responsibility**: Inventory of reusable components and frames

**Structure**:
```
assets/
├── components/ (50+ .html files)
│   ├── button-pk.html
│   ├── card-pk.html
│   └── ...
├── frames/ (20+ .html files)
│   ├── screen-home.html
│   ├── panel-sidebar.html
│   └── ...
├── index.js (exports library metadata)
└── (no package.json)
```

**Technology**:
- Vanilla HTML + CSS (no build)
- Each component is self-contained `.html` file with `<style>`, `<template>`, `<script>`
- CSS `@scope` for component scoping
- No npm packaging (not independently published)

**Interfaces**:
- **Imports**: Other components via relative paths (e.g., `../button-pk/button-pk.html`)
- **Exports**: Via `assets/index.js` as URLs for client/server rendering

---

## Architecture Decisions (ADR)

### ADR-01 – `pseudo-canvas` is the workspace package
- **Status**: Accepted
- **Context**: The viewer and demos are development tools specific to pseudo-HTML canvas design; components/frames are the reusable asset inventory
- **Decision**: Create `pseudo-canvas` workspace package to house all three (viewer, demos, assets). Only `viewer` and `demos` are exported as public API; `assets` is internal
- **Consequences**: 
  - Simpler import paths (`pseudo-canvas/assets` vs. separate `pseudo-assets` pkg)
  - All components are non-npm, referenced by file path or metadata
  - Reduces npm surface area

### ADR-02 – Two Workspace Packages: pseudo-canvas + pseudo-assets (REVISED)
- **Status**: Accepted
- **Context**: Viewer/demos and component library are distinct domains with different evolution speeds, publishing cadences, and consumer models. Current `pseudo-assets` is already a workspace package; minimal refactoring to create `pseudo-canvas` for viewer+demos only.
- **Decision**: Keep `pseudo-assets` as a separate workspace package (existing structure with components/frames). Create `pseudo-canvas` as a new workspace package containing **only** viewer + demos. Both are workspace entries in `pnpm-workspace.yaml`.
- **Consequences**:
  - ✓ Clear semantic separation: viewer+demos tools vs. component library
  - ✓ Each can evolve and publish independently
  - ✓ Viewer does not bloat the asset library package
  - ✓ Future-proof: supports independent versioning, team ownership, or further splitting
  - ✗ Requires managing 3 workspace packages (pseudo-kit root + pseudo-canvas + pseudo-assets)
  - ✗ Must avoid circular dependencies between packages
- **Dependency Graph**:
  ```
  pseudo-kit (root)
      ├── workspace: pseudo-canvas (viewer+demos)
      ├── workspace: pseudo-assets (components+frames)
      └── Consumer relationship:
          • viewer may import from pseudo-assets (explicit peer dep)
          • apps import from pseudo-assets for components
  ```

### ADR-03 – `pseudo-canvas-reference.html` is canonical dev source
- **Status**: Accepted (New)
- **Context**: `pseudo-canvas-demo.html` is the foundation for all LLM-driven app generation. It must be preserved as the single source of truth, protected from demo modifications, and accessible to validators and code generators.
- **Decision**: 
  1. Store the canonical canvas as `src/shared/pseudo-canvas-reference.html` (isomorphic location)
  2. Keep a synchronized copy in `src/pseudo-canvas/demos/pseudo-canvas-demo.html` (demo viewer usage)
  3. Tooling (validators, LLM generators) reads from `src/shared/pseudo-canvas-reference.html`
  4. Demos display from `src/pseudo-canvas/demos/pseudo-canvas-demo.html`
- **Consequences**:
  - ✓ Single source of truth, protected from accidental demo changes
  - ✓ Clear separation: reference (shared) vs. usage (demos)
  - ✓ LLM generation always targets the same baseline
  - ✓ Validators check against the canonical source
  - ✗ Must keep two files synchronized (via script or documentation)

### ADR-04 – Imports from `pseudo-stack-assets` remain unchanged (backward compat)
- **Status**: Accepted
- **Context**: `pseudo-assets` remains as `pseudo-stack-assets` npm package. Breaking the package name is unnecessary; assets are already stable.
- **Decision**: Keep imports as `from 'pseudo-stack-assets'` (existing consumers continue to work). Add new export: `from 'pseudo-canvas/viewer'` for the viewer.
- **Consequences**:
  - Zero breaking changes for existing code
  - Semantic clarity: `pseudo-canvas` exports viewer + demos; `pseudo-stack-assets` exports components + frames
  - Two distinct import paths reflect two distinct purposes

---

## Data Flow

### Flow: LLM Generates Canvas
1. User (or LLM) opens `viewer` → `pseudo-canvas-viewer.html`
2. Viewer loads with `?canvas=path/to/canvas.html&assets=auto`
3. Viewer fetches canvas HTML from server or file
4. Viewer calls `PseudoKit.validate()` (from `pseudo-kit` server)
5. Validator checks `<component-registry>` against `assets/components/` + `assets/frames/`
6. Viewer renders canvas live with drag-drop, hot-reload
7. User or LLM modifies canvas, regenerates app code

### Flow: App Uses Components
1. App imports `pseudo-canvas/assets/index.js` (barrel export)
2. App retrieves component URL: `componentNames.button` → `'button-pk'`, `components.button` → `'./assets/components/button-pk/button-pk.html'`
3. App calls `PseudoKit.register({ name: 'button-pk', src: './assets/components/button-pk/button-pk.html' })`
4. Client stamping begins; component renders with scoped CSS

---

## File Movement Plan

### Step 1: Create `src/pseudo-canvas/`
```bash
mkdir -p src/pseudo-canvas/{viewer,demos}
```

### Step 2: Rename and preserve canonical canvas
```bash
# Copy current pseudo-assets/demos/pseudo-canvas-demo.html to shared/
# (if it exists; if not, this becomes the new file to create)
cp src/pseudo-assets/demos/pseudo-canvas-demo.html src/shared/pseudo-canvas-reference.html

# OR if creating from scratch:
touch src/shared/pseudo-canvas-reference.html  # (to be filled with canonical structure)
```

### Step 3: Move viewer and demos
```bash
# Move viewer from pseudo-assets → pseudo-canvas
mv src/pseudo-assets/viewer/* src/pseudo-canvas/viewer/

# Create synced copy of reference in demos
cp src/shared/pseudo-canvas-reference.html src/pseudo-canvas/demos/pseudo-canvas-demo.html

# Move other demos (netflix, amazon, facebook)
mv src/pseudo-assets/demos/netflix src/pseudo-canvas/demos/ 2>/dev/null || true
mv src/pseudo-assets/demos/amazon src/pseudo-canvas/demos/ 2>/dev/null || true
mv src/pseudo-assets/demos/facebook src/pseudo-canvas/demos/ 2>/dev/null || true

# Components & frames REMAIN in src/pseudo-assets/
```

### Step 4: Create pseudo-canvas package.json
```json
{
  "name": "pseudo-canvas",
  "version": "0.1.0",
  "description": "Figma-like viewer and demo apps for pseudo-HTML canvases.",
  "type": "module",
  "license": "MIT",
  "exports": {
    ".":          "./index.js",
    "./viewer":   "./viewer/pseudo-canvas-viewer.html",
    "./demos/*":  "./demos/*"
  },
  "files": [
    "viewer/",
    "demos/",
    "index.js",
    "README.md"
  ],
  "peerDependencies": {
    "pseudo-kit": ">=0.1.0"
  },
  "devDependencies": {
    "pseudo-kit": "workspace:*",
    "pseudo-stack-assets": "workspace:*"
  },
  "keywords": [
    "pseudo-kit",
    "pseudo-canvas",
    "pseudo-html",
    "viewer",
    "no-framework"
  ],
  "engines": {
    "node": ">=22.0.0"
  }
}
```

### Step 5: Create pseudo-canvas index.js
```js
// src/pseudo-canvas/index.js
export { viewer } from './viewer/pseudo-canvas-viewer.html?raw';
```

### Step 6: Update pnpm-workspace.yaml
```yaml
packages:
  - '.'
  - 'src/pseudo-canvas'
  - 'src/pseudo-assets'
```

### Step 7: Clean up old viewer/demos from pseudo-assets
```bash
rm -rf src/pseudo-assets/viewer
rm -rf src/pseudo-assets/demos
```

### Step 8: Create sync mechanism (optional)
Document that `src/shared/pseudo-canvas-reference.html` is the canonical source. Create a task to sync before releases:
```bash
# Sync reference back to demos (if reference is updated)
cp src/shared/pseudo-canvas-reference.html src/pseudo-canvas/demos/pseudo-canvas-demo.html
```

**Result**:
```
src/
├── shared/
│   └── pseudo-canvas-reference.html    (CANONICAL SOURCE)
│
├── pseudo-canvas/                      (NEW workspace package)
│   ├── package.json
│   ├── index.js
│   ├── viewer/
│   │   └── pseudo-canvas-viewer.html
│   └── demos/
│       ├── pseudo-canvas-demo.html     (synced copy of reference)
│       ├── netflix/
│       ├── amazon/
│       └── facebook/
│
└── pseudo-assets/                      (EXISTING workspace package)
    ├── package.json
    ├── index.js
    ├── components/ (50+)
    └── frames/ (20+)
```

---

## Import Changes

No breaking changes! Imports remain stable:

| Code Location | Import | Status | Notes |
|---|---|---|---|
| Tests, validators | `from 'pseudo-stack-assets'` | ✅ Unchanged | Components/frames stay in this package |
| Viewer code | (relative path) | ✅ Unchanged | Demos and viewer are co-located |
| New: viewer export | `from 'pseudo-canvas/viewer'` | ✅ New | Optional export path for viewer |
| Docs, README | References to viewer | 🔄 Update | Update docs to show viewer location |

**Key point**: `pseudo-stack-assets` imports continue to work. The restructuring is backward-compatible.

---

## Deployment & Serving

**Development**:
- Viewer: `npm run dev` serves `src/pseudo-canvas/viewer/pseudo-canvas-viewer.html`
- Demo canvas: `?canvas=/demos/pseudo-canvas-demo.html`
- Assets auto-loaded from `assets/` folder

**Production**:
- Viewer is published as part of `pseudo-canvas` npm package
- Demos are static HTML files served via CDN or HTTP
- Assets are referenced by metadata (no direct file serving from npm)

---

## Testing Strategy

1. **Unit tests** (node --test):
   - Update imports in `tests/pseudo-assets-index.test.js`
   - Test asset inventory loading

2. **Client tests** (vitest):
   - Test `PseudoKit.register()` with new asset paths
   - Test hydration with viewer-rendered components

3. **Integration**:
   - Run canvas validator on demo canvas
   - Serve viewer locally, load demo canvas with `?assets=auto`
   - Verify no 404s

---

## Cross-Cutting Concerns

### Security
- No authentication needed (static files)
- Viewer doesn't execute arbitrary JS (templates are sandboxed)
- Canvas validation prevents invalid component references

### Performance
- Lazy-load assets only when registered
- Viewer uses `CSSStyleSheet` API for scoped styles (no DOM injection)
- No build step = fast iteration

### Documentation
- Update README files in `pseudo-canvas/`
- Update custom instructions in main `pseudo-kit` README
- Document viewer HTTP paths and query parameters

---

## Rollback Plan

If restructuring fails:
1. Restore `src/pseudo-assets/` directory
2. Revert `pnpm-workspace.yaml`
3. Revert all import statements
4. `pnpm install`
5. Run tests to verify rollback

---

## Success Metrics

- ✅ All files moved to new structure
- ✅ `pnpm install` succeeds without errors
- ✅ `npm test` passes (server/shared)
- ✅ `npm run test:client` passes (vitest, 100% coverage)
- ✅ `npm run validate -- src/pseudo-canvas/demos/pseudo-canvas-demo.html` succeeds
- ✅ Viewer loads in browser without console errors
- ✅ Demo canvas renders correctly

