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

Every query you write this week has this skeleton. The order of the words is fixed; the database runs them in a different order (FROM → WHERE → SELECT → ORDER BY), which is why you can filter on a column you do not display.

```sql
SELECT   column1, column2        -- which columns (or * for all)
FROM     table_name              -- which table
WHERE    condition               -- which rows (optional)
ORDER BY column1 DESC;           -- in what order (optional)
```

Try it now (DB Browser: tab *Execute SQL*; SSMS: *New Query*, make sure the database `nur` is selected in the dropdown):

```sql
SELECT loan_id, principal, disbursed_at, status
FROM loans;
```

7 828 rows. The grid you scrolled yesterday, but *you* chose the four columns. `SELECT *` gives every column — fine for looking, bad in a report.

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

### Three things that bite beginners

1. **NULL is not a value.** `monthly_income = NULL` returns zero rows, always. Empty cells are found with `IS NULL`. (*NULL = пустое значение, "неизвестно"*.)
2. **Text comparison.** In SQLite `status = 'Active'` finds nothing (case matters). In SQL Server with the default collation it finds `active` too. Write values exactly as they are stored and you are safe in both.
3. **Dates are compared as text in SQLite** (`'2026-09-01'`) and as real dates in SQL Server — but the *same* `YYYY-MM-DD` literal works in both. For "in year 2026" prefer a range to a function:

```sql
WHERE disbursed_at >= '2026-01-01' AND disbursed_at < '2027-01-01'   -- both engines
-- alternatives:  SQL Server: YEAR(disbursed_at) = 2026   ·   SQLite: strftime('%Y', disbursed_at) = '2026'
```

Careful with `applied_at`: it holds a date *and a time* (`2025-06-02 10:35:00`), so `applied_at BETWEEN '2025-01-01' AND '2025-12-31'` silently drops every application made on 31 December after midnight. Use `>= '2025-01-01' AND < '2026-01-01'`.

### Depth (optional)

- ▶ Baraa, *Query data (SELECT)* [0:34:01](https://youtu.be/SSKVgrwhzus?t=2041) — 60 min, SELECT/DISTINCT/TOP/ORDER BY on his SalesDB; ▶ *Filtering data* [2:08:03](https://youtu.be/SSKVgrwhzus?t=7683) — 40 min, every operator above.
- RU deck `2.1 SQL-1-46.pdf`, pages 1–46 (SELECT, WHERE, ORDER BY). *Russian terms:* запрос = query, выборка = selection/result set, условие = condition, сортировка = sorting, псевдоним = alias.

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

**Step 3 — count.** Replace the column list with `COUNT(*)` (today's one aggregate; the rest come in week 2):

```sql
SELECT COUNT(*) AS micro_loans_sep
FROM loans
WHERE product_id = 1
  AND disbursed_at BETWEEN '2026-09-01' AND '2026-09-30';     -- expect 123
```

**Step 4 — the five biggest.** `SELECT TOP 5 …` / `… LIMIT 5` on the step-2 query. Bekzod gets 123 and a five-row table in 90 seconds, instead of a morning of scrolling. Write down the number: 123 Micro loans paid out in September.

---

## 3. Practice (60 min)

Save every query in `submissions/week-01/day-2/queries.sql` with a comment line above it (`-- P3: customers with empty income`). Run, look at the rows, then count. Open the fold only after you have a number.

**P1.** List the distinct values of `loans.status`. How many are there?

<details><summary>Answer</summary>

```sql
SELECT DISTINCT status FROM loans ORDER BY status;
```
Four: active, closed, default, written_off.
</details>

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

**P3.** Customers with an empty monthly income. Count them. Then count those with a filled income and check the two numbers add up to 6 040.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM customers WHERE monthly_income IS NULL;      -- expect 356
SELECT COUNT(*) FROM customers WHERE monthly_income IS NOT NULL;  -- expect 5684
```
356 + 5 684 = 6 040. If you wrote `= NULL` you got 0 — reread "Three things that bite".
</details>

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

**P5.** How many customers live in Nukus or Termez? Write it once with `OR`, once with `IN`.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM customers WHERE region = 'Nukus' OR region = 'Termez';
SELECT COUNT(*) FROM customers WHERE region IN ('Nukus', 'Termez');
```
Both expect 737.
</details>

**P6.** How many loans are *not* active? Check against the active count.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM loans WHERE status <> 'active';   -- expect 4476
SELECT COUNT(*) FROM loans WHERE status = 'active';    -- expect 3352
```
4 476 + 3 352 = 7 828.
</details>

**P7.** Customers whose first name starts with `M`. Then narrow to names starting with `Ma`.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM customers WHERE first_name LIKE 'M%';    -- expect 570
SELECT COUNT(*) FROM customers WHERE first_name LIKE 'Ma%';   -- expect 419
```
(Madina, Malika, Maftuna, Murod…). On SQLite `LIKE` ignores case by default for ASCII letters; on SQL Server it follows the collation — here both give the same.
</details>

**P8.** Loans with principal between 1 000 000 and 5 000 000 inclusive.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM loans WHERE principal BETWEEN 1000000 AND 5000000;   -- expect 3228
```
Same as `principal >= 1000000 AND principal <= 5000000`.
</details>

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

<span class="badge stretch">Stretch</span> **P11.** Customers born before 1960 with a monthly income above 30 000 000, richest first. How many, and who is first? Then write one sentence on whether this group looks plausible for a mass-market lender.

<details><summary>Answer</summary>

```sql
SELECT customer_id, first_name, last_name, birth_date, monthly_income
FROM customers
WHERE birth_date < '1960-01-01' AND monthly_income > 30000000
ORDER BY monthly_income DESC;
```
Expect 108 rows; first is Zafar Mirzaev (customer 3056), born 1958-12-02, income 59 867 394. Plausible as a small affluent/SME tail; what is *not* plausible is anyone born before 1920 or after today — see what you find on Thursday.
</details>

---

## 4. Homework <span class="badge hw">HW 1.2 — Due Day 4</span>

**Bekzod's list.** He sent ten questions. Answer each with one query and the resulting number (or the first rows). Submit to `submissions/week-01/day-2/`:

1. `bekzod.sql` — ten queries, each preceded by `-- Qn: <his question>` and followed by `-- result: <number or first rows>`.
2. `surprised.md` — 5–10 lines: *what surprised you* in the data while doing this (a value you did not expect, a column that behaved strangely, a count that did not add up).

His questions:

- Q1 How many loans has Nur Finance ever disbursed? Q2 How many of them are Auto? Q3 How many SME loans have a term of 36 months?
- Q4 How many loans were disbursed in 2026? Q5 How many in September 2026 only?
- Q6 The ten smallest loans (loan id, product id, principal), smallest first. Q7 How many loans have an annual rate of 0 (which product is that)?
- Q8 How many customers are in the `sme` segment outside Tashkent? Q9 How many applications requested more than 500 000 000? Q10 The applications with the five highest credit scores that were nevertheless rejected (any channel).

**Do it right here** (or in DB Browser and push the two files — both count):

```sqltask
{"check": "hw1.2", "lesson": "W1D2", "title": "HW 1.2 — Bekzod's 10 questions", "file": "bekzod.sql", "tasks": [{"id": "Q1", "q": "How many loans has Nur Finance ever disbursed?"}, {"id": "Q2", "q": "How many of them are Auto?"}, {"id": "Q3", "q": "How many SME loans have a term of 36 months?"}, {"id": "Q4", "q": "How many loans were disbursed in 2026?"}, {"id": "Q5", "q": "How many in September 2026 only?"}, {"id": "Q6", "q": "The ten smallest loans (loan id, product id, principal), smallest first."}, {"id": "Q7", "q": "How many loans have an annual rate of 0 (which product is that)?"}, {"id": "Q8", "q": "How many customers are in the sme segment outside Tashkent?"}, {"id": "Q9", "q": "How many applications requested more than 500 000 000?"}, {"id": "Q10", "q": "The applications with the five highest credit scores that were nevertheless rejected (any channel)."}, {"id": "Surprised", "file": "surprised.md", "text": true, "minLines": 5, "q": "What surprised you in the data (5–10 lines): a value you did not expect, a column that behaved strangely, a count that did not add up — with the query that shows it."}]}
```

Graded on: (a) every query runs and the result line matches the data, (b) `WHERE` conditions use the right operator (`IS NULL`, `BETWEEN`, `IN`, parentheses where needed), (c) `surprised.md` names at least one real oddity with the query that shows it.

---

## 5. Self-check

1. Why does `WHERE monthly_income = NULL` return nothing? *(→ section 1, "Three things that bite")*
2. `WHERE a AND b OR c` — which two conditions does the database group first? *(→ section 1, "WHERE — the seven operators")*
3. Why is `applied_at BETWEEN '2025-01-01' AND '2025-12-31'` wrong for "applications in 2025"? *(→ section 1, "Three things that bite", point 3)*

---

## 6. Company corner <span class="badge company">Approval rate</span>

**Definition.** The approval rate (*уровень одобрения*) is the share of loan applications the company said *yes* to:

$$\text{approval rate} = \frac{\text{approved applications}}{\text{applications decided}}$$

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

Nine points of difference from one word. Neither is wrong; what is wrong is comparing a 61 % from one report with a 70 % from another and announcing a "jump in approvals". When you quote an approval rate, say which convention — and if the target company has its own definition, use theirs (the glossary will record it).

A third variant you will meet: **disbursed-only**, counting `approved` but not `approved_not_disbursed` (7 917 / 14 000 = 56.6 %). Some teams call this the *take-up* or *conversion to disbursement*; do not let it be called approval rate.

> Interview version: *"How would you calculate approval rate, and what could make two teams report different numbers?"* — Give the formula, then the two denominators (cancelled in or out), then disbursed vs approved. Bonus: mention that approval rate by channel differs (the app channel here approves fewer because scoring is stricter without a branch officer).

Tomorrow: how the tables were designed, and why the loans spreadsheet had to be split. Bring Bekzod's list.

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
{"id": "w01d2", "q": "Nilufar (risk) wants the partner channel's approval rate for applications submitted in calendar year 2025, on the decided convention: cancelled applications are left out of the denominator, and approved_not_disbursed counts as approved. Give it as a percentage to 1 decimal.", "type": "number", "dp": 1, "h": ["d037e48df4cd8f8d9f5bb417"], "hint": "Look at what applied_at holds before you write the year filter, and decide which statuses belong in the denominator.", "sol": "U0VMRUNUIENPVU5UKCopIEZST00gYXBwbGljYXRpb25zCldIRVJFIGNoYW5uZWwgPSAncGFydG5lcicgQU5EIGFwcGxpZWRfYXQgPj0gJzIwMjUtMDEtMDEnIEFORCBhcHBsaWVkX2F0IDwgJzIwMjYtMDEtMDEnCiAgQU5EIHN0YXR1cyBJTiAoJ2FwcHJvdmVkJywgJ2FwcHJvdmVkX25vdF9kaXNidXJzZWQnKTsgICAgICAgICAgICAgICAtLSA2ODMKU0VMRUNUIENPVU5UKCopIEZST00gYXBwbGljYXRpb25zCldIRVJFIGNoYW5uZWwgPSAncGFydG5lcicgQU5EIGFwcGxpZWRfYXQgPj0gJzIwMjUtMDEtMDEnIEFORCBhcHBsaWVkX2F0IDwgJzIwMjYtMDEtMDEnCiAgQU5EIHN0YXR1cyBJTiAoJ2FwcHJvdmVkJywgJ2FwcHJvdmVkX25vdF9kaXNidXJzZWQnLCAncmVqZWN0ZWQnKTsgICAtLSA5NzUKKFRoZSBzYW1lIHRleHQgcnVucyBvbiBTUUxpdGUgYW5kIFNRTCBTZXJ2ZXIuKQo2ODMgLyA5NzUgPSA3MC4xICUuCldpdGggYWxsIDEgMTA4IHBhcnRuZXIgYXBwbGljYXRpb25zIG9mIDIwMjUgaW4gdGhlIGRlbm9taW5hdG9yIHlvdSB3b3VsZCBnZXQgNjEuNiAlIOKAlCB0aGUgY2FuY2VsbGVkLWFwcGxpY2F0aW9ucyB0cmFwIGZyb20gdGhlIENvbXBhbnkgY29ybmVyLiBUaGUgaGFsZi1vcGVuIGRhdGUgZmlsdGVyIGtlZXBzIHRoZSBldmVuaW5nIGFwcGxpY2F0aW9ucyBvZiAzMSBEZWNlbWJlciB0aGF0IEJFVFdFRU4g4oCmICcyMDI1LTEyLTMxJyBkcm9wcy4gV2hlbmV2ZXIgeW91IHF1b3RlIHRoZSA3MC4xLCBzYXkgImRlY2lkZWQgY29udmVudGlvbiIgbmV4dCB0byBpdC4="}
```

<!-- challenge:end -->
