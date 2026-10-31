# Week 1 · Day 2 — Your first queries

<span class="badge">Learn 60 min</span> <span class="badge">Practice 60 min</span> <span class="badge">Homework</span> <span class="badge company">Company corner</span>

> STORY **Tuesday, 9:15.** Bekzod, the portfolio manager (*портфельный менеджер*), leans over the partition: *"Madina says you're the new analyst. I run the Auto and SME books. Every Monday I open the loans table in Excel and scroll until my eyes hurt. Can the database just… give me the rows I want?"* Madina, from behind her screen: *"That is literally what SELECT is for. Show him by lunch."*

## Today in 3 lines

- You can write a **SELECT** that picks columns, renames them, removes duplicates, **filters rows** with `WHERE`, **sorts** them, and returns only the first N.
- You know the seven filter operators (`=`, `<>`, `>`/`<`, `BETWEEN`, `IN`, `LIKE`, `IS NULL`) and how `AND`/`OR`/`NOT` combine them — including the parenthesis trap.
- You can compute Nur Finance's **approval rate** with two counts, and explain the cancelled-applications trap.

---

## 1. Learn — asking a table a question

### The shape of a query

**What it is.** A **query** (*запрос*) is a question to the database, written in SQL. Every query you write this week has the same skeleton of **clauses** (*предложения*): `SELECT` names the columns, `FROM` the table, `WHERE` the rows, `ORDER BY` the order, `LIMIT` how many. Only `SELECT` and `FROM` are required.

**How to write it.**

```sql
-- the shape only: replace the names before you run it
SELECT   column1, column2  -- which columns (or * for all)
FROM     table_name        -- which table
WHERE    condition         -- which rows (optional)
ORDER BY column1 DESC      -- in what order (optional)
LIMIT    5;
-- how many rows at most (optional; SQL Server: SELECT TOP 5 …)
```

One real query with every clause — the five biggest loans in default:

```sql
SELECT loan_id, principal, status
FROM loans
WHERE status = 'default'
ORDER BY principal DESC
LIMIT 5;
```

5 rows, biggest first: loan 370 with 589 000 000 on top. Read it as one sentence: *"from `loans`, keep the rows in default, show three columns, biggest principal first, stop after five."*

**When you use it.**
- Always: the clauses go in this order, or the database stops with a syntax error.
- The database **runs** them in a different order: FROM → WHERE → SELECT → ORDER BY → LIMIT. It picks the table, keeps the rows that pass the filter, cuts out your columns, sorts, then stops. That is why `WHERE` can use a column you do not display.

**Your turn.** Fill the skeleton for Bekzod: his Auto loans (product 4), biggest first.

```game
{"type": "cloze", "id": "w01d2-g1", "title": "Bekzod's Auto loans, biggest first: fill the skeleton", "text": "SELECT {{0}} FROM {{1}} WHERE {{2}} ORDER BY {{3}};", "blanks": [["loan_id, principal"], ["loans"], ["product_id = 4"], ["principal DESC"]], "distractors": ["customers", "principal = NULL", "GROUP BY product_id"]}
```

> 🎬 **Didn't get the order of the clauses in a query?** [Baraa explains it · 4 min](https://youtu.be/SSKVgrwhzus?t=5008&end=5262)

### SELECT — choose the columns

**What it is.** **SELECT** (*выбрать*) lists the columns you want, separated by commas, in the order you want them. `SELECT *` means every column. `SELECT COUNT(*)` returns one number: how many rows there are.

```pic
{"id": "w01d2-pic1", "title": "SELECT keeps the columns you name", "caption": "Every row stays; only the two named columns come out, in the order you wrote them.", "tables": [{"id": "src", "name": "loans", "cols": ["loan_id", "customer_id", "principal", "status"], "rows": [[1, 3473, "31 150 000", "active"], [2, 4570, "40 060 000", "active"], [3, 1397, "1 590 000", "closed"]], "tags": {"loan_id": "✓", "status": "✓"}}, {"id": "res", "name": "result", "cols": ["loan_id", "status"], "rows": [[1, "active"], [2, "active"], [3, "closed"]], "via": "SELECT loan_id, status"}]}
```

**How to write it.**

```sql
SELECT loan_id, principal, disbursed_at, status  -- four columns, in this order
FROM loans;
```

7 828 rows — every loan — but only the four columns you named, in your order.

```sql
SELECT COUNT(*) FROM customers;    -- one row, one number
```

6 040 — the number of rows in `customers`.

**When you use it.**
- Name the columns in every query you keep or send. `SELECT *` is for a first look at a table.
- `COUNT(*)` when the question is "how many?". It is the only aggregate this week; the others come in Week 2.

**Your turn.** Build the query: each customer's id, first name and region.

```game
{"type": "build", "id": "w01d2-g4", "title": "Choose the columns", "q": "The id, first name and region of every customer.", "tokens": ["SELECT", "customer_id,", "first_name,", "region", "FROM", "customers"], "distractors": ["loans", "WHERE", "*"]}
```

> 🎬 **Didn't get SELECT and FROM?** [Baraa explains it · 8 min](https://youtu.be/SSKVgrwhzus?t=2139&end=2627)

### Aliases — AS renames a column in the result

**What it is.** An **alias** (*псевдоним*) is a new name for a column in the result. You write it after the column with `AS`. The table itself does not change.

**How to write it.**

```sql
SELECT loan_id      AS loan,          -- column AS new_name
       principal    AS amount_uzs,
       disbursed_at AS paid_out_on
FROM loans;
```

7 828 rows; the headers now read `loan`, `amount_uzs`, `paid_out_on`.

**When you use it.**
- To give a report readable headers.
- To name a computed column: `SELECT COUNT(*) AS micro_loans_sep` (the Worked example).

> ⚠️ **Watch out.** An alias with a space needs double quotes: `AS "amount UZS"`. Easier: use `_` instead of a space.

**Your turn.** List every product: its `name` as `product` and its `annual_rate` as `rate` (5 rows).

```task
{"id": "w01d2-l1", "kind": "sql", "model": "SELECT name AS product, annual_rate AS rate FROM products;", "note": "Two columns, each followed by AS and its new name."}
```

### DISTINCT — one row per different value

**What it is.** **DISTINCT** (*различные*) removes duplicate rows from the result. You write it right after `SELECT`. It keeps one row per different combination of the selected columns.

**How to write it.**

```sql
SELECT DISTINCT channel FROM applications;
```

3 rows — `app`, `branch`, `partner` — although `applications` has 14 000 rows.

```sql
SELECT DISTINCT channel, status FROM applications;
```

12 rows: every channel appears with each of the four statuses (3 × 4 = 12).

**When you use it.**
- To learn what a column contains before you filter on it — the fastest look there is.
- To list the different values of a column for a report: regions, products, statuses.

**Your turn.** How many different values does `collections_actions.outcome` have?

```task
{"id": "w01d2-l2", "kind": "number", "answer": 4, "dp": 0, "unit": "values", "hint": "SELECT DISTINCT outcome FROM collections_actions; then count the rows.", "model": "4: promise_to_pay, refused, no_answer, paid."}
```

> 🎬 **Didn't get DISTINCT?** [Baraa explains it · 3 min](https://youtu.be/SSKVgrwhzus?t=4495&end=4701)

### ORDER BY — sort the rows

**What it is.** **ORDER BY** (*сортировка*) sorts the result by one or more columns. `ASC` means smallest first and is the default. `DESC` means biggest first.

```pic
{"id": "w01d2-pic2", "title": "ORDER BY changes only the order", "caption": "The same five loans, biggest principal first. Each loan keeps its colour, so you can follow it.", "tables": [{"id": "src", "name": "loans", "cols": ["loan_id", "principal"], "rows": [[1, "31 150 000"], [2, "40 060 000"], [3, "1 590 000"], [4, "2 520 000"], [5, "25 590 000"]], "tone": ["a", "b", "c", "d", "e"]}, {"id": "res", "name": "result", "cols": ["loan_id", "principal"], "rows": [[2, "40 060 000"], [1, "31 150 000"], [5, "25 590 000"], [4, "2 520 000"], [3, "1 590 000"]], "tone": ["b", "a", "e", "d", "c"], "via": "ORDER BY principal DESC"}]}
```

**How to write it.**

```sql
SELECT loan_id, product_id, principal
FROM loans
ORDER BY product_id, principal DESC;
-- first by product (1, 2, 3 and on), inside each product the biggest first
```

7 828 rows. Product 1 (Micro) comes first, and inside it the biggest loans: 4 990 000 at the top.

**When you use it.**
- "Biggest first", "newest first", "alphabetically".
- Several columns: the second column sorts only inside equal values of the first.

> ⚠️ **Watch out.** An empty cell (**NULL**) counts as the smallest value in both SQLite and SQL Server. With `ASC` the empty cells come first, with `DESC` they come last.

**Your turn.** What does `ORDER BY region, monthly_income DESC` do?

```task
{"id": "w01d2-l3", "kind": "choice", "options": ["Sorts by region A→Z; inside each region, the highest income first", "Sorts by income only; region is ignored", "Sorts both columns from the highest down", "Sorts by region Z→A, then income"], "answer": 0, "explain": "DESC belongs to monthly_income only. region has no word after it, so it uses the default ASC (A→Z)."}
```

> 🎬 **Didn't get ORDER BY?** [Baraa explains it · 9 min](https://youtu.be/SSKVgrwhzus?t=2984&end=3512)

### LIMIT and TOP — only the first N rows

**What it is.** **LIMIT** returns at most N rows. It goes at the very end of the query. SQL Server writes the same thing as **TOP N** right after `SELECT`. This is the one place this week where the two engines spell a query differently.

**How to write it.**

```sql
-- SQL Server
SELECT TOP 3 application_id, requested_amount FROM applications ORDER BY requested_amount DESC;
-- SQLite / PostgreSQL / MySQL
SELECT application_id, requested_amount FROM applications ORDER BY requested_amount DESC LIMIT 3;
```

3 rows: application 5074 asked for 599 060 000, the most of all 14 000. (The box runs both lines: it turns `TOP` into `LIMIT` for you, and shows the last result.)

**When you use it.** "The five biggest", "the ten newest", "the first row" — always together with `ORDER BY`.

> ⚠️ **Watch out.** `LIMIT` without `ORDER BY` returns *some* N rows, not the biggest or the newest. Sort first, then cut.

**Your turn.** What is the `application_id` of the most recent application (latest `applied_at`)?

```task
{"id": "w01d2-l4", "kind": "number", "answer": 6338, "dp": 0, "hint": "ORDER BY applied_at DESC, then LIMIT 1.", "model": "6338 — applied on 2026-10-01 at 21:36, the evening of the data's as-of date."}
```

> 🎬 **Didn't get TOP (LIMIT)?** [Baraa explains it · 5 min](https://youtu.be/SSKVgrwhzus?t=4700&end=5008)

### WHERE — keep only the rows you want

**What it is.** **WHERE** (*условие*) keeps the rows for which a **condition** is true and drops the rest. A condition compares a column with a value. Text values go in single quotes: `'default'`.

```pic
{"id": "w01d2-pic3", "title": "WHERE keeps the rows that pass the test", "caption": "Each row is asked: is `status` equal to `'active'`? Green rows say yes and stay; struck-through rows say no and are dropped.", "tables": [{"id": "src", "name": "loans", "cols": ["loan_id", "principal", "status"], "rows": [[1, "31 150 000", "active"], [2, "40 060 000", "active"], [3, "1 590 000", "closed"], [4, "2 520 000", "active"], [5, "25 590 000", "active"], [6, "4 720 000", "closed"]], "keep": [0, 1, 3, 4], "drop": [2, 5]}, {"id": "res", "name": "result", "cols": ["loan_id", "principal", "status"], "rows": [[1, "31 150 000", "active"], [2, "40 060 000", "active"], [4, "2 520 000", "active"], [5, "25 590 000", "active"]], "via": "WHERE status = 'active'"}]}
```

**How to write it.**

```sql
SELECT loan_id, principal, status
FROM loans
WHERE status = 'default';     -- column  operator  value
```

44 rows — the loans in default. The other 7 784 loans are dropped.

**When you use it.** Every question with a "which": which loans, which customers, which month. The next six subsections are the operators you can put in a condition.

**Your turn.** Build the query: the id and principal of every written-off loan.

```game
{"type": "build", "id": "w01d2-g5", "title": "Keep only some rows", "q": "The id and principal of every loan whose status is written_off.", "tokens": ["SELECT", "loan_id, principal", "FROM", "loans", "WHERE", "status = 'written_off'"], "distractors": ["status = written_off", "ORDER BY", "customers"]}
```

> 🎬 **Didn't get WHERE?** [Baraa explains it · 6 min](https://youtu.be/SSKVgrwhzus?t=2619&end=2986)

### The operators = and <> — equal and not equal

**What it is.** `=` keeps the rows where the column **equals** the value. `<>` keeps the rows where it **does not equal** it (`!=` means the same).

**How to write it.**

```sql
SELECT COUNT(*) FROM applications WHERE channel <> 'branch';
```

7 777 applications came through the app or a partner — everything except the branch channel.

**When you use it.** Exact matches on codes, statuses, ids, regions: `region = 'Tashkent'`, `product_id = 5`, `status <> 'closed'`.

**Your turn.** How many loans have risk grade `A`?

```task
{"id": "w01d2-l5", "kind": "number", "answer": 1821, "dp": 0, "unit": "loans", "hint": "WHERE risk_grade = 'A' — the letter in single quotes.", "model": "1 821 loans have risk grade A."}
```

> 🎬 **Didn't get the = and <> operators?** [Baraa explains it · 5 min](https://youtu.be/SSKVgrwhzus?t=7736&end=8062)

### The operators >, <, >=, <= — bigger and smaller

**What it is.** The **comparison operators** keep rows by size: `>` greater than, `<` less than, `>=` greater or equal, `<=` less or equal. They work on numbers and on dates.

**How to write it.**

```sql
SELECT COUNT(*) FROM loans WHERE principal > 200000000;
-- numbers: no quotes, no spaces
```

755 loans are bigger than 200 000 000.

```sql
SELECT COUNT(*) FROM loans WHERE disbursed_at >= '2026-09-01';
-- dates: 'YYYY-MM-DD' in quotes
```

382 loans were paid out on or after 1 September 2026 — up to the data's last day, 1 October.

**When you use it.** Thresholds and periods: "over 100 million", "a score below 500", "since 1 January".

**Your turn.** How many loans run 36 months or longer?

```task
{"id": "w01d2-l6", "kind": "number", "answer": 538, "dp": 0, "unit": "loans", "hint": "\"36 or longer\" includes 36: >=.", "model": "538 loans have term_months >= 36."}
```

> 🎬 **Didn't get the >, <, >=, <= operators?** [Baraa explains it · 3 min](https://youtu.be/SSKVgrwhzus?t=8060&end=8234)

### BETWEEN — a range with both ends included

**What it is.** **BETWEEN a AND b** keeps the values from `a` to `b`, **both ends included**. It is a short way to write `>= a AND <= b`.

**How to write it.**

```sql
SELECT COUNT(*) FROM loans WHERE term_months BETWEEN 12 AND 24;
-- the same as term_months >= 12 AND term_months <= 24
```

2 940 loans run from 12 to 24 months — the 12-month and the 24-month loans included.

**When you use it.** Ranges of numbers ("between 1 and 5 million") and of plain dates ("the first week of September").

> ⚠️ **Watch out.** On a column that holds a date **and a time**, `BETWEEN '…-01' AND '…-31'` drops everything after midnight of the last day. See *Text, numbers and dates* below.

**Your turn.** How many applications asked for 10 000 000 to 20 000 000, both ends included?

```task
{"id": "w01d2-l7", "kind": "number", "answer": 838, "dp": 0, "unit": "applications", "hint": "WHERE requested_amount BETWEEN 10000000 AND 20000000 — numbers without spaces.", "model": "838 applications."}
```

> 🎬 **Didn't get BETWEEN?** [Baraa explains it · 4 min](https://youtu.be/SSKVgrwhzus?t=8900&end=9168)

### IN — equal to one of a list

**What it is.** **IN (…)** keeps the rows whose value equals **any** value in the list. It is a short way to write several `=` joined by `OR`.

**How to write it.**

```sql
SELECT COUNT(*) FROM loans WHERE product_id IN (4, 5);
-- the same as product_id = 4 OR product_id = 5
```

1 172 loans are Auto (product 4) or SME (product 5): 391 + 781.

**When you use it.** A short list of codes, statuses or regions: `region IN ('Nukus', 'Termez')`, `status IN ('approved', 'approved_not_disbursed')`.

**Your turn.** How many customers are in the `affluent` or the `sme` segment?

```task
{"id": "w01d2-l8", "kind": "number", "answer": 2455, "dp": 0, "unit": "customers", "hint": "WHERE segment IN ('affluent', 'sme') — text values in quotes, separated by commas.", "model": "2 455 customers; the other 3 585 are mass."}
```

> 🎬 **Didn't get IN?** [Baraa explains it · 4 min](https://youtu.be/SSKVgrwhzus?t=9169&end=9418)

### LIKE — a text pattern

**What it is.** **LIKE** keeps the text values that match a **pattern**. In the pattern, `%` stands for any number of characters (also none), and `_` for exactly one character.

**How to write it.**

```sql
SELECT name FROM products WHERE name LIKE '%loan';
-- anything, then "loan" at the end
```

4 rows: Micro loan, Consumer loan, Auto loan, Small business loan. *Buy now pay later* does not end in "loan".

```sql
SELECT code FROM products WHERE code LIKE '____';
-- four underscores = exactly four characters
```

3 rows: CONS, BNPL, AUTO. MICRO has five letters and SME three.

**When you use it.** "Starts with", "ends with", "contains": `LIKE 'M%'`, `LIKE '%ova'`, `LIKE '%loan%'`.

> ⚠️ **Watch out.** In SQLite, `LIKE` ignores the case of Latin letters: `'m%'` also finds *Madina*. In SQL Server it follows the database's collation. `=` in SQLite does not ignore case.

**Your turn.** How many customers have a surname that starts with `Abdu`?

```task
{"id": "w01d2-l9", "kind": "number", "answer": 317, "dp": 0, "unit": "customers", "hint": "WHERE last_name LIKE 'Abdu%' — % after the letters.", "model": "317 customers (Abdullaev, Abdullaeva, Abdurakhmonov…)."}
```

> 🎬 **Didn't get LIKE?** [Baraa explains it · 10 min](https://youtu.be/SSKVgrwhzus?t=9418&end=10046)

### IS NULL — the empty cell

**What it is.** **NULL** (*пустое значение*) means "no value here — unknown". It is not zero and not an empty text. `IS NULL` finds the empty cells; `IS NOT NULL` finds the filled ones.

**How to write it.**

```sql
SELECT COUNT(*) FROM applications WHERE credit_score IS NULL;       -- 388
SELECT COUNT(*) FROM applications WHERE credit_score IS NOT NULL;   -- 13 612
```

The box shows the last count: 13 612 applications have a score. Run the first line alone: 388 have none. 388 + 13 612 = 14 000 — every application is in exactly one group.

**When you use it.** Missing data: no income recorded, no score, a loan not yet closed.

> ⚠️ **Watch out.** `credit_score = NULL` returns **0 rows, always**, with no error. Nothing is ever "equal" to unknown. Write `IS NULL`.

**Your turn.** Find the line that makes this query wrong.

```game
{"type": "bug", "id": "w01d2-g2", "title": "Find the bug", "q": "Madina wants the Tashkent customers with no recorded income. This query runs, returns 0 — and is wrong. Tap the line.", "code": "SELECT COUNT(*)\nFROM customers\nWHERE region = 'Tashkent'\n  AND monthly_income = NULL;", "answer": [3], "why": "= NULL is never true, so the count is 0 every time. Write AND monthly_income IS NULL."}
```

### AND, OR, NOT — combining conditions, with brackets

**Before you read.** Guess first, then play with it — the explanation below will make more sense.

```explore
{"id": "w01d2-x1", "type": "logic", "title": "The bracket trap, live", "predict": {"q": "With brackets, `product_id = 5 AND (status = 'approved' OR status = 'approved_not_disbursed')` finds **854** SME applications we said yes to. Take the brackets away — the same words, in the same order. Now it finds…", "options": ["854 — brackets only make it easier to read", "fewer than 854", "more than 854", "nothing: SQL refuses to run it"], "answer": 2, "why": "AND binds tighter than OR, so the database reads `(product_id = 5 AND status = 'approved') OR status = 'approved_not_disbursed'`: the not-disbursed approvals of **every** product slip in — 1 469 rows, and no error. The dots below show which ones."}, "products": ["MICRO", "CONS", "BNPL", "AUTO", "SME"], "statuses": ["approved", "approved_not_disbursed", "cancelled", "rejected"], "counts": [[2693, 222, 732, 1359], [2451, 225, 509, 1019], [1588, 127, 340, 716], [394, 41, 74, 156], [791, 63, 162, 338]], "conds": [{"sql": "product_id = 5", "p": 4}, {"sql": "status = 'approved'", "s": 0}, {"sql": "status = 'approved_not_disbursed'", "s": 1}], "per": 20, "start": {"not": [0, 0, 0], "op": ["AND", "OR"], "br": 0}, "challenges": [{"id": "c1", "text": "Fix it: Bekzod's question — SME applications we said yes to — exactly **854**.", "when": {"n": ["=", 854]}}, {"id": "c2", "text": "Write the database's own reading with brackets, `(A AND B) OR C`: the same **1 469**. The brackets only say out loud what AND does anyway.", "when": {"n": ["=", 1469], "br": ["=", 1]}}, {"id": "c3", "text": "Both kinds of yes for **every product except SME**: exactly **7 741**. One NOT does it — but where?", "when": {"n": ["=", 7741]}}, {"id": "c4", "text": "Make the query find **0** applications. (Can one row have two statuses?)", "when": {"n": ["=", 0]}}]}
```

**What it is.** **AND** keeps a row when **both** conditions are true. **OR** keeps it when **at least one** is true. **NOT** turns a condition around: `NOT IN`, `NOT LIKE`, `IS NOT NULL`, `NOT (…)`. **AND binds tighter than OR** — like multiplication before addition.

**How to write it.** SME applications that we said yes to:

```sql
SELECT COUNT(*) FROM applications
WHERE product_id = 5 AND (status = 'approved' OR status = 'approved_not_disbursed');
```

854 applications. Now the same words without the brackets:

```sql
SELECT COUNT(*) FROM applications
WHERE product_id = 5 AND status = 'approved' OR status = 'approved_not_disbursed';
```

1 469. The database read it as `(product_id = 5 AND status = 'approved') OR status = 'approved_not_disbursed'`, so every not-disbursed approval of **any** product slipped in. No error, wrong number.

```sql
SELECT COUNT(*) FROM loans WHERE status NOT IN ('closed', 'written_off');
```

3 396 loans are neither closed nor written off: 3 352 active + 44 in default.

**When you use it.** Every filter with more than one condition.

| You mean | Write |
|---|---|
| both must hold | `a AND b` |
| either may hold | `a OR b` |
| one condition AND a choice of two | `a AND (b OR c)` — brackets, always |
| not one of a list | `col NOT IN (…)` |

> ⚠️ **Watch out.** Whenever `AND` meets `OR` in one `WHERE`, add brackets. A wrong grouping is not an error — it is a different question that runs fine.

**Your turn.** How does the database read `WHERE a AND b OR c`?

```task
{"id": "w01d2-l10", "kind": "choice", "options": ["(a AND b) OR c", "a AND (b OR c)", "a, b and c must all be true", "It refuses to run without brackets"], "answer": 0, "explain": "AND binds tighter than OR, so a AND b is grouped first. If you mean a AND (b OR c), write the brackets."}
```

> 🎬 **Didn't get AND, OR, NOT?** [Baraa explains it · 11 min](https://youtu.be/SSKVgrwhzus?t=8234&end=8901)

### Text, numbers and dates in conditions

**What it is.** A value in a condition is written by its type. Each type has one rule and one trap.

| Type | How to write the value | The trap |
|---|---|---|
| **text** | in single quotes, spelled exactly as stored: `'active'` | in SQLite `=` is case-sensitive: `status = 'Active'` finds 0 rows |
| **number** | no quotes, no spaces: `200000000` | `200 000 000` is a syntax error |
| **date** | text `'YYYY-MM-DD'` in quotes: `'2026-09-01'` | a column with a **time** as well (`applied_at`) does not equal a plain date |

**How to write it.** `applied_at` holds a date and a time, such as `2025-06-02 10:35:00`:

```sql
SELECT COUNT(*) FROM applications WHERE applied_at = '2025-06-02';
-- 0: no row is exactly midnight
SELECT COUNT(*) FROM applications WHERE applied_at >= '2025-06-02' AND applied_at < '2025-06-03';
-- the whole day
```

14 applications were made on 2 June 2025. The first line finds 0, because `'2025-06-02 10:35:00'` is not equal to `'2025-06-02'`.

**When you use it.** For a period, write a **half-open range**: `>= first day AND < first day of the next period`. It works on dates with and without a time, in every engine. For a year: `applied_at >= '2025-01-01' AND applied_at < '2026-01-01'`.

> ⚠️ **Watch out.** `= NULL`, `'Active'` instead of `'active'`, and `BETWEEN` on a date-time column all run without an error and return a wrong number. Prefer `IS NULL`, exact spelling and half-open ranges by habit.

**Your turn.** Which filter keeps **every** application of 2025?

```task
{"id": "w01d2-l11", "kind": "choice", "options": ["applied_at >= '2025-01-01' AND applied_at < '2026-01-01'", "applied_at BETWEEN '2025-01-01' AND '2025-12-31'", "applied_at = '2025'", "applied_at LIKE 2025"], "answer": 0, "explain": "The half-open range keeps every moment of 31 December. BETWEEN … '2025-12-31' stops at midnight, so the applications made later that day fall out; = '2025' matches nothing."}
```

### Putting it together

Bekzod: *"The five biggest Auto or SME loans paid out in September 2026 that are still active."* Every clause from this section in one query:

```sql
SELECT loan_id      AS loan,
       product_id   AS product,
       principal    AS amount_uzs,
       -- SELECT + aliases
       disbursed_at AS paid_out_on
FROM loans                  -- FROM
WHERE product_id IN (4, 5)  -- IN
  -- a half-open date range
  AND disbursed_at >= '2026-09-01' AND disbursed_at < '2026-10-01'
  AND status = 'active'     -- =
-- ORDER BY
ORDER BY principal DESC
LIMIT 5;
-- LIMIT (SQL Server: TOP 5 after SELECT instead)
```

5 rows. Loan 6478, an SME loan of 588 780 000 paid out on 1 September, is the biggest. 51 loans pass the filter; `LIMIT` shows the top five.

Read it in the order the database runs it: **FROM** loans → **WHERE** keeps 51 rows → **SELECT** cuts four columns and renames them → **ORDER BY** sorts → **LIMIT** keeps five.

**Your turn.** Put the clauses in the order the database **runs** them.

```game
{"type": "order", "id": "w01d2-g6", "title": "The order the database runs a query", "items": ["FROM", "WHERE", "SELECT", "ORDER BY", "LIMIT"], "why": "The table first, then the filter, then the columns, then the sort, then the cut — which is why WHERE can use a column SELECT does not show."}
```

### Depth (optional)

- ▶ Baraa, *Query data (SELECT)* [0:34:01](https://youtu.be/SSKVgrwhzus?t=2041&end=5551) — 60 min, SELECT/DISTINCT/TOP/ORDER BY on his SalesDB; ▶ *Filtering data* [2:08:03](https://youtu.be/SSKVgrwhzus?t=7683&end=10077) — 40 min, every operator above.
- RU deck (TBC Data Analytics 2.0, if you have it) `2.1 SQL-1-46.pdf`, pages 1–46 (SELECT, WHERE, ORDER BY). *Russian terms:* запрос = query, выборка = selection/result set, условие = condition, сортировка = sorting, псевдоним = alias.

```videoquiz
{"video": "SSKVgrwhzus", "stops": [
  {"at": 2500, "q": "In this part, Baraa explains SELECT * and selecting only some columns. Which statement is true?", "options": ["SELECT * returns only the first column", "Listing column names returns only those columns, in the order you list them", "Column names after SELECT must be in alphabetical order", "Reports should always use SELECT *"], "answer": 1, "explain": "You choose the columns and their order; SELECT * is for looking at a table, not for a report.", "back": 60},
  {"at": 5000, "q": "In this part, Baraa explains DISTINCT, TOP and the order in which a query is run. Which statement is true?", "options": ["DISTINCT removes duplicate rows of the selected columns", "TOP 5 ignores ORDER BY and returns five random rows", "The database runs SELECT before FROM", "DISTINCT sorts the result by the first column"], "answer": 0, "explain": "DISTINCT keeps one row per different combination of the selected columns. TOP (LIMIT in SQLite) keeps the first N rows after ORDER BY; FROM and WHERE run before SELECT.", "back": 60},
  {"at": 8200, "q": "In this part, Baraa explains the comparison operators. Which statement is true?", "options": ["`= NULL` finds the empty cells", "`<>` and `!=` both mean 'not equal'", "`>` works only on text", "`<=` means strictly less than"], "answer": 1, "explain": "Both spellings of 'not equal' work. Empty cells need IS NULL, never = NULL.", "back": 60},
  {"at": 9500, "q": "In this part, Baraa explains BETWEEN, IN and LIKE. Which statement is true?", "options": ["BETWEEN 1 AND 5 leaves out 1 and 5", "IN ('Nukus', 'Termez') keeps rows equal to both values at once", "BETWEEN includes both ends, IN is a short list of ORs, and LIKE matches a pattern with % and _", "LIKE 'M%' finds values that end in M"], "answer": 2, "explain": "BETWEEN is inclusive; IN = several ORs on one column; in LIKE, % is any run of characters and _ exactly one.", "back": 75}]}
```

---

## 2. Worked example — Bekzod's first request

*"How many Micro loans did we pay out in September? And show me the five biggest."* Each step names the idea from Learn that it uses.

**Step 1 — translate the words into a table, columns and conditions (FROM, WHERE with `=`, a date range).** "Micro loans" → `loans` with `product_id = 1` (check in `products`: Micro loan is id 1). "Paid out in September" → `disbursed_at` in September 2026 (the data is as of 1 October 2026). "Five biggest" → `ORDER BY principal DESC`, first five.

**Step 2 — the rows first, the count second (SELECT columns, AND, BETWEEN, ORDER BY).** Always look at rows before you count them; a wrong filter is visible in rows and invisible in a number.

```sql
SELECT loan_id, principal, disbursed_at
FROM loans
WHERE product_id = 1
  AND disbursed_at BETWEEN '2026-09-01' AND '2026-09-30'
ORDER BY principal DESC;
```

123 rows. `disbursed_at` holds a date only, no time, so `BETWEEN` is safe here — unlike `applied_at`.

**Step 3 — count (COUNT(*) and an alias).** Replace the column list with `COUNT(*)` and name it:

```sql
SELECT COUNT(*) AS micro_loans_sep
FROM loans
WHERE product_id = 1
  AND disbursed_at BETWEEN '2026-09-01' AND '2026-09-30';     -- expect 123
```

**Step 4 — the five biggest (ORDER BY + LIMIT/TOP).** Add `LIMIT 5` to the step-2 query (`SELECT TOP 5 …` on SQL Server). The top loan is 2663: 4 950 000, paid out on 2 September. Bekzod gets 123 and a five-row table in 90 seconds, instead of a morning of scrolling.

### Lab — keep the answer in a table of your own

**What this is.** Bekzod likes the list and wants to keep it — and to add August. This lab is a **first touch** of the commands that save and change a table. You learn each one properly on **Day 3**; today, **💡 Show me** gives you the exact text, and the table below reads each one in a line. Your own tables start with `my_`.

| Step | 💡 Show me gives | Read it as |
|---|---|---|
| 1 | `CREATE TABLE my_micro AS SELECT …` | Run the query and save its rows as a new table `my_micro`. |
| 2 | `INSERT INTO my_micro SELECT …` | Run another query and add its rows to `my_micro` — same columns, same order. |
| 3 | `ALTER TABLE my_micro ADD COLUMN flag TEXT;` then `UPDATE my_micro SET flag = 'big' WHERE principal >= 4000000;` | Add an empty text column `flag`; then write 'big' into it on the rows of 4 000 000 or more. |
| 4 | `DELETE FROM my_micro WHERE principal < 1000000;` | Remove the rows under 1 000 000 — from your table, never from `loans`. |
| 5 | `CREATE TABLE my_micro_top AS SELECT * FROM my_micro ORDER BY principal DESC LIMIT 10;` | Save the ten biggest rows of `my_micro` as another table. |

```sqllab
{"id": "w01d2-lab", "title": "Bekzod's Micro list", "intro": "Save the worked example's rows into `my_micro`, then shape the table the way Bekzod asks. Use **💡 Show me** whenever a command is new.", "steps": [
  {"say": "Save September's Micro loans (`loan_id`, `principal`, `disbursed_at`) as a new table `my_micro`: put `CREATE TABLE my_micro AS` in front of the step-2 query, without its `ORDER BY`.", "hint": "CREATE TABLE my_micro AS\nSELECT loan_id, principal, disbursed_at\nFROM loans\nWHERE product_id = 1\n  AND disbursed_at BETWEEN '2026-09-01' AND '2026-09-30';", "expect": "SELECT COUNT(*) FROM my_micro", "want": 123},
  {"say": "Bekzod wants August too. Add August 2026's Micro loans to `my_micro` with `INSERT INTO my_micro SELECT …` (same three columns, in the same order).", "hint": "INSERT INTO my_micro\nSELECT loan_id, principal, disbursed_at\nFROM loans\nWHERE product_id = 1\n  AND disbursed_at BETWEEN '2026-08-01' AND '2026-08-31';", "expect": "SELECT COUNT(*) FROM my_micro", "want": 253},
  {"say": "Add a text column `flag` to `my_micro`, then set `flag = 'big'` on every loan of 4 000 000 or more.", "hint": "ALTER TABLE my_micro ADD COLUMN flag TEXT;\nUPDATE my_micro SET flag = 'big' WHERE principal >= 4000000;", "expect": "SELECT COUNT(*) FROM my_micro WHERE flag = 'big'", "want": 55},
  {"say": "Loans under 1 000 000 are too small for his report. Delete them from `my_micro` (from your table — never from `loans`).", "hint": "DELETE FROM my_micro WHERE principal < 1000000;", "expect": "SELECT COUNT(*) FROM my_micro", "want": 215},
  {"say": "Make him a short list: a table `my_micro_top` with the 10 biggest loans of `my_micro`.", "hint": "CREATE TABLE my_micro_top AS\nSELECT * FROM my_micro\nORDER BY principal DESC\nLIMIT 10;", "expect": "SELECT COUNT(*) FROM my_micro_top", "want": 10}],
 "cleanup": "DROP TABLE IF EXISTS my_micro_top; DROP TABLE IF EXISTS my_micro"}
```

---

## 3. Practice (60 min)

Write each query in the box under its question — it is saved in this browser. **▶ Run**, look at the rows, then count. **✔ Check** tells you whether your result matches the answer without showing it; then type the number your query gave into the box after the fold. Open the fold only after you have a number. The questions follow the order of Learn; the label in italics names the idea each one trains.

**P1.** *(SELECT and aliases)* List every branch: its `branch_name` as `branch` and its `region` (10 rows).

```task
{"id": "w01d2-l12", "kind": "sql", "model": "SELECT branch_name AS branch, region FROM branches;", "note": "Two columns from branches; the first one renamed with AS."}
```

**P2.** *(DISTINCT)* List the distinct values of `loans.status`. How many are there?

<details><summary>Answer</summary>

```sql
SELECT DISTINCT status FROM loans ORDER BY status;
```
Four: active, closed, default, written_off.

</details>

**P2.** How many different statuses did your query return?

```task
{"id": "w01d2-p1", "kind": "number", "answer": 4, "dp": 0, "unit": "statuses", "hint": "Count the rows of the DISTINCT result.", "model": "4: active, closed, default, written_off."}
```

**P3.** *(ORDER BY and LIMIT/TOP)* The five largest loans ever disbursed: loan id, principal, product id.

<details><summary>Answer</summary>

```sql
-- SQL Server
SELECT TOP 5 loan_id, principal, product_id FROM loans ORDER BY principal DESC;
-- SQLite
SELECT loan_id, principal, product_id FROM loans ORDER BY principal DESC LIMIT 5;
```
Loan 2861 with 599 060 000 on top, then 4570, 4601, 4970, 7520 — all product 5 (SME).

</details>

**P3.** Which loan id is at the top?

```task
{"id": "w01d2-p9", "kind": "number", "answer": 2861, "dp": 0, "hint": "Biggest first is DESC; then keep five rows.", "model": "Loan 2861, 599 060 000 — then 4570, 4601, 4970, 7520, all SME."}
```

**P4.** *(= and <>)* How many loans are *not* active? Check against the active count.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM loans WHERE status <> 'active';   -- expect 4476
SELECT COUNT(*) FROM loans WHERE status = 'active';    -- expect 3352
```
4 476 + 3 352 = 7 828.

</details>

**P4.** How many loans are not active?

```task
{"id": "w01d2-p6", "kind": "number", "answer": 4476, "dp": 0, "unit": "loans", "model": "4 476 not active + 3 352 active = 7 828."}
```

**P5.** *(> and a date range)* All Auto loans (product_id 4) with principal over 200 000 000 disbursed in 2026, biggest first. How many rows, and what is the biggest?

<details><summary>Answer</summary>

```sql
SELECT loan_id, principal, disbursed_at
FROM loans
WHERE product_id = 4 AND principal > 200000000
  AND disbursed_at >= '2026-01-01' AND disbursed_at < '2027-01-01'
ORDER BY principal DESC;
```
Expect 89 rows; the biggest is loan 7608, 396 210 000, disbursed 2026-05-26.

</details>

**P5.** How many rows?

```task
{"id": "w01d2-p2", "kind": "number", "answer": 89, "dp": 0, "unit": "loans", "hint": "Three conditions joined with AND: the product, the size, and a 2026 date range.", "model": "89 rows; the biggest is loan 7608, 396 210 000, disbursed 2026-05-26."}
```

**P6.** *(BETWEEN)* Loans with principal between 1 000 000 and 5 000 000 inclusive.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM loans WHERE principal BETWEEN 1000000 AND 5000000;
-- expect 3228
```
Same as `principal >= 1000000 AND principal <= 5000000`.

</details>

**P6.** How many loans?

```task
{"id": "w01d2-p8", "kind": "number", "answer": 3228, "dp": 0, "unit": "loans", "model": "3 228 — BETWEEN includes both ends."}
```

**P7.** *(IN and OR)* How many customers live in Nukus or Termez? Write it once with `OR`, once with `IN`.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM customers WHERE region = 'Nukus' OR region = 'Termez';
SELECT COUNT(*) FROM customers WHERE region IN ('Nukus', 'Termez');
```
Both expect 737.

</details>

**P7.** How many customers?

```task
{"id": "w01d2-p5", "kind": "number", "answer": 737, "dp": 0, "unit": "customers", "hint": "Got 0? A customer cannot live in both cities at once — that is OR, not AND.", "model": "737, with OR and with IN alike."}
```

**P8.** *(LIKE)* Customers whose first name starts with `M`. Then narrow to names starting with `Ma`.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM customers WHERE first_name LIKE 'M%';    -- expect 570
SELECT COUNT(*) FROM customers WHERE first_name LIKE 'Ma%';   -- expect 419
```
(Madina, Malika, Maftuna, Murod…). On SQLite `LIKE` ignores case by default for ASCII letters; on SQL Server it follows the collation — here both give the same.

</details>

**P8.** How many first names start with `Ma`?

```task
{"id": "w01d2-p7", "kind": "number", "answer": 419, "dp": 0, "unit": "customers", "hint": "% stands for any characters after the pattern: LIKE 'Ma%'.", "model": "419 (and 570 start with M)."}
```

**P9.** *(IS NULL)* Customers with an empty monthly income. Count them. Then count those with a filled income and check the two numbers add up to 6 040.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM customers WHERE monthly_income IS NULL;      -- expect 356
SELECT COUNT(*) FROM customers WHERE monthly_income IS NOT NULL;  -- expect 5684
```
356 + 5 684 = 6 040. If you wrote `= NULL` you got 0 — reread *IS NULL — the empty cell*.

</details>

**P9.** How many customers have an empty monthly income?

```task
{"id": "w01d2-p3", "kind": "number", "answer": 356, "dp": 0, "unit": "customers", "hint": "Got 0? Empty cells are found with IS NULL, not = NULL.", "model": "356 empty + 5 684 filled = 6 040."}
```

**P10.** *(= with AND, and NULLs in ORDER BY)* Applications that came through the app and were rejected, ordered by credit score from highest to lowest. How many, and what is the highest rejected score? Where did the rows with an empty score land?

<details><summary>Answer</summary>

```sql
SELECT application_id, credit_score, requested_amount
FROM applications
WHERE channel = 'app' AND status = 'rejected'
ORDER BY credit_score DESC;
```
Expect 1 359 rows; the top is application 10764 with score 821 (then 811, 806). 38 rows have `credit_score` NULL; both engines treat NULL as the smallest value, so with `DESC` they are at the bottom (with `ASC` they come first). A rejection at score 821 is odd — note it for Thursday.

</details>

**P10.** How many rows — rejected app applications?

```task
{"id": "w01d2-p4", "kind": "number", "answer": 1359, "dp": 0, "unit": "applications", "hint": "Two equalities joined with AND; ORDER BY does not change the count.", "model": "1 359; the top score is 821 (application 10764), and the 38 empty scores sit at the bottom with DESC."}
```

**P11.** *(AND, OR and brackets)* Approved SME applications (product_id 5) with a requested amount of at least 500 000 000. Count them. Then mix `AND` and `OR` deliberately — write `product_id = 5 AND requested_amount >= 500000000 OR status = 'approved'` — and see what happens.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM applications
WHERE product_id = 5 AND requested_amount >= 500000000 AND status = 'approved';
-- expect 128

SELECT COUNT(*) FROM applications
WHERE product_id = 5 AND requested_amount >= 500000000 OR status = 'approved';
-- expect 8010 (!)
```
The second counts *every* approved application of any product plus the big SME ones. 128 vs 8 010 — and no error message. Brackets whenever `AND` meets `OR`.

</details>

**P11.** How many approved SME applications of 500 000 000 or more — the right count?

```task
{"id": "w01d2-p10", "kind": "number", "answer": 128, "dp": 0, "unit": "applications", "hint": "Got 8 010? AND binds before OR — that query asks a different question.", "model": "128. Without care for AND/OR you get 8 010: every approved application of any product, plus the big SME ones."}
```

> 🚀 **Stretch (optional, +5 XP).** **P12.** *(text, numbers and dates together)* Customers born before 1960 with a monthly income above 30 000 000, richest first. How many, and who is first? Then write one sentence on whether this group looks plausible for a mass-market lender.

<details><summary>Answer</summary>

```sql
SELECT customer_id, first_name, last_name, birth_date, monthly_income
FROM customers
WHERE birth_date < '1960-01-01' AND monthly_income > 30000000
ORDER BY monthly_income DESC;
```
Expect 108 rows; first is Zafar Mirzaev (customer 3056), born 1958-12-02, income 59 867 394. Plausible as a small affluent/SME tail; what is *not* plausible is anyone born before 1920 or after today — see what you find on Thursday.

</details>

**P12.** How many customers — and is the group plausible? Write the count and your one sentence.

```task
{"id": "w01d2-p11", "kind": "free", "min": 12, "model": "108 customers; the first is Zafar Mirzaev (3056), born 1958-12-02, 59 867 394 a month. Plausible: a small tail of older affluent and SME clients in a book of 6 040. What would not be plausible is anyone born before 1920 or after today.", "rubric": ["Gives the count 108", "Names the first customer (Zafar Mirzaev, 3056)", "Judges plausibility with a reason, not just yes or no"]}
```

---

## 4. Homework <span class="badge hw">HW 1.2 — Due Day 4</span>

**HW 1.2 — Bekzod's ten questions:** ten checked queries, and what surprised you in the data.

```sqltask
{"check": "hw1.2", "lesson": "W1D2", "title": "HW 1.2 — Bekzod's 10 questions", "file": "bekzod.sql", "why": "This is the job: a manager's questions in plain words, turned into exact filters. Each answer is one query — and each wrong operator is a wrong number nobody notices.", "graded": ["Q1–Q10: the site checks each result (✔ Check) — all ten ✅", "WHERE uses the right operator: IS NULL, BETWEEN or a half-open date range, IN, parentheses where AND meets OR", "surprised.md names at least one real oddity, with the query that shows it"], "tasks": [{"id": "Q1", "q": "How many loans has Nur Finance ever disbursed?"}, {"id": "Q2", "q": "How many of them are Auto?"}, {"id": "Q3", "q": "How many SME loans have a term of 36 months?"}, {"id": "Q4", "q": "How many loans were disbursed in 2026?"}, {"id": "Q5", "q": "How many in September 2026 only?"}, {"id": "Q6", "q": "The ten smallest loans (loan id, product id, principal), smallest first."}, {"id": "Q7", "q": "How many loans have an annual rate of 0 (which product is that)?"}, {"id": "Q8", "q": "How many customers are in the sme segment outside Tashkent?"}, {"id": "Q9", "q": "How many applications requested more than 500 000 000?"}, {"id": "Q10", "q": "The applications with the five highest credit scores that were nevertheless rejected (any channel)."}, {"id": "Surprised", "file": "surprised.md", "text": true, "minLines": 5, "q": "What surprised you in the data (5–10 lines): a value you did not expect, a column that behaved strangely, a count that did not add up — with the query that shows it."}]}
```

---

## 5. Self-check

```check
{"id": "w01d2-sc", "questions": [
  {"type": "single", "q": "Why does WHERE monthly_income = NULL return nothing?", "options": ["Because no customer has an empty income", "Because NULL is not a value: = NULL is never true, so empty cells need IS NULL", "Because NULL must be written in quotes", "Because the column is a number"], "answer": 1, "explain": "356 customers have an empty income; only IS NULL finds them (→ section 1, IS NULL — the empty cell)."},
  {"type": "single", "q": "WHERE a AND b OR c — which conditions does the database group first?", "options": ["b OR c", "a AND b", "It reads them strictly left to right as a, then b, then c, all required", "It refuses to run"], "answer": 1, "explain": "AND binds tighter than OR, like multiplication before addition: (a AND b) OR c (→ section 1, AND, OR, NOT)."},
  {"type": "single", "q": "Why is applied_at BETWEEN '2025-01-01' AND '2025-12-31' wrong for 'applications in 2025'?", "options": ["BETWEEN leaves out both end dates", "applied_at also holds a time, so applications on 31 December after 00:00 fall outside", "Dates must be written as 31.12.2025", "BETWEEN works only on numbers"], "answer": 1, "explain": "'2025-12-31 10:35:00' is after '2025-12-31'; use >= '2025-01-01' AND < '2026-01-01' (→ section 1, Text, numbers and dates)."}
]}
```

---

## 6. Company corner <span class="badge company">Approval rate</span>

**Definition.** The approval rate (*уровень одобрения*) is the share of loan applications the company said *yes* to:

> **approval rate = approved applications ÷ applications decided**

It is the first number a risk manager looks at after a change in scoring rules, and the first number a sales manager complains about. Two queries, and a division by hand (next week `GROUP BY` and `CASE` do the division for you):

```sql
SELECT COUNT(*) FROM applications;
-- expect 14000
SELECT COUNT(*) FROM applications WHERE status IN ('approved', 'approved_not_disbursed');
-- expect 8595
```

8 595 / 14 000 = **61.4 %**. `approved_not_disbursed` counts as approved: the company *said yes*; the customer walked away. Approval is about our decision, not the customer's.

**The trap — cancelled applications.** Run one more:

```sql
SELECT COUNT(*) FROM applications WHERE status = 'cancelled';   -- expect 1817
```

1 817 applications were withdrawn by the customer before (or without) a decision. Do they belong in the denominator?

| Convention | Denominator | Nur Finance today | Who prefers it |
|---|---|---|---|
| **A. All applications** | every application received | 8 595 / 14 000 = **61.4 %** | Marketing / product: "of everyone who asked, how many got money?" (it is really a funnel conversion) |
| **B. Decided applications** | approved + rejected only (cancelled excluded) | 8 595 / 12 183 = **70.5 %** | Risk: "of the cases *we* decided, how often did we say yes?" — cancellations are not our decision |

> ⚠️ **Watch out.** Nine points of difference from one word. Neither convention is wrong; what is wrong is comparing a 61 % from one report with a 70 % from another and announcing a "jump in approvals". When you quote an approval rate, say which convention — and if the target company has its own definition, use theirs (the glossary will record it).

```game
{"type": "sort", "id": "w01d2-g3", "title": "Convention B: where does each status go?", "q": "Put each application status where it belongs in the decided-applications approval rate.", "groups": {"Approved: top and bottom of the fraction": ["approved", "approved_not_disbursed"], "Bottom of the fraction only": ["rejected"], "Left out completely": ["cancelled"]}}
```

A third variant you will meet: **disbursed-only**, counting `approved` but not `approved_not_disbursed` (7 917 / 14 000 = 56.6 %). Some teams call this the *take-up* or *conversion to disbursement*; do not let it be called approval rate.

Tomorrow: how the tables were designed, and why the loans spreadsheet had to be split.

> 🎯 **Interview version.** *"How would you calculate approval rate, and what could make two teams report different numbers?"* — Give the formula, then the two denominators (cancelled in or out), then disbursed vs approved. Bonus: mention that approval rate by channel differs (the app channel here approves fewer because scoring is stricter without a branch officer).

**Say it like in an interview.** Write your answer the way you would say it — 30 words or more — then compare it with the model.

```task
{"id": "w01d2-iv", "kind": "free", "min": 30, "model": "Approval rate is approved applications divided by applications. The catch is the denominator: if you include cancelled applications you get 61.4 % at Nur Finance; if you count only the ones we decided — approved plus rejected — you get 70.5 %. Approved-but-not-disbursed still counts as approved, because it was our yes; counting only disbursed loans gives 56.6 %, which is take-up, not approval. So two teams differ when one includes cancellations or counts disbursements — I always state the convention next to the number. The rate also differs by channel.", "rubric": ["States the formula: approved ÷ applications", "Explains the denominator choice: cancelled in or out", "Separates approved from disbursed, and says to name the convention when quoting"]}
```

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w01d2", "pass": 0.8, "questions": [
  {"type": "single", "q": "What does this query return on the Nur Finance data?", "code": "SELECT COUNT(*) FROM customers\nWHERE monthly_income = NULL;", "options": ["The number of customers with an empty income", "0, always", "An error message", "Every customer"], "answer": 1, "explain": "NULL is not a value, so = NULL is never true; empty cells are found with IS NULL (→ section 1, IS NULL — the empty cell)."},
  {"type": "single", "q": "How does the database read this WHERE clause?", "code": "WHERE product_id = 5 AND status = 'approved'\n   OR status = 'approved_not_disbursed'", "options": ["product_id = 5 AND (status = 'approved' OR status = 'approved_not_disbursed')", "(product_id = 5 AND status = 'approved') OR status = 'approved_not_disbursed'", "It refuses to run without parentheses", "It ignores the OR line"], "answer": 1, "explain": "AND binds tighter than OR, so every approved_not_disbursed application of any product slips in, with no warning (→ section 1, AND, OR, NOT; P11)."},
  {"type": "single", "q": "Why is this filter wrong for 'applications made in 2025'?", "code": "WHERE applied_at BETWEEN '2025-01-01' AND '2025-12-31'", "options": ["BETWEEN excludes both end dates", "applied_at holds a date and a time, so applications on 31 December after midnight are dropped", "Dates must be written as 01.01.2025", "BETWEEN only works on numbers"], "answer": 1, "explain": "'2025-12-31 10:35:00' is after '2025-12-31'; use >= '2025-01-01' AND < '2026-01-01' (→ section 1, Text, numbers and dates)."},
  {"type": "multi", "q": "Which WHERE clauses return the customers who live in Nukus or Termez?", "options": ["WHERE region IN ('Nukus', 'Termez')", "WHERE region = 'Nukus' OR region = 'Termez'", "WHERE region = 'Nukus' AND region = 'Termez'", "WHERE region BETWEEN 'Nukus' AND 'Termez'", "WHERE region LIKE 'Nukus, Termez'"], "answer": [0, 1], "explain": "IN is a short OR; AND asks for a row that is in both cities at once and returns nothing (→ P7)."},
  {"type": "single", "q": "108 rejected applications have an empty credit_score. Where do they appear in this result?", "code": "SELECT application_id, credit_score\nFROM applications\nWHERE status = 'rejected'\nORDER BY credit_score DESC;", "options": ["At the top", "At the bottom", "They are left out of the result", "Wherever they were stored"], "answer": 1, "explain": "Both engines treat NULL as the smallest value, so DESC puts it last and ASC puts it first (→ P10)."},
  {"type": "single", "q": "You work in SQLite. Which query gives the five biggest loans?", "options": ["SELECT TOP 5 loan_id, principal FROM loans ORDER BY principal DESC;", "SELECT loan_id, principal FROM loans ORDER BY principal DESC LIMIT 5;", "SELECT loan_id, principal FROM loans ORDER BY principal LIMIT 5;", "SELECT loan_id, principal FROM loans LIMIT 5 ORDER BY principal DESC;"], "answer": 1, "explain": "TOP is SQL Server; SQLite puts LIMIT at the very end, and without DESC you get the smallest five (→ section 1, LIMIT and TOP)."},
  {"type": "single", "q": "A customer was approved but walked away without taking the money (status approved_not_disbursed). For the approval rate, this application counts as…", "options": ["approved — the company said yes", "rejected", "cancelled", "not counted anywhere"], "answer": 0, "explain": "Approval is about our decision, not the customer's (→ section 6, Company corner)."},
  {"type": "number", "q": "Approval rate, convention B (cancelled left out of the denominator): 8 595 approved, 14 000 applications, 1 817 cancelled. Answer in %, one decimal.", "answer": 70.5, "tol": 0.1, "explain": "8 595 / (14 000 − 1 817) = 8 595 / 12 183 ≈ 70.5 %, versus 61.4 % with all applications; always say which convention (→ section 6, Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w01d2", "q": "Nilufar (risk) wants the partner channel's approval rate for applications submitted in calendar year 2025, on the decided convention: cancelled applications are left out of the denominator, and approved_not_disbursed counts as approved. Give it as a percentage to 1 decimal.", "type": "number", "dp": 1, "sql": true, "h": ["d037e48df4cd8f8d9f5bb417"], "hint": "Look at what applied_at holds before you write the year filter, and decide which statuses belong in the denominator.", "sol": "U0VMRUNUIENPVU5UKCopIEZST00gYXBwbGljYXRpb25zCldIRVJFIGNoYW5uZWwgPSAncGFydG5lcicgQU5EIGFwcGxpZWRfYXQgPj0gJzIwMjUtMDEtMDEnIEFORCBhcHBsaWVkX2F0IDwgJzIwMjYtMDEtMDEnCiAgQU5EIHN0YXR1cyBJTiAoJ2FwcHJvdmVkJywgJ2FwcHJvdmVkX25vdF9kaXNidXJzZWQnKTsgICAgICAgICAgICAgICAtLSA2ODMKU0VMRUNUIENPVU5UKCopIEZST00gYXBwbGljYXRpb25zCldIRVJFIGNoYW5uZWwgPSAncGFydG5lcicgQU5EIGFwcGxpZWRfYXQgPj0gJzIwMjUtMDEtMDEnIEFORCBhcHBsaWVkX2F0IDwgJzIwMjYtMDEtMDEnCiAgQU5EIHN0YXR1cyBJTiAoJ2FwcHJvdmVkJywgJ2FwcHJvdmVkX25vdF9kaXNidXJzZWQnLCAncmVqZWN0ZWQnKTsgICAtLSA5NzUKKFRoZSBzYW1lIHRleHQgcnVucyBvbiBTUUxpdGUgYW5kIFNRTCBTZXJ2ZXIuKQo2ODMgLyA5NzUgPSA3MC4xICUuCldpdGggYWxsIDEgMTA4IHBhcnRuZXIgYXBwbGljYXRpb25zIG9mIDIwMjUgaW4gdGhlIGRlbm9taW5hdG9yIHlvdSB3b3VsZCBnZXQgNjEuNiAlIOKAlCB0aGUgY2FuY2VsbGVkLWFwcGxpY2F0aW9ucyB0cmFwIGZyb20gdGhlIENvbXBhbnkgY29ybmVyLiBUaGUgaGFsZi1vcGVuIGRhdGUgZmlsdGVyIGtlZXBzIHRoZSBldmVuaW5nIGFwcGxpY2F0aW9ucyBvZiAzMSBEZWNlbWJlciB0aGF0IEJFVFdFRU4g4oCmICcyMDI1LTEyLTMxJyBkcm9wcy4gV2hlbmV2ZXIgeW91IHF1b3RlIHRoZSA3MC4xLCBzYXkgImRlY2lkZWQgY29udmVudGlvbiIgbmV4dCB0byBpdC4="}
```

<!-- challenge:end -->
