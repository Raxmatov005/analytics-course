/* "Ask AI" on every section (Docsify plugin; the founder, 2026-11-02: an assistant that has the course and explains what
is not clear, on HER ChatGPT subscription and HIS Claude one). A website cannot spend a ChatGPT or Claude plan itself:
OpenAI's "Sign in with ChatGPT" plan usage is open to apps running on her own computer (Codex, local tools), and a hosted
site needs OpenAI's approval; keeping her ChatGPT sign-in in a web page is against its rules. So the button brings the
course to her chat instead: it opens chatgpt.com in a new tab with the tutor rules, the page, the section's text and her
question already written (?q=), and puts the same text on the clipboard in case the link is cut (a long section, the
phone app). The mentor (preview mode, schedule.js) also gets "Ask Claude" (claude.ai/new?q=). Answers, model answers,
her hand-in boxes and quiz widgets are left out of what is sent, and the rules ask for the method, never the finished
answer of a homework, checkpoint or exam. Nothing is sent anywhere by this page: the chat opens in her own account. */
(function () {
  function T(en, ru) { return window.ALLang ? window.ALLang.t(en, ru) : en; }
  function ru() { return !!(window.ALLang && window.ALLang.isRu()); }
  function mentor() { try { return localStorage.getItem('al.preview') === '1'; } catch (e) { return false; } }
  var ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" ' +
    'stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4v.3"/><path d="M12 16.5h.01"/></svg>';
  var ANSWER = /answer|model|solution|ответ|образец|решени/i;

  /* the section as text: what she sees on the page (innerText leaves hidden answers out), without answer folds, her
     hand-in boxes, the quiz, check, game, challenge and explorer widgets */
  var SKIP = '.sq-ws, .qz, .qc, .gx, .chal, .xp, .fb-card, .al-ask-pop';
  /* the code boxes' toolbar words, line by line */
  var UI = /^(▶ ?(Run|Выполнить)|✔ ?(Check|Проверить)|Database|База данных|↺ ?(Start over|Начать заново)|Copy|Копировать|Copied|Clear|Очистить|Reset|Сбросить|(SQL|PYTHON|Python) · .*)$/;
  function sectionText(sec) {
    var body = sec.querySelector('.al-sec-body') || sec;
    return Array.prototype.map.call(body.children, function (el) {
      if (el.matches(SKIP)) return '';
      if (el.tagName === 'DETAILS') { var s = el.querySelector('summary'); if (!s || ANSWER.test(s.textContent)) return ''; }
      return el.innerText || '';
    }).join('\n').split('\n').filter(function (l) { return !UI.test(l.trim()); }).join('\n')
      .replace(/[ \t ]+/g, ' ').replace(/\n\s*\n\s*\n+/g, '\n\n').trim();
  }
  function headingOf(sec) {
    var h = sec.querySelector('h2');
    return h ? h.textContent.replace(/\s+/g, ' ').trim() : '';
  }
  function pageTitle() {
    var h = document.querySelector('.markdown-section h1');
    return h ? h.textContent.replace(/\s+/g, ' ').trim() : document.title;
  }
  function prompt(sec, question, max) {
    var text = sectionText(sec);
    if (text.length > max) text = text.slice(0, max) + '\n[…]';
    var q = question || T('Explain this section to me more simply.', 'Объясни мне этот раздел проще.');
    return ru() ?
      'Ты мой терпеливый репетитор на курсе для начинающего аналитика данных (SQL/SQLite, Excel, Python/pandas, статистика, кредитный риск в микрофинансовой компании в Узбекистане).\n' +
      'Правила: объясняй просто и по шагам, с маленьким примером из жизни и, если полезно, с крошечной таблицей; используй термины курса. ' +
      'Если это домашнее задание, контрольная точка или экзамен — НЕ давай готовый ответ и итоговые числа: дай подсказку, метод и похожий пример. ' +
      'В конце задай мне один короткий вопрос, чтобы проверить, что я понял(а).\n\n' +
      'Страница курса: ' + pageTitle() + ' — ' + location.href + '\nРаздел: ' + headingOf(sec) + '\n--- текст раздела ---\n' + text + '\n--- конец ---\n\nМой вопрос: ' + q
      :
      'You are my patient tutor for a beginner data-analyst course (SQL/SQLite, Excel, Python/pandas, statistics, credit risk at a microfinance company in Uzbekistan). English is my second language.\n' +
      'Rules: explain simply and step by step, with a small everyday example and, when it helps, a tiny table; use the course\'s own terms. ' +
      'If this is a homework, checkpoint or exam task, do NOT give me the finished answer or the final numbers: give a hint, the method and a similar example instead. ' +
      'End with one short question to check I understood.\n\n' +
      'Course page: ' + pageTitle() + ' — ' + location.href + '\nSection: ' + headingOf(sec) + '\n--- section text ---\n' + text + '\n--- end ---\n\nMy question: ' + q;
  }
  function copy(text) {
    try { if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return false; }); } catch (e) { /* below */ }
    return Promise.resolve(false);
  }
  /* a link a browser and the chat's server both take: shorten the section until the address is under ~7 000 characters */
  function link(base, sec, question) {
    var max = 6000, url;
    do { url = base + encodeURIComponent(prompt(sec, question, max)); max = Math.floor(max * 0.7); } while (url.length > 7000 && max > 300);
    return url;
  }

  function open(sec, which, question, note) {
    var full = prompt(sec, question, 20000);
    var url = link(which === 'claude' ? 'https://claude.ai/new?q=' : 'https://chatgpt.com/?q=', sec, question);
    window.open(url, '_blank', 'noopener');
    copy(full).then(function (ok) {
      note.textContent = ok ? T('Opened in a new tab. The full text is also copied: if the message is not there, paste it (Ctrl+V, or long-press → Paste on a phone).',
        'Открыто в новой вкладке. Полный текст тоже скопирован: если сообщения там нет, вставьте его (Ctrl+V, на телефоне — долгое нажатие → «Вставить»).')
        : T('Opened in a new tab with the section and your question.', 'Открыто в новой вкладке — с разделом и вашим вопросом.');
    });
  }

  function popover(sec, btn) {
    var old = sec.querySelector('.al-ask-pop');
    if (old) { old.remove(); btn.setAttribute('aria-expanded', 'false'); return; }
    var p = document.createElement('div');
    p.className = 'al-ask-pop';
    p.innerHTML = '<label class="al-ask-l">' + T('What is not clear? (optional)', 'Что непонятно? (необязательно)') + '</label>' +
      '<textarea rows="2" placeholder="' + T('e.g. why do we divide by n − 1 here?', 'например: почему здесь делим на n − 1?') + '"></textarea>' +
      '<div class="al-ask-row"><button type="button" class="al-ask-go" data-w="chatgpt">' + T('Ask ChatGPT', 'Спросить ChatGPT') + '</button>' +
      (mentor() ? '<button type="button" class="al-ask-go al-ask-claude" data-w="claude">' + T('Ask Claude', 'Спросить Claude') + '</button>' : '') +
      '<a class="al-ask-how" href="' + (window.ALLang ? window.ALLang.link('#/ai-helper') : '#/ai-helper') + '">' + T('How it works', 'Как это работает') + '</a></div>' +
      '<div class="al-ask-note" aria-live="polite">' + T('It opens your own ChatGPT with this section and your question. It explains and gives hints; it will not do your homework for you.',
        'Откроется ваш ChatGPT с этим разделом и вашим вопросом. Он объясняет и подсказывает, но не делает домашнее задание за вас.') + '</div>';
    var head = sec.querySelector('.al-sec-head');
    (head && head.nextSibling ? head.parentNode.insertBefore(p, head.nextSibling) : sec.insertBefore(p, sec.firstChild));
    btn.setAttribute('aria-expanded', 'true');
    var ta = p.querySelector('textarea'), note = p.querySelector('.al-ask-note');
    Array.prototype.forEach.call(p.querySelectorAll('.al-ask-go'), function (b) {
      b.onclick = function () { open(sec, b.getAttribute('data-w'), ta.value.trim(), note); };
    });
    ta.focus();
  }

  function add() {
    if (!/weeks\/week-|company\/|tools-at-work/.test(location.hash)) return;   // lessons and the reading pages, not the home or progress page
    Array.prototype.forEach.call(document.querySelectorAll('.markdown-section section.al-sec'), function (sec) {
      var head = sec.querySelector('.al-sec-head');
      if (!head || head.querySelector('.al-ask')) return;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'al-ask'; b.setAttribute('aria-expanded', 'false');
      b.title = T('Ask AI about this section', 'Спросить ИИ об этом разделе');
      b.innerHTML = ICON + '<span>' + T('Ask AI', 'Спросить ИИ') + '</span>';
      b.onclick = function (e) { e.preventDefault(); e.stopPropagation(); popover(sec, b); };
      var state = head.querySelector('.al-sec-state');
      head.insertBefore(b, state || null);
    });
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(function () { setTimeout(add, 0); setTimeout(add, 400); });   // after sections.js has drawn its frames
  });
})();
