(function() {
  'use strict';

  let suggestionPool = [];
  let spellDictionary = [];      // dictionary for spell correction (frequency sorted)
  const SPELL_THRESHOLD = 2;    // maximum edit distance for a correction to be shown

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
      tipsLabel.innerHTML = '<i class="fas fa-exclamation-circle"></i>';

      const tipsList = document.createElement('ul');
      tipsList.style.cssText = 'margin:0; padding-left:var(--space-lg); list-style:disc;';
      tipsList.innerHTML = `
        <li>Be specific (eg, “nursing education” instead of “nursing”).</li>
        <li>Try different terms or synonyms.</li>
        <li>This search covers key metadata – not full text of every page.</li>
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

                    item.addEventListener('touchstart', function(e) {
                      e.preventDefault();
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
                          // Show a brief "Did you mean?" message before redirecting
                          const msg = document.createElement('div');
                          msg.style.cssText = 'margin-top:var(--space-sm); padding:var(--space-sm); background-color:var(--color-gold-light); border-radius:8px; font-size:var(--font-size-sm); text-align:center;';
                          msg.textContent = 'Did you mean: ' + finalQuery + '?';
                          box.appendChild(msg);
                          // Remove the message after 2 seconds and then redirect
                          setTimeout(function() {
                              msg.remove();
                              window.location.href = 'search.html?q=' + encodeURIComponent(finalQuery);
                              overlay.classList.remove('open');
                          }, 2000);
                      } else {
                          window.location.href = 'search.html?q=' + encodeURIComponent(query);
                          overlay.classList.remove('open');
                      }
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
        const freqMap = new Map();   // for spell correction – higher frequency = higher priority
        const addWords = (text) => {
            if (typeof SiteUtils.cleanSearchTerm === 'function') {
                SiteUtils.cleanSearchTerm(text).forEach(w => {
                    words.add(w);
                    freqMap.set(w, (freqMap.get(w) || 0) + 1);
                });
            }
        };

        const processEntry = (entry) => {
            addWords(entry.title);
            addWords(entry.summary);
        };

        if (site && site.breadcrumbHierarchy) {
            site.breadcrumbHierarchy.forEach(processEntry);
        }
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
            portfolios.forEach(pf => {
                processEntry(pf);
            });
        }

        // Build frequency‑sorted dictionary
        spellDictionary = [...freqMap.entries()].sort((a, b) => b[1] - a[1]).map(e => e[0]);

        suggestionPool = [...words].sort();
    } catch(e) {
        console.warn('Could not build autocomplete pool', e);
    }
}




  /**
 * Levenshtein distance between two strings (edit distance).
 */
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

/**
 * Returns a corrected word or null if no good match is found.
 */
function correctWord(word) {
    if (!word || word.length < 3) return null;
    word = word.toLowerCase();
    // Only suggest if word is not already in the dictionary
    if (spellDictionary.includes(word)) return null;
    let bestMatch = null;
    let bestScore = Infinity;
    for (const dictWord of spellDictionary) {
        const dist = editDistance(word, dictWord);
        if (dist < bestScore && dist <= SPELL_THRESHOLD) {
            bestScore = dist;
            bestMatch = dictWord;
            if (dist === 1) break;   // can't beat distance 1
        }
    }
    return bestMatch;
}

  
  


  



  

  

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }
})();
