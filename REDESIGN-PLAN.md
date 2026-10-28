# Analytics Learning — redesign plan

Goal: every section of every day is something the learner **does**, not something she reads past. Same
content, same 8-week structure, same Nur Finance data — delivered as a product: framed sections, a place
to answer every question, instant checks, games where a concept is best learned by hand, videos that ask
questions, homework that checks itself, feedback that stays on the site.

## 1. What the audit found

Walked the site as a learner (EN and RU), read the engine (`docs/assets/*.js`), the checker
(`scripts/check.py`), the fingerprints (`checks/checks.json`) and the pages.

What already works and stays:
- SQL runs in the browser on the real database (sql.js); every ```` ```sql ```` block is runnable; the
  **Database** panel; the **SQL playground** (her own copy, CRUD allowed).
- From Week 2 on, Practice questions whose answer is SQL already get **"Your query · P1" + ▶ Run + ✔ Check**
  (compares her result with the model answer without showing it).
- Day quiz (one question at a time), daily challenge (hashed answer, XP, streaks), five mini-game types
  (match, order, sort, pick, connect), the course map, the progress board, the hand-in workspace with
  fingerprint checks, the videos panel (plays only the segment).

What is wrong (your points, confirmed):
1. **Design.** Sections are plain headings over plain text; Previous/Next at the bottom is bare text; the
   grey "muted" text is too pale; important instructions ("write your answers down as you go") are
   paragraphs nobody reads. Nothing tells her what a section is *for* or whether she has finished it.
2. **Practice without a place to answer** on every conceptual question (all of Week 1 Day 1, every
   Excel / Python / statistics / Power BI / product day): question → "Answer" fold. No box, no check, no
   record. SQL days are the only ones with a workspace.
3. **Self-check** = three questions with no input. **Stretch** = a sentence with a badge. **Company corner**
   = a table and prose (one game on Day 1, none on most days). **Depth** = links.
4. **Homework** asks for screenshots and pasted notes of things the site can check itself
   (`SELECT COUNT(*) FROM loans` → 7828). No "why" or "how it is graded" in a form she can scan.
5. **Daily challenge** on SQL days asks for a number but gives no editor; she has to scroll back up and
   use some other box.
6. **Video quality** menu sends her to YouTube (YouTube's embed API ignores `setPlaybackQuality` since
   2019 — but the player *does* pick quality from the player's pixel size, so a picker **can** work by
   rendering the player at 1080p/720p/480p size and scaling it to fit). No questions inside videos.
7. **Python weeks** (5–8, 102 code blocks) have no runtime at all: read code, run it elsewhere.
8. **Feedback and hand-in** need a one-time "Connect" through the Telegram bot before anything saves,
   and the feedback card shows "or answer in Telegram". The form itself is already on the page.
9. **CRUD** (create / insert / update / delete) is mentioned on Day 1 but never practised with a check.
10. Flow slips: Day 1 says "tomorrow you write your first query" and runs one in section 2; HW 1.1 asks
    for a screenshot of a box on the same page; Practice P5/P6 ask her to "browse" a table before the
    panel was introduced as a tool for that; several days put the workspace after the theory that needs it.

## 2. The building blocks (what agents build and what pages use)

Everything is a fenced JSON block in Markdown, like the existing `quiz` / `game` / `challenge`, so the
Russian copy stays a 1:1 mirror. New blocks:

### `task` — the universal answer box (Practice, Stretch, Company corner, interview prompts)
```json
{"id": "w01d1-p1", "kind": "choice", "options": ["…"], "answer": 1, "explain": "…", "xp": 1}
{"id": "w01d1-p2", "kind": "multi", "options": ["…"], "answer": [0, 2], "explain": "…"}
{"id": "w01d1-p3", "kind": "number", "answer": 7828, "dp": 0, "unit": "loans", "hint": "…", "model": "…"}
{"id": "w01d1-p4", "kind": "text", "answer": ["foreign key", "fk"], "model": "…"}
{"id": "w01d1-p5", "kind": "free", "min": 20, "model": "…", "rubric": ["names the table", "says why"]}
{"id": "w02d1-p6", "kind": "sql", "model": "SELECT …", "note": "…"}
{"id": "w05d2-p1", "kind": "python", "starter": "import pandas as pd\n…", "answer": 61.4, "dp": 1, "model": "…"}
```
- `choice/multi/number/text`: instant ✓/✗ with the explanation; saved; counts toward the section's done-state.
- `free`: she writes (min words), taps **Compare**, sees the model answer and ticks the rubric lines she
  covered → "Got it / Partly / Missed" is saved. No more reading the fold first.
- `sql`: an editor on her practice copy, ▶ Run, ✔ Check = same comparison as the existing practice boxes
  (`ALSql.compare`). The old `<details><summary>Answer` + SQL pattern keeps working and gets the new frame.
- `python`: an editor with ▶ Run (Pyodide), ✔ Check looks for `answer` among the numbers it printed.
- The question text is the paragraph above the block (as now, `**P1.** …`); the engine frames paragraph +
  block together as one card with the P-number.

### `check` — Self-check becomes a Quick check
```json
{"id": "w01d1-sc", "questions": [ …same question objects as `quiz`… ]}
```
Three questions, one at a time, instant feedback, no pass mark, saved score, 1 XP each.

### `videoquiz` — questions at the end of a video part
```json
{"video": "SSKVgrwhzus", "stops": [
  {"at": 700, "q": "…", "options": ["…"], "answer": 0, "explain": "…"},
  {"at": 1100, "q": "…", "options": ["…"], "answer": 2, "explain": "…", "back": 60}]}
```
`at` = absolute seconds in the video; it only says which part a question belongs to (the part whose start–end
contains it) and the order. Since 2026-10-27 the questions come **when the part has played to its end**, one after
another over the video (also from the end screen's "Answer the questions" button, any time): right → next; wrong →
explanation + "↺ Watch the part again". A stop in the middle could come before the video had shown its answer, because
the times were never checked against the videos. Answers are remembered per browser; `back` is no longer used.

### `game` — four new types (five existing stay)
- `flash` — flashcards: `{"type":"flash","title":"…","cards":[["Portfolio","all loans outstanding, together"],…]}`;
  flip, "Knew it / Again", cards you missed come back, ends with a score.
- `cloze` — fill the gaps by tapping tokens: `{"type":"cloze","text":"SELECT {{0}} FROM loans WHERE {{1}};","blanks":[["COUNT(*)"],["status = 'active'"]],"distractors":["SUM(*)"]}`.
- `build` — build the query from tokens in order: `{"type":"build","q":"…","tokens":["SELECT","COUNT(*)","FROM","loans"],"distractors":["GROUP BY"]}`.
- `bug` — tap the wrong line: `{"type":"bug","q":"One line breaks this query","code":"…","answer":[2],"why":"…"}`.

### `sqllab` — a guided CRUD lab on her own copy of the database
```json
{"id": "w01d2-lab", "title": "Your first table", "intro": "…",
 "steps": [
  {"say": "Create a table my_branches(branch_id INTEGER PRIMARY KEY, name TEXT, region TEXT).", "hint": "CREATE TABLE my_branches (…);",
   "expect": "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='my_branches'", "want": 1},
  {"say": "Insert three branches.", "expect": "SELECT COUNT(*) FROM my_branches", "want": 3},
  {"say": "Change the region of one of them to 'Fergana'.", "expect": "SELECT COUNT(*) FROM my_branches WHERE region='Fergana'", "want": 1},
  {"say": "Delete the one in Fergana.", "expect": "SELECT COUNT(*) FROM my_branches WHERE region='Fergana'", "want": 0}],
 "cleanup": "DROP TABLE IF EXISTS my_branches"}
```
One editor; every ▶ Run executes on her practice copy, then the current step's `expect` is evaluated;
`want` reached → step ✓, next step appears. The Database panel shows her new table live.

### `challenge` — gains an editor
`"sql": true` (or `"python": true`) adds an editor on the practice copy above the answer box.

### `sqltask` (homework) — gains meaning
`"why": "…"`, `"graded": ["…", "…"]`, and SQL tasks that the site checks (`"check"` id + fingerprints).
Screenshot tasks of things the site can verify are replaced by checked SQL tasks. Real artefacts
(an Excel file, a Power BI screenshot, a notebook) stay uploads.

### `pic` — a picture of real rows (2026-10-28)
A small figure drawn from the course database: the primary key circled and labelled, foreign keys circled in amber,
the two cells of a link in one colour (an arrow joins the rows when the tables sit side by side), rows a filter keeps
(green) or drops (struck through), rows coloured by group, a step label between a table and the next ("WHERE …").
The format is at the top of `docs/assets/pics.js`. Keep each table to 3–4 short columns: it must fit a 375 px phone.
Every lesson day of Weeks 1–8 has pictures (87 per language, 2026-10-28); checkpoint days have none, and no picture shows the answer to a task on its page.

### Callouts (plain Markdown, styled by the renderer)
`> 💡 **Key idea.** …` · `> ⚠️ **Watch out.** …` · `> 🎯 **Interview version.** …` ·
`> 🚀 **Stretch (optional, +2 XP).** …` · `> 📖 STORY …` (exists).

### Section frames (automatic, no page change)
Every `##` section is framed by its kind, recognised from the heading (EN and RU): Goals · Learn ·
Worked example · Workspace · Practice · Homework · Quick check · Company corner · Day quiz · Daily
challenge. Each frame has an icon, a one-line "what you do here", and a done-state computed from the
saved results of the blocks inside it. Under the title: **Today's route** — the sections as chips with ✓.
Previous / Next become two cards ("← Day 0 · where do you stand?" / "Next: Day 2 · your first queries →").

## 3. Workstreams and owners (all builders run on Opus; disjoint files)

Phase 1 — engines (parallel)
| # | Workstream | Files it owns |
|---|---|---|
| E1 | Design system: contrast, frames, route bar, pagination, callouts, `task`, `check`, feedback local-first, `sqltask` why/graded | `theme.css`, `index.html`, `sections.js` (new), `task.js` (new), `quiz.js`, `feedback.js`, `nav.js`, `lang.js` |
| E2 | Video: YouTube-style quality picker (by player resolution), remove full-screen from that menu, `videoquiz` | `videos.js`, `videos.css` (new) |
| E3 | Python runtime: Pyodide + pandas, course data files mounted, ▶ Run on python blocks, plots, `ALPy` API for `task` kind python | `pyrun.js` (new), `pyrun.css` (new) |
| E4 | SQL labs & games: `sqllab`, `ALSql` API (editor / compare) for `task` and `challenge`, checks served locally, 4 new game types | `sqlrun.js`, `games.js`, `challenge.js`, `scripts/fingerprint.py` |

Phase 2 — content (parallel with Phase 1; writes blocks to the spec above; EN then RU for each page)
| # | Pages |
|---|---|
| C0 | Start page, practice day, playground, map, progress, how-to-submit, tools-at-work, company/*, Week 0 |
| C1–C8 | Week 1 … Week 8 (five days each) |

Each content agent, per day: a `task` for every Practice question that is not SQL (and `sql`/`python`
tasks where it is), Self-check → `check`, Company corner gets a game + an interview `task`, Stretch gets a
callout + task, Homework rewritten (why / graded / checked SQL), `videoquiz` for every video, a `sqllab`
where the day teaches CRUD/DDL, key ideas as callouts, and fixes to the day's flow (forward references,
sections in the wrong order, instructions that assume a tool not yet introduced). New homework checks go
to `checks/parts/week-0N.json` (merged after).

Phase 3 — integration (me): merge checks, bump asset versions, run every page in the browser (EN + RU:
blocks parse, no console errors, structure parity), a cross-week flow review, commit, push.

## 4. Honest limits
- **In-video questions** are written from each segment's topic and the lesson text, not from a
  transcript (agents cannot watch the videos). They check the idea the segment teaches and are asked when
  the part ends, so their `at` seconds need not be exact. You can reword any stop in the `videoquiz` block.
- **Quality picker**: YouTube still decides the final stream; the picker sets the player's pixel size
  (which is what YouTube bases its choice on), so "1080p" means "ask for 1080p". The menu shows what
  YouTube actually delivers.
- **Telegram**: feedback and hand-in become local-first (saved on the site at once, works offline) and the
  Telegram link disappears from the cards. The *mentor* still receives them through your Cloudflare worker,
  which only accepts a key the bot issues, so the one-time **Connect** step stays until the worker is
  changed. The worker's code (`bot/worker.js`) is not in this repository — give me that repo and I
  replace the bot key with a name + PIN sign-in on the site.
- **Excel and Power BI** cannot run in the page; those days get checked number/text answers, flashcards,
  cloze games and uploads of the real artefact.
- **Python** loads Pyodide (~15 MB, cached after the first time) on the first ▶ Run of a page.

## 5. Status (2026-10-27)

Done and live: every workstream in section 3 (E1–E4, C0–C8), the cross-week flow review, and the integration
pass (all 104 pages, EN + RU, render with no JavaScript errors and identical block counts). Decisions taken at
integration: the homework "why / graded" card is drawn by the hand-in box only (sqlrun.js); video cards are not
required blocks (watching is optional); Submit opens once every task has an answer, not only when every check is
✅; stretch tasks are worth 5 XP (as `docs/rewards.json` says); Quick checks earn no XP.

Done 2026-10-27: the name + PIN sign-in (see `HANDOFF.md`), `award.py` on this repo, one definition of bucket 0, and
video questions asked at the end of each part (no retiming needed).

Done 2026-10-28: the course calendar (`docs/schedule.json`, `assets/schedule.js`, the bot refuses late hand-ins:
lessons open at 00:00 Tashkent, homework closes at 23:59 on its due day, lessons not open yet are hidden; off until
"start" is set) and the `pic` pictures for Weeks 1–8 (tables, plus "bars" and "intervals" charts).
