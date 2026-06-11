# Web Manager

> **Note for contributors and Claude:** This file is the architectural overview — identity, top-level conventions, and a map to deep references. The **meat** (module APIs, patterns, behavior tables) lives in `docs/<topic>.md`. When extending or adding content, write it in the matching `docs/*.md` file and cross-link from here — do NOT inline it. If a topic doesn't have a doc yet, create one. Goal: keep this file under 250 lines.

## Identity

Web Manager is a modern JavaScript utility library for web applications with Firebase integration. It runs in the browser, in Electron's renderer process, and inside browser extensions (content scripts, popups, background pages). Provides:

- A singleton `Manager` instance exposing authentication, reactive DOM data binding, Firestore, storage, push notifications, error tracking (Sentry), service-worker helpers, and DOM/utility functions
- Lazy Firebase imports to keep consumer bundles small
- Reactive `data-wm-bind` DOM directives wired to auth + usage state
- A `resolveSubscription()` helper unified with backend-manager's `User.resolveSubscription()` so subscription-state logic is identical across frontend and backend

### Consumed by the frontend Manager family

Web Manager is the runtime singleton powering **Ultimate Jekyll Manager (UJM)**, **Browser Extension Manager (BXM)**, and **Electron Manager (EM)**. Each framework initializes the singleton once and exposes it as `manager.webManager`. Any consumer of those frameworks gets a fully-wired web-manager via `import webManager from 'web-manager'`.

## Recommended skills

- **`js:patterns`** — JavaScript/Node.js conventions: file structure, JSDoc, defensive coding (`?.` usage), template literals, `package.json` conventions. Auto-loads when creating new `.js` files or touching JS module structure.

## Quick Start

### For Consuming Projects

Web Manager is consumed indirectly through UJM, BXM, or EM — those frameworks initialize the singleton for you. Inside any consuming code:

```javascript
import webManager from 'web-manager';

webManager.auth().listen({ once: true }, async () => { /* auth settled */ });
webManager.utilities().escapeHTML(untrustedText);
webManager.firestore().doc('users/abc').get();
```

### For Framework Development (This Repository)

1. `npm install` — install Web Manager's own deps
2. `npm run prepare` — build once: copies `src/` → `dist/` via prepare-package (ES5 transpile)
3. `npm start` — watch mode (rebuild on change)
4. `npm test` — run Mocha tests

> **Important:** Web Manager is a library, not an app. There is no `npm run build` / `npm run serve` here. Consume it from inside a UJM / BXM / EM project for end-to-end behavior.

## Architecture

Web Manager exports a singleton `Manager` instance from `src/index.js`. Every `import webManager from 'web-manager'` returns the same already-initialized object — do NOT call `new Manager()`, and do NOT pass `webManager` through function params or module-level variables.

The singleton owns nine feature modules under `src/modules/`: `storage`, `auth`, `bindings`, `firestore`, `notifications`, `service-worker`, `sentry`, `dom`, `utilities`. Firebase modules are dynamically imported to keep the bundle small. See [docs/architecture.md](docs/architecture.md) for the directory structure and module dependency graph, and [docs/modules.md](docs/modules.md) for the API reference of each module.

## File Conventions

- **CommonJS-friendly ES6+** in `src/`. `prepare-package` transpiles to ES5 in `dist/`.
- **`fs-jetpack`** over `fs` / `fs-extra` for any file operations in tests/scripts.
- **No TypeScript** — pure JavaScript library.
- **Template strings** — use backticks for string interpolation.
- **DO NOT modify `_legacy/`** — reference only, frozen for historical context.
- **No backwards compatibility** unless explicitly requested — just change to the new way.
- **Early-return / short-circuit** style throughout — see [docs/code-patterns.md](docs/code-patterns.md) for the full code-pattern checklist (`$`-prefixed DOM vars, operators at start of continuation lines, Firestore path syntax, dynamic imports, config deep-merge, event delegation).

## Doc-update parity

Whenever you make a behavioral change (new module, new method, new pattern, removed feature), update:

1. **`README.md`** — user-facing summary
2. **`CLAUDE.md`** (this file) — architecture overview, one paragraph or cross-link
3. **`docs/<topic>.md`** — the meat. If a topic doesn't have a doc yet, create one.
4. **`CHANGELOG.md`** — if the project keeps one

Don't ship behavioral changes with stale docs. Validate first, then document — write docs that describe shipped reality, not intentions.

## Documentation

Deep references live in `docs/`. Treat docs as a first-class deliverable. **Whenever you make a behavioral change, update both this overview AND the relevant `docs/*.md` deep reference.**

- [docs/architecture.md](docs/architecture.md) — singleton pattern, directory structure, module dependency graph
- [docs/code-patterns.md](docs/code-patterns.md) — early returns, `$`-prefixed DOM vars, logical operator placement, Firestore path syntax, dynamic imports, config deep-merge, event delegation
- [docs/modules.md](docs/modules.md) — full module quick reference (Storage, Auth + `resolveSubscription` + Settler Pattern, Bindings, Firestore, Notifications, ServiceWorker, Sentry, DOM, Utilities)
- [docs/bindings.md](docs/bindings.md) — `data-wm-bind` deep reference: actions, comma syntax, condition operators, state paths, skeleton loaders, root-key update filtering
- [docs/build-system.md](docs/build-system.md) — `prepare-package` ES5 transpile, build commands, package exports
- [docs/testing.md](docs/testing.md) — Mocha test setup
- [docs/common-tasks.md](docs/common-tasks.md) — adding a utility, adding a module, modifying config defaults, payment config (OMEGA SSOT shape), adding a binding action
- [docs/dependencies.md](docs/dependencies.md) — dependencies table + important notes (no TypeScript, prefer fs-jetpack, no backwards-compat requirement, etc.)
