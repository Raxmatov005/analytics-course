# Week 3 · Day 1 — Window functions: a total next to every row

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 60 min</span> <span class="badge">Homework</span> <span class="badge company">Company corner</span>

> STORY **Monday, 9:10.** Bekzod, portfolio manager (*портфельный менеджер*), has printed Friday's T2 and T5 and drawn percentages in the margin by hand. *"Two things I could not get from you last week. One: each branch's outstanding **and its share of the company**, in the same row — I keep dividing on a calculator. Two: each product's monthly disbursement with a **running year-to-date** next to it, so I can see where we are against the 2026 plan without summing a column in Excel."* Madina, from the next desk: *"That is the whole of today. By Wednesday he wants the pack."*

## Today in 3 lines

- A **window function** computes an aggregate *next to* each row instead of collapsing rows: `SUM(x) OVER ()` is the grand total on every line, `SUM(x) OVER (PARTITION BY product)` the product total.
- `ORDER BY` inside `OVER` turns the aggregate into a **running total**; `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` makes a **moving average**.
- You know when to use **GROUP BY**, when a **window**, and when **both** — and you have Bekzod's share-of-company and running-YTD columns.

---

## 1. Learn — the same aggregate, without losing the rows

### The problem GROUP BY cannot solve alone

Friday's T2 gave five rows: outstanding by product. Bekzod wants a sixth column, *share of total*. `GROUP BY` has already collapsed the rows, so the total is not in the result — you would need a second query, or last week's one-value subquery `(SELECT SUM(...) FROM ...)` repeated with the same joins and filters. A **window function** (*оконная функция*) solves it in place: it looks at a "window" of rows around the current one, computes an aggregate over them, and writes the answer **on the current row**. No rows disappear.

```sql
SELECT loan_id, principal,
       SUM(principal) OVER ()                 AS company_total,     -- the same number on all 7 828 rows
       AVG(principal) OVER ()                 AS company_avg,
       COUNT(*) OVER ()                       AS loans
FROM loans LIMIT 3;
-- 1 · 31 150 000 · 404 783 280 000 · 51 709 668 · 7828   (and the same three values on rows 2 and 3 — the window ran over all 7 828 rows before LIMIT cut the display)
```

Read `OVER ()` as *"over all rows of the result"*. Empty brackets = one window containing everything. The two engines agree on every window keyword today — SQL Server and SQLite differ only in the functions you put in front (`julianday` vs `DATEDIFF`, as before).

> 💡 **Key idea.** `GROUP BY` collapses rows into one per group. A window keeps every row and writes the aggregate *next to* it. Same `SUM`, `AVG`, `COUNT` — the word `OVER` is what changes their behaviour.

### PARTITION BY — one window per group

`PARTITION BY` splits the rows into groups, exactly like `GROUP BY` — but each row stays, and gets its group's aggregate:

```sql
SELECT l.loan_id, p.code, l.principal,
       ROUND(AVG(l.principal) OVER (PARTITION BY p.code))        AS product_avg,
       ROUND(100.0 * l.principal / AVG(l.principal) OVER (PARTITION BY p.code)) AS pct_of_avg,
       MAX(l.principal) OVER (PARTITION BY p.code)               AS product_max,
       COUNT(*) OVER (PARTITION BY p.code)                       AS loans_in_product
FROM loans l JOIN products p ON p.product_id = l.product_id
WHERE l.loan_id <= 5;
```

Careful reading: `WHERE loan_id <= 5` runs **before** the window, so `product_avg` here is the average of the 2 Consumer loans among loans 1–5 (35 605 000), not of all 2 418. **Windows are computed after `WHERE`, `GROUP BY` and `HAVING`, and before `ORDER BY`/`LIMIT`.** That order is the single most useful fact of the day: it is why you can filter first and why you cannot put a window in `WHERE` — you compute the window inside a query in brackets (a *derived table*) and filter outside it. You will write that shape in P6; Day 3 explains it in full.

> ⚠️ **Watch out.** `PARTITION BY` is not `GROUP BY`. `GROUP BY p.code` returns 5 rows; `OVER (PARTITION BY p.code)` returns every loan, each with its product's number beside it. If you expected five rows and got 7 828, you wrote a partition where you meant a group.

```game
{"type": "bug", "id": "w03d1-g1", "title": "Find the broken line", "q": "Bekzod wants the loans above their product's average principal. One line breaks this query.", "code": "SELECT l.loan_id, p.code, l.principal\nFROM loans l\nJOIN products p ON p.product_id = l.product_id\nWHERE l.principal > AVG(l.principal) OVER (PARTITION BY p.code);", "answer": [3], "why": "Windows are computed after WHERE, so a window cannot sit in WHERE. Compute it in a derived table, then filter outside (P6)."}
```

### Share of total — the column Bekzod asked for

```sql
SELECT p.code, SUM(i.principal_due) AS outstanding,
       ROUND(100.0 * SUM(i.principal_due) / SUM(SUM(i.principal_due)) OVER (), 1) AS share_pct
FROM installments i JOIN loans l ON l.loan_id = i.loan_id JOIN products p ON p.product_id = l.product_id
WHERE i.due_date > '2026-10-01'
GROUP BY p.code ORDER BY outstanding DESC;
-- SME 125 892 942 411 · 60.3 % · AUTO 57 684 271 333 · 27.6 · CONS 23 054 933 316 · 11.0 · BNPL 1 135 251 000 · 0.5 · MICRO 956 106 370 · 0.5
```

`SUM(SUM(x)) OVER ()` looks odd and is the key pattern of the week: the inner `SUM` is the GROUP BY aggregate (one value per product); the outer `SUM(...) OVER ()` adds those five values up and writes the total on each of the five rows. **GROUP BY and a window in the same query** — the window runs on the *grouped* result. `100.0 *` at the front, as always.

> 💡 **Key idea.** Share of total = `100.0 * SUM(x) / SUM(SUM(x)) OVER ()`. Inner `SUM`: one value per group. Outer `SUM … OVER ()`: those group values added up and written on every group's row. Learn this one line by heart — you will use it all week.

### ORDER BY inside OVER — running totals

Add `ORDER BY` inside the brackets and the window becomes *"all rows from the start of the partition up to the current one"*. The aggregate turns into a **running total** (*накопительный итог*):

```sql
WITH m AS (
  SELECT strftime('%Y-%m', disbursed_at) AS month, COUNT(*) AS loans, SUM(principal) AS disbursed    -- FORMAT(disbursed_at, 'yyyy-MM')
  FROM loans GROUP BY strftime('%Y-%m', disbursed_at))
SELECT month, loans, disbursed,
       SUM(disbursed) OVER (PARTITION BY substr(month, 1, 4) ORDER BY month) AS ytd     -- SQL Server: LEFT(month, 4)
FROM m ORDER BY month;
-- 2026-01 287 / 17 452 370 000 / ytd 17 452 370 000 · 2026-02 265 / 11 893 850 000 / 29 346 220 000 · … · 2026-09 361 / 17 015 490 000 / 161 480 300 000 · 2026-10 21 / 852 760 000 / 162 333 060 000
```

`PARTITION BY` the year, `ORDER BY` the month: the running sum restarts each January (2025 ends at 155 927 230 000; 2026 restarts at 17.45 bn). The `WITH m AS (...)` is Day 3's CTE; use it as you did last week — a named result you then query.

### The default frame and ROWS BETWEEN

With `ORDER BY` inside `OVER`, the window has a **frame** (*рамка окна*): which rows around the current one are in. The default is `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` — and `RANGE` means *"up to and including every row with the same ORDER BY value"*. Run a daily running total on raw loans and the trap shows:

```sql
SELECT disbursed_at, principal,
       SUM(principal) OVER (ORDER BY disbursed_at)                              AS range_run,   -- default frame
       SUM(principal) OVER (ORDER BY disbursed_at ROWS UNBOUNDED PRECEDING)     AS rows_run
FROM loans WHERE disbursed_at >= '2026-09-28' ORDER BY disbursed_at, loan_id;
-- 2026-09-28: all seven loans show range_run = 543 980 000 (the whole day); rows_run climbs 135 550 000 → 140 420 000 → … → 543 980 000
```

Both are "right" — `RANGE` says *total through this date*, `ROWS` says *total through this row*. Rule: when `ORDER BY` has ties, decide which one you mean; when you order by a unique key (one row per month) they agree. The explicit frame syntax is `ROWS BETWEEN <start> AND <end>` with `UNBOUNDED PRECEDING`, `n PRECEDING`, `CURRENT ROW`, `n FOLLOWING`, `UNBOUNDED FOLLOWING`.

> ⚠️ **Watch out.** The moment you write `ORDER BY` inside `OVER`, a frame appears even if you did not ask for one — and its default is `RANGE … CURRENT ROW`, which lumps ties together. On a column with repeated values (dates, grades, rounded amounts) say `ROWS` explicitly.

The clauses inside `OVER` always come in the same order: partition, then order, then frame. Put them together once by hand:

```game
{"type": "build", "id": "w03d1-g2", "title": "Build the window", "q": "Bekzod's year-to-date per product: a running sum of monthly disbursement that restarts for every product, row by row.", "tokens": ["SUM(disbursed)", "OVER (", "PARTITION BY code", "ORDER BY month", "ROWS UNBOUNDED PRECEDING", ")"], "distractors": ["GROUP BY code", "WHERE month >= '2026-01'", "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW"]}
```

### Moving averages — a frame of fixed length

A **moving average** (*скользящее среднее*) smooths a monthly series: each month is replaced by the average of itself and the two before it.

```sql
-- after the same WITH m AS (...)
SELECT month, disbursed,
       ROUND(AVG(disbursed) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)) AS ma3,
       COUNT(*)            OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)  AS months_in_window
FROM m ORDER BY month;
-- 2024-01 ma3 = 3 872 450 000 (1 month) · 2024-02 4 236 505 000 (2) · 2024-03 4 966 556 667 (3) … 2026-08 19 678 126 667 · 2026-09 19 999 856 667 · 2026-10 13 386 153 333
```

Two honest readings: the first two months average fewer than three values (show `months_in_window` or start the chart at month 3), and October 2026 is **one day** of data (852 760 000) — it drags the 3-month average down by a third. Filter `WHERE month < '2026-10'` before smoothing. A **centred** average is `ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING`; a 12-month one is `11 PRECEDING`.

### Window vs GROUP BY — which, and when both

| You want | Use | Rows out |
|---|---|---|
| one number per group | `GROUP BY` | one per group |
| every row, with its group's number beside it | window with `PARTITION BY` | all rows |
| one number per group, **plus** the share/running total across groups | `GROUP BY` **and** a window on top (`SUM(SUM(x)) OVER ()`) | one per group |
| a filter on the window's result ("loans above their product's average") | window in a CTE/derived table, filter outside | subset |

Windows never reduce rows; `GROUP BY` always does; the pattern `SUM(SUM())` is the handshake between them.

```game
{"type": "sort", "id": "w03d1-g3", "title": "GROUP BY, window, or both?", "q": "Tap each of Bekzod's asks, then the tool that answers it.", "groups": {"GROUP BY alone": ["Outstanding per product, five rows", "Number of loans per branch"], "Window (PARTITION BY), every row kept": ["Every loan with its product's average beside it", "Each payment of loan 1 with the loan's total collected"], "GROUP BY + a window on top": ["Outstanding per product with its share of the total", "Monthly disbursement with a running YTD"]}}
```

### Depth (optional)

- ▶ Baraa, *Window functions basics* [8:50:11](https://youtu.be/SSKVgrwhzus?t=31811&end=35220), *Window aggregate* [9:47:00](https://youtu.be/SSKVgrwhzus?t=35220&end=39189) — ~2 h; SQL Server, every keyword identical here.
- RU deck (TBC Data Analytics 2.0, if you have it) `2.3 SQL.pdf` — window pages. *Russian terms:* оконные функции = window functions, секция = partition, рамка окна = frame, накопительный итог = running total, скользящее среднее = moving average.

```videoquiz
{"video": "SSKVgrwhzus", "stops": [
  {"at": 32700, "q": "What does a window function do that GROUP BY does not?", "options": ["Keeps every row and writes the aggregate next to it", "Removes duplicate rows", "Sorts the table permanently", "Works only on numeric columns"], "answer": 0, "explain": "GROUP BY collapses rows to one per group; a window keeps the detail and adds the group's number beside each row."},
  {"at": 34200, "q": "PARTITION BY inside OVER is closest to which clause you already know?", "options": ["WHERE", "GROUP BY — except that the rows stay", "ORDER BY", "JOIN"], "answer": 1, "explain": "It splits the rows into groups like GROUP BY, but every row survives and gets its group's aggregate."},
  {"at": 36600, "q": "You add ORDER BY inside OVER to SUM(sales). What do you get?", "options": ["The same grand total on every row", "A running (cumulative) total", "An error", "A rank"], "answer": 1, "explain": "With ORDER BY the frame becomes 'from the start of the partition to the current row', so the sum accumulates."},
  {"at": 38400, "q": "A rolling average of the current row and the two before it needs which frame?", "options": ["ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "PARTITION BY 3", "ROWS BETWEEN CURRENT ROW AND 2 FOLLOWING"], "answer": 0, "explain": "Two rows back plus the current one = three rows; UNBOUNDED PRECEDING would be a running average.", "back": 60}]}
```

---

## 2. Worked example — Bekzod's branch table (15 min)

*"Each branch's outstanding and its share of the company."* Noun that is one row of what we sum: an **instalment** not yet due (as in T2). Join `loans → branches` many-to-one for the label. Group by branch. Then the share is a window over the grouped result:

```sql
SELECT b.branch_name, b.region,
       SUM(i.principal_due)                                                   AS outstanding,
       COUNT(DISTINCT i.loan_id)                                              AS loans,
       ROUND(100.0 * SUM(i.principal_due) / SUM(SUM(i.principal_due)) OVER (), 1)                      AS share_pct,
       ROUND(100.0 * SUM(i.principal_due) / SUM(SUM(i.principal_due)) OVER (PARTITION BY b.region), 1) AS share_in_region
FROM installments i JOIN loans l ON l.loan_id = i.loan_id JOIN branches b ON b.branch_id = l.branch_id
WHERE i.due_date > '2026-10-01'
GROUP BY b.branch_name, b.region ORDER BY outstanding DESC;
```

| branch | outstanding | share % | share in region % |
|---|---|---|---|
| Tashkent Central | 28 716 674 373 | 13.8 | 35.2 |
| Tashkent South | 26 787 392 136 | 12.8 | 32.8 |
| Tashkent North | 26 175 671 562 | 12.5 | 32.0 |
| Fergana Central | 24 797 334 197 | 11.9 | 100.0 |
| Samarkand Central | 24 655 889 676 | 11.8 | 100.0 |
| Andijan Central | 19 798 392 956 | 9.5 | 100.0 |
| Namangan Central | 18 696 787 066 | 9.0 | 100.0 |
| Bukhara Central | 15 116 046 338 | 7.2 | 100.0 |
| Nukus Central | 13 309 138 567 | 6.4 | 100.0 |
| Termez Central | 10 670 177 559 | 5.1 | 100.0 |

Check: the shares add to 100.0 and the outstanding to 208 723 504 430 — Friday's total. Two windows in one query, two partitions: `OVER ()` for the company, `OVER (PARTITION BY region)` for the region. The second column is only interesting in Tashkent, where three branches split the region almost evenly; it also shows that a share column is meaningless without saying *share of what*.

---

## 3. Practice (60 min)

Start with the lab: four steps on your own copy of the database, so the running total becomes a table you made. Then the questions: write each query in the box under its question — it is saved in this browser. **✔ Check** tells you whether your result matches the answer.

```sqllab
{"id": "w03d1-lab", "title": "Your own monthly table with a running total", "intro": "You build Bekzod's 2026 table yourself: monthly disbursement stored with CREATE TABLE … AS, then a running total computed by a window and stored next to it. Everything happens in your practice copy; the real tables are not touched.", "steps": [
  {"say": "Create my_monthly(month, loans, disbursed) with CREATE TABLE … AS SELECT: one row per month of 2026, January to September (half-open filter on disbursed_at).", "hint": "CREATE TABLE my_monthly AS SELECT strftime('%Y-%m', disbursed_at) AS month, COUNT(*) AS loans, SUM(principal) AS disbursed FROM loans WHERE disbursed_at >= '2026-01-01' AND disbursed_at < '2026-10-01' GROUP BY strftime('%Y-%m', disbursed_at);", "expect": "SELECT COUNT(*) FROM my_monthly", "want": 9},
  {"say": "October has one day of data. Add it anyway with INSERT INTO my_monthly SELECT … for disbursed_at >= '2026-10-01' — you will see what a partial month does to a running total.", "hint": "INSERT INTO my_monthly SELECT strftime('%Y-%m', disbursed_at), COUNT(*), SUM(principal) FROM loans WHERE disbursed_at >= '2026-10-01' GROUP BY 1;", "expect": "SELECT COUNT(*) FROM my_monthly", "want": 10},
  {"say": "Create my_ytd(month, loans, disbursed, ytd) from my_monthly, where ytd is SUM(disbursed) OVER (ORDER BY month). Look at it with SELECT * FROM my_ytd.", "hint": "CREATE TABLE my_ytd AS SELECT month, loans, disbursed, SUM(disbursed) OVER (ORDER BY month) AS ytd FROM my_monthly;", "expect": "SELECT ytd FROM my_ytd WHERE month = '2026-10'", "want": 162333060000},
  {"say": "Bekzod's pack stops at September. Delete the October row from my_ytd; the largest ytd left is then the September figure.", "hint": "DELETE FROM my_ytd WHERE month = '2026-10';", "expect": "SELECT MAX(ytd) FROM my_ytd", "want": 161480300000}],
 "cleanup": "DROP TABLE IF EXISTS my_ytd; DROP TABLE IF EXISTS my_monthly"}
```

> 💡 **Key idea.** A table you make with `CREATE TABLE … AS SELECT` is frozen: add a new loan to `loans` tomorrow and `my_ytd` will not change. That is useful for a pack sent on Wednesday, and dangerous if someone reads the table next month. Day 4 is about this choice.

**P1.** Every loan with the company total, the company average and how many loans there are — on each row. Then the same for loans of customer 3208 only; explain why the total changed.

<details><summary>Answer</summary>

```sql
SELECT loan_id, principal, SUM(principal) OVER () AS total, ROUND(AVG(principal) OVER ()) AS avg_principal, COUNT(*) OVER () AS n
FROM loans WHERE customer_id = 3208;
-- 4265 · 568 200 000 · total 1 023 170 000 · avg 511 585 000 · n 2  (loan 7606 the same)
```
Without the `WHERE`: total 404 783 280 000, average 51 709 668, n 7 828 on every row. `WHERE` runs first, so the window only sees the customer's two loans.

</details>

**P1 — why?** With `WHERE customer_id = 3208` the "company total" column drops from 404 783 280 000 to 1 023 170 000. Why?

```task
{"id": "w03d1-p1b", "kind": "choice", "options": ["OVER () ignores WHERE and adds the whole table, so the number must be a bug", "WHERE runs before the window, so the window only sees the customer's two loans", "SUM inside a window always returns one row's value", "LIMIT cut the result"], "answer": 1, "explain": "Order of work: FROM → WHERE → GROUP BY → HAVING → window → ORDER BY → LIMIT. The window adds up whatever survived the filter.", "xp": 1}
```

**P2.** Outstanding by **risk grade** with share of total, one decimal. Which grade carries the most money, and is that what the grade *counts* would suggest?

<details><summary>Answer</summary>

```sql
SELECT l.risk_grade, SUM(i.principal_due) AS outstanding, COUNT(DISTINCT i.loan_id) AS loans,
       ROUND(100.0 * SUM(i.principal_due) / SUM(SUM(i.principal_due)) OVER (), 1) AS share_pct
FROM installments i JOIN loans l ON l.loan_id = i.loan_id WHERE i.due_date > '2026-10-01'
GROUP BY l.risk_grade ORDER BY outstanding DESC;
-- B 93 317 343 066 / 1457 loans / 44.7 % · C 56 322 842 888 / 1040 / 27.0 · A 48 417 895 338 / 754 / 23.2 · D 10 665 423 138 / 158 / 5.1
```
B holds 45 % of the money on 43 % of the owing loans; D is 5 % of the book — small, as a cut-off should make it.

</details>

**P2 — read it.** What share of outstanding does grade D carry, in %, one decimal?

```task
{"id": "w03d1-p2b", "kind": "number", "answer": 5.1, "dp": 1, "unit": "%", "hint": "The share_pct column of your P2 result, on the D row.", "model": "D: 10 665 423 138 of 208 723 504 430 = 5.1 % of outstanding, on 158 of the 3 409 owing loans (4.6 %). The risky grade is small in money as well as in count.", "xp": 1}
```

**P3.** Outstanding by **product × grade** with the grade's share *inside its product*. In which product is grade C the largest share?

<details><summary>Answer</summary>

```sql
SELECT p.code, l.risk_grade, SUM(i.principal_due) AS outstanding,
       ROUND(100.0 * SUM(i.principal_due) / SUM(SUM(i.principal_due)) OVER (PARTITION BY p.code), 1) AS share_in_product
FROM installments i JOIN loans l ON l.loan_id = i.loan_id JOIN products p ON p.product_id = l.product_id
WHERE i.due_date > '2026-10-01' GROUP BY p.code, l.risk_grade ORDER BY p.code, l.risk_grade;
-- MICRO C 35.2 % (A 22.7 · B 40.0 · D 2.1); BNPL C 31.4; CONS 30.8; AUTO 28.9; SME 25.3
```
Twenty rows; each product's four shares add to 100. Micro carries the most grade-C weight — the app product, consistent with the FPD finding of week 2.

</details>

**P4.** 2026 monthly disbursement (all products, January–September) with: share of the nine-month total, running YTD, and each month as % of the best month.

<details><summary>Answer</summary>

```sql
WITH m AS (SELECT strftime('%Y-%m', disbursed_at) AS month, COUNT(*) AS loans, SUM(principal) AS disbursed
           FROM loans WHERE disbursed_at >= '2026-01-01' AND disbursed_at < '2026-10-01' GROUP BY 1)
SELECT month, loans, disbursed,
       ROUND(100.0 * disbursed / SUM(disbursed) OVER (), 1)      AS share_of_ytd,
       SUM(disbursed) OVER (ORDER BY month)                       AS ytd,
       ROUND(100.0 * disbursed / MAX(disbursed) OVER (), 1)      AS pct_of_best
FROM m ORDER BY month;
-- 2026-01 10.8 % / ytd 17 452 370 000 / 78.3 % of best · 2026-02 7.4 / 29 346 220 000 / 53.4 · 2026-03 12.2 / 49 003 630 000 / 88.2
-- … 2026-08 13.8 / 144 464 810 000 / 100.0 · 2026-09 10.5 / 161 480 300 000 / 76.3
```
Three windows, three frames: `OVER ()` for the total and the max, `OVER (ORDER BY month)` for the running sum. The half-open filter keeps 1 October out — leave it in and "September YTD" quietly becomes 162.3 bn.

</details>

**P5.** Bekzod's second ask: per **product**, monthly 2026 disbursement with running YTD — the running sum must restart per product.

<details><summary>Answer</summary>

```sql
WITH m AS (SELECT p.code, strftime('%Y-%m', l.disbursed_at) AS month, COUNT(*) AS loans, SUM(l.principal) AS disbursed
           FROM loans l JOIN products p ON p.product_id = l.product_id
           WHERE l.disbursed_at >= '2026-01-01' AND l.disbursed_at < '2026-10-01' GROUP BY 1, 2)
SELECT code, month, loans, disbursed, SUM(disbursed) OVER (PARTITION BY code ORDER BY month) AS ytd
FROM m ORDER BY code, month;
-- AUTO: Jan 4 620 560 000 → ytd Sep 36 021 820 000 · SME: Jan 10 042 990 000 → ytd Sep 94 774 300 000 · CONS → 25 461 900 000 · MICRO → 2 791 240 000 · BNPL → 2 431 040 000
```
45 rows (5 products × 9 months). Forget `PARTITION BY code` and Auto's September "YTD" includes every other product's January.

</details>

**P6.** How many loans are **above their product's average** principal? (Window in a derived table, filter outside.)

<details><summary>Answer</summary>

```sql
SELECT code, SUM(above) AS above_avg, COUNT(*) AS loans
FROM (SELECT p.code, CASE WHEN l.principal > AVG(l.principal) OVER (PARTITION BY p.code) THEN 1 ELSE 0 END AS above
      FROM loans l JOIN products p ON p.product_id = l.product_id) t
GROUP BY code;
-- AUTO 189 of 391 · BNPL 787 of 1569 · CONS 1212 of 2418 · MICRO 1331 of 2669 · SME 400 of 781   (3 919 in all)
```
`WHERE principal > AVG(principal) OVER (...)` is an error — windows do not exist yet when `WHERE` runs. Wrap, then filter. Roughly half above average in every product: the ticket sizes are symmetric, no long tail of giants.

</details>

**P7.** Three-month moving average of monthly disbursement for 2025-01 to 2026-09, plus the number of months in each window. Which month is furthest above its moving average?

<details><summary>Answer</summary>

```sql
WITH m AS (SELECT strftime('%Y-%m', disbursed_at) AS month, SUM(principal) AS disbursed
           FROM loans WHERE disbursed_at < '2026-10-01' GROUP BY 1),
w AS (SELECT month, disbursed,
             ROUND(AVG(disbursed) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)) AS ma3,
             COUNT(*)            OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)  AS months_in_window,
             ROUND(100.0 * disbursed / AVG(disbursed) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) - 100, 1) AS vs_ma_pct
      FROM m)
SELECT * FROM w WHERE month >= '2025-01' ORDER BY month;
-- 2025-07: 14 590 460 000 vs ma3 11 240 216 667 → +29.8 % (the furthest); 2025-08 +24.0 %; 2026-03 19 657 410 000 vs 16 334 543 333 → +20.3 %
```
Two CTEs: the window runs in `w` over the **whole** series, the display filter sits in the outer query. Put `WHERE month >= '2025-01'` inside `w` instead and `WHERE` runs *before* the window: January 2025 averages one month, February two — `months_in_window` shows 1 and 2 instead of 3. Filter the frame's input and the display separately, always.

</details>

**P8.** Payments of loan 1 with each payment's share of the loan's total collected and the running collected amount, ordered by date. What does the running column show about April–May 2026?

<details><summary>Answer</summary>

```sql
SELECT payment_id, paid_at, amount,
       SUM(amount) OVER (PARTITION BY loan_id)                                           AS loan_total,
       ROUND(100.0 * amount / SUM(amount) OVER (PARTITION BY loan_id), 1)                AS share_pct,
       SUM(amount) OVER (PARTITION BY loan_id ORDER BY paid_at, payment_id)              AS running_collected
FROM payments WHERE loan_id = 1 ORDER BY paid_at;
-- 18 payments of 1 741 700 = 31 350 600; each 5.6 %; running climbs by one instalment a month, except 2026-02-26 → 2026-04-25 (nothing in March) then two in May
```
The March instalment was paid 45 days late (week 2's loan 1 story) — visible as a flat step in the running total, then a catch-up. A running total is the quickest picture of a payment history.

</details>

**P9.** Schedule of loan 1: per instalment, cumulative principal due and the **remaining principal** after it (principal − cumulative principal). On which instalment does the remaining balance drop below half?

<details><summary>Answer</summary>

```sql
SELECT i.installment_no, i.due_date, i.principal_due,
       SUM(i.principal_due) OVER (ORDER BY i.installment_no) AS cum_principal,
       l.principal - SUM(i.principal_due) OVER (ORDER BY i.installment_no) AS remaining
FROM installments i JOIN loans l ON l.loan_id = i.loan_id WHERE i.loan_id = 1 ORDER BY i.installment_no;
-- no 1 remaining 30 187 050 … no 13 → 16 570 510 · no 14 → 15 243 073 (below 15 575 000 = half) … no 24 → 0
```
Annuity: principal parts grow (962 950 → 1 698 725), so half the balance is gone only after instalment 14 of 24. "Outstanding = instalments not yet due" is exactly this column read on the as-of date.

</details>

**P10.** Collected per month in 2026 (payments, from `payments`) with a running total — then say in one line why "collected YTD 125.7 bn" and "disbursed YTD 161.5 bn" are not comparable.

<details><summary>Answer</summary>

```sql
SELECT strftime('%Y-%m', paid_at) AS month, COUNT(*) AS payments, SUM(amount) AS collected,
       SUM(SUM(amount)) OVER (ORDER BY strftime('%Y-%m', paid_at)) AS collected_ytd
FROM payments WHERE paid_at >= '2026-01-01' AND paid_at < '2026-10-01' GROUP BY 1 ORDER BY 1;
-- Jan 11 759 005 976 … Sep 16 339 462 407; ytd 125 703 885 377
```
Collected includes interest and repays loans from 2024–2025; disbursed is principal of new loans. Different populations, different content — a ratio of the two is not a collection rate (Day 4 builds the real one).

</details>

**P10 — why not comparable?** Pick every reason that is true.

```task
{"id": "w03d1-p10b", "kind": "multi", "options": ["Collected includes interest; disbursed is principal only", "Collected in 2026 repays loans lent in 2024 and 2025 as well", "The two sums come from different tables, and that alone makes them incomparable", "Disbursed counts new 2026 loans; most of their repayments fall due later"], "answer": [0, 1, 3], "explain": "Different content (interest vs principal) and different populations (old loans repaying vs new loans going out). Two tables are fine to compare when they measure the same thing; these do not. The real collection rate (due vs paid on the same instalments) is on Day 4.", "xp": 1}
```

> 🚀 **Stretch (optional, +5 XP).** Concentration — the question a board asks right after the portfolio mix: *how much of the book hangs on a few names or a few branches?*

**P11.** Concentration curve of customers: rank borrowers by outstanding, and show the cumulative share of outstanding held by the top 10, top 25 and top 25 % of borrowers. Then the same idea for branches: how much of the book do the top three hold?

<details><summary>Answer</summary>

```sql
WITH c AS (SELECT l.customer_id, SUM(i.principal_due) AS outstanding
           FROM installments i JOIN loans l ON l.loan_id = i.loan_id WHERE i.due_date > '2026-10-01' GROUP BY l.customer_id)
SELECT customer_id, outstanding,
       ROUND(100.0 * outstanding / SUM(outstanding) OVER (), 2)                                   AS share_pct,
       ROUND(100.0 * SUM(outstanding) OVER (ORDER BY outstanding DESC) / SUM(outstanding) OVER (), 2) AS cum_share_pct
FROM c ORDER BY outstanding DESC;
-- 2 535 borrowers; row 1: customer 3208, 977 697 006, 0.47 % ; row 10 cumulative 3.60 %; row 25 cumulative 7.80 %
```
A running sum divided by a grand total — two windows with different frames in one expression. The top quarter of borrowers (634 people, via `NTILE(4)` tomorrow) holds 82.7 % of outstanding; the bottom quarter 0.5 %. For branches the same query on the worked example's branch table gives cumulative 13.8 → 26.6 → **39.1 %** after three rows — the Company corner reads it.

</details>

**P11 — the number.** What share of outstanding do the top three branches hold together, in %, one decimal?

```task
{"id": "w03d1-p11", "kind": "number", "answer": 39.1, "dp": 1, "unit": "%", "hint": "Branch outstanding, ordered DESC; a running SUM(...) OVER (ORDER BY outstanding DESC) divided by SUM(...) OVER (); read row 3.", "model": "Tashkent Central 13.8 + Tashkent South 12.8 + Tashkent North 12.5 = 39.1 % of 208 723 504 430. One city, three branches, two fifths of the book.", "xp": 2}
```

---

## 4. Homework <span class="badge hw">HW 3.1 — Due Day 3</span>

**Bekzod's share-and-trend pack.** Six queries and six sentences, all in the 📎 box below. The page checks every query itself: **▶ Run** shows your result, **✔ Check** compares it with ours (without showing ours). No screenshots, no `-- result:` lines to copy — when all six are ✅ and the sentences are written, **📤 Submit** sends the pack to your mentor.

- **Q1–Q3 — shares** (`GROUP BY` + a window each), outstanding = `principal_due` of instalments due after 2026-10-01: Q1 by product with share of total; Q2 by branch with share of total **and** share in region; Q3 by grade with share of total. Shares to 1 decimal.
- **Q4–Q6 — trend:** Q4 2026 monthly disbursement (January–September) with running YTD and share of the nine months (P4); Q5 the same per product, the running sum restarting per product (P5); Q6 the 3-month moving average of monthly disbursement 2025-01..2026-09 with the window-count column (P7) — the window runs on the whole series, the display filter sits outside.
- **pack.md** — six sentences for Bekzod: the biggest product and its share; the biggest branch and whether Tashkent as a region is concentrated; the YTD figure through September; the strongest and weakest months of 2026; the moving-average trend since spring; the month of 2025–2026 furthest above its moving average.

> ⚠️ **Watch out.** The checker runs your query on an untouched copy of the data, as one self-contained query: put the `WITH m AS (…)` part inside the same box, and do not rely on tables you created in the lab.

### 📎 Hand in here

```sqltask
{"check": "handin-W3D1", "lesson": "W3D1", "title": "HW 3.1", "file": "pack.sql", "why": "Bekzod builds Wednesday's pack from these six tables. Shares and running totals are the two window patterns you will write in every job after this one.", "graded": ["Q1–Q6: ✔ Check passes — the numbers and row counts match ours", "Every window has the PARTITION BY / ORDER BY / frame the sentence needs (a YTD that does not restart per product fails Q5)", "pack.md: six sentences, each saying share of what and which period"], "tasks": [{"id": "Q1", "q": "Outstanding by product with its share of total outstanding (%, 1 decimal) — five rows."}, {"id": "Q2", "q": "Outstanding by branch with share of total and share inside its region (%, 1 decimal) — ten rows."}, {"id": "Q3", "q": "Outstanding by risk grade with share of total (%, 1 decimal) — four rows."}, {"id": "Q4", "q": "2026 monthly disbursement, January–September: loans, amount, share of the nine months, running YTD — nine rows."}, {"id": "Q5", "q": "The same per product: monthly 2026 disbursement with a running YTD that restarts for every product — 45 rows."}, {"id": "Q6", "q": "3-month moving average of monthly disbursement with the number of months in each window, shown for 2025-01..2026-09 — 21 rows."}, {"id": "pack.md", "file": "pack.md", "text": true, "minLines": 6, "q": "Six sentences for Bekzod, one per line — each with share of what and the period."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else you want your mentor to see (one more file, or a .zip of several)."}]}
```

---

## 5. Self-check

```check
{"id": "w03d1-sc", "questions": [
  {"type": "single", "q": "SUM(SUM(principal_due)) OVER () — which SUM runs first, and what does each add up?", "options": ["The outer one first: every instalment of the company", "The inner one first: one total per group (GROUP BY); then the outer window adds those group totals", "Both at once, over all instalments", "Neither — nested aggregates are an error"], "answer": 1, "explain": "The window runs on the grouped result: five product totals in, the grand total written on each of the five rows (→ section 1, Share of total)."},
  {"type": "single", "q": "Seven loans were disbursed on 28 September. A running total ORDER BY disbursed_at with the default frame, and one with ROWS UNBOUNDED PRECEDING — what do the seven rows show?", "options": ["Both climb row by row", "The default (RANGE) shows the whole day's total on all seven rows; ROWS climbs row by row", "ROWS shows the day's total; RANGE climbs", "Both show NULL on ties"], "answer": 1, "explain": "RANGE includes every row with the same ORDER BY value; ROWS stops at the current row (→ section 1, The default frame)."},
  {"type": "single", "q": "You want only the loans above their product's average principal. Where does the window go?", "options": ["In WHERE", "In HAVING", "In a derived table (or CTE); the filter goes in the outer query", "In GROUP BY"], "answer": 2, "explain": "Windows are computed after WHERE, GROUP BY and HAVING — wrap, then filter (→ P6)."}]}
```

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

```game
{"type": "flash", "id": "w03d1-g4", "title": "Portfolio-mix words", "cards": [["Portfolio mix", "what the outstanding is made of: shares by product, branch, grade"], ["Outstanding", "principal of instalments not yet due, as of a date (208.7 bn on 2026-10-01)"], ["Money share vs count share", "money speaks about risk, count about operations — show both"], ["Concentration", "how much of the book depends on a few names, branches or regions"], ["Top-3 share", "running sum of the three largest ÷ total — Tashkent's branches: 39.1 %"], ["Single-name concentration", "the largest borrower's share of the book — 0.47 % here, low"], ["Large-exposure limit", "a bank's cap on one borrower, usually 25 % of capital"]]}
```

> 🎯 **Interview version.** *"How would you describe a loan portfolio's composition in SQL?"* The interviewer listens for three things: how you define outstanding, the one-line share pattern, and how you would measure concentration. Say it in your own words below, then compare.

**Say it like in an interview.** Answer the question above as you would aloud, in 3–5 sentences, with one Nur Finance number.

```task
{"id": "w03d1-int", "kind": "free", "min": 30, "model": "Outstanding is the sum of principal_due over instalments not yet due at the as-of date — 208.7 bn UZS at Nur Finance on 1 October 2026. I group by the dimension (product, branch, grade) and add 100.0 * SUM(x) / SUM(SUM(x)) OVER () for the share: SME is 60.3 % of the money. For concentration I order by outstanding and divide a running SUM(...) OVER (ORDER BY ... DESC) by the total, so I can read top-N shares — the three Tashkent branches hold 39.1 %, the largest borrower 0.47 %. I always show count share next to money share, because by count the same book is mostly Consumer and Micro.", "rubric": ["Defines outstanding: principal of instalments not yet due, as of a date", "Gives the share pattern SUM(x) / SUM(SUM(x)) OVER ()", "Explains concentration with a running sum over the ordered list", "Shows count share next to money share", "Quotes at least one real number"], "xp": 2}
```

Tomorrow: ranking (who is first, who is in the top 3 of each group), looking at the *previous* row with `LAG`, and the payments collections say they received twice.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w03d1", "pass": 0.8, "questions": [
  {"type": "single", "q": "In this query, what does the outer SUM(…) OVER () add up?", "code": "SELECT p.code, SUM(i.principal_due) AS outstanding,\n       100.0 * SUM(i.principal_due) / SUM(SUM(i.principal_due)) OVER () AS share_pct\nFROM installments i JOIN loans l ON l.loan_id = i.loan_id\nJOIN products p ON p.product_id = l.product_id\nWHERE i.due_date > '2026-10-01'\nGROUP BY p.code;", "options": ["Every instalment of the company again, row by row", "The five per-product sums, giving the grand total on each of the five rows", "Only the current product's instalments", "It is an error — aggregates cannot be nested"], "answer": 1, "explain": "The inner SUM is the GROUP BY aggregate; the window runs on the grouped result and adds those values up (→ section 1, Share of total)."},
  {"type": "single", "q": "What does total show on each row?", "code": "SELECT loan_id, principal,\n       SUM(principal) OVER () AS total\nFROM loans\nWHERE customer_id = 3208;", "options": ["The company's total principal", "The total principal of customer 3208's loans only", "NULL", "The principal of the row itself"], "answer": 1, "explain": "Windows are computed after WHERE, GROUP BY and HAVING, so the window only sees the rows that survived the filter (→ section 1, PARTITION BY; P1)."},
  {"type": "single", "q": "Why does this fail, and where does the window go instead?", "code": "SELECT l.loan_id\nFROM loans l\nWHERE l.principal > AVG(l.principal) OVER (PARTITION BY l.product_id);", "options": ["AVG cannot take PARTITION BY", "Windows do not exist yet when WHERE runs; compute the window in a derived table or CTE and filter outside", "Put the window in GROUP BY instead", "It does not fail — it returns loans above their product's average"], "answer": 1, "explain": "Wrap, then filter (→ section 1, Window vs GROUP BY; P6)."},
  {"type": "number", "q": "Three rows, ordered as shown. What is run on the FIRST row (the default frame, RANGE)?", "code": "day        | x\n2026-09-28 | 10\n2026-09-28 | 20\n2026-09-29 | 5\n\nSELECT day, x, SUM(x) OVER (ORDER BY day) AS run FROM t;", "answer": 30, "explain": "RANGE takes every row with the same ORDER BY value, so both 28 September rows show the day's total, 30; ROWS UNBOUNDED PRECEDING would give 10 (→ section 1, The default frame and ROWS BETWEEN)."},
  {"type": "single", "q": "Bekzod wants a year-to-date running sum per product. What is wrong with this?", "code": "SELECT code, month, disbursed,\n       SUM(disbursed) OVER (ORDER BY month) AS ytd\nFROM m;", "options": ["Nothing", "Without PARTITION BY code the running sum runs across all products, so Auto's YTD includes every other product too", "ORDER BY is not allowed inside OVER", "It needs GROUP BY month"], "answer": 1, "explain": "PARTITION BY restarts the running sum per group (→ P5)."},
  {"type": "single", "q": "Which window gives a 3-month moving average of monthly disbursement (this month and the two before)?", "options": ["AVG(disbursed) OVER (ORDER BY month ROWS BETWEEN 3 PRECEDING AND CURRENT ROW)", "AVG(disbursed) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)", "AVG(disbursed) OVER (ORDER BY month ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING)", "AVG(disbursed) OVER (ORDER BY month)"], "answer": 1, "explain": "2 PRECEDING + the current row = 3 months; 3 PRECEDING is four months, the 1/1 frame is a centred average, and no frame is a running average (→ section 1, Moving averages)."},
  {"type": "multi", "q": "Which of these need a window function (GROUP BY alone cannot do it)?", "options": ["Every loan with its product's average principal beside it", "Each product's outstanding with its share of the total in the same row", "One total of outstanding per product", "Monthly disbursement with a running year-to-date column", "The number of loans in the company"], "answer": [0, 1, 3], "explain": "Windows keep rows and add a group's number, a total or a running sum beside them; plain totals are GROUP BY (→ section 1, Window vs GROUP BY)."},
  {"type": "single", "q": "By loan count the book is mostly Consumer, Micro and BNPL; by money it is mostly SME and Auto. What should a portfolio-mix table show?", "options": ["Money share only — it is what the board cares about", "Count share and money share side by side, saying share of what", "Count share only", "The average ticket only"], "answer": 1, "explain": "Count speaks to operations, money to risk; a share without 'of what' is meaningless (→ section 6, Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w03d1", "sql": true, "q": "Nilufar worries that one branch leans too hard on Auto loans. For each branch, compute Auto's share of that branch's own outstanding principal (instalments due after 2026-10-01, all loan statuses). What is the highest such share among the ten branches? Percentage to 1 decimal.", "type": "number", "dp": 1, "h": ["f3480b47fbe805fc66dfcea9"], "hint": "One GROUP BY by branch and product, then a window whose partition is the branch rather than the whole company.", "sol": "U0VMRUNUIGIuYnJhbmNoX25hbWUsIHAuY29kZSwKICAgICAgIFNVTShpLnByaW5jaXBhbF9kdWUpIEFTIG91dHN0YW5kaW5nLAogICAgICAgUk9VTkQoMTAwLjAgKiBTVU0oaS5wcmluY2lwYWxfZHVlKQogICAgICAgICAgICAgLyBTVU0oU1VNKGkucHJpbmNpcGFsX2R1ZSkpIE9WRVIgKFBBUlRJVElPTiBCWSBiLmJyYW5jaF9uYW1lKSwgMSkgQVMgc2hhcmVfaW5fYnJhbmNoCkZST00gaW5zdGFsbG1lbnRzIGkKSk9JTiBsb2FucyBsICAgIE9OIGwubG9hbl9pZCA9IGkubG9hbl9pZApKT0lOIGJyYW5jaGVzIGIgT04gYi5icmFuY2hfaWQgPSBsLmJyYW5jaF9pZApKT0lOIHByb2R1Y3RzIHAgT04gcC5wcm9kdWN0X2lkID0gbC5wcm9kdWN0X2lkCldIRVJFIGkuZHVlX2RhdGUgPiAnMjAyNi0xMC0wMScKR1JPVVAgQlkgYi5icmFuY2hfbmFtZSwgcC5jb2RlCk9SREVSIEJZIENBU0UgV0hFTiBwLmNvZGUgPSAnQVVUTycgVEhFTiAwIEVMU0UgMSBFTkQsIHNoYXJlX2luX2JyYW5jaCBERVNDOwotLSB0aGUgc2FtZSB0ZXh0IG9uIFNRTCBTZXJ2ZXIKLS0gQVVUTyByb3dzOiBUYXNoa2VudCBDZW50cmFsIDkgODMwIDczMCA1NjEgPSAzNC4yICUgb2YgaXRzIGJvb2s7IE51a3VzIENlbnRyYWwsIEZlcmdhbmEgQ2VudHJhbCBhbmQgVGFzaGtlbnQgTm9ydGggYWJvdXQgMzAgJTsgQnVraGFyYSBDZW50cmFsIGxvd2VzdCBhdCAxNy42ICUKV2l0aCBPVkVSICgpIHlvdSB3b3VsZCBnZXQgQXV0bydzIHNoYXJlIG9mIHRoZSB3aG9sZSBjb21wYW55IChUYXNoa2VudCBDZW50cmFsJ3MgQXV0byBpcyA0LjcgJSBvZiB0aGUgYm9vaykg4oCUIGEgZGlmZmVyZW50IHF1ZXN0aW9uLiBDb21wYW55LXdpZGUsIEF1dG8gaXMgMjcuNiAlIG9mIG91dHN0YW5kaW5nOyBUYXNoa2VudCBDZW50cmFsIHJ1bnMgNi42IHBvaW50cyBhYm92ZSB0aGF0LCBCdWtoYXJhIDEwIHBvaW50cyBiZWxvdy4gQSB0aGlyZCBvZiBvbmUgYnJhbmNoJ3MgYm9vayBpbiBiaWctdGlja2V0IEF1dG8gaXMgd29ydGggYSBsaW5lIGluIEJla3pvZCdzIHBhY2ssIG5vdCBhbiBhbGFybS4="}
```

<!-- challenge:end -->
