/**
 * ==========================================================================
 * FILE: assets/js/navigation.js
 * PURPOSE: Dynamically fetch and render the site navigation bar.
 * ==========================================================================
 */

/**
 * ==========================================================================
 * 1. CONFIGURATION & CONSTANTS
 * ==========================================================================
 */
const NAV_CONFIG = {
    TARGET_CONTAINER_ID: 'site-navigation',
    JSON_PATH: 'json/navigation.json',
    PROFILE_IMG_PATH: 'img/profile.jpg', // Assumes image is stored in the root img/ folder
    SITE_OWNER_NAME: 'Dr. Sameh Eltaybani',
    MOBILE_MENU_TOGGLE_CLASS: 'nav-menu-open' // Class used to toggle mobile visibility
};

/**
 * ==========================================================================
 * 2. UTILITY FUNCTIONS
 * ==========================================================================
 */

/**
 * Calculates the relative path prefix (e.g., './', '../', '../../') 
 * based on the current HTML file's depth in the directory structure.
 * This ensures JSON, images, and links resolve correctly on nested pages.
 * @returns {string} The relative path prefix
 */
function getRootPrefix() {
    let path = window.location.pathname.replace(/^\/|\/$/g, '');
    
    // If we are at the root or just serving index.html natively
    if (!path || path === 'index.html' || !path.includes('/')) {
        return './';
    }

    // Calculate depth by counting folder segments
    const segments = path.split('/');
    const depth = segments.length - 1; 

    if (depth <= 0) return './';

    let prefix = '';
    for (let i = 0; i < depth; i++) {
        prefix += '../';
    }
    return prefix;
}

/**
 * Determines if a given URL matches the currently viewed page.
 * @param {string} targetUrl - The URL from the navigation data.
 * @returns {boolean} True if active, false otherwise.
 */
function isActivePage(targetUrl) {
    const currentPath = window.location.pathname;
    
    // Handle root URL defaults implicitly loading index.html
    if (targetUrl === 'index.html') {
        if (currentPath.endsWith('/') || currentPath === '' || currentPath.endsWith('index.html')) {
            return true;
        }
    }
    
    return currentPath.endsWith(targetUrl);
}

/**
 * ==========================================================================
 * 3. DATA LOADING
 * ==========================================================================
 */

/**
 * Fetches the navigation data from the JSON configuration file.
 * @param {string} rootPrefix - The calculated path to the root directory.
 * @returns {Promise<Array>} Array of navigation objects or empty array on failure.
 */
async function fetchNavigationData(rootPrefix) {
    try {
        const response = await fetch(rootPrefix + NAV_CONFIG.JSON_PATH);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to load navigation data:', error);
        return [];
    }
}

/**
 * ==========================================================================
 * 4. NAVIGATION RENDERING (DESKTOP & MOBILE)
 * ==========================================================================
 */

/**
 * Builds the DOM structure for the navigation bar based on the loaded data.
 * @param {Array} navItems - The array of navigation objects.
 * @param {string} rootPrefix - The relative path prefix for links/assets.
 */
function renderNavigation(navItems, rootPrefix) {
    const container = document.getElementById(NAV_CONFIG.TARGET_CONTAINER_ID);
    if (!container) {
        console.error(`Navigation container #${NAV_CONFIG.TARGET_CONTAINER_ID} not found.`);
        return;
    }

    // Create main semantic <nav> wrapper
    const navElement = document.createElement('nav');
    navElement.className = 'navbar';

    // Create central container (aligns with layout utilities in main.css)
    const innerContainer = document.createElement('div');
    innerContainer.className = 'container';

    // Build Left Section: Brand (Image + Name)
    const brandLink = document.createElement('a');
    brandLink.href = rootPrefix + 'index.html';
    brandLink.className = 'nav-brand';
    
    const profileImg = document.createElement('img');
    profileImg.src = rootPrefix + NAV_CONFIG.PROFILE_IMG_PATH;
    profileImg.alt = 'Profile Photo';
    profileImg.className = 'nav-profile-img';
    
    brandLink.appendChild(profileImg);
    brandLink.appendChild(document.createTextNode(NAV_CONFIG.SITE_OWNER_NAME));

    // Build Mobile Element: Hamburger Button
    const hamburgerBtn = document.createElement('button');
    hamburgerBtn.className = 'nav-hamburger';
    hamburgerBtn.setAttribute('aria-label', 'Toggle navigation menu');
    hamburgerBtn.innerHTML = '☰'; // Simple character, styled in CSS

    // Build Right Section: Navigation Menu
    const menuList = document.createElement('ul');
    menuList.className = 'nav-menu';

    // Sort items by order just in case JSON is out of sequence
    navItems.sort((a, b) => a.order - b.order);

    // Populate Menu Items
    navItems.forEach(item => {
        const listItem = document.createElement('li');
        
        const link = document.createElement('a');
        link.href = rootPrefix + item.url;
        link.textContent = item.label;
        link.className = 'nav-link';

        // Apply active state
        if (isActivePage(item.url)) {
            link.classList.add('active');
        }

        // Apply special highlighting flag (e.g., for Newsletter)
        if (item.highlighted) {
            link.classList.add('nav-link-highlight');
        }

        listItem.appendChild(link);
        menuList.appendChild(listItem);
    });

    // Assemble components into the DOM
    innerContainer.appendChild(brandLink);
    innerContainer.appendChild(hamburgerBtn);
    innerContainer.appendChild(menuList);
    navElement.appendChild(innerContainer);

    // Clear existing placeholder content and inject built navigation
    container.innerHTML = '';
    container.appendChild(navElement);

    // Attach Event Listeners after DOM insertion
    setupEventListeners(hamburgerBtn, menuList);
}

/**
 * ==========================================================================
 * 5. EVENT LISTENERS
 * ==========================================================================
 */

/**
 * Attaches necessary interactivity, such as the mobile menu toggle.
 * @param {HTMLElement} hamburgerBtn - The button controlling the mobile menu.
 * @param {HTMLElement} menuList - The list containing navigation links.
 */
function setupEventListeners(hamburgerBtn, menuList) {
    hamburgerBtn.addEventListener('click', () => {
        // Toggles display logic. (relies on inline style or external CSS class)
        // Using inline display toggle for strict vanilla JS isolated behavior, 
        // fallback to CSS rules if main.css adapts it.
        const isHidden = window.getComputedStyle(menuList).display === 'none';
        if (isHidden) {
            menuList.style.display = 'flex';
        } else {
            menuList.style.display = ''; // Reverts to CSS stylesheet definition
        }
    });

    // Handle window resize to reset mobile menu state when snapping back to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            menuList.style.display = ''; // Clear inline styles on desktop
        }
    });
}

/**
 * ==========================================================================
 * 6. INITIALIZATION
 * ==========================================================================
 */

/**
 * Main bootstrapper function. Orchestrates the loading and rendering process.
 */
async function initNavigation() {
    const rootPrefix = getRootPrefix();
    const navItems = await fetchNavigationData(rootPrefix);
    
    if (navItems && navItems.length > 0) {
        renderNavigation(navItems, rootPrefix);
    }
}

// Execute initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initNavigation);
