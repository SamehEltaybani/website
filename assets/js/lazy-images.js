(function() {
  'use strict';
  // Mark all lazy images as loaded (adds the class that makes them visible)
  function markLoaded(img) {
    img.classList.add('lazy-loaded');
  }

  document.querySelectorAll('img[loading="lazy"]').forEach(function(img) {
    if (img.complete) {
      // Already loaded from cache
      markLoaded(img);
    } else {
      img.addEventListener('load', function() {
        markLoaded(img);
      });
      // In case the image fails to load, show it anyway
      img.addEventListener('error', function() {
        markLoaded(img);
      });
    }
  });
})();
