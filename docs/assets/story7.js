/* Story pictures for Week 9 Days 3–4 and Week 8 Day 2 (ROC, AUC, KS, lift, cut-offs, PSI; a loan's money), added to story.js's registry (window.ALStory.scenes). Loaded right after
story.js; see story.js's header for the block format. A kind is function (host, info) → {set(opts), act(a)}: it draws
into host (an SVG via ALStory.svg) and its read-out into info. Bads are orange, goods green, everywhere.

  roc    — loans on the score line: "n" (loans per score) and "b" (bads per score) from score "from", or a toy's "goods"
           and "bads" (lists of scores; 60 loans or fewer are drawn as dots). Left panel "left": "dist" (bads' and goods'
           shares per "bin" points, bads above the line, goods below), "cum" (the two cumulative curves: the share of
           each group scoring x or less), "none". "cut": decline below it (the declined side is shaded, its bars strong);
           "drag" lets her move it (rounded to "step"). "roc": the ROC square beside it, "curve" "trace" (from approve-
           everyone up to the cut) or "full", "area" shades the AUC, "ks" marks the widest gap (on both panels),
           "corners" names (0, 0) and (1, 1). Read-out: "cm" a 2 × 2 table, "rates" TPR and FPR, "acc" accuracy, "appr"
           the approval rate and the approved loans' bad rate, "gini". act "nudge" {by}, "sweep" (the cut slides from
           the lowest score to the top), "pairs" {n} (a random good against a random bad, tallied). "lo", "hi", "tick".
  gains  — ten deciles, worst first: "n" loans and "b" bads per decile. "view" "bars" (bad rate per decile, "avg" the
           average line) or "curve" (the share of all bads in the worst x %, against the diagonal); "hot" k lights the
           worst k deciles and reads their gain and lift ("lift": false hides the lift).
  fall   — one loan's money as a waterfall: "items" [[value, tone], …], "labels" (one per item, and one more for the
           total; "\n" breaks a label), "upto" k draws the first k, "total" adds the bar of what is left, "fmt" "m"
           (millions), "k" (thousands), "s" (exact soum). "view": "pd" draws what one loan leaves against the share of
           bad loans: "good", "bad" (soum), "pd" [marks], "be" the break-even, "pmax".
  cutoff — the cut-off as a curve over "lo"…"hi" from per-score "n", "b", "from": "lines" (up to two of "appr", "br",
           "profit", "el"; the first on the left axis), "econ" {i, cof, opex, ead, lgd} or {good, bad}, "fund" (cof
           scales with it from 18 %), "cut" ("drag"), "avoid" reads bads avoided and goods turned away, "best" marks the
           most profitable line, "target" the loosest line whose approved loans stay at or under that bad rate.
           "view": "bands" — the bad rate per score band ("edges"), with the break-even line ("be": true or a rate);
           "decide" colours each band keep / decline; "pick" rings one; "cut" (an edge) draws the line.
  psi    — "e" and "a": shares per band (the reference and today), "labels", "words" {e, a}; "parts" each band's term;
           the total with its traffic light ("sum": false hides it). "view": "months" — "vals" [[psi, applicants], …] with "labels".
  rows   — one row per label: "rows" [[value, lo, hi, fill], …] (a bar, or a dot with its interval when lo and hi are
           given; "dpi" the decimals of its ends), "labels", "lo", "hi", "dp", "pct" (shares), "big" (whole numbers), "ref" [a, b] a shaded
           band ("words" {ref}), "hot" a row in bold, "legend". */
(function () {
  var S = window.ALStory;
  if (!S) return;
  var T = S.T, fmt = S.fmt, dec = S.dec, pc = S.pc, svg = S.svg, txt = S.txt, esc = S.esc;

  if (!document.getElementById('sy7-style')) {
    var st = document.createElement('style');
    st.id = 'sy7-style';
    st.textContent = '.sy7-dec { fill: #fff1e6; } .sy7-bb { fill: #f97316; } .sy7-bg { fill: #4ade80; } .sy7-lite { opacity: .32; }' +
      ' .sy7-cut { stroke: #0f172a; stroke-width: 2.2; } .sy7-cutd { stroke: #0f172a; stroke-width: 1.4; stroke-dasharray: 4 3; }' +
      ' .sy7-lb { fill: none; stroke: #ea580c; stroke-width: 2.4; stroke-linejoin: round; } .sy7-lg { fill: none; stroke: #16a34a; stroke-width: 2.4; stroke-linejoin: round; }' +
      ' .sy7-diag { stroke: #94a3b8; stroke-width: 1.4; stroke-dasharray: 4 3; } .sy7-frame { fill: none; stroke: #cbd5e1; stroke-width: 1.2; }' +
      ' .sy7-pt { fill: #7c3aed; stroke: #fff; stroke-width: 2; } .sy7-ks { stroke: #a16207; stroke-width: 2.6; } .sy7-gap { stroke: #7c3aed; stroke-width: 3; }' +
      ' .sy7-win { fill: none; stroke: #0284c7; stroke-width: 2.2; } .sy7-lose { fill: none; stroke: #c2410c; stroke-width: 2.2; } .sy7-tie { fill: none; stroke: #94a3b8; stroke-width: 2.2; }' +
      ' .sy7-end { stroke: #0f172a; stroke-width: 1.5; } .sy7-con { stroke: #94a3b8; stroke-width: 1; stroke-dasharray: 2 2; } .sy7-zero { stroke: #64748b; stroke-width: 1.2; }' +
      ' .sy7-be { stroke: #7c3aed; stroke-width: 2; stroke-dasharray: 5 3; } .sy7-pick { fill: none; stroke: #0f172a; stroke-width: 2.4; }' +
      ' .sy7-f-g { fill: #4ade80; } .sy7-f-o { fill: #fb923c; } .sy7-f-y { fill: #facc15; } .sy7-f-b { fill: #38bdf8; } .sy7-f-m { fill: #cbd5e1; } .sy7-f-p { fill: #a78bfa; }' +
      ' .sy7-l-b { fill: none; stroke: #0284c7; stroke-width: 2.4; } .sy7-l-o { fill: none; stroke: #ea580c; stroke-width: 2.4; } .sy7-l-y { fill: none; stroke: #ca8a04; stroke-width: 2.6; } .sy7-l-p { fill: none; stroke: #7c3aed; stroke-width: 2.4; }' +
      ' .sy7-gainA { fill: #fef3c7; } .sy7-lossA { fill: #ffedd5; }' +
      ' .sy-svg .sy7-v { font: 700 10px var(--sans); fill: #0f172a; } .sy-svg .sy7-sm { font: 600 9.5px var(--sans); fill: #64748b; } .sy-svg .sy7-tg { fill: #15803d; font-weight: 700; } .sy-svg .sy7-tb { fill: #0369a1; font-weight: 700; }' +
      ' .sy-svg .sy7-hot { font-weight: 800; fill: #0f172a; }' +
      ' .sy7-cm { border-collapse: separate; border-spacing: 3px; margin: .35em auto .2em; font-size: .92em; } .sy7-cm th { font-weight: 700; color: #475569; padding: .1em .5em; text-align: center; }' +
      ' .sy7-cm td { padding: .25em .7em; border-radius: 6px; text-align: center; line-height: 1.25; } .sy7-cm td b { display: block; font-size: 1.15em; }' +
      ' .sy7-cm td.o { background: #ffedd5; color: #9a3412; } .sy7-cm td.g { background: #dcfce7; color: #166534; } .sy7-cm td.m { background: #f1f5f9; color: #334155; }' +
      ' html[data-theme="dark"] .sy .sy7-dec { fill: #3a2416; } html[data-theme="dark"] .sy .sy7-bg { fill: #22c55e; } html[data-theme="dark"] .sy .sy7-cut { stroke: #e6edf3; } html[data-theme="dark"] .sy .sy7-cutd { stroke: #e6edf3; }' +
      ' html[data-theme="dark"] .sy .sy7-lb { stroke: #fb923c; } html[data-theme="dark"] .sy .sy7-lg { stroke: #4ade80; } html[data-theme="dark"] .sy .sy7-frame { stroke: #475569; } html[data-theme="dark"] .sy .sy7-diag { stroke: #64748b; }' +
      ' html[data-theme="dark"] .sy .sy7-pt { fill: #a78bfa; stroke: #0d1117; } html[data-theme="dark"] .sy .sy7-ks { stroke: #fde047; } html[data-theme="dark"] .sy .sy7-gap { stroke: #c4b5fd; }' +
      ' html[data-theme="dark"] .sy .sy7-win { stroke: #38bdf8; } html[data-theme="dark"] .sy .sy7-lose { stroke: #fdba74; } html[data-theme="dark"] .sy .sy7-end { stroke: #e6edf3; }' +
      ' html[data-theme="dark"] .sy .sy7-con { stroke: #64748b; } html[data-theme="dark"] .sy .sy7-zero { stroke: #94a3b8; } html[data-theme="dark"] .sy .sy7-be { stroke: #c4b5fd; } html[data-theme="dark"] .sy .sy7-pick { stroke: #e6edf3; }' +
      ' html[data-theme="dark"] .sy .sy7-f-g { fill: #22c55e; } html[data-theme="dark"] .sy .sy7-f-m { fill: #475569; } html[data-theme="dark"] .sy .sy7-l-b { stroke: #38bdf8; } html[data-theme="dark"] .sy .sy7-l-o { stroke: #fb923c; }' +
      ' html[data-theme="dark"] .sy .sy7-l-y { stroke: #fde047; } html[data-theme="dark"] .sy .sy7-l-p { stroke: #c4b5fd; } html[data-theme="dark"] .sy .sy7-gainA { fill: #3f3510; } html[data-theme="dark"] .sy .sy7-lossA { fill: #3a2416; }' +
      ' html[data-theme="dark"] .sy .sy-svg .sy7-v, html[data-theme="dark"] .sy .sy-svg .sy7-hot { fill: #e6edf3; } html[data-theme="dark"] .sy .sy-svg .sy7-sm { fill: #9fb0c3; }' +
      ' html[data-theme="dark"] .sy .sy-svg .sy7-tg { fill: #4ade80; } html[data-theme="dark"] .sy .sy-svg .sy7-tb { fill: #7dd3fc; } html[data-theme="dark"] .sy .sy7-cm th { color: #9fb0c3; }' +
      ' html[data-theme="dark"] .sy .sy7-cm td.o { background: #4a2a12; color: #fdba74; } html[data-theme="dark"] .sy .sy7-cm td.g { background: #14361f; color: #86efac; } html[data-theme="dark"] .sy .sy7-cm td.m { background: #1e293b; color: #cbd5e1; }';
    document.head.appendChild(st);
  }

  /* ---------- helpers ---------- */
  function num(v, dp) { return dec(v, dp).replace('-', '−'); }
  function big(n) { var r = Math.round(n), s = String(Math.abs(r)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); return (r < 0 ? '−' : '') + s; }
  function money(v, f) {
    if (f === 's') return big(v);
    if (f === 'k') return big(v / 1000) + T(' k', ' тыс.');
    var a = Math.abs(v);
    if (a >= 1e9 && f !== 'm') return num(v / 1e9, 2) + T(' bn', ' млрд');
    if (a >= 1e6 || f === 'm') return num(v / 1e6, 2) + T(' m', ' млн');
    return big(v);
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function P(x, y) { return x.toFixed(1) + ',' + y.toFixed(1); }
  function ln(x1, y1, x2, y2, cls) { return '<line class="' + cls + '" x1="' + x1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y1="' + y1.toFixed(1) + '" y2="' + y2.toFixed(1) + '"/>'; }
  function box(x, y, w, h, cls, rx) { return '<rect class="' + cls + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + Math.max(0, w).toFixed(1) + '" height="' + Math.max(0, h).toFixed(1) + '"' + (rx ? ' rx="' + rx + '"' : '') + '/>'; }
  function dot(x, y, r, cls) { return '<circle class="' + cls + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r + '"/>'; }
  function vtxt(x, y, s, cls) { return '<text class="' + cls + '" transform="rotate(-90 ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" text-anchor="middle">' + esc(s) + '</text>'; }
  function legend(items) { return '<div class="sy-legend">' + items.map(function (l) { return '<span class="sy-lg"><i class="sy-f-' + l[0] + '"></i>' + fmt(l[1]) + '</span>'; }).join('') + '</div>'; }
  function read(parts) { return parts.length ? '<div class="sy-read">' + fmt(parts.join(' · ')) + '</div>' : ''; }
  /* drag along the x axis of a picture: x0…x1 in the picture's own units maps to lo…hi */
  function dragX(host, W, x0, x1, lo, hi, state, onv) {
    var el = host.querySelector('svg');
    if (!el) return;
    function at(ev) { var r = el.getBoundingClientRect(), sx = (ev.clientX - r.left) / (r.width || 1) * W; return { sx: sx, v: lo + (sx - x0) / (x1 - x0) * (hi - lo) }; }
    el.onpointerdown = function (ev) { var a = at(ev); if (a.sx < x0 - 12 || a.sx > x1 + 12) return; state.on = true; try { el.setPointerCapture(ev.pointerId); } catch (e) { /* old browsers */ } onv(a.v); };
    el.onpointermove = function (ev) { if (state.on) onv(at(ev).v); };
    el.onpointerup = el.onpointercancel = function () { state.on = false; };
    el.style.touchAction = 'none'; el.style.cursor = 'ew-resize';
  }
  /* per-score goods and bads, and the counts below each score */
  function counts(o) {
    var from, B = [], G = [], k;
    if (o.goods || o.bads) {
      var all = (o.goods || []).concat(o.bads || []), to;
      from = Math.min.apply(null, all); to = Math.max.apply(null, all);
      for (k = 0; k <= to - from; k++) { B[k] = 0; G[k] = 0; }
      (o.goods || []).forEach(function (v) { G[v - from]++; });
      (o.bads || []).forEach(function (v) { B[v - from]++; });
    } else {
      from = o.from || 0;
      (o.n || []).forEach(function (v, i) { B[i] = (o.b || [])[i] || 0; G[i] = v - B[i]; });
    }
    var cb = [0], cg = [0];
    for (k = 0; k < B.length; k++) { cb.push(cb[k] + B[k]); cg.push(cg[k] + G[k]); }
    return { from: from, B: B, G: G, cb: cb, cg: cg, NB: cb[B.length], NG: cg[G.length], len: B.length };
  }
  function find(c, u) { var a = 0, b = c.length - 1; while (b - a > 1) { var m = (a + b) >> 1; if (c[m] <= u) a = m; else b = m; } return a; }   // the k with c[k] ≤ u < c[k + 1]

  /* ---------- roc: two groups on the score line, one cut-off, the ROC square ---------- */
  function roc(host, info) {
    var o = {}, key = '', D = null, cut = null, showCut, tally = null, last = null, timer = null, st = { on: false };
    function kOf(c) { return clamp(Math.round(c) - D.from, 0, D.len); }
    function rates(c) {
      var k = kOf(c), TP = D.cb[k], FP = D.cg[k];
      return { k: k, TP: TP, FP: FP, FN: D.NB - TP, TN: D.NG - FP, tpr: D.NB ? TP / D.NB : 0, fpr: D.NG ? FP / D.NG : 0 };
    }
    function auc() { var s = 0; for (var k = 0; k < D.len; k++) s += D.G[k] * (D.cb[k] + 0.5 * D.B[k]); return D.NB && D.NG ? s / (D.NB * D.NG) : 0.5; }
    function ks() {
      var best = -1, bk = 0;
      for (var k = 0; k <= D.len; k++) { var g = (D.NB ? D.cb[k] / D.NB : 0) - (D.NG ? D.cg[k] / D.NG : 0); if (g > best + 1e-12) { best = g; bk = k; } }
      return { v: best, k: bk, score: D.from + bk - 1 };
    }
    function stopAnim() { if (timer) { clearTimeout(timer); timer = null; } }
    function paint() {
      var W = 480, hasRoc = !!o.roc, L0 = 36, L1 = hasRoc ? 296 : 466, view = o.left || 'dist';
      var lo = o.lo != null ? o.lo : D.from, hi = o.hi != null ? o.hi : D.from + D.len, toy = D.NB + D.NG <= 60, s = '';
      if (hi <= lo) hi = lo + 1;
      var TOP = 18, BOT = 168, mid = 94, hh = 60, pos = {};
      function x(v) { return L0 + (clamp(v, lo, hi) - lo) / (hi - lo) * (L1 - L0); }
      var r = cut != null ? rates(cut) : null, xc = cut != null ? x(cut - 0.5) : null, kk = o.ks ? ks() : null;
      if (view !== 'none') {
        if (r && view !== 'cum') {
          s += box(L0, TOP, xc - L0, BOT - TOP, 'sy7-dec');
          if (xc - L0 > 62) s += txt(xc - 5, TOP + 9, T('← declined', '← отказ'), 'sy-ax sy7-sm', 'end');
          if (L1 - xc > 70) s += txt(xc + 5, TOP + 9, T('approved →', 'одобрен →'), 'sy-ax sy7-sm', 'start');
        }
        var tick = o.tick || 50;
        for (var tv = Math.ceil(lo / tick) * tick; tv <= hi; tv += tick) s += ln(x(tv), BOT, x(tv), BOT + 4, 'sy-tick') + txt(x(tv), BOT + 16, String(tv), 'sy-ax', 'middle');
        s += txt(L1, BOT + 30, T('credit score →', 'кредитный скор →'), 'sy-ax sy7-sm', 'end');
        var yb = mid;   // where a drawn pair sits
        if (view === 'dist' && toy) {   // every loan a dot on the line
          yb = BOT - 10;
          var lastX = [];   // a dot goes on the lowest row where it does not touch its left neighbour
          s += ln(L0, BOT, L1, BOT, 'sy-axl');
          for (var k = 0; k < D.len; k++) {
            var v = D.from + k, n = D.B[k] + D.G[k];
            for (var j = 0; j < n; j++) {
              var xv = x(v), lv = 0;
              while (lastX[lv] != null && xv - lastX[lv] < 14.5) lv++;
              lastX[lv] = xv;
              var cy = BOT - 10 - lv * 15, fb = j < D.B[k] ? 'o' : 'g';
              if (!pos[v + fb]) pos[v + fb] = [xv, cy];
              s += dot(xv, cy, 7, 'sy-dot sy-f-' + fb);
            }
          }
        } else if (view === 'dist') {   // bads' shares above the line, goods' below
          var bin = o.bin || 10, nb = Math.max(1, Math.ceil((hi - lo) / bin)), sb = [], sg = [], mx = 0, bw = (L1 - L0) / nb;
          for (j = 0; j < nb; j++) { sb[j] = 0; sg[j] = 0; }
          for (k = 0; k < D.len; k++) { if (!D.B[k] && !D.G[k]) continue; var jj = clamp(Math.floor((D.from + k - lo) / bin), 0, nb - 1); if (D.NB) sb[jj] += D.B[k] / D.NB; if (D.NG) sg[jj] += D.G[k] / D.NG; }
          for (j = 0; j < nb; j++) mx = Math.max(mx, sb[j], sg[j]);
          mx = mx || 1;
          for (j = 0; j < nb; j++) {
            var bx = L0 + j * bw, lite = cut != null && lo + (j + 0.5) * bin >= cut ? ' sy7-lite' : '';
            if (sb[j]) s += box(bx + 0.6, mid - sb[j] / mx * hh, bw - 1.2, sb[j] / mx * hh, 'sy7-bb' + lite);
            if (sg[j]) s += box(bx + 0.6, mid, bw - 1.2, sg[j] / mx * hh, 'sy7-bg' + lite);
          }
          s += ln(L0, mid, L1, mid, 'sy-axl') + ln(L0, BOT, L1, BOT, 'sy-axl');
          s += txt(L1 - 2, mid - 5, T('↑ bads', '↑ плохие'), 'sy-ax sy-or', 'end') + txt(L1 - 2, mid + 13, T('↓ goods', '↓ хорошие'), 'sy-ax sy7-tg', 'end');
        } else if (view === 'cum') {   // the two cumulative curves
          var y = function (sh) { return BOT - sh * (BOT - TOP - 8); };
          var path = function (arr, N, cls) {
            var pts = [], prev = 0;
            for (var v2 = lo; v2 <= hi; v2++) {
              var sh = N ? arr[clamp(v2 + 1 - D.from, 0, D.len)] / N : 0;
              if (v2 === lo) pts.push(P(x(v2), y(sh))); else { pts.push(P(x(v2), y(prev))); pts.push(P(x(v2), y(sh))); }
              prev = sh;
            }
            return '<polyline class="' + cls + '" points="' + pts.join(' ') + '"/>';
          };
          s += ln(L0, BOT, L1, BOT, 'sy-axl') + ln(L0, BOT, L0, TOP + 4, 'sy-axl');
          [0, 0.5, 1].forEach(function (q) { s += txt(L0 - 4, y(q) + 4, pc(q, 0), 'sy-ax sy7-sm', 'end'); });
          s += path(D.cb, D.NB, 'sy7-lb') + path(D.cg, D.NG, 'sy7-lg');
          if (r) {
            s += ln(xc, TOP, xc, BOT, 'sy7-cutd') + txt(xc, TOP - 6, T('score ≤ ', 'скор ≤ ') + (cut - 1), 'sy-ax sy7-sm', 'middle');
            s += ln(xc, y(r.fpr), xc, y(r.tpr), 'sy7-gap');
            var my = (y(r.fpr) + y(r.tpr)) / 2, right = xc < (L0 + L1) / 2;
            s += txt(xc + (right ? 6 : -6), my + 4, T('gap ', 'разрыв ') + num((r.tpr - r.fpr) * 100, 1), 'sy-ax sy-pl', right ? 'start' : 'end');
            s += dot(xc, y(r.tpr), 3.5, 'sy7-pt') + dot(xc, y(r.fpr), 3.5, 'sy7-pt');
          }
          if (kk) {
            var xk = x(D.from + kk.k - 0.5), tb = D.NB ? D.cb[kk.k] / D.NB : 0, tg = D.NG ? D.cg[kk.k] / D.NG : 0;
            s += ln(xk, y(tg), xk, y(tb), 'sy7-ks') + txt(xk + 5, y(tb) - 4, 'KS ' + dec(kk.v, 2), 'sy-ax sy-am', 'start');
          }
          yb = BOT;
        } else s += ln(L0, BOT, L1, BOT, 'sy-axl');
        if (r && view !== 'cum') s += ln(xc, TOP - 4, xc, BOT, 'sy7-cut') + txt(xc, TOP - 7, String(cut), 'sy-ax sy7-hot', 'middle');
        if (kk && view === 'dist') { var xk2 = x(D.from + kk.k - 0.5); s += ln(xk2, TOP + 14, xk2, BOT, 'sy7-ks sy-dash') + txt(xk2 + 4, TOP + 24, 'KS', 'sy-ax sy-am', 'start'); }
        if (last && view !== 'cum') {   // the last pair drawn: an arc from the good to the bad
          var pg = pos[last[0] + 'g'] || [x(last[0]), yb], pb = pos[last[1] + 'o'] || [x(last[1]), yb], cls = last[0] > last[1] ? 'sy7-win' : last[0] < last[1] ? 'sy7-lose' : 'sy7-tie';
          s += '<path class="' + cls + '" d="M' + P(pg[0], pg[1]) + ' Q' + P((pg[0] + pb[0]) / 2, Math.min(pg[1], pb[1]) - 46) + ' ' + P(pb[0], pb[1]) + '"/>';
          s += dot(pg[0], pg[1], 5, 'sy7-end sy-f-g') + dot(pb[0], pb[1], 5, 'sy7-end sy-f-o');
        }
      }
      if (hasRoc) {   // the ROC square: goods turned away across, bads caught up
        var X0 = 342, X1 = 466, Y0 = 148, Y1 = 24;
        var px = function (f) { return X0 + f * (X1 - X0); }, py = function (t) { return Y0 - t * (Y0 - Y1); };
        var curve = function (kmax) {
          var pts = [];
          for (var k2 = 0; k2 <= kmax; k2++) { if (k2 > 0 && k2 < kmax && !D.B[k2 - 1] && !D.G[k2 - 1]) continue; pts.push(P(px(D.NG ? D.cg[k2] / D.NG : 0), py(D.NB ? D.cb[k2] / D.NB : 0))); }
          return pts;
        };
        if (o.area) s += '<polygon class="sy-area" points="' + curve(D.len).join(' ') + ' ' + P(px(1), py(0)) + ' ' + P(px(0), py(0)) + '"/>' + txt(px(0.64), py(0.22), 'AUC ' + dec(auc(), 3), 'sy-ax sy-pl', 'middle');
        s += box(X0, Y1, X1 - X0, Y0 - Y1, 'sy7-frame') + ln(px(0), py(0), px(1), py(1), 'sy7-diag');
        var cv = o.curve === 'full' ? D.len : o.curve === 'trace' && r ? r.k : -1;
        if (cv >= 0) s += '<polyline class="sy-curve" points="' + curve(cv).join(' ') + '"/>';
        if (kk) { var fk = D.NG ? D.cg[kk.k] / D.NG : 0, tk = D.NB ? D.cb[kk.k] / D.NB : 0; s += ln(px(fk), py(fk), px(fk), py(tk), 'sy7-ks') + txt(px(fk) + 4, py((fk + tk) / 2) + 4, 'KS', 'sy-ax sy-am', 'start'); }
        if (r) {
          s += dot(px(r.fpr), py(r.tpr), 5, 'sy7-pt');
          var lab = '(' + pc(r.fpr, 1) + ', ' + pc(r.tpr, 1) + ')', lw = lab.length * 6.1, corner = (r.fpr === 0 || r.fpr === 1) && (r.tpr === 0 || r.tpr === 1);
          if (!(corner && o.corners)) s += txt(clamp(px(r.fpr), X0 + lw / 2 + 2, X1 + 12 - lw / 2), r.tpr > 0.25 ? py(r.tpr) + 17 : py(r.tpr) - 9, lab, 'sy-ax sy-pl', 'middle');
        }
        if (o.corners) s += txt(px(0) + 3, py(0) - 5, T('approve all', 'одобрить всех'), 'sy-ax sy7-sm', 'start') + txt(px(1) - 3, py(1) + 13, T('decline all', 'отказать всем'), 'sy-ax sy7-sm', 'end');
        s += txt(X0, Y0 + 12, '0', 'sy-ax sy7-sm', 'middle') + txt(X1, Y0 + 12, '100 %', 'sy-ax sy7-sm', 'end') + txt(X0 - 4, Y1 + 4, '100 %', 'sy-ax sy7-sm', 'end');
        s += txt((X0 + X1) / 2, Y0 + 26, T('goods turned away (FPR) →', 'отказано хорошим (FPR) →'), 'sy-ax sy7-tg', 'middle');
        s += vtxt(X0 - 12, (Y0 + Y1) / 2 + 14, T('bads caught (TPR) →', 'поймано плохих (TPR) →'), 'sy-ax sy-or');
      }
      host.innerHTML = svg(W, 202, s);
      if (o.drag && r && view !== 'none') dragX(host, W, L0, L1, lo, hi, st, function (v) {
        var stp = o.step || 1, c = clamp(Math.round(v / stp) * stp, D.from, D.from + D.len);
        if (c !== cut) { cut = c; paint(); }
      });
      /* the read-out */
      var parts = [], N = D.NB + D.NG, top = '';
      if (view === 'dist' || view === 'none') top = legend([['o', T('bads', 'плохие') + ' (' + big(D.NB) + ')'], ['g', T('goods', 'хорошие') + ' (' + big(D.NG) + ')']]);
      if (view === 'cum') top = legend([['o', T('share of the bads with this score or lower', 'доля плохих с таким скором или ниже')], ['g', T('share of the goods', 'доля хороших')]]);
      if (r) {
        if (view === 'cum') parts.push(T('Score %c or lower: {o|%b of the bads}, {g|%g of the goods} → gap {p|%d points}', 'Скор %c и ниже: {o|%b плохих}, {g|%g хороших} → разрыв {p|%d п.}')
          .replace('%c', cut - 1).replace('%b', pc(r.tpr, 1)).replace('%g', pc(r.fpr, 1)).replace('%d', num((r.tpr - r.fpr) * 100, 1)));
        else {
          parts.push(T('Decline below **%c**', 'Отказ ниже **%c**').replace('%c', cut));
          if (!o.cm && !o.appr) parts.push(T('caught {o|%a of %b bads}', 'поймано {o|%a из %b плохих}').replace('%a', big(r.TP)).replace('%b', big(D.NB)), T('turned away {g|%a of %b goods}', 'отказано {g|%a из %b хороших}').replace('%a', big(r.FP)).replace('%b', big(D.NG)));
        }
        if (o.rates) parts.push('TPR {o|' + pc(r.tpr, 1) + '}', 'FPR {g|' + pc(r.fpr, 1) + '}');
        if (o.acc && N) parts.push(T('right decisions {y|%a of %n} (%s)', 'верных решений {y|%a из %n} (%s)').replace('%a', big(r.TP + r.TN)).replace('%n', big(N)).replace('%s', pc((r.TP + r.TN) / N, 1)));
        if (o.appr && N) {
          var apn = r.FN + r.TN;
          parts.push(T('approved {b|%a of %n} (%s)', 'одобрено {b|%a из %n} (%s)').replace('%a', big(apn)).replace('%n', big(N)).replace('%s', pc(apn / N, 1)));
          parts.push(apn ? T('their bad rate {o|%s} (%b bad)', 'доля плохих среди них {o|%s} (%b)').replace('%s', pc(r.FN / apn, 1)).replace('%b', big(r.FN)) : T('nobody approved', 'не одобрен никто'));
        }
      }
      if (o.area || o.gini) parts.push('AUC {p|' + dec(auc(), 3) + '}' + (o.gini ? T(' · Gini {p|', ' · Джини {p|') + dec(2 * auc() - 1, 3) + '}' : ''));
      if (kk) parts.push(T('KS {y|%v} at %s (the widest gap)', 'KS {y|%v} при %s (наибольший разрыв)').replace('%v', dec(kk.v, 2)).replace('%s', kk.score));
      if (tally && tally.n) {
        parts.push(T('Pairs drawn: **%n** · the good one higher: {b|%w} (%s)', 'Пар: **%n** · у хорошего выше: {b|%w} (%s)').replace('%n', big(tally.n)).replace('%w', big(tally.w)).replace('%s', pc((tally.w + 0.5 * tally.t) / tally.n, 1)) +
          (tally.t ? T(' · ties %t (count half)', ' · ничьих %t (по половине)').replace('%t', big(tally.t)) : ''));
        if (last) parts.push(T('last: good **%g** vs bad **%b** %r', 'последняя: хороший **%g** против плохого **%b** %r').replace('%g', last[0]).replace('%b', last[1]).replace('%r', last[0] > last[1] ? '✓' : last[0] < last[1] ? '✗' : '='));
      }
      var cm = '';
      if (o.cm && r) cm = '<table class="sy7-cm"><tr><th></th><th>' + esc(T('bad', 'плохой')) + '</th><th>' + esc(T('good', 'хороший')) + '</th></tr>' +
        '<tr><th>' + esc(T('declined', 'отказ')) + '</th><td class="o">' + esc(T('caught', 'пойман')) + '<b>' + big(r.TP) + '</b></td><td class="g">' + esc(T('turned away', 'отказ зря')) + '<b>' + big(r.FP) + '</b></td></tr>' +
        '<tr><th>' + esc(T('approved', 'одобрен')) + '</th><td class="m">' + esc(T('missed', 'пропущен')) + '<b>' + big(r.FN) + '</b></td><td class="m">' + esc(T('approved, fine', 'одобрен верно')) + '<b>' + big(r.TN) + '</b></td></tr></table>';
      info.innerHTML = top + cm + read(parts);
    }
    return {
      set: function (nx) {
        var k = JSON.stringify([nx.n, nx.b, nx.from, nx.goods, nx.bads]);
        if (k !== key || nx.reset) { key = k; D = counts(nx); tally = null; last = null; stopAnim(); cut = nx.cut != null ? nx.cut : null; showCut = nx.cut; }
        else if (nx.cut !== showCut) { stopAnim(); cut = nx.cut != null ? nx.cut : null; showCut = nx.cut; }
        o = nx; paint();
      },
      act: function (a) {
        if (a.do === 'nudge') { stopAnim(); var c0 = cut != null ? cut : D.from; cut = clamp(c0 + (a.by || 0), D.from, D.from + D.len); paint(); }
        else if (a.do === 'sweep') {
          stopAnim();
          var c1 = D.from, c2 = D.from + D.len, steps = 40, i = 0;
          (function frame() { cut = Math.round(c1 + (c2 - c1) * i / steps); paint(); if (i++ < steps) timer = setTimeout(frame, 30); else timer = null; })();
        } else if (a.do === 'pairs') {
          if (!D.NB || !D.NG) return;
          tally = tally || { n: 0, w: 0, t: 0 };
          for (var j = 0; j < (a.n || 1); j++) {
            var g = D.from + find(D.cg, Math.floor(Math.random() * D.NG)), b = D.from + find(D.cb, Math.floor(Math.random() * D.NB));
            tally.n++; if (g > b) tally.w++; else if (g === b) tally.t++;
            last = [g, b];
          }
          paint();
        }
      }
    };
  }

  /* ---------- gains: ten deciles, worst first ---------- */
  function gains(host, info) {
    var o = {};
    function paint() {
      var n = o.n || [], b = o.b || [], m = n.length, NB = 0, NN = 0, s = '', hot = o.hot || 0, i;
      for (i = 0; i < m; i++) { NB += b[i] || 0; NN += n[i] || 0; }
      var cum = [0]; for (i = 0; i < m; i++) cum.push(cum[i] + (b[i] || 0));
      if (o.view === 'curve') {
        var X0 = 76, X1 = 410, Y0 = 168, Y1 = 22;
        var px = function (f) { return X0 + f * (X1 - X0); }, py = function (g) { return Y0 - g * (Y0 - Y1); };
        s += box(X0, Y1, X1 - X0, Y0 - Y1, 'sy7-frame') + ln(px(0), py(0), px(1), py(1), 'sy7-diag');
        s += txt(px(0.72), py(0.6), T('a coin toss', 'монетка'), 'sy-ax sy7-sm', 'start');
        var pts = [];
        for (i = 0; i <= m; i++) pts.push(P(px(i / m), py(NB ? cum[i] / NB : 0)));
        s += '<polyline class="sy-curve" points="' + pts.join(' ') + '"/>';
        for (i = 1; i <= m; i++) s += dot(px(i / m), py(NB ? cum[i] / NB : 0), i === hot ? 5.5 : 3, i === hot ? 'sy7-pt' : 'sy-iv-pt');
        if (hot && NB) {
          var gx = px(hot / m), gy = py(cum[hot] / NB);
          s += ln(gx, Y0, gx, gy, 'sy7-cutd') + ln(X0, gy, gx, gy, 'sy7-cutd');
          s += txt(gx + 7, gy + 14, pc(cum[hot] / NB, 1) + T(' of the bads', ' плохих'), 'sy-ax sy-or', 'start');
        }
        for (i = 0; i <= m; i += 2) s += txt(px(i / m), Y0 + 14, pc(i / m, 0), 'sy-ax sy7-sm', 'middle');
        [0, 0.5, 1].forEach(function (q) { s += txt(X0 - 5, py(q) + 4, pc(q, 0), 'sy-ax sy7-sm', 'end'); });
        s += txt(X1, Y0 + 28, T('the worst-scored share of the loans →', 'доля кредитов с худшими скорами →'), 'sy-ax sy7-sm', 'end');
        s += vtxt(X0 - 40, (Y0 + Y1) / 2, T('share of all bads →', 'доля всех плохих →'), 'sy-ax sy-or');
      } else {
        var L = 40, R = 466, B = 166, Tp = 24, bw = (R - L) / Math.max(1, m), rates = [], top = 0, avg = NN ? NB / NN : 0;
        for (i = 0; i < m; i++) { rates[i] = n[i] ? b[i] / n[i] : 0; top = Math.max(top, rates[i]); }
        top = Math.max(top, avg) * 1.16 || 1;
        var y = function (v) { return B - v / top * (B - Tp); };
        for (i = 0; i < m; i++) {
          s += box(L + i * bw + 3, y(rates[i]), bw - 6, B - y(rates[i]), 'sy-bar' + (i < hot ? ' sy-hot' : ''), 2);
          s += txt(L + (i + 0.5) * bw, y(rates[i]) - 4, i < hot ? big(b[i]) + T(' bads', ' плох.') : num(rates[i] * 100, 1), 'sy-ax ' + (i < hot ? 'sy-or' : 'sy7-sm'), 'middle');
          s += txt(L + (i + 0.5) * bw, B + 14, String(i + 1), 'sy-ax', 'middle');
        }
        s += ln(L, B, R, B, 'sy-axl');
        if (o.avg) s += ln(L, y(avg), R, y(avg), 'sy-mean') + txt(R, y(avg) - 5, T('average ', 'в среднем ') + pc(avg, 2), 'sy-ax sy-pl', 'end');
        s += txt(L, B + 28, T('← worst scores', '← худшие скоры'), 'sy-ax sy7-sm', 'start') + txt(R, B + 28, T('best scores →', 'лучшие скоры →'), 'sy-ax sy7-sm', 'end');
        s += vtxt(L - 18, (B + Tp) / 2, T('bad rate, %', 'доля плохих, %'), 'sy-ax sy7-sm');
      }
      host.innerHTML = svg(480, 204, s);
      var parts = [];
      if (hot && NB && NN) {
        var share = cum[hot] / NB, nl = 0; for (i = 0; i < hot; i++) nl += n[i];
        parts.push(T('The worst **%p** of the loans (%l): {o|%b of %t bads} = gain {o|%g}', 'Худшие **%p** кредитов (%l): {o|%b из %t плохих} = прирост {o|%g}').replace('%p', pc(hot / m, 0)).replace('%l', big(nl)).replace('%b', big(cum[hot])).replace('%t', big(NB)).replace('%g', pc(share, 1)));
        if (o.lift !== false) parts.push(T('lift {y|%v}', 'лифт {y|%v}').replace('%v', dec(share / (hot / m), 2)));
      }
      info.innerHTML = read(parts);
    }
    return { set: function (nx) { o = nx; paint(); }, act: function () { /* nothing to run */ } };
  }

  /* ---------- fall: one loan's money, line by line ---------- */
  function fall(host, info) {
    var o = {};
    function paintPD() {
      var g = o.good || 0, b = o.bad || 0, pmax = o.pmax || 0.1, X0 = 64, X1 = 456, Y1 = 22, Y0 = 168, s = '';
      var vmax = g, vmin = Math.min(0, g - pmax * (g + b)), top = vmax + (vmax - vmin) * 0.12 || 1, bot = vmin - (vmax - vmin) * 0.08;
      var px = function (p) { return X0 + p / pmax * (X1 - X0); }, py = function (v) { return Y1 + (top - v) / (top - bot) * (Y0 - Y1); };
      var be = g + b ? g / (g + b) : 0, pe = Math.min(be, pmax);
      s += '<polygon class="sy7-gainA" points="' + P(px(0), py(0)) + ' ' + P(px(0), py(g)) + ' ' + P(px(pe), py(g - pe * (g + b))) + ' ' + P(px(pe), py(0)) + '"/>';
      if (be < pmax) s += '<polygon class="sy7-lossA" points="' + P(px(be), py(0)) + ' ' + P(px(pmax), py(g - pmax * (g + b))) + ' ' + P(px(pmax), py(0)) + '"/>';
      s += ln(X0, py(0), X1, py(0), 'sy7-zero') + ln(X0, Y1, X0, Y0, 'sy-axl');
      s += ln(px(0), py(g), px(pmax), py(g - pmax * (g + b)), 'sy-curve');
      for (var i = 0; i <= 5; i++) s += txt(px(pmax * i / 5), Y0 + 14, pc(pmax * i / 5, 0), 'sy-ax sy7-sm', 'middle');
      s += txt(X1, Y0 + 28, T('share of the loans that go bad (PD) →', 'доля кредитов, ставших плохими (PD) →'), 'sy-ax sy7-sm', 'end');
      s += txt(X0 - 5, py(g) + 4, money(g, o.fmt), 'sy-ax sy7-sm', 'end') + txt(X0 - 5, py(0) + 4, '0', 'sy-ax sy7-sm', 'end');
      s += txt(X0 + 6, Y1 - 6, T('what one loan leaves, on average', 'что в среднем оставляет один кредит'), 'sy-ax sy7-sm', 'start');
      (o.pd || []).forEach(function (q) { var v = g - q * (g + b); s += dot(px(q), py(v), 5, 'sy7-pt') + txt(px(q) + 8, py(v) - 7, pc(q, 2) + ' → ' + money(v, o.fmt), 'sy-ax sy-pl', 'start'); });
      if (o.be && be <= pmax) s += ln(px(be), Y1 + 8, px(be), Y0, 'sy7-be') + dot(px(be), py(0), 5, 'sy7-pt') + txt(px(be) - 8, py(0) + 16, T('break-even ', 'безубыточность ') + pc(be, 2), 'sy-ax sy-pl', 'end');
      host.innerHTML = svg(480, 202, s);
      var parts = [T('a good loan leaves {g|%g} · a bad one costs {o|%b}', 'хороший кредит оставляет {g|%g} · плохой стоит {o|%b}').replace('%g', money(g, 's')).replace('%b', money(b, 's'))];
      if (o.be) parts.push(T('break-even PD = good ÷ (good + bad) = {p|%s}', 'безубыточный PD = хороший ÷ (хороший + плохой) = {p|%s}').replace('%s', pc(be, 2)));
      info.innerHTML = read(parts);
    }
    function paint() {
      if (o.view === 'pd') { paintPD(); return; }
      var items = o.items || [], labels = o.labels || [], m = items.length, shown = Math.min(o.upto != null ? o.upto : m, m), tot = !!o.total && shown >= m;
      var cols = m + (o.total ? 1 : 0), L = 14, R = 466, Tp = 24, B = 160, bw = (R - L) / Math.max(1, cols), s = '';
      var run = [0], i, hi = 0, lo = 0;
      for (i = 0; i < m; i++) { run.push(run[i] + items[i][0]); hi = Math.max(hi, run[i + 1]); lo = Math.min(lo, run[i + 1]); }
      if (hi === lo) hi = lo + 1;
      var y = function (v) { return Tp + (hi - v) / (hi - lo) * (B - Tp); };
      s += ln(L, y(0), R, y(0), lo < 0 ? 'sy7-zero' : 'sy-axl');
      for (i = 0; i < shown; i++) {
        var a = run[i], b = run[i + 1], top = Math.min(y(a), y(b)), h = Math.max(1.5, Math.abs(y(a) - y(b))), x = L + i * bw, v = items[i][0];
        s += box(x + 6, top, bw - 12, h, 'sy7-f-' + (items[i][1] || 'm'), 2);
        if (o.hot === i) s += box(x + 4, top - 2, bw - 8, h + 4, 'sy7-pick', 3);
        s += txt(x + bw / 2, v >= 0 ? top - 4 : top + h + 11 > B + 2 ? top + h - 5 : top + h + 11, (v > 0 ? '+' : '') + money(v, o.fmt), 'sy-ax sy7-v', 'middle');
        if (i + 1 < shown || (tot && i === m - 1)) s += ln(x + bw - 6, y(b), x + bw + 6, y(b), 'sy7-con');
      }
      if (tot) {
        var e = run[m], xT = L + m * bw, t0 = Math.min(y(0), y(e)), h2 = Math.max(1.5, Math.abs(y(0) - y(e)));
        s += box(xT + 6, t0, bw - 12, h2, 'sy7-f-' + (o.totalTone || 'y'), 2) + txt(xT + bw / 2, e >= 0 ? t0 - 4 : t0 + h2 + 11 > B + 2 ? t0 + h2 - 5 : t0 + h2 + 11, money(e, o.fmt), 'sy-ax sy7-hot', 'middle');
      }
      for (i = 0; i < cols; i++) {
        if (!(i < shown || (i === m && tot))) continue;
        String(labels[i] == null ? '' : labels[i]).split('\n').forEach(function (w, j) { s += txt(L + (i + 0.5) * bw, B + 15 + j * 12, w, 'sy-ax ' + (i === m ? 'sy-am' : 'sy7-sm'), 'middle'); });
      }
      host.innerHTML = svg(480, 192, s);
      info.innerHTML = read(shown ? [(tot ? T('What is left: {y|%v}', 'Что осталось: {y|%v}') : T('Running total: {y|%v}', 'Нарастающий итог: {y|%v}')).replace('%v', money(run[shown], 's') + T(' soum', ' сум'))] : []);
    }
    return { set: function (nx) { o = nx; paint(); }, act: function () { /* nothing to run */ } };
  }

  /* ---------- cutoff: approval, bad rate and money over every line ---------- */
  function cutoff(host, info) {
    var o = {}, key = '', D = null, cut = null, showCut, st = { on: false };
    function econ() {
      var e = o.econ || {};
      if (e.good != null) return { g: e.good, b: e.bad };
      var cof = (e.cof || 0) * (o.fund || 0.18) / 0.18;
      return { g: (e.i || 0) - cof - (e.opex || 0), b: (e.lgd || 0) * (e.ead || 0) + cof + (e.opex || 0) };
    }
    function at(c) {
      var k = clamp(Math.round(c) - D.from, 0, D.len), ab = D.NB - D.cb[k], ag = D.NG - D.cg[k], ap = ab + ag, E = econ(), e = o.econ || {};
      return { c: c, ap: ap, appr: D.NB + D.NG ? ap / (D.NB + D.NG) : 0, br: ap ? ab / ap : 0, ab: ab, ag: ag, avoid: D.cb[k], lost: D.cg[k],
        profit: E.g * ag - E.b * ab, el: ap && e.ead ? ab / ap * (e.lgd || 0) * e.ead : 0 };
    }
    function bestCut() { var bc = D.from, bv = -Infinity; for (var c = D.from; c <= D.from + D.len; c++) { var p = at(c).profit; if (p > bv + 1e-6) { bv = p; bc = c; } } return { c: bc, v: bv }; }
    function targetCut() { for (var c = D.from; c <= D.from + D.len; c++) { var a = at(c); if (a.ap && a.br <= o.target + 1e-12) return c; } return null; }
    function beRate() { if (typeof o.be === 'number') return o.be; var E = econ(); return E.g + E.b ? E.g / (E.g + E.b) : 0; }
    var KIND = {
      appr: { f: function (a) { return a.appr; }, cls: 'sy7-l-b', tc: 'sy7-tb', lg: 'b', w: function () { return T('approved', 'одобрено'); }, t: function (v) { return pc(v, 0); } },
      br: { f: function (a) { return a.br; }, cls: 'sy7-l-o', tc: 'sy-or', lg: 'o', w: function () { return T('bad rate of the approved', 'доля плохих среди одобренных'); }, t: function (v) { return pc(v, 1); } },
      profit: { f: function (a) { return a.profit; }, cls: 'sy7-l-y', tc: 'sy-am', lg: 'y', w: function () { return T('profit', 'прибыль'); }, t: function (v) { return money(v); } },
      el: { f: function (a) { return a.el; }, cls: 'sy7-l-p', tc: 'sy-pl', lg: 'p', w: function () { return T('expected loss per approved loan', 'ожидаемые потери на одобренный кредит'); }, t: function (v) { return money(v, 'k'); } }
    };
    function paintBands() {
      var ed = o.edges || [], nb = ed.length + 1, rows = [], i, k, top = 0, be = o.be ? beRate() : null, s = '';
      for (i = 0; i < nb; i++) rows.push({ n: 0, b: 0 });
      for (k = 0; k < D.len; k++) { var v = D.from + k, j = 0; while (j < ed.length && v >= ed[j]) j++; rows[j].n += D.B[k] + D.G[k]; rows[j].b += D.B[k]; }
      rows.forEach(function (r) { r.rate = r.n ? r.b / r.n : 0; top = Math.max(top, r.rate); });
      top = Math.max(top, be || 0) * 1.18 || 1;
      var L = 40, R = 466, B = 160, Tp = 26, bw = (R - L) / nb, y = function (q) { return B - q / top * (B - Tp); };
      for (i = 0; i < nb; i++) {
        var r = rows[i], fill = o.decide && be != null ? (r.rate > be ? 'o' : 'g') : 'b';
        s += box(L + i * bw + 3, y(r.rate), bw - 6, B - y(r.rate), 'sy7-f-' + fill, 2);
        if (o.pick === i) s += box(L + i * bw + 1, y(r.rate) - 2, bw - 2, B - y(r.rate) + 2, 'sy7-pick', 3);
        s += txt(L + (i + 0.5) * bw, y(r.rate) - 4, num(r.rate * 100, 1), 'sy-ax ' + (o.pick === i ? 'sy7-hot' : 'sy7-sm'), 'middle');
        s += txt(L + (i + 0.5) * bw, B + 14, i === 0 ? '<' + ed[0] : i === nb - 1 ? ed[nb - 2] + '+' : String(ed[i - 1]), 'sy-ax ' + (o.pick === i ? 'sy7-hot' : 'sy7-sm'), 'middle');
      }
      s += ln(L, B, R, B, 'sy-axl');
      if (be != null) s += ln(L, y(be), R, y(be), 'sy7-be') + txt(R, y(be) - 5, T('break-even ', 'безубыточность ') + pc(be, 2), 'sy-ax sy-pl', 'end');
      if (cut != null) { var ci = ed.indexOf(cut); if (ci >= 0) { var xc = L + (ci + 1) * bw; s += ln(xc, Tp - 10, xc, B, 'sy7-cut') + txt(xc, Tp - 13, T('approve from ', 'одобрять от ') + cut, 'sy-ax sy7-hot', 'middle'); } }
      s += txt(R, B + 29, T('score band (from) →', 'полоса скоров (от) →'), 'sy-ax sy7-sm', 'end') + vtxt(L - 20, (B + Tp) / 2, T('bad rate, %', 'доля плохих, %'), 'sy-ax sy7-sm');
      host.innerHTML = svg(480, 196, s);
      var parts = [];
      if (o.pick != null && rows[o.pick]) {
        var p = rows[o.pick], a0 = o.pick === 0 ? null : ed[o.pick - 1], a1 = o.pick === nb - 1 ? null : ed[o.pick] - 1;
        var nm = a0 == null ? T('below %b', 'ниже %b').replace('%b', ed[0]) : a1 == null ? a0 + '+' : a0 + '–' + a1;
        parts.push(T('Scores **%n**: {o|%b bads} of %l loans = {o|%r}', 'Скоры **%n**: {o|%b плохих} из %l кредитов = {o|%r}').replace('%n', nm).replace('%b', big(p.b)).replace('%l', big(p.n)).replace('%r', pc(p.rate, 1)));
        if (o.decide && be != null) parts.push(p.rate > be ? T('above the break-even → {o|decline}', 'выше безубыточности → {o|отказать}') : T('below the break-even → {g|keep}', 'ниже безубыточности → {g|одобрять}'));
      }
      if (be != null) parts.push(T('break-even {p|%s}', 'безубыточность {p|%s}').replace('%s', pc(be, 2)));
      info.innerHTML = read(parts);
    }
    function paint() {
      if (o.view === 'bands') { paintBands(); return; }
      var lo = o.lo != null ? o.lo : D.from, hi = o.hi != null ? o.hi : D.from + D.len, X0 = 64, X1 = 424, Y1 = 24, Y0 = 162, s = '';
      if (hi <= lo) hi = lo + 1;
      var xs = function (c) { return X0 + (clamp(c, lo, hi) - lo) / (hi - lo) * (X1 - X0); };
      var A = []; for (var c = lo; c <= hi; c++) A.push(at(c));
      var names = (o.lines || ['appr', 'br']).slice(0, 2), sc = [];
      names.forEach(function (nm, i) {
        var K = KIND[nm]; if (!K) return;
        var vals = A.map(K.f), mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals), a, b;
        if (nm === 'appr') { a = 0; b = 1; } else if (nm === 'br') { a = 0; b = Math.ceil(mx * 200 + 1e-9) / 200 || 0.01; } else if (nm === 'profit') { a = Math.min(0, mn); b = mx * 1.08 || 1; } else { a = 0; b = mx * 1.12 || 1; }
        sc[i] = { K: K, y: function (v) { return Y0 - (v - a) / (b - a) * (Y0 - Y1); } };
        s += '<polyline class="' + K.cls + '" points="' + A.map(function (q, j) { return P(xs(lo + j), sc[i].y(K.f(q))); }).join(' ') + '"/>';
        [a, (a + b) / 2, b].forEach(function (v) { s += txt(i ? X1 + 5 : X0 - 5, sc[i].y(v) + 4, K.t(v), 'sy-ax ' + K.tc, i ? 'start' : 'end'); });
        if (nm === 'profit' && a < 0) s += ln(X0, sc[i].y(0), X1, sc[i].y(0), 'sy7-zero');
      });
      s += ln(X0, Y0, X1, Y0, 'sy-axl');
      var tick = o.tick || 40;
      for (var tv = Math.ceil(lo / tick) * tick; tv <= hi; tv += tick) s += ln(xs(tv), Y0, xs(tv), Y0 + 4, 'sy-tick') + txt(xs(tv), Y0 + 16, String(tv), 'sy-ax', 'middle');
      s += txt(X1, Y0 + 30, T('approve from score →', 'одобрять от скора →'), 'sy-ax sy7-sm', 'end');
      var pi = names.indexOf('profit'), bi = names.indexOf('br');
      if (o.best && pi >= 0 && sc[pi]) { var bc = bestCut(); if (bc.c >= lo && bc.c <= hi) { var by = sc[pi].y(bc.v); s += dot(xs(bc.c), by, 5.5, 'sy7-pt') + txt(xs(bc.c), by - 9, T('best ', 'лучший ') + bc.c, 'sy-ax sy-pl', 'middle'); } }
      if (o.target != null) {
        var tc = targetCut();
        if (tc != null && tc >= lo && tc <= hi) {
          s += ln(xs(tc), Y1 - 6, xs(tc), Y0, 'sy7-be') + txt(xs(tc) + 4, Y0 - 6, T('bad rate ≤ ', 'доля плохих ≤ ') + pc(o.target, 1) + ': ' + tc, 'sy-ax sy-pl', 'start');
          if (bi >= 0 && sc[bi]) s += ln(X0, sc[bi].y(o.target), X1, sc[bi].y(o.target), 'sy7-diag');
        }
      }
      if (cut != null) {
        var ac = at(cut);
        s += ln(xs(cut), Y1 - 8, xs(cut), Y0, 'sy7-cut') + txt(xs(cut), Y1 - 11, String(cut), 'sy-ax sy7-hot', 'middle');
        names.forEach(function (nm, i) { if (sc[i]) s += dot(xs(cut), sc[i].y(sc[i].K.f(ac)), 4.5, 'sy7-pt'); });
      }
      host.innerHTML = svg(480, 198, s);
      if (o.drag && cut != null) dragX(host, 480, X0, X1, lo, hi, st, function (v) { var c2 = clamp(Math.round(v), lo, hi); if (c2 !== cut) { cut = c2; paint(); } });
      var top = legend(names.filter(function (nm) { return KIND[nm]; }).map(function (nm) { return [KIND[nm].lg, KIND[nm].w()]; })), parts = [];
      if (cut != null) {
        var q = at(cut);
        parts.push(T('Approve from **%c**: {b|%a} approved (%n loans)', 'Одобрять от **%c**: одобрено {b|%a} (%n кредитов)').replace('%c', cut).replace('%a', pc(q.appr, 1)).replace('%n', big(q.ap)));
        parts.push(T('bad rate {o|%s}', 'доля плохих {o|%s}').replace('%s', pc(q.br, o.target != null ? 3 : 2)));
        if (o.avoid) parts.push(T('bads avoided {o|%a} · goods turned away {g|%g}', 'избежали плохих {o|%a} · отказано хорошим {g|%g}').replace('%a', big(q.avoid)).replace('%g', big(q.lost)) +
          (q.avoid ? T(' ({g|%r} goods per bad)', ' ({g|%r} хороших на одного плохого)').replace('%r', num(q.lost / q.avoid, 1)) : ''));
        if (names.indexOf('el') >= 0) parts.push(T('expected loss {p|%v} per approved loan', 'ожидаемые потери {p|%v} на одобренный кредит').replace('%v', big(q.el) + T(' soum', ' сум')));
        if (pi >= 0) parts.push(T('profit {y|%v}', 'прибыль {y|%v}').replace('%v', money(q.profit) + T(' soum', ' сум')));
      }
      if (o.best && pi >= 0) { var b2 = bestCut(); parts.push(T('the best line: **%c** ({y|%v})', 'лучшая линия: **%c** ({y|%v})').replace('%c', b2.c).replace('%v', money(b2.v))); }
      info.innerHTML = top + read(parts);
    }
    return {
      set: function (nx) {
        var k = JSON.stringify([nx.n, nx.b, nx.from]);
        if (k !== key || nx.reset) { key = k; D = counts(nx); cut = nx.cut != null ? nx.cut : null; showCut = nx.cut; }
        else if (nx.cut !== showCut) { cut = nx.cut != null ? nx.cut : null; showCut = nx.cut; }
        o = nx; paint();
      },
      act: function (a) {
        if (a.do !== 'nudge' || o.view === 'bands') return;
        var lo = o.lo != null ? o.lo : D.from, hi = o.hi != null ? o.hi : D.from + D.len;
        cut = clamp((cut != null ? cut : lo) + (a.by || 0), lo, hi); paint();
      }
    };
  }

  /* ---------- psi: two populations over the same bands ---------- */
  function zone(v) { return v < 0.1 ? ['g', T('stable', 'стабильно')] : v <= 0.25 ? ['y', T('watch', 'наблюдать')] : ['o', T('act', 'действовать')]; }
  function psi(host, info) {
    var o = {};
    function paint() {
      var s = '', w = o.words || {}, labels = o.labels || [];
      if (o.view === 'months') {
        var vals = o.vals || [], m = vals.length, L = 46, R = 466, B = 156, Tp = 24, bw = (R - L) / Math.max(1, m), mx = 0.11;
        vals.forEach(function (v) { mx = Math.max(mx, v[0] * 1.15); });
        var y = function (v) { return B - v / mx * (B - Tp); };
        vals.forEach(function (v, i) {
          var z = zone(v[0]);
          s += box(L + i * bw + 4, y(v[0]), bw - 8, B - y(v[0]), 'sy7-f-' + z[0], 2);
          s += txt(L + (i + 0.5) * bw, y(v[0]) - 4, dec(v[0], 3), 'sy-ax sy7-sm', 'middle');
          s += txt(L + (i + 0.5) * bw, B + 14, labels[i] == null ? '' : String(labels[i]), 'sy-ax', 'middle');
          if (v[1] != null) s += txt(L + (i + 0.5) * bw, B + 26, big(v[1]), 'sy-ax sy7-sm', 'middle');
        });
        s += ln(L, B, R, B, 'sy-axl') + ln(L, y(0.1), R, y(0.1), 'sy7-be') + txt(L - 4, y(0.1) + 4, dec(0.1, 1), 'sy-ax sy-pl', 'end');
        if (mx > 0.25) s += ln(L, y(0.25), R, y(0.25), 'sy-alarm sy-dash') + txt(L - 4, y(0.25) + 4, dec(0.25, 2), 'sy-ax sy-or', 'end');
        s += txt(L, Tp - 10, T('PSI of each month against the reference', 'PSI каждого месяца против эталона'), 'sy-ax sy7-sm', 'start');
        if (vals.some(function (v) { return v[1] != null; })) s += txt(R, B + 40, T('applicants that month', 'заявителей за месяц'), 'sy-ax sy7-sm', 'end');
        host.innerHTML = svg(480, 206, s);
        info.innerHTML = read([T('under 0.1 stable · 0.1–0.25 watch · over 0.25 act', 'до 0,1 стабильно · 0,1–0,25 наблюдать · больше 0,25 действовать')]);
        return;
      }
      var e = o.e || [], a = o.a || [], m = Math.max(e.length, a.length), L = 30, R = 466, B = 148, Tp = 30, bw = (R - L) / Math.max(1, m), mx = 0, total = 0, parts = [];
      for (var i = 0; i < m; i++) { mx = Math.max(mx, e[i] || 0, a[i] || 0); var ee = Math.max(e[i] || 0, 1e-4), aa = Math.max(a[i] || 0, 1e-4); parts[i] = (aa - ee) * Math.log(aa / ee); total += parts[i]; }
      mx = mx * 1.12 || 1;
      var y = function (v) { return B - v / mx * (B - Tp); };
      for (i = 0; i < m; i++) {
        var x0 = L + i * bw, half = (bw - 10) / 2;
        s += box(x0 + 5, y(e[i] || 0), half, B - y(e[i] || 0), 'sy7-f-p', 2) + box(x0 + 5 + half, y(a[i] || 0), half, B - y(a[i] || 0), 'sy7-f-b', 2);
        s += txt(x0 + 5 + half / 2, y(e[i] || 0) - 3, num((e[i] || 0) * 100, 1), 'sy-ax sy7-sm', 'middle') + txt(x0 + 5 + half * 1.5, y(a[i] || 0) - 3, num((a[i] || 0) * 100, 1), 'sy-ax sy7-sm', 'middle');
        s += txt(x0 + bw / 2, B + 14, labels[i] == null ? '' : String(labels[i]), 'sy-ax', 'middle');
        if (o.parts) s += txt(x0 + bw / 2, B + 28, '+' + dec(parts[i], 4), 'sy-ax sy-pl', 'middle');
      }
      s += ln(L, B, R, B, 'sy-axl');
      var z = zone(total), tv = dec(total, total < 0.01 ? 4 : 3);
      if (o.sum !== false) s += txt(R, 14, 'PSI = ' + tv + ' · ' + z[1], 'sy-ax ' + (z[0] === 'g' ? 'sy7-tg' : z[0] === 'y' ? 'sy-am' : 'sy-or'), 'end');
      s += txt(L, 14, T('share of applicants per band, %', 'доля заявителей в полосе, %'), 'sy-ax sy7-sm', 'start');
      if (o.parts) s += txt(L, B + 44, T('each band adds (today − reference) × ln(today ÷ reference)', 'полоса добавляет (сейчас − эталон) × ln(сейчас ÷ эталон)'), 'sy-ax sy7-sm', 'start');
      host.innerHTML = svg(480, o.parts ? 198 : 170, s);
      info.innerHTML = legend([['p', w.e || T('reference', 'эталон')], ['b', w.a || T('today', 'сейчас')]]) +
        (o.sum !== false ? read(['PSI {' + z[0] + '|' + tv + '} — ' + z[1], T('under 0.1 stable · 0.1–0.25 watch · over 0.25 act', 'до 0,1 стабильно · 0,1–0,25 наблюдать · больше 0,25 действовать')]) : '');
    }
    return { set: function (nx) { o = nx; paint(); }, act: function () { /* nothing to run */ } };
  }

  /* ---------- rows: one labelled bar (or interval) per row ---------- */
  function rows(host, info) {
    var o = {};
    function paint() {
      var R0 = o.rows || [], labels = o.labels || [], n = R0.length, Tp = 14, rh = 28, s = '', dp = o.dp != null ? o.dp : 2, ml = 0;
      labels.forEach(function (l) { ml = Math.max(ml, String(l == null ? '' : l).length); });
      var LX = clamp(ml * 6.1 + 14, 110, 236), RX = 420;
      var mx = 0; R0.forEach(function (r) { mx = Math.max(mx, r[0] || 0, r[2] || 0); });
      var lo = o.lo != null ? o.lo : 0, hi = o.hi != null ? o.hi : mx * 1.1 || 1;
      var x = function (v) { return LX + (clamp(v, lo, hi) - lo) / (hi - lo) * (RX - LX); };
      var B = Tp + n * rh + 4;
      function f(v) { return o.pct ? num(v * 100, dp) + ' %' : o.big ? big(v) : num(v, dp); }
      if (o.ref) s += box(x(o.ref[0]), Tp - 4, x(o.ref[1]) - x(o.ref[0]), B - Tp + 4, 'sy-hband') + txt((x(o.ref[0]) + x(o.ref[1])) / 2, B + 28, (o.words && o.words.ref) || '', 'sy-ax sy-pl', 'middle');
      R0.forEach(function (r, i) {
        var yc = Tp + i * rh + rh / 2, fill = r[3] || 'b', hot = o.hot === i;
        s += txt(LX - 8, yc + 4, labels[i] == null ? '' : String(labels[i]), 'sy-ax' + (hot ? ' sy7-hot' : ''), 'end');
        if (r[1] != null && r[2] != null) {
          s += ln(x(r[1]), yc, x(r[2]), yc, 'sy-iv') + ln(x(r[1]), yc - 5, x(r[1]), yc + 5, 'sy-iv') + ln(x(r[2]), yc - 5, x(r[2]), yc + 5, 'sy-iv');
          var fi = function (v) { return o.dpi != null ? num(v, o.dpi) : f(v); };
          s += dot(x(r[0]), yc, 5.5, 'sy7-end sy7-f-' + fill) + txt(x(r[0]), yc - 9, f(r[0]) + '  (' + fi(r[1]) + '–' + fi(r[2]) + ')', 'sy-ax ' + (hot ? 'sy7-hot' : 'sy7-v'), 'middle');
        } else {
          s += box(x(lo), yc - 8, x(r[0]) - x(lo), 16, 'sy7-f-' + fill, 3);
          if (hot) s += box(x(lo) - 2, yc - 10, x(r[0]) - x(lo) + 4, 20, 'sy7-pick', 4);
          s += txt(x(r[0]) + 6, yc + 4, f(r[0]), 'sy-ax ' + (hot ? 'sy7-hot' : 'sy7-v'), 'start');
        }
      });
      s += ln(LX, B, RX, B, 'sy-axl');
      for (var k = 0; k <= 4; k++) { var tv = lo + (hi - lo) * k / 4; s += txt(x(tv), B + 14, f(tv), 'sy-ax sy7-sm', 'middle'); }
      host.innerHTML = svg(480, B + (o.ref ? 36 : 22), s);
      info.innerHTML = o.legend ? legend(o.legend) : '';
    }
    return { set: function (nx) { o = nx; paint(); }, act: function () { /* nothing to run */ } };
  }

  S.scenes.roc = roc;
  S.scenes.gains = gains;
  S.scenes.fall = fall;
  S.scenes.cutoff = cutoff;
  S.scenes.psi = psi;
  S.scenes.rows = rows;
})();
