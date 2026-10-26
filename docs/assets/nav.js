/* The sidebar follows the page, calmly (Docsify plugin).
Docsify moves the sidebar itself on every scroll event, to the section it believes is current, and on these long pages
that is often the wrong one; two movers fought and the menu jumped. Docsify only does it while <body> has the class
"sticky", so that class is taken away (the sidebar stays fixed through theme.css) and this file is the only mover:
- the current section is the last h2 she has scrolled past; its sidebar entry gets "nav-here" (Docsify's own "active"
  on sections is styled as plain in theme.css);
- the menu moves only when the section changes, and only if that entry is about to leave the menu's view; then it
  glides so the entry sits a third of the way down;
- after she scrolls the menu herself it waits 2 s. */
(function () {
  var userUntil = 0, frame = 0, here = null;
  function sidebar() { return document.querySelector('.sidebar'); }
  function current() {
    var links = document.querySelectorAll('.sidebar-nav .app-sub-sidebar a'), byId = {}, found = null;
    Array.prototype.forEach.call(links, function (a) { var m = /[?&]id=([^&]+)/.exec(a.getAttribute('href') || ''); if (m) byId[decodeURIComponent(m[1])] = a; });
    Array.prototype.forEach.call(document.querySelectorAll('.markdown-section h2[id]'), function (h) {
      if (h.getBoundingClientRect().top < 140 && byId[h.id]) found = byId[h.id];
    });
    return found || document.querySelector('.sidebar-nav li.active > a');
  }
  function update(instant) {
    frame = 0;
    var a = current();
    if (!a || (a === here && !instant)) return;
    if (here && here.parentNode) here.parentNode.classList.remove('nav-here');
    here = a;
    if (a.closest('.app-sub-sidebar')) a.parentNode.classList.add('nav-here');
    var sb = sidebar();
    if (!sb || sb.scrollHeight <= sb.clientHeight || (!instant && Date.now() < userUntil)) return;
    var sr = sb.getBoundingClientRect(), ar = a.getBoundingClientRect(), pos = (ar.top - sr.top) / sb.clientHeight;
    if (!instant && pos > 0.12 && pos < 0.78) return;   // still comfortably in view: leave the menu where it is
    var want = Math.max(0, Math.min(sb.scrollTop + (ar.top - sr.top) - sb.clientHeight * 0.33, sb.scrollHeight - sb.clientHeight));
    sb.scrollTo({ top: want, behavior: instant ? 'auto' : 'smooth' });
  }
  window.addEventListener('scroll', function () { if (!frame) frame = requestAnimationFrame(function () { update(false); }); }, { passive: true });
  ['wheel', 'touchmove'].forEach(function (ev) {
    document.addEventListener(ev, function (e) { if (e.target.closest && e.target.closest('.sidebar')) userUntil = Date.now() + 2000; }, { passive: true });
  });
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(function () {
      document.body.classList.remove('sticky');
      here = null;
      setTimeout(function () { update(true); }, 60);
    });
  });
})();
