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
    this.properties.page.url = window.location.href;
  } catch (e) {

  }

  select = this.dom().select;
  loadScript = this.dom().loadScript;
  store = this.storage();
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
    var This = this;

    // Setup click handler
    document.addEventListener('click', function (event) {
      // auth events
      if (event.target.matches('.auth-signin-email-btn')) {
        This.auth().signIn('email');
      } else if (event.target.matches('.auth-signup-email-btn')) {
        This.auth().signUp('email');
      } else if (event.target.matches('.auth-signin-provider-btn')) {
        This.auth().signIn(event.target.getAttribute('data-provider'));
      } else if (event.target.matches('.auth-signup-provider-btn')) {
        This.auth().signUp(event.target.getAttribute('data-provider'));
      } else if (event.target.matches('.auth-signout-all-btn')) {
        This.auth().signOut();
      } else if (event.target.matches('.auth-forgot-email-btn')) {
        This.auth().forgot();
      } else if (event.target.matches('#prechat-btn')) {
        load_chatsy(This, This.properties.options);
      } else if (event.target.matches('.auth-subscribe-notifications-btn')) {
        This.notifications().subscribe()
      }

      // Autorequest
      if (!This._notificationRequested && This.properties.options.pushNotifications.autoRequest) {
        This._notificationRequested = true;

        setTimeout(function () {
          This.notifications().subscribe()
        }, This.properties.options.pushNotifications.autoRequest * 1000);
      }

    });

    // Mouse leave event
    document.addEventListener('mouseleave', function() {
      showExitPopup(This);
    });

    // Window blur event
    window.addEventListener('blur', function() {
      showExitPopup(This);
    });
  }

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
    // if (This.properties.page.status.didSignUp) {
    var done;
    var hoursSinceCreation = Math.abs(new Date() - new Date(+user.metadata.createdAt)) / 36e5;

    function _done() {
      if (!done) {
        done = true;
        store.set('didSignUp', true)
        _authHandle_in_normal(This, user);
      }
    }

    if (!store.get('didSignUp') && hoursSinceCreation < 0.5) {
      user.getIdToken(false)
        .then(function(token) {

          fetch('https://us-central1-' + This.properties.options.libraries.firebase_app.config.projectId + '.cloudfunctions.net/bm_api', {
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



  function _authHandle_in_normal(This, user) {
    var returnUrl = This.properties.page.queryString.get('auth_redirect');
    if (returnUrl && This.isValidRedirectUrl(returnUrl)) {
      window.location.href = decodeURIComponent(returnUrl);
      return;
    }
    if (This.properties.options.auth.state === 'prohibited') {
      window.location.href = This.properties.options.auth.sends.prohibited;
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

  function _authHandle_out(This) {
    if (This.properties.options.auth.state === 'required') {
      var sendSplit = This.properties.options.auth.sends.required.split('?');
      var newQuery = new URLSearchParams(sendSplit[1]);
      newQuery.set('auth_redirect', window.location.href);
      window.location.href = sendSplit[0] + '?' + newQuery.toString();
      return;
    }

    select('.auth-signedin-true-element').hide();
    select('.auth-signedin-false-element').show();
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

  // init with polyfills
  Manager.prototype.init = function(configuration, callback) {
    var This = this;
    if (!utilities.get(This, 'properties.page.status.ready', false) && (!utilities.get(This, 'properties.page.status.initializing', false))) {

      // Performance
      This.performance().mark('manager_init');

      // set initializing to true
      This.properties.page.status.initializing = true;

      // set other properties
      This.properties.meta.environment = window.location.host.match(/:40|ngrok/)
        ? 'development'
        : 'production';

      // Load polyfills
      init_loadPolyfills(This, configuration, function() {
          This.properties.page.status.initializing = false;
          // This.properties.genericPromise = new Promise(resolve => { resolve() });
          var options_defaults = {
            // debug: {
            //   environment: This.properties.meta.environment,
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
                  link: '/pricing?utm_source=exitpopup&utm_medium=popup&utm_campaign=exitpopup',
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
          This.properties.options = options_user;

          // set non-option properties
          This.properties.global.app = configuration.global.app;
          This.properties.global.version = configuration.global.version;
          This.properties.global.url = configuration.global.url;
          This.properties.global.cacheBreaker = configuration.global.cacheBreaker;

          This.properties.global.brand = configuration.global.brand;
          This.properties.global.contact = configuration.global.contact;
          This.properties.global.download = configuration.global.download;
          This.properties.global.extension = configuration.global.extension;

          This.properties.global.validRedirectHosts = configuration.global.validRedirectHosts;
          This.properties.meta.environment = utilities.get(configuration, 'global.settings.debug.environment', This.properties.meta.environment);
          This.properties.page.queryString = new URLSearchParams(window.location.search);

          var pagePathname = window.location.pathname;
          var redirect = false;

          This.properties.page.queryString.forEach(function(value, key) {
            if (key.startsWith('utm_')) {
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

          if (redirect && This.isValidRedirectUrl(redirect)) {
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
            load_lazysizes(This, options_user);
            load_cookieconsent(This, options_user);
            subscriptionManager(This, options_user);

            // This.log('Manager', This);
            return;
          }

          Promise.all([
            load_sentry(This, options_user),
            load_firebase(This, options_user),
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
    var This = this;
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
        // if ( (This.get('page.status.authReady', false) === false) ) {
        // Manager.log('--- authReady() REAL');
        if (!utilities.get(This, 'properties.page.status.authReady', false)) {
          setTimeout(function () {
            This.auth().ready(fn, options);
          }, options.interval);
        } else {

          // Set up listener for redirect (for provider login)
          if (!This._redirectResultSetup) {
            This._redirectResultSetup = true;
            firebase.auth()
              .getRedirectResult()
              .catch(function (error) {
                _displayError(error.message);
              });
          }

          // Performance
          This.performance().mark('manager_authReady');

          return fn(This.auth().getUser());
        }
      },
      signIn: function (method, email, password) {
        var mode = 'signin';
        method = method || 'email';
        _preDisplayError();
        // This.log('Signin attempt: ', method, email, password);
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
            // _postAuthSubscriptionCheck(This)
            // .then(function () {
            //
            // })
            This.properties.page.status.didSignIn = true;
            // signinButtonDisabled(false);
            setAuthButtonDisabled(mode, false);
            // This.log('Good signin');
          })
          .catch(function(error) {
            // signinButtonDisabled(false);
            setAuthButtonDisabled(mode, false);
            _displayError(error.message);
            // This.log('Error', error.message);
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
        // This.log('Signup attempt: ', method, email, password, passwordConfirm);
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
              // This.properties.page.status.didSignUp = true;
              // This.log('Good signup');
              // signupButtonDisabled(false);
            })
            .catch(function(error) {
              // signupButtonDisabled(false);
              setAuthButtonDisabled(mode, false);
              _displayError(error.message);
              // This.log('error', error.message);
            });
          } else {
            _displayError("Passwords don't match.");
          }
        } else {
          This.auth().signIn(method);
        }

      },
      signOut: function() {
        // This.log('signOut()');
        // var This = this;
        return firebase.auth().signOut()
        .catch(function(e) {
          console.error(e);
          // This.log('signOut failed: ', error);
        });
        // return firebase.auth().signOut()
        // .then(function() {
        //   // This.log('signOut success.');
        // })
        // .catch(function(e) {
        //   // console.error(e);
        //   // This.log('signOut failed: ', error);
        // });
      },
      forgot: function(email) {
        // This.log('forgot()');
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
          // This.log('forgot success.');
          _displayError('A reset link has been sent to you.');
        })
        .catch(function(error) {
          // forgotButtonDisabled(false);
          setAuthButtonDisabled(mode, false);
          // This.log('forgot failed: ', error);
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
        // This.log('isSubscribed()');
        return new Promise(function(resolve, reject) {
          if (!supported || Notification.permission !== 'granted') {return resolve(false)};
          return resolve(true);
        })
      },
      subscribe: function () {
        // This.log('subscribe()');
        return new Promise(function(resolve, reject) {
          // var subscribed = !This.notifications().isSubscribed();
          if (!supported) {
            return resolve(false)
          }
          firebase.messaging().getToken({
            serviceWorkerRegistration: This.properties.references.serviceWorker,
          })
          .then(function (token) {
            var user = This.auth().getUser();
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
                // This.log('Saved local token: ', token);
                store.set('notifications', {uid: user.uid, token: token, lastSynced: timestamp});
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

  /*
  HELPERS
  */
  function subscriptionManager(This, options_user) {
    if (!('serviceWorker' in navigator) || !(typeof firebase.messaging !== 'undefined')) {return}

    // service worker guide: https://developers.google.com/web/updates/2018/06/fresher-sw
    navigator.serviceWorker.register(
      '/' + (options_user.serviceWorker.path || 'master-service-worker.js')
      + '?config=' + encodeURIComponent(JSON.stringify({
        name: This.properties.global.brand.name,
        app: This.properties.global.app,
        env: This.properties.meta.environment,
        v: This.properties.global.version,
        cb: This.properties.global.cacheBreaker,
        firebase: options_user.libraries.firebase_app.config
      }))
    )
    .then(function (registration) {
      // firebase.messaging().useServiceWorker(registration);
      This.properties.references.serviceWorker = registration;

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

      // This.log('SW Registered.');
      //@@@NOTIFICATIONS
      // _setupTokenRefreshHandler(This);

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

    // SW Ready
    // navigator.serviceWorker.ready.then(function(registration) {
    // });
  }

  function showExitPopup(This) {
    var exitPopupSettings = This.properties.options.exitPopup;

    if (!exitPopupSettings.enabled) return;

    var lastTriggered = new Date(storage.get('exitPopup.lastTriggered', 0));
    var now = new Date();
    var diff = now - lastTriggered;

    if (diff < exitPopupSettings.config.timeout) return;

    showBootstrapModal(exitPopupSettings);

    storage.set('exitPopup.lastTriggered', now.toISOString());
  }

  function showBootstrapModal(exitPopupSettings) {
    var proceed = exitPopupSettings.config.handler
      ? exitPopupSettings.config.handler()
      : true;

    if (!proceed) { return }

    var $el = document.getElementById('modal-exit-popup');
    var modal = new bootstrap.Modal($el);
    modal.show();

    var $title = $el.querySelector('.modal-title');
    var $message = $el.querySelector('.modal-body');
    var $okButton = $el.querySelector('.modal-footer .btn-primary');
    var config = exitPopupSettings.config;

    $title.innerHTML = config.title;
    $message.innerHTML = config.message;
    $okButton.innerHTML = config.okButton.text;
    $okButton.setAttribute('href', config.okButton.link);

  }

  /*
  EXTERNAL LIBS
  */
  var load_firebase = function(This, options) {
    return new Promise(function(resolve, reject) {
      // if (typeof window.firebase !== 'undefined') {
      //   return resolve();
      // }
      var setting = options.libraries.firebase_app
      if (setting.enabled === true) {
        function _post() {
          // This.log('Loaded Firebase.');
          // console.log('_post.');
          window.app = firebase.initializeApp(setting.config);

          Promise.all([
            load_firebase_auth(This, options),
            load_firebase_firestore(This, options),
            load_firebase_messaging(This, options),
            load_firebase_appCheck(This, options),
          ])
          .then(resolve)
          .catch(reject);
        }
        if (setting.load) {
          setting.load(This)
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


  var load_firebase_auth = function(This, options) {
    return new Promise(function(resolve, reject) {
      // if (typeof utilities.get(window, 'firebase.auth', undefined) !== 'undefined') {
      //   return resolve();
      // }
      var setting = options.libraries.firebase_auth;
      if (setting.enabled === true) {
        if (setting.load) {
          setting.load(This)
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


  var load_firebase_firestore = function(This, options) {
    return new Promise(function(resolve, reject) {
      // if (typeof utilities.get(window, 'firebase.firestore', undefined) !== 'undefined') {
      //   return resolve();
      // }
      var setting = options.libraries.firebase_firestore;
      if (setting.enabled === true) {
        if (setting.load) {
          setting.load(This)
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

  var load_firebase_messaging = function(This, options) {
    return new Promise(function(resolve, reject) {
      // if (typeof utilities.get(window, 'firebase.messaging', undefined) !== 'undefined') {
      //   return resolve();
      // }
      var setting = options.libraries.firebase_messaging;
      if (setting.enabled === true) {
        if (setting.load) {
          setting.load(This)
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

  var load_firebase_appCheck = function(This, options) {
    return new Promise(function(resolve, reject) {
      var setting = options.libraries.firebase_appCheck;
      if (setting.enabled === true) {
        if (setting.load) {
          setting.load(This)
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
        resolve();
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
          resolve();
        })
        .catch(reject);
      } else {
        resolve();
      }

    });
  }

  var load_chatsy = function(This, options) {
    return new Promise(function(resolve, reject) {

      if (
        options.libraries.chatsy.enabled === true
        && !This.properties.page._chatsyRequested
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

        This.properties.page._chatsyRequested = true;
      } else {
        resolve();
      }
    });
  }

  var load_sentry = function(This, options) {
    return new Promise(function(resolve, reject) {
      if (options.libraries.sentry.enabled === true) {
        import('@sentry/browser')
        .then(function(mod) {
          window.Sentry = mod;
          var config = options.libraries.sentry.config;
          config.release = config.release + '@' + This.properties.global.version;
          config.environment = This.properties.meta.environment;
          Sentry.init(config);
          // This.log('Loaded Sentry.');
          resolve();
        })
        .catch(reject);
      } else {
        resolve();
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

  function init_loadPolyfills(This, configuration, cb) {
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
