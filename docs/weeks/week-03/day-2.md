# Week 3 · Day 2 — Ranking and looking sideways: ROW_NUMBER, LAG and the duplicate payments

<span class="badge">Learn 60 min</span> <span class="badge">Detective 30 min</span> <span class="badge">Practice 50 min</span> <span class="badge company">Company corner</span>

> STORY **Tuesday, 9:05.** Sevara arrives with a printed bank statement and two highlighter colours. *"Collections says we received money **twice** for some instalments — same day, same amount, same instalment. Finance says impossible, the system has unique payment IDs. I need the list, not an opinion. And while you look: for every late loan, I want to know whether it got **worse or better** since last month — Nilufar calls it roll rates and I call it 'did they pay'."* Madina: *"Also Bekzod wants the three biggest loans per product and each month against the month before. Same tools, as it happens."*

## Today in 3 lines

- **Ranking windows:** `ROW_NUMBER` (unique 1, 2, 3 …), `RANK` (ties share a number, then a gap), `DENSE_RANK` (ties, no gap), `NTILE(n)` (equal-sized groups) — and *top-N per group* with `PARTITION BY`.
- **Value windows:** `LAG`/`LEAD` read the previous/next row (difference from last month), `FIRST_VALUE`/`LAST_VALUE` read the edges of the partition (with the frame trap).
- You have found the **duplicate payments** (and know exactly how many there are) with `ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount)`, written a de-duplicated query without deleting anything, and produced the **roll-rate matrix** September → October.

---

## 1. Learn — numbering rows and reading neighbours

### Ranking: four functions, one difference

All four take `OVER (ORDER BY …)` — the `ORDER BY` *inside* the brackets decides what "first" means. `PARTITION BY` restarts the numbering per group.

```sql
SELECT p.code, l.term_months, COUNT(*) AS loans,
       ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS rn,
       RANK()       OVER (ORDER BY COUNT(*) DESC) AS rk,
       DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) AS drk
FROM loans l JOIN products p ON p.product_id = l.product_id
GROUP BY p.code, l.term_months ORDER BY loans DESC;
-- MICRO 3 → 1335 loans, rn 1 rk 1 drk 1 · MICRO 6 → 1334, 2 2 2 · CONS 6 → 631, 3 3 3 … no ties here, so all three agree
```

They differ only on **ties** (*равные значения*). Rank loans by principal inside BNPL: four loans share the top amount 7 990 000. `ROW_NUMBER` gives them 1, 2, 3, 4 (in whatever order — add a tiebreaker like `, loan_id` to make it repeatable); `RANK` gives 1, 1, 1, 1 and the next loan **5**; `DENSE_RANK` gives 1, 1, 1, 1 and the next **2**. Rule of thumb: `ROW_NUMBER` when you need exactly one row per group (deduplication, "the latest loan per customer"); `RANK` for sports-style leaderboards; `DENSE_RANK` when you want "the top 3 *values*" even if more than three rows share them.

**`NTILE(n)`** cuts the ordered rows into n groups of (almost) equal **count** — quartiles, deciles:

```sql
WITH c AS (SELECT l.customer_id, SUM(i.principal_due) AS outstanding
           FROM installments i JOIN loans l ON l.loan_id = i.loan_id WHERE i.due_date > '2026-10-01' GROUP BY l.customer_id),
q AS (SELECT customer_id, outstanding, NTILE(4) OVER (ORDER BY outstanding DESC) AS quartile FROM c)
SELECT quartile, COUNT(*) AS borrowers, SUM(outstanding) AS outstanding,
       ROUND(100.0 * SUM(outstanding) / SUM(SUM(outstanding)) OVER (), 1) AS share_pct, MIN(outstanding), MAX(outstanding)
FROM q GROUP BY quartile;
-- 1 · 634 · 172 574 767 663 · 82.7 % · 99 696 411 … 977 697 006
-- 2 · 634 ·  28 293 321 289 · 13.6 % · 20 334 600 … 99 426 707
-- 3 · 634 ·   6 745 172 423 ·  3.2 %
-- 4 · 633 ·   1 110 243 055 ·  0.5 % · 68 300 … 3 899 741
```

Equal *count* per group, very unequal *money*: the top quarter of borrowers holds 83 % of the book. `PERCENT_RANK()` is the continuous version — a row's position as 0…1 (`CUME_DIST()` the share of rows at or below it); you will meet it in week 6 as a percentile. Lightly: `ROUND(PERCENT_RANK() OVER (PARTITION BY product_id ORDER BY principal), 3)` puts the largest SME loan (2861, 599 060 000) at 1.000 and the third largest at 0.997.

### Top-N per group

The pattern you will write most often in your career: number the rows inside each group, then keep the small numbers. The filter has to be *outside* (windows do not exist in `WHERE`):

```sql
WITH r AS (
  SELECT l.loan_id, p.code, l.principal, l.disbursed_at,
         ROW_NUMBER() OVER (PARTITION BY p.code ORDER BY l.principal DESC, l.loan_id) AS rn
  FROM loans l JOIN products p ON p.product_id = l.product_id)
SELECT * FROM r WHERE rn <= 3 ORDER BY code, rn;
-- AUTO 1501 399 530 000 · 1271 399 470 000 · 3382 398 180 000 | SME 2861 599 060 000 · 4570 598 450 000 · 4601 597 540 000 | CONS 1464 49 990 000 … | 15 rows
```

Every product's top loans sit just under its `max_amount` (Auto 400 m, SME 600 m, Consumer 50 m): the limits bind. Change `rn <= 3` to `rn = 1` and you have **one row per group** — the latest loan per customer (`ORDER BY disbursed_at DESC`) gives 4 335 rows: 2 266 active, 1 950 closed, 30 default, 89 written off.

### LAG and LEAD — the previous and the next row

`LAG(col)` returns the value of `col` on the **previous** row of the window (by the window's `ORDER BY`); `LEAD(col)` the next. `LAG(col, 12)` looks twelve rows back — the same month last year. The first row has no previous row → `NULL`; a third argument gives a default: `LAG(col, 1, 0)`.

```sql
WITH m AS (SELECT strftime('%Y-%m', disbursed_at) AS month, SUM(principal) AS disbursed FROM loans WHERE disbursed_at < '2026-10-01' GROUP BY 1)
SELECT month, disbursed,
       LAG(disbursed) OVER (ORDER BY month)                                                   AS prev_month,
       disbursed - LAG(disbursed) OVER (ORDER BY month)                                       AS diff,
       ROUND(100.0 * (disbursed - LAG(disbursed) OVER (ORDER BY month)) / LAG(disbursed) OVER (ORDER BY month), 1) AS mom_pct,
       ROUND(100.0 * (disbursed - LAG(disbursed, 12) OVER (ORDER BY month)) / LAG(disbursed, 12) OVER (ORDER BY month), 1) AS yoy_pct
FROM m ORDER BY month;
-- 2026-02 11 893 850 000 · prev 17 452 370 000 · −5 558 520 000 · −31.8 % · yoy +20.0 %
-- 2026-03 19 657 410 000 · +65.3 % mom · 2026-08 22 290 210 000 · +7.7 % mom · +26.2 % yoy · 2026-09 17 015 490 000 · −23.7 % mom · +16.2 % yoy
```

**Trap:** filter the *display* in an outer query, not in the CTE's `WHERE` — `WHERE month >= '2026-01'` inside `m` removes 2025 from the window and every `yoy_pct` becomes NULL. February −32 % month-on-month and +20 % year-on-year in the same row is why both columns exist: the first is seasonality, the second is growth.

Per loan, `LAG` turns a list of payments into **gaps between payments**:

```sql
SELECT payment_id, paid_at,
       LAG(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at, payment_id) AS prev_paid,
       CAST(julianday(paid_at) - julianday(LAG(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at, payment_id)) AS INTEGER) AS gap_days   -- DATEDIFF(day, LAG(...), paid_at)
FROM payments WHERE loan_id = 1 ORDER BY paid_at;
-- gaps 31, 29, 29, 31, 35, 26, 34, 29, 32, 29, then 58 (2026-02-26 → 2026-04-25), 17, 14, 32 …
```

The 58-day gap is March's missed instalment, the 17 and 14 the catch-up — the same story as yesterday's running total, now as a number per row. Over all 45 439 consecutive pairs the average gap is 30.9 days, 1 435 gaps exceed 45 days and the longest is 408; **63 gaps are 0 days** — two payments on the same day for one loan. Some of those are today's detective case.

### FIRST_VALUE, LAST_VALUE and the frame trap

`FIRST_VALUE(col) OVER (PARTITION BY … ORDER BY …)` is the first row's value, written on every row. `LAST_VALUE` *should* be the last row's — but with `ORDER BY` the default frame ends at the **current row**, so `LAST_VALUE` returns the current row's value, which looks like a bug and is not:

```sql
SELECT paid_at,
       FIRST_VALUE(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at) AS first_payment,
       LAST_VALUE(paid_at)  OVER (PARTITION BY loan_id ORDER BY paid_at) AS last_wrong,          -- = paid_at on every row
       LAST_VALUE(paid_at)  OVER (PARTITION BY loan_id ORDER BY paid_at
                                  ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_payment
FROM payments WHERE loan_id = 1;
-- first 2025-04-27 · last_wrong = the row's own date · last_payment 2026-09-26
```

Fix: spell out the frame, or use `FIRST_VALUE` with the reversed `ORDER BY … DESC`. `LEAD` on the schedule (`LEAD(due_date) OVER (PARTITION BY loan_id ORDER BY installment_no)`) checks that every instalment is one month after the previous — the week-2 P11 month-end artefacts show up here too.

### Depth (optional)

- ▶ Baraa, *Window ranking* [10:53:09](https://youtu.be/SSKVgrwhzus?t=39189&end=42965), *Window value* [11:56:05](https://youtu.be/SSKVgrwhzus?t=42965&end=45634) — ~2 h.
- RU deck `2.3 SQL.pdf` — ranking and offset functions. *Russian terms:* ранжирование = ranking, функции смещения = offset functions (LAG/LEAD), дубликаты = duplicates.

---

## 2. Detective — the money received twice (30 min)

Sevara's claim: *same instalment, same day, same amount, two payment rows.* Finance's defence: *payment_id is unique.* Both are true — a duplicate is not two identical rows, it is two rows that **agree on everything that matters**. Number the rows inside each (instalment, date, amount) group and anything numbered 2 is a repeat:

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

**The de-duplicated query.** Never `DELETE` from the course tables (or from a production table on your own authority): the de-duplicated *view* is the deliverable, the raw table stays as evidence. Keep `rn = 1` — the earliest `payment_id` in each group:

```sql
WITH d AS (
  SELECT payment_id, loan_id, installment_id, paid_at, amount,
         REPLACE(LOWER(TRIM(method)), 'bank transfer', 'transfer') AS method,      -- week 2's cleaning, in the same pass
         ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn
  FROM payments)
SELECT payment_id, loan_id, installment_id, paid_at, amount, method FROM d WHERE rn = 1;
-- 52 850 rows · 255 114 772 176 UZS (raw: 52 875 · 255 173 169 976) · 5 methods
```

<details><summary>Does it change anything downstream?</summary>
Rerun week 2's DPD block with this result in place of `payments`: still 1 784 unpaid matured instalments, still 14 / 124 / 25 / 16 / 234. Duplicates *add* money to instalments that were already paid, so DPD and the buckets do not move — but "collected in 2026" is overstated by the 2026 duplicates, 25 instalments show as overpaid, and any "collection rate" built on raw payments is slightly too good. Memo line for Sevara and Finance: *25 payments (ids 52851–52875) are exact repeats of earlier rows — same instalment, date and amount — appended as one batch; 58.4 m UZS double-counted in collections, no effect on delinquency; recommend a unique constraint on (installment_id, paid_at, amount) at load, and `v_payments_clean` (Thursday) for all reporting.*
</details>

Why `ROW_NUMBER` and not `GROUP BY … HAVING COUNT(*) > 1` (week 2's T21)? `HAVING` *finds* the groups; it cannot tell you *which row to keep*, and it cannot return the non-duplicate rows alongside. The window does both in one pass.

---

## 3. Practice (50 min)

Write each query in the box under its question — it is saved in this browser. **✔ Check** tells you whether your result matches the answer.

**P1.** Branches ranked by outstanding with `ROW_NUMBER`, `RANK` and `DENSE_RANK`. Why do all three agree here, and what would make them differ?

<details><summary>Answer</summary>
Yesterday's branch CTE plus the three functions over `ORDER BY outstanding DESC`: Tashkent Central 1/1/1 … Termez 10/10/10. No two branches have the same outstanding to the som, so there are no ties. Rank by *number of loans* within the Tashkent region instead and still no tie (1012 / 1007 / 1001) — ties appear on coarse values: grade, term, rounded amounts. 17 loans share the principal 4 880 000.
</details>

**P2.** The three biggest loans per product (loan, principal, disbursed). Then the three biggest *per branch* — how many rows?

<details><summary>Answer</summary>
The top-N pattern from section 1: 15 rows for products. For branches `PARTITION BY b.branch_name` → 30 rows; the largest in every branch is an SME loan between 570 m and 599 m. Add `, l.loan_id` to the `ORDER BY` so a rerun gives the same rows.
</details>

**P3.** The **latest loan of every customer**, and the status mix of those latest loans. What does "89 written off" mean here that `loans.status` alone did not say?

<details><summary>Answer</summary>

```sql
WITH r AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY disbursed_at DESC, loan_id DESC) AS rn FROM loans)
SELECT status, COUNT(*) FROM r WHERE rn = 1 GROUP BY status;
-- active 2266 · closed 1950 · default 30 · written_off 89   (4 335 customers)
```
89 customers' *most recent* loan was written off — but 188 customers have a written-off loan somewhere in their history, so **101 of them were lent to again after** a loan that went bad (self-join `loans` to `loans` on customer with a later `disbursed_at`). Bring that number to Nilufar; it is a scoring question, not a collections one.
</details>

**P4.** Monthly disbursement with month-on-month and year-on-year change for 2026-01..2026-09 (the display filtered *outside* the window). Which month fell most against the previous one and still grew year-on-year?

<details><summary>Answer</summary>
Section 1's `LAG` query wrapped: `SELECT * FROM (...) WHERE month >= '2026-01'`. February: −31.8 % month-on-month, **+20.0 %** year-on-year. September: −23.7 % / +16.2 %. Both columns on every slide that shows a monthly series.
</details>

**P5.** Per instalment of loan 1, the previous instalment's due date and the number of days between them (`LAG` on the schedule). Then over **all** loans: how many consecutive instalments are more than 31 days apart?

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM (
  SELECT loan_id, installment_no, due_date,
         julianday(due_date) - julianday(LAG(due_date) OVER (PARTITION BY loan_id ORDER BY installment_no)) AS gap
  FROM installments) WHERE gap > 31;
```
Loan 1: 30, 31, 30, 31, 31, 30, 31, 30, 31, 31, **28** (28 Jan → 28 Feb), 31 … — month lengths, 28 to 31. Over all schedules no gap exceeds 31 — the schedule generator is monthly to the day; a gap of 32+ would mean a skipped instalment number.
</details>

**P6.** Gaps between consecutive **payments** per loan: the average gap, the longest, how many exceed 60 days, and how many are exactly 0. Which of those four is tonight's detective number?

<details><summary>Answer</summary>
`AVG` 30.9 days · `MAX` 408 · 492 gaps > 60 · **63 gaps = 0**. The 63 same-day pairs contain the 25 duplicates plus 38 legitimate pairs (a borrower paying two instalments on one day — different `installment_id`). "Same day" is a clue, not the definition; the definition is the three-column partition.
</details>

**P7.** Median principal per product with `ROW_NUMBER` and `COUNT(*) OVER` (pick the middle row(s)). Compare with the average — where do they differ most?

<details><summary>Answer</summary>

```sql
WITH r AS (SELECT p.code, l.principal,
                  ROW_NUMBER() OVER (PARTITION BY p.code ORDER BY l.principal) AS rn,
                  COUNT(*)     OVER (PARTITION BY p.code) AS n
           FROM loans l JOIN products p ON p.product_id = l.product_id)
SELECT code, n, AVG(principal) AS median FROM r WHERE rn IN ((n + 1) / 2, (n + 2) / 2) GROUP BY code;
-- AUTO median 214 840 000 (avg 216 858 133) · SME 314 770 000 (308 728 745) · CONS 26 965 000 (26 926 915) · MICRO 2 700 000 (2 705 586) · BNPL 4 180 000 (4 170 880)
```
Integer division picks one middle row for odd n and two for even. Median ≈ mean everywhere: ticket sizes are spread evenly between the product's min and max, no skew. (SQL Server has `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY principal) OVER (PARTITION BY code)`; SQLite does not — this is the portable way.)
</details>

**P8.** Rank collectors by promises obtained (`outcome = 'promise_to_pay'`) with `RANK`; show actions, promises and promise rate for the top five.

<details><summary>Answer</summary>

```sql
SELECT collector_id, COUNT(*) AS actions, SUM(CASE WHEN outcome = 'promise_to_pay' THEN 1 ELSE 0 END) AS promises,
       RANK() OVER (ORDER BY SUM(CASE WHEN outcome = 'promise_to_pay' THEN 1 ELSE 0 END) DESC) AS rk
FROM collections_actions GROUP BY collector_id ORDER BY rk LIMIT 5;
-- 29 → 568 actions / 182 promises · 28 → 593 / 177 · 27 → 590 / 170 · 57 → 419 / 125 · 7 → 393 / 121
```
A window over an aggregate with `CASE` inside — three layers, still one query. Ranking by *count* rewards the busiest collector; add `100.0 * promises / actions` and rank by that too before anyone gets a bonus.
</details>

**P9.** Customer quartiles by outstanding (`NTILE(4)`) with count, money and share — then deciles. How much does the top 10 % hold?

<details><summary>Answer</summary>
Section 1 gives quartiles 82.7 / 13.6 / 3.2 / 0.5 %. `NTILE(10)`: the first decile (254 borrowers) holds **49.2 %** of the book, the second 25.9 % — three quarters of the outstanding in a fifth of the borrowers. A decile table is the standard "who are our customers by exposure" slide; quote the borrower count with every share.
</details>

**P10.** Sevara's list, formatted: for each duplicate pair, one row with both payment ids, loan, instalment, date, amount, method — `MIN` and `MAX` of `payment_id` over the partition. Sorted by amount, largest first.

<details><summary>Answer</summary>

```sql
WITH d AS (SELECT payment_id, loan_id, installment_id, paid_at, amount, method,
                  COUNT(*)        OVER (PARTITION BY installment_id, paid_at, amount) AS cnt,
                  MIN(payment_id) OVER (PARTITION BY installment_id, paid_at, amount) AS first_id,
                  MAX(payment_id) OVER (PARTITION BY installment_id, paid_at, amount) AS second_id
           FROM payments)
SELECT DISTINCT first_id, second_id, loan_id, installment_id, paid_at, amount, method FROM d WHERE cnt > 1 ORDER BY amount DESC;
-- 25 rows; largest: loan 5106, instalment 59838, 2026-07-17, 12 410 700 (click), ids 34356 and 52857; then loan 1814 12 059 800 (11981/52858); loan 3676 11 445 500 (24496/52863)
```
Aggregate windows over the duplicate partition; `DISTINCT` collapses the pair to one line — acceptable here because the two rows are identical by construction. (Thursday's performance habits warn against `DISTINCT` used to *hide* a join bug; this is not that.)
</details>

<span class="badge stretch">Stretch</span> **P11.** Payments of the same instalment on *different* days or with *different* amounts are not duplicates — they are partial payments. How many instalments have two or more distinct payments, and what share of them end up fully paid? (`COUNT(*) OVER (PARTITION BY installment_id)` on the de-duplicated set.)

<details><summary>Answer</summary>
On the `rn = 1` set `COUNT(*) OVER (PARTITION BY installment_id)` is 1 for every row: **no instalment has two distinct payments** — every instalment is paid in one go or not at all, and the only multi-payment instalments were the 25 duplicates. The partial payments week 2 found (427 unpaid instalments with *some* payment) are single payments smaller than `total_due`. Knowing the data has no split payments simplifies every later definition — say so in your notes.
</details>

---

## 4. Self-check

1. Three loans share the top principal. What do `ROW_NUMBER`, `RANK` and `DENSE_RANK` give the fourth loan? *(→ section 1, "Ranking")*
2. `LAST_VALUE(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at)` returns the current row's date. Why, and what is the fix? *(→ section 1, "FIRST_VALUE, LAST_VALUE")*
3. Finance says duplicates are impossible because `payment_id` is unique. Write the partition that finds them anyway, and say which row you keep. *(→ section 2)*

---

## 5. Company corner <span class="badge company">Roll rates</span>

A **roll rate** (*миграция между корзинами*) is the share of loans that moved from one DPD bucket to another between two snapshot dates — usually month-end to month-end. It is the collections team's report card (did 1–30 cure or roll to 31–60?) and the input to provisioning (a 90+ bucket is fed by what rolls out of 61–90). Three steps, two of them yesterday's tools:

**1. A snapshot per date.** Week 2's DPD block, with the as-of date as a *parameter* in two places — the instalment filter **and** the payment filter. The second was not needed on 2026-10-01 (the extract date), but on 2026-09-01 a payment made on 15 September must not count:

```sql
WITH u0 AS (                                            -- unpaid matured instalments as of 2026-09-01
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

> Interview version: *"How do you compute roll rates?"* — DPD snapshot per loan at two dates (as-of in the instalment filter *and* the payment filter), bucket both with CASE, FULL OUTER JOIN on loan with absent = 0, count from-bucket × to-bucket, divide by the from-bucket row total with a window; read roll-forward and cure per bucket; report the inflow from current separately.

Tomorrow: subqueries and CTE chains for real — the `WITH … AS` blocks you have been copying become yours — and Nilufar's vintage curves.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w03d2", "pass": 0.8, "questions": [
  {"type": "single", "q": "Three loans share the top principal; a fourth is next. What do ROW_NUMBER, RANK and DENSE_RANK (ORDER BY principal DESC) give the fourth loan?", "options": ["4, 4, 2", "4, 2, 2", "2, 4, 4", "4, 4, 4"], "answer": 0, "explain": "ROW_NUMBER never repeats; RANK gives ties one number and then skips; DENSE_RANK gives ties one number with no gap (→ section 1, Ranking)."},
  {"type": "single", "q": "You need exactly one row per customer: their latest loan. Which function, and which filter?", "options": ["RANK() … WHERE rk = 1", "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY disbursed_at DESC, loan_id DESC), keep rn = 1 in an outer query", "DENSE_RANK() … WHERE drk <= 1", "NTILE(1) OVER (PARTITION BY customer_id)"], "answer": 1, "explain": "ROW_NUMBER guarantees one row even on ties, the tiebreaker makes it repeatable, and the filter goes outside because windows do not exist in WHERE (→ section 1, Top-N per group; P3)."},
  {"type": "number", "q": "NTILE(4) over these 10 rows: how many rows land in group 1?", "code": "SELECT x, NTILE(4) OVER (ORDER BY x) AS g\nFROM t;      -- t has the 10 values 1, 2, …, 10", "answer": 3, "explain": "NTILE cuts into groups of almost equal count; the leftover rows go to the first groups: 3, 3, 2, 2 (→ section 1, NTILE)."},
  {"type": "single", "q": "Why does last_payment show each row's own date?", "code": "SELECT paid_at,\n       LAST_VALUE(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at) AS last_payment\nFROM payments WHERE loan_id = 1;", "options": ["LAST_VALUE is broken in SQLite", "With ORDER BY, the default frame ends at the current row, so the 'last' row of the frame is the row itself", "PARTITION BY is wrong", "paid_at has duplicates"], "answer": 1, "explain": "Spell out ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING, or use FIRST_VALUE with ORDER BY … DESC (→ section 1, FIRST_VALUE, LAST_VALUE and the frame trap)."},
  {"type": "single", "q": "m holds monthly disbursement and the query computes yoy_pct with LAG(disbursed, 12). Someone moves the display filter WHERE month >= '2026-01' inside m. What happens?", "code": "WITH m AS (SELECT strftime('%Y-%m', disbursed_at) AS month, SUM(principal) AS disbursed\n           FROM loans\n           WHERE disbursed_at >= '2026-01-01' AND disbursed_at < '2026-10-01'\n           GROUP BY 1)\nSELECT month, disbursed, LAG(disbursed, 12) OVER (ORDER BY month) AS same_month_last_year\nFROM m;", "options": ["Nothing changes", "2025 is gone before the window runs, so every year-on-year value is NULL", "The query fails", "LAG reads 2025 from the loans table anyway"], "answer": 1, "explain": "Filter the display in an outer query; the window can only look back at rows that reached it (→ section 1, LAG and LEAD)."},
  {"type": "single", "q": "To clean duplicate payments you number rows with ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id). Why not just GROUP BY … HAVING COUNT(*) > 1?", "options": ["HAVING is slower", "HAVING finds the duplicate groups but cannot say which row to keep or return the clean rows alongside; the window does both", "GROUP BY cannot take three columns", "They give different duplicate groups"], "answer": 1, "explain": "Keep rn = 1 (the earliest payment_id) as a view; never DELETE from the raw table (→ section 2, Detective)."},
  {"type": "multi", "q": "You build a DPD snapshot as of 2026-09-01 from data extracted on 2026-10-01. Where must the as-of date appear?", "options": ["In the instalment filter: due_date <= '2026-09-01'", "In the payment join: p.paid_at <= '2026-09-01' (in ON)", "In a filter on loans.disbursed_at = '2026-09-01'", "Nowhere — DPD always uses today"], "answer": [0, 1], "explain": "A payment made on 15 September must not count on 1 September, and in a LEFT JOIN the payment condition belongs in ON (→ section 5, Company corner)."},
  {"type": "single", "q": "To build the roll-rate matrix you join the September and October DPD snapshots with a FULL OUTER JOIN. Why not an INNER JOIN?", "options": ["INNER JOIN is not allowed between CTEs", "A loan that cured is only in September and a newly late loan only in October; an inner join drops both", "FULL OUTER JOIN is faster", "To count loans twice"], "answer": 1, "explain": "Neither side may lose rows; absent = DPD 0 with COALESCE (→ section 5, Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w03d2", "q": "Bekzod wants to know how long a borrower waits before taking a second loan. For every customer_id with at least two loans, take the days between the first and the second disbursement (order a customer's loans by disbursed_at, ties by loan_id). What is the average, in days to 1 decimal?", "type": "number", "dp": 1, "h": ["ad0c61c8480db949d5a40239"], "hint": "Number each customer's loans and read the previous row — then keep exactly one row per customer.", "sol": "V0lUSCByIEFTICgKICBTRUxFQ1QgY3VzdG9tZXJfaWQsIGxvYW5faWQsIGRpc2J1cnNlZF9hdCwKICAgICAgICAgUk9XX05VTUJFUigpIE9WRVIgKFBBUlRJVElPTiBCWSBjdXN0b21lcl9pZCBPUkRFUiBCWSBkaXNidXJzZWRfYXQsIGxvYW5faWQpIEFTIHJuLAogICAgICAgICBMQUcoZGlzYnVyc2VkX2F0KSBPVkVSIChQQVJUSVRJT04gQlkgY3VzdG9tZXJfaWQgT1JERVIgQlkgZGlzYnVyc2VkX2F0LCBsb2FuX2lkKSBBUyBwcmV2X2Rpc2J1cnNlZAogIEZST00gbG9hbnMpClNFTEVDVCBDT1VOVCgqKSBBUyBjdXN0b21lcnMsCiAgICAgICBST1VORChBVkcoanVsaWFuZGF5KGRpc2J1cnNlZF9hdCkgLSBqdWxpYW5kYXkocHJldl9kaXNidXJzZWQpKSwgMSkgQVMgYXZnX2RheXMKRlJPTSByCldIRVJFIHJuID0gMjsKLS0gU1FMIFNlcnZlcjogQVZHKENBU1QoREFURURJRkYoZGF5LCBwcmV2X2Rpc2J1cnNlZCwgZGlzYnVyc2VkX2F0KSBBUyBGTE9BVCkpIOKAlCBEQVRFRElGRiByZXR1cm5zIGFuIGludGVnZXIgYW5kIEFWRyBvZiBpbnRlZ2VycyB0cnVuY2F0ZXMKLS0gMiAyNDYgY3VzdG9tZXJzLCAxOTguMyBkYXlzCktlZXBpbmcgZXZlcnkgcm4gPj0gMiAoYWxsIGdhcHMgYmV0d2VlbiBjb25zZWN1dGl2ZSBsb2FucykgZ2l2ZXMgMTg2Ljkg4oCUIGEgZGlmZmVyZW50IHF1ZXN0aW9uLiBBYm91dCBzaXggYW5kIGEgaGFsZiBtb250aHMgZnJvbSB0aGUgZmlyc3QgbG9hbiB0byB0aGUgc2Vjb25kOiBzaG9ydCBNaWNybyBhbmQgQk5QTCBsb2FucyBjbG9zZSBmYXN0IGFuZCB0aGUgYm9ycm93ZXIgY29tZXMgYmFjay4gV2VlayAxJ3MgZHVwbGljYXRlIHJvd3Mgc3BsaXQgYSBmZXcgcGVvcGxlJ3MgaGlzdG9yaWVzIGFjcm9zcyB0d28gaWRzLCBzbyBjYWxsIGl0ICJwZXIgY3VzdG9tZXIgaWQiLCBub3QgInBlciBwZXJzb24iLg=="}
```

<!-- challenge:end -->
