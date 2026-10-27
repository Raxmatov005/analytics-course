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

## Your first table — a lab with checks

Four steps, one editor. Each **▶ Run** works on your practice copy, then the lab checks the step and opens the next one. Open **Database** while you work: your table appears under *Your tables* as soon as it exists.

```sqllab
{"id": "playground-lab", "title": "Your first table", "intro": "Nur Finance is opening new offices and Madina wants a scratch list before they go into the real branches table. You build it, fill it, fix it and clean it up — create, insert, update, delete.", "steps": [{"say": "Create a table my_branches(branch_id INTEGER PRIMARY KEY, name TEXT, region TEXT).", "hint": "CREATE TABLE my_branches (branch_id INTEGER PRIMARY KEY, name TEXT, region TEXT);", "expect": "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='my_branches'", "want": 1}, {"say": "Insert exactly three branches — any names, regions such as 'Tashkent' or 'Samarkand'.", "hint": "INSERT INTO my_branches (name, region) VALUES ('Chilonzor', 'Tashkent'), ('Registan', 'Samarkand'), ('Old City', 'Bukhara');", "expect": "SELECT COUNT(*) FROM my_branches", "want": 3}, {"say": "Change the region of one of them to 'Fergana' with UPDATE … WHERE.", "hint": "UPDATE my_branches SET region = 'Fergana' WHERE branch_id = 1;", "expect": "SELECT COUNT(*) FROM my_branches WHERE region='Fergana'", "want": 1}, {"say": "Delete the one in Fergana. Then SELECT * FROM my_branches to see the two that are left.", "hint": "DELETE FROM my_branches WHERE region = 'Fergana';", "expect": "SELECT COUNT(*) FROM my_branches WHERE region='Fergana'", "want": 0}], "cleanup": "DROP TABLE IF EXISTS my_branches"}
```

> ⚠️ **Watch out.** An `UPDATE` or `DELETE` without `WHERE` changes every row of the table. Here it costs you a **↺ Reset**; at work it costs a restore from backup. Write the `WHERE` first.

## Ideas to try

1. Make a table of your own favourite loans: `CREATE TABLE my_loans (loan_id INTEGER PRIMARY KEY, why TEXT);` then `INSERT` three loans and `JOIN` it to `loans` to see their amounts.
2. Close a loan: `UPDATE loans SET status = 'closed', closed_at = '2026-10-01' WHERE loan_id = 5;` — then count loans by status and see the number move.
3. Delete every payment of one loan, then check what `installments` still says about it. This is why real databases protect foreign keys.
4. Finished? **↺ Reset** in the Database panel.

At work you would do the same in an app such as DBeaver, DataGrip or SQL Server Management Studio — the SQL is the same.
