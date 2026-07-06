# Architecture

## Singleton Pattern

The library exports a singleton `Manager` instance. Import it directly from any file — it's always the same initialized instance:

```javascript
import webManager from 'web-manager';

// Same instance everywhere — config, auth, firestore, all ready
webManager.auth().listen((state) => { ... });
webManager.utilities().escapeHTML(untrustedText);
webManager.config.environment; // 'development' or 'production'
```

**Do NOT create new instances** (`new Manager()`). UJM and BXM initialize the singleton — every import gets that same object. Do NOT pass `webManager` through function params or store it in module-level variables — just import it.

## Directory Structure

```
web-manager/
├── src/                       # Source code (ES6+)
│   ├── index.js               # Manager class, initialization, Firebase setup
│   └── modules/               # Feature modules
│       ├── auth.js            # Firebase Auth wrapper
│       ├── bindings.js        # Reactive DOM data binding
│       ├── dom.js             # loadScript, ready utilities
│       ├── firestore.js       # Firestore wrapper with chainable queries
│       ├── notifications.js   # FCM push notifications
│       ├── sentry.js          # Error tracking integration
│       ├── service-worker.js  # SW registration and messaging
│       ├── storage.js         # localStorage/sessionStorage wrapper
│       └── utilities.js       # Helper functions (clipboard, escape, etc.)
├── dist/                      # Transpiled ES5 output (generated)
├── _legacy/                   # Old implementation (reference only, DO NOT MODIFY)
└── test/                      # Mocha tests
```

## Module Dependencies

```
Manager (index.js)
├── Storage (standalone, no deps)
├── Auth → Manager, Bindings, Storage, Firestore
├── Bindings → Manager
├── Firestore → Manager (lazy Firebase import)
├── Notifications → Manager, Storage, Firestore
├── ServiceWorker → Manager
├── Sentry → Manager (dynamic import)
├── DOM utilities (standalone)
└── Utilities (standalone)
```

## Firebase Initialization

`initialize(config)` boots Firebase only when a usable web SDK config resolves:

- `_resolveFirebaseConfig()` checks the flat `firebaseConfig` blob first (canonical shape — BEM/BXM/EM), then the nested `firebase.app.config` (UJM yaml shape). A blob only counts when **at least one value is non-empty** — framework config merges (e.g. UJM's Jekyll chain) inject all-empty-string blobs into Firebase-less sites, and those resolve to `null` (no init, no URL derivation).
- Initialization additionally requires a **non-empty `apiKey`** — the SDK cannot boot without one (it crashes the page with `auth/invalid-api-key`). Configs carrying only `projectId`/`authDomain` still resolve so `getFunctionsUrl()`/`getApiUrl()` can derive URLs, but Firebase itself stays uninitialized.
