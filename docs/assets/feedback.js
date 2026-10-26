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
  function lessonOf(path) {
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
      return '<div class="fb-top"><span class="fb-icon">' + ICON + '</span><div><div class="fb-title">How was today?</div>' +
        '<div class="fb-sub">' + sub + '</div></div></div>';
    }
    function tg() { return '<a class="fb-tg" target="_blank" rel="noopener" href="' + BOT + 'fb_' + lesson + '">or answer in Telegram</a>'; }
    function intro() {
      card.innerHTML = head('7 quick questions · 2 minutes · only your mentor reads it') +
        '<div class="fb-foot"><button type="button" class="qz-btn fb-open">Leave feedback</button>' + tg() + '</div>';
      card.querySelector('.fb-open').onclick = load;
    }
    function note(sub, html) { card.innerHTML = head(sub) + '<div class="fb-foot">' + html + '</div>'; }
    function connect() {
      note('First connect this website to the course bot — once per browser.',
        '<a class="qz-btn fb-link" target="_blank" rel="noopener" href="' + BOT + 'connect">🔑 Connect</a>' + tg());
    }
    function load() {
      if (!key()) return connect();
      note('Loading…', '');
      fetch(WORKER + '/feedback?key=' + encodeURIComponent(key()) + '&lesson=' + lesson)
        .then(function (r) { if (r.status === 401) throw 'key'; if (!r.ok) throw 'net'; return r.json(); })
        .then(function (d) {
          data = d;
          if (!d.handedIn) {
            note('First hand in ' + esc(d.hw) + ' — then tell us how the lesson was.',
              '<button type="button" class="qz-btn fb-jump">Go to the hand-in box</button><button type="button" class="qz-btn qz-ghost fb-again">Check again</button>');
            card.querySelector('.fb-jump').onclick = function () {
              var box = document.querySelector('.markdown-section .sq-ws');
              if (box) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
            };
            card.querySelector('.fb-again').onclick = load;
            return;
          }
          answers = d.answers ? Object.assign({}, d.answers) : {};
          if (d.answers) summary('Your feedback on this lesson · ' + esc(d.date));
          else { cur = 0; step(); }
        })
        .catch(function (e) {
          if (e === 'key') return connect();
          note('Could not reach the course bot. Check the connection and try again.',
            '<button type="button" class="qz-btn fb-open">Try again</button>' + tg());
          card.querySelector('.fb-open').onclick = load;
        });
    }
    function summary(sub) {
      card.innerHTML = head(sub) + '<dl class="fb-sum">' + data.steps.map(function (s) {
        var v = answers[s.key];
        return '<dt>' + esc(s.label) + '</dt><dd>' + (v == null || v === '' ? '—' : esc(v)) + '</dd>';
      }).join('') + '</dl><div class="fb-foot"><button type="button" class="qz-btn qz-ghost fb-change">Change my answers</button></div>';
      card.querySelector('.fb-change').onclick = function () { cur = 0; step(); };
    }
    function step() {
      var s = data.steps[cur], n = data.steps.length, v = answers[s.key];
      var body = s.choices
        ? '<div class="fb-chips">' + s.choices.map(function (c, i) {
            return '<button type="button" class="fb-chip' + (v === c ? ' on' : '') + '" data-i="' + i + '">' + esc(c) + '</button>';
          }).join('') + '</div>'
        : '<textarea class="fb-text" rows="3" placeholder="Type here, or skip">' + esc(v || '') + '</textarea>';
      card.innerHTML = head('Question ' + (cur + 1) + ' of ' + n) +
        '<div class="qz-segs">' + data.steps.map(function (x, i) { return '<span class="' + (i === cur ? 'now' : i < cur ? 'did' : '') + '"></span>'; }).join('') + '</div>' +
        '<div class="fb-q">' + esc(s.q) + '</div>' + body +
        '<div class="fb-foot"><button type="button" class="qz-btn qz-ghost fb-back"' + (cur ? '' : ' style="visibility:hidden"') + '>Back</button>' +
        '<button type="button" class="qz-btn qz-ghost fb-skip">Skip</button>' +
        '<button type="button" class="qz-btn fb-next' + (cur === n - 1 ? ' qz-submit' : '') + '">' + (cur === n - 1 ? 'Send feedback' : 'Next') + '</button></div>';
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
      note('Sending…', '');
      fetch(WORKER + '/feedback', { method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: key(), lesson: lesson, answers: answers }) })
        .then(function (r) { if (!r.ok) throw r.status; return r.json(); })
        .then(function (d) { summary('✅ ' + (d.changed ? 'Changed' : 'Saved') + ' — thank you! Your mentor reads every answer.'); })
        .catch(function () {
          note('Not sent — check the connection and try again. Your answers are kept.',
            '<button type="button" class="qz-btn fb-resend">Send again</button>');
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
