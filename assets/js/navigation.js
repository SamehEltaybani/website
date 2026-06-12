/**
 * ============================================
 * NAVIGATION.JS - RENDERS NAVIGATION BAR
 * ============================================
 * 
 * DEPENDENCIES:
 * - utils.js (must be loaded FIRST)
 * - site-data.json (loaded via SiteUtils.loadJSON)
 * - main.css (provides styling classes)
 * 
 * FUNCTIONALITY:
 * - Renders navigation bar from site-data.json
 * - Highlights current page
 * - Handles mobile hamburger menu
 * - Responsive behavior (desktop ↔ mobile)
 * - Graceful degradation if JSON fails
 * 
 * Last updated: 2026-04-30
 * ============================================
 */

(function() {
    'use strict';
    function preventPageScroll(e) { e.stopPropagation(); }
    
    // ============================================
    // PRIVATE VARIABLES
    // ============================================
    
    let navData = null;           // Stores navigation array from JSON
    let currentPage = '';         // Current page filename
    let isMobileMenuOpen = false;  // Track mobile menu state
    let mobileMenuElement = null;   // Reference to mobile menu DOM element
    let mobileOverlayElement = null; // Dark overlay behind the menu
    
    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    /**
     * Gets the current page filename from utils.js
     * Falls back to window.location if utils not available
     */
    function getCurrentPage() {
        if (typeof SiteUtils !== 'undefined' && SiteUtils.getCurrentPageFilename) {
            return SiteUtils.getCurrentPageFilename();
        }
        // Fallback if utils.js not loaded
        const path = window.location.pathname;
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        return cleanPath === '' || cleanPath === '/' ? 'index.html' : cleanPath;
    }
    
    /**
     * Checks if a navigation item is the current page
     */
    function isActivePage(itemUrl) {
    // Map portfolio sub‑pages to their parent page for highlighting
    let effectivePage = currentPage;
    const portfolioMap = {
        'research-portfolio.html': 'research.html',
        'teaching-portfolio.html': 'teaching.html',
        'data-analysis-portfolio.html': 'data-analysis.html'
    };
    if (portfolioMap[effectivePage]) {
        effectivePage = portfolioMap[effectivePage];
    }

    if (itemUrl === 'index.html') {
        return effectivePage === 'index.html' || effectivePage === '';
    }
    return effectivePage === itemUrl;
}
    
    /**
     * Creates a navigation link element
     */
    
    function createNavLink(item, isMobile = false) {
    const isActive = isActivePage(item.url);
    const isHighlighted = item.isHighlighted === true;

    let linkClass = isMobile ? 'mobile-nav-link' : 'nav-link';
    if (isHighlighted && !isMobile) {
        linkClass = 'nav-link-highlight';
    } else if (isHighlighted && isMobile) {
        linkClass = 'mobile-nav-link mobile-nav-link-highlight';
    }

    const link = document.createElement('a');
    link.href = item.url;
    link.className = linkClass;
    if (isActive) {
        link.classList.add('active');
    }

    // ---- ADD ICONS TO MOBILE LINKS ONLY ----
    if (isMobile) {
        const iconMap = {
            'Home': 'fas fa-home',
            'Research': 'fas fa-brain',
            'Publications': 'fas fa-file-alt',
            'Data Analysis': 'fas fa-chart-bar',
            'Teaching': 'fas fa-chalkboard-teacher',
            'Portfolios': 'fas fa-briefcase',
            'Blog': 'fas fa-blog',
            'Contact': 'fas fa-envelope',
            'Newsletter': 'fas fa-newspaper'
        };
        if (iconMap[item.label]) {
            link.innerHTML = '<i class="' + iconMap[item.label] + ' fa-fw" style="margin-right: 0.5rem;"></i>' + item.label;
        } else {
            link.textContent = item.label;
        }
    } else {
        link.textContent = item.label;
    }
    // -----------------------------------------

    if (isMobile) {
        link.addEventListener('click', function() {
            closeMobileMenu();
        });
    }

    return link;
}

   
    /**
     * Creates the desktop navigation links container
     */
    function renderDesktopNav(navItems) {
        const navRight = document.querySelector('.navbar-right');
        if (!navRight) return;
        
        // Clear existing content
        navRight.innerHTML = '';
        
        // Add each navigation link
        navItems.forEach(item => {
            const link = createNavLink(item, false);
            navRight.appendChild(link);
        });
    }
    
    /**
     * Creates the mobile hamburger menu
     */

function renderMobileMenu(navItems) {
    // Create or get mobile menu container
    let mobileMenu = document.querySelector('.mobile-menu');
    if (!mobileMenu) {
        mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        document.body.appendChild(mobileMenu);
    }
    mobileMenuElement = mobileMenu;

    // Clear existing content
    mobileMenu.innerHTML = '';

    // ---- STICKY CLOSE BUTTON (top‑right) ----
    const closeHeader = document.createElement('div');
    closeHeader.style.cssText = `
        position: sticky;
        top: 0;
        z-index: 2;
        display: flex;
        justify-content: flex-end;       /* push to the right edge */
        padding: var(--space-sm);
        background-color: var(--color-white);
        border-bottom: 1px solid var(--color-border);
    `;

    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        padding: 4px 0;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        color: var(--color-midnight-blue);
        font-size: var(--font-size-sm);
        line-height: 1.2;
    `;
    closeBtn.innerHTML = '<i class="fas fa-times" style="font-size:1.2rem; margin-bottom:2px;"></i><span>Close</span>';
    closeBtn.addEventListener('click', closeMobileMenu);

    closeHeader.appendChild(closeBtn);
    mobileMenu.appendChild(closeHeader);
    // ---------------------------------------

    // Add each navigation link (with icons on mobile)
    navItems.forEach(item => {
        const link = createNavLink(item, true);
        mobileMenu.appendChild(link);
    });


       
    // Add some padding at the bottom so the last item isn’t hidden behind the address bar
    const spacer = document.createElement('div');
    spacer.style.paddingBottom = 'var(--space-md)';
    mobileMenu.appendChild(spacer);
}

    


    
    
    /**
     * Opens the mobile menu
     */
    function openMobileMenu() {
        if (!mobileMenuElement) return;
        mobileMenuElement.classList.add('open');
        isMobileMenuOpen = true;
         if (mobileOverlayElement) {
        mobileOverlayElement.style.display = 'block';
    }
        mobileMenuElement.addEventListener('touchmove', preventPageScroll, { passive: false });
        document.body.style.overflow = 'hidden'; // Prevent background scrolling (Add "//" at the beginning to stop the code, which will lead to permitting scrolling)
    }
    
    /**
     * Closes the mobile menu
     */
    function closeMobileMenu() {
        if (!mobileMenuElement) return;
        mobileMenuElement.classList.remove('open');
        mobileMenuElement.removeEventListener('touchmove', preventPageScroll);
        isMobileMenuOpen = false;
        if (mobileOverlayElement) {
        mobileOverlayElement.style.display = 'none';
    }
        document.body.style.overflow = ''; // This is related to "prevent background scrolling" above. (it is unchanged [only the above sentence is changed])
    }
    
    /**
     * Toggles the mobile menu
     */
    function toggleMobileMenu() {
        if (isMobileMenuOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }
    
    /**
     * Sets up hamburger button event listeners
     */
    function setupHamburgerButton() {
    // Create the dark overlay behind the menu (once)
    if (!mobileOverlayElement) {
        mobileOverlayElement = document.createElement('div');
        mobileOverlayElement.className = 'mobile-menu-overlay';
        document.body.appendChild(mobileOverlayElement);

        // Clicking the overlay closes the menu
        mobileOverlayElement.addEventListener('click', closeMobileMenu);
    }
    
        
        const hamburger = document.querySelector('.hamburger');
        if (!hamburger) return;
        
        // Remove existing listener to avoid duplicates
        const newHamburger = hamburger.cloneNode(true);
        hamburger.parentNode.replaceChild(newHamburger, hamburger);
        
        newHamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMobileMenu();
        });
    }
    
    /**
     * Sets up responsive behavior (matchMedia)
     */
    function setupResponsiveBehavior() {
        const mediaQuery = window.matchMedia('(min-width: 1101px)');
        
        function handleScreenChange(e) {
            if (e.matches) {
                // Desktop mode: force close mobile menu
                if (isMobileMenuOpen) {
                    closeMobileMenu();
                }
            }
        }
        
        // Call once on load
        handleScreenChange(mediaQuery);
        
        // Listen for changes
        mediaQuery.addEventListener('change', handleScreenChange);
    }
    
    /**
     * Sets up click outside to close mobile menu
     */
    function setupClickOutside() {
        document.addEventListener('click', function(event) {
            if (!isMobileMenuOpen) return;
            
            const hamburger = document.querySelector('.hamburger');
            const isClickOnHamburger = hamburger && hamburger.contains(event.target);
            const isClickOnMenu = mobileMenuElement && mobileMenuElement.contains(event.target);
            
            if (!isClickOnHamburger && !isClickOnMenu) {
                closeMobileMenu();
            }
        });
    }
    
    /**
     * Sets up Escape key to close mobile menu
     */
    function setupEscapeKey() {
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && isMobileMenuOpen) {
                closeMobileMenu();
            }
        });
    }
    
    /**
     * Creates the profile section (left side of navbar)
     */
    function setupProfileSection() {
        const navbarLeft = document.querySelector('.navbar-left');
        if (!navbarLeft) return;
        
        // Clear existing content
        navbarLeft.innerHTML = '';
        
        // Create profile image
        const profileImg = document.createElement('img');
        profileImg.src = 'assets/img/profile.webp';
        profileImg.alt = 'Dr. Sameh Eltaybani';
        profileImg.className = 'profile-image';
        
        // Create profile name
        const profileName = document.createElement('span');
        profileName.className = 'profile-name';
        profileName.textContent = 'Sameh Eltaybani';
        
        // Add truncation for mobile (handled by CSS)
        
        // Wrap the image and name in a clickable link to the Home page
const homeLink = document.createElement('a');
homeLink.href = 'index.html';
homeLink.style.textDecoration = 'none';
homeLink.style.color = 'inherit';
homeLink.style.display = 'flex';
homeLink.style.alignItems = 'center';
homeLink.style.gap = 'var(--space-sm)';
homeLink.appendChild(profileImg);
homeLink.appendChild(profileName);
navbarLeft.appendChild(homeLink);
    }
    
    /**
     * Renders the complete navigation bar
     */
    function renderNavigation() {
        if (!navData || !navData.navigation) {
            console.error('[Navigation] No navigation data available');
            showFallbackNavigation();
            return;
        }
        
        const navItems = navData.navigation;
        
        // Setup profile section
        setupProfileSection();
        
        // Render desktop navigation
        renderDesktopNav(navItems);
        
        // Render mobile menu
        renderMobileMenu(navItems);
        
        // Setup interactive features
        setupHamburgerButton();
        setupResponsiveBehavior();
        setupClickOutside();
        setupEscapeKey();
    }
    
    /**
     * Fallback navigation if JSON fails to load
     */
    function showFallbackNavigation() {
        console.warn('[Navigation] Using fallback navigation');
        
        // Show visible but non-intrusive message
        const navBar = document.querySelector('.navbar');
        if (navBar && !document.querySelector('.nav-fallback-message')) {
            const message = document.createElement('div');
            message.className = 'nav-fallback-message';
            message.textContent = 'Navigation temporarily unavailable. Refresh the page.';
            message.style.cssText = 'background-color: #F1D570; color: #1A2530; text-align: center; padding: 4px; font-size: 12px; position: absolute; top: 100%; left: 0; right: 0;';
            navBar.style.position = 'relative';
            navBar.appendChild(message);
        }
        
        // Hard-coded fallback navigation items
        const fallbackItems = [
            { label: 'Home', url: 'index.html', isHighlighted: false },
            { label: 'Blog', url: 'blog.html', isHighlighted: false },
            { label: 'Contact', url: 'contact.html', isHighlighted: false }
        ];
        
        navData = { navigation: fallbackItems };
        renderNavigation();
    }
    
    /**
     * Loads navigation data from site-data.json
     */
    async function loadNavigationData() {
        try {
            // Check if SiteUtils is available
            if (typeof SiteUtils === 'undefined') {
                console.error('[Navigation] utils.js not loaded. SiteUtils is undefined.');
                showFallbackNavigation();
                return;
            }
            
            // Load JSON with caching
            const data = await SiteUtils.loadJSON('/json/site-data.json', true);
            
            if (data && data.navigation && Array.isArray(data.navigation)) {
                navData = data;
                renderNavigation();
            } else {
                console.error('[Navigation] Invalid JSON structure: missing navigation array');
                showFallbackNavigation();
            }
            
        } catch (error) {
            console.error('[Navigation] Failed to load site-data.json:', error);
            showFallbackNavigation();
        }
    }
    
    /**
     * Initializes the navigation bar
     */
    async function init() {
        // Wait for DOM to be ready
        if (typeof SiteUtils !== 'undefined' && SiteUtils.waitForDOM) {
            await SiteUtils.waitForDOM();
        } else {
            // Fallback if utils.js not loaded
            await new Promise(resolve => {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', resolve);
                } else {
                    resolve();
                }
            });
        }
        
        // Get current page
        currentPage = getCurrentPage();
        
        // Load navigation data
        await loadNavigationData();
        
        console.log('[Navigation] Initialized. Current page:', currentPage);
    }
    
    // ============================================
    // START INITIALIZATION
    // ============================================
    
    init();
    
})();
