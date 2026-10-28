/* Python in the browser (Docsify plugin), with Pyodide 0.26.4 (CPython compiled for the web) + pandas, numpy, matplotlib.

1. Every runnable ```python example on a page becomes an editable box with ▶ Run (Ctrl + Enter). Python starts on the first
   ▶ Run of a page (never on page load: about 15 MB the first time, then the browser keeps it). The blocks of a page share
   one namespace, like the cells of a notebook, in page order; "▶ Run all above" runs every earlier block first.
   The output shows what was printed, then the value of the last line the way Jupyter does (a DataFrame / Series as a
   table, at most 50 rows), the matplotlib figures as pictures, and an error as its last line in plain words.
2. The course data: before a block runs, every "….csv / .xlsx / .db / .json / .parquet" string in it is looked up in
   MANIFEST (the files under data/ in the repository), fetched once (nur.db from the site's own assets/nur.db.gz, the
   rest from GitHub) and written into Python's file system at the path the code uses, at the same path as in the
   repository (/course/data/…, so DATA = Path("..") works as in the notebooks) and under its bare name.
3. Python runs in a Web Worker, so the page never freezes; "↺ Restart Python" stops a block that runs forever.
4. window.ALPy for the other engines (task.js, challenge.js):
     ALPy.ready()                       → Promise (Python started)
     ALPy.run(code)                     → Promise<{stdout, error, value, html, images, numbers, trace, rows}>
     ALPy.editor(container, {id, starter, placeholder}) → {get(), set(code), run(), el}
   "numbers" holds every number in what was printed and in the value (the tokens of scripts/check.py's Bag).
Blocks that are not meant to run (terminal commands, code with … placeholders, a list of methods) stay as they are,
with a line that says why. Each box is an "al-block" and gets "al-done" after a run without an error ("al:change").
Edits are kept in localStorage "al.py" (code → per page and block, ed → per editor id, done → blocks that ran). */
(function () {
  var BASE = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
  var REPO_RAW = 'https://raw.githubusercontent.com/Raxmatov005/analytics-course/main/';
  var DB_GZ = 'assets/nur.db.gz?v=1';   // the same file and cache ("al-db") as sqlrun.js
  var KEY = 'al.py', FILES_V = 1;
  /* every data file in the repository a block may read, with its size in KB (for the progress line) */
  var MANIFEST = {
    'data/ab/aa_events.csv': 1211, 'data/ab/aa_users.csv': 735, 'data/ab/events.csv': 2689, 'data/ab/loans_followup.csv': 113,
    'data/ab/users.csv': 1600,
    'data/excel/applications.csv': 1562, 'data/excel/customers_dirty.csv': 534, 'data/excel/installments.csv': 4266,
    'data/excel/loans_status.csv': 769, 'data/excel/monthly_disbursements.csv': 7, 'data/excel/nur_week4_start.xlsx': 7561,
    'data/excel/payments_dirty.csv': 3380,
    'data/raw/applications.csv': 1090, 'data/raw/app_events.csv': 1393, 'data/raw/branches.csv': 1,
    'data/raw/collections_actions.csv': 380, 'data/raw/customers.csv': 534, 'data/raw/dim_date.csv': 59,
    'data/raw/installments.csv': 4266, 'data/raw/loans.csv': 532, 'data/raw/nur.db': 9400, 'data/raw/payments.csv': 2183,
    'data/raw/products.csv': 1, 'data/raw/staff.csv': 5,
    'data/powerbi/branches.csv': 1, 'data/powerbi/customers_clean.csv': 471, 'data/powerbi/customer_id_map.csv': 1,
    'data/powerbi/dim_date.csv': 92, 'data/powerbi/fct_applications.csv': 1334, 'data/powerbi/fct_collections_actions.csv': 571,
    'data/powerbi/fct_first_instalment.csv': 515, 'data/powerbi/fct_installments.csv': 6629, 'data/powerbi/products.csv': 1,
    'data/powerbi/roll_rates.csv': 1, 'data/powerbi/staff_collectors.csv': 2, 'data/powerbi/v_loan_status.csv': 678,
    'data/powerbi/v_payments_clean.csv': 2182, 'data/powerbi/v_portfolio_monthly.csv': 89
  };
  /* a name the page uses without importing it (the notebook imported it in a cell above): the package Pyodide loads,
     the variable, and the import that defines it — run only when that variable does not exist yet */
  var AUTO = [
    [/(^|[^.\w])stats\.\w/, 'scipy', 'stats', 'from scipy import stats'],
    [/(^|[^.\w])sns\.|\bseaborn\b/, 'pip:seaborn', 'sns', 'import seaborn as sns'],   // not in Pyodide's own set: from PyPI
    [/(^|[^.\w])(proportions_ztest|confint_proportions_2indep|proportion_confint|proportion_effectsize)\s*\(/, 'statsmodels', 'proportions_ztest',
      'from statsmodels.stats.proportion import proportions_ztest, confint_proportions_2indep, proportion_confint, proportion_effectsize'],
    [/(^|[^.\w])(zt_ind_solve_power|tt_ind_solve_power|NormalIndPower)\b/, 'statsmodels', 'zt_ind_solve_power',
      'from statsmodels.stats.power import zt_ind_solve_power, tt_ind_solve_power, NormalIndPower'],
    [/(^|[^.\w])multipletests\s*\(/, 'statsmodels', 'multipletests', 'from statsmodels.stats.multitest import multipletests'],
    [/(^|[^.\w])FuncFormatter\s*\(/, '', 'FuncFormatter', 'from matplotlib.ticker import FuncFormatter'],
    [/(^|[^.\w])sqlite3\./, 'sqlite3', 'sqlite3', 'import sqlite3'],
    [/(^|[^.\w])Path\s*\(/, '', 'Path', 'from pathlib import Path'],
    [/(^|[^.\w])csv\./, '', 'csv', 'import csv'],
    [/(^|[^.\w])math\./, '', 'math', 'import math'],
    [/(^|[^.\w])hashlib\./, '', 'hashlib', 'import hashlib'],
    [/(^|[^.\w])(date|timedelta)\s*\(/, '', 'date', 'from datetime import date, datetime, timedelta'],
    [/\b(to_excel|read_excel|ExcelWriter)\b/, 'openpyxl', '', '']
  ];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function store() { try { var s = JSON.parse(localStorage.getItem(KEY)) || {}; s.code = s.code || {}; s.ed = s.ed || {}; s.done = s.done || {}; return s; } catch (e) { return { code: {}, ed: {}, done: {} }; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private window */ } }
  /* words in the page's language (lang.js), looked up while a box is drawn */
  function T(en, ru) { return window.ALLang ? window.ALLang.t(en, ru) : en; }
  function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
  /* the page: "weeks/week-05/day-2" or "ru/weeks/week-05/day-2"; "plain" is the same for a page and its Russian copy */
  function pageKey() { return location.hash.replace(/^#\/?/, '').replace(/\?.*$/, '') || 'README'; }
  function plainKey() { return pageKey().replace(/^ru(\/|$)/, '') || 'README'; }
  function week() { var m = /week-0?(\d+)/.exec(pageKey()); return m ? Number(m[1]) : 0; }
  /* the working directory mirrors where the week's notebooks live: week 5 in data/python, weeks 6–8 one folder deeper */
  function cwd() { var w = week(); return '/course/data/python' + (w >= 6 && w <= 8 ? '/week' + w : ''); }

  /* ---------- the interpreter: Pyodide in a Web Worker ---------- */
  /* The worker's own code, sent to it as text (a Blob), so the site needs no extra file. */
  function workerMain() {
    var py = null;
    function stage(s, x) { self.postMessage({ t: 'stage', stage: s, x: x }); }
    function said(msg) { if (/^Loading /.test(msg)) stage('pkgs', msg.replace(/^Loading /, '')); }
    function mkdirs(d) { try { py.FS.mkdirTree(d); } catch (e) { /* exists */ } }
    function dir(p) { return p.replace(/\/[^\/]*$/, '') || '/'; }
    var jobs = {
      boot: function (m) {
        importScripts(m.base + 'pyodide.js');
        return self.loadPyodide({ indexURL: m.base }).then(function (p) {
          py = p; stage('packages');
          return py.loadPackage(['numpy', 'pandas', 'matplotlib'], { messageCallback: function () {} });
        }).then(function () { py.runPython(m.prelude); return true; });
      },
      files: function (m) {   // the first path gets the bytes, the others point to it
        m.files.forEach(function (f) {
          var main = f.paths[0], bytes = new Uint8Array(f.data);
          mkdirs(dir(main)); py.FS.writeFile(main, bytes);
          f.paths.slice(1).forEach(function (p) {
            if (p === main) return;
            mkdirs(dir(p));
            try { py.FS.unlink(p); } catch (e) { /* not there */ }
            try { py.FS.symlink(main, p); } catch (e) { try { py.FS.writeFile(p, bytes); } catch (e2) { /* a folder of that name */ } }
          });
        });
        return Promise.resolve(true);
      },
      run: function (m) {
        var own = m.pkgs.filter(function (p) { return p.indexOf('pip:') !== 0; }), pip = m.pkgs.filter(function (p) { return p.indexOf('pip:') === 0; });
        var pre = own.length ? py.loadPackage(own, { messageCallback: said, errorCallback: function () {} }).catch(function () {}) : Promise.resolve();
        pip.forEach(function (p) {   // a pure-Python package from PyPI, through micropip (once: then it is imported)
          var name = p.slice(4);
          pre = pre.then(function () {
            stage('pkgs', name);
            return py.loadPackage('micropip', { messageCallback: function () {} })
              .then(function () { return py.runPythonAsync('import importlib.util, micropip\nif importlib.util.find_spec("' + name + '") is None: await micropip.install("' + name + '")'); })
              .catch(function () {});
          });
        });
        return pre.then(function () { return py.loadPackagesFromImports(m.code, { messageCallback: said }).catch(function () {}); })
          .then(function () {
            stage('run');
            var f = py.globals.get('_al_run');
            try { return f(m.code, m.page, m.cwd, JSON.stringify(m.imports)); } finally { f.destroy(); }
          });
      }
    };
    self.onmessage = function (e) {
      var m = e.data, job;
      try { job = Promise.resolve(jobs[m.cmd](m)); } catch (err) { job = Promise.reject(err); }
      job.then(function (r) { self.postMessage({ id: m.id, ok: true, res: r }); },
        function (err) { self.postMessage({ id: m.id, ok: false, err: String(err && err.message || err) }); });
    };
  }
  /* Python's side: one namespace per page (_G), a cell runner that returns JSON like Jupyter's display */
  var PRELUDE = [
    'import os, sys, io, ast, json, base64, traceback, linecache',
    'os.environ["MPLBACKEND"] = "AGG"',
    'import matplotlib',
    'matplotlib.use("AGG")',
    'import matplotlib.pyplot as _plt',
    'import matplotlib.artist as _artist',
    'import numpy as _np',
    'import pandas as _pd',
    '_plt.show = lambda *a, **k: None',
    '_pd.set_option("display.width", 120); _pd.set_option("display.max_columns", 30)',
    '_G, _PAGE, _SHOWN = {}, None, []',
    'def _show(v):',
    '    o = {"value": None, "html": None, "rows": None, "cols": None, "mpl": False}',
    '    if isinstance(v, (_pd.DataFrame, _pd.Series)):',
    '        df = v.to_frame(name="" if v.name is None else v.name) if isinstance(v, _pd.Series) else v',
    '        o["rows"], o["cols"] = int(df.shape[0]), int(df.shape[1])',
    '        o["html"] = df.head(50).to_html(border=0, classes="sq-table py-df", max_cols=40)',
    '        o["value"] = repr(v)',
    '    else:',
    '        o["mpl"] = isinstance(v, _artist.Artist) or (isinstance(v, (list, tuple)) and len(v) > 0 and all(isinstance(x, _artist.Artist) for x in v))',
    '        r = repr(v)',
    '        o["value"] = r if len(r) < 20000 else r[:20000] + " …"',
    '    return o',
    'def display(*vs):',
    '    for v in vs: _SHOWN.append(_show(v))',
    'def _al_fresh():',
    '    _G.clear()',
    '    _G.update({"__name__": "__main__", "__builtins__": __builtins__, "pd": _pd, "np": _np, "plt": _plt, "display": display})',
    '    _plt.close("all")',
    'def _al_run(src, page, cwd, imports):',
    '    global _PAGE',
    '    if page != _PAGE:',
    '        _al_fresh(); _PAGE = page',
    '        os.makedirs(cwd + "/figures", exist_ok=True); os.chdir(cwd)',
    '    for name, line in json.loads(imports):',
    '        if name not in _G:',
    '            try: exec(line, _G)',
    '            except Exception: pass',
    '    del _SHOWN[:]',
    '    res = {"stdout": "", "error": None, "kind": None, "name": None, "trace": None, "value": None, "html": None, "rows": None, "cols": None, "images": [], "shown": []}',
    '    buf = io.StringIO(); old = sys.stdout, sys.stderr; sys.stdout = sys.stderr = buf',
    '    linecache.cache["<cell>"] = (len(src), None, src.splitlines(True), "<cell>")',
    '    mpl = False',
    '    try:',
    '        tree = ast.parse(src, "<cell>", "exec")',
    '        last = None',
    '        if tree.body and isinstance(tree.body[-1], ast.Expr):',
    '            last = ast.Expression(tree.body.pop().value)',
    '        exec(compile(tree, "<cell>", "exec"), _G)',
    '        if last is not None:',
    '            v = eval(compile(last, "<cell>", "eval"), _G)',
    '            if v is not None:',
    '                _G["_"] = v',
    '                o = _show(v); mpl = o.pop("mpl"); res.update(o)',
    '    except BaseException as e:',
    '        tb = e.__traceback__',
    '        while tb is not None and tb.tb_frame.f_code.co_filename != "<cell>": tb = tb.tb_next',
    '        res["trace"] = "".join(traceback.format_exception(type(e), e, tb))',
    '        res["error"] = traceback.format_exception_only(type(e), e)[-1].strip()',
    '        res["kind"] = type(e).__name__; res["name"] = getattr(e, "name", None)',
    '    finally:',
    '        sys.stdout, sys.stderr = old',
    '    res["stdout"] = buf.getvalue()',
    '    for s in _SHOWN: s.pop("mpl", None)',
    '    res["shown"] = list(_SHOWN)',
    '    for n in _plt.get_fignums():',
    '        try:',
    '            b = io.BytesIO(); _plt.figure(n).savefig(b, format="png", dpi=100, bbox_inches="tight", facecolor="white")',
    '            res["images"].append("data:image/png;base64," + base64.b64encode(b.getvalue()).decode())',
    '        except Exception as e:',
    '            res["stdout"] += "\\n[figure %d could not be drawn: %s]" % (n, e)',
    '    _plt.close("all")',
    '    if mpl and res["images"]: res["value"] = None',
    '    return json.dumps(res, default=str)'
  ].join('\n');

  var worker = null, booting = null, seq = 0, waits = {}, queue = Promise.resolve(), written = {}, state = 'off', stageText = '';
  function call(cmd, data) {
    return new Promise(function (ok, bad) {
      var id = ++seq;
      waits[id] = { ok: ok, bad: bad };
      data.cmd = cmd; data.id = id;
      worker.postMessage(data);
    });
  }
  function failAll(why) {
    Object.keys(waits).forEach(function (id) { waits[id].bad(new Error(why)); });
    waits = {};
  }
  function start() {
    if (booting) return booting;
    var src = '(' + workerMain.toString() + ')();';
    worker = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
    worker.onmessage = function (e) {
      var m = e.data;
      if (m.t === 'stage') { onStage(m.stage, m.x); return; }
      var w = waits[m.id];
      if (!w) return;
      delete waits[m.id];
      if (m.ok) w.ok(m.res); else w.bad(new Error(m.err));
    };
    worker.onerror = function (e) { failAll(e.message || 'worker error'); };
    setState('starting'); onStage('start');
    booting = call('boot', { base: BASE, prelude: PRELUDE }).then(function () { setState('on'); });
    booting.catch(function () { stop(); });
    return booting;
  }
  function stop() {   // the worker and everything in it go; the downloaded files stay in memory for the next start
    if (worker) worker.terminate();
    worker = null; booting = null; written = {}; queue = Promise.resolve();
    failAll('restarted');
    idle(); setState('off');
  }
  function setState(s) {
    state = s;
    Array.prototype.forEach.call(document.querySelectorAll('.py-restart'), function (b) { b.hidden = s === 'off'; });
  }

  /* ---------- the progress line in every waiting box ---------- */
  var runStart = 0, ticker = null;
  function mb(kb) { return (kb / 1024).toFixed(1); }
  function onStage(s, x) {
    if (s === 'start') stageText = T('Starting Python — first time about 15 MB, then it is cached…', 'Запускаем Python — в первый раз около 15 МБ, потом он берётся из кэша…');
    else if (s === 'packages') stageText = T('Loading pandas, numpy and matplotlib (first time only)…', 'Загружаем pandas, numpy и matplotlib (только в первый раз)…');
    else if (s === 'pkgs') stageText = T('Loading ' + x + ' (first time only)…', 'Загружаем ' + x + ' (только в первый раз)…');
    else if (s === 'file') stageText = T('Fetching ' + x.name + ' — ' + mb(x.got) + ' of ' + mb(x.total) + ' MB…', 'Скачиваем ' + x.name + ' — ' + mb(x.got) + ' из ' + mb(x.total) + ' МБ…');
    else if (s === 'run') {
      stageText = T('Running…', 'Выполняется…'); runStart = Date.now();
      clearInterval(ticker); ticker = setInterval(paintWaiting, 1000);
    }
    paintWaiting();
  }
  function idle() { stageText = ''; runStart = 0; clearInterval(ticker); }
  function paintWaiting() {
    var secs = stageText && runStart && /Running|Выполня/.test(stageText) ? Math.round((Date.now() - runStart) / 1000) : 0;
    var text = stageText + (secs >= 5 ? T(' ' + secs + ' s — if it never ends, ↺ Restart Python stops it.', ' ' + secs + ' с — если это не заканчивается, ↺ Перезапустить Python остановит выполнение.') : '');
    Array.prototype.forEach.call(document.querySelectorAll('.py-loading'), function (el) { el.textContent = text; });
  }

  /* ---------- the data files ---------- */
  var BYNAME = {};
  Object.keys(MANIFEST).forEach(function (p) { var n = p.split('/').pop(); (BYNAME[n] = BYNAME[n] || []).push(p); });
  function norm(p) {
    var out = [];
    p.replace(/\\/g, '/').split('/').forEach(function (s) { if (!s || s === '.') return; if (s === '..') out.pop(); else out.push(s); });
    return out.join('/');
  }
  /* the repository file a string in the code means: as written from data/python/ or the root, from data/python/weekN/, then
     data/ab/ and data/raw/ (week 5 reads the week-4 extracts in data/excel/ first), then any folder by its name */
  function resolve(lit) {
    var w = week(), base = lit.replace(/\\/g, '/').split('/').pop();
    var c = [norm('data/python/' + lit), norm(lit)];   // from the notebooks' folder, or from the repository root ("data/raw/…")
    if (w) c.push(norm('data/python/week' + w + '/' + lit));
    if (w === 5) c.push('data/excel/' + base);
    c.push('data/ab/' + base, 'data/raw/' + base);
    c = c.concat(BYNAME[base] || []);
    for (var i = 0; i < c.length; i++) if (MANIFEST[c[i]]) return c[i];
    return null;
  }
  function literals(code) {
    var re = /(["'])([^"'\n]+?\.(?:csv|xlsx|db|json|parquet))\1/gi, m, seen = {}, out = [];
    while ((m = re.exec(code))) if (!seen[m[2]]) { seen[m[2]] = 1; out.push(m[2]); }
    return out;
  }
  function fsPath(lit, dir) {
    var p = lit.replace(/\\/g, '/');
    return '/' + norm(p.charAt(0) === '/' ? p : dir + '/' + p);
  }
  var fetched = {};   // repository path → Promise<ArrayBuffer>, for the whole visit
  function download(url, name, kb) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      if (!r.body || !r.body.getReader) return r.arrayBuffer();
      var rd = r.body.getReader(), parts = [], got = 0;
      return (function pump() {
        return rd.read().then(function (x) {
          if (x.done) {
            var all = new Uint8Array(got), o = 0;
            parts.forEach(function (p) { all.set(p, o); o += p.length; });
            return all.buffer;
          }
          parts.push(x.value); got += x.value.length;
          onStage('file', { name: name, got: got / 1024, total: Math.max(kb, got / 1024) });
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
  /* nur.db: the gzip copy the site serves (4 MB instead of 9.6), from the cache sqlrun.js fills when it is there */
  function nurDb() {
    var box = window.caches ? caches.open('al-db').catch(function () { return null; }) : Promise.resolve(null);
    return box.then(function (c) {
      if (!c) return download(DB_GZ, 'nur.db', 4000).then(gunzip);
      return c.keys().then(function (ks) {
        var k = ks.filter(function (q) { return q.url.indexOf('nur.db.gz') >= 0; })[0];
        if (k) return c.match(k).then(function (hit) { return hit.arrayBuffer(); }).then(gunzip);
        return download(DB_GZ, 'nur.db', 4000).then(function (buf) {
          c.put(DB_GZ, new Response(buf.slice(0))).catch(function () {});
          return gunzip(buf);
        });
      });
    }).catch(function () { return download(REPO_RAW + 'data/raw/nur.db', 'nur.db', MANIFEST['data/raw/nur.db']); });
  }
  /* any other file: from GitHub, kept in the browser's cache ("al-py") for the next visit */
  function repoFile(path) {
    if (fetched[path]) return fetched[path];
    var name = path.split('/').pop(), url = REPO_RAW + path, key = url + '?v=' + FILES_V;
    if (path === 'data/raw/nur.db') fetched[path] = nurDb();
    else fetched[path] = (window.caches ? caches.open('al-py').catch(function () { return null; }) : Promise.resolve(null)).then(function (c) {
      return (c ? c.match(key).catch(function () { return null; }) : Promise.resolve(null)).then(function (hit) {
        if (hit) return hit.arrayBuffer();
        return download(url, name, MANIFEST[path]).then(function (buf) {
          if (c) c.put(key, new Response(buf.slice(0))).catch(function () {});
          return buf;
        });
      });
    });
    fetched[path].catch(function () { delete fetched[path]; });
    return fetched[path];
  }
  /* write what this code reads, once per interpreter */
  function mount(code) {
    var dir = cwd(), jobs = [];
    literals(code).forEach(function (lit) {
      var repo = resolve(lit);
      if (!repo) return;   // a file the code writes, or one the course does not have
      var paths = ['/course/' + repo, fsPath(lit, dir), dir + '/' + repo.split('/').pop()].filter(function (p) { return !written[p]; });
      if (!paths.length) return;
      jobs.push(repoFile(repo).then(function (buf) { return { data: buf, paths: paths }; }));
    });
    if (!jobs.length) return Promise.resolve();
    return Promise.all(jobs).then(function (files) {
      return call('files', { files: files }).then(function () {
        files.forEach(function (f) { f.paths.forEach(function (p) { written[p] = 1; }); });
      });
    });
  }

  /* ---------- running ---------- */
  function toNum(s) {
    s = String(s).trim().replace(/[\s  ,]/g, '').replace(/%$/, '');
    if (s === '' || s === '-' || isNaN(Number(s))) return null;
    return Number(s);
  }
  /* scripts/check.py's Bag: "7 828", "3.12%", "-0.5"; a token like "7828, 13" (a tuple) also gives 7828 and 13 */
  function numbers(text) {
    var out = [];
    (String(text || '').match(/-?\d[\d   ,]*\.?\d*%?/g) || []).forEach(function (tok) {
      var n = toNum(tok);
      if (n !== null) out.push(n);
      var parts = tok.replace(/%$/, '').split(/[,\s  ]+/).filter(Boolean);
      // a gap of two spaces, ", " or a group that is not 3 digits: separate numbers (table columns, a tuple), not one number
      if (parts.length > 1 && (/,\s|\s\s/.test(tok) || parts.slice(1).some(function (p) { return p.replace(/\..*$/, '').length !== 3; }))) {
        parts.forEach(function (p) { var k = toNum(p); if (k !== null) out.push(k); });
      }
    });
    return out;
  }
  /* what an error means here, in plain words */
  function plain(r) {
    var e = r.error || '', k = r.kind || '';
    if (k === 'NameError' && r.name) return T('run the block that creates ' + r.name + ' first', 'сначала выполните блок, в котором создаётся ' + r.name);
    if (/no such table/i.test(e)) return T('that table is not in nur.db — check its name', 'такой таблицы нет в nur.db — проверьте имя');
    if (k === 'FileNotFoundError') return T('this file is not one of the course data files the page can load — check the name', 'этого файла нет среди файлов данных курса — проверьте имя');
    if (k === 'ModuleNotFoundError') return T('this library is not available in the browser version of Python', 'этой библиотеки нет в браузерной версии Python');
    if (k === 'KeyError') return T('there is no column or key with that name — check the spelling (df.columns lists the columns)', 'нет столбца или ключа с таким именем — проверьте написание (df.columns покажет столбцы)');
    if (k === 'IndentationError' || k === 'TabError') return T('the indentation is off: lines inside a def / for / if start 4 spaces further right', 'не тот отступ: строки внутри def / for / if начинаются на 4 пробела правее');
    if (k === 'SyntaxError') return T('Python could not read the code: look at the line shown below for a missing bracket, quote, comma or colon', 'Python не смог прочитать код: найдите в строке ниже пропущенную скобку, кавычку, запятую или двоеточие');
    if (k === 'AttributeError' && /NoneType/.test(e)) return T('the variable holds None — a function probably returned nothing (a missing return?)', 'в переменной None — вероятно, функция ничего не вернула (нет return?)');
    if (k === 'AttributeError') return T('that object has no such method or column — check the spelling and what kind of object it is', 'у этого объекта нет такого метода или столбца — проверьте написание и тип объекта');
    if (k === 'TypeError') return T('a value of the wrong type, or the wrong number of arguments (text where a number was expected?)', 'значение не того типа или не то число аргументов (текст вместо числа?)');
    if (k === 'ValueError') return T('the value has the right type but cannot be used here — the message says which one', 'тип значения верный, но здесь его использовать нельзя — в сообщении сказано, какое');
    if (k === 'ZeroDivisionError') return T('a division by zero', 'деление на ноль');
    if (k === 'AssertionError') return T('an assert check failed: the result is not what the code expected', 'проверка assert не прошла: результат не тот, что ожидает код');
    if (k === 'NotImplementedError') return T('this function is still a TODO — write its body first', 'эта функция ещё TODO — сначала напишите её тело');
    if (k === 'MemoryError') return T('the browser ran out of memory — ↺ Restart Python and work on a smaller piece of the data', 'браузеру не хватило памяти — ↺ Перезапустите Python и возьмите часть данных поменьше');
    return '';
  }
  function failed(text) {
    return { stdout: '', error: text, kind: 'Error', value: null, html: null, images: [], shown: [], numbers: [], trace: null, rows: null };
  }
  /* run one piece of code in the page's namespace, after the ones queued before it */
  function exec(code) {
    var job = queue.then(function () {
      return start().then(function () {
        var imports = [], pkgs = [], bare = stripCode(code);   // comments and strings never load a package
        AUTO.forEach(function (a) {
          if (!a[0].test(bare)) return;
          if (a[1] && pkgs.indexOf(a[1]) < 0) pkgs.push(a[1]);
          if (a[2]) imports.push([a[2], a[3]]);
        });
        return mount(code).then(function () {
          // Jupyter's "%matplotlib inline" / "!pip install …" lines are not Python: they are skipped
          var src = code.replace(/^([ \t]*)([%!].*)$/gm, '$1pass  # $2');
          return call('run', { code: src, page: plainKey(), cwd: cwd(), pkgs: pkgs, imports: imports });
        });
      }).then(function (json) {
        var r = JSON.parse(json);
        if (r.error) { var p = plain(r); r.raw = r.error; if (p) r.error += ' — ' + p; }
        r.numbers = numbers([r.stdout, r.value].concat((r.shown || []).map(function (s) { return s.value; })).join('\n'));
        return r;
      }, function (e) {
        var why = String(e && e.message || e);
        if (why === 'restarted') return failed(T('Python was restarted — run the blocks again from the top (▶ Run all above).', 'Python перезапущен — выполните блоки заново сверху (▶ Выполнить всё выше).'));
        console.error('pyrun', e);
        if (/HTTP|fetch|network/i.test(why)) return failed(T('Could not load a data file — check the internet connection and try again.', 'Не удалось загрузить файл данных — проверьте подключение к интернету и попробуйте снова.'));
        return failed(T('Could not start Python — check the internet connection and try again.', 'Не удалось запустить Python — проверьте подключение к интернету и попробуйте снова.') + ' (' + why + ')');
      });
    });
    queue = job.then(function () {}, function () {});
    return job.then(function (r) { idle(); return r; });
  }
  function fmt(n) { return Number(n).toLocaleString('en').replace(/,/g, ' '); }
  function table(o) {
    if (!o.html) return o.value != null ? '<div class="py-value">' + esc(o.value) + '</div>' : '';
    var n = o.rows, c = o.cols;
    var note = n > 50 ? T('First 50 of ' + fmt(n) + ' rows · ' + c + (c === 1 ? ' column' : ' columns') + ' · … ' + fmt(n - 50) + ' more rows not shown',
        'Первые 50 из ' + fmt(n) + ' строк · столбцов: ' + c + ' · … ещё ' + fmt(n - 50) + ' не показаны')
      : T(fmt(n) + (n === 1 ? ' row' : ' rows') + ' × ' + c + (c === 1 ? ' column' : ' columns'), 'Строк: ' + fmt(n) + ' · столбцов: ' + c);
    return '<div class="sq-note">' + note + '</div><div class="sq-scroll">' + o.html + '</div>';
  }
  function render(out, r) {
    var h = '', so = r.stdout || '';
    if (so.length > 20000) so = so.slice(0, 20000) + T('\n… (the rest of the printout is cut)', '\n… (остальной вывод обрезан)');
    if (so.replace(/\s+$/, '')) h += '<div class="py-stdout">' + esc(so.replace(/\s+$/, '')) + '</div>';
    (r.shown || []).forEach(function (s) { h += table(s); });
    if (!r.error) h += table(r);
    (r.images || []).forEach(function (src) { h += '<img class="py-fig" alt="' + T('figure', 'график') + '" src="' + src + '">'; });
    if (r.error) {
      h += '<div class="sq-err">⚠ ' + esc(r.error) + '</div>';
      if (r.kind === 'NameError') h += '<div class="sq-hint-box">' + T('The blocks of a page share their variables, like the cells of a notebook: ▶ Run all above runs every block before this one, in order.',
        'Блоки страницы делят переменные, как ячейки ноутбука: ▶ Выполнить всё выше запустит по порядку все блоки до этого.') + '</div>';
      if (r.trace && r.trace.split('\n').length > 2) h += '<details class="py-trace"><summary>' + T('Full error message', 'Полное сообщение об ошибке') + '</summary><div class="py-stdout">' + esc(r.trace.replace(/\s+$/, '')) + '</div></details>';
    }
    if (!h) h = '<div class="sq-note">' + T('✓ Done — nothing printed, and the last line is not a value to show.', '✓ Готово — ничего не напечатано, а последняя строка — не значение для показа.') + '</div>';
    out.innerHTML = h;
  }

  /* ---------- the editor box ---------- */
  function fit(ta, least) {   // as tall as its code, so nothing is cut off
    ta.rows = Math.max(least || 1, Math.min(30, ta.value.split('\n').length));
    if (window.ALGrow) window.ALGrow(ta);   // a long line wraps: grown to its wrapped height (sqlrun.js)
  }
  function keys(ta, go) {
    ta.addEventListener('keydown', function (e) {
      var v = ta.value, p = ta.selectionStart;
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); go(); return; }
      if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); ta.value = v.slice(0, p) + '    ' + v.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = p + 4; ta.dispatchEvent(new Event('input')); return; }
      if (e.key === 'Enter' && !e.shiftKey && !e.altKey && p === ta.selectionEnd) {   // keep the indent; one step more after a ":"
        var line = v.slice(v.lastIndexOf('\n', p - 1) + 1, p), ind = /^[ \t]*/.exec(line)[0];
        if (/:\s*(#.*)?$/.test(line)) ind += '    ';
        if (!ind) return;
        e.preventDefault();
        ta.value = v.slice(0, p) + '\n' + ind + v.slice(p); ta.selectionStart = ta.selectionEnd = p + 1 + ind.length;
        ta.dispatchEvent(new Event('input'));
      }
    });
  }
  /* one box: code, ▶ Run, the output. o = {code, saved, onSave(text|null), least, placeholder, label, tip, page} */
  function box(o) {
    var el = document.createElement('div');
    el.className = 'py-box al-block' + (o.page ? ' py-page' : ' py-ed');
    el.innerHTML = '<div class="sq-top"><span class="sq-lang">' + esc(o.label) + '</span><span class="sq-tip">' + esc(o.tip) + '</span>' +
      '<span class="py-ok" title="' + T('ran without an error', 'выполнено без ошибок') + '">✓</span>' +
      '<button type="button" class="sq-reset" hidden>' + T('Reset', 'Вернуть') + '</button></div>' +
      '<textarea class="sq-edit py-edit" spellcheck="false" wrap="soft" autocapitalize="off" autocorrect="off"' + (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : '') + '></textarea>' +
      '<div class="sq-bar"><button type="button" class="sq-run">' + T('▶ Run', '▶ Выполнить') + '</button><span class="sq-keys">Ctrl + Enter</span>' +
      '<button type="button" class="py-link py-above" hidden>' + T('▶ Run all above', '▶ Выполнить всё выше') + '</button>' +
      '<button type="button" class="py-link py-restart"' + (state === 'off' ? ' hidden' : '') + '>' + T('↺ Restart Python', '↺ Перезапустить Python') + '</button></div>' +
      '<div class="sq-out"></div>';
    var ta = el.querySelector('textarea'), out = el.querySelector('.sq-out'), rs = el.querySelector('.sq-reset');
    ta.value = o.saved != null ? o.saved : o.code;
    rs.hidden = ta.value === o.code;
    fit(ta, o.least);
    function changed() { fit(ta, o.least); rs.hidden = ta.value === o.code; o.onSave(ta.value === o.code ? null : ta.value); }
    ta.addEventListener('input', changed);
    rs.onclick = function () { ta.value = o.code; changed(); out.innerHTML = ''; };
    function run() {
      if (!ta.value.trim()) { out.innerHTML = '<div class="sq-note">' + T('Write some Python first.', 'Сначала напишите код на Python.') + '</div>'; return Promise.resolve(failed(T('No code yet.', 'Кода пока нет.'))); }
      el.classList.add('py-busy');
      out.innerHTML = '<div class="sq-note py-loading"></div>';
      if (!stageText) stageText = state === 'on' ? T('Waiting for the block before…', 'Ждём предыдущий блок…') : '';
      paintWaiting();
      return exec(ta.value).then(function (r) {
        el.classList.remove('py-busy');
        render(out, r);
        if (!r.error && o.page) {
          var was = el.classList.contains('al-done');
          el.classList.add('al-done');
          o.onDone();
          if (!was) document.dispatchEvent(new CustomEvent('al:change'));
        } else if (!r.error) el.classList.add('al-done');
        return r;
      });
    }
    keys(ta, run);
    el.querySelector('.sq-run').onclick = run;
    el.querySelector('.py-restart').onclick = function () {
      stop();
      out.innerHTML = '<div class="sq-note">' + T('Python was restarted: every variable is gone. ▶ Run starts it again.', 'Python перезапущен: все переменные удалены. ▶ Выполнить запустит его снова.') + '</div>';
    };
    var above = el.querySelector('.py-above');
    above.onclick = function () {
      var all = Array.prototype.slice.call(document.querySelectorAll('.markdown-section .py-page'));
      var before = all.filter(function (b) { return b !== el && (b.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING); });
      var p = Promise.resolve(), bad = [];
      before.forEach(function (b, i) {   // like a notebook's "Run all", but a block that fails does not stop the ones after it
        p = p.then(function () { return b._pyRun().then(function (r) { if (r.error) bad.push(i + 1); }); });
      });
      p.then(run).then(function () {
        if (bad.length) out.insertAdjacentHTML('afterbegin', '<div class="sq-hint-box py-above-note">' + T((bad.length === 1 ? 'Block ' : 'Blocks ') + bad.join(', ') +
          ' above stopped with an error (its message is under it); the others ran.', 'Блоки выше с ошибкой: ' + bad.join(', ') + ' (сообщение — под каждым); остальные выполнены.') + '</div>');
      });
    };
    el._pyRun = run;
    el._pyAbove = function () { above.hidden = !Array.prototype.some.call(document.querySelectorAll('.markdown-section .py-page'), function (b) { return b !== el && (b.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING); }); };
    return { el: el, ta: ta, run: run, changed: changed };
  }

  /* ---------- 1. runnable examples ---------- */
  function stripCode(code) {   // strings and comments out: what is left is what Python would run
    return code.replace(/("""|''')[\s\S]*?\1/g, '""').replace(/(["'])(?:\\.|(?!\1)[^\\\n])*\1/g, '""').replace(/#.*$/gm, '');
  }
  /* a block that is not meant to run, and why */
  function shape(code) {
    // the pages mark a fragment with a first-line comment: "# (shape only — not meant to run)" (Russian: "только схема")
    if (/^\s*#.*(shape only|not meant to run|только схема|не для запуска|не предназначен)/im.test(code))
      return T('The shape of the code, not a whole program — so this one is for reading, not running.',
        'Это схема кода, а не целая программа — поэтому его нужно читать, а не выполнять.');
    if (code.split('\n').some(function (l) { return /^\s*[!%$]?\s*(pip3?|conda|jupyter|python3?|cd)\s+(?![=(.\[])\S/.test(l); }))
      return T('Commands for the terminal (Anaconda Prompt), not Python — so this one is for reading, not running.',
        'Это команды для терминала (Anaconda Prompt), а не Python — поэтому их нужно читать, а не выполнять.');
    var bare = stripCode(code);
    if (/…|\.\.\./.test(bare) || /<[A-Za-z_][\w ]*>/.test(bare)) return T('The shape of the code — the … parts are left out, so this one is for reading, not running.',
      'Это схема кода — части с … опущены, поэтому его нужно читать, а не выполнять.');
    if (/,\s*\.\w/.test(bare)) return T('A list of methods to read, not one program — try them one at a time in a box.',
      'Это список методов для чтения, а не одна программа — пробуйте их по одному в блоке.');
    return null;
  }
  function example(pre, i) {
    var code = (pre.querySelector('code') || pre).textContent.replace(/\n$/, ''), why = shape(code);
    if (why) { pre.insertAdjacentHTML('beforebegin', '<div class="sq-static">' + why + '</div>'); pre.classList.add('sq-static-code'); return; }
    var k = pageKey() + '#' + i, dk = plainKey() + '#' + i, h = hash(code), s = store(), mine = s.code[k];
    var b = box({ code: code, saved: mine && mine.h === h ? mine.c : null, label: 'PYTHON', tip: T('edit it, then Run', 'измените и нажмите «Выполнить»'), page: true,
      onSave: function (text) { var st = store(); if (text == null) delete st.code[k]; else st.code[k] = { c: text, h: h }; save(st); },
      onDone: function () { var st = store(); st.done[dk] = 1; save(st); } });
    if (s.done[dk]) b.el.classList.add('al-done');
    pre.parentNode.replaceChild(b.el, pre);
    return b.el;
  }

  /* ---------- 4. the API for task.js / challenge.js ---------- */
  function editor(container, opt) {
    opt = opt || {};
    var id = opt.id || 'ed', starter = opt.starter || '', s = store();
    var b = box({ code: starter, saved: s.ed[id] != null ? s.ed[id] : null, least: 4, placeholder: opt.placeholder || T('# write Python here, then Run', '# пишите код на Python здесь и нажмите «Выполнить»'),
      label: opt.label || 'PYTHON', tip: T('saved in this browser', 'сохраняется в этом браузере'), page: false,
      onSave: function (text) { var st = store(); if (text == null) delete st.ed[id]; else st.ed[id] = text; save(st); }, onDone: function () {} });
    container.appendChild(b.el);
    setTimeout(b.el._pyAbove, 0);
    return {
      el: b.el,
      get: function () { return b.ta.value; },
      set: function (code) { b.ta.value = code == null ? '' : String(code); b.changed(); },
      run: b.run
    };
  }
  window.ALPy = {
    ready: function () { return start(); },
    run: function (code) { return exec(String(code == null ? '' : code)); },
    editor: editor,
    restart: stop
  };

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(function () {
      var sec = document.querySelector('.markdown-section');
      if (!sec) return;
      stageText = '';
      var made = 0;
      Array.prototype.forEach.call(sec.querySelectorAll('pre[data-lang="python"], pre[data-lang="py"]'), function (pre, i) { if (example(pre, i)) made++; });
      Array.prototype.forEach.call(sec.querySelectorAll('.py-box'), function (b) { if (b._pyAbove) b._pyAbove(); });
      if (made && sec.querySelector('.py-page.al-done')) document.dispatchEvent(new CustomEvent('al:change'));
    });
  });
})();
