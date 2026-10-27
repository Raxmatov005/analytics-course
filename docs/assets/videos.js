/* YouTube links as a "Videos for today" section (Docsify plugin). Every youtu.be link on a lesson page is gathered
into one panel right under "Today in 3 lines": thumbnail, start time, topic, length, "▶ Watch here" (plays inside
the page, youtube-nocookie, from the linked second) and "Open on YouTube". In the text the link becomes a small
"▶ 34:01" button that jumps to its card and plays it. Link shapes the pages use:
  - ▶ Topic — [Video title, 3:51:57](https://youtu.be/ID?t=13917)
  - ▶ Baraa, *Topic* [0:34:01](https://youtu.be/ID?t=2041) — 60 min, what it covers
Nothing loads from YouTube until a thumbnail is shown or play is tapped. The player has a YouTube-style ⚙ menu with a
quality picker that works (by player size, below) and asks the questions of the page's ```videoquiz blocks. */
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
  function load(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } }
  function save(k, o) { try { localStorage.setItem(k, JSON.stringify(o)); } catch (e) { /* private window: kept for this visit only */ } }
  function changed() { document.dispatchEvent(new CustomEvent('al:change')); }   // the section frames recount their done-state

  /* Questions inside a video. A ```videoquiz block on the page — {"video": id, "stops": [{at, q, options, answer,
  explain, back?}]}, at = seconds from the start of the whole video — is taken off the page and its stops go to every
  card of that video whose part contains them. The player pauses at a stop and asks; answers are kept per browser in
  "al.vq" ({id: {at: {ok, tries}}}), parts watched to the end in "al.vw" ({"id@start": 1}). A card is marked done (yt-done: a ✓ on the card only; videos are optional, so it is no al-block)
  when its part was watched to the end and every question in it answered. */
  var VQ = 'al.vq', VW = 'al.vw';
  function quizzes(sec) {
    var by = {};
    Array.prototype.forEach.call(sec.querySelectorAll('pre[data-lang="videoquiz"]'), function (pre) {
      var code = pre.querySelector('code') || pre;
      try {
        var d = JSON.parse(code.textContent);
        if (!d || !d.video || !d.stops) throw new Error('needs "video" and "stops"');
        by[d.video] = (by[d.video] || []).concat(d.stops.filter(function (s) {
          return s && typeof s.at === 'number' && s.q && s.options && s.options.length && typeof s.answer === 'number';
        }));
      } catch (e) { console.error('videoquiz: this block is not valid JSON —', e.message, code.textContent.slice(0, 120)); }
      pre.remove();
    });
    return by;
  }
  function answers(id) { return load(VQ)[id] || {}; }
  function record(id, at, ok) {
    var all = load(VQ), mine = all[id] = all[id] || {}, r = mine[at] || { ok: false, tries: 0 };
    r.tries++; r.ok = ok; mine[at] = r;
    save(VQ, all);
  }
  function partKey(v) { return v.id + '@' + v.t; }
  function score(v) {
    var a = answers(v.id), st = v.stops || [], s = { n: st.length, done: 0, ok: 0 };
    st.forEach(function (x) { var r = a[x.at]; if (r) { s.done++; if (r.ok) s.ok++; } });
    return s;
  }
  function mark(card, v) {   // → true when the card's done-state changed
    var was = card.classList.contains('yt-done'), s = score(v), on = !!load(VW)[partKey(v)] && s.done === s.n;
    card.classList.toggle('yt-done', on);
    return was !== on;
  }
  function questions(n) {   // Russian counts: 1 вопрос, 2 вопроса, 5 вопросов
    var r = n % 10 === 1 && n % 100 !== 11 ? 'вопрос' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'вопроса' : 'вопросов';
    return T(n + ' question' + (n > 1 ? 's' : ''), n + ' ' + r);
  }
  function cardHtml(v, i) {
    var n = (v.stops || []).length;
    return '<div class="yt" data-i="' + i + '"><button type="button" class="yt-thumb" aria-label="' + T('Watch here', 'Смотреть здесь') + '">' +
      '<img loading="lazy" alt="" src="https://i.ytimg.com/vi/' + v.id + '/mqdefault.jpg"><span class="yt-play">▶</span>' +
      (v.t || v.end ? '<span class="yt-at">' + (v.end ? clock(v.end - v.t) : T('from ', 'с ') + clock(v.t)) + '</span>' : '') + '</button>' +
      '<div class="yt-body"><div class="yt-title">' + esc(v.topic) + '</div>' +
      ((v.title || v.len || n) ? '<div class="yt-meta">' + esc([v.title, v.len, n ? questions(n) : ''].filter(Boolean).join(' · ')) + '</div>' : '') +
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
  /* Quality. The embed ignores setPlaybackQuality (since 2019) and picks the stream from the size of the player in
  physical pixels (CSS size × devicePixelRatio), so the picker sets that size: the frame is drawn at, say, 1920×1080
  device pixels and scaled down to the screen with a CSS transform; the player inside still measures its full size and
  asks for that stream. YouTube only chooses again when the video is (re)loaded, so a change reloads it at the same
  second. Measured: its bands are wider than the names (854×480 already gets 720p), hence 640×360 for "480p" and
  426×240 for "360p"; and it may refuse to go below 480p on a fast line. Auto = the frame is the size of the screen.
  YouTube has the last word, so the menu shows what it delivers. One choice for every player, kept in "al.yq". */
  var QKEY = 'al.yq', QS = ['auto', '1080', '720', '480', '360'];
  var QSIZE = { 1080: [1920, 1080], 720: [1280, 720], 480: [640, 360], 360: [426, 240] };
  var QL = { hd2160: '4K', hd1440: '1440p', hd1080: '1080p', hd720: '720p', large: '480p', medium: '360p', small: '240p', tiny: '144p' };
  var quality = (function () { var q = null; try { q = localStorage.getItem(QKEY); } catch (e) { /* no storage */ } return QS.indexOf(q) >= 0 ? q : 'auto'; })();
  var players = [];   // the players on the page: a new choice reaches all of them
  function setQuality(q) {
    quality = q;
    try { localStorage.setItem(QKEY, q); } catch (e) { /* private window: this visit only */ }
    players = players.filter(function (pl) { return pl.alive(); });
    players.forEach(function (pl) { pl.requality(); });
  }
  function play(card, v) {
    if (card.classList.contains('yt-on')) return;
    card.classList.add('yt-on');
    var stage = document.createElement('div'), AUTO = T('Auto', 'Авто'), PP = T('Play or pause', 'Воспроизвести или приостановить');
    var QNAME = T('Quality', 'Качество');
    stage.className = 'yp';
    stage.innerHTML = '<div class="yp-screen"><div class="yp-frame"></div>' +
      '<button type="button" class="yp-cover" aria-label="' + PP + '"><span class="yp-big">▶</span></button>' +
      '<div class="yp-done" hidden><div class="yp-done-t">' + T('✓ End of this part', '✓ Конец фрагмента') + '</div><div class="yp-done-q" hidden></div>' +
      '<button type="button" class="yp-again">' + T('↺ Watch it again', '↺ Посмотреть ещё раз') + '</button></div>' +
      '<div class="yp-quiz" role="dialog" aria-live="polite" hidden></div></div>' +
      '<div class="yp-bar"><button type="button" class="yp-pp" aria-label="' + PP + '">▶</button>' +
      '<span class="yp-time">0:00 / …</span>' +
      '<div class="yp-track" role="slider" aria-label="' + T('Position in this part', 'Позиция во фрагменте') + '" tabindex="0"><div class="yp-fill"></div><div class="yp-marks"></div><div class="yp-knob"></div></div>' +
      '<button type="button" class="yp-speed" aria-label="' + T('Speed', 'Скорость') + '">1×</button>' +
      '<button type="button" class="yp-cc" aria-label="' + T('Subtitles', 'Субтитры') + '">CC</button>' +
      '<button type="button" class="yp-gear" aria-label="' + T('Settings', 'Настройки') + '" aria-haspopup="true" aria-expanded="false"><span class="yp-gear-i">⚙</span><i class="yp-hd" hidden>HD</i></button>' +
      '<button type="button" class="yp-full" aria-label="' + T('Full screen', 'Во весь экран') + '">⛶</button></div>' +
      '<div class="yp-set" hidden><div class="yp-set-main"><button type="button" class="yp-set-q"><span class="yp-set-k">' + QNAME + '</span>' +
      '<span class="yp-set-v">' + AUTO + '</span><span class="yp-set-go">›</span></button></div>' +
      '<div class="yp-set-list" hidden><button type="button" class="yp-set-back"><span class="yp-set-go">‹</span>' + QNAME + '</button>' +
      QS.map(function (q) {
        return '<button type="button" class="yp-set-opt" data-q="' + q + '"><span class="yp-set-tick">✓</span><span>' + (q === 'auto' ? AUTO : q + 'p') + '</span><small></small></button>';
      }).join('') + '</div></div>';
    card.querySelector('.yt-thumb').replaceWith(stage);
    var go = card.querySelector('.yt-go');
    if (go) go.remove();
    var $ = function (c) { return stage.querySelector(c); };
    var start = v.t, end = v.end || 0, p = null, timer = null, sp = 0, cc = false, dragging = false;
    var stops = v.stops || [], rec = answers(v.id), fired = {}, asking = null, picked = false, lastT = null;
    var qAt = 0, reload = false, hold = 0, fresh = false, ro = null;
    function len() { return Math.max(1, end - start); }
    function playing() { return p && p.getPlayerState && p.getPlayerState() === 1; }
    function rearm(t) {   // stops after t may ask again (a seek back, "watch that bit again", a new play-through)
      stops.forEach(function (s) { if (s.at >= t - 0.6) delete fired[s.at]; });
      lastT = null;
    }
    function seek(f) {
      if (!p) return;
      f = Math.min(1, Math.max(0, f));
      var to = start + f * len() - (f >= 1 ? 1 : 0);
      $('.yp-done').hidden = true;
      if (asking) unask();   // seeking away from a question leaves it unanswered
      rearm(to);
      p.seekTo(to, true);
    }
    /* play from here (or from `at`); after a quality change while paused, this is when the new stream loads */
    function resume(at) {
      $('.yp-done').hidden = true;
      if (reload) restream(at); else p.playVideo();
    }
    function restream(at) {
      reload = false; fresh = true; lastT = null; hold = Date.now() + 3000;
      p.loadVideoById({ videoId: v.id, startSeconds: at != null ? at : p.getCurrentTime() });
    }
    // ---- quality -------------------------------------------------------------------------------------------
    function fit() {
      var f = $('.yp-screen iframe'), scr = $('.yp-screen'), s = QSIZE[quality];
      if (!f) return;
      if (!s) { f.style.width = f.style.height = f.style.transform = ''; return; }
      var r = window.devicePixelRatio || 1, w = Math.round(s[0] / r), h = Math.round(s[1] / r), W = scr.clientWidth, H = scr.clientHeight;
      if (!W || !H) return;
      var k = Math.min(W / w, H / h);
      f.style.width = w + 'px';
      f.style.height = h + 'px';
      f.style.transformOrigin = '0 0';
      f.style.transform = 'translate(' + (W - w * k) / 2 + 'px,' + (H - h * k) / 2 + 'px) scale(' + k + ')';
    }
    function requality() {
      fit();
      qAt = Date.now();
      if (!p || !p.loadVideoById) return;   // not loaded yet: it starts at the new size anyway
      if (playing()) restream(); else reload = true;
    }
    function got() { return p && p.getPlaybackQuality ? QL[p.getPlaybackQuality()] || '' : ''; }
    function qText() {
      var g = got(), want = quality + 'p';
      if (quality === 'auto') return g ? AUTO + ' (' + g + ')' : AUTO;
      if (!g || g === want || reload) return want;
      if (Date.now() - qAt < 10000) return want + ' · …';   // YouTube is still switching: read it again for ~10 s
      return want + T(' · YouTube gave ', ' · YouTube дал ') + g;
    }
    function paintQ() {
      var txt = qText(), g = got(), note = quality === 'auto' ? g : txt.indexOf(' · ') > 0 ? txt.split(' · ')[1] : '';
      if ($('.yp-set-v').textContent !== txt) $('.yp-set-v').textContent = txt;
      Array.prototype.forEach.call(stage.querySelectorAll('.yp-set-opt'), function (b) {
        var on = b.getAttribute('data-q') === quality;
        b.classList.toggle('on', on);
        b.setAttribute('aria-checked', on);
        var sm = b.querySelector('small'), want = on ? note : '';
        if (sm.textContent !== want) sm.textContent = want;
      });
      $('.yp-hd').hidden = !/^(720p|1080p|1440p|4K)$/.test(g);
    }
    function menu(open) {
      var m = $('.yp-set');
      if (open == null) open = m.hidden;
      if (!open && m.hidden) return;
      m.hidden = !open;
      $('.yp-gear').setAttribute('aria-expanded', open);
      $('.yp-gear').classList.toggle('on', open);
      if (open) { m.style.bottom = $('.yp-bar').offsetHeight + 8 + 'px'; pane(false, true); paintQ(); }
    }
    function pane(list, now) {   // slide between "Quality › Auto (720p)" and the list
      var a = $('.yp-set-main'), b = $('.yp-set-list'), show = list ? b : a;
      a.hidden = list; b.hidden = !list;
      show.classList.remove('yp-set-in', 'yp-set-back-in');
      if (!now) { void show.offsetWidth; show.classList.add(list ? 'yp-set-in' : 'yp-set-back-in'); }
      var first = show.querySelector(list ? '.yp-set-opt.on' : 'button');
      if (first && !now) first.focus({ preventScroll: true });
    }
    $('.yp-gear').onclick = function (e) { e.stopPropagation(); menu(); };
    $('.yp-set-q').onclick = function () { pane(true); };
    $('.yp-set-back').onclick = function () { pane(false); };
    Array.prototype.forEach.call(stage.querySelectorAll('.yp-set-opt'), function (b) {
      b.onclick = function () { var q = b.getAttribute('data-q'); if (q !== quality) setQuality(q); paintQ(); pane(false); };
    });
    document.addEventListener('click', function (e) { if (!e.target.closest || !e.target.closest('.yp-set') && !e.target.closest('.yp-gear')) menu(false); });
    // ---- questions inside the part ------------------------------------------------------------------------------
    function marks() {
      if (!end || !stops.length) return;
      $('.yp-marks').innerHTML = stops.map(function (s) {
        var r = rec[s.at], f = Math.min(1, Math.max(0, (s.at - start) / len()));
        return '<i class="yp-mark' + (r ? r.ok ? ' ok' : ' bad' : '') + '" style="left:' + (f * 100) + '%">' + (r && r.ok ? '✓' : '') + '</i>';
      }).join('');
    }
    function doneLine() {
      var el = $('.yp-done-q'), s = score(v);
      el.hidden = !s.n;
      if (!s.n) return;
      el.textContent = s.done < s.n ? T('Questions answered: ' + s.done + ' of ' + s.n, 'Отвечено вопросов: ' + s.done + ' из ' + s.n) :
        s.ok === s.n ? T('✓ ' + s.n + ' of ' + s.n + ' questions right', '✓ Верных ответов: ' + s.n + ' из ' + s.n) :
        T(s.ok + ' of ' + s.n + ' — review the explanations', 'Верных ответов: ' + s.ok + ' из ' + s.n + ' — перечитайте пояснения');
    }
    function ask(s) {
      asking = s; picked = false; fired[s.at] = 1;
      if (playing()) p.pauseVideo();
      menu(false);
      var box = $('.yp-quiz'), n = stops.indexOf(s) + 1;
      box.innerHTML = '<div class="yp-quiz-in"><div class="yp-quiz-k">' + T('Quick question', 'Быстрый вопрос') + (stops.length > 1 ? ' · ' + n + '/' + stops.length : '') + '</div>' +
        '<div class="yp-quiz-q">' + esc(s.q) + '</div><div class="yp-quiz-opts">' +
        s.options.map(function (o, i) { return '<button type="button" class="yp-quiz-o" data-i="' + i + '"><b>' + (i + 1) + '</b><span>' + esc(o) + '</span></button>'; }).join('') +
        '</div><div class="yp-quiz-res" hidden></div><div class="yp-quiz-acts" hidden></div></div>';
      Array.prototype.forEach.call(box.querySelectorAll('.yp-quiz-o'), function (b) { b.onclick = function () { pick(Number(b.getAttribute('data-i'))); }; });
      stage.classList.add('yp-ask');
      box.hidden = false;
      box.scrollTop = 0;
      var first = box.querySelector('.yp-quiz-o');
      if (first) first.focus({ preventScroll: true });
    }
    function pick(i) {
      var s = asking;
      if (!s || picked) return;
      picked = true;
      var ok = i === s.answer, box = $('.yp-quiz');
      record(v.id, s.at, ok);
      rec = answers(v.id);
      Array.prototype.forEach.call(box.querySelectorAll('.yp-quiz-o'), function (b, j) {
        b.disabled = true;
        if (j === i) b.classList.add(ok ? 'ok' : 'bad');
      });
      var res = box.querySelector('.yp-quiz-res'), acts = box.querySelector('.yp-quiz-acts');
      res.innerHTML = '<b class="' + (ok ? 'ok' : 'bad') + '">' + (ok ? T('✓ Correct', '✓ Верно') : T('✗ Not quite', '✗ Не совсем')) + '</b> ' + esc(s.explain || '');
      res.hidden = false;
      acts.innerHTML = ok ? '<button type="button" class="yp-quiz-go">' + T('▶ Continue', '▶ Продолжить') + '</button>' :
        '<button type="button" class="yp-quiz-back">' + T('↺ Watch that bit again', '↺ Посмотреть этот кусок ещё раз') + '</button>' +
        '<button type="button" class="yp-quiz-go">' + T('Continue anyway', 'Всё равно продолжить') + '</button>';
      acts.hidden = false;
      acts.querySelector('.yp-quiz-go').onclick = function () { unask(); resume(); };
      var back = acts.querySelector('.yp-quiz-back');
      if (back) back.onclick = function () {
        var to = Math.max(start, s.at - (s.back || 45));
        unask();
        rearm(to);
        p.seekTo(to, true);
        resume(to);
      };
      acts.querySelector('button').focus({ preventScroll: true });
      marks(); doneLine(); mark(card, v);
      changed();
    }
    function unask() {
      asking = null; picked = false;
      $('.yp-quiz').hidden = true;
      $('.yp-quiz').innerHTML = '';
      stage.classList.remove('yp-ask');
    }
    function watched() {
      var w = load(VW);
      if (w[partKey(v)]) return;
      w[partKey(v)] = 1;
      save(VW, w);
      if (mark(card, v)) changed();
    }
    document.addEventListener('keydown', function (e) {   // 1–4 pick an option
      if (!asking || picked || !document.body.contains(stage)) return;
      if (e.target && e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      var n = Number(e.key);
      if (n >= 1 && n <= asking.options.length) { e.preventDefault(); pick(n - 1); }
    });
    // ---- the clock ----------------------------------------------------------------------------------------------
    function paint() {
      if (!document.body.contains(stage)) { clearInterval(timer); if (ro) ro.disconnect(); try { p.destroy(); } catch (e) { /* gone */ } return; }
      if (!p || !p.getCurrentTime) return;
      var t = p.getCurrentTime();
      if (playing() && !asking && Date.now() > hold) {   // a question due here? (once per play-through, ±0.6 s; a slow tick still catches it)
        for (var i = 0; i < stops.length; i++) {
          var s = stops[i];
          if (fired[s.at] || rec[s.at] && rec[s.at].ok) continue;
          if (t >= s.at - 0.6 && (t <= s.at + 0.6 || lastT != null && lastT < s.at && t - lastT < 3)) { ask(s); break; }
        }
      }
      if (playing()) lastT = t;
      if (end && t >= end - 0.25) {   // the part is over: stop here, never run into the next topic
        if (playing()) { p.pauseVideo(); watched(); }
        if (t > end + 1) p.seekTo(end - 0.5, true);
        if ($('.yp-done').hidden) { doneLine(); $('.yp-done').hidden = false; }
        t = end;
      } else if (t < start - 1 && Date.now() > hold) p.seekTo(start, true);   // (a reload reports 0 for a moment)
      var rel = Math.max(0, t - start);
      if (!dragging) {
        var f = Math.min(1, rel / len());
        $('.yp-fill').style.width = (f * 100) + '%';
        $('.yp-knob').style.left = (f * 100) + '%';
      }
      $('.yp-time').textContent = clock(Math.round(rel)) + ' / ' + clock(Math.round(len()));
      paintQ();
      var on = playing() && !(end && t >= end - 0.25);
      $('.yp-pp').textContent = on ? '❚❚' : '▶';
      $('.yp-big').hidden = on;
      stage.classList.toggle('yp-paused', !on);
    }
    function toggle() {
      if (!p || asking) return;   // a question is open: answer it first
      if (playing()) { p.pauseVideo(); return; }
      if (end && p.getCurrentTime() >= end - 0.5) { rearm(start); p.seekTo(start, true); resume(start); return; }
      resume();
    }
    $('.yp-cover').onclick = function () { if (!$('.yp-set').hidden) { menu(false); return; } toggle(); };
    $('.yp-pp').onclick = toggle;
    $('.yp-again').onclick = function (e) { e.stopPropagation(); seek(0); resume(start); };
    $('.yp-speed').onclick = function () { sp = (sp + 1) % SPEEDS.length; if (p) p.setPlaybackRate(SPEEDS[sp]); $('.yp-speed').textContent = SPEEDS[sp] + '×'; };
    function captions() {
      try { if (cc) { p.loadModule('captions'); p.setOption('captions', 'track', { languageCode: 'en' }); } else p.unloadModule('captions'); } catch (e) { /* no captions */ }
    }
    $('.yp-cc').onclick = function () {
      if (!p) return;
      cc = !cc;
      captions();
      $('.yp-cc').classList.toggle('on', cc);
    };
    /* full screen: the browser's own where it is allowed; where it is not (iPhone Safari, some in-app browsers) the
       player fills the window instead, so the button always does something */
    function fsEl() { return document.fullscreenElement || document.webkitFullscreenElement; }
    function setMax(on) {
      stage.classList.toggle('yp-max', on);
      document.body.classList.toggle('yp-lock', on);
      icon();
      fit();
    }
    function icon() { $('.yp-full').textContent = fsEl() === stage || stage.classList.contains('yp-max') ? '✕' : '⛶'; }
    function full() {
      menu(false);
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
    document.addEventListener('fullscreenchange', function () { icon(); fit(); });
    document.addEventListener('webkitfullscreenchange', function () { icon(); fit(); });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!$('.yp-set').hidden) menu(false);
      else if (stage.classList.contains('yp-max')) setMax(false);
    });
    if (window.ResizeObserver) { ro = new ResizeObserver(fit); ro.observe($('.yp-screen')); } else window.addEventListener('resize', fit);
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
            marks();
            p.playVideo();
            timer = setInterval(paint, 250);
            paint();
          },
          onStateChange: function (e) {   // a reload (new quality) forgets the speed and the subtitles
            if (e.data !== 1) return;
            if (p.getPlaybackRate && p.getPlaybackRate() !== SPEEDS[sp]) p.setPlaybackRate(SPEEDS[sp]);
            if (fresh && cc) captions();
            fresh = false;
          }
        }
      });
      fit();   // the frame exists now: it loads at the chosen size from the start
      players.push({ alive: function () { return document.body.contains(stage); }, requality: requality });
    }).catch(function () {   // the API could not load: the plain player, still starting and ending at the part
      $('.yp-screen').innerHTML = '<iframe class="yt-frame" allow="autoplay; encrypted-media; fullscreen" allowfullscreen src="https://www.youtube-nocookie.com/embed/' +
        v.id + '?autoplay=1&rel=0&start=' + start + (v.end ? '&end=' + v.end : '') + '"></iframe>';
      $('.yp-bar').remove();
      $('.yp-set').remove();
    });
  }
  function build() {
    var sec = document.querySelector('.markdown-section');
    if (!sec) return;
    var quiz = quizzes(sec);   // the ```videoquiz blocks leave the page in any case
    if (sec.querySelector('.yt-panel')) return;
    var links = Array.prototype.filter.call(sec.querySelectorAll('a[href*="youtu.be/"]'), function (a) { return !a.closest('.yt-panel'); });
    var vids = [];
    links.forEach(function (a) {
      var v = info(a);
      if (!v) return;
      var prev = vids[vids.length - 1];   // two videos on one line share the channel name
      if (!v.title && prev && prev.host === a.parentNode && prev.who) v.title = prev.who;
      v.host = a.parentNode; v.who = v.title;
      v.stops = (quiz[v.id] || []).filter(function (s) { return s.at >= v.t && (!v.end || s.at < v.end); })   // this part's questions
        .sort(function (x, y) { return x.at - y.at; });
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
      mark(card, v);
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
    changed();   // new blocks on the page: the frames count them
  }
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(build);
  });
})();
