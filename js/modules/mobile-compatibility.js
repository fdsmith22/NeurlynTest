/**
 * Mobile Compatibility Module
 * Fixes common mobile browser issues and improves responsive behavior
 */

class MobileCompatibility {
  constructor() {
    this.init();
  }

  init() {
    // Fix viewport height on mobile browsers
    this.fixViewportHeight();

    // Detect device capabilities
    this.detectDeviceCapabilities();

    // Handle orientation changes
    this.handleOrientationChange();

    // Fix touch event issues
    this.improveTouch();

    // Prevent zoom on input focus (iOS)
    this.preventInputZoom();

    // Add safe area padding for notched devices
    this.addSafeAreaSupport();

    // Monitor and fix layout issues
    this.monitorLayoutIssues();
  }

  /**
   * Fix viewport height issues on mobile browsers
   * Addresses the problem where 100vh includes browser chrome
   */
  fixViewportHeight() {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set on load
    setViewportHeight();

    // Update on resize and orientation change
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
  }

  /**
   * Detect device capabilities and add appropriate classes
   */
  detectDeviceCapabilities() {
    const html = document.documentElement;

    // Detect touch support
    if ('ontouchstart' in window) {
      html.classList.add('touch-device');
    } else {
      html.classList.add('no-touch');
    }

    // Detect iOS
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      html.classList.add('ios-device');
    }

    // Detect Android
    if (/Android/.test(navigator.userAgent)) {
      html.classList.add('android-device');
    }

    // Detect standalone mode (PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      html.classList.add('standalone-app');
    }

    // Detect notched devices
    if (this.hasNotch()) {
      html.classList.add('has-notch');
    }
  }

  /**
   * Check if device has a notch (iPhone X and later)
   */
  hasNotch() {
    const safeAreaInsets = [
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)') || 0
      ),
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          'env(safe-area-inset-bottom)'
        ) || 0
      )
    ];

    return safeAreaInsets.some(inset => inset > 0);
  }

  /**
   * Handle orientation changes
   */
  handleOrientationChange() {
    const updateOrientation = () => {
      const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
      document.documentElement.setAttribute('data-orientation', orientation);

      // Dispatch custom event
      window.dispatchEvent(
        new CustomEvent('orientationChanged', {
          detail: { orientation }
        })
      );
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);
  }

  /**
   * Improve touch interactions
   */
  improveTouch() {
    // Prevent double-tap zoom
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
      { passive: false }
    );

    // Add touch feedback
    document.addEventListener('touchstart', e => {
      const target = e.target.closest('button, a, .clickable');
      if (target) {
        target.classList.add('touch-active');
      }
    });

    document.addEventListener('touchend', e => {
      const target = e.target.closest('button, a, .clickable');
      if (target) {
        setTimeout(() => target.classList.remove('touch-active'), 150);
      }
    });

    // Improve scroll performance
    this.addPassiveScrollListeners();
  }

  /**
   * Add passive scroll listeners for better performance
   */
  addPassiveScrollListeners() {
    const scrollElements = document.querySelectorAll('.scrollable, .scroll-x, .scroll-y');
    scrollElements.forEach(element => {
      element.addEventListener('touchstart', () => {}, { passive: true });
      element.addEventListener('touchmove', () => {}, { passive: true });
    });
  }

  /**
   * Prevent zoom on input focus (iOS Safari)
   */
  preventInputZoom() {
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      const content = metaViewport.getAttribute('content');
      if (!content.includes('maximum-scale')) {
        metaViewport.setAttribute('content', content + ', maximum-scale=1.0');
      }
    }

    // Set font size to prevent zoom
    const inputs = document.querySelectorAll(
      'input[type="text"], input[type="email"], input[type="tel"], textarea, select'
    );
    inputs.forEach(input => {
      const styles = window.getComputedStyle(input);
      const fontSize = parseFloat(styles.fontSize);
      if (fontSize < 16) {
        input.style.fontSize = '16px';
      }
    });
  }

  /**
   * Add safe area support for notched devices
   */
  addSafeAreaSupport() {
    // Add padding to fixed elements
    const fixedElements = document.querySelectorAll('[style*="position: fixed"], .fixed');
    fixedElements.forEach(element => {
      const styles = window.getComputedStyle(element);

      if (styles.bottom === '0px') {
        element.style.paddingBottom = 'env(safe-area-inset-bottom)';
      }

      if (styles.top === '0px') {
        element.style.paddingTop = 'env(safe-area-inset-top)';
      }
    });
  }

  /**
   * Monitor and fix common layout issues
   */
  monitorLayoutIssues() {
    // Check for horizontal overflow
    const checkHorizontalOverflow = () => {
      const hasOverflow =
        document.documentElement.scrollWidth > document.documentElement.clientWidth;

      if (hasOverflow) {
        console.warn('Horizontal overflow detected');
        this.findOverflowingElements();
      }
    };

    // Initial check
    setTimeout(checkHorizontalOverflow, 1000);

    // Check on window resize
    window.addEventListener('resize', checkHorizontalOverflow);
  }

  /**
   * Find elements causing horizontal overflow
   */
  findOverflowingElements() {
    const elements = document.querySelectorAll('*');
    const windowWidth = document.documentElement.clientWidth;

    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.right > windowWidth || rect.left < 0) {
        console.warn('Overflowing element:', element);
        element.style.maxWidth = '100%';
        element.style.overflowX = 'hidden';
      }
    });
  }

  /**
   * Test touch target sizes
   */
  testTouchTargets() {
    const interactiveElements = document.querySelectorAll(
      'button, a, input, select, textarea, [onclick]'
    );
    const minSize = 44; // iOS HIG minimum

    const smallTargets = [];

    interactiveElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width < minSize || rect.height < minSize) {
        smallTargets.push({
          element,
          width: rect.width,
          height: rect.height
        });
      }
    });

    if (smallTargets.length > 0) {
      console.warn(`Found ${smallTargets.length} touch targets below minimum size:`, smallTargets);
    }

    return smallTargets;
  }

  /**
   * Add responsive debugging info
   */
  addDebugInfo() {
    const debugPanel = document.createElement('div');
    debugPanel.id = 'mobile-debug';
    debugPanel.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 10px;
      font-size: 12px;
      z-index: 99999;
      border-radius: 5px;
      font-family: monospace;
    `;

    const updateDebugInfo = () => {
      debugPanel.innerHTML = `
        Viewport: ${window.innerWidth}×${window.innerHeight}<br>
        Screen: ${screen.width}×${screen.height}<br>
        DPR: ${window.devicePixelRatio}<br>
        Orientation: ${window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'}<br>
        Touch: ${'ontouchstart' in window ? 'Yes' : 'No'}
      `;
    };

    updateDebugInfo();
    window.addEventListener('resize', updateDebugInfo);
    document.body.appendChild(debugPanel);

    // Remove after 5 seconds
    setTimeout(() => debugPanel.remove(), 5000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.mobileCompat = new MobileCompatibility();
  });
} else {
  window.mobileCompat = new MobileCompatibility();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileCompatibility;
}
