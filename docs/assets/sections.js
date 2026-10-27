/* Section frames, today's route and the Previous / Next cards for the Analytics Learning site (Docsify plugin).

On a lesson page (weeks/…/day-N, practice, and their Russian copies under ru/) every "##" section — the h2 and
everything up to the next h2 — is wrapped in a frame. The frame's kind comes from the heading, English or Russian
(a Russian heading also keeps the English id, which is read as well): goals, learn, worked, workspace, practice,
homework, check, company, quiz, challenge, or plain. A frame shows an icon, the heading, one line on what she does
there, the time from "(60 min)" in the heading, and whether it is done.

Done-state contract shared by every engine (task.js, quiz.js, games.js, sqlrun.js, videos.js, pyrun.js, …):
- the root element of every interactive block carries the class "al-block", and "al-done" once she completed it;
- whenever a block's state changes, the engine calls document.dispatchEvent(new CustomEvent('al:change')).
A frame is done when it holds at least one al-block and all of them are al-done; otherwise it shows "3 / 5".

The frames are built after every other plugin has drawn its blocks (a 0 ms timer after doneEach), so the engines
see the page as Docsify rendered it. Wrapping never reorders: the h2 keeps its id and its place in the page, so the
sidebar's section links, nav.js and "?id=" links keep working.

Also here: under the title, "Today's route" (one chip per section, ✓ when done, tap to jump there, "4 of 6 sections
done"); the Previous / Next cards (CSS in theme.css) with a quiet note on Next while the day quiz is not passed; and
the "why / how it is graded" card of a sqltask homework block ("why", "graded" in its JSON). */
(function () {
  function T(en, ru) { return window.ALLang ? window.ALLang.t(en, ru) : en; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  function routePath() { return location.hash.replace(/^#/, '').replace(/\?.*$/, '') || '/'; }
  /* a day page, the practice day, or their Russian copies */
  function isLesson() { return /^\/(ru\/)?(weeks\/week-\d\d\/day-\d+|practice)\/?$/.test(routePath()); }

  /* ---------- the kinds: first match wins (so "Practice quiz" is a quiz, not practice) ---------- */
  var KINDS = [
    { k: 'goals', re: /today in (3|three) lines|сегодня в (3|тр[её]х) строк/i, id: /^today-in-3-lines$/ },
    { k: 'quiz', re: /\b(day|practice) quiz\b|тест дня|пробный тест/i, id: /(^|-)(day|practice)-quiz(-|$)/ },
    { k: 'challenge', re: /daily challenge|задача дня/i, id: /(^|-)daily-challenge(-|$)/ },
    { k: 'check', re: /self-check|quick check|самопроверк|быстрая проверка/i, id: /(^|-)self-check(-|$)/ },
    { k: 'homework', re: /\bhomework\b|домашнее задание/i, id: /(^|-)homework(-|$)/ },
    { k: 'company', re: /company corner|уголок компании/i, id: /(^|-)company-corner(-|$)/ },
    { k: 'worked', re: /worked example|разобранный пример|разбор/i, id: /(^|-)worked-example(-|$)/ },
    { k: 'workspace', re: /\bworkspace\b|рабочее место/i, id: /(^|-)workspace(-|$)/ },
    { k: 'practice', re: /\bpractice\b|практика/i, id: /(^|-)practice(-|$)/ },
    { k: 'learn', re: /\blearn\b|учимся|теория/i, id: /(^|-)learn(-|$)/ }
  ];
  function label(k) {
    return {
      goals: T('Today', 'Сегодня'), learn: T('Learn', 'Теория'), worked: T('Worked example', 'Разбор'),
      workspace: T('Workspace', 'Рабочее место'), practice: T('Practice', 'Практика'), homework: T('Homework', 'Домашнее задание'),
      check: T('Quick check', 'Быстрая проверка'), company: T('Company corner', 'Уголок компании'), quiz: T('Day quiz', 'Тест дня'),
      challenge: T('Daily challenge', 'Задача дня')
    }[k] || '';
  }
  /* what she does in the section, in one line */
  function subtitle(k) {
    return {
      goals: T('What you will be able to do by the end of today.', 'Что вы будете уметь к концу дня.'),
      learn: T('Read, watch and play — the games tell you whether it clicked before you move on.',
        'Читайте, смотрите и играйте — игры покажут, всё ли понятно, прежде чем идти дальше.'),
      worked: T('Follow a real request step by step, the way an analyst solves it at work.',
        'Пройдите реальный запрос шаг за шагом — так, как его решает аналитик на работе.'),
      workspace: T('Get your tools ready and try them once — you use them for the rest of the day.',
        'Подготовьте инструменты и попробуйте их один раз — они понадобятся весь день.'),
      practice: T('Answer each question in its box — the site checks it. The model answer opens only after you try.',
        'Отвечайте на каждый вопрос в его поле — сайт проверит ответ. Образцовый ответ откроется только после вашей попытки.'),
      homework: T('Do it on your own after the lesson and hand it in below. Why it matters and how it is graded come first.',
        'Сделайте самостоятельно после урока и сдайте ниже. Сначала — зачем это нужно и как оценивается.'),
      check: T('A few quick questions to see what stuck. No pass mark — it is just for you.',
        'Несколько коротких вопросов: что запомнилось. Проходного балла нет — это только для вас.'),
      company: T('How today\'s topic is used at a lending company — and how it comes up in interviews.',
        'Как сегодняшняя тема применяется в кредитной компании — и как о ней спрашивают на собеседовании.'),
      quiz: T('Pass it to mark the day done. Retry as often as you like — your best score counts.',
        'Пройдите его, чтобы завершить день. Пересдавать можно сколько угодно — засчитывается лучший результат.'),
      challenge: T('One harder bonus question for extra XP. Optional.', 'Один вопрос посложнее за дополнительный XP. По желанию.')
    }[k] || '';
  }
  var P = {
    goals: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    learn: '<path d="M2 4h6a4 4 0 014 4v13a3 3 0 00-3-3H2z"/><path d="M22 4h-6a4 4 0 00-4 4v13a3 3 0 013-3h7z"/>',
    worked: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/><path d="M8 11h6M11 8v6"/>',
    workspace: '<rect x="2" y="3" width="20" height="18" rx="3"/><path d="M7 9l3 3-3 3"/><path d="M13 15h4"/>',
    practice: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>',
    homework: '<path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 14l2 2 4-4"/>',
    check: '<path d="M22 11.1V12a10 10 0 11-5.9-9.1"/><path d="M22 4L12 14l-3-3"/>',
    company: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>',
    quiz: '<circle cx="12" cy="8" r="6"/><path d="M15.5 12.9L17 22l-5-3-5 3 1.5-9.1"/>',
    challenge: '<path d="M13 2L3 14h9l-1 8 10-12h-9z"/>',
    plain: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
  };
  function icon(k, size) {
    return '<svg width="' + (size || 20) + '" height="' + (size || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[k] || P.plain) + '</svg>';
  }

  /* the heading's own words, without its badges ("Homework Due Day 3" → "Homework") */
  function headText(h) {
    var c = h.cloneNode(true);
    each(c.querySelectorAll('.badge'), function (b) { b.parentNode.removeChild(b); });
    return c.textContent.replace(/\s+/g, ' ').trim();
  }
  function kindOf(h) {
    var t = headText(h), id = h.id || '';
    for (var i = 0; i < KINDS.length; i++) if (KINDS[i].re.test(t) || KINDS[i].id.test(id)) return KINDS[i].k;
    return 'plain';
  }
  /* a short name for the route chip of a plain section: "Step 1 — run your first query" → "Step 1" */
  function shortName(t) {
    t = t.replace(/^\d+\.\s*/, '').replace(/\s*\([^)]*\)\s*/g, ' ').trim();
    var cut = t.split(/\s+[—–-]\s+/)[0];
    return cut.length > 26 ? cut.slice(0, 24).replace(/\s+\S*$/, '') + '…' : cut;
  }
  /* "(60 min)" / "(15 мин)" / "(30 min, 20 pts)" in the heading → the time chip; the brackets leave the heading text */
  var TIME = /\s*\((\d[^()]*?(?:min|мин|h\b|ч\b|hours?|час)[^()]*)\)/i;
  function takeTime(h) {
    var found = null, walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT, null, false), n;
    while ((n = walker.nextNode())) {
      if (n.parentNode.closest && n.parentNode.closest('.badge')) continue;
      var m = TIME.exec(n.nodeValue);
      if (m) { found = m[1].trim(); n.nodeValue = n.nodeValue.replace(m[0], ''); break; }
    }
    return found;
  }

  /* ---------- frames ---------- */
  function isStop(el) {
    return el.nodeType === 1 && (el.tagName === 'H2' || el.classList.contains('docsify-pagination-container') || el.classList.contains('fb-card'));
  }
  function frame(sec, h) {
    var kind = kindOf(h), name = headText(h), time = takeTime(h);
    var box = document.createElement('section');
    box.className = 'al-sec al-k-' + kind;
    box.setAttribute('data-kind', kind);
    box.setAttribute('data-name', kind === 'plain' ? shortName(name) : label(kind));
    sec.insertBefore(box, h);
    var head = document.createElement('div'), body = document.createElement('div');
    head.className = 'al-sec-head';
    body.className = 'al-sec-body';
    head.innerHTML = '<span class="al-sec-ico">' + icon(kind) + '</span><div class="al-sec-hd">' +
      (kind !== 'plain' || time ? '<div class="al-sec-kick">' + (kind !== 'plain' ? '<span>' + esc(label(kind)) + '</span>' : '') +
        (time ? '<span class="al-sec-time">' + icon('clock', 13) + esc(time) + '</span>' : '') + '</div>' : '') +
      '</div><span class="al-sec-state" aria-live="polite"></span>';
    var hd = head.querySelector('.al-sec-hd');
    box.appendChild(head);
    box.appendChild(body);
    /* move, in order: the heading into the head, then everything up to the next section into the body */
    var n = box.nextSibling;
    hd.appendChild(h);
    if (subtitle(kind)) hd.insertAdjacentHTML('beforeend', '<p class="al-sec-sub">' + esc(subtitle(kind)) + '</p>');
    n = box.nextSibling;
    while (n && !isStop(n)) { var next = n.nextSibling; body.appendChild(n); n = next; }
    /* the "---" between sections is the frame's job now */
    var last = body.lastElementChild;
    if (last && last.tagName === 'HR') last.classList.add('al-sec-hr');
    return box;
  }

  /* the old Practice pattern (question paragraph, her query box, "Answer" fold) becomes one quiet card */
  function questionCards(sec) {
    each(sec.querySelectorAll('.al-sec-body > details'), function (det) {
      var sum = det.querySelector('summary');
      if (!sum || !/^\s*(answer|ответ)/i.test(sum.textContent) || det.parentNode.classList.contains('al-q')) return;
      var parts = [det], p = det.previousElementSibling;
      if (p && p.classList.contains('sq-prac')) { parts.unshift(p); p = p.previousElementSibling; }
      if (!p || p.tagName !== 'P' || !p.querySelector('strong')) return;
      parts.unshift(p);
      var card = document.createElement('div');
      card.className = 'al-q';
      p.parentNode.insertBefore(card, p);
      parts.forEach(function (x) { card.appendChild(x); });
    });
  }

  /* ---------- today's route ---------- */
  function route(sec, frames) {
    var h1 = sec.querySelector('h1');
    if (!h1 || !frames.length) return;
    var after = h1, nx = h1.nextElementSibling;
    if (nx && nx.tagName === 'P' && nx.querySelector('.badge')) after = nx;   // the title's badge line
    var nav = document.createElement('nav');
    nav.className = 'al-route';
    nav.setAttribute('aria-label', T('Today\'s route', 'Маршрут дня'));
    nav.innerHTML = '<div class="al-route-top"><span class="al-route-title">' + T('Today\'s route', 'Маршрут дня') + '</span>' +
      '<span class="al-route-prog"></span></div><div class="al-route-bar"><span></span></div><div class="al-route-chips">' +
      frames.map(function (f, i) {
        var k = f.getAttribute('data-kind');
        return '<button type="button" class="al-chip al-k-' + k + '" data-i="' + i + '"><span class="al-chip-ico">' + icon(k, 15) + '</span>' +
          '<span class="al-chip-t">' + esc(f.getAttribute('data-name')) + '</span><span class="al-chip-ok" aria-hidden="true">✓</span></button>';
      }).join('') + '</div>';
    after.parentNode.insertBefore(nav, after.nextSibling);
    nav.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.al-chip');
      if (!b) return;
      var f = document.querySelectorAll('.markdown-section .al-sec')[Number(b.getAttribute('data-i'))];
      if (f) f.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ---------- done-states: recomputed on every al:change ---------- */
  function topBlocks(f) {
    return Array.prototype.filter.call(f.querySelectorAll('.al-block'), function (b) {
      var up = b.parentElement && b.parentElement.closest('.al-block');
      return !up || !f.contains(up);   // a block inside another block counts once, through its parent
    });
  }
  function quizId() {
    var q = document.querySelector('.markdown-section .qz[data-quiz]');
    return q ? q.getAttribute('data-quiz') : null;
  }
  function refresh() {
    var sec = document.querySelector('.markdown-section');
    if (!sec) return;
    var frames = sec.querySelectorAll('.al-sec'), tracked = 0, finished = 0;
    each(frames, function (f, i) {
      var bl = topBlocks(f), done = bl.filter(function (b) { return b.classList.contains('al-done'); }).length;
      var all = bl.length > 0 && done === bl.length, st = f.querySelector('.al-sec-state');
      f.classList.toggle('al-sec-done', all);
      f.classList.toggle('al-sec-track', bl.length > 0);
      if (st) {
        st.textContent = !bl.length ? '' : all ? T('✓ Done', '✓ Готово') : done + ' / ' + bl.length;
        st.title = bl.length ? T(done + ' of ' + bl.length + ' activities done', 'Выполнено ' + done + ' из ' + bl.length) : '';
      }
      if (bl.length) { tracked++; if (all) finished++; }
      var chip = sec.querySelector('.al-chip[data-i="' + i + '"]');
      if (chip) {
        chip.classList.toggle('on', all);
        chip.classList.toggle('al-chip-track', bl.length > 0);
        chip.title = bl.length ? (all ? T('Done', 'Готово') : done + ' / ' + bl.length) : '';
      }
    });
    var prog = sec.querySelector('.al-route-prog'), bar = sec.querySelector('.al-route-bar span');
    if (prog) prog.textContent = tracked ? T(finished + ' of ' + tracked + ' sections done', 'Готово разделов: ' + finished + ' из ' + tracked) : '';
    if (bar) bar.style.width = (tracked ? Math.round(100 * finished / tracked) : 0) + '%';
    pager();
  }
  var pending = 0;
  document.addEventListener('al:change', function () {
    if (!pending) pending = setTimeout(function () { pending = 0; refresh(); }, 30);   // a timer, not a frame: it runs in a background tab too
  });

  /* ---------- Previous / Next: a note on Next while the day quiz is not passed (never blocks) ---------- */
  function pager() {
    var next = document.querySelector('.markdown-section .pagination-item--next a');
    if (!next) return;
    var id = quizId(), note = next.querySelector('.al-pg-note');
    var s = window.ALQuiz ? window.ALQuiz.state() : { quizzes: {} };
    var open = !!id && id.indexOf('practice') !== 0 && !(s.quizzes[id] && s.quizzes[id].passedOn);
    if (open && !note) {
      next.insertAdjacentHTML('beforeend', '<div class="al-pg-note">' + T('Finish today\'s quiz to mark the day done', 'Пройдите тест дня, чтобы завершить день') + '</div>');
    } else if (!open && note) note.parentNode.removeChild(note);
  }

  /* ---------- homework (```sqltask): "why" and "how it is graded", drawn before sqlrun.js mounts the box ---------- */
  function homeworkWhy(sec) {
    each(sec.querySelectorAll('pre[data-lang="sqltask"]'), function (pre) {
      if (pre.previousElementSibling && pre.previousElementSibling.classList.contains('al-hw')) return;
      var d;
      try { d = JSON.parse((pre.querySelector('code') || pre).textContent); } catch (e) { return; }
      var graded = Array.isArray(d.graded) ? d.graded : d.graded ? [d.graded] : [];
      if (!d.why && !graded.length) return;
      pre.insertAdjacentHTML('beforebegin', '<div class="al-hw">' +
        (d.why ? '<div class="al-hw-row"><div class="al-hw-k">' + T('Why this homework', 'Зачем это задание') + '</div><p>' + esc(d.why) + '</p></div>' : '') +
        (graded.length ? '<div class="al-hw-row"><div class="al-hw-k">' + T('How it is graded', 'Как оценивается') + '</div><ul>' +
          graded.map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ul></div>' : '') + '</div>');
    });
  }

  function build(force) {
    var sec = document.querySelector('.markdown-section');
    if (!sec || sec.querySelector('.al-sec') || !(force || isLesson())) return;
    var h2s = Array.prototype.filter.call(sec.children, function (e) { return e.tagName === 'H2'; });
    if (!h2s.length) return;
    var frames = h2s.map(function (h) { return frame(sec, h); });
    questionCards(sec);
    route(sec, frames);
    refresh();
    /* Docsify scrolled to "?id=" before the frames existed; the page above it has grown since */
    var m = /[?&]id=([^&]+)/.exec(location.hash), el = m && document.getElementById(decodeURIComponent(m[1]));
    if (el && el.tagName === 'H2' && el.closest('.al-sec')) el.closest('.al-sec').scrollIntoView({ block: 'start' });
  }

  window.ALSections = { refresh: refresh, build: function () { build(true); } };

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(function () {
      /* "why" / "graded" of a homework are drawn by the hand-in box itself (sqlrun.js), so not here */
      setTimeout(function () { build(false); }, 0);
    });
  });
})();
