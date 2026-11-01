/* The phone layout (the founder, 2026-11-02: "it seems like just a website that is mostly meant to be inside a laptop
is kind of squeezed into the phone screen … make it a proper version for a mobile screen size"). mobile.css draws it;
this file builds the parts CSS cannot. On a screen up to 768 px wide:
- an app bar: ☰ (the menu), the page's short name ("Week 6 · Day 3" over the day's title; a tap goes to the top), and
  the EN | RU and light / dark switches moved into it from their floating corner (lang.js and theme.js still own them).
  It slides away while she reads down and comes back when she scrolls up (nav.js's "reading-down"); a thin line under
  it shows how far down the page she is;
- the menu is a drawer over a dimmed page: Docsify's own ☰ is hidden and its "close" class (on a phone: "open") is set
  by ours; the weeks open one at a time (the current one open), a tap on the shade or a page link or Escape closes it;
- Today's route (sections.js) is a sticky row under the bar; the chip of the section on screen is lit and kept in view;
- an optional "Going further" section is folded behind one button;
- tables: short prose tables (up to 3 columns of sentences) become cards, a label over each value; other tables get a
  box of their own that scrolls sideways with the first column pinned, and a soft edge while there is more;
- SQL results and Python tables that are wider than the phone get "⤢ Full screen": the table over the whole screen.
On a wider screen nothing here changes the page (the switches go back to their corner). */
(function () {
  var PHONE = window.matchMedia ? window.matchMedia('(max-width: 768px)') : { matches: false, addListener: function () {} };
  function T(en, ru) { return window.ALLang ? window.ALLang.t(en, ru) : en; }
  function route() { return location.hash.replace(/^#/, '').replace(/\?.*$/, '') || '/'; }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  var bar, line;

  /* ---------- the bar and the drawer ---------- */
  function build() {
    if (bar) return;
    bar = document.createElement('header');
    bar.className = 'm-bar';
    bar.innerHTML = '<button type="button" class="m-menu"><span></span><span></span><span></span></button>' +
      '<a class="m-title" href="#/"><b></b><small></small></a><div class="m-tools"></div><i class="m-line" aria-hidden="true"></i>';
    document.body.insertBefore(bar, document.body.firstChild);
    var shade = document.createElement('div');
    shade.className = 'm-shade';
    document.body.appendChild(shade);
    line = bar.querySelector('.m-line');
    /* Docsify closes its menu on any click that reaches <body> on a phone: the tap that opened it, and every tap inside
       it; so those clicks stop at the button and at the menu, and the menu's own taps are handled here */
    bar.querySelector('.m-menu').onclick = function (e) { e.stopPropagation(); open(!document.body.classList.contains('m-open')); };
    var sb = document.querySelector('.sidebar');
    if (sb) sb.addEventListener('click', function (e) {
      if (!PHONE.matches) return;
      e.stopPropagation();
      var wk = e.target.closest('.sidebar-nav li.m-week > strong, .sidebar-nav li.m-week > p');
      if (wk) { wk.parentNode.classList.toggle('m-week-open'); return; }
      var a = e.target.closest('a');
      if (a && /^#\//.test(a.getAttribute('href') || '')) setTimeout(function () { open(false); }, 60);
    });
    shade.onclick = function () { open(false); };
    bar.querySelector('.m-title').onclick = function (e) {   // the name takes her to the top of this page
      if (route() !== '/' && route() !== '/ru/') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    };
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { open(false); full(null); } });
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t.closest) return;
      var chip = t.closest('.al-chip');   // a chip of a folded section opens it first
      if (chip) { var f = document.querySelectorAll('.markdown-section .al-sec')[Number(chip.getAttribute('data-i'))]; if (f && f.classList.contains('m-shut')) unfold(f); }
      if (t.closest('.sq-box, .py-box, .sq-play, .sq-lab, .sq-ws')) { setTimeout(wide, 400); setTimeout(wide, 1500); setTimeout(wide, 4000); }
    });
  }
  function open(on) {
    if (!PHONE.matches) return;
    var b = document.body;
    b.classList.toggle('close', on);
    b.classList.toggle('m-open', on);
    if (bar) bar.querySelector('.m-menu').setAttribute('aria-expanded', on ? 'true' : 'false');
    if (on) {
      var a = document.querySelector('.sidebar-nav li.active > a'), sb = document.querySelector('.sidebar');
      if (a && sb) sb.scrollTop = Math.max(0, a.getBoundingClientRect().top - sb.getBoundingClientRect().top + sb.scrollTop - sb.clientHeight / 3);
    }
  }
  function weeks() {   // a week in the menu: a header that opens its days; the week of the page open
    each(document.querySelectorAll('.sidebar-nav > ul > li'), function (li) {
      var head = li.querySelector(':scope > strong, :scope > p'), list = li.querySelector(':scope > ul');
      if (!head || !list) return;
      var here = !!li.querySelector('li.active');
      li.classList.add('m-week');
      li.classList.toggle('m-week-here', here);
      if (here) li.classList.add('m-week-open');
    });
  }
  function placeTools() {
    var sw = document.querySelector('.lang-switch');
    if (!sw || !bar) return;
    var slot = bar.querySelector('.m-tools');
    if (PHONE.matches && sw.parentNode !== slot) slot.appendChild(sw);
    if (!PHONE.matches && sw.parentNode === slot) document.body.appendChild(sw);
  }
  function name() {
    var h1 = document.querySelector('.markdown-section h1'), full = h1 ? h1.textContent.trim() : '';
    var m = /^((?:Week|Неделя)\s*\d+\s*·\s*(?:Day|День)\s*\d+)\s*[—–-]\s*(.+)$/.exec(full);
    var top = m ? m[1] : full, sub = m ? m[2] : '', home = route() === '/' || route() === '/ru/';
    if (home) { top = 'Analytics Learning'; sub = T('Start here', 'С чего начать'); }
    bar.querySelector('.m-title b').textContent = top;
    bar.querySelector('.m-title small').textContent = sub;
    bar.querySelector('.m-title').setAttribute('href', '#' + (/^\/ru(\/|$)/.test(route()) ? '/ru/' : '/'));
    bar.querySelector('.m-menu').setAttribute('aria-label', T('Menu', 'Меню'));
  }

  /* ---------- the day's sections ---------- */
  var hereI = -1;
  function track() {
    var frames = document.querySelectorAll('.markdown-section .al-sec'), i = -1;
    each(frames, function (f, k) { if (f.getBoundingClientRect().top < 140) i = k; });
    if (i === hereI) return;
    hereI = i;
    var chips = document.querySelector('.al-route-chips');
    if (!chips) return;
    each(chips.querySelectorAll('.al-chip'), function (c) { c.classList.toggle('m-here', Number(c.getAttribute('data-i')) === i); });
    var c = chips.querySelector('.al-chip.m-here');
    if (c && PHONE.matches) chips.scrollTo({ left: Math.max(0, c.offsetLeft - 16), behavior: 'smooth' });
  }
  function unfold(f) {
    f.classList.remove('m-shut');
    var b = f.querySelector('.m-unfold');
    if (b) b.remove();
  }
  function folds() {   // "Going further" (optional) is folded on a phone; one button opens it
    if (!PHONE.matches) return;
    each(document.querySelectorAll('.markdown-section .al-sec[data-kind="extra"]'), function (f) {
      if (f.querySelector('.m-unfold') || f.getAttribute('data-m-seen')) return;
      f.setAttribute('data-m-seen', '1');
      f.classList.add('m-shut');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'm-unfold';
      b.textContent = T('Open this optional part', 'Открыть эту часть (по желанию)');
      b.onclick = function () { unfold(f); };
      f.querySelector('.al-sec-head').insertAdjacentElement('afterend', b);
    });
  }

  /* ---------- tables, code and wide results ---------- */
  function tables() {
    each(document.querySelectorAll('.markdown-section table'), function (t) {
      if (t.getAttribute('data-m') || t.closest('.sq-scroll, .gx, .xp, .sy, .qz, .board, .rv, .pic, .m-full')) return;
      t.setAttribute('data-m', '1');
      var rows = t.querySelectorAll('tr'), heads = t.querySelectorAll('thead th'), cols = heads.length || (rows[0] ? rows[0].children.length : 0);
      var cells = t.querySelectorAll('tbody td'), chars = 0;
      each(cells, function (td) { chars += td.textContent.trim().length; });
      if (cols >= 2 && cols <= 3 && heads.length && cells.length >= 4 && chars / cells.length > 26 && !t.classList.contains('pts')) {
        t.classList.add('m-stack');   // short prose: cards, a label over each value
        each(t.querySelectorAll('tbody tr'), function (tr) { each(tr.children, function (td, k) { if (heads[k]) td.setAttribute('data-label', heads[k].textContent.trim()); }); });
        return;
      }
      var w = document.createElement('div');
      w.className = 'm-scroll' + (cols >= 4 ? ' m-pin' : '');
      t.parentNode.insertBefore(w, t);
      w.appendChild(t);
    });
  }
  function edge(el) {
    var more = el.scrollWidth > el.clientWidth + 2 && el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
    el.classList.toggle('m-more', more);
    if (!el.m_bound) { el.m_bound = 1; el.addEventListener('scroll', function () { edge(el); }, { passive: true }); }
  }
  function wide() {
    if (!PHONE.matches) return;
    each(document.querySelectorAll('.m-scroll, .markdown-section pre:not(.hi-back), .sq-scroll'), edge);
    each(document.querySelectorAll('.sq-scroll, .py-value'), function (box) {   // results wider than the phone: a full-screen view
      var prev = box.previousElementSibling, has = prev && prev.classList.contains('m-fs'), over = box.scrollWidth > box.clientWidth + 8;
      if (!over && has) prev.remove();
      if (!over || has) return;
      var cols = box.querySelector('tr') ? box.querySelector('tr').children.length : 0;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'm-fs';
      b.textContent = '⤢ ' + T('Full screen', 'На весь экран') + (cols ? ' · ' + cols + T(' columns', ' столбцов') : '');
      b.onclick = function () { full(box); };
      box.parentNode.insertBefore(b, box);
    });
  }
  var shown = null, closer = null, spot = null;
  function full(box) {   // the box moves to <body> while it is full screen (above every layer of the page), then back
    if (shown) {
      shown.classList.remove('m-full'); document.body.classList.remove('m-lock');
      var sheet = shown.parentNode;
      if (spot && spot.parentNode) spot.parentNode.replaceChild(shown, spot);
      if (sheet && sheet.classList.contains('m-sheet')) sheet.remove();
      if (closer) closer.remove();
      shown = closer = spot = null;
    }
    if (!box) return;
    shown = box;
    spot = document.createComment('m-full');
    box.parentNode.replaceChild(spot, box);
    var sheet = document.createElement('div');   // a page of its own, so the course's table styles still apply
    sheet.className = 'markdown-section m-sheet';
    sheet.appendChild(box);
    document.body.appendChild(sheet);
    box.classList.add('m-full');
    document.body.classList.add('m-lock');
    closer = document.createElement('button');
    closer.type = 'button';
    closer.className = 'm-full-x';
    closer.textContent = '✕ ' + T('Close', 'Закрыть');
    closer.onclick = function () { full(null); };
    document.body.appendChild(closer);
  }

  function progress() {
    if (!line) return;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    line.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
  }
  function page() {
    build(); placeTools(); name(); open(false); full(null); weeks();
    hereI = -1;
    setTimeout(function () { placeTools(); weeks(); folds(); tables(); wide(); track(); progress(); }, 150);   // after sections.js and the engines
    setTimeout(function () { tables(); wide(); }, 1500);   // blocks that draw late (pictures, results)
  }
  window.addEventListener('scroll', function () { progress(); track(); }, { passive: true });
  window.addEventListener('resize', function () { placeTools(); progress(); });
  var onChange = function () { if (!PHONE.matches) { open(false); full(null); } placeTools(); folds(); wide(); };
  if (PHONE.addEventListener) PHONE.addEventListener('change', onChange); else PHONE.addListener(onChange);
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) { hook.doneEach(page); });
})();
