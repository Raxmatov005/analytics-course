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

  /* ---------- rendering: one question at a time, then a results screen (Khan-style) ---------- */
  var LETTERS = 'ABCDEFGH';
  function questionHtml(q, i, qid, n) {
    var name = qid + '-q' + i;
    var h = '<div class="qz-q" data-i="' + i + '"><div class="qz-qnum">Question ' + (i + 1) + ' of ' + n + '</div>' +
      '<div class="qz-qtext">' + esc(q.q) + '</div>';
    if (q.code) h += '<pre class="qz-code"><code>' + esc(q.code) + '</code></pre>';
    if (q.type === 'single' || q.type === 'multi') {
      var t = q.type === 'single' ? 'radio' : 'checkbox';
      if (q.type === 'multi') h += '<div class="qz-hint">Choose every correct answer.</div>';
      h += '<div class="qz-opts">';
      q.options.forEach(function (o, k) {
        h += '<label class="qz-opt"><input type="' + t + '" name="' + name + '" value="' + k + '">' +
          '<span class="qz-letter">' + LETTERS[k] + '</span><span class="qz-otext">' + esc(o) + '</span></label>';
      });
      h += '</div>';
    } else {
      h += '<input class="qz-input" type="text" name="' + name + '" inputmode="' + (q.type === 'number' ? 'decimal' : 'text') +
        '" placeholder="' + (q.type === 'number' ? 'Type a number' : 'Type your answer') + '" autocomplete="off">';
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
    return (Array.isArray(q.answer) ? q.answer[0] : q.answer);
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
      pre.insertAdjacentHTML('beforebegin', '<p class="quiz-error">This quiz could not be read (' + esc(e.message) + ').</p>');
      return;
    }
    var pass = quiz.pass || 0.8, n = quiz.questions.length;
    var box = document.createElement('div');
    box.className = 'qz';
    var prev = load().quizzes[quiz.id];
    box.innerHTML =
      '<div class="qz-start">' +
        '<div class="qz-icon">✓</div>' +
        '<div class="qz-start-body"><div class="qz-title">' + (isPractice(quiz.id) ? 'Practice quiz' : 'Day quiz') + '</div>' +
        '<div class="qz-sub">' + n + ' questions · get ' + Math.round(pass * 100) + '% to finish the day · about ' + Math.max(2, Math.round(n * 0.6)) + ' min</div>' +
        (prev && prev.passedOn ? '<div class="qz-badge">Done · best ' + prev.best + '%</div>' : '') + '</div>' +
        '<button type="button" class="qz-btn qz-go">' + (prev && prev.attempts ? 'Try again' : 'Start quiz') + '</button>' +
      '</div>' +
      '<div class="qz-run" hidden>' +
        '<div class="qz-top"><span class="qz-title-s">' + (isPractice(quiz.id) ? 'Practice quiz' : 'Day quiz') + '</span><span class="qz-count"></span></div>' +
        '<div class="qz-segs">' + quiz.questions.map(function () { return '<span></span>'; }).join('') + '</div>' +
        quiz.questions.map(function (q, i) { return questionHtml(q, i, quiz.id, n); }).join('') +
        '<div class="qz-foot"><button type="button" class="qz-btn qz-ghost qz-back">Back</button>' +
        '<button type="button" class="qz-btn qz-next">Next</button></div>' +
      '</div>' +
      '<div class="qz-res" hidden></div>';
    pre.parentNode.replaceChild(box, pre);

    var run = box.querySelector('.qz-run'), res = box.querySelector('.qz-res'), start = box.querySelector('.qz-start');
    var backBtn = box.querySelector('.qz-back'), nextBtn = box.querySelector('.qz-next'), cur = 0;
    var qs = box.querySelectorAll('.qz-q'), segs = box.querySelectorAll('.qz-segs span');
    function answered(el) {
      return !!el.querySelector('input:checked') || Array.prototype.some.call(el.querySelectorAll('.qz-input'), function (x) { return x.value.trim(); });
    }
    function show() {
      Array.prototype.forEach.call(qs, function (el, i) { el.hidden = i !== cur; });
      Array.prototype.forEach.call(segs, function (s, i) {
        s.className = i === cur ? 'now' : answered(qs[i]) ? 'did' : '';
      });
      box.querySelector('.qz-count').textContent = (cur + 1) + ' / ' + n;
      backBtn.style.visibility = cur === 0 ? 'hidden' : 'visible';
      nextBtn.textContent = cur === n - 1 ? 'Submit answers' : 'Next';
      nextBtn.classList.toggle('qz-submit', cur === n - 1);
      nextBtn.disabled = !answered(qs[cur]);
    }
    function top() { var r = box.getBoundingClientRect(); if (r.top < 0 || r.top > window.innerHeight * 0.6) box.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    box.querySelector('.qz-go').addEventListener('click', function () {
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
      if (cur < n - 1) { cur++; show(); top(); var f = qs[cur].querySelector('.qz-input'); if (f) f.focus(); return; }
      finish();
    });

    function finish() {
      var right = 0, rows = '';
      quiz.questions.forEach(function (q, i) {
        var el = qs[i], ok = isRight(q, el);
        if (ok) right++;
        rows += '<details class="qz-rv ' + (ok ? 'ok' : 'bad') + '"' + (ok ? '' : ' open') + '><summary>' +
          '<span class="qz-mark">' + (ok ? '✓' : '✕') + '</span><span class="qz-rv-q"><b>' + (i + 1) + '.</b> ' + esc(q.q) + '</span></summary>' +
          '<div class="qz-rv-body">' +
          '<div><span class="qz-k">Your answer</span> ' + esc(givenText(q, el) || '—') + '</div>' +
          (ok ? '' : '<div><span class="qz-k">Right answer</span> ' + esc(rightAnswerText(q)) + '</div>') +
          (q.explain ? '<div class="qz-why">' + esc(q.explain) + '</div>' : '') + '</div></details>';
      });
      var pct = Math.round(100 * right / n), passed = pct >= pass * 100;
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
      var head = passed && isPractice(quiz.id) ? 'Practice quiz passed'
        : passed ? 'Day done!' : 'Almost there';
      var line = passed && isPractice(quiz.id) ? 'This is how a real day ends. Practice does not count toward your days or streak.'
        : passed ? 'Streak: ' + streak(s) + ' day' + (streak(s) === 1 ? '' : 's') + ' · days finished: ' + window.ALQuiz.doneCount() + ' / ' + TOTAL_DAYS
        : 'You need ' + Math.round(pass * 100) + '%. Read the explanations below, then try again — your best score counts.';
      run.hidden = true;
      res.hidden = false;
      res.innerHTML =
        '<div class="qz-score ' + (passed ? 'pass' : 'fail') + '">' +
          '<div class="qz-ring" style="--p:' + pct + '"><span>' + right + '<small>/' + n + '</small></span></div>' +
          '<div class="qz-score-body"><div class="qz-head">' + head + '</div><div class="qz-pct">' + pct + '% correct</div><div class="qz-line">' + line + '</div></div>' +
        '</div>' +
        '<div class="qz-dots">' + quiz.questions.map(function (q, i) { return '<span class="' + (isRight(q, qs[i]) ? 'ok' : 'bad') + '">' + (i + 1) + '</span>'; }).join('') + '</div>' +
        '<div class="qz-rv-title">Review your answers</div>' + rows +
        '<div class="qz-foot"><button type="button" class="qz-btn qz-retry">Try again</button></div>';
      res.querySelector('.qz-retry').addEventListener('click', function () { mount(rebuild(quiz, box)); });
      top();
      markSidebar();
    }
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
