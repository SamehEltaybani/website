(function() {
  'use strict';

  let suggestionPool = [];

  function initSearch() {
    const toggleBtn = document.getElementById('search-toggle');
    if (!toggleBtn) return;

    let overlay = document.querySelector('.search-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'search-modal-overlay';

      const box = document.createElement('div');
      box.className = 'search-modal-box';

      // Close button
      const closeBtn = document.createElement('button');
      closeBtn.className = 'search-modal-close';
      closeBtn.innerHTML = '&times;';
      box.appendChild(closeBtn);

      

      // Input wrapper
      const inputWrapper = document.createElement('div');
      inputWrapper.className = 'search-modal-input-wrapper';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'search-modal-input';
      input.placeholder = 'Search the site...';
      input.setAttribute('aria-label', 'Search');
      inputWrapper.appendChild(input);

      // Autocomplete dropdown
      const autocompleteDropdown = document.createElement('div');
      autocompleteDropdown.className = 'search-modal-autocomplete';
      inputWrapper.appendChild(autocompleteDropdown);
      box.appendChild(inputWrapper);

      // Search button
      const submitBtn = document.createElement('button');
      submitBtn.className = 'btn btn-primary search-modal-submit';
      submitBtn.textContent = 'Search';
      box.appendChild(submitBtn);


            // ---- Compact tips section (static, below the search button) ----
      const tipsContainer = document.createElement('div');
      tipsContainer.style.cssText = 'display:flex; align-items:flex-start; gap:var(--space-sm); margin-top:var(--space-md); font-size:var(--font-size-sm); color:var(--color-text-muted); line-height:1.5;';

      const tipsLabel = document.createElement('span');
      tipsLabel.style.cssText = 'font-weight:600; white-space:nowrap;';
      tipsLabel.textContent = 'Search tips:';

      const tipsList = document.createElement('ul');
      tipsList.style.cssText = 'margin:0; padding-left:var(--space-lg); list-style:disc;';
      tipsList.innerHTML = `
        <li>Be specific (eg, “nursing education” instead of “nursing”).</li>
        <li>Try different terms or synonyms.</li>
        <li>This search covers key metadata information – not full text.</li>
      `;

      tipsContainer.appendChild(tipsLabel);
      tipsContainer.appendChild(tipsList);
      box.appendChild(tipsContainer);
      // -------------------------------------------------------------



      overlay.appendChild(box);
      document.body.appendChild(overlay);

      // Open modal
      toggleBtn.addEventListener('click', function() {
        overlay.classList.add('open');
        input.focus();
        buildSuggestionPool();   // update the pool each time the modal opens
      });

      closeBtn.addEventListener('click', function() {
        overlay.classList.remove('open');
      });

      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
          overlay.classList.remove('open');
        }
      });

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && overlay.classList.contains('open')) {
          overlay.classList.remove('open');
        }
      });

      // Autocomplete logic
      input.addEventListener('input', function() {
        const query = input.value.trim().toLowerCase();
        if (query.length === 0) {
          autocompleteDropdown.classList.remove('open');
          return;
        }
        const matches = suggestionPool.filter(word => word.startsWith(query)).slice(0, 8);
        autocompleteDropdown.innerHTML = '';
        if (matches.length > 0) {
          matches.forEach(match => {
            const item = document.createElement('div');
            item.className = 'search-modal-autocomplete-item';
            item.textContent = match;
            item.addEventListener('click', function() {
              input.value = match;
              autocompleteDropdown.classList.remove('open');
            });
            autocompleteDropdown.appendChild(item);
          });
          autocompleteDropdown.classList.add('open');
        } else {
          autocompleteDropdown.classList.remove('open');
        }
      });

      // Close dropdown when clicking outside input
      document.addEventListener('click', function(e) {
        if (!inputWrapper.contains(e.target)) {
          autocompleteDropdown.classList.remove('open');
        }
      });

      // Perform search
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

  async function buildSuggestionPool() {
    try {
      if (typeof SiteUtils === 'undefined') return;
      const [site, blog, pubs, portfolios] = await Promise.all([
        SiteUtils.loadJSON('/json/site-data.json', true),
        SiteUtils.loadJSON('/json/blog-list.json', true),
        SiteUtils.loadJSON('/json/publication-list.json', true),
        SiteUtils.loadJSON('/json/portfolio-list.json', true)
      ]);

      const words = new Set();
      const addWords = (text) => {
        if (text) text.toLowerCase().split(/\s+/).forEach(w => {
          if (w.length > 1) words.add(w);
        });
      };

      if (site && site.breadcrumbHierarchy) {
        site.breadcrumbHierarchy.forEach(entry => addWords(entry.title));
      }
      if (blog && Array.isArray(blog)) {
        blog.forEach(post => {
          addWords(post.title);
          addWords(post.shortTitle);
          if (post.categories) post.categories.forEach(c => addWords(c));
        });
      }
      if (pubs && Array.isArray(pubs)) {
        pubs.forEach(pub => {
          addWords(pub.title);
          addWords(pub.journal);
        });
      }
      if (portfolios && Array.isArray(portfolios)) {
        portfolios.forEach(pf => addWords(pf.portfolioname));
      }
      suggestionPool = [...words].sort();
    } catch(e) {
      console.warn('Could not build autocomplete pool', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }
})();
