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
  function ready() {
    if (engine) return engine;
    engine = loadScript(ENGINE + 'sql-wasm.js')
      .then(function () { return window.initSqlJs({ locateFile: function (f) { return ENGINE + f; } }); })
      .then(function (SQL) {
        return fetch(REPO_RAW + 'data/raw/nur.db').then(function (r) { return r.arrayBuffer(); }).then(function (buf) {
          var bytes = new Uint8Array(buf);
          play = new SQL.Database(bytes);           // examples may change this one
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
      .replace(/\bISNULL\s*\(/gi, 'IFNULL(').replace(/\bLEN\s*\(/gi, 'LENGTH(').replace(/\bGETDATE\s*\(\s*\)/gi, "'2026-10-01'");
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
          done = true;
        } catch (e) { out.error = e.message; }
      }
    });
    return out;
  }
  function table(res) {
    if (res.error) return '<div class="sq-err">⚠ ' + esc(res.error) + '</div>';
    if (!res.last) return '<div class="sq-note">Done' + (res.ran ? ' (' + res.ran + ' statement' + (res.ran > 1 ? 's' : '') + ')' : '') + '.</div>';
    var r = res.last, shown = r.values.slice(0, 50);
    if (!r.columns.length) return '<div class="sq-note">0 rows.</div>';
    return '<div class="sq-note">' + r.values.length + ' row' + (r.values.length === 1 ? '' : 's') + (r.values.length > 50 ? ' (first 50 shown)' : '') + '</div>' +
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
    if (res.error && !res.last) return Promise.resolve({ ok: false, why: 'the query did not run: ' + res.error });
    var nums = res.cells.map(toNum).filter(function (n) { return n !== null; });
    var vals = (exp.values || []).map(function (e) { return bagHas(nums, e, salt); });
    var rows = exp.rows ? bagHas([res.rows || 0], exp.rows, salt) : Promise.resolve(true);
    return Promise.all([Promise.all(vals), rows]).then(function (a) {
      var vOk = a[0].every(Boolean), rOk = a[1];
      return { ok: vOk && rOk && res.last !== null, why: !res.last ? 'no result yet' : !vOk ? 'a number in the result is not the expected one' : !rOk ? 'the number of rows (' + res.rows + ') is not the expected one' : '', res: res };
    });
  }

  /* ---------- 1. runnable examples ---------- */
  function example(pre) {
    var code = (pre.querySelector('code') || pre).textContent.replace(/\n$/, '');
    var box = document.createElement('div');
    box.className = 'sq-box';
    box.innerHTML = '<textarea class="sq-edit" spellcheck="false" rows="' + Math.min(14, code.split('\n').length + 1) + '"></textarea>' +
      '<div class="sq-bar"><button type="button" class="sq-run">▶ Run</button><button type="button" class="sq-reset">↺ Reset</button>' +
      '<span class="sq-hint">try changing it</span></div><div class="sq-out"></div>';
    pre.parentNode.replaceChild(box, pre);
    var ta = box.querySelector('textarea'), out = box.querySelector('.sq-out');
    ta.value = code;
    tabKeys(ta);
    box.querySelector('.sq-reset').onclick = function () { ta.value = code; out.innerHTML = ''; };
    box.querySelector('.sq-run').onclick = function () {
      out.innerHTML = '<div class="sq-note">Loading the Nur Finance data (once, ~10 MB)…</div>';
      ready().then(function () { out.innerHTML = table(run(play, ta.value, false)); })
        .catch(function () { out.innerHTML = '<div class="sq-err">Could not load the data — check the internet connection and try again.</div>'; });
    };
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
    try { spec = JSON.parse((pre.querySelector('code') || pre).textContent); } catch (e) { pre.insertAdjacentHTML('beforebegin', '<p class="quiz-error">Workspace could not be read.</p>'); return; }
    var box = document.createElement('div');
    box.className = 'sq-ws';
    pre.parentNode.replaceChild(box, pre);
    var s = store(), mine = s.sql[spec.check] = s.sql[spec.check] || { code: {}, ok: {} };
    save(s);
    box.innerHTML = '<div class="sq-ws-head"><span class="sq-ws-title">🧑‍💻 Your workspace — ' + esc(spec.title || spec.check) + '</span>' +
      '<span class="sq-ws-sub">Write → ▶ Run → ✔ Check → fix → 📤 Submit. Your work is saved in this browser. Ctrl+Enter runs.</span></div>' +
      spec.tasks.map(function (t, i) {
        return '<div class="sq-task" data-i="' + i + '"><div class="sq-task-q"><span class="sq-chip"></span><b>' + esc(t.id) + '</b> ' + esc(t.q) + '</div>' +
          '<textarea class="sq-edit" spellcheck="false" rows="' + (t.text ? 5 : 4) + '" placeholder="' + (t.text ? 'Write here…' : '-- your query') + '"></textarea>' +
          '<div class="sq-bar">' + (t.text ? '' : '<button type="button" class="sq-run">▶ Run</button><button type="button" class="sq-check">✔ Check</button>') +
          '<span class="sq-msg"></span></div><div class="sq-out"></div></div>';
      }).join('') +
      '<div class="sq-ws-foot"><button type="button" class="sq-all">✔ Check all</button><button type="button" class="sq-submit">📤 Submit</button>' +
      '<div class="sq-ws-state"></div></div>';
    var cards = box.querySelectorAll('.sq-task');
    spec.tasks.forEach(function (t, i) {
      var c = cards[i], ta = c.querySelector('textarea'), out = c.querySelector('.sq-out'), msg = c.querySelector('.sq-msg');
      ta.value = mine.code[t.id] || '';
      tabKeys(ta);
      paint(c, mine.ok[t.id]);
      ta.addEventListener('input', function () {
        var st = store(), m = st.sql[spec.check];
        m.code[t.id] = ta.value;
        if (t.text) m.ok[t.id] = ta.value.trim().split('\n').filter(function (l) { return l.trim(); }).length >= (t.minLines || 3);
        else delete m.ok[t.id];
        save(st); paint(c, m.ok[t.id]); foot();
      });
      if (t.text) { msg.textContent = 'At least ' + (t.minLines || 3) + ' lines.'; return; }
      c.querySelector('.sq-run').onclick = function () {
        out.innerHTML = '<div class="sq-note">Running…</div>';
        ready().then(function () { out.innerHTML = table(run(play, ta.value, false)); }).catch(function () { out.innerHTML = '<div class="sq-err">Could not load the data — try again.</div>'; });
      };
      c.querySelector('.sq-check').onclick = function () { checkOne(t, c).then(foot); };
    });
    function paint(card, ok) {
      card.classList.toggle('ok', ok === true); card.classList.toggle('bad', ok === false);
      card.querySelector('.sq-chip').textContent = ok === true ? '✅' : ok === false ? '❌' : '•';
    }
    function checkOne(t, card) {
      var ta = card.querySelector('textarea'), msg = card.querySelector('.sq-msg'), out = card.querySelector('.sq-out');
      if (!ta.value.trim()) { msg.textContent = 'Write a query first.'; return Promise.resolve(); }
      msg.textContent = 'Checking…';
      return Promise.all([ready(), loadChecks()]).then(function (a) {
        var spec2 = a[1].checks[spec.check], exp = spec2 && spec2.tasks[t.id];
        if (!exp) { msg.textContent = 'No automatic check for this task.'; return; }
        return checkTask(ta.value, exp, a[1].salt).then(function (r) {
          var st = store(); st.sql[spec.check].ok[t.id] = r.ok; save(st);
          paint(card, r.ok);
          msg.textContent = r.ok ? 'Correct!' : 'Not yet: ' + r.why + '.';
          if (r.res) out.innerHTML = table(r.res);
        });
      }).catch(function (e) { console.error('check failed', e); msg.textContent = 'Could not check right now — try again.'; });
    }
    box.querySelector('.sq-all').onclick = function () {
      var p = Promise.resolve();
      spec.tasks.forEach(function (t, i) { if (!t.text) p = p.then(function () { return checkOne(t, cards[i]); }); });
      p.then(foot);
    };
    function foot() {
      var m = store().sql[spec.check], need = spec.tasks.length;
      var okN = spec.tasks.filter(function (t) { return m.ok[t.id] === true; }).length;
      var state = box.querySelector('.sq-ws-state'), btn = box.querySelector('.sq-submit');
      var key = wk();
      btn.disabled = okN < need;
      state.innerHTML = '<b>' + okN + ' / ' + need + '</b> done' + (m.submitted ? ' · ✅ submitted ' + esc(m.submitted) : '') +
        (okN < need ? ' · Submit opens when every task is ✅' : '') +
        (key ? '' : '<br>First time? <a target="_blank" rel="noopener" href="' + BOT + 'connect">🔑 Connect this website to the course bot</a> (once).');
    }
    box.querySelector('.sq-submit').onclick = function () {
      var key = wk(), btn = this, state = box.querySelector('.sq-ws-state');
      if (!key) { window.open(BOT + 'connect', '_blank'); return; }
      var m = store().sql[spec.check], files = {}, sqlFile = spec.file || 'answers.sql';
      var sqlText = spec.tasks.filter(function (t) { return !t.text; }).map(function (t) {
        var res = clean ? run(clean, m.code[t.id] || '', true) : { cells: [] };
        var first = res.last && res.last.values.length ? res.last.values.slice(0, 3).map(function (r) { return r.join(', '); }).join('; ') : '';
        return '-- ' + t.id + ': ' + t.q + '\n' + (m.code[t.id] || '').trim() + '\n-- result: ' + first + '\n';
      }).join('\n');
      if (sqlText.trim()) files[sqlFile] = sqlText;
      spec.tasks.filter(function (t) { return t.text; }).forEach(function (t) { files[t.file] = (m.code[t.id] || '').trim() + '\n'; });
      btn.disabled = true; state.innerHTML = 'Submitting…';
      fetch(WORKER + '/submit', { method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: key, lesson: spec.lesson, check: spec.check, files: files, ok: m.ok }) })
        .then(function (r) { return r.json().then(function (j) { return { status: r.status, j: j }; }); })
        .then(function (x) {
          if (x.status === 200) {
            var st = store(); st.sql[spec.check].submitted = new Date().toISOString().slice(0, 10); save(st);
            state.innerHTML = '✅ Submitted! Your mentor is notified — feedback will appear in 📤 Homework.';
          } else if (x.status === 401) {
            try { localStorage.removeItem(WK); } catch (e) { /* nothing */ }
            state.innerHTML = 'This browser is not connected any more. <a target="_blank" rel="noopener" href="' + BOT + 'connect">🔑 Connect again</a>, then tap Submit.';
            btn.disabled = false;
          } else { state.innerHTML = 'Could not submit (' + esc(x.j.error || x.status) + '). Try again in a minute.'; btn.disabled = false; }
        })
        .catch(function () { state.innerHTML = 'No connection — try again in a minute.'; btn.disabled = false; });
    };
    foot();
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(function () {
      var sec = document.querySelector('.markdown-section');
      if (!sec) return;
      Array.prototype.forEach.call(sec.querySelectorAll('pre[data-lang="sqltask"]'), workspace);
      Array.prototype.forEach.call(sec.querySelectorAll('pre[data-lang="sql"]'), example);
    });
  });
})();
