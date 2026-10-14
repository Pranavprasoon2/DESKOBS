// DESKOBS | site.js : header, footer, cart and the logic of every page.
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const KEY = 'deskobs-cart';
  const WHATSAPP = '91XXXXXXXXXX'; // CHANGE: country code + number, no + or spaces
  const UPI = 'yourname@upi';      // CHANGE: your UPI id
  const BRAND = 'DESKOBS';
  // CHANGE: your real store policy. These numbers show on the product page and in the bag.
  const POLICY = { deliveryDays: [3, 6], returnDays: 7, freeShipFrom: 2000, shipFee: 99 };
  // colour theme: saved choice, else the device setting
  let theme; try { theme = localStorage.getItem('deskobs-theme'); } catch (e) {}
  document.documentElement.dataset.theme = theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const fmt = n => '₹' + n.toLocaleString('en-IN');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const get = id => PRODUCTS.find(p => p.id === id);
  // Picture shown when a photo is missing. Add the real file at the path in products.js / SITE_IMAGES to replace it.
  const PH = label => 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" fill="#e6e6e2"/><g fill="none" stroke="#9a9a96" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><rect x="215" y="225" width="170" height="130" rx="12"/><circle cx="262" cy="270" r="14"/><path d="M225 340l45-45 35 30 25-20 45 35"/></g><text x="300" y="405" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#6b6b6b">' + esc(label) + '</text></svg>');
  window.deskPH = PH;
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const frame = (p, first) => '<div class="img">' + (p.image
    ? '<img class="img-in" src="' + esc(p.image) + '" alt="' + esc(p.name) + '" width="600" height="600" decoding="async" onerror="this.onerror=null;this.src=deskPH(this.alt)" ' + (first ? 'fetchpriority="high"' : 'loading="lazy"') + '>'
    : '<div class="img-in" role="img" aria-label="' + esc(p.name) + '" style="' + bg(p) + '"></div>') + '</div>';
  const bg = p => 'background:' + (p.image ? 'url(' + p.image + ') center/cover,' : '') + p.color;   // colour shows if the photo is missing

  /* ---------- CART (list of {id, qty} saved in localStorage) ---------- */
  let cart;
  try { cart = (JSON.parse(localStorage.getItem(KEY)) || []).filter(i => get(i.id)); } catch (e) { cart = []; }
  const total = () => cart.reduce((s, i) => s + get(i.id).price * i.qty, 0);
  function save() {
    localStorage.setItem(KEY, JSON.stringify(cart));
    const n = cart.reduce((s, i) => s + i.qty, 0);
    $('#cart-count').textContent = n || '';
  }
  const maxQty = p => p.stock == null ? Infinity : p.stock;
  function add(id, q) {                         // returns how many were really added
    const it = cart.find(i => i.id === id);
    const n = Math.max(0, Math.min(q, maxQty(get(id)) - (it ? it.qty : 0)));
    if (n > 0) { it ? it.qty += n : cart.push({ id: id, qty: n }); save(); }
    return n;
  }
  function change(id, d) {
    const it = cart.find(i => i.id === id);
    if (!it) return;
    if (d > 0 && it.qty + d > maxQty(get(id))) { toast('That is all we have in stock'); return; }
    it.qty += d;
    if (it.qty <= 0) cart = cart.filter(i => i.id !== id);
    save();
  }
  let tt;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2000);
  }

  /* ---------- SEO: per-product title, description, social tags, Product schema ---------- */
  function setMeta(attr, key, val) {
    let m = document.head.querySelector('meta[' + attr + '="' + key + '"]');
    if (!m) { m = document.createElement('meta'); m.setAttribute(attr, key); document.head.appendChild(m); }
    m.setAttribute('content', val);
  }
  function seo(p) {
    const img = p.image ? new URL(p.image, location.href).href : '';
    const desc = p.name + '. ' + p.description;
    const web = location.protocol.indexOf('http') === 0;
    const url = web ? location.origin + location.pathname + '?id=' + p.id : '';
    setMeta('name', 'description', desc);
    setMeta('property', 'og:type', 'product');
    setMeta('property', 'og:title', p.name + ' | ' + BRAND);
    setMeta('property', 'og:description', desc);
    setMeta('name', 'twitter:card', 'summary_large_image');
    if (img) setMeta('property', 'og:image', img);
    if (web) {
      setMeta('property', 'og:url', url);
      const c = document.createElement('link'); c.rel = 'canonical'; c.href = url; document.head.appendChild(c);
    }
    const ld = {
      '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.description,
      category: p.category, sku: 'DESKOBS-' + p.id, brand: { '@type': 'Brand', name: BRAND },
      offers: { '@type': 'Offer', price: p.price, priceCurrency: 'INR',
        availability: maxQty(p) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' }
    };
    if (img) ld.image = [img];
    if (url) ld.offers.url = url;
    const s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  }
  const dateRange = () => {
    const f = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); };
    return f(POLICY.deliveryDays[0]) + ' to ' + f(POLICY.deliveryDays[1]);
  };

  /* ---------- HEADER + FOOTER (same on every page) ---------- */
  const LINKS = [['Shop','shop.html'],['Desk','shop.html?cat=desk'],['Light','shop.html?cat=light'],['Tech','shop.html?cat=tech'],['Carry','shop.html?cat=carry']];
  const I = {
    s: '<svg viewBox="0 0 24 24" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
    u: '<svg viewBox="0 0 24 24" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>',
    t: '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
    b: '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/></svg>'
  };
  const here = (location.pathname.split('/').pop() || 'index.html') + location.search;
  $('#hdr').innerHTML =
    '<header class="site-header" id="navbar"><nav class="nav" aria-label="Main"><a class="logo" href="index.html">' + BRAND + '</a>' +
    '<div class="nav-right"><ul class="nav-links">' +
    LINKS.map(l => '<li><a href="' + l[1] + '"' + (here === l[1] ? ' aria-current="page"' : '') + '>' + l[0] + '</a></li>').join('') +
    '</ul><div class="nav-actions">' +
    '<a class="icon-btn" href="shop.html#search" aria-label="Search">' + I.s + '</a>' +
    '<button class="icon-btn" id="theme" type="button" aria-label="Switch light or dark theme">' + I.t + '</button>' +
    '<a class="icon-btn" href="account.html" aria-label="My account">' + I.u + '</a>' +
    '<a class="icon-btn" href="cart.html" aria-label="Open bag">' + I.b + '<span class="cart-count" id="cart-count"></span></a>' +
    '<button class="icon-btn menu-btn" id="mobile-menu-btn" aria-label="Menu" aria-expanded="false"><span class="burger"><span></span><span></span></span></button>' +
    '</div></div></nav><div class="mobile-menu" id="mobile-menu">' +
    LINKS.concat([['Account','account.html'],['About','about.html'],['Shipping and returns','policies.html'],['Contact','contact.html']]).map(l => '<a href="' + l[1] + '">' + l[0] + '</a>').join('') +
    '</div></header>';
  $('#ftr').innerHTML =
    '<footer class="footer"><div class="container"><div class="foot-grid">' +
    '<div><a class="logo" href="index.html">' + BRAND + '</a><p style="color:var(--muted);max-width:36ch">Desk objects you use every day. Mats, stands, lights and tech, designed to last.</p></div>' +
    '<div><h3>Shop</h3><ul>' + LINKS.map(l => '<li><a href="' + l[1] + '">' + l[0] + '</a></li>').join('') + '</ul></div>' +
    '<div><h3>Company</h3><ul><li><a href="about.html">About</a></li><li><a href="contact.html">Contact</a></li><li><a href="account.html">Account</a></li><li><a href="login.html">Log in</a></li><li><a href="signup.html">Sign up</a></li><li><a href="policies.html">Shipping and returns</a></li></ul></div>' +
    '</div><p class="copy">© ' + new Date().getFullYear() + ' ' + BRAND + '. All rights reserved.</p></div></footer>';

  const mb = $('#mobile-menu-btn');
  mb.onclick = () => {
    const o = $('#mobile-menu').classList.toggle('is-open');
    mb.classList.toggle('is-open', o); mb.setAttribute('aria-expanded', String(o));
  };
  $('#theme').onclick = () => {
    const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('deskobs-theme', t); } catch (e) {}
  };
  addEventListener('scroll', () => $('#navbar').classList.toggle('is-scrolled', scrollY > 8), { passive: true });

  /* ---------- SHARED PRODUCT CARD ---------- */
  const card = p =>
    '<article class="card"><a href="product.html?id=' + p.id + '">' + frame(p) + '</a>' +
    '<div class="meta"><span class="cat">' + esc(p.category) + '</span><a class="name" href="product.html?id=' + p.id + '">' + esc(p.name) + '</a>' +
    '<span class="price">' + fmt(p.price) + '</span></div>' +
    (maxQty(p) > 0 ? '<button class="btn small" data-add="' + p.id + '">Add to bag</button>' : '<button class="btn small ghost" disabled>Out of stock</button>') + '</article>';
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-add]');
    if (!b) return;
    toast(add(Number(b.dataset.add), 1) ? 'Added to bag' : 'That is all we have in stock');
  });

  /* ---------- ACCOUNTS: real (server) when available, browser-only demo otherwise ---------- */
  const api = async (url, body) => { const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const j = await r.json().catch(() => ({})); if (!r.ok) { const e = new Error(j.error || 'Something went wrong.'); e.api = !!j.error; throw e; } return j; };
  function auth(cb) {                                        // cb(isLive, user or null)
    const demo = () => cb(false, localStorage.getItem('deskobs-user') ? { name: localStorage.getItem('deskobs-user') } : null);
    try { fetch('/api/me').then(r => { if (!r.ok && r.status !== 401) throw 0; return r.ok ? r.json() : null; }).then(me => cb(true, me)).catch(demo); } catch (e) { demo(); }
  }
  const users = () => JSON.parse(localStorage.getItem('deskobs-users') || '[]');
  const sha = async t => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)))].map(x => x.toString(16).padStart(2, '0')).join('');
  async function demoSignup(d) {
    if (!crypto.subtle) throw new Error('Open the site over https or localhost.');
    const em = String(d.email).toLowerCase();
    if (users().some(u => u.email === em)) throw new Error('That email already has an account. Log in instead.');
    localStorage.setItem('deskobs-users', JSON.stringify(users().concat({ name: d.name, email: em, hash: await sha(d.password) })));
    localStorage.setItem('deskobs-user', d.name);
  }
  async function demoLogin(d) {
    if (!crypto.subtle) throw new Error('Open the site over https or localhost.');
    const h = await sha(d.password), u = users().find(x => x.email === String(d.email).toLowerCase() && x.hash === h);
    if (!u) throw new Error('Wrong email or password.');
    localStorage.setItem('deskobs-user', u.name);
  }

  /* ---------- PAGES ---------- */
  const pages = {
    home() { $('#featured').innerHTML = (typeof FEATURED === 'undefined' ? PRODUCTS.slice(0, 8) : FEATURED.map(get).filter(Boolean)).map(card).join(''); },

    shop() {
      const sp = new URLSearchParams(location.search);
      let cat = sp.get('cat') || 'all', sort = '', q = (sp.get('q') || '').trim().toLowerCase(), max = 0, stock = false;
      $('#chips').innerHTML = ['all','desk','light','tech','carry'].map(c => '<button class="chip" data-c="' + c + '">' + c + '</button>').join('');
      $('#q').value = sp.get('q') || '';
      function draw() {
        const l = PRODUCTS.filter(p => (cat === 'all' || p.category === cat) && (p.name + ' ' + p.description + ' ' + p.category).toLowerCase().includes(q) && (!max || p.price <= max) && (!stock || maxQty(p) > 0));
        if (sort === 'lo') l.sort((a, b) => a.price - b.price);
        if (sort === 'hi') l.sort((a, b) => b.price - a.price);
        if (sort === 'rt') l.sort((a, b) => b.rating - a.rating);
        $$('.chip').forEach(b => { const on = b.dataset.c === cat; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
        $('#grid').innerHTML = l.map(card).join('');
        if (window.deskReveal) window.deskReveal($('#grid'));
        $('#count').textContent = l.length + (l.length === 1 ? ' object' : ' objects');
        $('#empty').hidden = l.length > 0;
      }
      $('#chips').onclick = e => { const b = e.target.closest('.chip'); if (b) { cat = b.dataset.c; draw(); } };
      $('#q').oninput = e => { q = e.target.value.trim().toLowerCase(); draw(); };
      $('#sort').onchange = e => { sort = e.target.value; draw(); };
      $('#price').onchange = e => { max = Number(e.target.value); draw(); };
      $('#stock').onchange = e => { stock = e.target.checked; draw(); };
      $('#reset').onclick = () => { cat = 'all'; sort = ''; q = ''; max = 0; stock = false; $('#q').value = ''; $('#sort').value = ''; $('#price').value = '0'; $('#stock').checked = false; draw(); };
      if (location.hash === '#search') $('#q').focus();
      draw();
    },

    product() {
      const p = get(Number(new URLSearchParams(location.search).get('id')));
      if (!p) { $('#pp').innerHTML = '<p>Product not found. <a href="shop.html"><u>Back to shop</u></a></p>'; return; }
      document.title = p.name + ' | ' + BRAND;
      seo(p);
      const left = maxQty(p), out = left <= 0, low = !out && left <= 5;
      const imgs = p.images && p.images.length > 1 ? p.images : null;
      let q = 1;

      $('#crumbs').innerHTML = '<ol><li><a href="shop.html">Shop</a></li><li><a href="shop.html?cat=' + esc(p.category) + '">' + esc(cap(p.category)) +
        '</a></li><li aria-current="page">' + esc(p.name) + '</li></ol>';

      $('#pp').innerHTML =
        '<div>' + frame(p, true) + (imgs ? '<div class="thumbs">' + imgs.map((src, i) =>
          '<button class="thumb" type="button" data-src="' + esc(src) + '" aria-label="Show image ' + (i + 1) + '" aria-pressed="' + (i === 0) + '"><img src="' + esc(src) + '" alt="" width="64" height="64" loading="lazy"></button>').join('') + '</div>' : '') + '</div>' +
        '<div><p class="cat">' + esc(p.category) + '</p><h1>' + esc(p.name) + '</h1>' +
        '<p class="price big">' + fmt(p.price) + '</p><p class="rating">★ ' + p.rating.toFixed(1) + ' rating</p>' +
        '<p>' + esc(p.description) + '</p>' +
        (p.points ? '<ul class="points">' + p.points.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') +
        '<p class="stock ' + (out ? 'out' : low ? 'low' : '') + '">' + (out ? 'Out of stock' : low ? 'Only ' + left + ' left' : 'In stock') + '</p>' +
        '<div class="buy"><div class="qty"><button id="m" aria-label="Less"' + (out ? ' disabled' : '') + '>−</button><span id="n" aria-live="polite">1</span><button id="pl" aria-label="More"' + (out ? ' disabled' : '') + '>+</button></div>' +
        '<button class="btn accent" id="addbtn"' + (out ? ' disabled' : '') + '>' + (out ? 'Out of stock' : 'Add to bag') + '</button></div>' +
        '<ul class="perks">' + (out ? '' : '<li><span>Estimated delivery</span><span>' + dateRange() + '</span></li>') +
        '<li><span>Free delivery</span><span>Orders above ' + fmt(POLICY.freeShipFrom) + '</span></li>' +
        '<li><span>Returns</span><span>' + POLICY.returnDays + ' days</span></li>' +
        '<li><span>Pay with</span><span>UPI or WhatsApp order</span></li></ul>' +
        (p.specs ? '<h2 class="details-h">Details</h2><table class="specs"><tbody>' + p.specs.map(r => '<tr><th scope="row">' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td></tr>').join('') + '</tbody></table>' : '') +
        '</div>';

      const num = $('#n');
      $('#m').onclick = () => { q = Math.max(1, q - 1); num.textContent = q; };
      $('#pl').onclick = () => { q = Math.min(left, q + 1); num.textContent = q; };
      const addNow = () => { const n = add(p.id, q); toast(n ? n + ' added to bag' : 'That is all we have in stock'); };
      $('#addbtn').onclick = addNow;

      // thumbnails swap the main picture
      $('#pp').addEventListener('click', e => {
        const t = e.target.closest('.thumb'), main = $('#pp img.img-in');
        if (!t || !main) return;
        main.src = t.dataset.src;
        $$('.thumb').forEach(b => b.setAttribute('aria-pressed', String(b === t)));
      });

      // sticky buy bar on phones: shows when the main button is off screen
      if (!out) {
        $('#sticky').innerHTML = '<div><span class="name">' + esc(p.name) + '</span><span class="price">' + fmt(p.price) + '</span></div><button class="btn accent" id="addbtn2">Add to bag</button>';
        $('#addbtn2').onclick = addNow;
        if ('IntersectionObserver' in window) new IntersectionObserver(en => $('#sticky').classList.toggle('is-on', !en[0].isIntersecting)).observe($('#addbtn'));
      }

      // complete your setup
      const pairs = (p.pairs || []).map(get).filter(x => x && maxQty(x) > 0);
      if (pairs.length) {
        $('#bundle').hidden = false;
        $('#bundle-grid').innerHTML = pairs.map(card).join('');
        const sum = pairs.reduce((t, x) => t + x.price, 0);
        $('#bundle-add').textContent = 'Add ' + pairs.length + (pairs.length > 1 ? ' items' : ' item') + ' to bag (' + fmt(sum) + ')';
        $('#bundle-add').onclick = () => { pairs.forEach(x => add(x.id, 1)); toast(pairs.length + (pairs.length > 1 ? ' items' : ' item') + ' added to bag'); };
      }

      const more = PRODUCTS.filter(x => x.category === p.category && x.id !== p.id && !(p.pairs || []).includes(x.id)).slice(0, 4);
      $('#related').innerHTML = more.map(card).join('');
      $('#related').parentNode.hidden = !more.length;
    },

    cart() {
      try { const sv = JSON.parse(localStorage.getItem('deskobs-details') || '{}'); ['name','phone','address'].forEach(k => { if (sv[k]) $('#order [name=' + k + ']').value = sv[k]; }); } catch (e) {}
      function draw() {
        $('#lines').innerHTML = cart.length ? cart.map(i => {
          const p = get(i.id);
          return '<div class="row"><div class="img" style="' + bg(p) + '"></div><div><a class="name" href="product.html?id=' + p.id + '">' + esc(p.name) + '</a>' +
            '<div><div class="qty"><button data-a="dec" data-id="' + p.id + '" aria-label="Less">−</button><span>' + i.qty + '</span><button data-a="inc" data-id="' + p.id + '" aria-label="More">+</button></div> ' +
            '<button class="link" data-a="rm" data-id="' + p.id + '">Remove</button></div></div><b>' + fmt(p.price * i.qty) + '</b></div>';
        }).join('') : '<p>Your bag is empty. <a href="shop.html"><u>Browse objects</u></a></p>';
        $('#checkout').hidden = !cart.length;
        const sub = total(), ship = sub >= POLICY.freeShipFrom ? 0 : POLICY.shipFee;
        $('#s1').textContent = fmt(sub); $('#s2').textContent = ship ? fmt(ship) : 'Free'; $('#s3').textContent = fmt(sub + ship);
        const need = POLICY.freeShipFrom - sub, pct = Math.min(100, Math.round(sub / POLICY.freeShipFrom * 100));
        $('#ship-note').textContent = need > 0 ? 'Add ' + fmt(need) + ' more for free delivery' : 'You get free delivery';
        $('#bar-fill').style.width = pct + '%'; $('#bar').setAttribute('aria-valuenow', pct);
      }
      $('#lines').onclick = e => {
        const b = e.target.closest('[data-a]'); if (!b) return;
        const id = Number(b.dataset.id);
        if (b.dataset.a === 'inc') change(id, 1);
        if (b.dataset.a === 'dec') change(id, -1);
        if (b.dataset.a === 'rm') { cart = cart.filter(i => i.id !== id); save(); }
        draw();
      };
      function order() {
        const f = $('#order'); if (!f.reportValidity()) return null;
        const d = new FormData(f), sub = total(), amt = sub + (sub >= POLICY.freeShipFrom ? 0 : POLICY.shipFee);
        const lines = cart.map(i => '• ' + get(i.id).name + ' x' + i.qty + ' — ' + fmt(get(i.id).price * i.qty));
        try { localStorage.setItem('deskobs-details', JSON.stringify({ name: d.get('name'), phone: d.get('phone'), address: d.get('address') })); } catch (e) {}
        return { amt, msg: 'Hi ' + BRAND + ', I\'d like to order:\n\n' + lines.join('\n') + '\n\nTotal: ' + fmt(amt) + '\n\nPayment: ' + (d.get('pay') === 'COD' ? 'Cash on delivery' : 'UPI') + '\nName: ' + d.get('name') + '\nPhone: ' + d.get('phone') + '\nAddress: ' + d.get('address') };
      }
      $('#wa').onclick = () => { const o = order(); if (o) { open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(o.msg), '_blank'); $('#done').hidden = false; } };
      $('#place').onclick = async () => {            // real order: the server checks prices and stock
        const o = order(); if (!o) return;
        const d = new FormData($('#order'));
        try {
          const r = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart, name: d.get('name'), phone: d.get('phone'), address: d.get('address'), pay: d.get('pay'), code: $('#code').value }) });
          const j = await r.json();
          if (!r.ok) return toast(j.error || 'Could not place the order.');
          cart = []; save(); draw();
          $('#done').innerHTML = '<b>Order #' + j.id + ' placed.</b> Total ' + fmt(j.total) + (j.discount ? ' (code saved you ' + fmt(j.discount) + ')' : '') + ', ' + (j.pay === 'COD' ? 'cash on delivery' : 'UPI') + '. We will confirm it by phone or WhatsApp.';
          $('#done').hidden = false;
        } catch (e) { toast('Online ordering needs the server. Use the WhatsApp button instead.'); }
      };
      $('#clear').onclick = () => { cart = []; save(); $('#done').hidden = true; draw(); };
      $('#upi').onclick = () => { const o = order(); if (o) location.href = 'upi://pay?pa=' + UPI + '&pn=' + encodeURIComponent(BRAND) + '&am=' + o.amt + '&cu=INR&tn=' + encodeURIComponent(BRAND + ' order'); };
      draw();
    },

    account() {
      auth((live, me) => {
        if (!me) return location.replace('login.html');
        $('#who').textContent = me.name; $('#member').hidden = false;
        if (live) fetch('/api/orders/mine').then(r => r.json()).then(l => { $('#orders').innerHTML = l.length ? l.map(o => '<b>Order #' + o.id + '</b>, ' + esc(o.status) + ', ' + fmt(o.total) + '<br>' + o.items.map(i => esc(i.name) + ' x' + i.qty).join(', ')).join('<br><br>') : 'No orders yet. <a href="shop.html"><u>Browse the shop</u></a>'; });
        else $('#orders').textContent = 'Demo account. Orders show here when the server is running.';
        $('#out').onclick = async () => { if (live) await api('/api/logout', {}); else localStorage.removeItem('deskobs-user'); location.href = 'login.html'; };
      });
    },

    signup() {
      auth((live, me) => {
        if (me) return location.replace('account.html');
        $('#demo').hidden = live;
        $('#reg').onsubmit = async e => {
          e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
          try { live ? await api('/api/register', d) : await demoSignup(d); location.href = 'account.html'; } catch (er) { $('#msg').textContent = er.message; }
        };
      });
    },

    forgot() {
      $('#fg').onsubmit = async e => {
        e.preventDefault();
        try { await api('/api/forgot', Object.fromEntries(new FormData(e.target))); $('#fg').hidden = true; $('#sent').hidden = false; $('#msg').textContent = ''; }
        catch (er) { $('#msg').textContent = er.api ? er.message : 'Password reset needs the store server to be running.'; }
      };
    },

    reset() {
      const token = new URLSearchParams(location.search).get('token') || '';
      if (!token) { $('#rs').hidden = true; $('#msg').textContent = 'This link is missing its code. Ask for a new reset link.'; return; }
      $('#rs').onsubmit = async e => {
        e.preventDefault();
        try { await api('/api/reset', { token: token, password: new FormData(e.target).get('password') }); location.href = 'login.html?reset=1'; }
        catch (er) { $('#msg').textContent = er.api ? er.message : 'Could not reach the store server. Try again.'; }
      };
    },

    login() {
      if (new URLSearchParams(location.search).get('reset')) $('#ok').hidden = false;
      auth((live, me) => {
        if (me) return location.replace('account.html');
        $('#demo').hidden = live;
        $('#log').onsubmit = async e => {
          e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
          try { live ? await api('/api/login', d) : await demoLogin(d); location.href = 'account.html'; } catch (er) { $('#msg').textContent = er.message; }
        };
      });
    },

    policies() {
      const d = POLICY.deliveryDays;
      $('#pol').innerHTML = '<h1>Shipping and returns</h1>' +
        '<h2>Delivery</h2><p>Orders usually arrive ' + d[0] + ' to ' + d[1] + ' days after we confirm them. Delivery is free above ' + fmt(POLICY.freeShipFrom) + '. Below that it costs ' + fmt(POLICY.shipFee) + '.</p>' +
        '<h2>Returns</h2><p>Unused items can be returned within ' + POLICY.returnDays + ' days of delivery. Message us on WhatsApp with your order details and we will arrange it.</p>' +
        '<h2>Payment</h2><p>Pay by UPI or cash on delivery. We confirm every order on WhatsApp before it ships.</p>' +
        '<h2>Privacy</h2><p>Your bag and saved delivery details stay in your own browser. When you order, the details you type go to us in a WhatsApp message. This site has no analytics or advertising code. Fonts load from Google Fonts.</p>';
    },

    contact() {
      $('#cf').onsubmit = e => {
        e.preventDefault();
        const d = new FormData(e.target);
        open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent('Hi ' + BRAND + ', I am ' + d.get('name') + '.\n' + d.get('message')), '_blank');
      };
    }
  };

  /* ---------- PRODUCT HELPER: matches your words to the catalogue (no AI model, no data sent anywhere) ---------- */
  const RULES = [[/laptop|stand|posture|neck|screen/, [3]], [/mouse|click|quiet/, [6, 13, 14]], [/charg|power|adapter|battery/, [7, 8, 15]], [/lamp|light|eye|dark|night|glare/, [9, 10]], [/bag|carry|travel|commute|backpack/, [11]], [/\bmat\b|pad|surface/, [1]], [/organi|clutter|cable|tidy|mess|pen|tray|drawer|wood/, [2, 8, 16, 17]], [/phone/, [4, 12, 15]], [/earphone|headphone|airpod/, [5]]];
  function suggest(t) {
    t = t.toLowerCase();
    const budget = ((t.match(/\d[\d,]*/g) || []).map(n => parseInt(n.replace(/,/g, ''), 10)).find(n => n >= 300)) || 0;
    const inch = t.match(/(\d{2})\s*(?:inch|in\b|")/), big = inch && Number(inch[1]) > 16 && /laptop|stand/.test(t);
    const hits = PRODUCTS.map(p => ({ p: p, s: RULES.reduce((a, r) => a + (r[0].test(t) && r[1].includes(p.id) ? 2 : 0), 0) + (/gift/.test(t) ? p.rating / 10 : 0) }))
      .filter(x => x.s > 0 && maxQty(x.p) > 0 && (!budget || x.p.price <= budget) && !(big && x.p.id === 3))
      .sort((a, b) => b.s - a.s || b.p.rating - a.p.rating).slice(0, 3);
    const note = big ? 'Our laptop stand fits up to 16 inch, so a ' + inch[1] + ' inch laptop will not sit right on it. ' : '';
    if (!hits.length) return note + (big ? 'Browse the other desk and tech objects in the shop.' : budget ? 'Nothing in stock matches that budget. Try a little higher.' : 'I could not match that. Try words like laptop, lamp, mouse, bag or charger, or browse the shop.');
    return note + 'These should suit you:<ul>' + hits.map(x => '<li><a href="product.html?id=' + x.p.id + '">' + esc(x.p.name) + '</a> ' + fmt(x.p.price) + '</li>').join('') + '</ul>';
  }
  function helper() {
    const btn = document.createElement('button'); btn.className = 'helper-btn'; btn.type = 'button'; btn.textContent = 'Help me choose'; btn.setAttribute('aria-expanded', 'false');
    const box = document.createElement('section'); box.className = 'helper'; box.hidden = true; box.setAttribute('aria-label', 'Product helper');
    box.innerHTML = '<p>Tell me what you need and your budget. I will point to things in the shop.</p><div class="h-chips">' +
      ['Stand for my 15 inch laptop', 'Fix my cable clutter', 'Lamp under 2500', 'Gift under 1500'].map(t => '<button type="button" class="chip">' + t + '</button>').join('') +
      '</div><div class="h-out" role="status" aria-live="polite"></div><form class="h-form"><input aria-label="What do you need?" placeholder="e.g. quiet mouse under 1500" autocomplete="off"><button class="btn small" type="submit">Ask</button></form>';
    document.body.append(btn, box);
    const out = $('.h-out', box), inp = $('input', box);
    const ask = t => { if (t.trim()) out.innerHTML = suggest(t); };
    const set = o => { box.hidden = !o; btn.setAttribute('aria-expanded', String(o)); if (o) inp.focus(); };
    btn.onclick = () => set(box.hidden);
    box.onsubmit = e => { e.preventDefault(); ask(inp.value); };
    box.onclick = e => { const c = e.target.closest('.chip'); if (c) { inp.value = c.textContent; ask(c.textContent); } };
    box.onkeydown = e => { if (e.key === 'Escape') { set(false); btn.focus(); } };
  }

  // home page pictures come from SITE_IMAGES in products.js; a placeholder shows until you add the file
  $$('[data-img]').forEach(el => {
    const src = (typeof SITE_IMAGES === 'undefined' ? {} : SITE_IMAGES)[el.dataset.img], ph = 'url("' + PH(el.getAttribute('aria-label') || 'Your photo here') + '") center/cover';
    el.style.background = (src ? 'url("' + src + '") center/cover, ' : '') + ph;
  });
  save();
  helper();
  const run = pages[document.body.dataset.page];
  if (run) run();
})();
