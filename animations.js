// DESKOBS | animations.js : GSAP + ScrollTrigger. Loads after site.js, so the cards already exist.
(function () {
  'use strict';
  if (!window.gsap || !window.ScrollTrigger) return;                       // CDN blocked? site still works
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;      // respect the user's setting
  gsap.registerPlugin(ScrollTrigger);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const page = document.body.dataset.page;

  /* ---------- 1. INTRO: header drops in, hero headline rises word by word ---------- */
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.site-header', { yPercent: -100, duration: .7 });
  const h1 = document.querySelector('.hero h1');
  if (h1) {
    h1.innerHTML = h1.textContent.trim().split(' ').map(w => '<span class="w"><span>' + w + '</span></span>').join(' ');
    tl.from('.hero h1 .w > span', { yPercent: 110, duration: .9, stagger: .08 }, '-=.3')
      .from('.hero p, .hero .btn', { y: 24, opacity: 0, stagger: .1, duration: .7 }, '-=.5')
      .from('.hero-art div', { scale: .7, opacity: 0, stagger: .12, duration: .9, ease: 'back.out(1.5)' }, '-=.8');
  }

  /* ---------- 2. REVEAL + FRAME PARALLAX (re-run after the shop redraws its grid) ---------- */
  function reveal(scope) {
    scope = scope || document;
    // remove triggers whose element was thrown away by a re-render
    ScrollTrigger.getAll().forEach(t => { if (t.trigger && !document.body.contains(t.trigger)) t.kill(); });

    // boxes fade up in small groups
    const items = $$('.card, .cat-tile, .box', scope).filter(e => !e._a);
    items.forEach(e => e._a = 1);
    gsap.set(items, { y: 50, opacity: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 90%', once: true,
      onEnter: b => gsap.to(b, { y: 0, opacity: 1, duration: .8, stagger: .08, ease: 'power3.out', overwrite: true })
    });

    // the picture inside every frame slides slower than the frame: depth
    $$('.img-in', scope).filter(e => !e._p).forEach(e => {
      e._p = 1;
      gsap.fromTo(e, { yPercent: -8 }, { yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: e.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // section titles
    $$('.section h2, .page-title', scope).filter(e => !e._a).forEach(e => {
      e._a = 1;
      gsap.from(e, { y: 40, opacity: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: e, start: 'top 90%', once: true } });
    });
    ScrollTrigger.refresh();
  }
  window.deskReveal = reveal;
  reveal();

  /* ---------- 3. SCROLL-LINKED PARALLAX (smaller moves on phones) ---------- */
  gsap.matchMedia().add({ big: '(min-width: 768px)', small: '(max-width: 767px)' }, ctx => {
    const k = ctx.conditions.big ? 1 : .5;

    // hero tiles drift at four different speeds, headline lags behind
    $$('.hero-art div').forEach((t, i) => gsap.to(t, { yPercent: [-30, 20, -10, 40][i] * k, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 } }));
    if (document.querySelector('.hero')) gsap.to('.hero-inner > div:first-child', { yPercent: -12 * k, opacity: .25, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // any element with data-speed floats against the scroll
    $$('[data-speed]').forEach(el => {
      const s = parseFloat(el.dataset.speed) * 60 * k;
      gsap.fromTo(el, { y: -s }, { y: s, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });

  // marquee band slides sideways as you scroll down
  if (document.querySelector('.marquee')) gsap.fromTo('.marquee-track', { xPercent: -4 }, { xPercent: -34, ease: 'none',
    scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- 4. PAGE EXTRAS ---------- */
  if (page === 'product') gsap.from('.pp .img', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'power4.out' });
  if (page === 'cart') gsap.from('.row', { x: -30, opacity: 0, stagger: .08, duration: .6, ease: 'power3.out' });
  gsap.from('.footer .foot-grid > div', { y: 40, opacity: 0, stagger: .12, duration: .8, ease: 'power3.out',
    scrollTrigger: { trigger: '.footer', start: 'top 92%', once: true } });

  /* ---------- 5. MICRO-INTERACTION: add to bag ---------- */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-add], #addbtn, #addbtn2');
    if (!b) return;
    gsap.fromTo(b, { scale: .94 }, { scale: 1, duration: .5, ease: 'elastic.out(1, .4)' });
    gsap.fromTo('#cart-count', { scale: 1.9 }, { scale: 1, duration: .6, ease: 'back.out(3)' });
  });

  addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
