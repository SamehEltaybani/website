/**
 * ============================================
 * UTILITIES.JS - SHARED TOOLBOX
 * ============================================
 * 
 * This file provides reusable functions for all pages.
 * It must be loaded BEFORE navigation.js, breadcrumbs.js, and footer.js.
 * 
 * All functions are namespaced under the global object "SiteUtils"
 * to prevent variable collisions.
 * 
 * ============================================
 */


// ============================================
// BASE PATH CONFIGURATION (reads <meta name="site-base-path">)
// ============================================
const BASE_META = document.querySelector('meta[name="site-base-path"]');
const SITE_BASE_PATH = BASE_META ? BASE_META.getAttribute('content') : '';
const BASE_PATH = SITE_BASE_PATH ? (SITE_BASE_PATH.endsWith('/') ? SITE_BASE_PATH : SITE_BASE_PATH + '/') : '';





const SiteUtils = (function() {
    'use strict';
    
    history.scrollRestoration = 'manual';   // prevent browser scroll restore

    // ============================================
    // PRIVATE VARIABLES (not accessible outside)
    // ============================================
    
    // Cache for JSON data across the entire session
    const jsonCache = new Map();
    
    // Track if DOM is already ready
    let domReady = false;
    const domReadyCallbacks = [];

    // ============================================
    // DOM READY UTILITIES
    // ============================================
    
    /**
     * Waits for the DOM to be fully loaded before executing callbacks
     * @returns {Promise} Resolves when DOM is ready
     * 
     * Usage: SiteUtils.waitForDOM().then(() => { your code here });
     */
    function waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    domReady = true;
                    resolve();
                });
            } else {
                domReady = true;
                resolve();
            }
        });
    }

    // ============================================
    // JSON LOADING & CACHING
    // ============================================
    
    /**
     * Fetches a JSON file with optional caching
     * @param {string} url - Path to JSON file (e.g., "/json/site-data.json")
     * @param {boolean} useCache - Whether to use cached version (default: true)
     * @returns {Promise<Object|null>} Parsed JSON object or null if error
     * 
     * Usage: const data = await SiteUtils.loadJSON('/json/site-data.json');
     */
    async function loadJSON(url, useCache = true) {
        // Check cache first if enabled
        if (useCache && jsonCache.has(url)) {
            console.log(`[Utils] Using cached: ${url}`);
            return jsonCache.get(url);
        }
        
        try {
             // Apply base path to absolute URLs (e.g., /json/site-data.json → /website/json/site-data.json)
                  if (url.startsWith('/') && BASE_PATH) {
                    url = BASE_PATH + url.replace(/^\//, '');
                  }
            
            console.log(`[Utils] Fetching: ${url}`);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Store in cache if caching is enabled
            if (useCache) {
                jsonCache.set(url, data);
            }
            
            return data;
            
        } catch (error) {
            console.error(`[Utils] Failed to load ${url}:`, error.message);
            return null; // Return null instead of throwing - graceful degradation
        }
    }
    
    /**
     * Clears all cached JSON data (useful for debugging)
     * Usage: SiteUtils.clearJSONCache();
     */
    function clearJSONCache() {
        jsonCache.clear();
        console.log('[Utils] JSON cache cleared');
    }

    // ============================================
    // PAGE IDENTIFICATION
    // ============================================
    
    /**
     * Gets the current page filename from the browser URL
     * @returns {string} Filename (e.g., "index.html", "research.html", "blog/blog-15.html")
     * 
     * Usage: const page = SiteUtils.getCurrentPageFilename();
     */

        function getCurrentPageFilename() {
            const path = window.location.pathname;     // e.g., /website/index.html
            let cleanPath = path;
            // Remove the base path (e.g., /website/) if it exists and is known
            if (BASE_PATH && path.startsWith(BASE_PATH)) {
                cleanPath = path.substring(BASE_PATH.length);  // becomes index.html
            } else if (path.startsWith('/')) {
                cleanPath = path.slice(1);
            }
            // Empty path or trailing slash → home page
            if (cleanPath === '' || cleanPath === '/' || cleanPath.endsWith('/')) {
                return 'index.html';
            }
            return cleanPath;
        } 
    
    /**
     * Gets the current page title from breadcrumb hierarchy data
     * @param {Array} hierarchy - The breadcrumbHierarchy array from site-data.json
     * @returns {string} Page title or fallback
     * 
     * Usage: const title = SiteUtils.getCurrentPageTitle(siteData.breadcrumbHierarchy);
     */
    function getCurrentPageTitle(hierarchy) {
        const currentFile = getCurrentPageFilename();
        const page = hierarchy.find(item => item.filename === currentFile);
        
        if (page && page.title) {
            return page.title;
        }
        
        // Fallback: convert filename to title case
        const filename = currentFile.split('/').pop().replace('.html', '');
        return filename.charAt(0).toUpperCase() + filename.slice(1);
    }

    // ============================================
    // INPUT SAFETY
    // ============================================
    
    /**
     * Escapes HTML special characters to prevent XSS attacks
     * @param {string} text - Unsafe user input
     * @returns {string} Safe HTML-escaped string
     * 
     * Usage: const safe = SiteUtils.escapeHTML(userInput);
     */
    function escapeHTML(text) {
        if (!text) return '';
        
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        
        return String(text).replace(/[&<>"'/`=]/g, function(char) {
            return map[char];
        });
    }

    // ============================
    // PERFORMANCE UTILITIES
    // ============================
    
    /**
     * Debounces a function to prevent excessive calls
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds (default: 300)
     * @returns {Function} Debounced function
     * 
     * Usage: const debouncedSearch = SiteUtils.debounce(searchFunction, 300);
     */
    function debounce(func, delay = 300) {
        let timeoutId;
        
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }
    
    /**
     * Throttles a function (limits to once per interval)
     * @param {Function} func - Function to throttle
     * @param {number} limit - Minimum time between executions in milliseconds
     * @returns {Function} Throttled function
     * 
     * Usage: const throttledScroll = SiteUtils.throttle(scrollHandler, 100);
     */
    function throttle(func, limit = 100) {
        let inThrottle;
        
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    // ============================================
    // ELEMENT CREATION HELPERS
    // ============================================
    
    /**
     * Creates a DOM element with classes and attributes
     * @param {string} tag - HTML tag name (e.g., 'div', 'button')
     * @param {Object} options - Options object
     * @returns {HTMLElement} Created element
     * 
     * Usage: const card = SiteUtils.createElement('div', {
     *   className: 'card',
     *   attributes: { 'data-id': '123' },
     *   children: [titleElement, descriptionElement]
     * });
     */
    function createElement(tag, options = {}) {
        const element = document.createElement(tag);
        
        // Add classes
        if (options.className) {
            element.className = options.className;
        }
        
        // Add text content
        if (options.text) {
            element.textContent = options.text;
        }
        
        // Add HTML content (use carefully - avoid XSS)
        if (options.html) {
            element.innerHTML = options.html;
        }
        
        // Add attributes
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
        
        // Add datasets
        if (options.dataset) {
            Object.entries(options.dataset).forEach(([key, value]) => {
                element.dataset[key] = value;
            });
        }
        
        // Append children
        if (options.children && Array.isArray(options.children)) {
            options.children.forEach(child => {
                if (child instanceof HTMLElement) {
                    element.appendChild(child);
                }
            });
        }
        
        return element;
    }

    // ============================================
    // PUBLIC API
    // ============================================
    
    // ============================================
// SIMPLE STEMMER & SEARCH HELPERS
// ============================================

/**
 * A very simple English stemmer that removes common suffixes.
 * It helps match "nursing", "nurse", "nurses" etc.
 * @param {string} word - The word to stem
 * @returns {string} The stemmed word
 */
function stem(word) {
    if (!word || word.length < 3) return word;
    let w = word.toLowerCase();
    // Remove common suffixes (order matters)
    const suffixes = ['ing', 'ment', 'ness', 'tion', 'ence', 'ance', 'able', 'ible', 'ly', 'ed', 's'];
    for (let i = 0; i < suffixes.length; i++) {
        const suffix = suffixes[i];
        if (w.endsWith(suffix) && w.length - suffix.length >= 3) {
            w = w.slice(0, -suffix.length);
            break;   // stop after first suffix removal to avoid over-stemming
        }
    }
    return w;
}

/**
 * Prepares a string for autocomplete suggestions:
 * - converts to lowercase
 * - removes punctuation
 * - splits into words
 * - ignores short words (< 3 chars) and common stop words
 * @param {string} text - The raw text
 * @returns {string[]} Clean array of words
 */
function cleanSearchTerm(text) {
    if (!text) return [];
    // Split on whitespace first
    const rawWords = text.toLowerCase().split(/\s+/);
    const stopWords = new Set([
        'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can',
        'had', 'her', 'was', 'one', 'our', 'out', 'has', 'have', 'this',
        'that', 'with', 'from', 'they', 'will', 'their', 'them', 'than',
        'then', 'about', 'which', 'also', 'into', 'its', 'may', 'such',
        'over', 'new', 'use', 'been', 'who', 'how', 'what', 'when'
    ]);
    const cleaned = rawWords.map(w => {
        // Remove punctuation only at the start and end of the word, keep hyphens and apostrophes inside
        let trimmed = w.replace(/^[^\w]+/, '').replace(/[^\w]+$/, '');
        // Remove words that became empty after trimming
        return trimmed;
    }).filter(w => w.length >= 3 && !stopWords.has(w));
    return cleaned;
}


// ============================================
// SCROLL TO TOP ON PAGE REFRESH
// ============================================

    
// Scroll to top on every page load
window.addEventListener('load', function() {
    window.scrollTo(0, 0);
});



// ============================================
// BACK TO TOP BUTTON (created once, works everywhere)
// ============================================

    (function() {
    var btn = document.getElementById('backToTop');
    if (!btn) {
        btn = document.createElement('div');
        btn.id = 'backToTop';
        btn.className = 'back-to-top';
        btn.innerHTML = '<span class="back-to-top-icon"><i class="fas fa-circle-up"></i></span><span class="back-to-top-text">To Top</span>';
        document.body.appendChild(btn);

        btn.addEventListener('pointerdown', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', SiteUtils.throttle(function() {
            if (window.scrollY > 300) {
                btn.style.display = 'flex';
            } else {
                btn.style.display = 'none';
            }
        }, 100));
    }
})();
// ============================================


    
return {
    // DOM utilities
    waitForDOM,
    // JSON utilities
    loadJSON,
    clearJSONCache,
    // Page identification
    getCurrentPageFilename,
    getCurrentPageTitle,
    // Security
    escapeHTML,
    // Performance
    debounce,
    throttle,
    // DOM helpers
    createElement,
    // Search helpers  
    stem,
    cleanSearchTerm
};

    
    
})();

// ============================================
// AUTO-INITIALIZATION (runs immediately)
// ============================================

// Make SiteUtils available globally (already done by const declaration)
// Log confirmation (only in development - can be removed for production)
console.log('[Utils] SiteUtils loaded successfully. Available functions:', Object.keys(SiteUtils));

// ============================================
// END OF THE utils.js FILE
// ============================================
