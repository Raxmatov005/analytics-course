/* Story pictures for tables and shares (weeks 2–5, 7 and 8: windows, bands, merges, cross-tabs, ratios of sums, cohorts),
added to story.js's registry (window.ALStory.scenes). Loaded right after story7.js; see story.js's header for the block
format. A kind is function (host, info) → {set(opts), act(a)}. Words shown in a picture live in "labels" / "words" /
"legend" / "unit" (validate_pages.py compares everything else across the two languages).

  grid   — a cohort triangle: "vals" [[value or null, …], …] (one row per cohort, one column per age), "labels"
           {rows, cols}, "size" [customers per row] (an extra first column, words.size), "dp" (1); "ages" [age of each
           column] with "asof": a cell shows only when row + age ≤ asof (the rows are counted 0, 1, 2 … from the oldest),
           act {do: "month"} adds one month (one new diagonal), {do: "back"}; null cells are "not measured yet" (dashed);
           "zero": true fills them with an orange 0 (the trap); "col" k / "row" r / "diag" d (the cells where row + age = d:
           one calendar month) light a line; "hot" [r, c] rings one cell; "words" {corner, size, blank, unit}.
  xtab   — a cross-tab: "vals" [[…]], "labels" {rows, cols}; "mode" "n" (the values), "row" (% of the row's total),
           "col" (% of the column's total), "all" (% of the grand total); the totals in the margins, as Excel shows them;
           "hot" [r, c] rings a cell and its denominator and writes the division; act {do: "mode", m}; "big": true prints
           whole numbers with spaces; "ndp" the decimals of the values; "rtot": false drops the right-hand totals; "words"
           {total, n, row, col, all} (the read-out's names of the modes).
  merge  — two frames and their merge: "L", "R" {name, cols, rows}, "on" (the key column, in both), "how" "inner" /
           "left" / "right" / "outer" (null: the two frames only, matches linked by colour), "ind": true adds _merge,
           "hot" a key value; rows without a partner are struck out when how drops them; a key seen m times on the left
           and n on the right gives m × n rows (the read-out says so); act {do: "how", how}; "words" {nan, res, rows}.
  frame  — a window frame on a column: "vals", "keys" (the ORDER BY value per row: equal keys are ties), "part" (the
           partition per row, optional), "labels" {keys, part, cols: [key, value, out]}; "win" "all" (the partition),
           "run" (ROWS from the first row to the current one), "range" (the same, plus the current row's ties), [a, b]
           (a to b rows round the current one, e.g. [-2, 0]); "agg" "sum" or "avg"; "cur" the current row, act
           {do: "next"} / {do: "prev"}; "fill" "upto" (default: the outputs up to the current row) or "all"; "dp".
           "rank": true numbers the rows by value instead (ROW_NUMBER, RANK, DENSE_RANK as the extra columns).
  bands  — intervals on a strip: "edges" [e0, …, en] (null = infinity), "labels" [n band names], "closed" "right"
           ((a, b]) or "left" ([a, b)); "vals" values already dropped; act {do: "drop", v} drops one more, {do: "flip"}
           swaps the closed side, {do: "clear"}; a value outside every band is orange NaN; "words" {nan, val}.
  mix    — a rate made of parts: "items" [[top, bottom, fill], …] (rate = top ÷ bottom), "labels" [names]; "wide": true
           draws each bar as wide as its bottom, so the ratio of sums is the level the bars' area would make if levelled;
           "lines" ["avg" (the plain average of the rates), "pool" (the ratio of sums)]; "panels" [[item, …], …] with
           words.panels splits the picture (one pooled line each); "max" (%), "dp"; act {do: "set", i, bottom} or
           {do: "nudge", i, by} changes a bottom and keeps that item's rate; "words" {avg, pool, panels, n}. */
(function () {
  var S = window.ALStory;
  if (!S) return;
  var T = S.T, fmt = S.fmt, dec = S.dec, svg = S.svg, txt = S.txt, esc = S.esc;

  if (!document.getElementById('sy8-style')) {
    var st = document.createElement('style');
    st.id = 'sy8-style';
    st.textContent =
      '.sy8-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; padding: 2px 0 4px; }' +
      ' .sy8-t { border-collapse: separate; border-spacing: 3px; margin: 0 auto; font-size: .9em; font-variant-numeric: tabular-nums; }' +
      ' .sy8-t th, .sy8-t td { padding: .32em .5em; border-radius: 7px; text-align: center; line-height: 1.2; white-space: nowrap; transition: background .35s, box-shadow .35s, opacity .35s; }' +
      ' .sy8-t th { font-weight: 700; color: #475569; font-size: .92em; }' +
      ' .sy8-t th.sy8-rl { text-align: left; }' +
      ' .sy8-t td { background: #f1f5f9; color: #0f172a; }' +
      ' .sy8-t td.sy8-na { background: transparent; border: 1.5px dashed #cbd5e1; color: #94a3b8; }' +
      ' .sy8-t td.sy8-z { background: #ffedd5; color: #9a3412; font-weight: 800; border: 1.5px solid #fb923c; }' +
      ' .sy8-t td.sy8-h0 { background: #e0f2fe; } .sy8-t td.sy8-h1 { background: #bae6fd; } .sy8-t td.sy8-h2 { background: #7dd3fc; }' +
      ' .sy8-t td.sy8-h3 { background: #0ea5e9; color: #fff; } .sy8-t td.sy8-h4 { background: #0369a1; color: #fff; }' +
      ' .sy8-t .sy8-lit { box-shadow: 0 0 0 2.5px #7c3aed; } .sy8-t .sy8-dim { opacity: .38; }' +
      ' .sy8-t .sy8-hot { box-shadow: 0 0 0 3px #c2410c; font-weight: 800; }' +
      ' .sy8-t .sy8-den { box-shadow: 0 0 0 3px #a16207; font-weight: 800; }' +
      ' .sy8-t td.sy8-tot { background: #e2e8f0; font-weight: 700; }' +
      ' .sy8-t td.sy8-a { background: #e0f2fe; } .sy8-t td.sy8-b { background: #fef3c7; } .sy8-t td.sy8-c { background: #ede9fe; } .sy8-t td.sy8-d { background: #dcfce7; } .sy8-t td.sy8-e { background: #fce7f3; }' +
      ' .sy8-t td.sy8-nan { background: transparent; border: 1.5px dashed #cbd5e1; color: #64748b; font-style: italic; }' +
      ' .sy8-t tr.sy8-drop td { opacity: .35; text-decoration: line-through; }' +
      ' .sy8-t tr.sy8-in td { box-shadow: inset 0 0 0 2px #a16207; }' +
      ' .sy8-t tr.sy8-cur td { font-weight: 800; }' +
      ' .sy8-t td.sy8-out { background: #fef9c3; color: #854d0e; font-weight: 700; }' +
      ' .sy8-t td.sy8-m-both { background: #dcfce7; color: #166534; } .sy8-t td.sy8-m-left_only { background: #e0f2fe; color: #075985; } .sy8-t td.sy8-m-right_only { background: #fef3c7; color: #854d0e; }' +
      ' .sy8-cap { font-size: .78em; font-weight: 800; letter-spacing: .04em; color: #0f766e; text-align: center; margin: .2em 0 .1em; }' +
      ' .sy8-two { display: flex; flex-wrap: wrap; justify-content: center; gap: .3em 1em; }' +
      ' .sy8-m th { white-space: normal; max-width: 7.5em; line-height: 1.15; }' +
      ' @media (max-width: 600px) { .sy8-t { font-size: .84em; border-spacing: 2px; } .sy8-t th, .sy8-t td { padding: .3em .38em; } .sy8-two { gap: .3em .5em; flex-wrap: nowrap; } .sy8-two > div { flex: 0 1 auto; min-width: 0; } }' +
      ' .sy8-arrow { text-align: center; color: #64748b; font-weight: 700; font-size: .85em; margin: .15em 0; }' +
      ' .sy8-band { stroke: #fff; stroke-width: 2; } .sy8-b0 { fill: #bae6fd; } .sy8-b1 { fill: #fde68a; } .sy8-b2 { fill: #ddd6fe; } .sy8-b3 { fill: #bbf7d0; } .sy8-b4 { fill: #fbcfe8; } .sy8-b5 { fill: #e2e8f0; }' +
      ' .sy8-ed { stroke: #334155; stroke-width: 1.6; } .sy8-in { fill: #0f172a; } .sy8-out { fill: #fff; stroke: #0f172a; stroke-width: 1.6; }' +
      ' .sy8-v { fill: #7c3aed; stroke: #fff; stroke-width: 2; } .sy8-vn { fill: #f97316; stroke: #fff; stroke-width: 2; } .sy8-stem { stroke: #7c3aed; stroke-width: 1.4; stroke-dasharray: 3 2; }' +
      ' .sy8-pool { stroke: #a16207; stroke-width: 2.6; } .sy8-avg { stroke: #6d28d9; stroke-width: 2; stroke-dasharray: 6 4; } .sy8-halo { stroke: #fff; stroke-width: 6; opacity: .85; }' +
      ' .sy8-bar-b { fill: #7dd3fc; } .sy8-bar-y { fill: #fcd34d; } .sy8-bar-o { fill: #fdba74; } .sy8-bar-g { fill: #86efac; } .sy8-bar-p { fill: #c4b5fd; } .sy8-bar-m { fill: #cbd5e1; }' +
      ' .sy-svg .sy8-sm { font: 600 10px var(--sans); fill: #64748b; } .sy-svg .sy8-k { font-weight: 800; fill: #0f172a; }' +
      ' html[data-theme="dark"] .sy .sy8-t th { color: #9fb0c3; } html[data-theme="dark"] .sy .sy8-t td { background: #1e293b; color: #e6edf3; }' +
      ' html[data-theme="dark"] .sy .sy8-t td.sy8-na { background: transparent; border-color: #475569; color: #64748b; }' +
      ' html[data-theme="dark"] .sy .sy8-t td.sy8-z { background: #4a2a12; color: #fdba74; border-color: #fb923c; }' +
      ' html[data-theme="dark"] .sy .sy8-t td.sy8-h0 { background: #0c2a3d; } html[data-theme="dark"] .sy .sy8-t td.sy8-h1 { background: #0e3a56; } html[data-theme="dark"] .sy .sy8-t td.sy8-h2 { background: #075985; }' +
      ' html[data-theme="dark"] .sy .sy8-t td.sy8-h3 { background: #0284c7; color: #fff; } html[data-theme="dark"] .sy .sy8-t td.sy8-h4 { background: #38bdf8; color: #0d1117; }' +
      ' html[data-theme="dark"] .sy .sy8-t .sy8-lit { box-shadow: 0 0 0 2.5px #c4b5fd; } html[data-theme="dark"] .sy .sy8-t .sy8-hot { box-shadow: 0 0 0 3px #fdba74; } html[data-theme="dark"] .sy .sy8-t .sy8-den { box-shadow: 0 0 0 3px #fde047; }' +
      ' html[data-theme="dark"] .sy .sy8-t td.sy8-tot { background: #334155; }' +
      ' html[data-theme="dark"] .sy .sy8-t td.sy8-a { background: #0c2a3d; } html[data-theme="dark"] .sy .sy8-t td.sy8-b { background: #3f3510; } html[data-theme="dark"] .sy .sy8-t td.sy8-c { background: #2e1f5e; } html[data-theme="dark"] .sy .sy8-t td.sy8-d { background: #14361f; } html[data-theme="dark"] .sy .sy8-t td.sy8-e { background: #4a1d35; }' +
      ' html[data-theme="dark"] .sy .sy8-t td.sy8-nan { background: transparent; border-color: #475569; color: #9fb0c3; }' +
      ' html[data-theme="dark"] .sy .sy8-t tr.sy8-in td { box-shadow: inset 0 0 0 2px #fde047; } html[data-theme="dark"] .sy .sy8-t td.sy8-out { background: #3f3510; color: #fde047; }' +
      ' html[data-theme="dark"] .sy .sy8-t td.sy8-m-both { background: #14361f; color: #86efac; } html[data-theme="dark"] .sy .sy8-t td.sy8-m-left_only { background: #0c2a3d; color: #7dd3fc; } html[data-theme="dark"] .sy .sy8-t td.sy8-m-right_only { background: #3f3510; color: #fde047; }' +
      ' html[data-theme="dark"] .sy .sy8-cap { color: #5eead4; } html[data-theme="dark"] .sy .sy8-arrow { color: #9fb0c3; }' +
      ' html[data-theme="dark"] .sy .sy8-band { stroke: #0d1117; } html[data-theme="dark"] .sy .sy8-b0 { fill: #0c2a3d; } html[data-theme="dark"] .sy .sy8-b1 { fill: #3f3510; } html[data-theme="dark"] .sy .sy8-b2 { fill: #2e1f5e; } html[data-theme="dark"] .sy .sy8-b3 { fill: #14361f; } html[data-theme="dark"] .sy .sy8-b4 { fill: #4a1d35; } html[data-theme="dark"] .sy .sy8-b5 { fill: #334155; }' +
      ' html[data-theme="dark"] .sy .sy8-ed { stroke: #cbd5e1; } html[data-theme="dark"] .sy .sy8-in { fill: #e6edf3; } html[data-theme="dark"] .sy .sy8-out { fill: #0d1117; stroke: #e6edf3; }' +
      ' html[data-theme="dark"] .sy .sy8-v { fill: #a78bfa; stroke: #0d1117; } html[data-theme="dark"] .sy .sy8-vn { stroke: #0d1117; } html[data-theme="dark"] .sy .sy8-stem { stroke: #a78bfa; }' +
      ' html[data-theme="dark"] .sy .sy8-pool { stroke: #fde047; } html[data-theme="dark"] .sy .sy8-avg { stroke: #c4b5fd; } html[data-theme="dark"] .sy .sy8-halo { stroke: #0d1117; }' +
      ' html[data-theme="dark"] .sy .sy8-bar-b { fill: #0284c7; } html[data-theme="dark"] .sy .sy8-bar-y { fill: #ca8a04; } html[data-theme="dark"] .sy .sy8-bar-o { fill: #ea580c; } html[data-theme="dark"] .sy .sy8-bar-g { fill: #16a34a; } html[data-theme="dark"] .sy .sy8-bar-p { fill: #7c3aed; } html[data-theme="dark"] .sy .sy8-bar-m { fill: #475569; }' +
      ' html[data-theme="dark"] .sy .sy-svg .sy8-sm { fill: #9fb0c3; } html[data-theme="dark"] .sy .sy-svg .sy8-k { fill: #e6edf3; }';
    document.head.appendChild(st);
  }

  /* ---------- helpers ---------- */
  function big(n) { var r = Math.round(n), s = String(Math.abs(r)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); return (r < 0 ? '−' : '') + s; }
  function num(v, dp) { return v == null ? '' : (dp === 'big' ? big(v) : dec(v, dp == null ? 0 : dp).replace('-', '−')); }
  function pct(v, dp) { return dec(v * 100, dp == null ? 1 : dp) + ' %'; }
  function read(parts) { return parts.length ? '<div class="sy-read">' + fmt(parts.join(' · ')) + '</div>' : ''; }
  function W(o, k, en, ru) { var w = o.words || {}; return w[k] != null ? w[k] : T(en, ru); }
  function L(o, k, i, fb) { var l = o.labels || {}; return l[k] && l[k][i] != null ? l[k][i] : fb; }
  function cell(v, cls, extra) { return '<td' + (cls ? ' class="' + cls + '"' : '') + (extra || '') + '>' + v + '</td>'; }
  function brk(c) { return esc(c).replace(/(.)_/g, '$1_<wbr>'); }   // a long column name may break after an underscore
  function wrap(html) { return '<div class="sy8-wrap">' + html + '</div>'; }
  var TONES = ['a', 'b', 'c', 'd', 'e'];

  /* ---------- grid: the cohort triangle ---------- */
  function grid(host, info) {
    var o = {}, asof = null, key = '';
    function seen(r, c) {
      if (asof == null || !o.ages) return true;
      return r + o.ages[c] <= asof;
    }
    function paint() {
      var vals = o.vals || [], nr = vals.length, nc = nr ? vals[0].length : 0, dp = o.dp == null ? 1 : o.dp;
      var mx = 0, r, c, v;
      for (r = 0; r < nr; r++) for (c = 0; c < nc; c++) { v = vals[r][c]; if (v != null && seen(r, c)) mx = Math.max(mx, v); }
      var hot = o.hot, unit = W(o, 'unit', ' %', ' %');
      var h = '<table class="sy8-t"><tr><th class="sy8-rl">' + esc(W(o, 'corner', 'cohort', 'когорта')) + '</th>' + (o.size ? '<th>' + esc(W(o, 'size', 'people', 'людей')) + '</th>' : '');
      for (c = 0; c < nc; c++) h += '<th' + (o.col === c ? ' class="sy8-lit"' : '') + '>' + esc(L(o, 'cols', c, String(c + 1))) + '</th>';
      h += '</tr>';
      for (r = 0; r < nr; r++) {
        h += '<tr><th class="sy8-rl' + (o.row === r ? ' sy8-lit' : '') + '">' + esc(L(o, 'rows', r, String(r + 1))) + '</th>' + (o.size ? cell(big(o.size[r])) : '');
        for (c = 0; c < nc; c++) {
          v = vals[r][c];
          var show = v != null && seen(r, c), cls, txt0;
          if (show) { cls = 'sy8-h' + Math.min(4, Math.floor(mx ? v / mx * 4.999 : 0)); txt0 = num(v, dp); }
          else if (o.zero) { cls = 'sy8-z'; txt0 = '0'; }
          else { cls = 'sy8-na'; txt0 = '?'; }
          var lit = (o.col === c) || (o.row === r) || (o.diag != null && o.ages && r + o.ages[c] === o.diag);
          var dim = (o.col != null || o.row != null || o.diag != null) && !lit;
          if (lit && cls.indexOf('sy8-h') === 0) cls += ' sy8-lit';
          if (dim) cls += ' sy8-dim';
          if (hot && hot[0] === r && hot[1] === c) cls += ' sy8-hot';
          h += cell(txt0, cls);
        }
        h += '</tr>';
      }
      h += '</table>';
      host.innerHTML = wrap(h);
      var parts = [];
      if (hot && vals[hot[0]] && vals[hot[0]][hot[1]] != null && seen(hot[0], hot[1])) parts.push('{o|' + L(o, 'rows', hot[0], '') + '} · ' + L(o, 'cols', hot[1], '') + ': **' + num(vals[hot[0]][hot[1]], dp) + unit + '**');
      if (asof != null && o.labels && o.labels.asof && o.labels.asof[asof] != null) parts.push('{b|' + o.labels.asof[asof] + '}');
      var blank = 0; for (r = 0; r < nr; r++) for (c = 0; c < nc; c++) if (!(vals[r][c] != null && seen(r, c))) blank++;
      if (blank && !o.zero) parts.push('{m|' + W(o, 'blank', '? = not measured yet', '? = ещё не измерено') + '} (' + blank + ')');
      info.innerHTML = read(parts.filter(Boolean));
    }
    return {
      set: function (nx) { var k = JSON.stringify([nx.vals, nx.ages, nx.asof]); if (k !== key || nx.reset) { key = k; asof = nx.asof == null ? null : nx.asof; } o = nx; paint(); },
      act: function (a) {
        if (asof == null) return;
        var mxa = (o.vals || []).length - 1 + Math.max.apply(null, o.ages || [0]);
        if (a.do === 'back') asof = Math.max(o.asof || 0, asof - 1); else asof = Math.min(mxa, asof + 1);
        paint();
      }
    };
  }

  /* ---------- xtab: % of row, of column, of the whole ---------- */
  function xtab(host, info) {
    var o = {}, mode = 'n', key = '';
    function paint() {
      var v = o.vals || [], nr = v.length, nc = nr ? v[0].length : 0, r, c, rt = [], ct = [], g = 0, dp = o.dp == null ? 1 : o.dp;
      for (r = 0; r < nr; r++) { rt[r] = 0; for (c = 0; c < nc; c++) rt[r] += v[r][c] || 0; g += rt[r]; }
      for (c = 0; c < nc; c++) { ct[c] = 0; for (r = 0; r < nr; r++) ct[c] += v[r][c] || 0; }
      var show = function (x, den) {
        if (x == null) return '';
        if (mode === 'n') return o.big ? big(x) : num(x, o.ndp || 0);
        return den ? pct(x / den, dp) : '';
      };
      var den = function (r2, c2) { return mode === 'row' ? rt[r2] : mode === 'col' ? ct[c2] : g; };
      var hot = o.hot, tot = W(o, 'total', 'Total', 'Итого');
      var h = '<table class="sy8-t"><tr><th></th>';
      for (c = 0; c < nc; c++) h += '<th>' + esc(L(o, 'cols', c, '')) + '</th>';
      h += (o.rtot === false ? '' : '<th>' + esc(tot) + '</th>') + '</tr>';
      for (r = 0; r < nr; r++) {
        h += '<tr><th class="sy8-rl">' + esc(L(o, 'rows', r, '')) + '</th>';
        for (c = 0; c < nc; c++) {
          var cls = v[r][c] == null ? 'sy8-na' : (mode === 'row' && hot && hot[0] === r) || (mode === 'col' && hot && hot[1] === c) || (mode === 'all' && hot) ? 'sy8-h1' : '';
          if (hot && hot[0] === r && hot[1] === c) cls += ' sy8-hot';
          h += cell(v[r][c] == null ? '' : show(v[r][c], den(r, c)), cls);
        }
        var rc = 'sy8-tot' + (hot && mode === 'row' && hot[0] === r ? ' sy8-den' : '');
        h += (o.rtot === false ? '' : cell(mode === 'n' ? show(rt[r]) : mode === 'row' ? pct(1, 0) : pct(rt[r] / g, dp), rc)) + '</tr>';
      }
      h += '<tr><th class="sy8-rl">' + esc(tot) + '</th>';
      for (c = 0; c < nc; c++) h += cell(mode === 'n' ? show(ct[c]) : mode === 'col' ? pct(1, 0) : pct(ct[c] / g, dp), 'sy8-tot' + (hot && mode === 'col' && hot[1] === c ? ' sy8-den' : ''));
      h += (o.rtot === false ? '' : cell(mode === 'n' ? show(g) : pct(1, 0), 'sy8-tot' + (hot && mode === 'all' ? ' sy8-den' : ''))) + '</tr></table>';
      host.innerHTML = wrap(h);
      var parts = [], name = { n: W(o, 'n', 'the values', 'сами значения'), row: W(o, 'row', '% of row total', '% от суммы по строке'), col: W(o, 'col', '% of column total', '% от суммы по столбцу'), all: W(o, 'all', '% of grand total', '% от общего итога') }[mode];
      parts.push('**' + name + '**');
      if (hot && mode !== 'n' && v[hot[0]] && v[hot[0]][hot[1]] != null) {
        var x = v[hot[0]][hot[1]], d = den(hot[0], hot[1]);
        var fx = function (y) { return o.big ? big(y) : num(y, o.ndp || 0); };
        parts.push('{o|' + fx(x) + '} ÷ {y|' + fx(d) + '} = **' + pct(x / d, dp) + '**');
      }
      info.innerHTML = read(parts);
    }
    return {
      set: function (nx) { var k = JSON.stringify([nx.vals, nx.mode]); if (k !== key || nx.reset) { key = k; mode = nx.mode || 'n'; } o = nx; paint(); },
      act: function (a) { if (a.do === 'mode' && a.m) { mode = a.m; paint(); } }
    };
  }

  /* ---------- merge: two frames, one key ---------- */
  function merge(host, info) {
    var o = {}, how = null, key = '';
    function paint() {
      var Lf = o.L || { cols: [], rows: [] }, Rf = o.R || { cols: [], rows: [] }, on = o.on;
      var li = Lf.cols.indexOf(on), ri = Rf.cols.indexOf(on), tone = {}, nt = 0, nan = W(o, 'nan', 'NaN', 'NaN');
      Lf.rows.concat(Rf.rows).forEach(function (row, j) { var k = String(j < Lf.rows.length ? row[li] : row[ri]); if (!(k in tone)) tone[k] = TONES[nt++ % TONES.length]; });
      var rcount = {}, lcount = {};
      Rf.rows.forEach(function (row) { var k = String(row[ri]); rcount[k] = (rcount[k] || 0) + 1; });
      Lf.rows.forEach(function (row) { var k = String(row[li]); lcount[k] = (lcount[k] || 0) + 1; });
      var keepL = how === 'left' || how === 'outer', keepR = how === 'right' || how === 'outer';
      var res = [], lo = Lf.cols.filter(function (c) { return c !== on; }), ro = Rf.cols.filter(function (c) { return c !== on; });
      if (how) {
        if (how === 'right') {
          Rf.rows.forEach(function (rr) {
            var k = String(rr[ri]), hit = Lf.rows.filter(function (lr) { return String(lr[li]) === k; });
            if (hit.length) hit.forEach(function (lr) { res.push([rr[ri], lr, rr, 'both']); });
            else res.push([rr[ri], null, rr, 'right_only']);
          });
        } else {
          Lf.rows.forEach(function (lr) {
            var k = String(lr[li]), hit = Rf.rows.filter(function (rr) { return String(rr[ri]) === k; });
            if (hit.length) hit.forEach(function (rr) { res.push([lr[li], lr, rr, 'both']); });
            else if (keepL) res.push([lr[li], lr, null, 'left_only']);
          });
          if (keepR) Rf.rows.forEach(function (rr) { if (!lcount[String(rr[ri])]) res.push([rr[ri], null, rr, 'right_only']); });
        }
      }
      function frame(F, ki, side) {
        var h = '<div><div class="sy8-cap">' + esc(F.name || '') + '</div><table class="sy8-t sy8-m"><tr>' + F.cols.map(function (c) { return '<th>' + brk(c) + '</th>'; }).join('') + '</tr>';
        F.rows.forEach(function (row) {
          var k = String(row[ki]), other = side === 'L' ? rcount[k] : lcount[k];
          var dropped = how && !other && (side === 'L' ? !keepL : !keepR);
          h += '<tr' + (dropped ? ' class="sy8-drop"' : '') + '>' + row.map(function (x, j) {
            var cls = (other ? 'sy8-' + tone[k] : (how ? '' : 'sy8-na')) + (o.hot != null && String(o.hot) === k && j === ki ? ' sy8-hot' : '');
            return cell(x == null ? nan : esc(x), cls);
          }).join('') + '</tr>';
        });
        return h + '</table></div>';
      }
      var h = '<div class="sy8-two">' + frame(Lf, li, 'L') + frame(Rf, ri, 'R') + '</div>';
      if (how) {
        h += '<div class="sy8-arrow">↓ ' + esc((o.code || 'how="%h"').replace('%h', how)) + '</div>';
        h += '<table class="sy8-t sy8-m"><tr><th>' + brk(on) + '</th>' + lo.concat(ro).map(function (c) { return '<th>' + brk(c) + '</th>'; }).join('') + (o.ind ? '<th>_merge</th>' : '') + '</tr>';
        res.forEach(function (x) {
          var k = String(x[0]);
          h += '<tr>' + cell(esc(x[0]), (x[3] === 'both' ? 'sy8-' + tone[k] : '') + (o.hot != null && String(o.hot) === k ? ' sy8-hot' : ''));
          lo.forEach(function (c) { h += x[1] ? cell(esc(x[1][Lf.cols.indexOf(c)]), x[3] === 'both' ? 'sy8-' + tone[k] : '') : cell(nan, 'sy8-nan'); });
          ro.forEach(function (c) { h += x[2] ? cell(esc(x[2][Rf.cols.indexOf(c)]), x[3] === 'both' ? 'sy8-' + tone[k] : '') : cell(nan, 'sy8-nan'); });
          if (o.ind) h += cell(x[3], 'sy8-m-' + x[3]);
          h += '</tr>';
        });
        h += '</table>';
      }
      host.innerHTML = wrap(h);
      var parts = [], rows = W(o, 'rows', 'rows', 'строк');
      if (how) {
        parts.push(Lf.rows.length + ' + ' + Rf.rows.length + ' ' + rows + ' → **' + res.length + ' ' + rows + '**');
        Object.keys(lcount).forEach(function (k) {
          if (rcount[k] > 1 && lcount[k] > 1) parts.push('{o|' + esc(on) + ' ' + esc(k) + ': ' + lcount[k] + ' × ' + rcount[k] + ' = ' + lcount[k] * rcount[k] + '}');
        });
      } else {
        var m = 0; Object.keys(lcount).forEach(function (k) { if (rcount[k]) m++; });
        parts.push(W(o, 'keys', 'keys found on both sides', 'ключей есть в обеих таблицах') + ': **' + m + '**');
      }
      info.innerHTML = read(parts);
    }
    return {
      set: function (nx) { var k = JSON.stringify([nx.L, nx.R, nx.how]); if (k !== key || nx.reset) { key = k; how = nx.how || null; } o = nx; paint(); },
      act: function (a) { if (a.do === 'how') { how = a.how || null; paint(); } }
    };
  }

  /* ---------- frame: what a window reads ---------- */
  function frame(host, info) {
    var o = {}, cur = 0, key = '';
    function span(i) {
      var n = (o.vals || []).length, part = o.part || [], p0 = 0, p1 = n - 1, j;
      for (j = i; j > 0 && part[j - 1] === part[i]; j--); p0 = part.length ? j : 0;
      for (j = i; j < n - 1 && part[j + 1] === part[i]; j++); p1 = part.length ? j : n - 1;
      var w = o.win || 'run', a = p0, b = i;
      if (w === 'all') { a = p0; b = p1; }
      else if (w === 'range') { b = i; while (b < p1 && o.keys && o.keys[b + 1] === o.keys[i]) b++; }
      else if (w && w.length === 2) { a = Math.max(p0, i + w[0]); b = Math.min(p1, i + w[1]); }
      return [a, b];
    }
    function out(i) {
      var s = span(i), t = 0, k;
      for (k = s[0]; k <= s[1]; k++) t += o.vals[k];
      return o.agg === 'avg' ? t / (s[1] - s[0] + 1) : t;
    }
    function ranks() {
      var v = o.vals || [], rn = [], rk = [], dr = [], d = 0;
      v.forEach(function (x, i) { rn[i] = i + 1; rk[i] = i && v[i - 1] === x ? rk[i - 1] : i + 1; if (!i || v[i - 1] !== x) d++; dr[i] = d; });
      return [rn, rk, dr];
    }
    function paint() {
      var v = o.vals || [], n = v.length, dp = o.dp == null ? 0 : o.dp, s = span(cur), lab = o.labels || {}, cols = lab.cols || [];
      var upto = o.fill === 'all' ? n - 1 : o.fill === 'none' ? -1 : cur, i;
      var tp = {}, nt = 0; (o.part || []).forEach(function (p) { if (!(p in tp)) tp[p] = TONES[nt++ % TONES.length]; });
      var rk = o.rank ? ranks() : null;
      var h = '<table class="sy8-t"><tr>' + (o.part ? '<th>' + esc(cols[0] || '') + '</th>' : '');
      var ci = o.part ? 1 : 0;
      h += '<th>' + esc(cols[ci] || '') + '</th><th>' + esc(cols[ci + 1] || '') + '</th>';
      if (rk) h += '<th>ROW_NUMBER</th><th>RANK</th><th>DENSE_RANK</th>';
      else h += '<th>' + esc(cols[ci + 2] || '') + '</th>';
      h += '</tr>';
      for (i = 0; i < n; i++) {
        var inF = !rk && o.fill !== 'none' && i >= s[0] && i <= s[1], tcls = o.part ? 'sy8-' + tp[o.part[i]] : '';
        h += '<tr class="' + (inF ? 'sy8-in' : '') + (i === cur ? ' sy8-cur' : '') + '">';
        if (o.part) h += cell(esc(lab.part && lab.part[i] != null ? lab.part[i] : o.part[i]), tcls);
        h += cell(esc(lab.keys && lab.keys[i] != null ? lab.keys[i] : (o.keys ? o.keys[i] : i + 1)), tcls + (i === cur ? ' sy8-hot' : ''));
        h += cell(num(v[i], o.vdp == null ? dp : o.vdp), tcls);
        if (rk) { for (var q = 0; q < 3; q++) h += cell(i <= upto ? String(rk[q][i]) : '', i <= upto ? 'sy8-out' + (i === cur ? ' sy8-hot' : '') : 'sy8-na'); }
        else if (i < (o.from || 0)) h += cell('…', 'sy8-na');
        else h += cell(i <= upto ? num(out(i), dp) : '', i <= upto ? 'sy8-out' + (i === cur ? ' sy8-hot' : '') : 'sy8-na');
        h += '</tr>';
      }
      host.innerHTML = wrap(h + '</table>');
      var parts = [];
      if (!rk && n && o.fill === 'none') parts.push(W(o, 'row', 'row', 'строка') + ' **' + (cur + 1) + '**: ' + W(o, 'frame', 'frame', 'рамка') + ' {y|?}');
      else if (!rk && n) {
        var terms = []; for (i = s[0]; i <= s[1]; i++) terms.push(num(v[i], o.vdp == null ? dp : o.vdp));
        var sum = terms.length > 6 ? terms.slice(0, 2).join(' + ') + ' + … + ' + terms[terms.length - 1] : terms.join(' + ');
        var res = o.agg === 'avg' ? '(' + sum + ') ÷ ' + terms.length : sum;
        parts.push(W(o, 'row', 'row', 'строка') + ' **' + (cur + 1) + '**: ' + W(o, 'frame', 'frame', 'рамка') + ' {y|' + (s[0] + 1) + (s[1] > s[0] ? '–' + (s[1] + 1) : '') + '} → ' + res + ' = **' + num(out(cur), dp) + '**');
      } else if (rk && n) {
        parts.push(W(o, 'row', 'row', 'строка') + ' **' + (cur + 1) + '**: ' + num(v[cur], o.vdp == null ? dp : o.vdp) + ' → ' + rk[0][cur] + ' · ' + rk[1][cur] + ' · ' + rk[2][cur]);
      }
      info.innerHTML = read(parts);
    }
    return {
      set: function (nx) { var k = JSON.stringify([nx.vals, nx.win, nx.part, nx.rank, nx.agg]); o = nx; if (k !== key || nx.reset || nx.cur != null) { key = k; cur = nx.cur || 0; } paint(); },
      act: function (a) { var n = (o.vals || []).length, f = o.from || 0; if (a.do === 'prev') cur = Math.max(f, cur - 1); else cur = cur + 1 >= n ? f : cur + 1; paint(); }
    };
  }

  /* ---------- bands: which interval holds a value ---------- */
  function bands(host, info) {
    var o = {}, closed = 'right', vals = [], key = '';
    function band(v) {
      var e = o.edges || [], k;
      for (k = 0; k < e.length - 1; k++) {
        var a = e[k], b = e[k + 1] == null ? Infinity : e[k + 1];
        if (closed === 'right' ? (v > a && v <= b) : (v >= a && v < b)) return k;
      }
      return -1;
    }
    function span(k) {   // the whole numbers a band holds: 31 … 60
      var e = o.edges || [], a = closed === 'right' ? e[k] + 1 : e[k], b = e[k + 1] == null ? null : closed === 'right' ? e[k + 1] : e[k + 1] - 1;
      return b == null ? num(a, 0) + ' …' : a === b ? num(a, 0) : num(a, 0) + ' … ' + num(b, 0);
    }
    function paint() {
      var e = o.edges || [], nb = e.length - 1, X0 = 34, X1 = 462, Y = 92, H = 34, bw = (X1 - X0) / Math.max(1, nb), s = '', k;
      var bx = function (k2) { return X0 + k2 * bw; };
      var inf = function (x) { return x == null ? '∞' : num(x, o.dp || 0); };
      for (k = 0; k < nb; k++) {
        s += '<rect class="sy8-band sy8-b' + (k % 6) + '" x="' + bx(k).toFixed(1) + '" y="' + Y + '" width="' + bw.toFixed(1) + '" height="' + H + '" rx="4"/>';
        s += txt(bx(k) + bw / 2, Y + H / 2 + 5, (o.labels || [])[k] || '', 'sy-ax sy8-k', 'middle');
        var lo = closed === 'right' ? '(' : '[', hi = closed === 'right' ? ']' : ')';
        if (e[k + 1] == null) hi = ')';
        s += txt(bx(k) + bw / 2, Y + H + 18, o.ints ? span(k) : lo + inf(e[k]) + ', ' + inf(e[k + 1]) + hi, 'sy-ax sy8-sm', 'middle');
      }
      for (k = 0; k <= nb; k++) {
        var x = bx(k);
        s += '<line class="sy8-ed" x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + (Y - 6) + '" y2="' + (Y + H + 4) + '"/>';
        if (k < nb || e[k] != null) {
          // the edge value belongs to the band on its closed side: a filled dot on that side, a hollow one on the other
          var inLeft = closed === 'right';
          if (k > 0) s += '<circle class="' + (inLeft ? 'sy8-in' : 'sy8-out') + '" cx="' + (x - 4.5).toFixed(1) + '" cy="' + (Y - 6) + '" r="3.6"/>';
          if (k < nb) s += '<circle class="' + (inLeft ? 'sy8-out' : 'sy8-in') + '" cx="' + (x + 4.5).toFixed(1) + '" cy="' + (Y - 6) + '" r="3.6"/>';
        }
      }
      // the values
      var placed = [];
      vals.forEach(function (v, j) {
        var b = band(v), x, cls = 'sy8-v';
        if (b < 0) { x = v < (e[0] == null ? -Infinity : e[0]) ? X0 - 14 : X1 + 14; cls = 'sy8-vn'; }
        else {
          var a = e[b], z = e[b + 1];
          if (v === a) x = bx(b) + 9;
          else if (z != null && v === z) x = bx(b + 1) - 9;
          else if (z == null) x = bx(b) + bw * (0.3 + 0.5 * Math.min(1, (v - a) / Math.max(1, 4 * Math.abs(a) + 50)));
          else x = bx(b) + 12 + (bw - 24) * (v - a) / (z - a);
        }
        var lvl = 0; placed.forEach(function (p) { if (Math.abs(p[0] - x) < 30 && p[1] === lvl) lvl++; });
        placed.push([x, lvl]);
        var y = Y - 30 - lvl * 22;
        s += '<line class="sy8-stem" x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + (y + 6) + '" y2="' + (Y - 1) + '"/>';
        s += '<circle class="' + cls + (j === vals.length - 1 ? ' sy-new' : '') + '" cx="' + x.toFixed(1) + '" cy="' + y + '" r="6"/>';
        s += txt(x, y - 10, num(v, o.dp || 0), 'sy-ax ' + (b < 0 ? 'sy-or' : 'sy-pl'), 'middle');
      });
      host.innerHTML = svg(496, 166, s);
      var parts = [];
      if (vals.length) {
        var v = vals[vals.length - 1], b = band(v), vw = W(o, 'val', '', '');
        if (b < 0) parts.push((vw ? vw + ' ' : '') + '{o|' + num(v, o.dp || 0) + '} → ' + W(o, 'none', 'no interval', 'ни в одном интервале') + ' → {o|' + W(o, 'nan', 'NaN', 'NaN') + '}');
        else parts.push((vw ? vw + ' ' : '') + '{p|' + num(v, o.dp || 0) + '} → ' + (o.ints ? span(b) : (closed === 'right' ? '(' : '[') + inf(e[b]) + ', ' + inf(e[b + 1]) + (closed === 'right' && e[b + 1] != null ? ']' : ')')) + ' → **' + ((o.labels || [])[b] || '') + '**');
      }
      parts.push('{m|' + W(o, 'key', '● the edge is in, ○ it is out', '● край внутри, ○ снаружи') + '}');
      info.innerHTML = read(parts);
    }
    return {
      set: function (nx) { var k = JSON.stringify([nx.edges, nx.closed, nx.vals]); if (k !== key || nx.reset) { key = k; closed = nx.closed || 'right'; vals = (nx.vals || []).slice(); } o = nx; paint(); },
      act: function (a) {
        if (a.do === 'flip') closed = closed === 'right' ? 'left' : 'right';
        else if (a.do === 'clear') vals = [];
        else if (a.do === 'drop') { vals.push(a.v); if (vals.length > 7) vals.shift(); }
        paint();
      }
    };
  }

  /* ---------- mix: a ratio of sums and an average of ratios ---------- */
  function mix(host, info) {
    var o = {}, items = [], key = '';
    function paint() {
      var panels = o.panels || [items.map(function (_, i) { return i; })], np = panels.length, gap = 26;
      var X0 = 60, X1 = 472, Y0 = 172, Y1 = 26, pw = (X1 - X0 - gap * (np - 1)) / np, dp = o.dp == null ? 1 : o.dp;
      var mx = (o.max || 100) / 100, y = function (r) { return Y0 - Math.min(1, r / mx) * (Y0 - Y1); }, s = '', parts = [];
      [0, 0.5, 1].forEach(function (q) { s += txt(X0 - 6, y(q * mx) + 4, dec(q * mx * 100, 0) + ' %', 'sy-ax sy8-sm', 'end'); });
      panels.forEach(function (pi, p) {
        var px = X0 + p * (pw + gap), tb = 0, tt = 0, rs = 0;
        pi.forEach(function (i) { tb += items[i][1]; tt += items[i][0]; rs += items[i][0] / items[i][1]; });
        var x = px;
        pi.forEach(function (i, j) {
          var it = items[i], r = it[0] / it[1], w = o.wide ? pw * it[1] / tb : pw / pi.length;
          s += '<rect class="sy8-bar-' + (it[2] || 'b') + '" x="' + (x + 1.5).toFixed(1) + '" y="' + y(r).toFixed(1) + '" width="' + Math.max(1, w - 3).toFixed(1) + '" height="' + (Y0 - y(r)).toFixed(1) + '" rx="2"/>';
          var bdp = o.bdp == null ? dp : o.bdp;
          if (w > 8) s += txt(x + w / 2, Math.max(y(r) - 5, Y1 + 9), dec(r * 100, bdp), 'sy-ax sy8-k', 'middle');
          if (w > 44) {
            s += txt(x + w / 2, Y0 + 15, (o.labels || [])[i] || '', 'sy-ax sy8-sm', 'middle');
            s += txt(x + w / 2, Y0 + 29, big(it[1]), 'sy-ax sy8-sm', 'middle');
          }
          x += w;
        });
        s += '<line class="sy-axl" x1="' + px.toFixed(1) + '" x2="' + (px + pw).toFixed(1) + '" y1="' + Y0 + '" y2="' + Y0 + '"/>';
        var pool = tt / tb, avg = rs / pi.length, lines = o.lines || ['pool'];
        var hl = function (v) { return '<line class="sy8-halo" x1="' + px.toFixed(1) + '" x2="' + (px + pw).toFixed(1) + '" y1="' + y(v).toFixed(1) + '" y2="' + y(v).toFixed(1) + '"/>'; };
        if (lines.indexOf('avg') >= 0) s += hl(avg) + '<line class="sy8-avg" x1="' + px.toFixed(1) + '" x2="' + (px + pw).toFixed(1) + '" y1="' + y(avg).toFixed(1) + '" y2="' + y(avg).toFixed(1) + '"/>';
        if (lines.indexOf('pool') >= 0) s += hl(pool) + '<line class="sy8-pool" x1="' + px.toFixed(1) + '" x2="' + (px + pw).toFixed(1) + '" y1="' + y(pool).toFixed(1) + '" y2="' + y(pool).toFixed(1) + '"/>';
        if (np > 1) s += txt(px + pw / 2, Y1 - 10, ((o.words || {}).panels || [])[p] || '', 'sy-ax sy-lab', 'middle');
        var pre = np > 1 ? '**' + (((o.words || {}).panels || [])[p] || '') + '**: ' : '';
        var bits = [];
        if (lines.indexOf('pool') >= 0) bits.push('{y|' + W(o, 'pool', 'ratio of sums', 'отношение сумм') + ' ' + big(tt) + ' ÷ ' + big(tb) + ' = ' + pct(pool, dp) + '}');
        if (lines.indexOf('avg') >= 0) bits.push('{p|' + W(o, 'avg', 'average of the rates', 'среднее долей') + ' ' + pct(avg, dp) + '}');
        if (bits.length) parts.push(pre + bits.join(', '));
      });
      host.innerHTML = svg(480, 206, s);
      info.innerHTML = read(parts);
    }
    return {
      set: function (nx) { var k = JSON.stringify(nx.items); if (k !== key || nx.reset) { key = k; items = (nx.items || []).map(function (x) { return x.slice(); }); } o = nx; paint(); },
      act: function (a) {
        var it = items[a.i]; if (!it) return;
        var r = it[0] / it[1], b = a.do === 'set' ? a.bottom : it[1] + (a.by || 0);
        b = Math.max(1, b); it[0] = Math.round(r * b * 1000) / 1000; it[1] = b;
        paint();
      }
    };
  }

  S.scenes.grid = grid;
  S.scenes.xtab = xtab;
  S.scenes.merge = merge;
  S.scenes.frame = frame;
  S.scenes.bands = bands;
  S.scenes.mix = mix;
})();
