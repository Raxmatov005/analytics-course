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
- SQL results and Python tables that are wider than the phone get "⤢ Full screen": the table over the whole screen;
- a day with three sections or more shows one section at a time (pages(); "do the four bigger reworks", 2026-11-02),
  an explorer one step at a time with its next goal pinned over the playground, a hand-in of four tasks or more (an
  exam's Part B) one task at a time with "‹ Task 3 of 8 ›", and the matching game's meanings in a sheet.
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
    document.addEventListener('click', function (e) {   // first (capture): a chip opens its section before sections.js scrolls to it
      var chip = e.target.closest && e.target.closest('.al-chip');
      if (!chip) return;
      var i = Number(chip.getAttribute('data-i')), f = frames()[i];
      if (paged) show(i, 'none');
      if (f && f.classList.contains('m-shut')) unfold(f);
    }, true);
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t.closest) return;
      var go = t.closest('.m-secnav button');
      if (go) { show(Number(go.getAttribute('data-go')), 'top'); return; }
      if (t.closest('.xp-opt')) setTimeout(function () { each(document.querySelectorAll('.markdown-section .xp'), xpPaint); }, 30);
      if (t.closest('.gx-match')) matchSheet();
      if (t.closest('.sq-box, .py-box, .sq-play, .sq-lab, .sq-ws')) { setTimeout(wide, 400); setTimeout(wide, 1500); setTimeout(wide, 4000); }
    });
    document.addEventListener('al:change', function () { each(document.querySelectorAll('.markdown-section .xp'), xpPaint); });
    window.addEventListener('hashchange', function () { if (paged) { var i = target(); if (i != null) show(i, 'target'); } });
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

  /* ---------- the day's sections: one at a time on a phone ----------
     A day is 55 000–87 000 px tall on a phone (the audit). With three sections or more, only one is on screen: the title,
     its badges and the sticky row of sections stay on top, the day's opening story shows with the first section only,
     Previous / Next day only after the last. Every section ends with "‹ Previous section · Next section ›". A chip, a
     link to a heading inside another section (?id=…) or the menu's outline opens that section. Hidden sections keep
     their width (height 0, not display: none), so the boxes inside measure and draw as usual. The open section of
     each day is remembered on this phone (al.msec) and comes back when she returns. */
  var hereI = -1, paged = false;
  function frames() { return document.querySelectorAll('.markdown-section .al-sec'); }
  function remember(i) { try { var m = JSON.parse(localStorage.getItem('al.msec') || '{}'); m[route()] = i; localStorage.setItem('al.msec', JSON.stringify(m)); } catch (e) { /* private window */ } }
  function recalled() { try { return (JSON.parse(localStorage.getItem('al.msec') || '{}'))[route()]; } catch (e) { return null; } }
  function pages() {
    var fs = frames(), ms = document.querySelector('.markdown-section');
    paged = PHONE.matches && fs.length >= 3;
    document.body.classList.toggle('m-paged', paged);
    if (!paged) { each(document.querySelectorAll('.m-off'), function (e) { e.classList.remove('m-off'); }); return; }
    each(fs, function (f, k) {   // the section's own footer: back and on
      if (f.querySelector('.m-secnav')) return;
      var nav = document.createElement('nav');
      nav.className = 'm-secnav';
      var prev = fs[k - 1], next = fs[k + 1];
      nav.innerHTML = (prev ? '<button type="button" class="m-sec-prev" data-go="' + (k - 1) + '"><small>' + T('‹ Previous', '‹ Назад') + '</small><b>' + esc(prev.getAttribute('data-name') || '') + '</b></button>' : '') +
        (next ? '<button type="button" class="m-sec-next" data-go="' + (k + 1) + '"><small>' + T('Next section ›', 'Следующий раздел ›') + '</small><b>' + esc(next.getAttribute('data-name') || '') + '</b></button>' : '');
      (f.querySelector('.al-sec-body') || f).appendChild(nav);
    });
    var want = target(), i = want != null ? want : recalled();
    show(i != null && i < fs.length ? i : 0, want != null ? 'target' : 'none');
  }
  function target() {   // the section that holds ?id=… of the address
    var m = /[?&]id=([^&]+)/.exec(location.hash), el = m && document.getElementById(decodeURIComponent(m[1]));
    var f = el && el.closest('.al-sec');
    return f ? Array.prototype.indexOf.call(frames(), f) : null;
  }
  function show(i, scroll) {
    var fs = frames(), ms = document.querySelector('.markdown-section'), first = fs[0];
    if (!paged || !fs[i]) return;
    each(fs, function (f, k) { f.classList.toggle('m-off', k !== i); });
    var n = first ? first.previousElementSibling : null;   // the day's opening (its story) shows with the first section only
    while (n && !n.classList.contains('al-route') && n.tagName !== 'H1') { n.classList.toggle('m-off', i !== 0); n = n.previousElementSibling; }
    var after = fs[fs.length - 1].nextElementSibling;   // what follows the last section (feedback, Previous / Next day): with it only
    while (after) { after.classList.toggle('m-off', i !== fs.length - 1); after = after.nextElementSibling; }
    hereI = -1; light(i); remember(i);
    if (fs[i].classList.contains('m-shut')) unfold(fs[i]);
    if (scroll === 'top') window.scrollTo({ top: Math.max(0, fs[i].getBoundingClientRect().top + window.scrollY - 112), behavior: 'auto' });
    if (scroll === 'target') setTimeout(function () {
      var m = /[?&]id=([^&]+)/.exec(location.hash), el = m && document.getElementById(decodeURIComponent(m[1]));
      if (el) el.scrollIntoView({ block: 'start' });
    }, 60);
    setTimeout(function () { tables(); wide(); progress(); }, 80);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function light(i) {
    if (i === hereI) return;
    hereI = i;
    var chips = document.querySelector('.al-route-chips');
    if (!chips) return;
    each(chips.querySelectorAll('.al-chip'), function (c) { c.classList.toggle('m-here', Number(c.getAttribute('data-i')) === i); });
    var c = chips.querySelector('.al-chip.m-here');
    if (c && PHONE.matches) chips.scrollTo({ left: Math.max(0, c.offsetLeft - 16), behavior: 'smooth' });
  }
  function track() {
    if (paged) return;   // one section on screen: the chip was lit when it opened
    var i = -1;
    each(frames(), function (f, k) { if (f.getBoundingClientRect().top < 140) i = k; });
    light(i);
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

  /* ---------- explorers: one step on screen (Guess · Play · Goals), the next goal pinned over the playground ---------- */
  function explorers() {
    each(document.querySelectorAll('.markdown-section .xp'), function (x) {
      if (x.querySelector('.m-xp-tabs') || !x.querySelector('.xp-play')) return;
      var tabs = document.createElement('div');
      tabs.className = 'm-xp-tabs';
      tabs.innerHTML = '<button type="button" data-s="1">' + T('1 · Guess', '1 · Угадать') + '</button><button type="button" data-s="2">' + T('2 · Play', '2 · Играть') +
        '</button><button type="button" data-s="3">' + T('3 · Goals', '3 · Задания') + ' <span class="m-xp-n"></span></button>';
      x.querySelector('.xp-head').insertAdjacentElement('afterend', tabs);
      var goal = document.createElement('div');
      goal.className = 'm-xp-goal';
      x.querySelector('.xp-play').insertBefore(goal, x.querySelector('.xp-play').firstChild.nextSibling);
      var on = document.createElement('button');
      on.type = 'button';
      on.className = 'm-xp-on';
      on.textContent = T('Now play with it ›', 'Теперь поиграйте ›');
      if (x.querySelector('.xp-predict')) x.querySelector('.xp-predict').appendChild(on);
      tabs.onclick = function (e) { var b = e.target.closest('button'); if (b && !b.disabled) xpGo(x, Number(b.getAttribute('data-s'))); };
      on.onclick = function () { xpGo(x, 2); };
      xpGo(x, x.querySelector('.xp-predict') && x.querySelector('.xp-play').hidden ? 1 : 2, true);
    });
    each(document.querySelectorAll('.markdown-section .xp'), xpPaint);
  }
  function xpGo(x, s, quiet) {
    x.classList.remove('m-xp-1', 'm-xp-2', 'm-xp-3');
    x.classList.add('m-xp', 'm-xp-' + s);
    x.setAttribute('data-m-s', s);
    xpPaint(x);
    if (!quiet) { var r = x.getBoundingClientRect(); if (r.top < 100 || r.top > window.innerHeight * 0.6) window.scrollTo({ top: r.top + window.scrollY - 110, behavior: 'smooth' }); }
  }
  function xpPaint(x) {
    var tabs = x.querySelector('.m-xp-tabs');
    if (!tabs) return;
    var s = Number(x.getAttribute('data-m-s') || 1), locked = x.querySelector('.xp-play').hidden;
    each(tabs.querySelectorAll('button'), function (b) { var k = Number(b.getAttribute('data-s')); b.classList.toggle('on', k === s); b.disabled = k > 1 && locked; });
    var all = x.querySelectorAll('.xp-list li'), done = x.querySelectorAll('.xp-list li.ok'), next = x.querySelector('.xp-list li:not(.ok)');
    tabs.querySelector('.m-xp-n').textContent = all.length ? done.length + '/' + all.length : '';
    var on = x.querySelector('.m-xp-on');
    if (on) on.hidden = locked;
    var goal = x.querySelector('.m-xp-goal');
    goal.innerHTML = !all.length ? '' : next ? '<small>' + T('Goal ', 'Задание ') + (done.length + 1) + T(' of ', ' из ') + all.length + '</small>' + next.querySelector('span:last-child').innerHTML
      : '<small>' + T('All goals done', 'Все задания выполнены') + '</small>✓';
  }

  /* ---------- a long hand-in (an exam's Part B): one task on screen, ‹ Task 3 of 8 › under it ---------- */
  function handins() {
    each(document.querySelectorAll('.markdown-section .sq-ws'), function (w) {
      var tasks = w.querySelectorAll('.sq-task');
      if (tasks.length < 4 || w.querySelector('.m-pager')) return;
      var pager = document.createElement('nav');
      pager.className = 'm-pager';
      pager.innerHTML = '<button type="button" class="m-pg-prev">‹ ' + T('Back', 'Назад') + '</button><span class="m-pg-at"></span><button type="button" class="m-pg-next">' + T('Next', 'Далее') + ' ›</button>';
      tasks[tasks.length - 1].insertAdjacentElement('afterend', pager);
      w.classList.add('m-tasks');
      var at = 0;
      function go(k) {
        at = Math.max(0, Math.min(tasks.length - 1, k));
        each(tasks, function (t, j) { t.classList.toggle('m-cur', j === at); });
        var answered = Array.prototype.filter.call(tasks, function (t) { var ta = t.querySelector('textarea'); return t.classList.contains('ok') || (ta && ta.value.trim()) || t.querySelector('.sq-file'); }).length;
        pager.querySelector('.m-pg-at').innerHTML = '<b>' + T('Task ', 'Задание ') + (at + 1) + T(' of ', ' из ') + tasks.length + '</b><small>' + answered + T(' answered', ' с ответом') + '</small>';
        pager.querySelector('.m-pg-prev').disabled = at === 0;
        pager.querySelector('.m-pg-next').textContent = at === tasks.length - 1 ? T('To Submit ↓', 'К отправке ↓') : T('Next', 'Далее') + ' ›';
      }
      pager.querySelector('.m-pg-prev').onclick = function () { go(at - 1); tasks[at].scrollIntoView({ block: 'start' }); window.scrollBy(0, -110); };
      pager.querySelector('.m-pg-next').onclick = function () {
        if (at === tasks.length - 1) { var f = w.querySelector('.sq-ws-foot'); if (f) f.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
        go(at + 1); tasks[at].scrollIntoView({ block: 'start' }); window.scrollBy(0, -110);
      };
      w.addEventListener('input', function () { go(at); });
      go(0);
    });
  }

  /* ---------- the matching game: one column of words; a picked word opens its meanings in a sheet ---------- */
  function matchSheet() {
    each(document.querySelectorAll('.markdown-section .gx-match'), function (m) {
      var pick = m.querySelector('.gx-term.gx-sel'), mean = m.children[1];
      m.classList.toggle('m-pick', !!pick && PHONE.matches);
      if (mean) mean.setAttribute('data-m-head', pick ? T('The meaning of “', 'Значение «') + pick.textContent.replace(/^\d+/, '').trim() + T('”', '»') : '');
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
    paged = false;
    setTimeout(function () { placeTools(); weeks(); folds(); explorers(); handins(); matchSheet(); tables(); pages(); wide(); track(); progress(); }, 150);   // after sections.js and the engines
    setTimeout(function () { tables(); wide(); }, 1500);   // blocks that draw late (pictures, results)
  }
  window.addEventListener('scroll', function () { progress(); track(); }, { passive: true });
  window.addEventListener('resize', function () { placeTools(); progress(); });
  var onChange = function () { if (!PHONE.matches) { open(false); full(null); } placeTools(); folds(); pages(); matchSheet(); wide(); };
  if (PHONE.addEventListener) PHONE.addEventListener('change', onChange); else PHONE.addListener(onChange);
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) { hook.doneEach(page); });
})();
