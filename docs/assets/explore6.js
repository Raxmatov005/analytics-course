/* Going-further explorer types: IFRS 9 provisions (W8D2). Added to explore.js's registry
(window.ALExplore.types); see explore.js's header for the block format and the challenge rules.

  staging — W8D2, "Going further — IFRS 9 provisions". The book on the reporting date: every late loan as a dot on the
            days-past-due line (y: what it still owes, on a log scale), the loans paid up to date as one count. Stage 1
            is 0–30 days (12 months of expected loss), stage 2 is 31–90 (lifetime), stage 3 is 91+ (defaulted, PD 100 %).
            She picks what to move — one loan ("pick"), every loan in 1–30, or every loan in 31–90 — and gives it more
            days without a payment (+0 … +90); its stage, its provision and the book's totals follow. Sliders: the PD of
            stage 1 (12 months), the PD of stage 2 (lifetime) and the LGD. Provision of a loan = PD of its stage × LGD ×
            balance; coverage = provision ÷ balance.
            Data: "zero" [loans, balance] paid up to date; "late" [[dpd, balance], …] the late loans; "pick" (index in
            "late") and "pickId" (its loan number); "start" {pd1, pd2, lgd}.
            numbers: sel (0 loan / 1 the 1–30 group / 2 the 31–90 group), shift, stage (the one loan's stage; 0 for a
            group), jump (the moved loans' provision now ÷ at +0), total, cov (total coverage), rise (total now − total at
            +0, same assumptions), pd1, pd2, lgd, cliff (pd2 ÷ pd1); "only" keys: pd1, pd2, lgd.
Every number on screen is computed from the block's own data; nothing is random. */
(function () {
  var X = window.ALExplore;
  if (!X) return;
  var T = X.T, esc = X.esc, num = X.num, slider = X.slider;

  function nb(s) { return String(s).replace(/ /g, ' '); }   // "3 312" and "2.65 %" stay on one line
  function pc(x, dp) { return nb((x * 100).toFixed(dp == null ? (x < 0.1 ? 2 : 1) : dp) + ' %'); }
  function n0(x) { return nb(num(x)); }
  function bn(x) { return nb((x / 1e9).toFixed(2) + T(' bn', ' млрд')); }
  function mln(x) { return nb((x / 1e6).toFixed(2) + T(' m', ' млн')); }
  function money(x) { return Math.abs(x) >= 1e9 ? bn(x) : mln(x); }
  function seg(key, label, opts, cur) {   // a row of pill buttons, one of them on (explore.js's .xp-tg look)
    return '<div class="xp-tg" data-g="' + key + '"><span class="xp-tg-l">' + label + '</span>' + opts.map(function (o) {
      var on = String(o[0]) === String(cur);
      return '<button type="button" data-o="' + esc(o[0]) + '" aria-pressed="' + on + '"' + (on ? ' class="on"' : '') + '>' + o[1] + '</button>';
    }).join('') + '</div>';
  }
  function segSet(body, key, cur) {
    body.querySelectorAll('.xp-tg[data-g="' + key + '"] button').forEach(function (b) {
      var on = b.getAttribute('data-o') === String(cur); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
    });
  }

  /* ---------- staging: move loans along the days-past-due line ---------- */
  X.types.staging = function (body, g, check) {
    var late = g.late || [], Z = g.zero || [0, 0], pick = g.pick || 0, pickId = g.pickId || '', s0 = g.start || {};
    var st = { sel: 0, shift: 0, pd1: s0.pd1 == null ? 0.0265 : s0.pd1, pd2: s0.pd2 == null ? 0.857 : s0.pd2, lgd: s0.lgd == null ? 0.6 : s0.lgd };
    var start = { pd1: st.pd1, pd2: st.pd2, lgd: st.lgd };
    function stage(d) { return d <= 30 ? 1 : d <= 90 ? 2 : 3; }
    function inSel(i, sel) {
      var d = late[i][0];
      return sel === 0 ? i === pick : sel === 1 ? d >= 1 && d <= 30 : d >= 31 && d <= 90;
    }
    var nG1 = 0, nG2 = 0;
    late.forEach(function (l) { if (l[0] >= 1 && l[0] <= 30) nG1++; else if (l[0] >= 31 && l[0] <= 90) nG2++; });
    var pd0 = late[pick] ? late[pick][0] : 0;
    var SELS = [[0, T('Loan ' + pickId + ' · ' + pd0 + ' days late', 'Кредит ' + pickId + ' · ' + pd0 + ' дн. просрочки')],
      [1, T('The ' + nG1 + ' loans in 1–30', n0(nG1) + ' кредитов в 1–30')], [2, T('The ' + nG2 + ' loans in 31–90', n0(nG2) + ' кредитов в 31–90')]];
    body.innerHTML = seg('sel', T('What you move', 'Что вы двигаете'), SELS, st.sel) +
      '<div class="xp-ctrl">' + slider(T('More days without a payment, from 1 October', 'Ещё дней без платежа, считая от 1 октября'), 'shift', 0, 90, 1, 0, '') + '</div>' +
      '<div class="xp-btns xp6-nudge">' + [-10, -1, 1, 10].map(function (d) {
        var t = (d > 0 ? '+' : '−') + Math.abs(d);
        return '<button type="button" class="xp-btn xp-ghost" data-d="' + d + '" aria-label="' + t + '">' + t + '</button>';
      }).join('') + '</div>' +
      '<div class="xp-big"><span class="xp-big-k"></span><span class="xp-big-v"></span></div>' +
      '<svg class="xp6-svg" viewBox="0 0 400 214" role="img"></svg>' +
      '<div class="xp-legend xp6-leg"><span class="xl6-s1">' + T('stage 1: 0–30 days', 'стадия 1: 0–30 дней') + '</span><span class="xl6-s2">' + T('stage 2: 31–90', 'стадия 2: 31–90') + '</span>' +
      '<span class="xl6-s3">' + T('stage 3: 91+', 'стадия 3: 91+') + '</span><span class="xl6-mv">' + T('the loans you move', 'кредиты, которые вы двигаете') + '</span></div>' +
      '<div class="xp6-grid"></div>' +
      '<div class="xp6-k">' + T('The assumptions', 'Допущения') + '</div>' +
      '<div class="xp-ctrl">' +
      slider(T('PD of stage 1 — default within 12 months', 'PD стадии 1 — дефолт в ближайшие 12 месяцев'), 'pd1', 0.005, 0.1, 0.0005, st.pd1, '') +
      slider(T('PD of stage 2 — default over the rest of the life', 'PD стадии 2 — дефолт за весь оставшийся срок'), 'pd2', 0.01, 1, 0.001, st.pd2, '') +
      slider(T('LGD — share of the balance lost in a default', 'LGD — доля остатка, теряемая при дефолте'), 'lgd', 0.2, 1, 0.01, st.lgd, '') + '</div>' +
      '<div class="xp-say"></div><div class="xp-note"></div>';
    var svg = body.querySelector('.xp6-svg'), rng = body.querySelector('input[data-k="shift"]');
    var XL = 46, XR = 392, YT = 22, YB = 172, DMAX = 180;
    function xx(d) { return XL + Math.min(d, DMAX) / DMAX * (XR - XL); }
    function yy(b) { var l = Math.log(Math.max(b, 1e5)) / Math.LN10; return YB - (Math.min(l, 9) - 5) / 4 * (YB - YT); }

    function book(shift) {   // stage totals with the chosen loans moved by `shift` days
      var PD = [0, st.pd1, st.pd2, 1], S = [null, { n: Z[0], b: Z[1], p: 0 }, { n: 0, b: 0, p: 0 }, { n: 0, b: 0, p: 0 }], mv = 0, mvS = [0, 0, 0, 0];
      S[1].p = PD[1] * st.lgd * Z[1];
      late.forEach(function (l, i) {
        var m = inSel(i, st.sel), s = stage(l[0] + (m ? shift : 0)), p = PD[s] * st.lgd * l[1];
        S[s].n++; S[s].b += l[1]; S[s].p += p;
        if (m) { mv += p; mvS[s]++; }
      });
      var tot = { n: 0, b: 0, p: 0 };
      [1, 2, 3].forEach(function (k) { tot.n += S[k].n; tot.b += S[k].b; tot.p += S[k].p; });
      return { S: S, tot: tot, mv: mv, mvS: mvS };
    }

    function redraw() {
      var now = book(st.shift), was = book(0);
      segSet(body, 'sel', st.sel);
      rng.value = st.shift;
      body.querySelector('[data-v="shift"]').textContent = '+' + st.shift;
      body.querySelector('[data-v="pd1"]').textContent = pc(st.pd1, 2);
      body.querySelector('[data-v="pd2"]').textContent = pc(st.pd2, 1);
      body.querySelector('[data-v="lgd"]').textContent = pc(st.lgd, 0);
      var jump = was.mv > 0 ? now.mv / was.mv : 1;
      var who = st.sel === 0 ? T('loan ' + pickId, 'кредиту ' + pickId) : st.sel === 1 ? T('the ' + nG1 + ' loans in 1–30', n0(nG1) + ' кредитам из 1–30') : T('the ' + nG2 + ' loans in 31–90', n0(nG2) + ' кредитам из 31–90');
      body.querySelector('.xp-big-k').innerHTML = T('Provision for ' + who + ' (at +0: ' + money(was.mv) + ')', 'Резерв по ' + who + ' (при +0: ' + money(was.mv) + ')');
      body.querySelector('.xp-big-v').innerHTML = money(now.mv) + (Math.abs(jump - 1) > 0.0005 ? ' <span class="xp6-x">×' + nb(jump.toFixed(jump < 10 ? 2 : 1)) + '</span>' : '');

      /* the picture: stage bands, the late loans, the moved ones on top */
      var b1 = xx(30.5), b2 = xx(90.5), o = '';
      o += '<rect class="xp6-b1" x="' + XL + '" y="' + YT + '" width="' + (b1 - XL).toFixed(1) + '" height="' + (YB - YT) + '"/>' +
        '<rect class="xp6-b2" x="' + b1.toFixed(1) + '" y="' + YT + '" width="' + (b2 - b1).toFixed(1) + '" height="' + (YB - YT) + '"/>' +
        '<rect class="xp6-b3" x="' + b2.toFixed(1) + '" y="' + YT + '" width="' + (XR - b2).toFixed(1) + '" height="' + (YB - YT) + '"/>';
      o += '<text class="xp-ax xp6-st xp6-t1" x="' + ((XL + b1) / 2).toFixed(1) + '" y="15" text-anchor="middle">' + T('Stage 1', 'Стадия 1') + '</text>' +
        '<text class="xp-ax xp6-st xp6-t2" x="' + ((b1 + b2) / 2).toFixed(1) + '" y="15" text-anchor="middle">' + T('Stage 2', 'Стадия 2') + '</text>' +
        '<text class="xp-ax xp6-st xp6-t3" x="' + ((b2 + XR) / 2).toFixed(1) + '" y="15" text-anchor="middle">' + T('Stage 3', 'Стадия 3') + '</text>';
      o += '<line class="xp6-cut" x1="' + b1.toFixed(1) + '" x2="' + b1.toFixed(1) + '" y1="' + YT + '" y2="' + YB + '"/><line class="xp6-cut" x1="' + b2.toFixed(1) + '" x2="' + b2.toFixed(1) + '" y1="' + YT + '" y2="' + YB + '"/>';
      o += '<line class="xp6-axis" x1="' + XL + '" x2="' + XR + '" y1="' + YB + '" y2="' + YB + '"/>';
      [0, 30, 60, 90, 120, 150, 180].forEach(function (d) {
        o += '<line class="xp6-tick" x1="' + xx(d).toFixed(1) + '" x2="' + xx(d).toFixed(1) + '" y1="' + YB + '" y2="' + (YB + 4) + '"/><text class="xp-ax" x="' + xx(d).toFixed(1) + '" y="' + (YB + 16) + '" text-anchor="middle">' + d + '</text>';
      });
      [[1e5, T('0.1 m', '0.1 млн')], [1e6, T('1 m', '1 млн')], [1e7, T('10 m', '10 млн')], [1e8, T('100 m', '100 млн')], [1e9, T('1 bn', '1 млрд')]].forEach(function (t) {
        o += '<text class="xp-ax" x="' + (XL - 5) + '" y="' + (yy(t[0]) + 4).toFixed(1) + '" text-anchor="end">' + t[1] + '</text>';
      });
      o += '<text class="xp-ax" x="' + XL + '" y="' + (YB + 34) + '">' + T('days past due · height: balance still owed', 'дней просрочки · высота: остаток долга') + '</text>';
      var top = '', pl = '';
      late.forEach(function (l, i) {
        var m = inSel(i, st.sel), d = l[0] + (m ? st.shift : 0), s = stage(d);
        var c = '<circle class="xp6-d' + s + (m ? ' xp6-mv' : '') + '" cx="' + xx(d).toFixed(1) + '" cy="' + yy(l[1]).toFixed(1) + '" r="' + (m ? (st.sel === 0 ? 6 : 4.2) : 3.2) + '"/>';
        if (m) top += c; else o += c;
        if (i === pick && st.sel === 0) {
          var px = xx(d), py = yy(l[1]) - 10, end = px > 330;
          pl = '<text class="xp6-pl" x="' + (end ? px + 6 : px - 6).toFixed(1) + '" y="' + py.toFixed(1) + '" text-anchor="' + (end ? 'end' : 'start') + '">' + pickId + ' · ' + d + T(' d', ' дн.') + '</text>';
        }
      });
      svg.innerHTML = o + top + pl;

      /* the book by stage */
      function box(cls, k, s) {
        return '<div class="' + cls + '"><span>' + k + '</span><b>' + bn(s.p) + '</b><i>' + T(n0(s.n) + ' loans · ' + bn(s.b), 'кредитов: ' + n0(s.n) + ' · ' + bn(s.b)) + '</i><i>' + T('coverage ', 'покрытие ') + pc(s.b ? s.p / s.b : 0) + '</i></div>';
      }
      var rise = now.tot.p - was.tot.p;
      body.querySelector('.xp6-grid').innerHTML =
        box('xp6-g1', T('Stage 1 · 12 months', 'Стадия 1 · 12 месяцев'), now.S[1]) +
        box('xp6-g2', T('Stage 2 · lifetime', 'Стадия 2 · весь срок'), now.S[2]) +
        box('xp6-g3', T('Stage 3 · defaulted', 'Стадия 3 · дефолт'), now.S[3]) +
        '<div class="xp6-gt"><span>' + T('The book', 'Весь портфель') + '</span><b>' + bn(now.tot.p) + '</b><i>' + T(n0(now.tot.n) + ' loans · ' + bn(now.tot.b), 'кредитов: ' + n0(now.tot.n) + ' · ' + bn(now.tot.b)) + '</i><i>' + T('coverage ', 'покрытие ') + pc(now.tot.p / now.tot.b, 2) + '</i>' +
        (Math.abs(rise) >= 5e5 ? '<i class="xp6-rise">' + (rise > 0 ? '+' : '−') + money(Math.abs(rise)) + T(' from the move', ' от сдвига') + ' (' + (rise > 0 ? '+' : '−') + pc(Math.abs(rise) / was.tot.p, 1) + ')</i>' : '') + '</div>';

      /* the sentences */
      var say, cl1 = st.pd2 / st.pd1, cl2 = 1 / st.pd2;
      if (st.sel === 0) {
        var l = late[pick], d = l[0] + st.shift, s = stage(d);
        var how = s === 1 ? T('12 months of loss, PD ' + pc(st.pd1, 2), '12 месяцев потерь, PD ' + pc(st.pd1, 2)) : s === 2 ? T('lifetime loss, PD ' + pc(st.pd2, 1), 'потери за весь срок, PD ' + pc(st.pd2, 1)) : T('defaulted, PD 100 %', 'дефолт, PD 100 %');
        say = T('Loan ' + pickId + ' is <b>' + d + ' days</b> late: <b>stage ' + s + '</b> — ' + how + ' × LGD ' + pc(st.lgd, 0) + ' × ' + mln(l[1]) + ' = <b>' + mln(now.mv) + '</b>. ',
          'Кредит ' + pickId + ' просрочен на <b>' + d + ' дн.</b>: <b>стадия ' + s + '</b> — ' + how + ' × LGD ' + pc(st.lgd, 0) + ' × ' + mln(l[1]) + ' = <b>' + mln(now.mv) + '</b>. ');
      } else {
        var c = now.mvS;
        say = T('After +' + st.shift + ' days: <b>' + c[1] + '</b> of them in stage 1, <b>' + c[2] + '</b> in stage 2, <b>' + c[3] + '</b> in stage 3. Their provision ' + money(was.mv) + ' → <b>' + money(now.mv) + '</b>; the book’s ' + bn(was.tot.p) + ' → <b>' + bn(now.tot.p) + '</b>. ',
          'Через +' + st.shift + ' дн.: в стадии 1 — <b>' + c[1] + '</b>, в стадии 2 — <b>' + c[2] + '</b>, в стадии 3 — <b>' + c[3] + '</b>. Их резерв ' + money(was.mv) + ' → <b>' + money(now.mv) + '</b>; резерв портфеля ' + bn(was.tot.p) + ' → <b>' + bn(now.tot.p) + '</b>. ');
      }
      say += T('Crossing 30 days multiplies a loan’s provision by <b>×' + nb(cl1.toFixed(cl1 < 10 ? 2 : 1)) + '</b> (' + pc(st.pd2, 1) + ' ÷ ' + pc(st.pd1, 2) + '); crossing 90 by <b>×' + nb(cl2.toFixed(2)) + '</b> (100 % ÷ ' + pc(st.pd2, 1) + ').',
        'Переход через 30 дней умножает резерв кредита на <b>×' + nb(cl1.toFixed(cl1 < 10 ? 2 : 1)) + '</b> (' + pc(st.pd2, 1) + ' ÷ ' + pc(st.pd1, 2) + '); через 90 — на <b>×' + nb(cl2.toFixed(2)) + '</b> (100 % ÷ ' + pc(st.pd2, 1) + ').');
      body.querySelector('.xp-say').innerHTML = say;
      body.querySelector('.xp-note').innerHTML = T('Nur’s book on 1 October 2026: the ' + n0(late.length) + ' late loans are dots; the other ' + n0(Z[0]) + ' (' + bn(Z[1]) + ') are paid up to date and sit in stage 1 at 0 days. Balance = principal still owed. One PD per stage, measured on last year’s book; LGD 60 % as in week 6 — a teaching model, not Nur’s accounts.',
        'Портфель Nur на 1 октября 2026: ' + n0(late.length) + ' просроченных кредитов — точки; остальные ' + n0(Z[0]) + ' (' + bn(Z[1]) + ') платят вовремя и стоят в стадии 1 на 0 днях. Остаток — ещё не возвращённый основной долг. Одна PD на стадию, измеренная на прошлогоднем портфеле; LGD 60 %, как в неделе 6, — учебная модель, а не отчётность Nur.');
      check({ sel: st.sel, shift: st.shift, stage: st.sel === 0 ? stage(late[pick][0] + st.shift) : 0, jump: jump, total: now.tot.p, cov: now.tot.p / now.tot.b, rise: rise,
        pd1: st.pd1, pd2: st.pd2, lgd: st.lgd, cliff: cl1 },
        { pd1: Math.abs(st.pd1 - start.pd1) > 1e-9, pd2: Math.abs(st.pd2 - start.pd2) > 1e-9, lgd: Math.abs(st.lgd - start.lgd) > 1e-9 });
    }

    body.querySelectorAll('.xp-tg[data-g="sel"] button').forEach(function (bt) {
      bt.onclick = function () { st.sel = Number(bt.getAttribute('data-o')); st.shift = 0; redraw(); };
    });
    rng.addEventListener('input', function () { st.shift = Number(rng.value); redraw(); });
    body.querySelectorAll('.xp6-nudge button').forEach(function (b) {
      b.onclick = function () { st.shift = Math.max(0, Math.min(90, st.shift + Number(b.getAttribute('data-d')))); redraw(); };
    });
    ['pd1', 'pd2', 'lgd'].forEach(function (k) {
      var r = body.querySelector('input[data-k="' + k + '"]');
      r.addEventListener('input', function () { st[k] = Number(r.value); redraw(); });
    });
    redraw();
    return { redraw: redraw };
  };
})();
