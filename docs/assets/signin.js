/* Sign-in on the website: the name and PIN her mentor gave her (the course bot's POST /signin) give the same key the
Telegram "Connect" step gives, kept in localStorage "al.wk" (the key sqlrun.js and feedback.js send) with her name in
"al.who". The ?wk= link from the bot still works (sqlrun.js takeKey()); GET /me then fills in the name, and a key the bot
no longer knows is dropped. Used by the hand-in box (sqlrun.js) and the feedback card (feedback.js):
  ALSignIn.key() / who()          the key and the name, or null
  ALSignIn.card(opts)             an element: Name, PIN, Sign in; opts.lead (the line above), opts.done() after success
  ALSignIn.line()                 "Signed in as … · sign out" (HTML) or ''
  ALSignIn.dropKey()              after a 401: the key is no longer valid
Every change fires the document event "al-signin", so the boxes on the page redraw. */
(function () {
  var WORKER = 'https://nur-feedback-bot.sohajon2005.workers.dev', WK = 'al.wk', WHO = 'al.who';
  function T(en, ru) { return window.ALLang ? window.ALLang.t(en, ru) : en; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function put(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* private window */ } }
  function changed() { document.dispatchEvent(new Event('al-signin')); }
  function key() { return get(WK); }
  function who() { return get(WHO); }
  function dropKey() { put(WK, null); put(WHO, null); changed(); }

  /* a key from the bot's ?wk= link has no name yet: ask once per page load; a key the bot no longer knows is dropped */
  var asked = false;
  function refresh() {
    var k = key();
    if (!k || asked) return;
    asked = true;
    fetch(WORKER + '/me?key=' + encodeURIComponent(k)).then(function (r) {
      if (r.status === 401) { dropKey(); return null; }
      return r.ok ? r.json() : null;
    }).then(function (j) { if (j && j.name && j.name !== who()) { put(WHO, j.name); changed(); } }).catch(function () { /* offline: try next time */ });
  }

  function card(opts) {
    opts = opts || {};
    var el = document.createElement('div');
    el.className = 'si-card';
    el.innerHTML = '<div class="si-h">🔑 ' + T('Sign in to send your work', 'Войдите, чтобы отправлять работы') + '</div>' +
      '<div class="si-sub">' + (opts.lead || T('Once on this device — with the name and PIN your mentor gave you. Your work stays saved here meanwhile.',
        'Один раз на этом устройстве — с именем и PIN-кодом, которые дал ментор. Ваша работа пока сохранена здесь.')) + '</div>' +
      '<form class="si-row" autocomplete="on">' +
      '<input class="si-name" name="username" autocomplete="username" placeholder="' + T('Your name', 'Ваше имя') + '" value="' + esc(who() || '') + '">' +
      '<input class="si-pin" name="password" type="password" inputmode="numeric" autocomplete="current-password" placeholder="PIN">' +
      '<button type="submit" class="qz-btn si-go">' + T('Sign in', 'Войти') + '</button></form>' +
      '<div class="si-msg" aria-live="polite"></div>';
    var form = el.querySelector('form'), msg = el.querySelector('.si-msg'), go = el.querySelector('.si-go');
    form.onsubmit = function (e) {
      e.preventDefault();
      var name = el.querySelector('.si-name').value.trim(), pin = el.querySelector('.si-pin').value.trim();
      if (!name || !pin) { msg.textContent = T('Write your name and your PIN.', 'Введите имя и PIN-код.'); return; }
      go.disabled = true; msg.textContent = T('Signing in…', 'Входим…');
      fetch(WORKER + '/signin', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: name, pin: pin }) })
        .then(function (r) { return r.json().then(function (j) { return { status: r.status, j: j }; }); })
        .then(function (x) {
          go.disabled = false;
          if (x.status === 200 && x.j.key) {
            put(WK, x.j.key); put(WHO, x.j.name || name); asked = true;
            msg.textContent = '';
            if (opts.done) opts.done();
            changed();
          } else if (x.status === 429) {
            msg.textContent = T('Too many tries — wait 10 minutes, then try again.', 'Слишком много попыток — подождите 10 минут и попробуйте снова.');
          } else {
            el.querySelector('.si-pin').value = '';
            msg.textContent = T('Wrong name or PIN — check them with your mentor.', 'Неверное имя или PIN-код — уточните у ментора.');
          }
        })
        .catch(function () { go.disabled = false; msg.textContent = T('No connection — try again in a minute.', 'Нет подключения — попробуйте через минуту.'); });
    };
    return el;
  }
  function line() {
    if (!key()) return '';
    var n = who();
    return '<div class="si-line">' + (n ? T('Signed in as ', 'Вы вошли как ') + '<b>' + esc(n) + '</b>' : T('Signed in', 'Вы вошли')) +
      ' · <button type="button" class="si-out">' + T('sign out', 'выйти') + '</button></div>';
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.si-out')) dropKey();
  });

  window.ALSignIn = { key: key, who: who, card: card, line: line, dropKey: dropKey };
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) { hook.doneEach(refresh); });
})();
