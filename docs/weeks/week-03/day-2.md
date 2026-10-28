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

```pic
{"id": "w03d2-pic1", "title": "ROW_NUMBER numbers each customer's loans, starting again at 1", "caption": "One colour per customer. Customer 9 took three loans on the same day, so `loan_id` breaks the tie; customer 1893's numbering restarts at 1 with loan 458.", "tables": [{"name": "result", "cols": ["customer_id", "loan_id", "disbursed_at", "loan_no"], "rows": [[9, 1632, "2025-07-27", 1], [9, 4962, "2025-07-27", 2], [9, 7693, "2025-07-27", 3], [1893, 458, "2025-03-02", 1], [1893, 4687, "2025-03-03", 2], [1893, 5050, "2025-06-10", 3]], "tone": ["a", "a", "a", "b", "b", "b"], "new": ["loan_no"], "more": "… 1893 has 4 more loans (4–7)"}]}
```

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

```task
{"id": "w03d2-l1", "kind": "number", "answer": 868, "dp": 0, "unit": "customers", "hint": "SELECT COUNT(*) FROM (SELECT ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY disbursed_at, loan_id) AS loan_no FROM loans) t WHERE loan_no = 3;", "model": "868 customers have a loan numbered 3 — everyone with three or more loans (593 + 194 + 62 + 15 + 4)."}
```

### RANK and DENSE_RANK — what happens on a tie

**What it is.** `RANK()` and `DENSE_RANK()` number rows like `ROW_NUMBER`, but rows with the **same value** (a tie, *равные значения*) get the **same number**. After a tie `RANK` skips numbers; `DENSE_RANK` does not.

```pic
{"id": "w03d2-pic2", "title": "On a tie, RANK leaves a gap and DENSE_RANK does not", "caption": "Loans 102 and 103 tie at 700 and share 2. Look at loan 104: `RANK` says 4 (three rows ahead), `DENSE_RANK` says 3 (two values ahead).", "tables": [{"name": "t", "cols": ["loan", "principal", "RANK", "DENSE_RANK"], "rows": [[101, 900, 1, 1], [102, 700, 2, 2], [103, 700, 2, 2], [104, 500, 4, 3], [105, 400, 5, 4]], "tone": [null, "b", "b", null, null], "new": ["RANK", "DENSE_RANK"], "cells": [[3, "RANK"], [3, "DENSE_RANK"]]}]}
```

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

```game
{"type": "match", "id": "w03d2-g1", "title": "Four BNPL loans tie at 7 990 000", "pairs": [["ROW_NUMBER()", "1, 2, 3, 4 — then 5; always unique"], ["RANK()", "1, 1, 1, 1 — then 5; ties share, then a gap"], ["DENSE_RANK()", "1, 1, 1, 1 — then 2; ties share, no gap"], ["NTILE(4)", "four groups of (almost) equal count"], ["PERCENT_RANK()", "a position from 0 to 1"]]}
```

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

```task
{"id": "w03d2-l2", "kind": "number", "answer": 3, "dp": 0, "unit": "rows", "hint": "10 ÷ 4 = 2 rows each, with 2 left over. The leftovers go to the first groups.", "model": "3. The groups are 3, 3, 2, 2 rows: the two leftover rows go to groups 1 and 2."}
```

### LAG and LEAD — the previous and the next row

**What it is.** `LAG(column)` returns the value of `column` on the **previous** row of the window; `LEAD(column)` on the **next** row. "Previous" is decided by the `ORDER BY` inside `OVER`. They are **value window functions** (*функции смещения*): they do not aggregate, they look sideways.

```pic
{"id": "w03d2-pic3", "title": "LAG reads the row above", "caption": "Loan 1's payments. Each `prev_paid` is the `paid_at` of the row above (same colour); `gap_days` is the difference. The circled 58 days is the missed March instalment.", "tables": [{"id": "p", "name": "payments", "label": "loan_id = 1", "cols": ["paid_at", "prev_paid", "gap_days"], "rows": [["2026-01-28", "2025-12-27", 32], ["2026-02-26", "2026-01-28", 29], ["2026-04-25", "2026-02-26", 58], ["2026-05-12", "2026-04-25", 17], ["2026-05-26", "2026-05-12", 14]], "new": ["prev_paid", "gap_days"], "cells": [[2, "gap_days"]], "more": "… 18 payments in all"}], "links": [{"from": ["p", 0, "paid_at"], "to": ["p", 1, "prev_paid"]}, {"from": ["p", 1, "paid_at"], "to": ["p", 2, "prev_paid"]}, {"from": ["p", 2, "paid_at"], "to": ["p", 3, "prev_paid"]}, {"from": ["p", 3, "paid_at"], "to": ["p", 4, "prev_paid"]}]}
```

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

```game
{"type": "bug", "id": "w03d2-g2", "title": "Find the broken line", "q": "Gaps between loan 1's payments. The result is sorted by date, yet prev_paid jumps around. Which line is wrong?", "code": "SELECT payment_id, paid_at,\n       LAG(paid_at) OVER (PARTITION BY loan_id) AS prev_paid\nFROM payments\nWHERE loan_id = 1\nORDER BY paid_at;", "answer": [1], "why": "LAG needs its own ORDER BY inside OVER (ORDER BY paid_at, payment_id). The ORDER BY at the end only sorts the display; it does not tell LAG which row is 'previous'."}
```

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

```task
{"id": "w03d2-l3", "kind": "choice", "options": ["LAST_VALUE(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at)", "FIRST_VALUE(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at DESC)", "LAG(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at)", "FIRST_VALUE(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at)"], "answer": 1, "explain": "Reverse the order and take the first value. LAST_VALUE with the default frame returns each row's own date; LAG is the previous row; FIRST_VALUE ascending is the earliest payment."}
```

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

```game
{"type": "build", "id": "w03d2-g5", "title": "The latest loan of every customer", "q": "Build the inner query: each customer's loans numbered from the newest.", "tokens": ["SELECT customer_id, loan_id,", "ROW_NUMBER() OVER (", "PARTITION BY customer_id", "ORDER BY disbursed_at DESC, loan_id DESC", ") AS rn", "FROM loans"], "distractors": ["WHERE rn = 1", "GROUP BY customer_id", "ORDER BY disbursed_at ASC"]}
```

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

```task
{"id": "w03d2-l4", "kind": "choice", "options": ["PARTITION BY payment_id", "PARTITION BY installment_id, paid_at, amount", "PARTITION BY loan_id", "PARTITION BY paid_at"], "answer": 1, "explain": "The partition is the definition of sameness. payment_id is unique, so it never repeats; loan_id or paid_at alone would call two honest payments duplicates."}
```

### Roll rates with LAG — from one snapshot to the next

**What it is.** A **roll rate** (*миграция между корзинами*) is the share of loans that moved from one DPD bucket at one date to another bucket at the next date. Stack the snapshots one under another — one row per loan per date — and `LAG(bucket)` puts the previous date's bucket on the same row.

```text
loan  asof        bucket      LAG(bucket) OVER (PARTITION BY loan ORDER BY asof)
7     2026-09-01  1-30        NULL
7     2026-10-01  31-60       1-30     → rolled forward
8     2026-09-01  1-30        NULL
8     2026-10-01  0           1-30     → cured
9     2026-09-01  0           NULL
9     2026-10-01  1-30        0        → new late loan
```

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

```task
{"id": "w03d2-l5", "kind": "number", "answer": 69.6, "dp": 1, "unit": "%", "hint": "The row from_bucket = '31-60', to_bucket = '61-90'.", "model": "69.6 % — 16 of 23 loans. In 31–60 more than two in three get worse; in 1–30 three in four cure."}
```

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

```game
{"type": "sort", "id": "w03d2-g3", "title": "Which window function?", "q": "Tap each question from Bekzod, Sevara or Nilufar, then the function that answers it.", "groups": {"ROW_NUMBER": ["The latest loan of every customer, exactly one row each", "Which payment rows are repeats of an earlier one?"], "RANK / DENSE_RANK": ["A leaderboard of collectors where ties share a place", "Every loan with one of the top three principal amounts in its product"], "LAG / LEAD": ["Each month against the month before", "Days since the previous payment of the same loan"], "NTILE": ["Borrowers in four equal-sized groups by outstanding"]}}
```

### Depth (optional)

- ▶ Baraa, *Window ranking* [10:53:09](https://youtu.be/SSKVgrwhzus?t=39189&end=42965), *Window value* [11:56:05](https://youtu.be/SSKVgrwhzus?t=42965&end=45634) — ~2 h.
- RU deck (TBC Data Analytics 2.0, if you have it) `2.3 SQL.pdf` — ranking and offset functions. *Russian terms:* ранжирование = ranking, функции смещения = offset functions (LAG/LEAD), дубликаты = duplicates.

```videoquiz
{"video": "SSKVgrwhzus", "stops": [
  {"at": 40300, "q": "Two rows tie for first place. What does RANK() give the row after them?", "options": ["2", "3", "1", "NULL"], "answer": 1, "explain": "RANK gives both tied rows 1 and then skips: the next row is 3. DENSE_RANK would give 2."},
  {"at": 42000, "q": "Which ranking function would you use to keep exactly one row per group, even when values tie?", "options": ["RANK", "DENSE_RANK", "ROW_NUMBER", "NTILE"], "answer": 2, "explain": "ROW_NUMBER never repeats a number, so rn = 1 is always one row — the basis of de-duplication and 'latest per customer'."},
  {"at": 43900, "q": "LAG(sales) OVER (ORDER BY month) on the first month returns…", "options": ["0", "NULL, unless you give a default as the third argument", "The last month's value", "An error"], "answer": 1, "explain": "There is no previous row, so LAG returns NULL; LAG(sales, 1, 0) would return 0 instead."},
  {"at": 45200, "q": "LAST_VALUE with ORDER BY returns each row's own value. Why?", "options": ["LAST_VALUE is broken", "The default frame ends at the current row", "PARTITION BY is missing", "The data has ties"], "answer": 1, "explain": "With ORDER BY, the frame runs from the start to the current row; spell out ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING.", "back": 60}]}
```

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

```sqllab
{"id": "w03d2-lab", "title": "Make duplicates, find them, delete them", "intro": "You copy loan 1's payments into a table of your own, plant six duplicates the way the re-import did (same instalment, date and amount, new ids), find them with ROW_NUMBER and delete exactly those. The course table payments is not touched.", "steps": [
  {"say": "Create my_payments with CREATE TABLE … AS: payment_id, loan_id, installment_id, paid_at, amount of every payment of loan 1.", "hint": "CREATE TABLE my_payments AS SELECT payment_id, loan_id, installment_id, paid_at, amount FROM payments WHERE loan_id = 1;", "expect": "SELECT COUNT(*) FROM my_payments", "want": 18},
  {"say": "Plant the duplicates: insert again every row of my_payments paid on or after 2026-05-01, with payment_id + 100000 as the new id.", "hint": "INSERT INTO my_payments SELECT payment_id + 100000, loan_id, installment_id, paid_at, amount FROM my_payments WHERE paid_at >= '2026-05-01';", "expect": "SELECT COUNT(*) FROM my_payments", "want": 24},
  {"say": "Find them: create my_dupes(payment_id) holding every row whose ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) is above 1.", "hint": "CREATE TABLE my_dupes AS WITH d AS (SELECT payment_id, ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn FROM my_payments) SELECT payment_id FROM d WHERE rn > 1;", "expect": "SELECT COUNT(*) FROM my_dupes WHERE payment_id > 100000", "want": 6},
  {"say": "Delete exactly the listed rows from my_payments, then check that no (instalment, date, amount) appears twice.", "hint": "DELETE FROM my_payments WHERE payment_id IN (SELECT payment_id FROM my_dupes);", "expect": "SELECT COUNT(*) FROM my_payments", "want": 18}],
 "cleanup": "DROP TABLE IF EXISTS my_dupes; DROP TABLE IF EXISTS my_payments"}
```

> ⚠️ **Watch out.** `ORDER BY payment_id` inside the window decides which twin survives: the earliest id gets `rn = 1`. Flip it to `DESC` and you would keep the re-imported copies and delete the originals — the same count, the wrong rows.

---

## 3. Practice (50 min)

The questions follow the order of section 1; the concept each one trains is in italics. Write each query in the box under its question — it is saved in this browser. **✔ Check** tells you whether your result matches the answer.

**P1.** *(ROW_NUMBER)* Number every customer's loans in the order they were disbursed (ties by `loan_id`) and show the loans whose number is 1 — every customer's **first** loan. How many rows, and what is the product mix of first loans?

<details><summary>Answer</summary>

```sql
WITH r AS (SELECT l.customer_id, l.loan_id, p.code,
                  ROW_NUMBER() OVER (PARTITION BY l.customer_id ORDER BY l.disbursed_at, l.loan_id) AS loan_no
           FROM loans l JOIN products p ON p.product_id = l.product_id)
SELECT code, COUNT(*) AS first_loans FROM r WHERE loan_no = 1 GROUP BY code ORDER BY first_loans DESC;
-- MICRO 1 531 · CONS 1 325 · BNPL 850 · SME 422 · AUTO 207
```
One first loan per borrower: 4 335 rows. A third of borrowers start with Micro (1 531), and only 207 start with Auto. `ROW_NUMBER` guarantees exactly one row with number 1 per customer, even when two loans were paid out on the same day — the tiebreaker decides which.

</details>

**P2.** *(RANK vs DENSE_RANK)* Branches ranked by outstanding with `ROW_NUMBER`, `RANK` and `DENSE_RANK`. Why do all three agree here, and what would make them differ?

<details><summary>Answer</summary>

```sql
WITH o AS (SELECT b.branch_name, SUM(i.principal_due) AS outstanding
           FROM installments i JOIN loans l ON l.loan_id = i.loan_id JOIN branches b ON b.branch_id = l.branch_id
           WHERE i.due_date > '2026-10-01' GROUP BY b.branch_name)
SELECT branch_name, outstanding,
       ROW_NUMBER() OVER (ORDER BY outstanding DESC) AS rn,
       RANK()       OVER (ORDER BY outstanding DESC) AS rk,
       DENSE_RANK() OVER (ORDER BY outstanding DESC) AS drk
FROM o ORDER BY rn;
-- Tashkent Central 1/1/1 … Termez Central 10/10/10
```
Yesterday's branch outstanding plus the three functions over `ORDER BY outstanding DESC`. No two branches have the same outstanding to the som, so there are no ties. Rank by *number of loans* within the Tashkent region instead and still no tie (1012 / 1007 / 1001) — ties appear on coarse values: grade, term, rounded amounts. 17 loans share the principal 4 880 000.

</details>

**P2 — why?** All three columns agree on every branch. What would make them differ?

```task
{"id": "w03d2-p1b", "kind": "choice", "options": ["A PARTITION BY region", "Two branches with exactly the same outstanding — a tie", "Sorting ASC instead of DESC", "More than ten branches"], "answer": 1, "explain": "The functions differ only on ties. Outstanding to the som never ties; coarse values do — 17 loans share the principal 4 880 000.", "xp": 1}
```

**P3.** *(RANK)* Rank collectors by promises obtained (`outcome = 'promise_to_pay'`) with `RANK`; show actions, promises and promise rate for the top five.

<details><summary>Answer</summary>

```sql
SELECT collector_id, COUNT(*) AS actions, SUM(CASE WHEN outcome = 'promise_to_pay' THEN 1 ELSE 0 END) AS promises,
       RANK() OVER (ORDER BY SUM(CASE WHEN outcome = 'promise_to_pay' THEN 1 ELSE 0 END) DESC) AS rk
FROM collections_actions GROUP BY collector_id ORDER BY rk LIMIT 5;
-- 29 → 568 actions / 182 promises · 28 → 593 / 177 · 27 → 590 / 170 · 57 → 419
-- / 125 · 7 → 393 / 121
```
A window over an aggregate with `CASE` inside — three layers, still one query. Ranking by *count* rewards the busiest collector; add `100.0 * promises / actions` and rank by that too before anyone gets a bonus.

</details>

**P4.** *(NTILE)* Customer quartiles by outstanding (`NTILE(4)`) with count, money and share — then deciles. How much does the top 10 % hold?

<details><summary>Answer</summary>

```sql
WITH c AS (SELECT l.customer_id, SUM(i.principal_due) AS outstanding
           FROM installments i JOIN loans l ON l.loan_id = i.loan_id WHERE i.due_date > '2026-10-01' GROUP BY l.customer_id),
q AS (SELECT customer_id, outstanding, NTILE(10) OVER (ORDER BY outstanding DESC) AS decile FROM c)
SELECT decile, COUNT(*) AS borrowers, SUM(outstanding) AS outstanding,
       ROUND(100.0 * SUM(outstanding) / SUM(SUM(outstanding)) OVER (), 1) AS share_pct
FROM q GROUP BY decile ORDER BY decile;
-- 1 · 254 · 102 681 050 696 · 49.2 %   2 · 254 · 54 113 118 283 · 25.9 %   3 ·
-- 254 · 12.4 % …
```
Section 1 gives quartiles 82.7 / 13.6 / 3.2 / 0.5 %. `NTILE(10)`: the first decile (254 borrowers) holds **49.2 %** of the book, the second 25.9 % — three quarters of the outstanding in a fifth of the borrowers. A decile table is the standard "who are our customers by exposure" slide; quote the borrower count with every share.

</details>

**P4 — read it.** What share of outstanding does the top tenth of borrowers hold, in %, one decimal?

```task
{"id": "w03d2-p9b", "kind": "number", "answer": 49.2, "dp": 1, "unit": "%", "hint": "Decile 1 of NTILE(10) OVER (ORDER BY outstanding DESC).", "model": "49.2 %: 254 borrowers hold 102.7 bn of 208.7 bn. With the second decile (25.9 %) a fifth of the borrowers carries three quarters of the book.", "xp": 1}
```

**P5.** *(LAG — month on month)* Monthly disbursement with month-on-month and year-on-year change for 2026-01..2026-09 (the display filtered *outside* the window). Which month fell most against the previous one and still grew year-on-year?

<details><summary>Answer</summary>

```sql
WITH m AS (SELECT strftime('%Y-%m', disbursed_at) AS month, SUM(principal) AS disbursed FROM loans WHERE disbursed_at < '2026-10-01' GROUP BY 1),
w AS (SELECT month, disbursed,
             ROUND(100.0 * (disbursed - LAG(disbursed) OVER (ORDER BY month)) / LAG(disbursed) OVER (ORDER BY month), 1) AS mom_pct,
             ROUND(100.0 * (disbursed - LAG(disbursed, 12) OVER (ORDER BY month)) / LAG(disbursed, 12) OVER (ORDER BY month), 1) AS yoy_pct
      FROM m)
SELECT * FROM w WHERE month >= '2026-01' ORDER BY month;
-- 2026-02 −31.8 / +20.0 · 2026-09 −23.7 / +16.2 · 2026-05 +3.6 / +114.4
```
Section 1's `LAG` query wrapped, the display filter outside. February: −31.8 % month-on-month, **+20.0 %** year-on-year. September: −23.7 % / +16.2 %. Both columns on every slide that shows a monthly series.

</details>

**P5 — read it.** Which month of 2026 fell most against the month before, and still grew year-on-year?

```task
{"id": "w03d2-p4b", "kind": "choice", "options": ["January 2026", "February 2026", "June 2026", "September 2026"], "answer": 1, "explain": "February: −31.8 % month-on-month and +20.0 % year-on-year — a seasonal dip, not a decline. September (−23.7 % / +16.2 %) is the second.", "xp": 1}
```

**P6.** *(LAG and LEAD on the schedule)* Per instalment of loan 1, the previous instalment's due date and the number of days between them (`LAG` on the schedule). Then over **all** loans: how many consecutive instalments are more than 31 days apart?

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM (
  SELECT loan_id, installment_no, due_date,
         julianday(due_date) - julianday(LAG(due_date) OVER (PARTITION BY loan_id ORDER BY installment_no)) AS gap
  FROM installments) WHERE gap > 31;
```
Loan 1: 30, 31, 30, 31, 31, 30, 31, 30, 31, 31, **28** (28 Jan → 28 Feb), 31 … — month lengths, 28 to 31. Over all schedules no gap exceeds 31 — the schedule generator is monthly to the day; a gap of 32+ would mean a skipped instalment number. `LEAD(due_date) OVER (PARTITION BY loan_id ORDER BY installment_no)` asks the same question from the other side: the next due date. The 28-day step is the month-end effect of week 2 Day 3's P22: a schedule that follows the calendar cannot keep a 29th–31st day in February.

</details>

**P7.** *(LAG — gaps between payments)* Gaps between consecutive **payments** per loan: the average gap, the longest, how many exceed 60 days, and how many are exactly 0. Which of those four is the detective's number?

<details><summary>Answer</summary>

```sql
WITH g AS (
  SELECT loan_id,
         julianday(paid_at) - julianday(LAG(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at, payment_id)) AS gap
  FROM payments)
SELECT ROUND(AVG(gap), 1) AS avg_gap, MAX(gap) AS max_gap,
       SUM(CASE WHEN gap > 60 THEN 1 ELSE 0 END) AS over_60, SUM(CASE WHEN gap = 0 THEN 1 ELSE 0 END) AS same_day
FROM g;
-- 30.9 · 408 · 492 · 63
```
`AVG` 30.9 days · `MAX` 408 · 492 gaps > 60 · **63 gaps = 0**. The 63 same-day pairs contain the 25 duplicates plus 38 legitimate pairs (a borrower paying two instalments on one day — different `installment_id`). "Same day" is a clue, not the definition; the definition is the three-column partition.

</details>

**P7 — the detective number.** How many consecutive payment pairs of the same loan are exactly 0 days apart?

```task
{"id": "w03d2-p6b", "kind": "number", "answer": 63, "dp": 0, "unit": "pairs", "hint": "The gap column of your P7 query; count the rows where it equals 0.", "model": "63 same-day pairs: the 25 duplicates plus 38 legitimate pairs where a borrower paid two different instalments on one day. A clue, not the definition — the definition is the (instalment, date, amount) partition.", "xp": 1}
```

**P8.** *(FIRST_VALUE)* For customers with at least two loans: the product of their **first** loan and of their **latest** loan (`FIRST_VALUE` twice, once in each order), counted as a from → to table. How many customers started with Micro and moved up to SME?

<details><summary>Answer</summary>

```sql
WITH f AS (SELECT l.customer_id,
                  FIRST_VALUE(p.code) OVER (PARTITION BY l.customer_id ORDER BY l.disbursed_at, l.loan_id)           AS first_product,
                  FIRST_VALUE(p.code) OVER (PARTITION BY l.customer_id ORDER BY l.disbursed_at DESC, l.loan_id DESC) AS latest_product,
                  COUNT(*)            OVER (PARTITION BY l.customer_id)                                              AS loans
           FROM loans l JOIN products p ON p.product_id = l.product_id)
SELECT first_product, latest_product, COUNT(DISTINCT customer_id) AS customers
FROM f WHERE loans >= 2
GROUP BY first_product, latest_product ORDER BY customers DESC;
-- 25 rows: MICRO → MICRO 263 · MICRO → CONS 259 · CONS → MICRO 221 … MICRO →
-- SME 70
```
70 customers took a Micro loan first and an SME loan last. The most common path out of Micro is Consumer (259). `FIRST_VALUE` with the order reversed is the safe "latest" — `LAST_VALUE` with the default frame would return each row's own product. `COUNT(DISTINCT customer_id)` because the window wrote the same pair on every loan of the customer.

</details>

**P9.** *(top-N per group)* The three biggest loans per **branch** (loan, product, principal, disbursed). How many rows? Then change it to one row per customer — their latest loan — and give the status mix of those latest loans.

<details><summary>Answer</summary>

```sql
WITH r AS (
  SELECT b.branch_name, l.loan_id, p.code, l.principal, l.disbursed_at,
         ROW_NUMBER() OVER (PARTITION BY b.branch_name ORDER BY l.principal DESC, l.loan_id) AS rn
  FROM loans l JOIN branches b ON b.branch_id = l.branch_id JOIN products p ON p.product_id = l.product_id)
SELECT * FROM r WHERE rn <= 3 ORDER BY branch_name, rn;
-- 30 rows; every one an SME loan; the largest per branch from 573 480 000
-- (Samarkand Central) to 599 060 000 (Tashkent Central)
```
```sql
WITH r AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY disbursed_at DESC, loan_id DESC) AS rn FROM loans)
SELECT status, COUNT(*) FROM r WHERE rn = 1 GROUP BY status;
-- active 2266 · closed 1950 · default 30 · written_off 89   (4 335 customers)
```
Branches: 30 rows, all thirty SME. Latest loans: 89 customers' *most recent* loan was written off — but 188 customers have a written-off loan somewhere in their history, so **101 of them were lent to again after** a loan that went bad (self-join `loans` to `loans` on customer with a later `disbursed_at`). Bring that number to Nilufar; it is a scoring question, not a collections one.

</details>

**P9 — count.** How many rows does the top-3-per-branch query return?

```task
{"id": "w03d2-p2b", "kind": "number", "answer": 30, "dp": 0, "unit": "rows", "hint": "Ten branches, three rows each — if every branch has at least three loans.", "model": "30 rows: 10 branches × 3. All thirty are SME loans, so 'the biggest loans per branch' is really 'the SME book per branch'.", "xp": 1}
```

**P10.** *(duplicates)* Sevara's list, formatted: for each duplicate pair, one row with both payment ids, loan, instalment, date, amount, method — `MIN` and `MAX` of `payment_id` over the partition. Sorted by amount, largest first.

<details><summary>Answer</summary>

```sql
WITH d AS (SELECT payment_id, loan_id, installment_id, paid_at, amount, method,
                  COUNT(*)        OVER (PARTITION BY installment_id, paid_at, amount) AS cnt,
                  MIN(payment_id) OVER (PARTITION BY installment_id, paid_at, amount) AS first_id,
                  MAX(payment_id) OVER (PARTITION BY installment_id, paid_at, amount) AS second_id
           FROM payments)
SELECT DISTINCT first_id, second_id, loan_id, installment_id, paid_at, amount, method FROM d WHERE cnt > 1 ORDER BY amount DESC;
-- 25 rows; largest: loan 5106, instalment 59838, 2026-07-17, 12 410 700
-- (click), ids 34356 and 52857; then loan 1814 12 059 800 (11981/52858); loan
-- 3676 11 445 500 (24496/52863)
```
Aggregate windows over the duplicate partition; `DISTINCT` collapses the pair to one line — acceptable here because the two rows are identical by construction. (Thursday's performance habits warn against `DISTINCT` used to *hide* a join bug; this is not that.)

</details>

**P11.** *(duplicates — what is not a duplicate)* Payments of the same instalment on *different* days or with *different* amounts are not duplicates — they are partial payments. After removing the 25 duplicates, how many instalments have two or more distinct payments? (`COUNT(*) OVER (PARTITION BY installment_id)` on the de-duplicated set.)

<details><summary>Answer</summary>

```sql
WITH d AS (SELECT installment_id,
                  ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn
           FROM payments),
k AS (SELECT installment_id, COUNT(*) OVER (PARTITION BY installment_id) AS n FROM d WHERE rn = 1)
SELECT COUNT(DISTINCT installment_id) AS instalments_with_2plus FROM k WHERE n >= 2;
-- 0
```
On the `rn = 1` set `COUNT(*) OVER (PARTITION BY installment_id)` is 1 for every row: **no instalment has two distinct payments** — every instalment is paid in one go or not at all, and the only multi-payment instalments were the 25 duplicates. The partial payments week 2 found (427 unpaid instalments with *some* payment) are single payments smaller than `total_due`. Knowing the data has no split payments simplifies every later definition — say so in your notes.

</details>

**P11 — the number.** After removing the 25 duplicates, how many instalments have two or more distinct payments?

```task
{"id": "w03d2-p11", "kind": "number", "answer": 0, "dp": 0, "unit": "instalments", "hint": "COUNT(*) OVER (PARTITION BY installment_id) on the rows with rn = 1; count the instalments where it is 2 or more.", "model": "0. Every instalment is paid in one go or not at all; the only multi-payment instalments were the 25 duplicates. Week 2's 427 partly paid instalments are single payments smaller than total_due. So 'paid' never needs a SUM over several payments of one instalment in this data — write that in your notes.", "xp": 2}
```

**P12.** *(roll rates with LAG)* One month is one data point. Build the same matrix as section 1 for **1 August → 1 September 2026** (snapshot dates `'2026-08-01'` and `'2026-09-01'`, loans disbursed before 1 August). What share of 1–30 rolled to 31–60 this time?

<details><summary>Answer</summary>

```sql
WITH snaps(asof) AS (VALUES ('2026-08-01'), ('2026-09-01')),
unpaid AS (
  SELECT s.asof, i.loan_id, i.due_date
  FROM snaps s
  JOIN installments i ON i.due_date <= s.asof
  LEFT JOIN payments p ON p.installment_id = i.installment_id AND p.paid_at <= s.asof
  GROUP BY s.asof, i.installment_id, i.loan_id, i.due_date, i.total_due
  HAVING COALESCE(SUM(p.amount), 0) < i.total_due),
dpd AS (SELECT asof, loan_id, CAST(julianday(asof) - julianday(MIN(due_date)) AS INTEGER) AS dpd
        FROM unpaid GROUP BY asof, loan_id),
b AS (SELECT s.asof, l.loan_id,
             CASE WHEN COALESCE(d.dpd, 0) = 0 THEN '0' WHEN d.dpd <= 30 THEN '1-30' WHEN d.dpd <= 60 THEN '31-60'
                  WHEN d.dpd <= 90 THEN '61-90' ELSE '90+' END AS bucket
      FROM snaps s
      JOIN loans l ON l.disbursed_at < '2026-08-01'
      LEFT JOIN dpd d ON d.asof = s.asof AND d.loan_id = l.loan_id),
moves AS (SELECT asof, loan_id, bucket AS to_bucket, LAG(bucket) OVER (PARTITION BY loan_id ORDER BY asof) AS from_bucket FROM b)
SELECT from_bucket, to_bucket, COUNT(*) AS loans,
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY from_bucket), 1) AS pct_of_from
FROM moves WHERE asof = '2026-09-01' AND from_bucket <> '0'
GROUP BY from_bucket, to_bucket ORDER BY from_bucket, to_bucket;
-- 1-30 → 0 75 (74.3 %) · → 1-30 5 (5.0) · → 31-60 21 (20.8) | 31-60 → 0 16
-- (47.1) · → 1-30 1 · → 61-90 17 (50.0) | 61-90 → 90+ 16 | 90+ → 90+ 201
```
1–30 rolled forward at **20.8 %** (21 of 101) in August, 19.5 % in September: about one in five, stable. 31–60 is less stable — 50.0 % then 69.6 % — on 34 and 23 loans; small rows swing. Two months before you call any of these "the" roll rate.

</details>

> 🚀 **Stretch (optional, +5 XP).** A median without a median function — the portable trick with two windows.

**P13.** *(ROW_NUMBER + COUNT as a window)* Median principal per product with `ROW_NUMBER` and `COUNT(*) OVER` (pick the middle row(s)). Compare with the average — where do they differ most?

<details><summary>Answer</summary>

```sql
WITH r AS (SELECT p.code, l.principal,
                  ROW_NUMBER() OVER (PARTITION BY p.code ORDER BY l.principal) AS rn,
                  COUNT(*)     OVER (PARTITION BY p.code) AS n
           FROM loans l JOIN products p ON p.product_id = l.product_id)
SELECT code, n, AVG(principal) AS median FROM r WHERE rn IN ((n + 1) / 2, (n + 2) / 2) GROUP BY code;
-- AUTO median 214 840 000 (avg 216 858 133) · SME 314 770 000 (308 728 745) ·
-- CONS 26 965 000 (26 926 915) · MICRO 2 700 000 (2 705 586) · BNPL 4 180 000
-- (4 170 880)
```
Integer division picks one middle row for odd n and two for even. Median ≈ mean everywhere: ticket sizes are spread evenly between the product's min and max, no skew. (SQL Server has `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY principal) OVER (PARTITION BY code)`; SQLite does not — this is the portable way.)

</details>

---

## 4. Self-check

```check
{"id": "w03d2-sc", "questions": [
  {"type": "single", "q": "Three loans share the top principal. What do ROW_NUMBER, RANK and DENSE_RANK (ORDER BY principal DESC) give the fourth loan?", "options": ["4, 4, 2", "4, 2, 2", "2, 4, 4", "4, 4, 4"], "answer": 0, "explain": "ROW_NUMBER never repeats; RANK repeats then skips to 4; DENSE_RANK repeats and continues with 2 (→ section 1, RANK and DENSE_RANK)."},
  {"type": "single", "q": "LAST_VALUE(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at) returns each row's own date. What is the fix?", "options": ["Remove PARTITION BY", "Spell out ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING (or use FIRST_VALUE with ORDER BY … DESC)", "Use LAG instead", "Add ORDER BY paid_at at the end of the query"], "answer": 1, "explain": "With ORDER BY the default frame ends at the current row, so 'last' is the row itself (→ section 1, FIRST_VALUE and LAST_VALUE)."},
  {"type": "single", "q": "Finance says duplicates are impossible because payment_id is unique. Which window finds them anyway, and which row do you keep?", "options": ["ROW_NUMBER() OVER (PARTITION BY payment_id ORDER BY paid_at), keep rn = 2", "ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id), keep rn = 1", "RANK() OVER (ORDER BY amount), keep rank 1", "COUNT(*) OVER (), keep all"], "answer": 1, "explain": "Partition by what defines sameness, order by id, keep the earliest (→ section 1, Duplicates; section 2)."}]}
```

---

## 5. Company corner <span class="badge company">Roll rates</span>

A **roll rate** (*миграция между корзинами*) is the share of loans that moved from one DPD bucket to another between two snapshot dates — usually month-end to month-end. It is the collections team's report card (did 1–30 cure or roll to 31–60?) and the input to provisioning (a 90+ bucket is fed by what rolls out of 61–90). Section 1 built the matrix with `LAG` over stacked snapshots. Here is the other common way — the two snapshots side by side — and how to read the result. Three steps, two of them yesterday's tools:

**1. A snapshot per date.** Week 2's DPD block, with the as-of date as a *parameter* in two places — the instalment filter **and** the payment filter. The second was not needed on 2026-10-01 (the extract date), but on 2026-09-01 a payment made on 15 September must not count:

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

```game
{"type": "order", "id": "w03d2-g4", "title": "A roll-rate matrix, step by step", "items": ["DPD snapshot as of 1 September (as-of in the instalment filter and in the payment join)", "DPD snapshot as of 1 October, the same way", "FULL OUTER JOIN the two on loan_id, absent = DPD 0", "Bucket both sides with CASE", "Count loans per from-bucket × to-bucket", "Divide by the from-bucket total with SUM(COUNT(*)) OVER (PARTITION BY from_bucket)"], "why": "Each step is one CTE; the window at the end turns counts into roll and cure rates."}
```

> 🎯 **Interview version.** *"How do you compute roll rates?"* The interviewer listens for the two snapshots and where the as-of date goes, why the join must keep both sides, and how you turn counts into rates. Say it in the box below, then compare.

**Say it like in an interview.** Answer the question above in 3–5 sentences, as you would aloud, with one Nur Finance number.

```task
{"id": "w03d2-int", "kind": "free", "min": 30, "model": "I take a DPD snapshot per loan at two dates — at Nur Finance 1 September and 1 October 2026 — with the as-of date both in the instalment filter and in the payment join, so a payment made after the snapshot does not count. I bucket both snapshots with CASE and FULL OUTER JOIN them on loan, treating a missing side as DPD 0, because cured loans exist only in the first snapshot and new late loans only in the second. Then I count from-bucket × to-bucket and divide by the from-bucket total with a window, SUM(COUNT(*)) OVER (PARTITION BY from_bucket). I read roll-forward and cure per bucket — 19.5 % of 1–30 rolled to 31–60, 75.8 % cured — and report the inflow from current separately: 117 loans, 3.8 % of performing loans.", "rubric": ["Two DPD snapshots, as-of in both the instalment and the payment condition", "FULL OUTER JOIN (or equivalent) with absent = 0, and why", "Rates = counts divided by the from-bucket total (a window)", "Reads roll-forward and cure, and the inflow from current separately", "Quotes at least one real number"], "xp": 2}
```

Tomorrow: subqueries and CTE chains for real — the `WITH … AS` blocks you have been copying become yours — and Nilufar's vintage curves.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w03d2", "pass": 0.8, "questions": [
  {"type": "single", "q": "Three loans share the top principal; a fourth is next. What do ROW_NUMBER, RANK and DENSE_RANK (ORDER BY principal DESC) give the fourth loan?", "options": ["4, 4, 2", "4, 2, 2", "2, 4, 4", "4, 4, 4"], "answer": 0, "explain": "ROW_NUMBER never repeats; RANK gives ties one number and then skips; DENSE_RANK gives ties one number with no gap (→ section 1, RANK and DENSE_RANK)."},
  {"type": "single", "q": "You need exactly one row per customer: their latest loan. Which function, and which filter?", "options": ["RANK() … WHERE rk = 1", "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY disbursed_at DESC, loan_id DESC), keep rn = 1 in an outer query", "DENSE_RANK() … WHERE drk <= 1", "NTILE(1) OVER (PARTITION BY customer_id)"], "answer": 1, "explain": "ROW_NUMBER guarantees one row even on ties, the tiebreaker makes it repeatable, and the filter goes outside because windows do not exist in WHERE (→ section 1, Top-N per group; P9)."},
  {"type": "number", "q": "NTILE(4) over these 10 rows: how many rows land in group 1?", "code": "SELECT x, NTILE(4) OVER (ORDER BY x) AS g\nFROM t;      -- t has the 10 values 1, 2, …, 10", "answer": 3, "explain": "NTILE cuts into groups of almost equal count; the leftover rows go to the first groups: 3, 3, 2, 2 (→ section 1, NTILE; P4)."},
  {"type": "single", "q": "Why does last_payment show each row's own date?", "code": "SELECT paid_at,\n       LAST_VALUE(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at) AS last_payment\nFROM payments WHERE loan_id = 1;", "options": ["LAST_VALUE is broken in SQLite", "With ORDER BY, the default frame ends at the current row, so the 'last' row of the frame is the row itself", "PARTITION BY is wrong", "paid_at has duplicates"], "answer": 1, "explain": "Spell out ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING, or use FIRST_VALUE with ORDER BY … DESC (→ section 1, FIRST_VALUE and LAST_VALUE)."},
  {"type": "single", "q": "m holds monthly disbursement and the query computes yoy_pct with LAG(disbursed, 12). Someone moves the display filter WHERE month >= '2026-01' inside m. What happens?", "code": "WITH m AS (SELECT strftime('%Y-%m', disbursed_at) AS month, SUM(principal) AS disbursed\n           FROM loans\n           WHERE disbursed_at >= '2026-01-01' AND disbursed_at < '2026-10-01'\n           GROUP BY 1)\nSELECT month, disbursed, LAG(disbursed, 12) OVER (ORDER BY month) AS same_month_last_year\nFROM m;", "options": ["Nothing changes", "2025 is gone before the window runs, so every year-on-year value is NULL", "The query fails", "LAG reads 2025 from the loans table anyway"], "answer": 1, "explain": "Filter the display in an outer query; the window can only look back at rows that reached it (→ section 1, LAG and LEAD; P5)."},
  {"type": "single", "q": "To clean duplicate payments you number rows with ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id). Why not just GROUP BY … HAVING COUNT(*) > 1?", "options": ["HAVING is slower", "HAVING finds the duplicate groups but cannot say which row to keep or return the clean rows alongside; the window does both", "GROUP BY cannot take three columns", "They give different duplicate groups"], "answer": 1, "explain": "Keep rn = 1 (the earliest payment_id) as a view; never DELETE from the raw table (→ section 1, Duplicates; section 2, step 2)."},
  {"type": "multi", "q": "You build a DPD snapshot as of 2026-09-01 from data extracted on 2026-10-01. Where must the as-of date appear?", "options": ["In the instalment filter: due_date <= '2026-09-01'", "In the payment join: p.paid_at <= '2026-09-01' (in ON)", "In a filter on loans.disbursed_at = '2026-09-01'", "Nowhere — DPD always uses today"], "answer": [0, 1], "explain": "A payment made on 15 September must not count on 1 September, and in a LEFT JOIN the payment condition belongs in ON (→ section 1, Roll rates with LAG; section 5)."},
  {"type": "single", "q": "To build the roll-rate matrix you join the September and October DPD snapshots with a FULL OUTER JOIN. Why not an INNER JOIN?", "options": ["INNER JOIN is not allowed between CTEs", "A loan that cured is only in September and a newly late loan only in October; an inner join drops both", "FULL OUTER JOIN is faster", "To count loans twice"], "answer": 1, "explain": "Neither side may lose rows; absent = DPD 0 with COALESCE (→ section 5, Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w03d2", "sql": true, "q": "Bekzod wants to know how long a borrower waits before taking a second loan. For every customer_id with at least two loans, take the days between the first and the second disbursement (order a customer's loans by disbursed_at, ties by loan_id). What is the average, in days to 1 decimal?", "type": "number", "dp": 1, "h": ["ad0c61c8480db949d5a40239"], "hint": "Number each customer's loans and read the previous row — then keep exactly one row per customer.", "sol": "V0lUSCByIEFTICgKICBTRUxFQ1QgY3VzdG9tZXJfaWQsIGxvYW5faWQsIGRpc2J1cnNlZF9hdCwKICAgICAgICAgUk9XX05VTUJFUigpIE9WRVIgKFBBUlRJVElPTiBCWSBjdXN0b21lcl9pZCBPUkRFUiBCWSBkaXNidXJzZWRfYXQsIGxvYW5faWQpIEFTIHJuLAogICAgICAgICBMQUcoZGlzYnVyc2VkX2F0KSBPVkVSIChQQVJUSVRJT04gQlkgY3VzdG9tZXJfaWQgT1JERVIgQlkgZGlzYnVyc2VkX2F0LCBsb2FuX2lkKSBBUyBwcmV2X2Rpc2J1cnNlZAogIEZST00gbG9hbnMpClNFTEVDVCBDT1VOVCgqKSBBUyBjdXN0b21lcnMsCiAgICAgICBST1VORChBVkcoanVsaWFuZGF5KGRpc2J1cnNlZF9hdCkgLSBqdWxpYW5kYXkocHJldl9kaXNidXJzZWQpKSwgMSkgQVMgYXZnX2RheXMKRlJPTSByCldIRVJFIHJuID0gMjsKLS0gU1FMIFNlcnZlcjogQVZHKENBU1QoREFURURJRkYoZGF5LCBwcmV2X2Rpc2J1cnNlZCwgZGlzYnVyc2VkX2F0KSBBUyBGTE9BVCkpIOKAlCBEQVRFRElGRiByZXR1cm5zIGFuIGludGVnZXIgYW5kIEFWRyBvZiBpbnRlZ2VycyB0cnVuY2F0ZXMKLS0gMiAyNDYgY3VzdG9tZXJzLCAxOTguMyBkYXlzCktlZXBpbmcgZXZlcnkgcm4gPj0gMiAoYWxsIGdhcHMgYmV0d2VlbiBjb25zZWN1dGl2ZSBsb2FucykgZ2l2ZXMgMTg2Ljkg4oCUIGEgZGlmZmVyZW50IHF1ZXN0aW9uLiBBYm91dCBzaXggYW5kIGEgaGFsZiBtb250aHMgZnJvbSB0aGUgZmlyc3QgbG9hbiB0byB0aGUgc2Vjb25kOiBzaG9ydCBNaWNybyBhbmQgQk5QTCBsb2FucyBjbG9zZSBmYXN0IGFuZCB0aGUgYm9ycm93ZXIgY29tZXMgYmFjay4gV2VlayAxJ3MgZHVwbGljYXRlIHJvd3Mgc3BsaXQgYSBmZXcgcGVvcGxlJ3MgaGlzdG9yaWVzIGFjcm9zcyB0d28gaWRzLCBzbyBjYWxsIGl0ICJwZXIgY3VzdG9tZXIgaWQiLCBub3QgInBlciBwZXJzb24iLg=="}
```

<!-- challenge:end -->
