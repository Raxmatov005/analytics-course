/* Story pictures for Week 7 (designing and analysing A/B tests), added to story.js's registry (window.ALStory.scenes). Loaded right after
story.js; see story.js's header for the block format. A kind is function (host, info) → {set(opts), act(a)}: it draws
into host (an SVG via ALStory.svg) and its read-out into info.

  hash   — the arm computed from the user id. "rows" [[user_id, hex, logged?], …]: hex is sha256(salt + user_id) (computed
           in Python; the picture shows its first 8 and last 4 characters, the last one bold): its last character even →
           arm A (blue), odd → B (amber); a third value is the arm the service logged, ringed orange where it differs.
           "salt" is written over the table; "n" rows are computed at the start (the rest wait as "…"); act "hash" computes
           the next one, or, once all are done, all of them again — the same arms, and the read-out counts the runs.
           "hot" [row indices] lights rows (an arm that changed). "strip" [u, …]: the whole hash read as a number in
           [0, 1), one dot per user on a line, A left of "cut" (default 0.5), B right of it; the read-out counts the
           sides. "words" {id, hash, last, arm, logged}.
  days   — one bar per day of a test: "vals" [B − A per day, points]; "hot" k colours the first k days orange (launch days),
           "drop" k fades them (excluded); "ref" a value drawn as a green dashed line, named by "words" {ref}; "run": true
           draws the running average from the first kept day — what a test stopped on that day reports — in purple; act
           "stop" {d} marks day d on it and the read-out gives its value. "lo", "hi", "tick"; "words" {axis, ref}.
  peekd  — story4.js's peek with the days of a test instead of months (the same options; "months" = the number of days).
  design — story4.js's choose as a design checklist: the same chips and path; the box at the end holds "words" {test}
           (orange with "bad": true), and the read-out is "words" {note} instead of "The test: …". */
(function () {
  var S = window.ALStory;
  if (!S) return;
  var T = S.T, fmt = S.fmt, dec = S.dec, esc = S.esc, txt = S.txt, svg = S.svg;

  if (!document.getElementById('sy5-style')) {
    var st = document.createElement('style');
    st.id = 'sy5-style';
    st.textContent = '.sy-svg .sy5-mono { font: 600 11.5px ui-monospace, Menlo, Consolas, monospace; fill: #475569; }' +
      ' .sy-svg .sy5-last { font-weight: 800; fill: #0f172a; } .sy-svg .sy5-lt { font: 800 11px var(--sans); fill: #0f172a; }' +
      ' .sy5-hot { fill: #fef9c3; } .sy5-hot.sy5-bad { fill: #ffedd5; } .sy5-run { fill: none; stroke: #6d28d9; stroke-width: 2.4; stroke-linejoin: round; }' +
      ' .sy5-stop { fill: #6d28d9; } .sy4-final.sy5-bad { fill: #ffedd5; stroke: #c2410c; } .sy-svg .sy4-ft.sy5-badt { fill: #c2410c; }' +
      ' html[data-theme="dark"] .sy .sy-svg .sy5-mono { fill: #9fb0c3; } html[data-theme="dark"] .sy .sy-svg .sy5-last { fill: #e6edf3; }' +
      ' html[data-theme="dark"] .sy .sy5-hot { fill: #3f3a12; } html[data-theme="dark"] .sy .sy5-hot.sy5-bad { fill: #431c0a; }' +
      ' html[data-theme="dark"] .sy .sy5-run { stroke: #c4b5fd; } html[data-theme="dark"] .sy .sy5-stop { fill: #c4b5fd; }' +
      ' html[data-theme="dark"] .sy .sy4-final.sy5-bad { fill: #431c0a; stroke: #fdba74; } html[data-theme="dark"] .sy .sy-svg .sy4-ft.sy5-badt { fill: #fdba74; }';
    document.head.appendChild(st);
  }
  function sgn(v, dp) { var a = Math.abs(v) < Math.pow(10, -dp) / 2 ? 0 : v; return (a > 0 ? '+' : a < 0 ? '−' : '') + dec(Math.abs(a), dp); }
  function chip(x, y, arm, ring) {   // an arm as a coloured disc with its letter
    return '<circle class="sy-dot sy-f-' + (arm === 'A' ? 'b' : 'y') + (ring ? ' sy-r-o' : '') + '" cx="' + x + '" cy="' + y.toFixed(1) + '" r="10"/>' + txt(x, y + 4, arm, 'sy5-lt', 'middle');
  }

  /* ---------- hash: the arm is computed, not stored ---------- */
  S.scenes.hash = function (host, info) {
    var o = {}, key = '', shown = 0, runs = 0;
    function armOf(hex) { return parseInt(hex.slice(-1), 16) % 2 ? 'B' : 'A'; }
    function paint() {
      var rows = o.rows || [], w = o.words || {}, s = '', y = 0, logged = rows.some(function (r) { return r[2]; });
      var X = { id: 8, hash: 92, last: 290, arm: logged ? 380 : 420, log: 446 };
      if (rows.length) {
        s += txt(240, 15, 'sha256("' + (o.salt || '') + '" + user_id)', 'sy-ax sy-lab', 'middle');
        y = 40;
        s += txt(X.id, y, w.id || 'user_id', 'sy-ax') + txt(X.hash, y, w.hash || T('the hash (hex)', 'хеш (hex)'), 'sy-ax') +
          txt(X.last, y, w.last || T('last character', 'последний знак'), 'sy-ax', 'middle') + txt(X.arm, y, w.arm || T('arm', 'группа'), 'sy-ax', 'middle') +
          (logged ? txt(X.log, y, w.logged || T('logged', 'в логе'), 'sy-ax', 'middle') : '');
        y += 8;
        rows.forEach(function (r, i) {
          var cy = y + 14, done = i < shown, arm = armOf(r[1]), bad = done && r[2] && r[2] !== arm;
          if ((o.hot || []).indexOf(i) >= 0 || bad) s += '<rect class="sy5-hot' + (bad ? ' sy5-bad' : '') + '" x="2" y="' + (y + 1) + '" width="476" height="26" rx="6"/>';
          s += txt(X.id, cy + 4, String(r[0]), 'sy-ax sy-lab');
          if (done) {
            s += '<text class="sy5-mono" x="' + X.hash + '" y="' + (cy + 4) + '">' + esc(r[1].slice(0, 8)) + '…' + esc(r[1].slice(-4, -1)) + '<tspan class="sy5-last">' + esc(r[1].slice(-1)) + '</tspan></text>';
            s += txt(X.last, cy + 4, r[1].slice(-1) + ' → ' + (arm === 'B' ? T('odd', 'нечётный') : T('even', 'чётный')), 'sy-ax', 'middle');
            s += chip(X.arm, cy, arm);
          } else s += txt(X.hash, cy + 4, '…', 'sy5-mono');
          if (r[2]) s += chip(X.log, cy, r[2], bad);
          y += 28;
        });
        y += 6;
      }
      var u = o.strip || [], cut = o.cut != null ? o.cut : 0.5, left = 0;
      if (u.length) {
        var L = 20, R = 460, base = y + 62;
        var x = function (v) { return L + v * (R - L); };
        u.forEach(function (v, i) {
          var a = v < cut ? 'A' : 'B'; if (a === 'A') left++;
          s += '<circle class="sy-dot sy-f-' + (a === 'A' ? 'b' : 'y') + '" cx="' + x(v).toFixed(1) + '" cy="' + (base - 8 - (i % 6) * 8) + '" r="3.6"/>';
        });
        s += '<line class="sy-axl" x1="' + L + '" x2="' + R + '" y1="' + base + '" y2="' + base + '"/>';
        [0, 0.5, 1].forEach(function (t) { s += txt(x(t), base + 15, dec(t, t % 1 ? 1 : 0), 'sy-ax', 'middle'); });
        s += '<line class="sy-mean" x1="' + x(cut).toFixed(1) + '" x2="' + x(cut).toFixed(1) + '" y1="' + (base - 56) + '" y2="' + (base + 4) + '"/>' + txt(x(cut), base - 60, dec(cut, 1), 'sy-ax sy-pl', 'middle');
        y = base + 22;
      }
      host.innerHTML = svg(480, Math.max(60, y), s);
      var parts = [];
      if (rows.length) {
        if (shown < rows.length) parts.push(T('Computed: **%k** of %n users.', 'Посчитано: **%k** из %n пользователей.').replace('%k', shown).replace('%n', rows.length));
        else if (runs) parts.push(T('Computed again (run %r): every arm the same.', 'Посчитали заново (запуск %r): все группы те же.').replace('%r', runs + 1));
      }
      if (u.length) parts.push(T('left of %c → {b|A}: **%a** · right → {y|B}: **%b** (of %n)', 'левее %c → {b|A}: **%a** · правее → {y|B}: **%b** (из %n)')
        .replace(/%c/g, dec(cut, 1)).replace('%a', left).replace('%b', u.length - left).replace('%n', u.length));
      info.innerHTML = parts.length ? '<div class="sy-read">' + fmt(parts.join(' · ')) + '</div>' : '';
    }
    return {
      set: function (nx) {
        var k = JSON.stringify([nx.salt, nx.rows]);
        if (k !== key || nx.reset) { key = k; shown = nx.n || 0; runs = 0; }
        else if (nx.n != null && nx.n > shown) shown = nx.n;
        o = nx; paint();
      },
      act: function (a) {
        if (a.do !== 'hash') return;
        var n = (o.rows || []).length;
        if (shown < n) shown = Math.min(n, shown + (a.n || 1)); else runs++;
        paint();
      }
    };
  };

  /* ---------- days: the lift of each day, and what a test stopped that day reports ---------- */
  S.scenes.days = function (host, info) {
    var o = {}, stop = 0;
    function runAt(d) { var v = o.vals || [], k0 = o.drop || 0, t = 0; for (var i = k0; i < d; i++) t += v[i]; return t / Math.max(1, d - k0); }
    function paint() {
      var v = o.vals || [], n = v.length, w = o.words || {}, s = '';
      var lo = o.lo != null ? o.lo : Math.min(0, Math.min.apply(null, v)), hi = o.hi != null ? o.hi : Math.max.apply(null, v.concat([0])) * 1.1;
      var L = 34, R = 470, Tp = 14, B = 172, bw = (R - L) / Math.max(1, n), k0 = o.drop || 0, tick = o.tick || 1;
      var y = function (val) { return Tp + (hi - Math.max(lo, Math.min(hi, val))) / (hi - lo) * (B - Tp); };
      var cx = function (i) { return L + (i + 0.5) * bw; };
      for (var t = Math.ceil(lo / tick - 1e-9) * tick; t <= hi + 1e-9; t += tick) s += '<line class="sy-tick" x1="' + (L - 4) + '" x2="' + L + '" y1="' + y(t).toFixed(1) + '" y2="' + y(t).toFixed(1) + '"/>' + txt(L - 7, y(t) + 4, sgn(t, 0), 'sy-ax', 'end');
      v.forEach(function (val, i) {
        var y0 = y(0), y1 = y(val), cls = 'sy-bar' + (i < (o.hot || 0) ? ' sy-hot' : '') + (i < k0 ? ' sy-fade' : '');
        s += '<rect class="' + cls + '" x="' + (L + i * bw + 1).toFixed(1) + '" y="' + Math.min(y0, y1).toFixed(1) + '" width="' + Math.max(1, bw - 2).toFixed(1) + '" height="' + Math.max(1, Math.abs(y1 - y0)).toFixed(1) + '" rx="1.5"/>';
      });
      s += '<line class="sy-axl" x1="' + L + '" x2="' + R + '" y1="' + y(0).toFixed(1) + '" y2="' + y(0).toFixed(1) + '"/>';
      for (var d = 1; d <= n; d++) if (d === 1 || d % 7 === 0) s += txt(cx(d - 1), B + 14, String(d), 'sy-ax', 'middle');
      s += txt(R, B + 28, w.axis || T('day of the test', 'день теста'), 'sy-ax', 'end');
      if (o.ref != null) s += '<line class="sy-target" x1="' + L + '" x2="' + R + '" y1="' + y(o.ref).toFixed(1) + '" y2="' + y(o.ref).toFixed(1) + '"/>' + txt(R, y(o.ref) - 5, w.ref || '', 'sy-ax sy-tg', 'end');
      if (o.run) {
        var pts = [];
        for (var e = k0 + 1; e <= n; e++) pts.push(cx(e - 1).toFixed(1) + ',' + y(runAt(e)).toFixed(1));
        s += '<polyline class="sy5-run" points="' + pts.join(' ') + '"/>';
        if (stop > k0) s += '<circle class="sy5-stop" cx="' + cx(stop - 1).toFixed(1) + '" cy="' + y(runAt(stop)).toFixed(1) + '" r="6"/>' +
          txt(cx(stop - 1) + (stop > n * 0.7 ? -9 : 9), y(runAt(stop)) - 9, sgn(runAt(stop), 2), 'sy-ax sy-pl', stop > n * 0.7 ? 'end' : 'start');
      }
      host.innerHTML = svg(480, B + 34, s);
      info.innerHTML = o.run && stop > k0 ? '<div class="sy-read">' + fmt(T('A test that stops on day %d reports {p|%v points}.', 'Тест, остановленный на %d-й день, покажет {p|%v пункта}.')
        .replace('%d', stop).replace('%v', sgn(runAt(stop), 2))) + '</div>' : '';
    }
    return {
      set: function (nx) { if (nx.reset || JSON.stringify(nx.vals) !== JSON.stringify(o.vals)) stop = 0; o = nx; if (o.stop) stop = o.stop; paint(); },
      act: function (a) { if (a.do === 'stop') { stop = Math.min((o.vals || []).length, a.d || 1); paint(); } }
    };
  };

  /* ---------- peekd: peek, counted in days ---------- */
  S.scenes.peekd = function (host, info) {
    var p = S.scenes.peek(host, info);
    function fix() { info.innerHTML = info.innerHTML.replace('at month', 'on day').replace('в месяц', 'в день'); }
    return { set: function (nx) { p.set(nx); fix(); }, act: function (a) { p.act(a); fix(); } };
  };

  /* ---------- design: choose as a checklist with a verdict ---------- */
  S.scenes.design = function (host, info) {
    var c = S.scenes.choose(host, info);
    return {
      set: function (nx) {
        c.set(nx);
        if (nx.bad) host.innerHTML = host.innerHTML.replace('class="sy4-final"', 'class="sy4-final sy5-bad"').replace('class="sy4-ft"', 'class="sy4-ft sy5-badt"');
        var w = nx.words || {};
        info.innerHTML = w.note ? '<div class="sy-read">' + fmt(w.note) + '</div>' : '';
      },
      act: function () { /* the rounds are the story's questions */ }
    };
  };
})();
