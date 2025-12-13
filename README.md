<p align="center">
  <a href="https://itwcreativeworks.com">
    <img src="https://cdn.itwcreativeworks.com/assets/itw-creative-works/images/logo/itw-creative-works-brandmark-black-x.svg" width="100px">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/package-json/v/itw-creative-works/web-manager.svg">
  <br>
  <img src="https://img.shields.io/david/itw-creative-works/web-manager.svg">
  <img src="https://img.shields.io/david/dev/itw-creative-works/web-manager.svg">
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
  <strong>Web Manager</strong> is an NPM module for web developers using node to build beautiful websites. This module instantly implements a few common libraries and functions that every developer should be using on their websites to enhance the user experience.
  <br>
  <br>
  This module is best used when bundled with <a href="https://www.npmjs.com/package/webpack">webpack</a>.
</p>

## 📦 Install Web Manager
Install with npm:
```shell
npm install web-manager
```

## 🦄 Features
* **Firebase v12 Integration**: Modern Firebase Auth, Firestore, and Cloud Messaging
* **Data Binding System**: Reactive DOM updates with `data-wm-bind` attributes
* **Storage API**: Enhanced localStorage/sessionStorage with automatic JSON serialization
* **Utilities**: Essential functions like `clipboardCopy()`, `escapeHTML()`, `getContext()`, and `showNotification()`
* **DOM Utilities**: Lightweight helpers for dynamic script loading and DOM ready detection
* **Service Worker Management**: Easy registration and messaging with service workers
* **Push Notifications**: Simplified Firebase Cloud Messaging subscription system

## 📚 Integrated Libraries
* **Firebase v12**: Firebase App, Firestore, Auth, and Cloud Messaging
* **Sentry**: Comprehensive error tracking and session replay
* **Firebase App Check**: Optional reCAPTCHA Enterprise protection

## 📘 Quick Start

### Installation
```bash
npm install web-manager
```

### Basic Setup
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

## 📘 API Reference

### Configuration

Here's a comprehensive configuration example with all available options:

```javascript
await Manager.initialize({
  // Environment and build info
  environment: 'production', // 'development' or 'production'
  buildTime: Date.now(),

  // Brand information
  brand: {
    id: 'my-app',
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
        siteKey: 'your-recaptcha-site-key'
      }
    }
  },

  // Sentry error tracking
  sentry: {
    enabled: true,
    config: {
      dsn: 'https://your-sentry-dsn',
      replaysSessionSampleRate: 0.01,
      replaysOnErrorSampleRate: 0.01
    }
  },

  // Push notifications
  pushNotifications: {
    enabled: true,
    config: {
      autoRequest: 60000 // Auto-request after 60s of first user interaction
    }
  },

  // Service worker
  serviceWorker: {
    enabled: true,
    config: {
      path: '/service-worker.js'
    }
  },

  // Valid redirect hosts for auth
  validRedirectHosts: ['example.com', 'app.example.com']
});
```

### DOM Utilities

The DOM utilities provide essential functions for working with the DOM:

```javascript
import { loadScript, ready } from 'web-manager';

// Wait for DOM to be ready
await ready();
console.log('DOM is ready!');

// Load an external script dynamically
await loadScript({
  src: 'https://example.com/script.js',
  async: true,
  crossorigin: 'anonymous',
  timeout: 30000,
  retries: 2
});

// Or simply pass a URL string
await loadScript('https://example.com/script.js');
```

You can also access these via the Manager instance:

```javascript
const domUtils = Manager.dom();
await domUtils.loadScript('https://example.com/script.js');
await domUtils.ready();
```

### Utilities

The utilities module provides essential helper functions:

```javascript
import { clipboardCopy, escapeHTML, getContext, showNotification } from 'web-manager';

// Copy text to clipboard
await clipboardCopy('Text to copy');

// Escape HTML to prevent XSS attacks
const safe = escapeHTML('<script>alert("xss")</script>');
// Returns: &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;

// Get client context information
const context = getContext();
// Returns: {
//   client: { language, mobile, platform, userAgent, url },
//   browser: { vendor }
// }

// Show Bootstrap-styled notification
showNotification('Success!', { type: 'success', timeout: 5000 });
showNotification('Error occurred', 'danger'); // Shorthand
showNotification(new Error('Something went wrong')); // Auto-detects error
```

Access via Manager instance:

```javascript
const utils = Manager.utilities();
utils.clipboardCopy('Hello!');
utils.escapeHTML('<div>Test</div>');
utils.getContext();
utils.showNotification('Message', 'info');
```

### Storage API

Enhanced localStorage and sessionStorage with automatic JSON serialization and nested path support:

```javascript
const storage = Manager.storage();

// LocalStorage operations (persists across sessions)
storage.set('user.name', 'John');
storage.set('user.preferences', { theme: 'dark', lang: 'en' });

const name = storage.get('user.name'); // 'John'
const theme = storage.get('user.preferences.theme'); // 'dark'
const all = storage.get(); // Get entire storage object

storage.remove('user.name');
storage.clear(); // Clear all data

// SessionStorage operations (cleared when browser closes)
storage.session.set('temp.data', 'value');
const tempData = storage.session.get('temp.data');
storage.session.remove('temp.data');
storage.session.clear();
```

All data is automatically serialized to JSON, so you can store objects, arrays, and primitives without manual conversion.

### Utilizing the Data Binding System
Web Manager includes a powerful data binding system that automatically updates your DOM elements based on data changes. Simply add the `data-wm-bind` attribute to any element.

#### Basic Text Binding
```html
<!-- Display user email -->
<span data-wm-bind="auth.user.email"></span>

<!-- Display nested properties -->
<div data-wm-bind="auth.account.subscription.plan"></div>
```

#### Input/Textarea Value Binding
```html
<!-- Set input value -->
<input data-wm-bind="@value settings.theme" />

<!-- Set textarea value -->
<textarea data-wm-bind="@value user.bio"></textarea>

<!-- Combine with other actions -->
<input data-wm-bind="@value auth.user.email, @attr disabled auth.user.emailVerified" />
```

#### Conditional Visibility
```html
<!-- Show element when condition is true -->
<div data-wm-bind="@show auth.user">Welcome!</div>
<div data-wm-bind="@show auth.user.emailVerified">Email is verified</div>

<!-- Hide element when condition is true -->
<div data-wm-bind="@hide auth.user">Please log in</div>

<!-- Or, show element when condition is false -->
<div data-wm-bind="@show !auth.user">Please log in</div>

<!-- Comparisons -->
<div data-wm-bind="@show auth.account.subscription.plan === 'premium'">Premium features</div>
<div data-wm-bind="@hide settings.custom === 'value">Notifications enabled</div>
```

#### Usage in JavaScript
```javascript
// Auth data is automatically bound when using auth().listen()
Manager.auth().listen({ account: true }, (result) => {
  // auth.user and auth.account data are automatically bound to the DOM
});

// Update bindings with custom data
Manager.bindings().update({
  settings: { custom: 'value' },
});

// Get current binding context
const context = Manager.bindings().getContext();

// Clear all bindings
Manager.bindings().clear();
```

#### Attribute Actions
```html
<!-- Set an attribute value -->
<img data-wm-bind="@attr src auth.user.photoURL" />
<a data-wm-bind="@attr href settings.profileUrl">Profile</a>

<!-- Multiple attributes on same element -->
<img data-wm-bind="@attr src auth.user.photoURL, @attr alt auth.user.displayName" />
```

#### Multiple Actions
You can combine multiple actions on a single element by separating them with commas:

```html
<!-- Set text AND show/hide -->
<div data-wm-bind="@show auth.user, @text auth.user.displayName"></div>

<!-- Set text AND multiple attributes -->
<img data-wm-bind="@text auth.user.displayName, @attr src auth.user.photoURL, @attr title auth.user.email" />

<!-- Multiple attributes -->
<a data-wm-bind="@attr href settings.url, @attr target settings.target, @text settings.linkText"></a>
```

#### Skeleton Loaders
Add the `wm-binding-skeleton` class to show a loading skeleton while data is being bound:

```html
<!-- Shows a shimmer loading effect until data is bound -->
<span data-wm-bind="auth.user.displayName" class="wm-binding-skeleton"></span>

<!-- Profile card with multiple skeleton loaders -->
<div class="profile-card">
  <img data-wm-bind="@attr src auth.user.photoURL" class="wm-binding-skeleton">
  <h3 data-wm-bind="auth.user.displayName" class="wm-binding-skeleton"></h3>
  <p data-wm-bind="auth.user.email" class="wm-binding-skeleton"></p>
</div>

<!-- Elements without the class won't show skeleton loaders -->
<span data-wm-bind="settings.theme"></span>
```

The skeleton loader automatically:
- Displays a shimmer animation while the element is unbound
- Hides the text content during loading
- Prevents interaction until data is loaded
- Fades in smoothly when data arrives
- Adapts to dark themes
- Respects `prefers-reduced-motion` accessibility settings

#### Visual Feedback
When an element is bound, Web Manager automatically adds the `wm-bound` class to it. You can use this class for styling or debugging:

```css
/* Add a subtle indicator for bound elements in development */
.wm-bound {
  outline: 1px dashed rgba(0, 123, 255, 0.3);
}

/* Custom styling after binding */
.wm-bound {
  /* Element has been successfully bound */
}
```

#### Style Bindings
Set CSS custom properties (CSS variables) or inline styles dynamically:

```html
<!-- Set CSS custom property -->
<div data-wm-bind="@style --rating-percent site.ratings.starWidth"></div>

<!-- Set regular style property -->
<div data-wm-bind="@style width user.profile.width"></div>

<!-- Multiple styles -->
<div data-wm-bind="@style --primary-color theme.primaryColor, @style --secondary-color theme.secondaryColor"></div>
```

Then use the custom property in your CSS:

```css
.rating-stars::before {
  width: var(--rating-percent, 0%);
  background: var(--primary-color, #007bff);
}
```

#### Supported Actions
- **`@text`** (default): Sets the text content of the element
- **`@value`**: Sets the value of an input or textarea element
- **`@show`**: Shows the element when condition is true
- **`@hide`**: Hides the element when condition is true
- **`@attr`**: Sets an attribute value (format: `@attr attributeName expression`)
- **`@style`**: Sets a CSS custom property or inline style (format: `@style propertyName expression`)

Future actions like `@class` can be easily added.

### Firebase Authentication

The auth module provides Firebase Authentication integration with automatic account data fetching:

```javascript
const auth = Manager.auth();

// Listen for auth state changes (waits for settled state)
const unsubscribe = auth.listen({ account: true }, (result) => {
  console.log('User:', result.user);
  console.log('Account:', result.account);

  // result.user contains: uid, email, displayName, photoURL, emailVerified
  // result.account contains resolved account data from Firestore
});

// Listen only once
auth.listen({ once: true }, (result) => {
  console.log('Initial auth state:', result);
});

// Check if user is authenticated
if (auth.isAuthenticated()) {
  const user = auth.getUser();
  console.log('Current user:', user);
}

// Sign in with email and password
try {
  const user = await auth.signInWithEmailAndPassword('user@example.com', 'password');
  console.log('Signed in:', user);
} catch (error) {
  console.error('Sign in failed:', error);
}

// Sign in with custom token
await auth.signInWithCustomToken('custom-token');

// Sign out
await auth.signOut();

// Get ID token for API calls
const idToken = await auth.getIdToken(forceRefresh = false);
```

#### Built-in Auth UI Classes

Add these CSS classes to HTML elements for automatic auth functionality:

* `.auth-signout-btn` - Sign out button (shows confirmation)

The auth system automatically updates DOM elements with `data-wm-bind` attributes (see Data Binding section).

### Push Notifications

Simplified Firebase Cloud Messaging integration:

```javascript
const notifications = Manager.notifications();

// Check if notifications are supported
if (notifications.isSupported()) {
  console.log('Push notifications are supported!');
}

// Check subscription status
const isSubscribed = await notifications.isSubscribed();

// Subscribe to push notifications
try {
  const result = await notifications.subscribe({
    vapidKey: 'your-vapid-key' // Optional
  });
  console.log('Subscribed!', result.token);
} catch (error) {
  console.error('Subscription failed:', error);
}

// Unsubscribe
await notifications.unsubscribe();

// Get current FCM token
const token = await notifications.getToken();

// Listen for foreground messages
const unsubscribe = await notifications.onMessage((payload) => {
  console.log('Message received:', payload);
});

// Sync subscription with current auth state
await notifications.syncSubscription();
```

The notification system automatically:
- Requests permission after user interaction (configurable via `pushNotifications.config.autoRequest`)
- Stores subscription info in Firestore
- Syncs with user authentication state
- Shows notifications when app is in foreground

### Service Worker

Manage service workers with automatic support detection:

```javascript
const sw = Manager.serviceWorker();

// Check if service workers are supported
if (sw.isSupported()) {
  console.log('Service workers are supported!');
}

// Register service worker (done automatically during initialization)
const registration = await sw.register({
  path: '/service-worker.js',
  scope: '/'
});

// Wait for service worker to be ready
await sw.ready();

// Get current registration
const reg = sw.getRegistration();

// Post message to service worker
try {
  const response = await sw.postMessage({
    command: 'cache-clear',
    payload: { pattern: '*.js' }
  }, { timeout: 5000 });
  console.log('Response:', response);
} catch (error) {
  console.error('Message failed:', error);
}

// Listen for messages from service worker
const unsubscribe = sw.onMessage('notification-click', (data, event) => {
  console.log('Notification clicked:', data);
});

// Get service worker state
const state = sw.getState(); // 'none', 'installing', 'waiting', 'active'
```

### Firestore

Simplified Firestore wrapper with chainable queries:

```javascript
const db = Manager.firestore();

// Document operations
await db.doc('users/user123').set({ name: 'John', age: 30 });
await db.doc('users', 'user123').update({ age: 31 });

const docSnap = await db.doc('users/user123').get();
if (docSnap.exists()) {
  console.log('User data:', docSnap.data());
}

await db.doc('users/user123').delete();

// Collection queries
const snapshot = await db.collection('users').get();
snapshot.docs.forEach(doc => {
  console.log(doc.id, doc.data());
});

// Query with filters
const result = await db.collection('users')
  .where('age', '>=', 18)
  .orderBy('age', 'desc')
  .limit(10)
  .get();

// Chainable queries
const adults = await db.collection('users')
  .where('age', '>=', 18)
  .where('active', '==', true)
  .orderBy('createdAt', 'desc')
  .limit(20)
  .startAt(lastDoc)
  .get();
```

### Sentry Integration

Error tracking with automatic configuration:

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

Sentry is automatically configured with:
- Environment and release tracking
- User context from auth state
- Session replay (if configured)
- Filtering for development/automated browsers

### Manager Helper Methods

The Manager instance provides several utility methods:

```javascript
// Check if running in development mode
if (Manager.isDevelopment()) {
  console.log('Running in development');
}

// Get Firebase Functions URL
const functionsUrl = Manager.getFunctionsUrl(); // Uses config environment
const devUrl = Manager.getFunctionsUrl('development'); // http://localhost:5001/...
const prodUrl = Manager.getFunctionsUrl('production'); // https://us-central1-...

// Get API URL (derives from Firebase config)
const apiUrl = Manager.getApiUrl(); // https://api.your-domain.com

// Validate redirect URLs (for auth flows)
const isValid = Manager.isValidRedirectUrl('https://example.com/callback');

// Access Firebase instances directly
const app = Manager.firebaseApp;
const auth = Manager.firebaseAuth;
const firestore = Manager.firebaseFirestore;
const messaging = Manager.firebaseMessaging;

// Access configuration
const config = Manager.config;
console.log('Brand:', config.brand);
console.log('Environment:', config.environment);
```

## 🗨️ Final Words
If you are still having difficulty, we would love for you to post
a question to [the Web Manager issues page](https://github.com/itw-creative-works/web-manager/issues). It is much easier to answer questions that include your code and relevant files! So if you can provide them, we'd be extremely grateful (and more likely to help you find the answer!)

## 📚 Projects Using this Library
[Somiibo](https://somiibo.com/): A Social Media Bot with an open-source module library. <br>
[JekyllUp](https://jekyllup.com/): A website devoted to sharing the best Jekyll themes. <br>
[Slapform](https://slapform.com/): A backend processor for your HTML forms on static sites. <br>
[SoundGrail Music App](https://app.soundgrail.com/): A resource for producers, musicians, and DJs. <br>
[Hammock Report](https://hammockreport.com/): An API for exploring and listing backyard products. <br>

Ask us to have your project listed! :)
