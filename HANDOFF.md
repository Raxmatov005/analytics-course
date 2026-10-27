# Hand-off: replace the Telegram "Connect" step with a name + PIN sign-in on the site

> ✅ **Done 2026-10-27.** Worker (bot repo `bot/worker.js`): `POST /signin`, `GET /me`, `/learner Name PIN` and `/learners` for group admins, PINs stored as salted SHA-256, 10 tries per IP per 10 min, site-only learners get the chat id `site:<name>`; `POST /feedback` with `source: "site"` keeps the page's own answer keys. Site: `docs/assets/signin.js` (card + "Signed in as … · sign out" + the `/me` check), used by `sqlrun.js` and `feedback.js`; CSS in `labs.css`; help pages and the Practice day EN + RU. The brief below is kept for reference. The "Also still open" items are still open.

This file is a complete brief for a Claude (or a person) working on another computer. Everything else in the
course redesign is finished and live; this is the one piece that could not be done from the course repository
alone, because the server side lives elsewhere.

## Prompt (copy from here)

You are working on the course site **Analytics Learning — Nur Finance** (repo `Raxmatov005/analytics-course`,
Docsify site in `docs/`, published by GitHub Pages at https://raxmatov005.github.io/analytics-course/). You also
have access to the **bot repository** that holds `bot/worker.js` — a Cloudflare Worker deployed at
`https://nur-feedback-bot.sohajon2005.workers.dev` — and the Telegram bot `@Nur_Analytics_Course_bot`.
Read `REDESIGN-PLAN.md` and `docs/ru/TRANSLATING.md` in the course repo first.

### The situation today

The learner's work is saved on the site instantly, but **sending** anything to the mentor goes through the worker,
and the worker only accepts a **key** that the Telegram bot issues:

- The bot's "Connect the website" reply opens the site with `?wk=<key>`; `docs/assets/sqlrun.js` (`takeKey()`,
  top of the file) stores it in `localStorage["al.wk"]` and strips it from the URL. The key is a 16–64 character
  `[A-Za-z0-9]` string. Every call below sends it.
- `GET  /feedback?key=…&lesson=W1D2` → `{ handedIn, hw, steps:[{key,label,q,choices?}], answers?, date? }`
  (401 when the key is unknown). Used by `docs/assets/feedback.js`.
- `POST /feedback` body `{ key, lesson, answers, source: "site" }` → `{ changed }`. The site's own built-in
  question keys (used when the worker is unreachable) are `difficulty, time, useful, unclear, tools, mood, mentor`;
  the worker's `steps[].key` may differ — the site maps by the worker's steps when it has them.
- `POST /submit` body `{ key, lesson, check, files: { "name.sql": "text" | { b64, type } }, ok: { Q1: true, … } }`
  — the homework hand-in. Used by `docs/assets/sqlrun.js` `workspace()`; `lesson` is like `W2D1`, `check` is a
  key of `checks/checks.json` (e.g. `hw2.1`, `cp1`, `handin-W3D4`, `cap8`).
- Where the "Connect" step is shown on the site (all to be replaced): `sqlrun.js` lines containing
  `BOT + 'connect'` (the hand-in box footer, the Submit button when there is no key, and the "not connected any
  more" message after a 401), and `feedback.js` `connect()`.

### What to build

1. **Worker: a sign-in that issues the same kind of key.**
   - `POST /signin` body `{ name, pin }` → `{ key, name }` or 401. The key must be accepted by `/feedback` and
     `/submit` exactly like a bot-issued key (same learner record, same storage of answers and hand-ins, same
     notifications to the mentor). Rate-limit it (e.g. 10 tries per IP per 10 min) and add CORS for the site's
     origin, like the existing routes.
   - **Who may sign in:** the mentor creates the learner (name + PIN) — this course has one learner at a time —
     through whatever the bot already uses for mentor commands (an admin command in Telegram, or a `MENTOR_TOKEN`
     protected `POST /learners`). Store PINs hashed. Keep the Telegram "Connect" working too: both paths must map
     to the same learner record so progress is one list.
   - `GET /me?key=…` → `{ name }` (200) or 401, so the site can show who is signed in and detect a stale key.
2. **Site: a sign-in card instead of the Connect links** (`docs/assets/sqlrun.js`, `docs/assets/feedback.js`;
   CSS in `docs/assets/labs.css`; every learner-visible string through `T(en, ru)`; ES5 style like the files):
   - A small card "Sign in to send your work" with Name and PIN fields and a Sign in button; on success store the
     key in `localStorage["al.wk"]` (unchanged key name, so nothing else moves) and the name in `al.who`.
   - Show it where the Connect link is today: in the hand-in box footer when there is no key; when Submit is
     tapped without a key (instead of opening Telegram); in `feedback.js` `connect()`; and after a 401 ("signed
     out — sign in again"). Keep the existing `?wk=` path working, so the Telegram route still connects.
   - A one-line "Signed in as <name> · sign out" at the bottom of the hand-in box and the feedback card.
   - Update the two help pages, EN and RU: `docs/homework/how-to-submit.md`, `docs/tools-at-work.md` (and their
     `docs/ru/` mirrors) — "sign in once with the name and PIN your mentor gave you".
3. **Verify** with the real worker: sign in, hand in the Practice day's three queries (`docs/practice.md`), send a
   feedback, see both arrive on the mentor's side; a wrong PIN shows the message and does not store a key;
   English and Russian pages (`#/ru/...`). Run `python scripts/validate_pages.py` before committing.

### Also still open (smaller, independent)

- `videoquiz` stop times (`"at"` seconds) were written from each video segment's topic, not from watching the
  videos. Someone who watches a segment can retime or reword its stops in the page's ```` ```videoquiz ```` block.
- The mentor's `award.py` (not in this repo) rewrites `docs/progress.json`; it must keep the `title_ru` fields the
  Russian pages read.
- Week 1 Day 3 / Week 2 Day 3 count "bucket 0" as loans with an instalment due on the as-of day (14), Week 8 Day 3
  as every loan at DPD 0 (7 429) and says so; unify if you prefer one definition.

## Facts you will need

| Item | Where |
|---|---|
| Site key in the browser | `localStorage["al.wk"]`; set by `?wk=` (`sqlrun.js` `takeKey()`) |
| Worker base URL | `WORKER` constant in `sqlrun.js` and `feedback.js` |
| Telegram bot deep links | `BOT + 'connect'`, `BOT + 'fb_' + lesson` |
| Lesson ids | `W1D2`, `Practice` (`feedback.js` `lessonOf()`) |
| Check ids and fingerprints | `checks/checks.json` (merged by `scripts/merge_checks.py` from `checks/parts/`) |
| Local preview | serve `docs/` on any static server (e.g. `python -m http.server 8000` from `docs/`) |
| Page validation | `python scripts/validate_pages.py` |
