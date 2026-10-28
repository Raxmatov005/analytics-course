/* Pictures of tables (Docsify plugin; the founder, 2026-10-28: "show the primary key with a table and its columns, circle
it"). A ```pic JSON block becomes a small figure of real rows from the course database: the key columns circled and
labelled, arrows from a foreign key to the row it points to, rows a filter keeps or drops, rows coloured by group or
match, computed columns tinted, and a step label ("WHERE …", "GROUP BY …") between a table and the next.
  {"title": "…", "caption": "… **bold** `code` …",
   "tables": [{"id": "loans", "name": "loans", "cols": ["loan_id", "customer_id"], "rows": [[1, 3473], [2, 1208]],
     "pk": "loan_id", "fk": ["customer_id"], "tone": ["a", null], "keep": [0], "drop": [1], "new": ["col"], "cells": [[0, "col"]],
     "more": "… 7 826 more rows", "via": "WHERE status = 'active'", "label": "result"}],
   "links": [{"from": ["loans", 0, "customer_id"], "to": ["customers", 0, "customer_id"], "label": "3473"}],
   "stack": false}
tags: {"col": "label"} circles any other column with its own label; tone: a colour per row (a–e, null = none) for groups and join matches; keep / drop: row numbers a filter keeps (green)
or drops (faded, struck through); new: computed columns; cells: single cells to point at; a null value prints as NULL.
Tables sit side by side and wrap under each other on a phone ("stack": true always stacks); the two cells of a link
share a colour, and an arrow joins their rows while the target table sits to the right (drawn again on every resize). Every text is the page's own language (the Russian pages have their own blocks). A "chart" (bars or intervals, see
below) draws instead of, or above, the tables. */
(function () {
  function T(en, ru) { return window.ALLang ? window.ALLang.t(en, ru) : en; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function inline(s) { return esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>'); }
  var KEY = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M14 9l2 2"/></svg>';
  var LINK = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/></svg>';
  var uid = 0;

  function table(t) {
    var pk = t.pk ? [].concat(t.pk) : [], fk = t.fk || [], neu = t.new || [], keep = t.keep || [], drop = t.drop || [], mk = t.tags || {};
    var cells = {};
    (t.cells || []).forEach(function (c) { cells[c[0] + '|' + c[1]] = 1; });
    var both = pk.length > 1;   // a key of two columns: one label over both
    var tags = t.cols.map(function (c, j) {
      if (both && pk.indexOf(c) >= 0) return pk.indexOf(t.cols[j - 1]) >= 0 ? ''
        : '<th class="pic-tag pk" colspan="' + pk.length + '">' + KEY + T('primary key: the pair', 'первичный ключ: пара') + '</th>';
      return pk.indexOf(c) >= 0 ? '<th class="pic-tag pk">' + KEY + T('primary key', 'первичный ключ') + '</th>'
        : fk.indexOf(c) >= 0 ? '<th class="pic-tag fk">' + LINK + T('foreign key', 'внешний ключ') + '</th>'
        : neu.indexOf(c) >= 0 ? '<th class="pic-tag new">' + T('computed', 'вычислено') + '</th>'
        : mk[c] ? '<th class="pic-tag mk">' + esc(mk[c]) + '</th>' : '<th></th>';
    });
    var cls = function (c) { return pk.indexOf(c) >= 0 ? ' class="pk"' : fk.indexOf(c) >= 0 ? ' class="fk"' : neu.indexOf(c) >= 0 ? ' class="new"' : mk[c] ? ' class="mk"' : ''; };
    var last = t.rows.length - 1;
    var body = t.rows.map(function (r, i) {
      var rc = (t.tone && t.tone[i] ? ' tone-' + t.tone[i] : '') + (keep.indexOf(i) >= 0 ? ' keep' : '') + (drop.indexOf(i) >= 0 ? ' drop' : '') + (i === last && !t.more ? ' last' : '');
      return '<tr class="' + rc.trim() + '" data-r="' + i + '">' + r.map(function (v, j) {
        var c = t.cols[j], k = cls(c), hot = cells[i + '|' + c] ? ' hot' : '';
        if (hot) k = k ? k.replace('"', '"hot ') : ' class="hot"';
        return '<td' + k + ' data-c="' + esc(c) + '">' + (v === null ? '<span class="pic-null">NULL</span>' : esc(v)) + '</td>';
      }).join('') + '</tr>';
    }).join('');
    if (t.more) body += '<tr class="pic-more last"><td colspan="' + t.cols.length + '">' + esc(t.more) + '</td></tr>';
    return (t.via ? '<div class="pic-via"><code>' + esc(t.via) + '</code><span class="pic-via-arrow" aria-hidden="true"></span></div>' : '') +
      '<div class="pic-t" data-t="' + esc(t.id || t.name) + '">' +
      '<div class="pic-tname">' + (t.label ? '<span class="pic-label">' + esc(t.label) + '</span>' : '') + '<code>' + esc(t.name) + '</code></div>' +
      '<table><thead>' + (pk.length || fk.length || neu.length || Object.keys(mk).length ? '<tr class="pic-tags">' + tags.join('') + '</tr>' : '') +
      '<tr>' + t.cols.map(function (c) { return '<th' + cls(c) + '>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' + body + '</tbody></table></div>';
  }

  /* the links: the two cells of a link share a colour (one colour per target row), and when the target table sits to the
     right an arrow runs from the end of the source row to the start of the target row, behind the tables, so it never
     covers a value. Stacked tables (a phone) keep only the colours: an arrow round the side would cross other columns. */
  function paint(fig, spec) {
    var tone = {}, n = 0;
    (spec.links || []).forEach(function (l) {
      var k = l.to.join('|');
      if (!(k in tone)) tone[k] = 'abcde'.charAt(n++ % 5);
      [l.from, l.to].forEach(function (ref) {
        var td = fig.querySelector('.pic-t[data-t="' + ref[0] + '"] tr[data-r="' + ref[1] + '"] td[data-c="' + ref[2] + '"]');
        if (td) td.classList.add('lt-' + tone[k]);
      });
    });
  }
  function draw(fig, spec) {
    var body = fig.querySelector('.pic-body'), svg = fig.querySelector('.pic-links');
    if (!svg || !body.offsetWidth) return;
    var br = body.getBoundingClientRect(), out = '';
    function row(ref) {
      var tr = body.querySelector('.pic-t[data-t="' + ref[0] + '"] tr[data-r="' + ref[1] + '"]');
      var td = tr && tr.querySelector('td[data-c="' + ref[2] + '"]');
      return td && { row: tr.getBoundingClientRect(), cell: td.getBoundingClientRect() };
    }
    (spec.links || []).forEach(function (l) {
      var a = row(l.from), b = row(l.to);
      if (!a || !b || b.row.left < a.row.right + 16) return;
      var ay = a.cell.top + a.cell.height / 2 - br.top, by = b.cell.top + b.cell.height / 2 - br.top;
      var x1 = a.row.right - br.left + 1, x2 = b.row.left - br.left - 3, mx = (x1 + x2) / 2;
      out += '<path d="M' + x1 + ' ' + ay + ' C' + mx + ' ' + ay + ' ' + mx + ' ' + by + ' ' + x2 + ' ' + by + '" marker-end="url(#' + fig.id + '-m)"/>';
      if (l.label) out += '<foreignObject x="' + (mx - 40) + '" y="' + ((ay + by) / 2 - 11) + '" width="80" height="22"><div class="pic-linklabel">' + esc(l.label) + '</div></foreignObject>';
    });
    svg.setAttribute('width', body.scrollWidth);
    svg.setAttribute('height', body.scrollHeight);
    svg.innerHTML = '<defs><marker id="' + fig.id + '-m" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
      '<path d="M0 0L10 5L0 10z"/></marker></defs>' + out;
  }

  /* ---------- charts (Weeks 4–8): an SVG drawn at phone size (360 wide) that grows to at most 560 px ----------
     {"type": "bars", "labels": ["0", "1–30"], "values": [14, 124], "hl": [1], "tone": ["a", null], "show": true,
      "marks": [{"at": 1.5, "label": "mean"}], "unit": "%", "note": "y: loans"}
       bars, highlighted ones (hl) in the brand colour, the rest pale; tone colours bars by group; show prints each value;
       a mark is a dashed vertical line at a bar position (0 = the first bar's centre, 0.5 = between the first two).
     {"type": "intervals", "rows": [{"label": "sample 1", "lo": 1.2, "mid": 2.3, "hi": 3.4, "miss": false}],
      "ref": {"at": 2.5, "label": "true value"}, "min": 0, "max": 5, "unit": "%"}
       one horizontal interval per row with its point; "miss" rows (an interval that misses the reference) in red. */
  var TONE = { a: '#14b8a6', b: '#f59e0b', c: '#8b5cf6', d: '#f43f5e', e: '#0ea5e9' };
  function num(v, unit) {
    var s = Math.abs(v) >= 1000 ? String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(Math.round(v * 100) / 100);
    return s + (unit || '');
  }
  function bars(c) {
    var W = 360, H = 210, L = 8, R = 8, top = c.marks && c.marks.length ? 38 : 22, bottom = 34, n = c.values.length, max = Math.max.apply(null, c.values.concat([0])) || 1;
    var bw = (W - L - R) / n, h = H - top - bottom, hl = c.hl || [], out = '';
    c.values.forEach(function (v, i) {
      var bh = Math.max(1, h * v / max), x = L + i * bw + bw * 0.12, y = top + h - bh;
      var fill = c.tone && c.tone[i] ? TONE[c.tone[i]] : hl.indexOf(i) >= 0 ? 'var(--brand, #0f766e)' : '#99d5cd';
      out += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + (bw * 0.76).toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="3" fill="' + fill + '"/>';
      if (c.show) out += '<text x="' + (x + bw * 0.38).toFixed(1) + '" y="' + (y - 4).toFixed(1) + '" class="pc-v">' + esc(num(v, c.unit)) + '</text>';
      out += '<text x="' + (x + bw * 0.38).toFixed(1) + '" y="' + (H - bottom + 14) + '" class="pc-x">' + esc(c.labels[i]) + '</text>';
    });
    out += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + (top + h) + '" y2="' + (top + h) + '" class="pc-axis"/>';
    (c.marks || []).forEach(function (m) {
      var x = L + (m.at + 0.5) * bw;
      out += '<line x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="16" y2="' + (top + h) + '" class="pc-mark"/>' +
        '<text x="' + x.toFixed(1) + '" y="11" class="pc-m">' + esc(m.label) + '</text>';
    });
    if (c.note) out += '<text x="' + L + '" y="' + (H - 4) + '" class="pc-note">' + esc(c.note) + '</text>';
    return '<svg class="pic-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img">' + out + '</svg>';
  }
  function intervals(c) {
    var W = 360, row = 24, top = c.ref ? 24 : 8, lab = 92, R = 14, n = c.rows.length, H = top + n * row + 22;
    var lo = c.min != null ? c.min : Math.min.apply(null, c.rows.map(function (r) { return r.lo; }));
    var hi = c.max != null ? c.max : Math.max.apply(null, c.rows.map(function (r) { return r.hi; }));
    var X = function (v) { return lab + (W - lab - R) * (v - lo) / ((hi - lo) || 1); }, out = '';
    if (c.ref) out += '<line x1="' + X(c.ref.at).toFixed(1) + '" x2="' + X(c.ref.at).toFixed(1) + '" y1="' + (top - 6) + '" y2="' + (top + n * row) + '" class="pc-mark"/>' +
      '<text x="' + X(c.ref.at).toFixed(1) + '" y="' + (top - 9) + '" class="pc-m">' + esc(c.ref.label) + '</text>';
    c.rows.forEach(function (r, i) {
      var y = top + i * row + row / 2, cls = r.miss ? ' miss' : '';
      out += '<text x="' + (lab - 8) + '" y="' + (y + 4) + '" class="pc-l' + cls + '">' + esc(r.label) + '</text>' +
        '<line x1="' + X(r.lo).toFixed(1) + '" x2="' + X(r.hi).toFixed(1) + '" y1="' + y + '" y2="' + y + '" class="pc-iv' + cls + '"/>' +
        '<line x1="' + X(r.lo).toFixed(1) + '" x2="' + X(r.lo).toFixed(1) + '" y1="' + (y - 5) + '" y2="' + (y + 5) + '" class="pc-iv' + cls + '"/>' +
        '<line x1="' + X(r.hi).toFixed(1) + '" x2="' + X(r.hi).toFixed(1) + '" y1="' + (y - 5) + '" y2="' + (y + 5) + '" class="pc-iv' + cls + '"/>' +
        (r.mid != null ? '<circle cx="' + X(r.mid).toFixed(1) + '" cy="' + y + '" r="4" class="pc-dot' + cls + '"/>' : '');
    });
    var yb = top + n * row + 14;
    out += '<text x="' + lab + '" y="' + yb + '" class="pc-e" text-anchor="start">' + esc(num(lo, c.unit)) + '</text>' +
      '<text x="' + (W - R) + '" y="' + yb + '" class="pc-e" text-anchor="end">' + esc(num(hi, c.unit)) + '</text>';
    return '<svg class="pic-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img">' + out + '</svg>';
  }
  function chart(c) { return c.type === 'intervals' ? intervals(c) : bars(c); }

  function mount(pre) {
    var spec;
    try { spec = JSON.parse((pre.querySelector('code') || pre).textContent); }
    catch (e) { pre.insertAdjacentHTML('beforebegin', '<p class="quiz-error">' + T('A picture could not be read.', 'Не удалось прочитать рисунок.') + '</p>'); return; }
    var fig = document.createElement('figure');
    fig.className = 'pic' + (spec.stack ? ' pic-stack' : '');
    fig.id = 'pic' + (++uid);
    fig.innerHTML = (spec.title ? '<div class="pic-title">' + inline(spec.title) + '</div>' : '') +
      '<div class="pic-body' + (spec.chart ? ' pic-body-chart' : '') + '">' + (spec.chart ? chart(spec.chart) : '') + (spec.tables || []).map(table).join('') + (spec.links && spec.links.length ? '<svg class="pic-links" aria-hidden="true"></svg>' : '') + '</div>' +
      (spec.caption ? '<figcaption>' + inline(spec.caption) + '</figcaption>' : '');
    pre.parentNode.replaceChild(fig, pre);
    if (spec.links && spec.links.length) {
      paint(fig, spec);
      var again = function () { requestAnimationFrame(function () { draw(fig, spec); }); };
      again();
      if (window.ResizeObserver) new ResizeObserver(again).observe(fig.querySelector('.pic-body'));
      else window.addEventListener('resize', again);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(again);
    }
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(function () { Array.prototype.forEach.call(document.querySelectorAll('.markdown-section pre[data-lang="pic"]'), mount); });
  });
})();
