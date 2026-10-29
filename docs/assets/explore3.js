/* Week 9 explorer types, added to explore.js's registry (window.ALExplore.types); see explore.js for the block format.
Each type draws its playground into `body`, reports its numbers to check(vals, changed) and returns {redraw}.

  guessr  — "guess the correlation": a seeded scatter of n points per round with a hidden r (some steep, some flat,
            so the slope does not give r away); she slides her guess, checks it, sees the true r and the line, and plays
            the next round. numbers: rounds (checked), last (|guess − r| of the last round), best (the smallest error),
            avg5 (the average error of the last 5 rounds; 9 until there are 5), score (points, 100 − 200 × error each).
  regress — real loans as points ("points": [[principal m, payment m, term], …]); drag a loan's payment up or down
            (mouse, finger, or Tab to a dot and the arrow keys); "Add the typo loan" puts one more at "typo": [x, y].
            The least-squares line, r, R² and the slope refit live; the start line stays dashed.
            numbers: r, r2, r2start, slope, slope0 (m per m), slopeChg (|slope ÷ slope0 − 1|), moved (original loans
            off their start), added (0/1), x (the one moved loan's principal, −1 unless exactly one moved), shift (its
            move, m soum), lev (its leverage 1/n + (x − x̄)² / Sxx).
  logit   — the logistic curve PD = 1 / (1 + e^−z), z = a + b · (score − 650) / 100, over the real bad rates of the score
            bands ("bands": [[label, loans, bads, mean score], …], dots sized by loans); log-loss on the score bins
            ("bins": [[mean score, loans, bads], …]) beside the best fit (Newton's method on the same bins) and the flat
            line; a marker reads the curve at one score.
            numbers: a, b, loss, best, gap (loss − best), cur (the marker's score), pd (at the marker), ratio (odds at the
            marker ÷ odds at 600), pdo (100 · ln 2 ÷ −b, 999 when b ≥ 0); "only" keys: a, b, cur.
Random draws are seeded (the same rounds on every visit); every number on screen comes from the lesson's formulas. */
(function () {
  var X = window.ALExplore;
  if (!X) return;
  var T = X.T, esc = X.esc, slider = X.slider;

  /* ---------- shared bits ---------- */
  function rng(seed) {   // mulberry32: small, seeded, the same numbers in every browser
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(R) { var u = 1 - R(), v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function fit(xs, ys) {   // least squares: slope, intercept, r, R², x̄, Sxx
    var n = xs.length, mx = 0, my = 0, sxx = 0, sxy = 0, syy = 0, i;
    for (i = 0; i < n; i++) { mx += xs[i]; my += ys[i]; }
    mx /= n; my /= n;
    for (i = 0; i < n; i++) { var dx = xs[i] - mx, dy = ys[i] - my; sxx += dx * dx; sxy += dx * dy; syy += dy * dy; }
    var b = sxx ? sxy / sxx : 0, r = sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0;
    return { b: b, a: my - b * mx, r: r, r2: r * r, mx: mx, sxx: sxx };
  }
  function fx(v, dp) { var s = v.toFixed(dp); return Number(s) === 0 ? (0).toFixed(dp) : s; }
  function signed(v, dp) { var s = fx(v, dp); return s.charAt(0) === '-' ? '−' + s.slice(1) : s; }
  function spaced(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ').replace(/^-/, '−'); }
  function pctx(v, dp) { return (v * 100).toFixed(dp == null ? 1 : dp) + ' %'; }
  function svgPoint(svg, evt) {   // a pointer's position in the SVG's own units
    var p = svg.createSVGPoint(); p.x = evt.clientX; p.y = evt.clientY;
    var m = svg.getScreenCTM();
    return m ? p.matrixTransform(m.inverse()) : { x: 0, y: 0 };
  }

  /* ---------- guessr: guess the correlation ---------- */
  function guessr(body, g, check) {
    var n = g.n || 40, seed = g.seed || 9;
    var st = { round: 0, guess: 0, shown: false, errs: [], score: 0 };
    var P = { L: 14, R: 386, T: 12, B: 238 };
    body.innerHTML = '<svg class="xp3-svg xp3-gs" viewBox="0 0 400 250" role="img" aria-label="' + esc(T('A scatter plot to guess', 'Диаграмма рассеяния для угадывания')) + '"></svg>' +
      '<div class="xp-ctrl">' + slider(T('Your guess for r', 'Ваша догадка для r'), 'g', -1, 1, 0.01, 0, '0.00') + '</div>' +
      '<div class="xp-btns"><button type="button" class="xp-btn" data-a="check">' + T('Check my guess', 'Проверить догадку') + '</button>' +
      '<button type="button" class="xp-btn xp-ghost" data-a="next">' + T('Next scatter', 'Следующая диаграмма') + '</button></div>' +
      '<div class="xp-big"><span class="xp-big-k"></span><span class="xp-big-v"></span></div>' +
      '<div class="xp-stats"></div><div class="xp-say"></div>' +
      '<div class="xp-note">' + T('Each round: ' + n + ' points with a hidden r. Points: 100 − 200 × your error (an error of 0.05 scores 90).', 'Каждый раунд: ' + n + ' точек со скрытым r. Очки: 100 − 200 × ваша ошибка (ошибка 0,05 даёт 90).') + '</div>';
    var svg = body.querySelector('svg'), sl = body.querySelector('input[type=range]');
    var cur = null;
    function make(i) {   // round i: a target r, a random tilt and height, then the sample's own r
      var R = rng(seed * 1000 + i * 7919 + 17), k;
      var rho = R() < 0.15 ? (R() - 0.5) * 0.3 : (R() * 2 - 1) * 0.96;
      var xs = [], ys = [];
      for (k = 0; k < n; k++) { var x = gauss(R), z = gauss(R); xs.push(x); ys.push(rho * x + Math.sqrt(1 - rho * rho) * z); }
      var f = fit(xs, ys), minx = Math.min.apply(null, xs), maxx = Math.max.apply(null, xs), miny = Math.min.apply(null, ys), maxy = Math.max.apply(null, ys);
      var h = 0.35 + R() * 0.6, off = (1 - h) * R();   // how tall the cloud is drawn, and where: steepness says nothing about r
      var pts = xs.map(function (x, j) {
        return [P.L + 8 + (x - minx) / (maxx - minx) * (P.R - P.L - 16), P.B - 8 - (off + (ys[j] - miny) / (maxy - miny) * h) * (P.B - P.T - 16)];
      });
      var line = fit(pts.map(function (p) { return p[0]; }), pts.map(function (p) { return p[1]; }));
      return { r: Math.round(f.r * 100) / 100, pts: pts, line: line };
    }
    function redraw() {
      if (!cur) cur = make(st.round);
      var o = '<rect class="xp3-frame" x="' + P.L + '" y="' + P.T + '" width="' + (P.R - P.L) + '" height="' + (P.B - P.T) + '" rx="8"/>';
      if (st.shown) {
        var x1 = P.L + 4, x2 = P.R - 4, l = cur.line;
        o += '<line class="xp3-now" x1="' + x1 + '" x2="' + x2 + '" y1="' + Math.max(P.T, Math.min(P.B, l.a + l.b * x1)).toFixed(1) + '" y2="' + Math.max(P.T, Math.min(P.B, l.a + l.b * x2)).toFixed(1) + '"/>';
      }
      cur.pts.forEach(function (p) { o += '<circle class="xp3-dot" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4.2"/>'; });
      svg.innerHTML = o;
      body.querySelector('[data-v="g"]').textContent = signed(st.guess, 2);
      body.querySelector('[data-a="check"]').disabled = st.shown;
      body.querySelector('[data-a="next"]').disabled = !st.shown;
      sl.disabled = st.shown;
      var e = st.errs, last = e.length ? e[e.length - 1] : 9, best = e.length ? Math.min.apply(null, e) : 9, avg5 = 9;
      if (e.length >= 5) { avg5 = 0; for (var i = e.length - 5; i < e.length; i++) avg5 += e[i]; avg5 /= 5; }
      if (st.shown) {
        body.querySelector('.xp-big-k').textContent = T('True r', 'Настоящий r');
        body.querySelector('.xp-big-v').textContent = signed(cur.r, 2);
        var pts = Math.max(0, Math.round(100 - 200 * last));
        body.querySelector('.xp-say').innerHTML = T('You said <b>' + signed(st.guess, 2) + '</b>, the points say <b>' + signed(cur.r, 2) + '</b>: off by <b>' + fx(last, 2) + '</b>, <b>' + pts + '</b> points. The line is the least-squares line: r is how tightly the dots hug it, not how steep it is.',
          'Вы сказали <b>' + signed(st.guess, 2) + '</b>, точки говорят <b>' + signed(cur.r, 2) + '</b>: ошибка <b>' + fx(last, 2) + '</b>, очков: <b>' + pts + '</b>. Линия — линия наименьших квадратов: r — это то, насколько плотно точки лежат вдоль неё, а не её крутизна.');
      } else {
        body.querySelector('.xp-big-k').textContent = T('Round ' + (st.round + 1) + ': slide your guess, then check', 'Раунд ' + (st.round + 1) + ': передвиньте догадку и проверьте');
        body.querySelector('.xp-big-v').textContent = '?';
        body.querySelector('.xp-say').innerHTML = T('Direction first (up or down?), then how close to a straight line the cloud is.', 'Сначала направление (вверх или вниз?), потом — насколько облако близко к прямой.');
      }
      body.querySelector('.xp-stats').innerHTML = '<span>' + T('rounds', 'раундов') + ' <b>' + e.length + '</b></span>' +
        '<span>' + T('best error', 'лучшая ошибка') + ' <b>' + (e.length ? fx(best, 2) : '—') + '</b></span>' +
        '<span>' + T('average of the last 5', 'среднее за последние 5') + ' <b>' + (e.length >= 5 ? fx(avg5, 3) : '—') + '</b></span>' +
        '<span>' + T('score', 'очки') + ' <b>' + st.score + '</b></span>';
      check({ rounds: e.length, last: last, best: best, avg5: avg5, score: st.score }, {});
    }
    sl.addEventListener('input', function () { st.guess = Number(sl.value); redraw(); });
    body.querySelectorAll('.xp-btn').forEach(function (bt) {
      bt.onclick = function () {
        if (bt.getAttribute('data-a') === 'check' && !st.shown) {
          var err = Math.round(Math.abs(st.guess - cur.r) * 100) / 100;
          st.errs.push(err); st.score += Math.max(0, Math.round(100 - 200 * err)); st.shown = true;
        } else if (bt.getAttribute('data-a') === 'next' && st.shown) {
          st.round++; cur = null; st.shown = false; st.guess = 0; sl.value = 0;
        }
        redraw();
      };
    });
    redraw();
    return { redraw: redraw };
  }

  /* ---------- regress: drag a loan, watch the line ---------- */
  function regress(body, g, check) {
    var base = (g.points || []).map(function (p) { return { x: p[0], y: p[1], y0: p[1], t: p[2] }; });
    var typo = g.typo || [395, 2], XM = g.xmax || 420, YM = g.ymax || 30;
    var st = { added: false, add: { x: typo[0], y: typo[1], y0: typo[1], t: 0 } };
    var P = { L: 36, R: 390, T: 14, B: 226 };
    function sx(v) { return P.L + v / XM * (P.R - P.L); }
    function sy(v) { return P.B - v / YM * (P.B - P.T); }
    var terms = [], TC = ['xp3-t0', 'xp3-t1', 'xp3-t2', 'xp3-t3'];
    base.forEach(function (p) { if (terms.indexOf(p.t) < 0) terms.push(p.t); });
    terms.sort(function (a, b) { return a - b; });
    body.innerHTML = '<div class="xp-big"><span class="xp-big-k">' + T('Slope: one more million soum of principal adds, a month', 'Наклон: ещё один миллион сумов кредита добавляет в месяц') + '</span><span class="xp-big-v"></span></div>' +
      '<svg class="xp3-svg xp3-rg" viewBox="0 0 400 252" role="img" aria-label="' + esc(T('Loans: principal against monthly payment, with the least-squares line', 'Кредиты: сумма против ежемесячного платежа, с линией наименьших квадратов')) + '"></svg>' +
      '<div class="xp-legend">' + terms.map(function (t, i) { return '<span class="xl3-' + i + '">' + t + T(' months', ' мес.') + '</span>'; }).join('') +
      '<span class="xl3-start">' + T('start line', 'исходная линия') + '</span><span class="xl3-now">' + T('line now', 'линия сейчас') + '</span></div>' +
      '<div class="xp-btns"><button type="button" class="xp-btn" data-a="typo"></button><button type="button" class="xp-btn xp-ghost" data-a="reset">' + T('Start again', 'Сначала') + '</button></div>' +
      '<div class="xp-stats"></div><div class="xp-say"></div>' +
      '<div class="xp-note">' + T('Drag a dot up or down to retype that loan’s payment (or Tab to a dot and use ↑ ↓; Shift moves faster).', 'Тяните точку вверх или вниз — это новый платёж этого кредита (или Tab до точки и ↑ ↓; с Shift быстрее).') + '</div>';
    var svg = body.querySelector('svg');
    var f0 = fit(base.map(function (p) { return p.x; }), base.map(function (p) { return p.y0; }));
    function all() { return st.added ? base.concat([st.add]) : base; }
    function lineSeg(f, cls) {   // the line, cut to the plot box
      var xa = 0, xb = XM;
      if (Math.abs(f.b) > 1e-12) {
        var u = (0 - f.a) / f.b, w = (YM - f.a) / f.b;
        xa = Math.max(0, Math.min(u, w)); xb = Math.min(XM, Math.max(u, w));
      }
      if (xb < xa) return '';
      return '<line class="' + cls + '" x1="' + sx(xa).toFixed(1) + '" x2="' + sx(xb).toFixed(1) + '" y1="' + sy(f.a + f.b * xa).toFixed(1) + '" y2="' + sy(f.a + f.b * xb).toFixed(1) + '"/>';
    }
    var drag = null;
    function draw() {
      var pts = all(), f = fit(pts.map(function (p) { return p.x; }), pts.map(function (p) { return p.y; }));
      var o = '', i;
      for (i = 0; i <= 4; i++) { var xv = i * 100; o += '<line class="xp3-grid" x1="' + sx(xv) + '" x2="' + sx(xv) + '" y1="' + P.T + '" y2="' + P.B + '"/><text class="xp-ax" x="' + sx(xv) + '" y="' + (P.B + 13) + '" text-anchor="middle">' + xv + '</text>'; }
      for (i = 0; i <= 3; i++) { var yv = i * 10; o += '<line class="xp3-grid" x1="' + P.L + '" x2="' + P.R + '" y1="' + sy(yv) + '" y2="' + sy(yv) + '"/><text class="xp-ax" x="' + (P.L - 5) + '" y="' + (sy(yv) + 3.5) + '" text-anchor="end">' + yv + '</text>'; }
      o += '<text class="xp-ax" x="' + P.R + '" y="' + (P.B + 25) + '" text-anchor="end">' + T('principal, m soum', 'сумма кредита, млн сумов') + '</text>' +
        '<text class="xp-ax" x="' + (P.L + 4) + '" y="' + (P.T + 9) + '">' + T('payment, m soum a month', 'платёж, млн сумов в месяц') + '</text>';
      o += lineSeg(f0, 'xp3-start') + lineSeg(f, 'xp3-now');
      pts.forEach(function (p) {
        if (Math.abs(p.y - p.y0) > 1e-9) o += '<line class="xp3-move" x1="' + sx(p.x).toFixed(1) + '" x2="' + sx(p.x).toFixed(1) + '" y1="' + sy(p.y0).toFixed(1) + '" y2="' + sy(p.y).toFixed(1) + '"/><circle class="xp3-ghost" cx="' + sx(p.x).toFixed(1) + '" cy="' + sy(p.y0).toFixed(1) + '" r="4"/>';
      });
      pts.forEach(function (p, k) {
        var cls = p === st.add ? 'xp3-typo' : TC[terms.indexOf(p.t)] || 'xp3-t0';
        o += '<g class="xp3-pt" data-k="' + k + '" tabindex="0" role="slider" aria-label="' + esc(T('loan of ' + p.x + ' m soum', 'кредит на ' + p.x + ' млн сумов')) + '" aria-valuenow="' + p.y.toFixed(2) + '">' +
          '<circle class="xp3-hit" cx="' + sx(p.x).toFixed(1) + '" cy="' + sy(p.y).toFixed(1) + '" r="13"/><circle class="xp3-d ' + cls + (drag && drag.k === k ? ' on' : '') + '" cx="' + sx(p.x).toFixed(1) + '" cy="' + sy(p.y).toFixed(1) + '" r="' + (p === st.add ? 6 : 5) + '"/></g>';
      });
      svg.innerHTML = o;
      return f;
    }
    function redraw() {
      var f = draw(), moved = base.filter(function (p) { return Math.abs(p.y - p.y0) > 1e-9; });
      var one = moved.length === 1 ? moved[0] : null, lev = -1;
      if (one) lev = 1 / base.length + Math.pow(one.x - f0.mx, 2) / f0.sxx;
      var chg = f0.b ? Math.abs(f.b / f0.b - 1) : 0;
      body.querySelector('.xp-big-v').textContent = spaced(f.b * 1e6) + T(' soum', ' сумов');
      body.querySelector('[data-a="typo"]').textContent = st.added ? T('Remove the typo loan', 'Убрать кредит с опечаткой') : T('Add the typo loan', 'Добавить кредит с опечаткой');
      body.querySelector('.xp-stats').innerHTML = '<span>r <b>' + fx(f.r, 3) + '</b></span><span>R² <b>' + fx(f.r2, 3) + '</b></span>' +
        '<span>' + T('intercept', 'свободный член') + ' <b>' + signed(f.a, 2) + T(' m', ' млн') + '</b></span>' +
        '<span>' + T('slope change', 'изменение наклона') + ' <b>' + (f.b >= f0.b ? '+' : '−') + fx(chg * 100, 1) + ' %</b></span>' +
        '<span>' + T('loans moved', 'сдвинуто кредитов') + ' <b>' + moved.length + '</b></span>';
      var say;
      if (one) say = T('One loan of <b>' + one.x + ' m</b> moved by <b>' + fx(Math.abs(one.y - one.y0), 1) + ' m</b>. Its leverage is <b>' + fx(lev, 3) + '</b> (the average principal is ' + fx(f0.mx, 0) + ' m), and the slope changed by <b>' + fx(chg * 100, 1) + ' %</b>.',
        'Один кредит на <b>' + one.x + ' млн</b> сдвинут на <b>' + fx(Math.abs(one.y - one.y0), 1) + ' млн</b>. Его рычаг — <b>' + fx(lev, 3) + '</b> (средняя сумма — ' + fx(f0.mx, 0) + ' млн), наклон изменился на <b>' + fx(chg * 100, 1) + ' %</b>.');
      else if (moved.length) say = T('<b>' + moved.length + '</b> loans moved: the line now answers to all of them at once.', 'Сдвинуто кредитов: <b>' + moved.length + '</b> — теперь линия отвечает им всем сразу.');
      else say = T('These are ' + base.length + ' real Auto loans. The line makes the sum of squared vertical gaps as small as it can be.', 'Это ' + base.length + ' настоящих автокредитов. Линия делает сумму квадратов вертикальных отклонений минимально возможной.');
      if (st.added) say += T(' The typo loan (' + st.add.x + ' m, payment ' + fx(st.add.y, 1) + ' m) sits far to the right: a point with high leverage.', ' Кредит с опечаткой (' + st.add.x + ' млн, платёж ' + fx(st.add.y, 1) + ' млн) стоит далеко справа: точка с большим рычагом.');
      body.querySelector('.xp-say').innerHTML = say;
      check({ r: f.r, r2: f.r2, r2start: f0.r2, slope: f.b, slope0: f0.b, slopeChg: chg, moved: moved.length, added: st.added ? 1 : 0,
        x: one ? one.x : -1, shift: one ? Math.abs(one.y - one.y0) : 0, lev: lev }, {});
    }
    function pointOf(k) { return all()[k]; }
    var focusK = null;   // the dot that has the keyboard focus survives a redraw
    function refocus() { if (focusK == null) return; var again = svg.querySelector('.xp3-pt[data-k="' + focusK + '"]'); if (again && document.activeElement !== again) again.focus({ preventScroll: true }); }
    svg.addEventListener('focusin', function (e) { var gq = e.target.closest ? e.target.closest('.xp3-pt') : null; focusK = gq ? Number(gq.getAttribute('data-k')) : null; });
    svg.addEventListener('pointerdown', function (e) {
      var gq = e.target.closest ? e.target.closest('.xp3-pt') : null;
      if (!gq) return;
      e.preventDefault();
      var k = Number(gq.getAttribute('data-k'));
      drag = { k: k, id: e.pointerId, from: svgPoint(svg, e).y, y: pointOf(k).y };   // the dot moves with the finger, it does not jump to it
      focusK = k;
      try { svg.setPointerCapture(e.pointerId); } catch (er) { /* an old browser: the moves still arrive while over the picture */ }
      redraw(); refocus();
    });
    svg.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      e.preventDefault();
      var p = pointOf(drag.k), dy = (drag.from - svgPoint(svg, e).y) / (P.B - P.T) * YM;
      p.y = Math.round(Math.max(0, Math.min(YM, drag.y + dy)) * 100) / 100;
      redraw(); refocus();
    });
    function end(e) { if (drag && e.pointerId === drag.id) { drag = null; redraw(); refocus(); } }
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);
    svg.addEventListener('keydown', function (e) {
      var gq = e.target.closest ? e.target.closest('.xp3-pt') : null;
      if (!gq || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
      e.preventDefault();
      var k = Number(gq.getAttribute('data-k')), p = pointOf(k), step = e.shiftKey ? 2 : 0.5;
      p.y = Math.round(Math.max(0, Math.min(YM, p.y + (e.key === 'ArrowUp' ? step : -step))) * 100) / 100;
      focusK = k;
      redraw(); refocus();
    });
    body.querySelectorAll('.xp-btn').forEach(function (bt) {
      bt.onclick = function () {
        if (bt.getAttribute('data-a') === 'typo') { st.added = !st.added; st.add.y = st.add.y0; }
        else { base.forEach(function (p) { p.y = p.y0; }); st.added = false; st.add.y = st.add.y0; }
        redraw();
      };
    });
    redraw();
    return { redraw: redraw };
  }

  /* ---------- logit: the S-curve through the bands ---------- */
  function logit(body, g, check) {
    var bins = g.bins || [], bands = g.bands || [], s0 = g.start || {};
    var st = { a: s0.a == null ? -3.48 : s0.a, b: s0.b == null ? 0 : s0.b, cur: s0.cur || 650 };
    var start = { a: st.a, b: st.b, cur: st.cur };
    var N = 0, K = 0, i;
    for (i = 0; i < bins.length; i++) { N += bins[i][1]; K += bins[i][2]; }
    function lp(z) { return z > 0 ? -Math.log(1 + Math.exp(-z)) : z - Math.log(1 + Math.exp(z)); }   // log(1 / (1 + e^−z)), safe both ways
    function loss(a, b) {
      var s = 0;
      for (var j = 0; j < bins.length; j++) { var z = a + b * (bins[j][0] - 650) / 100; s -= bins[j][2] * lp(z) + (bins[j][1] - bins[j][2]) * lp(-z); }
      return s / N;
    }
    var best = (function () {   // Newton's method on the same bins: the maximum-likelihood curve
      var a = Math.log(K / (N - K)), b = 0;
      for (var it = 0; it < 60; it++) {
        var g0 = 0, g1 = 0, h00 = 0, h01 = 0, h11 = 0;
        for (var j = 0; j < bins.length; j++) {
          var x = (bins[j][0] - 650) / 100, p = 1 / (1 + Math.exp(-(a + b * x))), w = bins[j][1] * p * (1 - p), e = bins[j][2] - bins[j][1] * p;
          g0 += e; g1 += e * x; h00 += w; h01 += w * x; h11 += w * x * x;
        }
        var det = h00 * h11 - h01 * h01;
        if (!det) break;
        var da = (h11 * g0 - h01 * g1) / det, db = (h00 * g1 - h01 * g0) / det;
        a += da; b += db;
        if (Math.abs(da) + Math.abs(db) < 1e-12) break;
      }
      return { a: a, b: b, loss: loss(a, b) };
    })();
    var flat = loss(Math.log(K / (N - K)), 0);
    var SX0 = 420, SX1 = 860, YM = g.ymax || 0.16, P = { L: 34, R: 390, T: 24, B: 214 }, clip = 'xp3c-' + String(g.id || 'lg').replace(/[^\w-]/g, '');
    function sx(v) { return P.L + (v - SX0) / (SX1 - SX0) * (P.R - P.L); }
    function sy(v) { return P.B - Math.min(v, YM) / YM * (P.B - P.T); }
    function syRaw(v) { return P.B - v / YM * (P.B - P.T); }   // the curve may leave the top: it is clipped, not flattened
    function PD(a, b, s) { return 1 / (1 + Math.exp(-(a + b * (s - 650) / 100))); }
    body.innerHTML = '<div class="xp-big"><span class="xp-big-k">' + T('Log-loss of your curve (lower is better)', 'Log-loss вашей кривой (чем меньше, тем лучше)') + '<small></small></span><span class="xp-big-v"></span></div>' +
      '<svg class="xp3-svg xp3-lg" viewBox="0 0 400 244" role="img" aria-label="' + esc(T('Bad rate by score band and a logistic curve', 'Доля плохих по диапазонам скоринга и логистическая кривая')) + '"></svg>' +
      '<div class="xp-legend"><span class="xl3-band">' + T('bad rate of a score band (size = loans)', 'доля плохих в диапазоне (размер = кредиты)') + '</span><span class="xl3-now">' + T('your curve', 'ваша кривая') + '</span></div>' +
      '<div class="xp-ctrl">' +
      slider(T('Height: log-odds at a score of 650', 'Высота: логарифм шансов при скоринге 650'), 'a', -5.5, -1.5, 0.01, st.a, '') +
      slider(T('Slope: change in log-odds per 100 points', 'Наклон: изменение логарифма шансов на 100 баллов'), 'b', -3, 0.5, 0.01, st.b, '') +
      slider(T('Read the curve at score', 'Прочитать кривую при скоринге'), 'cur', 450, 850, 5, st.cur, '') + '</div>' +
      '<div class="xp-stats"></div><div class="xp-say"></div>' +
      '<div class="xp-note">' + T('PD = 1 / (1 + e^−z), z = height + slope × (score − 650) / 100. Log-loss over ' + spaced(N) + ' scored loans.', 'PD = 1 / (1 + e^−z), z = высота + наклон × (скоринг − 650) / 100. Log-loss по ' + spaced(N) + ' кредитам со скорингом.') + '</div>';
    var svg = body.querySelector('svg');
    var maxN = Math.max.apply(null, bands.map(function (b) { return b[1]; }).concat([1]));
    function redraw() {
      var a = st.a, b = st.b, o = '', j;
      for (j = 0; j <= 4; j++) { var yv = j * YM / 4; o += '<line class="xp3-grid" x1="' + P.L + '" x2="' + P.R + '" y1="' + sy(yv).toFixed(1) + '" y2="' + sy(yv).toFixed(1) + '"/><text class="xp-ax" x="' + (P.L - 5) + '" y="' + (sy(yv) + 3.5).toFixed(1) + '" text-anchor="end">' + Math.round(yv * 100) + ' %</text>'; }
      for (j = 450; j <= 850; j += 100) o += '<text class="xp-ax" x="' + sx(j).toFixed(1) + '" y="' + (P.B + 13) + '" text-anchor="middle">' + j + '</text>';
      o += '<text class="xp-ax" x="' + P.R + '" y="' + (P.B + 25) + '" text-anchor="end">' + T('credit score', 'кредитный скоринг') + '</text>' +
        '<text class="xp-ax" x="' + (P.L - 30) + '" y="10">' + T('share that went bad', 'доля плохих') + '</text>' +
        '<defs><clipPath id="' + clip + '"><rect x="' + P.L + '" y="' + (P.T - 2) + '" width="' + (P.R - P.L) + '" height="' + (P.B - P.T + 4) + '"/></clipPath></defs>';
      var path = '';
      for (j = 0; j <= 88; j++) { var s = SX0 + j * 5; path += (j ? 'L' : 'M') + sx(s).toFixed(1) + ' ' + Math.max(-400, syRaw(PD(a, b, s))).toFixed(1); }
      bands.forEach(function (bd) {
        o += '<circle class="xp3-band" cx="' + sx(bd[3]).toFixed(1) + '" cy="' + sy(bd[2] / bd[1]).toFixed(1) + '" r="' + (3.5 + 7 * Math.sqrt(bd[1] / maxN)).toFixed(1) + '"/>';
      });
      o += '<path class="xp3-curve" clip-path="url(#' + clip + ')" d="' + path + '"/>';
      var pc = PD(a, b, st.cur), xc = sx(st.cur);
      o += '<line class="xp3-mark" x1="' + xc.toFixed(1) + '" x2="' + xc.toFixed(1) + '" y1="' + P.T + '" y2="' + P.B + '"/><circle class="xp3-mk" cx="' + xc.toFixed(1) + '" cy="' + sy(pc).toFixed(1) + '" r="4.5"/>' +
        '<text class="xp3-mt" x="' + (st.cur > 760 ? xc - 6 : xc + 6).toFixed(1) + '" y="' + Math.max(P.T + 22, sy(pc) - 8).toFixed(1) + '"' + (st.cur > 760 ? ' text-anchor="end"' : '') + '>' + pctx(pc, 1) + '</text>';
      svg.innerHTML = o;
      var L = loss(a, b), gap = L - best.loss, odds = pc / (1 - pc), p600 = PD(a, b, 600), ratio = odds / (p600 / (1 - p600)), pdo = b < 0 ? 100 * Math.LN2 / -b : 999;
      body.querySelector('[data-v="a"]').textContent = signed(a, 2);
      body.querySelector('[data-v="b"]').textContent = signed(b, 2);
      body.querySelector('[data-v="cur"]').textContent = st.cur;
      body.querySelector('.xp-big-v').textContent = L.toFixed(4);
      body.querySelector('.xp-big-k small').textContent = T(' · best ' + best.loss.toFixed(4) + ' · flat line ' + flat.toFixed(4), ' · лучшая ' + best.loss.toFixed(4) + ' · плоская линия ' + flat.toFixed(4));
      body.querySelector('.xp-stats').innerHTML = '<span>' + T('above the best', 'хуже лучшей на') + ' <b>' + gap.toFixed(4) + '</b></span>' +
        '<span>PD(' + st.cur + ') <b>' + pctx(pc, 2) + '</b></span>' +
        '<span>' + T('odds vs 600', 'шансы к 600') + ' <b>×' + ratio.toFixed(2) + '</b></span>' +
        '<span>' + T('odds double every', 'шансы удваиваются каждые') + ' <b>' + (b < 0 ? fx(pdo, 0) + T(' points', ' баллов') : '—') + '</b></span>';
      body.querySelector('.xp-say').innerHTML = T('At a score of <b>' + st.cur + '</b> your curve says <b>' + pctx(pc, 1) + '</b>: about <b>' + Math.round(pc * 1000) + '</b> bad loans in every 1 000 such loans, odds of 1 bad to ' + fx((1 - pc) / pc, 1) + ' good.',
        'При скоринге <b>' + st.cur + '</b> ваша кривая говорит <b>' + pctx(pc, 1) + '</b>: около <b>' + Math.round(pc * 1000) + '</b> плохих на каждые 1 000 таких кредитов, шансы — 1 плохой к ' + fx((1 - pc) / pc, 1) + ' хорошим.');
      check({ a: a, b: b, loss: L, best: best.loss, gap: gap, cur: st.cur, pd: pc, ratio: ratio, pdo: pdo },
        { a: Math.abs(a - start.a) > 1e-9, b: Math.abs(b - start.b) > 1e-9, cur: st.cur !== start.cur });
    }
    body.querySelectorAll('input[type=range]').forEach(function (r) {
      r.addEventListener('input', function () { st[r.getAttribute('data-k')] = Number(r.value); redraw(); });
    });
    redraw();
    return { redraw: redraw };
  }

  X.types.guessr = guessr;
  X.types.regress = regress;
  X.types.logit = logit;
})();
