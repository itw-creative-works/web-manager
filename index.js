/*
https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
https://gomakethings.com/listening-for-click-events-with-vanilla-javascript/

JQUERY Ready
https://github.com/jquery/jquery/blob/master/src/core/ready.js
https://github.com/julienschmidt/contentloaded/blob/master/contentloaded.js
https://github.com/dperini/ContentLoaded/blob/master/src/contentloaded.js
https://github.com/pirxpilot/domready/blob/master/index.js
* https://gomakethings.com/a-native-javascript-equivalent-of-jquerys-ready-method/

*/
/**
 * DEPENDENCIES
 */

var ajax = require('./lib/ajax.js');
var dom = require('./lib/dom.js');
var query = require('./lib/query.js');
var utilities = require('./lib/utilities.js');
var storage = require('./lib/storage.js');

/**
* MODULE
*/

function Manager() {
  /**
  * OPTIONS
  */
  this.properties = {
    options: {
      page: {},
      global: {},
    },
    page: {
      code: '',
      url: '',
      status: {
        ready: false,
        initilizing: false,
        authReady: false,
        masterSWRegistered: false,

        DOMContentLoaded: false,
        eventHandlersSet: false,
      },
      // initReady: false,
      // initSecondaryReady: false,
      queryString: {
        data: {},
        exists: undefined,
      },

      // auth: {
      //   status: undefined,
      //   lastAction: 'unknown',
      // },
    },
    global: {
      version: '',
      url: '',
      cacheBreaker: '',
      // preferences: {
      //   // firebase: {
      //   //   enabled: false
      //   // },
      //   // pushNotifications: {
      //   //   enabled: false
      //   // },
      //   // load: {
      //   //   variables: '',
      //   //   functionsFirebase: '',
      //   // },
      //   // auth: {
      //   //   prohibitedReturnURL: '',
      //   //   requiredReturnURL: '',
      //   // },
      // },
    },
    auth: {
      user: false,
    },
    // firebase: {
    //   user: {
    //     exists: false,
    //     authStateChangeRan: false,
    //     authObject: {}
    //   },
    //   config: {
    //     apiKey: '',
    //     authDomain: '',
    //     databaseURL: '',
    //     projectId: '',
    //     storageBucket: '',
    //     messagingSenderId: '',
    //   },
    //   functions: {
    //     auth: undefined,
    //     messaging: undefined,
    //     database: undefined,
    //     firestore: undefined,
    //   },
    // },
    meta: {
      environment: 'production'
    }
  };

  try {
    // set(this, 'properties.options.page', pageOptions);
    // set(this, 'properties.options.global', globalOptions);
    // set(this, 'properties.global.domain', document.location.hostname);
    // set(this, 'properties.page.url', document.location.href);
    // this.properties.options.page = pageOptions || {};
    // this.properties.options.global = globalOptions || {};]
    // this.properties.global.urlRoot = window.location.protocol + '//' + window.location.hostname;
    this.properties.page.url = window.location.href;
  } catch (e) {

  }

}

  /**
  * METHODS
  */
  Manager.prototype.get = function(path) {
    return utilities.get(this, 'properties.' + path);
  }

  Manager.prototype.set = function(path, value) {
   return utilities.set(this, 'properties.' + path, value);
  }

  Manager.prototype.setEventListeners = function() {
    if (utilities.get(this, 'properties.page.status.eventHandlersSet', false) == false) {
      this.properties.page.status.eventHandlersSet = true;
      var This = this;
      // document.addEventListener('click', function (event) {
      This.dom().select('body').on('click', function (event) {
        This.log('Clicked', event.target);
        // auth events
        if (event.target.matches('.auth-signin-email-btn')) {
          This.signIn('email');
        } else if (event.target.matches('.auth-signup-email-btn')) {
          This.signUp('email');
        } else if (event.target.matches('.auth-signout-all-btn')) {
          This.signOut();
        } else if (event.target.matches('.auth-forgot-all-btn')) {
          This.forgot();
        }

        // push notification events
        if (event.target.matches('.auth-subscribe-push-notifications-btn')) {
          This.subscribeToPushNotifications();
        } else if (false) {

        }

      }, false);
    }
  }

  Manager.prototype.signIn = function(method, email, password) {
    method = method || 'email';
    email = email || this.dom().select('.auth-email-input').getValue();
    password = password || this.dom().select('.auth-password-input').getValue();
    var This = this;
    This.log('Signin attempt: ', method, email, password);
    if (method == 'email') {
      firebase.auth().signInWithEmailAndPassword(email, password)
      .then(function(credential) {
        This.log('Good signin');
        This.properties.options.auth.signIn(false, credential.user);
      })
      .catch(function(error) {
        This.dom().select('.auth-error-message-element').show().setInnerHTML(error.message);
        This.log('error', error.message);
        This.properties.options.auth.signIn(error);
      });
    }
  }

  Manager.prototype.signUp = function(method, email, password, passwordConfirm) {
    method = method || 'email';
    email = email || this.dom().select('.auth-email-input').getValue();
    password = password || this.dom().select('.auth-password-input').getValue();
    passwordConfirm = passwordConfirm || this.dom().select('.auth-password-confirm-input').getValue();
    var This = this;
    This.log('Signup attempt: ', method, email, password, passwordConfirm);
    if (method == 'email') {
      firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(function(credential) {
        This.log('Good signup');
        This.properties.options.auth.signUp(false, credential.user);
      })
      .catch(function(error) {
        This.dom().select('.auth-error-message-element').show().setInnerHTML(error.message);
        This.log('error', error.message);
        This.properties.options.auth.signUp(error);
      });
    }
  }

  Manager.prototype.signOut = function() {
    this.log('signOut');
    var This = this;
    firebase.auth().signOut()
    .then(function() {
      This.log('signOut success.');
      This.properties.options.auth.signOut();
    })
    .catch(function(error) {
      This.log('signOut failed: ', error);
      This.properties.options.auth.signOut(error);
    });
  }

  Manager.prototype.forgot = function(email) {
    email = email || this.dom().select('.auth-email-input').getValue();
    this.log('forgot');
    var This = this;

    firebase.auth().sendPasswordResetEmail(email)
    .then(function() {
      This.log('forgot success.');
      This.properties.options.auth.forgot();
    })
    .catch(function(error) {
      This.log('forgot failed: ', error);
      This.dom().select('.auth-error-message-element').show().setInnerHTML(error.message);
      This.properties.options.auth.forgot(error);
    });

  }

  Manager.prototype.authStateHandler = function(user) {
    var This = this;
    This.log('authStateHandler', user);
    if (user != null) {
      if (user.isAnonymous === false) {
        _authHandle_in(This, user);
      } else {
        _authHandle_out(This);
      }
      This.properties.options.auth.authStateHandler(user);
    } else {
      // firebase.auth().signInAnonymously()
      // .then(function(user) {
      //   This.log('signInAnonymously', user);
      // })
      // .catch(function(error) {
      //   This.log('signInAnonymously error:', error);
      //   _authHandle_out(This);
      //   This.properties.options.auth.authStateHandler(user);
      // });
      _authHandle_out(This);
      This.properties.options.auth.authStateHandler(user);
    }
  }

  function _authHandle_in(This, user) {
    // This.log('_authHandle_in', user);
    var returnUrl = This.query().create(window.location.href).get('auth_return');
    if (returnUrl) {
      window.location.href = returnUrl;
      return;
    }
    if (This.properties.options.auth.state == 'prohibited') {
      window.location.href = This.properties.options.auth.sends.prohibited;
      return;
    }
    This.dom().select('.auth-signedin-true-element').show();
    This.dom().select('.auth-signedin-false-element').hide();
    This.dom().select('.auth-email-element').setInnerHTML(user.email);
    This.dom().select('.auth-uid-element').setInnerHTML(user.uid);

  }

  function _authHandle_out(This) {
    // This.log('_authHandle_out');
    if (This.properties.options.auth.state == 'required') {
      window.location.href = This.query().create(This.properties.options.auth.sends.required).add('auth_return', window.location.href).getUrl();
      return;
    }
    This.dom().select('.auth-signedin-true-element').hide();
    This.dom().select('.auth-signedin-false-element').show();
  }

  Manager.prototype.ready = function(fn, options) {
    options = options || {};
    options.retryInterval = options.retryInterval || 100;
    var This = this;
    if ( (utilities.get(this, 'properties.page.status.ready', false) == false) ) {
      setTimeout(function () {
        This.ready(fn, options);
      }, options.retryInterval);
    } else {
      return fn();
      // return checkDOMLoaded(window, fn);
    }
  }

  Manager.prototype.authReady = function(fn, options) {
    options = options || {};
    options.retryInterval = options.retryInterval || 100;
    var This = this;
    if ( (utilities.get(this, 'properties.page.status.authReady', false) == false) ) {
      setTimeout(function () {
        This.authReady(fn, options);
      }, options.retryInterval);
    } else {
      return fn();
    }
  }

  // Manager.prototype.init = async function() {
  // Manager.prototype.init = function() {
  //   if ((get(this, 'properties.page.status.ready', false) == false) && ((get(this, 'properties.page.status.initializing', false) == false))) {
  //     set(this, 'properties.page.status.initializing', true);
  //     console.log('INIT Called');
  //     // await wait(300,100);
  //     console.log('INIT finished waiting');
  //     // this.testFunction();
  //
  //     // setup
  //     this.setEventListeners();
  //
  //     // make sure firebase etc is loaded and elements on page are updated to reflect user's auth status
  //     // also update properties so that it reflects whether the user is logged inspect
  //
  //     // check that navigator exists
  //
  //     //check local storage exists
  //
  //     // parse query string
  //
  //     // add cookie thing with settings
  //     // _ready = true;
  //     set(this, 'properties.page.status.initializing', false);
  //     set(this, 'properties.page.status.ready', true);
  //
  //   }
  //
  //   return new Promise((resolve, reject) => {
  //     resolve(true);
  //   });
  // }

  // init with polyfills
  Manager.prototype.init = function(configuration, callback) {

    var This = this;
    if ((utilities.get(This, 'properties.page.status.ready', false) == false) && ((utilities.get(This, 'properties.page.status.initializing', false) == false))) {

      // set initializing to true
      This.properties.page.status.initializing = true;

      // set other properties
      This.properties.meta.environment = ((window.location.href.indexOf('localhost') != -1) || (window.location.href.indexOf('127.0.0.1') != -1)) ? 'development' : 'production';

      init_loadPolyfills(This, configuration, function() {
          This.properties.page.status.initializing = false;

          var options_defaults = {
            queryString: {
              saveToStorage: false,
            },
            pushNotifications: {
              enabled: true,
              timeoutCheck: 60, // how long to wait before auto ask, 0 to disable
            },
            initChecks: {
              DOMContentLoaded: false, // preset to false because takes a while and dont need if script is loaded at bottom of DOM
              features: [], // an array of javascript and dom features to check for (NIY)
            },
            auth: {
              state: 'default', // required, prohibited, default
              sends: {
                required: (This.properties.global.url + '/signin/'),
                prohibited: (This.properties.global.url + '/'),
              },
              authStateHandler: ()=>{}, // custom authStateHandler() function
              signIn: ()=>{}, // custom signIn() function
              signOut: ()=>{}, // custom signOut() function
              signUp: ()=>{}, // custom signUp() function
              forgot: ()=>{}, // custom signUp() function
            },
            popup: {
              enabled: true,
              settings: {
                title: '',
                message: '',
                btn_ok: {
                  text: '',
                  link: '',
                }
              }
            },
            libraries: {
              firebase_app: {
                enabled: true,
                config: {
                  apiKey: '',
                  authDomain: '',
                  databaseURL: '',
                  projectId: '',
                  storageBucket: '',
                  messagingSenderId: '',
                  appId: '',
                }
              },
              firebase_firestore: {
                enabled: true,
              },
              firebase_messaging: {
                enabled: true,
              },
              firebase_auth: {
                enabled: true,
              },
              lazysizes: {
                enabled: true,
              },
              sentry: {
                enabled: true,
                config: {
                  dsn: '',
                  release: '',
                }
              },
              tawk: {
                enabled: true,
                config: {
                  chatId: '',
                }
              },
              cookieconsent: {
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
            },
          };

          var options_user = {};
          function eachRecursive(obj, parent) {
            parent = (!parent) ? '' : parent;
              for (var key in obj) {
                if (typeof obj[key] == "object" && obj[key] !== null && !Array.isArray(obj[key])) {
                  eachRecursive(obj[key], parent + key + '.');
                } else {
                  utilities.set(options_user, parent + key, utilities.get(options_defaults, parent + key) );
                  var t_globalItem = utilities.get(configuration, 'global.settings.' + parent + key, undefined);
                  var t_pageItem = utilities.get(configuration, 'page.settings.' + parent + key, undefined);
                  if (typeof t_globalItem !== 'undefined') {
                    utilities.set(options_user, parent + key, t_globalItem);
                  }
                  if (typeof t_pageItem !== 'undefined') {
                    utilities.set(options_user, parent + key, t_pageItem);
                  }
                }
              }
          }

          eachRecursive(options_defaults);
          This.log('Configured user options: ', options_user);
          This.properties.options = options_user;

          // set non-option properties
          This.properties.global.version = configuration.global.version;
          This.properties.global.url = configuration.global.url;
          This.properties.global.cacheBreaker = configuration.global.cacheBreaker;

          // check DOMContentLoaded
          // if (utilities.get(options_user, 'initChecks.DOMContentLoaded', false) == true) {
          if (options_user.initChecks.DOMContentLoaded == true) {
            This.dom().checkDOMContentLoaded(window, function() {
              This.properties.page.status.DOMContentLoaded = true;
              This.log('DOMContentLoaded = ', This.properties.page.status.DOMContentLoaded);
            });
          } else {
            This.properties.page.status.DOMContentLoaded = true;
            This.log('DOMContentLoaded = ', This.properties.page.status.DOMContentLoaded);
          }

          // parse query stringify
          This.properties.page.queryString = This.query()
            .create(window.location.href, {});

          // load critical libraries
          Promise.all([
            load_sentry(This, options_user),
            load_firebase(This, options_user),
          ]).then(function() {

            // handle firebase user
            if (firebase.auth) {
              firebase.auth().onAuthStateChanged(function(user) {
                This.properties.page.status.authReady = true;
                This.properties.auth.user = user || false;
                This.authStateHandler(user);
              })
            }

            // setup
            This.setEventListeners();

            // run the init callback
            This.properties.page.status.ready = true;
            callback();

            // loan non-critical libraries
            load_lazysizes(This, options_user);
            load_cookieconsent(This, options_user);
            subscriptionManager(This, options_user);

            This.log('Manager ', This);
            return;
          });

      })

    } else {
      return;
    }

  }

  Manager.prototype.subscribeToPushNotifications = function(options) {
    if ((typeof firebase.messaging !== 'undefined')) {
      return firebase.messaging().requestPermission()
        .then(() => checkSubscription())
        .catch((err) => {
          console.error(err);
        });
    }
  }


  /*
  HELPERS
  */
  function subscriptionManager(This, options_user) {
    if (('serviceWorker' in navigator) && (options_user.pushNotifications.enabled) && (typeof firebase.messaging !== 'undefined')) {
      // navigator.serviceWorker.register('/assets/js/master/service-workers/firebase-messaging-sw.js?config=' + encodeURIComponent(JSON.stringify(options_user.libraries.firebase_app.config)) + '&cb=' + This.properties.global.cacheBreaker )
      navigator.serviceWorker.register('/assets/js/master/service-workers/master-service-worker.js?config=' + encodeURIComponent(JSON.stringify(options_user.libraries.firebase_app.config)) )
      .then(function (registration) {
        firebase.messaging().useServiceWorker(registration);
        // registration.update();
        This.properties.page.status.masterSWRegistered = true;

        firebase.messaging().onTokenRefresh(handleTokenRefresh);

        if (options_user.pushNotifications.timeoutCheck > 0) {
          setTimeout(function () {
            This.subscribeToPushNotifications();
          }, options_user.pushNotifications.timeoutCheck * 1000);
        }
      })
      .catch(function (e) {
        console.error(e);
      });

    }
  }

  function handleTokenRefresh() {
    return firebase.messaging().getToken()
      .then((token) => {
        if (token) {
          updateSubscription(token);
        } else {
          console.error('Failed to get token');
        }
      })
      .catch(function(e) {
        console.error(e);
      });
  }

  function updateSubscription(token) {
    console.log('updateSubscription()');
    return firebase.firestore().doc('notifications/subscriptions/all/' + token)
      .set(
        {
          dateSubscribed: {
            timestamp: getDateTime(),
            timestampUNIX: new Date().getTime(),
          },
          token: token,
          linked: {
            user: {
              timestampLastLinked: getDateTime(),
              data: {
                uid: firebase.auth().currentUser.uid || ''
              }
            }
          },
          tags: ['general']
        },
        {
          merge: true
        }
      )
      .then(function() {
        window.Manager.log('Updated token: ', token);
      })
      .catch(function(e) {
        console.error(e);
      });
  }

  function checkSubscription() {
    // console.log('checkSubscription()');
    // console.log('MANAGER!!!', Manager);
    // console.log('window.MANAGER!!!', window.Manager);
    return firebase.messaging().getToken()
      .then((token) => {
        if (token) {
          return firebase.firestore().doc('notifications/subscriptions/all/' + token)
            .get()
            .then(function (documentSnapshot) {
              if (documentSnapshot.exists == false) {
                window.Manager.log('Subscribing now');
                updateSubscription(token)
                .then(function () {
                  window.Manager.log('Subscribe done!');
                })
              } else {
                window.Manager.log('Already subscribed');
              }
            })
            .catch(function(e) {
              console.error(e);
            });
        } else {
          console.error('Failed to get token');
        }
      })
      .catch(function(e) {
        console.error(e);
      });
  }


  /*
  EXTERNAL LIBS
  */
  var load_firebase = (This, options) => new Promise((resolve) => {
    if (typeof window.firebase !== 'undefined') {
      return resolve();
    }
    if (options.libraries.firebase_app.enabled == true) {
      require.ensure([], () => {
        window.firebase = require('firebase/app');
        window.app = firebase.initializeApp(options.libraries.firebase_app.config);
        This.log('Loaded Firebase.');
      }, 'firebase-app')
      .then(function() {
        Promise.all([
          load_firebase_auth(This, options),
          load_firebase_firestore(This, options),
          load_firebase_messaging(This, options),
        ])
        .then(function() {
          return resolve();
        });
       });
    } else {
      return resolve();
    }

  });

  var load_firebase_auth = (This, options) => new Promise((resolve) => {
    if (typeof utilities.get(window, 'firebase.auth', undefined) !== 'undefined') {
      return resolve();
    }
    if (options.libraries.firebase_auth.enabled == true) {
      require.ensure([], () => {
        require('firebase/auth');
        This.log('Loaded Firebase Auth.');
      }, 'firebase-auth')
      .then(function() {
        return resolve();
      });
    } else {
      return resolve();
    }

  });

  var load_firebase_firestore = (This, options) => new Promise((resolve) => {
    if (typeof utilities.get(window, 'firebase.firestore', undefined) !== 'undefined') {
      return resolve();
    }
    if (options.libraries.firebase_firestore.enabled == true) {
      require.ensure([], () => {
        require('firebase/firestore');
        This.log('Loaded Firestore.');
      }, 'firebase-firestore')
      .then(function() {
        return resolve();
      });
    } else {
      return resolve();
    }

  });

  var load_firebase_messaging = (This, options) => new Promise((resolve) => {
    if (typeof utilities.get(window, 'firebase.messaging', undefined) !== 'undefined') {
      return resolve();
    }
    if (options.libraries.firebase_messaging.enabled == true) {
      require.ensure([], () => {
        require('firebase/messaging');
        This.log('Loaded Firebase Messaging.');
      }, 'firebase-messaging')
      .then(function() {
        return resolve();
      });
    } else {
      return resolve();
    }

  });

  var load_lazysizes = (This, options) => new Promise((resolve) => {
    if (typeof window.lazysizes !== 'undefined') {
      return resolve();
    }
    if (options.libraries.lazysizes.enabled == true) {
      require.ensure([], () => {
        window.lazysizes = require('lazysizes');

        // configs come from official lazysizes demo
        var expand = Math.max(Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight, 1222) - 1, 359);
        window.lazySizesConfig = {
          loadMode: 1,
          expand: expand,
          expFactor: expand < 380 ? 3 : 2,
        };
        This.log('Loaded Lazysizes.');
      }, 'lazysizes')
      .then(function() {
        return resolve();
      });
    } else {
      return resolve();
    }

  });

  var load_cookieconsent = (This, options) => new Promise((resolve) => {
    if (typeof window.cookieconsent !== 'undefined') {
      return resolve();
    }
    if (options.libraries.cookieconsent.enabled == true) {
      require.ensure([], () => {
        require('cookieconsent');
        window.cookieconsent.initialise(options.libraries.cookieconsent.config);
        This.log('Loaded Cookieconsent.');
      }, 'cookieconsent')
      .then(function() {
        return resolve();
      });
    } else {
      return resolve();
    }

  });

  var load_tawk = (This, options) => new Promise((resolve) => {
    if (typeof window.Tawk_API !== 'undefined') {
      return resolve();
    }
    if (options.libraries.tawk.enabled == true) {
      window.Tawk_API = window.Tawk_API || {}, window.Tawk_LoadStart = new Date();
      This.dom().loadScript({src: 'https://embed.tawk.to/' + utilities.get(options, 'libraries.tawk.config.chatId', '') + '/default', crossorigin: true}, function() {
        This.log('Loaded tawk.');
        return resolve();
      });
    } else {
      return resolve();
    }
  });

  var load_sentry = (This, options) => new Promise((resolve) => {
    if (typeof window.Sentry !== 'undefined') {
      return resolve();
    }
    if (options.libraries.sentry.enabled == true) {
      require.ensure([], () => {
        window.Sentry = require('@sentry/browser');
        var config = options.libraries.sentry.config;
        config.release = config.release + '@' + This.properties.global.version;
        config.environment = This.properties.meta.environment;
        Sentry.init(config);
        This.log('Loaded Sentry.');
        // This.log('Loaded @sentry/browser.', config);
      }, '@sentry/browser')
      .then(function() {
        return resolve();
      });
    } else {
      return resolve();
    }
  });

  Manager.prototype.log = function() {
    try {
      if (this.properties.meta.environment == 'development') {
        // 1. Convert args to a normal array
        var args = Array.prototype.slice.call(arguments);

        // 2. Prepend log prefix log string
        args.unshift('[DEV LOG]');

        // 3. Pass along arguments to console.log
        if (args[1] == 'error') {
          args.splice(1,1);
          console.error.apply(console, args);
        } else if (args[1] == 'warn') {
          args.splice(1,1);
          console.warn.apply(console, args);
        } else if (args[1] == 'log') {
          args.splice(1,1);
          console.log.apply(console, args);
        } else {
          console.log.apply(console, args);
        }
      }
    } catch (e) {

    }
  }

  // Manager.prototype.time = function(mode, name) {
  //   console.log('&&& called time ', mode, name);
  //   if (this.properties.meta.environment == 'development') {
  //     if (mode == 'start') {
  //       console.time(name);
  //     } else {
  //       console.timeEnd(name);
  //     }
  //   }
  // }

  function init_loadPolyfills(This, configuration, callback) {
    // console.log('POLY TEST', document.querySelectorAll);
    // https://github.com/jquintozamora/polyfill-io-feature-detection/blob/master/index.js
    var featuresDefault = (
      // (typeof Promise !== "undefined" && Promise.toString().indexOf("[native code]")) &&
      'Promise' in window &&
      'startsWith' in String.prototype &&
      'endsWith' in String.prototype &&

      'includes' in Array.prototype &&
      'forEach' in Array.prototype &&
      'isArray' in Array &&

      'assign' in Object &&
      'keys' in Object &&

      'stringify' in JSON &&
      'parse' in JSON &&

      document.querySelectorAll &&
      document.querySelector &&

      'IntersectionObserver' in window &&
      'IntersectionObserverEntry' in window &&
      'intersectionRatio' in window.IntersectionObserverEntry.prototype &&
      // (
      // !('IntersectionObserver' in window) ||
      // !('IntersectionObserverEntry' in window) ||
      // !('intersectionRatio' in window.IntersectionObserverEntry.prototype)
      // ) &&

      'HTMLPictureElement' in window &&
      'createEvent' in document &&
      'addEventListener' in window &&
      'localStorage' in window &&

      true
    )
    var featuresCustom = true;
    // for (var i = 0; i < options_user.initChecks.features.length; i++) {
    //   array[i]
    // }

    if (featuresDefault && featuresCustom) {
      callback();
    } else {
      This.dom().loadScript({src: 'https://polyfill.io/v3/polyfill.min.js?flags=always%2Cgated&features=default'}, function() {
        console.log('%cLoaded polyfill.io.', 'font-weight: bold');
        callback();
      });
    }

  }

  /**
  * UTILITIES
  */
  Manager.prototype.utilities = function() {
    return utilities;
  }

  /**
  * STORAGE
  */
  Manager.prototype.storage = function() {
    return storage;
  }

  /**
  * QUERIES
  */
  Manager.prototype.query = function() {
    return query;
  }

  /**
  * DOM OPERATIONS
  */
  Manager.prototype.dom = function() {
    return dom;
  }
  Manager.prototype.ajax = function() {
    return ajax;
  }


  /**
  * HELPERS
  */
  function wait(msec, range) {
    var min = 0;
    var randomNumPlus = (Math.random() * (range - min) + min);
    var randomNumMinus = (Math.random() * (range - min) + min);
    msec = msec + randomNumPlus - randomNumMinus;
    msec = (msec <= 0) ? 50 : msec;
    return new Promise(resolve => setTimeout(resolve, msec));
  }

  function getDateTime(type) {
    var d = new Date;
    var date = zeroFill(d.getFullYear(),2)+'-'+zeroFill(d.getMonth()+1,2)+'-'+zeroFill(d.getDate(),2);
    var time = zeroFill(d.getHours(),2)+':'+zeroFill(d.getMinutes(),2)+':'+zeroFill(d.getSeconds(),2)+'Z';
    if (type == 'date') {
      return date;
    } else if (type == 'time') {
      return time;
    } else {
      return date+"T"+time;
    }
  }

  function zeroFill( number, width ) {
    width -= number.toString().length;
    if ( width > 0 )
    {
      return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
    }
    return number + ""; // always return a string
  }

module.exports = Manager;
