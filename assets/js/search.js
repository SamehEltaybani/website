/**
 * ============================================
 * SEARCH.JS – SEARCH MODAL FOR THE WHOLE SITE
 * ============================================
 * Loaded on every page after footer.js.
 * Creates the full‑page overlay and redirects to search.html.
 */

(function() {
  'use strict';

  function initSearch() {
    // Find the search icon button (added to every page’s navbar)
    const toggleBtn = document.getElementById('search-toggle');
    if (!toggleBtn) return;

    // Create the modal overlay (only once)
    let overlay = document.querySelector('.search-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'search-modal-overlay';

      const box = document.createElement('div');
      box.className = 'search-modal-box';

      const closeBtn = document.createElement('button');
      closeBtn.className = 'search-modal-close';
      closeBtn.innerHTML = '&times;';
      closeBtn.setAttribute('aria-label', 'Close search');
      box.appendChild(closeBtn);

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'search-modal-input';
      input.placeholder = 'Search the site...';
      input.setAttribute('aria-label', 'Search');
      box.appendChild(input);

      const submitBtn = document.createElement('button');
      submitBtn.className = 'btn btn-primary search-modal-submit';
      submitBtn.textContent = 'Search';
      box.appendChild(submitBtn);

      overlay.appendChild(box);
      document.body.appendChild(overlay);

      // Open modal when icon is clicked
      toggleBtn.addEventListener('click', function() {
        overlay.classList.add('open');
        input.focus();
      });

      // Close with the X button
      closeBtn.addEventListener('click', function() {
        overlay.classList.remove('open');
      });

      // Close when clicking the dark background
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
          overlay.classList.remove('open');
        }
      });

      // Close with Escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && overlay.classList.contains('open')) {
          overlay.classList.remove('open');
        }
      });

      // Perform search on Enter or button click
      function doSearch() {
        const query = input.value.trim();
        if (query) {
          window.location.href = 'search.html?q=' + encodeURIComponent(query);
        }
        overlay.classList.remove('open');
      }

      submitBtn.addEventListener('click', doSearch);
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          doSearch();
        }
      });
    }
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }
})();
