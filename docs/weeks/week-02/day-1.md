# Week 2 · Day 1 — Joining tables: the loan with its customer

<span class="badge">Learn 60 min</span> <span class="badge">Practice 60 min</span> <span class="badge">Homework</span> <span class="badge company">Company corner</span>

> STORY **Monday, 9:10.** Bekzod is waiting at your desk with a printout of last week's B18 — three payment ids, one loan id, three amounts. *"Great numbers. Zero names. When I show the board a loan, they want to see a person, a product and a branch, not `4570`. Can I get a readable loan list: customer name, region, product, branch, principal, status? One row per loan."* Madina, passing: *"That's five tables. Today you learn the word that connects them."*

## Today in 3 lines

- You can write an **INNER JOIN** and a **LEFT JOIN** on a key, with **table aliases**, and pick columns from both sides.
- You know why joining `loans` to `installments` **multiplies rows** (many-to-one), and how to join **three or four tables** in one query.
- You can compute Nur Finance's **outstanding balance** and its **overdue amount** as of 2026-10-01, and say which is which.

---

## 1. Learn — one question, two tables

### Why join

Last week every question lived in one table. Bekzod's does not: the *name* is in `customers`, the *principal* in `loans`. The two tables are connected by a key — `loans.customer_id` holds a `customers.customer_id` — and a **JOIN** (*соединение*) uses that key to put the matching rows side by side:

```sql
SELECT l.loan_id, c.first_name, c.last_name, c.region, l.principal, l.status
FROM loans AS l
INNER JOIN customers AS c ON c.customer_id = l.customer_id;
```

Read it as: *take every loan; for each one, find the customer whose id equals the loan's `customer_id`; glue that customer's columns onto the loan row.* 7 828 rows come back — one per loan — because every loan has exactly one customer.

Three things in that query:

1. **Aliases** `l` and `c` (*псевдонимы*): short names for the tables. `AS` is optional (`FROM loans l`); everyone uses them because every column must now say which table it comes from.
2. **Qualified columns** `c.region`, `l.principal`. If a column name exists in only one of the two tables, the prefix is optional — but `customer_id` exists in both, so `customer_id` alone is an error ("ambiguous column"). Prefix everything; your future self thanks you.
3. **`ON`** — the join condition. Almost always `child.foreign_key = parent.primary_key`. Day 1 of week 1 gave you the list of those pairs; that list is your join map.

The result has the columns of both tables, so `SELECT` can use any of them, and so can `WHERE` and `ORDER BY`:

```sql
SELECT l.loan_id, c.first_name, c.last_name, l.principal
FROM loans l
JOIN customers c ON c.customer_id = l.customer_id
WHERE c.segment = 'affluent' AND l.product_id = 5
ORDER BY l.principal DESC;                       -- 179 rows: SME loans to affluent customers
```

`JOIN` alone means `INNER JOIN`. Bekzod wanted *customer name* as one column — that is string concatenation, Day 3's topic, but you need it today: SQL Server writes `c.first_name + ' ' + c.last_name`, SQLite (and PostgreSQL) write `c.first_name || ' ' || c.last_name`.

### INNER vs LEFT — what happens to rows that do not match

`INNER JOIN` keeps only rows that have a partner on the other side. Turn the question round — *customers with their applications* — and the difference appears:

```sql
SELECT c.customer_id, c.first_name, a.application_id, a.requested_amount
FROM customers c
LEFT JOIN applications a ON a.customer_id = c.customer_id;
```

| | rows | why |
|---|---|---|
| `customers INNER JOIN applications` | 14 000 | one row per application; customers who never applied vanish |
| `customers LEFT JOIN applications` | 14 587 | 14 000 application rows + 587 customers with no application, their `application_id` and `requested_amount` **NULL** |

**LEFT JOIN** (*левое соединение*) keeps every row of the left table (the one in `FROM`) and fills the right side with NULLs when nothing matches. 6 040 customers, 5 453 of them have at least one application, 587 have none: 14 000 + 587 = 14 587. Check that arithmetic every time you LEFT JOIN — it tells you whether the join did what you think.

Those NULL rows are useful in themselves. *"Which customers have never applied?"* is a LEFT JOIN plus one filter — the **anti-join**:

```sql
SELECT COUNT(*)
FROM customers c
LEFT JOIN applications a ON a.customer_id = c.customer_id
WHERE a.application_id IS NULL;                   -- 587
```

*Preview — Day 4 explains the NULL rules behind this.* Today, copy the pattern: LEFT JOIN, then `WHERE right_table.key IS NULL` = "rows on the left with no match on the right".

`RIGHT JOIN` exists (keep every row of the right table); nobody uses it — swap the tables and write LEFT. `FULL OUTER JOIN` keeps unmatched rows from both sides (SQL Server yes; SQLite only since 3.39). You will meet both in Baraa's chapter; in analyst code, 95 % of joins are INNER or LEFT.

### Many-to-one: why the row count changes

The direction of the relationship decides what a join does to your row count:

- **many → one** (`loans → customers`): each loan finds exactly one customer. 7 828 in, 7 828 out. Safe.
- **one → many** (`loans → installments`): each loan finds *all* its instalments. 7 828 loans in, **92 193** rows out — one per instalment, with the loan's columns *repeated* on every one.

```sql
SELECT COUNT(*)
FROM loans l
JOIN installments i ON i.loan_id = l.loan_id;     -- 92193, not 7828
```

That repetition is correct — it is what "one row per instalment with its loan's details" means — but it is a trap the moment you add up a loan column: `SUM(l.principal)` over that join gives 9 981 530 850 000, every principal counted once per instalment. Tomorrow's aggregates make this the most common wrong number in lending reports; today just notice that **the grain of a join result is the grain of the "many" side**. Before summing, ask: *what is one row now?*

### Three and four tables

Chain joins; each `JOIN … ON` adds one table and may use any table already joined:

```sql
SELECT l.loan_id,
       c.first_name || ' ' || c.last_name AS customer,     -- SQL Server: c.first_name + ' ' + c.last_name
       c.region, p.name AS product, b.branch_name,
       l.principal, l.status
FROM loans l
JOIN customers c ON c.customer_id = l.customer_id
JOIN products  p ON p.product_id  = l.product_id
JOIN branches  b ON b.branch_id   = l.branch_id;
```

Still 7 828 rows: all three are many-to-one from the loan. A fourth hop can go *through* a table you do not display — the loan officer is reachable only via the application:

```sql
FROM loans l
JOIN applications a ON a.application_id = l.application_id
JOIN staff s        ON s.staff_id = a.officer_id
```

Write joins in the order of the story (fact first, then its dimensions); the database picks its own execution order and the result is the same.

### Depth (optional)

- ▶ Baraa, *SQL joins (basics)* [2:47:57](https://youtu.be/SSKVgrwhzus?t=10077) — 40 min, INNER/LEFT/RIGHT/FULL with his pictures; his `customers`/`orders` are our `customers`/`loans`.
- RU deck `2.1 SQL-47-77.pdf` — JOIN pages. *Russian terms:* соединение = join, внутреннее = inner, левое = left, псевдоним = alias, ключ соединения = join key.

---

## 2. Worked example — Bekzod's list

**Ask:** one row per loan: customer, region, product, branch, principal, status; biggest first; show me the top five.

1. *What is one row?* A loan → `FROM loans`.
2. *Which columns live elsewhere?* name/region → `customers`; product name → `products`; branch name → `branches`. All reachable with a key sitting on `loans`.
3. *Direction?* All three are many-to-one. Row count must stay 7 828 — check it before adding `ORDER BY`.
4. Write, run, check:

```sql
-- SQL Server: SELECT TOP 5 …  (drop the LIMIT line)
SELECT l.loan_id, c.first_name || ' ' || c.last_name AS customer, c.region,
       p.name AS product, b.branch_name, l.principal, l.status
FROM loans l
JOIN customers c ON c.customer_id = l.customer_id
JOIN products  p ON p.product_id  = l.product_id
JOIN branches  b ON b.branch_id   = l.branch_id
ORDER BY l.principal DESC
LIMIT 5;
```

| loan_id | customer | region | product | branch | principal | status |
|---|---|---|---|---|---|---|
| 2861 | Maftuna Umarova | Tashkent | Small business loan | Tashkent Central | 599 060 000 | active |
| 4570 | Umida Khasanova | Namangan | Small business loan | Namangan Central | 598 450 000 | closed |
| 4601 | Abror Abdullaev | Tashkent | Small business loan | Tashkent Central | 597 540 000 | active |
| 4970 | Gulnora Nazarova | Tashkent | Small business loan | Tashkent Central | 597 520 000 | active |
| 7520 | Sevara Tursunova | Tashkent | Small business loan | Tashkent South | 595 160 000 | active |

Loan 4570 — last Friday's three 57 170 000 payments — is Umida Khasanova's closed SME loan from Namangan. That is what Bekzod meant by "readable".

---

## 3. Practice (60 min)

Write every query with its result into `submissions/week-02/day-1/practice.sql`. Only this week's and last week's SQL: `SELECT … JOIN … WHERE … ORDER BY`, `COUNT(*)`, `TOP`/`LIMIT`. No `GROUP BY` yet (tomorrow).

**P1.** Join `loans` to `customers`. How many rows? Now run `SELECT COUNT(*) FROM loans`. Why the same?

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM loans l JOIN customers c ON c.customer_id = l.customer_id;   -- 7828
```
Every loan has exactly one customer (many-to-one), so the inner join neither drops nor multiplies rows. The relationship is real, but this teaching copy of the database declares no FOREIGN KEY, so nothing *guarantees* it — the count is how you check. If it had been lower, some loans would point at a customer that does not exist; check with a LEFT JOIN … IS NULL — it returns 0 here.
</details>

**P2.** Active loans held at the Nukus and Termez branches (the branch's region, not the customer's).

<details><summary>Answer</summary>

```sql
SELECT COUNT(*)
FROM loans l JOIN branches b ON b.branch_id = l.branch_id
WHERE b.region IN ('Nukus', 'Termez') AND l.status = 'active';                    -- 413
```
</details>

**P3.** SME loans (`product_id = 5`) taken by affluent customers. · **P4.** Micro loans taken by customers living in Samarkand.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM loans l JOIN customers c ON c.customer_id = l.customer_id
WHERE l.product_id = 5 AND c.segment = 'affluent';                                 -- 179
SELECT COUNT(*) FROM loans l JOIN customers c ON c.customer_id = l.customer_id
WHERE l.product_id = 1 AND c.region = 'Samarkand';                                 -- 277
```
</details>

**P5.** The three largest written-off loans with the borrower's name and region.

<details><summary>Answer</summary>

```sql
SELECT l.loan_id, c.first_name, c.last_name, c.region, l.principal
FROM loans l JOIN customers c ON c.customer_id = l.customer_id
WHERE l.status = 'written_off'
ORDER BY l.principal DESC LIMIT 3;                       -- TOP 3 on SQL Server
```
6579 Jasur Ismoilov (Samarkand) 525 670 000 · 2898 Abror Sobirov (Tashkent) 507 760 000 · 903 Nodira Yusupova (Tashkent) 498 520 000. Three SME-sized losses; Sevara knows all three by name.
</details>

**P6.** Active Auto loans booked at the *Tashkent Central* branch. Use the product **code**, not the id, and the branch **name** — three tables.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*)
FROM loans l
JOIN products p ON p.product_id = l.product_id
JOIN branches b ON b.branch_id = l.branch_id
WHERE p.code = 'AUTO' AND b.branch_name = 'Tashkent Central' AND l.status = 'active';   -- 60
```
</details>

**P7.** Loans that have never had a collections action — and prove the number with two single-table counts.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM loans l LEFT JOIN collections_actions ca ON ca.loan_id = l.loan_id
WHERE ca.action_id IS NULL;                                                         -- 7545
SELECT COUNT(*) FROM loans;                                                         -- 7828
SELECT COUNT(DISTINCT loan_id) FROM collections_actions;                            -- 283
```
7 828 − 283 = 7 545: most loans never needed a reminder. The anti-join and the arithmetic must agree; when they do not, your join key is wrong.
</details>

**P8.** Row multiplication. Count the rows of `loans JOIN installments`, `loans JOIN payments`, and `loans LEFT JOIN payments`. Explain each number from the relationships.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM loans l JOIN installments i ON i.loan_id = l.loan_id;         -- 92193
SELECT COUNT(*) FROM loans l JOIN payments p ON p.loan_id = l.loan_id;             -- 52875
SELECT COUNT(*) FROM loans l LEFT JOIN payments p ON p.loan_id = l.loan_id;        -- 53267
```
One-to-many: the count is the number of rows on the *many* side (92 193 instalments; 52 875 payments). The LEFT JOIN adds one row for each loan that has no payment at all: 53 267 − 52 875 = **392** loans with nothing paid yet (new loans whose first instalment is not due, and the worst defaulters).
</details>

**P9.** Week 1, Day 1, P7c asked "how many calls did collectors make in Fergana?". Answer it now: `collections_actions → staff → branches`.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*)
FROM collections_actions ca
JOIN staff s    ON s.staff_id = ca.collector_id
JOIN branches b ON b.branch_id = s.branch_id
WHERE ca.action_type = 'call' AND b.region = 'Fergana';                              -- 416
```
The branch is the *collector's* branch, reached through `staff`. Joining `collections_actions → loans → branches` would give the loan's branch — the same here (collectors work their own branch's loans), but not the same question.
</details>

**P10.** Loan 1's schedule with its payments: instalment number, due date, amount due, paid date, amount paid — including instalments not yet paid. Which instalment was paid latest relative to its due date?

<details><summary>Answer</summary>

```sql
SELECT i.installment_no, i.due_date, i.total_due, p.paid_at, p.amount
FROM installments i
LEFT JOIN payments p ON p.installment_id = i.installment_id
WHERE i.loan_id = 1
ORDER BY i.installment_no;
```
24 rows (the loan is 24 months); 18 paid, 6 with NULL `paid_at` — they fall due from 2026-10-28 on. Instalment 12, due 2026-03-28, was paid on 2026-05-12 — 45 days late — then everything after it on time. An INNER JOIN would have shown 18 rows and hidden the six open ones; "the schedule" needs LEFT.
</details>

<span class="badge stretch">Stretch</span> **P11.** Join `loans` to `applications`. How many loans came through each channel? (One `COUNT(*)` with a `WHERE` per channel.) Then: how many applications have `status = 'approved'` but no loan at all? Describe in words what those rows are before you look.

<details><summary>Answer</summary>
app 2 669 · branch 3 590 · partner 1 569 (= 7 828). Approved-with-no-loan: `applications a LEFT JOIN loans l ON l.application_id = a.application_id WHERE a.status = 'approved' AND l.loan_id IS NULL` → **89**. All 89 were decided between 2026-09-29 and 2026-10-05 — approvals whose disbursement had not happened by the as-of date (some are even decided *after* it: the decision column carries a planned date). Not errors: a pipeline. Day 4 returns to them.
</details>

---

## 4. Homework <span class="badge hw">HW 2.1 — Due Day 3</span>

**Bekzod's loan book.** Ten queries he can run every Monday. Submit `submissions/week-02/day-1/loan_book.sql`, each query preceded by `-- Qn: <the question in one line>` and followed by `-- result: <row count, and the top row or the number>`. You may use tomorrow's `GROUP BY` in Q6 if you have learned it by then; a `WHERE` per value also scores.

1. The readable loan list from section 2, all rows, newest disbursement first.
2. The same list, **active** loans only, plus `monthly_payment`.
3. Active **SME** loans booked at **Tashkent-region branches**, largest first (product by code, region from `branches`).
4. **Auto** loans of **affluent** customers.
5. Every loan with the **channel** and **credit score** of its application.
6. Every loan with the **name of the loan officer** who handled its application (`applications.officer_id → staff`). Which officer has the most loans?
7. Customers who have **no loan** — count, and the list with region and segment.
8. **Written-off** loans with customer name, phone and branch name — Sevara will take this list.
9. Loan **4570**'s full schedule with payments (as P10, for that loan).
10. Loans whose customer id is **6001 or above** (last week's duplicate ids), with names: how many loans and how much principal sit on duplicate customers?

Graded on: (a) every join uses the right key and the row count is stated and right, (b) LEFT vs INNER chosen deliberately in Q7 and Q9 (a comment saying why), (c) column names a manager can read (aliases, one name column).

### 📎 Hand in here

```sqltask
{"check": "handin-W2D1", "lesson": "W2D1", "title": "HW 2.1", "tasks": [{"id": "loan_book.sql", "file": "loan_book.sql", "text": true, "minLines": 3, "q": "Write `loan_book.sql` here — what the page above asks for."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else the page lists (one more file, or a .zip of several)."}]}
```

---

## 5. Self-check

1. `FROM loans l JOIN customers c ON …` — which table's rows can disappear, and why? *(→ section 1, "INNER vs LEFT")*
2. You join `loans` to `installments` and get 92 193 rows. Is that a bug? What is one row now? *(→ section 1, "Many-to-one")*
3. Write from memory the three-line pattern that finds "customers who never applied". *(→ section 1, the anti-join; P7)*

---

## 6. Company corner <span class="badge company">Outstanding and portfolio</span>

Bekzod's second question every Monday is *"how big is the book?"*. Two different numbers answer it, and they are both joins of `installments` with `loans`/`payments`. Learn to compute both and to say which one you mean.

**1. Outstanding balance** (*остаток долга*) — the principal not yet repaid. On an annuity schedule, every instalment carries a slice of principal (`principal_due`); the principal still outstanding on the as-of date is the sum of the slices **not yet due**:

```sql
SELECT SUM(i.principal_due) AS outstanding, COUNT(DISTINCT i.loan_id) AS loans
FROM installments i
WHERE i.due_date > '2026-10-01';                          -- 208 723 504 430 across 3409 loans
```

**208.7 bn UZS** of principal is still scheduled to come in. The **portfolio** is this number, usually restricted to live loans: join `loans` and keep `status = 'active'` → **203.4 bn** on 3 341 loans; the remaining 5.3 bn sits on 22 `default` and 46 `written_off` loans whose schedules run on although nobody expects the money. Bekzod's "the Auto book" is the same query filtered through `products` (active loans: Auto 56.0 bn on 358 loans; SME 122.8 bn; Consumer 22.6 bn; BNPL 1.1 bn; Micro 1.0 bn). Note what outstanding is *not*: `SUM(principal)` of active loans is 297.0 bn — the amount originally lent, not what is left.

**2. Overdue amount** (*сумма просрочки*) — the money that *should already have arrived* and has not: instalments with `due_date <= as-of` and no payment against them. That is the anti-join pattern from today, on `installments → payments`:

```sql
SELECT SUM(i.total_due) AS overdue, COUNT(*) AS instalments, COUNT(DISTINCT i.loan_id) AS loans
FROM installments i
LEFT JOIN payments p ON p.installment_id = i.installment_id
WHERE i.due_date <= '2026-10-01' AND p.payment_id IS NULL;   -- 6 475 544 633 · 1357 · 399
```

*Preview — Day 4 explains the IS NULL mechanics; Day 3 refines the definition.* **6.48 bn UZS** on 1 357 matured instalments of 399 loans has not been paid at all. Most of it is already dead money: joined to `loans`, 4.88 bn sits on written-off loans and 0.87 bn on defaults; **0.69 bn on 181 instalments of active loans** is what Sevara's team is actually chasing this week. One refinement for Wednesday: this query treats a *partially* paid instalment as paid. Counting "not fully paid" gives 1 784 instalments on 413 loans and 7.60 bn still owed — the number the DPD computation will use.

| Number | Question it answers | Grain of the query | As of 2026-10-01 |
|---|---|---|---|
| **Outstanding** | how much principal is still to come | instalments with `due_date > as-of` | 208.7 bn (203.4 bn active) |
| **Overdue** | how much should have come and did not | matured instalments with no payment | 6.48 bn (0.69 bn on active loans) |

> Interview version: *"What is the difference between outstanding balance and overdue amount, and how would you compute each?"* — Outstanding = principal not yet due, from the schedule; overdue = matured instalments without payment, from schedule minus payments. Mention that outstanding includes the overdue loans' *future* principal too, and that both need a date.

Tomorrow: Madina's board pack — the same joins, with `GROUP BY` on top.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w02d1", "pass": 0.8, "questions": [
  {"type": "single", "q": "What happens when you run this?", "code": "SELECT customer_id, l.principal\nFROM loans l\nJOIN customers c ON c.customer_id = l.customer_id;", "options": ["One row per loan with the customer id", "An 'ambiguous column' error", "One row per customer", "Zero rows"], "answer": 1, "explain": "customer_id exists in both tables, so the database cannot tell which one you mean; prefix every column (→ section 1, Why join)."},
  {"type": "single", "q": "customers LEFT JOIN loans returns more rows than customers INNER JOIN loans. Why?", "options": ["LEFT JOIN counts every loan twice", "Customers without a loan keep one row each, with NULL in the loan columns", "LEFT JOIN also adds loans without a customer", "It is a bug in the join condition"], "answer": 1, "explain": "LEFT keeps every row of the left table and fills the right side with NULLs when nothing matches (→ section 1, INNER vs LEFT)."},
  {"type": "number", "q": "A small bank has 10 customers. 7 of them have loans — 12 loans in total — and 3 have none. How many rows does customers LEFT JOIN loans return?", "answer": 15, "explain": "12 loan rows + 3 customers with no loan; check this arithmetic every time you LEFT JOIN (→ section 1, INNER vs LEFT)."},
  {"type": "single", "q": "What does this query return?", "code": "SELECT COUNT(*)\nFROM customers c\nJOIN loans l ON l.customer_id = c.customer_id\nWHERE l.loan_id IS NULL;", "options": ["The number of customers who never borrowed", "0 — the INNER JOIN already removed customers without a loan", "The number of loans with no customer", "An error"], "answer": 1, "explain": "The anti-join needs LEFT JOIN; an inner join never produces the NULL rows the filter is looking for (→ section 1, the anti-join; P7)."},
  {"type": "single", "q": "This join returns 92 193 rows. What is one row of the result?", "code": "SELECT COUNT(*)\nFROM loans l\nJOIN installments i ON i.loan_id = l.loan_id;", "options": ["One loan", "One instalment, with its loan's columns repeated", "One customer", "One payment"], "answer": 1, "explain": "The grain of a join result is the grain of the many side; SUM(l.principal) here would count each principal once per instalment (→ section 1, Many-to-one)."},
  {"type": "multi", "q": "Starting FROM loans with INNER JOINs, which joins keep the result at one row per loan?", "options": ["JOIN customers ON customer_id", "JOIN products ON product_id", "JOIN branches ON branch_id", "JOIN installments ON loan_id", "JOIN payments ON loan_id"], "answer": [0, 1, 2], "explain": "Many-to-one joins find exactly one partner per loan; one-to-many joins to installments or payments multiply the rows (→ section 1, Many-to-one; P8)."},
  {"type": "single", "q": "You want loan 1's full schedule with its payments, including instalments not paid yet. Which join?", "options": ["installments INNER JOIN payments", "installments LEFT JOIN payments", "payments LEFT JOIN installments", "No join — payments alone"], "answer": 1, "explain": "The schedule is the left table; an inner join would hide every open instalment (→ P10)."},
  {"type": "single", "q": "Bekzod asks 'how much principal is still outstanding as of 2026-10-01?'. Which query answers it?", "options": ["SUM(principal) FROM loans WHERE status = 'active'", "SUM(principal_due) FROM installments WHERE due_date > '2026-10-01'", "SUM(total_due) of matured instalments with no payment", "SUM(amount) FROM payments"], "answer": 1, "explain": "Outstanding is the principal not yet due on the schedule; SUM(principal) is what was originally lent, and matured-unpaid is the overdue amount (→ section 6, Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w02d1", "q": "Bekzod asks: how much outstanding principal (instalments due after the as-of date 2026-10-01) sits on active Auto loans booked at branches in the Tashkent region? Answer in soum, whole number.", "type": "number", "dp": 0, "h": ["21654098cae00c3343048722"], "hint": "Three tables: where the money is, which loan it belongs to, and where that loan was booked. Decide what one row is before you sum.", "sol": "U0VMRUNUIFNVTShpLnByaW5jaXBhbF9kdWUpIEFTIG91dHN0YW5kaW5nCkZST00gaW5zdGFsbG1lbnRzIGkKSk9JTiBsb2FucyBsICAgIE9OIGwubG9hbl9pZCA9IGkubG9hbl9pZApKT0lOIGJyYW5jaGVzIGIgT04gYi5icmFuY2hfaWQgPSBsLmJyYW5jaF9pZApXSEVSRSBpLmR1ZV9kYXRlID4gJzIwMjYtMTAtMDEnCiAgQU5EIGwuc3RhdHVzID0gJ2FjdGl2ZScKICBBTkQgbC5wcm9kdWN0X2lkID0gNCAgICAgICAgICAtLSBBdXRvIChvciBqb2luIHByb2R1Y3RzIGFuZCBmaWx0ZXIgY29kZSA9ICdBVVRPJykKICBBTkQgYi5yZWdpb24gPSAnVGFzaGtlbnQnOwotLSAyMyA5MDIgNzA3IDkwNSAoMTUxIGxvYW5zKTsgdGhlIHNhbWUgdGV4dCBvbiBTUUxpdGUgYW5kIFNRTCBTZXJ2ZXIKT25lIHJvdyBvZiB0aGUgam9pbiBpcyBhbiBpbnN0YWxtZW50LCBzbyBzdW1taW5nIHByaW5jaXBhbF9kdWUgaXMgc2FmZTsgc3VtbWluZyBsLnByaW5jaXBhbCBvdmVyIHRoZSBzYW1lIGpvaW4gd291bGQgY291bnQgZWFjaCBsb2FuIG9uY2UgcGVyIHJlbWFpbmluZyBpbnN0YWxtZW50LgpXaXRob3V0IHRoZSBzdGF0dXMgZmlsdGVyIHlvdSBnZXQgMjQgNTExIDk5NyA2MTg6IDAuNiBibiBzaXRzIG9uIFRhc2hrZW50IEF1dG8gbG9hbnMgaW4gZGVmYXVsdCBvciB3cml0dGVuIG9mZiB0aGF0IG5vYm9keSBleHBlY3RzIGJhY2suIE9mIHRoZSA1NS45NyBibiBvdXRzdGFuZGluZyBvbiBhY3RpdmUgQXV0byBsb2FucywgVGFzaGtlbnQncyBicmFuY2hlcyBjYXJyeSA0MyAlIOKAlCBhIGxpdHRsZSBhYm92ZSBUYXNoa2VudCdzIDM5ICUgb2YgdGhlIHdob2xlIGJvb2su"}
```

<!-- challenge:end -->
