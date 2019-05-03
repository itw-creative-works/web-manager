/**
 * DEPENDENCIES
 */
// var $ = require('jquery');
// var Color = require('color.js');
// var urlRegex = require('url-regex');
// const contextMenu = require('electron-context-menu')
// var globalCloseableTabsOverride;

/**
* MODULE
*/
// function Manager(context, pageOptions, globalOptions) {
function Manager(pageOptions, globalOptions) {
  /**
  * OPTIONS
  */
  var pageOptions_defaults = {
      option1: true,
  };
  var globalOptions_defaults = {
      option1: true,
  };
  pageOptions = pageOptions ? Object.assign(pageOptions_defaults, pageOptions) : pageOptions_defaults;
  globalOptions = globalOptions ? Object.assign(globalOptions_defaults, globalOptions) : globalOptions_defaults;
  // context = context ? context : window || document.window;
  // let context = document;
  var structure = {
    options: {
      page: {},
      global: {},
    },
    page: {
      code: '',
      DOMLoaded: false,
      initReady: false,
      initSecondaryReady: false,
      queryString: {
        data: {},
        exists: undefined
      },
      auth: {
        status: undefined,
        lastAction: 'unknown',
      },
    },
    global: {
      domain: '',
      url: '',
      preferences: {
        firebase: {
          enabled: false
        },
        pushNotifications: {
          enabled: false
        },
        load: {
          variables: '',
          functionsFirebase: '',
        },
        auth: {
          prohibitedReturnURL: '',
          requiredReturnURL: '',
        }
      },
    },
    firebase: {
      user: {
        exists: false,
        authStateChangeRan: false,
        authObject: {}
      },
      config: {
        apiKey: '',
        authDomain: '',
        databaseURL: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
      },
      functions: {
        auth: undefined,
        messaging: undefined,
        database: undefined,
        firestore: undefined,
      },
    },
  }

  /**
  * GLOBALS & ICONS
  */
  set(this, 'properties', structure);
  set(this, 'properties.options.page', pageOptions);
  set(this, 'properties.options.global', globalOptions);
  set(this, 'properties.global.domain', document.location.hostname);
  set(this, 'properties.global.url', document.location.href);

  /**
  * METHODS
  */
  Manager.prototype.get = function(path) {
   return get(this, path);
  }

  Manager.prototype.set = function(path, value) {
   return set(this, path, value);
  }

  if (true) {
    Manager.prototype.initDone = function() {
     return true;
    }
  }

  Manager.prototype.getQueryParameter = function(key) {
   return get(this, 'properties.page.queryString.' + key, undefined);
  }

  Manager.prototype.setEventListeners = function() {
   return setEventListeners();
  }

  function setEventListeners() {
    console.log('setEventListeners()');
    document.addEventListener('click', function (event) {
      console.log('CLICKED >', event.target);
      // auth events
    	if (event.target.matches('#btn-auth-signin')) {
      } else if (event.target.matches('#btn-auth-signup')) {

      } else if (event.target.matches('#btn-auth-signout')) {

      }

      // push notification events
      if (event.target.matches('.btn-auth-subscribeToNotifications')) {

      } else if (false) {

      }

    }, false);
  }

  Manager.prototype.init = function() {

  }

  function loadLibraries() {
    let firebase;
    firebase = window.firebase;
    firebase = (firebase) ? firebase : true;
  }

  /**
  * HELPERS
  */
  /* https://gist.github.com/jeneg/9767afdcca45601ea44930ea03e0febf */
  function get(obj, path, def) {
  	var fullPath = path
  		.replace(/\[/g, '.')
  		.replace(/]/g, '')
  		.split('.')
  		.filter(Boolean);

  	return fullPath.every(everyFunc) ? obj : def;

  	function everyFunc(step) {
  		return !(step && (obj = obj[step]) === undefined);
  	}
  }

  /* https://stackoverflow.com/questions/54733539/javascript-implementation-of-lodash-set-method */
  function set(obj, path, value) {
   if (Object(obj) !== obj) {
     return obj;
   }; // When obj is not an object

   var p = path.split("."); // Get the keys from the path

   p.slice(0, -1).reduce(function (a, c, i) {
     return (// Iterate all of them except the last one
       Object(a[c]) === a[c] // Does the key exist and is its value an object?
       // Yes: then follow that path
       ? a[c] // No: create the key. Is the next key a potential array-index?
       : a[c] = Math.abs(p[i + 1]) >> 0 === +p[i + 1] ? [] // Yes: assign a new array object
       : {}
     );
   }, // No: assign a new plain object
   obj)[p.pop()] = value; // Finally assign the value to the last key

   return obj; // Return the top-level object to allow chaining
  }


  /**
  * LOGIC
  */
  // set(this, 'test.inner.innner2', context.location.href)


   // Creating a new constructor from the parent
   // function Mage(name, level, spell) {
   //     // Chain constructor with call
   //     Hero.call(this, name, level);
   //
   //     this.spell = spell;
   // }
}

module.exports = Manager;
