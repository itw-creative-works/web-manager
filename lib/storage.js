/*
*/
var utilities = require('./utilities.js');
var pseudoStorage = {};

function Storage(storageObj) {
  this.storage = storageObj;
}

Storage.get = function (path, def) {
  // Setup the usable storage object
  var usableStorage;

  // Setup the path and default value
  path = path || '';
  // def = typeof def === 'undefined' ? {} : def;
  // Important that defaults to undefined
  // Because if default is empty obj, then a path to an undefined value like 'a.b.c' (assuming c is undefined) will return empty obj instead of undefined
  def = typeof def === 'undefined' ? undefined : def;

  // Try to parse the localStorage object
  try {
    usableStorage = JSON.parse(window.localStorage.getItem('_manager') || '{}');
  } catch (e) {
    usableStorage = pseudoStorage;
  }

  // If there's no path, return the entire storage object
  if (!path) {
    return usableStorage || def;
  }

  // Return the value at the path
  return utilities.get(usableStorage, path, def);
}

Storage.set = function (path, value) {
  // Setup the usable storage object
  var usableStorage;

  // Setup the path and default value
  path = path || '';
  value = typeof value === 'undefined' ? undefined : value;

  // Try to parse the localStorage object
  try {
    usableStorage = Storage.get();
  } catch (e) {
    usableStorage = pseudoStorage;
  }

  // If there's no path, return the entire storage object
  if (!path) {
    usableStorage = value || {};
  } else {
    // Set the value at the path
    utilities.set(usableStorage, path, value);
  }

  // Try to set the localStorage object
  try {
    window.localStorage.setItem('_manager', JSON.stringify(usableStorage));
  } catch (e) {
    pseudoStorage = usableStorage;
  }

  return usableStorage;
}

Storage.clear = function () {
  try {
    window.localStorage.setItem('_manager', '{}');
  } catch (e) {
    pseudoStorage = {};
  }
}

module.exports = Storage;
