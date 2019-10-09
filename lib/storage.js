/*
*/
var utilities = require('./utilities.js');
var support;

function Storage(storageObj) {
  this.storage = storageObj;
}

Storage.get = function(path, def, options) {
  var result;
  path = path || '';
  // def = def || undefined;
  try {
    // result = (typeof Storage !== 'undefined') ? utilities.get(JSON.parse(window.localStorage.getItem('managerRoot')) || {}, path, def) : def;
    result = utilities.get(JSON.parse(window.localStorage.getItem('_manager')) || {}, path, def);
  } catch (e) {
    result = def;
  }
  return result;
}

Storage.set = function(path, value, options) {
  // if (typeof Storage !== 'undefined') { return };
  var existing;
  try {
    existing = Storage.get('', {});
    utilities.set(existing, path, value);
    window.localStorage.setItem('_manager', JSON.stringify(existing));
  } catch (e) {

  }
  return existing;
}

Storage.clear = function(options) {
  // options = options || {};
  // options.type = options.type || 'manager';
  // if (typeof Storage !== 'undefined') { return };
  // if (options.type == 'manager') {
  try {
    window.localStorage.setItem('_manager', '{}');
  } catch (e) {

  }
  // } else {
  //   window.localStorage.clear();
  // }
}

module.exports = Storage;
