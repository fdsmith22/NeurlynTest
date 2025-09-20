/**
 * Storage Service - Unified abstraction for localStorage and sessionStorage
 * Provides data validation, versioning, and fallback support
 */

class StorageService {
  constructor() {
    this.version = '1.0.0';
    this.prefix = 'neurlyn_';
    this.memoryStorage = new Map(); // Fallback for private browsing
    this.isStorageAvailable = this.checkStorageAvailability();
  }

  /**
   * Check if localStorage is available
   */
  checkStorageAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get item from storage with fallback
   */
  getItem(key, parseJSON = true) {
    const prefixedKey = this.prefix + key;

    try {
      let value;

      if (this.isStorageAvailable) {
        value = localStorage.getItem(prefixedKey);
      } else {
        value = this.memoryStorage.get(prefixedKey);
      }

      if (value === null || value === undefined) {
        return null;
      }

      if (parseJSON) {
        const parsed = JSON.parse(value);
        // Version check
        if (parsed._version && parsed._version !== this.version) {
          this.migrate(key, parsed);
        }
        return parsed.data || parsed;
      }

      return value;
    } catch (error) {
      this.handleError('getItem', error);
      return null;
    }
  }

  /**
   * Set item in storage with fallback
   */
  setItem(key, value, stringify = true) {
    const prefixedKey = this.prefix + key;
    const dataToStore = stringify
      ? JSON.stringify({
          data: value,
          _version: this.version,
          _timestamp: Date.now()
        })
      : value;

    try {
      if (this.isStorageAvailable) {
        localStorage.setItem(prefixedKey, dataToStore);
      } else {
        this.memoryStorage.set(prefixedKey, dataToStore);
      }

      return true;
    } catch (error) {
      // Handle quota exceeded
      if (error.name === 'QuotaExceededError') {
        this.cleanup();
        // Retry once after cleanup
        try {
          if (this.isStorageAvailable) {
            localStorage.setItem(prefixedKey, dataToStore);
          }
          return true;
        } catch (retryError) {
          this.handleError('setItem', retryError);
        }
      } else {
        this.handleError('setItem', error);
      }
      return false;
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key) {
    const prefixedKey = this.prefix + key;

    try {
      if (this.isStorageAvailable) {
        localStorage.removeItem(prefixedKey);
      } else {
        this.memoryStorage.delete(prefixedKey);
      }
      return true;
    } catch (error) {
      this.handleError('removeItem', error);
      return false;
    }
  }

  /**
   * Clear all Neurlyn storage items
   */
  clear() {
    try {
      if (this.isStorageAvailable) {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(this.prefix)) {
            localStorage.removeItem(key);
          }
        });
      } else {
        // Clear only prefixed keys from memory storage
        const keysToDelete = [];
        this.memoryStorage.forEach((_, key) => {
          if (key.startsWith(this.prefix)) {
            keysToDelete.push(key);
          }
        });
        keysToDelete.forEach(key => this.memoryStorage.delete(key));
      }
      return true;
    } catch (error) {
      this.handleError('clear', error);
      return false;
    }
  }

  /**
   * Get storage size
   */
  getStorageSize() {
    let size = 0;

    try {
      if (this.isStorageAvailable) {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(this.prefix)) {
            const item = localStorage.getItem(key);
            size += item ? item.length : 0;
          }
        });
      } else {
        this.memoryStorage.forEach((value, key) => {
          if (key.startsWith(this.prefix)) {
            size += value ? value.length : 0;
          }
        });
      }
    } catch (error) {
      this.handleError('getStorageSize', error);
    }

    return size;
  }

  /**
   * Cleanup old data based on timestamp
   */
  cleanup(maxAgeInDays = 30) {
    const maxAge = maxAgeInDays * 24 * 60 * 60 * 1000;
    const now = Date.now();
    let cleaned = 0;

    try {
      if (this.isStorageAvailable) {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(this.prefix)) {
            try {
              const item = localStorage.getItem(key);
              const parsed = JSON.parse(item);
              if (parsed._timestamp && now - parsed._timestamp > maxAge) {
                localStorage.removeItem(key);
                cleaned++;
              }
            } catch (e) {
              // Skip invalid items
            }
          }
        });
      } else {
        const keysToDelete = [];
        this.memoryStorage.forEach((value, key) => {
          if (key.startsWith(this.prefix)) {
            try {
              const parsed = JSON.parse(value);
              if (parsed._timestamp && now - parsed._timestamp > maxAge) {
                keysToDelete.push(key);
                cleaned++;
              }
            } catch (e) {
              // Skip invalid items
            }
          }
        });
        keysToDelete.forEach(key => this.memoryStorage.delete(key));
      }
    } catch (error) {
      this.handleError('cleanup', error);
    }

    return cleaned;
  }

  /**
   * Session storage operations
   */
  session = {
    getItem: key => {
      const prefixedKey = this.prefix + key;
      try {
        return sessionStorage.getItem(prefixedKey);
      } catch (e) {
        return this.memoryStorage.get('session_' + prefixedKey);
      }
    },

    setItem: (key, value) => {
      const prefixedKey = this.prefix + key;
      try {
        sessionStorage.setItem(prefixedKey, value);
      } catch (e) {
        this.memoryStorage.set('session_' + prefixedKey, value);
      }
    },

    removeItem: key => {
      const prefixedKey = this.prefix + key;
      try {
        sessionStorage.removeItem(prefixedKey);
      } catch (e) {
        this.memoryStorage.delete('session_' + prefixedKey);
      }
    }
  };

  /**
   * Data migration for version updates
   */
  migrate(key, data) {
    // Implement migration logic based on version differences
    // For now, just return the data as-is
    return data;
  }

  /**
   * Error handler
   */
  handleError(operation, error) {
    // In production, send to error tracking service
    if (window.performanceUtils && window.performanceUtils.showNotification) {
      window.performanceUtils.showNotification(`Storage operation failed: ${operation}`, 'error');
    }
  }

  /**
   * Storage quota information
   */
  async getQuotaInfo() {
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          usage: estimate.usage,
          quota: estimate.quota,
          percentUsed: (estimate.usage / estimate.quota) * 100
        };
      } catch (error) {
        this.handleError('getQuotaInfo', error);
        return null;
      }
    }
    return null;
  }
}

// Export singleton instance
window.storageService = new StorageService();

// Also export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageService;
}
