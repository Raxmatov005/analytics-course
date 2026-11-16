/* The course calendar (Docsify plugin; the founder, 2026-10-28): one lesson opens each study day at 00:00 Tashkent time
and its homework is due at 23:59 on its due day (the same day, unless schedule.json's "due" names a later lesson). Lessons that have not opened yet are out of sight: gone from the menu, the
home page's plan, the course map, search and Previous/Next, and an old link to one shows only when it opens.
schedule.json says the days (its "_about" explains the fields); with no "start" nothing is locked. The bot (worker.js)
walks the same calendar and is the real lock: it refuses a hand-in for a lesson not open yet, and its /reopen gives one
homework a later due day, which GET /reopened tells this page. Dates are Tashkent dates (UTC+5) whatever her device's time zone.
?preview=1 (on any page) shows every lesson in this browser, for the mentor; ?preview=0 ends it.
Several learners (2026-11-13): the calendar is the signed-in learner's — schedule.json's "learners" entry for their name
(as the bot writes it: lower case) over the top level; GET /reopened?key= names the learner of this browser's key, and
without an answer the name signed in here (al.who) decides. Not signed in: the top level.
Progress opens lessons, nothing closes (the founder, 2026-11-16): a lesson is complete when its day quiz is passed
(quiz.js, al.v1) and its homework handed in, if it has one (the bot's answer: handed, handin; kept in al.hand for a visit
without the bot); a lesson opens on its day, or earlier once every lesson before it in "order" is complete (its due
day stays the calendar's); past its due day a homework stays open and a hand-in counts as late. A lesson whose day (or
early opening) is over and that is not complete shows "Not completed" with what is missing: on its page, in the menu,
on the course map (map.js) and in the catch-up plan. Signed in only (whose progress it is must be known).
window.ALSched: ready (a promise), on(), studyDay(iso) (true / false, null with no schedule), state(id) "soon" | "open" | "late", opens(id), lastDay(id), nice(iso),
idOf(href), weekOpen(n), early(id), complete(id), notDone(id) (null, or what is missing), missingText(id), daysLate(id).
Lesson ids as in the bot: W1D2 for weeks/week-01/day-2. */
(function () {
  var WORKER = 'https://nur-feedback-bot.sohajon2005.workers.dev', PREVIEW = 'al.preview', HAND = 'al.hand';
  var dates = null, due = {}, reopen = {}, who = '', raw = null;   // who: whose calendar ('' = the top level); raw: schedule.json as read
  var hand = null, early = {};   // hand: {handed: {lesson: day}, handin: {lesson: "HW 1.2"}, early: {…}} from the bot; early: opened before their day
  function T(en, ru) { return window.ALLang ? window.ALLang.t(en, ru) : en; }
  function ls(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* private mode */ }
    return null;
  }
  var q = /[?&]preview=([01])/.exec(location.hash);
  if (q) ls(PREVIEW, q[1] === '1' ? '1' : null);
  if (q && q[1] === '0' && ls('al.mentor') === '1') { ls('al.mentor', null); ls('al.who', null); }   // the mentor signs out
  var preview = ls(PREVIEW) === '1';

  function dayAfter(iso, n) { return new Date(Date.parse(iso + 'T12:00:00Z') + n * 86400000).toISOString().slice(0, 10); }
  function today() { return new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10); }
  /* the same walk as worker.js lessonDates */
  var file = null;   // schedule.json as read
  /* a day with a lesson: Monday to Friday, or every day with "weekends": true; never an "off" day */
  function study(iso) {
    var w = new Date(iso + 'T12:00:00Z').getUTCDay();
    return (file && file.weekends || (w !== 0 && w !== 6)) && !(file && (file.off || []).indexOf(iso) >= 0);
  }
  function walk(s) {
    if (!s || !s.start || !s.order) return null;
    var fixed = s.dates || {}, together = s['with'] || {}, out = {}, d = s.start;
    while (!study(d)) d = dayAfter(d, 1);
    s.order.forEach(function (id) {
      if (fixed[id]) { out[id] = fixed[id]; return; }
      if (together[id] && out[together[id]]) { out[id] = out[together[id]]; return; }   // a Day 6 exam opens with its Day 5
      out[id] = d;
      do d = dayAfter(d, 1); while (!study(d));
    });
    return out;
  }
  function on() { return !!dates && !preview; }
  function lastDay(id) {   // its due day: its lesson's day, or the later lesson's it is due on ("due", or a date there), or the mentor's reopen date
    var own = dates[due[id]] || (/^\d{4}-\d\d-\d\d$/.test(due[id] || '') ? due[id] : null) || dates[id];
    return reopen[id] && reopen[id] > (own || '') ? reopen[id] : own;
  }
  function state(id) {
    if (!on() || !id || !dates[id]) return 'open';
    var t = today();
    return t < dates[id] && !early[id] ? 'soon' : t > lastDay(id) ? 'late' : 'open';
  }
  function daysLate(id) {
    if (!on() || !dates[id]) return 0;
    var t = today(), d = lastDay(id);
    return t > d ? Math.round((Date.parse(t) - Date.parse(d)) / 86400000) : 0;
  }
  function nice(iso) {
    var d = new Date(iso + 'T12:00:00Z'), ru = window.ALLang && window.ALLang.isRu();
    return ru ? d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long', timeZone: 'UTC' })
      : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
  }
  function idOf(href) {
    var m = /(?:^|\/)weeks\/week-(\d\d)\/day-(\d)(?:\.md)?(?:[?#]|$)/.exec(href || '');
    return m ? 'W' + Number(m[1]) + 'D' + m[2] : null;
  }
  function weekOpen(n) {
    if (!on()) return true;
    for (var d = 0; d <= 6; d++) if (dates['W' + n + 'D' + d] && state('W' + n + 'D' + d) !== 'soon') return true;
    return false;
  }
  function next() {   // the next lesson to open on its day (one opened early is open already)
    var t = today(), best = null;
    Object.keys(dates || {}).forEach(function (id) { if (dates[id] > t && !early[id] && (!best || dates[id] < dates[best])) best = id; });
    return best;
  }
  function current() {   // the latest lesson that has opened on its day
    var t = today(), best = null;
    Object.keys(dates || {}).forEach(function (id) { if (dates[id] <= t && (!best || dates[id] > dates[best])) best = id; });
    return best;
  }
  function pathOf(id) {
    var m = /^W(\d+)D(\d)$/.exec(id);
    return 'weeks/week-' + (m[1].length < 2 ? '0' : '') + m[1] + '/day-' + m[2];
  }
  var LOCK = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" ' +
    'stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>';
  var CLOCK = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" ' +
    'stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';

  /* whose browser this is: the key from the bot's ?wk= link (sqlrun.js stores it a moment later) or the one signed in */
  function norm(s) { return String(s || '').trim().toLowerCase().replace(/\s+/g, ' '); }
  function siteKey() { var m = /[?&]wk=([A-Za-z0-9]{16,64})/.exec(location.search); return m ? m[1] : ls('al.wk'); }
  function signedIn() { return siteKey() ? norm(ls('al.who')) : ''; }
  function hasOwn(name) { return !!(name && raw && raw.learners && raw.learners[name]); }
  /* one learner's calendar: the top level with their own "learners" fields over it (worker.js scheduleOf) */
  function mine(s, name) {
    if (!hasOwn(name)) return s;
    var out = {};
    Object.keys(s).forEach(function (k) { out[k] = s[k]; });
    Object.keys(s.learners[name]).forEach(function (k) { out[k] = s.learners[name][k]; });
    return out;
  }

  /* ---------- complete, opened early, not completed (see the header) ---------- */
  function quizzes() { try { return (JSON.parse(ls('al.v1')) || {}).quizzes || {}; } catch (e) { return {}; } }
  function quizId(id) { var m = /^W(\d+)D(\d)$/.exec(id); return m ? 'w' + (m[1].length < 2 ? '0' : '') + m[1] + 'd' + m[2] : ''; }
  function known() { return !!siteKey() && !!hand && !!hand.handin; }   // whose hand-ins they are is known
  /* what a lesson still needs: [] when complete; "quiz" and / or "hw" (the hand-in only while the bot's list is known) */
  function missing(id, qs) {
    var out = [], r = (qs || quizzes())[quizId(id)];
    if (!(r && r.passedOn)) out.push('quiz');
    if (known() && hand.handin[id] && !hand.handed[id]) out.push('hw');
    return out;
  }
  /* worker.js earlyOpen: walk "order"; while every lesson so far is complete, the next one is open (from the day the
     last one before it was completed). The bot's own view is added: progress from another device it has already seen. */
  function findEarly() {
    var out = {}, t = today(), qs = quizzes(), last = '';
    if (!on() || !known() || !file || !file.order) return out;
    for (var i = 0; i < file.order.length; i++) {
      var id = file.order[i];
      if (dates[id] && dates[id] > t) out[id] = last || t;
      if (missing(id, qs).length) break;
      var r = qs[quizId(id)];
      [r && r.passedOn, hand.handin[id] ? hand.handed[id] : null].forEach(function (d) { if (d && d > last) last = d; });
    }
    Object.keys(hand.early || {}).forEach(function (id) { if (dates[id] && dates[id] > t && !out[id]) out[id] = hand.early[id]; });
    return out;
  }
  function notDone(id) {
    if (!on() || !siteKey() || !id || !dates[id]) return null;
    var opened = early[id] || dates[id];
    if (!(opened < today())) return null;
    var m = missing(id);
    return m.length ? m : null;
  }
  /* the hand-in's name on this page's language: "HW 1.2", "the Day 0 plan", "Checkpoint 1", "Part B" of an exam */
  function hwName(id, short) {
    var n = (hand && hand.handin && hand.handin[id]) || '', m;
    if (/D6$/.test(id)) return T('Part B', 'часть B');
    if (n === 'Day 0 plan') return short ? T('plan', 'план') : T('the Day 0 plan', 'план Дня 0');
    if ((m = /^Checkpoint (\d+)$/.exec(n))) return short ? T('checkpoint', 'контрольная') : T('Checkpoint ' + m[1], 'контрольная ' + m[1]);
    if (/^Capstone/.test(n)) return short ? T('capstone', 'проект') : T('the capstone', 'итоговый проект');
    return n || T('the homework', 'домашнее задание');
  }
  function missingText(id, short) {
    return (notDone(id) || missing(id)).map(function (x) {
      return x === 'quiz' ? (/D6$/.test(id) ? T('Part A', 'часть A') : short ? T('quiz', 'тест') : T('the day quiz', 'тест дня')) : hwName(id, short);
    }).join(' · ');
  }
  /* the bot's answer (or the copy kept from the last one) and what follows from it */
  function setHand(ans) {
    if (ans && ans.handin) {
      hand = { handed: ans.handed || {}, handin: ans.handin, early: ans.early || {} };
      ls(HAND, JSON.stringify(hand));
    } else if (siteKey()) {
      try { hand = JSON.parse(ls(HAND)); } catch (e) { hand = null; }
      if (hand && !hand.handin) hand = null;
    }
  }
  var ready = Promise.all([
    fetch('schedule.json?t=' + Math.floor(Date.now() / 60000), { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
    new Promise(function (res) {   // the mentor's reopened homework (and whose it is); the page does not wait long for it
      var done = false, t = setTimeout(function () { if (!done) { done = true; res(null); } }, 3000), k = siteKey();
      fetch(WORKER + '/reopened' + (k ? '?key=' + encodeURIComponent(k) : ''), { cache: 'no-store' }).then(function (r) { return r.json(); })
        .then(function (j) { if (!done) { done = true; clearTimeout(t); res(j || {}); } })
        .catch(function () { if (!done) { done = true; clearTimeout(t); res(null); } });
    })
  ]).then(function (res) {
    var ans = res[1];
    raw = res[0];
    who = ans ? ans.learner || '' : signedIn();   // no answer from the bot: the name signed in here
    file = mine(raw, who); dates = walk(file); due = (file && file.due) || {}; reopen = (ans && ans.reopen) || {};
    setHand(ans);
    early = findEarly();
  });
  /* someone else signs in here (or signs out): a different calendar needs the page drawn again */
  document.addEventListener('al-signin', function () {
    ready.then(function () { var n = signedIn(); if (n !== who && (hasOwn(n) || hasOwn(who))) location.reload(); });
  });
  /* a quiz passed (quiz.js) or a homework sent (sqlrun.js): the next lesson may open now, a "Not completed" may go */
  function refresh() {
    ready.then(function () {
      var was = JSON.stringify(early);
      early = findEarly();
      var id = idOf(location.hash);
      if (JSON.stringify(early) !== was && id && state(id) === 'soon') { location.reload(); return; }
      lessonNotes(id);
      sweep();
    });
  }
  document.addEventListener('al:change', refresh);
  document.addEventListener('al-handin', function (e) {
    ready.then(function () {
      var id = e && e.detail && e.detail.lesson;
      if (hand && id) { hand.handed[id] = hand.handed[id] || today(); ls(HAND, JSON.stringify(hand)); }
      refresh();
    });
  });

  window.ALSched = { ready: ready, on: on, state: state, opens: function (id) { return dates && dates[id]; }, lastDay: lastDay,
    nice: nice, idOf: idOf, weekOpen: weekOpen, today: today, daysLate: daysLate,
    early: function (id) { return !!early[id]; }, known: known,
    complete: function (id) { return !missing(id).length; }, notDone: notDone, missingText: missingText,
    studyDay: function (iso) { return on() ? study(iso) : null; } };

  /* ---------- a lesson that has not opened: only when it opens ---------- */
  function lockedPage(id) {
    var cur = current(), link = cur ? (window.ALLang ? window.ALLang.link('#/' + pathOf(cur)) : '#/' + pathOf(cur)) : null;
    return '<div class="sch-lock"><span class="sch-lock-ico">' + LOCK + '</span>' +
      '<h1>' + T('Opens ', 'Откроется ') + nice(dates[id]) + T(' at 00:00', ' в 00:00') + '</h1>' +
      '<p>' + T('One lesson opens each study day' + (file && file.weekends ? '' : ', Monday to Friday,') + ' at 00:00 (Tashkent time) — or sooner, as soon as every lesson before it is complete: its day quiz passed and its homework handed in. Each homework is due at 23:59 on its due day; after that it stays open and counts as late.',
        'Каждый учебный день' + (file && file.weekends ? '' : ', с понедельника по пятницу,') + ' в 00:00 (по Ташкенту) открывается один урок — или раньше, как только завершены все уроки до него: тест дня пройден, домашнее задание сдано. Каждое домашнее задание нужно сдать до 23:59 дня, когда его срок; после этого оно остаётся открытым, но считается сданным с опозданием.') + '</p>' +
      (link ? '<p><a class="sch-go" href="' + link + '">' + T('Go to today’s lesson →', 'К сегодняшнему уроку →') + '</a></p>' : '') + '</div>';
  }

  /* ---------- everything that points at a lesson not open yet goes out of sight; "Not completed" in the menu ---------- */
  function sweep() {
    frame = 0;
    if (!on()) { document.body.classList.remove('sch-wait'); return; }
    // what this sweep hid before comes back first (a lesson may have opened early since)
    Array.prototype.forEach.call(document.querySelectorAll('.sch-sw'), function (el) { el.classList.remove('sch-hide', 'sch-sw'); });
    var hidden = 0, home = /^#\/(?:ru\/?)?(?:\?|$)/.test(location.hash || '#/') || !location.hash;
    function hide(el) { if (el && !el.classList.contains('sch-hide')) el.classList.add('sch-hide', 'sch-sw'); }
    Array.prototype.forEach.call(document.querySelectorAll('a[href*="weeks/week-"]'), function (a) {
      var id = idOf(a.getAttribute('href'));
      if (!id) return;
      if (a.closest('.sidebar-nav') && !/[?&]id=/.test(a.getAttribute('href'))) menuMark(a, id);
      if (state(id) !== 'soon') return;
      hide(a.closest('.sidebar-nav li, .pagination-item, .matching-post, .gx, .map-day') ||
        (home && a.closest('.markdown-section tr, .markdown-section li')));
      if (a.closest('.sidebar-nav')) hidden++;
    });
    // a week in the menu with no lesson left; a plan table on the home page with no row left, and its heading
    Array.prototype.forEach.call(document.querySelectorAll('.sidebar-nav > ul > li'), function (li) {
      var days = li.querySelectorAll('li');
      if (days.length && li.querySelectorAll('li:not(.sch-hide)').length === 0) hide(li);
    });
    if (home) Array.prototype.forEach.call(document.querySelectorAll('.markdown-section table'), function (t) {
      var rows = t.querySelectorAll('tbody tr');
      if (rows.length && t.querySelectorAll('tbody tr:not(.sch-hide)').length === 0) {
        hide(t);
        var h = t.previousElementSibling;
        if (h && /^H[23]$/.test(h.tagName)) hide(h);
      }
    });
    // a locked page shows its card and nothing the other plugins add (the feedback card, the day's challenge …)
    var lock = document.querySelector('.markdown-section .sch-lock');
    if (lock) {
      Array.prototype.forEach.call(lock.parentNode.children, function (el) { if (el !== lock) el.classList.add('sch-hide'); });
      var tt = lock.querySelector('h1').textContent;
      if (document.title !== tt) document.title = tt;   // Docsify names the tab after the lesson
    }
    // the page's own headings in the menu, when the heading itself went out of sight
    Array.prototype.forEach.call(document.querySelectorAll('.sidebar-nav .app-sub-sidebar a[href*="id="]'), function (a) {
      var m = /[?&]id=([^&]+)/.exec(a.getAttribute('href')), h = m && document.getElementById(decodeURIComponent(m[1]));
      if (h && h.classList.contains('sch-hide')) hide(a.parentNode);
    });
    var ul = document.querySelector('.sidebar-nav > ul'), nx = next(), old = ul && ul.querySelector('.sch-next');
    var text = hidden && nx ? T('Next lesson opens ', 'Следующий урок откроется ') + nice(dates[nx]) + T(', 00:00', ', 00:00') : '';
    if (old && old.textContent !== text) { old.remove(); old = null; }
    if (ul && text && !old) {
      var li = document.createElement('li');
      li.className = 'sch-next';
      li.innerHTML = LOCK + '<span>' + text + '</span>';
      ul.appendChild(li);
    }
    document.body.classList.remove('sch-wait');
  }
  /* a lesson in the menu that is not completed: a small "Not completed · quiz · HW 1.2" line under its name (labs.css draws
     it from data-nd; attributes only, so the page's observer is not woken) */
  function menuMark(a, id) {
    var nd = notDone(id), v = nd ? T('Not completed', 'Не завершён') + ' · ' + missingText(id, true) : '';
    if ((a.getAttribute('data-nd') || '') === v) return;
    if (v) a.setAttribute('data-nd', v); else a.removeAttribute('data-nd');   // (no title: Docsify names the tab after the link's title)
    a.classList.toggle('sch-nd', !!v);
  }
  var frame = 0;
  function soon() { if (!frame) frame = requestAnimationFrame(sweep); }

  /* ---------- an open lesson: the homework badge shows the real day; one not completed says what is left at the top ---------- */
  function lessonNotes(id) {
    var sec = document.querySelector('.markdown-section'), old = sec && sec.querySelector('.sch-note');
    if (!sec || !id || !on() || !dates[id] || sec.querySelector('.sch-lock')) return;
    Array.prototype.forEach.call(sec.querySelectorAll('.badge.hw'), function (b) {
      var m = /^(.*?)\s+—\s+(?:Due\b|срок:)/.exec(b.textContent);   // (\b after a Cyrillic word never matched: the Russian badge kept "День 4")
      if (m) b.textContent = m[1] + T(' — Due ', ' — срок: ') + nice(lastDay(id)) + ', 23:59';
    });
    var nd = notDone(id), html = '';
    if (nd) {
      var hw = nd.indexOf('hw') >= 0, n = daysLate(id), name = hwName(id);
      html = CLOCK + '<span><b>' + T('Not completed.', 'Урок не завершён.') + '</b> ' + T('Still to do: ', 'Осталось: ') + missingText(id) + '. ' +
        (hw && n ? T(name.charAt(0).toUpperCase() + name.slice(1) + ' was due ' + nice(lastDay(id)) + ' at 23:59 — it is still open: hand it in below, it now counts as late.',
            'Срок сдачи (' + name + ') был ' + nice(lastDay(id)) + ' в 23:59 — сдать всё ещё можно, ниже на странице; теперь это считается опозданием.')
          : hw ? T(name.charAt(0).toUpperCase() + name.slice(1) + ' is due ' + nice(lastDay(id)) + ' at 23:59.', 'Срок сдачи (' + name + '): ' + nice(lastDay(id)) + ', 23:59.')
          : T('The day quiz is at the end of this page.', 'Тест дня — в конце этой страницы.')) + '</span>';
    }
    if (old && old.innerHTML === html) return;
    if (old) old.remove();
    if (!html) return;
    var box = document.createElement('div');
    box.className = 'sch-note sch-nd-note';
    box.innerHTML = html;
    var h1 = sec.querySelector('h1');
    if (h1) h1.parentNode.insertBefore(box, h1.nextSibling); else sec.insertBefore(box, sec.firstChild);
  }
  /* ---------- behind by two lessons or more: the shortest way back, on the home page and every lesson page (the founder,
     2026-11-02: "a catch-up mode"). The lessons are the "Not completed" ones (see the header), oldest first, each with
     what is left. Hidden for the day with its button. ---------- */
  var CATCH = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" ' +
    'stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7v5l3 2"/></svg>';
  function behind() {
    if (!on() || !file || !file.order) return [];
    return file.order.filter(function (id) { return !!notDone(id); });
  }
  function catchUp(vm) {
    var sec = document.querySelector('.markdown-section'), old = sec && sec.querySelector('.sch-catch');
    if (old) old.remove();
    var path = vm.route.path || '/', id = idOf(path), home = /^\/(ru\/?)?$/.test(path) || /^\/(ru\/)?README$/.test(path);
    if (!sec || (!id && !home) || ls('al.catchup.hide') === today()) return;
    var late = behind();
    if (late.length < 2) return;
    var link = function (x) { var h = '#/' + pathOf(x); return window.ALLang ? window.ALLang.link(h) : h; };
    var name = function (x) {
      var m = /^W(\d+)D(\d)$/.exec(x);
      return m[1] === '0' ? T('Day 0', 'День 0') : m[2] === '6' ? T('Week ' + m[1] + ' · Exam', 'Неделя ' + m[1] + ' · Экзамен')
        : T('Week ' + m[1] + ' · Day ' + m[2], 'Неделя ' + m[1] + ' · День ' + m[2]);
    };
    var steps = late.slice(0, 3).map(function (x) {
      return '<li><a href="' + link(x) + '">' + name(x) + '</a>: ' + missingText(x) + '</li>';
    }).join('') + (late.length > 3 ? '<li>' + T('…then the next ones, one at a time', '…потом следующие, по одному') + '</li>' : '');
    var n = document.createElement('div');
    n.className = 'sch-catch';
    n.innerHTML = '<span class="sch-catch-ico">' + CATCH + '</span><div class="sch-catch-body"><div class="sch-catch-t">' +
      T('Catch-up plan: ' + late.length + ' lessons to finish', 'План, чтобы догнать: ' + late.length + ' урок' + (late.length < 5 ? 'а' : 'ов') + ' не закончено') + '</div>' +
      '<p>' + T('That is fine: all of it is still open. Here is the shortest way back, oldest first:', 'Ничего страшного: всё это по-прежнему открыто. Вот самый короткий путь, начиная с самого раннего:') + '</p><ol>' + steps + '</ol>' +
      '<p class="sch-catch-s">' + T('"Going further" and the daily challenge can wait until you are back on track.', '«Дальше по теме» и задача дня подождут, пока вы не догоните.') + '</p>' +
      '<button type="button" class="sch-catch-x">' + T('Hide for today', 'Скрыть до завтра') + '</button></div>';
    n.querySelector('.sch-catch-x').onclick = function () { ls('al.catchup.hide', today()); n.remove(); };
    var h1 = sec.querySelector('h1'), note = sec.querySelector('.sch-note');
    var after = note || h1;
    if (after) after.parentNode.insertBefore(n, after.nextSibling); else sec.insertBefore(n, sec.firstChild);
  }
  function previewBar() {
    if (!preview || document.querySelector('.sch-preview')) return;
    var b = document.createElement('div');
    b.className = 'sch-preview';
    var him = ls('al.mentor') === '1' && ls('al.who');   // signed in with his name + PIN (signin.js)
    var L = function (t) { return '<span class="sch-pv-long">' + t + '</span>'; }, S = function (t) { return '<span class="sch-pv-short">' + t + '</span>'; };
    b.innerHTML = (him   // the long words on a computer, the short ones on a phone (labs.css)
      ? L(T('Signed in as mentor ', 'Вы вошли как ментор ')) + S(T('Mentor ', 'Ментор ')) + '<b></b>' + L(T(': every lesson is shown.', ': видны все уроки.')) + ' · '
      : L(T('Mentor preview: every lesson is shown in this browser.', 'Просмотр ментора: в этом браузере видны все уроки.')) + S(T('Mentor preview', 'Просмотр ментора')) + ' · ') +
      '<a href="#/?preview=0">' + (him ? T('Sign out', 'Выйти') : T('End preview', 'Выйти из просмотра')) + '</a>';
    if (him) b.querySelector('b').textContent = him;
    b.querySelector('a').onclick = function (e) {   // a hash change alone left the preview on until a reload
      e.preventDefault();
      ls(PREVIEW, null);
      if (ls('al.mentor') === '1') { ls('al.mentor', null); ls('al.who', null); }
      location.hash = '#/'; location.reload();
    };
    document.body.appendChild(b);
  }

  document.documentElement.classList.add('sch-wait');
  document.addEventListener('DOMContentLoaded', function () { document.documentElement.classList.remove('sch-wait'); document.body.classList.add('sch-wait'); });
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook, vm) {
    hook.beforeEach(function (content, next) {
      ready.then(function () {
        var id = idOf(vm.route.path);
        next(id && state(id) === 'soon' ? lockedPage(id) : content);
      });
    });
    hook.doneEach(function () {
      ready.then(function () { lessonNotes(idOf(vm.route.path)); catchUp(vm); previewBar(); sweep(); });
    });
    hook.ready(function () {
      ready.then(function () {
        new MutationObserver(soon).observe(document.body, { childList: true, subtree: true });
        sweep();
      });
    });
  });
})();
