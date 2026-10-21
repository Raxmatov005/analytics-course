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

Measured on our 11 MB SQLite file: `SELECT bucket, COUNT(*) FROM v_loan_status GROUP BY bucket` — **0.49 s** through the view, **0.00 s** from the materialised table; `v_portfolio_monthly` for one month — **12.8 s** through the view (it recomputes month-end outstanding for 34 months), instant from a table. **When to materialise:** when the view is slow *and* the data changes rarely (a nightly table is the standard warehouse answer — bronze/silver/gold from week 1's video); when the number must not change after it is published; when a script needs the same intermediate result five times (temp table, not five CTE copies). **When not to:** when freshness matters more than speed, or when the "table" will quietly go stale and disagree with the view — Timur's three tiles were exactly that: stale copies.

### Indexes (*индексы*) — the phone book

Without an index the engine reads **every row** to answer `WHERE loan_id = 2242` — a **scan**. An index is a sorted copy of one or more columns with pointers to the rows; with it the engine jumps to the right place — a **seek** (SQLite says `SEARCH`). Like finding a name in a phone book instead of reading it cover to cover.

```sql
CREATE INDEX ix_payments_installment ON payments (installment_id);
CREATE INDEX ix_installments_due     ON installments (due_date);
```

**SQL Server has two kinds.** A **clustered index** *is* the table: the rows themselves are stored in that order (one per table, usually the primary key — `loan_id`). **Non-clustered** indexes are separate sorted structures pointing into it (many per table). SQLite's `rowid` plays the clustered role; our course tables were loaded without declared primary keys, so `WHERE loan_id = 2242` scans until you add `CREATE UNIQUE INDEX ix_loans_id ON loans (loan_id)`.

**When a WHERE or JOIN benefits:** equality or range on the indexed column (`installment_id = ?`, `due_date >= ? AND due_date < ?`), a join on it (every `payments.installment_id = installments.installment_id`), an `ORDER BY` it. **When it does not:** a function wrapped around the column (`strftime('%Y-%m', due_date) = '2026-09'`, `LOWER(method) = 'card'`) — the engine cannot look up a value it has to compute per row; `LIKE '%x'`; a column with two values (`is_weekend`). Indexes cost space and slow every `INSERT`/`UPDATE` slightly — on an analytics copy that is almost always worth it; on the transactional system it is the DBA's call, not yours.

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

### Depth (optional)

- ▶ Baraa, *Views* [15:35:02](https://youtu.be/SSKVgrwhzus?t=56102), *CTAS and temp tables* [16:36:40](https://youtu.be/SSKVgrwhzus?t=59800), *Indexes* [18:23:42](https://youtu.be/SSKVgrwhzus?t=66222), *Execution plan* [20:20:31](https://youtu.be/SSKVgrwhzus?t=73231), *30 performance tips* [21:43:39](https://youtu.be/SSKVgrwhzus?t=78219) — long; watch Views + Indexes + the tips (≈2 h), the plan chapter if SQL Server is your target. Stored procedures and triggers (17:27:04, 18:12:58) are optional for an analyst.
- *Russian terms:* представление = view, временная таблица = temp table, материализация = materialisation, индекс = index, кластерный / некластерный = clustered / non-clustered, план выполнения = execution plan, полное сканирование = full scan, поиск по индексу = index seek.

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
| caveats | 15 `closed` loans with `closed_at` NULL carry DPD > 0; outstanding excludes interest; as-of fixed at 2026-10-01 |

The as-of date appears four times. In SQL Server, make it a parameter with an inline table-valued function (`CREATE FUNCTION f_loan_status(@asof DATE) RETURNS TABLE AS RETURN (…)`); in SQLite, keep a one-row `params` table and join it. For the course, the literal date is fine — write it in the view's header comment.

---

## 3. Practice (50 min)

File `week-03/day-4/practice.sql`. Work on a **copy** of `nur.db` (indexes and tables change the file).

**P1.** Create `v_payments_clean` and prove it: rows, total, distinct methods, and that no instalment has two rows left.

<details><summary>Answer</summary>
Section 1's view. `SELECT COUNT(*), SUM(amount), COUNT(DISTINCT method) FROM v_payments_clean` → 52 850 · 255 114 772 176 · 5; `SELECT MAX(c) FROM (SELECT installment_id, COUNT(*) c FROM v_payments_clean GROUP BY 1)` → 1.
</details>

**P2.** Create `v_loan_status` (worked example) and run the four checks. Then: outstanding by `region` and `bucket` from the view only — how long is that query compared with Monday's version from raw tables?

<details><summary>Answer</summary>
Checks as above. `SELECT region, bucket, SUM(outstanding) FROM v_loan_status GROUP BY 1, 2` — two lines instead of three joins and a CTE; Tashkent 90+ carries the largest dead outstanding. The point of the layer: the *question* is two lines, the *definition* is somewhere else, once.
</details>

**P3.** `EXPLAIN QUERY PLAN` for `SELECT * FROM payments WHERE loan_id = 2242` before and after `CREATE INDEX ix_payments_loan ON payments (loan_id)`. Copy both lines.

<details><summary>Answer</summary>
`SCAN payments` → `SEARCH payments USING INDEX ix_payments_loan (loan_id=?)`. (SQL Server: Table Scan → Index Seek in the graphical plan.)
</details>

**P4.** Two filters for September instalments — `strftime('%Y-%m', due_date) = '2026-09'` and the half-open range — with `ix_installments_due` in place. Plans? Same count?

<details><summary>Answer</summary>
Same count (the September instalments). Plans: `SCAN installments USING COVERING INDEX` for the function version — it still reads every entry; `SEARCH … (due_date>? AND due_date<?)` for the range. Habit 3.
</details>

**P5.** The clustered question: `EXPLAIN QUERY PLAN SELECT * FROM loans WHERE loan_id = 2242` vs `WHERE rowid = 2242`. Why do they differ, and what fixes the first?

<details><summary>Answer</summary>
`SCAN loans` vs `SEARCH loans USING INTEGER PRIMARY KEY (rowid=?)`: the table was loaded without a declared key, so `loan_id` is an ordinary column while `rowid` is the storage order (SQLite's clustered index). `CREATE UNIQUE INDEX ix_loans_id ON loans (loan_id)` → `SEARCH loans USING INDEX ix_loans_id`. In SQL Server you would declare `loan_id` the clustered primary key when creating the table.
</details>

**P6.** Habit 4: `SELECT COUNT(*), COUNT(DISTINCT l.loan_id) FROM loans l JOIN installments i ON i.loan_id = l.loan_id`. Someone "fixes" a multiplied report with `SELECT DISTINCT l.loan_id, l.principal …` and then sums. What is still wrong?

<details><summary>Answer</summary>
92 193 vs 7 828. `DISTINCT` on (loan_id, principal) does collapse to 7 828 rows — but only because those two columns are the same on every repeat; add any instalment column and it multiplies again, and `SUM(principal)` *before* the `DISTINCT` (the common mistake) is 24× too big. The fix is the grain: sum instalments per loan in a CTE, then join once.
</details>

**P7.** Create `t_loan_status` as a materialised copy (CTAS / `SELECT INTO`). Time the bucket count from the view and from the table. When would you ship the table instead of the view?

<details><summary>Answer</summary>
≈0.5 s vs ≈0 s here; the difference grows with data. Ship the table for a frozen month-end report or a nightly refresh; keep the view where the as-of must be *now*. Name it so nobody confuses them (`t_` / `v_`, or `_asof_20261001`).
</details>

**P8.** `v_portfolio_monthly`: build it (Company corner shows the query), check 1 700 rows = 34 months × 5 × 10, and reconcile September 2026 month-end outstanding with the as-of figure. Why do they differ by about 480 m?

<details><summary>Answer</summary>
208 243 879 623 (month end 30 Sep) vs 208 723 504 430 (as of 1 Oct). The month-end view excludes the 21 loans disbursed on 1 October (852 760 000 of principal, none yet repaid) and counts instalments due *on* 1 October as still outstanding (they are not yet due at midnight on 30 Sep). Two correct numbers, two definitions — write both in the data dictionary.
</details>

**P9.** Pick five of the ten habits and show, with one query each on our data, the slow form and the fast form (plans or row counts as evidence).

<details><summary>Answer</summary>
Any five with evidence — e.g. habit 1 (`SELECT *` vs three columns: compare the width), 3 (P4), 4 (P6), 5 (yesterday's P6 chain vs a join of raw tables), 9 (`ROW_NUMBER` latest loan vs the correlated `= MAX` subquery: same 4 335 rows). Full marks for *evidence*, not for prose.
</details>

**P10.** A temp table for a long script: `CREATE TEMP TABLE tmp_dpd AS SELECT loan_id, dpd, bucket, outstanding FROM v_loan_status WHERE dpd > 0`; count it; then run three questions against it (by bucket, by product via a join, average DPD of active loans).

<details><summary>Answer</summary>
399 rows. Bucket counts 124/25/16/234; by product SME carries the most overdue money, Consumer the most late loans (week 2 T11); active delinquent loans average 22.7 DPD. The temp table disappears when you close the connection — which is the point: scratch space, not a report.
</details>

<span class="badge stretch">Stretch</span> **P11.** Tuesday's P3 found 101 customers lent to again after a written-off loan. Using `v_loan_status` and `applications`, list the officers (`officer_id`) who approved the most such repeat loans, and the FPD30 of those repeat loans versus the book.

<details><summary>Answer</summary>
Self-join `loans` to find the repeat loans (same customer, `disbursed_at` later than a written-off loan's), join `applications` for `officer_id`, group and rank; then join week 2's `flags` block for FPD30. Expect the repeat loans to run well above 1.28 % — read your number and quote it with its count; small groups move a lot. The structure (CTE for repeats → join officer → aggregate → rank) is the week in one query.
</details>

---

## 4. Homework <span class="badge hw">HW 3.2 — Due Day 5</span>

**Timur's clean layer.** Submit to `submissions/week-03/day-4/`:

1. `views.sql` — `CREATE VIEW` for `v_payments_clean`, `v_loan_status`, `v_portfolio_monthly`, in that order (the second reads the first), each preceded by a header comment: grain, as-of date, source tables. Both dialects where they differ (`julianday` vs `DATEDIFF`, `WITH RECURSIVE` vs `WITH`, `CREATE TABLE AS` vs `SELECT INTO`), or a clear dialect header.
2. `dictionary.md` — one paragraph per view: **grain** (what is one row), **row count**, each **column** with its definition in one line (e.g. *outstanding — sum of `principal_due` over instalments with `due_date > as-of`*), the **as-of** rule, and known caveats (closed loans in 1–30; month-end vs as-of outstanding; the 25 removed duplicates).
3. `checks.sql` — the grain check (`COUNT(*)` = `COUNT(DISTINCT key)`) and the reconciliation totals for each view (7 828 loans / 208 723 504 430; 1 700 rows / 7 828 loans / 404 783 280 000 disbursed; 52 850 payments / 255 114 772 176).

Graded on: (a) the three views create and the checks pass, (b) the dictionary lets Timur use a column without reading the SQL, (c) one definition for DPD/outstanding across all three views — a `v_portfolio_monthly` outstanding that cannot be reconciled with `v_loan_status` loses the point.

---

## 5. Self-check

1. A view and a materialised table of the same query — which one changes when a payment is added tonight, and which is faster to read? *(→ section 1, "Views", "Materialising")*
2. `WHERE YEAR(disbursed_at) = 2026` on an indexed column — scan or seek, and how do you rewrite it? *(→ section 1, "Indexes", "Execution plan")*
3. Why is `SELECT DISTINCT` after a one-to-many join a trap rather than a fix? *(→ habit 4, P6)*

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

**`v_portfolio_monthly`** is the trend behind tiles 1 and 2 — one row per month × product × branch, built on a recursive calendar so that empty cells exist as zeros:

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

The first version of this view joined `cells` (50 rows per month) to `loans` without matching product and branch — and reported 10 trillion of outstanding. The reconciliation check (`SUM(outstanding_month_end)` for September against `v_loan_status`) caught it in one line. **Every view ships with its check query**; that is what `checks.sql` in HW 3.2 is for.

**Reading the six together.** Outstanding grows ~7 bn a month (151.8 bn in January to 208.2 bn in September) while disbursements run 12–22 bn: most of what is lent is repaid within the year (short Micro/BNPL/Consumer terms). PAR30 3.1 % and NPL90 2.6 % are close — the delinquent book is mostly *old*: 5.3 of the 6.5 bn at risk is already 90+. FPD30 at 1.1 % for July is in line with the 1.28 % history. A 94 % collection rate on September's dues means 6 % of what fell due is unpaid a month later — the inflow to Sevara's 1–30 bucket (117 loans on Tuesday). One page, six numbers, and every one of them traceable to a view and a definition — that is what "a clean layer" buys.

> Interview version: *"What goes on the first page of a lending dashboard, and where do the numbers come from?"* — Outstanding, disbursements MTD, PAR30, NPL90, FPD30 of the last mature vintage, collection rate; each from a view with a stated grain and as-of rule (loan-level status view, monthly portfolio view, clean payments view); name the definition under each tile and reconcile the views to each other.

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
{"id": "w03d4", "q": "Timur wants an NPL90 tile per region. Build v_loan_status as on this page (clean payments, as of 2026-10-01) and answer from the view only: what is NPL90 for the Tashkent region — the outstanding of loans with DPD over 90 divided by the region's total outstanding? Percentage to 2 decimals.", "type": "number", "dp": 2, "h": ["84584e0f0405652352b4fafa"], "hint": "A conditional sum over the view's outstanding column; the region is already a column of the view.", "sol": "U0VMRUNUIHJlZ2lvbiwKICAgICAgIFNVTShDQVNFIFdIRU4gZHBkID4gOTAgVEhFTiBvdXRzdGFuZGluZyBFTFNFIDAgRU5EKSBBUyBucGw5MF9vdXRzdGFuZGluZywKICAgICAgIFNVTShvdXRzdGFuZGluZykgQVMgb3V0c3RhbmRpbmcsCiAgICAgICBST1VORCgxMDAuMCAqIFNVTShDQVNFIFdIRU4gZHBkID4gOTAgVEhFTiBvdXRzdGFuZGluZyBFTFNFIDAgRU5EKSAvIFNVTShvdXRzdGFuZGluZyksIDIpIEFTIG5wbDkwX3BjdApGUk9NIHZfbG9hbl9zdGF0dXMKR1JPVVAgQlkgcmVnaW9uCk9SREVSIEJZIG5wbDkwX3BjdCBERVNDOwotLSB0aGUgc2FtZSB0ZXh0IG9uIFNRTCBTZXJ2ZXIKLS0gVGFzaGtlbnQ6IDEgOTIwIDk0MyA5NzAgLyA4MSA2NzkgNzM4IDA3MSA9IDIuMzUgJSAoOTEgbG9hbnMgb3ZlciA5MCBEUEQpClRoZSBjb21wYW55J3MgTlBMOTAgaXMgMi41NSAlOyBUYXNoa2VudCwgd2l0aCAzOSAlIG9mIHRoZSBib29rLCBzaXRzIHNsaWdodGx5IGJlbG93IGl0LCBhbmQgTnVrdXMgaXMgdGhlIG91dGxpZXIgYXQgNi43NCAlLiBPdmVyIDkwIG1lYW5zIGJ1Y2tldCA5MCssIHNvIGRwZCA+IDkwLCBub3QgPj0gOTAuIE9uY2UgdGhlIHZpZXcgaXMgcmlnaHQgdGhlIHRpbGUgaXMgb25lIEdST1VQIEJZIOKAlCB0aGUgZGVmaW5pdGlvbiBvZiBEUEQgYW5kIG91dHN0YW5kaW5nIGxpdmVzIGluIG9uZSBwbGFjZSwgd2hpY2ggaXMgd2hhdCBUaW11ciBhc2tlZCBmb3Iu"}
```

<!-- challenge:end -->
