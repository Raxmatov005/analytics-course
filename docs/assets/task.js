/* The universal answer box for the Analytics Learning site (Docsify plugin).

A task is written in a page as a fenced block with the language "task" holding JSON; the paragraph right above it is
the question ("**P3.** Which pairs of tables…"). The engine frames that paragraph and the block as one card, named by
the paragraph's leading code (P3, T4, S2…) or, without one, by its number on the page.

  {"id": "w01d1-p1", "kind": "choice", "options": ["…"], "answer": 1, "explain": "…"}
  {"id": "w01d1-p2", "kind": "multi",  "options": ["…"], "answer": [0, 2], "explain": "…"}
  {"id": "w01d1-p3", "kind": "number", "answer": 7828, "dp": 0, "unit": "loans", "hint": "…", "model": "…"}
  {"id": "w01d1-p4", "kind": "text",   "answer": ["foreign key", "fk"], "model": "…"}
  {"id": "w01d1-p5", "kind": "free",   "min": 20, "model": "…", "rubric": ["names the table", "says why"]}
  {"id": "w02d1-p6", "kind": "sql",    "model": "SELECT …", "note": "…"}
  {"id": "w05d2-p1", "kind": "python", "starter": "import pandas as pd\n…", "answer": 61.4, "dp": 1, "model": "…"}

- choice / multi: she picks, taps Check, sees ✓ or ✕ with the explanation.
- number / text: a miss first says "not yet" (with the hint) and lets her try again or open the answer.
  Numbers are compared after rounding to "dp" places; "7 828", "61,4" and "61.4%" are all read.
- free: she writes (a word counter shows the minimum), taps Compare, sees her answer next to the model and ticks the
  rubric, then grades herself: Got it / Partly / Missed.
- sql: an editor on her practice copy (ALSql.editor, sqlrun.js); Check compares results with the model (ALSql.compare).
- python: an editor (ALPy.editor, pyrun.js); Check runs her code and looks for "answer" among the numbers it printed.

Every card is an "al-block" and becomes "al-done" once answered (sections.js counts them; see the contract there).
Results are kept in this browser (localStorage "al.tasks" → {id: {done, ok, value, at}}), one key for a page and its
Russian copy, since the ids are the same. window.ALTasks = {state(), doneCount(), okCount()} for the progress board.
Wrong attempts (2026-10-30, for the mistakes page, mistakes.js): each one adds 1 to the record's "miss" and sets
"missAt" (ms) — a wrong choice, a "not yet" on a number or text, a self-grade other than Got it, a failed code check.
A record with only a miss has done: false, so nothing counts it as answered. */
(function () {
  var KEY = 'al.tasks';
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private window: nothing to do */ } }
  function get(id) { return load()[id] || null; }
  function put(id, rec) {
    var s = load();
    rec.at = new Date().toISOString();
    if (s[id] && s[id].miss) { rec.miss = s[id].miss; rec.missAt = s[id].missAt; }   // the wrong attempts stay counted
    s[id] = rec;
    save(s);
  }
  function missed(id) {
    var s = load(), r = s[id] || { done: false, ok: false };
    r.miss = (r.miss || 0) + 1;
    r.missAt = Date.now();
    s[id] = r;
    save(s);
  }
  function T(en, ru) { return window.ALLang ? window.ALLang.t(en, ru) : en; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  /* the little Markdown a task's strings use: `code`, **bold**, line breaks */
  function fmt(s) {
    return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
  }
  function changed() { document.dispatchEvent(new CustomEvent('al:change')); }
  function plural(n, one, few, many) {
    var a = Math.abs(n) % 100, b = a % 10;
    return a > 10 && a < 20 ? many : b === 1 ? one : b > 1 && b < 5 ? few : many;
  }
  var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';   // a sort of the 11 tables needs more than ten

  window.ALTasks = {
    state: load,
    doneCount: function () { var s = load(); return Object.keys(s).filter(function (k) { return s[k] && s[k].done; }).length; },
    okCount: function () { var s = load(); return Object.keys(s).filter(function (k) { return s[k] && s[k].ok; }).length; }
  };

  /* ---------- reading answers ---------- */
  /* "7 828", "7,828", "61,4", "61.4 %" → a number; a lone comma with other than three digits after it is a decimal comma */
  function parseNum(v) {
    var t = String(v).replace(/[\s  ']/g, '').replace(/%$/, '').replace(/^[^\d.,+-]+|[^\d.,]+$/g, '');
    if (t.indexOf(',') >= 0) {
      if (t.indexOf('.') < 0 && /^[+-]?\d+,\d+$/.test(t) && (!/,\d{3}$/.test(t) || /^[+-]?0,/.test(t))) t = t.replace(',', '.');
      else t = t.replace(/,/g, '');
    }
    return t === '' || isNaN(Number(t)) ? NaN : Number(t);
  }
  function roundTo(x, dp) { var f = Math.pow(10, dp); return Math.round(x * f) / f; }
  function numberRight(task, v) {
    var n = parseNum(v), dp = task.dp == null ? 2 : task.dp;
    return !isNaN(n) && roundTo(n, dp) === roundTo(Number(task.answer), dp);
  }
  function normText(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/["'`«»“”‘’„]/g, '').replace(/[\s ]+/g, ' ').replace(/[.;!]+$/, '').trim();
  }
  function textRight(task, v) {
    var list = Array.isArray(task.answer) ? task.answer : [task.answer];
    return list.some(function (a) { return normText(a) === normText(v); });
  }
  function textAnswer(task) {
    if (!Array.isArray(task.answer)) return String(task.answer);
    var ru = window.ALLang && window.ALLang.isRu() ? task.answer.filter(function (a) { return /[а-яё]/i.test(a); })[0] : null;
    return ru || task.answer[0];
  }
  function sameSet(a, b) {
    a = (a || []).slice().sort(); b = (b || []).slice().sort();
    return a.length === b.length && a.every(function (x, i) { return x === b[i]; });
  }
  function words(s) { var m = String(s || '').trim().match(/\S+/g); return m ? m.length : 0; }

  function kindLabel(k) {
    return {
      choice: T('Choose one', 'Выберите один ответ'), multi: T('Choose all that apply', 'Отметьте все верные'),
      number: T('Type a number', 'Введите число'), text: T('Type a word or phrase', 'Введите слово или фразу'),
      free: T('In your own words', 'Своими словами'), sql: T('Write a query', 'Напишите запрос'), python: T('Write Python', 'Напишите код на Python')
    }[k] || '';
  }

  /* ---------- the question: the paragraph(s) right above the block ---------- */
  var CODE = /^([A-ZА-Я]{1,3}\s?\d+[a-z]?)[.:)]?$/;
  function isBoundary(el) {
    return /^(H1|H2|H3|H4|HR|PRE|DETAILS|TABLE)$/.test(el.tagName) || el.classList.contains('tk') || el.classList.contains('al-q') ||
      el.classList.contains('qz') || el.classList.contains('sq-box') || el.classList.contains('gx');
  }
  /* the code is one of the first bold words of the paragraph ("**P3.** …", or "🚀 **Stretch.** **P9.** …" in a callout) */
  function leadCode(el) {
    var p = el.tagName === 'P' ? el : el.tagName === 'BLOCKQUOTE' ? el.querySelector('p') : null;
    if (!p) return null;
    var st = Array.prototype.slice.call(p.querySelectorAll('strong'), 0, 3);
    for (var i = 0; i < st.length; i++) {
      var m = CODE.exec(st[i].textContent.trim());
      if (m) return { el: st[i], code: m[1].replace(/\s/g, '') };
    }
    return null;
  }
  function question(pre) {
    var cands = [], el = pre.previousElementSibling;
    while (el && cands.length < 4 && !isBoundary(el)) { cands.push(el); el = el.previousElementSibling; }
    for (var i = 0; i < cands.length; i++) {
      var lc = leadCode(cands[i]);
      if (lc) return { els: cands.slice(0, i + 1).reverse(), code: lc.code, strong: lc.el };
    }
    if (cands[0] && /^(P|BLOCKQUOTE)$/.test(cands[0].tagName)) return { els: [cands[0]] };
    if (cands[0] && /^(UL|OL)$/.test(cands[0].tagName) && cands[1] && cands[1].tagName === 'P') return { els: [cands[1], cands[0]] };
    return { els: [] };
  }

  /* ---------- one card ---------- */
  var counter = 0;
  function mount(pre) {
    var task;
    try { task = JSON.parse((pre.querySelector('code') || pre).textContent); }
    catch (e) {
      pre.insertAdjacentHTML('beforebegin', '<p class="quiz-error">' + T('This task could not be read', 'Не удалось прочитать задание') + ' (' + esc(e.message) + ').</p>');
      return;
    }
    counter++;
    var q = question(pre), code = q.code || String(counter);
    if (!task.id) task.id = (location.hash.replace(/\?.*$/, '').replace(/^#\/(ru\/)?/, '') || 'page') + '-' + code;
    var card = document.createElement('div');
    card.className = 'tk al-block tk-' + task.kind;
    card.setAttribute('data-id', task.id);
    card.innerHTML = '<div class="tk-head"><span class="tk-code">' + esc(code) + '</span><span class="tk-kind">' + kindLabel(task.kind) + '</span>' +
      '<span class="tk-state"></span></div><div class="tk-q"></div><div class="tk-body"></div>';
    pre.parentNode.insertBefore(card, q.els[0] || pre);
    var qbox = card.querySelector('.tk-q');
    q.els.forEach(function (x) { qbox.appendChild(x); });
    if (q.strong) {
      var nx = q.strong.nextSibling;
      if (nx && nx.nodeType === 3) nx.nodeValue = nx.nodeValue.replace(/^\s+/, '');
      q.strong.parentNode.removeChild(q.strong);
    }
    if (!q.els.length) qbox.parentNode.removeChild(qbox);
    pre.parentNode.removeChild(pre);
    var body = card.querySelector('.tk-body');
    var draw = { choice: choice, multi: choice, number: typed, text: typed, free: free, sql: code_, python: code_ }[task.kind];
    if (!draw) { body.innerHTML = '<p class="quiz-error">' + T('Unknown task kind: ', 'Неизвестный вид задания: ') + esc(task.kind) + '</p>'; return; }
    draw(card, body, task);
  }

  /* the card's state chip and classes */
  function mark(card, rec, word) {
    var st = card.querySelector('.tk-state');
    card.classList.toggle('al-done', !!(rec && rec.done));
    card.classList.toggle('tk-ok', !!(rec && rec.done && rec.ok));
    card.classList.toggle('tk-miss', !!(rec && rec.done && !rec.ok));
    st.textContent = !rec || !rec.done ? '' : word || (rec.ok ? T('✓ Correct', '✓ Верно') : T('Answered', 'Отвечено'));
  }
  function feedback(ok, html) {
    return '<div class="tk-fb ' + (ok ? 'ok' : 'bad') + '"><div class="tk-fb-h">' + (ok ? T('✓ Right', '✓ Верно') : T('✕ Not quite', '✕ Не совсем')) + '</div>' + html + '</div>';
  }
  function modelHtml(task, title) {
    return task.model ? '<div class="tk-model"><div class="tk-k">' + (title || T('Model answer', 'Образцовый ответ')) + '</div><div class="tk-model-t">' + fmt(task.model) + '</div></div>' : '';
  }
  function explainHtml(task) { return task.explain ? '<div class="tk-why">' + fmt(task.explain) + '</div>' : ''; }

  /* ----- choice and multi ----- */
  function choice(card, body, task) {
    var multi = task.kind === 'multi', want = multi ? task.answer : [task.answer];
    function render(rec) {
      var picked = rec ? (multi ? rec.value || [] : [rec.value]) : [], shown = !!(rec && rec.done);
      body.innerHTML = '<div class="tk-opts" role="' + (multi ? 'group' : 'radiogroup') + '">' + task.options.map(function (o, k) {
        var on = picked.indexOf(k) >= 0, cls = 'tk-opt' + (on ? ' on' : '');
        if (shown && want.indexOf(k) >= 0) cls += ' right';
        else if (shown && on) cls += ' wrong';
        return '<button type="button" class="' + cls + '" data-k="' + k + '" role="' + (multi ? 'checkbox' : 'radio') + '" aria-checked="' + on + '"' + (shown ? ' disabled' : '') + '>' +
          '<span class="tk-letter">' + LETTERS[k] + '</span><span class="tk-otext">' + fmt(o) + '</span></button>';
      }).join('') + '</div>' +
        (shown ? feedback(rec.ok, (rec.ok ? '' : '<div>' + T('The answer: ', 'Ответ: ') + want.map(function (k) { return '<b>' + LETTERS[k] + '</b>'; }).join(', ') + '</div>') +
          explainHtml(task) + modelHtml(task)) : '') +
        '<div class="tk-bar">' + (shown ? '<button type="button" class="tk-btn tk-ghost tk-again">' + T('Try again', 'Попробовать снова') + '</button>'
          : '<button type="button" class="tk-btn tk-check" disabled>' + T('Check', 'Проверить') + '</button>' +
            (multi ? '<span class="tk-tip">' + T('More than one can be right.', 'Верных может быть несколько.') + '</span>' : '')) + '</div>';
      mark(card, rec);
      var sel = picked.slice(), chk = body.querySelector('.tk-check');
      Array.prototype.forEach.call(body.querySelectorAll('.tk-opt'), function (b) {
        b.onclick = function () {
          var k = Number(b.getAttribute('data-k')), i = sel.indexOf(k);
          if (multi) { if (i >= 0) sel.splice(i, 1); else sel.push(k); } else sel = [k];
          Array.prototype.forEach.call(body.querySelectorAll('.tk-opt'), function (x) {
            var on = sel.indexOf(Number(x.getAttribute('data-k'))) >= 0;
            x.classList.toggle('on', on); x.setAttribute('aria-checked', on);
          });
          chk.disabled = !sel.length;
        };
      });
      if (chk) chk.onclick = function () {
        if (!sel.length) return;
        var r = { done: true, ok: sameSet(sel, want), value: multi ? sel.slice().sort() : sel[0] };
        put(task.id, r); if (!r.ok) missed(task.id); render(r); changed();
      };
      var again = body.querySelector('.tk-again');
      if (again) again.onclick = function () { render(null); mark(card, get(task.id)); };   // the card stays done until she answers again
    }
    render(get(task.id));
  }

  /* ----- number and text: a miss says "not yet" first ----- */
  function typed(card, body, task) {
    var num = task.kind === 'number';
    function rightText() { return num ? String(task.answer) + (task.unit ? ' ' + task.unit : '') : textAnswer(task); }
    function render(rec, miss) {
      var shown = !!(rec && rec.done), v = rec ? rec.value || '' : miss || '';
      body.innerHTML = '<div class="tk-row"><input class="tk-input' + (num ? ' tk-num' : '') + '" type="text" autocomplete="off" spellcheck="false" inputmode="' + (num ? 'decimal' : 'text') + '"' +
        ' placeholder="' + (num ? T('Your number', 'Ваше число') : T('Your answer', 'Ваш ответ')) + '" value="' + esc(v) + '"' + (shown ? ' disabled' : '') + '>' +
        (num && task.unit ? '<span class="tk-unit">' + esc(task.unit) + '</span>' : '') + '</div>' +
        (shown ? feedback(rec.ok, (rec.ok ? '' : '<div>' + T('The answer: ', 'Ответ: ') + '<b>' + esc(rightText()) + '</b></div>') + explainHtml(task) + modelHtml(task)) : '') +
        (!shown && miss != null ? '<div class="tk-fb try"><div class="tk-fb-h">' + T('Not yet — have another go.', 'Пока нет — попробуйте ещё раз.') + '</div>' +
          (task.hint ? '<div class="tk-why">' + fmt(task.hint) + '</div>' : '') + '</div>' : '') +
        '<div class="tk-bar">' + (shown ? '<button type="button" class="tk-btn tk-ghost tk-again">' + T('Try again', 'Попробовать снова') + '</button>'
          : '<button type="button" class="tk-btn tk-check">' + T('Check', 'Проверить') + '</button>' +
            (task.hint && miss == null ? '<button type="button" class="tk-link tk-hint">' + T('Hint', 'Подсказка') + '</button>' : '') +
            (miss != null ? '<button type="button" class="tk-link tk-show">' + T('Show the answer', 'Показать ответ') + '</button>' : '')) + '</div>' +
        '<div class="tk-hinttext" hidden>' + fmt(task.hint || '') + '</div>';
      mark(card, rec && rec.done ? rec : get(task.id));
      var inp = body.querySelector('.tk-input');
      function check() {
        var val = inp.value.trim();
        if (!val) { inp.focus(); return; }
        if (num && isNaN(parseNum(val))) { msg(T('Type a number, like 7828 or 61.4.', 'Введите число, например 7828 или 61,4.')); return; }
        var ok = num ? numberRight(task, val) : textRight(task, val);
        if (ok) {
          var r = { done: true, ok: ok, value: val };
          put(task.id, r); render(r); changed();
        } else { missed(task.id); render(null, val); }
      }
      function msg(t) {
        var b = body.querySelector('.tk-say');
        if (!b) { b = document.createElement('div'); b.className = 'tk-say'; body.querySelector('.tk-bar').appendChild(b); }
        b.textContent = t;
      }
      var c = body.querySelector('.tk-check');
      if (c) c.onclick = check;
      if (!shown) inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
      var h = body.querySelector('.tk-hint');
      if (h) h.onclick = function () { body.querySelector('.tk-hinttext').hidden = false; h.hidden = true; };
      var sh = body.querySelector('.tk-show');
      if (sh) sh.onclick = function () {
        var r = { done: true, ok: false, value: inp.value.trim() };
        put(task.id, r); render(r); changed();
      };
      var again = body.querySelector('.tk-again');
      if (again) again.onclick = function () { render(null); body.querySelector('.tk-input').focus(); };
      if (miss != null) inp.focus();
    }
    render(get(task.id));
  }

  /* ----- free: write, compare with the model, tick the rubric, grade yourself ----- */
  function free(card, body, task) {
    var min = task.min || 1, rubric = task.rubric || [];
    var GRADES = [['got', T('Got it', 'Всё верно')], ['part', T('Partly', 'Частично')], ['miss', T('Missed', 'Не получилось')]];
    function gradeWord(g) { for (var i = 0; i < GRADES.length; i++) if (GRADES[i][0] === g) return GRADES[i][1]; return ''; }
    function draft(text) { var r = get(task.id) || {}; if (r.done) return; put(task.id, { done: false, ok: false, value: { text: text } }); }
    function write(text) {
      body.innerHTML = '<textarea class="tk-area" rows="4" placeholder="' + T('Write your answer here…', 'Напишите ответ здесь…') + '">' + esc(text || '') + '</textarea>' +
        '<div class="tk-bar"><button type="button" class="tk-btn tk-compare">' + T('Compare', 'Сравнить') + '</button><span class="tk-count"></span></div>';
      var ta = body.querySelector('.tk-area'), cnt = body.querySelector('.tk-count'), btn = body.querySelector('.tk-compare');
      function upd() {
        var n = words(ta.value);
        cnt.textContent = T(n + ' / ' + min + ' words', n + ' / ' + min + ' ' + plural(min, 'слово', 'слова', 'слов'));
        cnt.classList.toggle('ok', n >= min);
        btn.disabled = n < min;
        btn.title = n < min ? T('Write at least ' + min + ' words first', 'Сначала напишите хотя бы ' + min + ' ' + plural(min, 'слово', 'слова', 'слов')) : '';
        ta.style.height = 'auto'; ta.style.height = Math.max(ta.scrollHeight + 2, 96) + 'px';
      }
      ta.addEventListener('input', function () { upd(); draft(ta.value); });
      btn.onclick = function () {
        if (words(ta.value) < min) return;
        var was = get(task.id), v = was && was.done && was.value || {};
        compare(ta.value, null, v.ticks || []);
      };
      upd();
      var rec = get(task.id);   // editing after a grade: the card stays done until she grades again
      mark(card, rec, rec && rec.done && rec.value ? gradeWord(rec.value.grade) : '');
    }
    function compare(text, grade, ticks) {
      body.innerHTML = '<div class="tk-side"><div class="tk-mine"><div class="tk-k">' + T('Your answer', 'Ваш ответ') + '</div><div class="tk-model-t">' + fmt(text) + '</div></div>' +
        '<div class="tk-model"><div class="tk-k">' + T('Model answer', 'Образцовый ответ') + '</div><div class="tk-model-t">' + fmt(task.model || '—') + '</div></div></div>' +
        (rubric.length ? '<div class="tk-rubric"><div class="tk-k">' + T('Tick what your answer covers', 'Отметьте, что есть в вашем ответе') + '</div>' +
          rubric.map(function (r, i) {
            return '<label class="tk-tick"><input type="checkbox" data-i="' + i + '"' + (ticks.indexOf(i) >= 0 ? ' checked' : '') + '><span>' + fmt(r) + '</span></label>';
          }).join('') + '</div>' : '') +
        '<div class="tk-grade"><div class="tk-k">' + T('How did you do?', 'Как получилось?') + '</div><div class="tk-grades">' +
          GRADES.map(function (g) { return '<button type="button" class="tk-gr tk-gr-' + g[0] + (grade === g[0] ? ' on' : '') + '" data-g="' + g[0] + '">' + g[1] + '</button>'; }).join('') +
        '</div></div><div class="tk-bar"><button type="button" class="tk-link tk-edit">' + T('Edit my answer', 'Изменить ответ') + '</button>' +
        (grade ? '<span class="tk-say">' + T('Saved on this device.', 'Сохранено на этом устройстве.') + '</span>' : '') + '</div>';
      function tickList() { return Array.prototype.filter.call(body.querySelectorAll('.tk-tick input'), function (x) { return x.checked; }).map(function (x) { return Number(x.getAttribute('data-i')); }); }
      /* the rubric suggests a grade: all ticked → Got it, some → Partly, none → Missed; she has the last word */
      Array.prototype.forEach.call(body.querySelectorAll('.tk-tick input'), function (x) {
        x.onchange = function () {
          var t = tickList(), g = t.length === rubric.length ? 'got' : t.length ? 'part' : 'miss';
          Array.prototype.forEach.call(body.querySelectorAll('.tk-gr'), function (b) { b.classList.toggle('hint', b.getAttribute('data-g') === g); });
          if (grade) { put(task.id, { done: true, ok: grade === 'got', value: { text: text, grade: grade, ticks: t } }); }
        };
      });
      Array.prototype.forEach.call(body.querySelectorAll('.tk-gr'), function (b) {
        b.onclick = function () {
          var g = b.getAttribute('data-g'), r = { done: true, ok: g === 'got', value: { text: text, grade: g, ticks: tickList() } };
          put(task.id, r); if (g !== 'got') missed(task.id); compare(text, g, r.value.ticks); changed();
        };
      });
      body.querySelector('.tk-edit').onclick = function () { write(text); };
      var was = get(task.id);
      mark(card, grade ? { done: true, ok: grade === 'got' } : was, grade ? gradeWord(grade) : was && was.done && was.value ? gradeWord(was.value.grade) : '');
    }
    var rec = get(task.id), v = rec && rec.value || {};
    if (rec && rec.done && v.grade) compare(v.text || '', v.grade, v.ticks || []);
    else write(v.text || '');
  }

  /* ----- sql and python: the editor comes from sqlrun.js / pyrun.js; this card adds Check and the model answer ----- */
  function code_(card, body, task) {
    var py = task.kind === 'python', api = py ? window.ALPy : window.ALSql;
    if (task.note) body.insertAdjacentHTML('beforeend', '<div class="tk-note">' + fmt(task.note) + '</div>');
    if (!api || typeof api.editor !== 'function') {
      body.insertAdjacentHTML('beforeend', '<div class="tk-off">' + (py ? T('Python engine not loaded — reload the page to try again.', 'Python не загрузился — обновите страницу и попробуйте снова.')
        : T('SQL engine not loaded — reload the page to try again.', 'SQL не загрузился — обновите страницу и попробуйте снова.')) + '</div>');
      return;
    }
    var slot = document.createElement('div');
    slot.className = 'tk-editor';
    body.appendChild(slot);
    var ed;
    try { ed = py ? api.editor(slot, { id: task.id, starter: task.starter || '' }) : api.editor(slot, { id: task.id, run: 'play' }); }
    catch (e) { console.error('task editor failed', e); }
    if (!ed) { slot.innerHTML = '<div class="tk-off">' + T('The editor could not start here.', 'Редактор здесь не запустился.') + '</div>'; return; }
    var bar = document.createElement('div');
    bar.className = 'tk-bar';
    var hasRun = !!slot.querySelector('button');   // the engine's editor usually brings its own ▶ Run
    bar.innerHTML = (hasRun ? '' : '<button type="button" class="tk-btn tk-ghost tk-run">' + T('▶ Run', '▶ Выполнить') + '</button>') +
      '<button type="button" class="tk-btn tk-check">' + T('✔ Check', '✔ Проверить') + '</button><span class="tk-say"></span>';
    body.appendChild(bar);
    var out = document.createElement('div');
    out.className = 'tk-after';
    body.appendChild(out);
    var say = bar.querySelector('.tk-say');
    var run = bar.querySelector('.tk-run');
    if (run) run.onclick = function () { try { ed.run(); } catch (e) { console.error(e); } };
    function done(ok, value) {
      var prev = get(task.id);
      if (prev && prev.done && prev.ok && !ok) return;   // a later miss never takes back a check she passed
      put(task.id, { done: true, ok: ok, value: value }); if (!ok) missed(task.id); mark(card, get(task.id)); changed();
    }
    function offerModel() {
      if (!task.model || out.querySelector('.tk-show')) return;
      out.innerHTML = '<button type="button" class="tk-link tk-show">' + T('Show the model answer', 'Показать образцовый ответ') + '</button>';
      out.querySelector('.tk-show').onclick = function () {
        out.innerHTML = '<div class="tk-model"><div class="tk-k">' + T('Model answer', 'Образцовый ответ') + '</div><pre class="tk-code"><code>' + esc(task.model) + '</code></pre></div>';
        done(false, mine());
      };
    }
    function mine() { try { return String(ed.get() || ''); } catch (e) { return ''; } }
    function verdict(ok, text) {
      say.textContent = text;
      say.className = 'tk-say ' + (ok ? 'ok' : 'bad');
      if (ok) done(true, mine()); else offerModel();
    }
    bar.querySelector('.tk-check').onclick = function () {
      if (!mine().trim()) { verdict(false, py ? T('Write some code first.', 'Сначала напишите код.') : T('Write a query first.', 'Сначала напишите запрос.')); return; }
      say.className = 'tk-say'; say.textContent = T('Checking…', 'Проверяем…');
      if (!py) {
        if (typeof api.compare !== 'function') { say.textContent = T('Checking is not available yet.', 'Проверка пока недоступна.'); return; }
        Promise.resolve(api.compare(mine(), task.model || '')).then(function (r) {
          if (r && r.html && ed.out) ed.out.innerHTML = r.html;   // her result under her query, as after ▶ Run
          verdict(!!(r && r.ok), (r && r.msg) || (r && r.ok ? T('✅ Same result as the model answer.', '✅ Результат совпадает с образцом.') : T('❌ Not yet.', '❌ Пока нет.')));
        }).catch(function (e) { console.error('task check failed', e); say.textContent = T('Could not check right now — try again.', 'Сейчас проверить не получилось — попробуйте снова.'); });
        return;
      }
      Promise.resolve(ed.run()).then(function (r) {
        r = r || {};
        if (r.error) { verdict(false, T('The code stopped with an error — see the output.', 'Код остановился с ошибкой — смотрите вывод.')); return; }
        var dp = task.dp == null ? 2 : task.dp, tol = Math.pow(10, -dp) / 2 + 1e-9, want = Number(task.answer);
        var hit = (r.numbers || []).some(function (n) {
          n = Number(n);
          return Math.abs(n - want) <= tol || Math.abs(n * 100 - want) <= tol || Math.abs(n / 100 - want) <= tol;
        });
        verdict(hit, hit ? T('✅ Your output has the right number.', '✅ В вашем выводе есть верное число.')
          : T('❌ The number we are looking for is not in your output yet. Print it.', '❌ Нужного числа в выводе пока нет. Выведите его через print.'));
      }).catch(function (e) { console.error('task run failed', e); say.textContent = T('Could not run right now — try again.', 'Сейчас запустить не получилось — попробуйте снова.'); });
    };
    var rec = get(task.id);
    mark(card, rec);
    if (rec && rec.done && !rec.ok) offerModel();
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(function () {
      counter = 0;
      Array.prototype.forEach.call(document.querySelectorAll('.markdown-section pre[data-lang="task"]'), mount);
      changed();
    });
  });
})();
