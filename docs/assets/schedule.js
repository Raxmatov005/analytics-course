/* The course calendar (Docsify plugin; the founder, 2026-10-28): one lesson opens each study day at 00:00 Tashkent time
and its homework closes at 23:59 on its due day (the same day, unless schedule.json's "due" names a later lesson). Lessons that have not opened yet are out of sight: gone from the menu, the
home page's plan, the course map, search and Previous/Next, and an old link to one shows only when it opens.
schedule.json says the days (its "_about" explains the fields); with no "start" nothing is locked. The bot (worker.js)
walks the same calendar and is the real lock: it refuses a hand-in outside its day, and its /reopen gives one homework a
later last day, which GET /reopened tells this page. Dates are Tashkent dates (UTC+5) whatever her device's time zone.
?preview=1 (on any page) shows every lesson in this browser, for the mentor; ?preview=0 ends it.
window.ALSched: ready (a promise), on(), studyDay(iso) (true / false, null with no schedule), state(id) "soon" | "open" | "closed", opens(id), lastDay(id), nice(iso),
idOf(href), weekOpen(n). Lesson ids as in the bot: W1D2 for weeks/week-01/day-2. */
(function () {
  var WORKER = 'https://nur-feedback-bot.sohajon2005.workers.dev', PREVIEW = 'al.preview';
  var dates = null, due = {}, reopen = {};
  function T(en, ru) { return window.ALLang ? window.ALLang.t(en, ru) : en; }
  function ls(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* private mode */ }
    return null;
  }
  var q = /[?&]preview=([01])/.exec(location.hash);
  if (q) ls(PREVIEW, q[1] === '1' ? '1' : null);
  if (q && q[1] === '0' && ls('al.mentor') === '1') { ls('al.mentor', null); ls('al.who', null); }   // the mentor signs out
  var preview = ls(PREVIEW) === '1';

  function dayAfter(iso, n) { return new Date(Date.parse(iso + 'T12:00:00Z') + n * 86400000).toISOString().slice(0, 10); }
  function today() { return new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10); }
  /* the same walk as worker.js lessonDates */
  var file = null;   // schedule.json as read
  /* a day with a lesson: Monday to Friday, or every day with "weekends": true; never an "off" day */
  function study(iso) {
    var w = new Date(iso + 'T12:00:00Z').getUTCDay();
    return (file && file.weekends || (w !== 0 && w !== 6)) && !(file && (file.off || []).indexOf(iso) >= 0);
  }
  function walk(s) {
    if (!s || !s.start || !s.order) return null;
    var fixed = s.dates || {}, out = {}, d = s.start;
    while (!study(d)) d = dayAfter(d, 1);
    s.order.forEach(function (id) {
      if (fixed[id]) { out[id] = fixed[id]; return; }
      out[id] = d;
      do d = dayAfter(d, 1); while (!study(d));
    });
    return out;
  }
  function on() { return !!dates && !preview; }
  function lastDay(id) {   // its lesson's day, or the later lesson's it is due on ("due"), or the mentor's reopen date
    var own = dates[due[id]] || dates[id];
    return reopen[id] && reopen[id] > (own || '') ? reopen[id] : own;
  }
  function state(id) {
    if (!on() || !id || !dates[id]) return 'open';
    var t = today();
    return t < dates[id] ? 'soon' : t > lastDay(id) ? 'closed' : 'open';
  }
  function nice(iso) {
    var d = new Date(iso + 'T12:00:00Z'), ru = window.ALLang && window.ALLang.isRu();
    return ru ? d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long', timeZone: 'UTC' })
      : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
  }
  function idOf(href) {
    var m = /(?:^|\/)weeks\/week-(\d\d)\/day-(\d)(?:\.md)?(?:[?#]|$)/.exec(href || '');
    return m ? 'W' + Number(m[1]) + 'D' + m[2] : null;
  }
  function weekOpen(n) {
    if (!on()) return true;
    for (var d = 0; d <= 6; d++) if (dates['W' + n + 'D' + d] && state('W' + n + 'D' + d) !== 'soon') return true;
    return false;
  }
  function next() {   // the next lesson to open
    var t = today(), best = null;
    Object.keys(dates || {}).forEach(function (id) { if (dates[id] > t && (!best || dates[id] < dates[best])) best = id; });
    return best;
  }
  function current() {   // the latest lesson that has opened
    var t = today(), best = null;
    Object.keys(dates || {}).forEach(function (id) { if (dates[id] <= t && (!best || dates[id] > dates[best])) best = id; });
    return best;
  }
  function pathOf(id) {
    var m = /^W(\d+)D(\d)$/.exec(id);
    return 'weeks/week-' + (m[1].length < 2 ? '0' : '') + m[1] + '/day-' + m[2];
  }
  var LOCK = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" ' +
    'stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>';

  var ready = Promise.all([
    fetch('schedule.json?t=' + Math.floor(Date.now() / 60000), { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
    new Promise(function (res) {   // the mentor's reopened homework; the page does not wait long for it
      var done = false, t = setTimeout(function () { if (!done) { done = true; res({}); } }, 3000);
      fetch(WORKER + '/reopened', { cache: 'no-store' }).then(function (r) { return r.json(); })
        .then(function (j) { if (!done) { done = true; clearTimeout(t); res(j.reopen || {}); } })
        .catch(function () { if (!done) { done = true; clearTimeout(t); res({}); } });
    })
  ]).then(function (res) { file = res[0]; dates = walk(res[0]); due = (res[0] && res[0].due) || {}; reopen = res[1]; });

  window.ALSched = { ready: ready, on: on, state: state, opens: function (id) { return dates && dates[id]; }, lastDay: lastDay,
    nice: nice, idOf: idOf, weekOpen: weekOpen, today: today,
    studyDay: function (iso) { return on() ? study(iso) : null; } };

  /* ---------- a lesson that has not opened: only when it opens ---------- */
  function lockedPage(id) {
    var cur = current(), link = cur ? (window.ALLang ? window.ALLang.link('#/' + pathOf(cur)) : '#/' + pathOf(cur)) : null;
    return '<div class="sch-lock"><span class="sch-lock-ico">' + LOCK + '</span>' +
      '<h1>' + T('Opens ', 'Откроется ') + nice(dates[id]) + T(' at 00:00', ' в 00:00') + '</h1>' +
      '<p>' + T('One lesson opens each study day' + (file && file.weekends ? '' : ', Monday to Friday,') + ' at 00:00 (Tashkent time). Each homework can be handed in until 23:59 on the day it is due.',
        'Каждый учебный день' + (file && file.weekends ? '' : ', с понедельника по пятницу,') + ' в 00:00 (по Ташкенту) открывается один урок. Каждое домашнее задание можно сдать до 23:59 дня, когда его срок.') + '</p>' +
      (link ? '<p><a class="sch-go" href="' + link + '">' + T('Go to today’s lesson →', 'К сегодняшнему уроку →') + '</a></p>' : '') + '</div>';
  }

  /* ---------- everything that points at a lesson not open yet goes out of sight ---------- */
  function sweep() {
    frame = 0;
    if (!on()) { document.body.classList.remove('sch-wait'); return; }
    var hidden = 0, home = /^#\/(?:ru\/?)?(?:\?|$)/.test(location.hash || '#/') || !location.hash;
    Array.prototype.forEach.call(document.querySelectorAll('a[href*="weeks/week-"]'), function (a) {
      var id = idOf(a.getAttribute('href'));
      if (!id || state(id) !== 'soon') return;
      var box = a.closest('.sidebar-nav li, .pagination-item, .matching-post, .gx, .map-day') ||
        (home && a.closest('.markdown-section tr, .markdown-section li'));
      if (box && !box.classList.contains('sch-hide')) { box.classList.add('sch-hide'); }
      if (a.closest('.sidebar-nav')) hidden++;
    });
    // a week in the menu with no lesson left; a plan table on the home page with no row left, and its heading
    Array.prototype.forEach.call(document.querySelectorAll('.sidebar-nav > ul > li'), function (li) {
      var days = li.querySelectorAll('li');
      if (days.length && li.querySelectorAll('li:not(.sch-hide)').length === 0) li.classList.add('sch-hide');
    });
    if (home) Array.prototype.forEach.call(document.querySelectorAll('.markdown-section table'), function (t) {
      var rows = t.querySelectorAll('tbody tr');
      if (rows.length && t.querySelectorAll('tbody tr:not(.sch-hide)').length === 0) {
        t.classList.add('sch-hide');
        var h = t.previousElementSibling;
        if (h && /^H[23]$/.test(h.tagName)) h.classList.add('sch-hide');
      }
    });
    // a locked page shows its card and nothing the other plugins add (the feedback card, the day's challenge …)
    var lock = document.querySelector('.markdown-section .sch-lock');
    if (lock) {
      Array.prototype.forEach.call(lock.parentNode.children, function (el) { if (el !== lock) el.classList.add('sch-hide'); });
      var tt = lock.querySelector('h1').textContent;
      if (document.title !== tt) document.title = tt;   // Docsify names the tab after the lesson
    }
    // the page's own headings in the menu, when the heading itself went out of sight
    Array.prototype.forEach.call(document.querySelectorAll('.sidebar-nav .app-sub-sidebar a[href*="id="]'), function (a) {
      var m = /[?&]id=([^&]+)/.exec(a.getAttribute('href')), h = m && document.getElementById(decodeURIComponent(m[1]));
      if (h && h.classList.contains('sch-hide')) a.parentNode.classList.add('sch-hide');
    });
    var ul = document.querySelector('.sidebar-nav > ul'), nx = next();
    if (ul && hidden && nx && !ul.querySelector('.sch-next')) {
      var li = document.createElement('li');
      li.className = 'sch-next';
      li.innerHTML = LOCK + '<span>' + T('Next lesson opens ', 'Следующий урок откроется ') + nice(dates[nx]) + T(', 00:00', ', 00:00') + '</span>';
      ul.appendChild(li);
    }
    document.body.classList.remove('sch-wait');
  }
  var frame = 0;
  function soon() { if (!frame) frame = requestAnimationFrame(sweep); }

  /* ---------- an open lesson: the homework badge shows the real day; a closed one says so at the top ---------- */
  function lessonNotes(vm) {
    var id = idOf(vm.route.path), sec = document.querySelector('.markdown-section');
    if (!sec || !id || !on() || !dates[id]) return;
    Array.prototype.forEach.call(sec.querySelectorAll('.badge.hw'), function (b) {
      var m = /^(.*?)\s+—\s+(?:Due|срок)\b/.exec(b.textContent);
      if (m) b.textContent = m[1] + T(' — Due ', ' — срок: ') + nice(lastDay(id)) + ', 23:59';
    });
    if (state(id) === 'closed' && sec.querySelector('.badge.hw, pre[data-lang="workspace"], .sq-ws') && !sec.querySelector('.sch-note')) {
      var n = document.createElement('div');
      n.className = 'sch-note';
      n.innerHTML = LOCK + '<span>' + T('This homework closed on ', 'Это домашнее задание закрылось ') + nice(lastDay(id)) +
        T(' at 23:59. The lesson stays open: read it and practise as much as you like.', ' в 23:59. Урок остаётся открытым: читайте и тренируйтесь сколько угодно.') + '</span>';
      var h1 = sec.querySelector('h1');
      if (h1) h1.parentNode.insertBefore(n, h1.nextSibling); else sec.insertBefore(n, sec.firstChild);
    }
  }
  function previewBar() {
    if (!preview || document.querySelector('.sch-preview')) return;
    var b = document.createElement('div');
    b.className = 'sch-preview';
    var him = ls('al.mentor') === '1' && ls('al.who');   // signed in with his name + PIN (signin.js)
    var L = function (t) { return '<span class="sch-pv-long">' + t + '</span>'; }, S = function (t) { return '<span class="sch-pv-short">' + t + '</span>'; };
    b.innerHTML = (him   // the long words on a computer, the short ones on a phone (labs.css)
      ? L(T('Signed in as mentor ', 'Вы вошли как ментор ')) + S(T('Mentor ', 'Ментор ')) + '<b></b>' + L(T(': every lesson is shown.', ': видны все уроки.')) + ' · '
      : L(T('Mentor preview: every lesson is shown in this browser.', 'Просмотр ментора: в этом браузере видны все уроки.')) + S(T('Mentor preview', 'Просмотр ментора')) + ' · ') +
      '<a href="#/?preview=0">' + (him ? T('Sign out', 'Выйти') : T('End preview', 'Выйти из просмотра')) + '</a>';
    if (him) b.querySelector('b').textContent = him;
    b.querySelector('a').onclick = function (e) {   // a hash change alone left the preview on until a reload
      e.preventDefault();
      ls(PREVIEW, null);
      if (ls('al.mentor') === '1') { ls('al.mentor', null); ls('al.who', null); }
      location.hash = '#/'; location.reload();
    };
    document.body.appendChild(b);
  }

  document.documentElement.classList.add('sch-wait');
  document.addEventListener('DOMContentLoaded', function () { document.documentElement.classList.remove('sch-wait'); document.body.classList.add('sch-wait'); });
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook, vm) {
    hook.beforeEach(function (content, next) {
      ready.then(function () {
        var id = idOf(vm.route.path);
        next(id && state(id) === 'soon' ? lockedPage(id) : content);
      });
    });
    hook.doneEach(function () {
      ready.then(function () { lessonNotes(vm); previewBar(); sweep(); });
    });
    hook.ready(function () {
      ready.then(function () {
        new MutationObserver(soon).observe(document.body, { childList: true, subtree: true });
        sweep();
      });
    });
  });
})();
