/*
*/
const utilities = require('./utilities.js');

function Storage(storageObj) {
  this.storage = storageObj;
}

Storage.get = function(path, def, options) {
  return (typeof Storage !== 'undefined') ? utilities.get(JSON.parse(window.localStorage.getItem('managerRoot')) || {}, path, def) : def;
}

Storage.set = function(path, value, options) {
  if (typeof Storage !== 'undefined') {
    var existing = (Storage.get('', {}));
    utilities.set(existing, path, value);
    window.localStorage.setItem('managerRoot', JSON.stringify(existing));
    return existing;
  }
}

Storage.clear = function(options) {
  if (typeof Storage !== 'undefined') {
    window.localStorage.clear();
  }
}

module.exports = Storage;
