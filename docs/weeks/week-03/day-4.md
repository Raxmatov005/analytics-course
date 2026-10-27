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

SELECT COUNT(*), SUM(amount), COUNT(DISTINCT method) FROM v_payments_clean;     -- 52 850 · 255 114 772 176 · 5
```

52 850 rows, 255 114 772 176 UZS, 5 payment methods — the 52 875 raw payments without the 25 duplicates, with the method cleaned. Timur now sees six clean columns; the `ROW_NUMBER` and the cleaning live inside the view.

**When you use it.**
- **One definition** shared by every report: the duplicate rule lives in one place; fix it once and every report changes.
- **A simpler surface**: a dashboard reads `v_loan_status` instead of three joins and a CTE.
- **Hiding columns**: a view can show `region` and leave out `phone`.

> ⚠️ **Watch out.** A view is not faster than the query inside it — reading it **is** running that query. If the query takes 2 seconds, so does every read of the view.

**Your turn.** A payment is added to `payments` tonight. Tomorrow you run `SELECT COUNT(*) FROM v_payments_clean`. What do you see?

```task
{"id": "w03d4-l1", "kind": "choice", "options": ["52 850 — the view stored its rows when it was created", "52 851 — the view runs its query again on today's rows", "An error — the view must be re-created after every change", "52 876 — the view counts the raw table"], "answer": 1, "explain": "A view stores the query, not the rows. Each read runs it on the current data, so the new payment is there (unless it repeats an earlier one — then the dedup removes it)."}
```

### CREATE VIEW and DROP VIEW

**What it is.** `CREATE VIEW name AS SELECT …` saves a query under a name. `DROP VIEW name` removes the name; the tables underneath are not touched. A view cannot be edited in place in SQLite: you drop it and create it again.

**How to write it.**

```sql
-- the shape
CREATE VIEW view_name AS          -- a name: v_… for views, so nobody mistakes it for a table
SELECT …;                         -- any SELECT: joins, GROUP BY, windows, CTEs
DROP VIEW IF EXISTS view_name;    -- removes the saved query, never the data
```

A view of your own, made so the box can run twice (`DROP … IF EXISTS` first):

```sql
-- your own view, in your practice copy
DROP VIEW IF EXISTS my_v_written_off;
CREATE VIEW my_v_written_off AS
SELECT loan_id, customer_id, product_id, principal
FROM loans
WHERE status = 'written_off';
SELECT COUNT(*) AS loans, SUM(principal) AS principal FROM my_v_written_off;   -- 190 · 10 022 040 000
```

190 written-off loans with 10 022 040 000 of principal. The view now appears in the **Database** panel next to the tables; `DROP VIEW my_v_written_off` removes it again.

**When you use it.**
- `CREATE VIEW` once a query is used by more than one report or person.
- Changing a view: `DROP VIEW` + `CREATE VIEW` in SQLite; `CREATE OR ALTER VIEW` in SQL Server.

> ⚠️ **Watch out.** `DROP VIEW` on a view that other views read breaks them silently: nothing complains until someone queries the outer view and gets *no such table*. Drop and rebuild views in their dependency order.

**Your turn.** In SQLite you need to add a column `risk_grade` to `my_v_written_off`. What do you do?

```task
{"id": "w03d4-l2", "kind": "choice", "options": ["ALTER VIEW my_v_written_off ADD COLUMN risk_grade", "DROP VIEW my_v_written_off, then CREATE VIEW again with the new column", "UPDATE my_v_written_off SET risk_grade = …", "Nothing — a view picks up new columns of loans by itself"], "answer": 1, "explain": "SQLite has no ALTER VIEW: drop the view and create it with the new SELECT. SQL Server can do it in one step with CREATE OR ALTER VIEW."}
```

### A view over a view — layers

**What it is.** A view can read another view. The outer view **inherits** everything the inner one does: build the dedup once in `v_payments_clean`, and every view on top of it is de-duplicated too. This is how a **reporting layer** is built: clean views first, business views on top.

**How to write it.** Monthly collections, read from the clean view (run the `v_payments_clean` box above first):

```sql
-- a view on top of v_payments_clean
DROP VIEW IF EXISTS my_v_paid_monthly;
CREATE VIEW my_v_paid_monthly AS
SELECT strftime('%Y-%m', paid_at) AS month, COUNT(*) AS payments, SUM(amount) AS collected
FROM v_payments_clean                                     -- the inner view: duplicates already gone
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
payments ──▶ v_payments_clean ──▶ my_v_paid_monthly
 (raw)        dedup + clean         monthly totals
                     └──────────▶ v_loan_status (section 2)
```

**When you use it.**
- A rule that many reports share (dedup, cleaning, DPD) goes in the lowest view; each report is a thin view on top.
- Fixing the rule once fixes every layer above it.

> ⚠️ **Watch out.** Layers hide cost. `my_v_paid_monthly` looks like one `GROUP BY`, but every read also runs the `ROW_NUMBER` over all 52 875 payments inside `v_payments_clean`. Three layers deep, a "simple" view can be the slowest query in the building.

**Your turn.** Finance decides that two payments of the same instalment on the same day are duplicates even when the amounts differ. Where do you change the rule?

```task
{"id": "w03d4-l3", "kind": "choice", "options": ["In every report that reads payments", "In v_payments_clean only — every view on top of it inherits the change", "In my_v_paid_monthly", "In the raw payments table, by deleting rows"], "answer": 1, "explain": "The dedup rule lives in one place: the PARTITION BY of v_payments_clean. Change it there and my_v_paid_monthly, v_loan_status and every tile on top follow."}
```

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
CREATE TABLE t_payments_asof_20261001 AS                  -- SQL Server: SELECT * INTO t_payments_asof_20261001 FROM v_payments_clean
SELECT * FROM v_payments_clean;
SELECT COUNT(*) FROM t_payments_asof_20261001;            -- 52 850
```

```sql
-- a temp table: scratch space for this session only
DROP TABLE IF EXISTS tmp_sep;
CREATE TEMP TABLE tmp_sep AS                              -- SQL Server: SELECT * INTO #tmp_sep FROM v_payments_clean WHERE
SELECT * FROM v_payments_clean
WHERE paid_at >= '2026-09-01' AND paid_at < '2026-10-01';
SELECT method, COUNT(*) AS payments, SUM(amount) AS collected
FROM tmp_sep GROUP BY method ORDER BY collected DESC;     -- card 1 050 · 5 173 658 728 first
```

The first table holds all 52 850 clean payments and will not change when `payments` does. The temp table holds September's 3 158 payments; card leads with 1 050 payments and 5 173 658 728. Close the page and `tmp_sep` is gone.

**When you use it.**
- CTAS: a number that must not move after it is published; a slow query that many people read (rebuilt nightly).
- Temp table: an intermediate result that one long script reads five times.

> ⚠️ **Watch out.** CTAS copies the **rows only**: no primary key, no index, no link to the view it came from. The copy starts going stale the moment it is made.

**Your turn.** How many rows does `tmp_sep` hold?

```task
{"id": "w03d4-l4", "kind": "number", "answer": 3158, "dp": 0, "unit": "payments", "hint": "SELECT COUNT(*) FROM tmp_sep — after running the box above.", "model": "3 158 — September's de-duplicated payments, the same number as the 2026-09 row of my_v_paid_monthly."}
```

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
       (SELECT COUNT(*) FROM t_written_off)    AS table_rows;    -- 190 · 190 today
```

190 and 190 today. Write off one more loan tomorrow and the view says 191, the table still 190.

**When you use it.**
- **View:** the number must be today's (a live dashboard tile); one shared definition.
- **Table:** the number must not change after it is sent (the month-end pack); the view is slow and the data changes rarely (a nightly rebuild).
- **Temp table:** scratch inside one script.

> ⚠️ **Watch out.** A view and a table built from it look identical on the day you make them. A week later they disagree, and nobody can tell which tile reads which. Name them so the difference shows: `v_…` for views, `t_…_asof_20261001` for frozen tables.

**Your turn.**

```game
{"type": "sort", "id": "w03d4-g1", "title": "View, table or temp table?", "q": "Tap each situation, then what you would build for it.", "groups": {"View": ["Power BI's loan-status tile, which must show today's DPD", "One de-duplication rule that every report must share"], "Materialised table (CTAS / SELECT INTO)": ["The September month-end pack, frozen once it is sent to the board", "A 12-second query that 40 people open every morning, refreshed nightly"], "Temp table": ["An intermediate result reused five times in one long script, gone when you disconnect"]}}
```

### Indexes — the phone book

**What it is.** An **index** (*индекс*) is a sorted copy of one or more columns with a pointer to each row. Without one, the engine reads **every row** to find `customer_id = 3208` — a **scan**. With one, it jumps to the right place — a **seek** (SQLite says **SEARCH**). Like finding a name in a phone book instead of reading it cover to cover.

**How to write it.**

```sql
-- the shape
CREATE INDEX index_name ON table_name (column1);   -- one column, or several: (column1, column2)
DROP INDEX index_name;
```

Day 3's "customers with no loan" asks, for each of 6 040 customers, whether any of 7 828 loans is theirs. Give `loans.customer_id` an index and run it again:

```sql
-- an index on the column the subquery looks up
CREATE INDEX IF NOT EXISTS ix_loans_customer ON loans (customer_id);
SELECT COUNT(*) AS customers_without_loan
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM loans l WHERE l.customer_id = c.customer_id);   -- 1 705
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

```game
{"type": "sort", "id": "w03d4-g2", "title": "Can the index help?", "q": "Each column in these filters has an index. Tap a filter, then where it belongs.", "groups": {"Index helps (SEARCH)": ["WHERE installment_id = 59838", "WHERE due_date >= '2026-09-01' AND due_date < '2026-10-01'", "JOIN payments p ON p.installment_id = i.installment_id"], "Index cannot help (SCAN)": ["WHERE strftime('%Y-%m', due_date) = '2026-09'", "WHERE LOWER(method) = 'card'", "WHERE method LIKE '%card'"]}}
```

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

```game
{"type": "bug", "id": "w03d4-g3", "title": "Find the slow line", "q": "due_date has an index, yet the plan says SCAN. Which line turns the SEARCH into a SCAN?", "code": "CREATE INDEX ix_installments_due ON installments (due_date);\nSELECT COUNT(*)\nFROM installments\nWHERE strftime('%Y-%m', due_date) = '2026-09';", "answer": [3], "why": "The engine cannot look up a value it must compute for every row. WHERE due_date >= '2026-09-01' AND due_date < '2026-10-01' gives the same count with a SEARCH."}
```

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
SELECT COUNT(*) FROM installments WHERE strftime('%Y-%m', due_date) = '2026-09';            -- 3 305, cannot use an index
SELECT COUNT(*) FROM installments WHERE due_date >= '2026-09-01' AND due_date < '2026-10-01'; -- 3 305, can
```

Both say 3 305 instalments due in September. Only the second can use `ix_installments_due` once it exists.

**When you use it.**
- Every query that feeds a dashboard or runs every day.
- Whenever a query takes more than a few seconds: plan first (habit 10), then the habit the plan points at.

> 💡 **Key idea.** Eight of the ten habits are about *doing less work*: fewer columns, fewer rows earlier, no repeated rows, no per-row subqueries. Only habit 7 (indexes) and habit 8 (materialise) add something.

> ⚠️ **Watch out.** Habit 4 is the dangerous one, because it hides a wrong number. `SELECT DISTINCT` after a one-to-many join (92 193 rows from 7 828 loans) *looks* right for some column lists, while every `SUM` taken on the joined rows is still multiplied.

**Your turn.**

```game
{"type": "sort", "id": "w03d4-g5", "title": "Fast or slow?", "q": "Tap each habit, then whether it makes a query faster or slower.", "groups": {"Faster": ["WHERE paid_at >= '2026-09-01' AND paid_at < '2026-10-01'", "SELECT loan_id, bucket, outstanding FROM v_loan_status", "UNION ALL of two monthly results", "An index on payments.installment_id before joining it"], "Slower (or wrong)": ["WHERE YEAR(paid_at) = 2026", "SELECT * into Power BI", "SELECT DISTINCT to remove rows a join multiplied", "A correlated subquery per row of 92 193 instalments"]}}
```

### Putting it together

One request, several of today's tools. *"September's collections by payment method, de-duplicated, fast to read, and frozen for the board pack."*

```sql
-- 1. an index on the column the filter will use
CREATE INDEX IF NOT EXISTS ix_payments_paid ON payments (paid_at);
-- 2. a view over a view: only the columns the pack needs, the date kept as a bare column
DROP VIEW IF EXISTS my_v_collections;
CREATE VIEW my_v_collections AS
SELECT paid_at, method, amount FROM v_payments_clean;
-- 3. a frozen table for the pack: half-open range on the bare column, SELECT only what is needed
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

```videoquiz
{"video": "SSKVgrwhzus", "stops": [
  {"at": 57900, "q": "What does a view store in the database?", "options": ["A copy of the result rows", "The query text — it runs again every time you read the view", "An index", "Nothing; it disappears after the session"], "answer": 1, "explain": "A view is a saved query: always fresh, and as slow as the query it wraps."},
  {"at": 61000, "q": "CREATE TABLE … AS SELECT (SELECT INTO in SQL Server) gives you…", "options": ["A view with a new name", "A new physical table holding the result as of now", "A temporary index", "A stored procedure"], "answer": 1, "explain": "CTAS materialises the result: fast to read, frozen until you rebuild it."},
  {"at": 69500, "q": "A table has a clustered index on its id. What does that mean?", "options": ["There is a separate sorted copy of the id column", "The rows themselves are stored in id order — only one per table", "The table is split across servers", "The id cannot repeat"], "answer": 1, "explain": "The clustered index is the table's storage order; non-clustered indexes are separate structures pointing into it."},
  {"at": 79500, "q": "Which of these is a performance tip you will hear for analysts?", "options": ["Use SELECT * so nothing is missing", "Filter early and select only the columns you need", "Wrap filter columns in functions", "Use DISTINCT to fix duplicates after joins"], "answer": 1, "explain": "Less data through every step; the other three are the classic slow (or wrong) habits.", "back": 60}]}
```

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

Start with the lab: a view of your own, on a table of your own, so you can watch what a view does when the data changes. Then the questions, in the order of section 1; the concept each one trains is in italics. Write each query in the box under its question — it is saved in this browser. **✔ Check** tells you whether your result matches the answer. Indexes and new tables change only your practice copy of the database — **Database → ↺ Reset** brings the original back. Several questions use Timur's views: run the `CREATE VIEW` boxes in sections 1, 2 and 6 once first (`v_portfolio_monthly` is in section 6 — the Company corner).

```sqllab
{"id": "w03d4-lab", "title": "A view that moves, a table that does not", "intro": "You copy the SME loans into a table of your own, put a view on top, change the table, and watch the view follow. Then you freeze the view into a table and see the two drift apart. Everything happens in your practice copy.", "steps": [
  {"say": "Create my_loans with CREATE TABLE … AS: loan_id, product_id, principal, status of every SME loan (product_id = 5).", "hint": "CREATE TABLE my_loans AS SELECT loan_id, product_id, principal, status FROM loans WHERE product_id = 5;", "expect": "SELECT COUNT(*) FROM my_loans", "want": 781},
  {"say": "Create the view my_v_active_sme: loan_id and principal of the active loans in my_loans. Then query it: SELECT COUNT(*) FROM my_v_active_sme.", "hint": "CREATE VIEW my_v_active_sme AS SELECT loan_id, principal FROM my_loans WHERE status = 'active';", "expect": "SELECT COUNT(*) FROM sqlite_master WHERE type = 'view' AND name = 'my_v_active_sme'", "want": 1},
  {"say": "Close the biggest SME loan in your table: UPDATE my_loans SET status = 'closed' WHERE loan_id = 2861. Query the view again — you did not touch it, yet it changed.", "hint": "UPDATE my_loans SET status = 'closed' WHERE loan_id = 2861;", "expect": "SELECT COUNT(*) FROM my_v_active_sme", "want": 589},
  {"say": "Freeze it: CREATE TABLE my_t_active_sme AS SELECT * FROM my_v_active_sme. Then close loan 4601 in my_loans as well.", "hint": "CREATE TABLE my_t_active_sme AS SELECT * FROM my_v_active_sme; UPDATE my_loans SET status = 'closed' WHERE loan_id = 4601;", "expect": "SELECT (SELECT COUNT(*) FROM my_v_active_sme) - (SELECT COUNT(*) FROM my_t_active_sme)", "want": -1},
  {"say": "The view has 588 rows, the frozen table still 589 — that is the whole difference between them. Now remove the view with DROP VIEW.", "hint": "DROP VIEW my_v_active_sme;", "expect": "SELECT COUNT(*) FROM sqlite_master WHERE type = 'view' AND name = 'my_v_active_sme'", "want": 0}],
 "cleanup": "DROP VIEW IF EXISTS my_v_active_sme; DROP TABLE IF EXISTS my_t_active_sme; DROP TABLE IF EXISTS my_loans"}
```

**P1.** *(what a view is)* Create `v_payments_clean` and prove it: rows, total, distinct methods, and that no instalment has two rows left.

<details><summary>Answer</summary>

Section 1's view. `SELECT COUNT(*), SUM(amount), COUNT(DISTINCT method) FROM v_payments_clean` → 52 850 · 255 114 772 176 · 5; `SELECT MAX(c) FROM (SELECT installment_id, COUNT(*) c FROM v_payments_clean GROUP BY 1)` → 1.

</details>

**P1 — the number.** How many rows does `v_payments_clean` have?

```task
{"id": "w03d4-p1b", "kind": "number", "answer": 52850, "dp": 0, "unit": "payments", "hint": "SELECT COUNT(*) FROM v_payments_clean — after running section 1's CREATE VIEW box.", "model": "52 850 = 52 875 raw rows minus the 25 duplicates; 255 114 772 176 UZS, 5 methods, and MAX rows per (instalment, date, amount) = 1.", "xp": 1}
```

**P2.** *(CREATE VIEW and DROP VIEW)* Create `my_v_active_auto`: `loan_id`, `branch_id`, `principal` of the **active Auto** loans (`product_id = 4`). Count its rows and sum its principal; then drop it.

<details><summary>Answer</summary>

`DROP VIEW IF EXISTS my_v_active_auto;` then `CREATE VIEW my_v_active_auto AS SELECT loan_id, branch_id, principal FROM loans WHERE product_id = 4 AND status = 'active';` then `SELECT COUNT(*), SUM(principal) FROM my_v_active_auto;` → **358 loans · 77 271 840 000**. `DROP VIEW my_v_active_auto` removes the saved query; `loans` is untouched — check with `SELECT COUNT(*) FROM loans` (still 7 828).

</details>

**P2 — the number.** How many rows does `my_v_active_auto` return?

```task
{"id": "w03d4-p2c", "kind": "number", "answer": 358, "dp": 0, "unit": "loans", "hint": "SELECT COUNT(*) FROM my_v_active_auto — after the CREATE VIEW.", "model": "358 active Auto loans with 77 271 840 000 of principal. Drop the view and loans still has all 7 828 rows: a view never holds data.", "xp": 1}
```

**P3.** *(a view over a view)* Create `v_loan_status` (worked example) and run the four checks. Then: outstanding by `region` and `bucket` from the view only — how long is that query compared with writing it from the raw tables (week 2's DPD chain plus the joins)?

<details><summary>Answer</summary>

Checks as above. `SELECT region, bucket, SUM(outstanding) FROM v_loan_status GROUP BY 1, 2` — two lines instead of three joins and a CTE; Tashkent 90+ carries the largest dead outstanding. The point of the layer: the *question* is two lines, the *definition* is somewhere else, once — and the dedup comes from the view underneath.

</details>

**P3 — the grain check.** `SELECT COUNT(*), COUNT(DISTINCT loan_id) FROM v_loan_status` returns 92 193 and 7 828. What happened?

```task
{"id": "w03d4-p2b", "kind": "choice", "options": ["Nothing — a loan has many rows in a status view", "A join multiplied the rows: the view joins instalments (or payments) at the wrong grain", "DISTINCT is broken", "The as-of date is wrong"], "answer": 1, "explain": "The grain of v_loan_status is one row per loan; 92 193 is the number of instalments. Aggregate instalments per loan in a CTE, then join once — the two numbers must be equal.", "xp": 1}
```

**P4.** *(temp table)* A temp table for a long script: `CREATE TEMP TABLE tmp_dpd AS SELECT loan_id, dpd, bucket, outstanding FROM v_loan_status WHERE dpd > 0`; count it; then run three questions against it (by bucket, by product via a join, average DPD of active loans).

<details><summary>Answer</summary>

399 rows. Bucket counts 124/25/16/234; by product SME carries the most overdue money, Consumer the most late loans (week 2 T11); active delinquent loans average 22.7 DPD. The temp table disappears when you close the connection — which is the point: scratch space, not a report.

</details>

**P4 — the count.** How many rows does `tmp_dpd` have?

```task
{"id": "w03d4-p10b", "kind": "number", "answer": 399, "dp": 0, "unit": "loans", "hint": "SELECT COUNT(*) FROM tmp_dpd after the CREATE TEMP TABLE.", "model": "399 loans with DPD above 0: 124 + 25 + 16 + 234. Active delinquent loans average 22.7 days.", "xp": 1}
```

**P5.** *(CREATE TABLE AS)* Create `t_loan_status` as a materialised copy (CTAS / `SELECT INTO`). Time the bucket count from the view and from the table.

<details><summary>Answer</summary>

`CREATE TABLE t_loan_status AS SELECT * FROM v_loan_status;` then `SELECT bucket, COUNT(*) FROM t_loan_status GROUP BY bucket` — the same five counts (7 429 / 124 / 25 / 16 / 234). ≈0.4 s from the view against ≈0 s from the table here; the difference grows with data.

</details>

**P6.** *(when a view, when a table)* Answer Timur in two or three sentences: when would you ship `t_loan_status` instead of `v_loan_status`?

```task
{"id": "w03d4-p7b", "kind": "free", "min": 20, "model": "I would ship the table when the number must not move after it is published — the month-end pack for the board — or when the view is slow and the data changes rarely, so a nightly rebuild is enough. Where Timur needs today's DPD, the view stays. I would name the table so nobody mistakes it for the live one, e.g. t_loan_status_asof_20261001.", "rubric": ["Table for frozen / published numbers", "Table when slow and rarely changing (nightly refresh)", "View where freshness matters", "Naming that shows which is which"], "xp": 1}
```

**P7.** *(when a view, when a table — the slow view)* Build `v_portfolio_monthly` (run the `CREATE VIEW v_portfolio_monthly` box in section 6 once). Read September 2026 from the view — disbursed count and month-end outstanding over all products and branches — then freeze the view with CTAS as `t_portfolio_monthly` and read the same from the table. Which of the two would you point a dashboard at?

<details><summary>Answer</summary>

`SELECT SUM(disbursed_count), SUM(outstanding_month_end) FROM v_portfolio_monthly WHERE month = '2026-09-01'` → 361 · 208 243 879 623. `CREATE TABLE t_portfolio_monthly AS SELECT * FROM v_portfolio_monthly;` then the same `SELECT` on the table: the same 361 and 208 243 879 623, about 1.8 s against 0.00 s on a laptop (longer in the browser). The view recomputes month-end outstanding for 34 months on every read; history does not change, so a nightly table is the right home for this one — with the view kept as its definition.

</details>

**P8.** *(when a view, when a table — month end vs as-of)* `v_portfolio_monthly`: check 1 700 rows = 34 months × 5 × 10, and reconcile September 2026 month-end outstanding with the as-of figure. Why do they differ by about 480 m?

<details><summary>Answer</summary>

208 243 879 623 (month end 30 Sep) vs 208 723 504 430 (as of 1 Oct). The month-end view excludes the 21 loans disbursed on 1 October (852 760 000 of principal, none yet repaid) and counts instalments due *on* 1 October as still outstanding (they are not yet due at midnight on 30 Sep). Two correct numbers, two definitions — write both in the data dictionary.

</details>

**P8 — why the gap?** Pick every reason that is part of the difference.

```task
{"id": "w03d4-p8b", "kind": "multi", "options": ["The month-end view leaves out the 21 loans disbursed on 1 October", "Instalments due on 1 October still count as outstanding at the end of 30 September", "One of the two queries is wrong", "Payments made on 1 October"], "answer": [0, 1], "explain": "Two definitions, both correct: month end (30 Sep) and as-of (1 Oct). The new loans add 852.8 m; the instalments falling due on 1 October take some of it back — net about 480 m. Write both in the dictionary.", "xp": 1}
```

**P9.** *(indexes — clustered and not)* `EXPLAIN QUERY PLAN SELECT * FROM loans WHERE loan_id = 2242` vs `WHERE rowid = 2242`. Why do they differ, and what fixes the first?

<details><summary>Answer</summary>

`SCAN loans` vs `SEARCH loans USING INTEGER PRIMARY KEY (rowid=?)`: the table was loaded without a declared key, so `loan_id` is an ordinary column while `rowid` is the storage order (SQLite's clustered index). `CREATE UNIQUE INDEX ix_loans_id ON loans (loan_id)` → `SEARCH loans USING INDEX ix_loans_id`. In SQL Server you would declare `loan_id` the clustered primary key when creating the table.

</details>

**P9 — why?** Why does `WHERE rowid = 2242` SEARCH while `WHERE loan_id = 2242` SCANs?

```task
{"id": "w03d4-p5b", "kind": "choice", "options": ["rowid is a number and loan_id is text", "rowid is the table's storage order (its clustered key); loan_id was loaded as an ordinary column with no index", "SQLite cannot index loan_id", "loan_id has duplicates"], "answer": 1, "explain": "Add CREATE UNIQUE INDEX ix_loans_id ON loans (loan_id) and the plan becomes SEARCH … USING INDEX ix_loans_id. In SQL Server you would make loan_id the clustered primary key.", "xp": 1}
```

**P10.** *(EXPLAIN QUERY PLAN)* `EXPLAIN QUERY PLAN` for `SELECT * FROM payments WHERE loan_id = 2242` before and after `CREATE INDEX ix_payments_loan ON payments (loan_id)`. Copy both lines.

<details><summary>Answer</summary>

`SCAN payments` → `SEARCH payments USING INDEX ix_payments_loan (loan_id=?)`. (SQL Server: Table Scan → Index Seek in the graphical plan.)

</details>

**P10 — read the plan.** Which line does the plan show *after* the index exists?

```task
{"id": "w03d4-p3b", "kind": "choice", "options": ["SCAN payments", "SEARCH payments USING INDEX ix_payments_loan (loan_id=?)", "SCAN payments USING COVERING INDEX ix_payments_loan", "USE TEMP B-TREE FOR ORDER BY"], "answer": 1, "explain": "SEARCH = the engine jumps to the matching rows through the index (SQL Server: Index Seek). SCAN = reads every row.", "xp": 1}
```

**P11.** *(EXPLAIN QUERY PLAN — a function on the column)* Two filters for September instalments — `strftime('%Y-%m', due_date) = '2026-09'` and the half-open range — with `ix_installments_due` in place. Plans? Same count?

<details><summary>Answer</summary>

Same count: 3 305 September instalments. Plans: `SCAN installments USING COVERING INDEX` for the function version — it still reads every entry; `SEARCH … (due_date>? AND due_date<?)` for the range. Habit 3.

</details>

**P11 — read the plan.** Which statement is true?

```task
{"id": "w03d4-p4b", "kind": "choice", "options": ["Different counts, same plan", "Same count; the function version SCANs, the half-open range SEARCHes", "Same count; both SEARCH", "The function version is faster because it reads fewer columns"], "answer": 1, "explain": "The answer does not change; the work does. Habit 3: no functions on indexed columns in WHERE.", "xp": 1}
```

**P12.** *(habits — DISTINCT is not a fix)* `SELECT COUNT(*), COUNT(DISTINCT l.loan_id) FROM loans l JOIN installments i ON i.loan_id = l.loan_id`. Someone "fixes" a multiplied report with `SELECT DISTINCT l.loan_id, l.principal …` and then sums. What is still wrong?

<details><summary>Answer</summary>

```sql
SELECT COUNT(*), COUNT(DISTINCT l.loan_id) FROM loans l JOIN installments i ON i.loan_id = l.loan_id;
-- 92193 · 7828
```
92 193 vs 7 828. `DISTINCT` on (loan_id, principal) does collapse to 7 828 rows — but only because those two columns are the same on every repeat; add any instalment column and it multiplies again, and `SUM(principal)` *before* the `DISTINCT` (the common mistake) is 24× too big. The fix is the grain: sum instalments per loan in a CTE, then join once.

</details>

**P12 — what is still wrong?** Pick every true statement.

```task
{"id": "w03d4-p6b", "kind": "multi", "options": ["Add any instalment column to the DISTINCT list and the rows multiply again", "SUM(principal) taken before the DISTINCT is still about 24× too big", "DISTINCT also hides real duplicate loans that should be investigated", "The fix is to aggregate instalments per loan first, then join once"], "answer": [0, 1, 3], "explain": "DISTINCT collapses rows only by accident of the column list; the grain is still wrong underneath. (There are no duplicate loans here — the multiplication comes from the join.)", "xp": 1}
```

**P13.** *(the habits)* Pick five of the ten habits and show, with one query each on our data, the slow form and the fast form (plans or row counts as evidence).

```task
{"id": "w03d4-p9", "kind": "free", "min": 60, "model": "Habit 1: SELECT * FROM v_loan_status returns 16 columns, SELECT loan_id, bucket, outstanding three — same 7 828 rows, a fifth of the width. Habit 3: strftime('%Y-%m', due_date) = '2026-09' → SCAN installments USING COVERING INDEX; due_date >= '2026-09-01' AND due_date < '2026-10-01' → SEARCH, same count. Habit 4: loans JOIN installments → 92 193 rows for 7 828 loans; aggregate per loan first → 7 828. Habit 5: Wednesday's P7 chain joins customers to 10 rows instead of 92 193. Habit 9: latest loan per customer with ROW_NUMBER and with the correlated = MAX subquery — both 4 335 rows, the window in one pass.", "rubric": ["Five habits named", "A slow and a fast query for each", "Evidence for each: a plan line, a row count or a timing", "Same answer from both forms where it should be"], "xp": 2}
```

<details><summary>Answer</summary>

Any five with evidence — e.g. habit 1 (`SELECT *` vs three columns: compare the width), 3 (P11), 4 (P12), 5 (Wednesday's P7 chain vs a join of raw tables), 7 (section 1's `ix_loans_customer`: 2.4 s → instant), 9 (`ROW_NUMBER` latest loan vs the correlated `= MAX` subquery: same 4 335 rows). Full marks for *evidence*, not for prose.

</details>

> 🚀 **Stretch (optional, +5 XP).** The whole week in one query — and a question Nilufar will want answered before the next credit committee.

**P14.** *(putting it together)* Tuesday's P9 and Wednesday's worked example found 101 customers lent to again after a written-off loan. Using `v_loan_status` and `applications`, list the officers (`officer_id`) who approved the most such repeat loans, and the FPD30 of those repeat loans versus the book.

```task
{"id": "w03d4-p11", "kind": "free", "min": 40, "model": "Repeat loans: Wednesday's first_wo CTE (first write-off date per customer) joined back to loans with a later disbursed_at. Join applications on application_id for officer_id, COUNT per officer and RANK() OVER (ORDER BY COUNT(*) DESC). For FPD30, join week 2's flags block (on v_payments_clean) to the repeat loans and compare their rate with the book's 1.28 %, quoting the count beside the rate — with about a hundred loans, one loan moves the rate by about a point. Finding for Nilufar: which officers re-lend after write-offs, and whether those loans start worse.", "rubric": ["Repeat loans defined with a date condition against the written-off loan", "Officer from applications, counted and ranked with a window", "FPD30 of the repeat loans next to the book's 1.28 %", "Counts quoted beside rates (small group)"], "xp": 2}
```

<details><summary>Answer</summary>

Wednesday's `first_wo` derived table (or a self-join of `loans` to `loans`) finds the 145 repeat loans; join `applications` for `officer_id`, group and rank; then join week 2's `flags` block for FPD30. Read your number and quote it with its count; small groups move a lot. The structure (CTE for repeats → join officer → aggregate → rank) is the week in one query.

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
  {"type": "single", "q": "A view and a materialised table of the same query. A payment is added tonight. Which is true tomorrow?", "options": ["Both show it; the view is faster", "The view shows it, the table does not; the table is faster to read", "The table shows it, the view does not", "Neither shows it"], "answer": 1, "explain": "The view re-runs its query on every read; the table holds the result as of the moment it was built (→ section 1, What a view is; When a view, when a table)."},
  {"type": "single", "q": "WHERE YEAR(disbursed_at) = 2026 on an indexed disbursed_at — scan or seek, and the rewrite?", "options": ["Seek; nothing to rewrite", "Scan; WHERE disbursed_at >= '2026-01-01' AND disbursed_at < '2027-01-01'", "Scan; drop the index", "Seek, but only in SQL Server"], "answer": 1, "explain": "A function around the column hides it from the index; the half-open range on the bare column can SEARCH (→ section 1, Indexes; Reading EXPLAIN QUERY PLAN)."},
  {"type": "single", "q": "Why is SELECT DISTINCT after a one-to-many join a trap rather than a fix?", "options": ["DISTINCT is not allowed after JOIN", "It hides the multiplied rows only for some column lists; sums taken on the joined rows are still wrong, and it is slow", "It removes real loans", "It changes the join type"], "answer": 1, "explain": "Fix the grain instead: aggregate per loan first, then join once (→ section 1, The habits that make queries fast, habit 4; P12)."}]}
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
  {"type": "single", "q": "You have v_loan_status (a view) and t_loan_status (CREATE TABLE … AS SELECT * FROM v_loan_status). A payment is added tonight. Which is true tomorrow?", "options": ["Both show the new payment", "The view shows it, the table does not — but the table is faster to read", "The table shows it, the view does not", "Neither shows it until you re-create both"], "answer": 1, "explain": "A view stores the query text and recomputes on every read; a materialised table stores a frozen result (→ section 1, What a view is; When a view, when a table)."},
  {"type": "single", "q": "due_date has an index. What does the plan say for this filter, and how do you fix it?", "code": "EXPLAIN QUERY PLAN\nSELECT COUNT(*) FROM installments\nWHERE strftime('%Y-%m', due_date) = '2026-09';", "options": ["SEARCH — the index is used; nothing to fix", "SCAN — the function hides the column; write due_date >= '2026-09-01' AND due_date < '2026-10-01'", "SCAN — drop the index", "An error — functions are not allowed with indexes"], "answer": 1, "explain": "The engine cannot look up a value it must compute per row; the half-open range turns the scan into a SEARCH (→ section 1, Reading EXPLAIN QUERY PLAN; habit 3; P11)."},
  {"type": "multi", "q": "ix_payments_method indexes method, and other columns have their own indexes. In which filters can an index NOT help?", "options": ["WHERE LOWER(method) = 'card'", "WHERE method LIKE '%card'", "WHERE is_weekend = 1 (a column with two values)", "WHERE due_date >= '2026-09-01' AND due_date < '2026-10-01'", "JOIN payments p ON p.installment_id = i.installment_id"], "answer": [0, 1, 2], "explain": "A function on the column, a leading %, and a two-value column defeat the index; equality, ranges and joins on the indexed column benefit (→ section 1, Indexes — the phone book)."},
  {"type": "single", "q": "In SQL Server, what is a clustered index?", "options": ["Any index on two or more columns", "The table itself, stored in the index's order — so there is only one per table", "A copy of the table on another server", "An index that only works with GROUP BY"], "answer": 1, "explain": "Non-clustered indexes are separate sorted structures pointing into the table; you can have many (→ section 1, Indexes — the phone book)."},
  {"type": "single", "q": "A report summed principal over loans JOIN installments and came out 24× too big. Someone 'fixes' it like this. What is still wrong?", "code": "SELECT DISTINCT l.loan_id, l.principal, i.due_date\nFROM loans l\nJOIN installments i ON i.loan_id = l.loan_id;", "options": ["Nothing — DISTINCT removes the repeats", "With an instalment column in the list every row is still distinct, so nothing collapses; fix the grain by aggregating instalments per loan first, then join", "DISTINCT cannot be used with JOIN", "It should be UNION instead"], "answer": 1, "explain": "DISTINCT hides a join bug only by accident, and is slow; aggregate at each grain, then join (→ section 1, The habits that make queries fast, habit 4; P12)."},
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
