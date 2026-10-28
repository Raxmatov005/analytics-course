/* Colours in code (the founder, 2026-10-28: "each word should have a colour, like in any SQL tool or VS Code").

The boxes she types in are textareas, which cannot colour words: a coloured copy of the code (Prism, which Docsify
loads) sits right behind each one, in the same font, padding and wrapping, and the textarea's own letters are made
transparent, so she sees the colours and still types, selects and moves the caret in the real box.
ALHi.paint(ta) draws the copy; sqlrun.js calls it from grow(), which runs on every change of the text (pyrun.js goes
through the same grow). SQL boxes are coloured as SQL, .py-edit boxes as Python, prose boxes (.sq-text) not at all.
Static code blocks are coloured by Docsify's Prism; this file adds the grammars Prism lacks for the course's ```excel,
```dax and ```powerquery blocks. One VS Code–like palette for all of them is in theme.css (.token …). */
(function () {
  function langOf(ta) {
    if (ta.classList.contains('sq-text')) return null;
    return ta.classList.contains('py-edit') ? 'python' : 'sql';
  }
  var COPY = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'tabSize', 'paddingTop', 'paddingRight',
    'paddingBottom', 'paddingLeft', 'whiteSpace', 'overflowWrap', 'wordBreak', 'textAlign', 'borderTopWidth', 'borderRightWidth',
    'borderBottomWidth', 'borderLeftWidth'];   // the borders too (task boxes have one), drawn transparent
  function paint(ta) {
    var lang = langOf(ta);
    if (!lang || !window.Prism || !Prism.languages[lang]) return;
    var back = ta._hi;
    if (!back) {
      var cs = getComputedStyle(ta), wrap = document.createElement('div');
      wrap.className = 'hi-wrap';
      wrap.style.backgroundColor = cs.backgroundColor;
      ta.parentNode.insertBefore(wrap, ta);
      back = document.createElement('pre');
      back.className = 'hi-back lang-' + lang;
      back.setAttribute('aria-hidden', 'true');
      wrap.appendChild(back);
      wrap.appendChild(ta);
      ta.classList.add('hi-on');
      ta._hi = back;
      ta.addEventListener('scroll', function () { back.scrollTop = ta.scrollTop; back.scrollLeft = ta.scrollLeft; });
      ta.addEventListener('input', function () { paint(ta); });   // also when a page script changes it without grow()
    }
    var cs2 = getComputedStyle(ta);
    COPY.forEach(function (k) { back.style[k] = cs2[k]; });
    back.style.borderStyle = 'solid'; back.style.borderColor = 'transparent';
    var v = ta.value;
    // a last empty line is not drawn by a <pre>: a space keeps the copy as tall as the box
    back.innerHTML = Prism.highlight(v, Prism.languages[lang], lang) + (v === '' || /\n$/.test(v) ? ' ' : '');
    back.scrollTop = ta.scrollTop;
  }
  window.ALHi = { paint: paint };
  /* a box measured before the code font arrived wraps differently once it does: grow every box again then */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () {
    if (window.ALGrow) document.querySelectorAll('textarea.sq-edit').forEach(function (ta) { window.ALGrow(ta); });
  });

  /* grammars for the course's other code blocks, defined before Docsify renders a page */
  function grammars() {
    if (!window.Prism || Prism.languages.dax) return;
    /* SQL as a SQL editor shows it: the name after AS is an alias, the name after FROM / JOIN / WITH / INTO / UPDATE /
       TABLE (or before "AS (" in a WITH list) is a table; every other plain name is a column (the text colour) */
    Prism.languages.insertBefore('sql', 'keyword', {
      'table-name': [
        { pattern: /(\b(?:FROM|JOIN|INTO|UPDATE|TABLE|EXISTS|WITH)\s+)(?!(?:IF|NOT|SELECT|RECURSIVE)\b)[A-Za-z_][\w.]*/i, lookbehind: true },
        { pattern: /\b[A-Za-z_]\w*(?=\s+AS\s*\()/i }
      ],
      alias: {
        pattern: /(\bAS\s+)(?!(?:INTEGER|INT|TEXT|REAL|NUMERIC|DATE|DATETIME|VARCHAR|NVARCHAR|CHAR|DECIMAL|FLOAT|BIGINT|BOOLEAN|DOUBLE)\b)[A-Za-z_]\w*/i,
        lookbehind: true
      }
    });
    Prism.languages.dax = {
      comment: /\/\/.*|--.*|\/\*[\s\S]*?\*\//,
      string: /"(?:[^"]|"")*"/,
      property: /(?:'[^'\n]+'|\b[A-Za-z_][\w.]*)?\[[^\]\n]+\]/,   // table[column], [Measure]
      keyword: /\b(?:VAR|RETURN|IN|NOT|AND|OR|ASC|DESC)\b/,
      boolean: /\b(?:TRUE|FALSE)\b(?!\s*\()/,
      'function': /\b[A-Z][A-Z0-9.]*(?=\s*\()/,
      number: /\b\d+(?:\.\d+)?\b/,
      operator: /&&|\|\||<>|<=|>=|[-+*\/=<>&]/,
      punctuation: /[(),]/
    };
    Prism.languages.excel = {
      string: /"(?:[^"]|"")*"/,
      property: /\b[A-Za-z_]\w*\[(?:[^\]\n]|\]\])*\]|\[@?[^\]\n]+\]/,   // tblLoans[outstanding], [@dpd]
      variable: /(?:\b\w+!)?\$?\b[A-Z]{1,3}\$?\d+(?::\$?[A-Z]{1,3}\$?\d+)?\b/,   // A2, $B$1, Lookup!$A$3:$F$7
      boolean: /\b(?:TRUE|FALSE)\b(?!\s*\()/,
      'function': /\b[A-Z][A-Z0-9.]*(?=\()/i,
      number: /\b\d+(?:\.\d+)?%?/,
      operator: /<>|<=|>=|[-+*\/^&=<>]/,
      punctuation: /[(),;{}]/
    };
    Prism.languages.powerquery = {
      comment: /\/\/.*|\/\*[\s\S]*?\*\//,
      string: /"(?:[^"]|"")*"/,
      keyword: /\b(?:let|in|each|if|then|else|and|or|not|type|true|false|null)\b/,
      'function': /\b[A-Z]\w*(?:\.\w+)+(?=\s*\()/,
      number: /\b\d+(?:\.\d+)?\b/,
      operator: /=>|<>|<=|>=|[-+*\/=<>&]/,
      punctuation: /[(),{}\[\];]/
    };
  }
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.init(grammars);
    hook.beforeEach(function (md) { grammars(); return md; });
  });
})();
