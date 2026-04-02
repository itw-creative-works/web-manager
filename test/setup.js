// Mock browser globals for Node.js testing

global.window = {
  location: {
    href: 'http://localhost:3000/test',
    search: '',
    origin: 'http://localhost:3000',
  },
  screen: {
    width: 1920,
    height: 1080
  },
  innerWidth: 1024,
  innerHeight: 768,
  devicePixelRatio: 1,
  matchMedia: () => ({ matches: false }),
  addEventListener: () => {},
  removeEventListener: () => {},
  localStorage: {
    _data: {},
    getItem(key) { return this._data[key] || null; },
    setItem(key, value) { this._data[key] = value; },
    removeItem(key) { delete this._data[key]; },
    clear() { this._data = {}; }
  },
  sessionStorage: {
    _data: {},
    getItem(key) { return this._data[key] || null; },
    setItem(key, value) { this._data[key] = value; },
    removeItem(key) { delete this._data[key]; },
    clear() { this._data = {}; }
  }
};

// Expose globals that some modules reference directly (not via window.*)
global.localStorage = global.window.localStorage;
global.sessionStorage = global.window.sessionStorage;

global.navigator = {
  userAgent: 'Mozilla/5.0 (Testing) Node.js',
  language: 'en-US',
  platform: 'Node.js',
  vendor: 'Test',
  clipboard: {
    writeText: async (text) => text
  },
  userAgentData: {
    mobile: false
  },
  serviceWorker: undefined
};

global.document = {
  readyState: 'complete',
  createElement: (tag) => {
    const element = {
      tag,
      className: '',
      textContent: '',
      type: '',
      setAttribute: () => {},
      getAttribute: () => null,
      remove: () => {},
      appendChild: (child) => {
        if (child.nodeValue) {
          element.innerHTML = child.nodeValue
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        }
      },
      innerHTML: '',
      value: '',
      select: () => {},
      style: {
        cssText: '',
        setProperty: () => {},
        removeProperty: () => {},
      },
    };
    return element;
  },
  createTextNode: (text) => ({ nodeValue: text }),
  documentElement: {
    dataset: {},
    setAttribute: () => {},
    appendChild: () => {},
  },
  head: {
    appendChild: () => {},
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  querySelectorAll: () => [],
  querySelector: () => null,
  body: {
    appendChild: () => {},
    removeChild: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  },
  execCommand: () => true
};

global.URL = URL;
global.URLSearchParams = URLSearchParams;

// Firebase Messaging checks for self
global.self = global.window;
