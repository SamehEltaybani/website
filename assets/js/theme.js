/**
 * theme.js – Dark/Light mode toggle
 * ==================================
 * Desktop button: #theme-toggle-desktop (must exist in navbar)
 * Mobile button:  #theme-toggle-mobile  (added by navigation.js)
 */

(function() {
  'use strict';

  // Apply saved theme on load
  const savedTheme = localStorage.getItem('site-theme');
  if (savedTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
  }

  // Toggle function
  function toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.body.removeAttribute('data-theme');
      localStorage.setItem('site-theme', 'light');
    } else {
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('site-theme', 'dark');
    }
    updateIcon();
  }

  // Change the sun/moon icon on both buttons
  function updateIcon() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const desktopBtn = document.getElementById('theme-toggle-desktop');
    const mobileBtn = document.getElementById('theme-toggle-mobile');

    if (desktopBtn) {
      desktopBtn.innerHTML = isDark
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
    }
    if (mobileBtn) {
      mobileBtn.innerHTML = isDark
        ? '<i class="fas fa-sun"></i> Light mode'
        : '<i class="fas fa-moon"></i> Dark mode';
    }
  }

  // Wait for DOM, then attach listeners and initial icon
  function init() {
    const desktopBtn = document.getElementById('theme-toggle-desktop');
    if (desktopBtn) {
      desktopBtn.addEventListener('click', toggleTheme);
    }
    // Mobile button is created later by navigation.js; we will attach after menu build.
    // We'll use a MutationObserver or simply check after navigation renders.
    // navigation.js is loaded after theme.js, so we can wait a bit.
    setTimeout(function() {
      const mobileBtn = document.getElementById('theme-toggle-mobile');
      if (mobileBtn) {
        mobileBtn.addEventListener('click', toggleTheme);
      }
      updateIcon();
    }, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also listen for mobile menu opening (when navigation rebuilds menu)
  // Actually, navigation.js rebuilds the mobile menu once. We'll rely on setTimeout.
})();
