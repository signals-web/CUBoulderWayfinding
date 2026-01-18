// Theme initialization is now handled in the <head> to prevent FOUC


// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  const section = params.get('section');
  const page = params.get('page') || '_index';
  const isDirectory = window.location.pathname.includes('directory.html');

  initThemeToggle();
  initMobileMenu();
  initSplashScreen();
  updateSwitcherState(section, page, isDirectory);
  initLucide();

  // Initialize reveal animations and expose to window for content loader
  window.initRevealAnimations = initRevealAnimations;
  initRevealAnimations();
});

function initLucide() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function initRevealAnimations() {
  const observerOptions = {
    threshold: 0.05,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        requestAnimationFrame(() => {
          entry.target.classList.add('visible');
        });
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all current reveal-up elements that aren't yet visible
  document.querySelectorAll('.reveal-up:not(.visible)').forEach(el => {
    observer.observe(el);
  });
}

function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');

  if (toggle) {
    toggle.addEventListener('click', function () {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';

      html.setAttribute('data-theme', next);
      html.classList.toggle('dark', next === 'dark');
      localStorage.setItem('theme', next);
    });
  }
}

function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('close-drawer');
  const mobileMenu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('drawer-overlay');

  if (menuBtn && mobileMenu && overlay) {
    const toggleMenu = () => {
      mobileMenu.classList.toggle('open');
      overlay.classList.toggle('open');
      document.body.classList.toggle('overflow-hidden');
    };

    menuBtn.addEventListener('click', toggleMenu);
    if (closeBtn) closeBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        toggleMenu();
      }
    });
  }
}

/**
 * Handle mode switcher active states
 */
function updateSwitcherState(section, page, isDirectory) {
  const modeStandard = document.getElementById('mode-standard');
  const modeDirectory = document.getElementById('mode-directory');
  const modeTechnical = document.getElementById('mode-technical');

  if (!modeStandard || !modeDirectory || !modeTechnical) return;

  // Reset
  [modeStandard, modeDirectory, modeTechnical].forEach(btn => btn.classList.remove('active'));

  if (isDirectory) {
    modeDirectory.classList.add('active');
  } else if (page === 'pictorial-index' || section === 'sign-types') {
    modeTechnical.classList.add('active');
  } else {
    modeStandard.classList.add('active');
  }
}

function initSplashScreen() {
  const splash = document.getElementById('splash-screen');
  if (splash) {
    // Check if we've already seen the splash this session
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');

    if (hasSeenSplash) {
      splash.style.display = 'none';
      return;
    }

    splash.addEventListener('click', function () {
      splash.classList.add('fade-out');
      sessionStorage.setItem('hasSeenSplash', 'true');

      // Remove from DOM after transition for performance
      setTimeout(() => {
        splash.remove();
      }, 800);
    });
  }
}
