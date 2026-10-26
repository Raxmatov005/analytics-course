/* The sidebar follows the page (Docsify plugin). Docsify's own section tracking marks the wrong section on these long
pages, so this file marks it itself: the section is the last heading of the page (h2) she has scrolled past, and its
entry in the sidebar gets "active". The menu scrolls along so that entry stays about a third of the way down. If she
scrolls the menu herself, it waits 2 s before following again. On a new page the menu starts at that page's entry. */
(function () {
  var userUntil = 0, frame = 0;
  function sidebar() { return document.querySelector('.sidebar'); }
  function mark() {
    var links = document.querySelectorAll('.sidebar-nav .app-sub-sidebar a');
    if (!links.length) return null;
    var byId = {};
    Array.prototype.forEach.call(links, function (a) { var m = /[?&]id=([^&]+)/.exec(a.getAttribute('href') || ''); if (m) byId[decodeURIComponent(m[1])] = a; });
    var here = null;
    Array.prototype.forEach.call(document.querySelectorAll('.markdown-section h2[id]'), function (h) {
      if (h.getBoundingClientRect().top < 140 && byId[h.id]) here = byId[h.id];
    });
    Array.prototype.forEach.call(links, function (a) { a.parentNode.classList.toggle('active', a === here); });
    return here;
  }
  function follow(smooth) {
    frame = 0;
    var sb = sidebar();
    var a = mark() || document.querySelector('.sidebar-nav li.active > a');
    if (!sb || !a || Date.now() < userUntil || sb.scrollHeight <= sb.clientHeight) return;
    var sr = sb.getBoundingClientRect(), ar = a.getBoundingClientRect();
    var want = sb.scrollTop + (ar.top - sr.top) - sb.clientHeight * 0.35;
    want = Math.max(0, Math.min(want, sb.scrollHeight - sb.clientHeight));
    if (Math.abs(want - sb.scrollTop) < 24) return;
    sb.scrollTo({ top: want, behavior: smooth ? 'smooth' : 'auto' });
  }
  window.addEventListener('scroll', function () { if (!frame) frame = requestAnimationFrame(function () { follow(true); }); }, { passive: true });
  ['wheel', 'touchmove'].forEach(function (ev) {
    document.addEventListener(ev, function (e) { if (e.target.closest && e.target.closest('.sidebar')) userUntil = Date.now() + 2000; }, { passive: true });
  });
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(function () { setTimeout(function () { follow(false); }, 60); });
  });
})();
