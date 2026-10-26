/* Mini-games for the theory parts (Docsify plugin): a ```game JSON block becomes a small interactive exercise.
Everything works by tapping (phones too). Each game shows a score and a progress bar, shakes on a wrong tap, and ends
with 1–3 stars (no slips = 3, one or two = 2, more = 1); the best stars stay in this browser (localStorage "al.v1" →
games). Types:
  match   {"type":"match","title":"…","pairs":[["term","meaning"],…]}                 tap a term and its meaning (either side first)
  order   {"type":"order","title":"…","items":["first","second",…]}                     tap the items in the right order
  sort    {"type":"sort","title":"…","groups":{"Group A":["x","y"],"Group B":["z"]}}    tap an item, then its group
  pick    {"type":"pick","title":"…","q":"…","columns":["a","b"],"rows":[[…]],"answer":["a"],"why":"…"}   tap the right column(s)
  connect {"type":"connect","title":"…","left":{"name":"loans","cols":[…]},"right":{"name":"customers","cols":[…]},
           "links":[["customer_id","customer_id"]],"why":"…"}                           tap a column on each side to join them
*/
(function () {
  var KEY = 'al.v1';
  var ICON = { match: '⇄', order: '1·2·3', sort: '▦', pick: '◎', connect: '⟷' };
  /* words in the page's language (lang.js), looked up while a game is drawn */
  function T(en, ru) { return window.ALLang ? window.ALLang.t(en, ru) : en; }
  function plural(n, one, few, many) {
    var a = Math.abs(n) % 100, b = a % 10;
    return a > 10 && a < 20 ? many : b === 1 ? one : b > 1 && b < 5 ? few : many;
  }
  var HOW = {
    match: ['Tap a word, then its meaning (or the other way round).', 'Нажмите на слово, затем на его значение (или наоборот).'],
    order: ['Tap the steps in the order they happen.', 'Нажимайте на шаги в том порядке, в котором они происходят.'],
    sort: ['Tap an item, then the group it belongs to.', 'Нажмите на элемент, затем на группу, к которой он относится.'],
    pick: ['Tap the right column name in the table.', 'Нажмите на нужное название столбца в таблице.'],
    connect: ['Tap a column on the left, then the column it joins on the right.', 'Нажмите на столбец слева, затем на столбец справа, с которым он соединяется.']
  };
  var GOOD = [['Yes!', 'Да!'], ['Right.', 'Верно.'], ['Correct.', 'Правильно.'], ['Nice.', 'Отлично.'], ['Exactly.', 'Точно.']];
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function shuffle(a, seed) {   // the same shuffle every time for one game, different between games
    var r = seed || 7, b = a.slice();
    for (var i = b.length - 1; i > 0; i--) { r = (r * 9301 + 49297) % 233280; var j = Math.floor(r / 233280 * (i + 1)); var t = b[i]; b[i] = b[j]; b[j] = t; }
    if (b.join('|') === a.join('|') && b.length > 1) b.push(b.shift());
    return b;
  }
  function seedOf(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000; return h + 1; }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function best(id) { return (load().games || {})[id] || null; }
  function record(id, stars) {
    try {
      var s = load(); s.games = s.games || {};
      var g = s.games[id] || { tries: 0 };
      g.tries++;
      if (stars) { g.doneOn = g.doneOn || new Date().toISOString().slice(0, 10); g.stars = Math.max(g.stars || 0, stars); }
      s.games[id] = g; localStorage.setItem(KEY, JSON.stringify(s));
    } catch (e) { /* private window */ }
  }
  function starHtml(n) { var h = ''; for (var i = 1; i <= 3; i++) h += '<span class="' + (i <= n ? 'on' : '') + '">★</span>'; return h; }

  /* the frame every game shares: header with score, progress bar, instruction, body, status line */
  function frame(box, g, total, body) {
    var b = best(g.id);
    box.innerHTML = '<div class="gx-head"><span class="gx-icon">' + ICON[g.type] + '</span>' +
      '<div class="gx-hd"><div class="gx-kicker">' + T('Game', 'Игра') + (b && b.stars ? T(' · best ', ' · лучший результат ') + '<span class="gx-stars sm">' + starHtml(b.stars) + '</span>' : '') + '</div>' +
      '<div class="gx-title">' + esc(g.title) + '</div></div><div class="gx-score"><b>0</b>/' + total + '</div></div>' +
      '<div class="gx-bar"><span></span></div>' +
      (g.q ? '<div class="gx-q">' + esc(g.q) + '</div>' : '') + '<div class="gx-how">' + T(HOW[g.type][0], HOW[g.type][1]) + '</div>' +
      '<div class="gx-body">' + body + '</div>' +
      '<div class="gx-foot"><span class="gx-msg" aria-live="polite"></span><button type="button" class="gx-again">' + T('↺ Restart', '↺ Заново') + '</button></div>';
    box.querySelector('.gx-again').onclick = function () { draw(box, g); };
    var msg = box.querySelector('.gx-msg'), n = 0, slips = 0;
    var ui = {
      say: function (text, kind) { msg.textContent = text; msg.className = 'gx-msg' + (kind ? ' ' + kind : ''); },
      step: function () {
        n++;
        box.querySelector('.gx-score b').textContent = n;
        box.querySelector('.gx-bar span').style.width = Math.round(100 * n / total) + '%';
        if (n === total) ui.win(); else ui.say(ui.good(), 'good');
      },
      good: function () { var w = GOOD[n % 5]; return T(w[0] + ' ' + (total - n) + ' to go.', w[1] + ' Осталось: ' + (total - n) + '.'); },
      slip: function (els, text) {
        slips++;
        els.forEach(function (el) {
          if (!el) return;
          el.classList.remove('gx-no'); void el.offsetWidth; el.classList.add('gx-no');
          setTimeout(function () { el.classList.remove('gx-no'); }, 450);
        });
        ui.say(text, 'bad');
      },
      win: function () {
        var stars = slips === 0 ? 3 : slips <= 2 ? 2 : 1;
        record(g.id, stars);
        box.classList.add('gx-won');
        var w = document.createElement('div');
        w.className = 'gx-win';
        w.innerHTML = '<div class="gx-stars">' + starHtml(stars) + '</div>' +
          '<div class="gx-win-t">' + (stars === 3 ? T('Perfect!', 'Идеально!') : stars === 2 ? T('Well done!', 'Отличная работа!') : T('Done!', 'Готово!')) + '</div>' +
          '<div class="gx-win-s">' + (slips ? T(slips + ' slip' + (slips > 1 ? 's' : '') + ' — play again for 3 stars.',
            slips + ' ' + plural(slips, 'ошибка', 'ошибки', 'ошибок') + ' — сыграйте ещё раз, чтобы получить 3 звезды.') : T('No slips at all.', 'Ни одной ошибки.')) + '</div>' +
          (g.why ? '<div class="gx-why">' + esc(g.why) + '</div>' : '') +
          '<button type="button" class="gx-btn">' + T('Play again', 'Сыграть ещё раз') + '</button>';
        box.querySelector('.gx-foot').before(w);
        w.querySelector('.gx-btn').onclick = function () { draw(box, g); };
        ui.say('', '');
      }
    };
    ui.say('');
    return ui;
  }

  function match(box, g) {
    var left = shuffle(g.pairs.map(function (p, i) { return i; }), seedOf(g.id + 'l'));
    var right = shuffle(g.pairs.map(function (p, i) { return i; }), seedOf(g.id));
    var ui = frame(box, g, g.pairs.length, '<div class="gx-match"><div class="gx-col">' +
      left.map(function (i) { return '<button type="button" class="gx-it gx-term" data-i="' + i + '">' + esc(g.pairs[i][0]) + '</button>'; }).join('') +
      '</div><div class="gx-col">' + right.map(function (i) { return '<button type="button" class="gx-it gx-mean" data-i="' + i + '">' + esc(g.pairs[i][1]) + '</button>'; }).join('') + '</div></div>');
    var sel = { term: null, mean: null }, made = 0;
    box.querySelectorAll('.gx-it').forEach(function (b) {
      b.onclick = function () {
        if (b.classList.contains('gx-done')) return;
        var side = b.classList.contains('gx-term') ? 'term' : 'mean';
        if (sel[side]) sel[side].classList.remove('gx-sel');
        sel[side] = sel[side] === b ? null : b;
        if (sel[side]) b.classList.add('gx-sel');
        if (!sel.term || !sel.mean) return;
        var a = sel.term, c = sel.mean;
        a.classList.remove('gx-sel'); c.classList.remove('gx-sel'); sel = { term: null, mean: null };
        if (a.dataset.i === c.dataset.i) {
          var k = made++ % 6;
          [a, c].forEach(function (x) { x.classList.add('gx-done', 'gx-p' + k); x.insertAdjacentHTML('afterbegin', '<i class="gx-num">' + made + '</i>'); });
          ui.step();
        } else ui.slip([a, c], T('Not a pair — try again.', 'Это не пара — попробуйте ещё.'));
      };
    });
  }

  function order(box, g) {
    var mixed = shuffle(g.items, seedOf(g.id));
    var ui = frame(box, g, g.items.length, '<ol class="gx-slots">' + g.items.map(function () { return '<li></li>'; }).join('') + '</ol>' +
      '<div class="gx-pool">' + mixed.map(function (t) { return '<button type="button" class="gx-it">' + esc(t) + '</button>'; }).join('') + '</div>');
    var slots = box.querySelectorAll('.gx-slots li'), next = 0;
    slots[0].classList.add('gx-next');
    box.querySelectorAll('.gx-pool .gx-it').forEach(function (b) {
      b.onclick = function () {
        if (b.textContent === g.items[next]) {
          slots[next].textContent = b.textContent; slots[next].classList.remove('gx-next'); slots[next].classList.add('gx-filled');
          b.remove(); next++;
          if (slots[next]) slots[next].classList.add('gx-next');
          ui.step();
        } else ui.slip([b], T('Not yet — that one comes later.', 'Пока нет — этот шаг идёт позже.'));
      };
    });
  }

  function sort(box, g) {
    var names = Object.keys(g.groups), items = [];
    names.forEach(function (n) { g.groups[n].forEach(function (t) { items.push({ t: t, g: n }); }); });
    items = shuffle(items.map(function (x) { return JSON.stringify(x); }), seedOf(g.id)).map(function (x) { return JSON.parse(x); });
    var ui = frame(box, g, items.length, '<div class="gx-pool">' + items.map(function (x, i) { return '<button type="button" class="gx-it" data-i="' + i + '">' + esc(x.t) + '</button>'; }).join('') + '</div>' +
      '<div class="gx-bins">' + names.map(function (n) {
        return '<button type="button" class="gx-bin" data-g="' + esc(n) + '"><span class="gx-bin-name">' + esc(n) + '</span><span class="gx-bin-in"></span></button>';
      }).join('') + '</div>');
    var pick = null;
    box.querySelectorAll('.gx-pool .gx-it').forEach(function (b) {
      b.onclick = function () {
        if (pick) pick.classList.remove('gx-sel');
        pick = pick === b ? null : b;
        if (pick) { b.classList.add('gx-sel'); box.classList.add('gx-holding'); } else box.classList.remove('gx-holding');
      };
    });
    box.querySelectorAll('.gx-bin').forEach(function (bin) {
      bin.onclick = function () {
        if (!pick) { ui.say(T('Tap an item first, then its group.', 'Сначала нажмите на элемент, потом на его группу.'), 'bad'); return; }
        var it = items[Number(pick.dataset.i)];
        if (it.g === bin.dataset.g) {
          bin.querySelector('.gx-bin-in').insertAdjacentHTML('beforeend', '<span class="gx-tag">' + esc(it.t) + '</span>');
          pick.remove(); pick = null; box.classList.remove('gx-holding');
          ui.step();
        } else ui.slip([bin, pick], T('Not that group — think again.', 'Не та группа — подумайте ещё.'));
      };
    });
  }

  function pick(box, g) {
    var ui = frame(box, g, g.answer.length, '<div class="gx-scroll"><table class="gx-table"><thead><tr>' +
      g.columns.map(function (c) { return '<th><button type="button" class="gx-colbtn" data-c="' + esc(c) + '">' + esc(c) + '</button></th>'; }).join('') +
      '</tr></thead><tbody>' + g.rows.map(function (r) { return '<tr>' + r.map(function (v) { return '<td>' + esc(v) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody></table></div>');
    box.querySelectorAll('.gx-colbtn').forEach(function (b) {
      b.onclick = function () {
        if (b.classList.contains('gx-done')) return;
        if (g.answer.indexOf(b.dataset.c) >= 0) {
          b.classList.add('gx-done');
          box.querySelectorAll('.gx-table tr').forEach(function (tr) { var cell = tr.children[g.columns.indexOf(b.dataset.c)]; if (cell) cell.classList.add('gx-col-ok'); });
          ui.step();
        } else ui.slip([b], g.hint || T('Not that one — look for a value that is different in every row.', 'Не этот — ищите значение, которое в каждой строке своё.'));
      };
    });
  }

  function connect(box, g) {
    function side(t, s) {
      return '<div class="gx-tb" data-s="' + s + '"><div class="gx-tb-name">' + esc(t.name) + '</div>' + t.cols.map(function (c) {
        var dot = c.indexOf('.'), label = dot > 0 ? '<small>' + esc(c.slice(0, dot)) + '.</small>' + esc(c.slice(dot + 1)) : esc(c);
        return '<button type="button" class="gx-it gx-c" data-s="' + s + '" data-c="' + esc(c) + '">' + label + '</button>';
      }).join('') + '</div>';
    }
    var ui = frame(box, g, g.links.length, '<div class="gx-join">' + side(g.left, 'l') + '<div class="gx-gap"></div>' + side(g.right, 'r') +
      '<svg class="gx-lines" aria-hidden="true"></svg></div>');
    var a = null, pairs = [], wrap = box.querySelector('.gx-join'), svg = box.querySelector('.gx-lines');
    function drawLines() {
      var r = wrap.getBoundingClientRect();
      svg.setAttribute('width', r.width); svg.setAttribute('height', r.height);
      svg.innerHTML = pairs.map(function (p, k) {
        var x = p[0].getBoundingClientRect(), y = p[1].getBoundingClientRect();
        var x1 = x.right - r.left, y1 = x.top + x.height / 2 - r.top, x2 = y.left - r.left, y2 = y.top + y.height / 2 - r.top, m = (x1 + x2) / 2;
        return '<path class="gx-p' + (k % 6) + '" d="M' + x1 + ' ' + y1 + ' C' + m + ' ' + y1 + ' ' + m + ' ' + y2 + ' ' + x2 + ' ' + y2 + '"/>' +
          '<circle class="gx-p' + (k % 6) + '" cx="' + x1 + '" cy="' + y1 + '" r="4"/><circle class="gx-p' + (k % 6) + '" cx="' + x2 + '" cy="' + y2 + '" r="4"/>';
      }).join('');
    }
    window.addEventListener('resize', function () { if (document.body.contains(wrap)) drawLines(); });
    box.querySelectorAll('.gx-c').forEach(function (b) {
      b.onclick = function () {
        if (b.classList.contains('gx-done')) return;
        if (b.dataset.s === 'l') { if (a) a.classList.remove('gx-sel'); a = a === b ? null : b; if (a) b.classList.add('gx-sel'); return; }
        if (!a) { ui.say(T('Start with a column in ' + g.left.name + ' (left).', 'Начните со столбца в ' + g.left.name + ' (слева).'), 'bad'); return; }
        var ok = g.links.some(function (l) { return l[0] === a.dataset.c && l[1] === b.dataset.c; });
        if (ok) {
          var k = pairs.length % 6;
          a.classList.remove('gx-sel'); [a, b].forEach(function (x) { x.classList.add('gx-done', 'gx-p' + k); });
          pairs.push([a, b]); a = null; drawLines(); ui.step();
        } else { ui.slip([a, b], T('Those do not hold the same thing — try again.', 'В этих столбцах хранится разное — попробуйте ещё.')); a.classList.remove('gx-sel'); a = null; }
      };
    });
  }

  var TYPES = { match: match, order: order, sort: sort, pick: pick, connect: connect };
  function draw(box, g) { box.classList.remove('gx-won', 'gx-holding'); (TYPES[g.type] || function () { box.textContent = T('Unknown game type ', 'Неизвестный тип игры ') + g.type; })(box, g); }
  function mount(pre) {
    var g;
    try { g = JSON.parse((pre.querySelector('code') || pre).textContent); }
    catch (e) { pre.insertAdjacentHTML('beforebegin', '<p class="quiz-error">' + T('This game could not be read', 'Не удалось прочитать игру') + ' (' + esc(e.message) + ').</p>'); return; }
    g.id = g.id || (location.hash.replace(/^#\/ru(\/|$)/, '#/') + ':' + g.title);   // the same page in both languages (games normally carry their own id)
    var box = document.createElement('div');
    box.className = 'gx gx-type-' + g.type;
    pre.parentNode.replaceChild(box, pre);
    draw(box, g);
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(function () { Array.prototype.forEach.call(document.querySelectorAll('.markdown-section pre[data-lang="game"]'), mount); });
  });
})();
