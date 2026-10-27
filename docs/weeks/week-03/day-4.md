# Week 3 · Day 4 — Views, temp tables and making it fast

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge">Homework</span> <span class="badge company">Company corner</span>

> STORY **Thursday, 9:00.** Timur, BI (*BI-специалист*), with a laptop full of Power BI tabs. *"Every tile on my dashboard has its own copy of your DPD logic, pasted by a different person in a different year. Three of them disagree. Give me a **clean layer**: `v_loan_status` — one row per loan with DPD, bucket, outstanding and days on book; `v_portfolio_monthly` — one row per month × product × branch with disbursed count, amount and outstanding; `v_payments_clean` — de-duplicated, method normalised. I point Power BI at those three and delete everything else. And it has to refresh in seconds, not minutes."*

## Today in 3 lines

- A **view** is a saved query with a name: it hides joins and definitions, so one DPD rule serves every report — this is the warehouse layer week 7's Power BI will read.
- **Materialise** (`CREATE TABLE … AS SELECT`, `SELECT INTO`, temp tables) when a view is slow or must be frozen at a date; **indexes** turn a full-table *scan* into a *seek*, and you can see which happened in the **execution plan**.
- You know the **10 performance habits** that matter for analysts and have written Timur's three views.

---

## 1. Learn — saving the query, not the data

### Views (*представления*)

```sql
CREATE VIEW v_payments_clean AS
WITH ranked AS (
  SELECT payment_id, loan_id, installment_id, paid_at, amount,
         REPLACE(LOWER(TRIM(method)), 'bank transfer', 'transfer') AS method,
         ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn
  FROM payments)
SELECT payment_id, loan_id, installment_id, paid_at, amount, method FROM ranked WHERE rn = 1;

SELECT COUNT(*), SUM(amount), COUNT(DISTINCT method) FROM v_payments_clean;     -- 52 850 · 255 114 772 176 · 5
```

A view stores the **text** of the query, not its result. Every `SELECT … FROM v_payments_clean` runs the inner query at that moment, on the current data — so it is always fresh and costs the same as the query it wraps. What you gain: **one definition** (the duplicate rule and the method cleaning live in one place; fix them once, every report changes), **a simpler surface** (Timur sees six clean columns, not a `ROW_NUMBER`), and **security** (a view can expose some columns and hide `phone`). Views can be built on views: `v_loan_status` below reads `v_payments_clean`, so the dedup is inherited. `DROP VIEW name` removes it; SQL Server has `CREATE OR ALTER VIEW` for edits, SQLite `DROP` then `CREATE`.

> 💡 **Key idea.** A view saves the **query**, not the data. Reading it runs the query again on today's rows — always fresh, never faster than the query inside. What you buy is one definition in one place.

**Why Power BI gets views, not tables.** Week 7's dashboard will refresh from the database. If it reads raw `payments`, every measure must repeat the dedup and the DPD CTE in DAX — three people, three versions, Timur's problem. If it reads `v_loan_status`, the measure is `SUM(outstanding)`. The views *are* the data model: one row per loan, one row per month × product × branch, one row per payment. A view's **grain** — the noun that is one row — is the first line of its documentation.

### Materialising: CTAS, SELECT INTO, temp tables

Views recompute. Sometimes you want the **result** stored: a snapshot as of a date (regulatory reports are frozen), an expensive query read by many people, or an intermediate result reused in a long script. Three tools:

| Tool | SQL Server | SQLite | Lives |
|---|---|---|---|
| **CTAS** — create table as select | `SELECT … INTO new_table FROM …` | `CREATE TABLE new_table AS SELECT …` | until dropped |
| **Temp table** | `SELECT … INTO #tmp FROM …` (`#` = temp) | `CREATE TEMP TABLE tmp AS SELECT …` | until the session ends |
| **Table variable** (SQL Server only) | `DECLARE @t TABLE (…)` | — | the batch |

```sql
CREATE TABLE t_loan_status AS SELECT * FROM v_loan_status;      -- SQL Server: SELECT * INTO t_loan_status FROM v_loan_status
-- 7 828 rows, frozen as of 2026-10-01; the view keeps moving, the table does not
```

Measured on our 9.6 MB SQLite file: `SELECT bucket, COUNT(*) FROM v_loan_status GROUP BY bucket` — **0.49 s** through the view, **0.00 s** from the materialised table; `v_portfolio_monthly` for one month — **12.8 s** through the view (it recomputes month-end outstanding for 34 months), instant from a table. **When to materialise:** when the view is slow *and* the data changes rarely (a nightly table is the standard warehouse answer — bronze/silver/gold from week 1's video); when the number must not change after it is published; when a script needs the same intermediate result five times (temp table, not five CTE copies). **When not to:** when freshness matters more than speed, or when the "table" will quietly go stale and disagree with the view — Timur's three tiles were exactly that: stale copies.

> ⚠️ **Watch out.** A view and a table built from it look identical on the day you make them. A week later the view has the new payments and the table does not — and nobody can tell which tile reads which. Name them so the difference shows (`v_…` for views, `t_…` or `_asof_20261001` for frozen tables).

```game
{"type": "sort", "id": "w03d4-g1", "title": "View, table or temp table?", "q": "Tap each situation, then what you would build for it.", "groups": {"View": ["Power BI's loan-status tile, which must show today's DPD", "One de-duplication rule that every report must share"], "Materialised table (CTAS / SELECT INTO)": ["The September month-end pack, frozen once it is sent to the board", "A 12-second query that 40 people open every morning, refreshed nightly"], "Temp table": ["An intermediate result reused five times in one long script, gone when you disconnect"]}}
```

### Indexes (*индексы*) — the phone book

Without an index the engine reads **every row** to answer `WHERE loan_id = 2242` — a **scan**. An index is a sorted copy of one or more columns with pointers to the rows; with it the engine jumps to the right place — a **seek** (SQLite says `SEARCH`). Like finding a name in a phone book instead of reading it cover to cover.

```sql
CREATE INDEX ix_payments_installment ON payments (installment_id);
CREATE INDEX ix_installments_due     ON installments (due_date);
```

**SQL Server has two kinds.** A **clustered index** *is* the table: the rows themselves are stored in that order (one per table, usually the primary key — `loan_id`). **Non-clustered** indexes are separate sorted structures pointing into it (many per table). SQLite's `rowid` plays the clustered role; our course tables were loaded without declared primary keys, so `WHERE loan_id = 2242` scans until you add `CREATE UNIQUE INDEX ix_loans_id ON loans (loan_id)`.

**When a WHERE or JOIN benefits:** equality or range on the indexed column (`installment_id = ?`, `due_date >= ? AND due_date < ?`), a join on it (every `payments.installment_id = installments.installment_id`), an `ORDER BY` it. **When it does not:** a function wrapped around the column (`strftime('%Y-%m', due_date) = '2026-09'`, `LOWER(method) = 'card'`) — the engine cannot look up a value it has to compute per row; `LIKE '%x'`; a column with two values (`is_weekend`). Indexes cost space and slow every `INSERT`/`UPDATE` slightly — on an analytics copy that is almost always worth it; on the transactional system it is the DBA's call, not yours.

```game
{"type": "sort", "id": "w03d4-g2", "title": "Can the index help?", "q": "Each column in these filters has an index. Tap a filter, then where it belongs.", "groups": {"Index helps (SEARCH)": ["WHERE installment_id = 59838", "WHERE due_date >= '2026-09-01' AND due_date < '2026-10-01'", "JOIN payments p ON p.installment_id = i.installment_id"], "Index cannot help (SCAN)": ["WHERE strftime('%Y-%m', due_date) = '2026-09'", "WHERE LOWER(method) = 'card'", "WHERE method LIKE '%card'"]}}
```

### Reading an execution plan (*план выполнения*) — scan or seek

SQL Server: *Display Estimated Execution Plan* (Ctrl+L) draws boxes; read them right to left, look for **Table Scan / Clustered Index Scan** (bad on big tables) vs **Index Seek** (good), and thick arrows (many rows). SQLite: `EXPLAIN QUERY PLAN` in front of the query prints one line per table:

```sql
EXPLAIN QUERY PLAN SELECT * FROM payments WHERE loan_id = 2242;
-- before:  SCAN payments
-- after CREATE INDEX ix_payments_loan ON payments (loan_id):  SEARCH payments USING INDEX ix_payments_loan (loan_id=?)

EXPLAIN QUERY PLAN SELECT COUNT(*) FROM installments WHERE strftime('%Y-%m', due_date) = '2026-09';
-- SCAN installments USING COVERING INDEX ix_installments_due          ← still a scan: the function hides the column
EXPLAIN QUERY PLAN SELECT COUNT(*) FROM installments WHERE due_date >= '2026-09-01' AND due_date < '2026-10-01';
-- SEARCH installments USING COVERING INDEX ix_installments_due (due_date>? AND due_date<?)   ← week 2's half-open filter, rewarded
```

Week 2's DPD join: before indexing, `SCAN i` plus an `AUTOMATIC COVERING INDEX` on payments (SQLite built a throw-away index for the join — a hint that a real one is missing); after, `SEARCH i USING INDEX ix_installments_due` and `SEARCH p USING INDEX ix_payments_installment`. That is the whole skill at analyst level: *does my filter/join column have an index, and does the plan say SCAN or SEARCH?*

> ⚠️ **Watch out.** A function around an indexed column hides it from the index: `strftime('%Y-%m', due_date) = '2026-09'` and `YEAR(disbursed_at) = 2026` both scan. Move the work to the other side — a half-open range on the bare column.

```game
{"type": "bug", "id": "w03d4-g3", "title": "Find the slow line", "q": "due_date has an index, yet the plan says SCAN. Which line turns the SEARCH into a SCAN?", "code": "CREATE INDEX ix_installments_due ON installments (due_date);\nSELECT COUNT(*)\nFROM installments\nWHERE strftime('%Y-%m', due_date) = '2026-09';", "answer": [3], "why": "The engine cannot look up a value it must compute for every row. WHERE due_date >= '2026-09-01' AND due_date < '2026-10-01' gives the same count with a SEARCH."}
```

### The 10 performance habits that matter for analysts

1. **Select only the columns you need** — `SELECT *` into Power BI drags `phone` and `app_version` through the network for nothing.
2. **Filter early** — `WHERE` on the base table before joining; a CTE that filters to 2026 before the join to instalments touches a quarter of the rows.
3. **No functions on indexed columns in WHERE** — half-open date ranges, not `strftime`/`YEAR()`; clean the *data* (a view with the cleaned method) rather than `LOWER()` in every filter.
4. **Never use `DISTINCT` to hide a join bug** — `SELECT DISTINCT` after a one-to-many join (92 193 rows from 7 828 loans) *looks* right and is slow and wrong (the sums are still multiplied). Fix the grain: aggregate first, then join.
5. **Aggregate at each grain, then join the aggregates** (yesterday's chain) — smaller intermediate results, no multiplication.
6. **Use `EXISTS` instead of `IN` with large subqueries, `UNION ALL` instead of `UNION`** when you do not need duplicates removed — `UNION` sorts to deduplicate.
7. **Index join and filter columns** on your analytics copy — `installment_id`, `loan_id`, `due_date`, `paid_at`, `disbursed_at`.
8. **Materialise what is slow and stable** (a nightly table), **keep views for what must be fresh**.
9. **Avoid correlated subqueries over big tables** when a window or a join does the same (P5 yesterday: 4 335 subqueries vs one `ROW_NUMBER`).
10. **Look at the plan before you blame the server** — `EXPLAIN QUERY PLAN` / Ctrl+L; if it says SCAN on a table of 92 193 rows, you know what to do.

> 💡 **Key idea.** Eight of the ten habits are about *doing less work*: fewer columns, fewer rows earlier, no repeated rows, no per-row subqueries. Only habit 7 (indexes) and habit 8 (materialise) add something.

### Depth (optional)

- ▶ Baraa, *Views* [15:35:02](https://youtu.be/SSKVgrwhzus?t=56102&end=59800), *CTAS and temp tables* [16:36:40](https://youtu.be/SSKVgrwhzus?t=59800&end=62251), *Indexes* [18:23:42](https://youtu.be/SSKVgrwhzus?t=66222&end=73231), *Execution plan* [20:20:31](https://youtu.be/SSKVgrwhzus?t=73231&end=76263), *30 performance tips* [21:43:39](https://youtu.be/SSKVgrwhzus?t=78219&end=80665) — long; watch Views + Indexes + the tips (≈2 h), the plan chapter if SQL Server is your target. Stored procedures and triggers (17:27:04, 18:12:58) are optional for an analyst.
- *Russian terms:* представление = view, временная таблица = temp table, материализация = materialisation, индекс = index, кластерный / некластерный = clustered / non-clustered, план выполнения = execution plan, полное сканирование = full scan, поиск по индексу = index seek.

```videoquiz
{"video": "SSKVgrwhzus", "stops": [
  {"at": 57900, "q": "What does a view store in the database?", "options": ["A copy of the result rows", "The query text — it runs again every time you read the view", "An index", "Nothing; it disappears after the session"], "answer": 1, "explain": "A view is a saved query: always fresh, and as slow as the query it wraps."},
  {"at": 61000, "q": "CREATE TABLE … AS SELECT (SELECT INTO in SQL Server) gives you…", "options": ["A view with a new name", "A new physical table holding the result as of now", "A temporary index", "A stored procedure"], "answer": 1, "explain": "CTAS materialises the result: fast to read, frozen until you rebuild it."},
  {"at": 69500, "q": "A table has a clustered index on its id. What does that mean?", "options": ["There is a separate sorted copy of the id column", "The rows themselves are stored in id order — only one per table", "The table is split across servers", "The id cannot repeat"], "answer": 1, "explain": "The clustered index is the table's storage order; non-clustered indexes are separate structures pointing into it."},
  {"at": 79500, "q": "Which of these is a performance tip you will hear for analysts?", "options": ["Use SELECT * so nothing is missing", "Filter early and select only the columns you need", "Wrap filter columns in functions", "Use DISTINCT to fix duplicates after joins"], "answer": 1, "explain": "Less data through every step; the other three are the classic slow (or wrong) habits.", "back": 60}]}
```

---

## 2. Worked example — `v_loan_status` (15 min)

Grain: **one row per loan**, all 7 828, including closed and written-off ones (Timur filters in the tool). Definitions: DPD and bucket as week 2 (payments through the as-of date, via the clean view); outstanding = `principal_due` of instalments due after the as-of date; days on book = as-of − disbursed.

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
  SELECT loan_id, CAST(julianday('2026-10-01') - julianday(MIN(due_date)) AS INTEGER) AS dpd,     -- DATEDIFF(day, MIN(due_date), '2026-10-01')
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

Start with the lab: a view of your own, on a table of your own, so you can watch what a view does when the data changes. Then the questions: write each query in the box under its question — it is saved in this browser. **✔ Check** tells you whether your result matches the answer. Indexes and new tables change only your practice copy of the database — **Database → ↺ Reset** brings the original back. Several questions use Timur's views: run the `CREATE VIEW` boxes in sections 1, 2 and 6 once first (`v_portfolio_monthly` is in section 6 — the Company corner).

```sqllab
{"id": "w03d4-lab", "title": "A view that moves, a table that does not", "intro": "You copy the SME loans into a table of your own, put a view on top, change the table, and watch the view follow. Then you freeze the view into a table and see the two drift apart. Everything happens in your practice copy.", "steps": [
  {"say": "Create my_loans with CREATE TABLE … AS: loan_id, product_id, principal, status of every SME loan (product_id = 5).", "hint": "CREATE TABLE my_loans AS SELECT loan_id, product_id, principal, status FROM loans WHERE product_id = 5;", "expect": "SELECT COUNT(*) FROM my_loans", "want": 781},
  {"say": "Create the view my_v_active_sme: loan_id and principal of the active loans in my_loans. Then query it: SELECT COUNT(*) FROM my_v_active_sme.", "hint": "CREATE VIEW my_v_active_sme AS SELECT loan_id, principal FROM my_loans WHERE status = 'active';", "expect": "SELECT COUNT(*) FROM sqlite_master WHERE type = 'view' AND name = 'my_v_active_sme'", "want": 1},
  {"say": "Close the biggest SME loan in your table: UPDATE my_loans SET status = 'closed' WHERE loan_id = 2861. Query the view again — you did not touch it, yet it changed.", "hint": "UPDATE my_loans SET status = 'closed' WHERE loan_id = 2861;", "expect": "SELECT COUNT(*) FROM my_v_active_sme", "want": 589},
  {"say": "Freeze it: CREATE TABLE my_t_active_sme AS SELECT * FROM my_v_active_sme. Then close loan 4601 in my_loans as well.", "hint": "CREATE TABLE my_t_active_sme AS SELECT * FROM my_v_active_sme; UPDATE my_loans SET status = 'closed' WHERE loan_id = 4601;", "expect": "SELECT (SELECT COUNT(*) FROM my_v_active_sme) - (SELECT COUNT(*) FROM my_t_active_sme)", "want": -1},
  {"say": "The view has 588 rows, the frozen table still 589 — that is the whole difference between them. Now remove the view with DROP VIEW.", "hint": "DROP VIEW my_v_active_sme;", "expect": "SELECT COUNT(*) FROM sqlite_master WHERE type = 'view' AND name = 'my_v_active_sme'", "want": 0}],
 "cleanup": "DROP VIEW IF EXISTS my_v_active_sme; DROP TABLE IF EXISTS my_t_active_sme; DROP TABLE IF EXISTS my_loans"}
```

**P1.** Create `v_payments_clean` and prove it: rows, total, distinct methods, and that no instalment has two rows left.

<details><summary>Answer</summary>

Section 1's view. `SELECT COUNT(*), SUM(amount), COUNT(DISTINCT method) FROM v_payments_clean` → 52 850 · 255 114 772 176 · 5; `SELECT MAX(c) FROM (SELECT installment_id, COUNT(*) c FROM v_payments_clean GROUP BY 1)` → 1.

</details>

**P1 — the number.** How many rows does `v_payments_clean` have?

```task
{"id": "w03d4-p1b", "kind": "number", "answer": 52850, "dp": 0, "unit": "payments", "hint": "SELECT COUNT(*) FROM v_payments_clean — after running section 1's CREATE VIEW box.", "model": "52 850 = 52 875 raw rows minus the 25 duplicates; 255 114 772 176 UZS, 5 methods, and MAX rows per (instalment, date, amount) = 1.", "xp": 1}
```

**P2.** Create `v_loan_status` (worked example) and run the four checks. Then: outstanding by `region` and `bucket` from the view only — how long is that query compared with writing it from the raw tables (week 2's DPD chain plus the joins)?

<details><summary>Answer</summary>

Checks as above. `SELECT region, bucket, SUM(outstanding) FROM v_loan_status GROUP BY 1, 2` — two lines instead of three joins and a CTE; Tashkent 90+ carries the largest dead outstanding. The point of the layer: the *question* is two lines, the *definition* is somewhere else, once.

</details>

**P2 — the grain check.** `SELECT COUNT(*), COUNT(DISTINCT loan_id) FROM v_loan_status` returns 92 193 and 7 828. What happened?

```task
{"id": "w03d4-p2b", "kind": "choice", "options": ["Nothing — a loan has many rows in a status view", "A join multiplied the rows: the view joins instalments (or payments) at the wrong grain", "DISTINCT is broken", "The as-of date is wrong"], "answer": 1, "explain": "The grain of v_loan_status is one row per loan; 92 193 is the number of instalments. Aggregate instalments per loan in a CTE, then join once — the two numbers must be equal.", "xp": 1}
```

**P3.** `EXPLAIN QUERY PLAN` for `SELECT * FROM payments WHERE loan_id = 2242` before and after `CREATE INDEX ix_payments_loan ON payments (loan_id)`. Copy both lines.

<details><summary>Answer</summary>

`SCAN payments` → `SEARCH payments USING INDEX ix_payments_loan (loan_id=?)`. (SQL Server: Table Scan → Index Seek in the graphical plan.)

</details>

**P3 — read the plan.** Which line does the plan show *after* the index exists?

```task
{"id": "w03d4-p3b", "kind": "choice", "options": ["SCAN payments", "SEARCH payments USING INDEX ix_payments_loan (loan_id=?)", "SCAN payments USING COVERING INDEX ix_payments_loan", "USE TEMP B-TREE FOR ORDER BY"], "answer": 1, "explain": "SEARCH = the engine jumps to the matching rows through the index (SQL Server: Index Seek). SCAN = reads every row.", "xp": 1}
```

**P4.** Two filters for September instalments — `strftime('%Y-%m', due_date) = '2026-09'` and the half-open range — with `ix_installments_due` in place. Plans? Same count?

<details><summary>Answer</summary>

Same count (the September instalments). Plans: `SCAN installments USING COVERING INDEX` for the function version — it still reads every entry; `SEARCH … (due_date>? AND due_date<?)` for the range. Habit 3.

</details>

**P4 — read the plan.** Which statement is true?

```task
{"id": "w03d4-p4b", "kind": "choice", "options": ["Different counts, same plan", "Same count; the function version SCANs, the half-open range SEARCHes", "Same count; both SEARCH", "The function version is faster because it reads fewer columns"], "answer": 1, "explain": "The answer does not change; the work does. Habit 3: no functions on indexed columns in WHERE.", "xp": 1}
```

**P5.** The clustered question: `EXPLAIN QUERY PLAN SELECT * FROM loans WHERE loan_id = 2242` vs `WHERE rowid = 2242`. Why do they differ, and what fixes the first?

<details><summary>Answer</summary>

`SCAN loans` vs `SEARCH loans USING INTEGER PRIMARY KEY (rowid=?)`: the table was loaded without a declared key, so `loan_id` is an ordinary column while `rowid` is the storage order (SQLite's clustered index). `CREATE UNIQUE INDEX ix_loans_id ON loans (loan_id)` → `SEARCH loans USING INDEX ix_loans_id`. In SQL Server you would declare `loan_id` the clustered primary key when creating the table.

</details>

**P5 — why?** Why does `WHERE rowid = 2242` SEARCH while `WHERE loan_id = 2242` SCANs?

```task
{"id": "w03d4-p5b", "kind": "choice", "options": ["rowid is a number and loan_id is text", "rowid is the table's storage order (its clustered key); loan_id was loaded as an ordinary column with no index", "SQLite cannot index loan_id", "loan_id has duplicates"], "answer": 1, "explain": "Add CREATE UNIQUE INDEX ix_loans_id ON loans (loan_id) and the plan becomes SEARCH … USING INDEX ix_loans_id. In SQL Server you would make loan_id the clustered primary key.", "xp": 1}
```

**P6.** Habit 4: `SELECT COUNT(*), COUNT(DISTINCT l.loan_id) FROM loans l JOIN installments i ON i.loan_id = l.loan_id`. Someone "fixes" a multiplied report with `SELECT DISTINCT l.loan_id, l.principal …` and then sums. What is still wrong?

<details><summary>Answer</summary>

```sql
SELECT COUNT(*), COUNT(DISTINCT l.loan_id) FROM loans l JOIN installments i ON i.loan_id = l.loan_id;
-- 92193 · 7828
```
92 193 vs 7 828. `DISTINCT` on (loan_id, principal) does collapse to 7 828 rows — but only because those two columns are the same on every repeat; add any instalment column and it multiplies again, and `SUM(principal)` *before* the `DISTINCT` (the common mistake) is 24× too big. The fix is the grain: sum instalments per loan in a CTE, then join once.

</details>

**P6 — what is still wrong?** Pick every true statement.

```task
{"id": "w03d4-p6b", "kind": "multi", "options": ["Add any instalment column to the DISTINCT list and the rows multiply again", "SUM(principal) taken before the DISTINCT is still about 24× too big", "DISTINCT also hides real duplicate loans that should be investigated", "The fix is to aggregate instalments per loan first, then join once"], "answer": [0, 1, 3], "explain": "DISTINCT collapses rows only by accident of the column list; the grain is still wrong underneath. (There are no duplicate loans here — the multiplication comes from the join.)", "xp": 1}
```

**P7.** Create `t_loan_status` as a materialised copy (CTAS / `SELECT INTO`). Time the bucket count from the view and from the table. When would you ship the table instead of the view?

<details><summary>Answer</summary>

≈0.5 s vs ≈0 s here; the difference grows with data. Ship the table for a frozen month-end report or a nightly refresh; keep the view where the as-of must be *now*. Name it so nobody confuses them (`t_` / `v_`, or `_asof_20261001`).

</details>

**P7 — table or view?** Answer Timur in two or three sentences: when would you ship `t_loan_status` instead of `v_loan_status`?

```task
{"id": "w03d4-p7b", "kind": "free", "min": 20, "model": "I would ship the table when the number must not move after it is published — the month-end pack for the board — or when the view is slow and the data changes rarely, so a nightly rebuild is enough. Where Timur needs today's DPD, the view stays. I would name the table so nobody mistakes it for the live one, e.g. t_loan_status_asof_20261001.", "rubric": ["Table for frozen / published numbers", "Table when slow and rarely changing (nightly refresh)", "View where freshness matters", "Naming that shows which is which"], "xp": 1}
```

**P8.** `v_portfolio_monthly`: build it (run the `CREATE VIEW v_portfolio_monthly` box in section 6 — the Company corner — once), check 1 700 rows = 34 months × 5 × 10, and reconcile September 2026 month-end outstanding with the as-of figure. Why do they differ by about 480 m?

<details><summary>Answer</summary>

208 243 879 623 (month end 30 Sep) vs 208 723 504 430 (as of 1 Oct). The month-end view excludes the 21 loans disbursed on 1 October (852 760 000 of principal, none yet repaid) and counts instalments due *on* 1 October as still outstanding (they are not yet due at midnight on 30 Sep). Two correct numbers, two definitions — write both in the data dictionary.

</details>

**P8 — why the gap?** Pick every reason that is part of the difference.

```task
{"id": "w03d4-p8b", "kind": "multi", "options": ["The month-end view leaves out the 21 loans disbursed on 1 October", "Instalments due on 1 October still count as outstanding at the end of 30 September", "One of the two queries is wrong", "Payments made on 1 October"], "answer": [0, 1], "explain": "Two definitions, both correct: month end (30 Sep) and as-of (1 Oct). The new loans add 852.8 m; the instalments falling due on 1 October take some of it back — net about 480 m. Write both in the dictionary.", "xp": 1}
```

**P9.** Pick five of the ten habits and show, with one query each on our data, the slow form and the fast form (plans or row counts as evidence).

```task
{"id": "w03d4-p9", "kind": "free", "min": 60, "model": "Habit 1: SELECT * FROM v_loan_status returns 16 columns, SELECT loan_id, bucket, outstanding three — same 7 828 rows, a fifth of the width. Habit 3: strftime('%Y-%m', due_date) = '2026-09' → SCAN installments USING COVERING INDEX; due_date >= '2026-09-01' AND due_date < '2026-10-01' → SEARCH, same count. Habit 4: loans JOIN installments → 92 193 rows for 7 828 loans; aggregate per loan first → 7 828. Habit 5: Wednesday's P6 chain joins customers to 10 rows instead of 92 193. Habit 9: latest loan per customer with ROW_NUMBER and with the correlated = MAX subquery — both 4 335 rows, the window in one pass.", "rubric": ["Five habits named", "A slow and a fast query for each", "Evidence for each: a plan line, a row count or a timing", "Same answer from both forms where it should be"], "xp": 2}
```

<details><summary>Answer</summary>

Any five with evidence — e.g. habit 1 (`SELECT *` vs three columns: compare the width), 3 (P4), 4 (P6), 5 (yesterday's P6 chain vs a join of raw tables), 9 (`ROW_NUMBER` latest loan vs the correlated `= MAX` subquery: same 4 335 rows). Full marks for *evidence*, not for prose.

</details>

**P10.** A temp table for a long script: `CREATE TEMP TABLE tmp_dpd AS SELECT loan_id, dpd, bucket, outstanding FROM v_loan_status WHERE dpd > 0`; count it; then run three questions against it (by bucket, by product via a join, average DPD of active loans).

<details><summary>Answer</summary>

399 rows. Bucket counts 124/25/16/234; by product SME carries the most overdue money, Consumer the most late loans (week 2 T11); active delinquent loans average 22.7 DPD. The temp table disappears when you close the connection — which is the point: scratch space, not a report.

</details>

**P10 — the count.** How many rows does `tmp_dpd` have?

```task
{"id": "w03d4-p10b", "kind": "number", "answer": 399, "dp": 0, "unit": "loans", "hint": "SELECT COUNT(*) FROM tmp_dpd after the CREATE TEMP TABLE.", "model": "399 loans with DPD above 0: 124 + 25 + 16 + 234. Active delinquent loans average 22.7 days.", "xp": 1}
```

> 🚀 **Stretch (optional, +5 XP).** The whole week in one query — and a question Nilufar will want answered before the next credit committee.

**P11.** Tuesday's P3 found 101 customers lent to again after a written-off loan. Using `v_loan_status` and `applications`, list the officers (`officer_id`) who approved the most such repeat loans, and the FPD30 of those repeat loans versus the book.

```task
{"id": "w03d4-p11", "kind": "free", "min": 40, "model": "Repeat loans: a CTE that self-joins loans on customer_id where the later loan's disbursed_at is after a written-off loan's. Join applications on application_id for officer_id, COUNT per officer and RANK() OVER (ORDER BY COUNT(*) DESC). For FPD30, join week 2's flags block (on v_payments_clean) to the repeat loans and compare their rate with the book's 1.28 %, quoting the count beside the rate — with about a hundred loans, one loan moves the rate by about a point. Finding for Nilufar: which officers re-lend after write-offs, and whether those loans start worse.", "rubric": ["Repeat loans defined with a self-join and a date condition", "Officer from applications, counted and ranked with a window", "FPD30 of the repeat loans next to the book's 1.28 %", "Counts quoted beside rates (small group)"], "xp": 2}
```

<details><summary>Answer</summary>

Self-join `loans` to find the repeat loans (same customer, `disbursed_at` later than a written-off loan's), join `applications` for `officer_id`, group and rank; then join week 2's `flags` block for FPD30. Expect the repeat loans to run well above 1.28 % — read your number and quote it with its count; small groups move a lot. The structure (CTE for repeats → join officer → aggregate → rank) is the week in one query.

</details>

---

## 4. Homework <span class="badge hw">HW 3.2 — Due Day 5</span>

**Timur's clean layer.** Everything goes into the 📎 box below; the four reconciliation queries are checked by the page itself (**▶ Run**, **✔ Check**).

1. **views.sql** — `CREATE VIEW` for `v_payments_clean`, `v_loan_status`, `v_portfolio_monthly`, in that order (the second reads the first), each preceded by a header comment: grain, as-of date, source tables. Both dialects where they differ (`julianday` vs `DATEDIFF`, `WITH RECURSIVE` vs `WITH`, `CREATE TABLE AS` vs `SELECT INTO`), or a clear dialect header.
2. **dictionary.md** — one paragraph per view: **grain** (what is one row), **row count**, each **column** with its definition in one line (e.g. *outstanding — sum of `principal_due` over instalments with `due_date > as-of`*), the **as-of** rule, and known caveats (closed loans in 1–30; month-end vs as-of outstanding; the 25 removed duplicates).
3. **R1–R4 — the reconciliation, recomputed from the raw tables.** Every view ships with a check: an independent query that gets the view's key totals straight from `payments`, `installments` and `loans`, with the view's definition written inline as a CTE. If the view and the raw recomputation agree, the view is right. R1: rows and total of the de-duplicated payments (52 850 / 255 114 772 176). R2: outstanding as of 2026-10-01 and the number of loans that still owe (208 723 504 430 / 3 409). R3: loans per DPD bucket for all 7 828 loans, payments de-duplicated and counted through the as-of date (7 429 / 124 / 25 / 16 / 234). R4: outstanding at the end of September 2026, the month-end definition (208 243 879 623).

> ⚠️ **Watch out.** The checker runs R1–R4 on an untouched copy of the data, where your views do not exist. That is on purpose: a check that reads the view cannot catch a bug in the view. Write the definition inline (`WITH pc AS (… ROW_NUMBER() …)`) and run against the raw tables. In your own `checks.sql` at work you would add the same totals read from the view, side by side.

### 📎 Hand in here

```sqltask
{"check": "handin-W3D4", "lesson": "W3D4", "title": "HW 3.2", "file": "checks.sql", "why": "Timur points Power BI at these three views and deletes every pasted copy of the DPD logic. A view nobody can reconcile is worse than no view — the checks are what make the layer trustworthy.", "graded": ["R1–R4: ✔ Check passes — your raw recomputation matches the view's totals", "views.sql: the three views create in order, each with a header (grain, as-of, sources)", "dictionary.md lets Timur use every column without reading the SQL", "One definition of DPD and outstanding across all three views"], "tasks": [{"id": "views.sql", "file": "views.sql", "text": true, "minLines": 20, "q": "The three CREATE VIEW statements, in order, each with its header comment."}, {"id": "dictionary.md", "file": "dictionary.md", "text": true, "minLines": 12, "q": "One paragraph per view: grain, row count, every column in one line, the as-of rule, caveats."}, {"id": "R1", "q": "De-duplicated payments from the raw table (ROW_NUMBER inline): number of rows and total amount."}, {"id": "R2", "q": "Outstanding as of 2026-10-01 from installments, and how many loans still owe."}, {"id": "R3", "q": "Loans per DPD bucket (0 / 1-30 / 31-60 / 61-90 / 90+) for all 7 828 loans, payments de-duplicated and through the as-of date — five rows."}, {"id": "R4", "q": "Outstanding at the end of September 2026: principal_due of instalments due on or after 2026-10-01, for loans disbursed before 2026-10-01."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else you want your mentor to see (one more file, or a .zip of several)."}]}
```

---

## 5. Self-check

```check
{"id": "w03d4-sc", "questions": [
  {"type": "single", "q": "A view and a materialised table of the same query. A payment is added tonight. Which is true tomorrow?", "options": ["Both show it; the view is faster", "The view shows it, the table does not; the table is faster to read", "The table shows it, the view does not", "Neither shows it"], "answer": 1, "explain": "The view re-runs its query on every read; the table holds the result as of the moment it was built (→ section 1, Views; Materialising)."},
  {"type": "single", "q": "WHERE YEAR(disbursed_at) = 2026 on an indexed disbursed_at — scan or seek, and the rewrite?", "options": ["Seek; nothing to rewrite", "Scan; WHERE disbursed_at >= '2026-01-01' AND disbursed_at < '2027-01-01'", "Scan; drop the index", "Seek, but only in SQL Server"], "answer": 1, "explain": "A function around the column hides it from the index; the half-open range on the bare column can SEARCH (→ section 1, Indexes; Execution plan)."},
  {"type": "single", "q": "Why is SELECT DISTINCT after a one-to-many join a trap rather than a fix?", "options": ["DISTINCT is not allowed after JOIN", "It hides the multiplied rows only for some column lists; sums taken on the joined rows are still wrong, and it is slow", "It removes real loans", "It changes the join type"], "answer": 1, "explain": "Fix the grain instead: aggregate per loan first, then join once (→ habit 4; P6)."}]}
```

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

Two of the views you built in sections 1 and 2. The third, **`v_portfolio_monthly`**, is the trend behind tiles 1 and 2 — one row per month × product × branch, built on a recursive calendar so that empty cells exist as zeros. Run this box once; P8 and the tile queries below need it:

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
-- 1 700 rows; 2026 month-end outstanding: Jan 151.8 bn · Mar 164.0 · Jun 184.6 · Aug 203.8 · Sep 208.2 bn
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

```game
{"type": "match", "id": "w03d4-g4", "title": "Tile and definition", "pairs": [["Outstanding", "sum of principal of instalments not yet due, as of the date"], ["Disbursements MTD", "loans and principal disbursed this month so far"], ["PAR30", "outstanding of loans with DPD > 30 ÷ total outstanding"], ["NPL90", "outstanding of loans with DPD > 90 ÷ total outstanding"], ["FPD30, last mature vintage", "first payment 30+ late, newest cohort whose first due dates are all 30 days old"], ["Collection rate", "paid by month end ÷ due in the month, same instalments"]]}
```

**Reading the six together.** Outstanding grows ~7 bn a month (151.8 bn in January to 208.2 bn in September) while disbursements run 12–22 bn: most of what is lent is repaid within the year (short Micro/BNPL/Consumer terms). PAR30 3.1 % and NPL90 2.6 % are close — the delinquent book is mostly *old*: 5.3 of the 6.5 bn at risk is already 90+. FPD30 at 1.1 % for July is in line with the 1.28 % history. A 94 % collection rate on September's dues means 6 % of what fell due is unpaid a month later — the inflow to Sevara's 1–30 bucket (117 loans entered it from current between 1 September and 1 October — Tuesday's roll-rate matrix; the bucket itself holds 124). One page, six numbers, and every one of them traceable to a view and a definition — that is what "a clean layer" buys.

> 🎯 **Interview version.** *"What goes on the first page of a lending dashboard, and where do the numbers come from?"* The interviewer listens for the six tiles, for where each number is computed (a view, not the dashboard), and for how you know the views agree. Say it in the box below, then compare.

**Say it like in an interview.** Answer the question above in 3–5 sentences, as you would aloud, with one Nur Finance number.

```task
{"id": "w03d4-int", "kind": "free", "min": 30, "model": "Six numbers: outstanding, disbursements month to date, PAR30, NPL90, FPD30 of the last mature vintage and the collection rate. Each comes from a view with a stated grain and as-of rule — a loan-level status view with DPD, bucket and outstanding, a monthly portfolio view per month, product and branch, and a de-duplicated payments view — so the dashboard only sums and divides and one DPD definition serves every tile. At Nur Finance on 1 October 2026 that page reads 208.7 bn outstanding, PAR30 3.12 %, NPL90 2.55 %, collection rate 94.1 % for September. I write the definition under each tile and ship every view with a reconciliation query, for example month-end versus as-of outstanding.", "rubric": ["Names the six tiles (or most of them)", "Numbers computed in views with a grain and an as-of rule, not in the dashboard", "One definition shared by all tiles", "Reconciliation / check queries between views", "Quotes at least one real number"], "xp": 2}
```

Tomorrow: the checkpoint — the whole week as one written EDA report on the loan book, and eight interview questions.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w03d4", "pass": 0.8, "questions": [
  {"type": "single", "q": "You have v_loan_status (a view) and t_loan_status (CREATE TABLE … AS SELECT * FROM v_loan_status). A payment is added tonight. Which is true tomorrow?", "options": ["Both show the new payment", "The view shows it, the table does not — but the table is faster to read", "The table shows it, the view does not", "Neither shows it until you re-create both"], "answer": 1, "explain": "A view stores the query text and recomputes on every read; a materialised table stores a frozen result (→ section 1, Views; Materialising)."},
  {"type": "single", "q": "due_date has an index. What does the plan say for this filter, and how do you fix it?", "code": "EXPLAIN QUERY PLAN\nSELECT COUNT(*) FROM installments\nWHERE strftime('%Y-%m', due_date) = '2026-09';", "options": ["SEARCH — the index is used; nothing to fix", "SCAN — the function hides the column; write due_date >= '2026-09-01' AND due_date < '2026-10-01'", "SCAN — drop the index", "An error — functions are not allowed with indexes"], "answer": 1, "explain": "The engine cannot look up a value it must compute per row; the half-open range turns the scan into a SEARCH (→ section 1, Reading an execution plan; habit 3)."},
  {"type": "multi", "q": "ix_payments_method indexes method, and other columns have their own indexes. In which filters can an index NOT help?", "options": ["WHERE LOWER(method) = 'card'", "WHERE method LIKE '%card'", "WHERE is_weekend = 1 (a column with two values)", "WHERE due_date >= '2026-09-01' AND due_date < '2026-10-01'", "JOIN payments p ON p.installment_id = i.installment_id"], "answer": [0, 1, 2], "explain": "A function on the column, a leading %, and a two-value column defeat the index; equality, ranges and joins on the indexed column benefit (→ section 1, Indexes)."},
  {"type": "single", "q": "In SQL Server, what is a clustered index?", "options": ["Any index on two or more columns", "The table itself, stored in the index's order — so there is only one per table", "A copy of the table on another server", "An index that only works with GROUP BY"], "answer": 1, "explain": "Non-clustered indexes are separate sorted structures pointing into the table; you can have many (→ section 1, Indexes)."},
  {"type": "single", "q": "A report summed principal over loans JOIN installments and came out 24× too big. Someone 'fixes' it like this. What is still wrong?", "code": "SELECT DISTINCT l.loan_id, l.principal, i.due_date\nFROM loans l\nJOIN installments i ON i.loan_id = l.loan_id;", "options": ["Nothing — DISTINCT removes the repeats", "With an instalment column in the list every row is still distinct, so nothing collapses; fix the grain by aggregating instalments per loan first, then join", "DISTINCT cannot be used with JOIN", "It should be UNION instead"], "answer": 1, "explain": "DISTINCT hides a join bug only by accident, and is slow; aggregate at each grain, then join (→ habit 4; P6)."},
  {"type": "single", "q": "You have just created v_loan_status (one row per loan). Which check do you run first?", "options": ["SELECT * FROM v_loan_status", "SELECT COUNT(*), COUNT(DISTINCT loan_id) FROM v_loan_status — the two must be equal", "DROP VIEW and re-create it", "SELECT MAX(dpd)"], "answer": 1, "explain": "The grain check: if rows exceed distinct loans, a join multiplied; every view ships with its check query (→ section 2, Worked example; section 6)."},
  {"type": "number", "q": "A tiny book of four loans as of today. What is PAR30 in %?", "code": "loan | dpd | outstanding\nA    |   0 | 100\nB    |  15 |  50\nC    |  45 |  30\nD    | 120 |  20", "answer": 25, "explain": "PAR30 = outstanding of loans with DPD > 30 ÷ total outstanding = (30 + 20) / 200 = 25 %; NPL90 would be 20 / 200 = 10 % (→ section 6, Company corner)."},
  {"type": "single", "q": "PAR30 is 3.12 % and NPL90 is 2.55 %. What do two such close numbers tell you?", "options": ["The data is wrong — they should be far apart", "Most of the money at risk is already 90+: the delinquent book is mostly old debt", "Collections is doing an excellent job", "Most delinquent loans are in 31–60"], "answer": 1, "explain": "PAR30 includes NPL90; when they are close, little sits in 31–90 and most at-risk outstanding is past 90 days (→ section 6, Reading the six together)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w03d4", "sql": true, "q": "Timur wants an NPL90 tile per region. Build v_loan_status as on this page (clean payments, as of 2026-10-01) and answer from the view only: what is NPL90 for the Tashkent region — the outstanding of loans with DPD over 90 divided by the region's total outstanding? Percentage to 2 decimals.", "type": "number", "dp": 2, "h": ["84584e0f0405652352b4fafa"], "hint": "A conditional sum over the view's outstanding column; the region is already a column of the view.", "sol": "U0VMRUNUIHJlZ2lvbiwKICAgICAgIFNVTShDQVNFIFdIRU4gZHBkID4gOTAgVEhFTiBvdXRzdGFuZGluZyBFTFNFIDAgRU5EKSBBUyBucGw5MF9vdXRzdGFuZGluZywKICAgICAgIFNVTShvdXRzdGFuZGluZykgQVMgb3V0c3RhbmRpbmcsCiAgICAgICBST1VORCgxMDAuMCAqIFNVTShDQVNFIFdIRU4gZHBkID4gOTAgVEhFTiBvdXRzdGFuZGluZyBFTFNFIDAgRU5EKSAvIFNVTShvdXRzdGFuZGluZyksIDIpIEFTIG5wbDkwX3BjdApGUk9NIHZfbG9hbl9zdGF0dXMKR1JPVVAgQlkgcmVnaW9uCk9SREVSIEJZIG5wbDkwX3BjdCBERVNDOwotLSB0aGUgc2FtZSB0ZXh0IG9uIFNRTCBTZXJ2ZXIKLS0gVGFzaGtlbnQ6IDEgOTIwIDk0MyA5NzAgLyA4MSA2NzkgNzM4IDA3MSA9IDIuMzUgJSAoOTEgbG9hbnMgb3ZlciA5MCBEUEQpClRoZSBjb21wYW55J3MgTlBMOTAgaXMgMi41NSAlOyBUYXNoa2VudCwgd2l0aCAzOSAlIG9mIHRoZSBib29rLCBzaXRzIHNsaWdodGx5IGJlbG93IGl0LCBhbmQgTnVrdXMgaXMgdGhlIG91dGxpZXIgYXQgNi43NCAlLiBPdmVyIDkwIG1lYW5zIGJ1Y2tldCA5MCssIHNvIGRwZCA+IDkwLCBub3QgPj0gOTAuIE9uY2UgdGhlIHZpZXcgaXMgcmlnaHQgdGhlIHRpbGUgaXMgb25lIEdST1VQIEJZIOKAlCB0aGUgZGVmaW5pdGlvbiBvZiBEUEQgYW5kIG91dHN0YW5kaW5nIGxpdmVzIGluIG9uZSBwbGFjZSwgd2hpY2ggaXMgd2hhdCBUaW11ciBhc2tlZCBmb3Iu"}
```

<!-- challenge:end -->
