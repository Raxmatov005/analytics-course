# SQL playground

<span class="badge">Free practice</span> <span class="badge company">Nothing to install</span>

This is your own copy of the **Nur Finance** database — the same 11 tables the bank's analysts use in this course, with every row. Do anything here:

- **Ask questions** with `SELECT`, `WHERE`, `GROUP BY`, `JOIN`.
- **Build** your own tables with `CREATE TABLE`, fill them with `INSERT`, fix rows with `UPDATE`, remove them with `DELETE`, throw a table away with `DROP TABLE`.
- **Change the company's tables too** — try `UPDATE loans SET status = 'closed' WHERE loan_id = 1;` and look again.

Everything you change is **kept on this device** — close the page, come back tomorrow, your tables are still there. Changed too much? Open **Database** (bottom right) and tap **↺ Reset** to get the original data back. Your homework checks always use the original data, so nothing you do here can spoil them.

**Find your way:** the **Database** panel lists every table, its columns, which column is the key (PK) and where each foreign key (FK) points — tap an FK to jump to that table. Tap a name to put it into your query, **+ SELECT** for a ready query, **Show rows** to peek at the data. The tables you create appear at the top as *Your tables*.

```sqlplay
```

## Ideas to try

1. Make a table of your own favourite loans: `CREATE TABLE my_loans (loan_id INTEGER PRIMARY KEY, why TEXT);` then `INSERT` three loans and `JOIN` it to `loans` to see their amounts.
2. Close a loan: `UPDATE loans SET status = 'closed', closed_at = '2026-10-01' WHERE loan_id = 5;` — then count loans by status and see the number move.
3. Delete every payment of one loan, then check what `installments` still says about it. This is why real databases protect foreign keys.
4. Finished? **↺ Reset** in the Database panel.

At work you would do the same in an app such as DBeaver, DataGrip or SQL Server Management Studio — the SQL is the same.
