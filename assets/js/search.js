(function() {
  'use strict';

  let suggestionPool = [];
  let spellDictionary = [];
  const SPELL_THRESHOLD = 2;

  function initSearch() {
    const toggleBtn = document.getElementById('search-toggle');
    if (!toggleBtn) return;

    let overlay = document.querySelector('.search-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'search-modal-overlay';

      const box = document.createElement('div');
      box.className = 'search-modal-box';

      // Circular close button (top-right)
      const closeBtn = document.createElement('button');
      closeBtn.className = 'search-modal-close-btn';
      closeBtn.innerHTML = '&times;';
      closeBtn.setAttribute('aria-label', 'Close search');
      box.appendChild(closeBtn);

      // "Search tips" trigger (above input)
      const tipsTrigger = document.createElement('span');
      tipsTrigger.className = 'search-tips-trigger';
      tipsTrigger.innerHTML = '<i class="fas fa-question-circle"></i> Search tips';
      box.appendChild(tipsTrigger);

      // Input wrapper (relative for icons)
      const inputWrapper = document.createElement('div');
      inputWrapper.className = 'search-modal-input-wrapper';
      inputWrapper.style.position = 'relative';

     

      // Input field
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'search-modal-input';
      input.placeholder = 'Search the site...';
      input.setAttribute('aria-label', 'Search');
      inputWrapper.appendChild(input);

      // Right-side submit area (icon + "search")
      const submitArea = document.createElement('button');
      submitArea.className = 'search-modal-submit-area';
      submitArea.innerHTML = '<i class="fas fa-magnifying-glass-arrow-right submit-icon"></i> <span>search</span>';
      submitArea.setAttribute('aria-label', 'Perform search');
      inputWrapper.appendChild(submitArea);

      // Autocomplete dropdown
      const autocompleteDropdown = document.createElement('div');
      autocompleteDropdown.className = 'search-modal-autocomplete';
      inputWrapper.appendChild(autocompleteDropdown);

      box.appendChild(inputWrapper);
      overlay.appendChild(box);
      document.body.appendChild(overlay);

      // Tips overlay (second modal on top of search)
      const tipsOverlay = document.createElement('div');
      tipsOverlay.className = 'search-tips-overlay';
      const tipsBox = document.createElement('div');
      tipsBox.className = 'search-tips-box';
      tipsBox.innerHTML = `
        <button class="search-modal-close-btn" style="position:absolute; top:var(--space-md); right:var(--space-md);">&times;</button>
        <strong>Tips & Suggestions:</strong><br>
        · The search looks at key metadata across the site – it does not scan the full text of every page.<br>
        · Use specific words like “nursing education” rather than just “nursing”.<br>
        · Try different terms or synonyms.<br>
        · For full article content, browse the <a href="blog.html">Blog</a> and filter by categories, or <a href="publications.html">search Publications</a> by year, journal, and keywords.<br>
        · For further assistance, <a href="contact.html">contact me</a>.
      `;
      tipsBox.querySelector('.search-modal-close-btn').addEventListener('click', function() {
        tipsOverlay.classList.remove('open');
      });
      tipsOverlay.addEventListener('click', function(e) {
        if (e.target === tipsOverlay) tipsOverlay.classList.remove('open');
      });
      tipsOverlay.appendChild(tipsBox);
      document.body.appendChild(tipsOverlay);

      // Open tips overlay on trigger click
      tipsTrigger.addEventListener('click', function() {
        tipsOverlay.classList.add('open');
      });

      // Close tips overlay with Escape
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && tipsOverlay.classList.contains('open')) {
          tipsOverlay.classList.remove('open');
        }
      });

      // Update submit area appearance based on input content
      function updateSubmitArea() {
        const hasText = input.value.trim().length > 0;
        submitArea.classList.toggle('active', hasText);
      }

      // ---- Autocomplete logic ----
      let selectedIndex = -1;
      input.addEventListener('input', function() {
        const query = input.value.trim().toLowerCase();
        updateSubmitArea();

        if (query.length === 0) {
          autocompleteDropdown.classList.remove('open');
          return;
        }
        const matches = suggestionPool.filter(word => word.startsWith(query)).slice(0, 8);
        autocompleteDropdown.innerHTML = '';
        selectedIndex = -1;
        if (matches.length > 0) {
          matches.forEach((match, idx) => {
            const item = document.createElement('div');
            item.className = 'search-modal-autocomplete-item';
            item.textContent = match;
            item.addEventListener('click', function() {
              input.value = match;
              autocompleteDropdown.classList.remove('open');
              updateSubmitArea();
              doSearch();
            });
            item.addEventListener('mouseenter', function() {
              const items = autocompleteDropdown.querySelectorAll('.search-modal-autocomplete-item');
              items.forEach(el => el.style.backgroundColor = '');
              item.style.backgroundColor = 'var(--color-bg-alt)';
              selectedIndex = idx;
            });
            autocompleteDropdown.appendChild(item);
          });
          autocompleteDropdown.classList.add('open');
        } else {
          autocompleteDropdown.classList.remove('open');
        }
      });

      // Keyboard navigation
      input.addEventListener('keydown', function(e) {
        // If typing Enter and the dropdown is open, let the dropdown handler handle it
        if (autocompleteDropdown.classList.contains('open')) {
          const items = autocompleteDropdown.querySelectorAll('.search-modal-autocomplete-item');
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            highlightItem(items, selectedIndex);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, 0);
            highlightItem(items, selectedIndex);

            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex >= 0) {
                    // A specific suggestion is selected – use it
                    items[selectedIndex].click();
                } else {
                    // No suggestion selected – search for whatever is typed
                    autocompleteDropdown.classList.remove('open');
                    doSearch();
                }
            } else if (e.key === 'Escape') {          
            autocompleteDropdown.classList.remove('open');
          }
        } else {
          // Dropdown is closed: Enter triggers search
          if (e.key === 'Enter') {
            e.preventDefault();
            doSearch();
          }
        }
      });

      function highlightItem(items, index) {
        items.forEach((item, i) => {
          item.style.backgroundColor = i === index ? 'var(--color-bg-alt)' : '';
        });
      }

      // Submit area click
      submitArea.addEventListener('click', function() {
        if (input.value.trim().length > 0) {
          doSearch();
        }
      });

      // Close dropdown when clicking outside the input wrapper
      document.addEventListener('click', function(e) {
        if (!inputWrapper.contains(e.target)) {
          autocompleteDropdown.classList.remove('open');
        }
      });

      // ---- Spell correction and search execution ----
      function doSearch() {
        const query = input.value.trim();
        if (!query) return;
        const words = query.split(/\s+/);
        let hasCorrection = false;
        const correctedWords = words.map(w => {
          const correction = correctWord(w);
          if (correction) hasCorrection = true;
          return correction || w;
        });
        const finalQuery = correctedWords.join(' ');

        if (hasCorrection) {
          const existing = document.querySelector('.correction-message');
          if (existing) existing.remove();

          const msg = document.createElement('div');
          msg.className = 'correction-message';
          msg.style.cssText = 'margin-top:var(--space-sm); padding:var(--space-sm); background-color:var(--color-gold-light); border-radius:8px; font-size:var(--font-size-sm); text-align:center;';
          msg.innerHTML = 'Did you mean: <a href="#" class="correction-link" style="font-weight:600; text-decoration:underline; color:var(--color-midnight-blue);">' + finalQuery + '</a> ?';

          msg.querySelector('.correction-link').addEventListener('click', function(e) {
            e.preventDefault();
            input.value = finalQuery;
            msg.remove();
            doSearch();
          });

          const dismiss = document.createElement('button');
          dismiss.textContent = '✕';
          dismiss.style.cssText = 'background:none; border:none; margin-left:var(--space-sm); cursor:pointer; font-size:0.9rem;';
          dismiss.addEventListener('click', function() { msg.remove(); });
          msg.appendChild(dismiss);

          box.appendChild(msg);
        } else {
          window.location.href = 'search.html?q=' + encodeURIComponent(query);
          overlay.classList.remove('open');
        }
      }

      // Modal open/close behaviour
      toggleBtn.addEventListener('click', function() {
        overlay.classList.add('open');
        input.focus();
        buildSuggestionPool();
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
        if (e.key === 'Escape' && overlay.classList.contains('open') && !tipsOverlay.classList.contains('open')) {
          overlay.classList.remove('open');
        }
      });
    }
  }

  // ---- Suggestion pool builder (bigrams, frequency, caching) ----
  async function buildSuggestionPool() {
    if (suggestionPool.length > 0) return;

    try {
      if (typeof SiteUtils === 'undefined') return;
      const [site, blog, pubs, portfolios] = await Promise.all([
        SiteUtils.loadJSON('/json/site-data.json', true),
        SiteUtils.loadJSON('/json/blog-list.json', true),
        SiteUtils.loadJSON('/json/publication-list.json', true),
        SiteUtils.loadJSON('/json/portfolio-list.json', true)
      ]);

      const freqMap = new Map();
      const addWords = (text) => {
        if (typeof SiteUtils.cleanSearchTerm === 'function') {
          const words = SiteUtils.cleanSearchTerm(text);
          words.forEach(w => freqMap.set(w, (freqMap.get(w) || 0) + 1));
          for (let i = 0; i < words.length - 1; i++) {
            const bigram = words[i] + ' ' + words[i+1];
            freqMap.set(bigram, (freqMap.get(bigram) || 0) + 1);
          }
        }
      };

      const processEntry = (entry) => {
        addWords(entry.title);
        addWords(entry.summary);
      };

      if (site && site.breadcrumbHierarchy) site.breadcrumbHierarchy.forEach(processEntry);
      if (blog && Array.isArray(blog)) {
        blog.forEach(post => {
          processEntry(post);
          addWords(post.shortTitle);
          if (post.categories) post.categories.forEach(c => addWords(c));
        });
      }
      if (pubs && Array.isArray(pubs)) {
        pubs.forEach(pub => {
          processEntry(pub);
          addWords(pub.journal);
        });
      }
      if (portfolios && Array.isArray(portfolios)) {
        portfolios.forEach(pf => processEntry(pf));
      }

      const sorted = [...freqMap.entries()].sort((a, b) => b[1] - a[1]);
      suggestionPool = sorted.map(e => e[0]);
      spellDictionary = suggestionPool.slice();
    } catch(e) {
      console.warn('Could not build autocomplete pool', e);
    }
  }

  // ---- Spell checking helpers ----
  function editDistance(a, b) {
    const alen = a.length, blen = b.length;
    const dp = Array.from({ length: alen + 1 }, () => Array(blen + 1).fill(0));
    for (let i = 0; i <= alen; i++) dp[i][0] = i;
    for (let j = 0; j <= blen; j++) dp[0][j] = j;
    for (let i = 1; i <= alen; i++) {
      for (let j = 1; j <= blen; j++) {
        dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1;
      }
    }
    return dp[alen][blen];
  }

  function correctWord(word) {
    if (!word || word.length < 3) return null;
    word = word.toLowerCase();
    if (spellDictionary.includes(word)) return null;
    let bestMatch = null;
    let bestScore = Infinity;
    for (const dictWord of spellDictionary) {
      const dist = editDistance(word, dictWord);
      if (dist < bestScore && dist <= SPELL_THRESHOLD) {
        bestScore = dist;
        bestMatch = dictWord;
        if (dist === 1) break;
      }
    }
    return bestMatch;
  }

  // Boostrap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }
})();
