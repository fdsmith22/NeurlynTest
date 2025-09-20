/**
 * Performance Optimizations for Neurlyn
 * Handles lazy loading, debouncing, and mobile-specific enhancements
 */

(function () {
  'use strict';

  // ========================================
  // 1. Debounce and Throttle Utilities
  // ========================================

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // ========================================
  // 2. Lazy Loading Images
  // ========================================

  function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    );

    images.forEach(img => imageObserver.observe(img));
  }

  // ========================================
  // 3. Touch Gesture Support
  // ========================================

  function initTouchGestures() {
    let touchStartX = 0;
    let touchEndX = 0;
    const threshold = 50;

    const questionCard = document.querySelector('.question-card');
    if (!questionCard) return;

    questionCard.addEventListener(
      'touchstart',
      e => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    questionCard.addEventListener(
      'touchend',
      e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      },
      { passive: true }
    );

    function handleSwipe() {
      const swipeDistance = touchEndX - touchStartX;

      if (Math.abs(swipeDistance) > threshold) {
        if (swipeDistance > 0) {
          // Swipe right - previous question
          const prevButton = document.getElementById('prev-button');
          if (prevButton && !prevButton.disabled) {
            prevButton.click();
          }
        } else {
          // Swipe left - next question
          const nextButton = document.getElementById('next-button');
          if (nextButton && !nextButton.disabled) {
            nextButton.click();
          }
        }
      }
    }
  }

  // ========================================
  // 4. Viewport Height Fix for Mobile
  // ========================================

  function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  // ========================================
  // 5. Network Status Detection
  // ========================================

  function initNetworkDetection() {
    function updateNetworkStatus() {
      if (!navigator.onLine) {
        document.body.classList.add('offline');
        showNotification('You are offline. Some features may be limited.', 'warning');
      } else {
        document.body.classList.remove('offline');
      }
    }

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();
  }

  // ========================================
  // 6. Smooth Scroll with Offset
  // ========================================

  function smoothScrollTo(element, offset = 80) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }

  // ========================================
  // 7. Optimize Animations on Low-End Devices
  // ========================================

  function detectLowEndDevice() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
      return true; // No WebGL support, likely low-end
    }

    // Check device memory (if available)
    if (navigator.deviceMemory && navigator.deviceMemory < 4) {
      return true;
    }

    // Check connection type
    const connection =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === '2g' || effectiveType === 'slow-2g') {
        return true;
      }
    }

    return false;
  }

  function optimizeForLowEnd() {
    if (detectLowEndDevice()) {
      document.body.classList.add('reduce-motion');

      // Disable complex animations
      const style = document.createElement('style');
      style.textContent = `
        .reduce-motion * {
          animation-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // ========================================
  // 8. Prefetch Next Question
  // ========================================

  function prefetchNextQuestion() {
    if (!window.neurlynApp) return;

    const currentIndex = window.neurlynApp.state?.currentQuestionIndex || 0;
    const nextIndex = currentIndex + 1;
    const questions = window.neurlynApp.questions;

    if (questions && questions[nextIndex]) {
      // Preload any assets for the next question
      const nextQuestion = questions[nextIndex];
      if (nextQuestion.imageUrl) {
        const img = new Image();
        img.src = nextQuestion.imageUrl;
      }
    }
  }

  // ========================================
  // 9. Memory Management
  // ========================================

  function cleanupUnusedElements() {
    // Remove hidden screens from DOM to save memory
    const hiddenScreens = document.querySelectorAll('.screen.hidden');
    hiddenScreens.forEach(screen => {
      if (screen.dataset.cached !== 'true') {
        screen.innerHTML = '';
      }
    });
  }

  // ========================================
  // 10. Notification System
  // ========================================

  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#10b981'};
      color: white;
      border-radius: 8px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      max-width: 300px;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // ========================================
  // 11. Initialize Everything
  // ========================================

  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Performance optimizations
    lazyLoadImages();
    initTouchGestures();
    setViewportHeight();
    initNetworkDetection();
    optimizeForLowEnd();

    // Throttled/debounced events
    window.addEventListener('resize', debounce(setViewportHeight, 100));
    window.addEventListener(
      'scroll',
      throttle(() => {
        // Add scroll-based optimizations here
        const scrolled = window.pageYOffset > 100;
        document.body.classList.toggle('scrolled', scrolled);
      }, 100)
    );

    // Question navigation optimizations
    document.addEventListener('questionChanged', () => {
      prefetchNextQuestion();
      cleanupUnusedElements();
    });

    // Add passive listeners for better scrolling performance
    document.addEventListener('touchstart', () => {}, { passive: true });
    document.addEventListener('touchmove', () => {}, { passive: true });

    // Prevent double-tap zoom on buttons
    let lastTouchEnd = 0;
    document.addEventListener(
      'touchend',
      e => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      },
      false
    );

    // iOS specific fixes
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      document.body.classList.add('ios');

      // Fix viewport height on iOS
      const fixViewportHeight = () => {
        document.documentElement.style.height = `${window.innerHeight}px`;
      };

      window.addEventListener('resize', fixViewportHeight);
      window.addEventListener('scroll', fixViewportHeight);
      fixViewportHeight();
    }

    // Android specific fixes
    if (/Android/.test(navigator.userAgent)) {
      document.body.classList.add('android');
    }

    // Performance optimizations loaded
  }

  // Start initialization
  init();

  // Export utilities for use in other modules
  window.performanceUtils = {
    debounce,
    throttle,
    smoothScrollTo,
    showNotification
  };
})();
