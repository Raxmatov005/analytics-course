/* Week 9 explorer types (credit-risk scorecards), added to explore.js's registry (window.ALExplore.types).
Loaded right after explore.js; see explore.js's header for the block format and the challenge rules. Each type draws
its playground into `body`, reports its numbers to check(vals, changed) and returns {redraw}.

  roc    — W9D3. The scored loans as two score distributions (bads, goods), a cut-off "approve score >= c, decline
           below", the 2x2 at that cut-off, the ROC curve with its point and the KS gap, the area on demand.
           Data: "from" (the lowest score), "n" (loans per score from there) and "b" (bads per score).
           Models: our score; a coin toss (the bads spread exactly like everyone); a perfect score (every bad below
           every good). numbers: cut, tpr, fpr, ks (the gap at this cut-off), auc, gini, model (0 / 1 / 2), area (0 / 1).
  cutoff — W9D4. The same loans; approve score >= c gives the approval rate, the bad rate, bads avoided, goods turned
           away, the expected loss per approved loan and the profit with W8D2's unit economics: "econ" {interest,
           cof (at 18 %), opex, ead, lgd} prices every loan like an average Consumer loan; "funds" are the funding
           rates to pick from. A good loan earns interest − cof − opex; a bad one costs lgd × ead + cof + opex.
           numbers: cut, fund, approve, br, avoided, lost, el, profit, gapBest (soum below the top of this curve).
  psi    — W9D4. Applicants' score shares in six bands: the base year ("base": counts per score from "from") against a
           chosen population ("pops": [{key, label, counts}]), every score moved by s points and stretched around its
           mean by k. numbers: pre (the population's key), shift, spread, psi, mean; "only" keys: pre, shift, spread.
Every number on screen is computed from the block's own counts; nothing is random. */
(function () {
  var X = window.ALExplore;
  if (!X) return;
  var T = X.T, esc = X.esc, num = X.num, slider = X.slider;

  /* ---------- shared ---------- */
  function nb(s) { return String(s).replace(/ /g, ' '); }             // "7 615" and "2.9 %" stay on one line
  function p1(x, dp) { return nb((x * 100).toFixed(dp == null ? 1 : dp) + ' %'); }
  function n0(x) { return nb(num(x)); }
  function bn(x) { return nb((x / 1e9).toFixed(2) + T(' bn', ' млрд')); }
  function mln(x) { return nb((x / 1e6).toFixed(Math.abs(x) < 1e7 ? 2 : 1) + T(' m', ' млн')); }
  function seg(key, label, opts, cur) {   // a row of pill buttons, one of them on (explore.js's .xp-tg look)
    return '<div class="xp-tg" data-g="' + key + '"><span class="xp-tg-l">' + label + '</span>' + opts.map(function (o) {
      var on = String(o[0]) === String(cur);
      return '<button type="button" data-o="' + esc(o[0]) + '" aria-pressed="' + on + '"' + (on ? ' class="on"' : '') + '>' + o[1] + '</button>';
    }).join('') + '</div>';
  }
  function segSet(body, key, cur) {
    body.querySelectorAll('.xp-tg[data-g="' + key + '"] button').forEach(function (b) {
      var on = b.getAttribute('data-o') === String(cur); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
    });
  }
  function nudges() {   // fine steps for a phone, where one pixel of the slider is several points
    return '<div class="xp-btns xp4-nudge">' + [-10, -1, 1, 10].map(function (d) {
      var t = (d > 0 ? '+' : '−') + Math.abs(d);
      return '<button type="button" class="xp-btn xp-ghost" data-d="' + d + '" aria-label="' + t + '">' + t + '</button>';
    }).join('') + '</div>';
  }
  function wireCut(body, get, set) {   // the slider and the nudge buttons move one number
    var r = body.querySelector('input[data-k="cut"]');
    r.addEventListener('input', function () { set(Number(r.value)); });
    body.querySelectorAll('.xp4-nudge button').forEach(function (b) {
      b.onclick = function () { var v = Math.max(Number(r.min), Math.min(Number(r.max), get() + Number(b.getAttribute('data-d')))); r.value = v; set(v); };
    });
  }
  function cell(cls, k, of, name) {
    return '<div class="' + cls + '"><b>' + n0(k) + '</b> <span>' + (of ? p1(k / of, 1) : '—') + '</span><small>' + name + '</small></div>';
  }

  /* ---------- roc: one cut-off on the 2x2, every cut-off on the curve ---------- */
  X.types.roc = function (body, g, check) {
    var F = g.from, n = g.n, b = g.b, K = n.length, s0 = g.start || {}, i, N = 0, Bt = 0;
    for (i = 0; i < K; i++) { N += n[i]; Bt += b[i]; }
    var Gt = N - Bt, MAXC = F + K;
    var st = { cut: s0.cut || 640, model: s0.model || 0, area: 0 }, start = { cut: st.cut, model: st.model };
    var cache = {};
    function model(m) {   // bads and goods per score under the model, their running totals below each cut-off, the area
      if (cache[m]) return cache[m];
      var B = [], G = [], left = Bt, cb = [0], cg = [0], k;
      for (k = 0; k < K; k++) {
        B[k] = m === 0 ? b[k] : m === 1 ? n[k] * Bt / N : Math.min(n[k], left);
        if (m === 2) left -= B[k];
        G[k] = n[k] - B[k];
        cb.push(cb[k] + B[k]); cg.push(cg[k] + G[k]);
      }
      var auc = 0, best = 0;
      for (k = 0; k < K; k++) auc += G[k] / Gt * (cb[k] + cb[k + 1]) / 2 / Bt;   // a tie counts half
      for (k = 0; k <= K; k++) best = Math.max(best, cb[k] / Bt - cg[k] / Gt);
      return (cache[m] = { B: B, G: G, cb: cb, cg: cg, auc: auc, ks: best });
    }
    var MODELS = [[0, T('Our credit score', 'Наш кредитный скор')], [1, T('A coin toss', 'Подбрасывание монеты')], [2, T('A perfect score', 'Идеальный скор')]];
    body.innerHTML = seg('model', T('Rank the loans by', 'Ранжируем кредиты по'), MODELS, st.model) +
      '<div class="xp-ctrl">' + slider(T('Cut-off: approve this score and above, decline below', 'Порог: одобряем этот скор и выше, отказываем ниже'), 'cut', F, MAXC, 1, st.cut, '') + '</div>' + nudges() +
      '<div class="xp-mini-k">' + T('How bads and goods score (each group’s own share per 10 points)', 'Как распределены скоры плохих и хороших (доля своей группы на 10 баллов)') + '</div>' +
      '<svg class="xp4-svg xp4-dist" viewBox="0 0 400 142" role="img"></svg>' +
      '<div class="xp-legend xp4-leg"><span class="xl4-bad">' + T('bads', 'плохие') + '</span><span class="xl4-good">' + T('goods', 'хорошие') + '</span><span class="xl4-zone">' + T('declined', 'отказ') + '</span></div>' +
      '<div class="xp2-tab xp4-tab"></div>' +
      '<div class="xp-btns"><button type="button" class="xp-btn xp-ghost" data-a="area"></button></div>' +
      '<div class="xp-mini-k">' + T('The ROC curve: every cut-off at once', 'ROC-кривая: все пороги сразу') + '</div>' +
      '<svg class="xp4-svg xp4-roc" viewBox="0 0 400 300" role="img"></svg>' +
      '<div class="xp-stats"></div><div class="xp-say"></div>' +
      '<div class="xp-note">' + T('The ' + n0(N) + ' loans with a credit score: ' + n0(Bt) + ' bads (default or written off) and ' + n0(Gt) + ' goods. A coin toss spreads the bads exactly like everyone; a perfect score puts every bad below every good.',
        n0(N) + ' кредитов со скором: ' + n0(Bt) + ' плохих (дефолт или списание) и ' + n0(Gt) + ' хороших. Монета распределяет плохих точно так же, как всех; идеальный скор ставит каждого плохого ниже каждого хорошего.') + '</div>';
    var dist = body.querySelector('.xp4-dist'), roc = body.querySelector('.xp4-roc');
    var DX0 = 420, DX1 = 860;
    function dx(v) { return 8 + (v - DX0) / (DX1 - DX0) * 384; }
    var RX = 92, RY = 12, RS = 236;   // the ROC square
    function rx(f) { return RX + f * RS; }
    function ry(t) { return RY + RS - t * RS; }
    function redraw() {
      var M = model(st.model), j = st.cut - F, TP = M.cb[j], FP = M.cg[j], FN = Bt - TP, TN = Gt - FP;
      var tpr = TP / Bt, fpr = FP / Gt, ks = tpr - fpr, k, v, o = '';
      segSet(body, 'model', st.model);
      body.querySelector('[data-v="cut"]').textContent = st.cut >= MAXC ? T('decline all', 'отказ всем') : st.cut <= F ? T('approve all', 'одобрить всех') : '≥ ' + st.cut;
      /* the two distributions, 10 points a step */
      var bins = [], top = 0;
      for (v = DX0; v < DX1; v += 10) {
        var sb = 0, sg = 0;
        for (k = Math.max(0, v - F); k < Math.min(K, v - F + 10); k++) { sb += M.B[k]; sg += M.G[k]; }
        bins.push([v, sb / Bt, sg / Gt]); top = Math.max(top, sb / Bt, sg / Gt);
      }
      top *= 1.08;
      function yy(s) { return 116 - s / top * 108; }
      function area(col) {
        var d = 'M' + dx(DX0).toFixed(1) + ' 116';
        bins.forEach(function (q) { d += 'L' + dx(q[0]).toFixed(1) + ' ' + yy(q[col]).toFixed(1) + 'L' + dx(q[0] + 10).toFixed(1) + ' ' + yy(q[col]).toFixed(1); });
        return d + 'L' + dx(DX1).toFixed(1) + ' 116Z';
      }
      var cx = dx(Math.max(DX0, Math.min(DX1, st.cut)));
      o += '<rect class="xp4-zone" x="' + dx(DX0).toFixed(1) + '" y="4" width="' + Math.max(0, cx - dx(DX0)).toFixed(1) + '" height="112"/>' +
        '<path class="xp4-good" d="' + area(2) + '"/><path class="xp4-bad" d="' + area(1) + '"/>' +
        '<line class="xp4-axis" x1="8" x2="392" y1="116" y2="116"/>';
      for (v = 450; v <= 850; v += 100) o += '<line class="xp4-tick" x1="' + dx(v).toFixed(1) + '" x2="' + dx(v).toFixed(1) + '" y1="116" y2="120"/><text class="xp-ax" x="' + dx(v).toFixed(1) + '" y="134" text-anchor="middle">' + v + '</text>';
      o += '<line class="xp4-cut" x1="' + cx.toFixed(1) + '" x2="' + cx.toFixed(1) + '" y1="2" y2="118"/>';
      dist.innerHTML = o;
      /* the 2x2 */
      body.querySelector('.xp4-tab').innerHTML = '<div class="xp2-th"></div><div class="xp2-th">' + T('bad', 'плохой') + ' <small>' + n0(Bt) + '</small></div><div class="xp2-th">' + T('good', 'хороший') + ' <small>' + n0(Gt) + '</small></div>' +
        '<div class="xp2-rh">' + T('declined', 'отказ') + ' <small>' + T('score below ', 'скор ниже ') + st.cut + '</small></div>' + cell('t-hit', TP, Bt, T('bads caught · TP', 'пойманы · TP')) + cell('t-fa', FP, Gt, T('goods turned away · FP', 'хорошим отказали · FP')) +
        '<div class="xp2-rh">' + T('approved', 'одобрен') + ' <small>' + T('score ', 'скор ') + st.cut + T(' or more', ' и выше') + '</small></div>' + cell('t-miss', FN, Bt, T('bads approved · FN', 'плохих одобрили · FN')) + cell('t-qn', TN, Gt, T('goods approved · TN', 'хороших одобрили · TN'));
      /* the ROC square */
      o = '<rect class="xp4-frame" x="' + RX + '" y="' + RY + '" width="' + RS + '" height="' + RS + '"/>';
      var path = '';
      for (k = 0; k <= K; k++) path += (k ? 'L' : 'M') + rx(M.cg[k] / Gt).toFixed(1) + ' ' + ry(M.cb[k] / Bt).toFixed(1);
      if (st.area) o += '<path class="xp4-auc" d="' + path + 'L' + rx(1) + ' ' + ry(0) + 'Z"/>';
      o += '<line class="xp4-diag" x1="' + rx(0) + '" y1="' + ry(0) + '" x2="' + rx(1) + '" y2="' + ry(1) + '"/>' +
        '<path class="xp4-curve" d="' + path + '"/>';
      [0, 0.5, 1].forEach(function (t) {
        o += '<text class="xp-ax" x="' + rx(t) + '" y="' + (RY + RS + 16) + '" text-anchor="middle">' + (t * 100) + ' %</text>' +
          '<text class="xp-ax" x="' + (RX - 6) + '" y="' + (ry(t) + 4) + '" text-anchor="end">' + (t * 100) + ' %</text>';
      });
      o += '<text class="xp-ax xp4-axl" x="' + (RX + RS / 2) + '" y="' + (RY + RS + 34) + '" text-anchor="middle">' + T('goods turned away (FPR) →', 'хорошим отказали (FPR) →') + '</text>' +
        '<text class="xp-ax xp4-axl" transform="translate(' + (RX - 52) + ' ' + (RY + RS / 2) + ') rotate(-90)" text-anchor="middle">' + T('bads caught (TPR) →', 'плохие пойманы (TPR) →') + '</text>';
      if (st.area) o += '<text class="xp4-auct" x="' + rx(0.64).toFixed(1) + '" y="' + ry(0.28).toFixed(1) + '" text-anchor="middle">AUC ' + M.auc.toFixed(3) + '</text>';
      var px = rx(fpr), py = ry(tpr), pd = ry(fpr);
      if (ks > 0.004) o += '<line class="xp4-ks" x1="' + px.toFixed(1) + '" x2="' + px.toFixed(1) + '" y1="' + pd.toFixed(1) + '" y2="' + py.toFixed(1) + '"/>' +
        '<text class="xp4-kst" x="' + (px + (fpr > 0.55 ? -7 : 7)).toFixed(1) + '" y="' + ((py + pd) / 2 + 4).toFixed(1) + '" text-anchor="' + (fpr > 0.55 ? 'end' : 'start') + '">KS ' + ks.toFixed(2) + '</text>';
      o += '<circle class="xp4-pt" cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="5.5"/>';
      roc.innerHTML = o;
      body.querySelector('[data-a="area"]').textContent = st.area ? T('Hide the area', 'Скрыть площадь') : T('Shade the area under the curve', 'Закрасить площадь под кривой');
      body.querySelector('.xp-stats').innerHTML = '<span>TPR <b>' + p1(tpr) + '</b></span><span>FPR <b>' + p1(fpr) + '</b></span>' +
        '<span>' + T('KS gap here', 'разрыв KS здесь') + ' <b>' + (Math.abs(ks) < 5e-4 ? 0 : ks).toFixed(3) + '</b></span><span>' + T('widest gap', 'наибольший разрыв') + ' <b>' + M.ks.toFixed(3) + '</b></span>' +
        '<span>AUC <b>' + M.auc.toFixed(3) + '</b></span><span>Gini <b>' + (Math.abs(2 * M.auc - 1) < 5e-4 ? 0 : 2 * M.auc - 1).toFixed(3) + '</b></span>';
      var say;
      if (st.cut <= F) say = T('Approve everyone: no bad is caught and no good is turned away — the curve’s corner at 0 %, 0 %.', 'Одобряем всех: ни одного плохого не поймали, ни одному хорошему не отказали — угол кривой в 0 %, 0 %.');
      else if (st.cut >= MAXC) say = T('Decline everyone: every bad is caught, and every good is turned away — the corner at 100 %, 100 %.', 'Отказываем всем: пойманы все плохие, и отказано всем хорошим — угол 100 %, 100 %.');
      else say = T('Declining scores below <b>' + st.cut + '</b> catches <b>' + n0(TP) + '</b> of ' + n0(Bt) + ' bads (TPR ' + p1(tpr) + ') and turns away <b>' + n0(FP) + '</b> of ' + n0(Gt) + ' goods (FPR ' + p1(fpr) + '). ' +
        'That is the dot on the curve; its height above the diagonal, ' + ks.toFixed(3) + ', is the KS gap at this cut-off.',
        'Отказ скорам ниже <b>' + st.cut + '</b> ловит <b>' + n0(TP) + '</b> из ' + n0(Bt) + ' плохих (TPR ' + p1(tpr) + ') и отсекает <b>' + n0(FP) + '</b> из ' + n0(Gt) + ' хороших (FPR ' + p1(fpr) + '). ' +
        'Это точка на кривой; её высота над диагональю, ' + ks.toFixed(3) + ', — разрыв KS на этом пороге.');
      if (st.area) say += T(' The shaded area is the AUC, <b>' + M.auc.toFixed(3) + '</b>: the chance that a random good scores above a random bad.', ' Закрашенная площадь — это AUC, <b>' + M.auc.toFixed(3) + '</b>: шанс, что у случайного хорошего заёмщика скор выше, чем у случайного плохого.');
      body.querySelector('.xp-say').innerHTML = say;
      check({ cut: st.cut, tpr: tpr, fpr: fpr, ks: ks, auc: M.auc, gini: 2 * M.auc - 1, model: st.model, area: st.area }, { cut: st.cut !== start.cut, model: st.model !== start.model });
    }
    wireCut(body, function () { return st.cut; }, function (v) { st.cut = v; redraw(); });
    body.querySelectorAll('.xp-tg[data-g="model"] button').forEach(function (bt) { bt.onclick = function () { st.model = Number(bt.getAttribute('data-o')); redraw(); }; });
    body.querySelector('[data-a="area"]').onclick = function () { st.area = st.area ? 0 : 1; redraw(); };
    redraw();
    return { redraw: redraw };
  };

  /* ---------- cutoff: where to draw the line, in money ---------- */
  X.types.cutoff = function (body, g, check) {
    var F = g.from, n = g.n, b = g.b, K = n.length, E = g.econ, s0 = g.start || {}, i, N = 0, Bt = 0;
    var FUNDS = g.funds || [0.14, 0.18, 0.22], LO = g.lo || 500, HI = g.hi || 760;
    var upN = new Array(K + 1), upB = new Array(K + 1);   // loans and bads at or above each score
    upN[K] = 0; upB[K] = 0;
    for (i = K - 1; i >= 0; i--) { upN[i] = upN[i + 1] + n[i]; upB[i] = upB[i + 1] + b[i]; }
    N = upN[0]; Bt = upB[0];
    var st = { cut: s0.cut || 600, fund: s0.fund || 0.18 }, start = { cut: st.cut, fund: st.fund };
    function money(f) { var cof = E.cof * f / 0.18; return { good: E.interest - cof - E.opex, bad: E.lgd * E.ead + cof + E.opex }; }
    function at(c, f) {
      var j = Math.max(0, Math.min(K, c - F)), kept = upN[j], bads = upB[j], m = money(f);
      return { kept: kept, bads: bads, profit: m.good * (kept - bads) - m.bad * bads };
    }
    var tops = {};
    function topOf(f) {
      if (tops[f]) return tops[f];
      var best = -Infinity, bc = F;
      for (var c = F; c <= F + K; c++) { var p = at(c, f).profit; if (p > best) { best = p; bc = c; } }
      return (tops[f] = { profit: best, cut: bc });
    }
    body.innerHTML = seg('fund', T('Nur’s funding costs (W8D2: 18 %)', 'Фондирование Nur стоит (W8D2: 18 %)'), FUNDS.map(function (f) { return [f, Math.round(f * 100) + T(' % a year', ' % годовых')]; }), st.fund) +
      '<div class="xp-ctrl">' + slider(T('Cut-off: approve this score and above', 'Порог: одобряем этот скор и выше'), 'cut', LO, HI, 1, st.cut, '') + '</div>' + nudges() +
      '<div class="xp-big"><span class="xp-big-k">' + T('Profit on these loans, soum', 'Прибыль на этих кредитах, сумов') + '</span><span class="xp-big-v"></span></div>' +
      '<svg class="xp4-svg xp4-pro" viewBox="0 0 400 190" role="img"></svg>' +
      '<div class="xp4-grid"></div><div class="xp-say"></div><div class="xp-note"></div>';
    var svg = body.querySelector('.xp4-pro');
    function redraw() {
      var f = st.fund, m = money(f), r = at(st.cut, f), top = topOf(f), all = at(F, f);
      var share = r.kept / N, br = r.kept ? r.bads / r.kept : 0, avoided = Bt - r.bads, lost = (N - Bt) - (r.kept - r.bads);
      var el = r.kept ? br * E.lgd * E.ead : 0, gap = top.profit - r.profit, be = m.good / (m.good + m.bad), c;
      segSet(body, 'fund', f);
      body.querySelector('[data-v="cut"]').textContent = '≥ ' + st.cut;
      body.querySelector('.xp-big-v').textContent = bn(r.profit);
      /* the profit curve over the slider's range */
      var pts = [], lo = Infinity, hi = -Infinity;
      for (c = LO; c <= HI; c++) { var p = at(c, f).profit; pts.push(p); lo = Math.min(lo, p); hi = Math.max(hi, p); }
      lo = Math.min(lo, all.profit, 0); hi = Math.max(hi, all.profit);
      var pad = (hi - lo) * 0.1; lo -= pad; hi += pad;
      function x(v) { return 40 + (v - LO) / (HI - LO) * 352; }
      function y(p) { return 150 - (p - lo) / (hi - lo) * 140; }
      var o = '<line class="xp4-axis" x1="40" x2="392" y1="150" y2="150"/>', d = '';
      if (lo < 0) o += '<line class="xp4-zero" x1="40" x2="392" y1="' + y(0).toFixed(1) + '" y2="' + y(0).toFixed(1) + '"/>';
      pts.forEach(function (p, k) { d += (k ? 'L' : 'M') + x(LO + k).toFixed(1) + ' ' + y(p).toFixed(1); });
      var ya = y(all.profit);
      o += '<line class="xp4-all" x1="40" x2="392" y1="' + ya.toFixed(1) + '" y2="' + ya.toFixed(1) + '"/><text class="xp-ax xp4-allt" x="46" y="142">' + T('dashed: approve everyone, ', 'пунктир: одобрить всех, ') + bn(all.profit) + '</text>' +
        '<path class="xp4-curve" d="' + d + '"/>';
      for (c = Math.ceil(LO / 50) * 50; c <= HI; c += 50) o += '<line class="xp4-tick" x1="' + x(c).toFixed(1) + '" x2="' + x(c).toFixed(1) + '" y1="150" y2="154"/><text class="xp-ax" x="' + x(c).toFixed(1) + '" y="167" text-anchor="middle">' + c + '</text>';
      [0, Math.max(hi - pad, 0)].forEach(function (v) { o += '<text class="xp-ax" x="35" y="' + (y(v) + 4).toFixed(1) + '" text-anchor="end">' + (v / 1e9).toFixed(1) + '</text>'; });
      o += '<text class="xp-ax" x="40" y="185">' + T('bn soum, by cut-off score', 'млрд сумов, по порогу скора') + '</text>';
      var cx = x(st.cut).toFixed(1);
      o += '<line class="xp4-cut" x1="' + cx + '" x2="' + cx + '" y1="6" y2="152"/><circle class="xp4-pt" cx="' + cx + '" cy="' + y(r.profit).toFixed(1) + '" r="5.5"/>';
      svg.innerHTML = o;
      function box(k, v, sub) { return '<div><span>' + k + '</span><b>' + v + '</b>' + (sub ? '<i>' + sub + '</i>' : '') + '</div>'; }
      body.querySelector('.xp4-grid').innerHTML =
        box(T('Approved', 'Одобрено'), p1(share), n0(r.kept) + T(' of ', ' из ') + n0(N)) +
        box(T('Bad rate of the approved', 'Доля плохих среди одобренных'), p1(br, 2), n0(r.bads) + T(' bads', ' плохих')) +
        box(T('Bads avoided', 'Плохих не выдали'), n0(avoided), T('of ', 'из ') + n0(Bt)) +
        box(T('Goods turned away', 'Хорошим отказали'), n0(lost), T('of ', 'из ') + n0(N - Bt)) +
        box(T('Expected loss per approved loan', 'Ожидаемый убыток на одобренный кредит'), mln(el), 'PD × LGD × EAD') +
        box(T('Below the top of this curve', 'До вершины этой кривой'), gap < 1 ? '0' : mln(gap), gap <= 5e6 ? T('at the top', 'на вершине') : '');
      var j = st.cut - F, kb = 0, kn = 0;   // the ten scores just below the cut-off: what declining them did
      for (i = Math.max(0, j - 10); i < Math.max(0, j); i++) { kn += n[i]; kb += b[i]; }
      var say = T('A good loan leaves <b>' + mln(m.good) + '</b> and a bad one costs <b>' + mln(m.bad) + '</b>, so declining a group pays when more than <b>' + p1(be, 2) + '</b> of it goes bad. ',
        'Хороший кредит приносит <b>' + mln(m.good) + '</b>, а плохой стоит <b>' + mln(m.bad) + '</b>, поэтому отказывать группе выгодно, когда плохих в ней больше <b>' + p1(be, 2) + '</b>. ');
      if (kn) say += T('The ten scores just below your cut-off (' + (st.cut - 10) + '–' + (st.cut - 1) + '): ' + n0(kn) + ' loans, ' + n0(kb) + ' bads (<b>' + p1(kb / kn, 1) + '</b>) — ' + (kb / kn > be ? 'worse than that, so declining them earns money.' : 'better than that, so declining them gives up money.'),
        'Десять скоров прямо под вашим порогом (' + (st.cut - 10) + '–' + (st.cut - 1) + '): кредитов ' + n0(kn) + ', плохих ' + n0(kb) + ' (<b>' + p1(kb / kn, 1) + '</b>) — ' + (kb / kn > be ? 'это хуже порога, поэтому отказ им приносит деньги.' : 'это лучше порога, поэтому отказ им стоит денег.'));
      body.querySelector('.xp-say').innerHTML = say;
      body.querySelector('.xp-note').innerHTML = T('Every loan is priced like W8D2’s average Consumer loan: interest ' + mln(E.interest) + ', funding ' + mln(E.cof * f / 0.18) + ' at ' + Math.round(f * 100) + ' %, selling and servicing ' + mln(E.opex) + '; a bad loan pays no interest and loses LGD ' + Math.round(E.lgd * 100) + ' % of EAD ' + mln(E.ead) + '. The ' + n0(N) + ' loans with a score, 2024–2026.',
        'Каждый кредит оценён как средний потребительский кредит из W8D2: проценты ' + mln(E.interest) + ', фондирование ' + mln(E.cof * f / 0.18) + ' при ' + Math.round(f * 100) + ' %, продажа и обслуживание ' + mln(E.opex) + '; плохой кредит не платит процентов и теряет LGD ' + Math.round(E.lgd * 100) + ' % от EAD ' + mln(E.ead) + '. ' + n0(N) + ' кредитов со скором, 2024–2026.');
      check({ cut: st.cut, fund: f, approve: share, br: br, avoided: avoided, lost: lost, el: el, profit: r.profit, gapBest: gap }, { cut: st.cut !== start.cut, fund: f !== start.fund });
    }
    wireCut(body, function () { return st.cut; }, function (v) { st.cut = v; redraw(); });
    body.querySelectorAll('.xp-tg[data-g="fund"] button').forEach(function (bt) { bt.onclick = function () { st.fund = Number(bt.getAttribute('data-o')); redraw(); }; });
    redraw();
    return { redraw: redraw };
  };

  /* ---------- psi: has the applicant population moved? ---------- */
  X.types.psi = function (body, g, check) {
    var F = g.from, base = g.base, pops = g.pops, EDGES = g.edges || [560, 600, 640, 680, 720], s0 = g.start || {};
    var NAMES = [T('below 560', 'ниже 560'), '560–599', '600–639', '640–679', '680–719', '720+'];
    var SHORT = ['<560', '560', '600', '640', '680', '720+'];
    function bandOf(v) { var k = 0; while (k < EDGES.length && v >= EDGES[k]) k++; return k; }
    function stats(counts, shift, k) {
      var tot = 0, sum = 0, i;
      for (i = 0; i < counts.length; i++) { tot += counts[i]; sum += counts[i] * (F + i); }
      var m = sum / tot, sh = [0, 0, 0, 0, 0, 0], ms = 0;
      for (i = 0; i < counts.length; i++) if (counts[i]) { var v = m + k * (F + i - m) + shift; sh[bandOf(v)] += counts[i]; ms += counts[i] * v; }
      return { n: tot, mean: ms / tot, shares: sh.map(function (c) { return c / tot; }) };
    }
    var E = stats(base, 0, 1), FLOOR = 0.0001;
    var st = { pre: String(s0.pre || pops[0].key), shift: 0, spread: 1 }, start = { pre: st.pre };
    function popOf(key) { for (var i = 0; i < pops.length; i++) if (String(pops[i].key) === String(key)) return pops[i]; return pops[0]; }
    body.innerHTML = seg('pre', T('This period’s applicants', 'Заявители этого периода'), pops.map(function (p) { return [p.key, esc(p.label)]; }), st.pre) +
      '<div class="xp-ctrl">' + slider(T('Move every score by', 'Сдвинуть каждый скор на'), 'shift', -40, 40, 1, 0, '') +
      slider(T('Stretch the spread around the mean', 'Растянуть разброс вокруг среднего'), 'spread', 0.5, 2, 0.05, 1, '') + '</div>' +
      '<div class="xp-btns"><button type="button" class="xp-btn xp-ghost" data-a="back">' + T('Put it back', 'Вернуть как было') + '</button></div>' +
      '<div class="xp-big"><span class="xp-big-k">' + T('PSI against 2024', 'PSI относительно 2024') + '</span><span class="xp-big-v"></span></div>' +
      '<svg class="xp4-svg xp4-psi" viewBox="0 0 400 190" role="img"></svg>' +
      '<div class="xp-legend xp4-leg"><span class="xl4-base">' + T('2024 (the reference)', '2024 (эталон)') + '</span><span class="xl4-now">' + T('this period', 'этот период') + '</span></div>' +
      '<div class="xp-stats"></div><div class="xp-say"></div>' +
      '<div class="xp-note">' + T('Applicants with a credit score. Bars: each band’s share; the number above a band is its part of the PSI, (actual − expected) × ln(actual ÷ expected). An empty band is floored at 0.01 %.',
        'Заявители со скором. Столбцы — доля каждой полосы; число над полосой — её вклад в PSI, (факт − ожидание) × ln(факт ÷ ожидание). Пустая полоса берётся как 0.01 %.') + '</div>';
    var svg = body.querySelector('.xp4-psi');
    function light(p) { return p < 0.1 ? ['ok', T('stable', 'стабильно')] : p <= 0.25 ? ['warn', T('watch', 'наблюдать')] : ['bad', T('act', 'действовать')]; }
    function redraw() {
      var P = popOf(st.pre), A = stats(P.counts, st.shift, st.spread), terms = [], psi = 0, k;
      for (k = 0; k < 6; k++) { var a = Math.max(A.shares[k], FLOOR), e = Math.max(E.shares[k], FLOOR), t = (a - e) * Math.log(a / e); terms.push(t); psi += t; }
      segSet(body, 'pre', st.pre);
      body.querySelector('[data-v="shift"]').textContent = (st.shift > 0 ? '+' : st.shift < 0 ? '−' : '') + Math.abs(st.shift) + T(' points', ' баллов');
      body.querySelector('[data-v="spread"]').textContent = '× ' + st.spread.toFixed(2);
      var L = light(psi);
      body.querySelector('.xp-big-v').innerHTML = psi.toFixed(4) + ' <span class="xp2-chip ' + L[0] + '">' + L[1] + '</span>';
      var top = 0;
      for (k = 0; k < 6; k++) top = Math.max(top, A.shares[k], E.shares[k]);
      top = Math.max(top * 1.15, 0.3);
      var o = '<line class="xp4-axis" x1="6" x2="394" y1="150" y2="150"/>', W = 388 / 6;
      for (k = 0; k < 6; k++) {
        var x0 = 6 + k * W, he = E.shares[k] / top * 122, ha = A.shares[k] / top * 122;
        o += '<rect class="xp4-base" x="' + (x0 + 6).toFixed(1) + '" y="' + (150 - he).toFixed(1) + '" width="' + (W / 2 - 7).toFixed(1) + '" height="' + he.toFixed(1) + '"/>' +
          '<rect class="xp4-now" x="' + (x0 + W / 2 + 1).toFixed(1) + '" y="' + (150 - ha).toFixed(1) + '" width="' + (W / 2 - 7).toFixed(1) + '" height="' + ha.toFixed(1) + '"/>' +
          '<text class="xp-ax" x="' + (x0 + W / 2).toFixed(1) + '" y="166" text-anchor="middle">' + SHORT[k] + '</text>' +
          '<text class="xp4-term' + (terms[k] >= 0.02 ? ' hot' : '') + '" x="' + (x0 + W / 2).toFixed(1) + '" y="' + (150 - Math.max(he, ha) - 6).toFixed(1) + '" text-anchor="middle">' + terms[k].toFixed(3) + '</text>';
      }
      o += '<text class="xp-ax" x="6" y="185">' + T('score band', 'полоса скора') + '</text>';
      svg.innerHTML = o;
      var big = 0;
      for (k = 1; k < 6; k++) if (terms[k] > terms[big]) big = k;
      body.querySelector('.xp-stats').innerHTML = '<span>' + T('applicants', 'заявителей') + ' <b>' + n0(A.n) + '</b></span><span>' + T('average score', 'средний скор') + ' <b>' + A.mean.toFixed(1) + '</b></span><span>' + T('in 2024', 'в 2024') + ' <b>' + E.mean.toFixed(1) + '</b></span>';
      var moved = st.shift !== 0 || Math.abs(st.spread - 1) > 1e-9;
      var say = T('Against 2024’s shares, ' + esc(P.label) + (moved ? ' (moved)' : '') + ' gives PSI <b>' + psi.toFixed(4) + '</b>: <b>' + L[1] + '</b> (below 0.1 stable, 0.1–0.25 watch, above 0.25 act). The largest part comes from the band ' + NAMES[big] + ': ' + p1(E.shares[big], 1) + ' in 2024, ' + p1(A.shares[big], 1) + ' now.',
        'Относительно долей 2024 года период «' + esc(P.label) + '»' + (moved ? ' (со сдвигом)' : '') + ' даёт PSI <b>' + psi.toFixed(4) + '</b>: <b>' + L[1] + '</b> (ниже 0.1 — стабильно, 0.1–0.25 — наблюдать, выше 0.25 — действовать). Больше всего даёт полоса ' + NAMES[big] + ': в 2024 году ' + p1(E.shares[big], 1) + ', сейчас ' + p1(A.shares[big], 1) + '.');
      body.querySelector('.xp-say').innerHTML = say;
      check({ pre: Number(st.pre), shift: st.shift, spread: st.spread, psi: psi, mean: A.mean },
        { pre: st.pre !== start.pre, shift: st.shift !== 0, spread: Math.abs(st.spread - 1) > 1e-9 });
    }
    body.querySelectorAll('input[type=range]').forEach(function (r) { r.addEventListener('input', function () { st[r.getAttribute('data-k')] = Number(r.value); redraw(); }); });
    body.querySelectorAll('.xp-tg[data-g="pre"] button').forEach(function (bt) { bt.onclick = function () { st.pre = bt.getAttribute('data-o'); redraw(); }; });
    body.querySelector('[data-a="back"]').onclick = function () {
      st.shift = 0; st.spread = 1;
      body.querySelector('input[data-k="shift"]').value = 0; body.querySelector('input[data-k="spread"]').value = 1;
      redraw();
    };
    redraw();
    return { redraw: redraw };
  };
})();
