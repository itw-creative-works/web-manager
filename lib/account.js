/*
*/
var dom;
var utilities;

function Account(init) {
  var self = this;
  init = init || {};
  self.properties = {};
  self.accountPageInitialized = false;

  try {
    dom = init.dom || self.Manager.dom();
    utilities = init.utilities || self.Manager.utilities();

    if (new URL(window.location.href).pathname.includes('account')) {
      self.initializeAccountPage();
    }
  } catch (e) {
    console.error('Failed to initialize libraries');
  }

  // var pastDate = new Date(0);
  // self.properties = {
  //   auth: {
  //     uid: _.get(settings, 'auth.uid', null),
  //     email: _.get(settings, 'auth.email', null),
  //     temporary: _.get(settings, 'auth.temporary', useDefaults ? false : null),
  //   },
  //   roles: {
  //     admin: _.get(settings, 'roles.admin', useDefaults ? false : null),
  //     betaTester: _.get(settings, 'roles.betaTester', useDefaults ? false : null),
  //     developer: _.get(settings, 'roles.developer', useDefaults ? false : null),
  //   },
  //   plan: {
  //     id: _.get(settings, 'plan.id', useDefaults ? 'basic' : null), // intro | basic | advanced | premium
  //     expires: {
  //       timestamp: _.get(settings, 'plan.expires.timestamp', useDefaults ? oldDate : null),
  //       timestampUNIX: _.get(settings, 'plan.expires.timestampUNIX', useDefaults ? oldDateUNIX : null),
  //     },
  //     limits: {
  //       devices: _.get(settings, 'plan.limits.devices', useDefaults ? 1 : null),
  //     },
  //     payment: {
  //       processor: _.get(settings, 'plan.payment.processor', null), // paypal | stripe | chargebee, etc
  //       orderId: _.get(settings, 'plan.payment.orderId', null), // xxx-xxx-xxx
  //       resourceId: _.get(settings, 'plan.payment.resourceId', null), // x-xxxxxx
  //       frequency: _.get(settings, 'plan.payment.frequency', null), // monthly || annually
  //       startDate: {
  //         timestamp: _.get(settings, 'plan.payment.startDate.timestamp', useDefaults ? now : null), // x-xxxxxx
  //         timestampUNIX: _.get(settings, 'plan.payment.startDate.timestampUNIX', useDefaults ? nowUNIX : null), // x-xxxxxx
  //       }
  //     }
  //   },
  //   affiliate: {
  //     code: _.get(settings, 'affiliate.code', useDefaults ? shortid.generate() : null),
  //     referrals: {
  //
  //     },
  //     referrer: _.get(settings, 'affiliate.referrer', null),
  //   },
  //   activity: {
  //     lastActivity: {
  //       timestamp: _.get(settings, 'activity.lastActivity.timestamp', useDefaults ? now : null),
  //       timestampUNIX: _.get(settings, 'activity.lastActivity.timestampUNIX', useDefaults ? nowUNIX : null),
  //     },
  //     created: {
  //       timestamp: _.get(settings, 'activity.created.timestamp', useDefaults ? now : null),
  //       timestampUNIX: _.get(settings, 'activity.created.timestampUNIX', useDefaults ? nowUNIX : null),
  //     },
  //   },
  //   api: {
  //     clientId: _.get(settings, 'api.clientId', useDefaults ? `${uuid4()}` : null),
  //     privateKey: _.get(settings, 'api.privateKey', useDefaults ? `${uidgen.generateSync()}` : null),
  //   },
  // }
}

Account.prototype.initializeAccountPage = function (options) {
  var self = this;

  if (self.accountPageInitialized) { return }

  document.addEventListener('click', function (event) {
    if (event.target.matches('.auth-delete-account-btn')) {
      self.delete().catch(function (e) {});
    }
  }, false)

  self.accountPageInitialized = true;

}

Account.prototype.delete = function (options) {
  var self = this;
  var user = firebase.auth().currentUser;
  var errorElement = dom.select('.auth-delete-account-error-message-element');
  var confirmValue = dom.select('.auth-delete-account-confirmation-input').getValue()
  var deleteButton = dom.select('.auth-delete-account-btn')

  deleteButton.setAttribute('disabled', true).addClass('disabled');
  errorElement.setAttribute('hidden', true);

  return new Promise(function(resolve, reject) {
    function _error(e) {
      var er = new Error(e);
      errorElement.removeAttribute('hidden').setInnerHTML(er);
      deleteButton.removeAttribute('disabled').removeClass('disabled');
      return reject(er);
    }
    if (!confirmValue) {
      return _error('Please confirm that you wish to have your account deleted.')
    } else if (!user) {
      return _error('Please log in first.')
    } else {
      user.getIdToken(false)
      .then(function(token) {
        fetch('https://us-central1-' + utilities.get(self.Manager, 'properties.options.libraries.firebase_app.config.projectId', 'unknown') + '.cloudfunctions.net/bm_api', {
        // fetch('http://localhost:5001/optiic-api/us-central1/bm_api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authenticationToken: token,
            command: 'delete-user',
            payload: {},
          }),
        })
        .then(function (res) {
          if (res.ok) {
            res.json()
            .then(function (data) {
              console.log('Successfully deleted account', data);
              self.Manager.auth().signOut();
              return resolve(data);
            })
          } else {
            return res.text()
            .then(function (data) {
              throw new Error(data || res.statusText || 'Unknown error.')
            })
          }
        })
        .catch(function (e) {
          return _error(e);
        })
      })
      .catch(function () {
        return _error(e);
      })
    }
  });
}

Account.prototype.resolve = function (account, options) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var currentUser = firebase.auth().currentUser;
    if (!account || !account.auth) {
      if (!currentUser) {
        return reject(new Error('Malformed <account> input and no currently authenticated user'))
      }
      firebase.firestore().doc('users/' + currentUser.uid)
      .get()
      .then(function (doc) {
        return resolve(self._resolveAccount(currentUser, doc.data(), options));
      })
      .catch(reject)
    } else {
      if (!currentUser) {
        return reject(new Error('No currently authenticated user'))
      }
      return resolve(self._resolveAccount(currentUser, account, options));
    }
  });
}

function _setAuthItem(selector, value) {
  dom.select(selector).each(function(e, i) {
    if (e.tagName === 'INPUT') {
      dom.select(e).setValue(value);
    } else {
      dom.select(e).setInnerHTML(value);
    }
  });
}

function uppercase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getMonth(date) {
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return monthNames[date.getMonth()];
}

Account.prototype._resolveAccount2 = function (firebaseUser, account, options) {
  // TODO: USE resolve-account library Instead

  /*
  const resolver = new (require('resolve-account'))({
    Manager: self.Manager,
    utilities: utilities,
    dom: dom,
  });


  self.properties = resolver.resolve(firebaseUser, account, options)

  return self.properties;

  */

}

/*
  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  THIS HAS BEEN MOVED TO the resolve-account lib
  still here until figure out how to import resolve-account here
  any changes to resolve-account must go here too
  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/
Account.prototype._resolveAccount = function (firebaseUser, account, options) {
  var self = this;
  firebaseUser = firebaseUser || {};
  account = account || {};
  options = options || {};

  var defaultPlanId = options.defaultPlanId || 'basic';

  var currentURL;
  var isDevelopment;

  // Resolve auth
  account.auth = account.auth || {};
  account.auth.email = account.auth.email || firebaseUser.email || null;
  account.auth.uid = account.auth.uid || firebaseUser.uid || null;
  account.auth.temporary = account.auth.temporary || false;

  // Resolve plan
  account.plan = account.plan || {};
  account.plan.id = account.plan.id || defaultPlanId;
  account.plan.expires = account.plan.expires || {};
  account.plan.expires.timestamp = new Date(account.plan.expires.timestamp || 0).toISOString();
  account.plan.expires.timestampUNIX = Math.round(new Date(account.plan.expires.timestamp || 0).getTime() / 1000);
  account.plan.limits = account.plan.limits || {};
  // account.plan.devices = account.plan.devices || 1;

  account.plan.payment = account.plan.payment || {};
  account.plan.payment.startDate = account.plan.payment.startDate || {};
  account.plan.payment.startDate.timestamp = account.plan.payment.startDate.timestamp || '1970-01-01T00:00:00.000Z';
  account.plan.payment.startDate.timestampUNIX = account.plan.payment.startDate.timestampUNIX || 0;
  account.plan.payment.frequency = account.plan.payment.frequency || 'unknown';
  account.plan.payment.orderId = account.plan.payment.orderId || 'unknown';
  account.plan.payment.resourceId = account.plan.payment.resourceId || 'unknown';
  account.plan.payment.active = account.plan.payment.active || false;

  account.plan.payment.updatedBy = account.plan.payment.updatedBy || {};
  account.plan.payment.updatedBy.event = account.plan.payment.updatedBy.event || {};
  account.plan.payment.updatedBy.event.id = account.plan.payment.updatedBy.event.id || 'unknown';
  account.plan.payment.updatedBy.event.name = account.plan.payment.updatedBy.event.name || 'unknown';
  account.plan.payment.updatedBy.date = account.plan.payment.updatedBy.date || {};
  account.plan.payment.updatedBy.date.timestamp = account.plan.payment.updatedBy.date.timestamp || '1970-01-01T00:00:00.000Z';
  account.plan.payment.updatedBy.date.timestampUNIX = account.plan.payment.updatedBy.date.timestampUNIX || 0;

  // Set some variables
  // In a try/catch because this lib is used in node sometimes
  try {
    currentURL = new URL(window.location.href);
    isDevelopment = utilities.get(self.Manager, 'properties.meta.environment', '') === 'development';

    if (utilities.get(isDevelopment)) {
      currentURL.searchParams
      .forEach(function(value, key) {
        var accountValue = utilities.get(account, key, undefined)
        if (typeof accountValue !== undefined) {
          if (value === 'true') { value = true }
          if (value === 'false') { value = false }

          utilities.set(account, key, value)
        }
      });
    }
  } catch (e) {
    if (typeof window !== 'undefined') {
      console.error('Unable to check query strings', e);
    }
  }

  var planExpireDate = new Date(account.plan.expires.timestamp);
  var now = new Date();
  var daysTillExpire = Math.floor((planExpireDate - now) / 86400000);
  var difference = (planExpireDate.getTime() - now.getTime())/(24*3600*1000);
  var startDate = new Date(account.plan.payment.startDate.timestamp);
  var planIsActive = difference > -1 && account.plan.id !== defaultPlanId;

  if (planIsActive) {
    account.plan.id = account.plan.id;
  } else {
    account.plan.id = defaultPlanId;
  }

  // Resolve oAuth2
  account.oauth2 = account.oauth2 || {};
  // account.oauth2.discord = account.oauth2.discord || {};
  // account.oauth2.discord.user = account.oauth2.discord.user || {};

  // Resolve roles
  account.roles = account.roles || {};
  account.roles.betaTester = account.plan.id === defaultPlanId ? false : account.roles.betaTester === true || account.roles.betaTester === 'true';
  account.roles.developer = account.roles.developer === true || account.roles.developer === 'true';
  account.roles.admin = account.roles.admin === true || account.roles.admin === 'true';
  account.roles.vip = account.roles.vip === true || account.roles.vip === 'true';
  account.roles.promoExempt = account.roles.promoExempt === true || account.roles.promoExempt === 'true';

  // Resolve affiliate
  account.affiliate = account.affiliate || {};
  account.affiliate.code = account.affiliate.code || 'unknown';
  account.affiliate.referrals = account.affiliate.referrals || [];
  account.affiliate.referrer = account.affiliate.referrer || 'unknown';

  // Resolve activity
  account.activity = account.activity || {};
  account.activity.lastActivity = account.activity.lastActivity || {};
  account.activity.lastActivity.timestamp = account.activity.lastActivity.timestamp || '1970-01-01T00:00:00.000Z';
  account.activity.lastActivity.timestampUNIX = account.activity.lastActivity.timestampUNIX || 0;

  account.activity.created = account.activity.created || {};
  account.activity.created.timestamp = account.activity.created.timestamp || '1970-01-01T00:00:00.000Z';
  account.activity.created.timestampUNIX = account.activity.created.timestampUNIX || 0;

  // Api
  account.api = account.api || {};
  account.api.clientId = account.api.clientId || 'unknown';
  account.api.privateKey = account.api.privateKey || 'unknown';

  // Personal
  account.personal = account.personal || {};

  account.personal.name = account.personal.name || {};
  account.personal.name.first = account.personal.name.first || '';
  account.personal.name.last = account.personal.name.last || '';

  account.personal.telephone = account.personal.telephone || {};
  account.personal.telephone.countryCode = account.personal.telephone.countryCode || 0;
  account.personal.telephone.national = account.personal.telephone.national || 0;

  account.personal.birthday = account.personal.birthday || {};
  account.personal.birthday.timestamp = account.personal.birthday.timestamp || '1970-01-01T00:00:00.000Z';
  account.personal.birthday.timestampUNIX = account.personal.birthday.timestampUNIX || 0;

  account.personal.gender = account.personal.gender || '';

  account.personal.location = account.personal.location || {};
  account.personal.location.country = account.personal.location.country || '';


  // Set UI elements
  // In a try/catch because this lib is used in node sometimes
  try {
    // var apiLinkURL = isDevelopment ? 'http://localhost:5000/discord-link' : 'https://api.{{ site.brand.name }}.com/discord-link';
    // var apiUnlinkURL = isDevelopment ? 'http://localhost:5000/discord-unlink' : 'https://api.{{ site.brand.name }}.com/discord-unlink';
    var cancelURL = isDevelopment ? 'http://localhost:4001/cancel/' : 'https://itwcreativeworks.com/portal/account/manage/';

    var billingSubscribeBtn = dom.select('.auth-billing-subscribe-btn');
    var billingUpdateBtn = dom.select('.auth-billing-update-btn');
    var billingPlanId = dom.select('.auth-billing-plan-id-element');
    var billingFrequencyEl = dom.select('.auth-billing-frequency-element');
    var billingStartDateEl = dom.select('.auth-billing-start-date-element');
    var billingExpirationDateEl = dom.select('.auth-billing-expiration-date-element');

    var $referralCount = dom.select('.auth-referral-count-element');
    var $referralCode = dom.select('.auth-referral-code-element');
    var $referralLink = dom.select('.auth-referral-link-element');
    var $referralSocialLink = dom.select('a.auth-referral-social-link[data-provider]');

    var authCreatedEl = dom.select('.auth-created-element');
    var authPhoneInput = dom.select('.auth-phone-input');

    var updateURL = new URL(cancelURL);
    var referralURL = new URL(window.location.origin || window.location.host);

    referralURL.pathname = '/';
    referralURL.searchParams.set('aff', account.affiliate.code)

    authCreatedEl.setInnerHTML(
      new Date(
        parseInt(utilities.get(firebaseUser, 'metadata.a', '0'))
      )
      .toLocaleString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    )
    authPhoneInput.setInnerHTML(firebaseUser.phoneNumber).setValue(firebaseUser.phoneNumber)

    billingSubscribeBtn.setAttribute('hidden', true);
    billingUpdateBtn.setAttribute('hidden', true);

    if (planIsActive) {
      updateURL.searchParams.set('appName', utilities.get(self.Manager, 'properties.global.brand.name', 'Unknown'));
      updateURL.searchParams.set('supportUrl', currentURL.origin + '/support');
      updateURL.searchParams.set('supportEmail', utilities.get(self.Manager, 'properties.contact.emailSupport', 'unknown@email.com'));
      updateURL.searchParams.set('userEmail', firebaseUser.email);
      updateURL.searchParams.set('userId', firebaseUser.uid);
      updateURL.searchParams.set('orderId', account.plan.payment.orderId);
      updateURL.searchParams.set('resourceId', account.plan.payment.resourceId);
      billingUpdateBtn.removeAttribute('hidden').setAttribute('href', updateURL.toString());
    } else {
      billingSubscribeBtn.removeAttribute('hidden');
    }

    billingPlanId.setInnerHTML(uppercase(account.plan.id));
    billingFrequencyEl.setInnerHTML(account.plan.id !== defaultPlanId ? ' (billed ' + uppercase(account.plan.payment.frequency) + ')' : '');
    billingStartDateEl.setInnerHTML(account.plan.id !== defaultPlanId ? ' - Purchased ' + getMonth(startDate) + ' ' + startDate.getDate() + ', ' + startDate.getFullYear() : '');
    billingExpirationDateEl.setInnerHTML(account.plan.id !== defaultPlanId && daysTillExpire < 366
      ? '<i class="fas fa-exclamation-triangle mr-1"></i> Expires in ' + daysTillExpire + ' days '
      : '');

    _setAuthItem('.auth-apikey-element', utilities.get(account, 'api.privateKey', 'n/a'));


    $referralCount.setInnerHTML(account.affiliate.referrals.length);
    $referralCode.setInnerHTML(account.affiliate.code).setValue(account.affiliate.code);
    $referralCode.setInnerHTML(referralURL.toString()).setValue(referralURL.toString());

    var affiliateLinkURI = encodeURIComponent(referralURL.toString());
    var affiliateLinkTextURI = encodeURIComponent('Sign up for ' + utilities.get(self.Manager, 'properties.global.brand.name', 'this') + ', a useful service:');

    $referralSocialLink
    .each(function ($el) {
      var provider = $el.dataset.provider;
      var text = encodeURIComponent($el.dataset.shareText || '');

      $el.setAttribute('target', '_blank')

      if (provider === 'facebook') {
        $el.setAttribute('href', 'https://www.facebook.com/sharer.php?u=' + (affiliateLinkURI) + '')
      } else if (provider === 'twitter') {
        $el.setAttribute('href', 'https://twitter.com/share?url=' + (affiliateLinkURI) + '&text=' + (text || affiliateLinkTextURI) + '')
      } else if (provider === 'pinterest') {
        $el.setAttribute('href', 'https://pinterest.com/pin/create/button/?url=' + (affiliateLinkURI) + '&description=' + (text || affiliateLinkTextURI) + '')
      } else if (provider === 'tumblr') {
        $el.setAttribute('href', 'https://www.tumblr.com/share/link?url=' + (affiliateLinkURI) + '&text=' + (text || affiliateLinkTextURI) + '')
      } else if (provider === 'linkedin') {
        $el.setAttribute('href', 'https://www.linkedin.com/sharing/share-offsite/?url=' + (affiliateLinkURI) + '&title=' + (text || affiliateLinkTextURI) + '')
        // $el.setAttribute('href', `http://www.linkedin.com/shareArticle?mini=true&url=https://stackoverflow.com/questions/10713542/how-to-make-custom-linkedin-share-button/10737122&title=How%20to%20make%20custom%20linkedin%20share%20button&summary=some%20summary%20if%20you%20want&source=stackoverflow.com`)
        // $el.setAttribute('href', `http://www.linkedin.com/shareArticle?mini=false&url=' + affiliateLinkURI + '&title=' + text || affiliateLinkTextURI + '`)
      } else if (provider === 'reddit') {
        $el.setAttribute('href', 'http://www.reddit.com/submit?url=' + (affiliateLinkURI) + '&title=' + (text || affiliateLinkTextURI) + '')
      }
    })

  } catch (e) {
    if (typeof window !== 'undefined') {
      console.error('Unable to set DOM elements', e);
    }
  }

  self.properties = account;

  return self.properties;
}

module.exports = Account;
