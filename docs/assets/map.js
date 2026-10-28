/* The course map (Docsify plugin): every week is a level on one path, its Friday checkpoint the "boss".
It draws into <div id="al-map"> on map.md. Weeks and day titles come from _sidebar.md, so the map follows the menu;
finished days and challenges from this browser (quiz.js, challenge.js), checkpoint results from progress.json.
A dimmed week only shows where she is on the path; with the calendar on (schedule.js) the days not open yet are left out. */
(function () {
  var ICON = {
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0zM7 6H4v2a3 3 0 003 3M17 6h3v2a3 3 0 01-3 3"/>',
    star: '<path d="M12 2l3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13"/><path d="M12 8C10 4 6 4 6 6.5S12 8 12 8s6 1 6-1.5S14 4 12 8"/>',
    pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>'
  };
  function icon(name, size) {
    return '<svg class="al-icon" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[name] + '</svg>';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  function T(en, ru) { return window.ALLang ? window.ALLang.t(en, ru) : en; }

  /* "- **Week 2 — SQL for analysts**" followed by "  - [Day 1: joining tables](weeks/week-02/day-1.md)" lines;
     the Russian menu (ru/_sidebar.md) has "- **Неделя 2 — …**" and "[День 1: …](ru/weeks/week-02/day-1.md)" */
  function parseSidebar(md) {
    var weeks = [], cur = null;
    md.split('\n').forEach(function (line) {
      var w = line.match(/^- \*\*(?:Week|Неделя) (\d+) — (.+?)\*\*/);
      if (w) { cur = { n: Number(w[1]), title: w[2], days: [] }; weeks.push(cur); return; }
      var d = cur && line.match(/^\s+- \[(.+?)\]\(\/?(?:ru\/)?(weeks\/week-(\d\d)\/day-(\d)\.md)\)/);
      if (d) cur.days.push({ title: d[1].replace(/^(?:Day|День) \d+:\s*/, ''), href: window.ALLang ? window.ALLang.link('#/' + d[2].replace(/\.md$/, '')) : '#/' + d[2].replace(/\.md$/, ''),
        id: 'w' + d[3] + 'd' + d[4], d: Number(d[4]) });
    });
    return weeks;
  }

  function render() {
    var el = document.getElementById('al-map');
    if (!el || el.getAttribute('data-done')) return;
    el.setAttribute('data-done', '1');
    Promise.all([
      fetch(window.ALLang ? window.ALLang.file('_sidebar.md') : '_sidebar.md', { cache: 'no-store' }).then(function (x) { return x.text(); }),
      fetch('progress.json', { cache: 'no-store' }).then(function (x) { return x.json(); }),
      window.ALSched ? window.ALSched.ready : null
    ]).then(function (res) {
      var weeks = parseSidebar(res[0]), p = res[1], by = {}, S = window.ALSched;
      /* the calendar (schedule.js): days not open yet are left out; the next week shows only as a locked level with its date */
      if (S && S.on()) {
        var teaser = false;
        weeks = weeks.filter(function (wk) {
          var all = wk.days, sid = function (d) { return S.idOf(d.href); };
          wk.days = all.filter(function (d) { return S.state(sid(d)) !== 'soon'; });
          if (wk.days.length) return true;
          if (teaser || !all.length) return false;
          teaser = true;
          wk.opens = S.opens(sid(all[0]));
          return true;
        });
      }
      p.items.forEach(function (it) { by[it.id] = it; });
      var quizzes = window.ALQuiz ? window.ALQuiz.state().quizzes : {};
      var chal = window.ALChallenge ? window.ALChallenge.state() : { challenges: {}, lucky: {} };
      var hereSet = false, html = '<div class="map">';

      weeks.forEach(function (wk, i) {
        var done = wk.days.filter(function (d) { return quizzes[d.id] && quizzes[d.id].passedOn; }).length;
        var cp = by['cp' + wk.n] || (wk.n === 8 ? by.capstone : null);
        var cpPct = cp && cp.earned != null ? 100 * cp.earned / cp.max : null;
        if (wk.opens) {   // the next week, not open yet: its level and the day it opens, nothing more
          html += '<div class="mweek ahead"><div class="mnode">' + icon('lock', 22) + '</div><div class="mcard"><div class="mhead"><span class="mlevel">' +
            T('Level ', 'Уровень ') + wk.n + '</span><span class="mtitle">' + T('Opens ', 'Откроется ') + esc(S.nice(wk.opens)) + T(' at 00:00', ' в 00:00') + '</span></div></div></div>';
          return;
        }
        var cleared = done === wk.days.length && (wk.n === 0 || (cpPct != null && cpPct >= 70));
        var state = cleared ? 'cleared' : hereSet ? 'ahead' : 'here';
        var dots = wk.days.map(function (d) {
          var q = quizzes[d.id], c = chal.challenges[d.id], isHere = false;
          if (state === 'here' && !hereSet && !(q && q.passedOn)) { isHere = true; hereSet = true; }
          var lucky = chal.lucky && chal.lucky[d.id];
          var boss = wk.n > 0 && d.d === 5;
          var cls = 'mday' + (q && q.passedOn ? ' done' : '') + (isHere ? ' here' : '') + (boss ? ' boss' : '');
          return '<a class="' + cls + '" href="' + d.href + '" title="' + esc(d.title) + '">' +
            '<span class="mdot">' + (q && q.passedOn ? icon('check', 18) : isHere ? icon('pin', 18) : boss ? icon('trophy', 18) : d.d) + '</span>' +
            '<span class="mday-name">' + (boss ? T('Boss: ', 'Босс: ') : '') + esc(d.title) + '</span>' +
            (c && c.solvedOn ? '<span class="mtag star" title="' + T('Daily challenge solved', 'Задача дня решена') + '">' + icon('star', 14) + '</span>' : '') +
            (lucky ? '<span class="mtag gift" title="' + T('A lucky day you found', 'Найденный вами счастливый день') + '">' + icon('gift', 14) + '</span>' : '') +
            (isHere ? '<span class="mhere">' + T('You are here', 'Вы здесь') + '</span>' : '') + '</a>';
        }).join('');
        if (state === 'here' && !hereSet) hereSet = true;  // all days done, only the boss is left
        var reward = '';
        if (cp && wk.n > 0) {
          reward = cpPct == null ? '<span class="mreward">' + T('Beat the boss (70 %+) to win a voucher', 'Победите босса (70 %+), чтобы выиграть ваучер') + '</span>'
            : cpPct >= 70 ? '<span class="mreward won">' + icon('trophy', 16) + T(' Boss beaten · ', ' Босс побеждён · ') + Math.round(cpPct) + ' %</span>'
            : '<span class="mreward missed">' + T('Boss: ' + Math.round(cpPct) + ' % — try the next one', 'Босс: ' + Math.round(cpPct) + ' % — попробуйте следующего') + '</span>';
        }
        html += '<div class="mweek ' + state + '">' +
          '<div class="mnode">' + (state === 'cleared' ? icon('flag', 26) : state === 'ahead' ? icon('lock', 22) : '<b>' + wk.n + '</b>') + '</div>' +
          '<div class="mcard"><div class="mhead"><span class="mlevel">' + T('Level ', 'Уровень ') + wk.n + '</span><span class="mtitle">' + esc(wk.title) + '</span>' +
          '<span class="mcount">' + done + ' / ' + wk.days.length + '</span></div>' +
          '<div class="mdays">' + dots + '</div>' + reward + '</div></div>';
        if (i < weeks.length - 1) html += '<div class="mpath ' + (state === 'cleared' ? 'cleared' : '') + '"></div>';
      });
      html += '</div>';
      el.innerHTML = html;
    }).catch(function (e) {
      el.innerHTML = '<p>' + T('The map could not load', 'Не удалось загрузить карту') + ' (' + esc(e.message) + '). ' +
        T('Open the course through its web address, not as a file.', 'Откройте курс по его веб-адресу, а не как файл.') + '</p>';
    });
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(render);
  });
})();
