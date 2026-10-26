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
*/
(function () {
  var KEY = 'al.v1';
  var TOTAL_DAYS = 41;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || { quizzes: {} }; }
    catch (e) { return { quizzes: {} }; }
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
    var t = String(s).replace(/[\s ,]/g, '').replace('%', '');
    return t === '' ? NaN : Number(t);
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
      else if (wd === 0 || wd === 6) { /* weekend: neutral */ }
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
    TOTAL_DAYS: TOTAL_DAYS
  };

  /* ---------- rendering ---------- */
  function questionHtml(q, i, qid) {
    var name = qid + '-q' + i;
    var h = '<div class="quiz-q" data-i="' + i + '"><div class="quiz-qtext"><b>' + (i + 1) + '.</b> ' + esc(q.q) + '</div>';
    if (q.code) h += '<pre class="quiz-code"><code>' + esc(q.code) + '</code></pre>';
    if (q.type === 'single' || q.type === 'multi') {
      var t = q.type === 'single' ? 'radio' : 'checkbox';
      q.options.forEach(function (o, k) {
        h += '<label class="quiz-opt"><input type="' + t + '" name="' + name + '" value="' + k + '"> <span>' + esc(o) + '</span></label>';
      });
      if (q.type === 'multi') h += '<div class="quiz-hint">Tick every correct option.</div>';
    } else {
      h += '<input class="quiz-input" type="text" name="' + name + '" placeholder="' +
        (q.type === 'number' ? 'a number' : 'your answer') + '" autocomplete="off">';
    }
    h += '<div class="quiz-feedback" hidden></div></div>';
    return h;
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
    var v = el.querySelector('.quiz-input').value;
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
    return (Array.isArray(q.answer) ? q.answer[0] : q.answer);
  }

  function mount(pre) {
    var quiz;
    var src = pre.querySelector('code') || pre;  // the copy-code plugin adds a button inside <pre>; read the <code> only
    try { quiz = JSON.parse(src.textContent); }
    catch (e) {
      pre.insertAdjacentHTML('beforebegin', '<p class="quiz-error">This quiz could not be read (' + esc(e.message) + ').</p>');
      return;
    }
    var pass = quiz.pass || 0.8;
    var box = document.createElement('div');
    box.className = 'quiz';
    var prev = load().quizzes[quiz.id];
    var head = '<div class="quiz-head"><span class="quiz-title">Day quiz</span>' +
      '<span class="quiz-rule">' + quiz.questions.length + ' questions · ' + Math.round(pass * 100) + ' % finishes the day</span>' +
      (prev && prev.passedOn ? '<span class="quiz-done">Day done · best ' + prev.best + ' %</span>' : '') + '</div>';
    var n = quiz.questions.length;
    box.innerHTML = head + '<div class="quiz-prog"><div class="quiz-prog-bar"></div></div><div class="quiz-step"></div>' +
      '<div class="quiz-result" hidden></div>' +
      quiz.questions.map(function (q, i) { return questionHtml(q, i, quiz.id); }).join('') +
      '<div class="quiz-actions"><button type="button" class="quiz-back">← Back</button><button type="button" class="quiz-next">Next →</button>' +
      '<button type="button" class="quiz-check" hidden>Submit answers</button>' +
      '<button type="button" class="quiz-retry" hidden>Try again</button></div>';
    pre.parentNode.replaceChild(box, pre);

    var checkBtn = box.querySelector('.quiz-check'), retryBtn = box.querySelector('.quiz-retry'), result = box.querySelector('.quiz-result');
    var backBtn = box.querySelector('.quiz-back'), nextBtn = box.querySelector('.quiz-next'), cur = 0;
    var qs = box.querySelectorAll('.quiz-q');
    /* one question at a time (Khan-style): Next opens once this one is answered; the last one shows Submit */
    function answered(el) {
      return !!el.querySelector('input:checked') || Array.prototype.some.call(el.querySelectorAll('.quiz-input'), function (x) { return x.value.trim(); });
    }
    function show() {
      Array.prototype.forEach.call(qs, function (el, i) { el.hidden = i !== cur; });
      box.querySelector('.quiz-step').textContent = 'Question ' + (cur + 1) + ' of ' + n;
      box.querySelector('.quiz-prog-bar').style.width = Math.round(100 * (cur + 1) / n) + '%';
      backBtn.hidden = cur === 0;
      nextBtn.hidden = cur === n - 1;
      checkBtn.hidden = cur !== n - 1;
      nextBtn.disabled = checkBtn.disabled = !answered(qs[cur]);
    }
    box.addEventListener('input', function () { if (!box.classList.contains('quiz-review')) show(); });
    box.addEventListener('change', function () { if (!box.classList.contains('quiz-review')) show(); });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.classList.contains('quiz-input')) { e.preventDefault(); (cur === n - 1 ? checkBtn : nextBtn).click(); }
    });
    nextBtn.addEventListener('click', function () { if (cur < n - 1 && answered(qs[cur])) { cur++; show(); } });
    backBtn.addEventListener('click', function () { if (cur > 0) { cur--; show(); } });
    show();
    checkBtn.addEventListener('click', function () {
      box.classList.add('quiz-review');
      Array.prototype.forEach.call(qs, function (el) { el.hidden = false; });
      backBtn.hidden = nextBtn.hidden = true;
      box.querySelector('.quiz-step').textContent = 'Your answers';
      box.querySelector('.quiz-prog').hidden = true;
      var right = 0;
      quiz.questions.forEach(function (q, i) {
        var el = box.querySelector('.quiz-q[data-i="' + i + '"]');
        var ok = isRight(q, el);
        if (ok) right++;
        el.classList.remove('ok', 'bad');
        el.classList.add(ok ? 'ok' : 'bad');
        var fb = el.querySelector('.quiz-feedback');
        fb.hidden = false;
        fb.innerHTML = (ok ? '<b>Right.</b> ' : '<b>Not quite.</b> Answer: ' + esc(rightAnswerText(q)) + '. ') + esc(q.explain || '');
        Array.prototype.forEach.call(el.querySelectorAll('input'), function (x) { x.disabled = true; });
      });
      var pct = Math.round(100 * right / quiz.questions.length);
      var passed = pct >= pass * 100;
      var s = load();
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
      result.hidden = false;
      result.className = 'quiz-result ' + (passed ? 'pass' : 'fail');
      result.innerHTML = passed && isPractice(quiz.id)
        ? '<b>' + right + ' / ' + quiz.questions.length + ' (' + pct + ' %) — practice quiz passed.</b> ' +
          'This is how a real day ends; practice does not count toward your days or streak.'
        : passed
        ? '<b>' + right + ' / ' + quiz.questions.length + ' (' + pct + ' %) — day done.</b> Streak: ' + streak(s) + ' day(s). ' +
          'Days finished: ' + window.ALQuiz.doneCount() + ' / ' + TOTAL_DAYS + '.'
        : '<b>' + right + ' / ' + quiz.questions.length + ' (' + pct + ' %).</b> You need ' + Math.round(pass * 100) +
          ' %. Reread the sections the explanations point to, then try again — the best score counts.';
      checkBtn.hidden = true;
      retryBtn.hidden = false;
      markSidebar();
    });
    retryBtn.addEventListener('click', function () {
      mount(rebuild(quiz, box));
    });
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
    var m = /week-(\d\d)\/day-(\d)/.exec(href);
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
      markSidebar();
      if (window.ALBoard) window.ALBoard.render();
    });
  });
})();
