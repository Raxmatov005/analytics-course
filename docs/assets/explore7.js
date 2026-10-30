/* Going-further explorer types: working tools — a data dictionary (W3D4), a weekly report and Git (W5D4). Added to
explore.js's registry (window.ALExplore.types); see explore.js's header for the block format and the challenge rules.
Each type draws its playground into `body`, reports its numbers to check(vals, changed) and returns {redraw}.

  profile — W3D4. Real columns of the practice database ("tables": [{name, rows, grain, cols: [{c, t, d, n, lo, hi, m,
            v?, ok?, note?}]}]: name, type, distinct values, NULLs, min, max, the meaning, the values with their counts
            when there are 10 or fewer, the allowed values the dictionary promises, a note). Pick a table and a column:
            the profile (rows, distinct, NULL share, min, max, the values) and the dictionary line it fills, part by
            part, marked "from the profile" or "from the owner". "asOf": a date after it is impossible.
            numbers: key (1 = as many distinct values as rows and no NULL), nullShare, odd (1 = a date after the
            as-of), extra (values in the data beyond the allowed list), distinct, picked (columns looked at).
  git     — W5D4. A simulated repository (nothing touches her disk): the working folder, the staging area and the
            history as a small graph, with the exact command each button stands for and Git's own answer. "start":
            {files, branch (the second branch's name), first (the first commit's message), edits: {file: [one
            description per edit; the description becomes the commit message]}}. Real Git's rules, with two shortcuts
            said on screen: switching branches needs a clean folder, and a merge where both branches changed the same
            file stops (a conflict) instead of asking her to choose the lines.
            numbers: mine (commits she made), partial (1 = she committed one of two edited files after taking the other
            back out with restore --staged), merged (1 = main holds a commit made on the branch), emptyTry (1 = she
            ran git commit with an edit that was not staged), commits, staged, edited. */
(function () {
  var X = window.ALExplore;
  if (!X) return;
  var T = X.T, esc = X.esc, fmtText = X.fmtText, num = X.num;

  function nb(s) { return String(s).replace(/ /g, ' '); }   // "7 828" and "46.0 %" stay on one line
  function n0(x) { return nb(num(x)); }
  function pc(x) { return nb((x * 100).toFixed(1) + ' %'); }
  function seg(key, label, opts, cur, extra) {   // pill buttons, one of them on (explore.js's .xp-tg look)
    return '<div class="xp-tg' + (extra ? ' ' + extra : '') + '" data-g="' + key + '"><span class="xp-tg-l">' + label + '</span>' + opts.map(function (o) {
      var on = String(o[0]) === String(cur);
      return '<button type="button" data-o="' + esc(o[0]) + '" aria-pressed="' + on + '"' + (on ? ' class="on"' : '') + '>' + o[1] + '</button>';
    }).join('') + '</div>';
  }

  /* ---------- profile: what the column really holds, and the dictionary line it fills ---------- */
  X.types.profile = function (body, g, check) {
    var tabs = g.tables || [], asOf = g.asOf || '9999-12-31';
    var st = { t: 0, c: -1, seen: {} };
    function isDate(v) { return typeof v === 'string' && /^\d{4}-\d\d-\d\d/.test(v); }
    function show(v) { return v == null ? 'NULL' : typeof v === 'number' ? (Number.isInteger(v) ? n0(v) : String(v)) : esc(v); }
    function lit(v) { return typeof v === 'string' && !isDate(v) ? '<code>\'' + esc(v) + '\'</code>' : '<code>' + show(v) + '</code>'; }
    function byValue(a, b) { return typeof a === 'number' && typeof b === 'number' ? a - b : String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0; }
    body.innerHTML = '<div class="xp7-pick"></div><div class="xp7-prof"></div>' +
      '<div class="xp-note">' + T('Measured on the practice database, as of ' + asOf + '. The profile fills the parts marked “from the profile”; the meaning comes from the people who own the data.',
        'Измерено на учебной базе на ' + asOf + '. Профиль заполняет части с пометкой «из профиля»; смысл дают люди, которые отвечают за данные.') + '</div>';
    var pick = body.querySelector('.xp7-pick'), prof = body.querySelector('.xp7-prof');
    function drawPick() {
      var tb = tabs[st.t];
      pick.innerHTML = seg('t', T('Table', 'Таблица'), tabs.map(function (t, i) { return [i, '<code>' + esc(t.name) + '</code>']; }), st.t) +
        seg('c', T('Column — tap one to profile it', 'Столбец — нажмите, чтобы получить профиль'), tb.cols.map(function (c, i) { return [i, '<code>' + esc(c.c) + '</code>']; }), st.c, 'xp7-cols');
      pick.querySelectorAll('.xp-tg button').forEach(function (b) {
        b.onclick = function () {
          var k = b.parentNode.getAttribute('data-g'), v = Number(b.getAttribute('data-o'));
          if (k === 't') { if (v !== st.t) { st.t = v; st.c = -1; } }
          else st.c = v;
          drawPick(); redraw();
        };
      });
    }
    function line(k, v, src) {
      return '<div class="xp7-dl"><span class="xp7-dk">' + k + '</span><span class="xp7-dv">' + v + '</span>' +
        '<span class="xp7-src ' + (src ? 'p' : 'o') + '">' + (src ? T('from the profile', 'из профиля') : T('from the owner', 'от владельца')) + '</span></div>';
    }
    function redraw() {
      var tb = tabs[st.t], col = tb.cols[st.c];
      if (!col) {
        prof.innerHTML = '<div class="xp7-empty">' + T('Pick a column above: its profile and its dictionary line appear here.', 'Выберите столбец выше: здесь появятся его профиль и строка словаря.') + '</div>';
        check({ key: 0, nullShare: 0, odd: 0, extra: 0, distinct: 0, picked: Object.keys(st.seen).length }, {});
        return;
      }
      st.seen[tb.name + '.' + col.c] = 1;
      var rows = tb.rows, share = col.n / rows, key = col.d === rows && col.n === 0 ? 1 : 0;
      var date = isDate(col.lo), odd = date && col.hi > asOf ? 1 : 0, cat = !!col.v, extra = 0;
      if (col.ok && col.v) col.v.forEach(function (r) { if (col.ok.indexOf(r[0]) < 0) extra++; });
      var cells = [[T('rows', 'строк'), n0(rows), 'COUNT(*)'], [T('distinct values', 'разных значений'), n0(col.d), 'COUNT(DISTINCT …)'],
        ['NULL', col.n ? n0(col.n) + ' · ' + pc(share) : '0', 'SUM(… IS NULL)'], ['MIN', show(col.lo), ''], ['MAX', show(col.hi), '']];
      var o = '<div class="xp7-grid">' + cells.map(function (c, i) {
        var hot = (i === 1 && key) || (i === 2 && share > 0.4) || (i === 4 && odd);
        return '<div' + (hot ? ' class="hot"' : '') + '><span>' + c[0] + '</span><b>' + c[1] + '</b>' + (c[2] ? '<i>' + esc(c[2]) + '</i>' : '') + '</div>';
      }).join('') + '</div>';
      if (cat) {
        var top = col.v[0][1];
        o += '<div class="xp-mini-k">' + T('Every value, with its rows', 'Все значения и их строки') + '</div><div class="xp7-bars">' + col.v.map(function (r) {
          var bad = col.ok && col.ok.indexOf(r[0]) < 0;
          return '<div class="xp7-bar' + (bad ? ' bad' : '') + '"><span class="xp7-bl">' + lit(r[0]) + '</span><span class="xp7-bt"><i style="width:' + Math.max(1.5, 100 * r[1] / top).toFixed(1) + '%"></i></span><span class="xp7-bn">' + n0(r[1]) + '</span></div>';
        }).join('') + '</div>';
      }
      /* the dictionary line, part by part */
      var typ = esc(col.t) + (date ? T(' (a date)', ' (дата)') : '');
      var allowed = col.ok ? col.ok.map(lit).join(' / ') + (extra ? ' <b class="xp7-warn">' + T('— the data has ' + extra + ' more', '— в данных ещё ' + extra) + '</b>' : '')
        : cat ? col.v.map(function (r) { return r[0]; }).sort(byValue).map(lit).join(' / ')
        : T('from ', 'от ') + lit(col.lo) + T(' to ', ' до ') + lit(col.hi) + (odd ? ' <b class="xp7-warn">' + T('— after the as-of date', '— позже даты отчёта') + '</b>' : '');
      var nul = col.n ? pc(share) + ' — ' + T('write what NULL means', 'напишите, что значит NULL') : T('never NULL', 'NULL нет');
      o += '<div class="xp7-line"><div class="xp7-lh"><code>' + esc(tb.name) + '.' + esc(col.c) + '</code> <small>' + T('one row = ', 'одна строка = ') + esc(tb.grain) + '</small></div>' +
        line(T('type', 'тип'), typ, 1) + line(T('allowed', 'допустимо'), allowed, 1) + line('NULL', nul, 1) +
        (key ? line(T('key', 'ключ'), T('one value per row — a key candidate', 'одно значение на строку — кандидат в ключи'), 1) : '') +
        line(T('meaning', 'смысл'), esc(col.m), 0) + '</div>';
      if (col.note) o += '<div class="xp7-note">' + fmtText(col.note) + '</div>';
      var say = key ? T('<b>' + n0(col.d) + '</b> distinct values in <b>' + n0(rows) + '</b> rows and no NULL: every row has its own value, so this column can name a row.',
        '<b>' + n0(col.d) + '</b> разных значений в <b>' + n0(rows) + '</b> строках и ни одного NULL: у каждой строки своё значение, значит, столбец может называть строку.')
        : cat ? T('<b>' + col.d + '</b> distinct values: a category — the dictionary lists them' + (extra ? ', and the data holds <b>' + extra + '</b> it does not allow.' : '.'),
          '<b>' + col.d + '</b> разных значений: это категория — словарь перечисляет их' + (extra ? ', а в данных ещё <b>' + extra + '</b> недопустимых.' : '.'))
        : T('<b>' + n0(col.d) + '</b> distinct values in ' + n0(rows) + ' rows: a range, from ' + show(col.lo) + ' to ' + show(col.hi) + '.',
          '<b>' + n0(col.d) + '</b> разных значений в ' + n0(rows) + ' строках: это диапазон, от ' + show(col.lo) + ' до ' + show(col.hi) + '.');
      o += '<div class="xp-say">' + say + '</div>';
      prof.innerHTML = o;
      check({ key: key, nullShare: share, odd: odd, extra: extra, distinct: col.d, picked: Object.keys(st.seen).length }, {});
    }
    drawPick(); redraw();
    return { redraw: redraw };
  };

  /* ---------- git: the working folder, the staging area and the history ---------- */
  X.types.git = function (body, g, check) {
    var s0 = g.start || {}, FILES = s0.files || ['weekly_report.py', 'README.md'], BR = s0.branch || 'fix-dates', EDITS = s0.edits || {};
    var S, desc;
    function hex(i, msg) {   // the same short id for the same commit every time
      var h = 2166136261, str = i + ':' + msg;
      for (var k = 0; k < str.length; k++) { h ^= str.charCodeAt(k); h = Math.imul(h, 16777619) >>> 0; }
      return ('0000000' + h.toString(16)).slice(-7);
    }
    function copy(o) { var r = {}; Object.keys(o).forEach(function (k) { r[k] = o[k]; }); return r; }
    function reset() {
      var tree = {};
      desc = {};
      FILES.forEach(function (f, i) { tree[f] = i + 1; desc[i + 1] = ''; });
      var first = s0.first || 'First commit';
      S = { wd: copy(tree), ix: copy(tree), commits: [{ id: hex(0, first), msg: first, parents: [], tree: tree, br: 'main' }],
        heads: { main: 0 }, head: 'main', n: FILES.length, k: {}, term: [], restored: 0, mine: 0, partial: 0, emptyTry: 0 };
    }
    reset();
    function tip() { return S.commits[S.heads[S.head]]; }
    function changed(a, b) { return FILES.filter(function (f) { return a[f] !== b[f]; }); }
    function anc(i) {   // every commit reachable from commit i, i included
      var seen = {}, todo = [i];
      while (todo.length) { var j = todo.pop(); if (seen[j]) continue; seen[j] = 1; S.commits[j].parents.forEach(function (p) { todo.push(p); }); }
      return seen;
    }
    function say(cmd, out, cls) { S.term.push({ cmd: cmd, out: out || '', cls: cls || '' }); if (S.term.length > 3) S.term.shift(); }
    function dirty() { var t = tip().tree; return changed(S.wd, t).length + changed(S.ix, t).length > 0; }
    function other() { return S.head === 'main' ? BR : 'main'; }
    function files(n) { return ' ' + n + (n === 1 ? ' file changed' : ' files changed'); }
    var act = {
      edit: function (f) {
        var list = EDITS[f] || [T('Change a line', 'Изменить строку')], k = S.k[f] || 0;
        S.k[f] = k + 1; S.n++; S.wd[f] = S.n; desc[S.n] = list[k % list.length];
        say('', T('✎ You changed ', '✎ Вы изменили ') + f + T(' in the folder: ', ' в папке: ') + desc[S.n], 'note');
      },
      add: function (f) {
        if (S.ix[f] === S.wd[f]) return say('git add ' + f, T('(no output: nothing new in this file to stage)', '(нет вывода: в этом файле нечего подготавливать)'), 'note');
        S.ix[f] = S.wd[f]; say('git add ' + f, '');
      },
      unstage: function (f) { S.ix[f] = tip().tree[f]; S.restored = 1; say('git restore --staged ' + f, ''); },
      commit: function () {
        var t = tip(), ch = changed(S.ix, t.tree);
        if (!ch.length) {
          var wch = changed(S.wd, t.tree);
          if (!wch.length) return say('git commit -m "…"', 'nothing to commit, working tree clean', 'bad');
          S.emptyTry = 1;
          return say('git commit -m "…"', 'On branch ' + S.head + '\nChanges not staged for commit:\n' + wch.map(function (f) { return '  modified: ' + f; }).join('\n') +
            '\nno changes added to commit (use "git add")', 'bad');
        }
        var msg = desc[S.ix[ch[0]]] || 'Update', i = S.commits.length;
        var still = changed(S.wd, S.ix).filter(function (f) { return ch.indexOf(f) < 0; });
        if (ch.length === 1 && still.length && S.restored) S.partial = 1;
        S.commits.push({ id: hex(i, msg), msg: msg, parents: [S.heads[S.head]], tree: copy(S.ix), br: S.head });
        S.heads[S.head] = i; S.mine++; S.restored = 0;
        say('git commit -m "' + msg + '"', '[' + S.head + ' ' + S.commits[i].id + '] ' + msg + '\n' + files(ch.length), 'ok');
      },
      branch: function () {
        if (S.heads[BR] != null) return say('git branch ' + BR, 'fatal: a branch named \'' + BR + '\' already exists', 'bad');
        S.heads[BR] = S.heads[S.head];
        say('git branch ' + BR, T('(no output: the new branch points at ' + tip().id + ', where you are now)', '(нет вывода: новая ветка указывает на ' + tip().id + ', где вы сейчас)'), 'note');
      },
      sw: function () {
        var to = other();
        if (S.heads[to] == null) return say('git switch ' + to, 'fatal: invalid reference: ' + to + T('\n(create it first: git branch ' + to + ')', '\n(сначала создайте её: git branch ' + to + ')'), 'bad');
        if (dirty()) return say('git switch ' + to, T('Commit (or restore) your changes first: this playground switches only from a clean folder. Real Git sometimes carries them along.',
          'Сначала закоммитьте (или верните) изменения: здесь переключаться можно только из чистой папки. Настоящий Git иногда переносит их с собой.'), 'bad');
        S.head = to; S.wd = copy(tip().tree); S.ix = copy(tip().tree);
        say('git switch ' + to, 'Switched to branch \'' + to + '\'', 'ok');
      },
      merge: function () {
        var from = other(), cmd = 'git merge ' + from;
        if (S.heads[from] == null) return say(cmd, 'merge: ' + from + ' - not something we can merge', 'bad');
        if (dirty()) return say(cmd, T('Commit your changes before merging.', 'Закоммитьте изменения перед слиянием.'), 'bad');
        var a = S.heads[S.head], b = S.heads[from], A = anc(a), B = anc(b);
        if (A[b]) return say(cmd, 'Already up to date.', 'note');
        if (B[a]) {
          S.heads[S.head] = b; S.wd = copy(S.commits[b].tree); S.ix = copy(S.commits[b].tree);
          return say(cmd, 'Updating ' + S.commits[a].id + '..' + S.commits[b].id + '\nFast-forward' +
            T('\n(' + S.head + ' had no new commits, so it simply moves up to ' + from + ')', '\n(на ' + S.head + ' не было новых коммитов, поэтому она просто сдвигается к ' + from + ')'), 'ok');
        }
        var base = -1;
        Object.keys(A).forEach(function (j) { j = Number(j); if (B[j] && j > base) base = j; });
        var O = S.commits[base].tree, Ta = S.commits[a].tree, Tb = S.commits[b].tree, tree = {}, clash = [];
        FILES.forEach(function (f) {
          if (Ta[f] === Tb[f] || Tb[f] === O[f]) tree[f] = Ta[f];
          else if (Ta[f] === O[f]) tree[f] = Tb[f];
          else { tree[f] = Ta[f]; clash.push(f); }
        });
        if (clash.length) return say(cmd, 'CONFLICT (content): Merge conflict in ' + clash.join(', ') + T('\n(Both branches changed it. Real Git now asks you to choose the lines; this playground stops — change different files on the two branches.)',
          '\n(Обе ветки изменили его. Настоящий Git попросит выбрать строки; здесь игра останавливается — меняйте на двух ветках разные файлы.)'), 'bad');
        var i = S.commits.length, msg = 'Merge branch \'' + from + '\'';
        S.commits.push({ id: hex(i, msg), msg: msg, parents: [a, b], tree: tree, br: S.head, merge: 1 });
        S.heads[S.head] = i; S.wd = copy(tree); S.ix = copy(tree);
        say(cmd, 'Merge made by the \'ort\' strategy.', 'ok');
      },
      again: function () { reset(); say('', T('A fresh copy of the repository: one commit on main.', 'Свежая копия репозитория: один коммит на main.'), 'note'); }
    };
    body.innerHTML = '<div class="xp7-head"></div><div class="xp7-git">' +
      '<div class="xp7-pane"><div class="xp7-pk">' + T('Working folder — your files on disk', 'Рабочая папка — ваши файлы на диске') + '</div><div class="xp7-wd"></div></div>' +
      '<div class="xp7-pane"><div class="xp7-pk">' + T('Staging area — what the next commit saves', 'Область подготовки — что сохранит следующий коммит') + '</div><div class="xp7-ix"></div></div></div>' +
      '<div class="xp-btns xp7-cmds"></div><div class="xp7-term" aria-live="polite"></div>' +
      '<div class="xp-mini-k">' + T('History — every commit, the newest on the right', 'История — все коммиты, новые справа') + '</div>' +
      '<svg class="xp7-svg" viewBox="0 0 400 60" role="img"></svg><div class="xp7-log"></div>' +
      '<div class="xp-note">' + T('A simulation: nothing here touches your disk. Two shortcuts, both said on screen when you meet them: switching branches needs a clean folder, and a merge of one file changed on both branches stops.',
        'Это симуляция: здесь ничего не трогает ваш диск. Два упрощения, о которых сказано, когда вы на них наткнётесь: переключать ветки можно только из чистой папки, а слияние файла, изменённого на обеих ветках, останавливается.') + '</div>';
    var svg = body.querySelector('svg');
    function fileRow(f, where) {
      var t = tip().tree, w = S.wd[f] !== S.ix[f], x = S.ix[f] !== t[f], name = '<span class="xp7-f">' + esc(f) + '</span>';
      if (where === 'wd') {
        var stat = w ? T('edited — not staged', 'изменён — не подготовлен') : x ? T('edited — staged', 'изменён — подготовлен') : T('same as the last commit', 'как в последнем коммите');
        return '<div class="xp7-file' + (w ? ' w' : x ? ' s' : '') + '"><div class="xp7-fn">' + name + '<small>' + stat + (w || x ? ' · ' + esc(desc[S.wd[f]] || '') : '') + '</small></div>' +
          '<div class="xp7-fb"><button type="button" class="xp-btn xp-ghost" data-a="edit" data-f="' + esc(f) + '">' + T('✎ edit', '✎ изменить') + '</button>' +
          '<button type="button" class="xp-btn" data-a="add" data-f="' + esc(f) + '">git add</button></div></div>';
      }
      return '<div class="xp7-file s"><div class="xp7-fn">' + name + '<small>' + esc(desc[S.ix[f]] || '') + '</small></div>' +
        '<div class="xp7-fb"><button type="button" class="xp-btn xp-ghost" data-a="unstage" data-f="' + esc(f) + '">git restore --staged</button></div></div>';
    }
    function graph() {
      var C = S.commits, n = C.length, two = S.heads[BR] != null || C.some(function (c) { return c.br !== 'main'; });
      var W = Math.round(svg.getBoundingClientRect().width) || 400;
      W = Math.max(280, Math.min(600, W));
      var Y1 = 34, Y2 = 84, H = two ? 118 : 60, step = n > 1 ? Math.min(60, (W - 56) / (n - 1)) : 0;
      function x(i) { return 28 + i * step; }
      function y(c) { return c.br === 'main' ? Y1 : Y2; }
      var o = '<line class="xp7-lane" x1="8" x2="' + (W - 8) + '" y1="' + Y1 + '" y2="' + Y1 + '"/>' + (two ? '<line class="xp7-lane b" x1="8" x2="' + (W - 8) + '" y1="' + Y2 + '" y2="' + Y2 + '"/>' : '');
      C.forEach(function (c, i) { c.parents.forEach(function (p) {
        o += '<line class="xp7-edge' + (y(c) === Y2 || y(C[p]) === Y2 ? ' b' : '') + '" x1="' + x(p).toFixed(1) + '" y1="' + y(C[p]) + '" x2="' + x(i).toFixed(1) + '" y2="' + y(c) + '"/>';
      }); });
      var reach = anc(S.heads[S.head]);
      C.forEach(function (c, i) {
        o += '<circle class="xp7-dot' + (c.br === 'main' ? '' : ' b') + (reach[i] ? '' : ' off') + (c.merge ? ' m' : '') + '" cx="' + x(i).toFixed(1) + '" cy="' + y(c) + '" r="' + (c.merge ? 7 : 6) + '"/>';
      });
      /* one label per tip: "HEAD → main, fix-dates"; above the lane, or below it when the place above is taken */
      var tags = {};
      Object.keys(S.heads).sort(function (a, b) { return a === 'main' ? -1 : b === 'main' ? 1 : 0; }).forEach(function (b) { (tags[S.heads[b]] = tags[S.heads[b]] || []).push(b); });
      var used = {};
      Object.keys(tags).map(Number).sort(function (a, b) { return a - b; }).forEach(function (i) {
        var c = C[i], label = tags[i].map(function (b) { return (b === S.head ? 'HEAD → ' : '') + b; }).join(', ');
        var w = label.length * 6.3 + 14, tx = Math.min(W - 4 - w, Math.max(4, x(i) - w / 2)), rowsAt = y(c) === Y1 ? [Y1 - 28, Y1 + 11] : [Y2 + 11, Y2 - 28], ty = rowsAt[0];
        if (used[ty] != null && used[ty] > tx - 4) ty = rowsAt[1];
        used[ty] = tx + w;
        var on = tags[i].indexOf(S.head) >= 0;
        o += '<rect class="xp7-tag' + (on ? ' on' : '') + '" x="' + tx.toFixed(1) + '" y="' + ty + '" width="' + w.toFixed(1) + '" height="17" rx="8.5"/>' +
          '<text class="xp7-tagt' + (on ? ' on' : '') + '" x="' + (tx + w / 2).toFixed(1) + '" y="' + (ty + 12.5) + '" text-anchor="middle">' + esc(label) + '</text>';
      });
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.innerHTML = o;
      var list = Object.keys(reach).map(Number).sort(function (a, b) { return b - a; }).slice(0, 5);
      body.querySelector('.xp7-log').innerHTML = '<div class="xp7-lk">$ git log --oneline</div>' + list.map(function (i) {
        var names = (tags[i] || []).map(function (b) { return b === S.head ? 'HEAD -> ' + b : b; });
        return '<div><span class="xp7-id">' + C[i].id + '</span> ' + (names.length ? '<span class="xp7-ref">(' + esc(names.join(', ')) + ')</span> ' : '') + esc(C[i].msg) + '</div>';
      }).join('') + (Object.keys(reach).length > 5 ? '<div class="xp7-more">…</div>' : '');
    }
    function redraw() {
      var t = tip().tree, staged = changed(S.ix, t), edited = changed(S.wd, S.ix), to = other();
      body.querySelector('.xp7-head').innerHTML = T('On branch ', 'На ветке ') + '<b class="xp7-br">' + esc(S.head) + '</b> · ' + T('commits: ', 'коммитов: ') + '<b>' + S.commits.length + '</b>';
      body.querySelector('.xp7-wd').innerHTML = FILES.map(function (f) { return fileRow(f, 'wd'); }).join('');
      body.querySelector('.xp7-ix').innerHTML = staged.length ? staged.map(function (f) { return fileRow(f, 'ix'); }).join('')
        : '<div class="xp7-empty">' + T('Empty: a commit now would save nothing.', 'Пусто: коммит сейчас ничего не сохранит.') + '</div>';
      body.querySelector('.xp7-cmds').innerHTML = '<button type="button" class="xp-btn" data-a="commit">git commit</button>' +
        '<button type="button" class="xp-btn xp-ghost" data-a="branch">git branch ' + esc(BR) + '</button>' +
        '<button type="button" class="xp-btn xp-ghost" data-a="sw">git switch ' + esc(to) + '</button>' +
        '<button type="button" class="xp-btn xp-ghost" data-a="merge">git merge ' + esc(to) + '</button>' +
        '<button type="button" class="xp-btn xp-ghost xp7-again" data-a="again">' + T('Start again', 'Сначала') + '</button>';
      body.querySelector('.xp7-term').innerHTML = S.term.length ? S.term.map(function (r) {
        return (r.cmd ? '<div class="xp7-cmd">$ ' + esc(r.cmd) + '</div>' : '') + (r.out ? '<div class="xp7-out ' + r.cls + '">' + esc(r.out).replace(/\n/g, '<br>') + '</div>' : '');
      }).join('') : '<div class="xp7-out note">' + T('Each button is one command. Its exact text and Git’s answer appear here.', 'Каждая кнопка — одна команда. Здесь появятся её точный текст и ответ Git.') + '</div>';
      graph();
      var main = anc(S.heads.main), merged = Object.keys(main).some(function (i) { return S.commits[i].br !== 'main'; }) ? 1 : 0;
      check({ mine: S.mine, partial: S.partial, merged: merged, emptyTry: S.emptyTry, commits: S.commits.length, staged: staged.length, edited: edited.length }, {});
    }
    body.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-a]');
      if (!b || !body.contains(b) || !act[b.getAttribute('data-a')]) return;
      act[b.getAttribute('data-a')](b.getAttribute('data-f'));
      redraw();
    });
    redraw();
    return { redraw: redraw };
  };
})();
