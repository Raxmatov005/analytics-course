/* Story pictures for Week 9 Days 1–2 (correlation, regression, odds and the logistic curve), added to story.js's registry
(window.ALStory.scenes). Loaded right after story.js; see story.js's header for the block format. A kind is
function (host, info) → {set(opts), act(a)}: it draws into host (an SVG via ALStory.svg) and its read-out into info.
Words shown in a picture live in "words" / "labels" / "legend" (validate_pages.py compares the rest across languages).

  scatter — one dot per loan: "pts" [[x, y, group?], …], "cols" [fill per group] ("b" default), "xr" / "yr" [lo, hi],
            "xt" / "yt" tick steps; words {x, y (axis names), xu, yu (units), slope (the slope's unit), groups [names],
            range, marks [names], n}.
            "mean" a cross through the average point; "quad" shades the four corners round it (+ green, − orange) and
            rings each dot by the sign of its product; "ybar" the flat line at the average y, "res0" the gaps to it;
            "line": "fit" (least squares), [a, b], or "guess" (a line she drags by its two round ends; "guess" [a, b]
            is where it starts; act "fit" snaps it to least squares, "tilt" / "lift" by); "res" the gaps (residuals)
            to that line, "sq" their squares; "lines" [[a, b, colour], …] fixed lines; "gfit" one least-squares line per
            group; "resplot" the residual plot (residual of the least-squares line against x; "gmean" each group's
            average residual); "rank" x and y replaced by their ranks; "drag" i — she drags loan i up or down (act
            "nudge" by), "ghost" keeps the starting line dashed; "hot" i rings one loan; "pred" x reads the line there
            ("predOn" k: on lines[k]); "range" [x0, x1] shades where the data are; "marks" [[x, y], …] diamonds;
            "tri" dx a slope triangle from the average x (on lines[k] with "triOn" k); "one" treats every loan as one
            group; "big" shows r large; "sk" / "sdp" / "adp" scale and round
            the slope and the intercept in the read-out.
            "read" [items]: r, r2, sp (Spearman), line, ss, tot, r2ss, q (corners), gr (r per group), gm (average
            residual per group), key (the groups' colours), hot, lev, chg (slope against the start), pred, mean, n.
            act "nudge" takes "to" (a value) instead of "by".
  arrows  — a small cause diagram: "nodes" [[x, y, fill], …] with "labels" [names]; "edges" [[from, to, style], …]:
            "s" a cause, "x" a claimed arrow struck out, "d" a doubtful arrow; words {edges: [labels]}; "legend" [lines].
  logit   — yes / no outcomes and the S-curve. "view":
            "rulers": three linked rulers — probability, odds, log-odds — and a marker she drags along the
              probability ruler ("p" the start; act "set" p, "nudge" by); "row" [bad, good] a row of loans above;
              "omax" the odds ruler's end; "pins" [p, …] fixed marks (words.pins names them).
            "curve" (default): "xr", "yr" (probability), "xt", "yt"; "pts" [[x, 0 | 1], …] loans at 0 (good) and 1
              (bad); "lpm" "fit" or [a, b] — the straight line, "out" shades below 0 and above 1; "curve" "fit" (on pts,
              else on bands) or [b0, b1] with z = b0 + b1 · x (around "xc", per "xu" points: act "bend" / "shift" by,
              "fit"); "flat" the overall rate; "surp" each loan's surprise −ln(the chance of what happened) as a bar
              below; "bands" [[label, loans, bads, mean x, predicted %?], …] bubbles at their rates ("bandLab" their
              rate or "n" their count, "pred" the predicted marks, "hotBand" i); "grades" [[x0, x1, rate, letter], …];
              "mark" / "mark2" x read the curve (she drags the last one; act "move" by); "cut" a probability line;
              "zpanel" the same in log-odds below ("zr").
            "card": the scorecard ruler: "card" [base score, base good:bad odds, PDO], "xr", "mark" (dragged), "fo"
              shows factor and offset.
            "read" [items]: pd (words.at names the x), ratio, loss, lpm, max, band, total, fit. */
(function () {
  var S = window.ALStory;
  if (!S) return;
  var T = S.T, dec = S.dec, pc = S.pc, txt = S.txt, fmt = S.fmt;
  if (typeof document !== 'undefined' && document.getElementById && !document.getElementById('sy6-style')) {
    var st = document.createElement('style'); st.id = 'sy6-style';
    st.textContent = '.sy .sy6-ln { fill: none; stroke: #0284c7; stroke-width: 2.6; stroke-linecap: round; }\n' +
      '.sy .sy6-guess { stroke: #0f766e; } .sy .sy6-l-o { stroke: #ea580c; } .sy .sy6-l-p { stroke: #7c3aed; } .sy .sy6-l-g { stroke: #16a34a; } .sy .sy6-l-b { stroke: #0284c7; } .sy .sy6-l-m { stroke: #64748b; }\n' +
      '.sy .sy6-ghost { fill: none; stroke: #94a3b8; stroke-width: 2; stroke-dasharray: 6 4; }\n' +
      '.sy .sy6-res { stroke: #ea580c; stroke-width: 1.6; stroke-dasharray: 3 2; } .sy .sy6-res0 { stroke: #7c3aed; stroke-width: 1.6; stroke-dasharray: 3 2; }\n' +
      '.sy .sy6-sq { fill: rgba(249, 115, 22, .16); stroke: #f97316; stroke-width: 1; }\n' +
      '.sy .sy6-qp { fill: rgba(34, 197, 94, .10); } .sy .sy6-qn { fill: rgba(249, 115, 22, .10); } .sy .sy6-rng { fill: rgba(15, 118, 110, .08); }\n' +
      '.sy .sy6-out { fill: rgba(239, 68, 68, .10); } .sy .sy6-grade { fill: rgba(100, 116, 139, .07); } .sy .sy6-grade2 { fill: rgba(100, 116, 139, .15); }\n' +
      '.sy .sy6-hd { fill: #fff; stroke: #0f766e; stroke-width: 3; cursor: ns-resize; } .sy .sy6-mk { fill: #facc15; stroke: #a16207; stroke-width: 1.5; }\n' +
      '.sy .sy6-pred { fill: none; stroke: #7c3aed; stroke-width: 3; } .sy .sy6-bub { fill: rgba(249, 115, 22, .55); stroke: #c2410c; stroke-width: 1.5; }\n' +
      '.sy .sy6-node { stroke: #0f172a; stroke-width: 1.5; } .sy .sy6-ar { stroke: #0f766e; stroke-width: 2.6; fill: none; } .sy .sy6-arx { stroke: #c2410c; stroke-width: 2.4; fill: none; stroke-dasharray: 6 4; } .sy .sy6-ard { stroke: #64748b; stroke-width: 2.2; fill: none; stroke-dasharray: 4 4; }\n' +
      '.sy .sy6-ah { fill: #0f766e; } .sy .sy6-ahx { fill: #c2410c; } .sy .sy6-ahd { fill: #64748b; }\n' +
      '.sy .sy-svg .sy6-bigr { font-size: 22px; font-weight: 800; fill: #a16207; } .sy .sy-svg .sy6-bl { fill: #0369a1; font-weight: 700; }\n' +
      '.sy .sy6-sb { fill: #f97316; } .sy .sy6-sg { fill: #4ade80; } .sy .sy6-drag { cursor: ns-resize; } .sy .sy6-hx { cursor: ew-resize; }\n' +
      'html[data-theme="dark"] .sy .sy6-ln { stroke: #38bdf8; } html[data-theme="dark"] .sy .sy6-guess { stroke: #5eead4; } html[data-theme="dark"] .sy .sy6-l-p { stroke: #a78bfa; } html[data-theme="dark"] .sy .sy6-l-o { stroke: #fb923c; } html[data-theme="dark"] .sy .sy6-l-b { stroke: #38bdf8; } html[data-theme="dark"] .sy .sy6-l-g { stroke: #4ade80; } html[data-theme="dark"] .sy .sy6-l-m { stroke: #94a3b8; }\n' +
      'html[data-theme="dark"] .sy .sy6-ghost { stroke: #64748b; } html[data-theme="dark"] .sy .sy6-res0 { stroke: #a78bfa; } html[data-theme="dark"] .sy .sy6-hd { fill: #1b2430; stroke: #5eead4; }\n' +
      'html[data-theme="dark"] .sy .sy6-node { stroke: #e6edf3; } html[data-theme="dark"] .sy .sy6-ar { stroke: #5eead4; } html[data-theme="dark"] .sy .sy6-ah { fill: #5eead4; } html[data-theme="dark"] .sy .sy6-pred { stroke: #a78bfa; }\n' +
      'html[data-theme="dark"] .sy .sy-svg .sy6-bigr { fill: #fde047; } html[data-theme="dark"] .sy .sy-svg .sy6-bl { fill: #7dd3fc; } html[data-theme="dark"] .sy .sy6-mk { fill: #fde047; }';
    (document.head || document.documentElement).appendChild(st);
  }
  var uid = 0;
  function fin(x) { return typeof x === 'number' && isFinite(x); }
  function num(x, dp) {   // 12 496.1 · −0,54: a minus sign, a space every three digits from 1 000
    if (!fin(x)) return '—';
    var s = Math.abs(x).toFixed(dp), parts = s.split('.'), ip = parts[0];
    if (ip.length > 3) ip = ip.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    s = ip + (parts[1] ? (T('.', ',') + parts[1]) : '');
    return (x < 0 && Number(Math.abs(x).toFixed(dp)) !== 0 ? '−' : '') + s;
  }
  function sgn(x, dp) { return (x > 0 && Number(x.toFixed(dp)) !== 0 ? '+' : '') + num(x, dp); }
  function pcs(x, dp) { return (x < 0 && Number((x * 100).toFixed(dp)) !== 0 ? '−' : '') + pc(Math.abs(x), dp); }
  function niceStep(span, k) { var c = [0.01, 0.02, 0.025, 0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000]; for (var i = 0; i < c.length; i++) if (span / c[i] <= (k || 5)) return c[i]; return 20000; }
  function dpOf(step) { return step >= 1 - 1e-9 ? 0 : Math.abs(step * 10 - Math.round(step * 10)) < 1e-9 ? 1 : 2; }
  function ln(cls, x1, y1, x2, y2, extra) { return '<line class="' + cls + '" x1="' + x1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y1="' + y1.toFixed(1) + '" y2="' + y2.toFixed(1) + '"' + (extra || '') + '/>'; }
  function dot(cls, x, y, r) { return '<circle class="' + cls + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(1) + '"/>'; }
  function rect(cls, x, y, w, h) { return '<rect class="' + cls + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + Math.max(0, w).toFixed(1) + '" height="' + Math.max(0, h).toFixed(1) + '"/>'; }
  function svgAt(svgEl, ev, W, H) { var r = svgEl.getBoundingClientRect(); return [(ev.clientX - r.left) / (r.width || 1) * W, (ev.clientY - r.top) / (r.height || 1) * H]; }
  function bindPointer(svgEl, W, H, down, move) {   // as story.js's line: the svg is redrawn on every move
    if (!svgEl) return;
    svgEl.onpointerdown = function (ev) { bindPointer.on = true; try { svgEl.setPointerCapture(ev.pointerId); } catch (e) { /* old browsers */ } down(svgAt(svgEl, ev, W, H)); };
    svgEl.onpointermove = function (ev) { if (bindPointer.on) move(svgAt(svgEl, ev, W, H)); };
    svgEl.onpointerup = svgEl.onpointercancel = function () { bindPointer.on = false; };
    svgEl.style.touchAction = 'none';
  }
  /* least squares on [[x, y], …]: n, the means, the sums of squares, slope b, intercept a, r */
  function ls(p) {
    var n = p.length, mx = 0, my = 0, sxx = 0, syy = 0, sxy = 0, i;
    for (i = 0; i < n; i++) { mx += p[i][0] / n; my += p[i][1] / n; }
    for (i = 0; i < n; i++) { var dx = p[i][0] - mx, dy = p[i][1] - my; sxx += dx * dx; syy += dy * dy; sxy += dx * dy; }
    var b = sxx > 0 ? sxy / sxx : 0, r = sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : 0;
    return { n: n, mx: mx, my: my, sxx: sxx, syy: syy, sxy: sxy, b: b, a: my - b * mx, r: r };
  }
  function ranks(a) {   // 1 = the smallest; ties share their average rank
    var idx = a.map(function (v, i) { return i; }).sort(function (i, j) { return a[i] - a[j]; }), out = [], i = 0;
    while (i < idx.length) { var j = i; while (j + 1 < idx.length && a[idx[j + 1]] === a[idx[i]]) j++; for (var k = i; k <= j; k++) out[idx[k]] = (i + j) / 2 + 1; i = j + 1; }
    return out;
  }
  function ticks(lo, hi, step) { var out = [], s = step || niceStep(hi - lo); for (var t = Math.ceil(lo / s - 1e-9) * s; t <= hi + 1e-9; t += s) out.push(Math.abs(t) < s * 1e-6 ? 0 : t); return out; }

  /* ---------- scatter: one dot per loan, a line through them ---------- */
  S.scenes.scatter = function (host, info) {
    var o = {}, key = '', v = [], start = null, guess = null, cid = 'sy6c' + (++uid);
    var W = 480, L = 52, R = 464, Tp = 16, B = 212, H = 248;
    function view() {   // the points as drawn: values, ranks or residuals
      var p = v.map(function (q) { return [q[0], q[1], o.one ? 0 : (q[2] || 0)]; });
      if (o.rank) { var rx = ranks(p.map(function (q) { return q[0]; })), ry = ranks(p.map(function (q) { return q[1]; })); p = p.map(function (q, i) { return [rx[i], ry[i], q[2]]; }); }
      if (o.resplot) { var f = ls(p); p = p.map(function (q) { return [q[0], q[1] - (f.a + f.b * q[0]), q[2]]; }); }
      return p;
    }
    function lineNow(p) {   // the main line [a, b], or null
      if (o.line === 'fit') { var f = ls(p); return [f.a, f.b]; }
      if (o.line === 'guess') return guess;
      if (o.line && o.line.length === 2) return o.line;
      return null;
    }
    function ranges(p) {
      var xs = p.map(function (q) { return q[0]; }), ys = p.map(function (q) { return q[1]; });
      var x0 = Math.min.apply(null, xs.concat([0])), x1 = Math.max.apply(null, xs.concat([1])), y0 = Math.min.apply(null, ys.concat([0])), y1 = Math.max.apply(null, ys.concat([1]));
      var xr = o.rank ? [0, p.length + 1] : (o.xr || [x0, x1 + (x1 - x0) * 0.05]);
      var yr = o.rank ? [0, p.length + 1] : o.resplot ? (o.rr || (function () { var m = Math.max.apply(null, ys.map(Math.abs).concat([1e-6])) * 1.15; return [-m, m]; })()) : (o.yr || [y0, y1 + (y1 - y0) * 0.08]);
      return { xr: xr, yr: yr };
    }
    function paint() {
      var p = view(), rg = ranges(p), xr = rg.xr, yr = rg.yr, w = o.words || {}, cols = o.cols || ['b'], s = '', clip = 'clip-path="url(#' + cid + ')"';
      function X(x) { return L + (x - xr[0]) / (xr[1] - xr[0] || 1) * (R - L); }
      function Y(y) { return B - (y - yr[0]) / (yr[1] - yr[0] || 1) * (B - Tp); }
      function yAt(py) { return yr[0] + (B - py) / (B - Tp) * (yr[1] - yr[0]); }
      var f = ls(p), Ln = lineNow(p);
      s += '<defs><clipPath id="' + cid + '"><rect x="' + L + '" y="' + Tp + '" width="' + (R - L) + '" height="' + (B - Tp) + '"/></clipPath></defs>';
      if (o.range) { var r0 = X(Math.max(xr[0], o.range[0])), r1 = X(Math.min(xr[1], o.range[1])); s += rect('sy6-rng', r0, Tp, r1 - r0, B - Tp) + txt(r0 + 4, Tp + 12, w.range || '', 'sy-ax sy-tg'); }
      if (o.quad && p.length) {
        var cx = Math.max(L, Math.min(R, X(f.mx))), cy = Math.max(Tp, Math.min(B, Y(f.my)));
        s += rect('sy6-qp', cx, Tp, R - cx, cy - Tp) + rect('sy6-qp', L, cy, cx - L, B - cy) + rect('sy6-qn', L, Tp, cx - L, cy - Tp) + rect('sy6-qn', cx, cy, R - cx, B - cy);
        s += txt(R - 8, Tp + 20, '+', 'sy-ax sy6-bigr', 'end') + txt(L + 8, B - 8, '+', 'sy-ax sy6-bigr') + txt(L + 8, Tp + 20, '−', 'sy-ax sy6-bigr') + txt(R - 8, B - 8, '−', 'sy-ax sy6-bigr', 'end');
      }
      /* axes and ticks */
      var xstep = o.rank ? (p.length > 10 ? 5 : 1) : (o.xt || niceStep(xr[1] - xr[0])), ystep = o.rank ? (p.length > 10 ? 5 : 1) : (o.resplot ? (o.rt || niceStep(yr[1] - yr[0])) : (o.yt || niceStep(yr[1] - yr[0])));
      var xs = ticks(o.rank ? 1 : xr[0], o.rank ? xr[1] - 1 : xr[1], xstep), ysT = ticks(o.rank ? 1 : yr[0], o.rank ? yr[1] - 1 : yr[1], ystep), xdp = dpOf(xstep), ydp = dpOf(ystep);
      s += ln('sy-axl', L, B, R, B) + ln('sy-axl', L, Tp, L, B);
      xs.forEach(function (t) { s += ln('sy-tick', X(t), B, X(t), B + 5) + txt(X(t), B + 17, num(t, xdp), 'sy-ax', 'middle'); });
      ysT.forEach(function (t) { s += ln('sy-tick', L - 5, Y(t), L, Y(t)) + txt(L - 8, Y(t) + 4, o.resplot && t > 0 ? '+' + num(t, ydp) : num(t, ydp), 'sy-ax', 'end'); });
      s += txt(R, B + 32, o.rank ? T('rank of x (1 = the smallest)', 'ранг x (1 = самый маленький)') : (w.x || ''), 'sy-ax', 'end');
      s += txt(4, Tp - 6, o.rank ? T('rank of y', 'ранг y') : o.resplot ? T('residual', 'остаток') + (w.yu ? ', ' + w.yu : '') : (w.y || ''), 'sy-ax');
      if (o.resplot) s += ln('sy-mean', L, Y(0), R, Y(0)) + txt(R - 4, Y(0) - 5, T('0 = on the line', '0 = на линии'), 'sy-ax sy-pl', 'end');
      /* the average point and the flat line */
      if ((o.mean || o.quad) && p.length) s += '<g ' + clip + '>' + ln('sy-mean', X(f.mx), Tp, X(f.mx), B) + ln('sy-mean', L, Y(f.my), R, Y(f.my)) + '</g>' + txt(Math.min(R - 60, X(f.mx) + 4), B - 6, T('average x', 'среднее x'), 'sy-ax sy-pl') + txt(R - 4, Y(f.my) - 5, T('average y', 'среднее y'), 'sy-ax sy-pl', 'end');
      if (o.ybar && p.length) {
        s += '<g ' + clip + '>' + ln('sy-mean', L, Y(f.my), R, Y(f.my));
        if (o.res0) p.forEach(function (q) { s += ln('sy6-res0', X(q[0]), Y(q[1]), X(q[0]), Y(f.my)); });
        s += '</g>' + txt(L + 4, Y(f.my) - 5, T('average ', 'среднее ') + num(f.my, 2) + (w.yu ? ' ' + w.yu : ''), 'sy-ax sy-pl');
      }
      /* the gaps to the main line, and their squares */
      if (Ln && (o.res || o.sq)) {
        s += '<g ' + clip + '>';
        p.forEach(function (q) {
          var yl = Y(Ln[0] + Ln[1] * q[0]), yd = Y(q[1]), d = Math.abs(yl - yd);
          if (o.sq) s += rect('sy6-sq', X(q[0]), Math.min(yl, yd), d, d);
          if (o.res) s += ln('sy6-res', X(q[0]), yd, X(q[0]), yl);
        });
        s += '</g>';
      }
      /* lines: fixed ones, one per group, the start (ghost), the main one */
      function full(a, b, cls, extra) { return ln(cls, X(xr[0]), Y(a + b * xr[0]), X(xr[1]), Y(a + b * xr[1]), extra); }
      var lines = '';
      (o.lines || []).forEach(function (l) { lines += full(l[0], l[1], 'sy6-ln sy6-l-' + (l[2] || 'b')); });
      if (o.gfit) {
        var gs = {}; p.forEach(function (q) { (gs[q[2]] = gs[q[2]] || []).push(q); });
        Object.keys(gs).forEach(function (g) { var gp = gs[g], fg = ls(gp), lo = Math.min.apply(null, gp.map(function (q) { return q[0]; })), hi = Math.max.apply(null, gp.map(function (q) { return q[0]; })); if (gp.length > 1) lines += ln('sy6-ln sy6-l-' + (cols[g] || 'b'), X(lo), Y(fg.a + fg.b * lo), X(hi), Y(fg.a + fg.b * hi)); });
      }
      if (o.ghost && start && !o.resplot) lines += full(start.a, start.b, 'sy6-ghost');
      if (Ln) lines += full(Ln[0], Ln[1], 'sy6-ln' + (o.line === 'guess' ? ' sy6-guess' : ''));
      if (o.resplot && o.gmean) {
        var gm = {}; p.forEach(function (q) { var g = gm[q[2]] = gm[q[2]] || [0, 0]; g[0] += q[1]; g[1]++; });
        Object.keys(gm).forEach(function (g) { var m = gm[g][0] / gm[g][1]; lines += ln('sy6-ln sy6-l-' + (cols[g] || 'b'), L, Y(m), R, Y(m), ' stroke-dasharray="8 5"'); });
      }
      s += '<g ' + clip + '>' + lines + '</g>';
      var TL = o.triOn != null && o.lines ? o.lines[o.triOn] : Ln;
      if (o.tri && TL) {   // the slope triangle: dx to the right, the rise up
        var tx0 = o.triAt != null ? o.triAt : f.mx, ty0 = TL[0] + TL[1] * tx0, tx1 = tx0 + o.tri, ty1 = TL[0] + TL[1] * tx1;
        s += ln('sy-alarm', X(tx0), Y(ty0), X(tx1), Y(ty0)) + ln('sy-alarm', X(tx1), Y(ty0), X(tx1), Y(ty1));
        s += txt((X(tx0) + X(tx1)) / 2, Y(ty0) + 15, '+' + num(o.tri, 0) + ' ' + (w.xu || ''), 'sy-ax sy-or', 'middle') + txt(X(tx1) + 5, (Y(ty0) + Y(ty1)) / 2 + 4, sgn(TL[1] * o.tri, 2) + ' ' + (w.yu || ''), 'sy-ax sy-or');
      }
      /* the dots */
      var rr = p.length > 150 ? 2.6 : p.length > 40 ? 3.6 : 5.5;
      p.forEach(function (q, i) {
        var fill = cols[q[2]] || 'b', ring = '';
        if (o.quad) ring = (q[0] - f.mx) * (q[1] - f.my) >= 0 ? ' sy-r-g' : ' sy-r-o';
        if (i === o.hot || i === o.drag) ring = ' sy-picked';
        s += dot('sy-dot sy-f-' + fill + ring + (i === o.drag ? ' sy-handle sy6-drag' : ''), X(q[0]), Math.max(Tp - 6, Math.min(B + 6, Y(q[1]))), i === o.drag ? 8 : rr);
      });
      (o.marks || []).forEach(function (m, i) { var mx = X(m[0]), my = Y(m[1]); s += '<path class="sy6-mk" d="M' + mx.toFixed(1) + ' ' + (my - 8).toFixed(1) + ' l7 8 l-7 8 l-7 -8 z"/>' + txt(mx - 10, my + 4, ((w.marks || [])[i]) || '', 'sy-ax sy-am', 'end'); });
      if (o.pred != null) {
        var PL = o.predOn != null && o.lines ? o.lines[o.predOn] : Ln;
        if (PL) { var yp = PL[0] + PL[1] * o.pred, py = Math.max(Tp, Y(yp)), right = X(o.pred) > R - 90; s += ln('sy-mean', X(o.pred), B, X(o.pred), py) + ln('sy-mean', L, py, X(o.pred), py) + dot('sy-dot sy-f-y sy-picked', X(o.pred), py, 6) + txt(X(o.pred) + (right ? -9 : 9), py + (py < Tp + 20 ? 16 : -8), num(yp, 2) + ' ' + (w.yu || ''), 'sy-ax sy-am', right ? 'end' : 'start'); }
      }
      if (o.line === 'guess' && guess) [0.12, 0.88].forEach(function (k) { var hx = xr[0] + k * (xr[1] - xr[0]); s += dot('sy6-hd', X(hx), Math.max(Tp, Math.min(B, Y(guess[0] + guess[1] * hx))), 8); });
      if (o.hot != null && p[o.hot] && o.hotLab !== false) { var hq = p[o.hot], far = X(hq[0]) > R - 130; s += txt(X(hq[0]) + (far ? -10 : 10), Y(hq[1]) - 9, num(hq[0], 1) + ' ' + (w.xu || '') + ' → ' + num(hq[1], 2) + ' ' + (w.yu || ''), 'sy-ax sy-or', far ? 'end' : 'start'); }
      if (o.big && p.length > 1) s += txt(o.quad ? R - 30 : R - 6, o.quad ? Tp + 22 : Tp + 22, 'r = ' + num(f.r, 2), 'sy-ax sy6-bigr', 'end');
      host.innerHTML = S.svg(W, H, s);
      var svgEl = host.querySelector ? host.querySelector('svg') : null;
      if (svgEl && (o.drag != null || o.line === 'guess')) {
        svgEl.style.cursor = 'ns-resize';
        var hx0 = xr[0] + 0.12 * (xr[1] - xr[0]), hx1 = xr[0] + 0.88 * (xr[1] - xr[0]), which = 0;
        bindPointer(svgEl, W, H, function (pt) {
          if (o.drag != null) { v[o.drag][1] = Math.round(yAt(pt[1]) * 1000) / 1000; paint(); return; }
          which = Math.abs(pt[0] - X(hx0)) < Math.abs(pt[0] - X(hx1)) ? 0 : 1; moveHandle(which, yAt(pt[1]), hx0, hx1);
        }, function (pt) {
          if (o.drag != null) { v[o.drag][1] = Math.round(yAt(pt[1]) * 1000) / 1000; paint(); return; }
          moveHandle(which, yAt(pt[1]), hx0, hx1);
        });
      }
      readout(p, f, Ln);
    }
    function moveHandle(k, y, hx0, hx1) {
      if (!guess) return;
      var y0 = guess[0] + guess[1] * hx0, y1 = guess[0] + guess[1] * hx1;
      if (k === 0) y0 = y; else y1 = y;
      var b = (y1 - y0) / (hx1 - hx0); guess = [y0 - b * hx0, b]; paint();
    }
    function readout(p, f, Ln) {
      var w = o.words || {}, xu = w.xu ? ' ' + w.xu : '', yu = w.yu ? ' ' + w.yu : '', parts = [], cols = o.cols || ['b'], gn = o.one ? [] : (w.groups || []);
      function sse(a, b) { var t = 0; p.forEach(function (q) { var e = q[1] - (a + b * q[0]); t += e * e; }); return t; }
      (o.read || []).forEach(function (k) {
        if (k === 'key' && gn.length) parts.push(gn.map(function (nm, g) { return '{' + (cols[g] || 'b') + '|● ' + nm + '}'; }).join(' · '));
        if (k === 'n') parts.push(T('**%n** dots', '**%n** точек').replace('%n', p.length) + (w.n ? ' · ' + w.n : ''));
        if (k === 'r' && p.length > 1) parts.push('r = {y|' + num(f.r, 3) + '}');
        if (k === 'sp' && p.length > 1) { var rx = ranks(v.map(function (q) { return q[0]; })), ry = ranks(v.map(function (q) { return q[1]; })); parts.push(T('Pearson r = {b|%p} · Spearman (r on the ranks) = {g|%s}', 'Пирсон r = {b|%p} · Спирмен (r по рангам) = {g|%s}').replace('%p', num(ls(v).r, 3)).replace('%s', num(ls(rx.map(function (x, i) { return [x, ry[i]]; })).r, 3))); }
        if (k === 'r2' && p.length > 1) parts.push('R² = {y|' + num(f.r * f.r, 3) + '}');
        if (k === 'mean' && p.length) parts.push(T('the average loan: principal {p|%x}, payment {p|%y}', 'средний заём: сумма {p|%x}, платёж {p|%y}').replace('%x', num(f.mx, 1) + xu).replace('%y', num(f.my, 2) + yu));
        if (k === 'q') { var pl = 0, mi = 0; p.forEach(function (q) { if ((q[0] - f.mx) * (q[1] - f.my) >= 0) pl++; else mi++; }); parts.push(T('in the + corners: {g|%a} dots · in the − corners: {o|%b}', 'в углах «+»: {g|%a} · в углах «−»: {o|%b}').replace('%a', pl).replace('%b', mi)); }
        if (k === 'line' && Ln) parts.push(T('slope {b|%s}%u · intercept {y|%a}%v', 'наклон {b|%s}%u · свободный член {y|%a}%v').replace('%s', sgn(Ln[1] * (o.sk || 1), o.sdp != null ? o.sdp : 2)).replace('%u', w.slope ? ' ' + w.slope : '').replace('%a', num(Ln[0], o.adp != null ? o.adp : 2)).replace('%v', yu));
        if (k === 'ss' && Ln) parts.push(T('the squared misses added up: {o|%s}', 'сумма квадратов промахов: {o|%s}').replace('%s', num(sse(Ln[0], Ln[1]), 1)) + (o.line === 'guess' ? T(' · the best possible: {g|%b}', ' · лучшая возможная: {g|%b}').replace('%b', num(sse(f.a, f.b), 1)) : ''));
        if (k === 'tot' && p.length) parts.push(T('the squared gaps to the average, added up: {p|%t}', 'сумма квадратов расстояний до среднего: {p|%t}').replace('%t', num(f.syy, 1)));
        if (k === 'r2ss' && f.syy > 0) { var sr = sse(f.a, f.b); parts.push('R² = 1 − {o|' + num(sr, 1) + '} ÷ {p|' + num(f.syy, 1) + '} = {y|' + num(1 - sr / f.syy, 3) + '}'); }
        if (k === 'gr') { var gs = {}; v.forEach(function (q) { (gs[q[2] || 0] = gs[q[2] || 0] || []).push(q); }); parts.push(T('all together: r = {y|%r}', 'все вместе: r = {y|%r}').replace('%r', num(ls(v).r, 2)) + ' · ' + Object.keys(gs).map(function (g) { return (gn[g] ? gn[g] + ':' : '') + ' {' + (cols[g] || 'b') + '|r = ' + num(ls(gs[g]).r, 2) + '}'; }).join(' · ')); }
        if (k === 'gm') { var gm = {}; view().forEach(function (q) { var g = gm[q[2]] = gm[q[2]] || [0, 0]; g[0] += q[1]; g[1]++; }); parts.push(T('average residual: ', 'средний остаток: ') + Object.keys(gm).map(function (g) { return (gn[g] ? gn[g] + ':' : '') + ' {' + (cols[g] || 'b') + '|' + sgn(gm[g][0] / gm[g][1], 2) + yu + '}'; }).join(' · ')); }
        if (k === 'hot' && o.hot != null && v[o.hot]) parts.push(T('the ringed loan: principal {b|%x}, payment {o|%y} a month', 'заём в кольце: сумма {b|%x}, платёж {o|%y} в месяц').replace('%x', num(v[o.hot][0], 1) + xu).replace('%y', num(v[o.hot][1], 2) + yu));
        if (k === 'chg' && start) { var nb = ls(v).b; parts.push(T('slope {m|%a} → {b|%b}%u (%c)', 'наклон {m|%a} → {b|%b}%u (%c)').replace('%a', num(start.b * (o.sk || 1), o.sdp != null ? o.sdp : 1)).replace('%b', num(nb * (o.sk || 1), o.sdp != null ? o.sdp : 1)).replace('%u', w.slope ? ' ' + w.slope : '').replace('%c', (start.b ? sgn((nb / start.b - 1) * 100, 1) : '0') + ' %')); }
        if (k === 'lev') { var i = o.drag != null ? o.drag : o.hot; if (i != null && v[i]) { var fl = ls(v), h = 1 / v.length + (fl.sxx > 0 ? Math.pow(v[i][0] - fl.mx, 2) / fl.sxx : 0); parts.push(T('its leverage h = {p|%h} (the average principal is {p|%m})', 'его рычаг h = {p|%h} (средняя сумма — {p|%m})').replace('%h', num(h, 3)).replace('%m', num(fl.mx, 1) + xu)); } }
        if (k === 'pred' && o.pred != null) { var PL = o.predOn != null && o.lines ? o.lines[o.predOn] : Ln; if (PL) parts.push(T('at %x the line says {y|%y}', 'при %x линия даёт {y|%y}').replace('%x', num(o.pred, 0) + xu).replace('%y', num(PL[0] + PL[1] * o.pred, 2) + yu)); }
      });
      info.innerHTML = parts.length ? '<div class="sy-read">' + parts.map(fmt).join('<br>') + '</div>' : '';
    }
    return {
      set: function (nx) {
        var k = JSON.stringify(nx.pts || []);
        o = nx;
        if (k !== key || nx.reset) { key = k; v = (nx.pts || []).map(function (q) { return q.slice(); }); start = v.length > 1 ? ls(v) : null; guess = null; }
        if (o.pull && v[o.pull[0]]) v[o.pull[0]][1] = o.pull[1];
        if (o.line === 'guess' && !guess) guess = (o.guess || [ls(v).my, 0]).slice();
        paint();
      },
      act: function (a) {
        if (a.do === 'fit') { var f = ls(view()); guess = [f.a, f.b]; }
        else if (a.do === 'tilt' && guess) { var m = ls(view()).mx, ym = guess[0] + guess[1] * m; guess[1] += a.by; guess[0] = ym - guess[1] * m; }
        else if (a.do === 'lift' && guess) guess[0] += a.by;
        else if (a.do === 'nudge') { var i = a.i != null ? a.i : o.drag; if (v[i]) v[i][1] = a.to != null ? a.to : Math.round((v[i][1] + a.by) * 1000) / 1000; }
        else if (a.do === 'reset') { v = (o.pts || []).map(function (q) { return q.slice(); }); guess = o.line === 'guess' ? (o.guess || [ls(v).my, 0]).slice() : null; }
        paint();
      }
    };
  };

  /* ---------- arrows: what causes what ---------- */
  S.scenes.arrows = function (host, info) {
    var o = {}, id = 'sy6a' + (++uid);
    function paint() {
      var nodes = o.nodes || [], labels = o.labels || [], w = o.words || {}, s = '', W = 480, H = o.h || 176, bw = 138, bh = 40;
      s += '<defs>' + ['ah', 'ahx', 'ahd'].map(function (c) { return '<marker id="' + id + c + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="sy6-' + c + '" d="M0 0 L10 5 L0 10 z"/></marker>'; }).join('') + '</defs>';
      (o.edges || []).forEach(function (e, i) {
        var a = nodes[e[0]], b = nodes[e[1]]; if (!a || !b) return;
        var dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
        function edge(px, py, sx, sy) { var t = Math.min(Math.abs(sx) > 1e-9 ? bw / 2 / Math.abs(sx) : 1e9, Math.abs(sy) > 1e-9 ? bh / 2 / Math.abs(sy) : 1e9); return [px + sx * (t + 5), py + sy * (t + 5)]; }
        var p0 = edge(a[0], a[1], ux, uy), p1 = edge(b[0], b[1], -ux, -uy), sty = e[2] || 's', cls = sty === 'x' ? 'sy6-arx' : sty === 'd' ? 'sy6-ard' : 'sy6-ar', mk = sty === 'x' ? 'ahx' : sty === 'd' ? 'ahd' : 'ah';
        s += ln(cls, p0[0], p0[1], p1[0], p1[1], ' marker-end="url(#' + id + mk + ')"');
        var mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, vert = Math.abs(uy) > 0.7;
        if (sty === 'x') s += ln('sy-alarm', mx - 9, my - 9, mx + 9, my + 9) + ln('sy-alarm', mx - 9, my + 9, mx + 9, my - 9);
        if (sty === 'd') s += txt(mx + 8, my - 6, '?', 'sy-ax sy6-bigr');
        var el = (w.edges || [])[i]; if (el) s += txt(mx + (vert ? 14 : 0), my + (vert ? 4 : -12), el, 'sy-ax ' + (sty === 'x' ? 'sy-or' : sty === 'd' ? '' : 'sy-tg'), vert ? 'start' : 'middle');
      });
      nodes.forEach(function (n, i) { s += '<rect class="sy6-node sy-f-' + (n[2] || 'm') + '" x="' + (n[0] - bw / 2) + '" y="' + (n[1] - bh / 2) + '" width="' + bw + '" height="' + bh + '" rx="12"/>' + txt(n[0], n[1] + 4, labels[i] || '', 'sy-ax sy-lab', 'middle'); });
      host.innerHTML = S.svg(W, H, s);
      info.innerHTML = o.legend ? '<div class="sy-read">' + o.legend.map(fmt).join('<br>') + '</div>' : '';
    }
    return { set: function (nx) { o = nx; paint(); }, act: function () { /* nothing to run */ } };
  };

  /* ---------- logit: yes / no, odds, and the S-curve ---------- */
  function sig(z) { return 1 / (1 + Math.exp(-z)); }
  S.scenes.logit = function (host, info) {
    var o = {}, key = '', cur = null, fitted = null, pp = 0.25, m1 = null, m2 = null;
    function xc() { return o.xc != null ? o.xc : 650; }
    function xu() { return o.xu || 100; }
    function rows() {   // [x, loans, bads]: the loans, else the bands
      if (o.pts && o.pts.length) return o.pts.map(function (q) { return [q[0], 1, q[1]]; });
      return (o.bands || []).map(function (b) { return [b[3], b[1], b[2]]; });
    }
    function newton(rw) {   // maximum likelihood, centred: z = A + B·(x − xc)/xu
      var A = 0, Bc = 0;
      for (var it = 0; it < 60; it++) {
        var g0 = 0, g1 = 0, h00 = 0, h01 = 0, h11 = 0;
        rw.forEach(function (r) { var u = (r[0] - xc()) / xu(), q = sig(A + Bc * u), wv = r[1] * q * (1 - q); g0 += r[2] - r[1] * q; g1 += (r[2] - r[1] * q) * u; h00 += wv; h01 += wv * u; h11 += wv * u * u; });
        var det = h00 * h11 - h01 * h01; if (!(det > 1e-12)) break;
        var dA = (h11 * g0 - h01 * g1) / det, dB = (h00 * g1 - h01 * g0) / det;
        A += dA; Bc += dB; if (Math.abs(dA) + Math.abs(dB) < 1e-10) break;
      }
      return fin(A) && fin(Bc) ? [A, Bc] : null;
    }
    function fromRaw(c) { return [c[0] + c[1] * xc(), c[1] * xu()]; }
    function z(x) { return cur ? cur[0] + cur[1] * (x - xc()) / xu() : 0; }
    function pd(x) { return sig(z(x)); }
    function loss(f) { var N = 0, t = 0; rows().forEach(function (r) { var q = Math.min(1 - 1e-12, Math.max(1e-12, f(r[0]))); t -= r[2] * Math.log(q) + (r[1] - r[2]) * Math.log(1 - q); N += r[1]; }); return N ? t / N : 0; }
    function rate() { var N = 0, K = 0; rows().forEach(function (r) { N += r[1]; K += r[2]; }); return N ? K / N : 0; }
    function lpmLine() {
      if (o.lpm === 'fit') { var p = []; rows().forEach(function (r) { for (var j = 0; j < r[1]; j++) p.push([r[0], j < r[2] ? 1 : 0]); }); var f = ls(p); return [f.a, f.b]; }
      return o.lpm && o.lpm.length === 2 ? o.lpm : null;
    }
    function trim(s) { return s.replace(/[.,]0+$/, ''); }
    function oddsWords(p) {   // "1 bad per 3 good" / "3 bad per 1 good"
      if (!(p > 0 && p < 1)) return '';
      var od = p / (1 - p);
      if (Math.abs(od - 1) < 0.005) return T('one bad per one good', 'один плохой на одного хорошего');
      if (od < 1) return T('1 bad per %g good', '1 плохой на %g хороших').replace('%g', trim(num(1 / od, 1 / od >= 10 ? 1 : 2)));
      return T('%b bad per 1 good', '%b плохих на 1 хорошего').replace('%b', trim(num(od, 2)));
    }
    /* three rulers */
    function rulers() {
      var w = o.words || {}, W = 480, L = 40, R = 446, s = '', row = o.row, top = row ? 46 : 20, Ys = [top + 30, top + 100, top + 170], H = top + 200, omax = o.omax || 4, zm = o.zmax || 5;
      var p = Math.min(0.995, Math.max(0.005, pp)), od = p / (1 - p), lo = Math.log(od);
      function xp(q) { return L + q * (R - L); }
      function xo(q) { return L + Math.min(q, omax) / omax * (R - L); }
      function xz(q) { return L + (Math.max(-zm, Math.min(zm, q)) + zm) / (2 * zm) * (R - L); }
      if (row) { var n = row[0] + row[1], cw = Math.min(26, (R - L) / Math.max(1, n)); for (var i = 0; i < n; i++) s += dot('sy-dot sy-f-' + (i < row[0] ? 'o' : 'g'), (L + R) / 2 + (i - (n - 1) / 2) * cw, 20, Math.min(10, cw * 0.4)); }
      var names = [w.p || T('probability = bad ÷ all', 'вероятность = плохие ÷ все'), w.odds || T('odds = bad ÷ good', 'шансы = плохие ÷ хорошие'), w.lo || T('log-odds = ln(odds)', 'логарифм шансов = ln(шансы)')];
      [0, 1, 2].forEach(function (k) {
        var y = Ys[k]; s += ln('sy-plank', L, y, R, y) + txt(L, y - 26, names[k], 'sy-ax sy-lab');
        var tk = k === 0 ? [0, 0.25, 0.5, 0.75, 1] : k === 1 ? ticks(0, omax, omax <= 2 ? 0.5 : 1) : ticks(-zm, zm, 1);
        tk.forEach(function (t) { var x = k === 0 ? xp(t) : k === 1 ? xo(t) : xz(t); s += ln('sy-tick', x, y + 4, x, y + 10) + txt(x, y + 22, k === 0 ? pc(t, 0) : num(t, k === 1 && omax <= 2 ? 1 : 0), 'sy-ax', 'middle'); });
        if (k === 1) s += txt(R + 6, y + 4, '→ ∞', 'sy-ax');
        if (k === 2) s += txt(R + 6, y + 4, '→', 'sy-ax');
      });
      (o.pins || []).forEach(function (q, i) {
        var xs = [xp(q), xo(q / (1 - q)), xz(Math.log(q / (1 - q)))];
        xs.forEach(function (x, k) { s += '<path class="sy-medmark" d="M' + x.toFixed(1) + ' ' + (Ys[k] - 5) + ' l-5 -9 h10 z"/>'; });
        if ((w.pins || [])[i]) s += txt(xs[0] + 6, Ys[0] - 16, w.pins[i], 'sy-ax sy-am');
      });
      var px = [xp(p), xo(od), xz(lo)];
      s += '<path class="sy6-ghost" d="M' + px[0].toFixed(1) + ' ' + Ys[0] + ' L' + px[1].toFixed(1) + ' ' + Ys[1] + ' L' + px[2].toFixed(1) + ' ' + Ys[2] + '"/>';
      s += dot('sy-dot sy-f-y sy-handle sy6-hx', px[0], Ys[0], 9) + dot('sy-dot sy-f-b', px[1], Ys[1], 8) + dot('sy-dot sy-f-p', px[2], Ys[2], 8);
      s += txt(px[0], Ys[0] - 13, pc(p, p < 0.1 ? 1 : 0), 'sy-ax sy-am', 'middle') + txt(px[1], Ys[1] - 13, num(od, od < 0.1 ? 3 : 2) + (od > omax ? ' →' : ''), 'sy-ax sy6-bl', 'middle') + txt(px[2], Ys[2] - 13, num(lo, 2), 'sy-ax sy-pl', 'middle');
      host.innerHTML = S.svg(W, H, s);
      var mv = function (pt) { pp = Math.min(0.995, Math.max(0.005, (pt[0] - L) / (R - L))); rulers(); };
      bindPointer(host.querySelector ? host.querySelector('svg') : null, W, H, mv, mv);
      info.innerHTML = '<div class="sy-read">' + fmt(T('probability {y|%p} · odds {b|%o} (%w) · log-odds {p|%l}', 'вероятность {y|%p} · шансы {b|%o} (%w) · логарифм шансов {p|%l}')
        .replace('%p', pc(p, p < 0.1 ? 2 : 1)).replace('%o', num(od, od < 0.1 ? 4 : 3)).replace('%w', oddsWords(p)).replace('%l', num(lo, 2))) + '</div>';
    }
    /* the scorecard ruler */
    function card() {
      var w = o.words || {}, c = o.card || [600, 50, 20], W = 480, L = 34, R = 446, xr = o.xr || [c[0] - 3 * c[2], c[0] + 3 * c[2]], Y1 = 50, Y2 = 150, H = 192, s = '';
      var factor = c[2] / Math.LN2, offset = c[0] - factor * Math.log(c[1]);
      function X(sc) { return L + (sc - xr[0]) / (xr[1] - xr[0]) * (R - L); }
      function oddsAt(sc) { return Math.exp((sc - offset) / factor); }
      s += ln('sy-plank', L, Y1, R, Y1) + ln('sy-plank', L, Y2, R, Y2);
      s += txt(L - 30, Y1 - 30, w.pts || T('score, points', 'балл'), 'sy-ax sy-lab') + txt(L - 30, Y2 - 30, w.lo || T('ln(good : bad odds)', 'ln(шансы хороших к плохим)'), 'sy-ax sy-lab');
      var k0 = Math.ceil((xr[0] - c[0]) / c[2] - 1e-9), k1 = Math.floor((xr[1] - c[0]) / c[2] + 1e-9), prev = null;
      for (var k = k0; k <= k1; k++) {
        var sc = c[0] + k * c[2], x = X(sc), od = c[1] * Math.pow(2, k);
        s += ln('sy-tick', x, Y1 - 6, x, Y1 + 6) + txt(x, Y1 - 10, trim(num(sc, 1)), 'sy-ax', 'middle') + txt(x, Y1 + 22, trim(num(od, od < 10 ? 2 : 1)) + ' : 1', 'sy-ax sy6-bl', 'middle');
        s += ln('sy-tick', x, Y2 - 6, x, Y2 + 6) + txt(x, Y2 + 22, num(Math.log(od), 2), 'sy-ax sy-pl', 'middle');
        if (prev != null) s += '<path class="sy6-ghost" d="M' + (prev + 6).toFixed(1) + ' ' + (Y1 + 30) + ' Q' + ((prev + x) / 2).toFixed(1) + ' ' + (Y1 + 50) + ' ' + (x - 6).toFixed(1) + ' ' + (Y1 + 30) + '"/>' + txt((prev + x) / 2, Y1 + 56, '×2', 'sy-ax sy-or', 'middle') + txt((prev + x) / 2, Y2 - 10, '+' + num(Math.LN2, 2), 'sy-ax sy-pl', 'middle');
        prev = x;
      }
      var mk = m1 != null ? m1 : c[0], mo = oddsAt(mk);
      s += ln('sy-alarm', X(mk), Y1 - 22, X(mk), Y2 + 8) + dot('sy-dot sy-f-y sy-handle sy6-hx', X(mk), Y1, 8) + dot('sy-dot sy-f-p', X(mk), Y2, 6);
      host.innerHTML = S.svg(W, H, s);
      var mv = function (pt) { m1 = Math.round(Math.max(xr[0], Math.min(xr[1], xr[0] + (pt[0] - L) / (R - L) * (xr[1] - xr[0])))); card(); };
      bindPointer(host.querySelector ? host.querySelector('svg') : null, W, H, mv, mv);
      var parts = [T('score {y|%s} → good : bad odds {b|%o to 1} → chance of bad 1 ÷ (%o + 1) = {o|%p}', 'балл {y|%s} → шансы хороших к плохим {b|%o к 1} → вероятность плохого 1 ÷ (%o + 1) = {o|%p}')
        .replace('%s', num(mk, 0)).replace(/%o/g, trim(num(mo, 1))).replace('%p', pc(1 / (mo + 1), 2))];
      if (o.fo) parts.push(T('factor = PDO ÷ ln 2 = {p|%f} · offset = %b − factor × ln %d = {p|%g}', 'множитель = PDO ÷ ln 2 = {p|%f} · сдвиг = %b − множитель × ln %d = {p|%g}').replace('%f', num(factor, 2)).replace('%b', num(c[0], 0)).replace('%d', trim(num(c[1], 1))).replace('%g', num(offset, 2)));
      info.innerHTML = '<div class="sy-read">' + parts.map(fmt).join('<br>') + '</div>';
    }
    /* the curve */
    function curve() {
      var w = o.words || {}, W = 480, L = 52, R = 462, Tp = 20, B = o.zpanel ? 168 : 196, xr = o.xr || [400, 850], yr = o.yr || [0, 1], s = '', cid = 'sy6l' + (++uid), clip = 'clip-path="url(#' + cid + ')"';
      var ZT = B + 44, ZB = ZT + 104, zr = o.zr || [-6, 0], SB = (o.zpanel ? ZB : B) + 50 + 66, H = (o.surp ? SB + 12 : (o.zpanel ? ZB : B) + 36);
      function X(x) { return L + (x - xr[0]) / (xr[1] - xr[0]) * (R - L); }
      function Y(y) { return B - (y - yr[0]) / (yr[1] - yr[0]) * (B - Tp); }
      function YZ(q) { return ZB - (q - zr[0]) / (zr[1] - zr[0]) * (ZB - ZT); }
      s += '<defs><clipPath id="' + cid + '"><rect x="' + L + '" y="' + Tp + '" width="' + (R - L) + '" height="' + (B - Tp) + '"/></clipPath></defs>';
      if (o.grades) o.grades.forEach(function (g, i) { var x0 = X(Math.max(xr[0], g[0])), x1 = X(Math.min(xr[1], g[1])); s += rect(i % 2 ? 'sy6-grade2' : 'sy6-grade', x0, Tp, x1 - x0, B - Tp) + txt((x0 + x1) / 2, Tp + 14, g[3], 'sy-ax sy-lab', 'middle'); });
      if (o.out) {
        if (yr[1] > 1) s += rect('sy6-out', L, Tp, R - L, Y(1) - Tp) + txt(R - 4, Tp + 13, T('impossible: above 100 %', 'невозможно: выше 100 %'), 'sy-ax sy-or', 'end');
        if (yr[0] < 0) s += rect('sy6-out', L, Y(0), R - L, B - Y(0)) + txt(R - 4, B - 5, T('impossible: below 0 %', 'невозможно: ниже 0 %'), 'sy-ax sy-or', 'end');
      }
      s += ln('sy-axl', L, B, R, B) + ln('sy-axl', L, Tp, L, B);
      var xst = o.xt || niceStep(xr[1] - xr[0]), xt = ticks(xr[0], xr[1], xst), yst = o.yt || niceStep(yr[1] - yr[0], 5), yt = ticks(yr[0], yr[1], yst);
      xt.forEach(function (t) { s += ln('sy-tick', X(t), B, X(t), B + 5) + txt(X(t), B + 17, num(t, dpOf(xst)), 'sy-ax', 'middle'); });
      yt.forEach(function (t) { s += ln('sy-tick', L - 5, Y(t), L, Y(t)) + txt(L - 8, Y(t) + 4, pcs(t, dpOf(yst * 100)), 'sy-ax', 'end'); });
      if (yr[0] < 0 && yr[1] > 0) s += ln('sy-tick', L, Y(0), R, Y(0));
      if (yr[1] > 1 && yr[0] < 1) s += ln('sy-tick', L, Y(1), R, Y(1));
      s += txt(R, B + 31, w.x || T('credit score', 'кредитный балл'), 'sy-ax', 'end') + txt(4, Tp - 8, w.y || T('chance of going bad', 'вероятность стать плохим'), 'sy-ax');
      var g = '';
      if (o.grades) o.grades.forEach(function (gr) { g += ln('sy-mean', X(Math.max(xr[0], gr[0])), Y(gr[2]), X(Math.min(xr[1], gr[1])), Y(gr[2])); });
      if (o.flat) { var r0 = rate(); g += ln('sy-mean', L, Y(r0), R, Y(r0)); s += txt(R - 4, Y(r0) - 5, T('flat line: ', 'плоская линия: ') + pc(r0, 1), 'sy-ax sy-pl', 'end'); }
      if (o.cut != null) { g += ln('sy-alarm sy-dash', L, Y(o.cut), R, Y(o.cut)); s += txt(R - 4, Y(o.cut) - 5, (w.cut ? w.cut + ' ' : '') + pc(o.cut, 0), 'sy-ax sy-or', 'end'); }
      var LP = lpmLine();
      if (LP) g += ln('sy6-ln', X(xr[0]), Y(LP[0] + LP[1] * xr[0]), X(xr[1]), Y(LP[0] + LP[1] * xr[1]));
      if (cur) { var d = ''; for (var i = 0; i <= 160; i++) { var xx = xr[0] + (xr[1] - xr[0]) * i / 160; d += (i ? ' L' : 'M') + X(xx).toFixed(1) + ' ' + Y(pd(xx)).toFixed(1); } g += '<path class="sy-curve" d="' + d + '"/>'; }
      s += '<g ' + clip + '>' + g + '</g>';
      (o.pts || []).forEach(function (q) { s += dot('sy-dot sy-f-' + (q[1] ? 'o' : 'g'), X(q[0]), Y(q[1]), 6); });
      if (o.bands) {
        var mxn = Math.max.apply(null, o.bands.map(function (b) { return b[1]; }));
        o.bands.forEach(function (b, i) {
          var x = X(b[3]), y = Y(b[2] / b[1]), r = 3.5 + 9 * Math.sqrt(b[1] / mxn);
          s += dot('sy6-bub' + (i === o.hotBand ? ' sy-picked' : ''), x, y, r);
          if (o.pred && b[4] != null) s += ln('sy6-pred', x - 12, Y(b[4] / 100), x + 12, Y(b[4] / 100));
          if (o.bandLab) s += txt(x, y - r - 5, o.bandLab === 'n' ? num(b[1], 0) : pc(b[2] / b[1], 1), 'sy-ax sy-or', 'middle');
        });
      }
      if (cur) [[m1, ''], [m2, ' sy-dash']].forEach(function (m) {
        if (m[0] == null) return;
        var x = X(m[0]), y = Math.max(Tp, Y(pd(m[0]))), right = x > R - 90;
        s += ln('sy-alarm' + m[1], x, y, x, B) + dot('sy-dot sy-f-y sy-picked sy6-hx', x, y, 6) + txt(x + (right ? -9 : 9), Math.max(Tp + 10, y - 8), num(m[0], Math.abs(m[0] % 1) > 1e-9 ? 1 : 0) + ': ' + pc(pd(m[0]), pd(m[0]) < 0.1 ? 2 : 1), 'sy-ax sy-am', right ? 'end' : 'start');
      });
      if (LP && m1 != null && !cur) { var lx = X(m1), lv = LP[0] + LP[1] * m1, ly = Math.max(Tp, Math.min(B, Y(lv))), rt = lx > R - 90; s += ln('sy-alarm', lx, Tp, lx, B) + dot('sy-dot sy-f-y sy-picked sy6-hx', lx, ly, 6) + txt(lx + (rt ? -9 : 9), Math.max(Tp + 10, Math.min(B - 4, ly - 8)), num(m1, 0) + ': ' + pcs(lv, 1), 'sy-ax sy-am', rt ? 'end' : 'start'); }
      if (o.zpanel) {   // the same, in log-odds: a straight line
        s += ln('sy-axl', L, ZB, R, ZB) + ln('sy-axl', L, ZT, L, ZB) + txt(4, ZT - 8, w.z || T('log-odds of bad', 'логарифм шансов плохого'), 'sy-ax');
        ticks(zr[0], zr[1], 1).forEach(function (t) { s += ln('sy-tick', L - 5, YZ(t), L, YZ(t)) + txt(L - 8, YZ(t) + 4, num(t, 0), 'sy-ax', 'end'); });
        xt.forEach(function (t) { s += ln('sy-tick', X(t), ZB, X(t), ZB + 5) + txt(X(t), ZB + 17, num(t, dpOf(xst)), 'sy-ax', 'middle'); });
        var zg = '';
        if (cur) zg += ln('sy6-ln sy6-l-p', X(xr[0]), YZ(z(xr[0])), X(xr[1]), YZ(z(xr[1])));
        (o.bands || []).forEach(function (b) { if (b[2] > 0 && b[2] < b[1]) zg += dot('sy6-bub', X(b[3]), YZ(Math.log(b[2] / (b[1] - b[2]))), 4.5); });
        if (cur) [m1, m2].forEach(function (m, j) { if (m != null) zg += ln('sy-alarm' + (j ? ' sy-dash' : ''), X(m), YZ(z(m)), X(m), ZB) + dot('sy-dot sy-f-y', X(m), YZ(z(m)), 5); });
        var zc = cid + 'z'; s += '<defs><clipPath id="' + zc + '"><rect x="' + L + '" y="' + ZT + '" width="' + (R - L) + '" height="' + (ZB - ZT) + '"/></clipPath></defs><g clip-path="url(#' + zc + ')">' + zg + '</g>';
      }
      if (o.surp && cur && o.pts) {   // each loan's surprise: −ln(the chance the curve gave to what happened)
        var base = SB, hmax = 56;
        s += ln('sy-axl', L, base, R, base) + txt(4, base - hmax - 8, w.surp || T('surprise = −ln(the chance it gave to what happened)', 'удивление = −ln(вероятность того, что случилось)'), 'sy-ax');
        [0, 1, 2, 3].forEach(function (t) { s += txt(L - 8, base - t / 3 * hmax + 4, String(t), 'sy-ax', 'end'); });
        o.pts.forEach(function (q) { var pq = pd(q[0]), su = -Math.log(Math.max(1e-12, q[1] ? pq : 1 - pq)), h = Math.min(3, su) / 3 * hmax; s += rect(q[1] ? 'sy6-sb' : 'sy6-sg', X(q[0]) - 5, base - h, 10, h); });
      }
      host.innerHTML = S.svg(W, H, s);
      var svgEl = host.querySelector ? host.querySelector('svg') : null;
      if (svgEl && (m1 != null || m2 != null) && o.dragMark !== false) {
        var mv = function (pt) { var val = Math.round(Math.max(xr[0], Math.min(xr[1], xr[0] + (pt[0] - L) / (R - L) * (xr[1] - xr[0])))); if (m2 != null) m2 = val; else m1 = val; curve(); };
        bindPointer(svgEl, W, H, mv, mv); svgEl.style.cursor = 'ew-resize';
      }
      var parts = [];
      (o.read || []).forEach(function (k) {
        if (k === 'pd' && cur) [m1, m2].forEach(function (m) { if (m == null) return; var q = pd(m); parts.push(T('%a %s: chance of bad {o|%p} · odds {b|%o} (%w) · log-odds {p|%z}', '%a %s: вероятность плохого {o|%p} · шансы {b|%o} (%w) · логарифм шансов {p|%z}').replace('%a', w.at || T('score', 'балл')).replace('%s', num(m, Math.abs(m % 1) > 1e-9 ? 1 : 0)).replace('%p', pc(q, 2)).replace('%o', num(q / (1 - q), 4)).replace('%w', oddsWords(q)).replace('%z', num(z(m), 2))); });
        if (k === 'ratio' && cur && m1 != null && m2 != null) { var q1 = pd(m1), q2 = pd(m2), rr = (q2 / (1 - q2)) / (q1 / (1 - q1)); parts.push(T('%d points apart: the odds × {y|%r}', 'разница %d баллов: шансы × {y|%r}').replace('%d', num(m2 - m1, 0)).replace('%r', num(rr, 3)) + T(' · the chance ÷ {m|%q}', ' · вероятность ÷ {m|%q}').replace('%q', num(q1 / q2, 2))); }
        if (k === 'loss' && cur) parts.push(T('average surprise (log-loss): the curve {p|%c} · the flat line {m|%f}', 'среднее удивление (log-loss): кривая {p|%c} · плоская линия {m|%f}').replace('%c', num(loss(pd), 3)).replace('%f', num(loss(function () { return rate(); }), 3)) + (fitted ? T(' · the best possible {g|%b}', ' · лучшее возможное {g|%b}').replace('%b', num(loss(function (x) { return sig(fitted[0] + fitted[1] * (x - xc()) / xu()); }), 3)) : ''));
        if (k === 'lpm' && LP && m1 != null) parts.push(T('the straight line at %s: {o|%p}', 'прямая при %s: {o|%p}').replace('%s', num(m1, 0)).replace('%p', pcs(LP[0] + LP[1] * m1, 1)) + (LP[1] ? T(' · it reaches 0 % at {o|%z}', ' · до 0 % она доходит при {o|%z}').replace('%z', num(-LP[0] / LP[1], 0)) : ''));
        if (k === 'max' && cur) parts.push(T('the highest chance anywhere on the curve: {o|%m}', 'самая высокая вероятность на всей кривой: {o|%m}').replace('%m', pc(Math.max(pd(xr[0]), pd(xr[1])), 1)));
        if (k === 'band' && o.bands && o.bands[o.hotBand]) { var b = o.bands[o.hotBand]; parts.push(T('band %l: {o|%k bad of %n = %r}', 'диапазон %l: {o|%k плохих из %n = %r}').replace('%l', b[0]).replace('%k', b[2]).replace('%n', num(b[1], 0)).replace('%r', pc(b[2] / b[1], 2)) + (o.pred && b[4] != null ? T(' · the model predicted {p|%q}', ' · модель предсказала {p|%q}').replace('%q', dec(b[4], 2) + ' %') : '')); }
        if (k === 'total') { var N = 0, K = 0; rows().forEach(function (r) { N += r[1]; K += r[2]; }); parts.push(T('all together: {o|%k} bad of %n = {o|%r}', 'всего: {o|%k} плохих из %n = {o|%r}').replace('%k', num(K, 0)).replace('%n', num(N, 0)).replace('%r', pc(N ? K / N : 0, 2))); }
        if (k === 'fit' && cur) { var b1 = cur[1] / xu(), b0 = cur[0] - b1 * xc(); parts.push(T('log-odds = {p|%a} %s {p|%b} × score', 'логарифм шансов = {p|%a} %s {p|%b} × балл').replace('%a', num(b0, 2)).replace('%s', b1 < 0 ? '−' : '+').replace('%b', num(Math.abs(b1), 4))); }
      });
      info.innerHTML = parts.length ? '<div class="sy-read">' + parts.map(fmt).join('<br>') + '</div>' : '';
    }
    function paint() { if (o.view === 'rulers') rulers(); else if (o.view === 'card') card(); else curve(); }
    return {
      set: function (nx) {
        var k = JSON.stringify([nx.view, nx.pts, nx.bands, nx.curve, nx.p, nx.card, nx.xc, nx.xu, nx.mark, nx.mark2]);
        o = nx;
        if (k !== key || nx.reset) {
          key = k; pp = nx.p != null ? nx.p : 0.25; m1 = nx.mark != null ? nx.mark : null; m2 = nx.mark2 != null ? nx.mark2 : null;
          var rw = rows(); fitted = rw.length ? newton(rw) : null;
          cur = nx.curve === 'fit' ? (fitted ? fitted.slice() : null) : nx.curve && nx.curve.length === 2 ? fromRaw(nx.curve) : null;
        }
        paint();
      },
      act: function (a) {
        if (a.do === 'set') pp = a.p;
        else if (a.do === 'nudge') pp = Math.min(0.995, Math.max(0.005, pp + a.by));
        else if (a.do === 'bend' && cur) cur[1] += a.by;
        else if (a.do === 'shift' && cur) cur[0] += a.by;
        else if (a.do === 'fit' && fitted) cur = fitted.slice();
        else if (a.do === 'move') { var xr = o.xr || [400, 850]; if (m2 != null) m2 = Math.max(xr[0], Math.min(xr[1], m2 + a.by)); else if (m1 != null) m1 = Math.max(xr[0], Math.min(xr[1], m1 + a.by)); }
        paint();
      }
    };
  };
})();
