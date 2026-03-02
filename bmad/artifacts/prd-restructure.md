# PRD: Restructure pseudo-assets → pseudo-canvas

**Status**: Active  
**Created**: 2026-03-02  
**Phase**: Solutioning → Implementation

---

## Executive Summary

**Problem**: The current `pseudo-stack-assets` npm package conflates two distinct concerns:
- **Asset inventory** (components, frames) — used by applications
- **Development tools** (viewer, demos) — used for canvas prototyping and LLM-driven app development

**Solution**: Split responsibilities:
1. **`pseudo-canvas`** — New workspace package
   - Exports: `pseudo-canvas-viewer.html` (Figma-like viewer for pseudo-HTML canvases)
   - Exports: `demos/` directory (demo apps: Netflix, Amazon, Facebook)
   - Contains: `pseudo-canvas-demo.html` — canonical demo & dev canvas

2. **`pseudo-assets`** — Non-package subdirectory (no `package.json`)
   - Contains: components/, frames/ (asset library)
   - Imported internally by `pseudo-canvas` or applications
   - Remains in `src/pseudo-canvas/assets/`

**Outcome**: Clear architectural separation — the viewer & demos are Figma-like tools for managing pseudo-HTML canvases, not part of the asset library.

---

## Goals

| Goal | Metric | Owner |
|------|--------|-------|
| Clarify package responsibilities | `src/pseudo-canvas/` is dedicated workspace package | Architect |
| Simplify imports | All imports use `pseudo-canvas/assets` or internal paths | Developer |
| Keep viewer discoverable | `pseudo-canvas/viewer` export works as before | All |
| Preserve demo canvas | `pseudo-canvas-demo.html` remains canonical dev file | Developer |
| Zero breaking changes | All tests pass; no API changes for consumers | Tester |

---

## Scope: In / Out

### ✅ In Scope
- Create `src/pseudo-canvas/` workspace package
- Move `viewer/` → `src/pseudo-canvas/viewer/`
- Move `demos/` → `src/pseudo-canvas/demos/` (keep `pseudo-canvas-demo.html` as canonical)
- Move `components/` + `frames/` → `src/pseudo-canvas/assets/`
- Update `pnpm-workspace.yaml` (remove `src/pseudo-assets`, add `src/pseudo-canvas`)
- Update all imports across the codebase
- Update `pseudo-canvas` package.json exports
- Run full test suite validation
- Update documentation

### ❌ Out of Scope
- Publishing strategy changes (CI handles it, no manual `npm publish`)
- Component renaming or modifications
- Viewer feature additions
- Demo content changes

---

## Key Decisions (ADRs)

### ADR-01: `pseudo-canvas` exports only viewer + demos
- **Why**: Separates development tools from asset inventory
- **Impact**: Apps import components from `pseudo-canvas/assets`, not as named exports
- **Alternative considered**: Single unified export — rejected (conflates concerns)

### ADR-02: `pseudo-assets/` becomes non-package subdirectory
- **Why**: Assets are not independently published; they're part of pseudo-canvas
- **Impact**: No `package.json` in `assets/`, no separate npm entry
- **Alternative considered**: Separate `pseudo-assets` package — rejected (unnecessary complexity)

### ADR-03: `pseudo-canvas-reference.html` (not demo) is the canonical source
- **Why**: LLM app generation must always target a protected, unchanging baseline
- **Impact**: The reference is stored in `src/shared/`, with a synced copy in `demos/`
- **Alternative considered**: Single file in demos — rejected (too fragile for reference)

---

## Success Criteria

- [ ] `src/pseudo-canvas/` exists with `package.json`, `viewer/`, `demos/`, `assets/`
- [ ] `pnpm-workspace.yaml` lists both `pseudo-canvas` and `pseudo-assets`
- [ ] `src/shared/pseudo-canvas-reference.html` exists (canonical source)
- [ ] `src/pseudo-canvas/demos/pseudo-canvas-demo.html` is synced copy
- [ ] No breaking changes to imports (pseudo-stack-assets unchanged)
- [ ] `npm test` passes (server/shared tests)
- [ ] `npm run test:client` passes (vitest)
- [ ] `npm run test:coverage` meets 100% threshold
- [ ] Canvas validator reads from reference file correctly
- [ ] README and docs updated

---

## Timeline & Dependencies

| Task | Depends On | Duration |
|------|-----------|----------|
| Confirm architecture | Plan approval | — |
| Create pseudo-canvas package | Plan approval | 30 min |
| Move files (viewer/demos/components/frames) | Create package | 15 min |
| Update imports (4–5 files) | Move files | 20 min |
| Update workspace.yaml + exports | Move files | 10 min |
| Run tests | All above | 10 min |
| Update documentation | Tests pass | 15 min |

**Total**: ~1.5 hours

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Broken imports during transition | Tests fail | Update imports systematically, test incrementally |
| pnpm cache issues | Workspace not recognized | Run `pnpm install` after workspace.yaml change |
| Viewer HTTP paths change | Demo URLs break | Verify HTTP paths in test; document serving strategy |
| Cross-dependencies in demos | Demos fail to load | Review demo imports before moving |

---

## Acceptance Criteria

**Definition of Done**:
1. All files physically moved to new structure
2. All imports resolved (no "cannot find module" errors)
3. All tests pass (server, client, coverage)
4. Viewer export confirmed working (`pseudo-canvas/viewer`)
5. Demo canvas confirmed working (`pseudo-canvas-demo.html`)
6. Documentation updated and accurate

**Sign-off**: All tests green + user confirms no API breakage

---

## Related Artifacts

- **Architecture Doc**: `bmad/artifacts/architecture-restructure.md` (to be created)
- **Sprint**: `bmad/artifacts/sprints/sprint-restructure.md` (to be created)
- **Tech Spec**: Existing `bmad/artifacts/tech-spec.md` (no changes needed)
