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
      closeBtn.className = 'search-modal-close-btn';
      closeBtn.innerHTML = '&times;';
      closeBtn.setAttribute('aria-label', 'Close search');
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


            // Disclaimer sentence (below the Search button)
      const scopeSentence = document.createElement('p');
      scopeSentence.style.cssText = 'font-size: 0.75rem; color: var(--color-text-muted); margin: var(--space-sm) 0 0 0; text-align: center;';
      scopeSentence.textContent = 'This search covers key metadata – not full text of every page.';
      box.appendChild(scopeSentence);

           
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



  // Close dropdown when clicking outside input
      document.addEventListener('click', function(e) {
        if (!inputWrapper.contains(e.target)) {
          autocompleteDropdown.classList.remove('open');
        }
      });


      
            // Autocomplete logic (with keyboard)
            let selectedIndex = -1;
            input.addEventListener('input', function() {
                const query = input.value.trim().toLowerCase();
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
                        });
                        item.addEventListener('mouseenter', function() {
                            // Remove highlight from all items
                            autocompleteDropdown.querySelectorAll('.search-modal-autocomplete-item').forEach(el => el.style.backgroundColor = '');
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

            // Keyboard navigation for the dropdown
            input.addEventListener('keydown', function(e) {
                if (!autocompleteDropdown.classList.contains('open')) return;
                const items = autocompleteDropdown.querySelectorAll('.search-modal-autocomplete-item');
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                    highlightItem(items, selectedIndex);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    selectedIndex = Math.max(selectedIndex - 1, 0);
                    highlightItem(items, selectedIndex);
                } else if (e.key === 'Enter' && selectedIndex >= 0) {
                    e.preventDefault();
                    items[selectedIndex].click();
                } else if (e.key === 'Escape') {
                    autocompleteDropdown.classList.remove('open');
                }
            });

            function highlightItem(items, index) {
                items.forEach((item, i) => {
                    item.style.backgroundColor = i === index ? 'var(--color-bg-alt)' : '';
                });
            }


      

    
     
      
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
        // Remove any previous correction message
        const existing = document.querySelector('.correction-message');
        if (existing) existing.remove();

        const msg = document.createElement('div');
        msg.className = 'correction-message';
        msg.style.cssText = 'margin-top:var(--space-sm); padding:var(--space-sm); background-color:var(--color-gold-light); border-radius:8px; font-size:var(--font-size-sm); text-align:center;';
        msg.innerHTML = 'Did you mean: <a href="#" class="correction-link" style="font-weight:600; text-decoration:underline; color:var(--color-midnight-blue);">' + finalQuery + '</a> ?';
        
        // Clicking the corrected query fills the input and searches
        msg.querySelector('.correction-link').addEventListener('click', function(e) {
            e.preventDefault();
            input.value = finalQuery;
            msg.remove();
            doSearch();   // search with corrected query (this time no correction)
        });

        // Allow dismissing the message
        const dismiss = document.createElement('button');
        dismiss.textContent = '✕';
        dismiss.style.cssText = 'background:none; border:none; margin-left:var(--space-sm); cursor:pointer; font-size:0.9rem;';
        dismiss.addEventListener('click', function() { msg.remove(); });
        msg.appendChild(dismiss);

        box.appendChild(msg);
    } else {
        // No correction needed – redirect immediately
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
    if (suggestionPool.length > 0) return;   // CACHE: build only once

    try {
        if (typeof SiteUtils === 'undefined') return;
        const [site, blog, pubs, portfolios] = await Promise.all([
            SiteUtils.loadJSON('/json/site-data.json', true),
            SiteUtils.loadJSON('/json/blog-list.json', true),
            SiteUtils.loadJSON('/json/publication-list.json', true),
            SiteUtils.loadJSON('/json/portfolio-list.json', true)
        ]);

        const freqMap = new Map();   // word -> frequency
        const addWords = (text) => {
            if (typeof SiteUtils.cleanSearchTerm === 'function') {
                const words = SiteUtils.cleanSearchTerm(text);
                // Single words
                words.forEach(w => freqMap.set(w, (freqMap.get(w) || 0) + 1));
                // Bigrams (two‑word phrases)
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

        // Sort by frequency (highest first)
        suggestionPool = [...freqMap.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(e => e[0]);

        // Build spell dictionary from the same frequency map (already done earlier; keep as is)
        spellDictionary = [...freqMap.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(e => e[0]);
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
