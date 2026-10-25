/* The progress board: level, XP, real-reward milestones, badges, points by week.
Official numbers come from progress.json (kept by the mentor with scripts/award.py);
finished days, streak and quiz badges come from this browser (quiz.js). Rules and rewards: rewards.json. */
(function () {
  var ICONS = {
    terminal: ['<path d="M4 17l6-5-6-5M12 19h8"/>'],
    search: ['<circle cx="11" cy="11" r="7"/>', '<path d="M21 21l-4.3-4.3"/>'],
    target: ['<circle cx="12" cy="12" r="9"/>', '<circle cx="12" cy="12" r="5"/>', '<circle cx="12" cy="12" r="1"/>'],
    clock: ['<circle cx="12" cy="12" r="9"/>', '<path d="M12 7v5l3 3"/>'],
    zap: ['<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'],
    database: ['<ellipse cx="12" cy="5" rx="8" ry="3"/>', '<path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/>', '<path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>'],
    grid: ['<rect x="3" y="3" width="18" height="18" rx="2"/>', '<path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>'],
    code: ['<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>'],
    bell: ['<path d="M3 20c4 0 5-16 9-16s5 16 9 16"/>', '<path d="M2 20h20"/>'],
    split: ['<path d="M12 21v-9M12 12L5 4M12 12l7-8"/>', '<path d="M5 9V4h5M19 9V4h-5"/>'],
    chart: ['<path d="M4 20V10M10 20V4M16 20v-7M2 20h20"/>'],
    message: ['<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>'],
    briefcase: ['<rect x="2" y="7" width="20" height="14" rx="2"/>', '<path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>'],
    bug: ['<rect x="8" y="6" width="8" height="14" rx="4"/>', '<path d="M3 13h5M16 13h5M4 7l4 3M20 7l-4 3M4 19l4-2M20 19l-4-2"/>'],
    flame: ['<path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-6 6-6 10-1-1-2-2-2-4-2 2-1 5-1 6 0 4 3 7 7 7z"/>'],
    star: ['<path d="M12 2l3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z"/>'],
    check: ['<circle cx="12" cy="12" r="9"/>', '<path d="M8 12l3 3 5-6"/>'],
    gift: ['<rect x="3" y="8" width="18" height="4" rx="1"/>', '<path d="M5 12v9h14v-9M12 8v13"/>', '<path d="M12 8C10 4 6 4 6 6.5S12 8 12 8s6 1 6-1.5S14 4 12 8"/>'],
    lock: ['<rect x="5" y="11" width="14" height="10" rx="2"/>', '<path d="M8 11V7a4 4 0 018 0v4"/>']
  };
  function icon(name, size) {
    var parts = ICONS[name] || ICONS.star;
    return '<svg class="al-icon" width="' + (size || 28) + '" height="' + (size || 28) + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + parts.join('') + '</svg>';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function pct(it) { return it && it.earned != null ? 100 * it.earned / it.max : null; }

  function xpOf(p, r) {
    var xp = 0;
    p.items.forEach(function (it) { if (it.earned != null) xp += it.earned; });
    xp += (p.quizDays || 0) * r.xpPerQuizDay + (p.stretch || 0) * r.xpPerStretch + (p.challengeXp || 0);
    (p.bonus || []).forEach(function (b) { xp += b.points || 0; });
    return xp;
  }
  function levelOf(xp, r) {
    var cur = r.levels[0], next = null;
    r.levels.forEach(function (l, i) { if (xp >= l.from) { cur = l; next = r.levels[i + 1] || null; } });
    return { cur: cur, next: next };
  }
  function autoBadge(rule, p) {
    var by = {}; p.items.forEach(function (it) { by[it.id] = it; });
    if (rule === 'onTimeWeek') {
      for (var w = 1; w <= 8; w++) {
        var hw = p.items.filter(function (it) { return it.week === w && it.kind === 'hw'; });
        if (hw.length && hw.every(function (it) { return it.earned != null && it.onTime === true; })) return true;
      }
      return false;
    }
    if (rule === 'stretch5') return (p.stretch || 0) >= 5;
    if (rule === 'stretch15') return (p.stretch || 0) >= 15;
    if (rule === 'sqlBlock') {
      var cps = ['cp1', 'cp2', 'cp3'].map(function (id) { return pct(by[id]); });
      return cps.every(function (v) { return v != null; }) && (cps[0] + cps[1] + cps[2]) / 3 >= 85;
    }
    if (rule === 'mock40') return by.mock && by.mock.earned != null && by.mock.earned >= 40;
    if (/^cp\d$/.test(rule)) { var v = pct(by[rule]); return v != null && v >= 85; }
    return false;
  }
  function deviceBadge(id) {
    if (!window.ALQuiz) return false;
    var st = window.ALQuiz.state(), s = window.ALQuiz.streak();
    if (id === 'streak-5') return s >= 5;
    if (id === 'streak-10') return s >= 10;
    if (id === 'streak-20') return s >= 20;
    if (/^chal-\d+$/.test(id)) {
      if (!window.ALChallenge) return false;
      var cs = window.ALChallenge.state().challenges, best = 0;
      Object.keys(cs).forEach(function (k) { best = Math.max(best, cs[k].streakAtSolve || 0); });
      return best >= Number(id.slice(5));
    }
    if (id === 'perfect') return Object.keys(st.quizzes).some(function (k) { return st.quizzes[k].best === 100; });
    if (id === 'sweep') {
      for (var w = 1; w <= 8; w++) {
        var all = true;
        for (var d = 1; d <= 5; d++) {
          var q = st.quizzes['w0' + w + 'd' + d];
          if (!q || !q.passedOn) { all = false; break; }
        }
        if (all) return true;
      }
    }
    return false;
  }

  function milestoneRows(r, p, xp) {
    var by = {}; p.items.forEach(function (it) { by[it.id] = it; });
    var given = p.given || {};
    var rows = [];
    r.milestones.forEach(function (m) {
      if (m.repeat === 'checkpoint') {
        var cps = p.items.filter(function (it) { return it.kind === 'checkpoint' && it.id !== 'mock'; });
        var used = 0;  // with "max", only the first N qualifying checkpoints earn the reward
        var chips = cps.map(function (it) {
          var v = pct(it), ok = v != null && v >= m.min && (!m.max || used < m.max), key = m.id + ':' + it.id;
          if (ok) used++;
          var label = it.id === 'capstone' ? 'Capstone' : 'CP' + it.id.slice(2);
          var cls = ok ? (given[key] ? 'chip given' : 'chip reached') : 'chip';
          return '<span class="' + cls + '" title="' + esc(it.title) + (given[key] ? ' — given ' + esc(given[key]) : '') + '">' + label + '</span>';
        }).join('');
        rows.push({ m: m, reached: null, extra: '<div class="chips">' + chips + '</div>' +
          (m.max ? '<div class="ms-progress">' + used + ' / ' + m.max + ' earned</div>' : '') });
      } else if (m.onTimeWeeks) {
        var hw = p.items.filter(function (it) { return it.kind === 'hw' && m.onTimeWeeks.indexOf(it.week) >= 0; });
        var onTime = hw.filter(function (it) { return it.earned != null && it.onTime === true; }).length;
        var late = hw.some(function (it) { return it.onTime === false; });
        rows.push({ m: m, reached: late ? false : (onTime === hw.length ? true : false), given: given[m.id],
          extra: '<div class="ms-progress">' + onTime + ' / ' + hw.length + ' on time' + (late ? ' — one was late, this one is gone' : '') + '</div>' });
      } else if (m.level) {
        var lv = r.levels.filter(function (l) { return l.name === m.level; })[0];
        var ok = lv && xp >= lv.from;
        rows.push({ m: m, reached: ok, given: given[m.id], extra: lv ? '<div class="ms-progress">' + fmt(Math.min(xp, lv.from)) + ' / ' + fmt(lv.from) + ' XP</div>' : '' });
      } else if (m.countCheckpoints) {
        var cc = m.countCheckpoints;
        var hits = p.items.filter(function (it) { var v = pct(it); return it.kind === 'checkpoint' && it.id !== 'mock' && v != null && v >= cc.min; }).length;
        rows.push({ m: m, reached: hits >= cc.count, given: given[m.id],
          extra: '<div class="ms-progress">' + Math.min(hits, cc.count) + ' / ' + cc.count + ' checkpoints at ' + cc.min + ' %+</div>' });
      } else if (m.all) {
        var okAll = m.all.every(function (c) { return by[c.item] && by[c.item].earned != null && by[c.item].earned >= c.min; });
        rows.push({ m: m, reached: okAll, given: given[m.id], extra: '' });
      }
    });
    return rows.map(function (row) {
      var m = row.m;
      var state = row.reached === null ? '' : row.reached ? (row.given ? 'Given on ' + esc(row.given) : 'Reached — collect it from your mentor') : 'Locked';
      return '<div class="ms ' + m.size + (row.reached ? ' on' : '') + '">' +
        '<div class="ms-icon">' + icon(row.reached === false ? 'lock' : 'gift', 26) + '</div>' +
        '<div class="ms-body"><div class="ms-size">' + (m.size === 'grand' ? 'Grand prize' : esc(m.size) + ' reward') + '</div>' +
        '<div class="ms-reward">' + esc(m.reward) + '</div>' +
        '<div class="ms-what">' + esc(m.what) + '</div>' + row.extra +
        (state ? '<div class="ms-state">' + state + '</div>' : '') + '</div></div>';
    }).join('');
  }

  /* the voucher chain: each passed checkpoint is worth `ratio` times the previous one; a fail drops it back */
  function chainOf(r, p) {
    var c = r.chain, by = {}, step = 0, rows = [], earned = 0, nextShown = false;
    p.items.forEach(function (it) { by[it.id] = it; });
    var fullWeeks = p.challengeWeeks || [], ahead = 0;
    c.order.forEach(function (o) {
      var it = by[o[0]], week = o[1], label = o[0] === 'capstone' ? 'Capstone' : 'Checkpoint ' + o[0].slice(2);
      var base = c.base * Math.pow(c.ratio, step);
      if (!it || it.earned == null) {
        // checkpoints not taken yet: what each would be worth if she passes every one before it
        var proj = c.base * Math.pow(c.ratio, step + ahead);
        rows.push({ label: label, state: nextShown ? 'later' : 'next', value: Math.round(proj / c.roundTo) * c.roundTo, week: week });
        nextShown = true;
        ahead += 1;
        return;
      }
      var v = pct(it);
      if (v >= 70) {
        var mult = (v >= 90 ? c.bonus90 : 1) * (fullWeeks.indexOf(week) >= 0 ? 1 + c.fullWeekBonus : 1);
        var val = Math.round(base * mult / c.roundTo) * c.roundTo;
        earned += val;
        rows.push({ label: label, state: 'won', value: val, pct: v, bonus90: v >= 90, fullWeek: fullWeeks.indexOf(week) >= 0 });
        step += 1;
      } else {
        rows.push({ label: label, state: 'missed', value: 0, pct: v });
        step = Math.max(0, step - c.dropSteps);
      }
    });
    var spent = (p.spent || []).reduce(function (s, x) { return s + (x.amount || 0); }, 0);
    return { rows: rows, earned: earned, spent: spent };
  }

  function chainHtml(r, p) {
    var ch = chainOf(r, p), c = r.chain;
    var h = '<div class="wallet">' +
      '<div><span>Earned</span><b>' + fmt(ch.earned) + '</b></div>' +
      '<div><span>Spent</span><b>' + fmt(ch.spent) + '</b></div>' +
      '<div class="bal"><span>In your wallet</span><b>' + fmt(ch.earned - ch.spent) + ' soum</b></div></div>';
    h += '<div class="chain">' + ch.rows.map(function (row) {
      var tag = row.state === 'won' ? 'Won' + (row.bonus90 ? ' · 90 %+ bonus' : '') + (row.fullWeek ? ' · full challenge week +10 %' : '')
        : row.state === 'missed' ? 'Missed (' + Math.round(row.pct) + ' %) — the chain stepped back'
        : row.state === 'next' ? 'Next — pass it to win this' : 'If you pass every one before it';
      return '<div class="link ' + row.state + '">' + icon(row.state === 'won' ? 'gift' : row.state === 'missed' ? 'lock' : 'target', 22) +
        '<div class="link-body"><div class="link-label">' + esc(row.label) + '</div><div class="link-tag">' + esc(tag) + '</div></div>' +
        '<div class="link-val">' + (row.state === 'missed' ? '—' : (row.state === 'won' ? '' : '≈ ') + fmt(row.value)) + '</div></div>';
    }).join('') + '</div>';
    h += '<p class="board-note">Every voucher is worth ' + c.ratio + '× the one before while you keep passing; 90 %+ adds ' +
      Math.round((c.bonus90 - 1) * 100) + ' %, and a week with all five daily challenges adds ' + Math.round(c.fullWeekBonus * 100) +
      ' %. A failed checkpoint gives no voucher and steps the chain back ' + c.dropSteps + ' links. Values are estimates until you get there.</p>';
    h += '<h3>What a voucher buys</h3><p class="board-note">Spend a voucher now or save several and combine them. Tell your mentor what you choose.</p><ul class="menu">' +
      c.menu.map(function (m) { return '<li><b>' + esc(m.what) + '</b> <span>' + esc(m.about) + '</span></li>'; }).join('') + '</ul>';
    if ((p.spent || []).length) {
      h += '<h3>Spent so far</h3><ul class="menu">' + p.spent.map(function (s) { return '<li><b>' + esc(s.what) + '</b> <span>' + fmt(s.amount) + ' · ' + esc(s.on || '') + '</span></li>'; }).join('') + '</ul>';
    }
    return h;
  }

  function badgeCard(b, on, device) {
    return '<div class="bdg' + (on ? ' on' : '') + '">' + icon(b.icon, 30) +
      '<div class="bdg-name">' + esc(b.name) + '</div><div class="bdg-how">' + esc(b.how) + (device ? ' <i>(this device)</i>' : '') + '</div></div>';
  }

  function render() {
    var el = document.getElementById('al-board');
    if (!el || el.getAttribute('data-done')) return;
    el.setAttribute('data-done', '1');
    Promise.all([
      fetch('progress.json', { cache: 'no-store' }).then(function (x) { return x.json(); }),
      fetch('rewards.json', { cache: 'no-store' }).then(function (x) { return x.json(); })
    ]).then(function (res) {
      var p = res[0], r = res[1];
      var xp = xpOf(p, r), lv = levelOf(xp, r);
      var maxXp = p.items.reduce(function (s, it) { return s + it.max; }, 0) + 41 * r.xpPerQuizDay +
        (window.ALChallenge ? window.ALChallenge.maxXp() : 374);  // 40 challenges on a perfect streak, lucky days doubled
      var span = lv.next ? lv.next.from - lv.cur.from : 1;
      var into = lv.next ? (xp - lv.cur.from) / span : 1;
      var done = window.ALQuiz ? window.ALQuiz.doneCount() : 0, streak = window.ALQuiz ? window.ALQuiz.streak() : 0;

      var html = '';
      html += '<div class="lvl"><div class="lvl-top">' + icon('briefcase', 36) +
        '<div><div class="lvl-name">' + esc(lv.cur.name) + '</div><div class="lvl-note">' + esc(lv.cur.note) + '</div></div>' +
        '<div class="lvl-xp"><b>' + fmt(xp) + '</b> XP<br><span>of ' + fmt(maxXp) + ' possible</span></div></div>' +
        '<div class="bar"><div style="width:' + Math.round(100 * Math.min(1, into)) + '%"></div></div>' +
        '<div class="lvl-next">' + (lv.next ? fmt(lv.next.from - xp) + ' XP to <b>' + esc(lv.next.name) + '</b>' : 'Top level reached.') + '</div></div>';

      html += '<div class="stats">' +
        '<div class="stat">' + icon('check', 22) + '<b>' + done + ' / 41</b><span>days finished · ' + (p.quizDays || 0) + ' already in your XP</span></div>' +
        '<div class="stat">' + icon('flame', 22) + '<b>' + streak + '</b><span>day streak</span></div>' +
        (window.ALChallenge ? '<div class="stat">' + icon('target', 22) + '<b>' + window.ALChallenge.solved() + ' / 40</b><span>challenges solved · streak ' +
          window.ALChallenge.streak() + ' · ' + window.ALChallenge.xp() + ' XP earned, ' + (p.challengeXp || 0) + ' already in your XP</span></div>' : '') +
        '<div class="stat">' + icon('zap', 22) + '<b>' + (p.stretch || 0) + '</b><span>stretch tasks done</span></div></div>' +
        '<p class="board-note">Days and challenges count on this device as you go; they join your XP above when your mentor records ' +
        'the Friday screenshot of this page.</p>';

      html += '<h2 id="real-rewards">Real rewards: your voucher chain</h2><p class="board-note">Every checkpoint you pass wins a voucher, and every voucher is bigger than the last. Keep the chain going.</p>' +
        chainHtml(r, p) +
        '<h3>Big results</h3><div class="mss">' + milestoneRows(r, p, xp) + '</div>';

      var earned = p.badges || [];
      html += '<h2 id="badges">Badges</h2><div class="bdgs">' +
        r.badges.map(function (b) { return badgeCard(b, earned.indexOf(b.id) >= 0 || (b.auto && autoBadge(b.auto, p)), false); }).join('') +
        r.deviceBadges.map(function (b) { return badgeCard(b, deviceBadge(b.id), true); }).join('') + '</div>';

      html += '<h2 id="points">Points by week</h2>';
      for (var w = 0; w <= 8; w++) {
        var its = p.items.filter(function (it) { return it.week === w; });
        if (!its.length) continue;
        var sumMax = 0, sumGot = 0;
        html += '<table class="pts"><thead><tr><th>' + (w === 0 ? 'Day 0' : 'Week ' + w) + '</th><th>Max</th><th>Earned</th><th>Feedback</th></tr></thead><tbody>';
        its.forEach(function (it) {
          sumMax += it.max; if (it.earned != null) sumGot += it.earned;
          html += '<tr><td>' + esc(it.title) + '</td><td>' + it.max + '</td><td>' + (it.earned == null ? '—' : it.earned + (it.onTime === false ? ' <small>(late)</small>' : '')) +
            '</td><td>' + (it.feedback ? '<a href="' + esc(it.feedback) + '">read</a>' : '') + '</td></tr>';
        });
        html += '<tr class="sum"><td>Total</td><td>' + sumMax + '</td><td>' + sumGot + '</td><td></td></tr></tbody></table>';
      }
      html += '<p class="board-note">Updated by the mentor: ' + esc(p.updated || 'not yet') + '.</p>';
      el.innerHTML = html;
    }).catch(function (e) {
      el.innerHTML = '<p>The board could not load (' + esc(e.message) + '). Open the course through its web address or a local server, not as a file.</p>';
    });
  }
  window.ALBoard = { render: render };
})();
