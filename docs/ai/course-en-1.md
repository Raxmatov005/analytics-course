The Analytics Learning course — the full text for an AI helper. Answers to the tasks are deliberately left out.
Part 1 of 3: weeks 0–3.


=====
PAGE: Analytics Learning — from zero to analyst in 9 weeks (README.md)
LINK: https://raxmatov005.github.io/analytics-course/#/README
=====

# Analytics Learning — from zero to analyst in 9 weeks

> STORY You have just been hired as the first data analyst of **Nur Finance**, a lending company with branches in eight regions, a mobile app and five loan products. Every week a different team comes to you with a real request. By week 8 you run the company's numbers — and you can walk into any analyst interview and talk like someone who has done the job.

> 🧭 **What this page is for.** Your front door: what the course is, how one day works, what counts, and where to click first.

## Start here

1. **[Practice day](practice.md)** — 30 minutes, nothing counts. You run a query, answer in a box, let the site check it, hand it in and try the quiz once.
2. **[Day 0 — where do you stand?](weeks/week-00/day-0.md)** — five short self-tests and your plan. Score 80 %+ on a module and you skip that week (you still do its checkpoint, Day 5).
3. **[Week 1 · Day 1](weeks/week-01/day-1.md)** — the real work starts: how a company keeps its data.

> 💡 **Key idea.** You learn by doing. Every section of a day gives you something to do — a box to answer in, a query to run, a game, a video that stops to ask — and the site tells you at once whether you are right.

## How this course works

- **Nine weeks, one page per day, about 3 hours.** One lesson opens each day on your calendar (the menu shows when the next one opens); Day 5 of every week is a checkpoint or a bigger homework.
- **One dataset for everything:** the Nur Finance database (11 tables, 6,040 customers, 7,828 loans). You will know it like your own flat by week 3.
- **Skip what you know.** [Day 0](weeks/week-00/day-0.md) decides which weeks you take in full.
- **The [course map](map.md)** shows where you are; the [progress board](progress.md) shows your XP, level and rewards.
- **Depth is optional.** Every day links to the exact video minute or deck page if you want more; nothing depends on it. The full map is in [Sources](sources.md).
- **Going further, also optional.** Some days end with a *Going further* section: one more thing the job uses (trends and forecasting, IFRS 9 provisions, a data dictionary, a weekly report as a script, Git), with its own Explore box and practice. The day counts as done without it.
- **What you learnt comes back.** From Week 2, every day quiz adds up to three questions from earlier weeks (they do not count toward the pass mark), and [My mistakes](mistakes.md) gathers every question you got wrong, to retry before a checkpoint.

## How a day works

Every day page has the same route. Under its title, **Today's route** shows the sections as chips that tick ✓ as you finish them.

| Section | What you do | Done when |
|---|---|---|
| **Learn** | read short explanations; run every SQL box with ▶ Run | you have read it |
| **Worked example** | follow one real Nur Finance request from question to answer | you have run it |
| **Practice** | answer every question in its box — a choice, a number, a word, a query or a short text — and see ✓ or ✗ at once | every box is answered |
| **Homework** | the box at the end: SQL tasks the site checks itself, the rest written or attached; **📤 Submit** ([how](homework/how-to-submit.md)) | it is submitted |
| **Self-check** | a Quick check: three questions, one at a time, with explanations | all three answered |
| **Company corner** | how a lending company works: a game and an interview question | the game and the box |
| **Day quiz** | pass with **80 %** — retry as often as you like | passed: the day is done |
| **Daily challenge** | one harder bonus question, with its own editor on SQL days | solved |

Day 5 of every week is the checkpoint: the checkpoint's parts (A, B, C) and one 📎 hand-in box take the place of Learn → Homework; the Day quiz and the Daily challenge stay. Week 8 · Days 3–5 are the capstone, with a route of their own. From Week 3 on, **Day 6** is a section exam: a 25-question quiz (Part A) and eight written answers you hand in (Part B). On a day with no new homework, its Homework section says which earlier homework is due.

> ⚠️ **Watch out.** Answer before you look. A ❌ never shows the answer — it means *look again*. On written answers you see the model only after you write yours and tap **Compare**.

## The tools on the page

- **SQL in the page.** Every SQL box has **▶ Run** and works on the full Nur Finance database. Nothing to install.
- **The Database panel.** **Database** at the bottom right: every table, its columns and keys; **Show rows** shows its first 10 rows. Tap a name to put it in your query.
- **The [SQL playground](playground.md).** Your own copy of the database: create tables, change rows, delete them — with a guided lab that checks each step. **↺ Reset** brings the original back.
- **Python in the page (from Week 5).** Python boxes get **▶ Run**, with pandas and the course data already loaded. The first run on a page downloads the engine once (about 15 MB).
- **Games.** Flashcards, matching, sorting, fill-the-gaps, build-the-query and find-the-bug — for the things best learned by hand.
- **Videos with questions.** A video plays only the minutes you need and stops to ask; a wrong answer offers *↺ watch that bit again*.
- **Excel and Power BI** run on your computer (weeks 4 and 7). The page checks the numbers you type and takes the file as an upload.

## What counts toward progress

- **A day is done** when you pass its quiz with 80 % or more: a tick in the sidebar, a day of your streak, XP.
- **Your answers in the boxes** are saved in this browser — and, while you are signed in, with your sign-in — and tick off the day's sections. A Self-check is for you — it shows what stuck, and earns no XP.
- **Homework and checkpoints** earn the points your mentor gives, with written feedback within a day. **✔ Check** each SQL task first — it tells you task by task whether your numbers are right, without showing the answers.
- **Daily challenges** earn XP that grows with your challenge streak; a hidden *lucky day* in every week pays double.
- **Checkpoints** passed with 70 %+ win a voucher, each bigger than the last; XP takes you from Intern to Lead Analyst. All the rules: [progress & rewards](progress.md).

> ⚠️ **Watch out.** Stay signed in. While you are signed in (with the name and PIN your mentor gave you), your ticks and saved answers are copied to the course bot and come back on any device where you sign in. Without signing in they live only in this browser, and clearing its data loses them.

## The 9 weeks

| Week | You become able to… | Checkpoint (Day 5) |
|---|---|---|
| [0](weeks/week-00/day-0.md) | know where you stand | your personal plan |
| [1](weeks/week-01/day-1.md) | read a company's data model and query one table | design a schema + 20 queries |
| [2](weeks/week-02/day-1.md) | answer real questions across tables: joins, aggregates, dates, CASE | 25 medium tasks |
| [3](weeks/week-03/day-1.md) | do analyst-grade SQL: window functions, CTEs, views, performance | EDA report on the loan book |
| [4](weeks/week-04/day-1.md) | clean and report in Excel/Sheets: functions, lookups, pivots, Power Query | cleaned dataset + one-page report |
| [5](weeks/week-05/day-1.md) | analyse in Python: pandas, plots, notebooks | week-3 report redone in pandas |
| [6](weeks/week-06/day-1.md) | reason with statistics: distributions, intervals, tests, power | CI homework + test-choice quiz |
| [7](weeks/week-07/day-1.md) | run an A/B test and build a Power BI dashboard | A/B notebook + 3-page dashboard |
| [8](weeks/week-08/day-1.md) | think in product metrics and present a story | capstone + mock interview |
| [9](weeks/week-09/day-1.md) | judge a credit scorecard and place the approval cut-off | the scorecard review |

Running through all nine weeks: the **Company & metrics** track — the loan lifecycle, DPD / FPD / SPD / TPD, portfolio metrics, product metrics, and who does what in a lending company. [Glossary](company/glossary.md) · [Who does what](company/roles.md).

## Week 1 — Data & SQL basics

| Day | Page | Homework |
|---|---|---|
| 1 | [How a company keeps its data](weeks/week-01/day-1.md) — tables, keys, your SQL workspace, loan lifecycle | HW 1.1 (due D3) |
| 2 | [Your first queries](weeks/week-01/day-2.md) — SELECT, WHERE, ORDER BY, approval rate | HW 1.2 (due D4) |
| 3 | [Tables that talk to each other](weeks/week-01/day-3.md) — ER model, normalisation, DDL/DML, DPD & FPD | — |
| 4 | [Warehouses, stars and a detective case](weeks/week-01/day-4.md) — OLTP/OLAP, star schema, duplicate customers | HW 1.3 (due D5) |
| 5 | [Checkpoint](weeks/week-01/day-5.md) — design Nur Pay, 20 queries, 8 interview questions | Checkpoint 1 |

## Week 2 — SQL for analysts

| Day | Page | Homework |
|---|---|---|
| 1 | [Joining tables — the loan with its customer](weeks/week-02/day-1.md) — INNER/LEFT JOIN, three tables, outstanding vs overdue | HW 2.1 (due D3) |
| 2 | [Counting and summing — the portfolio in numbers](weeks/week-02/day-2.md) — GROUP BY, HAVING, set operators, disbursements & approval rate by channel | — |
| 3 | [Strings, numbers and dates — cleaning as you query](weeks/week-02/day-3.md) — text/number/date functions, DPD computed | HW 2.2 (due D5) |
| 4 | [NULLs, CASE and the tricky joins](weeks/week-02/day-4.md) — NULL rules, CASE buckets, anti-joins, FPD30 by vintage | — |
| 5 | [Checkpoint — 25 questions from four teams](weeks/week-02/day-5.md) | Checkpoint 2 |

## Week 3 — Advanced SQL

| Day | Page | Homework |
|---|---|---|
| 1 | [Window functions: a total next to every row](weeks/week-03/day-1.md) — OVER, PARTITION BY, shares, running totals; portfolio mix | HW 3.1 (due D3) |
| 2 | [Ranking and looking sideways](weeks/week-03/day-2.md) — ROW_NUMBER, RANK, LAG/LEAD; duplicate payments; roll rates | — |
| 3 | [Subqueries, CTEs and the vintage curve](weeks/week-03/day-3.md) — EXISTS, CTE chains, recursive calendar; vintage analysis | — |
| 4 | [Views, temp tables and making it fast](weeks/week-03/day-4.md) — the warehouse layer, indexes, execution plans | HW 3.2 (due D5) |
| 5 | [Checkpoint: the loan-book EDA report](weeks/week-03/day-5.md) | Checkpoint 3 |
| 6 | [Exam 1 — SQL (Weeks 1–3)](weeks/week-03/day-6.md) | Exam (due W4 D1) |

## Week 4 — Excel & Sheets

| Day | Page | Homework |
|---|---|---|
| 1 | [Excel for analysts: the sheet is a table](weeks/week-04/day-1.md) — Tables, SUMIFS/COUNTIFS, text functions; approval rate by channel | HW 4.1 (due D3) |
| 2 | [Lookups and dynamic arrays](weeks/week-04/day-2.md) — VLOOKUP, INDEX/MATCH, XLOOKUP, FILTER/UNIQUE, conditional formatting; DPD buckets | — |
| 3 | [Cleaning dirty data: Find & Replace to Power Query](weeks/week-04/day-3.md) — duplicates, bad dates, Power Query pipeline; collection rate | HW 4.2 (due D5) |
| 4 | [Pivot tables and charts: the one-page report](weeks/week-04/day-4.md) — pivots, slicers, chart choice; the portfolio one-pager | — |
| 5 | [Checkpoint: cleaned dataset + one-page report](weeks/week-04/day-5.md) | Checkpoint 4 |
| 6 | [Exam 2 — Excel](weeks/week-04/day-6.md) | Exam (due W5 D1) |

Data for the week: `data/excel/` (CSV extracts + `nur_week4_start.xlsx`).

## Week 5 — Python for analysis

| Day | Page | Homework |
|---|---|---|
| 1 | [Python from zero: the notebook is your lab](weeks/week-05/day-1.md) — Jupyter, types, loops, functions, csv; the annuity formula | HW 5.1 (due D3) |
| 2 | [pandas I: the DataFrame is a table you can talk to](weeks/week-05/day-2.md) — read, filter, sort, dates, NaN, pd.cut; buckets and PAR | — |
| 3 | [pandas II: groupby, merge and the cleaning pipeline](weeks/week-05/day-3.md) — aggregations, joins, dedupe; DPD and FPD in pandas | HW 5.2 (due D5) |
| 4 | [Charts and the SQL bridge](weeks/week-05/day-4.md) — matplotlib, seaborn, read_sql; the figure pack | — |
| 5 | [Checkpoint: the EDA report, in pandas](weeks/week-05/day-5.md) | Checkpoint 5 |
| 6 | [Exam 3 — Python and pandas](weeks/week-05/day-6.md) | Exam (due W6 D1) |

Notebooks for the week: `data/python/` (starters + checkpoint template); install with `pip install -r requirements.txt`.

## Week 6 — Statistics

| Day | Page | Homework |
|---|---|---|
| 1 | [Probability and distributions: how random is a default?](weeks/week-06/day-1.md) — binomial, Poisson, normal, Bayes; expected loss | HW 6.1 (due D3) |
| 2 | [Samples, the CLT and confidence intervals](weeks/week-06/day-2.md) — standard error, Wilson, bootstrap; reporting a rate honestly | HW 6.2 (due D5) |
| 3 | [Hypothesis tests I: is the difference real?](weeks/week-06/day-3.md) — p-values, z, chi-square, t/Welch, effect size; the risk committee note | — |
| 4 | [Hypothesis tests II: non-parametric, multiple comparisons, power](weeks/week-06/day-4.md) — Mann–Whitney, Holm, sample size | — |
| 5 | [Checkpoint: intervals and the test-choice quiz](weeks/week-06/day-5.md) | Checkpoint 6 |
| 6 | [Exam 4 — Statistics](weeks/week-06/day-6.md) | Exam (due W7 D1) |

Notebooks for the week: `data/python/week6/`.

## Week 7 — A/B testing & Power BI

| Day | Page | Homework |
|---|---|---|
| 1 | [Designing an A/B test: before you touch the data](weeks/week-07/day-1.md) — metrics, guardrails, sample size, SRM, peeking; guardrails in lending | HW 7.1 (due D3) |
| 2 | [Analysing the A/B test: the result, the traps, the decision](weeks/week-07/day-2.md) — sanity checks, lift with CI, segments; the readout | — |
| 3 | [Power BI I: get data, Power Query, the model](weeks/week-07/day-3.md) — star schema, relationships, grain | HW 7.2 (due D5) |
| 4 | [Power BI II: DAX and visuals that tell the story](weeks/week-07/day-4.md) — CALCULATE, time intelligence; the three-page dashboard | — |
| 5 | [Checkpoint: A/B notebook + 3-page dashboard](weeks/week-07/day-5.md) | Checkpoint 7 |
| 6 | [Exam 5 — A/B tests and Power BI](weeks/week-07/day-6.md) | Exam (due W8 D1) |

Data for the week: `data/ab/` (the experiment), `data/powerbi/` (model tables + `measures.dax`), notebooks in `data/python/week7/`.

## Week 8 — Product analytics, capstone, interview

| Day | Page | Homework |
|---|---|---|
| 1 | [Product analytics I: metrics that matter, funnels and retention](weeks/week-08/day-1.md) — metric trees, the app funnel, repeat borrowing | — |
| 2 | [Product analytics II and the company day](weeks/week-08/day-2.md) — unit economics, storytelling, a lending company end to end, your CV | HW 8.1 (due D3) |
| 3 | [Capstone I: the brief and the analysis](weeks/week-08/day-3.md) — the 2026 portfolio review for the board | — |
| 4 | [Capstone II: dashboard and story](weeks/week-08/day-4.md) | — |
| 5 | [Presentation day, the mock interview, and what next](weeks/week-08/day-5.md) | Capstone + mock interview |
| 6 | [Exam 6 — Product analytics and the job](weeks/week-08/day-6.md) | Exam (due W9 D1) |

## Week 9 — Credit risk models

The lending specialisation, after the capstone: Nilufar asks whether the scorecard built two years ago still works, and whether the approval cut-off sits in the right place.

| Day | Page | Homework |
|---|---|---|
| 1 | [Correlation and linear regression: what moves the monthly payment?](weeks/week-09/day-1.md) | HW 9.1 (due D3) |
| 2 | [Logistic regression and the scorecard: from a score to a probability of going bad](weeks/week-09/day-2.md) | HW 9.2 (due D4) |
| 3 | [Is the scorecard any good? ROC, AUC, Gini, KS](weeks/week-09/day-3.md) | HW 9.3 (due D5) |
| 4 | [The cut-off and watching the model: approval vs bad rate, profit, PSI](weeks/week-09/day-4.md) | HW 9.4 (due D5) |
| 5 | [Checkpoint: the scorecard review for the risk committee](weeks/week-09/day-5.md) | Checkpoint 9 |
| 6 | [Final exam — credit risk and the whole course](weeks/week-09/day-6.md) | Exam (due the same day) |

Before any interview: the [interview bank](company/interview.md) — 35 questions with model answers.

## Tools (free)

Weeks 1–3 need only this website (SQL runs on the pages), and from week 5 the Python boxes run on the pages too. Later you also need Excel or Google Sheets (week 4) and Power BI Desktop (week 7, Windows). Optional, for the job: Jupyter via Anaconda or Google Colab, and a GitHub account — see [Tools at work](tools-at-work.md).


=====
PAGE: Course map (map.md)
LINK: https://raxmatov005.github.io/analytics-course/#/map
=====

# Course map

> 🧭 **What this page is for.** The whole course on one screen: where you are, what is finished, and what comes next. Tap any day to open it.

One level per week, from Day 0 to the final exam at the end of Week 9. Every week is a level; its Friday checkpoint is the **boss**: beat it with 70 % or more to clear the level and win that week's voucher. A day turns green when you pass its quiz, a star means you solved its daily challenge, and somewhere in every week hides a **lucky day** — you will know it when you open it.

Nothing is really locked: you can open any day from here or from the menu. The lock only shows how far ahead it is.

<div id="al-map">Loading your map…</div>


=====
PAGE: Tools at work (optional) (tools-at-work.md)
LINK: https://raxmatov005.github.io/analytics-course/#/tools-at-work
=====

# Tools at work (optional)

<span class="badge">Not needed for this course</span>

> 🧭 **What this page is for.** The installed tools analysts use at work — database apps, Jupyter, GitHub — for the day an interviewer asks *"which tools have you used?"*. Nothing in the course needs them.

Everything in this course runs on its website: the SQL boxes, the [SQL playground](playground.md), the Database panel, the hand-in boxes, and from Week 5 the Python boxes too. **You never have to install anything for SQL.** To send your work to your mentor you sign in once on each device, with the name and PIN your mentor gave you.

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


=====
PAGE: Source map (sources.md)
LINK: https://raxmatov005.github.io/analytics-course/#/sources
=====

# Source map

> 🧭 **What this page is for.** Depth, not duty: every video minute and deck page the days point to, in one list. Nothing in the course depends on it.

Everything the course links to lives here, with the exact place to open. The daily
pages are complete without these; they are the depth reading.

## A. SQL video — Data with Baraa, "SQL Full Course for Beginners (30 Hours)"

Video: https://youtu.be/SSKVgrwhzus · Slides and scripts: https://github.com/DataWithBaraa/sql-ultimate-course
(`02_docs/` slides per chapter, `03_scripts/` every query). Baraa uses SQL Server; the same commands work on our Nur Finance data.

A link like `[▶ 2:08:03](https://youtu.be/SSKVgrwhzus?t=7683&end=10077)` opens the video at that chapter.

| Chapter | Start | Course day |
|---|---|---|
| Introduction to SQL | 0:07:38 | W1 D1 |
| Setup your environment | 0:22:33 | W1 D1 |
| Query data (SELECT) | 0:34:01 | W1 D2 |
| DDL commands | 1:32:31 | W1 D3 |
| DML commands | 1:43:44 | W1 D3 |
| Filtering data | 2:08:03 | W1 D2, W2 D1 |
| SQL joins (basics) | 2:47:57 | W2 D1 |
| SQL joins (advanced) | 3:27:29 | W2 D2 |
| Set operators | 4:02:09 | W2 D2 |
| SQL functions / String | 4:47:41 / 4:52:58 | W2 D3 |
| Numeric functions | 5:18:44 | W2 D3 |
| Date and time functions | 5:22:48 | W2 D3 |
| NULL functions | 6:59:06 | W2 D4 |
| CASE statement | 8:07:50 | W2 D4 |
| Aggregate functions | 8:43:36 | W2 D4 |
| Window functions basics | 8:50:11 | W3 D1 |
| Window aggregate | 9:47:00 | W3 D1 |
| Window ranking | 10:53:09 | W3 D2 |
| Window value | 11:56:05 | W3 D2 |
| Subqueries | 12:58:04 | W3 D3 |
| CTE | 14:18:08 | W3 D3 |
| Views | 15:35:02 | W3 D4 |
| CTAS and temp tables | 16:36:40 | W3 D4 |
| Stored procedures / Triggers | 17:27:04 / 18:12:58 | W3 D4 (optional) |
| Indexes / Execution plan | 18:23:42 / 20:20:31 | W3 D4 |
| 30x performance tips | 21:43:39 | W3 D4 |
| Project: EDA | 27:41:51 | W3 D5 |
| Project: Advanced analytics | 28:30:38 | W3 D5 (stretch) |
| Project: Data warehouse (bronze/silver/gold) | 23:21:04 | W1 D4 (watch the first 20 min), optional later |

## B. TBC Uz "Data Analytics 2.0" (Russian) — `sources/tbc-da-2.0/files/`

Not in git (767 MB). Open from the folder on the PC. Page ranges are given on the day pages.

| Module | File | Course week |
|---|---|---|
| 1.1 Database fundamentals | `1.1 Database Fundamentals.pdf` | W1 D1 |
| 1.2 Modelling & normalisation | `1.2 Database Modeling & Normalization.pdf` | W1 D3 |
| 1.3 NoSQL, OLAP/OLTP, architecture | `1.3 NoSQL, OLAPOLTP & Data Architecture.pdf` | W1 D4 |
| 1.4 Star & snowflake | `1.4 Dimensional Modeling Star & Snowflake Schemas.pdf` | W1 D4 |
| 2.1 SQL (parts 1–46, 47–77) | `2.1 SQL-1-46.pdf`, `2.1 SQL-47-77.pdf` | W1 D2, W2 |
| 2.2 SQL | `2.2 SQL-1-38.pdf` | W2 |
| 2.3 SQL | `2.3 SQL.pdf` | W3 |
| 2.4 SQL advanced | `2.4 SQL Advanced.pdf` | W3 |
| 3.1–3.3 Excel | `Logic Math Text Functions.xlsx`, `3.2 Lookups.xlsx`, `3.3 Pivot.xlsx` | W4 |
| 4.1–4.5 Python | `4.1 Python.pdf`, `En_4.2_Python.pdf`, `4.3_Python.pdf`, `4.4_Python.pdf`, `4.5_Python.pdf` | W5 |
| 5.1–5.5 Statistics | `5.1 Basics of Probability Theory.pdf`, `5.2 Statistics & Probability Theory.pdf`, `MS_lecture3.pdf`, `Параметрические тесты (2).pdf`, `Непараметрические тесты_latest.pdf`; notebooks `MS1…MS6*.ipynb`, `примеры стат_тестов в python.ipynb`, `non-parametric.ipynb`, `power.ipynb` | W6 |
| 6.1–6.2 A/B testing | `6.1 Introduction.pdf`, `6.2 A_B Testing.pdf`, `Lecture6.2 - *.ipynb` | W7 |
| 7.1–7.3 Power BI | `7_1_Introduction_to_BI_tools…pptx`, `Power BI 7.2.pptx`, `Power BI 7.3.pptx`, `Power BI 7.*.pbix`, `Подробное руководство по DAX.pdf` | W7 |
| 8.1 Product analytics | `8.1 Product Analytics.pptx` | W8 |
| Soft skills | `Soft Skills Как прокачать резюме.pptx` | W8 |
| Lecture recordings kept by the export | `video1256130814.mp4` (4.1 Python), `video1414856026.mp4` (5.3 Estimation) | W5, W6 |

## C. Free practice sites (extra, never required)

- https://sqlbolt.com — interactive SQL from zero.
- https://www.sql-practice.com — hospital database, Easy/Medium/Hard.
- https://seeing-theory.brown.edu — visual probability and statistics.


=====
PAGE: How to submit homework (homework/how-to-submit.md)
LINK: https://raxmatov005.github.io/analytics-course/#/homework/how-to-submit
=====

# How to submit homework

> 🧭 **What this page is for.** How homework travels from the lesson page to your mentor and back — and what the site checks for you before anyone reads it.

## On the lesson page — the normal way (no installs)

Every homework ends with a box. There are two kinds, sometimes both in one box:

- **🧑‍💻 Your workspace — SQL tasks.** Write each query, **▶ Run**, **✔ Check**. The site checks the numbers itself — ✅, or ❌ with the reason (the query did not run, a number is off, the row count is wrong) — on an untouched copy of the data, so nothing you did in the [SQL playground](playground.md) can spoil it. A ❌ never shows the answer: it means *look again*.
- **📎 Hand in — everything else.** Text parts go straight in the box (a few lines at least). Files — an Excel workbook, a notebook, a Power BI screenshot or file, a PDF — go in with **📎 Choose file**, up to 5 MB each.

**📤 Submit** opens when every required part is ✅ or filled in. It sends your queries **with the first rows of their results**, your texts and your files. Your mentor is told in the group's **📤 Homework** topic, and the box shows **✅ submitted** with the date. Your work in progress is saved in this browser, so you can stop and come back.

> 💡 **Key idea.** No screenshots of things the page can check. Your query and its result travel with the submission; the site has already compared the numbers. Upload only what the page cannot run: a workbook, a notebook, a dashboard.

## Sign in once

The site asks you to sign in the first time you open it on a device. If you skipped that, the box asks when you tap Submit — **🔑 sign in**:

1. Write your **name** and the **PIN** your mentor gave you.
2. Tap **Sign in**. The box now says *Signed in as …*.
3. Tap **📤 Submit**.

Once per device and browser. On another device, in another browser, or after clearing the browser's data, sign in again — your answers are still there. If the box says *"You were signed out"*, sign in again the same way. Forgot your PIN? Ask your mentor for a new one.

The course bot's *🔗 Connect this website* link still works too — it signs this browser in the same way.

> ⚠️ **Watch out.** A file over 5 MB will not go through the box. Send it as a zip to the course bot in **📤 Homework** instead.

## When it is due

The badge next to each Homework heading names the day it is due (*HW 1.1 — Due Day 3*): 23:59 Tashkent time on that day, and the menu shows the date. On time, full points are possible; one day late, ×0.8; later, ×0.5 ([the rules](progress.md)). Late is still better than never: always submit.

## What comes back

Within a day your mentor replies: what is right, what is wrong and **why**, how to fix it, and your points. The review appears on your **[My feedback](feedback.md)** page and in the hand-in box of the lesson, the bot tells you in **📤 Homework**, and the points appear on the [progress board](progress.md). Fix what it says and submit again if you want the fix reviewed (you don't lose points for a second try).

## Writing good answers

- **SQL:** get every task to ✅ first. Then the mentor reads *how* you wrote it — aliases, the filter you chose, a comment where you made a choice (`-- cancelled are out of the denominator`).
- **Text:** your own words. If you copied a sentence, say where from.
- **Not sure?** Write what you tried. Partial thinking is graded; a blank is not.

## The other way — GitHub (optional)

Analysts at work keep their files in a repository. If you want that habit now, push your files to `submissions/…` and tell the bot *I pushed it to GitHub instead* — it counts the same. The steps are in **[Tools at work](tools-at-work.md)**, together with installed database apps. Not needed for this course.


=====
PAGE: Week 0 · Day 0 — Where do you stand? (weeks/week-00/day-0.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-00/day-0
=====

# Week 0 · Day 0 — Where do you stand?

<span class="badge">Self-tests 90 min</span> <span class="badge">My plan 20 min</span> <span class="badge company">Company corner</span>

> STORY **The Friday before.** Your offer letter from Nur Finance says *"Junior Data Analyst, start Monday."* Your future lead, Madina, writes one line: *"Before you come in, tell me honestly what you already know. I'd rather give you hard work than boring work."* Today is that honest answer. Nobody grades this day; it only decides which weeks you can skip.

> 🧭 **What today is for.** Five short self-tests show what you already know, so the course gives you hard work, not boring work. **Nothing here is graded:** no points, no pass mark, nobody sees your answers in the boxes. The only thing you hand in is your plan.

## Today in 3 lines

- You have taken **five short self-tests** (SQL, Excel, Python, Statistics, BI) without looking anything up.
- For each module you know your score and the rule: **≥ 80 % → skip that week, do only its Friday checkpoint.**
- You have filled the **"my plan"** template and handed it in with the 📎 box on this page.

---

## 0. How to take the tests

1. **Answer in the box under each question.** Your answers are saved in this browser, so you can stop and come back.
2. **No searching, no running code, no spreadsheet.** A guess is fine: pick your best option, or write it and mark it with `?`. The point is to find the gaps, not to look good.
3. **The boxes check as you go.** Choice, number and word boxes show ✓ or ✗ at once with the right answer. On the ✍ questions you write your answer, tap **Compare**, read the model answer and tick what you covered. Count one point per ✓ or *Got it*, half a point per *Partly*.
4. The rule, per test: **SQL / Excel / Python / Statistics: 7 of 8 or better = skip. BI: 5 of 6 or better = skip.** SQL has one half step: 5–6 of 8 skips week 1 only. "Skip" means you still do that week's Friday checkpoint; if you fail the checkpoint, you do the week after all.

Many modules will score 0–3. That is the expected starting point of this course, and the course is built for it.

---

## 1. SQL (8 questions, 20 min) → Weeks 1–3

Use this tiny table for questions 3–8. It is called `loans`.

| loan_id | customer_id | product | principal | status |
|---|---|---|---|---|
| 1 | 10 | Micro | 2 000 000 | active |
| 2 | 11 | Auto | 150 000 000 | closed |
| 3 | 10 | Consumer | 12 000 000 | active |
| 4 | 12 | Micro | 900 000 | written_off |
| 5 | 13 | Auto | 90 000 000 | active |

**Q1.** What is a **primary key**?

**Q2.** In the table above, which column would be a **foreign key**, and to which table would it point?

**Q3.** How many rows does this return: `SELECT * FROM loans WHERE status = 'active' AND principal > 5000000;`

**Q4.** ✍ Write a query that returns the **distinct** product names.

**Q5.** What does this return: `SELECT COUNT(*) FROM loans WHERE product = 'Micro' OR product = 'Auto';`

**Q6.** ✍ Write a query for the two loans with the largest principal, largest first (any SQL dialect).

**Q7.** What is the difference between `WHERE` and `HAVING`?

**Q8.** ✍ Write a query that counts loans **per customer** and shows only customers with more than one loan.

**Your SQL score /8:** 7+ = skip weeks 1–3 (do the three Friday checkpoints: W1 D5, W2 D5, W3 D5). 5–6 = skip week 1 only.

---

## 2. Excel / Google Sheets (8 questions, 15 min) → Week 4

**Q1.** Cell `B2` holds a price, `E1` holds a VAT rate you want to reuse when you copy the formula down. Write the formula for `C2` so that copying it down keeps pointing at `E1`.

**Q2.** ✍ What does `=VLOOKUP(A2, Products!A:C, 3, FALSE)` do, word by word? What does `FALSE` change?

**Q3.** ✍ Column A holds loan statuses, column B amounts. Write a formula for the total amount of rows whose status is `"active"`.

**Q4.** ✍ Same columns plus column C = region. Write a formula counting rows that are `active` **and** in `Tashkent`.

**Q5.** A cell shows `#N/A`. What usually happened?

**Q6.** Numbers imported from a bank export are stored as text (left-aligned, `SUM` gives 0). Which of these turn them into numbers? Tick every one that works.

**Q7.** A **pivot table** summarises a long table by groups (sum, count or average per category) without formulas. Which four areas do you drag fields into?

**Q8.** You want every loan with DPD > 90 to turn red automatically. Which feature is that?

**Your Excel score /8:** 7+ = skip week 4 (do its checkpoint W4 D5).

---

## 3. Python (8 questions, 20 min) → Week 5

Answer without running anything.

```text
x = [3, 8, 1, 8]
print(len(x), x[0], x[-1])
```

**Q1.** What does the code above print?

```text
d = {"micro": 42, "auto": 24}
d["sme"] = 26
print(len(d), d["auto"])
```

**Q2.** What does the code above print?

```text
total = 0
for n in [1, 2, 3, 4]:
    if n % 2 == 0:
        total += n
print(total)
```

**Q3.** What does the code above print?

**Q4.** What are the types of `7 / 2` and `7 // 2`, and their values?

**Q5.** Write one line that reads `loans.csv` into a pandas DataFrame called `df` (pandas is imported as `pd`).

**Q6.** Which two show the first five rows of `df` and its size as (rows, columns)?

**Q7.** `df[df["status"] == "active"]` — what does it return?

**Q8.** `df.groupby("product")["principal"].sum()` — in words, what does this compute?

**Your Python score /8:** 7+ = skip week 5 (do its checkpoint W5 D5).

---

## 4. Statistics (8 questions, 20 min) → Week 6

Use this sample of days-late for 8 payments: **2, 4, 4, 4, 5, 5, 7, 9**.

**Q1.** Mean, median and mode of the sample?

**Q2.** The variance of this set, treated as a whole population, is 4. What is the **standard deviation**, in days?

**Q3.** A ninth payment arrives 60 days late. Which moves more, the mean or the median?

**Q4.** Two fair dice are thrown. Probability the sum is 7?

**Q5.** Credit scores are roughly normal with mean 660 and SD 60. About what share of applicants scores between 600 and 720?

**Q6.** ✍ *"Customers who got an SMS reminder paid 12 % more often than those who did not."* Give one reason this does **not** prove the SMS caused it.

**Q7.** A test gives **p = 0.03**. Which reading is correct?

**Q8.** ✍ What is the difference between a **population** and a **sample**, in one lending example?

**Your Statistics score /8:** 7+ = skip week 6 (do its checkpoint W6 D5).

---

## 5. BI / Power BI (6 questions, 15 min) → Week 7

**Q1.** ✍ What is a **dashboard** for, and how is it different from a 20-page report?

**Q2.** In Power BI, what is the difference between a **calculated column** and a **measure**?

**Q3.** ✍ Write a DAX measure that counts rows of a table `loans`.

**Q4.** You have `fact_loans` and `dim_product`. On which column do you relate them, and in which direction does the filter flow?

**Q5.** What is a **slicer**?

**Q6.** ✍ Import mode vs **DirectQuery**: one sentence each, and when would a bank's risk team pick DirectQuery?

**Your BI score /6:** 5+ = skip week 7 (do its checkpoint W7 D5; the A/B-testing half of the week still applies unless you also passed Statistics).

---

## 6. Interpreting your scores

| Module | Score | Rule | Decision |
|---|---|---|---|
| SQL | /8 | 7+ skip W1–3; 5–6 skip W1 | |
| Excel | /8 | 7+ skip W4 | |
| Python | /8 | 7+ skip W5 | |
| Statistics | /8 | 7+ skip W6 | |
| BI | /6 | 5+ skip W7 | |

Three honest notes:

- **Weeks 8 and 9 (product analytics, the capstone, credit risk models) and the Company & metrics track are never skipped.** They are the job, and no self-test covers them.
- A skipped week still has a **Friday checkpoint** you must pass. If you fail it, you take the week — no penalty, the checkpoint simply found a gap the test missed.
- If every score is below 4: good. The plan is the full nine weeks, and the course was written for exactly that start.

---

## 7. "My plan" <span class="badge hw">Submit today</span>

Copy this into the **📎 Hand in here** box below, fill it, tap **📤 Submit**. Keep answers short and true; Madina reads it before Monday.

```markdown
# My plan — [your name], [date]

## Scores
SQL __/8 · Excel __/8 · Python __/8 · Statistics __/8 · BI __/6

## Weeks I will take in full
[e.g. 1, 2, 3, 4, 5, 6, 7, 8, 9]

## Weeks I will skip (checkpoint only)
[e.g. none]

## Hours per study day I can really give
[e.g. 3 h, 19:00–22:00; weekends free]

## Tools on my laptop
- Database: nothing to install — SQL runs on the course website
- Excel or Sheets: [ ] Excel  [ ] Google Sheets
- Python: nothing to install for the course — it runs on the pages from week 5 ([ ] I also have Jupyter)
- Power BI Desktop: [ ] installed  [ ] not yet (Windows only)

## One thing I want to be able to do by the end
[one sentence, e.g. "answer a live SQL question in an interview without panic"]

## Something that worries me about this course
[one or two sentences]
```

Graded on: (a) it is submitted today (the box is due at 23:59), (b) the scores match your boxes above, (c) the hours are realistic — a plan that says 6 h a day and delivers 2 is worse than one that says 2.

### 📎 Hand in here

---

## 8. Self-check

---

## 9. Company corner <span class="badge company">What a lending analyst does</span>

Before the vocabulary comes a picture. A lending company (*кредитная организация*) makes money by lending it at a rate and losing some of it when people do not pay back. Every team's question is one of two:

- **"Are we lending enough, to the right people?"** — applications, approval rate, disbursements, ticket size, channel. The *growth* side.
- **"Are they paying us back?"** — days past due (*просрочка*), buckets, first-payment default, write-offs, recoveries. The *risk* side.

An analyst sits between the two. A typical week: Monday a portfolio manager asks how September's disbursements split by product; Tuesday collections asks which borrowers crossed 30 days late; Wednesday risk asks whether a new scoring rule changed the approval rate; Thursday somebody's number does not match somebody else's and you find out why. Everything you learn in the eight weeks — SQL, Excel, Python, statistics, BI — is a different tool for those same questions.

> 🎯 **Interview version.** *"What does a data analyst do in a lending company?"* Say your answer out loud in 30 seconds, write it below, then compare.

**Your answer.** Two or three sentences, as you would say them to the interviewer.

Monday: Week 1, Day 1 — how a company keeps its data.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.


=====
PAGE: Week 1 · Day 1 — How a company keeps its data (weeks/week-01/day-1.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-01/day-1
=====

# Week 1 · Day 1 — How a company keeps its data

<span class="badge">Workspace 15 min</span> <span class="badge">Learn 60 min</span> <span class="badge">Practice 60 min</span> <span class="badge">Homework</span> <span class="badge company">Company corner</span>

> STORY **Monday, 9:02.** You badge into Nur Finance for the first time. Your lead, Madina, puts a coffee on your desk and says: *"We lend money to people and small businesses. Everything that happens — every application, every loan, every payment that comes in late — ends up in a database. Your job is to turn that database into answers. Today: learn how it's organised, and run your first queries on it — ready-made ones, you only press Run. Tomorrow you write your own."*

## Today in 3 lines

- You can explain what a **table, row, column, primary key and foreign key** are, with a lending example for each.
- You can run SQL on the **Nur Finance** database (11 tables) right on these pages, find any table in the **Database** panel, and create, change and delete a small table of your own.
- You can describe the **loan lifecycle** and name the table where each step is recorded.

---

## 1. Your SQL workspace (15 min)

**Nothing to install — ever.** Every SQL box on these pages has **▶ Run** and works on the full Nur Finance database. Press it now:

```sql
SELECT COUNT(*) AS loans FROM loans;   -- expect 7828
```

You just asked the database *"how many rows does the table `loans` have?"* and it answered **7 828**. Read the query left to right: `SELECT` = "give me", `COUNT(*)` = "the number of rows", `FROM loans` = "of the table loans". Every query you write this week starts with those two words, `SELECT … FROM …`.

Three more things live around the boxes:

- The **Database** button (bottom right) opens the database panel — every table, its columns and its keys, like the panel in DBeaver or DataGrip at work. Tap a table to open it; **Show rows** shows its first 10 rows; tap a name to put it into your query.
- Every box runs on **your practice copy** of the database, kept on your device. You can create tables and change rows in it; the company's real data is never touched.
- The **[SQL playground](playground.md)** is one big editor on the same copy, for free practice.

> ⚠️ **Watch out.** If a number on a page stops matching what you get (say `COUNT(*)` of `loans` is no longer 7 828), you changed your practice copy. Open **Database** → **↺ Reset** and the original data is back. Homework checks always read the original, so they stay right either way.

---

## 2. Learn — data as tables

### Table, row, column — the three words

**What it is.** A **table** (*таблица*) is a list of things of one kind: all customers, or all loans. A **row** (*строка*) is one thing in that list — one customer. A **column** (*столбец*) is one property that every row has — a birth date, a region. A database built from such tables is a **relational database**. **SQL** is the language you use to ask it questions.

**How to write it.** Today you read tables; you write them from Day 3. Three rows and five of the eleven columns of `customers`:

Press **▶ Run** to see the same three rows with every column:

```sql
SELECT * FROM customers LIMIT 3;
-- * = every column, LIMIT 3 = the first three rows (Day 2 explains both)
```

3 rows, 11 columns. The whole table has 6 040 rows — one per registered customer.

**When you use it.**
- Before you count anything, ask **"what is one row?"** In `customers` one row is a customer; in `payments` it is one payment.
- Before you filter anything, ask **"which column holds it?"**

| | Excel sheet | Database table |
|---|---|---|
| What a column may hold | anything, mixed | one **type** only (next subsection) |
| How a row is named | "row 17", which moves when you sort | a **primary key** that never changes |
| How two sheets connect | copy-paste, VLOOKUP | **foreign keys** |

The same question for another table. `installments` is the **monthly payment schedule** of every loan: what the customer is due to pay, and when. Here are its first four rows:

**Your turn.** In the table `installments` (the monthly payment schedule), one row is…

### Data types — one kind of value per column

**What it is.** Every column has a **data type** (*тип данных*): the kind of value it may hold. A number column holds only numbers. A date column holds only dates. Four types cover this course.

| Type | Holds | Nur Finance columns |
|---|---|---|
| **whole number** — `INTEGER` (`INT`, `BIGINT` in SQL Server) | ids, counts, money in UZS | `loan_id`, `principal`, `term_months` |
| **decimal number** — `REAL` (`DECIMAL` in SQL Server) | rates and shares | `annual_rate` (0.3 = 30 % a year) |
| **text** — `TEXT` (`NVARCHAR` in SQL Server) | names, codes, statuses | `status`, `region`, `phone` |
| **date** — stored as text `'YYYY-MM-DD'` here (`DATE` in SQL Server) | days and moments | `disbursed_at`, `applied_at` |

**How to write it.** The **Database** panel shows each column's type to the right of its name. You can also ask the database:

```sql
SELECT loan_id, principal, annual_rate, disbursed_at,
       -- typeof() = SQLite's "what type is this value?"
       typeof(principal), typeof(annual_rate), typeof(disbursed_at)
FROM loans
LIMIT 3;
```

Loan 1: the principal 31 150 000 is an `integer`, the rate 0.3 is a `real`, the date `2025-03-28` is `text`. SQLite keeps dates as text in the order year-month-day. In that order, text sorts and compares like dates.

**When you use it.**
- The type decides what you can do with a column: add up numbers, compare dates, search inside text.
- On Day 3 you choose a type for every column of a table you create.

> ⚠️ **Watch out.** A phone number is **text**, not a number, although it is made of digits. You never add phone numbers up, and the leading `+` must survive.

**Your turn.** Put each column under the type it holds.

### Primary key — the ID that names exactly one row

**What it is.** A **primary key** (*первичный ключ*, PK) is a column whose value is **different on every row** and **never empty**. It names exactly one row. In `loans` the primary key is `loan_id`; in `customers` it is `customer_id`.

**How to write it.** Ask for one value of the primary key, and exactly one row comes back:

```sql
SELECT * FROM loans WHERE loan_id = 1;
-- WHERE keeps only the rows that match (Day 2)
```

1 row — loan 1: customer 3473, product 2, principal 31 150 000, 24 months, paid out on 2025-03-28, status `active`. Every one of the eleven tables has its own primary key. Its name ends in `_id` (in `dim_date`: `date_key`).

**When you use it.**
- To point at one thing without doubt: "loan 4570", not "the big SME loan in Namangan".
- To connect tables — the next subsection.

> ⚠️ **Watch out.** A name is not a key. `customers` has eight rows called *Murod Abdullaev*; only `customer_id` tells them apart. Even phones repeat: 6 040 customer rows hold only 5 997 different phone numbers.

**Your turn.** Which column of `customers` can be its primary key?

### Foreign key — a column that points to another table

**What it is.** A **foreign key** (*внешний ключ*, FK) is a column that stores **another table's primary key**. It is how a row of one table points at a row of another. `loans.customer_id` is a foreign key: it holds the `customer_id` of the person who took the loan.

**How to write it.** Follow the key by hand. The loan row carries a number; that number is the primary key of a row in `customers`.

Run both boxes — the first reads the key, the second follows it:

```sql
SELECT loan_id, customer_id, product_id, principal FROM loans WHERE loan_id = 1;
```

```sql
SELECT customer_id, first_name, last_name, region FROM customers WHERE customer_id = 3473;
```

Loan 1 carries `customer_id` 3473, and customer 3473 is Gulbahor Sobirova from Termez.

**When you use it.**
- Whenever an answer needs facts from two tables: the amount lives in `loans`, the borrower's name in `customers`.
- Next week a **JOIN** follows the foreign keys for you, for every row at once.

> ⚠️ **Watch out.** A foreign key's name does not always match the key it points to. `applications.officer_id` and `collections_actions.collector_id` both point to `staff.staff_id`.

**Your turn.** Connect each foreign key of `loans` to the table it points to.

### One-to-many — the "many" side carries the key

**What it is.** A **one-to-many** relationship (*связь «один ко многим»*) links one row on one side to many rows on the other. One customer can have many loans; one loan belongs to exactly one customer. Write it `customers 1 — ∞ loans`. The foreign key always sits on the **many** side: every loan stores its `customer_id`, and a customer stores no list of loans.

**How to write it.** Customer 3473's loans are the rows of `loans` that carry 3473:

```sql
SELECT loan_id, customer_id, product_id, principal, status
FROM loans
WHERE customer_id = 3473;
```

4 rows — Gulbahor Sobirova has four loans: one active, two closed, one written off. All four point back to the same one customer.

**When you use it.** There are three kinds of relationship, and Nur Finance has all three.

| Kind | Written | Nur Finance example |
|---|---|---|
| **one-to-many** | `1 — ∞` | `customers 1 — ∞ loans`, `loans 1 — ∞ installments` |
| **one-to-one** (here: one-to-zero-or-one) | `1 — 0..1` | `applications 1 — 0..1 loans`: an application gives at most one loan, a rejected one gives none |
| **many-to-many** | `∞ — ∞`, through a third table | customers and products: a customer can take many products, a product has many customers; each `loans` row records one such pair |

To find the direction, ask: **"can one of these have many of those?"**

**Your turn.** One branch has many employees. Which table carries the key?

### Reading a relationship as a sentence

**What it is.** Every foreign key is one sentence about the business. A key `child.fk → parent.pk` reads: **"each child belongs to one parent; a parent can have many children."**

**How to write it.**

| Foreign key | Read it as |
|---|---|
| `loans.customer_id → customers.customer_id` | Each loan belongs to one customer; a customer can have many loans. |
| `installments.loan_id → loans.loan_id` | Each instalment belongs to one loan; a loan has many instalments (its schedule). |
| `payments.installment_id → installments.installment_id` | Each payment is for one instalment; an instalment can receive several payments (part now, the rest later). |
| `applications.officer_id → staff.staff_id` | Each application is handled by one officer; an officer handles many applications. |

The whole database, read as sentences:

- A **customer** submits many **applications**. Each application is for one **product**, at one **branch**, handled by one **officer** (staff).
- An approved application becomes at most one **loan**.
- A loan has many **installments** (its schedule) and receives many **payments**.
- A late loan gets many **collections actions**, each made by one collector (staff).

**When you use it.** Before any question that touches two tables, say the sentence out loud. If the sentence sounds wrong, the key is wrong.

**Your turn.** `collections_actions.loan_id → loans.loan_id`. Which sentence is right?

### The eleven tables — who/what and what happened

**What it is.** Nur Finance keeps its data in eleven tables of two kinds:

- **Who/what tables** describe things: a customer, a product, a branch, an employee, a calendar day. They are short and change rarely.
- **What-happened tables** record events, usually with a date: an application, a loan paid out, a scheduled instalment, a payment, a collections action, a tap in the app. They are long, and grow every time something happens.

Almost every company's data has this shape. On Day 4 you learn its warehouse name: *dimensions and facts*.

**How to write it.** The map. Open the **Database** panel next to it and find each table.

| Table | Kind | One row is… | Primary key | Points to (FK) |
|---|---|---|---|---|
| `customers` | who/what | one person | `customer_id` | — |
| `products` | who/what | one loan product (Micro, Consumer, BNPL, Auto, SME) | `product_id` | — |
| `branches` | who/what | one office | `branch_id` | — |
| `staff` | who/what | one employee | `staff_id` | `branch_id` |
| `dim_date` | who/what | one calendar day | `date_key` | — |
| `applications` | what happened | one request for a loan | `application_id` | `customer_id`, `product_id`, `branch_id`, `officer_id → staff` |
| `loans` | what happened | one loan that was actually paid out | `loan_id` | `application_id`, `customer_id`, `product_id`, `branch_id` |
| `installments` | what happened | one scheduled monthly payment of a loan | `installment_id` | `loan_id` |
| `payments` | what happened | one real payment received | `payment_id` | `loan_id`, `installment_id` |
| `collections_actions` | what happened | one SMS / call / visit to a late borrower | `action_id` | `loan_id`, `collector_id → staff` |
| `app_events` | what happened | one tap in the mobile app | `event_id` | `customer_id`, `application_id` |

```sql
SELECT COUNT(*) FROM payments;
-- change the table name to count the rows of any of the eleven
```

52 875 rows — one per payment received. `products` has 5 rows. What-happened tables are long; who/what tables are short.

**When you use it.** Every question starts on this map: find the table where **one row is the thing you count**.

**Your turn.** Flip through the eleven tables until you know each one: what one row is, and where it points.

### The loan lifecycle in the tables

**What it is.** The **loan lifecycle** (*жизненный цикл кредита*) is the path of one loan from the first request to the last payment. Each step leaves rows in a what-happened table.

**How to write it.** The path as a picture:

```text
customers           who
   │
   ▼
applications        the request
   │
   │ approved
   ▼
loans               paid out
   ├──▶ installments
   │      the schedule: what is due
   ├──▶ payments
   │      what came in
   └──▶ collections_actions
          if a payment is late
```

- `applications.status`: approved · approved_not_disbursed · rejected · cancelled
- `loans.status`: active · closed · default · written_off

Loan 1 started as application 2. The first step of its lifecycle:

```sql
SELECT application_id, customer_id, applied_at, status FROM applications WHERE application_id = 2;
```

1 row: customer 3473 applied on 2025-03-23 at 17:00, status `approved`. Five days later, on 2025-03-28, loan 1 was paid out. The Worked example below follows it through the next steps.

**When you use it.** Every lending question sits at one step of the path:
- "How many people applied?" → `applications`.
- "How much did we pay out?" → `loans`.
- "Who is late?" → `installments` and `payments`.

The Company corner adds the metric people watch at each step.

**Your turn.** Match each step to the table that records it.

### Putting it together

Read loan 1 with every idea from this section:

1. `loans` is a what-happened **table**; one **row** is one loan. Its **columns** have **types**: `principal` is a whole number, `disbursed_at` a date.
2. `loan_id = 1` is the **primary key**: exactly one row.
3. `customer_id = 3473` is a **foreign key**: it points to one row of `customers`.
4. `customers 1 — ∞ loans` is **one-to-many**: Gulbahor Sobirova has four loans. As a sentence: each loan belongs to one customer.
5. On the **lifecycle**: application 2 → loan 1 → 24 instalments → 18 payments so far.

**Your turn.** The five words of the day, one last time.

### Lab — a table of your own

**What this is.** A first touch of the four commands that build and change a table. You learn each one properly on **Day 3**; today you only run them and watch a table appear under **Your tables** in the Database panel. Your own tables always start with `my_`, so they never mix with the company's.

What each step's **💡 Show me** gives you, read in one line:

| Step | 💡 Show me gives | Read it as |
|---|---|---|
| 1 | `CREATE TABLE my_branches (branch_id INTEGER PRIMARY KEY, name TEXT, region TEXT);` | Make an empty table with three columns: `branch_id` (a whole number, the primary key), `name` and `region` (text). |
| 2 | `INSERT INTO my_branches (branch_id, name, region) VALUES (1, 'Chilonzor', 'Tashkent'), …;` | Add rows: name the columns, then one bracket of values per row, in the same order. |
| 3 | `UPDATE my_branches SET region = 'Fergana' WHERE branch_id = 3;` | Set the region to 'Fergana' — only on the row whose id is 3. |
| 4 | `DELETE FROM my_branches WHERE region = 'Fergana';` then `SELECT * FROM my_branches;` | Remove the rows whose region is 'Fergana', then show what is left. |

**The primary key at work.** In the lab editor, run `INSERT INTO my_branches VALUES (1, 'Again', 'Nukus');`. The database refuses with *UNIQUE constraint failed*: a second row with id 1 would break "one id, one row".

### Depth (optional)

- ▶ Baraa, *Introduction to SQL* [0:07:38](https://youtu.be/SSKVgrwhzus?t=458&end=1353) — 15 min, what a database is and why SQL.
- RU deck (TBC Data Analytics 2.0, if you have it) `1.1 Database Fundamentals.pdf`, pages 1–30 (what a DBMS is, tables, keys). *Russian terms:* таблица = table, строка = row, столбец = column, первичный ключ = primary key, внешний ключ = foreign key.

---

## 3. Worked example — reading a row like an analyst

Madina asks: *"Loan 1 — tell me its story in one sentence."* You do not write SQL yet: every step has a ready-made query. Press **▶ Run**, read the row, and follow the keys from table to table. Each step names the idea from Learn that it uses.

**Step 1 — a row, found by its primary key.** In `loans`, the row with `loan_id = 1`. Note `customer_id`, `product_id`, `principal`, `term_months`, `disbursed_at`, `status`.

```sql
SELECT * FROM loans WHERE loan_id = 1;
```

**Step 2 — a foreign key, followed.** `customer_id` is 3473. In `customers`, row 3473 gives the name, region and segment.

```sql
SELECT * FROM customers WHERE customer_id = 3473;
```

**Step 3 — a second foreign key.** `product_id` is 2. In `products`, row 2 gives the product's name.

```sql
SELECT * FROM products WHERE product_id = 2;
```

**Step 4 — one-to-many: the schedule.** In `installments`, every row with `loan_id = 1`. How many are there? What is the first `due_date`?

```sql
SELECT * FROM installments WHERE loan_id = 1;
```

**Step 5 — one-to-many again, at the lifecycle step "repayment".** In `payments`, every row with `loan_id = 1`. How many are there? Was any paid later than its due date?

```sql
SELECT * FROM payments WHERE loan_id = 1;
```

Sentence shape: *"[Name] from [region] took a [product] of [principal] for [term] months on [date]; [n] of [term] instalments are paid, the loan is [status]."* You write the real sentence in tonight's homework.

That chain — a what-happened row → a key → a who/what row → back along a key to the next what-happened table — is 80 % of what SQL does for you. Tomorrow you write such queries yourself; next week one query walks the whole chain.

---

## 4. Practice (60 min)

Every question has its own answer box: answer, tap **Check**, read why. Your answers are saved in this browser, and the section ticks off when every box is done. Try before you look — the explanation appears only after you answer. The questions follow the order of Learn; the label in italics names the idea each one trains.

Run this ready-made query — the 60 newest customer rows, newest first. Scroll through the result:

```sql
SELECT * FROM customers ORDER BY customer_id DESC LIMIT 60;
```

**P1.** *(table, row, column)* Write down two things that look *wrong* to you in these rows, and the column each one is in. Keep the note — Thursday is detective day.

**P2.** *(data types)* `customers.monthly_income` holds 3894708 for customer 1, and `customers.phone` holds +998902031105. What types are they?

**P3.** *(primary key and foreign key)* `installments` has a column `loan_id`. Is it a primary key or a foreign key — and how do you know without opening the data?

**P4.** *(one-to-many, read as a sentence)* Which pairs of tables are one-to-many? Tick every true `A 1 — ∞ B`.

**P5.** *(one-to-one)* Is `applications → loans` one-to-many or one-to-one? Think about the business, not the data.

**P6.** *(the eleven tables: who/what and what happened)* Which tables are "what happened" (event) tables? Tick all of them.

**P7.** *(the eleven tables as a map)* Which table, and which column, would answer each question?
a) "How many people applied through the app last month?"
b) "What is the total amount we are owed?"
c) "How many calls did collectors make in Fergana?"

Run this ready-made query — it lists every different value of `status` in `applications` (tomorrow you learn to write it):

```sql
SELECT DISTINCT status FROM applications;
```

**P8.** *(the loan lifecycle: the decision)* Four statuses come back. Which one means *"we said yes, but the customer never took the money"*?

**P9.** *(the loan lifecycle: write-off)* `loans.status` has a value `written_off`. In your own words: what happened to such a loan?

> 🚀 **Stretch (optional, +5 XP).** **P10.** *(reading relationships)* Draw the eleven tables as boxes and the relationships as lines, on paper or in https://dbdiagram.io (free, no login needed to try). Then write your lines below, one per line, as `A 1 — ∞ B`. You will compare them with the real diagram on Day 3.

---

## 5. Homework <span class="badge hw">HW 1.1 — Due Day 3</span>

**HW 1.1 — Your workspace works:** three counts the site checks, the story of loan 1, and what you got wrong today.

---

## 6. Self-check

---

## 7. Company corner <span class="badge company">Lending 101</span>

**The loan lifecycle.** Every lending company, from a bank to a BNPL app, moves money through the same seven steps. Learn them in order; each one is a table.

| Step | What happens | Table | Metric people ask about |
|---|---|---|---|
| 1. Application | a customer asks for money | `applications` | applications per day, by channel |
| 2. Decision | scoring + rules say yes/no | `applications.status`, `credit_score` | **approval rate** |
| 3. Disbursement | money leaves our account | `loans.disbursed_at`, `principal` | **disbursements** (sum per month) |
| 4. Repayment | monthly instalments come in | `installments`, `payments` | collection rate, **outstanding** |
| 5. Delinquency | a payment is late | computed from 4 | **DPD**, **FPD**, buckets |
| 6. Collection | we remind, call, visit, restructure | `collections_actions` | contact rate, cure rate |
| 7. Write-off / recovery | we give up on the loan, or get some back | `loans.status` | **NPL**, write-off rate, recovery |

Two words to carry home today:

- **Portfolio** — all the loans we currently have outstanding, taken together. "The portfolio grew 4 % in September" = total outstanding went up 4 %.
- **Disbursement** — the act (and the amount) of paying out a loan. "We disbursed 12 bn UZS last week."

> ⚠️ **Watch out.** The portfolio is what is *still outstanding*, not the sum of `loans.principal`. Principal is what was lent on day one; it does not shrink as the borrower pays.

Tomorrow: you write your own queries. Keep your P1 note for Thursday's detective case.

> 🎯 **Interview version.** *"Describe how a loan moves through a lending company and where an analyst looks at each step."* Answer with the seven rows above, naming the table and one metric per row.

**Say it like in an interview.** Write your answer the way you would say it — 30 words or more — then compare it with the model.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 1 · Day 2 — Your first queries (weeks/week-01/day-2.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-01/day-2
=====

# Week 1 · Day 2 — Your first queries

<span class="badge">Learn 60 min</span> <span class="badge">Practice 60 min</span> <span class="badge">Homework</span> <span class="badge company">Company corner</span>

> STORY **Tuesday, 9:15.** Bekzod, the portfolio manager (*портфельный менеджер*), leans over the partition: *"Madina says you're the new analyst. I run the Auto and SME books. Every Monday I open the loans table in Excel and scroll until my eyes hurt. Can the database just… give me the rows I want?"* Madina, from behind her screen: *"That is literally what SELECT is for. Show him by lunch."*

## Today in 3 lines

- You can write a **SELECT** that picks columns, renames them, removes duplicates, **filters rows** with `WHERE`, **sorts** them, and returns only the first N.
- You know the seven filter operators (`=`, `<>`, `>`/`<`, `BETWEEN`, `IN`, `LIKE`, `IS NULL`) and how `AND`/`OR`/`NOT` combine them — including the parenthesis trap.
- You can compute Nur Finance's **approval rate** with two counts, and explain the cancelled-applications trap.

---

## 1. Learn — asking a table a question

### The shape of a query

**What it is.** A **query** (*запрос*) is a question to the database, written in SQL. Every query you write this week has the same skeleton of **clauses** (*предложения*): `SELECT` names the columns, `FROM` the table, `WHERE` the rows, `ORDER BY` the order, `LIMIT` how many. Only `SELECT` and `FROM` are required.

**How to write it.**

```sql
-- the shape only: replace the names before you run it
SELECT   column1, column2  -- which columns (or * for all)
FROM     table_name        -- which table
WHERE    condition         -- which rows (optional)
ORDER BY column1 DESC      -- in what order (optional)
LIMIT    5;
-- how many rows at most (optional; SQL Server: SELECT TOP 5 …)
```

One real query with every clause — the five biggest loans in default:

```sql
SELECT loan_id, principal, status
FROM loans
WHERE status = 'default'
ORDER BY principal DESC
LIMIT 5;
```

5 rows, biggest first: loan 370 with 589 000 000 on top. Read it as one sentence: *"from `loans`, keep the rows in default, show three columns, biggest principal first, stop after five."*

**When you use it.**
- Always: the clauses go in this order, or the database stops with a syntax error.
- The database **runs** them in a different order: FROM → WHERE → SELECT → ORDER BY → LIMIT. It picks the table, keeps the rows that pass the filter, cuts out your columns, sorts, then stops. That is why `WHERE` can use a column you do not display.

**Your turn.** Fill the skeleton for Bekzod: his Auto loans (product 4), biggest first.

> 🎬 **Didn't get the order of the clauses in a query?** [Baraa explains it · 4 min](https://youtu.be/SSKVgrwhzus?t=5008&end=5262)

### SELECT — choose the columns

**What it is.** **SELECT** (*выбрать*) lists the columns you want, separated by commas, in the order you want them. `SELECT *` means every column. `SELECT COUNT(*)` returns one number: how many rows there are.

**How to write it.**

```sql
SELECT loan_id, principal, disbursed_at, status  -- four columns, in this order
FROM loans;
```

7 828 rows — every loan — but only the four columns you named, in your order.

```sql
SELECT COUNT(*) FROM customers;    -- one row, one number
```

6 040 — the number of rows in `customers`.

**When you use it.**
- Name the columns in every query you keep or send. `SELECT *` is for a first look at a table.
- `COUNT(*)` when the question is "how many?". It is the only aggregate this week; the others come in Week 2.

**Your turn.** Build the query: each customer's id, first name and region.

> 🎬 **Didn't get SELECT and FROM?** [Baraa explains it · 8 min](https://youtu.be/SSKVgrwhzus?t=2139&end=2627)

### Aliases — AS renames a column in the result

**What it is.** An **alias** (*псевдоним*) is a new name for a column in the result. You write it after the column with `AS`. The table itself does not change.

**How to write it.**

```sql
SELECT loan_id      AS loan,          -- column AS new_name
       principal    AS amount_uzs,
       disbursed_at AS paid_out_on
FROM loans;
```

7 828 rows; the headers now read `loan`, `amount_uzs`, `paid_out_on`.

**When you use it.**
- To give a report readable headers.
- To name a computed column: `SELECT COUNT(*) AS micro_loans_sep` (the Worked example).

> ⚠️ **Watch out.** An alias with a space needs double quotes: `AS "amount UZS"`. Easier: use `_` instead of a space.

**Your turn.** List every product: its `name` as `product` and its `annual_rate` as `rate` (5 rows).

### DISTINCT — one row per different value

**What it is.** **DISTINCT** (*различные*) removes duplicate rows from the result. You write it right after `SELECT`. It keeps one row per different combination of the selected columns.

**How to write it.**

```sql
SELECT DISTINCT channel FROM applications;
```

3 rows — `app`, `branch`, `partner` — although `applications` has 14 000 rows.

```sql
SELECT DISTINCT channel, status FROM applications;
```

12 rows: every channel appears with each of the four statuses (3 × 4 = 12).

An empty cell (NULL, see *IS NULL* below) counts as one value too: if some rows of a column are empty, `DISTINCT` returns one empty row among the others.

**When you use it.**
- To learn what a column contains before you filter on it — the fastest look there is.
- To list the different values of a column for a report: regions, products, statuses.

**Your turn.** How many different values does `collections_actions.outcome` have?

> 🎬 **Didn't get DISTINCT?** [Baraa explains it · 3 min](https://youtu.be/SSKVgrwhzus?t=4495&end=4701)

### ORDER BY — sort the rows

**What it is.** **ORDER BY** (*сортировка*) sorts the result by one or more columns. `ASC` means smallest first and is the default. `DESC` means biggest first.

**How to write it.**

```sql
SELECT loan_id, product_id, principal
FROM loans
ORDER BY product_id, principal DESC;
-- first by product (1, 2, 3 and on), inside each product the biggest first
```

7 828 rows. Product 1 (Micro) comes first, and inside it the biggest loans: 4 990 000 at the top.

**When you use it.**
- "Biggest first", "newest first", "alphabetically".
- Several columns: the second column sorts only inside equal values of the first.

> ⚠️ **Watch out.** An empty cell (**NULL**) counts as the smallest value in both SQLite and SQL Server. With `ASC` the empty cells come first, with `DESC` they come last. PostgreSQL does the opposite (NULL is the largest there), so the same query can put them at the other end.

**Your turn.** What does `ORDER BY region, monthly_income DESC` do?

> 🎬 **Didn't get ORDER BY?** [Baraa explains it · 9 min](https://youtu.be/SSKVgrwhzus?t=2984&end=3512)

> ⚠️ **Quirk: where do the empty cells go?**
>
> - **You expect:** the empty cells (NULL) at the same end in every database.
> - **What happens:** SQLite and SQL Server put them first with `ASC` and last with `DESC`; PostgreSQL and Oracle do the opposite. No error — just a different first row.
> - **Why:** the SQL standard does not say where NULL sorts, so each database chose.
> - **Protect yourself:** say it in the query: `NULLS FIRST` or `NULLS LAST` after the column (SQLite, PostgreSQL, Oracle). SQL Server does not know these words; there you sort by a `CASE` first (week 2).

```sql
-- no income (356 rows): at the end
SELECT customer_id, monthly_income
FROM customers
ORDER BY monthly_income NULLS LAST
LIMIT 5;
```

The five lowest incomes, from 2 504 499 soum. Delete `NULLS LAST` and run again: all five rows are empty incomes.

### LIMIT and TOP — only the first N rows

**What it is.** **LIMIT** returns at most N rows. It goes at the very end of the query. SQL Server writes the same thing as **TOP N** right after `SELECT`. This is the one place this week where the two engines spell a query differently.

**How to write it.**

```sql
-- SQL Server
SELECT TOP 3 application_id, requested_amount FROM applications ORDER BY requested_amount DESC;
-- SQLite / PostgreSQL / MySQL
SELECT application_id, requested_amount FROM applications ORDER BY requested_amount DESC LIMIT 3;
```

3 rows: application 5074 asked for 599 060 000, the most of all 14 000. (The box runs both lines: it turns `TOP` into `LIMIT` for you, and shows the last result.)

**When you use it.** "The five biggest", "the ten newest", "the first row" — always together with `ORDER BY`.

> ⚠️ **Watch out.** `LIMIT` without `ORDER BY` returns *some* N rows, not the biggest or the newest. Sort first, then cut. And when two rows tie at the cut (the same amount), the database decides which one you get: add a second sort column, such as `loan_id`, so the answer is the same every time.

**Your turn.** What is the `application_id` of the most recent application (latest `applied_at`)?

> 🎬 **Didn't get TOP (LIMIT)?** [Baraa explains it · 5 min](https://youtu.be/SSKVgrwhzus?t=4700&end=5008)

### WHERE — keep only the rows you want

**What it is.** **WHERE** (*условие*) keeps the rows for which a **condition** is true and drops the rest. A condition compares a column with a value. Text values go in single quotes: `'default'`.

**How to write it.**

```sql
SELECT loan_id, principal, status
FROM loans
WHERE status = 'default';     -- column  operator  value
```

44 rows — the loans in default. The other 7 784 loans are dropped.

**When you use it.** Every question with a "which": which loans, which customers, which month. The next six subsections are the operators you can put in a condition.

**Your turn.** Build the query: the id and principal of every written-off loan.

> 🎬 **Didn't get WHERE?** [Baraa explains it · 6 min](https://youtu.be/SSKVgrwhzus?t=2619&end=2986)

### The operators = and <> — equal and not equal

**What it is.** `=` keeps the rows where the column **equals** the value. `<>` keeps the rows where it **does not equal** it (`!=` means the same).

**How to write it.**

```sql
SELECT COUNT(*) FROM applications WHERE channel <> 'branch';
```

7 777 applications came through the app or a partner — everything except the branch channel.

**When you use it.** Exact matches on codes, statuses, ids, regions: `region = 'Tashkent'`, `product_id = 5`, `status <> 'closed'`.

**Your turn.** How many loans have risk grade `A`?

> 🎬 **Didn't get the = and <> operators?** [Baraa explains it · 5 min](https://youtu.be/SSKVgrwhzus?t=7736&end=8062)

### The operators >, <, >=, <= — bigger and smaller

**What it is.** The **comparison operators** keep rows by size: `>` greater than, `<` less than, `>=` greater or equal, `<=` less or equal. They work on numbers and on dates.

**How to write it.**

```sql
SELECT COUNT(*) FROM loans WHERE principal > 200000000;
-- numbers: no quotes, no spaces
```

755 loans are bigger than 200 000 000.

```sql
SELECT COUNT(*) FROM loans WHERE disbursed_at >= '2026-09-01';
-- dates: 'YYYY-MM-DD' in quotes
```

382 loans were paid out on or after 1 September 2026 — up to the data's last day, 1 October.

**When you use it.** Thresholds and periods: "over 100 million", "a score below 500", "since 1 January".

**Your turn.** How many loans run 36 months or longer?

> 🎬 **Didn't get the >, <, >=, <= operators?** [Baraa explains it · 3 min](https://youtu.be/SSKVgrwhzus?t=8060&end=8234)

### BETWEEN — a range with both ends included

**What it is.** **BETWEEN a AND b** keeps the values from `a` to `b`, **both ends included**. It is a short way to write `>= a AND <= b`.

**How to write it.**

```sql
SELECT COUNT(*) FROM loans WHERE term_months BETWEEN 12 AND 24;
-- the same as term_months >= 12 AND term_months <= 24
```

2 940 loans run from 12 to 24 months — the 12-month and the 24-month loans included.

**When you use it.** Ranges of numbers ("between 1 and 5 million") and of plain dates ("the first week of September").

> ⚠️ **Watch out.** On a column that holds a date **and a time**, `BETWEEN '…-01' AND '…-31'` drops everything after midnight of the last day. See *Text, numbers and dates* below.

**Your turn.** How many applications asked for 10 000 000 to 20 000 000, both ends included?

> 🎬 **Didn't get BETWEEN?** [Baraa explains it · 4 min](https://youtu.be/SSKVgrwhzus?t=8900&end=9168)

### IN — equal to one of a list

**What it is.** **IN (…)** keeps the rows whose value equals **any** value in the list. It is a short way to write several `=` joined by `OR`.

**How to write it.**

```sql
SELECT COUNT(*) FROM loans WHERE product_id IN (4, 5);
-- the same as product_id = 4 OR product_id = 5
```

1 172 loans are Auto (product 4) or SME (product 5): 391 + 781.

**When you use it.** A short list of codes, statuses or regions: `region IN ('Nukus', 'Termez')`, `status IN ('approved', 'approved_not_disbursed')`.

**Your turn.** How many customers are in the `affluent` or the `sme` segment?

> 🎬 **Didn't get IN?** [Baraa explains it · 4 min](https://youtu.be/SSKVgrwhzus?t=9169&end=9418)

### LIKE — a text pattern

**What it is.** **LIKE** keeps the text values that match a **pattern**. In the pattern, `%` stands for any number of characters (also none), and `_` for exactly one character.

**How to write it.**

```sql
SELECT name FROM products WHERE name LIKE '%loan';
-- anything, then "loan" at the end
```

4 rows: Micro loan, Consumer loan, Auto loan, Small business loan. *Buy now pay later* does not end in "loan".

```sql
SELECT code FROM products WHERE code LIKE '____';
-- four underscores = exactly four characters
```

3 rows: CONS, BNPL, AUTO. MICRO has five letters and SME three.

**When you use it.** "Starts with", "ends with", "contains": `LIKE 'M%'`, `LIKE '%ova'`, `LIKE '%loan%'`.

> ⚠️ **Watch out.** In SQLite, `LIKE` ignores the case of Latin letters: `'m%'` also finds *Madina*. In SQL Server it follows the database's collation. `=` in SQLite does not ignore case.

**Your turn.** How many customers have a surname that starts with `Abdu`?

> 🎬 **Didn't get LIKE?** [Baraa explains it · 10 min](https://youtu.be/SSKVgrwhzus?t=9418&end=10046)

### IS NULL — the empty cell

**What it is.** **NULL** (*пустое значение*) means "no value here — unknown". It is not zero and not an empty text. `IS NULL` finds the empty cells; `IS NOT NULL` finds the filled ones.

**How to write it.**

```sql
SELECT COUNT(*) FROM applications WHERE credit_score IS NULL;       -- 388
SELECT COUNT(*) FROM applications WHERE credit_score IS NOT NULL;   -- 13 612
```

The box shows the last count: 13 612 applications have a score. Run the first line alone: 388 have none. 388 + 13 612 = 14 000 — every application is in exactly one group.

**When you use it.** Missing data: no income recorded, no score, a loan not yet closed.

> ⚠️ **Watch out.** `credit_score = NULL` returns **0 rows, always**, with no error. Nothing is ever "equal" to unknown. Write `IS NULL`.

**Your turn.** Find the line that makes this query wrong.

**Try it.** Each column compares with NULL in another way:

```sql
SELECT NULL = NULL  AS equals,
       NULL <> NULL AS not_equals,
       NULL IS NULL AS is_null;
-- NULL · NULL · 1
```

`equals` and `not_equals` are both NULL: a comparison with an unknown is neither true nor false. `WHERE` keeps a row only when its condition is true, so both would lose every row.

### AND, OR, NOT — combining conditions, with brackets

(Animated explanation)
Twenty applications and one WHERE
- 20 loan applications, one dot each. Blue = SME (product 5), grey = every other product.
- Each application also has a status. A green ring = approved, an amber ring = approved but not disbursed yet, no ring = rejected.
- WHERE keeps a row only when its condition is **true** for that row. `WHERE product_id = 5` → the 8 SME rows.
- **AND** needs **both** to be true: SME **and** approved → 3 rows. Every AND makes the result smaller (or the same).
- Guess before you look.
- There they are: 8 SME rows and 4 more approved ones. OR makes the result bigger (or the same).
- **NOT** flips a condition: `NOT status = 'approved'` keeps every row that is **not** approved → 13 rows.
- Our real question: SME applications we said **yes** to — approved **or** approved-not-disbursed. That is 3 + 2 = **5** rows.
- Written without brackets, SQL does **AND first** (like × before +): (SME AND approved) OR (any not-disbursed). Result: 8 rows — 3 rows of **other products** sneak in (framed).
- Brackets say what belongs together: SME AND (either status) → back to 5. **When AND and OR meet, always write brackets.**
- Last one.

**Before you read.** Guess first, then play with it — the explanation below will make more sense.

**What it is.** **AND** keeps a row when **both** conditions are true. **OR** keeps it when **at least one** is true. **NOT** turns a condition around: `NOT IN`, `NOT LIKE`, `IS NOT NULL`, `NOT (…)`. **AND binds tighter than OR** — like multiplication before addition.

**How to write it.** SME applications that we said yes to:

```sql
SELECT COUNT(*) FROM applications
WHERE product_id = 5 AND (status = 'approved' OR status = 'approved_not_disbursed');
```

854 applications. Now the same words without the brackets:

```sql
SELECT COUNT(*) FROM applications
WHERE product_id = 5 AND status = 'approved' OR status = 'approved_not_disbursed';
```

1 469. The database read it as `(product_id = 5 AND status = 'approved') OR status = 'approved_not_disbursed'`, so every not-disbursed approval of **any** product slipped in. No error, wrong number.

```sql
SELECT COUNT(*) FROM loans WHERE status NOT IN ('closed', 'written_off');
```

3 396 loans are neither closed nor written off: 3 352 active + 44 in default. Use `NOT IN` with a list you typed yourself; if the list ever holds an empty value (NULL), it returns no rows at all. Week 3 shows why.

**When you use it.** Every filter with more than one condition.

| You mean | Write |
|---|---|
| both must hold | `a AND b` |
| either may hold | `a OR b` |
| one condition AND a choice of two | `a AND (b OR c)` — brackets, always |
| not one of a list | `col NOT IN (…)` |

> ⚠️ **Watch out.** Whenever `AND` meets `OR` in one `WHERE`, add brackets. A wrong grouping is not an error — it is a different question that runs fine.

**Your turn.** How does the database read `WHERE a AND b OR c`?

> 🎬 **Didn't get AND, OR, NOT?** [Baraa explains it · 11 min](https://youtu.be/SSKVgrwhzus?t=8234&end=8901)

### Text, numbers and dates in conditions

**What it is.** A value in a condition is written by its type. Each type has one rule and one trap.

| Type | How to write the value | The trap |
|---|---|---|
| **text** | in single quotes, spelled exactly as stored: `'active'` | in SQLite `=` is case-sensitive: `status = 'Active'` finds 0 rows |
| **number** | no quotes, no spaces: `200000000` | `200 000 000` is a syntax error |
| **date** | text `'YYYY-MM-DD'` in quotes: `'2026-09-01'` | a column with a **time** as well (`applied_at`) does not equal a plain date |

**How to write it.** `applied_at` holds a date and a time, such as `2025-06-02 10:35:00`:

```sql
SELECT COUNT(*) FROM applications WHERE applied_at = '2025-06-02';
-- 0: no row is exactly midnight
SELECT COUNT(*) FROM applications WHERE applied_at >= '2025-06-02' AND applied_at < '2025-06-03';
-- the whole day
```

14 applications were made on 2 June 2025. The first line finds 0, because `'2025-06-02 10:35:00'` is not equal to `'2025-06-02'`.

**When you use it.** For a period, write a **half-open range**: `>= first day AND < first day of the next period`. It works on dates with and without a time, in every engine. For a year: `applied_at >= '2025-01-01' AND applied_at < '2026-01-01'`.

> ⚠️ **Watch out.** `= NULL`, `'Active'` instead of `'active'`, and `BETWEEN` on a date-time column all run without an error and return a wrong number. Prefer `IS NULL`, exact spelling and half-open ranges by habit. And keep values in **single** quotes: double quotes mean a column name, so `status = "active"` is an error in SQL Server and PostgreSQL, while SQLite quietly guesses you meant text.

**Your turn.** Which filter keeps **every** application of 2025?

> ⚠️ **Quirk: a typo in double quotes becomes text.**
>
> - **You expect:** `SELECT "princpal" FROM loans` (a typo of `principal`) to stop with *no such column*.
> - **What happens:** SQLite returns the word `princpal` on every row, and no error.
> - **Why:** double quotes mark a **name**. When no column has that name, SQLite guesses you meant text — an old habit it keeps so that old code still runs. SQL Server and PostgreSQL stop with an error.
> - **Protect yourself:** write column names without quotes, and text values in **single** quotes.

```sql
SELECT "status", "princpal", 'status'
FROM loans
LIMIT 3;
-- a column · a typo read as text · text
```

The first column holds each loan's real status; the other two repeat one word on every row. A column of one repeated word is the sign of this quirk.

### Putting it together

Bekzod: *"The five biggest Auto or SME loans paid out in September 2026 that are still active."* Every clause from this section in one query:

```sql
SELECT loan_id      AS loan,
       product_id   AS product,
       principal    AS amount_uzs,
       -- SELECT + aliases
       disbursed_at AS paid_out_on
FROM loans                  -- FROM
WHERE product_id IN (4, 5)  -- IN
  -- a half-open date range
  AND disbursed_at >= '2026-09-01' AND disbursed_at < '2026-10-01'
  AND status = 'active'     -- =
-- ORDER BY
ORDER BY principal DESC
LIMIT 5;
-- LIMIT (SQL Server: TOP 5 after SELECT instead)
```

5 rows. Loan 6478, an SME loan of 588 780 000 paid out on 1 September, is the biggest. 51 loans pass the filter; `LIMIT` shows the top five.

Read it in the order the database runs it: **FROM** loans → **WHERE** keeps 51 rows → **SELECT** cuts four columns and renames them → **ORDER BY** sorts → **LIMIT** keeps five.

**Your turn.** Put the clauses in the order the database **runs** them.

### Depth (optional)

- ▶ Baraa, *Query data (SELECT)* [0:34:01](https://youtu.be/SSKVgrwhzus?t=2041&end=5551) — 60 min, SELECT/DISTINCT/TOP/ORDER BY on his SalesDB; ▶ *Filtering data* [2:08:03](https://youtu.be/SSKVgrwhzus?t=7683&end=10077) — 40 min, every operator above.
- RU deck (TBC Data Analytics 2.0, if you have it) `2.1 SQL-1-46.pdf`, pages 1–46 (SELECT, WHERE, ORDER BY). *Russian terms:* запрос = query, выборка = selection/result set, условие = condition, сортировка = sorting, псевдоним = alias.

---

## 2. Worked example — Bekzod's first request

*"How many Micro loans did we pay out in September? And show me the five biggest."* Each step names the idea from Learn that it uses.

**Step 1 — translate the words into a table, columns and conditions (FROM, WHERE with `=`, a date range).** "Micro loans" → `loans` with `product_id = 1` (check in `products`: Micro loan is id 1). "Paid out in September" → `disbursed_at` in September 2026 (the data is as of 1 October 2026). "Five biggest" → `ORDER BY principal DESC`, first five.

**Step 2 — the rows first, the count second (SELECT columns, AND, BETWEEN, ORDER BY).** Always look at rows before you count them; a wrong filter is visible in rows and invisible in a number.

```sql
SELECT loan_id, principal, disbursed_at
FROM loans
WHERE product_id = 1
  AND disbursed_at BETWEEN '2026-09-01' AND '2026-09-30'
ORDER BY principal DESC;
```

123 rows. `disbursed_at` holds a date only, no time, so `BETWEEN` is safe here — unlike `applied_at`.

**Step 3 — count (COUNT(*) and an alias).** Replace the column list with `COUNT(*)` and name it:

```sql
SELECT COUNT(*) AS micro_loans_sep
FROM loans
WHERE product_id = 1
  AND disbursed_at BETWEEN '2026-09-01' AND '2026-09-30';     -- expect 123
```

**Step 4 — the five biggest (ORDER BY + LIMIT/TOP).** Add `LIMIT 5` to the step-2 query (`SELECT TOP 5 …` on SQL Server). The top loan is 2663: 4 950 000, paid out on 2 September. Bekzod gets 123 and a five-row table in 90 seconds, instead of a morning of scrolling.

### Lab — keep the answer in a table of your own

**What this is.** Bekzod likes the list and wants to keep it — and to add August. This lab is a **first touch** of the commands that save and change a table. You learn each one properly on **Day 3**; today, **💡 Show me** gives you the exact text, and the table below reads each one in a line. Your own tables start with `my_`.

| Step | 💡 Show me gives | Read it as |
|---|---|---|
| 1 | `CREATE TABLE my_micro AS SELECT …` | Run the query and save its rows as a new table `my_micro`. |
| 2 | `INSERT INTO my_micro SELECT …` | Run another query and add its rows to `my_micro` — same columns, same order. |
| 3 | `ALTER TABLE my_micro ADD COLUMN flag TEXT;` then `UPDATE my_micro SET flag = 'big' WHERE principal >= 4000000;` | Add an empty text column `flag`; then write 'big' into it on the rows of 4 000 000 or more. |
| 4 | `DELETE FROM my_micro WHERE principal < 1000000;` | Remove the rows under 1 000 000 — from your table, never from `loans`. |
| 5 | `CREATE TABLE my_micro_top AS SELECT * FROM my_micro ORDER BY principal DESC LIMIT 10;` | Save the ten biggest rows of `my_micro` as another table. |

---

## 3. Practice (60 min)

Write each query in the box under its question — it is saved in this browser. **▶ Run**, look at the rows, then count. **✔ Check** tells you whether your result matches the answer without showing it; then type the number your query gave into the box after the fold. Open the fold only after you have a number. The questions follow the order of Learn; the label in italics names the idea each one trains.

**P1.** *(SELECT and aliases)* List every branch: its `branch_name` as `branch` and its `region` (10 rows).

**P2.** *(DISTINCT)* List the distinct values of `loans.status`. How many are there?

**P2.** How many different statuses did your query return?

**P3.** *(ORDER BY and LIMIT/TOP)* The five largest loans ever disbursed: loan id, principal, product id.

**P3.** Which loan id is at the top?

**P4.** *(= and <>)* How many loans are *not* active? Check against the active count.

**P4.** How many loans are not active?

**P5.** *(> and a date range)* All Auto loans (product_id 4) with principal over 200 000 000 disbursed in 2026, biggest first. How many rows, and what is the biggest?

**P5.** How many rows?

**P6.** *(BETWEEN)* Loans with principal between 1 000 000 and 5 000 000 inclusive.

**P6.** How many loans?

**P7.** *(IN and OR)* How many customers live in Nukus or Termez? Write it once with `OR`, once with `IN`.

**P7.** How many customers?

**P8.** *(LIKE)* Customers whose first name starts with `M`. Then narrow to names starting with `Ma`.

**P8.** How many first names start with `Ma`?

**P9.** *(IS NULL)* Customers with an empty monthly income. Count them. Then count those with a filled income and check the two numbers add up to 6 040.

**P9.** How many customers have an empty monthly income?

**P10.** *(= with AND, and NULLs in ORDER BY)* Applications that came through the app and were rejected, ordered by credit score from highest to lowest. How many, and what is the highest rejected score? Where did the rows with an empty score land?

**P10.** How many rows — rejected app applications?

**P11.** *(AND, OR and brackets)* Approved SME applications (product_id 5) with a requested amount of at least 500 000 000. Count them. Then mix `AND` and `OR` deliberately — write `product_id = 5 AND requested_amount >= 500000000 OR status = 'approved'` — and see what happens.

**P11.** How many approved SME applications of 500 000 000 or more — the right count?

> 🚀 **Stretch (optional, +5 XP).** One more filter for the curious — not needed to finish the day.

**P12.** *(text, numbers and dates together)* Customers born before 1960 with a monthly income above 30 000 000, richest first. How many, and who is first? Then write one sentence on whether this group looks plausible for a mass-market lender.

**P12.** How many customers — and is the group plausible? Write the count and your one sentence.

---

## 4. Homework <span class="badge hw">HW 1.2 — Due Day 4</span>

**HW 1.2 — Bekzod's ten questions:** ten checked queries, and what surprised you in the data.

---

## 5. Self-check

---

## 6. Company corner <span class="badge company">Approval rate</span>

**Definition.** The approval rate (*уровень одобрения*) is the share of loan applications the company said *yes* to:

> **approval rate = approved applications ÷ applications decided**

It is the first number a risk manager looks at after a change in scoring rules, and the first number a sales manager complains about. Two queries, and a division by hand (next week `GROUP BY` and `CASE` do the division for you):

```sql
SELECT COUNT(*) FROM applications;
-- expect 14000
SELECT COUNT(*) FROM applications WHERE status IN ('approved', 'approved_not_disbursed');
-- expect 8595
```

8 595 / 14 000 = **61.4 %**. `approved_not_disbursed` counts as approved: the company *said yes*; the customer walked away. Approval is about our decision, not the customer's.

**The trap — cancelled applications.** Run one more:

```sql
SELECT COUNT(*) FROM applications WHERE status = 'cancelled';   -- expect 1817
```

1 817 applications were withdrawn by the customer before (or without) a decision. Do they belong in the denominator?

| Convention | Denominator | Nur Finance today | Who prefers it |
|---|---|---|---|
| **A. All applications** | every application received | 8 595 / 14 000 = **61.4 %** | Marketing / product: "of everyone who asked, how many got money?" (it is really a funnel conversion) |
| **B. Decided applications** | approved + rejected only (cancelled excluded) | 8 595 / 12 183 = **70.5 %** | Risk: "of the cases *we* decided, how often did we say yes?" — cancellations are not our decision |

> ⚠️ **Watch out.** Nine points of difference from one word. Neither convention is wrong; what is wrong is comparing a 61 % from one report with a 70 % from another and announcing a "jump in approvals". When you quote an approval rate, say which convention — and if the target company has its own definition, use theirs (the glossary will record it).

A third variant you will meet: **disbursed-only**, counting `approved` but not `approved_not_disbursed` (7 917 / 14 000 = 56.6 %). Some teams call this the *take-up* or *conversion to disbursement*; do not let it be called approval rate.

Tomorrow: how the tables were designed, and why the loans spreadsheet had to be split.

> 🎯 **Interview version.** *"How would you calculate approval rate, and what could make two teams report different numbers?"* — Give the formula, then the two denominators (cancelled in or out), then disbursed vs approved. Bonus: mention that approval rate by channel differs (the app channel here approves fewer because scoring is stricter without a branch officer).

**Say it like in an interview.** Write your answer the way you would say it — 30 words or more — then compare it with the model.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 1 · Day 3 — Tables that talk to each other (weeks/week-01/day-3.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-01/day-3
=====

# Week 1 · Day 3 — Tables that talk to each other

<span class="badge">Learn 60 min</span> <span class="badge">Practice 60 min</span> <span class="badge company">Company corner</span>

> STORY **Wednesday, 9:40.** Sevara, head of collections (*взыскание*), arrives with a laptop and a spreadsheet called `loans_FINAL_v7.xlsx`. *"Before the database existed, this was the database. One row per loan, and every time a borrower asked to restructure we added three more columns. It has 212 columns now. Timur from BI says it's 'not normalised'. I don't know what that means; I know that when a branch changes its phone number I have to fix 400 cells."* Madina: *"Today you learn what Timur meant — and you design Sevara a proper table for restructurings."*

## Today in 3 lines

- You can read the **Nur Finance ER diagram** as a list of tables and relationships, and say what each key enforces.
- You can explain **1NF, 2NF, 3NF** on Sevara's spreadsheet and show how it splits into our tables.
- You can **CREATE** a table with types, `PRIMARY KEY`, `NOT NULL`, `UNIQUE` and `FOREIGN KEY`, then **INSERT**, **UPDATE**, **DELETE**, **ALTER** and **DROP** it — on tables of your own, never on the course tables — and you know what `WHERE` does and does not protect you from.

---

## 1. Learn — keys, the diagram, and normal forms

This section has three parts, in this order: **keys** (what each one refuses), **the diagram and the normal forms** (how good tables are cut), and **the six commands** that create, fill, change and remove a table. The boxes run on **your practice copy** of the database, so every command here is safe to try. Tables you make are called `my_…` and appear under **Your tables** in the Database panel.

### Primary key — one value per row, never repeated

**What it is.** On Monday a **primary key** (*первичный ключ*, PK) was "the ID that names one row". One level deeper: a primary key is a **constraint** (*ограничение*) — a rule the database enforces. It refuses a second row with the same value.

**How to write it.** Inside `CREATE TABLE`, after the column's type. Press **▶ Run** — you write `CREATE TABLE` yourself further down; here only watch what the key does.

```sql
-- IF NOT EXISTS: skip this if the table is already there
CREATE TABLE IF NOT EXISTS my_keys_demo (
    customer_id INTEGER PRIMARY KEY,  -- the primary key
    -- must be filled (next subsection)
    first_name  TEXT    NOT NULL,
    -- no two rows with one phone (the one after)
    phone       TEXT    UNIQUE
);
INSERT INTO my_keys_demo VALUES (1, 'Gulbahor', '+998907579830');
INSERT INTO my_keys_demo VALUES (1, 'Aziz', '+998901112233');
-- id 1 again: refused
```

The box ends in red: *UNIQUE constraint failed: my_keys_demo.customer_id*. That refusal is the point — a second customer 1 cannot exist. Open **Database → Your tables → my_keys_demo**: one row, and a **PK** badge next to `customer_id`.

**When you use it.**
- Every table gets one primary key. Check a candidate on real data: as many different values as rows.
- Two kinds of key value:

| | Natural key | Surrogate key (*суррогатный ключ*) |
|---|---|---|
| What it is | a value that means something in the world | a number the database invents |
| Example | a passport number, a phone | `customer_id = 4516` |
| Changes? | yes — people change passports and phones | never |
| Used as the PK? | rarely; kept as an ordinary column | almost always |

```sql
SELECT COUNT(*) AS total_rows, COUNT(DISTINCT loan_id) AS different_ids FROM loans;
-- a ready-made check (COUNT(DISTINCT) is Week 2)
```

7 828 rows and 7 828 different `loan_id`s: every value appears once, so `loan_id` can be the primary key.

> ⚠️ **Watch out.** In SQLite, an `INTEGER PRIMARY KEY` left empty is filled in for you with the next number. Other primary keys must be filled by you — write `NOT NULL` next to them.

**Your turn.** `payments` has 52 875 rows and 52 850 different `installment_id`s. Can `payments.installment_id` be its primary key?

### NOT NULL — a value must be there

**What it is.** **NOT NULL** is a constraint on one column: the cell may not be empty. An insert that leaves the column out is refused.

**How to write it.** After the column's type: `first_name TEXT NOT NULL`.

```sql
CREATE TABLE IF NOT EXISTS my_keys_demo (customer_id INTEGER PRIMARY KEY, first_name TEXT NOT NULL, phone TEXT UNIQUE);
INSERT INTO my_keys_demo (customer_id, phone) VALUES (2, '+998901112233');
-- no first_name: refused
```

*NOT NULL constraint failed: my_keys_demo.first_name* — a customer without a first name is not accepted.

**When you use it.** On every column that must be known **at the moment the row is written**: the loan of a payment, the date of an application, a status. Leave it off a column that is honestly unknown at first: a decision date while the application waits, an income nobody reported.

**Your turn.** For a new `loans` table, which columns should be NOT NULL?

### UNIQUE — no two rows share a value

**What it is.** **UNIQUE** is a constraint on a column that is not the primary key: no two rows may hold the same value in it. A primary key is meant to be UNIQUE and NOT NULL at once — SQL Server and PostgreSQL enforce both; SQLite does only for `INTEGER PRIMARY KEY`, so on any other primary key write `NOT NULL` yourself (the Watch out above).

**How to write it.** After the column's type: `phone TEXT UNIQUE`.

```sql
CREATE TABLE IF NOT EXISTS my_keys_demo (customer_id INTEGER PRIMARY KEY, first_name TEXT NOT NULL, phone TEXT UNIQUE);
INSERT INTO my_keys_demo VALUES (3, 'Aziz',    '+998905550000');
INSERT INTO my_keys_demo VALUES (4, 'Dilnoza', '+998905550000');
-- the same phone again: refused
```

*UNIQUE constraint failed: my_keys_demo.phone*.

**When you use it.** For a second identifier that must not repeat: a tax number, a contract number, `loans.application_id` (one application gives at most one loan).

> ⚠️ **Watch out.** Put UNIQUE only on what is truly unique in the business. In `customers`, 6 040 rows hold 5 997 different phones: families share a number. A UNIQUE phone would refuse real people. (Some of the 43 repeats are not families — Thursday's case.) Empty cells are a special case: in SQLite and PostgreSQL a UNIQUE column accepts any number of NULLs, SQL Server only one.

**Your turn.** Which constraint enforces the rule "one application gives at most one loan"?

### Foreign key — the value must exist in the parent

**What it is.** A **foreign key** (*внешний ключ*, FK) as a constraint enforces **referential integrity** (*ссылочная целостность*): the data cannot point at nothing. It refuses two things:
1. a child row whose key value does not exist in the parent (a loan for customer 999999);
2. deleting a parent that still has children (unless the design says *cascade*).

It allows a parent with many children — that is one-to-many — and a parent with none.

**How to write it.** At the end of `CREATE TABLE`: `FOREIGN KEY (column) REFERENCES parent_table(parent_key)`. The parent column must be its table's PRIMARY KEY (or UNIQUE).

```sql
PRAGMA foreign_keys = ON;
-- SQLite checks foreign keys only after this line, in the same box
CREATE TABLE IF NOT EXISTS my_keys_demo (customer_id INTEGER PRIMARY KEY, first_name TEXT NOT NULL, phone TEXT UNIQUE);
CREATE TABLE IF NOT EXISTS my_loans_demo (
    loan_id     INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    -- the customer must exist
    FOREIGN KEY (customer_id) REFERENCES my_keys_demo(customer_id)
);
INSERT INTO my_loans_demo VALUES (1, 999999);
-- customer 999999 does not exist: refused
```

*FOREIGN KEY constraint failed*. `my_loans_demo` stays empty.

**When you use it.** On every column that points to another table: `loans.customer_id`, `installments.loan_id`, `payments.installment_id`.

> ⚠️ **Watch out.** The course tables are a teaching copy loaded from CSV files. They declare **no** PRIMARY KEY or FOREIGN KEY, so nothing in them would refuse a bad row. The joins work because the data is consistent, not because the engine checks it. And SQLite skips foreign-key checks unless `PRAGMA foreign_keys = ON` runs first; SQL Server always checks.

**Your turn.** With the foreign key above switched on, which insert into `my_loans_demo` is refused?

### Composite key — two columns together

**What it is.** A **composite key** (*составной ключ*) is a primary key made of two or more columns. Each column alone may repeat; the **pair** must not.

**How to write it.** A separate line at the end: `PRIMARY KEY (column1, column2)`.

```sql
CREATE TABLE IF NOT EXISTS my_schedule_demo (
    loan_id        INTEGER NOT NULL,
    installment_no INTEGER NOT NULL,
    due_date       TEXT    NOT NULL,
    PRIMARY KEY (loan_id, installment_no)  -- the pair is the key
);
INSERT INTO my_schedule_demo VALUES (1, 1, '2025-04-28'), (1, 2, '2025-05-28'), (2, 1, '2026-01-05');
-- loan 1 twice, number 1 twice: fine
INSERT INTO my_schedule_demo VALUES (1, 2, '2025-06-28');
-- the pair (1, 2) again: refused
```

The first insert adds three rows: loan 1 appears twice and instalment number 1 appears twice, but every pair is new. The second is refused: loan 1 already has an instalment number 2.

**When you use it.** When a row is named by two things together: an instalment by (loan, number), a day's balance by (loan, date). In practice designers often add a one-column **surrogate** key instead — `installments.installment_id` — because one column is easier to point at.

**Your turn.** In `installments`, the pair `(loan_id, installment_no)` is unique on all 92 193 rows. What does that tell you?

### Reading the ER diagram

**What it is.** An **entity-relationship diagram** (ER diagram, *ER-диаграмма*) is the floor plan of a database: one box per table (an **entity**), one line per foreign key (a **relationship**), with its **cardinality** — how many rows on each side.

**How to write it.** Lines run from the one side to the many side. `1 — ∞` is one-to-many; `1 — 0..1` is one-to-at-most-one.

```text
customers ─┐
products  ─┤
branches  ─┤
staff     ─┤ (officer)
           │
           │ 1──∞
           ▼
applications
   │
   │ 1──0..1
   ▼
loans
   ├─1──∞─▶ installments
   │          │
   │          │ 1──∞
   │          ▼
   │        payments
   │
   └─1──∞─▶ collections_actions
                  ▲
                  │ ∞──1
            staff (collector)

branches ─1──∞─▶ staff
```

Not drawn, to keep the picture readable: `loans` also points straight to `customers`, `products` and `branches`, and `payments` also points to `loans`. The list has every line.

The same diagram as a list (compare it with your Day-1 P10 sketch):

| Relationship | Cardinality | Key column |
|---|---|---|
| customers → applications | 1 — ∞ | `applications.customer_id` |
| products → applications | 1 — ∞ | `applications.product_id` |
| branches → applications | 1 — ∞ | `applications.branch_id` |
| staff → applications (officer) | 1 — ∞ | `applications.officer_id` |
| applications → loans | 1 — 0..1 | `loans.application_id`, unique |
| customers → loans | 1 — ∞ | `loans.customer_id` |
| products → loans | 1 — ∞ | `loans.product_id` |
| branches → loans | 1 — ∞ | `loans.branch_id` |
| loans → installments | 1 — ∞ | `installments.loan_id` |
| loans → payments | 1 — ∞ | `payments.loan_id` |
| installments → payments | 1 — ∞ | `payments.installment_id` |
| loans → collections_actions | 1 — ∞ | `collections_actions.loan_id` |
| staff → collections_actions (collector) | 1 — ∞ | `collections_actions.collector_id` |
| branches → staff | 1 — ∞ | `staff.branch_id` |
| customers → app_events, applications → app_events | 1 — ∞ | two keys |
| dim_date → (any date column) | 1 — ∞ | by convention, not a declared key |

**When you use it.** Before a query that crosses tables, find the path on the diagram. `payments` has *two* keys into the loan world (the loan and the instalment), so you can see partial and late payments per instalment.

**Your turn.** Connect each child column to the parent key it points at.

### Normalisation — one fact, one place

**What it is.** **Normalisation** (*нормализация*) is the procedure that cuts data into tables so that **each fact is stored once**. When a fact is stored in many cells, three **anomalies** (*аномалии*) appear:

| Anomaly | What goes wrong | In Sevara's sheet |
|---|---|---|
| **update** | a change must be made in many cells, and some get missed | a branch gets a new phone: 400 cells to fix, 12 missed |
| **insert** | you cannot record one fact without another | a new branch cannot be recorded until it has a loan |
| **delete** | removing one fact removes another | delete a branch's last loan, and the branch's phone is gone |

**How to write it.** Here are eight of the 212 columns of Sevara's `loans_FINAL_v7.xlsx`, two rows:

| loan_id | customer | phone | product | rate | branch_phone | inst1_due | inst1_paid | inst2_due | inst2_paid | … |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Kamola Saidova | +99890… | Consumer loan | 0.30 | 71-200-01-01 | 2025-04-28 | 2025-04-27 | 2025-05-28 | 2025-05-30 | … |
| 2 | Kamola Saidova | +99890… | Consumer loan | 0.30 | 71-200-01-01 | 2025-12-05 | 2026-01-05 | 2026-01-05 | | … |

The customer, the product's rate and the branch's phone are repeated on every row. The three **normal forms** (*нормальные формы*) below each remove one kind of repetition.

**When you use it.** When you design a table (Sevara's restructurings below) and when you read someone else's spreadsheet: count how many cells you would change for one real-world change.

**Your turn.** "When Tashkent Central gets a new phone, Sevara fixes 400 cells and misses 12." Which anomaly is that?

### 1NF — one value per cell, no repeating groups

**What it is.** A table is in **first normal form** (1NF) when every cell holds **one value** and no fact is repeated across columns (`inst1_…`, `inst2_…` is a **repeating group**).

**How to write it.** Before and after:

A 48-month Auto loan needs 48 rows, a 3-month BNPL loan 3 — no empty columns, no limit.

**When you use it.** Whenever you see numbered columns (`phone1, phone2`, `action1_type, action2_type`) or a cell with a list (`'+99890…, +99893…'`): turn them into rows of their own table.

**Your turn.** A sheet has one cell holding two phone numbers: `+998901112233, +998935554433`. Which form does it break?

### 2NF — every column depends on the whole key

**What it is.** A table with a composite key is in **second normal form** (2NF) when every other column depends on **the whole key**, not on part of it.

**How to write it.** Before — key `(loan_id, installment_no)`, but `customer_name` depends on `loan_id` alone:

| loan_id | installment_no | due_date | customer_name |
|---|---|---|---|
| 1 | 1 | 2025-04-28 | Gulbahor Sobirova |
| 1 | 2 | 2025-05-28 | Gulbahor Sobirova |

After — what depends on the loan goes to the loan's table:

| `installments` | loan_id | installment_no | due_date |
|---|---|---|---|
| | 1 | 1 | 2025-04-28 |
| | 1 | 2 | 2025-05-28 |

| `loans` | loan_id | customer_id |
|---|---|---|
| | 1 | 3473 |

**When you use it.** Only with a composite key. With a one-column surrogate key a table is in 2NF automatically.

**Your turn.** The key is `(loan_id, installment_no)`. Which column breaks 2NF?

### 3NF — no column depends on another ordinary column

**What it is.** A table is in **third normal form** (3NF) when no column depends on another **non-key** column. If `rate` follows from `product`, it belongs to the product, not to the loan.

**How to write it.** Before — `branch_phone` follows from `branch_id`:

| loan_id | branch_id | branch_phone |
|---|---|---|
| 1 | 10 | 76-200-10-10 |
| 7 | 10 | 76-200-10-10 |

After — the phone lives once, on the branch:

| `loans` | loan_id | branch_id |
|---|---|---|
| | 1 | 10 |
| | 7 | 10 |

| `branches` | branch_id | phone |
|---|---|---|
| | 10 | 76-200-10-10 |

A new phone for branch 10 is now one cell, not one per loan.

**When you use it.** Ask of every column: "does this describe the row's own thing, or something the row points to?" A customer's region on a loan row, a product's rate, a collector's branch — each belongs to the table it describes.

> ⚠️ **Watch out.** Sometimes a copy is kept on purpose. `loans.annual_rate` repeats the product's rate on every loan — today it matches `products.annual_rate` on all 7 828 rows. It is a **snapshot**: if the product's rate changes next year, old loans must keep the rate they were signed at. A deliberate, documented copy is a **controlled denormalisation**; an accidental one is a 3NF violation.

**Your turn.** Put each problem under the normal form it breaks.

After the three fixes, Sevara's one sheet *is* our eleven tables: normalisation is the procedure that produced them. Tomorrow you see the other side of the trade — warehouses de-normalise on purpose, because reading many tables costs joins.

### DDL and DML — two families of commands

**What it is.** Six commands build and change tables. They come in two families:
- **DDL** (Data Definition Language, *язык определения данных*) changes the **shape** of a table: `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`.
- **DML** (Data Manipulation Language, *язык манипулирования данными*) changes the **rows**: `INSERT`, `UPDATE`, `DELETE`.

**How to write it.** Every box from here on uses two tables of your own: `my_collectors` (the parent) and `my_calls` (a log of collection calls, the child). Each command's **Your turn** builds a third table, `my_promises`, step by step. Run the boxes in order.

| Command | Family | Does |
|---|---|---|
| `CREATE TABLE` | DDL | makes a new, empty table |
| `INSERT` | DML | adds rows |
| `UPDATE` | DML | changes values in rows that exist |
| `DELETE` | DML | removes rows |
| `ALTER TABLE` | DDL | changes the columns of a table that exists |
| `DROP TABLE` | DDL | removes the whole table |

**When you use it.** **Rule for this course: DDL and DML only on tables whose name starts with `my_` or `scratch_`.** The eleven course tables are for reading. Change them, and every "expect 7828" on every page stops being true. If it happens anyway, **Database → ↺ Reset** brings the original data back; homework checks always read the original.

**Your turn.** Sort the six commands into their families.

### CREATE TABLE — make an empty table

**What it is.** **CREATE TABLE** makes a new, empty table. You name the table, then list each column with its type and its constraints.

**How to write it.**

```sql
-- the shape only: replace the names before you run it
CREATE TABLE table_name (
    column1  TYPE  PRIMARY KEY,  -- the key
    column2  TYPE  NOT NULL,     -- must be filled
    column3  TYPE,               -- may be empty
    -- optional: column2 points to another table
    FOREIGN KEY (column2) REFERENCES parent(parent_key)
);
```

The two tables for this section:

```sql
CREATE TABLE my_collectors (
    -- SQL Server: INT NOT NULL PRIMARY KEY
    collector_id  INTEGER NOT NULL PRIMARY KEY,
    -- SQL Server: NVARCHAR(100)
    full_name     TEXT    NOT NULL,
    branch_id     INTEGER NOT NULL
);
CREATE TABLE my_calls (
    -- filled in for you: 1, 2, 3 and on
    call_id       INTEGER PRIMARY KEY,
    loan_id       INTEGER NOT NULL,
    collector_id  INTEGER NOT NULL,
    -- a date as 'YYYY-MM-DD'; SQL Server: DATE
    called_on     TEXT    NOT NULL,
    -- may be empty until we know
    outcome       TEXT,
    FOREIGN KEY (collector_id) REFERENCES my_collectors(collector_id)
);
```

The box answers *✓ Done — table created*. In **Database → Your tables** you now see `my_collectors` and `my_calls`, each with **0** rows, their columns with types, and a **PK** badge. A second run answers *table my_collectors already exists*: the tables are already in your copy.

Types by engine:

| Need | SQLite (this site) | SQL Server | PostgreSQL |
|---|---|---|---|
| whole number / id | `INTEGER` | `INT`, `BIGINT` | `INT`, `BIGINT` |
| money (UZS, no fractions) | `INTEGER` | `BIGINT` or `DECIMAL(18,0)` | `BIGINT` / `NUMERIC` |
| rate, ratio | `REAL` | `DECIMAL(10,4)` | `NUMERIC(10,4)` |
| text | `TEXT` | `NVARCHAR(100)` | `VARCHAR(100)` |
| date / date-time | `TEXT` (`YYYY-MM-DD`) | `DATE` / `DATETIME2` | `DATE` / `TIMESTAMP` |
| auto-numbered id | `INTEGER PRIMARY KEY` | `INT IDENTITY(1,1)` | `GENERATED … AS IDENTITY` |

SQLite treats a column's type as a preference, not a rule: it stores the text `'abc'` in an `INTEGER` column without a word, where SQL Server and PostgreSQL refuse it. One more reason to look at the data, not only at the design.

**When you use it.** To keep a result, a list or a log of your own: a lookup table, a list of loans to watch, a design to test.

> ⚠️ **Watch out.** `CREATE TABLE new AS SELECT …` (Day 2's lab) makes and fills a table in one go — but copies no PRIMARY KEY, NOT NULL or FOREIGN KEY. Use it for quick copies, not for a design.

**Your turn.** Create `my_promises` — the promises to pay that collectors record.

> 🎬 **Didn't get CREATE TABLE?** [Baraa explains it · 6 min](https://youtu.be/SSKVgrwhzus?t=5549&end=5915)

### INSERT — add rows

**What it is.** **INSERT** adds new rows to a table. It never changes rows that are already there.

**How to write it.** Three forms:

```sql
-- the shape only: replace the names before you run it
INSERT INTO table_name (column1, column2) VALUES (value1, value2);
-- one row
INSERT INTO table_name (column1, column2) VALUES (v1, v2), (v3, v4);
-- several rows, one bracket each
INSERT INTO table_name (column1, column2) SELECT colA, colB FROM other_table;
-- the rows a query returns
```

One row — a new collector:

```sql
INSERT INTO my_collectors (collector_id, full_name, branch_id)
VALUES (901, 'Aziza Karimova', 1);
```

*✓ Done — 1 row changed*. From a query — every real collector from `staff`:

```sql
INSERT INTO my_collectors (collector_id, full_name, branch_id)
SELECT staff_id, full_name, branch_id
FROM staff
WHERE role = 'collector';
```

*30 rows changed* — the 30 collectors of Nur Finance. `my_collectors` now holds 31 rows. Several rows at once — three calls (the `call_id` fills itself):

```sql
INSERT INTO my_calls (loan_id, collector_id, called_on, outcome)
VALUES (2242, 7,   '2026-09-29', 'no_answer'),
       (4567, 8,   '2026-09-29', 'promise_to_pay'),
       (4503, 901, '2026-09-30', NULL);
SELECT * FROM my_calls;
```

3 rows, with `call_id` 1, 2 and 3. The third call has no outcome yet: NULL.

**When you use it.** To fill a table you created: by hand (`VALUES`) or from the company's data (`SELECT`).

> ⚠️ **Watch out.** Always list the columns. `INSERT INTO t VALUES (…)` without them depends on the column order and breaks the day someone adds a column. And a foreign key is checked only if the box starts with `PRAGMA foreign_keys = ON` — try it:

```sql
PRAGMA foreign_keys = ON;
INSERT INTO my_calls (loan_id, collector_id, called_on) VALUES (1, 999, '2026-10-01');
-- collector 999 does not exist
```

*FOREIGN KEY constraint failed*. Without the first line, SQLite would accept the call by a collector who does not exist.

**Your turn.** Put three promises into `my_promises`.

> 🎬 **Didn't get INSERT with VALUES?** [Baraa explains it · 9 min](https://youtu.be/SSKVgrwhzus?t=6228&end=6744)

> 🎬 **Didn't get INSERT from a SELECT?** [Baraa explains it · 5 min](https://youtu.be/SSKVgrwhzus?t=6744&end=7036)

### UPDATE … SET … WHERE — change rows

**What it is.** **UPDATE** changes values in rows that already exist. `SET` says which columns get which new values. `WHERE` says which rows.

**How to write it.**

```sql
-- the shape only: replace the names before you run it
UPDATE table_name
SET    column1 = new_value1, column2 = new_value2  -- what changes
WHERE  condition;
-- on which rows; without WHERE: on every row
```

Call 1 turned out well: the borrower paid on 1 October. First look at the row with the same `WHERE`, then change it:

```sql
SELECT * FROM my_calls WHERE call_id = 1;
UPDATE my_calls SET outcome = 'paid', called_on = '2026-10-01' WHERE call_id = 1;
SELECT * FROM my_calls;
```

The `UPDATE` changes 1 row. The final `SELECT` shows call 1 with `outcome` *paid* and the new date; calls 2 and 3 are untouched.

**When you use it.** To correct or complete rows: a status that moved, a date that became known, a typo.

> ⚠️ **Watch out.** `UPDATE` without `WHERE` changes **every** row, with no warning and no undo. Write the `WHERE` first, run it as a `SELECT`, look at the rows, then change the verb.

**Your turn.** The borrower of loan 4567 kept the promise.

> 🎬 **Didn't get UPDATE?** [Baraa explains it · 7 min](https://youtu.be/SSKVgrwhzus?t=7038&end=7433)

### DELETE … WHERE — remove rows

**What it is.** **DELETE** removes whole rows. `WHERE` says which ones. The table itself stays, with its columns.

**How to write it.**

```sql
-- the shape only: replace the names before you run it
DELETE FROM table_name
WHERE condition;          -- without WHERE: every row
```

Call 3 was entered by mistake:

```sql
DELETE FROM my_calls WHERE call_id = 3;
SELECT * FROM my_calls;
```

Two calls are left. In the Database panel, `my_calls` now shows 2 rows.

**When you use it.** To remove rows that should not be there: a mistaken entry, a test row, rows outside your report.

> ⚠️ **Watch out.** There is no undo. On a course table, **↺ Reset** saves you; at work, only a backup does.

**Your turn.** The promise on loan 4503 was cancelled.

> 🎬 **Didn't get DELETE?** [Baraa explains it · 4 min](https://youtu.be/SSKVgrwhzus?t=7433&end=7662)

> ⚠️ **Quirk: SQLite has no `TRUNCATE`.**
>
> - **You expect:** `TRUNCATE TABLE my_calls` to empty the table, as in SQL Server and PostgreSQL.
> - **What happens:** SQLite stops with *syntax error*: it does not know the word.
> - **Why:** SQLite keeps one command for removing rows. `DELETE FROM t` with no `WHERE` is its fast way to empty a table.
> - **Protect yourself:** when a script from another database says `TRUNCATE TABLE t`, read it as "delete **every** row of t".

```sql
SELECT COUNT(*) AS calls FROM my_calls;
-- SQLite: syntax error, nothing changes
TRUNCATE TABLE my_calls;
```

The box stops at the second line with *near "TRUNCATE": syntax error*, and `my_calls` keeps its rows.

> ⚠️ **Quirk: every statement is saved the moment it runs.**
>
> - **You expect:** a chance to undo, like Ctrl+Z in Excel or a *Save* button.
> - **What happens:** `UPDATE` and `DELETE` are saved at once (*autocommit*). There is nothing to undo.
> - **Why:** each statement is its own small **transaction** — a group of changes that is kept or thrown away as a whole — and it is kept automatically.
> - **Protect yourself:** open the transaction yourself. `BEGIN` starts it, `ROLLBACK` throws away every change since `BEGIN`, `COMMIT` keeps them. At work: `BEGIN`, the change, a `SELECT COUNT(*)` to check it, then `COMMIT` or `ROLLBACK`.

```sql
BEGIN;
DELETE FROM products;     -- all 5 gone…
SELECT COUNT(*) AS inside_the_transaction
FROM products;
ROLLBACK;                 -- …and back
```

The box shows 0: inside the transaction the table is empty, and its last line says the change was rolled back. All five rows are back; check:

```sql
SELECT COUNT(*) AS after_rollback
FROM products;            -- 5
```

### ALTER TABLE — change the columns

**What it is.** **ALTER TABLE** changes the shape of a table that already exists, without losing its rows: add a column, rename a column, rename the table, remove a column.

**How to write it.**

```sql
-- the shape only: replace the names before you run it
ALTER TABLE table_name ADD COLUMN column_name TYPE;
-- SQL Server: ALTER TABLE t ADD column_name TYPE;
ALTER TABLE table_name RENAME COLUMN old_name TO new_name;
-- SQL Server: EXEC sp_rename 't.old_name', 'new_name', 'COLUMN';
ALTER TABLE table_name RENAME TO new_table_name;
ALTER TABLE table_name DROP COLUMN column_name;
```

Sevara wants a free-text note on each call:

```sql
ALTER TABLE my_calls ADD COLUMN note TEXT;
UPDATE my_calls SET note = 'asked to call back after 18:00' WHERE call_id = 2;
SELECT * FROM my_calls;
```

Every existing row got the new column `note`, empty (NULL); the `UPDATE` filled it on call 2. The Database panel lists `note` as the sixth column of `my_calls`.

**When you use it.** When a table you own needs one more fact: a flag, a note, a date.

**Your turn.** Collectors also want a note on each promise.

> 🎬 **Didn't get ALTER TABLE?** [Baraa explains it · 3 min](https://youtu.be/SSKVgrwhzus?t=5915&end=6123)

### DROP TABLE — remove the whole table

**What it is.** **DROP TABLE** removes a table: its rows, its columns and its constraints. `DELETE` without `WHERE` empties a table but keeps it; `DROP` makes it disappear.

**How to write it.**

```sql
-- the shape only: replace the names before you run it
DROP TABLE table_name;
DROP TABLE IF EXISTS table_name;     -- no error if the table is not there
```

The demo tables from the keys subsections are done. Drop the child first, then the parent:

```sql
DROP TABLE IF EXISTS my_loans_demo;     -- the child: it points to my_keys_demo
DROP TABLE IF EXISTS my_keys_demo;      -- the parent
DROP TABLE IF EXISTS my_schedule_demo;
```

*✓ Done — table removed*. The three tables vanish from **Your tables**.

| | `DELETE FROM t;` | `DROP TABLE t;` |
|---|---|---|
| Rows | all gone | all gone |
| The table and its columns | stay, empty | gone |
| Undo | none | none |

**When you use it.** To clean up tables you no longer need, and before re-creating a table from scratch.

> ⚠️ **Watch out.** SQL Server refuses to drop a parent while a foreign key still points at it — drop the child first. SQLite, with `PRAGMA foreign_keys` off, does not stop you, and the child is left pointing at nothing.

**Your turn.** You will not need `my_promises` again. (Do this step last.)

### What WHERE protects you from — and what it does not

**What it is.** In `UPDATE` and `DELETE`, **WHERE** is the only thing between "change one row" and "change every row". It protects you **only** as far as it is right.

| WHERE protects you when… | WHERE does **not** protect you when… |
|---|---|
| it names exactly the rows you mean | it is missing: every row changes |
| it uses the primary key: `WHERE call_id = 2` hits at most one row | it uses an ordinary column that matches more rows than you think |
| | it matches nothing (`= NULL`, `'Paid'` for `'paid'`, a wrong id): *0 rows changed*, no error |
| | the command has no WHERE at all: `DROP TABLE`, `ALTER TABLE` |

**How to write it.** The safe habit, in four moves:
1. Write the `WHERE` first.
2. Run it as `SELECT COUNT(*) … WHERE …` and look at the number.
3. Change the verb to `UPDATE … SET` or `DELETE`, keeping the same `WHERE`.
4. Read the message: *n rows changed* must equal the count from move 2.

```sql
SELECT COUNT(*) FROM my_collectors WHERE branch_id = 1;
-- move 2: how many rows would this WHERE hit?
```

4 rows — Aziza Karimova and the three real collectors of branch 1. A `DELETE … WHERE branch_id = 1` meant for Aziza would remove four people.

```sql
UPDATE my_collectors SET branch_id = 2 WHERE full_name = 'aziza karimova';
-- lower case: matches nothing
```

*✓ Done — 0 rows changed*. No error: in SQLite `=` is case-sensitive, so the row stayed in branch 1. Check the count of every change you make.

**When you use it.** Before every `UPDATE` and `DELETE`, for the rest of your career.

**Your turn.** Find the line that makes this statement dangerous.

### Putting it together

The life of one table, every command in order. Run the box once:

```sql
-- CREATE: the shape, with a key and NOT NULLs
CREATE TABLE my_visits (
    visit_id   INTEGER PRIMARY KEY,
    branch_id  INTEGER NOT NULL,
    visited_on TEXT    NOT NULL,
    purpose    TEXT
);
-- INSERT: several rows
INSERT INTO my_visits (branch_id, visited_on, purpose)
VALUES (1, '2026-10-01', 'audit'), (4, '2026-10-02', 'training'), (9, '2026-10-03', 'audit');
UPDATE my_visits SET purpose = 'audit and training' WHERE visit_id = 1;
-- UPDATE: one row, by its key
DELETE FROM my_visits WHERE visit_id = 3;
-- DELETE: one row, by its key
ALTER TABLE my_visits ADD COLUMN visitor TEXT;
-- ALTER: one more column
SELECT * FROM my_visits;
-- look at the result
```

2 rows: visit 1 to branch 1 (*audit and training*) and visit 2 to branch 4 (*training*), each with an empty `visitor`. When you are done, clean up — DROP:

```sql
DROP TABLE IF EXISTS my_visits;
DROP TABLE IF EXISTS my_calls;          -- the child first
DROP TABLE IF EXISTS my_collectors;     -- then the parent
```

Read the first box against this section: the **primary key** names each visit, **NOT NULL** guards the branch and the date, the **WHERE** of `UPDATE` and `DELETE` uses the key, so each hits exactly one row.

### Depth (optional)

- ▶ Baraa, *DDL commands* [1:32:31](https://youtu.be/SSKVgrwhzus?t=5551&end=6224) — 11 min; ▶ *DML commands* [1:43:44](https://youtu.be/SSKVgrwhzus?t=6224&end=7683) — 25 min.
- RU deck (TBC Data Analytics 2.0, if you have it) `1.2 Database Modeling & Normalization.pdf`, the pages on ER-диаграмма, 1НФ/2НФ/3НФ and аномалии. *Russian terms:* сущность = entity, связь = relationship, нормализация = normalisation, избыточность = redundancy.

---

## 2. Worked example — a table for Sevara

*"When a borrower can't pay, we sometimes stretch the loan: new term, smaller monthly payment. Today that lives in three columns of my sheet per restructuring. Design it properly."* Each step names the idea from Learn that it uses.

**Step 1 — what is one row? (primary key, one-to-many).** One restructuring *event* of one loan. A loan can be restructured more than once → `loans 1 — ∞ restructurings`. So `loan_id` is a foreign key, not the primary key; the event gets its own key, `restructuring_id`.

**Step 2 — what do we need to know about the event? (columns and types).** When it was requested and decided (dates); the old and new term (whole numbers); the new monthly payment (money, a whole number); the reason (a short text code); who approved it (a staff member); the status (`requested`, `approved`, `rejected`, `active`, `completed`).

**Step 3 — what must never be empty? (NOT NULL).** The loan, the request date, the terms, the reason, the status. The decision date, the approver and the new payment stay empty while the request waits.

**Step 4 — what points elsewhere? (FOREIGN KEY).** `loan_id` → the loans, `approved_by` → staff. Our course tables declare no keys, so the foreign keys point at two small keyed copies of the ids.

**Step 5 — what did we *not* put in? (3NF).** The customer's name (reachable via loan → customer), the product's rate (via loan → product), the approver's branch (via staff). Each would be a 3NF violation and a future "fix 400 cells".

**Step 6 — write it (CREATE TABLE).**

```sql
-- SQL Server
-- the keyed copies the foreign keys point at
CREATE TABLE scratch_loan_keys  (loan_id  INT NOT NULL PRIMARY KEY);
INSERT INTO scratch_loan_keys  (loan_id)  SELECT loan_id  FROM loans;
CREATE TABLE scratch_staff_keys (staff_id INT NOT NULL PRIMARY KEY);
INSERT INTO scratch_staff_keys (staff_id) SELECT staff_id FROM staff;

CREATE TABLE scratch_restructurings (
    restructuring_id   INT IDENTITY(1,1) PRIMARY KEY,
    loan_id            INT           NOT NULL,
    requested_on       DATE          NOT NULL,
    decided_on         DATE          NULL,
    old_term_months    INT           NOT NULL,
    new_term_months    INT           NOT NULL,
    new_monthly_payment BIGINT       NULL,
    -- 'job_loss', 'illness', 'business_down', 'other'
    reason_code        NVARCHAR(30)  NOT NULL,
    approved_by        INT           NULL,
    status             NVARCHAR(20)  NOT NULL,
    FOREIGN KEY (loan_id)     REFERENCES scratch_loan_keys(loan_id),
    FOREIGN KEY (approved_by) REFERENCES scratch_staff_keys(staff_id)
);
-- SQLite: replace restructuring_id's type with  INTEGER PRIMARY KEY
-- AUTOINCREMENT,
-- INT → INTEGER, BIGINT → INTEGER, NVARCHAR(n) → TEXT, DATE → TEXT.
```

Sevara reads the column list and says "yes, that's all of it, and it's ten columns, not three per event". That sentence — a business user recognising their process in your table — is the test of a good design. In Practice you build it, step by step, in the SQLite dialect this site runs (INSERT, UPDATE and DELETE included).

---

## 3. Practice (60 min)

Every question has its own answer box; P8–P10 are one guided lab that runs on your practice copy. Answer, check, read why — your answers are saved in this browser. The questions follow the order of Learn; the label in italics names the idea each one trains.

**P1.** *(primary key)* Run `SELECT COUNT(*), COUNT(DISTINCT customer_id) FROM loans;`. 7 828 rows hold only 4 335 different `customer_id`s. What does that prove about `loans.customer_id`?

**P2.** *(composite key)* In `installments`, which columns would be a valid *composite* natural key — and why did the designers add `installment_id` anyway?

**P3.** *(NOT NULL and UNIQUE)* You re-create `customers` with constraints. Which of these fit the business as it is? Tick all.

**P4.** *(foreign key)* Which of these does a FOREIGN KEY from `loans.customer_id` to `customers.customer_id` **prevent**? Tick all.

**P5.** *(the ER diagram)* From the ER list, tick every table that has a foreign key pointing **to** `staff`.

**P6.** *(1NF and 3NF)* Here is a table Timur found on a shared drive, `collections_log`:

| action_id | loan_id | customer_name | customer_phone | collector_name | collector_branch | branch_region | action1_type | action1_date | action2_type | action2_date |
|---|---|---|---|---|---|---|---|---|---|---|

Name every normalisation problem you see and which normal form it breaks.

**P7.** *(3NF and controlled denormalisation)* `loans` stores `customer_id` although it is reachable through `applications`. Is this a 3NF violation? Argue both sides in two sentences each.

**P8–P10. Lab — Sevara's restructurings** *(CREATE TABLE, INSERT, UPDATE, DELETE)*. Build the worked example's table in the SQLite dialect this site runs, fill it with three real requests, approve one, undo one, and show Sevara the result next to each loan. The lab ticks each step off as your practice copy reaches it.

Look at `term_months` in your `scratch_sevara_list`: loan 2242 really runs 6 months and loan 4567 24 — not the 24 you typed as `old_term_months` for both. A stored copy of a fact that lives elsewhere is already a redundancy you must keep in sync; a stricter design would read the old term from `loans` and store only the new one. And if you forgot the `WHERE` on the update, every row was approved — **↺ Start over** and redo it; that is exactly why the rule says scratch tables only.

**P11.** *(foreign key: does the engine enforce it?)* Try to insert a restructuring for `loan_id = 999999` (it is not in `scratch_loan_keys`). On this site — SQLite, with foreign keys switched off, which is the engine's own default — what happens?

**P12.** *(ALTER TABLE)* Sevara wants to record the channel of each request (`branch`, `app`, `phone`) in `scratch_restructurings`, which already holds rows. Which statement?

**P13.** *(DROP TABLE vs DELETE)* What is left after `DELETE FROM scratch_sevara_list;` — and after `DROP TABLE scratch_sevara_list;`?

**P14.** *(what WHERE does not protect you from)* You run `UPDATE scratch_restructurings SET status = 'rejected' WHERE status = 'Requested';` and the box says *0 rows changed*. What happened?

> 🚀 **Stretch (optional, +5 XP).** **P15.** *(design: keys, NOT NULL, 3NF)* Design a `scratch_promises` table: a collector records a borrower's *promise to pay* (loan, collector, date promised, amount promised, date actually paid or empty, kept yes/no). List its columns, say which are NOT NULL and which are FKs, and explain one column you deliberately left out. (Write the `CREATE TABLE` in any box if you like — it is a scratch table.)

---

## 4. Self-check

---

## 5. Company corner <span class="badge company">DPD, buckets, FPD</span>

**DPD — days past due** (*дни просрочки*). For one loan on a given date: the number of days since the due date of its **oldest unpaid instalment**. A loan whose May instalment is still unpaid in October is 150-odd days past due — even if the borrower paid June, July and August on time. Zero if nothing is overdue.

Why the *oldest* unpaid, not the latest? Because that is how the debt ages. The May instalment has been owed since May; paying later instalments while skipping an earlier one does not make the old debt younger. Most core banking systems also apply any payment to the oldest open instalment first (FIFO), so "oldest unpaid" and "how long has this borrower been in arrears" are the same thing.

> 💡 **Key idea.** DPD counts from the **oldest** instalment that is not *fully* paid. Later payments, and partial payments, do not reset the clock.

**Buckets** (*корзины просрочки*). DPD is grouped into bands so that a portfolio can be described in five numbers:

| Bucket | DPD | Meaning | Who acts |
|---|---|---|---|
| 0 | 0 | current | nobody |
| 1–30 | 1 to 30 | early arrears, usually forgetfulness | SMS, app push |
| 31–60 | 31 to 60 | a real problem is forming | calls |
| 61–90 | 61 to 90 | last chance before "bad" | visits, restructuring offer |
| 90+ | over 90 | **non-performing** (NPL) in most regulations | legal, write-off process |

Nur Finance as of 2026-10-01 (you will compute this yourself next week, on Week 2 · Day 3; today just read the shape): 413 loans have at least one matured instalment that is not fully paid; by bucket **14 / 124 / 25 / 16 / 234** for 0 (due today) / 1–30 / 31–60 / 61–90 / 90+. Bucket 0 means DPD 0 (nothing late); this list holds only the 14 DPD-0 loans whose instalment falls due today — counted over the whole book, bucket 0 is 7 429 loans (7 828 − 399 late), as Week 8 shows. The 90+ pile is big because the dataset keeps written-off loans in `loans` with their unpaid schedules: 234 = 190 `written_off` + 44 `default` — the status column and the DPD computation agree, which is the first check you run on any portfolio report.

> ⚠️ **Watch out.** "Not *fully* paid": an instalment with a partial payment is still past due. If you count only instalments with no payment at all you get 399 loans and a 90+ bucket of 217 — a wrong number that looks perfectly reasonable.

**FPD / SPD / TPD — first, second, third payment default** (*дефолт по первому платежу*). A loan is an FPD if its **1st instalment** was not paid within X days of its due date; SPD and TPD the same for the 2nd and 3rd. X is a convention: **30 days is the common one** (FPD30); some companies report FPD7 or FPD0 (not paid *on* the due date). Always say which.

Why does everyone watch FPD? Two reasons:

1. **Early warning for new products and new rules.** A 36-month Auto loan takes three years to show its full loss. Its FPD you know in 60 days. If a new scoring cut-off or a new channel was a mistake, FPD is the first number that moves — months before the 90+ bucket.
2. **Fraud.** A borrower who never intended to repay does not pay the first instalment. Genuine financial trouble usually arrives later. A spike in FPD on one branch, one officer or one app version is the classic fraud signal; a spike in 61–90 is an economy signal.

Nur Finance FPD30 as of the data: of the 7 099 loans whose first instalment fell due on or before 1 September 2026 (so that 30 days have passed), **91** had not paid it in full within 30 days → **1.28 %**. (You write the query next week, on Week 2 · Day 4; the number is here so you know what "normal" looks like for this book.)

Tomorrow: Madina's customer count does not match HR's. Bring your Day-1 P1 note — detective day.

> 🎯 **Interview version.** *"What is DPD, and why is FPD watched separately?"* — DPD: days since the oldest unpaid instalment, grouped into 0 / 1–30 / 31–60 / 61–90 / 90+. FPD: first instalment unpaid after 30 days; watched because it shows up within two months of disbursement (early warning for new products and rules) and because it is the main fraud indicator.

**Say it like in an interview.** Write your answer the way you would say it — 30 words or more — then compare it with the model.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 1 · Day 4 — Warehouses, stars and a detective case (weeks/week-01/day-4.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-01/day-4
=====

# Week 1 · Day 4 — Warehouses, stars and a detective case

<span class="badge">Learn 50 min</span> <span class="badge">Detective 70 min</span> <span class="badge">Homework</span> <span class="badge company">Company corner</span>

> STORY **Thursday, 8:55.** Madina is already at your desk, phone in hand. *"The September board pack says we have 6 040 customers. HR's year-end headcount of registered clients — the one they use for the regulator — says 6 000. Forty people have appeared from nowhere. The CFO wants to know which number is right before the board meets at two. Timur is on holiday. You have the database."* She pauses. *"Also, when you're done, I'll explain why the board pack doesn't come from the database you're querying. It's related."*

## Today in 3 lines

- You can explain **OLTP vs OLAP**, why reports do not run on the production database, and what a **data warehouse** is for.
- You can draw Nur Finance as a **star schema** — fact tables, dimension tables, grain — and say where a **snowflake** differs.
- You have solved the **customer-count case**: found the duplicate people and the impossible birth dates with queries, and know how many real customers there are.

---

## 1. Learn — two kinds of database

### OLTP — the database that runs the company

**What it is.** An **OLTP** system (*online transaction processing*, *транзакционная система*) records events as they happen. A payment arrives → one row is inserted into `payments`, in milliseconds, thousands of times a day, and none may be lost or counted twice. The `nur` database you have been querying is a copy of such a system. An OLTP database is:
- **normalised** (yesterday's 3NF), so each fact is written once;
- tuned for **many small writes and one-row reads**;
- **current**: it holds the state *now*. Yesterday's balance is gone once today's payment is posted.

**How to write it.** A typical OLTP request touches one row, found by its primary key:

```sql
SELECT loan_id, customer_id, principal, status FROM loans WHERE loan_id = 4516;
-- "show me loan 4516"
```

1 row: loan 4516, customer 2954, 2 960 000, closed. This is what a cashier's screen asks a thousand times a day. The other typical request is an `INSERT` of one new row — Day 3's commands.

**When you use it.** The company's apps run on OLTP: the mobile app, the cashier's screen, the loan officer's form. Analysts read a **copy** of it — next subsection.

**Your turn.** Which request is typical OLTP work?

### The data warehouse — the database that answers questions (OLAP)

**What it is.** A **data warehouse** (*хранилище данных*, DWH) is a second database, filled from the OLTP systems, usually every night, and shaped for **reading**. Queries on it are called **OLAP** (*online analytical processing*). The copying process is **ETL**: *extract* from the sources, *transform* (clean, join), *load* into the warehouse (Baraa builds one in his project: bronze → silver → gold layers).

**How to write it.** A typical analytical request reads many rows and writes none:

```sql
SELECT COUNT(*) FROM payments
WHERE paid_at >= '2025-01-01' AND paid_at < '2026-01-01';
-- every payment of a whole year
```

21 194 payments arrived in 2025. To answer, the database reads all 52 875 rows of `payments`. Run that on production at 11:00 and the cashier in Fergana waits for her screen.

| | OLTP (production) | OLAP (warehouse) |
|---|---|---|
| Purpose | run the business | understand the business |
| Typical query | insert 1 row; read 1 loan | count or sum a year of payments by month |
| Shape | normalised, many narrow tables | **de**-normalised, few wide tables |
| Data | now | history, snapshots ("the balance at each month-end") |
| Users | the app, cashiers, officers | analysts, dashboards, the board pack |

**When you use it.** Reports run on the warehouse, for three reasons:
- **load** — a big scan slows the cashier's screen;
- **history** — production overwrites; the warehouse keeps every month-end;
- **consistency** — a report re-run five minutes later must give the same number.

Madina's board pack comes from the warehouse, loaded on 1 October; HR's number comes from a different system. Keep that in mind for the case.

**Your turn.** Put each line with the kind of database it describes.

> 🎬 **Didn't get the data warehouse?** [Baraa explains it · 7 min](https://youtu.be/SSKVgrwhzus?t=84153&end=84562)

### Facts and dimensions — the two kinds of warehouse table

**What it is.** A warehouse is built from the two kinds of table you met on Day 1:
- A **fact table** (*таблица фактов*) has one row per **event or measurement**. It holds **measures** — numbers you add up: an amount, a count, days late — and **keys** to the dimensions. It is long and narrow: millions of rows.
- A **dimension table** (*таблица измерений*) has one row per **thing you slice by**: a customer, a product, a branch, a date. It holds **attributes** — descriptive text: region, segment, product name, month name. It is short and wide.

**How to write it.** Our `loans` already has the shape of a fact; `dim_date` is a ready dimension.

```sql
SELECT loan_id, customer_id, product_id, branch_id, disbursed_at, principal FROM loans LIMIT 3;
```

3 rows: four keys (`customer_id`, `product_id`, `branch_id`, `disbursed_at`) and one measure (`principal`). Nothing in a fact row is text to read.

```sql
SELECT * FROM dim_date WHERE date_key = '2026-09-01';
```

1 row: 2026, quarter 3, month 9, *September*, *Tuesday*, not a weekend — attributes you can group by.

**When you use it.**

| | Fact table | Dimension table |
|---|---|---|
| One row is | an event or measurement | a thing |
| Holds | measures + keys | attributes |
| Size | long, narrow | short, wide |
| Example | `fact_loans`, `fact_payments` | `dim_customer`, `dim_date` |
| In a question | "sum **this**…" | "…**by** that" |

**Your turn.** Sort the columns of a warehouse into measures, attributes and keys.

### The star schema — a fact in the middle

**What it is.** A **star schema** (*схема «звезда»*) draws one fact table in the middle and its dimensions around it. Each dimension connects to the fact with one key — one join.

**How to write it.** The picture:

```text
fact_loans
principal, term
   │
   ├── dim_date
   │     (date_key)
   ├── dim_customer
   │     (customer_id)
   ├── dim_product
   │     (product_id)
   ├── dim_branch
   │     (branch_id)
   └── dim_staff
         (officer_id → staff_id)
```

Every question becomes one sentence: *"sum a measure of the fact, grouped by an attribute of a dimension"* — disbursed principal (`fact_loans`) by region (`dim_branch`) by month (`dim_date`).

**When you use it.** Almost every warehouse and BI model (Power BI, Week 7) is a set of stars. A variant normalises the dimensions further:

| | Star | Snowflake (*«снежинка»*) |
|---|---|---|
| Dimensions | one wide table each | split further: `dim_branch` → `dim_region` |
| Repeated values | yes (`region` on every branch row) | fewer |
| Joins per question | one per dimension | more |
| Analysts prefer | ✓ | |

Repeating `region` on the ten rows of a wide `dim_branch` costs nothing and saves a join in every query. Warehouses de-normalise *on purpose*: yesterday's rules are for writing; today's are for reading.

**Your turn.** Draw the star: connect each key of `fact_loans` to its dimension.

### Grain — what one row of a fact table is

**What it is.** The **grain** (*гранулярность*) of a fact table is the answer to *"what is one row?"*: one loan, one instalment, one payment, one loan **per month-end**. It is the most important word of the day.

**How to write it.** The same lending book at three grains:

```sql
SELECT COUNT(*) FROM loans;          -- grain: one loan
```

```sql
SELECT COUNT(*) FROM installments;   -- grain: one scheduled instalment
```

```sql
SELECT COUNT(*) FROM payments;       -- grain: one payment received
```

7 828 loans, 92 193 instalments, 52 875 payments. Each number is right, and each counts a different thing.

**When you use it.** Choose the grain **first**, then the measures. Every measure must make sense at that grain: "outstanding balance" cannot live in a fact whose grain is "one payment" — a balance belongs to a loan **at a date**. That needs a **snapshot fact**: one row per loan per month-end.

> ⚠️ **Watch out.** Say the grain out loud before you count: "one row is one ___". The 48 loans on duplicate customer ids are not 48 customers — the Daily challenge turns on exactly this.

**Your turn.** Risk wants "payments received per month". Which grain answers it?

### Slowly changing attributes — when a dimension row changes

**What it is.** A **slowly changing attribute** (*медленно меняющееся измерение*, SCD) is a dimension value that changes now and then: a customer moves to another region, a branch is renamed. The warehouse must decide: **overwrite** the old value (type 1 — history is lost) or **add a new row** with the dates it was valid (type 2 — history is kept).

**How to write it.** Suppose customer 2954, Yulduz Saidova (registered in Tashkent on 2024-11-23), moves to Samarkand on 2026-06-01:

| Type 1 — overwrite | customer_id | region | |
|---|---|---|---|
| | 2954 | Samarkand | (Tashkent is forgotten) |

| Type 2 — new row | customer_id | region | valid_from | valid_to |
|---|---|---|---|---|
| | 2954 | Tashkent | 2024-11-23 | 2026-05-31 |
| | 2954 | Samarkand | 2026-06-01 | (open) |

**When you use it.** Type 2 when a report must show the past as it was: "loans disbursed to Tashkent customers in 2025" must still count her 2025 loans in Tashkent. Type 1 for corrections nobody needs to see, such as a typo in a name.

**Your turn.** The board wants "disbursements by the customer's region **at the time of the loan**". Customers sometimes move. Which choice keeps the report right?

### Putting it together — Nur Finance as a star

The warehouse Nur Finance would build from the eleven tables, with the grain of every fact:

| Warehouse table | Kind | Grain / one row is | Built from | Measures or key attributes |
|---|---|---|---|---|
| `fact_loans` | fact | one loan | `loans` + `applications` (score, channel) | principal, term, monthly_payment, days_to_disburse; keys → customer, product, branch, officer, disbursed date |
| `fact_payments` | fact | one payment | `payments` + `installments` (due date) | amount, days_late (= paid − due); keys → loan, customer, product, branch, paid date |
| `fact_applications` | fact | one application | `applications` | requested_amount, credit_score, is_approved (0/1); keys → customer, product, branch, channel, applied date |
| `fact_loan_monthly` | snapshot fact | one loan × one month-end | computed from instalments and payments | outstanding, dpd, bucket — the portfolio report lives here |
| `dim_customer` | dimension | one customer (type 2: one row per version) | `customers` | region, segment, sex, age band, income band |
| `dim_product` | dimension | one product | `products` | name, code, channel, rate |
| `dim_branch` | dimension | one branch | `branches` (+ region, inline) | branch_name, region |
| `dim_staff` | dimension | one employee | `staff` | role, branch |
| `dim_date` | dimension | one day | `dim_date` (we already ship it) | year, quarter, month, month_name, weekday, is_weekend |

Read it with this section's words: production (**OLTP**) feeds the **warehouse** by ETL; four **facts** with stated **grains**; five **dimensions** around them in **stars**; `dim_customer` keeps moves as **type-2** rows. `fact_loans` carries `customer_id`, `product_id` *and* `branch_id` directly, although in OLTP the branch was reachable through the application: in a star, every fact points at every dimension you slice by — the controlled denormalisation of yesterday's P7, made the rule. And `dim_date` is why we have had a calendar table since Day 1.

**Your turn.** The words of the day, as flashcards.

### Lab — a tiny star of your own

**What this is.** Build a small warehouse on your practice copy: two dimensions, one fact, then answer a question *through the star*. `CREATE TABLE … AS SELECT` is Day 2's and Day 3's command; the `JOIN` lines are next week's topic — today, **💡 Show me** gives you the text, and the table reads each step in a line.

| Step | 💡 Show me gives | Read it as |
|---|---|---|
| 1 | `CREATE TABLE my_dim_product AS SELECT product_id, code, name AS product_name FROM products;` | A product dimension: one row per product, three columns. |
| 2 | `CREATE TABLE my_dim_branch AS SELECT branch_id, branch_name, region FROM branches;` | A branch dimension: one row per branch. |
| 3 | `CREATE TABLE my_fact_loans AS SELECT loan_id, product_id, branch_id, disbursed_at, principal FROM loans WHERE …2026…;` | The fact: grain one loan of 2026; keys plus one measure. |
| 4 | `… FROM my_fact_loans f JOIN my_dim_product p ON … JOIN my_dim_branch b ON … WHERE p.code = 'AUTO' AND b.region = 'Tashkent';` | Each fact row picks up its product and branch; keep Auto loans of Tashkent branches. |
| 5 | `CREATE TABLE my_dim_region AS SELECT DISTINCT region FROM my_dim_branch;` | Pull the regions out into their own table — the first step of a snowflake. |

### Depth (optional)

- ▶ Baraa, *Project: Data warehouse* [23:21:04](https://youtu.be/SSKVgrwhzus?t=84064&end=85264) — watch the first 20 min (what a warehouse is, bronze/silver/gold). The rest is for after week 3.
- RU decks `1.3 NoSQL, OLAPOLTP & Data Architecture.pdf` (OLTP/OLAP pages, архитектура данных) and `1.4 Dimensional Modeling Star & Snowflake Schemas.pdf` (факты, измерения, звезда, снежинка, гранулярность).

---

## 2. Worked example — choosing a grain

Bekzod wants *"the outstanding balance of the Auto portfolio at every month-end for 2026"*. Which fact answers it? Each step names the idea from Learn that it uses.

**Step 1 — find the noun that is one row (grain).** "Balance … at every month-end" → one row must be one loan **at one month-end**.

**Step 2 — test each fact table's grain (facts and dimensions, grain).**
- `fact_loans` (one loan)? It has principal, not balance; and a loan has one row, not one per month. **No.**
- `fact_payments` (one payment)? Balance is not a payment attribute; summing payments gives *what came in*, not *what is left*. **No.**
- `fact_loan_monthly` (one loan per month-end, a snapshot fact)? Balance at a date is exactly its grain. **Yes.**

**Step 3 — slice by the dimensions (the star).** Sum `outstanding` from `fact_loan_monthly`, keep product = Auto through `dim_product`, group by month-end through `dim_date`.

That is the whole method: *write the question, find the noun that is "one row", pick the table with that grain.* When no table has that grain, the warehouse is missing a fact table — and that is a request to the data engineer, not something you compute by hand each month.

---

## 3. Practice — the case of the forty customers (70 min)

Write each query in the box under its step — it is saved in this browser — and **✔ Check** it; then type your number into the box after the fold. Your reasoning goes in tonight's memo, and HW 1.3 below collects the key queries again. Work in order; each fold confirms the step before you take the next.

**Warm-up (10 min).** Five quick questions, one per idea from Learn, in the same order. Then the case.

**P1.** *(OLTP vs warehouse)* The CFO will ask you to re-run the September customer count tomorrow and expects the same number. Why run it on the warehouse, not on production?

**P2.** *(facts and dimensions)* In `fact_payments`, which column is a **measure**?

**P3.** *(the star schema)* `dim_branch` repeats `region` on each of its ten rows. A colleague wants to move `region` into its own `dim_region`. What does that change?

**P4.** *(grain)* Bekzod asks "how many loans does each customer have?". A colleague counts the rows of `fact_payments` per customer. What is wrong?

**P5.** *(slowly changing attributes)* In May a branch was renamed from *Tashkent North* to *Tashkent City*. Last year's reports must keep showing the old name. Which way does `dim_branch` handle the change?

**The case (60 min).** Each step names the SQL or the idea it uses.

**Step 1 — reproduce the two numbers** *(COUNT(*); grain: what one row of `customers` is)*. The board pack counts rows of `customers`. Confirm it.

**Step 2 — your Day-1 P1 note** *(WHERE with `=` and `<>`; text functions)*. You wrote down names in CAPITALS and names with a trailing space. Count them, with only Day-2 SQL plus three functions: `UPPER()`, `LOWER()` and `TRIM()` return a changed copy of a text (SQL Server also has `LTRIM`/`RTRIM`).

**Step 2.** How many rows have a surname written entirely in lower case?

**Step 3 — find a twin** *(WHERE with AND; a primary key is not a person)*. Take customer 6001. Is there another Malika Jalilova born 1981-08-15?

**Step 4 — do it for everyone** *(groups of rows — `GROUP BY`, borrowed from Week 2)*. You need "groups of rows with the same normalised name and birth date that have more than one member". That is `GROUP BY … HAVING COUNT(*) > 1` — week 2's topic. Copy it today, understand it next Tuesday:

```sql
SELECT LOWER(TRIM(first_name)) AS fn, LOWER(TRIM(last_name)) AS ln, birth_date, COUNT(*) AS n
FROM customers
GROUP BY LOWER(TRIM(first_name)), LOWER(TRIM(last_name)), birth_date
HAVING COUNT(*) > 1
ORDER BY n DESC, ln, fn;
```

How many groups? Now add `phone` to both the SELECT and the GROUP BY and run again. How many now? Explain the difference before opening the fold.

**Step 4.** How many groups on name + birth date alone?

**Step 4.** And how many once the phone is added?

> 💡 **Key idea.** A match on one or two fields is a *suspicion*; a match on name, birth date **and** phone is a *duplicate*. Every rule that finds duplicates also catches some that are not — look at what it caught before you count it.

**Step 5 — the other thing Day 2 told you to watch (P12): birth dates** *(comparison operators and OR on dates)*. The data is as of 2026-10-01 and the oldest plausible borrower was born around 1920. Count the rows outside that range and list them.

**Step 5.** How many customers have an impossible birth date?

**Step 6 — answer the CFO** *(grain: rows vs people)*. How many real customers are there, and which number is right?

**Step 6.** How many real customers — people — are there?

**Step 7 — what to do** *(production vs warehouse: where each fix belongs)*. Three options, in rising order of effort: (1) report people, not rows — count distinct `(name, birth date, phone)` in the warehouse's `dim_customer`; (2) merge: repoint their loans and applications from the new id to the old one, then delete the duplicate rows — a data engineer's job, with a backup; (3) prevent: a uniqueness check on `(phone, birth_date)` at registration so officers must search before creating. Your memo recommends an order.

**Step 7.** Which option stops *new* duplicates from appearing?

> 🚀 **Stretch (optional, +5 XP).** **Step 8** *(a join, borrowed from Week 2; dates)*. One more date check, across two tables. An application cannot be older than the customer who made it: are there applications dated *before* their customer's `registered_at`? It needs a join (week 2) — copy it today, and before you run it, write down what a hit would mean.

```sql
SELECT a.application_id, a.customer_id, a.applied_at, c.registered_at
FROM applications a
JOIN customers c ON c.customer_id = a.customer_id
WHERE a.applied_at < c.registered_at
ORDER BY a.customer_id, a.applied_at;
```

**Step 8.** Every hit sits on a duplicate id, and their `registered_at` lies after the as-of date. How many customer rows carry a registration date after 2026-10-01 (on `customers` alone, with or without an application)?

---

## 4. Homework <span class="badge hw">HW 1.3 — Due Day 5</span>

**HW 1.3 — Data-quality memo to Madina:** the case's key queries, checked by the site, and a one-page memo a CFO can read.

---

## 5. Self-check

---

## 6. Company corner <span class="badge company">Who does what</span>

You will serve six kinds of colleagues. Learn their question, and which tables answer it, and you can start any conversation at Nur Finance.

| Role | Cares about | A typical request | Tables that answer it |
|---|---|---|---|
| **Portfolio manager** (Bekzod; *портфельный менеджер*) | size and quality of the loan book: disbursements, outstanding, yield, mix by product | *"Disbursements by product and month for 2026, with average ticket."* | `loans` (+ `products`, `dim_date`); outstanding from `installments` − `payments` |
| **Risk analyst** (*риск-аналитик*) | who to approve, at what price: scoring, approval rate, FPD, vintages | *"Approval rate and FPD30 by credit-score band for app vs branch, last 6 months."* | `applications` (score, channel, status), `loans`, `installments`, `payments` |
| **Collections analyst** (Sevara's team; *аналитик взыскания*) | getting late money back: DPD buckets, roll rates, contact and promise rates, cure | *"Which loans crossed 30 DPD this week, and how many have we not yet called?"* | `installments`, `payments`, `collections_actions`, `staff` |
| **BI / dashboard specialist** (Timur; *BI-специалист*) | one truth on one screen: warehouse model, refresh, definitions | *"The approval-rate tile shows 61 % and Risk's deck says 70 % — align them."* | the star: `fact_applications`, `dim_*` (and the two conventions from Day 2) |
| **Product analyst** (*продуктовый аналитик*) | the app and the customer journey: funnel, activation, retention, churn | *"Where in the app funnel do we lose applicants, by device and version?"* | `app_events` (+ `applications`, `customers`) — and only for the app channel |
| **Data engineer** (*инженер данных*) | the pipes: ETL, warehouse tables, data quality, performance | *"Add a month-end snapshot fact with DPD; and merge the duplicate customers."* | builds `fact_loan_monthly`; fixes `customers` — your memo lands on this desk |

Two more you will meet later: the **data scientist** (builds the scoring model from `applications` + repayment outcomes) and **Finance** (provisions, cost of risk — needs your buckets to be right).

Tomorrow: checkpoint. No new theory — a schema to design and twenty queries. Sleep.

> 🎯 **Interview version.** *"Who are the typical consumers of an analyst's work in a lending company, and what does each want?"* — Name four roles with one request each, and say which tables you would join for it. Mention that the same word (approval rate, customer) can mean different things to two of them, and that part of the job is making the definition explicit.

**Say it like in an interview.** Write your answer the way you would say it — 30 words or more — then compare it with the model.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 1 · Day 5 — Checkpoint: design and query (weeks/week-01/day-5.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-01/day-5
=====

# Week 1 · Day 5 — Checkpoint: design and query

<span class="badge">Part A 60 min</span> <span class="badge">Part B 90 min</span> <span class="badge">Part C 20 min</span> <span class="badge hw">Checkpoint · 100 points</span>

> STORY **Friday, 9:00.** Madina closes the door. *"No lesson today. Two things landed on my desk and I'm giving both to you. One: the CEO wants a new product — salary advances for employees of partner companies — and IT needs a first data model by Monday. Two: Bekzod, Sevara and Timur each sent me a list of numbers they want; I merged them into twenty questions. Design the tables, answer the questions, and at 15:00 I'll ask you eight things a hiring manager would ask. Everything you need you learned this week."*

## Today in 3 lines

- **Part A (40 pts):** a schema for *Nur Pay* from a business brief — 4–5 tables with keys and types, the `CREATE TABLE`s, two normalisation decisions explained.
- **Part B (40 pts):** twenty queries on Nur Finance using only this week's SQL — single-table `SELECT`, `WHERE`, `ORDER BY`, `DISTINCT`, `TOP`/`LIMIT`, `COUNT(*)`.
- **Part C (20 pts):** eight interview questions answered in writing, 3–5 sentences each.

**Rules.**
- **Open book:** your notes, this week's pages, the SQL boxes and the playground.
- **Closed:** the answer folds, until you have submitted.
- **Where to hand in:** the **📎 box at the end of this page**, by the end of the day.
  - **Part A** → `nur_pay.md` + `nur_pay.sql`.
  - **Part B** → twenty queries, one editor each: **▶ Run**, then **✔ Check** says *right* or *not yet* (never the answer). The site writes `queries.sql` for you, each query with its `-- Bn:` and `-- result:` lines.
  - **Part C** → `interview.md`.
- **Pass mark:** 70 of 100 (table at the end).

> ⚠️ **Watch out.** No `JOIN`, `GROUP BY` or subqueries in Part B — if you know them, resist; the point is to show the basics are solid. A query that gets the right number with next week's tools loses its "expresses the question" point.

---

## Part A — Design Nur Pay (60 min, 40 pts)

### The brief

> **Nur Pay — salary advance.** Nur Finance signs a contract with a **partner company** (an employer). The employer gives us a list of its **employees** who may use the service, with their monthly salary and payday. An enrolled employee can request an **advance** through the app on any day: an amount up to a share of the salary already earned this month, for a flat fee. We pay it out the same day. On the employer's next **payroll run**, the employer deducts the advance plus the fee from the employee's salary and transfers the total for all its employees to us in one payment; we then split that transfer into a **repayment** per advance. An employee may have several advances open at once. Employers can pause the service or leave; employees change employer or leave. Finance wants to know, at any time: how much is outstanding per employer, which advances were not covered by the last payroll (the employee left, or the payroll was short), and the fee income per month.

### What to deliver

1. **`nur_pay.md`** — a table list in the Day-1 format (table · one row is… · primary key · points to), then **two normalisation decisions** explained in 3–5 sentences each: something you deliberately did *not* store in a table and why, and something you deliberately *did* store redundantly (a snapshot) and why.
2. **`nur_pay.sql`** — `CREATE TABLE` for every table (SQL Server or SQLite dialect; say which), with `NOT NULL`, `PRIMARY KEY`, `FOREIGN KEY`. Prefix the names `my_` if you create them in your `nur` database.

### Scoring (40)

| Criterion | Points |
|---|---|
| The tables cover the brief: employer, employee, advance, repayment, and the payroll transfer (as a table or a well-argued column) | 10 |
| Keys: every table has a PK; every relationship in the brief has an FK in the right direction (the *many* side holds the key) | 10 |
| Types and constraints are sensible (money as integer/decimal, dates as dates, statuses NOT NULL) | 8 |
| Decision 1 (not stored) is a real 3NF argument | 6 |
| Decision 2 (snapshot) names what would go wrong without it | 6 |

---

## Part B — Twenty queries (90 min, 40 pts)

- **Where you write:** in the 📎 box at the end — the questions below are the same as there.
- **Scoring:** 2 points per query — 1 for a query that runs and expresses the question (your mentor reads it), 1 for the correct result (the site checks it with ✔ Check).
- **Tools:** this week's SQL only (see *Watch out* above).
- **Numbers:** as of the shipped dataset (2026-10-01).
- **Order:** difficulty rises. Do not get stuck — skip and return.

**B1.** How many customers are in the table? · **B2.** How many loans are closed? · **B3.** How many applications were cancelled?

<details><summary>B1–B3</summary>

```sql
SELECT COUNT(*) FROM customers;                               -- 6040
SELECT COUNT(*) FROM loans WHERE status = 'closed';           -- 4242
SELECT COUNT(*) FROM applications WHERE status = 'cancelled'; -- 1817
```

</details>

**B4.** List the distinct regions of customers, alphabetically. How many? · **B5.** How many customers have no recorded income? · **B6.** How many loans have a principal of 100 000 000 or more?

<details><summary>B4–B6</summary>

```sql
SELECT DISTINCT region FROM customers ORDER BY region;
-- 8: Andijan, Bukhara, Fergana, Namangan, Nukus, Samarkand, Tashkent, Termez
SELECT COUNT(*) FROM customers WHERE monthly_income IS NULL;  -- 356
SELECT COUNT(*) FROM loans WHERE principal >= 100000000;      -- 996
```

</details>

**B7.** Affluent-segment customers living in Tashkent. · **B8.** Customers whose surname ends in `ova`. · **B9.** Instalments falling due in October 2026 (the month that starts on the data's as-of date).

<details><summary>B7–B9</summary>

```sql
SELECT COUNT(*) FROM customers WHERE segment = 'affluent' AND region = 'Tashkent';
-- 487
SELECT COUNT(*) FROM customers WHERE last_name LIKE '%ova';
-- 2447
SELECT COUNT(*) FROM installments WHERE due_date BETWEEN '2026-10-01' AND '2026-10-31';
-- 3392
```
B8: 2 447 of 2 924 women — surnames ending `eva` (Abdullaeva, Mirzaeva) are the rest. `LIKE '%ova'` is a text pattern, not "female": say what you measured.

</details>

**B10.** Applications submitted in calendar year 2025. Careful with the column type. · **B11.** Payments larger than 10 000 000.

<details><summary>B10–B11</summary>

```sql
SELECT COUNT(*) FROM applications
WHERE applied_at >= '2025-01-01' AND applied_at < '2026-01-01';   -- 5407
SELECT COUNT(*) FROM payments WHERE amount > 10000000;            -- 7759
```
B10 with `BETWEEN '2025-01-01' AND '2025-12-31'` gives 5 388 — it loses the 19 applications of 31 December made after 00:00 (`applied_at` has a time part). Zero points for the result if the number is lower than 5 407 for that reason; one point for the query if you wrote a comment saying you knew.

</details>

**B12.** Collection visits that ended with a promise to pay. · **B13.** `contract_signed` events from iOS devices. · **B14.** Loans that are neither Micro (1) nor BNPL (3) and run 24 months or longer.

<details><summary>B12–B14</summary>

```sql
SELECT COUNT(*) FROM collections_actions WHERE action_type = 'visit' AND outcome = 'promise_to_pay';
-- 381
SELECT COUNT(*) FROM app_events WHERE event_name = 'contract_signed' AND device = 'ios';
-- 944
SELECT COUNT(*) FROM loans WHERE product_id NOT IN (1, 3) AND term_months >= 24;
-- 1511
```

</details>

**B15.** Written-off loans with risk grade C or D — and, as a check, all written-off loans. · **B16.** Applications with a credit score above 800 that were rejected (and how many scored above 800 at all).

<details><summary>B15–B16</summary>

```sql
SELECT COUNT(*) FROM loans WHERE risk_grade IN ('C', 'D') AND status = 'written_off';
-- 128
SELECT COUNT(*) FROM loans WHERE status = 'written_off';
-- 190
SELECT COUNT(*) FROM applications WHERE credit_score > 800 AND status = 'rejected';
-- 6
SELECT COUNT(*) FROM applications WHERE credit_score > 800;
-- 108
```
B15: 128 of 190 write-offs (67 %) come from the two worst grades — the scorecard works, but 62 write-offs came from A and B. B16: 6 of 108 top scorers were rejected; a risk analyst would want to know why (a rule outside the score, or a data error).

</details>

**B17.** Customers who are **not** (mass segment **or** in Tashkent) — i.e. non-mass customers outside Tashkent. Write it with `NOT (…)`, then rewrite without `NOT` and confirm the same count.

<details><summary>B17</summary>

```sql
SELECT COUNT(*) FROM customers WHERE NOT (segment = 'mass' OR region = 'Tashkent');
-- 1481
SELECT COUNT(*) FROM customers WHERE segment <> 'mass' AND region <> 'Tashkent';
-- 1481
```
De Morgan: `NOT (a OR b)` = `NOT a AND NOT b`. Both forms score; the second is what you will read in other people's code.

</details>

**B18.** The three largest payments ever received: payment id, loan id, amount, date.

<details><summary>B18</summary>

```sql
-- SQL Server:  SELECT TOP 3 payment_id, loan_id, amount, paid_at FROM payments
-- ORDER BY amount DESC, payment_id;
SELECT payment_id, loan_id, amount, paid_at FROM payments ORDER BY amount DESC, payment_id LIMIT 3;
```
Payments 30772, 30773, 30774 — all 57 170 000, all on loan 4570 (the 598 450 000 SME loan from Day 2 P3), 2025-01-26 / 02-27 / 03-27. Three equal amounts in a row is not a duplicate: they are three consecutive instalments. (Payment 30775 on the same loan has the same amount, so third place is a tie; `payment_id` in the `ORDER BY` makes the three rows the same on both engines.) (Write that sentence; it is the difference between a count and an analysis.)

</details>

**B19.** The earliest and the latest loan ever disbursed (two queries): loan id, date, principal.

<details><summary>B19</summary>

```sql
SELECT loan_id, disbursed_at, principal FROM loans ORDER BY disbursed_at ASC  LIMIT 1;
-- 4185, 2024-01-02, 1 250 000
SELECT loan_id, disbursed_at, principal FROM loans ORDER BY disbursed_at DESC, loan_id LIMIT 1;
-- 596,  2026-10-01, 2 510 000
```
(`TOP 1` on SQL Server.) The latest is on the as-of date itself: the data is current to the day it was cut. But 21 loans were paid out on 2026-10-01, so without the `loan_id` in the `ORDER BY` the engine may show any of them; with it, the answer is always 596 — the same tiebreaker as in B18.

</details>

**B20.** Customers registered in 2026 with a monthly income above 20 000 000, richest first. How many, and who is first? Look at the first row carefully.

<details><summary>B20</summary>

```sql
SELECT customer_id, first_name, last_name, monthly_income, registered_at
FROM customers
WHERE registered_at >= '2026-01-01' AND monthly_income > 20000000
ORDER BY monthly_income DESC;  -- 258 rows
```
First row: customer **6016**, `Bobur␣ rakhimov`, 59 962 504 — an id above 6000 with a trailing space and a lower-case surname: one of yesterday's forty duplicates. The "richest new customer of 2026" is a data-entry copy of an existing client. Full marks only if your `-- result:` line says so.

</details>

---

## Part C — Eight interview questions (20 min, 20 pts)

- **Format:** in writing, 3–5 sentences per question, as you would say it.
- **Scoring:** 2.5 points per question — 1 for correctness, 1 for a lending example, 0.5 for plain words.

1. Walk me through the life of a loan and where data is recorded at each step.
2. What is the difference between a primary key and a foreign key? Give one of each from a lending database.
3. What does "normalised" mean, and give one example of a problem normalisation prevents.
4. What is DPD, and how is FPD different from it? Why do companies track FPD separately?
5. Two teams report different approval rates for the same month. What is the most likely reason?
6. What is the difference between OLTP and OLAP, and why would a company have both?
7. Explain a star schema to a non-technical manager.
8. What is a loan portfolio, and name three numbers a portfolio manager watches.

---

## Scoring and what happens next

| Part | Points | Pass |
|---|---|---|
| A — design | 40 | |
| B — queries | 40 | |
| C — interview | 20 | |
| **Total** | **100** | **≥ 70 → Week 2 on Monday** |

Below 70: feedback names the sections to redo over the weekend (usually Day 2's operators or Day 3's normal forms); re-submit the failed part on Monday morning before starting Week 2. Points go to the [Progress page](progress.md). If you skipped Week 1 via the Day-0 diagnostic, this checkpoint is your proof — same threshold.

**Hand-in checklist** (the 📎 box below): `nur_pay.md`, `nur_pay.sql`, the twenty Part B queries (each ✔ checked), `interview.md`. Also due today: HW 1.3 (the data-quality memo) on Day 4's page.

Madina, 17:30: *"The CFO used your 6 000. IT got the Nur Pay model. Bekzod has his twenty numbers. Monday we teach you to join tables — and the twenty questions he actually wanted to ask."*

---

### 📎 Hand in here

**Checkpoint 1 — Nur Pay design, twenty queries, eight interview answers.**

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 2 · Day 1 — Joining tables: the loan with its customer (weeks/week-02/day-1.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-02/day-1
=====

# Week 2 · Day 1 — Joining tables: the loan with its customer

<span class="badge">Learn 60 min</span> <span class="badge">Practice 60 min</span> <span class="badge">Homework</span> <span class="badge company">Company corner</span>

> STORY **Monday, 9:10.** Bekzod is waiting at your desk with a printout of last week's B18 — three payment ids, one loan id, three amounts. *"Great numbers. Zero names. When I show the board a loan, they want to see a person, a product and a branch, not `4570`. Can I get a readable loan list: customer name, region, product, branch, principal, status? One row per loan."* Madina, passing: *"That's four tables. Today you learn the word that connects them."*

## Today in 3 lines

- You can write an **INNER JOIN** and a **LEFT JOIN** on a key, with **table aliases**, and pick columns from both sides.
- You know why joining `loans` to `installments` **multiplies rows** (many-to-one), and how to join **three or four tables** in one query.
- You can compute Nur Finance's **outstanding balance** and its **overdue amount** as of 2026-10-01, and say which is which.

---

## 1. Learn — joins: putting two tables side by side

### Why a join — one question, two tables

**What it is.** A **JOIN** (*соединение*) takes rows from two tables and puts the matching ones side by side, in one row. Rows match when a **key** has the same value on both sides: `loans.customer_id` holds the `customer_id` of a row in `customers`, so a loan and its customer match on that number.

You need a join whenever one question needs columns from two tables. "Each loan with the customer's name" needs `loans.principal` and `customers.first_name` — two tables, one key, one join.

**The two small tables used on this page.** Every join below is shown on these first, so you can see each row, and then run on the real data.

| `cust` | id | name |
|---|---|---|
| | 1 | Aziz |
| | 2 | Bekzod |
| | 3 | Dilnoza |

| `app` | app_id | cust_id | amount |
|---|---|---|---|
| | 101 | 2 | 500 |
| | 102 | 3 | 900 |
| | 103 | 4 | 120 |

Aziz (1) has no application. Application 103 points to customer 4, who is not in `cust`. Those two rows are what tells the join types apart.

```sql
-- the two small tables, built in the query itself (WITH … VALUES), so every box
-- on this page can use them
WITH cust(id, name) AS (VALUES (1, 'Aziz'), (2, 'Bekzod'), (3, 'Dilnoza')),
     app(app_id, cust_id, amount) AS (VALUES (101, 2, 500), (102, 3, 900), (103, 4, 120))
SELECT * FROM cust;
```

> 🎬 **Didn't get why we join tables?** [Baraa explains it · 8 min](https://youtu.be/SSKVgrwhzus?t=10238&end=10707)

### The shape of a join — FROM … JOIN … ON

**How to write it.**

```sql
-- columns from both tables, each with its table's alias
SELECT l.loan_id, c.first_name, c.last_name, l.principal
-- the first table, alias l
FROM loans AS l
-- the second table, alias c
JOIN customers AS c
  ON c.customer_id = l.customer_id;
  -- the key: child.foreign_key = parent.primary_key
```

Three parts, always the same:

1. **Aliases** (*псевдонимы*) — `l` and `c` are short names for the tables. `AS` is optional. Use them in every join.
2. **Qualified columns** — `c.region`, `l.principal`. A column that exists in both tables (`customer_id`) must have a prefix, or the database stops with *ambiguous column*. Prefix every column; it is never wrong.
3. **`ON`** — the match rule. Almost always `child.foreign_key = parent.primary_key`. The list of key pairs from Week 1 Day 1 is your **join map**.

Run it: 7 828 rows — one per loan, because every loan has exactly one customer.

**When you use it.** Every join on this page has this shape; only the word before `JOIN` changes (`INNER`, `LEFT`, `RIGHT`, `FULL`, `CROSS`).

**Your turn.**

### INNER JOIN — only the rows that match

**What it is.** **INNER JOIN** (*внутреннее соединение*) keeps a row only when it finds a partner on the other side. A row with no partner is left out. `JOIN` on its own means `INNER JOIN`.

**How to write it.** On the small tables:

```sql
WITH cust(id, name) AS (VALUES (1, 'Aziz'), (2, 'Bekzod'), (3, 'Dilnoza')),
     app(app_id, cust_id, amount) AS (VALUES (101, 2, 500), (102, 3, 900), (103, 4, 120))
SELECT c.id, c.name, a.app_id, a.amount
FROM cust c
INNER JOIN app a ON a.cust_id = c.id;
```

| id | name | app_id | amount |
|---|---|---|---|
| 2 | Bekzod | 101 | 500 |
| 3 | Dilnoza | 102 | 900 |

Two rows. Aziz is gone (no application); application 103 is gone (no customer).

On the real data:

```sql
SELECT c.customer_id, c.first_name, a.application_id, a.requested_amount
FROM customers c
INNER JOIN applications a ON a.customer_id = c.customer_id;
-- 14 000 rows: one per application
```

14 000 rows — one per application. The 587 customers who never applied are not in the result.

**When you use it.**
- "Each X with its Y" when every X has a Y, or when an X without a Y does not matter: each loan with its customer, each payment with its loan.
- Any report where a row without a partner would be a mistake.

**Your turn.** How many rows does `SELECT COUNT(*) FROM loans l INNER JOIN customers c ON c.customer_id = l.customer_id` return? Run it in a box above if you are not sure.

> 🎬 **Didn't get INNER JOIN?** [Baraa explains it · 12 min](https://youtu.be/SSKVgrwhzus?t=10708&end=11457)

### LEFT JOIN — every row of the left table

**What it is.** **LEFT JOIN** (*левое соединение*) keeps **every row of the left table** — the table named in `FROM`. When a left row has a partner, the partner's columns are filled in. When it has none, the row stays and the right-hand columns are **NULL** (empty).

**How to write it.**

```sql
WITH cust(id, name) AS (VALUES (1, 'Aziz'), (2, 'Bekzod'), (3, 'Dilnoza')),
     app(app_id, cust_id, amount) AS (VALUES (101, 2, 500), (102, 3, 900), (103, 4, 120))
SELECT c.id, c.name, a.app_id, a.amount
FROM cust c
LEFT JOIN app a ON a.cust_id = c.id;
```

| id | name | app_id | amount |
|---|---|---|---|
| 1 | Aziz | NULL | NULL |
| 2 | Bekzod | 101 | 500 |
| 3 | Dilnoza | 102 | 900 |

Three rows — all three customers. Aziz stays, with NULL where his application would be. Application 103 is still gone: it is on the right side, and LEFT protects only the left.

On the real data:

```sql
SELECT c.customer_id, c.first_name, a.application_id, a.requested_amount
FROM customers c
LEFT JOIN applications a ON a.customer_id = c.customer_id;    -- 14 587 rows
```

14 587 rows = 14 000 applications + 587 customers with no application.

**When you use it.**
- "Every X, with its Y if it has one": every customer with their applications, every branch with its loans.
- When "none" is itself an answer you want to see — the customers who never applied are the NULL rows.

> 💡 **Key idea.** Rows of a LEFT JOIN = matched rows + left rows with no match. 14 000 + 587 = 14 587. Do this sum every time you write LEFT JOIN; if it does not add up, the join is not doing what you think.

**Your turn.** How many loans have **no payment at all**? Write a LEFT JOIN from `loans` to `payments` in any box and count the rows whose payment side is NULL.

> 🎬 **Didn't get LEFT JOIN?** [Baraa explains it · 7 min](https://youtu.be/SSKVgrwhzus?t=11457&end=11890)

### INNER vs LEFT — the row with no partner

**What it is.** The only difference between the two is what happens to a left row that finds **no partner**: INNER drops it, LEFT keeps it with NULLs.

| | INNER JOIN | LEFT JOIN |
|---|---|---|
| Left row **with** a partner | kept | kept |
| Left row **without** a partner | dropped | kept, right columns NULL |
| Right row without a partner | dropped | dropped |
| `customers` → `applications` | 14 000 rows | 14 587 rows |

**When to choose which.** Ask one question: *"if an X has no Y, do I still want to see the X?"* Yes → LEFT. No → INNER.

> ⚠️ **Watch out.** A `WHERE` on a right-table column turns a LEFT JOIN back into an INNER JOIN. `LEFT JOIN applications a … WHERE a.status = 'approved'` drops every customer without an application, because for them `a.status` is NULL and NULL is never equal to anything. If the condition belongs to the right table, put it in `ON`: `LEFT JOIN applications a ON a.customer_id = c.customer_id AND a.status = 'approved'`.

**Your turn.** Madina wants **a list of all ten branches** with their loans. Which join?

### The anti-join — rows that have no partner

**What it is.** An **anti-join** finds the left rows that have **no** match on the right. It is a LEFT JOIN followed by a filter on the NULL side. There is no `ANTI JOIN` keyword; this pattern *is* the anti-join.

**How to write it.**

```sql
SELECT c.customer_id, c.first_name, c.last_name
FROM customers c
LEFT JOIN applications a ON a.customer_id = c.customer_id
WHERE a.application_id IS NULL;  -- 587 customers who never applied
```

587 rows — exactly the customers whose application columns came back NULL.

**When you use it.** "Which X have no Y": customers who never applied, loans with no payment, products nobody took this month, collectors with no actions this week.

> ⚠️ **Watch out.** The test is `IS NULL`, never `= NULL` (Day 4 explains why). And the join must be LEFT: after an INNER JOIN every row has a partner, so `WHERE a.application_id IS NULL` returns 0 rows — a plausible, wrong "nobody".

**Your turn.** Count the loans that have no payment (expected: one number, 392).

> 🎬 **Didn't get the left anti-join?** [Baraa explains it · 4 min](https://youtu.be/SSKVgrwhzus?t=12468&end=12708)

### RIGHT JOIN — every row of the right table

**What it is.** **RIGHT JOIN** (*правое соединение*) is the mirror of LEFT: it keeps **every row of the right table** (the one after `JOIN`) and fills the left side with NULLs where nothing matches.

**How to write it.**

```sql
WITH cust(id, name) AS (VALUES (1, 'Aziz'), (2, 'Bekzod'), (3, 'Dilnoza')),
     app(app_id, cust_id, amount) AS (VALUES (101, 2, 500), (102, 3, 900), (103, 4, 120))
SELECT c.id, c.name, a.app_id, a.amount
FROM cust c
RIGHT JOIN app a ON a.cust_id = c.id;
```

| id | name | app_id | amount |
|---|---|---|---|
| 2 | Bekzod | 101 | 500 |
| 3 | Dilnoza | 102 | 900 |
| NULL | NULL | 103 | 120 |

Three rows — all three applications. Application 103 stays, with NULL where its customer would be. Aziz is gone: he is on the left, and RIGHT protects only the right.

**When you use it.** Almost never, by choice: `A RIGHT JOIN B` gives the same rows as `B LEFT JOIN A`. Analysts write the table they want complete in `FROM` and use LEFT, so a reader knows which side is protected without thinking. You will meet RIGHT JOIN in other people's code and in Baraa's chapter — read it as "a LEFT JOIN written backwards".

| These two return the same rows | |
|---|---|
| `FROM cust c RIGHT JOIN app a ON a.cust_id = c.id` | `FROM app a LEFT JOIN cust c ON a.cust_id = c.id` |

**Your turn.** Which query returns the same rows as `SELECT … FROM loans l RIGHT JOIN customers c ON c.customer_id = l.customer_id`?

> 🎬 **Didn't get RIGHT JOIN?** [Baraa explains it · 5 min](https://youtu.be/SSKVgrwhzus?t=11890&end=12188)

### FULL OUTER JOIN — every row from both sides

**What it is.** **FULL OUTER JOIN** (*полное внешнее соединение*) keeps every row of **both** tables: matched rows side by side, left rows without a partner with NULLs on the right, right rows without a partner with NULLs on the left. `FULL JOIN` is the same thing.

**How to write it.**

```sql
WITH cust(id, name) AS (VALUES (1, 'Aziz'), (2, 'Bekzod'), (3, 'Dilnoza')),
     app(app_id, cust_id, amount) AS (VALUES (101, 2, 500), (102, 3, 900), (103, 4, 120))
SELECT c.id, c.name, a.app_id, a.amount
FROM cust c
FULL OUTER JOIN app a ON a.cust_id = c.id
ORDER BY COALESCE(c.id, a.cust_id);
```

| id | name | app_id | amount |
|---|---|---|---|
| 1 | Aziz | NULL | NULL |
| 2 | Bekzod | 101 | 500 |
| 3 | Dilnoza | 102 | 900 |
| NULL | NULL | 103 | 120 |

Four rows — nothing is lost from either side. Aziz has no application; application 103 has no customer; both are visible at once.

**When you use it.** Comparing two lists that should agree: the loans in our database against the loans in the bank's file, this month's customers against last month's, a plan against actuals. The rows with NULL on either side are the differences. On the real data, `customers` ⟷ `applications` has no orphan applications (every `applications.customer_id` exists), so a FULL JOIN there gives the same 14 587 rows as the LEFT JOIN — that is a result too: the check passed.

| Join | Keeps | Rows on `cust` ⟷ `app` |
|---|---|---|
| INNER | matched only | 2 |
| LEFT | all left + matched | 3 |
| RIGHT | all right + matched | 3 |
| FULL | everything | 4 |

**Your turn.** Finance sends a file of the loans the bank paid out. You must find loans that are in our database but not in the file **and** loans in the file that are not in our database. Which join?

> 🎬 **Didn't get FULL JOIN?** [Baraa explains it · 5 min](https://youtu.be/SSKVgrwhzus?t=12188&end=12459)

### CROSS JOIN — every row with every row

**What it is.** **CROSS JOIN** (*перекрёстное соединение*) has no `ON`. It pairs **every row of the first table with every row of the second**: 5 rows × 10 rows = 50 rows.

**How to write it.**

```sql
SELECT p.name AS product, b.branch_name
FROM products p
CROSS JOIN branches b
ORDER BY p.name, b.branch_name;                              -- 5 × 10 = 50 rows
```

50 rows: each of the 5 products paired with each of the 10 branches.

**When you use it.** To build a **complete grid** before you fill it: every product in every branch (then LEFT JOIN the loan counts, so a product with zero loans in a branch shows 0 instead of disappearing); every day of the month for every branch; every size for every colour.

> ⚠️ **Watch out.** A join whose `ON` is wrong or missing behaves like a CROSS JOIN: 7 828 loans × 6 040 customers = 47 million rows. If a query suddenly takes forever and the row count is huge, check the `ON`.

**Your turn.** How many rows does `SELECT COUNT(*) FROM products CROSS JOIN branches` return?

> 🎬 **Didn't get CROSS JOIN?** [Baraa explains it · 3 min](https://youtu.be/SSKVgrwhzus?t=13416&end=13614)

> ⚠️ **Quirk: a comma between two tables is a join.**
>
> - **You expect:** `FROM loans l, products p` to be a plain list of tables, or an error.
> - **What happens:** it is a join with no `ON` — every loan with every product, 7 828 × 5 = 39 140 rows. Its condition goes in `WHERE`: `WHERE l.product_id = p.product_id` makes it an inner join again.
> - **Why:** this is how joins were written before `JOIN … ON` arrived in 1992, and every database still accepts it. You will meet it in old reports.
> - **Protect yourself:** write `JOIN … ON` yourself. When you read a comma join, find its condition in `WHERE` first; no condition means a cross join.

```sql
SELECT COUNT(*) AS pairs
FROM loans l, products p;   -- 39 140
```

Add `WHERE l.product_id = p.product_id` on a new line and run again: 7 828, one row per loan — the same as `JOIN products p ON p.product_id = l.product_id`.

### Self-join — a table joined to itself

**What it is.** A **self-join** joins a table to **another copy of itself**. There is no special keyword: you name the same table twice with two aliases, and the `ON` compares two rows of that one table.

**How to write it.** "Two customer rows that share a phone number" compares `customers` with `customers`:

```sql
SELECT a.customer_id, a.first_name, a.last_name,
       b.customer_id AS other_id, b.first_name AS other_first, b.last_name AS other_last, a.phone
FROM customers a
JOIN customers b ON b.phone = a.phone
               -- each pair once, never a row with itself
               AND b.customer_id > a.customer_id
ORDER BY a.customer_id;  -- 43 pairs
```

43 pairs. The first one is customer 44, *Yulduz Karimova*, and customer 6005, *"Yulduz "* *"karimova"* — the same person typed twice, with a trailing space and a lower-case surname. (Keep this query: Thursday's detective case is built on rows like these.)

The second condition does two jobs: `b.customer_id > a.customer_id` stops a row matching itself (same phone, same id) and stops every pair appearing twice (44–6005 and 6005–44).

**When you use it.** Rows that relate to other rows of the same table: duplicates (same phone, same name and birth date), an employee and their manager when both are rows of `staff`, a payment and the previous payment of the same loan, a customer's first loan and their next one.

**Your turn.** Why does the self-join need `b.customer_id > a.customer_id`?

### Many-to-one and one-to-many — what happens to your row count

(Animated explanation)
One to many: why the total grew
- Two loans and their instalments. Loans 3 and 6 are 3-month loans: three instalment rows each, one colour per loan.
- Join them on `loan_id`: each loan meets **each** of its instalments. 2 loan rows become 6 rows, and every `principal` is copied three times.
- Now add up the loans' money on the joined rows.
- One row is now an **instalment**, not a loan: the grain changed. Sum loan columns **before** the join, or count loans with `COUNT(DISTINCT loan_id)`.
- Worse: two **many** tables. Loan 3 has 3 payments and 3 instalments — the key `loan_id` repeats on both sides.
- Every payment meets every instalment: 3 × 3 = 9 rows for one loan. Payment 28 now sits next to instalments 2 and 3, which it never paid.
- The rule of thumb for every join you write.

**What it is.** The **direction of the relationship** decides how many rows a join returns.

- **Many → one** (`loans → customers`): every loan finds **one** customer. 7 828 loans in, 7 828 rows out. The row count does not change.
- **One → many** (`loans → installments`): every loan finds **all** its instalments. 7 828 loans in, **92 193** rows out — one per instalment, and the loan's columns are **repeated** on every one of them.

```sql
SELECT COUNT(*)
FROM loans l
JOIN installments i ON i.loan_id = l.loan_id;              -- 92 193, not 7 828
```

The repetition is correct: "one row per instalment, with its loan's details" is what you asked for. It becomes a trap only when you **add up a loan column** over that result: `SUM(l.principal)` counts each principal once per instalment — 3 to 48 times.

> 💡 **Key idea.** After a join, one row is one row of the **"many" side**. Before you count or sum anything, ask: *what is one row now?*

**When you use it.** Always — it is the question to ask of every join: *which side is "many"? Is that the grain I want?*

**Your turn.**

### Chaining tables — the path from one table to another

**What it is.** A query can join **as many tables as the question needs**. Each `JOIN … ON` adds one table. Its `ON` may use any table that is already in the query — not only the previous one.

**The path.** Two tables that have no key between them are joined **through** the tables that connect them. `customers` and `products` share no key, so "which products do Tashkent customers take?" cannot join them directly. The join map from Week 1 shows the way:

```text
customers           (who)
   │
   │ customer_id
   ▼
loans               (the loan)
   │
   │ product_id
   ▼
products            (what)
```

Each arrow is one `JOIN … ON` with that key. `loans` is the bridge: it points to both.

**How to write it.** Write the tables in the order of the path, one `JOIN` per arrow:

```sql
SELECT p.name AS product, COUNT(*) AS loans
FROM customers c
-- arrow 1: customers → loans
JOIN loans    l ON l.customer_id = c.customer_id
-- arrow 2: loans → products
JOIN products p ON p.product_id  = l.product_id
WHERE c.region = 'Tashkent'
GROUP BY p.name
ORDER BY loans DESC;
-- 3 020 loans: Micro 1 041, Consumer 921, BNPL 594, SME 302, Auto 162
```

3 020 loans belong to Tashkent customers; grouped by product (tomorrow's `GROUP BY`, shown here only to read the result), Micro loans lead with 1 041. Without the bridge the question has no answer.

**A path through a table you do not display.** "Who was the loan officer for loan 1?" The officer is stored on the **application**, not on the loan, and the officer's branch on `staff`:

```text
loans
   │
   │ application_id
   ▼
applications
   │
   │ officer_id
   ▼
staff
   │
   │ branch_id
   ▼
branches
```

```sql
SELECT l.loan_id, s.full_name AS officer, s.role, b.branch_name
FROM loans l
-- through applications (no column of it is shown)
JOIN applications a ON a.application_id = l.application_id
JOIN staff        s ON s.staff_id       = a.officer_id
JOIN branches     b ON b.branch_id      = s.branch_id
WHERE l.loan_id = 1;
-- Ulugbek Qodirov, loan_officer, Termez Central
```

`applications` appears in `FROM … JOIN` but not in `SELECT`: it is there only to carry the key from the loan to the officer. That is normal.

**Four tables, all many-to-one from the loan.** When every hop goes from "many" to "one", the row count stays at the starting table's:

```sql
SELECT l.loan_id,
       -- SQL Server: c.first_name + ' ' + c.last_name
       c.first_name || ' ' || c.last_name AS customer,
       p.name AS product, b.branch_name, l.principal, l.status
FROM loans l
JOIN customers c ON c.customer_id = l.customer_id
JOIN products  p ON p.product_id  = l.product_id
JOIN branches  b ON b.branch_id   = l.branch_id;  -- still 7 828 rows
```

Still 7 828 rows: a loan has one customer, one product, one branch. Add `installments` and the count jumps to 92 193 — the previous subsection.

**How to find a path yourself.**
1. Name the table that holds the column you want to *show* and the table that holds the column you want to *filter or group by*.
2. On the join map, walk from one to the other along the keys. Write down every table on the way.
3. One `JOIN … ON` per step, in walking order. Tables you walk through but do not show still need their `JOIN`.

**Your turn.** "The region of the **customer** for every collections action." `collections_actions` has `loan_id` and `collector_id`, but no `customer_id`. Which path reaches the customer?

Now write it: the number of collections actions per customer region (`collections_actions → loans → customers`). `GROUP BY` is tomorrow's topic — copy the `GROUP BY` line from the Tashkent example above.

> 🎬 **Didn't get joining several tables?** [Baraa explains it · 10 min](https://youtu.be/SSKVgrwhzus?t=13900&end=14511)

### Putting it together

One request, several of today's tools. *"Every branch, with the number of its loans and the number of its active loans — branches with none included."*

```sql
SELECT b.branch_name,
       -- counts matched loans; NULL (no loan) is not counted
       COUNT(l.loan_id)                                      AS loans,
       SUM(CASE WHEN l.status = 'active' THEN 1 ELSE 0 END)  AS active_loans
-- the list that must be complete goes in FROM …
FROM branches b
-- … so LEFT protects it
LEFT JOIN loans l ON l.branch_id = b.branch_id
GROUP BY b.branch_name
ORDER BY loans DESC;
-- 10 rows, one per branch
```

Read it with the questions from this section: the complete list is `branches`, so it is the left table and the join is LEFT; the "many" side is `loans`, so one row before grouping is one loan; `GROUP BY` folds those rows back to one per branch (tomorrow). `COUNT(l.loan_id)` instead of `COUNT(*)` is on purpose: a branch with no loans would still have one row (with NULLs) and `COUNT(*)` would say 1.

**Which join answers which question?**

### Depth (optional)

- ▶ Baraa, *SQL joins (basics)* [2:47:57](https://youtu.be/SSKVgrwhzus?t=10077&end=12449) — 40 min, INNER/LEFT/RIGHT/FULL with his pictures; his `customers`/`orders` are our `customers`/`loans`.
- RU deck (TBC Data Analytics 2.0, if you have it) `2.1 SQL-47-77.pdf` — JOIN pages. *Russian terms:* соединение = join, внутреннее = inner, левое = left, псевдоним = alias, ключ соединения = join key.

---

## 2. Worked example — Bekzod's list

**Ask:** one row per loan: customer, region, product, branch, principal, status; biggest first; show me the top five.

Each step uses one subsection of section 1, in the order you learned them.

1. **Why a join.** The answer needs columns from four tables: name and region in `customers`, the product name in `products`, the branch name in `branches`, principal and status in `loans`. More than one table → a join.
2. **The shape — FROM … JOIN … ON.** One row of the answer is one loan, so `loans` goes in `FROM` with the alias `l`. Every other table gets an alias too, and every column gets its prefix.
3. **INNER vs LEFT.** Ask the question: *if a loan has no customer, do I still want it?* There is no such loan — the anti-join `loans LEFT JOIN customers … WHERE c.customer_id IS NULL` returns 0 — so INNER JOIN loses nothing. The same holds for products and branches.
4. **Many-to-one.** Each hop goes from a loan to *one* customer, *one* product, *one* branch. The row count must stay 7 828. Run `COUNT(*)` before you add `ORDER BY`.
5. **Chaining — the path.** `customers ← loans → products`, `loans → branches`: all three keys sit on `loans`, so `loans` is the hub and every `ON` uses `l.`.
6. Write, run, check:

```sql
-- SQL Server: SELECT TOP 5 …  (drop the LIMIT line)
SELECT l.loan_id, c.first_name || ' ' || c.last_name AS customer, c.region,
       p.name AS product, b.branch_name, l.principal, l.status
FROM loans l
JOIN customers c ON c.customer_id = l.customer_id
JOIN products  p ON p.product_id  = l.product_id
JOIN branches  b ON b.branch_id   = l.branch_id
ORDER BY l.principal DESC
LIMIT 5;
```

| loan_id | customer | region | product | branch | principal | status |
|---|---|---|---|---|---|---|
| 2861 | Maftuna Umarova | Tashkent | Small business loan | Tashkent Central | 599 060 000 | active |
| 4570 | Umida Khasanova | Namangan | Small business loan | Namangan Central | 598 450 000 | closed |
| 4601 | Abror Abdullaev | Tashkent | Small business loan | Tashkent Central | 597 540 000 | active |
| 4970 | Gulnora Nazarova | Tashkent | Small business loan | Tashkent Central | 597 520 000 | active |
| 7520 | Sevara Tursunova | Tashkent | Small business loan | Tashkent South | 595 160 000 | active |

Loan 4570 — last Friday's three 57 170 000 payments — is Umida Khasanova's closed SME loan from Namangan. That is what Bekzod meant by "readable".

---

## 3. Practice (60 min)

Questions whose answer is a query have a box under them — write, **▶ Run**, then **✔ Check** compares your result with the answer without showing it; your query is saved in this browser. Questions that ask for a number or a reason have an answer box of their own. The questions follow section 1 in order; the label in brackets names the subsection each one trains. Only this week's and last week's SQL: `SELECT … JOIN … WHERE … ORDER BY`, `COUNT(*)`, `TOP`/`LIMIT`. No `GROUP BY` yet (tomorrow). Keep the **Database** panel (button at the bottom right) open while you work: it lists every table and its columns — your join map.

**P1.** *(INNER JOIN)* Join `loans` to `customers`. How many rows? Now run `SELECT COUNT(*) FROM loans`. Why the same?

Why does the join return exactly as many rows as `loans`?

**P2.** *(INNER JOIN)* SME loans (`product_id = 5`) taken by affluent customers — how many?

**P3.** *(INNER JOIN)* Micro loans (`product_id = 1`) taken by customers living in Samarkand — how many?

**P4.** *(INNER JOIN)* Active loans held at the Nukus and Termez branches (the branch's region, not the customer's).

**P5.** *(INNER JOIN)* The three largest written-off loans with the borrower's name and region.

**P6.** *(LEFT JOIN)* Loan 1's schedule with its payments: instalment number, due date, amount due, paid date, amount paid — including instalments not yet paid.

Read your result: which instalment was paid latest relative to its due date? (Compare `due_date` and `paid_at` by eye — date arithmetic is Wednesday's.)

**P7.** *(INNER vs LEFT)* Count the rows of `customers INNER JOIN loans` and of `customers LEFT JOIN loans` (same `ON`). Explain the difference.

How many customers have no loan?

**P8.** *(Anti-join)* Loans that have never had a collections action — and prove the number with two single-table counts.

**P9.** *(RIGHT JOIN)* Every staff member with their collections actions, written as a RIGHT JOIN: `FROM collections_actions ca RIGHT JOIN staff s ON s.staff_id = ca.collector_id`. How many staff members have no action at all? Then write the same query as a LEFT JOIN.

How many staff members have no collections action at all?

**P10.** *(FULL OUTER JOIN)* Our list has loans 1, 2, 3 and 5. The bank's file has loans 2, 3, 4, 5 and 6. Build both lists with `WITH … VALUES` (as in section 1) and show, in one result, every loan with the side it is missing from.

**P11.** *(CROSS JOIN)* A blank grid for Madina: every product at every branch in the Tashkent region. How many rows?

**P12.** *(Self-join)* Pairs of customers whose first name, last name **and** birth date are exactly the same. Each pair once.

Why does the exact self-join miss the 40 known duplicates?

**P13.** *(Many-to-one and one-to-many)* Count the rows of `loans JOIN installments`, `loans JOIN payments`, and `loans LEFT JOIN payments`. Explain each number from the relationships.

From your three counts: how many loans have **no payment at all**?

**P14.** *(Chaining tables)* Active Auto loans booked at the *Tashkent Central* branch. Use the product **code**, not the id, and the branch **name** — three tables.

**P15.** *(The path through a table you do not show)* Week 1, Day 1, P7c asked "how many calls did collectors make in Fergana?". Answer it now: `collections_actions → staff → branches`.

> 🚀 **Stretch (optional, +5 XP).** One more join for the curious — not needed to finish the day.

**P16.** *(Anti-join)* Join `loans` to `applications`. How many loans came through each channel? (One `COUNT(*)` with a `WHERE` per channel.) Then: how many applications have `status = 'approved'` but no loan at all?

Before you look at those 89 rows: describe in words what they most likely are, and how you would check it.

### SQL lab — your own lookup table

A join works on any two tables that share a key — including one you build. This lab runs on **your practice copy** of the database (the **Database** panel shows your new table; **Database → Reset** brings the original back).

An INNER JOIN on the shortened lookup would now return 4 789 customers without any warning — the 1 251 SME customers would simply be gone. That is why every join to a reference table deserves a LEFT JOIN … IS NULL check once.

---

## 4. Homework <span class="badge hw">HW 2.1 — Due Day 3</span>

**Bekzod's loan book.** Ten queries he can run every Monday, written and checked in the workspace below. Q1–Q5 and Q7–Q9 use today's joins; **Q6 and Q10 need one tool from tomorrow** (`GROUP BY` and `SUM`) — do them after Day 2; the homework is due on Day 3. Each query is checked against the data when you tap **✔ Check** (row count and the key number, never the answer itself); 📤 Submit sends the whole file `loan_book.sql` to your mentor.

### 📎 Hand in here

---

## 5. Self-check

---

## 6. Company corner <span class="badge company">Outstanding and portfolio</span>

Bekzod's second question every Monday is *"how big is the book?"*. Two different numbers answer it, and they are both joins of `installments` with `loans`/`payments`. Learn to compute both and to say which one you mean. Both queries add a column up with `SUM(column)` — tomorrow's first topic; today read it as "add this column over the rows that are left".

**1. Outstanding balance** (*остаток долга*) — the principal not yet repaid. On an annuity schedule, every instalment carries a slice of principal (`principal_due`); the principal still outstanding on the as-of date is the sum of the slices **not yet due**:

```sql
SELECT SUM(i.principal_due) AS outstanding, COUNT(DISTINCT i.loan_id) AS loans
FROM installments i
WHERE i.due_date > '2026-10-01';  -- 208 723 504 430 across 3409 loans
```

**208.7 bn UZS** of principal is still scheduled to come in. The **portfolio** is this number, usually restricted to live loans: join `loans` and keep `status = 'active'` → **203.4 bn** on 3 341 loans; the remaining 5.3 bn sits on 22 `default` and 46 `written_off` loans whose schedules run on although nobody expects the money. Bekzod's "the Auto book" is the same query filtered through `products` (active loans: Auto 56.0 bn on 358 loans; SME 122.8 bn; Consumer 22.6 bn; BNPL 1.1 bn; Micro 1.0 bn). Note what outstanding is *not*: `SUM(principal)` of active loans is 297.0 bn — the amount originally lent, not what is left.

**2. Overdue amount** (*сумма просрочки*) — the money that *should already have arrived* and has not: instalments with `due_date <= as-of` and no payment against them. That is the anti-join pattern from today, on `installments → payments`:

```sql
SELECT SUM(i.total_due) AS overdue, COUNT(*) AS instalments, COUNT(DISTINCT i.loan_id) AS loans
FROM installments i
LEFT JOIN payments p ON p.installment_id = i.installment_id
WHERE i.due_date <= '2026-10-01' AND p.payment_id IS NULL;
-- 6 475 544 633 · 1357 · 399
```

**6.48 bn UZS** on 1 357 matured instalments of 399 loans has not been paid at all. Most of it is already dead money: joined to `loans`, 4.88 bn sits on written-off loans and 0.87 bn on defaults; **0.69 bn on 181 instalments of active loans** is what Sevara's team is actually chasing this week. The last 0.04 bn sits on 15 loans marked `closed` that have no `closed_at` and one unpaid instalment each — not money to chase, a data question to raise (4.88 + 0.87 + 0.69 + 0.04 = 6.48). One refinement for Wednesday: this query treats a *partially* paid instalment as paid. Counting "not fully paid" gives 1 784 instalments on 413 loans and 7.60 bn still owed — the number the DPD computation will use.

| Number | Question it answers | Grain of the query | As of 2026-10-01 |
|---|---|---|---|
| **Outstanding** | how much principal is still to come | instalments with `due_date > as-of` | 208.7 bn (203.4 bn active) |
| **Overdue** | how much should have come and did not | matured instalments with no payment | 6.48 bn (0.69 bn on active loans) |

> 🎯 **Interview version.** *"What is the difference between outstanding balance and overdue amount, and how would you compute each?"* — Outstanding = principal not yet due, from the schedule; overdue = matured instalments without payment, from schedule minus payments. Mention that outstanding includes the overdue loans' *future* principal too, and that both need a date.

**Say it like in an interview.** *"What is the difference between outstanding balance and overdue amount, and how would you compute each in SQL?"* Answer as you would out loud, with Nur Finance numbers.

Tomorrow: Madina's board pack — the same joins, with `GROUP BY` on top.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 2 · Day 2 — Counting and summing: the portfolio in numbers (weeks/week-02/day-2.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-02/day-2
=====

# Week 2 · Day 2 — Counting and summing: the portfolio in numbers

<span class="badge">Learn 60 min</span> <span class="badge">Practice 60 min</span> <span class="badge company">Company corner</span>

> STORY **Tuesday, 8:50.** Madina drops a printed slide on your desk: a table with five product rows and twelve month columns, half the cells crossed out in red pen. *"The October board pack. Timur builds this from the warehouse, but the warehouse loaded on the 1st and the board wants the September figures re-cut by product, by branch and by month — loans and disbursed amount — today. Yesterday you joined the tables. Today you add them up. And please, no Excel."*

## Today in 3 lines

- You can use the five **aggregates** (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`) with **GROUP BY** on one or several columns, filter groups with **HAVING**, and sort by an aggregate.
- You know the difference between **COUNT(\*)** and **COUNT(DISTINCT …)**, and why an aggregate after a one-to-many join gives a wrong — and plausible — number.
- You can produce **disbursements by month and product**, **average ticket**, and **approval rate by channel** in one query each.

---

## 1. Learn — aggregation: many rows into one number

### COUNT — rows, values and different values

**What it is.** An **aggregate function** (*агрегатная функция*) takes many rows and returns one value. **COUNT** counts, in three forms that answer three different questions:

- `COUNT(*)` counts **rows**.
- `COUNT(column)` counts the rows where that column is **not NULL**.
- `COUNT(DISTINCT column)` counts the **different** non-NULL values.

**How to write it.** On a tiny table of four payments:

| `pay` | loan_id | method |
|---|---|---|
| | 1 | card |
| | 1 | cash |
| | 2 | card |
| | 3 | NULL |

```sql
WITH pay(loan_id, method) AS (VALUES (1, 'card'), (1, 'cash'), (2, 'card'), (3, NULL))
SELECT COUNT(*)               AS rows_,        -- 4: every row
       COUNT(method)          AS with_method,  -- 3: the NULL is skipped
       COUNT(DISTINCT method) AS methods       -- 2: card and cash
FROM pay;
```

On the real data:

```sql
SELECT COUNT(*)                    AS loans,            -- 7 828
       COUNT(closed_at)            AS with_close_date,  -- 4 227
       COUNT(DISTINCT customer_id) AS borrowers         -- 4 335
FROM loans;
```

7 828 loans; 4 227 of them have a closing date; they belong to 4 335 different people, so many customers have more than one loan.

**When you use it.**

| Question | Write |
|---|---|
| How many loans? | `COUNT(*)` |
| How many loans have a closing date? | `COUNT(closed_at)` |
| How many different people borrowed? | `COUNT(DISTINCT customer_id)` |

> ⚠️ **Watch out.** "How many customers?" answered with `COUNT(*)` on `loans` counts loans, not people: 7 828 instead of 4 335. Count the column that names the thing you mean.

**Your turn.** How many different customers have ever applied for a loan? (One query on `applications`.)

> 🎬 **Didn't get COUNT, SUM, AVG, MIN and MAX?** [Baraa explains it · 5 min](https://youtu.be/SSKVgrwhzus?t=31420&end=31706)

> ⚠️ **Quirk: `COUNT(DISTINCT a, b)` is an error in SQLite.**
>
> - **You expect:** the number of different (customer, product) pairs.
> - **What happens:** *wrong number of arguments to function COUNT()*. SQLite's `COUNT(DISTINCT …)` takes exactly one column. (MySQL accepts two; SQL Server does not.)
> - **Protect yourself:** make one value out of the pair — `customer_id || '-' || product_id` (`||` glues texts; tomorrow's lesson) — or count the rows of a `SELECT DISTINCT a, b` (week 3). Keep a separator between the parts: without it, 1 and 23 glue into the same `123` as 12 and 3.

```sql
SELECT COUNT(DISTINCT
         customer_id || '-' || product_id)
       AS pairs
FROM loans;
-- 6 602; then try two columns: the error
```

6 602 different customer–product pairs among the 7 828 loans: some people took the same product more than once.

### SUM — add a column up

**What it is.** **SUM** adds up the values of a numeric column over the rows that are left after `WHERE`. NULL values are skipped.

**How to write it.**

```sql
SELECT SUM(principal) AS disbursed         -- 404 783 280 000
FROM loans;

SELECT SUM(principal) AS active_disbursed  -- 296 980 040 000
FROM loans
WHERE status = 'active';
-- WHERE first, then the sum over the rows that are left
```

404.8 bn UZS lent in total; 297.0 bn of it sits on loans that are still active.

**When you use it.** "How much": the amount lent, the amount received, the amount overdue. For "how many", use `COUNT`. On SQL Server, `SUM` of an `INT` column is an `INT` too and stops with *Arithmetic overflow* above about 2.1 bn — our 404.8 bn needs `SUM(CAST(principal AS BIGINT))`, or a `BIGINT` column as in Week 1's design table.

> ⚠️ **Watch out.** `SUM` over no rows returns NULL, not 0: `SELECT SUM(principal) FROM loans WHERE status = 'frozen'` gives NULL. Day 4's `COALESCE` turns it into 0. `COUNT` over no rows is 0; `AVG`, `MIN` and `MAX` are NULL like `SUM`. And with a `GROUP BY`, no rows means no groups at all — an empty result, not a row of zeros.

**Your turn.** How much money arrived in payments from 1 January to 30 September 2026? Use `paid_at >= '2026-01-01' AND paid_at < '2026-10-01'`.

**Try it.** No loan has the status `'frozen'`, so both aggregates run over zero rows:

```sql
SELECT SUM(principal) AS total,
       COUNT(*) AS loans
FROM loans
WHERE status = 'frozen';
-- NULL · 0
```

`total` comes back empty, `loans` is 0. An empty tile next to a 0 on a dashboard is this quirk; Day 4's `COALESCE(SUM(principal), 0)` shows 0 instead.

### AVG — the average, and the whole-number trap

**What it is.** **AVG** is the sum of the non-NULL values divided by their count. The result is one number for all the rows (or one per group, later).

**How to write it.**

```sql
SELECT AVG(principal)                   AS avg_ticket,  -- 51 709 667.86
       -- 51 709 667: whole number ÷ whole number
       SUM(principal) / COUNT(*)        AS int_division,
       1.0 * SUM(principal) / COUNT(*)  AS by_hand      -- 51 709 667.86
FROM loans;
-- SQL Server: AVG of an integer column is a whole number too — write AVG(1.0 *
-- principal)
```

The average loan is 51.7 m UZS. Divided by hand, two whole numbers lose the .86: the fraction is cut off, not rounded.

**When you use it.** Average ticket, average term, average days late. Put the count next to the average: an average over 3 loans and one over 3 000 look the same on a slide.

> ⚠️ **Watch out.** Whole number ÷ whole number = whole number. `SUM(term_months) / COUNT(*)` returns 11; the real average term is 11.78 months. Put `1.0 *` first, or use `AVG`. Day 3 comes back to division.

> ⚠️ **Watch out.** Never average averages. Micro has 2 669 loans averaging 2.7 m, SME 781 loans averaging 308.7 m. The average of all 3 450 loans is not (2.7 + 308.7) / 2 = 155.7 m — that gives the small group as much weight as the big one. Weight each average by its count: (2 669 × 2.7 + 781 × 308.7) / 3 450 ≈ 72.0 m. In SQL, take `AVG` over the loans themselves, never over a table of averages.

**Your turn.** What does `SELECT SUM(term_months) / COUNT(*) FROM loans` return on SQLite?

### MIN and MAX — the smallest and the largest

**What it is.** **MIN** and **MAX** return the smallest and the largest value of a column. They work on numbers, dates and text.

**How to write it.**

```sql
SELECT MIN(principal)    AS smallest,      -- 300 000
       MAX(principal)    AS largest,       -- 599 060 000
       MIN(disbursed_at) AS first_loan,    -- 2024-01-02
       MAX(disbursed_at) AS last_loan      -- 2026-10-01
FROM loans;
```

Loans run from 300 000 to 599 060 000 UZS. The first was paid out on 2 January 2024, the last on the as-of date, 1 October 2026.

**When you use it.** The range of a column — the first check on any new table. The first and last date of a period. The oldest unpaid instalment (Wednesday's DPD uses `MIN(due_date)`). Dates stored as `'YYYY-MM-DD'` text work because the text sorts like the date.

> ⚠️ **Watch out.** On text, upper case sorts before lower case. `MAX(last_name)` on `customers` is `'yusupov'` — a surname typed in lower case, not the last name in the alphabet.

**Your turn.** On which date was the latest payment made? (`payments.paid_at`)

### GROUP BY one column — one row per group

**What it is.** **GROUP BY** (*группировка*) splits the rows into groups that share a value. Every aggregate then runs once per group, and the result has one row per group.

**How to write it.** Five loans, three products:

| `ln` | loan_id | product | principal |
|---|---|---|---|
| | 1 | Micro | 2 |
| | 2 | Auto | 200 |
| | 3 | Micro | 3 |
| | 4 | Auto | 250 |
| | 5 | BNPL | 4 |

```sql
WITH ln(loan_id, product, principal) AS (VALUES (1, 'Micro', 2), (2, 'Auto', 200), (3, 'Micro', 3), (4, 'Auto', 250), (5, 'BNPL', 4))
SELECT product, COUNT(*) AS loans, SUM(principal) AS total
FROM ln
GROUP BY product;
```

| product | loans | total |
|---|---|---|
| Auto | 2 | 450 |
| BNPL | 1 | 4 |
| Micro | 2 | 5 |

Five rows in, three groups out. On the real data:

```sql
SELECT risk_grade, COUNT(*) AS loans, SUM(principal) AS principal
FROM loans
GROUP BY risk_grade;              -- A 1 821 · B 3 404 · C 2 264 · D 339
```

Four rows, one per grade. They add up to 7 828 — check this sum on every grouped result. An empty cell forms a group too: all the NULLs of the column fall into one row with an empty label. It is a real group — keep it, or the groups no longer add up to the total.

The rule behind most beginner errors: **every column in `SELECT` is either inside an aggregate or listed in `GROUP BY`.**

**When you use it.** "Per X", "by X", "for each X": loans per grade, payments per method, actions per collector.

> ⚠️ **Watch out.** `SELECT risk_grade, loan_id, COUNT(*) … GROUP BY risk_grade` asks for one `loan_id` per grade — which one, out of 3 404? SQL Server refuses the query ("not contained in an aggregate function or the GROUP BY clause"). SQLite silently picks one of them — whichever row it happens to meet — and runs. Never rely on it.

**Your turn.**

> 🎬 **Didn't get GROUP BY?** [Baraa explains it · 8 min](https://youtu.be/SSKVgrwhzus?t=3514&end=4010)

**Try it.** SQLite runs the query that SQL Server refuses:

```sql
SELECT risk_grade, loan_id,
       COUNT(*) AS loans
FROM loans
GROUP BY risk_grade;
-- each loan_id: just one of the grade's
```

Four rows, each with *some* `loan_id`. Nothing says which loan it is or why — that is the danger: the result looks complete.

### GROUP BY two columns — one row per combination

**What it is.** With two columns in `GROUP BY`, a group is a **combination** of values. The result has one row for each combination that occurs in the data.

**How to write it.**

```sql
SELECT status, risk_grade, COUNT(*) AS loans
FROM loans
GROUP BY status, risk_grade
ORDER BY status, risk_grade;          -- 16 rows: 4 statuses × 4 grades
```

| status | risk_grade | loans |
|---|---|---|
| active | A | 750 |
| active | B | 1 445 |
| … | | |
| written_off | C | 98 |
| written_off | D | 30 |

16 rows, because every status occurs with every grade. Written-off loans: 13 in grade A, 98 in grade C — the grade predicts loss.

A combination that does not occur gets **no row** — not a row with 0. When you need the zeros, build the full grid with Day 1's `CROSS JOIN`.

A group can also be an **expression**. The month of a date is Wednesday's topic; you need it today, so copy it as it stands:

```sql
-- SQL Server:  FORMAT(l.disbursed_at, 'yyyy-MM')      SQLite: 
-- strftime('%Y-%m', l.disbursed_at)
SELECT strftime('%Y-%m', l.disbursed_at) AS month, p.name, COUNT(*) AS loans, SUM(l.principal) AS disbursed
FROM loans l JOIN products p ON p.product_id = l.product_id
WHERE l.disbursed_at >= '2026-01-01'
GROUP BY strftime('%Y-%m', l.disbursed_at), p.name
ORDER BY month, disbursed DESC;  -- 50 rows: 10 months × 5 products
```

`GROUP BY` repeats the expression: SQL Server does not accept the alias `month` there (SQLite accepts either).

**When you use it.** "By X and Y": by month and product, by region and segment. The result is **long**: one row per cell of the table you will show.

**Your turn.** How many rows does `SELECT channel, status, COUNT(*) FROM applications GROUP BY channel, status` return?

### WHERE vs HAVING — filter rows, or filter groups

(Animated explanation)
WHERE asks each row, HAVING asks each group
- Eighteen loans in three branches, one dot each. Blue = active, grey = closed.
- `WHERE` asks **each row** one question: is it active? The grey loans are out before any counting starts.
- `GROUP BY branch` folds what is left into one row per branch, and `COUNT(*)` counts each: Andijan 4, Bukhara 2, Fergana 5.
- The question is now about whole branches.
- `HAVING` asks **each group**: Bukhara's 2 is not more than 3, so the whole group goes. The framed groups, Andijan and Fergana, stay.
- Follow the rows in order: first the rows, then the groups.

**What it is.** `WHERE` filters **rows before** grouping. **HAVING** filters **groups after** the aggregates are computed. "Active loans, branches with more than 300 of them" needs both.

**How to write it.**

```sql
SELECT b.branch_name, COUNT(*) AS active_loans
FROM loans l JOIN branches b ON b.branch_id = l.branch_id
WHERE l.status = 'active'  -- keep only active loans (rows)
GROUP BY b.branch_name
-- keep only branches with more than 300 of them (groups)
HAVING COUNT(*) > 300
ORDER BY active_loans DESC;
-- 6 branches: Tashkent Central 435 … Andijan Central 334
```

Six of the ten branches have more than 300 active loans, from Tashkent Central with 435 down to Andijan Central with 334.

**When you use it.**

| | WHERE | HAVING |
|---|---|---|
| Filters | rows | groups |
| Runs | before `GROUP BY` | after `GROUP BY` |
| May use an aggregate | no | yes |
| Example | `l.status = 'active'` | `COUNT(*) > 300` |

> ⚠️ **Watch out.** `WHERE COUNT(*) > 300` is an error: when `WHERE` runs, no count exists yet. A condition on a plain column belongs in `WHERE` even when the query has a `HAVING` — it is cheaper, and it means "before counting".

**Your turn.** Put the three clauses into the gaps:

> 🎬 **Didn't get HAVING?** [Baraa explains it · 8 min](https://youtu.be/SSKVgrwhzus?t=4010&end=4492)

### Aggregating over a join — decide what one row is

**What it is.** When you aggregate after a join, `COUNT` and `SUM` run over the rows of the **join result**. One row of that result is one row of the "many" side (Day 1). So decide first what one row is; then decide what to count or sum.

**How to write it.** A many-to-one join keeps one row per loan, so loan counts and sums stay right:

```sql
SELECT p.name, COUNT(*) AS loans, COUNT(DISTINCT l.customer_id) AS customers, SUM(l.principal) AS disbursed
FROM loans l
-- many-to-one: one row is still one loan
JOIN products p ON p.product_id = l.product_id
GROUP BY p.name
ORDER BY disbursed DESC;
```

| name | loans | customers | disbursed |
|---|---|---|---|
| Small business loan | 781 | 724 | 241 117 150 000 |
| Auto loan | 391 | 381 | 84 791 530 000 |
| Consumer loan | 2 418 | 2 000 | 65 109 280 000 |
| Micro loan | 2 669 | 2 133 | 7 221 210 000 |
| Buy now pay later | 1 569 | 1 364 | 6 544 110 000 |

Micro borrowers come back: 2 669 loans for 2 133 people.

A one-to-many join repeats each loan, so a loan column summed over it is wrong:

```sql
SELECT p.name, SUM(l.principal)
-- one-to-many: one row is an instalment
FROM loans l JOIN installments i ON i.loan_id = l.loan_id
JOIN products p ON p.product_id = l.product_id
GROUP BY p.name;
-- SME 5 862 295 560 000 — 24× too big, and nobody would blink
```

Each principal is counted once per instalment. The factor is the term, which differs by product, so even the ranking changes: BNPL overtakes Micro.

| Join | One row is | `COUNT(*)` counts | `SUM(l.principal)` |
|---|---|---|---|
| `loans → products` | a loan | loans | right |
| `loans → installments` | an instalment | instalments | wrong: each principal × its term |

**When you use it.** Every grouped report whose labels live in another table: product names, branch names, regions. The rule: **aggregate a column at the grain of its own table.** Loan amounts over `loans`; instalment amounts over `installments`. When you need both in one result, aggregate each table separately and join the results — Week 3 gives you the tool.

> ⚠️ **Watch out.** When a query joins a one-to-many table, run `COUNT(*)` and `COUNT(DISTINCT l.loan_id)` next to each other first. If they differ, the join has multiplied the loans — do not `SUM` or `AVG` a loan column over it.

**Your turn.** In `FROM customers c JOIN loans l ON l.customer_id = c.customer_id GROUP BY c.region`, what does `COUNT(*)` count?

### ORDER BY an aggregate or its alias

**What it is.** After grouping, `ORDER BY` can sort by an aggregate (`ORDER BY COUNT(*) DESC`), by its alias (`ORDER BY active_loans DESC`) or by the column's position (`ORDER BY 2 DESC`). With `LIMIT` it gives a **top-N**.

**How to write it.**

```sql
SELECT b.branch_name, COUNT(*) AS active_loans
FROM loans l JOIN branches b ON b.branch_id = l.branch_id
WHERE l.status = 'active'
GROUP BY b.branch_name
-- the alias; COUNT(*) DESC or 2 DESC give the same order
ORDER BY active_loans DESC
LIMIT 3;
-- SQL Server: SELECT TOP 3 … (drop the LIMIT line)
```

Tashkent Central 435, Tashkent North 428, Tashkent South 416 — the three Tashkent branches hold the most active loans.

**When you use it.** Top-N and bottom-N: the biggest products, the weakest branches, the busiest collectors. Prefer the alias to a position: `ORDER BY 2` silently sorts by another column once someone adds a column in front.

> ⚠️ **Watch out.** A count and an amount rank differently. By number of active loans Tashkent South is third; by active principal it is fourth, behind Fergana Central. Sort by the measure the question names, and say which one in the title.

**Your turn.** The three branches with the largest amount disbursed in 2026 (`disbursed_at >= '2026-01-01'`), largest first.

### The order a query runs in

**What it is.** The database does not run a query top to bottom as you write it. It runs the clauses in this order:

```text
FROM / JOIN   which rows
   ▼
WHERE         keep rows
   ▼
GROUP BY      make groups
   ▼
HAVING        keep groups
   ▼
SELECT        compute columns
   ▼
ORDER BY      sort
   ▼
LIMIT         cut
```

Two steps the picture leaves out: `DISTINCT` runs right after `SELECT` (it removes repeated result rows before the sort), and Week 3's window functions run between `HAVING` and `SELECT`.

**How to read it.** Each clause sees only what the clauses before it produced:

| Because … | you cannot write | write instead |
|---|---|---|
| `WHERE` runs before `GROUP BY` | `WHERE COUNT(*) > 300` | `HAVING COUNT(*) > 300` |
| `WHERE` runs before `SELECT` | `WHERE active_loans > 300` (the alias does not exist yet) | repeat the expression, or use `HAVING`. SQLite does accept the alias of a *plain* column in `WHERE` (`principal / 1000000 AS m … WHERE m > 500`); SQL Server never does, so do not rely on it |
| `GROUP BY` runs before `SELECT` | `GROUP BY month` on SQL Server | repeat `strftime('%Y-%m', …)` in `GROUP BY` (SQLite accepts the alias) |
| `ORDER BY` runs after `SELECT` | — | `ORDER BY active_loans` works everywhere |

**When you use it.** Whenever an error says a column or an alias does not exist, or an aggregate is not allowed: find the clause in the line above and ask what has already run.

**Your turn.** Put the clauses in the order the database runs them:

### Set operators — stacking results

**What it is.** Joins put tables side by side; **set operators** (*операции над множествами*) put query results **on top of each other**. Both queries must return the same number of columns, of compatible types.

**How to write it.**

```sql
SELECT customer_id FROM loans
UNION                                  -- stack, then remove duplicate rows
SELECT customer_id FROM applications;  -- 5 453 rows
```

5 453 rows — every customer who applied, because every borrower also applied.

| Operator | Keeps | On our data |
|---|---|---|
| `UNION` | all rows of both, **duplicates removed** | the query above → 5 453 rows |
| `UNION ALL` | all rows of both, duplicates kept (fast) | the same with `UNION ALL` → 21 828 rows (7 828 + 14 000) |
| `EXCEPT` | rows of the first query not in the second | `applications` `EXCEPT` `loans` → 1 118 people who applied and never got a loan |
| `INTERSECT` | rows in both | applicants who are also borrowers → 4 335 |

**When you use it.** `UNION ALL` stacks "this month" and "last month" blocks into one table for a chart. `EXCEPT` is an anti-join written as sets.

> ⚠️ **Watch out.** Set operators match columns by **position**, not by name. The result takes the column names of the first query; if the second query lists its columns in another order (`SELECT loans, month` under `SELECT month, loans`), the values land under the wrong header — no error when the types are compatible. Write both column lists in the same order.

> 💡 **Key idea.** Default to `UNION ALL`. `UNION` must sort to remove duplicates, and it quietly merges rows that are legitimately identical — two months with the same count become one row.

**Your turn.** "Customers who applied but never got a loan", as a list of ids. Which operator?

> 🎬 **Didn't get set operators and their rules?** [Baraa explains it · 13 min](https://youtu.be/SSKVgrwhzus?t=14532&end=15286)

> 🎬 **Didn't get UNION and UNION ALL?** [Baraa explains it · 9 min](https://youtu.be/SSKVgrwhzus?t=15283&end=15842)

> 🎬 **Didn't get EXCEPT?** [Baraa explains it · 5 min](https://youtu.be/SSKVgrwhzus?t=15842&end=16162)

### Putting it together

One request, every tool of the day. *"Active loans per branch: how many, how much, the average ticket — only branches with more than 300 active loans, largest amount first."*

```sql
SELECT b.branch_name,
       -- COUNT: one row of the group = one loan
       COUNT(*)                AS active_loans,
       SUM(l.principal)        AS active_principal,  -- SUM over the same rows
       -- AVG; ROUND (Wednesday) = whole UZS
       ROUND(AVG(l.principal)) AS avg_ticket
FROM loans l
-- many-to-one: one row is still a loan
JOIN branches b ON b.branch_id = l.branch_id
WHERE l.status = 'active'                            -- rows, before grouping
GROUP BY b.branch_name                               -- one row per branch
HAVING COUNT(*) > 300                                -- groups, after grouping
ORDER BY active_principal DESC;                      -- the alias, after SELECT
```

| branch_name | active_loans | active_principal | avg_ticket |
|---|---|---|---|
| Tashkent Central | 435 | 42 718 190 000 | 98 202 736 |
| Tashkent North | 428 | 38 262 090 000 | 89 397 407 |
| Fergana Central | 373 | 36 994 490 000 | 99 180 938 |
| Tashkent South | 416 | 36 954 370 000 | 88 832 620 |
| Samarkand Central | 396 | 35 511 850 000 | 89 676 389 |
| Andijan Central | 334 | 27 620 130 000 | 82 695 000 |

Read it in the order it runs: `FROM … JOIN` gives one row per loan with its branch; `WHERE` keeps the 3 352 active ones; `GROUP BY` makes ten branch groups; `HAVING` keeps six; `SELECT` computes the three numbers; `ORDER BY` sorts by the amount. Fergana Central has fewer active loans than Tashkent South but more money in them: its average ticket is the highest of the six.

### Depth (optional)

- ▶ Baraa, *Aggregate functions* [8:43:36](https://youtu.be/SSKVgrwhzus?t=31416&end=31811) — 7 min; and *Set operators* [4:02:09](https://youtu.be/SSKVgrwhzus?t=14529&end=17261) — 40 min.
- RU deck (TBC Data Analytics 2.0, if you have it) `2.2 SQL-1-38.pdf` — GROUP BY / HAVING pages. *Russian terms:* агрегатная функция = aggregate, группировка = GROUP BY, средний чек = average ticket, объединение = UNION.

---

## 2. Worked example — the board-pack table

**Ask (Madina):** *loans and disbursed amount in 2026, by month and product.*

Each step uses one subsection of section 1, in the order you learned them.

1. **COUNT and SUM.** "Loans" is `COUNT(*)`; "disbursed amount" is `SUM(principal)`. Both read `loans`, where one row is one loan.
2. **GROUP BY two columns.** One row of the answer per (month, product). The month is the expression `strftime('%Y-%m', l.disbursed_at)`, repeated in `GROUP BY`.
3. **WHERE vs HAVING.** The period is a condition on rows, so it goes in `WHERE`: `disbursed_at >= '2026-01-01'` (and `< '2027-01-01'` if the data could run further; ours stops on 2026-10-01). No condition on a group, so no `HAVING`.
4. **Aggregating over a join.** The product name lives in `products`. `loans → products` is many-to-one, so one row is still one loan and the sums stay right. No instalments needed.
5. **ORDER BY.** By month, then by the alias `disbursed`, largest first.
6. Query: section 1's month × product query. First rows of the result:

| month | product | loans | disbursed |
|---|---|---|---|
| 2026-01 | Small business loan | 34 | 10 042 990 000 |
| 2026-01 | Auto loan | 20 | 4 620 560 000 |
| 2026-01 | Consumer loan | 90 | 2 337 660 000 |
| 2026-01 | Micro loan | 99 | 262 110 000 |
| 2026-01 | Buy now pay later | 44 | 189 050 000 |
| 2026-02 | Small business loan | 21 | 6 035 880 000 |
| … | | | |

50 rows (10 months × 5 products; October has one day). This is the **long format** — one row per cell of Madina's slide. Her slide is the **wide** format (months across). Turning long into wide is Thursday's `SUM(CASE …)` or, in practice, a pivot table in Excel/Power BI on top of exactly this result. Deliver the long table; it is the one that is right.

7. **Check against the ungrouped total.** `SELECT COUNT(*), SUM(principal) FROM loans WHERE disbursed_at >= '2026-01-01'` → 3 051 loans, 162 333 060 000. The 50 rows must add up to that. They do.

---

## 3. Practice (60 min)

Questions whose answer is a query have a box under them — write, **▶ Run**, then **✔ Check** compares your result with the answer without showing it; your query is saved in this browser. Questions that ask for a number or a reason have an answer box of their own. The questions follow section 1 in order; the label in brackets names the subsection each one trains. Yesterday's joins plus today's aggregates; no `CASE` yet. The **Database** panel (button at the bottom right) lists every table and column.

**P1.** *(COUNT)* For `customers`, in one query: the number of rows, the number of customers with an income on file, and the number of different regions. How many customers have **no** income on file?

**P2.** *(SUM)* Total principal of SME loans (`product_id = 5`) and of all loans. What share of the money lent is SME? (Divide by hand.)

**P3.** *(AVG)* Average principal of active loans, once with `AVG` and once as `SUM(principal) / COUNT(*)`. Why do the two numbers differ?

**P4.** *(MIN and MAX)* The smallest and the largest Micro loan (`product_id = 1`), and the first and last application time in `applications`.

**P5.** *(GROUP BY one column)* Loans and total principal by `status`, largest total first.

**P6.** *(GROUP BY one column)* Loans disbursed per year, with the total and the average ticket, rounded to whole UZS (`ROUND(x)` rounds to a whole number; Wednesday covers it properly).

**P7.** *(GROUP BY one column)* Payments received in 2026, count and sum per month. Anything odd at the end of the list?

How many payments are dated **after** the as-of date 2026-10-01? (One more query: `WHERE paid_at > '2026-10-01'`.)

**P8.** *(GROUP BY one column)* Payments by `method`: count and total amount, most frequent first. Look at the result carefully.

How many groups does your query return (on SQLite)? Then, in the answer's explanation, see why that is not five.

> ⚠️ **Watch out.** `GROUP BY` groups *exact* values. `'Card'`, `'card'` and `'card '` are three groups — look at the labels of every grouped result before you trust its counts.

**P9.** *(GROUP BY two columns)* Loans by branch (name and region), with the sum of principal, most money first. Which branch lends the most?

**P10.** *(GROUP BY two columns)* Applications by `channel` and product name. How many rows come back, and why not 3 × 5 = 15?

How many rows does your P10 query return?

**P11.** *(WHERE vs HAVING)* Branches with more than 900 loans, most first.

**P12.** *(WHERE vs HAVING)* Products whose average ticket exceeds 50 000 000.

**P13.** *(WHERE vs HAVING)* Customers with more than one loan: one row per such customer with their number of loans, most loans first.

So how many customers have more than one loan? (Read it off the row count of your result.)

**P14.** *(WHERE vs HAVING)* Collections actions by type, and the number of those actions that ended in a promise to pay, by type — two grouped queries.

Divide by hand: what is the highest share of actions ending in a promise to pay, in % to one decimal?

**P15.** *(Aggregating over a join)* The multiplication trap, measured. For active loans: `COUNT(*)` and `COUNT(DISTINCT l.loan_id)` over `loans JOIN payments`, and `SUM(principal)` over `loans` alone.

**P16.** *(ORDER BY an aggregate)* The three busiest collectors: name and number of collections actions, most first. Group by `staff_id` **and** `full_name` — then try `full_name` alone and compare the top row.

**P17.** *(The order a query runs in)* In `SELECT … FROM loans WHERE … GROUP BY … HAVING … ORDER BY … LIMIT 5`, what does `LIMIT 5` cut?

> 🚀 **Stretch (optional, +5 XP).** Set operators in practice — not needed to finish the day.

**P18.** *(Set operators)* Using `UNION ALL`, build one result with two labelled rows: `'2025'` with its loan count and `'2026'` with its loan count. Then run the same with `UNION`.

Why do `UNION` and `UNION ALL` give the same two rows here — and when would `UNION` lose one?

### SQL lab — summary tables

An aggregate result can be saved as a table of its own — that is how a board pack is built: one summary table per slide. This lab runs on **your practice copy** of the database (the **Database** panel shows your new tables; **Database → Reset** brings the original back).

Step 2's average is a whole number because `disbursed / loans` divides two integers — the fraction is cut off, not rounded (2 705 586.36 became 2 705 586). Wednesday shows why, and the one-character fix.

---

## 4. Homework

No new homework. **HW 2.1** (Bekzod's loan book) is due tomorrow — with today's tools you can now finish **Q6** (loans per officer is a `GROUP BY`) and **Q10** (a `COUNT(*)` and a `SUM` over the duplicate customers' loans).

---

## 5. Self-check

---

## 6. Company corner <span class="badge company">Disbursements, ticket, approval rate</span>

Three portfolio numbers that are pure `GROUP BY`, and one that needs a division.

**Disbursements** (*выдачи*) — count and amount of loans paid out in a period, by product. September 2026:

```sql
SELECT p.name, COUNT(*) AS loans, SUM(l.principal) AS disbursed
FROM loans l JOIN products p ON p.product_id = l.product_id
WHERE l.disbursed_at >= '2026-09-01' AND l.disbursed_at < '2026-10-01'
GROUP BY p.name ORDER BY disbursed DESC;
```

| product | loans | disbursed |
|---|---|---|
| Small business loan | 30 | 8 601 880 000 |
| Auto loan | 21 | 4 398 600 000 |
| Consumer loan | 121 | 3 409 790 000 |
| Micro loan | 123 | 328 630 000 |
| Buy now pay later | 66 | 276 590 000 |

361 loans, 17.02 bn UZS. Thirty SME loans are half the money; 123 Micro loans are 2 % of it. That mix is why Bekzod's "the portfolio grew" and Marketing's "we issued more loans" can both be true and both miss the point. Year to date 2026 the SME row is 305 loans / 95.24 bn of 162.33 bn total.

**Average ticket** (*средний чек*) — `AVG(principal)` per product: SME 312.2 m, Auto 219.5 m, Consumer 27.2 m, BNPL 4.1 m, Micro 2.7 m in 2026. Ticket moves when the product's *mix of customers* moves; a falling SME ticket with rising count usually means a new segment, not smaller businesses.

**Approval rate by channel** (*уровень одобрения по каналам*). Week 1 you did it with two counts for the whole company. Per channel, the two-query way is three groups each:

```sql
SELECT channel, COUNT(*) AS applications FROM applications GROUP BY channel;
-- app 5006 · branch 6223 · partner 2771
SELECT channel, COUNT(*) AS approved FROM applications WHERE status LIKE 'approved%' GROUP BY channel;
-- app 2915 · branch 3965 · partner 1715
```

app 58.2 % · branch 63.7 % · partner 61.9 % (all-applications denominator). One query instead of two: average a 0/1 expression. In SQLite a comparison *is* 0 or 1, so `AVG(status LIKE 'approved%')` works; SQL Server needs `IIF` to turn the test into a number:

```sql
-- SQLite
SELECT channel, COUNT(*) AS applications, ROUND(100.0 * AVG(status LIKE 'approved%'), 1) AS approval_pct
FROM applications GROUP BY channel;
-- SQL Server
SELECT channel, COUNT(*) AS applications, ROUND(100.0 * AVG(IIF(status LIKE 'approved%', 1.0, 0)), 1) AS approval_pct
FROM applications GROUP BY channel;
```

Same three numbers. Thursday's `SUM(CASE WHEN … THEN 1 ELSE 0 END)` is the portable spelling of the same idea — read it there, use whichever your engine likes. With the *decided* denominator (cancelled out) the channels read 68.2 / 72.4 / 70.5 %; the app is 4–5 points below the branch under either convention, because the app has no officer to argue a borderline case.

**One lesson from P8.** Payments by method showed `Card` and `card` as two rows. Madina's board pack has a "share of card payments" tile; computed on raw `method`, card is understated by 57 payments and 327 m UZS, and the five stray spellings add five phantom categories. Real data always has this. Tomorrow's first job is to make `GROUP BY LOWER(TRIM(method))` return five rows.

> 🎯 **Interview version.** *"How would you build a disbursements-by-month-by-product report, and what would you check?"* — `GROUP BY month, product` over `loans` (one row per loan, so sums are safe); period filter with `>=` and `<`; check that the rows add up to the ungrouped total; never join a one-to-many table before summing loan amounts.

**Say it like in an interview.** *"How would you build a disbursements-by-month-by-product report, and what would you check before sending it?"* Answer as you would out loud, with Nur Finance numbers.

Tomorrow: Sevara's lateness question and Timur's moving tile — the functions that clean and compute values on the way out.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 2 · Day 3 — Strings, numbers and dates: cleaning as you query (weeks/week-02/day-3.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-02/day-3
=====

# Week 2 · Day 3 — Strings, numbers and dates: cleaning as you query

<span class="badge">Learn 60 min</span> <span class="badge">Detective 30 min</span> <span class="badge">Practice 50 min</span> <span class="badge">Homework</span> <span class="badge company">Company corner</span>

> STORY **Wednesday, 9:05.** Sevara, head of collections, has two things. *"One: my team logs every payment, and I want to know for each one how many days late it was, and the average lateness by product — Micro feels worse than Auto, but I want the number. Two: Timur's 'share of card payments' tile moved 0.3 points overnight and nobody changed anything."* Madina adds a third: *"While you're in the dates — Risk thinks some loans were paid out before the customer applied. Find them."*

## Today in 3 lines

- **Strings:** `UPPER`/`LOWER`/`TRIM`, `LEN`|`LENGTH`, `LEFT`|`SUBSTR`, `REPLACE`, concatenation — enough to make `Card` and `card` one group.
- **Numbers:** `ROUND`, `CAST`, and the integer-division trap that turns 56.55 % into 0.
- **Dates:** extract year/month, difference in days, add months, first day of month, and filter a period **correctly**; you have computed **DPD for every loan** and the bucket table.

---

## 1. Learn — functions change a value on the way out

### What a function does — a value in, a changed value out

**What it is.** A **function** takes a value from a row and returns a changed value. Nothing in the table changes; only the result does. Functions work in `SELECT`, `WHERE`, `GROUP BY`, `HAVING` and `ORDER BY`. The two dialects differ most on this day: every example is written for SQLite, with the SQL Server spelling in a trailing comment.

**How to write it.** `function(value, other arguments)`, wherever a column could stand:

```sql
-- two functions, one inside the other
SELECT DISTINCT method, LOWER(TRIM(method)) AS cleaned
FROM payments
ORDER BY cleaned;
-- 10 rows: 10 raw spellings, 6 cleaned values
```

Ten raw spellings come back next to their cleaned value: `Card` and `card` both become `card`, `CASH ` and `cash` both become `cash`. The inner function runs first: `TRIM`, then `LOWER`.

**When you use it.** Cleaning labels before you group, computing a number from other numbers (a rate, an age in days), cutting a part out of a text or a date.

> 💡 **Key idea.** A function changes a value on its way out of the query — `LOWER(method)` shows `card` for `Card`, but the table still holds `Card`. Whatever you group or filter on, group or filter on the *same* expression.

**Your turn.** After `SELECT LOWER(method) FROM payments`, what does the table hold for the 57 rows spelt `Card`?

### Concatenation — joining texts with ||

**What it is.** **Concatenation** (*конкатенация*) glues texts into one text. SQLite writes `||`; SQL Server writes `+` or `CONCAT(…)`.

**How to write it.**

```sql
-- SQL Server: first_name + ' ' + last_name, or CONCAT(first_name, ' ',
-- last_name)
SELECT first_name || ' ' || last_name AS full_name,
       -- a number is turned into text: 'Loan 42'
       'Loan ' || 42                  AS label
FROM customers
WHERE customer_id = 1;
-- Eldor Olimov · Loan 42
```

Customer 1 is *Eldor Olimov*. The `' '` in the middle is a text of one space; without it you get `EldorOlimov`.

**When you use it.** One readable column out of several: a full name, a label such as `'2026-Q3'`, a match key for finding duplicates.

> ⚠️ **Watch out.** Anything `||` NULL is NULL: `'Eldor' || ' ' || NULL` returns NULL, and the whole name disappears. (SQL Server's `CONCAT` treats NULL as empty text; its `+` returns NULL too.) And in SQLite `+` only adds numbers: `'a' + 'b'` is 0.

**Your turn.** Write the expression that shows customer 1 as `Olimov, Eldor`.

> 🎬 **Didn't get CONCAT (joining texts)?** [Baraa explains it · 3 min](https://youtu.be/SSKVgrwhzus?t=17578&end=17764)

**Try it.**

```sql
SELECT 'Eldor' || ' ' || NULL AS full_name,
       'a' + 'b' AS plus_on_text,
       'Loan ' || 42 AS label;
-- NULL · 0 · 'Loan 42'
```

One missing last name empties the whole `full_name`. Day 4's `COALESCE(last_name, '')` keeps the first name.

### UPPER and LOWER — one case for every value

**What it is.** **UPPER** turns every letter into a capital; **LOWER** into a small letter. Other characters stay as they are. Same spelling on both engines.

**How to write it.**

```sql
SELECT customer_id, first_name, last_name, UPPER(last_name) AS upper_last
FROM customers
WHERE last_name = LOWER(last_name);
-- 40 rows: surnames typed all in small letters
```

40 customers have a surname typed entirely in small letters, such as `jalilova`. All 40 have an id of 6001 or above — last week's duplicates.

**When you use it.** Before comparing or grouping text typed by people: `LOWER(a) = LOWER(b)`, `GROUP BY LOWER(method)`. And to find badly typed rows: `WHERE x = LOWER(x)` or `WHERE x = UPPER(x)`.

> ⚠️ **Watch out.** SQLite's `UPPER`, `LOWER` and its case-blind `LIKE` know only the Latin letters: `LOWER('АЗИЗ')` stays `'АЗИЗ'`, and `'азиз' LIKE 'Азиз'` is false. Our names are typed in Latin, but at work Uzbek and Russian names often arrive in Cyrillic — there SQL Server's collation does the job, SQLite needs an extension.

**Your turn.** How many customers have a first name written entirely in capitals (`MALIKA`)?

### TRIM — remove spaces at the ends

**What it is.** **TRIM** removes spaces at the start and at the end of a text. `LTRIM` removes only the left ones, `RTRIM` only the right ones. Spaces inside the text stay.

**How to write it.**

```sql
SELECT TRIM('CASH '),          -- 'CASH'
       TRIM('  bank transfer ')  -- 'bank transfer': the inner space stays
;
SELECT COUNT(*) FROM customers WHERE first_name <> TRIM(first_name);   -- 18
```

18 first names carry a space at an end, like `'Yulduz '`. To the database `'Yulduz '` and `'Yulduz'` are different values.

**When you use it.** On every text column typed by a person or copied from a file, before you compare, group or join on it.

**Your turn.** How many payment rows have a `method` with a space at one of its ends?

> 🎬 **Didn't get TRIM?** [Baraa explains it · 6 min](https://youtu.be/SSKVgrwhzus?t=17910&end=18244)

### LENGTH — how many characters

**What it is.** **LENGTH** returns the number of characters in a text. SQL Server calls it `LEN`.

**How to write it.**

```sql
-- SQL Server: LEN(phone)
SELECT LENGTH(phone) AS characters, COUNT(*) AS customers
FROM customers
GROUP BY LENGTH(phone);
-- one row: 13 · 6 040
```

One row: all 6 040 phone numbers have 13 characters (`+998` and nine digits). A length check is the quickest format test for codes, phones and ids.

**When you use it.** To check a format (every phone 13 characters), to find hidden spaces (`LENGTH(x) <> LENGTH(TRIM(x))`), to find empty texts (`LENGTH(x) = 0`).

> ⚠️ **Watch out.** SQL Server's `LEN` ignores trailing spaces: `LEN('Bobur ')` is 5, SQLite's `LENGTH('Bobur ')` is 6. A length test that finds dirty names on one engine finds nothing on the other — on SQL Server compare `DATALENGTH` instead.

**Your turn.** On SQLite, what does `LENGTH('CASH ')` return?

### SUBSTR — a piece of a text

**What it is.** **SUBSTR**`(text, start, n)` returns `n` characters starting at position `start`; the first character is position 1. Without `n` it returns everything to the end. A negative start counts from the end. SQL Server writes `SUBSTRING(text, start, n)`, `LEFT(text, n)` and `RIGHT(text, n)`.

**How to write it.** A datetime stored as text is a string with fixed positions:

```text
2026-09-27 14:05:00
1234567890123456789

→ SUBSTR(applied_at, 1, 10)
    = '2026-09-27'
→ SUBSTR(applied_at, 12, 2)
    = '14'
```

```sql
-- SQL Server: DATEPART(hour, applied_at)
SELECT SUBSTR(applied_at, 12, 2) AS hour, COUNT(*) AS applications
FROM applications
GROUP BY SUBSTR(applied_at, 12, 2)
ORDER BY applications DESC;
-- 15 → 1 089 first
```

Applications arrive from 08:00 to 21:59; the busiest hour is 15:00 with 1 089 applications. `SUBSTR(phone, -4)` gives the last four digits (`RIGHT(phone, 4)` on SQL Server).

**When you use it.** Fixed-position codes: the hour of a text datetime, the region part of an account number, the last digits of a phone.

**Your turn.** What is the earliest hour of the day at which an application arrives? (Two digits, as `SUBSTR` returns it.)

> 🎬 **Didn't get SUBSTRING (a piece of a text)?** [Baraa explains it · 6 min](https://youtu.be/SSKVgrwhzus?t=18756&end=19108)

### REPLACE — swap one text for another

**What it is.** **REPLACE**`(text, 'old', 'new')` swaps **every** occurrence of `'old'` inside the text for `'new'`. `'new'` may be empty, which deletes `'old'`. Same spelling on both engines.

**How to write it.** The fix for yesterday's ten payment methods:

```sql
SELECT REPLACE(LOWER(TRIM(method)), 'bank transfer', 'transfer') AS method, COUNT(*) AS payments
FROM payments
GROUP BY REPLACE(LOWER(TRIM(method)), 'bank transfer', 'transfer')
ORDER BY payments DESC;
-- card 17621 · payme 8900 · click 8790 · cash 8790 · transfer 8774
```

Five rows, the five real methods. `TRIM` and `LOWER` merge `Card`, `CASH `, `PayMe` and `Click` into their groups; the last stray, `bank transfer`, is a different *word*, so only `REPLACE` can merge it: transfer goes from 8 747 to 8 774.

**When you use it.** A known wrong spelling into the right one; removing a character (`REPLACE(phone, '-', '')`); a local format (`REPLACE(phone, '+998', '8')`).

> ⚠️ **Watch out.** REPLACE changes every occurrence, also inside longer words. `REPLACE(method, 'transfer', 'bank transfer')` turns the 27 rows already spelt `bank transfer` into `bank bank transfer`. Replace the longer, rarer text into the shorter one, as above.

**Your turn.** How many rows of `payments` did the cleaning change? On SQLite: `WHERE method <> REPLACE(LOWER(TRIM(method)), 'bank transfer', 'transfer')`.

> 🎬 **Didn't get REPLACE?** [Baraa explains it · 4 min](https://youtu.be/SSKVgrwhzus?t=18244&end=18455)

### INSTR — where a text starts

**What it is.** **INSTR**`(text, 'piece')` returns the position where `'piece'` first starts inside `text`, or 0 if it is not there. SQL Server writes `CHARINDEX('piece', text)` — the arguments in the opposite order.

**How to write it.**

```sql
-- 5: the space is the 5th character      SQL Server: CHARINDEX(' ', 'bank
-- transfer')
SELECT INSTR('bank transfer', ' '),
       INSTR('card', ' ');  -- 0: no space
```

Its usual partner is `SUBSTR`: find where something starts, then cut there. The major version of the mobile app is the text before the first dot:

```sql
SELECT SUBSTR(app_version, 1, INSTR(app_version, '.') - 1) AS major, COUNT(*) AS events
FROM app_events
GROUP BY major;  -- 3 → 11 325 · 4 → 11 459
```

App events split almost evenly: 11 325 from version 3.x and 11 459 from version 4.x.

**When you use it.** Cutting at a separator whose position changes from row to row: the part before `@` in an email, before `.` in a version, before a space in a full name. And as a test: `INSTR(x, ' ') > 0` means "contains a space".

**Your turn.** What does `INSTR('bank transfer', 'transfer')` return?

### LIKE — patterns with % and _

**What it is.** **LIKE** compares a text with a **pattern**. `%` stands for any number of characters (also none); `_` stands for exactly one character. You met it in Week 1; here are its rules in full.

**How to write it.**

```sql
SELECT COUNT(*) FROM applications WHERE status LIKE 'approved%';
-- 8 595: 'approved' and 'approved_not_disbursed'
SELECT COUNT(*) FROM customers    WHERE last_name LIKE '%ova';
-- 2 447 surnames ending in 'ova'
SELECT COUNT(*) FROM customers    WHERE first_name LIKE '_____';
-- 1 862 first names of exactly 5 characters
```

8 595 applications start with `approved`: 7 917 `approved` and 678 `approved_not_disbursed`.

**When you use it.** "Starts with", "ends with", "contains": `'approved%'`, `'%ova'`, `'%transfer%'`. For an exact value use `=`.

> ⚠️ **Watch out.** In SQLite, `LIKE` ignores upper and lower case for Latin letters, but `=` does not: `'card' LIKE 'Card'` is true, `'card' = 'Card'` is false. So `method LIKE 'card'` finds 17 621 rows and `method = 'card'` finds 17 564. On SQL Server both follow the column's collation (by default case does not matter).

To search for a real `%` or `_`, escape it. `code LIKE 'PAY_01'` also matches `'PAYX01'`, because `_` is any one character; `code LIKE 'PAY\_01' ESCAPE '\'` matches only the underscore itself (SQL Server: `LIKE 'PAY[_]01'`).

**Your turn.** How many customers have a surname ending in `ov`?

### ROUND — round to n decimals

**What it is.** **ROUND**`(x, n)` rounds `x` to `n` digits after the decimal point; `ROUND(x)` rounds to a whole number. A 5 rounds away from zero: `ROUND(2.5)` is 3.

**How to write it.**

```sql
-- divide first, then round once
SELECT p.name, ROUND(AVG(l.principal) / 1000000.0, 1) AS avg_ticket_m
FROM loans l JOIN products p ON p.product_id = l.product_id
GROUP BY p.name
ORDER BY avg_ticket_m DESC;
-- SME 308.7 · Auto 216.9 · Consumer 26.9 · BNPL 4.2 · Micro 2.7
```

The average SME loan is 308.7 m UZS; the average Micro loan is 2.7 m. Divided by a million and rounded to one decimal, the numbers are ready for a slide.

**When you use it.** At the very end, on the number you show. SQL Server also rounds to the left of the point — `ROUND(x, -6)` is "to the nearest million"; SQLite does not, so divide first, as above.

> ⚠️ **Watch out.** Round once, at the end. Rounding the parts and then adding them drifts: five rounded shares rarely add up to 100.0.

> ⚠️ **Watch out.** A decimal number (`REAL`, `FLOAT`) is stored in binary and is often not exact: `SELECT 0.1 + 0.2 = 0.3` returns 0 — false. Never compare decimals with `=`: round both sides (`ROUND(x, 4) = 0.3`) or test the gap (`ABS(x - 0.3) < 0.000001`). That is also why money is kept in whole UZS (`INTEGER`) and rates are rounded once, at the end.

**Your turn.** What does `SELECT ROUND(51709667.858, 2)` return?

> 🎬 **Didn't get ROUND?** [Baraa explains it · 3 min](https://youtu.be/SSKVgrwhzus?t=19118&end=19298)

> ⚠️ **Quirk: ROUND with a minus, and a half that is not a half.**
>
> - **You expect:** `ROUND(1234567, -3)` to give 1 235 000 (to thousands, as in SQL Server and Excel), and `ROUND(2.675, 2)` to give 2.68.
> - **What happens:** SQLite returns 1 234 567 — it treats a negative number of digits as 0, with no error. And `ROUND(2.675, 2)` is 2.67.
> - **Why:** SQLite's `ROUND` rounds only to the right of the point. And 2.675 is stored in binary as 2.67499999…, just under the half, so it goes down — Python does the same (week 5).
> - **Protect yourself:** to round to thousands, divide first: `ROUND(x / 1000.0) * 1000`. Keep money in whole soum and round once, at the end.

```sql
SELECT ROUND(1234567, -3) AS minus_three,
       ROUND(1234567 / 1000.0) * 1000
         AS thousands,
       ROUND(2.5) AS half,
       ROUND(2.675, 2) AS not_a_half;
-- 1234567 (no change) · 1235000 · 3 · 2.67
```

### Integer and decimal division

**What it is.** Both engines divide two whole numbers **as whole numbers**: `7917 / 14000` is **0**. The fraction is cut off, silently. If one side is a decimal number, the result is a decimal.

**How to write it.**

```sql
SELECT 7917 / 14000,                   -- 0
       7917 * 100 / 14000,             -- 56   (whole again: cut, not rounded)
       7917 * 100.0 / 14000,           -- 56.55
       ROUND(7917 * 100.0 / 14000, 2); -- 56.55
-- SQL Server alternative: CAST(7917 AS FLOAT) / 14000
```

7 917 of 14 000 applications were approved: 56.55 %. Only the versions with `100.0` say so.

**When you use it.** Every rate, share, average-by-hand and ratio.

> ⚠️ **Watch out.** Whole number ÷ whole number = whole number, on SQL Server and SQLite alike. No error, no warning — just a wrong rate. Put `100.0 *` at the **front** of every percentage, so the very first operation already makes a decimal.

**Your turn.** Timur's approval tile shows 0 % for every channel. Find the line:

### CAST — change the type of a value

**What it is.** **CAST**`(x AS type)` converts a value to another type: text to number, number to text, decimal to whole number. SQLite's types are `INTEGER`, `REAL`, `TEXT`; SQL Server's include `INT`, `BIGINT`, `FLOAT`, `DECIMAL(18,2)`, `DATE`.

**How to write it.**

```sql
-- 51 709 667: the .86 is cut off, not rounded      SQL Server: CAST(… AS
-- BIGINT)
SELECT CAST(AVG(principal) AS INTEGER),
       ROUND(AVG(principal)),        -- 51 709 668: rounded
       CAST('2026' AS INTEGER) + 1,  -- 2027: text into a number
       -- 0.5655: one side made decimal before dividing
       CAST(7917 AS REAL) / 14000
FROM loans;
```

`CAST … AS INTEGER` and `ROUND` differ by one here: CAST cuts the fraction, ROUND rounds it.

**When you use it.** Whole days from SQLite's fractional `julianday` difference (below); a text code compared with a number; a decimal before a division.

> ⚠️ **Watch out.** A CAST of a finished result is too late: `CAST(7917 / 14000 AS REAL)` is 0.0, because the whole-number division already threw the fraction away. Convert an input, not the output.

> ⚠️ **Watch out.** Text that is not a number does not stop SQLite: `CAST('abc' AS INTEGER)` is 0 and `CAST('12abc' AS INTEGER)` is 12, with no error. SQL Server stops with an error; its `TRY_CAST` returns NULL instead. And a number stored as **text** compares and sorts as text: `'10' < '9'` is true, because the character `1` comes before `9`. When a column of numbers sorts strangely, look at `typeof(column)` and `CAST` it before you compare or sort.

**Your turn.** What does `SELECT CAST(-2.99 AS INTEGER)` return?

> 🎬 **Didn't get CAST?** [Baraa explains it · 5 min](https://youtu.be/SSKVgrwhzus?t=23440&end=23737)

**Try it.** The same two values, compared as text and as numbers:

```sql
SELECT '10' < '9' AS as_text,
       CAST('10' AS INTEGER) < 9
         AS as_numbers,
       '10' = 10 AS text_vs_number;
-- 1 · 0 · 0
```

As text, `'10'` is smaller than `'9'`, because the first characters decide. That is why a column of codes stored as text sorts 10, 100, 2, 9 — and why its `MAX` can be `'9'`. CAST the column before you sort, compare or take a `MAX`.

### ABS — the size of a number without its sign

**What it is.** **ABS**`(x)` returns `x` without its minus sign: `ABS(-45)` is 45, `ABS(45)` is 45. Same on both engines.

**How to write it.** How far is each payment from the amount its instalment asked for, in either direction?

```sql
SELECT COUNT(*) AS different,
       -- SQL Server: SUM(IIF(p.amount > i.total_due, 1, 0))
       SUM(p.amount > i.total_due) AS over_paid,
       SUM(p.amount < i.total_due) AS under_paid
FROM payments p JOIN installments i ON i.installment_id = p.installment_id
WHERE ABS(p.amount - i.total_due) > 0;  -- 427 · 0 · 427
```

427 payments differ from the amount due, and all 427 are smaller: partial payments. Nobody paid more than asked.

**When you use it.** "More than X away, in either direction": a payment far from its due date (early or late), a forecast far from the actual, a balance that does not reconcile.

**Your turn.** How many of those 427 payments differ from the amount due by more than 100 000 UZS?

### Percentages — a part of a whole, times 100

**What it is.** A **percentage** (*доля, процент*) is a part divided by its whole, times 100. In SQL: `100.0 * part / whole`, rounded once at the end. A difference between two percentages is measured in **percentage points**.

**How to write it.** In SQLite a comparison is 1 or 0, so `SUM(condition)` counts the rows where it is true:

```sql
SELECT channel,
       COUNT(*) AS applications,
       -- SQL Server: SUM(IIF(status LIKE 'approved%', 1, 0))
       ROUND(100.0 * SUM(status LIKE 'approved%') / COUNT(*), 1) AS approval_pct
FROM applications
GROUP BY channel;
-- app 58.2 · branch 63.7 · partner 61.9
```

The branch approves 63.7 % of its applications, the app 58.2 %: a gap of 5.5 percentage points (not "5.5 %").

**When you use it.** Approval rate, share late, share of a product in the book, the interest share of a payment. Thursday's `SUM(CASE …)` is the portable spelling of the counted part.

> ⚠️ **Watch out.** Say what the whole is. "Approved ÷ all applications" and "approved ÷ decided applications" are both approval rates and give different numbers. Name the denominator next to the number.

**Your turn.** What share of all payments is made by card, after cleaning the method? (% to one decimal)

### Dates are text in a fixed shape — and "today" is 2026-10-01

**What it is.** SQLite stores our dates as **text** `'YYYY-MM-DD'` and datetimes as `'YYYY-MM-DD HH:MM:SS'`. SQL Server has real date types. Text in this shape sorts and compares correctly, because every part has a fixed number of digits and the biggest unit comes first. The **as-of date** of this course — "today" — is **2026-10-01**: write it as a literal.

**How to write it.**

```sql
SELECT COUNT(*) FROM loans WHERE disbursed_at = '2026-10-01';
-- 21 loans paid out on the as-of date
SELECT date('2026-09-30 14:05:00');
-- '2026-09-30': the date part of a datetime      SQL Server: CAST(… AS DATE)
SELECT '2026-9-5' < '2026-10-01';
-- 0 (false): '9' sorts after '1' — the zeros matter
```

21 loans were paid out on 1 October 2026, the last day of the data.

**When you use it.** Every date filter and every "as of" calculation. Write dates with four-two-two digits and dashes, always.

Text dates compare correctly only in this exact shape. `'2026-9-5'`, `'05.09.2026'` or a `T` between date and time (`'2026-09-30T14:05:00'`) sort and compare wrongly, with no error. Before you trust a date column from a new source, count the rows of the wrong length: `WHERE LENGTH(d) <> 10` for a date, `<> 19` for a datetime. And ask which clock it uses: a system that logs in UTC puts a payment made at 01:00 in Tashkent (UTC+5) on the day before.

> ⚠️ **Watch out.** Never use `date('now')` (SQL Server `GETDATE()`) in this course. It returns the real calendar date, so a query about "today" would give a different answer each day, and none of them would match the data, which stops on 2026-10-01. And a datetime never equals a date: `applied_at = '2026-09-30'` finds 0 rows, although 23 applications were made that day.

**Your turn.** How many applications were made on the as-of date, 1 October 2026? (`applied_at` carries a time — compare `date(applied_at)`.)

> 🎬 **Didn't get what a date is and where today's date comes from?** [Baraa explains it · 8 min](https://youtu.be/SSKVgrwhzus?t=19367&end=19838)

### strftime — the parts of a date

**What it is.** **strftime**`('format', date)` returns parts of a date as **text**: `%Y` year, `%m` month, `%d` day, `%H` hour, `%w` weekday (0 = Sunday), and any combination such as `'%Y-%m'`. SQL Server has a function per part: `YEAR(d)`, `MONTH(d)`, `DAY(d)`, `DATEPART(hour, d)`, `DATEPART(weekday, d)`, `FORMAT(d, 'yyyy-MM')`.

**How to write it.**

```sql
-- SQL Server: DATEPART(weekday, disbursed_at)
SELECT strftime('%w', disbursed_at) AS weekday, COUNT(*) AS loans
FROM loans
GROUP BY strftime('%w', disbursed_at)
ORDER BY weekday;
-- 0 (Sun) 1 125 · 1 1 106 · … · 6 (Sat) 1 081
```

Loans are paid out evenly on all seven days, about 1 100 each, Sundays included: this synthetic company never closes. Our `dim_date` table is the no-function alternative: `JOIN dim_date d ON d.date_key = l.disbursed_at` gives `d.year`, `d.month_name`, `d.is_weekend` on both engines (2 206 loans on a Saturday or Sunday).

**When you use it.** Grouping by year, month or weekday; a year-month label for a chart axis; the hour of a datetime.

> ⚠️ **Watch out.** strftime returns text. `strftime('%m', disbursed_at) = 9` finds 0 loans; `= '09'` finds 780. Compare with a two-digit text, or `CAST(strftime('%m', …) AS INTEGER) = 9`.

**Your turn.** What does `strftime('%w', '2026-10-01')` return? (The as-of date was a Thursday.)

> 🎬 **Didn't get year, month and day of a date?** [Baraa explains it · 3 min](https://youtu.be/SSKVgrwhzus?t=19886&end=20072)

> 🎬 **Didn't get DATEPART (other parts of a date)?** [Baraa explains it · 6 min](https://youtu.be/SSKVgrwhzus?t=20077&end=20425)

### Date arithmetic — days between two dates, months added to a date

**What it is.** Two operations cover most needs. **The difference in days**: SQLite `julianday(b) - julianday(a)`, SQL Server `DATEDIFF(day, a, b)`. **A date moved by a period**: SQLite `date(d, '+1 month')`, `date(d, '-30 days')`, `date(d, 'start of month')`; SQL Server `DATEADD(month, 1, d)`, `DATEADD(day, -30, d)`, `DATEFROMPARTS(YEAR(d), MONTH(d), 1)`.

**How to write it.**

```sql
-- how old is loan 1 on the as-of date?
-- SQL Server: DATEDIFF(day, disbursed_at, '2026-10-01')
SELECT CAST(julianday('2026-10-01') - julianday(disbursed_at) AS INTEGER) AS age_days
FROM loans WHERE loan_id = 1;
-- 552

-- '2026-09-01'      DATEADD(day, -30, '2026-10-01')
SELECT date('2026-10-01', '-30 days'),
       date('2026-10-01', 'start of month', '+1 month', '-1 day');
       -- '2026-10-31': the last day of the month   EOMONTH('2026-10-01')
```

Loan 1 was paid out on 2025-03-28, 552 days before the as-of date. `julianday` counts fractional days when a time is present, so wrap the difference in `CAST(… AS INTEGER)` for whole days.

**When you use it.** Days late (paid date − due date), the age of a loan, DPD (as-of − oldest unpaid due date), "30 days before the as-of date" for a scope, the first and last day of a month.

> ⚠️ **Watch out.** SQLite does not stop at the month's end: `date('2026-01-31', '+1 month')` is `'2026-03-03'` (31 February overflows into March). SQL Server's `DATEADD(month, 1, '2026-01-31')` gives 2026-02-28. For month arithmetic, go to `'start of month'` first. And SQL Server's `DATEDIFF` counts the **boundaries crossed**, not the time passed: `DATEDIFF(month, '2026-01-31', '2026-02-01')` is 1 after a single day, `DATEDIFF(year, '2025-12-31', '2026-01-01')` is 1 too. For ages and months on book, count days and divide, or check the day of the month.

**Your turn.** What does `date('2026-10-01', '-30 days')` return?

> 🎬 **Didn't get adding to a date (DATEADD)?** [Baraa explains it · 5 min](https://youtu.be/SSKVgrwhzus?t=23738&end=24029)

> 🎬 **Didn't get days between two dates (DATEDIFF)?** [Baraa explains it · 10 min](https://youtu.be/SSKVgrwhzus?t=24031&end=24625)

### Filtering a period — the half-open range

**What it is.** A **half-open range** keeps the start of a period and stops just before the start of the next one: `col >= start AND col < next_start`. It is right for dates, for datetimes, for months of 28 to 31 days and across year ends.

**How to write it.**

```sql
SELECT COUNT(*) FROM applications
WHERE applied_at >= '2026-09-01' AND applied_at < '2026-10-01';
-- 621: all of September, every time of day
```

621 applications in September 2026. `BETWEEN '2026-09-01' AND '2026-09-30'` returns 598: it stops at 30 September **00:00:00**, so the 23 applications made later that day are lost.

**When you use it.** Every period report: a month, a quarter, a year, "the last 30 days". Do not filter with `strftime('%Y-%m', applied_at) = '2026-09'` either: it returns the same 621 rows, but computes a function on every row and stops the database from using an index (Week 3).

> ⚠️ **Watch out.** `BETWEEN '2026-09-01' AND '2026-09-30'` reads as "all of September" but stops at 30 September 00:00:00 — every row stamped later that day is gone (23 here).

> 💡 **Key idea.** One shape for every period: `col >= start AND col < start of the next period`. Start inclusive, next period exclusive.

**Your turn.** Fill the gaps of Sevara's September filter:

### Putting it together

One request, functions of all three kinds. *"For September 2026: payments by cleaned method, with the share paid late and the average days late."*

```sql
-- strings: TRIM, LOWER, REPLACE
SELECT REPLACE(LOWER(TRIM(p.method)), 'bank transfer', 'transfer') AS method,
       COUNT(*) AS payments,
       -- numbers: 100.0 first, ROUND last
       ROUND(100.0 * SUM(p.paid_at > i.due_date) / COUNT(*), 1)  AS late_pct,
       -- dates: julianday difference
       ROUND(AVG(julianday(p.paid_at) - julianday(i.due_date)), 2) AS avg_days_late
FROM payments p
-- the due date lives on the instalment
JOIN installments i ON i.installment_id = p.installment_id
-- half-open period
WHERE p.paid_at >= '2026-09-01' AND p.paid_at < '2026-10-01'
-- the same expression as in SELECT
GROUP BY REPLACE(LOWER(TRIM(p.method)), 'bank transfer', 'transfer')
ORDER BY payments DESC;
```

| method | payments | late_pct | avg_days_late |
|---|---|---|---|
| card | 1 051 | 12.3 | 0.02 |
| payme | 548 | 14.8 | 0.45 |
| click | 526 | 12.7 | 0.15 |
| transfer | 524 | 11.8 | 0.10 |
| cash | 510 | 12.4 | 0.22 |

3 159 September payments in five clean groups. 11.8 to 14.8 % of each method's payments came late, and the average payment is less than half a day late: the method does not drive lateness.

**Your turn.** You will translate between the two dialects all week. Sort the spellings:

### Depth (optional)

- ▶ Baraa, *String functions* [4:52:58](https://youtu.be/SSKVgrwhzus?t=17578&end=19124), *Numeric* [5:18:44](https://youtu.be/SSKVgrwhzus?t=19124&end=19368), *Date & time* [5:22:48](https://youtu.be/SSKVgrwhzus?t=19368&end=25146) — 1 h 20 total; SQL Server syntax throughout, use the table above to translate.
- RU deck (TBC Data Analytics 2.0, if you have it) `2.2 SQL-1-38.pdf` — functions pages. *Russian terms:* строковые функции = string functions, преобразование типов = CAST, целочисленное деление = integer division, разница дат = date difference.

---

## 2. Worked example — loans paid out before they were requested (detective, 30 min)

Madina's tip: *some loans were disbursed before the customer applied.* That is a date comparison across two tables. Steps 1 and 2 use the date subsections of section 1; step 3 is Timur's question and goes back to the string and percentage subsections.

**Step 1 — the distribution (dates as text, date arithmetic, CAST).** `date(a.applied_at)` takes the date part of the application's datetime; `julianday(…) - julianday(…)` gives the days in between; `CAST(… AS INTEGER)` makes them whole. Then count the loans per number of days:

```sql
-- SQL Server: DATEDIFF(day, CAST(a.applied_at AS DATE), l.disbursed_at)
SELECT CAST(julianday(l.disbursed_at) - julianday(date(a.applied_at)) AS INTEGER) AS days_to_disburse, COUNT(*)
FROM loans l JOIN applications a ON a.application_id = l.application_id
GROUP BY days_to_disburse ORDER BY days_to_disburse;
```

<details><summary>What you see</summary>

Values 0 to 7 carry 7 816 loans (0 days: 925 — the app channel pays out the same day; 3 days is the mode with 1 670). Then ten rows at the top of the list with **negative** days: −29, −26, −24 (two), −23 (two), −20, −18, −17, −15, −12, −6 — one or two loans each. A negative difference means disbursed *before* applied.

</details>

**Step 2 — list them (a date comparison across two joined tables).** A negative difference means `l.disbursed_at < date(a.applied_at)`; that is the filter.

```sql
SELECT l.loan_id, l.application_id, date(a.applied_at) AS applied, a.decided_at, l.disbursed_at,
       CAST(julianday(l.disbursed_at) - julianday(date(a.applied_at)) AS INTEGER) AS days, l.status
FROM loans l JOIN applications a ON a.application_id = l.application_id
WHERE l.disbursed_at < date(a.applied_at)
ORDER BY days;
```

How many loans were paid out before their application was submitted?

<details><summary>Result</summary>

**12 loans.** The first row: loan 2244 (application 3969), applied 2026-09-27, disbursed 2026-08-29 — 29 days before the request. Eight are closed, four active; they were disbursed between 2024-12 and 2026-08, all Micro, Consumer or BNPL loans. Now look at their schedules: loan 1039's first instalment is due 2025-02-07 — one month after **2025-01-07**, not after the stored 2024-12-20. The schedule was built from the real disbursement date; only `disbursed_at` was overwritten later (a re-import, a manual correction gone wrong). Memo line for Timur: *12 loans (0.15 %) have `disbursed_at` 6–29 days earlier than `applications.applied_at`; the first due date minus one month gives the true date, 0–3 days after `decided_at`, consistent with every other loan; recommend restoring `disbursed_at` from the schedule.* Check also `l.disbursed_at < a.decided_at` — the same 12; nothing else was paid out before its decision.

</details>

**Step 3 — Timur's tile (TRIM, LOWER, REPLACE, then a percentage).** Rebuild "share of payments by method" with the cleaned expression and compare with the raw one. The share needs the total number of payments as its denominator; `(SELECT COUNT(*) FROM payments)` is a one-value subquery — week 3's tool; copy it as it stands today.

<details><summary>Result</summary>

```sql
SELECT REPLACE(LOWER(TRIM(method)), 'bank transfer', 'transfer') AS method,
       COUNT(*) AS payments, ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM payments), 1) AS share_pct
FROM payments GROUP BY 1 ORDER BY payments DESC;
-- card 17621 (33.3 %) · payme 8900 (16.8) · click 8790 (16.6) · cash 8790
-- (16.6) · transfer 8774 (16.6)
```
Raw `card` was 17 564 = 33.2 % on SQLite (SQL Server's default collation already puts `Card` with `card`); the tile moved by the 57 `Card` rows. Nothing changed overnight except which rows the cashier's software capitalised.

</details>

---

## 3. Practice (50 min)

Questions whose answer is a query have a box under them — write, **▶ Run**, then **✔ Check** compares your result with the answer without showing it; your query is saved in this browser. Questions that ask for a number or a reason have an answer box of their own. The questions follow section 1 in order; the label in brackets names the subsection each one trains. P1–P15 are one-liners of a few minutes each; the work is in P16–P21. Show both dialects where they differ, or say which one you used; the **Database** panel lists every table and column.

**P1.** *(Concatenation)* One `full_name` column for customers 6001–6003, cleaned: trimmed, first letter logic ignored, surname lower-cased for comparison.

**P2.** *(UPPER and LOWER)* Compare `COUNT(DISTINCT last_name)` with `COUNT(DISTINCT LOWER(last_name))` on `customers`. How many surname spellings exist only because of upper and lower case?

**P3.** *(TRIM)* List the distinct payment methods that change under `TRIM`, with brackets around them so that the space is visible: `'[' || method || ']'`.

**P4.** *(LENGTH)* The 18 customers whose first name has a trailing space, found with a length comparison (not `LIKE`).

**P5.** *(SUBSTR)* Loans per year of disbursement, with `SUBSTR(disbursed_at, 1, 4)` as the year.

**P6.** *(REPLACE)* Show customer 44's phone in the local format: `+998` replaced by `8`.

**P7.** *(INSTR)* How many payment rows have a `method` that contains a space anywhere?

**P8.** *(LIKE)* How many customers have a phone number ending in `00`?

**P9.** *(ROUND)* Total principal per product in billions of UZS, one decimal, largest first.

**P10.** *(Integer and decimal division)* Approval rate per channel, twice: once as `100 * SUM(status LIKE 'approved%') / COUNT(*)`, once with `100.0`.

**P11.** *(CAST)* Per product: `CAST(AVG(principal) AS INTEGER)` next to `ROUND(AVG(principal))`. In how many products do the two differ?

**P12.** *(ABS)* The largest gap, in either direction, between a payment's amount and its instalment's `total_due`.

**P13.** *(Percentages)* Share of total due that is interest, per product, one decimal. Which product is 0 %, and why?

Why is one product at 0.0 %?

**P14.** *(Dates as text — and "today")* How many payments are dated on or after the as-of date `'2026-10-01'`? Why would `WHERE paid_at >= date('now')` give a different number next week?

**P15.** *(strftime — and the calendar table)* Disbursed loans and amount by month of 2026 using `dim_date` instead of a date function — month number, month name, loans, amount.

**P16.** *(Date arithmetic)* Average age in days of active loans on the as-of date, as a whole number.

**P17.** *(Date arithmetic)* Sevara's first ask: for every payment, days late = paid date − due date (`installments` via `installment_id`). Show the five latest payments and the overall count of late ones.

**P18.** *(Date arithmetic)* Sevara's second ask: average lateness by product — over *all* payments, and over *late* payments only.

Which answer gives Sevara what she actually asked ("Micro feels worse than Auto")?

**P19.** *(Date arithmetic)* By risk grade: share of late payments and average days over all payments. Does the scorecard order the grades?

**P20.** *(Filtering a period)* Loans disbursed in September 2026 — with the half-open filter — and the same for applications *submitted* in September, showing the BETWEEN mistake next to it.

How many September applications does the `BETWEEN` version lose?

**P21.** *(Putting it together)* Rewrite Tuesday's payments-by-method with the cleaned method *and* average lateness per method. Anything about the 27 `bank transfer` rows?

What do the 27 raw `bank transfer` rows average, in days late? (Two decimals.)

> 🚀 **Stretch (optional, +5 XP).** One more date rule for the curious — not needed to finish the day.

**P22.** *(Date arithmetic)* Reconstruct the true disbursement date of the twelve detective loans from their schedule: first `due_date` minus one month. How many days after `decided_at` is it for each? Then test the same rule on *all* loans — how many disagree with `disbursed_at`?

How many loans does the rule flag on the whole book — and how many of them are real errors? Enter the first number.

### SQL lab — promises with dates

Dates become numbers only through functions. This lab runs on **your practice copy** of the database (the **Database** panel shows your new table; **Database → Reset** brings the original back).

The 33 days customer 1039 asked for is the kind of number a function gives you in one line and a calendar in five minutes; the half-open delete is the same filter you will write in every period report.

---

## 4. Homework <span class="badge hw">HW 2.2 — Due Day 5</span>

**Sevara's 2026 lateness report, the clean method table, and a new detective case.** Use the payments received from 1 January to 30 September 2026 throughout — a half-open filter on `paid_at` (`>= '2026-01-01' AND < '2026-10-01'`). Write each query in the workspace below; **✔ Check** compares the key numbers with ours without showing them; 📤 Submit sends `lateness.sql` and your notes to your mentor. Write in either dialect and put `-- SQLite` or `-- SQL Server` on the first line.

### 📎 Hand in here

---

## 5. Self-check

---

## 6. Company corner <span class="badge company">DPD computed</span>

Week 1 Day 3 gave you the definition and the numbers 413 and 14 / 124 / 25 / 16 / 234 to *read*. Today you produce them.

**DPD (days past due) of a loan on a date** = days since the due date of its **oldest instalment that is not fully paid**. Three steps, each a tool from this week:

1. **Per instalment, how much was paid?** `installments LEFT JOIN payments`, grouped per instalment, summing the payments (LEFT so that unpaid instalments stay, with 0). Keep only matured instalments (`due_date <= as-of`) — and keep only those where *paid < due*. That is a condition on an aggregate → `HAVING`.
2. **Per loan, the oldest such instalment:** `MIN(due_date)` grouped by loan.
3. **Days:** as-of minus that date.

Steps 1 and 2 are two groupings in a row, which needs week 3's CTE (`WITH … AS (…)`) to chain. **This is a read-and-run preview:** run it, read it as two named results; next week you write this shape yourself.

```sql
-- step 1: matured instalments not fully paid
WITH unpaid AS (
  SELECT i.installment_id, i.loan_id, i.due_date, i.total_due,
         -- COALESCE: NULL (no payment) → 0; Day 4
         COALESCE(SUM(p.amount), 0) AS paid
  FROM installments i
  LEFT JOIN payments p ON p.installment_id = i.installment_id
  WHERE i.due_date <= '2026-10-01'
  GROUP BY i.installment_id, i.loan_id, i.due_date, i.total_due
  HAVING COALESCE(SUM(p.amount), 0) < i.total_due
),
-- step 2 + 3: oldest unpaid per loan, in days
dpd AS (
  SELECT loan_id,
         MIN(due_date) AS oldest_unpaid_due,
         -- DATEDIFF(day, MIN(due_date), '2026-10-01')
         CAST(julianday('2026-10-01') - julianday(MIN(due_date)) AS INTEGER) AS dpd,
         COUNT(*) AS unpaid_instalments,
         SUM(total_due - paid) AS overdue_amount
  FROM unpaid GROUP BY loan_id
)
SELECT * FROM dpd ORDER BY dpd DESC;
```

**413 rows** — loans with at least one matured instalment not fully paid. Top: loan 2167, oldest unpaid due 2024-03-26, **919 DPD**, 6 unpaid instalments, written off. Loans absent from the result have DPD 0 (nothing overdue) — loan 1 is one of them: its 45-day-late March instalment is paid, so today it owes nothing overdue.

**Buckets** need `CASE` — *tomorrow's tool: read it today, write it tomorrow.* Replace the last line with:

```sql
SELECT CASE WHEN dpd = 0  THEN '0'
            WHEN dpd <= 30 THEN '1-30'
            WHEN dpd <= 60 THEN '31-60'
            WHEN dpd <= 90 THEN '61-90'
            ELSE '90+' END AS bucket,
       COUNT(*) AS loans, SUM(overdue_amount) AS overdue
FROM dpd GROUP BY bucket ORDER BY MIN(dpd);
```

| bucket | loans | overdue (UZS) | who is in it |
|---|---|---|---|
| 0 | 14 | 53 018 776 | instalments due *today* (2026-10-01), unpaid as of this morning — not late yet. Bucket 0 = DPD 0: the other 7 415 DPD-0 loans have nothing matured and unpaid, so they never enter this list (the whole book's bucket 0 is 7 429 — Week 8) |
| 1–30 | 124 | 499 314 822 | 111 active loans, 13 "closed" (see below) |
| 31–60 | 25 | 74 348 104 | 24 active, 1 closed |
| 61–90 | 16 | 109 375 982 | all active — Sevara's visit list |
| 90+ | 234 | 6 863 031 110 | exactly the 44 `default` + 190 `written_off` loans |

Same numbers the week-1 page printed: **14 / 124 / 25 / 16 / 234**; 399 loans with DPD > 0. The 90+ bucket equals the status column to the loan — the first check on any portfolio report, and it passes. Two things the computation shows that the status column does not:

- **Partial payments matter.** 427 of the 1 784 unpaid instalments have *some* payment. Count only instalments with *no* payment (Monday's simpler anti-join) and the buckets become 13 / 127 / 24 / 18 / **217**: seventeen defaulted or written-off loans whose unpaid instalments all got a token payment would vanish from 90+. "Not fully paid" is the definition; keep the `HAVING paid < due`.
- **Fifteen "closed" loans have an unpaid matured instalment** (13 in 1–30, 1 in 31–60, 1 at DPD 0) — and they are exactly the 15 closed loans whose `closed_at` is NULL. The system closed them because the schedule ended, not because the money arrived. A finding for Timur; Friday's checkpoint asks about it.

Two more numbers fall out of the same `dpd` result. **PAR30** (portfolio at risk) = outstanding principal of loans with DPD > 30 ÷ total outstanding: 6.51 bn / 208.72 bn = **3.1 %**. And the average DPD of the 151 *active* delinquent loans is 22.7 days (max 89) — the collections team's live caseload is young; the old debt is already written off.

Put the computation in order:

> 🎯 **Interview version.** *"How would you compute DPD in SQL?"* — Per instalment, paid vs due via LEFT JOIN payments with HAVING paid < due; per loan, MIN(due_date) of those; DPD = as-of − that date; bucket with CASE; check that 90+ matches default/written-off statuses; say how partial payments are treated.

**Say it like in an interview.** *"How would you compute DPD for every loan in SQL, and how would you check the result?"* Answer as you would out loud, with Nur Finance numbers.

Tomorrow: NULLs (the `COALESCE` above), CASE for real, and the joins that find what is *missing*.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 2 · Day 4 — NULLs, CASE and the tricky joins (weeks/week-02/day-4.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-02/day-4
=====

# Week 2 · Day 4 — NULLs, CASE and the tricky joins

<span class="badge">Learn 60 min</span> <span class="badge">Practice 60 min</span> <span class="badge company">Company corner</span>

> STORY **Thursday, 9:20.** Nilufar, risk analyst (*риск-аналитик*), with a laptop open on a chart. *"I'm presenting FPD30 to the credit committee on Monday — by disbursement month and by channel. Timur's dashboard says the app channel is fine. My spreadsheet says it isn't. One of us is dividing by the wrong thing."* Madina: *"And while you're in there — Risk's average income by segment looks too high to me. Six percent of our customers have no income on file. Where did they go?"*

## Today in 3 lines

- You know the **NULL rules**: `= NULL` is never true, `IS NULL` is the test, `COUNT(col)` skips NULLs, `AVG` silently drops them; `COALESCE`, `ISNULL`|`IFNULL`, `NULLIF` for safe division.
- You can write **CASE** (searched and simple) for buckets and for **pivot-style `SUM(CASE …)`**, the **anti-join** (`LEFT JOIN … IS NULL`), a **self-join**, a join on **two columns**, and spot **duplicates** with `COUNT` vs `COUNT(DISTINCT)`.
- You have computed **FPD30 by vintage and channel** and can say which channel is worse, by how much, and under which definition.

---

## 1. Learn — the value that is not there, and the joins it breaks

### NULL — the value that is not there

(Animated explanation)
Ten customers, two unknown incomes
- 10 customers, one dot each. For 2 of them the income cell is empty: **NULL**. NULL means **unknown** — not zero, not an empty text.
- `COUNT(*)` counts rows: 10. `COUNT(monthly_income)` counts only the **known** values: 8. The difference is how many are missing: 2.
- Find them with `WHERE monthly_income = NULL`? It finds **nothing**. “Is this unknown income equal to unknown?” — the answer is *unknown*, and WHERE keeps only rows where the answer is **true**.
- Check the rule.
- `IS NULL` asks the right question — “is it missing?” — and that answer is true or false, never unknown → 2 rows.
- `WHERE monthly_income < 5` (million) keeps the 5 small incomes. The NULL rows drop out silently: nobody knows if they are small.
- And `NOT (monthly_income < 5)`? The 3 big ones — and the NULL rows drop out **again**: NOT of unknown is still unknown. Two opposite filters together miss 2 customers.
- Now averages.
- Arithmetic with NULL gives NULL: `monthly_income * 12` is NULL for those 2. `COALESCE(monthly_income, 0)` puts a value in its place — do it only when 0 really is the truth.

**What it is.** **NULL** (*пустое значение*) means *unknown* or *not recorded*. It is not 0 and not an empty text `''`. A column holds NULL when nobody filled it in: a customer who gave no income, a loan that has not closed yet, the right side of a LEFT JOIN row with no partner.

**How to write it.** You do not write NULL into a filter; you look for it. A quick count of the empty values of a column:

```sql
SELECT COUNT(*)                AS customers,      -- 6 040
       COUNT(monthly_income)   AS with_income,    -- 5 684
       COUNT(*) - COUNT(monthly_income) AS no_income   -- 356
FROM customers;
```

356 of 6 040 customers (5.89 %) have no income on file. `COUNT(column)` skips NULLs, so `COUNT(*) − COUNT(column)` is the standard count of the missing.

**When you use it.** On every column you are about to filter, group or average: how many values are missing, and is a missing value "unknown" (income) or "not yet" (`closed_at` of an active loan)?

> ⚠️ **Watch out.** An empty text `''` is not NULL. `IS NULL` does not find it, `COUNT(column)` counts it, and it sorts and groups as a value of its own. Our database has no `''` cells, but a CSV or Excel import often turns blanks into `''`: check both, `WHERE x IS NULL OR TRIM(x) = ''`.

**Your turn.** How many loans have no `closed_at`? (Most of them are simply not closed yet.)

> 🎬 **Didn't get NULL (what it is)?** [Baraa explains it · 3 min](https://youtu.be/SSKVgrwhzus?t=25146&end=25316)

> 🎬 **Didn't get NULL, an empty string and a space?** [Baraa explains it · 7 min](https://youtu.be/SSKVgrwhzus?t=28286&end=28696)

### Comparing with NULL — IS NULL, never = NULL

**What it is.** NULL is not equal to anything, not even to another NULL. Any comparison with NULL (`=`, `<>`, `<`, `>`) gives *unknown*, and `WHERE` keeps only the rows where the condition is *true*. The only tests that work are **IS NULL** and **IS NOT NULL**.

**How to write it.**

```sql
SELECT COUNT(*) FROM customers WHERE monthly_income = NULL;
-- 0, always: this is never true
SELECT COUNT(*) FROM customers WHERE monthly_income IS NULL;  -- 356
SELECT COUNT(*) FROM customers WHERE monthly_income <> 5000000;
-- 5 684, not 6 039: the 356 NULL rows fail this test too
```

The 356 rows leave *every* comparison: `monthly_income > x` and `monthly_income <= x` together return 5 684 rows, not 6 040.

**When you use it.** Finding the missing (`IS NULL`), excluding them on purpose (`IS NOT NULL`), and checking that groups add up: when a report's groups do not sum to the total, look for a NULL.

> ⚠️ **Watch out.** `= NULL` and `<> NULL` do not fail; they quietly return 0 rows. Every test for "empty" is written `IS NULL`.

When an unknown meets `AND`, `OR` and `NOT`, SQL follows three rules. `WHERE` keeps a row only when the whole condition comes out **true**:

| Condition | Result | The row |
|---|---|---|
| true `AND` unknown | unknown | dropped |
| false `AND` unknown | false | dropped |
| true `OR` unknown | **true** | kept |
| false `OR` unknown | unknown | dropped |
| `NOT` unknown | unknown | dropped |

So `WHERE segment = 'sme' OR monthly_income > 5000000` keeps an SME customer with no income (true OR unknown = true), while `WHERE NOT (monthly_income > 5000000)` drops every customer with no income, just like the condition without `NOT`. The same rule breaks `NOT IN` on a list that holds a NULL — Week 3.

**Your turn.**

> 🎬 **Didn't get IS NULL and IS NOT NULL?** [Baraa explains it · 4 min](https://youtu.be/SSKVgrwhzus?t=27704&end=27930)

> ⚠️ **Quirk: NULL is not equal to NULL — except when you group.**
>
> - **You expect:** if `NULL = NULL` is not true, every NULL is a group of its own.
> - **What happens:** `GROUP BY`, `DISTINCT` and `UNION` put all the NULLs together in **one** row.
> - **Why:** for grouping, SQL asks "can I tell these two apart?" rather than "are they equal?" — and two unknowns cannot be told apart.
> - **Protect yourself:** expect one NULL row in every grouped result of a column with blanks, and keep it: it is a real group. To ask the grouping question in a condition, SQLite has `IS`: `a IS b` is true when both are NULL.

```sql
SELECT NULL = NULL AS equal,
       monthly_income,
       COUNT(*) AS customers
FROM customers
GROUP BY monthly_income
ORDER BY monthly_income
LIMIT 3;
-- row 1: all 356 empty incomes, one group
```

### NULL in arithmetic — anything combined with NULL is NULL

**What it is.** A calculation with a NULL in it returns NULL: `5 + NULL`, `NULL * 0`, `'Eldor' || NULL` are all NULL. The database cannot compute with a value it does not know.

**How to write it.**

```sql
SELECT customer_id, monthly_income, monthly_income * 12 AS yearly_income
FROM customers
WHERE customer_id <= 5;  -- five incomes, five yearly incomes
SELECT COUNT(*) - COUNT(monthly_income * 12) AS no_yearly
FROM customers;
-- 356: every missing income gives a missing yearly income
```

Customer 1 earns 3 894 708 a month, 46 736 496 a year. For the 356 customers with no income, `monthly_income * 12` is NULL as well.

**When you use it.** Whenever a derived column (a ratio, a sum of two columns, a full name) looks empty for some rows: one of its inputs is NULL.

> ⚠️ **Watch out.** `principal - paid` is NULL for a loan with no payment, not `principal`. Turn the NULL into 0 first when 0 is the right meaning — the next-but-one subsection, `COALESCE`.

**Your turn.** What does `SELECT 5 + NULL` return?

> 🎬 **Didn't get NULL in calculations?** [Baraa explains it · 6 min](https://youtu.be/SSKVgrwhzus?t=26219&end=26589)

### NULL in aggregates — COUNT, SUM and AVG skip it

**What it is.** Aggregates work on the known values only. `COUNT(column)` counts non-NULL values, `SUM` adds them, `AVG` divides their sum by **their** count. `COUNT(*)` is the one that counts every row.

**How to write it.**

| Expression | Result | Why |
|---|---|---|
| `COUNT(*)` | 6 040 | counts rows |
| `COUNT(monthly_income)` | 5 684 | counts non-NULL values |
| `COUNT(*) - COUNT(monthly_income)` | 356 | the missing — the standard way to count them |
| `AVG(monthly_income)` | 15 245 933 | **average of the 5 684 known values**; the 356 are dropped, not treated as 0 |
| `AVG(COALESCE(monthly_income, 0))` | 14 347 331 | average over all 6 040, missing counted as 0 — usually wrong, but explicit |
| `SUM(monthly_income)` | sum of the known | NULLs ignored; `SUM` of only NULLs is NULL, not 0 |

The average income is 15.2 m UZS — of the 94 % of customers who have an income on file. Nothing is wrong with `AVG`: it does exactly what it says. A slide reading "average income 15.2 m" without "(of 94 % with income on file)" is incomplete.

**When you use it.** Every average and every rate: report the count next to it, and check whether the missing are random or concentrated. Here, by segment the gap is flat (affluent 6.0 %, mass 5.8 %, sme 6.1 %); by region it ranges from Termez 4.6 % to **Bukhara 7.6 %**; by `income_source` from business 4.7 % to **self-employed 7.0 %** — plausibly real (self-employed people have no payslip), and a note for the memo rather than a bug.

> 💡 **Key idea.** Aggregates skip NULLs: `COUNT(col)` and `AVG(col)` work on the known values only. Put the count — and the share that is missing — next to every average, so the reader knows what the number stands on.

**Your turn.**

> 🎬 **Didn't get NULL in SUM, AVG and COUNT?** [Baraa explains it · 4 min](https://youtu.be/SSKVgrwhzus?t=25999&end=26219)

### COALESCE and IFNULL — a value instead of NULL

**What it is.** **COALESCE**`(a, b, c, …)` returns the first argument that is not NULL. It is standard SQL and works on both engines. **IFNULL**`(a, b)` (SQLite) and **ISNULL**`(a, b)` (SQL Server) are two-argument versions of the same thing. Prefer `COALESCE`; it travels.

**How to write it.**

```sql
-- 'x': the first non-NULL argument
SELECT COALESCE(NULL, NULL, 'x'),
       IFNULL(NULL, 0);
       -- 0      SQL Server: ISNULL(NULL, 0)

SELECT customer_id,
       -- a label instead of an empty cell
       COALESCE(CAST(monthly_income AS TEXT), 'unknown') AS income_shown
FROM customers
WHERE customer_id IN (1, 14);  -- 3894708 · unknown
```

Wednesday's DPD query uses `COALESCE(SUM(p.amount), 0)`: an instalment with no payment gets "paid = 0" instead of NULL, so the test `paid < total_due` can be true for it.

**When you use it.** When NULL has a known meaning: "no payment" means 0 paid; "no label" should print `'unknown'`. Not when NULL means "we do not know": an unknown income is not an income of 0.

> ⚠️ **Watch out.** `AVG(COALESCE(monthly_income, 0))` is 14.3 m, not 15.2 m: it invents 356 people who earn nothing. Fill a NULL only when you can say what it means.

**Your turn.** What does `COALESCE(NULL, 0, 5)` return?

> 🎬 **Didn't get ISNULL (IFNULL)?** [Baraa explains it · 4 min](https://youtu.be/SSKVgrwhzus?t=25312&end=25580)

> 🎬 **Didn't get COALESCE?** [Baraa explains it · 7 min](https://youtu.be/SSKVgrwhzus?t=25580&end=25999)

### NULLIF — safe division

**What it is.** **NULLIF**`(a, b)` returns NULL when `a = b`, and `a` otherwise. Its one job is **safe division**: `x / NULLIF(y, 0)` returns NULL instead of failing when `y` is 0.

**How to write it.**

```sql
SELECT b.branch_name, COUNT(*) AS applications,
       ROUND(100.0 * SUM(CASE WHEN a.status LIKE 'approved%' THEN 1 ELSE 0 END)
                   / NULLIF(SUM(CASE WHEN a.status <> 'cancelled' THEN 1 ELSE 0 END), 0), 1) AS approval_decided_pct
FROM applications a JOIN branches b ON b.branch_id = a.branch_id
GROUP BY b.branch_name ORDER BY approval_decided_pct DESC;
-- Fergana Central 72.8 … Nukus Central 68.5
```

Fergana Central approves 72.8 % of the applications it decided; Nukus Central 68.5 %. No branch has zero decided applications today; the day one does, the report still runs. (`SUM(CASE …)` is explained four subsections down — read it as "count the rows where …".)

**When you use it.** Every division whose denominator is a count or a sum that could be 0 in some group: a rate per branch, per month, per collector.

> ⚠️ **Watch out.** The two engines behave differently without it: SQL Server stops the whole query with "Divide by zero error encountered"; SQLite quietly returns NULL for `10 / 0`. `NULLIF` makes both return NULL.

**Your turn.** What does `SELECT 10 / NULLIF(0, 0)` return?

> 🎬 **Didn't get NULLIF?** [Baraa explains it · 6 min](https://youtu.be/SSKVgrwhzus?t=27340&end=27704)

### Searched CASE — a value chosen by conditions

**What it is.** A **searched CASE** (*условное выражение*) tests conditions in order and returns the value of the **first** one that is true. `ELSE` is what all the other rows get; without `ELSE` they get NULL.

**How to write it.**

```sql
-- the NULL test first
SELECT CASE WHEN monthly_income IS NULL      THEN 'unknown'
            WHEN monthly_income <  5000000   THEN '<5m'
            WHEN monthly_income < 10000000   THEN '5-10m'
            WHEN monthly_income < 20000000   THEN '10-20m'
            ELSE '20m+' END AS income_band,
       COUNT(*) AS customers
FROM customers GROUP BY income_band;
-- SQL Server: repeat the whole CASE in GROUP BY (no alias, no GROUP BY 1)
-- unknown 356 · <5m 1281 · 5-10m 2198 · 10-20m 576 · 20m+ 1629
```

Five bands that add up to 6 040. Order matters: a customer with 3 m matches `< 5000000` first and never reaches `< 10000000`.

**When you use it.** Buckets and bands (income, DPD, credit score), flags (late or not), labels built from several columns.

> ⚠️ **Watch out.** Every comparison with NULL is unknown, so empty values fall through to `ELSE`. Without the first line, the 356 unknown incomes land in `'20m+'` — 1 985 "rich" customers instead of 1 629. Write `WHEN col IS NULL THEN 'unknown'` as the first line of every banding `CASE`.

**Your turn.** Without `ELSE`, what does a row that matches no `WHEN` get?

> 🎬 **Didn't get CASE ... WHEN ... THEN?** [Baraa explains it · 10 min](https://youtu.be/SSKVgrwhzus?t=29270&end=29857)

> 🎬 **Didn't get CASE for making categories?** [Baraa explains it · 6 min](https://youtu.be/SSKVgrwhzus?t=29902&end=30267)

### Simple CASE — a lookup on one value

**What it is.** A **simple CASE** compares one expression with a list of values: `CASE expression WHEN value1 THEN result1 WHEN value2 THEN result2 ELSE other END`. It is a short way to write a lookup; it can only test equality.

**How to write it.**

```sql
SELECT CASE channel WHEN 'app'    THEN 'Mobile app'
                    WHEN 'branch' THEN 'Branch office'
                    ELSE 'Partner shop' END AS channel_name,
       COUNT(*) AS applications
FROM applications
GROUP BY channel_name;
-- Branch office 6 223 · Mobile app 5 006 · Partner shop 2 771
```

Three readable labels for the three channel codes; the counts are Tuesday's.

**When you use it.** Codes into names for a report, when there is no lookup table to join. For ranges (`< 5000000`) or NULL tests you need the searched form.

> ⚠️ **Watch out.** `CASE monthly_income WHEN NULL THEN …` never matches: a simple CASE compares with `=`, and `= NULL` is never true. Use `CASE WHEN monthly_income IS NULL THEN …`.

**Your turn.** Turn the product codes of `products` into short names with a simple CASE: `'MICRO'` → `'Micro'`, `'CONS'` → `'Consumer'`, everything else → the code itself.

> 🎬 **Didn't get CASE for mapping values?** [Baraa explains it · 6 min](https://youtu.be/SSKVgrwhzus?t=30267&end=30620)

> 🎬 **Didn't get the short form of CASE?** [Baraa explains it · 3 min](https://youtu.be/SSKVgrwhzus?t=30620&end=30796)

### CASE in ORDER BY — a sort order of your own

**What it is.** `ORDER BY` can sort by a `CASE` that turns each value into a rank. That gives a business order instead of an alphabetical one.

**How to write it.**

```sql
SELECT status, COUNT(*) AS loans
FROM loans
GROUP BY status
ORDER BY CASE status WHEN 'active'      THEN 1
                     WHEN 'default'     THEN 2
                     WHEN 'written_off' THEN 3
                     ELSE 4 END;
                     -- active 3 352 · default 44 · written_off 190 · closed 4
                     -- 242
```

The statuses come out in the order of a loan's life — active, then the bad outcomes, closed last — instead of `active, closed, default, written_off`.

**When you use it.** Bands (`<5m`, `5-10m`, … sort wrongly as text), statuses, weekday names, any list whose natural order is not alphabetical.

**Your turn.** Sort the five income bands from the searched-CASE example from lowest to highest, with `unknown` last.

### CASE inside SUM and COUNT — counting where

**What it is.** A `CASE` inside an aggregate counts or sums **conditionally**: `SUM(CASE WHEN cond THEN 1 ELSE 0 END)` is "count the rows where cond". One such column per condition turns Tuesday's long table into a wide one — a **pivot**.

**How to write it.**

```sql
SELECT p.name,
       SUM(CASE WHEN l.status = 'active'      THEN 1 ELSE 0 END) AS active,
       SUM(CASE WHEN l.status = 'closed'      THEN 1 ELSE 0 END) AS closed,
       SUM(CASE WHEN l.status = 'default'     THEN 1 ELSE 0 END) AS in_default,
       SUM(CASE WHEN l.status = 'written_off' THEN 1 ELSE 0 END) AS written_off
FROM loans l JOIN products p ON p.product_id = l.product_id
GROUP BY p.name ORDER BY p.name;
```

| product | active | closed | default | written_off |
|---|---|---|---|---|
| Auto loan | 358 | 23 | 2 | 8 |
| Buy now pay later | 470 | 1 057 | 9 | 33 |
| Consumer loan | 1 359 | 982 | 15 | 62 |
| Micro loan | 575 | 2 018 | 13 | 63 |
| Small business loan | 590 | 162 | 5 | 24 |

Five products down, four statuses across: twenty numbers that add up to 7 828.

**When you use it.**

| You want | Write |
|---|---|
| count where | `SUM(CASE WHEN cond THEN 1 ELSE 0 END)` or `COUNT(CASE WHEN cond THEN 1 END)` |
| sum where | `SUM(CASE WHEN cond THEN amount ELSE 0 END)` |
| share where | `AVG(CASE WHEN cond THEN 1.0 ELSE 0 END)` |

This spelling is portable; SQLite's `SUM(cond)` and SQL Server's `IIF` from Tuesday are shorthands for it.

> ⚠️ **Watch out.** `COUNT(CASE WHEN cond THEN 1 ELSE 0 END)` counts **every** row (14 000 on `applications`): 0 is a value, and `COUNT` counts values. With `COUNT`, leave the `ELSE` out so the other rows get NULL (8 595 approved).

**Your turn.**

> 🎬 **Didn't get CASE inside SUM and COUNT?** [Baraa explains it · 5 min](https://youtu.be/SSKVgrwhzus?t=31024&end=31308)

### The anti-join — why IS NULL finds the rows with no partner

**What it is.** Monday's anti-join, now with the reason it works. `LEFT JOIN` fills the right side with NULL where nothing matched. `WHERE right.key IS NULL` keeps exactly those rows, because a key column is never NULL on a *matched* row.

**How to write it.**

```sql
SELECT COUNT(*) FROM customers c LEFT JOIN applications a ON a.customer_id = c.customer_id
WHERE a.application_id IS NULL;
-- 587 never applied
SELECT a.status, COUNT(*) FROM applications a LEFT JOIN loans l ON l.application_id = a.application_id
WHERE l.loan_id IS NULL AND a.status LIKE 'approved%' GROUP BY a.status;
-- approved 89 · approved_not_disbursed 678
```

587 customers never applied. 767 approved applications have no loan: 678 marked `approved_not_disbursed` and 89 marked `approved` — Monday's pipeline.

**When you use it.** "Which X have no Y". Test the right table's **key**, not a column that may be NULL on matched rows too.

> ⚠️ **Watch out.** `WHERE l.closed_at IS NULL` is not an anti-join: `closed_at` is NULL on every matched active loan as well. Test a column that is never empty on a real row — the key.

**Your turn.** Which test finds the loans with no collections action at all?

> 🎬 **Didn't get the left anti-join?** [Baraa explains it · 4 min](https://youtu.be/SSKVgrwhzus?t=12468&end=12708)

> 🎬 **Didn't get the anti-join (rows with no partner)?** [Baraa explains it · 6 min](https://youtu.be/SSKVgrwhzus?t=27930&end=28282)

### The LEFT JOIN that turns into an INNER JOIN — ON vs WHERE

**What it is.** A filter on the **right** table written in `WHERE` runs after the join. On every row with no partner the right columns are NULL, so the test is not true, and `WHERE` deletes exactly the rows LEFT was there to keep. The LEFT JOIN becomes an INNER JOIN. In `ON`, the same filter only decides which right rows count as a match.

**How to write it.** "Every customer, with their active loans":

| Filter `l.status = 'active'` in … | rows | customers kept |
|---|---|---|
| `ON` (`LEFT JOIN loans l ON l.customer_id = c.customer_id AND l.status = 'active'`) | 6 894 | all 6 040 — those with no active loan get NULLs |
| `WHERE` (`LEFT JOIN loans l ON l.customer_id = c.customer_id WHERE l.status = 'active'`) | 3 352 | only customers with an active loan |

```sql
SELECT COUNT(*) AS rows_, COUNT(DISTINCT c.customer_id) AS customers
FROM customers c
LEFT JOIN loans l ON l.customer_id = c.customer_id AND l.status = 'active';
-- 6 894 · 6 040
```

6 894 rows: one per active loan, plus one row with NULLs for every customer without an active loan. All 6 040 customers are there. Move the condition to `WHERE` and 3 352 rows remain — one per active loan; every other customer is gone.

**When you use it.** Every LEFT JOIN with a condition on the right table: the as-of filter on payments (`p.paid_at <= '2026-10-01'`), "approved applications only", "this month's actions only".

> ⚠️ **Watch out.** A condition on the right-hand table in `WHERE` is false on every unmatched (NULL) row, so it deletes the rows your LEFT JOIN was there to keep. Right-side filters go in `ON`; `WHERE` is for the left table and for `IS NULL` tests.

**Your turn.**

### Joining on two columns

**What it is.** Some matches need more than one key: `ON a.x = b.x AND a.y = b.y`. A row matches only when **both** pairs are equal.

**How to write it.** Last week's duplicate hunt, as a self-join on two columns: customers sharing a phone *and* a birth date.

```sql
SELECT a.customer_id, b.customer_id AS other_id, a.first_name, b.first_name AS other_first
FROM customers a JOIN customers b
  ON a.phone = b.phone AND a.birth_date = b.birth_date AND a.customer_id < b.customer_id;
  -- 40 pairs
```

40 pairs — exactly the 40 duplicates with ids 6001+. Phone alone gives 43 pairs: three are family members sharing a number.

**When you use it.** Tables keyed by two columns (`loan_id, installment_no`); duplicate searches that need two pieces of evidence; **consistency checks** — `payments JOIN installments ON installment_id AND loan_id` returns 52 875 rows, the same as on `installment_id` alone, which proves that no payment points at an instalment of a *different* loan.

> ⚠️ **Watch out.** A join matches only **exactly equal** keys. A NULL key never matches anything — not even another NULL — so those rows vanish from an INNER JOIN and look "unmatched" in a LEFT JOIN. And text keys must be spelt the same on both sides: `'Card'` is not `'card'`, `'+998901112233'` is not `'998901112233'`. Before you join on a typed key, count the rows with a NULL key and clean both sides with the same `TRIM`, `LOWER` or `REPLACE`.

**Your turn.** The self-join on phone alone returns 43 pairs, on phone and birth date 40. What are the other 3?

### Joins that multiply rows — one-to-many on both sides

**What it is.** Join one table to **two** "many" tables on the same key and every row of the first many-side is paired with every row of the second: 2 payments × 3 actions = 6 rows for one loan. This is a **fan-out**. Every count and sum over it is multiplied.

**How to write it.** Loan 7 with two payments and three actions:

| `loans` | `payments` | `collections_actions` | `loans JOIN payments JOIN collections_actions` |
|---|---|---|---|
| 7 | p1, p2 | a1, a2, a3 | (p1,a1) (p1,a2) (p1,a3) (p2,a1) (p2,a2) (p2,a3) — 6 rows |

On the real data, loan 2167 (written off, 919 days past due):

```sql
SELECT COUNT(*) AS rows_, COUNT(DISTINCT p.payment_id) AS payments, COUNT(DISTINCT ca.action_id) AS actions,
       SUM(p.amount) AS summed_amount
FROM loans l
JOIN payments p             ON p.loan_id  = l.loan_id
JOIN collections_actions ca ON ca.loan_id = l.loan_id
WHERE l.loan_id = 2167;  -- 72 · 2 · 36 · 21 443 436
```

72 rows = 2 payments × 36 actions. `SUM(p.amount)` says 21.4 m UZS; the loan's two payments really total 595 651 — each counted 36 times.

**When you use it.** To recognise it: any query that joins two child tables of the same parent (payments **and** actions, instalments **and** payments by `loan_id`) and then counts or sums.

> ⚠️ **Watch out.** Across the 283 loans with collections actions, this join has 48 161 rows and sums 205.6 bn UZS of "payments"; the real payments on those loans total 4.6 bn. The fix is the subsection after next: reduce each child table to one row per loan *before* joining.

**Your turn.** Loan 2235 has 7 payments and 151 collections actions. How many rows does `loans JOIN payments JOIN collections_actions` return for it?

### Duplicates — COUNT(*) next to COUNT(DISTINCT key)

**What it is.** A **duplicate** is a row that repeats a fact already in the table. `COUNT(*)` next to `COUNT(DISTINCT key)` finds them: equal numbers mean one row per key; different numbers mean some key repeats.

**How to write it.**

```sql
SELECT COUNT(*), COUNT(DISTINCT installment_id) FROM payments;
-- 52 875 · 52 850
SELECT installment_id, paid_at, amount, COUNT(*) AS copies
FROM payments
GROUP BY installment_id, paid_at, amount
HAVING COUNT(*) > 1;
-- 25 rows, all with copies = 2
```

25 instalments carry two payments, and each pair is identical — same instalment, same date, same amount. 58 397 800 UZS is counted twice in every "payments received" total.

**When you use it.** On every table before you sum it, and after every join: the same test tells you whether the join multiplied the rows (7 828 loans → 92 193 rows after `installments`; `COUNT(DISTINCT loan_id)` still 7 828).

> 💡 **Key idea.** `COUNT(*)` next to `COUNT(DISTINCT key)` answers two questions with one line: did my join multiply the rows, and does my table hold duplicates? Equal numbers — one row per key; different — find out why before you sum.

**Your turn.** `payments` has 52 875 rows and 52 850 distinct `installment_id`s. How many instalments carry more than one payment?

### De-duplicate before you join — a preview of Week 3

**What it is.** The fix for fan-out and for duplicates is the same: make each table **one row per key** first, then join. `SELECT DISTINCT` removes exact copies; `GROUP BY key` folds a child table to one row per parent. Both need a named intermediate result — `WITH name AS (…)`, Week 3's tool. Today, read and run.

**How to write it.**

```sql
-- one row per loan
WITH pay AS (SELECT loan_id, COUNT(*) AS payments, SUM(amount) AS paid
             FROM payments GROUP BY loan_id),
     -- one row per loan
     act AS (SELECT loan_id, COUNT(*) AS actions
             FROM collections_actions GROUP BY loan_id)
SELECT l.loan_id, pay.payments, pay.paid, act.actions
FROM loans l
LEFT JOIN pay ON pay.loan_id = l.loan_id
LEFT JOIN act ON act.loan_id = l.loan_id
WHERE l.loan_id = 2167;  -- 2 · 595 651 · 36
```

One row for loan 2167: 2 payments, 595 651 UZS paid, 36 actions — the true numbers. The same idea removes the 25 duplicate payments: `WITH clean AS (SELECT DISTINCT loan_id, installment_id, paid_at, amount FROM payments)` has 52 850 rows.

**When you use it.** Any time two child tables meet in one query, and any time a table has duplicates you cannot delete. Week 3 teaches `WITH` and `ROW_NUMBER` properly.

**Your turn.** With the `clean` block above, what is the total amount of payments without the duplicates? (`SELECT SUM(amount) FROM clean`)

### Putting it together

One request, the day's tools together. *"By income band, unknown included: customers, loans, and the share of loans that went bad (default or written off)."*

```sql
-- NULL test first
SELECT CASE WHEN c.monthly_income IS NULL     THEN 'unknown'
            WHEN c.monthly_income <  5000000  THEN '<5m'
            WHEN c.monthly_income < 20000000  THEN '5-20m'
            -- searched CASE
            ELSE '20m+' END                                    AS income_band,
       -- the join multiplies customers
       COUNT(DISTINCT c.customer_id)                           AS customers,
       -- NULL (no loan) is not counted
       COUNT(l.loan_id)                                        AS loans,
       -- count where
       SUM(CASE WHEN l.status IN ('default', 'written_off') THEN 1 ELSE 0 END) AS bad_loans,
       ROUND(100.0 * SUM(CASE WHEN l.status IN ('default', 'written_off') THEN 1 ELSE 0 END)
                   -- safe division
                   / NULLIF(COUNT(l.loan_id), 0), 1)           AS bad_pct
FROM customers c
-- customers without loans stay
LEFT JOIN loans l ON l.customer_id = c.customer_id
GROUP BY income_band
ORDER BY bad_pct DESC;
```

| income_band | customers | loans | bad_loans | bad_pct |
|---|---|---|---|---|
| 5-20m | 2 774 | 3 555 | 124 | 3.5 |
| 20m+ | 1 629 | 2 137 | 57 | 2.7 |
| <5m | 1 281 | 1 670 | 44 | 2.6 |
| unknown | 356 | 466 | 9 | 1.9 |

The four bands hold all 6 040 customers and all 7 828 loans. Customers with no income on file go bad *least* often (1.9 %) — a missing income is not a risk signal here. Without the first `WHEN`, those 356 customers would have joined the `20m+` band and pulled its rate down.

### Depth (optional)

- ▶ Baraa, *NULL functions* [6:59:06](https://youtu.be/SSKVgrwhzus?t=25146&end=29270) — 50 min; *CASE* [8:07:50](https://youtu.be/SSKVgrwhzus?t=29270&end=31416) — 35 min; *Joins (advanced)* [3:27:29](https://youtu.be/SSKVgrwhzus?t=12449&end=14529) — anti-joins, self-joins, FULL.
- RU deck (TBC Data Analytics 2.0, if you have it) `2.2 SQL-1-38.pdf` — NULL / CASE pages. *Russian terms:* пустое значение = NULL, условное выражение = CASE, самосоединение = self-join, дубликаты = duplicates.

---

## 2. Worked example — the quarter-by-product pivot

**Ask (Bekzod, by email):** *2026 disbursements, products down, quarters across.*

Each step uses one subsection of section 1, in the order you learned them.

1. **NULL in aggregates.** The pivot sums `principal` and sorts loans into quarters by `disbursed_at`. Check both columns first: `SELECT COUNT(*) - COUNT(disbursed_at), COUNT(*) - COUNT(principal) FROM loans` → 0 and 0. A loan with no date would fall into no quarter and vanish from every cell without a warning.
2. **Searched CASE.** Each quarter is a half-open date range written as a `WHEN` condition. Grain of the answer: one row per product; three measure columns. Source grain: `loans` — safe to sum.
3. **CASE inside SUM.** `SUM(CASE WHEN <quarter> THEN l.principal ELSE 0 END)` is "sum where": one column per quarter.
4. **No fan-out.** The only join is `loans → products`, many-to-one. One row is still one loan, so nothing is counted twice.

```sql
SELECT p.name,
       SUM(CASE WHEN l.disbursed_at <  '2026-04-01' THEN l.principal ELSE 0 END) AS q1,
       SUM(CASE WHEN l.disbursed_at >= '2026-04-01' AND l.disbursed_at < '2026-07-01' THEN l.principal ELSE 0 END) AS q2,
       SUM(CASE WHEN l.disbursed_at >= '2026-07-01' THEN l.principal ELSE 0 END) AS q3_plus
FROM loans l JOIN products p ON p.product_id = l.product_id
WHERE l.disbursed_at >= '2026-01-01'
GROUP BY p.name ORDER BY p.name;
```

| product | Q1 | Q2 | Q3 (+1 Oct) |
|---|---|---|---|
| Auto loan | 13 637 110 000 | 10 773 540 000 | 11 807 660 000 |
| Buy now pay later | 775 920 000 | 733 850 000 | 939 560 000 |
| Consumer loan | 7 465 620 000 | 9 226 930 000 | 8 925 820 000 |
| Micro loan | 782 600 000 | 988 770 000 | 1 040 580 000 |
| Small business loan | 26 342 380 000 | 30 754 010 000 | 38 138 710 000 |

5. **Check:** the fifteen cells sum to 162 333 060 000 — Tuesday's 2026 total. SME grows every quarter; Auto fell after Q1. That sentence is the analysis; the table is the evidence. (The last column has no upper bound, so 1 October rides along — fine for "Q3 and after", wrong for a strict Q3; tomorrow's T7 asks for the strict one.)

---

## 3. Practice (60 min)

Questions whose answer is a query have a box under them — write, **▶ Run**, then **✔ Check** compares your result with the answer without showing it; your query is saved in this browser. Questions that ask for a number or a reason have an answer box of their own. The questions follow section 1 in order; the label in brackets names the subsection each one trains. Today's tools: NULL tests, `COALESCE`, `NULLIF`, `CASE`, `SUM(CASE …)`, anti-joins and joins on two columns, on top of the week so far. P16, P17 and P18 use `WITH` blocks printed on this page and in Day 3's Company corner — copy them as they stand; writing your own `WITH` is Week 3.

**P1.** *(Comparing with NULL)* Closed loans with no closing date: count them once with `closed_at = NULL` and once with `closed_at IS NULL`.

**P2.** *(NULL in arithmetic)* Loan 1's schedule with its payments (`installments LEFT JOIN payments`): add a column `i.total_due - p.amount`. How many rows show NULL there, and why? Then fix it with `COALESCE(p.amount, 0)`.

**P3.** *(NULL in aggregates)* For `customers`: rows, rows with income, rows without, share without (one decimal) — in one query.

**P4.** *(NULL in aggregates)* Share of applications without a credit score by channel and by status.

Is the missing-score gap random?

**P5.** *(COALESCE)* Average income by segment two ways: `AVG(monthly_income)` and `AVG(COALESCE(monthly_income, 0))`, with the count of missing per segment.

Which column goes on Madina's slide?

**P6.** *(NULLIF)* Per channel: approved applications (`status LIKE 'approved%'`) per rejected one, two decimals, safe against a channel with no rejections.

**P7.** *(Searched CASE)* Approval rate (all-applications denominator) by credit-score band A ≥ 720, B 660–719, C 600–659, D < 600 — with a *no score* band. One query with `CASE` in `GROUP BY`.

**P8.** *(Simple CASE)* Customers per segment, with readable labels: `'mass'` → `'Mass market'`, `'affluent'` → `'Affluent'`, everything else → `'Small business'`.

**P9.** *(CASE in ORDER BY)* Applications by status, in pipeline order: approved, approved_not_disbursed, rejected, cancelled.

**P10.** *(CASE inside SUM)* Pivot: applications by channel (rows) × status (four columns) plus a total. Check the totals against Tuesday's counts.

**P11.** *(The anti-join)* Anti-joins: (a) customers who never applied; (b) customers who applied but never got a loan — once with a join, once with `EXCEPT`; (c) delinquent loans (Day 3's `dpd` set) that have **no** collections action at all.

How many of the 399 delinquent loans (DPD > 0) have never had a collections action?

**P12.** *(The LEFT JOIN that turns into an INNER JOIN)* The ON-vs-WHERE experiment. Count rows of `installments LEFT JOIN payments` for matured instalments with the as-of filter `p.paid_at <= '2026-10-01'` (a) in `ON`, (b) in `WHERE`.

How many rows did the `WHERE` version lose compared with the `ON` version?

**P13.** *(Joining on two columns)* Self-join: pairs of customers with the same phone but a *different* birth date.

How many pairs, and what are they?

**P14.** *(Joins that multiply rows)* Join loan 1's `installments` to its `payments` on `loan_id` instead of `installment_id`. How many rows, and where does the number come from?

How many rows does the join on `loan_id` return for loan 1?

**P15.** *(Duplicates)* Duplicates: `COUNT(*)` vs `COUNT(DISTINCT installment_id)` on `payments`; then the groups of identical `(installment_id, paid_at, amount)` and the amount counted twice.

**P16.** *(De-duplicate before you join)* With the `pay` and `act` blocks from section 1, list the three loans with the most collections actions, with their number of payments and the amount paid. Compare with what `loans JOIN payments JOIN collections_actions` would sum for loan 2235.

**P17.** *(Putting it together)* Nilufar's question, part 1: for every loan whose **first** instalment was due on or before 2026-09-01, flag FPD30 = 1 if the instalment was not fully paid, or its first payment came more than 30 days after the due date. Count the loans in scope and the flags. (Copy the `first_inst` and `flags` blocks from the Company corner below and finish with one `SELECT`.)

How many loans are flagged FPD30?

> 🚀 **Stretch (optional, +5 XP).** One step further along the early-trouble curve — not needed to finish the day.

**P18.** *(Putting it together)* SPD30 — the same flag for the *second* instalment (`installment_no = 2`, due on or before 2026-09-01). Loans in scope, flags, and the rate in % with two decimals.

What is the SPD30 rate, in % with two decimals? Before you open the model answer, say to yourself why it is higher than FPD30.

### SQL lab — a table with gaps

NULLs behave the same in a table you own. This lab runs on **your practice copy** of the database (the **Database** panel shows your new table; **Database → Reset** brings the original back).

The planning column and the flag kept what the delete then threw away: after step 4 nobody can tell any more that 38 Bukhara customers had no income. Flag first, fill in a new column, delete last — and only when the question really is about the known values.

---

## 4. Homework

No new homework. **HW 2.2** (Sevara's 2026 lateness report, clean methods, the under-18 applications) is due tomorrow with the checkpoint.

---

## 5. Self-check

---

## 6. Company corner <span class="badge company">FPD30 by vintage and channel</span>

**Definition we use** (say it before every number): a loan is **FPD30** if its first instalment (`installment_no = 1`) was *not paid in full within 30 days of its due date*. **In scope** are loans whose first instalment fell due on or before as-of − 30 days (2026-09-01), so that every loan in the base has had its 30 days. A **vintage** (*винтаж*) is the month of disbursement.

The query has the shape of Wednesday's DPD: two named steps in a `WITH` block, then a grouped `SELECT`. `WITH` is week 3's tool — today read it as two named results, run it, and change only the last `SELECT`.

```sql
-- one row per loan in scope: due, total, first payment date, paid amount
WITH first_inst AS (
  SELECT i.loan_id, i.due_date, i.total_due, MIN(p.paid_at) AS first_paid, COALESCE(SUM(p.amount), 0) AS paid
  FROM installments i
  LEFT JOIN payments p ON p.installment_id = i.installment_id
  WHERE i.installment_no = 1
    -- SQL Server: DATEADD(day, -30, '2026-10-01')
    AND i.due_date <= date('2026-10-01', '-30 days')
  GROUP BY i.loan_id, i.due_date, i.total_due
),
flags AS (
  SELECT f.loan_id,
         -- never fully paid
         CASE WHEN f.paid < f.total_due THEN 1
              -- DATEDIFF(day, f.due_date, f.first_paid) > 30
              WHEN julianday(f.first_paid) - julianday(f.due_date) > 30 THEN 1
              ELSE 0 END AS fpd30
  FROM first_inst f
)
-- FORMAT(l.disbursed_at, 'yyyy-MM')
SELECT strftime('%Y-%m', l.disbursed_at) AS vintage,
       a.channel,
       COUNT(*) AS loans,
       SUM(fpd30) AS fpd,
       ROUND(100.0 * SUM(fpd30) / COUNT(*), 2) AS fpd30_pct
FROM flags fl
JOIN loans l        ON l.loan_id = fl.loan_id
JOIN applications a ON a.application_id = l.application_id
GROUP BY vintage, a.channel
ORDER BY vintage, a.channel;
```

**Overall:** 7 099 loans in scope, **91 FPD30 = 1.28 %** — the number the week-1 page quoted, now yours. Of the 91, 41 are written off, 5 in default, 31 closed and 14 active: FPD predicts loss (half of them are dead loans) but is not loss (a third repaid in the end).

**By channel** (drop `vintage` from the query):

| channel | loans | FPD30 | rate | | unpaid-only definition |
|---|---|---|---|---|---|
| app | 2 411 | 41 | **1.70 %** | | 1.04 % |
| partner | 1 425 | 16 | 1.12 % | | 0.49 % |
| branch | 3 263 | 34 | 1.04 % | | 0.58 % |

The app channel is worse by **0.66 points — 1.6× the branch rate** (at the branch rate, the app's 2 411 loans would have produced about 25 FPDs; they produced 41). Nilufar and Timur were both right: Timur's tile uses the *unpaid-only* rule (app 1.04 % — "fine"), Nilufar's sheet the *within-30-days* rule. Same data, two definitions, a 0.7-point gap on the app. The fix is the sentence at the top of this corner, written on the slide.

**By vintage** (2026 only, all channels): Jan 1.05 % · Feb 1.13 · Mar **0.00** · Apr 1.60 · May 1.86 · Jun 0.80 · Jul 1.09 · Aug 0 of 11 (barely in scope). Across all 32 vintages the rate ranges 0.0–3.1 % on about 100–380 loans each (August 2026: 11) — with 3 FPDs a month, one loan moves the rate by 0.3 points. Read vintages by *quarter* when counts are this small: 2026-Q1 app 1.40 % vs branch 0.24 %; 2026-Q2 app 1.07 % vs branch 1.22 % vs partner 2.58 % (5 of 194). The app's excess is persistent over 2024–2025 (2.16 / 1.76 % vs branch 0.50 / 1.59 %) and has narrowed in 2026 (1.27 vs 0.74 %).

**By product and grade** (same query, swap the dimension): Micro 1.70 % (= the app: Micro is the only app product), Consumer 1.14, BNPL 1.12, SME 0.98, Auto 0.58; grades A 0.60, B 0.97, C 2.16, D 2.23 — the scorecard separates A/B from C/D at the first payment already.

**What to say on Monday:** *"FPD30 (first instalment not fully paid within 30 days; base = loans whose first due date is 30+ days old) is 1.28 % overall. The app channel runs at 1.70 % against 1.04 % at branches — 1.6×, consistent since 2024 and narrowing in 2026. Monthly vintages are too small to read individually; by quarter the app is above the branch in 10 of 11. Recommendation: tighten the app cut-off for grade C, where FPD is 2.2 %."*

Put the computation in order:

> 🎯 **Interview version.** *"How would you compute FPD30 by vintage and channel, and what is the trap?"* — First instalment per loan; LEFT JOIN payments, grouped; flag paid < due *or* first payment > 30 days late; restrict the base to first due dates at least 30 days before the as-of date; group by month of disbursement and channel with `SUM(CASE)/COUNT(*)`. Traps: forgetting the 30-day scope (young vintages look perfect), counting partial payments as paid, and comparing two tiles built on two definitions.

**Say it like in an interview.** *"How would you compute FPD30 by vintage and channel, and what is the trap?"* Answer as you would out loud, with Nur Finance numbers.

Tomorrow: checkpoint — twenty-five questions from four desks, nothing new to learn.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 2 · Day 5 — Checkpoint: 25 questions from four teams (weeks/week-02/day-5.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-02/day-5
=====

# Week 2 · Day 5 — Checkpoint: 25 questions from four teams

<span class="badge">Tasks 120 min</span> <span class="badge">Interview 30 min</span> <span class="badge hw">Checkpoint · 100 points</span>

> STORY **Friday, 9:00.** Four e-mails are waiting, forwarded by Madina with one line on top: *"Everyone wants numbers before the long weekend. Bekzod — the book. Sevara — who is late and who we have not called. Nilufar — Monday's committee. Timur — he wants to know what you found in his data before the board does. Twenty-five questions. Answer them with what you learned this week and last; at 15:00 I'll ask you eight things."*

## Today in 3 lines

- **Part A (75 pts):** 25 tasks — 7 from Bekzod, 6 from Sevara, 6 from Nilufar, 6 from Timur — each a query and its result, difficulty rising inside each group.
- **Part B (25 pts):** eight interview questions answered in writing, 3–5 sentences each.
- Allowed SQL: weeks 1–2 only — `SELECT/WHERE/ORDER BY`, joins, `GROUP BY/HAVING`, functions, `CASE`, set operators. The two `WITH` blocks printed on Day 3 (DPD) and Day 4 (FPD30) may be copied as they stand; no other subqueries, no window functions.

**Rules.**

- **Open book:** your notes, this week's pages, your tool. **Closed:** the answer folds, until you submit.
- **No ✔ Check today.** Write and run each query in the [SQL playground](playground.md) (or any SQL box of this week's pages), then paste them all into the 📎 box at the end. Nothing tells you whether a number is right — you decide.
- **As-of date:** 2026-10-01. Every expected number is computed on it.
- **Hand in** with the 📎 box at the end of this page: `queries.sql` (each task: `-- Tn:` above the query, `-- result:` below it, the dialect on the first line) and `interview.md` (Part B).
- **Also due today:** HW 2.2, in its workspace on the [Week 2 · Day 3](weeks/week-02/day-3.md) page.

**Working method** — the one the week taught, in three habits:

> 💡 **Key idea.** Before each query, write the noun that is "one row" of the table you aggregate. Join dimensions many-to-one freely; when a join is one-to-many, run `COUNT(*)` next to `COUNT(DISTINCT key)` before you sum anything.

> ⚠️ **Watch out.** Filter periods half-open (`>= start AND < next start`) — `BETWEEN` with a last day loses the rows that carry a time — and put the NULL test first in a `CASE`, or the unknowns fall into `ELSE`.

> 💡 **Key idea.** Report a count next to every average or rate. 1.70 % on 2 411 loans is a finding; 0 % on 11 loans is noise.

Warm up for five minutes before the clock starts:

---

## Part A — Twenty-five tasks (120 min, 75 pts)

Three points per task: 1 for a query that runs and answers the question, 1 for the right result, 1 for the one-line reading (`-- note:`) where the task asks for one. Within each team the tasks get harder from first to last.

### Bekzod — the portfolio (7)

**T1.** Loans and total principal by product, most money first.

<details><summary>T1</summary>

```sql
SELECT p.name, COUNT(*) AS loans, SUM(l.principal) AS principal
FROM loans l JOIN products p ON p.product_id = l.product_id GROUP BY p.name ORDER BY principal DESC;
-- SME 781 / 241 117 150 000 · Auto 391 / 84 791 530 000 · Consumer 2418 / 65
-- 109 280 000 · Micro 2669 / 7 221 210 000 · BNPL 1569 / 6 544 110 000
```

</details>

**T2.** Outstanding principal (instalments not yet due) by product, with the number of loans still owing.

<details><summary>T2</summary>

```sql
SELECT p.name, SUM(i.principal_due) AS outstanding, COUNT(DISTINCT i.loan_id) AS loans
FROM installments i JOIN loans l ON l.loan_id = i.loan_id JOIN products p ON p.product_id = l.product_id
WHERE i.due_date > '2026-10-01' GROUP BY p.name ORDER BY outstanding DESC;
-- SME 125 892 942 411 / 603 · Auto 57 684 271 333 / 368 · Consumer 23 054 933
-- 316 / 1398 · BNPL 1 135 251 000 / 474 · Micro 956 106 370 / 566
```
Sums an *instalment* column over `installments`, so the join to `loans` (many-to-one from the instalment) is safe; summing `l.principal` here would be the trap. Total 208 723 504 430.

</details>

**T3.** 2026 disbursements by product: loans, amount, average ticket (whole UZS).

<details><summary>T3</summary>

```sql
SELECT p.name, COUNT(*) AS loans, SUM(l.principal) AS disbursed, ROUND(AVG(l.principal)) AS avg_ticket
FROM loans l JOIN products p ON p.product_id = l.product_id
WHERE l.disbursed_at >= '2026-01-01' AND l.disbursed_at < '2027-01-01' GROUP BY p.name ORDER BY disbursed DESC;
-- SME 305 / 95 235 100 000 / 312 246 230 · Auto 165 / 36 218 310 000 / 219 504
-- 909 · Consumer 941 / 25 618 370 000 / 27 224 623
-- Micro 1045 / 2 811 950 000 / 2 690 861 · BNPL 595 / 2 449 330 000 / 4 116 521
-- (total 3051 / 162 333 060 000)
```

</details>

**T4.** 2026 disbursements by month — which month was largest by amount, which by count?

<details><summary>T4</summary>

```sql
-- FORMAT(disbursed_at, 'yyyy-MM')
SELECT strftime('%Y-%m', disbursed_at) AS month, COUNT(*) AS loans, SUM(principal) AS disbursed
FROM loans WHERE disbursed_at >= '2026-01-01' GROUP BY strftime('%Y-%m', disbursed_at) ORDER BY month;
-- largest amount: 2026-08, 358 loans / 22 290 210 000; most loans: 2026-05, 377
-- / 18 531 830 000
```
Ten rows; October has one day (21 loans). Count and amount peak in different months — two SME loans more or less move the amount by billions.

</details>

**T5.** Outstanding principal by region of the *branch*, largest first, with a `-- note:` on concentration.

<details><summary>T5</summary>

```sql
SELECT b.region, SUM(i.principal_due) AS outstanding, COUNT(DISTINCT i.loan_id) AS loans
FROM installments i JOIN loans l ON l.loan_id = i.loan_id JOIN branches b ON b.branch_id = l.branch_id
WHERE i.due_date > '2026-10-01' GROUP BY b.region ORDER BY outstanding DESC;
-- Tashkent 81 679 738 071 / 1297 · Fergana 24 797 334 197 / 383 · Samarkand 24
-- 655 889 676 / 401 · Andijan 19 798 392 956 / 340
-- Namangan 18 696 787 066 / 290 · Bukhara 15 116 046 338 / 279 · Nukus 13 309
-- 138 567 / 216 · Termez 10 670 177 559 / 203
```
Note: Tashkent holds 39 % of outstanding with 38 % of the owing loans — the book is not concentrated by region; it is concentrated by product (T2: SME is 60 % of outstanding on 18 % of the owing loans).

</details>

**T6.** How many customers have five or more loans? Show the distribution of loans per customer (1, 2, 3 … → customers).

<details><summary>T6</summary>

```sql
SELECT customer_id, COUNT(*) AS loans FROM loans GROUP BY customer_id HAVING COUNT(*) >= 5;
-- 81 rows
```
Distribution (`GROUP BY customer_id`, then count the rows per value — by eye today, with a subquery next week): 1 loan → 2 089 customers · 2 → 1 378 · 3 → 593 · 4 → 194 · 5 → 62 · 6 → 15 · 7 → 4. Total 4 335 borrowers.

</details>

**T7.** Bekzod's hardest: 2026 disbursed amount by product (rows) × quarter (Q1, Q2, Q3 as columns; 1 October belongs to Q4 — leave it out). Add a `-- note:` on which products grew every quarter.

<details><summary>T7</summary>

```sql
SELECT p.name,
       SUM(CASE WHEN l.disbursed_at >= '2026-01-01' AND l.disbursed_at < '2026-04-01' THEN l.principal ELSE 0 END) AS q1,
       SUM(CASE WHEN l.disbursed_at >= '2026-04-01' AND l.disbursed_at < '2026-07-01' THEN l.principal ELSE 0 END) AS q2,
       SUM(CASE WHEN l.disbursed_at >= '2026-07-01' AND l.disbursed_at < '2026-10-01' THEN l.principal ELSE 0 END) AS q3
FROM loans l JOIN products p ON p.product_id = l.product_id
WHERE l.disbursed_at >= '2026-01-01' AND l.disbursed_at < '2026-10-01' GROUP BY p.name ORDER BY p.name;
-- Q1 / Q2 / Q3:  Auto 13 637 110 000 / 10 773 540 000 / 11 611 170 000 · BNPL
-- 775 920 000 / 733 850 000 / 921 270 000
-- Consumer 7 465 620 000 / 9 226 930 000 / 8 769 350 000 · Micro 782 600 000 /
-- 988 770 000 / 1 019 870 000
--                SME 26 342 380 000 / 30 754 010 000 / 37 677 910 000
```
Day 4's worked example ran its last column to the end of the data on purpose (labelled "Q3 (+1 Oct)"); here Q3 must stop on 30 September, and the half-open upper bound keeps 1 October (21 loans, 852 760 000) out. Note: SME and Micro grew every quarter; BNPL and Consumer dipped in Q2 or Q3; Auto fell after Q1 and has not recovered. Full marks need the half-open filters and the note.

</details>

### Sevara — delinquency and collections (6)

**T8.** How much is overdue right now: matured instalments **not fully paid** — count of instalments, loans, and the unpaid remainder.

<details><summary>T8</summary>

Copy Day 3's `WITH unpaid … dpd …` block and finish with `SELECT COUNT(*), COUNT(DISTINCT loan_id), SUM(total_due - paid) FROM unpaid;` → **1 784 instalments · 413 loans · 7 599 088 794 UZS**. (Day 1's simpler "no payment at all" version gives 1 357 / 399 / 6 475 544 633 — accepted with a note saying it ignores partial payments.)

</details>

**T9.** The DPD bucket table (0 / 1–30 / 31–60 / 61–90 / 90+) with loans and overdue amount per bucket, and the status check.

<details><summary>T9</summary>

From `dpd` with the bucket `CASE` (Day 3, Company corner): 0 → 14 / 53 018 776 · 1–30 → 124 / 499 314 822 · 31–60 → 25 / 74 348 104 · 61–90 → 16 / 109 375 982 · 90+ → 234 / 6 863 031 110. Note: 90+ = 44 `default` + 190 `written_off`, so the status column agrees with the computation; 399 loans have DPD > 0.

</details>

**T10.** The call list: loans with DPD 31–90, borrower name, phone, DPD and overdue amount, worst first. How many, how much?

<details><summary>T10</summary>

```sql
-- after the WITH block:
SELECT d.loan_id, c.first_name || ' ' || c.last_name AS borrower, c.phone, d.dpd, d.overdue_amount
FROM dpd d JOIN loans l ON l.loan_id = d.loan_id JOIN customers c ON c.customer_id = l.customer_id
WHERE d.dpd BETWEEN 31 AND 90 ORDER BY d.dpd DESC;
```
**41 loans, 183 724 086 UZS**; first row loan 2242, Abror Abdullaev, 89 DPD, 968 400 owed; the largest overdue amount in the list is loan 4567 (60 328 500 owed, 84 DPD). `BETWEEN` is fine on integers — the trap is on dates with times, not here.

</details>

**T11.** Delinquent loans (DPD > 0) and overdue amount by product, with a `-- note:`.

<details><summary>T11</summary>

From `dpd`, `WHERE d.dpd > 0`, joined to `loans → products`: SME 47 loans / 4 802 628 425 · Consumer 138 / 1 308 423 535 · Auto 29 / 1 161 471 073 · Micro 121 / 177 923 528 · BNPL 64 / 95 623 457. Note: Consumer has the most late *loans*, SME the most late *money* — ask Sevara which she is staffing for.

</details>

**T12.** Collections actions by type with the share ending in a promise to pay — one query, `SUM(CASE)`.

<details><summary>T12</summary>

```sql
SELECT action_type, COUNT(*) AS actions,
       ROUND(100.0 * SUM(CASE WHEN outcome = 'promise_to_pay' THEN 1 ELSE 0 END) / COUNT(*), 1) AS promise_pct
FROM collections_actions GROUP BY action_type ORDER BY actions DESC;
-- sms 3265 / 38.4 · call 3114 / 25.2 · visit 1506 / 25.3 · restructure_offer
-- 1476 / 23.3
```

</details>

**T13.** Sevara's hardest: delinquent loans that have **never** had a collections action — total, and how many of them are in the 1–30 bucket. `-- note:` what it says about the team's queue.

<details><summary>T13</summary>

```sql
-- after the WITH block:
SELECT COUNT(*) AS never_contacted,
       SUM(CASE WHEN d.dpd BETWEEN 1 AND 30 THEN 1 ELSE 0 END) AS of_which_1_30
FROM dpd d LEFT JOIN collections_actions ca ON ca.loan_id = d.loan_id
WHERE ca.action_id IS NULL;                                        -- 130 · 106
```
The anti-join on `collections_actions`. 130 of the 413 loans with a matured unpaid instalment have no action — but 13 of those fall due today (DPD 0) and cannot have been called yet, so the fair answer is **117 of the 399 delinquent (DPD > 0) loans**; 106 of the 124 in 1–30 are among them, while the 234 loans in 90+ carry 9 058 actions (39 each). The team's effort sits on the dead debt; the fresh, curable cases wait. That sentence is the note.

</details>

### Nilufar — approvals and risk (6)

**T14.** Approval rate by channel under both conventions in one query: all applications, and decided only (cancelled out).

<details><summary>T14</summary>

```sql
SELECT channel, COUNT(*) AS apps,
       ROUND(100.0 * SUM(CASE WHEN status LIKE 'approved%' THEN 1 ELSE 0 END) / COUNT(*), 1) AS rate_all,
       ROUND(100.0 * SUM(CASE WHEN status LIKE 'approved%' THEN 1 ELSE 0 END)
                   / NULLIF(SUM(CASE WHEN status <> 'cancelled' THEN 1 ELSE 0 END), 0), 1) AS rate_decided
FROM applications GROUP BY channel;
-- app 5006 / 58.2 / 68.2 · branch 6223 / 63.7 / 72.4 · partner 2771 / 61.9 /
-- 70.5
```

</details>

**T15.** Approval rate by credit-score band (A ≥ 720, B 660–719, C 600–659, D < 600) **with a no-score band**; the bands must add up to 14 000.

<details><summary>T15</summary>

Day 4 P7: A 2 150 / 91.3 % · B 4 702 / 77.4 · C 4 605 / 52.2 · D 2 155 / 16.8 · no score 388 / 59.0 — sum 14 000. The NULL test comes first in the `CASE`; without it the 388 land in D and the D rate reads 23 % instead of 17 %.

</details>

**T16.** Approval rate (all applications) by band **and** channel. In which band is the app furthest below the branch?

<details><summary>T16</summary>

`GROUP BY band, channel`: A app 88.0 vs branch 93.0 (−5.0) · B 72.9 vs 80.2 (−7.3) · C 49.8 vs 54.3 (−4.5) · **D 11.6 vs 19.6 (−8.0)** · no score 57.6 vs 60.9. The app is strictest at the bottom — where Day 4's FPD says it should be — and still has the worse FPD.

</details>

**T17.** Share of approvals that were never disbursed (`approved_not_disbursed` ÷ all approved), by channel.

<details><summary>T17</summary>

`SUM(CASE WHEN status = 'approved_not_disbursed' THEN 1 ELSE 0 END) * 100.0 / SUM(CASE WHEN status LIKE 'approved%' THEN 1 ELSE 0 END)`: app 222 / 2 915 = **7.6 %** · branch 329 / 3 965 = 8.3 % · partner 127 / 1 715 = 7.4 %. Branch customers walk away slightly more often — they had two days to think (decision lag 2.0 days vs 0 in the app).

</details>

**T18.** FPD30 by channel (Day 4's definition and `WITH` block).

<details><summary>T18</summary>

app 2 411 / 41 / **1.70 %** · partner 1 425 / 16 / 1.12 % · branch 3 263 / 34 / 1.04 %; overall 7 099 / 91 / 1.28 %. State the definition in the `-- note:` (first instalment not fully paid within 30 days; base = first due date ≤ 2026-09-01).

</details>

**T19.** Nilufar's hardest: FPD30 **and** write-off share by risk grade in one table, with a `-- note:` on whether the grades order both.

<details><summary>T19</summary>

FPD from the `flags` block joined to `loans`, grouped by `l.risk_grade`; write-off share from `loans` alone (`SUM(CASE WHEN status = 'written_off' THEN 1 ELSE 0 END) / COUNT(*)`) — two queries, or one `UNION ALL` with a label column:

| grade | loans in FPD scope | FPD30 | write-offs / loans | write-off % |
|---|---|---|---|---|
| A | 1 667 | 0.60 % | 13 / 1 821 | 0.7 % |
| B | 3 084 | 0.97 % | 49 / 3 404 | 1.4 % |
| C | 2 034 | 2.16 % | 98 / 2 264 | 4.3 % |
| D | 314 | 2.23 % | 30 / 339 | 8.8 % |

Both monotonic. FPD separates A/B from C/D (×2.2) but barely C from D; write-off separates every grade (×2 each step). FPD is the early signal, write-off the outcome — the scorecard works, and D is a small, expensive book.

</details>

### Timur — data quality and grain (6)

**T20.** Payments by `method` raw and cleaned (`LOWER`, `TRIM`, `REPLACE`), and the number of rows that needed cleaning.

<details><summary>T20</summary>

Raw: 10 groups on SQLite (SQL Server's default collation ignores case and trailing spaces and shows 6 — Day 2 P8). Cleaned with `REPLACE(LOWER(TRIM(method)), 'bank transfer', 'transfer')`: card 17 621 · payme 8 900 · click 8 790 · cash 8 790 · transfer 8 774. Dirty rows: `WHERE method <> LOWER(TRIM(method)) OR method LIKE 'bank%'` → **180** on SQLite (SQL Server: add `COLLATE Latin1_General_CS_AS` after `LOWER(TRIM(method))`, or its default collation finds only the 27 `bank transfer` rows). Note for Timur: the 27 `bank transfer` rows average 2.1 days late — a different source system, not a typo.

</details>

**T21.** Exact duplicate payments: how many groups, and how much money is counted twice?

<details><summary>T21</summary>

`GROUP BY installment_id, paid_at, amount HAVING COUNT(*) > 1` → **25** groups of 2; `SUM(amount)` over those groups → **58 397 800** double-counted. Also visible as 52 875 rows vs 52 850 distinct `installment_id`, and as 25 instalments "overpaid" by exactly one instalment.

</details>

**T22.** Closed loans with no `closed_at` — how many, and do they have an unpaid matured instalment?

<details><summary>T22</summary>

`SELECT COUNT(*) FROM loans WHERE status = 'closed' AND closed_at IS NULL` → **15**. Joined to Day 3's `dpd` set, all 15 appear (13 in 1–30, 1 in 31–60, 1 at DPD 0): the system closed them when the schedule ended, not when the money arrived. Note: `status` should be derived from payments, not from the calendar.

</details>

**T23.** Payments dated **after** the as-of date: count, latest date, loans affected.

<details><summary>T23</summary>

`SELECT COUNT(*), MAX(paid_at), COUNT(DISTINCT loan_id) FROM payments WHERE paid_at > '2026-10-01'` → **24 · 2026-11-24 · 23**. Either the extract date is wrong or these are forward-dated entries; Day 4 P12 showed they do not change the DPD buckets, but they inflate "collected in October" before October exists.

</details>

**T24.** Loans disbursed before their application was submitted: count, and the rule that recovers the true date.

<details><summary>T24</summary>

`WHERE l.disbursed_at < date(a.applied_at)` (SQL Server `CAST(a.applied_at AS DATE)`) after `loans JOIN applications` → **12**. The true date is the first instalment's `due_date` minus one month — 0–3 days after `decided_at` for all twelve. Recommendation: restore `disbursed_at` from the schedule; add a load check `disbursed_at >= decided_at`.

</details>

**T25.** The grain question (no query, 5–8 sentences). Bekzod asks for *outstanding by product*; Sevara for *days late per payment*; Madina for *disbursements by month*. For each: what is one row of the table you aggregate, which tables may you join before aggregating, and which join would silently inflate the number?

---

## Part B — Eight interview questions (30 min, 25 pts)

Answer in writing, 3–5 sentences each, as you would say it: 3 points per question (1 correct, 1 a Nur Finance example with a number, 1 plain words) and 1 point for a short "definitions I used" note at the top of `interview.md` (as-of date, FPD30 rule, DPD rule).

1. What is the difference between INNER JOIN and LEFT JOIN? When does the row count change, and in which direction?
2. Why would you choose a LEFT JOIN for a report, and what mistake turns it back into an INNER JOIN?
3. HAVING vs WHERE — what does each filter, and in what order do they run?
4. How does NULL behave in `COUNT`, `AVG` and `WHERE`? What do you report next to an average?
5. How do you compute DPD for every loan in SQL?
6. FPD and DPD — what is each used for, and why track FPD separately?
7. What is the trap in filtering by period, and how do you write the filter?
8. What is row multiplication in a join, how do you detect it, and how do you avoid summing the wrong thing?

---

## Scoring and what happens next

| Part | Points | Pass |
|---|---|---|
| A — 25 tasks × 3 | 75 | |
| B — 8 questions × 3 + definitions note | 25 | |
| **Total** | **100** | **≥ 70 → Week 3 on Monday** |

Below 70: feedback names the sections to redo (most often Day 2's HAVING/multiplication or Day 4's NULL rules); re-submit the failed tasks Monday morning before Week 3. Points go to the [Progress page](progress.md).

**Hand-in checklist** (the 📎 box below): `queries.sql` (25 tasks, 25 `-- result:` lines, dialect stated), `interview.md` (definitions note + 8 answers). Also due today: **HW 2.2** in its workspace on the [Week 2 · Day 3](weeks/week-02/day-3.md) page.

Madina, 17:40: *"Nilufar has her slide and the sentence under it. Sevara moved three collectors to the 1–30 queue. Timur found out about his fifteen closed loans from you, not from the board — he says thank you, in his way. Monday: window functions, and the twenty-five questions you could not answer this week because they needed 'the previous month'."*

---

### 📎 Hand in here

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 3 · Day 1 — Window functions: a total next to every row (weeks/week-03/day-1.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-03/day-1
=====

# Week 3 · Day 1 — Window functions: a total next to every row

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 60 min</span> <span class="badge">Homework</span> <span class="badge company">Company corner</span>

> STORY **Monday, 9:10.** Bekzod, portfolio manager (*портфельный менеджер*), has printed Friday's T2 and T5 and drawn percentages in the margin by hand. *"Two things I could not get from you last week. One: each branch's outstanding **and its share of the company**, in the same row — I keep dividing on a calculator. Two: each product's monthly disbursement with a **running year-to-date** next to it, so I can see where we are against the 2026 plan without summing a column in Excel."* Madina, from the next desk: *"That is the whole of today. By Wednesday he wants the pack."*

## Today in 3 lines

- A **window function** computes an aggregate *next to* each row instead of collapsing rows: `SUM(x) OVER ()` is the grand total on every line, `SUM(x) OVER (PARTITION BY product)` the product total.
- `ORDER BY` inside `OVER` turns the aggregate into a **running total**; `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` makes a **moving average**.
- You know when to use **GROUP BY**, when a **window**, and when **both** — and you have Bekzod's share-of-company and running-YTD columns.

---

## 1. Learn — the same aggregate, without losing the rows

### What a window is — an aggregate that keeps every row

**What it is.** A **window function** (*оконная функция*) computes an aggregate — a sum, an average, a count — over a set of rows and writes the answer **on every row**. `GROUP BY` folds the rows into one per group; a window keeps them all. The set of rows it adds up is the **window**.

**The small table used on this page.** Every window below is shown on these five payments first, so you can check each number by hand.

| `pay` | loan | month | amount |
|---|---|---|---|
| | A | 1 | 100 |
| | A | 2 | 200 |
| | A | 3 | 300 |
| | B | 1 | 50 |
| | B | 2 | 50 |

**How to write it.** The same `SUM`, once as an ordinary aggregate and once as a window:

```sql
WITH pay(loan, month, amount) AS (VALUES ('A', 1, 100), ('A', 2, 200), ('A', 3, 300), ('B', 1, 50), ('B', 2, 50))
SELECT SUM(amount) AS total FROM pay;
-- 1 row: 700
```

```sql
WITH pay(loan, month, amount) AS (VALUES ('A', 1, 100), ('A', 2, 200), ('A', 3, 300), ('B', 1, 50), ('B', 2, 50))
SELECT loan, month, amount,
       -- the word OVER makes SUM a window
       SUM(amount) OVER () AS total
FROM pay;
-- 5 rows, 700 on each
```

| loan | month | amount | total |
|---|---|---|---|
| A | 1 | 100 | 700 |
| A | 2 | 200 | 700 |
| A | 3 | 300 | 700 |
| B | 1 | 50 | 700 |
| B | 2 | 50 | 700 |

The first query returns one row: 700. The second returns all five payments, each with 700 beside it. Nothing was folded; the total was added as a column.

**When you use it.**
- A row's detail and a group's number in the same row: each loan with the company total, each payment with its loan's total.
- Anything that compares a row with its group: share of total, difference from the average, rank, running total.

**Your turn.** How many rows does `SELECT loan_id, SUM(principal) OVER () FROM loans` return? (`loans` has 7 828 rows.)

> 🎬 **Didn't get window functions?** [Baraa explains it · 5 min](https://youtu.be/SSKVgrwhzus?t=31839&end=32138)

### OVER () — one window over all the rows

**What it is.** `OVER ()` with **empty brackets** makes one window that contains every row of the result. The aggregate is computed once over all of them and written on each row.

**How to write it.**

```sql
SELECT loan_id, principal,
       -- aggregate(column) OVER ()
       SUM(principal)        OVER () AS company_total,
       ROUND(AVG(principal) OVER ()) AS company_avg,
       COUNT(*)              OVER () AS loans
FROM loans
ORDER BY loan_id
LIMIT 3;
```

| loan_id | principal | company_total | company_avg | loans |
|---|---|---|---|---|
| 1 | 31 150 000 | 404 783 280 000 | 51 709 668 | 7 828 |
| 2 | 40 060 000 | 404 783 280 000 | 51 709 668 | 7 828 |
| 3 | 1 590 000 | 404 783 280 000 | 51 709 668 | 7 828 |

Three rows on screen, but the window ran over all 7 828 loans: 404 783 280 000 is the whole company's principal. `LIMIT` cut the display after the window was computed.

**When you use it.**
- A grand total or company average next to every row.
- The denominator of a share (later in this section).

> ⚠️ **Watch out.** The window sees only the rows that survive `WHERE`. Add `WHERE customer_id = 3208` and `company_total` becomes 1 023 170 000 — the total of that customer's two loans. `OVER ()` means "all rows of *this* result", not "all rows of the table".

**Your turn.** Add `WHERE product_id = 5` (SME) to the query above. What does `company_total` show now?

> 🎬 **Didn't get OVER ()?** [Baraa explains it · 7 min](https://youtu.be/SSKVgrwhzus?t=32581&end=33009)

### PARTITION BY — one window per group

**What it is.** `PARTITION BY column` inside the brackets splits the rows into groups, one window per group. Each row gets the aggregate of **its own group**. The rows stay; only the window changes.

**How to write it.** On the small table:

```sql
WITH pay(loan, month, amount) AS (VALUES ('A', 1, 100), ('A', 2, 200), ('A', 3, 300), ('B', 1, 50), ('B', 2, 50))
SELECT loan, month, amount,
       -- one window per loan
       SUM(amount) OVER (PARTITION BY loan) AS loan_total
FROM pay;
```

| loan | month | amount | loan_total |
|---|---|---|---|
| A | 1 | 100 | 600 |
| A | 2 | 200 | 600 |
| A | 3 | 300 | 600 |
| B | 1 | 50 | 100 |
| B | 2 | 50 | 100 |

Loan A's three rows carry 600, loan B's two rows carry 100. On the real data:

```sql
SELECT l.loan_id, p.code, l.principal,
       ROUND(AVG(l.principal) OVER (PARTITION BY p.code)) AS product_avg,
       COUNT(*)               OVER (PARTITION BY p.code)  AS loans_in_product
FROM loans l
JOIN products p ON p.product_id = l.product_id
ORDER BY l.loan_id
LIMIT 5;
```

Loans 1 and 2 are Consumer loans, so both show the Consumer average, 26 926 915, and 2 418 loans in the product. Loan 3 is Micro: average 2 705 586, 2 669 loans.

**When you use it.**
- Each row with its group's number: each loan with its product's average, each payment with its loan's total.
- Several groupings at once: one column `OVER (PARTITION BY product_id)`, the next `OVER (PARTITION BY branch_id)`.

> ⚠️ **Watch out.** `PARTITION BY` is not `GROUP BY`. `GROUP BY p.code` returns 5 rows; `OVER (PARTITION BY p.code)` returns all 7 828. If you expected five rows and got 7 828, you wrote a partition where you meant a group.

**Your turn.** In the result above, how many loans are in loan 5's product (`loans_in_product`)?

> 🎬 **Didn't get PARTITION BY?** [Baraa explains it · 8 min](https://youtu.be/SSKVgrwhzus?t=33009&end=33497)

### ORDER BY inside OVER — a running total

**What it is.** `ORDER BY` inside the brackets puts the rows of each window in order. The aggregate then covers the rows **from the first one up to the current one**. A `SUM` becomes a **running total** (*накопительный итог*).

**How to write it.** On the small table:

```sql
WITH pay(loan, month, amount) AS (VALUES ('A', 1, 100), ('A', 2, 200), ('A', 3, 300), ('B', 1, 50), ('B', 2, 50))
SELECT loan, month, amount,
       -- restart per loan, add up in month order
       SUM(amount) OVER (PARTITION BY loan ORDER BY month) AS running
FROM pay;
```

| loan | month | amount | running |
|---|---|---|---|
| A | 1 | 100 | 100 |
| A | 2 | 200 | 300 |
| A | 3 | 300 | 600 |
| B | 1 | 50 | 50 |
| B | 2 | 50 | 100 |

Loan A climbs 100 → 300 → 600. Loan B starts again at 50: `PARTITION BY` restarts the sum for each loan. On the real data, loan 1's payments:

```sql
SELECT payment_id, paid_at, amount,
       SUM(amount) OVER (ORDER BY paid_at, payment_id) AS collected_so_far
FROM payments
WHERE loan_id = 1
ORDER BY paid_at;
```

18 rows. The running column grows by 1 741 700 at each payment and ends at 31 350 600 — everything loan 1 has paid by 1 October 2026. The step from 26 February to 25 April is the missed March instalment.

**When you use it.**
- Year-to-date, collected so far, cumulative disbursement.
- "Ever happened so far" with `MAX` instead of `SUM` (Day 3's vintages).

> ⚠️ **Watch out.** Two `ORDER BY`s do two different jobs. The one inside `OVER` decides the order of adding up. The one at the end of the query only sorts what you see. Without the inner one there is no running total, only the full sum on every row.

**Your turn.** Change `loan_id = 1` to `loan_id = 2` and run it. What is the running total on loan 2's last payment?

> 🎬 **Didn't get ORDER BY inside OVER?** [Baraa explains it · 4 min](https://youtu.be/SSKVgrwhzus?t=33497&end=33752)

> 🎬 **Didn't get running total?** [Baraa explains it · 10 min](https://youtu.be/SSKVgrwhzus?t=37917&end=38493)

### Window vs GROUP BY — the same sum, two shapes

**What it is.** `GROUP BY` and a window compute the same aggregate. The difference is the **shape of the result**: `GROUP BY` returns one row per group, a window returns every row with the group's number beside it.

| `GROUP BY loan` → 2 rows | loan | SUM(amount) |
|---|---|---|
| | A | 600 |
| | B | 100 |

| `SUM(amount) OVER (PARTITION BY loan)` → 5 rows | loan | month | amount | loan_total |
|---|---|---|---|---|
| | A | 1 | 100 | 600 |
| | A | 2 | 200 | 600 |
| | A | 3 | 300 | 600 |
| | B | 1 | 50 | 100 |
| | B | 2 | 50 | 100 |

**How to write it.** The two shapes on `loans`:

```sql
SELECT product_id, COUNT(*) AS loans
FROM loans
GROUP BY product_id;                                                -- 5 rows
```

```sql
SELECT loan_id, product_id, COUNT(*) OVER (PARTITION BY product_id) AS loans_in_product
FROM loans;
-- 7 828 rows
```

5 rows against 7 828 rows — the same counts (2 669, 2 418, 1 569, 391, 781), once folded and once written on every loan.

**When you use it.**

| You want | Use | Rows out |
|---|---|---|
| one number per group | `GROUP BY` | one per group |
| every row, with its group's number beside it | a window with `PARTITION BY` | all rows |
| one row per group **plus** a share or running total across groups | `GROUP BY` and a window on top | one per group |

**Your turn.** Bekzod wants **every loan with its product's average principal beside it**. Which do you write?

> 🎬 **Didn't get window function vs GROUP BY?** [Baraa explains it · 5 min](https://youtu.be/SSKVgrwhzus?t=32138&end=32451)

### SUM, AVG, COUNT, MIN, MAX as windows

**What it is.** Every ordinary aggregate works as a window: `SUM`, `AVG`, `COUNT(*)`, `COUNT(column)`, `MIN`, `MAX`. Put `OVER (…)` after it and it stops folding rows.

**How to write it.** Each loan against its product's smallest, largest and average loan:

```sql
SELECT l.loan_id, p.code, l.principal,
       MIN(l.principal)        OVER (PARTITION BY p.code) AS product_min,
       MAX(l.principal)        OVER (PARTITION BY p.code) AS product_max,
       ROUND(AVG(l.principal)  OVER (PARTITION BY p.code)) AS product_avg,
       -- a window inside arithmetic
       ROUND(l.principal - AVG(l.principal) OVER (PARTITION BY p.code)) AS vs_avg
FROM loans l
JOIN products p ON p.product_id = l.product_id
ORDER BY l.loan_id
LIMIT 5;
```

Loan 1 (Consumer, 31 150 000) sits between 3 110 000 and 49 990 000 and is 4 223 085 above the Consumer average. Loan 3 (Micro, 1 590 000) is 1 115 586 below the Micro average. A window is a number like any other: you can subtract, divide and round it.

**When you use it.**
- "How far is this row from its group?" — `x - AVG(x) OVER (…)`, `x / MAX(x) OVER (…)`.
- Group size beside each row — `COUNT(*) OVER (PARTITION BY …)`.

> ⚠️ **Watch out.** `COUNT(DISTINCT …) OVER (…)` is not allowed — SQLite stops with *DISTINCT is not supported for window functions*, and SQL Server refuses it too. Count distinct values with `GROUP BY` in a separate step, then join or window over that.

**Your turn.** In the query above, replace `ORDER BY l.loan_id LIMIT 5` with `ORDER BY vs_avg DESC LIMIT 1`. The top row is loan 2861, the largest SME loan. How far above the SME average is it (`vs_avg`, whole UZS)?

> 🎬 **Didn't get aggregate functions as windows (COUNT)?** [Baraa explains it · 6 min](https://youtu.be/SSKVgrwhzus?t=35222&end=35569)

> 🎬 **Didn't get SUM as a window?** [Baraa explains it · 4 min](https://youtu.be/SSKVgrwhzus?t=36349&end=36566)

### Share of total — value / SUM() OVER ()

**What it is.** A **share of total** (*доля от итога*) is a row's value divided by the total of all rows. The total comes from a window, so it sits in the same row as the value — no second query.

**How to write it.** Two forms, one per shape:

```sql
-- every row: a row's value / the window's total
SELECT loan_id, principal,
       ROUND(100.0 * principal / SUM(principal) OVER (), 4) AS share_pct
FROM loans ORDER BY principal DESC LIMIT 3;
-- loan 2861: 0.148 % of all principal
```

```sql
-- one row per group: GROUP BY first, then a window over the grouped rows
SELECT p.code,
       SUM(i.principal_due) AS outstanding,
       ROUND(100.0 * SUM(i.principal_due) / SUM(SUM(i.principal_due)) OVER (), 1) AS share_pct
FROM installments i
JOIN loans l    ON l.loan_id = i.loan_id
JOIN products p ON p.product_id = l.product_id
-- outstanding = principal of instalments not yet due
WHERE i.due_date > '2026-10-01'
GROUP BY p.code
ORDER BY outstanding DESC;
```

| code | outstanding | share_pct |
|---|---|---|
| SME | 125 892 942 411 | 60.3 |
| AUTO | 57 684 271 333 | 27.6 |
| CONS | 23 054 933 316 | 11.0 |
| BNPL | 1 135 251 000 | 0.5 |
| MICRO | 956 106 370 | 0.5 |

Five rows; the shares add to 100. SME holds 60.3 % of the 208 723 504 430 outstanding. Read `SUM(SUM(x)) OVER ()` from the inside out: the inner `SUM` is the `GROUP BY` aggregate, one value per product; the outer `SUM … OVER ()` adds those five values and writes the total on each row. The window runs **after** `GROUP BY`, on the grouped rows.

**When you use it.**
- Share of the company: `x / SUM(x) OVER ()`.
- Share inside a group: `x / SUM(x) OVER (PARTITION BY region)` — each region's branches add to 100.
- Share of count: `COUNT(*) / SUM(COUNT(*)) OVER ()`.

> ⚠️ **Watch out.** `principal / SUM(principal) OVER ()` divides two whole numbers, and integer division rounds every share down to 0. Start with `100.0 *` so the arithmetic is decimal.

**Your turn.** What share of all loans (by **count**) are Micro loans, in %, one decimal? Use `COUNT(*)` in the second form.

> 🎬 **Didn't get share of total?** [Baraa explains it · 4 min](https://youtu.be/SSKVgrwhzus?t=36568&end=36790)

### The frame — ROWS BETWEEN, and the default that lumps ties

(Animated explanation)
What the window reads: the frame
- Three rows in day order. A running total adds up a frame: from the first row to the current one. Row 1: 10.
- Row 2: the frame grows to rows 1–2. 10 + 20 = 30.
- Row 3: 10 + 20 + 5 = 35. `ROWS` counts row by row, whatever the day.
- Write only `ORDER BY` and you get the **default** frame, `RANGE`: it also takes every row with the **same** `ORDER BY` value as the current one.
- Look at the days in the picture.
- Under `RANGE`: 30, 30, 35. The total jumps a whole day at a time. On Nur's last week of September the two frames agree on only 7 of 77 loans — the last loan of each day.
- The fix: a tiebreaker (`, loan_id`) and `ROWS`. Row by row again: 10, 30, 35.
- A frame can have a fixed length: `2 PRECEDING AND CURRENT ROW` is three rows. April: (11.9 + 19.7 + 17.9) ÷ 3 = 16.5 bn.
- Press **Next row**: the frame slides down one month at a time, and each moving average is filled in.
- August is ringed. Before you press on, picture its frame.
- With `PARTITION BY loan` a frame never crosses into another loan: at loan B's first row it starts again — 50, not 650.

**What it is.** The **frame** (*рамка окна*) is the part of the window that the aggregate actually reads, counted from the current row. You set it with `ROWS BETWEEN <start> AND <end>`.

| Bound | Which row |
|---|---|
| `UNBOUNDED PRECEDING` | the first row of the window |
| `n PRECEDING` | n rows before the current one |
| `CURRENT ROW` | the current row |
| `n FOLLOWING` | n rows after the current one |
| `UNBOUNDED FOLLOWING` | the last row of the window |

**How to write it.** A running total with the frame spelled out:

```sql
SUM(amount) OVER (PARTITION BY loan ORDER BY month
                  -- from the first row to this one
                  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
```

When you write `ORDER BY` inside `OVER` and no frame, the engine uses a default: `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`. **RANGE** includes every row whose `ORDER BY` value equals the current one. With ties, the two frames differ:

| day | x | default (RANGE) | `ROWS UNBOUNDED PRECEDING` |
|---|---|---|---|
| 28 Sep | 10 | **30** | 10 |
| 28 Sep | 20 | 30 | 30 |
| 29 Sep | 5 | 35 | 35 |

On the real data, a running total of principal by disbursement date in the last week of September:

```sql
SELECT disbursed_at, loan_id, principal,
       -- default frame
       SUM(principal) OVER (ORDER BY disbursed_at)                               AS range_run,
       -- row by row
       SUM(principal) OVER (ORDER BY disbursed_at, loan_id ROWS UNBOUNDED PRECEDING) AS rows_run
FROM loans
WHERE disbursed_at >= '2026-09-24' AND disbursed_at < '2026-10-01'
ORDER BY disbursed_at, loan_id;
```

77 loans in seven days. `range_run` shows the same value on every loan of a day — the total through that date. `rows_run` climbs loan by loan. They agree only on the last loan of each day: 7 rows of 77.

**When you use it.**
- `ROWS` when you mean "through this row"; the default `RANGE` when you mean "through this value" (all loans of the day).
- A fixed-length frame for moving averages — the next subsection.

> ⚠️ **Watch out.** The default frame appears as soon as you write `ORDER BY` inside `OVER`. On a column with repeated values (dates, grades, rounded amounts) say `ROWS` and add a tiebreaker (`, loan_id`), or the running total jumps by a whole day at a time.

**Your turn.** The clauses inside `OVER` always come in the same order: partition, then order, then frame. Build one.

> 🎬 **Didn't get the window frame (ROWS BETWEEN)?** [Baraa explains it · 7 min](https://youtu.be/SSKVgrwhzus?t=33752&end=34150)

> 🎬 **Didn't get more frame examples and the default frame?** [Baraa explains it · 8 min](https://youtu.be/SSKVgrwhzus?t=34153&end=34604)

### Moving average — a frame of fixed length

**What it is.** A **moving average** (*скользящее среднее*) replaces each value by the average of itself and a fixed number of neighbours. `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` is a three-row frame that slides down the rows:

```text
month    disbursed
2026-06  16.1 bn  ┐
2026-07  20.7 bn  │ ← frame
2026-08  22.3 bn  ┘   for 2026-08
2026-09  17.0 bn

frame of the 3-month average
for 2026-08:
Jun + Jul + Aug, / 3 = 19.7 bn

next row: the frame moves down
one month
```

**How to write it.** Monthly disbursement first, then the average over it. `WITH m AS (…)` names a result so the next `SELECT` can read it like a table — Day 3 teaches it; read it as "first make `m`, then query it".

```sql
WITH m AS (
  -- SQL Server: FORMAT(disbursed_at, 'yyyy-MM')
  SELECT strftime('%Y-%m', disbursed_at) AS month, SUM(principal) AS disbursed
  FROM loans
  -- October has one day only: leave it out
  WHERE disbursed_at < '2026-10-01'
  GROUP BY strftime('%Y-%m', disbursed_at))
SELECT month, disbursed,
       ROUND(AVG(disbursed) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)) AS ma3,
       COUNT(*)            OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)  AS months_in_window
FROM m
ORDER BY month;
```

33 rows, January 2024 to September 2026. August 2026 reads 22 290 210 000 against a 3-month average of 19 678 126 667. The first two rows average fewer than three months: `months_in_window` shows 1 and 2.

**When you use it.**
- Smoothing a monthly series before you call a trend: 3 months (`2 PRECEDING`), 12 months (`11 PRECEDING`).
- A centred average: `ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING`.

> ⚠️ **Watch out.** A partial month poisons the average. With 1 October in the data, "October" is one day (852 760 000) and drags its 3-month average down by a third. Cut the series at the last full month before you smooth it.

**Your turn.** Which frame gives a **12-month** moving average (this month and the eleven before)?

> 🎬 **Didn't get moving average?** [Baraa explains it · 7 min](https://youtu.be/SSKVgrwhzus?t=38493&end=38920)

### Where a window may appear — SELECT and ORDER BY, not WHERE

**What it is.** A query is worked out in a fixed order. Windows are computed late: after `WHERE`, `GROUP BY` and `HAVING`. So a window may appear in `SELECT` and in `ORDER BY`, but not in `WHERE`, `GROUP BY` or `HAVING` — when those run, the window does not exist yet.

```text
FROM / JOIN
   ▼
WHERE         ✗
   ▼
GROUP BY      ✗
   ▼
HAVING        ✗
   ▼
windows       ✓
   ▼
SELECT        ✓
   ▼
ORDER BY      ✓
   ▼
LIMIT
```

**How to write it.** To filter on a window, compute it inside a query in brackets — a **derived table** — and filter outside:

```sql
SELECT COUNT(*) AS above_product_avg
FROM (SELECT l.loan_id, l.principal,
             -- step 1: the window, inside
             AVG(l.principal) OVER (PARTITION BY l.product_id) AS product_avg
      FROM loans l) AS t
WHERE principal > product_avg;
-- step 2: the filter, outside
```

3 919 loans are larger than their own product's average — about half of every product. `WITH t AS (…) SELECT … FROM t WHERE …` does the same; Day 3 explains both.

**When you use it.**
- "Rows above their group's average", "the top 3 per group" (tomorrow), "months that beat the previous one".
- Sorting by a window is allowed directly: `ORDER BY SUM(x) OVER (…) DESC`.

> ⚠️ **Watch out.** The order also explains the `WHERE` effect from `OVER ()`: `WHERE` decides which rows the window sees. Filter in `WHERE` when you want a smaller window; filter outside when you want the full window and fewer rows on screen.

**Your turn.**

> 🎬 **Didn't get where window functions are allowed?** [Baraa explains it · 3 min](https://youtu.be/SSKVgrwhzus?t=34619&end=34806)

### Putting it together

One request, five of today's tools. *"2026 monthly disbursement, January to September: each month's share of the nine months, the running year-to-date, the 3-month moving average, and the month as a % of the best month."*

```sql
WITH m AS (
  SELECT strftime('%Y-%m', disbursed_at) AS month, COUNT(*) AS loans, SUM(principal) AS disbursed
  FROM loans
  -- the nine full months
  WHERE disbursed_at >= '2026-01-01' AND disbursed_at < '2026-10-01'
  GROUP BY strftime('%Y-%m', disbursed_at))
SELECT month, loans, disbursed,
       -- share of total
       ROUND(100.0 * disbursed / SUM(disbursed) OVER (), 1)                         AS share_pct,
       -- running total
       SUM(disbursed) OVER (ORDER BY month ROWS UNBOUNDED PRECEDING)                AS ytd,
       -- moving average
       ROUND(AVG(disbursed) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)) AS ma3,
       -- MAX as a window
       ROUND(100.0 * disbursed / MAX(disbursed) OVER (), 1)                         AS pct_of_best
FROM m
ORDER BY month;
```

| month | loans | disbursed | share % | ytd | ma3 | % of best |
|---|---|---|---|---|---|---|
| 2026-01 | 287 | 17 452 370 000 | 10.8 | 17 452 370 000 | 17 452 370 000 | 78.3 |
| 2026-02 | 265 | 11 893 850 000 | 7.4 | 29 346 220 000 | 14 673 110 000 | 53.4 |
| … | | | | | | |
| 2026-08 | 358 | 22 290 210 000 | 13.8 | 144 464 810 000 | 19 678 126 667 | 100.0 |
| 2026-09 | 361 | 17 015 490 000 | 10.5 | 161 480 300 000 | 19 999 856 667 | 76.3 |

Nine rows, one per month: `GROUP BY` made them, the windows only added columns. `share_pct` and `pct_of_best` read all nine months (`OVER ()`); `ytd` reads January up to this month; `ma3` reads this month and the two before. The running total ends at 161 480 300 000 — the year to date through September. The `WHERE` keeps 1 October out; leave it in and "September YTD" quietly becomes 162.3 bn. (Here 2026 starts the series, so the first two moving averages cover only 1 and 2 months.)

**GROUP BY, a window, or both?**

### Depth (optional)

- ▶ Baraa, *Window functions basics* [8:50:11](https://youtu.be/SSKVgrwhzus?t=31811&end=35220), *Window aggregate* [9:47:00](https://youtu.be/SSKVgrwhzus?t=35220&end=39189) — ~2 h; SQL Server, every keyword identical here.
- RU deck (TBC Data Analytics 2.0, if you have it) `2.3 SQL.pdf` — window pages. *Russian terms:* оконные функции = window functions, секция = partition, рамка окна = frame, накопительный итог = running total, скользящее среднее = moving average.

---

## 2. Worked example — Bekzod's branch table (15 min)

**Ask:** *"Each branch's outstanding, its share of the company, its share of its region, and how much of the book the biggest branches hold together."* Each step is one concept from section 1, in the same order.

1. **Window vs GROUP BY — one row per branch.** The answer has ten rows, so the base is `GROUP BY` branch. One row before grouping is an instalment not yet due (outstanding, as in the share-of-total example); `loans → branches` is many-to-one and adds only the label.
2. **Share of total — `OVER ()`.** `SUM(SUM(x)) OVER ()` adds the ten branch totals and puts the company total on each row.
3. **PARTITION BY — share inside the region.** The same expression with `OVER (PARTITION BY b.region)`: each region's branches add to 100.
4. **ORDER BY inside OVER — a running share.** `SUM(SUM(x)) OVER (ORDER BY SUM(x) DESC)` adds the branches from the biggest down; divided by the total, it reads "the top N hold …".
5. **Check.** The shares add to 100.0, the outstanding to 208 723 504 430 (Friday's total), and the running share ends at 100.0.

```sql
SELECT b.branch_name, b.region,
       SUM(i.principal_due)                                                                             AS outstanding,
       -- step 2
       ROUND(100.0 * SUM(i.principal_due) / SUM(SUM(i.principal_due)) OVER (), 1)                      AS share_pct,
       -- step 3
       ROUND(100.0 * SUM(i.principal_due) / SUM(SUM(i.principal_due)) OVER (PARTITION BY b.region), 1) AS share_in_region,
       ROUND(100.0 * SUM(SUM(i.principal_due)) OVER (ORDER BY SUM(i.principal_due) DESC)
                   -- step 4
                   / SUM(SUM(i.principal_due)) OVER (), 1)                                              AS cum_share_pct
FROM installments i
JOIN loans l    ON l.loan_id = i.loan_id
JOIN branches b ON b.branch_id = l.branch_id
WHERE i.due_date > '2026-10-01'
-- step 1
GROUP BY b.branch_name, b.region
ORDER BY outstanding DESC;
```

| branch | outstanding | share % | share in region % | cumulative % |
|---|---|---|---|---|
| Tashkent Central | 28 716 674 373 | 13.8 | 35.2 | 13.8 |
| Tashkent South | 26 787 392 136 | 12.8 | 32.8 | 26.6 |
| Tashkent North | 26 175 671 562 | 12.5 | 32.0 | 39.1 |
| Fergana Central | 24 797 334 197 | 11.9 | 100.0 | 51.0 |
| Samarkand Central | 24 655 889 676 | 11.8 | 100.0 | 62.8 |
| Andijan Central | 19 798 392 956 | 9.5 | 100.0 | 72.3 |
| Namangan Central | 18 696 787 066 | 9.0 | 100.0 | 81.3 |
| Bukhara Central | 15 116 046 338 | 7.2 | 100.0 | 88.5 |
| Nukus Central | 13 309 138 567 | 6.4 | 100.0 | 94.9 |
| Termez Central | 10 670 177 559 | 5.1 | 100.0 | 100.0 |

Ten rows, five window expressions over three different windows: the whole company, the region, and "from the biggest branch down to this one". The share in region is only interesting in Tashkent, where three branches split the region almost evenly; elsewhere one branch is its region (100.0). The cumulative column answers Bekzod's last question: the three Tashkent branches hold **39.1 %** of the book. A share column is meaningless without *share of what* — here, three different "whats" side by side.

---

## 3. Practice (60 min)

Start with the lab: four steps on your own copy of the database, so the running total becomes a table you made. Then the questions, in the order of section 1 — the concept each one trains is in italics. Write each query in the box under its question — it is saved in this browser. **✔ Check** tells you whether your result matches the answer.

> 💡 **Key idea.** A table you make with `CREATE TABLE … AS SELECT` is frozen: add a new loan to `loans` tomorrow and `my_ytd` will not change. That is useful for a pack sent on Wednesday, and dangerous if someone reads the table next month. Day 4 is about this choice.

**P1.** *(OVER ())* Every loan with the company total, the company average and how many loans there are — on each row. Then the same for loans of customer 3208 only; explain why the total changed.

**P1 — why?** With `WHERE customer_id = 3208` the "company total" column drops from 404 783 280 000 to 1 023 170 000. Why?

**P2.** *(PARTITION BY)* Every loan with the number of loans and the average principal **of its branch** beside it (whole UZS), ordered by `loan_id`. How many loans does loan 1's branch have?

**P3.** *(ORDER BY inside OVER — running total)* Payments of loan 1 with each payment's share of the loan's total collected and the running collected amount, ordered by date. What does the running column show about April–May 2026?

**P4.** *(running total)* Schedule of loan 1: per instalment, cumulative principal due and the **remaining principal** after it (principal − cumulative principal). On which instalment does the remaining balance drop below half?

**P5.** *(PARTITION BY + ORDER BY — a running total per group)* Bekzod's second ask: per **product**, monthly 2026 disbursement with running YTD — the running sum must restart per product.

**P6.** *(window vs GROUP BY)* The number of loans per branch, twice: once with `GROUP BY`, once as a window beside every loan. How many rows does each return, and which number appears on both?

**P7.** *(MIN, MAX, AVG as windows)* Every Auto loan (`product_id = 4`) with the smallest, the largest and the average Auto principal beside it, and its distance from the average. Sort by the distance, largest first. Which loan is furthest above the average, and by how much?

**P8.** *(share of total)* Outstanding by **risk grade** with share of total, one decimal. Which grade carries the most money, and is that what the grade *counts* would suggest?

**P8 — read it.** What share of outstanding does grade D carry, in %, one decimal?

**P9.** *(share inside a group)* Outstanding by **product × grade** with the grade's share *inside its product*. In which product is grade C the largest share?

**P10.** *(a running total over GROUP BY)* Collected per month in 2026 (payments, from `payments`) with a running total — then say in one line why "collected YTD 125.7 bn" and "disbursed YTD 161.5 bn" are not comparable.

**P10 — why not comparable?** Pick every reason that is true.

**P11.** *(the frame — ROWS vs RANGE)* Loans disbursed 24–30 September 2026, one row per loan, with a running total of principal twice: the default frame (`ORDER BY disbursed_at`) and `ROWS UNBOUNDED PRECEDING` with `loan_id` as a tiebreaker. On how many of the rows do the two columns differ?

**P12.** *(moving average)* Three-month moving average of monthly disbursement for 2025-01 to 2026-09, plus the number of months in each window. Which month is furthest above its moving average?

**P13.** *(where a window may appear)* How many loans are **above their product's average** principal, per product? (Window in a derived table, filter outside.)

> 🚀 **Stretch (optional, +5 XP).** Concentration — the question a board asks right after the portfolio mix: *how much of the book hangs on a few names or a few branches?*

**P14.** *(putting it together)* Concentration curve of customers: rank borrowers by outstanding, and show the cumulative share of outstanding held by the top 10, top 25 and top 25 % of borrowers. Then the same idea for branches: how much of the book do the top three hold?

**P14 — the number.** What share of outstanding do the top three branches hold together, in %, one decimal?

---

## 4. Homework <span class="badge hw">HW 3.1 — Due Day 3</span>

**Bekzod's share-and-trend pack.** Six queries and six sentences, all in the 📎 box below. The page checks every query itself: **▶ Run** shows your result, **✔ Check** compares it with ours (without showing ours). No screenshots, no `-- result:` lines to copy — when all six are ✅ and the sentences are written, **📤 Submit** sends the pack to your mentor.

- **Q1–Q3 — shares** (`GROUP BY` + a window each), outstanding = `principal_due` of instalments due after 2026-10-01: Q1 by product with share of total; Q2 by branch with share of total **and** share in region; Q3 by grade with share of total. Shares to 1 decimal.
- **Q4–Q6 — trend:** Q4 2026 monthly disbursement (January–September) with running YTD and share of the nine months (section 1, Putting it together); Q5 the same per product, the running sum restarting per product (P5); Q6 the 3-month moving average of monthly disbursement 2025-01..2026-09 with the window-count column (P12) — the window runs on the whole series, the display filter sits outside.
- **pack.md** — six sentences for Bekzod: the biggest product and its share; the biggest branch and whether Tashkent as a region is concentrated; the YTD figure through September; the strongest and weakest months of 2026; the moving-average trend since spring; the month of 2025–2026 furthest above its moving average.

> ⚠️ **Watch out.** The checker runs your query on an untouched copy of the data, as one self-contained query: put the `WITH m AS (…)` part inside the same box, and do not rely on tables you created in the lab.

### 📎 Hand in here

---

## 5. Self-check

---

## 6. Company corner <span class="badge company">Portfolio mix</span>

**Portfolio mix** (*структура портфеля*) is the first page of any book review: *of what is the outstanding made?* Three cuts and a concentration check, all one pattern — `GROUP BY` plus `SUM(SUM()) OVER ()` — on the 208 723 504 430 UZS outstanding over 3 409 loans as of 2026-10-01.

| cut | the rows | reading |
|---|---|---|
| by **product** | SME **60.3 %** · Auto 27.6 · Consumer 11.0 · BNPL 0.5 · Micro 0.5 | 88 % of the money sits in two products that are 28 % of the owing loans (SME 603 + Auto 368 of 3 409). By *count* the book is Consumer/Micro/BNPL; by *money* it is a business-and-car lender. Say which one you mean. |
| by **branch** | Tashkent Central 13.8 % · South 12.8 · North 12.5 · Fergana 11.9 · Samarkand 11.8 · Andijan 9.5 · Namangan 9.0 · Bukhara 7.2 · Nukus 6.4 · Termez 5.1 | Flat: the biggest branch is 2.7× the smallest, no branch above 14 %. |
| by **grade** | B 44.7 % · C 27.0 · A 23.2 · D 5.1 | A+B = 68 % of the money; D is 5 % — the scorecard keeps the risky grade small in money as well as in count. |

**Concentration** (*концентрация*) asks a different question: *how much depends on a few?* Two standard numbers:

- **Top-3 branches' share** — the cumulative share after three rows of the branch table: `SUM(SUM(outstanding)) OVER (ORDER BY SUM(outstanding) DESC) / SUM(SUM(outstanding)) OVER ()` → 13.8 → 26.6 → **39.1 %**. That is the three Tashkent branches: 39 % of the book in one city. A regulator or a board reads this as *geographic concentration: one region = 39 %*; Bekzod reads it as *"the capital is a third of the business — nothing unusual for an Uzbek lender, but one Tashkent shock hits 39 % of the book."*
- **Biggest customer's share** — customer 3208 (Ulugbek Nazarov, SME segment, two SME loans of 568 200 000 and 454 970 000, both disbursed August 2026) owes 977 697 006 = **0.47 %** of outstanding. The top 10 customers together hold 3.6 %, the top 25 7.8 %. For a retail-and-SME book that is **low single-name concentration**: no borrower matters on his own. (A bank would also compare the largest exposure with its capital — the "large exposure" limit, typically 25 % of capital; we have no capital figure here, so the share of book is what we report.)

**How to present the mix.** One table, three cuts stacked, each with count share *and* money share side by side (count tells you about operations, money about risk); below it the two concentration lines. The sentence under the table: *"The book is 60 % SME by money and 41 % Consumer by count of owing loans; Tashkent's three branches hold 39 %; the largest borrower is 0.5 %, the top 25 under 8 %."*

> 🎯 **Interview version.** *"How would you describe a loan portfolio's composition in SQL?"* The interviewer listens for three things: how you define outstanding, the one-line share pattern, and how you would measure concentration. Say it in your own words below, then compare.

**Say it like in an interview.** Answer the question above as you would aloud, in 3–5 sentences, with one Nur Finance number.

Tomorrow: ranking (who is first, who is in the top 3 of each group), looking at the *previous* row with `LAG`, and the payments collections say they received twice.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 3 · Day 2 — Ranking and looking sideways: ROW_NUMBER, LAG and the duplicate payments (weeks/week-03/day-2.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-03/day-2
=====

# Week 3 · Day 2 — Ranking and looking sideways: ROW_NUMBER, LAG and the duplicate payments

<span class="badge">Learn 60 min</span> <span class="badge">Detective 30 min</span> <span class="badge">Practice 50 min</span> <span class="badge company">Company corner</span>

> STORY **Tuesday, 9:05.** Sevara arrives with a printed bank statement and two highlighter colours. *"Collections says we received money **twice** for some instalments — same day, same amount, same instalment. Finance says impossible, the system has unique payment IDs. I need the list, not an opinion. And while you look: for every late loan, I want to know whether it got **worse or better** since last month — Nilufar calls it roll rates and I call it 'did they pay'."* Madina: *"Also Bekzod wants the three biggest loans per product and each month against the month before. Same tools, as it happens."*

## Today in 3 lines

- **Ranking windows:** `ROW_NUMBER` (unique 1, 2, 3 …), `RANK` (ties share a number, then a gap), `DENSE_RANK` (ties, no gap), `NTILE(n)` (equal-sized groups) — and *top-N per group* with `PARTITION BY`.
- **Value windows:** `LAG`/`LEAD` read the previous/next row (difference from last month), `FIRST_VALUE`/`LAST_VALUE` read the edges of the partition (with the frame trap).
- You have found the **duplicate payments** (and know exactly how many there are) with `ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount)`, written a de-duplicated query without deleting anything, and produced the **roll-rate matrix** September → October.

---

## 1. Learn — numbering rows and reading neighbours

### ROW_NUMBER — number the rows 1, 2, 3 …

**What it is.** `ROW_NUMBER()` is a **ranking window function** (*функция ранжирования*). It gives the rows of each window the numbers 1, 2, 3 … in the order of the `ORDER BY` inside `OVER`. No two rows get the same number. With `PARTITION BY` the numbering restarts in every group.

**How to write it.**

```sql
SELECT customer_id, loan_id, disbursed_at,
       -- restart for every customer
       ROW_NUMBER() OVER (PARTITION BY customer_id
                          -- what "first" means; loan_id breaks ties
                          ORDER BY disbursed_at, loan_id)
       AS loan_no
FROM loans
WHERE customer_id = 1893
ORDER BY loan_no;
```

| customer_id | loan_id | disbursed_at | loan_no |
|---|---|---|---|
| 1893 | 458 | 2025-03-02 | 1 |
| 1893 | 4687 | 2025-03-03 | 2 |
| 1893 | 5050 | 2025-06-10 | 3 |
| … | | | |
| 1893 | 4952 | 2026-05-08 | 7 |

Seven rows: customer 1893 has seven loans, numbered in the order they were paid out. Loan 458 was the first, loan 4952 the seventh. The brackets after `ROW_NUMBER` stay empty — the function needs no column, only an order.

**When you use it.**
- "The first / second / latest X of each Y": a customer's first loan, a loan's latest payment.
- Exactly one row per group (`rn = 1`), even when values tie — the basis of top-N and de-duplication below.

> ⚠️ **Watch out.** Without a tiebreaker `ROW_NUMBER` numbers tied rows in any order, and the next run may choose another. End the window's `ORDER BY` with a unique column (`, loan_id`) so the result is the same every time.

**Your turn.** Number every customer's loans (no `WHERE`). How many customers have a **third** loan? Wrap the query and count the rows with `loan_no = 3` (Day 1: a window is filtered outside, in a derived table).

> 🎬 **Didn't get ROW_NUMBER?** [Baraa explains it · 4 min](https://youtu.be/SSKVgrwhzus?t=39482&end=39750)

### RANK and DENSE_RANK — what happens on a tie

(Animated explanation)
A tie: three ways to number rows
- Five loans, biggest first. Number them one row at a time with three functions. Row 1: all three say 1.
- Row 2, 700: second place everywhere — 2 · 2 · 2.
- The next row has the same principal.
- `ROW_NUMBER` never ties: it goes on to 3. `RANK` and `DENSE_RANK` both give the tie 2.
- Row 4, 500 — the difference. `RANK` jumps to 4: three rows are ahead of it. `DENSE_RANK` says 3: two **values** are ahead.
- Row 5: 5 · 5 · 4. `ROW_NUMBER`: always 1, 2, 3 … `RANK`: like a race, a gap after a tie. `DENSE_RANK`: no gaps.
- Pick the numbering that matches the question.
- When you need exactly **one** row per group — the latest loan of each customer — use `ROW_NUMBER` with a tiebreaker: `ORDER BY disbursed_at DESC, loan_id DESC`.

**What it is.** `RANK()` and `DENSE_RANK()` number rows like `ROW_NUMBER`, but rows with the **same value** (a tie, *равные значения*) get the **same number**. After a tie `RANK` skips numbers; `DENSE_RANK` does not.

**How to write it.** Five loans, two of them tied at 700:

```sql
WITH t(loan, principal) AS (VALUES (101, 900), (102, 700), (103, 700), (104, 500), (105, 400))
SELECT loan, principal,
       -- always unique
       ROW_NUMBER() OVER (ORDER BY principal DESC, loan) AS rn,
       -- ties share, then a gap
       RANK()       OVER (ORDER BY principal DESC)       AS rk,
       -- ties share, no gap
       DENSE_RANK() OVER (ORDER BY principal DESC)       AS drk
FROM t;
```

| loan | principal | ROW_NUMBER | RANK | DENSE_RANK |
|---|---|---|---|---|
| 101 | 900 | 1 | 1 | 1 |
| 102 | 700 | 2 | **2** | **2** |
| 103 | 700 | 3 | **2** | **2** |
| 104 | 500 | 4 | **4** | **3** |
| 105 | 400 | 5 | 5 | 4 |

Loan 104 is the fourth row. `RANK` calls it 4 (three rows are ahead of it); `DENSE_RANK` calls it 3 (two values are ahead of it). On the real data, BNPL loans by principal: four loans tie at the product's top amount, 7 990 000.

```sql
SELECT loan_id, principal,
       ROW_NUMBER() OVER (ORDER BY principal DESC, loan_id) AS rn,
       RANK()       OVER (ORDER BY principal DESC)          AS rk,
       DENSE_RANK() OVER (ORDER BY principal DESC)          AS drk
FROM loans
WHERE product_id = 3                                                -- BNPL
ORDER BY principal DESC, loan_id
LIMIT 7;
```

Rows 1–4 (loans 448, 2680, 4162, 5855) are all `RANK` 1 and `DENSE_RANK` 1. The fifth loan, 1112 at 7 980 000, is `RANK` **5** and `DENSE_RANK` **2**.

**When you use it.**

| Function | On a tie | Use it for |
|---|---|---|
| `ROW_NUMBER` | different numbers | exactly one row per group |
| `RANK` | same number, then a gap | a leaderboard: "two people share 2nd, nobody is 3rd" |
| `DENSE_RANK` | same number, no gap | "the top 3 **values**", however many rows share them |

**Your turn.**

> 🎬 **Didn't get RANK?** [Baraa explains it · 4 min](https://youtu.be/SSKVgrwhzus?t=39753&end=39995)

> 🎬 **Didn't get DENSE_RANK?** [Baraa explains it · 4 min](https://youtu.be/SSKVgrwhzus?t=39997&end=40262)

### NTILE — cut the rows into n equal groups

**What it is.** `NTILE(n)` splits the ordered rows into **n groups of (almost) equal count** and returns the group number, 1 to n. `NTILE(4)` gives quartiles, `NTILE(10)` deciles. When the rows do not divide evenly, the first groups get one row more.

**How to write it.** Borrowers in four groups by outstanding, largest first:

```sql
-- one row per borrower: outstanding as of 2026-10-01
WITH c AS (
  SELECT l.customer_id, SUM(i.principal_due) AS outstanding
  FROM installments i JOIN loans l ON l.loan_id = i.loan_id
  WHERE i.due_date > '2026-10-01'
  GROUP BY l.customer_id),
q AS (
  SELECT customer_id, outstanding, NTILE(4) OVER (ORDER BY outstanding DESC) AS quartile
  FROM c)
SELECT quartile, COUNT(*) AS borrowers, SUM(outstanding) AS outstanding,
       ROUND(100.0 * SUM(outstanding) / SUM(SUM(outstanding)) OVER (), 1) AS share_pct
FROM q
GROUP BY quartile
ORDER BY quartile;
```

| quartile | borrowers | outstanding | share % |
|---|---|---|---|
| 1 | 634 | 172 574 767 663 | 82.7 |
| 2 | 634 | 28 293 321 289 | 13.6 |
| 3 | 634 | 6 745 172 423 | 3.2 |
| 4 | 633 | 1 110 243 055 | 0.5 |

2 535 borrowers: 634, 634, 634 and 633 — equal **count**, the one leftover row in the first groups. The **money** is far from equal: the top quarter holds 82.7 % of the book.

**When you use it.**
- Quartiles and deciles for a "who are our customers by exposure" slide.
- Equal-sized test groups, score bands.

> ⚠️ **Watch out.** `NTILE` makes groups of equal *count*, not equal *width*. Quartile 1 runs from 99.7 m to 977.7 m, quartile 4 from 68 300 to 3.9 m. Show the minimum and maximum of each group next to its count. (`PERCENT_RANK()` and `CUME_DIST()` give a 0-to-1 position instead; you meet them as percentiles in week 6.)

**Your turn.** `NTILE(4)` over the ten values 1, 2, …, 10. How many rows land in group 1?

> 🎬 **Didn't get NTILE?** [Baraa explains it · 6 min](https://youtu.be/SSKVgrwhzus?t=41254&end=41630)

### LAG and LEAD — the previous and the next row

**What it is.** `LAG(column)` returns the value of `column` on the **previous** row of the window; `LEAD(column)` on the **next** row. "Previous" is decided by the `ORDER BY` inside `OVER`. They are **value window functions** (*функции смещения*): they do not aggregate, they look sideways.

**How to write it.**

```sql
-- offset: rows back (1 if left out); default: instead of NULL
LAG(column, offset, default) OVER (PARTITION BY … ORDER BY …)
```

Loan 1's payments, each with the one before and the one after:

```sql
SELECT payment_id, paid_at,
       LAG(paid_at)  OVER (PARTITION BY loan_id ORDER BY paid_at, payment_id) AS prev_paid,
       LEAD(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at, payment_id) AS next_paid,
       CAST(julianday(paid_at)
          -- SQL Server: DATEDIFF(day, the same LAG, paid_at)
          - julianday(LAG(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at, payment_id)) AS INTEGER) AS gap_days
FROM payments
WHERE loan_id = 1
ORDER BY paid_at;
```

18 rows. The first has no previous row, so `prev_paid` and `gap_days` are NULL; the last has no next row. The gaps run 31, 29, 29, 31, 35 … then **58** (26 February → 25 April, the missed March instalment), 17 and 14 — the catch-up.

The same tool compares a month with the month before (`LAG(x)`) and with the same month last year (`LAG(x, 12)`):

```sql
WITH m AS (SELECT strftime('%Y-%m', disbursed_at) AS month, SUM(principal) AS disbursed
           FROM loans WHERE disbursed_at < '2026-10-01' GROUP BY 1)
SELECT month, disbursed,
       LAG(disbursed) OVER (ORDER BY month) AS prev_month,
       ROUND(100.0 * (disbursed - LAG(disbursed) OVER (ORDER BY month))
             -- month on month
             / LAG(disbursed) OVER (ORDER BY month), 1)      AS mom_pct,
       ROUND(100.0 * (disbursed - LAG(disbursed, 12) OVER (ORDER BY month))
             -- year on year
             / LAG(disbursed, 12) OVER (ORDER BY month), 1)  AS yoy_pct
FROM m
ORDER BY month;
```

33 months. February 2026 reads −31.8 % month on month and +20.0 % year on year in the same row: a seasonal dip, not a decline. That is why both columns exist.

**When you use it.**
- Change against the previous period: month on month, year on year.
- Days since the previous event of the same customer or loan.
- `LEAD`: the next due date, the next status, "did anything happen after this?".

> ⚠️ **Watch out.** `LAG` can only look at rows that reached the window. Put the display filter `WHERE month >= '2026-01'` inside `m` and 2025 is gone before `LAG(…, 12)` runs: every `yoy_pct` becomes NULL. Filter the display in an outer query.

**Your turn.**

> 🎬 **Didn't get LAG and LEAD?** [Baraa explains it · 10 min](https://youtu.be/SSKVgrwhzus?t=43169&end=43790)

### FIRST_VALUE and LAST_VALUE — the edges of the window, and the frame trap

**What it is.** `FIRST_VALUE(column)` returns the value on the **first** row of the frame, `LAST_VALUE(column)` on the **last** row. Both write it on every row. They depend on the frame from Day 1 — and that is the trap.

**How to write it.**

```sql
SELECT paid_at,
       FIRST_VALUE(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at) AS first_payment,
       -- default frame: ends at this row
       LAST_VALUE(paid_at)  OVER (PARTITION BY loan_id ORDER BY paid_at) AS last_wrong,
       LAST_VALUE(paid_at)  OVER (PARTITION BY loan_id ORDER BY paid_at
                                  ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_payment
FROM payments
WHERE loan_id = 1;
```

18 rows. `first_payment` is 2025-04-27 on every row. `last_payment` is 2026-09-26 on every row. `last_wrong` equals each row's own date: with `ORDER BY` the default frame ends at the current row, so the "last" row of the frame is the row itself.

**When you use it.**
- A customer's first product, a loan's first and last payment, the opening and closing value of a period — beside every row.
- `FIRST_VALUE(x) OVER (… ORDER BY d DESC)` is the safe way to get the **latest** value.

> ⚠️ **Watch out.** `LAST_VALUE` with `ORDER BY` and no frame returns the current row. Spell out `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`, or use `FIRST_VALUE` with the order reversed.

**Your turn.** Which window gives every payment of a loan the date of the loan's **latest** payment?

> 🎬 **Didn't get FIRST_VALUE and LAST_VALUE?** [Baraa explains it · 6 min](https://youtu.be/SSKVgrwhzus?t=44712&end=45062)

### Top-N per group — ROW_NUMBER in a CTE, filter outside

**What it is.** **Top-N per group** (*топ-N в каждой группе*) keeps the N best rows of every group: the three biggest loans per product, the latest loan per customer. Number the rows inside each group with `ROW_NUMBER`, then keep the small numbers. The filter goes in an outer query, because a window does not exist yet in `WHERE`.

**How to write it.**

```sql
-- step 1: number the rows inside each product
WITH r AS (
  SELECT l.loan_id, p.code, l.principal, l.disbursed_at,
         ROW_NUMBER() OVER (PARTITION BY p.code ORDER BY l.principal DESC, l.loan_id) AS rn
  FROM loans l JOIN products p ON p.product_id = l.product_id)
-- step 2: keep the first three
SELECT * FROM r
WHERE rn <= 3
ORDER BY code, rn;
```

15 rows: three per product. SME's top three are loans 2861, 4570 and 4601 (599 060 000, 598 450 000, 597 540 000); Auto's are 1501, 1271 and 3382, just under 400 m. Every product's top loans sit just under its maximum amount: the limits bind.

Change `rn <= 3` to `rn = 1` and the window to `PARTITION BY customer_id ORDER BY disbursed_at DESC, loan_id DESC`: one row per customer, their **latest** loan — 4 335 rows.

**When you use it.**
- The N largest, newest or worst per group.
- One row per group (`rn = 1`): the latest status, the current address, the last payment.

> ⚠️ **Watch out.** `ROW_NUMBER` keeps exactly N rows even when the N-th value ties with the next. If tied rows must all stay ("every loan with one of the top three amounts"), use `DENSE_RANK() … <= 3` instead.

**Your turn.**

> 🎬 **Didn't get top-N per group?** [Baraa explains it · 3 min](https://youtu.be/SSKVgrwhzus?t=40350&end=40544)

### Duplicates — find them and keep one with ROW_NUMBER

**What it is.** A **duplicate** (*дубликат*) is a row that agrees with another row on **everything that defines sameness**, even if its id is different. Number the rows inside each group of "same" rows: row 1 is the original, every row numbered 2 or more is a repeat.

**How to write it.** Write the definition of sameness first; it becomes the `PARTITION BY`. Two customer rows with the same phone number:

```sql
WITH r AS (
  SELECT customer_id, first_name, last_name, phone,
         -- what makes two rows "the same"
         ROW_NUMBER() OVER (PARTITION BY phone
                            -- which one counts as the original: the lowest id
                            ORDER BY customer_id) AS rn
  FROM customers)
SELECT * FROM r
WHERE rn > 1  -- the repeats
ORDER BY customer_id;
```

43 rows — the same 43 pairs the self-join found in week 2 (customer 6005 repeats customer 44, *Yulduz Karimova*). To **keep one row of each**, flip the filter: `WHERE rn = 1` returns 5 997 customers, every phone once.

**Removing** them physically is the same list inside a `DELETE` — on your own copy only:

```sql
-- shape only: delete the repeats from a table of your own (the lab below does
-- it for real)
DELETE FROM my_table
WHERE id IN (SELECT id FROM (SELECT id, ROW_NUMBER() OVER (PARTITION BY … ORDER BY id) AS rn FROM my_table) t
             WHERE rn > 1);
```

**When you use it.**
- Data loaded twice, the same customer typed twice, a payment imported twice.
- A clean query or view (`rn = 1`) that every report reads, while the raw table stays as evidence.

| | `GROUP BY … HAVING COUNT(*) > 1` | `ROW_NUMBER() … rn > 1` |
|---|---|---|
| finds the duplicate **groups** | yes | yes |
| says **which row** to keep | no | yes — `rn = 1` |
| returns the clean rows | no | yes — `WHERE rn = 1` |

> ⚠️ **Watch out.** The `ORDER BY` inside the window decides which row survives. `ORDER BY customer_id` keeps the oldest id; `ORDER BY customer_id DESC` would keep the newest and delete the originals — the same count, the wrong rows.

**Your turn.** Sevara's payments: which `PARTITION BY` finds a payment that was imported twice (same instalment, same day, same amount, new `payment_id`)?

> 🎬 **Didn't get finding duplicates with ROW_NUMBER?** [Baraa explains it · 5 min](https://youtu.be/SSKVgrwhzus?t=40928&end=41229)

### Roll rates with LAG — from one snapshot to the next

**What it is.** A **roll rate** (*миграция между корзинами*) is the share of loans that moved from one DPD bucket at one date to another bucket at the next date. Stack the snapshots one under another — one row per loan per date — and `LAG(bucket)` puts the previous date's bucket on the same row.

| loan | asof | bucket | `LAG(bucket) OVER (PARTITION BY loan ORDER BY asof)` |
|---|---|---|---|
| 7 | 2026-09-01 | 1-30 | NULL |
| 7 | 2026-10-01 | 31-60 | 1-30 → rolled forward |
| 8 | 2026-09-01 | 1-30 | NULL |
| 8 | 2026-10-01 | 0 | 1-30 → cured |
| 9 | 2026-09-01 | 0 | NULL |
| 9 | 2026-10-01 | 1-30 | 0 → new late loan |

**How to write it.** Week 2's DPD rule, computed at two as-of dates at once, then `LAG`, then a count per from × to:

```sql
-- the two snapshot dates
WITH snaps(asof) AS (VALUES ('2026-09-01'), ('2026-10-01')),
-- matured instalments not fully paid, per date
unpaid AS (
  SELECT s.asof, i.loan_id, i.due_date
  FROM snaps s
  JOIN installments i ON i.due_date <= s.asof
  LEFT JOIN payments p ON p.installment_id = i.installment_id AND p.paid_at <= s.asof
  GROUP BY s.asof, i.installment_id, i.loan_id, i.due_date, i.total_due
  HAVING COALESCE(SUM(p.amount), 0) < i.total_due),
dpd AS (SELECT asof, loan_id, CAST(julianday(asof) - julianday(MIN(due_date)) AS INTEGER) AS dpd
        FROM unpaid GROUP BY asof, loan_id),
-- one row per loan per date; no unpaid instalment = DPD 0
b AS (
  SELECT s.asof, l.loan_id,
         CASE WHEN COALESCE(d.dpd, 0) = 0 THEN '0' WHEN d.dpd <= 30 THEN '1-30' WHEN d.dpd <= 60 THEN '31-60'
              WHEN d.dpd <= 90 THEN '61-90' ELSE '90+' END AS bucket
  FROM snaps s
  JOIN loans l ON l.disbursed_at < '2026-09-01'
  LEFT JOIN dpd d ON d.asof = s.asof AND d.loan_id = l.loan_id),
moves AS (SELECT asof, loan_id, bucket AS to_bucket,
                 -- last month's bucket, same row
                 LAG(bucket) OVER (PARTITION BY loan_id ORDER BY asof) AS from_bucket
          FROM b)
SELECT from_bucket, to_bucket, COUNT(*) AS loans,
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY from_bucket), 1) AS pct_of_from
FROM moves
WHERE asof = '2026-10-01' AND from_bucket <> '0'
GROUP BY from_bucket, to_bucket
ORDER BY from_bucket, to_bucket;
```

8 rows. Of the 128 loans in 1–30 on 1 September, 97 cured (75.8 %), 6 stayed and 25 rolled to 31–60 (19.5 %). All 17 loans in 61–90 reached 90+. The last line is Day 1's share inside a group: each from-bucket's rows add to 100.

**When you use it.**
- The collections report card: does 1–30 cure or roll?
- Any state that changes over time: status this month against last month, segment now against at signing.

> ⚠️ **Watch out.** The as-of date must sit in **both** places: the instalment filter (`due_date <= asof`) and the payment join (`paid_at <= asof`). Leave it out of the join and a payment made on 15 September counts on 1 September — loans look cured before they paid.

**Your turn.** In the matrix above, what share of the loans in 31–60 on 1 September had rolled to 61–90 by 1 October? (%, one decimal)

> 🎬 **Didn't get comparing with the previous row (LAG)?** [Baraa explains it · 7 min](https://youtu.be/SSKVgrwhzus?t=43790&end=44186)

### Putting it together

One request, several of today's tools. *"For every product: the latest loan, its principal against the loan before it, and whether it is in the product's top quarter by size."*

```sql
WITH r AS (
  SELECT l.loan_id, p.code, l.disbursed_at, l.principal,
         -- ROW_NUMBER
         ROW_NUMBER() OVER (PARTITION BY p.code ORDER BY l.disbursed_at DESC, l.loan_id DESC) AS newest_first,
         -- LAG
         LAG(l.principal) OVER (PARTITION BY p.code ORDER BY l.disbursed_at, l.loan_id)        AS prev_principal,
         -- NTILE
         NTILE(4) OVER (PARTITION BY p.code ORDER BY l.principal DESC)                          AS size_quartile
  FROM loans l JOIN products p ON p.product_id = l.product_id)
SELECT code, loan_id, disbursed_at, principal, prev_principal, size_quartile
FROM r
-- top-N, N = 1
WHERE newest_first = 1
ORDER BY code;
```

Five rows, one per product. SME's latest loan, 3368, was paid out on 1 October: 460 800 000, in the top quarter of SME loans by size, and more than five times the SME loan before it (82 430 000). Three windows in one CTE, each with its own `PARTITION BY` and `ORDER BY`: `ROW_NUMBER` picks the row, `LAG` reads its neighbour in date order, `NTILE` places it by size. The filter on `newest_first` sits outside, as always.

**Which window function?**

### Depth (optional)

- ▶ Baraa, *Window ranking* [10:53:09](https://youtu.be/SSKVgrwhzus?t=39189&end=42965), *Window value* [11:56:05](https://youtu.be/SSKVgrwhzus?t=42965&end=45634) — ~2 h.
- RU deck (TBC Data Analytics 2.0, if you have it) `2.3 SQL.pdf` — ranking and offset functions. *Russian terms:* ранжирование = ranking, функции смещения = offset functions (LAG/LEAD), дубликаты = duplicates.

---

## 2. Worked example — the money received twice (detective, 30 min)

Sevara's claim: *same instalment, same day, same amount, two payment rows.* Finance's defence: *payment_id is unique.* Each step uses one concept from section 1, in the same order.

**Step 1 — LAG: look for the clue.** Gaps between consecutive payments of the same loan, as in section 1, over all loans:

```sql
WITH g AS (
  SELECT loan_id,
         julianday(paid_at) - julianday(LAG(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at, payment_id)) AS gap
  FROM payments)
SELECT COUNT(gap) AS pairs, ROUND(AVG(gap), 1) AS avg_gap, SUM(CASE WHEN gap = 0 THEN 1 ELSE 0 END) AS same_day
FROM g;
-- 45 439 pairs · 30.9 days on average · 63 pairs paid on the same day
```

63 same-day pairs. Some are honest (two different instalments paid together), some may be Sevara's. Same day is a clue, not the definition.

**Step 2 — duplicates: define sameness, number the rows.** A duplicate is not two identical rows; it is two rows that **agree on everything that matters**: instalment, date, amount. That is the `PARTITION BY`; anything numbered 2 is a repeat:

```sql
WITH d AS (
  SELECT payment_id, loan_id, installment_id, paid_at, amount, method,
         ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn
  FROM payments)
SELECT * FROM d WHERE rn > 1 ORDER BY payment_id;
```

<details><summary>What you see</summary>

**25 rows**, 58 397 800 UZS counted twice. Their `payment_id`s are **52851–52875 — the last 25 rows of the table**, while their twins are spread from id 110 to 52 120 (distance 744 to 52 759). Dates 2024-08-30 to 2026-09-17, all methods (card 9, transfer 7, click 4, payme 3, cash 2). Reading: not 25 cashier mistakes over two years — a **batch** appended at the end, a re-import of 25 old transactions with new IDs. Finance is right that the IDs are unique and wrong that it proves anything. Cross-checks from week 2: 52 875 payments vs 52 850 distinct `installment_id` (difference 25), and 25 instalments paid *more* than their `total_due` by exactly one instalment.

</details>

> 💡 **Key idea.** A duplicate is not two identical rows — it is two rows that agree on **everything that defines sameness**. Write that definition down first (here: instalment, date, amount); it becomes the `PARTITION BY`.

**Step 3 — keep one: the de-duplicated query.** Never `DELETE` from the course tables (or from a production table on your own authority): the de-duplicated *query* is the deliverable, the raw table stays as evidence. Keep `rn = 1` — the earliest `payment_id` in each group:

```sql
WITH d AS (
  SELECT payment_id, loan_id, installment_id, paid_at, amount,
         -- week 2's cleaning, in the same pass
         REPLACE(LOWER(TRIM(method)), 'bank transfer', 'transfer') AS method,
         ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn
  FROM payments)
SELECT payment_id, loan_id, installment_id, paid_at, amount, method FROM d WHERE rn = 1;
-- 52 850 rows · 255 114 772 176 UZS (raw: 52 875 · 255 173 169 976) · 5 methods
```

<details><summary>Does it change anything downstream?</summary>

Rerun week 2's DPD block with this result in place of `payments`: still 1 784 unpaid matured instalments, still 14 / 124 / 25 / 16 / 234. Duplicates *add* money to instalments that were already paid, so DPD and the buckets do not move — but "collected in 2026" is overstated by the 2026 duplicates, 25 instalments show as overpaid, and any "collection rate" built on raw payments is slightly too good. Memo line for Sevara and Finance: *25 payments (ids 52851–52875) are exact repeats of earlier rows — same instalment, date and amount — appended as one batch; 58.4 m UZS double-counted in collections, no effect on delinquency; recommend a unique constraint on (installment_id, paid_at, amount) at load, and `v_payments_clean` (Thursday) for all reporting.*

</details>

Why `ROW_NUMBER` and not `GROUP BY … HAVING COUNT(*) > 1` (week 2's T21)? `HAVING` *finds* the groups; it cannot tell you *which row to keep*, and it cannot return the non-duplicate rows alongside. The window does both in one pass.

**Step 4 — removing them, on a table of your own.** On the course tables you never delete; on your own copy you may, and that is how you learn what `DELETE` with a `ROW_NUMBER` list does before you ever propose it to anyone.

> ⚠️ **Watch out.** `ORDER BY payment_id` inside the window decides which twin survives: the earliest id gets `rn = 1`. Flip it to `DESC` and you would keep the re-imported copies and delete the originals — the same count, the wrong rows.

---

## 3. Practice (50 min)

The questions follow the order of section 1; the concept each one trains is in italics. Write each query in the box under its question — it is saved in this browser. **✔ Check** tells you whether your result matches the answer.

**P1.** *(ROW_NUMBER)* Number every customer's loans in the order they were disbursed (ties by `loan_id`) and show the loans whose number is 1 — every customer's **first** loan. How many rows, and what is the product mix of first loans?

**P2.** *(RANK vs DENSE_RANK)* Branches ranked by outstanding with `ROW_NUMBER`, `RANK` and `DENSE_RANK`. Why do all three agree here, and what would make them differ?

**P2 — why?** All three columns agree on every branch. What would make them differ?

**P3.** *(RANK)* Rank collectors by promises obtained (`outcome = 'promise_to_pay'`) with `RANK`; show actions, promises and promise rate for the top five.

**P4.** *(NTILE)* Customer quartiles by outstanding (`NTILE(4)`) with count, money and share — then deciles. How much does the top 10 % hold?

**P4 — read it.** What share of outstanding does the top tenth of borrowers hold, in %, one decimal?

**P5.** *(LAG — month on month)* Monthly disbursement with month-on-month and year-on-year change for 2026-01..2026-09 (the display filtered *outside* the window). Which month fell most against the previous one and still grew year-on-year?

**P5 — read it.** Which month of 2026 fell most against the month before, and still grew year-on-year?

**P6.** *(LAG and LEAD on the schedule)* Per instalment of loan 1, the previous instalment's due date and the number of days between them (`LAG` on the schedule). Then over **all** loans: how many consecutive instalments are more than 31 days apart?

**P7.** *(LAG — gaps between payments)* Gaps between consecutive **payments** per loan: the average gap, the longest, how many exceed 60 days, and how many are exactly 0. Which of those four is the detective's number?

**P7 — the detective number.** How many consecutive payment pairs of the same loan are exactly 0 days apart?

**P8.** *(FIRST_VALUE)* For customers with at least two loans: the product of their **first** loan and of their **latest** loan (`FIRST_VALUE` twice, once in each order), counted as a from → to table. How many customers started with Micro and moved up to SME?

**P9.** *(top-N per group)* The three biggest loans per **branch** (loan, product, principal, disbursed). How many rows? Then change it to one row per customer — their latest loan — and give the status mix of those latest loans.

**P9 — count.** How many rows does the top-3-per-branch query return?

**P10.** *(duplicates)* Sevara's list, formatted: for each duplicate pair, one row with both payment ids, loan, instalment, date, amount, method — `MIN` and `MAX` of `payment_id` over the partition. Sorted by amount, largest first.

**P11.** *(duplicates — what is not a duplicate)* Payments of the same instalment on *different* days or with *different* amounts are not duplicates — they are partial payments. After removing the 25 duplicates, how many instalments have two or more distinct payments? (`COUNT(*) OVER (PARTITION BY installment_id)` on the de-duplicated set.)

**P11 — the number.** After removing the 25 duplicates, how many instalments have two or more distinct payments?

**P12.** *(roll rates with LAG)* One month is one data point. Build the same matrix as section 1 for **1 August → 1 September 2026** (snapshot dates `'2026-08-01'` and `'2026-09-01'`, loans disbursed before 1 August). What share of 1–30 rolled to 31–60 this time?

> 🚀 **Stretch (optional, +5 XP).** A median without a median function — the portable trick with two windows.

**P13.** *(ROW_NUMBER + COUNT as a window)* Median principal per product with `ROW_NUMBER` and `COUNT(*) OVER` (pick the middle row(s)). Compare with the average — where do they differ most?

---

## 4. Self-check

---

## 5. Company corner <span class="badge company">Roll rates</span>

A **roll rate** (*миграция между корзинами*) is the share of loans that moved from one DPD bucket to another between two snapshot dates — usually month-end to month-end. It is the collections team's report card (did 1–30 cure or roll to 31–60?) and the input to provisioning (a 90+ bucket is fed by what rolls out of 61–90). Section 1 built the matrix with `LAG` over stacked snapshots. Here is the other common way — the two snapshots side by side — and how to read the result. Three steps, two of them yesterday's tools:

**1. A snapshot per date.** Week 2's DPD block, with the as-of date as a *parameter* in two places — the instalment filter **and** the payment filter. The second was not needed on 2026-10-01 (the extract date), but on 2026-09-01 a payment made on 15 September must not count. (The two boxes in this corner are halves of one query, for reading: `u1` and `d1` are left as comments, so **▶ Run** stops with an error. The runnable version is section 1's roll-rate query, or P12.)

```sql
-- unpaid matured instalments as of 2026-09-01
WITH u0 AS (
  SELECT i.loan_id, i.due_date FROM installments i
  LEFT JOIN payments p ON p.installment_id = i.installment_id AND p.paid_at <= '2026-09-01'
  WHERE i.due_date <= '2026-09-01'
  GROUP BY i.installment_id, i.loan_id, i.due_date, i.total_due HAVING COALESCE(SUM(p.amount), 0) < i.total_due),
d0 AS (SELECT loan_id, CAST(julianday('2026-09-01') - julianday(MIN(due_date)) AS INTEGER) AS dpd FROM u0 GROUP BY loan_id),
u1 AS ( /* the same with '2026-10-01' */ ),
d1 AS ( /* the same */ ),
```

Snapshot 2026-09-01: **13 / 128 / 23 / 17 / 217** (398 loans). Snapshot 2026-10-01: 14 / 124 / 25 / 16 / 234 (413) — the familiar numbers. The 90+ bucket grew by 17; the question is from where.

**2. Join the two snapshots — on both sides.** A loan delinquent in September and cured by October is in `d0` only; a loan that became delinquent in September is in `d1` only. Neither join side may drop rows → `FULL OUTER JOIN` (SQLite 3.39+, SQL Server always); absent = DPD 0:

```sql
j AS (SELECT COALESCE(a.loan_id, b.loan_id) AS loan_id, COALESCE(a.dpd, 0) AS dpd0, COALESCE(b.dpd, 0) AS dpd1
      FROM d0 a FULL OUTER JOIN d1 b ON a.loan_id = b.loan_id),
k AS (SELECT loan_id,
             CASE WHEN dpd0 = 0 THEN '0' WHEN dpd0 <= 30 THEN '1-30' WHEN dpd0 <= 60 THEN '31-60' WHEN dpd0 <= 90 THEN '61-90' ELSE '90+' END AS from_bucket,
             CASE WHEN dpd1 = 0 THEN '0' WHEN dpd1 <= 30 THEN '1-30' WHEN dpd1 <= 60 THEN '31-60' WHEN dpd1 <= 90 THEN '61-90' ELSE '90+' END AS to_bucket, dpd0
      FROM j)
SELECT from_bucket, COUNT(*) AS loans,
       SUM(CASE WHEN to_bucket = '0' THEN 1 ELSE 0 END)     AS to_0,
       SUM(CASE WHEN to_bucket = '1-30' THEN 1 ELSE 0 END)  AS to_1_30,
       SUM(CASE WHEN to_bucket = '31-60' THEN 1 ELSE 0 END) AS to_31_60,
       SUM(CASE WHEN to_bucket = '61-90' THEN 1 ELSE 0 END) AS to_61_90,
       SUM(CASE WHEN to_bucket = '90+' THEN 1 ELSE 0 END)   AS to_90p
FROM k GROUP BY from_bucket ORDER BY MIN(dpd0);
```

**3. The transition matrix** (*матрица переходов*), counts and row-percentages (`100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY from_bucket)` in the long form):

| from \ to (1 Sep → 1 Oct) | 0 | 1–30 | 31–60 | 61–90 | 90+ | loans |
|---|---|---|---|---|---|---|
| **1–30** | 97 · **75.8 %** | 6 · 4.7 % | 25 · **19.5 %** | – | – | 128 |
| **31–60** | 6 · 26.1 % | 1 · 4.3 % | – | 16 · 69.6 % | – | 23 |
| **61–90** | – | – | – | – | 17 · 100 % | 17 |
| **90+** | – | – | – | – | 217 · 100 % | 217 |
| *new from 0* | | 117 | | | | 3 093 performing loans with a September instalment |

**Reading it.**

- **Roll-forward 1–30 → 31–60 = 19.5 %** (25 of 128). One in five early-delinquent loans got a month worse. **Cure 1–30 → 0 = 75.8 %**: three in four paid up — consistent with week 2's finding that late payers pay within 60 days. The 6 that "stayed" in 1–30 paid the old instalment and missed the next one.
- **31–60 rolls forward at 69.6 %** and cures at 26 %; **61–90 rolls to 90+ at 100 %** — nobody comes back from 61–90. That is the shape of a real book: the cure chance collapses with age, which is why Sevara's three collectors belong in 1–30 (week-2 T13) — the only bucket where effort changes the outcome.
- **90+ is absorbing** (217 → 217; plus the 17 arrivals = 234): nothing cures, nothing is written off *out* of the data in the month. In a bank the 90+ row would also have a "written off / recovered" exit column.
- **New entries:** 117 loans entered 1–30 from current — 3.8 % of the 3 093 performing loans that had an instalment due in September. That is the *inflow rate*; the matrix's first row is the *cure/roll* of the stock. Report both.
- The 13 loans at DPD 0 on 1 September (due that day) are left out of the matrix rows above: they were not late yet; they are part of the "from 0" population.

**What to say to Sevara:** *"Of 128 loans in 1–30 on 1 September, 97 cured (76 %), 25 rolled to 31–60 (20 %). Of 23 in 31–60, 16 rolled on (70 %). All 17 in 61–90 reached 90+. 117 new loans entered 1–30 (3.8 % of performing loans). Collections effort pays in 1–30 and barely after."* One month is one data point — build the same matrix for August → September before calling 19.5 % "the" roll rate.

> 🎯 **Interview version.** *"How do you compute roll rates?"* The interviewer listens for the two snapshots and where the as-of date goes, why the join must keep both sides, and how you turn counts into rates. Say it in the box below, then compare.

**Say it like in an interview.** Answer the question above in 3–5 sentences, as you would aloud, with one Nur Finance number.

Tomorrow: subqueries and CTE chains for real — the `WITH … AS` blocks you have been copying become yours — and Nilufar's vintage curves.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 3 · Day 3 — Subqueries, CTEs and the vintage curve (weeks/week-03/day-3.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-03/day-3
=====

# Week 3 · Day 3 — Subqueries, CTEs and the vintage curve

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 3.1 due</span> <span class="badge company">Company corner</span>

> STORY **Wednesday, 9:15.** Nilufar has a chart from a conference on her screen: curves climbing from left to right, one per month. *"Vintage analysis. For each disbursement month, the share of loans that have **ever** been 30+ days late, by month-on-book 1, 2, 3 … 6. Every risk committee in the world reads this chart; ours is drawn in Excel from a report nobody can reproduce. I want it from SQL, so that when I say 'October 2025 is our worst cohort' the number is the same next week."* Madina: *"You have been copying `WITH … AS` blocks for ten days. Today you write them."*

## Today in 3 lines

- A **subquery** is a query inside a query: **scalar** (one value), a **list** for `IN`, a **test** for `EXISTS`, or a **derived table** in `FROM`; **correlated** when it refers to the outer row.
- A **CTE** (`WITH name AS (…)`) is a named derived table; a **chain** of them is how you write a four-step analysis as four readable steps; **recursive** CTEs generate sequences — a month calendar.
- You know the `NOT IN` NULL trap and when `NOT EXISTS` is safer, and you have Nilufar's **vintage matrix**: 15 cohorts × 6 months-on-book.

---

## 1. Learn — queries inside queries

### Scalar subquery — one value, used like a constant

**What it is.** A **subquery** (*подзапрос*) is a query in brackets inside another query. A **scalar subquery** returns exactly one row and one column — one value. The engine runs it and uses the value wherever you could write a number.

**How to write it.**

```sql
SELECT COUNT(*) AS above_avg
FROM loans
WHERE principal > (SELECT AVG(principal) FROM loans);
-- (one value): 51 709 668
```

1 130 loans are larger than the company average of 51 709 668 — one loan in seven, because a few big SME and Auto loans pull the average up. A scalar subquery can also sit in `SELECT` as the denominator of a share:

```sql
SELECT p.code, COUNT(*) AS loans,
       -- the same 7 828 on every row
       ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM loans), 1) AS share_pct
FROM loans l JOIN products p ON p.product_id = l.product_id
GROUP BY p.code
ORDER BY loans DESC;
-- MICRO 34.1 · CONS 30.9 · BNPL 20.0 · SME 10.0 · AUTO 5.0
```

**When you use it.**
- One number to compare against or divide by: the average, the total, the as-of count.
- A number from a **different** table or filter than the outer query (the average SME loan, the number of approvals) — the case a window cannot do.

> ⚠️ **Watch out.** A scalar subquery must return one row. If it returns two, SQL Server stops with an error, and SQLite silently takes the first row. Make sure it is an aggregate (`AVG`, `COUNT`, `MAX`) or is filtered to one row.

**Your turn.** How many loans are larger than the **average SME loan** (`product_id = 5`)? One scalar subquery with its own `WHERE`.

> 🎬 **Didn't get a subquery in SELECT?** [Baraa explains it · 7 min](https://youtu.be/SSKVgrwhzus?t=48005&end=48432)

> 🎬 **Didn't get a subquery in WHERE?** [Baraa explains it · 7 min](https://youtu.be/SSKVgrwhzus?t=48740&end=49138)

### IN with a subquery — is the value in that list?

**What it is.** `IN (subquery)` is true when the value appears in the **list** the subquery returns. The subquery returns one column and any number of rows.

**How to write it.**

```sql
SELECT COUNT(*)
FROM customers
WHERE customer_id IN (SELECT customer_id              -- one column,
                      FROM loans
                      WHERE status = 'written_off');   -- many rows: the list
```

188 customers have at least one written-off loan. There are 190 written-off loans: two customers have two each. A `JOIN` to `loans` would return 190 rows; `IN` returns each customer once, however often they appear in the list.

**When you use it.**
- "X that appear in that set": customers with a write-off, loans of the app channel, branches in a list of regions.
- Membership without multiplying rows.

> ⚠️ **Watch out.** `NOT IN` breaks on a single NULL in the list. `x NOT IN (a, b, NULL)` means `x <> a AND x <> b AND x <> NULL`, and `x <> NULL` is unknown — so no row passes, silently:
>
> `WHERE disbursed_at NOT IN (SELECT closed_at FROM loans)` → **0** (closed_at has 3 601 NULLs) · with `WHERE closed_at IS NOT NULL` inside → **649**.
>
> Filter the NULLs out inside, or use `NOT EXISTS` (next).

**Your turn.** How many loans came through the **app** channel? The channel is on `applications`; use `application_id IN (…)`.

> 🎬 **Didn't get IN with a subquery?** [Baraa explains it · 8 min](https://youtu.be/SSKVgrwhzus?t=49138&end=49648)

**Try it.** The same test, with and without a NULL in the list:

```sql
SELECT 3 NOT IN (1, 2) AS without_null,
       3 NOT IN (1, 2, NULL) AS with_null;
-- 1 (true) · NULL (unknown)
```

3 is clearly neither 1 nor 2, yet one NULL in the list turns the answer into *unknown*. In a `WHERE`, every row would be lost.

### EXISTS and NOT EXISTS — is there at least one row?

**What it is.** `EXISTS (subquery)` is true when the subquery returns **at least one row**; `NOT EXISTS` when it returns none. What the rows contain does not matter, so the subquery usually says `SELECT 1`. The subquery mentions the outer row (`a.customer_id = c.customer_id`), so it is checked once per outer row.

**How to write it.** On the two small tables from week 2 — Aziz (1) has no application:

```sql
WITH cust(id, name) AS (VALUES (1, 'Aziz'), (2, 'Bekzod'), (3, 'Dilnoza')),
     app(app_id, cust_id, amount) AS (VALUES (101, 2, 500), (102, 3, 900), (103, 4, 120))
SELECT c.id, c.name
FROM cust c
WHERE NOT EXISTS (SELECT 1 FROM app a WHERE a.cust_id = c.id);  -- 1 row: Aziz
```

On the real data — staff who never handled an application:

```sql
SELECT s.role, COUNT(*) AS staff
FROM staff s
WHERE NOT EXISTS (SELECT 1 FROM applications a
                  WHERE a.officer_id = s.staff_id)  -- linked to the outer row
GROUP BY s.role;
```

Two rows: 10 branch managers and 30 collectors — 40 of the 100 staff. Every one of the 60 loan officers has handled at least one application, which is the check you wanted.

**When you use it.**

| | `NOT EXISTS` | `LEFT JOIN … WHERE right.key IS NULL` (week 2) |
|---|---|---|
| customers with no loan | 1 705 | 1 705 |
| a NULL on the other side | never matches — no trap | needs `IS NULL` on a column that is never NULL |
| can multiply rows | never | not in the anti-join, but yes if you drop the `IS NULL` filter |
| can show the other table's columns | no | yes |

Both give the same 1 705 customers. For "has none" `NOT EXISTS` usually reads better; when you also want columns from the other table, use the join.

> ⚠️ **Watch out.** Forget the link to the outer row (`WHERE l.customer_id = c.customer_id`) and the subquery asks "does **any** loan exist?" — always yes. `NOT EXISTS` then returns 0 rows, `EXISTS` returns every customer.

**Your turn.** How many of the ten branches have **no** written-off Auto loan? `NOT EXISTS` on `loans`, linked on `branch_id`, with `status = 'written_off' AND product_id = 4` inside.

> 🎬 **Didn't get EXISTS and NOT EXISTS?** [Baraa explains it · 12 min](https://youtu.be/SSKVgrwhzus?t=50660&end=51407)

### Derived table — a subquery in FROM

**What it is.** A **derived table** (*производная таблица*) is a subquery in `FROM`: its result is used as a table. It needs an alias, and every column needs a name.

**How to write it.**

```sql
SELECT loans_per_customer, COUNT(*) AS customers
-- step 1: one row per customer
FROM (SELECT customer_id, COUNT(*) AS loans_per_customer
      FROM loans
      -- the alias is required
      GROUP BY customer_id) AS t
-- step 2: one row per count
GROUP BY loans_per_customer
ORDER BY loans_per_customer;
```

| loans_per_customer | customers |
|---|---|
| 1 | 2 089 |
| 2 | 1 378 |
| 3 | 593 |
| 4 | 194 |
| 5 | 62 |
| 6 | 15 |
| 7 | 4 |

Seven rows: 2 089 borrowers have one loan, 4 have seven. 4 335 borrowers in all. The inner query **aggregates once** (per customer), the outer query **aggregates again** (per count) — two `GROUP BY`s in a row, which one query cannot do.

**When you use it.**
- Aggregate twice: per customer, then per count; per day, then the average day.
- Filter on a window (Day 1): the window goes inside, the `WHERE` outside.

> ⚠️ **Watch out.** A derived table without an alias works in SQLite but fails in SQL Server (*Incorrect syntax near ')'*). Always write `AS t`.

**Your turn.** What share of borrowers have exactly **one** loan? (%, one decimal — 2 089 of 4 335; or add a Day 1 share column to the outer query.)

> 🎬 **Didn't get a subquery in FROM?** [Baraa explains it · 13 min](https://youtu.be/SSKVgrwhzus?t=47250&end=48001)

### Correlated subquery — the inner query reads the outer row

**What it is.** A **correlated subquery** (*коррелированный подзапрос*) uses a column of the **outer** row, so its answer is different for every outer row. The `EXISTS` tests above were correlated. A scalar subquery can be too: "the limit of **this loan's** product".

**How to write it.**

```sql
SELECT COUNT(*)
FROM loans l
WHERE l.principal >= 0.99 * (SELECT p.max_amount
                             FROM products p
                             WHERE p.product_id = l.product_id);
                             -- l = the outer row: its own product
```

85 loans are within 1 % of their own product's maximum amount. Read it as: for each loan `l`, look up the limit of `l`'s product, then compare. The classic form compares a row with its own group — `l.principal > (SELECT AVG(x.principal) FROM loans x WHERE x.product_id = l.product_id)` gives 3 919, Monday's P13 without a window — but on our tables, which have no indexes yet, it reads 7 828 × 7 828 rows and takes seconds (Day 4).

**When you use it.**
- Compare a row with its own group under a **different filter**: "larger than the average *closed* loan of its product" — a window cannot change the filter.
- One-row lookups: the customer's largest loan, the latest payment date of this loan.

| | correlated subquery | window (Day 1) |
|---|---|---|
| comparison value visible in the output | no | yes |
| a different filter for the group | yes | no |
| work | conceptually once per outer row | one pass |

> ⚠️ **Watch out.** When inner and outer query read the same table, the aliases must differ (`l` and `x`). Write `WHERE product_id = product_id` and both sides mean the inner row: always true, and the subquery averages the whole table.

**Your turn.** How many loans are at least **90 %** of their product's maximum amount?

> 🎬 **Didn't get correlated subqueries?** [Baraa explains it · 10 min](https://youtu.be/SSKVgrwhzus?t=50027&end=50656)

### CTE — WITH name AS (…), and why it reads better

**What it is.** A **CTE** (common table expression, *обобщённое табличное выражение*) is a derived table with a **name**, written **before** the query that uses it: `WITH name AS (…) SELECT … FROM name`. It exists only for that one statement.

**How to write it.** The derived table from above, as a CTE:

```sql
-- the name, then the query in brackets
WITH per_customer AS (
  SELECT customer_id, COUNT(*) AS loans_per_customer
  FROM loans
  GROUP BY customer_id)
-- the main query uses the name like a table
SELECT loans_per_customer, COUNT(*) AS customers
FROM per_customer
GROUP BY loans_per_customer
ORDER BY loans_per_customer;
```

The same seven rows: 2 089, 1 378, 593 … 4. The work is identical; the order of reading changes. The derived table is read inside-out (the brackets first); the CTE is read top-down, step 1 then step 2, each with a name that says what one row is.

**When you use it.**
- Any query with a step a reader must understand on its own.
- The same result needed twice in one query (two snapshots from one base, a total and a breakdown).

| | Derived table | CTE |
|---|---|---|
| where | inside `FROM` | above the query, named |
| read | inside-out | top-down |
| use the result twice | write it twice | name it once, use it twice |
| lives | one query | one query |

> ⚠️ **Watch out.** A CTE lives for **one statement only** — the `SELECT` right after the `WITH`. Put a `;` after it and the next query cannot see the name (*no such table*). To reuse a result across queries you need a view or a table — Thursday. Two SQL Server habits: the statement before a `WITH` must end with `;` (so many people write `;WITH`), and a CTE, a view or a subquery may not end in `ORDER BY` unless it has `TOP` — sort in the final `SELECT`.

**Your turn.**

> 🎬 **Didn't get CTE?** [Baraa explains it · 8 min](https://youtu.be/SSKVgrwhzus?t=51494&end=51975)

> 🎬 **Didn't get a standalone CTE?** [Baraa explains it · 9 min](https://youtu.be/SSKVgrwhzus?t=52316&end=52842)

### A chain of CTEs — one grain per step

**What it is.** One `WITH` can define **several** CTEs, separated by commas. Each may use every CTE above it. A **chain** turns a long analysis into named steps, each with one **grain** — one thing that a row is.

**How to write it.** Outstanding per loan → per customer → customers by number of owing loans:

```sql
WITH per_loan AS (  -- step 1, grain: loan
  SELECT loan_id, SUM(principal_due) AS outstanding
  FROM installments
  WHERE due_date > '2026-10-01'
  GROUP BY loan_id),
-- step 2, grain: customer — built from step 1
per_customer AS (
  SELECT l.customer_id, COUNT(*) AS owing_loans, SUM(pl.outstanding) AS outstanding
  FROM per_loan pl
  JOIN loans l ON l.loan_id = pl.loan_id
  GROUP BY l.customer_id)
-- step 3, grain: number of owing loans
SELECT owing_loans, COUNT(*) AS customers,
       ROUND(AVG(outstanding)) AS avg_outstanding
FROM per_customer
GROUP BY owing_loans
ORDER BY owing_loans;
```

Six rows. 1 859 borrowers owe on one loan (63 340 783 on average); one borrower owes on six (701 901 165). One `WITH`, two names, a comma between them. Step 2 joins `loans` to 3 409 loan rows, not to 92 193 instalments — the grain was fixed in step 1, so nothing multiplies.

**When you use it.**
- Two or more levels of aggregation: instalment → loan → customer → answer.
- Week 2's cure for row multiplication: aggregate each table at its own grain, then join the aggregates.

> 💡 **Key idea.** A CTE chain is a recipe with one grain per step. If you can say in three words what one row of each step is, the chain is right; if you cannot, that step is where the numbers will multiply.

> ⚠️ **Watch out.** `WITH` is written once, at the top. The second CTE starts with a comma, not a second `WITH`: `WITH a AS (…), b AS (…)`.

**Your turn.** Put the pieces of a chain together — the words on the tiles are all you need.

> 🎬 **Didn't get several CTEs in one query?** [Baraa explains it · 8 min](https://youtu.be/SSKVgrwhzus?t=52842&end=53333)

> 🎬 **Didn't get a CTE inside a CTE?** [Baraa explains it · 8 min](https://youtu.be/SSKVgrwhzus?t=53333&end=53798)

### Recursive CTE — rows that are in no table

**What it is.** A **recursive CTE** (*рекурсивный CTE*) refers to **itself**. It starts from an **anchor** row and adds new rows from the last ones until a stop condition fails. It generates rows that exist in no table: a calendar, the numbers 1 to n.

**How to write it.**

```sql
-- SQL Server: no RECURSIVE keyword
WITH RECURSIVE months(month_start) AS (
  -- anchor: the first row
  SELECT '2025-01-01'
  UNION ALL
  -- recursive step: the next row from the last one
  SELECT date(month_start, '+1 month')
  -- SQL Server: DATEADD(month, 1, month_start)
  FROM months
  -- stop condition
  WHERE month_start < '2026-09-01')
SELECT COUNT(*), MIN(month_start), MAX(month_start) FROM months;
-- 21 · 2025-01-01 · 2026-09-01
```

21 rows: January 2025 to September 2026. Each pass adds one month while the last one is before September 2026. The numbers 1 to 6 work the same way: `WITH RECURSIVE k(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM k WHERE n < 6) SELECT n FROM k`.

**When you use it.**
- A complete calendar to `LEFT JOIN` counts onto, so a month with zero loans shows 0 instead of vanishing. In 2026 the branch × product × month grid has 450 cells and 16 are empty — invisible to a plain `GROUP BY` (P8).
- A sequence of numbers: months on book 1..6, buckets, test cases. (When a date table exists — our `dim_date` — `SELECT DISTINCT date(date_key, 'start of month') FROM dim_date …` is simpler.)

> ⚠️ **Watch out.** Without a stop condition the recursion never ends. SQLite runs until memory runs out; SQL Server stops after 100 levels (`OPTION (MAXRECURSION n)` changes it). Write the `WHERE` first.

**Your turn.** How many rows does this calendar have?

> 🎬 **Didn't get recursive CTE?** [Baraa explains it · 14 min](https://youtu.be/SSKVgrwhzus?t=54326&end=55147)

### The vintage table — built step by step

**What it is.** A **vintage** (*винтаж*, *поколение*) or **cohort** (*когорта*) is the set of loans disbursed in one month. A **vintage table** follows each cohort by its age in **months on book** (MOB, *месяц жизни*) — here, the instalment number — and shows the share of loans that have **ever** been 30+ days late by that age. Reading every cohort at the same age makes old and new cohorts comparable.

The trick is "ever": once a loan is late, it stays "ever late". A running `MAX` of a 0/1 flag (Day 1's running window) does exactly that:

At MOB 3: 1 of 2 loans ever late = 50 %.

**How to write it.** Four CTEs, one grain each, then the rate per MOB for the 2025 cohorts pooled:

```sql
-- grain: instalment — how much was paid within 30 days of due?
WITH inst AS (
  SELECT i.loan_id, i.installment_no, i.total_due,
         -- SQL Server: DATEADD(day, 30, i.due_date)
         COALESCE(SUM(CASE WHEN p.paid_at <= date(i.due_date, '+30 days') THEN p.amount END), 0) AS paid_by_30
  FROM installments i
  LEFT JOIN payments p ON p.installment_id = i.installment_id
  WHERE i.installment_no <= 6
    -- only instalments whose 30 days are over
    AND date(i.due_date, '+30 days') <= '2026-10-01'
  GROUP BY i.installment_id, i.loan_id, i.installment_no, i.total_due),
-- grain: instalment — 1 if 30+ late
flag AS (
  SELECT loan_id, installment_no, CASE WHEN paid_by_30 < total_due THEN 1 ELSE 0 END AS late30
  FROM inst),
-- grain: instalment — ever late so far (running MAX)
ever AS (
  SELECT loan_id, installment_no,
         MAX(late30) OVER (PARTITION BY loan_id ORDER BY installment_no) AS ever30
  FROM flag),
-- grain: loan — the cohorts we read
base AS (
  SELECT loan_id FROM loans
  WHERE term_months >= 6 AND disbursed_at >= '2025-01-01' AND disbursed_at < '2026-01-01')
SELECT e.installment_no AS mob, COUNT(*) AS observed, SUM(e.ever30) AS ever30,
       ROUND(100.0 * SUM(e.ever30) / COUNT(*), 2) AS rate_pct
FROM base b
JOIN ever e ON e.loan_id = b.loan_id
GROUP BY e.installment_no
ORDER BY mob;
```

| MOB | observed | ever 30+ | rate % |
|---|---|---|---|
| 1 | 2 347 | 34 | 1.45 |
| 2 | 2 347 | 67 | 2.85 |
| 3 | 2 347 | 102 | 4.35 |
| 4 | 2 347 | 129 | 5.50 |
| 5 | 2 347 | 150 | 6.39 |
| 6 | 2 347 | 175 | 7.46 |

2 347 loans of 2025 with at least six instalments, all observed at every MOB. By the sixth instalment 175 of them — 7.46 % — have been 30+ days late at least once. The curve only goes up, as a running `MAX` must. Add `strftime('%Y-%m', disbursed_at) AS cohort` to `base` and to the `GROUP BY`, and the same chain gives one curve per cohort (P9).

**When you use it.**
- Comparing cohorts at equal age: "is the new book cleaner than the old one?"
- Any "has it ever happened by step k": ever 30+, ever contacted, ever upgraded.

> ⚠️ **Watch out.** A cell where some loans are not yet old enough is not "nobody was late" — it is "not measured yet". Keep only instalments whose 30 days are over (the `WHERE` in `inst`), and leave a cell blank when not every loan of the cohort is observed (P10).

**Your turn.** At MOB 1 this table applies week 2's FPD30 rule (first payment 30+ days late) to these loans. Why does the rate at MOB 3 **have** to be at least the rate at MOB 2?

### Putting it together

One request, several of today's tools. *"Auto loans larger than the average SME loan, from customers who never had a loan written off — per year of disbursement, against the number of Auto loans that year."*

```sql
-- CTE: name the step
WITH big_auto AS (
  SELECT l.loan_id, strftime('%Y', l.disbursed_at) AS yr
  FROM loans l
  WHERE l.product_id = 4
    -- scalar subquery, its own filter
    AND l.principal > (SELECT AVG(principal) FROM loans WHERE product_id = 5)
    -- correlated NOT EXISTS
    AND NOT EXISTS (SELECT 1 FROM loans w
                    WHERE w.customer_id = l.customer_id AND w.status = 'written_off'))
SELECT yr, COUNT(*) AS big_auto_loans,
       -- correlated scalar subquery in SELECT
       (SELECT COUNT(*) FROM loans x
        WHERE x.product_id = 4 AND strftime('%Y', x.disbursed_at) = b.yr) AS auto_loans
FROM big_auto b
GROUP BY yr
ORDER BY yr;
```

Three rows, one per year. Each tool does one job: the CTE names the set, the scalar subquery brings a benchmark from another product, `NOT EXISTS` excludes customers by their history, and the correlated subquery in `SELECT` adds a denominator per year. Read the result: 17 of 82 Auto loans in 2024, 29 of 144 in 2025, 40 of 165 in 2026 — every year about one Auto loan in five is larger than the average SME loan.

**Which form, when?**

### Depth (optional)

- ▶ Baraa, *Subqueries* [12:58:04](https://youtu.be/SSKVgrwhzus?t=46684&end=51488), *CTE* [14:18:08](https://youtu.be/SSKVgrwhzus?t=51488&end=56102) — ~2 h 30; his recursive examples use SQL Server syntax (no `RECURSIVE` keyword, `MAXRECURSION` option).
- RU deck (TBC Data Analytics 2.0, if you have it) `2.4 SQL Advanced.pdf` — subqueries and the recursive CTE pages. *Russian terms:* подзапрос = subquery, обобщённое табличное выражение (ОТВ) = CTE, рекурсия = recursion, когорта/винтаж = cohort/vintage.

---

## 2. Worked example — lent to again after a write-off (15 min)

**Ask (Nilufar):** *"Customers who had a loan written off and later got another loan from us: how many, how much do they owe today, and is that more or less than a typical borrower?"* Each step is one concept from section 1, in the same order.

**Step 1 — scalar subquery: the benchmark.** "A typical borrower" = outstanding per owing borrower, one number:

```sql
SELECT (SELECT SUM(principal_due) FROM installments WHERE due_date > '2026-10-01')
     / (SELECT COUNT(DISTINCT l.customer_id)
        FROM installments i JOIN loans l ON l.loan_id = i.loan_id
        WHERE i.due_date > '2026-10-01') AS avg_per_borrower;
-- 208 723 504 430 / 2 535 = 82 336 688
```

**Step 2 — IN: who had a write-off.** `WHERE customer_id IN (SELECT customer_id FROM loans WHERE status = 'written_off')` → 188 customers. `IN` counts each once, even the two with two write-offs.

**Step 3 — derived table: the date of the first write-off, then the loans after it.** A loan is a *repeat loan* when it was disbursed after the customer's first written-off loan. One row per customer with that date, joined back to `loans`:

```sql
SELECT COUNT(*) AS repeat_loans, COUNT(DISTINCT l.customer_id) AS customers
FROM loans l
-- one row per customer with a write-off
JOIN (SELECT customer_id, MIN(disbursed_at) AS first_wo
      FROM loans
      WHERE status = 'written_off'
      GROUP BY customer_id) AS f
  ON f.customer_id = l.customer_id
 AND l.disbursed_at > f.first_wo;
 -- only the loans that came later
-- 145 repeat loans · 101 customers
```

The same set can be written as a correlated `EXISTS (SELECT 1 FROM loans w WHERE w.customer_id = l.customer_id AND w.status = 'written_off' AND w.disbursed_at < l.disbursed_at)` — 145 again, but it reads 7 828 × 7 828 rows on our unindexed tables. The derived table aggregates once and joins once.

**Step 4 — a chain of CTEs: what they owe, against the benchmark.** One grain per step: customer → repeat loan → customer who still owes → answer.

```sql
-- grain: customer with a write-off
WITH first_wo AS (
  SELECT customer_id, MIN(disbursed_at) AS first_wo
  FROM loans WHERE status = 'written_off' GROUP BY customer_id),
-- grain: loan disbursed after it
repeat_loans AS (
  SELECT l.loan_id, l.customer_id, l.status
  FROM loans l JOIN first_wo f ON f.customer_id = l.customer_id AND l.disbursed_at > f.first_wo),
-- grain: customer who still owes on a repeat loan
owed AS (
  SELECT r.customer_id, SUM(i.principal_due) AS outstanding
  FROM repeat_loans r
  JOIN installments i ON i.loan_id = r.loan_id
  WHERE i.due_date > '2026-10-01'
  GROUP BY r.customer_id)
SELECT COUNT(*) AS still_owing, SUM(outstanding) AS outstanding, ROUND(AVG(outstanding)) AS avg_outstanding
FROM owed;
-- 50 customers · 2 857 616 393 · 57 152 328 per customer
```

**Reading.** 101 customers were lent to again after a loan that was written off — 145 repeat loans. 50 of them still owe 2 857 616 393, about 57.2 m each: **69 %** of the typical borrower's 82.3 m. Of the 145 repeat loans, 81 are closed, 61 active, and only 3 went bad again (1 default, 2 written off). For Nilufar: *the re-lending is small, smaller per head than the book, and has not repeated the loss so far — but it is a policy question, not an accident, and the 61 active loans are the ones to watch.*

> 💡 **Key idea.** Each step answered one small question with one tool: a number (scalar subquery), a set (IN), an aggregate used as a table (derived table), and the steps glued together with names (CTE chain). That is how a vague request becomes a query you can defend.

---

## 3. Practice (50 min)

Start with the lab — you build a small vintage table on your own copy, step by step, with a CTE chain. Then the questions, in the order of section 1; the concept each one trains is in italics. Write each query in the box under its question — it is saved in this browser. **✔ Check** tells you whether your result matches the answer. Also due today: **HW 3.1** (Day 1's hand-in box).

**P1.** *(scalar subquery)* Loans larger than the average SME loan (scalar subquery), by product. Why is the answer not "all SME loans above average" only?

**P1 — read it.** How many Auto loans are larger than the average SME loan?

**P2.** *(IN and EXISTS)* Customers who have a written-off loan: once with `IN`, once with `EXISTS`. Same count? Which reads better when you also want to exclude customers with an *active* loan?

**P2 — the number.** How many customers have a written-off loan and no active loan?

**P3.** *(NOT IN vs NOT EXISTS)* The `NOT IN` trap, demonstrated: loans disbursed on a date on which no loan was closed, written three ways (NOT IN raw, NOT IN with `IS NOT NULL`, NOT EXISTS). Explain the 0.

**P3 — explain the 0.** Why does the first form return 0?

**P4.** *(derived table)* With a derived table: the distribution of **instalments per loan** (term) — how many loans have 3, 6, 12 … instalments — and check it against `term_months`.

**P5.** *(correlated subquery)* Each SME borrower's **largest SME** loan — count the rows, then explain why `WHERE principal = (SELECT MAX …)` gives exactly one row per SME borrower here and when it could give more.

**P5 — when more?** When could `= (SELECT MAX …)` return more than one row per customer?

**P6.** *(CTE)* Rewrite P4's derived table as a CTE named `per_loan`, and add each count's share of all loans (%, one decimal). Which term is the most common?

**P7.** *(a chain of CTEs)* A CTE chain in four steps: (1) outstanding per loan, (2) outstanding per customer, (3) the customer's rank, (4) the top 10 with name and segment. One `WITH`, four names.

**P8.** *(recursive CTE)* Recursive calendar 2026-01..2026-09 × products × branches, `LEFT JOIN` the monthly disbursement counts. How many empty cells, and for which products?

**P8 — count.** How many of the 450 branch × product × month cells of 2026 are empty?

**P9.** *(the vintage table)* Nilufar's matrix, long form: cohort × MOB → loans observed, ever-30+ count, rate — for cohorts 2025-01..2026-03, loans with `term_months >= 6`. Which cohort is worst at MOB 3?

**P9 — name it.** Which cohort is worst at MOB 3? Write it as `YYYY-MM`.

**P10.** *(the vintage table — observable cells)* Pivot P9 to wide (MOB 1..6 as columns, `SUM(CASE WHEN installment_no = k THEN ever30 END) / SUM(installment_no = k)`), and make a cell **NULL when not every loan of the cohort is observable** at that MOB. Which cells go blank?

**P10 — which cells?** Which cells of the wide matrix go blank?

**P11.** *(the vintage table — by grade)* Vintage curve pooled by **grade** instead of by month (2025-01..2026-03, term ≥ 6): rate at MOB 1, 3, 6. Does the scorecard order the curves?

**P11 — read it.** What does the grade table say about the scorecard?

> 🚀 **Stretch (optional, +5 XP).** Longer curves need a stricter base — here you see what happens when cohorts of different ages are pooled.

**P12.** *(putting it together)* Build the calendar with `dim_date` instead of recursion, and extend the vintage chain to MOB 1..12 for the 2025 cohorts. At which MOB does the pooled 2025 curve pass 10 %?

**P12 — the number.** On the cohorts observable at MOB 12, at which MOB does the curve pass 10 %?

---

## 4. Self-check

---

## 5. Company corner <span class="badge company">Vintage curves</span>

A **vintage** (*винтаж*) is the set of loans disbursed in one month; a **vintage curve** follows each vintage over its life, measured in **months on book** (MOB, *месяц жизни*) rather than calendar time. Because every cohort is read at the same age, a January and an October cohort become comparable even though one is nine months older. Our definitions, written on the slide:

- **Cohort** = month of `disbursed_at`; **MOB k** = instalment k (our schedules are monthly, so instalment number is age).
- **Ever 30+ by MOB k** = at least one of instalments 1..k was **not fully paid 30 days after its due date**, as of 2026-10-01.
- **Base:** loans with `term_months >= 6` (so every loan has all six instalments); a cell is shown only when **all** of the cohort's loans have had their 30 days at that MOB.

The query below writes section 1's three CTEs as `( … )` to save space: paste them in from section 1 (or from the lab) before you press **▶ Run**.

```sql
-- section 1's vintage chain
WITH inst AS ( … ), flag AS ( … ), ever AS ( … ),
base AS (SELECT loan_id, strftime('%Y-%m', disbursed_at) AS cohort FROM loans
         WHERE term_months >= 6 AND disbursed_at >= '2025-01-01' AND disbursed_at < '2026-04-01'),
cells AS (SELECT b.cohort, e.installment_no AS mob, COUNT(*) AS observed, SUM(e.ever30) AS ever,
                 (SELECT COUNT(*) FROM base x WHERE x.cohort = b.cohort) AS cohort_size
          FROM base b JOIN ever e ON e.loan_id = b.loan_id GROUP BY b.cohort, e.installment_no)
SELECT cohort, MAX(cohort_size) AS loans,
       MAX(CASE WHEN mob = 1 AND observed = cohort_size THEN ROUND(100.0 * ever / observed, 2) END) AS mob1,
       MAX(CASE WHEN mob = 2 AND observed = cohort_size THEN ROUND(100.0 * ever / observed, 2) END) AS mob2,
       MAX(CASE WHEN mob = 3 AND observed = cohort_size THEN ROUND(100.0 * ever / observed, 2) END) AS mob3,
       MAX(CASE WHEN mob = 4 AND observed = cohort_size THEN ROUND(100.0 * ever / observed, 2) END) AS mob4,
       MAX(CASE WHEN mob = 5 AND observed = cohort_size THEN ROUND(100.0 * ever / observed, 2) END) AS mob5,
       MAX(CASE WHEN mob = 6 AND observed = cohort_size THEN ROUND(100.0 * ever / observed, 2) END) AS mob6
FROM cells GROUP BY cohort ORDER BY cohort;
-- SQL Server: identical except DATEADD(day, 30, i.due_date) in inst and
-- FORMAT(disbursed_at, 'yyyy-MM') in base
```

| cohort | loans | MOB 1 | MOB 2 | MOB 3 | MOB 4 | MOB 5 | MOB 6 |
|---|---|---|---|---|---|---|---|
| 2025-01 | 151 | 0.66 | 0.66 | 1.99 | 2.65 | 3.31 | 5.30 |
| 2025-02 | 154 | 1.30 | 1.95 | 3.90 | 7.14 | 7.79 | 7.79 |
| 2025-03 | 161 | 2.48 | 3.11 | 5.59 | 7.45 | 8.07 | 9.94 |
| 2025-04 | 173 | 2.31 | 2.89 | 2.89 | 4.05 | 5.78 | 6.94 |
| 2025-05 | 185 | 1.08 | 3.24 | 5.41 | 5.95 | 6.49 | 7.03 |
| 2025-06 | 204 | 0.00 | 2.94 | 3.43 | 4.41 | 5.88 | 6.37 |
| 2025-07 | 237 | 0.00 | 1.69 | 4.64 | 5.91 | 6.33 | 7.17 |
| 2025-08 | 210 | 2.38 | 3.81 | 3.81 | 5.24 | 5.71 | 6.67 |
| 2025-09 | 193 | 1.55 | 4.15 | 5.70 | 6.22 | 7.25 | 7.25 |
| **2025-10** | 217 | 2.76 | 4.15 | **6.91** | 8.76 | 9.68 | **11.52** |
| 2025-11 | 226 | 2.65 | 3.10 | 3.54 | 3.98 | 6.19 | 7.52 |
| 2025-12 | 236 | 0.42 | 2.12 | 3.81 | 4.24 | 4.24 | 5.93 |
| 2026-01 | 218 | 0.46 | 2.75 | 2.75 | 3.67 | 5.05 | 6.42 |
| 2026-02 | 210 | 0.48 | 1.90 | 3.81 | 4.76 | 5.24 | 6.19 |
| 2026-03 | 251 | 0.00 | 1.99 | 3.98 | 5.18 | — | — |

**Reading it.**

- **Curves only go up** (a running `MAX` cannot fall) — if a row ever decreases, the query is wrong. Every row here is monotonic.
- **Compare down a column, not across a row.** At MOB 3 the cohorts range from 1.99 % (2025-01) to **6.91 % (2025-10)**; at MOB 6 from 5.30 % to **11.52 %**, again October 2025. That is Nilufar's sentence, now reproducible: *October 2025 is the worst cohort at every age from MOB 3 on — 3.5× January 2025 at MOB 3.*
- **Why equal MOB matters:** by calendar time the 2026-03 cohort (3.98 % at MOB 3) looks better than 2025-03 (9.94 % at MOB 6). It is not better — it is **younger**. Read 2025-03 at MOB 3: 5.59 %, against 3.98 % — now the comparison is fair, and 2026 *is* somewhat better. Every "the new book is cleaner" claim must survive this check.
- **What is in October 2025?** Its grade mix is normal (35.0 % C+D vs 34.5 % elsewhere), so it is not a looser cut-off. The 25 ever-late loans at MOB 6 are mostly Consumer C (6 of 26 such loans) and BNPL C (4 of 18) — a product-and-grade pocket, worth a look at which branch and officer wrote them. Today 17 of its 217 loans are default or written off, against 3 of 151 for January 2025.
- **Small cells move a lot:** one loan in a 151-loan cohort is 0.66 points — the whole of January's MOB 1 and 2. Read the curve, not a single cell; pool by quarter when you must compare cells.
- **Blank cells are honest:** 2026-03 at MOB 5–6 is not yet observable (250 of 251 and 5 of 251 loans have had their 30 days). Never print 0.00 there.

**The chart Nilufar draws:** MOB on the x-axis (1..6), ever-30+ % on the y-axis, one line per cohort, the worst one coloured. The pooled 2025 line — 1.45 → 2.85 → 4.35 → 5.50 → 6.39 → 7.46 % — is the benchmark every new cohort is read against at equal age. MOB 1 of this chart *is* FPD30: run the chain's MOB-1 step on FPD30's own base (every loan whose first instalment fell due by 2026-09-01) and you get the same 91 of 7 099 = 1.28 %; the 1.45 % above is the 2025, term ≥ 6 subset. That is how the two reports reconcile.

> 🎯 **Interview version.** *"How do you build a vintage analysis in SQL?"* The interviewer listens for the definitions (cohort, age, "ever"), the observability rule and how you check the result. Say it in the box below, then compare.

**Say it like in an interview.** Answer the question above in 3–5 sentences, as you would aloud, with one Nur Finance number.

Tomorrow: the three `WITH` blocks you now own become **views** — a clean layer Timur can point Power BI at — and we make them fast.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 3 · Day 4 — Views, temp tables and making it fast (weeks/week-03/day-4.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-03/day-4
=====

# Week 3 · Day 4 — Views, temp tables and making it fast

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge">Homework</span> <span class="badge company">Company corner</span>

> STORY **Thursday, 9:00.** Timur, BI (*BI-специалист*), with a laptop full of Power BI tabs. *"Every tile on my dashboard has its own copy of your DPD logic, pasted by a different person in a different year. Three of them disagree. Give me a **clean layer**: `v_loan_status` — one row per loan with DPD, bucket, outstanding and days on book; `v_portfolio_monthly` — one row per month × product × branch with disbursed count, amount and outstanding; `v_payments_clean` — de-duplicated, method normalised. I point Power BI at those three and delete everything else. And it has to refresh in seconds, not minutes."*

## Today in 3 lines

- A **view** is a saved query with a name: it hides joins and definitions, so one DPD rule serves every report — this is the warehouse layer week 7's Power BI will read.
- **Materialise** (`CREATE TABLE … AS SELECT`, `SELECT INTO`, temp tables) when a view is slow or must be frozen at a date; **indexes** turn a full-table *scan* into a *seek*, and you can see which happened in the **execution plan**.
- You know the **10 performance habits** that matter for analysts and have written Timur's three views.

---

## 1. Learn — saving the query, not the data

### What a view is — a saved query with a name

**What it is.** A **view** (*представление*) is a `SELECT` saved in the database under a name. You query it like a table: `SELECT … FROM v_payments_clean`. It stores the **text of the query**, not its rows. Every time you read it, the query inside runs again on today's data.

**How to write it.** Tuesday's de-duplicated payments, saved as a view, then read like a table:

```sql
CREATE VIEW v_payments_clean AS
WITH ranked AS (
  SELECT payment_id, loan_id, installment_id, paid_at, amount,
         REPLACE(LOWER(TRIM(method)), 'bank transfer', 'transfer') AS method,
         ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn
  FROM payments)
SELECT payment_id, loan_id, installment_id, paid_at, amount, method FROM ranked WHERE rn = 1;

SELECT COUNT(*), SUM(amount), COUNT(DISTINCT method) FROM v_payments_clean;
-- 52 850 · 255 114 772 176 · 5
```

52 850 rows, 255 114 772 176 UZS, 5 payment methods — the 52 875 raw payments without the 25 duplicates, with the method cleaned. Timur now sees six clean columns; the `ROW_NUMBER` and the cleaning live inside the view.

**When you use it.**
- **One definition** shared by every report: the duplicate rule lives in one place; fix it once and every report changes.
- **A simpler surface**: a dashboard reads `v_loan_status` instead of three joins and a CTE.
- **Hiding columns**: a view can show `region` and leave out `phone`.

> ⚠️ **Watch out.** A view is not faster than the query inside it — reading it **is** running that query. If the query takes 2 seconds, so does every read of the view.

**Your turn.** A payment is added to `payments` tonight. Tomorrow you run `SELECT COUNT(*) FROM v_payments_clean`. What do you see?

> 🎬 **Didn't get views?** [Baraa explains it · 9 min](https://youtu.be/SSKVgrwhzus?t=56724&end=57243)

### CREATE VIEW and DROP VIEW

**What it is.** `CREATE VIEW name AS SELECT …` saves a query under a name. `DROP VIEW name` removes the name; the tables underneath are not touched. A view cannot be edited in place in SQLite: you drop it and create it again.

**How to write it.**

```sql
-- the shape
-- a name: v_… for views, so nobody mistakes it for a table
CREATE VIEW view_name AS
SELECT …;                       -- any SELECT: joins, GROUP BY, windows, CTEs
DROP VIEW IF EXISTS view_name;  -- removes the saved query, never the data
```

A view of your own, made so the box can run twice (`DROP … IF EXISTS` first):

```sql
-- your own view, in your practice copy
DROP VIEW IF EXISTS my_v_written_off;
CREATE VIEW my_v_written_off AS
SELECT loan_id, customer_id, product_id, principal
FROM loans
WHERE status = 'written_off';
SELECT COUNT(*) AS loans, SUM(principal) AS principal FROM my_v_written_off;
-- 190 · 10 022 040 000
```

190 written-off loans with 10 022 040 000 of principal. The view now appears in the **Database** panel next to the tables; `DROP VIEW my_v_written_off` removes it again.

**When you use it.**
- `CREATE VIEW` once a query is used by more than one report or person.
- Changing a view: `DROP VIEW` + `CREATE VIEW` in SQLite; `CREATE OR ALTER VIEW` in SQL Server.

> ⚠️ **Watch out.** `DROP VIEW` on a view that other views read breaks them silently: nothing complains until someone queries the outer view and gets *no such table*. Drop and rebuild views in their dependency order.

**Your turn.** In SQLite you need to add a column `risk_grade` to `my_v_written_off`. What do you do?

> 🎬 **Didn't get CREATE VIEW?** [Baraa explains it · 9 min](https://youtu.be/SSKVgrwhzus?t=57243&end=57796)

> 🎬 **Didn't get changing and dropping a view?** [Baraa explains it · 4 min](https://youtu.be/SSKVgrwhzus?t=57796&end=58040)

> ⚠️ **Quirk: a view with `SELECT *` follows its table in SQLite — and not elsewhere.**
>
> - **You expect:** a view to behave the same in every database.
> - **What happens:** add a column to a table, and a SQLite view written with `SELECT *` shows it from then on. In SQL Server and PostgreSQL the view keeps the column list it had on the day it was made; the new column is missing until you refresh the view (`sp_refreshview` in SQL Server, `CREATE OR REPLACE VIEW` in PostgreSQL).
> - **Why:** SQLite keeps the view's text and reads the `*` again on every use; the other two turn the `*` into a fixed list when the view is created.
> - **Protect yourself:** list the columns in every view you share, as `my_v_written_off` does. Then the view shows the same columns in every database, and a new column changes nothing until you decide.

```sql
-- throwaway TEMP objects: gone after the run
DROP VIEW IF EXISTS temp.v_star;
DROP TABLE IF EXISTS temp.t_star;
CREATE TEMP TABLE t_star (a INTEGER);
INSERT INTO t_star VALUES (1);
CREATE TEMP VIEW v_star AS
  SELECT * FROM t_star;
-- a column added after the view:
ALTER TABLE t_star ADD COLUMN b INTEGER;
SELECT * FROM v_star;   -- SQLite: a and b
```

Two columns: SQLite's view picked up `b`. In SQL Server the same steps show only `a`. (The box says it too: TEMP objects never reach your practice copy.)

### A view over a view — layers

**What it is.** A view can read another view. The outer view **inherits** everything the inner one does: build the dedup once in `v_payments_clean`, and every view on top of it is de-duplicated too. This is how a **reporting layer** is built: clean views first, business views on top.

**How to write it.** Monthly collections, read from the clean view (run the `v_payments_clean` box above first):

```sql
-- a view on top of v_payments_clean
DROP VIEW IF EXISTS my_v_paid_monthly;
CREATE VIEW my_v_paid_monthly AS
SELECT strftime('%Y-%m', paid_at) AS month, COUNT(*) AS payments, SUM(amount) AS collected
-- the inner view: duplicates already gone
FROM v_payments_clean
GROUP BY strftime('%Y-%m', paid_at);
SELECT * FROM my_v_paid_monthly WHERE month >= '2026-07' AND month < '2026-10';
```

| month | payments | collected |
|---|---|---|
| 2026-07 | 3 044 | 15 420 346 799 |
| 2026-08 | 3 126 | 15 527 925 146 |
| 2026-09 | 3 158 | 16 338 823 207 |

Three rows. September 2026: 3 158 payments, 16 338 823 207 collected — without a word about duplicates in this view, because the inner view removed them. Section 2's `v_loan_status` is built the same way.

```text
payments (raw)
   │
   ▼
v_payments_clean
   │ dedup + clean
   ├──▶ my_v_paid_monthly
   │      monthly totals
   └──▶ v_loan_status
          (section 2)
```

**When you use it.**
- A rule that many reports share (dedup, cleaning, DPD) goes in the lowest view; each report is a thin view on top.
- Fixing the rule once fixes every layer above it.

> ⚠️ **Watch out.** Layers hide cost. `my_v_paid_monthly` looks like one `GROUP BY`, but every read also runs the `ROW_NUMBER` over all 52 875 payments inside `v_payments_clean`. Three layers deep, a "simple" view can be the slowest query in the building.

**Your turn.** Finance decides that two payments of the same instalment on the same day are duplicates even when the amounts differ. Where do you change the rule?

### Temp tables and CREATE TABLE AS — storing the result

**What it is.** Sometimes you want the **rows**, not the query. **CREATE TABLE … AS SELECT** (CTAS, *материализация*) runs the query once and stores its result as a new table. A **temporary table** (*временная таблица*) does the same, but disappears when your session ends.

| Tool | SQL Server | SQLite | Lives |
|---|---|---|---|
| **CTAS** — create table as select | `SELECT … INTO new_table FROM …` | `CREATE TABLE new_table AS SELECT …` | until dropped |
| **Temp table** | `SELECT … INTO #tmp FROM …` (`#` = temp) | `CREATE TEMP TABLE tmp AS SELECT …` | until the session ends |
| **Table variable** (SQL Server only) | `DECLARE @t TABLE (…)` | — | the batch |

**How to write it.** A frozen copy of the clean payments, named with its date:

```sql
-- a table: the rows are stored, frozen as of today
DROP TABLE IF EXISTS t_payments_asof_20261001;
-- SQL Server: SELECT * INTO t_payments_asof_20261001 FROM v_payments_clean
CREATE TABLE t_payments_asof_20261001 AS
SELECT * FROM v_payments_clean;
SELECT COUNT(*) FROM t_payments_asof_20261001;  -- 52 850
```

```sql
-- a temp table: scratch space for this session only
DROP TABLE IF EXISTS tmp_sep;
-- SQL Server: SELECT * INTO #tmp_sep FROM v_payments_clean WHERE
CREATE TEMP TABLE tmp_sep AS
SELECT * FROM v_payments_clean
WHERE paid_at >= '2026-09-01' AND paid_at < '2026-10-01';
SELECT method, COUNT(*) AS payments, SUM(amount) AS collected
FROM tmp_sep GROUP BY method ORDER BY collected DESC;
-- card 1 050 · 5 173 658 728 first
```

The first table holds all 52 850 clean payments and will not change when `payments` does. The temp table holds September's 3 158 payments; card leads with 1 050 payments and 5 173 658 728. Close the page and `tmp_sep` is gone.

**When you use it.**
- CTAS: a number that must not move after it is published; a slow query that many people read (rebuilt nightly).
- Temp table: an intermediate result that one long script reads five times.

> ⚠️ **Watch out.** CTAS copies the **rows only**: no primary key, no index, no link to the view it came from. The copy starts going stale the moment it is made.

**Your turn.** How many rows does `tmp_sep` hold?

> 🎬 **Didn't get CREATE TABLE AS (CTAS)?** [Baraa explains it · 7 min](https://youtu.be/SSKVgrwhzus?t=60042&end=60471)

> 🎬 **Didn't get temporary tables?** [Baraa explains it · 7 min](https://youtu.be/SSKVgrwhzus?t=61453&end=61866)

### When a view, when a table

**What it is.** The choice between saving the **query** (view) and saving the **result** (table). A view is always fresh and costs the query every time; a table is fast to read and frozen.

| | View | Table (CTAS) |
|---|---|---|
| stores | the query text | the rows |
| after new data arrives | shows it at once | does not, until rebuilt |
| reading speed | as slow as the query | as fast as a plain table |
| `bucket` count from `v_loan_status` (section 2), measured with SQLite on a laptop | 0.43 s | 0.00 s |
| one month of `v_portfolio_monthly` (section 6) | 1.8 s | 0.00 s |

**How to write it.** The same result, twice — once as a view, once frozen:

```sql
-- the frozen twin of the view from earlier in this section
DROP TABLE IF EXISTS t_written_off;
CREATE TABLE t_written_off AS SELECT * FROM my_v_written_off;
SELECT (SELECT COUNT(*) FROM my_v_written_off) AS view_rows,
       (SELECT COUNT(*) FROM t_written_off)    AS table_rows;
       -- 190 · 190 today
```

190 and 190 today. Write off one more loan tomorrow and the view says 191, the table still 190.

**When you use it.**
- **View:** the number must be today's (a live dashboard tile); one shared definition.
- **Table:** the number must not change after it is sent (the month-end pack); the view is slow and the data changes rarely (a nightly rebuild).
- **Temp table:** scratch inside one script.

> ⚠️ **Watch out.** A view and a table built from it look identical on the day you make them. A week later they disagree, and nobody can tell which tile reads which. Name them so the difference shows: `v_…` for views, `t_…_asof_20261001` for frozen tables.

**Your turn.**

> 🎬 **Didn't get when to store a result as a table?** [Baraa explains it · 9 min](https://youtu.be/SSKVgrwhzus?t=60633&end=61179)

### Indexes — the phone book

**What it is.** An **index** (*индекс*) is a sorted copy of one or more columns with a pointer to each row. Without one, the engine reads **every row** to find `customer_id = 3208` — a **scan**. With one, it jumps to the right place — a **seek** (SQLite says **SEARCH**). Like finding a name in a phone book instead of reading it cover to cover.

**How to write it.**

```sql
-- the shape
CREATE INDEX index_name ON table_name (column1);
-- one column, or several: (column1, column2)
DROP INDEX index_name;
```

Day 3's "customers with no loan" asks, for each of 6 040 customers, whether any of 7 828 loans is theirs. Give `loans.customer_id` an index and run it again:

```sql
-- an index on the column the subquery looks up
CREATE INDEX IF NOT EXISTS ix_loans_customer ON loans (customer_id);
SELECT COUNT(*) AS customers_without_loan
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM loans l WHERE l.customer_id = c.customer_id);
-- 1 705
```

1 705 customers, the same answer as on Wednesday. Measured with SQLite on a laptop: 2.4 seconds before the index, under a millisecond after — each lookup now reads a customer's own loans, not all 7 828. (The index stays in your practice copy; **Database → ↺ Reset** removes it.)

**Two kinds in SQL Server.** A **clustered index** *is* the table: the rows themselves are stored in its order — one per table, usually the primary key. **Non-clustered** indexes are separate sorted copies that point into it — many per table. SQLite's hidden `rowid` plays the clustered role. Our course tables were loaded without declared keys, so even `loan_id` has no index until you create one.

**When you use it.**

| An index on the column helps | It does not help |
|---|---|
| `col = value`, `col >= a AND col < b` | a function around the column: `strftime('%Y-%m', due_date) = '2026-09'`, `LOWER(method) = 'card'` |
| a `JOIN … ON` on the column | `LIKE '%card'` (a leading `%`) |
| a correlated subquery that looks the column up | a column with two values (`is_weekend`) |

> ⚠️ **Watch out.** Indexes cost space, and every `INSERT` and `UPDATE` must update them too. On your analytics copy that is almost always worth it; on the transactional system it is the database administrator's call, not yours.

**Your turn.**

> 🎬 **Didn't get indexes?** [Baraa explains it · 9 min](https://youtu.be/SSKVgrwhzus?t=66222&end=66780)

> 🎬 **Didn't get how an index speeds up a search?** [Baraa explains it · 9 min](https://youtu.be/SSKVgrwhzus?t=66780&end=67314)

### Reading EXPLAIN QUERY PLAN — SCAN or SEARCH

**What it is.** The **execution plan** (*план выполнения*) is how the engine intends to run your query: which tables it reads, in which order, with which index. `EXPLAIN QUERY PLAN` in front of a query prints it in SQLite, one line per step. The word to look for on a big table: **SCAN** (every row) or **SEARCH** (through an index).

**How to write it.**

```sql
EXPLAIN QUERY PLAN
SELECT * FROM payments WHERE loan_id = 2242;
-- without an index:  SCAN payments
```

```sql
CREATE INDEX IF NOT EXISTS ix_payments_loan ON payments (loan_id);
EXPLAIN QUERY PLAN
SELECT * FROM payments WHERE loan_id = 2242;
-- now:  SEARCH payments USING INDEX ix_payments_loan (loan_id=?)
```

Same 2 rows either way. The first plan reads all 52 875 payments; the second jumps to loan 2242's two. A function around the indexed column turns the SEARCH back into a SCAN:

| filter on `installments.due_date` (with `ix_installments_due`) | plan | rows |
|---|---|---|
| `strftime('%Y-%m', due_date) = '2026-09'` | `SCAN installments USING COVERING INDEX ix_installments_due` | 3 305 |
| `due_date >= '2026-09-01' AND due_date < '2026-10-01'` | `SEARCH installments USING COVERING INDEX ix_installments_due (due_date>? AND due_date<?)` | 3 305 |

Same answer, different work. In SQL Server: *Display Estimated Execution Plan* (Ctrl+L) draws the same thing as boxes — read right to left; **Table Scan** or **Clustered Index Scan** on a big table is the SCAN, **Index Seek** the SEARCH.

**When you use it.**
- Before you blame the server: does my filter or join column have an index, and does the plan say SCAN or SEARCH?
- `AUTOMATIC … INDEX` in a SQLite plan means the engine built a throw-away index for this one query — a hint that a real one is missing.

> ⚠️ **Watch out.** SCAN on a 5-row table is fine; SCAN on 92 193 instalments inside a loop is the problem. Read the plan together with the table sizes.

**Your turn.**

> 🎬 **Didn't get the execution plan?** [Baraa explains it · 4 min](https://youtu.be/SSKVgrwhzus?t=73231&end=73500)

> 🎬 **Didn't get scan or seek in a plan?** [Baraa explains it · 6 min](https://youtu.be/SSKVgrwhzus?t=73848&end=74215)

### The habits that make queries fast

**What it is.** Most slow analyst queries are slow for the same few reasons. Ten habits fix them; eight of the ten are about **doing less work** — fewer columns, fewer rows earlier, no repeated rows, no per-row subqueries.

**How to write it.**

| # | Habit | Slow | Fast |
|---|---|---|---|
| 1 | Select only the columns you need | `SELECT *` into a dashboard | `SELECT loan_id, bucket, outstanding` |
| 2 | Filter early | join everything, filter at the end | `WHERE` on the base table (or in the first CTE) before the joins |
| 3 | No functions on filter columns | `WHERE strftime('%Y-%m', due_date) = '2026-09'` | `WHERE due_date >= '2026-09-01' AND due_date < '2026-10-01'` |
| 4 | Never `DISTINCT` to hide a join bug | `SELECT DISTINCT` after `loans JOIN installments` | fix the grain: aggregate, then join |
| 5 | Join on keys, at the right grain | join raw tables, then `GROUP BY` | aggregate each table, then join the aggregates (Wednesday's chain) |
| 6 | `EXISTS` for large lists, `UNION ALL` when duplicates are fine | `UNION` (sorts to remove duplicates) | `UNION ALL` |
| 7 | Index join and filter columns | none | `installment_id`, `loan_id`, `customer_id`, `due_date`, `paid_at` |
| 8 | Materialise what is slow and stable | a 12-second view opened by 40 people | a nightly table |
| 9 | Avoid correlated subqueries over big tables | `= (SELECT MAX …)` per row | one `ROW_NUMBER` pass |
| 10 | Look at the plan first | guess | `EXPLAIN QUERY PLAN` / Ctrl+L |

Habit 3 on the real data — the same count, two plans:

```sql
SELECT COUNT(*) FROM installments WHERE strftime('%Y-%m', due_date) = '2026-09';
-- 3 305, cannot use an index
SELECT COUNT(*) FROM installments WHERE due_date >= '2026-09-01' AND due_date < '2026-10-01';
-- 3 305, can
```

Both say 3 305 instalments due in September. Only the second can use `ix_installments_due` once it exists.

**When you use it.**
- Every query that feeds a dashboard or runs every day.
- Whenever a query takes more than a few seconds: plan first (habit 10), then the habit the plan points at.

> 💡 **Key idea.** Eight of the ten habits are about *doing less work*: fewer columns, fewer rows earlier, no repeated rows, no per-row subqueries. Only habit 7 (indexes) and habit 8 (materialise) add something.

> ⚠️ **Watch out.** Habit 4 is the dangerous one, because it hides a wrong number. `SELECT DISTINCT` after a one-to-many join (92 193 rows from 7 828 loans) *looks* right for some column lists, while every `SUM` taken on the joined rows is still multiplied.

**Your turn.**

> 🎬 **Didn't get fast filtering and selecting?** [Baraa explains it · 10 min](https://youtu.be/SSKVgrwhzus?t=78224&end=78804)

> 🎬 **Didn't get fast joins?** [Baraa explains it · 8 min](https://youtu.be/SSKVgrwhzus?t=78804&end=79312)

### Putting it together

One request, several of today's tools. *"September's collections by payment method, de-duplicated, fast to read, and frozen for the board pack."*

```sql
-- 1. an index on the column the filter will use
CREATE INDEX IF NOT EXISTS ix_payments_paid ON payments (paid_at);
-- 2. a view over a view: only the columns the pack needs, the date kept as a
-- bare column
DROP VIEW IF EXISTS my_v_collections;
CREATE VIEW my_v_collections AS
SELECT paid_at, method, amount FROM v_payments_clean;
-- 3. a frozen table for the pack: half-open range on the bare column, SELECT
-- only what is needed
DROP TABLE IF EXISTS t_collections_2026_09;
CREATE TABLE t_collections_2026_09 AS
SELECT method, COUNT(*) AS payments, SUM(amount) AS collected
FROM my_v_collections
WHERE paid_at >= '2026-09-01' AND paid_at < '2026-10-01'
GROUP BY method;
SELECT * FROM t_collections_2026_09 ORDER BY collected DESC;
```

| method | payments | collected |
|---|---|---|
| card | 1 050 | 5 173 658 728 |
| payme | 548 | 3 009 999 487 |
| transfer | 524 | 2 963 484 217 |
| click | 526 | 2 627 166 767 |
| cash | 510 | 2 564 514 008 |

Five rows, 3 158 payments, 16 338 823 207 in all — the September row of `my_v_paid_monthly`, now split by method and frozen. Each step is one tool: the index serves the date filter (habit 7), the view inherits the dedup from `v_payments_clean`, the filter is a half-open range on the bare column (habit 3), and the pack reads a table that will not move. Put `EXPLAIN QUERY PLAN` in front of step 3's `SELECT`: SQLite pushes the date filter down through both views to `payments`, and the line for `payments` should read **SEARCH … USING INDEX ix_payments_paid**.

### Depth (optional)

- ▶ Baraa, *Views* [15:35:02](https://youtu.be/SSKVgrwhzus?t=56102&end=59800), *CTAS and temp tables* [16:36:40](https://youtu.be/SSKVgrwhzus?t=59800&end=62251), *Indexes* [18:23:42](https://youtu.be/SSKVgrwhzus?t=66222&end=73231), *Execution plan* [20:20:31](https://youtu.be/SSKVgrwhzus?t=73231&end=76263), *30 performance tips* [21:43:39](https://youtu.be/SSKVgrwhzus?t=78219&end=80665) — long; watch Views + Indexes + the tips (≈2 h), the plan chapter if SQL Server is your target. Stored procedures and triggers (17:27:04, 18:12:58) are optional for an analyst.
- *Russian terms:* представление = view, временная таблица = temp table, материализация = materialisation, индекс = index, кластерный / некластерный = clustered / non-clustered, план выполнения = execution plan, полное сканирование = full scan, поиск по индексу = index seek.

---

## 2. Worked example — `v_loan_status` (15 min)

**Ask (Timur):** one row per loan — all 7 828, closed and written-off included (Timur filters in the tool) — with DPD, bucket, outstanding and days on book, that every tile can read. Each step is one concept from section 1, in the same order.

1. **What a view is — one definition.** DPD and bucket as week 2 (payments through the as-of date); outstanding = `principal_due` of instalments due after the as-of date; days on book = as-of − disbursed. Written once, here.
2. **CREATE VIEW** — the box below; run it once.
3. **A view over a view.** It reads `v_payments_clean`, not `payments`, so the 25 duplicates never reach a tile.
4. **When a view, when a table.** The tiles must show today's DPD → a view. The month-end pack gets a frozen `t_loan_status` (P5).
5. **Indexes and the plan.** `EXPLAIN QUERY PLAN SELECT bucket, COUNT(*) FROM v_loan_status GROUP BY bucket` shows `AUTOMATIC … INDEX` lines: SQLite builds throw-away indexes for the joins on every read. That is the hint for habit 7 if the view gets slow.

```sql
CREATE VIEW v_loan_status AS
WITH unpaid AS (
  SELECT i.loan_id, i.due_date, i.total_due - COALESCE(SUM(p.amount), 0) AS overdue_amount
  FROM installments i
  LEFT JOIN v_payments_clean p ON p.installment_id = i.installment_id AND p.paid_at <= '2026-10-01'
  WHERE i.due_date <= '2026-10-01'
  GROUP BY i.installment_id, i.loan_id, i.due_date, i.total_due
  HAVING COALESCE(SUM(p.amount), 0) < i.total_due),
dpd AS (
  -- DATEDIFF(day, MIN(due_date), '2026-10-01')
  SELECT loan_id, CAST(julianday('2026-10-01') - julianday(MIN(due_date)) AS INTEGER) AS dpd,
         COUNT(*) AS unpaid_instalments, SUM(overdue_amount) AS overdue_amount
  FROM unpaid GROUP BY loan_id),
outst AS (
  SELECT loan_id, SUM(principal_due) AS outstanding FROM installments WHERE due_date > '2026-10-01' GROUP BY loan_id)
SELECT l.loan_id, l.customer_id, p.code AS product, b.branch_name, b.region, l.risk_grade, l.status,
       l.disbursed_at, l.principal, l.term_months,
       CAST(julianday('2026-10-01') - julianday(l.disbursed_at) AS INTEGER) AS days_on_book,
       COALESCE(o.outstanding, 0)   AS outstanding,
       COALESCE(d.dpd, 0)           AS dpd,
       CASE WHEN COALESCE(d.dpd, 0) = 0 THEN '0' WHEN d.dpd <= 30 THEN '1-30' WHEN d.dpd <= 60 THEN '31-60'
            WHEN d.dpd <= 90 THEN '61-90' ELSE '90+' END AS bucket,
       COALESCE(d.unpaid_instalments, 0) AS unpaid_instalments,
       COALESCE(d.overdue_amount, 0)     AS overdue_amount
FROM loans l
JOIN products p ON p.product_id = l.product_id
JOIN branches b ON b.branch_id = l.branch_id
LEFT JOIN dpd   d ON d.loan_id = l.loan_id
LEFT JOIN outst o ON o.loan_id = l.loan_id;
```

Checks, in this order: `SELECT COUNT(*), COUNT(DISTINCT loan_id) FROM v_loan_status` → **7 828 · 7 828** (the grain holds; a 92 193 here means a join multiplied). `SUM(outstanding)` → 208 723 504 430; `SUM(outstanding > 0)` → 3 409; buckets `0` 7 429 · `1-30` 124 · `31-60` 25 · `61-90` 16 · `90+` 234 — the three LEFT JOINs put every non-delinquent loan in bucket 0 with `COALESCE`. Loan 1: Termez Central, CONS, grade C, active, 552 days on book, outstanding 9 593 064, DPD 0. Loan 2167: written off, DPD 919, 6 unpaid instalments, 3 334 100 overdue. `status × bucket` cross-tab: `default`/`written_off` are all 90+; 13 `closed` loans sit in 1–30 and one in 31–60 — week 2's finding, now a filter Timur can click.

The dictionary paragraph HW 3.2 asks for, as a table (one line per column is the rule):

| column | definition |
|---|---|
| `loan_id` … `term_months` | copied from `loans`, with `product` (code) and `branch_name`/`region` joined in |
| `days_on_book` | as-of − `disbursed_at`, whole days (loan 1: 552) |
| `outstanding` | sum of `principal_due` over instalments with `due_date` > as-of; 0 for closed/written-off loans |
| `dpd` | as-of − due date of the oldest matured instalment not fully paid (payments through as-of, clean view); 0 if none |
| `bucket` | `0` / `1-30` / `31-60` / `61-90` / `90+` from `dpd` |
| `unpaid_instalments`, `overdue_amount` | count and unpaid remainder of those matured instalments |
| caveats | 14 `closed` loans (all with `closed_at` NULL) carry DPD > 0 — 13 in 1–30, 1 in 31–60; outstanding excludes interest; as-of fixed at 2026-10-01 |

The as-of date appears four times. In SQL Server, make it a parameter with an inline table-valued function (`CREATE FUNCTION f_loan_status(@asof DATE) RETURNS TABLE AS RETURN (…)`); in SQLite, keep a one-row `params` table and join it. For the course, the literal date is fine — write it in the view's header comment.

---

## 3. Practice (50 min)

Start with the lab: a view of your own, on a table of your own, so you can watch what a view does when the data changes. Then the questions, in the order of section 1; the concept each one trains is in italics. Write each query in the box under its question — it is saved in this browser. **✔ Check** tells you whether your result matches the answer. Indexes and new tables change only your practice copy of the database — **Database → ↺ Reset** brings the original back. Several questions use Timur's views: run the `CREATE VIEW` boxes in sections 1, 2 and 6 once first (`v_portfolio_monthly` is in section 6 — the Company corner).

**P1.** *(what a view is)* Create `v_payments_clean` and prove it: rows, total, distinct methods, and that no instalment has two rows left.

**P1 — the number.** How many rows does `v_payments_clean` have?

**P2.** *(CREATE VIEW and DROP VIEW)* Create `my_v_active_auto`: `loan_id`, `branch_id`, `principal` of the **active Auto** loans (`product_id = 4`). Count its rows and sum its principal; then drop it.

**P2 — the number.** How many rows does `my_v_active_auto` return?

**P3.** *(a view over a view)* Create `v_loan_status` (worked example) and run the four checks. Then: outstanding by `region` and `bucket` from the view only — how long is that query compared with writing it from the raw tables (week 2's DPD chain plus the joins)?

**P3 — the grain check.** `SELECT COUNT(*), COUNT(DISTINCT loan_id) FROM v_loan_status` returns 92 193 and 7 828. What happened?

**P4.** *(temp table)* A temp table for a long script: `CREATE TEMP TABLE tmp_dpd AS SELECT loan_id, dpd, bucket, outstanding FROM v_loan_status WHERE dpd > 0`; count it; then run three questions against it (by bucket, by product via a join, average DPD of active loans).

**P4 — the count.** How many rows does `tmp_dpd` have?

**P5.** *(CREATE TABLE AS)* Create `t_loan_status` as a materialised copy (CTAS / `SELECT INTO`). Time the bucket count from the view and from the table.

**P6.** *(when a view, when a table)* Answer Timur in two or three sentences: when would you ship `t_loan_status` instead of `v_loan_status`?

**P7.** *(when a view, when a table — the slow view)* Build `v_portfolio_monthly` (run the `CREATE VIEW v_portfolio_monthly` box in section 6 once). Read September 2026 from the view — disbursed count and month-end outstanding over all products and branches — then freeze the view with CTAS as `t_portfolio_monthly` and read the same from the table. Which of the two would you point a dashboard at?

**P8.** *(when a view, when a table — month end vs as-of)* `v_portfolio_monthly`: check 1 700 rows = 34 months × 5 × 10, and reconcile September 2026 month-end outstanding with the as-of figure. Why do they differ by about 480 m?

**P8 — why the gap?** Pick every reason that is part of the difference.

**P9.** *(indexes — clustered and not)* `EXPLAIN QUERY PLAN SELECT * FROM loans WHERE loan_id = 2242` vs `WHERE rowid = 2242`. Why do they differ, and what fixes the first?

**P9 — why?** Why does `WHERE rowid = 2242` SEARCH while `WHERE loan_id = 2242` SCANs?

**P10.** *(EXPLAIN QUERY PLAN)* `EXPLAIN QUERY PLAN` for `SELECT * FROM payments WHERE loan_id = 2242` before and after `CREATE INDEX ix_payments_loan ON payments (loan_id)`. Copy both lines.

**P10 — read the plan.** Which line does the plan show *after* the index exists?

**P11.** *(EXPLAIN QUERY PLAN — a function on the column)* Two filters for September instalments — `strftime('%Y-%m', due_date) = '2026-09'` and the half-open range — with `ix_installments_due` in place. Plans? Same count?

**P11 — read the plan.** Which statement is true?

**P12.** *(habits — DISTINCT is not a fix)* `SELECT COUNT(*), COUNT(DISTINCT l.loan_id) FROM loans l JOIN installments i ON i.loan_id = l.loan_id`. Someone "fixes" a multiplied report with `SELECT DISTINCT l.loan_id, l.principal …` and then sums. What is still wrong?

**P12 — what is still wrong?** Pick every true statement.

**P13.** *(the habits)* Pick five of the ten habits and show, with one query each on our data, the slow form and the fast form (plans or row counts as evidence).

> 🚀 **Stretch (optional, +5 XP).** The whole week in one query — and a question Nilufar will want answered before the next credit committee.

**P14.** *(putting it together)* Tuesday's P9 and Wednesday's worked example found 101 customers lent to again after a written-off loan. Using `v_loan_status` and `applications`, list the officers (`officer_id`) who approved the most such repeat loans, and the FPD30 of those repeat loans versus the book.

---

## 4. Homework <span class="badge hw">HW 3.2 — Due Day 5</span>

**Timur's clean layer.** Everything goes into the 📎 box below; the four reconciliation queries are checked by the page itself (**▶ Run**, **✔ Check**).

1. **views.sql** — `CREATE VIEW` for `v_payments_clean`, `v_loan_status`, `v_portfolio_monthly`, in that order (the second reads the first), each preceded by a header comment: grain, as-of date, source tables. Both dialects where they differ (`julianday` vs `DATEDIFF`, `WITH RECURSIVE` vs `WITH`, `CREATE TABLE AS` vs `SELECT INTO`), or a clear dialect header.
2. **dictionary.md** — one paragraph per view: **grain** (what is one row), **row count**, each **column** with its definition in one line (e.g. *outstanding — sum of `principal_due` over instalments with `due_date > as-of`*), the **as-of** rule, and known caveats (closed loans in 1–30; month-end vs as-of outstanding; the 25 removed duplicates).
3. **R1–R4 — the reconciliation, recomputed from the raw tables.** Every view ships with a check: an independent query that gets the view's key totals straight from `payments`, `installments` and `loans`, with the view's definition written inline as a CTE. If the view and the raw recomputation agree, the view is right. R1: rows and total of the de-duplicated payments (52 850 / 255 114 772 176). R2: outstanding as of 2026-10-01 and the number of loans that still owe (208 723 504 430 / 3 409). R3: loans per DPD bucket for all 7 828 loans, payments de-duplicated and counted through the as-of date (7 429 / 124 / 25 / 16 / 234). R4: outstanding at the end of September 2026, the month-end definition (208 243 879 623).

> ⚠️ **Watch out.** The checker runs R1–R4 on an untouched copy of the data, where your views do not exist. That is on purpose: a check that reads the view cannot catch a bug in the view. Write the definition inline (`WITH pc AS (… ROW_NUMBER() …)`) and run against the raw tables. In your own `checks.sql` at work you would add the same totals read from the view, side by side.

### 📎 Hand in here

---

## 5. Self-check

---

## 6. Company corner <span class="badge company">The portfolio dashboard's backbone</span>

The first page of a lending company's dashboard has **six numbers** on it. Everything else drills down from them. Each is one short query on one of Timur's views — which is the real test of the layer: if a tile needs a raw table, the layer is incomplete.

| # | Tile | Definition (ours) | View | Value as of 2026-10-01 |
|---|---|---|---|---|
| 1 | **Outstanding** | sum of `outstanding` over all loans | `v_loan_status` | **208 723 504 430** on 3 409 loans |
| 2 | **Disbursements MTD** | loans and principal disbursed this month so far | `v_portfolio_monthly` (or `v_loan_status` filtered) | October: **21 / 852 760 000** (one day); last full month, September: 361 / 17 015 490 000 |
| 3 | **PAR30** | outstanding of loans with DPD > 30 ÷ total outstanding | `v_loan_status` | 6 507 526 953 / 208.72 bn = **3.12 %** |
| 4 | **NPL90** | outstanding of loans with DPD > 90 ÷ total outstanding | `v_loan_status` | 5 319 475 527 = **2.55 %** (234 loans) |
| 5 | **FPD30, last mature vintage** | FPD30 of the newest vintage whose first due dates are all ≥ 30 days old | week 2's `flags` on `v_payments_clean` | July 2026: 4 of 367 = **1.09 %** (August: only 11 of 358 loans in scope — not yet readable) |
| 6 | **Collection rate** | paid by month end ÷ due in the month, on instalments due that month | `v_payments_clean` + `installments` | September: 15 982 118 926 / 16 987 977 718 = **94.1 %** |

Two of the views you built in sections 1 and 2. The third, **`v_portfolio_monthly`**, is the trend behind tiles 1 and 2 — one row per month × product × branch, built on a recursive calendar so that empty cells exist as zeros. Run this box once; P7, P8 and the tile queries below need it:

```sql
CREATE VIEW v_portfolio_monthly AS
WITH RECURSIVE months(month_start) AS (
  SELECT '2024-01-01' UNION ALL SELECT date(month_start, '+1 month') FROM months WHERE month_start < '2026-10-01'),
cells AS (SELECT m.month_start, p.product_id, p.code AS product, b.branch_id, b.branch_name
          FROM months m CROSS JOIN products p CROSS JOIN branches b),
disb AS (SELECT strftime('%Y-%m-01', disbursed_at) AS month_start, product_id, branch_id,
                COUNT(*) AS disbursed_count, SUM(principal) AS disbursed_amount FROM loans GROUP BY 1, 2, 3),
outst AS (SELECT m.month_start, l.product_id, l.branch_id, SUM(i.principal_due) AS outstanding_month_end
          FROM months m
          JOIN loans l        ON l.disbursed_at < date(m.month_start, '+1 month')
          JOIN installments i ON i.loan_id = l.loan_id AND i.due_date >= date(m.month_start, '+1 month')
          GROUP BY 1, 2, 3)
SELECT c.month_start AS month, c.product, c.branch_name,
       COALESCE(d.disbursed_count, 0) AS disbursed_count, COALESCE(d.disbursed_amount, 0) AS disbursed_amount,
       COALESCE(o.outstanding_month_end, 0) AS outstanding_month_end
FROM cells c
LEFT JOIN disb  d ON d.month_start = c.month_start AND d.product_id = c.product_id AND d.branch_id = c.branch_id
LEFT JOIN outst o ON o.month_start = c.month_start AND o.product_id = c.product_id AND o.branch_id = c.branch_id;
-- 1 700 rows; 2026 month-end outstanding: Jan 151.8 bn · Mar 164.0 · Jun 184.6
-- · Aug 203.8 · Sep 208.2 bn
```

The first version of this view joined `cells` (50 rows per month) to `loans` without matching product and branch — and reported 10 trillion of outstanding. The reconciliation check (`SUM(outstanding_month_end)` for September against `v_loan_status`) caught it in one line. **Every view ships with its check query**; that is what R1–R4 in HW 3.2 are for.

With the three views in place, the six tiles are short queries:

```sql
-- 1, 3, 4 in one query
SELECT SUM(outstanding) AS outstanding,
       ROUND(100.0 * SUM(CASE WHEN dpd > 30 THEN outstanding ELSE 0 END) / SUM(outstanding), 2) AS par30_pct,
       ROUND(100.0 * SUM(CASE WHEN dpd > 90 THEN outstanding ELSE 0 END) / SUM(outstanding), 2) AS npl90_pct
FROM v_loan_status;
-- 2
SELECT SUM(disbursed_count), SUM(disbursed_amount) FROM v_portfolio_monthly WHERE month = '2026-10-01';
-- 6
SELECT ROUND(100.0 * SUM(COALESCE(p.paid, 0)) / SUM(i.total_due), 1) AS collection_rate_pct
FROM installments i
LEFT JOIN (SELECT installment_id, SUM(amount) AS paid FROM v_payments_clean WHERE paid_at <= '2026-10-01' GROUP BY installment_id) p
       ON p.installment_id = i.installment_id
WHERE i.due_date >= '2026-09-01' AND i.due_date < '2026-10-01';
```

> 💡 **Key idea.** If a tile needs a raw table, the layer is incomplete. Six tiles, three views, one definition of DPD and outstanding — that is the test Timur's dashboard has to pass.

**Reading the six together.** Outstanding grows ~7 bn a month (151.8 bn in January to 208.2 bn in September) while disbursements run 12–22 bn: most of what is lent is repaid within the year (short Micro/BNPL/Consumer terms). PAR30 3.1 % and NPL90 2.6 % are close — the delinquent book is mostly *old*: 5.3 of the 6.5 bn at risk is already 90+. FPD30 at 1.1 % for July is in line with the 1.28 % history. A 94 % collection rate on September's dues means 6 % of what fell due is unpaid a month later — the inflow to Sevara's 1–30 bucket (117 loans entered it from current between 1 September and 1 October — Tuesday's roll-rate matrix; the bucket itself holds 124). One page, six numbers, and every one of them traceable to a view and a definition — that is what "a clean layer" buys.

> 🎯 **Interview version.** *"What goes on the first page of a lending dashboard, and where do the numbers come from?"* The interviewer listens for the six tiles, for where each number is computed (a view, not the dashboard), and for how you know the views agree. Say it in the box below, then compare.

**Say it like in an interview.** Answer the question above in 3–5 sentences, as you would aloud, with one Nur Finance number.

Tomorrow: the checkpoint — the whole week as one written EDA report on the loan book, and eight interview questions.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

---

## Going further — a data dictionary (optional, 25 min)

> STORY **Thursday, 17:30.** Timur, with the three views open in Power BI. *"Next week three new people get this model. The first will ask what `closed_at` NULL means, the second whether `outstanding` includes interest, the third why `payments` has ten methods. I do not want to answer each of them in a meeting. Write it down once — every table, every column — a **data dictionary**. And do not type the column list by hand: the database already knows it."*

### What a data dictionary is — one line per column

**What it is.** A **data dictionary** (*словарь данных*) is the document that says what every table and column means, so nobody has to read the SQL. Per **table**: the **grain** (what one row is), the key, the row count and where the data comes from. Per **column**: the type, the meaning in one sentence, the allowed values, an example, and who owns the meaning.

**How to write it.** The header of the `loans` table, then four of its column lines:

```text
loans — one loan that was paid out
key     loan_id (unique, never NULL)
rows    7 828, as of 2026-10-01
source  loans table, data engineer
owner   Bekzod (portfolio)
```

| column · type | meaning | allowed · example |
|---|---|---|
| `loan_id` INTEGER | one loan; the key | unique · `2242` |
| `status` TEXT | where the loan is in its life | `active`, `closed`, `default`, `written_off` |
| `closed_at` TEXT, a date | the day the loan was closed | NULL while not closed · `2026-06-26` |
| `annual_rate` REAL | the yearly rate as a share | `0.42` = 42 %; `0` for BNPL |

With these four lines a new analyst can filter loans without asking. `closed_at` is NULL on 3 601 loans, and the line says why: 3 586 of them are active, default or written-off loans that are not closed. The other 15 are closed loans with no date, the gap Week 2 Day 5 found — the dictionary line is where that caveat lives.

**When you use it.**
- A new colleague or a Power BI user asks what a column means: the answer is a link, not a meeting.
- Before you trust a column in a report: read its NULL rule and its allowed values.
- An auditor asks how a reported number is defined: the definition is already written.

> ⚠️ **Watch out.** A line that says what a column *should* hold, not what it *does* hold, misleads. `payments.method` should hold 5 methods; the table holds 10 spellings. Write the allowed values, then check them against the data (the next two subsections).

**Your turn.** Match each column to its dictionary line.

### The skeleton from the database — sqlite_master and pragma_table_info

**What it is.** The database already knows its tables and columns. **`sqlite_master`** (*системный каталог*) is SQLite's own list of every table, view and index, with the SQL that created it. **`pragma_table_info('name')`** lists the columns of one table or view: position, name, type, and whether it is part of a declared primary key. A dictionary starts from these two, so no column is forgotten.

**How to write it.**

```sql
-- every table and view in your practice copy
-- SQL Server: SELECT TABLE_NAME, TABLE_TYPE
-- FROM INFORMATION_SCHEMA.TABLES
SELECT type, name
FROM sqlite_master
WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%'
ORDER BY type, name;
```

An untouched copy has 11 tables, `app_events` to `staff`. The views and tables you made today (`v_payments_clean`, `t_written_off` and the rest) appear in the list too.

```sql
-- the skeleton of one table: one row per column
SELECT cid, name, type, '' AS meaning
FROM pragma_table_info('loans');
```

13 rows, `loan_id` to `closed_at`, with an empty `meaning` for you to fill. The whole database in one query — a join of the catalogue to each table's columns:

```sql
-- every column of every table: the full skeleton
-- SQL Server: INFORMATION_SCHEMA.COLUMNS
SELECT m.name AS tbl, p.name AS col, p.type
FROM sqlite_master m, pragma_table_info(m.name) p
WHERE m.type = 'table' AND m.name NOT LIKE 'sqlite_%'
ORDER BY m.name, p.cid;
```

86 rows in an untouched copy: the 86 columns of the 11 tables, from `app_events.event_id` to `staff.hired_on`. The full dictionary has 86 column lines to fill; your own tables add their rows.

**When you use it.**
- Starting a dictionary: the skeleton lists every column, so none is missed.
- After a change upstream: run it again; a new or renamed column shows up at once.

> ⚠️ **Watch out.** The skeleton gives names and types, never meaning. Its `pk` column is 0 everywhere here, because the course tables were loaded without declared keys (section 1, Indexes). The key comes from profiling, next; the meaning comes from the people who own the data.

**Your turn.** `pragma_table_info` works on a view too. Run it on `v_loan_status` from section 2. Some of its columns come back with an **empty type**, because they are computed in the view and SQLite cannot name their type — so only the dictionary can. How many?

### Profiling a column — the numbers behind each line

**Before you read.** Guess first, then play with it — the explanation below will make more sense.

**What it is.** **Profiling** (*профилирование данных*) measures what a column really holds: the row count, the number of distinct values, the NULL share, the minimum and the maximum — and, for a category, every value with its count. Each measure fills or checks one part of the dictionary line.

**How to write it.**

```sql
-- one column, six measures
-- SQL Server: SUM(CASE WHEN closed_at IS NULL THEN 1 ELSE 0 END)
SELECT COUNT(*) AS n_rows,
       COUNT(DISTINCT closed_at) AS n_distinct,
       SUM(closed_at IS NULL) AS n_null,
       ROUND(100.0 * SUM(closed_at IS NULL) / COUNT(*), 1) AS null_pct,
       MIN(closed_at) AS min_value,
       MAX(closed_at) AS max_value
FROM loans;
-- 7 828 · 844 · 3 601 · 46.0 · 2024-04-01 · 2026-10-01
```

7 828 loans, 844 different closing days, 3 601 empty (46.0 %), the first closing on 1 April 2024 and the last on the as-of date. For a category, list the values with their counts:

```sql
-- every value of a category, with its rows
SELECT method, COUNT(*) AS payments
FROM payments
GROUP BY method
ORDER BY payments DESC;
```

10 rows for 5 methods: `Card`, `Click`, `PayMe`, `CASH ` and `bank transfer` are 180 stray spellings (57 + 36 + 30 + 30 + 27). The dictionary says 5 values and names the view that cleans them, `v_payments_clean`.

| the profile shows | the line says | on our data |
|---|---|---|
| distinct = rows, no NULL | a key candidate | `loan_id`: 7 828 of 7 828 |
| few distinct values | a category: list them | `status`: 4 |
| a NULL share | what NULL means | `closed_at`: 46.0 % |
| min and max | the range; impossible values | `paid_at`: up to 2026-11-24 |

**When you use it.**
- Writing a line: distinct values → key or category; NULL share → the NULL rule; min and max → the range.
- Before you publish a view: profile its columns. A `COUNT(*)` of 92 193 where 7 828 belongs is a broken grain (P3).

> ⚠️ **Watch out.** `MAX(loan_id)` is 7 917, but there are 7 828 loans: 89 numbers are never used. The largest id is a label, not a count — `COUNT(*)` is the count.

**Your turn.** Profile `customers.monthly_income`. What share of customers has no income recorded?

### Keeping it next to the views

**What it is.** A dictionary that lives in someone's head or in an old e-mail goes stale. Keep it **next to the views**: in the same folder as `views.sql` (the `dictionary.md` of HW 3.2), or as a table in the database that every tool can read. Then check it with a query, like any other view.

**How to write it.**

```sql
-- the dictionary as a table in your practice copy
DROP TABLE IF EXISTS my_dictionary;
CREATE TABLE my_dictionary (tbl TEXT, col TEXT, meaning TEXT, allowed TEXT, owner TEXT);
INSERT INTO my_dictionary VALUES
  ('loans', 'loan_id', 'one loan that was paid out, the key', 'unique, never NULL', 'data engineer'),
  ('loans', 'status', 'where the loan is in its life', 'active, closed, default, written_off', 'Bekzod'),
  ('loans', 'closed_at', 'the day the loan was closed', 'a date, NULL while not closed', 'Bekzod');
-- which columns of loans have no line yet? an anti-join
SELECT p.name AS undocumented
FROM pragma_table_info('loans') p
LEFT JOIN my_dictionary d ON d.tbl = 'loans' AND d.col = p.name
WHERE d.col IS NULL;
```

10 rows: the ten columns of `loans` that have no line yet, `application_id` to `risk_grade`. Each line you add takes one row off the list; zero rows means the table is fully documented. The same check on `v_loan_status` tells you when a new column joins the view.

**When you use it.**
- Every time a view changes: change the dictionary in the same edit, then run the anti-join.
- Where the readers are: SQL Server can store a description on the column itself (an extended property called `MS_Description`), and Power BI's model view has a Description box for every column.

> ⚠️ **Watch out.** The view changes and the dictionary does not. A month later the line describes a column that no longer exists. Fix: one edit changes both files, and the anti-join check runs before the view is shared.

**Your turn.**

### Try it on the real data

**T1.** Build the skeleton of `applications` with `pragma_table_info`, then profile its columns. Exactly one of its 12 columns has NULLs. How many NULLs does it have?

**T2.** Write the dictionary line for `applications.credit_score`: type, meaning, allowed values and range, the NULL rule with its share, and the owner.

### In one minute

- A **data dictionary** says, per table, the grain, the key, the rows and the source; per column, the type, the meaning, the allowed values, an example and the owner.
- Start it from the database: `sqlite_master` lists the tables, `pragma_table_info` the columns — 86 lines for the 11 company tables.
- **Profile** each column: distinct = rows means a key, few values a category, a NULL share needs a rule, and min / max catch impossible values.
- Keep it next to the views, change both in one edit, and check it with an anti-join.


=====
PAGE: Week 3 · Day 5 — Checkpoint: the loan-book EDA report (weeks/week-03/day-5.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-03/day-5
=====

# Week 3 · Day 5 — Checkpoint: the loan-book EDA report

<span class="badge">Report 150 min</span> <span class="badge">Interview 30 min</span> <span class="badge hw">Checkpoint · 100 points</span>

> STORY **Friday, 9:00.** Madina closes the door. *"Monday the board gets a one-pager on the loan book from Bekzod. He will build it from what you write today. Not twenty-five answers — one **report**: what is in the database, how big the book is, where it sits, how it moves, how it performs. Ten sections, each with the query, the first rows, and what you see. Everything we built this week — windows, CTEs, the views — is allowed; everything must be reproducible. At 15:00, eight questions."*

## Today in 3 lines

- **Part A (80 pts):** the report, sections S1–S10 — an exploratory data analysis (*разведочный анализ данных*, EDA) of Nur Finance's loan book in ten sections, modelled on Baraa's SQL EDA project (▶ [27:41:51](https://youtu.be/SSKVgrwhzus?t=99711&end=102638)) but on our data and our metrics.
- **Part B (20 pts):** eight interview questions on this week's material, answered in writing.
- Allowed: everything from weeks 1–3, including the three HW 3.2 views (ship `views.sql` with the report so the reviewer can run it).

**Rules**

- **Open book:** your pages, your files, your tool. **Closed:** the model-answer folds, until you submit.
- **Where everything goes:** the **📎 box at the end of this page**:
  - **S1–S10** — one box per report section: the query in a code block, the first rows as a Markdown table, 1–3 sentences of findings;
  - **N1–N8** — eight checked numbers, one query each: the page tells you whether the number is right, not what it is;
  - **`interview.md`** — Part B.
- **As-of date:** every number as of **2026-10-01**.
- **Payments:** use `v_payments_clean` wherever payments are summed.
- **Also due today:** **HW 3.2**, in Day 4's 📎 box.

**Working method — in every section**

1. Say the grain before the query.
2. Name *share of what* and *period* in every sentence.
3. Put a count next to every rate.
4. Use half-open date filters.
5. A window for shares and running totals; a CTE chain where you aggregate twice.
6. Write one finding Bekzod could read aloud — not a description of the table.

> 💡 **Key idea.** A finding is a sentence Bekzod could say to the board and act on — *"by count we are a Micro lender, by money an SME lender"*. "The table has five rows" is a description; it scores nothing.

Before you start, match each section to the tool from this week that carries it:

**The shape of one section** (copy it ten times):

~~~markdown
## S5. Magnitude — disbursed principal by product
Grain: one row per loan (`loans`); dimension joined many-to-one.

```sql
SELECT p.code, COUNT(*) AS loans, SUM(l.principal) AS disbursed, … FROM loans l JOIN products p … GROUP BY p.code;
```

| code | loans | disbursed | share % |
|---|---|---|---|
| SME | 781 | 241 117 150 000 | 59.6 |
| … | | | |

**Finding.** Two books in one: 85 % of loans are Micro/Consumer/BNPL, 80 % of the money is SME/Auto.
~~~

Five lines of Markdown per section, not fifty: the reviewer reads the finding first, then checks the number, then — only if it is wrong — reads the query.

> ⚠️ **Watch out.** Common mistakes from this week, each one costs the number point: summing `loans.principal` after a join to `installments` (11.8 rows per loan, and the long loans are the big ones: Σ principal ×24.7); a running total without `PARTITION BY` where the sentence says "per product"; `LAG` with the display filter inside the CTE (NULL year-on-year); a 0.00 % in a vintage cell that is not yet observable; `BETWEEN` on a datetime column; raw `payments` where `v_payments_clean` was asked for.

---

## Part A — The report (150 min, 80 pts)

**Scoring — 8 points per section:**

- **3** — the query runs and answers the heading;
- **3** — the numbers are right;
- **2** — the finding sentence(s).

The model answers below are *an* answer; a different cut with correct numbers and a real finding scores the same.

Write each section into its own box **S1–S10** in the 📎 hand-in at the end. Eight sections have one number at their heart; the boxes **N1–N8** check it for you — S3 forward-dated payments, S4 collected to date, S5 Tashkent's share, S6 the top branch of 2026, S7 May's year-on-year, S8 the book's growth, S9 PAR30, S10 the top decile.

> ⚠️ **Watch out.** N1–N8 run on an untouched copy of the data, where the views you built on Day 4 do not exist. For those eight queries write the definition inline (`WITH pc AS (… ROW_NUMBER() …)` for clean payments, the DPD chain for PAR30) — in the report sections themselves you may read the views.

### S1. Database exploration — tables, row counts, grain

### S2. Dimensions — products, branches, grades, channels

### S3. Date range — first/last disbursement, as-of

### S4. Key measures — the totals

### S5. Magnitude — by product, branch, region

### S6. Ranking — top and bottom

### S7. Change over time — monthly disbursements, 3-month moving average

### S8. Cumulative — running outstanding

### S9. Performance — DPD buckets, FPD30, roll rates

### S10. Part-to-whole and segmentation — mix, income bands × grade

---

## Part B — Eight interview questions (30 min, 20 pts)

Answer in writing, 3–5 sentences each, as you would say it aloud: 2 points per question (1 correct and complete, 1 with a Nur Finance example and number) plus 4 for the "definitions I used" note at the top of `interview.md` (as-of, DPD, FPD30, outstanding, the dedup rule).

1. Window function vs `GROUP BY` — what does each do to the rows, and when do you use both in one query?
2. `ROW_NUMBER` vs `RANK` vs `DENSE_RANK` — the difference, and which one you use to deduplicate and why.
3. Give a use of `LAG` from this week and the trap when the display is filtered.
4. CTE vs subquery — when does each win?
5. What is a recursive CTE for? Give the example you built.
6. View vs table — what is stored, what is fresh, what is fast, and which one Power BI should read?
7. What does an index cost and what does it buy? Name a `WHERE` that an index cannot help.
8. How do you de-duplicate safely in a production database?

---

## Scoring and what happens next

| Part | Points | Pass |
|---|---|---|
| A — report, 10 sections × 8 | 80 | |
| B — 8 questions × 2 + definitions note | 20 | |
| **Total** | **100** | **≥ 70 → Week 4 on Monday** |

Below 70: feedback names the sections to redo (most often S8 — the month-end outstanding — and S9's definitions); re-submit Monday morning before Week 4. Points go to the [Progress page](progress.md).

**Hand-in checklist** (the 📎 box below): S1–S10 (each with query + first rows + finding), N1–N8 all ✅, `interview.md` (definitions note + 8 answers); attach `views.sql` in Extra so the reviewer can run your report. Also due today: **HW 3.2** in Day 4's 📎 box (`views.sql`, `dictionary.md`, R1–R4).

> 🚀 **Stretch (optional, +5 XP).** Baraa's *Advanced analytics* project (▶ [28:30:38](https://youtu.be/SSKVgrwhzus?t=102638&end=107244)) adds change-over-time, cumulative, performance-vs-target, part-to-whole and segmentation reports in SQL Server on his SalesDB. Redo his "performance vs target" idea on ours: each product's 2026 monthly disbursement against its own 2025 monthly average (`AVG(...)` per product on the 2025 rows, joined — or `AVG(...) OVER (PARTITION BY product)`), flagged above/below.

**Stretch — the number.** Of the 45 product-months of 2026 (5 products × January–September), how many are above their product's 2025 monthly average?

Madina, 17:30: *"Bekzod has his one-pager — six numbers, three cuts, one chart, one sentence under each. Nilufar put the vintage table on her committee slide with your definitions on it. Timur deleted eleven measures and pointed the dashboard at three views. Monday is Excel — the same book, in the tool everyone else in the building uses."*

---

### 📎 Hand in here

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 3 · Day 6 — Section exam: SQL (Weeks 1–3) (weeks/week-03/day-6.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-03/day-6
=====

# Week 3 · Day 6 — Section exam: SQL (Weeks 1–3)

<span class="badge">Exam 60 min</span> <span class="badge">Interview 45 min</span> <span class="badge hw">Exam · 100 points</span>

> STORY **Exam day, 10:00.** Madina puts two sheets on the desk. *"Three weeks of SQL are behind you. Before we leave it, I want to see all of it in one place, the way a hiring manager at a lender would. First a written check. Then an interview. Your notes are welcome. Nobody answers for you."*

## Today in 3 lines

- You show that you know SQL as one subject: Day 0 and Weeks 1–3, from keys and filters to joins, windows and views.
- **Part A (40 points):** 25 quick questions with the classic traps inside. It is marked on the spot.
- **Part B (60 points):** an interview on the Nur Finance data — five questions you answer in words and three small tasks you work out. Your mentor reads it.

---

## 1. How the exam works

- **Two parts.** Part A is a quiz: 25 questions, 40 points, marked at once. Part B is an interview: eight written answers, 60 points, marked by your mentor.
- **Pass mark.** You need 70 of 100 points for the whole exam. Part A is also this day's quiz: 80 % right (20 of 25) marks the day as done in the menu. You can repeat Part A as often as you like, and your best attempt counts.
- **What it covers.** All of SQL: Day 0 and Weeks 1–3. About a third of the questions come from the early part (Day 0 and Week 1), because everything later stands on it.
- **Open book.** The course pages, your own notes and the [SQL playground](playground.md) are allowed. Chatbots and asking other people are not. A real interview works the same way: you may bring notes, but nobody answers for you.
- **Time.** Plan 60 minutes for Part A and 45 minutes for Part B.
- **Deadline.** Part B is due at 23:59 on the day of Week 4 · Day 1 (the menu shows the date). Part A can be taken any time before that.
- **After the exam.** Your mentor reviews Part B and sends structured feedback.

---

## 2. Part A — Quick check (40 points)

25 questions in one quiz. Some have one right answer, some have several, some ask for a number or a word. A few say *run it*: use the [SQL playground](playground.md) for those. After each answer the quiz tells you why. The questions follow the order in which you learned the material: Day 0, then Weeks 1, 2 and 3.

---

## 3. Part B — Interview (60 points)

Eight written answers. Write them as you would say them aloud to a hiring manager.

- **I1–I5 are interview questions.** Answer in 4–6 sentences and use one example from Nur Finance.
- **I6–I8 are small tasks on the data.** Put the query in a code block, then give the numbers you get and one sentence. Every number is as of 2026-10-01.
- Write in your own words. Short and exact beats long.

### 📎 Hand in here

---

## 4. Scoring and what happens next

| Part | Points | Marked by |
|---|---|---|
| A — Quick check | 40 | automatic, your best attempt |
| B — Interview | 60 | your mentor |
| **Total** | **100** | **70 or more passes** |

A pass closes the SQL block: you have shown that you can read, write and explain SQL, and Excel comes next. Below 70, the feedback names the topics to repeat, and you and your mentor decide when to try Part B again.

Your feedback arrives on the **[My feedback](feedback.md)** page and in the course bot. Your points go to the [Progress page](progress.md).
