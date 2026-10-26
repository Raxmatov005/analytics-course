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

```sql
SELECT COUNT(*) FROM loans WHERE principal > (SELECT AVG(principal) FROM loans);        -- 1130 loans above 51 709 668
SELECT p.code, COUNT(*) AS loans, ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM loans), 1) AS share_pct
FROM loans l JOIN products p ON p.product_id = l.product_id GROUP BY p.code;            -- MICRO 34.1 · CONS 30.9 · BNPL 20.0 · SME 10.0 · AUTO 5.0
```

The bracketed query (*подзапрос*) returns exactly one row and one column; the engine runs it once and uses the value. You used one in week 2 Day 3 for the share of payments. Monday's `SUM(COUNT(*)) OVER ()` does the same job for shares with no second query; the scalar subquery wins when the denominator comes from a *different* table or filter (loans above the company average, applications over the approval count).

### IN — a list — and the NULL trap

```sql
SELECT COUNT(*) FROM customers WHERE customer_id IN (SELECT customer_id FROM loans WHERE status = 'written_off');   -- 188
```

`IN (subquery)` is true when the value appears in the list. `NOT IN` is the dangerous one. If the list contains a single **NULL**, `x NOT IN (…)` is *unknown* for every x (because `x <> NULL` is unknown) and the query returns **nothing**, silently:

```sql
SELECT COUNT(*) FROM loans WHERE disbursed_at NOT IN (SELECT closed_at FROM loans);                            -- 0  (closed_at has 3 601 NULLs)
SELECT COUNT(*) FROM loans WHERE disbursed_at NOT IN (SELECT closed_at FROM loans WHERE closed_at IS NOT NULL); -- 649
```

Rule: never `NOT IN` against a column that can be NULL without `IS NOT NULL` inside — or use `NOT EXISTS`, which has no such problem. (Primary and foreign keys in our tables are never NULL, so `customer_id NOT IN (SELECT customer_id FROM loans)` is safe here — but the habit matters more than the case.)

### EXISTS / NOT EXISTS — a test

```sql
SELECT COUNT(*) FROM customers c WHERE NOT EXISTS (SELECT 1 FROM loans l WHERE l.customer_id = c.customer_id);          -- 1705 customers, no loan
SELECT COUNT(*) FROM customers c WHERE EXISTS (SELECT 1 FROM applications a WHERE a.customer_id = c.customer_id)
                                   AND NOT EXISTS (SELECT 1 FROM loans l WHERE l.customer_id = c.customer_id);          -- 1118 applied, never borrowed
SELECT COUNT(*) FROM applications a WHERE NOT EXISTS (SELECT 1 FROM app_events e WHERE e.application_id = a.application_id);  -- 8994 — all branch + partner (week 8)
```

`EXISTS` asks *is there at least one row?* — it stops at the first match, never multiplies rows, ignores NULLs, and reads like the sentence. `SELECT 1` because the content of the inner result is irrelevant. It is week 2's anti-join written differently — the same 1 705 customers both ways:

```sql
SELECT COUNT(*) FROM customers c LEFT JOIN loans l ON l.customer_id = c.customer_id WHERE l.loan_id IS NULL;      -- 1705 (week 2)
SELECT COUNT(*) FROM customers c WHERE NOT EXISTS (SELECT 1 FROM loans l WHERE l.customer_id = c.customer_id);    -- 1705 (today)
```

The `LEFT JOIN` form can bring columns from the right side into the output (useful when you *want* the matches too); `NOT EXISTS` cannot multiply rows even if a customer had seven loans, and needs no `IS NULL` on a column you have to pick carefully. Pick the one that reads better; for "has none" it is usually `NOT EXISTS`.

### Which form, when

| You need | Form | Example today |
|---|---|---|
| one number to compare against or divide by | scalar subquery | loans above the company average (1 130) |
| membership in a set | `IN` / `EXISTS` | customers with a written-off loan (188) |
| absence from a set | `NOT EXISTS` (or `NOT IN` + `IS NOT NULL`) | customers who never borrowed (1 705) |
| a comparison with the row's own group | correlated subquery — or a window | above the product average (3 919) |
| aggregate twice | derived table / CTE | loans per customer → customers per count |
| several named steps, different grains | CTE chain | vintage: instalment → flag → ever → cohort |
| rows that exist in no table | recursive CTE (or `dim_date`) | the month calendar (21 rows) |

### Correlated subqueries — the inner query looks at the outer row

In the `EXISTS` examples the inner query mentions `c.customer_id` — a column of the **outer** row. That makes it **correlated** (*коррелированный подзапрос*): conceptually it runs once per outer row. The classic use is "compared to its own group":

```sql
SELECT COUNT(*) FROM loans l WHERE l.principal > (SELECT AVG(x.principal) FROM loans x WHERE x.product_id = l.product_id);   -- 3919
SELECT COUNT(*) FROM loans l WHERE l.principal = (SELECT MAX(x.principal) FROM loans x WHERE x.customer_id = l.customer_id); -- 4335 (one per borrower)
```

3 919 is Monday's P6 answer, obtained without a window. Both are right; the window version is usually faster and shows the comparison value in the output; the correlated version is what you reach for when the comparison needs a *different filter* than the outer row (e.g. "loans larger than the average of *closed* loans in their product").

### Derived tables — a query in FROM

```sql
SELECT loans_per_customer, COUNT(*) AS customers
FROM (SELECT customer_id, COUNT(*) AS loans_per_customer FROM loans GROUP BY customer_id) AS t
GROUP BY loans_per_customer ORDER BY loans_per_customer;
-- 1 → 2089 · 2 → 1378 · 3 → 593 · 4 → 194 · 5 → 62 · 6 → 15 · 7 → 4
```

A derived table (*производная таблица*) is a result set used as a table: it must have an alias (`t`) in SQL Server, and every column a name. It is how you **aggregate twice** — week 2's T6 by eye becomes one query. It is also where a window goes before you filter on it (Monday's P6).

### CTEs — derived tables with names, in order

`WITH name AS (…)` defines a result once, at the top, and the main query uses it by name. Several in a row — a **chain** — read like steps of a recipe. You have used two already:

```sql
WITH unpaid AS ( … matured instalments not fully paid … ),         -- step 1: grain = instalment
     dpd    AS ( … per loan: MIN(due_date), days … ),              -- step 2: grain = loan, built from step 1
     buckets AS ( SELECT loan_id, CASE … END AS bucket FROM dpd )  -- step 3: a label per loan
SELECT bucket, COUNT(*) FROM buckets GROUP BY bucket;               -- step 4: the answer
```

Each CTE may use every CTE above it. The chain fixes the grain explicitly at every step — the cure for week 2's row-multiplication problem: *aggregate at each grain, then join the aggregates*. **When a CTE beats a subquery:** when the same result is needed twice (two snapshots, two aggregates from one base), when the nesting would exceed two levels, or when a reader must follow it — a CTE chain is read top-down, a nested subquery inside-out. When a subquery is fine: a one-line scalar or a single `EXISTS`. Performance is the same on both engines today (both are inlined); Thursday's views are CTEs that *persist*.

### Recursive CTE — generating rows that are not in any table

`GROUP BY month` only shows months that **have** rows. A month with zero disbursements of a product at a branch simply vanishes — and a chart with a missing month lies. You need a **calendar**, and a recursive CTE (*рекурсивный CTE*) builds one from nothing:

```sql
WITH RECURSIVE months(month_start) AS (
  SELECT '2025-01-01'                                             -- anchor
  UNION ALL
  SELECT date(month_start, '+1 month') FROM months                -- recursive step; SQL Server: DATEADD(month, 1, month_start), no RECURSIVE keyword
  WHERE month_start < '2026-09-01')                               -- stop condition
SELECT COUNT(*), MIN(month_start), MAX(month_start) FROM months;  -- 21 · 2025-01-01 · 2026-09-01
```

Anchor row, then "take the last rows and produce the next" until the condition fails. `LEFT JOIN` your aggregate onto it and the empty months appear as zeros: in 2026 the branch × product × month grid has 450 cells and **16 are empty** — 13 Auto months, 3 SME months at small branches — invisible to a plain `GROUP BY`. **The `dim_date` alternative:** `SELECT DISTINCT date(date_key, 'start of month') FROM dim_date WHERE year = 2026` — simpler, identical on both engines, and the reason week 1 shipped the table; use the recursion when there is no date dimension or when you need another sequence (numbers 1..6 for months-on-book: `WITH RECURSIVE k(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM k WHERE n < 6)`).

### Depth (optional)

- ▶ Baraa, *Subqueries* [12:58:04](https://youtu.be/SSKVgrwhzus?t=46684&end=51488), *CTE* [14:18:08](https://youtu.be/SSKVgrwhzus?t=51488&end=56102) — ~2 h 30; his recursive examples use SQL Server syntax (no `RECURSIVE` keyword, `MAXRECURSION` option).
- RU deck (TBC Data Analytics 2.0, if you have it) `2.4 SQL Advanced.pdf` — subqueries and the recursive CTE pages. *Russian terms:* подзапрос = subquery, обобщённое табличное выражение (ОТВ) = CTE, рекурсия = recursion, когорта/винтаж = cohort/vintage.

---

## 2. Worked example — one loan's vintage flags, by hand (15 min)

Before the matrix, one loan. Nilufar's definition, written out: *loan is "ever 30+ by MOB k" if any of its instalments 1..k was not fully paid 30 days after its due date* (as of 2026-10-01). Three grains, three CTEs:

```sql
WITH inst AS (                                   -- grain: instalment — was it paid within 30 days?
  SELECT i.loan_id, i.installment_no, i.due_date, i.total_due,
         COALESCE(SUM(CASE WHEN p.paid_at <= date(i.due_date, '+30 days') THEN p.amount END), 0) AS paid_by_30   -- DATEADD(day, 30, i.due_date)
  FROM installments i LEFT JOIN payments p ON p.installment_id = i.installment_id
  WHERE i.installment_no <= 6 AND date(i.due_date, '+30 days') <= '2026-10-01'            -- only instalments whose 30 days have passed
  GROUP BY i.installment_id, i.loan_id, i.installment_no, i.due_date, i.total_due),
flag AS (                                        -- grain: instalment — 1 if 30+ late
  SELECT loan_id, installment_no, CASE WHEN paid_by_30 < total_due THEN 1 ELSE 0 END AS late30 FROM inst),
ever AS (                                        -- grain: instalment — "ever so far": running MAX over the loan's instalments (Monday's frame)
  SELECT loan_id, installment_no, late30, MAX(late30) OVER (PARTITION BY loan_id ORDER BY installment_no) AS ever30 FROM flag)
SELECT * FROM ever WHERE loan_id = 1 ORDER BY installment_no;
```

Loan 1: instalments 1–6 all `late30 = 0`, so `ever30 = 0` at every MOB — the March instalment was 45 days late but that is instalment 12, outside MOB 1..6. A loan whose instalment 2 is late shows `late30` 0, 1, 0, 0, 0, 0 and `ever30` 0, **1, 1, 1, 1, 1**: once late, "ever late" stays on. That running `MAX` is the whole trick — it turns a per-instalment event into a cumulative loan state. Check the base: `inst` has 33 198 rows for 7 099 loans; 967 of those instalments, on 457 loans, are 30+ late; at MOB 1 the flag equals week 2's FPD30 to the loan (91 of 7 099 = 1.28 %) — the two definitions meet, which is the check that you built it right.

---

## 3. Practice (50 min)

Write each query in the box under its question — it is saved in this browser. **✔ Check** tells you whether your result matches the answer. Also due today: **HW 3.1** (Day 1's hand-in box).

**P1.** Loans larger than the average SME loan (scalar subquery), by product. Why is the answer not "all SME loans above average" only?

<details><summary>Answer</summary>

`WHERE principal > (SELECT AVG(principal) FROM loans WHERE product_id = 5)` (308 728 745) → SME 400, AUTO 88 — Auto's biggest loans exceed the average SME loan; no other product comes close. A scalar subquery with its own filter — the window cannot do this one.

</details>

**P2.** Customers who have a written-off loan: once with `IN`, once with `EXISTS`. Same count? Which reads better when you also want to exclude customers with an *active* loan?

<details><summary>Answer</summary>

188 both ways. The second condition is a second `NOT EXISTS (SELECT 1 FROM loans l WHERE l.customer_id = c.customer_id AND l.status = 'active')` → 127 customers with a write-off and no live loan — two tests side by side read as a sentence; with `IN` it becomes `IN (…) AND customer_id NOT IN (…)`, which also works because `customer_id` is never NULL. Count both and keep the one you can explain.

</details>

**P3.** The `NOT IN` trap, demonstrated: loans disbursed on a date on which no loan was closed, written three ways (NOT IN raw, NOT IN with `IS NOT NULL`, NOT EXISTS). Explain the 0.

<details><summary>Answer</summary>

0 · 649 · 649 (section 1). `closed_at` is NULL for 3 601 loans; one NULL in the list makes `NOT IN` unknown for every row. `NOT EXISTS` compares row by row with `=`, and a NULL simply never matches.

</details>

**P4.** With a derived table: the distribution of **instalments per loan** (term) — how many loans have 3, 6, 12 … instalments — and check it against `term_months`.

<details><summary>Answer</summary>

```sql
SELECT n_inst, COUNT(*) AS loans FROM (SELECT loan_id, COUNT(*) AS n_inst FROM installments GROUP BY loan_id) t GROUP BY n_inst ORDER BY n_inst;
-- 3 → 1867 · 6 → 2483 · 12 → 1346 · 18 → 621 · 24 → 973 · 36 → 401 · 48 → 137
SELECT COUNT(*) FROM loans l WHERE term_months <> (SELECT COUNT(*) FROM installments i WHERE i.loan_id = l.loan_id);   -- 0
```
Every schedule has exactly `term_months` rows (the correlated subquery proves it: 0 mismatches). Counts: 3-month = Micro 1 335 + BNPL 532 = 1 867 — the sum reconciles with Tuesday's product × term table.

</details>

**P5.** Correlated: each customer's **largest** loan — count the rows, then explain why `WHERE principal = (SELECT MAX …)` gives exactly 4 335 and when it could give more.

<details><summary>Answer</summary>

4 335 = one per borrower. It would give more if a customer had two loans with the *same* maximal principal (both match `= MAX`); `ROW_NUMBER() … ORDER BY principal DESC, loan_id` with `rn = 1` is the version that guarantees one row. Know both; say which you used.

</details>

**P6.** A CTE chain in four steps: (1) outstanding per loan, (2) outstanding per customer, (3) the customer's rank, (4) the top 10 with name and segment. One `WITH`, four names.

<details><summary>Answer</summary>

```sql
WITH per_loan AS (SELECT loan_id, SUM(principal_due) AS outstanding FROM installments WHERE due_date > '2026-10-01' GROUP BY loan_id),
per_customer AS (SELECT l.customer_id, SUM(pl.outstanding) AS outstanding, COUNT(*) AS loans FROM per_loan pl JOIN loans l ON l.loan_id = pl.loan_id GROUP BY l.customer_id),
ranked AS (SELECT *, ROW_NUMBER() OVER (ORDER BY outstanding DESC) AS rn FROM per_customer)
SELECT r.rn, c.first_name || ' ' || c.last_name AS customer, c.segment, r.loans, r.outstanding
FROM ranked r JOIN customers c ON c.customer_id = r.customer_id WHERE r.rn <= 10 ORDER BY r.rn;
-- 1 Ulugbek Nazarov (sme) 2 loans 977 697 006 · 2 Davron Tashkentov (mass) 4 · 840 677 484 · 3 Umida Yusupova (mass) 3 · 752 948 733 …
```
Each step has one grain (instalment → loan → customer → ranked customer). Joining `customers` at the end, to 10 rows, is cheaper and safer than joining it to 92 193 instalments at the start.

</details>

**P7.** Recursive calendar 2026-01..2026-09 × products × branches, `LEFT JOIN` the monthly disbursement counts. How many empty cells, and for which products?

<details><summary>Answer</summary>

450 cells (9 × 5 × 10), **16 empty**: Auto 13 (five of them Termez Central), SME 3 (Fergana, Nukus, Termez) — the two big-ticket products skip months, mostly at the smallest branch. The same query without the calendar returns 434 rows and the chart silently interpolates. Use `dim_date` for the months if you prefer; the `CROSS JOIN products CROSS JOIN branches` is the part that makes the grid.

</details>

**P8.** Nilufar's matrix, long form: cohort × MOB → loans observed, ever-30+ count, rate — for cohorts 2025-01..2026-03, loans with `term_months >= 6`. Which cohort is worst at MOB 3?

<details><summary>Answer</summary>

The worked example's three CTEs plus a `base` CTE (`loans WHERE term_months >= 6 AND disbursed_at >= '2025-01-01' AND disbursed_at < '2026-04-01'`), joined and grouped by `cohort, installment_no`. Worst at MOB 3: **2025-10 — 15 of 217 = 6.91 %**; then 2025-09 5.70 %, 2025-03 5.59 %, 2025-05 5.41 %. The Company corner pivots this into the wide matrix.

</details>

**P9.** Pivot P8 to wide (MOB 1..6 as columns, `SUM(CASE WHEN installment_no = k THEN ever30 END) / SUM(installment_no = k)`), and make a cell **NULL when not every loan of the cohort is observable** at that MOB. Which cells go blank?

<details><summary>Answer</summary>

Add `COUNT(*)` per cohort×MOB and the cohort size (`(SELECT COUNT(*) FROM base x WHERE x.cohort = b.cohort)`), and `CASE WHEN observed = size THEN rate END`. Blank: **2026-03 at MOB 5 (250 of 251 observed) and MOB 6 (5 of 251)** — the March loans' sixth instalment falls due after 1 September for 246 of the 251, so its 30 days are not up by 1 October. A 0.0 % in that cell would be a lie: not "nobody late", but "nobody measured".

</details>

**P10.** Vintage curve pooled by **grade** instead of by month (2025-01..2026-03, term ≥ 6): rate at MOB 1, 3, 6. Does the scorecard order the curves?

<details><summary>Answer</summary>

A 0.43 / 1.86 / 3.13 % · B 0.93 / 2.49 / 5.18 · C 1.99 / 7.18 / 11.52 · D 2.16 / 11.51 / **19.08**. Strictly ordered at every MOB, and the gap widens with age: one in five D loans has been 30+ late within six months. Same chain, `GROUP BY l.risk_grade` instead of cohort.

</details>

<span class="badge stretch">Stretch</span> **P11.** Build the calendar with `dim_date` instead of recursion, and extend the vintage chain to MOB 1..12 for the 2025 cohorts. At which MOB does the pooled 2025 curve pass 10 %?

<details><summary>Answer</summary>

`SELECT DISTINCT date(date_key, 'start of month') FROM dim_date WHERE date_key BETWEEN …` replaces the recursive CTE line for line. Change `installment_no <= 6` to `<= 12` and keep `term_months >= 12` for a clean denominator. The pooled 2025 curve (term ≥ 6, MOB 1..6) runs 1.45 → 2.85 → 4.35 → 5.50 → 6.39 → 7.46 %; it is concave — most trouble appears in the first three months, which is why FPD/SPD/TPD are watched separately. Read your own MOB 7..12 values and name the crossing month.

</details>

---

## 4. Self-check

1. `x NOT IN (subquery)` returned no rows although you know matches exist. What is in the list, and what are the two fixes? *(→ section 1, "IN — and the NULL trap")*
2. When does a CTE chain beat nested subqueries, and when is a plain scalar subquery enough? *(→ section 1, "CTEs")*
3. What does the recursive CTE add to a monthly chart that `GROUP BY month` cannot, and what is the `dim_date` alternative? *(→ section 1, "Recursive CTE")*

---

## 5. Company corner <span class="badge company">Vintage curves</span>

A **vintage** (*винтаж*) is the set of loans disbursed in one month; a **vintage curve** follows each vintage over its life, measured in **months on book** (MOB, *месяц жизни*) rather than calendar time. Because every cohort is read at the same age, a January and an October cohort become comparable even though one is nine months older. Our definitions, written on the slide:

- **Cohort** = month of `disbursed_at`; **MOB k** = instalment k (our schedules are monthly, so instalment number is age).
- **Ever 30+ by MOB k** = at least one of instalments 1..k was **not fully paid 30 days after its due date**, as of 2026-10-01.
- **Base:** loans with `term_months >= 6` (so every loan has all six instalments); a cell is shown only when **all** of the cohort's loans have had their 30 days at that MOB.

```sql
WITH inst AS ( … ), flag AS ( … ), ever AS ( … ),                        -- the worked example
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
-- SQL Server: identical except DATEADD(day, 30, i.due_date) in inst and FORMAT(disbursed_at, 'yyyy-MM') in base
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

**The chart Nilufar draws:** MOB on the x-axis (1..6), ever-30+ % on the y-axis, one line per cohort, the worst one coloured. The pooled 2025 line — 1.45 → 2.85 → 4.35 → 5.50 → 6.39 → 7.46 % — is the benchmark every new cohort is read against at equal age. MOB 1 of this chart *is* FPD30 (1.28 % overall), which is how the two reports reconcile.

> Interview version: *"How do you build a vintage analysis in SQL?"* — Cohort = disbursement month, age = instalment number; per instalment, paid within 30 days of due via LEFT JOIN payments with a date condition; flag late; running `MAX` over the loan's instalments for "ever"; restrict to instalments whose 30 days have passed and to cohorts fully observable at each MOB; pivot with `SUM(CASE)` into cohort × MOB; read down the columns; check that the MOB-1 column equals FPD30.

Tomorrow: the three `WITH` blocks you now own become **views** — a clean layer Timur can point Power BI at — and we make them fast.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w03d3", "pass": 0.8, "questions": [
  {"type": "single", "q": "closed_at is NULL for every loan still open. What does this return, and why?", "code": "SELECT COUNT(*) FROM loans\nWHERE disbursed_at NOT IN (SELECT closed_at FROM loans);", "options": ["The loans disbursed on a day no loan was closed", "0 — one NULL in the list makes NOT IN unknown for every row", "An error", "Every loan"], "answer": 1, "explain": "x <> NULL is unknown; add WHERE closed_at IS NOT NULL inside, or use NOT EXISTS (→ section 1, IN — a list — and the NULL trap)."},
  {"type": "multi", "q": "Which statements about NOT EXISTS (SELECT 1 FROM loans l WHERE l.customer_id = c.customer_id) are true?", "options": ["It stops at the first matching row", "It cannot multiply rows, even for a customer with seven loans", "A NULL in the inner table simply never matches, so there is no NULL trap", "It needs an IS NULL test on a right-hand column", "It can show the matching loan's columns in the output"], "answer": [0, 1, 2], "explain": "IS NULL on a carefully picked column and right-side columns in the output belong to the LEFT JOIN anti-join (→ section 1, EXISTS / NOT EXISTS)."},
  {"type": "single", "q": "What does this query return?", "code": "SELECT loans_per_customer, COUNT(*) AS customers\nFROM (SELECT customer_id, COUNT(*) AS loans_per_customer\n      FROM loans GROUP BY customer_id) AS t\nGROUP BY loans_per_customer;", "options": ["One row per customer with their loan count", "How many customers have 1 loan, 2 loans, 3 loans …", "The total number of loans", "An error — GROUP BY cannot be used twice"], "answer": 1, "explain": "A derived table lets you aggregate twice: first per customer, then per count (→ section 1, Derived tables)."},
  {"type": "single", "q": "What makes a subquery correlated?", "options": ["It returns more than one row", "It refers to a column of the outer query's current row, so conceptually it runs once per outer row", "It sits in the FROM clause", "It uses GROUP BY"], "answer": 1, "explain": "E.g. WHERE l.principal > (SELECT AVG(x.principal) FROM loans x WHERE x.product_id = l.product_id) (→ section 1, Correlated subqueries)."},
  {"type": "number", "q": "How many rows does this calendar have?", "code": "WITH RECURSIVE months(month_start) AS (\n  SELECT '2026-01-01'\n  UNION ALL\n  SELECT date(month_start, '+1 month') FROM months\n  WHERE month_start < '2026-06-01')\nSELECT COUNT(*) FROM months;", "answer": 6, "explain": "The anchor gives January; each step adds a month while the last one is before June, so June is the last row: January to June (→ section 1, Recursive CTE)."},
  {"type": "single", "q": "When does a CTE chain beat nested subqueries?", "options": ["Never — they are always slower", "When the same result is needed twice, when nesting goes deeper than two levels, or when someone must read the steps top-down", "Only in SQL Server", "When you need a single scalar value"], "answer": 1, "explain": "A chain fixes one grain per step and reads like a recipe; a one-line scalar or a single EXISTS is fine as a subquery (→ section 1, CTEs)."},
  {"type": "single", "q": "A loan's late30 flags for instalments 1–6 are 0, 1, 0, 0, 0, 0. What does MAX(late30) OVER (PARTITION BY loan_id ORDER BY installment_no) give?", "options": ["0, 1, 0, 0, 0, 0", "0, 1, 1, 1, 1, 1", "1, 1, 1, 1, 1, 1", "0, 0, 0, 0, 0, 1"], "answer": 1, "explain": "The running MAX turns a per-instalment event into 'ever late so far', which stays on once set (→ section 2, Worked example)."},
  {"type": "single", "q": "At MOB 3 the 2026-03 cohort shows 3.98 % ever-30+, and the 2025-03 cohort shows 9.94 % at MOB 6. Is the new book cleaner?", "options": ["Yes — 3.98 is far below 9.94", "Not from these two cells: compare cohorts at the same MOB (read down a column)", "Yes, because 2026 has more loans", "No — newer cohorts are always worse"], "answer": 1, "explain": "The newer cohort is younger, not necessarily better; at MOB 3, 2025-03 was 5.59 % (→ section 5, Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w03d3", "q": "Nilufar wants one pooled vintage number for the app channel. Take loans disbursed in 2025 (all twelve monthly cohorts pooled) with term_months >= 6 whose application came through the app channel, and compute the share that were ever 30+ days late by MOB 6 (the Company corner's definition). Percentage to 2 decimals.", "type": "number", "dp": 2, "h": ["bfb301d2841e84361652db14"], "hint": "The channel is not on loans — a subquery can bring it in without changing the grain.", "sol": "V0lUSCBpbnN0IEFTICgg4oCmd29ya2VkIGV4YW1wbGXigKYgKSwgZmxhZyBBUyAoIOKApiApLCBldmVyIEFTICgg4oCmICksCmJhc2UgQVMgKFNFTEVDVCBsb2FuX2lkIEZST00gbG9hbnMKICAgICAgICAgV0hFUkUgdGVybV9tb250aHMgPj0gNgogICAgICAgICAgIEFORCBkaXNidXJzZWRfYXQgPj0gJzIwMjUtMDEtMDEnIEFORCBkaXNidXJzZWRfYXQgPCAnMjAyNi0wMS0wMScKICAgICAgICAgICBBTkQgYXBwbGljYXRpb25faWQgSU4gKFNFTEVDVCBhcHBsaWNhdGlvbl9pZCBGUk9NIGFwcGxpY2F0aW9ucyBXSEVSRSBjaGFubmVsID0gJ2FwcCcpKQpTRUxFQ1QgQ09VTlQoKikgQVMgbG9hbnMsIFNVTShlLmV2ZXIzMCkgQVMgZXZlcjMwLAogICAgICAgUk9VTkQoMTAwLjAgKiBTVU0oZS5ldmVyMzApIC8gQ09VTlQoKiksIDIpIEFTIHBjdApGUk9NIGJhc2UgYgpKT0lOIGV2ZXIgZSBPTiBlLmxvYW5faWQgPSBiLmxvYW5faWQgQU5EIGUuaW5zdGFsbG1lbnRfbm8gPSA2OwotLSA1MzkgbG9hbnMsIGFsbCBvYnNlcnZlZCBhdCBNT0IgNjsgNTAgZXZlciAzMCsg4oaSIDkuMjggJQotLSBTUUwgU2VydmVyOiBEQVRFQUREKGRheSwgMzAsIGkuZHVlX2RhdGUpIGluIGluc3QsIHRoZSByZXN0IGlkZW50aWNhbApUaGUgcG9vbGVkIDIwMjUgbGluZSBmb3IgYWxsIGNoYW5uZWxzIGVuZHMgYXQgNy40NiAlIGF0IE1PQiA2OyBicmFuY2ggNy4zOCAlLCBwYXJ0bmVyIDUuNDEgJSwgYXBwIDkuMjggJS4gRXZlcnkgbG9hbiBpbiB0aGlzIGJhc2UgaXMgYSA2LW1vbnRoIE1pY3JvIGxvYW4sIHNvICJhcHAiIGFuZCAiTWljcm8iIGFyZSB0aGUgc2FtZSBjdXQgaGVyZS4gVGhlIGFwcCdzIGZpcnN0LXBheW1lbnQgZ2FwIGZyb20gd2VlayAyIGRvZXMgbm90IGNsb3NlIHdpdGggYWdlOiBieSBtb250aCA2IHJvdWdobHkgb25lIGFwcCBsb2FuIGluIGVsZXZlbiBoYXMgYmVlbiBhIG1vbnRoIGxhdGUu"}
```

<!-- challenge:end -->
