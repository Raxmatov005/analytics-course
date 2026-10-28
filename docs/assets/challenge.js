/* Daily challenges (Docsify plugin). One per day page, at the very end, written as a fenced block "challenge":

  {"id": "w02d3", "q": "...", "code": "optional", "type": "number" | "text", "dp": 0,
   "h": ["sha-256 fingerprints of the accepted answers"], "hint": "...", "sol": "base64 of the solution text",
   "sql": true | "python": true}   ← optional: an editor on her practice copy above the answer box

The page holds only fingerprints of the answer (built by the mentor), so the answer is not in the page source.
The solution opens once she solves the challenge, or if she gives up (then no XP).
XP grows with the challenge streak: 2, 3, 4, 6, 9, then 10 a day. Saturdays and Sundays never break a streak.
Lucky days: one of Monday–Thursday in each week 1–8, picked by a hash of the week, pays double XP. It is a surprise:
the page says so only when she opens that day, and the map shows a gift on the lucky days she has found.
Results live in this browser (localStorage "al.v1"), next to the quiz results. The box (.chal) is an "al-block", "al-done"
once solved or given up; that change fires "al:change" on document.
*/
(function () {
  var KEY = 'al.v1', SALT = 'nur-finance-2026', XP_STEPS = [2, 3, 4, 6, 9, 10];

  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY)) || {}; s.quizzes = s.quizzes || {}; s.challenges = s.challenges || {}; s.lucky = s.lucky || {}; return s; }
    catch (e) { return { quizzes: {}, challenges: {}, lucky: {} }; }
  }
  function luckyDayOf(week) {
    var h = 2166136261, key = 'nur-lucky-' + week;
    for (var i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return 1 + h % 4;
  }
  function isLucky(id) {
    var m = /^w(\d\d)d(\d)$/.exec(id);
    return !!m && Number(m[1]) >= 1 && Number(m[2]) === luckyDayOf(Number(m[1]));
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* nothing to do */ } }
  /* words in the page's language (lang.js); Russian counts take one of three forms: 1 попытка, 2 попытки, 5 попыток */
  function T(en, ru) { return window.ALLang ? window.ALLang.t(en, ru) : en; }
  function plural(n, one, few, many) {
    var a = Math.abs(n) % 100, b = a % 10;
    return a > 10 && a < 20 ? many : b === 1 ? one : b > 1 && b < 5 ? few : many;
  }
  function dayKey(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fromB64(b) {
    try { return decodeURIComponent(Array.prototype.map.call(atob(b), function (c) { return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); }).join('')); }
    catch (e) { return ''; }
  }

  function canon(raw, type, dp) {
    if (type === 'number') {
      var s = raw;
      var t = String(s).replace(/[\s ']/g, '').replace(/%$/, '');
      if (t.indexOf(',') >= 0) {   // a decimal comma ("70,5") or thousands commas ("7,828"), as task.js reads them
        if (t.indexOf('.') < 0 && /^[+-]?\d+,\d+$/.test(t) && (!/,\d{3}$/.test(t) || /^[+-]?0,/.test(t))) t = t.replace(',', '.');
        else t = t.replace(/,/g, '');
      }
      if (t === '' || isNaN(Number(t))) return null;
      return Number(t).toFixed(dp || 0);
    }
    return String(raw).toLowerCase().replace(/["'`«»]/g, '').replace(/[\s ]+/g, ' ').replace(/[.;]+$/, '').trim();
  }
  function sha(text) {
    var data = new TextEncoder().encode(text);
    return crypto.subtle.digest('SHA-256', data).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('').slice(0, 24);
    });
  }

  /* streak of weekdays with a solved challenge, ending today (or yesterday if today is not solved yet) */
  function streakEndingAt(s, upto) {
    var days = {};
    Object.keys(s.challenges).forEach(function (id) { var c = s.challenges[id]; if (c.solvedOn) days[c.solvedOn] = true; });
    var d = new Date(upto || Date.now()), n = 0, first = true;
    for (var i = 0; i < 400; i++) {
      var k = dayKey(d), wd = d.getDay();
      if (days[k]) n++;
      else if (window.ALSched && window.ALSched.studyDay(k) !== null ? !window.ALSched.studyDay(k) : (wd === 0 || wd === 6)) { /* not a study day (schedule.js; without it the weekend): neutral */ }
      else if (first) { /* today not solved yet */ }
      else break;
      first = false;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }
  function totalXp(s) {
    return Object.keys(s.challenges).reduce(function (t, id) { return t + (s.challenges[id].xp || 0); }, 0);
  }
  window.ALChallenge = {
    state: load,
    streak: function () { return streakEndingAt(load()); },
    solved: function () { var s = load(); return Object.keys(s.challenges).filter(function (k) { return s.challenges[k].solvedOn; }).length; },
    xp: function () { return totalXp(load()); },
    /* every challenge solved on a perfect streak, lucky days doubled */
    maxXp: function () {
      var t = 0;
      for (var w = 1; w <= 8; w++) for (var d = 1; d <= 5; d++) {
        t += XP_STEPS[Math.min((w - 1) * 5 + d, XP_STEPS.length) - 1] * (isLucky('w0' + w + 'd' + d) ? 2 : 1);
      }
      return t;
    },
    fullWeeks: function () {
      var s = load(), weeks = [];
      for (var w = 1; w <= 8; w++) {
        var all = true;
        for (var d = 1; d <= 5; d++) { var c = s.challenges['w0' + w + 'd' + d]; if (!c || !c.solvedOn) { all = false; break; } }
        if (all) weeks.push(w);
      }
      return weeks;
    }
  };

  function mount(pre) {
    var src = pre.querySelector('code') || pre, ch;
    try { ch = JSON.parse(src.textContent); }
    catch (e) { pre.insertAdjacentHTML('beforebegin', '<p class="quiz-error">' + T('This challenge could not be read', 'Не удалось прочитать задачу') + ' (' + esc(e.message) + ').</p>'); return; }
    var box = document.createElement('div');
    box.className = 'chal al-block';
    pre.parentNode.replaceChild(box, pre);
    draw(box, ch);
  }
  /* "sql": true / "python": true — an editor on her practice copy between the question and the answer row
     (sqlrun.js → ALSql.editor, pyrun.js → ALPy.editor; nothing when that engine is not on the page). Her text is kept
     under the id "chal-<id>", so it is still there after she solves it. */
  function editorFor(box, ch) {
    var slot = box.querySelector('.chal-ed');
    if (!slot) return;
    var opt = { id: 'chal-' + ch.id, run: 'play' };
    try {
      if (ch.sql && window.ALSql) window.ALSql.editor(slot, opt);
      else if (ch.python && window.ALPy && window.ALPy.editor) window.ALPy.editor(slot, opt);
    } catch (e) { console.error('challenge editor', e); }
    if (!slot.firstChild) slot.remove();
  }
  function finished(box, rec) {
    var was = box.classList.contains('al-done'), now = !!(rec && (rec.solvedOn || rec.gaveUp));
    box.classList.toggle('al-done', now);
    if (was !== now && box.dataset.drawn) document.dispatchEvent(new CustomEvent('al:change'));
    box.dataset.drawn = '1';
  }

  function draw(box, ch) {
    var st0 = load(), rec = st0.challenges[ch.id], lucky = isLucky(ch.id);
    if (lucky && !st0.lucky[ch.id]) { st0.lucky[ch.id] = dayKey(new Date()); save(st0); }
    var html = (lucky ? '<div class="chal-lucky"><svg class="al-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"/>' +
        '<path d="M5 12v9h14v-9M12 8v13"/><path d="M12 8C10 4 6 4 6 6.5S12 8 12 8s6 1 6-1.5S14 4 12 8"/></svg>' +
        '<span>' + T('<b>Lucky day!</b> You found this week\'s surprise: today\'s challenge pays <b>double XP</b>.',
          '<b>Счастливый день!</b> Вы нашли сюрприз этой недели: сегодняшняя задача приносит <b>двойной XP</b>.') + '</span></div>' : '') +
      '<div class="chal-head"><span class="chal-title">' + T('Daily challenge', 'Задача дня') + '</span>' +
      '<span class="chal-rule">' + T('10–15 min · bonus XP that grows with your challenge streak', '10–15 мин · бонусный XP, который растёт вместе с серией решённых задач') + '</span></div>' +
      '<div class="chal-q">' + esc(ch.q) + '</div>' + (ch.code ? '<pre class="quiz-code"><code>' + esc(ch.code) + '</code></pre>' : '') +
      (ch.sql || ch.python ? '<div class="chal-ed"></div>' : '');
    finished(box, rec);
    if (rec && (rec.solvedOn || rec.gaveUp)) {
      html += '<div class="chal-result ' + (rec.solvedOn ? 'pass' : 'fail') + '">' +
        (rec.solvedOn ? '<b>' + T('Solved on ' + esc(rec.solvedOn) + ' — +' + rec.xp + ' XP' + (lucky ? ' (lucky day, doubled)' : ''),
            'Решено ' + esc(rec.solvedOn) + ' — +' + rec.xp + ' XP' + (lucky ? ' (счастливый день, вдвойне)' : '')) + '.</b>'
          : T('<b>You opened the solution</b> — no XP for this one; tomorrow\'s counts.', '<b>Вы открыли решение</b> — за эту задачу XP нет; завтрашняя засчитается.')) + '</div>' +
        '<details class="chal-sol" open><summary>' + T('Solution', 'Решение') + '</summary><div>' + esc(fromB64(ch.sol)).replace(/\n/g, '<br>') + '</div></details>';
      box.innerHTML = html;
      editorFor(box, ch);
      return;
    }
    html += '<div class="chal-row"><input class="quiz-input chal-input" type="text" placeholder="' + (ch.type === 'number' ? T('a number', 'число') : T('your answer', 'ваш ответ')) + '" autocomplete="off">' +
      '<button type="button" class="chal-go">' + T('Check', 'Проверить') + '</button></div>' +
      '<div class="chal-msg" hidden></div>' +
      '<div class="chal-links"><a href="javascript:void(0)" class="chal-hint">' + T('Hint', 'Подсказка') + '</a> · <a href="javascript:void(0)" class="chal-giveup">' +
      T('Give up and see the solution', 'Сдаться и посмотреть решение') + '</a></div>' +
      '<div class="chal-hinttext" hidden>' + esc(ch.hint || T('No hint for this one.', 'К этой задаче подсказки нет.')) + '</div>';
    box.innerHTML = html;
    editorFor(box, ch);

    var input = box.querySelector('.chal-input'), msg = box.querySelector('.chal-msg');
    function check() {
      var c = canon(input.value, ch.type, ch.dp);
      if (c === null) { msg.hidden = false; msg.className = 'chal-msg fail'; msg.textContent = T('Type a number.', 'Введите число.'); return; }
      if (!window.crypto || !crypto.subtle) {
        msg.hidden = false; msg.className = 'chal-msg fail';
        msg.textContent = T('This browser cannot check answers here; open the course through its web address.', 'Этот браузер не может проверить ответ здесь; откройте курс по его веб-адресу.');
        return;
      }
      sha(SALT + c).then(function (hx) {
        var s = load(), r = s.challenges[ch.id] || { tries: 0 };
        r.tries = (r.tries || 0) + 1;
        if (ch.h.indexOf(hx) >= 0) {
          var today = dayKey(new Date());
          r.solvedOn = today;
          s.challenges[ch.id] = r;
          var st = streakEndingAt(s);
          r.xp = (XP_STEPS[Math.min(st, XP_STEPS.length) - 1] || 2) * (lucky ? 2 : 1);
          r.streakAtSolve = st;
          s.challenges[ch.id] = r;
          save(s);
          draw(box, ch);
          var res = box.querySelector('.chal-result');
          if (res) res.innerHTML += T(' Challenge streak: ' + st + ' day' + (st === 1 ? '' : 's') + '.', ' Серия задач: ' + st + ' ' + plural(st, 'день', 'дня', 'дней') + '.');
          if (window.ALBoard) window.ALBoard.render(true);
        } else {
          s.challenges[ch.id] = r;
          save(s);
          msg.hidden = false;
          msg.className = 'chal-msg fail';
          msg.textContent = T('Not yet (' + r.tries + ' tr' + (r.tries === 1 ? 'y' : 'ies') + '). Check your filter and your rounding, then try again.',
            'Пока нет (' + r.tries + ' ' + plural(r.tries, 'попытка', 'попытки', 'попыток') + '). Проверьте фильтр и округление и попробуйте снова.');
        }
      });
    }
    box.querySelector('.chal-go').addEventListener('click', check);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
    box.querySelector('.chal-hint').addEventListener('click', function () { box.querySelector('.chal-hinttext').hidden = false; });
    box.querySelector('.chal-giveup').addEventListener('click', function () {
      if (!confirm(T('See the solution? This challenge will give no XP, and your challenge streak continues only with tomorrow\'s.',
        'Показать решение? Эта задача не даст XP, а серия задач продолжится только с завтрашней.'))) return;
      var s = load(), r = s.challenges[ch.id] || {};
      r.gaveUp = dayKey(new Date());
      s.challenges[ch.id] = r;
      save(s);
      draw(box, ch);
    });
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(function () {
      Array.prototype.forEach.call(document.querySelectorAll('.markdown-section pre[data-lang="challenge"]'), mount);
    });
  });
})();
