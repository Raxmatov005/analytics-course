/* More explorer types (tests, power, peeking, A/B), added to explore.js's registry: window.ALExplore.types.
Loaded right after explore.js; see explore.js's header for the block format and the challenge rules. Each type draws
its playground into `body`, reports its numbers to check(vals, changed) and returns {redraw}.

  pvalue  — the H₀ world of a two-rate test (W6D3): both groups at the pooled rate, simulated 100 / 1 000 times; the
            histogram of the gaps with the tails beyond the observed gap shaded; simulated p beside the formula's p.
            Sliders: the first group's count (start.kA of start.nA) and the size of both groups (×¼ … ×4, rates kept).
            numbers: sims, psim, pf, perr (|psim − pf|), k, scale, gap (points); "only" keys: k, s.
  errors  — many tests of the same two groups in a world with no real difference or with one (the lesson's rates);
            the 2×2 of truth × decision, re-read at every α. numbers: alpha, n0, n1, fa, power, miss (shares); only: alpha.
  power   — the two sampling distributions (no effect / the true effect) with the α cut-off; sliders n per arm, the
            treated arm's rate, α; Cohen's h power as in the lesson. numbers: n, p2, alpha, power, need; only: n, p2, alpha.
  peeking — A/A experiments month by month; the same runs read once at the end and by a peeker who stops at the first
            p < 0.05 (looks: 1, 2, 3, 4, 6 or 12). numbers: runs, once, peek (false-win shares), looks; only: looks.
  abplan  — the A/B plan: baseline, MDE, traffic a day and the split → users per arm and days (days rounded as the
            lesson's table, weeks rounded up). numbers: base, mde, traffic, split, days, weeks, total; only: the same four.
  srm     — the arm counts → the chi-square SRM p-value, with where chance alone puts the split; presets for the
            lesson's slices. numbers: N, share (B's), dev (|share − ½|), p; only: N, share.
Random draws are seeded (the same worlds on every visit); every number on screen comes from the lesson's formulas. */
(function () {
  var X = window.ALExplore;
  if (!X) return;
  var T = X.T, esc = X.esc, fmtText = X.fmtText, pct = X.pct, num = X.num, slider = X.slider;

  /* ---------- shared maths ---------- */
  function erfc(x) {   // Numerical Recipes' erfcc: fractional error below 1.2e-7 everywhere, so tiny tails stay right
    var z = Math.abs(x), t = 1 / (1 + 0.5 * z);
    var r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 +
      t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    return x >= 0 ? r : 2 - r;
  }
  function Phi(z) { return 0.5 * erfc(-z / Math.SQRT2); }
  function p2(z) { return erfc(Math.abs(z) / Math.SQRT2); }   // two-sided p of a z
  function zq(p) {   // the normal quantile (Acklam, relative error 1e-9)
    var a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239],
      b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572],
      c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783],
      d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416], q, r;
    if (p < 0.02425 || p > 0.97575) {
      q = Math.sqrt(-2 * Math.log(p < 0.5 ? p : 1 - p));
      r = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
      return p < 0.5 ? r : -r;
    }
    q = p - 0.5; r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  function rng(seed) {   // mulberry32: the same draws on every visit
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = Math.imul(s ^ (s >>> 15), s | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function binom(n, p, rnd) {   // an exact binomial draw by inversion (n·p stays below a few hundred here)
    var q = 1 - p, f = Math.pow(q, n), u = rnd(), k = 0, r = p / q;
    if (f === 0) {   // too many to invert: the normal shape is exact enough there
      var g = Math.sqrt(-2 * Math.log(rnd() || 1e-12)) * Math.cos(2 * Math.PI * rnd());
      return Math.max(0, Math.min(n, Math.round(n * p + g * Math.sqrt(n * p * q))));
    }
    while (u > f && k < n) { u -= f; k++; f *= r * (n - k + 1) / k; }
    return k;
  }
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function fmtP(p) {
    if (p >= 0.01) return p.toFixed(3);
    if (p >= 0.0001) return p.toPrecision(3).replace(/0+$/, '');   // 0.0024, 0.00103: three digits keep 0.001 readable
    if (p < 1e-100) return '< 10⁻¹⁰⁰';
    var e = Math.floor(Math.log(p) / Math.LN10), m = p / Math.pow(10, e);
    if (m >= 9.95) { m = 1; e++; }
    return m.toFixed(1) + ' × 10' + String(e).replace(/./g, function (ch) { return SUP[ch]; });
  }
  function pts(x, dp) { return (x * 100).toFixed(dp == null ? 2 : dp); }          // a rate difference in points
  function rate(x, dp) { return (x * 100).toFixed(dp) + ' %'; }                     // 8.0 %, 1.00 % (zeros kept)
  function rate2(x) { return (x * 100).toFixed(2).replace(/(\.\d)0$/, '$1') + ' %'; } // 8.9 %, 8.95 %
  function ruPl(n, one, few, many) { var a = n % 10, b = n % 100; return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many; }
  function near(list, v) {   // the index of the list value closest to v
    var best = 0;
    for (var i = 1; i < list.length; i++) if (Math.abs(list[i] - v) < Math.abs(list[best] - v)) best = i;
    return best;
  }
  function on(body, fn) { body.querySelectorAll('input[type=range]').forEach(function (r) { r.addEventListener('input', function () { fn(r.getAttribute('data-k'), Number(r.value)); }); }); }
  function setV(body, k, html) { var el = body.querySelector('[data-v="' + k + '"]'); if (el) el.innerHTML = html; }
  function setO(body, k, html) { var el = body.querySelector('[data-o="' + k + '"]'); if (el) el.innerHTML = html; }
  function btn(a, label, ghost) { return '<button type="button" class="xp-btn' + (ghost ? ' xp-ghost' : '') + '" data-a="' + a + '">' + label + '</button>'; }
  function legend(items) { return '<div class="xp-legend xp2-leg">' + items.map(function (it) { return '<span class="' + it[0] + '">' + it[1] + '</span>'; }).join('') + '</div>'; }

  /* ---------- pvalue: the no-effect world, built by hand ---------- */
  X.types.pvalue = function (body, g, check) {
    var s0 = g.start || {}, nA0 = s0.nA || 2411, nB0 = s0.nB || 3263, kB = s0.kB == null ? 34 : s0.kB;
    var kr = g.kRange || [30, 55], SC = [0.25, 0.5, 1, 2, 4], SCN = ['×¼', '×½', '×1', '×2', '×4'], MAX = 10000;
    var st = { k: s0.kA || 41, si: 2 }, start = { k: st.k, si: st.si }, diffs = [], seed = 2026, rnd = rng(seed);
    body.innerHTML = '<div class="xp-ctrl">' +
      slider(fmtText(g.kLabel || T('First group: late first payments', 'Первая группа: просрочки первого платежа')), 'k', kr[0], kr[1], 1, st.k, '') +
      slider(T('Loans in each group (the rates stay)', 'Кредитов в каждой группе (доли те же)'), 's', 0, SC.length - 1, 1, st.si, '') + '</div>' +
      '<div class="xp2-duo"><div><span>' + T('Simulated p', 'p по симуляции') + '</span><b data-o="ps"></b><i data-o="psn"></i></div>' +
      '<div><span>' + T('Formula p', 'p по формуле') + '</span><b data-o="pf"></b><i data-o="pfz"></i></div></div>' +
      '<div class="xp-btns">' + btn('100', T('Draw 100 samples', 'Взять 100 выборок')) + btn('1000', T('Draw 1 000 samples', 'Взять 1 000 выборок')) +
      btn('reset', T('Start again', 'Сначала'), true) + '</div>' +
      '<div class="xp-mini-k">' + fmtText(g.histLabel || T('The gap between the groups in the no-effect world, points', 'Разрыв между группами в мире без эффекта, п.')) + '</div>' +
      '<svg class="xp2-svg" viewBox="0 0 400 186" role="img"></svg>' +
      legend([['xl2-bar', T('a gap smaller than ours', 'разрыв меньше нашего')], ['xl2-tail', T('at least as far from 0 as ours: the p-value', 'не ближе к 0, чем наш: это и есть p')], ['xl2-curve', T('the formula’s bell', 'колокол формулы')]]) +
      '<div class="xp-say"></div>';
    var svg = body.querySelector('svg');
    function sizes() { var s = SC[st.si]; return [Math.round(nA0 * s), Math.round(nB0 * s)]; }
    function pool() { return (st.k + kB) / (nA0 + nB0); }
    function one() { var n = sizes(), p = pool(); return binom(n[0], p, rnd) / n[0] - binom(n[1], p, rnd) / n[1]; }
    function regen() { rnd = rng(seed); var c = diffs.length; diffs = []; for (var i = 0; i < c; i++) diffs.push(one()); }
    function redraw() {
      var n = sizes(), p = pool(), gap = st.k / nA0 - kB / nB0, ag = Math.abs(gap), S = diffs.length, i;
      var se = Math.sqrt(p * (1 - p) * (1 / n[0] + 1 / n[1])), z = gap / se, pf = p2(z), cnt = 0;
      for (i = 0; i < S; i++) if (Math.abs(diffs[i]) >= ag - 1e-12) cnt++;
      var ps = S ? cnt / S : null;
      /* the histogram: ±gap fall on bin edges, so the shaded bars are exactly the counted samples */
      var R = Math.max(4 * se, 1.3 * ag), m = Math.max(2, Math.round(ag / (R / 18))), w = ag / m, K = Math.ceil(R / w), h = new Array(2 * K).fill(0);
      for (i = 0; i < S; i++) {
        var d = diffs[i], j = d >= 0 ? Math.floor(d / w + 1e-9) : -Math.floor(-d / w + 1e-9) - 1;
        h[Math.max(0, Math.min(2 * K - 1, j + K))]++;
      }
      var E = K * w, top = 1, peak = S * w / (se * Math.sqrt(2 * Math.PI));
      for (i = 0; i < 2 * K; i++) top = Math.max(top, h[i]);
      if (S) top = Math.max(top, peak);
      function x(v) { return 200 + v / E * 190; }
      var out = '', bw = 380 / (2 * K);
      for (i = 0; i < 2 * K; i++) {
        var jj = i - K, hh = h[i] / top * 132;
        if (h[i]) out += '<rect class="' + (jj >= m || jj <= -m - 1 ? 'xp2-tail' : 'xp2-bar') + '" x="' + (10 + i * bw + 0.4).toFixed(1) + '" y="' + (150 - hh).toFixed(1) + '" width="' + (bw - 0.8).toFixed(1) + '" height="' + hh.toFixed(1) + '"/>';
      }
      if (S) {
        var path = '';
        for (i = 0; i <= 96; i++) { var v = -E + 2 * E * i / 96, y = S * w * Math.exp(-0.5 * v * v / (se * se)) / (se * Math.sqrt(2 * Math.PI)); path += (i ? 'L' : 'M') + x(v).toFixed(1) + ' ' + (150 - y / top * 132).toFixed(1); }
        out += '<path class="xp2-curve" d="' + path + '"/>';
      } else out += '<text class="xp-empty" x="200" y="88" text-anchor="middle">' + T('Press “Draw” to build the no-effect world', 'Нажмите «Взять», чтобы построить мир без эффекта') + '</text>';
      out += '<line class="xp2-axis" x1="10" x2="390" y1="150.5" y2="150.5"/>';
      [-1, 1].forEach(function (sg) {
        var xx = x(sg * ag).toFixed(1);
        out += '<line class="xp2-obs" x1="' + xx + '" x2="' + xx + '" y1="14" y2="152"/><text class="xp2-lab" x="' + xx + '" y="11" text-anchor="middle">' + (sg < 0 ? '−' : '+') + pts(ag) + '</text>';
      });
      out += '<text class="xp-ax" x="10" y="164">−' + pts(E, 1) + '</text><text class="xp-ax" x="200" y="164" text-anchor="middle">0</text><text class="xp-ax" x="390" y="164" text-anchor="end">+' + pts(E, 1) + '</text>' +
        '<text class="xp-ax" x="200" y="180" text-anchor="middle">' + T('gap, points', 'разрыв, п.') + '</text>';
      svg.innerHTML = out;
      setV(body, 'k', st.k + ' · ' + (gap < 0 ? '−' : '+') + pts(ag) + ' ' + T('pt', 'п.'));
      setV(body, 's', SCN[st.si] + ' · ' + num(n[0]) + ' / ' + num(n[1]));
      setO(body, 'ps', S ? fmtP(ps) : '—');
      setO(body, 'psn', S ? num(cnt) + ' ' + T('of', 'из') + ' ' + num(S) + ' ' + T('samples', 'выборок') : T('no samples yet', 'пока нет выборок'));
      setO(body, 'pf', fmtP(pf));
      setO(body, 'pfz', 'z = ' + z.toFixed(2));
      body.querySelectorAll('.xp-btn[data-a="100"], .xp-btn[data-a="1000"]').forEach(function (b) { b.disabled = S >= MAX; });
      var sig = pf < 0.05, pr = (p * 100).toFixed(3) + ' %';
      body.querySelector('.xp-say').innerHTML = (S ? T('The no-effect world: both groups at one shared rate, <b>' + pr + '</b>. In <b>' + num(cnt) + '</b> of <b>' + num(S) + '</b> simulated samples (<b>' + pct(ps, 1) + '</b>) the gap was at least <b>' + pts(ag) + '</b> points, either way — that share <b>is</b> the p-value. The formula says <b>' + fmtP(pf) + '</b>.',
        'Мир без эффекта: обе группы с одной общей долей, <b>' + pr + '</b>. В <b>' + num(cnt) + '</b> из <b>' + num(S) + '</b> смоделированных выборок (<b>' + pct(ps, 1) + '</b>) разрыв был не меньше <b>' + pts(ag) + '</b> п. в любую сторону — эта доля <b>и есть</b> p-значение. Формула даёт <b>' + fmtP(pf) + '</b>.')
        : T('The no-effect world: both groups at one shared rate, <b>' + pr + '</b>. Draw samples from it and count how often the gap is at least <b>' + pts(ag) + '</b> points, either way.',
          'Мир без эффекта: обе группы с одной общей долей, <b>' + pr + '</b>. Берите из него выборки и считайте, как часто разрыв не меньше <b>' + pts(ag) + '</b> п. в любую сторону.')) + ' ' +
        (sig ? T('At α = 5 % this gap is <b>significant</b>.', 'При α = 5 % этот разрыв <b>значим</b>.')
          : T('At α = 5 % it is <b>not significant</b>: a world with no effect makes gaps this big too often.', 'При α = 5 % он <b>не значим</b>: мир без эффекта слишком часто даёт такие разрывы.'));
      check({ sims: S, psim: S ? ps : 1e9, pf: pf, perr: S ? Math.abs(ps - pf) : 1e9, k: st.k, scale: SC[st.si], gap: ag * 100 },
        { k: st.k !== start.k, s: st.si !== start.si });
    }
    on(body, function (k, v) { st[k === 's' ? 'si' : 'k'] = v; regen(); redraw(); });
    body.querySelectorAll('.xp-btn').forEach(function (b) {
      b.onclick = function () {
        var a = b.getAttribute('data-a');
        if (a === 'reset') { diffs = []; seed++; rnd = rng(seed); }
        else { var c = Math.min(Number(a), MAX - diffs.length); for (var i = 0; i < c; i++) diffs.push(one()); }
        redraw();
      };
    });
    redraw();
    return { redraw: redraw };
  };

  /* ---------- errors: many tests, two worlds, one 2×2 ---------- */
  X.types.errors = function (body, g, check) {
    var s0 = g.start || {}, nA = s0.nA || 2411, nB = s0.nB || 3263, kA = s0.kA || 41, kB = s0.kB || 34;
    var pA = kA / nA, pB = kB / nB, p0 = (kA + kB) / (nA + nB), MAX = 5000;
    var NM = g.names || [T('group 1', 'группа 1'), T('group 2', 'группа 2')];
    var AL = [0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1], WN = g.worlds || [T('No real difference', 'Разницы нет'), T('A real difference', 'Разница есть')];
    var st = { w: 0, ai: near(AL, s0.alpha || 0.05) }, start = { ai: st.ai }, P = [[], []], seed = 2027, rnd = rng(seed);
    body.innerHTML = '<div class="xp2-seg" role="group">' + WN.map(function (w, i) { return '<button type="button" data-w="' + i + '">' + esc(w) + '</button>'; }).join('') + '</div>' +
      '<div class="xp-note xp2-world"></div>' +
      '<div class="xp-ctrl">' + slider(T('α — the false-alarm rate you accept', 'α — доля ложных тревог, на которую вы согласны'), 'a', 0, AL.length - 1, 1, st.ai, '') + '</div>' +
      '<div class="xp-btns">' + btn('1', T('Run 1 test', 'Провести 1 тест')) + btn('100', T('Run 100 tests', 'Провести 100 тестов')) + btn('reset', T('Start again', 'Сначала'), true) + '</div>' +
      '<div class="xp-mini-k">' + T('Each dot is one study on fresh loans (the last 100 in each world)', 'Каждая точка — одно исследование на новых кредитах (последние 100 в каждом мире)') + '</div>' +
      '<svg class="xp2-svg" viewBox="0 0 400 222" role="img"></svg>' +
      legend([['xl2-fa', T('false alarm (type I)', 'ложная тревога (I рода)')], ['xl2-qn', T('correctly quiet', 'верно промолчал')], ['xl2-hit', T('caught', 'поймал')], ['xl2-miss', T('missed (type II)', 'пропустил (II рода)')]]) +
      '<div class="xp2-tab"></div><div class="xp-say"></div>';
    var svg = body.querySelector('svg');
    function test(w) {
      var ka = binom(nA, w ? pA : p0, rnd), kb = binom(nB, w ? pB : p0, rnd), pl = (ka + kb) / (nA + nB);
      var se = Math.sqrt(pl * (1 - pl) * (1 / nA + 1 / nB));
      return se > 0 ? p2((ka / nA - kb / nB) / se) : 1;
    }
    function redraw() {
      var al = AL[st.ai], c = [0, 0], w, i, out = '';
      for (w = 0; w < 2; w++) for (i = 0; i < P[w].length; i++) if (P[w][i] < al) c[w]++;
      var n0 = P[0].length, n1 = P[1].length, fa = c[0], qn = n0 - fa, hit = c[1], miss = n1 - hit;
      for (w = 0; w < 2; w++) {
        var x0 = w ? 206 : 0, last = P[w].slice(-100);
        out += '<rect class="xp2-panel' + (st.w === w ? ' on' : '') + '" x="' + (x0 + 1) + '" y="1" width="192" height="220" rx="12"/>' +
          '<text class="xp2-lab" x="' + (x0 + 97) + '" y="17" text-anchor="middle">' + esc(WN[w]) + '</text>';
        for (i = 0; i < last.length; i++) {
          var cls = last[i] < al ? (w ? 'hit' : 'fa') : (w ? 'miss' : 'qn');
          out += '<circle class="' + cls + '" cx="' + (x0 + 13.5 + (i % 10) * 18.5).toFixed(1) + '" cy="' + (36 + Math.floor(i / 10) * 18.5).toFixed(1) + '" r="6.6"/>';
        }
        if (!last.length) out += '<text class="xp-empty" x="' + (x0 + 97) + '" y="118" text-anchor="middle">' + T('no tests yet', 'тестов пока нет') + '</text>';
      }
      svg.innerHTML = out;
      body.querySelectorAll('.xp2-seg button').forEach(function (b) { var k = Number(b.getAttribute('data-w')); b.classList.toggle('on', k === st.w); b.setAttribute('aria-pressed', k === st.w ? 'true' : 'false'); });
      body.querySelector('.xp2-world').innerHTML = st.w ? T('The truth in this world: ' + esc(NM[0]) + ' <b>' + rate(pA, 2) + '</b>, ' + esc(NM[1]) + ' <b>' + rate(pB, 2) + '</b> — the gap we saw is real (H₀ is false).', 'Правда в этом мире: ' + esc(NM[0]) + ' <b>' + rate(pA, 2) + '</b>, ' + esc(NM[1]) + ' <b>' + rate(pB, 2) + '</b> — увиденный разрыв настоящий (H₀ ложна).')
        : T('The truth in this world: both at <b>' + rate(p0, 2) + '</b> — no difference at all (H₀ is true).', 'Правда в этом мире: у обоих <b>' + rate(p0, 2) + '</b> — разницы нет совсем (H₀ верна).');
      setV(body, 'a', pct(al, 0));
      function cell(cls, k, n, name) { return '<div class="' + cls + '"><b>' + num(k) + '</b> <span>' + (n ? pct(k / n, 1) : '—') + '</span><small>' + name + '</small></div>'; }
      body.querySelector('.xp2-tab').innerHTML = '<div class="xp2-th"></div><div class="xp2-th">' + esc(WN[0]) + '</div><div class="xp2-th">' + esc(WN[1]) + '</div>' +
        '<div class="xp2-rh">' + T('says “different”', 'говорит «разница есть»') + ' <small>p &lt; ' + al.toFixed(2) + '</small></div>' + cell('t-fa', fa, n0, T('false alarm · type I', 'ложная тревога · I рода')) + cell('t-hit', hit, n1, T('caught · power', 'поймал · мощность')) +
        '<div class="xp2-rh">' + T('says “no evidence”', 'говорит «нет доказательств»') + '</div>' + cell('t-qn', qn, n0, T('correct', 'верно')) + cell('t-miss', miss, n1, T('missed · type II', 'пропустил · II рода'));
      var a = pct(al, 0), say = T('α = ' + a + ': a test says “different” when p < ' + al.toFixed(2) + '. ', 'α = ' + a + ': тест говорит «разница есть», когда p < ' + al.toFixed(2) + '. ');
      say += n0 ? T('<b>No real difference</b>: ' + num(fa) + ' of ' + num(n0) + ' tests raised a false alarm (<b>' + pct(fa / n0, 1) + '</b>). ', '<b>Разницы нет</b>: ' + num(fa) + ' из ' + num(n0) + ' тестов подняли ложную тревогу (<b>' + pct(fa / n0, 1) + '</b>). ')
        : T('<b>No real difference</b>: no tests yet. ', '<b>Разницы нет</b>: тестов пока нет. ');
      say += n1 ? T('<b>A real difference</b>: the test caught ' + num(hit) + ' of ' + num(n1) + ' (power <b>' + pct(hit / n1, 0) + '</b>) and missed <b>' + num(miss) + '</b> — type II errors.', '<b>Разница есть</b>: тест поймал ' + num(hit) + ' из ' + num(n1) + ' (мощность <b>' + pct(hit / n1, 0) + '</b>) и пропустил <b>' + num(miss) + '</b> — ошибки II рода.')
        : T('<b>A real difference</b>: no tests yet.', '<b>Разница есть</b>: тестов пока нет.');
      body.querySelector('.xp-say').innerHTML = say;
      body.querySelectorAll('.xp-btn[data-a="1"], .xp-btn[data-a="100"]').forEach(function (b) { b.disabled = P[st.w].length >= MAX; });
      check({ alpha: al, n0: n0, n1: n1, fa: n0 ? fa / n0 : -1, power: n1 ? hit / n1 : -1, miss: n1 ? miss / n1 : -1 }, { alpha: st.ai !== start.ai });
    }
    on(body, function (k, v) { st.ai = v; redraw(); });
    body.querySelectorAll('.xp2-seg button').forEach(function (b) { b.onclick = function () { st.w = Number(b.getAttribute('data-w')); redraw(); }; });
    body.querySelectorAll('.xp-btn').forEach(function (b) {
      b.onclick = function () {
        var a = b.getAttribute('data-a');
        if (a === 'reset') { P = [[], []]; seed++; rnd = rng(seed); }
        else { var c = Math.min(Number(a), MAX - P[st.w].length); for (var i = 0; i < c; i++) P[st.w].push(test(st.w)); }
        redraw();
      };
    });
    redraw();
    return { redraw: redraw };
  };

  /* ---------- power: two worlds, one cut-off ---------- */
  X.types.power = function (body, g, check) {
    var s0 = g.start || {}, p1 = s0.p1 || 0.0128, want = g.power || 0.8, v;
    var NS = [500, 750];
    for (v = 1000; v < 5000; v += 500) NS.push(v);
    for (v = 5000; v < 20000; v += 1000) NS.push(v);
    for (v = 20000; v < 50000; v += 500) NS.push(v);
    for (v = 50000; v < 100000; v += 1000) NS.push(v);
    for (v = 100000; v <= 200000; v += 5000) NS.push(v);
    var P2 = [];
    for (v = 40; v < Math.round(p1 * 10000); v++) P2.push(v / 10000);   // 0.40 % … just under the baseline
    var AL = [0.01, 0.02, 0.05, 0.1];
    var st = { ni: near(NS, s0.n || 2000), pi: near(P2, s0.p2 || 0.01), ai: near(AL, s0.alpha || 0.05) }, start = { ni: st.ni, pi: st.pi, ai: st.ai };
    body.innerHTML = '<div class="xp-ctrl">' +
      slider(T('Loans per arm (n)', 'Кредитов в каждой группе (n)'), 'ni', 0, NS.length - 1, 1, st.ni, '') +
      slider(fmtText(g.p2Label || T('True rate in the treated arm', 'Истинная доля в группе с изменением')), 'pi', 0, P2.length - 1, 1, st.pi, '') +
      slider(T('α (two-sided)', 'α (двусторонний)'), 'ai', 0, AL.length - 1, 1, st.ai, '') + '</div>' +
      '<div class="xp-big"><span class="xp-big-k">' + T('Power — the chance the test sees the effect', 'Мощность — шанс, что тест увидит эффект') + '</span><span class="xp-big-v"></span></div>' +
      '<div class="xp-mini-k">' + fmtText(g.axisLabel || T('How much lower the treated arm comes out, points — one curve per world', 'Насколько ниже выходит группа с изменением, п. — по кривой на каждый мир')) + '</div>' +
      '<svg class="xp2-svg" viewBox="0 0 400 186" role="img"></svg>' +
      legend([['xl2-h0', T('no effect (H₀)', 'эффекта нет (H₀)')], ['xl2-al', T('false alarm: α', 'ложная тревога: α')], ['xl2-h1', T('the effect is real (H₁)', 'эффект есть (H₁)')], ['xl2-pw', T('seen: power', 'увиден: мощность')]]) +
      '<div class="xp-stats"></div><div class="xp-say"></div>';
    var svg = body.querySelector('svg');
    function redraw() {
      var n = NS[st.ni], q = P2[st.pi], al = AL[st.ai], h = Math.abs(2 * Math.asin(Math.sqrt(p1)) - 2 * Math.asin(Math.sqrt(q)));
      var za = zq(1 - al / 2), zp = zq(want), lam = h * Math.sqrt(n / 2), pow = Phi(lam - za) + Phi(-lam - za);
      var need = Math.ceil(2 * Math.pow((za + zp) / h, 2));
      /* the picture, on the points scale: Cohen's h × √(p̄(1 − p̄)) is the gap in points, so the shaded areas are the
         lesson's power and α exactly */
      var pb = (p1 + q) / 2, kk = Math.sqrt(pb * (1 - pb)) * 100, sd = Math.sqrt(2 / n) * kk, mu = h * kk, cut = za * sd;
      var lo = -0.7, hi = 1.3, B = 152, H = 118, out = '', i;
      function x(t) { return 10 + (t - lo) / (hi - lo) * 380; }
      function y(t, c) { return B - H * Math.exp(-0.5 * Math.pow((t - c) / sd, 2)); }
      function curve(c) { var s = ''; for (i = 0; i <= 160; i++) { var t = lo + (hi - lo) * i / 160; s += (i ? 'L' : 'M') + x(t).toFixed(1) + ' ' + y(t, c).toFixed(1); } return s; }
      function area(c, a, b) {   // the curve between a and b, closed down to the axis
        a = Math.max(lo, a); b = Math.min(hi, b);
        if (b <= a) return '';
        var s = 'M' + x(a).toFixed(1) + ' ' + B;
        for (i = 0; i <= 60; i++) { var t = a + (b - a) * i / 60; s += 'L' + x(t).toFixed(1) + ' ' + y(t, c).toFixed(1); }
        return s + 'L' + x(b).toFixed(1) + ' ' + B + 'Z';
      }
      out += '<path class="xp2-pw" d="' + area(mu, cut, hi) + area(mu, lo, -cut) + '"/>' +
        '<path class="xp2-al" d="' + area(0, cut, hi) + area(0, lo, -cut) + '"/>' +
        '<path class="xp2-h0" d="' + curve(0) + '"/><path class="xp2-h1" d="' + curve(mu) + '"/>';
      [cut, -cut].forEach(function (c, k) {
        if (c > lo && c < hi) out += '<line class="xp2-cut" x1="' + x(c).toFixed(1) + '" x2="' + x(c).toFixed(1) + '" y1="22" y2="' + B + '"/>' +
          (k ? '' : '<text class="xp2-lab xp2-cutl" x="' + (x(c) + 3).toFixed(1) + '" y="20">' + T('cut-off', 'порог') + '</text>');
      });
      out += '<text class="xp2-lab" x="' + (x(0) - 4).toFixed(1) + '" y="' + (B - H - 6) + '" text-anchor="end">H₀</text>' +
        '<text class="xp2-lab xp2-h1l" x="' + (x(mu) + 4).toFixed(1) + '" y="' + (B - H - 6) + '">H₁</text>' +
        '<line class="xp2-axis" x1="10" x2="390" y1="' + (B + 0.5) + '" y2="' + (B + 0.5) + '"/>';
      [-0.5, 0, 0.5, 1].forEach(function (t) { out += '<text class="xp-ax" x="' + x(t).toFixed(1) + '" y="' + (B + 13) + '" text-anchor="middle">' + (t > 0 ? '+' : t < 0 ? '−' : '') + Math.abs(t).toFixed(1) + '</text>'; });
      out += '<text class="xp-ax" x="390" y="' + (B + 28) + '" text-anchor="end">' + T('points', 'п.') + '</text>';
      svg.innerHTML = out;
      setV(body, 'ni', num(n));
      setV(body, 'pi', rate(q, 2) + ' <small>(−' + pts(p1 - q) + ')</small>');
      setV(body, 'ai', pct(al, 0));
      body.querySelector('.xp-big-v').textContent = rate(pow, 1);
      body.querySelector('.xp-stats').innerHTML = '<span>' + T(pct(want, 0) + ' power needs', 'Для мощности ' + pct(want, 0) + ' нужно') + ' <b>' + num(need) + '</b> ' + T('per arm', 'на группу') + '</span>' +
        '<span>' + T("Cohen's h", 'h Коэна') + ' <b>' + h.toFixed(4) + '</b></span>';
      var hit = Math.round(pow * 100);
      body.querySelector('.xp-say').innerHTML = T('With <b>' + num(n) + '</b> loans per arm, if the change really moves the rate from <b>' + rate(p1, 2) + '</b> to <b>' + rate(q, 2) + '</b>, the test notices it about <b>' + hit + '</b> ' + (hit === 1 ? 'time' : 'times') + ' in 100 (power <b>' + pct(pow, 1) + '</b>) and misses it ' + (100 - hit) + ' ' + (100 - hit === 1 ? 'time' : 'times') + '. ' +
        (n >= need ? 'That clears the ' + pct(want, 0) + ' plan: <b>' + num(need) + '</b> per arm would do.' : 'For ' + pct(want, 0) + ' it needs <b>' + num(need) + '</b> loans per arm — ' + (need / n).toFixed(1) + ' times as many.'),
        'При <b>' + num(n) + '</b> кредитах в каждой группе, если изменение правда сдвигает долю с <b>' + rate(p1, 2) + '</b> до <b>' + rate(q, 2) + '</b>, тест замечает это примерно <b>' + hit + '</b> ' + ruPl(hit, 'раз', 'раза', 'раз') + ' из 100 (мощность <b>' + pct(pow, 1) + '</b>) и пропускает ' + (100 - hit) + ' ' + ruPl(100 - hit, 'раз', 'раза', 'раз') + '. ' +
        (n >= need ? 'Это выше плана ' + pct(want, 0) + ': хватило бы <b>' + num(need) + '</b> на группу.' : 'Для ' + pct(want, 0) + ' нужно <b>' + num(need) + '</b> кредитов на группу — в ' + (need / n).toFixed(1) + ' раза больше.'));
      check({ n: n, p2: q, alpha: al, power: pow, need: need }, { n: st.ni !== start.ni, p2: st.pi !== start.pi, alpha: st.ai !== start.ai });
    }
    on(body, function (k, v) { st[k] = v; redraw(); });
    redraw();
    return { redraw: redraw };
  };

  /* ---------- peeking: the same experiments, read once or every month ---------- */
  X.types.peeking = function (body, g, check) {
    var s0 = g.start || {}, p = s0.p || 947 / 7099, per = s0.perMonth || 150, M = s0.months || 12, MAX = 5000, SHOW = 24;
    var LK = [1, 2, 3, 4, 6, 12].filter(function (l) { return M % l === 0; }), zc = zq(0.975);
    var st = { li: Math.max(0, LK.indexOf(s0.looks || M)) }, start = { li: st.li }, Z = [], seed = 2028, rnd = rng(seed);
    body.innerHTML = '<div class="xp-ctrl">' + slider(T('How often the peeker looks', 'Как часто подглядывают'), 'li', 0, LK.length - 1, 1, st.li, '') + '</div>' +
      '<div class="xp2-duo"><div><span>' + T('Read once, at the end', 'Один взгляд, в конце') + '</span><b data-o="once"></b><i data-o="oncen"></i></div>' +
      '<div class="xp2-hot"><span data-o="pkk"></span><b data-o="peek"></b><i data-o="peekn"></i></div></div>' +
      '<div class="xp-btns">' + btn('1', T('Run 1 experiment', 'Провести 1 эксперимент')) + btn('100', T('Run 100 experiments', 'Провести 100 экспериментов')) + btn('reset', T('Start again', 'Сначала'), true) + '</div>' +
      '<div class="xp-mini-k">' + T('Each line is one experiment’s z, month by month (the last ' + SHOW + '); grey lines mark the looks', 'Каждая линия — z одного эксперимента, месяц за месяцем (последние ' + SHOW + '); серые линии — взгляды') + '</div>' +
      '<svg class="xp2-svg" viewBox="0 0 400 214" role="img"></svg>' +
      legend([['xl2-zone', T('p < 0.05 zone', 'зона p < 0.05')], ['xl2-win', T('the peeker stops: a false win', 'остановка: ложная победа')], ['xl2-end', T('a false win even when read once', 'ложная победа и при одном взгляде')]]) +
      '<div class="xp-say"></div>';
    var svg = body.querySelector('svg');
    function one() {
      var ka = 0, kb = 0, z = [];
      for (var m = 0; m < M; m++) {
        ka += binom(per, p, rnd); kb += binom(per, p, rnd);
        var n = per * (m + 1), pl = (ka + kb) / (2 * n), se = Math.sqrt(pl * (1 - pl) * 2 / n);
        z.push(se > 0 ? (ka - kb) / n / se : 0);
      }
      return z;
    }
    function lookName(L) {
      var step = M / L;
      if (L === 1) return T('once, at month ' + M, 'один раз, в месяц ' + M);
      if (L === 2) return T('at months ' + step + ' and ' + M + ' (2 looks)', 'в месяцы ' + step + ' и ' + M + ' (2 взгляда)');
      if (step === 1) return T('every month (' + L + ' looks)', 'каждый месяц (' + L + ' ' + ruPl(L, 'взгляд', 'взгляда', 'взглядов') + ')');
      return T('every ' + step + ' months (' + L + ' looks)', 'каждые ' + step + ' ' + ruPl(step, 'месяц', 'месяца', 'месяцев') + ' (' + L + ' ' + ruPl(L, 'взгляд', 'взгляда', 'взглядов') + ')');
    }
    function redraw() {
      var L = LK[st.li], step = M / L, R = Z.length, once = 0, pk = 0, stops = [], i, m;
      var stopAt = Z.map(function (z) {
        for (var mm = step - 1; mm < M; mm += step) if (Math.abs(z[mm]) > zc) return mm;
        return -1;
      });
      for (i = 0; i < R; i++) { if (Math.abs(Z[i][M - 1]) > zc) once++; if (stopAt[i] >= 0) { pk++; stops.push(stopAt[i] + 1); } }
      stops.sort(function (a, b) { return a - b; });
      function x(mm) { return 34 + mm * (352 / (M - 1)); }
      function y(z) { return 104 - Math.max(-4, Math.min(4, z)) * 22; }
      var out = '<rect class="xp2-zone" x="34" y="' + y(4) + '" width="352" height="' + (y(zc) - y(4)).toFixed(1) + '"/>' +
        '<rect class="xp2-zone" x="34" y="' + y(-zc).toFixed(1) + '" width="352" height="' + (y(-4) - y(-zc)).toFixed(1) + '"/>' +
        '<line class="xp2-axis" x1="34" x2="386" y1="' + y(0) + '" y2="' + y(0) + '"/>';
      for (m = step - 1; m < M; m += step) out += '<line class="xp2-look" x1="' + x(m).toFixed(1) + '" x2="' + x(m).toFixed(1) + '" y1="' + y(4) + '" y2="' + y(-4) + '"/>';
      var from = Math.max(0, R - SHOW), wins = '';
      for (i = from; i < R; i++) {
        var z = Z[i], d = '';
        for (m = 0; m < M; m++) d += (m ? 'L' : 'M') + x(m).toFixed(1) + ' ' + y(z[m]).toFixed(1);
        out += '<path class="xp2-path" d="' + d + '"/>';
        if (stopAt[i] >= 0) {
          var dw = '';
          for (m = 0; m <= stopAt[i]; m++) dw += (m ? 'L' : 'M') + x(m).toFixed(1) + ' ' + y(z[m]).toFixed(1);
          wins += '<path class="xp2-wpath" d="' + dw + '"/><circle class="xp2-wdot" cx="' + x(stopAt[i]).toFixed(1) + '" cy="' + y(z[stopAt[i]]).toFixed(1) + '" r="4"/>';
        }
        if (Math.abs(z[M - 1]) > zc) wins += '<circle class="xp2-edot" cx="' + x(M - 1).toFixed(1) + '" cy="' + y(z[M - 1]).toFixed(1) + '" r="6.5"/>';
      }
      out += wins + '<text class="xp2-lab xp2-zl" x="38" y="' + (y(4) + 12) + '">p &lt; 0.05</text><text class="xp2-lab xp2-zl" x="38" y="' + (y(-4) - 5) + '">p &lt; 0.05</text>';
      [1, 3, 6, 9, 12].forEach(function (mm) { if (mm <= M) out += '<text class="xp-ax" x="' + x(mm - 1).toFixed(1) + '" y="200" text-anchor="middle">' + mm + '</text>'; });
      out += '<text class="xp-ax" x="210" y="212" text-anchor="middle">' + T('month', 'месяц') + '</text><text class="xp-ax" x="28" y="' + (y(0) + 3) + '" text-anchor="end">0</text>';
      if (!R) out += '<text class="xp-empty" x="210" y="' + (y(0) - 10) + '" text-anchor="middle">' + T('Press “Run” to start experiments', 'Нажмите «Провести», чтобы начать эксперименты') + '</text>';
      svg.innerHTML = out;
      setV(body, 'li', L + ' ' + T(L === 1 ? 'look' : 'looks', ruPl(L, 'взгляд', 'взгляда', 'взглядов')));
      setO(body, 'once', R ? pct(once / R, 1) : '—');
      setO(body, 'oncen', R ? T(num(once) + ' false wins of ' + num(R), 'ложные победы: ' + num(once) + ' из ' + num(R)) : T('no experiments yet', 'пока нет экспериментов'));
      setO(body, 'pkk', T('Peeking', 'Подглядывание') + ': ' + lookName(L));
      setO(body, 'peek', R ? pct(pk / R, 1) : '—');
      setO(body, 'peekn', R ? T(num(pk) + ' false wins of ' + num(R), 'ложные победы: ' + num(pk) + ' из ' + num(R)) : T('no experiments yet', 'пока нет экспериментов'));
      body.querySelectorAll('.xp-btn[data-a="1"], .xp-btn[data-a="100"]').forEach(function (b) { b.disabled = R >= MAX; });
      var med = stops.length ? stops[Math.floor((stops.length - 1) / 2)] : 0;
      body.querySelector('.xp-say').innerHTML = R ? T('Nothing works here: both arms <b>' + rate(p, 2) + '</b> late, <b>' + per + '</b> loans per arm a month. Of <b>' + num(R) + '</b> experiments, reading once at month ' + M + ' crowns a false winner <b>' + num(once) + '</b> ' + (once === 1 ? 'time' : 'times') + ' (<b>' + pct(once / R, 1) + '</b>); looking ' + lookName(L) + ' and stopping at the first p < 0.05 crowns <b>' + num(pk) + '</b> (<b>' + pct(pk / R, 1) + '</b>)' + (pk && L > 1 ? ', half of them by month <b>' + med + '</b>.' : '.'),
        'Здесь ничего не работает: в обеих группах <b>' + rate(p, 2) + '</b> просрочек, по <b>' + per + '</b> кредитов в группе в месяц. Из <b>' + num(R) + '</b> экспериментов один взгляд в месяц ' + M + ' объявляет ложного победителя <b>' + num(once) + '</b> ' + ruPl(once, 'раз', 'раза', 'раз') + ' (<b>' + pct(once / R, 1) + '</b>); взгляд ' + lookName(L) + ' с остановкой на первом p < 0.05 — <b>' + num(pk) + '</b> ' + ruPl(pk, 'раз', 'раза', 'раз') + ' (<b>' + pct(pk / R, 1) + '</b>)' + (pk && L > 1 ? ', половина из них — к месяцу <b>' + med + '</b>.' : '.'))
        : T('Nothing works here: both arms <b>' + rate(p, 2) + '</b> late, <b>' + per + '</b> loans per arm a month, ' + M + ' months. Run experiments and count the “winners”.', 'Здесь ничего не работает: в обеих группах <b>' + rate(p, 2) + '</b> просрочек, по <b>' + per + '</b> кредитов в группе в месяц, ' + M + ' месяцев. Проводите эксперименты и считайте «победителей».');
      check({ runs: R, once: R ? once / R : -1, peek: R ? pk / R : -1, looks: L }, { looks: st.li !== start.li });
    }
    on(body, function (k, v) { st.li = v; redraw(); });
    body.querySelectorAll('.xp-btn').forEach(function (b) {
      b.onclick = function () {
        var a = b.getAttribute('data-a');
        if (a === 'reset') { Z = []; seed++; rnd = rng(seed); }
        else { var c = Math.min(Number(a), MAX - Z.length); for (var i = 0; i < c; i++) Z.push(one()); }
        redraw();
      };
    });
    redraw();
    return { redraw: redraw };
  };

  /* ---------- abplan: users per arm and days, live ---------- */
  X.types.abplan = function (body, g, check) {
    var s0 = g.start || {}, al = g.alpha || 0.05, pw = g.power || 0.8, i;
    var BS = [], MD = [], TR = [], SP = [0.1, 0.2, 0.3, 0.4, 0.5];
    for (i = 4; i <= 40; i++) BS.push(i / 200);      // 2.0 % … 20.0 %
    for (i = 4; i <= 60; i++) MD.push(i / 2000);     // +0.20 … +3.00 points
    for (i = 2; i <= 50; i++) TR.push(i * 100);      // 200 … 5 000 a day
    var st = { bi: near(BS, s0.base || 0.08), mi: near(MD, s0.mde || 0.009), ti: near(TR, s0.traffic || 1000), si: near(SP, s0.split || 0.5) };
    var start = { bi: st.bi, mi: st.mi, ti: st.ti, si: st.si };
    body.innerHTML = '<div class="xp-ctrl">' +
      slider(T('Today’s conversion (baseline)', 'Конверсия сейчас (базовая)'), 'bi', 0, BS.length - 1, 1, st.bi, '') +
      slider(T('Smallest lift worth finding (MDE)', 'Наименьший прирост, ради которого стоит (MDE)'), 'mi', 0, MD.length - 1, 1, st.mi, '') +
      slider(fmtText(g.trafficLabel || T('Users a day', 'Пользователей в день')), 'ti', 0, TR.length - 1, 1, st.ti, '') +
      slider(T('Share who see the new version (B)', 'Доля, которая видит новую версию (B)'), 'si', 0, SP.length - 1, 1, st.si, '') + '</div>' +
      '<div class="xp-big"><span class="xp-big-k">' + T('The test needs', 'Тесту нужно') + ' <small>(α ' + pct(al, 0) + ', ' + T('power', 'мощность') + ' ' + pct(pw, 0) + ')</small></span><span class="xp-big-v"></span></div>' +
      '<div class="xp-mini-k">' + T('Each square is a week of traffic; two rows are half a year', 'Каждый квадрат — неделя трафика; два ряда — полгода') + '</div>' +
      '<svg class="xp2-svg xp2-weeks" viewBox="0 0 400 66" role="img"></svg><div class="xp-note xp2-more"></div>' +
      '<div class="xp-stats"></div><div class="xp-say"></div>';
    var svg = body.querySelector('svg');
    function fp(x) { return pts(x).replace(/(\.\d)0$/, '$1'); }   // +0.9, +0.45, +1.35
    function redraw() {
      var b = BS[st.bi], m = MD[st.mi], tr = TR[st.ti], r = SP[st.si];
      var h = Math.abs(2 * Math.asin(Math.sqrt(b + m)) - 2 * Math.asin(Math.sqrt(b))), zs = zq(1 - al / 2) + zq(pw);
      var tot0 = 2 * Math.pow(zs / h, 2) / (2 * r * (1 - r)), nB = Math.ceil(tot0 * r), nA = Math.ceil(tot0 * (1 - r)), tot = nA + nB;
      var dx = tot / tr, days = Math.max(1, Math.round(dx)), weeks = Math.ceil(dx / 7), full = Math.floor(dx / 7), frac = dx / 7 - full, out = '', k;
      for (k = 0; k < 26; k++) {
        var cx = (6 + (k % 13) * 29.8).toFixed(1), cy = 3 + Math.floor(k / 13) * 31;
        out += '<rect class="xp2-wk" x="' + cx + '" y="' + cy + '" width="26.5" height="26.5" rx="5"/>';
        if (k < full) out += '<rect class="xp2-wk on" x="' + cx + '" y="' + cy + '" width="26.5" height="26.5" rx="5"/>';
        else if (k === full && frac > 0.001) out += '<rect class="xp2-wk on" x="' + cx + '" y="' + cy + '" width="' + Math.max(3, 26.5 * frac).toFixed(1) + '" height="26.5" rx="5"/>';
      }
      svg.innerHTML = out;
      setV(body, 'bi', rate(b, 1));
      setV(body, 'mi', '+' + fp(m) + ' ' + T('pt', 'п.'));
      setV(body, 'ti', num(tr));
      setV(body, 'si', pct(r, 0) + ' · ' + Math.round((1 - r) * 100) + ' / ' + Math.round(r * 100));
      body.querySelector('.xp-big-v').textContent = num(days) + ' ' + T(days === 1 ? 'day' : 'days', ruPl(days, 'день', 'дня', 'дней'));
      var notes = [];
      if (weeks > 26) notes.push(T('+ ' + (weeks - 26) + ' more weeks beyond the picture.', '+ ещё ' + (weeks - 26) + ' нед. за пределами картинки.'));
      if (dx >= 150) notes.push(T('Five months or more: not feasible — change the metric or the MDE, not the arithmetic.', 'Пять месяцев и больше: невыполнимо — меняйте метрику или MDE, а не арифметику.'));
      if (weeks < 2) notes.push(T('Still run at least two whole weeks.', 'Всё равно запускайте минимум на две полные недели.'));
      body.querySelector('.xp2-more').textContent = notes.join(' ');
      body.querySelector('.xp-stats').innerHTML = '<span>A <b>' + num(nA) + '</b></span><span>B <b>' + num(nB) + '</b></span><span>' + T('in all', 'всего') + ' <b>' + num(tot) + '</b></span>' +
        '<span>' + T('relative lift', 'относительный прирост') + ' <b>+' + (m / b * 100).toFixed(1) + ' %</b></span>';
      var arms = r === 0.5 ? T('each arm needs <b>' + num(nA) + '</b> users', 'каждой группе нужно <b>' + num(nA) + '</b> ' + ruPl(nA, 'пользователь', 'пользователя', 'пользователей'))
        : T('the new version (B) needs <b>' + num(nB) + '</b> users and A <b>' + num(nA) + '</b>', 'новой версии (B) нужно <b>' + num(nB) + '</b> ' + ruPl(nB, 'пользователь', 'пользователя', 'пользователей') + ', а A — <b>' + num(nA) + '</b>');
      body.querySelector('.xp-say').innerHTML = T('To see <b>' + rate(b, 1) + ' → ' + rate2(b + m) + '</b> (+' + fp(m) + ' points, +' + (m / b * 100).toFixed(1) + ' % relative), ' + arms + ' — <b>' + num(tot) + '</b> in all. At <b>' + num(tr) + '</b> a day that is <b>' + num(days) + '</b> ' + (days === 1 ? 'day' : 'days') + ' of traffic; in whole weeks, <b>' + weeks + '</b> (' + weeks * 7 + ' days).',
        'Чтобы увидеть <b>' + rate(b, 1) + ' → ' + rate2(b + m) + '</b> (+' + fp(m) + ' п., +' + (m / b * 100).toFixed(1) + ' % относительно), ' + arms + ' — всего <b>' + num(tot) + '</b>. При <b>' + num(tr) + '</b> в день это <b>' + num(days) + '</b> ' + ruPl(days, 'день', 'дня', 'дней') + ' трафика; в полных неделях — <b>' + weeks + '</b> (' + weeks * 7 + ' дн.).');
      check({ base: b, mde: m, traffic: tr, split: r, days: days, weeks: weeks, total: tot },
        { base: st.bi !== start.bi, mde: st.mi !== start.mi, traffic: st.ti !== start.ti, split: st.si !== start.si });
    }
    on(body, function (k, v) { st[k] = v; redraw(); });
    redraw();
    return { redraw: redraw };
  };

  /* ---------- srm: is this split chance? ---------- */
  X.types.srm = function (body, g, check) {
    var s0 = g.start || {}, alarm = g.alarm || 0.001, za = zq(1 - alarm / 2), z95 = zq(0.975), i;
    var pre = g.presets || [], a0 = s0.a || 13545, b0 = s0.b || 13829;
    var NS = [100, 200, 300, 400, 500, 750, 1000, 1500, 2000, 3000, 5000, 7500, 10000, 15000, 20000, 30000, 40000, 50000, 75000, 100000, 125000, 150000, 200000, 300000, 500000, 1000000];
    [a0 + b0].concat(pre.map(function (q) { return q.a + q.b; })).forEach(function (n) { if (NS.indexOf(n) < 0) NS.push(n); });
    NS.sort(function (x, y) { return x - y; });
    var SH = [];
    for (i = 400; i <= 650; i++) SH.push(i / 1000);   // B's share 40.0 % … 65.0 %
    var st = { a: a0, b: b0, sh: b0 / (a0 + b0) };
    st.ni = NS.indexOf(a0 + b0); st.si = near(SH, st.sh);
    var start = { N: a0 + b0, share: st.sh };
    body.innerHTML = (pre.length ? '<div class="xp-btns xp2-pre">' + pre.map(function (q, k) { return '<button type="button" class="xp-btn xp-ghost" data-p="' + k + '">' + esc(q.label) + ' <small>' + num(q.a) + ' / ' + num(q.b) + '</small></button>'; }).join('') + '</div>' : '') +
      '<div class="xp-ctrl">' + slider(T('Users in the test', 'Пользователей в тесте'), 'ni', 0, NS.length - 1, 1, st.ni, '') +
      slider(T('Share of them in B (planned: 50 %)', 'Доля в B (по плану: 50 %)'), 'si', 0, SH.length - 1, 1, st.si, '') + '</div>' +
      '<div class="xp-big"><span class="xp-big-k">' + T('SRM p-value', 'p-значение SRM') + ' <span class="xp2-chip"></span></span><span class="xp-big-v"></span></div>' +
      '<svg class="xp2-svg" viewBox="0 0 400 112" role="img"></svg>' +
      legend([['xl2-b95', T('95 % of chance splits', '95 % случайных разбиений')], ['xl2-b999', T('99.9 % — beyond it, the alarm', '99.9 % — за ними тревога')]]) +
      '<div class="xp-say"></div>';
    var svg = body.querySelector('svg');
    function counts() { var N = NS[st.ni]; st.b = Math.round(N * st.sh); st.a = N - st.b; }
    function redraw() {
      var a = st.a, b = st.b, N = a + b, sh = b / N, half = N / 2, chi = ((a - half) * (a - half) + (b - half) * (b - half)) / half;
      var p = erfc(Math.sqrt(chi / 2)), dev = Math.abs(b - a) / (2 * N), w95 = z95 * 0.5 / Math.sqrt(N), w999 = za * 0.5 / Math.sqrt(N);
      var lo = 0.38, hi = 0.62, out = '';
      function x(s) { return 10 + (s - lo) / (hi - lo) * 380; }
      var xa = 10 + 380 * a / N;
      out += '<rect class="xp2-ra" x="10" y="6" width="' + (xa - 10).toFixed(1) + '" height="24"/><rect class="xp2-rb" x="' + xa.toFixed(1) + '" y="6" width="' + (390 - xa).toFixed(1) + '" height="24"/>' +
        '<line class="xp2-mid" x1="200" x2="200" y1="2" y2="34"/>' +
        '<text class="xp2-in" x="16" y="22">A ' + num(a) + '</text><text class="xp2-in" x="384" y="22" text-anchor="end">B ' + num(b) + '</text>' +
        '<text class="xp-ax" x="200" y="48" text-anchor="middle">' + T('zoomed in: B’s share, 38 – 62 %', 'крупнее: доля B, 38 – 62 %') + '</text>';
      var c1 = Math.max(lo, 0.5 - w999), c2 = Math.min(hi, 0.5 + w999), d1 = Math.max(lo, 0.5 - w95), d2 = Math.min(hi, 0.5 + w95);
      out += '<rect class="xp2-b999" x="' + x(c1).toFixed(1) + '" y="56" width="' + (x(c2) - x(c1)).toFixed(1) + '" height="26"/>' +
        '<rect class="xp2-b95" x="' + x(d1).toFixed(1) + '" y="56" width="' + (x(d2) - x(d1)).toFixed(1) + '" height="26"/>' +
        '<line class="xp2-axis" x1="10" x2="390" y1="82.5" y2="82.5"/>';
      [0.4, 0.45, 0.5, 0.55, 0.6].forEach(function (s) { out += '<line class="xp2-tick" x1="' + x(s) + '" x2="' + x(s) + '" y1="82" y2="86"/><text class="xp-ax" x="' + x(s) + '" y="97" text-anchor="middle">' + Math.round(s * 100) + ' %</text>'; });
      var cls = p < alarm ? 'bad' : p < 0.05 ? 'warn' : 'ok', xs = x(Math.max(lo, Math.min(hi, sh)));
      out += '<line class="xp2-mk ' + cls + '" x1="' + xs.toFixed(1) + '" x2="' + xs.toFixed(1) + '" y1="52" y2="86"/><circle class="xp2-mkd ' + cls + '" cx="' + xs.toFixed(1) + '" cy="69" r="5"/>';
      if (sh > hi || sh < lo) out += '<text class="xp2-lab" x="' + (sh > hi ? 386 : 14) + '" y="109" text-anchor="' + (sh > hi ? 'end' : 'start') + '">' + (sh > hi ? pct(sh, 1) + ' →' : '← ' + pct(sh, 1)) + '</text>';
      svg.innerHTML = out;
      setV(body, 'ni', num(N));
      setV(body, 'si', rate(sh, 1));
      body.querySelector('.xp-big-v').textContent = fmtP(p);
      var chip = body.querySelector('.xp2-chip');
      chip.className = 'xp2-chip ' + cls;
      chip.textContent = cls === 'bad' ? T('alarm', 'тревога') : cls === 'warn' ? T('suspicious', 'подозрительно') : T('within chance', 'в пределах случайности');
      var nstar = dev > 1e-9 ? za * za / (4 * dev * dev) : 0;
      if (nstar) { var mag = Math.pow(10, Math.max(0, Math.floor(Math.log(nstar) / Math.LN10) - 2)); nstar = Math.round(nstar / mag) * mag; }   // "about": 3 digits
      var verdict = cls === 'bad' ? T('The alarm fires: find the bug before reading any result.', 'Тревога: найдите ошибку, прежде чем читать результат.')
        : cls === 'warn' ? T('Not the automatic alarm, but far enough from 50 / 50 to look for the bug yourself.', 'Это ещё не автоматическая тревога, но достаточно далеко от 50 / 50, чтобы поискать ошибку самой.')
          : T('Within chance.', 'В пределах случайности.');
      var more = !nstar ? '' : N >= nstar ? T(' This split trips the alarm from about <b>' + num(nstar) + '</b> users, and the test has more.', ' Такой перекос включает тревогу примерно с <b>' + num(nstar) + '</b> пользователей, а в тесте больше.')
        : T(' The same split would trip the alarm from about <b>' + num(nstar) + '</b> users.', ' Тот же перекос включил бы тревогу примерно с <b>' + num(nstar) + '</b> пользователей.');
      body.querySelector('.xp-say').innerHTML = T('<b>' + num(N) + '</b> users, <b>' + num(b) + '</b> of them in B: <b>' + rate(sh, 2) + '</b>. With nothing broken, 95 % of tests this size put B between <b>' + rate(0.5 - w95, 2) + '</b> and <b>' + rate(0.5 + w95, 2) + '</b>, and 99.9 % between ' + rate(0.5 - w999, 2) + ' and ' + rate(0.5 + w999, 2) + '. χ² = ' + chi.toFixed(2) + ', p = <b>' + fmtP(p) + '</b>. ',
        '<b>' + num(N) + '</b> ' + ruPl(N, 'пользователь', 'пользователя', 'пользователей') + ', из них в B <b>' + num(b) + '</b>: <b>' + rate(sh, 2) + '</b>. Если ничего не сломано, в 95 % тестов такого размера доля B между <b>' + rate(0.5 - w95, 2) + '</b> и <b>' + rate(0.5 + w95, 2) + '</b>, в 99.9 % — между ' + rate(0.5 - w999, 2) + ' и ' + rate(0.5 + w999, 2) + '. χ² = ' + chi.toFixed(2) + ', p = <b>' + fmtP(p) + '</b>. ') + verdict + more;
      check({ N: N, share: sh, dev: dev, p: p }, { N: N !== start.N, share: Math.abs(sh - start.share) > 1e-9 });
    }
    on(body, function (k, v) { st[k] = v; if (k === 'si') st.sh = SH[v]; counts(); redraw(); });
    body.querySelectorAll('.xp2-pre button').forEach(function (b) {
      b.onclick = function () {
        var q = pre[Number(b.getAttribute('data-p'))];
        st.a = q.a; st.b = q.b; st.sh = q.b / (q.a + q.b); st.ni = NS.indexOf(q.a + q.b); st.si = near(SH, st.sh);
        body.querySelector('input[data-k="ni"]').value = st.ni; body.querySelector('input[data-k="si"]').value = st.si;
        redraw();
      };
    });
    redraw();
    return { redraw: redraw };
  };
})();
