/*
*/
var utilities = require('./utilities.js');
var support;
var pseudoStorage = {};

function Storage(storageObj) {
  this.storage = storageObj;
}

Storage.get = function(path, def, options) {
  path = path || '';

  try {
    return utilities.get(JSON.parse(window.localStorage.getItem('_manager')) || {}, path, def);
  } catch (e) {
    return utilities.get(pseudoStorage, path, def)
  }
}

Storage.set = function(path, value, options) {
  var existing;

  try {
    existing = Storage.get('', {});
    utilities.set(existing, path, value);
    window.localStorage.setItem('_manager', JSON.stringify(existing));
  } catch (e) {
    utilities.set(pseudoStorage, path, value)
  }

  return existing;
}

Storage.clear = function(options) {
  try {
    window.localStorage.setItem('_manager', '{}');
  } catch (e) {
    pseudoStorage = {};
  }
}

module.exports = Storage;
