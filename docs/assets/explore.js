/* Explorers: maths you can touch (the founder, 2026-10-29: "make the logic and probability part interactive, so the
learner can play with the information and learn it in a fun way, not by watching videos and solving equations").

A ```explore JSON block becomes a small playground in three steps:
  1. Predict — a question first ("when the rule flags someone, how likely is fraud?"); her guess is kept.
  2. Play    — sliders and buttons move the numbers, and the picture and the live read-out follow at once.
  3. Challenges — small goals ("make most flags real fraud by moving only the false-positive rate"); each one
     ticks itself the moment the playground meets it. All ticked = the explorer is done.

  {"id": "w06d1-x1", "type": "bayes", "title": "…", "predict": {"q": "…", "options": ["…"], "answer": 2, "why": "…"},
   "start": {…the type's own starting values…}, "challenges": [{"id": "c1", "text": "…", "when": {…}}]}

Types (each draws its own playground and reports its numbers to the challenges; more in explore2.js):
  bayes — 10 000 applicants as a grid of 1 000 dots (each dot = 10 people); sliders: base rate, sensitivity,
          false-positive rate; numbers: ppv (P(fraud | flag)), base, sens, fpr, flags, tp, fp.
  clt   — a skewed population ("pop": values, e.g. 500 quantiles of the real loan amounts); a sample-size step
          ("ns") and Draw buttons build the histogram of sample means; "Show the bell" lays N(μ, σ/√n) over it;
          numbers: n, samples, sdm (sd of the means), se (σ/√n), skew (≈ population skew / √n), bell.
  logic    — a WHERE of three conditions over real counts ("counts": product × status); NOT on each, AND / OR between,
             brackets none, (A B) C or A (B C); one dot per ≈ 20 applications; numbers: n (rows matched), br, nots.
  binomial — batches of n loans, each an FPD with chance p; Run buttons build the histogram of FPD counts, the exact
             bars on top, an alarm line k; numbers: n, batches, avg, avgErr (|avg − n·p|), sd (exact), k,
             tail (P(X ≥ k)), tailPrev (P(X ≥ k − 1)), exact.
  normal   — the credit-score bell over the real histogram ("counts" per score from "from"); a band ± k sd or a cut-off;
             numbers: k, inside (share within ± k sd), cut, below (share under the cut-off), band.
  median   — a few real loans ("loans": [amount, product]) on a line; one loan's amount moves at a time; numbers: ratio
             (mean ÷ median), meanX (mean ÷ the real mean), medMove (how far the median moved), moved, val.
  intervals — samples of n loans at a true rate p, one Wilson or Wald interval each, at 80–99 %; numbers: n, conf, wald,
             drawn, missShare, wratio (average width ÷ the method's at n = 400), cover (its exact catch rate).
A challenge's "when" lists numbers and tests: {"ppv": [">", 0.5]}, {"n": ["=", 30], "samples": [">=", 200]};
"only": ["fpr"] means the other sliders must still sit at their start.

The box (.xp) is an "al-block" and "al-done" once every challenge is ticked (sections.js); a change fires "al:change".
State lives in localStorage "al.v1" → explore[id] = {pred, done: {c1: 1, …}, doneOn}, so sync.js keeps it with her
sign-in like every other progress. Words come from the page's language (lang.js) and from the block itself. */
(function () {
  var KEY = 'al.v1';
  function T(en, ru) { return window.ALLang ? window.ALLang.t(en, ru) : en; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmtText(s) { return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>'); }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function stateOf(id) { return ((load().explore || {})[id]) || {}; }
  function saveState(id, rec) {   // read fresh right before writing: quiz.js, challenge.js and games.js share al.v1
    try { var s = load(); s.explore = s.explore || {}; s.explore[id] = rec; localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private window */ }
  }
  function pct(x, dp) { return (x * 100).toFixed(dp == null ? 1 : dp).replace(/\.0$/, '') + ' %'; }
  function num(x) { return Math.round(x).toLocaleString('en').replace(/,/g, ' '); }
  function test(v, t) {
    var op = t[0], w = t[1];
    return op === '>' ? v > w : op === '>=' ? v >= w : op === '<' ? v < w : op === '<=' ? v <= w : op === '=' ? Math.abs(v - w) < 1e-9
      : op === 'between' ? v >= w && v <= t[2] : false;
  }

  /* ---------- the frame every explorer shares ---------- */
  function mount(pre) {
    var g;
    try { g = JSON.parse((pre.querySelector('code') || pre).textContent); }
    catch (e) { pre.insertAdjacentHTML('beforebegin', '<p class="quiz-error">' + T('This explorer could not be read', 'Не удалось прочитать исследователь') + ' (' + esc(e.message) + ').</p>'); return; }
    var kind = TYPES[g.type];
    if (!kind) return;
    var box = document.createElement('div');
    box.className = 'xp al-block xp-' + g.type;
    box.setAttribute('data-id', g.id);
    pre.parentNode.replaceChild(box, pre);
    var st = stateOf(g.id), p = g.predict;
    box.innerHTML = '<div class="xp-head"><span class="xp-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg></span>' +
      '<div><div class="xp-kicker">' + T('Explore', 'Исследуйте') + '</div><div class="xp-title">' + esc(g.title) + '</div></div>' +
      '<div class="xp-score"><b>0</b>/' + (g.challenges || []).length + '</div></div>' +
      (p ? '<div class="xp-step xp-predict"><div class="xp-step-k">' + T('1 · Predict first', '1 · Сначала угадайте') + '</div><div class="xp-q">' + fmtText(p.q) + '</div>' +
        '<div class="xp-opts">' + p.options.map(function (o, i) { return '<button type="button" class="xp-opt" data-i="' + i + '">' + fmtText(o) + '</button>'; }).join('') + '</div>' +
        '<div class="xp-verdict" aria-live="polite"></div></div>' : '') +
      '<div class="xp-step xp-play"' + (p && st.pred == null ? ' hidden' : '') + '><div class="xp-step-k">' + T('2 · Play with it', '2 · Поиграйте') + '</div><div class="xp-body"></div></div>' +
      '<div class="xp-step xp-goals"' + (p && st.pred == null ? ' hidden' : '') + '><div class="xp-step-k">' + T('3 · Challenges', '3 · Задания') + '</div><ul class="xp-list">' +
      (g.challenges || []).map(function (c) { return '<li data-c="' + esc(c.id) + '"><span class="xp-tick" aria-hidden="true"></span><span>' + fmtText(c.text) + '</span></li>'; }).join('') + '</ul>' +
      '<div class="xp-done-msg" hidden>' + T('All challenges done — you have seen it work, not just read it.', 'Все задания выполнены — вы увидели, как это работает, а не просто прочитали.') + '</div></div>';
    var done = st.done || {};
    function verdict(i) {
      var ok = i === p.answer, v = box.querySelector('.xp-verdict');
      box.querySelectorAll('.xp-opt').forEach(function (b, k) {
        b.classList.toggle('on', k === i); b.classList.toggle('right', k === p.answer); b.classList.toggle('wrong', k === i && !ok); b.disabled = true;
      });
      v.className = 'xp-verdict ' + (ok ? 'ok' : 'bad');
      v.innerHTML = '<b>' + (ok ? T('✓ Right.', '✓ Верно.') : T('Not quite — and that is the point of playing below.', 'Не совсем — для этого ниже и есть игра.')) + '</b> ' + fmtText(p.why || '');
    }
    if (p && st.pred != null) verdict(st.pred);
    if (p) box.querySelectorAll('.xp-opt').forEach(function (b) {
      b.onclick = function () {
        var i = Number(b.getAttribute('data-i'));
        st = stateOf(g.id); st.pred = i; saveState(g.id, st);
        verdict(i);
        box.querySelector('.xp-play').hidden = false; box.querySelector('.xp-goals').hidden = false;
        play.redraw();
      };
    });
    function check(vals, changed) {
      var fresh = false;
      (g.challenges || []).forEach(function (c) {
        if (done[c.id]) return;
        var w = c.when || {}, ok = Object.keys(w).every(function (k) { return vals[k] != null && test(vals[k], w[k]); });
        if (ok && c.only) ok = Object.keys(changed).every(function (k) { return !changed[k] || c.only.indexOf(k) >= 0; });
        if (ok) { done[c.id] = 1; fresh = true; }
      });
      paint();
      if (fresh) {
        st = stateOf(g.id); st.done = done;
        var all = (g.challenges || []).every(function (c) { return done[c.id]; });
        if (all && !st.doneOn) st.doneOn = new Date().toISOString().slice(0, 10);
        saveState(g.id, st);
        document.dispatchEvent(new CustomEvent('al:change'));
      }
    }
    function paint() {
      var n = 0, all = g.challenges || [];
      box.querySelectorAll('.xp-list li').forEach(function (li) { var on = !!done[li.getAttribute('data-c')]; li.classList.toggle('ok', on); if (on) n++; });
      box.querySelector('.xp-score b').textContent = n;
      var fin = all.length > 0 && n === all.length;
      box.classList.toggle('al-done', fin);
      box.querySelector('.xp-done-msg').hidden = !fin;
    }
    var play = kind(box.querySelector('.xp-body'), g, check);
    paint();
  }

  function slider(label, id, min, max, step, value, show) {
    return '<label class="xp-sl"><span class="xp-sl-l">' + label + '</span><input type="range" data-k="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '">' +
      '<span class="xp-sl-v" data-v="' + id + '">' + show + '</span></label>';
  }

  /* ---------- bayes: who is behind a flag ---------- */
  var BASES = [0.001, 0.002, 0.003, 0.005, 0.0062, 0.01, 0.02, 0.03, 0.05, 0.1, 0.15, 0.2, 0.3];
  function bayes(body, g, check) {
    var s0 = g.start || {}, b0 = BASES.indexOf(s0.base) >= 0 ? BASES.indexOf(s0.base) : 4;
    var st = { b: b0, sens: s0.sens == null ? 0.9 : s0.sens, fpr: s0.fpr == null ? 0.05 : s0.fpr };
    var start = { b: st.b, sens: st.sens, fpr: st.fpr };
    body.innerHTML = '<div class="xp-ctrl">' +
      slider(T('Fraud among applicants (base rate)', 'Мошенников среди заявителей (базовая доля)'), 'b', 0, BASES.length - 1, 1, st.b, '') +
      slider(T('Fraudsters the rule catches (sensitivity)', 'Мошенников, которых ловит правило (чувствительность)'), 'sens', 0.5, 1, 0.01, st.sens, '') +
      slider(T('Honest people it flags by mistake', 'Честных, которых правило ошибочно отмечает'), 'fpr', 0, 0.2, 0.005, st.fpr, '') + '</div>' +
      '<div class="xp-big"><span class="xp-big-k">' + T('When the rule flags someone, it is really fraud', 'Когда правило срабатывает, это действительно мошенник') + '</span><span class="xp-big-v"></span></div>' +
      '<svg class="xp-grid" viewBox="0 0 400 250" role="img"></svg>' +
      '<div class="xp-legend"><span class="xl-tp">' + T('fraud, flagged', 'мошенник, отмечен') + '</span><span class="xl-fn">' + T('fraud, missed', 'мошенник, пропущен') + '</span>' +
      '<span class="xl-fp">' + T('honest, flagged', 'честный, отмечен') + '</span><span class="xl-tn">' + T('honest, clear', 'честный, не отмечен') + '</span></div>' +
      '<div class="xp-say"></div><div class="xp-note">' + T('10 000 applicants; each dot is 10 people.', '10 000 заявителей; каждая точка — 10 человек.') + '</div>';
    var svg = body.querySelector('svg'), order = [], i;
    for (i = 0; i < 1000; i++) order.push(i);
    for (i = 999; i > 0; i--) { var j = (i * 7919 + 13) % (i + 1); var t = order[i]; order[i] = order[j]; order[j] = t; }   // the same scatter every time
    var dots = '';
    for (i = 0; i < 1000; i++) dots += '<circle cx="' + (5 + (i % 40) * 10) + '" cy="' + (5 + Math.floor(i / 40) * 10) + '" r="3.6"/>';
    svg.innerHTML = dots;
    var circles = svg.querySelectorAll('circle');
    function redraw() {
      var base = BASES[st.b], N = 10000, fraud = N * base, honest = N - fraud, tp = st.sens * fraud, fp = st.fpr * honest, ppv = tp + fp ? tp / (tp + fp) : 0;
      body.querySelector('[data-v="b"]').textContent = pct(base, base < 0.01 ? 2 : 1);
      body.querySelector('[data-v="sens"]').textContent = pct(st.sens, 0);
      body.querySelector('[data-v="fpr"]').textContent = pct(st.fpr, 1);
      body.querySelector('.xp-big-v').textContent = pct(ppv, 1);
      var dF = Math.round(fraud / 10), dTP = Math.min(dF, Math.round(tp / 10)), dFP = Math.round(fp / 10);
      for (var k = 0; k < 1000; k++) {
        var d = order[k], cls = k < dTP ? 'tp' : k < dF ? 'fn' : k < dF + dFP ? 'fp' : 'tn';
        circles[d].setAttribute('class', cls);
      }
      body.querySelector('.xp-say').innerHTML = T('<b>' + num(fraud) + '</b> fraudsters, the rule flags <b>' + num(tp) + '</b> of them; <b>' + num(honest) + '</b> honest people, it flags <b>' + num(fp) + '</b>. ' +
        'So <b>' + num(tp + fp) + '</b> flags, and <b>' + num(tp) + '</b> of them are fraud: ' + num(tp) + ' ÷ ' + num(tp + fp) + ' = <b>' + pct(ppv, 1) + '</b>.',
        '<b>' + num(fraud) + '</b> мошенников, правило отмечает <b>' + num(tp) + '</b> из них; <b>' + num(honest) + '</b> честных, отмечает <b>' + num(fp) + '</b>. ' +
        'Итого <b>' + num(tp + fp) + '</b> срабатываний, из них мошенников <b>' + num(tp) + '</b>: ' + num(tp) + ' ÷ ' + num(tp + fp) + ' = <b>' + pct(ppv, 1) + '</b>.');
      check({ ppv: ppv, base: base, sens: st.sens, fpr: st.fpr, flags: tp + fp, tp: tp, fp: fp },
        { base: st.b !== start.b, sens: Math.abs(st.sens - start.sens) > 1e-9, fpr: Math.abs(st.fpr - start.fpr) > 1e-9 });
    }
    body.querySelectorAll('input[type=range]').forEach(function (r) {
      r.addEventListener('input', function () { st[r.getAttribute('data-k')] = Number(r.value); redraw(); });
    });
    redraw();
    return { redraw: redraw };
  }

  /* ---------- clt: the mean of n becomes a bell ---------- */
  function clt(body, g, check) {
    var pop = g.pop || [], P = pop.length, mu = 0, i;
    for (i = 0; i < P; i++) mu += pop[i];
    mu /= P;
    var v = 0, sk = 0;
    for (i = 0; i < P; i++) { v += (pop[i] - mu) * (pop[i] - mu); }
    var sigma = Math.sqrt(v / P);
    for (i = 0; i < P; i++) sk += Math.pow((pop[i] - mu) / sigma, 3);
    sk /= P;
    var ns = g.ns || [1, 2, 5, 10, 30, 50, 100, 200], unit = g.unit || 'm';
    var st = { ni: Math.max(0, ns.indexOf((g.start || {}).n || 1)), means: [], bell: false }, seed = 2026;
    function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
    body.innerHTML = '<div class="xp-popbox"><div class="xp-mini-k">' + fmtText(g.popLabel || T('The data: every loan', 'Данные: каждый кредит')) + '</div><svg class="xp-pop" viewBox="0 0 400 82"></svg></div>' +
      '<div class="xp-ctrl">' + slider(T('Loans in each sample (n)', 'Кредитов в каждой выборке (n)'), 'n', 0, ns.length - 1, 1, st.ni, '') + '</div>' +
      '<div class="xp-btns"><button type="button" class="xp-btn" data-a="1">' + T('Draw 1 sample', 'Взять 1 выборку') + '</button>' +
      '<button type="button" class="xp-btn" data-a="100">' + T('Draw 100 samples', 'Взять 100 выборок') + '</button>' +
      '<button type="button" class="xp-btn xp-ghost" data-a="bell">' + T('Show the bell', 'Показать колокол') + '</button>' +
      '<button type="button" class="xp-btn xp-ghost" data-a="reset">' + T('Start again', 'Сначала') + '</button></div>' +
      '<div class="xp-mini-k">' + T('The averages of your samples', 'Средние ваших выборок') + '</div><svg class="xp-hist" viewBox="0 0 400 180"></svg>' +
      '<div class="xp-stats"></div>';
    /* the population, once: most loans are small, a few are huge (the last bar holds everything above the cap) */
    var cap = g.popCap || 200, pb = 40, ph = new Array(pb + 1).fill(0);
    for (i = 0; i < P; i++) ph[Math.min(pb, Math.floor(pop[i] / cap * pb))]++;
    var pm = Math.max.apply(null, ph), bars = '';
    for (i = 0; i <= pb; i++) bars += '<rect class="' + (i === pb ? 'xp-over' : '') + '" x="' + (i * 400 / (pb + 1) + 0.5) + '" y="' + (66 - ph[i] / pm * 60) + '" width="' + (400 / (pb + 1) - 1) + '" height="' + (ph[i] / pm * 60) + '"/>';
    body.querySelector('.xp-pop').innerHTML = bars + '<text x="2" y="80" class="xp-ax">0</text><text x="398" y="80" text-anchor="end" class="xp-ax">' + cap + ' ' + unit + '+</text>';
    var hist = body.querySelector('.xp-hist');
    function range() {
      var n = ns[st.ni], se = sigma / Math.sqrt(n);
      return { n: n, se: se, lo: Math.max(0, mu - 3.5 * se), hi: mu + 5 * se };
    }
    function redraw() {
      var r = range(), B = 32, w = (r.hi - r.lo) / B, h = new Array(B).fill(0), m = st.means, k;
      for (k = 0; k < m.length; k++) { var bi = Math.floor((m[k] - r.lo) / w); if (bi >= B) bi = B - 1; if (bi < 0) bi = 0; h[bi]++; }
      var top = Math.max(5, Math.max.apply(null, h)), out = '';
      if (st.bell && m.length) {   // N(μ, σ/√n) scaled to the counts, drawn behind the bars
        var peak = m.length * w / (r.se * Math.sqrt(2 * Math.PI));
        top = Math.max(top, peak);
      }
      for (k = 0; k < B; k++) out += '<rect x="' + (k * 400 / B + 0.5) + '" y="' + (164 - h[k] / top * 150) + '" width="' + (400 / B - 1) + '" height="' + (h[k] / top * 150) + '"/>';
      if (st.bell && m.length) {
        var path = '';
        for (k = 0; k <= 80; k++) {
          var x = r.lo + (r.hi - r.lo) * k / 80, y = m.length * w * Math.exp(-0.5 * Math.pow((x - mu) / r.se, 2)) / (r.se * Math.sqrt(2 * Math.PI));
          path += (k ? 'L' : 'M') + (k * 5).toFixed(1) + ' ' + (164 - y / top * 150).toFixed(1);
        }
        out += '<path class="xp-bell" d="' + path + '"/>';
      }
      var xm = (mu - r.lo) / (r.hi - r.lo) * 400;
      out += '<line class="xp-mu" x1="' + xm + '" x2="' + xm + '" y1="8" y2="166"/><text class="xp-ax" x="' + (xm + 4) + '" y="16">μ = ' + mu.toFixed(1) + ' ' + unit + '</text>' +
        '<text class="xp-ax" x="2" y="178">' + r.lo.toFixed(0) + '</text><text class="xp-ax" x="398" y="178" text-anchor="end">' + r.hi.toFixed(0) + ' ' + unit + '</text>';
      if (!m.length) out += '<text class="xp-empty" x="200" y="95" text-anchor="middle">' + T('Press “Draw” to take samples', 'Нажмите «Взять», чтобы брать выборки') + '</text>';
      hist.innerHTML = out;
      var mean = 0, sd = 0, skm = 0;
      for (k = 0; k < m.length; k++) mean += m[k];
      mean = m.length ? mean / m.length : 0;
      for (k = 0; k < m.length; k++) sd += (m[k] - mean) * (m[k] - mean);
      sd = m.length > 1 ? Math.sqrt(sd / (m.length - 1)) : 0;
      var expSkew = sk / Math.sqrt(r.n);
      body.querySelector('[data-v="n"]').textContent = 'n = ' + r.n;
      body.querySelector('[data-a="bell"]').textContent = st.bell ? T('Hide the bell', 'Скрыть колокол') : T('Show the bell', 'Показать колокол');
      body.querySelector('.xp-stats').innerHTML =
        '<span><b>' + m.length + '</b> ' + T('samples', 'выборок') + '</span>' +
        '<span>' + T('spread of the averages', 'разброс средних') + ' <b>' + (m.length > 1 ? sd.toFixed(1) + ' ' + unit : '—') + '</b></span>' +
        '<span>σ / √n = <b>' + r.se.toFixed(1) + ' ' + unit + '</b></span>' +
        '<span>' + T('skew of the averages', 'асимметрия средних') + ' ≈ <b>' + expSkew.toFixed(2) + '</b></span>';
      check({ n: r.n, samples: m.length, sdm: m.length > 1 ? sd : 1e9, se: r.se, skew: expSkew, bell: st.bell ? 1 : 0 }, {});
    }
    function draw(k) {
      var n = ns[st.ni];
      for (var t = 0; t < k; t++) { var s = 0; for (var j = 0; j < n; j++) s += pop[Math.floor(rnd() * P)]; st.means.push(s / n); }
      redraw();
    }
    body.querySelector('input[type=range]').addEventListener('input', function (e) { st.ni = Number(e.target.value); st.means = []; redraw(); });
    body.querySelectorAll('.xp-btn').forEach(function (b) {
      b.onclick = function () {
        var a = b.getAttribute('data-a');
        if (a === 'bell') st.bell = !st.bell;
        else if (a === 'reset') st.means = [];
        else { draw(Number(a)); return; }
        redraw();
      };
    });
    redraw();
    return { redraw: redraw };
  }

  /* ---------- shared by the types below ---------- */
  function rng(a) {   // mulberry32: a small seeded generator, the same draws on every visit
    return function () { a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function binTable(n, p) {   // Bin(n, p): f[k] = P(X = k), c[k] = P(X <= k), cut where the rest is below 1e-13
    var f = [Math.pow(1 - p, n)], c = [f[0]], k;
    for (k = 1; k <= n; k++) { f[k] = f[k - 1] * (n - k + 1) / k * p / (1 - p); c[k] = c[k - 1] + f[k]; if (f[k] < 1e-13 && k > n * p) break; }
    return { f: f, c: c };
  }
  function binDraw(t, u) { var lo = 0, hi = t.c.length - 1; if (u >= t.c[hi]) return hi; while (lo < hi) { var m = (lo + hi) >> 1; if (t.c[m] >= u) hi = m; else lo = m + 1; } return lo; }
  function nb(s) { return String(s).replace(/ /g, '\u00a0'); }   // 13 612 and 2.3 % stay on one line
  function nnum(x) { return nb(num(x)); }
  function npct(x, dp) { return nb(pct(x, dp)); }
  function share(x, dp) { return nb((x * 100).toFixed(dp == null ? (x > 0.99 || x < 0.01 ? 2 : 1) : dp) + ' %'); }
  function seg(key, label, opts, cur) {   // a row of pill buttons, one of them on
    return '<div class="xp-tg" data-g="' + key + '"><span class="xp-tg-l">' + label + '</span>' + opts.map(function (o) {
      return '<button type="button" data-o="' + esc(o[0]) + '" aria-pressed="' + (String(o[0]) === String(cur)) + '"' + (String(o[0]) === String(cur) ? ' class="on"' : '') + '>' + o[1] + '</button>';
    }).join('') + '</div>';
  }
  function segSet(box, key, cur) {
    box.querySelectorAll('.xp-tg[data-g="' + key + '"] button').forEach(function (b) { var on = b.getAttribute('data-o') === String(cur); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  }

  /* ---------- logic: AND, OR, NOT and the brackets, on the 14 000 real applications ---------- */
  function logic(body, g, check) {
    var C = g.counts, PR = g.products, SS = g.statuses, Q = g.conds, per = g.per || 20, s0 = g.start || {}, i, j;
    var st = { not: (s0.not || [0, 0, 0]).slice(), op: (s0.op || ['AND', 'OR']).slice(), br: s0.br || 0 }, total = 0;
    C.forEach(function (r) { r.forEach(function (v) { total += v; }); });
    function join(a, b, o) { return o === 'AND' ? a && b : a || b; }
    function hit(pi, si, s) {
      var v = Q.map(function (c, k) { return (c.p != null ? pi === c.p : si === c.s) !== !!s.not[k]; }), o = s.op;
      if (s.br === 1) return join(join(v[0], v[1], o[0]), v[2], o[1]);
      if (s.br === 2) return join(v[0], join(v[1], v[2], o[1]), o[0]);
      if (o[0] === 'OR' && o[1] === 'AND') return v[0] || (v[1] && v[2]);   // AND binds tighter than OR
      return join(join(v[0], v[1], o[0]), v[2], o[1]);
    }
    function count(s) { var n = 0; for (var a = 0; a < PR.length; a++) for (var b = 0; b < SS.length; b++) if (hit(a, b, s)) n += C[a][b]; return n; }
    function hl(sql) { return esc(sql).replace(/'([^']*)'/g, '<span class="xp-lg-str">\'$1\'</span>').replace(/= (\d+)/g, '= <span class="xp-lg-num">$1</span>'); }
    function cs(k) { return (st.not[k] ? 'NOT ' : '') + Q[k].sql; }
    var L = ['A', 'B', 'C'];
    function brLabel(b) {
      var o = st.op;
      return b === 1 ? '(A ' + o[0] + ' B) ' + o[1] + ' C' : b === 2 ? 'A ' + o[0] + ' (B ' + o[1] + ' C)' : 'A ' + o[0] + ' B ' + o[1] + ' C';
    }
    function chip(k) {
      return '<button type="button" class="xp-lg-not" data-not="' + k + '" aria-pressed="false" title="' + T('NOT turns this condition around', 'NOT переворачивает это условие') + '">NOT</button>' +
        '<span class="xp-lg-c"><i>' + L[k] + '</i>' + hl(Q[k].sql) + '</span>';
    }
    body.innerHTML = '<div class="xp-lg-code" role="group" aria-label="' + T('The query: tap NOT, AND and OR', 'Запрос: нажимайте NOT, AND и OR') + '">' +
      '<div class="xp-lg-line"><span class="xp-lg-kw">SELECT</span> <span class="xp-lg-fn">COUNT</span>(*) <span class="xp-lg-kw">FROM</span> applications</div>' +
      '<div class="xp-lg-line xp-lg-where"><span class="xp-lg-kw">WHERE</span>' +
      '<span class="xp-lg-br" data-br="1o">(</span>' + chip(0) +
      '<button type="button" class="xp-lg-op" data-op="0"></button>' +
      '<span class="xp-lg-br" data-br="2o">(</span>' + chip(1) + '<span class="xp-lg-br" data-br="1c">)</span>' +
      '<button type="button" class="xp-lg-op" data-op="1"></button>' + chip(2) + '<span class="xp-lg-br" data-br="2c">)</span><span>;</span></div></div>' +
      '<div class="xp-lg-hint">' + T('Tap <b>NOT</b> to turn a condition around, <b>AND</b> / <b>OR</b> to swap them.', 'Нажмите <b>NOT</b>, чтобы перевернуть условие, <b>AND</b> / <b>OR</b> — чтобы поменять их.') + '</div>' +
      '<div class="xp-tg" data-g="br"><span class="xp-tg-l">' + T('Brackets', 'Скобки') + '</span>' + [0, 1, 2].map(function (b) { return '<button type="button" data-o="' + b + '"></button>'; }).join('') + '</div>' +
      '<div class="xp-lg-read"></div>' +
      '<div class="xp-big"><span class="xp-big-k">' + T('Applications that match, of ' + nnum(total), 'Подходящих заявок из ' + nnum(total)) + '</span><span class="xp-big-v"></span></div>' +
      '<div class="xp-lg-dots" role="img"></div>' +
      '<div class="xp-legend">' + SS.map(function (s, k) { return '<span class="xl-s' + k + '">' + esc(s) + '</span>'; }).join('') + '<span class="xl-off">' + T('faded: does not match', 'бледные: не подходят') + '</span></div>' +
      '<div class="xp-say"></div><div class="xp-note">' + T('Each dot ≈ ' + per + ' applications (rounded in each group); every count in the text is exact.', 'Каждая точка ≈ ' + per + ' заявок (округлено в каждой группе); все числа в тексте точные.') + '</div>';
    /* the dots, once: one band per product, coloured by status */
    var svg = body.querySelector('.xp-lg-dots'), out = '';   // a heading in words (it keeps its size on a phone), then the band's dots
    for (i = 0; i < PR.length; i++) {
      var tot = 0, k = 0, dots = '';
      C[i].forEach(function (v) { tot += v; });
      for (j = 0; j < SS.length; j++) {
        dots += '<g class="xp-lg-s' + j + '" data-c="' + i + '-' + j + '">';
        for (var d = 0, nd = Math.round(C[i][j] / per); d < nd; d++, k++) dots += '<circle cx="' + (5 + (k % 40) * 10) + '" cy="' + (5 + Math.floor(k / 40) * 10) + '" r="3.7"/>';
        dots += '</g>';
      }
      out += '<div class="xp-lg-band"><div class="xp-lg-bh"><span>' + (i + 1) + ' · ' + esc(PR[i]) + ' · ' + nnum(tot) + '</span><b data-pm="' + i + '"></b></div>' +
        '<svg viewBox="0 0 400 ' + Math.ceil(k / 40) * 10 + '" aria-hidden="true">' + dots + '</svg></div>';
    }
    svg.innerHTML = out;
    function who(ps) {
      var nm = function (a) { return PR[a]; };
      if (ps.length === PR.length) return T('every product', 'все продукты');
      if (ps.length === PR.length - 1) { for (var a = 0; a < PR.length; a++) if (ps.indexOf(a) < 0) return T('every product but ', 'все продукты, кроме ') + PR[a]; }
      return ps.map(nm).join(', ');
    }
    function redraw() {
      var o = st.op, n = count(st), plain = count({ not: st.not, op: o, br: 0 });
      body.querySelectorAll('.xp-lg-not').forEach(function (b) { var k = Number(b.getAttribute('data-not')); b.classList.toggle('on', !!st.not[k]); b.setAttribute('aria-pressed', !!st.not[k]); });
      body.querySelectorAll('.xp-lg-op').forEach(function (b) { b.textContent = o[Number(b.getAttribute('data-op'))]; });
      body.querySelectorAll('.xp-lg-br').forEach(function (b) { b.hidden = b.getAttribute('data-br').charAt(0) !== String(st.br); });
      body.querySelectorAll('.xp-tg[data-g="br"] button').forEach(function (b) { b.textContent = brLabel(Number(b.getAttribute('data-o'))); });
      segSet(body, 'br', st.br);
      var read = '';
      if (!st.br && o[0] !== o[1]) {
        read = T('No brackets, so <b>AND goes first</b>. The database reads it as ', 'Скобок нет, поэтому <b>AND выполняется первым</b>. База читает это как ') + '<code>' +
          esc(o[0] === 'AND' ? '(' + cs(0) + ' AND ' + cs(1) + ') OR ' + cs(2) : cs(0) + ' OR (' + cs(1) + ' AND ' + cs(2) + ')') + '</code>';
      } else if (st.br && o[0] !== o[1]) {
        read = n === plain ? T('Brackets where AND would go first anyway: the same rows as with no brackets.', 'Скобки там, где AND и так выполнился бы первым: те же строки, что и без скобок.')
          : T('The brackets change the order: without them it would be ' + nnum(plain) + '.', 'Скобки меняют порядок: без них было бы ' + nnum(plain) + '.');
      } else read = T('Both joins are ' + o[0] + ', so the order does not matter here.', 'Оба соединения — ' + o[0] + ', поэтому порядок здесь не важен.');
      body.querySelector('.xp-lg-read').innerHTML = read;
      body.querySelector('.xp-big-v').textContent = nnum(n);
      var parts = [];
      for (var a = 0; a < PR.length; a++) {
        var pm = 0;
        for (var b = 0; b < SS.length; b++) {
          var h = hit(a, b, st);
          svg.querySelector('[data-c="' + a + '-' + b + '"]').classList.toggle('off', !h);
          if (h) pm += C[a][b];
        }
        svg.querySelector('[data-pm="' + a + '"]').textContent = T(nnum(pm) + ' match', 'подходят ' + nnum(pm));
      }
      for (b = 0; b < SS.length; b++) {
        var ps = [], sum = 0;
        for (a = 0; a < PR.length; a++) if (hit(a, b, st)) { ps.push(a); sum += C[a][b]; }
        if (ps.length) parts.push('<b>' + nnum(sum) + '</b> <code>' + esc(SS[b]) + '</code> (' + who(ps) + ')');
      }
      body.querySelector('.xp-say').innerHTML = n ? T('<b>' + nnum(n) + '</b> applications match: ', 'Подходящих заявок — <b>' + nnum(n) + '</b>: ') + parts.join(' + ') + '.'
        : T('No application matches: a row has one status, so it cannot be both <code>approved</code> and <code>approved_not_disbursed</code>.', 'Не подходит ни одна заявка: у строки один статус, она не может быть сразу <code>approved</code> и <code>approved_not_disbursed</code>.');
      check({ n: n, br: st.br, nots: st.not[0] + st.not[1] + st.not[2] }, {});
    }
    body.querySelectorAll('.xp-lg-not').forEach(function (b) { b.onclick = function () { var k = Number(b.getAttribute('data-not')); st.not[k] = st.not[k] ? 0 : 1; redraw(); }; });
    body.querySelectorAll('.xp-lg-op').forEach(function (b) { b.onclick = function () { var k = Number(b.getAttribute('data-op')); st.op[k] = st.op[k] === 'AND' ? 'OR' : 'AND'; redraw(); }; });
    body.querySelectorAll('.xp-tg[data-g="br"] button').forEach(function (b) { b.onclick = function () { st.br = Number(b.getAttribute('data-o')); redraw(); }; });
    redraw();
    return { redraw: redraw };
  }

  /* ---------- binomial: FPDs in a batch of n loans ---------- */
  function binomial(body, g, check) {
    var p = g.p || 91 / 7099, s0 = g.start || {}, R = rng(400);
    var st = { n: s0.n || 400, k: s0.k || 7, xs: [], exact: false }, tab, X;
    function prep() { tab = binTable(st.n, p); X = Math.max(12, Math.ceil(st.n * p + 4.5 * Math.sqrt(st.n * p * (1 - p)))); }
    function tail(k) { return k <= 0 ? 1 : 1 - (tab.c[Math.min(k - 1, tab.c.length - 1)]); }
    prep();
    body.innerHTML = '<div class="xp-ctrl">' + slider(T('Loans in the batch (n)', 'Кредитов в партии (n)'), 'n', 50, 2000, 50, st.n, '') +
      slider(T('Alarm: ring at this many FPDs or more', 'Тревога: звонить, если FPD столько или больше'), 'k', 1, X, 1, st.k, '') + '</div>' +
      '<div class="xp-btns"><button type="button" class="xp-btn" data-a="1">' + T('Run 1 batch', 'Выдать 1 партию') + '</button>' +
      '<button type="button" class="xp-btn" data-a="100">' + T('Run 100 batches', 'Выдать 100 партий') + '</button>' +
      '<button type="button" class="xp-btn xp-ghost" data-a="exact"></button>' +
      '<button type="button" class="xp-btn xp-ghost" data-a="reset">' + T('Start again', 'Сначала') + '</button></div>' +
      '<div class="xp-big"><span class="xp-big-k">' + T('FPDs to expect in one batch: n · p, give or take one sd', 'Сколько FPD ждать в одной партии: n · p, плюс-минус одно sd') + '</span><span class="xp-big-v"></span></div>' +
      '<div class="xp-mini-k">' + T('Your batches: how many had 0, 1, 2 … FPDs (orange: at or over the alarm)', 'Ваши партии: сколько из них дали 0, 1, 2 … FPD (оранжевые: тревога)') + '</div>' +
      '<svg class="xp-hist xp-bn" viewBox="0 0 400 192"></svg><div class="xp-stats"></div><div class="xp-say"></div>' +
      '<div class="xp-note">' + T('Each loan defaults on its first payment with p = 91 / 7 099 = ' + npct(p, 2) + ', independently of the others.', 'Каждый кредит уходит в FPD с вероятностью p = 91 / 7 099 = ' + npct(p, 2) + ', независимо от остальных.') + '</div>';
    var svg = body.querySelector('svg'), kIn = body.querySelector('[data-k="k"]');
    function redraw() {
      var n = st.n, mean = n * p, sd = Math.sqrt(n * p * (1 - p)), B = X + 1, w = 400 / B, h = new Array(B).fill(0), m = st.xs.length, i, sum = 0, ss = 0, over = 0;
      for (i = 0; i < m; i++) { h[Math.min(X, st.xs[i])]++; sum += st.xs[i]; if (st.xs[i] >= st.k) over++; }
      var avg = m ? sum / m : 0;
      for (i = 0; i < m; i++) ss += (st.xs[i] - avg) * (st.xs[i] - avg);
      function ex(i) { return i < X ? (tab.f[i] || 0) : tail(X); }
      var top = 0.05;
      for (i = 0; i < B; i++) top = Math.max(top, m ? h[i] / m : 0, st.exact ? ex(i) : 0);
      top *= 1.08;
      var o = '';
      for (i = 0; i < B; i++) {
        var hh = m ? h[i] / m / top * 146 : 0;
        o += '<rect class="' + (i >= st.k ? 'xp-bn-tail' : '') + '" x="' + (i * w + 0.6).toFixed(1) + '" y="' + (160 - hh).toFixed(1) + '" width="' + (w - 1.2).toFixed(1) + '" height="' + hh.toFixed(1) + '"/>';
      }
      if (st.exact) for (i = 0; i < B; i++) { var he = ex(i) / top * 146; o += '<rect class="xp-bn-ex" x="' + (i * w + 2).toFixed(1) + '" y="' + (160 - he).toFixed(1) + '" width="' + (w - 4).toFixed(1) + '" height="' + he.toFixed(1) + '"/>'; }
      var xa = st.k * w;
      o += '<line class="xp-bn-alarm" x1="' + xa + '" x2="' + xa + '" y1="6" y2="162"/><text class="xp-ax xp-bn-al" x="' + (xa + (xa > 330 ? -4 : 4)) + '" y="14"' + (xa > 330 ? ' text-anchor="end"' : '') + '>' + T('alarm ', 'тревога ') + st.k + '+</text>';
      var every = B <= 20 ? 1 : B <= 40 ? 5 : 10;
      for (i = 0; i < B; i++) if (i % every === 0 || i === X) o += '<text class="xp-ax" x="' + ((i + 0.5) * w).toFixed(1) + '" y="174" text-anchor="middle">' + i + (i === X ? '+' : '') + '</text>';
      o += '<text class="xp-ax" x="200" y="188" text-anchor="middle">' + T('FPDs in a batch of ' + nnum(n), 'FPD в партии из ' + nnum(n)) + '</text>';
      if (!m) o += '<text class="xp-empty" x="200" y="88" text-anchor="middle">' + T('Press “Run” to lend a batch', 'Нажмите «Выдать», чтобы выдать партию') + '</text>';
      svg.innerHTML = o;
      var tl = tail(st.k), tp = tail(st.k - 1), tls = share(tl, tl < 0.1 ? 2 : 1), oneIn = tl >= 0.5 ? T('more than half of all months', 'больше половины месяцев') : T('about 1 month in ' + Math.max(1, Math.round(1 / tl)), 'примерно 1 месяц из ' + Math.max(1, Math.round(1 / tl)));
      body.querySelector('[data-v="n"]').textContent = 'n = ' + nnum(n);
      body.querySelector('[data-v="k"]').textContent = st.k + '+';
      body.querySelector('[data-a="exact"]').textContent = st.exact ? T('Hide the exact bars', 'Скрыть точные столбцы') : T('Show the exact bars', 'Показать точные столбцы');
      body.querySelector('.xp-big-v').textContent = mean.toFixed(2) + ' ± ' + sd.toFixed(2);
      body.querySelector('.xp-stats').innerHTML = '<span>' + T('<b>' + nnum(m) + '</b> batches', 'партий: <b>' + nnum(m) + '</b>') + '</span>' +
        '<span>' + T('your average', 'ваше среднее') + ' <b>' + (m ? avg.toFixed(2) : '—') + '</b></span>' +
        '<span>' + T('your sd', 'ваше sd') + ' <b>' + (m > 1 ? Math.sqrt(ss / (m - 1)).toFixed(2) : '—') + '</b></span>' +
        '<span>' + st.k + '+ ' + T('exact', 'точно') + ' <b>' + tls + '</b></span>';
      body.querySelector('.xp-say').innerHTML = T('Alarm at <b>' + st.k + ' or more</b> FPDs: the exact binomial rings in <b>' + tls + '</b> of months — ' + oneIn + '.',
        'Тревога при <b>' + st.k + ' и больше</b> FPD: по точному биномиальному она звенит в <b>' + tls + '</b> месяцев — ' + oneIn + '.') +
        (m ? T(' Your batches: <b>' + nnum(over) + '</b> of ' + nnum(m) + ' (' + npct(over / m, 1) + ').', ' Ваши партии: <b>' + nnum(over) + '</b> из ' + nnum(m) + ' (' + npct(over / m, 1) + ').') : '');
      check({ n: n, batches: m, avg: m ? avg : -1, avgErr: m ? Math.abs(avg - mean) : 1e9, sd: sd, k: st.k, tail: tl, tailPrev: tp, exact: st.exact ? 1 : 0 }, {});
    }
    body.querySelectorAll('input[type=range]').forEach(function (r) {
      r.addEventListener('input', function () {
        var key = r.getAttribute('data-k');
        st[key] = Number(r.value);
        if (key === 'n') { st.xs = []; prep(); kIn.max = X; if (st.k > X) { st.k = X; } kIn.value = st.k; }
        redraw();
      });
    });
    body.querySelectorAll('.xp-btn').forEach(function (b) {
      b.onclick = function () {
        var a = b.getAttribute('data-a');
        if (a === 'exact') st.exact = !st.exact;
        else if (a === 'reset') st.xs = [];
        else for (var t = 0, c = Number(a); t < c; t++) st.xs.push(binDraw(tab, R()));
        redraw();
      };
    });
    redraw();
    return { redraw: redraw };
  }

  /* ---------- normal: shares under the credit-score bell ---------- */
  function Phi(z) {   // the standard normal's cdf (Abramowitz and Stegun 7.1.26, error under 1.5e-7)
    var x = Math.abs(z) / Math.SQRT2, t = 1 / (1 + 0.3275911 * x);
    var e = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return 0.5 * (1 + (z < 0 ? -e : e));
  }
  function normal(body, g, check) {
    var mu = g.mu, sd = g.sd, from = g.from, H = g.counts, s0 = g.start || {}, X0 = g.x0 || 420, X1 = g.x1 || 900, N = 0, i, cum = [0];
    for (i = 0; i < H.length; i++) { N += H[i]; cum.push(N); }
    function upto(x) { var i = Math.floor(x) - from + 1; return i <= 0 ? 0 : cum[Math.min(i, H.length)]; }   // scores <= x
    var st = { mode: s0.mode || 'band', k: s0.k == null ? 1 : s0.k, cut: s0.cut || 540 };
    function px(x) { return (Math.max(X0, Math.min(X1, x)) - X0) / (X1 - X0) * 400; }
    function pdf(x) { return Math.exp(-0.5 * Math.pow((x - mu) / sd, 2)) / (sd * Math.sqrt(2 * Math.PI)); }
    body.innerHTML = seg('mode', T('Look at', 'Смотрим на'), [['band', T('a band around the mean', 'полосу вокруг среднего')], ['cut', T('a cut-off score', 'порог скора')]], st.mode) +
      '<div class="xp-ctrl"><div data-m="band">' + slider(T('Band: the mean ± k sd', 'Полоса: среднее ± k sd'), 'k', 0, 3, 0.01, st.k, '') + '</div>' +
      '<div data-m="cut">' + slider(T('Cut-off score', 'Порог скора'), 'cut', 450, 870, 5, st.cut, '') + '</div></div>' +
      '<div class="xp-big"><span class="xp-big-k"></span><span class="xp-big-v"></span></div>' +
      '<svg class="xp-nm" viewBox="0 0 400 186" role="img"></svg><div class="xp-say"></div>' +
      '<div class="xp-note">' + T('Bars: the ' + nnum(N) + ' scored applicants (388 have no score). Line: the normal bell with their mean ' + mu + ' and sd ' + sd + '.', 'Столбцы: ' + nnum(N) + ' заявителей со скором (у 388 скора нет). Линия: нормальный колокол с их средним ' + mu + ' и sd ' + sd + '.') + '</div>';
    var svg = body.querySelector('svg'), bars = '', top = pdf(mu), b;
    for (b = X0; b < X1; b += 10) { var c = upto(b + 9) - upto(b - 1); top = Math.max(top, c / N / 10); }
    top *= 1.1;
    function yy(d) { return 150 - d / top * 140; }
    for (b = X0; b < X1; b += 10) { var cc = upto(b + 9) - upto(b - 1); if (cc) bars += '<rect x="' + (px(b) + 0.4).toFixed(1) + '" y="' + yy(cc / N / 10).toFixed(1) + '" width="' + (400 / (X1 - X0) * 10 - 0.8).toFixed(1) + '" height="' + (150 - yy(cc / N / 10)).toFixed(1) + '"/>'; }
    var bell = '';
    for (i = 0; i <= 120; i++) { var x = X0 + (X1 - X0) * i / 120; bell += (i ? 'L' : 'M') + px(x).toFixed(1) + ' ' + yy(pdf(x)).toFixed(1); }
    var ticks = '';
    for (i = -3; i <= 3; i++) {
      var tx = px(mu + i * sd);
      ticks += '<line class="xp-nm-tick" x1="' + tx.toFixed(1) + '" x2="' + tx.toFixed(1) + '" y1="150" y2="154"/><text class="xp-ax" x="' + tx.toFixed(1) + '" y="165" text-anchor="middle">' + Math.round(mu + i * sd) + '</text>' +
        '<text class="xp-ax xp-nm-sd" x="' + tx.toFixed(1) + '" y="180" text-anchor="middle">' + (i ? (i > 0 ? '+' : '−') + Math.abs(i) + ' sd' : T('mean', 'среднее')) + '</text>';
    }
    function area(a, z) {   // the region under the bell from a to z
      a = Math.max(X0, a); z = Math.min(X1, z);
      if (z <= a) return '';
      var d = 'M' + px(a).toFixed(1) + ' 150', steps = Math.max(2, Math.ceil((z - a) / 4));
      for (var s = 0; s <= steps; s++) { var x = a + (z - a) * s / steps; d += 'L' + px(x).toFixed(1) + ' ' + yy(pdf(x)).toFixed(1); }
      return '<path class="xp-nm-area" d="' + d + 'L' + px(z).toFixed(1) + ' 150Z"/>';
    }
    function edge(x, label, anchor) { var ex = px(x).toFixed(1); return '<line class="xp-nm-edge" x1="' + ex + '" x2="' + ex + '" y1="8" y2="150"/><text class="xp-ax xp-nm-el" x="' + (Number(ex) + (anchor === 'end' ? -3 : 3)) + '" y="16" text-anchor="' + anchor + '">' + label + '</text>'; }
    function redraw() {
      var o = '<g class="xp-nm-bars">' + bars + '</g>', sentence, kv, key, val;
      body.querySelectorAll('[data-m]').forEach(function (d) { d.hidden = d.getAttribute('data-m') !== st.mode; });
      segSet(body, 'mode', st.mode);
      var inside = 2 * Phi(st.k) - 1, a = mu - st.k * sd, z = mu + st.k * sd, below = Phi((st.cut - mu) / sd);
      var dIn = (upto(z) - upto(Math.ceil(a) - 1)) / N, dBelow = upto(st.cut - 1) / N;
      body.querySelector('[data-v="k"]').textContent = '± ' + st.k.toFixed(2) + ' sd';
      body.querySelector('[data-v="cut"]').textContent = st.cut;
      if (st.mode === 'band') {
        o += '<g class="xp-nm-band">' + area(a, z) + '</g><path class="xp-nm-bell" d="' + bell + '"/>' + ticks + (st.k > 0 ? edge(a, Math.round(a), 'end') + edge(z, Math.round(z), 'start') : '');
        key = T('Inside the band, by the bell', 'Внутри полосы, по колоколу'); val = share(inside);
        sentence = T('Scores <b>' + Math.round(a) + '</b> to <b>' + Math.round(z) + '</b> (the mean ± ' + st.k.toFixed(2) + ' sd): the bell holds <b>' + share(inside) + '</b>, the ' + nnum(N) + ' real applicants <b>' + share(dIn) + '</b>. ' +
          'Outside: <b>' + share(1 - inside) + '</b>, half on each side (' + share((1 - inside) / 2) + ' below, ' + share((1 - inside) / 2) + ' above).',
          'Скоры от <b>' + Math.round(a) + '</b> до <b>' + Math.round(z) + '</b> (среднее ± ' + st.k.toFixed(2) + ' sd): колокол вмещает <b>' + share(inside) + '</b>, ' + nnum(N) + ' настоящих заявителей — <b>' + share(dIn) + '</b>. ' +
          'Снаружи: <b>' + share(1 - inside) + '</b>, поровну с каждой стороны (' + share((1 - inside) / 2) + ' ниже, ' + share((1 - inside) / 2) + ' выше).');
      } else {
        var zc = (st.cut - mu) / sd;
        o += '<g class="xp-nm-cut">' + area(X0, st.cut) + '</g><path class="xp-nm-bell" d="' + bell + '"/>' + ticks + edge(st.cut, st.cut, px(st.cut) > 300 ? 'end' : 'start');
        key = T('Below the cut-off, by the bell', 'Ниже порога, по колоколу'); val = share(below);
        sentence = T('Below <b>' + st.cut + '</b> (' + (zc < 0 ? '−' : '+') + Math.abs(zc).toFixed(2) + ' sd): the bell <b>' + share(below) + '</b>, the real applicants <b>' + share(dBelow) + '</b> (' + nnum(dBelow * N) + ' people). Above it: <b>' + share(1 - below) + '</b>.',
          'Ниже <b>' + st.cut + '</b> (' + (zc < 0 ? '−' : '+') + Math.abs(zc).toFixed(2) + ' sd): колокол — <b>' + share(below) + '</b>, настоящие заявители — <b>' + share(dBelow) + '</b> (заявителей: ' + nnum(dBelow * N) + '). Выше: <b>' + share(1 - below) + '</b>.');
      }
      svg.innerHTML = o;
      body.querySelector('.xp-big-k').textContent = key;
      body.querySelector('.xp-big-v').textContent = val;
      body.querySelector('.xp-say').innerHTML = sentence;
      check({ k: st.k, inside: inside, cut: st.cut, below: below, band: st.mode === 'band' ? 1 : 0 }, {});
    }
    body.querySelectorAll('input[type=range]').forEach(function (r) { r.addEventListener('input', function () { st[r.getAttribute('data-k')] = Number(r.value); redraw(); }); });
    body.querySelectorAll('.xp-tg[data-g="mode"] button').forEach(function (b) { b.onclick = function () { st.mode = b.getAttribute('data-o'); redraw(); }; });
    redraw();
    return { redraw: redraw };
  }

  /* ---------- median: one loan pulls the mean, hardly the median ---------- */
  function median(body, g, check) {
    var L = g.loans.slice().sort(function (a, b) { return a[0] - b[0]; }), n = L.length, s0 = g.start || {}, unit = g.unit || 'm';
    var LO = 0.3, HI = g.max || 600, STEPS = 300;
    function amtAt(pos) { return Math.round(LO * Math.pow(HI / LO, pos / STEPS) * 100) / 100; }
    function posOf(a) { return Math.max(0, Math.min(STEPS, Math.round(Math.log(a / LO) / Math.log(HI / LO) * STEPS))); }
    function stats(v) {
      var s = v.slice().sort(function (a, b) { return a - b; }), m = 0;
      v.forEach(function (x) { m += x; });
      return { mean: m / v.length, med: s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2 };
    }
    function fm(v) { return nb((v >= 100 ? num(v) : v.toFixed(2)) + ' ' + unit); }
    var base = stats(L.map(function (l) { return l[0]; })), st = { sel: s0.sel == null ? n - 1 : s0.sel };
    st.val = L[st.sel][0];
    body.innerHTML = '<div class="xp-md-pick"><button type="button" class="xp-md-nav" data-a="prev" aria-label="' + T('Previous loan', 'Предыдущий кредит') + '">‹</button>' +
      '<span class="xp-md-which"></span><button type="button" class="xp-md-nav" data-a="next" aria-label="' + T('Next loan', 'Следующий кредит') + '">›</button>' +
      '<button type="button" class="xp-btn xp-ghost" data-a="back">' + T('Put it back', 'Вернуть как было') + '</button></div>' +
      '<div class="xp-ctrl">' + slider(T('Its amount (drag: small to huge)', 'Его сумма (тяните: от маленькой до огромной)'), 'a', 0, STEPS, 1, posOf(st.val), '') + '</div>' +
      '<div class="xp-big"><span class="xp-big-k">' + T('The mean is this many times the median', 'Среднее больше медианы во столько раз') + '</span><span class="xp-big-v"></span></div>' +
      '<svg class="xp-md" viewBox="0 0 400 143" role="img"></svg>' +
      '<div class="xp-stats"></div><div class="xp-say"></div><div class="xp-note">' + fmtText(g.label || '') + ' ' + T('Each dot is one loan; tap a dot to pick it. One loan moves at a time.', 'Каждая точка — один кредит; нажмите на точку, чтобы выбрать его. Двигается один кредит за раз.') + '</div>';
    var svg = body.querySelector('svg'), rIn = body.querySelector('input[type=range]'), bw = 0;
    window.addEventListener('resize', function () { bw = 0; });
    function pick(j) { st.sel = (j + n) % n; st.val = L[st.sel][0]; rIn.value = posOf(st.val); redraw(); }
    function redraw() {
      var v = L.map(function (l, i) { return i === st.sel ? st.val : l[0]; }), s = stats(v), mx = Math.max.apply(null, v) * 1.06, i;
      if (!bw) bw = body.clientWidth;   // read once (a read forces the whole page's layout), again after a resize
      var W = bw && bw < 440 ? 300 : 400;
      svg.setAttribute('viewBox', '0 0 ' + W + ' 143');
      var raw = mx / 5, e = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10)), f = raw / e;   // a round step, about five of them
      var step = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].filter(function (c) { return c >= f - 1e-9; })[0] * e, xmax = Math.ceil(mx / step - 1e-9) * step;
      function x(a) { return 14 + a / xmax * (W - 28); }
      var order = v.map(function (a, i) { return i; }).sort(function (a, b) { return v[a] - v[b]; }), last = [], lev = [], top = 0;
      order.forEach(function (i) { var xi = x(v[i]), l = 0; while (last[l] != null && xi - last[l] < 11) l++; last[l] = xi; lev[i] = l; top = Math.max(top, l); });
      var pitch = top > 4 ? 44 / top : 11, o = '<line class="xp-md-axis" x1="8" x2="' + (W - 8) + '" y1="96" y2="96"/>';
      var nt = Math.round(xmax / step);
      for (i = 0; i <= nt; i++) { var tv = step * i, tx = x(tv).toFixed(1); o += '<line class="xp-md-tick" x1="' + tx + '" x2="' + tx + '" y1="96" y2="100"/><text class="xp-ax" x="' + tx + '" y="139" text-anchor="' + (i === 0 ? 'start' : i === nt ? 'end' : 'middle') + '">' + (tv >= 100 ? nnum(tv) : +tv.toFixed(2)) + (i === nt ? nb(' ' + unit) : '') + '</text>'; }
      var xm = x(s.mean), xd = x(s.med);
      o += '<line class="xp-md-mean" x1="' + xm.toFixed(1) + '" x2="' + xm.toFixed(1) + '" y1="26" y2="100"/><line class="xp-md-med" x1="' + xd.toFixed(1) + '" x2="' + xd.toFixed(1) + '" y1="24" y2="96"/>';
      for (i = 0; i < n; i++) {
        var cy = 86 - lev[i] * pitch;
        o += '<circle class="xp-md-dot' + (i === st.sel ? ' on' : '') + '" cx="' + x(v[i]).toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="5.5"/><circle class="xp-md-hit" data-i="' + i + '" cx="' + x(v[i]).toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="11"><title>' + esc(L[i][1]) + ' · ' + fm(v[i]) + '</title></circle>';
      }
      function lab(xx, tip, dy, ty, cls, t) {   // a triangle pointing at the line, and its name beside it
        var an = xx < 70 ? 'start' : xx > W - 70 ? 'end' : 'middle';
        return '<path class="' + cls + '" d="M' + xx.toFixed(1) + ' ' + tip + 'l-5 ' + dy + 'h10z"/><text class="xp-md-lab ' + cls + '-t" x="' + (an === 'start' ? Math.max(2, xx - 6) : an === 'end' ? Math.min(W - 2, xx + 6) : xx).toFixed(1) + '" y="' + ty + '" text-anchor="' + an + '">' + t + '</text>';
      }
      o += lab(xd, 24, -7, 12, 'xp-md-medm', T('median ', 'медиана ') + fm(s.med)) + lab(xm, 100, 7, 121, 'xp-md-meanm', T('mean ', 'среднее ') + fm(s.mean));
      svg.innerHTML = o;
      svg.querySelectorAll('.xp-md-hit').forEach(function (c) { c.onclick = function () { pick(Number(c.getAttribute('data-i'))); }; });
      var orig = L[st.sel][0], moved = Math.abs(st.val - orig) > 1e-9, ratio = s.mean / s.med, medMove = Math.abs(s.med - base.med);
      body.querySelector('.xp-md-which').innerHTML = T('Loan ' + (st.sel + 1) + ' of ' + n, 'Кредит ' + (st.sel + 1) + ' из ' + n) + ' · ' + esc(L[st.sel][1]) + ' · <b>' + fm(st.val) + '</b>';
      body.querySelector('[data-v="a"]').textContent = fm(st.val);
      body.querySelector('.xp-big-v').textContent = ratio.toFixed(2) + '×';
      body.querySelector('.xp-stats').innerHTML = '<span>' + T('mean', 'среднее') + ' <b>' + fm(s.mean) + '</b></span><span>' + T('median', 'медиана') + ' <b>' + fm(s.med) + '</b></span>';
      var say;
      if (!moved) say = T('The real loans: mean <b>' + fm(s.mean) + '</b>, median <b>' + fm(s.med) + '</b> (the ' + ((n + 1) / 2) + 'th of ' + n + ' in line). Drag the amount and watch the two markers.',
        'Настоящие кредиты: среднее <b>' + fm(s.mean) + '</b>, медиана <b>' + fm(s.med) + '</b> (' + ((n + 1) / 2) + '-й из ' + n + ' по порядку). Потяните сумму и следите за двумя метками.');
      else say = T('Loan ' + (st.sel + 1) + ' was ' + fm(orig) + ', now <b>' + fm(st.val) + '</b>. The mean goes from ' + fm(base.mean) + ' to <b>' + fm(s.mean) + '</b>: every soum of the change is shared by all ' + n + ' loans. ',
        'Кредит ' + (st.sel + 1) + ' был ' + fm(orig) + ', теперь <b>' + fm(st.val) + '</b>. Среднее идёт от ' + fm(base.mean) + ' к <b>' + fm(s.mean) + '</b>: каждый сум изменения делится на все ' + n + ' кредитов. ') +
        (medMove < 1e-9 ? T('The median stays at <b>' + fm(s.med) + '</b> — still the same loan in the middle of the line.', 'Медиана стоит на <b>' + fm(s.med) + '</b> — в середине ряда всё тот же кредит.')
          : T('The median moves from ' + fm(base.med) + ' to <b>' + fm(s.med) + '</b> — only as far as the next loan in line, however far you push.', 'Медиана сдвигается с ' + fm(base.med) + ' на <b>' + fm(s.med) + '</b> — только до соседнего кредита в ряду, как далеко ни тяните.'));
      body.querySelector('.xp-say').innerHTML = say;
      check({ ratio: ratio, meanX: s.mean / base.mean, medMove: medMove, moved: moved ? 1 : 0, val: st.val }, {});
    }
    rIn.addEventListener('input', function () { st.val = amtAt(Number(rIn.value)); redraw(); });
    body.querySelectorAll('[data-a]').forEach(function (b) {
      b.onclick = function () { var a = b.getAttribute('data-a'); if (a === 'prev') pick(st.sel - 1); else if (a === 'next') pick(st.sel + 1); else pick(st.sel); };
    });
    redraw();
    return { redraw: redraw };
  }

  /* ---------- intervals: 100 samples, 100 intervals — how many catch the true rate ---------- */
  var ZS = { 80: 1.2815516, 90: 1.6448536, 95: 1.959964, 99: 2.5758293 };
  function ivl(k, n, z, wald) {
    var ph = k / n;
    if (wald) { var h = z * Math.sqrt(ph * (1 - ph) / n); return [ph - h, ph + h]; }
    var den = 1 + z * z / n, c = (ph + z * z / (2 * n)) / den, hw = z * Math.sqrt(ph * (1 - ph) / n + z * z / (4 * n * n)) / den;
    return [c - hw, c + hw];
  }
  function intervals(body, g, check) {
    var p = g.p || 91 / 7099, ns = g.ns || [50, 100, 200, 400, 800, 1600, 3200], s0 = g.start || {}, R = rng(2026), tabs = {};
    var st = { ni: Math.max(0, ns.indexOf(s0.n || 400)), conf: s0.conf || 95, wald: s0.wald ? 1 : 0, rows: [], drawn: 0, miss: 0, wsum: 0 };
    function tab(n) { return tabs[n] || (tabs[n] = binTable(n, p)); }
    function exact(n) {   // the method's own catch rate and average width, from the binomial
      var t = tab(n), cov = 0, w = 0, z = ZS[st.conf];
      for (var k = 0; k < t.f.length; k++) { var iv = ivl(k, n, z, st.wald); if (iv[0] <= p && p <= iv[1]) cov += t.f[k]; w += t.f[k] * (iv[1] - iv[0]); }
      return { cov: cov, w: w };
    }
    var ref = ns.indexOf(400) >= 0 ? 400 : ns[0];
    body.innerHTML = '<div class="xp-ctrl">' + slider(T('Loans in each sample (n)', 'Кредитов в каждой выборке (n)'), 'n', 0, ns.length - 1, 1, st.ni, '') + '</div>' +
      seg('conf', T('Confidence level', 'Уровень доверия'), [[80, '80 %'], [90, '90 %'], [95, '95 %'], [99, '99 %']], st.conf) +
      seg('wald', T('Interval', 'Интервал'), [[0, T('Wilson — the page’s choice', 'Уилсона — выбор этой страницы')], [1, T('Wald — the textbook one', 'Вальда — из учебника')]], st.wald) +
      '<div class="xp-btns"><button type="button" class="xp-btn" data-a="1">' + T('Draw 1 sample', 'Взять 1 выборку') + '</button>' +
      '<button type="button" class="xp-btn" data-a="100">' + T('Draw 100 samples', 'Взять 100 выборок') + '</button>' +
      '<button type="button" class="xp-btn xp-ghost" data-a="reset">' + T('Start again', 'Сначала') + '</button></div>' +
      '<div class="xp-big"><span class="xp-big-k"></span><span class="xp-big-v"></span></div>' +
      '<div class="xp-mini-k">' + T('Your last 100 intervals, one line each (red: missed the true rate)', 'Ваши последние 100 интервалов, по линии на каждый (красные: промахнулись)') + '</div>' +
      '<svg class="xp-ci" viewBox="0 0 400 293" role="img"></svg><div class="xp-stats"></div><div class="xp-say"></div>' +
      '<div class="xp-note">' + T('Each sample: n loans, each an FPD with the true p = 91 / 7 099 = ' + npct(p, 2) + '; the interval is built from the sample alone.', 'Каждая выборка: n кредитов, каждый уходит в FPD с истинной p = 91 / 7 099 = ' + npct(p, 2) + '; интервал строится только по выборке.') + '</div>';
    var svg = body.querySelector('svg');
    function reset() { st.rows = []; st.drawn = 0; st.miss = 0; st.wsum = 0; }
    function redraw() {
      var n = ns[st.ni], se = Math.sqrt(p * (1 - p) / n), a = -1.5 * se, b = p + 5.2 * se, i, ex = exact(n), exRef = exact(ref);
      function x(v) { return Math.max(0, Math.min(400, (v - a) / (b - a) * 400)); }
      var o = '', rows = st.rows, zeros = 0, hits = 0;
      if (a < 0) o += '<line class="xp-ci-zero" x1="' + x(0).toFixed(1) + '" x2="' + x(0).toFixed(1) + '" y1="2" y2="256"/>';
      for (i = 0; i < rows.length; i++) {
        var r = rows[i], y = (6 + i * 2.5).toFixed(1), cls = r.hit ? 'xp-ci-hit' : 'xp-ci-miss';
        if (r.hit) hits++;
        if (r.hi - r.lo < 1e-12) { zeros++; o += '<circle class="' + cls + '" cx="' + x(r.lo).toFixed(1) + '" cy="' + y + '" r="1.5"/>'; }
        else o += '<line class="' + cls + '" x1="' + x(r.lo).toFixed(1) + '" x2="' + x(r.hi).toFixed(1) + '" y1="' + y + '" y2="' + y + '"/>';
      }
      var xt = x(p).toFixed(1);
      o += '<line class="xp-ci-true" x1="' + xt + '" x2="' + xt + '" y1="0" y2="258"/><line class="xp-md-axis" x1="0" x2="400" y1="258" y2="258"/>';
      var span = (b - a) * 100, step = [0.25, 0.5, 1, 2, 5].filter(function (s) { return span / s <= 6; })[0] || 5;
      for (var t = Math.ceil(a * 100 / step) * step; t <= b * 100 + 1e-9; t += step) {
        var tx = x(t / 100).toFixed(1);
        o += '<line class="xp-md-tick" x1="' + tx + '" x2="' + tx + '" y1="258" y2="262"/><text class="xp-ax" x="' + tx + '" y="273" text-anchor="middle">' + (+t.toFixed(2)) + ' %</text>';
      }
      o += '<text class="xp-ax xp-ci-tl" x="' + (Number(xt) + 4) + '" y="289">' + T('true rate ', 'истинная доля ') + npct(p, 2) + '</text>';
      if (!rows.length) o += '<text class="xp-empty" x="200" y="120" text-anchor="middle">' + T('Press “Draw” to take samples', 'Нажмите «Взять», чтобы брать выборки') + '</text>';
      svg.innerHTML = o;
      segSet(body, 'conf', st.conf); segSet(body, 'wald', st.wald);
      body.querySelector('[data-v="n"]').textContent = 'n = ' + nnum(n);
      var missS = st.drawn ? st.miss / st.drawn : -1, avgW = st.drawn ? st.wsum / st.drawn : 0;
      body.querySelector('.xp-big-k').textContent = T('Intervals that missed the true ' + npct(p, 2) + ' (the method allows ' + (100 - st.conf) + ' %)', 'Интервалов, промахнувшихся мимо истинных ' + npct(p, 2) + ' (метод допускает ' + (100 - st.conf) + ' %)');
      body.querySelector('.xp-big-v').textContent = st.drawn ? share(missS, 1) : '—';
      body.querySelector('.xp-stats').innerHTML = '<span>' + T('<b>' + nnum(st.drawn) + '</b> intervals', 'интервалов: <b>' + nnum(st.drawn) + '</b>') + '</span><span>' + T('missed <b>' + nnum(st.miss) + '</b>', 'промахов: <b>' + nnum(st.miss) + '</b>') + '</span>' +
        '<span>' + T('average width', 'средняя ширина') + ' <b>' + (st.drawn ? (avgW * 100).toFixed(2) + T(' points', ' п.') : '—') + '</b></span>' +
        '<span>' + T('true catch rate of this method', 'настоящая доля попаданий метода') + ' <b>' + npct(ex.cov, 1) + '</b></span>';
      body.querySelector('.xp-say').innerHTML = rows.length ? T('Of the last ' + rows.length + ', <b>' + hits + '</b> catch the true rate and <b>' + (rows.length - hits) + '</b> miss.', 'Из последних ' + rows.length + ' истинную долю ловят <b>' + hits + '</b>, промахиваются <b>' + (rows.length - hits) + '</b>.') +
        (zeros ? T(' ' + zeros + ' are a single dot at 0 %: a sample with no FPD gives Wald a width of zero.', ' ' + zeros + ' — просто точка на 0 %: выборка без FPD даёт интервалу Вальда нулевую ширину.') : '') +
        (st.drawn ? T(' Average width ' + (avgW * 100).toFixed(2) + ' points; at n = ' + ref + ' this method’s is ' + (exRef.w * 100).toFixed(2) + '.', ' Средняя ширина ' + (avgW * 100).toFixed(2) + ' п.; при n = ' + ref + ' у этого метода — ' + (exRef.w * 100).toFixed(2) + '.') : '')
        : T('Each sample gives one interval. Will it hold the true rate?', 'Каждая выборка даёт один интервал. Попадёт ли в него истинная доля?');
      check({ n: n, conf: st.conf, wald: st.wald, drawn: st.drawn, missShare: missS, wratio: st.drawn ? avgW / exRef.w : -1, cover: ex.cov }, {});
    }
    body.querySelector('input[type=range]').addEventListener('input', function (e) { st.ni = Number(e.target.value); reset(); redraw(); });
    body.querySelectorAll('.xp-tg button').forEach(function (bt) {
      bt.onclick = function () { var gk = bt.parentNode.getAttribute('data-g'); st[gk] = Number(bt.getAttribute('data-o')); reset(); redraw(); };
    });
    body.querySelectorAll('.xp-btn').forEach(function (bt) {
      bt.onclick = function () {
        var act = bt.getAttribute('data-a');
        if (act === 'reset') reset();
        else {
          var n = ns[st.ni], t = tab(n), z = ZS[st.conf];
          for (var c = 0, m = Number(act); c < m; c++) {
            var k = binDraw(t, R()), iv = ivl(k, n, z, st.wald), hit = iv[0] <= p && p <= iv[1];
            st.rows.push({ lo: iv[0], hi: iv[1], hit: hit });
            st.drawn++; if (!hit) st.miss++; st.wsum += iv[1] - iv[0];
          }
          if (st.rows.length > 100) st.rows = st.rows.slice(-100);
        }
        redraw();
      };
    });
    redraw();
    return { redraw: redraw };
  }

  var TYPES = { bayes: bayes, clt: clt, logic: logic, binomial: binomial, normal: normal, median: median, intervals: intervals };
  /* more types can live in other files (explore2.js): they add themselves to ALExplore.types and share these helpers */
  window.ALExplore = { types: TYPES, slider: slider, T: T, esc: esc, fmtText: fmtText, pct: pct, num: num };
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(function () {
      document.querySelectorAll('.markdown-section pre[data-lang="explore"]').forEach(mount);
    });
  });
})();
