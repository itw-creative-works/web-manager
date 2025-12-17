<p align="center">
  <a href="https://itwcreativeworks.com">
    <img src="https://cdn.itwcreativeworks.com/assets/itw-creative-works/images/logo/itw-creative-works-brandmark-black-x.svg" width="100px">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/package-json/v/itw-creative-works/web-manager.svg">
  <br>
  <img src="https://img.shields.io/bundlephobia/min/web-manager.svg">
  <img src="https://img.shields.io/codeclimate/maintainability-percentage/itw-creative-works/web-manager.svg">
  <img src="https://img.shields.io/npm/dm/web-manager.svg">
  <img src="https://img.shields.io/node/v/web-manager.svg">
  <img src="https://img.shields.io/website/https/itwcreativeworks.com.svg">
  <img src="https://img.shields.io/github/license/itw-creative-works/web-manager.svg">
  <img src="https://img.shields.io/github/contributors/itw-creative-works/web-manager.svg">
  <img src="https://img.shields.io/github/last-commit/itw-creative-works/web-manager.svg">
  <br>
  <br>
  <a href="https://itwcreativeworks.com">Site</a> | <a href="https://www.npmjs.com/package/web-manager">NPM Module</a> | <a href="https://github.com/itw-creative-works/web-manager">GitHub Repo</a>
  <br>
  <br>
  <strong>Web Manager</strong> is a modern JavaScript utility library for building web applications with Firebase integration. It provides authentication, data binding, storage management, push notifications, error tracking, and more.
  <br>
  <br>
  Optimized for use with <a href="https://www.npmjs.com/package/webpack">webpack</a> but works standalone too.
</p>

## Table of Contents
- [Installation](#-installation)
- [Requirements](#-requirements)
- [Quick Start](#-quick-start)
- [Supported Environments](#-supported-environments)
- [Features](#-features)
- [Configuration](#-configuration)
- [API Reference](#-api-reference)
  - [Manager Instance](#manager-instance)
  - [Storage API](#storage-api)
  - [Authentication](#authentication)
  - [Data Binding System](#data-binding-system)
  - [Firestore](#firestore)
  - [Push Notifications](#push-notifications)
  - [Service Worker](#service-worker)
  - [Sentry Error Tracking](#sentry-error-tracking)
  - [DOM Utilities](#dom-utilities)
  - [Utility Functions](#utility-functions)
- [HTML Data Attributes](#-html-data-attributes)
- [Direct Module Imports](#-direct-module-imports)
- [Browser Support](#-browser-support)
- [Projects Using This Library](#-projects-using-this-library)
- [Support](#-support)

## Installation
```shell
npm install web-manager
```

## Requirements
- **Node.js**: >= 12
- **Browser**: Modern browsers (ES6+ support, transpiled to ES5 for older browsers)

**Note**: This library does not include TypeScript definitions.

## Quick Start

```javascript
import Manager from 'web-manager';

// Initialize with your configuration
await Manager.initialize({
  environment: 'production',
  buildTime: Date.now(),
  brand: {
    id: 'my-app',
    name: 'My Application'
  },
  firebase: {
    app: {
      enabled: true,
      config: {
        apiKey: 'your-api-key',
        authDomain: 'your-app.firebaseapp.com',
        projectId: 'your-project-id',
        storageBucket: 'your-app.appspot.com',
        messagingSenderId: '123456789',
        appId: '1:123456789:web:abcdef'
      }
    }
  }
});

console.log('Web Manager initialized!');
```

## Supported Environments

Web Manager is designed to work in multiple environments:

| Environment | Support | Notes |
|-------------|---------|-------|
| **Web** | Full | Primary target, works with webpack bundlers |
| **Electron** | Full | Works in renderer process |
| **Chrome Extension** | Full | Content scripts and popup pages |
| **Firefox Extension** | Full | Content scripts and popup pages |
| **Safari Extension** | Partial | Basic functionality supported |

## Features
- **Firebase v12 Integration**: Modern Firebase Auth, Firestore, and Cloud Messaging
- **Data Binding System**: Reactive DOM updates with `data-wm-bind` attributes
- **Storage API**: Enhanced localStorage/sessionStorage with path-based access and JSON serialization
- **Utilities**: `clipboardCopy()`, `escapeHTML()`, `getContext()`, `showNotification()`, `getPlatform()`, `getRuntime()`, `isMobile()`, `getDeviceType()`
- **DOM Utilities**: Dynamic script loading with retry/timeout support
- **Service Worker Management**: Registration, messaging, and state tracking
- **Push Notifications**: Firebase Cloud Messaging with auto-subscription
- **Error Tracking**: Sentry integration with session replay
- **App Check**: Optional reCAPTCHA Enterprise protection
- **Version Checking**: Auto-reload when new version is deployed
- **HTML Data Attributes**: Automatic `data-platform`, `data-runtime`, `data-device` on `<html>`

## Configuration

### Full Configuration Reference

```javascript
await Manager.initialize({
  // Environment: 'development' or 'production'
  environment: 'production',

  // Build timestamp for version checking
  buildTime: Date.now(),

  // Brand information
  brand: {
    id: 'my-app',                    // Used for custom protocol URLs
    name: 'My Application',
    description: 'App description',
    type: 'Organization',
    images: {
      brandmark: 'https://example.com/logo.png',
      wordmark: 'https://example.com/wordmark.png',
      combomark: 'https://example.com/combomark.png'
    },
    contact: {
      email: 'support@example.com',
      phone: '+1-555-0123'
    }
  },

  // Firebase configuration
  firebase: {
    app: {
      enabled: true,
      config: {
        apiKey: 'your-api-key',
        authDomain: 'your-app.firebaseapp.com',
        projectId: 'your-project-id',
        storageBucket: 'your-app.appspot.com',
        messagingSenderId: '123456789',
        appId: '1:123456789:web:abcdef'
      }
    },
    appCheck: {
      enabled: false,
      config: {
        siteKey: 'your-recaptcha-enterprise-site-key'
      }
    }
  },

  // Authentication settings
  auth: {
    enabled: true,
    config: {
      redirects: {
        authenticated: '/account',     // Redirect after login
        unauthenticated: '/signup'     // Redirect when not logged in
      }
    }
  },

  // Sentry error tracking
  sentry: {
    enabled: true,
    config: {
      dsn: 'https://your-sentry-dsn',
      release: '1.0.0',
      replaysSessionSampleRate: 0.01,  // 1% of sessions
      replaysOnErrorSampleRate: 0.01   // 1% of error sessions
    }
  },

  // Push notifications
  pushNotifications: {
    enabled: true,
    config: {
      autoRequest: 60000,              // Auto-request after 60s of first click
      vapidKey: 'your-vapid-key'       // Optional VAPID key
    }
  },

  // Service worker
  serviceWorker: {
    enabled: true,
    config: {
      path: '/service-worker.js'
    }
  },

  // Version checking (auto-reload on new version)
  refreshNewVersion: {
    enabled: true,
    config: {
      interval: 3600000                // Check every hour (1000 * 60 * 60)
    }
  },

  // Valid hosts for auth redirects (security)
  validRedirectHosts: ['example.com', 'app.example.com']
});
```

### Configuration Notes

- **Timeout values** can be specified as strings with math expressions: `'1000 * 60 * 60'` (evaluated safely)
- **Deep merge**: Your config is deep-merged with defaults, so you only need to specify what you want to change
- **Firebase required**: Most features require Firebase to be configured and enabled

## API Reference

### Manager Instance

The Manager is a singleton that provides access to all modules:

```javascript
import Manager from 'web-manager';

// Module getters
Manager.storage();        // Storage API
Manager.auth();           // Firebase Auth wrapper
Manager.bindings();       // Data binding system
Manager.firestore();      // Firestore wrapper
Manager.notifications();  // Push notifications
Manager.serviceWorker();  // Service worker management
Manager.sentry();         // Error tracking
Manager.dom();            // DOM utilities
Manager.utilities();      // Utility functions

// Helper methods
Manager.isDevelopment();                        // Check if in development mode
Manager.getFunctionsUrl();                      // Get Firebase Functions URL
Manager.getFunctionsUrl('development');         // Force development URL
Manager.getApiUrl();                            // Get API URL (derived from firebase authDomain)
Manager.isValidRedirectUrl('https://...');      // Validate redirect URL

// Firebase instances (after initialization)
Manager.firebaseApp;       // Firebase App instance
Manager.firebaseAuth;      // Firebase Auth instance
Manager.firebaseFirestore; // Firestore instance
Manager.firebaseMessaging; // FCM instance

// Configuration
Manager.config;            // Access full configuration
```

### Storage API

Enhanced localStorage and sessionStorage with path-based access:

```javascript
const storage = Manager.storage();

// LocalStorage (persists across browser sessions)
storage.set('user.name', 'John');
storage.set('user.preferences', { theme: 'dark', lang: 'en' });

const name = storage.get('user.name');                    // 'John'
const theme = storage.get('user.preferences.theme');      // 'dark'
const all = storage.get();                                // Entire storage object
const fallback = storage.get('missing.path', 'default');  // 'default'

storage.remove('user.name');
storage.clear();

// SessionStorage (cleared when browser closes)
storage.session.set('temp.token', 'abc123');
storage.session.get('temp.token');
storage.session.remove('temp.token');
storage.session.clear();
```

**Features**:
- Automatic JSON serialization/deserialization
- Nested path access using dot notation
- Fallback to in-memory storage if localStorage unavailable
- Uses lodash `get`/`set` for reliable path access

### Authentication

Firebase Authentication wrapper with automatic account data fetching:

```javascript
const auth = Manager.auth();

// Listen for auth state changes
const unsubscribe = auth.listen({ account: true }, (result) => {
  console.log('User:', result.user);     // Firebase user or null
  console.log('Account:', result.account); // Firestore account data or null
});

// Listen once (useful for initial state)
auth.listen({ once: true }, (result) => {
  console.log('Initial state:', result);
});

// Check authentication status
if (auth.isAuthenticated()) {
  const user = auth.getUser();
  console.log('Logged in as:', user.email);
}

// Sign in
try {
  const user = await auth.signInWithEmailAndPassword('user@example.com', 'password');
} catch (error) {
  console.error('Sign in failed:', error.message);
}

// Sign in with custom token (from backend)
await auth.signInWithCustomToken('custom-jwt-token');

// Get ID token for API calls
const idToken = await auth.getIdToken();
const freshToken = await auth.getIdToken(true); // Force refresh

// Sign out
await auth.signOut();

// Stop listening
unsubscribe();
```

**getUser() returns enhanced user object**:
```javascript
{
  uid: 'abc123',
  email: 'user@example.com',
  displayName: 'John Doe',        // Falls back to email or 'User'
  photoURL: 'https://...',        // Falls back to ui-avatars.com
  emailVerified: true
}
```

**HTML Auth Classes**:
Add these classes to elements for automatic auth functionality:
- `.auth-signout-btn` - Sign out button (shows confirmation dialog)

### Data Binding System

Reactive DOM updates with `data-wm-bind` attributes:

#### Basic Text Binding
```html
<!-- Display text content (default action) -->
<span data-wm-bind="auth.user.email"></span>
<span data-wm-bind="@text auth.user.displayName"></span>
```

#### Input/Textarea Value Binding
```html
<input data-wm-bind="@value settings.email" />
<textarea data-wm-bind="@value user.bio"></textarea>
```

#### Conditional Visibility
```html
<!-- Show when truthy -->
<div data-wm-bind="@show auth.user">Welcome back!</div>

<!-- Hide when truthy -->
<div data-wm-bind="@hide auth.user">Please log in</div>

<!-- Negation -->
<div data-wm-bind="@show !auth.user">Not logged in</div>

<!-- Comparisons -->
<div data-wm-bind="@show auth.account.plan === 'premium'">Premium content</div>
<div data-wm-bind="@hide settings.notifications === false">Notifications on</div>
```

#### Attribute Binding
```html
<img data-wm-bind="@attr src auth.user.photoURL" />
<a data-wm-bind="@attr href settings.profileUrl">Profile</a>
<input data-wm-bind="@attr disabled auth.loading" />
```

#### Style Binding
```html
<!-- CSS custom properties -->
<div data-wm-bind="@style --rating-width ratings.percent"></div>

<!-- Inline styles -->
<div data-wm-bind="@style background-color theme.primary"></div>
```

#### Multiple Actions
Combine actions with commas:
```html
<img data-wm-bind="@show auth.user, @attr src auth.user.photoURL, @attr alt auth.user.displayName" />
```

#### JavaScript API
```javascript
const bindings = Manager.bindings();

// Update context data
bindings.update({
  settings: { theme: 'dark', email: 'user@example.com' },
  custom: { value: 123 }
});

// Get current context
const context = bindings.getContext();

// Clear all bindings
bindings.clear();
```

#### Skeleton Loaders
```html
<!-- Shows shimmer animation until bound -->
<span data-wm-bind="auth.user.name" class="wm-binding-skeleton"></span>
```

The skeleton automatically:
- Displays shimmer animation while loading
- Fades in smoothly when data arrives
- Adds `wm-bound` class when complete
- Respects `prefers-reduced-motion`

#### Supported Actions

| Action | Syntax | Description |
|--------|--------|-------------|
| `@text` | `@text path` | Set text content (default) |
| `@value` | `@value path` | Set input/textarea value |
| `@show` | `@show condition` | Show element if truthy |
| `@hide` | `@hide condition` | Hide element if truthy |
| `@attr` | `@attr name path` | Set attribute value |
| `@style` | `@style prop path` | Set CSS property or variable |

### Firestore

Simplified Firestore wrapper with chainable queries:

```javascript
const db = Manager.firestore();

// Document operations - two syntax options
await db.doc('users/user123').set({ name: 'John', age: 30 });
await db.doc('users', 'user123').update({ age: 31 });

const docSnap = await db.doc('users/user123').get();
if (docSnap.exists()) {
  console.log('Data:', docSnap.data());
  console.log('ID:', docSnap.id);
}

await db.doc('users/user123').delete();

// Collection queries
const snapshot = await db.collection('users').get();
console.log('Count:', snapshot.size);
console.log('Empty:', snapshot.empty);
snapshot.docs.forEach(doc => {
  console.log(doc.id, doc.data());
});

// Query with filters (chainable)
const results = await db.collection('users')
  .where('age', '>=', 18)
  .where('active', '==', true)
  .orderBy('createdAt', 'desc')
  .limit(20)
  .get();

// Pagination
const page2 = await db.collection('users')
  .orderBy('name')
  .startAt('M')
  .endAt('N')
  .get();
```

**Where Operators**: `<`, `<=`, `==`, `!=`, `>=`, `>`, `array-contains`, `in`, `array-contains-any`, `not-in`

### Push Notifications

Firebase Cloud Messaging integration:

```javascript
const notifications = Manager.notifications();

// Check support
if (notifications.isSupported()) {
  console.log('Push notifications available');
}

// Check subscription status
const isSubscribed = await notifications.isSubscribed();

// Subscribe
try {
  const result = await notifications.subscribe({
    vapidKey: 'your-vapid-key' // Optional
  });
  console.log('Token:', result.token);
} catch (error) {
  if (error.message.includes('permission')) {
    console.log('User denied permission');
  }
}

// Unsubscribe
await notifications.unsubscribe();

// Get current token
const token = await notifications.getToken();

// Listen for foreground messages
const unsubscribe = await notifications.onMessage((payload) => {
  console.log('Received:', payload);
});

// Sync subscription with auth state
await notifications.syncSubscription();
```

**Features**:
- Stores subscription in localStorage and Firestore
- Tracks device context (platform, runtime, deviceType)
- Auto-requests after configurable delay post-click
- Syncs with user authentication state

### Service Worker

Service worker registration and messaging:

```javascript
const sw = Manager.serviceWorker();

// Check support
if (sw.isSupported()) {
  console.log('Service workers available');
}

// Register (done automatically during init if enabled)
const registration = await sw.register({
  path: '/service-worker.js',
  scope: '/'
});

// Wait for ready state
await sw.ready();

// Get registration
const reg = sw.getRegistration();

// Post message with response
try {
  const response = await sw.postMessage({
    command: 'cache-clear',
    payload: { pattern: '*.js' }
  }, { timeout: 5000 });
  console.log('Response:', response);
} catch (error) {
  console.error('Timeout or error:', error);
}

// Listen for messages from service worker
const unsubscribe = sw.onMessage('notification-click', (data, event) => {
  console.log('Clicked:', data);
});

// Get current state
const state = sw.getState(); // 'none', 'installing', 'waiting', 'active', 'unknown'
```

### Sentry Error Tracking

Automatic error tracking with Sentry:

```javascript
const sentry = Manager.sentry();

// Capture an exception
try {
  throw new Error('Something went wrong');
} catch (error) {
  sentry.captureException(error, {
    tags: { feature: 'checkout' },
    extra: { orderId: '12345' }
  });
}
```

**Automatic Features**:
- Environment and release tracking from config
- User context from auth state (uid, email)
- Session duration tracking
- Filters out Lighthouse and automated browsers (Selenium, Puppeteer)
- Blocks sending in development mode
- Dynamic import to reduce bundle size

### DOM Utilities

```javascript
import { loadScript, ready } from 'web-manager/modules/dom';
// Or: const { loadScript, ready } = Manager.dom();

// Wait for DOM ready
await ready();

// Load external script
await loadScript({
  src: 'https://example.com/script.js',
  async: true,
  defer: false,
  crossorigin: 'anonymous',
  integrity: 'sha384-...',
  timeout: 30000,
  retries: 2,
  parent: document.head,
  attributes: { 'data-custom': 'value' }
});

// Simple string syntax
await loadScript('https://example.com/script.js');
```

**loadScript Options**:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `src` | string | required | Script URL |
| `async` | boolean | `true` | Load asynchronously |
| `defer` | boolean | `false` | Defer execution |
| `crossorigin` | boolean/string | `false` | CORS setting |
| `integrity` | string | `null` | SRI hash |
| `timeout` | number | `60000` | Timeout in ms |
| `retries` | number | `0` | Retry attempts |
| `parent` | Element | `document.head` | Parent element |
| `attributes` | object | `{}` | Custom attributes |

### Utility Functions

```javascript
import {
  clipboardCopy,
  escapeHTML,
  showNotification,
  getPlatform,
  getRuntime,
  isMobile,
  getDeviceType,
  getContext
} from 'web-manager/modules/utilities';
// Or: const utils = Manager.utilities();

// Copy to clipboard
await clipboardCopy('Text to copy');
await clipboardCopy(document.querySelector('#input')); // From element

// Escape HTML (XSS prevention)
const safe = escapeHTML('<script>alert("xss")</script>');
// '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'

// Show notification (Bootstrap-styled)
showNotification('Success!', { type: 'success', timeout: 5000 });
showNotification('Error!', 'danger');
showNotification(new Error('Failed'), { timeout: 0 }); // No auto-dismiss

// Platform detection
getPlatform(); // 'windows', 'mac', 'linux', 'ios', 'android', 'chromeos', 'unknown'

// Runtime detection
getRuntime(); // 'web', 'browser-extension'

// Device detection
isMobile();     // true/false
getDeviceType(); // 'mobile' (<768px), 'tablet' (768-1199px), 'desktop' (>=1200px)

// Full context
getContext();
// {
//   client: { language, mobile, deviceType, platform, runtime, userAgent, url },
//   browser: { vendor }
// }
```

**showNotification Options**:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | string | `'info'` | `'info'`, `'success'`, `'warning'`, `'danger'` |
| `timeout` | number | `5000` | Auto-dismiss after ms (0 = never) |

## HTML Data Attributes

Web Manager automatically sets these attributes on the `<html>` element during initialization:

```html
<html data-platform="mac" data-runtime="web" data-device="desktop">
```

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-platform` | `windows`, `mac`, `linux`, `ios`, `android`, `chromeos`, `unknown` | Operating system |
| `data-runtime` | `web`, `browser-extension` | Runtime environment |
| `data-device` | `mobile`, `tablet`, `desktop` | Device type by screen width |

**CSS Usage**:
```css
/* Platform-specific styles */
[data-platform="ios"] .download-btn { display: none; }
[data-platform="windows"] .app-icon { content: url('windows-icon.png'); }

/* Device-responsive styles */
[data-device="mobile"] .sidebar { display: none; }
[data-device="desktop"] .mobile-menu { display: none; }
```

## Direct Module Imports

Import individual modules to reduce bundle size:

```javascript
// Storage only
import Storage from 'web-manager/modules/storage';
const storage = new Storage();

// Utilities only
import { clipboardCopy, escapeHTML } from 'web-manager/modules/utilities';

// DOM utilities only
import { loadScript, ready } from 'web-manager/modules/dom';

// Full manager (default)
import Manager from 'web-manager';
```

**Available Modules**:
- `web-manager/modules/storage` - Storage class
- `web-manager/modules/utilities` - Utility functions
- `web-manager/modules/dom` - DOM utilities
- `web-manager/modules/auth` - Auth class (requires Manager)
- `web-manager/modules/bindings` - Bindings class (requires Manager)
- `web-manager/modules/firestore` - Firestore class (requires Manager)
- `web-manager/modules/notifications` - Notifications class (requires Manager)
- `web-manager/modules/service-worker` - ServiceWorker class (requires Manager)
- `web-manager/modules/sentry` - Sentry class (requires Manager)

## Browser Support

Web Manager is transpiled to ES5 for broad browser support:

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 60+ | Full |
| Firefox | 55+ | Full |
| Safari | 11+ | Full |
| Edge | 79+ | Full |
| IE | 11 | Not supported |

**Notes**:
- Service Workers require HTTPS (except localhost)
- Push Notifications require Service Worker support
- Some features use modern APIs with fallbacks

## Projects Using This Library

- [Somiibo](https://somiibo.com/): A Social Media Bot with an open-source module library
- [JekyllUp](https://jekyllup.com/): A website devoted to sharing the best Jekyll themes
- [Slapform](https://slapform.com/): A backend processor for HTML forms on static sites
- [SoundGrail Music App](https://app.soundgrail.com/): A resource for producers, musicians, and DJs
- [Hammock Report](https://hammockreport.com/): An API for exploring and listing backyard products

*Want your project listed? [Open an issue](https://github.com/itw-creative-works/web-manager/issues)!*

## Support

If you're having issues or have questions:
- [Open an issue](https://github.com/itw-creative-works/web-manager/issues) on GitHub
- Include code samples and relevant files to help us help you faster
