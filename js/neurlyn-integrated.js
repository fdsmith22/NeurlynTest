/**
 * Neurlyn Integrated Core Module
 * Central initialization and coordination for the Neurlyn assessment platform
 */

(function () {
  'use strict';

  // Core Neurlyn namespace
  window.Neurlyn = window.Neurlyn || {};

  // Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
// console.log('Service Worker registered');
        })
        .catch(err => {
// console.log('Service Worker registration skipped:', err.message);
        });
    });
  }

  // Load Environment Configuration
  async function loadEnvironmentConfig() {
    try {
      const script = document.createElement('script');
      script.src = '/config/environment.js';
      document.head.appendChild(script);

      return new Promise(resolve => {
        script.onload = () => {
          if (window.EnvironmentConfig) {
            window.envConfig = window.EnvironmentConfig();
// console.log('Environment:', window.envConfig.getEnvironment());
            resolve();
          }
        };
      });
    } catch (error) {
      console.warn('Environment config not loaded:', error);
    }
  }

  // Initialize Core Services
  async function initializeCoreServices() {
    // Storage Service
    if (window.storageService) {
// console.log('Storage service initialized');
    }

    // Error Handler
    if (window.errorHandler) {
// console.log('Error handler initialized');
    }

    // Performance Monitor
    if (window.performanceUtils) {
      window.performanceUtils.initializeMonitoring();
// console.log('Performance monitoring initialized');
    }
  }

  // Assessment State Manager
  class AssessmentStateManager {
    constructor() {
      this.currentState = 'idle';
      this.assessmentType = null;
      this.responses = [];
      this.startTime = null;
    }

    startAssessment(type, options = {}) {
      this.currentState = 'active';
      this.assessmentType = type;
      this.responses = [];
      this.startTime = Date.now();

// console.log(`Assessment started: ${type}`, options);

      // Emit custom event
      window.dispatchEvent(
        new CustomEvent('assessmentStarted', {
          detail: { type, options }
        })
      );
    }

    recordResponse(questionId, answer, metadata = {}) {
      this.responses.push({
        questionId,
        answer,
        timestamp: Date.now(),
        metadata
      });
    }

    completeAssessment() {
      const duration = Date.now() - this.startTime;
      this.currentState = 'completed';

      const results = {
        type: this.assessmentType,
        responses: this.responses,
        duration,
        completedAt: new Date().toISOString()
      };

// console.log('Assessment completed', results);

      // Emit custom event
      window.dispatchEvent(
        new CustomEvent('assessmentCompleted', {
          detail: results
        })
      );

      return results;
    }

    reset() {
      this.currentState = 'idle';
      this.assessmentType = null;
      this.responses = [];
      this.startTime = null;
    }
  }

  // API Integration Helper
  class APIHelper {
    constructor() {
      this.baseUrl = window.envConfig?.getApiUrl() || 'http://localhost:3002';
    }

    async request(endpoint, options = {}) {
      const url = `${this.baseUrl}${endpoint}`;

      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.error('API Request failed:', error);
        throw error;
      }
    }
  }

  // UI State Manager
  class UIStateManager {
    constructor() {
      this.currentScreen = 'landing';
      this.previousScreen = null;
    }

    navigateTo(screen, data = {}) {
      this.previousScreen = this.currentScreen;
      this.currentScreen = screen;

// console.log(`Navigating: ${this.previousScreen} -> ${this.currentScreen}`);

      // Emit navigation event
      window.dispatchEvent(
        new CustomEvent('navigationChange', {
          detail: {
            from: this.previousScreen,
            to: this.currentScreen,
            data
          }
        })
      );
    }

    goBack() {
      if (this.previousScreen) {
        const temp = this.currentScreen;
        this.currentScreen = this.previousScreen;
        this.previousScreen = temp;
      }
    }
  }

  // Initialize on DOM ready
  async function initialize() {
    // Prevent double initialization
    if (window.Neurlyn && window.Neurlyn.initialized) {
// console.log('Neurlyn Core already initialized');
      return;
    }

// console.log('Neurlyn Core Initializing...');

    // Load environment config
    await loadEnvironmentConfig();

    // Initialize core services
    await initializeCoreServices();

    // Create global instances
    window.Neurlyn = {
      ...window.Neurlyn,
      initialized: true,
      assessmentState: new AssessmentStateManager(),
      api: new APIHelper(),
      ui: new UIStateManager(),

      // Public API methods
      startAssessment(type, options) {
        return this.assessmentState.startAssessment(type, options);
      },

      recordResponse(questionId, answer, metadata) {
        return this.assessmentState.recordResponse(questionId, answer, metadata);
      },

      completeAssessment() {
        return this.assessmentState.completeAssessment();
      },

      resetAssessment() {
        return this.assessmentState.reset();
      },

      navigateTo(screen, data) {
        return this.ui.navigateTo(screen, data);
      },

      async fetchAPI(endpoint, options) {
        return this.api.request(endpoint, options);
      }
    };

// console.log('Neurlyn Core Initialized');

    // Emit ready event
    window.dispatchEvent(new Event('neurlynReady'));
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
