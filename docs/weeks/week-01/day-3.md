# Week 1 · Day 3 — Tables that talk to each other

<span class="badge">Learn 60 min</span> <span class="badge">Practice 60 min</span> <span class="badge company">Company corner</span>

> STORY **Wednesday, 9:40.** Sevara, head of collections (*взыскание*), arrives with a laptop and a spreadsheet called `loans_FINAL_v7.xlsx`. *"Before the database existed, this was the database. One row per loan, and every time a borrower asked to restructure we added three more columns. It has 212 columns now. Timur from BI says it's 'not normalised'. I don't know what that means; I know that when a branch changes its phone number I have to fix 400 cells."* Madina: *"Today you learn what Timur meant — and you design Sevara a proper table for restructurings."*

## Today in 3 lines

- You can read the **Nur Finance ER diagram** as a list of tables and relationships, and say what each key enforces.
- You can explain **1NF, 2NF, 3NF** on Sevara's spreadsheet and show how it splits into our tables.
- You can write **CREATE TABLE** with types, `NOT NULL`, `PRIMARY KEY`, `FOREIGN KEY`, and **INSERT / UPDATE / DELETE** rows — on a scratch table, never on the course tables.

---

## 1. Learn — keys, the diagram, and normal forms

### Keys, one level deeper

On Monday a primary key was "the unique ID", and in the lab you saw it refuse a second row with the same id. Today, everything the keys *enforce*:

- **Primary key (PK)** — the database refuses a second row with the same value, and refuses an empty value. `loans.loan_id`.
- **Foreign key (FK)** — the database refuses a value that does not exist in the parent table. You cannot insert a loan for `customer_id = 999999` if no such customer exists, and you cannot delete a customer who still has loans (unless the designer said *cascade*). This is **referential integrity** (*ссылочная целостность*): the data cannot point at nothing.
- **Composite key** — a key made of two columns. `installments` could have used `(loan_id, installment_no)` as its PK; the designer chose a separate `installment_id` (a *surrogate key*, суррогатный ключ) because single-column keys are easier to join on.
- **Natural vs surrogate** — a passport number is a natural key (it means something); `customer_id = 4516` is a surrogate (invented by us). Companies use surrogates for PKs and keep natural keys as ordinary columns — people change passports; `4516` never changes.

> 💡 **Key idea.** A foreign key protects the *child*: no row may point at a parent that does not exist, and no parent may disappear while children point at it. It says nothing about how many children a parent has — one-to-many is the whole point.

### The ER diagram of Nur Finance

An **entity-relationship diagram** (ER, *ER-диаграмма*) is the floor plan. Ours, as a list (compare with your Day-1 P9 sketch):

| Relationship | Cardinality | Key column (an FK in a production design) |
|---|---|---|
| customers → applications | 1 — ∞ | `applications.customer_id` FK |
| products → applications | 1 — ∞ | `applications.product_id` FK |
| branches → applications | 1 — ∞ | `applications.branch_id` FK |
| staff → applications (officer) | 1 — ∞ | `applications.officer_id` FK |
| applications → loans | 1 — 0..1 | `loans.application_id` FK, unique |
| customers → loans | 1 — ∞ | `loans.customer_id` FK |
| products → loans | 1 — ∞ | `loans.product_id` FK |
| branches → loans | 1 — ∞ | `loans.branch_id` FK |
| loans → installments | 1 — ∞ | `installments.loan_id` FK |
| loans → payments | 1 — ∞ | `payments.loan_id` FK |
| installments → payments | 1 — ∞ | `payments.installment_id` FK |
| loans → collections_actions | 1 — ∞ | `collections_actions.loan_id` FK |
| staff → collections_actions (collector) | 1 — ∞ | `collections_actions.collector_id` FK |
| branches → staff | 1 — ∞ | `staff.branch_id` FK |
| customers → app_events, applications → app_events | 1 — ∞ | two FKs |
| dim_date → (any date column) | 1 — ∞ | by convention, not enforced |

```game
{"type": "connect", "id": "w01d3-g1", "title": "Child column → parent key", "left": {"name": "child columns (FK)", "cols": ["payments.installment_id", "collections_actions.collector_id", "staff.branch_id", "loans.application_id", "installments.loan_id"]}, "right": {"name": "parent keys (PK)", "cols": ["installments.installment_id", "staff.staff_id", "branches.branch_id", "applications.application_id", "loans.loan_id", "customers.customer_id"]}, "links": [["payments.installment_id", "installments.installment_id"], ["collections_actions.collector_id", "staff.staff_id"], ["staff.branch_id", "branches.branch_id"], ["loans.application_id", "applications.application_id"], ["installments.loan_id", "loans.loan_id"]], "why": "Every FK points at the parent's PK; the name does not always match (collector_id → staff.staff_id). Nothing on the left points at customers here."}
```

**One honest note about our copy.** These relationships are real — every `loans.customer_id` does point at a customer — but the course database is a teaching copy loaded from CSV files, and it declares **no** PRIMARY KEY or FOREIGN KEY constraints. Nothing in it would refuse a bad row; the joins work because the data is consistent, not because the engine checks it. A foreign key can only point at a column its parent declares as PRIMARY KEY (or UNIQUE), so when today's exercises need the database to say *no*, they first build a small keyed copy of the ids.

Two things to notice. `loans.customer_id` is *redundant* — you could reach the customer through the application — and the designers kept it anyway, because almost every loan query needs the customer and nobody wants a two-step join each time. That is a deliberate, documented exception to the rules below. And `payments` has *two* FKs into the loan world (loan and instalment): a payment knows which instalment it was for, so you can see partial and late payments per instalment.

### Normalisation — Sevara's spreadsheet

Here are eight of the 212 columns of `loans_FINAL_v7.xlsx`, two rows:

| loan_id | customer | phone | product | rate | branch_phone | inst1_due | inst1_paid | inst2_due | inst2_paid | … |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Kamola Saidova | +99890… | Consumer loan | 0.30 | 71-200-01-01 | 2025-04-28 | 2025-04-27 | 2025-05-28 | 2025-05-30 | … |
| 2 | Kamola Saidova | +99890… | Consumer loan | 0.30 | 71-200-01-01 | 2025-12-05 | 2026-01-05 | 2026-01-05 | | … |

What is wrong, in the words of the three **normal forms** (*нормальные формы*):

**1NF — one value per cell, no repeating groups.** `inst1_due, inst1_paid, inst2_due, …` is the same fact (an instalment) repeated across columns. A 48-month Auto loan needs 96 columns; a 3-month BNPL leaves 90 empty. Fix: move instalments to their own rows → the `installments` table, one row per `(loan_id, installment_no)`. The same for payments.

**2NF — every column depends on the *whole* key.** Imagine the key were `(loan_id, installment_no)`: `customer` and `product` depend on `loan_id` alone, not on the instalment. Fix: columns about the loan go to `loans`; columns about the instalment stay in `installments`. (2NF only matters when the key is composite; with surrogate keys you reach it almost automatically.)

**3NF — no column depends on another non-key column.** `rate` depends on `product`, not on the loan; `branch_phone` depends on the branch. When the Consumer rate changes, 2 000 cells change; when Tashkent Central gets a new phone, Sevara fixes 400 cells and misses 12. Fix: `products(product_id, name, annual_rate)`, `branches(branch_id, …)`, and the loan keeps only the ids. One fact, one place — **update anomalies** (*аномалии обновления*) disappear.

> 💡 **Key idea.** Normalisation is one rule said three ways: **one fact, one place.** Repeating columns break 1NF, a column that depends on part of the key breaks 2NF, a column that depends on another ordinary column breaks 3NF — and each of them means the same fact must be changed in many cells.

```game
{"type": "sort", "id": "w01d3-g2", "title": "Which normal form does it break?", "q": "Each line is a problem in a spreadsheet. Put it under the normal form it breaks.", "groups": {"1NF — repeating groups, many values in a cell": ["inst1_due, inst2_due, inst3_due … as columns", "two phone numbers typed into one cell", "action1_type, action2_type … as columns"], "2NF — depends on part of a composite key": ["key (loan_id, installment_no), but customer_name depends on loan_id alone", "key (loan_id, installment_no), but product depends on loan_id alone"], "3NF — depends on another non-key column": ["rate depends on the product, not on the loan", "branch_phone depends on the branch", "the customer's region stored on every loan row"]}}
```

After the three fixes, Sevara's one sheet *is* our eleven tables. That is not a coincidence: normalisation is the procedure that produced them.

Why not always normalise everything? Because reading needs joins, and joins cost time. The `loans.customer_id` shortcut above, and tomorrow's whole topic (warehouses *de*-normalise on purpose), are the other side of the trade.

### DDL — creating tables

**DDL** (Data Definition Language, *язык определения данных*) is the SQL that shapes tables: `CREATE`, `ALTER`, `DROP`. Types you will use this course:

| Need | SQL Server | SQLite | PostgreSQL |
|---|---|---|---|
| whole number / id | `INT`, `BIGINT` | `INTEGER` | `INT`, `BIGINT` |
| money (UZS, no fractions) | `BIGINT` or `DECIMAL(18,0)` | `INTEGER` | `BIGINT`/`NUMERIC` |
| rate, ratio | `DECIMAL(10,4)` | `REAL` | `NUMERIC(10,4)` |
| text | `NVARCHAR(100)` | `TEXT` | `VARCHAR(100)` |
| date / date-time | `DATE` / `DATETIME2` | `TEXT` (`YYYY-MM-DD`) | `DATE` / `TIMESTAMP` |
| auto-numbered id | `INT IDENTITY(1,1)` | `INTEGER PRIMARY KEY AUTOINCREMENT` | `SERIAL` / `GENERATED … AS IDENTITY` |

```sql
CREATE TABLE scratch_loan_keys (                    -- a keyed copy of the loan ids (the course tables carry no keys)
    loan_id    INT          NOT NULL PRIMARY KEY    -- SQLite: INTEGER NOT NULL PRIMARY KEY
);
INSERT INTO scratch_loan_keys (loan_id) SELECT loan_id FROM loans;   -- 7828 rows; DML on a scratch_ table

CREATE TABLE scratch_demo (
    demo_id    INT          NOT NULL PRIMARY KEY,   -- SQLite: INTEGER NOT NULL PRIMARY KEY
    loan_id    INT          NOT NULL,
    note       NVARCHAR(200),                       -- SQLite: TEXT
    created_on DATE         NOT NULL,
    FOREIGN KEY (loan_id) REFERENCES scratch_loan_keys(loan_id)
);
```

Read it aloud: *"a demo row must have an id (unique) and a loan it belongs to (which must exist in the keyed list of loans); the note may be empty."* `ALTER TABLE scratch_demo ADD reason NVARCHAR(100);` adds a column; `DROP TABLE scratch_demo;` deletes the table and everything in it — no undo.

### DML — changing rows

**DML** (Data Manipulation Language) changes *rows*: `INSERT`, `UPDATE`, `DELETE`. **Rule for this course: DML only on tables whose name starts with `scratch_` or `my_`.** The eleven course tables are read-only for you; if you change them, every "expect 7828" on every page stops being true, and your homework numbers will not match the keys. If it happens anyway: everything you run here changes only *your practice copy* of the database, kept on your device. Open **Database** (bottom right) → **↺ Reset**, and the original data is back. Your homework checks always read the original, so they stay right either way.

```sql
INSERT INTO scratch_demo (demo_id, loan_id, note, created_on)
VALUES (1, 2242, 'called, promised to pay', '2026-10-01');

UPDATE scratch_demo SET note = 'paid in full' WHERE demo_id = 1;

DELETE FROM scratch_demo WHERE demo_id = 1;
```

> ⚠️ **Watch out.** `UPDATE` and `DELETE` without `WHERE` hit **every** row, with no warning and no undo. Habit for life: write the `WHERE` first, run it as a `SELECT`, look at the rows, then change the verb.

```game
{"type": "bug", "id": "w01d3-g3", "title": "One request, or all of them?", "q": "Sevara approved request 1 only. This statement approves something else. Tap the line that is wrong.", "code": "-- approve Sevara's request 1\nUPDATE scratch_restructurings\nSET status = 'approved',\n    approved_by = 68;", "answer": [3], "why": "The statement ends without a WHERE, so every row of the table is approved. It needs WHERE restructuring_id = 1 (or WHERE loan_id = 2242) before the semicolon."}
```

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

*"When a borrower can't pay, we sometimes stretch the loan: new term, smaller monthly payment. Today that lives in three columns of my sheet per restructuring. Design it properly."*

**Step 1 — what is one row?** One restructuring *event* of one loan. A loan can be restructured more than once → `loans 1 — ∞ restructurings`. So `loan_id` is an FK, not the PK.

**Step 2 — what do we need to know about the event?** When it was requested and decided; the old and new term; the new monthly payment; the reason (text, or better a short code); who approved it (a staff member → FK); status (`requested`, `approved`, `rejected`, `active`, `completed`).

**Step 3 — what must never be empty?** The loan, the request date, the status. The decision date may be empty while it is pending.

**Step 4 — what did we *not* put in?** The customer's name (reachable via loan → customer: 3NF), the product rate (via loan → product), the approver's branch (via staff). Every one of them would be a 3NF violation and a future "fix 400 cells".

```sql
-- SQL Server
-- the keyed copies the foreign keys point at (skip scratch_loan_keys if you made it in section 1)
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
    reason_code        NVARCHAR(30)  NOT NULL,     -- 'job_loss', 'illness', 'business_down', 'other'
    approved_by        INT           NULL,
    status             NVARCHAR(20)  NOT NULL,
    FOREIGN KEY (loan_id)     REFERENCES scratch_loan_keys(loan_id),
    FOREIGN KEY (approved_by) REFERENCES scratch_staff_keys(staff_id)
);
-- SQLite: replace restructuring_id's type with  INTEGER PRIMARY KEY AUTOINCREMENT,
-- INT → INTEGER, BIGINT → INTEGER, NVARCHAR(n) → TEXT, DATE → TEXT.
```

Sevara reads the column list and says "yes, that's all of it, and it's ten columns, not three per event". That sentence — a business user recognising their process in your table — is the test of a good design. In Practice you build it, step by step, in the SQLite dialect this site runs.

---

## 3. Practice (60 min)

Every question has its own answer box; P4–P6 are one guided lab that runs on your practice copy. Answer, check, read why — your answers are saved in this browser.

**P1.** Here is a table Timur found on a shared drive, `collections_log`:

| action_id | loan_id | customer_name | customer_phone | collector_name | collector_branch | branch_region | action1_type | action1_date | action2_type | action2_date |
|---|---|---|---|---|---|---|---|---|---|---|

Name every normalisation problem you see and which normal form it breaks.

```task
{"id": "w01d3-p1", "kind": "free", "min": 25, "model": "1NF: action1_*, action2_* are a repeating group → one row per action. 3NF: customer_name and customer_phone depend on the loan's customer, not on the action; collector_branch depends on the collector; branch_region depends on the branch (a two-step transitive dependency). After fixing: exactly our collections_actions(action_id, loan_id, action_date, action_type, collector_id, outcome) plus the existing staff, branches and customers.", "rubric": ["1NF: the action1_* / action2_* repeating group, fixed with one row per action", "3NF: customer columns depend on the customer, collector_branch on the collector, branch_region on the branch", "The fixed design is collections_actions plus customers, staff and branches"]}
```

**P2.** In `installments`, which columns would be a valid *composite* natural key — and why did the designers add `installment_id` anyway?

```task
{"id": "w01d3-p2", "kind": "choice", "options": ["(loan_id, installment_no)", "(loan_id, principal_due)", "(due_date, total_due)", "loan_id alone"], "answer": 0, "explain": "A loan has exactly one instalment number 1, one number 2, … so (loan_id, installment_no) is unique. The surrogate installment_id is shorter to join on (payments.installment_id is one column, not two) and never changes if a schedule is regenerated."}
```

**P3.** Which of these does a FOREIGN KEY from `loans.customer_id` to `customers.customer_id` **prevent**? Tick all.

```task
{"id": "w01d3-p3", "kind": "multi", "options": ["(a) two loans for the same customer", "(b) a loan whose customer_id does not exist in customers", "(c) a customer with no loans", "(d) deleting a customer who still has loans"], "answer": [1, 3], "explain": "(b) and (d). (a) is allowed — one-to-many is the point. (c) is allowed — the FK constrains the child, not the parent."}
```

**P4–P6. Lab — Sevara's restructurings.** Build the worked example's table in the SQLite dialect this site runs, fill it with three real requests, approve one, undo one, and show Sevara the result next to each loan. The lab ticks each step off as your practice copy reaches it.

```sqllab
{"id": "w01d3-lab", "title": "Sevara's restructurings", "intro": "Two keyed id lists, one table with two foreign keys, three requests — then an approval, an undo and a join. Use **💡 Show me** for the exact SQLite text.", "steps": [
  {"say": "Make the two keyed copies the foreign keys will point at: `scratch_loan_keys` (every `loan_id` of `loans`) and `scratch_staff_keys` (every `staff_id` of `staff`), each with its id as PRIMARY KEY. (If `scratch_loan_keys` already exists from section 1, make only the staff one.)", "hint": "CREATE TABLE scratch_loan_keys (loan_id INTEGER NOT NULL PRIMARY KEY);\nINSERT INTO scratch_loan_keys (loan_id) SELECT loan_id FROM loans;\nCREATE TABLE scratch_staff_keys (staff_id INTEGER NOT NULL PRIMARY KEY);\nINSERT INTO scratch_staff_keys (staff_id) SELECT staff_id FROM staff;", "expect": "SELECT (SELECT COUNT(*) FROM scratch_loan_keys) + (SELECT COUNT(*) FROM scratch_staff_keys)", "want": 7928},
  {"say": "Create `scratch_restructurings` with the worked example's ten columns, in SQLite types, and its two FOREIGN KEYs: `loan_id` → `scratch_loan_keys`, `approved_by` → `scratch_staff_keys`.", "hint": "CREATE TABLE scratch_restructurings (\n    restructuring_id    INTEGER PRIMARY KEY AUTOINCREMENT,\n    loan_id             INTEGER NOT NULL,\n    requested_on        TEXT    NOT NULL,\n    decided_on          TEXT,\n    old_term_months     INTEGER NOT NULL,\n    new_term_months     INTEGER NOT NULL,\n    new_monthly_payment INTEGER,\n    reason_code         TEXT    NOT NULL,\n    approved_by         INTEGER,\n    status              TEXT    NOT NULL,\n    FOREIGN KEY (loan_id)     REFERENCES scratch_loan_keys(loan_id),\n    FOREIGN KEY (approved_by) REFERENCES scratch_staff_keys(staff_id)\n);", "expect": "SELECT COUNT(*) FROM pragma_foreign_key_list('scratch_restructurings')", "want": 2},
  {"say": "**P4.** Insert three requests — loans 2242, 4567 and 4503 (real active loans that are furthest behind): requested on 2026-09-28, old term 24, new term 36, reason `business_down`, status `requested`; leave `decided_on` and `approved_by` empty. The id fills itself.", "hint": "INSERT INTO scratch_restructurings\n    (loan_id, requested_on, old_term_months, new_term_months, reason_code, status)\nVALUES\n    (2242, '2026-09-28', 24, 36, 'business_down', 'requested'),\n    (4567, '2026-09-28', 24, 36, 'business_down', 'requested'),\n    (4503, '2026-09-28', 24, 36, 'business_down', 'requested');", "expect": "SELECT COUNT(*) FROM scratch_restructurings", "want": 3},
  {"say": "**P5.** Sevara approved the request for loan 2242: staff member 68 said yes on 2026-09-30, new monthly payment 1 200 000. Update that one row only — look at it with a SELECT first.", "hint": "SELECT * FROM scratch_restructurings WHERE loan_id = 2242;\nUPDATE scratch_restructurings\nSET status = 'approved', decided_on = '2026-09-30', approved_by = 68, new_monthly_payment = 1200000\nWHERE loan_id = 2242;", "expect": "SELECT COUNT(*) FROM scratch_restructurings WHERE status = 'approved' AND approved_by = 68 AND decided_on = '2026-09-30' AND new_monthly_payment = 1200000", "want": 1},
  {"say": "**P6.** \"Undo\" the request for loan 4503: delete that one row.", "hint": "SELECT * FROM scratch_restructurings WHERE loan_id = 4503;\nDELETE FROM scratch_restructurings WHERE loan_id = 4503;", "expect": "SELECT COUNT(*) * 10 + COALESCE(SUM(loan_id = 4503), 0) FROM scratch_restructurings", "want": 20},
  {"say": "Show Sevara each request next to its loan: save a table `scratch_sevara_list` with `loan_id`, the loan's `principal` and `term_months` from `loans`, and the request's `new_term_months` and `status` — a JOIN on `loan_id` (next week's topic; copy it today).", "hint": "CREATE TABLE scratch_sevara_list AS\nSELECT r.loan_id, l.principal, l.term_months, r.new_term_months, r.status\nFROM scratch_restructurings r\nJOIN loans l ON l.loan_id = r.loan_id;\nSELECT * FROM scratch_sevara_list;", "expect": "SELECT COUNT(*) FROM scratch_sevara_list WHERE principal IS NOT NULL", "want": 2}],
 "cleanup": "DROP TABLE IF EXISTS scratch_sevara_list; DROP TABLE IF EXISTS scratch_restructurings; DROP TABLE IF EXISTS scratch_staff_keys; DROP TABLE IF EXISTS scratch_loan_keys"}
```

Look at `term_months` in your `scratch_sevara_list`: loan 2242 really runs 6 months and loan 4567 24 — not the 24 you typed as `old_term_months` for both. A stored copy of a fact that lives elsewhere is already a redundancy you must keep in sync; a stricter design would read the old term from `loans` and store only the new one. And if you forgot the `WHERE` on the update, every row was approved — **↺ Start over** and redo it; that is exactly why the rule says scratch tables only.

**P7.** Try to insert a restructuring for `loan_id = 999999` (it is not in `scratch_loan_keys`). On this site — SQLite, with foreign keys switched off, which is the engine's own default — what happens?

```task
{"id": "w01d3-p7", "kind": "choice", "options": ["An error: FOREIGN KEY constraint failed", "The row is accepted silently", "SQLite adds loan 999999 to scratch_loan_keys", "The whole table is dropped"], "answer": 1, "explain": "SQLite checks foreign keys only while PRAGMA foreign_keys = ON is set on the connection (run it on its own first); then you get 'FOREIGN KEY constraint failed'. SQL Server refuses the row by default. What should happen is the refusal: constraints protect you only if the engine enforces them, so always check what yours does."}
```

**P8.** `loans` stores `customer_id` although it is reachable through `applications`. Is this a 3NF violation? Argue both sides in two sentences each.

```task
{"id": "w01d3-p8", "kind": "free", "min": 30, "model": "Strictly yes: customer_id depends on application_id, a non-key column, so it is a transitive dependency and could become inconsistent (a loan pointing to a different customer than its application). Pragmatically no harm: it is written once at disbursement and never changes, and it saves a join on the most common query in the company; designers call this a controlled denormalisation and document it. Thursday's warehouse does this on a grand scale.", "rubric": ["For: customer_id depends on application_id, a non-key column — a transitive dependency that could drift", "Against: written once, never changes, saves a join on the most common query", "Calls it a controlled, documented denormalisation"]}
```

> 🚀 **Stretch (optional, +5 XP).** **P9.** Design a `scratch_promises` table: a collector records a borrower's *promise to pay* (loan, collector, date promised, amount promised, date actually paid or empty, kept yes/no). List its columns, say which are NOT NULL and which are FKs, and explain one column you deliberately left out. (Write the `CREATE TABLE` in any box if you like — it is a scratch table.)

```task
{"id": "w01d3-p9", "kind": "free", "min": 30, "model": "Columns: promise_id PK; loan_id FK NOT NULL; collector_id FK → staff, NOT NULL; promised_on (when the call happened) NOT NULL; promise_date (the day she promised to pay) NOT NULL; promised_amount NOT NULL; paid_on NULL; kept (0/1) NULL until the promise date passes. Left out: the borrower's phone (reachable via loan → customer), the collector's branch (via staff), and the loan's DPD at the time — a computed fact; store it only if you need the historical value, then call it dpd_at_promise and accept the redundancy knowingly.", "rubric": ["A PK and two FKs: loan_id and collector_id → staff", "NOT NULL on what must exist at recording time; paid_on and kept may be empty", "A left-out column with a 3NF reason (or a snapshot named as such)"]}
```

---

## 4. Self-check

```check
{"id": "w01d3-sc", "questions": [
  {"type": "single", "q": "A column depends on another non-key column. Which normal form is broken, and what goes wrong when the data changes?", "options": ["1NF — a cell holds two values", "3NF — the same fact sits in many cells, and a change misses some of them (an update anomaly)", "2NF — the key has two columns", "None — that is just redundancy, not a rule"], "answer": 1, "explain": "rate depends on product, branch_phone on the branch: change it once and you must find every copy (→ section 1, Normalisation)."},
  {"type": "multi", "q": "What does a FOREIGN KEY refuse? Tick both.", "options": ["A child value that does not exist in the parent table", "A second child row for the same parent", "Deleting a parent that still has children (unless the design says cascade)", "A parent with no children"], "answer": [0, 2], "explain": "Referential integrity: the data cannot point at nothing; one-to-many is allowed (→ section 1, Keys, one level deeper)."},
  {"type": "single", "q": "What should you always do before running an UPDATE or DELETE?", "options": ["Write the WHERE first and run it as a SELECT to see exactly which rows it hits", "Run it twice to be sure", "Drop the table first", "Nothing — the database asks for confirmation"], "answer": 0, "explain": "No WHERE = every row, and there is no undo (→ section 1, DML)."}
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

Nur Finance as of 2026-10-01 (you will compute this yourself next week, on Week 2 · Day 3; today just read the shape): 413 loans have at least one matured instalment that is not fully paid; by bucket **14 / 124 / 25 / 16 / 234** for 0 (due today) / 1–30 / 31–60 / 61–90 / 90+. The 90+ pile is big because the dataset keeps written-off loans in `loans` with their unpaid schedules: 234 = 190 `written_off` + 44 `default` — the status column and the DPD computation agree, which is the first check you run on any portfolio report.

> ⚠️ **Watch out.** "Not *fully* paid": an instalment with a partial payment is still past due. If you count only instalments with no payment at all you get 399 loans and a 90+ bucket of 217 — a wrong number that looks perfectly reasonable.

**FPD / SPD / TPD — first, second, third payment default** (*дефолт по первому платежу*). A loan is an FPD if its **1st instalment** was not paid within X days of its due date; SPD and TPD the same for the 2nd and 3rd. X is a convention: **30 days is the common one** (FPD30); some companies report FPD7 or FPD0 (not paid *on* the due date). Always say which.

Why does everyone watch FPD? Two reasons:

1. **Early warning for new products and new rules.** A 36-month Auto loan takes three years to show its full loss. Its FPD you know in 60 days. If a new scoring cut-off or a new channel was a mistake, FPD is the first number that moves — months before the 90+ bucket.
2. **Fraud.** A borrower who never intended to repay does not pay the first instalment. Genuine financial trouble usually arrives later. A spike in FPD on one branch, one officer or one app version is the classic fraud signal; a spike in 61–90 is an economy signal.

Nur Finance FPD30 as of the data: of the 7 099 loans whose first instalment fell due on or before 1 September 2026 (so that 30 days have passed), **91** had not paid it in full within 30 days → **1.28 %**. (You write the query next week, on Week 2 · Day 4; the number is here so you know what "normal" looks like for this book.)

Tomorrow: Madina's customer count does not match HR's. Bring your Day-1 P8 note — detective day.

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
  {"type": "multi", "q": "In a production design, installments.loan_id is a FOREIGN KEY to loans.loan_id. What does it refuse?", "options": ["An instalment whose loan_id does not exist in loans", "Many instalments for the same loan", "Deleting a loan that still has instalments", "A loan with no instalments yet"], "answer": [0, 2], "explain": "The FK keeps the child from pointing at nothing; one-to-many is allowed, and it constrains the child, not the parent (→ section 1, Keys, one level deeper)."},
  {"type": "single", "q": "In Sevara's sheet, the columns inst1_due, inst1_paid, inst2_due, inst2_paid… repeat the same fact across columns. Which normal form does that break?", "options": ["1NF", "2NF", "3NF", "None — it is fine for short loans"], "answer": 0, "explain": "A repeating group breaks 1NF; the fix is one row per instalment, the installments table (→ section 1, Normalisation)."},
  {"type": "single", "q": "In this sheet, rate depends on product, not on the loan. Which normal form is broken, and what goes wrong?", "code": "loan_id | customer | product       | rate | branch_phone\n1       | Kamola   | Consumer loan | 0.30 | 71-200-01-01\n2       | Kamola   | Consumer loan | 0.30 | 71-200-01-01", "options": ["1NF — a cell holds two values", "3NF — when the Consumer rate changes, thousands of cells must change and some get missed", "2NF — the key is composite", "No form is broken; rate is a number"], "answer": 1, "explain": "A column depending on another non-key column is a 3NF violation and causes update anomalies; the rate belongs in products (→ section 1, Normalisation)."},
  {"type": "single", "q": "What does this statement do?", "code": "UPDATE scratch_restructurings\nSET status = 'approved';", "options": ["Approves the most recent row only", "Approves every row in the table", "Fails because WHERE is missing", "Nothing until you add COMMIT"], "answer": 1, "explain": "UPDATE and DELETE without WHERE hit every row; write the WHERE first and run it as a SELECT (→ section 1, DML)."},
  {"type": "single", "q": "On SQLite with foreign keys off (PRAGMA foreign_keys = OFF, the engine's own default), you run this. Loan 999999 is not in scratch_loan_keys. What happens?", "code": "INSERT INTO scratch_restructurings\n  (loan_id, requested_on, old_term_months, new_term_months, reason_code, status)\nVALUES (999999, '2026-09-28', 24, 36, 'other', 'requested');", "options": ["FOREIGN KEY constraint failed", "The row is accepted silently", "SQLite creates loan 999999", "The whole table is dropped"], "answer": 1, "explain": "A constraint protects you only if the engine enforces it; SQLite checks FKs only while PRAGMA foreign_keys is ON (→ P7)."},
  {"type": "single", "q": "On which tables may you run INSERT, UPDATE or DELETE in this course?", "options": ["Any table, as long as you use WHERE", "Only tables whose name starts with scratch_ or my_", "Only loans and customers", "None — DML is never allowed"], "answer": 1, "explain": "The eleven course tables are read-only, or every expected number on every page stops being true (→ section 1, DML)."},
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
