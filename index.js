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
// @TODO: code split these: http://jonathancreamer.com/advanced-webpack-part-2-code-splitting/
// var ajax = require('./lib/ajax.js');
var dom = require('./lib/dom.js');
// var query = require('./lib/query.js');
var utilities = require('./lib/utilities.js');
var storage = require('./lib/storage.js');
var debug;

// var ajax;
// var dom;
// var query;
// var utilities;
// var storage;


/**
* MODULE
*/
function ieVersion() {
  var match = /\b(MSIE |Trident.*?rv:|Edge\/)(\d+)/.exec(navigator.userAgent);
  if (match) {return parseInt(match[2])};
}

function Manager() {
  /**
  * OPTIONS
  */
  // Should this be changed?
  // var parseDELETE = function (req) {
  //   var result;
  //   try {
  //     result = JSON.parse(req.responseText);
  //   } catch (e) {
  //     result = req.responseText;
  //   }
  //   return [result, req];
  // };

  // var t1 = '16'; //@@@ Delete later
  iev = ieVersion();
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

        eventHandlersSet: false
      },
      // initReady: false,
      // initSecondaryReady: false,
      queryString: {},
      // libErrors: [],
      isSupportedBrowser: (!iev || iev >= 11) // https://makandracards.com/makandra/53475-minimal-javascript-function-to-detect-version-of-internet-explorer-or-edge

      // auth: {
      //   status: undefined,
      //   lastAction: 'unknown',
      // },
    },
    global: {
      version: '',
      url: '',
      cacheBreaker: '',
      brand: {
        name: 'default'
      },
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
      user: false
    },
    references: {
      serviceWorker: undefined
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
    // console.log('--------setEventListeners');
    if (!utilities.get(this, 'properties.page.status.eventHandlersSet', false)) {
      this.properties.page.status.eventHandlersSet = true;
      var This = this;
      // document.addEventListener('click', function (event) {
      This.dom().select('body').on('click', function (event) {
        // console.log('Clicked.... NEW');
        This.log('Clicked', event.target);
        // auth events
        if (event.target.matches('.auth-signin-email-btn')) {
          This.auth().signIn('email');
        } else if (event.target.matches('.auth-signup-email-btn')) {
          This.auth().signUp('email');
        } else if (event.target.matches('.auth-signout-all-btn')) {
          This.auth().signOut();
        } else if (event.target.matches('.auth-forgot-email-btn')) {
          This.auth().forgot();
        } else if (event.target.matches('#prechat-btn')) {
          load_tawk(This, This.properties.options);
        }

        // push notification events
        if (event.target.matches('.auth-subscribe-notifications-btn')) {
          //@@@NOTIFICATIONS
          This.notifications().subscribe()
          .catch(function (e) {
            console.error(e);
          });
        }

      }, false);
    }
  }

  // Requires firebase auth to be determined
  // function _setupTokenRefreshHandler(This) {
  //   // console.log('_setupTokenRefreshHandler', This.properties.page.status.authReady);
  //   if (This.properties.page.status.authReady) {
  //     return firebase.messaging().onTokenRefresh(
  //       handleTokenRefresh(This)
  //       .catch(function (e) {
  //         console.error(e);
  //       })
  //     );
  //   }
  //   setTimeout(function () {_setupTokenRefreshHandler(This)}, 300);
  // }

  function _authStateHandler(This, user) {
    // This.log('----authStateHandler', user);
    if (user) {
      if (!user.isAnonymous) {
        _authHandle_in(This, user);
        This.notifications().subscribe().catch(function (e) {
          console.error(e);
        });
      } else {
        _authHandle_out(This);
      }
    } else {
      _authHandle_out(This);
    }
  }

  function _authHandle_in(This, user) {
    // This.log('_authHandle_in', user);
    if (This.properties.page.status.didSignUp) {
      var domLib = This.dom();

      user.getIdToken(false)
        .then(function(token) {
          var done;
          fetch('https://us-central1-' + This.properties.options.libraries.firebase_app.config.projectId + '.cloudfunctions.net/bm_signUpHandler', {
            method: 'POST',
            body: JSON.stringify({
              authenticationToken: token,
              newsletterSignUp: domLib.select('.auth-newsletter-input').getValue(),
              affiliateCode: This.storage().get('auth.affiliateCode', '')
            }),
          })
          .finally(function (response, status) {
            if (!done) {
              done = true;
              _authHandle_in_normal(This, user);
            }
          });

          setTimeout(function () {
            if (!done) {
              done = true;
              _authHandle_in_normal(This, user);
            }
          }, 5000);

          // This.ajax().request({
          //   url: 'https://us-central1-' + This.properties.options.libraries.firebase_app.config.projectId + '.cloudfunctions.net/bm_signUpHandler',
          //   // url: 'http://localhost:5001/ultimate-jekyll/us-central1/bm_signUpHandler',
          //   body: {
          //     authenticationToken: token,
          //     newsletterSignUp: domLib.select('.auth-newsletter-input').getValue(),
          //     affiliateCode: This.storage().get('auth.affiliateCode', '')
          //   },
          //   timeout: 5000,
          // })
          // .always(function (response, status) {
          //   // This.storage().set('notifications.lastSynced', new Date(0).toISOString())
          //   _authHandle_in_normal(This, user);
          // });
        })
        .catch(function(error) {
          console.error(error);
          _authHandle_in_normal(This, user);
        });

    // } else if (This.properties.page.status.didSignIn) {
      // This.notifications().isSubscribed(function (status) {
      //   if (status) {
      //     This.notifications().subscribe()
      //     .then(function () {
      //
      //     })
      //   }
      // })
      // _authHandle_in_normal(This, user);
    } else {
      _authHandle_in_normal(This, user);
    }
  }

  function _authHandle_in_normal(This, user) {
    var domLib = This.dom();
    var returnUrl = This.properties.page.queryString.get('auth_redirect');
    if (returnUrl) {
      window.location.href = decodeURIComponent(returnUrl);
      return;
    }
    if (This.properties.options.auth.state === 'prohibited') {
      window.location.href = This.properties.options.auth.sends.prohibited;
      return;
    }
    domLib.select('.auth-signedin-true-element').show();
    domLib.select('.auth-signedin-false-element').hide();
    domLib.select('.auth-email-element').each(function(e, i) {
      if (e.tagName === 'INPUT') {
        domLib.select(e).setValue(user.email)
      } else {
        domLib.select(e).setInnerHTML(user.email)
      }
    });
    domLib.select('.auth-uid-element').each(function(e, i) {
      if (e.tagName === 'INPUT') {
        domLib.select(e).setValue(user.uid)
      } else {
        domLib.select(e).setInnerHTML(user.uid)
      }
    });
  }

  function _authHandle_out(This) {
    // This.log('_authHandle_out: ', This.properties.options.auth.state);
    if (This.properties.options.auth.state === 'required') {
      // window.location.href = This.query().create(This.properties.options.auth.sends.required).set('auth_redirect', encodeURIComponent(window.location.href)).getUrl();
      var sendSplit = This.properties.options.auth.sends.required.split('?');
      var newQuery = new URLSearchParams(sendSplit[1]);
      newQuery.set('auth_redirect', window.location.href);
      window.location.href = sendSplit[0] + '?' + newQuery.toString();
      return;
    }
    This.dom().select('.auth-signedin-true-element').hide();
    This.dom().select('.auth-signedin-false-element').show();
  }

  Manager.prototype.ready = function(fn, options) {
    var This = this;
    var waitFor = true;
    options = options || {};
    options.interval = options.interval || 100;

    waitFor = !options.waitFor || (options.waitFor && options.waitFor())

    if (!utilities.get(this, 'properties.page.status.ready', false) || !waitFor) {
      setTimeout(function () {
        This.ready(fn, options);
      }, options.interval);
    } else {
      // Performance
      This.performance().mark('manager_ready');

      return fn();
    }
  }

  Manager.prototype.serviceWorker = function() {
    var This = this;
    var SWAvailable = 'serviceWorker' in navigator;
    if (SWAvailable) {
      try {
        var swref = This.properties.references.serviceWorker.active || navigator.serviceWorker.controller;
      } catch (e) {}
    }
    return {
      postMessage: function() {
        // var args = getArgs(arguments);
        var args = arguments;
        if (!SWAvailable) {return};

        try {
          var messageChannel = new MessageChannel();
          messageChannel.port1.onmessage = function(event) {
            if (!event.data.error && args[1]) {
              args[1](event.data);
            }
          };
          // navigator.serviceWorker.controller.postMessage(args[0], [messageChannel.port2]);
          swref.postMessage(args[0], [messageChannel.port2]);
        } catch (e) {
          console.error(e);
        }

        // if (!navigator.serviceWorker.controller) {
        //   This.log('postMessage...');
        //   setTimeout(function () {
        //     This.serviceWorker().postMessage(args[0], args[1]);
        //   }, 100);
        // } else {
        //   // post message: https://stackoverflow.com/questions/30177782/chrome-serviceworker-postmessage
        //   var messageChannel = new MessageChannel();
        //   messageChannel.port1.onmessage = function(event) {
        //     if (!event.data.error && args[1]) {
        //       args[1](event.data);
        //     }
        //   };
        //   navigator.serviceWorker.controller.postMessage(args[0], [messageChannel.port2])
        // }
      }
    }

  }

  // navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
  //   // Let's see if you have a subscription already
  //   console.log('&&& GET SUB');
  //   return serviceWorkerRegistration.pushManager.getSubscription();
  // })
  // .then(function(subscription) {
  //   if (!subscription) {
  //     // You do not have subscription
  //     console.log('&&& NO SUBSCRIPTION');
  //   } else {
  //     console.log('&&& YES SUBSCRIPTION');
  //
  //   }
  //
  //   // You have subscription.
  //   // Send data to service worker
  //   // navigator.serviceWorker.controller.postMessage({'data': dataToServiceWorker});
  //
  // })

  // navigator.serviceWorker.ready.then(() => {
  //   // I thought the page would be controlled at this point, thanks to clients.claim()
  //   console.log('.ready resolved, and navigator.serviceWorker.controller is', navigator.serviceWorker.controller);
  //   navigator.serviceWorker.addEventListener('controllerchange', () => {
  //     console.log('Okay, now things are under control. navigator.serviceWorker.controller is', navigator.serviceWorker.controller);
  //   });
  // });

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
    if (!utilities.get(This, 'properties.page.status.ready', false) && (!utilities.get(This, 'properties.page.status.initializing', false))) {

      // Performance
      This.performance().mark('manager_init');

      // set initializing to true
      This.properties.page.status.initializing = true;

      // set other properties
      This.properties.meta.environment = /((:\/\/)(local|127\.|192\.|.+ngrok\.))/.test(window.location.href) ? 'development' : 'production';


      init_loadPolyfills(This, configuration, function() {
          This.properties.page.status.initializing = false;
          // This.properties.genericPromise = new Promise(resolve => { resolve() });
          var tempUrl = This.properties.global.url;
          var options_defaults = {
            // debug: {
            //   environment: This.properties.meta.environment,
            // },
            // queryString: {
            //   saveToStorage: false
            // },
            pushNotifications: {
              autoRequest: 60 // how long to wait before auto ask, 0 to disable
            },
            serviceWorker: {
              path: ''
            },
            initChecks: {
              features: [] // an array of javascript and dom features to check for (NIY)
            },
            auth: {
              state: 'default', // required, prohibited, default
              sends: {
                required: (tempUrl + '/signin/'),
                prohibited: (tempUrl + '/')
              }
            },
            popup: {
              enabled: true,
              config: {
                title: '',
                message: '',
                btn_ok: {
                  text: '',
                  link: ''
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
                  appId: ''
                }
              },
              firebase_firestore: {
                enabled: true
              },
              firebase_messaging: {
                enabled: true
              },
              firebase_auth: {
                enabled: true,
              },
              lazysizes: {
                enabled: true
              },
              sentry: {
                enabled: true,
                config: {
                  dsn: '',
                  release: ''
                }
              },
              tawk: {
                enabled: true,
                config: {
                  chatId: '',
                  prechatColor: '#02A84E'
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
                  showLink: false,
                  content: {
                    message: 'We use cookies to ensure you get the best experience on our website. By continuing to use the site, you agree to our<a href="' + tempUrl + '/terms/" class="cc-link" style="padding-right: 0">terms of service</a>.',
                    dismiss: 'Got it!',
                    // link: 'Learn more',
                    // href: '' || This.properties.global.urlRoot + '/cookies/',
                    // href: (tempUrl + '/cookies/')
                  }
                }
              }
            }
          };

          var options_user = {};
          function eachRecursive(obj, parent) {
            parent = (!parent) ? '' : parent;
              for (var key in obj) {
                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
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
          This.properties.options = options_user;

          // set non-option properties
          This.properties.global.version = configuration.global.version;
          This.properties.global.url = configuration.global.url;
          This.properties.global.cacheBreaker = configuration.global.cacheBreaker;
          This.properties.global.brand.name = configuration.global.brand.name;
          This.properties.meta.environment = utilities.get(configuration, 'global.settings.debug.environment', This.properties.meta.environment);

          This.log('Config: ', options_user);

          // parse query stringify
          This.properties.page.queryString = new URLSearchParams(window.location.search);
          if (This.properties.page.queryString.get('aff')) {
            This.storage().set('auth.affiliateCode', This.properties.page.queryString.get('aff'));
          }
          if (This.properties.page.queryString.get('redirect')) {
            window.location.href = decodeURIComponent(This.properties.page.queryString.get('redirect'));
            return;
          }

          // load critical libraries
          function postCrucial() {
            // console.log('HERE 5');

            // handle firebase user
            if (firebase.auth) {
              firebase.auth().onAuthStateChanged(function(user) {
                This.properties.page.status.authReady = true;
                This.properties.auth.user = user || false;
                _authStateHandler(This, user);
              })
            }

            // setup
            This.setEventListeners();

            // display outdated if it is
            try {
              if (!This.properties.page.isSupportedBrowser) {
                var box = document.getElementsByClassName('master-alert-outdated')[0];
                box.style.display = 'block';
                document.body.insertBefore(box, document.body.firstChild);
              }
            } catch (e) {}

            // run the init callback
            This.properties.page.status.ready = true;

            try {
              callback();
            } catch (e) {
              console.error(e);
            }

            var tawkOps = options_user.libraries.tawk;
            if (tawkOps.enabled) {
              This.dom().select('#prechat-btn').css({background: tawkOps.config.prechatColor}).show();
            }

            // loan non-critical libraries
            load_lazysizes(This, options_user);
            load_cookieconsent(This, options_user);
            subscriptionManager(This, options_user);

            This.log('Manager', This);
            return;
          }

          // console.log('HERE 0');
          Promise.all([
            load_sentry(This, options_user),
            load_firebase(This, options_user),
          ])
          .then(function() {
            postCrucial();
          })
          .catch(function (e) {
            //@@@ LOG TO SENTRY HERE?
            console.error('Lib error', e);
            // postCrucial();
          })
          // console.log('HERE 0');
          // Promise.all([
          //   load_sentry(This, options_user),
          //   load_firebase(This, options_user),
          // ])
          // .then(function() {
          //   console.log('HERE 5');
          //
          //   // handle firebase user
          //   if (firebase.auth) {
          //     firebase.auth().onAuthStateChanged(function(user) {
          //       This.properties.page.status.authReady = true;
          //       This.properties.auth.user = user || false;
          //       _authStateHandler(This, user);
          //     })
          //   }
          //
          //   // setup
          //   This.setEventListeners();
          //
          //   // run the init callback
          //   This.properties.page.status.ready = true;
          //   callback();
          //
          //   // loan non-critical libraries
          //   load_lazysizes(This, options_user);
          //   load_cookieconsent(This, options_user);
          //   subscriptionManager(This, options_user);
          //
          //   This.log('Manager ', This);
          //   return;
          // })
          // .catch(function (e) {
          //   console.log('E', e);
          // })

      })

    } else {
      return;
    }

  }

  // Manager.prototype.subscribeToPushNotifications = function(options) {
  //   if ((typeof firebase.messaging !== 'undefined')) {
  //     return firebase.messaging().requestPermission()
  //       .then(() => checkSubscription())
  //       .catch((err) => {
  //         console.error(err);
  //       });
  //   }
  // }
  // Sentry.configureScope(scope => {
  //   scope.setExtra('battery', 0.7);
  //   scope.setTag('user_mode', 'admin');
  //   scope.setUser({ id: '4711' });
  //   // scope.clear();
  // });
  //
  // // Add a breadcrumb for future events
  // Sentry.addBreadcrumb({
  //   message: 'My Breadcrumb',
  //   // ...
  // });
  //
  // // Capture exceptions, messages or manual events
  // Sentry.captureMessage('Hello, world!');
  // Sentry.captureException(new Error('Good bye'));
  // Sentry.captureEvent({
  //   message: 'Manual',
  //   stacktrace: [
  //     // ...
  //   ],
  // });

  Manager.prototype.sentry = function() {
    // var en = (Sentry && Sentry)
    return {
      configureScope: function (cb) {
        try {
          Sentry.configureScope(function (scope) {
            cb(scope);
          })
        } catch (e) {

        }
      },
      captureException: function (e) {
        try {
          Sentry.captureException(e)
        } catch (e) {

        }
      }
    };
  }

  // function _postAuthSubscriptionCheck() {
  //   return new Promise(function(resolve, reject) {
  //
  //   });
  // }

  Manager.prototype.auth = function() {
    var This = this;
    var firebaseActive = typeof firebase !== 'undefined';
    var erel = '.auth-error-message-element';
    var domLib = This.dom();
    function _displayError(msg) {
      domLib.select(erel).show().setInnerHTML(msg);
    }
    function _preDisplayError() {
      domLib.select(erel).hide().setInnerHTML('');
    }

    function signinButtonDisabled(status) {
      if (status) {
        domLib.select('.auth-signin-email-btn').setAttribute('disabled', true);
      } else {
        domLib.select('.auth-signin-email-btn').removeAttribute('disabled');
      }
    }
    function signupButtonDisabled(status) {
      if (status) {
        domLib.select('.auth-signup-email-btn').setAttribute('disabled', true);
      } else {
        domLib.select('.auth-signup-email-btn').removeAttribute('disabled');
      }
    }
    function forgotButtonDisabled(status) {
      if (status) {
        domLib.select('.auth-forgot-email-btn').setAttribute('disabled', true);
      } else {
        domLib.select('.auth-forgot-email-btn').removeAttribute('disabled');
      }
    }
    return {
      isAuthenticated: function () {
        return firebaseActive ? !!firebase.auth().currentUser : false;
      },
      getUser: function () {
        var defaultUser = {email: null, uid: null};
        return firebaseActive ? firebase.auth().currentUser || defaultUser : defaultUser;
      },
      ready: function (fn, options) {
        options = options || {};
        options.interval = options.interval || 100;
        // if ( (This.get('page.status.authReady', false) === false) ) {
        // Manager.log('--- authReady() REAL');
        if (!utilities.get(This, 'properties.page.status.authReady', false)) {
          setTimeout(function () {
            This.auth().ready(fn, options);
          }, options.interval);
        } else {
          // Performance
          This.performance().mark('manager_authReady');
          // This.log('.authReady()', This.auth().getUser());
          return fn(This.auth().getUser());
        }
      },
      signIn: function (method, email, password) {
        method = method || 'email';
        email = (email || domLib.select('.auth-email-input').getValue()).trim().toLowerCase();
        password = password || domLib.select('.auth-password-input').getValue();
        _preDisplayError();
        This.log('Signin attempt: ', method, email, password);
        if (method === 'email') {
          signinButtonDisabled(true);
          firebase.auth().signInWithEmailAndPassword(email, password)
          .then(function(credential) {
            // _postAuthSubscriptionCheck(This)
            // .then(function () {
            //
            // })
            This.properties.page.status.didSignIn = true;
            signinButtonDisabled(false);
            This.log('Good signin');
          })
          .catch(function(error) {
            signinButtonDisabled(false);
            _displayError(error.message);
            This.log('Error', error.message);
          });
        }
      },
      signUp: function(method, email, password, passwordConfirm) {
        method = method || 'email';
        email = (email || domLib.select('.auth-email-input').getValue()).trim().toLowerCase();
        password = password || domLib.select('.auth-password-input').getValue();
        passwordConfirm = passwordConfirm || domLib.select('.auth-password-confirm-input').getValue();
        _preDisplayError();
        This.log('Signup attempt: ', method, email, password, passwordConfirm);
        var termEl = domLib.select('.auth-terms-input');
        if (termEl.exists() && !termEl.getValue() === true) {
          _displayError('Please review and accept our terms.');
          return;
        }
        if (method === 'email') {
          if (password === passwordConfirm) {
            signupButtonDisabled(true);
            firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(function(credential) {
              This.properties.page.status.didSignUp = true;
              This.log('Good signup');
              // signupButtonDisabled(false);
            })
            .catch(function(error) {
              signupButtonDisabled(false);
              _displayError(error.message);
              This.log('error', error.message);
            });
          } else {
            _displayError("Passwords don't match.");
          }
        }

      },
      signOut: function() {
        // This.log('signOut()');
        // var This = this;
        firebase.auth().signOut()
        .then(function() {
          This.log('signOut success.');
        })
        .catch(function(error) {
          This.log('signOut failed: ', error);
        });
      },
      forgot: function(email) {
        // This.log('forgot()');
        email = email || domLib.select('.auth-email-input').getValue();
        forgotButtonDisabled(true);
        _preDisplayError();
        firebase.auth().sendPasswordResetEmail(email)
        .then(function() {
          forgotButtonDisabled(false);
          This.log('forgot success.');
          _displayError('A reset link has been sent to you.');
        })
        .catch(function(error) {
          forgotButtonDisabled(false);
          This.log('forgot failed: ', error);
          _displayError(error.message);
        });
      },

    }
  }

  //@@@NOTIFICATIONS
  Manager.prototype.notifications = function(options) {
    var supported = (typeof firebase.messaging !== 'undefined') && ('serviceWorker' in navigator) && ('Notification' in window);
    var This = this;
    return {
      isSubscribed: function () {
        This.log('isSubscribed()');
        return new Promise(function(resolve, reject) {
          if (!supported || Notification.permission !== 'granted') {return resolve(false)};
          return resolve(true);
        })
      },
      subscribe: function () {
        This.log('subscribe()');
        return new Promise(function(resolve, reject) {
          // var subscribed = !This.notifications().isSubscribed();
          firebase.messaging().getToken({
            serviceWorkerRegistration: This.properties.references.serviceWorker,
          })
          .then(function (token) {
            var user = This.auth().getUser();
            var localSubscription = This.storage().get('notifications', {});
            var localHash = localSubscription.token + '|' + localSubscription.uid;
            var userHash = token + '|' + user.uid;
            // console.log('user', user);
            // console.log('localHash', localHash);
            // console.log('userHash', userHash);

            // var override = false;
            var currentDate = new Date();
            var dateDifference = (currentDate.getTime() - new Date(localSubscription.lastSynced || 0).getTime()) / (1000 * 3600 * 24);

            // Run if local hash is different than the user hash OR it was last updated more than 1 day ago
            if (localHash !== userHash || dateDifference > 1) {
              var timestamp = currentDate.toISOString();
              var timestampUNIX = Math.floor((+new Date(timestamp)) / 1000);
              var subscriptionRef = firebase.firestore().doc('notifications/subscriptions/all/' + token);

              function saveLocal() {
                // console.log('---------saveLocal');
                // This.log('Saved local token: ', token);
                This.storage().set('notifications', {uid: user.uid, token: token, lastSynced: timestamp});
              }

              function saveServer(doc) {
                // console.log('-------saveServer', !doc.exists, !This.utilities().get(doc.data(), 'link.user.data.uid', ''), user.uid);
                // Run if it (DOES NOT EXIST on server) OR (it does AND the uid field is null AND the current user is not null)
                if (!doc.exists || (doc.exists && !This.utilities().get(doc.data(), 'link.user.data.uid', '') && user.uid)) {
                  subscriptionRef
                  .set(
                    {
                      meta: {
                        dateSubscribed: {
                          timestamp: timestamp,
                          timestampUNIX: timestampUNIX
                        }
                      },
                      token: token,
                      link: {
                        user: {
                          lastLinked: {
                            timestamp: timestamp,
                            timestampUNIX: timestampUNIX
                          },
                          pk: user.uid,
                          data: {
                            uid: user.uid,
                            email: user.email
                          }
                        }
                      },
                      tags: ['general']
                    },
                    {
                      merge: true
                    }
                  )
                  .then(function(data) {
                    // This.log('Updated token: ', token);
                    saveLocal();
                    resolve(true);
                  })
                } else {
                  saveLocal();
                  // This.log('Skip sync, server data exists.');
                  resolve(false);
                }
              }

              // Get the doc first and then run a check to see if it needs to be updated
              subscriptionRef
              .get()
              .then(function (doc) {
                saveServer(doc);
              })
              .catch(function () {
                saveServer({exists: false})
              })
            } else {
              // This.log('Skip sync, recently done.');
              resolve(false);
            }

          })
          .catch(function (e) {
            reject(e);
          })
        })
      }
    }
  }

  // function handleTokenRefresh(This) {
  //   This.log('handleTokenRefresh()');
  //   return new Promise(function(resolve, reject) {
  //     var notifications = This.notifications();
  //     notifications.isSubscribed()
  //     .then(function (result) {
  //       if (result) {
  //         return resolve(This.notifications().subscribe());
  //       } else {
  //         return resolve();
  //       }
  //     })
  //   });
  // }

  /*
  HELPERS
  */
  function subscriptionManager(This, options_user) {
    if (!('serviceWorker' in navigator) || !(typeof firebase.messaging !== 'undefined')) {return}

    // service worker guide: https://developers.google.com/web/updates/2018/06/fresher-sw
    navigator.serviceWorker.register('/' + (options_user.serviceWorker.path || 'master-service-worker.js') + '?config=' + encodeURIComponent(JSON.stringify({name: This.properties.global.brand.name, env: This.properties.meta.environment, v: This.properties.global.version, firebase: options_user.libraries.firebase_app.config})) )
    .then(function (registration) {
      // firebase.messaging().useServiceWorker(registration);
      This.properties.references.serviceWorker = registration;
      // console.log('====registration', registration);
      // console.log('navigator.serviceWorker.controller', navigator.serviceWorker.controller);
      // TODO: https://googlechrome.github.io/samples/service-worker/post-message/
      // --- leverage this example ^^^ for caching! It's grat and you can do one page at a time through postMessage!

      // function listenForWaitingServiceWorker(reg, callback) {
      //   function awaitStateChange() {
      //     reg.installing.addEventListener('statechange', function() {
      //       if (this.state === 'installed') callback(reg);
      //     });
      //   }
      //   if (!reg) return;
      //   if (reg.waiting) return callback(reg);
      //   if (reg.installing) awaitStateChange();
      //   reg.addEventListener('updatefound', awaitStateChange);
      // }
      //
      // // reload once when the new Service Worker starts activating
      // var refreshing;
      // navigator.serviceWorker.addEventListener('controllerchange',
      //   function() {
      //     if (refreshing) return;
      //     refreshing = true;
      //     window.location.reload();
      //   }
      // );
      // function promptUserToRefresh(reg) {
      //   // this is just an example
      //   // don't use window.confirm in real life; it's terrible
      //   if (window.confirm("New version available! OK to refresh?")) {
      //     reg.waiting.postMessage({command: 'skipWaiting'});
      //   }
      // }
      // listenForWaitingServiceWorker(registration, promptUserToRefresh);

      // registration.update();
      This.properties.page.status.masterSWRegistered = true;


      This.log('SW Registered.');
      //@@@NOTIFICATIONS
      // _setupTokenRefreshHandler(This);

      if (options_user.pushNotifications.autoRequest) {
        setTimeout(function () {
          //@@@NOTIFICATIONS
          This.notifications().subscribe()
          .catch(function (e) {
            console.error(e);
          });
        }, options_user.pushNotifications.autoRequest * 1000);
      }

      try {
        // Normally, notifications are not displayed when user is ON PAGE but we will display it here anyway
        firebase.messaging().onMessage(function (payload) {
          new Notification(payload.notification.title, payload.notification);
        })
      } catch (e) {
        console.error(e);
      }

    })
    .catch(function (e) {
      // console.log('***2');
      console.error(e);
    });

    // SW Ready
    // navigator.serviceWorker.ready.then(function(registration) {
    // });
  }



  /*
  EXTERNAL LIBS
  */
  var load_firebase = function(This, options) {
    return new Promise(function(resolve, reject) {
      // if (typeof window.firebase !== 'undefined') {
      //   return resolve();
      // }
      if (options.libraries.firebase_app.enabled === true) {
        import('firebase/app')
        .then(function(mod) {
          // This.log('Loaded Firebase.');
          window.firebase = mod.default;
          window.app = firebase.initializeApp(options.libraries.firebase_app.config);

          Promise.all([
            load_firebase_auth(This, options),
            load_firebase_firestore(This, options),
            load_firebase_messaging(This, options),
          ])
          .then(resolve)
          .catch(reject);
         })
         .catch(reject);
      } else {
        return resolve();
      }
    });
  }


  var load_firebase_auth = function(This, options) {
    return new Promise(function(resolve, reject) {
      // if (typeof utilities.get(window, 'firebase.auth', undefined) !== 'undefined') {
      //   return resolve();
      // }
      if (options.libraries.firebase_auth.enabled === true) {
        import('firebase/auth')
        .then(resolve)
        .catch(reject);
      } else {
        return resolve();
      }

    });
  }


  var load_firebase_firestore = function(This, options) {
    return new Promise(function(resolve, reject) {
      // if (typeof utilities.get(window, 'firebase.firestore', undefined) !== 'undefined') {
      //   return resolve();
      // }
      if (options.libraries.firebase_firestore.enabled === true) {
        import('firebase/firestore')
        .then(resolve)
        .catch(reject);
      } else {
        return resolve();
      }
    });
  }

  var load_firebase_messaging = function(This, options) {
    return new Promise(function(resolve, reject) {
      // if (typeof utilities.get(window, 'firebase.messaging', undefined) !== 'undefined') {
      //   return resolve();
      // }
      if (options.libraries.firebase_messaging.enabled === true) {
        import('firebase/messaging')
        .then(resolve)
        .catch(reject);
      } else {
        return resolve();
      }
    });
  }


  var load_lazysizes = function(This, options) {
    return new Promise(function(resolve, reject) {
      // if (typeof window.lazysizes !== 'undefined') {
      //   return resolve();
      // }
      if (options.libraries.lazysizes.enabled === true) {
        import('lazysizes')
        .then(function (mod) {
          window.lazysizes = mod.default;

          // configs come from official lazysizes demo
          var expand = Math.max(Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight, 1222) - 1, 359);
          window.lazySizesConfig = {
            loadMode: 1,
            expand: expand,
            expFactor: expand < 380 ? 3 : 2,
          };
          // This.log('Loaded Lazysizes.');
        })
        .catch(reject);
      } else {
        return resolve();
      }
    });
  }

  var load_cookieconsent = function(This, options) {
    return new Promise(function(resolve, reject) {
      // if (typeof window.cookieconsent !== 'undefined') {
      //   return resolve();
      // }
      if (options.libraries.cookieconsent.enabled === true) {
        import('cookieconsent')
        .then(function(mod) {
          window.cookieconsent.initialise(options.libraries.cookieconsent.config);
          // This.log('Loaded Cookieconsent.');
          return resolve();
        })
        .catch(reject);
      } else {
        return resolve();
      }

    });
  }

  var load_tawk = function(This, options) {
    var dom = This.dom();
    return new Promise(function(resolve, reject) {
      // if (typeof window.Tawk_API !== 'undefined') {
      //   return resolve();
      // }
      if (options.libraries.tawk.enabled === true) {
        window.Tawk_API = window.Tawk_API || {}, window.Tawk_LoadStart = new Date();
        window.Tawk_API.onLoad = function(){
          dom.select('#prechat-btn').hide();
          Tawk_API.maximize();
        };
        dom.loadScript({src: 'https://embed.tawk.to/' + utilities.get(options, 'libraries.tawk.config.chatId', '') + '/default', crossorigin: true}, function(e) {
          if (e) {
            return reject(e);
          }
          // This.log('Loaded tawk.');
          return resolve();
        })

      } else {
        return resolve();
      }
    });
  }

  var load_sentry = function(This, options) {
    return new Promise(function(resolve, reject) {
      // if (typeof window.Sentry !== 'undefined') {
      //   return resolve();
      // }
      if (options.libraries.sentry.enabled === true) {
        import('@sentry/browser')
        .then(function(mod) {
          window.Sentry = mod;
          var config = options.libraries.sentry.config;
          config.release = config.release + '@' + This.properties.global.version;
          config.environment = This.properties.meta.environment;
          Sentry.init(config);
          // This.log('Loaded Sentry.');
          return resolve();
        })
        .catch(reject);
      } else {
        return resolve();
      }
    });
  }

  Manager.prototype.log = function() {
    if (this.properties.meta.environment === 'development') {
      // 1. Convert args to a normal array
      var args = Array.prototype.slice.call(arguments);

      // 2. Prepend log prefix log string
      args.unshift('[ DEV ' + new Date().toLocaleTimeString() + ' ]');

      // 3. Pass along arguments to console.log
      if (args[1] === 'error') {
        args.splice(1,1);
        console.error.apply(console, args);
      } else if (args[1] === 'warn') {
        args.splice(1,1);
        console.warn.apply(console, args);
      } else if (args[1] === 'log') {
        args.splice(1,1);
        console.log.apply(console, args);
      } else {
        console.log.apply(console, args);
      }
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

  function init_loadPolyfills(This, configuration, cb) {
    // https://github.com/jquintozamora/polyfill-io-feature-detection/blob/master/index.js
    var featuresDefault = (
      typeof Symbol !== 'undefined'
    )
    var featuresCustom = true;

    if (featuresDefault && featuresCustom) {
      cb();
    } else {
      // This.dom().loadScript({src: 'https://polyfill.io/v3/polyfill.min.js?flags=always%2Cgated&features=default'}, function() {
      This.dom().loadScript({src: 'https://polyfill.io/v3/polyfill.min.js?flags=always%2Cgated&features=default%2Ces5%2Ces6%2Ces7%2CPromise.prototype.finally%2C%7Ehtml5-elements%2ClocalStorage%2Cfetch%2CURLSearchParams'}, function() {
        This.log('Loaded polyfill.io')
        cb();
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
  // Manager.prototype.query = function() {
  //   return query;
  // }

  /**
  * DOM OPERATIONS
  */
  Manager.prototype.dom = function() {
    return dom;
  }

  // Manager.prototype.fetch = function(url, options) {
  //   var response = {
  //     status: 500,
  //   };
  //   return new Promise(function(resolve, reject) {
  //     fetch(url, options)
  //     .then(function (res) {
  //       response = res;
  //       if (res.status >= 200 && res.status < 300) {
  //         return resolve({response: res});
  //       } else {
  //         return res.text()
  //         .then(function (data) {
  //           throw new Error(data || res.statusTest || 'Unknown error.')
  //         })
  //       }
  //     })
  //     .catch(function (e) {
  //       return reject({response: response, error: e});
  //     });
  //   });
  // }

  // Manager.prototype.ajax = function() {
  //   return ajax;
  // }

  /**
  * OTHER
  */
  // Manager.prototype.performance = function() {
  //   var supported = ('performance' in window);
  //   return {
  //     mark: function(mark) {
  //       if (!supported) {return};
  //       window.performance.mark(mark);
  //     }
  //   }
  // }
  Manager.prototype.performance = function() {
    return {
      mark: function(mark) {
        try {
          window.performance.mark(mark);
        } catch (e) {
        }
      }
    }
  }

  // Manager.prototype.performance = function() {
  //   var This = this;
  //
  //   return {
  //     mark2: function () {
  //       return firebaseActive ? !!firebase.auth().currentUser : false;
  //     },
  //
  //   }
  // }


  /**
  * HELPERS
  */


module.exports = Manager;
