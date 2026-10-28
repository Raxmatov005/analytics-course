# Week 2 · Day 1 — Joining tables: the loan with its customer

<span class="badge">Learn 60 min</span> <span class="badge">Practice 60 min</span> <span class="badge">Homework</span> <span class="badge company">Company corner</span>

> STORY **Monday, 9:10.** Bekzod is waiting at your desk with a printout of last week's B18 — three payment ids, one loan id, three amounts. *"Great numbers. Zero names. When I show the board a loan, they want to see a person, a product and a branch, not `4570`. Can I get a readable loan list: customer name, region, product, branch, principal, status? One row per loan."* Madina, passing: *"That's four tables. Today you learn the word that connects them."*

## Today in 3 lines

- You can write an **INNER JOIN** and a **LEFT JOIN** on a key, with **table aliases**, and pick columns from both sides.
- You know why joining `loans` to `installments` **multiplies rows** (many-to-one), and how to join **three or four tables** in one query.
- You can compute Nur Finance's **outstanding balance** and its **overdue amount** as of 2026-10-01, and say which is which.

---

## 1. Learn — joins: putting two tables side by side

### Why a join — one question, two tables

**What it is.** A **JOIN** (*соединение*) takes rows from two tables and puts the matching ones side by side, in one row. Rows match when a **key** has the same value on both sides: `loans.customer_id` holds the `customer_id` of a row in `customers`, so a loan and its customer match on that number.

You need a join whenever one question needs columns from two tables. "Each loan with the customer's name" needs `loans.principal` and `customers.first_name` — two tables, one key, one join.

**The two small tables used on this page.** Every join below is shown on these first, so you can see each row, and then run on the real data.

| `cust` | id | name |
|---|---|---|
| | 1 | Aziz |
| | 2 | Bekzod |
| | 3 | Dilnoza |

| `app` | app_id | cust_id | amount |
|---|---|---|---|
| | 101 | 2 | 500 |
| | 102 | 3 | 900 |
| | 103 | 4 | 120 |

Aziz (1) has no application. Application 103 points to customer 4, who is not in `cust`. Those two rows are what tells the join types apart.

```sql
-- the two small tables, built in the query itself (WITH … VALUES), so every box on this page can use them
WITH cust(id, name) AS (VALUES (1, 'Aziz'), (2, 'Bekzod'), (3, 'Dilnoza')),
     app(app_id, cust_id, amount) AS (VALUES (101, 2, 500), (102, 3, 900), (103, 4, 120))
SELECT * FROM cust;
```

### The shape of a join — FROM … JOIN … ON

**How to write it.**

```sql
SELECT l.loan_id, c.first_name, c.last_name, l.principal   -- columns from both tables, each with its table's alias
FROM loans AS l                                           -- the first table, alias l
JOIN customers AS c                                       -- the second table, alias c
  ON c.customer_id = l.customer_id;                       -- the key: child.foreign_key = parent.primary_key
```

Three parts, always the same:

1. **Aliases** (*псевдонимы*) — `l` and `c` are short names for the tables. `AS` is optional. Use them in every join.
2. **Qualified columns** — `c.region`, `l.principal`. A column that exists in both tables (`customer_id`) must have a prefix, or the database stops with *ambiguous column*. Prefix every column; it is never wrong.
3. **`ON`** — the match rule. Almost always `child.foreign_key = parent.primary_key`. The list of key pairs from Week 1 Day 1 is your **join map**.

Run it: 7 828 rows — one per loan, because every loan has exactly one customer.

**When you use it.** Every join on this page has this shape; only the word before `JOIN` changes (`INNER`, `LEFT`, `RIGHT`, `FULL`, `CROSS`).

**Your turn.**

```game
{"id": "w02d1-g1", "type": "build", "title": "Build the join", "q": "Every loan with its customer's region.", "tokens": ["SELECT", "l.loan_id,", "c.region", "FROM loans l", "JOIN customers c", "ON c.customer_id = l.customer_id"], "distractors": ["ON c.customer_id = l.loan_id", "WHERE", "customer_id"]}
```

### INNER JOIN — only the rows that match

**What it is.** **INNER JOIN** (*внутреннее соединение*) keeps a row only when it finds a partner on the other side. A row with no partner is left out. `JOIN` on its own means `INNER JOIN`.

```pic
{"id": "w02d1-pic1", "title": "INNER JOIN keeps only the rows that find a partner", "caption": "Each customer looks for an application with `cust_id = id`. Bekzod and Dilnoza find one (same colour) and come out. Aziz has no application and application 103 has no customer: both are struck out.", "tables": [{"id": "cust", "name": "cust", "cols": ["id", "name"], "rows": [[1, "Aziz"], [2, "Bekzod"], [3, "Dilnoza"]], "drop": [0]}, {"id": "app", "name": "app", "cols": ["app_id", "cust_id", "amount"], "rows": [[101, 2, 500], [102, 3, 900], [103, 4, 120]], "drop": [2]}, {"id": "res", "name": "result", "cols": ["id", "name", "app_id", "amount"], "rows": [[2, "Bekzod", 101, 500], [3, "Dilnoza", 102, 900]], "tone": ["a", "b"], "via": "JOIN app ON cust_id = id"}], "links": [{"from": ["cust", 1, "id"], "to": ["app", 0, "cust_id"]}, {"from": ["cust", 2, "id"], "to": ["app", 1, "cust_id"]}]}
```

**How to write it.** On the small tables:

```sql
WITH cust(id, name) AS (VALUES (1, 'Aziz'), (2, 'Bekzod'), (3, 'Dilnoza')),
     app(app_id, cust_id, amount) AS (VALUES (101, 2, 500), (102, 3, 900), (103, 4, 120))
SELECT c.id, c.name, a.app_id, a.amount
FROM cust c
INNER JOIN app a ON a.cust_id = c.id;
```

| id | name | app_id | amount |
|---|---|---|---|
| 2 | Bekzod | 101 | 500 |
| 3 | Dilnoza | 102 | 900 |

Two rows. Aziz is gone (no application); application 103 is gone (no customer).

On the real data:

```sql
SELECT c.customer_id, c.first_name, a.application_id, a.requested_amount
FROM customers c
INNER JOIN applications a ON a.customer_id = c.customer_id;   -- 14 000 rows: one per application
```

14 000 rows — one per application. The 587 customers who never applied are not in the result.

**When you use it.**
- "Each X with its Y" when every X has a Y, or when an X without a Y does not matter: each loan with its customer, each payment with its loan.
- Any report where a row without a partner would be a mistake.

**Your turn.** How many rows does `SELECT COUNT(*) FROM loans l INNER JOIN customers c ON c.customer_id = l.customer_id` return? Run it in a box above if you are not sure.

```task
{"id": "w02d1-j1", "kind": "number", "answer": 7828, "dp": 0, "unit": "rows", "hint": "Every loan has exactly one customer. How many loans are there?", "model": "7 828 — one row per loan. INNER JOIN drops nothing here because every loan finds its customer."}
```

### LEFT JOIN — every row of the left table

**What it is.** **LEFT JOIN** (*левое соединение*) keeps **every row of the left table** — the table named in `FROM`. When a left row has a partner, the partner's columns are filled in. When it has none, the row stays and the right-hand columns are **NULL** (empty).

```pic
{"id": "w02d1-pic2", "title": "LEFT JOIN keeps every row of the left table", "caption": "The same two tables. Bekzod and Dilnoza get their application as before; Aziz stays too, with **NULL** where his application would be. Application 103 is still dropped: LEFT protects only the left table.", "tables": [{"id": "cust", "name": "cust", "cols": ["id", "name"], "rows": [[1, "Aziz"], [2, "Bekzod"], [3, "Dilnoza"]], "keep": [0, 1, 2]}, {"id": "app", "name": "app", "cols": ["app_id", "cust_id", "amount"], "rows": [[101, 2, 500], [102, 3, 900], [103, 4, 120]], "drop": [2]}, {"id": "res", "name": "result", "cols": ["id", "name", "app_id", "amount"], "rows": [[1, "Aziz", null, null], [2, "Bekzod", 101, 500], [3, "Dilnoza", 102, 900]], "tone": [null, "a", "b"], "via": "LEFT JOIN app ON cust_id = id"}], "links": [{"from": ["cust", 1, "id"], "to": ["app", 0, "cust_id"]}, {"from": ["cust", 2, "id"], "to": ["app", 1, "cust_id"]}]}
```

**How to write it.**

```sql
WITH cust(id, name) AS (VALUES (1, 'Aziz'), (2, 'Bekzod'), (3, 'Dilnoza')),
     app(app_id, cust_id, amount) AS (VALUES (101, 2, 500), (102, 3, 900), (103, 4, 120))
SELECT c.id, c.name, a.app_id, a.amount
FROM cust c
LEFT JOIN app a ON a.cust_id = c.id;
```

| id | name | app_id | amount |
|---|---|---|---|
| 1 | Aziz | NULL | NULL |
| 2 | Bekzod | 101 | 500 |
| 3 | Dilnoza | 102 | 900 |

Three rows — all three customers. Aziz stays, with NULL where his application would be. Application 103 is still gone: it is on the right side, and LEFT protects only the left.

On the real data:

```sql
SELECT c.customer_id, c.first_name, a.application_id, a.requested_amount
FROM customers c
LEFT JOIN applications a ON a.customer_id = c.customer_id;    -- 14 587 rows
```

14 587 rows = 14 000 applications + 587 customers with no application.

**When you use it.**
- "Every X, with its Y if it has one": every customer with their applications, every branch with its loans.
- When "none" is itself an answer you want to see — the customers who never applied are the NULL rows.

> 💡 **Key idea.** Rows of a LEFT JOIN = matched rows + left rows with no match. 14 000 + 587 = 14 587. Do this sum every time you write LEFT JOIN; if it does not add up, the join is not doing what you think.

**Your turn.** How many loans have **no payment at all**? Write a LEFT JOIN from `loans` to `payments` in any box and count the rows whose payment side is NULL.

```task
{"id": "w02d1-j2", "kind": "number", "answer": 392, "dp": 0, "unit": "loans", "hint": "FROM loans l LEFT JOIN payments p ON p.loan_id = l.loan_id — then count the rows where p.payment_id IS NULL.", "model": "392. LEFT JOIN keeps every loan; the ones with no payment have NULL in the payment columns."}
```

### INNER vs LEFT — the row with no partner

**What it is.** The only difference between the two is what happens to a left row that finds **no partner**: INNER drops it, LEFT keeps it with NULLs.

| | INNER JOIN | LEFT JOIN |
|---|---|---|
| Left row **with** a partner | kept | kept |
| Left row **without** a partner | dropped | kept, right columns NULL |
| Right row without a partner | dropped | dropped |
| `customers` → `applications` | 14 000 rows | 14 587 rows |

**When to choose which.** Ask one question: *"if an X has no Y, do I still want to see the X?"* Yes → LEFT. No → INNER.

> ⚠️ **Watch out.** A `WHERE` on a right-table column turns a LEFT JOIN back into an INNER JOIN. `LEFT JOIN applications a … WHERE a.status = 'approved'` drops every customer without an application, because for them `a.status` is NULL and NULL is never equal to anything. If the condition belongs to the right table, put it in `ON`: `LEFT JOIN applications a ON a.customer_id = c.customer_id AND a.status = 'approved'`.

**Your turn.** Madina wants **a list of all ten branches** with their loans. Which join?

```task
{"id": "w02d1-j3", "kind": "choice", "options": ["INNER JOIN — branches with no loans are not interesting", "LEFT JOIN from branches to loans — a branch with no loans must still appear, with NULLs", "LEFT JOIN from loans to branches — every loan must appear", "It does not matter; both give the same rows"], "answer": 1, "explain": "The branch list must be complete, so branches is the left table and LEFT keeps the ones with no loan. (Today every branch has loans, so the counts happen to match — the choice still matters the day a new branch opens.)"}
```

### The anti-join — rows that have no partner

**What it is.** An **anti-join** finds the left rows that have **no** match on the right. It is a LEFT JOIN followed by a filter on the NULL side. There is no `ANTI JOIN` keyword; this pattern *is* the anti-join.

**How to write it.**

```sql
SELECT c.customer_id, c.first_name, c.last_name
FROM customers c
LEFT JOIN applications a ON a.customer_id = c.customer_id
WHERE a.application_id IS NULL;                           -- 587 customers who never applied
```

587 rows — exactly the customers whose application columns came back NULL.

**When you use it.** "Which X have no Y": customers who never applied, loans with no payment, products nobody took this month, collectors with no actions this week.

> ⚠️ **Watch out.** The test is `IS NULL`, never `= NULL` (Day 4 explains why). And the join must be LEFT: after an INNER JOIN every row has a partner, so `WHERE a.application_id IS NULL` returns 0 rows — a plausible, wrong "nobody".

**Your turn.** Count the loans that have no payment (expected: one number, 392).

```task
{"id": "w02d1-j4", "kind": "sql", "model": "SELECT COUNT(*) FROM loans l LEFT JOIN payments p ON p.loan_id = l.loan_id WHERE p.payment_id IS NULL;", "note": "LEFT JOIN from loans to payments, then WHERE the payment side IS NULL."}
```

### RIGHT JOIN — every row of the right table

**What it is.** **RIGHT JOIN** (*правое соединение*) is the mirror of LEFT: it keeps **every row of the right table** (the one after `JOIN`) and fills the left side with NULLs where nothing matches.

**How to write it.**

```sql
WITH cust(id, name) AS (VALUES (1, 'Aziz'), (2, 'Bekzod'), (3, 'Dilnoza')),
     app(app_id, cust_id, amount) AS (VALUES (101, 2, 500), (102, 3, 900), (103, 4, 120))
SELECT c.id, c.name, a.app_id, a.amount
FROM cust c
RIGHT JOIN app a ON a.cust_id = c.id;
```

| id | name | app_id | amount |
|---|---|---|---|
| 2 | Bekzod | 101 | 500 |
| 3 | Dilnoza | 102 | 900 |
| NULL | NULL | 103 | 120 |

Three rows — all three applications. Application 103 stays, with NULL where its customer would be. Aziz is gone: he is on the left, and RIGHT protects only the right.

**When you use it.** Almost never, by choice: `A RIGHT JOIN B` gives the same rows as `B LEFT JOIN A`. Analysts write the table they want complete in `FROM` and use LEFT, so a reader knows which side is protected without thinking. You will meet RIGHT JOIN in other people's code and in Baraa's chapter — read it as "a LEFT JOIN written backwards".

| These two return the same rows | |
|---|---|
| `FROM cust c RIGHT JOIN app a ON a.cust_id = c.id` | `FROM app a LEFT JOIN cust c ON a.cust_id = c.id` |

**Your turn.** Which query returns the same rows as `SELECT … FROM loans l RIGHT JOIN customers c ON c.customer_id = l.customer_id`?

```task
{"id": "w02d1-j5", "kind": "choice", "options": ["SELECT … FROM loans l LEFT JOIN customers c ON c.customer_id = l.customer_id", "SELECT … FROM customers c LEFT JOIN loans l ON l.customer_id = c.customer_id", "SELECT … FROM customers c INNER JOIN loans l ON l.customer_id = c.customer_id", "There is no LEFT JOIN with the same rows"], "answer": 1, "explain": "RIGHT keeps every row of the table after JOIN — customers. Put customers in FROM and write LEFT: every customer, with loans where they exist."}
```

### FULL OUTER JOIN — every row from both sides

**What it is.** **FULL OUTER JOIN** (*полное внешнее соединение*) keeps every row of **both** tables: matched rows side by side, left rows without a partner with NULLs on the right, right rows without a partner with NULLs on the left. `FULL JOIN` is the same thing.

**How to write it.**

```sql
WITH cust(id, name) AS (VALUES (1, 'Aziz'), (2, 'Bekzod'), (3, 'Dilnoza')),
     app(app_id, cust_id, amount) AS (VALUES (101, 2, 500), (102, 3, 900), (103, 4, 120))
SELECT c.id, c.name, a.app_id, a.amount
FROM cust c
FULL OUTER JOIN app a ON a.cust_id = c.id
ORDER BY COALESCE(c.id, a.cust_id);
```

| id | name | app_id | amount |
|---|---|---|---|
| 1 | Aziz | NULL | NULL |
| 2 | Bekzod | 101 | 500 |
| 3 | Dilnoza | 102 | 900 |
| NULL | NULL | 103 | 120 |

Four rows — nothing is lost from either side. Aziz has no application; application 103 has no customer; both are visible at once.

**When you use it.** Comparing two lists that should agree: the loans in our database against the loans in the bank's file, this month's customers against last month's, a plan against actuals. The rows with NULL on either side are the differences. On the real data, `customers` ⟷ `applications` has no orphan applications (every `applications.customer_id` exists), so a FULL JOIN there gives the same 14 587 rows as the LEFT JOIN — that is a result too: the check passed.

| Join | Keeps | Rows on `cust` ⟷ `app` |
|---|---|---|
| INNER | matched only | 2 |
| LEFT | all left + matched | 3 |
| RIGHT | all right + matched | 3 |
| FULL | everything | 4 |

**Your turn.** Finance sends a file of the loans the bank paid out. You must find loans that are in our database but not in the file **and** loans in the file that are not in our database. Which join?

```task
{"id": "w02d1-j6", "kind": "choice", "options": ["INNER JOIN — only loans that are in both", "LEFT JOIN from our table — loans missing from the bank's file", "FULL OUTER JOIN — loans missing on either side, in one result", "CROSS JOIN — every pair"], "answer": 2, "explain": "Both kinds of difference matter (a loan we have and the bank does not, and the reverse), so both sides must be kept: FULL OUTER JOIN, then look at the rows with a NULL on one side."}
```

### CROSS JOIN — every row with every row

**What it is.** **CROSS JOIN** (*перекрёстное соединение*) has no `ON`. It pairs **every row of the first table with every row of the second**: 5 rows × 10 rows = 50 rows.

**How to write it.**

```sql
SELECT p.name AS product, b.branch_name
FROM products p
CROSS JOIN branches b
ORDER BY p.name, b.branch_name;                              -- 5 × 10 = 50 rows
```

50 rows: each of the 5 products paired with each of the 10 branches.

**When you use it.** To build a **complete grid** before you fill it: every product in every branch (then LEFT JOIN the loan counts, so a product with zero loans in a branch shows 0 instead of disappearing); every day of the month for every branch; every size for every colour.

> ⚠️ **Watch out.** A join whose `ON` is wrong or missing behaves like a CROSS JOIN: 7 828 loans × 6 040 customers = 47 million rows. If a query suddenly takes forever and the row count is huge, check the `ON`.

**Your turn.** How many rows does `SELECT COUNT(*) FROM products CROSS JOIN branches` return?

```task
{"id": "w02d1-j7", "kind": "number", "answer": 50, "dp": 0, "unit": "rows", "hint": "Products × branches.", "model": "5 products × 10 branches = 50 rows — one per product-and-branch pair."}
```

### Self-join — a table joined to itself

**What it is.** A **self-join** joins a table to **another copy of itself**. There is no special keyword: you name the same table twice with two aliases, and the `ON` compares two rows of that one table.

**How to write it.** "Two customer rows that share a phone number" compares `customers` with `customers`:

```sql
SELECT a.customer_id, a.first_name, a.last_name,
       b.customer_id AS other_id, b.first_name AS other_first, b.last_name AS other_last, a.phone
FROM customers a
JOIN customers b ON b.phone = a.phone
               AND b.customer_id > a.customer_id          -- each pair once, never a row with itself
ORDER BY a.customer_id;                                    -- 43 pairs
```

43 pairs. The first one is customer 44, *Yulduz Karimova*, and customer 6005, *"Yulduz "* *"karimova"* — the same person typed twice, with a trailing space and a lower-case surname. (Keep this query: Thursday's detective case is built on rows like these.)

The second condition does two jobs: `b.customer_id > a.customer_id` stops a row matching itself (same phone, same id) and stops every pair appearing twice (44–6005 and 6005–44).

**When you use it.** Rows that relate to other rows of the same table: duplicates (same phone, same name and birth date), an employee and their manager when both are rows of `staff`, a payment and the previous payment of the same loan, a customer's first loan and their next one.

**Your turn.** Why does the self-join need `b.customer_id > a.customer_id`?

```task
{"id": "w02d1-j8", "kind": "choice", "options": ["It makes the query run faster", "It stops a row matching itself and shows each pair only once", "It sorts the result", "It removes customers with no phone"], "answer": 1, "explain": "Without it, customer 44 matches customer 44 (same phone) and every pair comes out twice, once in each order."}
```

### Many-to-one and one-to-many — what happens to your row count

**What it is.** The **direction of the relationship** decides how many rows a join returns.

```pic
{"id": "w02d1-pic3", "title": "One to many: each loan comes out once per instalment", "caption": "Loans 3 and 6 have three instalments each, so two loans become six rows and each `principal` is repeated three times. One row is now an instalment, not a loan.", "tables": [{"name": "loans", "cols": ["loan_id", "principal"], "rows": [[3, "1 590 000"], [6, "4 720 000"]], "tone": ["a", "b"]}, {"name": "result", "cols": ["loan_id", "principal", "installment_no"], "rows": [[3, "1 590 000", 1], [3, "1 590 000", 2], [3, "1 590 000", 3], [6, "4 720 000", 1], [6, "4 720 000", 2], [6, "4 720 000", 3]], "tone": ["a", "a", "a", "b", "b", "b"], "tags": {"principal": "repeated"}, "via": "JOIN installments i", "more": "… 92 193 rows for all loans"}]}
```

- **Many → one** (`loans → customers`): every loan finds **one** customer. 7 828 loans in, 7 828 rows out. The row count does not change.
- **One → many** (`loans → installments`): every loan finds **all** its instalments. 7 828 loans in, **92 193** rows out — one per instalment, and the loan's columns are **repeated** on every one of them.

```sql
SELECT COUNT(*)
FROM loans l
JOIN installments i ON i.loan_id = l.loan_id;              -- 92 193, not 7 828
```

The repetition is correct: "one row per instalment, with its loan's details" is what you asked for. It becomes a trap only when you **add up a loan column** over that result: `SUM(l.principal)` counts each principal once per instalment — 3 to 48 times.

> 💡 **Key idea.** After a join, one row is one row of the **"many" side**. Before you count or sum anything, ask: *what is one row now?*

**When you use it.** Always — it is the question to ask of every join: *which side is "many"? Is that the grain I want?*

**Your turn.**

```game
{"id": "w02d1-g3", "type": "bug", "title": "The book that grew overnight", "q": "Bekzod wants the total principal lent on active loans. One line multiplies every loan.", "code": "SELECT SUM(l.principal) AS active_lent\nFROM loans l\nJOIN installments i ON i.loan_id = l.loan_id\nWHERE l.status = 'active';", "answer": [2], "why": "Joining installments repeats each loan once per instalment, so each principal is added once per instalment — 3 to 48 times. A loan amount is summed over loans alone: drop the join."}
```

### Chaining tables — the path from one table to another

**What it is.** A query can join **as many tables as the question needs**. Each `JOIN … ON` adds one table. Its `ON` may use any table that is already in the query — not only the previous one.

**The path.** Two tables that have no key between them are joined **through** the tables that connect them. `customers` and `products` share no key, so "which products do Tashkent customers take?" cannot join them directly. The join map from Week 1 shows the way:

```text
customers ──customer_id──▶ loans ──product_id──▶ products
   (who)                 (the loan)              (what)
```

Each arrow is one `JOIN … ON` with that key. `loans` is the bridge: it points to both.

**How to write it.** Write the tables in the order of the path, one `JOIN` per arrow:

```sql
SELECT p.name AS product, COUNT(*) AS loans
FROM customers c
JOIN loans    l ON l.customer_id = c.customer_id            -- arrow 1: customers → loans
JOIN products p ON p.product_id  = l.product_id             -- arrow 2: loans → products
WHERE c.region = 'Tashkent'
GROUP BY p.name
ORDER BY loans DESC;                                        -- 3 020 loans: Micro 1 041, Consumer 921, BNPL 594, SME 302, Auto 162
```

3 020 loans belong to Tashkent customers; grouped by product (tomorrow's `GROUP BY`, shown here only to read the result), Micro loans lead with 1 041. Without the bridge the question has no answer.

**A path through a table you do not display.** "Who was the loan officer for loan 1?" The officer is stored on the **application**, not on the loan, and the officer's branch on `staff`:

```text
loans ──application_id──▶ applications ──officer_id──▶ staff ──branch_id──▶ branches
```

```sql
SELECT l.loan_id, s.full_name AS officer, s.role, b.branch_name
FROM loans l
JOIN applications a ON a.application_id = l.application_id  -- through applications (no column of it is shown)
JOIN staff        s ON s.staff_id       = a.officer_id
JOIN branches     b ON b.branch_id      = s.branch_id
WHERE l.loan_id = 1;                                        -- Ulugbek Qodirov, loan_officer, Termez Central
```

`applications` appears in `FROM … JOIN` but not in `SELECT`: it is there only to carry the key from the loan to the officer. That is normal.

**Four tables, all many-to-one from the loan.** When every hop goes from "many" to "one", the row count stays at the starting table's:

```sql
SELECT l.loan_id,
       c.first_name || ' ' || c.last_name AS customer,     -- SQL Server: c.first_name + ' ' + c.last_name
       p.name AS product, b.branch_name, l.principal, l.status
FROM loans l
JOIN customers c ON c.customer_id = l.customer_id
JOIN products  p ON p.product_id  = l.product_id
JOIN branches  b ON b.branch_id   = l.branch_id;            -- still 7 828 rows
```

Still 7 828 rows: a loan has one customer, one product, one branch. Add `installments` and the count jumps to 92 193 — the previous subsection.

**How to find a path yourself.**
1. Name the table that holds the column you want to *show* and the table that holds the column you want to *filter or group by*.
2. On the join map, walk from one to the other along the keys. Write down every table on the way.
3. One `JOIN … ON` per step, in walking order. Tables you walk through but do not show still need their `JOIN`.

**Your turn.** "The region of the **customer** for every collections action." `collections_actions` has `loan_id` and `collector_id`, but no `customer_id`. Which path reaches the customer?

```task
{"id": "w02d1-j9", "kind": "choice", "options": ["collections_actions → customers (no bridge needed)", "collections_actions → loans → customers", "collections_actions → staff → customers", "collections_actions → installments → customers"], "answer": 1, "explain": "An action belongs to a loan (loan_id), and a loan belongs to a customer (customer_id). staff is the collector's side, not the customer's."}
```

Now write it: the number of collections actions per customer region (`collections_actions → loans → customers`). `GROUP BY` is tomorrow's topic — copy the `GROUP BY` line from the Tashkent example above.

```task
{"id": "w02d1-j10", "kind": "sql", "model": "SELECT c.region, COUNT(*) AS actions FROM collections_actions ca JOIN loans l ON l.loan_id = ca.loan_id JOIN customers c ON c.customer_id = l.customer_id GROUP BY c.region ORDER BY actions DESC;", "note": "Two hops: collections_actions → loans (loan_id), loans → customers (customer_id)."}
```

### Putting it together

One request, several of today's tools. *"Every branch, with the number of its loans and the number of its active loans — branches with none included."*

```sql
SELECT b.branch_name,
       COUNT(l.loan_id)                                      AS loans,          -- counts matched loans; NULL (no loan) is not counted
       SUM(CASE WHEN l.status = 'active' THEN 1 ELSE 0 END)  AS active_loans
FROM branches b                                              -- the list that must be complete goes in FROM …
LEFT JOIN loans l ON l.branch_id = b.branch_id               -- … so LEFT protects it
GROUP BY b.branch_name
ORDER BY loans DESC;                                         -- 10 rows, one per branch
```

Read it with the questions from this section: the complete list is `branches`, so it is the left table and the join is LEFT; the "many" side is `loans`, so one row before grouping is one loan; `GROUP BY` folds those rows back to one per branch (tomorrow). `COUNT(l.loan_id)` instead of `COUNT(*)` is on purpose: a branch with no loans would still have one row (with NULLs) and `COUNT(*)` would say 1.

**Which join answers which question?**

```game
{"id": "w02d1-g2", "type": "sort", "title": "Which join?", "groups": {"INNER JOIN": ["Active loans with their customer's name", "Collector calls by the region of the collector's branch", "SME loans taken by affluent customers"], "LEFT JOIN": ["Customers who have never applied", "Every branch with its loans, branches with none included", "Loan 1's schedule, unpaid instalments included"], "FULL OUTER JOIN": ["Our loan list against the bank's file: differences on either side"], "CROSS JOIN": ["A blank grid of every product in every branch to fill in"], "Self-join": ["Pairs of customers who share a phone number"]}}
```

### Depth (optional)

- ▶ Baraa, *SQL joins (basics)* [2:47:57](https://youtu.be/SSKVgrwhzus?t=10077&end=12449) — 40 min, INNER/LEFT/RIGHT/FULL with his pictures; his `customers`/`orders` are our `customers`/`loans`.
- RU deck (TBC Data Analytics 2.0, if you have it) `2.1 SQL-47-77.pdf` — JOIN pages. *Russian terms:* соединение = join, внутреннее = inner, левое = left, псевдоним = alias, ключ соединения = join key.

```videoquiz
{"video": "SSKVgrwhzus", "stops": [
  {"at": 10560, "q": "Why do you need a join at all?", "options": ["The answer needs columns that live in two different tables, connected by a key", "To make a query run faster", "To sort the result", "To remove duplicate rows"], "answer": 0, "explain": "A join combines rows of two tables that share a key value — Bekzod's name is in customers, the principal in loans.", "back": 60},
  {"at": 11080, "q": "What does an INNER JOIN return?", "options": ["Every row of the left table", "Only the rows that have a match in both tables", "Every row of both tables", "Only the rows with no match"], "answer": 1, "explain": "INNER keeps the matching rows only; a customer without an order (a loan, at Nur Finance) is not in the result.", "back": 60},
  {"at": 11650, "q": "A LEFT JOIN from customers to orders finds no order for a customer. What happens to that customer?", "options": ["The row is dropped", "The row stays, with NULL in the order columns", "The query fails", "The customer is matched to the first order"], "answer": 1, "explain": "LEFT keeps every row of the left table and fills the right side with NULL — the rows the anti-join looks for.", "back": 60},
  {"at": 12200, "q": "Which join keeps the unmatched rows of BOTH tables?", "options": ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN"], "answer": 3, "explain": "FULL keeps everything from both sides; RIGHT is a LEFT JOIN with the tables swapped, which is why analysts rarely write it.", "back": 60}]}
```

---

## 2. Worked example — Bekzod's list

**Ask:** one row per loan: customer, region, product, branch, principal, status; biggest first; show me the top five.

Each step uses one subsection of section 1, in the order you learned them.

1. **Why a join.** The answer needs columns from four tables: name and region in `customers`, the product name in `products`, the branch name in `branches`, principal and status in `loans`. More than one table → a join.
2. **The shape — FROM … JOIN … ON.** One row of the answer is one loan, so `loans` goes in `FROM` with the alias `l`. Every other table gets an alias too, and every column gets its prefix.
3. **INNER vs LEFT.** Ask the question: *if a loan has no customer, do I still want it?* There is no such loan — the anti-join `loans LEFT JOIN customers … WHERE c.customer_id IS NULL` returns 0 — so INNER JOIN loses nothing. The same holds for products and branches.
4. **Many-to-one.** Each hop goes from a loan to *one* customer, *one* product, *one* branch. The row count must stay 7 828. Run `COUNT(*)` before you add `ORDER BY`.
5. **Chaining — the path.** `customers ← loans → products`, `loans → branches`: all three keys sit on `loans`, so `loans` is the hub and every `ON` uses `l.`.
6. Write, run, check:

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

Questions whose answer is a query have a box under them — write, **▶ Run**, then **✔ Check** compares your result with the answer without showing it; your query is saved in this browser. Questions that ask for a number or a reason have an answer box of their own. The questions follow section 1 in order; the label in brackets names the subsection each one trains. Only this week's and last week's SQL: `SELECT … JOIN … WHERE … ORDER BY`, `COUNT(*)`, `TOP`/`LIMIT`. No `GROUP BY` yet (tomorrow). Keep the **Database** panel (button at the bottom right) open while you work: it lists every table and its columns — your join map.

**P1.** *(INNER JOIN)* Join `loans` to `customers`. How many rows? Now run `SELECT COUNT(*) FROM loans`. Why the same?

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM loans l JOIN customers c ON c.customer_id = l.customer_id;   -- 7828
```
Every loan has exactly one customer (many-to-one), so the inner join neither drops nor multiplies rows. The relationship is real, but this teaching copy of the database declares no FOREIGN KEY, so nothing *guarantees* it — the count is how you check. If it had been lower, some loans would point at a customer that does not exist; check with a LEFT JOIN … IS NULL — it returns 0 here.

</details>

```task
{"id": "w02d1-p1", "kind": "choice", "options": ["Every loan finds exactly one customer: the join is many-to-one from loans", "JOIN removes duplicate rows", "customers has exactly as many rows as loans", "An INNER JOIN always returns the row count of the first table"], "answer": 0, "explain": "customers has 6 040 rows, loans 7 828; the join keeps 7 828 because each loan's customer_id finds one customer. A loan pointing at a missing customer would have vanished, and the count would be lower.", "xp": 1}
```

**P2.** *(INNER JOIN)* SME loans (`product_id = 5`) taken by affluent customers — how many?

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM loans l JOIN customers c ON c.customer_id = l.customer_id
WHERE l.product_id = 5 AND c.segment = 'affluent';                                 -- 179
```

</details>

**P3.** *(INNER JOIN)* Micro loans (`product_id = 1`) taken by customers living in Samarkand — how many?

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM loans l JOIN customers c ON c.customer_id = l.customer_id
WHERE l.product_id = 1 AND c.region = 'Samarkand';                                 -- 277
```

</details>

**P4.** *(INNER JOIN)* Active loans held at the Nukus and Termez branches (the branch's region, not the customer's).

<details><summary>Answer</summary>

```sql
SELECT COUNT(*)
FROM loans l JOIN branches b ON b.branch_id = l.branch_id
WHERE b.region IN ('Nukus', 'Termez') AND l.status = 'active';                    -- 413
```
`customers` also has a `region` column. The question names the branch, so the join goes to `branches`.

</details>

**P5.** *(INNER JOIN)* The three largest written-off loans with the borrower's name and region.

<details><summary>Answer</summary>

```sql
SELECT l.loan_id, c.first_name, c.last_name, c.region, l.principal
FROM loans l JOIN customers c ON c.customer_id = l.customer_id
WHERE l.status = 'written_off'
ORDER BY l.principal DESC LIMIT 3;                       -- TOP 3 on SQL Server
```
6579 Jasur Ismoilov (Samarkand) 525 670 000 · 2898 Abror Sobirov (Tashkent) 507 760 000 · 903 Nodira Yusupova (Tashkent) 498 520 000. Three SME-sized losses; Sevara knows all three by name.

</details>

**P6.** *(LEFT JOIN)* Loan 1's schedule with its payments: instalment number, due date, amount due, paid date, amount paid — including instalments not yet paid.

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

Read your result: which instalment was paid latest relative to its due date? (Compare `due_date` and `paid_at` by eye — date arithmetic is Wednesday's.)

```task
{"id": "w02d1-p10", "kind": "number", "answer": 12, "dp": 0, "unit": "instalment no.", "hint": "Look for the row where paid_at is in a later month than due_date.", "model": "Instalment 12: due 2026-03-28, paid 2026-05-12 — 45 days late. Everything after it was paid on time."}
```

**P7.** *(INNER vs LEFT)* Count the rows of `customers INNER JOIN loans` and of `customers LEFT JOIN loans` (same `ON`). Explain the difference.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM customers c INNER JOIN loans l ON l.customer_id = c.customer_id;   -- 7828
SELECT COUNT(*) FROM customers c LEFT JOIN loans l ON l.customer_id = c.customer_id;    -- 9533
```
INNER keeps one row per loan: 7 828. LEFT keeps those rows and adds one row for every customer with no loan: 9 533 − 7 828 = 1 705. Check it from the other side: 6 040 customers − 4 335 different borrowers = 1 705.

</details>

How many customers have no loan?

```task
{"id": "w02d1-l1", "kind": "number", "answer": 1705, "dp": 0, "unit": "customers", "hint": "Rows of the LEFT JOIN − rows of the INNER JOIN.", "model": "9 533 − 7 828 = 1 705 customers with no loan. They are the rows the LEFT JOIN keeps with NULL in every loan column."}
```

**P8.** *(Anti-join)* Loans that have never had a collections action — and prove the number with two single-table counts.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM loans l LEFT JOIN collections_actions ca ON ca.loan_id = l.loan_id
WHERE ca.action_id IS NULL;                                                         -- 7545
SELECT COUNT(*) FROM loans;                                                         -- 7828
SELECT COUNT(DISTINCT loan_id) FROM collections_actions;                            -- 283
```
7 828 − 283 = 7 545: most loans never needed a reminder. The anti-join and the arithmetic must agree; when they do not, your join key is wrong.

</details>

**P9.** *(RIGHT JOIN)* Every staff member with their collections actions, written as a RIGHT JOIN: `FROM collections_actions ca RIGHT JOIN staff s ON s.staff_id = ca.collector_id`. How many staff members have no action at all? Then write the same query as a LEFT JOIN.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM collections_actions ca RIGHT JOIN staff s ON s.staff_id = ca.collector_id
WHERE ca.action_id IS NULL;                                                         -- 70
SELECT COUNT(*) FROM staff s LEFT JOIN collections_actions ca ON ca.collector_id = s.staff_id
WHERE ca.action_id IS NULL;                                                         -- 70, the same
```
70 of the 100 staff: the 60 loan officers and the 10 branch managers. Every one of the 30 collectors has actions. The LEFT version puts the complete list (`staff`) in `FROM` — easier to read.

</details>

```task
{"id": "w02d1-l2", "kind": "number", "answer": 70, "dp": 0, "unit": "staff", "hint": "RIGHT keeps every staff member; count the rows whose action side is NULL.", "model": "70: the 60 loan officers and 10 branch managers. Collectors are the only staff who log collections actions, and all 30 of them have some."}
```

**P10.** *(FULL OUTER JOIN)* Our list has loans 1, 2, 3 and 5. The bank's file has loans 2, 3, 4, 5 and 6. Build both lists with `WITH … VALUES` (as in section 1) and show, in one result, every loan with the side it is missing from.

<details><summary>Answer</summary>

```sql
WITH ours(loan_id) AS (VALUES (1), (2), (3), (5)),
     bank(loan_id) AS (VALUES (2), (3), (4), (5), (6))
SELECT o.loan_id AS in_ours, b.loan_id AS in_bank
FROM ours o
FULL OUTER JOIN bank b ON b.loan_id = o.loan_id
ORDER BY COALESCE(o.loan_id, b.loan_id);
```
6 rows. Loans 2, 3, 5 are in both. Loan 1 has NULL in `in_bank` — the bank never paid it out. Loans 4 and 6 have NULL in `in_ours` — money went out for loans we do not have. A LEFT JOIN would show only the first kind of difference.

</details>

**P11.** *(CROSS JOIN)* A blank grid for Madina: every product at every branch in the Tashkent region. How many rows?

<details><summary>Answer</summary>

```sql
SELECT b.branch_name, p.name AS product
FROM products p
CROSS JOIN branches b
WHERE b.region = 'Tashkent'
ORDER BY b.branch_name, p.name;                                                     -- 15 rows
```
Tashkent has three branches (Central, North, South), so 5 products × 3 branches = 15 rows. The `WHERE` runs on the grid after it is built.

</details>

**P12.** *(Self-join)* Pairs of customers whose first name, last name **and** birth date are exactly the same. Each pair once.

<details><summary>Answer</summary>

```sql
SELECT a.customer_id, b.customer_id AS other_id, a.first_name, a.last_name, a.birth_date, a.phone, b.phone AS other_phone
FROM customers a
JOIN customers b ON b.first_name = a.first_name
               AND b.last_name  = a.last_name
               AND b.birth_date = a.birth_date
               AND b.customer_id > a.customer_id;                                    -- 2 pairs
```
2 pairs: 823 and 1197 (Nodir Nazarov), 2460 and 5562 (Eldor Karimov), each with two different phones. The 40 duplicates with ids 6001+ do not appear: they were typed with a trailing space or with different upper/lower case, so `=` does not match them. Wednesday's `TRIM` and `LOWER` fix that.

</details>

Why does the exact self-join miss the 40 known duplicates?

```task
{"id": "w02d1-l3", "kind": "choice", "options": ["Their names differ by a trailing space or by upper/lower case, so = finds no match", "A self-join cannot compare text columns", "b.customer_id > a.customer_id removes them", "Duplicates always have different birth dates"], "answer": 0, "explain": "'Yulduz ' is not equal to 'Yulduz', and 'karimova' is not equal to 'Karimova'. The join is right; the data needs cleaning first (Wednesday)."}
```

**P13.** *(Many-to-one and one-to-many)* Count the rows of `loans JOIN installments`, `loans JOIN payments`, and `loans LEFT JOIN payments`. Explain each number from the relationships.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM loans l JOIN installments i ON i.loan_id = l.loan_id;         -- 92193
SELECT COUNT(*) FROM loans l JOIN payments p ON p.loan_id = l.loan_id;             -- 52875
SELECT COUNT(*) FROM loans l LEFT JOIN payments p ON p.loan_id = l.loan_id;        -- 53267
```
One-to-many: the count is the number of rows on the *many* side (92 193 instalments; 52 875 payments). The LEFT JOIN adds one row for each loan that has no payment at all: 53 267 − 52 875 = **392** loans with nothing paid yet (new loans whose first instalment is not due, and the worst defaulters).

</details>

From your three counts: how many loans have **no payment at all**?

```task
{"id": "w02d1-p8", "kind": "number", "answer": 392, "dp": 0, "unit": "loans", "hint": "The LEFT JOIN keeps every payment row plus one extra row per loan with no payment. Subtract.", "model": "53 267 − 52 875 = 392 loans with no payment yet: new loans whose first instalment is not due, and the worst defaulters."}
```

**P14.** *(Chaining tables)* Active Auto loans booked at the *Tashkent Central* branch. Use the product **code**, not the id, and the branch **name** — three tables.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*)
FROM loans l
JOIN products p ON p.product_id = l.product_id
JOIN branches b ON b.branch_id = l.branch_id
WHERE p.code = 'AUTO' AND b.branch_name = 'Tashkent Central' AND l.status = 'active';   -- 60
```
The path: `products ← loans → branches`. Both keys sit on `loans`, so both `ON`s use `l.`.

</details>

**P15.** *(The path through a table you do not show)* Week 1, Day 1, P7c asked "how many calls did collectors make in Fergana?". Answer it now: `collections_actions → staff → branches`.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*)
FROM collections_actions ca
JOIN staff s    ON s.staff_id = ca.collector_id
JOIN branches b ON b.branch_id = s.branch_id
WHERE ca.action_type = 'call' AND b.region = 'Fergana';                              -- 416
```
The branch is the *collector's* branch, reached through `staff`; no column of `staff` is shown. Joining `collections_actions → loans → branches` would give the loan's branch — the same here (collectors work their own branch's loans), but not the same question.

</details>

> 🚀 **Stretch (optional, +5 XP).** One more join for the curious — not needed to finish the day.

**P16.** *(Anti-join)* Join `loans` to `applications`. How many loans came through each channel? (One `COUNT(*)` with a `WHERE` per channel.) Then: how many applications have `status = 'approved'` but no loan at all?

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM loans l JOIN applications a ON a.application_id = l.application_id WHERE a.channel = 'app';       -- 2669
SELECT COUNT(*) FROM loans l JOIN applications a ON a.application_id = l.application_id WHERE a.channel = 'branch';    -- 3590
SELECT COUNT(*) FROM loans l JOIN applications a ON a.application_id = l.application_id WHERE a.channel = 'partner';   -- 1569
SELECT COUNT(*) FROM applications a LEFT JOIN loans l ON l.application_id = a.application_id
WHERE a.status = 'approved' AND l.loan_id IS NULL;                                                                      -- 89
```
app 2 669 · branch 3 590 · partner 1 569 (= 7 828). Approved with no loan: **89**. All 89 were decided between 2026-09-29 and 2026-10-05 — approvals whose disbursement had not happened by the as-of date (some are even decided *after* it: the decision column carries a planned date). Not errors: a pipeline. Day 4 returns to them.

</details>

Before you look at those 89 rows: describe in words what they most likely are, and how you would check it.

```task
{"id": "w02d1-p11", "kind": "free", "min": 20, "model": "Approved applications that have not been paid out yet — a pipeline, not an error. If that is right, their decision dates are the last few days before the as-of date (2026-10-01), so I would list them with decided_at, sorted. They are 89 rows from 2026-09-29 to 2026-10-05, some even dated after the as-of date because the decision column carries a planned date.", "rubric": ["Calls them approvals not yet disbursed (a pipeline), not broken data", "Proposes a check: their decision dates should sit just before the as-of date", "Uses the anti-join reading: approved on the left, no loan on the right"], "xp": 2}
```

### SQL lab — your own lookup table

A join works on any two tables that share a key — including one you build. This lab runs on **your practice copy** of the database (the **Database** panel shows your new table; **Database → Reset** brings the original back).

```sqllab
{"id": "w02d1-lab", "title": "A segment lookup table, joined", "intro": "Madina wants readable segment names on every customer list. Build a three-row lookup table, join it to customers, then see what an anti-join finds when a lookup row goes missing.",
 "steps": [
  {"say": "Create a table my_segments with two text columns: segment (the primary key) and label.", "hint": "CREATE TABLE my_segments (segment TEXT PRIMARY KEY, label TEXT);", "expect": "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'my_segments'", "want": 1},
  {"say": "Insert the three segments with a label each: 'mass' → 'Mass market', 'affluent' → 'Affluent', 'sme' → 'Small business'.", "hint": "INSERT INTO my_segments (segment, label) VALUES ('mass', 'Mass market'), ('affluent', 'Affluent'), ('sme', 'Small business');", "expect": "SELECT COUNT(*) FROM my_segments", "want": 3},
  {"say": "Save the join as a table: my_customer_labels with customer_id and label, customers INNER JOIN my_segments on the segment. Every customer should find a label — how many rows do you expect?", "hint": "CREATE TABLE my_customer_labels AS SELECT c.customer_id, s.label FROM customers c JOIN my_segments s ON s.segment = c.segment;", "expect": "SELECT COUNT(*) FROM my_customer_labels", "want": 6040},
  {"say": "Delete the 'sme' row from my_segments (pretend somebody removed it from the reference table).", "hint": "DELETE FROM my_segments WHERE segment = 'sme';", "expect": "SELECT COUNT(*) FROM my_segments WHERE segment = 'sme'", "want": 0},
  {"say": "Now find the customers who lost their label: save customers LEFT JOIN my_segments … WHERE s.segment IS NULL as my_unlabelled (customer_id, segment).", "hint": "CREATE TABLE my_unlabelled AS SELECT c.customer_id, c.segment FROM customers c LEFT JOIN my_segments s ON s.segment = c.segment WHERE s.segment IS NULL;", "expect": "SELECT COUNT(*) FROM my_unlabelled", "want": 1251}],
 "cleanup": "DROP TABLE IF EXISTS my_segments; DROP TABLE IF EXISTS my_customer_labels; DROP TABLE IF EXISTS my_unlabelled"}
```

An INNER JOIN on the shortened lookup would now return 4 789 customers without any warning — the 1 251 SME customers would simply be gone. That is why every join to a reference table deserves a LEFT JOIN … IS NULL check once.

---

## 4. Homework <span class="badge hw">HW 2.1 — Due Day 3</span>

**Bekzod's loan book.** Ten queries he can run every Monday, written and checked in the workspace below. Q1–Q5 and Q7–Q9 use today's joins; **Q6 and Q10 need one tool from tomorrow** (`GROUP BY` and `SUM`) — do them after Day 2; the homework is due on Day 3. Each query is checked against the data when you tap **✔ Check** (row count and the key number, never the answer itself); 📤 Submit sends the whole file `loan_book.sql` to your mentor.

### 📎 Hand in here

```sqltask
{"check": "hw2.1", "lesson": "W2D1", "title": "HW 2.1 — Bekzod's loan book", "file": "loan_book.sql",
 "why": "Bekzod reruns these ten queries every Monday; a join on the wrong key or a dropped row would go straight onto the board's slide.",
 "graded": ["Every query runs and passes ✔ Check: the right key in each join, the right row count", "LEFT vs INNER chosen on purpose in Q7 and Q9, with a comment saying why", "Columns a manager can read: aliases, one column with the customer's full name"],
 "tasks": [
  {"id": "Q1", "q": "The readable loan list from section 2 (loan, customer name, region, product, branch, principal, status), all loans, newest disbursement first."},
  {"id": "Q2", "q": "The same list, active loans only, plus `monthly_payment`."},
  {"id": "Q3", "q": "Active SME loans booked at branches in the Tashkent region, largest principal first (product by `code`, region from `branches`)."},
  {"id": "Q4", "q": "Auto loans (any status) of affluent customers, with the customer's name."},
  {"id": "Q5", "q": "Every loan with the `channel` and `credit_score` of its application."},
  {"id": "Q6", "q": "After Day 2: loans per loan officer (`applications.officer_id → staff`), with the officer's name, most loans first. Who handled the most?"},
  {"id": "Q7", "q": "Customers who have no loan: the count, and the list with region and segment (LEFT JOIN — say why in a comment)."},
  {"id": "Q8", "q": "Written-off loans with customer name, phone and branch name — Sevara's list."},
  {"id": "Q9", "q": "Loan 4570's full schedule with its payments: instalment number, due date, amount due, paid date, amount paid (LEFT JOIN — say why in a comment)."},
  {"id": "Q10", "q": "After Day 2: loans whose customer id is 6001 or above (last week's duplicate ids) — how many loans, and how much principal in total?"},
  {"id": "why-left", "file": "why_left.md", "text": true, "minLines": 2, "q": "Two lines in your own words: why Q7 and Q9 need a LEFT JOIN, and what an INNER JOIN would have hidden in each."}]}
```

---

## 5. Self-check

```check
{"id": "w02d1-sc", "questions": [
  {"type": "single", "q": "In `FROM customers c JOIN loans l ON l.customer_id = c.customer_id`, which customers are missing from the result?", "options": ["Customers who have no loan", "Customers with more than one loan", "Customers whose loans are closed", "None — an INNER JOIN keeps every customer"], "answer": 0, "explain": "An INNER JOIN keeps only rows with a partner on both sides; customers without a loan need a LEFT JOIN (→ section 1, INNER vs LEFT)."},
  {"type": "number", "q": "`loans JOIN installments` returns 92 193 rows. How many different loan_id values does that result contain?", "answer": 7828, "explain": "Each of the 7 828 loans appears once per instalment. COUNT(*) vs COUNT(DISTINCT l.loan_id) shows the multiplication (→ section 1, Many-to-one)."},
  {"type": "text", "q": "Complete the anti-join for 'customers who never applied': `FROM customers c LEFT JOIN applications a ON a.customer_id = c.customer_id WHERE ___ IS NULL` — what goes in the gap?", "answer": ["a.application_id", "application_id", "a.customer_id"], "explain": "Test the right-hand table's key: on a matched row it is never NULL, so IS NULL keeps exactly the customers without a partner (→ section 1, the anti-join; P8)."}
]}
```

---

## 6. Company corner <span class="badge company">Outstanding and portfolio</span>

Bekzod's second question every Monday is *"how big is the book?"*. Two different numbers answer it, and they are both joins of `installments` with `loans`/`payments`. Learn to compute both and to say which one you mean. Both queries add a column up with `SUM(column)` — tomorrow's first topic; today read it as "add this column over the rows that are left".

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

**6.48 bn UZS** on 1 357 matured instalments of 399 loans has not been paid at all. Most of it is already dead money: joined to `loans`, 4.88 bn sits on written-off loans and 0.87 bn on defaults; **0.69 bn on 181 instalments of active loans** is what Sevara's team is actually chasing this week. One refinement for Wednesday: this query treats a *partially* paid instalment as paid. Counting "not fully paid" gives 1 784 instalments on 413 loans and 7.60 bn still owed — the number the DPD computation will use.

| Number | Question it answers | Grain of the query | As of 2026-10-01 |
|---|---|---|---|
| **Outstanding** | how much principal is still to come | instalments with `due_date > as-of` | 208.7 bn (203.4 bn active) |
| **Overdue** | how much should have come and did not | matured instalments with no payment | 6.48 bn (0.69 bn on active loans) |

```game
{"id": "w02d1-g4", "type": "sort", "title": "Outstanding or overdue?", "groups": {"Outstanding": ["principal_due of instalments due after 2026-10-01", "208.7 bn UZS", "includes the future principal of loans already in default", "answers 'how big is the book?'"], "Overdue": ["instalments due on or before 2026-10-01 with no payment", "6.48 bn UZS", "an anti-join: installments LEFT JOIN payments … IS NULL", "answers 'what should have come in and did not?'"]}}
```

> 🎯 **Interview version.** *"What is the difference between outstanding balance and overdue amount, and how would you compute each?"* — Outstanding = principal not yet due, from the schedule; overdue = matured instalments without payment, from schedule minus payments. Mention that outstanding includes the overdue loans' *future* principal too, and that both need a date.

**Say it like in an interview.** *"What is the difference between outstanding balance and overdue amount, and how would you compute each in SQL?"* Answer as you would out loud, with Nur Finance numbers.

```task
{"id": "w02d1-iv", "kind": "free", "min": 30, "model": "Outstanding is the principal that has not been repaid yet: from the schedule, the sum of principal_due on instalments due after the as-of date — 208.7 bn UZS at Nur Finance on 2026-10-01, 203.4 bn on active loans. Overdue is money that should already have arrived and has not: instalments due on or before the as-of date with no payment, an anti-join from installments to payments — 6.48 bn. Both need an as-of date, and outstanding also contains the future principal of loans that are already overdue.", "rubric": ["Defines outstanding as principal not yet due, from the schedule", "Defines overdue as matured instalments without payment (installments LEFT JOIN payments … IS NULL)", "Says both need an as-of date", "Gives a Nur Finance number"], "xp": 2}
```

Tomorrow: Madina's board pack — the same joins, with `GROUP BY` on top.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w02d1", "pass": 0.8, "questions": [
  {"type": "single", "q": "What happens when you run this?", "code": "SELECT customer_id, l.principal\nFROM loans l\nJOIN customers c ON c.customer_id = l.customer_id;", "options": ["One row per loan with the customer id", "An 'ambiguous column' error", "One row per customer", "Zero rows"], "answer": 1, "explain": "customer_id exists in both tables, so the database cannot tell which one you mean; prefix every column (→ section 1, The shape of a join)."},
  {"type": "single", "q": "customers LEFT JOIN loans returns more rows than customers INNER JOIN loans. Why?", "options": ["LEFT JOIN counts every loan twice", "Customers without a loan keep one row each, with NULL in the loan columns", "LEFT JOIN also adds loans without a customer", "It is a bug in the join condition"], "answer": 1, "explain": "LEFT keeps every row of the left table and fills the right side with NULLs when nothing matches (→ section 1, INNER vs LEFT)."},
  {"type": "number", "q": "A small bank has 10 customers. 7 of them have loans — 12 loans in total — and 3 have none. How many rows does customers LEFT JOIN loans return?", "answer": 15, "explain": "12 loan rows + 3 customers with no loan; check this arithmetic every time you LEFT JOIN (→ section 1, INNER vs LEFT)."},
  {"type": "single", "q": "What does this query return?", "code": "SELECT COUNT(*)\nFROM customers c\nJOIN loans l ON l.customer_id = c.customer_id\nWHERE l.loan_id IS NULL;", "options": ["The number of customers who never borrowed", "0 — the INNER JOIN already removed customers without a loan", "The number of loans with no customer", "An error"], "answer": 1, "explain": "The anti-join needs LEFT JOIN; an inner join never produces the NULL rows the filter is looking for (→ section 1, the anti-join; P8)."},
  {"type": "single", "q": "This join returns 92 193 rows. What is one row of the result?", "code": "SELECT COUNT(*)\nFROM loans l\nJOIN installments i ON i.loan_id = l.loan_id;", "options": ["One loan", "One instalment, with its loan's columns repeated", "One customer", "One payment"], "answer": 1, "explain": "The grain of a join result is the grain of the many side; SUM(l.principal) here would count each principal once per instalment (→ section 1, Many-to-one)."},
  {"type": "multi", "q": "Starting FROM loans with INNER JOINs, which joins keep the result at one row per loan?", "options": ["JOIN customers ON customer_id", "JOIN products ON product_id", "JOIN branches ON branch_id", "JOIN installments ON loan_id", "JOIN payments ON loan_id"], "answer": [0, 1, 2], "explain": "Many-to-one joins find exactly one partner per loan; one-to-many joins to installments or payments multiply the rows (→ section 1, Many-to-one; P13)."},
  {"type": "single", "q": "You want loan 1's full schedule with its payments, including instalments not paid yet. Which join?", "options": ["installments INNER JOIN payments", "installments LEFT JOIN payments", "payments LEFT JOIN installments", "No join — payments alone"], "answer": 1, "explain": "The schedule is the left table; an inner join would hide every open instalment (→ P6)."},
  {"type": "single", "q": "Bekzod asks 'how much principal is still outstanding as of 2026-10-01?'. Which query answers it?", "options": ["SUM(principal) FROM loans WHERE status = 'active'", "SUM(principal_due) FROM installments WHERE due_date > '2026-10-01'", "SUM(total_due) of matured instalments with no payment", "SUM(amount) FROM payments"], "answer": 1, "explain": "Outstanding is the principal not yet due on the schedule; SUM(principal) is what was originally lent, and matured-unpaid is the overdue amount (→ section 6, Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w02d1", "sql": true, "q": "Bekzod asks: how much outstanding principal (instalments due after the as-of date 2026-10-01) sits on active Auto loans booked at branches in the Tashkent region? Answer in soum, whole number.", "type": "number", "dp": 0, "h": ["21654098cae00c3343048722"], "hint": "Three tables: where the money is, which loan it belongs to, and where that loan was booked. Decide what one row is before you sum.", "sol": "U0VMRUNUIFNVTShpLnByaW5jaXBhbF9kdWUpIEFTIG91dHN0YW5kaW5nCkZST00gaW5zdGFsbG1lbnRzIGkKSk9JTiBsb2FucyBsICAgIE9OIGwubG9hbl9pZCA9IGkubG9hbl9pZApKT0lOIGJyYW5jaGVzIGIgT04gYi5icmFuY2hfaWQgPSBsLmJyYW5jaF9pZApXSEVSRSBpLmR1ZV9kYXRlID4gJzIwMjYtMTAtMDEnCiAgQU5EIGwuc3RhdHVzID0gJ2FjdGl2ZScKICBBTkQgbC5wcm9kdWN0X2lkID0gNCAgICAgICAgICAtLSBBdXRvIChvciBqb2luIHByb2R1Y3RzIGFuZCBmaWx0ZXIgY29kZSA9ICdBVVRPJykKICBBTkQgYi5yZWdpb24gPSAnVGFzaGtlbnQnOwotLSAyMyA5MDIgNzA3IDkwNSAoMTUxIGxvYW5zKTsgdGhlIHNhbWUgdGV4dCBvbiBTUUxpdGUgYW5kIFNRTCBTZXJ2ZXIKT25lIHJvdyBvZiB0aGUgam9pbiBpcyBhbiBpbnN0YWxtZW50LCBzbyBzdW1taW5nIHByaW5jaXBhbF9kdWUgaXMgc2FmZTsgc3VtbWluZyBsLnByaW5jaXBhbCBvdmVyIHRoZSBzYW1lIGpvaW4gd291bGQgY291bnQgZWFjaCBsb2FuIG9uY2UgcGVyIHJlbWFpbmluZyBpbnN0YWxtZW50LgpXaXRob3V0IHRoZSBzdGF0dXMgZmlsdGVyIHlvdSBnZXQgMjQgNTExIDk5NyA2MTg6IDAuNiBibiBzaXRzIG9uIFRhc2hrZW50IEF1dG8gbG9hbnMgaW4gZGVmYXVsdCBvciB3cml0dGVuIG9mZiB0aGF0IG5vYm9keSBleHBlY3RzIGJhY2suIE9mIHRoZSA1NS45NyBibiBvdXRzdGFuZGluZyBvbiBhY3RpdmUgQXV0byBsb2FucywgVGFzaGtlbnQncyBicmFuY2hlcyBjYXJyeSA0MyAlIOKAlCBhIGxpdHRsZSBhYm92ZSBUYXNoa2VudCdzIDM5ICUgb2YgdGhlIHdob2xlIGJvb2su"}
```

<!-- challenge:end -->
