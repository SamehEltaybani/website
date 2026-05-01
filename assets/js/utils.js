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
        const path = window.location.pathname;
        
        // Remove leading slash if present
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        
        // If path is empty (root) or just a slash, return index.html
        if (cleanPath === '' || cleanPath === '/') {
            return 'index.html';
        }
        
        // Extract just the filename part (handle subdirectories like blog/blog-15.html)
        // We want the full path relative to root, not just the filename
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
    
    // Return only the functions that should be accessible
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
        createElement
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
