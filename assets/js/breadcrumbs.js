/**
 * ==========================================================================
 * FILE: assets/js/breadcrumbs.js
 * PURPOSE: Dynamically render hierarchical breadcrumb trails across the site.
 * ==========================================================================
 */

/**
 * ==========================================================================
 * 1. CONFIGURATION & CONSTANTS
 * ==========================================================================
 */
const BREADCRUMB_CONFIG = {
    TARGET_CONTAINER_ID: 'site-breadcrumbs',
    HOME_LABEL: 'Home',
    HOME_URL: 'index.html'
};

/**
 * ==========================================================================
 * 2. PAGE HIERARCHY MAPPING (EDIT THIS SECTION)
 * ==========================================================================
 * Define the breadcrumb trail for specific pages here.
 * You do NOT need to include "Home" - it is added automatically.
 * * Format:
 * 'page-filename.html': [
 * { label: 'Parent Page', url: 'parent.html' }, // Clickable middle item
 * { label: 'Current Page' }                     // Unclickable last item
 * ]
 */
const PAGE_HIERARCHIES = {
    // Main Pages
    'research.html': [{ label: 'Research' }],
    'publications.html': [{ label: 'Publications' }],
    'data-analysis.html': [{ label: 'Data Analysis' }],
    'teaching.html': [{ label: 'Teaching' }],
    'portfolios.html': [{ label: 'Portfolios' }],
    'blog.html': [{ label: 'Blog' }],
    'contact.html': [{ label: 'Contact' }],
    'newsletter.html': [{ label: 'Newsletter' }],
    
    // Example of a sub-page hierarchy
    'sample-portfolio-project.html': [
        { label: 'Portfolios', url: 'portfolios.html' },
        { label: 'Sample Project' }
    ]
};

/**
 * ==========================================================================
 * 3. UTILITY HELPERS
 * ==========================================================================
 */

/**
 * Calculates the relative path prefix to the root directory (e.g., '../')
 * @returns {string} The relative path prefix
 */
function getRootPrefix() {
    const path = window.location.pathname.replace(/^\/|\/$/g, '');
    if (!path || path === 'index.html' || !path.includes('/')) return './';
    const depth = path.split('/').length - 1;
    return '../'.repeat(depth);
}

/**
 * Extracts the current filename from the URL to look up in the configuration.
 * @returns {string} The current page filename or path
 */
function getCurrentPageKey() {
    const path = window.location.pathname;
    const segments = path.split('/');
    let key = segments.pop();
    
    // Default to index.html if pointing at a directory
    if (!key) key = 'index.html';
    return key;
}

/**
 * ==========================================================================
 * 4. PAGE HIERARCHY RESOLUTION & BLOG ARTICLE HANDLING
 * ==========================================================================
 */

/**
 * Determines the final breadcrumb array for the current page.
 * Handles exact matches, blog articles, and a generic fallback.
 * @returns {Array} Array of breadcrumb objects { label, url }
 */
function resolveBreadcrumbTrail() {
    const rootPrefix = getRootPrefix();
    const pageKey = getCurrentPageKey();
    
    // Always start with Home
    const trail = [
        { label: BREADCRUMB_CONFIG.HOME_LABEL, url: rootPrefix + BREADCRUMB_CONFIG.HOME_URL }
    ];

    // If on the home page itself, just return Home (or empty if you prefer no breadcrumb on home)
    if (pageKey === 'index.html' || pageKey === '') {
        return trail;
    }

    // Check if there is a predefined hierarchy in PAGE_HIERARCHIES
    if (PAGE_HIERARCHIES[pageKey]) {
        return trail.concat(PAGE_HIERARCHIES[pageKey]);
    }

    // Future-Proofing for Blog Articles / Dynamic Content
    // Assumes an external script might define window.ARTICLE_DATA
    if (window.ARTICLE_DATA) {
        const articleLabel = window.ARTICLE_DATA.shortTitle || window.ARTICLE_DATA.title;
        trail.push({ label: 'Blog', url: rootPrefix + 'blog.html' }); // Parent
        trail.push({ label: articleLabel }); // Current article
        return trail;
    }

    // Fallback: If page is unknown and no article data exists, use document title
    const fallbackTitle = document.title || 'Current Page';
    trail.push({ label: fallbackTitle });

    return trail;
}

/**
 * ==========================================================================
 * 5. BREADCRUMB DOM CREATION
 * ==========================================================================
 */

/**
 * Generates the HTML structure for the breadcrumbs and injects it into the container.
 * @param {Array} trail - The array of breadcrumb objects.
 * @param {string} rootPrefix - The calculated path to the root directory.
 */
function renderBreadcrumbs(trail, rootPrefix) {
    const container = document.getElementById(BREADCRUMB_CONFIG.TARGET_CONTAINER_ID);
    
    // Fail silently if container does not exist
    if (!container) return;

    // Create structural wrappers
    const navBar = document.createElement('nav');
    navBar.className = 'breadcrumb-bar';
    navBar.setAttribute('aria-label', 'Breadcrumb');

    const innerContainer = document.createElement('div');
    innerContainer.className = 'container breadcrumb-container';

    // Optional: Space reserved for back arrow logic (as defined in CSS)
    const backControl = document.createElement('div');
    backControl.className = 'breadcrumb-back-control';
    innerContainer.appendChild(backControl);

    const list = document.createElement('ul');
    list.className = 'breadcrumb-list';

    // Build list items
    trail.forEach((item, index) => {
        const isLast = index === trail.length - 1;
        
        const listItem = document.createElement('li');
        listItem.className = 'breadcrumb-item';

        if (isLast || !item.url) {
            // Last item or item with no URL is text-only (non-clickable)
            const textSpan = document.createElement('span');
            textSpan.className = 'breadcrumb-link current';
            textSpan.setAttribute('aria-current', 'page');
            textSpan.textContent = item.label;
            listItem.appendChild(textSpan);
        } else {
            // Clickable middle/start item
            const link = document.createElement('a');
            link.className = 'breadcrumb-link';
            
            // Format URL with root prefix if it's a relative internal link
            const isExternal = item.url.startsWith('http');
            link.href = isExternal ? item.url : (rootPrefix + item.url.replace(/^\.\//, ''));
            link.textContent = item.label;
            
            listItem.appendChild(link);
        }

        list.appendChild(listItem);
    });

    // Assemble and inject
    innerContainer.appendChild(list);
    navBar.appendChild(innerContainer);
    
    container.innerHTML = ''; // Clear placeholder
    container.appendChild(navBar);
}

/**
 * ==========================================================================
 * 6. INITIALIZATION LOGIC
 * ==========================================================================
 */

/**
 * Main bootstrapper function.
 */
function initBreadcrumbs() {
    const trail = resolveBreadcrumbTrail();
    const rootPrefix = getRootPrefix();
    renderBreadcrumbs(trail, rootPrefix);
}

// Execute initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initBreadcrumbs);
