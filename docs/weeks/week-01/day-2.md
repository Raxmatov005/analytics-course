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

Yesterday you ran ready-made queries; today you write them. Every query you write this week has this skeleton. The order of the words is fixed; the database runs them in a different order (FROM → WHERE → SELECT → ORDER BY), which is why you can filter on a column you do not display.

```sql
SELECT   column1, column2        -- which columns (or * for all)
FROM     table_name              -- which table
WHERE    condition               -- which rows (optional)
ORDER BY column1 DESC;           -- in what order (optional)
```

> 💡 **Key idea.** You *write* SELECT → FROM → WHERE → ORDER BY; the database *runs* FROM → WHERE → SELECT → ORDER BY. It first picks the table, then keeps the rows that pass the filter, then cuts out your columns, then sorts.

Try it now — press **▶ Run** under the query:

```sql
SELECT loan_id, principal, disbursed_at, status
FROM loans;
```

7 828 rows: the loans table you looked at yesterday, but *you* chose the four columns. `SELECT *` gives every column — fine for looking, bad in a report.

```game
{"type": "cloze", "id": "w01d2-g1", "title": "Bekzod's Auto loans, biggest first: fill the skeleton", "text": "SELECT {{0}} FROM {{1}} WHERE {{2}} ORDER BY {{3}};", "blanks": [["loan_id, principal"], ["loans"], ["product_id = 4"], ["principal DESC"]], "distractors": ["customers", "principal = NULL", "GROUP BY product_id"]}
```

### Aliases, DISTINCT, and the first N rows

```sql
SELECT principal AS amount_uzs, disbursed_at AS paid_out_on   -- rename columns (alias, псевдоним)
FROM loans;

SELECT DISTINCT channel FROM applications;      -- one row per different value
```

`DISTINCT` removes duplicate rows of the *selected columns*. Run the second query: three rows — `app`, `branch`, `partner`. This is the fastest way to learn what a column contains.

The first N rows is the one place where SQL Server and SQLite spell things differently. The pages always show both:

```sql
-- SQL Server
SELECT TOP 5 loan_id, principal FROM loans ORDER BY principal DESC;
-- SQLite / PostgreSQL / MySQL
SELECT loan_id, principal FROM loans ORDER BY principal DESC LIMIT 5;
```

`ORDER BY principal DESC` = biggest first; `ASC` (the default) = smallest first. You can sort by several columns: `ORDER BY region, principal DESC`.

### WHERE — the seven operators

| Operator | Example | Reads as |
|---|---|---|
| `=` | `status = 'active'` | exactly equal (text in single quotes) |
| `<>` (also `!=`) | `status <> 'active'` | not equal |
| `>`, `>=`, `<`, `<=` | `principal > 200000000` | compare numbers or dates |
| `BETWEEN a AND b` | `principal BETWEEN 1000000 AND 5000000` | inclusive on both ends |
| `IN (…)` | `region IN ('Nukus', 'Termez')` | equals any of the list |
| `LIKE` | `first_name LIKE 'M%'` | pattern: `%` = any characters, `_` = exactly one |
| `IS NULL` / `IS NOT NULL` | `monthly_income IS NULL` | the cell is empty |

Combine with `AND`, `OR`, `NOT`. **`AND` binds tighter than `OR`** — exactly like multiplication before addition — so when you mix them, put parentheses:

```sql
WHERE product_id = 5 AND (status = 'approved' OR status = 'approved_not_disbursed')
```

Without the parentheses the database reads `(product_id = 5 AND status = 'approved') OR status = 'approved_not_disbursed'` — a different question, and it will not warn you. P10 shows how far off you land.

> ⚠️ **Watch out.** Whenever `AND` meets `OR` in one `WHERE`, add parentheses. A wrong grouping is not an error — it is a different question that runs fine and returns the wrong number.

### Three things that bite beginners

1. **NULL is not a value.** `monthly_income = NULL` returns zero rows, always. Empty cells are found with `IS NULL`. (*NULL = пустое значение, "неизвестно"*.)
2. **Text comparison.** In SQLite `status = 'Active'` finds nothing (case matters). In SQL Server with the default collation it finds `active` too. Write values exactly as they are stored and you are safe in both.
3. **Dates are compared as text in SQLite** (`'2026-09-01'`) and as real dates in SQL Server — but the *same* `YYYY-MM-DD` literal works in both. For "in year 2026" prefer a range to a function:

```sql
WHERE disbursed_at >= '2026-01-01' AND disbursed_at < '2027-01-01'   -- both engines
-- alternatives:  SQL Server: YEAR(disbursed_at) = 2026   ·   SQLite: strftime('%Y', disbursed_at) = '2026'
```

Careful with `applied_at`: it holds a date *and a time* (`2025-06-02 10:35:00`), so `applied_at BETWEEN '2025-01-01' AND '2025-12-31'` silently drops every application made on 31 December after midnight. Use `>= '2025-01-01' AND < '2026-01-01'`.

> 💡 **Key idea.** Two of these three give a wrong answer *without an error*: `= NULL` (always zero rows) and `BETWEEN` on a date-time column (drops the last day). Prefer `IS NULL` and half-open ranges `>= start AND < next_start` by habit.

```game
{"type": "bug", "id": "w01d2-g2", "title": "Find the bug", "q": "Madina wants the Tashkent customers with no recorded income. This query runs, returns 0 — and is wrong. Tap the line.", "code": "SELECT COUNT(*)\nFROM customers\nWHERE region = 'Tashkent'\n  AND monthly_income = NULL;", "answer": [3], "why": "= NULL is never true, so the count is 0 every time. Write AND monthly_income IS NULL."}
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

*"How many Micro loans did we pay out in September? And show me the five biggest."*

**Step 1 — translate the words into table and columns.** "Micro loans" → `loans` with `product_id = 1` (check in `products`: Micro loan is id 1). "Paid out in September" → `disbursed_at` in September 2026 (the data is as of 1 October 2026). "Five biggest" → `ORDER BY principal DESC`, first five.

**Step 2 — the rows first, the count second.** Always look at rows before you count them; a wrong filter is visible in rows and invisible in a number.

```sql
SELECT loan_id, principal, disbursed_at
FROM loans
WHERE product_id = 1
  AND disbursed_at BETWEEN '2026-09-01' AND '2026-09-30'
ORDER BY principal DESC;
```

(`disbursed_at` holds a date only, no time, so `BETWEEN` is safe here — unlike `applied_at`.)

**Step 3 — count.** Replace the column list with `COUNT(*)` (today's one aggregate; the rest come in week 2):

```sql
SELECT COUNT(*) AS micro_loans_sep
FROM loans
WHERE product_id = 1
  AND disbursed_at BETWEEN '2026-09-01' AND '2026-09-30';     -- expect 123
```

**Step 4 — the five biggest.** `SELECT TOP 5 …` / `… LIMIT 5` on the step-2 query. Bekzod gets 123 and a five-row table in 90 seconds, instead of a morning of scrolling.

### Lab — keep the answer in a table of your own

Bekzod likes the list and wants to keep it — and to add August. A query's result can be saved as a new table with `CREATE TABLE name AS SELECT …`; after that, it is a table like any other: you can add rows, add a column, delete rows. Remember the rule from yesterday: your own tables start with `my_`.

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

Write each query in the box under its question — it is saved in this browser. **▶ Run**, look at the rows, then count. **✔ Check** tells you whether your result matches the answer without showing it; then type the number your query gave into the box after the fold. Open the fold only after you have a number.

**P1.** List the distinct values of `loans.status`. How many are there?

<details><summary>Answer</summary>

```sql
SELECT DISTINCT status FROM loans ORDER BY status;
```
Four: active, closed, default, written_off.

</details>

**P1.** How many different statuses did your query return?

```task
{"id": "w01d2-p1", "kind": "number", "answer": 4, "dp": 0, "unit": "statuses", "hint": "Count the rows of the DISTINCT result.", "model": "4: active, closed, default, written_off."}
```

**P2.** All Auto loans (product_id 4) with principal over 200 000 000 disbursed in 2026, biggest first. How many rows, and what is the biggest?

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

**P2.** How many rows?

```task
{"id": "w01d2-p2", "kind": "number", "answer": 89, "dp": 0, "unit": "loans", "hint": "Three conditions joined with AND: the product, the size, and a 2026 date range.", "model": "89 rows; the biggest is loan 7608, 396 210 000, disbursed 2026-05-26."}
```

**P3.** Customers with an empty monthly income. Count them. Then count those with a filled income and check the two numbers add up to 6 040.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM customers WHERE monthly_income IS NULL;      -- expect 356
SELECT COUNT(*) FROM customers WHERE monthly_income IS NOT NULL;  -- expect 5684
```
356 + 5 684 = 6 040. If you wrote `= NULL` you got 0 — reread "Three things that bite".

</details>

**P3.** How many customers have an empty monthly income?

```task
{"id": "w01d2-p3", "kind": "number", "answer": 356, "dp": 0, "unit": "customers", "hint": "Got 0? Empty cells are found with IS NULL, not = NULL.", "model": "356 empty + 5 684 filled = 6 040."}
```

**P4.** Applications that came through the app and were rejected, ordered by credit score from highest to lowest. How many, and what is the highest rejected score? Where did the rows with an empty score land?

<details><summary>Answer</summary>

```sql
SELECT application_id, credit_score, requested_amount
FROM applications
WHERE channel = 'app' AND status = 'rejected'
ORDER BY credit_score DESC;
```
Expect 1 359 rows; the top is application 10764 with score 821 (then 811, 806). 38 rows have `credit_score` NULL; both engines treat NULL as the smallest value, so with `DESC` they are at the bottom (with `ASC` they come first). A rejection at score 821 is odd — note it for Thursday.

</details>

**P4.** How many rows — rejected app applications?

```task
{"id": "w01d2-p4", "kind": "number", "answer": 1359, "dp": 0, "unit": "applications", "hint": "Two equalities joined with AND; ORDER BY does not change the count.", "model": "1 359; the top score is 821 (application 10764), and the 38 empty scores sit at the bottom with DESC."}
```

**P5.** How many customers live in Nukus or Termez? Write it once with `OR`, once with `IN`.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM customers WHERE region = 'Nukus' OR region = 'Termez';
SELECT COUNT(*) FROM customers WHERE region IN ('Nukus', 'Termez');
```
Both expect 737.

</details>

**P5.** How many customers?

```task
{"id": "w01d2-p5", "kind": "number", "answer": 737, "dp": 0, "unit": "customers", "hint": "Got 0? A customer cannot live in both cities at once — that is OR, not AND.", "model": "737, with OR and with IN alike."}
```

**P6.** How many loans are *not* active? Check against the active count.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM loans WHERE status <> 'active';   -- expect 4476
SELECT COUNT(*) FROM loans WHERE status = 'active';    -- expect 3352
```
4 476 + 3 352 = 7 828.

</details>

**P6.** How many loans are not active?

```task
{"id": "w01d2-p6", "kind": "number", "answer": 4476, "dp": 0, "unit": "loans", "model": "4 476 not active + 3 352 active = 7 828."}
```

**P7.** Customers whose first name starts with `M`. Then narrow to names starting with `Ma`.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM customers WHERE first_name LIKE 'M%';    -- expect 570
SELECT COUNT(*) FROM customers WHERE first_name LIKE 'Ma%';   -- expect 419
```
(Madina, Malika, Maftuna, Murod…). On SQLite `LIKE` ignores case by default for ASCII letters; on SQL Server it follows the collation — here both give the same.

</details>

**P7.** How many first names start with `Ma`?

```task
{"id": "w01d2-p7", "kind": "number", "answer": 419, "dp": 0, "unit": "customers", "hint": "% stands for any characters after the pattern: LIKE 'Ma%'.", "model": "419 (and 570 start with M)."}
```

**P8.** Loans with principal between 1 000 000 and 5 000 000 inclusive.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM loans WHERE principal BETWEEN 1000000 AND 5000000;   -- expect 3228
```
Same as `principal >= 1000000 AND principal <= 5000000`.

</details>

**P8.** How many loans?

```task
{"id": "w01d2-p8", "kind": "number", "answer": 3228, "dp": 0, "unit": "loans", "model": "3 228 — BETWEEN includes both ends."}
```

**P9.** The five largest loans ever disbursed: loan id, principal, product id.

<details><summary>Answer</summary>

```sql
-- SQL Server
SELECT TOP 5 loan_id, principal, product_id FROM loans ORDER BY principal DESC;
-- SQLite
SELECT loan_id, principal, product_id FROM loans ORDER BY principal DESC LIMIT 5;
```
Loan 2861 with 599 060 000 on top, then 4570, 4601, 4970, 7520 — all product 5 (SME).

</details>

**P9.** Which loan id is at the top?

```task
{"id": "w01d2-p9", "kind": "number", "answer": 2861, "dp": 0, "hint": "Biggest first is DESC; then keep five rows.", "model": "Loan 2861, 599 060 000 — then 4570, 4601, 4970, 7520, all SME."}
```

**P10.** Approved SME applications (product_id 5) with a requested amount of at least 500 000 000. Count them. Then remove the parentheses/AND-OR care deliberately — write `product_id = 5 AND requested_amount >= 500000000 OR status = 'approved'` — and see what happens.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM applications
WHERE product_id = 5 AND requested_amount >= 500000000 AND status = 'approved';   -- expect 128

SELECT COUNT(*) FROM applications
WHERE product_id = 5 AND requested_amount >= 500000000 OR status = 'approved';    -- expect 8010 (!)
```
The second counts *every* approved application of any product plus the big SME ones. 128 vs 8 010 — and no error message. Parentheses whenever `AND` meets `OR`.

</details>

**P10.** How many approved SME applications of 500 000 000 or more — the right count?

```task
{"id": "w01d2-p10", "kind": "number", "answer": 128, "dp": 0, "unit": "applications", "hint": "Got 8 010? AND binds before OR — that query asks a different question.", "model": "128. Without care for AND/OR you get 8 010: every approved application of any product, plus the big SME ones."}
```

> 🚀 **Stretch (optional, +5 XP).** **P11.** Customers born before 1960 with a monthly income above 30 000 000, richest first. How many, and who is first? Then write one sentence on whether this group looks plausible for a mass-market lender.

<details><summary>Answer</summary>

```sql
SELECT customer_id, first_name, last_name, birth_date, monthly_income
FROM customers
WHERE birth_date < '1960-01-01' AND monthly_income > 30000000
ORDER BY monthly_income DESC;
```
Expect 108 rows; first is Zafar Mirzaev (customer 3056), born 1958-12-02, income 59 867 394. Plausible as a small affluent/SME tail; what is *not* plausible is anyone born before 1920 or after today — see what you find on Thursday.

</details>

**P11.** How many customers — and is the group plausible? Write the count and your one sentence.

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
  {"type": "single", "q": "Why does WHERE monthly_income = NULL return nothing?", "options": ["Because no customer has an empty income", "Because NULL is not a value: = NULL is never true, so empty cells need IS NULL", "Because NULL must be written in quotes", "Because the column is a number"], "answer": 1, "explain": "356 customers have an empty income; only IS NULL finds them (→ section 1, Three things that bite)."},
  {"type": "single", "q": "WHERE a AND b OR c — which conditions does the database group first?", "options": ["b OR c", "a AND b", "It reads them strictly left to right as a, then b, then c, all required", "It refuses to run"], "answer": 1, "explain": "AND binds tighter than OR, like multiplication before addition: (a AND b) OR c (→ section 1, WHERE — the seven operators)."},
  {"type": "single", "q": "Why is applied_at BETWEEN '2025-01-01' AND '2025-12-31' wrong for 'applications in 2025'?", "options": ["BETWEEN leaves out both end dates", "applied_at also holds a time, so applications on 31 December after 00:00 fall outside", "Dates must be written as 31.12.2025", "BETWEEN works only on numbers"], "answer": 1, "explain": "'2025-12-31 10:35:00' is after '2025-12-31'; use >= '2025-01-01' AND < '2026-01-01' (→ section 1, Three things that bite, point 3)."}
]}
```

---

## 6. Company corner <span class="badge company">Approval rate</span>

**Definition.** The approval rate (*уровень одобрения*) is the share of loan applications the company said *yes* to:

> **approval rate = approved applications ÷ applications decided**

It is the first number a risk manager looks at after a change in scoring rules, and the first number a sales manager complains about. Two queries, and a division by hand (next week `GROUP BY` and `CASE` do the division for you):

```sql
SELECT COUNT(*) FROM applications;                                                    -- expect 14000
SELECT COUNT(*) FROM applications WHERE status IN ('approved', 'approved_not_disbursed'); -- expect 8595
```

8 595 / 14 000 = **61.4 %**. Notice that `approved_not_disbursed` counts as approved: the company *said yes*; the customer walked away. Approval is about our decision, not the customer's.

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
  {"type": "single", "q": "What does this query return on the Nur Finance data?", "code": "SELECT COUNT(*) FROM customers\nWHERE monthly_income = NULL;", "options": ["The number of customers with an empty income", "0, always", "An error message", "Every customer"], "answer": 1, "explain": "NULL is not a value, so = NULL is never true; empty cells are found with IS NULL (→ section 1, Three things that bite)."},
  {"type": "single", "q": "How does the database read this WHERE clause?", "code": "WHERE product_id = 5 AND status = 'approved'\n   OR status = 'approved_not_disbursed'", "options": ["product_id = 5 AND (status = 'approved' OR status = 'approved_not_disbursed')", "(product_id = 5 AND status = 'approved') OR status = 'approved_not_disbursed'", "It refuses to run without parentheses", "It ignores the OR line"], "answer": 1, "explain": "AND binds tighter than OR, so every approved_not_disbursed application of any product slips in, with no warning (→ section 1, P10)."},
  {"type": "single", "q": "Why is this filter wrong for 'applications made in 2025'?", "code": "WHERE applied_at BETWEEN '2025-01-01' AND '2025-12-31'", "options": ["BETWEEN excludes both end dates", "applied_at holds a date and a time, so applications on 31 December after midnight are dropped", "Dates must be written as 01.01.2025", "BETWEEN only works on numbers"], "answer": 1, "explain": "'2025-12-31 10:35:00' is after '2025-12-31'; use >= '2025-01-01' AND < '2026-01-01' (→ section 1, Three things that bite, point 3)."},
  {"type": "multi", "q": "Which WHERE clauses return the customers who live in Nukus or Termez?", "options": ["WHERE region IN ('Nukus', 'Termez')", "WHERE region = 'Nukus' OR region = 'Termez'", "WHERE region = 'Nukus' AND region = 'Termez'", "WHERE region BETWEEN 'Nukus' AND 'Termez'", "WHERE region LIKE 'Nukus, Termez'"], "answer": [0, 1], "explain": "IN is a short OR; AND asks for a row that is in both cities at once and returns nothing (→ P5)."},
  {"type": "single", "q": "108 rejected applications have an empty credit_score. Where do they appear in this result?", "code": "SELECT application_id, credit_score\nFROM applications\nWHERE status = 'rejected'\nORDER BY credit_score DESC;", "options": ["At the top", "At the bottom", "They are left out of the result", "Wherever they were stored"], "answer": 1, "explain": "Both engines treat NULL as the smallest value, so DESC puts it last and ASC puts it first (→ P4)."},
  {"type": "single", "q": "You work in SQLite. Which query gives the five biggest loans?", "options": ["SELECT TOP 5 loan_id, principal FROM loans ORDER BY principal DESC;", "SELECT loan_id, principal FROM loans ORDER BY principal DESC LIMIT 5;", "SELECT loan_id, principal FROM loans ORDER BY principal LIMIT 5;", "SELECT loan_id, principal FROM loans LIMIT 5 ORDER BY principal DESC;"], "answer": 1, "explain": "TOP is SQL Server; SQLite puts LIMIT at the very end, and without DESC you get the smallest five (→ section 1, Aliases, DISTINCT, and the first N rows)."},
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
