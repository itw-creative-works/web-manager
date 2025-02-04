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
var account;
var debug;

// var ajax;
// var dom;
// var query;
// var utilities;
// var storage;

// Shortcuts
var select;
var loadScript;
var store;


/**
* MODULE
*/
function getIEVersion() {
  // https://makandracards.com/makandra/53475-minimal-javascript-function-to-detect-version-of-internet-explorer-or-edge
  var match = /\b(MSIE |Trident.*?rv:|Edge\/)(\d+)/.exec(navigator.userAgent);
  if (match) {return parseInt(match[2])};
}

function isSupportedBrowser() {
  var ieVersion = getIEVersion();

  // IE 10 and below
  if (ieVersion && ieVersion <= 11) {
    return false;
  }

  return true;
}

function Manager() {
  var self = this;

  /**
  * OPTIONS
  */
  self.properties = {
    options: {
      page: {},
      global: {},
    },
    page: {
      code: '',
      url: '',
      status: {
        initilizing: false,
        ready: false,
        authReady: false,
      },
      // initReady: false,
      // initSecondaryReady: false,
      queryString: {},
      // libErrors: [],
      isSupportedBrowser: isSupportedBrowser(),
      startTime: new Date(),
      // auth: {
      //   status: undefined,
      //   lastAction: 'unknown',
      // },
    },
    global: {
      version: '',
      url: '',
      functionsUrl: '',
      apiUrl: '',
      buildTime: 0,
      cacheBreaker: '',
      brand: {
        name: 'default'
      },
      contact: {
        emailSupport: '',
        emailBusiness: '',
      },
      download: {
        windows: '',
        mac: '',
        linuxDebian: '',
        linuxSnap: '',
      },
      extension: {
        chrome: '',
        firefox: '',
        edge: '',
        opera: '',
        safari: '',
      },
      validRedirectHosts: [],
    },
    auth: {
      user: false
    },
    references: {
      serviceWorker: undefined
    },
    meta: {
      environment: 'production'
    }
  };

  try {
    self.properties.page.url = window.location.href;
  } catch (e) {

  }

  select = self.dom().select;
  loadScript = self.dom().loadScript;
  store = self.storage();
}

/**
* METHODS
*/
Manager.prototype.get = function(path) {
  var self = this;

  return utilities.get(self, 'properties.' + path);
}

Manager.prototype.set = function(path, value) {
  var self = this;

  return utilities.set(self, 'properties.' + path, value);
}

Manager.prototype.setEventListeners = function() {
  var self = this;

  // Setup click handler
  document.addEventListener('click', function (event) {
    var target = event.target;

    // auth events
    if (target.matches('.auth-signin-email-btn')) {
      self.auth().signIn('email');
    } else if (target.matches('.auth-signup-email-btn')) {
      self.auth().signUp('email');
    } else if (target.matches('.auth-signin-provider-btn')) {
      self.auth().signIn(target.getAttribute('data-provider'));
    } else if (target.matches('.auth-signup-provider-btn')) {
      self.auth().signUp(target.getAttribute('data-provider'));
    } else if (target.matches('.auth-signout-all-btn')) {
      self.auth().signOut();
    } else if (target.matches('.auth-forgot-email-btn')) {
      self.auth().forgot();
    } else if (target.matches('#prechat-btn')) {
      load_chatsy(self, self.properties.options);
    } else if (target.matches('.auth-subscribe-notifications-btn')) {
      self.notifications().subscribe()
    } else if (target.matches('.master-alert-close')) {
      target.parentElement.setAttribute('hidden', true);
    }

    // Autorequest
    if (!self._notificationRequested && self.properties.options.pushNotifications.autoRequest) {
      self._notificationRequested = true;

      setTimeout(function () {
        self.notifications().subscribe()
      }, self.properties.options.pushNotifications.autoRequest * 1000);
    }

  });

  // Mouse leave event
  document.addEventListener('mouseleave', function () {
    showExitPopup(self);
  });

  // Window blur event
  window.addEventListener('blur', function () {
    showExitPopup(self);
  });

  // Re-focus events
  window.addEventListener('focus', function () {
    refreshNewVersion(self);
  });
  window.addEventListener('online', function () {
    refreshNewVersion(self);
  });
  setInterval(function () {
    refreshNewVersion(self);
  }, 1000 * 60 * 60); // Fetch new version every 1 hour

}

function _authStateHandler(self, user) {
  // self.log('----authStateHandler', user);
  if (!user || user.isAnonymous) {
    return _authHandle_out(self);
  }

  _authHandle_in_normal(self, user);

  self.notifications().subscribe().catch(function (e) {
    console.error(e);
  });
}

// MOVED TO UJ - 12/15/23
// function _authHandle_in(self, user) {
//   // self.log('_authHandle_in', user);
//   // if (self.properties.page.status.didSignUp) {
//   var done;
//   var hoursSinceCreation = Math.abs(new Date() - new Date(+user.metadata.createdAt)) / 36e5;

//   function _done() {
//     if (!done) {
//       done = true;
//       store.set('didSignUp', true)
//       _authHandle_in_normal(self, user);
//     }
//   }

//   if (!store.get('didSignUp') && hoursSinceCreation < 0.5) {
//     user.getIdToken(false)
//       .then(function(token) {

//         fetch('https://us-central1-' + self.properties.options.libraries.firebase_app.config.projectId + '.cloudfunctions.net/bm_api', {
//           method: 'POST',
//           body: JSON.stringify({
//             authenticationToken: token,
//             command: 'user:sign-up',
//             payload: {
//               newsletterSignUp: select('.auth-newsletter-input').getValue(),
//               // affiliateCode: store.get('auth.affiliateCode', ''),
//               affiliateCode: store.get('affiliateCode', ''),
//             },
//           }),
//         })
//         .catch(function () {})
//         .finally(_done);

//         setTimeout(function () {
//           _done()
//         }, 5000);

//       })
//       .catch(function(error) {
//         console.error(error);
//         _done();
//       });
//   } else {
//     _done();
//   }
// }



function _authHandle_in_normal(self, user) {
  var returnUrl = self.properties.page.queryString.get('auth_redirect');

  // Check if we have a return URL and it is valid
  if (returnUrl && self.isValidRedirectUrl(returnUrl)) {
    window.location.href = decodeURIComponent(returnUrl);
    return;
  }

  // If auth is prohibited, redirect to the prohibited page
  if (self.properties.options.auth.state === 'prohibited') {
    window.location.href = self.properties.options.auth.sends.prohibited;
    return;
  }

  // Handle visibility
  // select('.auth-signedin-true-element').show();
  // select('.auth-signedin-false-element').hide();
  select('.auth-signedin-true-element').each(function ($el) {
    var $el2 = select($el);
    $el2.show();

    console.warn('DEPRECATED: auth-signedin-true-element', $el);
  });
  select('.auth-signedin-false-element').each(function ($el) {
    var $el2 = select($el);
    $el2.hide();

    console.warn('DEPRECATED: auth-signedin-false-element', $el);
  });
  _authHandleState(self, 'signed-in');

  // Set user email
  select('.auth-email-element').each(function(e, i) {
    if (e.tagName === 'INPUT') {
      select(e).setValue(user.email)
    } else {
      select(e).setInnerHTML(user.email)
    }
  });

  // Set user id
  select('.auth-uid-element').each(function(e, i) {
    if (e.tagName === 'INPUT') {
      select(e).setValue(user.uid)
    } else {
      select(e).setInnerHTML(user.uid)
    }
  });
}

function _authHandle_out(self) {
  // If auth is required, redirect to the required page
  if (self.properties.options.auth.state === 'required') {
    var sendSplit = self.properties.options.auth.sends.required.split('?');
    var newQuery = new URLSearchParams(sendSplit[1]);
    newQuery.set('auth_redirect', window.location.href);
    window.location.href = sendSplit[0] + '?' + newQuery.toString();
    return;
  }

  // select('.auth-signedin-true-element').hide();
  // select('.auth-signedin-false-element').show();
  select('.auth-signedin-true-element').each(function ($el) {
    var $el2 = select($el);
    $el2.hide();

    console.warn('DEPRECATED: auth-signedin-true-element', $el);
  });
  select('.auth-signedin-false-element').each(function ($el) {
    var $el2 = select($el);
    $el2.show();

    console.warn('DEPRECATED: auth-signedin-false-element', $el);
  });

  _authHandleState(self, 'signed-out');
}

function _authHandleState(self, state) {
  var $stateAll = select('.auth-state-listener');

  // Loop through all elements with the class and hide first
  $stateAll
  .each(function ($el) {
    $el.setAttribute('hidden', true);
  })

  // Loop through all elements with the class and check the data-state attribute
  $stateAll
  .each(function ($el) {
    var s = $el.getAttribute('data-state');

    // If we are in the correct status
    if (s !== state) {
      // Hide the element
      return $el.setAttribute('hidden', true);
    }

    // Show the element
    $el.removeAttribute('hidden');
  })
}

Manager.prototype.ready = function(fn, options) {
  var self = this;
  var waitFor = true;

  options = options || {};
  options.interval = options.interval || 100;

  waitFor = !options.waitFor || (options.waitFor && options.waitFor())

  if (!utilities.get(this, 'properties.page.status.ready', false) || !waitFor) {
    setTimeout(function () {
      self.ready(fn, options);
    }, options.interval);
  } else {
    // Performance
    self.performance().mark('manager_ready');

    return fn();
  }
}

Manager.prototype.serviceWorker = function() {
  var self = this;
  var SWAvailable = 'serviceWorker' in navigator;

  if (SWAvailable) {
    try {
      var swref = self.properties.references.serviceWorker.active || navigator.serviceWorker.controller;
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
      //   self.log('postMessage...');
      //   setTimeout(function () {
      //     self.serviceWorker().postMessage(args[0], args[1]);
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

// init with polyfills
Manager.prototype.init = function(configuration, callback) {
  var self = this;
  var status = self.properties.page.status;

  if (
    !status.ready
    && !status.initilizing
  ) {

    // Performance
    self.performance().mark('manager_init');

    // set initializing to true
    self.properties.page.status.initializing = true;

    // set other properties
    self.properties.meta.environment = window.location.host.match(/:40|ngrok/)
      ? 'development'
      : 'production';

    // Load polyfills
    init_loadPolyfills(self, configuration, function() {
        self.properties.page.status.initializing = false;

        // set options
        var options_defaults = {
          // debug: {
          //   environment: self.properties.meta.environment,
          // },
          // queryString: {
          //   saveToStorage: false
          // },
          pushNotifications: {
            autoRequest: 60, // how long to wait before auto ask, 0 to disable
          },
          serviceWorker: {
            path: '',
          },
          initChecks: {
            features: [], // an array of javascript and dom features to check for (NIY)
          },
          auth: {
            state: 'default', // required, prohibited, default
            sends: {
              required: '/signup',
              prohibited: '/',
            },
          },
          refreshNewVersion: {
            enabled: true,
          },
          exitPopup: {
            enabled: true,
            config: {
              timeout: 1000 * 60 * 60 * 4,
              handler: null,
              title: 'Special Offer!',
              message: 'Get 15% off your purchase of our <strong>Premium plans</strong>. <br><br> Get access to all features and unlimited usage.',
              okButton: {
                text: 'Claim 15% Discount',
                link: '/pricing?utm_source=exit-popup&utm_medium=popup&utm_campaign={pathname}',
              },
            },
          },
          libraries: {
            firebase_app: {
              enabled: true,
              load: false,
              config: {
                apiKey: '',
                authDomain: '',
                databaseURL: '',
                projectId: '',
                storageBucket: '',
                messagingSenderId: '',
                appId: '',
                measurementId: '',
              },
            },
            firebase_auth: {
              enabled: true,
              load: false,
            },
            firebase_firestore: {
              enabled: true,
              load: false,
            },
            firebase_messaging: {
              enabled: true,
              load: false,
            },
            firebase_appCheck: {
              enabled: true,
              load: false,
              config: {
                siteKey: '',
              },
            },
            lazysizes: {
              enabled: true,
            },
            sentry: {
              enabled: true,
              config: {
                dsn: '',
                release: '',
                replaysSessionSampleRate: 0.01,
                replaysOnErrorSampleRate: 0.01,
              },
            },
            chatsy: {
              enabled: true,
              config: {
                accountId: '',
                chatId: '',
                settings: {
                  openChatButton: {
                    background: '#237afc',
                    text: '#fff',
                  },
                },
              },
            },
            cookieconsent: {
              enabled: true,
              config: {
                palette: {
                  popup: {
                    background: '#237afc',
                    text: '#fff',
                  },
                  button: {
                    background: '#fff',
                    text: '#237afc',
                  },
                },
                theme: 'classic',
                position: 'bottom-left',
                type: '',
                showLink: false,
                content: {
                  message: 'We use cookies to ensure you get the best experience on our website. By continuing to use the site, you agree to our<a href="/terms" class="cc-link" style="padding-right: 0">terms of service</a>.',
                  // dismiss: 'Got it!',
                  dismiss: 'I understand',
                },
              },
            },
          },
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
        self.properties.options = options_user;

        // set non-option properties
        self.properties.global.app = configuration.global.app;
        self.properties.global.version = configuration.global.version;
        self.properties.global.url = configuration.global.url;
        self.properties.global.buildTime = new Date((+configuration.global.buildTime * 1000) || new Date());
        self.properties.global.cacheBreaker = configuration.global.cacheBreaker;

        self.properties.global.brand = configuration.global.brand;
        self.properties.global.contact = configuration.global.contact;
        self.properties.global.download = configuration.global.download;
        self.properties.global.extension = configuration.global.extension;

        self.properties.global.validRedirectHosts = configuration.global.validRedirectHosts;
        self.properties.meta.environment = utilities.get(configuration, 'global.settings.debug.environment', self.properties.meta.environment);
        self.properties.page.queryString = new URLSearchParams(window.location.search);

        // set global properties
        self.properties.global.apiUrl = getApiUrl(self.properties.global.url);
        self.properties.global.functionsUrl = 'https://us-central1-' + self.properties.options.libraries.firebase_app.config.projectId + '.cloudfunctions.net';

        // set page properties
        var pagePathname = window.location.pathname;
        var redirect = false;

        var previousUTMTimestamp = new Date(store.get('utm.timestamp', 0));
        var UTMDifferenceInHours = (new Date() - previousUTMTimestamp) / 36e5;

        self.properties.page.queryString.forEach(function (value, key) {
          if (key.startsWith('utm_') && UTMDifferenceInHours > 72) {
            store.set('utm.tags.' + key, value);
            store.set('utm.timestamp', new Date().toISOString());
          }

          if (key === 'aff') {
            store.set('affiliateCode', value);
          }

          if (key === 'redirect') {
            // redirect = decodeURIComponent(value) // 9/22/23 - Removed this and replace without the decode
            redirect = value;
          }
        })

        // Redirect if we have a redirect query
        if (redirect && self.isValidRedirectUrl(redirect)) {
          return window.location.href = redirect;
        }

        // Detect if we are on a page that requires authentication
        if (pagePathname.match(/\/(authentication-required|authentication-success|authentication-token|forgot|oauth2|signin|signout|signup)/)) {
          import('./helpers/auth-pages.js')
          .then(function(mod) {
            mod.default()
          })
        }

        // load critical libraries
        function postCrucial() {
          // console.log('HERE 5');

          // handle firebase user
          if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged(function(user) {
              self.properties.page.status.authReady = true;
              self.properties.auth.user = user || false;
              _authStateHandler(self, user);
            })
          }

          // setup
          self.setEventListeners();

          // display outdated if it is
          try {
            if (!self.properties.page.isSupportedBrowser) {
              var box = document.getElementsByClassName('master-alert-outdated')[0];
              box.removeAttribute('hidden');
            }
          } catch (e) {
            console.error(e);
          }

          // run the init callback
          self.properties.page.status.ready = true;

          try {
            callback();
          } catch (e) {
            console.error(e);
          }

          var chatsyOps = options_user.libraries.chatsy;
          if (chatsyOps.enabled) {
            var $preChatBtn = select('#prechat-btn');
            var $preChatBtnSvg = select('#prechat-btn svg path');
            var openChatButtonSettings = chatsyOps.config.settings.openChatButton;

            $preChatBtn.css({
              background: openChatButtonSettings.background,
            })
            .show();

            $preChatBtnSvg.each(function ($el) {
              $el.setAttribute('fill', openChatButtonSettings.text)
            })

            window.chatsy = {};
            window.chatsy.open = function() {
              $preChatBtn.get(0).click();
            }
          }

          // load non-critical libraries
          load_lazysizes(self, options_user);
          load_cookieconsent(self, options_user);
          subscriptionManager(self, options_user);

          // self.log('Manager', self);
          return;
        }

        Promise.all([
          load_sentry(self, options_user),
          load_firebase(self, options_user),
        ])
        .then(function() {
          postCrucial();
        })
        .catch(function (e) {
          console.error('Lib error', e);
        })
    })

  } else {
    return;
  }

}

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

Manager.prototype.auth = function() {
  var self = this;
  var firebaseActive = typeof firebase !== 'undefined';
  var $error = select('.auth-error-message-element');

  function _displayError(msg) {
    console.error(msg);
    $error.show().setInnerHTML(msg);
  }
  function _preDisplayError() {
    $error.hide().setInnerHTML('');
  }

  function setAuthButtonDisabled(button, status) {
    var el = select('.auth-' + button + '-email-btn');
    var disabled = 'disabled';
    if (status) {
      el.setAttribute(disabled, true);
    } else {
      el.removeAttribute(disabled);
    }
  }

  function selectAuthInput(mode, input) {
    var prefix = '.auth-';
    var inputSelector = prefix + input + '-input';
    var formSelector = prefix + mode + '-form ';
    var formInput = select(formSelector + inputSelector);
    var input = select(inputSelector);

    return formInput.exists() ? formInput : input;
  }

  function resolveAuthInputValue(existing, mode, input) {
    var result = existing || selectAuthInput(mode, input).getValue();

    return input === 'email' ? result.trim().toLowerCase() : result;
  }

  function uxHandler(email, password, passwordConfirm, mode) {
    if (!email) {
      selectAuthInput(mode, 'email').get(0).focus();
    } else {
      selectAuthInput(mode, 'password').get(0).focus();
      if (mode === 'signup') {
        selectAuthInput(mode, 'password-confirm').get(0).focus();
      }
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

      if (!utilities.get(self, 'properties.page.status.authReady', false)) {
        setTimeout(function () {
          self.auth().ready(fn, options);
        }, options.interval);
      } else {

        // Set up listener for redirect (for provider login)
        // @@@ DISABLED NOV 8, 2023
        // if (!self._redirectResultSetup) {
        //   self._redirectResultSetup = true;
        //   firebase.auth()
        //     .getRedirectResult()
        //     .catch(function (error) {
        //       _displayError(error.message);
        //     });
        // }

        // Performance
        self.performance().mark('manager_authReady');

        return fn(self.auth().getUser());
      }
    },
    signIn: function (method, email, password) {
      var mode = 'signin';
      method = method || 'email';
      _preDisplayError();
      // self.log('Signin attempt: ', method, email, password);
      if (method === 'email') {
        // email = (email || select('.auth-email-input').getValue()).trim().toLowerCase();
        email = resolveAuthInputValue(email, mode, 'email');
        // password = password || select('.auth-password-input').getValue();
        password = resolveAuthInputValue(password, mode, 'password');
        // console.log('Signin attempt: ', method, email, password);

        // Handler
        uxHandler(email, password, undefined, mode);

        // signinButtonDisabled(true);
        setAuthButtonDisabled(mode, true);

        firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function(credential) {
          // _postAuthSubscriptionCheck(self)
          // .then(function () {
          //
          // })
          self.properties.page.status.didSignIn = true;
          // signinButtonDisabled(false);
          setAuthButtonDisabled(mode, false);
          // self.log('Good signin');
        })
        .catch(function(error) {
          // signinButtonDisabled(false);
          setAuthButtonDisabled(mode, false);
          _displayError(error.message);
          // self.log('Error', error.message);
        });
      } else {
        firebase.auth().signInWithRedirect(new firebase.auth.OAuthProvider(method))
        .catch(function (e) {
          _displayError(e);
        })
      }
    },
    signUp: function(method, email, password, passwordConfirm) {
      var mode = 'signup';
      method = method || 'email';

      _preDisplayError();
      // self.log('Signup attempt: ', method, email, password, passwordConfirm);
      // var acceptedTerms
      // var termEl = select('.auth-terms-input');
      // if (termEl.exists() && !termEl.getValue() === true) {
      //   _displayError('Please review and accept our terms.');
      //   return;
      // }
      var termsSelector = '.auth-terms-input';
      var termSpecificEl = select('.auth-signup-form ' + termsSelector)
      var termGenericEl = select(termsSelector)
      if ((termSpecificEl.exists() && !termSpecificEl.getValue() === true) || (termGenericEl.exists() && !termGenericEl.getValue() === true)) {
        _displayError('Please review and accept our terms.');
        return;
      }

      if (method === 'email') {
        // email = (email || select('.auth-email-input').getValue()).trim().toLowerCase();
        email = resolveAuthInputValue(email, mode, 'email');
        // password = password || select('.auth-password-input').getValue();
        password = resolveAuthInputValue(password, mode, 'password');
        // passwordConfirm = passwordConfirm || select('.auth-password-confirm-input').getValue();
        passwordConfirm = resolveAuthInputValue(passwordConfirm, mode, 'password-confirm');
        // console.log('Signup attempt: ', method, email, password, passwordConfirm);

        // Handler
        uxHandler(email, password, passwordConfirm, mode);

        if (password === passwordConfirm) {
          // signupButtonDisabled(true);
          setAuthButtonDisabled(mode, true);
          firebase.auth().createUserWithEmailAndPassword(email, password)
          .then(function(credential) {
            // self.properties.page.status.didSignUp = true;
            // self.log('Good signup');
            // signupButtonDisabled(false);
          })
          .catch(function(error) {
            // signupButtonDisabled(false);
            setAuthButtonDisabled(mode, false);
            _displayError(error.message);
            // self.log('error', error.message);
          });
        } else {
          _displayError("Passwords don't match.");
        }
      } else {
        self.auth().signIn(method);
      }

    },
    signOut: function() {
      // self.log('signOut()');
      // var self = this;
      return firebase.auth().signOut()
      .catch(function(e) {
        console.error(e);
        // self.log('signOut failed: ', error);
      });
      // return firebase.auth().signOut()
      // .then(function() {
      //   // self.log('signOut success.');
      // })
      // .catch(function(e) {
      //   // console.error(e);
      //   // self.log('signOut failed: ', error);
      // });
    },
    forgot: function(email) {
      // self.log('forgot()');
      var mode = 'forgot';
      // email = email || select('.auth-email-input').getValue();
      email = resolveAuthInputValue(email, mode, 'email')

      // forgotButtonDisabled(true);
      setAuthButtonDisabled(mode, true);
      _preDisplayError();

      firebase.auth().sendPasswordResetEmail(email)
      .then(function() {
        // forgotButtonDisabled(false);
        setAuthButtonDisabled(mode, false);
        // self.log('forgot success.');
        _displayError('A reset link has been sent to you.');
      })
      .catch(function(error) {
        // forgotButtonDisabled(false);
        setAuthButtonDisabled(mode, false);
        // self.log('forgot failed: ', error);
        _displayError(error.message);
      });
    },

  }
}

//@@@NOTIFICATIONS
Manager.prototype.notifications = function(options) {
  var self = this;
  var supported = (typeof firebase.messaging !== 'undefined') && ('serviceWorker' in navigator) && ('Notification' in window);

  return {
    isSubscribed: function () {
      return new Promise(function(resolve, reject) {
        // Log
        // self.log('isSubscribed()');

        // Check if subscribed
        return resolve(supported && Notification.permission === 'granted');
      })
    },
    subscribe: function () {
      return new Promise(function(resolve, reject) {
        // Log
        // self.log('subscribe()');

        // Check if supported
        if (!supported) {
          return resolve(false)
        }

        // Ask for permission
        firebase.messaging()
        .getToken({
          serviceWorkerRegistration: self.properties.references.serviceWorker,
        })
        .then(function (token) {
          var user = self.auth().getUser();
          var localSubscription = store.get('notifications', {});
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
            var subscriptionRef = firebase.firestore().doc('notifications/' + token);

            function saveLocal() {
              // console.log('---------saveLocal');
              // self.log('Saved local token: ', token);
              store.set('notifications', {uid: user.uid, token: token, lastSynced: timestamp});
            }

            function saveServer(doc) {
              // Run if it (DOES NOT EXIST on server) OR (it does AND the uid field is null AND the current user is not null)
              if (!doc.exists || (doc.exists && !self.utilities().get(doc.data(), 'owner.uid', '') && user.uid)) {
                subscriptionRef
                .set(
                  {
                    created: {
                      timestamp: timestamp,
                      timestampUNIX: timestampUNIX,
                    },
                    owner: {
                      uid: user.uid,
                    },
                    token: token,
                    url: window.location.href,
                    tags: ['general'],
                  },
                  {
                    merge: true,
                  },
                )
                .then(function(data) {
                  // self.log('Updated token:', token);
                  saveLocal();
                  resolve(true);
                })
              } else {
                saveLocal();
                // self.log('Skip sync because server data exists');
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
            // self.log('Skip sync because recently done');
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

/*
HELPERS
*/
function subscriptionManager(self, options_user) {
  if (
    !('serviceWorker' in navigator)
    || (typeof firebase === 'undefined')
    || (typeof firebase.messaging === 'undefined')
  ) {
    return
  }

  // service worker guide: https://developers.google.com/web/updates/2018/06/fresher-sw
  navigator.serviceWorker.register(
    '/' + (options_user.serviceWorker.path || 'master-service-worker.js')
    + '?config=' + encodeURIComponent(JSON.stringify({
      name: self.properties.global.brand.name,
      app: self.properties.global.app,
      env: self.properties.meta.environment,
      v: self.properties.global.version,
      cb: self.properties.global.cacheBreaker,
      firebase: options_user.libraries.firebase_app.config
    }))
  )
  .then(function (registration) {
    // Force Firebase to use the service worker
    // firebase.messaging().useServiceWorker(registration);

    // Set the registration to the properties
    self.properties.references.serviceWorker = registration;

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

    // self.log('SW Registered.');
    //@@@NOTIFICATIONS
    // _setupTokenRefreshHandler(self);

    // Force update the service worker
    registration.update();

    // Normally, notifications are not displayed when user is ON PAGE but we will display it here anyway
    try {
      firebase.messaging().onMessage(function (payload) {
        // Get the notification data
        var notification = payload.notification;
        var data = payload.data;

        // Get the click action
        var clickAction = notification.click_action || data.click_action;

        // Log
        console.log('Message received', payload, clickAction);

        // Display notification
        new Notification(notification.title, notification)
        .onclick = function(event) {
          // Quit if there is no click action
          if (!clickAction) {
            return;
          }

          // prevent the browser from focusing the Notification's tab
          event.preventDefault();

          // Open the click action
          window.open(clickAction, '_blank');
        }
      })
    } catch (e) {
      console.error(e);
    }
  })
  .catch(function (e) {
    // console.log('***2');
    console.error(e);
  });

  // Service Worker Ready
  // navigator.serviceWorker.ready.then(function(registration) {
  // });
}

function showExitPopup(self) {
  var exitPopupSettings = self.properties.options.exitPopup;

  if (!exitPopupSettings.enabled) {
    return;
  };

  var lastTriggered = new Date(storage.get('exitPopup.lastTriggered', 0));
  var now = new Date();
  var diff = now - lastTriggered;

  if (diff < exitPopupSettings.config.timeout) {
    return;
  };

  showBootstrapModal(exitPopupSettings);
}

function showBootstrapModal(exitPopupSettings) {
  var proceed = exitPopupSettings.config.handler
    ? exitPopupSettings.config.handler()
    : true;

  if (!proceed) {
    return;
  }

  var $el = document.getElementById('modal-exit-popup');
  try {
    var modal = new bootstrap.Modal($el);
    modal.show();
    $el.removeAttribute('hidden');

    var $title = $el.querySelector('.modal-title');
    var $message = $el.querySelector('.modal-body');
    var $okButton = $el.querySelector('.modal-footer .btn-primary');
    var config = exitPopupSettings.config;

    var link = config.okButton.link
      .replace(/{pathname}/ig, window.location.pathname)

    $title.innerHTML = config.title;
    $message.innerHTML = config.message;
    $okButton.innerHTML = config.okButton.text;
    $okButton.setAttribute('href', link);

    storage.set('exitPopup.lastTriggered', new Date().toISOString());
  } catch (e) {
    console.warn(e);
  }
}

function refreshNewVersion(self) {
  // console.log('refreshNewVersion()');

  // Skip if not enabled
  if (!self.properties.options.refreshNewVersion.enabled) {
    return;
  }

  // Make request to get the build time (live)
  fetch('/@output/build/build.json?cb=' + new Date().getTime())
  .then(function (res) {
    if (res.ok) {
      return res.json();
    } else {
      throw new Error('Bad response');
    }
  })
  .then(function (data) {
    var buildTimeCurrent = self.properties.global.buildTime;
    var buildTimeLive = new Date(data['npm-build'].timestamp);

    // Set buildTimeCurrent to 1 hour ahead to account for the npm-build time which will ALWAYS be set to later since it happens later
    buildTimeCurrent.setHours(buildTimeCurrent.getHours() + 1);

    // Log
    // console.log('refreshNewVersion()', data, buildTimeCurrent, buildTimeLive);

    // If the live time is newer, refresh
    if (buildTimeCurrent < buildTimeLive) {
      console.log('refreshNewVersion(): Refreshing...');

      if (self.isDevelopment()) {
        return;
      }

      // Force page reload
      window.onbeforeunload = function () {
        return undefined;
      }

      // Refresh
      window.location.reload(true);
    }
  })
  .catch(function (e) {
    console.error(e);
  })
}

/*
EXTERNAL LIBS
*/
var load_firebase = function(self, options) {
  return new Promise(function(resolve, reject) {
    // Set shortcuts
    var setting = options.libraries.firebase_app

    // Skip if not enabled
    if (!setting.enabled) {
      return resolve();
    }

    // Setup Firebase
    function _post() {
      // Initialize Firebase
      window.app = firebase.initializeApp(setting.config);

      // Load Firebase libraries
      Promise.all([
        load_firebase_auth(self, options),
        load_firebase_firestore(self, options),
        load_firebase_messaging(self, options),
        load_firebase_appCheck(self, options),
      ])
      .then(resolve)
      .catch(reject);
    }

    // Load Firebase
    if (setting.load) {
      setting.load(self)
      .then(_post)
      .catch(reject);
    } else {
      // import('firebase/app')
      import('firebase/compat/app')
      .then(function(mod) {
        window.firebase = mod.default;
        _post()
        })
        .catch(reject);
    }
  });
}

var load_firebase_auth = function(self, options) {
  return new Promise(function(resolve, reject) {
    // Set shortcuts
    var setting = options.libraries.firebase_auth;

    // Skip if not enabled
    if (!setting.enabled) {
      return resolve();
    }

    // Load Firebase Auth
    if (setting.load) {
      setting.load(self)
      .then(resolve)
      .catch(reject);
    } else {
      // import('firebase/auth')
      import('firebase/compat/auth')
      .then(resolve)
      .catch(reject);
    }
  });
}

var load_firebase_firestore = function(self, options) {
  return new Promise(function(resolve, reject) {
    // Set shortcuts
    var setting = options.libraries.firebase_firestore;

    // Skip if not enabled
    if (!setting.enabled) {
      return resolve();
    }

    // Load Firebase Firestore
    if (setting.load) {
      setting.load(self)
      .then(resolve)
      .catch(reject);
    } else {
      // import('firebase/firestore')
      import('firebase/compat/firestore')
      .then(resolve)
      .catch(reject);
    }
  });
}

var load_firebase_messaging = function(self, options) {
  return new Promise(function(resolve, reject) {
    // Set shortcuts
    var setting = options.libraries.firebase_messaging;

    // Skip if not enabled
    if (!setting.enabled) {
      return resolve();
    }

    // Load Firebase Messaging
    if (setting.load) {
      setting.load(self)
      .then(resolve)
      .catch(reject);
    } else {
      // import('firebase/messaging')
      import('firebase/compat/messaging')
      .then(resolve)
      .catch(reject);
    }
  });
}

var load_firebase_appCheck = function(self, options) {
  return new Promise(function(resolve, reject) {
    // Set shortcuts
    var setting = options.libraries.firebase_appCheck;

    // Skip if not enabled
    if (!setting.enabled) {
      return resolve();
    }

    // Load Firebase AppCheck
    if (setting.load) {
      setting.load(self)
      .then(resolve)
      .catch(reject);
    } else {
      // import('firebase/app-check')
      import('firebase/compat/app-check')
      .then(function (mod) {
        var appCheck = firebase.appCheck;
        var siteKey = setting.config.siteKey;

        if (!siteKey) {
          return resolve();
        }

        appCheck().activate(
          new appCheck.ReCaptchaEnterpriseProvider(siteKey),
          true,
        );

        resolve();
      })
      .catch(reject);
    }
  });
}

var load_lazysizes = function(self, options) {
  return new Promise(function(resolve, reject) {
    // Skip if not enabled
    if (!options.libraries.lazysizes.enabled) {
      return resolve();
    }

    // Load Lazysizes
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
      // self.log('Loaded Lazysizes.');
    })
    .catch(reject);
  });
}

var load_cookieconsent = function(self, options) {
  return new Promise(function(resolve, reject) {
    // Skip if not enabled
    if (!options.libraries.cookieconsent.enabled) {
      return resolve();
    }

    // Load Cookieconsent
    import('cookieconsent')
    .then(function(mod) {
      window.cookieconsent.initialise(options.libraries.cookieconsent.config);
      // self.log('Loaded Cookieconsent.');
      resolve();
    })
    .catch(reject);
  });
}

var load_chatsy = function(self, options) {
  return new Promise(function(resolve, reject) {
    // Skip if not enabled or already requested
    if (!options.libraries.chatsy.enabled || self.properties.page._chatsyRequested) {
      return resolve();
    }

    var chatsyPath = 'libraries.chatsy.config';

    // Immediately hide the fake button
    select('#prechat-btn').hide();

    // Load the script
    loadScript({
      src: 'https://app.chatsy.ai/resources/script.js',
      // src: 'http://localhost:4001/resources/script.js',
      attributes: [
        {name: 'data-account-id', value: utilities.get(options, chatsyPath + '.accountId', '')},
        {name: 'data-chat-id', value: utilities.get(options, chatsyPath + '.chatId', '')},
        {name: 'data-settings', value: JSON.stringify(utilities.get(options, chatsyPath + '.settings', ''))},
      ],
      crossorigin: true,
    })
    .then(function () {
      // Listen for Chatsy status
      chatsy.on('status', function(event, status) {
        if (status === 'loaded') {
          chatsy.open();
        }
      })

      resolve();
    })

    self.properties.page._chatsyRequested = true;
  });
}

var load_sentry = function(self, options) {
  return new Promise(function(resolve, reject) {
    // Skip if not enabled
    if (!options.libraries.sentry.enabled) {
      return resolve();
    }

    // Import Sentry
    import('@sentry/browser')
    .then(function(mod) {
      // Set global
      window.Sentry = mod;

      // Set config
      var config = options.libraries.sentry.config;
      config.release = config.release + '@' + self.properties.global.version;
      config.environment = self.properties.meta.environment;
      config.integrations = config.integrations || [];

      // if (self.isDevelopment()) {
      //   config.dsn = 'https://901db748bbb9469f860dc36fb07a4374@o1120154.ingest.sentry.io/6155285';
      // }

      // Add integration: browser tracing
      config.integrations.push(Sentry.browserTracingIntegration());

      // Add integration: replay
      if (config.replaysSessionSampleRate > 0 || config.replaysOnErrorSampleRate > 0) {
        config.integrations.push(Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }));
      }

      // Setup before send
      config.beforeSend = function (event, hint) {
        var startTime = self.properties.page.startTime;
        var hoursSinceStart = (new Date() - startTime) / (1000 * 3600);

        // Setup tags
        event.tags = event.tags || {};
        event.tags['process.type'] = event.tags['process.type'] || 'browser';
        // event.tags['usage.total.opens'] = parseInt(usage.total.opens);
        // event.tags['usage.total.hours'] = usage.total.hours;
        event.tags['usage.session.hours'] = hoursSinceStart.toFixed(2);
        // event.tags['store'] = self.properties().isStore();

        // Setup user
        event.user = event.user || {};
        event.user.email = storage.get('user.auth.email', '')
        event.user.uid = storage.get('user.auth.uid', '');
        // event.user.ip = storage.get('user.ip', '');

        // Log to console
        console.error('[SENTRY] Caught error', event, hint);

        // Skip processing the event
        if (self.isDevelopment()) {
          return null;
        }

        // Process the event
        return event;
      }

      // Initialize
      Sentry.init(config);

      // Resolve
      resolve();
    })
    .catch(reject);
  });
}

Manager.prototype.log = function() {
  var self = this;

  if (self.isDevelopment()) {
    // 1. Convert args to a normal array
    var args = Array.prototype.slice.call(arguments);

    // 2. Prepend log prefix log string
    args.unshift('[DEV @ ' + new Date().toLocaleTimeString() + ']');

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

function init_loadPolyfills(self, configuration, cb) {
  // https://github.com/jquintozamora/polyfill-io-feature-detection/blob/master/index.js
  var featuresDefault = (
    typeof Symbol !== 'undefined'
  )
  var featuresCustom = true;

  if (featuresDefault && featuresCustom) {
    cb();
  } else {
    loadScript({src: 'https://cdnjs.cloudflare.com/polyfill/v3/polyfill.min.js?flags=always%2Cgated&features=default%2Ces5%2Ces6%2Ces7%2CPromise.prototype.finally%2C%7Ehtml5-elements%2ClocalStorage%2Cfetch%2CURLSearchParams'})
      .then(function() {
        cb();
      })
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

/**
* ACCOUNT
*/
// Manager.prototype.account = function() {
//   var self = this;
//   return {
//     resolve: function (options) {
//       return import('./lib/account.js')
//         .then(function(mod) {
//           self.account = function () { return mod.default }
//           return self.account().resolve(options);
//         })
//     }
//   }
// }

Manager.prototype.account = function() {
  var self = this;

  return {
    import: function () {
      return import('./lib/account.js')
      .then(function(mod) {
        self.account = function () { return mod.default }
        mod.default.prototype.Manager = self;
        return self.account();
      })
    }
  }
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
Manager.prototype.performance = function () {
  return {
    mark: function(mark) {
      try {
        window.performance.mark(mark);
      } catch (e) {
      }
    }
  }
}

Manager.prototype.isValidRedirectUrl = function (url) {
  var self = this;

  var returnUrlObject = new URL(decodeURIComponent(url));
  var currentUrlObject = new URL(window.location.href);

  return returnUrlObject.host === currentUrlObject.host
    || returnUrlObject.protocol === this.properties.global.app + ':'
    || self.properties.global.validRedirectHosts.includes(returnUrlObject.host)
}

Manager.prototype.isDevelopment = function () {
  var self = this;

  return self.properties.meta.environment === 'development';
}

// Manager.prototype.performance = function() {
//   var self = this;
//
//   return {
//     mark2: function () {
//       return firebaseActive ? !!firebase.auth().currentUser : false;
//     },
//
//   }
// }

function getApiUrl(url) {
  // Set API url
  var globalUrl = new URL(url);
  var hostnameParts = globalUrl.hostname.split('.');

  // Check if subdomain exists
  if (hostnameParts.length > 2) {
    hostnameParts[0] = 'api';
  } else {
    hostnameParts.unshift('api');
  }

  // Set hostname
  globalUrl.hostname = hostnameParts.join('.');

  // Return new URL
  return globalUrl.toString();
}


/**
* HELPERS
*/

module.exports = Manager;
