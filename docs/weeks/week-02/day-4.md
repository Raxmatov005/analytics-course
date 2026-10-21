# Week 2 · Day 4 — NULLs, CASE and the tricky joins

<span class="badge">Learn 60 min</span> <span class="badge">Practice 60 min</span> <span class="badge company">Company corner</span>

> STORY **Thursday, 9:20.** A new face: Nilufar, risk analyst (*риск-аналитик*), with a laptop open on a chart. *"I'm presenting FPD30 to the credit committee on Monday — by disbursement month and by channel. Timur's dashboard says the app channel is fine. My spreadsheet says it isn't. One of us is dividing by the wrong thing."* Madina: *"And while you're in there — Risk's average income by segment looks too high to me. Six percent of our customers have no income on file. Where did they go?"*

## Today in 3 lines

- You know the **NULL rules**: `= NULL` is never true, `IS NULL` is the test, `COUNT(col)` skips NULLs, `AVG` silently drops them; `COALESCE`, `ISNULL`|`IFNULL`, `NULLIF` for safe division.
- You can write **CASE** (searched and simple) for buckets and for **pivot-style `SUM(CASE …)`**, the **anti-join** (`LEFT JOIN … IS NULL`), a **self-join**, a join on **two columns**, and spot **duplicates** with `COUNT` vs `COUNT(DISTINCT)`.
- You have computed **FPD30 by vintage and channel** and can say which channel is worse, by how much, and under which definition.

---

## 1. Learn — the value that is not there

### NULL is not a value

**NULL** (*пустое значение*) means *unknown / not recorded*. It is not 0, not an empty string, and — the part that bites — it is not equal to anything, including itself. Any comparison with NULL gives *unknown*, and `WHERE` keeps only rows where the condition is *true*:

```sql
SELECT COUNT(*) FROM customers WHERE monthly_income = NULL;        -- 0, always; this is never true
SELECT COUNT(*) FROM customers WHERE monthly_income IS NULL;       -- 356
SELECT COUNT(*) FROM customers WHERE monthly_income <> 5000000;    -- 5684, not 6039: the 356 NULL rows fail the test too
```

The 356 missing incomes are 5.89 % of 6 040 customers. They leave *every* filter: `WHERE monthly_income > x` and `WHERE monthly_income <= x` together return 5 684 rows, not 6 040. When a report's groups do not add up to the total, look for a NULL.

### NULL in aggregates

| Expression | Result | Why |
|---|---|---|
| `COUNT(*)` | 6 040 | counts rows |
| `COUNT(monthly_income)` | 5 684 | counts non-NULL values |
| `COUNT(*) - COUNT(monthly_income)` | 356 | the missing — the standard way to count them |
| `AVG(monthly_income)` | 15 245 933 | **average of the 5 684 known values**; the 356 are dropped, not treated as 0 |
| `AVG(COALESCE(monthly_income, 0))` | 14 347 331 | average over all 6 040, missing counted as 0 — usually wrong, but explicit |
| `SUM(monthly_income)` | sum of the known | NULLs ignored; `SUM` of only NULLs is NULL, not 0 |

Madina's suspicion: nothing is wrong with `AVG` — it does exactly what it says — but a slide reading "average income 15.2 m" without "(of 94 % with income on file)" is incomplete. **Always report the count next to the average**, and check whether the missing are random or concentrated. Here, by segment the gap is flat (affluent 6.0 %, mass 5.8 %, sme 6.1 %); by region it ranges from Termez 4.6 % to **Bukhara 7.6 %**; by `income_source` from business 4.7 % to **self-employed 7.0 %** — plausibly real (self-employed people have no payslip), and a note for the memo rather than a bug.

The same on `applications.credit_score`: 388 of 14 000 (2.77 %) have no score; app 2.64 %, branch 2.80 %, partner 2.96 %. Those 388 were approved at **59.0 %** vs 61.5 % for scored applications, and 213 of them became loans — so "approval rate by score band" needs a *no score* band or it silently loses 2.8 % of the base.

### COALESCE, ISNULL / IFNULL, NULLIF

- **`COALESCE(a, b, c, …)`** returns the first non-NULL argument. Standard, both engines. `COALESCE(SUM(p.amount), 0)` — yesterday's DPD query — turns "no payments" into 0 so that `0 < total_due` can be true. `COALESCE(CAST(monthly_income AS TEXT), 'unknown')` labels the gap in a list.
- **`ISNULL(a, b)`** (SQL Server) and **`IFNULL(a, b)`** (SQLite): two-argument versions of the same. Prefer `COALESCE`; it travels.
- **`NULLIF(a, b)`** returns NULL when `a = b`, else `a`. Its one job: **safe division**. `x / NULLIF(y, 0)` gives NULL instead of a "division by zero" error when a group has nothing to divide by:

```sql
SELECT b.branch_name, COUNT(*) AS applications,
       ROUND(100.0 * SUM(CASE WHEN a.status LIKE 'approved%' THEN 1 ELSE 0 END)
                   / NULLIF(SUM(CASE WHEN a.status <> 'cancelled' THEN 1 ELSE 0 END), 0), 1) AS approval_decided_pct
FROM applications a JOIN branches b ON b.branch_id = a.branch_id
GROUP BY b.branch_name ORDER BY approval_decided_pct DESC;      -- Fergana Central 72.8 … Nukus Central 68.5
```

No branch has zero decided applications today; the day one does, the report still runs.

### CASE — a value that depends on a condition

**Searched CASE** tests conditions in order and returns the first match (the `ELSE` is what the rest get; without it they get NULL):

```sql
SELECT CASE WHEN monthly_income IS NULL      THEN 'unknown'
            WHEN monthly_income <  5000000   THEN '<5m'
            WHEN monthly_income < 10000000   THEN '5-10m'
            WHEN monthly_income < 20000000   THEN '10-20m'
            ELSE '20m+' END AS income_band,
       COUNT(*) AS customers
FROM customers GROUP BY income_band;        -- SQL Server: repeat the whole CASE in GROUP BY (no alias, no GROUP BY 1)
-- unknown 356 · <5m 1281 · 5-10m 2198 · 10-20m 576 · 20m+ 1629
```

Put the NULL test **first**: `NULL < 5000000` is unknown, so without it the 356 would fall into `ELSE '20m+'` — the richest band, for the people whose income we do not know. Yesterday's DPD buckets were the same shape.

**Simple CASE** compares one expression with values — a lookup: `CASE channel WHEN 'app' THEN 'Mobile app' WHEN 'branch' THEN 'Branch office' ELSE 'Partner shop' END`.

**Pivot with `SUM(CASE …)`.** `CASE` inside an aggregate counts or sums *conditionally* — one column per condition, which turns Tuesday's long table wide:

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

`SUM(CASE WHEN cond THEN 1 ELSE 0 END)` = "count where cond"; `SUM(CASE WHEN cond THEN amount ELSE 0 END)` = "sum where cond"; `AVG(CASE WHEN cond THEN 1.0 ELSE 0 END)` = "share where cond". This spelling is portable; SQLite's `SUM(cond)` and SQL Server's `IIF` from Tuesday are shorthands for it.

### The tricky joins

**Anti-join** — now with the reason it works. `LEFT JOIN` fills the right side with NULL where nothing matched; `WHERE right.key IS NULL` keeps exactly those rows, because a key column can never be NULL on a *matched* row.

```sql
SELECT COUNT(*) FROM customers c LEFT JOIN applications a ON a.customer_id = c.customer_id
WHERE a.application_id IS NULL;                                                             -- 587 never applied
SELECT a.status, COUNT(*) FROM applications a LEFT JOIN loans l ON l.application_id = a.application_id
WHERE l.loan_id IS NULL AND a.status LIKE 'approved%' GROUP BY a.status;                    -- approved 89 · approved_not_disbursed 678
```

**A condition in `ON` vs in `WHERE`** — the LEFT-JOIN mistake everyone makes once. A filter on the *right* table inside `WHERE` throws away the NULL rows and turns your LEFT JOIN back into an INNER. Put right-side filters in `ON`:

```sql
-- keeps all 54 207 matured instalments; payments after the as-of date simply do not match
FROM installments i LEFT JOIN payments p ON p.installment_id = i.installment_id AND p.paid_at <= '2026-10-01'
-- drops every instalment with no payment (52 851 rows): the WHERE test fails on NULL
FROM installments i LEFT JOIN payments p ON p.installment_id = i.installment_id WHERE p.paid_at <= '2026-10-01'
```

**Self-join** — a table joined to itself, with two aliases, to compare rows of the same table. Last week's duplicate hunt as a join: customers sharing a phone *and* a birth date:

```sql
SELECT a.customer_id, b.customer_id, a.first_name, b.first_name
FROM customers a JOIN customers b
  ON a.phone = b.phone AND a.birth_date = b.birth_date AND a.customer_id < b.customer_id;   -- 40 pairs
```

`a.customer_id < b.customer_id` keeps each pair once and never pairs a row with itself. Phone alone → 43 pairs (the three family numbers from week 1).

**Joining on two columns** — when the match needs more than one key: `ON a.x = b.x AND a.y = b.y`. Tables keyed by a composite (`loan_id, installment_no`) need it; so does any *consistency* check — `payments JOIN installments ON installment_id AND loan_id` returns 52 875 rows, the same as on `installment_id` alone, which proves that no payment points at an instalment of a *different* loan.

**Duplicates from joins, and real duplicates.** `COUNT(*)` next to `COUNT(DISTINCT key)` is the universal test. On `payments`: 52 875 rows, **52 850** distinct `installment_id` — 25 instalments carry two payments, and grouping by `(installment_id, paid_at, amount)` with `HAVING COUNT(*) > 1` shows 25 groups of *identical* rows: 58 397 800 UZS counted twice (removing them is week 3's de-duplication exercise). In a join, the same test tells you whether the join multiplied: 7 828 loans → 92 193 rows after `installments`; `COUNT(DISTINCT loan_id)` still 7 828.

### Depth (optional)

- ▶ Baraa, *NULL functions* [6:59:06](https://youtu.be/SSKVgrwhzus?t=25146) — 50 min; *CASE* [8:07:50](https://youtu.be/SSKVgrwhzus?t=29270) — 35 min; *Joins (advanced)* [3:27:29](https://youtu.be/SSKVgrwhzus?t=12449) — anti-joins, self-joins, FULL.
- RU deck `2.2 SQL-1-38.pdf` — NULL / CASE pages. *Russian terms:* пустое значение = NULL, условное выражение = CASE, самосоединение = self-join, дубликаты = duplicates.

---

## 2. Worked example — the quarter-by-product pivot

**Ask (Bekzod, by email):** *2026 disbursements, products down, quarters across.*

1. Grain of the answer: one row per product; three measure columns. Source grain: `loans` — safe to sum.
2. Quarter boundaries as half-open date ranges, inside `SUM(CASE …)`.

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

3. Check: the fifteen cells sum to 162 333 060 000 — Tuesday's 2026 total. SME grows every quarter; Auto fell after Q1. That sentence is the analysis; the table is the evidence.

---

## 3. Practice (60 min)

File `week-02/day-4/practice.sql`.

**P1.** For `customers`: rows, rows with income, rows without, share without (one decimal) — in one query.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) AS rows_, COUNT(monthly_income) AS with_income, COUNT(*) - COUNT(monthly_income) AS missing,
       ROUND(100.0 * (COUNT(*) - COUNT(monthly_income)) / COUNT(*), 2) AS missing_pct
FROM customers;                                                        -- 6040 · 5684 · 356 · 5.89
```
</details>

**P2.** Average income by segment two ways: `AVG(monthly_income)` and `AVG(COALESCE(monthly_income, 0))`, with the count of missing per segment. Which column goes on Madina's slide?

<details><summary>Answer</summary>
affluent 24 961 730 vs 23 469 002 (72 missing of 1 204) · mass 5 771 515 vs 5 436 655 (208 of 3 585) · sme 33 115 571 vs 31 103 753 (76 of 1 251). The first, labelled "of customers with income on file (94 %)". Treating unknown as zero is a *decision*, and the wrong one for income.
</details>

**P3.** Share of applications without a credit score by channel and by status. Is the gap random?

<details><summary>Answer</summary>

```sql
SELECT channel, COUNT(*) AS apps, COUNT(*) - COUNT(credit_score) AS no_score,
       ROUND(100.0 * (COUNT(*) - COUNT(credit_score)) / COUNT(*), 2) AS no_score_pct
FROM applications GROUP BY channel;             -- app 2.64 · branch 2.80 · partner 2.96
```
By status: approved 2.69 %, approved_not_disbursed 2.36, cancelled 2.81, **rejected 3.01**. Flat enough to be random here; in real data a higher share among rejections often means "no bureau file → rejected", which is a policy, not a gap.
</details>

**P4.** Approval rate (all-applications denominator) by credit-score band A ≥ 720, B 660–719, C 600–659, D < 600 — with a *no score* band. One query with `CASE` in `GROUP BY`.

<details><summary>Answer</summary>

```sql
SELECT CASE WHEN credit_score IS NULL THEN 'no score' WHEN credit_score >= 720 THEN 'A 720+'
            WHEN credit_score >= 660 THEN 'B 660-719' WHEN credit_score >= 600 THEN 'C 600-659' ELSE 'D <600' END AS band,
       COUNT(*) AS apps, ROUND(100.0 * SUM(CASE WHEN status LIKE 'approved%' THEN 1 ELSE 0 END) / COUNT(*), 1) AS approval_pct
FROM applications GROUP BY band ORDER BY band;
-- A 2150 / 91.3 % · B 4702 / 77.4 · C 4605 / 52.2 · D 2155 / 16.8 · no score 388 / 59.0
```
The bands add to 14 000 only because the NULL band exists. 59 % for "no score" sits between B and C — someone decides those by hand.
</details>

**P5.** Pivot: applications by channel (rows) × status (four columns) plus a total. Check the totals against Tuesday's counts.

<details><summary>Answer</summary>
app 2 693 / 222 / 1 359 / 732 = 5 006 · branch 3 636 / 329 / 1 513 / 745 = 6 223 · partner 1 588 / 127 / 716 / 340 = 2 771 (approved / approved_not_disbursed / rejected / cancelled). Four `SUM(CASE …)` columns and `COUNT(*)`.
</details>

**P6.** Anti-joins: (a) customers who never applied; (b) customers who applied but never got a loan — once with a join, once with `EXCEPT`; (c) delinquent loans (Day 3's `unpaid` set, any DPD) that have **no** collections action at all.

<details><summary>Answer</summary>
(a) 587. (b) `customers c JOIN applications a … LEFT JOIN loans l ON l.customer_id = c.customer_id WHERE l.loan_id IS NULL` → **1 806 rows but 1 118 customers** — the join to `applications` multiplied by applications per person; use `COUNT(DISTINCT c.customer_id)`, or Tuesday's `EXCEPT` → 1 118 directly. (c) 117 of the 399 delinquent (DPD > 0) loans have never been contacted (130 of 413 if you also count the 13 that fall due today — those cannot have been called yet); 106 of the 124 loans in the 1–30 bucket among them. Sevara's team works the old debt and has not yet reached the new.
</details>

**P7.** The ON-vs-WHERE experiment. Count rows of `installments LEFT JOIN payments` for matured instalments with the as-of filter `p.paid_at <= '2026-10-01'` (a) in `ON`, (b) in `WHERE`. Explain the difference.

<details><summary>Answer</summary>
(a) 54 232 rows (54 207 matured instalments + 25 duplicate payments), `COUNT(p.payment_id)` 52 851. (b) 52 851 rows: every instalment without a payment is gone — `NULL <= '2026-10-01'` is not true. 24 payments are dated after the as-of date; with the filter in `ON` they are ignored *and* the unpaid instalments stay. (Re-running Day 3's DPD with that `ON` filter gives the same buckets — the 24 are partial payments on loans already deep in 90+.)
</details>

**P8.** Self-join: pairs of customers with the same phone but a *different* birth date. How many, and what are they?

<details><summary>Answer</summary>
43 − 40 = **3** pairs (e.g. ids 786 and 1731): `a.phone = b.phone AND a.birth_date <> b.birth_date AND a.customer_id < b.customer_id`. Shared household numbers, not duplicates — last week's false positives, now found in one query.
</details>

**P9.** Duplicates: `COUNT(*)` vs `COUNT(DISTINCT installment_id)` on `payments`; then the groups of identical `(installment_id, paid_at, amount)` and the amount counted twice.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*), COUNT(DISTINCT installment_id) FROM payments;                 -- 52875 · 52850
SELECT installment_id, paid_at, amount, COUNT(*) FROM payments
GROUP BY installment_id, paid_at, amount HAVING COUNT(*) > 1;                  -- 25 rows, all COUNT = 2
```
58 397 800 UZS is double-counted in every "payments received" total; the 25 instalments look *over*paid by exactly their amount. Removing them needs row numbers — Week 3 Day 2.
</details>

**P10.** Nilufar's question, part 1: for every loan whose **first** instalment was due on or before 2026-09-01, flag FPD30 = 1 if the instalment was not fully paid, or its first payment came more than 30 days after the due date. Count the flags.

<details><summary>Answer</summary>
See the Company corner: 7 099 loans in scope, **91** flagged — 51 unpaid or partially paid, 40 paid in full but more than 30 days late. Both parts of the `CASE` matter: a strict "unpaid only" rule gives 51 (0.72 %).
</details>

<span class="badge stretch">Stretch</span> **P11.** SPD30 — the same for the *second* instalment. Why is it higher than FPD30, and is that a problem?

<details><summary>Answer</summary>
156 of 6 735 = **2.32 %** vs 1.28 %. Not alarming by itself: the second instalment has had one more month for ordinary financial trouble to appear, and the scope is one month older. FPD isolates the "never meant to pay" signal; SPD/TPD show the early-trouble curve. Report them side by side per vintage.
</details>

---

## 4. Homework

No new homework. **HW 2.2** (Sevara's lateness report, clean methods, the twelve loans) is due tomorrow with the checkpoint.

---

## 5. Self-check

1. Why does `WHERE monthly_income <> 5000000` return 5 684 and not 6 039? *(→ section 1, "NULL is not a value")*
2. In a `LEFT JOIN`, where does a filter on the right-hand table belong, and what happens if you put it in `WHERE`? *(→ section 1, "A condition in ON vs in WHERE"; P7)*
3. Write the `SUM(CASE …)` that counts approved applications, and the `AVG(CASE …)` that gives their share. *(→ section 1, "Pivot")*

---

## 6. Company corner <span class="badge company">FPD30 by vintage and channel</span>

**Definition we use** (say it before every number): a loan is **FPD30** if its first instalment (`installment_no = 1`) was *not paid in full within 30 days of its due date*. **In scope** are loans whose first instalment fell due on or before as-of − 30 days (2026-09-01), so that every loan in the base has had its 30 days. A **vintage** (*винтаж*) is the month of disbursement.

```sql
WITH first_inst AS (                                   -- one row per loan in scope: due, total, first payment date, paid amount
  SELECT i.loan_id, i.due_date, i.total_due, MIN(p.paid_at) AS first_paid, COALESCE(SUM(p.amount), 0) AS paid
  FROM installments i
  LEFT JOIN payments p ON p.installment_id = i.installment_id
  WHERE i.installment_no = 1
    AND i.due_date <= date('2026-10-01', '-30 days')    -- SQL Server: DATEADD(day, -30, '2026-10-01')
  GROUP BY i.loan_id, i.due_date, i.total_due
),
flags AS (
  SELECT f.loan_id,
         CASE WHEN f.paid < f.total_due THEN 1                                            -- never fully paid
              WHEN julianday(f.first_paid) - julianday(f.due_date) > 30 THEN 1           -- DATEDIFF(day, f.due_date, f.first_paid) > 30
              ELSE 0 END AS fpd30
  FROM first_inst f
)
SELECT strftime('%Y-%m', l.disbursed_at) AS vintage,                                     -- FORMAT(l.disbursed_at, 'yyyy-MM')
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

**By vintage** (2026 only, all channels): Jan 1.05 % · Feb 1.13 · Mar **0.00** · Apr 1.60 · May 1.86 · Jun 0.80 · Jul 1.09 · Aug 0 of 11 (barely in scope). Across all 32 vintages the rate ranges 0.0–3.1 % on 100–380 loans each — with 3 FPDs a month, one loan moves the rate by 0.3 points. Read vintages by *quarter* when counts are this small: 2026-Q1 app 1.40 % vs branch 0.24 %; 2026-Q2 app 1.07 % vs branch 1.22 % vs partner 2.58 % (5 of 194). The app's excess is persistent over 2024–2025 (2.16 / 1.76 % vs branch 0.50 / 1.59 %) and has narrowed in 2026 (1.27 vs 0.74 %).

**By product and grade** (same query, swap the dimension): Micro 1.70 % (= the app: Micro is the only app product), Consumer 1.14, BNPL 1.12, SME 0.98, Auto 0.58; grades A 0.60, B 0.97, C 2.16, D 2.23 — the scorecard separates A/B from C/D at the first payment already.

**What to say on Monday:** *"FPD30 (first instalment not fully paid within 30 days; base = loans whose first due date is 30+ days old) is 1.28 % overall. The app channel runs at 1.70 % against 1.04 % at branches — 1.6×, consistent since 2024 and narrowing in 2026. Monthly vintages are too small to read individually; by quarter the app is above the branch in 10 of 11. Recommendation: tighten the app cut-off for grade C, where FPD is 2.2 %."*

> Interview version: *"How would you compute FPD30 by vintage and channel, and what is the trap?"* — First instalment per loan; LEFT JOIN payments, grouped; flag paid < due *or* first payment > 30 days late; restrict the base to first due dates at least 30 days before the as-of date; group by month of disbursement and channel with `SUM(CASE)/COUNT(*)`. Traps: forgetting the 30-day scope (young vintages look perfect), counting partial payments as paid, and comparing two tiles built on two definitions.

Tomorrow: checkpoint — twenty-five questions from four desks, nothing new to learn.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w02d4", "pass": 0.8, "questions": [
  {"type": "single", "q": "customers has 6 040 rows, 356 of them with no income. Why does this return 5 684 and not 6 039?", "code": "SELECT COUNT(*) FROM customers\nWHERE monthly_income <> 5000000;", "options": ["Nobody earns exactly 5 000 000, so it is a coincidence", "A comparison with NULL is unknown, not true, so the 356 rows fail the test too", "<> skips duplicates", "COUNT(*) ignores NULLs"], "answer": 1, "explain": "NULL rows leave every filter, = and <> alike; when groups do not add up to the total, look for a NULL (→ section 1, NULL is not a value)."},
  {"type": "number", "q": "Four customers have these incomes (in millions). What does the query return?", "code": "monthly_income: 10, 20, 30, NULL\n\nSELECT AVG(monthly_income) FROM customers;", "answer": 20, "explain": "AVG drops the NULL and averages the three known values; it does not treat the unknown as 0 (that would give 15) — report the count next to the average (→ section 1, NULL in aggregates)."},
  {"type": "single", "q": "Where do customers with an empty income land in this result?", "code": "CASE WHEN monthly_income <  5000000 THEN '<5m'\n     WHEN monthly_income < 20000000 THEN '5-20m'\n     ELSE '20m+' END AS income_band", "options": ["In '<5m'", "In '20m+' — every test on NULL is unknown, so they fall through to ELSE", "They are left out of the result", "In a NULL band of their own"], "answer": 1, "explain": "Put WHEN monthly_income IS NULL THEN 'unknown' first, or the people we know least about join the richest band (→ section 1, CASE)."},
  {"type": "multi", "q": "Which expressions give the NUMBER of approved applications?", "options": ["SUM(CASE WHEN status LIKE 'approved%' THEN 1 ELSE 0 END)", "COUNT(CASE WHEN status LIKE 'approved%' THEN 1 END)", "COUNT(CASE WHEN status LIKE 'approved%' THEN 1 ELSE 0 END)", "AVG(CASE WHEN status LIKE 'approved%' THEN 1.0 ELSE 0 END)"], "answer": [0, 1], "explain": "COUNT counts non-NULL values, so the ELSE 0 version counts every row; the AVG version is the share, not the count (→ section 1, Pivot with SUM(CASE …))."},
  {"type": "single", "q": "What goes wrong in this LEFT JOIN?", "code": "SELECT COUNT(*)\nFROM installments i\nLEFT JOIN payments p ON p.installment_id = i.installment_id\nWHERE p.paid_at <= '2026-10-01';", "options": ["Nothing — it keeps every instalment", "The WHERE test fails on NULL, so every instalment without a payment is dropped: the LEFT JOIN acts as an INNER JOIN", "It counts payments twice", "It is a syntax error"], "answer": 1, "explain": "A filter on the right-hand table belongs in ON (… AND p.paid_at <= '2026-10-01') (→ section 1, A condition in ON vs in WHERE; P7)."},
  {"type": "single", "q": "What is NULLIF for in x / NULLIF(y, 0)?", "options": ["It replaces NULL with 0", "It turns a zero divisor into NULL, so a group with nothing to divide by gives NULL instead of a division-by-zero error", "It removes duplicate rows", "It rounds the result"], "answer": 1, "explain": "NULLIF(a, b) returns NULL when a = b; its one job is safe division (→ section 1, COALESCE, ISNULL / IFNULL, NULLIF)."},
  {"type": "single", "q": "In this self-join, what does a.customer_id < b.customer_id do?", "code": "FROM customers a JOIN customers b\n  ON a.phone = b.phone\n AND a.birth_date = b.birth_date\n AND a.customer_id < b.customer_id", "options": ["Keeps only the older customer", "Keeps each pair once and never pairs a row with itself", "Sorts the result", "Nothing — it can be left out"], "answer": 1, "explain": "Without it every row matches itself and every pair appears twice, as (a, b) and (b, a) (→ section 1, Self-join)."},
  {"type": "single", "q": "Why does the FPD30 base include only loans whose first instalment fell due at least 30 days before the as-of date?", "options": ["To make the query faster", "Younger loans have not had their 30 days yet, so they would count as 'not FPD' and make young vintages look perfect", "Because newer loans have no instalments", "Regulators forbid counting recent loans"], "answer": 1, "explain": "Every loan in the base must have had the chance to fail; forgetting the scope is the classic FPD trap (→ section 6, Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w02d4", "q": "Nilufar asks whether customers with no income on file are riskier at the first payment. Using the Company corner's FPD30 definition and scope (first instalment due on or before 2026-09-01), compute the FPD30 rate for loans whose customer has an empty monthly_income. Percentage to 2 decimals.", "type": "number", "dp": 2, "h": ["c6ee2214fe3286dbca701947"], "hint": "Reuse the corner's flags block and add one join; remember how an empty value behaves in a comparison.", "sol": "V0lUSCBmaXJzdF9pbnN0IEFTICgg4oCmdGhlIENvbXBhbnkgY29ybmVyJ3MgYmxvY2vigKYgKSwKZmxhZ3MgQVMgKCDigKZ0aGUgQ29tcGFueSBjb3JuZXIncyBibG9ja+KApiApClNFTEVDVCBDT1VOVCgqKSBBUyBsb2FucywgU1VNKGZsLmZwZDMwKSBBUyBmcGQsCiAgICAgICBST1VORCgxMDAuMCAqIFNVTShmbC5mcGQzMCkgLyBDT1VOVCgqKSwgMikgQVMgZnBkMzBfcGN0CkZST00gZmxhZ3MgZmwKSk9JTiBsb2FucyBsICAgICBPTiBsLmxvYW5faWQgPSBmbC5sb2FuX2lkCkpPSU4gY3VzdG9tZXJzIGMgT04gYy5jdXN0b21lcl9pZCA9IGwuY3VzdG9tZXJfaWQKV0hFUkUgYy5tb250aGx5X2luY29tZSBJUyBOVUxMOwotLSA0MTkgbG9hbnMgaW4gc2NvcGUsIDYgRlBEMzAg4oaSIDEuNDMgJQotLSBTUUwgU2VydmVyOiB0aGUgY29ybmVyJ3MgREFURUFERCAvIERBVEVESUZGIHNwZWxsaW5ncyBpbiB0aGUgQ1RFcywgdGhlIHJlc3QgaWRlbnRpY2FsCldpdGggaW5jb21lIG9uIGZpbGU6IDg1IG9mIDYgNjgwID0gMS4yNyAlLiBUaGUgZ2FwIGlzIGxlc3MgdGhhbiBvbmUgbG9hbiBvdXQgb2YgNDE5IOKAlCBmYXIgaW5zaWRlIHRoZSBub2lzZSBvZiBhIDYtZXZlbnQgZ3JvdXAuIFRoZSBhbnN3ZXIgZm9yIE5pbHVmYXI6IG5vIGV2aWRlbmNlIHRoYXQgYSBtaXNzaW5nIGluY29tZSBwcmVkaWN0cyBmaXJzdC1wYXltZW50IGRlZmF1bHQ7IGxvb2sgYWdhaW4gd2hlbiB0aGUgZ3JvdXAgaGFzIDMwKyBGUERzLiAoV0hFUkUgbW9udGhseV9pbmNvbWUgPSBOVUxMIGZpbmRzIG5vIGxvYW5zIGF0IGFsbC4p"}
```

<!-- challenge:end -->
