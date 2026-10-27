# Week 1 · Day 1 — How a company keeps its data

<span class="badge">Workspace 15 min</span> <span class="badge">Learn 60 min</span> <span class="badge">Practice 60 min</span> <span class="badge">Homework</span> <span class="badge company">Company corner</span>

> STORY **Monday, 9:02.** You badge into Nur Finance for the first time. Your lead, Madina, puts a coffee on your desk and says: *"We lend money to people and small businesses. Everything that happens — every application, every loan, every payment that comes in late — ends up in a database. Your job is to turn that database into answers. Today: learn how it's organised, and run your first queries on it — ready-made ones, you only press Run. Tomorrow you write your own."*

## Today in 3 lines

- You can explain what a **table, row, column, primary key and foreign key** are, with a lending example for each.
- You can run SQL on the **Nur Finance** database (11 tables) right on these pages, find any table in the **Database** panel, and create, change and delete a small table of your own.
- You can describe the **loan lifecycle** and name the table where each step is recorded.

---

## 1. Your SQL workspace (15 min)

**Nothing to install — ever.** Every SQL box on these pages has **▶ Run** and works on the full Nur Finance database. Press it now:

```sql
SELECT COUNT(*) AS loans FROM loans;   -- expect 7828
```

You just asked the database *"how many rows does the table `loans` have?"* and it answered **7 828**. Read the query left to right: `SELECT` = "give me", `COUNT(*)` = "the number of rows", `FROM loans` = "of the table loans". Every query you write this week starts with those two words, `SELECT … FROM …`.

```game
{"type": "build", "id": "w01d1-g1", "title": "Your first query", "q": "Build the query that counts the rows of the customers table.", "tokens": ["SELECT", "COUNT(*)", "FROM", "customers", ";"], "distractors": ["WHERE", "loans", "SUM(*)"]}
```

Three more things live around the boxes:

- The **Database** button (bottom right) opens the database panel — every table, its columns and its keys, like the panel in DBeaver or DataGrip at work. Tap a table to open it; **Show rows** shows its first 10 rows; tap a name to put it into your query.
- Every box runs on **your practice copy** of the database, kept on your device. You can create tables and change rows in it; the company's real data is never touched.
- The **[SQL playground](playground.md)** is one big editor on the same copy, for free practice.

> ⚠️ **Watch out.** If a number on a page stops matching what you get (say `COUNT(*)` of `loans` is no longer 7 828), you changed your practice copy. Open **Database** → **↺ Reset** and the original data is back. Homework checks always read the original, so they stay right either way.

---

## 2. Learn — data as tables

### Why tables?

A company does not store "the customer Aziz". It stores facts in **tables**: a table is a grid where each **row** is one thing (one customer, one loan, one payment) and each **column** is one attribute of that thing (name, amount, date). This is called a **relational database**; the language to ask it questions is **SQL**.

Think of Excel: a sheet is a table, but with three rules Excel does not enforce:

1. Every column has **one type** (a date column holds only dates).
2. Every row has an **ID** that is unique — the **primary key** (PK).
3. Rows in one table point to rows in another by storing that ID — a **foreign key** (FK).

> 💡 **Key idea.** One table holds one kind of thing, and one row is one of those things. The **primary key** names exactly one row; a **foreign key** is a column that stores another table's primary key — that is how tables point at each other.

```game
{"type": "match", "id": "w01d1-terms", "title": "Words of the day", "pairs": [["Table", "a list of things of one kind (all customers)"], ["Row", "one thing in that list (one customer)"], ["Column", "one property every row has (birth date)"], ["Primary key", "the ID that names exactly one row"], ["Foreign key", "a column that stores another table's ID"]]}
```

### The Nur Finance database

Eleven tables. Learn them like a floor plan: you will walk these corridors for eight weeks. Open the **Database** panel next to this table and find each one.

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

Notice the shape: a few **"who/what" tables** (customers, products, branches, staff — and the calendar, dim_date) and a few **"what happened" tables** (applications, loans, installments, payments, actions, events). Almost every company's data has this shape; on Thursday (Day 4) you will learn its name (*dimensions and facts*).

```game
{"type": "flash", "id": "w01d1-g2", "title": "The eleven tables", "cards": [["customers", "one person who borrows · PK customer_id · points to nothing"], ["products", "one loan product: Micro, Consumer, BNPL, Auto, SME · PK product_id"], ["branches", "one office · PK branch_id"], ["staff", "one employee · PK staff_id · points to branches"], ["applications", "one request for a loan · points to customers, products, branches and the officer in staff"], ["loans", "one loan that was actually paid out · points to its application, customer, product and branch"], ["installments", "one scheduled monthly payment of a loan · points to loans"], ["payments", "one real payment received · points to the loan and the instalment it was for"], ["collections_actions", "one SMS, call or visit to a late borrower · points to the loan and the collector in staff"], ["app_events", "one tap in the mobile app · points to the customer and the application"], ["dim_date", "one calendar day · PK date_key · the calendar every date can join to"]]}
```

### Reading a relationship

> "`loans.customer_id` is a foreign key to `customers.customer_id`"

means: in the `loans` table, the column `customer_id` holds a number, and that number is the ID of a row in `customers`. One customer can have many loans; one loan belongs to exactly one customer. This is a **one-to-many** relationship. Write it as `customers 1 — ∞ loans`.

> 💡 **Key idea.** The *many* side carries the key of the *one* side: every loan stores its `customer_id`; a customer stores no list of loan ids. To find which way a relationship goes, ask "can one of these have many of those?"

Now you can read the whole database as sentences:

- A **customer** submits many **applications**; each application is for one **product**, handled at one **branch** by one **officer** (staff).
- An approved application becomes at most one **loan**.
- A loan has many **installments** (its schedule) and receives many **payments**.
- A late loan gets many **collections actions**.

```game
{"type": "connect", "id": "w01d1-fk", "title": "Where does a loan point?", "left": {"name": "loans", "cols": ["loan_id", "application_id", "customer_id", "product_id", "branch_id", "principal"]}, "right": {"name": "the tables it points to", "cols": ["customers.customer_id", "applications.application_id", "staff.staff_id", "branches.branch_id", "products.product_id"]}, "links": [["application_id", "applications.application_id"], ["customer_id", "customers.customer_id"], ["product_id", "products.product_id"], ["branch_id", "branches.branch_id"]], "why": "These four are loans' foreign keys. principal is a plain number, and a loan stores no officer."}
```

### Lab — a table of your own

The eleven tables were made with four commands you can try right now on your practice copy: `CREATE TABLE` makes an empty table, `INSERT` adds rows, `UPDATE` changes them, `DELETE` removes them. Wednesday explains each one properly; today, feel what a table *is* by building one. Every step has **💡 Show me** if you want the exact SQL. (Your own tables always start with `my_`, so they never mix with the company's.)

```sqllab
{"id": "w01d1-lab", "title": "Your first table", "intro": "Madina wants a short list of branches to practise on. Build it, fill it, fix it — and watch it appear under **Your tables** in the Database panel.", "steps": [
  {"say": "Create an empty table `my_branches` with three columns: `branch_id` (a whole number and the primary key), `name` and `region` (text).", "hint": "CREATE TABLE my_branches (branch_id INTEGER PRIMARY KEY, name TEXT, region TEXT);", "expect": "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'my_branches'", "want": 1},
  {"say": "Insert three branches with ids 1, 2 and 3 — in Tashkent, Samarkand and Bukhara (none in Fergana yet).", "hint": "INSERT INTO my_branches (branch_id, name, region) VALUES\n  (1, 'Chilonzor', 'Tashkent'),\n  (2, 'Registan', 'Samarkand'),\n  (3, 'Old Town', 'Bukhara');", "expect": "SELECT COUNT(*) FROM my_branches", "want": 3},
  {"say": "Branch 3 moved: change its `region` to 'Fergana'. Change only that row.", "hint": "UPDATE my_branches SET region = 'Fergana' WHERE branch_id = 3;", "expect": "SELECT COUNT(*) FROM my_branches WHERE region = 'Fergana'", "want": 1},
  {"say": "The Fergana branch closed. Delete that one row, then look at what is left with `SELECT * FROM my_branches;`.", "hint": "DELETE FROM my_branches WHERE region = 'Fergana';\nSELECT * FROM my_branches;", "expect": "SELECT COUNT(*) * 10 + COALESCE(SUM(region = 'Fergana'), 0) FROM my_branches", "want": 20}],
 "cleanup": "DROP TABLE IF EXISTS my_branches"}
```

Notice what the primary key did: try `INSERT INTO my_branches VALUES (1, 'Again', 'Nukus');` — the database refuses a second row with id 1. That refusal is what "the ID that names exactly one row" means in practice.

### Depth (optional)

- ▶ Baraa, *Introduction to SQL* [0:07:38](https://youtu.be/SSKVgrwhzus?t=458&end=1353) — 15 min, what a database is and why SQL.
- RU deck (TBC Data Analytics 2.0, if you have it) `1.1 Database Fundamentals.pdf`, pages 1–30 (what a DBMS is, tables, keys). *Russian terms:* таблица = table, строка = row, столбец = column, первичный ключ = primary key, внешний ключ = foreign key.

```videoquiz
{"video": "SSKVgrwhzus", "stops": [
  {"at": 650, "q": "In this part, Baraa explains what data and a database are. Which statement is true?", "options": ["A database is simply an Excel file kept on a laptop", "A database keeps data organised so that programs can store, find and change it reliably", "SQL is the name of the database itself", "A database can only store numbers"], "answer": 1, "explain": "The database keeps the data; SQL is the language you use to ask it questions. Nur Finance's 11 tables live in one database.", "back": 60},
  {"at": 900, "q": "In this part, Baraa explains the database management system (DBMS) and the server. Which statement is true?", "options": ["The DBMS is a kind of table", "You talk to the data directly, without any software in between", "The DBMS is the software that receives your SQL, runs it on the data and sends back the result", "A server is the person who writes the SQL"], "answer": 2, "explain": "Your query goes to the DBMS (SQL Server, PostgreSQL, SQLite…), which runs it on the stored data and returns the rows. On these pages, SQLite runs inside your browser.", "back": 60},
  {"at": 1180, "q": "In this part, Baraa compares types of databases and how a relational one is organised. Which statement is true?", "options": ["A relational database stores data in tables of rows and columns, linked by keys", "Every database in the world is relational", "Relational databases have no keys", "A relational database keeps everything in one single table"], "answer": 0, "explain": "Relational = tables linked by keys — exactly the 11 Nur Finance tables and their primary and foreign keys. Other kinds (document, key-value, graph) exist; analysts mostly query relational ones.", "back": 75}]}
```

---

## 3. Worked example — reading a row like an analyst

Madina asks: *"Loan 1 — tell me its story in one sentence."* You do not have to write SQL yet: every step below has a ready-made query. Press **▶ Run**, read the row, and follow the keys from table to table.

1. `loans`, the row with `loan_id = 1`: note `customer_id`, `product_id`, `principal`, `term_months`, `disbursed_at`, `status`.

```sql
SELECT * FROM loans WHERE loan_id = 1;
```

2. `customers`, the row with that `customer_id` (3473 — the number you just read): name, region, segment.

```sql
SELECT * FROM customers WHERE customer_id = 3473;
```

3. `products`, the row with that `product_id`: the product name.

```sql
SELECT * FROM products WHERE product_id = 2;
```

4. `installments`, the rows with `loan_id = 1`: how many? The first `due_date`?

```sql
SELECT * FROM installments WHERE loan_id = 1;
```

5. `payments`, the rows with `loan_id = 1`: how many, and was any paid later than its due date?

```sql
SELECT * FROM payments WHERE loan_id = 1;
```

Sentence shape: *"[Name] from [region] took a [product] of [principal] for [term] months on [date]; [n] of [term] instalments are paid, the loan is [status]."* You write the real sentence in tonight's homework.

That chain — fact table → key → dimension → key → the next fact — is 80 % of what SQL does for you. Tomorrow you write such queries yourself; next week one query walks the whole chain.

---

## 4. Practice (60 min)

Every question has its own answer box: answer, tap **Check**, read why. Your answers are saved in this browser, and the section ticks off when every box is done. Try before you look — the explanation appears only after you answer.

**P1.** Which tables are "what happened" (event) tables? Tick all of them.

```task
{"id": "w01d1-p1", "kind": "multi", "options": ["customers", "products", "branches", "staff", "applications", "loans", "installments", "payments", "collections_actions", "app_events", "dim_date"], "answer": [4, 5, 6, 7, 8, 9], "explain": "Each event table records something that happened, usually with a date: an application, a loan paid out, a scheduled instalment, a payment, a collections action, an app tap. Who/what tables describe things: customers, products, branches, staff, and the calendar dim_date."}
```

**P2.** `installments` has a column `loan_id`. Is it a primary key or a foreign key — and how do you know without opening the data?

```task
{"id": "w01d1-p2", "kind": "choice", "options": ["A primary key — every instalment row has a loan_id", "A foreign key — a loan has many instalments, so the same loan_id repeats on many rows and cannot be unique", "Neither — it is just a number", "Both at once"], "answer": 1, "explain": "A primary key must be unique; loan_id repeats once per instalment, so it cannot be one. It points to loans.loan_id, which makes it a foreign key. The primary key of installments is installment_id."}
```

**P3.** Which pairs of tables are one-to-many? Tick every true `A 1 — ∞ B`.

```task
{"id": "w01d1-p3", "kind": "multi", "options": ["customers 1 — ∞ loans", "loans 1 — ∞ installments", "applications 1 — ∞ loans", "branches 1 — ∞ staff", "loans 1 — ∞ customers", "loans 1 — ∞ payments", "products 1 — ∞ loans"], "answer": [0, 1, 3, 5, 6], "explain": "The many side holds the key: loans.customer_id, installments.loan_id, staff.branch_id, payments.loan_id, loans.product_id. 'loans 1 — ∞ customers' is the wrong way round, and an application produces at most one loan (P4). Others you could add: customers 1 — ∞ applications, loans 1 — ∞ collections_actions, applications 1 — ∞ app_events."}
```

**P4.** Is `applications → loans` one-to-many or one-to-one? Think about the business, not the data.

```task
{"id": "w01d1-p4", "kind": "choice", "options": ["One-to-many: one application can produce several loans", "One-to-one (or one-to-zero): one application produces at most one loan, and a rejected one produces none", "Many-to-many: a loan can come from several applications"], "answer": 1, "explain": "A customer asks once, we decide once, we pay out once. A rejected or cancelled application produces no loan at all — so loans.application_id is unique: each value appears at most once."}
```

Run this ready-made query — it lists every different value of `status` in `applications` (tomorrow you learn to write it):

```sql
SELECT DISTINCT status FROM applications;
```

**P5.** Four statuses come back. Which one means *"we said yes, but the customer never took the money"*?

```task
{"id": "w01d1-p5", "kind": "choice", "options": ["approved", "approved_not_disbursed", "rejected", "cancelled"], "answer": 1, "explain": "approved = money paid out, so there is a loan; approved_not_disbursed = we said yes, the customer never took it; rejected = we said no; cancelled = the customer withdrew before a decision."}
```

**P6.** `loans.status` has a value `written_off`. In your own words: what happened to such a loan?

```task
{"id": "w01d1-p6", "kind": "free", "min": 15, "model": "The borrower stopped paying for so long (here more than 180 days) that the company no longer expects the money. It removed the loan from the live portfolio and booked it as a loss. Some of it may still be collected later (recovery).", "rubric": ["The borrower stopped paying for a very long time", "The company no longer expects the money and books it as a loss, outside the live portfolio", "Some money may still be recovered later"]}
```

**P7.** Which table, and which column, would answer each question?
a) "How many people applied through the app last month?"
b) "What is the total amount we are owed?"
c) "How many calls did collectors make in Fergana?"

```task
{"id": "w01d1-p7", "kind": "free", "min": 20, "model": "a) applications: channel = 'app' and applied_at in last month.\nb) installments (total_due) minus payments (amount) — two tables. Not loans.principal: that is the amount lent on day one, not what is owed now.\nc) collections_actions with action_type = 'call', joined to staff (the collector) and then branches (region = 'Fergana').", "rubric": ["a) applications, with channel and applied_at", "b) the schedule minus the payments — and not loans.principal", "c) collections_actions, reaching the region through staff and branches"]}
```

Run this ready-made query — the 60 newest customer rows, newest first. Scroll through the result:

```sql
SELECT * FROM customers ORDER BY customer_id DESC LIMIT 60;
```

**P8.** Write down two things that look *wrong* to you in these rows. Keep the note — Thursday is detective day.

```task
{"id": "w01d1-p8", "kind": "free", "min": 10, "model": "Any two of: first names in CAPITALS (MALIKA, LOLA); surnames all in lower case; a first name with a trailing space ('Bobur '); what looks like the same person as an older customer; a registration date after the data's as-of date (2026-10-01); empty monthly_income cells elsewhere in the table.", "rubric": ["Names a concrete oddity you can point at", "Says which column it is in"]}
```

> 🚀 **Stretch (optional, +5 XP).** **P9.** Draw the eleven tables as boxes and the relationships as lines, on paper or in https://dbdiagram.io (free, no login needed to try). Then write your lines below, one per line, as `A 1 — ∞ B`. You will compare them with the real diagram on Day 3.

```task
{"id": "w01d1-p9", "kind": "free", "min": 25, "model": "customers 1 — ∞ applications · products 1 — ∞ applications · branches 1 — ∞ applications · staff 1 — ∞ applications (officer) · applications 1 — 0..1 loans · customers 1 — ∞ loans · products 1 — ∞ loans · branches 1 — ∞ loans · loans 1 — ∞ installments · loans 1 — ∞ payments · installments 1 — ∞ payments · loans 1 — ∞ collections_actions · staff 1 — ∞ collections_actions (collector) · branches 1 — ∞ staff · customers 1 — ∞ app_events · applications 1 — ∞ app_events", "rubric": ["Every foreign key in the Day-1 table became a line", "Each line runs from the one side to the many side", "applications → loans is drawn as one-to-zero-or-one"]}
```

---

## 5. Homework <span class="badge hw">HW 1.1 — Due Day 3</span>

**HW 1.1 — Your workspace works:** three counts the site checks, the story of loan 1, and what you got wrong today.

```sqltask
{"check": "hw1.1", "lesson": "W1D1", "title": "HW 1.1 — Your workspace works", "file": "queries.sql", "why": "Every number you report in the next eight weeks comes out of a box like these. Today you prove the box works for you, and that you can follow one loan across four tables.", "graded": ["Q1–Q3: the site checks each result (✔ Check) — all three ✅", "Loan 1: one sentence, every fact in it right against the data", "Reflection: in your own words, at least one practice answer you first got wrong and what you understand now"], "tasks": [{"id": "Q1", "q": "Count the loans: `SELECT COUNT(*) FROM loans;` — write it here and run it."}, {"id": "Q2", "q": "Change one word of Q1 to count the customers."}, {"id": "Q3", "q": "How many payments has loan 1 received? Put `COUNT(*)` in front of the `FROM` of step 5 of the worked example."}, {"id": "Loan 1", "file": "loan-1.md", "text": true, "minLines": 1, "q": "The one-sentence story of loan 1 from the worked example."}, {"id": "Reflection", "file": "reflection.md", "text": true, "minLines": 3, "q": "Three lines or more: which practice answers you got wrong at first, and what you understand now."}]}
```

---

## 6. Self-check

```check
{"id": "w01d1-sc", "questions": [
  {"type": "single", "q": "A column whose value must be unique on every row, and never empty, is the…", "options": ["foreign key", "primary key", "first column", "row number"], "answer": 1, "explain": "The primary key names exactly one row; a foreign key repeats freely (→ section 2, Why tables?)."},
  {"type": "single", "q": "Bekzod asks 'how much are we owed?'. Why is the total of loans.principal the wrong answer?", "options": ["principal is what was lent on day one, not what is still unpaid", "principal is stored in dollars", "loans has no principal column", "SQL cannot add up money"], "answer": 0, "explain": "What is owed comes from the schedule minus the payments; principal never changes after disbursement (→ P7)."},
  {"type": "single", "q": "A customer's application was rejected. Where does it leave a trace?", "options": ["In applications only — no loan row is ever created", "In loans only", "In both applications and loans", "Nowhere — rejected applications are deleted"], "answer": 0, "explain": "A loan row exists only once money is paid out; the application keeps its status 'rejected' (→ section 2, Reading a relationship; P4)."}
]}
```

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

> ⚠️ **Watch out.** The portfolio is what is *still outstanding*, not the sum of `loans.principal`. Principal is what was lent on day one; it does not shrink as the borrower pays.

```game
{"type": "flash", "id": "w01d1-g3", "title": "Lending words", "cards": [["Portfolio", "all loans currently outstanding, taken together"], ["Disbursement", "paying a loan out — and the amount paid out"], ["Approval rate", "the share of applications we said yes to"], ["Outstanding", "the principal still to be repaid"], ["DPD", "days past due: how late a loan is"], ["Write-off", "giving up on a loan and booking it as a loss"], ["NPL", "non-performing loan: in most rules, more than 90 days past due"]]}
```

Tomorrow: you write your own queries. Keep your P8 note for Thursday's detective case.

> 🎯 **Interview version.** *"Describe how a loan moves through a lending company and where an analyst looks at each step."* Answer with the seven rows above, naming the table and one metric per row.

**Say it like in an interview.** Write your answer the way you would say it — 30 words or more — then compare it with the model.

```task
{"id": "w01d1-iv", "kind": "free", "min": 30, "model": "A loan starts as an application — the applications table, where we watch applications per day by channel. Scoring and rules decide yes or no: the approval rate. An approved loan is disbursed — a row in loans; we track disbursements per month. The borrower repays monthly instalments — installments and payments give the outstanding balance and collection rate. If a payment is late, the loan becomes delinquent; we measure DPD and FPD. Collections remind, call and visit — collections_actions, with contact and cure rates. Finally a loan is closed, or written off and partly recovered — loans.status, with the NPL and write-off rates.", "rubric": ["Names the seven steps in order", "Names the table where each step is recorded", "Gives at least one metric per step (approval rate, disbursements, DPD, write-off rate…)"]}
```

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w01d1", "pass": 0.8, "questions": [
  {"type": "single", "q": "In the loans table, one row is…", "options": ["one customer", "one loan that was actually paid out", "one monthly payment", "one loan application"], "answer": 1, "explain": "Applications are requests; a loan row exists only once money was paid out (section 2)."},
  {"type": "single", "q": "installments.loan_id appears on many rows. What kind of key is it?", "options": ["Primary key", "Foreign key", "Neither — it is just a number", "Both"], "answer": 1, "explain": "It repeats, so it cannot be the primary key; it points to loans.loan_id, so it is a foreign key (P2)."},
  {"type": "multi", "q": "Which of these are 'what happened' tables?", "options": ["payments", "products", "collections_actions", "branches", "applications"], "answer": [0, 2, 4], "explain": "Products and branches describe who/what; payments, actions and applications record events (P1)."},
  {"type": "single", "q": "What is the relationship between customers and loans?", "options": ["one-to-one", "one-to-many", "many-to-many"], "answer": 1, "explain": "One customer can have many loans; each loan belongs to exactly one customer."},
  {"type": "single", "q": "Bekzod asks 'how much are we owed right now?'. Which column is the WRONG one to sum?", "options": ["installments.total_due of unpaid instalments", "loans.principal", "installments.principal_due of future instalments"], "answer": 1, "explain": "Principal is the original amount lent, not what is still owed (P7)."},
  {"type": "number", "q": "Run this query in any SQL box on this page. How many rows does it count?", "code": "SELECT COUNT(*) FROM loans;", "answer": 7828, "explain": "If you got a different number, you changed your practice copy: Database → ↺ Reset brings the original back (section 1)."},
  {"type": "text", "q": "One word: all loans currently outstanding, taken together, are called the…", "answer": ["portfolio", "loan portfolio", "portfolio of loans"], "explain": "Company corner: 'the portfolio grew 4 %' means total outstanding went up."},
  {"type": "single", "q": "A loan whose status is written_off is…", "options": ["fully repaid early", "a loss removed from the live portfolio after a very long delinquency", "a loan the customer cancelled", "a loan moved to another branch"], "answer": 1, "explain": "Written off = we no longer expect the money; it may still be partly recovered later (P6)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w01d1", "q": "Without writing any join yet: how many of the 11 Nur Finance tables have a column called loan_id? (Count the loans table too.)", "type": "number", "dp": 0, "h": ["5ed11dd9bd72633a27942522"], "hint": "Open each table in the Database panel (bottom right) and read its columns. A primary key named loan_id counts as well as a foreign key.", "sol": "NCB0YWJsZXM6IGxvYW5zIChsb2FuX2lkIGlzIGl0cyBwcmltYXJ5IGtleSksIGluc3RhbGxtZW50cywgcGF5bWVudHMgYW5kIGNvbGxlY3Rpb25zX2FjdGlvbnMgKHRoZXJlIGl0IGlzIGEgZm9yZWlnbiBrZXkgcG9pbnRpbmcgYmFjayB0byBsb2FucykuCk5vdCBhcHBsaWNhdGlvbnMgKGEgbG9hbiBwb2ludHMgdG8gaXRzIGFwcGxpY2F0aW9uLCBub3QgdGhlIG90aGVyIHdheSByb3VuZCkgYW5kIG5vdCBhcHBfZXZlbnRzICh0aGV5IHBvaW50IHRvIGFwcGxpY2F0aW9ucykuClRoZSBwYXR0ZXJuIHRvIHJlbWVtYmVyOiB0aGUgJ21hbnknIHNpZGUgY2FycmllcyB0aGUga2V5IG9mIHRoZSAnb25lJyBzaWRlLg=="}
```

<!-- challenge:end -->
