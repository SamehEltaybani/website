(function() {
  'use strict';

  let suggestionPool = [];
  let spellDictionary = [];
  const SPELL_THRESHOLD = 2;

  // ------- Spell‑correction helpers -------
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

  function findSpellSuggestions(query, pool) {
      if (!query || query.length < 3) return [];
      const q = query.toLowerCase().trim();
      const maxDist = 2;
      let best = [];
      for (const word of pool) {
          const dist = editDistance(q, word);
          if (dist <= maxDist) {
              best.push({ word, dist });
          }
      }
      best.sort((a, b) => a.dist - b.dist || a.word.localeCompare(b.word));
      return best.slice(0, 8).map(item => item.word);
  }
  // -----------------------------------------

  function initSearch() {
    const toggleBtn = document.getElementById('search-toggle');
    if (!toggleBtn) return;

    let overlay = document.querySelector('.search-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'search-modal-overlay';

      const box = document.createElement('div');
      box.className = 'search-modal-box';
      // Prevent the white box from clipping the dropdown/tooltip
      box.style.overflow = 'visible';

      // Circular close button (top-right)
      const closeBtn = document.createElement('button');
      closeBtn.className = 'search-modal-close-btn';
      closeBtn.innerHTML = '&times;';
      closeBtn.setAttribute('aria-label', 'Close search');
      box.appendChild(closeBtn);

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
      autocompleteDropdown.style.position = 'absolute';
      autocompleteDropdown.style.top = '100%';
      autocompleteDropdown.style.left = '0';
      autocompleteDropdown.style.width = '100%';
      autocompleteDropdown.style.backgroundColor = '#ffffff';
      autocompleteDropdown.style.border = '1px solid var(--color-border)';
      autocompleteDropdown.style.borderRadius = '8px';
      autocompleteDropdown.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      autocompleteDropdown.style.maxHeight = '220px';
      autocompleteDropdown.style.overflowY = 'auto';
      autocompleteDropdown.style.overflowX = 'hidden';
      autocompleteDropdown.style.zIndex = '1100';
      inputWrapper.appendChild(autocompleteDropdown);

      box.appendChild(inputWrapper);
      overlay.appendChild(box);
      document.body.appendChild(overlay);

      // Update submit area appearance based on input content
      function updateSubmitArea() {
        const hasText = input.value.trim().length > 0;
        submitArea.classList.toggle('active', hasText);
      }

      // Autocomplete logic (with spell correction)
      let selectedIndex = -1;
      input.addEventListener('input', function() {
          const query = input.value.trim().toLowerCase();
          updateSubmitArea();
          if (query.length === 0) {
              autocompleteDropdown.classList.remove('open');
              return;
          }

          // 1) Direct suggestions (includes the query)
          let directMatches = suggestionPool.filter(word => word.includes(query)).slice(0, 8);

          // 2) If no direct matches, try spell‑correction
          let showSpell = false;
          let spellSuggestions = [];
          if (directMatches.length === 0 && query.length >= 3) {
              spellSuggestions = findSpellSuggestions(query, suggestionPool);
              if (spellSuggestions.length > 0) {
                  showSpell = true;
              }
          }

          autocompleteDropdown.innerHTML = '';
          selectedIndex = -1;

          // ---- Build dropdown content ----
          if (showSpell) {
              // Row: "No direct matches" + "? Search tips"
              const headerRow = document.createElement('div');
              headerRow.style.cssText = 'display:flex; align-items:center; gap:var(--space-md); padding: var(--space-xs) var(--space-sm);';

              const noMatch = document.createElement('span');
              noMatch.style.cssText = 'font-size: var(--font-size-sm); color: var(--color-text-muted); font-style: italic;';
              noMatch.textContent = 'No direct matches';
              headerRow.appendChild(noMatch);

              const tipsWrapper = document.createElement('span');
              tipsWrapper.style.cssText = 'position: relative; display: inline-block;';

              const tipsLink = document.createElement('span');
              tipsLink.className = 'search-tips-trigger-link';
              tipsLink.style.cssText = 'font-size: var(--font-size-sm); color: var(--color-midnight-blue); text-decoration: underline; cursor: pointer; white-space: nowrap;';
              tipsLink.innerHTML = '[ <i class="fas fa-question-circle"></i> Search tips ]';
              tipsWrapper.appendChild(tipsLink);

              // Tooltip (central‑search‑specific)
              const tooltip = document.createElement('div');
              tooltip.className = 'search-tips-tooltip';
              tooltip.style.cssText = 'display:none; position:absolute; top:100%; left:0; background:var(--color-white); border:1px solid var(--color-border); border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1); padding:var(--space-md); z-index:1101; width:100%; font-size:var(--font-size-sm); line-height:1.6;';
              // Central‑search‑specific tips (edit this HTML to change tips)
              tooltip.innerHTML = `
                  <button class="search-modal-close-btn" style="position: absolute; top: 8px; right: 8px; width: 32px; height: 32px; border-radius: 50%;">&times;</button>
                  <strong>Search Tips:</strong><br><br>
                  · This search covers titles, summaries, and key metadata across the site – not full text.<br>
                  · Use specific words like “nursing education” rather than just “nursing”.<br>
                  · Try different terms or synonyms.<br>
                  · For full article content, browse the <a href="blog.html">Blog</a> and filter by categories, or <a href="publications.html">search Publications</a> by year, journal, and keywords.<br>
                  · For further assistance, <a href="contact.html">contact me</a>.
              `;

              inputWrapper.appendChild(tooltip);

              tipsLink.addEventListener('click', function(e) {
                  e.stopPropagation();
                  tooltip.style.display = (tooltip.style.display === 'block') ? 'none' : 'block';
              });
              tooltip.querySelector('.search-modal-close-btn').addEventListener('click', function() {
                  tooltip.style.display = 'none';
              });
              document.addEventListener('click', function closeTooltip(e) {
                  if (!tipsWrapper.contains(e.target)) {
                      tooltip.style.display = 'none';
                  }
              });

              headerRow.appendChild(tipsWrapper);
              autocompleteDropdown.appendChild(headerRow);

              // "Suggestions:" label
              const label = document.createElement('div');
              label.style.cssText = 'padding: 2px var(--space-sm); font-size: 0.7rem; color: var(--color-gold); font-weight: 600; text-transform: uppercase;';
              label.textContent = 'Suggestions:';
              autocompleteDropdown.appendChild(label);

              // Spell‑corrected suggestions
              spellSuggestions.forEach(sug => {
                  const item = document.createElement('div');
                  item.className = 'search-modal-autocomplete-item';
                  item.textContent = sug;
                  item.addEventListener('click', function() {
                      input.value = sug;
                      autocompleteDropdown.classList.remove('open');
                      updateSubmitArea();
                      doSearch();
                  });
                  item.addEventListener('mouseenter', function() {
                      const items = autocompleteDropdown.querySelectorAll('.search-modal-autocomplete-item');
                      items.forEach(el => el.style.backgroundColor = '');
                      item.style.backgroundColor = 'var(--color-hover-bg)';
                      selectedIndex = -1;  // spell items don't participate in keyboard nav
                  });
                  autocompleteDropdown.appendChild(item);
              });
              autocompleteDropdown.classList.add('open');
          } else if (directMatches.length > 0) {
              // Normal direct matches
              directMatches.forEach((match, idx) => {
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
                      item.style.backgroundColor = 'var(--color-hover-bg)';
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
        item.style.backgroundColor = i === index ? 'var(--color-hover-bg)' : '';
    });
    if (items[index]) {
        items[index].scrollIntoView({ block: 'nearest' });
    }
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

      // ---- Search execution ----
      function doSearch() {
        const query = input.value.trim();
        if (!query) return;
        // Directly redirect to results page – no spell‑correction popup
        window.location.href = 'search.html?q=' + encodeURIComponent(query);
        overlay.classList.remove('open');
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
        if (e.key === 'Escape' && overlay.classList.contains('open')) {
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

  // Bootstrap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }
})();
