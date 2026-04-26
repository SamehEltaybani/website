/**
 * ==========================================================================
 * FILE: assets/js/footer.js
 * PURPOSE: Dynamically fetch and render the site footer on all pages.
 * ==========================================================================
 */

/**
 * ==========================================================================
 * 1. CONFIGURATION & CONSTANTS
 * ==========================================================================
 */
const FOOTER_CONFIG = {
    TARGET_CONTAINER_ID: 'site-footer',
    SITE_OWNER_NAME: 'Dr. Sameh Eltaybani',
    LEGAL_PAGE_URL: 'legal.html'
};

/**
 * ==========================================================================
 * 2. FOOTER DATA DEFINITIONS
 * ==========================================================================
 * Centralized data for easy future edits.
 */

// Social Media Links
// Note: 'iconClass' is intended to hook into CSS classes (e.g., FontAwesome or custom CSS)
const SOCIAL_MEDIA_DATA = [
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/yourprofile', iconClass: 'icon-linkedin' },
    { platform: 'Twitter', url: 'https://twitter.com/yourprofile', iconClass: 'icon-twitter' },
    { platform: 'Google Scholar', url: 'https://scholar.google.com/citations?user=yourid', iconClass: 'icon-scholar' },
    { platform: 'ResearchGate', url: 'https://researchgate.net/profile/yourprofile', iconClass: 'icon-researchgate' },
    { platform: 'GitHub', url: 'https://github.com/yourprofile', iconClass: 'icon-github' }
];

// Sitemap Links (Matches Navigation)
const SITEMAP_DATA = [
    { label: 'Home', url: 'index.html' },
    { label: 'Research', url: 'research.html' },
    { label: 'Publications', url: 'publications.html' },
    { label: 'Data Analysis', url: 'data-analysis.html' },
    { label: 'Teaching', url: 'teaching.html' },
    { label: 'Portfolios', url: 'portfolios.html' },
    { label: 'Blog', url: 'blog.html' },
    { label: 'Contact', url: 'contact.html' },
    { label: 'Newsletter', url: 'newsletter.html' }
];

// Legal & Professional Disclaimer Text
const DISCLAIMER_TEXT = "The content provided on this website is for informational and educational purposes only. It does not constitute professional medical, legal, or financial advice. Views expressed are solely my own and do not necessarily reflect those of my employers, affiliated institutions, or organizations.";

/**
 * ==========================================================================
 * 3. UTILITY HELPERS
 * ==========================================================================
 */

/**
 * Calculates the relative path prefix to the root directory (e.g., '../')
 * Ensures links work correctly on nested pages.
 * @returns {string} The relative path prefix
 */
function getRootPrefix() {
    const path = window.location.pathname.replace(/^\/|\/$/g, '');
    if (!path || path === 'index.html' || !path.includes('/')) return './';
    const depth = path.split('/').length - 1;
    return '../'.repeat(depth);
}

/**
 * ==========================================================================
 * 4. DOM CONSTRUCTION HELPERS
 * ==========================================================================
 */

/**
 * Builds the Social Media section.
 * @returns {HTMLElement} The social media container element.
 */
function buildSocialSection() {
    const section = document.createElement('div');
    section.className = 'footer-section footer-social';
    
    const heading = document.createElement('h4');
    heading.textContent = 'Connect';
    section.appendChild(heading);

    const iconContainer = document.createElement('div');
    iconContainer.className = 'social-icon-wrapper d-flex flex-wrap';

    SOCIAL_MEDIA_DATA.forEach(social => {
        const link = document.createElement('a');
        link.href = social.url;
        link.className = 'social-icon';
        link.setAttribute('aria-label', social.platform);
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer'); // Security for external links

        // Use a span for the icon hook (styled in CSS)
        const icon = document.createElement('span');
        icon.className = social.iconClass;
        // Fallback text hidden by CSS can be added here if needed
        link.appendChild(icon);
        
        iconContainer.appendChild(link);
    });

    section.appendChild(iconContainer);
    return section;
}

/**
 * Builds the Sitemap section.
 * @param {string} rootPrefix - The calculated path to the root directory.
 * @returns {HTMLElement} The sitemap container element.
 */
function buildSitemapSection(rootPrefix) {
    const section = document.createElement('div');
    section.className = 'footer-section footer-sitemap';
    
    const heading = document.createElement('h4');
    heading.textContent = 'Sitemap';
    section.appendChild(heading);

    const list = document.createElement('ul');

    SITEMAP_DATA.forEach(item => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = rootPrefix + item.url;
        link.textContent = item.label;
        listItem.appendChild(link);
        list.appendChild(listItem);
    });

    section.appendChild(list);
    return section;
}

/**
 * Builds the Legal & Disclaimer section.
 * @param {string} rootPrefix - The calculated path to the root directory.
 * @returns {HTMLElement} The disclaimer container element.
 */
function buildDisclaimerSection(rootPrefix) {
    const section = document.createElement('div');
    section.className = 'footer-section footer-disclaimer';
    
    const heading = document.createElement('h4');
    heading.textContent = 'Disclaimer';
    section.appendChild(heading);

    const textPara = document.createElement('p');
    textPara.className = 'footer-disclaimer-text';
    textPara.textContent = DISCLAIMER_TEXT;
    section.appendChild(textPara);

    const readMoreLink = document.createElement('a');
    readMoreLink.href = rootPrefix + FOOTER_CONFIG.LEGAL_PAGE_URL;
    readMoreLink.className = 'footer-read-more';
    readMoreLink.textContent = 'Read more >>';
    section.appendChild(readMoreLink);

    return section;
}

/**
 * Builds the Copyright line.
 * @returns {HTMLElement} The copyright container element.
 */
function buildCopyrightSection() {
    const section = document.createElement('div');
    section.className = 'footer-copyright';
    
    const currentYear = new Date().getFullYear();
    section.innerHTML = `&copy; ${currentYear} ${FOOTER_CONFIG.SITE_OWNER_NAME}. All rights reserved.`;
    
    return section;
}

/**
 * ==========================================================================
 * 5. FOOTER RENDERING LOGIC
 * ==========================================================================
 */

/**
 * Orchestrates the creation of all footer sections and injects them into the DOM.
 */
function renderFooter() {
    const container = document.getElementById(FOOTER_CONFIG.TARGET_CONTAINER_ID);
    
    // Fail silently if placeholder does not exist
    if (!container) return;

    const rootPrefix = getRootPrefix();

    // Create main semantic footer wrapper
    const footerElement = document.createElement('footer');
    footerElement.className = 'site-footer';

    // Create central container
    const innerContainer = document.createElement('div');
    innerContainer.className = 'container';

    // Create grid for the first 3 conceptual sections
    const gridContainer = document.createElement('div');
    gridContainer.className = 'footer-grid';

    // Append conceptual sections to grid
    gridContainer.appendChild(buildSocialSection());
    gridContainer.appendChild(buildSitemapSection(rootPrefix));
    gridContainer.appendChild(buildDisclaimerSection(rootPrefix));

    // Assemble components into the inner container
    innerContainer.appendChild(gridContainer);
    innerContainer.appendChild(buildCopyrightSection()); // Copyright goes below the grid

    footerElement.appendChild(innerContainer);

    // Clear existing content and inject
    container.innerHTML = '';
    container.appendChild(footerElement);
}

/**
 * ==========================================================================
 * 6. INITIALIZATION
 * ==========================================================================
 */

/**
 * Main bootstrapper function.
 */
function initFooter() {
    renderFooter();
}

// Execute initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initFooter);
