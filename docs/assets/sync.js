/* Her progress is kept with the course bot too, so it is never lost (the founder, 2026-10-28: "progress that was
completed will not get lost anywhere, and when she enters or refreshes she should not start from the beginning").

Every engine keeps its progress in this browser (task.js al.tasks; quiz, challenge, games and labs al.v1; sqlrun.js
al.sql; pyrun.js al.py; videos.js al.vq and al.vw; resume below al.pos). A browser can lose that (another phone, a
cleaned or private browser, Safari dropping a site's storage after a week away), so, while she is signed in (al.wk):
- on every page load the bot's copy (GET /progress) is merged into this browser's; if that brought anything new, the
  page draws itself again once, so the boxes show it;
- whenever the progress changed, at most every 20 s, and when she leaves a page, this browser's progress goes to the
  bot (POST /progress; sendBeacon when leaving).
The merge only adds: a finished item stays finished, a number keeps its larger value (stars, tries, best score), a
yes stays yes, lists join; for her own text (drafts) this browser's copy wins, the bot's fills an empty one.

Where she was reading (al.pos: the page, the last heading above the top of the screen and how far below it) is kept
on every scroll; after a refresh, or when she opens the page she was on, the page returns there. The home page shows
"Continue where you stopped" with that page. */
(function () {
  var WORKER = 'https://nur-feedback-bot.sohajon2005.workers.dev', WK = 'al.wk', POS = 'al.pos';
  var KEYS = ['al.tasks', 'al.v1', 'al.sql', 'al.py', 'al.vq', 'al.vw', POS];
  function T(en, ru) { return window.ALLang ? window.ALLang.t(en, ru) : en; }
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private window: this visit only */ } }
  function parse(s) { try { return s == null ? null : JSON.parse(s); } catch (e) { return null; } }
  function key() { return get(WK); }
  function snapshot() {
    var o = {};
    KEYS.forEach(function (k) { var v = parse(get(k)); if (v != null) o[k] = v; });
    return o;
  }

  /* ---------- the merge: progress only grows ---------- */
  function isObj(x) { return x && typeof x === 'object' && !Array.isArray(x); }
  function merge(mine, theirs) {
    if (mine == null) return theirs;
    if (theirs == null) return mine;
    if (isObj(mine) && isObj(theirs)) {
      var out = {};
      Object.keys(mine).forEach(function (k) { out[k] = mine[k]; });
      Object.keys(theirs).forEach(function (k) { out[k] = k in mine ? merge(mine[k], theirs[k]) : theirs[k]; });
      return out;
    }
    if (Array.isArray(mine) && Array.isArray(theirs)) {
      var seen = {}, all = [];
      mine.concat(theirs).forEach(function (x) { var s = JSON.stringify(x); if (!seen[s]) { seen[s] = 1; all.push(x); } });
      return all;
    }
    if (typeof mine === 'number' && typeof theirs === 'number') return Math.max(mine, theirs);
    if (typeof mine === 'boolean' && typeof theirs === 'boolean') return mine || theirs;
    if (typeof mine === 'string' && mine === '') return theirs;
    return mine;   // her own text in this browser, dates already set here
  }
  function mergePos(mine, theirs) {   // where she was: the later one
    if (!isObj(mine)) return theirs;
    if (!isObj(theirs)) return mine;
    return (theirs.at || 0) > (mine.at || 0) ? theirs : mine;
  }

  /* ---------- to and from the bot ---------- */
  var last = null, pushing = false, refused = false;   // refused: the bot does not know this key (it was replaced)
  function push(beacon) {
    var k = key();
    if (!k || refused) return;
    var data = snapshot(), s = JSON.stringify(data);
    if (s === last) return;
    var body = JSON.stringify({ key: k, data: data });
    if (beacon && navigator.sendBeacon) { if (navigator.sendBeacon(WORKER + '/progress', body)) last = s; return; }
    if (pushing) return;
    pushing = true;
    fetch(WORKER + '/progress', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: body, keepalive: body.length < 60000 })
      .then(function (r) { if (r.ok) last = s; })
      .catch(function () { /* offline: the next round tries again */ })
      .then(function () { pushing = false; });
  }
  var pulled = false;
  function pull() {
    var k = key();
    if (!k || pulled) return;
    pulled = true;
    fetch(WORKER + '/progress?key=' + encodeURIComponent(k), { cache: 'no-store' })
      .then(function (r) { if (r.status === 401) refused = true; return r.ok ? r.json() : null; })
      .then(function (rec) {
        if (refused) return;
        var theirs = rec && rec.data, changed = false;
        if (theirs) KEYS.forEach(function (k2) {
          if (!(k2 in theirs)) return;
          var mine = parse(get(k2)), m = k2 === POS ? mergePos(mine, theirs[k2]) : merge(mine, theirs[k2]);
          if (JSON.stringify(m) !== JSON.stringify(mine)) { set(k2, JSON.stringify(m)); if (k2 !== POS) changed = true; }
        });
        if (changed && !sessionStorage.getItem('al.synced')) {   // draw the boxes again with what came back, once
          try { sessionStorage.setItem('al.synced', '1'); } catch (e) { /* no session storage: no second draw */ }
          location.reload();
          return;
        }
        push(false);   // this browser may hold more than the bot: send the merged whole
      })
      .catch(function () { pulled = false; });
  }
  setInterval(function () { push(false); }, 20000);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') push(true); });
  window.addEventListener('pagehide', function () { push(true); });
  document.addEventListener('al-signin', function () { pulled = false; refused = false; pull(); });

  /* ---------- where she was reading ---------- */
  function route() { return location.hash.replace(/^#/, '').replace(/\?.*$/, '') || '/'; }
  function isLesson(r) { return /^\/(ru\/)?(weeks\/week-\d\d\/day-\d+|practice|playground)\/?$/.test(r); }
  var savedAt = 0, restoring = false;
  function remember() {
    if (restoring || !isLesson(route())) return;
    var hs = document.querySelectorAll('.markdown-section h2[id], .markdown-section h3[id]'), anchor = null;
    for (var i = 0; i < hs.length; i++) { if (hs[i].getBoundingClientRect().top <= 90) anchor = hs[i]; else break; }
    var h1 = document.querySelector('.markdown-section h1');
    var pos = { r: route(), y: Math.round(window.scrollY), at: Date.now(),
      id: anchor ? anchor.id : '', off: anchor ? Math.round(window.scrollY - (anchor.getBoundingClientRect().top + window.scrollY)) : 0,
      title: h1 ? h1.textContent.replace(/\s+/g, ' ').trim().slice(0, 90) : '', sec: anchor ? anchor.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) : '' };
    set(POS, JSON.stringify(pos));
  }
  window.addEventListener('scroll', function () {
    var now = Date.now();
    if (now - savedAt > 400) { savedAt = now; setTimeout(remember, 450); }
  }, { passive: true });
  function goBack(pos) {   // the heading's place, which survives boxes growing as the page draws; else the old y
    restoring = true;
    var tries = 0;
    (function step() {
      var h = pos.id && document.getElementById(pos.id);
      var y = h ? h.getBoundingClientRect().top + window.scrollY + (pos.off || 0) : pos.y;
      window.scrollTo(0, Math.max(0, y));
      if (++tries < 6) setTimeout(step, 350); else restoring = false;   // again while pictures and editors settle
    })();
  }
  var firstPage = true;
  function afterDraw() {
    var pos = parse(get(POS)), r = route(), wanted = sessionStorage.getItem('al.resume');
    var deepLink = /[?&]id=/.test(location.hash);
    if (pos && pos.r === r && !deepLink && (firstPage || wanted === r)) goBack(pos);
    try { sessionStorage.removeItem('al.resume'); } catch (e) { /* nothing */ }
    firstPage = false;
    if ((r === '/' || r === '/ru/') && pos && isLesson(pos.r)) continueCard(pos);
  }
  function continueCard(pos) {
    var sec = document.querySelector('.markdown-section');
    if (!sec || sec.querySelector('.al-continue')) return;
    var a = document.createElement('a');
    a.className = 'al-continue';
    a.href = '#' + pos.r;
    a.innerHTML = '<span class="al-continue-k">' + T('Continue where you stopped', 'Продолжить с того места, где остановились') + '</span>' +
      '<span class="al-continue-t"></span><span class="al-continue-s"></span>';
    a.querySelector('.al-continue-t').textContent = pos.title || pos.r;
    a.querySelector('.al-continue-s').textContent = pos.sec || '';
    a.onclick = function () { try { sessionStorage.setItem('al.resume', pos.r); } catch (e) { /* nothing */ } };
    var h1 = sec.querySelector('h1');
    if (h1 && h1.nextSibling) sec.insertBefore(a, h1.nextSibling); else sec.insertBefore(a, sec.firstChild);
  }

  window.ALSync = { merge: merge, snapshot: snapshot, push: push, pull: function () { pulled = false; refused = false; pull(); } };
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.ready(pull);
    hook.doneEach(function () { setTimeout(afterDraw, 300); });
  });
})();
