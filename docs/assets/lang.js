/* English / Russian for the Analytics Learning site (Docsify plugin).
The English pages live where they always did; the Russian copy of each page lives under ru/ with the same path
(weeks/week-01/day-2.md → ru/weeks/week-01/day-2.md), so quiz ids, progress and hand-ins stay the same in both.
- the language of a page is its route: #/ru/... is Russian, everything else English;
- the EN | RU switch (top right) opens the same page in the other language and remembers the choice (key "al.lang");
- on a Russian page every course link that points at an English page is sent to its Russian copy, so the pages and
  the scripts can keep their plain links;
- scripts translate their own words with ALLang.t('English', 'Русский'), called while they draw. */
(function () {
  var KEY = 'al.lang';

  function routePath() { return location.hash.replace(/^#/, '').replace(/\?.*$/, '') || '/'; }
  function isRu(path) { return /^\/ru(\/|$)/.test(path); }
  function current() { return isRu(routePath()) ? 'ru' : 'en'; }
  function pref() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function remember(l) { try { localStorage.setItem(KEY, l); } catch (e) { /* private window: the switch still works */ } }

  /* the same page in the other language: '/weeks/a' ↔ '/ru/weeks/a', '/' ↔ '/ru/' */
  function toLang(path, l) {
    var plain = path.replace(/^\/ru(\/|$)/, '/');
    return l === 'ru' ? '/ru' + plain : plain;
  }
  /* an English course link → its Russian copy (leaves outside links, anchors and assets alone) */
  function ruHref(href) {
    if (!href) return href;
    var m = /^#(\/[^?]*)(\?.*)?$/.exec(href);
    if (m && !isRu(m[1])) return '#' + toLang(m[1], 'ru') + (m[2] || '');
    return href;
  }

  window.ALLang = {
    get: current,
    isRu: function () { return current() === 'ru'; },
    t: function (en, ru) { return current() === 'ru' && ru != null ? ru : en; },
    /* a course path ('weeks/week-03/day-4' or '#/weeks/...') in the current language, for links a script draws */
    link: function (p) {
      var hash = p.charAt(0) === '#', path = hash ? p.slice(1) : p;
      if (path.charAt(0) !== '/') path = '/' + path;
      if (current() === 'ru') path = toLang(path, 'ru');
      return hash ? '#' + path : path.slice(1);
    },
    /* a page file to fetch ('_sidebar.md') in the current language */
    file: function (f) { return current() === 'ru' ? 'ru/' + f.replace(/^\//, '') : f; }
  };

  /* first visit to an English page after choosing Russian: open the Russian copy instead */
  if (pref() === 'ru' && !isRu(routePath())) location.replace('#' + toLang(routePath(), 'ru') + location.hash.replace(/^[^?]*/, ''));
  document.documentElement.lang = current();

  function go(l) {
    remember(l);
    var q = location.hash.replace(/^[^?]*/, '');
    location.hash = '#' + toLang(routePath(), l) + q;
  }

  function drawSwitch() {
    var box = document.querySelector('.lang-switch');
    if (!box) {
      box = document.createElement('div');
      box.className = 'lang-switch';
      box.setAttribute('role', 'group');
      box.setAttribute('aria-label', 'Language / Язык');
      box.innerHTML = '<button type="button" data-l="en" lang="en">EN</button><button type="button" data-l="ru" lang="ru">RU</button>';
      box.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-l]');   // the theme button (theme.js) shares the pill
        if (b && b.getAttribute('data-l') !== current()) go(b.getAttribute('data-l'));
      });
      document.body.appendChild(box);
    }
    Array.prototype.forEach.call(box.querySelectorAll('button[data-l]'), function (b) {
      var on = b.getAttribute('data-l') === current();
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  /* links drawn by scripts or written in HTML inside a Russian page */
  document.addEventListener('click', function (e) {
    if (current() !== 'ru') return;
    var a = e.target.closest && e.target.closest('a[href^="#/"]');
    if (a && !a.closest('.lang-switch')) {
      var to = ruHref(a.getAttribute('href'));
      if (to !== a.getAttribute('href')) a.setAttribute('href', to);
    }
  }, true);

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.beforeEach(function (md) {
      if (current() !== 'ru') return md;
      /* Markdown links are written from the site root (no relativePath), so 'map.md' would open the English page */
      return md
        .replace(/\]\((?!https?:|mailto:|#|\/?ru\/)\/?([^)\s]*\.md[^)\s]*)\)/g, '](ru/$1)')
        .replace(/\]\(\/\)/g, '](/ru/)')
        .replace(/href="#\/(?!ru\/)/g, 'href="#/ru/');
    });
    hook.doneEach(function () {
      document.documentElement.lang = current();
      drawSwitch();
      if (current() === 'ru') {
        Array.prototype.forEach.call(document.querySelectorAll('.markdown-section a[href^="#/"], .sidebar a[href^="#/"]'), function (a) {
          var to = ruHref(a.getAttribute('href'));
          if (to !== a.getAttribute('href')) a.setAttribute('href', to);
        });
      }
    });
  });
})();
