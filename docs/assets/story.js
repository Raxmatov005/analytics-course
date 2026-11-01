/* Stories: maths told one small step at a time (the founder, 2026-11-01: "explanations should be much more clearer …
interaction things should be improved and try to find something even new").

A ```story JSON block becomes a card that tells one idea in short steps. A step is one or two sentences, and the
picture above it changes with every step, so each sentence points at something she can see. A step can ask a small
question (the picture answers it), offer buttons that run the picture (draw balls, run months), and grow the formula
strip under the picture piece by piece, coloured like the parts of the picture they stand for.
"▶ Play as a video" turns the story into a short film: the browser's own voice reads each step in the page's language,
the picture's first button presses itself, and the film waits at a question until she answers.

  {"id": "w06d1-s1", "title": "…", "min": 4, "steps": [
    {"say": "…", "show": {"kind": "bag", …}, "f": "…", "fs": "…",
     "act": [{"label": "Draw 10", "do": "draw", "n": 10, "rep": 3}],
     "ask": {"q": "…", "options": ["…"], "answer": 1, "why": "…"}}]}

Text (say, f, ask): **bold**, `code`, {o|words} in a picture colour (o orange = FPD / fraud, g green = paid,
b blue = group A / the count of loans, p purple = average / spread, y amber = the result, m grey), and [[word|meaning]]
— a dotted word she taps to read its meaning. "show" is merged onto the previous steps' picture, so a step names only
what changes; a new "kind" starts a fresh picture; "reset": true clears what the buttons built. "f" stays until a later
step changes it ("" removes it); "fs" is how the voice reads it. The film presses the step's button number "film"
(default the first) "rep" times.

Pictures:
  dots   — people or loans: "groups" [[count, fill, tag, ring colour?], …] fill the grid in order; "blocks" [8, 12] split
           it into side-by-side groups with "labels"; "cols"; "scatter": a seed that shuffles the places (the same on
           every visit); "fade" [tags] greys those out; "box" [tags] draws a dashed frame round them; "legend"
           [[fill, words], …]. act "roll" (p): every dot becomes orange with chance p, the rest "base" — one month.
  bag    — a jar: "balls" [[fill, count], …], "hit" (the colour counted, default o); act "draw" n takes a ball, notes its
           colour and puts it back; "line": the running share after each draw on a log scale, with the true share.
  months — a count per month (dist "binom": n loans, chance p) or per hour (dist "pois": rate lam); act "run" n adds that
           many to the bars; "mean" marks the expected count, "alarm" k colours "k or more", "exact" lays the formula's
           bars on top as outlines; "words" {unit, thing, axis} name them in the page's language.
  line   — values on a see-saw ("vals", "unit", "max"); "mark" [mean, median, spread, dist]; "drag": the index she may
           drag (or nudge with act {do: "nudge", i, by}); "pull" [i, value] puts it there.
  bell   — the normal curve ("mu", "sd", "lo", "hi"); "band" k shades ± k sd with its share; "cut" [a, b] shades the
           share between; act "drop" n drops simulated people as dots under it.

Done: the card is an "al-block" and turns "al-done" when she presses Finish on the last step (sections.js counts it).
State: localStorage "al.v1" → story[id] = {at, ans: {step: option}, done, doneOn}; sync.js keeps it with her sign-in. */
(function () {
  var KEY = 'al.v1';
  function T(en, ru) { return window.ALLang ? window.ALLang.t(en, ru) : en; }
  function isRu() { return !!(window.ALLang && window.ALLang.isRu()); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(s) {
    return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '<button type="button" class="sy-w" data-m="$2">$1</button>')
      .replace(/\{([ogbpym])\|([^}]+)\}/g, '<span class="sy-c sy-c-$1">$2</span>');
  }
  /* what the voice reads: no markup, 7 099 as one number, signs as words */
  function plain(s) {
    var ru = isRu();
    return String(s || '').replace(/\[\[([^|\]]+)\|[^\]]+\]\]/g, '$1').replace(/\{[a-z]\|([^}]+)\}/g, '$1').replace(/\*\*|`/g, '')
      .replace(/(\d)[   ](?=\d{3}\b)/g, '$1').replace(/÷/g, ru ? ' разделить на ' : ' divided by ')
      .replace(/×/g, ru ? ' умножить на ' : ' times ').replace(/−/g, ru ? ' минус ' : ' minus ').replace(/≈/g, ru ? ' примерно ' : ' about ')
      .replace(/±/g, ru ? ' плюс-минус ' : ' plus or minus ').replace(/→|·/g, ', ').replace(/\|/g, ru ? ' при условии ' : ' given ');
  }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function stateOf(id) { return ((load().story || {})[id]) || {}; }
  function saveState(id, rec) {   // read fresh right before writing: other engines share al.v1
    try { var s = load(); s.story = s.story || {}; s.story[id] = rec; localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private mode: the card still works */ }
  }
  function dec(x, dp) { var s = x.toFixed(dp); return isRu() ? s.replace('.', ',') : s; }
  function pc(x, dp) { return dec(x * 100, dp == null ? (x < 0.1 ? 1 : 0) : dp) + ' %'; }
  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function Phi(z) {   // the standard normal's cdf (Abramowitz and Stegun 7.1.26)
    var t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2);
    return z >= 0 ? (1 + y) / 2 : (1 - y) / 2;
  }
  function svg(w, h, inner) { return '<svg class="sy-svg" viewBox="0 0 ' + w + ' ' + h + '" style="max-width:' + w + 'px" role="img">' + inner + '</svg>'; }
  function txt(x, y, s, cls, anchor) { return '<text class="' + (cls || 'sy-ax') + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '"' + (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + esc(s) + '</text>'; }

  /* ---------- dots: people or loans ---------- */
  function dots(host, info) {
    var o = {}, key = '', place = [], cell = 0, W = 0, H = 0, circles = null, rolled = null;
    function build(n) {
      var blocks = o.blocks || [n], gap = 1, x0 = 0, cols = [];
      blocks.forEach(function (b, i) { cols[i] = o.cols && blocks.length === 1 ? o.cols : (o.bcols ? o.bcols[i] : Math.ceil(Math.sqrt(b * 1.6))); });
      var units = cols.reduce(function (a, c) { return a + c; }, 0) + gap * (blocks.length - 1);
      var rows = Math.max.apply(null, blocks.map(function (b, i) { return Math.ceil(b / cols[i]); }));
      cell = Math.min(46, 480 / units); W = units * cell; var top = o.labels ? 20 : 0; H = rows * cell + top;
      place = []; var labels = '';
      blocks.forEach(function (b, i) {
        for (var j = 0; j < b; j++) place.push([x0 + (j % cols[i] + 0.5) * cell, top + (Math.floor(j / cols[i]) + 0.5) * cell]);
        if (o.labels) labels += txt(x0 + cols[i] * cell / 2, 14, o.labels[i] || '', 'sy-ax sy-lab', 'middle');
        x0 += (cols[i] + gap) * cell;
      });
      var order = place.map(function (p, i) { return i; });
      if (o.scatter) { var b0 = 0; (o.blocks || [n]).forEach(function (b) { var R = rng(o.scatter + b0); for (var i = b0 + b - 1; i > b0; i--) { var j = b0 + Math.floor(R() * (i - b0 + 1)), t = order[i]; order[i] = order[j]; order[j] = t; } b0 += b; }); }
      place = order.map(function (i) { return place[i]; });
      var r = cell * (n > 400 ? 0.4 : 0.36), s = '';
      for (var i = 0; i < n; i++) s += '<circle class="sy-dot" cx="' + place[i][0].toFixed(1) + '" cy="' + place[i][1].toFixed(1) + '" r="' + r.toFixed(1) + '"/>';
      host.innerHTML = svg(W, H, labels + '<g class="sy-boxes"></g>' + s);
      circles = host.querySelectorAll('.sy-dot');
    }
    function paint() {
      var n = 0, k = 0, tags = [];
      (o.groups || []).forEach(function (g) { n += g[0]; });
      var nk = n + ':' + JSON.stringify(o.blocks || 0) + ':' + (o.cols || 0) + ':' + (o.scatter || 0) + ':' + JSON.stringify(o.labels || 0);
      if (nk !== key) { key = nk; build(n); rolled = null; }
      (o.groups || []).forEach(function (g) {
        for (var j = 0; j < g[0]; j++, k++) {
          var fill = rolled ? (rolled[k] ? 'o' : (o.base || g[1])) : g[1];
          circles[k].setAttribute('class', 'sy-dot sy-f-' + fill + (g[3] ? ' sy-r-' + g[3] : '') + ((o.fade || []).indexOf(g[2]) >= 0 ? ' sy-fade' : ''));
          tags[k] = g[2];
        }
      });
      var boxes = '';
      (o.box || []).forEach(function (tag) {   // one dashed frame per row the tag occupies
        var rows = {};
        tags.forEach(function (t, i) { if (t !== tag) return; var y = place[i][1].toFixed(0), r = rows[y] || (rows[y] = [1e9, -1e9]); r[0] = Math.min(r[0], place[i][0]); r[1] = Math.max(r[1], place[i][0]); });
        Object.keys(rows).forEach(function (y) { var r = rows[y], h = cell / 2; boxes += '<rect class="sy-box" x="' + (r[0] - h + 1).toFixed(1) + '" y="' + (Number(y) - h + 1).toFixed(1) + '" width="' + (r[1] - r[0] + cell - 2).toFixed(1) + '" height="' + (cell - 2).toFixed(1) + '" rx="' + (cell / 3).toFixed(1) + '"/>'; });
      });
      host.querySelector('.sy-boxes').innerHTML = boxes;
      var lg = (o.legend || []).map(function (l) { return '<span class="sy-lg"><i class="sy-f-' + l[0] + '"></i>' + fmt(l[1]) + '</span>'; }).join('');
      info.innerHTML = (lg ? '<div class="sy-legend">' + lg + '</div>' : '') + (rolled ? '<div class="sy-read">' + fmt((o.rollSay || T('This month: {o|%k} of %n loans had an FPD.', 'В этом месяце: {o|%k} из %n займов с FPD.')).replace('%k', rolled.k).replace('%n', rolled.length)) + '</div>' : '');
    }
    return {
      set: function (nx) { if (nx.reset) rolled = null; o = nx; paint(); },
      act: function (a) {
        if (a.do !== 'roll') return;
        var n = circles.length, k = 0; rolled = [];
        for (var i = 0; i < n; i++) { rolled[i] = Math.random() < a.p; if (rolled[i]) k++; }
        rolled.k = k; paint();
      }
    };
  }

  /* ---------- bag: a jar of balls ---------- */
  function bag(host, info) {
    var o = {}, key = '', jar = [], draws = [], hits = 0, run = [], last = -1;
    function paint() {
      var n = jar.length, cols = n <= 10 ? 4 : 5, s = '', hit = o.hit || 'o';
      s += '<path class="sy-jar" d="M24 34 h132 v4 q-6 4 -6 12 v128 q0 16 -16 16 h-88 q-16 0 -16 -16 v-128 q0 -8 -6 -12 z"/>';
      jar.forEach(function (c, i) {
        var x = 52 + (i % cols) * (cols === 4 ? 26 : 21), y = 176 - Math.floor(i / cols) * 26;
        s += '<circle class="sy-ball sy-f-' + c + (i === last ? ' sy-picked' : '') + '" cx="' + x + '" cy="' + y + '" r="11"/>';
      });
      var tray = draws.slice(-12);
      s += txt(200, 24, T('Last draws', 'Последние шары'), 'sy-ax sy-lab');
      tray.forEach(function (c, i) { s += '<circle class="sy-ball sy-f-' + c + (i === tray.length - 1 ? ' sy-new' : '') + '" cx="' + (210 + i * 22) + '" cy="44" r="9"/>'; });
      var p = jar.filter(function (c) { return c === hit; }).length / n;
      if (o.line && run.length) {   // the running share on a log scale of draws
        var X0 = 200, X1 = 470, Y0 = 200, Y1 = 78, M = Math.max(10, Math.pow(10, Math.ceil(Math.log(run.length) / Math.LN10))), top = Math.max(0.5, p * 2.2);
        function px(i) { return X0 + Math.log(i) / Math.log(M) * (X1 - X0); }
        function py(v) { return Y0 - Math.min(v, top) / top * (Y0 - Y1); }
        s += '<line class="sy-axl" x1="' + X0 + '" x2="' + X1 + '" y1="' + Y0 + '" y2="' + Y0 + '"/>';
        for (var d = 1; d <= M; d *= 10) s += txt(px(d), Y0 + 14, String(d), 'sy-ax', 'middle');
        s += txt(X1, Y0 + 28, T('draws', 'шаров вынуто'), 'sy-ax', 'end');
        s += '<line class="sy-target" x1="' + X0 + '" x2="' + X1 + '" y1="' + py(p) + '" y2="' + py(p) + '"/>' + txt(X1, py(p) - 5, T('true share ', 'истинная доля ') + pc(p), 'sy-ax sy-tg', 'end');
        var pts = [], step = Math.max(1, Math.floor(run.length / 300));
        for (var i = 0; i < run.length; i += step) pts.push(px(i + 1).toFixed(1) + ',' + py(run[i]).toFixed(1));
        pts.push(px(run.length).toFixed(1) + ',' + py(run[run.length - 1]).toFixed(1));
        s += '<polyline class="sy-run" points="' + pts.join(' ') + '"/>';
      }
      host.innerHTML = svg(480, 214, s);
      var w = o.words || {};
      info.innerHTML = '<div class="sy-read">' + (draws.length ? fmt(T('Draws: **%d** · {o|%w}: **%h** · share **%s**', 'Вынуто: **%d** · {o|%w}: **%h** · доля **%s**')
        .replace('%d', draws.length).replace('%w', w.hit || T('orange', 'оранжевых')).replace('%h', hits).replace('%s', pc(hits / draws.length, 1))) : esc(T('No draws yet.', 'Пока ничего не вынуто.'))) + '</div>';
    }
    return {
      set: function (nx) {
        var k = JSON.stringify(nx.balls);
        if (k !== key || nx.reset) { key = k; jar = []; (nx.balls || []).forEach(function (b) { for (var i = 0; i < b[1]; i++) jar.push(b[0]); }); draws = []; hits = 0; run = []; last = -1; }
        o = nx; paint();
      },
      act: function (a) {
        if (a.do !== 'draw') return;
        for (var j = 0; j < (a.n || 1); j++) { last = Math.floor(Math.random() * jar.length); draws.push(jar[last]); if (jar[last] === (o.hit || 'o')) hits++; run.push(hits / draws.length); }
        if (run.length > 20000) run = run.slice(-20000);
        paint();
      }
    };
  }

  /* ---------- months: how many in a month (or an hour) ---------- */
  function months(host, info) {
    var o = {}, key = '', cnt = [], total = 0, sum = 0, f = [], c = [], last = -1;
    function prep() {
      f = []; c = [];
      var mean = o.dist === 'pois' ? o.lam : o.n * o.p, sd = Math.sqrt(o.dist === 'pois' ? o.lam : o.n * o.p * (1 - o.p)), X = o.xmax || Math.max(6, Math.ceil(mean + 4.5 * sd));
      var q = o.dist === 'pois' ? Math.exp(-o.lam) : Math.pow(1 - o.p, o.n), acc = 0;
      for (var k = 0; k <= X; k++) {
        f[k] = q; acc += q; c[k] = acc;
        q = o.dist === 'pois' ? q * o.lam / (k + 1) : q * (o.n - k) / (k + 1) * o.p / (1 - o.p);
      }
      f[X] += 1 - acc; c[X] = 1;   // the last bar is "X or more"
      o.X = X; o.mu = mean; o.sd = sd;
    }
    function sample() { var u = Math.random(), k = 0; while (k < o.X && c[k] < u) k++; return k; }
    function paint(drop) {
      var X = o.X, w = o.words || {}, L = 34, R = 470, B = 178, Tp = 22, bw = (R - L) / (X + 1), s = '';
      var top = 0; for (var k = 0; k <= X; k++) top = Math.max(top, total ? cnt[k] / total : 0, o.exact || !total ? f[k] : 0);
      top = top * 1.15 || 1;
      function y(v) { return B - v / top * (B - Tp); }
      for (k = 0; k <= X; k++) {
        var x = L + k * bw, hot = o.alarm != null && k >= o.alarm, v = total ? cnt[k] / total : 0;
        if (v) s += '<rect class="sy-bar' + (hot ? ' sy-hot' : '') + '" x="' + (x + 2).toFixed(1) + '" y="' + y(v).toFixed(1) + '" width="' + (bw - 4).toFixed(1) + '" height="' + (B - y(v)).toFixed(1) + '" rx="2"/>';
        if (o.exact) s += '<rect class="sy-ex" x="' + (x + 2).toFixed(1) + '" y="' + y(f[k]).toFixed(1) + '" width="' + (bw - 4).toFixed(1) + '" height="' + (B - y(f[k])).toFixed(1) + '" rx="2"/>';
        if (X <= 16 || k % 2 === 0) s += txt(x + bw / 2, B + 14, k === X ? k + '+' : String(k), 'sy-ax', 'middle');
      }
      s += '<line class="sy-axl" x1="' + L + '" x2="' + R + '" y1="' + B + '" y2="' + B + '"/>' + txt(R, B + 30, w.axis || '', 'sy-ax', 'end');
      if (o.mean) { var mx = L + (o.mu + 0.5) * bw; s += '<line class="sy-mean" x1="' + mx.toFixed(1) + '" x2="' + mx.toFixed(1) + '" y1="' + (Tp - 6) + '" y2="' + B + '"/>' + txt(mx + 4, Tp - 8, T('expected ', 'ожидаем ') + dec(o.mu, 1), 'sy-ax sy-pl'); }
      if (o.alarm != null) { var ax = L + o.alarm * bw; s += '<line class="sy-alarm" x1="' + ax.toFixed(1) + '" x2="' + ax.toFixed(1) + '" y1="' + Tp + '" y2="' + B + '"/>' + txt(ax + 4, Tp + 10, T('alarm: ', 'тревога: ') + o.alarm + '+', 'sy-ax sy-or'); }
      if (drop && last >= 0) s += '<circle class="sy-drop sy-f-b" cx="' + (L + (last + 0.5) * bw).toFixed(1) + '" cy="' + (y(cnt[last] / total) - 9).toFixed(1) + '" r="6"/>';
      host.innerHTML = svg(480, 214, s);
      var hot = 0; if (o.alarm != null) for (k = o.alarm; k <= X; k++) hot += cnt[k] || 0;
      var u = w.unit || T('months', 'месяцев'), th = w.thing || T('FPDs', 'FPD');
      info.innerHTML = '<div class="sy-read">' + (total ? fmt(T('%u: **%t** · on average **%a** %th', '%u: **%t** · в среднем **%a** %th').replace('%u', u.charAt(0).toUpperCase() + u.slice(1)).replace('%t', total).replace('%a', dec(sum / total, 1)).replace('%th', th) +
        (o.alarm != null ? T(' · with {o|%k or more}: **%h** (%s)', ' · с {o|%k и больше}: **%h** (%s)').replace('%k', o.alarm).replace('%h', hot).replace('%s', pc(hot / total, 1)) : '')) : esc(T('Nothing run yet.', 'Пока ничего не запущено.'))) + '</div>';
    }
    return {
      set: function (nx) {
        var k = [nx.dist, nx.n, nx.p, nx.lam, nx.xmax].join();
        o = nx; prep();
        if (k !== key || nx.reset) { key = k; cnt = []; for (var i = 0; i <= o.X; i++) cnt[i] = 0; total = 0; sum = 0; last = -1; }
        paint(false);
      },
      act: function (a) {
        if (a.do !== 'run') return;
        for (var j = 0; j < (a.n || 1); j++) { last = sample(); cnt[last]++; total++; sum += last; }
        paint(a.n === 1);
      }
    };
  }

  /* ---------- line: values on a see-saw ---------- */
  function line(host, info) {
    var o = {}, key = '', v = [], dragging = false, svgEl = null;
    var L = 24, R = 456, Y = 120;
    function x(val) { return L + Math.min(val, o.max) / o.max * (R - L); }
    function stats() {
      var n = v.length, m = v.reduce(function (a, b) { return a + b; }, 0) / n, s = v.slice().sort(function (a, b) { return a - b; });
      var med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2, ss = v.reduce(function (a, b) { return a + (b - m) * (b - m); }, 0);
      return { mean: m, med: med, sd: Math.sqrt(ss / (n - 1)) };
    }
    function paint() {
      var st = stats(), mk = o.mark || [], u = o.unit ? ' ' + o.unit : '', s = '', dots = '';
      var seen = {}, lvMax = 1, pos = v.map(function (val) {   // close values stack upwards
        var cx = x(val), slot = Math.round(cx / 14), lv = seen[slot] = (seen[slot] || 0) + 1; lvMax = Math.max(lvMax, lv); return [cx, lv];
      });
      var dy = Math.min(15, 70 / lvMax), top = Y - 8 - (lvMax - 1) * dy;
      pos.forEach(function (p, i) {
        var cy = Y - 8 - (p[1] - 1) * dy;
        if (mk.indexOf('dist') >= 0) dots += '<line class="sy-dist" x1="' + x(st.mean).toFixed(1) + '" x2="' + p[0].toFixed(1) + '" y1="' + cy.toFixed(1) + '" y2="' + cy.toFixed(1) + '"/>';
        dots += '<circle class="sy-dot sy-f-' + (i === o.drag || i === o.hot ? 'o' : 'b') + (i === o.drag ? ' sy-handle' : '') + '" cx="' + p[0].toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + (i === o.drag ? 9 : Math.min(7, dy / 2)).toFixed(1) + '"/>';
      });
      if (mk.indexOf('spread') >= 0) s += '<rect class="sy-band" x="' + x(Math.max(0, st.mean - st.sd)).toFixed(1) + '" y="' + (top - 14).toFixed(1) + '" width="' + (x(st.mean + st.sd) - x(Math.max(0, st.mean - st.sd))).toFixed(1) + '" height="' + (Y - top + 14).toFixed(1) + '" rx="6"/>' +
        txt(x(st.mean + st.sd) + 4, top - 2, '± ' + dec(st.sd, 2) + u, 'sy-ax sy-pl');
      s += '<line class="sy-plank" x1="' + L + '" x2="' + R + '" y1="' + (Y + 5) + '" y2="' + (Y + 5) + '"/>';   // level: the mean is its balance point
      for (var t = 0; t <= o.max; t += o.tick || 5) s += txt(x(t), Y + 46, String(t) + (t + (o.tick || 5) > o.max ? u : ''), 'sy-ax', 'middle');
      if (mk.indexOf('mean') >= 0) s += '<path class="sy-fulcrum" d="M' + x(st.mean).toFixed(1) + ' ' + (Y + 8) + ' l-11 20 h22 z"/>';
      s += dots;
      if (mk.indexOf('median') >= 0) s += '<path class="sy-medmark" d="M' + x(st.med).toFixed(1) + ' ' + (top - 12).toFixed(1) + ' l-7 -12 h14 z"/>' + txt(x(st.med), top - 30, T('middle ', 'середина ') + dec(st.med, 2), 'sy-ax sy-am', 'middle');
      if (mk.indexOf('mean') >= 0) s += txt(x(st.mean), Y + 64, T('average ', 'среднее ') + dec(st.mean, 2), 'sy-ax sy-pl', 'middle');
      host.innerHTML = svg(480, 200, s);
      svgEl = host.querySelector('svg');
      if (o.drag != null) bindDrag();
      var parts = [];
      if (mk.indexOf('mean') >= 0) parts.push(T('average {p|%v}', 'среднее {p|%v}').replace('%v', dec(st.mean, 2) + u));
      if (mk.indexOf('median') >= 0) parts.push(T('middle {y|%v}', 'середина {y|%v}').replace('%v', dec(st.med, 2) + u));
      if (mk.indexOf('spread') >= 0) parts.push(T('typical distance {p|± %v}', 'типичное расстояние {p|± %v}').replace('%v', dec(st.sd, 2) + u));
      if (o.drag != null) parts.push(T('the orange loan: **%v**', 'оранжевый заём: **%v**').replace('%v', dec(v[o.drag], 2) + u));
      info.innerHTML = parts.length ? '<div class="sy-read">' + fmt(parts.join(' · ')) + '</div>' : '';
    }
    function bindDrag() {
      function at(ev) { var r = svgEl.getBoundingClientRect(), sx = (ev.clientX - r.left) / r.width * 480; return Math.max(0, Math.min(o.max, (sx - L) / (R - L) * o.max)); }
      svgEl.onpointerdown = function (ev) { dragging = true; try { svgEl.setPointerCapture(ev.pointerId); } catch (e) { /* old browsers */ } v[o.drag] = Math.round(at(ev) * 100) / 100; paint(); };
      svgEl.onpointermove = function (ev) { if (dragging) { v[o.drag] = Math.round(at(ev) * 100) / 100; paint(); } };
      svgEl.onpointerup = svgEl.onpointercancel = function () { dragging = false; };
      svgEl.style.touchAction = 'none'; svgEl.style.cursor = 'ew-resize';
    }
    return {
      set: function (nx) {
        var k = JSON.stringify(nx.vals);
        if (k !== key || nx.reset) { key = k; v = nx.vals.slice(); }
        o = nx; if (o.pull) v[o.pull[0]] = o.pull[1];
        paint();
      },
      act: function (a) { if (a.do === 'nudge') { v[a.i] = Math.max(0, Math.min(o.max, v[a.i] + a.by)); paint(); } }
    };
  }

  /* ---------- bell: the normal curve ---------- */
  function bell(host, info) {
    var o = {}, key = '', people = [];
    function gauss() { var u = 1 - Math.random(), w = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * w); }
    function paint() {
      var lo = o.lo != null ? o.lo : o.mu - 3.6 * o.sd, hi = o.hi != null ? o.hi : o.mu + 3.6 * o.sd, L = 20, R = 460, B = 168, Tp = 24, s = '';
      function x(v) { return L + (v - lo) / (hi - lo) * (R - L); }
      var binw = o.sd / 4, bins = {}, maxc = 0;
      people.forEach(function (p) { var b = Math.floor((p - lo) / binw); bins[b] = (bins[b] || 0) + 1; maxc = Math.max(maxc, bins[b]); });
      var expMax = people.length * binw / o.sd * 0.3989, stack = Math.max(maxc, expMax, 1), step = (B - Tp) * 0.92 / stack;
      var peak = people.length ? expMax * step : (B - Tp) * 0.92;
      function y(v) { return B - Math.exp(-0.5 * Math.pow((v - o.mu) / o.sd, 2)) * peak; }
      function area(a, b, cls) { var d = 'M' + x(a).toFixed(1) + ' ' + B; for (var i = 0; i <= 40; i++) { var v = a + (b - a) * i / 40; d += ' L' + x(v).toFixed(1) + ' ' + y(v).toFixed(1); } return '<path class="' + cls + '" d="' + d + ' L' + x(b).toFixed(1) + ' ' + B + ' Z"/>'; }
      if (o.band) s += area(o.mu - o.band * o.sd, o.mu + o.band * o.sd, 'sy-area');
      if (o.cut) s += area(o.cut[0], o.cut[1], 'sy-area sy-area-y');
      var r = Math.max(1.6, Math.min(4, step / 2 - 0.3)), dd = '';
      Object.keys(bins).forEach(function (b) { for (var j = 0; j < bins[b]; j++) dd += '<circle class="sy-pp" cx="' + x(lo + (Number(b) + 0.5) * binw).toFixed(1) + '" cy="' + (B - (j + 0.5) * step).toFixed(1) + '" r="' + r.toFixed(1) + '"/>'; });
      s += dd;
      var path = ''; for (var i = 0; i <= 120; i++) { var v = lo + (hi - lo) * i / 120; path += (i ? ' L' : 'M') + x(v).toFixed(1) + ' ' + y(v).toFixed(1); }
      s += '<path class="sy-curve" d="' + path + '"/>';
      s += '<line class="sy-axl" x1="' + L + '" x2="' + R + '" y1="' + B + '" y2="' + B + '"/>';
      for (var k = -3; k <= 3; k++) { var tv = o.mu + k * o.sd; if (tv < lo || tv > hi) continue; s += '<line class="sy-tick" x1="' + x(tv).toFixed(1) + '" x2="' + x(tv).toFixed(1) + '" y1="' + B + '" y2="' + (B + 5) + '"/>' + txt(x(tv), B + 17, String(Math.round(tv)), 'sy-ax', 'middle') + (o.sdTicks ? txt(x(tv), B + 30, k === 0 ? T('average', 'среднее') : (k > 0 ? '+' : '−') + Math.abs(k) + ' sd', 'sy-ax sy-pl', 'middle') : ''); }
      var share = o.band ? Phi(o.band) - Phi(-o.band) : o.cut ? Phi((o.cut[1] - o.mu) / o.sd) - Phi((o.cut[0] - o.mu) / o.sd) : null;
      if (share != null) { var cx = o.band ? x(o.mu) : x((o.cut[0] + o.cut[1]) / 2); s += txt(cx, Tp - 6, pc(share, share > 0.99 ? 1 : 0), 'sy-ax sy-big', 'middle'); }
      host.innerHTML = svg(480, 212, s);
      var inside = 0, a0 = o.band ? o.mu - o.band * o.sd : o.cut ? o.cut[0] : 0, a1 = o.band ? o.mu + o.band * o.sd : o.cut ? o.cut[1] : 0;
      people.forEach(function (p) { if (p >= a0 && p <= a1) inside++; });
      info.innerHTML = '<div class="sy-read">' + (people.length ? fmt(T('People dropped: **%n**', 'Людей: **%n**').replace('%n', people.length) + (share != null ? T(' · in the shaded part: {y|%i} (%s)', ' · в закрашенной части: {y|%i} (%s)').replace('%i', inside).replace('%s', pc(inside / people.length, 1)) : '')) : '') + '</div>';
    }
    return {
      set: function (nx) { var k = [nx.mu, nx.sd].join(); if (k !== key || nx.reset) { key = k; people = []; } o = nx; paint(); },
      act: function (a) { if (a.do === 'drop') { for (var j = 0; j < (a.n || 100); j++) people.push(o.mu + o.sd * gauss()); paint(); } }
    };
  }

  var SCENES = { dots: dots, bag: bag, months: months, line: line, bell: bell };

  /* ---------- the voice ---------- */
  var VOICE = { on: !!window.speechSynthesis, pick: null };
  function voiceFor(ru) {
    if (!VOICE.on) return null;
    var vs = window.speechSynthesis.getVoices() || [], want = ru ? /^ru/i : /^en/i, best = null, score = -1;
    vs.forEach(function (v) {
      if (!want.test(v.lang)) return;
      var sc = (/natural|neural|google|siri|premium|enhanced/i.test(v.name) ? 4 : 0) + (/en-GB|ru-RU/i.test(v.lang) ? 2 : 0) + (v.localService ? 1 : 0);
      if (sc > score) { score = sc; best = v; }
    });
    return best;
  }
  function say(text, done) {
    var words = text.split(/\s+/).length, fallback = setTimeout(done, 1200 + words * 380);
    if (!VOICE.on) return fallback;
    clearTimeout(fallback);
    var ru = isRu(), u = new SpeechSynthesisUtterance(text), v = voiceFor(ru), fired = false;
    function end() { if (!fired) { fired = true; clearTimeout(guard); done(); } }
    u.lang = ru ? 'ru-RU' : 'en-GB'; if (v) u.voice = v; u.rate = ru ? 1 : 0.96;
    u.onend = end; u.onerror = end;
    var guard = setTimeout(end, 4000 + words * 700);   // some browsers never fire onend
    window.speechSynthesis.speak(u);
    return guard;
  }
  function hush() { if (VOICE.on) try { window.speechSynthesis.cancel(); } catch (e) { /* nothing to stop */ } }

  /* ---------- one story card ---------- */
  function mount(pre) {
    var g;
    try { g = JSON.parse((pre.querySelector('code') || pre).textContent); }
    catch (e) { pre.insertAdjacentHTML('beforebegin', '<p class="quiz-error">' + T('This story could not be read', 'Не удалось прочитать историю') + ' (' + esc(e.message) + ').</p>'); return; }
    var steps = g.steps || [], last = steps.length - 1;
    var box = document.createElement('div');
    box.className = 'sy al-block';
    box.setAttribute('data-id', g.id);
    pre.parentNode.replaceChild(box, pre);
    var st = stateOf(g.id); st.ans = st.ans || {};
    var at = st.done ? 0 : Math.min(st.at || 0, last), scene = null, kind = '', shownF = null, playing = false, timer = null, wait = false;
    box.innerHTML =
      '<div class="sy-head"><span class="sy-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H8l-4 4z"/><path d="M8 9h8M8 12h5"/></svg></span>' +
      '<div><div class="sy-kicker">' + T('Step by step', 'Шаг за шагом') + (g.min ? ' · ' + g.min + T(' min', ' мин') : '') + '</div><div class="sy-title">' + esc(g.title) + '</div></div>' +
      '<button type="button" class="sy-play"></button></div>' +
      '<div class="sy-bar-p" aria-hidden="true">' + steps.map(function () { return '<i></i>'; }).join('') + '</div>' +
      '<div class="sy-pic"></div><div class="sy-info"></div><div class="sy-acts"></div>' +
      '<div class="sy-f" hidden></div>' +
      '<div class="sy-say" aria-live="polite"></div><div class="sy-tip" hidden></div>' +
      '<div class="sy-ask" hidden></div>' +
      '<div class="sy-nav"><button type="button" class="sy-back">‹ ' + T('Back', 'Назад') + '</button><span class="sy-count"></span><button type="button" class="sy-next"></button></div>';
    var $ = function (s) { return box.querySelector(s); };
    function optsAt(i) {
      var o = {};
      for (var k = 0; k <= i; k++) {
        var sh = steps[k].show; if (!sh) continue;
        if (sh.kind && sh.kind !== o.kind) o = {};
        for (var p in sh) if (p !== 'reset') o[p] = sh[p];
      }
      o.reset = !!(steps[i].show && steps[i].show.reset);
      return o;
    }
    function formulaAt(i) { for (var k = i; k >= 0; k--) if ('f' in steps[k]) return steps[k].f; return ''; }
    function acts(i) { var a = steps[i].act; return a ? (a.length ? a : [a]) : []; }
    function save() { st.at = at; saveState(g.id, st); }
    function render() {
      var s = steps[at], o = optsAt(at);
      if (o.kind && o.kind !== kind) { kind = o.kind; scene = SCENES[kind]($('.sy-pic'), $('.sy-info')); }
      if (scene) scene.set(o);
      $('.sy-acts').innerHTML = acts(at).map(function (a, j) { return '<button type="button" class="sy-act" data-j="' + j + '">' + fmt(a.label) + '</button>'; }).join('');
      var f = formulaAt(at), fb = $('.sy-f');
      fb.hidden = !f; if (f !== shownF) { fb.innerHTML = fmt(f); fb.classList.remove('sy-new'); void fb.offsetWidth; if (shownF) fb.classList.add('sy-new'); shownF = f; }
      $('.sy-say').innerHTML = fmt(s.say);
      $('.sy-tip').hidden = true;
      var ask = $('.sy-ask');
      if (s.ask) {
        ask.hidden = false;
        ask.innerHTML = '<div class="sy-q">' + fmt(s.ask.q) + '</div><div class="sy-opts">' + s.ask.options.map(function (o2, j) { return '<button type="button" class="sy-opt" data-j="' + j + '">' + fmt(o2) + '</button>'; }).join('') + '</div><div class="sy-verdict"></div>';
        if (st.ans[at] != null) verdict(st.ans[at]);
      } else ask.hidden = true;
      $('.sy-back').style.visibility = at ? 'visible' : 'hidden';
      $('.sy-count').textContent = (at + 1) + ' / ' + steps.length;
      $('.sy-next').textContent = at < last ? T('Next', 'Далее') + ' ›' : (st.done ? T('✓ Done · start again', '✓ Готово · сначала') : T('Finish ✓', 'Готово ✓'));
      $('.sy-next').classList.toggle('sy-go', at === last && !st.done);
      box.querySelectorAll('.sy-bar-p i').forEach(function (b, k) { b.className = k < at ? 'on' : k === at ? 'now' : ''; });
      box.classList.toggle('al-done', !!st.done);
      paintPlay();
    }
    function verdict(j) {
      var a = steps[at].ask, ok = j === a.answer;
      box.querySelectorAll('.sy-opt').forEach(function (b, k) { b.disabled = true; b.classList.toggle('right', k === a.answer); b.classList.toggle('wrong', k === j && !ok); });
      var v = $('.sy-verdict'); v.className = 'sy-verdict ' + (ok ? 'ok' : 'bad');
      v.innerHTML = '<b>' + (ok ? T('✓ Right.', '✓ Верно.') : T('Not quite.', 'Не совсем.')) + '</b> ' + fmt(a.why || '');
    }
    function go(i) { at = Math.max(0, Math.min(last, i)); save(); render(); }
    function finish() {
      if (!st.done) { st.done = 1; st.doneOn = st.doneOn || new Date().toISOString().slice(0, 10); save(); document.dispatchEvent(new CustomEvent('al:change')); }
    }
    /* the film: read the step, press its first button, wait at a question, go on */
    function paintPlay() { var b = $('.sy-play'); b.innerHTML = playing ? '❚❚ ' + T('Pause', 'Пауза') : '▶ ' + T('Play as a video', 'Смотреть как видео'); b.classList.toggle('on', playing); }
    function stop() { playing = false; wait = false; clearTimeout(timer); hush(); box.classList.remove('sy-playing'); paintPlay(); }
    function play() {
      if (!playing) return;
      var s = steps[at];
      box.classList.add('sy-playing');
      timer = say(plain(s.say) + (s.fs ? '. ' + s.fs : ''), function () {
        if (!playing) return;
        var a = acts(at)[s.film || 0], rep = a ? (a.rep || 1) : 0, k = 0;
        (function press() {
          if (!playing) return;
          if (k < rep) { k++; scene && scene.act(a); timer = setTimeout(press, 650); return; }
          if (s.ask && st.ans[at] == null) { wait = true; timer = say(plain(s.ask.q), function () { /* waits for her answer */ }); return; }
          if (at < last) timer = setTimeout(function () { if (playing) { go(at + 1); play(); } }, 700);
          else { finish(); render(); stop(); }
        })();
      });
    }
    $('.sy-play').onclick = function () {
      if (playing) { stop(); return; }
      if (at === last && st.done) go(0);
      playing = true; paintPlay(); play();
    };
    $('.sy-next').onclick = function () {
      stop();
      if (at < last) go(at + 1);
      else if (st.done) go(0);
      else { finish(); render(); }
    };
    $('.sy-back').onclick = function () { stop(); go(at - 1); };
    box.addEventListener('click', function (ev) {
      var w = ev.target.closest('.sy-w'), act = ev.target.closest('.sy-act'), opt = ev.target.closest('.sy-opt');
      if (w) { var tip = $('.sy-tip'), same = !tip.hidden && tip.getAttribute('data-for') === w.textContent; tip.hidden = same; tip.setAttribute('data-for', w.textContent); tip.innerHTML = '<b>' + esc(w.textContent) + '</b> — ' + esc(w.getAttribute('data-m')); }
      if (act && scene) scene.act(acts(at)[Number(act.getAttribute('data-j'))]);
      if (opt && !opt.disabled) {
        var j = Number(opt.getAttribute('data-j'));
        st.ans[at] = j; save(); verdict(j);
        if (playing && wait) { wait = false; var a = steps[at].ask; timer = say((j === a.answer ? T('Right. ', 'Верно. ') : T('Not quite. ', 'Не совсем. ')) + plain(a.why || ''), function () { if (playing) { if (at < last) { go(at + 1); play(); } else { finish(); render(); stop(); } } }); }
      }
    });
    render();
    window.addEventListener('hashchange', stop);
  }

  if (window.speechSynthesis) try { window.speechSynthesis.getVoices(); window.speechSynthesis.onvoiceschanged = function () { /* voices load late in Chrome */ }; } catch (e) { /* no voices */ }
  window.ALStory = { scenes: SCENES, plain: plain };
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(function () { document.querySelectorAll('.markdown-section pre[data-lang="story"]').forEach(mount); });
  });
})();
