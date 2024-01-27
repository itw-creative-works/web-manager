/*
*/
function Account(init) {
  var self = this;

  init = init || {};
  self.properties = {};
  self.accountPageInitialized = false;

  try {
    self.dom = init.dom || self.Manager.dom();
    self.utilities = init.utilities || self.Manager.utilities();

    var url = new URL(window.location.href);

    if (url.pathname.startsWith('/account')) {
      self.initializeAccountPage();
    }
  } catch (e) {
    console.error('Failed to initialize libraries');
  }
}

Account.prototype.initializeAccountPage = function (options) {
  var self = this;

  if (self.accountPageInitialized) { return }

  document.addEventListener('click', function (event) {
    if (event.target.matches('.auth-delete-account-btn')) {
      self.delete().catch(function (e) {});
    }
  })

  self.accountPageInitialized = true;

}

Account.prototype.delete = function (options) {
  var self = this;

  var user = firebase.auth().currentUser;
  var errorElement = self.dom.select('.auth-delete-account-error-message-element');
  var confirmValue = self.dom.select('.auth-delete-account-confirmation-input').getValue()
  var deleteButton = self.dom.select('.auth-delete-account-btn')

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
        fetch('https://us-central1-' + self.utilities.get(self.Manager, 'properties.options.libraries.firebase_app.config.projectId', 'unknown') + '.cloudfunctions.net/bm_api', {
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

    account = account || {};
    options = options || {};
    options.fetchNewAccount = typeof options.fetchNewAccount === 'undefined' ? true : options.fetchNewAccount;

    // If there is no user logged in or we choose not to fetch the account, resolve a default account
    if (!currentUser || !currentUser.uid || !options.fetchNewAccount) {
      return resolve(
        self.handleAccount(
          self._resolveAccount(currentUser, account, options)
        )
      );
    }

    // Otherwise, fetch the account from the database and resolve it
    firebase.firestore().doc('users/' + currentUser.uid)
    .get()
    .then(function (doc) {
      return resolve(
        self.handleAccount(
          self._resolveAccount(currentUser, doc.data(), options)
        )
      );
    })
  });
}

Account.prototype.handleAccount = function (account) {
  var self = this;
  var planId = account.plan.id;

  // Handle plans
  handlePlanVisibility(planId);

  // Enable exit popup if it's already enabled and the plan is basic
  if (self.Manager.properties.options.exitPopup.enabled === true) {
    self.Manager.properties.options.exitPopup.enabled = planId === 'basic';
  }

  // Handle others
  // ...

  return account;
}

function handlePlanVisibility(planId) {
  var elements = document.querySelectorAll('[data-plan-id][data-plan-visibility]');

  // Initially hide all elements
  elements.forEach(function($el) {
    $el.setAttribute('hidden', true);
  });

  // Toggle visibility based on plan
  elements.forEach(function($el) {
    var requiredPlans = $el.getAttribute('data-plan-id').split(',');
    var visibility = $el.getAttribute('data-plan-visibility') || 'visible';

    var shouldBeVisible = false;

    // Special case for '$paid'
    if (requiredPlans.includes('$paid')) {
      shouldBeVisible = planId !== 'basic';
    } else {
      shouldBeVisible = requiredPlans.includes(planId);
    }

    var shouldHide = shouldBeVisible
      ? visibility === 'hidden'
      : visibility === 'visible';

    if (shouldHide) {
      $el.setAttribute('hidden', true);
    } else {
      $el.removeAttribute('hidden');
    }
  });
}

function splitDashesAndUppercase(str) {
  return str.split('-').map(function (word) {
    return uppercase(word);
  }).join(' ');
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
  var timestampOld = '1970-01-01T00:00:00.000Z';
  var timestampUNIXOld = 0;

  console.log('++++++account', JSON.stringify(account, null, 2));
  console.log('++++++options', JSON.stringify(options, null, 2));

  // Resolve auth
  account.auth = account.auth || {};
  account.auth.uid = account.auth.uid || firebaseUser.uid || null;
  account.auth.email = account.auth.email || firebaseUser.email || null;
  account.auth.temporary = account.auth.temporary || false;

  // Resolve plan
  account.plan = account.plan || {};
  account.plan.id = account.plan.id || defaultPlanId;

  account.plan.status = account.plan.status || 'cancelled';

  account.plan.expires = account.plan.expires || {};
  account.plan.expires.timestamp = new Date(account.plan.expires.timestamp || 0).toISOString();
  account.plan.expires.timestampUNIX = Math.round(new Date(account.plan.expires.timestamp || 0).getTime() / 1000);

  account.plan.trial = account.plan.trial || {};
  account.plan.trial.activated = account.plan.trial.activated || false;
  account.plan.trial.expires = account.plan.trial.expires || {};
  account.plan.trial.expires.timestamp = new Date(account.plan.trial.expires.timestamp || 0).toISOString()
  account.plan.trial.expires.timestampUNIX = Math.round(new Date(account.plan.trial.expires.timestamp || 0).getTime() / 1000);

  account.plan.limits = account.plan.limits || {};
  // account.plan.devices = account.plan.devices || 1;

  account.plan.payment = account.plan.payment || {};
  account.plan.payment.processor = account.plan.payment.processor || 'unknown';
  account.plan.payment.orderId = account.plan.payment.orderId || 'unknown';
  account.plan.payment.resourceId = account.plan.payment.resourceId || 'unknown';
  account.plan.payment.frequency = account.plan.payment.frequency || 'unknown';
  account.plan.payment.active = account.plan.payment.active || false;

  account.plan.payment.startDate = account.plan.payment.startDate || {};
  account.plan.payment.startDate.timestamp = account.plan.payment.startDate.timestamp || timestampOld;
  account.plan.payment.startDate.timestampUNIX = account.plan.payment.startDate.timestampUNIX || timestampUNIXOld;

  account.plan.payment.updatedBy = account.plan.payment.updatedBy || {};
  account.plan.payment.updatedBy.event = account.plan.payment.updatedBy.event || {};
  account.plan.payment.updatedBy.event.id = account.plan.payment.updatedBy.event.id || 'unknown';
  account.plan.payment.updatedBy.event.name = account.plan.payment.updatedBy.event.name || 'unknown';
  account.plan.payment.updatedBy.date = account.plan.payment.updatedBy.date || {};
  account.plan.payment.updatedBy.date.timestamp = account.plan.payment.updatedBy.date.timestamp || timestampOld;
  account.plan.payment.updatedBy.date.timestampUNIX = account.plan.payment.updatedBy.date.timestampUNIX || timestampUNIXOld;

  // Set some variables
  // In a try/catch because this lib is used in node sometimes
  try {
    currentURL = new URL(window.location.href);
    isDevelopment = self.utilities.get(self.Manager, 'properties.meta.environment', '') === 'development';

    if (isDevelopment) {
      currentURL.searchParams
      .forEach(function(value, key) {
        var accountValue = self.utilities.get(account, key, undefined)
        if (typeof accountValue !== 'undefined') {
          if (value === 'true') { value = true }
          if (value === 'false') { value = false }

          self.utilities.set(account, key, value)
        }
      });
    }
  } catch (e) {
    if (typeof window !== 'undefined') {
      console.error('Unable to check query strings', e);
    }
  }

  var now = new Date();
  var planExpireDate = new Date(account.plan.expires.timestamp);
  var daysTillExpire = Math.floor((planExpireDate - now) / 86400000);
  var difference = (planExpireDate.getTime() - now.getTime()) / (24 * 3600 * 1000);
  var trialExpireDate = new Date(account.plan.trial.expires.timestamp);
  var daysTillTrialExpire = Math.floor((trialExpireDate - now) / 86400000);
  var startDate = new Date(account.plan.payment.startDate.timestamp);
  var planIsActive = difference > -1 && account.plan.id !== defaultPlanId;
  var planIsSuspended = account.plan.status === 'suspended';

  if (planIsActive) {
    account.plan.id = account.plan.id;
  } else {
    account.plan.id = defaultPlanId;
  }

  // Resolve oAuth2
  account.oauth2 = account.oauth2 || {};
  // account.oauth2.google = account.oauth2.google || {};
  // account.oauth2.discord = account.oauth2.discord || {};

  // Resolve roles
  account.roles = account.roles || {};
  // account.roles.betaTester = account.plan.id === defaultPlanId ? false : account.roles.betaTester === true || account.roles.betaTester === 'true';
  account.roles.betaTester = account.roles.betaTester === true || account.roles.betaTester === 'true';
  account.roles.developer = account.roles.developer === true || account.roles.developer === 'true';
  account.roles.admin = account.roles.admin === true || account.roles.admin === 'true';
  account.roles.vip = account.roles.vip === true || account.roles.vip === 'true';
  account.roles.og = account.roles.og === true || account.roles.og === 'true';
  account.roles.promoExempt = account.roles.promoExempt === true || account.roles.promoExempt === 'true';

  // Resolve affiliate
  account.affiliate = account.affiliate || {};
  account.affiliate.code = account.affiliate.code || 'unknown';
  account.affiliate.referrals = account.affiliate.referrals || [];
  account.affiliate.referrer = account.affiliate.referrer || 'unknown';

  // Resolve activity
  account.activity = account.activity || {};
  account.activity.lastActivity = account.activity.lastActivity || {};
  account.activity.lastActivity.timestamp = account.activity.lastActivity.timestamp || timestampOld;
  account.activity.lastActivity.timestampUNIX = account.activity.lastActivity.timestampUNIX || timestampUNIXOld;

  account.activity.created = account.activity.created || {};
  account.activity.created.timestamp = account.activity.created.timestamp || timestampOld;
  account.activity.created.timestampUNIX = account.activity.created.timestampUNIX || timestampUNIXOld;

  account.activity.geolocation = account.activity.geolocation || {};
  account.activity.geolocation.ip = account.activity.geolocation.ip || 'unknown';
  account.activity.geolocation.continent = account.activity.geolocation.continent || 'unknown';
  account.activity.geolocation.country = account.activity.geolocation.country || 'unknown';
  account.activity.geolocation.region = account.activity.geolocation.region || 'unknown';
  account.activity.geolocation.city = account.activity.geolocation.city || 'unknown';
  account.activity.geolocation.latitude = account.activity.geolocation.latitude || 0;
  account.activity.geolocation.longitude = account.activity.geolocation.longitude || 0;

  account.activity.client = account.activity.client || {};
  account.activity.client.userAgent = account.activity.client.userAgent || 'unknown';
  account.activity.client.language = account.activity.client.language || 'unknown';
  account.activity.client.platform = account.activity.client.platform || 'unknown';
  account.activity.client.mobile = account.activity.client.mobile || null;

  // Api
  account.api = account.api || {};
  account.api.clientId = account.api.clientId || 'unknown';
  account.api.privateKey = account.api.privateKey || 'unknown';

  // Usage
  account.usage = account.usage || {};

  account.usage.requests = account.usage.requests || {};
  account.usage.requests.total = account.usage.requests.total || 0;
  account.usage.requests.period = account.usage.requests.period || 0;

  account.usage.requests.last = account.usage.requests.last || {};
  account.usage.requests.last.id = account.usage.requests.last.id || '';
  account.usage.requests.last.timestamp = account.usage.requests.last.timestamp || timestampOld;
  account.usage.requests.last.timestampUNIX = account.usage.requests.last.timestampUNIX || timestampUNIXOld;

  // Personal
  account.personal = account.personal || {};

  account.personal.birthday = account.personal.birthday || {};
  account.personal.birthday.timestamp = account.personal.birthday.timestamp || timestampOld;
  account.personal.birthday.timestampUNIX = account.personal.birthday.timestampUNIX || timestampUNIXOld;

  account.personal.gender = account.personal.gender || '';

  account.personal.location = account.personal.location || {};
  account.personal.location.city = account.personal.location.city || '';
  account.personal.location.country = account.personal.location.country || '';

  account.personal.name = account.personal.name || {};
  account.personal.name.first = account.personal.name.first || '';
  account.personal.name.last = account.personal.name.last || '';

  account.personal.telephone = account.personal.telephone || {};
  account.personal.telephone.countryCode = account.personal.telephone.countryCode || 0;
  account.personal.telephone.national = account.personal.telephone.national || 0;

  // Set UI elements
  // In a try/catch because this lib is used in node sometimes
  try {
    var cancelURL = isDevelopment ? 'http://localhost:4001/cancel' : 'https://itwcreativeworks.com/portal/account/payment/manage';

    var billingSubscribeBtn = self.dom.select('.auth-billing-subscribe-btn');
    var billingUpdateBtn = self.dom.select('.auth-billing-update-btn');
    var billingPlanId = self.dom.select('.auth-billing-plan-id-element');
    var billingFrequencyEl = self.dom.select('.auth-billing-frequency-element');
    var billingStartDateEl = self.dom.select('.auth-billing-start-date-element');
    var billingExpirationDateEl = self.dom.select('.auth-billing-expiration-date-element');
    var billingSuspendedMessageEl = self.dom.select('.auth-billing-suspended-message-element');
    var billingTrialExpirationDateEl = self.dom.select('.auth-billing-trial-expiration-date-element');

    var $referralCount = self.dom.select('.auth-referral-count-element');
    var $referralCode = self.dom.select('.auth-referral-code-element');
    var $referralLink = self.dom.select('.auth-referral-link-element');
    var $referralSocialLink = self.dom.select('a.auth-referral-social-link[data-provider]');

    var authCreatedEl = self.dom.select('.auth-created-element');
    var authPhoneInput = self.dom.select('.auth-phone-input');

    var updateURL = new URL(cancelURL);
    var referralURL = new URL(window.location.origin || window.location.host);

    function _setAuthItem(selector, value) {
      self.dom.select(selector).each(function(e, i) {
        if (e.tagName === 'INPUT') {
          self.dom.select(e).setValue(value);
        } else {
          self.dom.select(e).setInnerHTML(value);
        }
      });
    }

    referralURL.pathname = '/';
    referralURL.searchParams.set('aff', account.affiliate.code)

    authCreatedEl.setInnerHTML(
      new Date(+self.utilities.get(firebaseUser, 'metadata.createdAt', '0'))
      .toLocaleString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    )
    authPhoneInput.setInnerHTML(firebaseUser.phoneNumber).setValue(firebaseUser.phoneNumber)

    updateURL.searchParams.set('orderId', account.plan.payment.orderId);
    updateURL.searchParams.set('resourceId', account.plan.payment.resourceId);

    billingUpdateBtn.setAttribute('hidden', true).setAttribute('href', updateURL.toString());
    billingSubscribeBtn.setAttribute('hidden', true);
    billingSuspendedMessageEl.setAttribute('hidden');
    billingTrialExpirationDateEl.setAttribute('hidden');

    // Update active UI
    if (planIsActive) {
      billingUpdateBtn.removeAttribute('hidden');
    } else {
      billingSubscribeBtn.removeAttribute('hidden');
    }

    // Update suspended UI
    if (planIsSuspended) {
      billingUpdateBtn.removeAttribute('hidden');
      billingSubscribeBtn.setAttribute('hidden', true);

      billingSuspendedMessageEl.removeAttribute('hidden');
    }

    // Update trial UI
    if (
      account.plan.trial.activated
      && daysTillTrialExpire > 0
    ) {
      billingTrialExpirationDateEl
      .removeAttribute('hidden')
      .setInnerHTML('<i class="fas fa-gift mr-1"></i> Your free trial expires in ' + daysTillTrialExpire + ' days');
    }

    // Update billing UI
    billingPlanId.setInnerHTML(splitDashesAndUppercase(account.plan.id));
    billingFrequencyEl.setInnerHTML(account.plan.id !== defaultPlanId ? ' (billed ' + uppercase(account.plan.payment.frequency) + ')' : '');
    billingStartDateEl.setInnerHTML(account.plan.id !== defaultPlanId ? ' - Purchased ' + getMonth(startDate) + ' ' + startDate.getDate() + ', ' + startDate.getFullYear() : '');
    billingExpirationDateEl.setInnerHTML(account.plan.id !== defaultPlanId && daysTillExpire < 366
      ? '<i class="fas fa-exclamation-triangle mr-1"></i> Expires in ' + daysTillExpire + ' days '
      : '');

    // Update payment method UI
    if (account.plan.status === 'suspended') {
      self.dom.select('.master-alert-suspended').removeAttribute('hidden');
    }

    // Update API UI
    _setAuthItem('.auth-apikey-element', self.utilities.get(account, 'api.privateKey', 'n/a'));

    // Update referral UI
    $referralCount.setInnerHTML(account.affiliate.referrals.length);
    $referralCode.setInnerHTML(account.affiliate.code).setValue(account.affiliate.code);
    $referralCode.setInnerHTML(referralURL.toString()).setValue(referralURL.toString());

    var affiliateLinkURI = encodeURIComponent(referralURL.toString());
    var affiliateLinkTextURI = encodeURIComponent('Sign up for ' + self.utilities.get(self.Manager, 'properties.global.brand.name', 'this') + ', a useful service:');

    // Update social links
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
