/* Daily challenges (Docsify plugin). One per day page, at the very end, written as a fenced block "challenge":

  {"id": "w02d3", "q": "...", "code": "optional", "type": "number" | "text", "dp": 0,
   "h": ["sha-256 fingerprints of the accepted answers"], "hint": "...", "sol": "base64 of the solution text"}

The page holds only fingerprints of the answer (built by the mentor), so the answer is not in the page source.
The solution opens once she solves the challenge, or if she gives up (then no XP).
XP grows with the challenge streak: 2, 3, 4, 6, 9, then 10 a day. Saturdays and Sundays never break a streak.
Results live in this browser (localStorage "al.v1"), next to the quiz results.
*/
(function () {
  var KEY = 'al.v1', SALT = 'nur-finance-2026', XP_STEPS = [2, 3, 4, 6, 9, 10];

  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY)) || {}; s.quizzes = s.quizzes || {}; s.challenges = s.challenges || {}; return s; }
    catch (e) { return { quizzes: {}, challenges: {} }; }
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* nothing to do */ } }
  function dayKey(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fromB64(b) {
    try { return decodeURIComponent(Array.prototype.map.call(atob(b), function (c) { return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); }).join('')); }
    catch (e) { return ''; }
  }

  function canon(raw, type, dp) {
    if (type === 'number') {
      var t = String(raw).replace(/[\s ,]/g, '').replace('%', '');
      if (t === '' || isNaN(Number(t))) return null;
      return Number(t).toFixed(dp || 0);
    }
    return String(raw).toLowerCase().replace(/["'`«»]/g, '').replace(/[\s ]+/g, ' ').replace(/[.;]+$/, '').trim();
  }
  function sha(text) {
    var data = new TextEncoder().encode(text);
    return crypto.subtle.digest('SHA-256', data).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('').slice(0, 24);
    });
  }

  /* streak of weekdays with a solved challenge, ending today (or yesterday if today is not solved yet) */
  function streakEndingAt(s, upto) {
    var days = {};
    Object.keys(s.challenges).forEach(function (id) { var c = s.challenges[id]; if (c.solvedOn) days[c.solvedOn] = true; });
    var d = new Date(upto || Date.now()), n = 0, first = true;
    for (var i = 0; i < 400; i++) {
      var k = dayKey(d), wd = d.getDay();
      if (days[k]) n++;
      else if (wd === 0 || wd === 6) { /* weekend: neutral */ }
      else if (first) { /* today not solved yet */ }
      else break;
      first = false;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }
  function totalXp(s) {
    return Object.keys(s.challenges).reduce(function (t, id) { return t + (s.challenges[id].xp || 0); }, 0);
  }
  window.ALChallenge = {
    state: load,
    streak: function () { return streakEndingAt(load()); },
    solved: function () { var s = load(); return Object.keys(s.challenges).filter(function (k) { return s.challenges[k].solvedOn; }).length; },
    xp: function () { return totalXp(load()); },
    fullWeeks: function () {
      var s = load(), weeks = [];
      for (var w = 1; w <= 8; w++) {
        var all = true;
        for (var d = 1; d <= 5; d++) { var c = s.challenges['w0' + w + 'd' + d]; if (!c || !c.solvedOn) { all = false; break; } }
        if (all) weeks.push(w);
      }
      return weeks;
    }
  };

  function mount(pre) {
    var src = pre.querySelector('code') || pre, ch;
    try { ch = JSON.parse(src.textContent); }
    catch (e) { pre.insertAdjacentHTML('beforebegin', '<p class="quiz-error">This challenge could not be read (' + esc(e.message) + ').</p>'); return; }
    var box = document.createElement('div');
    box.className = 'chal';
    pre.parentNode.replaceChild(box, pre);
    draw(box, ch);
  }

  function draw(box, ch) {
    var rec = load().challenges[ch.id];
    var html = '<div class="chal-head"><span class="chal-title">Daily challenge</span>' +
      '<span class="chal-rule">10–15 min · bonus XP that grows with your challenge streak</span></div>' +
      '<div class="chal-q">' + esc(ch.q) + '</div>' + (ch.code ? '<pre class="quiz-code"><code>' + esc(ch.code) + '</code></pre>' : '');
    if (rec && (rec.solvedOn || rec.gaveUp)) {
      html += '<div class="chal-result ' + (rec.solvedOn ? 'pass' : 'fail') + '">' +
        (rec.solvedOn ? '<b>Solved on ' + esc(rec.solvedOn) + ' — +' + rec.xp + ' XP.</b>' : '<b>You opened the solution</b> — no XP for this one; tomorrow\'s counts.') + '</div>' +
        '<details class="chal-sol" open><summary>Solution</summary><div>' + esc(fromB64(ch.sol)).replace(/\n/g, '<br>') + '</div></details>';
      box.innerHTML = html;
      return;
    }
    html += '<div class="chal-row"><input class="quiz-input chal-input" type="text" placeholder="' + (ch.type === 'number' ? 'a number' : 'your answer') + '" autocomplete="off">' +
      '<button type="button" class="chal-go">Check</button></div>' +
      '<div class="chal-msg" hidden></div>' +
      '<div class="chal-links"><a href="javascript:void(0)" class="chal-hint">Hint</a> · <a href="javascript:void(0)" class="chal-giveup">Give up and see the solution</a></div>' +
      '<div class="chal-hinttext" hidden>' + esc(ch.hint || 'No hint for this one.') + '</div>';
    box.innerHTML = html;

    var input = box.querySelector('.chal-input'), msg = box.querySelector('.chal-msg');
    function check() {
      var c = canon(input.value, ch.type, ch.dp);
      if (c === null) { msg.hidden = false; msg.className = 'chal-msg fail'; msg.textContent = 'Type a number.'; return; }
      if (!window.crypto || !crypto.subtle) { msg.hidden = false; msg.className = 'chal-msg fail'; msg.textContent = 'This browser cannot check answers here; open the course through its web address.'; return; }
      sha(SALT + c).then(function (hx) {
        var s = load(), r = s.challenges[ch.id] || { tries: 0 };
        r.tries = (r.tries || 0) + 1;
        if (ch.h.indexOf(hx) >= 0) {
          var today = dayKey(new Date());
          r.solvedOn = today;
          s.challenges[ch.id] = r;
          var st = streakEndingAt(s);
          r.xp = XP_STEPS[Math.min(st, XP_STEPS.length) - 1] || 2;
          r.streakAtSolve = st;
          s.challenges[ch.id] = r;
          save(s);
          draw(box, ch);
          var res = box.querySelector('.chal-result');
          if (res) res.innerHTML += ' Challenge streak: ' + st + ' day(s).';
          if (window.ALBoard) window.ALBoard.render(true);
        } else {
          s.challenges[ch.id] = r;
          save(s);
          msg.hidden = false;
          msg.className = 'chal-msg fail';
          msg.textContent = 'Not yet (' + r.tries + ' tr' + (r.tries === 1 ? 'y' : 'ies') + '). Check your filter and your rounding, then try again.';
        }
      });
    }
    box.querySelector('.chal-go').addEventListener('click', check);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
    box.querySelector('.chal-hint').addEventListener('click', function () { box.querySelector('.chal-hinttext').hidden = false; });
    box.querySelector('.chal-giveup').addEventListener('click', function () {
      if (!confirm('See the solution? This challenge will give no XP, and your challenge streak continues only with tomorrow\'s.')) return;
      var s = load(), r = s.challenges[ch.id] || {};
      r.gaveUp = dayKey(new Date());
      s.challenges[ch.id] = r;
      save(s);
      draw(box, ch);
    });
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(function () {
      Array.prototype.forEach.call(document.querySelectorAll('.markdown-section pre[data-lang="challenge"]'), mount);
    });
  });
})();
