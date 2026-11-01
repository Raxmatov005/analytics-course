/* Story pictures for Week 6 Days 4–5 (non-parametric tests, power, many tests, test choice), added to story.js's registry (window.ALStory.scenes). Loaded right after
story.js; see story.js's header for the block format. A kind is function (host, info) → {set(opts), act(a)}: it draws
into host (an SVG via ALStory.svg) and its read-out into info.

  ranks — two small groups on one number line ("a", "b": values; "col" [fill of a, fill of b], default blue / amber), or
          paired differences ("d": green below zero, orange above; "col" [below, above]). "lo", "hi", "tick", "dp", "unit".
          "mark": "mean" (each group's average under the line), "row" (every value lined up smallest to largest, linked to
          its dot; for "d" by size, the sign ignored), "rank" (the rank under each), "wins" (over each a: how many b it
          beats; U in the read-out), "sum" (rank sums; W+ and W− for "d"). "hot" [group, i] rings one value; "pull"
          [group, i, value] puts it there; act {do: "nudge", g, i, by}. act "shuffle" n re-deals the labels a / b over the
          same values ("flip" n gives every difference a random sign) and drops the statistic ("stat" "gap" = average a −
          average b, "u"; W+ for "d") into a tally under the line, against the real one, both tails coloured; "exact": the
          share of every possible arrangement as dashed outlines. "words" {a, b, axis, tally}.
  deal  — a 2 × 2 table dealt again: "nA", "nB" loans, "K" events of which "k" are in A. act "deal" n puts the K events
          on random loans, keeping the totals, and counts those in A; one bar per count ("stat" "count"), or per gap in
          points ("stat" "gap", rate A − rate B). "tails": "fisher" (as unlikely as the real table: Fisher's exact test),
          "two", "right"; "exact" the exact shares (dashed); "expected" marks K × nA ÷ (nA + nB); "grid" draws every loan
          (up to 400) in two blocks with "labels"; "col" [fill of A, fill of B]. "words" {axis, unit, real, last}.
  peek  — one A/B experiment that changes nothing ("p" in both arms, "per" loans per arm a month, "months"), tested
          after every month: the z of the gap against the p < 0.05 lines. act "run" n; the last path bold, the earlier
          ones faint. "looks": the months at which the analyst looks (default every month); "mode" "once" (read once
          at the end) or "peek" (stop at the first look past the line). "words" {x}.
  pvals — m p-values, smallest first, on a log scale ("p", "labels"), with the line a correction draws: "rule" "raw"
          (α), "bonf" (α ÷ m), "holm" (α ÷ m, α ÷ (m − 1), …, stepping down), "bh" (α × k ÷ m, stepping up), "none";
          "alpha" (0.05); "adj" adds the adjusted p-values. Flagged tests are orange.
  choose — the test-choice path: "labels" [[question, [answer, …]], …] as columns of chips, "pick" [chosen answer per
          column, or null] lights the path, "words" {test} fills the box it ends in (an empty "?" box before). */
(function () {
  var S = window.ALStory;
  if (!S) return;
  var T = S.T, fmt = S.fmt, dec = S.dec, pc = S.pc, svg = S.svg, txt = S.txt;
  var TC = { b: 'sy4-tb', y: 'sy-am', o: 'sy-or', g: 'sy-tg', p: 'sy-pl', m: 'sy-ax' };   // a fill's text colour

  if (!document.getElementById('sy4-style')) {
    var st = document.createElement('style');
    st.id = 'sy4-style';
    st.textContent = '.sy-svg .sy4-tb { fill: #0369a1; font-weight: 700; } .sy-svg .sy4-tv { font: 700 10px var(--sans); fill: #0f172a; }' +
      ' .sy4-link { stroke: #cbd5e1; stroke-width: 1; } .sy4-old { fill: none; stroke: #94a3b8; stroke-width: 1.2; opacity: .6; }' +
      ' .sy4-new { fill: none; stroke: #0284c7; stroke-width: 2.6; stroke-linejoin: round; stroke-linecap: round; }' +
      ' .sy4-stair { fill: none; stroke: #c2410c; stroke-width: 2; stroke-dasharray: 4 3; } .sy4-zero { stroke: #94a3b8; stroke-width: 1; stroke-dasharray: 2 3; }' +
      ' html[data-theme="dark"] .sy .sy-svg .sy4-tb { fill: #7dd3fc; } html[data-theme="dark"] .sy .sy4-link { stroke: #334155; }' +
      ' html[data-theme="dark"] .sy .sy4-old { stroke: #64748b; } html[data-theme="dark"] .sy .sy4-new { stroke: #38bdf8; }' +
      ' html[data-theme="dark"] .sy .sy4-stair { stroke: #fdba74; } html[data-theme="dark"] .sy .sy4-zero { stroke: #64748b; }' +
      ' .sy4-chip { fill: #f8fafc; stroke: #cbd5e1; stroke-width: 1.5; transition: fill .3s, stroke .3s; } .sy4-chip.on { fill: #fef08a; stroke: #a16207; stroke-width: 2; }' +
      ' .sy-svg .sy4-ct { font: 600 10.5px var(--sans); fill: #475569; } .sy-svg .sy4-ct.on { fill: #0f172a; font-weight: 800; }' +
      ' .sy4-path { fill: none; stroke: #a16207; stroke-width: 2.5; } .sy4-final { fill: #ccfbf1; stroke: #0f766e; stroke-width: 2; } .sy4-final.empty { fill: none; stroke: #94a3b8; stroke-dasharray: 5 4; }' +
      ' .sy-svg .sy4-ft { font: 800 13px var(--sans); fill: #0f766e; } .sy-svg .sy4-ft.empty { fill: #94a3b8; }' +
      ' html[data-theme="dark"] .sy .sy4-chip { fill: #1b2430; stroke: #475569; } html[data-theme="dark"] .sy .sy4-chip.on { fill: #5c4a12; stroke: #fde047; }' +
      ' html[data-theme="dark"] .sy .sy-svg .sy4-ct { fill: #9fb0c3; } html[data-theme="dark"] .sy .sy-svg .sy4-ct.on { fill: #fef9c3; }' +
      ' html[data-theme="dark"] .sy .sy4-path { stroke: #fde047; } html[data-theme="dark"] .sy .sy4-final { fill: #134e4a; stroke: #5eead4; }' +
      ' html[data-theme="dark"] .sy .sy4-final.empty { fill: none; stroke: #64748b; } html[data-theme="dark"] .sy .sy-svg .sy4-ft { fill: #5eead4; }';
    document.head.appendChild(st);
  }

  function num(v, dp) { return dec(v, dp).replace('-', '−'); }
  function signed(v, dp) { return (v > 1e-12 ? '+' : '') + num(v, dp); }
  function big(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0'); }   // 1 024: a no-break space between thousands
  function avgRanks(vals) {   // 1-based ranks, ties share the average rank
    var idx = vals.map(function (v, i) { return i; }).sort(function (a, b) { return vals[a] - vals[b] || a - b; }), r = [];
    for (var i = 0; i < idx.length;) {
      var j = i; while (j + 1 < idx.length && vals[idx[j + 1]] === vals[idx[i]]) j++;
      for (var k = i; k <= j; k++) r[idx[k]] = (i + j) / 2 + 1;
      i = j + 1;
    }
    return { r: r, order: idx };
  }
  /* a small bar chart of a statistic, shares of runs, with the dashed exact shares, the real value and its mirror */
  function tallyChart(y0, o2) {
    var L = 24, R = 466, Tp = y0 + 16, B = y0 + 92, s = '', nb = o2.bars.length, bw = (R - L) / nb;
    var top = 0; o2.bars.forEach(function (b) { top = Math.max(top, b.v || 0, o2.exact ? b.e || 0 : 0); }); top = (top || 1) * 1.15;
    function y(v) { return B - v / top * (B - Tp); }
    o2.bars.forEach(function (b, k) {
      var x = L + k * bw, w = Math.max(1, bw - (bw > 6 ? 2 : 0.6));
      if (b.v) s += '<rect class="sy-bar' + (b.hot ? ' sy-hot' : '') + '" x="' + (x + (bw - w) / 2).toFixed(1) + '" y="' + y(b.v).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + (B - y(b.v)).toFixed(1) + '" rx="1.5"/>';
      if (o2.exact && b.e) s += '<rect class="sy-ex" x="' + (x + (bw - w) / 2).toFixed(1) + '" y="' + y(b.e).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + (B - y(b.e)).toFixed(1) + '" rx="1.5"/>';
    });
    s += '<line class="sy-axl" x1="' + L + '" x2="' + R + '" y1="' + B + '" y2="' + B + '"/>';
    (o2.ticks || []).forEach(function (t) { s += txt(L + t[0] * bw, B + 13, t[1], 'sy-ax', 'middle'); });
    if (o2.axis) s += txt(R, B + 26, o2.axis, 'sy-ax', 'end');
    (o2.lines || []).forEach(function (l, j) {
      var xx = L + l[0] * bw;
      s += '<line class="' + (l[2] || 'sy-alarm') + '" x1="' + xx.toFixed(1) + '" x2="' + xx.toFixed(1) + '" y1="' + (Tp - 6) + '" y2="' + B + '"/>';
      if (l[1]) s += txt(xx + (l[3] === 'end' ? -4 : 4), Tp - 8, l[1], l[4] || 'sy-ax sy-or', l[3] || 'start');
    });
    return s;
  }

  /* ---------- ranks: two groups (or paired differences) on one line, and their ranks ---------- */
  function ranks(host, info) {
    var o = {}, key = '', it = [], lab0 = [], lab = [], tally = [], exact = null, isD = false, sizeRank = null;
    function setup() {
      isD = !!o.d; it = []; tally = []; exact = null; sizeRank = null;
      if (isD) o.d.forEach(function (v, i) { it.push({ v: v, g: 'd', i: i }); });
      else { (o.a || []).forEach(function (v, i) { it.push({ v: v, g: 'a', i: i }); }); (o.b || []).forEach(function (v, i) { it.push({ v: v, g: 'b', i: i }); }); }
      lab0 = it.map(function (x) { return isD ? (x.v < 0 ? -1 : 1) : x.g; });
      lab = lab0.slice();
    }
    function changed() { tally = []; exact = null; sizeRank = null; }
    function shown(j) { return isD ? lab[j] * Math.abs(it[j].v) : it[j].v; }
    function sizes() { if (!sizeRank) sizeRank = avgRanks(it.map(function (x) { return Math.abs(x.v); })).r; return sizeRank; }
    function nA() { return lab0.filter(function (l) { return l === 'a'; }).length; }
    function stat(Lb) {
      var n = it.length, i, j;
      if (isD) { var r = sizes(), w = 0; for (i = 0; i < n; i++) if (Lb[i] > 0) w += r[i]; return w; }
      if (o.stat === 'u') { var u = 0; for (i = 0; i < n; i++) if (Lb[i] === 'a') for (j = 0; j < n; j++) if (Lb[j] === 'b') u += it[i].v > it[j].v ? 1 : it[i].v === it[j].v ? 0.5 : 0; return u; }
      var sa = 0, na = 0, sb = 0, nb = 0;
      for (i = 0; i < n; i++) if (Lb[i] === 'a') { sa += it[i].v; na++; } else { sb += it[i].v; nb++; }
      return sa / na - sb / nb;
    }
    function centre() { var n = it.length; return isD ? n * (n + 1) / 4 : o.stat === 'u' ? nA() * (n - nA()) / 2 : 0; }
    function discrete() { return isD || o.stat === 'u'; }
    function enumerate() {
      var n = it.length, out = [], Lb = [], i;
      if (isD) {
        if (n > 14) return null;
        for (var m = 0; m < (1 << n); m++) { for (i = 0; i < n; i++) Lb[i] = m >> i & 1 ? 1 : -1; out.push(stat(Lb)); }
        return out;
      }
      var na = nA(), c = 1; for (i = 0; i < na; i++) c = c * (n - i) / (i + 1);
      if (c > 20000) return null;
      for (i = 0; i < n; i++) Lb[i] = 'b';
      (function rec(start, left) {
        if (!left) { out.push(stat(Lb)); return; }
        for (var k = start; k <= n - left; k++) { Lb[k] = 'a'; rec(k + 1, left - 1); Lb[k] = 'b'; }
      })(0, na);
      return out;
    }
    function paint() {
      var w = o.words || {}, mk = o.mark || [], n = it.length, s = '', u = o.unit ? ' ' + o.unit : '';
      var col = o.col || (isD ? ['g', 'o'] : ['b', 'y']), dp = o.dp != null ? o.dp : 0;
      var cur = it.map(function (x, j) { return shown(j); });
      var lo = o.lo != null ? o.lo : Math.min.apply(null, cur), hi = o.hi != null ? o.hi : Math.max.apply(null, cur);
      if (hi <= lo) hi = lo + 1;
      var L = 24, R = 456, Y = 56;
      function x(v) { return L + (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * (R - L); }
      function fillOf(j) { return isD ? (lab[j] < 0 ? col[0] : col[1]) : (lab[j] === 'a' ? col[0] : col[1]); }
      var hot = o.hot ? it.findIndex(function (q) { return q.g === o.hot[0] && q.i === o.hot[1]; }) : -1;
      /* the line, its dots stacked where they crowd */
      var seen = {}, lv = [], lvMax = 1;
      cur.forEach(function (v, j) { var slot = Math.round(x(v) / 11); lv[j] = seen[slot] = (seen[slot] || 0) + 1; lvMax = Math.max(lvMax, lv[j]); });
      var dy = Math.min(11, 40 / lvMax);
      function dotY(j) { return Y - 8 - (lv[j] - 1) * dy; }
      s += '<line class="sy-axl" x1="' + L + '" x2="' + R + '" y1="' + Y + '" y2="' + Y + '"/>';
      var tick = o.tick || (hi - lo) / 5, tdp = o.tickDp != null ? o.tickDp : tick < 0.1 ? 2 : tick < 1 ? 1 : 0;
      for (var t = Math.ceil(lo / tick - 1e-9) * tick; t <= hi + 1e-9; t += tick) {
        s += '<line class="sy-tick" x1="' + x(t).toFixed(1) + '" x2="' + x(t).toFixed(1) + '" y1="' + Y + '" y2="' + (Y + 4) + '"/>' + txt(x(t), Y + 15, num(Math.abs(t) < 1e-9 ? 0 : t, tdp), 'sy-ax', 'middle');
        if (isD && Math.abs(t) < 1e-9) s += '<line class="sy4-zero" x1="' + x(0).toFixed(1) + '" x2="' + x(0).toFixed(1) + '" y1="' + (Y - 50) + '" y2="' + Y + '"/>';
      }
      if (w.axis) s += txt(R, Y + 29, w.axis + u, 'sy-ax', 'end');
      var means = {};
      if (mk.indexOf('mean') >= 0 && !isD) ['a', 'b'].forEach(function (g, gi) {
        var sm = 0, c = 0; cur.forEach(function (v, j) { if (lab[j] === g) { sm += v; c++; } });
        if (!c) return;
        var m = sm / c, mx = x(m); means[g] = m;
        s += '<path class="sy-dot sy-f-' + col[gi] + '" d="M' + mx.toFixed(1) + ' ' + (Y + 18) + ' l-6 10 h12 z"/>' + txt(mx, Y + 40, num(m, 1), 'sy-ax ' + TC[col[gi]], 'middle');
      });
      var dots = '';
      cur.forEach(function (v, j) {
        dots += '<circle class="sy-dot sy-f-' + fillOf(j) + (j === hot ? ' sy-r-o' : '') + '" cx="' + x(v).toFixed(1) + '" cy="' + dotY(j).toFixed(1) + '" r="' + (j === hot ? 7 : 5.5) + '"/>';
      });
      var H = 104;
      /* the row: every value lined up, smallest first, its rank under it */
      var rk = isD ? sizes() : avgRanks(cur).r;
      if (mk.indexOf('row') >= 0) {
        var order = isD ? avgRanks(it.map(function (q) { return Math.abs(q.v); })).order : avgRanks(cur).order;
        var x0 = 70, x1 = 462, sp = n > 1 ? (x1 - x0) / (n - 1) : 0, rr = Math.max(7, Math.min(15, sp / 2 - 2)), ty = H + 26, tok = '';
        order.forEach(function (j, k) {
          var tx = n > 1 ? x0 + k * sp : (x0 + x1) / 2;
          s += '<line class="sy4-link" x1="' + x(cur[j]).toFixed(1) + '" y1="' + (dotY(j) + 5).toFixed(1) + '" x2="' + tx.toFixed(1) + '" y2="' + (ty - rr) + '"/>';
          tok += '<circle class="sy-dot sy-f-' + fillOf(j) + (j === hot ? ' sy-r-o' : '') + '" cx="' + tx.toFixed(1) + '" cy="' + ty + '" r="' + rr.toFixed(1) + '"/>' +
            txt(tx, ty + 3.5, isD ? signed(cur[j], dp) : num(cur[j], dp), 'sy4-tv', 'middle');
          if (mk.indexOf('rank') >= 0) tok += txt(tx, ty + rr + 15, num(rk[j], rk[j] % 1 ? 1 : 0), 'sy-ax sy-lab', 'middle');
          if (mk.indexOf('wins') >= 0 && !isD && lab[j] === 'a') {
            var wn = 0; cur.forEach(function (v2, j2) { if (lab[j2] === 'b') wn += cur[j] > v2 ? 1 : cur[j] === v2 ? 0.5 : 0; });
            tok += txt(tx, ty - rr - 5, '+' + num(wn, wn % 1 ? 1 : 0), 'sy-ax ' + TC[col[0]], 'middle');
          }
        });
        if (mk.indexOf('rank') >= 0) s += txt(4, ty + rr + 15, T('rank', 'ранг'), 'sy-ax', 'start');
        s += tok; H = ty + rr + 26;
      }
      s += dots;
      /* the tally: the statistic of every shuffle (or sign flip) */
      var obs = stat(lab0), c0 = centre();
      if (!exact && (tally.length || o.exact)) exact = enumerate();
      function far(v) { return Math.abs(v - c0) >= Math.abs(obs - c0) - 1e-9; }
      if (tally.length || (o.exact && exact)) {
        var src = exact || tally, mn = Math.min.apply(null, src.concat(tally)), mxv = Math.max.apply(null, src.concat(tally)), bars = [], idx, mid;
        if (discrete()) { mn = Math.floor(mn); mxv = Math.ceil(mxv); idx = function (v) { return Math.round(v) - mn; }; mid = function (k) { return mn + k; }; for (var k = mn; k <= mxv; k++) bars.push({ v: 0, e: 0 }); }
        else {
          var pad = (mxv - mn) / 46 || 1, nb = 24, bw = (mxv - mn + 2 * pad) / nb; mn -= pad;
          idx = function (v) { return Math.min(nb - 1, Math.max(0, Math.floor((v - mn) / bw))); }; mid = function (k) { return mn + (k + 0.5) * bw; };
          for (k = 0; k < nb; k++) bars.push({ v: 0, e: 0 });
        }
        tally.forEach(function (v) { bars[idx(v)].v += 1 / tally.length; });
        if (exact) exact.forEach(function (v) { bars[idx(v)].e += 1 / exact.length; });
        bars.forEach(function (b, k) { b.hot = far(mid(k)); });
        var pos = function (v) { return discrete() ? v - mn + 0.5 : (v - mn) / ((mid(1) - mid(0)) || 1); };
        var ticks = [], tdp2 = discrete() ? 0 : 1, span = discrete() ? mxv - mn : bars.length;
        if (discrete()) { var st2 = span > 20 ? 5 : span > 8 ? 2 : 1; for (k = Math.ceil(mn / st2) * st2; k <= mxv; k += st2) ticks.push([k - mn + 0.5, String(k)]); }
        else {   // round values: a step of 1, 2, 2.5 or 5 × 10^k, about five ticks
          var vlo = mid(0), vhi = mid(bars.length - 1), raw = (vhi - vlo) / 5, mag = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10)), stp = mag;
          [1, 2, 2.5, 5, 10].some(function (f) { stp = f * mag; return stp >= raw; });
          tdp2 = stp < 1 ? (stp < 0.1 ? 2 : 1) : 0;
          for (var tv = Math.ceil(vlo / stp) * stp; tv <= vhi + 1e-9; tv += stp) ticks.push([pos(tv), signed(Math.abs(tv) < 1e-9 ? 0 : tv, tdp2)]);
        }
        var lines = [[pos(obs), (w.obs || T('ours', 'у нас')) + ' ' + (discrete() ? num(obs, obs % 1 ? 1 : 0) : signed(obs, 1)), 'sy-alarm', obs >= c0 ? 'start' : 'end']];
        if (Math.abs(obs - c0) > 1e-9) lines.push([pos(2 * c0 - obs), '', 'sy-alarm sy-dash']);
        s += tallyChart(H, { bars: bars, exact: o.exact && exact, ticks: ticks, axis: w.tally || '', lines: lines });
        H += 122;
      }
      host.innerHTML = svg(480, H, s);
      /* the read-out */
      var parts = [];
      if (mk.indexOf('mean') >= 0 && !isD && means.a != null) parts.push(T('averages: %a {%c|%m} · %b {%d|%n}', 'средние: %a {%c|%m} · %b {%d|%n}').replace('%a', w.a || 'A').replace('%b', w.b || 'B')
        .replace('%c', col[0]).replace('%d', col[1]).replace('%m', num(means.a, 1) + u).replace('%n', num(means.b, 1) + u));
      if (mk.indexOf('wins') >= 0 && !isD) parts.push(T('U = {%c|%u} of %p pairs', 'U = {%c|%u} из %p пар').replace('%c', col[0]).replace('%u', num(stat(lab), stat(lab) % 1 ? 1 : 0)).replace('%p', nA() * (n - nA())));
      if (mk.indexOf('sum') >= 0) {
        if (isD) { var wp = stat(lab), all = n * (n + 1) / 2; parts.push(T('W+ = {%p|%w} · W− = {%m|%v}', 'W+ = {%p|%w} · W− = {%m|%v}').replace('%p', col[1]).replace('%m', col[0]).replace('%w', num(wp, wp % 1 ? 1 : 0)).replace('%v', num(all - wp, (all - wp) % 1 ? 1 : 0))); }
        else { var ra = 0, rb = 0; lab.forEach(function (l, j) { if (l === 'a') ra += rk[j]; else rb += rk[j]; }); parts.push(T('rank sums: %a {%c|%r} · %b {%d|%s}', 'суммы рангов: %a {%c|%r} · %b {%d|%s}').replace('%a', w.a || 'A').replace('%b', w.b || 'B').replace('%c', col[0]).replace('%d', col[1]).replace('%r', num(ra, ra % 1 ? 1 : 0)).replace('%s', num(rb, rb % 1 ? 1 : 0))); }
      }
      if (tally.length) {
        var kf = tally.filter(far).length, lastV = tally[tally.length - 1];
        parts.push((isD ? T('sign patterns: **%n**', 'расстановок знаков: **%n**') : T('shuffles: **%n**', 'перетасовок: **%n**')).replace('%n', big(tally.length)) +
          T(' · the last: {b|%v}', ' · последняя: {b|%v}').replace('%v', discrete() ? num(lastV, lastV % 1 ? 1 : 0) : signed(lastV, 1)) +
          T(' · as far out as ours, or further: {o|%k} (%s)', ' · так же далеко, как у нас, или дальше: {o|%k} (%s)').replace('%k', kf).replace('%s', pc(kf / tally.length, 1)));
      }
      if (o.exact && exact) { var ke = exact.filter(far).length; parts.push(T('all %m ways: {o|%k} as far out or further (%s)', 'из всех %m вариантов: {o|%k} так же далеко или дальше (%s)').replace('%m', big(exact.length)).replace('%k', big(ke)).replace('%s', pc(ke / exact.length, 1))); }
      var line = parts.join(' · ');
      info.innerHTML = line ? '<div class="sy-read">' + fmt(line.charAt(0).toUpperCase() + line.slice(1)) + '</div>' : '';
    }
    return {
      set: function (nx) {
        var k = JSON.stringify([nx.a, nx.b, nx.d, nx.stat]);
        o = nx;
        if (k !== key || nx.reset) { key = k; setup(); }
        if (o.pull) it.forEach(function (q) { if (q.g === o.pull[0] && q.i === o.pull[1] && q.v !== o.pull[2]) { q.v = o.pull[2]; changed(); } });
        paint();
      },
      act: function (a) {
        var n = it.length, j, i;
        if (a.do === 'nudge') {
          j = it.findIndex(function (q) { return q.g === a.g && q.i === a.i; });
          if (j >= 0) { it[j].v = Math.max(o.lo != null ? o.lo : -1e9, Math.min(o.hi != null ? o.hi : 1e9, it[j].v + a.by)); changed(); paint(); }
        }
        if (a.do === 'shuffle' && !isD) {
          for (var r = 0; r < (a.n || 1); r++) {
            var Lb = lab0.slice();
            for (i = n - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); var tmp = Lb[i]; Lb[i] = Lb[j]; Lb[j] = tmp; }
            tally.push(stat(Lb)); lab = Lb;
          }
          paint();
        }
        if (a.do === 'flip' && isD) {
          for (r = 0; r < (a.n || 1); r++) { var Lf = []; for (i = 0; i < n; i++) Lf.push(Math.random() < 0.5 ? -1 : 1); tally.push(stat(Lf)); lab = Lf; }
          paint();
        }
        if (tally.length > 50000) tally = tally.slice(-50000);
      }
    };
  }

  /* ---------- deal: the events of a 2 × 2 table dealt again, the totals kept ---------- */
  function deal(host, info) {
    var o = {}, key = '', cnt = [], total = 0, lastK = null, spots = null, pmf = [], k0 = 0, k1 = 0, kLo = 0, kHi = 0, E = 0;
    function prep() {
      var nA = o.nA, N = o.nA + o.nB, K = o.K, lw = [0], mx = 0, sum = 0, k;
      k0 = Math.max(0, nA - (N - K)); k1 = Math.min(K, nA);
      for (k = k0; k < k1; k++) lw.push(lw[lw.length - 1] + Math.log((K - k) * (nA - k) / ((k + 1) * (N - K - nA + k + 1))));
      mx = Math.max.apply(null, lw); pmf = [];
      for (k = k0; k <= k1; k++) { pmf[k] = Math.exp(lw[k - k0] - mx); sum += pmf[k]; }
      for (k = k0; k <= k1; k++) pmf[k] /= sum;
      E = K * nA / N;
      var sd = Math.sqrt(E * (1 - nA / N) * (N - K) / Math.max(1, N - 1));
      if (o.stat === 'gap') { kLo = Math.max(k0, Math.floor(E - 4.5 * sd)); kHi = Math.min(k1, Math.ceil(E + 4.5 * sd)); }
      else { kLo = k0; kHi = k1; }
    }
    function gap(k) { return (k / o.nA - (o.K - k) / o.nB) * 100; }
    function far(k) {
      var t = o.tails || 'fisher';
      if (t === 'right') return k >= o.k;
      if (t === 'two') return Math.abs(k - E) >= Math.abs(o.k - E) - 1e-9;
      return pmf[k] <= pmf[o.k] * (1 + 1e-7);
    }
    function realSpots() {   // the real table, its events at fixed random places
      var R = S.rng(7), N = o.nA + o.nB, out = [], pick = function (from, to, m) { var ids = []; for (var i = from; i < to; i++) ids.push(i); for (var j = 0; j < m; j++) { var q = j + Math.floor(R() * (ids.length - j)), t = ids[j]; ids[j] = ids[q]; ids[q] = t; out[ids[j]] = 1; } };
      for (var i = 0; i < N; i++) out[i] = 0;
      pick(0, o.nA, o.k); pick(o.nA, N, o.K - o.k);
      return out;
    }
    function one() {
      var N = o.nA + o.nB, K = o.K, k = 0, i;
      if (o.grid && N <= 400) {
        var ids = []; for (i = 0; i < N; i++) ids.push(i);
        spots = []; for (i = 0; i < N; i++) spots[i] = 0;
        for (i = 0; i < K; i++) { var q = i + Math.floor(Math.random() * (N - i)), t = ids[i]; ids[i] = ids[q]; ids[q] = t; spots[ids[i]] = 1; if (ids[i] < o.nA) k++; }
        return k;
      }
      var remA = o.nA, rem = N;
      for (i = 0; i < K; i++) { if (Math.random() * rem < remA) { k++; remA--; } rem--; }
      return k;
    }
    function paint() {
      var w = o.words || {}, s = '', N = o.nA + o.nB, col = o.col || ['b', 'm'], u = w.unit || '', y0 = 14, k;
      if (o.grid && N <= 400) {
        var rows = Math.max(3, Math.round(Math.sqrt(N / 4))), cA = Math.ceil(o.nA / rows), cB = Math.ceil(o.nB / rows), units = cA + cB + 1.5;
        var cell = Math.min(22, 470 / units), top = o.labels ? 18 : 2, sp = spots || realSpots(), lb = o.labels || [];
        for (var i = 0; i < N; i++) {
          var inA = i < o.nA, j = inA ? i : i - o.nA, cols = inA ? cA : cB, bx = inA ? 0 : (cA + 1.5) * cell;
          s += '<circle class="sy-dot sy-f-' + (sp[i] ? 'o' : inA ? col[0] : col[1]) + '" cx="' + (bx + (j % cols + 0.5) * cell).toFixed(1) + '" cy="' + (top + (Math.floor(j / cols) + 0.5) * cell).toFixed(1) + '" r="' + (cell * 0.36).toFixed(1) + '"/>';
        }
        if (lb[0]) s += txt(cA * cell / 2, 12, lb[0], 'sy-ax sy-lab', 'middle');
        if (lb[1]) s += txt((cA + 1.5 + cB / 2) * cell, 12, lb[1], 'sy-ax sy-lab', 'middle');
        y0 = top + rows * cell + 10;
      }
      var bars = [];
      for (k = kLo; k <= kHi; k++) bars.push({ v: total ? (cnt[k] || 0) / total : 0, e: pmf[k], hot: far(k) });
      var ticks = [];
      if (o.stat === 'gap') {
        var per = 100 * (1 / o.nA + 1 / o.nB), g0 = gap(kLo), g1 = gap(kHi), stp = (g1 - g0) > 4 ? 1 : 0.5;
        for (var v = Math.ceil(g0 / stp) * stp; v <= g1 + 1e-9; v += stp) ticks.push([(v - g0) / per + 0.5, signed(Math.abs(v) < 1e-9 ? 0 : v, stp < 1 ? 1 : 0)]);
      } else for (k = kLo; k <= kHi; k++) ticks.push([k - kLo + 0.5, String(k)]);
      var lines = [], ob = o.k - kLo + 0.5;
      lines.push([ob, (w.obs || T('ours', 'у нас')) + ' ' + (o.stat === 'gap' ? signed(gap(o.k), 2) + u : o.k), 'sy-alarm', 'start']);
      if ((o.tails || 'fisher') === 'two') lines.push([2 * (E - kLo) - (o.k - kLo) + 0.5, '', 'sy-alarm sy-dash']);
      if (o.expected) lines.push([E - kLo + 0.5, T('expected ', 'ожидаем ') + num(E, 2), 'sy-mean', 'end', 'sy-ax sy-pl']);
      s += tallyChart(y0 - 8, { bars: bars, exact: o.exact, ticks: ticks, axis: w.axis || '', lines: lines });
      host.innerHTML = svg(480, y0 + 118, s);
      var parts = [];
      if (!total) parts.push((w.real || T('The real table: {o|%k} of the %K events are in A.', 'Настоящая таблица: {o|%k} из %K событий — в A.')).replace('%k', o.k).replace('%K', o.K));
      else {
        var hk = 0; for (k = k0; k <= k1; k++) if (far(k)) hk += cnt[k] || 0;
        parts.push((w.n || T('Deals: **%n**', 'Раздач: **%n**')).replace('%n', big(total)));
        parts.push((w.last || T('the last: {b|%x}', 'последняя: {b|%x}')).replace('%x', o.stat === 'gap' ? signed(gap(lastK), 2) + u : lastK));
        parts.push(T('as unlikely as the real one, or more: {o|%h} (%s)', 'так же маловероятно, как настоящая, или ещё реже: {o|%h} (%s)').replace('%h', hk).replace('%s', pc(hk / total, 1)));
      }
      if (o.exact) { var pe = 0; for (k = k0; k <= k1; k++) if (far(k)) pe += pmf[k]; parts.push(T('counted exactly: {o|%p}', 'точный подсчёт: {o|%p}').replace('%p', pc(pe, 2))); }
      info.innerHTML = '<div class="sy-read">' + fmt(parts.join(' · ')) + '</div>';
    }
    return {
      set: function (nx) {
        var k = JSON.stringify([nx.nA, nx.nB, nx.K, nx.k, nx.stat]);
        o = nx;
        if (k !== key || nx.reset) { key = k; cnt = []; total = 0; lastK = null; spots = null; }
        prep(); paint();
      },
      act: function (a) {
        if (a.do !== 'deal') return;
        for (var j = 0; j < (a.n || 1); j++) { lastK = one(); cnt[lastK] = (cnt[lastK] || 0) + 1; total++; }
        paint();
      }
    };
  }

  /* ---------- peek: one experiment that changes nothing, tested every month ---------- */
  function peek(host, info) {
    var o = {}, key = '', paths = [], runs = 0, once = 0, peeked = 0;
    function looks() { var M = o.months || 12, l = o.looks; if (l && l.length) return l; l = []; for (var m = 1; m <= M; m++) l.push(m); return l; }
    function one() {
      var M = o.months || 12, n = o.per, ka = 0, kb = 0, z = [];
      for (var m = 1; m <= M; m++) {
        ka += S.binom(n, o.p); kb += S.binom(n, o.p);
        var N = n * m, pool = (ka + kb) / (2 * N), se = Math.sqrt(pool * (1 - pool) * 2 / N);
        z.push(se > 0 ? (ka - kb) / N / se : 0);
      }
      return z;
    }
    function firstCross(z) { var l = looks(); for (var i = 0; i < l.length; i++) if (Math.abs(z[l[i] - 1]) > 1.96) return l[i]; return 0; }
    function paint() {
      var M = o.months || 12, w = o.words || {}, L = 40, R = 462, Tp = 14, B = 178, mid = (Tp + B) / 2, s = '', l = looks(), peekMode = o.mode === 'peek';
      function x(m) { return L + (m - 1) / (M - 1) * (R - L); }
      function y(z) { return mid - Math.max(-4.2, Math.min(4.2, z)) / 4.2 * (B - Tp) / 2; }
      s += '<rect class="sy-hband" x="' + L + '" y="' + y(1.96).toFixed(1) + '" width="' + (R - L) + '" height="' + (y(-1.96) - y(1.96)).toFixed(1) + '"/>';
      s += '<line class="sy-alarm sy-dash" x1="' + L + '" x2="' + R + '" y1="' + y(1.96).toFixed(1) + '" y2="' + y(1.96).toFixed(1) + '"/>';
      s += '<line class="sy-alarm sy-dash" x1="' + L + '" x2="' + R + '" y1="' + y(-1.96).toFixed(1) + '" y2="' + y(-1.96).toFixed(1) + '"/>';
      s += txt(L + 4, y(1.96) - 5, T('p < 0.05', 'p < 0,05'), 'sy-ax sy-or') + txt(L + 4, y(-1.96) + 13, T('p < 0.05', 'p < 0,05'), 'sy-ax sy-or');
      s += txt(L + 4, mid + 4, T('p > 0.05: no verdict', 'p > 0,05: вывода нет'), 'sy-ax sy-pl');
      s += '<line class="sy-axl" x1="' + L + '" x2="' + R + '" y1="' + B + '" y2="' + B + '"/>';
      for (var m = 1; m <= M; m++) s += txt(x(m), B + 14, String(m), 'sy-ax', 'middle');
      if (w.x) s += txt(R, B + 28, w.x, 'sy-ax', 'end');
      if (peekMode && l.length < M) l.forEach(function (lm) { s += '<line class="sy-mean" x1="' + x(lm).toFixed(1) + '" x2="' + x(lm).toFixed(1) + '" y1="' + Tp + '" y2="' + B + '"/>'; });
      paths.forEach(function (z, i) {
        var pts = z.map(function (v, j) { return x(j + 1).toFixed(1) + ',' + y(v).toFixed(1); }).join(' ');
        s += '<polyline class="' + (i === paths.length - 1 ? 'sy4-new' : 'sy4-old') + '" points="' + pts + '"/>';
      });
      if (paths.length) {
        var z = paths[paths.length - 1], fc = firstCross(z);
        (peekMode ? l : [M]).forEach(function (lm) {
          var hit = peekMode ? lm === fc : (lm === M && Math.abs(z[M - 1]) > 1.96);
          s += '<circle class="sy-dot sy-f-' + (hit ? 'o' : 'b') + '" cx="' + x(lm).toFixed(1) + '" cy="' + y(z[lm - 1]).toFixed(1) + '" r="' + (hit ? 6.5 : 3.2) + '"/>';
          if (hit && peekMode && lm < M) s += txt(x(lm) + (lm > M / 2 ? -9 : 9), y(z[lm - 1]) + (z[lm - 1] > 0 ? -10 : 18), T('stop: “it works!”', 'стоп: «работает!»'), 'sy-ax sy-or', lm > M / 2 ? 'end' : 'start');
        });
      }
      host.innerHTML = svg(480, B + 34, s);
      var parts = [];
      if (!runs) parts.push(T('No experiments yet.', 'Экспериментов пока нет.'));
      else {
        parts.push(T('Experiments: **%n**', 'Экспериментов: **%n**').replace('%n', big(runs)));
        parts.push(T('read once, at month %m: false wins {o|%a} (%x)', 'один взгляд, в месяц %m: ложных побед {o|%a} (%x)').replace('%m', M).replace('%a', once).replace('%x', pc(once / runs, 1)));
        if (peekMode) parts.push(T('looking %l times, stopping at the first p < 0.05: {o|%b} (%y)', 'взглядов: %l, стоп на первом p < 0,05: {o|%b} (%y)').replace('%l', l.length).replace('%b', peeked).replace('%y', pc(peeked / runs, 1)));
      }
      info.innerHTML = '<div class="sy-read">' + fmt(parts.join(' · ')) + '</div>';
    }
    return {
      set: function (nx) {
        var k = JSON.stringify([nx.p, nx.per, nx.months, nx.looks]);
        o = nx;
        if (k !== key || nx.reset) { key = k; paths = []; runs = 0; once = 0; peeked = 0; }
        paint();
      },
      act: function (a) {
        if (a.do !== 'run') return;
        var M = o.months || 12;
        for (var j = 0; j < (a.n || 1); j++) {
          var z = one(); runs++;
          if (Math.abs(z[M - 1]) > 1.96) once++;
          if (firstCross(z)) peeked++;
          paths.push(z);
        }
        if (paths.length > 24) paths = paths.slice(-24);
        paint();
      }
    };
  }

  /* ---------- pvals: many p-values and the line a correction draws ---------- */
  function pvals(host, info) {
    var o = {};
    function paint() {
      var al = o.alpha || 0.05, rule = o.rule || 'raw', names = o.labels || [], m = o.p.length, k, s = '';
      var ord = o.p.map(function (p, i) { return i; }).sort(function (a, b) { return o.p[a] - o.p[b] || a - b; }), ps = ord.map(function (i) { return o.p[i]; });
      var thr = ps.map(function (p, i) { return rule === 'bonf' ? al / m : rule === 'holm' ? al / (m - i) : rule === 'bh' ? al * (i + 1) / m : al; });
      var flag = ps.map(function () { return false; }), adj = [];
      if (rule === 'holm') { for (k = 0; k < m && ps[k] <= thr[k] + 1e-12; k++) flag[k] = true; }
      else if (rule === 'bh') { var topK = -1; for (k = 0; k < m; k++) if (ps[k] <= thr[k] + 1e-12) topK = k; for (k = 0; k <= topK; k++) flag[k] = true; }
      else if (rule !== 'none') for (k = 0; k < m; k++) flag[k] = ps[k] <= thr[k] + 1e-12;
      if (rule === 'holm') { var run = 0; for (k = 0; k < m; k++) { run = Math.max(run, Math.min(1, (m - k) * ps[k])); adj[k] = run; } }
      else if (rule === 'bh') { var rn = 1; for (k = m - 1; k >= 0; k--) { rn = Math.min(rn, ps[k] * m / (k + 1)); adj[k] = rn; } }
      else if (rule === 'bonf') for (k = 0; k < m; k++) adj[k] = Math.min(1, ps[k] * m);
      else for (k = 0; k < m; k++) adj[k] = ps[k];
      var rowH = m > 6 ? 19 : 26, Tp = 24, L = 136, R = o.adj ? 410 : 450, B = Tp + m * rowH;
      function x(p) { return L + (Math.log(Math.max(0.001, Math.min(1, p))) / Math.LN10 + 3) / 3 * (R - L); }
      [0.001, 0.01, 0.05, 0.1, 1].forEach(function (t) {
        s += '<line class="' + (t === al ? 'sy-tick' : 'sy4-zero') + '" x1="' + x(t).toFixed(1) + '" x2="' + x(t).toFixed(1) + '" y1="' + Tp + '" y2="' + (B + 4) + '"/>' + txt(x(t), B + 16, dec(t, t < 0.01 ? 3 : t < 0.1 ? 2 : t < 1 ? 1 : 0), 'sy-ax', 'middle');
      });
      s += txt(R, B + 30, T('p-value (log scale)', 'p-значение (логарифмическая шкала)'), 'sy-ax', 'end');
      ps.forEach(function (p, i) {
        var yy = Tp + i * rowH;
        s += txt(94, yy + rowH / 2 + 4, names[ord[i]] || '', 'sy-ax', 'end') + txt(130, yy + rowH / 2 + 4, dec(p, 3), 'sy-ax', 'end');
        s += '<rect class="sy-bar' + (flag[i] ? ' sy-hot' : '') + '" x="' + L + '" y="' + (yy + 4) + '" width="' + Math.max(2, x(p) - L).toFixed(1) + '" height="' + (rowH - 8) + '" rx="2"/>';
        if (o.adj && rule !== 'none') s += txt(474, yy + rowH / 2 + 4, dec(adj[i], 3), 'sy-ax ' + (flag[i] ? 'sy-or' : 'sy-pl'), 'end');
      });
      if (rule !== 'none') {
        var d = '';
        thr.forEach(function (t, i) { var xx = x(t).toFixed(1); d += (i ? ' L' : 'M') + xx + ' ' + (Tp + i * rowH) + ' L' + xx + ' ' + (Tp + (i + 1) * rowH); });
        s += '<path class="sy4-stair" d="' + d + '"/>';
        var a0 = dec(al, 2), lbl = rule === 'bonf' ? a0 + ' ÷ ' + m : rule === 'holm' ? a0 + ' ÷ ' + m + (m > 2 ? ', ÷ ' + (m - 1) + ', …' : m > 1 ? ', ÷ 1' : '') : rule === 'bh' ? a0 + ' × 1/' + m + (m > 1 ? ', 2/' + m + (m > 2 ? ', …' : '') : '') : a0;
        s += txt(x(thr[0]) - 2, Tp - 8, lbl, 'sy-ax sy-or', 'start');
      }
      if (o.adj && rule !== 'none') s += txt(474, Tp - 8, T('corrected', 'с поправкой'), 'sy-ax sy-pl', 'end');
      host.innerHTML = svg(480, B + 36, s);
      var nm = { raw: T('No correction', 'Без поправки'), bonf: T('Bonferroni', 'Бонферрони'), holm: T('Holm', 'Холм'), bh: T('Benjamini–Hochberg', 'Бенджамини–Хохберг') }[rule];
      var kf = flag.filter(Boolean).length;
      info.innerHTML = '<div class="sy-read">' + fmt(rule === 'none' ? T('%m tests, smallest p first.', '%m тестов, сначала самые маленькие p.').replace('%m', m)
        : T('%r: flagged at %a: {o|%k} of %m', '%r: отмечено при %a: {o|%k} из %m').replace('%r', nm).replace('%a', dec(al * 100, 0) + ' %').replace('%k', kf).replace('%m', m)) + '</div>';
    }
    return { set: function (nx) { o = nx; paint(); }, act: function () { /* no buttons */ } };
  }

  /* ---------- choose: the questions that pick a test, the chosen path lit ---------- */
  function choose(host, info) {
    var o = {};
    function paint() {
      var cols = o.labels || [], pick = o.pick || [], w = o.words || {}, n = cols.length || 1, gap = 12, cw = (476 - gap * (n - 1)) / n, ch = 26, s = '', path = [], maxRows = 0;
      cols.forEach(function (c, i) {
        var x0 = 2 + i * (cw + gap), chips = c[1] || [];
        maxRows = Math.max(maxRows, chips.length);
        s += txt(x0 + cw / 2, 14, c[0] || '', 'sy-ax sy-lab', 'middle');
        chips.forEach(function (label, j) {
          var y0 = 26 + j * (ch + 8), on = pick[i] === j;
          s += '<rect class="sy4-chip' + (on ? ' on' : '') + '" x="' + x0.toFixed(1) + '" y="' + y0 + '" width="' + cw.toFixed(1) + '" height="' + ch + '" rx="8"/>' +
            txt(x0 + cw / 2, y0 + ch / 2 + 4, label, 'sy4-ct' + (on ? ' on' : ''), 'middle');
          if (on) path.push([x0, y0 + ch / 2, x0 + cw]);
        });
      });
      var by = 26 + maxRows * (ch + 8) + 10, bw = 260, bx = (480 - bw) / 2, bh = 32;
      var d = '';
      path.forEach(function (p, i) { if (i) d += 'M' + path[i - 1][2].toFixed(1) + ' ' + path[i - 1][1] + ' L' + p[0].toFixed(1) + ' ' + p[1] + ' '; });
      if (w.test && path.length) { var last = path[path.length - 1]; d += 'M' + (last[2] - 10).toFixed(1) + ' ' + (last[1] + ch / 2) + ' L' + (bx + bw / 2).toFixed(1) + ' ' + by; }
      if (d) s = '<path class="sy4-path" d="' + d + '"/>' + s;
      s += '<rect class="sy4-final' + (w.test ? '' : ' empty') + '" x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" rx="10"/>' +
        txt(bx + bw / 2, by + bh / 2 + 5, w.test || '?', 'sy4-ft' + (w.test ? '' : ' empty'), 'middle');
      host.innerHTML = svg(480, by + bh + 4, s);
      info.innerHTML = w.test ? '<div class="sy-read">' + fmt(T('The test: {y|%t}', 'Тест: {y|%t}').replace('%t', w.test)) + '</div>' : '';
    }
    return { set: function (nx) { o = nx; paint(); }, act: function () { /* the answers are the story's questions */ } };
  }

  S.scenes.ranks = ranks;
  S.scenes.deal = deal;
  S.scenes.peek = peek;
  S.scenes.pvals = pvals;
  S.scenes.choose = choose;
})();
