# pseudo-canvas

Figma-like viewer and demo apps for pseudo-HTML canvas-based app generation.

## Contents

- **viewer/** — `pseudo-canvas-viewer.html` — Interactive canvas viewer with drag-and-drop, live preview, and asset management
- **demos/** — Demo applications:
  - `pseudo-canvas-demo.html` — Canonical reference canvas (synced from `src/shared/pseudo-canvas-reference.html`)
  - `netflix/` — Netflix-style demo app
  - `amazon/` — Amazon-style demo app
  - `facebook/` — Facebook-style demo app

## Usage

### Importing the Viewer

```js
import { viewer } from 'pseudo-canvas/viewer';
// or
import viewer from 'pseudo-canvas/viewer';
```

### Running a Demo

```bash
npx serve pseudo-canvas/demos/
# Then open: http://localhost:3000/pseudo-canvas-demo.html
```

### Using the Canonical Reference

The canonical pseudo-HTML canvas is stored at `src/shared/pseudo-canvas-reference.html`.

- **Validators** read from this file to check registry completeness
- **LLM code generators** use this as the baseline for app generation
- A synced copy lives in `demos/pseudo-canvas-demo.html` for display

## Sync Strategy

The file `demos/pseudo-canvas-demo.html` is a synced copy of `src/shared/pseudo-canvas-reference.html`.

If you modify `src/shared/pseudo-canvas-reference.html`, you must sync the copy:

```bash
cp src/shared/pseudo-canvas-reference.html src/pseudo-canvas/demos/pseudo-canvas-demo.html
```

The validator will fail if the files are out of sync.

## See Also

- `pseudo-assets` — Component and frame library
- `src/shared/pseudo-canvas-reference.html` — Canonical reference canvas
