# How to submit homework

## The easy way — on the lesson page (no installs)

Every homework has a box at the end of its section:

- **SQL homework** — the *workspace*: write each query, **▶ Run**, **✔ Check** (✅ or ❌ with why), fix, and **📤 Submit** when all are ✅.
- **Everything else** — **📎 Hand in here**: write your notes in the box, attach files (Excel, notebooks, Power BI, images, PDFs), **📤 Submit**.

The first time, the box shows **🔑 Connect this website to the course bot** — tap it once, then Submit works in this browser. Your mentor gets your work in 📤 Homework, and your feedback comes back there.

## The computer way (optional) — GitHub Desktop

What analysts do at work: each homework names a folder like `submissions/week-01/day-1/`. Put your files there and push.

### One-time setup (15 min)

1. Create a free account at https://github.com if you don't have one and send your username to the mentor; you'll be invited to the course repository (accept the e-mail from GitHub).
2. Install **GitHub Desktop**: https://desktop.github.com → sign in → *Clone a repository* → pick the course repo → choose the folder on your PC.
3. Open the folder. `docs/` is the course; `submissions/` is yours.

## Check before you send

Most homework can be checked on your own computer first. In a terminal, in the course folder:

```bash
python scripts/check.py list
```

shows which homework can be checked, and for example

```bash
python scripts/check.py hw1.2
```

runs your `bekzod.sql` against the Nur Finance data and answers task by task: **OK** or **NO** with the reason (the query did not run, a number is not the expected one, the row count is off). It never shows the right answer, so a red line means: go back and think, not peek. Write in SQLite or SQL Server, both work. Excel files are checked cell by cell, notebooks are run from the top with all their asserts, and Python scripts are run and their output files counted.

All green? Send it. The mentor still reads your queries, comments and text: the checker proves the numbers, the mentor grades the thinking.

## Each time

1. Create the folder the page names (e.g. `submissions/week-01/day-2/`).
2. Save your files there. Use the names the page asks for. SQL in `.sql`, text in `.md`, screenshots in `.png`, notebooks in `.ipynb`, workbooks in `.xlsx`.
3. In GitHub Desktop: write a one-line summary (e.g. `HW 1.2 — 10 queries for Bekzod`) → **Commit to main** → **Push origin**.
4. In the course bot, tap **📤 I pushed my homework** and pick the homework. The bot checks that your files are really in GitHub (if one is missing, it tells you which) and lets your mentor know in the 📤 Homework topic.

Can't make GitHub Desktop work? Use the box on the lesson page instead — it counts the same. Pushing files is part of the job.

## What comes back

Within a day you'll find `FEEDBACK.md` in your folder: what is right, what is wrong and **why**, how to fix it, and your points. Fix what it says and push again if you want the fix reviewed (you don't lose points for a second try).

## Writing good answers

- A query answer = the query **and** the result (number or first rows). A number without the query gets half the points; a query that doesn't run gets none, so run it.
- A text answer = your words. If you copied a sentence, say where from.
- When you're not sure, write what you tried. Partial thinking is graded; a blank is not.
