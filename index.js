/*
https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
https://gomakethings.com/listening-for-click-events-with-vanilla-javascript/
*/
/**
 * DEPENDENCIES
 */
// var $ = require('jquery');
// var Color = require('color.js');
// var urlRegex = require('url-regex');
// const contextMenu = require('electron-context-menu')
// var globalCloseableTabsOverride;
const ajax = require('./lib/ajax.js');
const polyfills = require('./lib/polyfills.js');
const dom = require('./lib/dom.js');
const query = require('./lib/query.js');

var _eventHandlersSet = false;
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
  this.properties = {
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
    }
  };



  set(this, 'properties.options.page', pageOptions);
  set(this, 'properties.options.global', globalOptions);
  set(this, 'properties.global.domain', document.location.hostname);
  set(this, 'properties.global.url', document.location.href);
}

  /**
  * METHODS
  */
  Manager.prototype.get = function(path) {
   return get(this, 'properties.' + path);
  }

  Manager.prototype.set = function(path, value) {
   return set(this, 'properties.' + path, value);
  }

  if (true) {
    Manager.prototype.initDone = function() {
     return true;
    }
  }

  Manager.prototype.getQueryParameter = function(key) {
   return get(this, 'properties.page.queryString.' + key, undefined);
  }
  Manager.prototype.testFunction = function() {
   console.log('TEST FUNCTION');
   return true;
  }

  Manager.prototype.testFunctionBooleanBlock = function(boolean) {
    if (boolean == true) {
      trueBlock();
    } else {
      falseBlock();
    }
   return true;
  }

  function falseBlock() {
    console.log('LOG>falseBlock');
  }
  function trueBlock() {
    console.log('LOG>trueBlock');
  }

  Manager.prototype.setEventListeners = function() {
    console.log('setEventListeners() private var =', _eventHandlersSet);
    if (_eventHandlersSet == false) {
      _eventHandlersSet = true;
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
  }

  Manager.prototype.init = async function() {
    console.log('INIT Called');
    await wait(300,100)
    console.log('INIT finished waiting');
    // this.testFunction();

    // setup
    this.setEventListeners();

    // make sure firebase etc is loaded and elements on page are updated to reflect user's auth status
    // also update properties so that it reflects whether the user is logged inspect

    // check that navigator exists

    //check local storage exists

    // parse query string

    // add cookie thing with settings

    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }


  /**
  * POLYFILLS
  */
  Manager.prototype.stringify = function(obj) {
    return polyfills.stringify(obj);
  }

  Manager.prototype.getObjectKeys = function(obj) {
    return polyfills.getObjectKeys(obj);
  }

  /**
  * QUERIES
  */
  Manager.prototype.parseQuery = function(url, options) {
    return query.parseQuery(url, options);
  }

  Manager.prototype.addQuery = function(obj, key, val) {
    return query.addQuery(obj, key, val);
  }

  /**
  * DOM OPERATIONS
  */
  Manager.prototype.ajax = function(options) {
    return ajax(options);
  }

  Manager.prototype.forEach = function(array, callback, scope) {
    return dom.forEach(array, callback, scope);
  }

  Manager.prototype.removeClass = function(selector, name) {
    return dom.removeClass(selector, name);
  }

  Manager.prototype.addClass = function(selector, name) {
    return dom.addClass(selector, name);
  }

  Manager.prototype.hide = function(selector, options) {
    return dom.hide(selector, options);
  }

  Manager.prototype.show = function(selector, options) {
    return dom.show(selector, options);
  }

  Manager.prototype.getAttribute = function(selector, attr, options) {
    return dom.setAttribute(selector, attr, options);
  }

  Manager.prototype.setAttribute = function(selector, attr, attrValue, options) {
    return dom.setAttribute(selector, attr, attrValue, options);
  }

  Manager.prototype.removeAttribute = function(selector, attr, options) {
    return dom.removeAttribute(selector, attr, options);
  }

  Manager.prototype.getInputValue = function(selector, options) {
    return dom.getInputValue(selector, options);
  }

  Manager.prototype.setInputValue = function(selector, toValue, options) {
    return dom.setInputValue(selector, toValue, options);
  }

  Manager.prototype.setInputValue = function(selector, html, options) {
    return dom.setInnerHTML(selector, html, options);
  }

  // forEach: _forEach,
  // removeClass: _removeClass,
  // addClass: _addClass,
  // hide: _hide,
  // show: _show,
  // setAttribute: _setAttribute,
  // removeAttribute: _removeAttribute,
  // getInputValue: _getInputValue,
  // setInputValue: _setInputValue,


  function loadLibraries() {
    let firebase; //@@@MOVE TO OUTSIDE?
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

  function wait(msec, range) {
    var min = 0;
    var randomNumPlus = (Math.random() * (range - min) + min);
    var randomNumMinus = (Math.random() * (range - min) + min);
    msec = msec + randomNumPlus - randomNumMinus;
    msec = (msec <= 0) ? 50 : msec;
    return new Promise(resolve => setTimeout(resolve, msec));
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

module.exports = Manager;
