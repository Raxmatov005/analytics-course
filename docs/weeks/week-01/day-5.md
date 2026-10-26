# Week 1 · Day 5 — Checkpoint: design and query

<span class="badge">Part A 60 min</span> <span class="badge">Part B 90 min</span> <span class="badge">Part C 20 min</span> <span class="badge hw">Checkpoint · 100 points</span>

> STORY **Friday, 9:00.** Madina closes the door. *"No lesson today. Two things landed on my desk and I'm giving both to you. One: the CEO wants a new product — salary advances for employees of partner companies — and IT needs a first data model by Monday. Two: Bekzod, Sevara and Timur each sent me a list of numbers they want; I merged them into twenty questions. Design the tables, answer the questions, and at 15:00 I'll ask you eight things a hiring manager would ask. Everything you need you learned this week."*

## Today in 3 lines

- **Part A (40 pts):** a schema for *Nur Pay* from a business brief — 4–5 tables with keys and types, the `CREATE TABLE`s, two normalisation decisions explained.
- **Part B (40 pts):** twenty queries on Nur Finance using only this week's SQL — single-table `SELECT`, `WHERE`, `ORDER BY`, `DISTINCT`, `TOP`/`LIMIT`, `COUNT(*)`.
- **Part C (20 pts):** eight interview questions answered in writing, 3–5 sentences each.

**Rules.** Open book: your notes, this week's pages, the SQL boxes and the playground. Closed: the answer folds until you have submitted. No `JOIN`, `GROUP BY` or subqueries in Part B — if you know them, resist; the point is to show the basics are solid. Hand everything in with the **📎 box at the end of this page** by the end of the day: `nur_pay.md` + `nur_pay.sql` (Part A), `queries.sql` (Part B, each query with `-- Bn:` above and `-- result:` below), `interview.md` (Part C).

---

## Part A — Design Nur Pay (60 min, 40 pts)

### The brief

> **Nur Pay — salary advance.** Nur Finance signs a contract with a **partner company** (an employer). The employer gives us a list of its **employees** who may use the service, with their monthly salary and payday. An enrolled employee can request an **advance** through the app on any day: an amount up to a share of the salary already earned this month, for a flat fee. We pay it out the same day. On the employer's next **payroll run**, the employer deducts the advance plus the fee from the employee's salary and transfers the total for all its employees to us in one payment; we then split that transfer into a **repayment** per advance. An employee may have several advances open at once. Employers can pause the service or leave; employees change employer or leave. Finance wants to know, at any time: how much is outstanding per employer, which advances were not covered by the last payroll (the employee left, or the payroll was short), and the fee income per month.

### What to deliver

1. **`nur_pay.md`** — a table list in the Day-1 format (table · one row is… · primary key · points to), then **two normalisation decisions** explained in 3–5 sentences each: something you deliberately did *not* store in a table and why, and something you deliberately *did* store redundantly (a snapshot) and why.
2. **`nur_pay.sql`** — `CREATE TABLE` for every table (SQL Server or SQLite dialect; say which), with `NOT NULL`, `PRIMARY KEY`, `FOREIGN KEY`. Prefix the names `my_` if you create them in your `nur` database.

### Scoring (40)

| Criterion | Points |
|---|---|
| The tables cover the brief: employer, employee, advance, repayment, and the payroll transfer (as a table or a well-argued column) | 10 |
| Keys: every table has a PK; every relationship in the brief has an FK in the right direction (the *many* side holds the key) | 10 |
| Types and constraints are sensible (money as integer/decimal, dates as dates, statuses NOT NULL) | 8 |
| Decision 1 (not stored) is a real 3NF argument | 6 |
| Decision 2 (snapshot) names what would go wrong without it | 6 |

<details><summary>Model answer (open after submitting)</summary>

| Table | One row is… | PK | FK |
|---|---|---|---|
| `employers` | one partner company | `employer_id` | — |
| `employees` | one enrolled employee | `employee_id` | `employer_id` |
| `payroll_runs` | one employer's payroll transfer to us | `payroll_run_id` | `employer_id` |
| `advances` | one advance paid out | `advance_id` | `employee_id` |
| `repayments` | one repayment of one advance from one payroll run | `repayment_id` | `advance_id`, `payroll_run_id` |

Cardinality: `employers 1—∞ employees`, `employers 1—∞ payroll_runs`, `employees 1—∞ advances`, `advances 1—∞ repayments` (an advance can be covered in two runs if the first was short), `payroll_runs 1—∞ repayments`.

```sql
CREATE TABLE my_employers (
    employer_id   INT          NOT NULL PRIMARY KEY,
    name          NVARCHAR(200) NOT NULL,
    tax_id        NVARCHAR(20)  NOT NULL,          -- natural key kept as a column, UNIQUE
    payday_dom    INT          NOT NULL,           -- day of month salaries are paid
    status        NVARCHAR(20) NOT NULL,           -- active / paused / terminated
    contract_start DATE        NOT NULL,
    contract_end  DATE         NULL
);
CREATE TABLE my_employees (
    employee_id   INT          NOT NULL PRIMARY KEY,
    employer_id   INT          NOT NULL,
    customer_id   INT          NULL,                -- link to customers if also a Nur Finance client
    full_name     NVARCHAR(200) NOT NULL,
    phone         NVARCHAR(20) NOT NULL,
    monthly_salary BIGINT      NOT NULL,            -- current salary, updated by the employer's file
    enrolled_on   DATE         NOT NULL,
    left_on       DATE         NULL,
    status        NVARCHAR(20) NOT NULL,
    FOREIGN KEY (employer_id) REFERENCES my_employers(employer_id)
);
CREATE TABLE my_payroll_runs (
    payroll_run_id INT         NOT NULL PRIMARY KEY,
    employer_id   INT          NOT NULL,
    period_month  DATE         NOT NULL,            -- first day of the salary month
    received_on   DATE         NULL,
    amount_expected BIGINT     NOT NULL,
    amount_received BIGINT     NULL,
    status        NVARCHAR(20) NOT NULL,            -- expected / received / short
    FOREIGN KEY (employer_id) REFERENCES my_employers(employer_id)
);
CREATE TABLE my_advances (
    advance_id    INT          NOT NULL PRIMARY KEY,
    employee_id   INT          NOT NULL,
    requested_at  DATETIME2    NOT NULL,
    disbursed_on  DATE         NOT NULL,
    amount        BIGINT       NOT NULL,
    fee           BIGINT       NOT NULL,
    salary_at_request BIGINT   NOT NULL,            -- snapshot, see decision 2
    due_payroll_month DATE     NOT NULL,            -- which payroll should cover it
    status        NVARCHAR(20) NOT NULL,            -- open / repaid / unpaid
    FOREIGN KEY (employee_id) REFERENCES my_employees(employee_id)
);
CREATE TABLE my_repayments (
    repayment_id  INT          NOT NULL PRIMARY KEY,
    advance_id    INT          NOT NULL,
    payroll_run_id INT         NOT NULL,
    amount        BIGINT       NOT NULL,
    allocated_on  DATE         NOT NULL,
    FOREIGN KEY (advance_id)     REFERENCES my_advances(advance_id),
    FOREIGN KEY (payroll_run_id) REFERENCES my_payroll_runs(payroll_run_id)
);
```

**Decision 1 — not stored:** the employer's name, payday or status is *not* in `advances` or `employees` beyond the `employer_id`. Every advance reaches its employer through the employee; storing the employer name on 50 000 advances would be a 3NF violation and when a company renames itself 50 000 rows change. Likewise `repayments` does not carry the employee: advance → employee is enough.

**Decision 2 — stored redundantly:** `salary_at_request` on the advance. Strictly, salary belongs to the employee (3NF). But the salary *changes* — the employer sends a new file monthly — and the limit we approved was computed from the salary *at that moment*. Without the snapshot you cannot later explain why a 4 000 000 advance was allowed, or audit the limit rule. Same logic as `amount_expected` on the payroll run: it is what the employer owed, frozen, even if employees later leave. A snapshot is redundancy chosen on purpose and labelled as such.

Finance's three questions map to: outstanding per employer = `advances` with `status = 'open'` summed through employee → employer; uncovered advances = `advances` whose `due_payroll_month` has a `payroll_runs` row with status `received`/`short` but no (or a short) `repayments` row; fee income per month = sum of `fee` by `disbursed_on` month.

Alternative accepted: no `payroll_runs` table, with `repayments` carrying `employer_transfer_ref` and `received_on` — loses the "payroll was short" question; worth 7/10 on the first criterion.

</details>

---

## Part B — Twenty queries (90 min, 40 pts)

Two points each: 1 for a query that runs and expresses the question, 1 for the correct result. Expected numbers are as of the shipped dataset (2026-10-01). Difficulty rises; do not get stuck — skip and return.

**B1.** How many customers are in the table? · **B2.** How many loans are closed? · **B3.** How many applications were cancelled?

<details><summary>B1–B3</summary>

```sql
SELECT COUNT(*) FROM customers;                               -- 6040
SELECT COUNT(*) FROM loans WHERE status = 'closed';           -- 4242
SELECT COUNT(*) FROM applications WHERE status = 'cancelled'; -- 1817
```

</details>

**B4.** List the distinct regions of customers, alphabetically. How many? · **B5.** How many customers have no recorded income? · **B6.** How many loans have a principal of 100 000 000 or more?

<details><summary>B4–B6</summary>

```sql
SELECT DISTINCT region FROM customers ORDER BY region;         -- 8: Andijan, Bukhara, Fergana, Namangan, Nukus, Samarkand, Tashkent, Termez
SELECT COUNT(*) FROM customers WHERE monthly_income IS NULL;   -- 356
SELECT COUNT(*) FROM loans WHERE principal >= 100000000;       -- 996
```

</details>

**B7.** Affluent-segment customers living in Tashkent. · **B8.** Customers whose surname ends in `ova`. · **B9.** Instalments falling due in October 2026 (the month that starts on the data's as-of date).

<details><summary>B7–B9</summary>

```sql
SELECT COUNT(*) FROM customers WHERE segment = 'affluent' AND region = 'Tashkent';          -- 487
SELECT COUNT(*) FROM customers WHERE last_name LIKE '%ova';                                 -- 2447
SELECT COUNT(*) FROM installments WHERE due_date BETWEEN '2026-10-01' AND '2026-10-31';     -- 3392
```
B8: 2 447 of 2 924 women — surnames ending `eva` (Abdullaeva, Mirzaeva) are the rest. `LIKE '%ova'` is a text pattern, not "female": say what you measured.

</details>

**B10.** Applications submitted in calendar year 2025. Careful with the column type. · **B11.** Payments larger than 10 000 000.

<details><summary>B10–B11</summary>

```sql
SELECT COUNT(*) FROM applications
WHERE applied_at >= '2025-01-01' AND applied_at < '2026-01-01';   -- 5407
SELECT COUNT(*) FROM payments WHERE amount > 10000000;            -- 7759
```
B10 with `BETWEEN '2025-01-01' AND '2025-12-31'` gives 5 388 — it loses the 19 applications of 31 December made after 00:00 (`applied_at` has a time part). Zero points for the result if the number is lower than 5 407 for that reason; one point for the query if you wrote a comment saying you knew.

</details>

**B12.** Collection visits that ended with a promise to pay. · **B13.** `contract_signed` events from iOS devices. · **B14.** Loans that are neither Micro (1) nor BNPL (3) and run 24 months or longer.

<details><summary>B12–B14</summary>

```sql
SELECT COUNT(*) FROM collections_actions WHERE action_type = 'visit' AND outcome = 'promise_to_pay'; -- 381
SELECT COUNT(*) FROM app_events WHERE event_name = 'contract_signed' AND device = 'ios';             -- 944
SELECT COUNT(*) FROM loans WHERE product_id NOT IN (1, 3) AND term_months >= 24;                     -- 1511
```

</details>

**B15.** Written-off loans with risk grade C or D — and, as a check, all written-off loans. · **B16.** Applications with a credit score above 800 that were rejected (and how many scored above 800 at all).

<details><summary>B15–B16</summary>

```sql
SELECT COUNT(*) FROM loans WHERE risk_grade IN ('C', 'D') AND status = 'written_off';   -- 128
SELECT COUNT(*) FROM loans WHERE status = 'written_off';                                -- 190
SELECT COUNT(*) FROM applications WHERE credit_score > 800 AND status = 'rejected';     -- 6
SELECT COUNT(*) FROM applications WHERE credit_score > 800;                             -- 108
```
B15: 128 of 190 write-offs (67 %) come from the two worst grades — the scorecard works, but 62 write-offs came from A and B. B16: 6 of 108 top scorers were rejected; a risk analyst would want to know why (a rule outside the score, or a data error).

</details>

**B17.** Customers who are **not** (mass segment **or** in Tashkent) — i.e. non-mass customers outside Tashkent. Write it with `NOT (…)`, then rewrite without `NOT` and confirm the same count.

<details><summary>B17</summary>

```sql
SELECT COUNT(*) FROM customers WHERE NOT (segment = 'mass' OR region = 'Tashkent');          -- 1481
SELECT COUNT(*) FROM customers WHERE segment <> 'mass' AND region <> 'Tashkent';             -- 1481
```
De Morgan: `NOT (a OR b)` = `NOT a AND NOT b`. Both forms score; the second is what you will read in other people's code.

</details>

**B18.** The three largest payments ever received: payment id, loan id, amount, date.

<details><summary>B18</summary>

```sql
-- SQL Server:  SELECT TOP 3 payment_id, loan_id, amount, paid_at FROM payments ORDER BY amount DESC, payment_id;
SELECT payment_id, loan_id, amount, paid_at FROM payments ORDER BY amount DESC, payment_id LIMIT 3;
```
Payments 30772, 30773, 30774 — all 57 170 000, all on loan 4570 (the 598 450 000 SME loan from Day 2 P9), 2025-01-26 / 02-27 / 03-27. Three equal amounts in a row is not a duplicate: they are three consecutive instalments. (Payment 30775 on the same loan has the same amount, so third place is a tie; `payment_id` in the `ORDER BY` makes the three rows the same on both engines.) (Write that sentence; it is the difference between a count and an analysis.)

</details>

**B19.** The earliest and the latest loan ever disbursed (two queries): loan id, date, principal.

<details><summary>B19</summary>

```sql
SELECT loan_id, disbursed_at, principal FROM loans ORDER BY disbursed_at ASC  LIMIT 1;   -- 4185, 2024-01-02, 1 250 000
SELECT loan_id, disbursed_at, principal FROM loans ORDER BY disbursed_at DESC LIMIT 1;   -- 596,  2026-10-01, 2 510 000
```
(`TOP 1` on SQL Server.) The latest is on the as-of date itself: the data is current to the day it was cut.

</details>

**B20.** Customers registered in 2026 with a monthly income above 20 000 000, richest first. How many, and who is first? Look at the first row carefully.

<details><summary>B20</summary>

```sql
SELECT customer_id, first_name, last_name, monthly_income, registered_at
FROM customers
WHERE registered_at >= '2026-01-01' AND monthly_income > 20000000
ORDER BY monthly_income DESC;                                                -- 258 rows
```
First row: customer **6016**, `Bobur␣ rakhimov`, 59 962 504 — an id above 6000 with a trailing space and a lower-case surname: one of yesterday's forty duplicates. The "richest new customer of 2026" is a data-entry copy of an existing client. Full marks only if your `-- result:` line says so.

</details>

---

## Part C — Eight interview questions (20 min, 20 pts)

Answer in writing, 3–5 sentences each, as you would speak. 2.5 points per question: 1 for correctness, 1 for a lending example, 0.5 for saying it in plain words.

1. Walk me through the life of a loan and where data is recorded at each step.
2. What is the difference between a primary key and a foreign key? Give one of each from a lending database.
3. What does "normalised" mean, and give one example of a problem normalisation prevents.
4. What is DPD, and how is FPD different from it? Why do companies track FPD separately?
5. Two teams report different approval rates for the same month. What is the most likely reason?
6. What is the difference between OLTP and OLAP, and why would a company have both?
7. Explain a star schema to a non-technical manager.
8. What is a loan portfolio, and name three numbers a portfolio manager watches.

<details><summary>Model answers (open after submitting)</summary>

1. Application → decision → disbursement → repayment → delinquency → collection → write-off/recovery. Each is a table: `applications` (and its `status`/score for the decision), `loans` (disbursement), `installments` + `payments` (repayment; delinquency is computed from them), `collections_actions`, and `loans.status` for write-off. One metric per step: applications per day, approval rate, disbursed amount, collection rate, DPD buckets, cure rate, NPL/write-off rate.
2. A PK uniquely identifies a row and cannot be empty (`loans.loan_id`); an FK is a column holding another table's PK, linking the row to its parent (`loans.customer_id` → `customers`). The FK enforces that a loan cannot point to a non-existent customer; one customer can have many loans — one-to-many.
3. Each fact is stored once, in the table it belongs to, so that it cannot become inconsistent. Example: if the product's interest rate were stored on every loan row, changing the rate would mean updating thousands of rows and missing some; in 3NF the rate sits in `products` and loans hold only the product id. Also no repeating column groups like `inst1_due, inst2_due …` — instalments become rows.
4. DPD = days since the due date of the oldest instalment that is not fully paid, grouped into 0 / 1–30 / 31–60 / 61–90 / 90+ (90+ is non-performing). FPD = the first instalment not paid within X days (30 is common). FPD is tracked separately because it appears within two months of disbursement — an early warning for new products, channels or scoring rules long before the 90+ bucket moves — and because non-payment of the very first instalment is the classic fraud signal.
5. Different denominators: one team counts cancelled applications in the base (all applications), the other counts only decided ones (approved + rejected). At Nur Finance that is 61.4 % vs 70.5 % on the same data. A second common cause: counting only disbursed loans as "approved" instead of all approvals. The fix is a written definition everyone uses, and saying which one when quoting a number.
6. OLTP is the production system that records transactions — normalised, fast for single-row writes, holding the current state. OLAP is for analysis — a warehouse copy, de-normalised into facts and dimensions, holding history and snapshots, built for big reads. A company needs both because heavy reports on the production database slow the business and cannot show last month-end's balance once it has been overwritten.
7. "Imagine one big table of events — every loan — in the middle, with only numbers and codes. Around it, small lookup tables that explain the codes: which customer, which product, which branch, which date. Any question is 'add up a number in the middle, split by something at the edge': disbursed amount by region by month. Drawn on paper it looks like a star."
8. The portfolio is all loans currently outstanding, taken together. A portfolio manager watches: outstanding balance and its growth, disbursements per month (and average ticket), and quality — PAR30/90 or the share in the 90+ bucket, plus yield. At Nur Finance: 3 352 active loans, 3 051 disbursed in 2026, 190 written off to date.

</details>

---

## Scoring and what happens next

| Part | Points | Pass |
|---|---|---|
| A — design | 40 | |
| B — queries | 40 | |
| C — interview | 20 | |
| **Total** | **100** | **≥ 70 → Week 2 on Monday** |

Below 70: feedback names the sections to redo over the weekend (usually Day 2's operators or Day 3's normal forms); re-submit the failed part on Monday morning before starting Week 2. Points go to the [Progress page](progress.md). If you skipped Week 1 via the Day-0 diagnostic, this checkpoint is your proof — same threshold.

**Hand-in checklist** (the 📎 box below): `nur_pay.md`, `nur_pay.sql`, `queries.sql` (20 queries, 20 `-- result:` lines), `interview.md`. Also due today: HW 1.3 (the data-quality memo) in `day-4/`.

Madina, 17:30: *"The CFO used your 6 000. IT got the Nur Pay model. Bekzod has his twenty numbers. Monday we teach you to join tables — and the twenty questions he actually wanted to ask."*

---

### 📎 Hand in here

```sqltask
{"check": "handin-W1D5", "lesson": "W1D5", "title": "Checkpoint 1", "tasks": [{"id": "nur_pay.md", "file": "nur_pay.md", "text": true, "minLines": 3, "q": "Write `nur_pay.md` here — what the page above asks for."}, {"id": "queries.sql", "file": "queries.sql", "text": true, "minLines": 3, "q": "Write `queries.sql` here — what the page above asks for."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else the page lists (one more file, or a .zip of several)."}]}
```

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w01d5", "pass": 0.8, "questions": [
  {"type": "single", "q": "In Nur Pay, one employee can have several advances. Where does the foreign key go?", "options": ["advances.employee_id", "employees.advance_id", "In both tables", "In a column listing all advance ids on the employee row"], "answer": 0, "explain": "The many side holds the key; a list of ids in one cell would also break 1NF (→ Part A, scoring)."},
  {"type": "single", "q": "An advance can be covered by two payroll runs (the first was short), and one payroll run covers many advances. How do you model that?", "options": ["A repayments table, one row per advance per run, with FKs to both advances and payroll_runs", "A payroll_run_id column on advances", "An advance_id column on payroll_runs", "Store the run dates in a text column on the employee"], "answer": 0, "explain": "Like payments with its two FKs (loan and instalment), a linking table holds one row per pairing (→ Part A; Day 3, section 1)."},
  {"type": "single", "q": "Strictly, salary belongs to the employee. When is it right to also store salary_at_request on each advance?", "options": ["Never — it breaks 3NF", "When the salary can change later and you must still explain the limit approved at that moment", "Only to save a join", "When the employee has more than one advance"], "answer": 1, "explain": "A snapshot is redundancy chosen on purpose: without it, next month's salary file overwrites the fact the decision was based on (→ Part A; Day 3, P9)."},
  {"type": "single", "q": "Which WHERE clause returns the same rows as this one?", "code": "WHERE NOT (segment = 'mass' OR region = 'Tashkent')", "options": ["WHERE segment <> 'mass' OR region <> 'Tashkent'", "WHERE segment <> 'mass' AND region <> 'Tashkent'", "WHERE NOT segment = 'mass' OR region = 'Tashkent'", "WHERE segment = 'mass' AND region = 'Tashkent'"], "answer": 1, "explain": "De Morgan: NOT (a OR b) = NOT a AND NOT b (→ B17)."},
  {"type": "number", "q": "How many rows of this small table does the query count?", "code": "id | segment  | region\n1  | mass     | Tashkent\n2  | affluent | Tashkent\n3  | mass     | Nukus\n4  | sme      | Fergana\n5  | affluent | Bukhara\n\nSELECT COUNT(*) FROM t\nWHERE NOT (segment = 'mass' OR region = 'Tashkent');", "answer": 2, "explain": "Only rows 4 and 5 are neither mass nor in Tashkent; 4 is the answer you get if you turn the OR into OR NOT (→ B17)."},
  {"type": "single", "q": "What does this filter count?", "code": "SELECT COUNT(*) FROM customers\nWHERE last_name LIKE '%ova';", "options": ["All women", "Customers whose surname ends in 'ova'", "Surnames that start with 'ova'", "Surnames with 'ova' anywhere"], "answer": 1, "explain": "% stands for any characters before; it is a text pattern, not 'female' (surnames in -eva are missed), so say what you measured (→ B8)."},
  {"type": "single", "q": "The three largest payments are equal amounts on the same loan, paid a month apart. What is the most likely explanation?", "options": ["A duplicate load — delete two of them", "Three consecutive instalments of the same size", "A currency error", "A fraud pattern"], "answer": 1, "explain": "Equal monthly amounts are what an annuity schedule produces; check the dates before calling something a duplicate (→ B18)."},
  {"type": "multi", "q": "Which of these mistakes give a wrong number with no error message?", "options": ["Mixing AND and OR without parentheses", "Writing = NULL instead of IS NULL", "BETWEEN '…-01-01' AND '…-12-31' on a column that also holds a time", "Misspelling a column name", "Forgetting the FROM line"], "answer": [0, 1, 2], "explain": "The first three run and quietly return a wrong count; the last two fail loudly, which is the safer kind of mistake (→ Day 2, section 1)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w01d5", "q": "Nilufar has a new application from Murod Abdullaev, customer 3710. Every loan under id 3710 is current. Before she decides, check the whole person: find every customer row that is the same person, list all loans under those ids, and give the highest DPD among them as of 2026-10-01 (a whole number).", "type": "number", "dp": 0, "h": ["ad57f847e0f18d31d838991b"], "hint": "A name is not a key: there is more than one Murod Abdullaev in the table.", "sol": "U3RlcCAxIOKAlCB0aGUgdHdpbiAoRGF5IDQpOgpTRUxFQ1QgY3VzdG9tZXJfaWQsIGZpcnN0X25hbWUsIGxhc3RfbmFtZSwgYmlydGhfZGF0ZSwgcGhvbmUgRlJPTSBjdXN0b21lcnMKV0hFUkUgTE9XRVIoVFJJTShmaXJzdF9uYW1lKSkgPSAnbXVyb2QnIEFORCBMT1dFUihUUklNKGxhc3RfbmFtZSkpID0gJ2FiZHVsbGFldic7CuKGkiA4IHJvd3M7IG9ubHkgMzcxMCAoTXVyb2QgQWJkdWxsYWV2KSBhbmQgNjAxNCAoTVVST0QgYWJkdWxsYWV2KSBzaGFyZSB0aGUgYmlydGggZGF0ZSAxOTY5LTA5LTI5IGFuZCB0aGUgcGhvbmUgKzk5ODkwNDUwNTE0Ni4KU3RlcCAyIOKAlCB0aGUgbG9hbnMgKERheSAyKToKU0VMRUNUIGxvYW5faWQsIGN1c3RvbWVyX2lkLCBzdGF0dXMsIGRpc2J1cnNlZF9hdCBGUk9NIGxvYW5zIFdIRVJFIGN1c3RvbWVyX2lkIElOICgzNzEwLCA2MDE0KTsK4oaSIDUyMyBhY3RpdmUsIDg2NSBhbmQgNjU1NSBjbG9zZWQgKHVuZGVyIDM3MTApOyAxMjE3IGFjdGl2ZSBhbmQgNjc4MyBkZWZhdWx0ICh1bmRlciA2MDE0KS4KU3RlcCAzIOKAlCBEUEQgYnkgaGFuZCAoRGF5IDMpIG9uIGxvYW4gNjc4MzoKU0VMRUNUIGluc3RhbGxtZW50X2lkLCBpbnN0YWxsbWVudF9ubywgZHVlX2RhdGUsIHRvdGFsX2R1ZSBGUk9NIGluc3RhbGxtZW50cyBXSEVSRSBsb2FuX2lkID0gNjc4MzsKU0VMRUNUIGluc3RhbGxtZW50X2lkLCBwYWlkX2F0LCBhbW91bnQgRlJPTSBwYXltZW50cyBXSEVSRSBsb2FuX2lkID0gNjc4MzsK4oaSIGluc3RhbG1lbnQgMSBwYWlkIGluIGZ1bGw7IGluc3RhbG1lbnQgMiAoZHVlIDIwMjYtMDYtMTEsIDQgMzAwIDIwMCkgcmVjZWl2ZWQgb25seSAxIDU2NCA2OTU7IGluc3RhbG1lbnRzIDMgYW5kIDQgcGFydGlhbDsgNSB1bnBhaWQuIE9sZGVzdCBub3QgZnVsbHkgcGFpZDogMjAyNi0wNi0xMSDihpIgMTkgKyAzMSArIDMxICsgMzAgKyAxID0gMTEyIGRheXMuIFRoZSBvdGhlciBmb3VyIGxvYW5zIGFyZSBjdXJyZW50IChEUEQgMCkuCihUaGUgU1FMIGlzIGlkZW50aWNhbCBvbiBTUUxpdGUgYW5kIFNRTCBTZXJ2ZXIuKQpUaGUgcGVyc29uIGJlaGluZCB0aGUgY2xlYW4tbG9va2luZyBpZCAzNzEwIGhhcyBhIGNvbnN1bWVyIGxvYW4gaW4gZGVmYXVsdCBhdCAxMTIgRFBELCBoaWRkZW4gdW5kZXIgdGhlIGR1cGxpY2F0ZSByb3cuIEEgZGVjaXNpb24gdGFrZW4gb24gdGhlIGN1c3RvbWVyIGlkIGFsb25lIHdvdWxkIG1pc3MgaXQg4oCUIHRoZSBkdXBsaWNhdGVzIGFyZSBub3QgaGFybWxlc3Mu"}
```

<!-- challenge:end -->
