// Unit multipliers
const UNITS = {
  milliseconds: 1,
  seconds: 1000,
  minutes: 1000 * 60,
  hours: 1000 * 60 * 60,
  days: 1000 * 60 * 60 * 24,
};

// Storage key
const STORAGE_KEY = 'wm_usage';

// Session timeout (30 minutes of inactivity = new session)
const SESSION_TIMEOUT = 30 * 60 * 1000;

class Usage {
  constructor(manager) {
    this.manager = manager;
    this.data = null;
    this.initialized = false;
    this.isNewVersion = false;
  }

  // Check if we're in a browser extension context
  _isExtension() {
    return this.manager.utilities().getRuntime() === 'browser-extension';
  }

  // Get extension storage API
  _getExtensionStorage() {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      return chrome.storage.local;
    }
    if (typeof browser !== 'undefined' && browser.storage?.local) {
      return browser.storage.local;
    }
    return null;
  }

  // Initialize - loads or creates usage data (async for extensions)
  async initialize() {
    // Skip if already initialized
    if (this.initialized) {
      return this.data;
    }

    // Load existing data based on runtime
    let existing = null;

    if (this._isExtension()) {
      existing = await this._loadFromExtensionStorage();
    } else {
      existing = this._loadFromLocalStorage();
    }

    const now = Date.now();
    const currentVersion = this.manager.config?.version || null;

    if (existing) {
      this.data = existing;

      // Check if this is a new session (last activity was more than SESSION_TIMEOUT ago)
      const timeSinceLastActive = now - (this.data.lastActive || 0);
      if (timeSinceLastActive > SESSION_TIMEOUT) {
        this.data.session.count = (this.data.session?.count || 0) + 1;
        this.data.session.started = now;
      }

      // Update lastActive
      this.data.lastActive = now;

      // Check for version change
      if (currentVersion && this.data.version?.current !== currentVersion) {
        this.data.version = this.data.version || {};
        this.data.version.previous = this.data.version.current;
        this.data.version.current = currentVersion;
        this.isNewVersion = true;
      }

      await this._save();
    } else {
      // First time usage
      this.data = {
        installed: now,
        lastActive: now,
        session: {
          started: now,
          count: 1,
        },
        version: {
          initial: currentVersion,
          current: currentVersion,
          previous: null,
        },
      };
      await this._save();
    }

    this.initialized = true;
    return this.data;
  }

  // Load from extension storage (async)
  async _loadFromExtensionStorage() {
    const storage = this._getExtensionStorage();
    if (!storage) {
      return null;
    }

    try {
      const result = await storage.get(STORAGE_KEY);
      return result[STORAGE_KEY] || null;
    } catch (e) {
      console.warn('[Usage] Failed to load from extension storage:', e);
      return null;
    }
  }

  // Load from localStorage (sync)
  _loadFromLocalStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  // Save data to storage
  async _save() {
    if (this._isExtension()) {
      await this._saveToExtensionStorage();
    } else {
      this._saveToLocalStorage();
    }

    return this.data;
  }

  // Save to extension storage (async)
  async _saveToExtensionStorage() {
    const storage = this._getExtensionStorage();
    if (!storage) {
      return;
    }

    try {
      await storage.set({ [STORAGE_KEY]: this.data });
    } catch (e) {
      console.warn('[Usage] Failed to save to extension storage:', e);
    }
  }

  // Save to localStorage (sync)
  _saveToLocalStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      // localStorage not available
    }
  }

  // Calculate duration from a timestamp in specified units
  _calculateDuration(timestamp, unit) {
    if (!timestamp) {
      return 0;
    }

    // Default to milliseconds
    unit = unit || 'milliseconds';

    // Get multiplier
    const multiplier = UNITS[unit];
    if (!multiplier) {
      throw new Error(`Invalid unit: ${unit}. Valid units: ${Object.keys(UNITS).join(', ')}`);
    }

    return (Date.now() - timestamp) / multiplier;
  }

  // Get total usage duration in specified units (since installed)
  getUsageDuration(unit) {
    return this._calculateDuration(this.data?.installed, unit);
  }

  // Get current session duration in specified units
  getSessionDuration(unit) {
    return this._calculateDuration(this.data?.session?.started, unit);
  }

  // Get installed date
  getInstalledDate() {
    if (!this.data?.installed) {
      return null;
    }

    return new Date(this.data.installed);
  }

  // Get session count
  getSessionCount() {
    return this.data?.session?.count || 0;
  }

  // Reset usage data (for testing or user request)
  async reset() {
    const now = Date.now();
    const currentVersion = this.manager.config?.version || null;

    this.data = {
      installed: now,
      lastActive: now,
      session: {
        started: now,
        count: 1,
      },
      version: {
        initial: currentVersion,
        current: currentVersion,
        previous: null,
      },
    };

    this.isNewVersion = false;
    await this._save();
    return this.data;
  }

  // Get binding-friendly data object for bindings system
  getBindingData() {
    return {
      installed: this.data?.installed || null,
      lastActive: this.data?.lastActive || null,
      session: {
        started: this.data?.session?.started || null,
        count: this.getSessionCount(),
      },
      version: {
        initial: this.data?.version?.initial || null,
        current: this.data?.version?.current || null,
        previous: this.data?.version?.previous || null,
        isNew: this.isNewVersion,
      },
      duration: {
        total: {
          milliseconds: this.getUsageDuration('milliseconds'),
          seconds: this.getUsageDuration('seconds'),
          minutes: this.getUsageDuration('minutes'),
          hours: this.getUsageDuration('hours'),
          days: this.getUsageDuration('days'),
        },
        session: {
          milliseconds: this.getSessionDuration('milliseconds'),
          seconds: this.getSessionDuration('seconds'),
          minutes: this.getSessionDuration('minutes'),
          hours: this.getSessionDuration('hours'),
          days: this.getSessionDuration('days'),
        },
      },
    };
  }
}

export default Usage;
