/* Light or dark (the founder, 2026-10-28: "add dark mode, and the SQL and coding boxes the same dark and light mode").

index.html's <head> sets html[data-theme] before anything is drawn: her choice from localStorage "al.theme", or, until
she picks one, her device's own setting (which it then keeps following). The switch is a moon / sun button at the
front of the EN | RU pill (lang.js); a tap flips the page and remembers the choice in this browser. Every colour of
the dark page is in assets/dark.css (built by scripts/make_dark_css.py); the code boxes follow through their
variables (theme.css --code-*, --tk-*). */
(function () {
  var KEY = 'al.theme';
  function T(en, ru) { return window.ALLang ? window.ALLang.t(en, ru) : en; }
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function put(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* private window: this visit only */ } }
  function now() { return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function set(t) { document.documentElement.setAttribute('data-theme', t); draw(); }
  var MOON = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>';
  var SUN = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/>' +
    '<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  function draw() {
    var box = document.querySelector('.lang-switch');
    if (!box) return;
    var b = box.querySelector('.theme-btn');
    if (!b) {
      b = document.createElement('button');
      b.type = 'button';
      b.className = 'theme-btn';
      b.onclick = function () { var t = now() === 'dark' ? 'light' : 'dark'; put(t); set(t); };
      box.insertBefore(b, box.firstChild);
    }
    var dark = now() === 'dark', label = dark ? T('Light mode', 'Светлая тема') : T('Dark mode', 'Тёмная тема');
    b.innerHTML = dark ? SUN : MOON;
    b.setAttribute('aria-label', label);
    b.title = label;
  }
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var follow = function (e) { if (!get()) set(e.matches ? 'dark' : 'light'); };
    if (mq.addEventListener) mq.addEventListener('change', follow); else if (mq.addListener) mq.addListener(follow);
  }
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(draw);   // after lang.js has drawn the pill (its plugin is registered first)
  });
})();
