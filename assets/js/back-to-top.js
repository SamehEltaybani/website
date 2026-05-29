/**
 * back-to-top.js – Fully self‑contained, works first tap everywhere
 */
(function() {
    'use strict';

    function createButton() {
        // Remove any old button (just in case)
        var old = document.getElementById('backToTop');
        if (old) old.parentNode.removeChild(old);

        var btn = document.createElement('div');
        btn.id = 'backToTop';
        btn.setAttribute('aria-label', 'Back to top');

        // ---- All styling is inline – no CSS file needed ----
        btn.style.cssText = 'position:fixed; bottom:24px; right:24px;' +
            'width:56px; height:56px; border-radius:50%;' +
            'background-color:rgba(255,255,255,0.65);' +
            'border:1px solid #D4AF37;' +
            'box-shadow:0 4px 14px rgba(0,0,0,0.12);' +
            'display:none; flex-direction:column; align-items:center; justify-content:center;' +
            'cursor:pointer; z-index:999; padding:0;' +
            'touch-action:manipulation;';

        btn.innerHTML = '<span style="font-size:1.3rem; color:#D4AF37; line-height:1;"><i class="fas fa-circle-up"></i></span>' +
                        '<span style="font-size:0.5rem; font-weight:700; color:#1A2530; line-height:1; margin-top:1px;">To Top</span>';

        document.body.appendChild(btn);

        // ===== Scroll‑to‑top logic =====
        function goTop(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        btn.addEventListener('click', goTop);
        btn.addEventListener('pointerdown', goTop);

        // ===== Show / hide on scroll =====
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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createButton);
    } else {
        createButton();
    }
})();
