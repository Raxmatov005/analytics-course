/* Explorers: maths you can touch (the founder, 2026-10-29: "make the logic and probability part interactive, so the
learner can play with the information and learn it in a fun way, not by watching videos and solving equations").

A ```explore JSON block becomes a small playground in three steps:
  1. Predict — a question first ("when the rule flags someone, how likely is fraud?"); her guess is kept.
  2. Play    — sliders and buttons move the numbers, and the picture and the live read-out follow at once.
  3. Challenges — small goals ("make most flags real fraud by moving only the false-positive rate"); each one
     ticks itself the moment the playground meets it. All ticked = the explorer is done.

  {"id": "w06d1-x1", "type": "bayes", "title": "…", "predict": {"q": "…", "options": ["…"], "answer": 2, "why": "…"},
   "start": {…the type's own starting values…}, "challenges": [{"id": "c1", "text": "…", "when": {…}}]}

Types (each draws its own playground and reports its numbers to the challenges):
  bayes — 10 000 applicants as a grid of 1 000 dots (each dot = 10 people); sliders: base rate, sensitivity,
          false-positive rate; numbers: ppv (P(fraud | flag)), base, sens, fpr, flags, tp, fp.
  clt   — a skewed population ("pop": values, e.g. 500 quantiles of the real loan amounts); a sample-size step
          ("ns") and Draw buttons build the histogram of sample means; "Show the bell" lays N(μ, σ/√n) over it;
          numbers: n, samples, sdm (sd of the means), se (σ/√n), skew (≈ population skew / √n), bell.
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

  var TYPES = { bayes: bayes, clt: clt };
  window.ALExplore = { types: TYPES };
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(function () {
      document.querySelectorAll('.markdown-section pre[data-lang="explore"]').forEach(mount);
    });
  });
})();
