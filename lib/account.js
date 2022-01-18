/*
*/
var dom;
var utilities;

function Account() {
  var self = this;
  self.properties = {};

  dom = self.Manager.dom();
  utilities = self.Manager.utilities();

  self.accountPageInitialized = false;

  if (new URL(window.location.href).pathname.includes('account')) {
    self.initializeAccountPage();
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

Account.prototype._resolveAccount = function (currentUser, account, options) {
  var self = this;
  account = account || {};
  options = options || {};

  var defaultPlanId = options.defaultPlanId || 'basic';

  // Resolve plan
  account.plan = account.plan || {};
  account.plan.id = account.plan.id || defaultPlanId;
  account.plan.expires = account.plan.expires || {};
  account.plan.expires.timestamp = new Date(account.plan.expires.timestamp || 0).toISOString();
  account.plan.expires.timestampUNIX = Math.round(new Date(account.plan.expires.timestamp || 0).getTime() / 1000);
  account.plan.devices = account.plan.devices || 1;

  account.plan.payment = account.plan.payment || {};
  account.plan.payment.startDate = account.plan.payment.startDate || {};
  account.plan.payment.startDate.timestamp = account.plan.payment.startDate.timestamp || '1999-01-01T00:00:00Z';
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
  account.plan.payment.updatedBy.date.timestamp = account.plan.payment.updatedBy.date.timestamp || '1999-01-01T00:00:00Z';
  account.plan.payment.updatedBy.date.timestampUNIX = account.plan.payment.updatedBy.date.timestampUNIX || 0;


  var planExpireDate = new Date(account.plan.expires.timestamp);
  var now = new Date();
  var daysTillExpire = Math.floor((planExpireDate - now) / 86400000);
  let difference = (planExpireDate.getTime() - now.getTime())/(24*3600*1000);
  var startDate = new Date(account.plan.payment.startDate.timestamp);
  var planIsActive = difference > -1 && account.plan.id !== defaultPlanId;

  if (planIsActive) {
    account.plan.id = account.plan.id;
  } else {
    account.plan.id = defaultPlanId;
  }

  // Resolve oAuth2
  account.oauth2 = account.oauth2 || {};
  account.oauth2.discord = account.oauth2.discord || {};
  account.oauth2.discord.user = account.oauth2.discord.user || {};

  // Resolve roles
  account.roles = account.roles || {};
  account.roles.betaTester = account.plan.id === defaultPlanId ? false : account.roles.betaTester === true || account.roles.betaTester === 'true';
  account.roles.developer = account.roles.developer === true || account.roles.developer === 'true';
  account.roles.admin = account.roles.admin === true || account.roles.admin === 'true';
  account.roles.vip = account.roles.vip === true || account.roles.vip === 'true';
  account.roles.promoExempt = account.roles.promoExempt === true || account.roles.promoExempt === 'true';

  // Set UI elements
  try {
    var isDevelopment = utilities.get(self.Manager, 'properties.meta.environment', '') === 'development';
    // var apiLinkURL = isDevelopment ? 'http://localhost:5000/discord-link' : 'https://api.{{ site.brand.name }}.com/discord-link';
    // var apiUnlinkURL = isDevelopment ? 'http://localhost:5000/discord-unlink' : 'https://api.{{ site.brand.name }}.com/discord-unlink';
    var cancelURL = isDevelopment ? 'http://localhost:4001/cancel/' : 'https://itwcreativeworks.com/portal/account/manage/';

    var billingSubscribeBtn = dom.select('.auth-billing-subscribe-btn');
    var billingUpdateBtn = dom.select('.auth-billing-update-btn');
    var billingPlanId = dom.select('.auth-billing-plan-id-element');
    var billingFrequencyEl = dom.select('.auth-billing-frequency-element');
    var billingStartDateEl = dom.select('.auth-billing-start-date-element');
    var billingExpirationDateEl = dom.select('.auth-billing-expiration-date-element');
    var updateURL = new URL(cancelURL);
    var currentURL = new URL(window.location.href);

    billingSubscribeBtn.setAttribute('hidden', true);
    billingUpdateBtn.setAttribute('hidden', true);

    if (planIsActive) {
      updateURL.searchParams.set('appName', utilities.get(self.Manager, 'properties.global.brand.name', 'Unknown'));
      updateURL.searchParams.set('supportUrl', currentURL.origin + '/support');
      updateURL.searchParams.set('supportEmail', utilities.get(self.Manager, 'properties.contact.emailSupport', 'unknown@email.com'));
      updateURL.searchParams.set('userEmail', currentUser.email);
      updateURL.searchParams.set('userId', currentUser.uid);
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

    _setAuthItem('.auth-apikey-element', utilities.get(account, 'api.privateKey', 'n/a'))
  } catch (e) {
    console.error('Unable to set DOM elements', e);
  }
  self.properties = account;

  return self.properties;
}

module.exports = Account;
