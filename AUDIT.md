# AUDIT — pseudo-kit · pseudo-assets

> Réalisé le 2026-03-02
> Portée : tout le dépôt (`src/`, `tests/`, `bmad/`, `package.json`, `README.md`)
> Méthode : lecture complète du code source, croisement docs/code/tests, analyse des chemins et conventions

---

## Résumé exécutif

Le projet est **bien structuré et la logique métier est solide**. Les tests sont nombreux et couvrent les cas importants. Cependant, **un bug critique bloque l'utilisation en navigateur** (chemin d'import relatif cassé dans le client), et plusieurs incohérences de nommage, de documentation et de configuration s'accumulent. Aucun problème de sécurité rédhibitoire, mais la confiance de `new Function()` mentionnée nulle part dans la doc publique mérite attention.

---

## CRITIQUE — Bloquant production

### BUG-01 · Chemin d'import relatif cassé dans le client navigateur

**Fichier :** `src/client/pseudo-kit-client.js` lignes 33–39
**Symptôme :** Le client importe depuis `'./shared/registry-shared.js'` et `'./shared/state-shared.js'`. Or le répertoire `src/client/shared/` **n'existe pas**. Le bon chemin est `'../shared/'`.

```js
// ❌ ACTUEL — résout vers src/client/shared/ (inexistant)
import { register_shared, … } from './shared/registry-shared.js';
import { deserializeFromTag_shared, … } from './shared/state-shared.js';

// ✅ CORRECT
import { register_shared, … } from '../shared/registry-shared.js';
import { deserializeFromTag_shared, … } from '../shared/state-shared.js';
```

Ce chemin ne fonctionne que si le consommateur utilise le barrel `pseudo-kit/shared` (package exports), mais **tous les imports directs du fichier client échouent en navigateur ESM natif**. Les tests Vitest passent uniquement parce que happy-dom résout les imports différemment via le bundler Vitest qui applique les `package.json#exports`.

---

## MAJEUR — Incohérences fonctionnelles

### BUG-02 · `_findInstances` : `indexOf` sur la première occurrence uniquement

**Fichier :** `src/server/canvas-validator.js` ligne 298

```js
const posInFull = fullHtml.indexOf(m[0]); // ← toujours la PREMIÈRE occurrence globale
const frameId   = _getFrameId(fullHtml, posInFull);
```

Si le même tag apparaît plusieurs fois dans le canvas (ex. `<button />` dans deux frames différentes), `indexOf` retourne **toujours la position de la première occurrence**, ce qui assigne le même `frameId` à toutes les instances. Les erreurs de type "instance in wrong frame" sont donc silencieusement incorrectes.

**Correction attendue :** utiliser la position `m.index` dans `framesHtml` et la recalculer dans `fullHtml` via le décalage connu.

---

### BUG-03 · `input` en double dans `LAYOUT_ELEMENTS` de `canvas-validator.js`

**Fichier :** `src/server/canvas-validator.js` lignes 34–41

```js
const LAYOUT_ELEMENTS = new Set([
  'frame', 'input', …,   // ligne 34
  …, 'button', 'input',  // ligne 37 ← doublon
]);
```

`Set` déduplique silencieusement, donc pas de bug runtime, mais la présence de `button` dans `LAYOUT_ELEMENTS` ici signifie que `<button>` natif ne sera jamais signalé comme "composant non enregistré" — alors que `button` est aussi un composant pseudo-kit légitime selon la SPEC et les demos.

---

### INCOH-01 · Architecture ADR-08 contredit le code réel

**Fichier :** `bmad/artifacts/architecture.md` ligne 140

> « `pseudo-kit-server.renderComponent()` adds `data-pk-hydrated` on the component root element »

**Réalité :** Le serveur **ne pose pas** `data-pk-hydrated`. C'est le **client** qui le fait (`pseudo-kit-client.js` ligne 204), après avoir détecté la présence d'un `<pk-slot>` enfant direct.

Le mécanisme réel est donc : serveur produit `<pk-slot>` → client détecte `<pk-slot>` → client pose `data-pk-hydrated`. L'architecture décrit un raccourci inexact.

---

### INCOH-02 · Versions décalées entre les deux packages

| Package | Version |
|---|---|
| `pseudo-kit` (`package.json`) | `0.1.0` |
| `pseudo-assets` (`src/pseudo-assets/package.json`) | `0.2.0` |

`pseudo-assets` déclare `peerDependencies: { "pseudo-kit": ">=0.1.0" }` — la contrainte est lâche et ne protège pas contre une incompatibilité future. Aucune entrée de changelog ne justifie la différence de version majeure.

---

### INCOH-03 · Tableau de support navigateur contradictoire

`README.md` et `bmad/artifacts/architecture.md` donnent des versions minimales différentes pour `@scope` :

| Source | Chrome | Firefox | Safari |
|---|---|---|---|
| README.md | 105+ | 115+ | 16.4+ |
| architecture.md | 118 | 128 | 17.4+ |

`@scope` est arrivé en **Chrome 118 / Firefox 128 / Safari 17.4**. La version README est **trop basse** et induit en erreur.

---

## MINEUR — Bugs de code localisés

### BUG-04 · `_findBlock` : typedef incomplet (`fullStart`, `fullEnd` non documentés)

**Fichier :** `src/server/canvas-normalize.js` ligne 84

```js
/**
 * @returns {{ content: string, start: number, end: number } | null}  ← incomplet
 */
function _findBlock(html, tag) {
  return {
    content, start, end,
    fullStart: openM.index,  // ← absent du typedef
    fullEnd: end + closeTag.length,  // ← absent du typedef
  };
}
```

`fullStart` et `fullEnd` sont utilisés en interne mais invisibles via JSDoc. Un futur mainteneur refactorant sur la base du typedef raterait ces deux champs.

---

### BUG-05 · `_parseAttrs` : skip du nom de tag fragile

**Fichier :** `src/server/canvas-validator.js` ligne 130

```js
if (key === tagStr.trim().replace(/^</, '').split(/[\s/>]/)[0].toLowerCase()) continue;
```

Cette heuristique pour ignorer le nom du tag dans la liste des attributs est fragile : si un attribut a le même nom que le tag (ex. `<row row="…">`), il sera silencieusement ignoré. La regex d'extraction des attributs devrait exclure le premier token différemment.

---

## NOMMAGE — Incohérences de conventions

### NOM-01 · Préfixe `-pk` dans `pseudo-assets` non documenté dans README principal

Les composants `pseudo-assets` sont enregistrés avec le suffixe `-pk` (`avatar-pk`, `badge-pk`, etc.) via `componentNames`. Ce suffixe **n'est mentionné nulle part dans le README de `pseudo-kit`** ni dans la SPEC. Un consommateur qui lit uniquement le README principal ne saura pas que les composants assets ont ce préfixe.

**Trouvé dans :** `src/pseudo-assets/index.js` commentaire: `/* Maps camelCase keys → '*-pk' HTML tag names */`

---

### NOM-02 · `button-theme` exclu de `LAYOUT_ELEMENTS` du normalizer mais pas du validator

**Fichier normalizer :** `LAYOUT_ELEMENTS` contient `'button-theme'`
**Fichier validator :** `LAYOUT_ELEMENTS` ne contient pas `'button-theme'`

Conséquence : le validator signalera `<button-theme>` comme composant non enregistré dans un canvas, alors que le normalizer le traitera comme élément natif (pas de `role=""` ajouté).

---

### NOM-03 · Fonction privée `_stampTemplate` documentée deux fois

**Fichier :** `src/client/pseudo-kit-client.js` lignes 291–313 puis 374–398

Il y a **deux blocs JSDoc** successifs pour `_stampTemplate` — le premier (lignes 291–313) documente l'ancienne signature avec `@example`, le second (lignes 374–398) documente la version actuelle avec slots nommés. Le premier est un vestige non nettoyé.

---

### NOM-05 · `pk-slot` : direction du préfixe incohérente avec le reste, mais règle respectée

**Fichiers :** `src/client/pseudo-kit-client.js`, `src/server/pseudo-kit-server.js`, `README.md`, SPEC

La règle de nommage est : **ne pas réutiliser un nom de tag HTML existant — l'étendre**. `<slot>` est un élément HTML valide (spec Web Components / Shadow DOM). `pk-slot` respecte donc la règle en étendant `slot` avec un qualificatif `pk`.

Cependant, tous les composants `pseudo-assets` étendent par le **suffixe** (`avatar-pk`, `button-pk`, `footer-pk`…), tandis que `pk-slot` étend par le **préfixe**. L'incohérence de direction n'est pas documentée :

| Tag | Direction | Exemple |
|---|---|---|
| composants pseudo-assets | suffixe `-pk` | `button-pk`, `card-pk` |
| `pk-slot` (runtime interne) | préfixe `pk-` | — |

La distinction est peut-être intentionnelle (signaler visuellement que `pk-slot` est un élément d'infrastructure du runtime, pas un composant consommable), mais elle n'est explicitée nulle part. Un commentaire dans la SPEC suffirait.

---

### NOM-06 · Audit complet des noms de composants pseudo-assets

**Règle auditée :** le suffixe `-pk` est un **séparateur d'espace de noms**. Il délimite le namespace `pseudo-kit` du namespace HTML natif. Pour que cette frontière soit étanche, elle doit être appliquée à **tous les points d'entrée** d'un composant : tag name enregistré, nom de fichier, URL dans `index.js`. Une violation à n'importe lequel de ces points crée une fuite de namespace.

#### Tag names : espace de noms respecté

Tous les 46 tag names enregistrés portent le suffixe `-pk` — aucune collision avec le namespace HTML dans le DOM.

#### Violation : 5 fichiers fuient dans le namespace HTML

Les noms de **fichiers** de ces composants sont des éléments HTML valides, sans suffixe `-pk`. La frontière de namespace est rompue au niveau du système de fichiers et des URLs exportées dans `index.js` :

```
components/atoms/button.html     ← `button` appartient au namespace HTML
components/atoms/input.html      ← idem
components/atoms/label.html      ← idem
components/atoms/textarea.html   ← idem
components/organisms/footer.html ← idem
```

La convention `-pk` devrait être appliquée uniformément :

| Fichier actuel | Fichier attendu | Tag HTML masqué |
|---|---|---|
| `atoms/button.html` | `atoms/button-pk.html` | `<button>` |
| `atoms/input.html` | `atoms/input-pk.html` | `<input>` |
| `atoms/label.html` | `atoms/label-pk.html` | `<label>` |
| `atoms/textarea.html` | `atoms/textarea-pk.html` | `<textarea>` |
| `organisms/footer.html` | `organisms/footer-pk.html` | `<footer>` |

L'impact concret : un développeur qui parcourt `components/atoms/` voit `button.html` et ne sait pas immédiatement si c'est le natif HTML ou le composant pseudo-kit. La convention `-pk` existe précisément pour lever cette ambiguïté — elle doit être appliquée aussi au nom de fichier pour être cohérente. Le renommage implique de mettre à jour `index.js` (les 5 URLs `r('./components/atoms/button.html')` etc.) et les eventuels imports directs.

#### 4 composants dont le premier segment est un élément HTML (non bloquant)

| Fichier | Segment HTML | Tag enregistré | Statut |
|---|---|---|---|
| `form-field.html` | `form` | `form-field-pk` | ✅ le nom complet n'est pas HTML |
| `progress-bar.html` | `progress` | `progress-bar-pk` | ✅ idem |
| `search-bar.html` | `search` | `search-bar-pk` | ✅ idem (`<search>` HTML5 mais peu connu) |
| `menu-item.html` | `menu` | `menu-item-pk` | ✅ idem |

Ces 4 cas ne posent pas de problème : le nom complet du fichier n'est pas un élément HTML.

---

### NOM-04 · `renderComponent_server` vs `renderComponent` : incohérence de nommage interne

Les fonctions privées du serveur utilisent le suffixe `_server` (`renderComponent_server`, `generateCSS_server`, `validate_server`, `resolvePath_server`, `loadComponent_server`). Celles du client utilisent le préfixe `_` sans suffixe (`_stampTemplate`, `_resolveComponent`). C'est cohérent au sein de chaque fichier mais la convention globale n'est pas explicitée — une doc interne manque.

---

## CONFIGURATION — Problèmes de scripts et d'outillage

### CFG-01 · `npm run validate` passe des arguments incorrectement

**Fichier :** `package.json` et `README.md`

La doc README montre :
```bash
npm run validate pseudo-canvas-demo.html
```

Mais npm/pnpm **ignore les arguments positionnels** qui suivent le nom du script sans `--`. La commande correcte est :
```bash
npm run validate -- pseudo-canvas-demo.html
```
(ou `node src/server/canvas-validator.js pseudo-canvas-demo.html` directement)

Idem pour `normalize`.

---

### CFG-02 · `test:all` utilise `npm` dans un projet `pnpm`

**Fichier :** `package.json` ligne 27

```json
"test:all": "npm test && npm run test:client"
```

Le projet utilise `pnpm` (présence de `pnpm-lock.yaml`, `pnpm-workspace.yaml`). Le script devrait utiliser `pnpm` pour la cohérence — et pour que les workspace links soient résolus correctement dans un contexte CI.

---

### CFG-03 · `status.yaml` : YAML invalide (clé `status` dupliquée, indentation incorrecte)

**Fichier :** `bmad/status.yaml` lignes 73–78

```yaml
      - id: sprint-07
        …
        status: done
    status: done           # ← niveau d'indentation incorrect
        title: "pseudo-kit-assets package scaffold"   # ← clé flottante hors liste
```

Le bloc est structurellement cassé : un parser YAML strict rejettera ce fichier. Les champs `PKA-001` à `PKA-007` semblent orphelins d'une liste `deliverables:` jamais ouverte.

---

### CFG-04 · `roadmap.md` référencé comme `pending` mais le fichier n'existe pas

**Fichier :** `bmad/status.yaml` ligne 25

```yaml
- id: roadmap
  file: artifacts/roadmap.md
  status: pending
```

Le fichier `bmad/artifacts/roadmap.md` est absent du dépôt.

---

## DOCUMENTATION — Imprécisions et lacunes

### DOC-01 · README indique `pseudo-canvas-demo.html` à la racine — il est dans `src/pseudo-canvas/`

Le README (lignes 548, 715) montre des commandes sur `pseudo-canvas-demo.html` comme s'il était à la racine du projet. Le fichier réel est à `src/pseudo-canvas/pseudo-canvas-demo.html`. Toutes les commandes d'exemple sont incorrectes pour un utilisateur suivant le README.

---

### DOC-02 · Architecture mentionne `eval()` absent mais `new Function()` est utilisé

**Fichier :** `bmad/artifacts/architecture.md` section Security

> « No `eval()` — component `<script>` blocks are executed as ESM modules in strict scope »

**Réalité :** Les scripts **inline** (non-module) sont exécutés via `new Function()` (`pseudo-kit-client.js` ligne 469). `new Function()` est sémantiquement équivalent à `eval()` sur du code dynamique et soumis aux mêmes risques CSP. La phrase est trompeuse — elle est vraie uniquement pour les scripts de type `module`.

---

### DOC-03 · README ne documente pas le `state` côté serveur

L'API `PseudoKitServer.serializeState()` est documentée, mais la structure de `AppState` (les 9 clés de `DEFAULT_STATE`) n'est exposée nulle part dans le README. Un utilisateur SSR doit fouiller `state-shared.js` pour découvrir les clés disponibles.

---

### DOC-04 · `src/pseudo-assets/README.md` non référencé depuis le README racine

Le package `pseudo-assets` a son propre `README.md`. Le README de `pseudo-kit` n'y renvoie pas. Aucune section "Assets library" ou "pseudo-assets" n'est présente dans le README racine.

---

## POINTS FAIBLES ARCHITECTURAUX (non bloquants)

### ARCH-01 · Pas de gestion de concurrence dans `_resolveTree`

`_resolveTree` itère les composants séquentiellement avec `await`. Si deux mutations DOM ajoutent le même composant simultanément, le second peut passer le guard `el.dataset.pkResolved` avant que le premier ait fini — entraînant un double-stamping. Un `Set` de "en cours de résolution" résoudrait ce cas.

---

### ARCH-02 · `renderLoop` ne supporte pas un deuxième appel (idempotence absente)

Un deuxième appel à `renderLoop('container', newData)` cherche `[loop]` ou `[data-pk-loop-template]`. Après le premier appel, le template est **remplacé** par les clones et n'existe plus. Le second appel échoue silencieusement avec un warning. Ce comportement n'est pas documenté.

---

### ARCH-03 · Regex HTML dans `canvas-validator` et `canvas-normalize` non robuste

L'extraction des blocs (`_extractBlock`, `_findTags`, `_parseAttrs`) repose sur des regex qui ne gèrent pas :
- Les attributs avec `>` dans leur valeur
- Les tags sur plusieurs lignes avec attributs complexes
- Les caractères d'échappement dans les valeurs

Pour un usage éditorial (canvas rédigé à la main), le risque reste faible, mais il est documenté comme une limite non explicite.

---

## Récapitulatif

| ID | Sévérité | Catégorie | Résumé |
|---|---|---|---|
| BUG-01 | 🔴 Critique | Code | Chemin d'import client `./shared/` inexistant |
| BUG-02 | 🟠 Majeur | Code | `indexOf` donne le mauvais frameId pour les instances multiples |
| BUG-03 | 🟠 Majeur | Code | `input` en double + `button` mal classé dans LAYOUT_ELEMENTS |
| INCOH-01 | 🟠 Majeur | Doc/code | ADR-08 contredit le code réel sur le marker SSR |
| INCOH-02 | 🟡 Moyen | Config | Versions décalées 0.1.0 vs 0.2.0 sans changelog |
| INCOH-03 | 🟡 Moyen | Doc | Versions navigateur contradictoires entre README et architecture |
| BUG-04 | 🟡 Moyen | Code | `_findBlock` typedef manque `fullStart`/`fullEnd` |
| BUG-05 | 🟡 Moyen | Code | Skip du nom de tag dans `_parseAttrs` fragile |
| NOM-01 | 🟡 Moyen | Nommage | Préfixe `-pk` des assets non documenté dans README principal |
| NOM-02 | 🟡 Moyen | Nommage | `button-theme` incohérent entre normalizer et validator |
| NOM-03 | 🟢 Faible | Code | Double JSDoc pour `_stampTemplate` |
| NOM-04 | 🟢 Faible | Nommage | Convention suffixe `_server` vs préfixe `_` non explicitée |
| NOM-05 | 🟢 Faible | Nommage | `pk-slot` : direction préfixe vs suffixe non documentée, règle respectée |
| NOM-06 | 🟡 Moyen | Nommage | 5 fichiers portent le nom nu d'un élément HTML (`button.html` → `button-pk.html`, etc.) |
| CFG-01 | 🟠 Majeur | Config | Syntaxe `npm run validate path` incorrecte dans README |
| CFG-02 | 🟡 Moyen | Config | `test:all` utilise `npm` dans un projet `pnpm` |
| CFG-03 | 🟠 Majeur | Config | `status.yaml` YAML invalide |
| CFG-04 | 🟢 Faible | Config | `roadmap.md` référencé mais absent |
| DOC-01 | 🟡 Moyen | Doc | Canvas demo montré à la racine, il est dans `src/pseudo-canvas/` |
| DOC-02 | 🟠 Majeur | Doc | `new Function()` présenté comme `eval()`-free à tort |
| DOC-03 | 🟡 Moyen | Doc | Clés `AppState` non exposées dans le README |
| DOC-04 | 🟢 Faible | Doc | `pseudo-assets` README non référencé depuis la racine |
| ARCH-01 | 🟡 Moyen | Architecture | Pas de guard de concurrence dans `_resolveTree` |
| ARCH-02 | 🟡 Moyen | Architecture | `renderLoop` non idempotent, comportement non documenté |
| ARCH-03 | 🟢 Faible | Architecture | Regex HTML non robuste pour canvases complexes |
