/**
 * ============================================
 * BREADCRUMBS.JS - RENDERS BREADCRUMB BAR
 * ============================================
 * 
 * DEPENDENCIES:
 * - utils.js (must be loaded FIRST)
 * - site-data.json (loaded via SiteUtils.loadJSON)
 * - main.css (provides styling classes)
 * 
 * FUNCTIONALITY:
 * - Reads breadcrumbHierarchy from site-data.json
 * - Traverses parent links to build full path
 * - Renders breadcrumb bar with clickable links
 * - Mobile: single line with left arrow + modal sheet for full hierarchy
 * - Graceful degradation if JSON fails or page missing
 * 
 * Last updated: 2026-04-30
 * ============================================
 */

(function() {
    'use strict';
    
    // ============================================
    // PRIVATE VARIABLES
    // ============================================
    
    let hierarchyData = null;      // breadcrumbHierarchy array from JSON
    let currentPage = '';          // Current page filename
    let breadcrumbPath = [];        // Array of { title, filename, isClickable }
    let isModalOpen = false;        // Track mobile modal state
    
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
     * Finds a page entry in the hierarchy by filename
     */
    function findPageEntry(filename) {
        if (!hierarchyData) return null;
        return hierarchyData.find(item => item.filename === filename);
    }
    
    /**
     * Builds the breadcrumb path by traversing parent links
     * Returns array from Home to current page
     */
    function buildBreadcrumbPath() {
        const path = [];
        
        // Find current page in hierarchy
        let currentEntry = findPageEntry(currentPage);
        
        // If current page not found in hierarchy, create fallback
        if (!currentEntry) {
            console.warn(`[Breadcrumbs] Page "${currentPage}" not found in breadcrumbHierarchy`);
            // Fallback: Home > Current Page Title (from filename)
            const pageTitle = currentPage.replace('.html', '').replace(/-/g, ' ');
            const capitalizedTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);
            return [
                { title: 'Home', filename: 'index.html', isClickable: true },
                { title: capitalizedTitle, filename: currentPage, isClickable: false }
            ];
        }
        
        // Build path by traversing parents
        let current = currentEntry;
        const reversePath = [];
        
        // Add current page first (will reverse later)
        reversePath.push({
            title: current.title,
            filename: current.filename,
            isClickable: false  // Current page is never clickable
        });
        
        // Traverse up to parent until null (Home)
        while (current.parent) {
            const parentEntry = findPageEntry(current.parent);
            if (!parentEntry) break;
            
            reversePath.push({
                title: parentEntry.title,
                filename: parentEntry.filename,
                isClickable: true  // Parent pages are clickable
            });
            
            current = parentEntry;
        }
        
        // Reverse to get Home -> ... -> Current
        return reversePath.reverse();
    }
    
    /**
     * Creates a breadcrumb item element
     */
    function createBreadcrumbItem(item, isLast = false) {
        const li = document.createElement('li');
        li.className = 'breadcrumb-item';
        
        if (isLast) {
            li.classList.add('active');
            li.textContent = item.title;
        } else {
            const link = document.createElement('a');
            link.href = item.filename;
            link.textContent = item.title;
            li.appendChild(link);
        }
        
        return li;
    }
    
    /**
     * Creates a separator between breadcrumb items
     */
    function createSeparator() {
        const li = document.createElement('li');
        li.className = 'breadcrumb-separator';
        li.textContent = '›';
        return li;
    }
    
    /**
     * Creates the mobile modal sheet with full breadcrumb hierarchy
     */
    function createMobileModal() {
        // Remove existing modal if present
        const existingModal = document.querySelector('.breadcrumb-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'breadcrumb-modal';
        modal.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: var(--color-white, white);
            border-top-left-radius: 20px;
            border-top-right-radius: 20px;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
            transform: translateY(100%);
            transition: transform 0.3s ease-in-out;
            z-index: 2000;
            max-height: 70vh;
            overflow-y: auto;
        `;
        
        // Modal header with drag indicator and close button
        const header = document.createElement('div');
        header.style.cssText = `
            padding: var(--space-md, 16px);
            border-bottom: 1px solid var(--color-border, #DEE2E6);
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            background-color: var(--color-white, white);
        `;
        
        const dragIndicator = document.createElement('div');
        dragIndicator.style.cssText = `
            width: 40px;
            height: 4px;
            background-color: var(--color-border, #DEE2E6);
            border-radius: 2px;
            margin: 0 auto;
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 1.25rem;
            cursor: pointer;
            color: var(--color-text-muted, #6C757D);
        `;
        closeBtn.addEventListener('click', closeMobileModal);
        
        header.appendChild(dragIndicator);
        header.appendChild(closeBtn);
        
        // Modal content - breadcrumb links
        const content = document.createElement('div');
        content.style.cssText = `
            padding: var(--space-md, 16px);
        `;
        
        // Build full breadcrumb list for modal
        breadcrumbPath.forEach((item, index) => {
            const isLast = index === breadcrumbPath.length - 1;
            const linkContainer = document.createElement('div');
            linkContainer.style.cssText = `
                padding: var(--space-sm, 8px) 0;
                border-bottom: 1px solid var(--color-border, #DEE2E6);
            `;
            
            if (isLast) {
                linkContainer.style.fontWeight = '600';
                linkContainer.style.color = 'var(--color-text-main, #333333)';
                linkContainer.textContent = item.title;
            } else {
                const link = document.createElement('a');
                link.href = item.filename;
                link.textContent = item.title;
                link.style.cssText = `
                    text-decoration: none;
                    color: var(--color-midnight-blue, #1A2530);
                    display: block;
                `;
                link.addEventListener('click', function() {
                    closeMobileModal();
                });
                linkContainer.appendChild(link);
            }
            
            content.appendChild(linkContainer);
        });
        
        modal.appendChild(header);
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Add overlay
        const overlay = document.createElement('div');
        overlay.className = 'breadcrumb-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0,0,0,0.5);
            z-index: 1999;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease-in-out;
        `;
        overlay.addEventListener('click', closeMobileModal);
        document.body.appendChild(overlay);
        
        return { modal, overlay };
    }
    
    /**
     * Opens the mobile modal sheet
     */
    function openMobileModal() {
        if (isModalOpen) return;
        
        const { modal, overlay } = createMobileModal();
        
        // Force reflow to trigger animation
        setTimeout(() => {
            modal.style.transform = 'translateY(0)';
            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';
        }, 10);
        
        isModalOpen = true;
        
        // Store references for closing
        document.body.dataset.breadcrumbModal = 'open';
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Closes the mobile modal sheet
     */
    function closeMobileModal() {
        if (!isModalOpen) return;
        
        const modal = document.querySelector('.breadcrumb-modal');
        const overlay = document.querySelector('.breadcrumb-overlay');
        
        if (modal) {
            modal.style.transform = 'translateY(100%)';
        }
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.visibility = 'hidden';
        }
        
        setTimeout(() => {
            if (modal) modal.remove();
            if (overlay) overlay.remove();
            document.body.style.overflow = '';
            delete document.body.dataset.breadcrumbModal;
        }, 300);
        
        isModalOpen = false;
    }
    
    /**
     * Creates the mobile breadcrumb (single line with left arrow)
     */
    function createMobileBreadcrumb() {
        const container = document.createElement('div');
        container.className = 'breadcrumb-container';
        
        const list = document.createElement('ul');
        list.className = 'breadcrumb-list';
        
        // Add back button with left arrow
        const backItem = document.createElement('li');
        backItem.className = 'breadcrumb-item breadcrumb-mobile-back';
        backItem.innerHTML = '<i class="fas fa-arrow-left"></i>';
        backItem.style.cursor = 'pointer';
        backItem.addEventListener('click', openMobileModal);
        list.appendChild(backItem);
        
        // Show only the last item (current page)
        const lastItem = breadcrumbPath[breadcrumbPath.length - 1];
        if (lastItem) {
            const currentItem = document.createElement('li');
            currentItem.className = 'breadcrumb-item active';
            currentItem.textContent = lastItem.title;
            list.appendChild(currentItem);
        }
        
        container.appendChild(list);
        return container;
    }
    
    /**
     * Creates the desktop breadcrumb (full hierarchy)
     */
    function createDesktopBreadcrumb() {
        const container = document.createElement('div');
        container.className = 'breadcrumb-container';
        
        const list = document.createElement('ul');
        list.className = 'breadcrumb-list';
        
        breadcrumbPath.forEach((item, index) => {
            const isLast = index === breadcrumbPath.length - 1;
            const breadcrumbItem = createBreadcrumbItem(item, isLast);
            list.appendChild(breadcrumbItem);
            
            if (!isLast) {
                const separator = createSeparator();
                list.appendChild(separator);
            }
        });
        
        container.appendChild(list);
        return container;
    }
    
    /**
     * Renders the breadcrumb bar
     */
    function renderBreadcrumbs() {
        const breadcrumbBar = document.querySelector('[data-component="breadcrumb"]');
        if (!breadcrumbBar) {
            console.warn('[Breadcrumbs] No breadcrumb container found with data-component="breadcrumb"');
            return;
        }
        
        // Clear existing content
        breadcrumbBar.innerHTML = '';
        
        // Check if breadcrumbPath is empty
        if (!breadcrumbPath || breadcrumbPath.length === 0) {
            // Fallback: Home
            const container = document.createElement('div');
            container.className = 'breadcrumb-container';
            const list = document.createElement('ul');
            list.className = 'breadcrumb-list';
            const homeItem = createBreadcrumbItem({ title: 'Home', filename: 'index.html', isClickable: true }, false);
            list.appendChild(homeItem);
            container.appendChild(list);
            breadcrumbBar.appendChild(container);
            return;
        }
        
        // Check screen width for mobile vs desktop
        const isMobile = window.innerWidth < 768;
        
        if (isMobile) {
            const mobileBreadcrumb = createMobileBreadcrumb();
            breadcrumbBar.appendChild(mobileBreadcrumb);
        } else {
            const desktopBreadcrumb = createDesktopBreadcrumb();
            breadcrumbBar.appendChild(desktopBreadcrumb);
        }
    }
    
    /**
     * Handles responsive updates when screen size changes
     */
    function setupResponsiveBreadcrumbs() {
        const mediaQuery = window.matchMedia('(max-width: 767px)');
        
        function handleScreenChange() {
            // Re-render breadcrumbs when screen size crosses threshold
            renderBreadcrumbs();
            
            // Close modal if open and screen becomes desktop
            if (window.innerWidth >= 768 && isModalOpen) {
                closeMobileModal();
            }
        }
        
        mediaQuery.addEventListener('change', handleScreenChange);
    }
    
    /**
     * Shows fallback breadcrumb when JSON fails
     */
    function showFallbackBreadcrumbs() {
        const breadcrumbBar = document.querySelector('[data-component="breadcrumb"]');
        if (!breadcrumbBar) return;
        
        breadcrumbBar.innerHTML = '';
        
        const container = document.createElement('div');
        container.className = 'breadcrumb-container';
        const list = document.createElement('ul');
        list.className = 'breadcrumb-list';
        
        // Home
        const homeItem = createBreadcrumbItem({ title: 'Home', filename: 'index.html', isClickable: true }, false);
        list.appendChild(homeItem);
        
        const separator = createSeparator();
        list.appendChild(separator);
        
        // Current page (fallback)
        const pageTitle = currentPage.replace('.html', '').replace(/-/g, ' ');
        const capitalizedTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);
        const currentItem = createBreadcrumbItem({ title: capitalizedTitle, filename: currentPage, isClickable: false }, true);
        list.appendChild(currentItem);
        
        container.appendChild(list);
        breadcrumbBar.appendChild(container);
        
        console.warn('[Breadcrumbs] Using fallback - no hierarchy data');
    }
    
    /**
     * Loads breadcrumb data from site-data.json
     */
    async function loadBreadcrumbData() {
        try {
            // Check if SiteUtils is available
            if (typeof SiteUtils === 'undefined') {
                console.error('[Breadcrumbs] utils.js not loaded. SiteUtils is undefined.');
                showFallbackBreadcrumbs();
                return;
            }
            
            // Load JSON with caching
            const data = await SiteUtils.loadJSON('/json/site-data.json', true);
            
            if (data && data.breadcrumbHierarchy && Array.isArray(data.breadcrumbHierarchy)) {
                hierarchyData = data.breadcrumbHierarchy;
                
                // Build breadcrumb path
                breadcrumbPath = buildBreadcrumbPath();
                
                // Render breadcrumbs
                renderBreadcrumbs();
                
                // Setup responsive behavior
                setupResponsiveBreadcrumbs();
                
                console.log('[Breadcrumbs] Initialized. Path:', breadcrumbPath.map(p => p.title).join(' > '));
            } else {
                console.error('[Breadcrumbs] Invalid JSON structure: missing breadcrumbHierarchy array');
                showFallbackBreadcrumbs();
            }
            
        } catch (error) {
            console.error('[Breadcrumbs] Failed to load site-data.json:', error);
            showFallbackBreadcrumbs();
        }
    }
    
    /**
     * Initializes the breadcrumb bar
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
        
        // Load breadcrumb data
        await loadBreadcrumbData();
    }
    
    // ============================================
    // START INITIALIZATION
    // ============================================
    
    init();
    
})();
