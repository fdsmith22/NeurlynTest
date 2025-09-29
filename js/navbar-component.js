/**
 * Neurlyn Navbar Component
 * Reusable navigation bar with enhanced branding
 */

class NeurlynNavbar {
  constructor() {
    this.currentPage = this.getCurrentPage();
  }

  getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('about')) return 'about';
    if (path.includes('support')) return 'support';
    return 'assessment';
  }

  render() {
    return `
      <nav class="main-nav">
        <div class="container">
          <div class="nav-content">
            <div class="nav-brand-group">
              <a href="index.html" class="nav-brand">Neurlyn</a>
              <span class="nav-tagline">Intelligent Personality Assessment</span>
            </div>
            <div class="nav-links">
              <a href="index.html" class="nav-link ${this.currentPage === 'assessment' ? 'active' : ''}">Assessment</a>
              <a href="support.html" class="nav-link ${this.currentPage === 'support' ? 'active' : ''}">Support</a>
              <a href="about.html" class="nav-link ${this.currentPage === 'about' ? 'active' : ''}">About</a>
            </div>
          </div>
        </div>
      </nav>
    `;
  }

  injectStyles() {
    if (document.getElementById('neurlyn-navbar-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'neurlyn-navbar-styles';
    styles.textContent = `
      /* Enhanced Neurlyn Brand Title - Softer Sage */
      .nav-brand {
        font-size: 2.4rem !important;
        font-weight: 600 !important;
        font-family: 'Space Grotesk', sans-serif !important;
        letter-spacing: -0.03em !important;
        position: relative !important;
        display: inline-block !important;
        background: linear-gradient(115deg,
          #2a3f33 0%,           /* Deep forest */
          #5d7e68 35%,          /* Mid sage */
          #8ca595 65%,          /* Soft sage */
          #a5bfae 100%          /* Light sage */
        ) !important;
        background-size: 300% 300% !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
        background-clip: text !important;
        animation: gentleFlow 12s ease-in-out infinite;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
        text-shadow: 0 2px 20px rgba(140, 165, 149, 0.15);
        padding-bottom: 4px;
      }

      @keyframes gentleFlow {
        0%, 100% {
          background-position: 0% 50%;
          filter: brightness(1);
        }
        25% {
          background-position: 50% 50%;
          filter: brightness(1.05);
        }
        50% {
          background-position: 100% 50%;
          filter: brightness(1.1);
        }
        75% {
          background-position: 50% 50%;
          filter: brightness(1.05);
        }
      }

      /* Elegant underline with sage gradient */
      .nav-brand::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: -5%;
        right: -5%;
        height: 2px;
        background: linear-gradient(90deg,
          transparent,
          rgba(140, 165, 149, 0.2) 15%,
          rgba(124, 152, 133, 0.5) 30%,
          rgba(140, 165, 149, 0.7) 50%,
          rgba(124, 152, 133, 0.5) 70%,
          rgba(140, 165, 149, 0.2) 85%,
          transparent
        );
        transform: scaleX(0);
        transform-origin: center;
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        filter: blur(0.5px);
      }

      /* Soft sage dot - more visible */
      .nav-brand::before {
        content: '';
        position: absolute;
        top: 0.3em;
        right: -0.5em;
        width: 7px;
        height: 7px;
        background: linear-gradient(135deg, #8ca595 0%, #a5bfae 100%);
        border-radius: 50%;
        opacity: 0.85;
        animation: softPulse 4s ease-in-out infinite;
        box-shadow:
          0 0 12px rgba(140, 165, 149, 0.4),
          0 2px 4px rgba(140, 165, 149, 0.2),
          inset 0 -1px 2px rgba(255, 255, 255, 0.3);
        border: 1px solid rgba(140, 165, 149, 0.2);
      }

      @keyframes softPulse {
        0%, 100% {
          transform: scale(1);
          opacity: 0.85;
          box-shadow:
            0 0 12px rgba(140, 165, 149, 0.4),
            0 2px 4px rgba(140, 165, 149, 0.2),
            inset 0 -1px 2px rgba(255, 255, 255, 0.3);
        }
        50% {
          transform: scale(1.15);
          opacity: 1;
          box-shadow:
            0 0 18px rgba(140, 165, 149, 0.6),
            0 2px 6px rgba(140, 165, 149, 0.3),
            inset 0 -1px 2px rgba(255, 255, 255, 0.4);
        }
      }

      .nav-brand:hover {
        transform: translateY(-2px) scale(1.03) !important;
        filter: brightness(1.15) contrast(1.05);
        animation-play-state: paused;
      }

      .nav-brand:hover::after {
        transform: scaleX(1.1);
        filter: blur(0px);
      }

      .nav-brand:hover::before {
        animation-duration: 2s;
        transform: scale(1.5);
        opacity: 0.8;
      }

      /* Add wrapper for proper positioning */
      .nav-brand-group {
        position: relative;
      }
    `;
    document.head.appendChild(styles);
  }

  init() {
    // Inject styles
    this.injectStyles();

    // Find the target element
    const existingNav = document.querySelector('.main-nav');
    if (existingNav) {
      // Replace existing nav
      const parent = existingNav.parentElement;
      const newNav = document.createElement('div');
      newNav.innerHTML = this.render();
      parent.replaceChild(newNav.firstElementChild, existingNav);
    } else {
      // Insert at the beginning of body
      const newNav = document.createElement('div');
      newNav.innerHTML = this.render();
      document.body.insertBefore(newNav.firstElementChild, document.body.firstChild);
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const navbar = new NeurlynNavbar();
    navbar.init();
  });
} else {
  const navbar = new NeurlynNavbar();
  navbar.init();
}
