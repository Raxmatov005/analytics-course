/* "How was today?" (Docsify plugin): the lesson's feedback right on the page, at the end of every day page and the
practice day. The same seven questions as the course bot, one at a time with buttons (the bot's GET /feedback hands
them over, so there is one list), saved like the bot's answers (POST /feedback) and changeable later, here or in the
bot. It needs the website connected to her (the key from sqlrun.js, localStorage "al.wk"), and the lesson's homework
handed in first, as in the bot. "Or in Telegram" opens the bot on this lesson (t.me/<bot>?start=fb_W1D2). */
(function () {
  var WORKER = 'https://nur-feedback-bot.sohajon2005.workers.dev';
  var BOT = 'https://t.me/Nur_Analytics_Course_bot?start=';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function key() { try { return localStorage.getItem('al.wk'); } catch (e) { return null; } }
  function T(en, ru) { return window.ALLang ? window.ALLang.t(en, ru) : en; }
  /* the same lesson id on the English page and its Russian copy (ru/weeks/… → W1D2) */
  function lessonOf(path) {
    path = path.replace(/^ru(\/|$)/, '');
    var m = /weeks\/week-(\d\d)\/day-(\d)/.exec(path);
    if (m) return 'W' + Number(m[1]) + 'D' + m[2];
    if (/(^|\/)practice$/.test(path)) return 'Practice';
    return null;
  }
  var ICON = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
    'stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';

  function mount(card, lesson) {
    var data = null, answers = {}, cur = 0;
    function head(sub) {
      return '<div class="fb-top"><span class="fb-icon">' + ICON + '</span><div><div class="fb-title">' + T('How was today?', 'Как прошёл день?') + '</div>' +
        '<div class="fb-sub">' + sub + '</div></div></div>';
    }
    function tg() { return '<a class="fb-tg" target="_blank" rel="noopener" href="' + BOT + 'fb_' + lesson + '">' + T('or answer in Telegram', 'или ответьте в Telegram') + '</a>'; }
    function intro() {
      card.innerHTML = head(T('7 quick questions · 2 minutes · only your mentor reads it', '7 коротких вопросов · 2 минуты · читает только ваш ментор')) +
        '<div class="fb-foot"><button type="button" class="qz-btn fb-open">' + T('Leave feedback', 'Оставить отзыв') + '</button>' + tg() + '</div>';
      card.querySelector('.fb-open').onclick = load;
    }
    function note(sub, html) { card.innerHTML = head(sub) + '<div class="fb-foot">' + html + '</div>'; }
    function connect() {
      note(T('First connect this website to the course bot — once per browser.', 'Сначала подключите этот сайт к боту курса — один раз в каждом браузере.'),
        '<a class="qz-btn fb-link" target="_blank" rel="noopener" href="' + BOT + 'connect">' + T('🔑 Connect', '🔑 Подключить') + '</a>' + tg());
    }
    function load() {
      if (!key()) return connect();
      note(T('Loading…', 'Загрузка…'), '');
      fetch(WORKER + '/feedback?key=' + encodeURIComponent(key()) + '&lesson=' + lesson)
        .then(function (r) { if (r.status === 401) throw 'key'; if (!r.ok) throw 'net'; return r.json(); })
        .then(function (d) {
          data = d;
          if (!d.handedIn) {
            note(T('First hand in ' + esc(d.hw) + ' — then tell us how the lesson was.', 'Сначала сдайте ' + esc(d.hw) + ' — потом расскажите, как прошёл урок.'),
              '<button type="button" class="qz-btn fb-jump">' + T('Go to the hand-in box', 'Перейти к сдаче работы') + '</button>' +
              '<button type="button" class="qz-btn qz-ghost fb-again">' + T('Check again', 'Проверить снова') + '</button>');
            card.querySelector('.fb-jump').onclick = function () {
              var box = document.querySelector('.markdown-section .sq-ws');
              if (box) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
            };
            card.querySelector('.fb-again').onclick = load;
            return;
          }
          answers = d.answers ? Object.assign({}, d.answers) : {};
          if (d.answers) summary(T('Your feedback on this lesson · ', 'Ваш отзыв об этом уроке · ') + esc(d.date));
          else { cur = 0; step(); }
        })
        .catch(function (e) {
          if (e === 'key') return connect();
          note(T('Could not reach the course bot. Check the connection and try again.', 'Не удалось связаться с ботом курса. Проверьте подключение и попробуйте снова.'),
            '<button type="button" class="qz-btn fb-open">' + T('Try again', 'Попробовать снова') + '</button>' + tg());
          card.querySelector('.fb-open').onclick = load;
        });
    }
    function summary(sub) {
      card.innerHTML = head(sub) + '<dl class="fb-sum">' + data.steps.map(function (s) {
        var v = answers[s.key];
        return '<dt>' + esc(s.label) + '</dt><dd>' + (v == null || v === '' ? '—' : esc(v)) + '</dd>';
      }).join('') + '</dl><div class="fb-foot"><button type="button" class="qz-btn qz-ghost fb-change">' + T('Change my answers', 'Изменить ответы') + '</button></div>';
      card.querySelector('.fb-change').onclick = function () { cur = 0; step(); };
    }
    function step() {
      var s = data.steps[cur], n = data.steps.length, v = answers[s.key];
      var body = s.choices
        ? '<div class="fb-chips">' + s.choices.map(function (c, i) {
            return '<button type="button" class="fb-chip' + (v === c ? ' on' : '') + '" data-i="' + i + '">' + esc(c) + '</button>';
          }).join('') + '</div>'
        : '<textarea class="fb-text" rows="3" placeholder="' + T('Type here, or skip', 'Напишите здесь или пропустите') + '">' + esc(v || '') + '</textarea>';
      card.innerHTML = head(T('Question ' + (cur + 1) + ' of ' + n, 'Вопрос ' + (cur + 1) + ' из ' + n)) +
        '<div class="qz-segs">' + data.steps.map(function (x, i) { return '<span class="' + (i === cur ? 'now' : i < cur ? 'did' : '') + '"></span>'; }).join('') + '</div>' +
        '<div class="fb-q">' + esc(s.q) + '</div>' + body +
        '<div class="fb-foot"><button type="button" class="qz-btn qz-ghost fb-back"' + (cur ? '' : ' style="visibility:hidden"') + '>' + T('Back', 'Назад') + '</button>' +
        '<button type="button" class="qz-btn qz-ghost fb-skip">' + T('Skip', 'Пропустить') + '</button>' +
        '<button type="button" class="qz-btn fb-next' + (cur === n - 1 ? ' qz-submit' : '') + '">' + (cur === n - 1 ? T('Send feedback', 'Отправить отзыв') : T('Next', 'Далее')) + '</button></div>';
      var ta = card.querySelector('.fb-text');
      function keep() { if (ta) answers[s.key] = ta.value.trim() || null; }
      Array.prototype.forEach.call(card.querySelectorAll('.fb-chip'), function (b) {
        b.onclick = function () { answers[s.key] = s.choices[Number(b.dataset.i)]; go(1); };
      });
      card.querySelector('.fb-back').onclick = function () { keep(); go(-1); };
      card.querySelector('.fb-skip').onclick = function () { answers[s.key] = null; go(1); };
      card.querySelector('.fb-next').onclick = function () { keep(); go(1); };
      if (ta) ta.focus();
    }
    function go(d) {
      cur += d;
      if (cur < 0) cur = 0;
      if (cur >= data.steps.length) return send();
      step();
    }
    function send() {
      note(T('Sending…', 'Отправка…'), '');
      fetch(WORKER + '/feedback', { method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: key(), lesson: lesson, answers: answers }) })
        .then(function (r) { if (!r.ok) throw r.status; return r.json(); })
        .then(function (d) {
          summary('✅ ' + (d.changed ? T('Changed', 'Изменено') : T('Saved', 'Сохранено')) + T(' — thank you! Your mentor reads every answer.', ' — спасибо! Ментор читает каждый ответ.'));
        })
        .catch(function () {
          note(T('Not sent — check the connection and try again. Your answers are kept.', 'Не отправлено — проверьте подключение и попробуйте снова. Ваши ответы сохранены.'),
            '<button type="button" class="qz-btn fb-resend">' + T('Send again', 'Отправить снова') + '</button>');
          card.querySelector('.fb-resend').onclick = send;
        });
    }
    intro();
  }

  function draw(vm) {
    var lesson = lessonOf(vm.route.path.replace(/^\//, '').replace(/\.md$/, ''));
    var section = document.querySelector('.markdown-section');
    if (!lesson || !section || section.querySelector('.fb-card')) return;
    var card = document.createElement('div');
    card.className = 'fb-card';
    var pager = section.querySelector('.docsify-pagination-container');  // keep Previous / Next as the very last thing
    if (pager && pager.parentNode) pager.parentNode.insertBefore(card, pager); else section.appendChild(card);
    mount(card, lesson);
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook, vm) {
    hook.doneEach(function () { draw(vm); });
  });
})();
