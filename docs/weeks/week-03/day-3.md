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

```pic
{"id": "w03d3-pic1", "title": "A scalar subquery is one value, used like a number", "caption": "The brackets run first and return one value, the average principal. The outer `WHERE` then compares every loan with it: green loans are larger and stay.", "tables": [{"id": "sub", "name": "subquery", "label": "one value", "cols": ["AVG(principal)"], "rows": [["51 709 668"]], "cells": [[0, "AVG(principal)"]]}, {"id": "loans", "name": "loans", "cols": ["loan_id", "principal"], "rows": [[19, "7 220 000"], [20, "244 440 000"], [21, "21 790 000"], [22, "4 400 000"], [23, "4 530 000"], [24, "312 220 000"]], "keep": [1, 5], "drop": [0, 2, 3, 4], "via": "WHERE principal > ( … )", "more": "… 7 828 loans in all"}]}
```

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

```task
{"id": "w03d3-l1", "kind": "number", "answer": 488, "dp": 0, "unit": "loans", "hint": "WHERE principal > (SELECT AVG(principal) FROM loans WHERE product_id = 5)", "model": "488 — 400 SME loans and 88 Auto loans exceed 308 728 745, the average SME loan."}
```

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

```task
{"id": "w03d3-l2", "kind": "number", "answer": 2669, "dp": 0, "unit": "loans", "hint": "SELECT COUNT(*) FROM loans WHERE application_id IN (SELECT application_id FROM applications WHERE channel = 'app');", "model": "2 669 — exactly the Micro loans: the app sells one product. IN brought the channel in without joining a second table into the result."}
```

> 🎬 **Didn't get IN with a subquery?** [Baraa explains it · 8 min](https://youtu.be/SSKVgrwhzus?t=49138&end=49648)

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

```task
{"id": "w03d3-l3", "kind": "number", "answer": 3, "dp": 0, "unit": "branches", "hint": "SELECT COUNT(*) FROM branches b WHERE NOT EXISTS (SELECT 1 FROM loans l WHERE l.branch_id = b.branch_id AND l.status = 'written_off' AND l.product_id = 4);", "model": "3 branches have never written off an Auto loan; the other 7 have at least one."}
```

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

```task
{"id": "w03d3-l4", "kind": "number", "answer": 48.2, "dp": 1, "unit": "%", "hint": "ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) in the outer SELECT.", "model": "48.2 % — 2 089 of 4 335 borrowers took one loan only. Half the customers never came back for a second."}
```

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

```task
{"id": "w03d3-l5", "kind": "number", "answer": 846, "dp": 0, "unit": "loans", "hint": "Change 0.99 to 0.9 in the query above.", "model": "846 loans — about one in nine sits in the top tenth of its product's range, close to the limit."}
```

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

> ⚠️ **Watch out.** A CTE lives for **one statement only** — the `SELECT` right after the `WITH`. Put a `;` after it and the next query cannot see the name (*no such table*). To reuse a result across queries you need a view or a table — Thursday.

**Your turn.**

```game
{"type": "bug", "id": "w03d3-g3", "title": "Find the broken line", "q": "Two questions about the same CTE. The first runs; the second says no such table: per_loan. Which line fails?", "code": "WITH per_loan AS (SELECT loan_id, SUM(principal_due) AS outstanding\n                  FROM installments WHERE due_date > '2026-10-01' GROUP BY loan_id)\nSELECT COUNT(*) FROM per_loan;\nSELECT AVG(outstanding) FROM per_loan;", "answer": [3], "why": "A CTE exists only for the one statement that follows it; after the semicolon it is gone. Repeat the WITH, put both numbers in one SELECT, or save the result as a view or table (Day 4)."}
```

> 🎬 **Didn't get CTE?** [Baraa explains it · 8 min](https://youtu.be/SSKVgrwhzus?t=51494&end=51975)

> 🎬 **Didn't get a standalone CTE?** [Baraa explains it · 9 min](https://youtu.be/SSKVgrwhzus?t=52316&end=52842)

### A chain of CTEs — one grain per step

**What it is.** One `WITH` can define **several** CTEs, separated by commas. Each may use every CTE above it. A **chain** turns a long analysis into named steps, each with one **grain** — one thing that a row is.

```pic
{"id": "w03d3-pic2", "title": "A CTE chain: one grain per step", "caption": "Three customers, one colour each. Step 1 has a row per loan, step 2 a row per customer, step 3 a row per number of owing loans, counted over all borrowers. Each customer lands in the row of their own count.", "tables": [{"id": "pl", "name": "per_loan", "cols": ["loan_id", "outstanding"], "rows": [[3091, "3 315 222"], [5337, "3 266 500"], [1305, "2 720 000"], [1632, "13 363 875"], [4962, "9 794 087"], [7693, "6 195 970"]], "tone": ["b", "b", "a", "c", "c", "c"], "more": "… 3 409 loans"}, {"id": "pc", "name": "per_customer", "cols": ["customer_id", "owing_loans", "outstanding"], "rows": [[5, 1, "2 720 000"], [1, 2, "6 581 722"], [9, 3, "29 353 932"]], "tone": ["a", "b", "c"], "via": "GROUP BY l.customer_id"}, {"id": "fin", "name": "result", "cols": ["owing_loans", "customers", "avg_outstanding"], "rows": [[1, "1 859", "63 340 783"], [2, "513", "115 862 999"], [3, "134", "181 709 079"], [4, "24", "227 685 135"], [5, "4", "254 977 446"], [6, "1", "701 901 165"]], "tone": ["a", "b", "c", null, null, null], "via": "GROUP BY owing_loans"}], "stack": true}
```

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

```game
{"type": "cloze", "id": "w03d3-g2", "title": "Assemble the chain", "text": "WITH {{0}} AS (SELECT customer_id, COUNT(*) AS n FROM loans {{1}})\nSELECT n AS loans_per_customer, COUNT(*) AS customers\nFROM per_customer\n{{2}}\nORDER BY n;", "blanks": [["per_customer"], ["GROUP BY customer_id"], ["GROUP BY n"]], "distractors": ["WHERE n > 1", "per_loan", "GROUP BY loan_id", "HAVING COUNT(*) > 1"]}
```

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

```task
{"id": "w03d3-l6", "kind": "number", "answer": 6, "dp": 0, "unit": "rows", "hint": "WITH RECURSIVE m(d) AS (SELECT '2026-01-01' UNION ALL SELECT date(d, '+1 month') FROM m WHERE d < '2026-06-01') SELECT COUNT(*) FROM m; — the last row added is the first one that is not before June.", "model": "6: January to June. The step runs while the last month is before June, so June itself is still added, and then the recursion stops."}
```

> 🎬 **Didn't get recursive CTE?** [Baraa explains it · 14 min](https://youtu.be/SSKVgrwhzus?t=54326&end=55147)

### The vintage table — built step by step

**What it is.** A **vintage** (*винтаж*, *поколение*) or **cohort** (*когорта*) is the set of loans disbursed in one month. A **vintage table** follows each cohort by its age in **months on book** (MOB, *месяц жизни*) — here, the instalment number — and shows the share of loans that have **ever** been 30+ days late by that age. Reading every cohort at the same age makes old and new cohorts comparable.

The trick is "ever": once a loan is late, it stays "ever late". A running `MAX` of a 0/1 flag (Day 1's running window) does exactly that:

```pic
{"id": "w03d3-pic3", "title": "A running MAX: once late, always \"ever late\"", "caption": "`late30` is this instalment only; `ever30 = MAX(late30) OVER (PARTITION BY loan ORDER BY MOB)`. Loan 1 is late at MOB 2, and the circled 1 at MOB 3 stays on although that instalment was paid on time.", "tables": [{"name": "flag", "cols": ["loan", "MOB", "late30", "ever30"], "rows": [[1, 1, 0, 0], [1, 2, 1, 1], [1, 3, 0, 1], [2, 1, 0, 0], [2, 2, 0, 0], [2, 3, 0, 0]], "tone": ["a", "a", "a", "b", "b", "b"], "new": ["ever30"], "cells": [[1, "late30"], [2, "ever30"]]}]}
```

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

```task
{"id": "w03d3-l7", "kind": "choice", "options": ["Because later instalments are larger", "Because ever30 is a running MAX: once a loan is late it stays counted, and the same loans are observed at every MOB", "Because 2025 was a bad year", "It does not have to — a curve can fall"], "answer": 1, "explain": "With the same loans in every column, a running MAX can only stay or rise. A curve that falls means the denominator changed (different loans at different MOBs) or the query is wrong."}
```

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

```game
{"type": "match", "id": "w03d3-g1", "title": "Which form, when?", "pairs": [["Scalar subquery", "one number to compare with or divide by"], ["IN / EXISTS", "is the value in that set?"], ["NOT EXISTS", "has none — safe with NULLs"], ["Correlated subquery", "compare a row with its own group, under a different filter"], ["Derived table / CTE", "aggregate twice: per customer, then per count"], ["Recursive CTE", "rows that exist in no table: a month calendar"]]}
```

### Depth (optional)

- ▶ Baraa, *Subqueries* [12:58:04](https://youtu.be/SSKVgrwhzus?t=46684&end=51488), *CTE* [14:18:08](https://youtu.be/SSKVgrwhzus?t=51488&end=56102) — ~2 h 30; his recursive examples use SQL Server syntax (no `RECURSIVE` keyword, `MAXRECURSION` option).
- RU deck (TBC Data Analytics 2.0, if you have it) `2.4 SQL Advanced.pdf` — subqueries and the recursive CTE pages. *Russian terms:* подзапрос = subquery, обобщённое табличное выражение (ОТВ) = CTE, рекурсия = recursion, когорта/винтаж = cohort/vintage.

```videoquiz
{"video": "SSKVgrwhzus", "stops": [
  {"at": 47900, "q": "A subquery in WHERE returns one value. What kind is it?", "options": ["A scalar subquery", "A derived table", "A recursive CTE", "A join"], "answer": 0, "explain": "One row, one column: the engine uses it like a constant — 'principal > (SELECT AVG(principal) FROM loans)'."},
  {"at": 50200, "q": "What makes a subquery 'correlated'?", "options": ["It returns many rows", "It refers to a column of the outer query's current row", "It sits in FROM", "It uses EXISTS"], "answer": 1, "explain": "The inner query mentions the outer row, so conceptually it runs once per outer row."},
  {"at": 52900, "q": "Why write a CTE instead of nesting the same subquery?", "options": ["CTEs are always faster", "It has a name, reads top-down, and can be used more than once in the query", "Subqueries cannot use GROUP BY", "CTEs are saved in the database"], "answer": 1, "explain": "Readability and reuse within one statement; a CTE is not stored — that is a view."},
  {"at": 55000, "q": "A recursive CTE has two parts joined by UNION ALL. Which?", "options": ["SELECT and WHERE", "An anchor query and a recursive query that refers to the CTE itself", "Two tables", "A view and a table"], "answer": 1, "explain": "The anchor gives the first rows; the recursive part produces the next rows from the last ones until its condition stops it.", "back": 60}]}
```

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

```sqllab
{"id": "w03d3-lab", "title": "A vintage table of your own", "intro": "Nilufar's matrix, built as two tables in your practice copy: cohort sizes, then cohort × MOB cells from section 1's vintage chain. Then you add the rate and remove the cells that are not yet observable — the same rules as the Company corner.", "steps": [
  {"say": "Create my_cohorts(cohort, loans): loans with term_months >= 6 disbursed 2025-01-01 to 2026-03-31, grouped by strftime('%Y-%m', disbursed_at).", "hint": "CREATE TABLE my_cohorts AS SELECT strftime('%Y-%m', disbursed_at) AS cohort, COUNT(*) AS loans FROM loans WHERE term_months >= 6 AND disbursed_at >= '2025-01-01' AND disbursed_at < '2026-04-01' GROUP BY 1;", "expect": "SELECT COUNT(*) FROM my_cohorts", "want": 15},
  {"say": "Create my_vintage(cohort, mob, observed, ever30) with CREATE TABLE … AS WITH inst AS (…), flag AS (…), ever AS (…) SELECT … — section 1's vintage CTEs, joined to the same loans, grouped by cohort and installment_no.", "hint": "CREATE TABLE my_vintage AS WITH inst AS (SELECT i.loan_id, i.installment_no, i.total_due, COALESCE(SUM(CASE WHEN p.paid_at <= date(i.due_date, '+30 days') THEN p.amount END), 0) AS paid_by_30 FROM installments i LEFT JOIN payments p ON p.installment_id = i.installment_id WHERE i.installment_no <= 6 AND date(i.due_date, '+30 days') <= '2026-10-01' GROUP BY i.installment_id, i.loan_id, i.installment_no, i.total_due), flag AS (SELECT loan_id, installment_no, CASE WHEN paid_by_30 < total_due THEN 1 ELSE 0 END AS late30 FROM inst), ever AS (SELECT loan_id, installment_no, MAX(late30) OVER (PARTITION BY loan_id ORDER BY installment_no) AS ever30 FROM flag) SELECT strftime('%Y-%m', l.disbursed_at) AS cohort, e.installment_no AS mob, COUNT(*) AS observed, SUM(e.ever30) AS ever30 FROM loans l JOIN ever e ON e.loan_id = l.loan_id WHERE l.term_months >= 6 AND l.disbursed_at >= '2025-01-01' AND l.disbursed_at < '2026-04-01' GROUP BY 1, 2;", "expect": "SELECT ever30 FROM my_vintage WHERE cohort = '2025-10' AND mob = 3", "want": 15},
  {"say": "Add a column rate (ALTER TABLE … ADD COLUMN rate REAL) and fill it with UPDATE: 100.0 * ever30 / observed, rounded to 2 decimals.", "hint": "ALTER TABLE my_vintage ADD COLUMN rate REAL; UPDATE my_vintage SET rate = ROUND(100.0 * ever30 / observed, 2);", "expect": "SELECT CAST(ROUND(rate * 100) AS INTEGER) FROM my_vintage WHERE cohort = '2025-10' AND mob = 3", "want": 691},
  {"say": "Delete the cells that are not fully observable: where observed is smaller than the cohort's size in my_cohorts (a correlated subquery in the WHERE).", "hint": "DELETE FROM my_vintage WHERE observed < (SELECT c.loans FROM my_cohorts c WHERE c.cohort = my_vintage.cohort);", "expect": "SELECT COUNT(*) FROM my_vintage", "want": 88}],
 "cleanup": "DROP TABLE IF EXISTS my_vintage; DROP TABLE IF EXISTS my_cohorts"}
```

**P1.** *(scalar subquery)* Loans larger than the average SME loan (scalar subquery), by product. Why is the answer not "all SME loans above average" only?

<details><summary>Answer</summary>

```sql
SELECT p.code, COUNT(*) AS loans
FROM loans l JOIN products p ON p.product_id = l.product_id
-- 308 728 745, the average SME loan
WHERE l.principal > (SELECT AVG(principal) FROM loans WHERE product_id = 5)
GROUP BY p.code;
-- AUTO 88 · SME 400
```
SME 400, AUTO 88 — Auto's biggest loans exceed the average SME loan; no other product comes close. A scalar subquery with its own filter — the window cannot do this one.

</details>

**P1 — read it.** How many Auto loans are larger than the average SME loan?

```task
{"id": "w03d3-p1b", "kind": "number", "answer": 88, "dp": 0, "unit": "loans", "hint": "The AUTO row of your P1 result.", "model": "88 of Auto's 391 loans exceed 308 728 745, the average SME loan. The scalar subquery has its own filter (product_id = 5), different from the outer query's rows — that is when it beats a window.", "xp": 1}
```

**P2.** *(IN and EXISTS)* Customers who have a written-off loan: once with `IN`, once with `EXISTS`. Same count? Which reads better when you also want to exclude customers with an *active* loan?

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM customers WHERE customer_id IN (SELECT customer_id FROM loans WHERE status = 'written_off');
-- 188
SELECT COUNT(*) FROM customers c
WHERE EXISTS     (SELECT 1 FROM loans l WHERE l.customer_id = c.customer_id AND l.status = 'written_off')
  AND NOT EXISTS (SELECT 1 FROM loans l WHERE l.customer_id = c.customer_id AND l.status = 'active');
  -- 127
```
188 both ways. The second condition is a second `NOT EXISTS (SELECT 1 FROM loans l WHERE l.customer_id = c.customer_id AND l.status = 'active')` → 127 customers with a write-off and no live loan — two tests side by side read as a sentence; with `IN` it becomes `IN (…) AND customer_id NOT IN (…)`, which also works because `customer_id` is never NULL. Count both and keep the one you can explain. In the browser this correlated form takes about ten seconds — `loans` has no index on `customer_id` yet; tomorrow you create one, and the same query runs in a blink.

</details>

**P2 — the number.** How many customers have a written-off loan and no active loan?

```task
{"id": "w03d3-p2b", "kind": "number", "answer": 127, "dp": 0, "unit": "customers", "hint": "EXISTS for the write-off, NOT EXISTS for the active loan, both correlated on customer_id.", "model": "127 of the 188 customers with a write-off have no live loan; the other 61 are still borrowing from us. Two tests side by side read as the sentence.", "xp": 1}
```

**P3.** *(NOT IN vs NOT EXISTS)* The `NOT IN` trap, demonstrated: loans disbursed on a date on which no loan was closed, written three ways (NOT IN raw, NOT IN with `IS NOT NULL`, NOT EXISTS). Explain the 0.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM loans WHERE disbursed_at NOT IN (SELECT closed_at FROM loans);
-- 0
SELECT COUNT(*) FROM loans WHERE disbursed_at NOT IN (SELECT closed_at FROM loans WHERE closed_at IS NOT NULL);
-- 649
SELECT COUNT(*) FROM loans l WHERE NOT EXISTS (SELECT 1 FROM loans x WHERE x.closed_at = l.disbursed_at);
-- 649
```
0 · 649 · 649 (section 1). `closed_at` is NULL for 3 601 loans; one NULL in the list makes `NOT IN` unknown for every row. `NOT EXISTS` compares row by row with `=`, and a NULL simply never matches.

</details>

**P3 — explain the 0.** Why does the first form return 0?

```task
{"id": "w03d3-p3b", "kind": "choice", "options": ["No loan was ever disbursed on a closing day", "closed_at has NULLs; x NOT IN (…, NULL) is unknown for every x, so no row passes", "NOT IN cannot compare dates", "The subquery returns too many rows"], "answer": 1, "explain": "x <> NULL is unknown, and NOT IN is a chain of <>. Filter the NULLs out inside, or use NOT EXISTS.", "xp": 1}
```

**P4.** *(derived table)* With a derived table: the distribution of **instalments per loan** (term) — how many loans have 3, 6, 12 … instalments — and check it against `term_months`.

<details><summary>Answer</summary>

```sql
SELECT n_inst, COUNT(*) AS loans FROM (SELECT loan_id, COUNT(*) AS n_inst FROM installments GROUP BY loan_id) t GROUP BY n_inst ORDER BY n_inst;
-- 3 → 1867 · 6 → 2483 · 12 → 1346 · 18 → 621 · 24 → 973 · 36 → 401 · 48 → 137
SELECT COUNT(*) FROM loans l
JOIN (SELECT loan_id, COUNT(*) AS n_inst FROM installments GROUP BY loan_id) t ON t.loan_id = l.loan_id
WHERE t.n_inst <> l.term_months;
-- 0
```
Every schedule has exactly `term_months` rows (the derived table joined back to `loans` proves it: 0 mismatches). Counts: 3-month = Micro 1 335 + BNPL 532 = 1 867 — the sum reconciles with Tuesday's product × term table.

</details>

**P5.** *(correlated subquery)* Each SME borrower's **largest SME** loan — count the rows, then explain why `WHERE principal = (SELECT MAX …)` gives exactly one row per SME borrower here and when it could give more.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM loans l
WHERE l.product_id = 5
  AND l.principal = (SELECT MAX(x.principal) FROM loans x
                     WHERE x.customer_id = l.customer_id AND x.product_id = 5);
                     -- 724
```
724 = one per SME borrower (`COUNT(DISTINCT customer_id)` of SME loans is also 724). It would give more if a customer had two loans with the *same* maximal principal (both match `= MAX`); `ROW_NUMBER() … ORDER BY principal DESC, loan_id` with `rn = 1` is the version that guarantees one row. Know both; say which you used.

</details>

**P5 — when more?** When could `= (SELECT MAX …)` return more than one row per customer?

```task
{"id": "w03d3-p5b", "kind": "choice", "options": ["When a customer has loans in two products", "When a customer has two loans with exactly the same, maximal principal", "When the subquery is not correlated", "Never"], "answer": 1, "explain": "Both tied loans match '= MAX'. ROW_NUMBER with a tiebreaker (ORDER BY principal DESC, loan_id) and rn = 1 guarantees one row.", "xp": 1}
```

**P6.** *(CTE)* Rewrite P4's derived table as a CTE named `per_loan`, and add each count's share of all loans (%, one decimal). Which term is the most common?

<details><summary>Answer</summary>

```sql
WITH per_loan AS (SELECT loan_id, COUNT(*) AS n_inst FROM installments GROUP BY loan_id)
SELECT n_inst, COUNT(*) AS loans, ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS share_pct
FROM per_loan GROUP BY n_inst ORDER BY n_inst;
-- 3 → 1867 (23.9 %) · 6 → 2483 (31.7 %) · 12 → 1346 (17.2 %) · 18 → 621 (7.9 %)
-- · 24 → 973 (12.4 %) · 36 → 401 (5.1 %) · 48 → 137 (1.8 %)
```
Six months is the most common term: 2 483 loans, 31.7 %. The same result as P4; the CTE names the first step, and the main query reads like a sentence.

</details>

**P7.** *(a chain of CTEs)* A CTE chain in four steps: (1) outstanding per loan, (2) outstanding per customer, (3) the customer's rank, (4) the top 10 with name and segment. One `WITH`, four names.

<details><summary>Answer</summary>

```sql
WITH per_loan AS (SELECT loan_id, SUM(principal_due) AS outstanding FROM installments WHERE due_date > '2026-10-01' GROUP BY loan_id),
per_customer AS (SELECT l.customer_id, SUM(pl.outstanding) AS outstanding, COUNT(*) AS loans FROM per_loan pl JOIN loans l ON l.loan_id = pl.loan_id GROUP BY l.customer_id),
ranked AS (SELECT *, ROW_NUMBER() OVER (ORDER BY outstanding DESC) AS rn FROM per_customer)
SELECT r.rn, c.first_name || ' ' || c.last_name AS customer, c.segment, r.loans, r.outstanding
FROM ranked r JOIN customers c ON c.customer_id = r.customer_id WHERE r.rn <= 10 ORDER BY r.rn;
-- 1 Ulugbek Nazarov (sme) 2 loans 977 697 006 · 2 Davron Tashkentov (mass) 4 ·
-- 840 677 484 · 3 Umida Yusupova (mass) 3 · 752 948 733 …
```
Each step has one grain (instalment → loan → customer → ranked customer). Joining `customers` at the end, to 10 rows, is cheaper and safer than joining it to 92 193 instalments at the start.

</details>

**P8.** *(recursive CTE)* Recursive calendar 2026-01..2026-09 × products × branches, `LEFT JOIN` the monthly disbursement counts. How many empty cells, and for which products?

<details><summary>Answer</summary>

```sql
WITH RECURSIVE months(month_start) AS (
  SELECT '2026-01-01' UNION ALL SELECT date(month_start, '+1 month') FROM months WHERE month_start < '2026-09-01'),
grid AS (SELECT m.month_start, p.product_id, p.code, b.branch_id, b.branch_name
         FROM months m CROSS JOIN products p CROSS JOIN branches b),
d AS (SELECT strftime('%Y-%m-01', disbursed_at) AS month_start, product_id, branch_id, COUNT(*) AS loans
      FROM loans WHERE disbursed_at >= '2026-01-01' AND disbursed_at < '2026-10-01' GROUP BY 1, 2, 3)
SELECT g.code, COUNT(*) AS cells, SUM(CASE WHEN d.loans IS NULL THEN 1 ELSE 0 END) AS empty_cells
FROM grid g LEFT JOIN d ON d.month_start = g.month_start AND d.product_id = g.product_id AND d.branch_id = g.branch_id
GROUP BY g.code;
-- AUTO 90 / 13 · BNPL 90 / 0 · CONS 90 / 0 · MICRO 90 / 0 · SME 90 / 3
```
450 cells (9 × 5 × 10), **16 empty**: Auto 13 (five of them Termez Central), SME 3 (Fergana, Nukus, Termez) — the two big-ticket products skip months, mostly at the smallest branch. The same query without the calendar returns 434 rows and the chart silently interpolates. Use `dim_date` for the months if you prefer; the `CROSS JOIN products CROSS JOIN branches` is the part that makes the grid.

</details>

**P8 — count.** How many of the 450 branch × product × month cells of 2026 are empty?

```task
{"id": "w03d3-p7b", "kind": "number", "answer": 16, "dp": 0, "unit": "cells", "hint": "LEFT JOIN the counts onto the calendar grid; count the cells where the joined count is NULL.", "model": "16 empty cells: Auto 13, SME 3. A plain GROUP BY returns 434 rows and never shows them — a chart drawn from it joins the dots across months that had no loans.", "xp": 1}
```

**P9.** *(the vintage table)* Nilufar's matrix, long form: cohort × MOB → loans observed, ever-30+ count, rate — for cohorts 2025-01..2026-03, loans with `term_months >= 6`. Which cohort is worst at MOB 3?

<details><summary>Answer</summary>

```sql
WITH inst AS (
  SELECT i.loan_id, i.installment_no, i.due_date, i.total_due,
         COALESCE(SUM(CASE WHEN p.paid_at <= date(i.due_date, '+30 days') THEN p.amount END), 0) AS paid_by_30
  FROM installments i LEFT JOIN payments p ON p.installment_id = i.installment_id
  WHERE i.installment_no <= 6 AND date(i.due_date, '+30 days') <= '2026-10-01'
  GROUP BY i.installment_id, i.loan_id, i.installment_no, i.due_date, i.total_due),
flag AS (SELECT loan_id, installment_no, CASE WHEN paid_by_30 < total_due THEN 1 ELSE 0 END AS late30 FROM inst),
ever AS (SELECT loan_id, installment_no, late30, MAX(late30) OVER (PARTITION BY loan_id ORDER BY installment_no) AS ever30 FROM flag),
base AS (SELECT loan_id, strftime('%Y-%m', disbursed_at) AS cohort FROM loans
         WHERE term_months >= 6 AND disbursed_at >= '2025-01-01' AND disbursed_at < '2026-04-01')
SELECT b.cohort, e.installment_no AS mob, COUNT(*) AS observed, SUM(e.ever30) AS ever30,
       ROUND(100.0 * SUM(e.ever30) / COUNT(*), 2) AS rate_pct
FROM base b JOIN ever e ON e.loan_id = b.loan_id
GROUP BY b.cohort, e.installment_no ORDER BY b.cohort, mob;
-- 90 rows; at MOB 3: 2025-10 217 / 15 / 6.91 · 2025-09 5.70 · 2025-03 5.59 ·
-- 2025-05 5.41
```
Section 1's vintage chain with `cohort` added to `base` and to the `GROUP BY`. Worst at MOB 3: **2025-10 — 15 of 217 = 6.91 %**; then 2025-09 5.70 %, 2025-03 5.59 %, 2025-05 5.41 %. The Company corner pivots this into the wide matrix.

</details>

**P9 — name it.** Which cohort is worst at MOB 3? Write it as `YYYY-MM`.

```task
{"id": "w03d3-p8b", "kind": "text", "answer": ["2025-10", "2025-10 cohort", "october 2025", "oct 2025", "10.2025", "2025.10"], "model": "2025-10: 15 of 217 loans ever 30+ by MOB 3 = 6.91 %. Next: 2025-09 (5.70 %), 2025-03 (5.59 %).", "xp": 1}
```

**P10.** *(the vintage table — observable cells)* Pivot P9 to wide (MOB 1..6 as columns, `SUM(CASE WHEN installment_no = k THEN ever30 END) / SUM(installment_no = k)`), and make a cell **NULL when not every loan of the cohort is observable** at that MOB. Which cells go blank?

<details><summary>Answer</summary>

Add `COUNT(*)` per cohort×MOB and the cohort size (`(SELECT COUNT(*) FROM base x WHERE x.cohort = b.cohort)` — a correlated scalar subquery), and `CASE WHEN observed = size THEN rate END`. The Company corner prints the full query. Blank: **2026-03 at MOB 5 (250 of 251 observed) and MOB 6 (5 of 251)** — the March loans' sixth instalment falls due after 1 September for 246 of the 251, so its 30 days are not up by 1 October. A 0.0 % in that cell would be a lie: not "nobody late", but "nobody measured".

</details>

**P10 — which cells?** Which cells of the wide matrix go blank?

```task
{"id": "w03d3-p9b", "kind": "choice", "options": ["Every cell of 2026", "2026-03 at MOB 5 and MOB 6", "2025-01 at MOB 1 and MOB 2", "None — every cell is observable"], "answer": 1, "explain": "2026-03 at MOB 5 has 250 of 251 loans observed and at MOB 6 only 5 of 251: their 30 days are not up by 1 October. Blank, not 0.00.", "xp": 1}
```

**P11.** *(the vintage table — by grade)* Vintage curve pooled by **grade** instead of by month (2025-01..2026-03, term ≥ 6): rate at MOB 1, 3, 6. Does the scorecard order the curves?

<details><summary>Answer</summary>

```sql
WITH inst AS (
  SELECT i.loan_id, i.installment_no, i.due_date, i.total_due,
         COALESCE(SUM(CASE WHEN p.paid_at <= date(i.due_date, '+30 days') THEN p.amount END), 0) AS paid_by_30
  FROM installments i LEFT JOIN payments p ON p.installment_id = i.installment_id
  WHERE i.installment_no <= 6 AND date(i.due_date, '+30 days') <= '2026-10-01'
  GROUP BY i.installment_id, i.loan_id, i.installment_no, i.due_date, i.total_due),
flag AS (SELECT loan_id, installment_no, CASE WHEN paid_by_30 < total_due THEN 1 ELSE 0 END AS late30 FROM inst),
ever AS (SELECT loan_id, installment_no, late30, MAX(late30) OVER (PARTITION BY loan_id ORDER BY installment_no) AS ever30 FROM flag),
base AS (SELECT loan_id, risk_grade FROM loans
         WHERE term_months >= 6 AND disbursed_at >= '2025-01-01' AND disbursed_at < '2026-04-01')
SELECT b.risk_grade,
       ROUND(100.0 * SUM(CASE WHEN e.installment_no = 1 THEN e.ever30 END) / SUM(CASE WHEN e.installment_no = 1 THEN 1 END), 2) AS mob1,
       ROUND(100.0 * SUM(CASE WHEN e.installment_no = 3 THEN e.ever30 END) / SUM(CASE WHEN e.installment_no = 3 THEN 1 END), 2) AS mob3,
       ROUND(100.0 * SUM(CASE WHEN e.installment_no = 6 THEN e.ever30 END) / SUM(CASE WHEN e.installment_no = 6 THEN 1 END), 2) AS mob6
FROM base b JOIN ever e ON e.loan_id = b.loan_id GROUP BY b.risk_grade ORDER BY b.risk_grade;
```
A 0.43 / 1.86 / 3.13 % · B 0.93 / 2.49 / 5.18 · C 1.99 / 7.18 / 11.52 · D 2.16 / 11.51 / **19.08**. Strictly ordered at every MOB, and the gap widens with age: one in five D loans has been 30+ late within six months. Same chain, `GROUP BY risk_grade` instead of cohort.

</details>

**P11 — read it.** What does the grade table say about the scorecard?

```task
{"id": "w03d3-p10b", "kind": "choice", "options": ["Nothing — grades cross each other", "The curves are ordered A < B < C < D at every MOB, and the gap widens with age", "Only grade D is different", "Grade A is the riskiest early on"], "answer": 1, "explain": "A 3.13 % vs D 19.08 % at MOB 6, ordered at MOB 1 and 3 as well: the scorecard ranks risk, and the difference grows as loans age.", "xp": 1}
```

> 🚀 **Stretch (optional, +5 XP).** Longer curves need a stricter base — here you see what happens when cohorts of different ages are pooled.

**P12.** *(putting it together)* Build the calendar with `dim_date` instead of recursion, and extend the vintage chain to MOB 1..12 for the 2025 cohorts. At which MOB does the pooled 2025 curve pass 10 %?

<details><summary>Answer</summary>

```sql
WITH inst AS (
  SELECT i.loan_id, i.installment_no, i.total_due,
         COALESCE(SUM(CASE WHEN p.paid_at <= date(i.due_date, '+30 days') THEN p.amount END), 0) AS paid_by_30
  FROM installments i LEFT JOIN payments p ON p.installment_id = i.installment_id
  WHERE i.installment_no <= 12 AND date(i.due_date, '+30 days') <= '2026-10-01'
  GROUP BY i.installment_id, i.loan_id, i.installment_no, i.total_due),
flag AS (SELECT loan_id, installment_no, CASE WHEN paid_by_30 < total_due THEN 1 ELSE 0 END AS late30 FROM inst),
ever AS (SELECT loan_id, installment_no, MAX(late30) OVER (PARTITION BY loan_id ORDER BY installment_no) AS ever30 FROM flag)
SELECT e.installment_no AS mob, COUNT(*) AS observed, ROUND(100.0 * SUM(e.ever30) / COUNT(*), 2) AS rate_pct
FROM loans l JOIN ever e ON e.loan_id = l.loan_id
WHERE l.term_months >= 12 AND l.disbursed_at >= '2025-01-01' AND l.disbursed_at < '2025-09-01'
GROUP BY e.installment_no ORDER BY mob;
-- 853 loans at every MOB (852 at MOB 12): 1.29 → 2.58 → 3.87 → 5.39 → 5.98 →
-- 6.80 → 7.62 → 8.44 → 8.56 → 9.03 → 9.50 → 10.21
```
`SELECT DISTINCT date(date_key, 'start of month') FROM dim_date WHERE date_key BETWEEN …` replaces the recursive CTE line for line. For MOB 1..12 keep `term_months >= 12` and only the cohorts old enough to be observed at MOB 12 — January to August 2025 (853 loans). The curve crosses 10 % at **MOB 12** (10.21 %). Pool all twelve 2025 cohorts instead and the line "crosses" at MOB 10 (10.56 %) and then *falls* to 10.36 at MOB 11 — impossible for a running `MAX`, so the pooled line is mixing different loans at different ages. The first six MOBs of the term ≥ 6 base run 1.45 → 2.85 → 4.35 → 5.50 → 6.39 → 7.46 %; concave — most trouble appears in the first three months, which is why FPD/SPD/TPD are watched separately.

</details>

**P12 — the number.** On the cohorts observable at MOB 12, at which MOB does the curve pass 10 %?

```task
{"id": "w03d3-p11", "kind": "number", "answer": 12, "dp": 0, "unit": "MOB", "hint": "Term >= 12, cohorts 2025-01..2025-08, MOB 1..12; read the first MOB with a rate above 10.", "model": "MOB 12 (10.21 %, 852 loans). If you pooled every 2025 cohort you got MOB 10 — and a curve that falls at MOB 11, which a running MAX cannot do: the denominator changed under you. Fix the base first, then read the curve.", "xp": 2}
```

---

## 4. Self-check

```check
{"id": "w03d3-sc", "questions": [
  {"type": "multi", "q": "x NOT IN (subquery) returned no rows although you know matches exist. Which fixes work?", "options": ["Add WHERE column IS NOT NULL inside the subquery", "Rewrite it as NOT EXISTS with a correlated =", "Replace NOT IN with IN", "Add DISTINCT to the subquery"], "answer": [0, 1], "explain": "The list contains a NULL, which makes NOT IN unknown for every row; drop the NULLs or use NOT EXISTS (→ section 1, IN with a subquery; P3)."},
  {"type": "single", "q": "When is a plain scalar subquery enough, and a CTE chain unnecessary?", "options": ["When you aggregate at three grains", "For one value to compare with or divide by, e.g. > (SELECT AVG(principal) FROM loans)", "When the same result is needed twice", "When a reader must follow several steps"], "answer": 1, "explain": "One-line scalar or a single EXISTS: subquery. Reuse, deeper nesting or several grains: a chain (→ section 1, CTE; A chain of CTEs)."},
  {"type": "single", "q": "What does a recursive month calendar add to a monthly chart that GROUP BY month cannot?", "options": ["Faster queries", "Months with no rows appear, as zeros, instead of vanishing", "It removes duplicate months", "It sorts the months"], "answer": 1, "explain": "GROUP BY only shows months that have rows; LEFT JOIN the counts onto a calendar (recursive CTE or dim_date) and the empty months appear (→ section 1, Recursive CTE; P8)."}]}
```

---

## 5. Company corner <span class="badge company">Vintage curves</span>

A **vintage** (*винтаж*) is the set of loans disbursed in one month; a **vintage curve** follows each vintage over its life, measured in **months on book** (MOB, *месяц жизни*) rather than calendar time. Because every cohort is read at the same age, a January and an October cohort become comparable even though one is nine months older. Our definitions, written on the slide:

- **Cohort** = month of `disbursed_at`; **MOB k** = instalment k (our schedules are monthly, so instalment number is age).
- **Ever 30+ by MOB k** = at least one of instalments 1..k was **not fully paid 30 days after its due date**, as of 2026-10-01.
- **Base:** loans with `term_months >= 6` (so every loan has all six instalments); a cell is shown only when **all** of the cohort's loans have had their 30 days at that MOB.

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

**The chart Nilufar draws:** MOB on the x-axis (1..6), ever-30+ % on the y-axis, one line per cohort, the worst one coloured. The pooled 2025 line — 1.45 → 2.85 → 4.35 → 5.50 → 6.39 → 7.46 % — is the benchmark every new cohort is read against at equal age. MOB 1 of this chart *is* FPD30 (1.28 % overall), which is how the two reports reconcile.

```game
{"type": "flash", "id": "w03d3-g4", "title": "Vintage words", "cards": [["Vintage (cohort)", "all loans disbursed in one month"], ["MOB — month on book", "the loan's age in months; here, the instalment number"], ["Ever 30+ by MOB k", "at least one of instalments 1..k not fully paid 30 days after its due date"], ["Vintage curve", "one cohort's ever-30+ rate at MOB 1, 2, 3 … — it can only go up"], ["Observable cell", "every loan of the cohort has had its 30 days at that MOB; otherwise blank"], ["Read down a column", "compare cohorts at the same age, never across calendar time"], ["MOB 1 = FPD30", "the first point of the curve is the first-payment default rate (1.28 %)"]]}
```

> 🎯 **Interview version.** *"How do you build a vintage analysis in SQL?"* The interviewer listens for the definitions (cohort, age, "ever"), the observability rule and how you check the result. Say it in the box below, then compare.

**Say it like in an interview.** Answer the question above in 3–5 sentences, as you would aloud, with one Nur Finance number.

```task
{"id": "w03d3-int", "kind": "free", "min": 30, "model": "Cohort is the disbursement month and age is the instalment number, so every cohort is read at the same month on book. Per instalment I check whether it was paid within 30 days of its due date — a LEFT JOIN to payments with the date condition — flag the late ones, and take a running MAX over the loan's instalments, so 'ever 30+' stays on once it is set. I keep only instalments whose 30 days have passed and show a cell only when the whole cohort is observable at that MOB, then pivot with SUM(CASE) into cohort × MOB and read down the columns. At Nur Finance October 2025 is the worst cohort — 6.91 % at MOB 3 against 1.99 % for January 2025 — and my check is that the MOB-1 column equals FPD30, 1.28 %.", "rubric": ["Cohort = disbursement month, age = instalment number (MOB)", "Paid within 30 days via LEFT JOIN with a date condition, then a flag", "Running MAX for 'ever'", "Observability: only matured instalments, blank cells for partly observed cohorts", "A check (curves never fall, MOB 1 = FPD30) or a real number"], "xp": 2}
```

Tomorrow: the three `WITH` blocks you now own become **views** — a clean layer Timur can point Power BI at — and we make them fast.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w03d3", "pass": 0.8, "questions": [
  {"type": "single", "q": "closed_at is NULL for every loan still open. What does this return, and why?", "code": "SELECT COUNT(*) FROM loans\nWHERE disbursed_at NOT IN (SELECT closed_at FROM loans);", "options": ["The loans disbursed on a day no loan was closed", "0 — one NULL in the list makes NOT IN unknown for every row", "An error", "Every loan"], "answer": 1, "explain": "x <> NULL is unknown; add WHERE closed_at IS NOT NULL inside, or use NOT EXISTS (→ section 1, IN with a subquery; P3)."},
  {"type": "multi", "q": "Which statements about NOT EXISTS (SELECT 1 FROM loans l WHERE l.customer_id = c.customer_id) are true?", "options": ["It stops at the first matching row", "It cannot multiply rows, even for a customer with seven loans", "A NULL in the inner table simply never matches, so there is no NULL trap", "It needs an IS NULL test on a right-hand column", "It can show the matching loan's columns in the output"], "answer": [0, 1, 2], "explain": "IS NULL on a carefully picked column and right-side columns in the output belong to the LEFT JOIN anti-join (→ section 1, EXISTS and NOT EXISTS)."},
  {"type": "single", "q": "What does this query return?", "code": "SELECT loans_per_customer, COUNT(*) AS customers\nFROM (SELECT customer_id, COUNT(*) AS loans_per_customer\n      FROM loans GROUP BY customer_id) AS t\nGROUP BY loans_per_customer;", "options": ["One row per customer with their loan count", "How many customers have 1 loan, 2 loans, 3 loans …", "The total number of loans", "An error — GROUP BY cannot be used twice"], "answer": 1, "explain": "A derived table lets you aggregate twice: first per customer, then per count (→ section 1, Derived table; P4)."},
  {"type": "single", "q": "What makes a subquery correlated?", "options": ["It returns more than one row", "It refers to a column of the outer query's current row, so conceptually it runs once per outer row", "It sits in the FROM clause", "It uses GROUP BY"], "answer": 1, "explain": "E.g. WHERE l.principal > (SELECT AVG(x.principal) FROM loans x WHERE x.product_id = l.product_id) (→ section 1, Correlated subquery; P5)."},
  {"type": "number", "q": "How many rows does this calendar have?", "code": "WITH RECURSIVE months(month_start) AS (\n  SELECT '2026-01-01'\n  UNION ALL\n  SELECT date(month_start, '+1 month') FROM months\n  WHERE month_start < '2026-06-01')\nSELECT COUNT(*) FROM months;", "answer": 6, "explain": "The anchor gives January; each step adds a month while the last one is before June, so June is the last row: January to June (→ section 1, Recursive CTE; P8)."},
  {"type": "single", "q": "When does a CTE chain beat nested subqueries?", "options": ["Never — they are always slower", "When the same result is needed twice, when nesting goes deeper than two levels, or when someone must read the steps top-down", "Only in SQL Server", "When you need a single scalar value"], "answer": 1, "explain": "A chain fixes one grain per step and reads like a recipe; a one-line scalar or a single EXISTS is fine as a subquery (→ section 1, CTE; A chain of CTEs)."},
  {"type": "single", "q": "A loan's late30 flags for instalments 1–6 are 0, 1, 0, 0, 0, 0. What does MAX(late30) OVER (PARTITION BY loan_id ORDER BY installment_no) give?", "options": ["0, 1, 0, 0, 0, 0", "0, 1, 1, 1, 1, 1", "1, 1, 1, 1, 1, 1", "0, 0, 0, 0, 0, 1"], "answer": 1, "explain": "The running MAX turns a per-instalment event into 'ever late so far', which stays on once set (→ section 1, The vintage table)."},
  {"type": "single", "q": "At MOB 3 the 2026-03 cohort shows 3.98 % ever-30+, and the 2025-03 cohort shows 9.94 % at MOB 6. Is the new book cleaner?", "options": ["Yes — 3.98 is far below 9.94", "Not from these two cells: compare cohorts at the same MOB (read down a column)", "Yes, because 2026 has more loans", "No — newer cohorts are always worse"], "answer": 1, "explain": "The newer cohort is younger, not necessarily better; at MOB 3, 2025-03 was 5.59 % (→ section 5, Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w03d3", "sql": true, "q": "Nilufar wants one pooled vintage number for the app channel. Take loans disbursed in 2025 (all twelve monthly cohorts pooled) with term_months >= 6 whose application came through the app channel, and compute the share that were ever 30+ days late by MOB 6 (the Company corner's definition). Percentage to 2 decimals.", "type": "number", "dp": 2, "h": ["bfb301d2841e84361652db14"], "hint": "The channel is not on loans — a subquery can bring it in without changing the grain.", "sol": "V0lUSCBpbnN0IEFTICgg4oCmd29ya2VkIGV4YW1wbGXigKYgKSwgZmxhZyBBUyAoIOKApiApLCBldmVyIEFTICgg4oCmICksCmJhc2UgQVMgKFNFTEVDVCBsb2FuX2lkIEZST00gbG9hbnMKICAgICAgICAgV0hFUkUgdGVybV9tb250aHMgPj0gNgogICAgICAgICAgIEFORCBkaXNidXJzZWRfYXQgPj0gJzIwMjUtMDEtMDEnIEFORCBkaXNidXJzZWRfYXQgPCAnMjAyNi0wMS0wMScKICAgICAgICAgICBBTkQgYXBwbGljYXRpb25faWQgSU4gKFNFTEVDVCBhcHBsaWNhdGlvbl9pZCBGUk9NIGFwcGxpY2F0aW9ucyBXSEVSRSBjaGFubmVsID0gJ2FwcCcpKQpTRUxFQ1QgQ09VTlQoKikgQVMgbG9hbnMsIFNVTShlLmV2ZXIzMCkgQVMgZXZlcjMwLAogICAgICAgUk9VTkQoMTAwLjAgKiBTVU0oZS5ldmVyMzApIC8gQ09VTlQoKiksIDIpIEFTIHBjdApGUk9NIGJhc2UgYgpKT0lOIGV2ZXIgZSBPTiBlLmxvYW5faWQgPSBiLmxvYW5faWQgQU5EIGUuaW5zdGFsbG1lbnRfbm8gPSA2OwotLSA1MzkgbG9hbnMsIGFsbCBvYnNlcnZlZCBhdCBNT0IgNjsgNTAgZXZlciAzMCsg4oaSIDkuMjggJQotLSBTUUwgU2VydmVyOiBEQVRFQUREKGRheSwgMzAsIGkuZHVlX2RhdGUpIGluIGluc3QsIHRoZSByZXN0IGlkZW50aWNhbApUaGUgcG9vbGVkIDIwMjUgbGluZSBmb3IgYWxsIGNoYW5uZWxzIGVuZHMgYXQgNy40NiAlIGF0IE1PQiA2OyBicmFuY2ggNy4zOCAlLCBwYXJ0bmVyIDUuNDEgJSwgYXBwIDkuMjggJS4gRXZlcnkgbG9hbiBpbiB0aGlzIGJhc2UgaXMgYSA2LW1vbnRoIE1pY3JvIGxvYW4sIHNvICJhcHAiIGFuZCAiTWljcm8iIGFyZSB0aGUgc2FtZSBjdXQgaGVyZS4gVGhlIGFwcCdzIGZpcnN0LXBheW1lbnQgZ2FwIGZyb20gd2VlayAyIGRvZXMgbm90IGNsb3NlIHdpdGggYWdlOiBieSBtb250aCA2IHJvdWdobHkgb25lIGFwcCBsb2FuIGluIGVsZXZlbiBoYXMgYmVlbiBhIG1vbnRoIGxhdGUu"}
```

<!-- challenge:end -->
