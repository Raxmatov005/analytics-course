/* Story pictures for Week 6 Day 3 (hypothesis tests), added to story.js's registry (window.ALStory.scenes). Loaded right after
story.js; see story.js's header for the block format. A kind is function (host, info) → {set(opts), act(a)}: it draws
into host (an SVG via ALStory.svg) and its read-out into info.

  luck  — groups of loans and their event rates, and the luck world (H₀: one shared chance for everyone) played one sample
          at a time. "groups" [[k, n], …] (2 or 3; the real counts, orange), "labels" [names], "max" (the rate axis, %);
          "exp" draws the shared rate (all events ÷ all loans) as a dashed line, "expN" also gives each group's expected
          count; act "roll" n plays n luck worlds: every loan of every group rolls the same dice ("p", default the shared
          rate), and blue bars show the last world under the real ones. "strip" lays every world's gap (group 1 − group 2,
          in points) on a line below, one dot each (bars once they pile high); "obs" marks the real gap there and colours
          the worlds as far out or further ("tails" "two" default, "right", "none"); "lo", "hi"; "words" {exp, real, axis,
          world}.
  pairs — the same units measured twice: "vals" [[before, after], …], "labels" [before, after], "max", "tick", "unit";
          without "link" two separate clouds, with it one line per unit (blue down, orange up); "mean" marks each
          column's average; "hot" i rings one unit and names it (words.names[i]); "diff" adds the changes (after − before)
          on their own axis round 0, with their average; "words" {names, change}. */
(function () {
  var S = window.ALStory;
  if (!S) return;
  var T = S.T, dec = S.dec, pc = S.pc, txt = S.txt, fmt = S.fmt;
  if (!document.getElementById('sy3-style')) {
    var st = document.createElement('style'); st.id = 'sy3-style';
    st.textContent = '.sy .sy-svg .sy-bl { fill: #0369a1; font-weight: 700; } .sy .sy-pair-hot { stroke-width: 4.5; }\n' +
      'html[data-theme="dark"] .sy .sy-svg .sy-bl { fill: #7dd3fc; } html[data-theme="dark"] .sy .sy-pair-hot { stroke-width: 4.5; }';
    document.head.appendChild(st);
  }
  function th(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }   // 2 411
  function sgn(v, dp) { var a = Math.abs(v) < Math.pow(10, -dp) / 2 ? 0 : v; return (a > 0 ? '+' : a < 0 ? '−' : '') + dec(Math.abs(a), dp); }
  function niceStep(span) { var c = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50]; for (var i = 0; i < c.length; i++) if (span / c[i] <= 5) return c[i]; return 100; }
  function dpOf(step) { return step >= 1 ? 0 : Math.abs(step * 10 - Math.round(step * 10)) < 1e-9 ? 1 : 2; }
  function line(cls, x1, y1, x2, y2) { return '<line class="' + cls + '" x1="' + x1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y1="' + y1.toFixed(1) + '" y2="' + y2.toFixed(1) + '"/>'; }

  /* ---------- luck: the real rates, and the world where only luck works ---------- */
  S.scenes.luck = function (host, info) {
    var o = {}, key = '', worlds = [], last = null, played = 0;
    function shared() { var K = 0, N = 0; o.groups.forEach(function (g) { K += g[0]; N += g[1]; }); return o.p != null ? o.p : K / N; }
    function realGap() { var g = o.groups; return (g[0][0] / g[0][1] - g[1][0] / g[1][1]) * 100; }
    function se() { var p = shared(), g = o.groups; return Math.sqrt(p * (1 - p) * (1 / g[0][1] + 1 / g[1][1])) * 100; }
    function beyond(v) { var ob = realGap(), t = o.tails || 'two'; return t === 'right' ? v >= ob - 1e-9 : t === 'left' ? v <= ob + 1e-9 : Math.abs(v) >= Math.abs(ob) - 1e-9; }
    function paint() {
      var g = o.groups || [], w = o.words || {}, labels = o.labels || [], two = g.length === 2, s = '';
      var top = o.exp ? 24 : 4, rh = last ? 44 : 28, X0 = 84, LEN = 236;
      var mx = o.max || Math.ceil(Math.max.apply(null, g.map(function (x) { return x[0] / x[1] * 100; }).concat([1])) * 1.25);
      function x(r) { return X0 + Math.min(r, mx) / mx * LEN; }
      g.forEach(function (gr, i) {
        var y = top + i * rh, r = gr[0] / gr[1] * 100;
        s += txt(0, y + 11, labels[i] || '', 'sy-ax sy-lab');
        s += '<rect class="sy-bar sy-hot" x="' + X0 + '" y="' + y + '" width="' + Math.max(1.5, x(r) - X0).toFixed(1) + '" height="13" rx="2"/>';
        s += txt(x(r) + 6, y + 11, th(gr[0]) + ' / ' + th(gr[1]) + ' = ' + dec(r, 2) + ' %', 'sy-ax sy-or');
        if (last) {
          var rl = last[i] / gr[1] * 100;
          s += '<rect class="sy-bar" x="' + X0 + '" y="' + (y + 17) + '" width="' + Math.max(1.5, x(rl) - X0).toFixed(1) + '" height="13" rx="2"/>';
          s += txt(x(rl) + 6, y + 28, th(last[i]) + ' / ' + th(gr[1]) + ' = ' + dec(rl, 2) + ' %', 'sy-ax sy-bl');
        }
      });
      var bottom = top + g.length * rh - 4, H = bottom + 8;
      s += line('sy-axl', X0, top - 2, X0, bottom);
      if (o.exp) {
        var pe = shared() * 100;
        s += line('sy-mean', x(pe), top - 8, x(pe), bottom) + txt(x(pe), top - 12, (w.exp || T('one shared rate', 'одна общая доля')) + ' ' + dec(pe, 2) + ' %', 'sy-ax sy-pl', 'middle');
      }
      if (o.strip && two) {
        var e = se(), ob = realGap(), half = Math.max(4.5 * e, o.obs ? 1.25 * Math.abs(ob) : 0);
        var lo = o.lo != null ? o.lo : -half, hi = o.hi != null ? o.hi : half, L = 24, R = 466, yT = H + 14, yB = yT + 90;
        var sx = function (v) { return L + (v - lo) / (hi - lo) * (R - L); };
        var nb = 48, bw = (hi - lo) / nb, cnt = [], hot = [], k;
        for (k = 0; k < nb; k++) { cnt[k] = 0; hot[k] = 0; }
        worlds.forEach(function (v) { var i = Math.floor((v - lo) / bw); if (i < 0 || i >= nb) return; cnt[i]++; if (o.obs && o.tails !== 'none' && beyond(v)) hot[i]++; });
        var mxc = Math.max.apply(null, cnt.concat([1])), cw = (R - L) / nb, r = Math.min(4, cw / 2 - 0.4), step = Math.min(2 * r + 1, 86 / mxc);
        for (k = 0; k < nb; k++) {
          if (!cnt[k]) continue;
          var cx = sx(lo + (k + 0.5) * bw);
          if (step >= 2.4) {
            for (var j = 0; j < cnt[k]; j++) s += '<circle class="sy-dot ' + (j >= cnt[k] - hot[k] ? 'sy-f-o' : 'sy-f-b') + '" cx="' + cx.toFixed(1) + '" cy="' + (yB - r - 1 - j * step).toFixed(1) + '" r="' + r.toFixed(1) + '"/>';
          } else {
            var hg = cnt[k] / mxc * 86, hh = hot[k] / mxc * 86;
            s += '<rect class="sy-bar" x="' + (cx - cw / 2 + 0.6).toFixed(1) + '" y="' + (yB - hg).toFixed(1) + '" width="' + (cw - 1.2).toFixed(1) + '" height="' + hg.toFixed(1) + '"/>';
            if (hh) s += '<rect class="sy-bar sy-hot" x="' + (cx - cw / 2 + 0.6).toFixed(1) + '" y="' + (yB - hg).toFixed(1) + '" width="' + (cw - 1.2).toFixed(1) + '" height="' + hh.toFixed(1) + '"/>';
          }
        }
        s += line('sy-axl', L, yB, R, yB);
        var tk = niceStep(hi - lo), dp = dpOf(tk);
        for (var tv = Math.ceil(lo / tk - 1e-9) * tk; tv <= hi + 1e-9; tv += tk) s += line('sy-tick', sx(tv), yB, sx(tv), yB + 5) + txt(sx(tv), yB + 17, Math.abs(tv) < 1e-9 ? '0' : sgn(tv, dp), 'sy-ax', 'middle');
        s += txt(R, yB + 31, w.axis || T('gap, points', 'разрыв, пункты'), 'sy-ax', 'end');
        if (worlds.length) s += '<path class="sy-lastmk" d="M' + sx(Math.max(lo, Math.min(hi, worlds[worlds.length - 1]))).toFixed(1) + ' ' + (yB + 21) + ' l-5 8 h10 z"/>';
        if (o.obs) {
          s += line('sy-alarm', sx(ob), yT - 4, sx(ob), yB);
          if ((o.tails || 'two') === 'two') s += line('sy-alarm sy-dash', sx(-ob), yT - 4, sx(-ob), yB);
          s += txt(sx(ob) + (ob >= 0 ? -4 : 4), yT - 8, (w.real || T('real gap', 'реальный разрыв')) + ' ' + sgn(ob, 2), 'sy-ax sy-or', ob >= 0 ? 'end' : 'start');
        }
        H = yB + 40;
      }
      host.innerHTML = S.svg(480, H, s);
      var parts = [], of = T(' of ', ' из '), pts = T(' points', ' пункта');
      function row(cnts, c) { return g.map(function (gr, i) { return (labels[i] || '') + ' {' + c + '|' + th(cnts[i]) + of + th(gr[1]) + ' = ' + dec(cnts[i] / gr[1] * 100, 2) + ' %}'; }).join(' · '); }
      if (!last) {
        parts.push(row(g.map(function (gr) { return gr[0]; }), 'o') + (two ? ' · ' + T('gap', 'разрыв') + ' {o|' + sgn(realGap(), 2) + pts + '}' : ''));
      } else {
        var lg = two ? (last[0] / g[0][1] - last[1] / g[1][1]) * 100 : 0;
        parts.push('**' + (w.world || T('Luck world', 'Мир случая')) + ' #' + played + '**: ' + row(last, 'b') + (two ? ' · ' + T('gap', 'разрыв') + ' {b|' + sgn(lg, 2) + pts + '}' : ''));
      }
      if (o.expN) parts.push(T('expected if the group did not matter: ', 'ожидалось бы, если группа не важна: ') + g.map(function (gr, i) { return (labels[i] || '') + ' {p|' + dec(gr[1] * shared(), 1) + '}'; }).join(' · '));
      if (o.strip && o.obs && two && worlds.length && o.tails !== 'none') {
        var b2 = worlds.filter(beyond).length;
        parts.push(T('worlds with a gap as far out as the real one or further: {o|%k} of %n (%p)', 'миров с разрывом не меньше реального: {o|%k} из %n (%p)').replace('%k', b2).replace('%n', worlds.length).replace('%p', pc(b2 / worlds.length, 1)));
      }
      info.innerHTML = '<div class="sy-read">' + parts.map(fmt).join('<br>') + '</div>';
    }
    return {
      set: function (nx) {
        var k = JSON.stringify([nx.groups, nx.p]);
        o = nx;
        if (k !== key || nx.reset) { key = k; worlds = []; last = null; played = 0; }
        paint();
      },
      act: function (a) {
        if (a.do !== 'roll' || !o.groups) return;
        var p = shared(), g = o.groups;
        for (var j = 0; j < (a.n || 1); j++) {
          last = g.map(function (gr) { return S.binom(gr[1], p); });
          played++;
          if (g.length === 2) worlds.push((last[0] / g[0][1] - last[1] / g[1][1]) * 100);
        }
        if (worlds.length > 5000) worlds = worlds.slice(-5000);
        paint();
      }
    };
  };

  /* ---------- pairs: the same units, measured twice ---------- */
  S.scenes.pairs = function (host, info) {
    var o = {};
    function jit(i) { return ((i * 7) % 10 - 4.5) * 3.4; }
    function paint() {
      var v = o.vals || [], w = o.words || {}, labels = o.labels || ['', ''], u = o.unit || '', mx = o.max || 4, tick = o.tick || 1;
      var B = 196, Tp = 22, XA = 124, XB = 262, XD = 404, sc = (B - Tp) / mx, YM = (B + Tp) / 2, s = '', n = v.length;
      function y(val) { return B - val * sc; }
      s += line('sy-axl', 44, Tp, 44, B);
      for (var t = 0; t <= mx + 1e-9; t += tick) s += line('sy-tick', 39, y(t), 44, y(t)) + txt(35, y(t) + 4, dec(t, 0) + u, 'sy-ax', 'end');
      s += txt(XA, B + 18, labels[0], 'sy-ax sy-lab', 'middle') + txt(XB, B + 18, labels[1], 'sy-ax sy-lab', 'middle');
      var ma = 0, mb = 0, down = 0;
      v.forEach(function (p) { ma += p[0] / n; mb += p[1] / n; if (p[1] < p[0]) down++; });
      if (o.link) v.forEach(function (p, i) { s += line('sy-iv' + (p[1] > p[0] ? ' sy-miss' : '') + (i === o.hot ? ' sy-pair-hot' : ''), XA, y(p[0]), XB, y(p[1])); });
      v.forEach(function (p, i) {
        var ring = i === o.hot ? ' sy-picked' : '', ja = o.link ? 0 : jit(i), jb = o.link ? 0 : jit(i + 3);
        s += '<circle class="sy-dot sy-f-b' + ring + '" cx="' + (XA + ja).toFixed(1) + '" cy="' + y(p[0]).toFixed(1) + '" r="5.5"/>';
        s += '<circle class="sy-dot sy-f-b' + ring + '" cx="' + (XB + jb).toFixed(1) + '" cy="' + y(p[1]).toFixed(1) + '" r="5.5"/>';
      });
      if (o.mean) {
        s += line('sy-mean', XA - 26, y(ma), XA + 26, y(ma)) + txt(XA - 30, y(ma) + 4, dec(ma, 2) + u, 'sy-ax sy-pl', 'end');
        s += line('sy-mean', XB - 26, y(mb), XB + 26, y(mb)) + txt(XB + 30, y(mb) + 4, dec(mb, 2) + u, 'sy-ax sy-pl');
      }
      if (o.hot != null && v[o.hot]) s += txt(XA - 12, y(v[o.hot][0]) + 4, (w.names || [])[o.hot] || '', 'sy-ax sy-or', 'end');
      var md = 0;
      if (o.diff) {
        v.forEach(function (p) { md += (p[1] - p[0]) / n; });
        s += line('sy-target', XD - 52, YM, XD + 52, YM) + txt(XD + 58, YM + 4, '0', 'sy-ax');
        [-1, 1].forEach(function (k) { if (sc < (B - Tp) / 2) s += line('sy-tick', XD + 48, YM - k * sc, XD + 53, YM - k * sc) + txt(XD + 58, YM - k * sc + 4, (k > 0 ? '+' : '−') + '1', 'sy-ax'); });
        v.forEach(function (p, i) {
          var d = p[1] - p[0];
          s += '<circle class="sy-dot ' + (d > 0 ? 'sy-f-o' : 'sy-f-b') + (i === o.hot ? ' sy-picked' : '') + '" cx="' + (XD + jit(i) * 1.3).toFixed(1) + '" cy="' + (YM - d * sc).toFixed(1) + '" r="5"/>';
        });
        s += line('sy-mean', XD - 30, YM - md * sc, XD + 30, YM - md * sc) + txt(XD - 34, YM - md * sc + 4, sgn(md, 2), 'sy-ax sy-pl', 'end');
        s += txt(XD, B + 18, w.change || T('change', 'изменение'), 'sy-ax sy-lab', 'middle');
      }
      host.innerHTML = S.svg(480, B + 26, s);
      var parts = [];
      if (o.mean) parts.push(T('averages: ', 'средние: ') + labels[0] + ' {p|' + dec(ma, 2) + u + '} · ' + labels[1] + ' {p|' + dec(mb, 2) + u + '}');
      if (o.hot != null && v[o.hot]) parts.push(((w.names || [])[o.hot] || '') + ': {o|' + dec(v[o.hot][0], 2) + u + ' → ' + dec(v[o.hot][1], 2) + u + '}');
      if (o.link || o.diff) parts.push(T('{b|%d of %n} went down', '{b|%d из %n} снизились').replace('%d', down).replace('%n', n) + (o.diff ? T(' · the average change {p|%m points}', ' · среднее изменение {p|%m пункта}').replace('%m', sgn(md, 2)) : ''));
      info.innerHTML = parts.length ? '<div class="sy-read">' + parts.map(fmt).join('<br>') + '</div>' : '';
    }
    return {
      set: function (nx) { o = nx; paint(); },
      act: function () { /* nothing to run: the picture changes with its options */ }
    };
  };
})();
