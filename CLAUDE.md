This is a helper library that I built 6 years ago in 2019 when the web landscape was very different.

I built many functionalities that I found myself writing for every project so that I could reuse them easily.
It has been a great help in my projects, but many of these things are now not needed due to webpack, and other amazing tools.

The first thing I did is move all the old code to the "legacy" folder so that we can keep it as a reference. You should reference this as your REBUILD THE NEW LIBRARY IN "src" folder. DO NOT DELETE OR CHANGE LEGACY CODE, just reference it and recreate the functioinality I want in the "src" folder.

Going forward, you can use any new JS you want like backticks and => since we are going to transpile everything to ES5.

MAKE THIS NEW VERSION OF THE LIBRARY OPTIMIZED FOR WEBPACK (but know that it WONT ALWAYS BE USED WITH WEBPACK)

We are going to completely rewrite and refactor this library. Let's start with how and where it will be used.
1. Web: It will be webpacked with a project that transpiles everything to ES5
2. Electron: It will be used in an Electron app.
3. Chrome Extension: It will be used in a Chrome extension.

Now lets go over what I want to keep.
1. Firebase
  - Let's updte to use the latest version of Firebase (12)
  - I want a sort of "mini firebase auth wrapper" that has some basic functions
    - auth.ready(options).then(result => {})
      - This should return a promise that resolves when the auth is ready OR not (so i can call it when the page loads and result will either be the signed in user or nothing if they are not signed in)
      - result (AN OBJECT) = {
        user: the signed in firebase user OR null
        account: the signed in user's acconunt data IF requested in options.account = true
      }
    - We will for sure need to have Firebase auth, firestore, messaging.
2. Manager.prototype.notifications
  - Easily check if subscribed and subscribe to push notifications. Keeps track in local storage.
  - automatically requests permission after a click and a timeout
3. Manager.prototype.storage
  - A simple wrapper around localStorage and sessionStorage that allows for easy setting, getting, and removing of items.
4. navigator.serviceWorker.register
  - A simple wrapper around the service worker registration that allows for easy registration and unregistration.

Some things we can definitely remove:
1. Most of the legacy/lib/dom.js library since webpack can help me avoid this shit. BUT i do want a light helper that does some things
  - loadScript so we can load and dynamically import external scripts
2. I think we can remove init_loadPolyfills since we are transpiling, correct?
3. Most of legacy/lib/utilities.js
  - Keep clipboardCopy, escapeHTML, getContext

