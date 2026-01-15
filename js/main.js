// Theme initialization is now handled in the <head> to prevent FOUC


// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  const section = params.get('section');
  const page = params.get('page') || '_index';
  const isDirectory = window.location.pathname.includes('directory.html');

  initThemeToggle();
  initMobileMenu();
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
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      mobileMenu.classList.toggle('hidden');
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
