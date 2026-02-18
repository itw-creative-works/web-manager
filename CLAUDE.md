# Web Manager - AI Agent Guide

This document helps AI agents understand the web-manager codebase for effective contributions.

## Project Overview

**Purpose**: Modern JavaScript utility library for web applications with Firebase integration. Provides authentication, data binding, storage, push notifications, error tracking, and more.

**Target Environments**:
- Web (primary, webpack-optimized)
- Electron (renderer process)
- Chrome/Firefox Extensions (content scripts, popups)

**Version**: 4.0.x | **Node**: >=12 | **License**: CC-BY-4.0

## Architecture

### Singleton Pattern
The library exports a singleton `Manager` instance:
```javascript
const manager = new Manager();
export default manager;
export { Manager };
```

### Directory Structure
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

### Module Dependencies
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

## Key Patterns

### 1. Early Return (Short-Circuit)
Always use early returns instead of nested conditionals:
```javascript
// CORRECT
function doSomething() {
  if (!condition) {
    return;
  }
  // Long code block...
}

// WRONG
function doSomething() {
  if (condition) {
    // Long code block...
  }
}
```

### 2. DOM Element Naming
Prefix DOM element variables with `$`:
```javascript
const $button = document.querySelector('.submit-btn');
const $input = document.getElementById('email');
```

### 3. Logical Operator Formatting
Place operators at the START of continuation lines:
```javascript
// CORRECT
const result = conditionA
  || conditionB
  || conditionC;

// WRONG
const result = conditionA ||
  conditionB ||
  conditionC;
```

### 4. Firestore Path Syntax
Prefer path syntax over collection/doc chaining:
```javascript
// PREFERRED
db.doc('users/userId')

// ALSO SUPPORTED
db.doc('users', 'userId')
```

### 5. Dynamic Imports
Firebase modules are dynamically imported to reduce bundle size:
```javascript
const { initializeApp } = await import('firebase/app');
const { getAuth } = await import('firebase/auth');
```

### 6. Configuration Deep Merge
User config is deep-merged with defaults in `_processConfiguration()`. Only override what you need:
```javascript
// Defaults defined in _processConfiguration()
const defaults = {
  environment: 'production',
  firebase: { app: { enabled: true, config: {} } },
  // ...
};
```

### 7. Event Delegation
Auth UI uses event delegation on document body:
```javascript
document.body.addEventListener('click', (e) => {
  if (e.target.closest('.auth-signout-btn')) {
    // Handle signout
  }
});
```

## Module Quick Reference

### Storage (`storage.js`)
- **Class**: `Storage`
- **Key Methods**: `get(path, default)`, `set(path, value)`, `remove(path)`, `clear()`
- **Session**: Same methods under `.session` namespace
- **Storage Key**: `_manager` in localStorage

### Auth (`auth.js`)
- **Class**: `Auth`
- **Key Methods**: `listen(options, callback)`, `isAuthenticated()`, `getUser()`, `signInWithEmailAndPassword()`, `signOut()`, `getIdToken()`
- **Bindings**: Updates `auth.user` and `auth.account` context

#### Auth Settler Pattern
Auth uses a promise-based settler (`_authReady`) that resolves once Firebase's first `onAuthStateChanged` fires — the moment auth state is guaranteed (authenticated user OR null). This eliminates race conditions.

- **`once` listeners** (`listen({ once: true }, cb)`): Wait for `_authReady`, fire once, done. No cleanup needed.
- **Persistent listeners** (`listen({}, cb)`): Subscribe to `_authStateCallbacks`. If auth already settled when registered, catch up via `_authReady.then()`. Otherwise, `_handleAuthStateChange` handles the initial call naturally.
- **`_hasProcessedStateChange`**: Ensures bindings/storage updates run only once per auth state change across all listeners.
- **Manager owns the promise**: `_authReady` and `_authReadyResolve` live on the Manager instance. The `onAuthStateChanged` callback in `index.js` resolves it on first fire and sets `_firebaseAuthInitialized = true`.

### Bindings (`bindings.js`)
- **Class**: `Bindings`
- **Key Methods**: `update(data)`, `getContext()`, `clear()`
- **HTML Attr**: `data-wm-bind`
- **Actions**: `@text`, `@value`, `@show`, `@hide`, `@attr`, `@style`

### Firestore (`firestore.js`)
- **Class**: `Firestore`
- **Key Methods**: `doc(path)`, `collection(path)`
- **Doc Methods**: `.get()`, `.set()`, `.update()`, `.delete()`
- **Query Methods**: `.where()`, `.orderBy()`, `.limit()`, `.startAt()`, `.endAt()`

### Notifications (`notifications.js`)
- **Class**: `Notifications`
- **Key Methods**: `isSupported()`, `isSubscribed()`, `subscribe()`, `unsubscribe()`, `getToken()`, `onMessage()`
- **Storage**: Saves to localStorage and Firestore

### ServiceWorker (`service-worker.js`)
- **Class**: `ServiceWorker`
- **Key Methods**: `isSupported()`, `register()`, `ready()`, `postMessage()`, `onMessage()`, `getState()`

### Sentry (`sentry.js`)
- **Class**: `Sentry` (named `mod` internally)
- **Key Methods**: `init(config)`, `captureException(error, context)`
- **Filtering**: Blocks dev mode, Lighthouse, Selenium/Puppeteer

### DOM (`dom.js`)
- **Exports**: `loadScript(options)`, `ready()`
- **loadScript Options**: src, async, defer, crossorigin, integrity, timeout, retries

### Utilities (`utilities.js`)
- **Exports**: `clipboardCopy()`, `escapeHTML()`, `showNotification()`, `getPlatform()`, `getBrowser()`, `getRuntime()`, `isMobile()`, `getDevice()`, `getContext()`

## Build System

### prepare-package
The library uses `prepare-package` for ES5 transpilation:

```json
{
  "preparePackage": {
    "input": "./src",
    "output": "./dist"
  }
}
```

**Commands**:
- `npm run prepare` - Build once
- `npm start` - Watch mode
- `npm test` - Run Mocha tests

### Package Exports
```json
{
  "main": "dist/index.js",
  "module": "src/index.js",
  "exports": {
    ".": "./dist/index.js",
    "./modules/*": "./dist/modules/*"
  }
}
```

## Testing

Tests are in `test/test.js` using Mocha:
```bash
npm test
```

Current test coverage is minimal - focuses on configuration and storage.

## Common Tasks

### Adding a New Utility Function
1. Add function to `src/modules/utilities.js`
2. Export it: `export function myFunction() { ... }`
3. Update README.md with documentation
4. Run `npm run prepare` to build

### Adding a New Module
1. Create `src/modules/my-module.js`
2. Export class: `export default class MyModule { constructor(manager) { ... } }`
3. Import in `src/index.js`: `import MyModule from './modules/my-module.js'`
4. Add to Manager constructor: `this._myModule = new MyModule(this)`
5. Add getter: `myModule() { return this._myModule; }`
6. Update README.md
7. Run `npm run prepare`

### Modifying Configuration Defaults
1. Edit `_processConfiguration()` in `src/index.js`
2. Add to `defaults` object
3. Document in README.md Configuration section

### Adding a Data Binding Action
1. Edit `_executeAction()` in `src/modules/bindings.js`
2. Add case for new action (e.g., `@class`)
3. Document in README.md Data Binding section

## Dependencies

| Package | Purpose |
|---------|---------|
| `firebase` (^12.x) | Auth, Firestore, Messaging |
| `@sentry/browser` (^10.x) | Error tracking |
| `lodash` (^4.x) | get/set for path-based access |
| `itwcw-package-analytics` | Analytics (internal) |

## Important Notes

1. **DO NOT MODIFY `_legacy/`** - Reference only for historical context
2. **Backwards compatibility is NOT required** - Just change to the new way
3. **Prefer `fs-jetpack`** over `fs` for any file operations in tests/scripts
4. **No TypeScript** - This is a pure JavaScript library
5. **Template strings** - Use backticks for string interpolation
6. **Modular design** - Keep modules focused and small
