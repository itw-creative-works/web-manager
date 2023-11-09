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
function ieVersion() {
  var match = /\b(MSIE |Trident.*?rv:|Edge\/)(\d+)/.exec(navigator.userAgent);
  if (match) {return parseInt(match[2])};
}

function Manager() {
  var self = this;
  var iev = ieVersion();

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
      isSupportedBrowser: (!iev || iev >= 11), // https://makandracards.com/makandra/53475-minimal-javascript-function-to-detect-version-of-internet-explorer-or-edge
      startTime: new Date(),
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
      // auth events
      if (event.target.matches('.auth-signin-email-btn')) {
        self.auth().signIn('email');
      } else if (event.target.matches('.auth-signup-email-btn')) {
        self.auth().signUp('email');
      } else if (event.target.matches('.auth-signin-provider-btn')) {
        self.auth().signIn(event.target.getAttribute('data-provider'));
      } else if (event.target.matches('.auth-signup-provider-btn')) {
        self.auth().signUp(event.target.getAttribute('data-provider'));
      } else if (event.target.matches('.auth-signout-all-btn')) {
        self.auth().signOut();
      } else if (event.target.matches('.auth-forgot-email-btn')) {
        self.auth().forgot();
      } else if (event.target.matches('#prechat-btn')) {
        load_chatsy(self, self.properties.options);
      } else if (event.target.matches('.auth-subscribe-notifications-btn')) {
        self.notifications().subscribe()
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
    }, 1000 * 60 * 60 * 24 * 7);

  }

  function _authStateHandler(self, user) {
    // self.log('----authStateHandler', user);
    if (user) {
      if (!user.isAnonymous) {
        _authHandle_in(self, user);

        self.notifications().subscribe().catch(function (e) {
          console.error(e);
        });
      } else {
        _authHandle_out(self);
      }
    } else {
      _authHandle_out(self);
    }
  }

  function _authHandle_in(self, user) {
    // self.log('_authHandle_in', user);
    // if (self.properties.page.status.didSignUp) {
    var done;
    var hoursSinceCreation = Math.abs(new Date() - new Date(+user.metadata.createdAt)) / 36e5;

    function _done() {
      if (!done) {
        done = true;
        store.set('didSignUp', true)
        _authHandle_in_normal(self, user);
      }
    }

    if (!store.get('didSignUp') && hoursSinceCreation < 0.5) {
      user.getIdToken(false)
        .then(function(token) {

          fetch('https://us-central1-' + self.properties.options.libraries.firebase_app.config.projectId + '.cloudfunctions.net/bm_api', {
            method: 'POST',
            body: JSON.stringify({
              authenticationToken: token,
              command: 'user:sign-up',
              payload: {
                newsletterSignUp: select('.auth-newsletter-input').getValue(),
                // affiliateCode: store.get('auth.affiliateCode', ''),
                affiliateCode: store.get('affiliateCode', ''),
              },
            }),
          })
          .catch(function () {})
          .finally(_done);

          setTimeout(function () {
            _done()
          }, 5000);

        })
        .catch(function(error) {
          console.error(error);
          _done();
        });
    } else {
      _done();
    }
  }



  function _authHandle_in_normal(self, user) {
    var returnUrl = self.properties.page.queryString.get('auth_redirect');
    if (returnUrl && self.isValidRedirectUrl(returnUrl)) {
      window.location.href = decodeURIComponent(returnUrl);
      return;
    }
    if (self.properties.options.auth.state === 'prohibited') {
      window.location.href = self.properties.options.auth.sends.prohibited;
      return;
    }
    select('.auth-signedin-true-element').show();
    select('.auth-signedin-false-element').hide();
    select('.auth-email-element').each(function(e, i) {
      if (e.tagName === 'INPUT') {
        select(e).setValue(user.email)
      } else {
        select(e).setInnerHTML(user.email)
      }
    });
    select('.auth-uid-element').each(function(e, i) {
      if (e.tagName === 'INPUT') {
        select(e).setValue(user.uid)
      } else {
        select(e).setInnerHTML(user.uid)
      }
    });
  }

  function _authHandle_out(self) {
    if (self.properties.options.auth.state === 'required') {
      var sendSplit = self.properties.options.auth.sends.required.split('?');
      var newQuery = new URLSearchParams(sendSplit[1]);
      newQuery.set('auth_redirect', window.location.href);
      window.location.href = sendSplit[0] + '?' + newQuery.toString();
      return;
    }

    select('.auth-signedin-true-element').hide();
    select('.auth-signedin-false-element').show();
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
          // self.properties.genericPromise = new Promise(resolve => { resolve() });
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
                required: '/signup/',
                prohibited: '/',
              },
            },
            exitPopup: {
              enabled: true,
              config: {
                timeout: 3600000,
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
                    message: 'We use cookies to ensure you get the best experience on our website. By continuing to use the site, you agree to our<a href="/terms/" class="cc-link" style="padding-right: 0">terms of service</a>.',
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
          self.properties.global.cacheBreaker = configuration.global.cacheBreaker;

          self.properties.global.brand = configuration.global.brand;
          self.properties.global.contact = configuration.global.contact;
          self.properties.global.download = configuration.global.download;
          self.properties.global.extension = configuration.global.extension;

          self.properties.global.validRedirectHosts = configuration.global.validRedirectHosts;
          self.properties.meta.environment = utilities.get(configuration, 'global.settings.debug.environment', self.properties.meta.environment);
          self.properties.page.queryString = new URLSearchParams(window.location.search);

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

          if (redirect && self.isValidRedirectUrl(redirect)) {
            return window.location.href = redirect;
          }

          if (pagePathname.match(/\/(signin|signup|forgot)\//)) {
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
                box.style.display = 'block';
                document.body.insertBefore(box, document.body.firstChild);
              }
            } catch (e) {}

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
    var erel = '.auth-error-message-element';

    function _displayError(msg) {
      console.error(msg);
      select(erel).show().setInnerHTML(msg);
    }
    function _preDisplayError() {
      select(erel).hide().setInnerHTML('');
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

    function resolveAuthInput(existing, mode, input) {
      var authSelector = '.auth-';
      var inputSelector = authSelector + input + '-input';
      var formSelector = authSelector + mode + '-form ';
      var result = existing || select(formSelector + inputSelector).getValue() || select(inputSelector).getValue();

      return input === 'email' ? result.trim().toLowerCase() : result;
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
          email = resolveAuthInput(email, mode, 'email');
          // password = password || select('.auth-password-input').getValue();
          password = resolveAuthInput(password, mode, 'password');
          // console.log('Signin attempt: ', method, email, password);

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
          email = resolveAuthInput(email, mode, 'email');
          // password = password || select('.auth-password-input').getValue();
          password = resolveAuthInput(password, mode, 'password');
          // passwordConfirm = passwordConfirm || select('.auth-password-confirm-input').getValue();
          passwordConfirm = resolveAuthInput(passwordConfirm, mode, 'password-confirm');
          // console.log('Signup attempt: ', method, email, password, passwordConfirm);

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
        email = resolveAuthInput(email, mode, 'email')

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
        // self.log('isSubscribed()');
        return new Promise(function(resolve, reject) {
          if (!supported || Notification.permission !== 'granted') {return resolve(false)};
          return resolve(true);
        })
      },
      subscribe: function () {
        // self.log('subscribe()');
        return new Promise(function(resolve, reject) {
          // var subscribed = !self.notifications().isSubscribed();
          if (!supported) {
            return resolve(false)
          }
          firebase.messaging().getToken({
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
              var subscriptionRef = firebase.firestore().doc('notifications/subscriptions/all/' + token);

              function saveLocal() {
                // console.log('---------saveLocal');
                // self.log('Saved local token: ', token);
                store.set('notifications', {uid: user.uid, token: token, lastSynced: timestamp});
              }

              function saveServer(doc) {
                // console.log('-------saveServer', !doc.exists, !self.utilities().get(doc.data(), 'link.user.data.uid', ''), user.uid);
                // Run if it (DOES NOT EXIST on server) OR (it does AND the uid field is null AND the current user is not null)
                if (!doc.exists || (doc.exists && !self.utilities().get(doc.data(), 'link.user.data.uid', '') && user.uid)) {
                  subscriptionRef
                  .set(
                    {
                      meta: {
                        dateSubscribed: {
                          timestamp: timestamp,
                          timestampUNIX: timestampUNIX
                        },
                        url: window.location.href,
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
                    // self.log('Updated token: ', token);
                    saveLocal();
                    resolve(true);
                  })
                } else {
                  saveLocal();
                  // self.log('Skip sync, server data exists.');
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
              // self.log('Skip sync, recently done.');
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
    if (!('serviceWorker' in navigator) || !(typeof firebase.messaging !== 'undefined')) {return}

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
      // firebase.messaging().useServiceWorker(registration);
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

      try {
        // Normally, notifications are not displayed when user is ON PAGE but we will display it here anyway
        firebase.messaging().onMessage(function (payload) {
          new Notification(payload.notification.title, payload.notification)
          .onclick = function(event) {
            event.preventDefault(); // prevent the browser from focusing the Notification's tab
            window.open(payload.notification.click_action, '_blank');
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
    console.log('refreshNewVersion()');

    fetch('/@output/build/build.json' + '?cb=' + new Date().getTime())
    .then(function (res) {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error('Bad response');
      }
    })
    .then(function (data) {
      var buildTime = new Date(data['npm-build'].timestamp_utc);
      var startTime = self.properties.page.startTime;

      if (buildTime > startTime) {
        // console.log('refreshNewVersion(): Refreshing...');

        window.onbeforeunload = function () {
          return undefined;
        }
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
      // if (typeof window.firebase !== 'undefined') {
      //   return resolve();
      // }
      var setting = options.libraries.firebase_app
      if (setting.enabled === true) {
        function _post() {
          // self.log('Loaded Firebase.');
          // console.log('_post.');
          window.app = firebase.initializeApp(setting.config);

          Promise.all([
            load_firebase_auth(self, options),
            load_firebase_firestore(self, options),
            load_firebase_messaging(self, options),
            load_firebase_appCheck(self, options),
          ])
          .then(resolve)
          .catch(reject);
        }
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
      } else {
        resolve();
      }
    });
  }


  var load_firebase_auth = function(self, options) {
    return new Promise(function(resolve, reject) {
      // if (typeof utilities.get(window, 'firebase.auth', undefined) !== 'undefined') {
      //   return resolve();
      // }
      var setting = options.libraries.firebase_auth;
      if (setting.enabled === true) {
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
      } else {
        resolve();
      }

    });
  }


  var load_firebase_firestore = function(self, options) {
    return new Promise(function(resolve, reject) {
      // if (typeof utilities.get(window, 'firebase.firestore', undefined) !== 'undefined') {
      //   return resolve();
      // }
      var setting = options.libraries.firebase_firestore;
      if (setting.enabled === true) {
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
      } else {
        resolve();
      }
    });
  }

  var load_firebase_messaging = function(self, options) {
    return new Promise(function(resolve, reject) {
      // if (typeof utilities.get(window, 'firebase.messaging', undefined) !== 'undefined') {
      //   return resolve();
      // }
      var setting = options.libraries.firebase_messaging;
      if (setting.enabled === true) {
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
      } else {
        resolve();
      }
    });
  }

  var load_firebase_appCheck = function(self, options) {
    return new Promise(function(resolve, reject) {
      var setting = options.libraries.firebase_appCheck;
      if (setting.enabled === true) {
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
      } else {
        resolve();
      }
    });
  }

  var load_lazysizes = function(self, options) {
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
          // self.log('Loaded Lazysizes.');
        })
        .catch(reject);
      } else {
        resolve();
      }
    });
  }

  var load_cookieconsent = function(self, options) {
    return new Promise(function(resolve, reject) {
      // if (typeof window.cookieconsent !== 'undefined') {
      //   return resolve();
      // }
      if (options.libraries.cookieconsent.enabled === true) {
        import('cookieconsent')
        .then(function(mod) {
          window.cookieconsent.initialise(options.libraries.cookieconsent.config);
          // self.log('Loaded Cookieconsent.');
          resolve();
        })
        .catch(reject);
      } else {
        resolve();
      }

    });
  }

  var load_chatsy = function(self, options) {
    return new Promise(function(resolve, reject) {

      if (
        options.libraries.chatsy.enabled === true
        && !self.properties.page._chatsyRequested
      ) {
        var chatsyPath = 'libraries.chatsy.config';

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
              setTimeout(function () {
                select('#prechat-btn').hide();
              }, 1000);

              chatsy.open();
            }
          })

          resolve();
        })

        self.properties.page._chatsyRequested = true;
      } else {
        resolve();
      }
    });
  }

  var load_sentry = function(self, options) {
    return new Promise(function(resolve, reject) {
      if (options.libraries.sentry.enabled === true) {
        import('@sentry/browser')
        .then(function(mod) {
          window.Sentry = mod;
          var config = options.libraries.sentry.config;
          config.release = config.release + '@' + self.properties.global.version;
          config.environment = self.properties.meta.environment;

          // if (self.isDevelopment()) {
          //   config.dsn = 'https://901db748bbb9469f860dc36fb07a4374@o1120154.ingest.sentry.io/6155285';
          // }

          if (config.replaysSessionSampleRate > 0 || config.replaysOnErrorSampleRate > 0) {
            config.integrations = [
              new Sentry.Replay({
                // Additional SDK configuration goes in here, for example:
                // maskAllText: true,
                // blockAllMedia: true,
              }),
            ]
          }

          config.beforeSend = function (event, hint) {
            var startTime = self.properties.page.startTime;
            var hoursSinceStart = (new Date() - startTime) / (1000 * 3600);

            event.tags = event.tags || {};
            event.tags['process.type'] = event.tags['process.type'] || 'browser';

            // event.tags['usage.total.opens'] = parseInt(usage.total.opens);
            // event.tags['usage.total.hours'] = usage.total.hours;
            event.tags['usage.session.hours'] = hoursSinceStart.toFixed(2);
            // event.tags['store'] = self.properties().isStore();
            event.user = event.user || {};
            event.user.email = storage.get('user.auth.email', '')
            event.user.uid = storage.get('user.auth.uid', '');
            // event.user.ip = storage.get('user.ip', '');

            console.error('[SENTRY] Caught error', event, hint);

            if (self.isDevelopment()) {
              return null;
            }

            return event;
          }
          Sentry.init(config);
          resolve();
        })
        .catch(reject);
      } else {
        resolve();
      }
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
      loadScript({src: 'https://polyfill.io/v3/polyfill.min.js?flags=always%2Cgated&features=default%2Ces5%2Ces6%2Ces7%2CPromise.prototype.finally%2C%7Ehtml5-elements%2ClocalStorage%2Cfetch%2CURLSearchParams'})
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


  /**
  * HELPERS
  */

module.exports = Manager;
