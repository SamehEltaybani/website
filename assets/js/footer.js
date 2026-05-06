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
        readMoreLink.textContent = 'Read more ❯❯';
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
      /**
 * Renders the complete footer with the new layout:
 *   - Horizontal social icon bar (centred, no heading)
 *   - Two equal columns (sitemap left, legal right) side‑by‑side on all screens
 *   - Copyright line
 */
        function renderFooter() {
          if (!footerContainer) {
            console.error('[Footer] Footer container not found');
            return;
          }
        
          footerContainer.innerHTML = '';
        
          // ---- MAIN FOOTER WRAPPER ----
          const footer = document.createElement('footer');
          footer.className = 'footer';
        
          // ===== 1. SOCIAL ICONS BAR (horizontal, centred) =====
          const socialBar = document.createElement('div');
          socialBar.className = 'footer-social-bar';  // new class
          socialBar.style.cssText = 'display: flex; justify-content: center; gap: var(--space-md); padding: var(--space-md) 0;';
        
          socialLinks.forEach(social => {
            const link = document.createElement('a');
            link.href = social.url;
            link.className = 'social-icon';   // reuse existing social-icon class
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.setAttribute('aria-label', social.name);
            const icon = document.createElement('i');
            icon.className = social.iconClass;
            link.appendChild(icon);
            socialBar.appendChild(link);
          });
        
          footer.appendChild(socialBar);
        
          // ===== 2. TWO‑COLUMN CONTENT (sitemap + legal) =====
          const columnsWrapper = document.createElement('div');
          columnsWrapper.className = 'footer-columns';                   // new class
          columnsWrapper.style.cssText = 'display: flex; flex-wrap: nowrap; gap: var(--space-lg); max-width: var(--container-max-width); margin: 0 auto; padding: 0 var(--container-padding);';
        
          // --- Left column: Sitemap ---
          const sitemapSection = createSitemapSection();
          sitemapSection.style.flex = '1 1 50%';
          columnsWrapper.appendChild(sitemapSection);
        
          // --- Right column: Legal ---
          const legalSection = createLegalSection();
          legalSection.style.flex = '1 1 50%';
          columnsWrapper.appendChild(legalSection);
        
          footer.appendChild(columnsWrapper);
        
          // ===== 3. COPYRIGHT (centred) =====
          const copyrightSection = createCopyrightSection();
          footer.appendChild(copyrightSection);
        
          footerContainer.appendChild(footer);
        }


    /**
     * Shows fallback footer when JSON fails
     */

          function showFallbackFooter() {
           if (!footerContainer) return;
           footerContainer.innerHTML = '';
         
           const socialBar = document.createElement('div');
           socialBar.className = 'footer-social-bar';
           socialBar.style.cssText = 'display: flex; justify-content: center; gap: var(--space-md); padding: var(--space-md) 0;';
           socialLinks.forEach(social => {
             const link = document.createElement('a');
             link.href = social.url;
             link.className = 'social-icon';
             link.target = '_blank';
             link.rel = 'noopener noreferrer';
             link.setAttribute('aria-label', social.name);
             const icon = document.createElement('i');
             icon.className = social.iconClass;
             link.appendChild(icon);
             socialBar.appendChild(link);
           });
         
           const columnsWrapper = document.createElement('div');
           columnsWrapper.className = 'footer-columns';
           columnsWrapper.style.cssText = 'display: flex; flex-wrap: nowrap; gap: var(--space-lg); max-width: var(--container-max-width); margin: 0 auto; padding: 0 var(--container-padding);';
         
           const sitemapSection = createFallbackSitemap();
           sitemapSection.style.flex = '1 1 50%';
           columnsWrapper.appendChild(sitemapSection);
         
           const legalSection = createLegalSection();
           legalSection.style.flex = '1 1 50%';
           columnsWrapper.appendChild(legalSection);
         
           const copyrightSection = createCopyrightSection();
         
           const footer = document.createElement('footer');
           footer.className = 'footer';
           footer.appendChild(socialBar);
           footer.appendChild(columnsWrapper);
           footer.appendChild(copyrightSection);
           footerContainer.appendChild(footer);
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
