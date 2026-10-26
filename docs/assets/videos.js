/* YouTube links as a "Videos for today" section (Docsify plugin). Every youtu.be link on a lesson page is gathered
into one panel right under "Today in 3 lines": thumbnail, start time, topic, length, "▶ Watch here" (plays inside
the page, youtube-nocookie, from the linked second) and "Open on YouTube". In the text the link becomes a small
"▶ 34:01" button that jumps to its card and plays it. Link shapes the pages use:
  - ▶ Topic — [Video title, 3:51:57](https://youtu.be/ID?t=13917)
  - ▶ Baraa, *Topic* [0:34:01](https://youtu.be/ID?t=2041) — 60 min, what it covers
Nothing loads from YouTube until a thumbnail is shown or play is tapped. */
(function () {
  var TIME = /^\s*\d{1,2}:\d{2}(:\d{2})?\s*$/;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clock(sec) {
    var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
  }
  function textBefore(a) {   // the words between the previous link (or the start of the line) and this one
    var out = '', n = a.previousSibling;
    while (n && !(n.nodeType === 1 && (n.tagName === 'A' || n.classList.contains('yt-pill')))) { out = n.textContent + out; n = n.previousSibling; }
    return out;
  }
  function info(a) {
    var m = /youtu\.be\/([\w-]{11})(?:\?t=(\d+))?/.exec(a.href);
    if (!m) return null;
    var v = { id: m[1], t: Number(m[2] || 0), href: a.href, topic: '', title: '', len: '' };
    var after = a.nextSibling && a.nextSibling.nodeType === 3 ? a.nextSibling.textContent : '';
    var lm = /^\s*[—–-]\s*(\d+)\s*min/.exec(after);
    if (lm) v.len = lm[1] + ' min';
    var before = textBefore(a).replace(/▶/g, '').replace(/\s*[—–]\s*$/, '').replace(/^[\s—–;,.]+/, '').trim();
    if (TIME.test(a.textContent.replace(/^0:/, ''))) {   // "Baraa, *Topic* [0:34:01]": the topic is the emphasis just before
      var em = a.previousElementSibling;
      v.topic = em && /^(EM|STRONG)$/.test(em.tagName) ? em.textContent.trim() : before || 'Video';
      var who = /^([A-Z][\w.'-]+(?: [A-Z][\w.'-]+)?),/.exec(before);
      v.title = who ? who[1] : '';
    } else {
      v.title = a.textContent.replace(/,?\s*\d{1,2}:\d{2}(:\d{2})?\s*$/, '').trim();
      v.topic = before || v.title;
      if (v.topic === v.title) v.title = '';
    }
    return v;
  }
  function cardHtml(v, i) {
    return '<div class="yt" data-i="' + i + '"><button type="button" class="yt-thumb" aria-label="Watch here">' +
      '<img loading="lazy" alt="" src="https://i.ytimg.com/vi/' + v.id + '/mqdefault.jpg"><span class="yt-play">▶</span>' +
      (v.t ? '<span class="yt-at">from ' + clock(v.t) + '</span>' : '') + '</button>' +
      '<div class="yt-body"><div class="yt-title">' + esc(v.topic) + '</div>' +
      ((v.title || v.len) ? '<div class="yt-meta">' + esc([v.title, v.len].filter(Boolean).join(' · ')) + '</div>' : '') +
      '<div class="yt-acts"><button type="button" class="yt-go">▶ Watch here</button>' +
      '<a class="yt-out" target="_blank" rel="noopener" href="' + esc(v.href) + '">Open on YouTube</a></div></div></div>';
  }
  function play(card, v) {
    if (card.classList.contains('yt-on')) return;
    var f = document.createElement('iframe');
    f.className = 'yt-frame';
    f.src = 'https://www.youtube-nocookie.com/embed/' + v.id + '?autoplay=1&rel=0' + (v.t ? '&start=' + v.t : '');
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    card.classList.add('yt-on');
    card.querySelector('.yt-thumb').replaceWith(f);
    card.querySelector('.yt-go').remove();
  }
  function build() {
    var sec = document.querySelector('.markdown-section');
    if (!sec || sec.querySelector('.yt-panel')) return;
    var links = Array.prototype.filter.call(sec.querySelectorAll('a[href*="youtu.be/"]'), function (a) { return !a.closest('.yt-panel'); });
    var vids = [];
    links.forEach(function (a) {
      var v = info(a);
      if (!v) return;
      var prev = vids[vids.length - 1];   // two videos on one line share the channel name
      if (!v.title && prev && prev.host === a.parentNode && prev.who) v.title = prev.who;
      v.host = a.parentNode; v.who = v.title;
      var i = vids.length;
      vids.push(v);
      var pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'yt-pill';
      pill.textContent = '▶ ' + (v.t ? clock(v.t) : 'video');
      pill.title = 'Watch: ' + v.topic;
      pill.onclick = function () {
        var card = sec.querySelector('.yt-panel .yt[data-i="' + i + '"]');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        play(card, v);
      };
      a.parentNode.replaceChild(pill, a);
    });
    if (!vids.length) return;
    var panel = document.createElement('section');
    panel.className = 'yt-panel';
    panel.innerHTML = '<div class="yt-panel-head"><span class="yt-panel-icon">▶</span><div><div class="yt-panel-title">Videos for today</div>' +
      '<div class="yt-panel-sub">' + vids.length + ' video' + (vids.length > 1 ? 's' : '') + ', each starts at the right minute. Free, optional — watch before or after the lesson.</div></div></div>' +
      '<div class="yt-grid">' + vids.map(cardHtml).join('') + '</div>';
    Array.prototype.forEach.call(panel.querySelectorAll('.yt'), function (card) {
      var v = vids[Number(card.dataset.i)];
      card.querySelector('.yt-thumb').onclick = function () { play(card, v); };
      card.querySelector('.yt-go').onclick = function () { play(card, v); };
    });
    // under "Today in 3 lines" (its list), else before the first section heading
    var h = Array.prototype.filter.call(sec.querySelectorAll('h2'), function (x) { return /today in 3 lines/i.test(x.textContent); })[0];
    var at = h && h.nextElementSibling && /^(UL|OL)$/.test(h.nextElementSibling.tagName) ? h.nextElementSibling : null;
    if (at) at.insertAdjacentElement('afterend', panel);
    else {
      var first = sec.querySelector('h2');
      if (first) sec.insertBefore(panel, first); else sec.appendChild(panel);
    }
  }
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(build);
  });
})();
