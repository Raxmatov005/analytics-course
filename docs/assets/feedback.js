/* "How was today?" (Docsify plugin): the lesson's feedback right on the page, at the end of every day page and the
practice day. Local-first: it always works, and it is saved on this device the moment she answers.

- Without the website key (localStorage "al.wk", from sqlrun.js), or when the course bot cannot be reached, the card
  asks its own seven questions, one at a time with buttons, and keeps the answers in localStorage "al.fb" →
  {lesson: {answers, at, sent}}. The card then shows them with "Saved on this device".
- "Send to your mentor" posts the saved answers to the bot (POST /feedback, as the bot's own answers). Without a key
  that is when the sign-in card (signin.js: name + PIN from the mentor) appears; a refusal (4xx) keeps them on this device and says so.
  Saved answers also go by themselves (sendSaved): on every page load, after signing in, and after the lesson's hand-in
  (sqlrun.js fires "al-handin"); until then the card says "⏳ Not sent yet" and why.
- With a key the card does what it did before: the bot's seven questions (GET /feedback hands them over, so there is
  one list), the homework handed in first, saved with POST /feedback and changeable later, here or in the bot. */
(function () {
  var WORKER = 'https://nur-feedback-bot.sohajon2005.workers.dev';
  var LOCAL = 'al.fb';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function key() { try { return localStorage.getItem('al.wk'); } catch (e) { return null; } }
  function T(en, ru) { return window.ALLang ? window.ALLang.t(en, ru) : en; }
  function allLocal() { try { return JSON.parse(localStorage.getItem(LOCAL)) || {}; } catch (e) { return {}; } }
  function getLocal(lesson) { return allLocal()[lesson] || null; }
  function putLocal(lesson, rec) {
    var all = allLocal();
    all[lesson] = rec;
    try { localStorage.setItem(LOCAL, JSON.stringify(all)); } catch (e) { /* private window: the answers live until the page closes */ }
  }
  /* answers kept on this device go to the mentor by themselves once she is signed in and the lesson's homework is in — on
     every page load, after signing in and after a hand-in (her Day 1 answers sat here unsent: "Saved on this device —
     thank you!" read as done, 2026-10-30). One send per lesson at a time; it resolves to 'sent', 'hw' (homework not
     in yet), 'key' (signed out), 'bad' (refused) or 'net' (no connection). */
  var sending = {};
  function sendSaved(lesson) {
    var loc = getLocal(lesson);
    if (!loc || !loc.answers || loc.sent || !key()) return Promise.resolve(null);
    if (!Object.keys(loc.answers).some(function (k) { return loc.answers[k] != null && loc.answers[k] !== ''; })) return Promise.resolve('empty');
    if (sending[lesson]) return sending[lesson];
    var what = JSON.stringify(loc.answers);
    return (sending[lesson] = fetch(WORKER + '/feedback', { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ key: key(), lesson: lesson, answers: loc.answers, source: 'site' }) })
      .then(function (r) { if (!r.ok) throw r.status; return r.json(); })
      .then(function () {
        var now = getLocal(lesson);   // changed while it was on its way: the new answers go next time
        if (now && JSON.stringify(now.answers) === what) { now.sent = true; now.sentAt = new Date().toISOString(); putLocal(lesson, now); }
        return 'sent';
      })
      .catch(function (e) {
        if (e === 401 && window.ALSignIn) ALSignIn.dropKey();
        return e === 409 ? 'hw' : e === 401 ? 'key' : typeof e === 'number' && e >= 400 && e < 500 ? 'bad' : 'net';
      })
      .then(function (r) { delete sending[lesson]; return r; }));
  }
  function sweep() { Object.keys(allLocal()).forEach(sendSaved); }
  sweep();
  document.addEventListener('al-signin', sweep);
  document.addEventListener('al-handin', function (e) { if (e.detail && e.detail.lesson) sendSaved(e.detail.lesson); });
  /* what an unsent card says when she is not signed in */
  function NOT_SENT() {
    return T('⏳ Not sent yet — saved on this device only. Tap “Send to your mentor” (you sign in once), and it goes.',
      '⏳ Пока не отправлено — сохранено только на этом устройстве. Нажмите «Отправить ментору» (один раз войдите), и ответы уйдут.');
  }
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

  /* the card's own seven questions (used without the bot) */
  function localSteps() {
    return [
      { key: 'difficulty', label: T('Difficulty', 'Сложность'), q: T('How hard was today?', 'Насколько сложным был день?'),
        choices: [T('Too easy', 'Слишком легко'), T('Just right', 'В самый раз'), T('Hard', 'Сложно'), T('Too hard', 'Слишком сложно')] },
      { key: 'time', label: T('Time', 'Время'), q: T('How long did it take?', 'Сколько времени это заняло?'),
        choices: [T('Under 2 h', 'Меньше 2 ч'), T('2–3 h', '2–3 ч'), T('3–4 h', '3–4 ч'), T('Over 4 h', 'Больше 4 ч')] },
      { key: 'useful', label: T('Most useful', 'Самое полезное'), q: T('What was the most useful part?', 'Что было самым полезным?'),
        choices: [T('Learn', 'Теория'), T('Worked example', 'Разбор'), T('Practice', 'Практика'), T('Homework', 'Домашнее задание'),
          T('Company corner', 'Уголок компании'), T('Games', 'Игры')] },
      { key: 'unclear', label: T('Unclear', 'Непонятно'), q: T('What was unclear?', 'Что было непонятно?') },
      { key: 'tools', label: T('Tools on the page', 'Инструменты'), q: T('Did the tools on the page work?', 'Работали ли инструменты на странице?'),
        choices: [T('Yes', 'Да'), T('Mostly', 'В основном'), T('No', 'Нет')] },
      { key: 'mood', label: T('Feeling', 'Самочувствие'), q: T('How do you feel?', 'Как вы себя чувствуете?'),
        choices: [T('😀 Great', '😀 Отлично'), T('🙂 Fine', '🙂 Нормально'), T('😐 Tired', '😐 Устала'), T('😣 Frustrated', '😣 Расстроена')] },
      { key: 'mentor', label: T('For your mentor', 'Для ментора'), q: T('Anything for your mentor?', 'Что-нибудь для ментора?') }
    ];
  }

  function mount(card, lesson) {
    var data = null, answers = {}, cur = 0;
    function head(sub) {
      return '<div class="fb-top"><span class="fb-icon">' + ICON + '</span><div><div class="fb-title">' + T('How was today?', 'Как прошёл день?') + '</div>' +
        '<div class="fb-sub">' + sub + '</div></div></div>';
    }
    function note(sub, html) { resting = null; card.innerHTML = head(sub) + '<div class="fb-foot">' + html + '</div>'; }
    function intro() {
      var loc = getLocal(lesson);
      if (loc && loc.answers) {
        if (loc.sent) return localSummary(T('✅ Sent to your mentor · also saved on this device', '✅ Отправлено ментору · сохранено и на этом устройстве'));
        if (key()) return sendLocal();
        return localSummary(NOT_SENT());
      }
      card.innerHTML = head(T('7 quick questions · 2 minutes · saved as you answer · only your mentor reads it', '7 коротких вопросов · 2 минуты · сохраняется сразу · читает только ваш ментор')) +
        '<div class="fb-foot"><button type="button" class="qz-btn fb-open">' + T('Leave feedback', 'Оставить отзыв') + '</button></div>';
      card.querySelector('.fb-open').onclick = function () { if (key()) load(); else local(); };
      tail(intro);
    }

    /* ---------- on this device ---------- */
    function local() {
      var loc = getLocal(lesson);
      data = { local: true, steps: localSteps() };
      answers = loc && loc.answers ? Object.assign({}, loc.answers) : {};
      cur = 0;
      step();
    }
    function keepLocal() { putLocal(lesson, { answers: answers, at: new Date().toISOString(), sent: false }); }
    function localSummary(sub) {
      var loc = getLocal(lesson) || { answers: {} };
      card.innerHTML = head(sub) + '<dl class="fb-sum">' + localSteps().map(function (s) {
        var v = loc.answers[s.key];
        return '<dt>' + esc(s.label) + '</dt><dd>' + (v == null || v === '' ? '—' : esc(v)) + '</dd>';
      }).join('') + '</dl><div class="fb-foot">' +
        (loc.sent ? '' : '<button type="button" class="qz-btn fb-send">' + T('Send to your mentor', 'Отправить ментору') + '</button>') +
        '<button type="button" class="qz-btn qz-ghost fb-change">' + T('Change my answers', 'Изменить ответы') + '</button></div>';
      card.querySelector('.fb-change').onclick = local;
      var s = card.querySelector('.fb-send');
      if (s) s.onclick = sendLocal;
      tail(loc.sent ? function () { localSummary(sub); } : intro);   // signing in on an unsent card sends it
    }
    /* not signed in (or signed out): the sign-in card (signin.js); after it, the saved answers are sent */
    function connect(signedOut) {
      note(signedOut ? T('You were signed out — sign in again to send your answers. They stay saved on this device.',
          'Вы вышли из аккаунта — войдите снова, чтобы отправить ответы. Они сохранены на этом устройстве.')
        : T('To send your answers to your mentor, sign in once on this device. Your answers stay saved here meanwhile.',
          'Чтобы ответы дошли до ментора, войдите один раз на этом устройстве. Ответы пока сохранены здесь.'),
        '<button type="button" class="qz-btn qz-ghost fb-back">' + T('Back', 'Назад') + '</button>');
      card.querySelector('.fb-back').onclick = intro;
      if (window.ALSignIn) card.querySelector('.fb-foot').insertAdjacentElement('beforebegin', ALSignIn.card({ done: sendLocal }));
    }
    /* "Signed in as … · sign out" at the bottom of the card; a resting view (start, summary) is drawn again when she signs
       in or out elsewhere on the page, so the line is always current */
    var resting = null;
    function tail(view) {
      resting = view || null;
      var l = window.ALSignIn ? ALSignIn.line() : '';
      if (l) card.insertAdjacentHTML('beforeend', l);
    }
    document.addEventListener('al-signin', function () {
      if (document.body.contains(card) && resting && !card.querySelector('.si-card')) resting();
    });
    function sendLocal() {
      var loc = getLocal(lesson);
      if (!loc || !loc.answers) return intro();
      if (loc.sent) return localSummary(T('✅ Sent to your mentor · also saved on this device', '✅ Отправлено ментору · сохранено и на этом устройстве'));
      if (!key()) return connect();
      note(T('Sending…', 'Отправка…'), '');
      sendSaved(lesson).then(function (r) {
        if (!document.body.contains(card)) return;
        if (r === 'sent') return localSummary(T('✅ Sent — thank you! Your mentor reads every answer.', '✅ Отправлено — спасибо! Ментор читает каждый ответ.'));
        if (r === 'key') return connect(true);
        if (r === 'empty') return localSummary(T('Nothing to send — every question was skipped. Tap “Change my answers” to answer them.',
          'Нечего отправлять — все вопросы пропущены. Нажмите «Изменить ответы», чтобы ответить.'));
        if (r === 'hw') return localSummary(T('⏳ Not sent yet — saved on this device. They go to your mentor by themselves once this lesson’s homework is handed in (the 📎 box above).',
          '⏳ Пока не отправлено — сохранено на этом устройстве. Ответы уйдут ментору сами, как только домашнее задание этого урока будет сдано (📎 окошко выше).'));
        localSummary(r === 'bad'
          ? T('⏳ Not sent — the course bot did not accept these answers, so they stay saved on this device. Tell your mentor, or try again later.',
            '⏳ Не отправлено — бот курса не принял эти ответы, поэтому они остаются сохранёнными на этом устройстве. Сообщите ментору или попробуйте позже.')
          : T('⏳ Not sent — no connection to the course bot. Your answers stay saved on this device and go by themselves next time you open the course.',
            '⏳ Не отправлено — нет связи с ботом курса. Ответы сохранены на этом устройстве и уйдут сами, когда вы снова откроете курс.'));
      });
    }
    document.addEventListener('al-handin', function (e) {   // the homework just went in: the answers waiting for it go now
      var loc = getLocal(lesson);
      if (document.body.contains(card) && e.detail && e.detail.lesson === lesson && loc && loc.answers && !loc.sent) sendLocal();
    });

    /* ---------- through the course bot (a key exists) ---------- */
    function load() {
      if (!key()) return local();
      note(T('Loading…', 'Загрузка…'), '');
      fetch(WORKER + '/feedback?key=' + encodeURIComponent(key()) + '&lesson=' + lesson)
        .then(function (r) { if (r.status === 401) throw 'key'; if (!r.ok) throw 'net'; return r.json(); })
        .then(function (d) {
          data = d;
          if (!d.handedIn) {
            note(T('First hand in ' + esc(d.hw) + ' — then tell us how the lesson was.', 'Сначала сдайте ' + esc(d.hw) + ' — потом расскажите, как прошёл урок.'),
              '<button type="button" class="qz-btn fb-jump">' + T('Go to the hand-in box', 'Перейти к сдаче работы') + '</button>' +
              '<button type="button" class="qz-btn qz-ghost fb-again">' + T('Check again', 'Проверить снова') + '</button>' +
              '<button type="button" class="qz-btn qz-ghost fb-here">' + T('Answer now, send later', 'Ответить сейчас, отправить позже') + '</button>');
            card.querySelector('.fb-jump').onclick = function () {
              var box = document.querySelector('.markdown-section .sq-ws');
              if (box) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
            };
            card.querySelector('.fb-again').onclick = load;
            card.querySelector('.fb-here').onclick = local;
            return;
          }
          answers = d.answers ? Object.assign({}, d.answers) : {};
          if (d.answers) summary(T('Your feedback on this lesson · ', 'Ваш отзыв об этом уроке · ') + esc(d.date));
          else { cur = 0; step(); }
        })
        .catch(function (e) {
          if (e === 'key') { if (window.ALSignIn) ALSignIn.dropKey(); return local(); }   // signed out: answer here, sign in when sending
          local();   // the bot is out of reach: her answers are kept here and can be sent later
        });
    }
    function summary(sub) {
      card.innerHTML = head(sub) + '<dl class="fb-sum">' + data.steps.map(function (s) {
        var v = answers[s.key];
        return '<dt>' + esc(s.label) + '</dt><dd>' + (v == null || v === '' ? '—' : esc(v)) + '</dd>';
      }).join('') + '</dl><div class="fb-foot"><button type="button" class="qz-btn qz-ghost fb-change">' + T('Change my answers', 'Изменить ответы') + '</button></div>';
      card.querySelector('.fb-change').onclick = function () { cur = 0; step(); };
      tail(function () { summary(sub); });
    }

    /* ---------- one question at a time (both ways) ---------- */
    function step() {
      resting = null;
      var s = data.steps[cur], n = data.steps.length, v = answers[s.key], last = cur === n - 1;
      var body = s.choices
        ? '<div class="fb-chips">' + s.choices.map(function (c, i) {
            return '<button type="button" class="fb-chip' + (v === c ? ' on' : '') + '" data-i="' + i + '">' + esc(c) + '</button>';
          }).join('') + '</div>'
        : '<textarea class="fb-text" rows="3" placeholder="' + T('Type here, or skip', 'Напишите здесь или пропустите') + '">' + esc(v || '') + '</textarea>';
      card.innerHTML = head(T('Question ' + (cur + 1) + ' of ' + n, 'Вопрос ' + (cur + 1) + ' из ' + n) + (data.local ? T(' · saved on this device as you answer', ' · сохраняется на этом устройстве сразу') : '')) +
        '<div class="qz-segs">' + data.steps.map(function (x, i) { return '<span class="' + (i === cur ? 'now' : i < cur ? 'did' : '') + '"></span>'; }).join('') + '</div>' +
        '<div class="fb-q">' + esc(s.q) + '</div>' + body +
        '<div class="fb-foot"><button type="button" class="qz-btn qz-ghost fb-back"' + (cur ? '' : ' style="visibility:hidden"') + '>' + T('Back', 'Назад') + '</button>' +
        '<button type="button" class="qz-btn qz-ghost fb-skip">' + T('Skip', 'Пропустить') + '</button>' +
        '<button type="button" class="qz-btn fb-next' + (last ? ' qz-submit' : '') + '">' +
          (!last ? T('Next', 'Далее') : data.local ? T('Save', 'Сохранить') : T('Send feedback', 'Отправить отзыв')) + '</button></div>';
      var ta = card.querySelector('.fb-text');
      function keep() { if (ta) answers[s.key] = ta.value.trim() || null; if (data.local) keepLocal(); }
      if (ta && data.local) ta.addEventListener('input', keep);
      Array.prototype.forEach.call(card.querySelectorAll('.fb-chip'), function (b) {
        b.onclick = function () { answers[s.key] = s.choices[Number(b.dataset.i)]; if (data.local) keepLocal(); go(1); };
      });
      card.querySelector('.fb-back').onclick = function () { keep(); go(-1); };
      card.querySelector('.fb-skip').onclick = function () { answers[s.key] = null; if (data.local) keepLocal(); go(1); };
      card.querySelector('.fb-next').onclick = function () { keep(); go(1); };
      if (ta) ta.focus();
    }
    function go(d) {
      cur += d;
      if (cur < 0) cur = 0;
      if (cur >= data.steps.length) {
        if (!data.local) return send();
        keepLocal();
        return key() ? sendLocal() : localSummary(NOT_SENT());
      }
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
