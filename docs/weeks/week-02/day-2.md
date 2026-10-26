# Week 2 · Day 2 — Counting and summing: the portfolio in numbers

<span class="badge">Learn 60 min</span> <span class="badge">Practice 60 min</span> <span class="badge company">Company corner</span>

> STORY **Tuesday, 8:50.** Madina drops a printed slide on your desk: a table with five product rows and twelve month columns, half the cells crossed out in red pen. *"The October board pack. Timur builds this from the warehouse, but the warehouse loaded on the 1st and the board wants the September figures re-cut by product, by branch and by month — loans and disbursed amount — today. Yesterday you joined the tables. Today you add them up. And please, no Excel."*

## Today in 3 lines

- You can use the five **aggregates** (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`) with **GROUP BY** on one or several columns, filter groups with **HAVING**, and sort by an aggregate.
- You know the difference between **COUNT(\*)** and **COUNT(DISTINCT …)**, and why an aggregate after a one-to-many join gives a wrong — and plausible — number.
- You can produce **disbursements by month and product**, **average ticket**, and **approval rate by channel** in one query each.

---

## 1. Learn — collapsing rows into numbers

### The five aggregates

An **aggregate function** (*агрегатная функция*) takes a column over many rows and returns one value:

```sql
SELECT COUNT(*)        AS loans,          -- 7828
       SUM(principal)  AS disbursed,      -- 404 783 280 000
       AVG(principal)  AS avg_ticket,     -- 51 709 667.86
       MIN(principal)  AS smallest,       -- 300 000
       MAX(principal)  AS largest         -- 599 060 000
FROM loans;
```

One row out. `COUNT(*)` counts rows; `COUNT(column)` counts rows where that column is not NULL (Day 4 makes this matter). Add a `WHERE` and the aggregates run over the filtered rows only — `WHERE status = 'active'` → 3 352 loans, 296 980 040 000 disbursed.

### GROUP BY — one number per group

To get the same numbers *per product*, name the column you want one row for:

```sql
SELECT p.name, COUNT(*) AS loans, SUM(l.principal) AS disbursed, AVG(l.principal) AS avg_ticket
FROM loans l
JOIN products p ON p.product_id = l.product_id
GROUP BY p.name
ORDER BY disbursed DESC;
```

| name | loans | disbursed | avg_ticket |
|---|---|---|---|
| Small business loan | 781 | 241 117 150 000 | 308 728 745 |
| Auto loan | 391 | 84 791 530 000 | 216 858 133 |
| Consumer loan | 2 418 | 65 109 280 000 | 26 926 915 |
| Micro loan | 2 669 | 7 221 210 000 | 2 705 586 |
| Buy now pay later | 1 569 | 6 544 110 000 | 4 170 880 |

The rule that produces most beginner errors: **every column in `SELECT` is either inside an aggregate or listed in `GROUP BY`.** `SELECT p.name, l.loan_id, COUNT(*)` is an error on SQL Server ("not contained in an aggregate function or the GROUP BY clause") — which loan_id would it show for a group of 781? SQLite silently picks one; never rely on it.

Group by **several columns** to get one row per combination: `GROUP BY b.region, p.name` → region × product. The month of a date is a function of the date — tomorrow's topic — but you need it today, so here it is in both dialects:

```sql
-- SQL Server:  FORMAT(l.disbursed_at, 'yyyy-MM')      SQLite:  strftime('%Y-%m', l.disbursed_at)
SELECT strftime('%Y-%m', l.disbursed_at) AS month, p.name, COUNT(*) AS loans, SUM(l.principal) AS disbursed
FROM loans l JOIN products p ON p.product_id = l.product_id
WHERE l.disbursed_at >= '2026-01-01'
GROUP BY strftime('%Y-%m', l.disbursed_at), p.name
ORDER BY month, disbursed DESC;
```

SQL Server does not let you write the alias `month` in `GROUP BY`; repeat the expression (SQLite accepts either). `ORDER BY` *may* use aliases everywhere, and may sort by an aggregate: `ORDER BY COUNT(*) DESC`.

### HAVING vs WHERE

`WHERE` filters **rows before** grouping; `HAVING` filters **groups after** aggregation. You cannot write `WHERE COUNT(*) > 900` — there is no count yet when WHERE runs.

```sql
SELECT b.branch_name, COUNT(*) AS active_loans
FROM loans l JOIN branches b ON b.branch_id = l.branch_id
WHERE l.status = 'active'            -- keep only active loans (rows)
GROUP BY b.branch_name
HAVING COUNT(*) > 300                -- keep only branches with more than 300 of them (groups)
ORDER BY active_loans DESC;          -- 6 branches: Tashkent Central 435 … Andijan Central 334
```

Execution order to keep in your head: `FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY`. That is why `WHERE` cannot see aliases or aggregates, and `HAVING` can.

### COUNT(DISTINCT)

`COUNT(*)` counts rows of the group; `COUNT(DISTINCT l.customer_id)` counts different customers in it:

```sql
SELECT p.name, COUNT(*) AS loans, COUNT(DISTINCT l.customer_id) AS customers
FROM loans l JOIN products p ON p.product_id = l.product_id
GROUP BY p.name ORDER BY loans DESC;
-- Micro 2669 loans / 2133 customers · Consumer 2418 / 2000 · BNPL 1569 / 1364 · SME 781 / 724 · Auto 391 / 381
```

Micro borrowers come back: 2 669 loans for 2 133 people. Report *loans* when you mean loans and *customers* when you mean people — last Thursday's forty-customers case was exactly this confusion.

### Aggregates after a join — the multiplication trap

Yesterday: `loans JOIN installments` has 92 193 rows, each loan repeated once per instalment. Sum a *loan* column over it and every principal is counted term-months times:

```sql
SELECT p.name, SUM(l.principal)
FROM loans l JOIN installments i ON i.loan_id = l.loan_id
JOIN products p ON p.product_id = l.product_id
GROUP BY p.name;                     -- SME 5 862 295 560 000 — 24× too big, and nobody would blink
```

The number is wrong by a factor of the average term, which differs by product, so even the *ranking* can change. The rule: **aggregate a column at the grain of its own table.** Loan amounts over `loans`; instalment amounts over `installments`; if you need both in one result, aggregate each table separately and join the results — week 3 gives you the tool (subqueries and CTEs). Until then, when a query joins a one-to-many table, run `COUNT(*)` and `COUNT(DISTINCT l.loan_id)` next to each other; if they differ, do not `SUM` a loan column.

### Set operators — stacking results

Joins put tables side by side; **set operators** (*операции над множествами*) put query results on top of each other. Both queries must return the same number of columns of compatible types.

| Operator | Keeps | Example on our data |
|---|---|---|
| `UNION` | all rows of both, **duplicates removed** | `SELECT customer_id FROM loans UNION SELECT customer_id FROM applications` → 5 453 rows (= distinct applicants; every borrower applied) |
| `UNION ALL` | all rows of both, duplicates kept (fast) | the same with `UNION ALL` → 21 828 rows (7 828 + 14 000) |
| `EXCEPT` | rows of the first query not in the second | `SELECT customer_id FROM applications EXCEPT SELECT customer_id FROM loans` → 1 118 people who applied and never got a loan |
| `INTERSECT` | rows in both | applicants who are also borrowers → 4 335 |

`UNION` is how you stack "this month" and "last month" blocks into one table for a chart; `EXCEPT` is an anti-join written as sets. Use `UNION ALL` unless you *want* de-duplication — `UNION` must sort to remove duplicates, and it quietly merges rows that are legitimately identical.

### Depth (optional)

- ▶ Baraa, *Aggregate functions* [8:43:36](https://youtu.be/SSKVgrwhzus?t=31416&end=31811) — 7 min; and *Set operators* [4:02:09](https://youtu.be/SSKVgrwhzus?t=14529&end=17261) — 40 min.
- RU deck `2.2 SQL-1-38.pdf` — GROUP BY / HAVING pages. *Russian terms:* агрегатная функция = aggregate, группировка = GROUP BY, средний чек = average ticket, объединение = UNION.

---

## 2. Worked example — the board-pack table

**Ask (Madina):** *loans and disbursed amount in 2026, by month and product.*

1. *Grain of the answer:* one row per (month, product). *Grain of the source:* `loans` — one loan per row, so `COUNT(*)` and `SUM(principal)` are safe. No instalments needed. Good.
2. *Which tables?* `loans` for the dates and amounts, `products` for the name — many-to-one, no multiplication.
3. *Period filter:* `disbursed_at >= '2026-01-01'` (and `< '2027-01-01'` if the data could run further; ours stops on 2026-10-01).
4. Query: section 1's month × product query. First rows of the result:

| month | product | loans | disbursed |
|---|---|---|---|
| 2026-01 | Small business loan | 34 | 10 042 990 000 |
| 2026-01 | Auto loan | 20 | 4 620 560 000 |
| 2026-01 | Consumer loan | 90 | 2 337 660 000 |
| 2026-01 | Micro loan | 99 | 262 110 000 |
| 2026-01 | Buy now pay later | 44 | 189 050 000 |
| 2026-02 | Small business loan | 21 | 6 035 880 000 |
| … | | | |

50 rows (10 months × 5 products; October has one day). This is the **long format** — one row per cell of Madina's slide. Her slide is the **wide** format (months across). Turning long into wide is Day 4's `SUM(CASE …)` or, in practice, a pivot table in Excel/Power BI on top of exactly this result. Deliver the long table; it is the one that is right.

5. Sanity check against a single-column total: `SELECT COUNT(*), SUM(principal) FROM loans WHERE disbursed_at >= '2026-01-01'` → 3 051 loans, 162 333 060 000. The 50 rows must add up to that. They do.

---

## 3. Practice (60 min)

File: `submissions/week-02/day-2/practice.sql`, each query with `-- result:`. Yesterday's joins plus today's aggregates; no `CASE` yet.

**P1.** Loans and total principal by `status`, largest total first.

<details><summary>Answer</summary>

```sql
SELECT status, COUNT(*) AS loans, SUM(principal) AS principal
FROM loans GROUP BY status ORDER BY principal DESC;
```
active 3 352 / 296.98 bn · closed 4 242 / 94.15 bn · written_off 190 / 10.02 bn · default 44 / 3.63 bn. Closed loans are more numerous but smaller — short Micro and BNPL loans close fast.
</details>

**P2.** Loans disbursed per year, with the total and the average ticket, rounded to whole UZS.

<details><summary>Answer</summary>

```sql
-- SQL Server: YEAR(disbursed_at)          SQLite: strftime('%Y', disbursed_at)
SELECT strftime('%Y', disbursed_at) AS yr, COUNT(*) AS loans, SUM(principal) AS disbursed, ROUND(AVG(principal)) AS avg_ticket
FROM loans GROUP BY strftime('%Y', disbursed_at) ORDER BY yr;
```
2024: 1 736 loans, 86.52 bn · 2025: 3 041, 155.93 bn · 2026 (to 1 Oct): 3 051, 162.33 bn. Nine months of 2026 already beat all of 2025.
</details>

**P3.** Loans by branch (name and region), with the sum of principal, most money first. Which branch lends the most?

<details><summary>Answer</summary>

```sql
SELECT b.branch_name, b.region, COUNT(*) AS loans, SUM(l.principal) AS disbursed
FROM loans l JOIN branches b ON b.branch_id = l.branch_id
GROUP BY b.branch_name, b.region ORDER BY disbursed DESC;
```
Tashkent Central 1 001 loans / 55.64 bn first, although Tashkent South has more loans (1 012 / 53.36 bn). Termez Central last: 483 / 22.99 bn. Count and amount rank differently — say which you sorted by.
</details>

**P4.** Branches with more than 900 loans. · **P5.** Products whose average ticket exceeds 50 000 000.

<details><summary>Answer</summary>

```sql
SELECT b.branch_name, COUNT(*) FROM loans l JOIN branches b ON b.branch_id = l.branch_id
GROUP BY b.branch_name HAVING COUNT(*) > 900 ORDER BY 2 DESC;
-- Tashkent South 1012, Tashkent North 1007, Tashkent Central 1001, Fergana Central 906
SELECT p.name, AVG(l.principal) FROM loans l JOIN products p ON p.product_id = l.product_id
GROUP BY p.name HAVING AVG(l.principal) > 50000000;             -- Auto 216.9 m, SME 308.7 m
```
Both are conditions on an aggregate → `HAVING`. Writing them in `WHERE` is a syntax error, which is the kind one.
</details>

**P6.** How many customers have more than one loan? Two steps: a grouped query per customer, then count its rows by eye — and note that counting *rows of a grouped result* needs a tool you get in week 3.

<details><summary>Answer</summary>

```sql
SELECT customer_id, COUNT(*) AS loans FROM loans GROUP BY customer_id HAVING COUNT(*) > 1 ORDER BY loans DESC;
```
2 246 rows (your tool shows the row count). Four customers have 7 loans each (ids 1893, 3216, 4435, 5478). Wrapping it in `SELECT COUNT(*) FROM ( … )` is a subquery — Week 3 Day 3.
</details>

**P7.** Collections actions by type with the number of promises to pay. Which action type gets the highest *share* of promises? (A share is a division — compute it by hand today, in SQL tomorrow.)

<details><summary>Answer</summary>

```sql
SELECT action_type, COUNT(*) AS actions FROM collections_actions GROUP BY action_type ORDER BY actions DESC;
SELECT action_type, COUNT(*) AS promises FROM collections_actions WHERE outcome = 'promise_to_pay' GROUP BY action_type;
```
sms 1 254 / 3 265 = 38.4 % · visit 381 / 1 506 = 25.3 % · call 785 / 3 114 = 25.2 % · restructure_offer 344 / 1 476 = 23.3 %. SMS "wins" because it is the first action on every late loan, when borrowers still answer; it says nothing about which action *works*. Tomorrow you divide inside the query.
</details>

**P8.** The multiplication trap, measured. For active loans: `COUNT(*)` and `COUNT(DISTINCT l.loan_id)` over `loans JOIN payments`, and `SUM(l.principal)` over the same join vs over `loans` alone.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*), COUNT(DISTINCT l.loan_id) FROM loans l JOIN payments p ON p.loan_id = l.loan_id WHERE l.status = 'active';
-- 22511 rows, 2971 loans  → the join multiplied; 381 active loans have no payment yet and vanished (inner join)
SELECT SUM(principal) FROM loans WHERE status = 'active';                                   -- 296 980 040 000 (right)
```
The joined `SUM(l.principal)` is in the trillions — every principal counted once per payment. When the two counts differ, aggregate loan columns on `loans` alone.
</details>

**P9.** Payments by `method`: count and total amount, most frequent first. Look at the result carefully and write one sentence about it.

<details><summary>Answer</summary>

```sql
SELECT method, COUNT(*) AS payments, SUM(amount) AS total FROM payments GROUP BY method ORDER BY payments DESC;
```
Ten rows where there should be five: `card` 17 564 **and** `Card` 57; `click` 8 754 and `Click` 36; `payme` 8 870 and `PayMe` 30; `cash` 8 760 and `CASH ` (trailing space) 30; `transfer` 8 747 and `bank transfer` 27. 180 rows carry a differently spelt method, so every "share by method" is off and *card* looks like it has 57 fewer payments than it does. `GROUP BY` groups *exact* values — a space or a capital letter is a different group. We fix this tomorrow with `LOWER`, `TRIM` and `REPLACE`. (These ten rows are SQLite's. SQL Server's default collation ignores case and trailing spaces, so there `GROUP BY method` shows six rows and the stray spellings hide inside `card`, `click`, `payme` and `cash`; write `GROUP BY method COLLATE Latin1_General_CS_AS` to get the same ten rows.)
</details>

**P10.** Monthly payments received in 2026: count and sum per month. Anything odd at the end of the list?

<details><summary>Answer</summary>

```sql
SELECT strftime('%Y-%m', paid_at) AS month, COUNT(*) AS payments, SUM(amount) AS received
FROM payments WHERE paid_at >= '2026-01-01' GROUP BY strftime('%Y-%m', paid_at) ORDER BY month;
```
January 2 466 / 11.76 bn rising to September 3 159 / 16.34 bn — then **2026-10: 52** and **2026-11: 8**. The data is as of 1 October; 60 payments are dated 1 October or later, and **24** of them are dated *after* the as-of date (the last on 2026-11-24). Either the extract ran later than its label, or these are scheduled direct-debits recorded ahead. Note it for Timur; Friday asks about it.
</details>

<span class="badge stretch">Stretch</span> **P11.** Using `UNION ALL`, build one result with two labelled rows: `'2025'` with its loan count and `'2026'` with its loan count. Then do the same with `UNION` and explain why the result is identical here but would not be if both years had the same count.

<details><summary>Answer</summary>

```sql
SELECT '2025' AS yr, COUNT(*) AS loans FROM loans WHERE disbursed_at >= '2025-01-01' AND disbursed_at < '2026-01-01'
UNION ALL
SELECT '2026', COUNT(*) FROM loans WHERE disbursed_at >= '2026-01-01';          -- 3041 / 3051
```
The label column makes the rows different, so `UNION` keeps both. Without the label, two equal counts would collapse into one row under `UNION` — the classic silent loss. Default to `UNION ALL`.
</details>

---

## 4. Homework

No new homework. **HW 2.1** (Bekzod's loan book) is due tomorrow — Q6 is a `GROUP BY` now.

---

## 5. Self-check

1. Which clause filters groups, which filters rows, and in what order do they run? *(→ section 1, "HAVING vs WHERE")*
2. `SELECT p.name, l.loan_id, COUNT(*) … GROUP BY p.name` — why is this wrong, and what would SQL Server say? *(→ section 1, "GROUP BY")*
3. You sum `principal` over `loans JOIN installments`. What is the result wrong by, and what check would have caught it? *(→ section 1, "the multiplication trap"; P8)*

---

## 6. Company corner <span class="badge company">Disbursements, ticket, approval rate</span>

Three portfolio numbers that are pure `GROUP BY`, and one that needs a division.

**Disbursements** (*выдачи*) — count and amount of loans paid out in a period, by product. September 2026:

```sql
SELECT p.name, COUNT(*) AS loans, SUM(l.principal) AS disbursed
FROM loans l JOIN products p ON p.product_id = l.product_id
WHERE l.disbursed_at >= '2026-09-01' AND l.disbursed_at < '2026-10-01'
GROUP BY p.name ORDER BY disbursed DESC;
```

| product | loans | disbursed |
|---|---|---|
| Small business loan | 30 | 8 601 880 000 |
| Auto loan | 21 | 4 398 600 000 |
| Consumer loan | 121 | 3 409 790 000 |
| Micro loan | 123 | 328 630 000 |
| Buy now pay later | 66 | 276 590 000 |

361 loans, 17.02 bn UZS. Thirty SME loans are half the money; 123 Micro loans are 2 % of it. That mix is why Bekzod's "the portfolio grew" and Marketing's "we issued more loans" can both be true and both miss the point. Year to date 2026 the SME row is 305 loans / 95.24 bn of 162.33 bn total.

**Average ticket** (*средний чек*) — `AVG(principal)` per product: SME 312.2 m, Auto 219.5 m, Consumer 27.2 m, BNPL 4.1 m, Micro 2.7 m in 2026. Ticket moves when the product's *mix of customers* moves; a falling SME ticket with rising count usually means a new segment, not smaller businesses.

**Approval rate by channel** (*уровень одобрения по каналам*). Week 1 you did it with two counts for the whole company. Per channel, the two-query way is three groups each:

```sql
SELECT channel, COUNT(*) AS applications FROM applications GROUP BY channel;                            -- app 5006 · branch 6223 · partner 2771
SELECT channel, COUNT(*) AS approved FROM applications WHERE status LIKE 'approved%' GROUP BY channel;  -- app 2915 · branch 3965 · partner 1715
```

app 58.2 % · branch 63.7 % · partner 61.9 % (all-applications denominator). One query instead of two: average a 0/1 expression. In SQLite a comparison *is* 0 or 1, so `AVG(status LIKE 'approved%')` works; SQL Server needs `IIF` to turn the test into a number:

```sql
-- SQLite
SELECT channel, COUNT(*) AS applications, ROUND(100.0 * AVG(status LIKE 'approved%'), 1) AS approval_pct
FROM applications GROUP BY channel;
-- SQL Server
SELECT channel, COUNT(*) AS applications, ROUND(100.0 * AVG(IIF(status LIKE 'approved%', 1.0, 0)), 1) AS approval_pct
FROM applications GROUP BY channel;
```

Same three numbers. Thursday's `SUM(CASE WHEN … THEN 1 ELSE 0 END)` is the portable spelling of the same idea — read it there, use whichever your engine likes. With the *decided* denominator (cancelled out) the channels read 68.2 / 72.4 / 70.5 %; the app is 4–5 points below the branch under either convention, because the app has no officer to argue a borderline case.

**One lesson from P9.** Payments by method showed `Card` and `card` as two rows. Madina's board pack has a "share of digital payments" tile; computed on raw `method`, card is understated by 57 payments and 327 m UZS, and the five stray spellings add five phantom categories. Real data always has this. Tomorrow's first job is to make `GROUP BY LOWER(TRIM(method))` return five rows.

> Interview version: *"How would you build a disbursements-by-month-by-product report, and what would you check?"* — `GROUP BY month, product` over `loans` (one row per loan, so sums are safe); period filter with `>=` and `<`; check that the rows add up to the ungrouped total; never join a one-to-many table before summing loan amounts.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w02d2", "pass": 0.8, "questions": [
  {"type": "single", "q": "Which line has the bug?", "code": "1  SELECT b.branch_name, COUNT(*) AS loans\n2  FROM loans l JOIN branches b ON b.branch_id = l.branch_id\n3  WHERE COUNT(*) > 900\n4  GROUP BY b.branch_name;", "options": ["Line 1", "Line 2", "Line 3 — a condition on an aggregate belongs in HAVING, after GROUP BY", "Line 4"], "answer": 2, "explain": "WHERE filters rows before grouping, when no count exists yet; HAVING filters groups (→ section 1, HAVING vs WHERE)."},
  {"type": "single", "q": "What does SQL Server do with this query?", "code": "SELECT p.name, l.loan_id, COUNT(*)\nFROM loans l JOIN products p ON p.product_id = l.product_id\nGROUP BY p.name;", "options": ["Returns one row per loan", "Refuses it: loan_id is neither aggregated nor in GROUP BY", "Returns one row per product with the first loan_id", "Returns the count only"], "answer": 1, "explain": "Every SELECT column is either inside an aggregate or in GROUP BY; SQLite silently picks one loan_id, which you must never rely on (→ section 1, GROUP BY)."},
  {"type": "single", "q": "Micro shows 2 669 for COUNT(*) and 2 133 for COUNT(DISTINCT l.customer_id). Which sentence is right?", "options": ["2 669 Micro customers", "2 669 Micro loans taken by 2 133 different people", "534 Micro loans are duplicates to delete", "2 133 Micro loans"], "answer": 1, "explain": "COUNT(*) counts rows (loans); COUNT(DISTINCT …) counts different customers — report the one you mean (→ section 1, COUNT(DISTINCT))."},
  {"type": "number", "q": "In SQLite, the method column holds these five values. How many rows does the query return?", "code": "method: 'card', 'card', 'Card', 'cash', 'CASH '\n\nSELECT method, COUNT(*)\nFROM payments\nGROUP BY method;", "answer": 4, "explain": "GROUP BY groups exact values: card, Card, cash and 'CASH ' (trailing space) are four different groups (→ P9)."},
  {"type": "single", "q": "You join loans to payments and want SUM(l.principal). Which quick check tells you the sum is unsafe?", "options": ["COUNT(*) and COUNT(DISTINCT l.loan_id) differ", "The sum is a round number", "The query runs slowly", "MIN(principal) is 0"], "answer": 0, "explain": "If rows outnumber loans, each principal is counted several times; aggregate a column at the grain of its own table (→ section 1, the multiplication trap; P8)."},
  {"type": "multi", "q": "Which statements about set operators are true?", "options": ["UNION removes duplicate rows", "UNION ALL keeps duplicates and is faster", "EXCEPT returns rows of the first query that are not in the second", "UNION puts two tables side by side, like a join", "The two queries must return the same number of rows"], "answer": [0, 1, 2], "explain": "Set operators stack results, so the column count must match, not the row count; default to UNION ALL (→ section 1, Set operators)."},
  {"type": "single", "q": "Which clause can use a column alias defined in SELECT (e.g. ORDER BY active_loans) on both SQL Server and SQLite?", "options": ["WHERE", "GROUP BY", "ORDER BY", "None of them"], "answer": 2, "explain": "ORDER BY runs after SELECT in FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY; SQL Server needs the expression repeated in GROUP BY (→ section 1, GROUP BY; HAVING vs WHERE)."},
  {"type": "single", "q": "In SQLite, what does this column compute per channel?", "code": "SELECT channel,\n       ROUND(100.0 * AVG(status LIKE 'approved%'), 1)\nFROM applications\nGROUP BY channel;", "options": ["The number of approved applications", "The approval rate in %, with all applications as the denominator", "The approval rate with cancelled applications left out", "The average credit score of approved applications"], "answer": 1, "explain": "A comparison is 1 or 0, so its average is the share that is 1 — here over every application of the channel (→ section 6, Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w02d2", "q": "Nilufar suspects some loan officers decide more strictly than others. For applications submitted in 2025, compute each officer's approval rate on the decided convention (cancelled left out; approved_not_disbursed counts as approved), keeping only officers with at least 80 decided applications. Which officer has the lowest rate? Answer with the officer's staff_id.", "type": "number", "dp": 0, "h": ["56de769469e1ba7468f6f2ed"], "hint": "One filter belongs before the grouping and one after — the cut-off of 80 is a condition on a count.", "sol": "LS0gU1FMaXRlClNFTEVDVCBvZmZpY2VyX2lkLCBDT1VOVCgqKSBBUyBkZWNpZGVkLAogICAgICAgUk9VTkQoMTAwLjAgKiBBVkcoc3RhdHVzIExJS0UgJ2FwcHJvdmVkJScpLCAxKSBBUyBhcHByb3ZhbF9wY3QKRlJPTSBhcHBsaWNhdGlvbnMKV0hFUkUgc3RhdHVzIDw+ICdjYW5jZWxsZWQnCiAgQU5EIGFwcGxpZWRfYXQgPj0gJzIwMjUtMDEtMDEnIEFORCBhcHBsaWVkX2F0IDwgJzIwMjYtMDEtMDEnCkdST1VQIEJZIG9mZmljZXJfaWQKSEFWSU5HIENPVU5UKCopID49IDgwCk9SREVSIEJZIGFwcHJvdmFsX3BjdDsKLS0gU1FMIFNlcnZlcjogQVZHKElJRihzdGF0dXMgTElLRSAnYXBwcm92ZWQlJywgMS4wLCAwLjApKSBpbnN0ZWFkIG9mIEFWRyhzdGF0dXMgTElLRSAnYXBwcm92ZWQlJykKLS0gZmlyc3Qgcm93OiBvZmZpY2VyIDI1IChOYXJnaXphIEtoYXNhbm92LCBUYXNoa2VudCBTb3V0aCkg4oCUIDU4IG9mIDk1ID0gNjEuMSAlOyB0aGVuIDE2IGF0IDYxLjYgJSwgNiBhdCA2My4xICUKV2l0aG91dCBIQVZJTkcgdGhlIGxvd2VzdCBpcyBvZmZpY2VyIDgxIGF0IDYwLjggJSBvbiBvbmx5IDUxIGRlY2lzaW9ucyDigJQgdG9vIGZldyB0byBjYWxsIGEgcGF0dGVybi4gV2l0aCBjYW5jZWxsZWQgYXBwbGljYXRpb25zIGluIHRoZSBkZW5vbWluYXRvciB0aGUgb3JkZXIgY2hhbmdlcyAob2ZmaWNlciA3MSBjb21lcyBmaXJzdCksIHNvIHRoZSBjb252ZW50aW9uIGRlY2lkZXMgd2hvIGdldHMgdGhlIHBob25lIGNhbGwuCjYxICUgYWdhaW5zdCBhIDIwMjUgY29tcGFueSByYXRlIG9mIGFib3V0IDcwICUgaXMgZmlyc3QgYSBxdWVzdGlvbiBhYm91dCB0aGUgb2ZmaWNlcidzIGFwcGxpY2FudHMgKHByb2R1Y3QsIHNjb3JlKSwgYW5kIG9ubHkgdGhlbiBhYm91dCB0aGUgb2ZmaWNlci4="}
```

<!-- challenge:end -->
