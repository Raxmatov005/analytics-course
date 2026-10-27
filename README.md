# Analytics Learning — your 8-week course

From zero to analyst in eight weeks, on the data of Nur Finance, a lending company.

- **Read the course here:** https://raxmatov005.github.io/analytics-course/ — start with *Practice day*, then *Day 0*. English and Russian (the EN | RU switch at the top right).
- **Everything happens on the page:** SQL runs on the real database in the browser; from Week 5 Python (pandas, numpy, matplotlib) runs there too; every practice question has a box that checks itself; homework is handed in from the 📎 box on the page (the site checks the SQL tasks before you submit). GitHub (`submissions/week-NN/day-D/`) stays as the alternative path — see `docs/homework/how-to-submit.md`.
- **The data:** `data/raw/nur.db` (open it with DB Browser for SQLite) and the CSV files next to it; extracts for Excel, Python, Power BI and A/B testing in `data/excel`, `data/python`, `data/powerbi`, `data/ab`.

## For the mentor

- `docs/` is the site (Docsify, GitHub Pages); `docs/ru/` is the Russian copy — rules in `docs/ru/TRANSLATING.md`. The blocks a page can use (`task`, `check`, `game`, `sqllab`, `videoquiz`, `quiz`, `challenge`, `sqltask`, callouts) are documented in `REDESIGN-PLAN.md`.
- `checks/checks.json` holds the fingerprints the site and `scripts/check.py` check homework against. Make a new entry with `python scripts/fingerprint.py sql "SELECT …"` (or `number`, `text`), put it in `checks/parts/week-0N.json`, then `python scripts/merge_checks.py` (it also refreshes `docs/assets/checks.json`, the copy the site reads).
- `python scripts/validate_pages.py` — every JSON block parses, English and Russian match block for block, ids are unique. Run it before you push.
- `python scripts/check.py list` / `python scripts/check.py hw1.2` — check a learner's files handed in through GitHub.
- Hand-ins and feedback reach you through the course bot's worker; the one-time **Connect** step is still Telegram-based — `HANDOFF.md` is the brief for replacing it with a name + PIN sign-in.
