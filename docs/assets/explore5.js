/* Going-further explorer types: trends and a simple forecast (W8D1). Added to explore.js's registry
(window.ALExplore.types); see explore.js's header for the block format and the challenge rules.

  forecast — a real monthly series as a line ("from": its first month "YYYY-MM"; "series": [{label, unit, axis, div,
             dp, values}], e.g. the disbursed amount and the number of loans). The last h months are hidden (the
             holdout test); one of four methods forecasts them from the months before — naive (the last month seen),
             seasonal naive (the same month a year before), the average of the last 3, a straight line (least squares
             through the months before, continued) — and the misses, MAE, MAPE and the bias follow at once.
             "The next quarter" forecasts the 3 months after the data from all of it, with a range ± the method's MAPE
             on the holdout chosen (a teaching simplification, said so on screen).
             numbers: series (its index), meth (0 naive, 1 seasonal naive, 2 average of 3, 3 line), h (1–12),
             mode (0 test, 1 next quarter), mape (%), mae (in the series' unit), bias (% of the hidden total, − = too
             low), rank (1 = the smallest MAPE of the four at this series and h).
Every number on screen is computed from the block's own values; nothing is random. */
(function () {
  var X = window.ALExplore;
  if (!X) return;
  var T = X.T, esc = X.esc, num = X.num, slider = X.slider;

  function nb(s) { return String(s).replace(/ /g, ' '); }             // "17.02 bn" and "9.5 %" stay on one line
  var MON = [['Jan', 'янв'], ['Feb', 'фев'], ['Mar', 'мар'], ['Apr', 'апр'], ['May', 'май'], ['Jun', 'июн'],
    ['Jul', 'июл'], ['Aug', 'авг'], ['Sep', 'сен'], ['Oct', 'окт'], ['Nov', 'ноя'], ['Dec', 'дек']];
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
  function ruM(n) { var a = n % 100, b = n % 10; return a > 10 && a < 20 ? 'месяцев' : b === 1 ? 'месяц' : b > 1 && b < 5 ? 'месяца' : 'месяцев'; }
  function ruMDat(n) { return n % 10 === 1 && n % 100 !== 11 ? 'месяцу' : 'месяцам'; }   // по 21 месяцу, по 27 месяцам
  function signed(x) { return nb((x >= 0.05 ? '+' : x <= -0.05 ? '−' : '') + Math.abs(x).toFixed(1) + ' %'); }

  X.types.forecast = function (body, g, check) {
    var S = g.series, s0 = g.start || {}, N = S[0].values.length, AHEAD = 3, SLOTS = N + AHEAD;
    var Y0 = Number(g.from.slice(0, 4)), M0 = Number(g.from.slice(5, 7)) - 1;
    function yearOf(i) { return Y0 + Math.floor((M0 + i) / 12); }
    function short(i) { var k = (M0 + i) % 12; return T(MON[k][0], MON[k][1]); }
    function mon(i) { return short(i) + ' ' + yearOf(i); }
    function span(i, j) { return i === j ? mon(i) : (yearOf(i) === yearOf(j) ? short(i) : mon(i)) + '–' + mon(j); }
    var st = { series: s0.series || 0, meth: s0.meth || 0, h: s0.h || 6, mode: 0 };
    var start = { series: st.series, meth: st.meth, h: st.h, mode: 0 };
    var Ys = S.map(function (s) { return s.values.map(function (v) { return v / (s.div || 1); }); });
    function val(v, si, dp) { var d = dp == null ? (S[si].dp == null ? 2 : S[si].dp) : dp; return d ? v.toFixed(d) : num(v); }
    function fmt(v, si, dp) { return nb(val(v, si, dp) + ' ' + S[si].unit); }

    /* the four methods: months n … n + h − 1 forecast from months 0 … n − 1 */
    function fit(y, n) {   // least squares on t = 0 … n − 1
      var sx = 0, sy = 0, sxx = 0, sxy = 0, t;
      for (t = 0; t < n; t++) { sx += t; sy += y[t]; sxx += t * t; sxy += t * y[t]; }
      var b = (n * sxy - sx * sy) / (n * sxx - sx * sx);
      return { a: (sy - b * sx) / n, b: b };
    }
    function forecast(y, n, h, m) {
      var f = [], src = [], L = null, k;
      if (m === 0) { for (k = 0; k < h; k++) f.push(y[n - 1]); src = [n - 1]; }
      else if (m === 1) { for (k = 0; k < h; k++) { f.push(y[n + k - 12]); src.push(n + k - 12); } }
      else if (m === 2) { var a3 = (y[n - 1] + y[n - 2] + y[n - 3]) / 3; for (k = 0; k < h; k++) f.push(a3); src = [n - 3, n - 2, n - 1]; }
      else { L = fit(y, n); for (k = 0; k < h; k++) f.push(L.a + L.b * (n + k)); }
      return { f: f, src: src, L: L };
    }
    function test(si, h, m) {   // hide the last h months, forecast them, measure the miss
      var y = Ys[si], n = N - h, r = forecast(y, n, h, m), ae = 0, ape = 0, sf = 0, sa = 0;
      for (var k = 0; k < h; k++) { var a = y[n + k], e = r.f[k] - a; ae += Math.abs(e); ape += Math.abs(e) / a; sf += r.f[k]; sa += a; }
      return { n: n, r: r, mae: ae / h, mape: ape / h * 100, bias: (sf / sa - 1) * 100 };
    }

    var METHODS = [[0, T('Last month (naive)', 'Последний месяц (наивный)')], [1, T('Same month last year', 'Тот же месяц год назад')],
      [2, T('Average of last 3', 'Среднее за 3 месяца')], [3, T('Straight line', 'Прямая линия')]];
    body.innerHTML = seg('mode', T('Show', 'Показать'), [[0, T('Test on the past', 'Проверка на прошлом')], [1, T('The next quarter', 'Следующий квартал')]], st.mode) +
      seg('series', T('The series', 'Ряд'), S.map(function (s, i) { return [i, esc(s.label)]; }), st.series) +
      seg('meth', T('Forecast method', 'Метод прогноза'), METHODS, st.meth) +
      '<div class="xp-ctrl">' + slider(T('Months hidden for the test', 'Сколько месяцев скрыть для проверки'), 'h', 1, 12, 1, st.h, '') + '</div>' +
      '<div class="xp-big"><span class="xp-big-k"></span><span class="xp-big-v"></span></div>' +
      '<svg class="xp5-svg" viewBox="0 0 400 222" role="img"></svg>' +
      '<div class="xp-legend xp5-leg"></div>' +
      '<div class="xp5-grid"></div><div class="xp-say"></div>' +
      '<div class="xp-note">' + X.fmtText(g.note || '') + '</div>';
    var svg = body.querySelector('.xp5-svg');
    var X0 = 34, X1 = 396, TOP = 16, BOT = 178, W = (X1 - X0) / SLOTS;
    function xi(i) { return X0 + (i + 0.5) * W; }
    function nice(v) { var p = Math.pow(10, Math.floor(Math.log(v) / Math.LN10)), q = v / p; return (q <= 1 ? 1 : q <= 2 ? 2 : q <= 5 ? 5 : 10) * p; }

    function redraw() {
      var si = st.series, y = Ys[si], m = st.meth, h = st.h, fut = st.mode === 1, R = test(si, h, m), k, i;
      var all = [0, 1, 2, 3].map(function (q) { return test(si, h, q).mape; });
      var rank = 1 + all.filter(function (v) { return v < R.mape - 1e-9; }).length;
      var P = fut ? forecast(y, N, AHEAD, m) : R.r, n0 = fut ? N : R.n, hh = fut ? AHEAD : h, band = R.mape / 100;
      segSet(body, 'mode', st.mode); segSet(body, 'series', si); segSet(body, 'meth', m);
      body.querySelector('[data-v="h"]').textContent = nb(h + ' · ' + span(N - h, N - 1));
      /* the scale: everything drawn fits */
      var top = 0;
      for (i = 0; i < N; i++) top = Math.max(top, y[i]);
      P.f.forEach(function (v) { top = Math.max(top, fut ? v * (1 + band) : v); });
      var step = nice(top / 4), ymax = Math.ceil(top * 1.04 / step) * step;
      function yy(v) { return BOT - Math.max(0, v) / ymax * (BOT - TOP); }
      var o = '';
      for (var v = 0; v <= ymax + 1e-9; v += step) {
        o += '<line class="xp5-gl" x1="' + X0 + '" x2="' + X1 + '" y1="' + yy(v).toFixed(1) + '" y2="' + yy(v).toFixed(1) + '"/>' +
          '<text class="xp-ax" x="' + (X0 - 5) + '" y="' + (yy(v) + 3.5).toFixed(1) + '" text-anchor="end">' + (step < 1 ? v.toFixed(1) : Math.round(v)) + '</text>';
      }
      /* the hidden months (or the quarter ahead) */
      var z0 = xi(n0) - W / 2, z1 = xi(n0 + hh - 1) + W / 2;
      o += '<rect class="' + (fut ? 'xp5-fut' : 'xp5-hid') + '" x="' + z0.toFixed(1) + '" y="' + TOP + '" width="' + (z1 - z0).toFixed(1) + '" height="' + (BOT - TOP) + '"/>' +
        '<text class="xp-ax xp5-zt" x="' + Math.min(z1, X1).toFixed(1) + '" y="' + (TOP - 4) + '" text-anchor="end">' + (fut ? T('ahead', 'впереди') : T('hidden', 'скрыто')) + '</text>';
      for (i = 0; i < SLOTS; i++) if ((M0 + i) % 12 === 0) {
        var xt = xi(i) - W / 2;
        o += '<line class="xp5-tick" x1="' + xt.toFixed(1) + '" x2="' + xt.toFixed(1) + '" y1="' + BOT + '" y2="' + (BOT + 5) + '"/>' +
          '<text class="xp-ax" x="' + (xt + 3).toFixed(1) + '" y="' + (BOT + 15) + '">' + yearOf(i) + '</text>';
      }
      o += '<line class="xp5-axis" x1="' + X0 + '" x2="' + X1 + '" y1="' + BOT + '" y2="' + BOT + '"/>' +
        '<text class="xp-ax" x="' + X0 + '" y="' + (BOT + 37) + '">' + esc(S[si].axis || S[si].unit) + '</text>';
      /* the straight line through the months it was fitted on */
      if (P.L) o += '<line class="xp5-fit" x1="' + xi(0).toFixed(1) + '" y1="' + yy(P.L.a).toFixed(1) + '" x2="' + xi(n0 - 1).toFixed(1) + '" y2="' + yy(P.L.a + P.L.b * (n0 - 1)).toFixed(1) + '"/>';
      /* the real months: small dots where the method may look, hollow ones where it is tested */
      var d = '';
      for (i = 0; i < N; i++) d += (i ? 'L' : 'M') + xi(i).toFixed(1) + ' ' + yy(y[i]).toFixed(1);
      o += '<path class="xp5-act" d="' + d + '"/>';
      P.src.forEach(function (j) { o += '<circle class="xp5-src" cx="' + xi(j).toFixed(1) + '" cy="' + yy(y[j]).toFixed(1) + '" r="5.6"/>'; });
      for (i = 0; i < N; i++) {
        var hid = !fut && i >= n0;
        o += '<circle class="' + (hid ? 'xp5-dh' : 'xp5-d') + '" cx="' + xi(i).toFixed(1) + '" cy="' + yy(y[i]).toFixed(1) + '" r="' + (hid ? 3.3 : 2.1) + '"/>';
      }
      /* the forecast: misses as lines to the real month, or a range ahead */
      if (fut) {
        var up = '', dn = '';
        for (k = 0; k < hh; k++) up += (k ? 'L' : 'M') + xi(n0 + k).toFixed(1) + ' ' + yy(P.f[k] * (1 + band)).toFixed(1);
        for (k = hh - 1; k >= 0; k--) dn += 'L' + xi(n0 + k).toFixed(1) + ' ' + yy(P.f[k] * (1 - band)).toFixed(1);
        o += '<path class="xp5-band" d="' + up + dn + 'Z"/>';
      } else {
        for (k = 0; k < hh; k++) o += '<line class="xp5-miss" x1="' + xi(n0 + k).toFixed(1) + '" x2="' + xi(n0 + k).toFixed(1) + '" y1="' + yy(P.f[k]).toFixed(1) + '" y2="' + yy(y[n0 + k]).toFixed(1) + '"/>';
      }
      d = 'M' + xi(n0 - 1).toFixed(1) + ' ' + yy(y[n0 - 1]).toFixed(1);
      for (k = 0; k < hh; k++) d += 'L' + xi(n0 + k).toFixed(1) + ' ' + yy(P.f[k]).toFixed(1);
      o += '<path class="xp5-fc" d="' + d + '"/>';
      for (k = 0; k < hh; k++) o += '<circle class="xp5-fd" cx="' + xi(n0 + k).toFixed(1) + '" cy="' + yy(P.f[k]).toFixed(1) + '" r="3"/>';
      svg.innerHTML = o;
      svg.setAttribute('aria-label', S[si].label + ', ' + mon(0) + ' – ' + mon(N - 1));
      body.querySelector('.xp5-leg').innerHTML = '<span class="xl5-act">' + T('real months', 'фактические месяцы') + '</span>' +
        (fut ? '' : '<span class="xl5-hid">' + T('hidden: the test', 'скрытые: проверка') + '</span>') +
        '<span class="xl5-fc">' + T('forecast', 'прогноз') + '</span>' +
        (P.src.length ? '<span class="xl5-src">' + T('months it copies', 'месяцы, из которых он берёт') + '</span>' : '<span class="xl5-fit">' + T('the fitted line', 'подобранная прямая') + '</span>') +
        (fut ? '<span class="xl5-band">' + T('range', 'диапазон') + '</span>' : '');
      /* the numbers */
      var total = 0;
      P.f.forEach(function (q) { total += q; });
      var tested = nb(h + ' ' + T(h === 1 ? 'month' : 'months', ruM(h)));
      function cell(k2, v2, sub) { return '<div><span>' + k2 + '</span><b>' + v2 + '</b>' + (sub ? '<i>' + sub + '</i>' : '') + '</div>'; }
      if (fut) {
        body.querySelector('.xp-big-k').textContent = T('Next quarter (' + span(N, N + 2) + '), forecast', 'Следующий квартал (' + span(N, N + 2) + '), прогноз');
        body.querySelector('.xp-big-v').textContent = fmt(total, si, S[si].dp ? 1 : 0);
        body.querySelector('.xp5-grid').innerHTML =
          cell(T('Range', 'Диапазон'), nb(val(total * (1 - band), si, S[si].dp ? 1 : 0) + '–' + fmt(total * (1 + band), si, S[si].dp ? 1 : 0)), nb('± ' + R.mape.toFixed(1) + ' %')) +
          cell(T('Month by month', 'По месяцам'), P.f.map(function (q) { return val(q, si); }).join(' · '), nb(short(N) + ' · ' + short(N + 1) + ' · ' + short(N + 2))) +
          cell(T('The ± comes from', 'Откуда ±'), tested, T('its test on ', 'его проверка на ') + nb(span(N - h, N - 1)));
      } else {
        body.querySelector('.xp-big-k').textContent = T('Average miss on the ' + tested + ' hidden (MAPE)', 'Средний промах (MAPE), скрыто: ' + tested);
        body.querySelector('.xp-big-v').textContent = nb(R.mape.toFixed(1) + ' %');
        body.querySelector('.xp5-grid').innerHTML =
          cell(T('Average miss (MAE)', 'Средний промах (MAE)'), fmt(R.mae, si), T('a month', 'в месяц')) +
          cell(T('On balance', 'В сумме'), signed(R.bias), Math.abs(R.bias) < 0.05 ? T('spot on', 'точно') : R.bias < 0 ? T('too low', 'ниже факта') : T('too high', 'выше факта')) +
          cell(T('Rank of the four', 'Место из четырёх'), rank + ' / 4', T('at this test', 'на этой проверке'));
      }
      /* in words */
      var how;
      if (m === 0) how = T('Naive: every month ahead = ' + mon(n0 - 1) + ', ' + fmt(y[n0 - 1], si) + '.', 'Наивный: каждый месяц вперёд = ' + mon(n0 - 1) + ', ' + fmt(y[n0 - 1], si) + '.');
      else if (m === 1) how = T('Seasonal naive: each month ahead = the same month a year before (the rings).', 'Сезонный наивный: каждый месяц вперёд = тот же месяц годом раньше (кольца).');
      else if (m === 2) how = T('Average of the last 3: every month ahead = the average of ' + span(n0 - 3, n0 - 1) + ', ' + fmt(P.f[0], si) + '.', 'Среднее за 3 месяца: каждый месяц вперёд = среднее за ' + span(n0 - 3, n0 - 1) + ', ' + fmt(P.f[0], si) + '.');
      else how = fut ? T('Straight line through all ' + N + ' months: it climbs ' + fmt(P.L.b, si) + ' a month.', 'Прямая через все ' + N + ' ' + ruM(N) + ': она растёт на ' + fmt(P.L.b, si) + ' в месяц.')
        : T('Straight line through the ' + n0 + ' months before: it climbs ' + fmt(P.L.b, si) + ' a month.', 'Прямая через ' + n0 + ' ' + ruM(n0) + ' до этого: она растёт на ' + fmt(P.L.b, si) + ' в месяц.');
      var say;
      if (fut) say = how + ' ' + T('The range is ± its average miss on the test you chose (' + tested + ', ' + nb(R.mape.toFixed(1) + ' %') + ') — a teaching simplification: a real interval widens with each month ahead.',
        'Диапазон — ± его средний промах на выбранной проверке (' + tested + ', ' + nb(R.mape.toFixed(1) + ' %') + ') — учебное упрощение: настоящий интервал расширяется с каждым месяцем вперёд.');
      else say = T('Hidden: ' + span(n0, N - 1) + ', forecast from the ' + n0 + ' months before. ', 'Скрыто: ' + span(n0, N - 1) + ', прогноз по ' + n0 + ' ' + ruMDat(n0) + ' до этого. ') + how + ' ' +
        T('It misses by <b>' + nb(R.mape.toFixed(1) + ' %') + '</b> a month on average (' + fmt(R.mae, si) + '); over the hidden months it is ' + nb(Math.abs(R.bias).toFixed(1) + ' %') + (R.bias < 0 ? ' too low' : ' too high') + ' in total.',
          'Он ошибается в среднем на <b>' + nb(R.mape.toFixed(1) + ' %') + '</b> в месяц (' + fmt(R.mae, si) + '); за скрытые месяцы в сумме — на ' + nb(Math.abs(R.bias).toFixed(1) + ' %') + (R.bias < 0 ? ' ниже факта.' : ' выше факта.'));
      body.querySelector('.xp-say').innerHTML = say;
      check({ series: si, meth: m, h: h, mode: st.mode, mape: R.mape, mae: R.mae, bias: R.bias, rank: rank },
        { series: si !== start.series, meth: m !== start.meth, h: h !== start.h, mode: st.mode !== start.mode });
    }
    ['mode', 'series', 'meth'].forEach(function (key) {
      body.querySelectorAll('.xp-tg[data-g="' + key + '"] button').forEach(function (b) { b.onclick = function () { st[key] = Number(b.getAttribute('data-o')); redraw(); }; });
    });
    body.querySelector('input[data-k="h"]').addEventListener('input', function (e) { st.h = Number(e.target.value); redraw(); });
    redraw();
    return { redraw: redraw };
  };
})();
