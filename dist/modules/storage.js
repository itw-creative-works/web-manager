import { get as _get, set as _set } from 'lodash';

class Storage {
  constructor() {
    this.storageKey = '_manager';
    this.pseudoStorage = {};
  }

  get(path, defaultValue) {
    let usableStorage;

    // Try to parse the localStorage object
    try {
      usableStorage = JSON.parse(window.localStorage.getItem(this.storageKey) || '{}');
    } catch (e) {
      usableStorage = this.pseudoStorage;
    }

    // If there's no path, return the entire storage object
    if (!path) {
      return usableStorage || defaultValue;
    }

    // Return the value at the path
    return _get(usableStorage, path, defaultValue);
  }

  set(path, value) {
    let usableStorage;

    // Try to get the current storage
    try {
      usableStorage = this.get();
    } catch (e) {
      usableStorage = this.pseudoStorage;
    }

    // If there's no path, replace the entire storage object
    if (!path) {
      usableStorage = value || {};
    } else {
      // Set the value at the path
      _set(usableStorage, path, value);
    }

    // Try to set the localStorage object
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(usableStorage));
    } catch (e) {
      this.pseudoStorage = usableStorage;
    }

    return usableStorage;
  }

  remove(path) {
    if (!path) {
      this.clear();
    } else {
      this.set(path, undefined);
    }
  }

  clear() {
    try {
      window.localStorage.setItem(this.storageKey, '{}');
    } catch (e) {
      this.pseudoStorage = {};
    }
  }

  // Session storage methods
  session = {
    get: (path, defaultValue) => {
      let usableStorage;

      try {
        usableStorage = JSON.parse(window.sessionStorage.getItem(this.storageKey) || '{}');
      } catch (e) {
        return defaultValue;
      }

      if (!path) {
        return usableStorage || defaultValue;
      }

      return _get(usableStorage, path, defaultValue);
    },

    set: (path, value) => {
      let usableStorage;

      try {
        usableStorage = this.session.get();
      } catch (e) {
        usableStorage = {};
      }

      if (!path) {
        usableStorage = value || {};
      } else {
        _set(usableStorage, path, value);
      }

      try {
        window.sessionStorage.setItem(this.storageKey, JSON.stringify(usableStorage));
      } catch (e) {
        // Silent fail
      }

      return usableStorage;
    },

    remove: (path) => {
      if (!path) {
        this.session.clear();
      } else {
        this.session.set(path, undefined);
      }
    },

    clear: () => {
      try {
        window.sessionStorage.setItem(this.storageKey, '{}');
      } catch (e) {
        // Silent fail
      }
    }
  };
}

export default Storage;
