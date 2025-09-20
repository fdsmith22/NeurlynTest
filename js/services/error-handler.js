/**
 * Global Error Handler for Neurlyn
 * Provides comprehensive error handling, retry logic, and user-friendly messages
 */

class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.setupGlobalHandlers();
  }

  /**
   * Setup global error handlers
   */
  setupGlobalHandlers() {
    // Handle uncaught errors
    window.addEventListener('error', event => {
      this.handleError({
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error,
        type: 'uncaught'
      });
      event.preventDefault();
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      this.handleError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        error: event.reason,
        type: 'unhandled_promise'
      });
      event.preventDefault();
    });
  }

  /**
   * Main error handler
   */
  handleError(errorInfo) {
    // Log error silently for debugging only
    this.logError(errorInfo);

    // Don't show any notifications to user - handle errors silently
    // Errors are logged for debugging but don't interrupt user experience
  }

  /**
   * Categorize error type
   */
  categorizeError(errorInfo) {
    const message = errorInfo.message?.toLowerCase() || '';
    const error = errorInfo.error;

    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    if (message.includes('permission') || message.includes('denied')) {
      return 'permission';
    }
    if (message.includes('quota') || message.includes('storage')) {
      return 'storage';
    }
    if (error instanceof TypeError) {
      return 'type';
    }
    if (error instanceof ReferenceError) {
      return 'reference';
    }
    if (message.includes('timeout')) {
      return 'timeout';
    }

    return 'general';
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(category, errorInfo) {
    const messages = {
      network: 'Connection issue detected. Please check your internet connection.',
      permission: 'Permission denied. Please check your browser settings.',
      storage: 'Storage limit reached. Please clear some data and try again.',
      timeout: 'Request timed out. Please try again.',
      type: 'An unexpected error occurred. Please refresh the page.',
      reference: 'Something went wrong. Please refresh the page.',
      general: 'An error occurred. Our team has been notified.'
    };

    return messages[category] || messages.general;
  }

  /**
   * Show error notification
   */
  showErrorNotification(message, category) {
    // Use existing notification system if available
    if (window.performanceUtils?.showNotification) {
      const type = category === 'network' ? 'warning' : 'error';
      window.performanceUtils.showNotification(message, type);
    } else {
      // Fallback to simple alert
      this.createErrorToast(message);
    }
  }

  /**
   * Create error toast notification
   */
  createErrorToast(message) {
    const existingToast = document.getElementById('error-toast');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.id = 'error-toast';
    toast.className = 'error-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      max-width: 300px;
      animation: slideIn 0.3s ease;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  /**
   * Log error for debugging
   */
  logError(errorInfo) {
    const logEntry = {
      ...errorInfo,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.errorLog.push(logEntry);

    // Keep only last 50 errors in memory
    if (this.errorLog.length > 50) {
      this.errorLog.shift();
    }

    // Store in localStorage for debugging
    if (window.storageService) {
      window.storageService.setItem('error_log', this.errorLog);
    }
  }

  /**
   * Determine if error should be reported
   */
  shouldReportError(errorInfo) {
    // Never report errors - disable error reporting entirely
    return false;
  }

  /**
   * Report error to monitoring service
   */
  async reportError(errorInfo) {
    // Error reporting disabled - do nothing
    return;
  }

  /**
   * Retry failed operations with exponential backoff
   */
  async retryOperation(operation, options = {}) {
    const maxRetries = options.maxRetries || this.maxRetries;
    const delay = options.delay || this.retryDelay;
    const exponential = options.exponential !== false;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries - 1) {
          throw error;
        }

        const waitTime = exponential ? delay * Math.pow(2, attempt) : delay;
        await this.wait(waitTime);
      }
    }
  }

  /**
   * Wait utility
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Wrap function with error handling
   */
  wrapWithErrorHandling(fn, context = null) {
    return async (...args) => {
      try {
        return await fn.apply(context, args);
      } catch (error) {
        this.handleError({
          message: error.message,
          error: error,
          function: fn.name,
          args: args,
          type: 'wrapped_function'
        });
        throw error;
      }
    };
  }

  /**
   * Get error log for debugging
   */
  getErrorLog() {
    return this.errorLog;
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
    if (window.storageService) {
      window.storageService.removeItem('error_log');
    }
  }

  /**
   * API error handler with retry
   */
  async handleApiError(error, request, options = {}) {
    const status = error.status || error.response?.status;

    // Handle specific status codes
    switch (status) {
      case 401:
        // Unauthorized - redirect to login
        this.showErrorNotification('Session expired. Please log in again.', 'auth');
        break;

      case 403:
        // Forbidden
        this.showErrorNotification('Access denied.', 'permission');
        break;

      case 404:
        // Not found
        this.showErrorNotification('Resource not found.', 'not_found');
        break;

      case 429:
        // Rate limited - retry with backoff
        if (options.retry) {
          await this.wait(5000);
          return this.retryOperation(() => request(), { maxRetries: 2 });
        }
        this.showErrorNotification('Too many requests. Please wait a moment.', 'rate_limit');
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors - retry
        if (options.retry) {
          return this.retryOperation(() => request(), { maxRetries: 3 });
        }
        this.showErrorNotification('Server error. Please try again later.', 'server');
        break;

      default:
        // Generic error
        this.handleError({
          message: error.message,
          error: error,
          type: 'api',
          status: status
        });
    }
  }
}

// Create and export singleton instance
window.errorHandler = new ErrorHandler();

// Also export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorHandler;
}
