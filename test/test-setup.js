// Test setup for ES modules
// Since the source is ES modules, we need to handle the import differently

// Mock browser globals for Node.js testing
global.window = {
  location: {
    href: 'http://localhost:3000/test'
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
  serviceWorker: undefined // Service workers not supported in Node
};

global.document = {
  createElement: (tag) => {
    const element = {
      tag,
      setAttribute: () => {},
      appendChild: (child) => {
        if (child.nodeValue) {
          // Properly escape HTML entities when appending text nodes
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
      style: {}
    };
    return element;
  },
  createTextNode: (text) => ({ nodeValue: text }),
  body: {
    appendChild: () => {},
    removeChild: () => {}
  },
  execCommand: () => true
};

global.URL = URL;

// Firebase Messaging checks for self
global.self = global.window;