/* "How was today?" (Docsify plugin): a short feedback card at the end of every day page and the practice day.
Its button opens the course bot on this lesson (t.me/<bot>?start=fb_W1D2): the bot checks that her homework is in her
GitHub, then asks the questions with buttons. The same button follows every lesson post in the Telegram group. */
(function () {
  var BOT = 'https://t.me/Nur_Analytics_Course_bot?start=fb_';

  function lessonOf(path) {
    var m = /weeks\/week-(\d\d)\/day-(\d)/.exec(path);
    if (m) return 'W' + Number(m[1]) + 'D' + m[2];
    if (/(^|\/)practice$/.test(path)) return 'Practice';
    return null;
  }

  function draw(vm) {
    var lesson = lessonOf(vm.route.path.replace(/^\//, '').replace(/\.md$/, ''));
    var section = document.querySelector('.markdown-section');
    if (!lesson || !section || section.querySelector('.fb-card')) return;
    var card = document.createElement('div');
    card.className = 'fb-card';
    card.innerHTML =
      '<svg class="al-icon" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>' +
      '<div class="fb-body"><div class="fb-title">How was today?</div>' +
      '<div class="fb-text">Finished the lesson and pushed its homework? Tap below: 7 quick questions in the course bot (2 minutes). ' +
      'Only your mentor reads it — and the course gets better from it.</div>' +
      '<a class="fb-go" target="_blank" rel="noopener" href="' + BOT + lesson + '">Leave feedback on ' + lesson + '</a></div>';
    var pager = section.querySelector('.docsify-pagination-container');  // keep Previous / Next as the very last thing
    section.insertBefore(card, pager || null);
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook, vm) {
    hook.doneEach(function () { draw(vm); });
  });
})();
