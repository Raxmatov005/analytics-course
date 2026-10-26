/* Course files to download (Docsify plugin): every `file name` on a page that is one of the course files in her public
repository (assets/files.json: data/**, requirements.txt; bot/make_files_manifest.py writes it) gets a ⬇ button that
saves the file on her device; a `data/...` folder gets a link to the folder on GitHub. A bare name (`day1_starter.ipynb`)
counts when it is unique; `../raw/nur.db` counts as data/raw/nur.db. */
(function () {
  var RAW = 'https://raw.githubusercontent.com/Raxmatov005/analytics-course/main/';
  var TREE = 'https://github.com/Raxmatov005/analytics-course/tree/main/';
  var list = null;
  function T(en, ru) { return window.ALLang ? window.ALLang.t(en, ru) : en; }
  function load() {
    if (!list) list = fetch('assets/files.json?v=1').then(function (r) { return r.json(); }).catch(function () { return []; });
    return list;
  }
  function find(files, text) {
    var t = text.replace(/^(\.\.\/)+|^\.\//g, '');
    if (files.indexOf(t) >= 0) return t;
    var base = t.split('/').pop(), hits = files.filter(function (f) { return f.split('/').pop() === base; });
    if (hits.length === 1 && (t === base || hits[0].slice(-t.length) === t || /^(raw|excel|python|powerbi|ab|sql)\//.test(t))) return hits[0];
    return null;
  }
  function folder(files, text) {
    var t = text.replace(/^(\.\.\/)+/, '').replace(/\/$/, '');
    return /^data(\/|$)/.test(t) && files.some(function (f) { return f.indexOf(t + '/') === 0; }) ? t : null;
  }
  function save(path, btn) {
    var name = path.split('/').pop();
    btn.textContent = T('Downloading…', 'Скачивание…');
    fetch(RAW + path).then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); }).then(function (b) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = name;
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
      btn.textContent = '✓ ' + name;
    }).catch(function () { window.open(RAW + path, '_blank'); btn.textContent = T('⬇ Download', '⬇ Скачать'); });
  }
  function mark(files) {
    var sec = document.querySelector('.markdown-section');
    if (!sec) return;
    Array.prototype.forEach.call(sec.querySelectorAll('code'), function (code) {
      if (code.closest('pre, .sq-box, .sq-ws, .qz, .gx, .db-t, .fl-done') || code.dataset.fl) return;
      code.dataset.fl = '1';
      var text = code.textContent.trim(), path = find(files, text), dir = path ? null : folder(files, text);
      if (!path && !dir) return;
      var b = document.createElement(path ? 'button' : 'a');
      b.className = 'fl-dl';
      if (path) {
        b.type = 'button'; b.textContent = T('⬇ Download', '⬇ Скачать');
        b.title = T('Save ' + path.split('/').pop() + ' on this device', 'Сохранить ' + path.split('/').pop() + ' на это устройство');
        b.onclick = function () { save(path, b); };
      } else {
        b.href = TREE + dir; b.target = '_blank'; b.rel = 'noopener'; b.textContent = T('📁 Open folder', '📁 Открыть папку');
      }
      code.insertAdjacentElement('afterend', b);
    });
  }
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(function () { load().then(mark); });
  });
})();
