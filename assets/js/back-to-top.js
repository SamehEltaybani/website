/**
 * back-to-top.js (including style [not main.css])– Robust button, works on all pages,
 */
(function() {
    'use strict';

    function createButton() {
        // Remove any old button (just in case)
        var oldBtn = document.getElementById('backToTop');
        if (oldBtn) oldBtn.parentNode.removeChild(oldBtn);

        var btn = document.createElement('div');
        btn.id = 'backToTop';
        btn.setAttribute('aria-label', 'Back to top');

        // ---- Inline styles – no external CSS required ----
        btn.style.cssText =
            'position:fixed; bottom:24px; right:24px;' +
            'width:56px; height:56px; border-radius:50%;' +
            'background-color:rgba(255,255,255,0.75);' +
            'border:1px solid #D4AF37;' +
            'box-shadow:0 4px 14px rgba(0,0,0,0.12);' +
            'display:none; flex-direction:column; align-items:center; justify-content:center;' +
            'cursor:pointer; z-index:999; padding:0;' +
            'touch-action:manipulation;';

        btn.innerHTML =
            '<span style="font-size:1.8rem; color:#D4AF37; line-height:1;">' +
              '<i class="fas fa-angle-up"></i>' +
            '</span>' +
            '<span style="font-size:0.7rem; font-weight:700; color:#1A2530; line-height:1; margin-top:0px;">' +
              '' +
            '</span>';

        document.body.appendChild(btn);

        // ----- Scroll to top (interrupts momentum) -----
        function goTop(e) {
            e.preventDefault();
            // Stop any current scrolling and immediately go to top.
            // The global CSS "scroll-behavior: smooth" makes it smooth.
            window.scrollTo(0, 0);
        }

        // Use both events for maximum reliability
        btn.addEventListener('click', goTop);
        btn.addEventListener('pointerdown', goTop);

        // Shadow on hover
        btn.addEventListener('mouseenter', function() {
            btn.style.boxShadow = '0px 0px 14px rgba(224, 123, 57, 0.9)';
        });
        btn.addEventListener('mouseleave', function() {
            btn.style.boxShadow = '0 4px 14px rgba(0,0,0,0.12)';
        });

        // ----- Show/hide on scroll (throttled) -----
        var ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    btn.style.display = (window.scrollY > 300) ? 'flex' : 'none';
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // Run after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createButton);
    } else {
        createButton();
    }
})();
