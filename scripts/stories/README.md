# Stories — how a maths day is rebuilt (the founder, 2026-11-01)

His words: *"explanations should be much more clearer, right now i tested it and could not get many things … interaction
things should be improved and try to find something even new"*, then *"change for all the places where it is needed"*.

The model is **Week 6 Day 1**: `w6d1.py` here, the page `docs/weeks/week-06/day-1.md` and its Russian copy. Read both
before writing anything. The engine is `docs/assets/story.js` (its header lists every picture kind and option).

## The clarity rules (every step keeps them)

1. **Small and countable first.** 20 toy loans, a jar of 10 balls, two branches of 100 loans — then the same idea on the
   page's real Nur numbers.
2. **One step = one idea**, at most two short sentences (about 40 words at most). The picture changes at every step,
   and the sentence names what changed, in the picture's colour (`{o|…}` orange, `{g|…}` green, `{b|…}` blue,
   `{p|…}` purple, `{y|…}` amber, `{m|…}` grey — the same colour as the thing in the picture).
3. **A word before its symbol.** A symbol is a nickname introduced once ("we call the number of loans {b|n}").
   No symbol, Greek letter or test name before the idea behind it has been shown.
4. **Every number on the screen is a thing in the picture or comes from the page** (never invented: take it from the
   page's text or compute it with Python and check).
5. **The formula grows during the story** (`f`), piece by piece, coloured like the picture. `fs` is how the voice reads it.
6. **A small question (`ask`) every 3–4 steps**; its `why` points at the picture.
7. **Every new term is a tap-word**: `[[word|one plain line on what it means]]`.
8. **No code in the stories**, except a one-line tip the homework needs (as in w6d1's `X.sf(9)` step).
9. Plain, warm, everyday English; natural Russian (not a word-for-word copy; decimals with a comma in Russian).
   Names and the story world come from the page (Nilufar, Jasur, Kamola, Bekzod, Nur's channels and products).

## What a day gets

- About **5–8 stories** for the day's core ideas (one `###` topic each), 6–12 steps each.
- The day's existing playgrounds (`explore`) and games follow the story they belong to (`after` in TOPICS).
- Every **Day quiz question** of the page and every **homework check** must be answerable from the stories. Read the
  quiz and the homework first and list what they need.
- The old Learn moves, unchanged, into "Going further — the full version" (rebuild.py does it).
- Clips: English — only YouTube links **already on the English page** (its Depth list), with `t=` / `end=` as there,
  in the form `> 🎬 **Didn't get X?** [Author explains it · N min](https://youtu.be/ID?t=S&end=E)`. Russian — the
  Russian page's own `> 🎬` lines, named by a few words (CLIPS_RU). Never invent a link.

## Something new, where it helps

Besides the stories, a day may add **one game-like story** that the topic invites — e.g. "Signal or noise?" (two
groups' numbers; she taps "real" or "luck" in an `ask`, then the `hist` picture runs the luck world and answers), or
"Which test?" (three questions about the data, each an `ask`, leading to the test). Keep them stories (```story),
so they need no new engine.

## Workflow

```
python -I scripts/stories/rebuild.py w6d2        # once: builds the new Learn from w6d2.py
python -I scripts/stories/apply.py w6d2          # after that: rewrites only the story blocks
PYTHONIOENCODING=utf-8 python -I scripts/validate_pages.py week-06    # must end OK, except STALE BANK lines
PYTHONIOENCODING=utf-8 python -I scripts/check_quizzes.py week-06
```

A source file: `from common import build as _b, btn`; `STORIES = [...]`; `TOPICS`, `CLIPS_EN`, `CLIPS_RU`, `GF`
(see rebuild.py's header); `def build(lang): return _b(STORIES, lang)`. Story ids: `w06d2-s1`, `w06d2-s2`, …
English `###` headings must differ from every old `###` heading of the page (the old ones stay in Going further).

## A new picture kind

Only when no kind in story.js can show the idea. Write it in **your own file** (`docs/assets/storyN.js`, given in
your brief), registered as `ALStory.scenes.yourkind = function (host, info) { … return {set: …, act: …}; }`, using
`ALStory`'s helpers and story.css's classes (`sy-bar`, `sy-hot`, `sy-ex`, `sy-mean`, `sy-alarm`, `sy-truth`, `sy-curve`,
`sy-area`, `sy-dot sy-f-o`, …). If it needs its own style, inject one small `<style>` from your file, with a
`html[data-theme="dark"] .sy …` twin. Never edit story.js, story.css, index.html, or another day's files.

## Do not

- commit, push, run build_bank.py, or open the browser (the parent checks every page in the browser and commits);
- change homework, quiz, exam, tasks or the rest of the page outside "## 1. Learn";
- put answers to homework in a story (a method, yes; the homework's number, no).
