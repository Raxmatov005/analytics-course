# Week 1 · Day 3 — Tables that talk to each other

<span class="badge">Learn 60 min</span> <span class="badge">Practice 60 min</span> <span class="badge company">Company corner</span>

> STORY **Wednesday, 9:40.** Sevara, head of collections (*взыскание*), arrives with a laptop and a spreadsheet called `loans_FINAL_v7.xlsx`. *"Before the database existed, this was the database. One row per loan, and every time a borrower asked to restructure we added three more columns. It has 212 columns now. Timur from BI says it's 'not normalised'. I don't know what that means; I know that when a branch changes its phone number I have to fix 400 cells."* Madina: *"Today you learn what Timur meant — and you design Sevara a proper table for restructurings."*

## Today in 3 lines

- You can read the **Nur Finance ER diagram** as a list of tables and relationships, and say what each key enforces.
- You can explain **1NF, 2NF, 3NF** on Sevara's spreadsheet and show how it splits into our tables.
- You can **CREATE** a table with types, `PRIMARY KEY`, `NOT NULL`, `UNIQUE` and `FOREIGN KEY`, then **INSERT**, **UPDATE**, **DELETE**, **ALTER** and **DROP** it — on tables of your own, never on the course tables — and you know what `WHERE` does and does not protect you from.

---

## 1. Learn — keys, the diagram, and normal forms

This section has three parts, in this order: **keys** (what each one refuses), **the diagram and the normal forms** (how good tables are cut), and **the six commands** that create, fill, change and remove a table. The boxes run on **your practice copy** of the database, so every command here is safe to try. Tables you make are called `my_…` and appear under **Your tables** in the Database panel.

### Primary key — one value per row, never repeated

**What it is.** On Monday a **primary key** (*первичный ключ*, PK) was "the ID that names one row". One level deeper: a primary key is a **constraint** (*ограничение*) — a rule the database enforces. It refuses a second row with the same value.

**How to write it.** Inside `CREATE TABLE`, after the column's type. Press **▶ Run** — you write `CREATE TABLE` yourself further down; here only watch what the key does.

```sql
-- IF NOT EXISTS: skip this if the table is already there
CREATE TABLE IF NOT EXISTS my_keys_demo (
    customer_id INTEGER PRIMARY KEY,  -- the primary key
    -- must be filled (next subsection)
    first_name  TEXT    NOT NULL,
    -- no two rows with one phone (the one after)
    phone       TEXT    UNIQUE
);
INSERT INTO my_keys_demo VALUES (1, 'Gulbahor', '+998907579830');
INSERT INTO my_keys_demo VALUES (1, 'Aziz', '+998901112233');
-- id 1 again: refused
```

The box ends in red: *UNIQUE constraint failed: my_keys_demo.customer_id*. That refusal is the point — a second customer 1 cannot exist. Open **Database → Your tables → my_keys_demo**: one row, and a **PK** badge next to `customer_id`.

**When you use it.**
- Every table gets one primary key. Check a candidate on real data: as many different values as rows.
- Two kinds of key value:

| | Natural key | Surrogate key (*суррогатный ключ*) |
|---|---|---|
| What it is | a value that means something in the world | a number the database invents |
| Example | a passport number, a phone | `customer_id = 4516` |
| Changes? | yes — people change passports and phones | never |
| Used as the PK? | rarely; kept as an ordinary column | almost always |

```sql
SELECT COUNT(*) AS total_rows, COUNT(DISTINCT loan_id) AS different_ids FROM loans;
-- a ready-made check (COUNT(DISTINCT) is Week 2)
```

7 828 rows and 7 828 different `loan_id`s: every value appears once, so `loan_id` can be the primary key.

> ⚠️ **Watch out.** In SQLite, an `INTEGER PRIMARY KEY` left empty is filled in for you with the next number. Other primary keys must be filled by you — write `NOT NULL` next to them.

**Your turn.** `payments` has 52 875 rows and 52 850 different `installment_id`s. Can `payments.installment_id` be its primary key?

```task
{"id": "w01d3-l1", "kind": "choice", "options": ["No — 25 values repeat, because some instalments were paid in two parts", "Yes — almost every value is different", "Yes — every payment has an instalment", "No — a primary key cannot be a number"], "answer": 0, "explain": "A primary key allows no repeats at all. 52 875 − 52 850 = 25 instalments received a second payment. The primary key of payments is payment_id."}
```

### NOT NULL — a value must be there

**What it is.** **NOT NULL** is a constraint on one column: the cell may not be empty. An insert that leaves the column out is refused.

**How to write it.** After the column's type: `first_name TEXT NOT NULL`.

```sql
CREATE TABLE IF NOT EXISTS my_keys_demo (customer_id INTEGER PRIMARY KEY, first_name TEXT NOT NULL, phone TEXT UNIQUE);
INSERT INTO my_keys_demo (customer_id, phone) VALUES (2, '+998901112233');
-- no first_name: refused
```

*NOT NULL constraint failed: my_keys_demo.first_name* — a customer without a first name is not accepted.

**When you use it.** On every column that must be known **at the moment the row is written**: the loan of a payment, the date of an application, a status. Leave it off a column that is honestly unknown at first: a decision date while the application waits, an income nobody reported.

**Your turn.** For a new `loans` table, which columns should be NOT NULL?

```task
{"id": "w01d3-l2", "kind": "multi", "options": ["customer_id", "principal", "disbursed_at", "status", "closed_at"], "answer": [0, 1, 2, 3], "explain": "A loan cannot exist without a customer, an amount, a pay-out date and a status. closed_at stays empty until the loan is closed — 3 601 loans have no closing date today."}
```

### UNIQUE — no two rows share a value

**What it is.** **UNIQUE** is a constraint on a column that is not the primary key: no two rows may hold the same value in it. A primary key is UNIQUE and NOT NULL at once.

**How to write it.** After the column's type: `phone TEXT UNIQUE`.

```sql
CREATE TABLE IF NOT EXISTS my_keys_demo (customer_id INTEGER PRIMARY KEY, first_name TEXT NOT NULL, phone TEXT UNIQUE);
INSERT INTO my_keys_demo VALUES (3, 'Aziz',    '+998905550000');
INSERT INTO my_keys_demo VALUES (4, 'Dilnoza', '+998905550000');
-- the same phone again: refused
```

*UNIQUE constraint failed: my_keys_demo.phone*.

**When you use it.** For a second identifier that must not repeat: a tax number, a contract number, `loans.application_id` (one application gives at most one loan).

> ⚠️ **Watch out.** Put UNIQUE only on what is truly unique in the business. In `customers`, 6 040 rows hold 5 997 different phones: families share a number. A UNIQUE phone would refuse real people. (Some of the 43 repeats are not families — Thursday's case.)

**Your turn.** Which constraint enforces the rule "one application gives at most one loan"?

```task
{"id": "w01d3-l3", "kind": "choice", "options": ["UNIQUE on loans.application_id", "NOT NULL on loans.application_id", "PRIMARY KEY on applications.status", "UNIQUE on loans.customer_id"], "answer": 0, "explain": "If application_id may appear only once in loans, no application can produce a second loan. UNIQUE on customer_id would forbid a customer's second loan — wrong."}
```

### Foreign key — the value must exist in the parent

**What it is.** A **foreign key** (*внешний ключ*, FK) as a constraint enforces **referential integrity** (*ссылочная целостность*): the data cannot point at nothing. It refuses two things:
1. a child row whose key value does not exist in the parent (a loan for customer 999999);
2. deleting a parent that still has children (unless the design says *cascade*).

It allows a parent with many children — that is one-to-many — and a parent with none.

**How to write it.** At the end of `CREATE TABLE`: `FOREIGN KEY (column) REFERENCES parent_table(parent_key)`. The parent column must be its table's PRIMARY KEY (or UNIQUE).

```sql
PRAGMA foreign_keys = ON;
-- SQLite checks foreign keys only after this line, in the same box
CREATE TABLE IF NOT EXISTS my_keys_demo (customer_id INTEGER PRIMARY KEY, first_name TEXT NOT NULL, phone TEXT UNIQUE);
CREATE TABLE IF NOT EXISTS my_loans_demo (
    loan_id     INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    -- the customer must exist
    FOREIGN KEY (customer_id) REFERENCES my_keys_demo(customer_id)
);
INSERT INTO my_loans_demo VALUES (1, 999999);
-- customer 999999 does not exist: refused
```

*FOREIGN KEY constraint failed*. `my_loans_demo` stays empty.

**When you use it.** On every column that points to another table: `loans.customer_id`, `installments.loan_id`, `payments.installment_id`.

> ⚠️ **Watch out.** The course tables are a teaching copy loaded from CSV files. They declare **no** PRIMARY KEY or FOREIGN KEY, so nothing in them would refuse a bad row. The joins work because the data is consistent, not because the engine checks it. And SQLite skips foreign-key checks unless `PRAGMA foreign_keys = ON` runs first; SQL Server always checks.

**Your turn.** With the foreign key above switched on, which insert into `my_loans_demo` is refused?

```task
{"id": "w01d3-l4", "kind": "choice", "options": ["A loan for a customer_id that is not in my_keys_demo", "A second loan for customer 1", "A loan for customer 1 when customer 1 has no other loans", "None — a foreign key only documents the link"], "answer": 0, "explain": "The FK protects the child from pointing at nothing. Many loans per customer are allowed (one-to-many), and so is a customer's first loan."}
```

### Composite key — two columns together

**What it is.** A **composite key** (*составной ключ*) is a primary key made of two or more columns. Each column alone may repeat; the **pair** must not.

```pic
{"id": "w01d3-pic2", "title": "Two columns, one key", "caption": "`loan_id` repeats (1, 1) and `installment_no` repeats (1, 1); the **pair** — (1, 1), (1, 2), (2, 1), (2, 2) — is different on every row.", "tables": [{"name": "installments", "cols": ["loan_id", "installment_no", "due_date"], "pk": ["loan_id", "installment_no"], "rows": [[1, 1, "2025-04-28"], [1, 2, "2025-05-28"], [2, 1, "2026-01-05"], [2, 2, "2026-02-05"]], "tone": ["a", "a", "b", "b"], "more": "… 24 months per loan"}]}
```

**How to write it.** A separate line at the end: `PRIMARY KEY (column1, column2)`.

```sql
CREATE TABLE IF NOT EXISTS my_schedule_demo (
    loan_id        INTEGER NOT NULL,
    installment_no INTEGER NOT NULL,
    due_date       TEXT    NOT NULL,
    PRIMARY KEY (loan_id, installment_no)  -- the pair is the key
);
INSERT INTO my_schedule_demo VALUES (1, 1, '2025-04-28'), (1, 2, '2025-05-28'), (2, 1, '2026-01-05');
-- loan 1 twice, number 1 twice: fine
INSERT INTO my_schedule_demo VALUES (1, 2, '2025-06-28');
-- the pair (1, 2) again: refused
```

The first insert adds three rows: loan 1 appears twice and instalment number 1 appears twice, but every pair is new. The second is refused: loan 1 already has an instalment number 2.

**When you use it.** When a row is named by two things together: an instalment by (loan, number), a day's balance by (loan, date). In practice designers often add a one-column **surrogate** key instead — `installments.installment_id` — because one column is easier to point at.

**Your turn.** In `installments`, the pair `(loan_id, installment_no)` is unique on all 92 193 rows. What does that tell you?

```task
{"id": "w01d3-l5", "kind": "choice", "options": ["The pair could be the primary key; each column alone could not", "loan_id alone could be the primary key", "installment_no alone could be the primary key", "The table needs no key"], "answer": 0, "explain": "loan_id repeats once per instalment and installment_no repeats once per loan; only together are they unique. The designers still chose the one-column surrogate installment_id."}
```

### Reading the ER diagram

**What it is.** An **entity-relationship diagram** (ER diagram, *ER-диаграмма*) is the floor plan of a database: one box per table (an **entity**), one line per foreign key (a **relationship**), with its **cardinality** — how many rows on each side.

**How to write it.** Lines run from the one side to the many side. `1 — ∞` is one-to-many; `1 — 0..1` is one-to-at-most-one.

```text
customers ─┐
products  ─┤
branches  ─┼─1──∞─▶ applications ─1──0..1─▶ loans ─1──∞─▶ installments ─1──∞─▶ payments
staff     ─┘ (officer)                        │
                                              └─1──∞─▶ collections_actions ◀─∞──1─ staff (collector)
branches ─1──∞─▶ staff
```

Not drawn, to keep the picture readable: `loans` also points straight to `customers`, `products` and `branches`, and `payments` also points to `loans`. The list has every line.

The same diagram as a list (compare it with your Day-1 P10 sketch):

| Relationship | Cardinality | Key column |
|---|---|---|
| customers → applications | 1 — ∞ | `applications.customer_id` |
| products → applications | 1 — ∞ | `applications.product_id` |
| branches → applications | 1 — ∞ | `applications.branch_id` |
| staff → applications (officer) | 1 — ∞ | `applications.officer_id` |
| applications → loans | 1 — 0..1 | `loans.application_id`, unique |
| customers → loans | 1 — ∞ | `loans.customer_id` |
| products → loans | 1 — ∞ | `loans.product_id` |
| branches → loans | 1 — ∞ | `loans.branch_id` |
| loans → installments | 1 — ∞ | `installments.loan_id` |
| loans → payments | 1 — ∞ | `payments.loan_id` |
| installments → payments | 1 — ∞ | `payments.installment_id` |
| loans → collections_actions | 1 — ∞ | `collections_actions.loan_id` |
| staff → collections_actions (collector) | 1 — ∞ | `collections_actions.collector_id` |
| branches → staff | 1 — ∞ | `staff.branch_id` |
| customers → app_events, applications → app_events | 1 — ∞ | two keys |
| dim_date → (any date column) | 1 — ∞ | by convention, not a declared key |

**When you use it.** Before a query that crosses tables, find the path on the diagram. `payments` has *two* keys into the loan world (the loan and the instalment), so you can see partial and late payments per instalment.

**Your turn.** Connect each child column to the parent key it points at.

```game
{"type": "connect", "id": "w01d3-g1", "title": "Child column → parent key", "left": {"name": "child columns (FK)", "cols": ["payments.installment_id", "collections_actions.collector_id", "staff.branch_id", "loans.application_id", "installments.loan_id"]}, "right": {"name": "parent keys (PK)", "cols": ["installments.installment_id", "staff.staff_id", "branches.branch_id", "applications.application_id", "loans.loan_id", "customers.customer_id"]}, "links": [["payments.installment_id", "installments.installment_id"], ["collections_actions.collector_id", "staff.staff_id"], ["staff.branch_id", "branches.branch_id"], ["loans.application_id", "applications.application_id"], ["installments.loan_id", "loans.loan_id"]], "why": "Every FK points at the parent's PK; the name does not always match (collector_id → staff.staff_id). Nothing on the left points at customers here."}
```

### Normalisation — one fact, one place

**What it is.** **Normalisation** (*нормализация*) is the procedure that cuts data into tables so that **each fact is stored once**. When a fact is stored in many cells, three **anomalies** (*аномалии*) appear:

| Anomaly | What goes wrong | In Sevara's sheet |
|---|---|---|
| **update** | a change must be made in many cells, and some get missed | a branch gets a new phone: 400 cells to fix, 12 missed |
| **insert** | you cannot record one fact without another | a new branch cannot be recorded until it has a loan |
| **delete** | removing one fact removes another | delete a branch's last loan, and the branch's phone is gone |

**How to write it.** Here are eight of the 212 columns of Sevara's `loans_FINAL_v7.xlsx`, two rows:

| loan_id | customer | phone | product | rate | branch_phone | inst1_due | inst1_paid | inst2_due | inst2_paid | … |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Kamola Saidova | +99890… | Consumer loan | 0.30 | 71-200-01-01 | 2025-04-28 | 2025-04-27 | 2025-05-28 | 2025-05-30 | … |
| 2 | Kamola Saidova | +99890… | Consumer loan | 0.30 | 71-200-01-01 | 2025-12-05 | 2026-01-05 | 2026-01-05 | | … |

The customer, the product's rate and the branch's phone are repeated on every row. The three **normal forms** (*нормальные формы*) below each remove one kind of repetition.

**When you use it.** When you design a table (Sevara's restructurings below) and when you read someone else's spreadsheet: count how many cells you would change for one real-world change.

**Your turn.** "When Tashkent Central gets a new phone, Sevara fixes 400 cells and misses 12." Which anomaly is that?

```task
{"id": "w01d3-l6", "kind": "choice", "options": ["An update anomaly", "An insert anomaly", "A delete anomaly", "A type error"], "answer": 0, "explain": "One real-world change needs many cell changes, and the missed ones leave the data contradicting itself."}
```

### 1NF — one value per cell, no repeating groups

**What it is.** A table is in **first normal form** (1NF) when every cell holds **one value** and no fact is repeated across columns (`inst1_…`, `inst2_…` is a **repeating group**).

**How to write it.** Before and after:

```pic
{"id": "w01d3-pic1", "title": "A repeating group becomes rows", "caption": "Before: one column per instalment, so a 24-month loan needs 24 columns and a new term needs a new column. After: one row per instalment; the pair `loan_id` + `installment_no` names each row.", "tables": [{"id": "wide", "name": "before", "cols": ["loan_id", "inst1_due", "inst2_due", "…"], "rows": [[1, "2025-04-28", "2025-05-28", "…"]], "tags": {"inst1_due": "1", "inst2_due": "2", "…": "3 … 24"}}, {"id": "long", "name": "installments", "cols": ["loan_id", "installment_no", "due_date"], "rows": [[1, 1, "2025-04-28"], [1, 2, "2025-05-28"], [1, 3, "2025-06-28"]], "pk": ["loan_id", "installment_no"], "via": "one row per instalment"}]}
```

A 48-month Auto loan needs 48 rows, a 3-month BNPL loan 3 — no empty columns, no limit.

**When you use it.** Whenever you see numbered columns (`phone1, phone2`, `action1_type, action2_type`) or a cell with a list (`'+99890…, +99893…'`): turn them into rows of their own table.

**Your turn.** A sheet has one cell holding two phone numbers: `+998901112233, +998935554433`. Which form does it break?

```task
{"id": "w01d3-l7", "kind": "choice", "options": ["1NF — a cell holds two values", "2NF", "3NF", "None — phones are text"], "answer": 0, "explain": "One cell, one value. The fix is a row per phone (a phones table with customer_id), or two named columns if the business really has exactly two."}
```

### 2NF — every column depends on the whole key

**What it is.** A table with a composite key is in **second normal form** (2NF) when every other column depends on **the whole key**, not on part of it.

**How to write it.** Before — key `(loan_id, installment_no)`, but `customer_name` depends on `loan_id` alone:

| loan_id | installment_no | due_date | customer_name |
|---|---|---|---|
| 1 | 1 | 2025-04-28 | Gulbahor Sobirova |
| 1 | 2 | 2025-05-28 | Gulbahor Sobirova |

After — what depends on the loan goes to the loan's table:

| `installments` | loan_id | installment_no | due_date |
|---|---|---|---|
| | 1 | 1 | 2025-04-28 |
| | 1 | 2 | 2025-05-28 |

| `loans` | loan_id | customer_id |
|---|---|---|
| | 1 | 3473 |

**When you use it.** Only with a composite key. With a one-column surrogate key a table is in 2NF automatically.

**Your turn.** The key is `(loan_id, installment_no)`. Which column breaks 2NF?

```task
{"id": "w01d3-l8", "kind": "choice", "options": ["product_name — it depends on loan_id alone", "due_date — it depends on the loan and the instalment number", "total_due — it depends on the loan and the instalment number", "installment_no — it is part of the key"], "answer": 0, "explain": "The product is a property of the loan, the same on every instalment. It belongs in loans (as product_id), not on each instalment row."}
```

### 3NF — no column depends on another ordinary column

**What it is.** A table is in **third normal form** (3NF) when no column depends on another **non-key** column. If `rate` follows from `product`, it belongs to the product, not to the loan.

**How to write it.** Before — `branch_phone` follows from `branch_id`:

| loan_id | branch_id | branch_phone |
|---|---|---|
| 1 | 10 | 76-200-10-10 |
| 7 | 10 | 76-200-10-10 |

After — the phone lives once, on the branch:

| `loans` | loan_id | branch_id |
|---|---|---|
| | 1 | 10 |
| | 7 | 10 |

| `branches` | branch_id | phone |
|---|---|---|
| | 10 | 76-200-10-10 |

A new phone for branch 10 is now one cell, not one per loan.

**When you use it.** Ask of every column: "does this describe the row's own thing, or something the row points to?" A customer's region on a loan row, a product's rate, a collector's branch — each belongs to the table it describes.

> ⚠️ **Watch out.** Sometimes a copy is kept on purpose. `loans.annual_rate` repeats the product's rate on every loan — today it matches `products.annual_rate` on all 7 828 rows. It is a **snapshot**: if the product's rate changes next year, old loans must keep the rate they were signed at. A deliberate, documented copy is a **controlled denormalisation**; an accidental one is a 3NF violation.

**Your turn.** Put each problem under the normal form it breaks.

```game
{"type": "sort", "id": "w01d3-g2", "title": "Which normal form does it break?", "q": "Each line is a problem in a spreadsheet. Put it under the normal form it breaks.", "groups": {"1NF — repeating groups, many values in a cell": ["inst1_due, inst2_due, inst3_due … as columns", "two phone numbers typed into one cell", "action1_type, action2_type … as columns"], "2NF — depends on part of a composite key": ["key (loan_id, installment_no), but customer_name depends on loan_id alone", "key (loan_id, installment_no), but product depends on loan_id alone"], "3NF — depends on another non-key column": ["rate depends on the product, not on the loan", "branch_phone depends on the branch", "the customer's region stored on every loan row"]}}
```

After the three fixes, Sevara's one sheet *is* our eleven tables: normalisation is the procedure that produced them. Tomorrow you see the other side of the trade — warehouses de-normalise on purpose, because reading many tables costs joins.

### DDL and DML — two families of commands

**What it is.** Six commands build and change tables. They come in two families:
- **DDL** (Data Definition Language, *язык определения данных*) changes the **shape** of a table: `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`.
- **DML** (Data Manipulation Language, *язык манипулирования данными*) changes the **rows**: `INSERT`, `UPDATE`, `DELETE`.

**How to write it.** Every box from here on uses two tables of your own: `my_collectors` (the parent) and `my_calls` (a log of collection calls, the child). Each command's **Your turn** builds a third table, `my_promises`, step by step. Run the boxes in order.

| Command | Family | Does |
|---|---|---|
| `CREATE TABLE` | DDL | makes a new, empty table |
| `INSERT` | DML | adds rows |
| `UPDATE` | DML | changes values in rows that exist |
| `DELETE` | DML | removes rows |
| `ALTER TABLE` | DDL | changes the columns of a table that exists |
| `DROP TABLE` | DDL | removes the whole table |

**When you use it.** **Rule for this course: DDL and DML only on tables whose name starts with `my_` or `scratch_`.** The eleven course tables are for reading. Change them, and every "expect 7828" on every page stops being true. If it happens anyway, **Database → ↺ Reset** brings the original data back; homework checks always read the original.

**Your turn.** Sort the six commands into their families.

```game
{"type": "sort", "id": "w01d3-g5", "title": "Shape or rows?", "q": "Put each command with the family it belongs to.", "groups": {"DDL — changes the shape": ["CREATE TABLE", "ALTER TABLE", "DROP TABLE"], "DML — changes the rows": ["INSERT", "UPDATE", "DELETE"]}}
```

### CREATE TABLE — make an empty table

**What it is.** **CREATE TABLE** makes a new, empty table. You name the table, then list each column with its type and its constraints.

**How to write it.**

```sql
-- the shape only: replace the names before you run it
CREATE TABLE table_name (
    column1  TYPE  PRIMARY KEY,  -- the key
    column2  TYPE  NOT NULL,     -- must be filled
    column3  TYPE,               -- may be empty
    -- optional: column2 points to another table
    FOREIGN KEY (column2) REFERENCES parent(parent_key)
);
```

The two tables for this section:

```sql
CREATE TABLE my_collectors (
    -- SQL Server: INT NOT NULL PRIMARY KEY
    collector_id  INTEGER NOT NULL PRIMARY KEY,
    -- SQL Server: NVARCHAR(100)
    full_name     TEXT    NOT NULL,
    branch_id     INTEGER NOT NULL
);
CREATE TABLE my_calls (
    -- filled in for you: 1, 2, 3 and on
    call_id       INTEGER PRIMARY KEY,
    loan_id       INTEGER NOT NULL,
    collector_id  INTEGER NOT NULL,
    -- a date as 'YYYY-MM-DD'; SQL Server: DATE
    called_on     TEXT    NOT NULL,
    -- may be empty until we know
    outcome       TEXT,
    FOREIGN KEY (collector_id) REFERENCES my_collectors(collector_id)
);
```

The box answers *✓ Done — table created*. In **Database → Your tables** you now see `my_collectors` and `my_calls`, each with **0** rows, their columns with types, and a **PK** badge. A second run answers *table my_collectors already exists*: the tables are already in your copy.

Types by engine:

| Need | SQLite (this site) | SQL Server | PostgreSQL |
|---|---|---|---|
| whole number / id | `INTEGER` | `INT`, `BIGINT` | `INT`, `BIGINT` |
| money (UZS, no fractions) | `INTEGER` | `BIGINT` or `DECIMAL(18,0)` | `BIGINT` / `NUMERIC` |
| rate, ratio | `REAL` | `DECIMAL(10,4)` | `NUMERIC(10,4)` |
| text | `TEXT` | `NVARCHAR(100)` | `VARCHAR(100)` |
| date / date-time | `TEXT` (`YYYY-MM-DD`) | `DATE` / `DATETIME2` | `DATE` / `TIMESTAMP` |
| auto-numbered id | `INTEGER PRIMARY KEY` | `INT IDENTITY(1,1)` | `GENERATED … AS IDENTITY` |

**When you use it.** To keep a result, a list or a log of your own: a lookup table, a list of loans to watch, a design to test.

> ⚠️ **Watch out.** `CREATE TABLE new AS SELECT …` (Day 2's lab) makes and fills a table in one go — but copies no PRIMARY KEY, NOT NULL or FOREIGN KEY. Use it for quick copies, not for a design.

**Your turn.** Create `my_promises` — the promises to pay that collectors record.

```sqllab
{"id": "w01d3-l20", "title": "CREATE TABLE: my_promises", "intro": "One step. Afterwards, open **Database → Your tables → my_promises** and find the PK badge.", "steps": [
  {"say": "Create `my_promises` with five columns: `promise_id` (whole number, primary key), `loan_id` (whole number, NOT NULL), `promised_on` (text date, NOT NULL), `amount` (whole number, NOT NULL) and `kept` (whole number, may be empty).", "hint": "CREATE TABLE my_promises (\n    promise_id  INTEGER PRIMARY KEY,\n    loan_id     INTEGER NOT NULL,\n    promised_on TEXT    NOT NULL,\n    amount      INTEGER NOT NULL,\n    kept        INTEGER\n);", "expect": "SELECT COUNT(*) FROM pragma_table_info('my_promises') WHERE (name = 'promise_id' AND pk = 1) OR (name IN ('loan_id', 'promised_on', 'amount') AND \"notnull\" = 1) OR name = 'kept'", "want": 5}],
 "cleanup": "DROP TABLE IF EXISTS my_promises"}
```

### INSERT — add rows

**What it is.** **INSERT** adds new rows to a table. It never changes rows that are already there.

**How to write it.** Three forms:

```sql
-- the shape only: replace the names before you run it
INSERT INTO table_name (column1, column2) VALUES (value1, value2);
-- one row
INSERT INTO table_name (column1, column2) VALUES (v1, v2), (v3, v4);
-- several rows, one bracket each
INSERT INTO table_name (column1, column2) SELECT colA, colB FROM other_table;
-- the rows a query returns
```

One row — a new collector:

```sql
INSERT INTO my_collectors (collector_id, full_name, branch_id)
VALUES (901, 'Aziza Karimova', 1);
```

*✓ Done — 1 row changed*. From a query — every real collector from `staff`:

```sql
INSERT INTO my_collectors (collector_id, full_name, branch_id)
SELECT staff_id, full_name, branch_id
FROM staff
WHERE role = 'collector';
```

*30 rows changed* — the 30 collectors of Nur Finance. `my_collectors` now holds 31 rows. Several rows at once — three calls (the `call_id` fills itself):

```sql
INSERT INTO my_calls (loan_id, collector_id, called_on, outcome)
VALUES (2242, 7,   '2026-09-29', 'no_answer'),
       (4567, 8,   '2026-09-29', 'promise_to_pay'),
       (4503, 901, '2026-09-30', NULL);
SELECT * FROM my_calls;
```

3 rows, with `call_id` 1, 2 and 3. The third call has no outcome yet: NULL.

**When you use it.** To fill a table you created: by hand (`VALUES`) or from the company's data (`SELECT`).

> ⚠️ **Watch out.** Always list the columns. `INSERT INTO t VALUES (…)` without them depends on the column order and breaks the day someone adds a column. And a foreign key is checked only if the box starts with `PRAGMA foreign_keys = ON` — try it:

```sql
PRAGMA foreign_keys = ON;
INSERT INTO my_calls (loan_id, collector_id, called_on) VALUES (1, 999, '2026-10-01');
-- collector 999 does not exist
```

*FOREIGN KEY constraint failed*. Without the first line, SQLite would accept the call by a collector who does not exist.

**Your turn.** Put three promises into `my_promises`.

```sqllab
{"id": "w01d3-l21", "title": "INSERT: three promises", "intro": "Two steps on the table you just created. `promise_id` fills itself.", "steps": [
  {"say": "Insert one row: loan 2242 promised 1 200 000 on 2026-10-05. Leave `kept` empty.", "hint": "INSERT INTO my_promises (loan_id, promised_on, amount)\nVALUES (2242, '2026-10-05', 1200000);", "expect": "SELECT COUNT(*) FROM my_promises", "want": 1},
  {"say": "Insert two rows with one statement: loan 4567 promised 2 000 000 on 2026-10-07, loan 4503 promised 900 000 on 2026-10-10.", "hint": "INSERT INTO my_promises (loan_id, promised_on, amount)\nVALUES (4567, '2026-10-07', 2000000),\n       (4503, '2026-10-10', 900000);", "expect": "SELECT COUNT(*) FROM my_promises", "want": 3}],
 "cleanup": "DELETE FROM my_promises"}
```

### UPDATE … SET … WHERE — change rows

**What it is.** **UPDATE** changes values in rows that already exist. `SET` says which columns get which new values. `WHERE` says which rows.

**How to write it.**

```sql
-- the shape only: replace the names before you run it
UPDATE table_name
SET    column1 = new_value1, column2 = new_value2  -- what changes
WHERE  condition;
-- on which rows; without WHERE: on every row
```

Call 1 turned out well: the borrower paid on 1 October. First look at the row with the same `WHERE`, then change it:

```sql
SELECT * FROM my_calls WHERE call_id = 1;
UPDATE my_calls SET outcome = 'paid', called_on = '2026-10-01' WHERE call_id = 1;
SELECT * FROM my_calls;
```

The `UPDATE` changes 1 row. The final `SELECT` shows call 1 with `outcome` *paid* and the new date; calls 2 and 3 are untouched.

**When you use it.** To correct or complete rows: a status that moved, a date that became known, a typo.

> ⚠️ **Watch out.** `UPDATE` without `WHERE` changes **every** row, with no warning and no undo. Write the `WHERE` first, run it as a `SELECT`, look at the rows, then change the verb.

**Your turn.** The borrower of loan 4567 kept the promise.

```sqllab
{"id": "w01d3-l22", "title": "UPDATE: a promise kept", "intro": "One step. Look at the row with a SELECT first.", "steps": [
  {"say": "Set `kept = 1` on the promise of loan 4567 — and on no other row.", "hint": "SELECT * FROM my_promises WHERE loan_id = 4567;\nUPDATE my_promises SET kept = 1 WHERE loan_id = 4567;", "expect": "SELECT COALESCE(SUM(kept IS NOT NULL), 0) * 10 + COALESCE(SUM(loan_id = 4567 AND kept = 1), 0) FROM my_promises", "want": 11}],
 "cleanup": "UPDATE my_promises SET kept = NULL"}
```

### DELETE … WHERE — remove rows

**What it is.** **DELETE** removes whole rows. `WHERE` says which ones. The table itself stays, with its columns.

**How to write it.**

```sql
-- the shape only: replace the names before you run it
DELETE FROM table_name
WHERE condition;          -- without WHERE: every row
```

Call 3 was entered by mistake:

```sql
DELETE FROM my_calls WHERE call_id = 3;
SELECT * FROM my_calls;
```

Two calls are left. In the Database panel, `my_calls` now shows 2 rows.

**When you use it.** To remove rows that should not be there: a mistaken entry, a test row, rows outside your report.

> ⚠️ **Watch out.** There is no undo. On a course table, **↺ Reset** saves you; at work, only a backup does.

**Your turn.** The promise on loan 4503 was cancelled.

```sqllab
{"id": "w01d3-l23", "title": "DELETE: a promise cancelled", "intro": "One step.", "steps": [
  {"say": "Delete the promise of loan 4503 — only that row.", "hint": "SELECT * FROM my_promises WHERE loan_id = 4503;\nDELETE FROM my_promises WHERE loan_id = 4503;", "expect": "SELECT COUNT(*) * 10 + COALESCE(SUM(loan_id = 4503), 0) FROM my_promises", "want": 20}]}
```

### ALTER TABLE — change the columns

**What it is.** **ALTER TABLE** changes the shape of a table that already exists, without losing its rows: add a column, rename a column, rename the table, remove a column.

**How to write it.**

```sql
-- the shape only: replace the names before you run it
ALTER TABLE table_name ADD COLUMN column_name TYPE;
-- SQL Server: ALTER TABLE t ADD column_name TYPE;
ALTER TABLE table_name RENAME COLUMN old_name TO new_name;
-- SQL Server: EXEC sp_rename 't.old_name', 'new_name', 'COLUMN';
ALTER TABLE table_name RENAME TO new_table_name;
ALTER TABLE table_name DROP COLUMN column_name;
```

Sevara wants a free-text note on each call:

```sql
ALTER TABLE my_calls ADD COLUMN note TEXT;
UPDATE my_calls SET note = 'asked to call back after 18:00' WHERE call_id = 2;
SELECT * FROM my_calls;
```

Every existing row got the new column `note`, empty (NULL); the `UPDATE` filled it on call 2. The Database panel lists `note` as the sixth column of `my_calls`.

**When you use it.** When a table you own needs one more fact: a flag, a note, a date.

**Your turn.** Collectors also want a note on each promise.

```sqllab
{"id": "w01d3-l24", "title": "ALTER TABLE: one more column", "intro": "One step.", "steps": [
  {"say": "Add a text column `note` to `my_promises`.", "hint": "ALTER TABLE my_promises ADD COLUMN note TEXT;", "expect": "SELECT COUNT(*) FROM pragma_table_info('my_promises') WHERE name = 'note'", "want": 1}]}
```

### DROP TABLE — remove the whole table

**What it is.** **DROP TABLE** removes a table: its rows, its columns and its constraints. `DELETE` without `WHERE` empties a table but keeps it; `DROP` makes it disappear.

**How to write it.**

```sql
-- the shape only: replace the names before you run it
DROP TABLE table_name;
DROP TABLE IF EXISTS table_name;     -- no error if the table is not there
```

The demo tables from the keys subsections are done. Drop the child first, then the parent:

```sql
DROP TABLE IF EXISTS my_loans_demo;     -- the child: it points to my_keys_demo
DROP TABLE IF EXISTS my_keys_demo;      -- the parent
DROP TABLE IF EXISTS my_schedule_demo;
```

*✓ Done — table removed*. The three tables vanish from **Your tables**.

| | `DELETE FROM t;` | `DROP TABLE t;` |
|---|---|---|
| Rows | all gone | all gone |
| The table and its columns | stay, empty | gone |
| Undo | none | none |

**When you use it.** To clean up tables you no longer need, and before re-creating a table from scratch.

> ⚠️ **Watch out.** SQL Server refuses to drop a parent while a foreign key still points at it — drop the child first. SQLite, with `PRAGMA foreign_keys` off, does not stop you, and the child is left pointing at nothing.

**Your turn.** You will not need `my_promises` again. (Do this step last.)

```sqllab
{"id": "w01d3-l25", "title": "DROP TABLE: clean up", "intro": "One step. Afterwards `my_promises` is gone from **Your tables**.", "steps": [
  {"say": "Remove the table `my_promises`.", "hint": "DROP TABLE my_promises;", "expect": "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'my_promises'", "want": 0}]}
```

### What WHERE protects you from — and what it does not

**What it is.** In `UPDATE` and `DELETE`, **WHERE** is the only thing between "change one row" and "change every row". It protects you **only** as far as it is right.

| WHERE protects you when… | WHERE does **not** protect you when… |
|---|---|
| it names exactly the rows you mean | it is missing: every row changes |
| it uses the primary key: `WHERE call_id = 2` hits at most one row | it uses an ordinary column that matches more rows than you think |
| | it matches nothing (`= NULL`, `'Paid'` for `'paid'`, a wrong id): *0 rows changed*, no error |
| | the command has no WHERE at all: `DROP TABLE`, `ALTER TABLE` |

**How to write it.** The safe habit, in four moves:
1. Write the `WHERE` first.
2. Run it as `SELECT COUNT(*) … WHERE …` and look at the number.
3. Change the verb to `UPDATE … SET` or `DELETE`, keeping the same `WHERE`.
4. Read the message: *n rows changed* must equal the count from move 2.

```sql
SELECT COUNT(*) FROM my_collectors WHERE branch_id = 1;
-- move 2: how many rows would this WHERE hit?
```

4 rows — Aziza Karimova and the three real collectors of branch 1. A `DELETE … WHERE branch_id = 1` meant for Aziza would remove four people.

```sql
UPDATE my_collectors SET branch_id = 2 WHERE full_name = 'aziza karimova';
-- lower case: matches nothing
```

*✓ Done — 0 rows changed*. No error: in SQLite `=` is case-sensitive, so the row stayed in branch 1. Check the count of every change you make.

**When you use it.** Before every `UPDATE` and `DELETE`, for the rest of your career.

**Your turn.** Find the line that makes this statement dangerous.

```game
{"type": "bug", "id": "w01d3-g3", "title": "One request, or all of them?", "q": "Sevara approved request 1 only. This statement approves something else. Tap the line that is wrong.", "code": "-- approve Sevara's request 1\nUPDATE scratch_restructurings\nSET status = 'approved',\n    approved_by = 68;", "answer": [3], "why": "The statement ends without a WHERE, so every row of the table is approved. It needs WHERE restructuring_id = 1 (or WHERE loan_id = 2242) before the semicolon."}
```

### Putting it together

The life of one table, every command in order. Run the box once:

```sql
-- CREATE: the shape, with a key and NOT NULLs
CREATE TABLE my_visits (
    visit_id   INTEGER PRIMARY KEY,
    branch_id  INTEGER NOT NULL,
    visited_on TEXT    NOT NULL,
    purpose    TEXT
);
-- INSERT: several rows
INSERT INTO my_visits (branch_id, visited_on, purpose)
VALUES (1, '2026-10-01', 'audit'), (4, '2026-10-02', 'training'), (9, '2026-10-03', 'audit');
UPDATE my_visits SET purpose = 'audit and training' WHERE visit_id = 1;
-- UPDATE: one row, by its key
DELETE FROM my_visits WHERE visit_id = 3;
-- DELETE: one row, by its key
ALTER TABLE my_visits ADD COLUMN visitor TEXT;
-- ALTER: one more column
SELECT * FROM my_visits;
-- look at the result
```

2 rows: visit 1 to branch 1 (*audit and training*) and visit 2 to branch 4 (*training*), each with an empty `visitor`. When you are done, clean up — DROP:

```sql
DROP TABLE IF EXISTS my_visits;
DROP TABLE IF EXISTS my_calls;          -- the child first
DROP TABLE IF EXISTS my_collectors;     -- then the parent
```

Read the first box against this section: the **primary key** names each visit, **NOT NULL** guards the branch and the date, the **WHERE** of `UPDATE` and `DELETE` uses the key, so each hits exactly one row.

### Depth (optional)

- ▶ Baraa, *DDL commands* [1:32:31](https://youtu.be/SSKVgrwhzus?t=5551&end=6224) — 11 min; ▶ *DML commands* [1:43:44](https://youtu.be/SSKVgrwhzus?t=6224&end=7683) — 25 min.
- RU deck (TBC Data Analytics 2.0, if you have it) `1.2 Database Modeling & Normalization.pdf`, the pages on ER-диаграмма, 1НФ/2НФ/3НФ and аномалии. *Russian terms:* сущность = entity, связь = relationship, нормализация = normalisation, избыточность = redundancy.

```videoquiz
{"video": "SSKVgrwhzus", "stops": [
  {"at": 5750, "q": "In this part, Baraa explains CREATE TABLE. Which statement is true?", "options": ["CREATE TABLE fills the new table with rows", "A CREATE TABLE lists each column with its data type and can declare constraints such as NOT NULL and PRIMARY KEY", "Column types are optional and ignored by every database", "A table is created automatically by the first INSERT"], "answer": 1, "explain": "CREATE TABLE only defines the shape: columns, types, constraints. Rows come later with INSERT — exactly like scratch_restructurings in the lab.", "back": 60},
  {"at": 6100, "q": "In this part, Baraa explains ALTER TABLE and DROP TABLE. Which statement is true?", "options": ["DROP TABLE removes the table and every row in it — there is no undo", "ALTER TABLE deletes rows that break a rule", "DROP TABLE only empties the table and keeps its columns", "ALTER TABLE can only rename a table"], "answer": 0, "explain": "ALTER changes the structure (for example ADD a column); DROP throws the whole table away. On your practice copy, Database → ↺ Reset is your safety net; at work there is none.", "back": 45},
  {"at": 6700, "q": "In this part, Baraa explains INSERT. Which statement is true?", "options": ["INSERT changes the values of rows that already exist", "INSERT needs a WHERE clause", "In INSERT INTO t (col1, col2) VALUES (…), the values must match the listed columns in number and order", "INSERT can add only one row per statement"], "answer": 2, "explain": "List the columns, then give values in the same order; several rows can go in one VALUES list, and INSERT … SELECT copies rows from a query.", "back": 60},
  {"at": 7300, "q": "In this part, Baraa explains UPDATE and DELETE. Which statement is true?", "options": ["DELETE removes the table itself", "Without a WHERE clause, UPDATE and DELETE change every row of the table", "UPDATE works without SET", "DELETE asks for confirmation before removing rows"], "answer": 1, "explain": "No WHERE = all rows. Write the WHERE first, test it as a SELECT, then switch the verb.", "back": 60}]}
```

---

## 2. Worked example — a table for Sevara

*"When a borrower can't pay, we sometimes stretch the loan: new term, smaller monthly payment. Today that lives in three columns of my sheet per restructuring. Design it properly."* Each step names the idea from Learn that it uses.

**Step 1 — what is one row? (primary key, one-to-many).** One restructuring *event* of one loan. A loan can be restructured more than once → `loans 1 — ∞ restructurings`. So `loan_id` is a foreign key, not the primary key; the event gets its own key, `restructuring_id`.

**Step 2 — what do we need to know about the event? (columns and types).** When it was requested and decided (dates); the old and new term (whole numbers); the new monthly payment (money, a whole number); the reason (a short text code); who approved it (a staff member); the status (`requested`, `approved`, `rejected`, `active`, `completed`).

**Step 3 — what must never be empty? (NOT NULL).** The loan, the request date, the terms, the reason, the status. The decision date, the approver and the new payment stay empty while the request waits.

**Step 4 — what points elsewhere? (FOREIGN KEY).** `loan_id` → the loans, `approved_by` → staff. Our course tables declare no keys, so the foreign keys point at two small keyed copies of the ids.

**Step 5 — what did we *not* put in? (3NF).** The customer's name (reachable via loan → customer), the product's rate (via loan → product), the approver's branch (via staff). Each would be a 3NF violation and a future "fix 400 cells".

**Step 6 — write it (CREATE TABLE).**

```sql
-- SQL Server
-- the keyed copies the foreign keys point at
CREATE TABLE scratch_loan_keys  (loan_id  INT NOT NULL PRIMARY KEY);
INSERT INTO scratch_loan_keys  (loan_id)  SELECT loan_id  FROM loans;
CREATE TABLE scratch_staff_keys (staff_id INT NOT NULL PRIMARY KEY);
INSERT INTO scratch_staff_keys (staff_id) SELECT staff_id FROM staff;

CREATE TABLE scratch_restructurings (
    restructuring_id   INT IDENTITY(1,1) PRIMARY KEY,
    loan_id            INT           NOT NULL,
    requested_on       DATE          NOT NULL,
    decided_on         DATE          NULL,
    old_term_months    INT           NOT NULL,
    new_term_months    INT           NOT NULL,
    new_monthly_payment BIGINT       NULL,
    -- 'job_loss', 'illness', 'business_down', 'other'
    reason_code        NVARCHAR(30)  NOT NULL,
    approved_by        INT           NULL,
    status             NVARCHAR(20)  NOT NULL,
    FOREIGN KEY (loan_id)     REFERENCES scratch_loan_keys(loan_id),
    FOREIGN KEY (approved_by) REFERENCES scratch_staff_keys(staff_id)
);
-- SQLite: replace restructuring_id's type with  INTEGER PRIMARY KEY
-- AUTOINCREMENT,
-- INT → INTEGER, BIGINT → INTEGER, NVARCHAR(n) → TEXT, DATE → TEXT.
```

Sevara reads the column list and says "yes, that's all of it, and it's ten columns, not three per event". That sentence — a business user recognising their process in your table — is the test of a good design. In Practice you build it, step by step, in the SQLite dialect this site runs (INSERT, UPDATE and DELETE included).

---

## 3. Practice (60 min)

Every question has its own answer box; P8–P10 are one guided lab that runs on your practice copy. Answer, check, read why — your answers are saved in this browser. The questions follow the order of Learn; the label in italics names the idea each one trains.

**P1.** *(primary key)* Run `SELECT COUNT(*), COUNT(DISTINCT customer_id) FROM loans;`. 7 828 rows hold only 4 335 different `customer_id`s. What does that prove about `loans.customer_id`?

```task
{"id": "w01d3-l9", "kind": "choice", "options": ["It cannot be the primary key of loans: many customers have more than one loan", "It is the primary key of loans", "Some loans have no customer", "customers has duplicate ids"], "answer": 0, "explain": "A primary key needs as many different values as rows. customer_id repeats once per loan of the same customer — it is a foreign key (to customers), and loan_id is the primary key."}
```

**P2.** *(composite key)* In `installments`, which columns would be a valid *composite* natural key — and why did the designers add `installment_id` anyway?

```task
{"id": "w01d3-p2", "kind": "choice", "options": ["(loan_id, installment_no)", "(loan_id, principal_due)", "(due_date, total_due)", "loan_id alone"], "answer": 0, "explain": "A loan has exactly one instalment number 1, one number 2, … so (loan_id, installment_no) is unique. The surrogate installment_id is shorter to join on (payments.installment_id is one column, not two) and never changes if a schedule is regenerated."}
```

**P3.** *(NOT NULL and UNIQUE)* You re-create `customers` with constraints. Which of these fit the business as it is? Tick all.

```task
{"id": "w01d3-l10", "kind": "multi", "options": ["customer_id PRIMARY KEY", "first_name NOT NULL", "birth_date NOT NULL", "phone UNIQUE", "monthly_income NOT NULL"], "answer": [0, 1, 2], "explain": "Every customer has an id, a name and a birth date when registered. phone UNIQUE would refuse real families who share a number (6 040 rows, 5 997 phones), and monthly_income is honestly unknown for 356 customers — NOT NULL would refuse them or force a fake value."}
```

**P4.** *(foreign key)* Which of these does a FOREIGN KEY from `loans.customer_id` to `customers.customer_id` **prevent**? Tick all.

```task
{"id": "w01d3-p3", "kind": "multi", "options": ["(a) two loans for the same customer", "(b) a loan whose customer_id does not exist in customers", "(c) a customer with no loans", "(d) deleting a customer who still has loans"], "answer": [1, 3], "explain": "(b) and (d). (a) is allowed — one-to-many is the point. (c) is allowed — the FK constrains the child, not the parent."}
```

**P5.** *(the ER diagram)* From the ER list, tick every table that has a foreign key pointing **to** `staff`.

```task
{"id": "w01d3-l11", "kind": "multi", "options": ["applications", "collections_actions", "loans", "branches", "payments"], "answer": [0, 1], "explain": "applications.officer_id and collections_actions.collector_id point to staff.staff_id. branches is pointed to by staff (staff.branch_id), not the other way round; loans and payments do not store an employee."}
```

**P6.** *(1NF and 3NF)* Here is a table Timur found on a shared drive, `collections_log`:

| action_id | loan_id | customer_name | customer_phone | collector_name | collector_branch | branch_region | action1_type | action1_date | action2_type | action2_date |
|---|---|---|---|---|---|---|---|---|---|---|

Name every normalisation problem you see and which normal form it breaks.

```task
{"id": "w01d3-p1", "kind": "free", "min": 25, "model": "1NF: action1_*, action2_* are a repeating group → one row per action. 3NF: customer_name and customer_phone depend on the loan's customer, not on the action; collector_branch depends on the collector; branch_region depends on the branch (a two-step transitive dependency). After fixing: exactly our collections_actions(action_id, loan_id, action_date, action_type, collector_id, outcome) plus the existing staff, branches and customers.", "rubric": ["1NF: the action1_* / action2_* repeating group, fixed with one row per action", "3NF: customer columns depend on the customer, collector_branch on the collector, branch_region on the branch", "The fixed design is collections_actions plus customers, staff and branches"]}
```

**P7.** *(3NF and controlled denormalisation)* `loans` stores `customer_id` although it is reachable through `applications`. Is this a 3NF violation? Argue both sides in two sentences each.

```task
{"id": "w01d3-p8", "kind": "free", "min": 30, "model": "Strictly yes: customer_id depends on application_id, a non-key column, so it is a transitive dependency and could become inconsistent (a loan pointing to a different customer than its application). Pragmatically no harm: it is written once at disbursement and never changes, and it saves a join on the most common query in the company; designers call this a controlled denormalisation and document it. Thursday's warehouse does this on a grand scale.", "rubric": ["For: customer_id depends on application_id, a non-key column — a transitive dependency that could drift", "Against: written once, never changes, saves a join on the most common query", "Calls it a controlled, documented denormalisation"]}
```

**P8–P10. Lab — Sevara's restructurings** *(CREATE TABLE, INSERT, UPDATE, DELETE)*. Build the worked example's table in the SQLite dialect this site runs, fill it with three real requests, approve one, undo one, and show Sevara the result next to each loan. The lab ticks each step off as your practice copy reaches it.

```sqllab
{"id": "w01d3-lab", "title": "Sevara's restructurings", "intro": "Two keyed id lists, one table with two foreign keys, three requests — then an approval, an undo and a join. Use **💡 Show me** for the exact SQLite text.", "steps": [
  {"say": "Make the two keyed copies the foreign keys will point at: `scratch_loan_keys` (every `loan_id` of `loans`) and `scratch_staff_keys` (every `staff_id` of `staff`), each with its id as PRIMARY KEY. (If `scratch_loan_keys` already exists, make only the staff one.)", "hint": "CREATE TABLE scratch_loan_keys (loan_id INTEGER NOT NULL PRIMARY KEY);\nINSERT INTO scratch_loan_keys (loan_id) SELECT loan_id FROM loans;\nCREATE TABLE scratch_staff_keys (staff_id INTEGER NOT NULL PRIMARY KEY);\nINSERT INTO scratch_staff_keys (staff_id) SELECT staff_id FROM staff;", "expect": "SELECT (SELECT COUNT(*) FROM scratch_loan_keys) + (SELECT COUNT(*) FROM scratch_staff_keys)", "want": 7928},
  {"say": "Create `scratch_restructurings` with the worked example's ten columns, in SQLite types, and its two FOREIGN KEYs: `loan_id` → `scratch_loan_keys`, `approved_by` → `scratch_staff_keys`.", "hint": "CREATE TABLE scratch_restructurings (\n    restructuring_id    INTEGER PRIMARY KEY AUTOINCREMENT,\n    loan_id             INTEGER NOT NULL,\n    requested_on        TEXT    NOT NULL,\n    decided_on          TEXT,\n    old_term_months     INTEGER NOT NULL,\n    new_term_months     INTEGER NOT NULL,\n    new_monthly_payment INTEGER,\n    reason_code         TEXT    NOT NULL,\n    approved_by         INTEGER,\n    status              TEXT    NOT NULL,\n    FOREIGN KEY (loan_id)     REFERENCES scratch_loan_keys(loan_id),\n    FOREIGN KEY (approved_by) REFERENCES scratch_staff_keys(staff_id)\n);", "expect": "SELECT COUNT(*) FROM pragma_foreign_key_list('scratch_restructurings')", "want": 2},
  {"say": "**P8.** Insert three requests — loans 2242, 4567 and 4503 (real active loans that are furthest behind): requested on 2026-09-28, old term 24, new term 36, reason `business_down`, status `requested`; leave `decided_on` and `approved_by` empty. The id fills itself.", "hint": "INSERT INTO scratch_restructurings\n    (loan_id, requested_on, old_term_months, new_term_months, reason_code, status)\nVALUES\n    (2242, '2026-09-28', 24, 36, 'business_down', 'requested'),\n    (4567, '2026-09-28', 24, 36, 'business_down', 'requested'),\n    (4503, '2026-09-28', 24, 36, 'business_down', 'requested');", "expect": "SELECT COUNT(*) FROM scratch_restructurings", "want": 3},
  {"say": "**P9.** Sevara approved the request for loan 2242: staff member 68 said yes on 2026-09-30, new monthly payment 1 200 000. Update that one row only — look at it with a SELECT first.", "hint": "SELECT * FROM scratch_restructurings WHERE loan_id = 2242;\nUPDATE scratch_restructurings\nSET status = 'approved', decided_on = '2026-09-30', approved_by = 68, new_monthly_payment = 1200000\nWHERE loan_id = 2242;", "expect": "SELECT COUNT(*) FROM scratch_restructurings WHERE status = 'approved' AND approved_by = 68 AND decided_on = '2026-09-30' AND new_monthly_payment = 1200000", "want": 1},
  {"say": "**P10.** \"Undo\" the request for loan 4503: delete that one row.", "hint": "SELECT * FROM scratch_restructurings WHERE loan_id = 4503;\nDELETE FROM scratch_restructurings WHERE loan_id = 4503;", "expect": "SELECT COUNT(*) * 10 + COALESCE(SUM(loan_id = 4503), 0) FROM scratch_restructurings", "want": 20},
  {"say": "Show Sevara each request next to its loan: save a table `scratch_sevara_list` with `loan_id`, the loan's `principal` and `term_months` from `loans`, and the request's `new_term_months` and `status` — a JOIN on `loan_id` (next week's topic; copy it today).", "hint": "CREATE TABLE scratch_sevara_list AS\nSELECT r.loan_id, l.principal, l.term_months, r.new_term_months, r.status\nFROM scratch_restructurings r\nJOIN loans l ON l.loan_id = r.loan_id;\nSELECT * FROM scratch_sevara_list;", "expect": "SELECT COUNT(*) FROM scratch_sevara_list WHERE principal IS NOT NULL", "want": 2}],
 "cleanup": "DROP TABLE IF EXISTS scratch_sevara_list; DROP TABLE IF EXISTS scratch_restructurings; DROP TABLE IF EXISTS scratch_staff_keys; DROP TABLE IF EXISTS scratch_loan_keys"}
```

Look at `term_months` in your `scratch_sevara_list`: loan 2242 really runs 6 months and loan 4567 24 — not the 24 you typed as `old_term_months` for both. A stored copy of a fact that lives elsewhere is already a redundancy you must keep in sync; a stricter design would read the old term from `loans` and store only the new one. And if you forgot the `WHERE` on the update, every row was approved — **↺ Start over** and redo it; that is exactly why the rule says scratch tables only.

**P11.** *(foreign key: does the engine enforce it?)* Try to insert a restructuring for `loan_id = 999999` (it is not in `scratch_loan_keys`). On this site — SQLite, with foreign keys switched off, which is the engine's own default — what happens?

```task
{"id": "w01d3-p7", "kind": "choice", "options": ["An error: FOREIGN KEY constraint failed", "The row is accepted silently", "SQLite adds loan 999999 to scratch_loan_keys", "The whole table is dropped"], "answer": 1, "explain": "SQLite checks foreign keys only while PRAGMA foreign_keys = ON is set on the connection (put it on the first line of the same box); then you get 'FOREIGN KEY constraint failed'. SQL Server refuses the row by default. What should happen is the refusal: constraints protect you only if the engine enforces them, so always check what yours does."}
```

**P12.** *(ALTER TABLE)* Sevara wants to record the channel of each request (`branch`, `app`, `phone`) in `scratch_restructurings`, which already holds rows. Which statement?

```task
{"id": "w01d3-l12", "kind": "choice", "options": ["ALTER TABLE scratch_restructurings ADD COLUMN channel TEXT;", "UPDATE scratch_restructurings SET channel = 'branch';", "CREATE TABLE scratch_restructurings (channel TEXT);", "INSERT INTO scratch_restructurings (channel) VALUES ('branch');"], "answer": 0, "explain": "A new column is a change of shape: ALTER TABLE … ADD COLUMN. Existing rows keep their values and get NULL in the new column. UPDATE can fill it only after it exists; CREATE fails because the table exists."}
```

**P13.** *(DROP TABLE vs DELETE)* What is left after `DELETE FROM scratch_sevara_list;` — and after `DROP TABLE scratch_sevara_list;`?

```task
{"id": "w01d3-l13", "kind": "choice", "options": ["After DELETE: an empty table with its columns. After DROP: nothing — the table is gone", "Both leave an empty table", "Both remove the table", "DELETE without WHERE is refused"], "answer": 0, "explain": "DELETE removes rows and keeps the shape; DROP removes the shape too. Neither has an undo."}
```

**P14.** *(what WHERE does not protect you from)* You run `UPDATE scratch_restructurings SET status = 'rejected' WHERE status = 'Requested';` and the box says *0 rows changed*. What happened?

```task
{"id": "w01d3-l14", "kind": "choice", "options": ["Nothing matched: the stored value is 'requested' in lower case, and SQLite's = is case-sensitive — no error, no change", "Every row was rejected", "The database refused because of the foreign key", "The rows were deleted"], "answer": 0, "explain": "A WHERE that matches nothing is silent. Run the WHERE as SELECT COUNT(*) first: 0 would have warned you before the UPDATE."}
```

> 🚀 **Stretch (optional, +5 XP).** **P15.** *(design: keys, NOT NULL, 3NF)* Design a `scratch_promises` table: a collector records a borrower's *promise to pay* (loan, collector, date promised, amount promised, date actually paid or empty, kept yes/no). List its columns, say which are NOT NULL and which are FKs, and explain one column you deliberately left out. (Write the `CREATE TABLE` in any box if you like — it is a scratch table.)

```task
{"id": "w01d3-p9", "kind": "free", "min": 30, "model": "Columns: promise_id PK; loan_id FK NOT NULL; collector_id FK → staff, NOT NULL; promised_on (when the call happened) NOT NULL; promise_date (the day she promised to pay) NOT NULL; promised_amount NOT NULL; paid_on NULL; kept (0/1) NULL until the promise date passes. Left out: the borrower's phone (reachable via loan → customer), the collector's branch (via staff), and the loan's DPD at the time — a computed fact; store it only if you need the historical value, then call it dpd_at_promise and accept the redundancy knowingly.", "rubric": ["A PK and two FKs: loan_id and collector_id → staff", "NOT NULL on what must exist at recording time; paid_on and kept may be empty", "A left-out column with a 3NF reason (or a snapshot named as such)"]}
```

---

## 4. Self-check

```check
{"id": "w01d3-sc", "questions": [
  {"type": "single", "q": "A column depends on another non-key column. Which normal form is broken, and what goes wrong when the data changes?", "options": ["1NF — a cell holds two values", "3NF — the same fact sits in many cells, and a change misses some of them (an update anomaly)", "2NF — the key has two columns", "None — that is just redundancy, not a rule"], "answer": 1, "explain": "rate depends on product, branch_phone on the branch: change it once and you must find every copy (→ section 1, 3NF)."},
  {"type": "multi", "q": "What does a FOREIGN KEY refuse? Tick both.", "options": ["A child value that does not exist in the parent table", "A second child row for the same parent", "Deleting a parent that still has children (unless the design says cascade)", "A parent with no children"], "answer": [0, 2], "explain": "Referential integrity: the data cannot point at nothing; one-to-many is allowed (→ section 1, Foreign key)."},
  {"type": "single", "q": "What should you always do before running an UPDATE or DELETE?", "options": ["Write the WHERE first and run it as a SELECT to see exactly which rows it hits", "Run it twice to be sure", "Drop the table first", "Nothing — the database asks for confirmation"], "answer": 0, "explain": "No WHERE = every row, and there is no undo (→ section 1, What WHERE protects you from)."}
]}
```

---

## 5. Company corner <span class="badge company">DPD, buckets, FPD</span>

**DPD — days past due** (*дни просрочки*). For one loan on a given date: the number of days since the due date of its **oldest unpaid instalment**. A loan whose May instalment is still unpaid in October is 150-odd days past due — even if the borrower paid June, July and August on time. Zero if nothing is overdue.

Why the *oldest* unpaid, not the latest? Because that is how the debt ages. The May instalment has been owed since May; paying later instalments while skipping an earlier one does not make the old debt younger. Most core banking systems also apply any payment to the oldest open instalment first (FIFO), so "oldest unpaid" and "how long has this borrower been in arrears" are the same thing.

> 💡 **Key idea.** DPD counts from the **oldest** instalment that is not *fully* paid. Later payments, and partial payments, do not reset the clock.

**Buckets** (*корзины просрочки*). DPD is grouped into bands so that a portfolio can be described in five numbers:

| Bucket | DPD | Meaning | Who acts |
|---|---|---|---|
| 0 | 0 | current | nobody |
| 1–30 | 1 to 30 | early arrears, usually forgetfulness | SMS, app push |
| 31–60 | 31 to 60 | a real problem is forming | calls |
| 61–90 | 61 to 90 | last chance before "bad" | visits, restructuring offer |
| 90+ | over 90 | **non-performing** (NPL) in most regulations | legal, write-off process |

```game
{"type": "sort", "id": "w01d3-g4", "title": "Which bucket?", "q": "Put each loan's DPD into its bucket.", "groups": {"0 · current": ["DPD 0"], "1–30": ["DPD 5", "DPD 30"], "31–60": ["DPD 31", "DPD 60"], "61–90": ["DPD 75", "DPD 90"], "90+ · non-performing": ["DPD 91", "DPD 400"]}}
```

Nur Finance as of 2026-10-01 (you will compute this yourself next week, on Week 2 · Day 3; today just read the shape): 413 loans have at least one matured instalment that is not fully paid; by bucket **14 / 124 / 25 / 16 / 234** for 0 (due today) / 1–30 / 31–60 / 61–90 / 90+. Bucket 0 means DPD 0 (nothing late); this list holds only the 14 DPD-0 loans whose instalment falls due today — counted over the whole book, bucket 0 is 7 429 loans (7 828 − 399 late), as Week 8 shows. The 90+ pile is big because the dataset keeps written-off loans in `loans` with their unpaid schedules: 234 = 190 `written_off` + 44 `default` — the status column and the DPD computation agree, which is the first check you run on any portfolio report.

> ⚠️ **Watch out.** "Not *fully* paid": an instalment with a partial payment is still past due. If you count only instalments with no payment at all you get 399 loans and a 90+ bucket of 217 — a wrong number that looks perfectly reasonable.

**FPD / SPD / TPD — first, second, third payment default** (*дефолт по первому платежу*). A loan is an FPD if its **1st instalment** was not paid within X days of its due date; SPD and TPD the same for the 2nd and 3rd. X is a convention: **30 days is the common one** (FPD30); some companies report FPD7 or FPD0 (not paid *on* the due date). Always say which.

Why does everyone watch FPD? Two reasons:

1. **Early warning for new products and new rules.** A 36-month Auto loan takes three years to show its full loss. Its FPD you know in 60 days. If a new scoring cut-off or a new channel was a mistake, FPD is the first number that moves — months before the 90+ bucket.
2. **Fraud.** A borrower who never intended to repay does not pay the first instalment. Genuine financial trouble usually arrives later. A spike in FPD on one branch, one officer or one app version is the classic fraud signal; a spike in 61–90 is an economy signal.

Nur Finance FPD30 as of the data: of the 7 099 loans whose first instalment fell due on or before 1 September 2026 (so that 30 days have passed), **91** had not paid it in full within 30 days → **1.28 %**. (You write the query next week, on Week 2 · Day 4; the number is here so you know what "normal" looks like for this book.)

Tomorrow: Madina's customer count does not match HR's. Bring your Day-1 P1 note — detective day.

> 🎯 **Interview version.** *"What is DPD, and why is FPD watched separately?"* — DPD: days since the oldest unpaid instalment, grouped into 0 / 1–30 / 31–60 / 61–90 / 90+. FPD: first instalment unpaid after 30 days; watched because it shows up within two months of disbursement (early warning for new products and rules) and because it is the main fraud indicator.

**Say it like in an interview.** Write your answer the way you would say it — 30 words or more — then compare it with the model.

```task
{"id": "w01d3-iv", "kind": "free", "min": 30, "model": "DPD is days past due: for a loan on a given date, the days since the due date of its oldest instalment that is not fully paid — later or partial payments do not reset it. We group it into buckets 0, 1–30, 31–60, 61–90 and 90+, where 90+ is non-performing. FPD is first payment default: the first instalment not paid within 30 days. We watch it separately because it shows up within two months of disbursement — an early warning for a new product, channel or scoring rule long before the 90+ bucket moves — and because skipping the very first payment is the classic fraud signal.", "rubric": ["DPD counts from the oldest not-fully-paid instalment", "Names the buckets, with 90+ as non-performing", "FPD: first instalment unpaid after X (usually 30) days — early warning and fraud signal"]}
```

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w01d3", "pass": 0.8, "questions": [
  {"type": "multi", "q": "In a production design, installments.loan_id is a FOREIGN KEY to loans.loan_id. What does it refuse?", "options": ["An instalment whose loan_id does not exist in loans", "Many instalments for the same loan", "Deleting a loan that still has instalments", "A loan with no instalments yet"], "answer": [0, 2], "explain": "The FK keeps the child from pointing at nothing; one-to-many is allowed, and it constrains the child, not the parent (→ section 1, Foreign key)."},
  {"type": "single", "q": "In Sevara's sheet, the columns inst1_due, inst1_paid, inst2_due, inst2_paid… repeat the same fact across columns. Which normal form does that break?", "options": ["1NF", "2NF", "3NF", "None — it is fine for short loans"], "answer": 0, "explain": "A repeating group breaks 1NF; the fix is one row per instalment, the installments table (→ section 1, 1NF)."},
  {"type": "single", "q": "In this sheet, rate depends on product, not on the loan. Which normal form is broken, and what goes wrong?", "code": "loan_id | customer | product       | rate | branch_phone\n1       | Kamola   | Consumer loan | 0.30 | 71-200-01-01\n2       | Kamola   | Consumer loan | 0.30 | 71-200-01-01", "options": ["1NF — a cell holds two values", "3NF — when the Consumer rate changes, thousands of cells must change and some get missed", "2NF — the key is composite", "No form is broken; rate is a number"], "answer": 1, "explain": "A column depending on another non-key column is a 3NF violation and causes update anomalies; the rate belongs in products (→ section 1, 3NF)."},
  {"type": "single", "q": "What does this statement do?", "code": "UPDATE scratch_restructurings\nSET status = 'approved';", "options": ["Approves the most recent row only", "Approves every row in the table", "Fails because WHERE is missing", "Nothing until you add COMMIT"], "answer": 1, "explain": "UPDATE and DELETE without WHERE hit every row; write the WHERE first and run it as a SELECT (→ section 1, UPDATE … SET … WHERE)."},
  {"type": "single", "q": "On SQLite with foreign keys off (PRAGMA foreign_keys = OFF, the engine's own default), you run this. Loan 999999 is not in scratch_loan_keys. What happens?", "code": "INSERT INTO scratch_restructurings\n  (loan_id, requested_on, old_term_months, new_term_months, reason_code, status)\nVALUES (999999, '2026-09-28', 24, 36, 'other', 'requested');", "options": ["FOREIGN KEY constraint failed", "The row is accepted silently", "SQLite creates loan 999999", "The whole table is dropped"], "answer": 1, "explain": "A constraint protects you only if the engine enforces it; SQLite checks FKs only while PRAGMA foreign_keys is ON (→ P11)."},
  {"type": "single", "q": "On which tables may you run INSERT, UPDATE or DELETE in this course?", "options": ["Any table, as long as you use WHERE", "Only tables whose name starts with scratch_ or my_", "Only loans and customers", "None — DML is never allowed"], "answer": 1, "explain": "The eleven course tables are read-only, or every expected number on every page stops being true (→ section 1, DDL and DML)."},
  {"type": "number", "q": "One loan's schedule, as of 2026-10-01. How many days past due (DPD) is the loan?", "code": "installment_no | due_date   | paid\n1              | 2026-07-01 | in full\n2              | 2026-08-01 | nothing\n3              | 2026-09-01 | in full", "answer": 61, "explain": "DPD counts from the oldest unpaid instalment (1 August), however many later ones were paid: 31 + 30 = 61 days, bucket 61–90 (→ section 5, Company corner)."},
  {"type": "single", "q": "First-payment default (FPD) jumps at one branch while later buckets stay calm. What is this the classic signal of?", "options": ["Fraud", "A slowing economy", "A data-loading error", "Customers paying early"], "answer": 0, "explain": "A borrower who never meant to repay skips the very first instalment; genuine trouble arrives later (→ section 5, Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w01d3", "q": "Sevara is about to call the borrower of loan 5023 and wants its DPD (days past due) as of 2026-10-01. Use only this week's SQL: list the loan's instalments and its payments, match them by installment_id, and count the days yourself. Answer with the DPD as a whole number.", "type": "number", "dp": 0, "sql": true, "h": ["3b95b80e8bc702103bce34b6"], "hint": "Compare each payment with total_due, not just whether a payment exists — and remember which instalment DPD counts from.", "sol": "U0VMRUNUIGluc3RhbGxtZW50X2lkLCBpbnN0YWxsbWVudF9ubywgZHVlX2RhdGUsIHRvdGFsX2R1ZSBGUk9NIGluc3RhbGxtZW50cyBXSEVSRSBsb2FuX2lkID0gNTAyMyBPUkRFUiBCWSBpbnN0YWxsbWVudF9ubzsKU0VMRUNUIHBheW1lbnRfaWQsIGluc3RhbGxtZW50X2lkLCBwYWlkX2F0LCBhbW91bnQgRlJPTSBwYXltZW50cyBXSEVSRSBsb2FuX2lkID0gNTAyMyBPUkRFUiBCWSBwYWlkX2F0OwooSWRlbnRpY2FsIG9uIFNRTGl0ZSBhbmQgU1FMIFNlcnZlci4pCkluc3RhbG1lbnQgMSAoZHVlIDIwMjYtMDYtMjQsIDEgNDIwIDYwMCkgd2FzIHBhaWQgaW4gZnVsbCBvbiAyMDI2LTA2LTIzLiBJbnN0YWxtZW50IDIgKGR1ZSAyMDI2LTA3LTI0KSBoYXMgbm8gcGF5bWVudCBhdCBhbGwuIEluc3RhbG1lbnQgMyAoZHVlIDIwMjYtMDgtMjQsIDEgNDIwIDU5MykgcmVjZWl2ZWQgb25seSA2OTEgNjg3IG9uIDIwMjYtMDktMTgg4oCUIGEgcGFydGlhbCBwYXltZW50LgpUaGUgb2xkZXN0IGluc3RhbG1lbnQgbm90IGZ1bGx5IHBhaWQgaXMgbm8uIDIsIGR1ZSAyMDI2LTA3LTI0OiA3IGRheXMgdG8gMzEgSnVseSArIDMxIChBdWd1c3QpICsgMzAgKFNlcHRlbWJlcikgKyAxID0gNjkg4oaSIERQRCA2OSwgYnVja2V0IDYx4oCTOTAuClRoZSBTZXB0ZW1iZXIgcGF5bWVudCBtYWtlcyB0aGUgbG9hbiBsb29rIGFsaXZlLCBidXQgaXQgd2VudCB0byB0aGUgbmV3ZXN0IGluc3RhbG1lbnQgYW5kIGxlZnQgdGhlIG9sZGVzdCBkZWJ0IHdoZXJlIGl0IHdhcy4gVGhhdCBpcyB3aHkgRFBEIGNvdW50cyBmcm9tIHRoZSBvbGRlc3QgdW5wYWlkIGR1ZSBkYXRlLCBub3QgZnJvbSB0aGUgbGFzdCBwYXltZW50Lg=="}
```

<!-- challenge:end -->
