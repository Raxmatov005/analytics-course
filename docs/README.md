# Analytics Learning — from zero to analyst in 8 weeks

> STORY You have just been hired as the first data analyst of **Nur Finance**, a lending company with branches in eight regions, a mobile app and five loan products. Every week a different team comes to you with a real request. By week 8 you run the company's numbers — and you can walk into any analyst interview and talk like someone who has done the job.

## How this course works

- **First, the [Practice day](practice.md).** It walks you through the routine once (run SQL on the page, answer, check, send, read the feedback) on three warm-up questions that do not count. Nothing to install.
- **One page per day.** Read it top to bottom; the day is done when you pass its quiz at the end. ~3 hours. The [course map](map.md) shows where you are.
- **Mon–Thu: learn and practise. Fri: checkpoint or a bigger homework.** Weekends are free (or catch-up).
- **Practice answers are folded** on the page — try first, then open. **Homework** goes to the `submissions/` folder (see [How to submit](homework/how-to-submit.md)); you get written feedback within a day and points on the [progress board](progress.md).
- **Every day ends with a short quiz.** Pass it with **80 %** and the day is done: it gets a tick in the sidebar, counts toward your streak and earns XP.
- **Levels, badges and real rewards.** Points, quiz days and daily challenges add up to XP; XP takes you from Intern to Lead Analyst. Every checkpoint you pass (70 %+) wins a voucher you can spend, each one bigger than the last; big results unlock big rewards. See your [progress & rewards](progress.md) board.
- **Check your homework yourself first:** the **✔ Check** button in each SQL workspace tells you task by task whether your numbers are right — without showing the answers. Then **📤 Submit** in the same box ([how](homework/how-to-submit.md)).
- **Skip what you know.** Start with [Day 0](weeks/week-00/day-0.md): five short tests. Score 80 %+ on a module → skip that week, do only its Friday checkpoint.
- **One dataset for everything:** the Nur Finance database (11 tables, 6,040 customers, 7,828 loans). You will know it like your own flat by week 3.
- **Depth is optional.** Every day links to the exact video minute or deck page if you want more; nothing depends on it. The full map is in [Sources](sources.md).

## The 8 weeks

| Week | You become able to… | Friday |
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

Running through all eight weeks: the **Company & metrics** track — the loan lifecycle, DPD / FPD / SPD / TPD, portfolio metrics, product metrics, and who does what in a lending company. [Glossary](company/glossary.md) · [Who does what](company/roles.md).

## Week 1 — Data & SQL basics

| Day | Page | Homework |
|---|---|---|
| 1 | [How a company keeps its data](weeks/week-01/day-1.md) — tables, keys, install, loan lifecycle | HW 1.1 (due D3) |
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

## Week 4 — Excel & Sheets

| Day | Page | Homework |
|---|---|---|
| 1 | [Excel for analysts: the sheet is a table](weeks/week-04/day-1.md) — Tables, SUMIFS/COUNTIFS, text functions; approval rate by channel | HW 4.1 (due D3) |
| 2 | [Lookups and dynamic arrays](weeks/week-04/day-2.md) — VLOOKUP, INDEX/MATCH, XLOOKUP, FILTER/UNIQUE, conditional formatting; DPD buckets | — |
| 3 | [Cleaning dirty data: Find & Replace to Power Query](weeks/week-04/day-3.md) — duplicates, bad dates, Power Query pipeline; collection rate | HW 4.2 (due D5) |
| 4 | [Pivot tables and charts: the one-page report](weeks/week-04/day-4.md) — pivots, slicers, chart choice; the portfolio one-pager | — |
| 5 | [Checkpoint: cleaned dataset + one-page report](weeks/week-04/day-5.md) | Checkpoint 4 |

Data for the week: `data/excel/` (CSV extracts + `nur_week4_start.xlsx`).

## Week 5 — Python for analysis

| Day | Page | Homework |
|---|---|---|
| 1 | [Python from zero: the notebook is your lab](weeks/week-05/day-1.md) — Jupyter, types, loops, functions, csv; the annuity formula | HW 5.1 (due D3) |
| 2 | [pandas I: the DataFrame is a table you can talk to](weeks/week-05/day-2.md) — read, filter, sort, dates, NaN, pd.cut; buckets and PAR | — |
| 3 | [pandas II: groupby, merge and the cleaning pipeline](weeks/week-05/day-3.md) — aggregations, joins, dedupe; DPD and FPD in pandas | HW 5.2 (due D5) |
| 4 | [Charts and the SQL bridge](weeks/week-05/day-4.md) — matplotlib, seaborn, read_sql; the figure pack | — |
| 5 | [Checkpoint: the EDA report, in pandas](weeks/week-05/day-5.md) | Checkpoint 5 |

Notebooks for the week: `data/python/` (starters + checkpoint template); install with `pip install -r requirements.txt`.

## Week 6 — Statistics

| Day | Page | Homework |
|---|---|---|
| 1 | [Probability and distributions: how random is a default?](weeks/week-06/day-1.md) — binomial, Poisson, normal, Bayes; expected loss | HW 6.1 (due D3) |
| 2 | [Samples, the CLT and confidence intervals](weeks/week-06/day-2.md) — standard error, Wilson, bootstrap; reporting a rate honestly | HW 6.2 (due D5) |
| 3 | [Hypothesis tests I: is the difference real?](weeks/week-06/day-3.md) — p-values, z, chi-square, t/Welch, effect size; the risk committee note | — |
| 4 | [Hypothesis tests II: non-parametric, multiple comparisons, power](weeks/week-06/day-4.md) — Mann–Whitney, Holm, sample size | — |
| 5 | [Checkpoint: intervals and the test-choice quiz](weeks/week-06/day-5.md) | Checkpoint 6 |

Notebooks for the week: `data/python/week6/`.

## Week 7 — A/B testing & Power BI

| Day | Page | Homework |
|---|---|---|
| 1 | [Designing an A/B test: before you touch the data](weeks/week-07/day-1.md) — metrics, guardrails, sample size, SRM, peeking; guardrails in lending | HW 7.1 (due D3) |
| 2 | [Analysing the A/B test: the result, the traps, the decision](weeks/week-07/day-2.md) — sanity checks, lift with CI, segments; the readout | — |
| 3 | [Power BI I: get data, Power Query, the model](weeks/week-07/day-3.md) — star schema, relationships, grain | HW 7.2 (due D5) |
| 4 | [Power BI II: DAX and visuals that tell the story](weeks/week-07/day-4.md) — CALCULATE, time intelligence; the three-page dashboard | — |
| 5 | [Checkpoint: A/B notebook + 3-page dashboard](weeks/week-07/day-5.md) | Checkpoint 7 |

Data for the week: `data/ab/` (the experiment), `data/powerbi/` (model tables + `measures.dax`), notebooks in `data/python/week7/`.

## Week 8 — Product analytics, capstone, interview

| Day | Page | Homework |
|---|---|---|
| 1 | [Product analytics I: metrics that matter, funnels and retention](weeks/week-08/day-1.md) — metric trees, the app funnel, repeat borrowing | — |
| 2 | [Product analytics II and the company day](weeks/week-08/day-2.md) — unit economics, storytelling, a lending company end to end, your CV | HW 8.1 (due D3) |
| 3 | [Capstone I: the brief and the analysis](weeks/week-08/day-3.md) — the 2026 portfolio review for the board | — |
| 4 | [Capstone II: dashboard and story](weeks/week-08/day-4.md) | — |
| 5 | [Presentation day, the mock interview, and what next](weeks/week-08/day-5.md) | Capstone + mock interview |

Before any interview: the [interview bank](company/interview.md) — 30 questions with model answers.

## Tools (free)

Weeks 1–3 need only this website (SQL runs on the pages). Later: Excel or Google Sheets · Python via Anaconda or Google Colab · Power BI Desktop · a GitHub account.


