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

### Table, row, column — the three words

**What it is.** A **table** (*таблица*) is a list of things of one kind: all customers, or all loans. A **row** (*строка*) is one thing in that list — one customer. A **column** (*столбец*) is one property that every row has — a birth date, a region. A database built from such tables is a **relational database**. **SQL** is the language you use to ask it questions.

**How to write it.** Today you read tables; you write them from Day 3. Three rows and five of the eleven columns of `customers`:

```pic
{"id": "w01d1-pic1", "title": "A table: rows across, columns down", "caption": "One **row** (green) is one customer: Eldor Olimov. One **column** (circled) is one property that every row has: here the region.", "tables": [{"name": "customers", "cols": ["customer_id", "first_name", "last_name", "region"], "rows": [[1, "Eldor", "Olimov", "Bukhara"], [2, "Sanjar", "Qodirov", "Bukhara"], [3, "Shavkat", "Nazarov", "Samarkand"]], "tone": ["a", null, null], "tags": {"region": "one column"}}]}
```

Press **▶ Run** to see the same three rows with every column:

```sql
SELECT * FROM customers LIMIT 3;
-- * = every column, LIMIT 3 = the first three rows (Day 2 explains both)
```

3 rows, 11 columns. The whole table has 6 040 rows — one per registered customer.

**When you use it.**
- Before you count anything, ask **"what is one row?"** In `customers` one row is a customer; in `payments` it is one payment.
- Before you filter anything, ask **"which column holds it?"**

| | Excel sheet | Database table |
|---|---|---|
| What a column may hold | anything, mixed | one **type** only (next subsection) |
| How a row is named | "row 17", which moves when you sort | a **primary key** that never changes |
| How two sheets connect | copy-paste, VLOOKUP | **foreign keys** |

The same question for another table. `installments` is the **monthly payment schedule** of every loan: what the customer is due to pay, and when. Here are its first four rows:

```pic
{"id": "w01d1-pic5", "title": "installments: the first rows", "caption": "Look at `loan_id` and `due_date`: the same loan on every row, one month apart.", "tables": [{"name": "installments", "cols": ["installment_id", "loan_id", "due_date"], "rows": [[1, 1, "2025-04-28"], [2, 1, "2025-05-28"], [3, 1, "2025-06-28"], [4, 1, "2025-07-28"]], "pk": "installment_id", "fk": ["loan_id"], "tags": {"loan_id": "the same loan"}, "more": "… and so on, month by month"}]}
```

**Your turn.** In the table `installments` (the monthly payment schedule), one row is…

```task
{"id": "w01d1-l1", "kind": "choice", "options": ["one loan", "one scheduled monthly payment of one loan", "one payment that was actually received", "one customer"], "answer": 1, "explain": "installments is the schedule: one row per planned monthly payment, so loan_id repeats. Loan 1 runs 24 months, so it has 24 rows here (the four above are its first). What actually came in lives in another table, payments."}
```

### Data types — one kind of value per column

**What it is.** Every column has a **data type** (*тип данных*): the kind of value it may hold. A number column holds only numbers. A date column holds only dates. Four types cover this course.

| Type | Holds | Nur Finance columns |
|---|---|---|
| **whole number** — `INTEGER` (`INT`, `BIGINT` in SQL Server) | ids, counts, money in UZS | `loan_id`, `principal`, `term_months` |
| **decimal number** — `REAL` (`DECIMAL` in SQL Server) | rates and shares | `annual_rate` (0.3 = 30 % a year) |
| **text** — `TEXT` (`NVARCHAR` in SQL Server) | names, codes, statuses | `status`, `region`, `phone` |
| **date** — stored as text `'YYYY-MM-DD'` here (`DATE` in SQL Server) | days and moments | `disbursed_at`, `applied_at` |

**How to write it.** The **Database** panel shows each column's type to the right of its name. You can also ask the database:

```sql
SELECT loan_id, principal, annual_rate, disbursed_at,
       -- typeof() = SQLite's "what type is this value?"
       typeof(principal), typeof(annual_rate), typeof(disbursed_at)
FROM loans
LIMIT 3;
```

Loan 1: the principal 31 150 000 is an `integer`, the rate 0.3 is a `real`, the date `2025-03-28` is `text`. SQLite keeps dates as text in the order year-month-day. In that order, text sorts and compares like dates.

**When you use it.**
- The type decides what you can do with a column: add up numbers, compare dates, search inside text.
- On Day 3 you choose a type for every column of a table you create.

> ⚠️ **Watch out.** A phone number is **text**, not a number, although it is made of digits. You never add phone numbers up, and the leading `+` must survive.

**Your turn.** Put each column under the type it holds.

```game
{"type": "sort", "id": "w01d1-g4", "title": "Which type?", "q": "Put each column under the type it holds.", "groups": {"Whole number": ["loans.loan_id", "loans.principal", "loans.term_months"], "Decimal number": ["loans.annual_rate", "products.annual_rate"], "Text": ["loans.status", "customers.region", "customers.phone"], "Date (stored as text)": ["loans.disbursed_at", "customers.birth_date"]}}
```

### Primary key — the ID that names exactly one row

**What it is.** A **primary key** (*первичный ключ*, PK) is a column whose value is **different on every row** and **never empty**. It names exactly one row. In `loans` the primary key is `loan_id`; in `customers` it is `customer_id`.

```pic
{"id": "w01d1-pic2", "title": "Same name, three different people", "caption": "Three customers are called Murod Abdullaev. The circled column, the **primary key** `customer_id`, is different on every row and never empty, so each number names exactly one of them.", "tables": [{"name": "customers", "cols": ["customer_id", "first_name", "last_name", "region"], "rows": [[2481, "Murod", "Abdullaev", "Namangan"], [3133, "Murod", "Abdullaev", "Tashkent"], [3710, "Murod", "Abdullaev", "Tashkent"]], "pk": "customer_id", "more": "… 6 037 more rows"}]}
```

**How to write it.** Ask for one value of the primary key, and exactly one row comes back:

```sql
SELECT * FROM loans WHERE loan_id = 1;
-- WHERE keeps only the rows that match (Day 2)
```

1 row — loan 1: customer 3473, product 2, principal 31 150 000, 24 months, paid out on 2025-03-28, status `active`. Every one of the eleven tables has its own primary key. Its name ends in `_id` (in `dim_date`: `date_key`).

**When you use it.**
- To point at one thing without doubt: "loan 4570", not "the big SME loan in Namangan".
- To connect tables — the next subsection.

> ⚠️ **Watch out.** A name is not a key. `customers` has eight rows called *Murod Abdullaev*; only `customer_id` tells them apart. Even phones repeat: 6 040 customer rows hold only 5 997 different phone numbers.

**Your turn.** Which column of `customers` can be its primary key?

```task
{"id": "w01d1-l2", "kind": "choice", "options": ["customer_id", "phone", "last_name", "region"], "answer": 0, "explain": "Only customer_id is different on every row. 6 040 rows hold just 5 997 different phones (families share a number, and some people are in the table twice); surnames and regions repeat on thousands of rows."}
```

### Foreign key — a column that points to another table

**What it is.** A **foreign key** (*внешний ключ*, FK) is a column that stores **another table's primary key**. It is how a row of one table points at a row of another. `loans.customer_id` is a foreign key: it holds the `customer_id` of the person who took the loan.

**How to write it.** Follow the key by hand. The loan row carries a number; that number is the primary key of a row in `customers`.

```pic
{"id": "w01d1-pic3", "title": "Each loan points at its customer", "caption": "`loans.customer_id` is a **foreign key**: it stores a number that is the **primary key** of one row in `customers`. Same colour, same number: loan 1 carries 3473, and customer 3473 is Gulbahor Sobirova.", "tables": [{"name": "loans", "cols": ["loan_id", "customer_id", "principal"], "rows": [[1, 3473, "31 150 000"], [2, 4570, "40 060 000"], [3, 1397, "1 590 000"]], "pk": "loan_id", "fk": ["customer_id"]}, {"name": "customers", "cols": ["customer_id", "first_name", "last_name"], "rows": [[1397, "Sardor", "Abdullaev"], [3473, "Gulbahor", "Sobirova"], [4570, "Nilufar", "Mirzaeva"]], "pk": "customer_id"}], "links": [{"from": ["loans", 0, "customer_id"], "to": ["customers", 1, "customer_id"]}, {"from": ["loans", 1, "customer_id"], "to": ["customers", 2, "customer_id"]}, {"from": ["loans", 2, "customer_id"], "to": ["customers", 0, "customer_id"]}]}
```

Run both boxes — the first reads the key, the second follows it:

```sql
SELECT loan_id, customer_id, product_id, principal FROM loans WHERE loan_id = 1;
```

```sql
SELECT customer_id, first_name, last_name, region FROM customers WHERE customer_id = 3473;
```

Loan 1 carries `customer_id` 3473, and customer 3473 is Gulbahor Sobirova from Termez.

**When you use it.**
- Whenever an answer needs facts from two tables: the amount lives in `loans`, the borrower's name in `customers`.
- Next week a **JOIN** follows the foreign keys for you, for every row at once.

> ⚠️ **Watch out.** A foreign key's name does not always match the key it points to. `applications.officer_id` and `collections_actions.collector_id` both point to `staff.staff_id`.

**Your turn.** Connect each foreign key of `loans` to the table it points to.

```game
{"type": "connect", "id": "w01d1-fk", "title": "Where does a loan point?", "left": {"name": "loans", "cols": ["loan_id", "application_id", "customer_id", "product_id", "branch_id", "principal"]}, "right": {"name": "the tables it points to", "cols": ["customers.customer_id", "applications.application_id", "staff.staff_id", "branches.branch_id", "products.product_id"]}, "links": [["application_id", "applications.application_id"], ["customer_id", "customers.customer_id"], ["product_id", "products.product_id"], ["branch_id", "branches.branch_id"]], "why": "These four are loans' foreign keys. principal is a plain number, and a loan stores no officer."}
```

### One-to-many — the "many" side carries the key

**What it is.** A **one-to-many** relationship (*связь «один ко многим»*) links one row on one side to many rows on the other. One customer can have many loans; one loan belongs to exactly one customer. Write it `customers 1 — ∞ loans`. The foreign key always sits on the **many** side: every loan stores its `customer_id`, and a customer stores no list of loans.

```pic
{"id": "w01d1-pic4", "title": "One customer, many loans", "caption": "All four loans of Gulbahor Sobirova carry 3473. The key sits on the **many** side: `loans` stores the customer, the customer row does not list its loans.", "tables": [{"name": "loans", "cols": ["loan_id", "customer_id", "status"], "rows": [[1, 3473, "active"], [634, 3473, "closed"], [2733, 3473, "written_off"], [2926, 3473, "closed"]], "pk": "loan_id", "fk": ["customer_id"]}, {"name": "customers", "cols": ["customer_id", "first_name", "last_name"], "rows": [[3473, "Gulbahor", "Sobirova"]], "pk": "customer_id"}], "links": [{"from": ["loans", 0, "customer_id"], "to": ["customers", 0, "customer_id"]}, {"from": ["loans", 1, "customer_id"], "to": ["customers", 0, "customer_id"]}, {"from": ["loans", 2, "customer_id"], "to": ["customers", 0, "customer_id"]}, {"from": ["loans", 3, "customer_id"], "to": ["customers", 0, "customer_id"]}]}
```

**How to write it.** Customer 3473's loans are the rows of `loans` that carry 3473:

```sql
SELECT loan_id, customer_id, product_id, principal, status
FROM loans
WHERE customer_id = 3473;
```

4 rows — Gulbahor Sobirova has four loans: one active, two closed, one written off. All four point back to the same one customer.

**When you use it.** There are three kinds of relationship, and Nur Finance has all three.

| Kind | Written | Nur Finance example |
|---|---|---|
| **one-to-many** | `1 — ∞` | `customers 1 — ∞ loans`, `loans 1 — ∞ installments` |
| **one-to-one** (here: one-to-zero-or-one) | `1 — 0..1` | `applications 1 — 0..1 loans`: an application gives at most one loan, a rejected one gives none |
| **many-to-many** | `∞ — ∞`, through a third table | customers and products: a customer can take many products, a product has many customers; each `loans` row records one such pair |

To find the direction, ask: **"can one of these have many of those?"**

**Your turn.** One branch has many employees. Which table carries the key?

```task
{"id": "w01d1-l3", "kind": "choice", "options": ["staff — the column staff.branch_id", "branches — a column branches.staff_id", "both tables", "neither — they are not related"], "answer": 0, "explain": "The many side carries the key of the one side: each employee row stores the branch it works in. A branch row cannot hold a list of employees in one cell."}
```

### Reading a relationship as a sentence

**What it is.** Every foreign key is one sentence about the business. A key `child.fk → parent.pk` reads: **"each child belongs to one parent; a parent can have many children."**

**How to write it.**

| Foreign key | Read it as |
|---|---|
| `loans.customer_id → customers.customer_id` | Each loan belongs to one customer; a customer can have many loans. |
| `installments.loan_id → loans.loan_id` | Each instalment belongs to one loan; a loan has many instalments (its schedule). |
| `payments.installment_id → installments.installment_id` | Each payment is for one instalment; an instalment can receive several payments (part now, the rest later). |
| `applications.officer_id → staff.staff_id` | Each application is handled by one officer; an officer handles many applications. |

The whole database, read as sentences:

- A **customer** submits many **applications**. Each application is for one **product**, at one **branch**, handled by one **officer** (staff).
- An approved application becomes at most one **loan**.
- A loan has many **installments** (its schedule) and receives many **payments**.
- A late loan gets many **collections actions**, each made by one collector (staff).

**When you use it.** Before any question that touches two tables, say the sentence out loud. If the sentence sounds wrong, the key is wrong.

**Your turn.** `collections_actions.loan_id → loans.loan_id`. Which sentence is right?

```task
{"id": "w01d1-l4", "kind": "choice", "options": ["Each action is about one loan; a loan can get many actions", "Each loan has exactly one action", "Each action is about many loans at once", "A loan stores the id of its last action"], "answer": 0, "explain": "The key sits on collections_actions, so that is the many side: one action, one loan; one loan, any number of calls, SMS and visits."}
```

### The eleven tables — who/what and what happened

**What it is.** Nur Finance keeps its data in eleven tables of two kinds:

- **Who/what tables** describe things: a customer, a product, a branch, an employee, a calendar day. They are short and change rarely.
- **What-happened tables** record events, usually with a date: an application, a loan paid out, a scheduled instalment, a payment, a collections action, a tap in the app. They are long, and grow every time something happens.

Almost every company's data has this shape. On Day 4 you learn its warehouse name: *dimensions and facts*.

**How to write it.** The map. Open the **Database** panel next to it and find each table.

| Table | Kind | One row is… | Primary key | Points to (FK) |
|---|---|---|---|---|
| `customers` | who/what | one person | `customer_id` | — |
| `products` | who/what | one loan product (Micro, Consumer, BNPL, Auto, SME) | `product_id` | — |
| `branches` | who/what | one office | `branch_id` | — |
| `staff` | who/what | one employee | `staff_id` | `branch_id` |
| `dim_date` | who/what | one calendar day | `date_key` | — |
| `applications` | what happened | one request for a loan | `application_id` | `customer_id`, `product_id`, `branch_id`, `officer_id → staff` |
| `loans` | what happened | one loan that was actually paid out | `loan_id` | `application_id`, `customer_id`, `product_id`, `branch_id` |
| `installments` | what happened | one scheduled monthly payment of a loan | `installment_id` | `loan_id` |
| `payments` | what happened | one real payment received | `payment_id` | `loan_id`, `installment_id` |
| `collections_actions` | what happened | one SMS / call / visit to a late borrower | `action_id` | `loan_id`, `collector_id → staff` |
| `app_events` | what happened | one tap in the mobile app | `event_id` | `customer_id`, `application_id` |

```sql
SELECT COUNT(*) FROM payments;
-- change the table name to count the rows of any of the eleven
```

52 875 rows — one per payment received. `products` has 5 rows. What-happened tables are long; who/what tables are short.

**When you use it.** Every question starts on this map: find the table where **one row is the thing you count**.

**Your turn.** Flip through the eleven tables until you know each one: what one row is, and where it points.

```game
{"type": "flash", "id": "w01d1-g2", "title": "The eleven tables", "cards": [["customers", "one person who borrows · PK customer_id · points to nothing"], ["products", "one loan product: Micro, Consumer, BNPL, Auto, SME · PK product_id"], ["branches", "one office · PK branch_id"], ["staff", "one employee · PK staff_id · points to branches"], ["applications", "one request for a loan · points to customers, products, branches and the officer in staff"], ["loans", "one loan that was actually paid out · points to its application, customer, product and branch"], ["installments", "one scheduled monthly payment of a loan · points to loans"], ["payments", "one real payment received · points to the loan and the instalment it was for"], ["collections_actions", "one SMS, call or visit to a late borrower · points to the loan and the collector in staff"], ["app_events", "one tap in the mobile app · points to the customer and the application"], ["dim_date", "one calendar day · PK date_key · the calendar every date can join to"]]}
```

### The loan lifecycle in the tables

**What it is.** The **loan lifecycle** (*жизненный цикл кредита*) is the path of one loan from the first request to the last payment. Each step leaves rows in a what-happened table.

**How to write it.** The path as a picture:

```text
customers           who
   │
   ▼
applications        the request
   │
   │ approved
   ▼
loans               paid out
   ├──▶ installments
   │      the schedule: what is due
   ├──▶ payments
   │      what came in
   └──▶ collections_actions
          if a payment is late
```

- `applications.status`: approved · approved_not_disbursed · rejected · cancelled
- `loans.status`: active · closed · default · written_off

Loan 1 started as application 2. The first step of its lifecycle:

```sql
SELECT application_id, customer_id, applied_at, status FROM applications WHERE application_id = 2;
```

1 row: customer 3473 applied on 2025-03-23 at 17:00, status `approved`. Five days later, on 2025-03-28, loan 1 was paid out. The Worked example below follows it through the next steps.

**When you use it.** Every lending question sits at one step of the path:
- "How many people applied?" → `applications`.
- "How much did we pay out?" → `loans`.
- "Who is late?" → `installments` and `payments`.

The Company corner adds the metric people watch at each step.

**Your turn.** Match each step to the table that records it.

```game
{"type": "match", "id": "w01d1-g5", "title": "Which table records the step?", "pairs": [["A customer asks for money", "applications"], ["We pay the money out", "loans"], ["The monthly schedule is set", "installments"], ["Money comes in", "payments"], ["A collector calls a late borrower", "collections_actions"]]}
```

### Putting it together

Read loan 1 with every idea from this section:

1. `loans` is a what-happened **table**; one **row** is one loan. Its **columns** have **types**: `principal` is a whole number, `disbursed_at` a date.
2. `loan_id = 1` is the **primary key**: exactly one row.
3. `customer_id = 3473` is a **foreign key**: it points to one row of `customers`.
4. `customers 1 — ∞ loans` is **one-to-many**: Gulbahor Sobirova has four loans. As a sentence: each loan belongs to one customer.
5. On the **lifecycle**: application 2 → loan 1 → 24 instalments → 18 payments so far.

**Your turn.** The five words of the day, one last time.

```game
{"type": "match", "id": "w01d1-terms", "title": "Words of the day", "pairs": [["Table", "a list of things of one kind (all customers)"], ["Row", "one thing in that list (one customer)"], ["Column", "one property every row has (birth date)"], ["Primary key", "the ID that names exactly one row"], ["Foreign key", "a column that stores another table's ID"]]}
```

### Lab — a table of your own

**What this is.** A first touch of the four commands that build and change a table. You learn each one properly on **Day 3**; today you only run them and watch a table appear under **Your tables** in the Database panel. Your own tables always start with `my_`, so they never mix with the company's.

What each step's **💡 Show me** gives you, read in one line:

| Step | 💡 Show me gives | Read it as |
|---|---|---|
| 1 | `CREATE TABLE my_branches (branch_id INTEGER PRIMARY KEY, name TEXT, region TEXT);` | Make an empty table with three columns: `branch_id` (a whole number, the primary key), `name` and `region` (text). |
| 2 | `INSERT INTO my_branches (branch_id, name, region) VALUES (1, 'Chilonzor', 'Tashkent'), …;` | Add rows: name the columns, then one bracket of values per row, in the same order. |
| 3 | `UPDATE my_branches SET region = 'Fergana' WHERE branch_id = 3;` | Set the region to 'Fergana' — only on the row whose id is 3. |
| 4 | `DELETE FROM my_branches WHERE region = 'Fergana';` then `SELECT * FROM my_branches;` | Remove the rows whose region is 'Fergana', then show what is left. |

```sqllab
{"id": "w01d1-lab", "title": "Your first table", "intro": "Madina wants a short list of branches to practise on. Build it, fill it, fix it — and watch it appear under **Your tables** in the Database panel.", "steps": [
  {"say": "Create an empty table `my_branches` with three columns: `branch_id` (a whole number and the primary key), `name` and `region` (text). (If a `my_branches` from the SQL playground is still there, run `DROP TABLE my_branches;` first.)", "hint": "CREATE TABLE my_branches (branch_id INTEGER PRIMARY KEY, name TEXT, region TEXT);", "expect": "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'my_branches'", "want": 1},
  {"say": "Insert three branches with ids 1, 2 and 3 — in Tashkent, Samarkand and Bukhara (none in Fergana yet).", "hint": "INSERT INTO my_branches (branch_id, name, region) VALUES\n  (1, 'Chilonzor', 'Tashkent'),\n  (2, 'Registan', 'Samarkand'),\n  (3, 'Old Town', 'Bukhara');", "expect": "SELECT COUNT(*) FROM my_branches", "want": 3},
  {"say": "Branch 3 moved: change its `region` to 'Fergana'. Change only that row.", "hint": "UPDATE my_branches SET region = 'Fergana' WHERE branch_id = 3;", "expect": "SELECT COUNT(*) FROM my_branches WHERE region = 'Fergana'", "want": 1},
  {"say": "The Fergana branch closed. Delete that one row, then look at what is left with `SELECT * FROM my_branches;`.", "hint": "DELETE FROM my_branches WHERE region = 'Fergana';\nSELECT * FROM my_branches;", "expect": "SELECT COUNT(*) * 10 + COALESCE(SUM(region = 'Fergana'), 0) FROM my_branches", "want": 20}],
 "cleanup": "DROP TABLE IF EXISTS my_branches"}
```

**The primary key at work.** In the lab editor, run `INSERT INTO my_branches VALUES (1, 'Again', 'Nukus');`. The database refuses with *UNIQUE constraint failed*: a second row with id 1 would break "one id, one row".

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

Madina asks: *"Loan 1 — tell me its story in one sentence."* You do not write SQL yet: every step has a ready-made query. Press **▶ Run**, read the row, and follow the keys from table to table. Each step names the idea from Learn that it uses.

**Step 1 — a row, found by its primary key.** In `loans`, the row with `loan_id = 1`. Note `customer_id`, `product_id`, `principal`, `term_months`, `disbursed_at`, `status`.

```sql
SELECT * FROM loans WHERE loan_id = 1;
```

**Step 2 — a foreign key, followed.** `customer_id` is 3473. In `customers`, row 3473 gives the name, region and segment.

```sql
SELECT * FROM customers WHERE customer_id = 3473;
```

**Step 3 — a second foreign key.** `product_id` is 2. In `products`, row 2 gives the product's name.

```sql
SELECT * FROM products WHERE product_id = 2;
```

**Step 4 — one-to-many: the schedule.** In `installments`, every row with `loan_id = 1`. How many are there? What is the first `due_date`?

```sql
SELECT * FROM installments WHERE loan_id = 1;
```

**Step 5 — one-to-many again, at the lifecycle step "repayment".** In `payments`, every row with `loan_id = 1`. How many are there? Was any paid later than its due date?

```sql
SELECT * FROM payments WHERE loan_id = 1;
```

Sentence shape: *"[Name] from [region] took a [product] of [principal] for [term] months on [date]; [n] of [term] instalments are paid, the loan is [status]."* You write the real sentence in tonight's homework.

That chain — a what-happened row → a key → a who/what row → back along a key to the next what-happened table — is 80 % of what SQL does for you. Tomorrow you write such queries yourself; next week one query walks the whole chain.

---

## 4. Practice (60 min)

Every question has its own answer box: answer, tap **Check**, read why. Your answers are saved in this browser, and the section ticks off when every box is done. Try before you look — the explanation appears only after you answer. The questions follow the order of Learn; the label in italics names the idea each one trains.

Run this ready-made query — the 60 newest customer rows, newest first. Scroll through the result:

```sql
SELECT * FROM customers ORDER BY customer_id DESC LIMIT 60;
```

**P1.** *(table, row, column)* Write down two things that look *wrong* to you in these rows, and the column each one is in. Keep the note — Thursday is detective day.

```task
{"id": "w01d1-p8", "kind": "free", "min": 10, "model": "Any two of: first names in CAPITALS (MALIKA, LOLA); surnames all in lower case; a first name with a trailing space ('Bobur '); what looks like the same person as an older customer; a registration date after the data's as-of date (2026-10-01); empty monthly_income cells elsewhere in the table.", "rubric": ["Names a concrete oddity you can point at", "Says which column it is in"]}
```

**P2.** *(data types)* `customers.monthly_income` holds 3894708 for customer 1, and `customers.phone` holds +998902031105. What types are they?

```task
{"id": "w01d1-l5", "kind": "choice", "options": ["monthly_income is a whole number; phone is text — you never calculate with a phone, and its leading + must survive", "Both are whole numbers — both are made of digits", "Both are text", "monthly_income is a date"], "answer": 0, "explain": "Income is an amount you add up and compare, so it is a number (INTEGER, whole UZS). A phone is an identifier written with digits: it is text, like a passport number."}
```

**P3.** *(primary key and foreign key)* `installments` has a column `loan_id`. Is it a primary key or a foreign key — and how do you know without opening the data?

```task
{"id": "w01d1-p2", "kind": "choice", "options": ["A primary key — every instalment row has a loan_id", "A foreign key — a loan has many instalments, so the same loan_id repeats on many rows and cannot be unique", "Neither — it is just a number", "Both at once"], "answer": 1, "explain": "A primary key must be unique; loan_id repeats once per instalment, so it cannot be one. It points to loans.loan_id, which makes it a foreign key. The primary key of installments is installment_id."}
```

**P4.** *(one-to-many, read as a sentence)* Which pairs of tables are one-to-many? Tick every true `A 1 — ∞ B`.

```task
{"id": "w01d1-p3", "kind": "multi", "options": ["customers 1 — ∞ loans", "loans 1 — ∞ installments", "applications 1 — ∞ loans", "branches 1 — ∞ staff", "loans 1 — ∞ customers", "loans 1 — ∞ payments", "products 1 — ∞ loans"], "answer": [0, 1, 3, 5, 6], "explain": "The many side holds the key: loans.customer_id, installments.loan_id, staff.branch_id, payments.loan_id, loans.product_id. 'loans 1 — ∞ customers' is the wrong way round, and an application produces at most one loan (P5). Others you could add: customers 1 — ∞ applications, loans 1 — ∞ collections_actions, applications 1 — ∞ app_events."}
```

**P5.** *(one-to-one)* Is `applications → loans` one-to-many or one-to-one? Think about the business, not the data.

```task
{"id": "w01d1-p4", "kind": "choice", "options": ["One-to-many: one application can produce several loans", "One-to-one (or one-to-zero): one application produces at most one loan, and a rejected one produces none", "Many-to-many: a loan can come from several applications"], "answer": 1, "explain": "A customer asks once, we decide once, we pay out once. A rejected or cancelled application produces no loan at all — so loans.application_id is unique: each value appears at most once."}
```

**P6.** *(the eleven tables: who/what and what happened)* Which tables are "what happened" (event) tables? Tick all of them.

```task
{"id": "w01d1-p1", "kind": "multi", "options": ["customers", "products", "branches", "staff", "applications", "loans", "installments", "payments", "collections_actions", "app_events", "dim_date"], "answer": [4, 5, 6, 7, 8, 9], "explain": "Each event table records something that happened, usually with a date: an application, a loan paid out, a scheduled instalment, a payment, a collections action, an app tap. Who/what tables describe things: customers, products, branches, staff, and the calendar dim_date."}
```

**P7.** *(the eleven tables as a map)* Which table, and which column, would answer each question?
a) "How many people applied through the app last month?"
b) "What is the total amount we are owed?"
c) "How many calls did collectors make in Fergana?"

```task
{"id": "w01d1-p7", "kind": "free", "min": 20, "model": "a) applications: channel = 'app' and applied_at in last month.\nb) installments (total_due) minus payments (amount) — two tables. Not loans.principal: that is the amount lent on day one, not what is owed now.\nc) collections_actions with action_type = 'call', joined to staff (the collector) and then branches (region = 'Fergana').", "rubric": ["a) applications, with channel and applied_at", "b) the schedule minus the payments — and not loans.principal", "c) collections_actions, reaching the region through staff and branches"]}
```

Run this ready-made query — it lists every different value of `status` in `applications` (tomorrow you learn to write it):

```sql
SELECT DISTINCT status FROM applications;
```

**P8.** *(the loan lifecycle: the decision)* Four statuses come back. Which one means *"we said yes, but the customer never took the money"*?

```task
{"id": "w01d1-p5", "kind": "choice", "options": ["approved", "approved_not_disbursed", "rejected", "cancelled"], "answer": 1, "explain": "approved = we said yes and paid out, so there is a loan; approved_not_disbursed = we said yes, the customer never took it; rejected = we said no; cancelled = the customer withdrew before a decision."}
```

**P9.** *(the loan lifecycle: write-off)* `loans.status` has a value `written_off`. In your own words: what happened to such a loan?

```task
{"id": "w01d1-p6", "kind": "free", "min": 15, "model": "The borrower stopped paying for so long (here more than 180 days) that the company no longer expects the money. It removed the loan from the live portfolio and booked it as a loss. Some of it may still be collected later (recovery).", "rubric": ["The borrower stopped paying for a very long time", "The company no longer expects the money and books it as a loss, outside the live portfolio", "Some money may still be recovered later"]}
```

> 🚀 **Stretch (optional, +5 XP).** **P10.** *(reading relationships)* Draw the eleven tables as boxes and the relationships as lines, on paper or in https://dbdiagram.io (free, no login needed to try). Then write your lines below, one per line, as `A 1 — ∞ B`. You will compare them with the real diagram on Day 3.

```task
{"id": "w01d1-p9", "kind": "free", "min": 25, "model": "customers 1 — ∞ applications · products 1 — ∞ applications · branches 1 — ∞ applications · staff 1 — ∞ applications (officer) · applications 1 — 0..1 loans · customers 1 — ∞ loans · products 1 — ∞ loans · branches 1 — ∞ loans · loans 1 — ∞ installments · loans 1 — ∞ payments · installments 1 — ∞ payments · loans 1 — ∞ collections_actions · staff 1 — ∞ collections_actions (collector) · branches 1 — ∞ staff · customers 1 — ∞ app_events · applications 1 — ∞ app_events", "rubric": ["Every foreign key in the map of the eleven tables became a line", "Each line runs from the one side to the many side", "applications → loans is drawn as one-to-zero-or-one"]}
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
  {"type": "single", "q": "A column whose value must be unique on every row, and never empty, is the…", "options": ["foreign key", "primary key", "first column", "row number"], "answer": 1, "explain": "The primary key names exactly one row; a foreign key repeats freely (→ section 2, Primary key)."},
  {"type": "single", "q": "Bekzod asks 'how much are we owed?'. Why is the total of loans.principal the wrong answer?", "options": ["principal is what was lent on day one, not what is still unpaid", "principal is stored in dollars", "loans has no principal column", "SQL cannot add up money"], "answer": 0, "explain": "What is owed comes from the schedule minus the payments; principal never changes after disbursement (→ P7)."},
  {"type": "single", "q": "A customer's application was rejected. Where does it leave a trace?", "options": ["In applications only — no loan row is ever created", "In loans only", "In both applications and loans", "Nowhere — rejected applications are deleted"], "answer": 0, "explain": "A loan row exists only once money is paid out; the application keeps its status 'rejected' (→ section 2, The loan lifecycle; P5)."}
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

Tomorrow: you write your own queries. Keep your P1 note for Thursday's detective case.

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
  {"type": "single", "q": "In the loans table, one row is…", "options": ["one customer", "one loan that was actually paid out", "one monthly payment", "one loan application"], "answer": 1, "explain": "Applications are requests; a loan row exists only once money was paid out (→ section 2, The eleven tables)."},
  {"type": "single", "q": "installments.loan_id appears on many rows. What kind of key is it?", "options": ["Primary key", "Foreign key", "Neither — it is just a number", "Both"], "answer": 1, "explain": "It repeats, so it cannot be the primary key; it points to loans.loan_id, so it is a foreign key (→ P3)."},
  {"type": "multi", "q": "Which of these are 'what happened' tables?", "options": ["payments", "products", "collections_actions", "branches", "applications"], "answer": [0, 2, 4], "explain": "Products and branches describe who/what; payments, actions and applications record events (→ P6)."},
  {"type": "single", "q": "What is the relationship between customers and loans?", "options": ["one-to-one", "one-to-many", "many-to-many"], "answer": 1, "explain": "One customer can have many loans; each loan belongs to exactly one customer (→ section 2, One-to-many)."},
  {"type": "single", "q": "Bekzod asks 'how much are we owed right now?'. Which column is the WRONG one to sum?", "options": ["installments.total_due of unpaid instalments", "loans.principal", "installments.principal_due of future instalments"], "answer": 1, "explain": "Principal is the original amount lent, not what is still owed (→ P7)."},
  {"type": "number", "q": "Run this query in any SQL box on this page. How many rows does it count?", "code": "SELECT COUNT(*) FROM loans;", "answer": 7828, "explain": "If you got a different number, you changed your practice copy: Database → ↺ Reset brings the original back (section 1)."},
  {"type": "text", "q": "One word: all loans currently outstanding, taken together, are called the…", "answer": ["portfolio", "loan portfolio", "portfolio of loans"], "explain": "Company corner: 'the portfolio grew 4 %' means total outstanding went up."},
  {"type": "single", "q": "A loan whose status is written_off is…", "options": ["fully repaid early", "a loss removed from the live portfolio after a very long delinquency", "a loan the customer cancelled", "a loan moved to another branch"], "answer": 1, "explain": "Written off = we no longer expect the money; it may still be partly recovered later (→ P9)."}
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
