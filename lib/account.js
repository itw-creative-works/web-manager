/*
*/

function Account() {
  var self = this;
  self.properties = {};
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

Account.prototype.resolve = function (account, options) {
  options = options || {};
  return new Promise(function(resolve, reject) {
    if (!account || typeof account === 'string') {
      return reject(new Error('Malformed <account> input'))
    }
    var defaultPlanId = options.defaultPlanId || 'basic';

    // Resolve plan
    account.plan = account.plan || {};
    account.plan.id = account.plan.id || defaultPlanId;
    account.plan.expires = account.plan.expires || {};
    account.plan.expires.timestamp = new Date(account.plan.expires.timestamp || 0).toISOString();
    account.plan.expires.timestampUNIX = Math.round(new Date(account.plan.expires.timestamp || 0).getTime() / 1000);
    account.plan.devices = account.plan.devices || 1;

    let difference = (new Date(account.plan.expires.timestamp).getTime() - new Date().getTime())/(24*3600*1000);
    if (difference > -1 && account.plan.id === 'premium') {
      account.plan.id = 'premium';
    } else {
      account.plan.id = 'basic';
    }

    // Resolve roles
    account.roles = account.roles || {};
    account.roles.betaTester = account.plan.id === defaultPlanId ? false : account.roles.betaTester === true || account.roles.betaTester === 'true';
    account.roles.developer = account.roles.developer === true || account.roles.developer === 'true';
    account.roles.admin = account.roles.admin === true || account.roles.admin === 'true';
    account.roles.vip = account.roles.vip === true || account.roles.vip === 'true';
    account.roles.promoExempt = account.roles.promoExempt === true || account.roles.promoExempt === 'true';

    self.properties = account;
    return resolve(self.properties);
  });
}

module.exports = Account;
