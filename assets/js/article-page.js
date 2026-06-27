 (function() {
      'use strict';

      // UTILITIES

       function escapeHTML(text) {
        if (typeof SiteUtils !== 'undefined' && SiteUtils.escapeHTML) return SiteUtils.escapeHTML(text);
        const div = document.createElement('div'); div.textContent = text; return div.innerHTML;
      }

      // CURRENT ARTICLE DATA

           const currentBlogfile = location.pathname.replace(/^\/website\//, '');
      let articleData = null;

      // PROGRESS BAR

     function initProgressBar() {
        const bar = document.getElementById('progress-bar');
        if (!bar) return;
        window.addEventListener('scroll', SiteUtils.throttle(() => {
          const winScroll = document.documentElement.scrollTop;
          const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
          bar.style.width = Math.min(scrolled, 100) + '%';
        }, 20));
      }

      // CALCULATE READING TIME

           function calculateReadingTime() {
        const contentEl = document.getElementById('article-content');
        if (!contentEl) return 0;
        const text = contentEl.innerText || '';
        const words = text.trim().split(/\s+/).length;
        return Math.ceil(words / 200);
      }

      // DISPLAY ARTICLE METADATA

     async function displayMetadata() {
        try {
          const data = await SiteUtils.loadJSON('/json/blog-list.json', true);
          if (!data) return;
          const entry = data.find(item => item.blogfile === currentBlogfile);
          if (!entry) return;
          articleData = entry;

          document.getElementById('article-title').textContent = entry.title || 'Article';
          document.title = 'Dr. Sameh Eltaybani - ' + (entry.title || 'Article');

          // Categories
          const catContainer = document.getElementById('article-categories');
          catContainer.innerHTML = '';
          if (entry.categories && Array.isArray(entry.categories)) {
            const uniqueCategories = [...new Set(entry.categories)];
            uniqueCategories.forEach(cat => {
              const a = document.createElement('a');
              a.href = 'blog.html?category=' + encodeURIComponent(cat);
              a.className = 'blog-category';
              a.textContent = cat;
              catContainer.appendChild(a);
            });
          }

          // Date
         
          const dateObj = new Date(entry.date);
          const dateFormatted = isNaN(dateObj.getTime()) ? entry.date : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(/(\w+)\s/, '$1. ');
          document.getElementById('article-date').textContent = dateFormatted;

          // Reading time
         
          const readTime = calculateReadingTime();
          document.getElementById('article-read-time').textContent = (readTime || 1) + ' min. read';

          // Create share triggers 
         
          createShareButton(document.getElementById('share-btn-top'));
          createShareButton(document.getElementById('share-btn-bottom'));
        } catch (e) {
          console.warn('Could not load article metadata');
        }
      }

      // HIGHLIGHT BLOG NAVIGATION ITEM

     function highlightBlogNav() {
        document.querySelectorAll('.nav-link.active, .mobile-nav-link.active').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
          if (link.textContent.trim() === 'Blog' && link.getAttribute('href') === 'blog.html') {
            link.classList.add('active');
          }
        });
      }

      // RECOMMENDED FOR YOU
      
     async function renderRecommended() {
        const container = document.getElementById('recommended-container');
        if (!container) return;
        container.innerHTML = '';

        try {
          const data = await SiteUtils.loadJSON('/json/blog-list.json', true);
          if (!data || !Array.isArray(data)) return;

          let recommended = [];
          if (articleData && articleData.categories) {
            const currentCats = articleData.categories;
            recommended = data
              .filter(item => item.blogfile !== currentBlogfile)
              .filter(item => item.categories && item.categories.some(cat => currentCats.includes(cat)))
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 6);
          }

          if (recommended.length < 6) {
            const existingFiles = recommended.map(r => r.blogfile);
            const remaining = data
              .filter(item => item.blogfile !== currentBlogfile && !existingFiles.includes(item.blogfile))
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 6 - recommended.length);
            recommended = recommended.concat(remaining);
          }

          recommended.forEach(item => {
            const card = document.createElement('a');
            card.href = item.blogfile;
            card.className = 'card card-lift';
            card.style.textDecoration = 'none';
            card.style.color = 'inherit';
            card.innerHTML = `
              <div class="card-content">
                <h3 class="card-title">${escapeHTML(item.title)}</h3>
                <p class="card-description">${item.date ? new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</p>
              </div>
            `;
            container.appendChild(card);
          });
        } catch (e) {
          container.innerHTML = '<p class="text-muted">Unable to load recommendations.</p>';
        }
      }

      // SOCIAL SHARING BUTTON (single "Action link" trigger)
      
      function createShareButton(container) {
        if (!container) return;
        const articleTitle = document.title.split(' - ')[1] || document.title;
        const articleUrl = window.location.href;

        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';

        // ---- Single Action link
       
        const trigger = document.createElement('span');
        trigger.className = 'share-trigger';                         
        trigger.style.cssText = 'cursor:pointer; display:inline-flex; align-items:center; gap:6px; font-size:0.9rem;';
        trigger.innerHTML = '<i class="fas fa-share-alt"></i> Action link <i class="fas fa-angle-down"></i>';

        // Dropdown
       
        const dropdown = document.createElement('div');
        dropdown.className = 'share-dropdown';

        // Close button inside dropdown
       
        const closeShareBtn = document.createElement('button');
        closeShareBtn.className = 'search-modal-close-btn';
        closeShareBtn.innerHTML = '&times;';
        closeShareBtn.setAttribute('aria-label', 'Close share menu');
        closeShareBtn.style.position = 'absolute';
        closeShareBtn.style.top = '6px';
        closeShareBtn.style.right = '6px';
        closeShareBtn.addEventListener('click', function() {
          dropdown.classList.remove('open');
        });
        dropdown.appendChild(closeShareBtn);

        // Social icons 
       
        const socialRow = document.createElement('div');
        socialRow.className = 'share-social-icons';

        const socials = [
          { icon: 'fab fa-facebook-f', url: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(articleUrl) },
          { icon: 'fab fa-x-twitter', url: 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(articleUrl) + '&text=' + encodeURIComponent(articleTitle) },
          { icon: 'fab fa-linkedin', url: 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(articleUrl) },
          { icon: 'fab fa-bluesky', url: 'https://bsky.app/intent/compose?text=' + encodeURIComponent(articleTitle + ' ' + articleUrl) },
          { icon: 'fab fa-telegram-plane', url: 'https://t.me/share/url?url=' + encodeURIComponent(articleUrl) + '&text=' + encodeURIComponent(articleTitle) },
          { icon: 'fab fa-whatsapp', url: 'https://wa.me/?text=' + encodeURIComponent(articleTitle + ' ' + articleUrl) },
          { icon: 'fab fa-facebook-messenger', url: 'https://www.facebook.com/dialog/send?link=' + encodeURIComponent(articleUrl) + '&app_id=291494149107498' },
          { icon: 'fas fa-envelope', url: 'mailto:?subject=' + encodeURIComponent('Interesting article: ' + articleTitle) + '&body=' + encodeURIComponent(articleTitle + '\n\n' + articleUrl) },
          { icon: 'fab fa-line', url: 'https://social-plugins.line.me/lineit/share?url=' + encodeURIComponent(articleUrl) }
        ];

        socials.forEach(s => {
          const a = document.createElement('a');
          a.href = s.url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.style.color = 'var(--color-midnight-blue)';
          a.style.fontSize = '1.5rem';
          a.innerHTML = '<i class="' + s.icon + '"></i>';
          socialRow.appendChild(a);
        });
        dropdown.appendChild(socialRow);

        // Divider
       
        const divider = document.createElement('hr');
        divider.className = 'share-divider';
        dropdown.appendChild(divider);

        // Action items
       
        function addActionItem(label, iconClass, onClick) {
          const btn = document.createElement('button');
          btn.className = 'share-action-item';
          btn.innerHTML = '<i class="' + iconClass + '"></i> <span>' + label + '</span>';
          btn.addEventListener('click', onClick);
          dropdown.appendChild(btn);
        }

        addActionItem('Copy link', 'fas fa-copy', function() {
          navigator.clipboard.writeText(articleUrl).then(() => alert('Link copied to clipboard!')).catch(() => prompt('Copy this link:', articleUrl));
        });

        addActionItem('Print / PDF', 'fas fa-print', function() {
          window.print();
        });

        addActionItem('QR code', 'fas fa-qrcode', function() {
          showQRCode(articleUrl);
        });

        addActionItem('Copyright', 'fas fa-copyright', function() {
          window.location.href = 'legal.html';
        });

        // Toggle dropdown on trigger click
       
        trigger.addEventListener('click', function(e) {
          e.stopPropagation();
          dropdown.classList.toggle('open');
        });

        // Close dropdown when clicking outside
       
        document.addEventListener('click', function(e) {
          if (!wrapper.contains(e.target)) {
            dropdown.classList.remove('open');
          }
        });

        wrapper.appendChild(trigger);
        wrapper.appendChild(dropdown);
        container.appendChild(wrapper);
      }

      // QR CODE OVERLAY (for the dropdown action)
     
      function showQRCode(url) {
        const overlay = document.getElementById('qr-overlay');
        const qrImg = document.getElementById('qr-image');
        const qrMsg = document.getElementById('qr-message');

        if (!overlay || !qrImg || !qrMsg) return;
        qrImg.style.display = 'none';
        qrMsg.textContent = '';
        overlay.classList.add('open');

        qrImg.onload = function() { qrImg.style.display = 'block'; };
        qrImg.onerror = function() {
          qrImg.style.display = 'none';
          qrMsg.textContent = 'QR code service is currently unavailable.';
        };
        qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(url);

        const closeBtn = overlay.querySelector('.qr-overlay-close');
        if (closeBtn) {
          closeBtn.onclick = function() { overlay.classList.remove('open'); };
        }
        overlay.addEventListener('click', function(e) {
          if (e.target === overlay) overlay.classList.remove('open');
        });
      }

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          const overlay = document.getElementById('qr-overlay');
          if (overlay) overlay.classList.remove('open');
        }
      });

      // INITIALISATION

     async function initArticle() {
        if (typeof SiteUtils !== 'undefined' && SiteUtils.waitForDOM) {
          await SiteUtils.waitForDOM();
        }

        initProgressBar();

        // Force lazy images to load before printing
      
        window.addEventListener('beforeprint', function() {
          document.querySelectorAll('img[loading="lazy"]').forEach(function(img) {
            img.setAttribute('loading', 'eager');
          });
        });

        await displayMetadata();

        // ---- Fill print QR code
      
        const qrApiUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(window.location.href);
        const printQrImg = document.getElementById('print-qr-image');
        if (printQrImg) {
          printQrImg.src = qrApiUrl;
        }

        // ---- Fill print URL 
      
        const printUrlSpan = document.getElementById('print-url-span');
        if (printUrlSpan) {
          printUrlSpan.textContent = window.location.href;
        }

        // ---- Fill print date 
      
        const printDateSpan = document.getElementById('print-date-span');
        if (printDateSpan) {
          const now = new Date();
          printDateSpan.textContent = now.toLocaleString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            timeZoneName: 'short'
          });
        }

        highlightBlogNav();
        await renderRecommended();

        // ---- Activate lightbox on all article images
      
        if (typeof GLightbox !== 'undefined') {
          const articleImages = document.querySelectorAll('#article-content img');
          if (articleImages.length > 0) {
            GLightbox({ selector: '#article-content img' });
          }
        }
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initArticle);
      } else {
        initArticle();
      }
    })();
