/* Mini-games for the theory parts (Docsify plugin): a ```game JSON block becomes a small interactive exercise.
Everything works by tapping (phones too). Results stay in this browser (localStorage "al.v1" → games). Types:
  match   {"type":"match","title":"…","pairs":[["term","meaning"],…]}                 tap a term, then its meaning
  order   {"type":"order","title":"…","items":["first","second",…]}                     tap the items in the right order
  sort    {"type":"sort","title":"…","groups":{"Group A":["x","y"],"Group B":["z"]}}    tap an item, then its group
  pick    {"type":"pick","title":"…","q":"…","columns":["a","b"],"rows":[[…]],"answer":["a"],"why":"…"}   tap the right column(s)
  connect {"type":"connect","title":"…","left":{"name":"loans","cols":[…]},"right":{"name":"customers","cols":[…]},
           "links":[["customer_id","customer_id"]],"why":"…"}                           tap a column on each side to join them
*/
(function () {
  var KEY = 'al.v1';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function shuffle(a, seed) {   // the same shuffle every time for one game, different between games
    var r = seed || 7, b = a.slice();
    for (var i = b.length - 1; i > 0; i--) { r = (r * 9301 + 49297) % 233280; var j = Math.floor(r / 233280 * (i + 1)); var t = b[i]; b[i] = b[j]; b[j] = t; }
    if (b.join('|') === a.join('|') && b.length > 1) b.push(b.shift());
    return b;
  }
  function seedOf(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000; return h + 1; }
  function record(id, ok) {
    try { var s = JSON.parse(localStorage.getItem(KEY)) || {}; s.games = s.games || {}; var g = s.games[id] || { tries: 0 }; g.tries++; if (ok && !g.doneOn) g.doneOn = new Date().toISOString().slice(0, 10); s.games[id] = g; localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private window */ }
  }
  function frame(box, g, body) {
    box.innerHTML = '<div class="gm-head"><span class="gm-badge">🎮 Game</span><span class="gm-title">' + esc(g.title) + '</span></div>' +
      (g.q ? '<div class="gm-q">' + esc(g.q) + '</div>' : '') + body +
      '<div class="gm-foot"><span class="gm-msg"></span><button type="button" class="gm-again">↺ Again</button></div>';
    box.querySelector('.gm-again').onclick = function () { draw(box, g); };
    return box.querySelector('.gm-msg');
  }
  function win(box, g, msg, text) {
    msg.innerHTML = '🎉 <b>' + text + '</b>' + (g.why ? ' ' + esc(g.why) : '');
    box.classList.add('gm-won'); record(g.id, true);
  }

  function match(box, g) {
    var left = g.pairs.map(function (p) { return p[0]; }), right = shuffle(g.pairs.map(function (p) { return p[1]; }), seedOf(g.id));
    var msg = frame(box, g, '<div class="gm-cols"><div class="gm-col">' + left.map(function (t, i) { return '<button type="button" class="gm-it" data-l="' + i + '">' + esc(t) + '</button>'; }).join('') +
      '</div><div class="gm-col">' + right.map(function (t, i) { return '<button type="button" class="gm-it" data-r="' + i + '">' + esc(t) + '</button>'; }).join('') + '</div></div>');
    var pick = null, done = 0, miss = 0;
    box.querySelectorAll('[data-l]').forEach(function (b) {
      b.onclick = function () { if (b.classList.contains('gm-ok')) return; box.querySelectorAll('[data-l]').forEach(function (x) { x.classList.remove('gm-sel'); }); b.classList.add('gm-sel'); pick = Number(b.dataset.l); };
    });
    box.querySelectorAll('[data-r]').forEach(function (b) {
      b.onclick = function () {
        if (pick === null || b.classList.contains('gm-ok')) { msg.textContent = 'Tap a term on the left first.'; return; }
        var l = box.querySelector('[data-l="' + pick + '"]');
        if (g.pairs[pick][1] === right[Number(b.dataset.r)]) {
          l.classList.remove('gm-sel'); l.classList.add('gm-ok'); b.classList.add('gm-ok'); pick = null; done++;
          msg.textContent = done + ' / ' + g.pairs.length;
          if (done === g.pairs.length) win(box, g, msg, miss ? 'All matched (' + miss + ' slip' + (miss > 1 ? 's' : '') + ').' : 'Perfect — all matched first time.');
        } else { miss++; b.classList.add('gm-no'); setTimeout(function () { b.classList.remove('gm-no'); }, 500); msg.textContent = 'Not that one — try again.'; }
      };
    });
  }

  function order(box, g) {
    var mixed = shuffle(g.items, seedOf(g.id));
    var msg = frame(box, g, '<ol class="gm-seq"></ol><div class="gm-pool">' + mixed.map(function (t) { return '<button type="button" class="gm-it">' + esc(t) + '</button>'; }).join('') + '</div>');
    var seq = box.querySelector('.gm-seq'), next = 0, miss = 0;
    msg.textContent = 'Tap what comes first.';
    box.querySelectorAll('.gm-pool .gm-it').forEach(function (b) {
      b.onclick = function () {
        if (b.textContent === g.items[next]) {
          seq.insertAdjacentHTML('beforeend', '<li>' + esc(b.textContent) + '</li>'); b.remove(); next++;
          if (next === g.items.length) win(box, g, msg, miss ? 'In order (' + miss + ' slip' + (miss > 1 ? 's' : '') + ').' : 'Perfect order.');
          else msg.textContent = 'Good — what comes next?';
        } else { miss++; b.classList.add('gm-no'); setTimeout(function () { b.classList.remove('gm-no'); }, 500); msg.textContent = 'Not yet — that one comes later.'; }
      };
    });
  }

  function sort(box, g) {
    var names = Object.keys(g.groups), items = [];
    names.forEach(function (n) { g.groups[n].forEach(function (t) { items.push({ t: t, g: n }); }); });
    items = shuffle(items.map(function (x) { return JSON.stringify(x); }), seedOf(g.id)).map(function (x) { return JSON.parse(x); });
    var msg = frame(box, g, '<div class="gm-pool">' + items.map(function (x, i) { return '<button type="button" class="gm-it" data-i="' + i + '">' + esc(x.t) + '</button>'; }).join('') + '</div>' +
      '<div class="gm-bins">' + names.map(function (n) { return '<div class="gm-bin" data-g="' + esc(n) + '"><div class="gm-bin-name">' + esc(n) + '</div><div class="gm-bin-in"></div></div>'; }).join('') + '</div>');
    var pick = null, left = items.length, miss = 0;
    msg.textContent = 'Tap an item, then its group.';
    box.querySelectorAll('.gm-pool .gm-it').forEach(function (b) {
      b.onclick = function () { box.querySelectorAll('.gm-pool .gm-it').forEach(function (x) { x.classList.remove('gm-sel'); }); b.classList.add('gm-sel'); pick = b; };
    });
    box.querySelectorAll('.gm-bin').forEach(function (bin) {
      bin.onclick = function () {
        if (!pick) { msg.textContent = 'Tap an item first.'; return; }
        var it = items[Number(pick.dataset.i)];
        if (it.g === bin.dataset.g) {
          bin.querySelector('.gm-bin-in').insertAdjacentHTML('beforeend', '<span class="gm-tag">' + esc(it.t) + '</span>'); pick.remove(); pick = null; left--;
          if (!left) win(box, g, msg, miss ? 'All sorted (' + miss + ' slip' + (miss > 1 ? 's' : '') + ').' : 'Perfect sort.');
          else msg.textContent = left + ' to go.';
        } else { miss++; bin.classList.add('gm-no'); setTimeout(function () { bin.classList.remove('gm-no'); }, 500); msg.textContent = 'Not that group — think again.'; }
      };
    });
  }

  function pick(box, g) {
    var msg = frame(box, g, '<div class="gm-scroll"><table class="gm-table"><thead><tr>' + g.columns.map(function (c) { return '<th><button type="button" class="gm-colbtn" data-c="' + esc(c) + '">' + esc(c) + '</button></th>'; }).join('') +
      '</tr></thead><tbody>' + g.rows.map(function (r) { return '<tr>' + r.map(function (v) { return '<td>' + esc(v) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>');
    var found = 0, miss = 0;
    msg.textContent = 'Tap a column name.';
    box.querySelectorAll('.gm-colbtn').forEach(function (b) {
      b.onclick = function () {
        if (b.classList.contains('gm-ok')) return;
        if (g.answer.indexOf(b.dataset.c) >= 0) {
          b.classList.add('gm-ok'); found++;
          if (found === g.answer.length) win(box, g, msg, miss ? 'Found it.' : 'Spot on.');
          else msg.textContent = 'Yes — there is one more.';
        } else { miss++; b.classList.add('gm-no'); setTimeout(function () { b.classList.remove('gm-no'); }, 500); msg.textContent = (g.hint || 'Not that one.'); }
      };
    });
  }

  function connect(box, g) {
    function side(t, s) { return '<div class="gm-tb" data-s="' + s + '"><div class="gm-tb-name">' + esc(t.name) + '</div>' + t.cols.map(function (c) { return '<button type="button" class="gm-it gm-c" data-s="' + s + '" data-c="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div>'; }
    var msg = frame(box, g, '<div class="gm-join">' + side(g.left, 'l') + '<svg class="gm-lines"></svg>' + side(g.right, 'r') + '</div>');
    var a = null, made = 0, miss = 0, svg = box.querySelector('.gm-lines');
    msg.textContent = 'Tap a column in ' + g.left.name + ', then the column it joins in ' + g.right.name + '.';
    function line(x, y) {
      var r = box.querySelector('.gm-join').getBoundingClientRect(), p = x.getBoundingClientRect(), q = y.getBoundingClientRect();
      svg.setAttribute('width', r.width); svg.setAttribute('height', r.height);
      var el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      el.setAttribute('x1', p.right - r.left); el.setAttribute('y1', p.top + p.height / 2 - r.top);
      el.setAttribute('x2', q.left - r.left); el.setAttribute('y2', q.top + q.height / 2 - r.top);
      svg.appendChild(el);
    }
    box.querySelectorAll('.gm-c').forEach(function (b) {
      b.onclick = function () {
        if (b.classList.contains('gm-ok')) return;
        if (b.dataset.s === 'l') { box.querySelectorAll('.gm-c[data-s="l"]').forEach(function (x) { x.classList.remove('gm-sel'); }); b.classList.add('gm-sel'); a = b; return; }
        if (!a) { msg.textContent = 'Start on the ' + g.left.name + ' side.'; return; }
        var ok = g.links.some(function (l) { return l[0] === a.dataset.c && l[1] === b.dataset.c; });
        if (ok) {
          a.classList.remove('gm-sel'); a.classList.add('gm-ok'); b.classList.add('gm-ok'); line(a, b); a = null; made++;
          if (made === g.links.length) win(box, g, msg, miss ? 'Joined.' : 'Joined first time.');
          else msg.textContent = 'Good — ' + (g.links.length - made) + ' more.';
        } else { miss++; b.classList.add('gm-no'); setTimeout(function () { b.classList.remove('gm-no'); }, 500); msg.textContent = 'Those do not hold the same thing — try again.'; }
      };
    });
  }

  var TYPES = { match: match, order: order, sort: sort, pick: pick, connect: connect };
  function draw(box, g) { box.classList.remove('gm-won'); (TYPES[g.type] || function () { box.textContent = 'Unknown game type ' + g.type; })(box, g); }
  function mount(pre) {
    var g;
    try { g = JSON.parse((pre.querySelector('code') || pre).textContent); } catch (e) { pre.insertAdjacentHTML('beforebegin', '<p class="quiz-error">This game could not be read (' + esc(e.message) + ').</p>'); return; }
    g.id = g.id || (location.hash + ':' + g.title);
    var box = document.createElement('div');
    box.className = 'gm gm-' + g.type;
    pre.parentNode.replaceChild(box, pre);
    draw(box, g);
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(function () { Array.prototype.forEach.call(document.querySelectorAll('.markdown-section pre[data-lang="game"]'), mount); });
  });
})();
