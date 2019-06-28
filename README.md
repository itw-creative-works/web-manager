<div align="center">
  <a href="https://cdn.itwcreativeworks.com/assets/itw-creative-works/images/logo/itw-creative-works-pictoral-black-x.svg">
    <img src="https://cdn.itwcreativeworks.com/assets/itw-creative-works/images/logo/itw-creative-works-pictoral-black-x.svg">
  </a>
  <br>
  <br>

![GitHub package.json version](https://img.shields.io/github/package-json/v/itw-creative-works/web-manager.svg)

![David](https://img.shields.io/david/itw-creative-works/web-manager.svg)
![David](https://img.shields.io/david/dev/itw-creative-works/web-manager.svg) <!-- ![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/itw-creative-works/web-manager.svg) -->
![npm bundle size](https://img.shields.io/bundlephobia/min/web-manager.svg)
![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability-percentage/itw-creative-works/web-manager.svg)
![npm](https://img.shields.io/npm/dm/web-manager.svg)
![node](https://img.shields.io/node/v/web-manager.svg)
![Website](https://img.shields.io/website/https/itwcreativeworks.com.svg)
![GitHub](https://img.shields.io/github/license/itw-creative-works/web-manager.svg)
![GitHub contributors](https://img.shields.io/github/contributors/itw-creative-works/web-manager.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/itw-creative-works/web-manager.svg)


# Web Manager
**Web Manager** is an NPM module that instantly implements a few common libraries and functions that every developer should be using on their websites to enhance the user experience.

[Site](https://itwcreativeworks.com) | [NPM Module](https://www.npmjs.com/package/web-manager) | [GitHub Repo](https://github.com/itw-creative-works/web-manager)

</div>

## Install
Install with npm:
```shell
npm install web-manager
```

## Features
* Dom API that acts as a super lightweight and optimized version of jQuery.
* AJAX API to request resources and POST requests
* URL query constructor and deconstructor
* Localstorage API
* Utility API with our favorite methods from Lodash such as `get` and `set`
* Polyfill detection and implementation for Promises, Array methods, and more!

## Libraries
* Firebase (Firebase app, Firestore, Auth, & Messaging)
* Lazysizes to lazyload images
* Sentry to report errors
* Tawk to implement a chatbox
* Cookieconsent to comply with GDPR

## Example Setup
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

## Example Usage
Lets go over some example usage of the library.

### Kitchen Sink Config example
By default, all of the libraries are enabled. But you can simply set `enabled` to `false` to disable any of them. Most of these libraries work without configuration but for some, such as Firebase, Tawk, and Sentry, you must supply the relevant IDs and API keys.

```html
<script type="text/javascript">
var config =
  {
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
        },
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
            // href: '' || This.properties.global.urlRoot + '/cookies/',
            href: (This.properties.global.url + '/cookies/'),
          }
        }
      },
      lazysizes: { // No config required
        enabled: true,
      }      
    }
  }
  var Manager = new (require('web-manager'));
  var config = {
    // ... your config here
  }
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

<script type="text/javascript">
  Manager.ready(function() {
    console.log('--- Exploring the .dom() API ---');
    const el = Manager.dom().select('.el'); // Select using a standard querySelectorAll argument
    el.addClass('new-class'); // Add a class
    el.removeClass('old-class'); // Remove a class
    el.each(function(index, element) { // Iterate through the elements
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

    // Loading a script
    Manager.dom()
    .loadScript({src: 'https://platform.twitter.com/widgets.js', crossorigin: true}, function() {
      Manager.log('Loaded Twitter script.');
    });

  });
</script>
```

### Utilizing the .query() API
The Web Manager .query() API is used to construct and deconstruct a query string.
```html
<script type="text/javascript">
  Manager.ready(function() {
    console.log('--- Exploring the .query() API ---');
    // var url = window.location.href;
    var url = 'https://google.com?key1=val1'; // For testing purposes, you can use this since your URL may not have a query string

    var query = Manager.query().create(url);
    console.log('getUrl ', query.getUrl()); // Get url (with query string appended)
    console.log('getAll ', query.getAll()); // Get all queries
    query.add('key2', 'val2'); // Add a key
    query.add('key3', 'val3'); // Add another key
    query.add('key4', ); // Add a blank key
    query.remove('key3'); // Remove a key

    console.log('getAll (2)', query.getAll());
    console.log('getUrl (2)', query.getUrl());

    query.removeAll(); // Remove all keys

    console.log('getAll (3)', query.getAll());
    console.log('getUrl (3)', query.getUrl());


  });
</script>
```

### Utilizing the .utilities() API
The Web Manager .utilities() API wraps some useful functions such as getting and setting values of objects.
```html
<script type="text/javascript">
  console.log('--- Exploring the .utilities() API ---');
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
</script>
```

### Utilizing the .storage() API
The Web Manager .storage() API is a wrapper for the localStorage API that automatically checks if localStorage is supported, automatically serializing (`JSON.stringify()`) and parsing (`JSON.parse()`) the inputs and outputs allowing you to natively work with storing objects in localStorage without any extra work!
```html
<script type="text/javascript">
  Manager.ready(function() {
    console.log('--- Exploring the .storage() API ---');

    // By default, all methods only affect the the assigned node 'managerRoot'
    Manager.storage().clear(); // Clear managerRoot node
    console.log(Manager.storage().get('key1', '1')); // Get a key with a default of 1 if key doesnt exist
    console.log(Manager.storage().set('key1', '2')); // Set a key
    console.log(Manager.storage().get('key1', '1'));
    console.log(Manager.storage().get('', '1'));
    console.log(Manager.storage().set('key1.key2.key3.key4', 'inner4')); // Set a nested key
    console.log(Manager.storage().get('', '1'));
  });
</script>
```


## Final Words
If you are still having difficulty, we would love for you to post
a question to [the Web Manager issues page](https://github.com/itw-creative-works/web-manager/issues). It is much easier to answer questions that include your code and relevant files! So if you can provide them, we'd be extremely grateful (and more likely to help you find the answer!)

## Projects Using this Library
[Somiibo](https://somiibo.com/): A Social Media Bot with an open-source module library.
[JekyllUp](https://jekyllup.com/): A website devoted to sharing the best Jekyll themes.
[Slapform](https://slapform.com/): A backend processor for your HTML forms on static sites.
[SoundGrail Music App](https://app.soundgrail.com/): A resource for producers, musicians, and DJs.
[Hammock Report](https://hammockreport.com/): An API for exploring and listing backyard products.

Ask us to have your project listed! :)
