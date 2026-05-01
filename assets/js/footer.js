/**
 * ============================================
 * FOOTER.JS - RENDERS FOOTER
 * ============================================
 * 
 * DEPENDENCIES:
 * - utils.js (must be loaded FIRST)
 * - site-data.json (loaded via SiteUtils.loadJSON)
 * - main.css (provides styling classes)
 * 
 * FUNCTIONALITY:
 * - Reads navigation array from site-data.json
 * - Renders sitemap (9 main pages in same order as navigation)
 * - Renders social media icons (YouTube, Facebook, X, LinkedIn)
 * - Renders legal disclaimer with link to legal.html
 * - Renders copyright line with auto-updating year
 * - Graceful degradation if JSON fails
  * ============================================
 */

(function() {
    'use strict';
    
    // ============================================
    // PRIVATE VARIABLES
    // ============================================
    
    let navItems = null;           // Navigation array from JSON
    let footerContainer = null;     // Reference to footer element
    
    // ============================================
    // SOCIAL MEDIA CONFIGURATION
    // ============================================
    // TO ADD OR REMOVE SOCIAL ICONS:
    // - Add/remove objects in this array
    // - Each object needs: name, iconClass, url
    // - Icon classes come from Font Awesome
    // ============================================
    
    const socialLinks = [
        { name: 'YouTube', iconClass: 'fab fa-youtube', url: 'https://www.youtube.com/@YourChannel' },
        { name: 'Facebook', iconClass: 'fab fa-facebook', url: 'https://www.facebook.com/YourProfile' },
        { name: 'X', iconClass: 'fab fa-x-twitter', url: 'https://x.com/YourHandle' },
        { name: 'LinkedIn', iconClass: 'fab fa-linkedin', url: 'https://www.linkedin.com/in/YourProfile' }
    ];
    
    // ============================================
    // LEGAL DISCLAIMER TEXT
    // ============================================
    // EDIT THIS TEXT TO CHANGE THE DISCLAIMER PREVIEW
    // ============================================
    
    const legalPreviewText = 'All content on this website is for informational purposes only and represents my personal views.';
    
    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    /**
     * Gets the current year for copyright
     */
    function getCurrentYear() {
        return new Date().getFullYear();
    }
    
    /**
     * Creates the sitemap section (9 main pages)
     */
    function createSitemapSection() {
        if (!navItems || navItems.length === 0) {
            return createFallbackSitemap();
        }
        
        const section = document.createElement('div');
        section.className = 'footer-sitemap';
        
        const heading = document.createElement('h4');
        heading.textContent = 'Sitemap';
        section.appendChild(heading);
        
        const linksContainer = document.createElement('div');
        linksContainer.className = 'footer-sitemap-links';
        
        // Render all navigation items (9 main pages)
        // Newsletter uses standard link style (no pill in footer)
        navItems.forEach(item => {
            const link = document.createElement('a');
            link.href = item.url;
            link.textContent = item.label;
            linksContainer.appendChild(link);
        });
        
        section.appendChild(linksContainer);
        return section;
    }
    
    /**
     * Fallback sitemap if JSON fails to load
     */
    function createFallbackSitemap() {
        const fallbackPages = [
            { label: 'Home', url: 'index.html' },
            { label: 'Research', url: 'research.html' },
            { label: 'Publications', url: 'publications.html' },
            { label: 'Blog', url: 'blog.html' },
            { label: 'Contact', url: 'contact.html' }
        ];
        
        const section = document.createElement('div');
        section.className = 'footer-sitemap';
        
        const heading = document.createElement('h4');
        heading.textContent = 'Sitemap';
        section.appendChild(heading);
        
        const linksContainer = document.createElement('div');
        linksContainer.className = 'footer-sitemap-links';
        
        fallbackPages.forEach(item => {
            const link = document.createElement('a');
            link.href = item.url;
            link.textContent = item.label;
            linksContainer.appendChild(link);
        });
        
        section.appendChild(linksContainer);
        return section;
    }
    
    /**
     * Creates the social media icons section
     */
    function createSocialSection() {
        const section = document.createElement('div');
        section.className = 'footer-social';
        
        const heading = document.createElement('h4');
        heading.textContent = 'Connect';
        section.appendChild(heading);
        
        const iconsContainer = document.createElement('div');
        iconsContainer.className = 'social-icons';
        
        socialLinks.forEach(social => {
            const link = document.createElement('a');
            link.href = social.url;
            link.className = 'social-icon';
            link.target = '_blank';  // Open in new tab
            link.rel = 'noopener noreferrer';  // Security best practice
            link.setAttribute('aria-label', social.name);
            
            const icon = document.createElement('i');
            icon.className = social.iconClass;
            link.appendChild(icon);
            
            iconsContainer.appendChild(link);
        });
        
        section.appendChild(iconsContainer);
        return section;
    }
    
    /**
     * Creates the legal & disclaimer section
     */
    function createLegalSection() {
        const section = document.createElement('div');
        section.className = 'footer-legal';
        
        const heading = document.createElement('h4');
        heading.textContent = 'Legal & Disclaimer';
        section.appendChild(heading);
        
        const previewText = document.createElement('p');
        previewText.textContent = legalPreviewText;
        section.appendChild(previewText);
        
        const readMoreLink = document.createElement('a');
        readMoreLink.href = 'legal.html';
        readMoreLink.textContent = 'Read more >>';
        section.appendChild(readMoreLink);
        
        return section;
    }
    
    /**
     * Creates the copyright line
     */
    function createCopyrightSection() {
        const copyrightDiv = document.createElement('div');
        copyrightDiv.className = 'footer-copyright';
        
        const currentYear = getCurrentYear();
        copyrightDiv.innerHTML = `&copy; ${currentYear} Dr. Sameh Eltaybani. All rights reserved.`;
        
        return copyrightDiv;
    }
    
    /**
     * Renders the complete footer
     */
    function renderFooter() {
        if (!footerContainer) {
            console.error('[Footer] Footer container not found');
            return;
        }
        
        // Clear existing content
        footerContainer.innerHTML = '';
        
        // Create main footer wrapper
        const footer = document.createElement('footer');
        footer.className = 'footer';
        
        // Create container for grid layout
        const container = document.createElement('div');
        container.className = 'footer-container';
        
        // Add the three main sections (sitemap, social, legal)
        const sitemapSection = createSitemapSection();
        const socialSection = createSocialSection();
        const legalSection = createLegalSection();
        
        container.appendChild(sitemapSection);
        container.appendChild(socialSection);
        container.appendChild(legalSection);
        
        footer.appendChild(container);
        
        // Add copyright section
        const copyrightSection = createCopyrightSection();
        footer.appendChild(copyrightSection);
        
        footerContainer.appendChild(footer);
    }
    
    /**
     * Shows fallback footer when JSON fails
     */
    function showFallbackFooter() {
        console.warn('[Footer] Using fallback footer - no navigation data');
        
        if (!footerContainer) return;
        
        footerContainer.innerHTML = '';
        
        const footer = document.createElement('footer');
        footer.className = 'footer';
        
        const container = document.createElement('div');
        container.className = 'footer-container';
        
        // Sitemap (fallback)
        const sitemapSection = createFallbackSitemap();
        container.appendChild(sitemapSection);
        
        // Social section (always works)
        const socialSection = createSocialSection();
        container.appendChild(socialSection);
        
        // Legal section (always works)
        const legalSection = createLegalSection();
        container.appendChild(legalSection);
        
        footer.appendChild(container);
        
        const copyrightSection = createCopyrightSection();
        footer.appendChild(copyrightSection);
        
        footerContainer.appendChild(footer);
        
        // Show non-intrusive error message
        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = 'background-color: #F1D570; color: #1A2530; text-align: center; padding: 4px; font-size: 12px;';
        errorMsg.textContent = 'Footer temporarily using fallback data. Refresh the page.';
        footer.insertBefore(errorMsg, footer.firstChild);
        
        setTimeout(() => {
            errorMsg.style.opacity = '0';
            setTimeout(() => errorMsg.remove(), 500);
        }, 5000);
    }
    
    /**
     * Loads navigation data from site-data.json
     */
    async function loadFooterData() {
        try {
            // Check if SiteUtils is available
            if (typeof SiteUtils === 'undefined') {
                console.error('[Footer] utils.js not loaded. SiteUtils is undefined.');
                showFallbackFooter();
                return;
            }
            
            // Load JSON with caching
            const data = await SiteUtils.loadJSON('/json/site-data.json', true);
            
            if (data && data.navigation && Array.isArray(data.navigation)) {
                navItems = data.navigation;
                renderFooter();
                console.log('[Footer] Initialized with', navItems.length, 'navigation items');
            } else {
                console.error('[Footer] Invalid JSON structure: missing navigation array');
                showFallbackFooter();
            }
            
        } catch (error) {
            console.error('[Footer] Failed to load site-data.json:', error);
            showFallbackFooter();
        }
    }
    
    /**
     * Initializes the footer
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
        
        // Find footer container
        footerContainer = document.querySelector('[data-component="footer"]');
        
        if (!footerContainer) {
            console.error('[Footer] No footer container found with data-component="footer"');
            return;
        }
        
        // Load footer data
        await loadFooterData();
    }
    
    // ============================================
    // START INITIALIZATION
    // ============================================
    
    init();
    
})();
