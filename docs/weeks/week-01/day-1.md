# Week 1 · Day 1 — How a company keeps its data

<span class="badge">Learn 60 min</span> <span class="badge">Practice 60 min</span> <span class="badge">Setup 45 min</span> <span class="badge company">Company corner</span>

> STORY **Monday, 9:02.** You badge into Nur Finance for the first time. Your lead, Madina, puts a coffee on your desk and says: *"We lend money to people and small businesses. Everything that happens — every application, every loan, every payment that comes in late — ends up in a database. Your job is to turn that database into answers. Today: learn how it's organised and get it running on your laptop. Tomorrow you write your first query."*

## Today in 3 lines

- You can explain what a **table, row, column, primary key and foreign key** are, with a lending example for each.
- You have **SQL Server + SSMS** (or the SQLite fallback) installed and the **Nur Finance** database loaded, 11 tables.
- You can describe the **loan lifecycle** and name the table where each step is recorded.

---

## 1. Learn — data as tables

### Why tables?

A company does not store "the customer Aziz". It stores facts in **tables**: a table is a grid where each **row** is one thing (one customer, one loan, one payment) and each **column** is one attribute of that thing (name, amount, date). This is called a **relational database**; the language to ask it questions is **SQL**.

Think of Excel: a sheet is a table, but with three rules Excel does not enforce:

1. Every column has **one type** (a date column holds only dates).
2. Every row has an **ID** that is unique — the **primary key** (PK).
3. Rows in one table point to rows in another by storing that ID — a **foreign key** (FK).

```game
{"type": "match", "id": "w01d1-terms", "title": "Words of the day", "pairs": [["Table", "a list of things of one kind (all customers)"], ["Row", "one thing in that list (one customer)"], ["Column", "one property every row has (birth date)"], ["Primary key", "the ID that names exactly one row"], ["Foreign key", "a column that stores another table's ID"]]}
```

### The Nur Finance database

Eleven tables. Learn them like a floor plan: you will walk these corridors for eight weeks.

| Table | One row is… | Primary key | Points to (FK) |
|---|---|---|---|
| `customers` | one person | `customer_id` | — |
| `products` | one loan product (Micro, Consumer, BNPL, Auto, SME) | `product_id` | — |
| `branches` | one office | `branch_id` | — |
| `staff` | one employee | `staff_id` | `branch_id` |
| `applications` | one request for a loan | `application_id` | `customer_id`, `product_id`, `branch_id`, `officer_id → staff` |
| `loans` | one loan that was actually paid out | `loan_id` | `application_id`, `customer_id`, `product_id`, `branch_id` |
| `installments` | one scheduled monthly payment of a loan | `installment_id` | `loan_id` |
| `payments` | one real payment received | `payment_id` | `loan_id`, `installment_id` |
| `collections_actions` | one SMS / call / visit to a late borrower | `action_id` | `loan_id`, `collector_id → staff` |
| `app_events` | one tap in the mobile app | `event_id` | `customer_id`, `application_id` |
| `dim_date` | one calendar day | `date_key` | — |

Notice the shape: a few **"who/what" tables** (customers, products, branches, staff — and the calendar, dim_date) and a few **"what happened" tables** (applications, loans, installments, payments, actions, events). Almost every company's data has this shape; in week 4 you will learn its name (*dimensions and facts*).

```game
{"type": "sort", "id": "w01d1-kinds", "title": "Who/what or what happened?", "q": "Put each table into its kind.", "groups": {"Who / what (things)": ["customers", "products", "branches", "staff", "dim_date"], "What happened (events)": ["applications", "loans", "installments", "payments", "collections_actions", "app_events"]}}
```

### Reading a relationship

> "`loans.customer_id` is a foreign key to `customers.customer_id`"

means: in the `loans` table, the column `customer_id` holds a number, and that number is the ID of a row in `customers`. One customer can have many loans; one loan belongs to exactly one customer. This is a **one-to-many** relationship. Write it as `customers 1 — ∞ loans`.

Now you can read the whole database as sentences:

- A **customer** submits many **applications**; each application is for one **product**, handled at one **branch** by one **officer** (staff).
- An approved application becomes at most one **loan**.
- A loan has many **installments** (its schedule) and receives many **payments**.
- A late loan gets many **collections actions**.

```game
{"type": "pick", "id": "w01d1-pk", "title": "Find the primary key", "q": "Four real rows of the loans table. Which column names exactly one row?", "columns": ["loan_id", "customer_id", "product_id", "principal", "disbursed_at", "status"], "rows": [[1, 3473, 2, 31150000, "2025-03-28", "active"], [2, 4570, 2, 40060000, "2025-12-05", "active"], [3, 1397, 1, 1590000, "2026-03-28", "closed"], [4, 4240, 1, 2520000, "2026-08-23", "active"]], "answer": ["loan_id"], "hint": "Not that one: could two loans share this value?", "why": "Every loan has its own loan_id; customer_id and product_id repeat — they point to other tables."}
```

```game
{"type": "connect", "id": "w01d1-fk", "title": "Where does a loan point?", "left": {"name": "loans", "cols": ["loan_id", "application_id", "customer_id", "product_id", "branch_id", "principal"]}, "right": {"name": "the tables it points to", "cols": ["customers.customer_id", "applications.application_id", "staff.staff_id", "branches.branch_id", "products.product_id"]}, "links": [["application_id", "applications.application_id"], ["customer_id", "customers.customer_id"], ["product_id", "products.product_id"], ["branch_id", "branches.branch_id"]], "why": "These four are loans' foreign keys. principal is a plain number, and a loan stores no officer."}
```

### Depth (optional)

- ▶ Baraa, *Introduction to SQL* [0:07:38](https://youtu.be/SSKVgrwhzus?t=458) — 15 min, what a database is and why SQL.
- RU deck `1.1 Database Fundamentals.pdf`, pages 1–30 (what a DBMS is, tables, keys). *Russian terms:* таблица = table, строка = row, столбец = column, первичный ключ = primary key, внешний ключ = foreign key.

---

## 2. Set up your tools (45 min)

You need a database engine and a program to type queries into. Pick **Path A** (what banks and the video use). If the install fights you for more than 30 minutes, take **Path B** today and come back to A on the weekend — both run the same course.

<details>
<summary><b>Path A — SQL Server Express + SSMS (recommended)</b></summary>

1. Download **SQL Server 2022 Express** (free): https://www.microsoft.com/en-us/sql-server/sql-server-downloads → *Express* → run the installer → **Basic**.
2. Download **SQL Server Management Studio (SSMS)**: https://aka.ms/ssmsfullsetup → install → open → *Connect* with the server name the Express installer showed (usually `localhost\SQLEXPRESS`), Windows Authentication.
3. In SSMS: *File → New → Query*. Paste and run (F5):

```sql
CREATE DATABASE nur;
GO
USE nur;
GO
```

4. Open the file `data/sql/sqlserver.sql` from the course folder (*File → Open*). Run the **CREATE TABLE** block first (select it, F5), then the **BULK INSERT** lines. If `BULK INSERT` complains about the path, edit the path to where your course folder is.
5. Check:

```sql
SELECT COUNT(*) AS loans FROM loans;        -- expect 7828
SELECT COUNT(*) AS customers FROM customers; -- expect 6040
```

▶ Baraa shows the same install at [0:22:33](https://youtu.be/SSKVgrwhzus?t=1353).
</details>

<details>
<summary><b>Path B — SQLite with DB Browser (10-minute fallback)</b></summary>

1. Download **DB Browser for SQLite**: https://sqlitebrowser.org/dl/ → Windows installer → install.
2. *Open Database* → choose `data/raw/nur.db` in the course folder. All 11 tables are already there.
3. Tab *Execute SQL* → paste → Ctrl+Enter:

```sql
SELECT COUNT(*) AS loans FROM loans;  -- expect 7828
```

Differences you will meet: SQLite writes `LIMIT 10` where SQL Server writes `TOP 10`; dates are text in `YYYY-MM-DD`. The pages always show both when they differ.
</details>

---

## 3. Worked example — reading a row like an analyst

Madina asks: *"Loan 1 — tell me its story in one sentence."* No SQL yet; open the tables in your tool (SSMS: right-click a table → *Select Top 1000 Rows*; DB Browser: tab *Browse Data*) and follow the keys.

1. `loans`, row with `loan_id = 1`: note `customer_id`, `product_id`, `principal`, `term_months`, `disbursed_at`, `status`.
2. `customers`, row with that `customer_id`: name, region, segment.
3. `products`, row with that `product_id`: product name.
4. `installments`, rows with `loan_id = 1`: how many? The first `due_date`?
5. `payments`, rows with `loan_id = 1`: how many, were any later than the due date?

Sentence shape: *"[Name] from [region] took a [product] of [principal] for [term] months on [date]; [n] of [term] instalments are paid, the loan is [status]."*

That chain — fact table → key → dimension → key → the next fact — is 80 % of what SQL does for you. Tomorrow you make the computer do the walking.

---

## 4. Practice (60 min)

Write your answers in a text file `submissions/week-01/day-1/answers.md` (HW 1.1 collects it). Check each against the folded answer only after you have tried.

**P1.** For each table, say whether it is a "who/what" table or a "what happened" table.

<details><summary>Answer</summary>
Who/what: customers, products, branches, staff, dim_date. What happened: applications, loans, installments, payments, collections_actions, app_events.
</details>

**P2.** `installments` has a column `loan_id`. Is it a primary key or a foreign key? How do you know without opening the data?

<details><summary>Answer</summary>
Foreign key. A loan has many instalments, so the same loan_id appears on many rows — it cannot be unique, so it cannot be the primary key. The PK is installment_id.
</details>

**P3.** Which pairs of tables are one-to-many? Write five, in the form `A 1 — ∞ B`.

<details><summary>Answer</summary>
customers 1—∞ applications; customers 1—∞ loans; products 1—∞ loans; loans 1—∞ installments; loans 1—∞ payments; branches 1—∞ staff; loans 1—∞ collections_actions; applications 1—∞ app_events (any five).
</details>

**P4.** Is `applications → loans` one-to-many or one-to-one? Explain using the business, not the data.

<details><summary>Answer</summary>
One-to-one (or one-to-zero): one application can produce at most one loan, and a rejected application produces none. loans.application_id would be unique.
</details>

**P5.** Browse `applications`. Find the distinct values of `status`. What does each mean in business words?

<details><summary>Answer</summary>
approved (money paid out → there is a loan), approved_not_disbursed (we said yes, the customer never took it), rejected (we said no), cancelled (the customer withdrew).
</details>

**P6.** Browse `loans.status`. One value is `written_off`. In your own words, what happened to that loan?

<details><summary>Answer</summary>
The borrower stopped paying for so long (here > 180 days) that the company no longer expects the money and removed it from the "live" portfolio as a loss. It may still be collected later (recovery).
</details>

**P7.** Which table would answer each question, and which column?
a) "How many people applied through the app last month?"
b) "What is the total amount we are owed?"
c) "How many calls did collectors make in Fergana?"

<details><summary>Answer</summary>
a) applications: channel = 'app', applied_at. b) installments (total_due) minus payments (amount) — two tables; not loans.principal, which is the original amount, not what is owed now. c) collections_actions (action_type = 'call') joined to staff → branches (region = 'Fergana').
</details>

**P8.** Open `customers`. Scroll. Write down two things that look *wrong* to you. (Keep the note; Thursday is detective day.)

<details><summary>Answer</summary>
Any two of: empty monthly_income cells; a birth date in the future or 1900-01-01; a first name in CAPITALS or with a trailing space; what looks like the same person twice.
</details>

<span class="badge stretch">Stretch</span> **P9.** Draw the eleven tables as boxes and the relationships as lines on paper or in https://dbdiagram.io (free, no login needed to try). Photograph it; you will compare it with the real diagram on Day 3.

---

## 5. Homework <span class="badge hw">Due Day 3</span>

**HW 1.1 — Your tool is ready.** Submit to `submissions/week-01/day-1/`:

1. `screenshot.png` — your query tool showing `SELECT COUNT(*) FROM loans;` with the result **7828**.
2. `answers.md` — your P1–P8 answers (after checking: mark where you were wrong and what you learned).
3. `loan-1.md` — the one-sentence story of loan 1 from the worked example.

Graded on: (a) the tool runs, (b) answers are in your own words, not copied from the folds, (c) the sentence is correct against the data.

---

## 6. Self-check

1. A column that must be unique on every row — which key is that? *(→ section 1, "Why tables?")*
2. Why is `loans.principal` the wrong column for "how much are we owed"? *(→ P7)*
3. In which table does a rejected application leave a trace, and in which does it not? *(→ section 1, "Reading a relationship")*

---

## 7. Company corner <span class="badge company">Lending 101</span>

**The loan lifecycle.** Every lending company, from a bank to a BNPL app, moves money through the same seven steps. Learn them in order; each one is a table.

| Step | What happens | Table | Metric people ask about |
|---|---|---|---|
| 1. Application | a customer asks for money | `applications` | applications per day, by channel |
| 2. Decision | scoring + rules say yes/no | `applications.status`, `credit_score` | **approval rate** |
| 3. Disbursement | money leaves our account | `loans.disbursed_at`, `principal` | **disbursements** (sum per month) |
| 4. Repayment | monthly instalments come in | `installments`, `payments` | collection rate, **outstanding** |
| 5. Delinquency | a payment is late | computed from 4 | **DPD**, **FPD**, buckets |
| 6. Collection | we remind, call, visit, restructure | `collections_actions` | contact rate, cure rate |
| 7. Write-off / recovery | we give up on the loan, or get some back | `loans.status` | **NPL**, write-off rate, recovery |

```game
{"type": "order", "id": "w01d1-lifecycle", "title": "The loan lifecycle, in order", "items": ["Application", "Decision", "Disbursement", "Repayment", "Delinquency", "Collection", "Write-off / recovery"], "why": "Each step leaves a trace in a table — that is what you will query."}
```

Two words to carry home today:

- **Portfolio** — all the loans we currently have outstanding, taken together. "The portfolio grew 4 % in September" = total outstanding went up 4 %.
- **Disbursement** — the act (and the amount) of paying out a loan. "We disbursed 12 bn UZS last week."

> Interview version: *"Describe how a loan moves through a lending company and where an analyst looks at each step."* Answer with the seven rows above, naming one metric per row.

Tomorrow: you query. Bring your P8 note.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w01d1", "pass": 0.8, "questions": [
  {"type": "single", "q": "In the loans table, one row is…", "options": ["one customer", "one loan that was actually paid out", "one monthly payment", "one loan application"], "answer": 1, "explain": "Applications are requests; a loan row exists only once money was paid out (section 1)."},
  {"type": "single", "q": "installments.loan_id appears on many rows. What kind of key is it?", "options": ["Primary key", "Foreign key", "Neither — it is just a number", "Both"], "answer": 1, "explain": "It repeats, so it cannot be the primary key; it points to loans.loan_id, so it is a foreign key (P2)."},
  {"type": "multi", "q": "Which of these are 'what happened' tables?", "options": ["payments", "products", "collections_actions", "branches", "applications"], "answer": [0, 2, 4], "explain": "Products and branches describe who/what; payments, actions and applications record events (P1)."},
  {"type": "single", "q": "What is the relationship between customers and loans?", "options": ["one-to-one", "one-to-many", "many-to-many"], "answer": 1, "explain": "One customer can have many loans; each loan belongs to exactly one customer."},
  {"type": "single", "q": "Bekzod asks 'how much are we owed right now?'. Which column is the WRONG one to sum?", "options": ["installments.total_due of unpaid instalments", "loans.principal", "installments.principal_due of future instalments"], "answer": 1, "explain": "Principal is the original amount lent, not what is still owed (P7)."},
  {"type": "number", "q": "Type the query you ran today in your own tool. How many rows does it count?", "code": "SELECT COUNT(*) FROM loans;", "answer": 7828, "explain": "If you got a different number, the load step of section 2 did not finish."},
  {"type": "text", "q": "One word: all loans currently outstanding, taken together, are called the…", "answer": ["portfolio", "loan portfolio", "portfolio of loans"], "explain": "Company corner: 'the portfolio grew 4 %' means total outstanding went up."},
  {"type": "single", "q": "A loan whose status is written_off is…", "options": ["fully repaid early", "a loss removed from the live portfolio after a very long delinquency", "a loan the customer cancelled", "a loan moved to another branch"], "answer": 1, "explain": "Written off = we no longer expect the money; it may still be partly recovered later (P6)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w01d1", "q": "Without writing any join yet: how many of the 11 Nur Finance tables have a column called loan_id? (Count the loans table too.)", "type": "number", "dp": 0, "h": ["5ed11dd9bd72633a27942522"], "hint": "Open each table's columns (SSMS: expand the table → Columns; DB Browser: Database Structure tab). A primary key named loan_id counts as well as a foreign key.", "sol": "NCB0YWJsZXM6IGxvYW5zIChsb2FuX2lkIGlzIGl0cyBwcmltYXJ5IGtleSksIGluc3RhbGxtZW50cywgcGF5bWVudHMgYW5kIGNvbGxlY3Rpb25zX2FjdGlvbnMgKHRoZXJlIGl0IGlzIGEgZm9yZWlnbiBrZXkgcG9pbnRpbmcgYmFjayB0byBsb2FucykuCk5vdCBhcHBsaWNhdGlvbnMgKGEgbG9hbiBwb2ludHMgdG8gaXRzIGFwcGxpY2F0aW9uLCBub3QgdGhlIG90aGVyIHdheSByb3VuZCkgYW5kIG5vdCBhcHBfZXZlbnRzICh0aGV5IHBvaW50IHRvIGFwcGxpY2F0aW9ucykuClRoZSBwYXR0ZXJuIHRvIHJlbWVtYmVyOiB0aGUgJ21hbnknIHNpZGUgY2FycmllcyB0aGUga2V5IG9mIHRoZSAnb25lJyBzaWRlLg=="}
```

<!-- challenge:end -->
