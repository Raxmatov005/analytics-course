/* "My mistakes" for the Analytics Learning site (Docsify plugin; 2026-10-30, the course plan's improvement C): every
question she got wrong, gathered on one page to retry before a checkpoint.

The page (mistakes.md, ru/mistakes.md) holds one ```mistakes block; before Docsify renders the page this plugin
replaces that block with Markdown it writes from her progress (an async beforeEach), so every engine draws the boxes
exactly as on a lesson page:
- day-quiz, review and Self-check questions still to fix (al.v1 → miss, written by quiz.js) become one ```check block
  per lesson; each question carries its "key", so a right answer there marks it fixed (quiz.js notes it under the key);
- tasks still wrong (al.tasks: answered, not right) come back as their own ```task blocks with the question above them,
  under the same id, so a right answer here counts on the lesson page too;
- what she missed first and got right later is listed with links, to look at once more.
Newest week first. Each lesson links to its page; a link to a task, a quiz or a self-check scrolls to that box there
(sessionStorage "al.goto", read on the next page). The banks are review.json (day-quiz questions) and tasks.json
(tasks and self-checks), written by scripts/build_bank.py; ru/… on a Russian page. */
(function () {
  function T(en, ru) { return window.ALLang ? window.ALLang.t(en, ru) : en; }
  function isRu() { return !!(window.ALLang && window.ALLang.isRu()); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function parse(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } }
  function getJson(path) {
    return fetch(path, { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  function stillWrong(m) { return !!(m && m.last && !(m.fixedAt > m.last)); }
  function dayName(id) {
    var m = /^w(\d\d)d(\d)$/.exec(id);
    return m ? T('Week ' + Number(m[1]) + ' · Day ' + m[2], 'Неделя ' + Number(m[1]) + ' · День ' + m[2]) : id;
  }
  /* a short fingerprint of the questions in a box, so a new set gets a fresh box (the check engine keeps a score per id) */
  function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(36); }
  /* Markdown → one plain line for a list */
  function plain(s, max) {
    s = String(s || '').replace(/```[\s\S]*?```/g, ' ').replace(/[*`>]/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ').trim();
    return s.length > max ? s.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : s;
  }

  /* ---------- what she still has to fix, and what she got right later, by lesson ---------- */
  function gather(rev, tb) {
    var v1 = parse('al.v1'), tasks = parse('al.tasks'), miss = v1.miss || {}, days = {};
    function day(d) { return days[d] || (days[d] = { quiz: [], tasks: [], later: [] }); }
    Object.keys(miss).forEach(function (key) {
      var m = /^(w\d\dd\d)(-[\w-]+)?#(\d+)$/.exec(key);
      if (!m) return;   // the practice day's quiz is not a lesson
      var d = m[1], i = Number(m[3]), q = null, where;
      if (!m[2]) { q = rev.days[d] && rev.days[d].quiz[i]; where = '[data-quiz="' + d + '"]'; }
      else { var c = tb.days[d] && tb.days[d].checks[d + m[2]]; q = c && c[i]; where = '[data-check="' + d + m[2] + '"]'; }
      if (!q) return;   // the page changed since: the question is gone
      if (stillWrong(miss[key])) day(d).quiz.push({ key: key, q: q });
      else day(d).later.push({ text: q.q, where: where });
    });
    Object.keys(tasks).forEach(function (id) {
      var r = tasks[id], d = id.slice(0, 5), t = tb.days[d] && tb.days[d].tasks[id];
      if (!r || !t) return;
      if (r.done && !r.ok) day(d).tasks.push({ id: id, t: t });
      else if (r.miss && r.ok) day(d).later.push({ text: t.q, where: '[data-id="' + id + '"]' });
    });
    return days;
  }

  function write(rev, tb) {
    var days = gather(rev, tb), ru = isRu() ? 'ru/' : '';
    var order = Object.keys(days).filter(function (d) { return rev.days[d]; }).sort().reverse();
    var nq = 0, nt = 0, nl = 0;
    order.forEach(function (d) { nq += days[d].quiz.length; nt += days[d].tasks.length; nl += days[d].later.length; });
    var md = [];
    if (!nq && !nt) {
      md.push('<div class="mx-sum mx-none"><b>' + T('Nothing to fix right now.', 'Сейчас исправлять нечего.') + '</b> ' +
        (nl ? T('Below: what you got right on a second try — worth one more look before a checkpoint.',
          'Ниже — то, что получилось со второй попытки: стоит взглянуть ещё раз перед контрольной.')
          : T('When you get a question wrong in a day quiz, a review question, a self-check or a task, it appears here.',
            'Когда вы ошибётесь в тесте дня, вопросе на повторение, самопроверке или задании, вопрос появится здесь.')) + '</div>', '');
    } else {
      md.push('<div class="mx-sum"><b>' + T(nq + nt + ' to fix', 'Исправить: ' + (nq + nt)) + '</b> · ' +
        T(nq + ' question' + (nq === 1 ? '' : 's') + ' and ' + nt + ' task' + (nt === 1 ? '' : 's'), 'вопросов: ' + nq + ', заданий: ' + nt) +
        (nl ? T(' · ' + nl + ' got right later', ' · со второй попытки: ' + nl) : '') + '</div>', '');
    }
    var week = null;
    order.forEach(function (d) {
      var x = days[d], R = rev.days[d], w = Number(d.slice(1, 3));
      if (!x.quiz.length && !x.tasks.length && !x.later.length) return;
      if (w !== week) { week = w; md.push('## ' + T('Week ' + w, 'Неделя ' + w), ''); }
      md.push('### ' + R.t.replace(/^#+\s*/, ''), '');
      md.push('<p class="mx-open"><a href="#/' + ru + R.p + '">' + esc(T('Open ' + dayName(d) + ' →', 'Открыть урок «' + dayName(d) + '» →')) + '</a></p>', '');
      if (x.quiz.length) {
        var keys = x.quiz.map(function (y) { return y.key; }).join(',');
        md.push('```check', JSON.stringify({ id: 'mx-' + d + '-' + hash(keys), questions: x.quiz.map(function (y) {
          var q = {}; Object.keys(y.q).forEach(function (k) { q[k] = y.q[k]; }); q.key = y.key; return q;
        }) }), '```', '');
      }
      x.tasks.forEach(function (y) {
        md.push(y.t.q || ('**' + T('Task', 'Задание') + '**'), '', '```task', JSON.stringify(y.t.j), '```', '',
          '<p class="mx-where"><a href="#/' + ru + R.p + '" data-goto="' + esc('[data-id="' + y.id + '"]') + '">' +
          esc(T('See it in the lesson' + (y.t.h ? ' (' + plain(y.t.h, 60) + ')' : '') + ' →', 'Посмотреть в уроке' + (y.t.h ? ' («' + plain(y.t.h, 60) + '»)' : '') + ' →')) + '</a></p>', '');
      });
      if (x.later.length) {
        md.push('<details class="mx-later"><summary>' + esc(T('Got right on a later try (' + x.later.length + ')', 'Верно со второй попытки (' + x.later.length + ')')) + '</summary><ul>' +
          x.later.map(function (y) {
            return '<li><a href="#/' + ru + R.p + '" data-goto="' + esc(y.where) + '">' + esc(plain(y.text, 140)) + '</a></li>';
          }).join('') + '</ul></details>', '');
      }
    });
    return md.join('\n');
  }

  /* ---------- a link to a box on a lesson page: scroll there once the page has drawn it ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-goto]');
    if (a) try { sessionStorage.setItem('al.goto', a.getAttribute('data-goto')); } catch (x) { /* nothing */ }
  }, true);
  function goTo() {
    var sel;
    try { sel = sessionStorage.getItem('al.goto'); } catch (e) { return; }
    if (!sel) return;
    var tries = 0;
    (function look() {
      var el = null;
      try { el = document.querySelector('.markdown-section ' + sel); } catch (e) { tries = 99; }
      if (el) {
        try { sessionStorage.removeItem('al.goto'); } catch (e) { /* nothing */ }
        var det = el.closest('details');
        if (det) det.open = true;
        el.scrollIntoView({ block: 'center' });
        el.classList.add('mx-flash');
        setTimeout(function () { el.classList.remove('mx-flash'); }, 2200);
      } else if (++tries < 30) setTimeout(look, 150);
      else try { sessionStorage.removeItem('al.goto'); } catch (e) { /* nothing */ }
    })();
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.beforeEach(function (content, next) {
      if (!/```mistakes\s*\n/.test(content)) return next(content);
      var ru = isRu() ? 'ru/' : '';
      Promise.all([getJson(ru + 'review.json'), getJson(ru + 'tasks.json')]).then(function (b) {
        var gen = b[0] && b[1] && b[0].days && b[1].days ? write(b[0], b[1])
          : '<div class="mx-sum">' + T('The list could not be loaded. Check the connection and refresh the page.',
            'Список не загрузился. Проверьте соединение и обновите страницу.') + '</div>';
        next(content.replace(/```mistakes\s*\n[\s\S]*?\n```/, function () { return gen; }));
      });
    });
    hook.doneEach(function () { setTimeout(goTo, 0); });
  });
})();
