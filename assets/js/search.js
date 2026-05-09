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

      // Search tips header
      const tipsRow = document.createElement('div');
      tipsRow.style.cssText = 'display:flex; align-items:center; gap: var(--space-sm); margin-bottom: var(--space-sm);';
      const tipsBtn = document.createElement('button');
      tipsBtn.type = 'button';
      tipsBtn.className = 'btn btn-text';
      tipsBtn.innerHTML = '<i class="fas fa-question-circle mr-xs"></i> Search tips';
      tipsRow.appendChild(tipsBtn);
      box.appendChild(tipsRow);

      // Tips tooltip (hidden)
      const tipsTooltip = document.createElement('div');
      tipsTooltip.className = 'search-tips-tooltip';
      tipsTooltip.innerHTML = `
        <button class="search-tips-close">&times;</button>
        <strong>Tips for better results:</strong><br>
        · Use specific words like “nursing education” rather than just “nursing”.<br>
        · Try different terms or synonyms.<br>
        · The search looks at titles, summaries, and key metadata across the site.<br>
        · For full article content, browse the <a href="blog.html">Blog</a> or filter by category.
      `;
      box.appendChild(tipsTooltip);

      tipsBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        tipsTooltip.classList.toggle('open');
      });
      tipsTooltip.querySelector('.search-tips-close').addEventListener('click', function() {
        tipsTooltip.classList.remove('open');
      });

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

      // Scope note
      const scopeNote = document.createElement('p');
      scopeNote.style.cssText = 'font-size: var(--font-size-sm); color: var(--color-text-muted); margin-top: var(--space-sm); text-align: center;';
      scopeNote.textContent = 'This search covers page titles, article/blog titles and summaries, publication titles and summaries, and portfolio names. It does not scan the full text of every page.';
      box.appendChild(scopeNote);

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
