/**
 * ============================================
 * AOS (Animate On Scroll) – GLOBAL SETTINGS
 * ============================================
 * This file initialises the animation library.
 * Change the values below to adjust animations everywhere.
 *
 * PROPERTIES YOU CAN CHANGE:
 *   duration     – how long the animation lasts (in milliseconds)
 *                  Example: 400 = 0.4 seconds,  1000 = 1 second
 *   once         – true  = animate only the first time the element appears
 *                  false = animate every time the element scrolls into view
 *   easing       – the acceleration curve. Options:
 *                  'ease', 'ease-in', 'ease-out', 'ease-in-out',
 *                  'linear', 'ease-in-back', 'ease-out-back', etc.
 *   offset       – how far from the bottom of the screen the animation starts.
 *                  Higher = starts later (120 = default)
 *   delay        – wait time before animation starts (ms). Only for elements
 *                  that have data-aos-delay attribute.
 *   disable      – set to 'mobile' to disable on phones.
 *                  Leave empty to animate on all devices.
 */
AOS.init({
    duration: 800,       // animation speed (800 ms = 0.8 seconds)
    once: false,         // false = animate both directions (scroll down & up)
    easing: 'ease-in-out',
    offset: 120,
    delay: 0,            // default delay – you can override per element
    disable: false       // false = animations on ALL devices (desktop, tablet, phone)
});
