# Tools at work (optional)

<span class="badge">Not needed for this course</span>

> 🧭 **What this page is for.** The installed tools analysts use at work — database apps, Jupyter, GitHub — for the day an interviewer asks *"which tools have you used?"*. Nothing in the course needs them.

Everything in this course runs on its website: the SQL boxes, the [SQL playground](playground.md), the Database panel, the hand-in boxes, and from Week 5 the Python boxes too. **You never have to install anything for SQL.**

This page is for later — a job, or an interview where someone asks *"which tools have you used?"*. Banks run SQL Server or PostgreSQL and people write queries in SSMS, DBeaver or DataGrip; the SQL is the same as here. Do one of these on a free evening, if you like.

## SQL Server Express + SSMS (what most banks use)

1. Download **SQL Server 2022 Express** (free): https://www.microsoft.com/en-us/sql-server/sql-server-downloads → *Express* → run the installer → **Basic**.
2. Download **SQL Server Management Studio (SSMS)**: https://aka.ms/ssmsfullsetup → install → open → *Connect* with the server name the Express installer showed (usually `localhost\SQLEXPRESS`), Windows Authentication.
3. In SSMS: *File → New → Query*. Paste and run (F5):

```sql
CREATE DATABASE nur;
GO
USE nur;
GO
```

4. Open the file `data/sql/sqlserver.sql` from the course folder (*File → Open*). Run the **CREATE TABLE** block first (select it, F5), then the **BULK INSERT** lines. If `BULK INSERT` complains about the path, edit the path to where your course folder is.
5. Check:

```sql
SELECT COUNT(*) AS loans FROM loans;        -- expect 7828
SELECT COUNT(*) AS customers FROM customers; -- expect 6040
```

▶ Baraa shows the same install at [0:22:33](https://youtu.be/SSKVgrwhzus?t=1353&end=2041).


## SQLite with DB Browser (10 minutes)

1. Download **DB Browser for SQLite**: https://sqlitebrowser.org/dl/ → Windows installer → install.
2. *Open Database* → choose `data/raw/nur.db` in the course folder. All 11 tables are already there.
3. Tab *Execute SQL* → paste → Ctrl+Enter:

```sql
SELECT COUNT(*) AS loans FROM loans;  -- expect 7828
```

Differences you will meet: SQLite writes `LIMIT 10` where SQL Server writes `TOP 10`; dates are text in `YYYY-MM-DD`. The pages always show both when they differ.

## Python outside the page: Jupyter

From Week 5 every Python box on the pages has **▶ Run**, with pandas and the course data already loaded. At work you write the same code in a notebook. Two free ways, pick one:

- **Google Colab** — https://colab.research.google.com, nothing to install; upload a notebook from `data/python/` and the CSV files it reads.
- **Anaconda** — https://www.anaconda.com/download → install → open *Jupyter Notebook* in the course folder. Then, once, in a terminal in that folder: `pip install -r requirements.txt`.

The code is the same as on the pages; only the place it runs differs.

## GitHub Desktop — keeping your work in a repository

The other way to hand in, and what analysts do at work: each homework goes in a folder named after its day, like `submissions/week-01/day-1/`. Put your files there and push. The 📎 box on the lesson page does the same job without any of this.

### One-time setup (15 min)

1. Create a free account at https://github.com if you don't have one and send your username to the mentor; you'll be invited to the course repository (accept the e-mail from GitHub).
2. Install **GitHub Desktop**: https://desktop.github.com → sign in → *Clone a repository* → pick the course repo → choose the folder on your PC.
3. Open the folder. `docs/` is the course; `submissions/` is yours.

### Check before you send

Most homework can be checked on your own computer first — the same checks the 🧑‍💻 workspace on the lesson page runs. In a terminal, in the course folder:

```bash
python scripts/check.py list
```

shows which homework can be checked, and for example

```bash
python scripts/check.py hw1.2
```

runs your `bekzod.sql` against the Nur Finance data and answers task by task: **OK** or **NO** with the reason (the query did not run, a number is not the expected one, the row count is off). It never shows the right answer, so a red line means: go back and think, not peek. Write in SQLite or SQL Server, both work. Excel files are checked cell by cell, notebooks are run from the top with all their asserts, and Python scripts are run and their output files counted.

All green? Send it. The mentor still reads your queries, comments and text: the checker proves the numbers, the mentor grades the thinking.

### Each time

1. Create the folder of that day (e.g. `submissions/week-01/day-2/` for Week 1 · Day 2).
2. Save your files there. Use the names the page asks for. SQL in `.sql`, text in `.md`, notebooks in `.ipynb`, workbooks in `.xlsx`, a Power BI page as `.png`.
3. In GitHub Desktop: write a one-line summary (e.g. `HW 1.2 — 10 queries for Bekzod`) → **Commit to main** → **Push origin**.
4. In the course bot, tap **📤 Hand in homework**, pick the homework, then **I pushed it to GitHub instead**. The bot checks that your files are really in GitHub (if one is missing, it tells you which) and lets your mentor know in the 📤 Homework topic.

Can't make GitHub Desktop work? Use the box on the lesson page instead — it counts the same. Pushing files is part of the job.
