/* YouTube links as a "Videos for today" section (Docsify plugin). Every youtu.be link on a lesson page is gathered
into one panel right under "Today in 3 lines": thumbnail, start time, topic, length, "▶ Watch here" (plays inside
the page, youtube-nocookie, from the linked second) and "Open on YouTube". In the text the link becomes a small
"▶ 34:01" button that jumps to its card and plays it. Link shapes the pages use:
  - ▶ Topic — [Video title, 3:51:57](https://youtu.be/ID?t=13917)
  - ▶ Baraa, *Topic* [0:34:01](https://youtu.be/ID?t=2041) — 60 min, what it covers
Nothing loads from YouTube until a thumbnail is shown or play is tapped. */
(function () {
  var TIME = /^\s*\d{1,2}:\d{2}(:\d{2})?\s*$/;
  function T(en, ru) { return window.ALLang ? window.ALLang.t(en, ru) : en; }
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
    var e = /[?&]end=(\d+)/.exec(a.href);   // the part's end (the next chapter of the video), added by the mentor's tools
    var v = { id: m[1], t: Number(m[2] || 0), end: e ? Number(e[1]) : 0, href: a.href.replace(/&end=\d+/, ''), topic: '', title: '', len: '' };
    var after = a.nextSibling && a.nextSibling.nodeType === 3 ? a.nextSibling.textContent : '';
    var lm = /^\s*[—–-]\s*(\d+)\s*(?:min|мин)/.exec(after);   // "— 60 min" (a Russian page: "— 60 мин")
    if (v.end) v.len = Math.max(1, Math.round((v.end - v.t) / 60)) + T(' min', ' мин');
    else if (lm) v.len = lm[1] + T(' min', ' мин');
    var before = textBefore(a).replace(/▶/g, '').replace(/\s*[—–]\s*$/, '').replace(/^[\s—–;,.]+/, '').trim();
    if (TIME.test(a.textContent.replace(/^0:/, ''))) {   // "Baraa, *Topic* [0:34:01]": the topic is the emphasis just before
      var em = a.previousElementSibling;
      v.topic = em && /^(EM|STRONG)$/.test(em.tagName) ? em.textContent.trim() : before || T('Video', 'Видео');
      var who = /^([A-ZА-ЯЁ][\wА-Яа-яЁё.'-]+(?: [A-ZА-ЯЁ][\wА-Яа-яЁё.'-]+)?),/.exec(before);   // "Baraa," or, on a Russian page, "Бараа,"
      v.title = who ? who[1] : '';
    } else {
      v.title = a.textContent.replace(/,?\s*\d{1,2}:\d{2}(:\d{2})?\s*$/, '').trim();
      v.topic = before || v.title;
      if (v.topic === v.title) v.title = '';
    }
    return v;
  }
  function cardHtml(v, i) {
    return '<div class="yt" data-i="' + i + '"><button type="button" class="yt-thumb" aria-label="' + T('Watch here', 'Смотреть здесь') + '">' +
      '<img loading="lazy" alt="" src="https://i.ytimg.com/vi/' + v.id + '/mqdefault.jpg"><span class="yt-play">▶</span>' +
      (v.t || v.end ? '<span class="yt-at">' + (v.end ? clock(v.end - v.t) : T('from ', 'с ') + clock(v.t)) + '</span>' : '') + '</button>' +
      '<div class="yt-body"><div class="yt-title">' + esc(v.topic) + '</div>' +
      ((v.title || v.len) ? '<div class="yt-meta">' + esc([v.title, v.len].filter(Boolean).join(' · ')) + '</div>' : '') +
      '<div class="yt-acts"><button type="button" class="yt-go">' + T('▶ Watch this part', '▶ Смотреть этот фрагмент') + '</button></div></div></div>';
  }
  /* The part player. YouTube's own controls show the whole video (30 hours for Baraa's course), so they are hidden
     (controls=0, a cover over the frame takes every tap) and ours show only the part: time and slider run from 0 to
     the part's length, seeking stays inside it, and at the part's end the video stops. YouTube IFrame API. */
  var apiReady = null;
  function api() {
    if (apiReady) return apiReady;
    apiReady = new Promise(function (ok, bad) {
      if (window.YT && window.YT.Player) return ok(window.YT);
      var prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () { if (prev) prev(); ok(window.YT); };
      var s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.onerror = function () { apiReady = null; bad(); };
      document.head.appendChild(s);
    });
    return apiReady;
  }
  var SPEEDS = [1, 1.25, 1.5, 2, 0.75];
  function play(card, v) {
    if (card.classList.contains('yt-on')) return;
    card.classList.add('yt-on');
    var stage = document.createElement('div'), AUTO = T('Auto', 'Авто'), PP = T('Play or pause', 'Воспроизвести или приостановить');
    stage.className = 'yp';
    stage.innerHTML = '<div class="yp-screen"><div class="yp-frame"></div>' +
      '<button type="button" class="yp-cover" aria-label="' + PP + '"><span class="yp-big">▶</span></button>' +
      '<div class="yp-done" hidden><div class="yp-done-t">' + T('✓ End of this part', '✓ Конец фрагмента') + '</div><button type="button" class="yp-again">' +
      T('↺ Watch it again', '↺ Посмотреть ещё раз') + '</button></div></div>' +
      '<div class="yp-bar"><button type="button" class="yp-pp" aria-label="' + PP + '">▶</button>' +
      '<span class="yp-time">0:00 / …</span>' +
      '<div class="yp-track" role="slider" aria-label="' + T('Position in this part', 'Позиция во фрагменте') + '" tabindex="0"><div class="yp-fill"></div><div class="yp-knob"></div></div>' +
      '<button type="button" class="yp-speed" aria-label="' + T('Speed', 'Скорость') + '">1×</button>' +
      '<button type="button" class="yp-cc" aria-label="' + T('Subtitles', 'Субтитры') + '">CC</button>' +
      '<button type="button" class="yp-q" aria-label="' + T('Quality', 'Качество') + '">' + AUTO + '</button>' +
      '<button type="button" class="yp-full" aria-label="' + T('Full screen', 'Во весь экран') + '">⛶</button></div>' +
      '<div class="yp-qmenu" hidden><div class="yp-qmenu-h">' + T('Quality: ', 'Качество: ') + '<b class="yp-qnow">' + AUTO + '</b></div>' +
      '<p>' + T('YouTube picks the quality itself from the size of the player and your internet — websites are not allowed to set it. ' +
      'For a sharper picture:', 'YouTube сам выбирает качество по размеру плеера и скорости интернета — сайтам менять его не разрешено. ' +
      'Чтобы картинка была чётче:') + '</p>' +
      '<button type="button" class="yp-qfull">' + T('⛶ Watch full screen <small>YouTube then switches to HD</small>', '⛶ Смотреть во весь экран <small>тогда YouTube включит HD</small>') + '</button>' +
      '<a class="yp-qyt" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=' + v.id + '&t=' + v.t + 's">' +
      T('⚙ Choose the quality on YouTube <small>opens at this part', '⚙ Выбрать качество на YouTube <small>откроется на этом фрагменте') +
      (v.end ? T('; stop at ', '; остановитесь на ') + clock(v.end) : '') + '</small></a></div>';
    card.querySelector('.yt-thumb').replaceWith(stage);
    var go = card.querySelector('.yt-go');
    if (go) go.remove();
    var $ = function (c) { return stage.querySelector(c); };
    var start = v.t, end = v.end || 0, p = null, timer = null, sp = 0, cc = false, dragging = false;
    function len() { return Math.max(1, end - start); }
    function playing() { return p && p.getPlayerState && p.getPlayerState() === 1; }
    function seek(f) { if (!p) return; f = Math.min(1, Math.max(0, f)); $('.yp-done').hidden = true; p.seekTo(start + f * len() - (f >= 1 ? 1 : 0), true); }
    function paint() {
      if (!document.body.contains(stage)) { clearInterval(timer); try { p.destroy(); } catch (e) { /* gone */ } return; }
      if (!p || !p.getCurrentTime) return;
      var t = p.getCurrentTime();
      if (end && t >= end - 0.25) {   // the part is over: stop here, never run into the next topic
        if (playing()) p.pauseVideo();
        if (t > end + 1) p.seekTo(end - 0.5, true);
        $('.yp-done').hidden = false;
        t = end;
      } else if (t < start - 1) p.seekTo(start, true);
      var rel = Math.max(0, t - start);
      if (!dragging) {
        var f = Math.min(1, rel / len());
        $('.yp-fill').style.width = (f * 100) + '%';
        $('.yp-knob').style.left = (f * 100) + '%';
      }
      $('.yp-time').textContent = clock(Math.round(rel)) + ' / ' + clock(Math.round(len()));
      var q = p.getPlaybackQuality ? QL[p.getPlaybackQuality()] || AUTO : AUTO;
      if ($('.yp-q').textContent !== q) { $('.yp-q').textContent = q; $('.yp-qnow').textContent = q === AUTO ? AUTO : q + T(' (auto)', ' (авто)'); }
      var on = playing() && !(end && t >= end - 0.25);
      $('.yp-pp').textContent = on ? '❚❚' : '▶';
      $('.yp-big').hidden = on;
      stage.classList.toggle('yp-paused', !on);
    }
    function toggle() {
      if (!p) return;
      if (playing()) p.pauseVideo();
      else { if (end && p.getCurrentTime() >= end - 0.5) p.seekTo(start, true); $('.yp-done').hidden = true; p.playVideo(); }
    }
    $('.yp-cover').onclick = toggle;
    $('.yp-pp').onclick = toggle;
    $('.yp-again').onclick = function (e) { e.stopPropagation(); seek(0); p.playVideo(); };
    $('.yp-speed').onclick = function () { sp = (sp + 1) % SPEEDS.length; if (p) p.setPlaybackRate(SPEEDS[sp]); $('.yp-speed').textContent = SPEEDS[sp] + '×'; };
    $('.yp-cc').onclick = function () {
      if (!p) return;
      cc = !cc;
      try { if (cc) { p.loadModule('captions'); p.setOption('captions', 'track', { languageCode: 'en' }); } else p.unloadModule('captions'); } catch (e) { /* no captions */ }
      $('.yp-cc').classList.toggle('on', cc);
    };
    /* full screen: the browser's own where it is allowed; where it is not (iPhone Safari, some in-app browsers) the
       player fills the window instead, so the button always does something */
    function fsEl() { return document.fullscreenElement || document.webkitFullscreenElement; }
    function setMax(on) {
      stage.classList.toggle('yp-max', on);
      document.body.classList.toggle('yp-lock', on);
      icon();
    }
    function icon() { $('.yp-full').textContent = fsEl() === stage || stage.classList.contains('yp-max') ? '✕' : '⛶'; }
    function full() {
      $('.yp-qmenu').hidden = true;
      if (fsEl()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
      if (stage.classList.contains('yp-max')) { setMax(false); return; }
      var req = stage.requestFullscreen || stage.webkitRequestFullscreen;
      var fallback = function () { if (!fsEl()) setMax(true); };
      if (!req) { setMax(true); return; }
      try {
        var pr = req.call(stage);
        if (pr && pr.then) pr.then(function () { try { screen.orientation.lock('landscape').catch(function () {}); } catch (e) { /* not on this device */ } }, fallback);
      } catch (e) { setMax(true); return; }
      setTimeout(fallback, 500);   // blocked without an error: fill the window instead
    }
    $('.yp-full').onclick = full;
    $('.yp-qfull').onclick = full;
    document.addEventListener('fullscreenchange', icon);
    document.addEventListener('webkitfullscreenchange', icon);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && stage.classList.contains('yp-max')) setMax(false); });
    var QL = { hd2160: '4K', hd1440: '1440p', hd1080: '1080p', hd720: '720p', large: '480p', medium: '360p', small: '240p', tiny: '144p', auto: AUTO };
    $('.yp-q').onclick = function (e) { e.stopPropagation(); $('.yp-qmenu').hidden = !$('.yp-qmenu').hidden; };
    $('.yp-qyt').onclick = function () { if (p && playing()) p.pauseVideo(); $('.yp-qmenu').hidden = true; };
    document.addEventListener('click', function (e) { if (!e.target.closest('.yp-qmenu') && !e.target.closest('.yp-q')) $('.yp-qmenu').hidden = true; });
    var track = $('.yp-track');
    function frac(e) { var r = track.getBoundingClientRect(); return (e.clientX - r.left) / r.width; }
    function show(f) { f = Math.min(1, Math.max(0, f)); $('.yp-fill').style.width = (f * 100) + '%'; $('.yp-knob').style.left = (f * 100) + '%'; }
    track.addEventListener('pointerdown', function (e) { dragging = true; track.setPointerCapture(e.pointerId); show(frac(e)); });
    track.addEventListener('pointermove', function (e) { if (dragging) show(frac(e)); });
    track.addEventListener('pointerup', function (e) { if (!dragging) return; dragging = false; seek(frac(e)); });
    track.addEventListener('keydown', function (e) {
      if (!p) return;
      var rel = p.getCurrentTime() - start;
      if (e.key === 'ArrowRight') { e.preventDefault(); seek((rel + 10) / len()); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); seek((rel - 10) / len()); }
    });
    api().then(function (YT) {
      p = new YT.Player($('.yp-frame'), {
        videoId: v.id, host: 'https://www.youtube-nocookie.com',
        playerVars: { start: start, controls: 0, disablekb: 1, rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3, fs: 0, cc_load_policy: 0 },
        events: {
          onReady: function () {
            if (!end) end = Math.floor(p.getDuration()) || start + 600;
            p.playVideo();
            timer = setInterval(paint, 250);
            paint();
          }
        }
      });
    }).catch(function () {   // the API could not load: the plain player, still starting and ending at the part
      $('.yp-screen').innerHTML = '<iframe class="yt-frame" allow="autoplay; encrypted-media; fullscreen" allowfullscreen src="https://www.youtube-nocookie.com/embed/' +
        v.id + '?autoplay=1&rel=0&start=' + start + (v.end ? '&end=' + v.end : '') + '"></iframe>';
      $('.yp-bar').remove();
    });
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
      pill.textContent = '▶ ' + (v.t ? clock(v.t) : T('video', 'видео'));
      pill.title = T('Watch: ', 'Смотреть: ') + v.topic;
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
    panel.innerHTML = '<div class="yt-panel-head"><span class="yt-panel-icon">▶</span><div><div class="yt-panel-title">' + T('Videos for today', 'Видео на сегодня') + '</div>' +
      '<div class="yt-panel-sub">' + T(vids.length + ' video' + (vids.length > 1 ? 's' : '') + '. Each plays only its part of the video and stops at the end of that part. Free, optional.',
        vids.length + ' видео. Каждое показывает только свой фрагмент ролика и останавливается в его конце. Бесплатно, по желанию.') + '</div></div></div>' +
      '<div class="yt-grid">' + vids.map(cardHtml).join('') + '</div>';
    Array.prototype.forEach.call(panel.querySelectorAll('.yt'), function (card) {
      var v = vids[Number(card.dataset.i)];
      card.querySelector('.yt-thumb').onclick = function () { play(card, v); };
      card.querySelector('.yt-go').onclick = function () { play(card, v); };
    });
    // under "Today in 3 lines" (its list), else before the first section heading; a Russian page keeps the English id
    var h = Array.prototype.filter.call(sec.querySelectorAll('h2'), function (x) {
      return x.id === 'today-in-3-lines' || /today in 3 lines|сегодня в 3 строк/i.test(x.textContent);
    })[0];
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
