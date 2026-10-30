/* Day quizzes, day completion and the local streak for the Analytics Learning site (Docsify plugin).

A quiz is written in a day page as a fenced block with the language "quiz" holding JSON:

  {"id": "w01d2", "pass": 0.8, "questions": [
    {"q": "Question text (Markdown-free)", "code": "optional SQL or Python shown under the question",
     "type": "single", "options": ["A", "B", "C"], "answer": 1, "explain": "why"},
    {"type": "multi",  "options": [...], "answer": [0, 2]},
    {"type": "number", "answer": 7828, "tol": 0},
    {"type": "text",   "answer": ["having", "HAVING clause"]}
  ]}

Results are kept in this browser only (localStorage, key "al.v1"). Everything works without it.

A Self-check is a ```check block with the same question objects ({"id": "w01d1-sc", "questions": [...]}): a compact
"Quick check", one question at a time with instant feedback and no pass mark; its score goes to al.v1 → checks[id].
Both are "al-block"s for the section frames (sections.js): a quiz is "al-done" once passed, a check once finished.

Spaced review (2026-10-30): a day quiz from Week 2 on brings back up to 3 questions from earlier weeks' day quizzes
(review.json, written by scripts/build_bank.py; ru/review.json on a Russian page). First the ones she still has to fix
(at most 2, the oldest miss first), then the ones asked least recently, each from a different day. They come after the
day's own questions, marked "Review", and do not count toward the pass mark.

Misses (2026-10-30): every answer in a day quiz, a review question and a Self-check is noted in al.v1 → miss:
miss["<quiz or check id>#<question index>"] = {n: times wrong, last: ms of the last miss, fixedAt: ms of the last right
answer after a miss}; still to fix while fixedAt < last. A question with a "key" (the mistakes page, mistakes.js) is
noted under that key. Both are times, so sync.js's merge (a number keeps its larger value) stays right across devices.
*/
(function () {
  var KEY = 'al.v1';
  var TOTAL_DAYS = 46;   // 41 + Week 9 (credit risk), 2026-10-29

  /* games.js, explore.js and challenge.js share al.v1 and may write it first (a game won before any quiz), so the
     quizzes map is made sure of here: without it every day quiz and the menu ticks stopped drawing (found 2026-10-30) */
  function load() {
    var s;
    try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) { s = null; }
    if (!s || typeof s !== 'object') s = {};
    s.quizzes = s.quizzes || {};
    return s;
  }
  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private window: nothing to do */ }
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function norm(s) { return String(s).toLowerCase().replace(/[\s ]+/g, ' ').replace(/[.;]+$/, '').trim(); }
  function parseNum(s) {
    var t = String(s).replace(/[\s ']/g, '').replace(/%$/, '');
    if (t.indexOf(',') >= 0) {   // a decimal comma ("70,5") or thousands commas ("7,828"), as task.js reads them
      if (t.indexOf('.') < 0 && /^[+-]?\d+,\d+$/.test(t) && (!/,\d{3}$/.test(t) || /^[+-]?0,/.test(t))) t = t.replace(',', '.');
      else t = t.replace(/,/g, '');
    }
    return t === '' ? NaN : Number(t);
  }

  /* words in the page's language (lang.js); Russian counts take one of three forms: 1 день, 2 дня, 5 дней */
  function T(en, ru) { return window.ALLang ? window.ALLang.t(en, ru) : en; }
  function plural(n, one, few, many) {
    var a = Math.abs(n) % 100, b = a % 10;
    return a > 10 && a < 20 ? many : b === 1 ? one : b > 1 && b < 5 ? few : many;
  }

  /* ---------- misses (see the header) ---------- */
  function noteAnswer(s, key, ok) {
    s.miss = s.miss || {};
    var m = s.miss[key], now = Date.now();
    if (!ok) { m = m || { n: 0 }; m.n = (m.n || 0) + 1; m.last = now; s.miss[key] = m; }
    else if (m) m.fixedAt = now;
  }
  function stillWrong(m) { return !!(m && m.last && !(m.fixedAt > m.last)); }

  /* ---------- spaced review (see the header) ---------- */
  var banks = {};
  function bank() {
    var ru = !!(window.ALLang && window.ALLang.isRu()), k = ru ? 'ru' : 'en';
    if (!banks[k]) {
      banks[k] = fetch((ru ? 'ru/' : '') + 'review.json', { cache: 'no-cache' })
        .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    }
    return banks[k];
  }
  function weekOf(id) { var m = /^w(\d\d)d\d$/.exec(id || ''); return m ? Number(m[1]) : null; }
  function dayName(id) {
    var m = /^w(\d\d)d(\d)$/.exec(id);
    return m ? T('Week ' + Number(m[1]) + ' · Day ' + m[2], 'Неделя ' + Number(m[1]) + ' · День ' + m[2]) : id;
  }
  function pickReview(quizId, b, s, max) {
    var w = weekOf(quizId);
    if (w == null || w < 2 || !b || !b.days) return [];
    var pool = [], miss = s.miss || {}, rev = s.rev || {};
    Object.keys(b.days).forEach(function (d) {
      var dw = weekOf(d);
      if (dw == null || dw < 1 || dw >= w) return;
      (b.days[d].quiz || []).forEach(function (q, i) {
        var key = d + '#' + i;
        pool.push({ key: key, day: d, page: b.days[d].p, q: q, todo: stillWrong(miss[key]), last: (miss[key] || {}).last || 0, asked: rev[key] || 0, r: Math.random() });
      });
    });
    var out = [], used = {};
    function take(list, upto) { list.forEach(function (x) { if (out.length < upto && !used[x.day]) { out.push(x); used[x.day] = 1; } }); }
    take(pool.filter(function (x) { return x.todo; }).sort(function (a, c) { return a.last - c.last; }), Math.min(2, max));
    take(pool.filter(function (x) { return !x.todo; }).sort(function (a, c) { return a.asked - c.asked || a.r - c.r; }), max);
    return out;
  }

  /* the practice day's quiz (id "practice") trains the routine only: no streak, no finished day */
  function isPractice(id) { return id.indexOf('practice') === 0; }

  /* ---------- streak: consecutive study days; Saturdays and Sundays never break it ---------- */
  function streak(state) {
    var days = {};
    Object.keys(state.quizzes).forEach(function (id) {
      if (isPractice(id)) return;
      var r = state.quizzes[id];
      (r.passDays || (r.passedOn ? [r.passedOn] : [])).forEach(function (d) { days[d] = true; });
    });
    var d = new Date(), n = 0, first = true;
    for (var i = 0; i < 400; i++) {
      var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      var wd = d.getDay();
      if (days[key]) { n++; }
      else if (window.ALSched && window.ALSched.studyDay(key) !== null ? !window.ALSched.studyDay(key) : (wd === 0 || wd === 6)) { /* not a study day (schedule.js; without it the weekend): neutral */ }
      else if (first) { /* today not done yet: the streak is still alive */ }
      else { break; }
      first = false;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }
  window.ALQuiz = {
    state: load,
    streak: function () { return streak(load()); },
    doneCount: function () {
      var s = load();
      return Object.keys(s.quizzes).filter(function (id) { return !isPractice(id) && s.quizzes[id].passedOn; }).length;
    },
    TOTAL_DAYS: TOTAL_DAYS,
    miss: function () { return load().miss || {}; },
    stillWrong: stillWrong
  };

  /* ---------- rendering: one question at a time, then a results screen (Khan-style) ---------- */
  var LETTERS = 'ABCDEFGH';
  function questionHtml(q, i, qid, n) {
    var name = qid + '-q' + i;
    var h = '<div class="qz-q" data-i="' + i + '"><div class="qz-qnum">' + T('Question ' + (i + 1) + ' of ' + n, 'Вопрос ' + (i + 1) + ' из ' + n) + '</div>' +
      '<div class="qz-qtext">' + esc(q.q) + '</div>';
    if (q.code) h += '<pre class="qz-code"><code>' + esc(q.code) + '</code></pre>';
    if (q.type === 'single' || q.type === 'multi') {
      var t = q.type === 'single' ? 'radio' : 'checkbox';
      if (q.type === 'multi') h += '<div class="qz-hint">' + T('Choose every correct answer.', 'Отметьте все верные ответы.') + '</div>';
      h += '<div class="qz-opts">';
      q.options.forEach(function (o, k) {
        h += '<label class="qz-opt"><input type="' + t + '" name="' + name + '" value="' + k + '">' +
          '<span class="qz-letter">' + LETTERS[k] + '</span><span class="qz-otext">' + esc(o) + '</span></label>';
      });
      h += '</div>';
    } else {
      h += '<input class="qz-input" type="text" name="' + name + '" inputmode="' + (q.type === 'number' ? 'decimal' : 'text') +
        '" placeholder="' + (q.type === 'number' ? T('Type a number', 'Введите число') : T('Type your answer', 'Введите ответ')) + '" autocomplete="off">';
    }
    return h + '</div>';
  }

  function isRight(q, el) {
    if (q.type === 'single') {
      var c = el.querySelector('input:checked');
      return !!c && Number(c.value) === q.answer;
    }
    if (q.type === 'multi') {
      var got = Array.prototype.map.call(el.querySelectorAll('input:checked'), function (x) { return Number(x.value); }).sort();
      var want = q.answer.slice().sort();
      return got.length === want.length && got.every(function (v, k) { return v === want[k]; });
    }
    var v = el.querySelector('.qz-input').value;
    if (q.type === 'number') {
      var n = parseNum(v);
      return !isNaN(n) && Math.abs(n - q.answer) <= (q.tol || 0);
    }
    var answers = Array.isArray(q.answer) ? q.answer : [q.answer];
    return answers.some(function (a) { return norm(a) === norm(v); });
  }

  function rightAnswerText(q) {
    if (q.type === 'single') return q.options[q.answer];
    if (q.type === 'multi') return q.answer.map(function (k) { return q.options[k]; }).join(' · ');
    if (q.type === 'number') return String(q.answer) + (q.tol ? ' (± ' + q.tol + ')' : '');
    if (!Array.isArray(q.answer)) return q.answer;
    /* a Russian page lists the English answers first and adds Russian ones: show the first Russian one there */
    var ru = window.ALLang && window.ALLang.isRu() ? q.answer.filter(function (a) { return /[а-яё]/i.test(a); })[0] : null;
    return ru || q.answer[0];
  }
  function givenText(q, el) {
    if (q.type === 'single' || q.type === 'multi') {
      return Array.prototype.map.call(el.querySelectorAll('input:checked'), function (x) { return q.options[Number(x.value)]; }).join(' · ');
    }
    return el.querySelector('.qz-input').value.trim();
  }

  function mount(pre) {
    var quiz;
    var src = pre.querySelector('code') || pre;  // the copy-code plugin adds a button inside <pre>; read the <code> only
    try { quiz = JSON.parse(src.textContent); }
    catch (e) {
      pre.insertAdjacentHTML('beforebegin', '<p class="quiz-error">' + T('This quiz could not be read', 'Не удалось прочитать тест') + ' (' + esc(e.message) + ').</p>');
      return;
    }
    var pass = quiz.pass || 0.8, n = quiz.questions.length, need = Math.round(pass * 100), mins = Math.max(2, Math.round(n * 0.6));
    var title = isPractice(quiz.id) ? T('Practice quiz', 'Пробный тест') : T('Day quiz', 'Тест дня');
    var box = document.createElement('div');
    var prev = load().quizzes[quiz.id];
    box.className = 'qz al-block' + (prev && prev.passedOn ? ' al-done' : '');   // the done-state contract of sections.js
    box.setAttribute('data-quiz', quiz.id);
    box.innerHTML =
      '<div class="qz-start">' +
        '<div class="qz-icon">✓</div>' +
        '<div class="qz-start-body"><div class="qz-title">' + title + '</div>' +
        '<div class="qz-sub">' + T(n + ' questions · get ' + need + '% to finish the day · about ' + mins + ' min',
          n + ' ' + plural(n, 'вопрос', 'вопроса', 'вопросов') + ' · наберите ' + need + '%, чтобы завершить день · около ' + mins + ' мин') + '</div>' +
        (prev && prev.passedOn ? '<div class="qz-badge">' + T('✓ Passed · best ' + prev.best + '%', '✓ Пройден · лучший результат ' + prev.best + '%') + '</div>'
          : prev && prev.attempts ? '<div class="qz-badge qz-badge-try">' + T('Best so far ' + prev.best + '% · ' + need + '% passes',
            'Лучший результат пока ' + prev.best + '% · для зачёта нужно ' + need + '%') + '</div>' : '') + '</div>' +
        '<button type="button" class="qz-btn qz-go">' + (prev && prev.passedOn ? T('Take it again', 'Пройти ещё раз') : prev && prev.attempts ? T('Try again', 'Попробовать снова') : T('Start quiz', 'Начать тест')) + '</button>' +
      '</div>' +
      '<div class="qz-run" hidden>' +
        '<div class="qz-top"><span class="qz-title-s">' + title + '</span><span class="qz-count"></span></div>' +
        '<div class="qz-segs">' + quiz.questions.map(function () { return '<span></span>'; }).join('') + '</div>' +
        quiz.questions.map(function (q, i) { return questionHtml(q, i, quiz.id, n); }).join('') +
        '<div class="qz-foot"><button type="button" class="qz-btn qz-ghost qz-back">' + T('Back', 'Назад') + '</button>' +
        '<button type="button" class="qz-btn qz-next">' + T('Next', 'Далее') + '</button></div>' +
      '</div>' +
      '<div class="qz-res" hidden></div>';
    pre.parentNode.replaceChild(box, pre);

    var run = box.querySelector('.qz-run'), res = box.querySelector('.qz-res'), start = box.querySelector('.qz-start');
    var backBtn = box.querySelector('.qz-back'), nextBtn = box.querySelector('.qz-next'), cur = 0, total = n;
    var qs = box.querySelectorAll('.qz-q'), segs = box.querySelectorAll('.qz-segs span');
    /* spaced review: the bank is fetched now, the questions are chosen when she starts */
    var revBank = null, picks = [];
    if (weekOf(quiz.id) >= 2) bank().then(function (b) {
      revBank = b;
      var k = pickReview(quiz.id, b, load(), 3).length, sub = box.querySelector('.qz-sub');
      if (k && sub && !box.querySelector('.qz-sub-rev')) sub.insertAdjacentHTML('afterend', '<div class="qz-sub qz-sub-rev">' +
        T('+ ' + k + ' review question' + (k > 1 ? 's' : '') + ' from earlier weeks — they do not count toward the pass mark',
          '+ ' + k + ' ' + plural(k, 'вопрос', 'вопроса', 'вопросов') + ' на повторение из прошлых недель — в зачёт дня не идут') + '</div>');
    });
    function addReview() {
      picks = pickReview(quiz.id, revBank, load(), 3);
      if (!picks.length) return;
      var foot = run.querySelector('.qz-foot'), bar = run.querySelector('.qz-segs');
      picks.forEach(function (x, j) {
        var h = questionHtml(x.q, n + j, quiz.id, n).replace(/<div class="qz-qnum">[^<]*<\/div>/,
          '<div class="qz-qnum qz-qnum-rev">' + esc(T('Review ' + (j + 1) + ' of ' + picks.length + ' · from ' + dayName(x.day),
            'Повторение ' + (j + 1) + ' из ' + picks.length + ' · из урока «' + dayName(x.day) + '»')) + '</div>');
        foot.insertAdjacentHTML('beforebegin', h.replace('<div class="qz-q"', '<div class="qz-q qz-q-rev"'));
        bar.insertAdjacentHTML('beforeend', '<span class="qz-seg-rev"></span>');
      });
      total = n + picks.length;
      qs = box.querySelectorAll('.qz-q');
      segs = box.querySelectorAll('.qz-segs span');
    }
    function answered(el) {
      return !!el.querySelector('input:checked') || Array.prototype.some.call(el.querySelectorAll('.qz-input'), function (x) { return x.value.trim(); });
    }
    function show() {
      Array.prototype.forEach.call(qs, function (el, i) { el.hidden = i !== cur; });
      Array.prototype.forEach.call(segs, function (s, i) {
        s.className = (i >= n ? 'qz-seg-rev ' : '') + (i === cur ? 'now' : answered(qs[i]) ? 'did' : '');
      });
      box.querySelector('.qz-count').textContent = (cur + 1) + ' / ' + total;
      backBtn.style.visibility = cur === 0 ? 'hidden' : 'visible';
      nextBtn.textContent = cur === total - 1 ? T('Submit answers', 'Отправить ответы') : T('Next', 'Далее');
      nextBtn.classList.toggle('qz-submit', cur === total - 1);
      nextBtn.disabled = !answered(qs[cur]);
    }
    function top() { var r = box.getBoundingClientRect(); if (r.top < 0 || r.top > window.innerHeight * 0.6) box.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    box.querySelector('.qz-go').addEventListener('click', function () {
      addReview();
      start.hidden = true; run.hidden = false; show();
      var f = qs[0].querySelector('.qz-input'); if (f) f.focus();
    });
    run.addEventListener('input', show);
    run.addEventListener('change', show);
    run.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.classList.contains('qz-input')) { e.preventDefault(); nextBtn.click(); }
    });
    backBtn.addEventListener('click', function () { if (cur > 0) { cur--; show(); top(); } });
    nextBtn.addEventListener('click', function () {
      if (!answered(qs[cur])) return;
      if (cur < total - 1) { cur++; show(); top(); var f = qs[cur].querySelector('.qz-input'); if (f) f.focus(); return; }
      finish();
    });

    function finish() {
      var right = 0, rows = '', s = load(), now = Date.now();
      quiz.questions.forEach(function (q, i) {
        var el = qs[i], ok = isRight(q, el);
        if (ok) right++;
        if (!isPractice(quiz.id)) noteAnswer(s, quiz.id + '#' + i, ok);
        rows += '<details class="qz-rv ' + (ok ? 'ok' : 'bad') + '"' + (ok ? '' : ' open') + '><summary>' +
          '<span class="qz-mark">' + (ok ? '✓' : '✕') + '</span><span class="qz-rv-q"><b>' + (i + 1) + '.</b> ' + esc(q.q) + '</span></summary>' +
          '<div class="qz-rv-body">' +
          '<div><span class="qz-k">' + T('Your answer', 'Ваш ответ') + '</span> ' + esc(givenText(q, el) || '—') + '</div>' +
          (ok ? '' : '<div><span class="qz-k">' + T('Right answer', 'Верный ответ') + '</span> ' + esc(rightAnswerText(q)) + '</div>') +
          (q.explain ? '<div class="qz-why">' + esc(q.explain) + '</div>' : '') + '</div></details>';
      });
      var revRight = 0, revRows = '';
      picks.forEach(function (x, j) {
        var el = qs[n + j], ok = isRight(x.q, el);
        if (ok) revRight++;
        noteAnswer(s, x.key, ok);
        s.rev = s.rev || {};
        s.rev[x.key] = now;
        var link = '#/' + (window.ALLang && window.ALLang.isRu() ? 'ru/' : '') + x.page + '?id=day-quiz';
        revRows += '<details class="qz-rv ' + (ok ? 'ok' : 'bad') + '"' + (ok ? '' : ' open') + '><summary>' +
          '<span class="qz-mark">' + (ok ? '✓' : '✕') + '</span><span class="qz-rv-q"><b>' + esc(dayName(x.day)) + '.</b> ' + esc(x.q.q) + '</span></summary>' +
          '<div class="qz-rv-body">' +
          '<div><span class="qz-k">' + T('Your answer', 'Ваш ответ') + '</span> ' + esc(givenText(x.q, el) || '—') + '</div>' +
          (ok ? '' : '<div><span class="qz-k">' + T('Right answer', 'Верный ответ') + '</span> ' + esc(rightAnswerText(x.q)) + '</div>') +
          (x.q.explain ? '<div class="qz-why">' + esc(x.q.explain) + '</div>' : '') +
          '<div><a class="qz-rv-link" href="' + esc(link) + '">' + T('Open that lesson →', 'Открыть тот урок →') + '</a></div></div></details>';
      });
      var pct = Math.round(100 * right / n), passed = pct >= pass * 100;
      var r = s.quizzes[quiz.id] || { best: 0, attempts: 0 };
      r.attempts++;
      r.best = Math.max(r.best, pct);
      if (passed) {
        r.passedOn = r.passedOn || today();
        r.passDays = r.passDays || [];
        if (r.passDays.indexOf(today()) < 0) r.passDays.push(today());
      }
      s.quizzes[quiz.id] = r;
      save(s);
      var head = passed && isPractice(quiz.id) ? T('Practice quiz passed', 'Пробный тест пройден')
        : passed ? T('Day done!', 'День завершён!') : T('Almost there', 'Почти получилось');
      var st = streak(s), fin = window.ALQuiz.doneCount();
      var line = passed && isPractice(quiz.id) ? T('This is how a real day ends. Practice does not count toward your days or streak.',
          'Так заканчивается настоящий день. Пробный тест не идёт в счёт дней и серии.')
        : passed ? T('Streak: ' + st + ' day' + (st === 1 ? '' : 's') + ' · days finished: ' + fin + ' / ' + TOTAL_DAYS,
          'Серия: ' + st + ' ' + plural(st, 'день', 'дня', 'дней') + ' · завершено дней: ' + fin + ' / ' + TOTAL_DAYS)
        : T('You need ' + need + '%. Read the explanations below, then try again — your best score counts.',
          'Нужно ' + need + '%. Прочитайте пояснения ниже и попробуйте снова — засчитывается лучший результат.');
      run.hidden = true;
      res.hidden = false;
      res.innerHTML =
        '<div class="qz-score ' + (passed ? 'pass' : 'fail') + '">' +
          '<div class="qz-ring" style="--p:' + pct + '"><span>' + right + '<small>/' + n + '</small></span></div>' +
          '<div class="qz-score-body"><div class="qz-head">' + head + '</div><div class="qz-pct">' + pct + T('% correct', '% верно') + '</div><div class="qz-line">' + line + '</div></div>' +
        '</div>' +
        '<div class="qz-dots">' + quiz.questions.map(function (q, i) { return '<span class="' + (isRight(q, qs[i]) ? 'ok' : 'bad') + '">' + (i + 1) + '</span>'; }).join('') + '</div>' +
        '<div class="qz-rv-title">' + T('Review your answers', 'Разбор ваших ответов') + '</div>' + rows +
        (picks.length ? '<div class="qz-rv-title qz-rv-title-rev">' + T('Review from earlier weeks · ' + revRight + ' of ' + picks.length + ' right',
          'Повторение прошлых недель · верно ' + revRight + ' из ' + picks.length) + '</div>' +
          '<p class="qz-rv-note">' + T('Not counted in today\'s score. A miss goes to My mistakes, to retry before the checkpoint.',
            'В результат дня не входит. Ошибка попадает в «Мои ошибки» — повторите перед контрольной.') + '</p>' + revRows : '') +
        '<div class="qz-foot"><button type="button" class="qz-btn qz-retry">' + T('Try again', 'Попробовать снова') + '</button></div>';
      res.querySelector('.qz-retry').addEventListener('click', function () { mount(rebuild(quiz, box)); });
      top();
      markSidebar();
      if (r.passedOn) box.classList.add('al-done');
      document.dispatchEvent(new CustomEvent('al:change'));
    }
  }

  /* ---------- Quick check (```check): the same question objects, one at a time, instant feedback, no pass mark ----------
  {"id": "w01d1-sc", "questions": [ …as in a quiz… ]}. The score is kept under "checks" in al.v1 and never touches the
  streak or the finished days. */
  function mountCheck(pre) {
    var chk;
    try { chk = JSON.parse((pre.querySelector('code') || pre).textContent); }
    catch (e) {
      pre.insertAdjacentHTML('beforebegin', '<p class="quiz-error">' + T('This check could not be read', 'Не удалось прочитать проверку') + ' (' + esc(e.message) + ').</p>');
      return;
    }
    var qsList = chk.questions || [], n = qsList.length, id = chk.id || 'check';
    var box = document.createElement('div');
    box.className = 'qc al-block';
    box.setAttribute('data-check', id);
    pre.parentNode.replaceChild(box, pre);
    var ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M22 11.1V12a10 10 0 11-5.9-9.1"/><path d="M22 4L12 14l-3-3"/></svg>';
    function head(right) {
      return '<div class="qc-head"><span class="qc-ico">' + ICON + '</span><div class="qc-hd"><div class="qc-title">' +
        T('Quick check · ' + n + ' question' + (n === 1 ? '' : 's'), 'Быстрая проверка · ' + n + ' ' + plural(n, 'вопрос', 'вопроса', 'вопросов')) + '</div>' +
        '<div class="qc-sub">' + T('One at a time · instant feedback · no pass mark', 'По одному · ответ сразу · без проходного балла') + '</div></div>' +
        '<span class="qc-count">' + (right || '') + '</span></div>';
    }
    function saved() { var s = load(); return (s.checks || {})[id]; }
    function store(rec) { var s = load(); s.checks = s.checks || {}; s.checks[id] = rec; save(s); }
    function mark() {
      box.classList.toggle('al-done', !!saved());
      document.dispatchEvent(new CustomEvent('al:change'));
    }

    function results(rec) {
      var rows = qsList.map(function (q, i) {
        var ok = rec.marks[i];
        return '<details class="qz-rv ' + (ok ? 'ok' : 'bad') + '"' + (ok ? '' : ' open') + '><summary><span class="qz-mark">' + (ok ? '✓' : '✕') + '</span>' +
          '<span class="qz-rv-q"><b>' + (i + 1) + '.</b> ' + esc(q.q) + '</span></summary><div class="qz-rv-body">' +
          '<div><span class="qz-k">' + T('Your answer', 'Ваш ответ') + '</span> ' + esc((rec.given || [])[i] || '—') + '</div>' +
          (ok ? '' : '<div><span class="qz-k">' + T('Right answer', 'Верный ответ') + '</span> ' + esc(rightAnswerText(q)) + '</div>') +
          (q.explain ? '<div class="qz-why">' + esc(q.explain) + '</div>' : '') + '</div></details>';
      }).join('');
      box.innerHTML = head(rec.score + ' / ' + n) +
        '<div class="qc-res"><div class="qc-score"><b>' + rec.score + ' / ' + n + '</b> ' +
        (rec.score === n ? T('— all right. It stuck.', '— всё верно. Запомнилось.') : T('— read the explanations below; they point to the part of today to look at again.',
          '— прочитайте пояснения ниже: они подскажут, что из сегодняшнего стоит повторить.')) + '</div>' + rows +
        '<div class="qc-foot"><button type="button" class="qz-btn qz-ghost qc-again">' + T('Try again', 'Пройти ещё раз') + '</button></div></div>';
      box.querySelector('.qc-again').onclick = function () { run(); };
    }

    function run() {
      var cur = 0, marks = [], given = [];
      function show() {
        var q = qsList[cur];
        box.innerHTML = head((cur + 1) + ' / ' + n) +
          '<div class="qz-segs qc-segs">' + qsList.map(function (x, i) { return '<span class="' + (i < cur ? (marks[i] ? 'ok' : 'bad') : i === cur ? 'now' : '') + '"></span>'; }).join('') + '</div>' +
          questionHtml(q, cur, id, n) + '<div class="qc-fb"></div>' +
          '<div class="qc-foot"><button type="button" class="qz-btn qc-go" disabled>' + T('Check', 'Проверить') + '</button></div>';
        var el = box.querySelector('.qz-q'), go = box.querySelector('.qc-go'), fb = box.querySelector('.qc-fb'), checked = false;
        function answered() { return !!el.querySelector('input:checked') || Array.prototype.some.call(el.querySelectorAll('.qz-input'), function (x) { return x.value.trim(); }); }
        el.addEventListener('input', function () { if (!checked) go.disabled = !answered(); });
        el.addEventListener('change', function () { if (!checked) go.disabled = !answered(); });
        el.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.classList.contains('qz-input')) { e.preventDefault(); go.click(); } });
        go.onclick = function () {
          if (!checked) {
            if (!answered()) return;
            var ok = isRight(q, el), st = load();
            noteAnswer(st, q.key || (id + '#' + cur), ok);
            save(st);
            checked = true; marks[cur] = ok; given[cur] = givenText(q, el);
            el.classList.add(ok ? 'qc-ok' : 'qc-bad');
            Array.prototype.forEach.call(el.querySelectorAll('input'), function (x) { x.disabled = true; });
            fb.className = 'qc-fb ' + (ok ? 'ok' : 'bad');
            fb.innerHTML = '<b>' + (ok ? T('✓ Right', '✓ Верно') : T('✕ Not quite', '✕ Не совсем')) + '</b>' +
              (ok ? '' : ' ' + T('Right answer: ', 'Верный ответ: ') + esc(rightAnswerText(q))) + (q.explain ? '<div class="qz-why">' + esc(q.explain) + '</div>' : '');
            go.textContent = cur === n - 1 ? T('See my score', 'Мой результат') : T('Next', 'Далее');
            go.focus();
            return;
          }
          cur++;
          if (cur < n) { show(); var f = box.querySelector('.qz-input'); if (f) f.focus(); return; }
          var rec = { score: marks.filter(Boolean).length, n: n, marks: marks, given: given, at: today() };
          store(rec); results(rec); mark();
        };
      }
      show();
    }

    var rec = saved();
    if (rec && rec.marks && rec.marks.length === n) results(rec);
    else {
      box.innerHTML = head('') + '<div class="qc-foot qc-start"><button type="button" class="qz-btn qc-begin">' + T('Start', 'Начать') + '</button></div>';
      box.querySelector('.qc-begin').onclick = function () { run(); var f = box.querySelector('.qz-input'); if (f) f.focus(); };
    }
    box.classList.toggle('al-done', !!rec);
  }

  function rebuild(quiz, box) {
    var pre = document.createElement('pre');
    pre.setAttribute('data-lang', 'quiz');
    pre.textContent = JSON.stringify(quiz);
    box.parentNode.replaceChild(pre, box);
    return pre;
  }

  /* ---------- sidebar ticks for finished days ---------- */
  function idFromHref(href) {
    if (!href || href.indexOf('?id=') >= 0) return null;  // section links inside a day get no tick
    var m = /(?:^|[/#])(?:ru\/)?weeks\/week-(\d\d)\/day-(\d)/.exec(href);   // '#/weeks/…' and the Russian menu's '#/ru/weeks/…'
    return m ? 'w' + m[1] + 'd' + m[2] : null;
  }
  function markSidebar() {
    var s = load();
    Array.prototype.forEach.call(document.querySelectorAll('.sidebar-nav a'), function (a) {
      var id = idFromHref(a.getAttribute('href'));
      if (!id) return;
      var r = s.quizzes[id];
      a.classList.toggle('day-done', !!(r && r.passedOn));
    });
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(function () {
      Array.prototype.forEach.call(document.querySelectorAll('.markdown-section pre[data-lang="quiz"]'), mount);
      Array.prototype.forEach.call(document.querySelectorAll('.markdown-section pre[data-lang="check"]'), mountCheck);
      markSidebar();
      if (window.ALBoard) window.ALBoard.render();
    });
  });
})();
