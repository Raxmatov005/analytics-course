# Week 2 · Day 2 — Counting and summing: the portfolio in numbers

<span class="badge">Learn 60 min</span> <span class="badge">Practice 60 min</span> <span class="badge company">Company corner</span>

> STORY **Tuesday, 8:50.** Madina drops a printed slide on your desk: a table with five product rows and twelve month columns, half the cells crossed out in red pen. *"The October board pack. Timur builds this from the warehouse, but the warehouse loaded on the 1st and the board wants the September figures re-cut by product, by branch and by month — loans and disbursed amount — today. Yesterday you joined the tables. Today you add them up. And please, no Excel."*

## Today in 3 lines

- You can use the five **aggregates** (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`) with **GROUP BY** on one or several columns, filter groups with **HAVING**, and sort by an aggregate.
- You know the difference between **COUNT(\*)** and **COUNT(DISTINCT …)**, and why an aggregate after a one-to-many join gives a wrong — and plausible — number.
- You can produce **disbursements by month and product**, **average ticket**, and **approval rate by channel** in one query each.

---

## 1. Learn — aggregation: many rows into one number

### COUNT — rows, values and different values

**What it is.** An **aggregate function** (*агрегатная функция*) takes many rows and returns one value. **COUNT** counts, in three forms that answer three different questions:

- `COUNT(*)` counts **rows**.
- `COUNT(column)` counts the rows where that column is **not NULL**.
- `COUNT(DISTINCT column)` counts the **different** non-NULL values.

**How to write it.** On a tiny table of four payments:

| `pay` | loan_id | method |
|---|---|---|
| | 1 | card |
| | 1 | cash |
| | 2 | card |
| | 3 | NULL |

```sql
WITH pay(loan_id, method) AS (VALUES (1, 'card'), (1, 'cash'), (2, 'card'), (3, NULL))
SELECT COUNT(*)               AS rows_,        -- 4: every row
       COUNT(method)          AS with_method,  -- 3: the NULL is skipped
       COUNT(DISTINCT method) AS methods       -- 2: card and cash
FROM pay;
```

On the real data:

```sql
SELECT COUNT(*)                    AS loans,            -- 7 828
       COUNT(closed_at)            AS with_close_date,  -- 4 227
       COUNT(DISTINCT customer_id) AS borrowers         -- 4 335
FROM loans;
```

7 828 loans; 4 227 of them have a closing date; they belong to 4 335 different people, so many customers have more than one loan.

**When you use it.**

| Question | Write |
|---|---|
| How many loans? | `COUNT(*)` |
| How many loans have a closing date? | `COUNT(closed_at)` |
| How many different people borrowed? | `COUNT(DISTINCT customer_id)` |

> ⚠️ **Watch out.** "How many customers?" answered with `COUNT(*)` on `loans` counts loans, not people: 7 828 instead of 4 335. Count the column that names the thing you mean.

**Your turn.** How many different customers have ever applied for a loan? (One query on `applications`.)

```task
{"id": "w02d2-l1", "kind": "number", "answer": 5453, "dp": 0, "unit": "customers", "hint": "COUNT(DISTINCT customer_id) FROM applications.", "model": "5 453 different customers sent the 14 000 applications. COUNT(*) would say 14 000 — applications, not people."}
```

### SUM — add a column up

**What it is.** **SUM** adds up the values of a numeric column over the rows that are left after `WHERE`. NULL values are skipped.

**How to write it.**

```sql
SELECT SUM(principal) AS disbursed         -- 404 783 280 000
FROM loans;

SELECT SUM(principal) AS active_disbursed  -- 296 980 040 000
FROM loans
WHERE status = 'active';
-- WHERE first, then the sum over the rows that are left
```

404.8 bn UZS lent in total; 297.0 bn of it sits on loans that are still active.

**When you use it.** "How much": the amount lent, the amount received, the amount overdue. For "how many", use `COUNT`.

> ⚠️ **Watch out.** `SUM` over no rows returns NULL, not 0: `SELECT SUM(principal) FROM loans WHERE status = 'frozen'` gives NULL. Day 4's `COALESCE` turns it into 0.

**Your turn.** How much money arrived in payments from 1 January to 30 September 2026? Use `paid_at >= '2026-01-01' AND paid_at < '2026-10-01'`.

```task
{"id": "w02d2-l2", "kind": "number", "answer": 125703885377, "dp": 0, "unit": "UZS", "hint": "SUM(amount) FROM payments with the date filter in WHERE.", "model": "125 703 885 377 UZS (125.7 bn) in 25 146 payments."}
```

### AVG — the average, and the whole-number trap

**What it is.** **AVG** is the sum of the non-NULL values divided by their count. The result is one number for all the rows (or one per group, later).

**How to write it.**

```sql
SELECT AVG(principal)                   AS avg_ticket,  -- 51 709 667.86
       -- 51 709 667: whole number ÷ whole number
       SUM(principal) / COUNT(*)        AS int_division,
       1.0 * SUM(principal) / COUNT(*)  AS by_hand      -- 51 709 667.86
FROM loans;
-- SQL Server: AVG of an integer column is a whole number too — write AVG(1.0 *
-- principal)
```

The average loan is 51.7 m UZS. Divided by hand, two whole numbers lose the .86: the fraction is cut off, not rounded.

**When you use it.** Average ticket, average term, average days late. Put the count next to the average: an average over 3 loans and one over 3 000 look the same on a slide.

> ⚠️ **Watch out.** Whole number ÷ whole number = whole number. `SUM(term_months) / COUNT(*)` returns 11; the real average term is 11.78 months. Put `1.0 *` first, or use `AVG`. Day 3 comes back to division.

**Your turn.** What does `SELECT SUM(term_months) / COUNT(*) FROM loans` return on SQLite?

```task
{"id": "w02d2-l3", "kind": "number", "answer": 11, "dp": 0, "unit": "months", "hint": "Both sides are whole numbers. Run it, then run AVG(term_months) next to it.", "model": "11. The true average is 11.78 months; integer division cut the .78 off. 1.0 * SUM(term_months) / COUNT(*) or AVG(term_months) gives 11.78."}
```

### MIN and MAX — the smallest and the largest

**What it is.** **MIN** and **MAX** return the smallest and the largest value of a column. They work on numbers, dates and text.

**How to write it.**

```sql
SELECT MIN(principal)    AS smallest,      -- 300 000
       MAX(principal)    AS largest,       -- 599 060 000
       MIN(disbursed_at) AS first_loan,    -- 2024-01-02
       MAX(disbursed_at) AS last_loan      -- 2026-10-01
FROM loans;
```

Loans run from 300 000 to 599 060 000 UZS. The first was paid out on 2 January 2024, the last on the as-of date, 1 October 2026.

**When you use it.** The range of a column — the first check on any new table. The first and last date of a period. The oldest unpaid instalment (Wednesday's DPD uses `MIN(due_date)`). Dates stored as `'YYYY-MM-DD'` text work because the text sorts like the date.

> ⚠️ **Watch out.** On text, upper case sorts before lower case. `MAX(last_name)` on `customers` is `'yusupov'` — a surname typed in lower case, not the last name in the alphabet.

**Your turn.** On which date was the latest payment made? (`payments.paid_at`)

```task
{"id": "w02d2-l4", "kind": "text", "answer": ["2026-11-24"], "hint": "MAX(paid_at) FROM payments.", "model": "2026-11-24 — almost two months after the as-of date 2026-10-01. A payment from the future: P7 comes back to it."}
```

### GROUP BY one column — one row per group

**What it is.** **GROUP BY** (*группировка*) splits the rows into groups that share a value. Every aggregate then runs once per group, and the result has one row per group.

```pic
{"id": "w02d2-pic1", "title": "Five rows in, one row per group out", "caption": "Rows with the same `product` share a colour and fold into one row. `COUNT(*)` and `SUM(principal)` run once per colour: Auto 2 loans, 200 + 250 = 450.", "tables": [{"id": "ln", "name": "ln", "cols": ["loan_id", "product", "principal"], "rows": [[1, "Micro", 2], [2, "Auto", 200], [3, "Micro", 3], [4, "Auto", 250], [5, "BNPL", 4]], "tone": ["a", "b", "a", "b", "c"]}, {"id": "res", "name": "result", "cols": ["product", "loans", "total"], "rows": [["Auto", 2, 450], ["BNPL", 1, 4], ["Micro", 2, 5]], "tone": ["b", "c", "a"], "new": ["loans", "total"], "via": "GROUP BY product"}]}
```

**How to write it.** Five loans, three products:

| `ln` | loan_id | product | principal |
|---|---|---|---|
| | 1 | Micro | 2 |
| | 2 | Auto | 200 |
| | 3 | Micro | 3 |
| | 4 | Auto | 250 |
| | 5 | BNPL | 4 |

```sql
WITH ln(loan_id, product, principal) AS (VALUES (1, 'Micro', 2), (2, 'Auto', 200), (3, 'Micro', 3), (4, 'Auto', 250), (5, 'BNPL', 4))
SELECT product, COUNT(*) AS loans, SUM(principal) AS total
FROM ln
GROUP BY product;
```

| product | loans | total |
|---|---|---|
| Auto | 2 | 450 |
| BNPL | 1 | 4 |
| Micro | 2 | 5 |

Five rows in, three groups out. On the real data:

```sql
SELECT risk_grade, COUNT(*) AS loans, SUM(principal) AS principal
FROM loans
GROUP BY risk_grade;              -- A 1 821 · B 3 404 · C 2 264 · D 339
```

Four rows, one per grade. They add up to 7 828 — check this sum on every grouped result.

The rule behind most beginner errors: **every column in `SELECT` is either inside an aggregate or listed in `GROUP BY`.**

**When you use it.** "Per X", "by X", "for each X": loans per grade, payments per method, actions per collector.

> ⚠️ **Watch out.** `SELECT risk_grade, loan_id, COUNT(*) … GROUP BY risk_grade` asks for one `loan_id` per grade — which one, out of 3 404? SQL Server refuses the query ("not contained in an aggregate function or the GROUP BY clause"). SQLite silently picks one and runs. Never rely on it.

**Your turn.**

```game
{"id": "w02d2-g4", "type": "bug", "title": "One loan_id for a whole product", "q": "Madina wants the number of loans per product. One line asks for something a group cannot give.", "code": "SELECT product_id, loan_id, COUNT(*) AS loans\nFROM loans\nGROUP BY product_id;", "answer": [0], "why": "loan_id is neither in GROUP BY nor inside an aggregate, and a product has hundreds of loans. Drop loan_id from SELECT (or count it: COUNT(loan_id))."}
```

### GROUP BY two columns — one row per combination

**What it is.** With two columns in `GROUP BY`, a group is a **combination** of values. The result has one row for each combination that occurs in the data.

**How to write it.**

```sql
SELECT status, risk_grade, COUNT(*) AS loans
FROM loans
GROUP BY status, risk_grade
ORDER BY status, risk_grade;          -- 16 rows: 4 statuses × 4 grades
```

| status | risk_grade | loans |
|---|---|---|
| active | A | 750 |
| active | B | 1 445 |
| … | | |
| written_off | C | 98 |
| written_off | D | 30 |

16 rows, because every status occurs with every grade. Written-off loans: 13 in grade A, 98 in grade C — the grade predicts loss.

A combination that does not occur gets **no row** — not a row with 0. When you need the zeros, build the full grid with Day 1's `CROSS JOIN`.

A group can also be an **expression**. The month of a date is Wednesday's topic; you need it today, so copy it as it stands:

```sql
-- SQL Server:  FORMAT(l.disbursed_at, 'yyyy-MM')      SQLite: 
-- strftime('%Y-%m', l.disbursed_at)
SELECT strftime('%Y-%m', l.disbursed_at) AS month, p.name, COUNT(*) AS loans, SUM(l.principal) AS disbursed
FROM loans l JOIN products p ON p.product_id = l.product_id
WHERE l.disbursed_at >= '2026-01-01'
GROUP BY strftime('%Y-%m', l.disbursed_at), p.name
ORDER BY month, disbursed DESC;  -- 50 rows: 10 months × 5 products
```

`GROUP BY` repeats the expression: SQL Server does not accept the alias `month` there (SQLite accepts either).

**When you use it.** "By X and Y": by month and product, by region and segment. The result is **long**: one row per cell of the table you will show.

**Your turn.** How many rows does `SELECT channel, status, COUNT(*) FROM applications GROUP BY channel, status` return?

```task
{"id": "w02d2-l5", "kind": "number", "answer": 12, "dp": 0, "unit": "rows", "hint": "3 channels × 4 statuses — if every combination occurs.", "model": "12 rows: every one of the 3 channels has all 4 statuses. The largest group is branch / approved, 3 636 applications."}
```

### WHERE vs HAVING — filter rows, or filter groups

**What it is.** `WHERE` filters **rows before** grouping. **HAVING** filters **groups after** the aggregates are computed. "Active loans, branches with more than 300 of them" needs both.

```pic
{"id": "w02d2-pic2", "title": "WHERE picks the rows, HAVING picks the groups", "caption": "`WHERE` has already kept the active loans and `GROUP BY` has counted them per branch. Now `HAVING` asks each group: more than 300? Green groups stay, struck-through groups go.", "tables": [{"id": "grp", "name": "groups", "cols": ["branch_name", "active_loans"], "rows": [["Samarkand Central", 396], ["Fergana Central", 373], ["Andijan Central", 334], ["Namangan Central", 287], ["Bukhara Central", 270], ["Nukus Central", 213]], "keep": [0, 1, 2], "drop": [3, 4, 5], "more": "… and 4 more: 3 above, 1 below"}, {"id": "res", "name": "result", "cols": ["branch_name", "active_loans"], "rows": [["Tashkent Central", 435], ["Tashkent North", 428], ["Tashkent South", 416], ["Samarkand Central", 396], ["Fergana Central", 373], ["Andijan Central", 334]], "via": "HAVING COUNT(*) > 300"}]}
```

**How to write it.**

```sql
SELECT b.branch_name, COUNT(*) AS active_loans
FROM loans l JOIN branches b ON b.branch_id = l.branch_id
WHERE l.status = 'active'  -- keep only active loans (rows)
GROUP BY b.branch_name
-- keep only branches with more than 300 of them (groups)
HAVING COUNT(*) > 300
ORDER BY active_loans DESC;
-- 6 branches: Tashkent Central 435 … Andijan Central 334
```

Six of the ten branches have more than 300 active loans, from Tashkent Central with 435 down to Andijan Central with 334.

**When you use it.**

| | WHERE | HAVING |
|---|---|---|
| Filters | rows | groups |
| Runs | before `GROUP BY` | after `GROUP BY` |
| May use an aggregate | no | yes |
| Example | `l.status = 'active'` | `COUNT(*) > 300` |

> ⚠️ **Watch out.** `WHERE COUNT(*) > 300` is an error: when `WHERE` runs, no count exists yet. A condition on a plain column belongs in `WHERE` even when the query has a `HAVING` — it is cheaper, and it means "before counting".

**Your turn.** Put the three clauses into the gaps:

```game
{"id": "w02d2-g1", "type": "cloze", "title": "WHERE, GROUP BY or HAVING?", "text": "SELECT b.branch_name, COUNT(*) AS active_loans FROM loans l JOIN branches b ON b.branch_id = l.branch_id {{0}} l.status = 'active' {{1}} b.branch_name {{2}} COUNT(*) > 300 ORDER BY active_loans DESC;", "blanks": [["WHERE"], ["GROUP BY"], ["HAVING"]], "distractors": ["ORDER BY", "SUM", "DISTINCT"]}
```

### Aggregating over a join — decide what one row is

**What it is.** When you aggregate after a join, `COUNT` and `SUM` run over the rows of the **join result**. One row of that result is one row of the "many" side (Day 1). So decide first what one row is; then decide what to count or sum.

**How to write it.** A many-to-one join keeps one row per loan, so loan counts and sums stay right:

```sql
SELECT p.name, COUNT(*) AS loans, COUNT(DISTINCT l.customer_id) AS customers, SUM(l.principal) AS disbursed
FROM loans l
-- many-to-one: one row is still one loan
JOIN products p ON p.product_id = l.product_id
GROUP BY p.name
ORDER BY disbursed DESC;
```

| name | loans | customers | disbursed |
|---|---|---|---|
| Small business loan | 781 | 724 | 241 117 150 000 |
| Auto loan | 391 | 381 | 84 791 530 000 |
| Consumer loan | 2 418 | 2 000 | 65 109 280 000 |
| Micro loan | 2 669 | 2 133 | 7 221 210 000 |
| Buy now pay later | 1 569 | 1 364 | 6 544 110 000 |

Micro borrowers come back: 2 669 loans for 2 133 people.

A one-to-many join repeats each loan, so a loan column summed over it is wrong:

```sql
SELECT p.name, SUM(l.principal)
-- one-to-many: one row is an instalment
FROM loans l JOIN installments i ON i.loan_id = l.loan_id
JOIN products p ON p.product_id = l.product_id
GROUP BY p.name;
-- SME 5 862 295 560 000 — 24× too big, and nobody would blink
```

Each principal is counted once per instalment. The factor is the term, which differs by product, so even the ranking changes: BNPL overtakes Micro.

| Join | One row is | `COUNT(*)` counts | `SUM(l.principal)` |
|---|---|---|---|
| `loans → products` | a loan | loans | right |
| `loans → installments` | an instalment | instalments | wrong: each principal × its term |

**When you use it.** Every grouped report whose labels live in another table: product names, branch names, regions. The rule: **aggregate a column at the grain of its own table.** Loan amounts over `loans`; instalment amounts over `installments`. When you need both in one result, aggregate each table separately and join the results — Week 3 gives you the tool.

> ⚠️ **Watch out.** When a query joins a one-to-many table, run `COUNT(*)` and `COUNT(DISTINCT l.loan_id)` next to each other first. If they differ, the join has multiplied the loans — do not `SUM` or `AVG` a loan column over it.

**Your turn.** In `FROM customers c JOIN loans l ON l.customer_id = c.customer_id GROUP BY c.region`, what does `COUNT(*)` count?

```task
{"id": "w02d2-l6", "kind": "choice", "options": ["Loans of the region's customers — one row of the join is one loan", "Customers of the region", "Branches of the region", "Customers with exactly one loan"], "answer": 0, "explain": "customers → loans is one-to-many, so one row is a loan: Tashkent shows 3 020. For people, write COUNT(DISTINCT c.customer_id) — 1 696 in Tashkent."}
```

### ORDER BY an aggregate or its alias

**What it is.** After grouping, `ORDER BY` can sort by an aggregate (`ORDER BY COUNT(*) DESC`), by its alias (`ORDER BY active_loans DESC`) or by the column's position (`ORDER BY 2 DESC`). With `LIMIT` it gives a **top-N**.

**How to write it.**

```sql
SELECT b.branch_name, COUNT(*) AS active_loans
FROM loans l JOIN branches b ON b.branch_id = l.branch_id
WHERE l.status = 'active'
GROUP BY b.branch_name
-- the alias; COUNT(*) DESC or 2 DESC give the same order
ORDER BY active_loans DESC
LIMIT 3;
-- SQL Server: SELECT TOP 3 … (drop the LIMIT line)
```

Tashkent Central 435, Tashkent North 428, Tashkent South 416 — the three Tashkent branches hold the most active loans.

**When you use it.** Top-N and bottom-N: the biggest products, the weakest branches, the busiest collectors. Prefer the alias to a position: `ORDER BY 2` silently sorts by another column once someone adds a column in front.

> ⚠️ **Watch out.** A count and an amount rank differently. By number of active loans Tashkent South is third; by active principal it is fourth, behind Fergana Central. Sort by the measure the question names, and say which one in the title.

**Your turn.** The three branches with the largest amount disbursed in 2026 (`disbursed_at >= '2026-01-01'`), largest first.

```task
{"id": "w02d2-l7", "kind": "sql", "model": "SELECT b.branch_name, SUM(l.principal) AS disbursed FROM loans l JOIN branches b ON b.branch_id = l.branch_id WHERE l.disbursed_at >= '2026-01-01' GROUP BY b.branch_name ORDER BY disbursed DESC LIMIT 3;", "note": "Tashkent South 21.6 bn, Fergana Central 19.7 bn, Samarkand Central 19.4 bn. SQL Server: SELECT TOP 3 instead of LIMIT 3."}
```

### The order a query runs in

**What it is.** The database does not run a query top to bottom as you write it. It runs the clauses in this order:

```text
FROM / JOIN   which rows
   ▼
WHERE         keep rows
   ▼
GROUP BY      make groups
   ▼
HAVING        keep groups
   ▼
SELECT        compute columns
   ▼
ORDER BY      sort
   ▼
LIMIT         cut
```

**How to read it.** Each clause sees only what the clauses before it produced:

| Because … | you cannot write | write instead |
|---|---|---|
| `WHERE` runs before `GROUP BY` | `WHERE COUNT(*) > 300` | `HAVING COUNT(*) > 300` |
| `WHERE` runs before `SELECT` | `WHERE active_loans > 300` (the alias does not exist yet) | repeat the expression, or use `HAVING` |
| `GROUP BY` runs before `SELECT` | `GROUP BY month` on SQL Server | repeat `strftime('%Y-%m', …)` in `GROUP BY` (SQLite accepts the alias) |
| `ORDER BY` runs after `SELECT` | — | `ORDER BY active_loans` works everywhere |

**When you use it.** Whenever an error says a column or an alias does not exist, or an aggregate is not allowed: find the clause in the line above and ask what has already run.

**Your turn.** Put the clauses in the order the database runs them:

```game
{"id": "w02d2-g2", "type": "order", "title": "The order a query runs in", "items": ["FROM", "JOIN", "WHERE", "GROUP BY", "HAVING", "SELECT", "ORDER BY", "LIMIT"]}
```

### Set operators — stacking results

**What it is.** Joins put tables side by side; **set operators** (*операции над множествами*) put query results **on top of each other**. Both queries must return the same number of columns, of compatible types.

```pic
{"id": "w02d2-pic3", "title": "UNION stacks one result on the other, then removes repeats", "caption": "Customers 2, 5 and 17 only. `UNION` puts the second list under the first and strikes out every row it has already seen: 5 and 17 are in both lists. `UNION ALL` would keep all five rows.", "tables": [{"id": "l", "name": "loans", "cols": ["customer_id"], "rows": [[5], [17]], "tone": ["a", "b"]}, {"id": "a", "name": "applications", "cols": ["customer_id"], "rows": [[5], [2], [17]], "tone": ["a", "c", "b"]}, {"id": "res", "name": "result", "cols": ["customer_id"], "rows": [[5], [17], [5], [2], [17]], "tone": ["a", "b", "a", "c", "b"], "drop": [2, 4], "via": "UNION"}]}
```

**How to write it.**

```sql
SELECT customer_id FROM loans
UNION                                  -- stack, then remove duplicate rows
SELECT customer_id FROM applications;  -- 5 453 rows
```

5 453 rows — every customer who applied, because every borrower also applied.

| Operator | Keeps | On our data |
|---|---|---|
| `UNION` | all rows of both, **duplicates removed** | the query above → 5 453 rows |
| `UNION ALL` | all rows of both, duplicates kept (fast) | the same with `UNION ALL` → 21 828 rows (7 828 + 14 000) |
| `EXCEPT` | rows of the first query not in the second | `applications` `EXCEPT` `loans` → 1 118 people who applied and never got a loan |
| `INTERSECT` | rows in both | applicants who are also borrowers → 4 335 |

**When you use it.** `UNION ALL` stacks "this month" and "last month" blocks into one table for a chart. `EXCEPT` is an anti-join written as sets.

> 💡 **Key idea.** Default to `UNION ALL`. `UNION` must sort to remove duplicates, and it quietly merges rows that are legitimately identical — two months with the same count become one row.

**Your turn.** "Customers who applied but never got a loan", as a list of ids. Which operator?

```task
{"id": "w02d2-l8", "kind": "choice", "options": ["UNION", "UNION ALL", "EXCEPT", "INTERSECT"], "answer": 2, "explain": "SELECT customer_id FROM applications EXCEPT SELECT customer_id FROM loans → 1 118 ids: in the first result, not in the second."}
```

### Putting it together

One request, every tool of the day. *"Active loans per branch: how many, how much, the average ticket — only branches with more than 300 active loans, largest amount first."*

```sql
SELECT b.branch_name,
       -- COUNT: one row of the group = one loan
       COUNT(*)                AS active_loans,
       SUM(l.principal)        AS active_principal,  -- SUM over the same rows
       -- AVG; ROUND (Wednesday) = whole UZS
       ROUND(AVG(l.principal)) AS avg_ticket
FROM loans l
-- many-to-one: one row is still a loan
JOIN branches b ON b.branch_id = l.branch_id
WHERE l.status = 'active'                            -- rows, before grouping
GROUP BY b.branch_name                               -- one row per branch
HAVING COUNT(*) > 300                                -- groups, after grouping
ORDER BY active_principal DESC;                      -- the alias, after SELECT
```

| branch_name | active_loans | active_principal | avg_ticket |
|---|---|---|---|
| Tashkent Central | 435 | 42 718 190 000 | 98 202 736 |
| Tashkent North | 428 | 38 262 090 000 | 89 397 407 |
| Fergana Central | 373 | 36 994 490 000 | 99 180 938 |
| Tashkent South | 416 | 36 954 370 000 | 88 832 620 |
| Samarkand Central | 396 | 35 511 850 000 | 89 676 389 |
| Andijan Central | 334 | 27 620 130 000 | 82 695 000 |

Read it in the order it runs: `FROM … JOIN` gives one row per loan with its branch; `WHERE` keeps the 3 352 active ones; `GROUP BY` makes ten branch groups; `HAVING` keeps six; `SELECT` computes the three numbers; `ORDER BY` sorts by the amount. Fergana Central has fewer active loans than Tashkent South but more money in them: its average ticket is the highest of the six.

### Depth (optional)

- ▶ Baraa, *Aggregate functions* [8:43:36](https://youtu.be/SSKVgrwhzus?t=31416&end=31811) — 7 min; and *Set operators* [4:02:09](https://youtu.be/SSKVgrwhzus?t=14529&end=17261) — 40 min.
- RU deck (TBC Data Analytics 2.0, if you have it) `2.2 SQL-1-38.pdf` — GROUP BY / HAVING pages. *Russian terms:* агрегатная функция = aggregate, группировка = GROUP BY, средний чек = average ticket, объединение = UNION.

```videoquiz
{"video": "SSKVgrwhzus", "stops": [
  {"at": 15100, "q": "Two queries are stacked with UNION. Which rule must they follow?", "options": ["Same number of rows", "Same number of columns, of compatible types", "The same table in FROM", "An ORDER BY in each query"], "answer": 1, "explain": "Set operators stack results row under row, so the columns must line up; the row counts can be anything.", "back": 60},
  {"at": 15900, "q": "What is the difference between UNION and UNION ALL?", "options": ["UNION ALL removes duplicates, UNION keeps them", "UNION removes duplicate rows, UNION ALL keeps every row", "UNION works only on two tables, UNION ALL on many", "There is none"], "answer": 1, "explain": "UNION de-duplicates (and must sort to do it); UNION ALL keeps everything and is faster — the default unless you want de-duplication.", "back": 60},
  {"at": 16800, "q": "Which operator returns the rows of the first query that do not appear in the second?", "options": ["INTERSECT", "UNION", "EXCEPT", "UNION ALL"], "answer": 2, "explain": "EXCEPT is an anti-join written as sets: applicants EXCEPT borrowers = 1 118 people who never got a loan.", "back": 60},
  {"at": 31600, "q": "What does an aggregate function like SUM or AVG return over a set of rows?", "options": ["One value for the whole set (or for each group)", "One value per row", "The rows sorted", "Only the rows that are not NULL"], "answer": 0, "explain": "Aggregates collapse many rows into one number; with GROUP BY they return one number per group.", "back": 60}]}
```

---

## 2. Worked example — the board-pack table

**Ask (Madina):** *loans and disbursed amount in 2026, by month and product.*

Each step uses one subsection of section 1, in the order you learned them.

1. **COUNT and SUM.** "Loans" is `COUNT(*)`; "disbursed amount" is `SUM(principal)`. Both read `loans`, where one row is one loan.
2. **GROUP BY two columns.** One row of the answer per (month, product). The month is the expression `strftime('%Y-%m', l.disbursed_at)`, repeated in `GROUP BY`.
3. **WHERE vs HAVING.** The period is a condition on rows, so it goes in `WHERE`: `disbursed_at >= '2026-01-01'` (and `< '2027-01-01'` if the data could run further; ours stops on 2026-10-01). No condition on a group, so no `HAVING`.
4. **Aggregating over a join.** The product name lives in `products`. `loans → products` is many-to-one, so one row is still one loan and the sums stay right. No instalments needed.
5. **ORDER BY.** By month, then by the alias `disbursed`, largest first.
6. Query: section 1's month × product query. First rows of the result:

| month | product | loans | disbursed |
|---|---|---|---|
| 2026-01 | Small business loan | 34 | 10 042 990 000 |
| 2026-01 | Auto loan | 20 | 4 620 560 000 |
| 2026-01 | Consumer loan | 90 | 2 337 660 000 |
| 2026-01 | Micro loan | 99 | 262 110 000 |
| 2026-01 | Buy now pay later | 44 | 189 050 000 |
| 2026-02 | Small business loan | 21 | 6 035 880 000 |
| … | | | |

50 rows (10 months × 5 products; October has one day). This is the **long format** — one row per cell of Madina's slide. Her slide is the **wide** format (months across). Turning long into wide is Thursday's `SUM(CASE …)` or, in practice, a pivot table in Excel/Power BI on top of exactly this result. Deliver the long table; it is the one that is right.

7. **Check against the ungrouped total.** `SELECT COUNT(*), SUM(principal) FROM loans WHERE disbursed_at >= '2026-01-01'` → 3 051 loans, 162 333 060 000. The 50 rows must add up to that. They do.

---

## 3. Practice (60 min)

Questions whose answer is a query have a box under them — write, **▶ Run**, then **✔ Check** compares your result with the answer without showing it; your query is saved in this browser. Questions that ask for a number or a reason have an answer box of their own. The questions follow section 1 in order; the label in brackets names the subsection each one trains. Yesterday's joins plus today's aggregates; no `CASE` yet. The **Database** panel (button at the bottom right) lists every table and column.

**P1.** *(COUNT)* For `customers`, in one query: the number of rows, the number of customers with an income on file, and the number of different regions. How many customers have **no** income on file?

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) AS customers, COUNT(monthly_income) AS with_income, COUNT(DISTINCT region) AS regions
FROM customers;  -- 6040 · 5684 · 8
```
6 040 − 5 684 = **356** customers have NULL in `monthly_income`: `COUNT(column)` skipped them. Day 4 is about those 356.

</details>

**P2.** *(SUM)* Total principal of SME loans (`product_id = 5`) and of all loans. What share of the money lent is SME? (Divide by hand.)

<details><summary>Answer</summary>

```sql
SELECT SUM(principal) FROM loans WHERE product_id = 5;        -- 241 117 150 000
SELECT SUM(principal) FROM loans;                             -- 404 783 280 000
```
241.1 bn of 404.8 bn = **59.6 %**. 781 loans of 7 828 (10 %) carry six tenths of the money.

</details>

**P3.** *(AVG)* Average principal of active loans, once with `AVG` and once as `SUM(principal) / COUNT(*)`. Why do the two numbers differ?

<details><summary>Answer</summary>

```sql
SELECT AVG(principal) AS avg_ticket, SUM(principal) / COUNT(*) AS by_hand, COUNT(*) AS loans
FROM loans WHERE status = 'active';
-- 88 597 863.96 · 88 597 863 · 3352
```
Both sides of `SUM(principal) / COUNT(*)` are whole numbers, so the division is whole too: the .96 is cut off. `1.0 * SUM(principal) / COUNT(*)` gives the same 88 597 863.96 as `AVG`. (On SQL Server `AVG` of an integer column is whole as well.)

</details>

**P4.** *(MIN and MAX)* The smallest and the largest Micro loan (`product_id = 1`), and the first and last application time in `applications`.

<details><summary>Answer</summary>

```sql
SELECT MIN(principal), MAX(principal) FROM loans WHERE product_id = 1;
-- 500 000 · 4 990 000
SELECT MIN(applied_at), MAX(applied_at) FROM applications;
-- 2024-01-01 10:07:00 · 2026-10-01 21:36:00
```
Micro loans run from 0.5 m to 4.99 m UZS. Applications start on 1 January 2024 and end on the evening of the as-of date.

</details>

**P5.** *(GROUP BY one column)* Loans and total principal by `status`, largest total first.

<details><summary>Answer</summary>

```sql
SELECT status, COUNT(*) AS loans, SUM(principal) AS principal
FROM loans GROUP BY status ORDER BY principal DESC;
```
active 3 352 / 296.98 bn · closed 4 242 / 94.15 bn · written_off 190 / 10.02 bn · default 44 / 3.63 bn. Closed loans are more numerous but smaller — short Micro and BNPL loans close fast.

</details>

**P6.** *(GROUP BY one column)* Loans disbursed per year, with the total and the average ticket, rounded to whole UZS (`ROUND(x)` rounds to a whole number; Wednesday covers it properly).

<details><summary>Answer</summary>

```sql
-- SQL Server: YEAR(disbursed_at)          SQLite: strftime('%Y', disbursed_at)
SELECT strftime('%Y', disbursed_at) AS yr, COUNT(*) AS loans, SUM(principal) AS disbursed, ROUND(AVG(principal)) AS avg_ticket
FROM loans GROUP BY strftime('%Y', disbursed_at) ORDER BY yr;
```
2024: 1 736 loans, 86.52 bn · 2025: 3 041, 155.93 bn · 2026 (to 1 Oct): 3 051, 162.33 bn. Nine months of 2026 already beat all of 2025.

</details>

**P7.** *(GROUP BY one column)* Payments received in 2026, count and sum per month. Anything odd at the end of the list?

<details><summary>Answer</summary>

```sql
SELECT strftime('%Y-%m', paid_at) AS month, COUNT(*) AS payments, SUM(amount) AS received
FROM payments WHERE paid_at >= '2026-01-01' GROUP BY strftime('%Y-%m', paid_at) ORDER BY month;
```
January 2 466 / 11.76 bn rising to September 3 159 / 16.34 bn — then **2026-10: 52** and **2026-11: 8**. The data is as of 1 October; 60 payments are dated 1 October or later, and **24** of them are dated *after* the as-of date (the last on 2026-11-24). Either the extract ran later than its label, or these are scheduled direct-debits recorded ahead. Note it for Timur; Friday asks about it.

</details>

How many payments are dated **after** the as-of date 2026-10-01? (One more query: `WHERE paid_at > '2026-10-01'`.)

```task
{"id": "w02d2-p10", "kind": "number", "answer": 24, "dp": 0, "unit": "payments", "hint": "COUNT(*) FROM payments with paid_at strictly greater than '2026-10-01'.", "model": "24 payments, the last on 2026-11-24 — money 'received' before the date it was received. Either the extract ran later than its label or these are forward-dated debits; a note for Timur."}
```

**P8.** *(GROUP BY one column)* Payments by `method`: count and total amount, most frequent first. Look at the result carefully.

<details><summary>Answer</summary>

```sql
SELECT method, COUNT(*) AS payments, SUM(amount) AS total FROM payments GROUP BY method ORDER BY payments DESC;
```
Ten rows where there should be five: `card` 17 564 **and** `Card` 57; `click` 8 754 and `Click` 36; `payme` 8 870 and `PayMe` 30; `cash` 8 760 and `CASH ` (trailing space) 30; `transfer` 8 747 and `bank transfer` 27. 180 rows carry a differently spelt method, so every "share by method" is off and *card* looks like it has 57 fewer payments than it does. `GROUP BY` groups *exact* values — a space or a capital letter is a different group. We fix this tomorrow with `LOWER`, `TRIM` and `REPLACE`. (These ten rows are SQLite's. SQL Server's default collation ignores case and trailing spaces, so there `GROUP BY method` shows six rows and the stray spellings hide inside `card`, `click`, `payme` and `cash`; write `GROUP BY method COLLATE Latin1_General_CS_AS` to get the same ten rows.)

</details>

How many groups does your query return (on SQLite)? Then, in the answer's explanation, see why that is not five.

```task
{"id": "w02d2-p9", "kind": "number", "answer": 10, "dp": 0, "unit": "groups", "hint": "Count the rows of your result — then look at the spellings.", "model": "10 groups for 5 real methods: card/Card, click/Click, payme/PayMe, cash/'CASH ' (trailing space), transfer/bank transfer. GROUP BY groups exact values, so 180 differently spelt rows make five phantom categories."}
```

> ⚠️ **Watch out.** `GROUP BY` groups *exact* values. `'Card'`, `'card'` and `'card '` are three groups — look at the labels of every grouped result before you trust its counts.

**P9.** *(GROUP BY two columns)* Loans by branch (name and region), with the sum of principal, most money first. Which branch lends the most?

<details><summary>Answer</summary>

```sql
SELECT b.branch_name, b.region, COUNT(*) AS loans, SUM(l.principal) AS disbursed
FROM loans l JOIN branches b ON b.branch_id = l.branch_id
GROUP BY b.branch_name, b.region ORDER BY disbursed DESC;
```
Tashkent Central 1 001 loans / 55.64 bn first, although Tashkent South has more loans (1 012 / 53.36 bn). Termez Central last: 483 / 22.99 bn. Count and amount rank differently — say which you sorted by. Ten rows, not more: each branch has one region, so the second column adds a label, not groups.

</details>

**P10.** *(GROUP BY two columns)* Applications by `channel` and product name. How many rows come back, and why not 3 × 5 = 15?

<details><summary>Answer</summary>

```sql
SELECT a.channel, p.name AS product, COUNT(*) AS applications
FROM applications a JOIN products p ON p.product_id = a.product_id
GROUP BY a.channel, p.name ORDER BY a.channel, applications DESC;
```
5 rows: app → Micro 5 006; branch → Consumer 4 204, SME 1 354, Auto 665; partner → BNPL 2 771. A combination that never occurs gets no row: the app sells only Micro loans and partners only BNPL.

</details>

```task
{"id": "w02d2-l10", "kind": "number", "answer": 5, "dp": 0, "unit": "rows", "hint": "Count the rows of your result.", "model": "5 rows. GROUP BY returns only the combinations that occur: each channel sells its own products (app → Micro, partner → BNPL, branch → Consumer, SME, Auto)."}
```

**P11.** *(WHERE vs HAVING)* Branches with more than 900 loans, most first.

<details><summary>Answer</summary>

```sql
SELECT b.branch_name, COUNT(*) FROM loans l JOIN branches b ON b.branch_id = l.branch_id
GROUP BY b.branch_name HAVING COUNT(*) > 900 ORDER BY 2 DESC;
-- Tashkent South 1012, Tashkent North 1007, Tashkent Central 1001, Fergana
-- Central 906
```
A condition on an aggregate → `HAVING`. Writing it in `WHERE` is a syntax error, which is the kind one.

</details>

**P12.** *(WHERE vs HAVING)* Products whose average ticket exceeds 50 000 000.

<details><summary>Answer</summary>

```sql
SELECT p.name, AVG(l.principal) FROM loans l JOIN products p ON p.product_id = l.product_id
GROUP BY p.name HAVING AVG(l.principal) > 50000000;
-- Auto 216.9 m, SME 308.7 m
```

</details>

**P13.** *(WHERE vs HAVING)* Customers with more than one loan: one row per such customer with their number of loans, most loans first.

<details><summary>Answer</summary>

```sql
SELECT customer_id, COUNT(*) AS loans FROM loans GROUP BY customer_id HAVING COUNT(*) > 1 ORDER BY loans DESC;
```
2 246 rows — the line above the result table tells you the row count. Four customers have 7 loans each (ids 1893, 3216, 4435, 5478). Getting that 2 246 as a number *inside* SQL means counting the rows of a grouped result — `SELECT COUNT(*) FROM ( … )`, a subquery, Week 3 Day 3.

</details>

So how many customers have more than one loan? (Read it off the row count of your result.)

```task
{"id": "w02d2-p6", "kind": "number", "answer": 2246, "dp": 0, "unit": "customers", "hint": "Your grouped query returns one row per such customer; the box shows how many rows came back.", "model": "2 246 customers have two or more loans — about half of the 4 335 borrowers. Four of them have 7 loans each."}
```

**P14.** *(WHERE vs HAVING)* Collections actions by type, and the number of those actions that ended in a promise to pay, by type — two grouped queries.

<details><summary>Answer</summary>

```sql
SELECT action_type, COUNT(*) AS actions FROM collections_actions GROUP BY action_type ORDER BY actions DESC;
SELECT action_type, COUNT(*) AS promises FROM collections_actions WHERE outcome = 'promise_to_pay' GROUP BY action_type;
```
sms 1 254 / 3 265 = 38.4 % · visit 381 / 1 506 = 25.3 % · call 785 / 3 114 = 25.2 % · restructure_offer 344 / 1 476 = 23.3 %. The outcome filter is a condition on rows, so it goes in `WHERE`, before the count. SMS "wins" because it is the first action on every late loan, when borrowers still answer; it says nothing about which action *works*. Tomorrow you divide inside the query.

</details>

Divide by hand: what is the highest share of actions ending in a promise to pay, in % to one decimal?

```task
{"id": "w02d2-p7", "kind": "number", "answer": 38.4, "dp": 1, "unit": "%", "hint": "promises ÷ actions × 100 for each type; the largest share wins.", "model": "SMS: 1 254 of 3 265 = 38.4 % (visit 25.3, call 25.2, restructure_offer 23.3). SMS is the first touch on every late loan, while borrowers still answer — the share says nothing about which action works."}
```

**P15.** *(Aggregating over a join)* The multiplication trap, measured. For active loans: `COUNT(*)` and `COUNT(DISTINCT l.loan_id)` over `loans JOIN payments`, and `SUM(principal)` over `loans` alone.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*), COUNT(DISTINCT l.loan_id) FROM loans l JOIN payments p ON p.loan_id = l.loan_id WHERE l.status = 'active';
-- 22511 rows, 2971 loans  → the join multiplied; 381 active loans have no
-- payment yet and vanished (inner join)
SELECT SUM(principal) FROM loans WHERE status = 'active';
-- 296 980 040 000 (right)
```
`SUM(l.principal)` over the join is in the trillions — every principal counted once per payment. When the two counts differ, aggregate loan columns on `loans` alone.

</details>

**P16.** *(ORDER BY an aggregate)* The three busiest collectors: name and number of collections actions, most first. Group by `staff_id` **and** `full_name` — then try `full_name` alone and compare the top row.

<details><summary>Answer</summary>

```sql
SELECT s.staff_id, s.full_name, COUNT(*) AS actions
FROM collections_actions ca JOIN staff s ON s.staff_id = ca.collector_id
GROUP BY s.staff_id, s.full_name
ORDER BY actions DESC
LIMIT 3;                                  -- SQL Server: SELECT TOP 3 …
```
Bekzod Mirzaev (28) 593 · Ilhom Qodirov (27) 590 · Bobur Tashkentov (29) 568. Grouped by `full_name` alone, "Nilufar Jalilov" comes first with 648 — but that is two collectors with the same name (staff 7 with 393 actions, staff 79 with 255). Group by the key; show the name next to it.

</details>

**P17.** *(The order a query runs in)* In `SELECT … FROM loans WHERE … GROUP BY … HAVING … ORDER BY … LIMIT 5`, what does `LIMIT 5` cut?

```task
{"id": "w02d2-l9", "kind": "choice", "options": ["The sorted groups: five rows of the result, after HAVING and ORDER BY", "The first five loans, before grouping", "The first five groups, before HAVING", "Five rows of every group"], "answer": 0, "explain": "LIMIT runs last: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. It keeps the first five rows of the finished, sorted result."}
```

> 🚀 **Stretch (optional, +5 XP).** Set operators in practice — not needed to finish the day.

**P18.** *(Set operators)* Using `UNION ALL`, build one result with two labelled rows: `'2025'` with its loan count and `'2026'` with its loan count. Then run the same with `UNION`.

<details><summary>Answer</summary>

```sql
SELECT '2025' AS yr, COUNT(*) AS loans FROM loans WHERE disbursed_at >= '2025-01-01' AND disbursed_at < '2026-01-01'
UNION ALL
SELECT '2026', COUNT(*) FROM loans WHERE disbursed_at >= '2026-01-01';
-- 3041 / 3051
```
The label column makes the rows different, so `UNION` keeps both. Without the label, two equal counts would collapse into one row under `UNION` — the classic silent loss. Default to `UNION ALL`.

</details>

Why do `UNION` and `UNION ALL` give the same two rows here — and when would `UNION` lose one?

```task
{"id": "w02d2-p11", "kind": "free", "min": 20, "model": "UNION removes only rows that are identical in every column. Here the rows are ('2025', 3041) and ('2026', 3051): the label column alone makes them different, so nothing is removed. If I dropped the label and both years had the same count, the two rows would be identical and UNION would silently keep one — so I default to UNION ALL.", "rubric": ["Says UNION removes rows identical in every column", "Points to the label column (or the different counts) as what keeps the rows apart", "Names the case that loses a row: no label and equal counts", "Recommends UNION ALL as the default"], "xp": 2}
```

### SQL lab — summary tables

An aggregate result can be saved as a table of its own — that is how a board pack is built: one summary table per slide. This lab runs on **your practice copy** of the database (the **Database** panel shows your new tables; **Database → Reset** brings the original back).

```sqllab
{"id": "w02d2-lab", "title": "Madina's product summary", "intro": "Save the loans-by-product summary as a table, add a column, correct one row and trim it to the products the volume slide needs — then build a second summary with HAVING.",
 "steps": [
  {"say": "Create my_product_summary from a grouped query: product name (as product), number of loans (as loans) and total principal (as disbursed), one row per product.", "hint": "CREATE TABLE my_product_summary AS SELECT p.name AS product, COUNT(*) AS loans, SUM(l.principal) AS disbursed FROM loans l JOIN products p ON p.product_id = l.product_id GROUP BY p.name;", "expect": "SELECT COUNT(*) FROM my_product_summary", "want": 5},
  {"say": "Add a column avg_ticket INTEGER and fill it with disbursed / loans for every row.", "hint": "ALTER TABLE my_product_summary ADD COLUMN avg_ticket INTEGER; UPDATE my_product_summary SET avg_ticket = disbursed / loans;", "expect": "SELECT avg_ticket FROM my_product_summary WHERE product = 'Micro loan'", "want": 2705586},
  {"say": "The slide says 'BNPL', not 'Buy now pay later'. UPDATE that one row's product name.", "hint": "UPDATE my_product_summary SET product = 'BNPL' WHERE product = 'Buy now pay later';", "expect": "SELECT COUNT(*) FROM my_product_summary WHERE product = 'BNPL'", "want": 1},
  {"say": "The volume slide shows only products with at least 1 000 loans. DELETE the other rows.", "hint": "DELETE FROM my_product_summary WHERE loans < 1000;", "expect": "SELECT COUNT(*) FROM my_product_summary", "want": 3},
  {"say": "Now the branch slide: create my_branch_summary (branch_name, loans) with only the branches that have more than 900 loans — filter the groups with HAVING.", "hint": "CREATE TABLE my_branch_summary AS SELECT b.branch_name, COUNT(*) AS loans FROM loans l JOIN branches b ON b.branch_id = l.branch_id GROUP BY b.branch_name HAVING COUNT(*) > 900;", "expect": "SELECT COUNT(*) FROM my_branch_summary", "want": 4}],
 "cleanup": "DROP TABLE IF EXISTS my_product_summary; DROP TABLE IF EXISTS my_branch_summary"}
```

Step 2's average is a whole number because `disbursed / loans` divides two integers — the fraction is cut off, not rounded (2 705 586.36 became 2 705 586). Wednesday shows why, and the one-character fix.

---

## 4. Homework

No new homework. **HW 2.1** (Bekzod's loan book) is due tomorrow — with today's tools you can now finish **Q6** (loans per officer is a `GROUP BY`) and **Q10** (a `COUNT(*)` and a `SUM` over the duplicate customers' loans).

---

## 5. Self-check

```check
{"id": "w02d2-sc", "questions": [
  {"type": "single", "q": "'Active loans per branch, only branches with more than 300 of them.' Where does each condition go?", "options": ["status = 'active' in WHERE, COUNT(*) > 300 in HAVING", "Both in WHERE", "Both in HAVING", "status = 'active' in HAVING, COUNT(*) > 300 in WHERE"], "answer": 0, "explain": "WHERE filters rows before grouping; HAVING filters groups after the counts exist (→ section 1, WHERE vs HAVING)."},
  {"type": "single", "q": "What is wrong with `SELECT p.name, l.loan_id, COUNT(*) … GROUP BY p.name`?", "options": ["Nothing", "loan_id is neither aggregated nor grouped: SQL Server refuses it, SQLite picks one loan_id at random", "COUNT(*) cannot be used with GROUP BY", "p.name must be inside an aggregate"], "answer": 1, "explain": "Every SELECT column is either inside an aggregate or in GROUP BY (→ section 1, GROUP BY one column)."},
  {"type": "single", "q": "You sum `l.principal` over `loans JOIN installments`. Which quick check would have shown that the sum is wrong?", "options": ["COUNT(*) next to COUNT(DISTINCT l.loan_id) — they differ", "MAX(principal) next to MIN(principal)", "Running the query twice", "ORDER BY the sum"], "answer": 0, "explain": "More rows than loans means each principal is counted several times; aggregate loan columns over loans alone (→ section 1, Aggregating over a join; P15)."},
  {"type": "multi", "q": "Which of these are aggregate functions?", "options": ["COUNT", "SUM", "AVG", "ROUND", "MAX", "LOWER"], "answer": [0, 1, 2, 4], "explain": "Aggregates turn many rows into one value: COUNT, SUM, AVG, MIN, MAX. ROUND and LOWER change one value per row — Wednesday's functions (→ section 1, COUNT to MIN and MAX)."}
]}
```

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
SELECT channel, COUNT(*) AS applications FROM applications GROUP BY channel;
-- app 5006 · branch 6223 · partner 2771
SELECT channel, COUNT(*) AS approved FROM applications WHERE status LIKE 'approved%' GROUP BY channel;
-- app 2915 · branch 3965 · partner 1715
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

**One lesson from P8.** Payments by method showed `Card` and `card` as two rows. Madina's board pack has a "share of card payments" tile; computed on raw `method`, card is understated by 57 payments and 327 m UZS, and the five stray spellings add five phantom categories. Real data always has this. Tomorrow's first job is to make `GROUP BY LOWER(TRIM(method))` return five rows.

```game
{"id": "w02d2-g3", "type": "match", "title": "Board-pack numbers", "pairs": [["Disbursements", "COUNT(*) and SUM(principal) of loans paid out in a period, by product"], ["Average ticket", "AVG(principal) per product"], ["Approval rate", "approved applications ÷ applications, per channel"], ["Long format", "one row per (month, product) — what the GROUP BY returns"], ["Wide format", "months across as columns — the slide, built later with SUM(CASE …) or a pivot"]]}
```

> 🎯 **Interview version.** *"How would you build a disbursements-by-month-by-product report, and what would you check?"* — `GROUP BY month, product` over `loans` (one row per loan, so sums are safe); period filter with `>=` and `<`; check that the rows add up to the ungrouped total; never join a one-to-many table before summing loan amounts.

**Say it like in an interview.** *"How would you build a disbursements-by-month-by-product report, and what would you check before sending it?"* Answer as you would out loud, with Nur Finance numbers.

```task
{"id": "w02d2-iv", "kind": "free", "min": 30, "model": "I would aggregate the loans table itself, because one row is one loan and its principal: GROUP BY the month of disbursed_at and the product name from products, which is many-to-one, with COUNT(*) and SUM(principal). The period is a half-open filter, disbursed_at >= '2026-01-01'. Before sending it I check that the 50 rows add up to the ungrouped total — 3 051 loans and 162.3 bn UZS in 2026 — and I never join installments or payments before summing, because that multiplies every principal.", "rubric": ["Aggregates over loans (one row per loan) with GROUP BY month and product", "Uses COUNT(*) and SUM(principal) with a half-open period filter", "Checks the grouped rows against the ungrouped total", "Warns against joining a one-to-many table before summing", "Gives a Nur Finance number"], "xp": 2}
```

Tomorrow: Sevara's lateness question and Timur's moving tile — the functions that clean and compute values on the way out.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w02d2", "pass": 0.8, "questions": [
  {"type": "single", "q": "Which line has the bug?", "code": "1  SELECT b.branch_name, COUNT(*) AS loans\n2  FROM loans l JOIN branches b ON b.branch_id = l.branch_id\n3  WHERE COUNT(*) > 900\n4  GROUP BY b.branch_name;", "options": ["Line 1", "Line 2", "Line 3 — a condition on an aggregate belongs in HAVING, after GROUP BY", "Line 4"], "answer": 2, "explain": "WHERE filters rows before grouping, when no count exists yet; HAVING filters groups (→ section 1, WHERE vs HAVING)."},
  {"type": "single", "q": "What does SQL Server do with this query?", "code": "SELECT p.name, l.loan_id, COUNT(*)\nFROM loans l JOIN products p ON p.product_id = l.product_id\nGROUP BY p.name;", "options": ["Returns one row per loan", "Refuses it: loan_id is neither aggregated nor in GROUP BY", "Returns one row per product with the first loan_id", "Returns the count only"], "answer": 1, "explain": "Every SELECT column is either inside an aggregate or in GROUP BY; SQLite silently picks one loan_id, which you must never rely on (→ section 1, GROUP BY one column)."},
  {"type": "single", "q": "Micro shows 2 669 for COUNT(*) and 2 133 for COUNT(DISTINCT l.customer_id). Which sentence is right?", "options": ["2 669 Micro customers", "2 669 Micro loans taken by 2 133 different people", "534 Micro loans are duplicates to delete", "2 133 Micro loans"], "answer": 1, "explain": "COUNT(*) counts rows (loans); COUNT(DISTINCT …) counts different customers — report the one you mean (→ section 1, COUNT)."},
  {"type": "number", "q": "In SQLite, the method column holds these five values. How many rows does the query return?", "code": "method: 'card', 'card', 'Card', 'cash', 'CASH '\n\nSELECT method, COUNT(*)\nFROM payments\nGROUP BY method;", "answer": 4, "explain": "GROUP BY groups exact values: card, Card, cash and 'CASH ' (trailing space) are four different groups (→ P8)."},
  {"type": "single", "q": "You join loans to payments and want SUM(l.principal). Which quick check tells you the sum is unsafe?", "options": ["COUNT(*) and COUNT(DISTINCT l.loan_id) differ", "The sum is a round number", "The query runs slowly", "MIN(principal) is 0"], "answer": 0, "explain": "If rows outnumber loans, each principal is counted several times; aggregate a column at the grain of its own table (→ section 1, Aggregating over a join; P15)."},
  {"type": "multi", "q": "Which statements about set operators are true?", "options": ["UNION removes duplicate rows", "UNION ALL keeps duplicates and is faster", "EXCEPT returns rows of the first query that are not in the second", "UNION puts two tables side by side, like a join", "The two queries must return the same number of rows"], "answer": [0, 1, 2], "explain": "Set operators stack results, so the column count must match, not the row count; default to UNION ALL (→ section 1, Set operators)."},
  {"type": "single", "q": "Which clause can use a column alias defined in SELECT (e.g. ORDER BY active_loans) on both SQL Server and SQLite?", "options": ["WHERE", "GROUP BY", "ORDER BY", "None of them"], "answer": 2, "explain": "ORDER BY runs after SELECT in FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY; SQL Server needs the expression repeated in GROUP BY (→ section 1, The order a query runs in)."},
  {"type": "single", "q": "In SQLite, what does this column compute per channel?", "code": "SELECT channel,\n       ROUND(100.0 * AVG(status LIKE 'approved%'), 1)\nFROM applications\nGROUP BY channel;", "options": ["The number of approved applications", "The approval rate in %, with all applications as the denominator", "The approval rate with cancelled applications left out", "The average credit score of approved applications"], "answer": 1, "explain": "A comparison is 1 or 0, so its average is the share that is 1 — here over every application of the channel (→ section 6, Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w02d2", "sql": true, "q": "Nilufar suspects some loan officers decide more strictly than others. For applications submitted in 2025, compute each officer's approval rate on the decided convention (cancelled left out; approved_not_disbursed counts as approved), keeping only officers with at least 80 decided applications. Which officer has the lowest rate? Answer with the officer's staff_id.", "type": "number", "dp": 0, "h": ["56de769469e1ba7468f6f2ed"], "hint": "One filter belongs before the grouping and one after — the cut-off of 80 is a condition on a count.", "sol": "LS0gU1FMaXRlClNFTEVDVCBvZmZpY2VyX2lkLCBDT1VOVCgqKSBBUyBkZWNpZGVkLAogICAgICAgUk9VTkQoMTAwLjAgKiBBVkcoc3RhdHVzIExJS0UgJ2FwcHJvdmVkJScpLCAxKSBBUyBhcHByb3ZhbF9wY3QKRlJPTSBhcHBsaWNhdGlvbnMKV0hFUkUgc3RhdHVzIDw+ICdjYW5jZWxsZWQnCiAgQU5EIGFwcGxpZWRfYXQgPj0gJzIwMjUtMDEtMDEnIEFORCBhcHBsaWVkX2F0IDwgJzIwMjYtMDEtMDEnCkdST1VQIEJZIG9mZmljZXJfaWQKSEFWSU5HIENPVU5UKCopID49IDgwCk9SREVSIEJZIGFwcHJvdmFsX3BjdDsKLS0gU1FMIFNlcnZlcjogQVZHKElJRihzdGF0dXMgTElLRSAnYXBwcm92ZWQlJywgMS4wLCAwLjApKSBpbnN0ZWFkIG9mIEFWRyhzdGF0dXMgTElLRSAnYXBwcm92ZWQlJykKLS0gZmlyc3Qgcm93OiBvZmZpY2VyIDI1IChOYXJnaXphIEtoYXNhbm92LCBUYXNoa2VudCBTb3V0aCkg4oCUIDU4IG9mIDk1ID0gNjEuMSAlOyB0aGVuIDE2IGF0IDYxLjYgJSwgNiBhdCA2My4xICUKV2l0aG91dCBIQVZJTkcgdGhlIGxvd2VzdCBpcyBvZmZpY2VyIDgxIGF0IDYwLjggJSBvbiBvbmx5IDUxIGRlY2lzaW9ucyDigJQgdG9vIGZldyB0byBjYWxsIGEgcGF0dGVybi4gV2l0aCBjYW5jZWxsZWQgYXBwbGljYXRpb25zIGluIHRoZSBkZW5vbWluYXRvciB0aGUgb3JkZXIgY2hhbmdlcyAob2ZmaWNlciA3MSBjb21lcyBmaXJzdCksIHNvIHRoZSBjb252ZW50aW9uIGRlY2lkZXMgd2hvIGdldHMgdGhlIHBob25lIGNhbGwuCjYxICUgYWdhaW5zdCBhIDIwMjUgY29tcGFueSByYXRlIG9mIGFib3V0IDcwICUgaXMgZmlyc3QgYSBxdWVzdGlvbiBhYm91dCB0aGUgb2ZmaWNlcidzIGFwcGxpY2FudHMgKHByb2R1Y3QsIHNjb3JlKSwgYW5kIG9ubHkgdGhlbiBhYm91dCB0aGUgb2ZmaWNlci4="}
```

<!-- challenge:end -->
