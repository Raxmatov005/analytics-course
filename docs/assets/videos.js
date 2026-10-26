/* YouTube links as video cards (Docsify plugin): every youtu.be link on a page becomes a card with the video's
thumbnail and start time; "▶ Watch here" plays it inside the page (youtube-nocookie, from the linked second),
"Open on YouTube" keeps the plain link. Nothing loads from YouTube until a thumbnail is shown or play is tapped. */
(function () {
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clock(sec) {
    var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
  }
  function card(a) {
    var m = /youtu\.be\/([\w-]{11})(?:\?t=(\d+))?/.exec(a.href);
    if (!m || a.closest('.yt')) return;
    var id = m[1], t = Number(m[2] || 0);
    var label = a.textContent.replace(/,?\s*\d{1,2}:\d{2}(:\d{2})?\s*$/, '').trim();
    if (!label) {   // "*CASE* [8:07:50](…)": the topic is the emphasis just before a time-only link
      var prev = a.previousElementSibling;
      label = prev && /^(EM|STRONG)$/.test(prev.tagName) ? prev.textContent : 'Video';
    }
    var box = document.createElement('span');
    box.className = 'yt';
    box.innerHTML = '<button type="button" class="yt-thumb" aria-label="Watch here">' +
      '<img loading="lazy" alt="" src="https://i.ytimg.com/vi/' + id + '/mqdefault.jpg"><span class="yt-play">▶</span>' +
      (t ? '<span class="yt-at">from ' + clock(t) + '</span>' : '') + '</button>' +
      '<span class="yt-body"><span class="yt-title">' + esc(label) + '</span>' +
      '<span class="yt-acts"><button type="button" class="yt-go">▶ Watch here</button>' +
      '<a class="yt-out" target="_blank" rel="noopener" href="' + esc(a.href) + '">Open on YouTube</a></span></span>';
    a.parentNode.replaceChild(box, a);
    var host = box.parentNode;   // "- ▶ Topic — [video](…)": the topic becomes the card's caption, without the arrow and the dash
    var li = host.tagName === 'LI' ? host : host.tagName === 'P' && host.parentNode.tagName === 'LI' ? host.parentNode : null;
    if (li) {
      if (host.firstChild && host.firstChild.nodeType === 3) host.firstChild.textContent = host.firstChild.textContent.replace(/^\s*▶\s*/, '');
      var before = box.previousSibling;
      if (before && before.nodeType === 3) before.textContent = before.textContent.replace(/\s*[—–]\s*$/, '');
      li.classList.add('yt-li');
    }
    function play() {
      var f = document.createElement('iframe');
      f.className = 'yt-frame';
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0' + (t ? '&start=' + t : '');
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      box.classList.add('yt-on');
      box.querySelector('.yt-thumb').replaceWith(f);
      box.querySelector('.yt-go').remove();
    }
    box.querySelector('.yt-thumb').onclick = play;
    box.querySelector('.yt-go').onclick = play;
  }
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(function () {
      Array.prototype.forEach.call(document.querySelectorAll('.markdown-section a[href*="youtu.be/"]'), card);
    });
  });
})();
