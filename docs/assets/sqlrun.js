/* SQL in the browser (Docsify plugin), on the real Nur Finance database, with sql.js (SQLite compiled for the web).

1. Every ```sql example on a page becomes an editable box with ▶ Run (SQL Server spellings like TOP, YEAR(), GETDATE()
   are translated the way scripts/check.py does). Runs happen on a playground copy, so DDL/INSERT exercises work.
2. A ```sqltask block becomes the homework workspace: one editor per task, ▶ Run, ✔ Check (OK / not yet, against the
   same salted fingerprints as scripts/check.py, on an untouched copy of the data), work saved in this browser, and
   📤 Submit once every task passes: the course bot (bot/worker.js /submit) records it and tells the mentor.
   {"check": "hw1.2", "lesson": "W1D2", "tasks": [{"id": "Q1", "q": "…"}, {"id": "note", "file": "surprised.md", "text": true, "q": "…"}]}
The website is connected to her once from the bot (🔑 a link with ?wk=<key>); the key lives in this browser only.
Work in progress is kept in localStorage "al.sql". */
(function () {
  var ENGINE = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/';
  var REPO_RAW = 'https://raw.githubusercontent.com/Raxmatov005/analytics-course/main/';
  var WORKER = 'https://nur-feedback-bot.sohajon2005.workers.dev';
  var BOT = 'https://t.me/Nur_Analytics_Course_bot?start=';
  var KEY = 'al.sql', WK = 'al.wk';   // its own key: quiz.js / challenge.js rewrite al.v1 wholesale
  var engine = null, play = null, clean = null, checks = null;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function store() { try { var s = JSON.parse(localStorage.getItem(KEY)) || {}; s.sql = s.sql || {}; return s; } catch (e) { return { sql: {} }; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private window */ } }
  function wk() { try { return localStorage.getItem(WK); } catch (e) { return null; } }
  /* words in the page's language (lang.js), looked up while a box is drawn; Russian counts: 1 строка, 2 строки, 5 строк */
  function T(en, ru) { return window.ALLang ? window.ALLang.t(en, ru) : en; }
  function plural(n, one, few, many) {
    var a = Math.abs(n) % 100, b = a % 10;
    return a > 10 && a < 20 ? many : b === 1 ? one : b > 1 && b < 5 ? few : many;
  }
  function rowsWord(n) { return T(n === 1 ? 'row' : 'rows', plural(n, 'строка', 'строки', 'строк')); }
  function loadingText() { return T('Opening the Nur Finance database (first time only)…', 'Открываем базу данных Nur Finance (только в первый раз)…'); }
  function runningText() { return play ? T('Running…', 'Выполняется…') : loadingText(); }

  /* the key arrives once as ?wk=… from the bot's "Connect the website" link */
  (function takeKey() {
    var m = /[?&]wk=([A-Za-z0-9]{16,64})/.exec(location.search);
    if (!m) return;
    try { localStorage.setItem(WK, m[1]); } catch (e) { /* nothing */ }
    history.replaceState(null, '', location.pathname + location.hash);
  })();

  function loadScript(src) {
    return new Promise(function (ok, bad) { var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = bad; document.head.appendChild(s); });
  }
  /* The data: a gzip copy of data/raw/nur.db served by the site itself (4 MB instead of 9.6; bot/pack_db.py makes it),
     kept in the browser's cache after the first visit. Old browsers fall back to the plain file on GitHub. */
  var DB_GZ = 'assets/nur.db.gz?v=1';
  function mb(n) { return (n / 1048576).toFixed(1); }
  function progress(got, total) {
    Array.prototype.forEach.call(document.querySelectorAll('.sq-loading'), function (el) {
      el.textContent = T('Opening the Nur Finance database (first time only) — ' + mb(got) + (total ? ' of ' + mb(total) : '') + ' MB…',
        'Открываем базу данных Nur Finance (только в первый раз) — ' + mb(got) + (total ? ' из ' + mb(total) : '') + ' МБ…');
    });
  }
  function download(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var total = Number(r.headers.get('content-length')) || 0;
      if (!r.body || !r.body.getReader) return r.arrayBuffer();
      var rd = r.body.getReader(), parts = [], got = 0;
      return (function pump() {
        return rd.read().then(function (x) {
          if (x.done) {
            var all = new Uint8Array(got), o = 0;
            parts.forEach(function (p) { all.set(p, o); o += p.length; });
            return all.buffer;
          }
          parts.push(x.value); got += x.value.length; progress(got, total);
          return pump();
        });
      })();
    });
  }
  function gunzip(buf) {
    var b = new Uint8Array(buf);
    if (b[0] !== 0x1f || b[1] !== 0x8b) return Promise.resolve(buf);   // the network already unpacked it
    return new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  }
  function dbBytes() {
    var box = window.caches ? caches.open('al-db').catch(function () { return null; }) : Promise.resolve(null);
    return box.then(function (c) {
      return (c ? c.match(DB_GZ).catch(function () { return null; }) : Promise.resolve(null)).then(function (hit) {
        if (hit) return hit.arrayBuffer().then(gunzip);
        return download(DB_GZ).then(function (buf) {
          return gunzip(buf).then(function (raw) {
            if (c) c.keys().then(function (ks) {   // keep only this version
              return Promise.all(ks.filter(function (k) { return k.url.indexOf('nur.db.gz') >= 0; }).map(function (k) { return c.delete(k); }));
            }).then(function () { return c.put(DB_GZ, new Response(buf)); }).catch(function () {});
            return raw;
          });
        });
      });
    }).catch(function () {
      return fetch(REPO_RAW + 'data/raw/nur.db').then(function (r) { return r.arrayBuffer(); });
    });
  }
  /* her practice copy lives in IndexedDB (the browser's own storage, big enough for 10 MB): key "play" in "al-db" */
  var SQLJS = null, base = null, saveTimer = null;
  function idb(op, value) {
    return new Promise(function (ok) {
      try {
        var rq = indexedDB.open('al-db', 1);
        rq.onupgradeneeded = function () { rq.result.createObjectStore('kv'); };
        rq.onerror = function () { ok(null); };
        rq.onsuccess = function () {
          var tx = rq.result.transaction('kv', op === 'get' ? 'readonly' : 'readwrite'), st = tx.objectStore('kv');
          var r = op === 'get' ? st.get('play') : op === 'put' ? st.put(value, 'play') : st.delete('play');
          r.onsuccess = function () { ok(op === 'get' ? r.result || null : true); };
          r.onerror = function () { ok(null); };
        };
      } catch (e) { ok(null); }
    });
  }
  var CHANGES = /\b(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|REPLACE)\b/i;
  function runPlay(text) {   // every run on her copy; a change is saved shortly after, and the Database panel refreshes
    var res = run(play, text, false);
    if (CHANGES.test(stripComments(text)) && res.ran) {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () { idb('put', play.export()); }, 300);
      document.dispatchEvent(new Event('al-db-changed'));
    }
    return res;
  }
  function resetPlay() {
    if (!SQLJS || !base) return Promise.resolve();
    try { play.close(); } catch (e) { /* already closed */ }
    play = new SQLJS.Database(base.slice());
    return idb('delete').then(function () { document.dispatchEvent(new Event('al-db-changed')); });
  }
  function ready() {
    if (engine) return engine;
    engine = loadScript(ENGINE + 'sql-wasm.js')
      .then(function () { return window.initSqlJs({ locateFile: function (f) { return ENGINE + f; } }); })
      .then(function (SQL) {
        return Promise.all([dbBytes(), idb('get')]).then(function (a) {
          var bytes = new Uint8Array(a[0]);
          SQLJS = SQL; base = bytes;
          // her practice copy: whatever she created, inserted, updated or deleted, kept on this device until Reset
          try { play = a[1] ? new SQL.Database(a[1]) : new SQL.Database(bytes.slice()); }
          catch (e) { play = new SQL.Database(bytes.slice()); }
          clean = new SQL.Database(bytes.slice());  // checks always read the untouched data
        });
      });
    engine.catch(function () { engine = null; });
    return engine;
  }
  function loadChecks() {
    if (!checks) checks = fetch(REPO_RAW + 'checks/checks.json', { cache: 'no-store' }).then(function (r) { return r.json(); });
    return checks;
  }

  /* ---------- running SQL (mirrors scripts/check.py) ---------- */
  function translate(sql) {
    var s = sql.replace(/\[([^\]]+)\]/g, '"$1"').replace(/"?\bdbo"?\./gi, '')
      .replace(/\bYEAR\s*\(([^()]+)\)/gi, "CAST(strftime('%Y', $1) AS INTEGER)")
      .replace(/\bMONTH\s*\(([^()]+)\)/gi, "CAST(strftime('%m', $1) AS INTEGER)")
      .replace(/\bDAY\s*\(([^()]+)\)/gi, "CAST(strftime('%d', $1) AS INTEGER)")
      .replace(/\bISNULL\s*\(/gi, 'IFNULL(').replace(/\bLEN\s*\(/gi, 'LENGTH(').replace(/\bGETDATE\s*\(\s*\)/gi, "'2026-10-01'")
      // DATEDIFF(day|month|year, a, b) with simple arguments (a column, a literal or one function call)
      .replace(/\bDATEDIFF\s*\(\s*(day|dd|d|month|mm|m|year|yy|yyyy)\s*,\s*([^,()]+(?:\([^()]*\))?)\s*,\s*([^,()]+(?:\([^()]*\))?)\s*\)/gi, function (all, part, a, b) {
        part = part.toLowerCase();
        if (part[0] === 'd') return 'CAST(julianday(' + b + ') - julianday(' + a + ') AS INTEGER)';
        var y = "(CAST(strftime('%Y', " + b + ") AS INTEGER) - CAST(strftime('%Y', " + a + ") AS INTEGER))";
        return part[0] === 'y' ? y : '(' + y + " * 12 + CAST(strftime('%m', " + b + ") AS INTEGER) - CAST(strftime('%m', " + a + ') AS INTEGER))';
      });
    var m = /\bSELECT\s+(DISTINCT\s+)?TOP\s*\(?\s*(\d+)\s*\)?/i.exec(s);
    if (m) s = s.slice(0, m.index) + 'SELECT ' + (m[1] || '') + s.slice(m.index + m[0].length).replace(/;\s*$/, '') + ' LIMIT ' + m[2];
    return s;
  }
  function stripComments(sql) {
    return sql.replace(/\/\*[\s\S]*?\*\//g, ' ').split('\n').map(function (l) { return l.split('--')[0]; }).join('\n');
  }
  /* run every statement; returns {last: {columns, values} | null, cells, rows, error} */
  function run(db, text, readOnly) {
    var out = { last: null, cells: [], rows: null, error: null, ran: 0 };
    stripComments(text).split(';').filter(function (s) { return s.trim(); }).forEach(function (stmt) {
      if (/^\s*(USE|GO)\b/i.test(stmt)) return;
      if (readOnly && /^\s*(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE)\b/i.test(stmt)) return;
      var tries = [stmt, translate(stmt)], done = false;
      for (var i = 0; i < tries.length && !done; i++) {
        try {
          var res = db.exec(tries[i]);
          out.error = null; out.ran++;
          if (res.length) {
            var r = res[res.length - 1];
            out.last = r; out.rows = r.values.length;
            r.values.forEach(function (row) { row.forEach(function (v) { out.cells.push(v); }); });
          } else if (/^\s*(SELECT|WITH)\b/i.test(tries[i])) { out.last = { columns: [], values: [] }; out.rows = 0; }
          else { out.changed = (out.changed || 0) + db.getRowsModified(); out.kind = (/^\s*(\w+)/.exec(tries[i]) || [])[1]; }
          done = true;
        } catch (e) { out.error = e.message; }
      }
    });
    return out;
  }
  function table(res) {
    if (res.error) return '<div class="sq-err">⚠ ' + esc(res.error) + '</div>' + hint(res.error);
    if (!res.last) {
      var kind = (res.kind || '').toUpperCase(), ch = res.changed;
      return '<div class="sq-done">' + T('✓ Done', '✓ Готово') + (/INSERT|UPDATE|DELETE|REPLACE/.test(kind) ? ' — ' + ch + ' ' + rowsWord(ch) + T(' changed', ' ' + plural(ch, 'изменена', 'изменены', 'изменено')) :
        /CREATE|DROP|ALTER/.test(kind) ? (kind === 'DROP' ? T(' — table removed', ' — таблица удалена') : kind === 'CREATE' ? T(' — table created', ' — таблица создана') : T(' — table changed', ' — таблица изменена')) : '') +
        T('. Saved in your practice copy of the database (Database → Reset brings back the original).',
          '. Сохранено в вашей учебной копии базы (База данных → Сбросить вернёт исходные данные).') + '</div>';
    }
    var r = res.last, shown = r.values.slice(0, 50);
    var saved = res.changed != null ? '<div class="sq-done">' + T('✓ Your changes are saved in your practice copy of the database.', '✓ Ваши изменения сохранены в учебной копии базы.') + '</div>' : '';
    if (!r.columns.length) return saved + '<div class="sq-note">' + T('0 rows.', '0 строк.') + '</div>';
    return saved + '<div class="sq-note">' + r.values.length + ' ' + rowsWord(r.values.length) + (r.values.length > 50 ? T(' (first 50 shown)', ' (показаны первые 50)') : '') + '</div>' +
      '<div class="sq-scroll"><table class="sq-table"><thead><tr>' + r.columns.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') +
      '</tr></thead><tbody>' + shown.map(function (row) { return '<tr>' + row.map(function (v) { return '<td>' + (v === null ? '<i>NULL</i>' : esc(v)) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody></table></div>';
  }

  /* ---------- checking without knowing the answer (fingerprints as in scripts/check.py) ---------- */
  function sha(text) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (b) {
      return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('').slice(0, 24);
    });
  }
  function toNum(v) {
    if (v === null || typeof v === 'boolean') return null;
    if (typeof v === 'number') return v;
    var s = String(v).trim().replace(/[\s ,]/g, '').replace(/%$/, '');
    if (s === '' || isNaN(Number(s))) return null;
    return Number(s);
  }
  function fingerprints(n, dp, salt) {   // Python rounds halves to even, JavaScript up: try both sides of a half
    var c = {};
    [n, n * (1 + 1e-12), n * (1 - 1e-12)].forEach(function (x) { c[x.toFixed(dp)] = 1; });
    return Promise.all(Object.keys(c).map(function (s) { return sha(salt + s); }));
  }
  function bagHas(nums, exp, salt) {
    return Promise.all(nums.map(function (n) {
      return Promise.all([fingerprints(n, exp.dp, salt), fingerprints(n * 100, exp.dp, salt)]).then(function (a) { return a[0].concat(a[1]).indexOf(exp.h) >= 0; });
    })).then(function (hits) { return hits.indexOf(true) >= 0; });
  }
  function checkTask(text, exp, salt) {
    var res = run(clean, text, true);
    if (res.error && !res.last) return Promise.resolve({ ok: false, why: T('the query did not run: ', 'запрос не выполнился: ') + res.error });
    var nums = res.cells.map(toNum).filter(function (n) { return n !== null; });
    var vals = (exp.values || []).map(function (e) { return bagHas(nums, e, salt); });
    var rows = exp.rows ? bagHas([res.rows || 0], exp.rows, salt) : Promise.resolve(true);
    return Promise.all([Promise.all(vals), rows]).then(function (a) {
      var vOk = a[0].every(Boolean), rOk = a[1];
      return { ok: vOk && rOk && res.last !== null, res: res,
        why: !res.last ? T('no result yet', 'результата пока нет') : !vOk ? T('a number in the result is not the expected one', 'одно из чисел в результате не то, что ожидается')
          : !rOk ? T('the number of rows (' + res.rows + ') is not the expected one', 'число строк (' + res.rows + ') не то, что ожидается') : '' };
    });
  }

  /* ---------- 1. runnable examples ---------- */
  /* what an error means here, in plain words, with what to do */
  var VIEWS = { v_payments_clean: 1, v_loan_status: 2, v_portfolio_monthly: 6 };   // section of week 3 day 4 that creates each view
  function hint(err) {
    var m = /no such table: (\w+)/i.exec(err), h = '';
    var link = window.ALLang ? window.ALLang.link('#/weeks/week-03/day-4') : '#/weeks/week-03/day-4', name = m ? '<code>' + esc(m[1]) + '</code>' : '';
    if (m && VIEWS[m[1]]) h = T('This uses the view ' + name + ', which you build in <a href="' + link + '">Week 3 · Day 4</a> (section ' +
      VIEWS[m[1]] + '). Run its <code>CREATE VIEW</code> box once — the view then stays in your practice copy of the database. ',
      'Здесь используется представление ' + name + ', которое вы создаёте в <a href="' + link + '">Неделя 3 · День 4</a> (раздел ' +
      VIEWS[m[1]] + '). Выполните там один раз блок с <code>CREATE VIEW</code> — после этого представление останется в вашей учебной копии базы. ') +
      '<button type="button" class="sq-build-views">' + T('Build the course views now', 'Создать представления курса сейчас') + '</button>';
    else if (m && /^(scratch_|my_|t_|tmp)/i.test(m[1])) h = T(name + ' is not in your practice copy yet — run the box on this page that creates it (<code>CREATE TABLE …</code>) first.',
      name + ' пока нет в вашей учебной копии — сначала выполните блок на этой странице, который её создаёт (<code>CREATE TABLE …</code>).');
    else if (m && ABOUT_NAMES.indexOf(m[1]) < 0) h = T(name + ' is not a table: it is probably a name from a <code>WITH … AS (…)</code> part shown above. Put that part in front of this one and run them together. Or check the name in the Database panel.',
      name + ' — не таблица: скорее всего, это имя из части <code>WITH … AS (…)</code> выше. Поставьте ту часть перед этой и выполните их вместе. Или проверьте имя в панели «База данных».');
    else if (/already exists/i.test(err)) h = T('You created it before — it is still in your practice copy. Skip that line, or remove it first with <code>DROP TABLE name;</code> (or Database → ↺ Reset).',
      'Вы уже создавали её раньше — она всё ещё в вашей учебной копии. Пропустите эту строку или сначала удалите таблицу командой <code>DROP TABLE name;</code> (или База данных → ↺ Сбросить).');
    else if (/UNIQUE constraint failed/i.test(err)) h = T('Those rows are already there — you probably ran this box before. A primary key can hold each value only once.',
      'Эти строки уже есть — наверное, вы уже выполняли этот блок. Первичный ключ может содержать каждое значение только один раз.');
    else if (/no such column: (\w+)/i.test(err)) h = T('Check the column name in the Database panel (bottom right) — it lists every column of every table.',
      'Проверьте имя столбца в панели «База данных» (справа внизу) — там перечислены все столбцы всех таблиц.');
    else if (/syntax error/i.test(err)) h = T('Look just before the word in quotes: a missing comma, bracket or quote is the usual reason.',
      'Посмотрите прямо перед словом в кавычках: обычно причина — пропущенная запятая, скобка или кавычка.');
    return h ? '<div class="sq-hint-box">' + h + '</div>' : '';
  }
  /* the three course views, built from Week 3 Day 4's own CREATE VIEW boxes, in their order there; then the box runs again */
  function buildViews() {
    return Promise.all([ready(), fetch('weeks/week-03/day-4.md').then(function (r) { return r.text(); })]).then(function (a) {
      var re = /```sql\r?\n(CREATE VIEW[\s\S]*?)```/g, m, made = 0;
      while ((m = re.exec(a[1]))) { var r = runPlay(m[1]); if (r.ran) made++; }
      return made;
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.sq-build-views');
    if (!b) return;
    b.disabled = true; b.textContent = T('Building…', 'Создаём…');
    buildViews().then(function () {
      var box = b.closest('.sq-box, .sq-task, .sq-prac');
      var go = box && box.querySelector('.sq-run');
      if (go) go.click(); else b.textContent = T('✓ Built — run your query again', '✓ Готово — выполните запрос ещё раз');
    }).catch(function () { b.disabled = false; b.textContent = T('Could not build them — try again', 'Не удалось создать — попробуйте снова'); });
  });
  var ABOUT_NAMES = ['customers', 'products', 'branches', 'staff', 'applications', 'loans', 'installments', 'payments', 'collections_actions', 'app_events', 'dim_date'];
  /* a block that is not meant to run: a pattern with placeholders, or one piece of a longer query */
  function shape(code) {
    if (/…|\btable_name\b|\bcolumn1\b/.test(code)) return T('The shape of a query — the words in it are placeholders, so this one is for reading, not running.',
      'Это схема запроса — слова в ней лишь заполнители, поэтому его нужно читать, а не выполнять.');
    // "-- after the WITH block:" / "-- replace …" (a Russian page translates the comment: "-- после …" / "-- замените …")
    if (/^\s*--\s*(after the|replace|после|замени)/i.test(code)) return T('One piece of the longer query above — add it there, then run the whole query in a box.',
      'Это часть более длинного запроса выше — добавьте её туда и выполните весь запрос в блоке.');
    if (/\(\s*\/\*[\s\S]*?\*\/\s*\)/.test(code)) return T('A template — the parts marked /* … */ are left for you to fill in, so it does not run as it is.',
      'Это шаблон — части, отмеченные /* … */, нужно заполнить самостоятельно, поэтому как есть он не выполнится.');
    var body = stripComments(code).trim();
    if (/,$/.test(body)) return T('One piece of a longer query (it ends with a comma) — it runs together with the pieces around it.',
      'Это часть более длинного запроса (она заканчивается запятой) — она выполняется вместе с соседними частями.');
    if (body && !/^(SELECT|WITH|CREATE|INSERT|UPDATE|DELETE|DROP|ALTER|PRAGMA|REPLACE|BEGIN|COMMIT|ROLLBACK|EXPLAIN|VALUES|ANALYZE)\b/i.test(body)) {
      var w = esc(body.split(/\s/)[0].toUpperCase());
      return T('One piece of a query (it starts at ' + w + ') — it runs as part of a whole query, not on its own.',
        'Это часть запроса (она начинается с ' + w + ') — она выполняется в составе целого запроса, а не сама по себе.');
    }
    return null;
  }
  function example(pre) {
    var code0 = (pre.querySelector('code') || pre).textContent, why = shape(code0);
    if (why) { pre.insertAdjacentHTML('beforebegin', '<div class="sq-static">' + why + '</div>'); pre.classList.add('sq-static-code'); return; }
    var code = (pre.querySelector('code') || pre).textContent.replace(/\n$/, '');
    var box = document.createElement('div');
    box.className = 'sq-box';
    box.innerHTML = '<div class="sq-top"><span class="sq-lang">SQL</span><span class="sq-tip">' + T('edit it, then Run', 'измените и нажмите «Выполнить»') + '</span>' +
      '<button type="button" class="sq-reset" hidden>' + T('Reset', 'Вернуть') + '</button></div>' +
      '<textarea class="sq-edit" spellcheck="false" wrap="off" autocapitalize="off" autocorrect="off"></textarea>' +
      '<div class="sq-bar"><button type="button" class="sq-run">' + T('▶ Run', '▶ Выполнить') + '</button><span class="sq-keys">Ctrl + Enter</span></div><div class="sq-out"></div>';
    pre.parentNode.replaceChild(box, pre);
    var ta = box.querySelector('textarea'), out = box.querySelector('.sq-out'), rs = box.querySelector('.sq-reset');
    ta.value = code;
    fit(ta);
    tabKeys(ta);
    ta.addEventListener('input', function () { fit(ta); rs.hidden = ta.value === code; });
    rs.onclick = function () { ta.value = code; fit(ta); rs.hidden = true; out.innerHTML = ''; };
    box.querySelector('.sq-run').onclick = function () {
      out.innerHTML = '<div class="sq-note sq-loading">' + runningText() + '</div>';
      ready().then(function () { out.innerHTML = table(runPlay(ta.value)); })
        .catch(function () { out.innerHTML = '<div class="sq-err">' + T('Could not load the data — check the internet connection and try again.', 'Не удалось загрузить данные — проверьте подключение к интернету и попробуйте снова.') + '</div>'; });
    };
  }
  function fit(ta) {   // the editor is as tall as its code, so nothing is cut off and nothing wraps
    var lines = ta.value.split('\n').length;   // counted from the text, so it also works inside a closed <details>
    if (ta.classList.contains('sq-text')) lines += Math.floor(ta.value.length / 60);
    var least = ta.classList.contains('sq-text') ? 4 : ta.closest('.sq-task, .sq-prac') ? 3 : 1;
    ta.rows = Math.max(least, Math.min(30, lines + (least > 1 ? 1 : 0)));
  }
  function tabKeys(ta) {
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') { e.preventDefault(); var p = ta.selectionStart; ta.value = ta.value.slice(0, p) + '  ' + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = p + 2; }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); var b = ta.closest('.sq-box, .sq-task').querySelector('.sq-run'); if (b) b.click(); }
    });
  }

  /* ---------- 2. the homework workspace ---------- */
  function workspace(pre) {
    var spec;
    try { spec = JSON.parse((pre.querySelector('code') || pre).textContent); }
    catch (e) { pre.insertAdjacentHTML('beforebegin', '<p class="quiz-error">' + T('Workspace could not be read.', 'Не удалось прочитать рабочую область.') + '</p>'); return; }
    var box = document.createElement('div');
    box.className = 'sq-ws';
    pre.parentNode.replaceChild(box, pre);
    var s = store(), mine = s.sql[spec.check] = s.sql[spec.check] || { code: {}, ok: {} };
    save(s);
    var hasSql = spec.tasks.some(function (t) { return !t.text && !t.upload; });
    var picked = {};   // chosen files live in memory only: after a reload she picks them again
    box.innerHTML = '<div class="sq-ws-head"><span class="sq-ws-title">' + (hasSql ? T('🧑‍💻 Your workspace — ', '🧑‍💻 Ваша рабочая область — ') : T('📎 Hand in — ', '📎 Сдача работы — ')) + esc(spec.title || spec.check) + '</span>' +
      '<span class="sq-ws-sub">' + (hasSql ? T('Write each query → ▶ Run → ✔ Check. When every one is ✅, tap 📤 Submit. Saved in this browser.',
          'Напишите каждый запрос → ▶ Выполнить → ✔ Проверить. Когда все отмечены ✅, нажмите 📤 Сдать. Всё сохраняется в этом браузере.')
        : T('Write or attach each part, then tap 📤 Submit. No GitHub needed.', 'Напишите или прикрепите каждую часть, затем нажмите 📤 Сдать. GitHub не нужен.')) + '</span></div>' +
      spec.tasks.map(function (t, i) {
        var input = t.upload
          ? '<label class="sq-file"><input type="file"' + (t.accept ? ' accept="' + esc(t.accept) + '"' : '') + '> ' + T('📎 Choose file', '📎 Выбрать файл') + '</label><span class="sq-fname"></span>'
          : '<textarea class="sq-edit' + (t.text ? ' sq-text' : '') + '" spellcheck="' + (t.text ? 'true' : 'false') + '"' +
            (t.text ? '' : ' wrap="off" autocapitalize="off" autocorrect="off"') +
            ' rows="' + (t.text ? 4 : 3) + '" placeholder="' + (t.text ? T('Write here…', 'Пишите здесь…') : T('-- write your query here', '-- напишите запрос здесь')) + '"></textarea>';
        return '<div class="sq-task" data-i="' + i + '"><div class="sq-task-q"><span class="sq-chip"></span><b>' + esc(hasSql ? t.id : String(i + 1)) + '</b><span>' + esc(t.q).replace(/`([^`]+)`/g, '<code>$1</code>') + '</span>' +
          (t.optional ? ' <span class="sq-opt">' + T('optional', 'по желанию') + '</span>' : '') + '</div>' +
          (t.upload ? '<div class="sq-bar">' + input + '<span class="sq-msg"></span></div>' :
            input + '<div class="sq-bar">' + (t.text ? '' : '<button type="button" class="sq-run">' + T('▶ Run', '▶ Выполнить') + '</button><button type="button" class="sq-check">' +
            T('✔ Check', '✔ Проверить') + '</button>') +
            '<span class="sq-msg"></span></div>') + '<div class="sq-out"></div></div>';
      }).join('') +
      '<div class="sq-ws-foot">' + (hasSql ? '<button type="button" class="sq-all">' + T('✔ Check all', '✔ Проверить все') + '</button>' : '') +
      '<button type="button" class="sq-submit">' + T('📤 Submit', '📤 Сдать') + '</button>' +
      '<div class="sq-ws-state"></div></div>';
    var cards = box.querySelectorAll('.sq-task');
    spec.tasks.forEach(function (t, i) {
      var c = cards[i], ta = c.querySelector('textarea'), out = c.querySelector('.sq-out'), msg = c.querySelector('.sq-msg');
      if (t.upload) {
        paint(c, undefined);
        msg.textContent = t.accept ? T('A ' + t.accept.split(',').join(' / ') + ' file, up to 5 MB.', 'Файл ' + t.accept.split(',').join(' / ') + ', до 5 МБ.') : T('Up to 5 MB.', 'До 5 МБ.');
        c.querySelector('input[type=file]').addEventListener('change', function () {
          var f = this.files[0];
          if (!f) return;
          if (f.size > 5 * 1024 * 1024) {
            msg.textContent = T('That file is over 5 MB — send it as a zip in 📤 Homework instead.', 'Этот файл больше 5 МБ — отправьте его zip-архивом через 📤 Homework в боте.');
            delete picked[t.id]; paint(c, false); foot(); return;
          }
          var rd = new FileReader();
          rd.onload = function () {
            picked[t.id] = { name: f.name, type: f.type || 'application/octet-stream', b64: String(rd.result).split(',')[1] };
            c.querySelector('.sq-fname').textContent = f.name + ' · ' + Math.max(1, Math.round(f.size / 1024)) + ' KB';
            msg.textContent = ''; paint(c, true); foot();
          };
          rd.readAsDataURL(f);
        });
        return;
      }
      ta.value = mine.code[t.id] || '';
      if (ta.value) setTimeout(function () { fit(ta); }, 0);
      tabKeys(ta);
      paint(c, mine.ok[t.id]);
      ta.addEventListener('input', function () {
        var st = store(), m = st.sql[spec.check];
        m.code[t.id] = ta.value;
        fit(ta);
        if (t.text) m.ok[t.id] = ta.value.trim().split('\n').filter(function (l) { return l.trim(); }).length >= (t.minLines || 3);
        else delete m.ok[t.id];
        save(st); paint(c, m.ok[t.id]); foot();
      });
      if (t.text) { var ml = t.minLines || 3; msg.textContent = T('At least ' + ml + ' lines.', 'Не меньше ' + ml + ' ' + plural(ml, 'строки', 'строк', 'строк') + '.'); return; }
      c.querySelector('.sq-run').onclick = function () {
        out.innerHTML = '<div class="sq-note sq-loading">' + runningText() + '</div>';
        ready().then(function () { out.innerHTML = table(runPlay(ta.value)); })
          .catch(function () { out.innerHTML = '<div class="sq-err">' + T('Could not load the data — try again.', 'Не удалось загрузить данные — попробуйте снова.') + '</div>'; });
      };
      c.querySelector('.sq-check').onclick = function () { checkOne(t, c).then(foot); };
    });
    function paint(card, ok) {
      card.classList.toggle('ok', ok === true); card.classList.toggle('bad', ok === false);
      card.querySelector('.sq-chip').textContent = ok === true ? '✅' : ok === false ? '❌' : '';
    }
    function checkOne(t, card) {
      var ta = card.querySelector('textarea'), msg = card.querySelector('.sq-msg'), out = card.querySelector('.sq-out');
      if (!ta.value.trim()) { msg.textContent = T('Write a query first.', 'Сначала напишите запрос.'); return Promise.resolve(); }
      msg.textContent = T('Checking…', 'Проверяем…');
      return Promise.all([ready(), loadChecks()]).then(function (a) {
        var spec2 = a[1].checks[spec.check], exp = spec2 && spec2.tasks[t.id];
        if (!exp) { msg.textContent = T('No automatic check for this task.', 'Для этого задания нет автоматической проверки.'); return; }
        return checkTask(ta.value, exp, a[1].salt).then(function (r) {
          var st = store(); st.sql[spec.check].ok[t.id] = r.ok; save(st);
          paint(card, r.ok);
          msg.textContent = r.ok ? T('Correct!', 'Верно!') : T('Not yet: ', 'Пока нет: ') + r.why + '.';
          if (r.res) out.innerHTML = table(r.res);
        });
      }).catch(function (e) { console.error('check failed', e); msg.textContent = T('Could not check right now — try again.', 'Сейчас проверить не получилось — попробуйте снова.'); });
    }
    if (hasSql) box.querySelector('.sq-all').onclick = function () {
      var p = Promise.resolve();
      spec.tasks.forEach(function (t, i) { if (!t.text && !t.upload) p = p.then(function () { return checkOne(t, cards[i]); }); });
      p.then(foot);
    };
    function foot() {
      var m = store().sql[spec.check], must = spec.tasks.filter(function (t) { return !t.optional; }), need = must.length;
      var okN = must.filter(function (t) { return t.upload ? !!picked[t.id] : m.ok[t.id] === true; }).length;
      var state = box.querySelector('.sq-ws-state'), btn = box.querySelector('.sq-submit');
      var key = wk();
      btn.disabled = okN < need;
      state.innerHTML = '<b>' + okN + ' / ' + need + '</b>' + T(' done', ' готово') + (m.submitted ? T(' · ✅ submitted ', ' · ✅ сдано ') + esc(m.submitted) : '') +
        (okN < need ? T(' · Submit opens when every task is ✅', ' · Кнопка «Сдать» откроется, когда все задания будут ✅') : '') +
        (key ? '' : T('<br>First time? <a target="_blank" rel="noopener" href="' + BOT + 'connect">🔑 Connect this website to the course bot</a> (once).',
          '<br>Впервые здесь? <a target="_blank" rel="noopener" href="' + BOT + 'connect">🔑 Подключите этот сайт к боту курса</a> (один раз).'));
    }
    box.querySelector('.sq-submit').onclick = function () {
      var key = wk(), btn = this, state = box.querySelector('.sq-ws-state');
      if (!key) { window.open(BOT + 'connect', '_blank'); return; }
      var m = store().sql[spec.check], files = {}, sqlFile = spec.file || 'answers.sql';
      var sqlText = spec.tasks.filter(function (t) { return !t.text && !t.upload; }).map(function (t) {
        var res = clean ? run(clean, m.code[t.id] || '', true) : { cells: [] };
        var first = res.last && res.last.values.length ? res.last.values.slice(0, 3).map(function (r) { return r.join(', '); }).join('; ') : '';
        return '-- ' + t.id + ': ' + t.q + '\n' + (m.code[t.id] || '').trim() + '\n-- result: ' + first + '\n';
      }).join('\n');
      if (sqlText.trim()) files[sqlFile] = sqlText;
      spec.tasks.filter(function (t) { return t.text; }).forEach(function (t) { files[t.file] = (m.code[t.id] || '').trim() + '\n'; });
      spec.tasks.filter(function (t) { return t.upload && picked[t.id]; }).forEach(function (t) {
        var p = picked[t.id], ext = (p.name.match(/\.[A-Za-z0-9]+$/) || [''])[0].toLowerCase();
        var own = p.name.replace(/[^\w.-]+/g, '_').slice(-60);   // the Extra slot keeps the file's own (safe) name
        var name = (t.names || [t.file]).filter(function (n) { return ext && n.toLowerCase().slice(-ext.length) === ext; })[0] ||
          (/\.\w+$/.test(t.file || '') ? t.file : own);
        files[name] = { b64: p.b64, type: p.type };
      });
      btn.disabled = true; state.innerHTML = T('Submitting…', 'Отправляем…');
      fetch(WORKER + '/submit', { method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: key, lesson: spec.lesson, check: spec.check, files: files, ok: m.ok }) })
        .then(function (r) { return r.json().then(function (j) { return { status: r.status, j: j }; }); })
        .then(function (x) {
          if (x.status === 200) {
            var st = store(); st.sql[spec.check].submitted = new Date().toISOString().slice(0, 10); save(st);
            state.innerHTML = T('✅ Submitted! Your mentor is notified — feedback will appear in 📤 Homework.', '✅ Сдано! Ментор получил уведомление — отзыв появится в 📤 Homework.');
          } else if (x.status === 401) {
            try { localStorage.removeItem(WK); } catch (e) { /* nothing */ }
            state.innerHTML = T('This browser is not connected any more. <a target="_blank" rel="noopener" href="' + BOT + 'connect">🔑 Connect again</a>, then tap Submit.',
              'Этот браузер больше не подключён. <a target="_blank" rel="noopener" href="' + BOT + 'connect">🔑 Подключите его снова</a>, затем нажмите «Сдать».');
            btn.disabled = false;
          } else {
            state.innerHTML = T('Could not submit', 'Не удалось сдать') + ' (' + esc(x.j.error || x.status) + '). ' + T('Try again in a minute.', 'Попробуйте снова через минуту.');
            btn.disabled = false;
          }
        })
        .catch(function () { state.innerHTML = T('No connection — try again in a minute.', 'Нет подключения — попробуйте снова через минуту.'); btn.disabled = false; });
    };
    foot();
  }

  /* ---------- 3. the database panel (like DBeaver / DataGrip): tables → columns → preview; tap a name to insert it ---------- */
  var ABOUT = {   // what one row is, the primary key and the foreign keys (week 1 day 1's table; this copy declares no constraints)
    customers: ['one person', 'customer_id', {}], products: ['one loan product', 'product_id', {}], branches: ['one office', 'branch_id', {}],
    staff: ['one employee', 'staff_id', { branch_id: 'branches' }],
    applications: ['one request for a loan', 'application_id', { customer_id: 'customers', product_id: 'products', branch_id: 'branches', officer_id: 'staff' }],
    loans: ['one loan that was paid out', 'loan_id', { application_id: 'applications', customer_id: 'customers', product_id: 'products', branch_id: 'branches' }],
    installments: ['one scheduled monthly payment', 'installment_id', { loan_id: 'loans' }],
    payments: ['one payment received', 'payment_id', { loan_id: 'loans', installment_id: 'installments' }],
    collections_actions: ['one SMS / call / visit to a late borrower', 'action_id', { loan_id: 'loans', collector_id: 'staff' }],
    app_events: ['one tap in the mobile app', 'event_id', { customer_id: 'customers', application_id: 'applications' }],
    dim_date: ['one calendar day', 'date_key', {}]
  };
  var ABOUT_RU = {   // the same "what one row is" on a Russian page
    customers: 'один человек', products: 'один кредитный продукт', branches: 'один офис', staff: 'один сотрудник',
    applications: 'одна заявка на кредит', loans: 'один выданный кредит', installments: 'один плановый ежемесячный платёж',
    payments: 'один полученный платёж', collections_actions: 'одно SMS / звонок / визит к заёмщику с просрочкой',
    app_events: 'одно нажатие в мобильном приложении', dim_date: 'один календарный день'
  };
  var lastEditor = null;
  document.addEventListener('focusin', function (e) { if (e.target.classList && e.target.classList.contains('sq-edit')) lastEditor = e.target; });
  function insert(text, block) {
    var ta = lastEditor && document.body.contains(lastEditor) ? lastEditor : document.querySelector('.sq-edit');
    if (!ta) return;
    var a = ta.selectionStart || 0, b = ta.selectionEnd || 0;
    if (block && ta.value.slice(0, a).trim()) text = (/\n\s*$/.test(ta.value.slice(0, a)) ? '\n' : '\n\n') + text;   // a whole query starts on its own line
    ta.value = ta.value.slice(0, a) + text + ta.value.slice(b);
    ta.selectionStart = ta.selectionEnd = a + text.length;
    ta.focus(); ta.dispatchEvent(new Event('input'));
  }
  /* ---------- the Database panel: every table of her practice copy, like the schema tree in DBeaver or DataGrip ----------
     A table opens to its columns (PK / FK marked; an FK jumps to the table it points to), the tables that point to it,
     and three actions: put its name in the query, put a ready SELECT in the query, show its first rows. Tables she
     created herself are listed apart. Reset brings the original data back. */
  var ICON_T = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/></svg>';
  var openTables = {}, toastTimer = null;
  function toast(drawer, text) {
    var t = drawer.querySelector('.db-toast');
    t.textContent = text; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 1600);
  }
  function fmt(n) { return Number(n).toLocaleString('en').replace(/,/g, ' '); }
  function tableCard(t, mine) {
    var info = ABOUT[t] || ['a table you made', '', {}], what = ABOUT[t] ? T(info[0], ABOUT_RU[t]) : T(info[0], 'таблица, которую вы создали');
    var rows = play.exec('SELECT COUNT(*) FROM "' + t + '"')[0].values[0][0];
    var cols = play.exec('PRAGMA table_info("' + t + '")')[0].values;   // cid, name, type, notnull, default, pk
    var into = Object.keys(ABOUT).filter(function (o) { return Object.keys(ABOUT[o][2]).some(function (c) { return ABOUT[o][2][c] === t; }); });
    return '<div class="db-t' + (openTables[t] ? ' open' : '') + (mine ? ' mine' : '') + '" data-t="' + esc(t) + '">' +
      '<button type="button" class="db-row"><span class="db-ico">' + ICON_T + '</span><span class="db-name"><b>' + esc(t) + '</b><small>' + esc(what) + '</small></span>' +
      '<span class="db-count">' + fmt(rows) + '</span><span class="db-caret">›</span></button>' +
      '<div class="db-open">' +
      '<div class="db-acts"><button type="button" class="db-act" data-do="name" data-v="' + esc(t) + '">' + T('+ Name', '+ Имя') + '</button>' +
      '<button type="button" class="db-act" data-do="select" data-v="' + esc(t) + '">+ SELECT</button>' +
      '<button type="button" class="db-act" data-do="rows" data-v="' + esc(t) + '">' + T('Show rows', 'Показать строки') + '</button></div>' +
      '<div class="db-cols">' + cols.map(function (c) {
        var name = c[1], fk = info[2][name], pk = name === info[1] || c[5];
        return '<div class="db-c"><button type="button" class="db-cn" data-v="' + esc(name) + '" title="' + T('Put in the query', 'Вставить в запрос') + '">' + esc(name) + '</button>' +
          (pk ? '<span class="db-k pk" title="' + T('primary key: one value per row', 'первичный ключ: одно значение на строку') + '">PK</span>' : '') +
          (fk ? '<button type="button" class="db-k fk" data-go="' + esc(fk) + '" title="' + T('foreign key: open ', 'внешний ключ: открыть ') + esc(fk) + '">→ ' + esc(fk) + '</button>' : '') +
          '<span class="db-ty">' + esc((c[2] || '').toLowerCase()) + '</span></div>';
      }).join('') + '</div>' +
      (into.length ? '<div class="db-into">' + T('Pointed to by: ', 'На неё ссылаются: ') + into.map(function (o) { return '<button type="button" class="db-k fk" data-go="' + esc(o) + '">' + esc(o) + '</button>'; }).join(' ') + '</div>' : '') +
      '</div></div>';
  }
  function fill(drawer) {
    var all = play.exec("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")[0];
    var names = all ? all.values.map(function (r) { return r[0]; }) : [];
    var mine = names.filter(function (n) { return !ABOUT[n]; }), company = names.filter(function (n) { return ABOUT[n]; });
    var missing = Object.keys(ABOUT).filter(function (n) { return names.indexOf(n) < 0; });
    drawer.querySelector('.db-sub').textContent = T(company.length + ' company tables' + (mine.length ? ' · ' + mine.length + ' of yours' : '') + ' · your practice copy',
      company.length + ' ' + plural(company.length, 'таблица', 'таблицы', 'таблиц') + ' компании' + (mine.length ? ' · ' + mine.length + ' ваших' : '') + ' · ваша учебная копия');
    drawer.querySelector('.db-list').innerHTML =
      (mine.length ? '<div class="db-sec">' + T('Your tables', 'Ваши таблицы') + '</div>' + mine.map(function (n) { return tableCard(n, true); }).join('') : '') +
      '<div class="db-sec">' + T('Nur Finance tables', 'Таблицы Nur Finance') + '</div>' + company.map(function (n) { return tableCard(n, false); }).join('') +
      (missing.length ? '<div class="db-warn">' + T('Missing in your copy: ', 'Нет в вашей копии: ') + missing.map(esc).join(', ') +
        T(' (dropped). Reset brings them back.', ' (удалены). «Сбросить» вернёт их.') + '</div>' : '');
    var q = drawer.querySelector('.db-find').value;
    if (q) filter(drawer, q);
  }
  function filter(drawer, q) {
    q = q.trim().toLowerCase();
    Array.prototype.forEach.call(drawer.querySelectorAll('.db-t'), function (d) {
      var cols = d.querySelectorAll('.db-cn');
      var hit = !q || d.dataset.t.indexOf(q) >= 0 || Array.prototype.some.call(cols, function (c) { return c.dataset.v.indexOf(q) >= 0; });
      d.hidden = !hit;
      d.classList.toggle('open', !!(q && hit && d.dataset.t.indexOf(q) < 0) || !!openTables[d.dataset.t]);
      Array.prototype.forEach.call(cols, function (c) { c.classList.toggle('db-hit', !!q && c.dataset.v.indexOf(q) >= 0); });
    });
  }
  function explorer() {
    var drawer = document.getElementById('sq-db'), lang = window.ALLang ? window.ALLang.get() : 'en';
    if (drawer && (drawer.dataset.failed || drawer.dataset.lang !== lang)) {   // failed, or drawn in the other language: draw it again
      drawer.remove(); drawer = null;
      var old = document.getElementById('sq-db-shade');
      if (old) old.remove();
    }
    if (drawer) { drawer.classList.toggle('open'); document.body.classList.toggle('db-on', drawer.classList.contains('open')); return; }
    drawer = document.createElement('aside');
    drawer.id = 'sq-db';
    drawer.className = 'open';
    drawer.dataset.lang = lang;
    drawer.setAttribute('aria-label', T('Database', 'База данных'));
    drawer.innerHTML = '<div class="db-head"><span class="db-logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><ellipse cx="12" cy="5" rx="8" ry="3"/>' +
      '<path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg></span>' +
      '<div class="db-title"><b>' + T('Nur Finance database', 'База данных Nur Finance') + '</b><span class="db-sub">' + T('loading…', 'загрузка…') + '</span></div>' +
      '<button type="button" class="db-x" aria-label="' + T('Close', 'Закрыть') + '">✕</button></div>' +
      '<div class="db-search"><input class="db-find" type="search" placeholder="' + T('Find a table or column…', 'Найти таблицу или столбец…') + '" autocomplete="off"></div>' +
      '<div class="db-list sq-loading">' + T('Opening the database…', 'Открываем базу данных…') + '</div>' +
      '<div class="db-prev" hidden></div>' +
      '<div class="db-foot"><span>' + T('Tap a name to put it in your query.', 'Нажмите на имя, чтобы вставить его в запрос.') + '</span><button type="button" class="db-reset">' + T('↺ Reset', '↺ Сбросить') + '</button></div>' +
      '<div class="db-toast" hidden></div>';
    var shade = document.createElement('div');
    shade.id = 'sq-db-shade';
    shade.onclick = close;
    document.body.appendChild(shade);
    document.body.appendChild(drawer);
    document.body.classList.add('db-on');
    function close() { drawer.classList.remove('open'); document.body.classList.remove('db-on'); }
    drawer.querySelector('.db-x').onclick = close;
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('open')) close(); });
    ready().then(function () {
      fill(drawer);
      document.addEventListener('al-db-changed', function () { fill(drawer); });
      var list = drawer.querySelector('.db-list');
      list.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        var card = b.closest('.db-t');
        if (b.classList.contains('db-row')) {
          openTables[card.dataset.t] = !card.classList.contains('open');
          card.classList.toggle('open');
        } else if (b.dataset.go) {
          var to = list.querySelector('.db-t[data-t="' + b.dataset.go + '"]');
          if (to) { openTables[b.dataset.go] = true; to.hidden = false; to.classList.add('open', 'db-flash'); to.scrollIntoView({ behavior: 'smooth', block: 'start' }); setTimeout(function () { to.classList.remove('db-flash'); }, 1200); }
        } else if (b.classList.contains('db-cn') || b.dataset.do === 'name') {
          insert(b.dataset.v); toast(drawer, T('“' + b.dataset.v + '” added to your query', '«' + b.dataset.v + '» добавлено в запрос'));
        }
        else if (b.dataset.do === 'select') { insert('SELECT *\nFROM ' + b.dataset.v + '\nLIMIT 10;', true); toast(drawer, T('A SELECT on ' + b.dataset.v + ' is in your query', 'SELECT из ' + b.dataset.v + ' добавлен в запрос')); }
        else if (b.dataset.do === 'rows') {
          var pv = drawer.querySelector('.db-prev');
          pv.innerHTML = '<div class="db-prev-h"><b>' + esc(b.dataset.v) + '</b>' + T(' · first 10 rows ', ' · первые 10 строк ') + '<button type="button" class="db-prev-x" aria-label="' + T('Close', 'Закрыть') + '">✕</button></div>' +
            table(run(play, 'SELECT * FROM "' + b.dataset.v + '" LIMIT 10', true));
          pv.hidden = false;
          pv.querySelector('.db-prev-x').onclick = function () { pv.hidden = true; };
        }
      });
      drawer.querySelector('.db-find').addEventListener('input', function () { filter(drawer, this.value); });
      var rs = drawer.querySelector('.db-reset');
      rs.onclick = function () {
        if (!rs.classList.contains('sure')) {
          rs.classList.add('sure'); rs.textContent = T('Tap again: undo all my changes', 'Нажмите ещё раз: отменить все мои изменения');
          setTimeout(function () { rs.classList.remove('sure'); rs.textContent = T('↺ Reset', '↺ Сбросить'); }, 4000);
          return;
        }
        rs.classList.remove('sure'); rs.textContent = T('↺ Reset', '↺ Сбросить');
        resetPlay().then(function () { toast(drawer, T('The original data is back', 'Исходные данные восстановлены')); });
      };
    }).catch(function () {
      drawer.querySelector('.db-list').textContent = T('Could not load the data — check the connection and tap Database again.', 'Не удалось загрузить данные — проверьте подключение и снова нажмите «База данных».');
      drawer.dataset.failed = '1';
    });
  }
  function dbButton() {
    var has = document.querySelector('.markdown-section .sq-box, .markdown-section .sq-ws .sq-run, .markdown-section .sq-play');
    var btn = document.getElementById('sq-db-btn');
    if (!has) { if (btn) btn.hidden = true; var d = document.getElementById('sq-db'); if (d) d.classList.remove('open'); document.body.classList.remove('db-on'); return; }
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'sq-db-btn'; btn.type = 'button';
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><ellipse cx="12" cy="5" rx="8" ry="3"/>' +
        '<path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg><span></span>';
      btn.onclick = explorer;
      document.body.appendChild(btn);
    }
    // the button stays from page to page: its words follow the page's language
    btn.setAttribute('aria-label', T('Database: tables and columns', 'База данных: таблицы и столбцы'));
    btn.querySelector('span').textContent = T('Database', 'База данных');
    btn.hidden = false;
    var d0 = document.getElementById('sq-db');
    if (d0 && window.ALLang && d0.dataset.lang !== window.ALLang.get()) {   // the panel was drawn in the other language
      var wasOpen = d0.classList.contains('open');
      d0.classList.remove('open'); document.body.classList.remove('db-on');
      if (wasOpen) explorer();   // explorer() draws it again in this language (also on the next tap when it was closed)
    }
  }

  /* ---------- 3. practice questions: a box under each question whose "Answer" fold holds SQL ----------
     Her query is kept in this browser (al.sql → prac[page][P1]). ✔ Check runs the fold's query and hers on the untouched
     data and compares the results (rows in any order unless the answer sorts; cells in any order within a row), so she
     learns whether she got it without opening the fold. */
  function results(db, text) {
    var list = [];
    stripComments(text).split(';').filter(function (s) { return s.trim(); }).forEach(function (stmt) {
      if (!/^\s*(SELECT|WITH)\b/i.test(stmt)) return;
      [stmt, translate(stmt)].some(function (q) {
        try {
          var res = db.exec(q);
          list.push({ r: res.length ? res[res.length - 1] : { columns: [], values: [] }, ordered: /\bORDER\s+BY\b/i.test(q) });
          return true;
        } catch (e) { return false; }
      });
    });
    return list;
  }
  function cell(v) {
    if (v === null) return '∅';
    var s = String(v).trim(), n = Number(s);
    return s !== '' && !isNaN(n) ? String(Math.round(n * 10000) / 10000) : s;
  }
  function sameResult(a, b, ordered) {
    if (a.values.length !== b.values.length || a.columns.length !== b.columns.length) return false;
    var key = function (row) { return row.map(cell).sort().join('\u0001'); };
    var ra = a.values.map(key), rb = b.values.map(key);
    if (!ordered) { ra.sort(); rb.sort(); }
    return ra.every(function (x, i) { return x === rb[i]; });
  }
  function practice(det) {
    var sum = det.querySelector('summary');
    var pres = det.querySelectorAll('pre[data-lang="sql"]');
    // "Answer" / "Answers" folds; a Russian page says "Ответ" / "Ответы"
    if (!sum || !/^\s*(answer|ответ)/i.test(sum.textContent) || !pres.length || det.previousElementSibling && det.previousElementSibling.classList.contains('sq-prac')) return;
    var answer = Array.prototype.map.call(pres, function (p) { return (p.querySelector('code') || p).textContent; }).join(';\n');
    var q = det.previousElementSibling, strong = q && q.querySelector('strong'), m = strong && /^(P\d+|[A-Z]\d+)/.exec(strong.textContent.trim());
    var page = location.hash.replace(/\?.*$/, '').replace(/^#\/ru(\/|$)/, '#/') || '#/';   // one key for a page and its Russian copy
    var id = m ? m[1] : 'Q' + (Array.prototype.indexOf.call(document.querySelectorAll('.markdown-section details'), det) + 1);
    var h1 = document.querySelector('.markdown-section h1');
    var exam = !!(h1 && /checkpoint|контрольн/i.test(h1.textContent));   // a test day: no checking against the folds before she submits
    var box = document.createElement('div');
    box.className = 'sq-box sq-prac';
    box.innerHTML = '<div class="sq-top"><span class="sq-lang">' + T('YOUR QUERY · ', 'ВАШ ЗАПРОС · ') + esc(id) + '</span><span class="sq-tip">' + T('saved in this browser', 'сохраняется в этом браузере') + '</span>' +
      '<button type="button" class="sq-reset" hidden>' + T('Clear', 'Очистить') + '</button></div>' +
      '<textarea class="sq-edit" spellcheck="false" wrap="off" autocapitalize="off" autocorrect="off" placeholder="' + T('-- write your query here, then Run', '-- напишите запрос здесь и нажмите «Выполнить»') + '"></textarea>' +
      '<div class="sq-bar"><button type="button" class="sq-run">' + T('▶ Run', '▶ Выполнить') + '</button>' + (exam ? '' : '<button type="button" class="sq-check">' + T('✔ Check', '✔ Проверить') + '</button>') +
      '<span class="sq-msg"></span></div><div class="sq-out"></div>';
    det.parentNode.insertBefore(box, det);
    var ta = box.querySelector('textarea'), out = box.querySelector('.sq-out'), msg = box.querySelector('.sq-msg'), clr = box.querySelector('.sq-reset');
    var s0 = store(), mine = ((s0.prac || {})[page] || {})[id] || '';
    ta.value = mine; clr.hidden = !mine;
    fit(ta); tabKeys(ta);
    ta.addEventListener('input', function () {
      var s = store(); s.prac = s.prac || {}; s.prac[page] = s.prac[page] || {}; s.prac[page][id] = ta.value; save(s);
      fit(ta); clr.hidden = !ta.value; msg.textContent = ''; box.classList.remove('ok', 'bad');
    });
    clr.onclick = function () { ta.value = ''; ta.dispatchEvent(new Event('input')); out.innerHTML = ''; };
    box.querySelector('.sq-run').onclick = function () {
      if (!ta.value.trim()) { msg.textContent = T('Write a query first.', 'Сначала напишите запрос.'); return; }
      out.innerHTML = '<div class="sq-note sq-loading">' + runningText() + '</div>';
      ready().then(function () { out.innerHTML = table(runPlay(ta.value)); })
        .catch(function () { out.innerHTML = '<div class="sq-err">' + T('Could not load the data — check the connection and try again.', 'Не удалось загрузить данные — проверьте подключение и попробуйте снова.') + '</div>'; });
    };
    if (!exam) box.querySelector('.sq-check').onclick = function () {
      if (!ta.value.trim()) { msg.textContent = T('Write a query first.', 'Сначала напишите запрос.'); return; }
      msg.textContent = T('Checking…', 'Проверяем…');
      ready().then(function () {
        var want = results(clean, answer), got = results(clean, ta.value);
        var mineRes = run(clean, ta.value, true);
        out.innerHTML = table(mineRes);
        if (!got.length) {
          msg.textContent = mineRes.error ? T('The query did not run — see the message below.', 'Запрос не выполнился — смотрите сообщение ниже.') : T('No result to compare yet.', 'Пока нечего сравнивать.');
          box.classList.add('bad'); return;
        }
        var last = got[got.length - 1], hit = -1, loose = -1;
        want.forEach(function (w, i) {
          if (hit < 0 && sameResult(last.r, w.r, w.ordered)) hit = i;
          if (loose < 0 && sameResult(last.r, w.r, false)) loose = i;   // the same rows, sorted differently
        });
        var part = function (i) { return want.length > 1 ? T(' (part ' + (i + 1) + ' of ' + want.length + ')', ' (часть ' + (i + 1) + ' из ' + want.length + ')') : ''; };
        box.classList.toggle('ok', hit >= 0 || loose >= 0); box.classList.toggle('bad', hit < 0 && loose < 0);
        if (hit >= 0) msg.textContent = T('✅ Same result as the answer', '✅ Результат совпадает с ответом') + part(hit) + '.';
        else if (loose >= 0) msg.textContent = T('✅ Same rows as the answer', '✅ Строки совпадают с ответом') + part(loose) + (last.ordered
          ? T(', in a different order — check the ORDER BY.', ', но в другом порядке — проверьте ORDER BY.')
          : T('. The answer also sorts them with ORDER BY.', '. В ответе они ещё и отсортированы с помощью ORDER BY.'));
        else if (want.some(function (w) { return w.r.values.length === last.r.values.length; })) {
          msg.textContent = T('❌ Same number of rows as the answer, but the columns or values differ.', '❌ Строк столько же, сколько в ответе, но столбцы или значения отличаются.');
        }
        else msg.textContent = T('❌ Not yet — the answer has a different number of rows (you have ' + last.r.values.length + ').',
          '❌ Пока нет — в ответе другое число строк (у вас ' + last.r.values.length + ').');
      }).catch(function (e) { console.error('practice check failed', e); msg.textContent = T('Could not check right now — try again.', 'Сейчас проверить не получилось — попробуйте снова.'); });
    };
  }

  /* ---------- 4. the playground (```sqlplay): one big editor on her practice copy, starters for every kind of
     statement, the text kept in this browser (al.sql → playText) ---------- */
  var STARTERS = [
    ['SELECT', 'SELECT customer_id, first_name, last_name, region\nFROM customers\nWHERE region = \'Tashkent\'\nORDER BY customer_id\nLIMIT 20;'],
    ['GROUP BY', 'SELECT status, COUNT(*) AS loans, SUM(principal) AS total\nFROM loans\nGROUP BY status\nORDER BY loans DESC;'],
    ['JOIN', 'SELECT l.loan_id, c.first_name, c.last_name, p.name AS product, l.principal\nFROM loans l\nJOIN customers c ON c.customer_id = l.customer_id\nJOIN products p ON p.product_id = l.product_id\nLIMIT 20;'],
    ['CREATE TABLE', 'CREATE TABLE my_notes (\n  note_id   INTEGER PRIMARY KEY,\n  loan_id   INTEGER REFERENCES loans(loan_id),\n  note      TEXT NOT NULL,\n  created   TEXT DEFAULT (date(\'now\'))\n);'],
    ['INSERT', 'INSERT INTO my_notes (loan_id, note)\nVALUES (1, \'Called the customer\'),\n       (2, \'Paid early\');\n\nSELECT * FROM my_notes;'],
    ['UPDATE', 'UPDATE my_notes\nSET note = \'Called twice\'\nWHERE note_id = 1;\n\nSELECT * FROM my_notes;'],
    ['DELETE', 'DELETE FROM my_notes\nWHERE note_id = 2;\n\nSELECT * FROM my_notes;'],
    ['DROP', 'DROP TABLE my_notes;']
  ];
  function playground(pre) {
    var box = document.createElement('div');
    box.className = 'sq-play';
    box.innerHTML = '<div class="sq-play-chips"><span>' + T('Start from:', 'Начать с:') + '</span>' + STARTERS.map(function (s, i) { return '<button type="button" data-i="' + i + '">' + s[0] + '</button>'; }).join('') + '</div>' +
      '<div class="sq-box"><div class="sq-top"><span class="sq-lang">' + T('SQL · YOUR PRACTICE DATABASE', 'SQL · ВАША УЧЕБНАЯ БАЗА') + '</span><span class="sq-tip">' + T('saved in this browser', 'сохраняется в этом браузере') + '</span>' +
      '<button type="button" class="sq-reset">' + T('Clear', 'Очистить') + '</button></div>' +
      '<textarea class="sq-edit sq-big" spellcheck="false" wrap="off" autocapitalize="off" autocorrect="off" placeholder="' +
      T('-- write any SQL here: SELECT, CREATE TABLE, INSERT, UPDATE, DELETE…', '-- пишите здесь любой SQL: SELECT, CREATE TABLE, INSERT, UPDATE, DELETE…') + '"></textarea>' +
      '<div class="sq-bar"><button type="button" class="sq-run">' + T('▶ Run', '▶ Выполнить') + '</button><span class="sq-keys">Ctrl + Enter</span>' +
      '<button type="button" class="sq-open-db">' + T('Database', 'База данных') + '</button></div><div class="sq-out"></div></div>';
    pre.parentNode.replaceChild(box, pre);
    var ta = box.querySelector('textarea'), out = box.querySelector('.sq-out');
    ta.value = store().playText || STARTERS[0][1];
    tabKeys(ta);
    function keep() { var s = store(); s.playText = ta.value; save(s); }
    ta.addEventListener('input', keep);
    box.querySelector('.sq-reset').onclick = function () { ta.value = ''; keep(); out.innerHTML = ''; ta.focus(); };
    box.querySelector('.sq-open-db').onclick = function () { var d = document.getElementById('sq-db'); if (!d || !d.classList.contains('open')) explorer(); };
    Array.prototype.forEach.call(box.querySelectorAll('.sq-play-chips button'), function (b) {
      b.onclick = function () { ta.value = STARTERS[Number(b.dataset.i)][1]; keep(); out.innerHTML = ''; ta.focus(); };
    });
    box.querySelector('.sq-run').onclick = function () {
      if (!ta.value.trim()) return;
      out.innerHTML = '<div class="sq-note sq-loading">' + runningText() + '</div>';
      ready().then(function () { out.innerHTML = table(runPlay(ta.value)); })
        .catch(function () { out.innerHTML = '<div class="sq-err">' + T('Could not load the data — check the connection and try again.', 'Не удалось загрузить данные — проверьте подключение и попробуйте снова.') + '</div>'; });
    };
    lastEditor = ta;
    if (window.innerWidth >= 1200) setTimeout(function () { var d = document.getElementById('sq-db'); if (!d || !d.classList.contains('open')) explorer(); }, 300);
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(function () {
      var sec = document.querySelector('.markdown-section');
      if (!sec) return;
      Array.prototype.forEach.call(sec.querySelectorAll('details'), practice);
      Array.prototype.forEach.call(sec.querySelectorAll('pre[data-lang="sqlplay"]'), playground);
      Array.prototype.forEach.call(sec.querySelectorAll('pre[data-lang="sqltask"]'), workspace);
      Array.prototype.forEach.call(sec.querySelectorAll('pre[data-lang="sql"]'), example);
      dbButton();
      // the bot's "Hand in" buttons open the lesson at its homework box: #/weeks/week-01/day-2?id=hand-in
      var ws = sec.querySelectorAll('.sq-ws');
      if (ws.length) {
        var box = ws[ws.length - 1];
        box.id = 'hand-in';
        if (/[?&]id=hand-in\b/.test(location.hash)) {
          var land = function () { if (Math.abs(box.getBoundingClientRect().top - 16) > 40) box.scrollIntoView({ behavior: 'auto', block: 'start' }); };
          setTimeout(function () {
            land();
            box.classList.add('sq-ws-here');
            setTimeout(function () { box.classList.remove('sq-ws-here'); }, 2600);
          }, 350);
          [900, 1800, 3000].forEach(function (ms) { setTimeout(land, ms); });   // pictures above load late and push the box down
        }
      }
    });
  });
})();
