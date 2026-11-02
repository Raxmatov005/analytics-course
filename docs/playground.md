# SQL playground

<span class="badge">Free practice</span> <span class="badge company">Nothing to install</span>

> 🧭 **What this page is for.** A sandbox you cannot break: try any SQL, including the commands that create, change and delete data — and practise them once, with checks, in the lab below the editor.

This is your own copy of the **Nur Finance** database — the same 11 tables the bank's analysts use in this course, with every row. Do anything here:

- **Ask questions** with `SELECT`, `WHERE`, `GROUP BY`, `JOIN`.
- **Build** your own tables with `CREATE TABLE`, fill them with `INSERT`, fix rows with `UPDATE`, remove them with `DELETE`, throw a table away with `DROP TABLE`.
- **Change the company's tables too** — try `UPDATE loans SET status = 'closed' WHERE loan_id = 1;` and look again.

Everything you change is **kept on this device** — close the page, come back tomorrow, your tables are still there. Changed too much? Open **Database** (bottom right) and tap **↺ Reset** to get the original data back. Your homework checks always use the original data, so nothing you do here can spoil them.

**Find your way:** the **Database** panel lists every table, its columns, which column is the key (PK) and where each foreign key (FK) points — tap an FK to jump to that table. Tap a name to put it into your query, **+ SELECT** for a ready query, **Show rows** to peek at the data. The tables you create appear at the top as *Your tables*.

```sqlplay
```

## The four commands — a mini-reference

Four commands change data — **CREATE**, **INSERT**, **UPDATE**, **DELETE** — and two more change or remove a whole table: **ALTER** and **DROP**. One runnable example each, on a small table of your own, `my_notes`. Run the boxes in order. The full lesson, with keys and traps, is [Week 1 · Day 3](weeks/week-01/day-3.md).

### CREATE TABLE — make an empty table

**What it is.** **CREATE TABLE** makes a new, empty table: its name, then each column with its type and rules.

**How to write it.**

```sql
CREATE TABLE my_notes (
    -- the key: one value per row, filled in for you
    note_id  INTEGER PRIMARY KEY,
    loan_id  INTEGER NOT NULL,  -- must be filled
    note     TEXT    NOT NULL
);
```

*✓ Done — table created*. **Database → Your tables** now lists `my_notes` with 0 rows.

**When you use it.** To keep a list, a log or a result of your own.

**Your turn.** Step 1 of the lab below.

### INSERT — add rows

**What it is.** **INSERT** adds new rows. Name the columns, then one bracket of values per row, in the same order.

**How to write it.**

```sql
INSERT INTO my_notes (loan_id, note)
VALUES (1, 'Called the customer'), (2, 'Paid early');
SELECT * FROM my_notes;
```

2 rows: notes 1 and 2. `note_id` filled itself.

**When you use it.** To fill a table by hand, or from a query with `INSERT INTO … SELECT …`.

**Your turn.** Step 2 of the lab below.

### UPDATE — change rows

**What it is.** **UPDATE … SET … WHERE** changes values in rows that exist. `WHERE` decides which rows; without it, every row changes.

**How to write it.**

```sql
UPDATE my_notes SET note = 'Called twice' WHERE note_id = 1;
SELECT * FROM my_notes;
```

Note 1 now reads *Called twice*; note 2 is untouched.

**When you use it.** To correct or complete a row. Run the `WHERE` as a `SELECT` first.

**Your turn.** Step 3 of the lab below.

### DELETE — remove rows

**What it is.** **DELETE FROM … WHERE** removes whole rows. The table stays.

**How to write it.**

```sql
DELETE FROM my_notes WHERE note_id = 2;
SELECT * FROM my_notes;
```

1 row left: note 1.

**When you use it.** To remove a mistaken or unwanted row. There is no undo.

**Your turn.** Step 4 of the lab below.

### ALTER TABLE — change the columns

**What it is.** **ALTER TABLE** changes the shape of a table that has rows: add, rename or remove a column, or rename the table.

**How to write it.**

```sql
ALTER TABLE my_notes ADD COLUMN created_on TEXT;
SELECT * FROM my_notes;
```

Note 1 now has a fourth column, `created_on`, empty (NULL) until you fill it.

**When you use it.** When your table needs one more fact.

**Your turn.** After the lab, in the editor at the top: add a text column `opened_on` to `my_branches`, then look at it with `SELECT * FROM my_branches;`.

### DROP TABLE — remove the whole table

**What it is.** **DROP TABLE** removes a table with all its rows and columns. `DELETE` empties a table; `DROP` makes it disappear.

**How to write it.**

```sql
DROP TABLE IF EXISTS my_notes;   -- IF EXISTS: no error if it is already gone
```

*✓ Done — table removed*. `my_notes` is gone from **Your tables**.

**When you use it.** To clean up tables you no longer need.

> ⚠️ **Watch out.** No command here asks "are you sure?". On this page **↺ Reset** brings the original data back; at work only a backup does.

**Your turn.** When you have finished with the lab, drop `my_branches` in the editor at the top.

## Your first table — a lab with checks

Four steps, one editor. Each **▶ Run** works on your practice copy, then the lab checks the step and opens the next one. Open **Database** while you work: your table appears under *Your tables* as soon as it exists.

```sqllab
{"id": "playground-lab", "title": "Your first table", "intro": "Nur Finance is opening new offices and Madina wants a scratch list before they go into the real branches table. You build it, fill it, fix it and clean it up — create, insert, update, delete.", "steps": [{"say": "Create a table my_branches(branch_id INTEGER PRIMARY KEY, name TEXT, region TEXT). (If a my_branches from Week 1 is still there, run DROP TABLE my_branches; first.)", "hint": "CREATE TABLE my_branches (branch_id INTEGER PRIMARY KEY, name TEXT, region TEXT);", "expect": "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='my_branches'", "want": 1}, {"say": "Insert exactly three branches — any names, regions such as 'Tashkent' or 'Samarkand'.", "hint": "INSERT INTO my_branches (name, region) VALUES ('Chilonzor', 'Tashkent'), ('Registan', 'Samarkand'), ('Old City', 'Bukhara');", "expect": "SELECT COUNT(*) FROM my_branches", "want": 3}, {"say": "Change the region of one of them to 'Fergana' with UPDATE … WHERE.", "hint": "UPDATE my_branches SET region = 'Fergana' WHERE branch_id = 1;", "expect": "SELECT COUNT(*) FROM my_branches WHERE region='Fergana'", "want": 1}, {"say": "Delete the one in Fergana. Then SELECT * FROM my_branches to see the two that are left.", "hint": "DELETE FROM my_branches WHERE region = 'Fergana';", "expect": "SELECT COUNT(*) * 10 + COALESCE(SUM(region = 'Fergana'), 0) FROM my_branches", "want": 20}], "cleanup": "DROP TABLE IF EXISTS my_branches"}
```

> ⚠️ **Watch out.** An `UPDATE` or `DELETE` without `WHERE` changes every row of the table. Here it costs you a **↺ Reset**; at work it costs a restore from backup. Write the `WHERE` first.

## Ideas to try

1. Make a table of your own favourite loans: `CREATE TABLE my_loans (loan_id INTEGER PRIMARY KEY, why TEXT);` then `INSERT` three loans and `JOIN` it to `loans` to see their amounts.
2. Close a loan: `UPDATE loans SET status = 'closed', closed_at = '2026-10-01' WHERE loan_id = 5;` — then count loans by status and see the number move.
3. Delete one loan: `DELETE FROM loans WHERE loan_id = 5;`. Then look for its rows in `installments` and `payments` — they are still there, pointing at a loan that no longer exists (*orphans*). A database that enforces its foreign keys would refuse that delete; SQLite enforces them only when they are declared and switched on (Week 1 · Day 3).
4. Finished? **↺ Reset** in the Database panel.

At work you would do the same in an app such as DBeaver, DataGrip or SQL Server Management Studio — the SQL is the same.

## SQLite and SQL Server, side by side

This site runs SQLite; many banks run SQL Server. Most SQL is the same in both — these are the places where it is not, collected from Weeks 1–3 on one card. Keep it open when you translate a query.

| You want | SQLite (this site) | SQL Server |
|---|---|---|
| the first N rows | `… ORDER BY x LIMIT 5` | `SELECT TOP 5 … ORDER BY x` |
| a value instead of NULL | `COALESCE(x, 0)` or `IFNULL(x, 0)` | `COALESCE(x, 0)` or `ISNULL(x, 0)` |
| glue texts | `a \|\| ' ' \|\| b` (NULL makes it NULL) | `a + ' ' + b` (the same), or `CONCAT(a, ' ', b)` (NULL counts as empty) |
| the length of a text | `LENGTH(s)` counts trailing spaces | `LEN(s)` ignores them; `DATALENGTH(s)` does not |
| a piece of a text | `SUBSTR(s, 1, 4)` | `SUBSTRING(s, 1, 4)`, `LEFT(s, 4)`, `RIGHT(s, 4)` |
| where a piece starts | `INSTR(s, 'x')` | `CHARINDEX('x', s)` |
| "today" | never `date('now')` here: write `'2026-10-01'` | `GETDATE()` — the same warning |
| days between two dates | `julianday(b) - julianday(a)` | `DATEDIFF(day, a, b)` — counts boundaries crossed |
| a month later | `date(d, '+1 month')`: 31 Jan → 3 Mar | `DATEADD(month, 1, d)`: 31 Jan → 28 Feb |
| the year and month of a date | `strftime('%Y-%m', d)` — text | `FORMAT(d, 'yyyy-MM')`, `YEAR(d)`, `MONTH(d)` |
| count where a test is true | `SUM(status = 'x')` | `SUM(IIF(status = 'x', 1, 0))`; `SUM(CASE …)` works in both |
| `7 / 2` | `3`: whole ÷ whole is whole | `3`, the same — write `7 * 1.0 / 2` |
| `10 / 0` | NULL, no error | an error; `10 / NULLIF(0, 0)` gives NULL in both |
| text that is not a number | `CAST('abc' AS INTEGER)` is 0 | an error; `TRY_CAST` gives NULL |
| `'card' = 'Card'` | false; `LIKE` ignores Latin case | usually true: the collation ignores case |
| an alias in `GROUP BY` | allowed | not allowed: repeat the expression |
| a column neither grouped nor aggregated | runs and picks some row | an error |
| a recursive CTE | `WITH RECURSIVE` | `WITH` (and `OPTION (MAXRECURSION n)` past 100 levels) |
| a result saved as a table | `CREATE TABLE t AS SELECT …` | `SELECT … INTO t FROM …` |
| change a view | `DROP VIEW` + `CREATE VIEW` | `CREATE OR ALTER VIEW` |
| `SUM` of a big whole-number column | fine | `INT` overflows past about 2.1 bn: `SUM(CAST(x AS BIGINT))` |
