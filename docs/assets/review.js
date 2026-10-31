/* "My feedback" (Docsify plugin): the mentor's review of each hand-in, task by task, private to her (the founder,
2026-10-31: "structured feedback with a detailed and well styled response so she can pick where she made a mistake").
The bot keeps the reviews (worker.js reviewPost / reviewList, KV rev:<lesson>:<chat>); this page reads them with her
website key (localStorage "al.wk", signin.js) — nothing of it is in the public repository.

- A ```review block (feedback.md, ru/feedback.md) becomes the list of reviews, newest first: the score, a short summary,
  what went well, every task with its verdict (✓ right · ◐ partly · ✗ wrong · – missing), what she wrote, what to fix,
  how to fix it, and the lesson part to look at again; then what to practise next. #/feedback?id=W1D1 opens at one.
- On a lesson page, a hand-in box (sqlrun.js .sq-ws[data-lesson]) with a review gets a line on top:
  "Your mentor's feedback is ready — 17 / 20 · Open".
A review may carry a Russian copy in "ru" ({summary, good, tasks: [{note, fix}], next}); the Russian page uses it. */
(function () {
  var WORKER = 'https://nur-feedback-bot.sohajon2005.workers.dev';
  function T(en, ru) { return window.ALLang ? window.ALLang.t(en, ru) : en; }
  function isRu() { return !!(window.ALLang && window.ALLang.isRu && window.ALLang.isRu()); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function inline(s) { return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>'); }
  function key() { try { return localStorage.getItem('al.wk'); } catch (e) { return null; } }
  var cache = null;
  function reviews() {   // one request per page load
    if (!key()) return Promise.resolve(null);
    if (!cache) cache = fetch(WORKER + '/review?key=' + encodeURIComponent(key()), { cache: 'no-store' })
      .then(function (r) { if (r.status === 401) return null; if (!r.ok) throw r.status; return r.json(); })
      .then(function (j) { return j ? j.reviews || [] : null; })
      .catch(function (e) { cache = null; throw e; });
    return cache;
  }
  var IC = {
    ok: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    partly: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 12h12"/></svg>',
    wrong: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg>',
    missing: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 7v6M12 17h.01"/></svg>'
  };
  var VERDICT = function (v) {
    return { ok: T('Right', 'Верно'), partly: T('Partly right', 'Частично'), wrong: T('Needs fixing', 'Нужно исправить'), missing: T('Missing', 'Нет ответа') }[v] || v;
  };
  function nice(stamp) {   // "2026-10-31 18:20 UTC" → "31 Oct"
    var m = /^(\d{4})-(\d\d)-(\d\d)/.exec(stamp || '');
    if (!m) return '';
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 12));
    return d.toLocaleDateString(isRu() ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  }
  function lessonHref(id) {
    var m = /^W(\d+)D(\d)$/.exec(id || '');
    return m ? '#/' + (isRu() ? 'ru/' : '') + 'weeks/week-' + String(m[1]).padStart(2, '0') + '/day-' + m[2] : '';
  }
  function list(xs) { return '<ul>' + xs.map(function (x) { return '<li>' + inline(x) + '</li>'; }).join('') + '</ul>'; }

  function card(r) {
    var ru = isRu() && r.ru ? r.ru : null, tasks = r.tasks || [];
    var pct = r.max ? Math.round(100 * r.score / r.max) : null, tone = pct == null ? '' : pct >= 85 ? ' rv-hi' : pct >= 70 ? ' rv-mid' : ' rv-lo';
    var h = '<article class="rv' + tone + '" id="rv-' + esc(r.lesson) + '">' +
      '<div class="rv-top"><div class="rv-head"><div class="rv-hw">' + esc(r.hw || r.lesson) + '</div>' +
      '<div class="rv-title">' + esc(r.title || '') + '</div>' +
      '<div class="rv-meta">' + [T('Reviewed ', 'Проверено ') + nice(r.sent),
        r.late ? T('handed in late', 'сдано с опозданием') : T('handed in on time', 'сдано вовремя'),
        lessonHref(r.lesson) ? '<a href="' + lessonHref(r.lesson) + '">' + T('open the lesson', 'открыть урок') + '</a>' : ''].filter(Boolean).join(' · ') + '</div></div>' +
      (r.max ? '<div class="rv-score" aria-label="' + T('Score', 'Баллы') + '"><b>' + esc(r.score) + '</b><span>/ ' + esc(r.max) + '</span></div>' : '') + '</div>' +
      (r.max ? '<div class="rv-bar"><i style="width:' + Math.max(0, Math.min(100, pct)) + '%"></i></div>' : '') +
      ((ru ? ru.summary : r.summary) ? '<p class="rv-sum">' + inline(ru ? ru.summary : r.summary) + '</p>' : '');
    var good = ru && ru.good ? ru.good : r.good || [];
    if (good.length) h += '<section class="rv-good"><h4>' + T('What went well', 'Что получилось') + '</h4>' + list(good) + '</section>';
    if (tasks.length) {
      h += '<section class="rv-tasks"><h4>' + T('Task by task', 'По заданиям') + '</h4>';
      tasks.forEach(function (t, i) {
        var tr = ru && ru.tasks && ru.tasks[i] || {}, v = IC[t.verdict] ? t.verdict : 'partly';
        h += '<div class="rv-task rv-' + v + '"><div class="rv-task-h"><span class="rv-ic" aria-hidden="true">' + IC[v] + '</span>' +
          '<b>' + esc(t.id) + '</b><span class="rv-verdict">' + VERDICT(v) + '</span>' +
          (t.max ? '<span class="rv-pts">' + esc(t.points) + ' / ' + esc(t.max) + '</span>' : '') + '</div>' +
          (t.q ? '<div class="rv-q">' + inline(t.q) + '</div>' : '') +
          (t.her ? '<div class="rv-her"><span>' + T('You wrote', 'Ваш ответ') + '</span><pre>' + esc(t.her) + '</pre></div>' : '') +
          ((tr.note || t.note) ? '<p class="rv-note">' + inline(tr.note || t.note) + '</p>' : '') +
          ((tr.fix || t.fix) ? '<p class="rv-fix"><b>' + T('How to fix it: ', 'Как исправить: ') + '</b>' + inline(tr.fix || t.fix) + '</p>' : '') +
          (t.see && t.see.href ? '<a class="rv-see" href="' + esc((isRu() ? t.see.href.replace('#/', '#/ru/') : t.see.href)) + '">' + T('Look again: ', 'Посмотрите ещё раз: ') + esc(t.see.label || '') + ' →</a>' : '') +
          '</div>';
      });
      h += '</section>';
    }
    var next = ru && ru.next ? ru.next : r.next || [];
    if (next.length) h += '<section class="rv-next"><h4>' + T('Practise next', 'Что потренировать') + '</h4>' + list(next) + '</section>';
    return h + '</article>';
  }

  function page(pre) {
    var box = document.createElement('div');
    box.className = 'rv-list';
    pre.parentNode.replaceChild(box, pre);
    function draw() {
      if (!key()) {
        box.innerHTML = '<p class="rv-empty">' + T('Sign in once on this device to see your mentor’s feedback — it is private, only you and your mentor see it.',
          'Войдите один раз на этом устройстве, чтобы увидеть отзывы ментора, — они личные, их видите только вы и ментор.') + '</p>';
        if (window.ALSignIn) box.appendChild(ALSignIn.card({}));
        return;
      }
      box.innerHTML = '<p class="rv-empty">' + T('Loading your feedback…', 'Загружаем отзывы…') + '</p>';
      reviews().then(function (rs) {
        if (rs === null) { cache = null; box.innerHTML = ''; if (window.ALSignIn) { ALSignIn.dropKey && ALSignIn.dropKey(); box.appendChild(ALSignIn.card({})); } return; }
        if (!rs.length) { box.innerHTML = '<p class="rv-empty">' + T('No feedback yet. When your mentor has checked a homework, it appears here — and the bot tells you.', 'Пока отзывов нет. Когда ментор проверит домашнее задание, отзыв появится здесь — и бот сообщит.') + '</p>'; return; }
        rs.sort(function (a, b) { return (b.sent || '') < (a.sent || '') ? -1 : 1; });
        box.innerHTML = rs.map(card).join('');
        var m = /[?&]id=([\w-]+)/.exec(location.hash), el = m && document.getElementById('rv-' + m[1]);
        if (el) { el.classList.add('rv-flash'); setTimeout(function () { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50); }
      }).catch(function () {
        box.innerHTML = '<p class="rv-empty">' + T('Could not load your feedback — check the connection and reload the page.', 'Не удалось загрузить отзывы — проверьте подключение и обновите страницу.') + '</p>';
      });
    }
    draw();
    document.addEventListener('al-signin', function () { if (document.body.contains(box)) { cache = null; draw(); } });
  }

  /* a lesson's hand-in box: "Your mentor's feedback is ready — 17 / 20 · Open" */
  function banners(sec) {
    var boxes = sec.querySelectorAll('.sq-ws[data-lesson]');
    if (!boxes.length || !key()) return;
    reviews().then(function (rs) {
      (rs || []).forEach(function (r) {
        Array.prototype.forEach.call(boxes, function (b) {
          if (b.dataset.lesson !== r.lesson || b.querySelector('.rv-ready')) return;
          var a = document.createElement('a');
          a.className = 'rv-ready';
          a.href = '#/' + (isRu() ? 'ru/' : '') + 'feedback?id=' + r.lesson;
          a.innerHTML = '<span class="rv-ready-ic" aria-hidden="true">' + IC.ok + '</span><span>' + T('Your mentor’s feedback is ready', 'Отзыв ментора готов') +
            (r.max ? ' — <b>' + esc(r.score) + ' / ' + esc(r.max) + '</b>' : '') + '</span><span class="rv-ready-go">' + T('Open', 'Открыть') + ' →</span>';
          b.insertBefore(a, b.firstChild);
        });
      });
    }).catch(function () { /* no connection: the box works as before */ });
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(function () {
      var sec = document.querySelector('.markdown-section');
      if (!sec) return;
      var pre = sec.querySelector('pre[data-lang="review"]');
      if (pre) page(pre);
      setTimeout(function () { banners(sec); }, 300);   // after sqlrun.js has drawn the hand-in boxes
    });
  });
})();
