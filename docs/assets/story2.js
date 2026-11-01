/* Story pictures for Week 6 Day 2 (samples, the CLT, intervals), added to story.js's registry (window.ALStory.scenes). Loaded right after
story.js; see story.js's header for the block format. A kind is function (host, info) → {set(opts), act(a)}: it draws
into host (an SVG via ALStory.svg) and its read-out into info.

  ivs  — the page's own intervals, one row each, against a reference line (what ci simulates, ivs shows as computed):
         "rows" [[lo, mid, hi, tone], …] (tone "o" orange — a miss or the one to look at, "g" green, "m" grey, "p" purple,
         default blue; lo = mid = hi draws the dot only); "labels" […] the rows' names; "min", "max", "tick", "tdp" the
         axis; "unit"; "dp" the decimals printed at the right ("nums": false hides them); "ref" a value drawn as the green
         line, named by "words" {ref}; "zero": true adds a dashed line at 0; "band" [a, b] shades that stretch;
         "fade" [row indices]; "legend" [[fill, words], …].
  boot — the bootstrap: the sample as chips ("vals"; "flag": true for 0/1 values, drawn orange / green, the statistic
         then a share in %), "stat" "median" (default) or "mean"; act "resample" n draws the sample's size from it with
         replacement, n times, and drops each statistic into the chart (the chips show the last resample: ×2, ×3 above
         the ones picked more than once, the unpicked ones faded); "own": true marks the sample's own statistic; "cut":
         true shades the middle 95 % of the resampled statistics (the percentile interval); "cmp" [a, b] draws another
         interval above the chart, named by "words" {cmp}; "lo", "hi", "bins", "tick", "tdp", "unit", "dp", "cdp" (the
         chips' decimals). */
(function () {
  var S = window.ALStory;
  if (!S) return;
  var T = S.T, fmt = S.fmt, dec = S.dec, txt = S.txt, svg = S.svg, esc = S.esc;

  /* the row tones ivs needs beyond story.css's blue / orange intervals, and the chips' counts, with their dark twins */
  if (!document.getElementById('sy2-style')) {
    var st = document.createElement('style');
    st.id = 'sy2-style';
    st.textContent =
      '.sy .sy-iv.sy-t-g { stroke: #22c55e; } .sy .sy-iv-pt.sy-t-g { fill: #15803d; }' +
      '.sy .sy-iv.sy-t-m { stroke: #94a3b8; } .sy .sy-iv-pt.sy-t-m { fill: #64748b; }' +
      '.sy .sy-iv.sy-t-p { stroke: #a78bfa; } .sy .sy-iv-pt.sy-t-p { fill: #6d28d9; }' +
      '.sy .sy-svg .sy-chip-n { font: 800 11px var(--sans); fill: #6d28d9; }' +
      'html[data-theme="dark"] .sy .sy-iv.sy-t-g { stroke: #4ade80; } html[data-theme="dark"] .sy .sy-iv-pt.sy-t-g { fill: #86efac; }' +
      'html[data-theme="dark"] .sy .sy-iv.sy-t-m { stroke: #64748b; } html[data-theme="dark"] .sy .sy-iv-pt.sy-t-m { fill: #94a3b8; }' +
      'html[data-theme="dark"] .sy .sy-iv.sy-t-p { stroke: #c4b5fd; } html[data-theme="dark"] .sy .sy-iv-pt.sy-t-p { fill: #a78bfa; }' +
      'html[data-theme="dark"] .sy .sy-svg .sy-chip-n { fill: #c4b5fd; }';
    document.head.appendChild(st);
  }
  function legend(o) {
    var lg = (o.legend || []).map(function (l) { return '<span class="sy-lg"><i class="sy-f-' + l[0] + '"></i>' + fmt(l[1]) + '</span>'; }).join('');
    return lg ? '<div class="sy-legend">' + lg + '</div>' : '';
  }
  function label(x0, x1, y, s, cls) {   // a label over the stretch x0..x1 that stays inside the picture near its edges
    var c = (x0 + x1) / 2;
    return c < 130 ? txt(Math.max(4, x0), y, s, cls, 'start') : c > 350 ? txt(Math.min(476, x1), y, s, cls, 'end') : txt(c, y, s, cls, 'middle');
  }
  function ticks(lo, hi, tick, dp, u, x, y) {   // labels at round steps, the unit on the last one
    var s = '', t0 = Math.ceil(lo / tick - 1e-9) * tick;
    for (var t = t0; t <= hi + 1e-9; t += tick) s += txt(x(t), y, dec(Math.abs(t) < 1e-9 ? 0 : t, dp) + (t + tick > hi + 1e-9 ? u : ''), 'sy-ax', 'middle');
    return s;
  }

  /* ---------- ivs: the page's intervals, one row each ---------- */
  function ivs(host, info) {
    var o = {};
    function paint() {
      var rows = o.rows || [], labs = o.labels || [], n = rows.length, lw = o.lw || 124, L = lw + 10, R = o.nums === false ? 466 : 396;
      var rowH = n > 7 ? 19 : 26, Tp = o.ref != null ? 24 : 10, B = Tp + n * rowH + 4, u = o.unit || '', dp = o.dp != null ? o.dp : 2, s = '';
      var lo = o.min, hi = o.max;
      function x(v) { return L + (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * (R - L); }
      if (o.band) s += '<rect class="sy-hband" x="' + x(o.band[0]).toFixed(1) + '" y="' + (Tp - 4) + '" width="' + (x(o.band[1]) - x(o.band[0])).toFixed(1) + '" height="' + (B - Tp + 4) + '"/>';
      if (o.zero) s += '<line class="sy-axl sy-dash" x1="' + x(0).toFixed(1) + '" x2="' + x(0).toFixed(1) + '" y1="' + (Tp - 4) + '" y2="' + B + '"/>';
      if (o.ref != null) s += '<line class="sy-truth" x1="' + x(o.ref).toFixed(1) + '" x2="' + x(o.ref).toFixed(1) + '" y1="' + (Tp - 6) + '" y2="' + B + '"/>' + txt(x(o.ref), Tp - 10, (o.words && o.words.ref) || '', 'sy-ax sy-tg', 'middle');
      rows.forEach(function (r, i) {
        var y = Tp + i * rowH + rowH / 2, tone = r[3] === 'o' ? ' sy-miss' : r[3] ? ' sy-t-' + r[3] : '', dot = r[0] === r[2];
        var g = '<g' + ((o.fade || []).indexOf(i) >= 0 ? ' class="sy-fade"' : '') + '>';
        g += txt(lw, y + 4, labs[i] || '', 'sy-ax sy-lab', 'end');
        if (!dot) g += '<line class="sy-iv' + tone + '" style="stroke-width:' + (n > 7 ? 5 : 7) + 'px" x1="' + x(r[0]).toFixed(1) + '" x2="' + x(r[2]).toFixed(1) + '" y1="' + y + '" y2="' + y + '"/>';
        g += '<circle class="sy-iv-pt' + tone + '" cx="' + x(r[1]).toFixed(1) + '" cy="' + y + '" r="' + (dot ? 6 : 4.5) + '"/>';
        if (o.nums !== false) g += txt(472, y + 4, dot ? dec(r[1], dp) + u : dec(r[0], dp) + '–' + dec(r[2], dp) + u, 'sy-ax', 'end');
        s += g + '</g>';
      });
      s += '<line class="sy-axl" x1="' + L + '" x2="' + R + '" y1="' + B + '" y2="' + B + '"/>';
      s += ticks(lo, hi, o.tick || (hi - lo) / 4, o.tdp != null ? o.tdp : 0, u, x, B + 15);
      host.innerHTML = svg(480, B + 24, s);
      info.innerHTML = legend(o);
    }
    return { set: function (nx) { o = nx; paint(); }, act: function () { /* a still picture */ } };
  }

  /* ---------- boot: resample your own sample ---------- */
  function boot(host, info) {
    var o = {}, key = '', stats = [], pick = null;
    function statOf(xs) {
      if (o.flag || o.stat === 'mean') { var m = 0; xs.forEach(function (v) { m += v; }); return m / xs.length * (o.flag ? 100 : 1); }
      var s = xs.slice().sort(function (a, b) { return a - b; }), n = s.length;
      return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
    }
    function quant(sorted, p) {   // linear, like numpy's default
      var h = (sorted.length - 1) * p, i = Math.floor(h);
      return i + 1 < sorted.length ? sorted[i] + (h - i) * (sorted[i + 1] - sorted[i]) : sorted[i];
    }
    function paint() {
      var v = o.vals || [], n = v.length, u = o.unit || '', dp = o.dp != null ? o.dp : 2, s = '';
      /* the chips: the sample itself */
      var sp = Math.min(42, 440 / Math.max(1, n)), r = Math.min(15, sp * 0.38), cy = 36;
      v.forEach(function (val, i) {
        var cx = 240 - (n - 1) * sp / 2 + i * sp, k = pick ? pick[i] : 1, gone = pick && !k ? ' sy-fade' : '';
        s += '<circle class="sy-dot sy-f-' + (o.flag ? (val ? 'o' : 'g') : 'b') + gone + '" cx="' + cx.toFixed(1) + '" cy="' + cy + '" r="' + r.toFixed(1) + '"/>';
        if (!o.flag) s += txt(cx, cy + r + 13, dec(val, o.cdp != null ? o.cdp : 1), 'sy-ax' + gone, 'middle');
        if (pick && k > 1) s += txt(cx, cy - r - 5, '×' + k, 'sy-chip-n', 'middle');
      });
      /* the chart of the resampled statistics */
      var L = 24, R = 466, Tp = 98, B = 190, lo = o.lo != null ? o.lo : 0, hi = o.hi != null ? o.hi : 1, nb = o.bins || 30, bw = (hi - lo) / nb, cnt = [], N = stats.length, k2;
      function x(val) { return L + (Math.max(lo, Math.min(hi, val)) - lo) / (hi - lo) * (R - L); }
      for (k2 = 0; k2 < nb; k2++) cnt[k2] = 0;
      stats.forEach(function (val) { var i = Math.floor((val - lo) / bw + 1e-9); if (i >= 0 && i < nb) cnt[i]++; });
      var top = Math.max(1, Math.max.apply(null, cnt)) * 1.1, sorted = null, a = 0, b = 0;
      function y(c) { return B - c / top * (B - Tp); }
      if (o.cut && N >= 20) {
        sorted = stats.slice().sort(function (p, q) { return p - q; }); a = quant(sorted, 0.025); b = quant(sorted, 0.975);
        s += '<rect class="sy-hband" x="' + x(a).toFixed(1) + '" y="' + Tp + '" width="' + Math.max(2, x(b) - x(a)).toFixed(1) + '" height="' + (B - Tp) + '"/>';
      }
      for (k2 = 0; k2 < nb; k2++) if (cnt[k2]) s += '<rect class="sy-bar" x="' + (x(lo + k2 * bw) + 1).toFixed(1) + '" y="' + y(cnt[k2]).toFixed(1) + '" width="' + Math.max(1.5, (R - L) / nb - 2).toFixed(1) + '" height="' + (B - y(cnt[k2])).toFixed(1) + '" rx="1.5"/>';
      if (sorted) {
        [a, b].forEach(function (c) { s += '<line class="sy-mean" x1="' + x(c).toFixed(1) + '" x2="' + x(c).toFixed(1) + '" y1="' + (Tp - 4) + '" y2="' + B + '"/>'; });
        s += label(x(a), x(b), Tp - 8, T('middle 95 %: ', 'средние 95 %: ') + dec(a, dp) + '–' + dec(b, dp) + u, 'sy-ax sy-pl');
      }
      var own = statOf(v);
      if (o.own) s += '<line class="sy-target" x1="' + x(own).toFixed(1) + '" x2="' + x(own).toFixed(1) + '" y1="' + (Tp - 18) + '" y2="' + B + '"/>' + txt(x(own) + 4, Tp - 22 + 4, T('your sample ', 'ваша выборка ') + dec(own, dp) + u, 'sy-ax sy-tg');
      if (o.cmp) {
        var cyy = Tp - (sorted ? 26 : 10), c0 = x(o.cmp[0]), c1 = x(o.cmp[1]);
        s += '<line class="sy-truth" x1="' + c0.toFixed(1) + '" x2="' + c1.toFixed(1) + '" y1="' + cyy + '" y2="' + cyy + '"/>' +
          '<line class="sy-truth" x1="' + c0.toFixed(1) + '" x2="' + c0.toFixed(1) + '" y1="' + (cyy - 5) + '" y2="' + (cyy + 5) + '"/>' +
          '<line class="sy-truth" x1="' + c1.toFixed(1) + '" x2="' + c1.toFixed(1) + '" y1="' + (cyy - 5) + '" y2="' + (cyy + 5) + '"/>' +
          label(c0, c1, cyy - 8, (o.words && o.words.cmp) || '', 'sy-ax sy-tg');
      }
      if (N) s += '<path class="sy-lastmk" d="M' + x(stats[N - 1]).toFixed(1) + ' ' + (B + 2) + ' l-6 9 h12 z"/>';
      s += '<line class="sy-axl" x1="' + L + '" x2="' + R + '" y1="' + B + '" y2="' + B + '"/>';
      s += ticks(lo, hi, o.tick || (hi - lo) / 4, o.tdp != null ? o.tdp : 0, u, x, B + 24);
      host.innerHTML = svg(480, B + 32, s);
      var what = o.flag ? T('share', 'доля') : o.stat === 'mean' ? T('average', 'среднее') : T('median', 'медиана');
      var parts = [];
      if (N) {
        parts.push(T('Resamples: **%n**', 'Повторных выборок: **%n**').replace('%n', N));
        parts.push(T('the last one\'s %w: {b|%v}', 'в последней %w: {b|%v}').replace('%w', what).replace('%v', dec(stats[N - 1], dp) + u));
        if (sorted) parts.push(T('middle 95 %: {y|%a – %b}', 'средние 95 %: {y|%a – %b}').replace('%a', dec(a, dp)).replace('%b', dec(b, dp) + u));
      }
      info.innerHTML = legend(o) + '<div class="sy-read">' + (parts.length ? fmt(parts.join(' · ')) : esc(T('No resamples yet.', 'Повторных выборок пока нет.'))) + '</div>';
    }
    return {
      set: function (nx) {
        var k = JSON.stringify([nx.vals, nx.stat, nx.flag]);
        o = nx;
        if (k !== key || nx.reset) { key = k; stats = []; pick = null; }
        paint();
      },
      act: function (a) {
        if (a.do !== 'resample') return;
        var v = o.vals || [], n = v.length;
        if (!n) return;
        for (var j = 0; j < (a.n || 1); j++) {
          var c = [], xs = [], i;
          for (i = 0; i < n; i++) c[i] = 0;
          for (i = 0; i < n; i++) { var t = Math.floor(Math.random() * n); c[t]++; xs.push(v[t]); }
          stats.push(statOf(xs)); pick = c;
        }
        if (stats.length > 20000) stats = stats.slice(-20000);
        paint();
      }
    };
  }

  S.scenes.ivs = ivs;
  S.scenes.boot = boot;
})();
