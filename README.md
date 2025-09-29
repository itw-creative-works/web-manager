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
* Polyfill detection and implementation for Promises, Array methods, window.fetch, and more!
* Dom API that acts as a super lightweight and optimized version of jQuery
* Improved Localstorage API
* Utility API with the most useful Lodash methods `get` and `set`

## 📚 Libraries
* Firebase (Firebase app, Firestore, Auth, & Messaging)
* Lazysizes to lazyload images
* Sentry to report errors
* [Chatsy.ai](https://chatsy.ai) AI chatbot integration
* Cookieconsent to comply with GDPR

## 📘 Example Setup
After installing via npm, simply paste this script before the closing `</body>` tag to initialize Web Manager.
```html
<script type="text/javascript">
  var Manager = new (require('web-manager'));
  var config = {
    // ... your config here
  }
  Manager.init(config, function() {
    Manager.log('Initialized main.js');
  });
</script>
```

## 📘 Example Usage
Lets go over some example usage of the library.

### Kitchen Sink Config example
By default, all of the libraries are enabled. But you can simply set `enabled` to `false` to disable any of them. Most of these libraries work without configuration but for some, such as Firebase, Tawk, and Sentry, you must supply the relevant IDs and API keys.

```html
<script type="text/javascript">
  var config = {
      pushNotifications: {
        autoRequest: 60 // How long to wait before auto ask to subscribe. 0 to disable.
      },
      serviceWorker: {
        path: 'firebase-messaging-sw.js' // Path to your service worker
      },
      libraries: {
        firebase_app: { // Config is required if enabled
          enabled: true,
          config: {
            apiKey: '123456',
            authDomain: 'xxx.firebaseapp.com',
            databaseURL: 'https://xxx.firebaseio.com',
            projectId: 'xxx',
            storageBucket: 'xxx.appspot.com',
            messagingSenderId: '123456',
            appId: '1:xxx'
          }
        },
        tawk: { // Config is required if enabled
          enabled: true,
          config: {
            chatId: 'xxx'
          }
        },
        sentry: { // Config is required if enabled
          enabled: true,
          config: {
            dsn: 'xxx',
            release: 'xxx'
          }
        },
        cookieconsent: { // No config required
          enabled: true,
          config: {
            palette: {
              popup: {
                background: '#237afc',
                text: '#ffffff'
              },
              button: {
                background: '#fff',
                text: '#237afc'
              }
            },
            theme: 'classic',
            position: 'bottom-left',
            type: '',
            content: {
              message: 'This website uses cookies to ensure you get the best experience on our website.',
              dismiss: 'Got it!',
              link: 'Learn more',
              href: (window.location.href + '/cookies/')
            }
          }
        },
        lazysizes: { // No config required
          enabled: true
        }
      }
    }
  var Manager = new (require('web-manager'));

  Manager.init(config, function() {
    Manager.log('Initialized main.js');
  });
</script>
```

### Utilizing the .dom() API
The Web Manager .dom() API is like a super lightweight and efficient version of jQuery, just better!
```html
<div class="el" id="el1">.el 1</div>
<div class="el" id="el2">.el 1</div>
<div class="el" id="el3">.el 1</div>

<div class="hide-me">.hide-me</div>
<div class="show-me">.show-me</div>

<div id="attributes" data-foo="bar">#attributes</div>

<input class="input" type="text" name="" value="Hello World!">

<div class="click-me">Click counter: 0</div>

<script type="text/javascript">
  Manager.ready(function() {
    console.log('--- Exploring the .dom() API ---');
    const el = Manager.dom().select('.el'); // Select using a standard querySelectorAll argument
    el.addClass('new-class'); // Add a class
    el.removeClass('old-class'); // Remove a class
    el.each(function(element, index) { // Iterate through the elements
      console.log('Loop number: ', index, element);
      Manager.dom().select(element).setInnerHTML('Element number: ' + index); // Set setInnerHTML
    });
    console.log('Get ', el.get(0));
    console.log('Get ', el.get(1));
    console.log('Exists ', el.exists());
    console.log('Exists (false)', Manager.dom().select('.this-doesnt-exist').exists());

    const el2 = Manager.dom().select('.hide-me');
    el2.hide(); // Hide an element

    const el3 = Manager.dom().select('.show-me');
    el2.show(); // Show an element

    const el4 = Manager.dom().select('#attributes');
    console.log('Attribute 1: ', el4.getAttribute('data-foo')); // Get an attribute
    el4.setAttribute('data-foo', 'baz'); // Set an attribute
    console.log('Attribute 2: ', el4.getAttribute('data-foo'));

    const el5 = Manager.dom().select('.input');
    console.log('Value 1: ', el5.getValue()); // Get value of an input
    el5.setValue('Hello again World!'); // Set a value
    console.log('Value 2: ', el5.getValue());

    var clicks = 0;
    const el6 = Manager.dom().select('.click-me');
    Manager.dom().select('body').on('click', function(event) {
      if (event.target.matches('.click-me')) {
        clicks++;
        el6.setInnerHTML('Click counter: ' + clicks)
      }
    });

    // Loading a script
    Manager.dom()
    .loadScript({src: 'https://platform.twitter.com/widgets.js', crossorigin: true}, function() {
      Manager.log('Loaded Twitter script.');
    });



  });
</script>
```

### Utilizing the .utilities() API
The Web Manager .utilities() API wraps some useful functions such as getting and setting values of objects.
```html
<script type="text/javascript">
  console.log('--- Exploring the .utilities() API ---');

  // .get() and .set()
  Manager.ready(function() {
    var object = {
      key1: 'val1',
      key2: 'val2',
      nested: {
        key4: 'val4'
      }
    };
    console.log('Root object ', Manager.utilities().get(object)); // Get whole object
    console.log('Get key1 ', Manager.utilities().get(object, 'key1')); // Get a key's value
    console.log('Get key3 ', Manager.utilities().get(object, 'key3')); // key3 doesn't exist
    console.log('Get key3 ', Manager.utilities().get(object, 'key3', 'key3default')); // key3 still doesn't exist, but well request a default instead

    console.log('Set key2 ', Manager.utilities().set(object, 'key2', 'new val2')); // Setting a value
    console.log('Set key3 ', Manager.utilities().set(object, 'key3', 'val3')); // Setting a value that doesn't exist won't overwrite

    console.log('Get nested key4 ', Manager.utilities().get(object, 'nested.key4')); // Getting a nested value
    console.log('Set nested key5 ', Manager.utilities().set(object, 'nested.key5', 'val5')); // Setting a nested value

    console.log('Root object (final)', Manager.utilities().get(object)); // Get whole object a final time

  });

  // .clipboardCopy()
  Manager.utilities().clipboardCopy('I am copied to the clipboard!')

  // .escapeHTML()
  Manager.utilities().escapeHTML('<strong>This will will NOT render as bold!</strong>')
</script>
```

### Utilizing the .storage() API
The Web Manager .storage() API is a wrapper for the localStorage API that automatically checks if localStorage is supported, automatically serializing (`JSON.stringify()`) and parsing (`JSON.parse()`) the inputs and outputs allowing you to natively work with storing objects in localStorage without any extra work!
```html
<script type="text/javascript">
  Manager.ready(function() {
    console.log('--- Exploring the .storage() API ---');

    // By default, all methods only affect the the assigned node '_manager'
    Manager.storage().clear(); // Clear _manager node
    console.log(Manager.storage().get('key1', '1')); // Get a key with a default of 1 if key doesnt exist
    console.log(Manager.storage().set('key1', '2')); // Set a key
    console.log(Manager.storage().get('key1', '1'));
    console.log(Manager.storage().get('', '1'));
    console.log(Manager.storage().set('key1.key2.key3.key4', 'inner4')); // Set a nested key
    console.log(Manager.storage().get('', '1'));
  });
</script>
```

### Utilizing the Data Binding System
Web Manager includes a powerful data binding system that automatically updates your DOM elements based on data changes. Simply add the `data-wm-bind` attribute to any element.

#### Basic Text Binding
```html
<!-- Display user email -->
<span data-wm-bind="auth.user.email"></span>

<!-- Display nested properties -->
<div data-wm-bind="auth.account.subscription.plan"></div>

<!-- Works with inputs too -->
<input data-wm-bind="settings.theme" />
```

#### Conditional Visibility
```html
<!-- Show element when condition is true -->
<div data-wm-bind="@show auth.user">Welcome!</div>
<div data-wm-bind="@show auth.user.emailVerified">Email is verified</div>

<!-- Hide element when condition is true -->
<div data-wm-bind="@hide auth.user">Please log in</div>

<!-- Comparisons -->
<div data-wm-bind="@show auth.account.subscription.plan === 'premium'">Premium features</div>
<div data-wm-bind="@hide settings.notifications === false">Notifications enabled</div>
```

#### Usage in JavaScript
```javascript
// Auth data is automatically bound when using auth().listen()
Manager.auth().listen({ account: true }, (result) => {
  // auth.user and auth.account data are automatically bound to the DOM
});

// Update bindings with custom data
Manager.bindings().update({
  settings: { theme: 'dark', language: 'en' },
  subscription: { plan: 'premium', expiresAt: '2024-12-31' }
});

// Set individual properties
Manager.bindings().set('currentPage', 'dashboard');

// Get current binding context
const context = Manager.bindings().getContext();

// Clear all bindings
Manager.bindings().clear();
```

#### Supported Actions
- **`@text`** (default): Sets the text content of the element
- **`@show`**: Shows the element when condition is true
- **`@hide`**: Hides the element when condition is true
- **`@attr`**: Sets an attribute value (format: `@attr attributeName expression`)

Future actions like `@class` and `@style` can be easily added.

### Utilizing the Firebase Auth System
The Firebase login system works like charm out of the box without you having to write a single line of code. All you have to do is add a few classes to your HTML elements and everything will work.

#### Authentication Action Classes
* `.auth-signout-btn`: Add to a button to sign out the current user (shows confirmation dialog)
* `.auth-email-input`: Add to an input for the user's email
* `.auth-password-input`: Add to an input for the user's password
* `.auth-signin-email-btn`: Add to a button to handle the signin process
* `.auth-signup-email-btn`: Add to a button to handle the signup process
* `.auth-signout-all-btn`: Add to a button to handle the signout process
* `.auth-email-element`: Add to any element to display the user's email
* `.auth-terms-input`: Add to a checkbox to require a TOS agreement before signup occurs
* `.auth-newsletter-input`: Add to a checkbox to opt-in the user to newsletters upon signup
* `.auth-uid-element`: Add to any element to display the user's uid
* `.auth-signedin-true-element`: Add to any element and it will be hidden if the user *is* signed in
* `.auth-signedin-false-element`: Add to any element and it will be hidden if the user *is not* signed in

For these, you must first call `.account().resolve()`
* `.auth-apikey-element`: Add to any element and it will display the user's API key
* `.auth-delete-account-btn`: Add to a button to handle the account deletion process
* `.auth-delete-account-confirmation-input`: Add to a checkbox to require confirmation before deleting
* `.auth-delete-account-error-message-element`: Add to any element to show any error about account deletion

* `.auth-billing-subscribe-btn`: Add to any button to turn it into a subscribe button
* `.auth-billing-update-btn`: Add to any button to turn it into a button to update an existing subscription
* `.auth-billing-plan-id-element`: Add to any element and it will display the user's plan ID
* `.auth-billing-frequency-element`: Add to any element and it will display the user's plan frequency
* `.auth-billing-start-date-element`: Add to any element and it will display the user's plan start date
* `.auth-billing-expiration-date-element`: Add to any element and it will display the user's plan expiration date

* `.auth-created-element`: Add to any element to show the local string for account creation date
* `.auth-phone-element`: Add to any element to display the user's phone

* `.auth-referral-count-element`: Update this element with the user's referral count
* `.auth-referral-code-element`: Update this element with the user's referral code
* `.auth-referral-link-element`: Update this element with the user's referral link
* `.auth-referral-social-link`: Update this element with the user's referral link for socials where `data-provider` is the social network

*  Future additions (not added yet)
  * `auth-link-provider-btn`: Initiate a link to the `data-provider` in this element
  * `auth-unlink-provider-btn`: Initiate an unlink to the `data-provider` in this element
  * `auth-signout-all-sessions-btn`: Call the server to sign out of all sessions and then log out of the current one.


```html
<div class="auth-signedin-false-element">
  <form onsubmit="return false;">
    <fieldset>
      <legend>Login</legend>
      <label for="email">Email</label>
      <input id="email" class="auth-email-input" type="email" name="email" placeholder="name@example.com" required autocomplete="email">
      <label for="password">Password</label>
      <input id="password" class="auth-password-input" type="password" name="password" placeholder="******" required autocomplete="current-password">
    </fieldset>

    <button id="submit" class="auth-signin-email-btn" type="submit">Sign in</button>
  </form>

  <form onsubmit="return false;">
    <fieldset>
      <legend>Signup</legend>
      <label for="email">Email</label>
      <input id="email" class="auth-email-input" type="email" name="email" placeholder="name@example.com" required autocomplete="email">
      <label for="password">Password</label>
      <input id="password" class="auth-password-input" type="password" name="password" placeholder="******" required autocomplete="new-password">
      <label for="passwordConfirm">Confirm password</label>
      <input id="passwordConfirm" class="auth-password-input" type="password" name="passwordConfirm" placeholder="******" required autocomplete="new-password">
    </fieldset>

    <button id="submit" class="auth-signup-email-btn" type="submit">Sign up</button>
  </form>

</div>
<div class="auth-signedin-true-element" hidden>
  <fieldset>
    <legend>My Account</legend>
    <label for="email">Email</label>
    <input id="email" class="auth-email-element" type="email" name="email" placeholder="name@example.com" disabled>
    <label for="uid">User ID</label>
    <input id="uid" class="auth-uid-element" type="text" name="uid" placeholder="1234567890" disabled>
    <label for="password">Password</label>
    <input id="password" class="" type="password" name="password" placeholder="******" disabled>
  </fieldset>

  <a href="#" onclick="return false;" class="auth-signout-all-btn">Sign out</a>
</div>
```

### Utilizing the Firebase Push Notification Subscription System
The Firebase push notification system also works with minimal implementation on your part. Just call `Manager.This.notifications().subscribe()` and the rest is handled for you!

```html
<script type="text/javascript">
  Manager.This.notifications().subscribe()
  .then(function() {
    Manager.log('Subscribed to push notifications!')
  })
  .catch(function(e) {
    Manager.log('error', 'Failed to subscribe to push notifications: ', e)
  })
</script>
```

### Utilizing the ServiceWorker API
Also included is an API wrapper for some ServiceWorker functions to make development easier. You don't have to waste lines of code checking if the service worker is supported, as this is implemented by default.

```html
<script type="text/javascript">
  Manager.serviceWorker().postMessage({command: 'debug', args: {key: 'value'}}, function (response) {
    Manager.log('Callback...', response);
  });
</script>
```

### Utilizing the .account() API
To preserve file size and enforce optimization, the `.account()` library must be explicitly loaded.

```html
<script type="text/javascript">
  Manager.account().import()
  .then(function (Account) {
    var account = new Account();
    account.resolve()
  })
</script>
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
