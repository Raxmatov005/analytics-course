/* Sign-in on the website: the name and PIN her mentor gave her (the course bot's POST /signin) give the same key the
Telegram "Connect" step gives, kept in localStorage "al.wk" (the key sqlrun.js and feedback.js send) with her name in
"al.who". The ?wk= link from the bot still works (sqlrun.js takeKey()); GET /me then fills in the name, and a key the bot
no longer knows is dropped. Used by the hand-in box (sqlrun.js) and the feedback card (feedback.js):
  ALSignIn.key() / who()          the key and the name, or null
  ALSignIn.card(opts)             an element: Name, PIN, Sign in; opts.lead (the line above), opts.done() after success
  ALSignIn.line()                 "Signed in as … · sign out" (HTML) or ''
  ALSignIn.dropKey()              after a 401: the key is no longer valid
  ALSignIn.mentor()               true when the mentor signed in here (his name + PIN from /mentor): every lesson is
                                  shown (schedule.js preview) and the hand-in boxes show a note instead of a form
A browser that has no key opens on a full-screen sign-in (the "door", below); after sign-in it never asks again there.
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
  function mentor() { return get('al.mentor') === '1' && get('al.preview') === '1'; }

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
    if (mentor()) {   // the mentor reads everything here; her boxes take nothing from him
      var note = document.createElement('div');
      note.className = 'si-card si-mentor';
      note.innerHTML = '<div class="si-sub">' + T('Mentor view: hand-in and feedback boxes are for the learner — nothing typed here is sent.',
        'Режим ментора: поля сдачи и отзыва — для ученицы, отсюда ничего не отправляется.') + '</div>';
      return note;
    }
    var el = document.createElement('div');
    el.className = 'si-card';
    el.innerHTML = '<div class="si-h">' + (opts.title || '🔑 ' + T('Sign in to send your work', 'Войдите, чтобы отправлять работы')) + '</div>' +
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
          if (x.status === 200 && x.j.mentor) {   // the mentor: every lesson, in this browser, until "Sign out"
            put('al.mentor', '1'); put('al.preview', '1'); put(WHO, x.j.name || name);
            location.reload();
          } else if (x.status === 200 && x.j.key) {
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
        .catch(function () {
          go.disabled = false; msg.textContent = T('No connection — try again in a minute.', 'Нет подключения — попробуйте через минуту.');
          if (opts.fail) opts.fail();
        });
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

  /* ---------- the door (the founder, 2026-10-28): a browser that does not know her yet opens on a sign-in screen; once
     signed in it remembers her and never asks again, until "sign out". A link from the bot (?wk=, taken by sqlrun.js
     before this runs) has signed her in already, and the mentor's ?preview=1 (schedule.js) skips the door. With no
     connection to the bot the door offers to go on without signing in, so a dead line never locks her out of reading. ---------- */
  var door = null, away = false;
  function preview() { return get('al.preview') === '1' || /[?&]preview=1/.test(location.hash); }
  function drawDoor() {
    if (key() || preview() || away) { if (door) { door.remove(); door = null; document.documentElement.classList.remove('si-door-on'); } return; }
    if (!door) { door = document.createElement('div'); door.className = 'si-door'; door.setAttribute('role', 'dialog'); door.setAttribute('aria-modal', 'true'); document.body.appendChild(door); }
    document.documentElement.classList.add('si-door-on');
    door.innerHTML = '<div class="si-door-box"><div class="si-door-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg></div>' +
      '<div class="si-door-t">' + T('Welcome to Analytics Learning', 'Добро пожаловать в Analytics Learning') + '</div>' +
      '<div class="si-door-s">' + T('Sign in once on this device with the name and PIN your mentor gave you. Next time the course will know it is you.',
        'Войдите один раз на этом устройстве с именем и PIN-кодом от ментора. В следующий раз курс сам узнает вас.') + '</div>' +
      '<div class="si-door-slot"></div><div class="si-door-away" hidden><button type="button">' +
      T('No connection: continue without signing in', 'Нет связи: продолжить без входа') + '</button></div></div>';
    door.querySelector('.si-door-slot').appendChild(card({ title: T('Sign in', 'Вход'), lead: ' ',
      fail: function () { door.querySelector('.si-door-away').hidden = false; } }));
    door.querySelector('.si-door-away button').onclick = function () { away = true; drawDoor(); };
    var nm = door.querySelector('.si-name');
    if (nm && !nm.value) nm.focus();
  }
  document.addEventListener('al-signin', drawDoor);
  window.addEventListener('hashchange', function () { if (door) drawDoor(); });   // the EN | RU switch redraws it in the other language

  window.ALSignIn = { key: key, who: who, card: card, line: line, dropKey: dropKey, mentor: mentor };
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(refresh);
    hook.ready(drawDoor);
  });
})();
