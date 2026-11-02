The Analytics Learning course — the full text for an AI helper. Answers to the tasks are deliberately left out.
Part 2 of 3: weeks 4–6.


=====
PAGE: Week 4 · Day 1 — Excel for analysts: the sheet is a table (weeks/week-04/day-1.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-04/day-1
=====

# Week 4 · Day 1 — Excel for analysts: the sheet is a table

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge">Homework</span> <span class="badge company">Company corner</span>

> STORY **Monday, 9:00.** Bekzod, the portfolio manager (*портфельный менеджер*), with the board pack open on his laptop. *"Friday's EDA was good. Now the problem: the board does not read SQL, the CFO does not open a database, and the pack is an Excel file that twelve people edit. I need the portfolio numbers — active loans, outstanding, this year's disbursements, the buckets — **in Excel**, as formulas that still work when the data is refreshed, not as numbers pasted from a query. And the approval rate by channel, because Marketing has their own version again."*

## Today in 3 lines

- Most of the company lives in Excel and Google Sheets; your SQL results have to arrive there as **formulas on a table**, not as pasted numbers.
- An Excel **Table** (Ctrl+T) is your `FROM`; **SUMIFS / COUNTIFS / AVERAGEIFS / MAXIFS** are your `WHERE` + `GROUP BY`; **IF / IFS** is `CASE`; **TRIM / PROPER / LEFT / TEXT** are week 2's string functions with new names.
- By evening you reproduce the week-3 numbers (3 352 active · 208 723 504 430 outstanding · 2026: 3 051 loans / 162 333 060 000) and the approval rate by channel, in cells.

**Today's file:** `data/excel/nur_week4_start.xlsx` — press **⬇ Download** next to the name, then save a copy as `week-04/day-1/practice.xlsx` before you type anything (never work in the original). Google Sheets: upload the workbook itself to Google Drive and open it with Google Sheets — all six sheets come across, the small **Lookup** sheet included (the CSVs in `data/excel/` hold the same data sheets, but not Lookup). **Done today** = the Worked example's check cell shows 208 723 504 430, every Practice box below is ✓, the Quick check is answered, the day quiz is passed — and `functions_pack.xlsx` (HW 4.1) is on its way (due Day 3).

---

## 1. Learn — the sheet is a table, if you make it one

Every number from weeks 1–3 ends up in a spreadsheet: the board pack, the budget, Sevara's printed collections list. The analyst's rule in Excel (*Эксель*) is the same as in SQL: **one definition, computed from the data, reproducible**. A pasted number is wrong the day the data changes; a formula on a table is not.

Open `data/excel/nur_week4_start.xlsx` (built from `nur.db`; `data/excel/README.md` describes every column). It has five data sheets — **Loans**, **Payments**, **Customers**, **Applications**, **Installments** — and a **Lookup** sheet. `Loans` is week 3's `v_loan_status` with fewer columns: one row per loan, as of 2026-10-01. Google Sheets: File → Import → Upload the `.xlsx` (or open it from Google Drive); the six sheets arrive as six tabs. The Table names (`tblLoans` …) may not come across — Sheets users write whole-column ranges instead (see *Excel Tables* below).

**The small table used on this page.** Most subsections show a formula on these five rows first (outstanding in millions of soum), then on the real `Loans` sheet.

| row | A `loan_id` | B `branch` | C `status` | D `disbursed_at` | E `dpd` | F `outstanding` |
|---|---|---|---|---|---|---|
| 2 | 101 | Tashkent South | active | 2026-08-14 | 0 | 100 |
| 3 | 102 | Fergana Central | active | 2026-09-03 | 12 | 50 |
| 4 | 103 | Tashkent North | default | 2025-11-20 | 95 | 40 |
| 5 | 104 | Tashkent South | active | 2026-09-28 | 45 | 30 |
| 6 | 105 | Fergana Central | closed | 2026-10-01 | 0 | 0 |

### A proper table — headers, one row per thing, no merged cells

**What it is.** A **proper table** (*плоская таблица*) is a block of cells a formula can read like a database table. It follows five rules:

1. **One header row** — a short, unique name on top of every column.
2. **One row per thing** — one loan, one payment, one customer. This is the **grain** from week 2.
3. **One column per field** — a month is a *value*, so it goes down a `month` column, not across the header.
4. **Nothing inside the block that is not data** — no blank rows, no subtotals, no notes.
5. **No merged cells** — every cell holds its own value.

**How to write it.** The same four numbers, twice. On the left, a report someone typed; on the right, a table.

```text
NOT A TABLE (a typed report)

+-------- Tashkent (merged) --------+
| Aug 2026     | Sep 2026           |
| 132          | 134                |
+-------- Fergana (merged) ---------+
| 38           | 34                 |
| Total 338                         |

A TABLE (what formulas need)

region   | month   | loans
Tashkent | 2026-08 | 132
Tashkent | 2026-09 | 134
Fergana  | 2026-08 | 38
Fergana  | 2026-09 | 34
```

The left block cannot be filtered, sorted or summed by region: the region sits in a merged cell above the numbers, and the total sits among them. The right block answers any question with one formula. The `Loans` sheet is built this way: 7 828 rows, one per loan, 13 columns, one header row.

**When you use it.**
- Always, for data. Reports (with merged titles and totals) are built *from* a table, on another sheet.
- When a file arrives from a colleague: fix it into this shape first, then write formulas.

> ⚠️ **Watch out.** A total row typed inside the data is counted twice by every `SUM` below it. Keep totals outside the table — Excel Tables have a separate *Total Row* for this. And sort the whole table, never one selected column: if Excel asks *Expand the selection?*, say yes — otherwise only that column moves, and every amount ends up next to another loan's id.

**Your turn.** Look at the left block above. Which of these break the table rules?

### Excel Tables (Ctrl+T) and structured references

**What it is.** An **Excel Table** (*умная таблица*) is a proper table that Excel knows about. Select the block and press Ctrl+T (Insert → Table). The Table gets a name, and its columns get names you can use in formulas. These names are **structured references**: `tblLoans[outstanding]` means "the whole `outstanding` column of `tblLoans`, however many rows it has".

**How to write it.**

| Formula | Means |
|---|---|
| `=SUM(tblLoans[outstanding])` | tblLoans = the Table name · [outstanding] = the column |
| `=COUNTA(tblLoans[loan_id])` | the whole loan_id column |
| `=[@dpd]` | inside the Table: "this row's dpd" (a calculated column) |

`=SUM(tblLoans[outstanding])` returns **208 723 504 430** — the outstanding of all 7 828 loans. `=COUNTA(tblLoans[loan_id])` returns 7 828. Our workbook's Tables are already named: `tblLoans`, `tblPayments`, `tblCustomers`, `tblApplications`, `tblInstallments` (Table Design → Table Name).

A Table gives four things a plain range does not:

| What | Why it matters |
|---|---|
| **Structured references** | `tblLoans[outstanding]` has no row numbers, so it never stops at an old last row |
| **Auto-expansion** | paste 100 new loans under the Table and every formula includes them |
| **Calculated columns** | type one formula with `[@…]` in a new column and it fills every row — like adding a column to `SELECT` |
| **Filter buttons and banded rows** | sort and filter without selecting anything |

**Sheets** has no Tables of this kind. Use whole-column references — `Loans!K:K` — or a named range (Data → Named ranges).

**When you use it.**
- For every block of data a formula reads. This week, every formula is built on a Table.
- When the data will be refreshed: next Friday's file has more rows, and the formulas must follow.

| Plain range `Loans!K2:K7829` | Table column `tblLoans[outstanding]` |
|---|---|
| 7 828 rows, forever | every row of the Table, today and after a refresh |
| misses a row added below | grows with the Table |
| needs `$` to stay put when copied | never moves — a column is a column |

> ⚠️ **Watch out.** `SUM` of a filtered Table still adds every row. The status bar shows the sum of the *visible* cells only. Read numbers from formulas, not from the status bar; `SUBTOTAL(109, …)` is the function that sums visible rows only.

**Your turn.** Next Friday, 120 new loans are pasted under `tblLoans`. Which formula includes them without any edit?

> 🎬 **Didn't get Excel tables (Ctrl+T)?** [A short explanation · 8 min](https://youtu.be/pCJ15nGFgVg?t=14006&end=14459)

### Relative and absolute references — the `$`

**What it is.** A **relative reference** (*относительная ссылка*) like `A3` moves when you copy the formula: one cell down, one row down; one cell right, one column right. An **absolute reference** (*абсолютная ссылка*) like `$A$3` never moves. A **mixed reference** pins one half: `$A3` keeps the column A, `B$2` keeps the row 2.

**How to write it.** The `$` goes in front of the part that must not move:

| Written | Meaning | Copied | Gives |
|---|---|---|---|
| `A3` | both move | 1 right, 1 down | `B4` |
| `$A$3` | nothing moves | anywhere | `$A$3` |
| `$A3` | column pinned | 1 right, 1 down | `$A4` |
| `B$2` | row pinned | 1 right, 1 down | `C$2` |

The picture: one formula typed in B3, then filled right and down. Column A holds two loan amounts, row 2 two annual rates; each cell is a year's interest.

| | A | B | C |
|---|---|---|---|
| **2** | | 0.24 | 0.30 |
| **3** | 10 | `=$A3*B$2` → 2.4 | `=$A3*C$2` → 3.0 |
| **4** | 20 | `=$A4*B$2` → 4.8 | `=$A4*C$2` → 6.0 |

`$A` keeps every copy reading column A; `$2` keeps every copy reading row 2. Without the `$` signs, C4 would hold `=B4*C3` — an interest times an interest.

On the real data: the as-of date 2026-10-01 sits in `Lookup!B17`. Add to `tblLoans` a calculated column `age_days` = `=Lookup!$B$17-[@disbursed_at]`. Every row reads the same pinned cell; loan 1 (disbursed 2025-03-28) is **552** days old. Press **F4** on a selected reference to cycle `A3 → $A$3 → A$3 → $A3`. Structured references need no `$`.

**When you use it.**
- A two-way summary table: labels down column A, labels across row 2, one formula filled into every cell (the Worked example does this with `SUMIFS`).
- A share of a total: `=B3/$B$11` — every row divides by the same total cell.
- A running total: `=SUM($C$3:C3)` — the start is pinned, the end moves.

> ⚠️ **Watch out.** A missing `$` still returns numbers — wrong ones. Click a cell in the middle of the block and press F2: coloured boxes show which cells it reads.

**Your turn.** B3 holds `=$A3*B$2`. You copy B3 to D5. What does the copy hold?

### SUM, AVERAGE, COUNT, COUNTA — the basic aggregates

**What it is.** The plain aggregates take one range and return one number. **SUM** adds, **AVERAGE** averages, **MIN** and **MAX** find the smallest and the largest. **COUNT** counts cells that hold a *number*. **COUNTA** counts cells that are *not empty* (numbers or text). **COUNTBLANK** counts empty cells.

**How to write it.** On a column of five cells:

| row | A `monthly_income` |
|---|---|
| 2 | 120 |
| 3 | *(empty)* |
| 4 | n/a |
| 5 | 80 |
| 6 | 100 |

| Formula | Gives | Why |
|---|---|---|
| `=SUM(A2:A6)` | 300 | text and empty cells are skipped |
| `=AVERAGE(A2:A6)` | 100 | 300 ÷ 3 numbers — the empty cell and "n/a" are not in it |
| `=COUNT(A2:A6)` | 3 | numbers only |
| `=COUNTA(A2:A6)` | 4 | anything that is not empty, "n/a" included |
| `=COUNTBLANK(A2:A6)` | 1 |   |

On the real data: `=COUNTA(tblCustomers[customer_id])` → **6 040** customers. `=COUNT(tblCustomers[monthly_income])` → **5 684** — the customers with an income on file. `=AVERAGE(tblCustomers[monthly_income])` → **15 245 933** soum, the average of those 5 684 incomes. `=AVERAGE(tblLoans[principal])` → **51 709 668**, the average ticket.

**When you use it.**
- Totals and averages of a whole column: the book, the average ticket, the number of rows.
- `COUNTA` on an id column for "how many rows"; `COUNT` on a number column for "how many have a value".

| SQL | Excel |
|---|---|
| `COUNT(*)` | `COUNTA(id column)` |
| `COUNT(col)` — skips NULL | `COUNT(col)` for numbers — skips empty and text |
| `AVG(col)` — skips NULL | `AVERAGE(col)` — skips empty and text |

> ⚠️ **Watch out.** An empty cell is skipped by `AVERAGE`, but a typed `0` is a number and is averaged in. Never fill blanks with 0 "to tidy up": the average income would drop from 15 245 933 to 14 347 331.

**Your turn.** How many customers have no `monthly_income`? Use two of these functions on `tblCustomers`.

> ⚠️ **Quirk: a cell can be empty and not empty at the same time.**
>
> - **You expect:** every cell to be counted once — by `COUNTA` if it is filled, by `COUNTBLANK` if it is empty.
> - **What happens:** a formula that returns `""` (empty text), like `=IF(B3="", "", B3*2)`, looks empty. `COUNTBLANK` counts it as blank, `COUNTA` counts it as filled, and `ISBLANK` says FALSE.
> - **Why:** `COUNTA` and `ISBLANK` look at what the cell *holds* — a formula. `COUNTBLANK` looks at what it *shows* — nothing.
> - **Protect yourself:** on a column filled by formulas, count real values with `COUNT` (numbers) or `=SUMPRODUCT(--(A2:A4<>""))`; do not trust `COUNTA` there.

Try it on an empty sheet: type 120 in A2, the formula `=IF(B3="", "", B3*2)` in A3 (B3 stays empty), and leave A4 empty.

| Formula | Gives | Why |
|---|---|---|
| `=COUNTA(A2:A4)` | 2 | 120 and the formula |
| `=COUNTBLANK(A2:A4)` | 2 | the formula's `""` and the empty cell |
| `=ISBLANK(A3)` | FALSE | A3 holds a formula |
| `=SUMPRODUCT(--(A2:A4<>""))` | 1 | only 120 is a real value |

Three cells, and `COUNTA` + `COUNTBLANK` = 4.

### COUNTIFS, SUMIFS, AVERAGEIFS — an aggregate with a condition

**What it is.** These functions add up, count or average only the rows that meet a **criterion** (*условие*). `SUMIFS` is `SELECT SUM(x) FROM t WHERE …` in one cell. `MAXIFS` and `MINIFS` work the same way.

**How to write it.**

| Formula | Note |
|---|---|
| `=SUMIFS(sum_range, criteria_range, criterion)` | sum_range FIRST: the column to add up |
| `=COUNTIFS(criteria_range, criterion)` | no sum_range: it counts rows |
| `=AVERAGEIFS(average_range, criteria_range, criterion)` |   |
| `=MAXIFS(max_range, criteria_range, criterion)` | MINIFS the same |

The criterion is **text in quotes**, with the operator inside: `"active"` (equals), `">0"`, `"<=30"`, `"<>closed"` (not equal). On the small table:

| Formula | Gives | Why |
|---|---|---|
| `=COUNTIFS(C2:C6, "active")` | 3 | rows 101, 102, 104 |
| `=SUMIFS(F2:F6, C2:C6, "active")` | 180 | 100 + 50 + 30 |
| `=AVERAGEIFS(F2:F6, C2:C6, "active")` | 60 | 180 ÷ 3 |
| `=MAXIFS(E2:E6, C2:C6, "active")` | 45 | the most-late active loan |
| `=COUNTIFS(E2:E6, ">0")` | 3 | rows 102, 103, 104 |

On the real data:

| Formula | Gives |
|---|---|
| `=COUNTIFS(tblLoans[status], "active")` | 3 352 |
| `=SUMIFS(tblLoans[outstanding], tblLoans[status], "active")` | 203 404 028 903 |
| `=AVERAGEIFS(tblLoans[principal], tblLoans[product], "Small business loan")` | 308 728 745 |
| `=MAXIFS(tblLoans[dpd], tblLoans[status], "active")` | 89 |

3 352 active loans carry 203 404 028 903 of the 208 723 504 430 outstanding. No active loan is more than 89 days late — past 90 a loan moves to `default`.

**When you use it.**
- "How many / how much / what average, for the rows where …" — one number in one cell.
- A column of labels plus one formula filled down — the Excel `GROUP BY`.

> ⚠️ **Watch out.** Criteria ignore case: `"card"` also matches `Card` and `CARD`. A trailing space or another word (`"CASH "`, `"bank transfer"`) is still a different value. To compare case-sensitively, use `EXACT`.

**Your turn.** How many loans are **not** closed? One `COUNTIFS` with the not-equal operator.

### Several criteria — every pair is one more AND

**What it is.** `SUMIFS`, `COUNTIFS` and `AVERAGEIFS` take up to 127 **pairs** of (criteria range, criterion). A row is counted only when it meets **every** pair. Each pair is one more `AND` in the `WHERE`.

**How to write it.**

```excel
=SUMIFS(sum_range, range1, criterion1, range2, criterion2, …)
```

On the small table — active **and** late:

| Formula | Gives | Why |
|---|---|---|
| `=COUNTIFS(C2:C6, "active", E2:E6, ">0")` | 2 | rows 102 and 104 |
| `=SUMIFS(F2:F6, C2:C6, "active", E2:E6, ">0")` | 80 | 50 + 30 |

On the real data: `=COUNTIFS(tblLoans[status], "active", tblLoans[dpd], ">0")` → **151** active loans that are late. `=SUMIFS(tblLoans[outstanding], tblLoans[region], "Tashkent", tblLoans[bucket], "90+")` → **1 920 943 970**, the Tashkent money more than 90 days late.

**When you use it.**
- Any filter on two or more columns: region and bucket, status and dpd, product and year.
- A cross-tab: one criterion from the row label, one from the column label (the Worked example).

| You want | Write |
|---|---|
| A **and** B | one SUMIFS with two pairs |
| A **or** B (same column) | two SUMIFS added: `=SUMIFS(…, r, "default") + SUMIFS(…, r, "written_off")` |
| a range on one column (between) | two pairs on the **same** column: `">=1"` and `"<=30"` |

> ⚠️ **Watch out.** Every range in one `SUMIFS` must have the same number of rows. `K2:K7829` with `J2:J100` returns `#VALUE!`. Table columns always match.

**Your turn.** Outstanding of active loans more than 30 days late.

### Wildcards in criteria — `*` and `?`

**What it is.** In a text criterion, **`*`** means "any characters, or none" and **`?`** means "exactly one character". They are SQL's `LIKE` with other symbols: `*` is `%`, `?` is `_`.

**How to write it.**

| Criterion | Matches | In SQL |
|---|---|---|
| `"approved*"` | starts with approved | `LIKE 'approved%'` |
| `"*Central"` | ends with Central | `LIKE '%Central'` |
| `"*loan*"` | contains loan | `LIKE '%loan%'` |
| `"<>*loan"` | does not end with loan | `NOT LIKE '%loan'` |
| `"20??"` | four characters starting with 20 |   |

On the small table: `=COUNTIFS(B2:B6, "Tashkent*")` → **3** (rows 101, 103, 104); `=SUMIFS(F2:F6, B2:B6, "Tashkent*")` → **170**.

On the real data: `=COUNTIFS(tblApplications[status], "approved*")` → **8 595** — `approved` (7 917) plus `approved_not_disbursed` (678). `=COUNTIFS(tblLoans[branch], "Tashkent*")` → **3 020**, the three Tashkent branches together.

**When you use it.**
- A family of values that share a start or an end: statuses `approved*`, branches `Tashkent*`.
- Not as a replacement for cleaning: `"*cash*"` would also catch a method called `cashback`.

> ⚠️ **Watch out.** Wildcards work in `COUNTIFS`/`SUMIFS` criteria (and in tomorrow's `XLOOKUP` with match mode 2). They do **not** work with `=`: `=B2="Tashkent*"` looks for a real star in the text. To find a real `*` or `?` inside a criterion, put a tilde in front of it: `"*~?*"` matches any text that contains a question mark.

**Your turn.** How many loans were made by a branch whose name ends in `Central`?

### Dates in criteria — `DATE` and `&`

**What it is.** In Excel a **date is a number**: the count of days since 1900. A date criterion is an operator **glued** to a date with `&`. `DATE(year, month, day)` builds the date, so the formula does not depend on how the computer writes dates.

**How to write it.**

| Criterion | Means |
|---|---|
| `">="&DATE(2026,9,1)` | the text ">=" joined to the number of 1 Sep 2026 |
| `"<"&DATE(2026,10,1)` | before 1 Oct 2026 |
| `">="&$B$1` | joined to a date typed in B1 |
| `"<"&EDATE($B$1, 1)` | before the same day one month after B1 |

A period is two pairs on the **same** column — the **half-open filter** from week 2: from the first day, up to but not including the next period's first day. On the small table, September 2026:

| Formula | Gives | Why |
|---|---|---|
| `=COUNTIFS(D2:D6, ">="&DATE(2026,9,1), D2:D6, "<"&DATE(2026,10,1))` | 2 | rows 102 and 104 |

Row 105 (1 October) is outside: `"<"` excludes the first day of the next month.

On the real data:

| Formula | Gives |
|---|---|
| `=COUNTIFS(tblLoans[disbursed_at], ">="&DATE(2026,9,1), tblLoans[disbursed_at], "<"&DATE(2026,10,1))` | 361 |
| `=SUMIFS(tblLoans[principal], tblLoans[disbursed_at], ">="&DATE(2026,1,1))` | 162 333 060 000 |

361 loans were disbursed in September 2026. 162 333 060 000 soum was lent in 2026 through the as-of date, in 3 051 loans.

**When you use it.**
- A month, a quarter, a year: two pairs, `>=` the first day and `<` the next period's first day.
- A report that moves: put the start date in a cell and write `">="&$B$1`.

> ⚠️ **Watch out.** A date stored as **text** looks like a date but is skipped by every date criterion — your count comes out low and nothing turns red. In a date column `=ISNUMBER(D2)` must say TRUE. Day 3 fixes the ones that do not.

**Your turn.** How many loans were disbursed in calendar year **2025**?

> ⚠️ **Watch out.** A date **with a time** is a number with a fraction: 30 Sep 2026 at 14:20 is 46 295.60 (the day, plus 14 h 20 min ÷ 24 h). `"<="&DATE(2026,9,30)` means "up to 46 295.00" — midnight at the *start* of the 30th — so everything later that day falls out. The half-open filter has no such hole: `"<"&DATE(2026,10,1)` keeps the whole last day.

**Your turn.** `tblApplications[applied_at]` holds a date **and** a time. Count September 2026 applications twice, both starting with `">="&DATE(2026,9,1)`: once ending with `"<"&DATE(2026,10,1)`, once with `"<="&DATE(2026,9,30)`. How many applications does the `<=` version lose?

### SUMPRODUCT — when the condition is not a simple comparison

**What it is.** **SUMPRODUCT** multiplies ranges row by row and adds the results. A test like `(tblLoans[dpd]>30)` gives a column of TRUE/FALSE, which counts as 1/0 when multiplied. So `SUMPRODUCT` can sum or count with any condition — the Excel spelling of `SUM(CASE WHEN … THEN x ELSE 0 END)`.

**How to write it.**

| Formula | Does |
|---|---|
| `=SUMPRODUCT((condition) * sum_column)` | sum where the condition is TRUE |
| `=SUMPRODUCT(--(condition))` | count: -- turns TRUE/FALSE into 1/0 |
| `=SUMPRODUCT(column1, column2)` | Σ column1 × column2, row by row |

On the small table: `=SUMPRODUCT((E2:E6>30)*F2:F6)` → **70** — rows 103 (40) and 104 (30).

On the real data: `=SUMPRODUCT((tblLoans[dpd]>30)*tblLoans[outstanding])` → **6 507 526 953**, the PAR30 numerator.

**When you use it.**
- A condition `SUMIFS` cannot write: one column compared with another, a case-sensitive test (`EXACT`), a calculation inside the test.
- A count of mismatches between two columns: `=SUMPRODUCT(--(col1<>col2))`. Zero means the columns agree.

**Your turn.** Which formula counts the loans whose `outstanding` is more than half their `principal`?

> ⚠️ **Quirk: `K:K` costs nothing in one formula and a lot in another.**
>
> - **You expect:** a whole-column reference such as `K:K` to be a harmless way to say "all the rows".
> - **What happens:** `SUMIFS(K:K, …)` and `COUNTIFS` stay fast — they stop at the last used row. `SUMPRODUCT`, `FILTER` and other array formulas really work through all 1 048 576 rows, so a few hundred of them make the file slow on every change. And a formula inside column K that reads `K:K` reads itself: Excel warns *circular reference*.
> - **Why:** the `…IFS` functions are built to skip the empty end of a column; array formulas compute every cell they are given.
> - **Protect yourself:** in Excel, point formulas at Table columns (`tblLoans[principal]`): they grow with the data and stop where it stops. Keep `K:K` for Sheets and for `SUMIFS`/`COUNTIFS`.

### IF — two branches

**What it is.** **IF** (*ЕСЛИ*) tests a condition and returns one value when it is TRUE and another when it is FALSE. It is a `CASE WHEN … THEN … ELSE … END` with one `WHEN`.

**How to write it.**

| Formula | Note |
|---|---|
| `=IF(test, value_if_true, value_if_false)` |   |
| `=IF([@dpd]>0, "late", "current")` | in a calculated column of tblLoans |

On the small table: `=IF(E2>0, "late", "current")` filled down gives `current`, `late`, `late`, `late`, `current`.

On the real data, put that formula in a new column `late` of `tblLoans`. `=COUNTIFS(tblLoans[late], "late")` → **399** loans are late.

**When you use it.**
- A flag column: late / current, over limit / within limit, new / repeat.
- A guard: `=IF(B3=0, "", A3/B3)` — no `#DIV/0!` on an empty group.

> ⚠️ **Watch out.** An empty cell counts as 0 in a test. `=IF(B2>=600, "pass", "check")` returns `check` for a blank credit score — the same answer as a low score. Test for blank first: `=IF(B2="", "no score", IF(B2>=600, "pass", "check"))`.

**Your turn.** An application's `credit_score` is blank. What does `=IF([@credit_score]<600, "low", "ok")` return for it?

### AND, OR, NOT — combining tests

**What it is.** **AND** (*И*) is TRUE when every test is TRUE. **OR** (*ИЛИ*) is TRUE when at least one is. **NOT** turns TRUE into FALSE. They go inside the test of an `IF`.

**How to write it.**

```excel
=AND(test1, test2, …)
=OR(test1, test2, …)
=IF(AND([@status]="active", [@dpd]>60), "visit", "")
=IF(OR([@status]="default", [@status]="written_off"), "bad", "")
```

On the small table, `=IF(AND(C2="active", E2>30), "visit", "")` marks only row 104 (active, 45 days). `=IF(OR(C2="default", C2="written_off"), "bad", "")` marks only row 103.

On the real data: the `visit` column marks **16** loans — active and more than 60 days late. The `bad` column marks **234** — 44 `default` + 190 `written_off`.

**When you use it.**
- A flag that depends on two columns at once: status and dpd, product and amount.
- `AND` inside `IF` = several conditions in one `WHEN`; `OR` = a list of values (`IN (…)` in SQL).

> ⚠️ **Watch out.** `AND` and `OR` return **one** value for a whole range. `=AND(tblLoans[dpd]>0)` asks "are *all* loans late?", not "which ones". Inside `SUMPRODUCT` and `FILTER`, write AND as `(a)*(b)` and OR as `(a)+(b)`.

**Your turn.** How many loans are active **and** more than 30 days late? Use a calculated column with `IF(AND(…))`, then count it.

### IFS — many branches, the first TRUE wins

**What it is.** **IFS** (*ЕСЛИМН*) takes pairs of (test, value) and returns the value of the **first** TRUE test. It reads top-down, exactly like `CASE WHEN … WHEN … END`. The last pair `TRUE, value` is the `ELSE`.

**How to write it.**

```excel
=IFS(test1, value1, test2, value2, …, TRUE, else_value)
=IFS([@dpd]=0, "0", [@dpd]<=30, "1-30", [@dpd]<=60, "31-60", [@dpd]<=90, "61-90", TRUE, "90+")
```

The same rule as nested `IF`s — older Excel has no `IFS`:

```excel
=IF([@dpd]=0, "0", IF([@dpd]<=30, "1-30", IF([@dpd]<=60, "31-60", IF([@dpd]<=90, "61-90", "90+"))))
```

On the small table the `IFS` gives `0`, `1-30`, `90+`, `31-60`, `0`. On `Loans` it reproduces the shipped `bucket` column: 7 429 / 124 / 25 / 16 / 234 loans.

**When you use it.**
- Three or more labels from one number: buckets, grades, size bands.
- Order the tests from narrow to wide. `[@dpd]<=60` is only reached when `[@dpd]<=30` was FALSE.

> ⚠️ **Watch out.** Without the final `TRUE, …` pair, a row that meets no test returns `#N/A`. And the value's **type** matters: `0` (a number) and `"0"` (text) look the same and are not equal.

**Your turn.**

### Joining text — `&` and TEXTJOIN

**What it is.** **`&`** (*сцепление*) joins two values into one text. **TEXTJOIN** joins a whole range with a separator. They are SQL's `||` and `GROUP_CONCAT`.

**How to write it.**

| Formula | Means |
|---|---|
| `=A2 & " " & B2` | value, a space in quotes, value |
| `=TEXTJOIN(", ", TRUE, range)` | separator, TRUE = skip empty cells, the range |

On the small table: `=B2&" · "&C2` → `Tashkent South · active`.

On the real data, in `tblLoans`: `=[@branch]&" / "&[@product]` for loan 1 → `Termez Central / Consumer loan`. `=TEXTJOIN(", ", TRUE, UNIQUE(tblLoans[region]))` lists the 8 regions in one cell (`UNIQUE` is tomorrow).

**When you use it.**
- A full name from two columns, a chart title, a key made of two columns (`[@region]&"|"&[@product]` — tomorrow's two-key lookup).
- A number inside a sentence: `="Active loans: "&COUNTIFS(tblLoans[status], "active")` → `Active loans: 3352`.

> ⚠️ **Watch out.** `&` drops the number format: `="Book: "&SUM(tblLoans[outstanding])` shows `Book: 208723504430`. Wrap the number in `TEXT` (two subsections down) to keep the thousands separators.

**Your turn.** What does `=[@region]&"-"&[@grade]` return for loan 1 (Termez, grade C)?

### TRIM, UPPER, LOWER, PROPER — spaces and case

**What it is.** **TRIM** (*СЖПРОБЕЛЫ*) removes spaces at both ends and turns double spaces inside into one. **UPPER** and **LOWER** change every letter. **PROPER** (*ПРОПНАЧ*) makes the first letter of each word capital and the rest small. **LEN** counts characters.

**How to write it.**

| Formula | Text | Gives |
|---|---|---|
| `=TRIM(text)` | `"Yulduz "` | `"Yulduz"` |
| `=UPPER(text)` | `"jalilova"` | `"JALILOVA"` |
| `=LOWER(text)` | `"CASH"` | `"cash"` |
| `=PROPER(text)` | `"MALIKA"` | `"Malika"` |
| `=LEN(text)` | `"Yulduz "` | 7 (the trailing space counts) |

Combined, week 2's cleaning in one cell: `=PROPER(TRIM([@first_name]))&" "&PROPER(TRIM([@last_name]))`. Customer 6001 (`MALIKA`, `jalilova`) becomes `Malika Jalilova`.

On the real data: `=SUMPRODUCT(--(LEN(tblCustomers[first_name])<>LEN(TRIM(tblCustomers[first_name]))))` → **18** first names carry a stray space.

**When you use it.**
- Before you compare or count text that people typed: names, methods, cities.
- `LEN(x) <> LEN(TRIM(x))` finds the rows that have extra spaces.

| SQL (week 2) | Excel |
|---|---|
| `TRIM(s)` — ends only | `TRIM(s)` — ends **and** double spaces inside |
| `UPPER`, `LOWER` | `UPPER`, `LOWER`, plus `PROPER` |
| `LENGTH(s)` | `LEN(s)` |

> ⚠️ **Watch out.** `=` ignores case in Excel: `"MALIKA"="Malika"` is TRUE. To test whether text is *written* in lower case, use `EXACT(a, LOWER(a))` — the one case-sensitive comparison.

**Your turn.** What does `=PROPER(TRIM("  MALIKA "))` return?

### LEFT, RIGHT, MID, SEARCH — cutting text

**What it is.** **LEFT** (*ЛЕВСИМВ*) takes the first n characters, **RIGHT** (*ПРАВСИМВ*) the last n, **MID** n characters from a start position. **SEARCH** returns the position of one text inside another (not case-sensitive; **FIND** is the case-sensitive twin).

**How to write it.**

| Formula | Example | Gives |
|---|---|---|
| `=LEFT(text, n)` | `"Tashkent South", 8` | `"Tashkent"` |
| `=RIGHT(text, n)` | `"Tashkent South", 5` | `"South"` |
| `=MID(text, start, n)` | `"+998902031105", 5, 2` | `"90"` |
| `=SEARCH(find, text)` | `" ", "Tashkent South"` | 9 |

When the length changes from row to row, let `SEARCH` find the cut:

| Formula | Gives |
|---|---|
| `=LEFT([@branch], SEARCH(" ", [@branch]) - 1)` | the word before the space → "Tashkent", "Fergana", … |
| `=MID([@branch], SEARCH(" ", [@branch]) + 1, 50)` | everything after the space → "South", "Central", … |

On the small table, the first formula gives `Tashkent`, `Fergana`, `Tashkent`, `Tashkent`, `Fergana`; the second gives `South`, `Central`, `North`, `South`, `Central`.

**When you use it.**
- A part of a code or a name: the city of a branch, the operator code of a phone.
- `LEFT` and `RIGHT` on fixed-length codes; `SEARCH` + `LEFT`/`MID` when the length varies.

> ⚠️ **Watch out.** `LEFT` of a **real date** cuts the date's *number*: `=LEFT(DATE(2026,9,8), 4)` returns `4627`, not `2026`. Turn the date into text with `TEXT` first (next subsection), or use `YEAR()` and `MONTH()`.

**Your turn.** What does `=LEFT([@branch], SEARCH(" ", [@branch]) - 1)` return for the branch `Samarkand Central`?

### TEXT — a number or a date as formatted text

**What it is.** **TEXT** (*ТЕКСТ*) turns a number or a date into text, in a format you choose. The result is text: it reads well and sorts as text, but you cannot add it up.

**How to write it.**

| Formula | Gives |
|---|---|
| `=TEXT(value, "format code")` |   |
| `=TEXT([@disbursed_at], "yyyy-mm")` | 2026-09-08 → `"2026-09"` |
| `=TEXT([@disbursed_at], "yyyy-mm-dd")` | `"2026-09-08"` |
| `=TEXT(208723504430, "#,##0")` | `"208,723,504,430"` |
| `=TEXT(0.0312, "0.0%")` | `"3.1%"` |

On the real data, a `month` column `=TEXT([@disbursed_at], "yyyy-mm")` in `tblLoans` gives 34 month labels, 2024-01 to 2026-10. `=COUNTIFS(tblLoans[month], "2026-09")` → **361**, the same as the date-criteria count.

**When you use it.**
- A label: a month key to count by, a number inside a sentence (`="Book: "&TEXT(SUM(…), "#,##0")`).
- Never on a number you will compute with — use a number format on it instead (next subsection).

**Your turn.** What does `=TEXT(DATE(2026,10,1), "yyyy-mm")` return?

### Number formats vs values — the display changes, the value does not

**What it is.** A **number format** (*формат ячеек*) changes how a cell *shows* its value. The value itself does not change. Ctrl+1 → Number opens the formats. A **date** is a number with a date format: `DATE(2026,10,1)` is the number 46 296. Day 1 is 1 January 1900. (Excel also counts a 29 February 1900 that never existed — an old bug kept on purpose; Google Sheets counts from 30 December 1899, so today's dates get the same numbers in both.) A column full of numbers like 46296 is a date column in the `General` format: give it a date format and the dates come back.

**How to write it.** One value, several formats:

| The cell holds | Format code | The cell shows |
|---|---|---|
| 208723504430 | `General` | 208723504430 |
| 208723504430 | `#,##0` | 208,723,504,430 |
| 208723504430 | `#,##0,,," bn"` | 209 bn — each trailing comma divides the *display* by 1 000 |
| 0.0312 | `0.0%` | 3.1% — the format multiplies by 100 |
| 46296 | `yyyy-mm-dd` | 2026-10-01 |

The cell that shows `209 bn` still holds 208 723 504 430. A check `=G11=SUM(tblLoans[outstanding])` still says TRUE.

| | Number format (Ctrl+1) | `TEXT()` |
|---|---|---|
| The value | unchanged — still a number | becomes text |
| Can you SUM it? | yes | no |
| Use it for | every number you compute with | labels and sentences only |

**When you use it.**
- Every number on a sheet someone else reads: money with thousands separators, rates as `0.0%`, dates as `yyyy-mm-dd`.
- Sheets: Format → Number → Custom number format, the same codes.

> ⚠️ **Watch out.** A rate computed as `=100*A1/A2` and then formatted as `%` is multiplied twice: PAR30 shows 312 % instead of 3.12 %. Write `=A1/A2` and let the format do the ×100.

**Your turn.** Type `=DATE(2026,10,1)` in a cell and change its format to `General`. What number does it show?

> ⚠️ **Watch out.** A format hides decimals; it does not remove them. Three cells that each hold 1/3 show `0.33`, yet their `SUM` shows `1.00`, not 0.99 — and `=A1=B1` can be FALSE for two cells that both show `0.30`. When the number you see must be the number that is stored (a check cell, an amount on a schedule), round the value itself with **ROUND**: `=ROUND(x, 2)` keeps 2 decimals, `=ROUND(x, 0)` makes a whole number, `=ROUND(x, -2)` rounds to hundreds. Excel's `ROUND` sends a 5 away from zero: `=ROUND(2.5, 0)` is 3.

**Your turn.** Nur Finance rounds every instalment to whole hundreds of soum. Loan 1's exact monthly payment is 1 741 684.35. What does `=ROUND(1741684.35, -2)` return?

> ⚠️ **Quirk: Excel's calendar has a day that never was.**
>
> - **You expect:** day 60 of Excel's calendar to be 1 March 1900.
> - **What happens:** day 60 is **29 February 1900** — a date that did not exist (1900 was not a leap year).
> - **Why:** Lotus 1-2-3 had this mistake, and Excel copied it on purpose so old files kept their numbers.
> - **Protect yourself:** it bites outside Excel. Python, SQL and Power BI turn a day number like 46 296 into a date by counting from **30 December 1899**; count from 1 January 1900 and every date comes out two days late. And a workbook set to the old Mac **1904 date system** (File → Options → Advanced) gives the same date a number 1 462 smaller, so dates copied between the two jump by 4 years and 1 day. After every import, check one date you know: 1 October 2026 must be 46 296.

| Formula, format `General` | Shows | |
|---|---|---|
| `=DATE(1900,2,28)` | 59 | |
| `=DATE(1900,2,29)` | 60 | a day that never existed |
| `=DATE(1900,3,1)` | 61 | |
| `=DATE(2026,10,1)` | 46296 | the course's "today" |

Week 5 turns 46 296 back into a date in pandas, from the right day 0.

> ⚠️ **Quirk: Excel does binary maths too.**
>
> - **You expect:** `=1*(0.5-0.4-0.1)` to show 0.
> - **What happens:** it shows `-2.78E-17`: a tiny crumb instead of zero.
> - **Why:** 0.4 and 0.1 have no exact binary form — the same reason `0.1 + 0.2` is not exactly 0.3 in SQL (week 2) and Python (week 5). Excel hides most of these crumbs: it shows only 15 digits, and it cleans up some results that land next to zero. So you meet them rarely — and then in a check cell that says FALSE.
> - **Protect yourself:** round both sides before you compare: `=ROUND(A1,2)=ROUND(B1,2)`; or test the gap: `=ABS(A1-B1)<0.005`.

| Formula | Shows |
|---|---|
| `=1*(0.5-0.4-0.1)` | -2.78E-17 |
| `=ROUND(1*(0.5-0.4-0.1), 10)` | 0 |

### Russian Excel — the same functions, other names

**What it is.** Excel in Russian shows Russian function names (`СУММЕСЛИМН` for `SUMIFS`). Separately, a computer whose regional settings write decimals with a comma (Russia, Uzbekistan) separates arguments with `;` instead of `,` — in English Excel too, so `=SUMIFS(a; b; c)` is a normal sight. The file stores the formula in one internal form, so it opens correctly in either language and region.

**How to write it.**

| Excel | Formula |
|---|---|
| English Excel | `=SUMIFS(tblLoans[outstanding], tblLoans[status], "active")` |
| Russian Excel | `=СУММЕСЛИМН(tblLoans[outstanding]; tblLoans[status]; "active")` |

**When you use it.** When a colleague's screen or a Russian tutorial shows the Russian names. Switch Office to English if you can (File → Options → Language): every interview and most tutorials use the English names.

> ⚠️ **Watch out.** Format codes follow the language and the region too. In Russian Excel, `TEXT` wants Russian letters for dates — `=ТЕКСТ(A2; "ГГГГ-ММ")`, not `"yyyy-mm"` — and a custom number format is written with your own separators: `# ##0` (a space) instead of `#,##0`, `0,0%` instead of `0.0%`. If a `TEXT` date comes back with the letters still in it, or Ctrl+1 refuses a code from this page, this is why.

**Your turn.**

### SQL → Excel, the translation table

**What it is.** Everything on this page is a SQL idea from weeks 1–3 with Excel spelling. Keep this table open until it is memory.

| SQL (weeks 1–3) | Excel / Sheets |
|---|---|
| `FROM loans` | the Table `tblLoans` (Sheets: `Loans!A:M`) |
| `COUNT(*)` | `=COUNTA(tblLoans[loan_id])` |
| `SELECT COUNT(*) FROM loans WHERE status = 'active'` | `=COUNTIFS(tblLoans[status], "active")` |
| `SELECT SUM(outstanding) … WHERE region = 'Tashkent' AND bucket = '90+'` | `=SUMIFS(tblLoans[outstanding], tblLoans[region], "Tashkent", tblLoans[bucket], "90+")` |
| `AVG(x) WHERE …`, `MAX(x) WHERE …` | `AVERAGEIFS`, `MAXIFS` / `MINIFS` |
| `WHERE d >= '2026-09-01' AND d < '2026-10-01'` | two pairs: `">="&DATE(2026,9,1)` and `"<"&DATE(2026,10,1)` on the same column |
| `WHERE status LIKE 'approved%'` | `"approved*"` |
| `WHERE status <> 'cancelled'` | `"<>cancelled"` |
| `GROUP BY region` | a column of region labels + one formula filled down (today) or a pivot (Day 4) |
| `CASE WHEN … END` | `IF` / `IFS` in a calculated column |
| `SUM(CASE WHEN dpd > 30 THEN outstanding ELSE 0 END)` | `=SUMPRODUCT((tblLoans[dpd]>30)*tblLoans[outstanding])` |
| `first_name \|\| ' ' \|\| last_name` | `=[@first_name]&" "&[@last_name]` |
| `LOWER(TRIM(method))` | `=LOWER(TRIM([@method]))` |
| `strftime('%Y-%m', d)` / `FORMAT(d, 'yyyy-MM')` | `=TEXT([@disbursed_at], "yyyy-mm")` |
| `ROUND(100.0 * a / b, 1)` | `=a/b` formatted `0.0%` |
| `JOIN` | tomorrow: `XLOOKUP` / `INDEX-MATCH`; Day 3: Power Query *Merge* |
| `SELECT DISTINCT`, `ORDER BY`, `LIMIT` | tomorrow: `UNIQUE`, `SORT`, `TAKE` |

**When you use it.** Every time you know the SQL and need the cell.

> ⚠️ **Watch out.** Two differences bite. Excel text comparison is **case-insensitive** (SQL's was not). And Excel has **no NULL**: an empty cell is skipped by `AVERAGE` and `COUNT`, but counted by `COUNTIFS(range, "")`. A formula that returns `""` only *looks* empty: it holds text, so `COUNTA` counts it and `ISBLANK` says FALSE.

**Your turn.**

### Google Sheets and shortcuts — reference

Sheets has the same functions (`SUMIFS`, `COUNTIFS`, `IFS`, `MAXIFS`, `TEXTJOIN`, `PROPER` …) and the same `$` rules. The differences this week: no Tables (whole-column references and named ranges instead), `ARRAYFORMULA` to fill a column with one formula (tomorrow), Freeze under View → Freeze, and a 92 000-row `SUMIFS` over `Installments` is slow in the browser — use a pivot there.

| Keys (Windows) | Does | Sheets |
|---|---|---|
| Ctrl+T | make the selection a Table | — |
| Ctrl+Arrow / Ctrl+Shift+Arrow | jump to / select to the edge of the data | same |
| Ctrl+Shift+L | filter arrows on / off | same |
| F4 | cycle `$` on the selected reference | same |
| Ctrl+1 | Format Cells | number format menu |
| Ctrl+` | show formulas instead of values | same |
| Alt+= | AutoSum | same |
| Ctrl+D / Ctrl+R | fill down / fill right | same |
| Alt+W, F, R | freeze the top row | View → Freeze → 1 row |

### Putting it together

One title cell for Bekzod, built from five of today's tools: *"September 2026: 361 loans, 17,015,490,000 soum, 134 of them in Tashkent."*

```excel
="September 2026: " & COUNTIFS(tblLoans[disbursed_at], ">="&DATE(2026,9,1), tblLoans[disbursed_at], "<"&DATE(2026,10,1)) & " loans, " & TEXT(SUMIFS(tblLoans[principal], tblLoans[disbursed_at], ">="&DATE(2026,9,1), tblLoans[disbursed_at], "<"&DATE(2026,10,1)), "#,##0") & " soum, " & COUNTIFS(tblLoans[disbursed_at], ">="&DATE(2026,9,1), tblLoans[disbursed_at], "<"&DATE(2026,10,1), tblLoans[region], "Tashkent") & " of them in Tashkent."
```

The parts, in order:

1. Text in quotes, joined with **`&`**.
2. **COUNTIFS** with a **half-open date filter** — 361 loans.
3. **SUMIFS** on the same two pairs, wrapped in **TEXT** so `&` keeps the separators — 17,015,490,000.
4. The same COUNTIFS with a third **pair** on `region` — one more AND — 134 loans.

The data is a **Table**, so the cell survives Friday's refresh. Put the two dates in cells (`B1`, `B2`) and write `">="&$B$1` with **absolute references** — next month the title changes when you change two cells.

**Which tool answers which question?**

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Tables (Ctrl+T) — [Excel for Data Analytics - Full Course for Beginners (Luke Barousse), 3:51:57](https://youtu.be/pCJ15nGFgVg?t=13917&end=14968)
- ▶ Absolute and relative references — [Excel Formulas and Functions | Full Course (Kevin Stratvert), 07:40](https://youtu.be/Y8xhrUa3KH4?t=460&end=586)
- ▶ Absolute and relative references (mixed `$F5`, the F4 key) — [Excel Cell Reference: Absolute, Relative or Mixed? (Leila Gharani), 01:52](https://youtu.be/FRu48zy-Djk?t=112&end=178)
- ▶ SUMIFS (two criteria) — [How to Use SUMIFS, COUNTIFS and AVERAGEIFS in Excel (Leila Gharani), 03:18](https://youtu.be/AZuBNWMh7VM?t=198&end=320)
- ▶ COUNTIFS / AVERAGEIFS — [How to Use SUMIFS, COUNTIFS and AVERAGEIFS in Excel (Leila Gharani), 10:19](https://youtu.be/AZuBNWMh7VM?t=619&end=691)
- ▶ Text functions (PROPER, TRIM, LEFT/RIGHT/MID, LEN, FIND) — [Excel Formulas and Functions | Full Course (Kevin Stratvert), 31:26](https://youtu.be/Y8xhrUa3KH4?t=1886&end=1920)
- ▶ IF / IFS (logic) — [Excel Formulas and Functions | Full Course (Kevin Stratvert), 40:14](https://youtu.be/Y8xhrUa3KH4?t=2414&end=2487)

- RU workbook `Logic Math Text Functions.xlsx` (sheets *IF Function*, *IFS*, *Math+Logic*, *Text Functions*, and *Russian Excel to English*) — the same functions on a shop dataset, with the Russian names side by side.
- *Russian terms:* умная таблица = Table, абсолютная / относительная ссылка = absolute / relative reference, закрепить области = freeze panes, условное суммирование = SUMIFS, формат ячеек = number format.

---

## 2. Worked example — the bucket matrix, Bekzod's first page (15 min)

**Ask:** outstanding by region (down) and bucket (across), with totals that tie to the book. Grain: one cell = one region × one bucket; the value is the sum of `outstanding`.

1. **A proper table and an Excel Table.** The data is `tblLoans`: one row per loan, one header row. The report goes on a new sheet `Summary`, never inside the data.
2. **Labels — values, not formats.** Row 2 gets the five buckets `0`, `1-30`, `31-60`, `61-90`, `90+` in B2:F2. Type the first as `'0` (with an apostrophe), so it is **text** like the `bucket` column; `=ISTEXT(B2)` must say TRUE. (Do not test it with `COUNTIFS`: criteria may treat number-like text as numbers, so a wrong type can still look fine there.) Column A gets the eight regions in A3:A10.
3. **SUMIFS with two pairs and mixed references.** One formula in B3, filled right to F3 and down to row 10 — forty cells:

```excel
B3:  =SUMIFS(tblLoans[outstanding], tblLoans[region], $A3, tblLoans[bucket], B$2)
```

   `$A3` keeps every copy reading its region from column A; `B$2` keeps every copy reading its bucket from row 2. Tashkent's `90+` cell: **1 920 943 970**.

4. **SUM for the totals, and a check cell.**

```excel
G3:  =SUM(B3:F3)    row total
B11: =SUM(B3:B10)   column total
G11: =SUM(G3:G10)
     → must be 208 723 504 430
```

   G11 = **208 723 504 430**: the grand total ties to `=SUM(tblLoans[outstanding])`. If not, a region is misspelt or a label carries a stray space — check the labels with `ISTEXT` and `LEN`. Then two more checks: the Tashkent row = 81 679 738 071 (39.1 % — `=G3/$G$11` formatted `0.0%`, an **absolute reference** to the total); the `90+` column = 5 319 475 527 (the NPL90 numerator, 2.55 %).
5. **COUNTIFS — the count version.** Replace `SUMIFS(tblLoans[outstanding], …)` with `COUNTIFS(…)` (same pairs, no sum range). Column totals: **7 429 / 124 / 25 / 16 / 234**, grand total 7 828.
6. **Number format, not TEXT.** Select B3:G11, Ctrl+1, custom `#,##0,,," bn"`. `81.7 bn` reads; `81679738071` does not. The cell still holds every soum, so the check in G11 still works.

> 💡 **Key idea.** Every summary table ends in a check cell that must equal a number you can defend — here 208 723 504 430 and 7 828. If the check is off, fix the labels before you touch the formula.

---

## 3. Practice (50 min)

Work in a **copy** of `nur_week4_start.xlsx` named `week-04/day-1/practice.xlsx`, one sheet `Practice`, one labelled block per task (A: the question, B: the formula as text — prefix with an apostrophe, C: the value). Sheets users: one tab, same layout. Each question says what goes **in the box** under it; type the value your formula returns and press ✔ — the box checks it and then shows the formulas and the other numbers. The questions follow the order of Learn.

**P1.** *(a proper table)* Marketing sends a sheet: region names in merged cells across the top, one column per month, a *Total* row after every region, and a blank row between regions. Before any `SUMIFS` can read it, which changes are needed? *In the box: tick every change that is needed.*

**P2.** *(Excel Tables · SUM, COUNTA · COUNTIFS)* Four cells from `tblLoans`: number of loans, number of active loans, total outstanding, number of loans with dpd > 0. *In the box: the number of loans with dpd > 0.*

**P3.** *(SUMIFS, AVERAGEIFS, MAXIFS · absolute references)* A five-row product table: loans, outstanding, share of outstanding (`0.0%`, dividing by a `$`-pinned total), average principal, largest principal. Which product is 60 % of the book and 10 % of the loans? *In the box: pick the product.*

**P4.** *(several criteria · mixed references)* The status × bucket cross-tab for delinquent loans only (dpd > 0): one `COUNTIFS` with three pairs, filled across and down. Which statuses appear in 90+, and how many "closed" loans are late? *In the box: how many closed loans are late.*

**P5.** *(AVERAGEIFS and MAXIFS with several criteria)* Average DPD and maximum DPD of *active* delinquent loans, and the average outstanding of an active loan. *In the box: the average DPD of active late loans, 1 decimal.*

**P6.** *(wildcards)* Two counts with a wildcard on `branch`: the loans of the three Tashkent branches together, and the loans of the branches that are **not** called "… Central". *In the box: the loans of the branches not called "… Central".*

**P7.** *(dates in criteria)* Loans and principal disbursed in 2026 (through the as-of date), then the same for September 2026 only, with the half-open filter. *In the box: the principal disbursed in September 2026, in soum.*

**P8.** *(criteria ignore case, not spaces)* Payments by method **as recorded**: a `COUNTIFS` for each of the five clean names (`card`, `cash`, `transfer`, `payme`, `click`) on `tblPayments`. Why do the five not add up to 52 875, and which 57 rows did Excel miss? *In the box: how many rows the five counts miss.*

**P9.** *(IF · AND / OR)* A calculated column `flag` on `tblLoans`: `bad` when the status is `default` **or** `written_off`; `watch` when the loan is `active` **and** more than 30 days late; empty otherwise. One nested `IF` with `OR` and `AND`, then a `COUNTIFS` per flag. *In the box: the number of `watch` loans.*

**P10.** *(IFS · SUMPRODUCT)* Add a calculated column `my_bucket` to `tblLoans` with `IFS` on `dpd`, then prove it equals the shipped `bucket` column with one `SUMPRODUCT` (count of mismatches). *In the box: the mismatch count.*

**P11.** *(& · TRIM, PROPER · EXACT)* On `tblCustomers`, a `full_name` column = `PROPER(TRIM([@first_name]))&" "&PROPER(TRIM([@last_name]))`, and three count cells: first names with a stray space (`LEN` vs `LEN(TRIM)`), surnames that are all lower-case, phones that are not 13 characters long. *In the box: the number of surnames written all in lower case.*

**P12.** *(LEFT, MID, SEARCH)* Two calculated columns on `tblLoans`: `city` = the word before the space in `branch`, `part` = everything after it. Check that `city` always equals `region` (a `SUMPRODUCT` of mismatches), then count the loans per `part`. *In the box: the number of loans whose `part` is `South`.*

**P13.** *(TEXT · a running total with `$`)* Month labels without a pivot: a column `month` on `tblLoans` as `=TEXT([@disbursed_at],"yyyy-mm")`, then a 2026 table of month → loans, principal, running total of principal (a `SUM` with a `$`-pinned start). *In the box: the running total in the 2026-09 row.*

**P14.** *(number formats)* Bekzod's ten-cell summary with number formats: the P2 and P7 numbers plus Σ principal ever lent (404 783 280 000), average ticket (51 709 668) and PAR30 as a percentage — in `#,##0`, `#,##0,,," bn"` and `0.00%`, each cell labelled. *In the box: PAR30 as a percentage, 2 decimals.*

> 🚀 **Stretch (optional, +5 XP).** **P15.** *(dates in criteria · SUMIFS on another table)* Week 3's `v_portfolio_monthly` had month-end outstanding. Reproduce **September 2026 month-end** from `Installments` + `Loans` with `SUMIFS` only: principal due on or after 2026-10-01 for loans disbursed before 2026-10-01. Why is it not 208 723 504 430? *In the box: the September month-end outstanding.*

### Mistakes that cost a point this week

- A typed number next to formulas (`3352` pasted from SQL "because it was right") — it is right until Friday's refresh. Every number in the pack is a formula.
- `SUM(K2:K7829)` instead of `SUM(tblLoans[outstanding])` — the 7 829th row is the first one the pack misses.
- The bucket label `0` typed as a number next to a text `bucket` column — two types that look identical. `=` and `SUMPRODUCT(--(a<>b))` compare strictly and show it (P10); `COUNTIFS`/`SUMIFS` may treat number-like text as numbers, so they are not a safe test. Check labels with `ISTEXT` / `ISNUMBER`.
- `"approved"` instead of `"approved*"` — Marketing's 56.6 %.
- Criteria without quotes: `COUNTIFS(range, >0)` is a syntax error; `COUNTIFS(range, ">"&0)` or `">0"` is the form.
- A `SUMIFS` range and criteria range of different lengths (`K2:K7829` vs `J2:J100`) — `#VALUE!`; Tables make this impossible.
- A percentage computed as `=100*a/b` and *also* formatted `%` — PAR30 shows 312 % instead of 3.12 %.
- `AVERAGE` of the three channel rates as the "total" rate — mix. Sum the counts, divide once.
- A filter left on while summing a selected range — the status-bar `Sum` is of visible cells, `=SUM()` of all; `SUBTOTAL(109, …)` if you want visible only.

---

## 4. Homework <span class="badge hw">HW 4.1 — Due Day 3</span>

**Bekzod's functions pack.** Hand in `functions_pack.xlsx` (📎 box below) (or a Sheets link exported to `.xlsx`) with one sheet `Pack`: ten labelled cells, each a **formula** on `tblLoans` / `tblApplications` (no typed numbers), and a column *SQL value from week 3* next to each so the two can be compared:

| # | Cell | Must equal |
|---|---|---|
| 1 | active loans | 3 352 |
| 2 | total outstanding | 208 723 504 430 |
| 3 | loans disbursed in 2026 (through as-of) | 3 051 |
| 4 | principal disbursed in 2026 | 162 333 060 000 |
| 5 | September 2026 disbursements (count and amount, two cells) | 361 / 17 015 490 000 |
| 6 | loans with dpd > 0 | 399 |
| 7 | loans in 90+ | 234 |
| 8 | outstanding share of Small business loan (`0.0%`) | 60.3 % |
| 9 | average principal of 2026 SME loans | 312 246 230 |
| 10 | approval rate by channel, all-applications convention (three cells — you build them in section 6, Company corner) | app 58.2 % · branch 63.7 % · partner 61.9 % |

Plus the P4 status × bucket cross-tab on a second sheet `Buckets` — this time for all loans, without the `dpd > 0` pair — formatted (`#,##0`, header bold, frozen), with the five column totals 7 429 / 124 / 25 / 16 / 234.

Graded on: (a) all values equal the SQL numbers (a `=B3=C3` check column showing TRUE is welcome), (b) every cell is a formula with structured references or `$`-pinned ranges — a formula that breaks when a row is added to `Loans` loses the point, (c) formats: money with thousands separators, rates as percentages, dates as `yyyy-mm-dd`.

**Before you send any sheet to a colleague** (this pack, and every file this week):

1. Header row bold and frozen; column widths fit (double-click the border).
2. Every number formatted — no `208723504430`, no `0.031177`.
3. A title cell that says *what, as of when, from which file* (`Portfolio summary · as of 2026-10-01 · tblLoans`).
4. A check cell that must equal a known total, labelled *check*.
5. Formulas, not values — Ctrl+` shows you in one glance.
6. No stray sheets (`Sheet3`, `Copy of Loans (2)`), no hidden columns that matter.
7. Sheets: sharing set to *view* for readers, *edit* for the one person who owns it.

### Check your key numbers before you hand in

Read four numbers off your own `functions_pack.xlsx` — they are not in the table above, so a ✓ means your formulas, not your typing, are right.

**K1.** Cell 9 averages over a group: how many Small business loans were disbursed in 2026 (through the as-of date)? One `COUNTIFS` with two pairs.

**K2.** Their principal in total, in soum (the numerator behind cell 9).

**K3.** The approval rate of all three channels together, all-applications convention, as a percentage with 1 decimal — the total row under cell 10.

**K4.** On your `Buckets` sheet: how many *active* loans are late (1-30, 31-60 and 61-90 together)?

### 📎 Hand in here

---

## 5. Self-check

---

## 6. Company corner <span class="badge company">Approval rate by channel, in cells</span>

Week 2's **approval rate by channel** (*уровень одобрения по каналам*) under both conventions — all applications, and decided only (cancelled out) — as `COUNTIFS` on `tblApplications`. Marketing's version differs from Nilufar's because they use different denominators; your sheet shows both and says which is which.

Sheet `Approval`: channels in A3:A5 (`app`, `branch`, `partner`), then:

| Cell | Column | Formula |
|---|---|---|
| B3 | applications | `=COUNTIFS(tblApplications[channel], $A3)` |
| C3 | approved | `=COUNTIFS(tblApplications[channel], $A3, tblApplications[status], "approved*")` |
| D3 | decided | `=COUNTIFS(tblApplications[channel], $A3, tblApplications[status], "<>cancelled")` |
| E3 | rate, all | `=C3/B3` → 0.0% |
| F3 | rate, decided | `=C3/D3` → 0.0% |

| channel | applications | approved | decided | rate (all) | rate (decided) |
|---|---|---|---|---|---|
| app | 5 006 | 2 915 | 4 274 | **58.2 %** | 68.2 % |
| branch | 6 223 | 3 965 | 5 478 | **63.7 %** | 72.4 % |
| partner | 2 771 | 1 715 | 2 431 | **61.9 %** | 70.5 % |
| total | 14 000 | 8 595 | 12 183 | 61.4 % | 70.5 % |

Three things to check before it goes into the pack. **The wildcard:** `"approved*"` counts `approved` and `approved_not_disbursed` — 7 917 + 678 = 8 595 — because an approval is a decision whether or not the money was taken; `"approved"` alone gives 7 917 and an approval rate of 56.6 %, Marketing's number. **The total row** is a `SUM` of the counts, never an average of the rates (the simple average of 58.2 / 63.7 / 61.9 is 61.3, not 61.4 — mix matters). **The convention** is written in the header, `rate (all)` / `rate (decided)`, exactly as week 2's `rate_all` / `rate_decided`; a column called just `approval rate` is the reason two departments disagree.

The app is 4–5 points below the branch under either convention — the same gap SQL showed, now in a file the board can click. Add a note cell: *approved = status beginning "approved"; decided = all but cancelled; source tblApplications, 14 000 rows as of 2026-10-01.* That one sentence is what makes the sheet a report and not a guess.

> 🎯 **Interview version.** *"How do you compute an approval rate in Excel, and what do you check?"* — `COUNTIFS` with a wildcard on the status for the numerator, two denominators (all / decided) as two columns, rates as `=num/den` formatted `0.0%`; check the counts add to 14 000, never average the rates, and name the convention in the header.

**Say it like in an interview.** Bekzod forwards Marketing's slide: *"Approval rate 56.6 %. Your sheet says 61.4 %. Which one is wrong?"* Answer him in 30 words or more, the way you would say it in the meeting.

Tomorrow: joining in Excel — VLOOKUP and its traps, INDEX/MATCH, XLOOKUP against the Lookup sheet, and the dynamic arrays (FILTER, UNIQUE, SORT) that make a dropdown-driven branch report.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 4 · Day 2 — Lookups and dynamic arrays: joining in Excel (weeks/week-04/day-2.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-04/day-2
=====

# Week 4 · Day 2 — Lookups and dynamic arrays: joining in Excel

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge company">Company corner</span>

> STORY **Tuesday, 9:10.** Sevara, head of collections (*руководитель по взысканию*), with yesterday's `Loans` sheet printed and highlighted by hand. *"I did this with a marker for Tashkent South last night. I want the file to do it: **colour every loan by its bucket** — red for 90+, orange, yellow — and give me a **dropdown** at the top where I pick a branch and the sheet shows only that branch's late loans, worst first, with the count and the money. And put the product's interest rate next to each loan; the rate lives on another sheet and I am not retyping it 7 828 times."*

## Today in 3 lines

- A **lookup** is a join: `VLOOKUP` (and its four traps), `INDEX/MATCH`, and `XLOOKUP` — exact match for keys, **approximate match** for buckets and bands, not-found text instead of `#N/A`.
- **Dynamic arrays** — `FILTER`, `UNIQUE`, `SORT`, `SORTBY`, `SEQUENCE` — return many cells from one formula (a *spill*); with a **data-validation dropdown** they make a report the reader drives.
- **Conditional formatting** turns a bucket column into colour; you have built Sevara's sheet and reproduced the bucket counts 7 429 / 124 / 25 / 16 / 234 with an approximate lookup against the `Lookup` table.

**Today's file:** `data/excel/nur_week4_start.xlsx` again — press **⬇ Download** if you need a fresh copy and save it as `week-04/day-2/practice.xlsx` (yesterday's copy works too). `FILTER`, `UNIQUE`, `SORT` and `XLOOKUP` need Excel 365 / 2021 or Google Sheets; in Excel 2016/2019 use `INDEX/MATCH` and leave the spills for Day 4's pivots. **Done today** = Sevara's `Collections` sheet answers to its dropdown (Tashkent South → 59 late loans), every Practice box is ✓, the Quick check is answered and the day quiz is passed. No new homework — HW 4.1 is due tomorrow.

---

## 1. Learn — a lookup is a join with one row

A lookup brings a value from another table into your row: the product's rate next to each loan, the customer next to a loan id. Then dynamic arrays return whole lists from one formula, and two sheet tools — dropdowns and conditional formatting — turn the result into a report the reader drives.

**The small tables used on this page.** Most subsections show a formula on these first, then on the real workbook. `Car lease` has no row in `rates` — that row shows what "not found" does.

| row | A `loan_id` | B `product` | C `outstanding` |
|---|---|---|---|
| 2 | 101 | Micro loan | 4 |
| 3 | 102 | Auto loan | 200 |
| 4 | 103 | Car lease | 90 |
| 5 | 104 | Micro loan | 2 |

| row | E `product` | F `rate` |
|---|---|---|
| 2 | Micro loan | 0.42 |
| 3 | Auto loan | 0.24 |
| 4 | Consumer loan | 0.30 |

On the real workbook the second table is `Lookup!A3:F7`: `product`, `code`, `annual_rate`, `min_amount`, `max_amount`, `channel` — five products, Micro loan 0.42, Consumer loan 0.30, Buy now pay later 0, Auto loan 0.24, Small business loan 0.26.

### The lookup problem — a LEFT JOIN that brings one column

**What it is.** A **lookup** (*поиск значения*) takes a **key** from your row (here `product`), finds the same key in another table, and returns one value from that row (here `rate`). It is week 2's `LEFT JOIN` that brings **one** column across: every row of your table stays, and a row whose key is missing gets an error instead of NULL.

**How to write it.** Every lookup function has the same three parts:

| Part | Means | Example |
|---|---|---|
| what | the key in this row | B2 ("Micro loan") |
| where | the column to search for the key | E2:E4 |
| return | the column to bring back | F2:F4 |

The picture — the loans table with the looked-up rate added:

Four rows in, four rows out. `Car lease` finds no partner, so it gets `#N/A`. `Consumer loan` appears in no loan, so nothing brings it in — the same as the right-hand row of a LEFT JOIN.

On the real workbook, a `rate` column on `tblLoans` keeps all **7 828** rows: each loan has exactly one product, and each product has exactly one row on `Lookup`.

**When you use it.**
- "Each X with one fact about it from another table": each loan with its product's rate, each instalment with its loan's status.
- The key must be unique on the lookup side — one row per product, one row per loan.

| SQL | Excel |
|---|---|
| `LEFT JOIN products p ON p.name = l.product` + `SELECT p.rate` | one lookup formula in a `rate` column of `tblLoans` |
| NULL for a row with no partner | `#N/A` (or your own "not found" text) |
| several matches → several rows | several matches → **the first one only** |

> ⚠️ **Watch out.** A lookup returns only the **first** match. If the key repeats on the lookup side — a customer *name* instead of an id — you silently get one arbitrary row. Look up on ids. Lookups also **ignore case**: `"micro loan"` finds `Micro loan`, and two keys that differ only in case (`cash` and `CASH`) are one key to a lookup — the first row wins.

**Your turn.** Each loan needs its product's annual rate. What are the key and the table you search?

### VLOOKUP and its four traps

**What it is.** **VLOOKUP** (*ВПР*) finds `what` in the **first column** of a range and returns the value from the n-th column of the same row. It is the oldest and most used lookup in finance — and the easiest to get wrong.

**How to write it.**

| Formula | Note |
|---|---|
| `=VLOOKUP(what, where, column_number, FALSE)` |   |
| `=VLOOKUP(B2, $E$2:$F$4, 2, FALSE)` | what = this row's product · where = the whole rates table · 2 = its 2nd column · FALSE = exact match |

On the small table it returns 0.42, 0.24, `#N/A`, 0.42. On the real workbook:

| Formula | Gives |
|---|---|
| `=VLOOKUP([@product], Lookup!$A$3:$F$7, 3, FALSE)` | 0.30 for a Consumer loan |

The four traps, each of which has produced a wrong board number somewhere:

| # | Trap | What goes wrong | Fix |
|---|---|---|---|
| 1 | The 4th argument defaults to TRUE = **approximate** | on an unsorted key column it returns a neighbour's value, with no error | always write `FALSE` (or `0`) |
| 2 | The column is a **number**, not a name | insert a column in `Lookup` and `3` now points at `code` | `INDEX/MATCH` or `XLOOKUP` |
| 3 | It looks only to the **right** | the key must be the first column; you cannot return `product` from `code` | `INDEX/MATCH` or `XLOOKUP` |
| 4 | A relative range **walks** | `A3:F7` copied down becomes `A4:F8` and the last product stops matching | `$A$3:$F$7`, or a Table name |

`HLOOKUP` is the same thing sideways (keys in the first *row*). You will meet it in old files.

**When you use it.**
- In files that must open in very old Excel, and when you read other people's work.
- For new work, prefer `XLOOKUP` (below) or `INDEX/MATCH`.

> ⚠️ **Watch out.** Leave out `FALSE` and a key in an unsorted list comes back as a *neighbour's* value — a wrong rate, no `#N/A`, nothing red.

**Your turn.**

### INDEX / MATCH — find the position, then take the value

**What it is.** **MATCH** (*ПОИСКПОЗ*) returns the **position** of a value in one column. **INDEX** (*ИНДЕКС*) returns the value at a position in another column. Together they are a lookup that can return any column — left or right of the key — and that does not break when columns are inserted.

**How to write it.**

| Formula | Note |
|---|---|
| `=MATCH(what, one_column, 0)` | 0 = exact match → a position (1, 2, 3 …) |
| `=INDEX(one_column, position)` | the value at that position |
| `=INDEX(return_column, MATCH(what, key_column, 0))` |   |

On the small table: `=MATCH("Auto loan", E2:E4, 0)` → **2**; `=INDEX(F2:F4, 2)` → **0.24**. Together: `=INDEX($F$2:$F$4, MATCH(B3, $E$2:$E$4, 0))` → 0.24.

On the real workbook:

| Formula | Gives |
|---|---|
| `=INDEX(Lookup!$C$3:$C$7, MATCH([@product], Lookup!$A$3:$A$7, 0))` | the rate |
| `=INDEX(Lookup!$A$3:$A$7, MATCH("SME", Lookup!$B$3:$B$7, 0))` | "Small business loan" (looking left) |

`SME` is in position 5 of the `code` column, so `INDEX` takes position 5 of the `product` column, which sits to the **left** of `code`.

**MATCH's third argument — the match type.**

| Match type | Finds | The column must be |
|---|---|---|
| `0` | exactly `what` | in any order |
| `1` | the largest value ≤ `what` | sorted ascending — the band case |
| `-1` | the smallest value ≥ `what` | sorted descending |

`=MATCH(45, Lookup!$A$11:$A$15, 1)` → **3**: the largest lower edge ≤ 45 is 31, the third edge. `=INDEX(Lookup!$B$11:$B$15, 3)` → `31-60`.

**Two-way lookup.** Two `MATCH`es pick one cell out of a matrix — one for the row, one for the column:

```excel
=INDEX(matrix, MATCH(row_key, row_labels, 0), MATCH(col_key, col_labels, 0))
```

On yesterday's region × product outstanding matrix, Fergana × Small business loan returns **14 734 245 108**.

**When you use it.**
- Any Excel version: `INDEX/MATCH` works in Excel 2010 and later, where `XLOOKUP` does not exist.
- A value to the left of the key; one cell from a two-way table.

> ⚠️ **Watch out.** `MATCH` without its third argument means `1` — approximate, sorted. Write the `0` for keys, every time.

**Your turn.** What does `=INDEX(Lookup!$C$3:$C$7, MATCH("Auto loan", Lookup!$A$3:$A$7, 0))` return?

### XLOOKUP — exact match and "not found"

**What it is.** **XLOOKUP** (*ПРОСМОТРX*) is the modern lookup (Excel 2021 / Microsoft 365, Google Sheets). It takes the key column and the return column separately, matches exactly by default, and has its own argument for "not found".

**How to write it.**

```excel
=XLOOKUP(what, lookup_column, return_column, [if_not_found], [match_mode], [search_mode])
=XLOOKUP(B2, $E$2:$E$4, $F$2:$F$4, "not found")
```

On the small table it returns 0.42, 0.24, `not found`, 0.42 — row 103 reads `not found` instead of `#N/A`.

On the real workbook:

| Formula | Note |
|---|---|
| `=XLOOKUP([@product], Lookup!$A$3:$A$7, Lookup!$C$3:$C$7)` | exact by default; #N/A if missing |
| `=XLOOKUP($B$1, tblLoans[loan_id], tblLoans[customer], "not found")` |   |

With 2167 in `B1` the second formula returns **Dilnoza Abdullaeva**; with 99999 it returns `not found`.

| VLOOKUP trap | XLOOKUP |
|---|---|
| 1 — approximate by default | exact by default |
| 2 — column number | the return column itself |
| 3 — right only | the return column can be anywhere |
| 4 — the range walks | still pin with `$`, or use Table columns |

**When you use it.**
- Every new key → value lookup, when the file's readers have Excel 2021 / 365 or Sheets.
- In Excel 2016/2019 it shows `#NAME?` — write `INDEX/MATCH` there and say so in the header.

**Your turn.** Build Sevara's loan finder.

### XLOOKUP for bands — approximate and wildcard match

(Animated explanation)
Which band? The largest edge not above
- The band table on `Lookup` holds five **lower edges**: 0, 1, 31, 61, 91. Each band starts at its edge (● = in) and stops just before the next one (○ = out).
- match_mode -1: the exact value, or else the **next smaller** edge. dpd 45: no edge is 45; the next smaller is 31 → **31-60**.
- dpd 0 is exactly an edge: an exact match → **0**.
- 30 is not an edge.
- 30 → 1-30, and 919 → **90+**: the last band has no end. Five rows of edges cover all 258 dpd values from 0 to 919.
- The trap: a table of **upper** edges (0, 30, 60, 90, 9999) with -1. dpd 31 finds 30 and comes back as **1-30** — wrong, and no error.
- Each kind of edge has its own match_mode.
- Back to lower edges and -1. Drop a few dpd values and watch each one land in the band of its largest edge not above it.

**What it is.** The 5th argument, **match_mode**, changes how XLOOKUP compares. `-1` finds the exact value **or the next smaller** one — the rule for a **band table** (*таблица диапазонов*) whose key column holds lower edges. `2` lets the key contain wildcards `*` and `?`.

**How to write it.**

| match_mode | Means |
|---|---|
| 0 | exact (default) |
| -1 | exact or next smaller |
| 1 | exact or next larger |
| 2 | wildcard |

| Formula | Note |
|---|---|
| `=XLOOKUP([@dpd], Lookup!$A$11:$A$15, Lookup!$B$11:$B$15, , -1)` | the empty 4th argument: no not-found text |

The band table on `Lookup` and what three dpd values get:

dpd takes 258 different values, from 0 to 919; five rows of edges cover all of them. On `tblLoans` this formula reproduces the shipped `bucket` column exactly. The same rule in older spellings: `=VLOOKUP([@dpd], Lookup!$A$11:$B$15, 2, TRUE)` or `=INDEX(Lookup!$B$11:$B$15, MATCH([@dpd], Lookup!$A$11:$A$15, 1))`.

Wildcard: `=XLOOKUP("Small*", Lookup!$A$3:$A$7, Lookup!$C$3:$C$7, , 2)` → **0.26**.

**When you use it.**
- Any band: dpd → bucket, income → band, score → grade, amount → fee tier.
- A boundary change becomes one cell on `Lookup`, not an edit to every formula.

| Key column holds | Use |
|---|---|
| lower edges (0, 1, 31, 61, 91) | match_mode `-1` (`VLOOKUP … TRUE`, `MATCH … 1`) |
| upper edges (0, 30, 60, 90, 9999) | match_mode `1` |

> ⚠️ **Watch out.** Lower edges with `1`, or upper edges with `-1`, put every dpd that is not exactly on an edge into the neighbouring band, with no error: upper edges (30, 60, 90) with `-1` send dpd 31 to `1-30`; lower edges (1, 31, 61) with `1` send dpd 45 to `61-90`. And `VLOOKUP … TRUE` and `MATCH … 1` need the edges sorted ascending.

**Your turn.** Which bucket does `=XLOOKUP(61, Lookup!$A$11:$A$15, Lookup!$B$11:$B$15, , -1)` return?

### XLOOKUP from the end — the last match

**What it is.** The 6th argument, **search_mode**, sets the direction. `1` (default) searches from the top and returns the **first** match. `-1` searches from the bottom and returns the **last** match.

**How to write it.**

| search_mode | Means |
|---|---|
| 1 | first to last (default) |
| -1 | last to first |

| Formula | Note |
|---|---|
| `=XLOOKUP(4567, tblPayments[loan_id], tblPayments[paid_at], , 0, -1)` | the bottom row of loan 4567 |

Loan 4567 has three payment rows: 2026-04-07, 2026-05-06, 2026-06-09. From the top the formula would return 2026-04-07; from the bottom it returns **2026-06-09** (format the cell `yyyy-mm-dd`).

**When you use it.**
- "The latest X of each Y" when the table is in date order: the last payment of a loan, the last status of an application.
- With `MAXIFS` as the check: `=MAXIFS(tblPayments[paid_at], tblPayments[loan_id], 4567)` returns the latest date whatever the row order.

> ⚠️ **Watch out.** `-1` gives the last **row**, not the latest **date**. In `tblPayments`, for 80 of the 7 436 loans with payments the bottom row is not the latest date (duplicates and late entries sit at the end). For "latest", use `MAXIFS` on the date.

**Your turn.** What does `=XLOOKUP(4567, tblPayments[loan_id], tblPayments[paid_at], , 0, 1)` return — the same formula searching from the top?

### Two-key lookups

**What it is.** A **two-key lookup** finds the row where **two** columns match at once — a join on two columns. The usual way: glue the two keys into one with `&` and look that up.

**How to write it.** Three ways, best first:

| Way | Written | Note |
|---|---|---|
| 1. helper key column | `[@loan_id]&"\|"&[@installment_no]` | in the lookup table, then an exact lookup on it |
| 2. glue inside | `=XLOOKUP(k1&"\|"&k2, col1&"\|"&col2, return_column)` |   |
| 3. classic array | `=INDEX(return_column, MATCH(1, (col1=k1)*(col2=k2), 0))` | old Excel: Ctrl+Shift+Enter |

The `"|"` keeps `1`&`12` and `11`&`2` apart: `1|12` and `11|2` are different keys, `112` and `112` are not. On a tiny instalments table:

| `loan_id` | `installment_no` | `due_date` | key = `loan_id&"\|"&installment_no` |
|---|---|---|---|
| 1 | 1 | 2025-04-28 | 1\|1 |
| 1 | 2 | 2025-05-28 | 1\|2 |
| 1 | 3 | 2025-06-28 | 1\|3 |

`=XLOOKUP("1|3", key_column, due_date_column)` → 2025-06-28.

On the real workbook: `=XLOOKUP(1&"|"&3, tblInstallments[loan_id]&"|"&tblInstallments[installment_no], tblInstallments[due_date])` → **2025-06-28**, loan 1's third instalment. It glues 92 193 pairs on every recalculation, so a helper column is faster on a table that size.

**When you use it.**
- The row is identified by two columns: loan + instalment number, month + product, region + product.
- When the two keys define a **group** and you want a **total**, it is not a lookup: `SUMIFS` with two pairs (yesterday).

| Two keys → | Use |
|---|---|
| one row's value | a two-key lookup |
| a sum over many rows | `SUMIFS` with two pairs |

**Your turn.** Fergana + Small business loan → the total outstanding of those 95 loans. Which tool?

### IFERROR — a replacement for an expected error

**What it is.** **IFERROR** (*ЕСЛИОШИБКА*) returns the formula's result, or a second value when the formula returns any error. It is how `VLOOKUP` and `INDEX/MATCH` show "not found" instead of `#N/A`.

**How to write it.**

| Formula | Gives |
|---|---|
| `=IFERROR(formula, value_if_error)` |   |
| `=IFERROR(INDEX($F$2:$F$4, MATCH(B4, $E$2:$E$4, 0)), "not found")` | `"not found"` for Car lease |

On the real workbook: `=IFERROR(INDEX(tblLoans[customer], MATCH($B$1, tblLoans[loan_id], 0)), "not found")` returns the same as the XLOOKUP loan finder above — `not found` for 99999.

**When you use it.**
- A miss that is **expected** and a replacement that **means** something: `"not found"`, `""`, sometimes `0`.
- With a check cell that counts the misses: `=COUNTIF(rate_column, "not found")` must be 0 when every product is on `Lookup`.
- **IFNA** (*ЕСНД*) is the narrow version: `=IFNA(x, "not found")` replaces only `#N/A` — the one error a lookup miss gives — and lets every other error show. Prefer it (or XLOOKUP's own not-found argument) to `IFERROR` around a lookup.

| `IFERROR(x, …)` | `XLOOKUP(…, "not found")` |
|---|---|
| catches **every** error: `#N/A`, `#REF!`, `#VALUE!`, `#DIV/0!` | replaces only "no match" |
| hides a broken formula | a broken formula still shows its error |

> ⚠️ **Watch out.** `IFERROR(…, 0)` around a lookup with a `SUM` under it turns every miss into a zero — the total looks complete and is short. Never wrap a formula you do not understand: an `IFERROR` around a `#REF!` is a blank cell on the board slide.

**Your turn.** Three loans have a trailing space in `product`, and the rate column is `=IFERROR(VLOOKUP([@product], Lookup!$A$3:$F$7, 3, FALSE), 0)`. What does the run-rate total under it show?

### Dynamic arrays — one formula, many cells (a spill)

**What it is.** In Excel 365 / 2021 and Sheets a formula can return many values. They **spill** (*разлив*) into the cells below and to the right, outlined in blue. The formula lives in the top-left cell only. `A3#` means "the whole spill that starts in A3".

**How to write it.**

| Cell | Formula | Note |
|---|---|---|
| A3 | `=UNIQUE(tblLoans[branch])` | one formula → 10 cells, A3:A12 |
| B3 | `=ROWS(A3#)` | → 10 · # = all of A3's spill, however long |

| | A |
|---|---|
| 3 | `=UNIQUE(…)` → Termez Central |
| 4 | *(spilled)* Nukus Central |
| … | … |
| 12 | *(spilled)* — the 10th branch |

If something is in the way, A3 shows **`#SPILL!`** and nothing spills. Clear the cells below.

**When you use it.**
- A list whose length you do not know in advance: the branches, the late loans of one branch, the months of a year.
- `A3#` in every formula that reads the list, so counts and sums follow it as it grows and shrinks.

> ⚠️ **Watch out.** A spill cannot live inside an Excel Table. Put `UNIQUE`, `FILTER` and `SORT` on a plain sheet, next to or below your Tables.

**Your turn.** `=FILTER(…)` in A6 shows `#SPILL!`. What is the first thing to check?

### UNIQUE — the distinct values

**What it is.** **UNIQUE** (*УНИК*) returns each distinct value of a range once. It is `SELECT DISTINCT` in a cell.

**How to write it.**

| Formula | Gives | Note |
|---|---|---|
| `=UNIQUE(range)` |   |   |
| `=UNIQUE(tblLoans[region])` | 8 rows | one per region |
| `=ROWS(UNIQUE(tblLoans[branch]))` | 10 | a count of distinct values |

On the small loans table: `=UNIQUE(B2:B5)` → `Micro loan`, `Auto loan`, `Car lease` — three rows, Micro once.

**When you use it.**
- The labels of a summary table: `A3 =UNIQUE(tblLoans[branch])`, then `B3 =SUMIFS(tblLoans[outstanding], tblLoans[branch], A3#)` spills one total per branch.
- The source list of a dropdown.
- A distinct count: `ROWS(UNIQUE(…))` = `COUNT(DISTINCT …)` — except for blanks. `UNIQUE` keeps one empty cell as a value (it shows as 0), while `COUNT(DISTINCT)` skips NULL. On a column with gaps, filter them out first: `=ROWS(UNIQUE(FILTER(range, range<>"")))`.

> ⚠️ **Watch out.** A distinct count of a **name** column is not a count of people: two people can share a name, and one person can be typed two ways. Count distinct **ids**.

**Your turn.** How many distinct products does `=ROWS(UNIQUE(tblLoans[product]))` return?

### FILTER — the rows that meet a condition

**What it is.** **FILTER** (*ФИЛЬТР*) returns the rows of a range where a condition is TRUE. It is `SELECT … WHERE …` in a cell.

**How to write it.**

```excel
=FILTER(range, condition, [if_empty])
=FILTER(tblLoans, (tblLoans[branch]=$B$1)*(tblLoans[dpd]>0), "no late loans")
```

| Part | Means |
|---|---|
| `tblLoans` | rows |
| `(a)*(b)` | AND = multiply |
| `"no late loans"` | text when nothing matches |

Conditions are columns of TRUE/FALSE. **Multiply** them for AND, **add** them for OR: `(a)+(b)`.

On the small loans table: `=FILTER(A2:C5, B2:B5="Micro loan")` → rows 101 and 104.

On the real workbook: `=FILTER(tblLoans[loan_id], (tblLoans[branch]="Termez Central")*(tblLoans[dpd]>0))` → **22** loan ids — Termez Central's late loans. `=SUM(FILTER(tblLoans[outstanding], (tblLoans[branch]="Termez Central")*(tblLoans[dpd]>0)))` → 159 281 532 of late money.

**When you use it.**
- A list a person reads: Sevara's late loans of one branch, the applications of one officer.
- With a cell in the condition (`$B$1`), so the list changes when the cell changes.

| | `FILTER` | Filter button on a Table |
|---|---|---|
| Result | a new list, by formula | the same rows, some hidden |
| Changes with a cell | yes | no — someone clicks |
| Can be summed by formula | yes, `SUM(FILTER(…))` | only with `SUBTOTAL` |

> ⚠️ **Watch out.** `AND(a, b)` does not work inside `FILTER` — it returns one TRUE/FALSE for the whole column. Write `(a)*(b)`.

**Your turn.**

### SORT and SORTBY — order a list

**What it is.** **SORT** (*СОРТ*) returns a range sorted by one of its own columns. **SORTBY** sorts a range by **another** range of the same length. They are `ORDER BY` in a cell.

**How to write it.**

| Formula | Note |
|---|---|
| `=SORT(range, [column_number], [order])` | order: 1 ascending (default), -1 descending |
| `=SORTBY(range, by_range, [order])` |   |
| `=SORT(FILTER(tblLoans, …), 12, -1)` | by the 12th column of tblLoans (dpd), worst first |
| `=SORTBY(tblLoans[loan_id], tblLoans[outstanding], -1)` |   |

On the small loans table: `=SORTBY(A2:A5, C2:C5, -1)` → 102, 103, 101, 104 (by outstanding 200, 90, 4, 2).

On the real workbook: `=SORTBY(tblLoans[loan_id], tblLoans[outstanding], -1)` starts with **4597** — the largest outstanding, 586 068 714 — then 6478 and 2936. `=SORT(UNIQUE(tblLoans[region]))` lists the regions from Andijan to Termez.

**When you use it.**
- A ranked list: worst loans first, biggest branches first.
- `SORT` when the sort column is inside the range; `SORTBY` when it is not, or when you sort a spill by another spill (`=SORTBY(A3#, B3#, -1)`).
- Top n: `=TAKE(SORT(…), 5)` in Excel 365.

> ⚠️ **Watch out.** `SORT`'s column number counts from the range's first column, not from column A of the sheet. In `tblLoans`, `dpd` is the 12th column.

**Your turn.** In `=SORT(FILTER(tblLoans, …), 11, -1)`, which column of `tblLoans` sorts the list?

### SEQUENCE — a column of numbers

**What it is.** **SEQUENCE** (*ПОСЛЕДОВ*) returns a list of numbers: 1, 2, … n. Used inside another function it builds a list of dates or labels.

**How to write it.**

| Formula | Gives |
|---|---|
| `=SEQUENCE(rows, [columns], [start], [step])` |   |
| `=SEQUENCE(5)` | 1, 2, 3, 4, 5 |
| `=DATE(2026, SEQUENCE(10), 1)` | 2026-01-01, 2026-02-01, … 2026-10-01 |

With the dates in A3#, `B3 =COUNTIFS(tblLoans[disbursed_at], ">="&A3#, tblLoans[disbursed_at], "<"&EDATE(A3#, 1))` spills one count per month. January 2026 has **287** loans.

**When you use it.**
- A calendar of months or days to count against — including the months with zero loans.
- Row numbers and ranks next to a sorted spill.

**Your turn.** What is the last date in the spill of `=DATE(2026, SEQUENCE(10), 1)`?

### Data validation — a dropdown the reader picks from

**What it is.** **Data validation** (*проверка данных*) limits what can be typed in a cell. Its **List** type makes a **dropdown** (*выпадающий список*). Every formula that reads the cell changes when the reader picks another value — the Excel version of a query parameter.

**How to write it.**

```text
Select B1
  → Data
  → Data Validation
  → Allow: List
  → Source: =Helper!$A$2#

Helper!A2:
  =SORT(UNIQUE(tblLoans[branch]))
  the list, spilled on a helper sheet

Sheets:
  Data
  → Data validation
  → Dropdown (from a range)
  → Helper!A2:A11
```

Then every formula reads `$B$1`:

```excel
=COUNTIFS(tblLoans[branch], $B$1, tblLoans[dpd], ">0")
```

Pick **Tashkent South** → **59** late loans; pick **Termez Central** → 22.

**When you use it.**
- A one-page report for many branches, products or months: one dropdown instead of ten copies of the sheet.
- To stop typos in an input cell: a branch that is not on the list cannot be typed.

> ⚠️ **Watch out.** The source must be a **range** (`=Helper!$A$2#` or `$A$2:$A$11`), not a Table column name — Excel refuses `=tblLoans[branch]` there.

**Your turn.** Which source does Excel accept for the branch dropdown?

### Conditional formatting — cells that colour themselves

**What it is.** **Conditional formatting** (*условное форматирование*) changes a cell's colour by a rule on its value. Home → Conditional Formatting (Sheets: Format → Conditional formatting). The value does not change; only the display does.

**How to write it.** Four kinds:

| Kind | Example | Good for |
|---|---|---|
| Highlight cell rule | `dpd` greater than 90 → red | one threshold on one column |
| Colour scale | `outstanding`, white → blue | finding the big values by eye |
| Data bars | a bar in each `dpd` cell | a chart inside the table |
| **Formula rule** | `=$M2="90+"` → red fill on A2:M7829 | colouring a **whole row** by one column |

The formula rule, row by row. Select A2:M7829 and write the rule for the **first row** of the selection:

| Rule | Means |
|---|---|
| `=$M2="90+"` | $M = always column M (bucket) · 2 = the row moves with each row |

| Cell | The rule Excel applies | Reads |
|---|---|---|
| A2 | `=$M2="90+"` | row 2's bucket |
| F2 | `=$M2="90+"` | row 2's bucket |
| A3 | `=$M3="90+"` | row 3's bucket |

Add `=$M2="61-90"` (orange), `=$M2="31-60"` (yellow), `=$M2="1-30"` (light yellow). On `Loans` the orange rule paints **16** rows. Manage Rules shows every rule and their order.

**When you use it.**
- A list a person scans: Sevara's loans by bucket, overdue rows, values over a limit.
- One rule per meaning. Forty overlapping rules make a slow, unreadable sheet.

> ⚠️ **Watch out.** Pin the **column**, free the **row**: `=$M2`. With `$M$2` every row is coloured by row 2's bucket; with `M2` the rule drifts one column right in every cell. For a quantity, never use a red–green scale: red means *bad* in a lending file, and colour-blind readers cannot tell them apart.

**Your turn.** Sevara selects A6:N2000 under her spill. Which rule colours a row red when its bucket (column M) is 90+?

> 🎬 **Didn't get conditional formatting (built-in rules)?** [A short explanation · 6 min](https://youtu.be/zXnQNytHCPM?t=36&end=425)

> 🎬 **Didn't get conditional formatting with your own formula?** [A short explanation · 6 min](https://youtu.be/zXnQNytHCPM?t=808&end=1190)

### Reading the errors

**What it is.** An error value tells you *what kind* of thing went wrong. Read it before you fix — or hide — anything.

**How to write it.** The six you will meet this week:

| Error | Means | First check |
|---|---|---|
| `#N/A` | the lookup found nothing | a space in the key (`"Micro loan "`), a number stored as text (`"2167"` vs 2167 — `VALUE()` one side); never a case difference — lookups ignore case |
| `#REF!` | a reference points at deleted cells, or `VLOOKUP`'s column number is bigger than the range | the range width; what was deleted |
| `#VALUE!` | wrong type of argument (text where a number is needed; ranges of different sizes) | `SUMIFS` ranges of equal length; dates as text |
| `#NAME?` | Excel does not know the function (XLOOKUP in Excel 2016) or a name is misspelt | the Excel version; quotes around text |
| `#SPILL!` | a dynamic array has no room | clear the cells below / right of the formula; no merged cells there; not inside a Table |
| `#DIV/0!` | a share with an empty denominator | an empty group; `IF(den=0, "", num/den)` |

**When you use it.** Every time a cell shows `#`. `IFERROR` hides all six alike — that is why it is for *expected* misses only.

**Your turn.**

### Which lookup, when

**What it is.** A choice table for this page's tools. Start from the question: one value, a band, a group total, or a list.

**How to write it.**

| Situation | Use | Not |
|---|---|---|
| Key → one value, Excel 365 / 2021 / Sheets | `XLOOKUP` | `VLOOKUP` (traps 1–3) |
| Key → one value, Excel 2016 / 2019, or a file others open in old Excel | `INDEX/MATCH` | `XLOOKUP` (shows `#NAME?` there) |
| A band (dpd → bucket, income → band, score → grade) | `XLOOKUP … -1` / `VLOOKUP … TRUE` / `MATCH … 1` on a **sorted lower-edge** table | nested `IFS` with the edges typed in |
| Two keys → one value | helper key column + exact lookup | `VLOOKUP` on a concatenation typed per cell |
| Two keys → a **sum** | `SUMIFS` (it is a group, not a row) | a lookup — it returns the first match only |
| One cell from a two-way matrix | `INDEX(matrix, MATCH(row), MATCH(col))` | copying the matrix |
| A list of rows that match | `FILTER` (+ `SORT`) | 7 828 `IF`s |
| Distinct values of a column | `UNIQUE` | Remove Duplicates on a copy (Day 3: it lies) |
| Last occurrence (latest payment of a loan) | `XLOOKUP … , , , -1` on a date-ordered table, or `MAXIFS` on the date | `VLOOKUP` (first match only) |

**When you use it.** Before you write the formula: name the shape of the answer first.

**Your turn.**

### Excel ↔ Google Sheets — today's functions

**What it is.** Sheets has every function on this page, with small spelling differences. Sheets also has **ARRAYFORMULA**, which makes an ordinary formula fill a whole column — its substitute for a Table's calculated column.

**How to write it.**

| Excel | Sheets | Note |
|---|---|---|
| `XLOOKUP(what, keys, values, "n/a", -1)` | same | same arguments |
| `tblLoans[dpd]` | `Loans!L2:L` | open-ended column; filter out the blank tail (`Loans!A2:A<>""`) |
| `[@dpd]` in a calculated column | `=ARRAYFORMULA(IFS(L2:L=0, "0", …))` in row 2 | one formula fills the column |
| `FILTER(range, (a)*(b))` | `FILTER(range, a, b)` | conditions as separate arguments; `(a)+(b)` for OR works in both |
| `SORT(range, 12, -1)` | `SORT(range, 12, FALSE)` | FALSE = descending |
| `SORTBY(range, by, -1)` | `SORT(range, by, FALSE)` | Sheets' `SORT` takes a range to sort by directly |
| `TAKE(SORT(…), 5)` | `SORTN(range, 5, 0, by, FALSE)` | top-n in one function |
| Data Validation → List | Data validation → Dropdown (from a range) | same idea |
| Conditional Formatting → formula rule | Format → Conditional formatting → Custom formula is | same `=$M2="90+"` form |

**When you use it.** When the file lives in Google Drive, or a colleague's formula comes from Sheets.

> ⚠️ **Watch out.** `ARRAYFORMULA` over an open-ended column fills the blank rows too — 1 000 rows of `#N/A` under a lookup. Wrap it: `=ARRAYFORMULA(IF(D6:D="", "", XLOOKUP(D6:D, …)))`.

**Your turn.** Excel's `=FILTER(tblLoans, (tblLoans[branch]=B1)*(tblLoans[dpd]>0))` in Sheets is…

### Putting it together

Sevara's question in one block: *"the late loans of the branch I pick, worst first, each with its product's rate"*.

| Cell | Holds |
|---|---|
| B1 | dropdown — Data Validation, List, source `=Helper!$A$2#` (Helper!A2: `=SORT(UNIQUE(tblLoans[branch]))`) |
| A6 | `=SORT(FILTER(tblLoans, (tblLoans[branch]=$B$1)*(tblLoans[dpd]>0), "no late loans"), 12, -1)` |
| N6 | `=XLOOKUP(INDEX(A6#, , 4), Lookup!$A$3:$A$7, Lookup!$C$3:$C$7)` |

1. **UNIQUE** + **SORT** make the branch list; **data validation** turns `B1` into a dropdown.
2. **FILTER** keeps the rows of that branch with dpd > 0 — two conditions multiplied for AND.
3. **SORT** on column 12 (`dpd`), `-1`, puts the worst loan first. The result is a **spill**: `A6#`.
4. **XLOOKUP** brings each row's rate: `INDEX(A6#, , 4)` is the spill's 4th column, `product`.
5. A **conditional-formatting** formula rule `=$M6="90+"` on A6:N2000 colours the rows.

Pick Tashkent South: 59 rows, and the first is loan 7339 at 902 days. The Worked example builds this sheet step by step.

**Put the formula together.**

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ VLOOKUP and its traps (exact match FALSE, locking the table, no look-left, IFNA/IFERROR) — [The Only VLOOKUP Guide You'll Ever Need (Leila Gharani), 03:46](https://youtu.be/TDphx23AtqM?t=226&end=285)
- ▶ INDEX / MATCH — [How to use Excel Index Match (the right way) (Leila Gharani), 06:37](https://youtu.be/F264FpBDX28?t=397&end=488)
- ▶ INDEX / MATCH (alternative, longer, with a drop-down example) — [INDEX MATCH Excel Tutorial (Kevin Stratvert), 05:36](https://youtu.be/6JhbY8Mku1A?t=336&end=530)
- ▶ XLOOKUP — [How to Use XLOOKUP in Excel (5 Practical Examples) (Leila Gharani), 01:12](https://youtu.be/4c0CLUER6nw?t=72&end=178)
- ▶ XLOOKUP (second option) — [XLOOKUP in Excel Tutorial (Kevin Stratvert), 01:13](https://youtu.be/HXU7lsd0ftA?t=73&end=260)
- ▶ UNIQUE — [Excel Dynamic Arrays (How they will change EVERYTHING!) (Leila Gharani), 02:33](https://youtu.be/2USJsIyIzvo?t=153&end=185)
- ▶ FILTER — [Excel Dynamic Arrays (How they will change EVERYTHING!) (Leila Gharani), 04:06](https://youtu.be/2USJsIyIzvo?t=246&end=301)
- ▶ Conditional formatting (formula rule) — [Excel Conditional Formatting with Formula | Highlight Rows based on a cell value (Leila Gharani), 01:03](https://youtu.be/XHT4paRaY4g?t=63&end=108)
- ▶ Conditional formatting (basics) — [Learn Excel in Under 3 Hours | Pivot Tables, Lookups, Data Cleaning (Alex The Analyst), 00:37](https://youtu.be/zXnQNytHCPM?t=37&end=1200)

- RU workbook `3.2 Lookups.xlsx` — sheets *VLOOKUP – Exact Match*, *VLOOKUP – Approx Match* (the grade table, the "lookup table should be sorted" note), *MATCH* (the three match types), *INDEX*, *Xlookup*; and *Cell Referrence* for the `$` multiplication table.
- *Russian terms:* ВПР = VLOOKUP, ПОИСКПОЗ = MATCH, ИНДЕКС = INDEX, ПРОСМОТРX = XLOOKUP, точное / приближённое совпадение = exact / approximate match, проверка данных = data validation, условное форматирование = conditional formatting, выпадающий список = dropdown.

---

## 2. Worked example — Sevara's sheet (15 min)

**Ask:** pick a branch, see its late loans worst first, with the count, the money and each loan's rate, coloured by bucket. Sheet `Collections`. Grain of the main block: one row per **delinquent loan of the chosen branch**.

1. **UNIQUE + SORT on a helper sheet.** `Helper!A2` = `=SORT(UNIQUE(tblLoans[branch]))` spills the ten branch names, A to Z.
2. **Data validation — the dropdown.** Select `Collections!B1`, Data → Data Validation → List, source `=Helper!$A$2#`. Every formula below reads `$B$1`.
3. **A spill of the header.** `A5` = `=tblLoans[#Headers]` spills the 13 column names.
4. **FILTER + SORT — the list.**

```excel
A6:  =SORT(FILTER(tblLoans, (tblLoans[branch]=$B$1)*(tblLoans[dpd]>0), "no late loans"), 12, -1)
```

   Two conditions multiplied (AND); column 12 = `dpd`; `-1` = worst first.
5. **Formulas on the spill (`A6#`).**

| Label | Formula | Note |
|---|---|---|
| A2 "Late loans" | B2 `=IF(A6="no late loans", 0, COUNTA(INDEX(A6#, , 1)))` | count of filtered rows |
| C2 "Outstanding" | D2 `=SUM(INDEX(A6#, , 11))` | 11th column = outstanding |

   Pick **Tashkent South**: B2 → **59** late loans, D2 → **1 566 587 839** — the outstanding *of the late loans only*. The branch's whole book (`=SUMIFS(tblLoans[outstanding], tblLoans[branch], $B$1)`) is **26 787 392 136**. Put both on the sheet with their labels: Sevara's "the money" means the late money, Bekzod's means the book. The first row is the branch's worst loan — loan 7339 at 902 DPD, written off; 39 of the 59 are 90+, so the live caseload is 20 loans. The `IF` guard matters: with no match, A6 shows `no late loans` and a bare `COUNTA` would say 1.
6. **XLOOKUP — the rate.** `N6` = `=XLOOKUP(INDEX(A6#, , 4), Lookup!$A$3:$A$7, Lookup!$C$3:$C$7)` (column 4 = product) spills one rate per row. No `IFERROR`: every product exists on `Lookup`, and if one day it does not, `#N/A` is the right signal.
7. **Conditional formatting — the colour.** Select the area generously (`A6:N2000`), New Rule → formula `=$M6="90+"` red fill; `=$M6="61-90"` orange; `=$M6="31-60"` yellow; `=$M6="1-30"` pale yellow. Pin the column, free the row.
8. **Check by changing the input.** Pick **Namangan Central**: 35 late loans, 1 060 265 022. The list shrinks, the colours follow the rows, the count changes — nothing to redo.

**Excel ↔ Sheets.** The same sheet in Google Sheets — `FILTER` takes the conditions as separate arguments, `SORT`'s third argument is TRUE/FALSE, and `ARRAYFORMULA` fills the rate column:

| Cell | Holds | Note |
|---|---|---|
| B1 | dropdown — Data validation → Dropdown (from a range) → Helper!A2:A11, where Helper!A2 = `SORT(UNIQUE(Loans!E2:E))` |   |
| B2 | `=COUNTA(A6:A)` | rows in the spill (blank tail ignored by COUNTA) |
| D2 | `=SUM(K6:K)` | outstanding column of the spill |
| A5 | `=Loans!A1:M1` | header row |
| A6 | `=SORT(FILTER(Loans!A2:M, Loans!E2:E=B1, Loans!L2:L>0), 12, FALSE)` |   |
| N6 | `=ARRAYFORMULA(IF(D6:D="", "", XLOOKUP(D6:D, Lookup!A3:A7, Lookup!C3:C7)))` | rate per filtered row |
| A6:N | Format → Conditional formatting → Custom formula is `=$M6="90+"` |   |

`IF(D6:D="", "", …)` keeps the rate column blank below the spill — without it `ARRAYFORMULA` fills 1 000 rows of `#N/A`.

---

## 3. Practice (50 min)

Copy `nur_week4_start.xlsx` to `week-04/day-2/practice.xlsx`. Add columns to `tblLoans` where the task says; otherwise work on a sheet `Practice`, one block per task with the formula as text beside the value. Each question says what goes **in the box**; the box checks it and then shows the formula. The questions follow the order of Learn.

**P1.** *(the lookup problem)* You add a `rate` column to `tblLoans` by looking up `product` on `Lookup!A3:A7`. How many rows does `tblLoans` have afterwards, and why? *In the box: pick the answer.*

**P2.** *(VLOOKUP)* Add `rate` to `tblLoans` with `VLOOKUP` (exact), then the portfolio's **monthly interest run-rate**: Σ outstanding × rate ÷ 12, one `SUMPRODUCT`. *In the box: the monthly run-rate, in soum.*

**P3.** *(VLOOKUP's traps)* Show trap 1: the same `VLOOKUP` without `FALSE` for a Micro loan and for a Small business loan. What comes back, and why is one of them *correct by accident*? *In the box: pick the explanation.*

**P4.** *(INDEX/MATCH — two-way)* A region × product outstanding matrix (`SUMIFS`, yesterday), then a two-way `INDEX/MATCH/MATCH` that returns one cell for a region and a product typed in two input cells. Fergana × Small business loan? *In the box: Fergana × Small business loan, in soum.*

**P5.** *(XLOOKUP — exact, not found)* A lookup cell: type a `loan_id` in B1 and show customer, branch, status, dpd, outstanding with `XLOOKUP` (or `INDEX/MATCH`), `not found` for a missing id. Test with 2167, 1 and 99999. *In the box: the customer of loan 2167, as the sheet shows it.*

**P6.** *(XLOOKUP — approximate match for bands)* Add `lk_bucket` to `tblLoans` by **approximate** lookup against `Lookup!A11:B15` (`XLOOKUP … -1`, or `VLOOKUP … TRUE`, or `INDEX/MATCH(…,1)`); count mismatches against `bucket`, then the five bucket counts. *In the box: the mismatch count.*

**P7.** *(XLOOKUP — search from the end)* On `tblPayments`, the amount of the **last** payment row of loan 4567 with `search_mode -1`, and its date. Then check the date with `MAXIFS`. *In the box: the amount of that last payment, in soum.*

**P8.** *(two-key lookups)* One `XLOOKUP` on `tblInstallments` with a glued key `loan_id&"|"&installment_no`: the `principal_due` of loan 1's 12th instalment. *In the box: that principal_due, in soum.*

**P9.** *(IFERROR)* Which of these four uses of `IFERROR` is the right one? *In the box: pick it.*

**P10.** *(a spill · UNIQUE)* `UNIQUE` counts: branches, regions, statuses, products — and `customer`. Which of the five is not a count of anything real, and what would you need to count borrowers? *In the box: pick the one that counts nothing real.*

**P11.** *(FILTER · SORTBY)* `FILTER` the active loans in bucket 61-90, sorted by outstanding descending (`SORTBY`): how many, how much, and which one should Sevara visit first? *In the box: the loan_id Sevara visits first.*

**P12.** *(UNIQUE · SORTBY on spills · which tool when)* Top-5 branches by outstanding with `UNIQUE` + `SUMIFS` on the spill + `SORTBY`, and their combined share of the book. *In the box: the top-5 share, % with 1 decimal.*

**P13.** *(SEQUENCE)* `SEQUENCE`: the ten first-of-month dates of 2026 in one formula, then `COUNTIFS`/`SUMIFS` per month with the half-open filter using `EDATE`. *In the box: the loan count in the August 2026 row.*

**P14.** *(data validation)* Build the branch dropdown in `B1` (source: a spilled `SORT(UNIQUE(…))` on a helper sheet) and a cell `=COUNTIFS(tblLoans[branch], $B$1, tblLoans[dpd], ">0")` under it. Pick Bukhara Central. *In the box: the number of late loans it shows.*

**P15.** *(conditional formatting)* Conditional formatting on `Loans`: a formula rule red for 90+, orange 61-90, yellow 31-60; a colour scale on `outstanding`; data bars on `dpd`. Then one cell that says how many rows are red. *In the box: how many rows are red.*

**P16.** *(reading the errors)* Sevara types `2167` into B1, but the cell was formatted as Text first, and the loan finder shows `#N/A`. What happened? *In the box: pick the cause.*

**P17.** *(Excel ↔ Sheets)* Your Excel formula `=SORT(FILTER(tblLoans, (tblLoans[branch]=$B$1)*(tblLoans[dpd]>0)), 12, -1)` must run in Google Sheets on a `Loans` tab. Which is the Sheets version? *In the box: pick it.*

> 🚀 **Stretch (optional, +5 XP).** **P18.** *(data validation · UNIQUE · COUNTIFS on a spill)* A dropdown for `grade` (A–D) and a spilled table under it: product → loans, loans in 90+, share in 90+ (`0.0%`), all driven by the chosen grade. What is the 90+ share by grade over all products? *In the box: the 90+ share of grade D, % with 1 decimal.*

### Mistakes that cost a point this week

- `VLOOKUP` without `FALSE` — a wrong rate with no error (P3).
- A lookup on `customer` (a name) to fetch anything — 747 names for 4 335 people; keys are ids.
- Bucket table keyed on the upper edge (30, 60, 90) with match mode −1 — every dpd of 31 lands in `1-30`. Lower edges with −1, or upper edges with 1.
- `IFERROR(…, 0)` around a lookup and a `SUM` under it — the misses become zeros and the total looks complete.
- A data-validation list pointing at a Table column by name — Excel refuses; point it at a spilled `UNIQUE` range or a plain list.
- Conditional-formatting formula with `$M$2` (both pinned) — every row is coloured by row 2's bucket.
- `FILTER` on a Table but `SORT` by the wrong column number — count the columns from the Table's first column, not from A.
- A spill inside a Table — Tables cannot hold spilled arrays; put `FILTER`/`UNIQUE` on a plain sheet.

---

## 4. Homework

No new homework. **HW 4.1** (yesterday's functions pack) is due tomorrow — add to it, if you like, the `lk_bucket` column from P6 as proof that the bucket table on `Lookup` reproduces the shipped buckets.

---

## 5. Self-check

---

## 6. Company corner <span class="badge company">DPD buckets in Excel</span>

Week 2 computed DPD and buckets in SQL; week 3 put them in a view; today the bucket **table** moves to `Lookup!A10:C15` and the bucket **rule** becomes one approximate lookup — the same separation of definition and data, in Excel.

| Sheet | Column / cell | Holds |
|---|---|---|
| Loans, new column | lk_bucket | `=XLOOKUP([@dpd], Lookup!$A$11:$A$15, Lookup!$B$11:$B$15, , -1)` |
| Summary sheet | A3:A7 | 0 · 1-30 · 31-60 · 61-90 · 90+ (text — '0) |
|   | B3 | `=COUNTIFS(tblLoans[lk_bucket], A3)` |
|   | C3 | `=SUMIFS(tblLoans[outstanding], tblLoans[lk_bucket], A3)` |
|   | D3 | `=C3/SUM($C$3:$C$7)` → 0.00% |
|   | B8, C8 | `=SUM(B3:B7)`, `=SUM(C3:C7)` → 7 828 · 208 723 504 430 |

| bucket | loans | outstanding | share of outstanding |
|---|---|---|---|
| 0 | **7 429** | 197 486 207 578 | 94.62 % |
| 1-30 | **124** | 4 729 769 899 | 2.27 % |
| 31-60 | **25** | 748 610 049 | 0.36 % |
| 61-90 | **16** | 439 441 377 | 0.21 % |
| 90+ | **234** | 5 319 475 527 | **2.55 %** |

Then two tiles under it: **PAR30** `=SUMIFS(tblLoans[outstanding], tblLoans[dpd], ">30")/C8` → **3.12 %** and **NPL90** `=C7/C8` → **2.55 %** — the same 6 507 526 953 and 5 319 475 527 as week 3's view. Conditional formatting on `Loans`: `=$O2="90+"` (the new `lk_bucket` column — O if P2's `rate` sits in N; use the letter your column has) red — **234** rows light up, and they are exactly the 44 `default` + 190 `written_off` loans (`=COUNTIFS(tblLoans[lk_bucket], "90+", tblLoans[status], "active")` → 0, the status check from week 2, in one cell).

Why the table and not the `IFS`: when Risk moves to 1–7 / 8–30 buckets (the glossary's **[varies]**), you add a row to `Lookup` and every formula, colour and count follows. The `IFS` version is the pasted-DPD-logic problem Timur had last Thursday, one sheet at a time. And why approximate match and not exact: dpd takes 258 different values, from 0 to 919; a band is a *range*, and `match_mode −1` against the lower edges is the Excel spelling of `CASE WHEN dpd <= 30`.

One more check Sevara will ask for: bucket **0** carries 53 m of "overdue" in SQL (the 14 instalments due on the as-of morning) but shows dpd 0 here, as it should — DPD counts *days*, and a payment due today is 0 days late. Put the as-of date (`Lookup!B17`) on the summary sheet; every bucket number is wrong without it.

> 🎯 **Interview version.** *"How would you bucket DPD in Excel?"* — A sorted band table (lower edge, label) on a lookup sheet; `XLOOKUP` with match mode −1 (or `VLOOKUP … TRUE`, `MATCH … 1`) per loan; `COUNTIFS`/`SUMIFS` per bucket with a total that ties to the loan count and the book; conditional formatting from the same column; the as-of date on the sheet. Change a boundary in one cell, never in a formula.

**Say it like in an interview.** Sevara: *"Why build a table on another sheet? Just write the buckets into one IFS formula and be done."* Convince her in 30 words or more.

Tomorrow: the detective day — `customers_dirty` and `payments_dirty`, from Find & Replace and Remove Duplicates to a Power Query pipeline that cleans them every time you press Refresh.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 4 · Day 3 — Cleaning dirty data: Find & Replace to Power Query (weeks/week-04/day-3.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-04/day-3
=====

# Week 4 · Day 3 — Cleaning dirty data: Find & Replace to Power Query

<span class="badge">Learn 60 min</span> <span class="badge">Detective 40 min</span> <span class="badge">Practice 45 min</span> <span class="badge">Homework</span> <span class="badge company">Company corner</span>

> STORY **Wednesday, 9:05.** Nilufar, risk (*риск-аналитик*), with two printouts. *"My age-band table for the scorecard has a customer aged **−5** and one aged **126**. HR says we have 6 000 customers, my sheet says 6 040 — the same forty we argued about in week 1, and they are still there. And Timur's payments tile is tens of millions above Finance's. I get `customers_dirty.csv` and `payments_dirty.csv` from the export every Monday; I need them **clean every Monday**, not once by hand."* Timur, passing: *"If you build it in Power Query I can refresh it. If you build it with the mouse I cannot."*

## Today in 3 lines

- **By hand first**, so you know what the tools do: `TRIM`/`CLEAN`/`PROPER`, Find & Replace, Text to Columns, `DATEVALUE` for dates stored as text, `COUNTIFS` to *find* duplicates, and why **Remove Duplicates** is dangerous (exact match only — and it still lies both ways).
- **Then Power Query** (*Get & Transform*): import the CSV, promote headers, set types, trim / clean / lowercase, replace values, remove duplicates, group by, **merge** (= a join), append, load — and **Refresh** does it all again next Monday.
- You have found the four kinds of problem hiding in the export — duplicate people, impossible birth dates, duplicate payments, inconsistent `method` spellings — and you can say exactly how many of each there are (type each count in its box first — the box checks it; the fold under it tells the whole story).

**Today's files:** `data/excel/customers_dirty.csv` and `data/excel/payments_dirty.csv` (the raw Monday export), plus `data/excel/installments.csv` and `data/excel/applications.csv` for Practice — press **⬇ Download** next to each and keep them in one folder, untouched; Power Query will read them from there. Power Query needs Excel for Windows or Microsoft 365 (on a Mac or in Sheets use the formula route in section 1). **Done today** = the four detective boxes in section 2 are ✓, `payments_clean` has 52 850 rows after Refresh All, every Practice box is ✓, the Quick check and the day quiz are done. HW 4.2 (`cleaning.xlsx` + `change_log.md`) is due Day 5.

---

## 1. Learn — cleaning is a pipeline, even when it is a formula

Week 1's rule holds in Excel: **raw stays raw**. Never clean the only copy. Cleaning is a **recipe you can re-run** on next Monday's file — formulas on a clean tab, or a Power Query — not edits made with the mouse on the raw sheet. Today's order: hand tools to *discover* the dirt, Power Query to *deliver* the clean table.

**The dirty rows used on this page.** Real rows from the two Monday files. Every subsection below fixes something you can see here.

`customers_dirty.csv` (6 040 rows):

| customer_id | first_name | last_name | birth_date | phone | registered_at |
|---|---|---|---|---|---|
| 4516 | Malika | Jalilova | 1981-08-15 | +998908981002 | 2022-09-27 |
| 6001 | MALIKA | jalilova | 1981-08-15 | +998908981002 | 2023-03-30 |
| 44 | Yulduz | Karimova | 1988-07-12 | +998902229531 | 2026-03-29 |
| 6005 | `Yulduz␣` | karimova | 1988-07-12 | +998902229531 | 2027-01-09 |
| 927 | Nodir | Yusupov | 2031-04-12 | +998905551914 | 2026-01-30 |
| 957 | Shahnoza | Ergasheva | 1900-01-01 | +998904393324 | 2022-04-18 |

`payments_dirty.csv` (52 875 rows):

| payment_id | installment_id | paid_at | amount | method |
|---|---|---|---|---|
| 265 | 404 | 2024-04-03 | 7 292 600 | PayMe |
| 2184 | 3667 | 2025-05-15 | 19 668 600 | `CASH␣` |
| 3184 | 5272 | 2024-05-04 | 863 300 | bank transfer |
| 7172 | 12040 | 2024-12-26 | 253 400 | card |
| 52859 | 12040 | 2024-12-26 | 253 400 | card |

`␣` marks a space you cannot see in Excel.

### What dirty data looks like — a checklist

**What it is.** **Dirty data** (*грязные данные*) is data whose values mean the same thing but are written differently, or are impossible. Eight kinds cover almost every export:

| Kind | Example above | How many in the Monday files |
|---|---|---|
| **Stray spaces** | `Yulduz␣`, `CASH␣` | 18 first names; 30 `CASH ` payments |
| **Case** | `MALIKA`, `jalilova`, `PayMe` | 22 all-caps first names, 40 all-lower surnames; 123 payments in `Card` / `Click` / `PayMe` |
| **Synonyms** | `bank transfer` = `transfer` | 27 payments |
| **Duplicates** | 4516 = 6001; payment 7172 = 52859 | 40 people; 25 payments |
| **Impossible values** | born 2031-04-12, born 1900-01-01, registered 2027-01-09 | 7 birth dates; 5 registration dates after the as-of date |
| **Numbers stored as text** | a phone `+998…` read as a number loses its `+` | every phone, if the type is wrong |
| **Dates stored as text** | `2024-04-03` that does not sort or compare as a date | every date column of a CSV, until it is typed |
| **Blanks** | `monthly_income` empty | 356 customers; 388 applications without `credit_score` |

**How to write it.** One formula per kind, on the raw sheet, before you change anything:

| Formula | Finds |
|---|---|
| `=SUMPRODUCT(--(LEN(B2:B6041)<>LEN(TRIM(B2:B6041))))` | stray spaces → 18 |
| `=SUMPRODUCT(--EXACT(C2:C6041, LOWER(C2:C6041)))` | written all lower case → 40 |
| `=ROWS(UNIQUE(F2:F52876))` | distinct raw methods (Payments) |
| `=COUNTBLANK(I2:I6041)` | blanks in monthly_income → 356 |
| `=SUMPRODUCT(--ISTEXT(E2:E6041))` | dates stored as text → must be 0 |

**When you use it.**
- First thing with any new file: count each kind, write the counts down. They become your change log.
- After cleaning: the same formulas on the clean table must say 0.

> ⚠️ **Watch out.** A **number stored as text** sits left-aligned, often with a small green triangle in the corner, and `SUM` skips it — the total is low and nothing turns red. Changing the cell format to *Number* does **not** convert text that is already in the cell. What does: `=VALUE(A2)` or `=--A2` in a helper column, Data → Text to Columns → Finish on the column, or Paste Special → Multiply by 1. The opposite trap waits when you **type or paste** into a sheet: Excel converts anything that looks like a date or a number — `1-2` becomes 2 January, the code `00123` becomes 123, and a 16-digit card number becomes `1.23457E+15` with its last digit turned into 0 (Excel keeps only 15 digits). Format the cells as **Text before** you type codes, or import with Power Query and set the types yourself.

**Your turn.** The column `amount` holds numbers stored as text. Which of these turn them into real numbers?

**Your turn.** Sort the dirty values into their kind.

> 🎬 **Didn't get what dirty data looks like?** [A short explanation · 4 min](https://youtu.be/zXnQNytHCPM?t=5984&end=6236)

### Find & Replace — Ctrl+H

**What it is.** **Find & Replace** (*найти и заменить*) changes every occurrence of one text into another, in the selection, the sheet or the workbook. It is a one-time edit: nothing is recorded, and the next file does not get it.

**How to write it.**

```text
Ctrl+H
  Find what:     bank transfer
  Replace with:  transfer
  Options ▸
    Match case
      off: card also finds Card and CARD
    Match entire cell contents
      on:  card does not find discard
    Within: Sheet / Workbook
  Replace All
    →  "We made 27 replacements"
    ← write this number down
```

The picture — `method` before and after:

| before | after (Match entire cell contents on) |
|---|---|
| bank transfer | transfer |
| transfer | transfer |
| card | card |

On a copy of `Payments` the run reports **27** replacements: the 27 `bank transfer` rows. Wildcards work in *Find what*: `*` any text, `?` one character, `~*` a real asterisk.

**When you use it.**
- A quick look on a **copy**: how many rows carry this spelling?
- A one-off file you will never receive again.

> ⚠️ **Watch out.** Replacing `" "` (a space) with nothing is not `TRIM`: it also removes the space *between* words. `Malika Jalilova` becomes `MalikaJalilova`.

**Your turn.** On a copy of `Customers`, a `full_name` column holds `Malika Jalilova`. You run Ctrl+H with *Find what* = one space and *Replace with* empty, Replace All. What does the cell hold now?

### Text to Columns — split one column into several

**What it is.** **Text to Columns** (*текст по столбцам*) splits each cell of one column into several columns, at a **delimiter** (a space, a comma, `|`) or at fixed widths. Data → Text to Columns. It is a one-time edit on the sheet.

**How to write it.**

```text
select applied_at
  → Data → Text to Columns
  Step 1  Delimited
          (or Fixed width)
  Step 2  Delimiter: Space
  Step 3  column 1 → Date: YMD
          column 2 → General
          Destination: an EMPTY column
          (the split overwrites the
          columns to the right)
```

| applied_at (before) | → date | → time |
|---|---|---|
| 2025-06-02 10:35:00 | 2025-06-02 | 10:35:00 |
| 2026-09-30 21:36:00 | 2026-09-30 | 21:36:00 |

On `applications.csv` the 14 000 `applied_at` values become a date column and a time column. With the date on its own, `<= DATE(2026,9,30)` no longer loses the 23 applications made later on 30 September (Day 1's time-of-day trap).

**When you use it.**
- A date and a time glued together; a `"region|product"` key; a full name to split into first and last.
- Sheets: Data → Split text to columns, or the formula `=SPLIT(G2, " ")`, which re-runs.

> ⚠️ **Watch out.** The split writes into the columns to the right. Excel asks *"replace the contents of the destination cells?"* once, and one click on OK overwrites them. Insert empty columns first, or set *Destination* to an empty area.

**Your turn.** In `applications.csv`, `applied_at` is column G and `decided_at` is column H. You split G by space with the default destination. What happens to `decided_at`?

### Flash Fill — Excel guesses the pattern

**What it is.** **Flash Fill** (*мгновенное заполнение*, Ctrl+E) fills a column from one or two examples you type. Excel infers the pattern and writes **values**, not formulas.

**How to write it.**

| B: first_name | H (new column) |   |
|---|---|---|
| MALIKA | Malika | ← you type this one example |
| Yulduz␣ | Yulduz | ← Ctrl+E fills the rest |
| Nodir | Nodir |   |

On `Customers`, typing `Malika` next to row 6001 and pressing Ctrl+E fills all 6 040 rows with a capitalised first name. No formula is left behind.

**When you use it.**
- A one-off look: initials, a code cut out of a longer text, a name rearranged.
- Never for a file that comes back every Monday: the next file gets nothing.

| | Flash Fill | A formula (`=PROPER(TRIM(B2))`) |
|---|---|---|
| leaves behind | values | a rule |
| next Monday's rows | empty | filled when you fill down / in a Table automatically |
| can you check it? | only by comparing | yes, read the formula |

> ⚠️ **Watch out.** Flash Fill can guess a *different* rule from the one you meant and still look right on the first screen. Compare its column with a formula version and count the mismatches before you trust it.

**Your turn.** You Flash-Fill a clean `first_name` column on this Monday's file. Next Monday 40 new customers are appended under the Table. What does their Flash Fill cell hold?

### TRIM, CLEAN, SUBSTITUTE — repairing text with formulas

**What it is.** Text repair as a formula on a clean tab, so it re-runs. **TRIM** (*СЖПРОБЕЛЫ*) removes spaces at the ends and doubled spaces inside. **CLEAN** (*ПЕЧСИМВ*) removes non-printing characters — line breaks and tabs from a copy-paste. **SUBSTITUTE** (*ПОДСТАВИТЬ*) replaces one text with another inside a cell. **LOWER**, **UPPER** and **PROPER** fix case (Day 1).

**How to write it.**

| Formula | Does |
|---|---|
| `=TRIM(B2)` | `"Yulduz "` → `"Yulduz"` |
| `=CLEAN(B2)` | removes line breaks and tabs |
| `=SUBSTITUTE(text, old, new)` | every "old" inside text becomes "new" |
| `=LOWER(TRIM(F2))` | `"CASH "` → `"cash"`; `"PayMe"` → `"payme"` |
| `=SUBSTITUTE(LOWER(TRIM(F2)), "bank transfer", "transfer")` | one synonym |
| `=SUBSTITUTE(SUBSTITUTE(LOWER(TRIM(F2)), "bank transfer", "transfer"), "pay me", "payme")` | nested: the inner result goes into the outer one |
| `=TRIM(CLEAN(SUBSTITUTE(B2, CHAR(160), " ")))` | non-breaking spaces (CHAR 160) survive TRIM |

The picture — `method`, step by step:

| raw | `LOWER(TRIM())` | `SUBSTITUTE(…, "bank transfer", "transfer")` |
|---|---|---|
| `CASH␣` | cash | cash |
| PayMe | payme | payme |
| bank transfer | bank transfer | transfer |
| card | card | card |

On `Payments`: 10 distinct raw methods. After the full formula, `=ROWS(UNIQUE(…))` → **5**: card, cash, transfer, payme, click.

**When you use it.**
- Any text you will compare, count or match on: methods, names, regions.
- Nested `SUBSTITUTE` for a short list of synonyms; for a long list, a mapping table and a lookup (Day 2).
- Text pasted from a web page or a PDF: it often carries **non-breaking spaces** (`CHAR(160)`), which `TRIM` leaves alone — `LEN` then counts one character more than you can see. Replace them first, as in the last row of the table above.

> ⚠️ **Watch out.** `PROPER` capitalises after every non-letter: `"payme"` → `"Payme"`, `"o'neil"` → `"O'Neil"`. Use it for people's names, not for codes.

**Your turn.** On `tblPayments`, how many distinct values does `=LOWER(TRIM([@method]))` leave, before any `SUBSTITUTE`?

### Dates stored as text — ISNUMBER, DATEVALUE, locale

**What it is.** A real date is a number (Day 1). A **date stored as text** (*дата в текстовом формате*) only looks like one: it sits left-aligned, sorts as text and is skipped by every date criterion. **DATEVALUE** (*ДАТАЗНАЧ*) turns date-text into a real date. **ISNUMBER** / **ISTEXT** tell you which one a cell holds.

**How to write it.**

| Formula | Note |
|---|---|
| `=ISNUMBER(E2)` | TRUE = a real date, FALSE = text |
| `=DATEVALUE(E2)` | "1981-08-15" → 29813 (format the cell as a date → 1981-08-15) |
| `=VALUE(E2)` | the same |
| `=SUMPRODUCT(--ISTEXT(E2:E6041))` | text dates in the whole column — must be 0 |

How Excel reads typed text depends on the **locale** (the Windows regional setting):

| typed | US locale (month first) | Russian locale (day first) |
|---|---|---|
| `2026-03-14` | 14 March 2026 | 14 March 2026 |
| `03/04/2026` | 4 March 2026 | 3 April 2026 |
| `14/03/2026` | **text** — there is no month 14 | 14 March 2026 |
| `14.03.2026` | **text** | 14 March 2026 |

Only ISO `yyyy-mm-dd` reads the same everywhere. Our CSVs use it. Other day-first locales — UK, Uzbek — also read `03/04/2026` as 3 April, but may keep `14.03.2026` as text: what converts depends on your own Windows settings, so try it on your machine (P6 asks you to). Google Sheets follows File → Settings → Locale instead.

**Impossible dates** are real dates that cannot be true. In `customers_dirty.csv`, **7** birth dates are impossible: four in the future (`2031-04-12`, `2027-02-28`) and three at `1900-01-01`, a "no date" placeholder. **5** customers were registered after the as-of date 2026-10-01.

**When you use it.**
- Every date column of an imported file: `ISNUMBER` on the whole column before any date formula.
- Impossible dates: blank them and add a flag column. Never invent a plausible date.

> ⚠️ **Watch out.** The worst case is a column that is **half** converted: in a US locale `03/04/2026` becomes a date and `14/03/2026` stays text. Totals are low by exactly the text rows, and the sheet looks fine.

**Your turn.** A colleague in a US-locale Excel types four dates. Which one stays **text**?

### A matching key — one text that means "the same person"

**What it is.** A **matching key** (*ключ сопоставления*) is one text built from the columns that identify a row, cleaned so that equal things give equal keys: trimmed, one case, joined with a **separator**.

**How to write it.**

```excel
=LOWER(TRIM(B2)) & "|" & LOWER(TRIM(C2)) & "|" & TEXT(E2, "yyyy-mm-dd")
```

| Part | Means |
|---|---|
| `LOWER(TRIM(B2))` | first_name |
| `"\|"` | sep |
| `LOWER(TRIM(C2))` | last_name |
| `"\|"` | sep |
| `TEXT(E2, "yyyy-mm-dd")` | birth_date as text |

| customer_id | key |
|---|---|
| 4516 | `malika|jalilova|1981-08-15` |
| 6001 | `malika|jalilova|1981-08-15` |
| 44 | `yulduz|karimova|1988-07-12` |
| 6005 | `yulduz|karimova|1988-07-12` |

4516 and 6001 now have the same key; so do 44 and 6005. A second key on `phone|birth_date` uses the identifying fields: `=D2&"|"&TEXT(E2,"yyyy-mm-dd")`.

**When you use it.**
- Before counting or removing duplicates: the key *is* your definition of "the same".
- Payments: `installment_id|paid_at|amount` — the same instalment, paid the same day, the same amount.

> ⚠️ **Watch out.** Without a separator, different parts can glue into the same key: `"Ali"&"Nazarov"` = `"Alin"&"azarov"` = `AliNazarov`. Always put `"|"` between the parts.

**Your turn.** Fill the key for a person.

### COUNTIFS on the key — find duplicates before you remove them

**What it is.** Two `COUNTIFS` columns on the key show every duplicate **before** anything is deleted. **n** = how many rows share this key. **rank** = which copy this row is: 1 for the first, 2 for the repeat — Excel's `ROW_NUMBER() OVER (PARTITION BY key)`.

**How to write it.**

| Cell | Column | Formula | Note |
|---|---|---|---|
| L2 | key | `=LOWER(TRIM(B2))&"\|"&LOWER(TRIM(C2))&"\|"&TEXT(E2,"yyyy-mm-dd")` |   |
| M2 | n | `=COUNTIFS($L$2:$L$6041, L2)` | the whole column: how many share the key |
| N2 | rank | `=COUNTIFS($L$2:L2, L2)` | a growing range: pinned start, free end |

| customer_id | key | n | rank |
|---|---|---|---|
| 4516 | malika\|jalilova\|1981-08-15 | 2 | 1 |
| 6001 | malika\|jalilova\|1981-08-15 | 2 | 2 |
| 44 | yulduz\|karimova\|1988-07-12 | 2 | 1 |
| 6005 | yulduz\|karimova\|1988-07-12 | 2 | 2 |

Filter `n > 1` to see the groups, `rank = 2` to see the extra rows. On `Payments`, the key `installment_id|paid_at|amount` gives **50** rows with `n > 1` — 25 pairs, so 25 extra payments.

**When you use it.**
- Every time before Remove Duplicates: the count of `rank = 2` rows is the number the tool *should* report.
- To compare keys: build two or three and read the rows where they disagree.

> ⚠️ **Watch out.** The growing range `$L$2:L2` is slow on 50 000 rows — Power Query does the same in a second (below).

**Your turn.**

### Remove Duplicates — and why it lies

**What it is.** **Remove Duplicates** (*удалить дубликаты*, Data → Remove Duplicates) deletes rows that are equal on the columns you tick. It keeps the **first** row of each group and reports only *how many* it removed. It compares **case-insensitively** but **space-sensitively**.

**How to write it.**

```text
select the table
  → Data → Remove Duplicates
  ☑ installment_id
  ☑ paid_at
  ☑ amount
    ← the columns that define "the same"
  ☐ payment_id ☐ method …
    ← leave out what always differs
  OK → "25 duplicate values found
        and removed; 52 850 unique
        values remain"
```

| payment_id | installment_id | paid_at | amount | kept? |
|---|---|---|---|---|
| 7172 | 12040 | 2024-12-26 | 253 400 | kept — first |
| 52859 | 12040 | 2024-12-26 | 253 400 | removed |

Why it lies, on `Customers`:

| Columns ticked | What happens |
|---|---|
| first_name, last_name, birth_date (raw) | case is ignored, spaces are not: `Yulduz␣` survives — too few removed |
| the same, after `TRIM` | every true duplicate goes — **and** two pairs of different people with the same name and birth date |
| phone, birth_date | exactly the 40 true duplicates |
| all columns | 0 removed — `customer_id` always differs |

**When you use it.**
- On a **copy**, to check a number you already counted with `COUNTIFS`.
- The delivered deletion is a recorded Power Query step (below).

> ⚠️ **Watch out.** It never says *which* rows went, and Ctrl+Z is the only way back. Count the `rank = 2` rows first; if the tool's number differs, do not save.

**Your turn.** Payments 7172 and 52859 are equal on `installment_id`, `paid_at` and `amount`. Payment 7172 is higher up the sheet. You run Remove Duplicates on those three columns. Which row stays?

### Power Query — load, steps, load back

**What it is.** **Power Query** (*Получить и преобразовать*, Get & Transform) imports a file and cleans it with **recorded steps**. Every click becomes a step in the **Applied Steps** pane. **Refresh** re-reads the file and replays every step. It is the Excel version of a SQL view.

**How to write it.**

```text
Data → Get Data → From File
  → From Text/CSV
  → payments_dirty.csv
  → Transform Data
     │
     ▼
Power Query editor
  preview of the rows
  Applied Steps (right pane)
    Source
    Promoted Headers
    Changed Type
    … one step per click …
  Home → Close & Load
    → a Table on a new sheet
```

Each step is one line of **M**, the query language, shown in the formula bar — a shape, not to type:

```text
= Table.SelectRows(       function
    #"Changed Type",      previous step
    each [paid_at]        the condition
      <= #date(2026, 10, 1))
```

You do not need to write M. You need to read it enough to see what a step does. Right-click a step → *Rename* so the pane reads like a change log: `Trim method`, `bank transfer → transfer`, `Drop 25 duplicates`.

**When you use it.**
- Any file that arrives again: the Monday export, the monthly bank file.
- Power Query needs Excel for Windows or Microsoft 365. **Sheets** has none: its pipeline is a clean tab of formulas (`ARRAYFORMULA`, `UNIQUE`, `QUERY`), re-run by importing the new CSV over the raw tab.

> ⚠️ **Watch out.** Do not open a CSV by double-clicking it. Excel then reads it with your Windows settings: on a computer set to Russian or Uzbek (decimal comma, list separator `;`) a comma-separated file can land in **one** column, and `1,5` can become 1.5, 15 or text. **Data → From Text/CSV** shows a preview where you choose the **Delimiter** (comma, semicolon) and the **File Origin** — the encoding. Our files are `65001: Unicode (UTF-8)`; a file from older software may need `1251: Cyrillic`. If names arrive as `ÐÐ°Ð»Ð¸ÐºÐ°` instead of letters, the encoding is wrong — change File Origin, never retype the names.

> ⚠️ **Watch out.** Steps run in order, top to bottom. Insert a step in the middle and every later step works on its result — check the row count at the last step after any change.

**Your turn.** Which tools leave a recipe that re-runs on the next file?

> ⚠️ **Quirk: Excel changes some values the moment it opens a file.**
>
> - **You expect:** a CSV to open exactly as it was written.
> - **What happens:** a code `00123` becomes the number 123; a 20-digit bank account keeps only its first 15 digits; a code like `1-2` turns into a date.
> - **Why:** Excel guesses a type for every cell, and it stores a number with at most 15 significant digits. The digits after the 15th become zeros and are gone for good — saving the file does not bring them back.
> - **Protect yourself:** never double-click such a file. In **Data → From Text/CSV → Transform Data**, set the id, account and code columns to **Text** before *Close & Load*. Microsoft 365 also lets you switch these guesses off: **File → Options → Data → Automatic data conversion**.

| In the file | Opened by a double-click | Loaded as Text |
|---|---|---|
| `00123` | 123 | 00123 |
| `20208000900123456789` | 2.02081E+19 — it holds 20208000900123400000 | 20208000900123456789 |
| `1-2` | a date: 2 January or 1 February, by your Windows settings | 1-2 |

### Change Type — the first step after the headers

**What it is.** **Change Type** sets the type of each column: Whole Number, Decimal, Date, Text. It is SQL's `CAST`. Power Query guesses types on import; you check every guess.

**How to write it.**

```text
click the type icon in the column
header (ABC / 123 / calendar)
  → choose

M: = Table.TransformColumnTypes(
  #"Promoted Headers",
  {{"paid_at", type date},
   {"amount", Int64.Type},
   {"phone", type text}})
```

| column | wrong guess | right type | why |
|---|---|---|---|
| `paid_at` | Text | Date | date filters and month grouping need a date |
| `amount` | Text | Whole Number | sums |
| `phone` | Whole Number | **Text** | `+998902031105` as a number loses its `+`; a phone is an identifier, not a quantity |
| `installment_id` | Whole Number | Whole Number | a key that joins to `installments` |

**When you use it.**
- Right after *Promoted Headers*, before any other step. Text steps need text columns; date filters need date columns.

> ⚠️ **Watch out.** A `Trim` step on a column typed as a number does nothing and shows no error. A Date filter on a text column fails. Types first.

> ⚠️ **Watch out.** The *Changed Type* step that Power Query adds by itself is a **guess from the first 200 rows**. If row 5 000 holds `n/a` in a column typed Whole Number, that cell becomes an **Error** — no message, just a red bar in View → *Column quality*. Look there after every type step; then Home → Remove Rows → **Remove Errors**, or Transform → **Replace Errors**, and write the count in the change log. For dates like `14.03.2026` and numbers like `1 234,5`, use the type icon → **Using Locale…** and pick the file's locale (e.g. Russian): the reading then does not depend on the computer that refreshes. And type every **identifier** as Text — a code `00123` typed as a number becomes 123, and a card number longer than 15 digits loses its last digits.

**Your turn.** Power Query types `phone` as Whole Number. What does the first customer's phone `+998902031105` become?

### Filter Rows — WHERE in Power Query

**What it is.** **Filter Rows** keeps the rows that meet a condition. It is SQL's `WHERE`. Click the arrow in a column header.

**How to write it.**

```text
paid_at header ▾
  → Date Filters
  → Before… / On or before…
  → 2026-10-01

M: = Table.SelectRows(
  #"Changed Type",
  each [paid_at]
    <= #date(2026, 10, 1))
```

| paid_at | kept by `<= 2026-10-01`? |
|---|---|
| 2026-09-30 | yes |
| 2026-10-01 | yes |
| 2026-10-02 | no — dated after the as-of |

`payments_dirty.csv` has **24** rows dated after 2026-10-01. The filter drops them for any as-of report.

**When you use it.**
- An as-of cut, a period, one region or product.
- Text filters (*equals*, *begins with*) and number filters work the same way.

> ⚠️ **Watch out.** A filter on a column still typed as text compares text, not dates. Change Type first.

**Your turn.** On the raw `payments_dirty.csv` (52 875 rows, duplicates still in), how many rows does `paid_at` *on or before* 2026-10-01 keep?

### Split Column — Text to Columns, recorded

**What it is.** **Split Column** cuts one column into several, by a delimiter or by a number of characters. It is Text to Columns as a recorded step: next Monday's file is split too.

**How to write it.**

```text
select applied_at
  → Home → Split Column
  → By Delimiter → Space
  → At the left-most delimiter

M: = Table.SplitColumn(
  #"Changed Type",
  "applied_at",
  Splitter.SplitTextByEachDelimiter(
    {" "}),
  {"applied_at.1", "applied_at.2"})

then Change Type:
  applied_at.1 → Date,
  applied_at.2 → Time
```

| applied_at | applied_at.1 | applied_at.2 |
|---|---|---|
| 2025-06-02 10:35:00 | 2025-06-02 | 10:35:00 |

**When you use it.**
- The same cases as Text to Columns, on a file that comes back.
- Split never overwrites a neighbour: Power Query adds new columns.

**Your turn.** After the split, which type should `applied_at.1` get?

### Replace Values, Trim, lowercase — text steps

**What it is.** The text repairs of this page as steps. **Transform → Format** has Trim, Clean, lowercase, UPPERCASE and Capitalize Each Word (= `PROPER`). **Replace Values** is `SUBSTITUTE`.

**How to write it.**

```text
select method → Transform
  → Format → Trim

  M: Table.TransformColumns(…,
       {{"method", Text.Trim}})

select method → Transform
  → Format → lowercase
  M: Text.Lower

select method → Transform
  → Replace Values
     Value To Find: bank transfer
     Replace With: transfer
     Advanced ▸
       ☑ Match entire cell contents

  M: Table.ReplaceValue(…,
       "bank transfer", "transfer",
       Replacer.ReplaceValue,
       {"method"})
```

| method (raw) | after Trim + lowercase + Replace |
|---|---|
| `CASH␣` | cash |
| PayMe | payme |
| bank transfer | transfer |

**When you use it.**
- Every text column you will group, filter or join on.
- Capitalize Each Word on name columns only.
- **Fill Down** (Transform → Fill → Down) copies the value above into empty cells below it — the repair for a report whose region sat in merged cells or appeared only on the first row of its group (Day 1's "not a table"): unmerge, then Fill Down.

> ⚠️ **Watch out.** Without *Match entire cell contents*, Replace Values works inside the text: replacing `card` with `bank card` would also turn `discard` into `disbank card`.

**Your turn.** Which of these steps must **not** run on `method`?

### Remove Duplicates — the recorded step

**What it is.** The same deletion as the button, as a step. Select the key columns, then Home → Remove Rows → Remove Duplicates. It keeps the first row of each group, like `ROW_NUMBER() … WHERE rn = 1`.

**How to write it.**

```text
Ctrl+click installment_id,
  paid_at, amount
  → Home → Remove Rows
  → Remove Duplicates

M: = Table.Distinct(
  #"Replaced Value",
  {"installment_id", "paid_at",
   "amount"})
```

On `payments_dirty.csv`: 52 875 → **52 850** rows, 25 removed, Σ amount down by 58 397 800. Rename the step `Drop 25 duplicates`.

**When you use it.**
- The delivered version of the deletion you checked with `COUNTIFS`.
- Sort first (a *Sorted Rows* step) when a particular copy must be kept — the earlier `registered_at`, the lower `payment_id`.

> ⚠️ **Watch out.** Selecting **all** columns removes nothing: `payment_id` differs on every row. A duplicate agrees on what matters, not on everything.

**Your turn.** You select **every** column of `payments_dirty.csv` before Remove Duplicates. How many rows are left?

### Add Column — a calculated column

**What it is.** **Add Column** creates a new column from the others: **Custom Column** takes a formula in M, **Conditional Column** is a `CASE` built with a form, **Date → Month → Start of Month** derives a month. It is a calculated column in `SELECT`.

**How to write it.**

```text
Add Column → Custom Column
  name:     birth_date_invalid
  formula:
    [birth_date] > #date(2026,10,1)
    or [birth_date] < #date(1920,1,1)

M: = Table.AddColumn(
  #"Removed Duplicates",
  "birth_date_invalid",
  each [birth_date] > #date(2026,10,1)
    or [birth_date] < #date(1920,1,1))
```

| customer_id | birth_date | birth_date_invalid |
|---|---|---|
| 4516 | 1981-08-15 | FALSE |
| 927 | 2031-04-12 | TRUE |
| 957 | 1900-01-01 | TRUE |

**When you use it.**
- A flag (`is_forward_dated`, `birth_date_invalid`), a month key, a cleaned copy of a column.
- M is case-sensitive: `[birth_date]`, not `[Birth_Date]`.

**Your turn.** Add a custom column `registered_in_future` = `[registered_at] > #date(2026,10,1)` to the raw customers query. How many rows say TRUE?

### Group By — GROUP BY in Power Query

**What it is.** **Group By** (Transform → Group By) folds the rows into one row per key, with aggregates: Sum, Count Rows, Min, Max, Average. It is SQL's `GROUP BY`.

**How to write it.**

```text
Transform → Group By → Advanced
  group by:  method
  new column: payments = Count Rows
  new column: amount   = Sum of amount

M: = Table.Group(
  #"Removed Duplicates",
  {"method"},
  {{"payments",
    each Table.RowCount(_)},
   {"amount",
    each List.Sum([amount])}})
```

| method (3 rows in) | | method | payments | amount |
|---|---|---|---|---|
| card · 100 | → | card | 2 | 300 |
| cash · 50 | | cash | 1 | 50 |
| card · 200 | | | | |

The same in Sheets, with `QUERY` — SQL as a function, column letters instead of names:

```excel
=QUERY(Clean!A1:H, "select F, count(A), sum(E) group by F order by count(A) desc", 1)
```

**When you use it.**
- A summary that must refresh with the file: payments per instalment, amount per month.
- Before a merge, to bring a "many" side down to one row per key (the Merge subsection).

**Your turn.** On `payments_clean` filtered to `paid_at <= 2026-10-01`, you Group By `installment_id` with `paid = Sum(amount)`. How many rows come out?

### Unpivot — wide columns into rows

**What it is.** **Unpivot** (*отменить свёртывание столбцов*) turns many value columns into two columns — **Attribute** (the old header) and **Value** — one row per old cell. It makes a report back into a proper table (Day 1).

**How to write it.**

```text
select the label column (region)
  → Transform
  → Unpivot Columns ▾
  → Unpivot Other Columns

M: = Table.UnpivotOtherColumns(
  #"Changed Type", {"region"},
  "Attribute", "Value")

then rename Attribute → bucket,
  Value → outstanding
```

Rows after unpivot = label rows × value columns: 2 × 2 = 4.

**When you use it.**
- A file with months, products or buckets across the header — the "not a table" of Day 1.
- *Unpivot Other Columns* (select the labels) keeps working when next month adds a column; *Unpivot Columns* (select the values) does not.

**Your turn.** A sheet has 5 product rows and 34 month columns. You select `product` and choose Unpivot Other Columns. How many rows come out?

### Merge Queries — a JOIN

**What it is.** **Merge Queries** (*объединить запросы*) joins two queries on a key. It is SQL's `JOIN`; the **Join Kind** dropdown holds week 2's whole chapter.

**How to write it.**

```text
Home → Merge Queries (as New)
  top table:    installments
    click installment_id
  bottom table: paid_by_installment
    click installment_id
  Join Kind:    Left Outer
→ a new column of nested tables
  → click its expand icon
  → tick paid

M: = Table.NestedJoin(
  installments, {"installment_id"},
  paid_by_installment,
  {"installment_id"},
  "paid", JoinKind.LeftOuter)
```

| Join Kind | SQL | keeps |
|---|---|---|
| Left Outer | `LEFT JOIN` | every row of the top table |
| Right Outer | `RIGHT JOIN` | every row of the bottom table |
| Full Outer | `FULL OUTER JOIN` | every row of both |
| Inner | `INNER JOIN` | matched rows only |
| Left Anti | `LEFT JOIN … WHERE right IS NULL` | top rows with **no** match |
| Right Anti | the mirror | bottom rows with no match |

On the data: `installments` (92 193 rows) Left Outer `paid_by_installment` → still **92 193** rows; unpaid instalments get `null` in `paid`. Left Anti, then a filter `due_date <= 2026-10-01` → **1 381** matured instalments with no payment at all by the as-of date.

**When you use it.**
- Bring a column from another file: the paid amount onto each instalment, a product rate onto each loan.
- Check the row count right after every merge: a Left Outer must keep the top table's count.

> ⚠️ **Watch out.** If the bottom table has two rows for one key, the merge **multiplies** the top rows — the one-to-many trap of week 2. Group By the bottom table to one row per key first. And Merge compares keys **exactly** — unlike Excel's lookups it is case-sensitive, and a space counts: `Cash` ≠ `cash`, `"2167 "` ≠ `"2167"`. Trim, clean and lowercase the key column on **both** sides before merging, and give both keys the same type.

**Your turn.** Which Join Kind finds the instalments that have **no** payment?

### Append Queries — a UNION ALL

**What it is.** **Append Queries** (*добавить запросы*) stacks the rows of two or more queries into one. It is SQL's `UNION ALL`: duplicates stay, and columns are matched **by name**.

**How to write it.**

```text
Home → Append Queries (as New)
  → Two tables / Three or more
  → pick the queries

M: = Table.Combine(
  {payments_tashkent,
   payments_other})
```

| query 1 | | query 2 | | appended |
|---|---|---|---|---|
| amount | | amount | | amount |
| 100 | | 300 | | 100 |
| 200 | | | | 200 |
| | | | | 300 |

**When you use it.**
- Twelve monthly files into one year; two branches' exports into one table.
- Add a `source` column (Add Column → Custom, `"2026-09"`) to each query before appending, so every row remembers its file.

> ⚠️ **Watch out.** `Amount` in one file and `amount` in the other become **two** columns, each half `null`. Rename to the same header before appending.

**Your turn.** Query 1 has a column `amount`, query 2 has `Amount`. Each has 3 rows. What does Append give?

### Close & Load, and Refresh

**What it is.** **Close & Load** writes the query's result to the workbook. **Refresh** (Data → Refresh All, Ctrl+Alt+F5) re-reads the source file and replays every step.

**How to write it.**

```text
Home → Close & Load To…
  ◉ Table, New worksheet
    → a Table you can SUM, chart,
      pivot
      (like CREATE TABLE AS)
  ◉ Only Create Connection
    → no sheet; other queries can
      use it
      (like CREATE VIEW)
  ☐ Add this data to the Data Model
Data → Refresh All
  → every query re-reads its Source
    and re-runs
Data → Queries & Connections
  → right-click → Properties
  → Refresh data when opening the file
```

`payments_clean` loads as a 52 850-row Table. Next Monday you save the new export over `payments_dirty.csv`, press Refresh All, and the Table, its formulas and its pivots update.

**When you use it.**
- Load the tables people read; keep helper queries (`paid_by_installment`) as connections only.
- When the file moves: Data → Get Data → Data Source Settings → Change Source, once.

> ⚠️ **Watch out.** A formula typed *inside* a loaded Table next to the query columns stays, but values typed into the query's own columns are overwritten on the next refresh. Never edit a loaded table by hand.

**Your turn.** `paid_by_installment` is only needed to feed the merge. How do you load it?

### Excel ↔ Google Sheets — reference

| Excel | Sheets | Note |
|---|---|---|
| `TRIM`, `CLEAN`, `PROPER`, `SUBSTITUTE`, `DATEVALUE` | same | identical names and arguments |
| Ctrl+H Find & Replace (Match case / entire cell) | Ctrl+H (Match case / Match entire cell contents / regex) | Sheets adds regular expressions — `^bank transfer$` |
| Data → Text to Columns | Data → Split text to columns; `=SPLIT(G2, " ")` | the formula version is reproducible |
| Flash Fill (Ctrl+E) | — ; Smart Fill suggestions | neither leaves a formula |
| Data → Remove Duplicates | Data → Data cleanup → Remove duplicates | same exact-match caveats; Sheets is case-sensitive here |
| — | Data → Data cleanup → Trim whitespace | one-time, like Find & Replace |
| Power Query, Applied Steps, Refresh All | formula tab + `UNIQUE`/`FILTER`/`ARRAYFORMULA`; re-import to refresh | no recorded pipeline in Sheets — the formulas *are* the pipeline |
| Merge Queries (join kinds) | `XLOOKUP` column, or `QUERY` on one tab | Sheets `QUERY` cannot join two tabs; join first with a lookup |
| Group By | `QUERY(…, "select … group by …")` or a pivot | `pivot` inside `QUERY` gives a cross-tab |
| Append | `={Tab1!A2:H; Tab2!A2:H}` (array literal with `;`) | `UNION ALL` by position, not by name |

### Putting it together

Next Monday's payments file, cleaned in one query. Each step is a subsection of this page:

| Step | Done with | Section |
|---|---|---|
| Source | From Text/CSV → payments_dirty.csv | Power Query: load |
| Promoted Headers |   |   |
| Changed Type | ids, amount → Whole Number; paid_at → Date | Change Type |
| Trim method | Transform → Format → Trim | text steps (TRIM) |
| Lowercase method | Transform → Format → lowercase | text steps (LOWER) |
| bank transfer → transfer | Replace Values, match entire cell | text steps (SUBSTITUTE) |
| Drop 25 duplicates | installment_id + paid_at + amount | Remove Duplicates (checked with COUNTIFS first) |
| is_forward_dated | Custom Column `[paid_at] > #date(2026,10,1)` | Add Column |
| Close & Load To | Table payments_clean | Close & Load; Refresh next Monday |

Read the result with the checklist from the top of the page: spaces 0, case 0, synonyms 0 — `UNIQUE(method)` gives 5; duplicates 0 — 52 850 rows; the 24 forward-dated rows kept and flagged. Section 2 builds exactly this.

**Put the steps in order.**

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Text repair (TRIM, PROPER, Find & Replace, Text to Columns) — [Master Data Cleaning Essentials on Excel in Just 10 Minutes (Kenji Explains), 03:39](https://youtu.be/jxq4-KSB_OA?t=219&end=350)
- ▶ Remove Duplicates (button, UNIQUE, Power Query; "what counts as a duplicate row") — [Three EASY Ways to Find and Remove Duplicates in Excel (Leila Gharani), 01:15](https://youtu.be/ADArCWLz55Y?t=75&end=146)
- ▶ Power Query (where it is, connect, Applied Steps) — [Power Query for Beginners: Automate Your Excel Work in 25 Mins (Leila Gharani), 04:45](https://youtu.be/x7mzOYEn0XA?t=285&end=402)
- ▶ Power Query (second option, shorter, Get data -> Transform -> Close & Load) — [How to use Microsoft Power Query (Kevin Stratvert), 05:26](https://youtu.be/0aeZX1l4JT4?t=326&end=420)
- ▶ Data cleaning block inside one longer Excel course — [Learn Excel in Under 3 Hours (Alex The Analyst), 1:39:03](https://youtu.be/zXnQNytHCPM?t=5943&end=7066)

- RU workbook `HW 3.1 Excel.xlsx` and `HW_2_Module_3.xlsx` — the original course's cleaning homework (text functions and lookups on a shop file); ours uses the same functions on Nur Finance data.
- *Russian terms:* очистка данных = data cleaning, удалить дубликаты = Remove Duplicates, текст по столбцам = Text to Columns, мгновенное заполнение = Flash Fill, Power Query / Получить и преобразовать = Get & Transform, объединение запросов = Merge Queries, добавление запросов = Append, обновить = Refresh, журнал изменений = change log.

---

## 2. Worked example — Nilufar's two files (detective, 40 min)

Work on `customers_dirty.csv` and `payments_dirty.csv` from `data/excel/` (the same rows as the `Customers` and `Payments` sheets, as raw files so Power Query has something to import). Grain of each: a customer *row* and a payment *row* — the question is how many *people* and *payments* they represent. The steps follow the order of Learn.

**Step 1 — the dirty-data checklist on Customers**, four formulas on the raw sheet (stray spaces with `LEN`/`TRIM`, case with `EXACT`). *In the box: first names written in ALL CAPS.*

<details><summary>Result</summary>

Trailing spaces in `first_name` `=SUMPRODUCT(--(LEN(B2:B6041)<>LEN(TRIM(B2:B6041))))` → **18**; all-caps first names `=SUMPRODUCT(--EXACT(B2:B6041, UPPER(B2:B6041)))` → **22**; all-lower surnames `=SUMPRODUCT(--EXACT(C2:C6041, LOWER(C2:C6041)))` → **40**; ids above 6 000 → **40**. The 22 + 18 = 40 first-name oddities and the 40 lower-case surnames land on the same 40 rows — ids 6001–6040. Suspicious; not yet proof.

</details>

**Step 2 — prove the duplicates** with a **matching key** and **COUNTIFS on the key** (n and rank), first on names, then a second key on `phone|birth_date`. *In the box: how many pairs the phone|birth_date key finds.*

<details><summary>Result</summary>

Name key: 84 rows in 42 pairs. Phone key: 80 rows in **40** pairs — exactly ids 6001–6040 paired with their originals (6001 `MALIKA jalilova` ↔ 4516 `Malika Jalilova`, same phone +998908981002, same birth date 1981-08-15, same income). The two name-only pairs (823/1197, 2460/5562) have different phones and regions — namesakes, keep both. Ten of the 40 duplicates carry a registration date in 2026 or later (one even 2027-01-09), so "new customers since 2026-01-01" (955 by `registered_at`) is overstated by 10 — week 1's memo line, now a filter.

</details>

**Step 3 — impossible dates.** A column `age` `=DATEDIF(E2, DATE(2026,10,1), "y")` (Sheets: same), then filter `age < 18` or `age > 100` — the **dates** subsection's impossible values. *In the box: how many impossible birth dates.*

<details><summary>Result</summary>

**7** rows: four in the future (ids 927, 2338, 3380 born 2031-04-12 → age −5; 964 born 2027-02-28 → −1) and three at 1900-01-01 (957, 1020, 2934 → age 126). `DATEDIF` with a future date returns `#NUM!`, so in Excel the −5 shows as an error — filter errors with `ISERROR`, or use `=YEARFRAC(E2, DATE(2026,10,1))` which goes negative. Valid customers average 45.2 years. Fix: blank the seven dates and add a flag column `birth_date_invalid` = TRUE — never invent a date.

</details>

**Step 4 — Payments: a key, n and rank, and the text inventory.** Key `=C2&"|"&TEXT(D2,"yyyy-mm-dd")&"|"&E2` (instalment, day, amount), `n` and `rank` columns (**COUNTIFS on the key**); and the method inventory with `=UNIQUE(F2:F52876)` before and after **TRIM / LOWER / SUBSTITUTE**. *In the box: Σ amount of the extra (rank = 2) rows, in soum.*

<details><summary>Result</summary>

`n > 1` → **50** rows in **25** pairs; `rank = 2` → the 25 extra rows, Σ amount **58 397 800** — the gap on Timur's tile. All 25 repeats are `payment_id` 52 851–52 875 — they were appended to the export in one batch. Do not rely on that: sameness is the three columns, not the id range. Methods: **10** distinct raw (`card`, `cash`, `transfer`, `payme`, `click`, `Card` 57, `Click` 36, `PayMe` 30, `CASH ` 30, `bank transfer` 27 — the **180** dirty rows); `UNIQUE(LOWER(TRIM(…)))` → 6; with the `bank transfer` replacement → **5**: card 17 621 · payme 8 900 · click 8 790 · cash 8 790 · transfer 8 774.

</details>

**Step 5 — build it once in Power Query** (the worked pipeline for `payments_dirty.csv`; `Customers` is HW 4.2). Each line is one step from Learn — **Change Type**, the **text steps**, **Remove Duplicates**, **Close & Load**:

| Step | How | Note |
|---|---|---|
| Source | From Text/CSV → data/excel/payments_dirty.csv |   |
| Promoted Headers |   |   |
| Changed Type | payment_id, loan_id, installment_id, amount → Whole Number; paid_at → Date; method, product, region → Text |   |
| Trim method | Transform → Format → Trim | (select method first) |
| Lowercase method | Transform → Format → lowercase |   |
| bank transfer → transfer | Replace Values, match entire cell |   |
| Drop duplicates | select installment_id, paid_at, amount → Remove Duplicates | 52 875 → 52 850 |
| Close & Load To | Table "payments_clean" on a new sheet |   |

<details><summary>Checks after loading</summary>

`=ROWS(payments_clean)` → **52 850**; `=SUM(payments_clean[amount])` → **255 114 772 176** (raw was 255 173 169 976; difference 58 397 800); `=ROWS(UNIQUE(payments_clean[method]))` → **5**; `=COUNTIFS(payments_clean[paid_at], ">"&DATE(2026,10,1))` → 24 forward-dated rows (53 438 947) — *not* removed here (they are real payments recorded with a future date; filter them where an as-of matters, as week 3 did). Change the Remove Duplicates step to all columns and the count is 52 875 again — the pane lets you try and undo. Then Data → **Refresh All** with the file untouched: the same 52 850. That is the deliverable.

</details>

---

## 3. Practice (45 min)

File `week-04/day-3/practice.xlsx`: raw sheets untouched, a sheet per task or a Power Query per task. State the count you got next to each. Then type the count in the box under the question; it checks it and shows the full answer. The questions follow the order of Learn.

**P1.** *(the dirty-data checklist)* On a copy of `Payments`, list the raw spellings of `method` with `=UNIQUE(tblPayments[method])` and count each with `COUNTIFS`. *In the box: how many distinct raw spellings.*

**P2.** *(Find & Replace)* Ctrl+H on a *copy* of `Payments`: replace `bank transfer` with `transfer` (match entire cell). How many replacements? Then try `PayMe` → `payme` with and without *Match case*. Why does the second run report 8 900 without it? *In the box: replacements in the first run.*

**P3.** *(Text to Columns · Split Column)* Text to Columns on a copy of `applications.csv`'s `applied_at`: date and time in two columns, the date typed YMD. Count applications submitted in September 2026 from the date column with the half-open filter — and with `BETWEEN`-style `<= 30 Sep`. *In the box: September 2026 applications on the date column.*

**P4.** *(Flash Fill)* Next to `first_name`, type the cleaned name for row 6001 (`Malika`) and press Ctrl+E. Check the column against `=PROPER(TRIM(B2))` with a mismatch count. What did Flash Fill guess wrong, if anything, and why would you not ship it? *In the box: your mismatch count, and in one or two sentences why you would not ship Flash Fill.*

**P5.** *(TRIM, SUBSTITUTE)* On `tblPayments`, a calculated column `method_clean` = `=SUBSTITUTE(LOWER(TRIM([@method])), "bank transfer", "transfer")`, then a `COUNTIFS` per clean value. *In the box: how many rows say `cash` in `method_clean`.*

**P6.** *(dates stored as text · DATEVALUE)* Paste `1981-08-15` as text into a cell (type an apostrophe first), prove it is text with `ISTEXT`, convert with `DATEVALUE`, and compute the age. Then try `15.08.1981` and `08/15/1981` — which converts on your machine? *In the box: the age on 2026-10-01.*

**P7.** *(a matching key · COUNTIFS on the key)* On `Customers`, a third key on `phone` alone, with an `n` column. Compare with the `phone|birth_date` key of the Worked example. *In the box: how many rows have n > 1 on the phone-only key.*

**P8.** *(Remove Duplicates)* The three Remove Duplicates runs on copies of `Customers` from Learn (raw names; trimmed names; phone + birth date). Report the three "removed" counts and which run deletes real people. *In the box: the count Excel reports for the first run (raw names).*

**P9.** *(Power Query: Change Type, text steps, Add Column, Remove Duplicates)* Power Query on `customers_dirty.csv`: types (phone as Text), Trim + Capitalize Each Word on the names, a custom column `birth_date_invalid` = `[birth_date] > #date(2026,10,1) or [birth_date] < #date(1920,1,1)`, then Remove Duplicates on `phone`, `birth_date`. Load and count. *In the box: distinct phones in customers_clean.*

**P10.** *(Filter Rows)* On `payments_clean`, add a step Filter Rows → `paid_at` on or before 2026-10-01. *In the box: the rows the filter keeps.*

**P11.** *(Group By · QUERY)* Group By in Power Query on `payments_clean`: method → count and sum. Then the same with `QUERY` in Sheets (or `COUNTIFS`/`SUMIFS` on the loaded table). Five rows? *In the box: the card count.*

**P12.** *(Unpivot)* Monday's bucket matrix (Day 1's Worked example: 8 regions down, 5 buckets across) arrives as a sheet. Load it into Power Query, select `region`, Unpivot Other Columns, rename the columns `bucket` and `outstanding`. *In the box: how many rows come out.*

**P13.** *(Merge Queries = join)* A query `paid_by_installment` = `payments_clean` filtered `paid_at <= 2026-10-01`, grouped by `installment_id` → `paid`; merge it into `installments.csv` (Left Outer, key `installment_id`), expand `paid`, replace null with 0, and name the merged query `installments_paid` (tomorrow and Day 5 reuse it). Count matured instalments (`due_date <= 2026-10-01`) with `paid < total_due`. *In the box: matured instalments not fully paid.*

**P14.** *(Append Queries = union)* Split `payments_clean` into two queries by region (Tashkent / everyone else), then Append them back. Rows? Now add a `source` column to each before appending — what is that for? *In the box: the Tashkent query's rows.*

**P15.** *(Close & Load, Refresh)* Refresh test: with the pipeline loaded, open `payments_dirty.csv` in a text editor, duplicate the **last line** once more, save, Refresh All. What do the counts do? Undo the edit and refresh again. *In the box: payments_clean rows after the refresh with the extra line.*

> 🚀 **Stretch (optional, +5 XP).** **P16.** *(Add Column · Group By on a merged query)* Group By month on the merged `installments_paid` query from P13: Σ `total_due`, Σ `paid`, and a rate column — the collection rate for every month of 2026. Where does it drop and why is the September figure *expected* to be lower? *In the box: September's rate, % with 1 decimal.*

### Mistakes that cost a point this week

- Cleaning the raw sheet in place and saving — the evidence is gone; raw stays raw.
- Remove Duplicates on all columns ("to be safe") — 0 removed, because ids differ.
- Remove Duplicates on a loose key without a count first — real people deleted (P8).
- `TRIM` not applied before matching — the trailing-space duplicates survive.
- Text transforms on a column still typed as a number in Power Query — nothing happens, no error.
- A phone typed as a number — the `+` is gone and the key no longer matches the other file.
- A Merge with the default Left Outer when you meant Inner (or vice versa) — count rows after every merge.
- Replacing a date you cannot trust with a plausible one — blank + flag, never a guess.
- A change log that lists tools ("used Power Query") instead of changes ("removed 25 duplicate payments on installment_id + paid_at + amount, Σ 58 397 800").

---

## 4. Homework <span class="badge hw">HW 4.2 — Due Day 5</span>

**Nilufar's Monday pipeline.** Hand in `cleaning.xlsx` (📎 box below) (Power Query inside) — or, in Sheets, a spreadsheet with raw and clean tabs exported to `.xlsx` plus the formulas visible — and `change_log.md`:

1. **`customers_clean`** — 6 000 rows: names trimmed and capitalised, duplicates removed on `phone` + `birth_date` (keep the earlier `registered_at` — sort before Remove Duplicates), `birth_date_invalid` flag (7 TRUE) and `birth_date_clean` (blank when invalid), `monthly_income` typed as number with its blanks kept as null — not 0 (356 in the raw file, 354 after the dedup: two blanks belonged to removed duplicates).
2. **`payments_clean`** — 52 850 rows: `method` in 5 values, duplicates removed on `installment_id` + `paid_at` + `amount`, a column `is_forward_dated` (TRUE for the 24 rows after 2026-10-01; keep the rows).
3. **`checks`** sheet — `ROWS`, `SUM`, `UNIQUE` counts for both tables against the known numbers (6 000 / 7; 52 850 / 255 114 772 176 / 5 / 24), each with a TRUE/FALSE cell.
4. **`change_log.md`** — ten lines, one per change: *what, on which columns, how many rows affected, the money if any, why* (e.g. *removed 25 duplicate payments on installment_id + paid_at + amount, Σ 58 397 800, keeping the lower payment_id*). The Applied Steps pane, renamed, is your draft.

Graded on: (a) counts match (6 000 / 7 / 52 850 / 5 / 25 removed), (b) Refresh All reproduces them from the CSVs — the reviewer will refresh, (c) the change log is specific enough that Timur could rebuild the pipeline from it without opening the file.

### Check your key numbers before you hand in

Four numbers from your own `cleaning.xlsx` that are not printed above — a ✓ on all four means the pipeline, not luck, produced them.

**K1.** In `customers_clean`: how many distinct phone numbers?

**K2.** In `customers_clean`: how many blank `monthly_income` cells?

**K3.** In `payments_clean`: Σ amount of the rows flagged `is_forward_dated`.

**K4.** In `payments_clean`: how many `cash` payments?

### 📎 Hand in here

---

## 5. Self-check

---

## 6. Company corner <span class="badge company">Collection rate by month</span>

**Collection rate** (*уровень сбора*) = amount **collected** ÷ amount **due** in a period. Week 3 gave September 2026 as 94.1 % from `v_payments_clean` + `installments`; today you reproduce it from the cleaned files, in Power Query (or a pivot on the merged table), and write the definition under it.

**Definition (ours):** for instalments **due in the month** (`due_date` in the month, half-open), collected = payments on those instalments with `paid_at <= 2026-10-01` from `payments_clean` (duplicates removed, forward-dated rows excluded by the as-of filter); rate = Σ collected ÷ Σ `total_due`.

| Query | Steps |
|---|---|
| paid_by_installment | payments_clean → Filter paid_at <= 2026-10-01 → Group By installment_id: paid = Sum(amount) |
| installments_paid | installments.csv → Merge paid_by_installment (Left Outer, installment_id) → expand paid → Replace null → 0 → Add Column → Date → Month → Start of Month (from due_date) as due_month |
| collection_by_month | installments_paid → Group By due_month: due = Sum(total_due), paid = Sum(paid), instalments = Count Rows → Add Column → Custom: `rate = [paid] / [due]` → Close & Load |

| due month | instalments | due | collected (by 2026-10-01) | rate |
|---|---|---|---|---|
| 2026-06 | 2 974 | 15 045 193 118 | 14 582 682 996 | 96.9 % |
| 2026-07 | 3 099 | 15 622 932 638 | 15 103 357 382 | 96.7 % |
| 2026-08 | 3 219 | 16 296 197 919 | 15 728 683 187 | 96.5 % |
| **2026-09** | **3 305** | **16 987 977 718** | **15 982 118 926** | **94.1 %** |

**My number: 94.1 %** for September 2026 — identical to week 3's SQL, as it must be: same rows, same rule, different tool. Three alternatives give different numbers, and each is a defensible *other* definition, not an error — as long as it is written down:

- Use the **dirty** payments (duplicates in): 15 982 758 126 → still 94.1 % (one duplicated September payment, 639 200). Harmless this month; 58 m over the book.
- **Received in the month ÷ due in the month** (cash-basis — all September payments, whatever instalment they belong to): 16 338 823 207 / 16 987 977 718 = **96.2 %**. Higher, because September received early payments of October instalments and late payments of August ones. Finance often means this one.
- Collected **through today** rather than through the as-of: the 24 forward-dated rows lift August to 96.8 % and leave June, July and September unchanged at one decimal — small here, but a report "as of" a date must not contain payments dated after it.

Which one goes on the board? The first, with its as-of, because it answers "of what fell due, how much came in" — the inflow to Sevara's 1–30 bucket is the 5.9 % that did not. The cash-basis one answers "how much money arrived" — Finance's cash-flow question. Put the definition in the tile's footnote: *collected by 2026-10-01 on instalments due in the month ÷ total due; payments de-duplicated.* One sentence, and Finance and Collections stop arguing about 2.1 points.

The Sheets version: a `Clean` tab for payments, a tab `Inst` with `=SUMIFS(Clean!E:E, Clean!C:C, A2, Clean!D:D, "<="&DATE(2026,10,1))` per instalment (slow on 92 193 rows — do it once, paste values, note it in the log), then `=QUERY(Inst!A1:I, "select H, sum(G), sum(I) group by H", 1)` on a `due_month` column.

> 🎯 **Interview version.** *"What is a collection rate and how do you compute it from payments and a schedule?"* — Σ paid ÷ Σ due for instalments due in the period; paid comes from de-duplicated payments joined on the instalment id with an as-of cut-off; say whether it is instalment-basis or cash-basis; expect the latest month to read low until it matures; reconcile the join by row count (every instalment kept) before dividing.

**Say it like in an interview.** The CFO, in the corridor: *"Collections say September was 94.1 %, Finance says 96.2 %. Which is the collection rate?"* Answer in 30 words or more.

Tomorrow: PivotTables and charts — Madina's one page for the board, built on the clean tables.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 4 · Day 4 — Pivot tables and charts: the one-page report (weeks/week-04/day-4.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-04/day-4
=====

# Week 4 · Day 4 — Pivot tables and charts: the one-page report

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge company">Company corner</span>

> STORY **Thursday, 9:00.** Madina, your manager (*руководитель*), with the board agenda. *"Monday, slot four, eight minutes. Bekzod's Excel is right now, but it is forty cells on three sheets. I want **one page**: outstanding by product, disbursements by month with a trend, the buckets, the top-5 branches — and the six numbers Timur's dashboard shows, as tiles, so the board sees the same figures in both places. Pivot tables, so I can click a product and the page follows; charts, so nobody has to read a table; and a title on every chart that says what it means, not what it is."*

## Today in 3 lines

- A **PivotTable** is `GROUP BY` with the mouse: drag fields to Rows / Columns / Values / Filters; **Show Values As** gives % of total, % of parent, running total and difference-from without a formula; **group** dates by month and quarter; **slicers** and **timelines** are the dropdowns of a page.
- **Charts**: column for categories, bar for rankings, line for time, combo for two measures, stacked for composition; no pie beyond three slices, no 3D, bars from zero; **the title states the finding**; sparklines for a trend in a cell.
- You have built Madina's page: four pivots, four charts, six tiles, one slicer — refreshable, with every number tied to week 3.

**Today's files:** `data/excel/nur_week4_start.xlsx` (press **⬇ Download** for a fresh copy, save as `week-04/day-4/practice.xlsx`) and `data/excel/monthly_disbursements.csv` for the 34-month line; P16 reuses yesterday's `installments_paid` query. **Done today** = the product pivot's Grand Total equals 208 723 504 430, its bar chart has a finding title, every Practice box is ✓, the Quick check and the day quiz are done. No new homework: HW 4.2 is due tomorrow, and today's page is the draft of tomorrow's checkpoint Part B — keep the file.

---

## 1. Learn — the pivot is GROUP BY you can drag

A **PivotTable** (*сводная таблица*) groups and aggregates a table without a formula. A chart then shows the result so nobody has to read it. Today's page is both: pivots first, charts second, then the two together.

**The small table used on this page.** Every pivot subsection turns these six loans into its result first (amounts in millions of soum), then does the same on `tblLoans`.

| `loan_id` | `product` | `region` | `disbursed_at` | `status` | `principal` | `outstanding` |
|---|---|---|---|---|---|---|
| 1 | SME | Tashkent | 2026-08-14 | active | 400 | 300 |
| 2 | Micro | Tashkent | 2026-08-27 | active | 10 | 5 |
| 3 | SME | Fergana | 2026-09-03 | active | 200 | 150 |
| 4 | Micro | Fergana | 2026-09-10 | default | 8 | 5 |
| 5 | Consumer | Tashkent | 2026-09-21 | active | 50 | 40 |
| 6 | Micro | Tashkent | 2026-09-28 | closed | 6 | 0 |

### What a pivot is — GROUP BY in a sheet

**What it is.** A **pivot** reads a table, groups its rows by one or more fields and aggregates the others. It is `SELECT product, SUM(outstanding) FROM loans GROUP BY product` built by dragging field names. The result is a new, small table on its own sheet; the source rows are not changed.

**How to write it.** Click inside the Table → Insert → **PivotTable** → New Worksheet → OK. The **field list** opens on the right:

```text
PivotTable Fields
  [x] product  [x] outstanding
  [ ] region   [ ] status …
    the source table's columns
  Filters: (empty)
  Columns: (empty)
  Rows:    product
  Values:  Sum of outstanding
```

The picture — six source rows become three pivot rows and a total:

On `tblLoans`, the same drag gives five product rows and a **Grand Total of 208 723 504 430** — the whole book, the same number as `=SUM(tblLoans[outstanding])`. The Grand Total is the pivot's check.

**Sheets:** select the data → Insert → **Pivot table**; the editor on the right has the same four areas.

**When you use it.**
- Any "per group" question: per product, per region, per month.
- When the reader wants to re-cut the numbers by clicking, not by asking you for a new formula.

| `SUMIFS` per label (Day 1) | Pivot (today) |
|---|---|
| you type the labels, one formula per cell | the labels appear by themselves |
| any layout, any formula | rows × columns, built-in aggregates |
| recalculates at once | needs **Refresh** after the data changes |

**Your turn.** You build a pivot on `tblLoans` with `region` in Rows and Sum of `outstanding` in Values. How many rows does it have, not counting the Grand Total?

### Rows and Values — the group and the aggregate

**What it is.** A field in **Rows** (*Строки*) is a `GROUP BY` key: each distinct value becomes one row. A field in **Values** (*Значения*) is aggregated per row. A number field becomes *Sum of …*; a text field becomes *Count of …*.

**How to write it.**

| Area | Field | SQL |
|---|---|---|
| Rows | product | `GROUP BY product` |
| Values | outstanding (Sum) | `SUM(outstanding)` |
|   | loan_id (Count) | `COUNT(*)` — drag a field to Values twice to see it twice |

On the small table, `product` in Rows and both values:

| product | Sum of outstanding | Count of loan_id |
|---|---|---|
| Consumer | 40 | 1 |
| Micro | 10 | 3 |
| SME | 450 | 2 |
| **Grand Total** | **500** | **6** |

Two fields in Rows make a hierarchy: `region` then `product` lists the products **inside** each region, with a subtotal per region.

On `tblLoans`, Rows `product`, Values Sum of `outstanding` and Count of `loan_id`: Small business loan **125 892 942 411** on **781** loans; Micro loan 956 106 370 on 2 669 loans. The Grand Total row says 208 723 504 430 and 7 828.

**When you use it.**
- One dimension, one or more measures: outstanding and loans by product.
- Two fields in Rows for a drill-down: region → branch.

> ⚠️ **Watch out.** A number column with one text cell or one blank in it is summarised as **Count**, not Sum. If *Count of outstanding* appears, check the source column before you trust anything.

**Your turn.** You drag `loan_id` — a number column — into Values. Excel shows *Sum of loan_id*. What should you do?

### Columns and Filters — the cross-tab and the page WHERE

**What it is.** A field in **Columns** (*Столбцы*) is a second `GROUP BY` key spread across the top: the pivot becomes a **cross-tab**. A field in **Filters** (*Фильтры*) is a `WHERE` the reader can change: it sits above the pivot as a dropdown and decides which source rows are used at all.

**How to write it.**

| Area | Field | SQL |
|---|---|---|
| Filters | status = active | `WHERE status = 'active'` |
| Rows | product | `GROUP BY product,` |
| Columns | region | `region` (as a cross-tab) |
| Values | outstanding (Sum) |   |

On the small table, Rows `product`, Columns `region`, no filter:

| Sum of outstanding | Fergana | Tashkent | **Grand Total** |
|---|---|---|---|
| Consumer | | 40 | 40 |
| Micro | 5 | 5 | 10 |
| SME | 150 | 300 | 450 |
| **Grand Total** | **155** | **345** | **500** |

The empty cell means "no Consumer loan in Fergana". With Filters `status` = active, rows 4 (default) and 6 (closed) drop out: Micro shows 5, and the Grand Total becomes **495**.

On `tblLoans`, Rows `product`, Columns `bucket`, Values Count of `loan_id`: the `90+` column reads Consumer **77**, Micro **76**, BNPL **42**, SME **29**, Auto **10** — 234 in all. Filters `status` = active on the product pivot: Grand Total **203 404 028 903**, the active book.

**When you use it.**
- Columns: two dimensions at once — product × bucket, region × month. Keep the field with fewer values in Columns.
- Filters: one fixed condition for the whole page — active loans only, one year.

> ⚠️ **Watch out.** A filter is invisible once the page is printed. Put the filter's value in the title (*"Active loans, by product"*), or the reader takes 203.4 bn for the whole book.

**Your turn.** Put each part of the query into the area of the field list that does it.

### Summarize Values By — Sum, Count, Average, Max, Min

**What it is.** **Summarize Values By** sets the aggregate of a Values field: **Sum**, **Count**, **Average**, **Max**, **Min**, *Count Numbers*, *StdDev*. It is the choice between `SUM`, `COUNT`, `AVG`, `MAX` and `MIN`.

**How to write it.** Right-click a number in the Values area → **Value Field Settings** → *Summarize value field by* → pick → OK. Sheets: the *Summarize by* dropdown under the value.

On the small table, Rows `product`, `outstanding` summarised three ways:

| product | Sum | Average | Max |
|---|---|---|---|
| Consumer | 40 | 40 | 40 |
| Micro | 10 | 3.3 | 5 |
| SME | 450 | 225 | 300 |
| **Grand Total** | **500** | **83.3** | **300** |

The Grand Total of an Average is the average over **all** rows (500 ÷ 6), not the average of the three averages.

On `tblLoans`, Values `principal` as **Average**: the Grand Total row shows **51 709 668**, the average ticket of all 7 828 loans. As **Max**, the Small business loan row shows **599 060 000**, the largest loan.

**When you use it.**
- Sum for money, Count for "how many", Average for a typical size, Max/Min for the extremes.
- The same field twice with two settings: Sum and Average of `principal` side by side.

> ⚠️ **Watch out.** An Average is taken over the rows in the group. Average of `outstanding` includes the 4 242 closed loans at 0 and is far too low for "the typical balance". Filter `status` = active first, or say which population you mean.

**Your turn.** On the small table, what does **Average of outstanding** show in the Micro row?

### Show Values As — % of Grand Total, of Column, of Row, of Parent

(Animated explanation)
Of the row, of the column, of the whole
- The small pivot: Sum of outstanding, products down, regions across. Each row has its total on the right, each column at the bottom; the corner, 500, is the **Grand Total**.
- **% of Grand Total** divides every cell by 500. SME in Tashkent: 300 ÷ 500 = 60.0 %. All the cells together make 100 %.
- **% of Column Total** divides by the cell's column. Within Tashkent's 345: SME = 300 ÷ 345 = 87.0 %. Each **column** adds up to 100 %.
- **% of Row Total** divides by the cell's row. Within SME's 450: Tashkent = 300 ÷ 450 = 66.7 %. Each **row** adds up to 100 %.
- Press the three buttons and watch the amber ring move: it marks what the cell is divided by.
- `tblLoans`, Count of loans, product × bucket (the late buckets under 90 days in one column). % of Column Total: Consumer is 77 ÷ 234 = 32.9 % of the 90+ loans.
- Switch to % of Row Total: of SME's 781 loans, 29 — 3.7 % — are 90+. Same table, a different question.
- Find the words that name the denominator: 'of all the …'.
- Watch out: under % of Column Total every column ends in 100 %. Never add those up — and turn the Grand Total off if it confuses the reader.

**What it is.** **Show Values As** turns a number into a **share** of a total, without a formula. % of Grand Total divides by the whole table; % of Column Total by its column; % of Row Total by its row; **% of Parent Row Total** by the group one level up (region for a branch).

**How to write it.** Value Field Settings → second tab **Show Values As** → pick → OK (Sheets: *Show as*). Drag the field to Values twice to see the amount and its share side by side.

On the small table (product × region, Sum of outstanding = 500):

| | Fergana | Tashkent | Total | → % of Grand Total | → % of Column Total (Tashkent) | → % of Row Total (SME) |
|---|---|---|---|---|---|---|
| Consumer | | 40 | 40 | 8.0 % | 11.6 % | |
| Micro | 5 | 5 | 10 | 2.0 % | 1.4 % | |
| SME | 150 | 300 | 450 | 90.0 % | 87.0 % | Fergana 33.3 % · Tashkent 66.7 % |

- **% of Grand Total**: SME = 450 ÷ 500 = 90.0 %.
- **% of Column Total**: within Tashkent's 345, SME = 300 ÷ 345 = 87.0 %.
- **% of Row Total**: within SME's 450, Tashkent = 300 ÷ 450 = 66.7 %.

On `tblLoans`: the product pivot with % of Grand Total gives SME **60.3 %** of the book. The product × bucket count with **% of Column Total** says Consumer is **32.9 %** of the 234 loans in 90+; with **% of Row Total**, **3.7 %** of SME's 781 loans are in 90+.

**When you use it.**

| Question | Show Values As |
|---|---|
| What share of the whole? | % of Grand Total |
| Within this column (bucket), which row (product)? | % of Column Total |
| Within this row (product), how is it spread? | % of Row Total |
| Within its parent group (region → branch)? | % of Parent Row Total |

> ⚠️ **Watch out.** A row total of shares only makes sense for the share the row adds up to. Turn the Grand Total off for columns of % of Column Total, or the reader sees "100 %" under every column and adds them.

**Your turn.** Rows `region`, Columns `bucket`, Values Count of `loan_id`. You want: *"of Fergana's loans, what share is 90+?"*. Which setting?

### Show Values As — Difference From, Running Total, Rank

**What it is.** The other half of Show Values As compares an item with **another item** of the same field. **Difference From** shows the change against a base item (usually *(previous)*); **% Difference From** the same as a percentage; **Running Total In** accumulates down a field; **Rank Largest to Smallest** numbers the items. These are week 3's window functions as a dropdown.

**How to write it.** Value Field Settings → Show Values As → **Difference From** → Base field `disbursed_at` (or `Months`) → Base item **(previous)**.

On the small table, Rows `disbursed_at` grouped by month (next subsection), Values Sum of `outstanding`:

| month | Sum | Difference From (previous) | % Difference From | Running Total In |
|---|---|---|---|---|
| Aug | 305 | | | 305 |
| Sep | 195 | −110 | −36.1 % | 500 |

On `tblLoans`, Rows `disbursed_at` grouped by Years, Values Sum of `principal`: 2024 **86 522 990 000**, 2025 **155 927 230 000**, 2026 **162 333 060 000**. % Difference From (previous) on 2026: **+4.1 %** — nine months of 2026 already lent more than all of 2025. Running Total In ends at 404 783 280 000, everything ever lent.

**When you use it.**
- Month on month and year on year: Difference From, % Difference From.
- Year to date: Running Total In the date field.
- A ranking column next to the amount: Rank Largest to Smallest.

> ⚠️ **Watch out.** A partial period compared with a full one is a fake drop. October 2026 has one day (21 loans); its Difference From says −16 162 730 000. Drop the partial period or mark it.

**Your turn.** Match each Show Values As setting with the SQL you wrote in week 3.

### Grouping dates — months, quarters, years

**What it is.** **Grouping** (*Группировать*) folds the dates in a Rows or Columns field into larger periods: Months, Quarters, Years. It is `GROUP BY strftime('%Y-%m', d)` without a helper column.

**How to write it.** Put `disbursed_at` in Rows. Excel 365 groups it at once into Years / Quarters / Months. To choose: right-click a date in the pivot → **Group** → tick *Months* and *Years* (or *Quarters*) → OK. Right-click → **Ungroup** to go back to days.

On the small table:

| Ungrouped (one row per date) | Sum | | Grouped by Months | Sum |
|---|---|---|---|---|
| 2026-08-14 | 300 | | Aug | 305 |
| 2026-08-27 | 5 | | Sep | 195 |
| 2026-09-03 | 150 | | | |
| 2026-09-10 | 5 | | | |
| 2026-09-21 | 40 | | | |
| 2026-09-28 | 0 | | | |

On `tblLoans`, `disbursed_at` grouped by **Years** and **Quarters**, Values Sum of `principal`, 2026: Q1 **49 003 630 000**, Q2 52 477 100 000, Q3 **59 999 570 000**, Q4 852 760 000 — one day of October.

**Sheets** cannot group a date by right-click in every case: add a `month` column to the data first (`=EOMONTH(G2, -1)+1` or `=TEXT(G2, "yyyy-mm")`), or right-click a date row → *Create pivot date group*.

**When you use it.**
- Any time series in a pivot: disbursements by month, collections by quarter.
- Always tick **Years** together with Months — otherwise January 2025 and January 2026 fall into one "Jan".

> ⚠️ **Watch out.** Grouping works only when **every** value in the column is a real date. One text date and the Group command is greyed out — yesterday's `DATEVALUE` lesson, arriving as a symptom.

**Your turn.** You group `disbursed_at` by **Months only** (Years unticked). What does the "Jan" row hold?

### Slicers and timelines — filters the reader clicks

**What it is.** A **slicer** (*Срез*) is a panel of buttons that filters a pivot by one field. A **timeline** (*Временная шкала*) is a slider that filters by a date range: months, quarters or years. One slicer can drive several pivots at once — that is what makes a page a dashboard.

**How to write it.**

```text
Click a pivot
  → PivotTable Analyze
  → Insert Slicer
  → tick region → OK

Click a pivot
  → PivotTable Analyze
  → Insert Timeline
  → tick disbursed_at → OK

Right-click the slicer
  → Report Connections
  → tick every pivot it must filter

Clear: the funnel-with-a-cross icon
  in the slicer's corner
```

On the small table, the product pivot with a `region` slicer set to **Fergana**:

| product | Sum of outstanding |
|---|---|
| Micro | 5 |
| SME | 150 |
| **Grand Total** | **155** |

On `tblLoans`, the product pivot with the region slicer on **Fergana**: Grand Total **24 797 334 197**, of which SME 14 734 245 108. A timeline set to **Q3 2026** on the month pivot keeps 1 086 loans.

**Sheets:** Data → **Add a slicer**; it filters every pivot and chart on that sheet that uses the same range.

**When you use it.**
- A page several people read, each for their own region or product.
- Instead of copying a pivot once per region.

> ⚠️ **Watch out.** A page left filtered looks like the whole book. Put a check cell beside it — the pivot's Grand Total next to `=SUM(tblLoans[outstanding])` — so "not equal" shows that a slicer is on.

**Your turn.** One `region` slicer should filter both the product pivot and the month pivot on the page. What connects it to the second pivot?

### A calculated field — a ratio of sums

(Animated explanation)
A rate for a group: add first, then divide
- Micro's three loans on the small table. Each bar is one loan's share left, outstanding ÷ principal: 50 %, 62.5 %, 0 %.
- Average the three bars: 37.5 %. That is what *Average* of a rate column gives — every loan gets one vote.
- But the loans differ in size: principal 10, 8 and 6. Draw each bar as **wide** as its principal.
- Now level the bars like water: 10 ÷ 24 = 41.7 %, the ratio of sums. Each loan counts by its size.
- Guess first, then press the button on the next step.
- Press it: the wide grey bar pulls the ratio of sums down to 10 ÷ 48 = 20.8 %; the average stays at 37.5 %.
- A rate for a group — collected ÷ due, outstanding ÷ principal — is a ratio of sums. In a pivot that is a **calculated field**; *Average* of a rate column answers another question.

**What it is.** A **calculated field** (*Вычисляемое поле*) is a new Values field computed from the **sums** of other fields: `= outstanding / principal` is `SUM(outstanding) / SUM(principal)` per row of the pivot. That is a **ratio of sums** — the correct way to show a rate for a group.

**How to write it.**

```text
PivotTable Analyze
  → Fields, Items & Sets
  → Calculated Field
  Name:     share_left
  Formula:  = outstanding / principal
    field names; each one means
    "the SUM of this field in this row"
  → Add → OK, then format it 0.0%
    in Value Field Settings
```

On the small table, Rows `product`:

| product | Σ outstanding | Σ principal | calculated `share_left` (ratio of sums) | Average of per-loan ratios |
|---|---|---|---|---|
| Micro | 10 | 24 | **41.7 %** | 37.5 % (50 %, 62.5 %, 0 %) |
| SME | 450 | 600 | **75.0 %** | 75.0 % |
| Consumer | 40 | 50 | **80.0 %** | 80.0 % |

The Average of per-loan ratios weights a 6-million loan like a 10-million one. The ratio of sums weights each loan by its size.

On `tblLoans`, with Day 2's `rate` column: a calculated field `run_rate = outstanding * rate / 12` would multiply Σ outstanding by Σ rate (for SME, 781 loans × 0.26) — trillions, and no error. outstanding × rate has to be worked out loan by loan, so it belongs in a calculated **column** on `tblLoans`, `=[@outstanding]*[@rate]/12`; Sum of that column by product adds up to **4 491 202 901** soum of interest a month — the same as Day 2's `SUMPRODUCT`. **Sheets:** Values → Add → *Calculated field*.

**When you use it.**
- A rate for a group: collected ÷ due, outstanding ÷ principal, interest ÷ outstanding.
- Any time the sentence says "rate" or "share" of totals.

> ⚠️ **Watch out.** A calculated field sees **sums only** — there is no `COUNT` inside it. `avg_ticket = principal / loan_id` divides the sum of principal by the **sum of the ids**: on the small table, Micro gives 24 ÷ (2 + 4 + 6) = 2 instead of 8. No error appears. Use *Average of principal* in Values instead.

**Your turn.** On the small table, what does the calculated field `avg_ticket = principal / loan_id` show in the SME row (loans 1 and 3)?

### Pivot trap: double counting — know the grain

**What it is.** A pivot sums **every row** it is given. If the source has one row per **instalment** and carries the loan's `principal` on each, *Sum of principal* adds each loan once per instalment. This is the one-to-many join of week 2, inside a pivot.

**How to write it.** The picture — loan 1 joined to its three instalments:

| loan_id | installment_no | principal (copied from the loan) |
|---|---|---|
| 1 | 1 | 400 |
| 1 | 2 | 400 |
| 1 | 3 | 400 |

A pivot of this table: *Sum of principal* for loan 1 = **1 200**. The loan lent 400.

On the real data: `installments` joined to `loans` has 92 193 rows. Sum of `principal` over it is **9 981 530 850 000** — 24.7 times the **404 783 280 000** actually lent.

**When you use it.**
- Before every pivot, say the grain: *one row of the source = one …*.
- Loan-level sums come from `tblLoans`; instalment-level sums (`total_due`, `paid`) from the instalment table.

> ⚠️ **Watch out.** The tell is a Grand Total that is too big by a round-looking factor. Tie every Grand Total to a number you know: 7 828 loans, 208 723 504 430 outstanding, 404 783 280 000 lent.

**Your turn.** A pivot on yesterday's merge `installments_paid` + `tblLoans` shows **Count of loan_id = 92 193**. What is one row of that source?

### Pivot trap: (blank) labels and empty cells

**What it is.** An empty cell in the source shows up in a pivot in two ways. In **Rows** or **Columns** it becomes an item called **(blank)**. In **Values**, *Count of a field* skips it, so the count is lower than the number of rows.

**How to write it.** The picture — a source range taken as whole columns `A:G` includes the empty rows under the data:

| Rows: `product` | Sum of outstanding |
|---|---|
| Consumer | 40 |
| Micro | 10 |
| SME | 450 |
| **(blank)** | |
| **Grand Total** | **500** |

The `(blank)` row is the million empty rows under the six loans. A source that is a **Table** has no such row.

On `tblApplications`: *Count of application_id* = **14 000**, *Count of credit_score* = **13 612** — the 388 applications without a score are skipped. Count an **id** column for "how many rows".

**When you use it.**
- When a `(blank)` item appears: find the empty cells in the source, or filter `(blank)` out and say so.
- In a cross-tab: PivotTable Options → *For empty cells show* `0`, so an empty cell reads "none", not "unknown".

> ⚠️ **Watch out.** Filtering out `(blank)` hides the rows; it does not fix them. 388 applications without a score are a finding, not noise — count them in a note.

**Your turn.** On `tblApplications`, Rows `channel`, Values *Count of credit_score*. What is the Grand Total?

### Refresh, the pivot cache and formats that survive it

**What it is.** A pivot reads a snapshot of its source, the **pivot cache**, taken when it was built. New rows, changed values and a Power Query refresh do **not** appear until you **Refresh** the pivot. Formats set on pivot cells are lost on refresh; formats set in Value Field Settings are kept.

**How to write it.**

| Click | Does |
|---|---|
| Right-click the pivot → Refresh | one pivot |
| Data → Refresh All (Ctrl+Alt+F5) | every query, then every pivot |
| PivotTable Analyze → Change Data Source → tblLoans | build on the Table, never on A1:M7829 |
| Value Field Settings → Number Format → `#,##0` | the format that survives a refresh |

Picture: Friday's refresh adds 120 loans to `tblLoans`.

| Pivot source | After Refresh |
|---|---|
| `Loans!$A$1:$M$7829` (a fixed range) | still 7 828 loans — the new rows are outside the range |
| `tblLoans` (a Table) | 7 948 loans — the Table grew, the pivot follows |

The layout for a reader, set once: Design → Report Layout → **Tabular Form** and *Repeat All Item Labels*; **Subtotals** off; values **renamed** in place (*Sum of outstanding* → *Outstanding, UZS*); sorted by the main value; PivotTable Options → untick *Autofit column widths on update*. **Sheets:** pivots follow their source range by themselves — extend it to whole columns.

**When you use it.**
- After every data change: Refresh All, then read the Grand Total check.
- Before sharing: formats in Value Field Settings, layout in Tabular Form.

> ⚠️ **Watch out.** Refresh All refreshes queries and pivots, but a pivot built on a query's output may refresh **before** the query finishes. Press Refresh All twice, or untick *Enable background refresh* on the query.

**Your turn.** You formatted the pivot's cells as `#,##0` with Ctrl+1. After Refresh the numbers show as `208723504430` again. Where should the format go?

### GETPIVOTDATA — reading a pivot from a formula

**What it is.** **GETPIVOTDATA** (*ПОЛУЧИТЬ.ДАННЫЕ.СВОДНОЙ.ТАБЛИЦЫ*) returns one value of a pivot by **field and item names**, not by cell address. It keeps returning the right number after the pivot is sorted, filtered or moved.

**How to write it.**

| Formula | Gives |
|---|---|
| `=GETPIVOTDATA("outstanding", $A$20)` | data field, any cell of the pivot → the Grand Total |
| `=GETPIVOTDATA("outstanding", $A$20, "product", "Small business loan")` | + a field and an item → one cell |

Type `=` and click a value cell of the pivot: Excel writes the formula for you. On the small table's product pivot, `=GETPIVOTDATA("outstanding", $A$3, "product", "SME")` → **450**.

On `tblLoans`, the product pivot at `A20`: `=GETPIVOTDATA("outstanding", $A$20)` → **208 723 504 430**; with `"product", "Small business loan"` → **125 892 942 411**.

**When you use it.**
- Tiles above a page that must show what the pivot shows.
- A check cell: `=GETPIVOTDATA("outstanding", $A$20) = SUM(tblLoans[outstanding])` must say TRUE.

> ⚠️ **Watch out.** If a slicer filters the item out, GETPIVOTDATA returns `#REF!`. To get a plain `=B22` reference instead, turn it off: PivotTable Analyze → Options → untick *Generate GetPivotData*.

**Your turn.** Complete the tile: the outstanding of Auto loans, read from the pivot at `A20`.

### Which chart for which question

**What it is.** The chart type is decided by the **question**, not by taste. Most wrong charts are a wrong type for a right number.

**How to write it.** Select the pivot (a **PivotChart** stays linked and obeys slicers) or a summary range → Insert → **Recommended Charts** → pick. The choice:

| Question | Chart | Not |
|---|---|---|
| How do categories compare? (outstanding by product) | **bar** (long labels, sorted) or **column** (few, short labels) | pie — the eye cannot compare slices |
| How does something move over time? (disbursements by month) | **line** (many periods) or column (≤ 12) | bars with unsorted months |
| How is a total made up, per category? (buckets by product) | **stacked column**; **100 % stacked** when the mix matters more than the size | five pies |
| Part of a whole, 2–3 parts | pie or doughnut *allowed* | pie with 5+ slices, 3D pie |
| A ranking (top-5 branches) | horizontal **bar**, largest on top | columns with rotated labels |
| Two measures in different units over time | two charts, or a **combo** with both axes labelled | two lines on one axis |
| A trend inside a table row | **sparkline** | a chart per row |

On `tblLoans`, outstanding by product is a sorted bar: Small business loan on top at 125.9 bn, Micro loan at the bottom at 0.96 bn.

**When you use it.** Before you insert a chart, say the question in one sentence. The noun in it — *compare*, *over time*, *made up of*, *rank* — picks the row.

**Your turn.** Madina's page asks five questions. Drop each into the chart that answers it.

### Chart trap: the truncated axis

**What it is.** A bar's **length** is what the eye compares. If the value axis starts above zero, the lengths stop being proportional to the values, and a small gap looks huge. A **truncated axis** is allowed on a line (where the eye reads slope), never on bars or columns.

**How to write it.** The fix: right-click the value axis → Format Axis → Bounds → **Minimum = 0** (or *Auto*).

The picture — two branches, outstanding in bn:

| Branch | Value | Bar drawn from 0 | Bar drawn from 24 bn |
|---|---|---|---|
| Tashkent Central | 28.7 | ████████████████████████████ | ████▋ (4.7) |
| Samarkand Central | 24.7 | ████████████████████████▋ | ▋ (0.7) |

From 24 bn, Tashkent Central's bar is about **7 times** longer. Its outstanding (28 716 674 373) is only **16 %** larger than Samarkand Central's (24 655 889 676).

**When you use it.** Check the axis minimum on every bar and column chart before it leaves your desk.

**Your turn.** Find the setting that makes this chart lie.

### Chart trap: the pie with many slices

**What it is.** A pie asks the eye to compare **angles**, which it does badly. With more than three slices, or with slices under a few percent, the reader cannot rank them without the labels — and then the labels are doing the work a bar would do better.

**How to write it.** The fix: change the chart type to a **sorted bar** (right-click → Change Chart Type → Bar), or keep a pie only for 2–3 parts.

The picture — outstanding by product, as shares:

| product | share | as a pie slice | as a bar |
|---|---|---|---|
| Small business loan | 60.3 % | 217° | ██████████████████████████████ |
| Auto loan | 27.6 % | 99° | █████████████▊ |
| Consumer loan | 11.0 % | 40° | █████▌ |
| Buy now pay later | 0.5 % | 2° — invisible | ▎ |
| Micro loan | 0.5 % | 2° — invisible | ▎ |

**When you use it.** A pie is fine for two or three parts (*approved / rejected / cancelled*). Five products, eight regions or ten branches go on a bar.

> ⚠️ **Watch out.** A **3D pie** makes the front slice look bigger than an equal back slice. Never use 3D for any chart.

**Your turn.** You need the share of each of the **8 regions** in the book. Which chart?

### Chart trap: the dual axis

**What it is.** A **dual-axis** (combo) chart draws two measures with two different scales, one on the left axis and one on the right. Where the two lines cross depends only on how each axis was scaled, so the reader sees a "crossing" or a "gap" that the data does not contain.

**How to write it.** The fix: **two charts** side by side, or one measure in the chart and the other in the title. Keep a combo only for a measure and its own rate (loans and approval %), with both axes titled.

The picture — by product, two measures with different units:

| product | loans (left axis) | outstanding, bn (right axis) |
|---|---|---|
| Micro loan | 2 669 | 0.96 |
| Consumer loan | 2 418 | 23.1 |
| Buy now pay later | 1 569 | 1.1 |
| Small business loan | 781 | 125.9 |
| Auto loan | 391 | 57.7 |

On one combo, the count line falls and the money line climbs, and they cross near the middle. The crossing means nothing: change either axis's maximum and it moves. The fact is one sentence: *SME is 60 % of the book on 10 % of the loans.*

**When you use it.** Whenever you are tempted to add a secondary axis, ask: is this one fact or two? Two facts → two charts.

**Your turn.** Madina asks for loans **and** outstanding by month on one chart. What do you build?

### Building an honest chart — title, labels, sparklines

**What it is.** An **honest chart** cannot be misread. Its title states the finding, its axis starts at zero (for bars), its units are written, and nothing on it is decoration. A **sparkline** (*спарклайн*) is a tiny chart inside one cell: a trend in a table row.

**How to write it.**

```text
Chart Design → Add Chart Element
  → Data Labels / Axis Titles
Format Axis → Number → #,##0,,,
  (billions)
Format Axis → Bounds → Minimum 0
Click the legend → Delete
  (one series needs no legend)
Insert → Sparklines → Line
  → data range B5:K5
  → location L5
  → tick High Point, Low Point
Sparkline → Axis
  → Same for All Sparklines
  (otherwise each row has its own
  scale)

Sheets:
=SPARKLINE(B5:K5,{"charttype","column"})
```

The checklist, ten lines:

1. **Title = the finding**, with the number: *SME is 60 % of the book on 10 % of the loans.*
2. **Subtitle = the definition and the as-of**: *outstanding principal, bn UZS, as of 1 Oct 2026.*
3. **Axis from zero** for bars and columns.
4. **Units** on the axis or in the subtitle; data labels formatted (`125.9`, not `125892942411`).
5. **Sorted** by value, unless the order is natural (months, buckets, grades).
6. **One colour** for the series, **one highlight** for the point the title is about; red only for *bad*.
7. **No legend** for one series.
8. **No 3D**, no shadows, no gridlines you do not need.
9. **Partial periods** (October 2026, one day) dropped or marked.
10. **Source line**: *tblLoans · 7 828 loans · Nur Finance.*

**When you use it.** Every chart that leaves your desk. Sparklines when a table has one row per product and the reader needs the trend next to the number.

> ⚠️ **Watch out.** A chart title is static text. Under a slicer, *"SME is 60 %"* stays on the page while the bars show Fergana. Write titles that stay true under the slicer, or link the title to a cell: select the title, type `=Report!$H$1` in the formula bar, and build the sentence in `H1` with `TEXT`.

**Your turn.** Which title belongs on the outstanding-by-product bar?

### SQL → pivot, the translation table

**What it is.** Every pivot setting is a SQL clause from weeks 2–3. Keep this table open until the clicks are memory.

| SQL (weeks 2–3) | Pivot |
|---|---|
| `GROUP BY product` | `product` in **Rows** |
| `GROUP BY product, bucket` as a cross-tab | `product` in Rows, `bucket` in **Columns** |
| `SUM(outstanding)`, `COUNT(*)`, `AVG(principal)`, `MAX(dpd)` | the field in **Values**, summarised by Sum / Count / Average / Max |
| `WHERE status = 'active'` (fixed) | `status` in **Filters**, or a slicer |
| `WHERE disbursed_at >= … AND < …` | a **timeline** on `disbursed_at`, or Date Filters on the row field |
| `100.0 * SUM(x) / SUM(SUM(x)) OVER ()` | Show Values As → **% of Grand Total** |
| `SUM(x) / SUM(SUM(x)) OVER (PARTITION BY region)` | **% of Parent Row Total** |
| `SUM(SUM(x)) OVER (ORDER BY month)` | **Running Total In** month |
| `SUM(x) - LAG(SUM(x)) OVER (ORDER BY month)` | **Difference From** (previous) |
| `RANK() OVER (ORDER BY SUM(x) DESC)` | **Rank Largest to Smallest** |
| `ORDER BY SUM(x) DESC LIMIT 5` | sort + Value Filters → **Top 10** → 5 |
| `strftime('%Y-%m', d)` in `GROUP BY` | right-click the date field → **Group** → Months, Years |
| `SUM(a) / SUM(b)` | a **calculated field** `= a / b` |
| `HAVING COUNT(*) > 100` | Value Filters → Greater Than on the count |
| `COUNT(DISTINCT customer_id)` | tick *Add this data to the Data Model* when creating the pivot → **Distinct Count** |

What a pivot cannot do: a `JOIN` (merge first in Power Query, or add a lookup column to the data), and a window over *rows* rather than groups (`ROW_NUMBER` per loan). **Sheets** has `QUERY` for the shapes a pivot cannot make: `=QUERY(Loans!A1:M, "select D, sum(K), count(A) group by D order by sum(K) desc", 1)`.

**When you use it.** Every time you know the query and need the clicks.

**Your turn.** Which pivot answers `SELECT region, COUNT(*) FROM loans WHERE status = 'active' GROUP BY region HAVING COUNT(*) > 300`?

### Putting it together

One pivot, one slicer, one chart, from the tools above: *"For each product, what share of its loans is 90+ — and does it change by region?"*

| Part | Setting | Note |
|---|---|---|
| Source | tblLoans | (a Table, so Refresh picks up new rows) |
| Rows | product | GROUP BY product |
| Columns | bucket | the cross-tab |
| Values | loan_id — Count, left as numbers; then loan_id again — Count, Show Values As % of Row Total (Excel names it Count of loan_id2) | the numbers feed the check; the % copy is each product's loans spread over the buckets |
| Filters | status = (All) |   |
| Slicer | region, connected to this pivot only |   |
| Chart | 100 % stacked bar, 90+ in red, the rest grey; title linked to a cell |   |
| Check | `=GETPIVOTDATA("Count of loan_id", $A$3)` (the plain count) next to `=COUNTA(tblLoans[loan_id])` | → 7 828 = 7 828 |

Read the `90+` column: SME **3.7 %**, Consumer 3.2 %, Micro 2.8 %, BNPL 2.7 %, Auto 2.6 %. Click **Fergana** on the slicer and every share is recomputed for Fergana's loans; the check cell shows the Grand Total is no longer 7 828 — the page is filtered, and it says so.

**Put the steps of the page in order.**

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ PivotTables — [Pivot Table Excel | Step-by-Step Tutorial (Kevin Stratvert), 00:49](https://youtu.be/dvbLrwD2SpA?t=49&end=93)
- ▶ Slicers and pivot charts — [Pivot Table Excel | Step-by-Step Tutorial (Kevin Stratvert), 07:08](https://youtu.be/dvbLrwD2SpA?t=428&end=485)
- ▶ Charts — [Learn Excel in Under 3 Hours (Alex The Analyst), 35:57](https://youtu.be/zXnQNytHCPM?t=2157&end=2962)
- ▶ One-page dashboard (pivot tables + charts + timeline/slicers) — [How to Build Excel Interactive Dashboards (Kevin Stratvert), 00:52](https://youtu.be/MTlQvyNQ3PM?t=52&end=85)

- RU workbook `3.3 Pivot.xlsx` — sheets *Introduction*, *Building a Pivot table*, *Filtering*, *Calculations in Pivot Table*; the employee/store data shows the same Rows–Values–Filters mechanics.
- *Russian terms:* сводная таблица = PivotTable, срез = slicer, временная шкала = timeline, вычисляемое поле = calculated field, группировка по месяцам = group by months, % от родительской строки = % of parent row total, нарастающий итог = running total, гистограмма / линейчатая / график / комбинированная / с накоплением = column / bar / line / combo / stacked chart, спарклайн = sparkline, обновить = refresh.

---

## 2. Worked example — outstanding by product, the first quarter of the page (15 min)

**Ask:** outstanding and loans by product, with each one's share, as a bar chart with a finding title — the first quarter of Madina's page. Grain: one pivot row per product.

1. **A pivot on a Table.** Insert → PivotTable from `tblLoans` on a new sheet `Report`, placed at `A20` (rows 1–18 are reserved for the tiles and the first charts). The source is the Table, so Refresh will pick up new loans.
2. **Rows and Values.** Rows `product`; Values `outstanding` (Sum) and `loan_id` (**Summarize by** Count).
3. **Show Values As → % of Grand Total.** Drag `outstanding` and `loan_id` to Values a second time and show each as % of Grand Total.
4. **Formats that survive a refresh.** Value Field Settings → Number Format: `#,##0` and `0.0%`. Rename the headers in place (`Outstanding`, `Share`, `Loans`, `Loan share`). Sort: right-click a value → Sort → Largest to Smallest.

| product | outstanding | share | loans | loan share |
|---|---|---|---|---|
| Small business loan | 125 892 942 411 | 60.3 % | 781 | 10.0 % |
| Auto loan | 57 684 271 333 | 27.6 % | 391 | 5.0 % |
| Consumer loan | 23 054 933 316 | 11.0 % | 2 418 | 30.9 % |
| Buy now pay later | 1 135 251 000 | 0.5 % | 1 569 | 20.0 % |
| Micro loan | 956 106 370 | 0.5 % | 2 669 | 34.1 % |
| **Grand Total** | **208 723 504 430** | 100 % | 7 828 | 100 % |

5. **GETPIVOTDATA as the check.** In `H20`: `=GETPIVOTDATA("outstanding", $A$20) = SUM(tblLoans[outstanding])` must say TRUE. A pivot whose count says 92 193 was built on `Installments` — **double counting**.
6. **Which chart.** Select the pivot → Insert → PivotChart → **Bar**: five long labels, one measure, a comparison. The sort is already descending, so the largest is on top (Format Axis → *Categories in reverse order* if Excel flips it).
7. **An honest chart.** Delete the legend (one series); data labels in billions (`#,##0.0,,,` → `125.9`); axis title *outstanding, bn UZS*; all bars grey, the SME bar the brand colour. Title: **"SME is 60 % of the book on 10 % of the loans."** The loan share goes in the title, not on a second axis fighting for the same bars. Drag the chart to `A1:F18` later.
8. **A slicer.** Insert → Slicer on `region`, Report Connections → this pivot. Click **Fergana**: SME 14 734 245 108 (Day 2's P4 lookup), total 24 797 334 197. The chart and its labels follow; the title does not — titles are static text. Write titles that stay true under the slicer ("by product" is safe; "60 %" is not) or link the title to a cell (select the chart title, type `=Report!$H$1` in the formula bar, and build the sentence in `H1` with `TEXT`). Clear the slicer before you read the totals again — the check in `H20` turns FALSE while it is on.

Sheets: Insert → Pivot table on `Loans`, Rows `product`, Values `outstanding` (SUM) and `outstanding` *Show as % of grand total*, `loan_id` (COUNTA); sort by SUM of outstanding descending; Insert → Chart → Bar from the pivot range; Data → Add a slicer on `region`. The keyboard alternative, one cell:

```excel
=QUERY(Loans!A1:M, "select D, sum(K), count(A) where K > 0 or K = 0 group by D order by sum(K) desc label D 'product', sum(K) 'outstanding', count(A) 'loans'", 1)
```

and a share column beside it, `=B2/SUM(B$2:B$6)`. `QUERY` output is a plain range: a chart on it refreshes with the data, a slicer does not filter it — use the pivot when the page needs the slicer, `QUERY` when it needs a shape the pivot cannot make.

9. **Three charts that lie, from this very table** — the three **chart traps**. (a) A **pie** of the five shares: BNPL and Micro are two 0.5 % slivers nobody can see, and the reader cannot tell 27.6 from 11.0 without labels — if you need labels to read a pie, it should be a bar. (b) A **column chart with the axis from 50 bn**: SME's bar is 76 units tall and Auto's 8 — the eye says "ten times", the numbers say 2.2 times. (c) **Count and outstanding on two axes**: Micro's 2 669 loans tower over SME's 781 while SME's money towers over Micro's; the two lines cross and the board reads a story about a crossing that does not exist. Two facts, two charts — or one fact in the title.

---

## 3. Practice (50 min)

File `week-04/day-4/practice.xlsx`, sheet `Pivots` for P1–P11, sheet `Charts` for P12–P14. Build every pivot on `tblLoans` (or the `monthly_disbursements.csv` table where said), so Refresh works. Read the asked number off your pivot into the box under each question. The questions follow the order of Learn.

**P1.** *(Rows and Values · Summarize by: Average)* The worked-example pivot, plus **Average** of `principal` as a fifth value. Which product has the largest ticket, and why would "Average of outstanding" be the wrong number to show next to it? *In the box: the largest average ticket, in soum.*

**P2.** *(Columns and Filters)* The bucket × status cross-tab as a pivot (Rows `bucket`, Columns `status`, Values Count), then with `bucket` filtered to exclude `0`. Read off the 90+ column and the "closed" row. *In the box: how many default loans sit in 90+.*

**P3.** *(% of Parent Row Total)* Region → branch: Rows `region` then `branch`, Values Sum of `outstanding` twice, the second as **% of Parent Row Total**. What are Tashkent's three branches' shares of Tashkent, and what does the same column show on the region rows? *In the box: Tashkent Central's share of Tashkent, % with 1 decimal.*

**P4.** *(% of Grand Total · Top 10 filter)* Top-5 branches by outstanding: Rows `branch`, Value Filters → **Top 10** → Top 5 by Sum of outstanding, sorted descending; and the share of the book they carry (a formula on the pivot's total vs `SUM(tblLoans[outstanding])`). *In the box: the pivot's Grand Total with the Top-5 filter on.*

**P5.** *(grouping dates · Running Total · Difference From)* Disbursements by month of 2026: Rows `disbursed_at` grouped by **Months** and Years, Values Count of `loan_id`, Sum of `principal`, then the same sum as **Running Total In** disbursed_at and as **Difference From** (previous). Filter the year to 2026. *In the box: February's Difference From value (with its sign).*

**P6.** *(slicers and timelines)* Add a slicer on `product` and a timeline on `disbursed_at`, connected to the P5 and P4 pivots. Set the timeline to **Q3 2026** and the slicer to **Small business loan**. Count and amount? Then clear both. *In the box: the number of SME loans in Q3 2026.*

**P7.** *(a calculated field)* With Day 2's `rate` column on `tblLoans`, first try a calculated field `run_rate = outstanding * rate / 12` by product and see why its numbers are far too big. Then add `run_rate` as a calculated **column** on `tblLoans` (`=[@outstanding]*[@rate]/12`) and show Sum of `run_rate` by product. Last, try the calculated field `avg_ticket = principal / loan_id` — what happens, and what is the fix? *In the box: SME's Sum of run_rate from the column, in soum a month.*

**P8.** *(double counting)* Bring `principal` onto each instalment (a lookup from `tblLoans` in a new column of `tblInstallments`, or yesterday's merge), then pivot that table: Rows `product`, Values Sum of `principal`. Compare the SME row with the same pivot on `tblLoans`. *In the box: SME's principal as it should be, from `tblLoans`, in soum.*

**P9.** *((blank) labels and empty cells)* On `tblCustomers`: Rows `segment`, Values Count of `customer_id` and Count of `monthly_income`. Why do the two columns differ, and by how much in total? *In the box: Count of monthly_income in the `mass` row.*

**P10.** *(refresh and the pivot cache)* A colleague's pivot was built on `Loans!$A$1:$M$7829`. Friday's file adds 120 loans to `tblLoans`, and she presses Refresh All. *In the box: pick what the pivot shows, and the fix.*

**P11.** *(GETPIVOTDATA)* Six `GETPIVOTDATA` cells above the pivots: total outstanding, SME outstanding, loans in 90+, Tashkent Central outstanding, September 2026 principal, 2026 running total. Then sort a pivot differently — do the cells survive? *In the box: pick what happens.*

**P12.** *(which chart · an honest chart)* Four charts for Madina from your pivots: a sorted bar (outstanding by product), a line of monthly disbursements over all 34 months from `monthly_disbursements.csv` (pivot: month → Sum of amount) with a **3-month moving average** (Chart Design → Add Chart Element → Trendline → Moving Average, period 3), a stacked column of delinquent loans by product and bucket (dpd > 0), and a top-5 bar. Give each a finding title. *In the box: your four titles, one per line.*

**P13.** *(chart traps)* Timur sends four drafts for the page. (1) A column chart of the top-5 branches with the axis from 24 bn. (2) A pie of the 8 regions' outstanding. (3) A combo: loans by product as columns, outstanding by product as a line on a second axis. (4) A sorted bar of outstanding by product, from zero, with the title *SME is 60 % of the book on 10 % of the loans*. *In the box: tick every draft that misleads.*

**P14.** *(sparklines)* A pivot of `monthly_disbursements.csv` with products in Rows and the months January–September 2026 in Columns (Sum of amount), a sparkline per row with high and low points, same axis for all. Which product swings by the most money between its lowest and its highest month, and which looks volatile only because its axis is its own? *In the box: the product with the biggest swing in soum.*

**P15.** *(SQL → pivot)* Build this query as a pivot: `SELECT region, COUNT(*) FROM loans WHERE status = 'active' GROUP BY region HAVING COUNT(*) > 300`. *In the box: how many regions remain.*

> 🚀 **Stretch (optional, +5 XP).** **P16.** *(a calculated field on a merged query)* On yesterday's merged `installments_paid` query, a pivot with `due_month` in Rows, Sum of `total_due`, Sum of `paid`, and a **calculated field** `rate = paid / total_due` (as `0.0%`). Does it reproduce Day 3's Company corner table? Add a slicer on `product` (merge it in from `Loans` first) — which product collects worst in September? *In the box: the product that collects worst in September.*

### Mistakes that cost a point this week

- A pivot on a fixed range — new rows never arrive; build on the Table or the query (P10).
- Forgetting **Refresh** after a Power Query refresh — the pivot shows last week's cache.
- A pivot on an instalment-level table summing a loan-level column — every principal counted once per instalment (P8).
- *Average* in Values when the sentence says "rate" or "share" — a ratio of sums needs a calculated field or two sums and a formula.
- A pie with five products (the two 0.5 % slices are invisible) or a 3D column chart.
- A bar axis starting at 150 bn.
- A chart title that names the chart (*Outstanding by product*) instead of the finding.
- October's one-day bar in a monthly series without a note.
- Two unrelated measures on a dual axis so the lines cross dramatically — the crossing means nothing.
- A page left filtered by a slicer, with no visible check against the Table's total.

---

## 4. Homework

No new homework. **HW 4.2** (the cleaning pipeline) is due tomorrow with the checkpoint; the one-pager you build today is the draft of tomorrow's Part B — keep the file.

---

## 5. Self-check

---

## 6. Company corner <span class="badge company">The portfolio one-pager</span>

Week 3 Day 4 defined the **six tiles** on the first page of a lending dashboard and computed them from Timur's views. Today the same six, in Excel, on one sheet — the board's version of the dashboard, and the proof that the two agree.

```
1    Nur Finance — portfolio as of
     1 Oct 2026
     source · refreshed

3-4  OUTSTANDING        208.7 bn
5    principal due after as-of

3-4  DISBURSED MTD      0.85 bn · 21
5    1 day; Sep 17.0 bn / 361

3-4  PAR30              3.12 %
5    >30 DPD ÷ total

3-4  NPL90              2.55 %
5    >90 DPD, 234 loans

3-4  FPD30 Jul-26       1.09 %
5    4 of 367

3-4  COLLECTION Sep-26  94.1 %
5    paid by as-of ÷ due

8    ┌ bar: outstanding by product ┐
24   └─────────────────────────────┘

8    ┌ line: disbursements by month,
       3-mo avg ┐
24   └─────────────────────────────┘

26   ┌ stacked: late loans by
       product × bucket ┐
41   └─────────────────────────────┘

26   ┌ bar: top-5 branches + Others ┐
41   └─────────────────────────────┘

43   Findings — five sentences
49   Definitions — DPD · de-dup rule
     · as-of · October excluded · UZS
```

Sheet `OnePager`, landscape, fits on one printed page (Page Layout → Width 1 page). Layout, top to bottom: **row 1** title and as-of (`="Nur Finance — portfolio as of "&TEXT(Lookup!B17,"d mmm yyyy")`); **rows 3–6** the six tiles in a 6 × 1 strip (big number, small definition under it); **rows 8–24** four charts in a 2 × 2 grid (bar by product · line by month · stacked buckets · top-5 bar); **rows 26–30** a footnote with the definitions and sources; pivots on a separate `Data` sheet, referenced by `GETPIVOTDATA` or `SUMIFS`.

| # | Tile | Formula (on tblLoans / the clean queries) | Value |
|---|---|---|---|
| 1 | **Outstanding** | `=SUM(tblLoans[outstanding])` — or `GETPIVOTDATA` on the product pivot's total | **208 723 504 430** (3 409 loans with a balance) |
| 2 | **Disbursements MTD** | `=COUNTIFS(tblLoans[disbursed_at], ">="&DATE(2026,10,1))` / `SUMIFS` of principal | October: **21 / 852 760 000** (one day); show last full month beside it: September 361 / 17 015 490 000 |
| 3 | **PAR30** | `=SUMIFS(tblLoans[outstanding], tblLoans[dpd], ">30") / tile1` | 6 507 526 953 → **3.12 %** |
| 4 | **NPL90** | `=SUMIFS(tblLoans[outstanding], tblLoans[dpd], ">90") / tile1` | 5 319 475 527 → **2.55 %** (234 loans) |
| 5 | **FPD30, last mature vintage** | on `installments_paid` (Day 3 P13) + a `first_paid` column (`MINIFS` of `paid_at` per instalment, ≤ as-of) + the loan's disbursement month (`XLOOKUP` from tblLoans): flag = `paid < total_due` OR `first_paid > due_date + 30`, for `installment_no = 1`; pivot by vintage month: Sum of flag / Count | July 2026: **4 of 367 = 1.09 %** (June 3/373 = 0.80 %, May 7/377 = 1.86 %; August has only 11 of 358 first instalments mature — not readable) |
| 6 | **Collection rate** | Day 3's Company corner pivot, September row | **94.1 %** (15 982 118 926 / 16 987 977 718) |

Tile 5 is the only one that needs three tables (installments, payments, loans); it is also the one a board member will ask about, so its definition line is the longest: *first instalment not fully paid, or first payment more than 30 days late; payments through 2026-10-01; vintage = month of disbursement; shown for the newest vintage whose first due dates are all ≥ 30 days old.* The other five fit in half a line each.

**Chart choice, with reasons** (the sentence you say if asked "why not a pie?"):

1. **Outstanding by product — horizontal bar, sorted.** Five categories with long names, one measure; the board compares lengths. A pie would hide the two 0.5 % products and invite "why is the pie not labelled". Title: *SME is 60 % of the book on 10 % of the loans.*
2. **Disbursements by month — line, 34 points, with a 3-month moving average.** Time on the x-axis is a line's job; the moving average is the trend and the monthly line is the noise. October is excluded (one day) and the exclusion is in the footnote. Secondary axis for the loan *count* only if the board asked for it; otherwise the count goes in a sparkline in the tile strip. Title: *From 4 bn to a 20 bn month in 33 months; 2026 has already out-lent 2025.*
3. **Delinquent loans by product and bucket — stacked column (dpd > 0 only).** Composition within a category; 90+ in red, the others in three greys. Showing bucket 0 would make the stack 7 429 tall and the rest invisible. Title: *Most late loans are Consumer and Micro; most late money is SME* (the money version is a second stacked column of outstanding, if there is room).
4. **Top-5 branches — horizontal bar.** A ranking; largest on top; the other five branches summed as *Others* so the bars add to the book. Title: *Three Tashkent branches, Fergana and Samarkand hold 63 % of outstanding.*

**Reading the page together** (the five sentences under the charts, Bekzod's script): the book is 208.7 bn and grows about 7 bn a month while 12–22 bn is disbursed monthly — short Micro/BNPL/Consumer terms repay fast; SME is 60 % of outstanding on 10 % of loans, so SME credit decisions drive the balance sheet; PAR30 3.1 % and NPL90 2.6 % are close, so the at-risk book is old debt (5.3 of 6.5 bn already 90+), not a new wave; FPD30 1.1 % on the July vintage is in line with the 1.28 % history; the September collection rate of 94.1 % means 5.9 % of what fell due is the inflow to the 1–30 bucket — Sevara's caseload next month.

Then the agreement check with Timur: six tiles, six view queries from week 3, six equal numbers. If one differs, the definition differs — find the word that is different (as-of, de-duplicated, due-in-month) before anyone touches a formula.

> 🎯 **Interview version.** *"Put a lending portfolio on one page."* — Six tiles (outstanding, disbursements MTD + last full month, PAR30, NPL90, FPD30 of the last mature vintage, collection rate), each with its definition and as-of; four charts chosen by question (bar for categories, line + moving average for time, stacked for composition, bar for ranking), titles that state the finding, bars from zero; pivots on a data sheet, slicers connected, everything refreshable; and the numbers reconciled to the warehouse views.

**Say it like in an interview.** A board member, on Monday: *"Why is the product mix a bar chart? Pies are clearer for shares."* Answer her in 30 words or more.

Tomorrow: the checkpoint — clean both dirty files, build the page on the clean data, write the five findings, answer eight questions.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 4 · Day 5 — Checkpoint: cleaned dataset + one-page report (weeks/week-04/day-5.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-04/day-5
=====

# Week 4 · Day 5 — Checkpoint: cleaned dataset + one-page report

<span class="badge">Part A 60 min</span> <span class="badge">Part B 90 min</span> <span class="badge">Interview 30 min</span> <span class="badge hw">Checkpoint · 100 points</span>

> STORY **Friday, 9:00.** Madina, with Nilufar's two CSVs on a USB stick and Monday's agenda. *"Here is Monday's export, as it comes: dirty. By 15:00 I want **one workbook**: the two files cleaned by a pipeline I can refresh, and the board page built on the clean data — pivots, three charts, the six tiles, and five sentences I can read aloud. Then eight questions, because Bekzod's team is interviewing an Excel analyst next week and you are on the panel."*

## Today in 3 lines

- **Part A (40 pts):** `customers_dirty.csv` and `payments_dirty.csv` → clean sheets through a **Power Query** (or Sheets formula) pipeline, counts matching the known numbers, with a change log.
- **Part B (40 pts):** the **one-page board report** on the clean data — pivots, three charts, six tiles, a five-sentence findings note.
- **Part C (20 pts):** **eight interview questions** on the week, answered in writing as you would say them aloud.

**Before you start**

- **Files.** `data/excel/customers_dirty.csv`, `payments_dirty.csv`, `installments.csv` and `monthly_disbursements.csv` — press **⬇ Download** next to each and save them in one fresh folder (Power Query reads them from there). Plus `tblLoans` from `data/excel/nur_week4_start.xlsx`.
- **One workbook.** Build everything in a new file, `checkpoint.xlsx`, with these sheets: `Raw_Customers`, `Raw_Payments` (untouched) · `customers_clean`, `payments_clean`, `installments_paid` · `Data` (the pivots) · `OnePager` · `Checks`.
- **As-of date.** 2026-10-01 everywhere; a cell on `OnePager` says so.
- **Google Sheets.** One spreadsheet with the same tabs, exported to `.xlsx`, **and** the share link in `README.md`. Formulas stay visible in the export.

**Rules**

- **Open book:** your pages, your files, the workbook. **Closed:** the model-answer folds, until you submit. The Part C boxes show their model only after you have written your own answer.
- **Raw stays raw.** Every clean table ends in a check cell against a number you know.
- **Every tile** has a one-line definition under it. **Every chart title** is a finding.
- **Count rows** after every merge. **Refresh All** before you save — if a number changes, something was pasted.

**Hand in** (the 📎 box at the end of this page): `checkpoint.xlsx`, `change_log.md` (ten lines with counts), `findings.md` (the five sentences), `interview.md` (the definitions note + eight answers). **Also due today:** HW 4.2, through the 📎 box on the Day 3 page.

**Done today** when all five are true:

1. The `Checks` sheet is all TRUE after Refresh All.
2. The key-number boxes K1–K3 above the hand-in are ✓.
3. The eight Part C boxes are written.
4. The four files are handed in.
5. The day quiz is passed.

> 💡 **Key idea.** The checkpoint is graded on whether the numbers **survive a refresh**, not on whether they are right once. A typed number that matches today still loses its point, because the reviewer presses Refresh All on a changed file.

**Time plan** (the reviewer's, as a suggestion):

| When | What | Deliverable |
|---|---|---|
| 9:00–9:15 | copy the CSVs into a fresh folder, open a new workbook, load `installments.csv` and the two dirty files as queries | the `Source` steps |
| 9:15–10:00 | Part A — `customers_clean`, `payments_clean`, `installments_paid`, the `Checks` sheet | counts TRUE |
| 10:00–10:15 | `change_log.md`, ten lines, while the steps are fresh | the log |
| 10:15–11:45 | Part B — six pivots on `Data`, tiles, three charts, slicer, layout | `OnePager` |
| 11:45–12:00 | Refresh All, re-check, `findings.md` | five sentences |
| 13:00–13:30 | Part C | `interview.md` |
| 13:30–14:00 | reread the rubric, fix titles and formats, hand in (box below) | the folder |

**Known numbers** — everything you can check against, on one card (all as of 2026-10-01):

| Thing | Number |
|---|---|
| customers: raw rows → clean rows; duplicate rule; invalid birth dates | 6 040 → **6 000**; phone + birth_date; **7** (ids 927, 957, 964, 1020, 2338, 2934, 3380) |
| payments: raw → clean; Σ raw → Σ clean; duplicates removed and their Σ | 52 875 → **52 850**; 255 173 169 976 → **255 114 772 176**; 25 · 58 397 800 |
| methods: raw distinct → clean distinct; dirty rows | 10 → **5**; **180** |
| clean method counts | card 17 612 · payme 8 897 · cash 8 788 · click 8 786 · transfer 8 767 |
| forward-dated payments | 24 · 53 438 947 |
| instalments; matured; matured not fully paid | 92 193; 54 207; **1 784** |
| loans; active; with a balance; dpd > 0 | 7 828; 3 352; 3 409; 399 |
| buckets 0 / 1-30 / 31-60 / 61-90 / 90+ | 7 429 / 124 / 25 / 16 / 234 |
| outstanding; PAR30; NPL90 | **208 723 504 430**; 6 507 526 953 = **3.12 %**; 5 319 475 527 = **2.55 %** |
| outstanding by product | SME 125 892 942 411 (60.3 %) · Auto 57 684 271 333 (27.6) · Consumer 23 054 933 316 (11.0) · BNPL 1 135 251 000 (0.5) · Micro 956 106 370 (0.5) |
| disbursements 2026 (through as-of); September; October | 3 051 / 162 333 060 000; 361 / 17 015 490 000; 21 / 852 760 000 |
| top-5 branches | Tashkent Central 28.72 bn · Tashkent South 26.79 · Tashkent North 26.18 · Fergana Central 24.80 · Samarkand Central 24.66 = 62.8 % |
| FPD30 by vintage (first instalment) | May 7/377 = 1.86 % · Jun 3/373 = 0.80 % · **Jul 4/367 = 1.09 %** · Aug not mature |
| collection rate (instalment basis, paid by as-of) | Jun 96.9 · Jul 96.7 · Aug 96.5 · **Sep 94.1 %** (15 982 118 926 / 16 987 977 718) |

**Common mistakes from this week** (each costs the number point):

- Remove Duplicates on the raw names — 24 removed, not 40.
- The two namesakes deleted — 5 998 rows instead of 6 000.
- A pivot on a fixed range instead of a Table or query.
- `Average` where a ratio of sums was meant.
- October's one day plotted as a month.
- A `#N/A` hidden with `IFERROR(…, 0)` and then summed.
- Tiles typed as numbers.
- A dual axis nobody asked for.
- Calculation left on **Manual** (Formulas → Calculation Options): cells stop updating and every check looks fine. F9 recalculates once; set it back to *Automatic* before you check anything. A *circular reference* warning means a formula reads its own cell — find it under Formulas → Error Checking.

---

## Part A — The cleaning pipeline (60 min, 40 pts)

**Deliver.** Two clean tables built by a recorded pipeline — `customers_clean` (A1) and `payments_clean` with `installments_paid` (A2) — and `change_log.md`.

**Graded on.** Twenty points per file: 8 for the row and value counts, 6 for a recorded, refreshable pipeline (the reviewer presses Refresh All on a copy of the CSVs), 6 for the change-log lines that explain each step with its count.

| Criterion | customers_clean | payments_clean | Points |
|---|---|---|---|
| rows | 6 000 | 52 850 | 2 + 2 |
| the four data problems handled | 40 duplicates on phone + birth_date; 7 dates flagged and blanked | 25 duplicates on three columns; 180 method rows → 5 values | 3 + 3 |
| nothing destroyed | 2 namesakes kept; income blanks kept as null (354 after the dedup); raw sheets untouched | 24 forward-dated rows kept and flagged; raw untouched | 3 + 3 |
| recorded and refreshable | Applied Steps renamed; Refresh All reproduces | same; `installments_paid` merge keeps 92 193 rows | 6 + 6 |
| change log | one line per change, with counts and money | | 6 (shared) |

**Sheets route** (same points). a `Raw_*` tab per CSV imported untouched; a `*_clean` tab built entirely by formulas — `=ARRAYFORMULA(PROPER(TRIM(Raw_Customers!B2:B)))`, a key column, `=UNIQUE(FILTER(…))` or `SORTN(range, 9^9, 2, key_col, TRUE)` (the *remove duplicates* mode of `SORTN`) for the dedup, `IF(OR(E2>DATE(2026,10,1), E2<DATE(1920,1,1)), TRUE, FALSE)` for the flag; the `Checks` tab the same as Excel's. Re-import the CSV over the raw tab to "refresh". State in `change_log.md` that the pipeline is formula-based.

**The step map.** Every hand tool from Day 3 has a recorded equivalent. The checkpoint wants the right-hand column.

| You discovered it with | You deliver it as |
|---|---|
| `TRIM`, `PROPER` in a helper column | Transform → Format → Trim, Capitalize Each Word |
| Ctrl+H `bank transfer` → `transfer` | Replace Values (match entire cell) |
| key + `COUNTIFS` > 1 | Remove Duplicates on the key columns, after a Sort |
| `age` column, filter < 18 or > 100 | Custom column flag + Conditional column blanking the date |
| Text to Columns on a datetime | Split Column → By Delimiter, or Changed Type → Date |
| `SUMIFS` per instalment over payments | Group By (Sum, Min) + Merge Queries (Left Outer) |
| a second file pasted under the first | Append Queries |
| "I did it again on Monday" | Refresh All |

> ⚠️ **Watch out.** Remove Duplicates keeps the **first** row it meets. Sort `customers` by `registered_at` ascending (and `payments` by `payment_id`) *before* the step, or the original is deleted and the later copy survives — the model checks catch it as ids above 6 000.

### A1. `customers_clean` (20 pts)

**Deliver.** 6 000 rows; `first_name`, `last_name` trimmed and capitalised; duplicates removed on `phone` + `birth_date`, keeping the row with the earlier `registered_at`; `birth_date_invalid` (TRUE for 7); `birth_date_clean` (blank for those 7); `age` as of 2026-10-01 from `birth_date_clean`; `monthly_income` numeric with blanks kept as null.

### A2. `payments_clean` (20 pts)

**Deliver.** 52 850 rows; `method` in five values (`card`, `cash`, `transfer`, `payme`, `click`); duplicates removed on `installment_id` + `paid_at` + `amount`, keeping the lower `payment_id`; `is_forward_dated` TRUE for the 24 rows after 2026-10-01 (kept); and `installments_paid` = `installments.csv` merged with the per-instalment sum of clean payments through the as-of date.

---

## Part B — The one-page board report (90 min, 40 pts)

**Deliver.** The `Data` sheet with the pivots, the `OnePager` sheet (six tiles, three charts, a slicer, the definitions footnote) and `findings.md`.

**Graded on.** Tiles 12 (2 each: the right number **and** a definition line) · charts 12 (4 each: right type, honest axes, a finding title) · pivots and refreshability 8 (built on the clean tables, slicer connected, Refresh All leaves the page unchanged) · findings note 8 (five sentences, each with a number and a *so what*).

**Build on** `customers_clean` / `payments_clean` / `installments_paid` / `tblLoans` — the Loans sheet is already clean (it was built from the de-duplicated payments), which the note should say.

| Element | Must have | Points |
|---|---|---|
| Tile 1 Outstanding | 208 723 504 430 from a formula / `GETPIVOTDATA`; definition line | 2 |
| Tile 2 Disbursements MTD | 21 / 852 760 000 with "1 day" and September beside it | 2 |
| Tile 3 PAR30 | 3.12 %, `SUMIFS(dpd > 30) / total` | 2 |
| Tile 4 NPL90 | 2.55 %, 234 loans | 2 |
| Tile 5 FPD30 | 1.09 % for July 2026, with the vintage named and the maturity rule | 2 |
| Tile 6 Collection rate | 94.1 % for September, basis stated | 2 |
| Chart 1 by product | bar, sorted, from zero, finding title | 4 |
| Chart 2 by month | line (or column), October excluded or marked, trend, finding title | 4 |
| Chart 3 buckets or top-5 | stacked column (dpd > 0) **or** top-5 bar + Others; finding title | 4 |
| Pivots and refresh | on Tables / queries; slicer connected; Refresh All changes nothing; a Checks block | 8 |
| Findings note | five sentences, each with a number and a consequence | 8 |

**Sheets route.** Pivots from Insert → Pivot table on the clean tabs (`Show as % of grand total` where needed; a `due_month` column added to `installments_paid` by formula since Sheets pivots do not group dates); `QUERY` for the top-5 (`order by sum(K) desc limit 5`); charts from the pivot ranges; Data → Add a slicer on `region`; tiles with `GETPIVOTDATA` or `SUMIFS`; `=SPARKLINE()` under the tiles. Set the sheet to landscape in File → Print, and export the one page to PDF as a second deliverable.

> 💡 **Key idea.** Every tile needs two things to score: the right number **from a formula**, and a one-line definition under it. A tile that says *n/a* with a correct definition keeps half its points; a right number with no definition keeps none.

**Building order** — so a half-finished page is still a page:

1. `Data` sheet: the product pivot and the bucket pivot (both on `tblLoans`) — ten minutes, and tiles 1, 3, 4 already have their numbers.
2. `OnePager`: title, as-of, the six tile labels and definition lines; fill tiles 1–4 by `SUMIFS` / `GETPIVOTDATA`.
3. The three charts from the two pivots plus `monthly_disbursements.csv` as a query; titles last.
4. The collection pivot on `installments_paid` → tile 6. The FPD30 pivot → tile 5 (the longest step; if time runs out, write the definition and *n/a — see A2* in the tile and lose 2 points, not 20).
5. Slicer, Report Connections, the Checks block, Refresh All, print preview.
6. `findings.md` from the finished page — the sentences describe what is on it, not what you meant to build.

**If you are stuck:**

| Symptom | Likely cause | Fix |
|---|---|---|
| Group by Months greyed out | a text date in the column | Changed Type → Date in the query; look for a blank or `1900-01-01` |
| pivot shows 92 193 rows' worth | wrong source table | rebuild on `tblLoans` |
| `#N/A` in the FPD30 vintage lookup | `loan_id` typed as text on one side | Changed Type → Whole Number on both |
| Refresh All asks for the file | the CSV moved | Data → Data Source Settings → Change Source |
| tile shows `#REF!` after a slicer click | the item is filtered out | expected — clear the slicer; or `IFERROR(…, "filtered")` for *this* case only |
| chart ignores the slicer | not connected | right-click slicer → Report Connections |
| `payments_clean` is 52 875 after refresh | Remove Duplicates on all columns | select the three key columns before the step |
| `customers_clean` has ids above 6 000 | no Sort before Remove Duplicates | sort `registered_at` ascending first |

---

## Part C — Eight interview questions (30 min, 20 pts)

**How to answer.** Write 3–5 sentences per question, as you would say them aloud, in the box under it. The box saves as you go; **Compare** shows the model answer once you have written at least 30 words. Then paste the definitions note and all eight answers into `interview.md` (📎 box).

**Graded on.** 2 points per question (1 for correct and complete, 1 for a Nur Finance example with a number) plus 4 for the "definitions I used" note at the top of `interview.md` (as-of, DPD, the dedup rule, the collection-rate basis, FPD30).

**Q1.** VLOOKUP vs INDEX/MATCH vs XLOOKUP — when do you use which, and what are VLOOKUP's traps?

**Q2.** When is an **approximate-match** lookup the right tool? Give the example you built.

**Q3.** Why can **Remove Duplicates** lie, in both directions? How do you de-duplicate safely in Excel?

**Q4.** **Power Query vs formulas** — when do you clean with each?

**Q5.** In a pivot, what does **% of Parent Row Total** do, and how is it different from % of Grand Total?

**Q6.** **Line vs bar chart** — how do you choose, and name two ways a chart can lie.

**Q7.** What do **absolute references** do, and where did you need them this week?

**Q8.** How do you make an Excel report **refreshable**, and what do you check after a refresh?

---

**Follow-ups a panel asks** (one sentence each is enough; practise them aloud):

- *"Your XLOOKUP returns #N/A for a product that is clearly in the table."* — A trailing space or a number stored as text on one side; `TRIM` / `VALUE` the key, and check with `LEN` and `ISNUMBER`.
- *"Why did Remove Duplicates say 24 when you expected 40?"* — Case-insensitive but space-sensitive, on the raw names; 18 trailing-space rows survived.
- *"The pivot total is 92 193 instead of 7 828."* — Built on the instalments table, or on a merged query that multiplied; the grain is wrong, not the sum.
- *"Can I have the average rate per product?"* — As a ratio of sums, yes (calculated field); an average of per-loan rates weights a 500 000 Micro loan like a 599 m SME loan — say which one you are giving.
- *"The line chart shows a 95 % crash in October."* — One day of data plotted as a month; exclude or mark partial periods.
- *"The board wants the file by email."* — Values only is the wrong answer; send the workbook with the queries, or a PDF of the page plus the workbook; never a copy with typed numbers.
- *"Finance says the collection rate is 96 %."* — Cash basis (received in the month ÷ due in the month) versus instalment basis (paid on the month's instalments); 96.2 % versus 94.1 %; both right, name the basis.

---

## What the reviewer runs

On a copy of your workbook, with the four CSVs in `data/excel/`:

1. **Refresh All.** Row counts of `customers_clean`, `payments_clean`, `installments_paid` after refresh: 6 000 · 52 850 · 92 193. A count that changes means a pasted value somewhere.
2. **The Checks sheet**: every cell TRUE.
3. **Duplicate the last line of `payments_dirty.csv`** and refresh: `payments_clean` must stay 52 850.
4. **Clear every slicer**, read the six tiles, compare with the table above; then set the slicer to one region and confirm the tiles that should move (charts) do and the ones that should not (the as-of, the definitions) do not.
5. Press **Ctrl + `** (the key left of 1) on `OnePager` to show formulas: every number is a formula.
6. **Print preview**: one page, landscape, readable at A4.
7. Read `findings.md` aloud: five sentences, five numbers, five consequences; `change_log.md`: ten changes with counts.
8. `interview.md`: the definitions note first, then eight answers with a Nur Finance number each.

---

## Scoring and what happens next

| Part | Points | Pass |
|---|---|---|
| A — cleaning pipeline, 2 files × 20 | 40 | |
| B — one-pager: tiles 12 + charts 12 + refreshability 8 + findings 8 | 40 | |
| C — 8 questions × 2 + definitions note | 20 | |
| **Total** | **100** | **≥ 70 → on to Week 5** |

Partial credit rules, so you know what to drop when time runs out:

- A tile with the right definition line and *n/a* loses 1 of its 2 points; a wrong number with no definition loses both.
- A chart with an honest axis and a descriptive (not finding) title loses 1 of 4; a pie or a truncated bar axis loses all 4.
- A pipeline that refreshes but misses one rule (e.g. the namesakes deleted) loses the 3 "nothing destroyed" points, not the 6 refreshability points.
- A change log with the right changes but no counts scores half.

Below 70: feedback names the parts to redo (most often A1's duplicate rule and B's FPD30 tile); re-submit before Week 5 starts. Points go to the [Progress page](progress.md).

**Hand-in checklist** (the 📎 box below): `checkpoint.xlsx` (raw sheets untouched; `customers_clean`, `payments_clean`, `installments_paid`; `Data`; `OnePager`; `Checks`), `change_log.md` (ten lines with counts), `findings.md` (five sentences), `interview.md` (definitions note + 8 answers); Sheets users add `README.md` with the link. Also due today: **HW 4.2**, on the Day 3 page.

> 🚀 **Stretch (optional, +5 XP).** Add week 3's **month-end outstanding** series to the page: on `installments_paid`, a column `disbursed` (the loan's date via `XLOOKUP`), then for each month-end `SUMIFS(principal_due, due_date >= next month, disbursed < next month)` — a `SEQUENCE` of 2026 month-starts drives it; September 208 243 879 623, June 184 617 414 010. Plot it as the sparkline under the Outstanding tile, and explain in the footnote why 208.2 bn (month-end) and 208.7 bn (as-of) are both right. *In the box: your August 2026 month-end value.*

**What Week 5 takes from today.** Next week's pandas labs reload exactly these files — `customers_dirty.csv`, `payments_dirty.csv`, `installments.csv`, `loans_status.csv` — and redo A1, A2 and the six tiles in a notebook: `str.strip().str.title()`, `drop_duplicates(subset=["phone", "birth_date"])`, `merge(how="left")`, `groupby`, `pivot_table`. Keep your `change_log.md`: the notebook's first markdown cell is the same ten lines, and the comparison "which tool was faster to redo" is the week's closing question. The numbers must not move — 6 000 · 52 850 · 208 723 504 430 · 94.1 % — only the tool does.

Madina, 17:30: *"Bekzod has his page and refreshed it himself. Nilufar's age bands no longer have a five-year-old. Timur pointed his dashboard and your workbook at the same definitions and the six numbers agree to the soum. Next week is Python — the same book, in pandas, and we will see whether the notebook or the workbook is faster to redo."*

---

### Check your key numbers before you hand in

Three numbers that are not on the known-numbers card — read them off your own `checkpoint.xlsx`. All three ✓ means the pipeline and the page agree with each other.

**K1.** On `Data`, the *Others* bar beside the top-5 branches: `SUM(tblLoans[outstanding])` minus the Top-5 pivot's total.

**K2.** In `customers_clean`: the average `age` of the rows with a valid birth date, 1 decimal.

**K3.** In `installments_paid`: matured instalments (`due_date` ≤ 2026-10-01) that are **partly** paid — `paid` above 0 but below `total_due`.

### 📎 Hand in here

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 4 · Day 6 — Section exam: Excel (Week 4) (weeks/week-04/day-6.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-04/day-6
=====

# Week 4 · Day 6 — Section exam: Excel (Week 4)

<span class="badge">Exam 60 min</span> <span class="badge">Interview 45 min</span> <span class="badge hw">Exam · 100 points</span>

> STORY **Exam day, 10:00.** Bekzod's team is hiring an Excel analyst, and Madina has put you on the panel and in the candidate's chair at the same time. *"A week of Excel is behind you,"* she says. *"Show me that it holds: a written check, then an interview, the way a lender would run it. SQL comes back too. You use both every day, and nobody asks which tool a question belongs to."*

## Today in 3 lines

- You show that you work in Excel and Google Sheets the way an analyst does: formulas on Tables, lookups, cleaning, pivots and honest charts.
- **Part A (40 points):** 25 quick questions, about two thirds Excel and a third SQL, with the classic traps inside. It is marked on the spot.
- **Part B (60 points):** an interview — five questions you answer in words and three small tasks on the Week 4 files. Your mentor reads it.

---

## 1. How the exam works

- **Two parts.** Part A is a quiz: 25 questions, 40 points, marked at once. Part B is an interview: eight written answers, 60 points, marked by your mentor.
- **Pass mark.** You need 70 of 100 points. In Part A, 80 % right (20 of 25) counts as done. You can repeat Part A as often as you like, and your best attempt counts.
- **What it covers.** Week 4, Excel and Google Sheets, is the main part. About a third of the questions come from SQL (Day 0 and Weeks 1–3), because an analyst moves between the two every day.
- **Open book.** The course pages, your own notes, your workbook and the [SQL playground](playground.md) are allowed. Chatbots and asking other people are not. A real interview works the same way: you may bring notes, but nobody answers for you.
- **Time.** Plan 60 minutes for Part A and 45 minutes for Part B.
- **Deadline.** Part B is due at 23:59 on the day of Week 5 · Day 1 (the menu shows the date). Part A can be taken any time before that.
- **After the exam.** Your mentor reviews Part B and sends structured feedback.

---

## 2. Part A — Quick check (40 points)

25 questions in one quiz. Some have one right answer, some have several, some ask for a number or a word. Formulas are shown as you would type them in Excel; Google Sheets reads them the same way. A few SQL questions say *run it*: use the [SQL playground](playground.md). After each answer the quiz tells you why. First comes Excel (Week 4), then SQL (Day 0 and Weeks 1–3).

---

## 3. Part B — Interview (60 points)

Eight written answers. Write them as you would say them aloud to a hiring manager.

- **I1–I5 are interview questions.** Answer in 4–6 sentences and use one example from Nur Finance.
- **I6–I8 are small tasks on the Week 4 files** (`data/excel/`: `nur_week4_start.xlsx` or the CSVs; Google Sheets: import the CSVs). Write the formulas as text, give the numbers you get and one sentence. Every number is as of 2026-10-01.
- Write in your own words. Short and exact beats long.

### 📎 Hand in here

---

## 4. Scoring and what happens next

| Part | Points | Marked by |
|---|---|---|
| A — Quick check | 40 | automatic, your best attempt |
| B — Interview | 60 | your mentor |
| **Total** | **100** | **70 or more passes** |

A pass closes the Excel block: you have shown that you can build, check and explain a spreadsheet analysis. Below 70, the feedback names the topics to repeat, and you and your mentor decide when to try Part B again.

Your feedback arrives on the **[My feedback](feedback.md)** page and in the course bot. Your points go to the [Progress page](progress.md).


=====
PAGE: Week 5 · Day 1 — Python from zero: the notebook is your lab (weeks/week-05/day-1.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-05/day-1
=====

# Week 5 · Day 1 — Python from zero: the notebook is your lab

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 5.1 (due Day 3)</span> <span class="badge company">Company corner</span>

> STORY **Monday, 9:00.** A new face at Madina's desk: Jasur, the data scientist (*дата-сайентист*) who builds the scorecard. *"Welcome to the half of the building that does not use a mouse. Everything you did in weeks 1–4 I do in Python — the same joins, the same buckets — but it runs every morning at 6:00 without me, and the next step is the model. Before pandas, prove you can **think in loops**: compute the approval rate by channel with plain Python from `applications.csv`. No library that does it for you. If you can do it with a `for`, you will understand what pandas is doing when it does it for you."* Madina: *"And get the tools running today; tomorrow the data arrives."*

## Today in 3 lines

- Why analysts write Python: the analysis is a **file that re-runs** (repeatable), it scales from 7 828 rows to 70 million without changing (scalable), it is free and it is the language of the next steps (models, automation, Power BI's Python visuals).
- You run Python **right on this page** (▶ Run under every code block), meet **Jupyter** — where the homework notebook lives — and learn the language's grammar: types, lists, dicts, `if`/`for`/`while`, functions, f-strings, modules, reading a CSV with `csv`, list comprehensions, reading a traceback.
- You have Jasur's approval rate by channel in loops (**58.2 / 63.7 / 61.9 %**, the week-2 and week-4 numbers) and the start of HW 5.1 — eight functions that must pass their asserts in `data/python/day1_starter.ipynb`.

---

## 1. Learn — the language, one notebook cell at a time

Every concept below has the same five parts: what it is, how to write it (a box you can run), when you use it, the trap, and a small task. Run the boxes from top to bottom — later boxes use the names earlier boxes made.

### Where your code runs — this page and Jupyter

**What it is.** Every Python block on this page has a **▶ Run** button. The first run loads Python into your browser — about 15 MB, once, then cached — together with pandas, NumPy and matplotlib; after that a block runs in about a second. A **notebook** (*блокнот, ноутбук*) is the same thing saved as one `.ipynb` file: a list of **cells**, code or text, run top to bottom. **Jupyter** is the program that opens notebooks; the homework is a notebook.

**How to write it.** Three rules of the page, and the three keys of Jupyter:

- **Blocks share one memory, in the order you run them.** A name made in one block exists in the next one — if you ran it.
- **The data files are already there.** `open("../excel/applications.csv")` reads the course's file — the same path the notebooks use.
- **Every task has its own editor** with ▶ Run and ✔ Check. The check looks for the right number among what your code prints, so print your result.

| In Jupyter | does |
|---|---|
| **Shift+Enter** | runs the cell and moves to the next one |
| **Ctrl+Enter** | runs the cell and stays on it |
| **Kernel → Restart & Run All** | forgets everything, then runs every cell from the top |

The **kernel** (*ядро*) is the Python process behind the notebook. It remembers names in the order cells were *run*, not the order they appear. `[5]` to the left of a cell means it was the fifth cell run; `[*]` means it is still running.

**Setting up Jupyter (by Day 3).** **Anaconda** (*дистрибутив Anaconda*) is Python plus pandas, matplotlib and Jupyter in one installer: https://www.anaconda.com/download → Windows → *Just me* → defaults. Then open **Anaconda Prompt** from the Start menu and type:

```
cd "C:\path\to\analytics-course"
pip install -r requirements.txt
jupyter notebook data/python
```

The first line goes to **the course folder** — your copy of the course repository (*Tools at work* → GitHub Desktop → *Clone*), the folder that holds `requirements.txt`, `data/excel/` and `data/python/`. Type its real path instead of `C:\path\to\analytics-course`.

The browser opens a file list; click `day1_starter.ipynb`. If the installer is blocked, https://colab.research.google.com runs the same notebooks — upload the `.ipynb` and the CSVs it reads (`data/python/README.md` names the one line to change).

**When you use it.**
- The page: to learn, to try, to check a number.
- The notebook: for the file you hand in, which anyone must be able to re-run.

> 💡 **Key idea.** The page is where you learn and practise; the **notebook** is the file you hand in. Both run code blocks top to bottom.

> ⚠️ **Watch out.** Edit block 3, re-run only block 7, and block 7 still sees the *old* block 3. When a number looks stale, run again from the top — in Jupyter, **Kernel → Restart & Run All**. A notebook that survives Restart & Run All is reproducible.

**Your turn.** You changed the function in cell 3 and ran only cell 7, which calls it. Which version does cell 7 use?

### Values and types — int, float, str, bool, None

**What it is.** Every value in Python has a **type** (*тип*). The type decides what you can do with the value: you can add two numbers, but not a number and a piece of text. `type(x)` tells you the type.

**How to write it.**

```python
type(31_150_000), type(0.30), type("Consumer loan"), type(True), type(None)
```

| value | type | what it is |
|---|---|---|
| `31_150_000` | `int` | a whole number; the underscores are only for your eyes |
| `0.30` | `float` | a number with a decimal point |
| `"Consumer loan"` | `str` | text (a *string*), in single or double quotes |
| `True` / `False` | `bool` | yes or no, with capital letters |
| `None` | `NoneType` | "no value" — Python's NULL |
| `"31150000"` | `str` | **text that looks like a number** — what a CSV gives you |

The box shows five types — `int`, `float`, `str`, `bool`, `NoneType` — one per value, in the order written.

`int("42")` turns text into a whole number, `float("3.12")` into a decimal, `str(42)` a number into text. To test for the missing value, write `x is None`, not `x == None`: `is` asks "is this the very same object?", and there is only one `None`.

**When you use it.**
- Before any arithmetic on data from a file: is this column a number or text?
- When an error says `TypeError` — two values of types that do not mix.

> ⚠️ **Watch out.** `"31150000"` in quotes is text. `"31150000" * 2` does not double it: it repeats the text, `"3115000031150000"`. Convert first: `int("31150000") * 2` → `62300000`.

**Your turn.** Which of these values is a `str`?

### Variables — a name for a value

**What it is.** A **variable** (*переменная*) is a name that points at a value. `=` gives the name its value. Later lines use the name instead of the value.

**How to write it.**

```python
customer = "Gulbahor Sobirova"  # name = value
principal = 31_150_000
status = "active"
# a new value for the same name — "active" is gone
status = "closed"
print(customer, principal, status)
```

```text
Gulbahor Sobirova 31150000 closed
```

The line prints `closed`, not `active`: a name holds only its latest value.

Rules for names: letters, digits and `_`, not starting with a digit; `snake_case` by habit (`annual_rate`, not `AnnualRate`); upper and lower case differ (`Status` is another name). `=` gives a value; `==` asks "are these equal?" and answers `True` or `False`.

**When you use it.**
- Every value you will use twice: a rate, a file path, the as-of date.
- To give a number a meaning: `AS_OF`, `principal`, `late_count` read better than `2026-10-01`, `31150000`, `399`.

> ⚠️ **Watch out.** `NameError: name 'principal' is not defined` means the line that makes the name has not run — in this browser or in this kernel. Run the block that defines it first.

**Your turn.** What does this print? `status = "active"`, then `status = "closed"`, then `print(status)`.

### Strings and f-strings — text, and numbers inside text

**What it is.** A **string** (*строка*) is text. String **methods** return a cleaned or changed copy: `.strip()` removes spaces at both ends, `.lower()` / `.upper()` / `.title()` change the case, `.replace(a, b)` swaps text, `.startswith(x)` tests the beginning. `s[:7]` takes the first seven characters. An **f-string** (*f-строка*) — `f"…{name}…"` — puts values inside text.

**How to write it.**

```python
method = "  Bank Transfer "
# 'bank transfer' — week 2's LOWER(TRIM())
clean = method.strip().lower()
print(clean.replace("bank transfer", "transfer"))
day = "2025-03-28"
# the month, and the length of the text
print(day[:7], len(day))
status = "approved_not_disbursed"
print(status.startswith("approved"))  # week 4's "approved*" wildcard
outstanding = 208_723_504_430
print(f"Outstanding: {outstanding:,} soum = {outstanding / 1e9:.1f} bn; PAR30 {0.0312:.2%}")
```

```output
transfer
2025-03 10
True
Outstanding: 208,723,504,430 soum = 208.7 bn; PAR30 3.12%
```

The method name becomes `transfer`, the date gives its month `2025-03` (10 characters in all), and one f-string writes 208.7 bn with thousands separators and a percent.

The part after the colon inside `{ }` is the **format spec** — Excel's number format in another spelling:

| spec | value | result |
|---|---|---|
| `:,` | `208723504430` | `208,723,504,430` |
| `:.1f` | `208.7235` | `208.7` |
| `:.2%` | `0.0312` | `3.12%` |
| `:>8` | `"app"` | `"     app"` — right-aligned in 8 characters (`<` left) |

**When you use it.**
- Cleaning text columns: spaces, case, spellings (week 4's TRIM / PROPER / SUBSTITUTE).
- Cutting a date written as text: `applied_at[:7]` is the month.
- Printing a result a person will read: separators, one decimal, a percent sign.

> ⚠️ **Watch out.** A string never changes in place. `method.strip()` *returns* a clean copy and leaves `method` as it was. Keep the result: `method = method.strip()`.

**Your turn.** Clean a payment method the way week 4 did.

### Numbers and arithmetic — operators and rounding

**What it is.** Python does arithmetic with `+ - * /` and three more operators: `//` (whole-number division), `%` (the remainder) and `**` (a power). `round(x, n)` rounds to `n` decimals; a negative `n` rounds to tens, hundreds…

**How to write it.**

```python
principal = 31_150_000          # loan 1
annual_rate = 0.30
# month 1's interest: a year's interest on the balance, ÷ 12
interest_1 = principal * annual_rate / 12
term = 24
print(interest_1)
print(term // 12, term % 12)    # whole years, months left over
print(round(1_741_684.35, -2))  # to the nearest 100 soum
# the monthly rate — look at the last digits
print(annual_rate / 12, round(annual_rate / 12, 4))
```

```text
778750.0
2 0
1741700.0
0.024999999999999998 0.025
```

Month 1's interest is 778 750 soum — exactly `interest_due` of loan 1's first row in `installments`. 24 months are 2 whole years with 0 months over, and the payment 1 741 684.35 rounds to 1 741 700. The monthly rate prints as 0.024999999999999998 — the trap below.

| operator | example | result |
|---|---|---|
| `/` | `7 / 2` | `3.5` — always a float |
| `//` | `7 // 2` | `3` — whole part |
| `%` | `7 % 2` | `1` — remainder |
| `//` on a negative | `-7 // 2` | `-4` — it rounds **down**, not towards zero |
| `**` | `1.025 ** 2` | `1.050625` — power |
| `round(x, 1)` | `round(58.23, 1)` | `58.2` |
| `round(x, -2)` | `round(1741684.35, -2)` | `1741700.0` |

Brackets work as in school: `100 * approved / total` and `(1 + r) ** -term` are read the way you expect. `abs(-5)` is 5; `min(a, b)` and `max(a, b)` pick one of two.

**When you use it.**
- Every rate, share and payment: `100 * part / whole`.
- `round` for display, or where the business rounds (Nur Finance rounds payments to 100 soum).

> ⚠️ **Watch out.** A float is stored in binary, so `0.30 / 12` comes out as `0.024999999999999998`, not `0.025`. The error is tiny, but `0.30 / 12 == 0.025` is `False`. Round for display (`round(x, 4)`, `f"{x:.4f}"`) and never test two floats with `==` — compare with `math.isclose(a, b)` or `abs(a - b) < 1e-9`. And `int(2.9)` is `2`: `int()` cuts the decimals off — use `round()` when you mean rounding.

> ⚠️ **Watch out.** `round()` sends an exact half to the **even** neighbour ("banker's rounding"): `round(0.5)` is 0, `round(1.5)` is 2, `round(2.5)` is 2. Excel's `ROUND` and SQLite's `ROUND` send a half away from zero — `ROUND(2.5)` is 3 in both. So the same number can come out as 2 in Python and 3 in Excel. When a total must match another tool to the soum, compare the unrounded numbers, or round the same way in both.

```python
print(round(0.5), round(1.5), round(2.5), round(3.5))
```

```text
0 2 2 4
```

**Your turn.** Python and Excel round the same half differently. What does `round(4.5)` return in Python?

**Your turn.** Month 1's interest of loan 2.

> ⚠️ **Quirk: a half that is not a half.**
>
> - **You expect:** `round(2.675, 2)` to give 2.68 — it ends in a 5, and 8 is even.
> - **What happens:** 2.67.
> - **Why:** 2.675 has no exact binary form. The float really holds 2.67499999999999982236…, which is just *under* the half, so it goes down; banker's rounding never comes into it. SQLite's `ROUND(2.675, 2)` says 2.67 too (week 2).
> - **Protect yourself:** keep money in whole soum (`int`) and round once, at the end. When a rule says "a half always goes up", use `Decimal` from text:

```python
from decimal import Decimal, ROUND_HALF_UP

print(round(2.675, 2))   # 2.67, not 2.68
print(f"{2.675:.20f}")   # what is really stored
cents = Decimal("0.01")
half_up = Decimal("2.675").quantize(
    cents, rounding=ROUND_HALF_UP)
print(half_up)           # 2.68
```

> ⚠️ **Quirk: the same division, two languages, different answers.**
>
> - **You expect:** `7 / 2` and `-7 // 2` to give what SQL gave in week 2.
> - **What happens:** Python's `/` never cuts: `7 / 2` is 3.5, where SQL's `7 / 2` is 3. On a negative, Python rounds **down**: `-7 // 2` is -4 and `-7 % 3` is 2, where SQLite cuts towards zero: -3 and -1.
> - **Why:** each language picked its own rule. Neither is wrong, and neither warns you.
> - **Protect yourself:** when you move a calculation from SQL to Python (or back), test it on one odd and one negative number before you trust it.

```python
print(7 / 2, 7 // 2)     # 3.5 3
print(-7 // 2, -7 % 3)   # -4 2
print(6 / 2)             # 3.0: / gives a float
# SQLite: 7 / 2 is 3, -7 / 2 is -3, -7 % 3 is -1
```

### Lists — an ordered column of values

**What it is.** A **list** (*список*) holds several values in order, inside `[ ]`. Each value has a **position** (an *index*) starting at **0**. Negative positions count from the end.

**How to write it.**

```python
buckets = ["0", "1-30", "31-60", "61-90", "90+"]
print(buckets[0], buckets[-1], buckets[1:3])
# loans 1–5
principals = [31_150_000, 40_060_000, 1_590_000, 2_520_000, 25_590_000]
print(len(principals), sum(principals), max(principals))
principals.append(4_990_000)  # add one at the end
print(len(principals), "1-30" in buckets)
```

| position | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| value | `"0"` | `"1-30"` | `"31-60"` | `"61-90"` | `"90+"` |
| from the end | −5 | −4 | −3 | −2 | −1 |

```text
0 90+ ['1-30', '31-60']
5 100910000 40060000
6 True
```

The first bucket is `"0"`, the last `"90+"`, and the slice `[1:3]` takes positions 1 and 2 — it stops *before* 3. The five loans add up to 100 910 000; the largest is loan 2's 40 060 000; after `append` the list has six values.

A **tuple** (*кортеж*) looks like a list in round brackets and cannot be changed after it is made:

| | list `[ ]` | tuple `( )` |
|---|---|---|
| can change | yes: `append`, `x[0] = …` | no |
| used for | a column of values | a fixed pair or row: `("Tashkent Central", 1001)` |

**When you use it.**
- A column of values to add up, count, sort (`sorted(x)`), or walk through with a loop.
- A list of labels in a fixed order — buckets, months, products.

> ⚠️ **Watch out.** Positions start at 0, so the fifth value is `x[4]`, and `x[5]` on a five-value list is `IndexError: list index out of range`. A slice `x[a:b]` stops before `b`. And `b = a` does **not** copy a list: both names point at the same list, so `b.append(…)` changes `a` too. When you need a copy, write `b = a.copy()`.

**Your turn.** The average principal of loans 1–5.

> 🎬 **Didn't get lists?** [Lists explains it · 7 min](https://youtu.be/wUSDVGivd-8?t=5668&end=6106)

> 🎬 **Didn't get slicing a list?** [Lists explains it · 5 min](https://youtu.be/wUSDVGivd-8?t=6106&end=6390)

### Dicts — a lookup table key → value

**What it is.** A **dict** (*словарь*) stores pairs **key → value** inside `{ }`. You look a value up by its key, not by a position. It is week 4's `XLOOKUP` in one line.

**How to write it.**

```python
rates = {"Micro loan": 0.42, "Consumer loan": 0.30, "Buy now pay later": 0.0,
         # products.annual_rate
         "Auto loan": 0.24, "Small business loan": 0.26}
print(rates["Auto loan"])  # look up by key
# .get: a default instead of an error
print(rates.get("Mortgage", "no such product"))
counts = {"card": 17612, "payme": 8897}
# add a key (or replace its value)
counts["cash"] = 8788
print(counts, len(counts), "card" in counts)
```

```output
0.24
no such product
{'card': 17612, 'payme': 8897, 'cash': 8788} 3 True
```

Auto loans cost 24 % a year; the missing product returns the default instead of crashing; `counts` now has three keys, and `"card" in counts` is `True`.

Walk a dict with `.keys()`, `.values()` and `.items()` (the pairs): `sum(counts.values())` adds the values.

**When you use it.**
- A lookup: a product's rate, a branch's region, a status's label.
- **Counting per group**: one key per group, the count as the value — the loops below build this.

> ⚠️ **Watch out.** `d["key"]` on a key that is not there raises `KeyError`. Use `d.get("key", 0)` when a missing key is normal.

**Your turn.** The clean payments per method — how many in total?

### if / elif / else — choose by a condition

**What it is.** `if` runs a block only when its condition is `True`. `elif` ("else if") tries the next condition; `else` catches the rest. The **first** true branch wins; the others are skipped. It is week 2's `CASE WHEN` and week 4's nested `IF`.

**How to write it.**

```python
dpd = 45
if dpd <= 0:              # the colon opens the block …
    bucket = "0"          # … four spaces mark what belongs to it
elif dpd <= 30:
    bucket = "1-30"
elif dpd <= 60:
    bucket = "31-60"
elif dpd <= 90:
    bucket = "61-90"
else:
    bucket = "90+"
print(bucket)
```

```text
31-60
```

45 days fails `<= 0` and `<= 30`, passes `<= 60` — so the bucket is `31-60`, and the last two tests never run.

| `dpd` | 0 | 7 | 30 | 31 | 45 | 90 | 91 | 919 |
|---|---|---|---|---|---|---|---|---|
| bucket | 0 | 1-30 | 1-30 | 31-60 | 31-60 | 61-90 | 90+ | 90+ |

Comparisons: `==` equal, `!=` not equal, `<`, `<=`, `>`, `>=`, `in` (inside a list or a text). Join conditions with `and`, `or`, `not`: `if status == "active" and dpd > 0:`.

**Indentation is the syntax** (*отступы*): no `END`, no braces — four spaces after a line that ends in `:`.

**When you use it.**
- A label from a number: buckets, bands, grades.
- A rule: skip a blank value, count only the approved.

> ⚠️ **Watch out.** The order of the branches matters. Put `elif dpd <= 60` before `elif dpd <= 30` and a 7-day loan lands in `31-60`, because the first true test wins. Write the tests from the smallest edge up.

**Your turn.** With the code above, which bucket does `dpd = 90` get?

### for loops — once per element

**What it is.** A **for loop** (*цикл for*) runs its block once for every element of a list (or the keys of a dict, or the rows of a file). Inside the block, the loop variable is the current element.

**How to write it.** A running total, and a count per group with a dict:

```python
# the monthly payments of loans 1, 2, 3
amounts = [1_741_700, 2_791_000, 567_500]
total = 0            # start BEFORE the loop
for amount in amounts:
    total += amount  # += adds to the variable
print(total)

methods = ["card", "cash", "card", "payme", "card"]
counts = {}
for m in methods:
    # one more for this key, starting at 0 if new
    counts[m] = counts.get(m, 0) + 1
print(counts)
```

| step | `amount` | `total` after the step |
|---|---|---|
| 1 | 1 741 700 | 1 741 700 |
| 2 | 2 791 000 | 4 532 700 |
| 3 | 567 500 | 5 100 200 |

```text
5100200
{'card': 3, 'cash': 1, 'payme': 1}
```

Three steps, three payments: 5 100 200 a month from the first three loans. The second loop counts three card payments, one cash, one Payme — `GROUP BY method` with `COUNT(*)`, written by hand.

More ways to loop: `for i, x in enumerate(items)` gives the position too; `for k, v in counts.items()` walks a dict's pairs; `for n in range(1, 25)` counts 1 … 24. `break` leaves the loop; `continue` skips to the next element.

| | `for` | `while` |
|---|---|---|
| runs | once per element | as long as a condition is `True` |
| ends | by itself, after the last element | only when the condition becomes `False` |
| use for | rows, lists, dicts | "until the balance passes 10 m" |

**When you use it.**
- Totals, counts and sums per group — everything `GROUP BY` did.
- Doing the same step to every row of a file.

> ⚠️ **Watch out.** A total that starts *inside* the loop is reset on every step, so you get only the last value. And a `while` whose condition never becomes `False` runs forever — on the page press ↺ Restart Python, in Jupyter Kernel → Interrupt.

**Your turn.**

### List comprehensions — a for loop that builds a list

**What it is.** A **list comprehension** (*списковое включение*) is a `for` that builds a list in one line: `[expression for item in items if condition]`. Read it from the middle: *for each item, if the condition holds, keep the expression*.

**How to write it.**

```python
dpds = [0, 7, 30, 31, 45, 90, 91, 919]
late = [d for d in dpds if d > 0]              # WHERE dpd > 0
doubled = [d * 2 for d in dpds]                # an expression for every element
print(late, len(late))
print(sum(1 for d in dpds if d > 90))          # COUNT with a condition
```

```text
[7, 30, 31, 45, 90, 91, 919] 7
2
```

Seven of the eight values are late; two are past 90 days. Tomorrow the same filter, in pandas, is a boolean mask.

| SQL | comprehension |
|---|---|
| `SELECT dpd … WHERE dpd > 0` | `[d for d in dpds if d > 0]` |
| `SELECT dpd * 2` | `[d * 2 for d in dpds]` |
| `SELECT COUNT(*) … WHERE dpd > 90` | `sum(1 for d in dpds if d > 90)` |

**When you use it.**
- A filtered or converted copy of a list: the late ones, the amounts as `int`.
- A count with a condition, in one line.

> ⚠️ **Watch out.** A comprehension that does three things at once is hard to read. When the line grows past one condition and one expression, write the plain `for` loop.

**Your turn.** The big loans among loans 1–5.

### Functions — def, parameters, return

**What it is.** A **function** (*функция*) is a named, reusable step. It takes inputs (**parameters**, *параметры*), does its work, and hands back one result with `return`. You write it once with `def` and **call** it as often as you like.

**How to write it.**

```python
def approval_rate(approved, total, decimals=1):
    # the docstring: what it does, for the next reader
    """Approval rate in percent."""
    if total == 0:
        # never divide by zero; None is "no answer"
        return None
    return round(100 * approved / total, decimals)

def label(dpd):
    """The DPD bucket of a number of days past due."""
    if dpd <= 0: return "0"
    elif dpd <= 30: return "1-30"
    elif dpd <= 60: return "31-60"
    elif dpd <= 90: return "61-90"
    else: return "90+"

print(approval_rate(2915, 5006), approval_rate(2915, 5006, 2), approval_rate(0, 0))
print(label(30), label(91))
```

| call | returns |
|---|---|
| `approval_rate(2915, 5006)` | `58.2` |
| `approval_rate(2915, 5006, 2)` | `58.23` — `decimals` given |
| `approval_rate(0, 0)` | `None` |
| `label(30)`, `label(91)` | `'1-30'`, `'90+'` |

The app channel approved 2 915 of 5 006 applications: 58.2 %, or 58.23 with two decimals. A channel with no applications gets `None` instead of a crash.

`decimals=1` is a **default**: the parameter becomes optional. A short `if` fits on one line (`if dpd <= 0: return "0"`) when its block is one line.

| `return` | `print` |
|---|---|
| hands the value back — you can store it, test it, reuse it | only shows it on the screen |
| `x = approval_rate(2915, 5006)` holds 58.2 | `x = print(58.2)` holds `None` |
| `assert approval_rate(2915, 5006) == 58.2` can check it | nothing to check |

**When you use it.**
- Any step you do twice: a bucket label, a rate, the annuity payment.
- Any number you will report: put it in a function, then test the function with `assert` (HW 5.1).

> ⚠️ **Watch out.** A function without `return` gives back `None`. A function that `print`s its answer looks right on screen and is useless to the next line of code.

**Your turn.** A function for month 1's interest, tried on loan 3.

> ⚠️ **Quirk: a default list remembers.**
>
> - **You expect:** `def add_loan(loan, basket=[])` to start with an empty basket on every call.
> - **What happens:** the second call still holds the first call's loan: `[1]`, then `[1, 2]`.
> - **Why:** a default value is made **once**, when Python reads the `def`, and every call shares that one list. Numbers and text cannot change in place, so they are safe defaults; a list or a dict is not.
> - **Protect yourself:** use `None` as the default and make the list inside the function.

```python
def add_loan(loan, basket=[]):   # the trap
    basket.append(loan)
    return basket

print(add_loan(1))   # [1]
print(add_loan(2))   # [1, 2]: the same list

# the fix
def add_loan_safe(loan, basket=None):
    if basket is None:
        basket = []
    basket.append(loan)
    return basket

print(add_loan_safe(1))   # [1]
print(add_loan_safe(2))   # [2]
```

### Importing modules — someone else's functions

**What it is.** A **module** (*модуль*) is a file of ready-made functions. `import` makes it available. Python's **standard library** comes with dozens: `csv` for files, `datetime` for dates, `math` for rounding up and logarithms. Tomorrow's `import pandas as pd` is the same mechanism.

**How to write it.**

```python
import math                # the whole module; use it as math.something
from datetime import date  # one name from a module; use it directly
import statistics as st    # a module under a short alias

print(math.ceil(24 / 5))   # round UP
days = date(2026, 10, 1) - date(2025, 3, 28)
print(days.days)           # loan 1: days from disbursement to the as-of
print(st.median([31_150_000, 40_060_000, 1_590_000, 2_520_000, 25_590_000]))
```

```text
5
552
25590000
```

24 ÷ 5 = 4.8 rounds up to 5. Loan 1 has been on the book for 552 days on the as-of date. The median of loans 1–5 is 25 590 000 — the middle value, against a mean of 20 182 000.

| import | gives you | example |
|---|---|---|
| `import csv` | read and write CSV files | `csv.DictReader(f)` |
| `from datetime import date, datetime` | dates and date arithmetic | `date(2026, 10, 1)`, `datetime.strptime(s, fmt)` |
| `import math` | rounding up, logs, square roots | `math.ceil(4.8)` → 5 |
| `import statistics as st` | mean, median | `st.median(x)` |
| `import pandas as pd` | tables (tomorrow) | `pd.read_csv(path)` |

**When you use it.**
- At the top of every notebook: one cell with all the imports.
- Whenever you are about to write something general (a date difference, a median) — the library has it.

> ⚠️ **Watch out.** `import datetime` and `from datetime import datetime` are different: after the first, the class is `datetime.datetime`; after the second, `datetime`. Mixing them gives `AttributeError: module 'datetime' has no attribute 'strptime'`. Pick one style per notebook.

**Your turn.** Days on book of loan 4.

> 🎬 **Didn't get modules and import?** [Lists explains it · 10 min](https://youtu.be/wUSDVGivd-8?t=11569&end=12155)

### Reading a CSV with the csv module

**What it is.** `csv.DictReader` reads a CSV file row by row. Each row becomes a **dict** whose keys are the header line. `list(...)` collects all rows into a list — a list of dicts, one per row.

**How to write it.**

```python
import csv
with open("../excel/applications.csv", newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))   # a list of dicts, one per row
with open("../excel/loans_status.csv", newline="", encoding="utf-8") as f:
    loans = list(csv.DictReader(f))  # the 7 828 loans, the same way
print(len(rows), len(loans))
print(rows[0]["channel"], rows[0]["status"], rows[0]["requested_amount"], type(rows[0]["requested_amount"]))
```

The first two rows of `rows`, five of their keys:

| key | `rows[0]` | `rows[1]` |
|---|---|---|
| `"channel"` | `"branch"` | `"branch"` |
| `"product"` | `"Auto loan"` | `"Consumer loan"` |
| `"requested_amount"` | `"322610000"` | `"31150000"` |
| `"credit_score"` | `"658"` | `"631"` |
| `"status"` | `"rejected"` | `"approved"` |

```text
14000 7828
branch rejected 322610000 <class 'str'>
```

14 000 applications and 7 828 loans. The first application is a rejected branch request for 322 610 000 — and that amount is a `str`: every value in the file arrives as text.

`with open(...) as f:` opens the file and closes it when the block ends. `newline=""` stops blank lines on Windows; `encoding="utf-8"` reads every letter right. A blank cell arrives as the empty string `""` — 388 applications have `credit_score == ""`.

**When you use it.**
- Any file you need before pandas, or in a small script with no libraries.
- To see exactly what a file contains, with no type guessing.

> 💡 **Key idea.** A CSV knows no types. Every value arrives as text — `"0"` is not `0`, `""` is not a missing number but an empty string — so you convert at the moment you compute, and you decide what a blank means before you divide.

> ⚠️ **Watch out.** `FileNotFoundError` means the path is wrong for where Python is running. On this page and in the course notebooks the path is `../excel/…`; in your own folder, put the file next to the notebook and use its bare name.

**Your turn.**

### Errors — how to read a traceback, and try/except

**What it is.** When Python cannot run a line it stops and prints a **traceback** (*трассировка*): the calls that led to the error, newest at the bottom, and on the **last line** the error's type and message. `try: … except SomeError: …` catches an error you expect and does something sensible instead.

**How to write it.** This box fails on purpose — run it and read the bottom line first:

```python
def approval_rate(approved, total):
    return round(100 * approved / total, 1)

approval_rate(0, 0)          # a channel with no applications
```

```output
Traceback (most recent call last):
  Cell In[7], line 4
    approval_rate(0, 0)
  Cell In[7], line 2, in approval_rate
    return round(100 * approved / total, 1)
↑ the line of YOUR code where it broke
ZeroDivisionError: division by zero
↑ the LAST line: what went wrong —
  read it first
```

The last line names the error: a division by a total of zero. The line above it points at `return round(100 * approved / total, 1)`, inside `approval_rate`.

Catch an error you expect:

```python
def safe_int(text):
    try:
        return int(text)
    except ValueError:            # int("") or int("n/a") — not a number
        return None

print(safe_int("658"), safe_int(""), safe_int("n/a"))
```

```text
658 None None
```

A real score becomes the number 658; the blank and the garbage become `None` instead of stopping the run.

| error | usually means | fix |
|---|---|---|
| `NameError` | a name not defined — or defined in a block you did not run | run the block above |
| `TypeError` | text and number mixed: `"42" + 1` | convert with `int()` / `float()` |
| `KeyError` | a dict key or column that does not exist | check the spelling against the header |
| `IndexError` | a position past the end of a list | positions start at 0 |
| `ValueError` | the right type, a wrong value: `int("n/a")` | test the value first, or `try/except` |
| `ZeroDivisionError` | a division by 0 | check the total first |
| `FileNotFoundError` | the wrong path for where Python runs | check the folder |
| `SyntaxError` / `IndentationError` | a missing `:` or bracket; wrong spaces | look *just before* the arrow |

**When you use it.**
- Every error: read the last line, then the line of your own code it points at.
- `try/except` only for errors you expect and know how to handle — a blank score, a bad date.

> ⚠️ **Watch out.** A bare `except:` with no error name hides every mistake, typos included. Name the error you expect: `except ValueError:`.

**Your turn.** A loop over `rows` stops with `KeyError: 'Channel'` on the line `ch = r["Channel"]`. What does it mean?

### Putting it together

One question, every tool of the day: *what share of loans is late (`dpd > 0`) in each product?* Read the file (**csv**), walk the rows (**for**), convert the text (**types**), test the condition (**if**), count per product in two **dicts**, compute the share in a **function**, print with an **f-string**.

```python
import csv

def share(part, whole):
    """part as a percent of whole, two decimals."""
    return round(100 * part / whole, 2) if whole else None

with open("../excel/loans_status.csv", newline="", encoding="utf-8") as f:
    loans = list(csv.DictReader(f))

total, late = {}, {}
for r in loans:
    p = r["product"]
    total[p] = total.get(p, 0) + 1
    if int(r["dpd"]) > 0:  # text → number before comparing
        late[p] = late.get(p, 0) + 1

for p in sorted(total, key=lambda k: share(late.get(k, 0), total[k]), reverse=True):
    print(f"{p:<20}{total[p]:>6}{late.get(p, 0):>5}{share(late.get(p, 0), total[p]):>7.2f} %")
```

| product | loans | late | share late |
|---|---|---|---|
| Auto loan | 391 | 29 | 7.42 % |
| Small business loan | 781 | 47 | 6.02 % |
| Consumer loan | 2 418 | 138 | 5.71 % |
| Micro loan | 2 669 | 121 | 4.53 % |
| Buy now pay later | 1 569 | 64 | 4.08 % |

Auto loans are late most often — 29 of 391, 7.42 % — and BNPL least, 4.08 %. The late loans add up to 399, the week-2 number. `sorted(…, key=…, reverse=True)` orders the products by their share, largest first; `key=lambda k: …` says "sort by this value of each key".

**Your turn.** The share of *all* loans that are late, in % with two decimals.

**Review the words of the day.**

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Jupyter (install, new notebook, markdown, shortcuts) — [Jupyter Notebook Tutorial: Introduction, Setup, and Walkthrough (Corey Schafer), 04:08](https://youtu.be/HW29067qVWk?t=248&end=961)
- ▶ Install Anaconda (the Jupyter path) — [Python for Data Analytics - Full Course for Beginners (Luke Barousse), 5:50:56](https://youtu.be/wUSDVGivd-8?t=21056&end=21634)
- ▶ Variables and types — [Python for Data Analytics - Full Course for Beginners (Luke Barousse), 18:52](https://youtu.be/wUSDVGivd-8?t=1132&end=1465)
- ▶ Lists, dicts, tuples — [same course, 1:34:24](https://youtu.be/wUSDVGivd-8?t=5664&end=6582)
- ▶ if / for / while — [same course, 1:26:20](https://youtu.be/wUSDVGivd-8?t=5180&end=5664)
- ▶ Functions — [same course, 2:52:12](https://youtu.be/wUSDVGivd-8?t=10332&end=10923)
- ▶ Modules (import) — [same course, 3:12:46](https://youtu.be/wUSDVGivd-8?t=11566&end=12496)

- RU deck (TBC Data Analytics 2.0, if you have it) `4.1 Python.pdf` (109 pages): types pp. 26–48, control flow pp. 49–61, lists / tuples / dicts / sets pp. 62–71, functions pp. 72–78, exceptions pp. 83–91, files pp. 92–107 — the recording `video1256130814.mp4` is this lecture. `En_4.2_Python.pdf` is NumPy (arrays, slicing, broadcasting, pp. 12–66): pandas sits on top of it; read it when `.values` or `np.where` puzzle you.
- *Russian terms:* переменная = variable, целое / вещественное число = int / float, строка = str, список = list, словарь = dict, кортеж = tuple, цикл = loop, функция = function, параметр / аргумент = parameter / argument, модуль = module, исключение = exception, трассировка = traceback, ядро = kernel, ячейка = cell.

---

## 2. Worked example — Jasur's approval rate by channel, in loops (15 min)

The ask: approval rate = approved ÷ applications, per channel. Each step uses one concept from section 1, in the order you learned them.

1. **Step 1 — reading a CSV** (`csv.DictReader`). One row = one application; 14 000 rows; every value is text.
2. **Step 2 — two dicts as the groups.** `total` and `approved`, one key per channel; `.get(ch, 0) + 1` counts one more, starting at 0 for a new key.
3. **Step 3 — a for loop with an if.** One pass over the rows. The `if` uses a string method, `startswith("approved")` — week 4's `"approved*"` wildcard, because the status has two approved spellings.
4. **Step 4 — an f-string per channel.** `sorted(total)` gives a fixed order; `:<8`, `:>6` and `:>7.1f` line the columns up.

```python
import csv
with open("../excel/applications.csv", newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))

total, approved = {}, {}
for r in rows:
    ch = r["channel"]
    total[ch] = total.get(ch, 0) + 1
    if r["status"].startswith("approved"):
        approved[ch] = approved.get(ch, 0) + 1

for ch in sorted(total):
    print(f"{ch:<8}{total[ch]:>6}{approved[ch]:>6}{100 * approved[ch] / total[ch]:>7.1f} %")
```

```
app       5006  2915   58.2 %
branch    6223  3965   63.7 %
partner   2771  1715   61.9 %
```

Week 2's `GROUP BY channel`, week 4's `COUNTIFS`, now a `for`. Three things to see. The dicts are the *groups*: `.get(ch, 0) + 1` is "count one more for this key, starting at zero if new". `startswith("approved")` is the wildcard. And nothing was summed from text: `total[ch]` counts rows, so no `int()` was needed — the moment you sum `requested_amount` you must convert. Decided-only convention: a third dict counting `r["status"] != "cancelled"` → 68.2 / 72.4 / 70.5 %.

> ⚠️ **Watch out.** `== "approved"` alone gives 56.6 % for the app — Marketing's number — because the status has two spellings and 678 `approved_not_disbursed` rows are lost. Look at the distinct values of a column before you test it for one of them.

> 💡 **Key idea.** The total row sums the counts: 8 595 / 14 000 = **61.4 %**. Averaging the three channel rates gives 61.3 % — never average rates for a total.

---

## 3. Practice (50 min)

Every task below has its own editor that already reads the file it needs. Write your code under `# your code`, press **▶ Run**, then **✔ Check** — the check looks for the answer among the numbers your code prints, so print the result. Working in Jupyter instead? Do the task in a notebook `week5_day1.ipynb` (File → New → Notebook), one task per cell, then paste your code into the editor to check it.

**P1.** *(values and types)* `principal = "31150000"` as read from the CSV. What does `principal * 2` give, what does `int(principal) * 2` give, and what error does `principal + 1` raise?

**P2.** *(variables, strings and f-strings)* A customer as typed at the branch: `name = "  gulbahor SOBIROVA "`, `principal = 31150000`, `outstanding = 9593064`. Clean the name with `.strip().title()` and print one line with an f-string: `Gulbahor Sobirova: 9,593,064 of 31,150,000 left (30.8%)`.

**P3.** *(numbers and arithmetic)* Loan 2: 40 060 000 at 30 % for 18 months, monthly payment 2 791 000. How many whole years and months is the term (`//` and `%`)? If all 18 payments were 2 791 000, how much would the borrower pay in total, and how much of it is interest?

**P4.** *(lists)* A list of the five bucket labels in order. Print the last one without counting, the middle three with a slice, and the position of `"61-90"` with `.index()`.

**P5.** *(dicts)* Count applications per `status` with a dict and a loop; print the dict sorted by count, largest first.

**P6.** *(if / elif / else)* Write `label(dpd)` from section 1 and apply it with a comprehension to `[0, 7, 30, 31, 45, 90, 91, 919]`. Then count how many of `loans_status.csv`'s 7 828 rows land in each label with a dict.

**P7.** *(for loops)* Sum `requested_amount` per channel; print each as `f"{x / 1e9:.1f} bn"`. What goes wrong without `int()`?

**P8.** *(functions)* Write `top_n(d, n)` returning the n largest `(key, value)` pairs of a dict, and use it on the per-`product` counts of applications. Then a `while` loop that grows 1 000 000 by 30 % a year until it passes 10 000 000 — how many years?

**P9.** *(importing modules)* Dates: `from datetime import date, datetime`; parse `applied_at` (`"2025-06-02 10:35:00"`) with `datetime.strptime(s, "%Y-%m-%d %H:%M:%S")`, then count applications in September 2026 with the half-open rule. Check it against `<= 2026-09-30`.

**P10.** *(reading a CSV)* Missing values: how many rows have `credit_score == ""`? Compute the average credit score of the rest — and explain why `sum / len(rows)` would be wrong.

**P11.** *(errors and try/except)* Write `approval_rate(rows, channel, convention="all")` as in the worked example, with `"decided"` as the second convention, and a `try/except` around a call with a channel that does not exist so that it returns `None` instead of crashing.

> 🚀 **Stretch (optional, +5 XP).** **P12.** *(putting it together)* Read `loans_status.csv` and compute Σ `outstanding` by `product` with a dict, then the share of each with an f-string `:.1%`. Then write the same result to a new CSV with `csv.DictWriter` (`fieldnames=["product", "outstanding", "share"]`) and read it back (in Jupyter, open it in Excel).

### Mistakes that cost a point this week

- Cells run out of order and a notebook that fails on *Restart & Run All*.
- Summing CSV text without `int()`/`float()` — a `TypeError`, or worse, text glued together.
- `== "approved"` where the status has two spellings — 678 approvals lost.
- A `for` that recomputes the same dict lookup three times instead of a variable.
- Dividing by `len(rows)` when some rows are blank — NULLs counted as zero.
- A function that `print`s the result instead of `return`ing it — nothing to assert, nothing to reuse.
- Reading the first line of a traceback instead of the last.

---

## 4. Homework <span class="badge hw">HW 5.1 — Due Day 3</span>

**Jasur's eight functions.** Open `data/python/day1_starter.ipynb` in Jupyter or Colab (section 1, "Where your code runs"). Eight functions are stubs that raise `NotImplementedError`; under each is an **assert cell** with the expected answers. Replace the body of each stub until its assert cell runs silently, then **Kernel → Restart & Run All** and hand in the executed notebook (`day1_starter.ipynb`) with the 📎 box below.

1. `dpd_bucket(dpd)` — the five labels (negative → `"0"`).
2. `annuity(principal, annual_rate, term)` — the monthly payment rounded to the nearest 100 (Company corner).
3. `schedule(principal, annual_rate, term)` — the list of `(n, payment, interest, principal_part, balance_after)`.
4. `parse_date(s)` — ISO text (with or without a time) to a `date`; blank or garbage → `None`.
5. `is_valid_birth_date(d, as_of)` — week 4's rule: between 1920-01-01 and the as-of.
6. `normalise_method(s)` — `"CASH "` → `"cash"`, `"bank transfer"` → `"transfer"`.
7. `approval_rate(rows, channel, convention)` — P11.
8. `top_n(d, n)` — P8.

Section 9 of the notebook uses 6 and 8 together on `payments_dirty.csv` (five clean methods, card first).

**Check your key numbers before you hand in.** Paste your functions from the notebook into these two editors; the check compares what they print with the warehouse.

### 📎 Hand in here

---

## 5. Self-check

---

## 6. Company corner <span class="badge company">The annuity formula</span>

Every instalment in `installments` (92 193 rows) was produced by one formula. An **annuity** (*аннуитет*) loan pays the same amount every month; inside that amount the **interest** part shrinks and the **principal** part grows as the balance falls:

```
payment = P × r / (1 − (1 + r)^−n)

P = principal
r = annual_rate / 12
n = term in months
```

Nur Finance rounds the payment to the nearest **100 soum** (`round(x, -2)`), and zero-rate BNPL simply divides `P / n`. In Python:

```python
def annuity(principal, annual_rate, term):
    r = annual_rate / 12
    pay = principal / term if r == 0 else principal * r / (1 - (1 + r) ** -term)
    return int(round(pay, -2))

annuity(31_150_000, 0.30, 24)     # 1741700 — loan 1
```

**Check against three real loans** (`loans.principal`, `annual_rate`, `term_months`, `monthly_payment` from `nur.db`; the same three head `loans_status.csv`):

| loan | principal | rate | term | formula | `monthly_payment` |
|---|---|---|---|---|---|
| 1 (Consumer) | 31 150 000 | 30 % | 24 | 1 741 684.35 → **1 741 700** | 1 741 700 |
| 2 (Consumer) | 40 060 000 | 30 % | 18 | 2 790 983.43 → **2 791 000** | 2 791 000 |
| 3 (Micro) | 1 590 000 | 42 % | 3 | 567 525.35 → **567 500** | 567 500 |

Run over all 7 828 loans, `annuity()` equals `monthly_payment` for **7 828** — the rounding rule is the whole difference between "approximately right" (590 matches with `int()`, 579 with `round()`) and exactly right. When a company's number does not match your formula, the gap is almost always a rounding or day-count convention; find it, write it down, and then your function *is* the definition.

**Principal vs interest over the schedule** — loan 1, the first six of 24 rows, each month `interest = round(balance × r)`, `principal_part = payment − interest` (the payment is 1 741 700 every month):

| n | interest | principal | balance after |
|--:|--:|--:|--:|
| 1 | 778 750 | 962 950 | 30 187 050 |
| 2 | 754 676 | 987 024 | 29 200 026 |
| 3 | 730 001 | 1 011 699 | 28 188 327 |
| 4 | 704 708 | 1 036 992 | 27 151 335 |
| 5 | 678 783 | 1 062 917 | 26 088 418 |
| 6 | 652 210 | 1 089 490 | 24 998 928 |

These are exactly `installments` rows 1–6 for `loan_id = 1` (`interest_due` 778 750, `principal_due` 962 950 …). The 24th row pays 1 741 193 — a little less, because the balance is cleared rather than overpaid; the principal parts sum to 31 150 000 and the interest parts to 10 650 293 (34 % on top of the principal over two years).

> 💡 **Key idea.** **Outstanding** is the sum of the *principal* parts not yet due — the interest is revenue, not exposure. Because interest is front-loaded, loan 1, one year into its 24-month term, still has 17 865 571 outstanding — 57 % of its principal, not 50 %. The same reason makes early repayment save the borrower less than they expect, and keeps a 48-month Auto loan's balance almost still in its first year.

> 🎯 **Interview version.** *"How is an annuity payment computed, and how does the split change over time?"* — P·r/(1−(1+r)^−n) with the monthly rate; equal payments; interest = balance × r so it falls every month and the principal part rises by the same amount; the balance after month k is what the schedule still owes — that is the outstanding; check the function against three real loans and state the rounding rule.

**Say it like in an interview.** Answer the question above in your own words, as you would say it aloud, with one Nur Finance number.

Tomorrow: pandas — the `rows` list becomes a DataFrame, and the loops become one line each. Bekzod's monthly notebook.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 5 · Day 2 — pandas I: the DataFrame is a table you can talk to (weeks/week-05/day-2.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-05/day-2
=====

# Week 5 · Day 2 — pandas I: the DataFrame is a table you can talk to

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge company">Company corner</span>

> STORY **Tuesday, 9:10.** Bekzod, the portfolio manager (*портфельный менеджер*), with last week's Excel open and a new worry. *"The one-pager worked. Then the October extract came and I spent two hours re-pasting, and one pivot pointed at the old range. Jasur says you can give me **the same portfolio numbers as week 4 in a notebook I re-run every month**: drop the new `loans_status.csv` in, press one button, six tiles and the buckets come out. Same numbers as the SQL — 208.7 bn, 3.12 %, 7 429 / 124 / 25 / 16 / 234 — or Timur will not sign it."*

## Today in 3 lines

- **pandas** (*библиотека pandas*) turns a CSV into a **DataFrame** — a table with named columns and typed values — and every SQL clause you know has a one-line pandas spelling: `WHERE` is a boolean mask, `ORDER BY` is `sort_values`, `SELECT` is `[ ]` / `.loc`, `CASE` for buckets is `pd.cut`.
- You learn the first-look toolkit (`head`, `shape`, `info`, `describe`, `dtypes`), filtering (`&`, `|`, `~`, `isin`, `between`, `str.contains`), new columns, `astype`, `to_datetime` and `.dt`, `value_counts`, `isna` / `fillna` / `dropna`, and writing results back (`to_csv`, `to_excel`).
- Bekzod's notebook exists: `portfolio_summary(df)` returns the six tiles, `pd.cut` returns the buckets, and both match week 3 to the soum.

**Homework:** nothing new today — HW 5.1 (Day 1's eight functions) is due tomorrow, Day 3, in Day 1's 📎 box.

---

## 1. Learn — one table, one variable

Every concept below has the same five parts: what it is, how to write it (a box you can run), when you use it, the trap, and a small task. Run the boxes from top to bottom: the first box reads the `loans` table, and every later box uses it. The same cells are in `data/python/day2_starter.ipynb` if you work in Jupyter.

### Series and DataFrame — the two objects of pandas

**What it is.** **pandas** (*библиотека pandas*) keeps a table in a **DataFrame** (*датафрейм*): named columns, one type per column, and an **index** (*индекс*) — a label for every row. One column on its own is a **Series** (*серия*): a list of values with the same index.

**How to write it.** The first box loads the libraries and the loan table; then a three-row DataFrame built by hand, from a dict of columns:

```python
import pandas as pd
import numpy as np
# the table every box below uses
loans = pd.read_csv("../excel/loans_status.csv", parse_dates=["disbursed_at"])

small = pd.DataFrame({"loan_id": [1, 2, 3],
                      "product": ["Consumer loan", "Consumer loan", "Micro loan"],
                      "principal": [31_150_000, 40_060_000, 1_590_000]})
small
```

| (index) | loan_id | product | principal |
|---|---|---|---|
| 0 | 1 | Consumer loan | 31150000 |
| 1 | 2 | Consumer loan | 40060000 |
| 2 | 3 | Micro loan | 1590000 |

Three rows, three columns. The bold-looking first column, 0 · 1 · 2, is the index — row labels, not data.

```python
col = small["principal"]                       # one column → a Series
print(type(small).__name__, type(col).__name__)
print(col.sum(), col.max(), small.columns.tolist(), small.index.tolist())
```

```output
DataFrame Series
72800000 40060000 ['loan_id', 'product', 'principal'] [0, 1, 2]
```

The column is a Series: it adds up to 72 800 000 and its largest value is loan 2's 40 060 000 — one method call each, no loop.

| Day 1 (plain Python) | pandas |
|---|---|
| a list of values | a **Series** — a list with an index |
| a dict of lists | a **DataFrame** — a dict of Series that share one index |
| `for` + `total += x` | `col.sum()` — the loop runs inside pandas |

**When you use it.**
- A DataFrame for any table: a file, a query result, a summary you build.
- A Series for one column, or one row, or the result of a count.

> ⚠️ **Watch out.** The index is not a column. It is a label that stays with the row when you filter or sort — so after a filter, row label 0 may be gone. Section *loc and iloc* below shows where this bites.

**Your turn.** Build a DataFrame of the five DPD buckets and their loan counts, and print the total number of loans.

### read_csv — a file into a DataFrame (parse_dates, dtype)

**What it is.** `pd.read_csv(path)` reads a CSV into a DataFrame. It takes the header line as column names and **guesses a type** (*dtype*) for every column: whole numbers → `int64`, decimals → `float64`, anything else → `str` (text; pandas before 3.0, and many tutorials, call it `object`). Two parameters correct the guess: `parse_dates=[…]` makes date columns real dates, `dtype={…}` forces a type.

**How to write it.**

```python
raw = pd.read_csv("../excel/loans_status.csv")  # no parse_dates
print(raw["disbursed_at"].dtype, loans["disbursed_at"].dtype)
cust = pd.read_csv("../excel/customers_dirty.csv")
print(cust["phone"].dtype, cust["phone"][0], cust["monthly_income"].dtype)
cust_txt = pd.read_csv("../excel/customers_dirty.csv", dtype={"phone": str})
print(cust_txt["phone"].dtype, cust_txt["phone"][0])
```

| column | default guess | with the parameter |
|---|---|---|
| `disbursed_at` | `str` — text | `datetime64[us]` with `parse_dates=["disbursed_at"]` |
| `phone` | `int64` — `998902031105`, the `+` lost | `str` — `"+998902031105"` with `dtype={"phone": str}` |
| `monthly_income` | `float64` — whole numbers, but 356 blanks | (a blank is `NaN`, and `NaN` is a float) |

The date comes back as text unless you ask for dates; the phone becomes the number 998 902 031 105 and loses its `+` unless you ask for text.

Other parameters you will need:

| parameter | does | example |
|---|---|---|
| `sep=";"` | another separator | European CSVs |
| `decimal=","` | comma as the decimal mark | `"3,12"` → 3.12 |
| `usecols=[…]` | load only these columns | 5 columns of 50 |
| `nrows=1000` | load only the first rows | a peek at a huge file |
| `thousands=" "` | a space between thousands | `"1 234 567"` → 1234567 |
| `encoding="cp1251"` | a file saved by old Russian-Windows software | garbled Cyrillic (`Ð¢Ð°…`) means the wrong encoding |
| `na_values=["n/a", "-"]` | more spellings of "blank" | `"n/a"` → `NaN` instead of a text column |
| `dtype={"branch_code": str}` | keep a code as text | `"00123"` stays `"00123"`, not 123 |
| `pd.read_excel(path, sheet_name="Loans")` | the same for Excel | week 4's workbook |

**When you use it.**
- At the top of every notebook: one `read_csv` per input file, with its `parse_dates`.
- Whenever an id, a phone or a code must keep its leading `+` or `0`: `dtype=str`.

> ⚠️ **Watch out.** A whole-number column with a single blank becomes `float64`, because `NaN` is a float — `monthly_income` prints as `3894708.0`. Run `dtypes` before you trust a column. To keep whole numbers *and* the blanks, ask for the nullable type: `dtype={"monthly_income": "Int64"}` (capital I) shows `3894708` and `<NA>`; `astype(int)` on a column with `NaN` raises an error instead.

**Your turn.** Read only three columns of `customers_dirty.csv` and keep the phone as text.

**Try it.** One blank in a column of whole numbers:

```python
import pandas as pd

s = pd.Series([1, 2, None])
print(s.dtype, s.tolist())
# float64 [1.0, 2.0, nan]
s2 = pd.Series([1, 2, None], dtype="Int64")
print(s2.dtype, s2.tolist())
# Int64: whole numbers and a missing value
```

> ⚠️ **Quirk: numbers stored as text add up as text.**
>
> - **You expect:** the sum of a column of amounts.
> - **What happens:** if pandas read the column as text — dtype `str` (`object` in older pandas); one `"n/a"` in the file is enough — `sum()` glues the values: `"1"`, `"2"`, `"30"` give `"1230"`.
> - **Why:** `+` on text joins it (`"31150000" * 2` in Day 1 is the same rule). pandas keeps a column it could not read as numbers as text, and does not warn.
> - **Protect yourself:** run `dtypes` after every `read_csv`. Turn a text column into numbers with `pd.to_numeric(col, errors="coerce")` — the bad values become NaN; count them.

```python
import pandas as pd

# as read from a messy file:
amounts = pd.Series(["1", "2", "30"])
print(amounts.dtype, amounts.sum())
# str 1230: glued, not added
print(pd.to_numeric(amounts).sum())   # 33
```

### First look — shape, head, info, describe

**What it is.** Five calls you run on every new table before any analysis: `shape` (rows, columns), `head()` (the first rows), `dtypes` and `info()` (a type and a non-null count per column — the NULL census), `describe()` (count, mean, spread and quartiles of every numeric column).

**How to write it.**

```python
print(loans.shape)  # (rows, columns)
loans.head()        # the first 5 rows; head(10) for ten, tail() for the last 5
```

`(7828, 13)`, then (7 of the 13 columns):

| (index) | loan_id | product | disbursed_at | principal | status | outstanding | dpd |
|---|---|---|---|---|---|---|---|
| 0 | 1 | Consumer loan | 2025-03-28 | 31150000 | active | 9593064 | 0 |
| 1 | 2 | Consumer loan | 2025-12-05 | 40060000 | active | 22246389 | 0 |
| 2 | 3 | Micro loan | 2026-03-28 | 1590000 | closed | 0 | 0 |
| 3 | 4 | Micro loan | 2026-08-23 | 2520000 | active | 1708700 | 0 |
| 4 | 5 | Small business loan | 2024-05-22 | 25590000 | active | 7498297 | 0 |

7 828 rows and 13 columns — one row per loan, the grain of the extract.

```python
loans.info()             # dtype and non-null count per column
```

```output
RangeIndex: 7828 entries, 0 to 7827
 #   Column        Non-Null Count  Dtype
 0   loan_id       7828 non-null   int64
 1   customer      7828 non-null   str
 6   disbursed_at  7828 non-null   datetime64[us]
 7   principal     7828 non-null   int64
 12  bucket        7828 non-null   str
dtypes: datetime64[us](1), int64(5), str(7)
```

(five of the 13 lines shown.) Every column has 7 828 non-null values: this extract has no blanks. Five columns are whole numbers, one is a date, seven are text.

```python
loans.describe()  # numeric columns: count, mean, std, min, quartiles, max
```

| | principal | outstanding | dpd |
|---|---|---|---|
| count | 7 828 | 7 828 | 7 828 |
| mean | 51 709 668 | 26 663 708 | 12.6 |
| 25% | 2 880 000 | 0 | 0 |
| 50% (median) | 5 790 000 | 0 | 0 |
| 75% | 34 712 500 | 7 552 471 | 0 |
| max | 599 060 000 | 586 068 714 | 919 |

(three of the columns, `std` and `min` left out.) The mean principal is 51.7 m but the median is 5.79 m: most loans are small and a few are very large — week 3's two books in one line. The 75 % quartile of `dpd` is still 0, so at least three loans in four are not late — in fact 7 429 of 7 828, 95 %; the worst is 919 days late.

`describe(include="str")` does the same for text: number of distinct values, the most common one and its count. `loans["product"].nunique()` is `COUNT(DISTINCT product)` — 5.

**When you use it.**
- On every new file, before any filter: is the grain right, are the types right, where are the blanks?
- `describe()` to see the shape of a number — skew, outliers, impossible values.

> ⚠️ **Watch out.** `head()` shows only the top of the file, which is often the cleanest part. Use `info()` for the blanks and `describe()` for the extremes — the problems live in the middle and at the edges.

**Your turn.** Print the number of rows and columns, and the largest `dpd`.

### Selecting columns — one bracket or two

**What it is.** `df["name"]` with **one** pair of brackets returns one column as a **Series**. `df[["a", "b"]]` with **two** pairs — a list of names inside the brackets — returns a **DataFrame** with those columns, in that order. It is `SELECT loan_id, product, dpd`.

**How to write it.**

```python
print(type(loans["product"]).__name__)        # one column → Series
loans[["loan_id", "product", "dpd"]].head(3)  # a list of columns → DataFrame
```

| (index) | loan_id | product | dpd |
|---|---|---|---|
| 0 | 1 | Consumer loan | 0 |
| 1 | 2 | Consumer loan | 0 |
| 2 | 3 | Micro loan | 0 |

The first line prints `Series`; the second returns a three-column table — the same 7 828 rows, only the columns you named.

More ways: `loans.columns.tolist()` lists the names; `loans.drop(columns=["customer"])` leaves one out; `loans.rename(columns={"dpd": "days_past_due"})` renames. `loans.product` (a dot) also works for simple names, but not for names with spaces or that clash with a method — brackets always work.

| you write | you get |
|---|---|
| `loans["dpd"]` | a Series — one column |
| `loans[["dpd"]]` | a DataFrame with one column |
| `loans[["loan_id", "dpd"]]` | a DataFrame with two columns |

**When you use it.**
- Before showing or saving a table: keep only the columns a reader needs.
- One column as a Series for a calculation: `loans["outstanding"].sum()`.

> ⚠️ **Watch out.** `loans["loan_id", "dpd"]` — two names in *one* pair of brackets — raises `KeyError: ('loan_id', 'dpd')`: pandas looks for one column with that two-part name. A list of columns needs its own brackets: `loans[["loan_id", "dpd"]]`.

**Your turn.** Which line returns a DataFrame with the columns `customer` and `outstanding`?

### Selecting rows — the boolean mask (&, |, ~, isin, between, str.contains)

**What it is.** A comparison on a column, `loans["dpd"] > 0`, returns a **boolean mask** (*булева маска*): a Series of `True` / `False`, one per row. `loans[mask]` keeps the rows where the mask is `True`. Every `WHERE` you wrote in weeks 1–3 is a mask. Masks combine with `&` (and), `|` (or) and `~` (not).

**How to write it.**

```python
mask = loans["dpd"] > 90  # one True/False per row
print(mask.sum())         # True counts as 1: how many rows pass
loans[mask][["loan_id", "product", "dpd", "status"]].head(3)
```

| (index) | loan_id | product | dpd | status |
|---|---|---|---|---|
| 20 | 22 | Micro loan | 627 | written_off |
| 85 | 88 | Buy now pay later | 422 | written_off |
| 125 | 128 | Consumer loan | 405 | written_off |

234 loans are more than 90 days late; the first three in the file are all written off, and their index labels (20, 85, 125) are the ones they had in `loans`.

The other filters, each with its row count on `loans_status.csv`:

```python
# WHERE status = 'active'
active      = loans[loans["status"] == "active"]
# AND — a bracket round each condition
late_active = loans[(loans["dpd"] > 0) & (loans["status"] == "active")]
# IN (…)
big         = loans[loans["product"].isin(["Small business loan", "Auto loan"])]
# BETWEEN, both ends included
mid         = loans[loans["principal"].between(10_000_000, 50_000_000)]
# LIKE '%Tashkent%'
tash        = loans[loans["branch"].str.contains("Tashkent")]
# NOT
not_closed  = loans[~(loans["status"] == "closed")]
# OR
either      = loans[(loans["dpd"] > 90) | (loans["status"] == "written_off")]
# a half-open period
sept        = loans[(loans["disbursed_at"] >= "2026-09-01") & (loans["disbursed_at"] < "2026-10-01")]
[len(x) for x in [active, late_active, big, mid, tash, not_closed, either, sept]]
```

| SQL | pandas | rows |
|---|---|---|
| `WHERE status = 'active'` | `loans["status"] == "active"` | 3 352 |
| `… AND …` | `(loans["dpd"] > 0) & (loans["status"] == "active")` | 151 |
| `IN ('SME', 'AUTO')` | `loans["product"].isin([…])` | 1 172 |
| `BETWEEN 10 m AND 50 m` | `loans["principal"].between(10_000_000, 50_000_000)` | 2 087 |
| `LIKE '%Tashkent%'` | `loans["branch"].str.contains("Tashkent")` | 3 020 |
| `NOT (status = 'closed')` | `~(loans["status"] == "closed")` | 3 586 |
| `… OR …` | `(loans["dpd"] > 90) \| (loans["status"] == "written_off")` | 234 |
| September 2026 | `(d >= "2026-09-01") & (d < "2026-10-01")` | 361 |

151 active loans are late; 361 loans were disbursed in September 2026. `loans.query("dpd > 90 and product == 'Micro loan'")` is a readable alternative for long conditions (76 rows), with `and` / `or` allowed inside the string.

> 💡 **Key idea.** A filter is two steps: build a column of True/False (the mask), then keep the True rows with `[ ]`. `&`, `|`, `~` combine masks, one bracket per condition.

**When you use it.**
- Every `WHERE`: a status, a period, a product list, a text search.
- `mask.sum()` alone, when the question is "how many?" — `True` counts as 1.

> ⚠️ **Watch out.** Write `&`, `|`, `~` — never `and`, `or`, `not`, which raise `ValueError: The truth value of a Series is ambiguous`. Put **brackets round every condition**: `&` binds tighter than `>`, so `loans["dpd"] > 0 & loans["status"] == "active"` is read wrongly. A chained comparison fails the same way: `0 < loans["dpd"] <= 30` hides an `and` — write `loans["dpd"].between(1, 30)` or two masks. And `between` includes both ends — on a column with times, use `>=` and `<` (the half-open rule).

**Your turn.**

### loc and iloc — rows by label, rows by position

**What it is.** `.loc[rows, columns]` selects by **label**: the index label of a row, the name of a column, or a mask. `.iloc[rows, columns]` selects by **position**: 0 is the first row, whatever its label. On a fresh frame the labels are 0, 1, 2 … and the two agree; after a filter or a sort they do not.

**How to write it.**

```python
# the filter keeps the original labels
late = loans[loans["dpd"] > 0]
# the labels of the first three late loans
print(late.index[:3].tolist())
# position 0 and label 20: the same row
print(late.iloc[0]["loan_id"], late.loc[20, "loan_id"])
# loc = a mask + a column list
late.loc[late["dpd"] > 400, ["loan_id", "product", "dpd"]].head(3)
```

```text
[20, 54, 85]
22 22
```

The first late loan sits at **position** 0 of `late` but keeps its **label** 20 from `loans`; both point at loan 22. The last line returns loans 22, 88 and 128 — the first three more than 400 days late.

| | `.loc` | `.iloc` |
|---|---|---|
| selects by | label, column name, mask | integer position |
| `x.loc[0]` / `x.iloc[0]` | the row whose label is 0 (`KeyError` if it was filtered out) | the first row, always |
| slice `[0:3]` | labels 0 **to 3 included** | positions 0, 1, 2 (3 excluded) |
| typical use | `loans.loc[loans["dpd"] > 90, ["loan_id", "dpd"]]` | `loans.iloc[:5]`, `loans.iloc[-1]` |

**When you use it.**
- `loc` for conditions and names: the `SELECT … WHERE` in one call, and for writing values (`loans.loc[mask, "flag"] = 1`).
- `iloc` for "the first n rows" or "the last row".
- `reset_index(drop=True)` when you want positions and labels to agree again.

> ⚠️ **Watch out.** `late.loc[0]` raises `KeyError: 0` — label 0 is loan 1, which is not late. Positions are `iloc`; labels are `loc`. After a filter, mixing them gives the wrong row or an error.

**Your turn.** The `loan_id` of the tenth late loan in the file (position 9 of the late loans).

> ⚠️ **Quirk: `[1:3]` is three rows in `loc` and two in `iloc`.**
>
> - **You expect:** `s.loc[1:3]` and `s.iloc[1:3]` to give the same rows on a fresh 0, 1, 2 … index.
> - **What happens:** `loc` returns labels 1, 2 **and 3**; `iloc` returns positions 1 and 2.
> - **Why:** `iloc` slices like every Python list — the end is left out. `loc` slices by label, and a label has no "next one" to stop before, so the end is kept.
> - **Protect yourself:** for "the first n rows" use `iloc[:n]` or `head(n)`; with `loc`, name the last label you want.

```python
import pandas as pd

s = pd.Series([10, 20, 30, 40, 50])
print(s.loc[1:3].tolist())    # label 3 in
print(s.iloc[1:3].tolist())   # position 3 out
```

### Sorting — sort_values and nlargest

**What it is.** `df.sort_values("col")` returns the rows in the order of a column — `ORDER BY`. `ascending=False` sorts largest first; a list of columns sorts by several keys. `df.nlargest(n, "col")` is the shortcut for "the top n".

**How to write it.**

```python
# ORDER BY outstanding DESC
top = loans.sort_values("outstanding", ascending=False)
top[["loan_id", "product", "outstanding", "dpd"]].head(3)  # … LIMIT 3
```

| (index) | loan_id | product | outstanding | dpd |
|---|---|---|---|---|
| 4549 | 4597 | Small business loan | 586068714 | 0 |
| 6405 | 6478 | Small business loan | 577813979 | 0 |
| 2905 | 2936 | Small business loan | 574094643 | 0 |

The three largest balances are SME loans of 574–586 m, all current. The index labels are scrambled now: a sort moves rows, labels and all.

```python
# the shortcut
print(loans.nlargest(3, "principal")["loan_id"].tolist())
# two keys
loans.sort_values(["product", "dpd"], ascending=[True, False])[["product", "dpd"]].head(3)
```

`[2861, 4570, 4601]` — the three largest principals, 599.06 / 598.45 / 597.54 m. The two-key sort puts products A→Z and, inside each product, the latest loan first: Auto loans at 771, then 739 days.

**When you use it.**
- Rankings and top-n lists: the largest balances, the latest loans.
- A natural order before printing: months, buckets (`sort_index()` sorts by the index instead).

> ⚠️ **Watch out.** `sort_values` returns a **new** frame. `loans.sort_values("dpd")` on its own line changes nothing in `loans` — keep the result: `top = loans.sort_values(…)`. `inplace=True` is no shortcut: it changes the frame and returns `None`, so `loans = loans.sort_values("dpd", inplace=True)` leaves you with no table at all.

**Your turn.** The `loan_id` of the Auto loan with the largest outstanding.

### New columns — vectorised arithmetic and astype

**What it is.** `df["new"] = expression` adds a column. The expression works on **whole columns at once** (*векторизация*, vectorised): `loans["outstanding"] / 1e9` divides all 7 828 values in one step, with no loop. `astype` converts a column's type — the `CAST` of SQL.

**How to write it.**

```python
# every row at once
loans["outstanding_bn"] = loans["outstanding"] / 1e9
# two columns, row by row
loans["repaid_share"] = 1 - loans["outstanding"] / loans["principal"]
# a boolean column
loans["is_late"] = loans["dpd"] > 0
print(round(loans["outstanding_bn"].sum(), 1), loans["is_late"].sum())
loans[["loan_id", "principal", "outstanding", "repaid_share", "is_late"]].head()
```

| (index) | loan_id | principal | outstanding | repaid_share | is_late |
|---|---|---|---|---|---|
| 0 | 1 | 31150000 | 9593064 | 0.692036 | False |
| 1 | 2 | 40060000 | 22246389 | 0.444673 | False |
| 2 | 3 | 1590000 | 0 | 1.000000 | False |
| 3 | 4 | 2520000 | 1708700 | 0.321944 | False |
| 4 | 5 | 25590000 | 7498297 | 0.706983 | False |

`208.7 399`: the book is 208.7 bn and 399 loans are late. Loan 1 has repaid 69 % of its principal; loan 3, closed, 100 %.

Types: `astype(int)`, `astype(float)`, `astype(str)`, `astype("category")` (text with few values: less memory and an order), `astype(bool)`. For text that may be garbage, `pd.to_numeric(col, errors="coerce")` turns what it cannot read into `NaN` instead of crashing:

```python
print(loans["term"].astype(str).head(3).tolist())              # int → text
pd.to_numeric(pd.Series(["658", "", "n/a"]), errors="coerce")  # 658.0, NaN, NaN
```

The term becomes the text `['24', '18', '3']`; the scores `"658"`, `""`, `"n/a"` become 658.0, NaN, NaN.

**When you use it.**
- Every derived number: a share, a ratio, a flag, an amount in bn.
- `astype` after reading, when the guess was wrong; `to_numeric(errors="coerce")` on dirty text.

> ⚠️ **Watch out.** Assign through `.loc`, never through two brackets in a row. `loans[loans["dpd"] > 90]["flag"] = 1` (chained indexing) writes into a temporary **copy** and changes nothing in `loans` — pandas only warns `ChainedAssignmentError: A value is being set on a copy of a DataFrame or Series through chained assignment`. Write `loans.loc[loans["dpd"] > 90, "flag"] = 1`. When you cut a frame to keep working on it, take a copy on purpose: `late = loans[loans["dpd"] > 0].copy()`. Since pandas 3.0 (Copy-on-Write) a cut already behaves as a frame of its own and the `.copy()` is optional, but it says what you mean, and older pandas warns `SettingWithCopyWarning` without it.

**Your turn.** Add a column `paid` = principal − outstanding and print its total in bn, one decimal.

**Try it.** The chained line changes nothing; `.loc` works:

```python
import pandas as pd

df = pd.DataFrame({"dpd": [0, 95, 120],
                   "flag": [0, 0, 0]})
# chained: writes into a copy
df[df["dpd"] > 90]["flag"] = 1
print(df["flag"].tolist())   # [0, 0, 0]
# one step, on df itself
df.loc[df["dpd"] > 90, "flag"] = 1
print(df["flag"].tolist())   # [0, 1, 1]
```

pandas 3 also prints a *ChainedAssignmentError* warning for the chained line: it never writes into `df`. (Older pandas warned with *SettingWithCopyWarning* and sometimes did write — one more reason to use `.loc` every time.)

### Dates — the .dt accessor

**What it is.** Once a column is `datetime64`, **`.dt`** (*аксессор .dt*) opens the calendar for every value at once: `.dt.year`, `.dt.month`, `.dt.quarter`, `.dt.day_name()`, `.dt.to_period("M")` (the month). Subtracting two dates gives a duration; `.dt.days` turns it into a number.

**How to write it.**

```python
AS_OF = pd.Timestamp("2026-10-01")
loans["year"] = loans["disbursed_at"].dt.year
# week 3's strftime('%Y-%m')
loans["month"] = loans["disbursed_at"].dt.to_period("M")
loans["days_on_book"] = (AS_OF - loans["disbursed_at"]).dt.days
print(loans["year"].value_counts().to_dict())
loans[["loan_id", "disbursed_at", "year", "month", "days_on_book"]].head()
```

| (index) | loan_id | disbursed_at | year | month | days_on_book |
|---|---|---|---|---|---|
| 0 | 1 | 2025-03-28 | 2025 | 2025-03 | 552 |
| 1 | 2 | 2025-12-05 | 2025 | 2025-12 | 300 |
| 2 | 3 | 2026-03-28 | 2026 | 2026-03 | 187 |
| 3 | 4 | 2026-08-23 | 2026 | 2026-08 | 39 |
| 4 | 5 | 2024-05-22 | 2024 | 2024-05 | 862 |

`{2026: 3051, 2025: 3041, 2024: 1736}`: as many loans in nine months of 2026 as in all of 2025. Loan 1 has been on the book 552 days on the as-of date.

| you want | `.dt` | SQL (week 3) |
|---|---|---|
| the year | `.dt.year` | `strftime('%Y', d)` |
| the month as a period | `.dt.to_period("M")` | `strftime('%Y-%m', d)` |
| the quarter | `.dt.quarter` | `(month + 2) / 3` |
| the weekday | `.dt.day_name()` | `strftime('%w', d)` |
| days between | `(a - b).dt.days` | `julianday(a) - julianday(b)` |

A datetime column compares with a text date directly: `loans["disbursed_at"] >= "2026-09-01"` works — pandas reads the string as a date.

**When you use it.**
- Grouping by period: per month, per quarter, per year.
- Ages and durations: days on book, days past due, age at application.

> ⚠️ **Watch out.** `.dt` works only on `datetime64`. On a column read without `parse_dates` it raises `AttributeError: Can only use .dt accessor with datetimelike values`. Fix it once, at the top: `parse_dates=[…]` or `pd.to_datetime(col)`.

**Your turn.** The average days on book of the **active** loans, rounded to a whole day.

### value_counts — count per value

**What it is.** `col.value_counts()` counts the rows for each distinct value — `GROUP BY col` with `COUNT(*)` for one column. `normalize=True` gives shares instead of counts; `nunique()` counts the distinct values.

**How to write it.**

```python
print(loans["product"].nunique())  # COUNT(DISTINCT product)
loans["status"].value_counts()     # largest first
```

| status | count |
|---|---|
| closed | 4242 |
| active | 3352 |
| written_off | 190 |
| default | 44 |

5 products; 4 242 loans are closed, 3 352 active, 190 written off and 44 in default.

```python
loans["product"].value_counts(normalize=True).mul(100).round(1)    # shares in %
```

Micro 34.1 % · Consumer 30.9 · BNPL 20.0 · SME 10.0 · Auto 5.0 — the shares of the loan count, adding to 100.

| option | does |
|---|---|
| `normalize=True` | shares instead of counts |
| `.sort_index()` after it | the natural order of the labels (buckets 0 … 90+) instead of by count |
| `dropna=False` | shows `NaN` as a row of its own |

**When you use it.**
- The first question about any text column: which values, how many of each?
- Shares of a whole: product mix, status mix.

> ⚠️ **Watch out.** By default `value_counts` drops `NaN` silently — the blanks are not in the list, and the shares are shares of the non-blank rows. Pass `dropna=False` to see them.

**Your turn.** The share of written-off loans, in % with two decimals.

**Try it.**

```python
import pandas as pd

method = pd.Series(["card", None, "card",
                    None, "cash"])
print(method.value_counts().to_dict())
# the 2 blanks come back:
vc = method.value_counts(dropna=False)
print(vc.to_dict())
```

Five payments, and the first count shows three. Shares made from it would be shares of the three filled rows.

### Missing values — isna, fillna, dropna

**What it is.** **`NaN`** (*пропуск*) is pandas' NULL: a cell with no value (`NaT` for a date). Aggregates skip it, like SQL's `AVG`. `isna()` finds it, `fillna(x)` writes a value into the gaps, `dropna()` removes the rows that have it.

**How to write it.**

```python
cust = pd.read_csv("../excel/customers_dirty.csv")
inc = cust["monthly_income"]
# columns with blanks, and how many
print(cust.isna().sum()[lambda s: s > 0])
print(len(inc), inc.count())  # rows vs non-blank values
print(round(inc.mean()), round(inc.fillna(0).mean()), round(inc.fillna(inc.median()).mean()))
print(len(cust.dropna(subset=["monthly_income"])))
```

| | value |
|---|---|
| missing `monthly_income` | 356 (the only column with blanks) |
| rows / non-blank incomes | 6 040 / 5 684 |
| `mean()` — blanks skipped | 15 245 933 |
| `fillna(0).mean()` | 14 347 331 |
| `fillna(median).mean()` | 14 812 719 |
| rows after `dropna(subset=["monthly_income"])` | 5 684 |

356 customers have no income. The plain mean, over the 5 684 known incomes, is 15.2 m; filling the gaps with 0 drops it to 14.3 m, because it invents 356 people who earn nothing.

| call | does |
|---|---|
| `col.isna()` / `col.notna()` | the mask of blanks / non-blanks |
| `col.count()` vs `len(col)` | non-blank values vs rows — the difference is the NULL census |
| `col.fillna(0)` | 0 into the gaps — `COALESCE(x, 0)` |
| `df.dropna(subset=["col"])` | drop the rows where *that* column is blank |
| `df.dropna()` | drop a row if **any** column is blank |

**When you use it.**
- `isna().sum()` on every new table, next to `info()`.
- `fillna(0)` only where a blank truly means zero: no payment → 0 paid.

> 💡 **Key idea.** `fillna(0)` is a decision, not a cleaning step. For a *count* (no payment → 0 paid) it is right; for an *income* it is a lie that drops the mean by 0.9 m. Keep the NaN and show an "unknown" band, or fill with a labelled estimate.

> ⚠️ **Watch out.** `col == np.nan` never finds a blank — `NaN` is not equal to anything, itself included. Use `col.isna()`. And `dropna()` with no `subset=` drops a row when *any* column is blank — on a wide table that can be most of the file.

**Your turn.** How many customers have a known income?

> ⚠️ **Watch out.** A `NaN` fails **every** comparison: for a blank income both `inc > 10_000_000` and `inc <= 10_000_000` are `False`. Split the customers into "high" and "not high" with two masks and the 356 blanks fall out of both groups — the counts add up to 5 684, not 6 040. It is week 2's NULL in a `WHERE`; make the third group explicit with `inc.isna()`. And `sum()` of a column that is entirely `NaN` returns 0, not `NaN` — `sum(min_count=1)` keeps the gap visible.

**Your turn.** Check it on the customers file.

**Try it.** NaN is not equal even to itself:

```python
import numpy as np
import pandas as pd

print(np.nan == np.nan)        # False
inc = pd.Series([5_000_000, np.nan])
print((inc == np.nan).sum())   # 0
print(inc.isna().sum())        # 1
```

> ⚠️ **Quirk: the sum of nothing is 0, the average of nothing is NaN.**
>
> - **You expect:** pandas to tell you when there is nothing to add, as SQL's `SUM` does with NULL (week 2).
> - **What happens:** `sum()` skips NaN, so a column of only blanks — or an empty selection — sums to **0**. `mean()` of the same is NaN. And `mean()` of `[1, NaN, 3]` is 2: the blank is skipped, not counted as 0.
> - **Why:** pandas starts every sum at 0 and adds what it finds; an average needs at least one value.
> - **Protect yourself:** show next to a total how many values it is made of (`count()`); or ask for `sum(min_count=1)`, which returns NaN when there is nothing to add — the SQL behaviour.

```python
import numpy as np
import pandas as pd

blank = pd.Series([np.nan, np.nan])
print(blank.sum(), blank.mean())   # 0.0 nan
print(blank.count())               # 0
print(blank.sum(min_count=1))      # nan
# the blank is skipped, not counted as 0:
print(pd.Series([1, np.nan, 3]).mean())
```

### pd.cut — buckets without a CASE

(Animated explanation)
pd.cut: which side owns the edge?
- `pd.cut` with the edges −1, 0, 30, 60, 90, ∞. Every interval is [[right-closed|it contains its right edge but not its left one: (30, 60] holds 60, not 30]]: ● marks the end that is in.
- dpd 60 sits on an edge. The right end is closed, so 60 belongs to (30, 60] → **31-60**.
- One day more.
- 61 → 61-90. And 0 → (−1, 0] → **0**: that is why the first edge is −1, not 0.
- The trap: start the edges at 0. The first interval is (0, 30], which does **not** hold 0 → NaN. All 7 429 current loans lose their bucket, with no error.
- `right=False` closes the **left** end instead: [5, 10) holds 5. Rules written with `<` — 'under 5 m' — need it: an income of exactly 5 m is **5-10m**.
- Press **Flip the closed side** and watch 5 m jump to <5m: the same edges, a different rule. Press it again to flip back.
- Back to the dpd edges. Drop the edge values yourself: each lands in the interval whose **right** end it reaches.

**What it is.** `pd.cut(col, bins=edges, labels=…)` puts every number into an interval and returns its label — the `CASE WHEN dpd <= 30 THEN …` of week 2 in one line. Intervals are **right-closed** by default: `(30, 60]` contains 60 but not 30.

**How to write it.**

```python
edges  = [-1, 0, 30, 60, 90, np.inf]
labels = ["0", "1-30", "31-60", "61-90", "90+"]
loans["bucket_pd"] = pd.cut(loans["dpd"], bins=edges, labels=labels)
loans["bucket_pd"].value_counts().sort_index()
```

| bucket_pd | count |
|---|---|
| 0 | 7429 |
| 1-30 | 124 |
| 31-60 | 25 |
| 61-90 | 16 |
| 90+ | 234 |

7 429 loans are current and 234 are past 90 days — the same five numbers as the SQL `CASE` of week 2 and the file's own `bucket` column.

| `dpd` | interval | label |
|---|---|---|
| 0 | (−1, 0] | 0 |
| 30 | (0, 30] | 1-30 |
| 31 | (30, 60] | 31-60 |
| 91 | (90, ∞] | 90+ |

`right=False` flips to left-closed intervals, `[0, 5 m)` — for rules written with `<`, like income bands. `pd.qcut(col, 10)` cuts into ten groups of equal size — week 3's `NTILE(10)`. The result is a `category` with the labels in order, so `sort_index()` gives 0 … 90+.

**When you use it.**
- Numeric ranges that are a definition: DPD buckets, income bands, ticket sizes.

> ⚠️ **Watch out.** The first edge must be **below** the smallest value. With edges `[0, 30, …]` the first interval is `(0, 30]`, which does not contain 0 — all 7 429 loans with `dpd = 0` become `NaN`. Start at −1.

**Your turn.** Cut `monthly_income` into the bands `<5m`, `5-10m`, `10-20m`, `20m+` with `right=False`. How many customers are in `<5m`?

### SQL ↔ pandas — the translation table

**What it is.** Every SQL clause you know has a pandas spelling. This table is today's vocabulary in one place, with week 4's Excel in the middle.

**How to write it.**

| You want | SQL (weeks 1–3) | Excel (week 4) | pandas |
|---|---|---|---|
| the table | `SELECT * FROM loans` | the sheet / `tblLoans` | `loans = pd.read_csv(...)` |
| some columns | `SELECT loan_id, dpd` | hide columns | `loans[["loan_id", "dpd"]]` |
| a filter | `WHERE dpd > 0 AND status = 'active'` | Filter / `COUNTIFS` | `loans[(loans.dpd > 0) & (loans.status == "active")]` |
| a list filter | `IN ('SME', 'AUTO')` | Filter, tick two | `.isin([...])` |
| text search | `LIKE '%Tashkent%'` | `SEARCH` / Filter → contains | `.str.contains("Tashkent")` |
| sort | `ORDER BY outstanding DESC` | Sort Z→A | `.sort_values("outstanding", ascending=False)` |
| top n | `LIMIT 3` / `TOP 3` | — | `.head(3)` / `.nlargest(3, "col")` |
| a computed column | `principal / 1e9 AS bn` | a formula column | `loans["bn"] = loans.principal / 1e9` |
| convert type | `CAST(x AS TEXT)` | `TEXT` / `VALUE` / `DATEVALUE` | `.astype(str)` / `pd.to_numeric` / `pd.to_datetime` |
| month of a date | `strftime('%Y-%m', d)` | `TEXT(d, "yyyy-mm")` | `.dt.to_period("M")` |
| count per value | `GROUP BY status` + `COUNT(*)` | `COUNTIFS` / pivot | `.value_counts()` |
| distinct count | `COUNT(DISTINCT region)` | `ROWS(UNIQUE(...))` | `.nunique()` |
| NULL test | `IS NULL` | `ISBLANK` / `COUNTBLANK` | `.isna()` |
| replace NULL | `COALESCE(x, 0)` | `IF(ISBLANK(x), 0, x)` | `.fillna(0)` |
| buckets | `CASE WHEN dpd <= 30 …` | nested `IF` / `XLOOKUP` approximate | `pd.cut(dpd, edges, labels=...)` |
| save | `CREATE TABLE AS` / export | Save As CSV | `.to_csv("f.csv", index=False)` |

Sixteen rows, one meaning each. The pandas column is the only one of the three that is a *file you can re-run on a new input*.

**When you use it.**
- When you know the SQL and need the pandas: find the row, copy the spelling.
- Reading someone else's notebook: translate back to the SQL you can check.

**Your turn.**

### Putting it together

One request, every tool of the day: *the late active loans of the Tashkent branches — largest balance first, with days on book and bucket — saved as a CSV for the collections team.* A **mask** with three conditions, **`loc`** with a column list, a **new column** from **dates**, **`pd.cut`**, a **sort**, then **`to_csv`** to write it back.

```python
AS_OF = pd.Timestamp("2026-10-01")
cond = (loans["status"] == "active") & (loans["dpd"] > 0) & loans["branch"].str.contains("Tashkent")
watch = loans.loc[cond, ["loan_id", "branch", "product", "disbursed_at", "outstanding", "dpd"]].copy()
watch["days_on_book"] = (AS_OF - watch["disbursed_at"]).dt.days
watch["bucket"] = pd.cut(watch["dpd"], [-1, 0, 30, 60, 90, np.inf], labels=["0", "1-30", "31-60", "61-90", "90+"])
watch = watch.sort_values("outstanding", ascending=False)
# index=False, or Excel gets a nameless first column
watch.to_csv("tashkent_watchlist.csv", index=False)
print(len(watch), watch["outstanding"].sum())
watch.head()
```

| (index) | loan_id | branch | product | outstanding | dpd | days_on_book | bucket |
|---|---|---|---|---|---|---|---|
| 4519 | 4567 | Tashkent Central | Auto loan | 301482053 | 84 | 206 | 61-90 |
| 280 | 285 | Tashkent North | Small business loan | 296861300 | 11 | 134 | 1-30 |
| 429 | 434 | Tashkent Central | Small business loan | 264936631 | 21 | 205 | 1-30 |
| 5356 | 5418 | Tashkent South | Auto loan | 254851103 | 26 | 238 | 1-30 |
| 3790 | 3827 | Tashkent North | Auto loan | 205320039 | 48 | 109 | 31-60 |

61 loans, 2 718 083 360 soum outstanding. The top of the list is an Auto loan of 301 m that is already 84 days late — one step from 90+.

`.copy()` after the `loc` makes `watch` a frame of its own: the new columns land on `watch` and never touch `loans` (pandas 3 works this way even without `.copy()`; older pandas warned `SettingWithCopyWarning` there). `to_csv(…, index=False)` writes the file Bekzod opens; `to_excel("f.xlsx", sheet_name="…", index=False)` does the same for Excel (it needs the `openpyxl` package, which Anaconda has).

**Your turn.** The same list for the Samarkand branch: how much outstanding does it hold?

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Read a file into a DataFrame — [Complete Python Pandas Data Science Tutorial! (2025 Updated Edition) (Keith Galli), 08:25](https://youtu.be/2uvysYbKdjM?t=505&end=822)
- ▶ Selecting columns, loc / iloc — same video, [15:28](https://youtu.be/2uvysYbKdjM?t=928&end=1160)
- ▶ Sorting — same video, [21:11](https://youtu.be/2uvysYbKdjM?t=1271&end=1381)
- ▶ Filtering (boolean mask, multiple conditions) — same video, [24:12](https://youtu.be/2uvysYbKdjM?t=1452&end=1678)
- ▶ New columns and dates (`pd.to_datetime`, `.dt`) — same video, [41:40](https://youtu.be/2uvysYbKdjM?t=2500&end=2798)
- ▶ Dates in depth — [Python Pandas Tutorial (Part 10): Working with Dates and Time Series Data (Corey Schafer), 03:35](https://youtu.be/UFuo7EHI8zc?t=215)
- ▶ Missing values (isna, fillna, dropna) — Keith Galli same video, [58:33](https://youtu.be/2uvysYbKdjM?t=3513&end=3845)
- ▶ Missing values (alternative, slower) — [Python Pandas Tutorial 5: Handle Missing Data: fillna, dropna, interpolate (codebasics), 04:10](https://youtu.be/EaGbS7eWSs0?t=250&end=455)

- RU deck (TBC Data Analytics 2.0, if you have it) `4.3_Python.pdf`: Series and DataFrame pp. 10–15, dtypes and `astype` / `to_numeric` pp. 14–22, reading and writing pp. 23–30, first look pp. 31–37, `loc` / `iloc` / boolean indexing pp. 38–44, missing values pp. 45–52, `.str` pp. 55–67, categorical pp. 68–72, sorting pp. 104–108. (pp. 82–103 are tomorrow.)
- *Russian terms:* датафрейм = DataFrame, серия = Series, индекс = index, булева маска = boolean mask, фильтрация = filtering, пропущенные значения / NaN = missing values, приведение типов = type casting, категориальный тип = category dtype, биннинг / разбиение на корзины = `pd.cut`.

---

## 2. Worked example — the six tiles in one function (15 min)

Bekzod's tiles from week 4 Day 1, as a function of the DataFrame, so that next month is `portfolio_summary(pd.read_csv("loans_status_2026-11.csv"))`. Each step uses one concept from section 1, in the order you learned them.

1. **Step 1 — read_csv with parse_dates.** The function takes the `loans` frame read in section 1. Its dates are real dates, so they compare with `AS_OF`.
2. **Step 2 — boolean masks.** `df["status"] == "active"` and the two-condition period `in_2026` (half-open: `>=` 1 January, `<` the as-of). `.sum()` counts the `True` rows.
3. **Step 3 — loc with a mask and a column.** `df.loc[df["dpd"] > 30, "outstanding"].sum()` is `SUM(outstanding) WHERE dpd > 30`.
4. **Step 4 — vectorised arithmetic, inside a function.** Each ratio is two column sums divided once; `def` and `return` (Day 1) make the six tiles one call you can re-run.

```python
AS_OF = pd.Timestamp("2026-10-01")

def portfolio_summary(df):
    out = df["outstanding"].sum()
    in_2026 = (df["disbursed_at"] >= "2026-01-01") & (df["disbursed_at"] < AS_OF)
    return {
        "loans": len(df),
        "active": (df["status"] == "active").sum(),
        "outstanding": out,
        "disbursed_2026": in_2026.sum(),
        "par30_pct": round(100 * df.loc[df["dpd"] > 30, "outstanding"].sum() / out, 2),
        "npl90_pct": round(100 * df.loc[df["dpd"] > 90, "outstanding"].sum() / out, 2),
    }

portfolio_summary(loans)
# {'loans': 7828, 'active': np.int64(3352), 'outstanding': np.int64(208723504430),
#  'disbursed_2026': np.int64(3030), 'par30_pct': np.float64(3.12),
#  'npl90_pct': np.float64(2.55)}
```

Every line is a SQL clause you have written: `len` is `COUNT(*)`, `(cond).sum()` is `SUM(CASE WHEN … THEN 1 END)`, `df.loc[mask, "col"].sum()` is `SUM(col) WHERE mask`. One number differs from week 4's tile on purpose: **3 030**, not 3 051 — this function uses the half-open `< AS_OF`, so the 21 loans disbursed on the as-of day itself (852 760 000) are out; week 4's `COUNTIFS` used `<=`. Neither is wrong; the function's docstring must say which.

The dict shows `np.int64(3352)` and `np.float64(3.12)`, and Jupyter on your computer shows the same: a pandas sum or mean is a **numpy number**, and since numpy 2.0 its `repr` names the type. The number is 3 352 all the same — `print(x)` writes it bare, and `int(x)` / `float(x)` turn it into a plain Python number (do that before a dict like this goes into a JSON file or a report).

> 💡 **Key idea.** A monthly notebook is safe only with an **assert** pinning the known values: `assert portfolio_summary(loans)["outstanding"] == 208_723_504_430`. If the November file has a new status spelling or a text date, the assert fails before Bekzod sees a wrong tile — `day2_starter.ipynb` pins all six.

---

## 3. Practice (50 min)

Each task's editor already loads `loans_status.csv` with `parse_dates` (P12 loads `customers_dirty.csv`). Write your code under `# your code`, **▶ Run**, then **✔ Check** — print the number the task asks for. In Jupyter, `data/python/day2_starter.ipynb` has the walk-through cells; add a cell per task.

**P1.** *(Series and DataFrame)* Make a **Series** of the five bucket counts (7 429, 124, 25, 16, 234) with the labels `0` … `90+` as its index (`pd.Series(values, index=labels)`). Print the 90+ count by its label, the total, and the 90+ share of all loans in %.

**P2.** *(read_csv)* Read `loans_status.csv` *without* `parse_dates`. What is the dtype of `disbursed_at`, and what does `loans["disbursed_at"].dt.year` do? Fix it two ways.

**P3.** *(first look)* From `describe()` alone: median principal, mean principal, the 75th percentile of `dpd`, max `dpd`. What does the gap between mean and median tell you? Type the median principal.

**P4.** *(selecting columns)* Select the two money columns, `principal` and `outstanding`, as a DataFrame and print their sums in one call. How much was lent in total?

**P5.** *(boolean masks)* Three filters, three counts: SME or Auto (`isin`), principal between 10 m and 50 m (`between`), branch containing `Tashkent` (`str.contains`). Then the September-2026 loans with the half-open rule — and show that `between("2026-09-01", "2026-09-30")` happens to agree here, and why it would not on `applied_at`.

**P6.** *(loc and iloc)* With `loc`, show the `customer`, `status` and `outstanding` of loan 4570 (a mask on `loan_id` plus a column list). With `iloc`, print the `loan_id` of the last row of the file. Why is it not 7 828?

**P7.** *(sorting)* The three loans with the largest `outstanding`, with `loan_id`, `product`, `outstanding` only — once with `sort_values().head(3)`, once with `nlargest`. Then the three largest by `principal`.

**P8.** *(new columns)* Add `repaid_share = 1 − outstanding ÷ principal`. How many **active** loans have already repaid more than half of their principal?

**P9.** *(dates)* Add `year` and `month` columns from `disbursed_at`; count 2026 loans per month and per quarter.

**P10.** *(value_counts)* How many loans are late (`dpd > 0`) per `status`? Which combination should not exist, and does it?

**P11.** *(value_counts)* Shares with `value_counts(normalize=True)`: products, grades, channels of *loans* (channel is not in the file — which week-3 fact lets you derive it from `product`?).

**P12.** *(missing values)* `customers_dirty.csv`: how many `monthly_income` are missing, the mean with and without `fillna(0)`, the mean after a median fill, and the row count after `dropna()` with and without `subset`.

**P13.** *(pd.cut)* `pd.cut` on `dpd` with the standard edges; prove it equals the file's `bucket` column for all 7 828 rows. Then the mean and median `dpd` of the late loans — which one goes in the report?

**P14.** *(SQL ↔ pandas)* Which pandas line returns what this SQL returns? `SELECT loan_id, outstanding FROM loans WHERE region = 'Nukus' AND dpd > 30 ORDER BY outstanding DESC LIMIT 5`

**P15.** *(putting it together)* Build a frame `bucket · loans · outstanding · share_pct` (five rows, shares of total outstanding) and write it to `portfolio_buckets.csv` (in Jupyter, also to a sheet `buckets` of `portfolio.xlsx`, then open it and check the total).

> 🚀 **Stretch (optional, +5 XP).** **P16.** *(putting it together)* PAR30 by product and by region in one line each (Σ outstanding where `dpd > 30` ÷ Σ outstanding, per group — you may peek at tomorrow's `groupby`). Which region would you flag, and what makes a small region's rate fragile?

### Mistakes that cost a point this week

- `and` / `or` between masks, or missing brackets — `ValueError` or a silently wrong mask.
- `loc` with a position or `iloc` with a label after a filter — the wrong row, no error.
- Chained indexing (`df[mask]["col"] = …`) — the assignment lands on a copy.
- `between` on a datetime with a time component — the last day's afternoon lost.
- `fillna(0)` on a money or income column — a confident wrong mean.
- `dropna()` without `subset` on a wide table — half the rows gone.
- `pd.cut` with the first edge at 0 — every `dpd = 0` loan becomes `NaN`.
- `to_csv` without `index=False` — the ghost first column.
- A notebook whose numbers are typed into the Markdown instead of printed by the code.

---

## 4. Self-check

---

## 5. Company corner <span class="badge company">Buckets and PAR in pandas</span>

The portfolio's three risk numbers, from `loans_status.csv`, each a one-liner once the vocabulary is in place:

```python
edges, labels = [-1, 0, 30, 60, 90, np.inf], ["0", "1-30", "31-60", "61-90", "90+"]
loans["bucket_pd"] = pd.cut(loans["dpd"], bins=edges, labels=labels)
# 7429 · 124 · 25 · 16 · 234
buckets = loans["bucket_pd"].value_counts().sort_index()

# 208 723 504 430
total = loans["outstanding"].sum()
# 6 507 526 953 / total = 3.12 %
par30 = loans.loc[loans["dpd"] > 30, "outstanding"].sum() / total
# 5 319 475 527 / total = 2.55 %
npl90 = loans.loc[loans["dpd"] > 90, "outstanding"].sum() / total
```

**DPD buckets** (*корзины просрочки*): the five standard labels, **right-closed** so that day 30 is still early delinquency and day 31 is the first day of the next bucket — the definition the glossary states and `pd.cut`'s default; a company that uses 1–7 / 8–30 changes `edges`, nothing else. **PAR30** (*портфель под риском*) = outstanding of loans with `dpd > 30` ÷ total outstanding: 3.12 % — 275 loans in 31+ hold 6.51 bn of the 208.7 bn. **NPL90** = the same with `dpd > 90`: 2.55 %, 5.32 bn on 234 loans (44 in default, 190 written off).

> 💡 **Key idea.** The numerator of PAR30 is the loan's **whole outstanding**, not the overdue instalments — a 500 m SME loan one day past 30 puts the full 500 m into PAR30. That is why PAR is a *portfolio* measure and why Nilufar's committee watches the bucket *counts* alongside it.

The function `portfolio_summary(df)` (section 2) returns the six tiles — loans 7 828 · active 3 352 · outstanding 208 723 504 430 · disbursed 2026 3 030 · PAR30 3.12 · NPL90 2.55 — and `buckets` the five rows; `to_excel` puts both on Bekzod's sheet. Three checks before it ships, as asserts in the notebook: `len(df) == df["loan_id"].nunique()` (grain: one row per loan), `(df["bucket_pd"].astype(str) == df["bucket"]).all()` (our cut equals the extract's bucket), and `abs(par30 - 0.0312) < 0.0001` against the SQL. When the November file breaks one of them, the notebook stops with a red cell instead of a wrong tile — the property Bekzod asked for.

Two definitions that look like PAR30 and are not: **PAR30 by count** (275 / 7 828 = 3.5 % of loans) — a different, smaller number, sometimes quoted when the portfolio number looks bad; and **overdue ÷ outstanding** (7.65 bn of overdue instalments / 208.7 bn = 3.7 %) — the *arrears ratio*. Put "PAR30 = outstanding of loans > 30 DPD ÷ total outstanding" in the tile's footnote and the three stop being confused.

> 🎯 **Interview version.** *"Compute PAR30 in pandas from a loan-level table."* — `df.loc[df.dpd > 30, "outstanding"].sum() / df.outstanding.sum()`; buckets with `pd.cut`, right-closed, first edge below zero; say the numerator is whole-loan outstanding; check the grain (one row per loan) and the total against the warehouse before dividing.

**Say it like in an interview.** Answer the question above in your own words, as you would say it aloud, with Nur Finance's numbers.

Tomorrow: `groupby`, `merge`, and Nilufar's two dirty files cleaned in pandas — the 40 duplicate people and the 25 duplicate payments, for the last time.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 5 · Day 3 — pandas II: groupby, merge and the cleaning pipeline (weeks/week-05/day-3.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-05/day-3
=====

# Week 5 · Day 3 — pandas II: groupby, merge and the cleaning pipeline

<span class="badge">Learn 60 min</span> <span class="badge">Detective 40 min</span> <span class="badge">Practice 45 min</span> <span class="badge hw">HW 5.1 due · HW 5.2 (due Day 5)</span> <span class="badge company">Company corner</span>

> STORY **Wednesday, 9:05.** Nilufar, risk (*риск-аналитик*), with Jasur behind her. *"Your Power Query pipeline works — on my laptop. Jasur's server has no Excel. He wants the same cleaning as a script he can schedule: `customers_dirty.csv` and `payments_dirty.csv` in, 6 000 people and 52 850 payments out, every Monday at 6:00, and a DPD per loan computed from the schedule so his model has a target."* Jasur: *"And I want to see the asserts. A pipeline that cannot prove its own counts is a pipeline I cannot trust at 6:00 in the morning."*

## Today in 3 lines

- **`groupby` / `agg`** is `GROUP BY` with named outputs; **`transform`** is the window function (a group total next to every row); **`merge`** is the join, with `how=`, `validate=` and `indicator=` as the safety belts you never had in SQL; `concat` is `UNION ALL`; `pivot_table` is the cross-tab.
- Cleaning is the same three repairs as week 4 — text (`.str.strip().str.lower()`, `replace`), dates (`to_datetime(errors="coerce")` **plus the business rule**), duplicates (`duplicated` / `drop_duplicates(subset=, keep=)` after a sort) — written once, checked with `assert`, re-run forever.
- You can reproduce every week-4 cleaning count in pandas — duplicate people (and the name-key trap), impossible birth dates, duplicate payments, method spellings — and compute **DPD for every loan** from `installments.csv` + payments, checked against the SQL column loan by loan.

---

## 1. Learn — several tables, one notebook

Every concept below has the same five parts: what it is, how to write it (a box you can run), when you use it, the trap, and a small task. Run the boxes from top to bottom — they all use the frames of the first box.

### Today's frames

Run this block first (▶ Run); every block below uses its five frames. `pay` is already de-duplicated and its `method` repaired — the two repairs you learn further down — so the numbers in the comments match the clean book; `pay_raw` keeps the file as recorded.

```python
import pandas as pd
import numpy as np
AS_OF = pd.Timestamp("2026-10-01")
# 52 875 rows, as recorded
pay_raw = pd.read_csv("../excel/payments_dirty.csv", parse_dates=["paid_at"])
pay = (pay_raw.sort_values("payment_id")
              # 52 850 — the dedup, explained below
              .drop_duplicates(subset=["installment_id", "paid_at", "amount"])
              .assign(method=lambda d: d["method"].str.strip().str.lower().replace({"bank transfer": "transfer"})))
# 6 040 rows, dirty on purpose
cust = pd.read_csv("../excel/customers_dirty.csv")
# 92 193 instalments
inst = pd.read_csv("../excel/installments.csv", parse_dates=["due_date"])
# 7 828 loans
loans = pd.read_csv("../excel/loans_status.csv", parse_dates=["disbursed_at"])
len(pay_raw), len(pay), len(cust), len(inst), len(loans)
```

The box shows `(52875, 52850, 6040, 92193, 7828)`: the five row counts every block below starts from.

### groupby — one aggregate per group

**What it is.** `groupby` (*группировка*) splits a frame into groups by the values of a **key** column, computes one number per group, and puts the results together — one row per group. It is week 2's `GROUP BY`.

**How to write it.**

```python
by_region = pay.groupby("region")["amount"].sum()  # key → column → aggregate
by_region.sort_values(ascending=False).head()
```

| region | amount |
|---|---|
| Tashkent | 102 605 410 110 |
| Fergana | 34 437 790 032 |
| Samarkand | 27 576 625 156 |
| Andijan | 24 138 491 453 |
| Namangan | 21 044 366 065 |

Eight regions come back, one row each; Tashkent's customers paid 102.6 bn — three times Fergana's 34.4 bn.

The three steps, drawn on four payments:

The functions you can name: `sum`, `mean`, `median`, `min`, `max`, `count`, `size`, `nunique`, `first`. The **key becomes the index** of the result; `.reset_index()` turns it back into a column.

**When you use it.**
- Any "per X" question: paid per region, loans per branch, outstanding per product.
- Before a chart: one bar per group.

> ⚠️ **Watch out.** `groupby` drops the rows whose key is NaN — silently. Group customers by a column with blanks and the blank group is simply missing; pass `dropna=False` to see it as a row (week 2's NULL band again). On a `category` key, pass `observed=True`, or pandas adds empty rows for categories with no data.

**Your turn.**

**Try it.**

```python
import pandas as pd

df = pd.DataFrame({
    "segment": ["sme", None, "sme", None],
    "loans": [1, 2, 3, 4]})
g = df.groupby("segment")["loans"].sum()
print(g.to_dict())   # {'sme': 4}
by = df.groupby("segment", dropna=False)
print(by["loans"].sum().to_dict())
# the NaN group is back: 6
```

The groups add up to 4, the column to 10. When the groups do not add up to the total, look for a NaN key.

### agg — several aggregates with names

**What it is.** `.agg(name=("column", "function"))` computes **several** numbers per group in one call and names each output. This is **named aggregation** (*именованная агрегация*) — `SUM(amount) AS total` with the `AS` built in.

**How to write it.**

```python
by_region = pay.groupby("region").agg(payments=("payment_id", "size"),
                                      total=("amount", "sum"),
                                      avg=("amount", "mean"))
by_region.sort_values("total", ascending=False).round(0).head(3)
```

| region | payments | total | avg |
|---|---|---|---|
| Tashkent | 20 437 | 102 605 410 110 | 5 020 571 |
| Fergana | 6 334 | 34 437 790 032 | 5 436 973 |
| Samarkand | 6 037 | 27 576 625 156 | 4 567 935 |

Tashkent has 20 437 payments averaging 5.02 m; Fergana has a third as many, but each is larger — 5.44 m.

**`size` vs `count`.** `size` counts rows; `count` counts non-empty values of the column — `COUNT(*)` against `COUNT(col)`:

```python
cust.groupby("segment").agg(customers=("customer_id", "size"), with_income=("monthly_income", "count"))
```

| segment | customers | with_income |
|---|---|---|
| affluent | 1 204 | 1 132 |
| mass | 3 585 | 3 377 |
| sme | 1 251 | 1 175 |

3 585 mass customers, but only 3 377 of them have an income on file: the 208 missing incomes are the difference.

**When you use it.**
- A summary table with several columns per group: count, total, average.
- Any time you would write two `groupby` lines on the same key.

> ⚠️ **Watch out.** `"count"` skips NaN; `"size"` does not. Count customers with `size` (or `count` on the id); count *answers* with `count` on the column. Mixing them makes a share that silently leaves the blanks out.

**Your turn.** How many affluent customers have no income on file?

### groupby on two keys — and unstack

**What it is.** A list of keys groups by every **combination**: `groupby(["product", "method"])` makes one group per product-and-method pair. The result has a two-level index (a `MultiIndex`); `.unstack()` moves the last key into columns, which turns the list into a cross-tab.

**How to write it.**

```python
# one row per pair: 5 × 5 = 25 rows
pm = pay.groupby(["product", "method"]).size()
# the second key becomes the columns
pm.unstack(fill_value=0)
```

| product | card | cash | click | payme | transfer |
|---|---|---|---|---|---|
| Auto loan | 1 563 | 799 | 766 | 784 | 776 |
| Buy now pay later | 2 762 | 1 411 | 1 356 | 1 419 | 1 426 |
| Consumer loan | 7 154 | 3 596 | 3 556 | 3 667 | 3 501 |
| Micro loan | 3 432 | 1 648 | 1 718 | 1 626 | 1 668 |
| Small business loan | 2 701 | 1 334 | 1 390 | 1 401 | 1 396 |

25 cells, one per product and method; in every row card takes about a third and the four others a sixth each — the method does not depend on the product.

`as_index=False` (or `.reset_index()`) gives the keys back as ordinary columns — the shape you need before a `merge` or a chart.

**When you use it.**
- "Per X and Y": loans per region and status, payments per product and method.
- A cross-tab of counts or sums (`unstack`), or the long input of a seaborn chart (no `unstack`).

> ⚠️ **Watch out.** `unstack()` without `fill_value=0` writes NaN where a pair has no rows (no 61–90 SME loan, say). A NaN in a count table means "zero", so fill it.

**Your turn.** How many loans in Tashkent are written off?

### transform — the group's number on every row

**What it is.** `transform` computes a group's number and writes it **next to every row of the group**. The result has as many rows as the frame. It is week 3's window function `SUM(amount) OVER (PARTITION BY loan_id)`.

**How to write it.**

```python
# SUM(amount) OVER (PARTITION BY loan_id)
pay["loan_total"] = pay.groupby("loan_id")["amount"].transform("sum")
# each payment's share of its loan's payments
pay["share"] = pay["amount"] / pay["loan_total"]
pay[["payment_id", "loan_id", "amount", "loan_total", "share"]].head(3).round(4)
```

| payment_id | loan_id | amount | loan_total | share |
|---|---|---|---|---|
| 1 | 1 | 1 741 700 | 31 350 600 | 0.0556 |
| 2 | 1 | 1 741 700 | 31 350 600 | 0.0556 |
| 3 | 1 | 1 741 700 | 31 350 600 | 0.0556 |

Loan 1's eighteen payments add up to 31 350 600, and that total sits on each of the 18 rows — so each payment is 1/18 of the loan's money (0.0556).

The same pattern answers "compared with my group": the segment's median income next to each customer, then a comparison on the row.

```python
cust["seg_median"] = cust.groupby("segment")["monthly_income"].transform("median")
# raw customers_dirty.csv: 2 841 earn above their segment's median
(cust["monthly_income"] > cust["seg_median"]).sum()
```

| | `agg` | `transform` |
|---|---|---|
| rows back | one per group | one per original row |
| SQL | `GROUP BY` | `… OVER (PARTITION BY …)` |
| use for | a summary table | a share of the group, a gap from the group mean, a rank inside the group |

`groupby(key).cumsum()` is a running total inside each group; `groupby(key).cumcount()` numbers the rows 0, 1, 2 … — `ROW_NUMBER() OVER (PARTITION BY key)`.

**When you use it.**
- Shares of a group total, a difference from the group average, a flag "above my segment".
- Ask "how many rows do I want back?" — the frame's count → `transform`; one per group → `agg`.

> ⚠️ **Watch out.** Assigning an `agg` result as a column (`pay["t"] = pay.groupby("loan_id")["amount"].sum()`) does not repeat it per row: pandas aligns it on the index, so most rows get NaN or a wrong loan's total. A per-row column needs `transform`. The same alignment happens in arithmetic: two Series are added **label by label**, so a filtered Series plus a full one gives NaN on every label that is only in one of them. Do arithmetic on columns of one frame.

> ⚠️ **Watch out.** A share is honest only when the numerator and the denominator see the **same rows**. `pay.loc[pay["paid_at"] <= AS_OF, "amount"].sum() / pay["amount"].sum()` divides a cut sum by an uncut one; a group's share divides by *the group's* total (`transform("sum")`), not by the grand total. Week 4's pivot rule, in pandas.

**Your turn.** How many loans have more outstanding than the average loan of their own product?

### value_counts — the shortcut for counting

**What it is.** `col.value_counts()` counts the rows per value of one column, largest first. It is `groupby(col).size()` sorted — the most common `GROUP BY … COUNT(*)` in one word. `normalize=True` gives shares instead of counts.

**How to write it.**

```python
counts = pay["method"].value_counts()
shares = pay["method"].value_counts(normalize=True).mul(100).round(2)
pd.DataFrame({"payments": counts, "share_pct": shares})
```

| method | payments | share_pct |
|---|---|---|
| card | 17 612 | 33.32 |
| payme | 8 897 | 16.83 |
| cash | 8 788 | 16.63 |
| click | 8 786 | 16.62 |
| transfer | 8 767 | 16.59 |

Card carries a third of the 52 850 payments (17 612, 33.32 %); the other four methods split the rest almost evenly.

| you want | write |
|---|---|
| counts, largest first | `col.value_counts()` |
| shares | `col.value_counts(normalize=True)` |
| in the natural order (buckets) | `col.value_counts().sort_index()` |
| the blanks as a row | `col.value_counts(dropna=False)` |
| how many distinct values | `col.nunique()` |

**When you use it.**
- The first look at any text column: which values, how often, which spellings.
- A one-column count; for two columns or any other aggregate, `groupby`.

> ⚠️ **Watch out.** `value_counts()` hides NaN by default — 356 missing incomes would simply not be a row. Add `dropna=False` whenever blanks are possible.

**Your turn.** What share of loans is grade D, in % with two decimals?

### merge — the join, and its four how=

(Animated explanation)
One key, two frames: the four how=
- Two small frames: `sched`, what each instalment owes, and `got`, what was paid. The **key**, `installment_id`, is in both.
- Keys 2 and 3 are in both frames (same colour). Key 1 is only in `sched`, key 4 only in `got` (dashed): rows with no partner.
- `how="inner"` — the **default** — keeps only the matches: 3 + 3 rows in, 2 out. Instalment 1 vanishes.
- `how="left"` keeps **every** row of the left frame. Instalment 1 has no payment, so its `paid` is NaN. Payment 4 is struck out.
- `how="right"` keeps every row of the **right** frame: the stray payment 4 stays, with NaN for `total_due`.
- `how="outer"` keeps everything: 4 rows, NaN wherever one side is missing.
- Try the four buttons, then answer.
- On the real data `inst.merge(paid, how="left")` keeps all 92 193 instalments; the unpaid ones get NaN — exactly the ones DPD is about. inner would drop them without a word.

**What it is.** `left.merge(right, on="key", how=...)` is the **join** (*соединение*): it puts the rows of two frames side by side where the key matches. `how=` decides what happens to a row with **no partner** — exactly week 2's INNER / LEFT / RIGHT / FULL.

**How to write it.** Two tiny frames first: three instalments, and payments for instalments 2, 3 and a stray 4.

```python
sched = pd.DataFrame({"installment_id": [1, 2, 3], "total_due": [100, 100, 100]})
got = pd.DataFrame({"installment_id": [2, 3, 4], "paid": [100, 60, 50]})
for how in ["inner", "left", "right", "outer"]:
    print(how, "\n", sched.merge(got, on="installment_id", how=how), "\n")
```

| `sched` | installment_id | total_due |
|---|---|---|
| | 1 | 100 |
| | 2 | 100 |
| | 3 | 100 |

| `got` | installment_id | paid |
|---|---|---|
| | 2 | 100 |
| | 3 | 60 |
| | 4 | 50 |

| `how=` | installment_id | total_due | paid | rows |
|---|---|---|---|---|
| `"inner"` (default) | 2, 3 | 100, 100 | 100, 60 | 2 — only matches |
| `"left"` | 1, 2, 3 | 100, 100, 100 | **NaN**, 100, 60 | 3 — every left row |
| `"right"` | 2, 3, 4 | 100, 100, **NaN** | 100, 60, 50 | 3 — every right row |
| `"outer"` | 1, 2, 3, 4 | 100, 100, 100, NaN | NaN, 100, 60, 50 | 4 — everything |

Instalment 1 has no payment: only `left` and `outer` keep it, with NaN in `paid`. The stray payment 4 survives only in `right` and `outer`.

On the real data:

```python
paid = pay[pay["paid_at"] <= AS_OF].groupby("installment_id", as_index=False).agg(paid=("amount", "sum"))
len(paid), len(inst.merge(paid, on="installment_id")), len(inst.merge(paid, on="installment_id", how="left"))
```

The box shows `(52826, 52826, 92193)`: 52 826 instalments have a payment; the inner merge keeps only them, the left merge keeps all 92 193 instalments.

| `how=` | SQL (week 2) | Power Query (week 4) |
|---|---|---|
| `"inner"` (default) | `INNER JOIN` | Inner |
| `"left"` | `LEFT JOIN` | Left Outer |
| `"right"` | `RIGHT JOIN` | Right Outer |
| `"outer"` | `FULL OUTER JOIN` | Full Outer |

**When you use it.**
- Columns from two tables in one row: the instalment with what was paid on it, the payment with its loan's product.
- `how="left"` whenever the left table is "the list that must be complete" — all instalments, all loans.

> ⚠️ **Watch out.** The default is `how="inner"`, **not** `left`. A forgotten `how=` drops every instalment that has no payment — exactly the unpaid ones DPD is about — and nothing warns you. Write `how=` on every merge and count the rows after it.

**Your turn.** With a left merge of `paid` onto `inst`, how many instalments have no payment at all through the as-of?

### Merge keys — on, left_on / right_on, suffixes

**What it is.** The **key** is the column that must match. `on="loan_id"` when both frames call it the same; `left_on=` / `right_on=` when the names differ; `on=["a", "b"]` for a key of two columns. Columns that exist on both sides and are not the key get the **suffixes** `_x` / `_y`.

**How to write it.**

```python
prod = pd.DataFrame({"name": ["Micro loan", "Consumer loan", "Buy now pay later", "Auto loan", "Small business loan"],
                     # products.annual_rate
                     "annual_rate": [0.42, 0.30, 0.0, 0.24, 0.26]})
# different names on each side
lr = loans.merge(prod, left_on="product", right_on="name", how="left")
print(len(lr), round(lr["annual_rate"].mean(), 4))
both = pay.merge(loans[["loan_id", "product", "region"]], on="loan_id", how="left")
print([c for c in both.columns if c[:7] in ("product", "region_")])
```

```output
7828 0.2738
['product_x', 'region_x', 'product_y', 'region_y']
```

Every one of the 7 828 loans found its product's rate, and the average loan costs 27.38 % a year. Payments and loans both carry `product` and `region`, so the merge keeps both copies as `_x` (left) and `_y` (right).

| you have | write |
|---|---|
| the same key name on both sides | `on="loan_id"` |
| different names | `left_on="product", right_on="name"` |
| a key of two columns | `on=["loan_id", "installment_no"]` |
| clashing column names | `suffixes=("", "_loan")` — keep the left name, mark the right |

**When you use it.**
- Every merge: name the key on purpose, never rely on pandas finding a shared column.
- `suffixes=` whenever both frames carry the same descriptive columns.

> ⚠️ **Watch out.** A key that looks the same but has a different type does not match: `loan_id` as `int64` on one side and as text on the other raises `ValueError: You are trying to merge on int64 and str columns` (`object` instead of `str` in pandas before 3.0). Check `dtypes` and convert one side before the merge. And pandas **matches a NaN key to a NaN key** — SQL never joins NULL to NULL — so two tables with blank keys pair every blank with every blank. Count `key.isna().sum()` on both sides first, and drop or fill the blank keys on purpose.

**Your turn.** The average annual rate over all 7 828 loans, in % with two decimals.

### validate= and indicator= — the safety belts

(Animated explanation)
Where each row came from — and rows that multiply
- `indicator=True` adds a column, `_merge`: both = found a partner, left_only = only in the left frame, right_only = only in the right one.
- With `how="outer"` all three appear: instalment 1 is left_only, payment 4 is right_only.
- One filter on `_merge` replaces a hand-written anti-join.
- On Nur's data (the table below) right_only is 0: no payment points at an instalment that does not exist. `value_counts()` of `_merge` is a free check after every merge.
- Now a trap. Two frames keyed by `loan_id`, and the key **repeats on both sides**: loan 7 has 2 payments and 3 instalments.
- Merge them: every payment of loan 7 meets every instalment of loan 7 — 2 × 3 = 6 rows. Loan 8: 1 × 1. 3 + 4 rows in, 7 out.
- Count the pairs.
- On the whole book, 52 850 payments and 92 193 instalments become 858 612 rows — and every sum after that is wrong, with no error. `validate="m:1"` would have stopped it.

**What it is.** Two arguments SQL never gave you. **`validate=`** states the grain you expect — `"1:1"`, `"m:1"` or `"1:m"` — and raises `MergeError` if a key is not unique on the side you promised. **`indicator=True`** adds a column `_merge` that says where each row came from: `both`, `left_only` or `right_only`.

**How to write it.**

```python
m = inst.merge(paid, on="installment_id", how="left", validate="1:1", indicator=True)
m["_merge"].value_counts()
```

| _merge | count |
|---|---|
| both | 52 826 |
| left_only | 39 367 |
| right_only | 0 |

52 826 instalments matched a payment total, 39 367 had none, and no payment total pointed at an instalment that does not exist. `validate="1:1"` passed: each instalment appears once on each side.

The **anti-join** is one filter on that column: `m[m["_merge"] == "left_only"]` — the instalments with no payment, week 2's `LEFT JOIN … WHERE right IS NULL`.

| argument | what it checks | the week-2 mistake it stops |
|---|---|---|
| `validate="m:1"` | the right key is unique | the fan-out: Σ principal ×24.7 after joining instalments |
| `validate="1:1"` | both keys are unique | a duplicate row on either side |
| `indicator=True` | where each row came from | an anti-join written by hand, or rows lost without a trace |

**When you use it.**
- `validate=` on every merge whose grain you "know" — the merge then proves it.
- `indicator=True` when you need the rows without a partner, or to check that none exist.

> ⚠️ **Watch out.** `validate=` costs nothing and is skipped by everyone. Without it, a duplicate key on the right multiplies rows and every sum after it is too big — with no error. Write the grain you believe; a `MergeError` is a free lesson about the data.

**Your turn.** You merge loans onto payments: `pay.merge(loans, on="loan_id", how="left", validate=…)`. Which grain is true?

### concat — stacking frames (UNION ALL)

**What it is.** `pd.concat([a, b])` stacks frames **on top of each other**: the rows of `a`, then the rows of `b`. Columns are matched **by name**. It is SQL's `UNION ALL` and week 4's Append.

**How to write it.**

```python
a = pay[pay["region"] == "Tashkent"].assign(source="tashkent")
b = pay[pay["region"] != "Tashkent"].assign(source="rest")
u = pd.concat([a, b], ignore_index=True)  # renumber the index 0 … n-1
len(a), len(b), len(u)
```

| frame | rows |
|---|---|
| `a` (Tashkent) | 20 437 |
| `b` (the rest) | 32 413 |
| `pd.concat([a, b])` | 52 850 |

20 437 + 32 413 = 52 850: the two halves stack back into the whole clean book. The `source` column records which half each row came from.

| | `concat` | `merge` |
|---|---|---|
| puts frames | on top of each other (rows) | side by side (columns) |
| matches | columns by name | rows by a key |
| SQL | `UNION ALL` | `JOIN` |

**When you use it.**
- Twelve monthly files into one frame; this month's extract under last month's.
- Add a `source` column first, so every row remembers its file.

> ⚠️ **Watch out.** A column spelt differently in one frame (`Amount` vs `amount`) does not raise an error: the result gets **two** columns, each NaN in the other frame's rows. Check `set(a.columns) == set(b.columns)` before every concat. And without `ignore_index=True` both halves keep their old labels, so a label can appear twice: `u.loc[0]` then returns two rows.

**Your turn.**

### pivot_table — the cross-tab (and pivot / melt)

**What it is.** `pd.pivot_table` is Excel's PivotTable: values of one column become the rows (`index=`), values of another the columns (`columns=`), and each cell is an aggregate (`aggfunc=`) of a third (`values=`). `margins=True` adds the totals row and column (*сводная таблица*).

**How to write it.**

```python
pd.pivot_table(loans, index="bucket", columns="product", values="loan_id",
               aggfunc="count", fill_value=0, margins=True)
```

| bucket | Auto loan | Buy now pay later | Consumer loan | Micro loan | Small business loan | All |
|---|---|---|---|---|---|---|
| 0 | 362 | 1 505 | 2 280 | 2 548 | 734 | 7 429 |
| 1-30 | 14 | 16 | 50 | 28 | 16 | 124 |
| 61-90 | 2 | 2 | 4 | 8 | 0 | 16 |
| 90+ | 10 | 42 | 77 | 76 | 29 | 234 |
| All | 391 | 1 569 | 2 418 | 2 669 | 781 | 7 828 |

(The 31-60 row — 25 loans — is left out of the picture.) Of the 234 loans in 90+, 77 are Consumer and 76 Micro; the SME 61-90 cell is 0 only because `fill_value=0` filled an empty pair.

Two relatives:

| call | does | use for |
|---|---|---|
| `pd.crosstab(a, b)` | counts only, shorter | grade × bucket counts |
| `df.pivot(index=, columns=, values=)` | reshape long → wide, **no** aggregation | `monthly_disbursements.csv`: 170 rows → 34 months × 5 products |
| `df.melt(id_vars=, var_name=, value_name=)` | wide → long | the shape seaborn wants (Day 4) |

**When you use it.**
- A two-way table of counts, sums or means for a reader: bucket × product, region × status.
- `pivot` / `melt` when the data is already one value per cell and only the shape is wrong.

> ⚠️ **Watch out.** `pivot` (without `_table`) raises `ValueError: Index contains duplicate entries` when two rows share a row-and-column pair — it cannot add them up. When pairs repeat, you need `pivot_table` with an `aggfunc`.

**Your turn.** Outstanding (sum) by region × product: how much SME outstanding sits in Tashkent?

### Text repair with .str — strip, lower, replace

**What it is.** `col.str.<method>` applies a string method to **every value** of a text column and leaves NaN alone: `.str.strip()`, `.str.lower()`, `.str.title()`, `.str.contains()`, `.str.startswith()`, `.str.replace()`. `col.replace({old: new})` swaps **whole values**.

**How to write it.**

```python
raw = pay_raw["method"].value_counts()
clean = pay_raw["method"].str.strip().str.lower().replace({"bank transfer": "transfer"}).value_counts()
raw.head(10), clean
```

| raw spelling | rows | | clean | rows |
|---|---|---|---|---|
| card | 17 564 | | card | 17 621 |
| Card | 57 | | payme | 8 900 |
| Click | 36 | | cash | 8 790 |
| PayMe | 30 | | click | 8 790 |
| `CASH ` | 30 | | transfer | 8 774 |
| bank transfer | 27 | | | |

Ten raw spellings — 180 rows outside the five clean ones — collapse into five methods. (These counts are on the raw 52 875 rows; the de-duplicated `pay` has card 17 612.)

| week 4 (Excel / Power Query) | pandas |
|---|---|
| `TRIM` | `.str.strip()` |
| `LOWER` / `PROPER` | `.str.lower()` / `.str.title()` |
| `SUBSTITUTE` inside the text | `.str.replace("a", "b")` |
| Replace Values (whole cell) | `.replace({"bank transfer": "transfer"})` |
| text contains | `.str.contains("Tashkent")` |

**When you use it.**
- Any text key before you group or merge on it: spaces and case split one group into several.
- Names for a report: `.str.strip().str.title()`.

> ⚠️ **Watch out.** Chain in the order of the change log: strip → lower → replace. Replacing `"bank transfer"` before lowering misses `"Bank Transfer"`; lowering before stripping is fine, but `"cash "` with its space still is not `"cash"` until you strip. And `.str.contains()` reads its pattern as a **regular expression**: `"+998"` raises an error and `"."` matches any character — add `regex=False` for plain text. On a column with blanks it returns NaN for them, which a mask cannot use: add `na=False`.

**Your turn.** How many raw payment rows have a method that is not one of the five clean spellings?

### Dates that lie — to_datetime(errors=) and the business rule

**What it is.** `pd.to_datetime(col, errors="coerce")` turns text into dates and writes **NaT** (*Not a Time*, the date NULL) wherever a value cannot be parsed — instead of stopping. Parsing checks the **syntax**. Whether a date is possible — not in the future, not before 1920 — is a **business rule** you write yourself.

**How to write it.**

```python
# unparseable → NaT (not a crash)
cust["birth_date"] = pd.to_datetime(cust["birth_date"], errors="coerce")
# the business rule finds what parsing cannot
bad = (cust["birth_date"] > AS_OF) | (cust["birth_date"] < "1920-01-01")
cust["birth_date_invalid"] = bad
# keep the date where valid, NaT where not
cust["birth_date_clean"] = cust["birth_date"].where(~bad)
print(cust["birth_date"].isna().sum(), bad.sum())
cust.loc[bad, ["customer_id", "birth_date"]].head()
```

| customer_id | birth_date |
|---|---|
| 927 | 2031-04-12 |
| 957 | 1900-01-01 |
| 964 | 2027-02-28 |
| 1020 | 1900-01-01 |
| 2338 | 2031-04-12 |

Parsing finds 0 bad values — every birth date is a valid ISO date — but the rule finds 7: three in 2031, one in 2027, three on 1900-01-01 (two more, 2934 and 3380, are below the five shown).

| `errors=` | on `"n/a"` or `"2026-02-31"` |
|---|---|
| `"raise"` (default) | stops with an error |
| `"coerce"` | NaT — count them with `.isna().sum()` |

**Day first or month first.** `pd.to_datetime("03/04/2026")` reads **month first** — 4 March, the US way — and gives no warning. For files from Uzbekistan or Russia, say how to read the text: `format="%d.%m.%Y"` for `14.03.2026` (the safest: a value that does not fit becomes an error, or NaT with `coerce`) or `dayfirst=True`. A timestamp from a server is often in **UTC**: 23:30 UTC on 30 September is 04:30 on 1 October in Tashkent (UTC+5) — another day and another month. Convert before you cut by date: `col.dt.tz_localize("UTC").dt.tz_convert("Asia/Tashkent")`.

**Your turn.** What does `pd.to_datetime("03/04/2026", dayfirst=True)` return?

`.where(cond)` keeps the values where the condition holds and blanks the rest; `np.where(cond, a, b)` is the two-sided `IF`.

**When you use it.**
- Every date column from a file you did not make: parse with `coerce`, count the NaT, then apply the rule.
- Flag and blank a bad date; never replace it with a plausible one.

> ⚠️ **Watch out.** `errors="coerce"` protects you from `"n/a"` and `"31.02.2026"`; it does **not** protect you from `2031-04-12`, a perfectly parseable lie. Parsing is syntax; validity is a rule, and the rule is yours to write.

**Your turn.** The average age of the customers whose birth date is valid, on the as-of, in years with one decimal.

> ⚠️ **Quirk: `05/09/2026` is 9 May to pandas.**
>
> - **You expect:** 5 September — the way dates are written in Uzbekistan and Russia.
> - **What happens:** `pd.to_datetime("05/09/2026")` is **9 May 2026**: pandas reads the month first, the American way. In a column it takes the order from the first value, so a later `13/09/2026` stops it with *doesn't match format*.
> - **Why:** `dayfirst=False` is the default.
> - **Protect yourself:** give the shape: `format="%d/%m/%Y"` (or `dayfirst=True`). Then check one date you know.

```python
import pandas as pd

print(pd.to_datetime("05/09/2026"))  # 9 May
d = pd.Series(["05/09/2026", "13/09/2026"])
good = pd.to_datetime(d, format="%d/%m/%Y")
print(good.dt.strftime("%Y-%m-%d").tolist())
# 5 and 13 September
```

> ⚠️ **Quirk: Excel dates can arrive as numbers.**
>
> - **You expect:** a date column from an Excel export to read as dates.
> - **What happens:** a column that lost its date format arrives as numbers like 46296 — Excel's day count (week 4).
> - **Why:** in Excel a date *is* a number; only the format made it look like a date.
> - **Protect yourself:** convert from Excel's day 0, **30 December 1899**. From 1 January 1900 every date comes out two days late (Excel's extra 29 February 1900, week 4). Check: 46296 must be 2026-10-01.

```python
import pandas as pd

serial = pd.Series([46296, 46295])
right = pd.to_datetime(serial, unit="D",
                       origin="1899-12-30")
wrong = pd.to_datetime(serial, unit="D",
                       origin="1900-01-01")
print(right.dt.strftime("%Y-%m-%d").tolist())
print(wrong.dt.strftime("%Y-%m-%d").tolist())
# the second line: two days late
```

### Duplicates — find, look, then drop

**What it is.** `duplicated(subset=, keep=)` marks the rows that repeat an earlier row on the **key** columns of `subset`. `drop_duplicates(subset=, keep=)` removes them. `keep="first"` keeps the first row of each group **in the current order** — so the sort before it decides which row survives.

**How to write it.**

```python
key = ["installment_id", "paid_at", "amount"]
# True on ALL members of a group
dup_mask = pay_raw.duplicated(subset=key, keep=False)
print(dup_mask.sum())
# look before you delete
pay_raw[dup_mask].sort_values(["installment_id", "payment_id"]).head(2)
```

| payment_id | loan_id | installment_id | paid_at | amount | method |
|---|---|---|---|---|---|
| 110 | 18 | 174 | 2025-05-28 | 663 300 | click |
| 52869 | 18 | 174 | 2025-05-28 | 663 300 | click |

50 rows belong to a duplicate group — 25 pairs. Payment 52869 repeats payment 110 to the day and the soum: the same instalment of loan 18, the same date and amount, recorded twice.

```python
# keep the lowest payment_id
pay_clean = pay_raw.sort_values("payment_id").drop_duplicates(subset=key, keep="first")
# 52 850
len(pay_clean)
```

| `keep=` | `duplicated` marks | `drop_duplicates` keeps |
|---|---|---|
| `"first"` | every later copy | the first row of each group |
| `"last"` | every earlier copy | the last row of each group |
| `False` | **every** member (for looking) | none of the members |

**When you use it.**
- Payments recorded twice, people registered twice, an extract loaded twice.
- Always in three steps: `keep=False` to look, a sort to choose the survivor, `drop_duplicates` to remove.

> 💡 **Key idea.** The key defines sameness; the sort defines the survivor; the assert on the count proves both.

> ⚠️ **Watch out.** Without `subset=`, pandas compares **all** columns and finds 0 duplicates here, because `payment_id` differs on every row — week 4's "tick all columns" trap, in a parameter.

**Your turn.** In `customers_dirty.csv`, how many rows belong to a duplicate group on `phone` + `birth_date` (every member counted)?

### Buckets with pd.cut — categories from numbers

**What it is.** `pd.cut(col, bins=edges, labels=names)` puts each number into an interval and returns its label. The result is a **category** column with the labels in order. It is week 2's `CASE WHEN dpd <= 30 THEN …` in one line.

**How to write it.**

```python
edges = [0, 5e6, 10e6, 20e6, np.inf]
bands = pd.cut(cust["monthly_income"], bins=edges, labels=["<5m", "5-10m", "10-20m", "20m+"], right=False)
bands.value_counts(dropna=False).sort_index()
```

| band | customers |
|---|---|
| <5m | 1 281 |
| 5-10m | 2 198 |
| 10-20m | 576 |
| 20m+ | 1 629 |
| NaN | 356 |

2 198 customers earn 5–10 m a month, the largest band; 356 have no income and land in NaN — visible only because of `dropna=False`.

| argument | means | example |
|---|---|---|
| default (`right=True`) | intervals `(a, b]` — the right edge belongs in | DPD: `[-1, 0, 30, 60, 90, np.inf]`, so 30 is `1-30` |
| `right=False` | intervals `[a, b)` — the left edge belongs in | income: `< 5 000 000` is the rule |
| first edge | must be *below* the smallest value | `-1` for DPD, or `dpd = 0` becomes NaN |
| `np.inf` | an open top | `90+`, `20m+` |

`pd.qcut(col, 10)` cuts into ten groups of equal size (deciles) — week 3's `NTILE(10)`. On a column full of equal values it fails: `dpd` is 0 for 95 % of loans, so most decile edges are 0 and `qcut` raises `ValueError: Bin edges must be unique`. Pass `duplicates="drop"` (fewer groups), or cut `col.rank(method="first")`, which breaks the ties by row order.

**When you use it.**
- Any band defined by edges: DPD buckets, income bands, ticket sizes.
- Before a `groupby` or a `crosstab` by band; the category keeps the bands in order for charts.

> ⚠️ **Watch out.** With the first edge at 0 and the default right-closed intervals, `(0, 30]` does not contain 0: every `dpd = 0` loan — 7 429 of them — becomes NaN. Start DPD edges at −1.

**Your turn.** How many customers fall in the `20m+` band?

### apply vs vectorised

**What it is.** **Vectorised** code works on whole columns at once: `a + b`, `pd.cut`, `.str`, `np.where`. `apply` runs a Python function **once per value** (or once per row with `axis=1`) — a `for` loop in disguise. Both give the same answer; the speed differs by up to a thousand times.

**How to write it.**

```python
# HW 5.1's function, in one line
def dpd_bucket(dpd):
    return "0" if dpd <= 0 else "1-30" if dpd <= 30 else "31-60" if dpd <= 60 else "61-90" if dpd <= 90 else "90+"

# vectorised: milliseconds on 92 193 rows
inst["total"] = inst["principal_due"] + inst["interest_due"]
# row-wise apply: ~1 000× slower (seconds on the page)
inst["total"] = inst.apply(lambda r: r["principal_due"] + r["interest_due"], axis=1)
# fine for a label function on one column
loans["bucket_fn"] = loans["dpd"].apply(dpd_bucket)
print((inst["total"] == inst["total_due"]).all(), (loans["bucket_fn"] == loans["bucket"].astype(str)).all())
```

The box prints `True True`: both ways rebuild `total_due` on all 92 193 instalments, and the label function gives the file's bucket for all 7 828 loans.

| | vectorised | `apply` on one column | `apply(axis=1)` |
|---|---|---|---|
| runs | once, on the column | once per value | once per row |
| speed | the fastest | one Python call per value | one Python call per row — about 1 000× slower than vectorised |
| use for | arithmetic, `pd.cut`, `.str`, `np.where` | a label function with logic | logic that needs several columns and has no column spelling |

**When you use it.**
- Vectorised first, always, when a spelling exists.
- `apply` for a one-off function too twisted for arithmetic; if you wrote `axis=1`, ask whether column arithmetic would do.

> ⚠️ **Watch out.** `apply(axis=1)` feels natural after yesterday's loops, and it is the slowest line in most beginner notebooks. On ten million rows it is the difference between a second and an hour. `for i, row in df.iterrows():` is the same loop again, slower still — and changing `row` inside it does not change `df`.

**Your turn.**

### assert — the pipeline that checks itself

**What it is.** `assert condition, message` stops the notebook with `AssertionError: message` when the condition is `False`, and does nothing when it is `True`. An assert after each step turns the counts you know into checks the code runs every time.

**How to write it.**

```python
assert len(pay_clean) == 52_850, f"expected 52 850 payments, got {len(pay_clean)}"
assert pay["method"].nunique() == 5
# a left merge keeps every instalment
assert len(m) == len(inst)
# no payment without an instalment
assert (m["_merge"] != "right_only").all()
print("all checks passed")
```

```text
all checks passed
```

Four facts proven in four lines: 52 850 payments after the dedup, 5 methods, 92 193 instalments kept by the left merge, no orphan payment.

| put an assert after | check |
|---|---|
| a dedup | the row count (`== 52_850`) |
| a left merge | `len(m) == len(left)` |
| a cleaning step | the number of distinct values (`nunique() == 5`) |
| a total | the sum against the warehouse (`== 255_114_772_176`) |

**When you use it.**
- After every step whose result you know — then a Monday run either finishes or names the step that broke.
- Before you hand a number to anyone: the assert is the proof.
- Start every cleaning function with `df = df.copy()`. Without it, `df["col"] = …` inside the function also changes the frame the caller passed in, and running the notebook twice cleans already-cleaned data.

> ⚠️ **Watch out.** An assert on a float never uses `==`: `assert abs(par30 - 0.0312) < 0.0001`. Two floats computed in different orders differ in the last digits.

**Your turn.** Assert the clean book's size, then print the money paid on or before the as-of.

### Putting it together

One question, most of the day's tools: *how much money is owed on matured instalments, per product?* De-duplicated payments with clean methods (**.str**, **duplicates**), paid per instalment (**groupby + agg**), a left **merge** with **validate** and an **assert**, NaN filled after the merge, the product joined by **key** (`m:1`), then **agg** per product.

```python
paid = pay[pay["paid_at"] <= AS_OF].groupby("installment_id", as_index=False).agg(paid=("amount", "sum"))
m = inst.merge(paid, on="installment_id", how="left", validate="1:1")
assert len(m) == len(inst)
# no payment = 0 paid, AFTER the merge
m["paid"] = m["paid"].fillna(0)
# matured and not fully paid
open_ = m[(m["due_date"] <= AS_OF) & (m["paid"] < m["total_due"])].copy()
open_["owed"] = open_["total_due"] - open_["paid"]
open_ = open_.merge(loans[["loan_id", "product"]], on="loan_id", how="left", validate="m:1")
owed = (open_.groupby("product").agg(instalments=("installment_id", "size"), owed=("owed", "sum"))
             .sort_values("owed", ascending=False))
owed
```

| product | instalments | owed |
|---|---|---|
| Small business loan | 299 | 4 873 942 406 |
| Consumer loan | 804 | 1 336 020 831 |
| Auto loan | 149 | 1 163 781 535 |
| Micro loan | 301 | 181 751 727 |
| Buy now pay later | 231 | 97 031 242 |

1 784 matured instalments are not fully paid, and 7.65 bn is still owed on them. SME has only 299 of those instalments but 4.87 bn of the money; Consumer has the most instalments, 804, for 1.34 bn.

**Your turn.** What share of the money owed sits on SME loans, in % with one decimal?

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ groupby and agg — [Complete Python Pandas Data Science Tutorial! (2025 Updated Edition) (Keith Galli), 1:05:47](https://youtu.be/2uvysYbKdjM?t=3947&end=4104)
- ▶ groupby, short single-topic — [Group By and Aggregate Functions in Pandas (Alex The Analyst), 01:20](https://youtu.be/VRmXto2YA2I?t=80&end=188)
- ▶ merge / concat — Keith Galli same video, [50:42](https://youtu.be/2uvysYbKdjM?t=3042&end=3513)
- ▶ Cleaning (duplicates, strip, replace, fill nulls) — [Data Cleaning in Pandas (Alex The Analyst), 02:34](https://youtu.be/bDhvCp3_lYw?t=154&end=221)
- ▶ Same topic inside the big course — [Python for Data Analytics (Luke Barousse), Merge 7:15:37](https://youtu.be/wUSDVGivd-8?t=26137&end=26753)

- RU deck (TBC Data Analytics 2.0, if you have it) `4.3_Python.pdf` pp. 82–103: `groupby` and `.agg` pp. 82–87, pivot tables pp. 88–91, `pd.merge` / `join` / `concat` pp. 92–103; `.apply` / `.map` pp. 74–81. `4.4_Python.pdf` is tomorrow's bridge (DB-API, `read_sql`, SQLAlchemy).
- *Russian terms:* группировка = groupby, агрегация = aggregation, именованная агрегация = named aggregation, оконная функция = window function (`transform`), слияние / соединение = merge / join, конкатенация = concat, сводная таблица = pivot table, дубликаты = duplicates, очистка данных = data cleaning, утверждение / проверка = assert.

---

## 2. Worked example — Nilufar's files, in pandas (detective, 40 min)

Reproduce week 4's counts step by step. Each step names the concept from section 1 it uses, in the order you learned them. Each step has an editor that loads the raw file; print the numbers, then ✔ Check. In Jupyter, `data/python/day3_starter.ipynb` has the walk-through cells in its first half.

**Step 1 — text repair with `.str`, because the dirt is in spaces and case.** The inventory on `customers_dirty.csv`: trailing spaces in `first_name`, all-caps first names, all-lower surnames, ids above 6 000.

**Step 2 — `duplicated` with `subset=`, because "the same person" is whatever the key says.** Prove the duplicates three ways: `duplicated(subset=[normalised first, last, birth_date])`, `subset=["phone", "birth_date"]`, `subset=["phone"]`.

**Step 3 — `to_datetime(errors="coerce")` plus the business rule, because parsing alone finds nothing.** Count the NaT, then apply the rule.

**Step 4 — `value_counts`, `.str` and `duplicated` on payments, because the 58 million are copies with a shared key.** `method.value_counts()` raw and clean; `duplicated` on the three-column key; Σ of the extras.

**Step 5 — `groupby` + `agg`, then a left `merge` with `validate=` and `indicator=`, because every instalment must stay** (the Company corner has the full version): aggregate clean payments `paid_at <= AS_OF` per instalment, left-merge onto `installments.csv` with `validate="1:1", indicator=True`. How many matured instalments are not fully paid?

---

## 3. Practice (45 min)

Each editor loads what the task needs — the payments starter gives you both `pay_raw` (as recorded) and `pay` (de-duplicated). Print the number, then ✔ Check. In Jupyter, add a cell per task to `day3_starter.ipynb`.

**P1.** *(groupby — one aggregate)* Money paid on or before the as-of, per `method` (clean payments), largest first. How much came by card?

**P2.** *(several aggregates with agg)* Payments per `region`: count, total, average — on the dirty file and on the clean one. Which region lost the most money to the dedup?

**P3.** *(groupby on two keys)* A cross-tab of clean payments: `product` × `method` counts with `groupby(...).size().unstack()`, then the same with `pivot_table`. Read SME's row.

**P4.** *(transform)* Add each customer's segment median income next to them; how many earn above it? Then `cumcount` per `phone` as the `ROW_NUMBER` of week 3 — how many rows get 1 or more?

**P5.** *(value_counts)* Grades of the 234 loans in 90+: the share of each, in %. Which grade holds half of them, and how does that compare with its share of the whole book?

**P6.** *(merge — how=)* The inner-merge trap: repeat Step 5 with the default `how`. How many rows, and which loans would the DPD computation then miss?

**P7.** *(merge keys)* Total paid per loan (clean payments, any date), merged onto every loan of `loans_status.csv` on `loan_id`. How many loans have no payment at all?

**P8.** *(validate= and indicator=)* Merge clean payments onto `loans_status.csv` (`loan_id`) with `validate="m:1"` — fine. Now merge `installments.csv` onto the **raw** payments with `validate="1:1"` (`pay_raw.merge(inst, on="installment_id", validate="1:1")`), then onto the **clean** payments — what happens each time?

**P9.** *(concat)* Split clean payments into Tashkent and the rest, add a `source` column to each, concat with `ignore_index=True`. Rows? Then rename `amount` to `Amount` in one half and concat again — what does the result look like?

**P10.** *(pivot_table)* `pivot_table` of `outstanding` (sum) by `bucket` × `product` with `margins=True`. Read the `All` column: how much outstanding sits in 90+?

**P11.** *(text repair with .str)* `applications.csv`: how many statuses begin with `approved` (`.str.startswith`), and how many contain `not` (`.str.contains`)?

**P12.** *(dates: errors= and the business rule)* Parse `birth_date` with `errors="coerce"`, apply the business rule, and count the valid customers aged 60 or more on the as-of (age = days / 365.25).

**P13.** *(duplicates)* Sort `customers_dirty.csv` by `registered_at` and drop duplicates on `phone` + `birth_date` — once with `keep="first"`, once with `keep="last"`. How many customer ids above 6 000 survive each time?

**P14.** *(buckets with pd.cut)* `pd.cut` on `dpd` with the edges `[-1, 0, 30, 60, 90, np.inf]` and the five labels. How many loans are more than 30 days late (the last three buckets)? Then try the first edge at 0 — how many NaN?

**P15.** *(apply vs vectorised)* Compute `total_due` from its two parts both ways on the 92 193 instalments and time them (`%%timeit` in Jupyter, or `time.perf_counter()`). Then apply `dpd_bucket` from HW 5.1 to `dpd` and compare with `pd.cut`. Which statement is right?

**P16.** *(assert — the whole cleaning chain)* Clean `customers_dirty.csv` end to end in one chain (strip + title, flags, sort, dedup) and `assert` the four counts: 6 000 rows, 7 invalid dates, 354 missing incomes, no id above 6 000. Why 354 and not 356?

**P17.** *(putting it together)* Collection rate by due month for 2026 from the merged frame of Step 5: `due_month = due_date.dt.to_period("M")`, `groupby` → Σ due, Σ paid, rate. Compare September with week 4.

> 🚀 **Stretch (optional, +5 XP).** **P18.** *(pivot and melt)* `monthly_disbursements.csv` (170 long rows) → `pivot` to 34 months × 5 products, add a `total` column and SME's share per month; then `melt` it back to long. Which month had SME's highest share, and what was it in September 2026?

### Mistakes that cost a point this week

- `merge` without `how=` — inner by default; the unpaid instalments vanish.
- No `validate=` on a join whose grain you "know" — the week-2 fan-out, unflagged.
- `drop_duplicates` without `subset=` (0 removed) or without a sort first (the wrong survivor kept).
- `errors="coerce"` taken as validation — 7 impossible dates pass.
- `fillna` before the merge instead of after — the NaN that marks "no payment" is lost.
- `groupby` on a key with blanks without `dropna=False` — a group silently missing.
- A row-wise `apply(axis=1)` where column arithmetic exists.
- `concat` of frames with differently spelt columns — a silent split.
- Counts that live in your head instead of in `assert` lines.

---

## 4. Homework <span class="badge hw">HW 5.2 — Due Day 5</span>

**Jasur's Monday script.** Hand in `clean_nur.py` (or the executed `day3_starter.ipynb` with the three TODO functions filled in) and the three CSVs it writes, in the 📎 box below:

1. **`customers_clean.csv`** — 6 000 rows from `customers_dirty.csv`: names stripped and title-cased, duplicates removed on `phone` + `birth_date` keeping the earliest `registered_at`, `birth_date_invalid` (7 True), `birth_date_clean` (NaT when invalid), `monthly_income` NaN kept as NaN (354).
2. **`payments_clean.csv`** — 52 850 rows: `method` in 5 values, duplicates removed on `installment_id` + `paid_at` + `amount` keeping the lowest `payment_id`, `is_forward_dated` (24 True, rows kept). Σ `amount` 255 114 772 176.
3. **`dpd_per_loan.csv`** — one row per loan (7 828): `loan_id`, `dpd`, `bucket`, computed from `installments.csv` + your clean payments as in the Company corner; 399 loans with `dpd > 0`, buckets 7 429 / 124 / 25 / 16 / 234, equal to `loans_status.csv`'s `dpd` for every loan.
4. **Asserts** on every count above inside the script, plus `len(merged) == len(installments)` after the merge; running `python clean_nur.py` prints nothing but the three file names when all is well.

**Paths.** Your mentor runs your script in a folder that has the raw files in a `data/excel/` folder next to it. So read them as `Path("data/excel/customers_dirty.csv")` (put the downloaded files in a `data/excel/` folder next to your script to test it), and write the three CSVs into the current folder (`customers_clean.csv`, not a path elsewhere). The editors below read the course copies with the page's own path (`../excel/…`) — only the read line differs. Also due today: **HW 5.1**, in Day 1's hand-in box.

**Check your key numbers before you hand in.** Paste each of your functions into its editor; the check compares what it prints with the warehouse.

### 📎 Hand in here

---

## 5. Self-check

---

## 6. Company corner <span class="badge company">DPD in pandas</span>

The week-2 DPD block, the week-3 `v_loan_status`, the week-4 Power Query merge — now as the function Jasur schedules. Grain discipline is the whole method: instalment → loan.

```python
AS_OF = pd.Timestamp("2026-10-01")
# grain: instalment, 92 193
inst = pd.read_csv("../excel/installments.csv", parse_dates=["due_date"])
# clean_payments(): 52 850
pay  = (pd.read_csv("../excel/payments_dirty.csv", parse_dates=["paid_at"])
          .sort_values("payment_id").drop_duplicates(subset=["installment_id", "paid_at", "amount"]))

# 1. payments through the as-of …
paid = (pay[pay["paid_at"] <= AS_OF]
        # … aggregated per instalment
        .groupby("installment_id", as_index=False).agg(paid=("amount", "sum")))
# 2. every instalment kept
m = inst.merge(paid, on="installment_id", how="left", validate="1:1")
assert len(m) == len(inst)
# no payment = 0 paid
m["paid"] = m["paid"].fillna(0)
# 3. not fully paid
m["unpaid"]  = m["paid"] < m["total_due"]
# and already due
m["matured"] = m["due_date"] <= AS_OF
# 1 784 instalments
late = m[m["unpaid"] & m["matured"]]
# 4. per loan: as-of − oldest unpaid due date
dpd = (AS_OF - late.groupby("loan_id")["due_date"].min()).dt.days.rename("dpd")
# 5. every loan, 0 when nothing is late
loans = (pd.read_csv("../excel/loans_status.csv")[["loan_id"]]
         .merge(dpd, on="loan_id", how="left").fillna({"dpd": 0}).astype({"dpd": int}))
loans["bucket"] = pd.cut(loans["dpd"], [-1, 0, 30, 60, 90, np.inf], labels=["0", "1-30", "31-60", "61-90", "90+"])
print((loans["dpd"] > 0).sum())
loans["bucket"].value_counts().sort_index()
```

`(loans.dpd > 0).sum()` → **399**; `loans.bucket.value_counts().sort_index()` → **7 429 / 124 / 25 / 16 / 234**; merged against `loans_status.csv`, `(dpd == dpd_sql).all()` → **True** for all 7 828 loans. Same definition, same rows, third tool, same number — which is the only acceptable outcome.

> 💡 **Key idea.** Where the pandas version is *better* than the SQL: `validate="1:1"` and the `assert` make the grain explicit; `AS_OF` is one variable, so the 1 September snapshot for roll rates is the same function with another argument; and the 25 duplicates are handled by a named step (`clean_payments`) rather than a view somebody has to remember to use.

**FPD30 by vintage × channel = one `pivot_table`.** The first instalment per loan, in scope if its due date is ≤ as-of − 30 days; late if not fully paid within 30 days (`paid < total_due` or `first_paid − due_date > 30`); vintage = month of disbursement; channel from the product (Day 2 P11: app sells Micro, partner sells BNPL, the branch everything else — `loans_status.csv` has no channel column):

```python
ls = pd.read_csv("../excel/loans_status.csv", parse_dates=["disbursed_at"])
loan_channel = ls[["loan_id", "disbursed_at"]].assign(
    channel=ls["product"].map({"Micro loan": "app", "Buy now pay later": "partner"}).fillna("branch"))
first = inst[(inst["installment_no"] == 1) & (inst["due_date"] <= AS_OF - pd.Timedelta(days=30))]
paid1 = pay[pay["paid_at"] <= AS_OF].groupby("installment_id", as_index=False).agg(paid=("amount", "sum"), first_paid=("paid_at", "min"))
f = first.merge(paid1, on="installment_id", how="left").fillna({"paid": 0})
f["fpd30"] = ((f["paid"] < f["total_due"]) | ((f["first_paid"] - f["due_date"]).dt.days > 30)).astype(int)
# loan_id, disbursed_at, channel
f = f.merge(loan_channel, on="loan_id", validate="1:1")
f["vintage"] = f["disbursed_at"].dt.to_period("M").astype(str)
pd.pivot_table(f, index="vintage", columns="channel", values="fpd30", aggfunc="mean").mul(100).round(2)
```

In scope **7 099**, FPD30 **91 = 1.28 %**; by channel app 41 / 2 411 = **1.70 %**, partner 16 / 1 425 = 1.12 %, branch 34 / 3 263 = 1.04 % — week 2's table, cell for cell. The pivot's last rows: 2026-05 app 0.76 / branch 1.12 / partner 5.97 (4 of 67 — too small to read); 2026-06 0.74 / 0.62 / 1.33; 2026-07 1.64 / 0.62 / 1.19; 2026-08 is 11 loans in scope and partner is NaN — an empty cell, not a 0. Swap `columns="channel"` for `"grade"` (A 0.60 · B 0.97 · C 2.16 · D 2.23 %, after adding `grade` to `loan_channel`) or `aggfunc=["sum", "count"]` to show the counts next to the rates, and group by quarter (`dt.to_period("Q")`) when the monthly cells are this thin. The unpaid-only definition (`paid < total_due` alone) gives app 1.04 % — Timur's tile; one boolean term is the whole 0.66-point argument between two departments.

> 🎯 **Interview version.** *"Compute DPD per loan in pandas from a schedule and a payments table."* — de-duplicate and cut payments at the as-of; `groupby(installment_id).sum()`; left-merge onto instalments with `validate="1:1"` and assert the row count; unpaid = paid < due, matured = due ≤ as-of; per loan `as_of − min(due_date)` of unpaid matured rows; `pd.cut` for buckets; reconcile the 399 and the bucket counts against the warehouse before anyone uses it as a model target.

**Say it like in an interview.** Answer the question above in your own words, as you would say it aloud, with Nur Finance's numbers.

Tomorrow: the numbers become pictures — matplotlib, seaborn, and `pd.read_sql`, which lets every week-3 CTE land straight in a DataFrame. Timur's figure pack.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 5 · Day 4 — Charts and the SQL bridge: matplotlib, seaborn, read_sql (weeks/week-05/day-4.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-05/day-4
=====

# Week 5 · Day 4 — Charts and the SQL bridge: matplotlib, seaborn, read_sql

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge company">Company corner</span>

> STORY **Thursday, 9:00.** Timur, BI (*BI-специалист*), with the board deck template. *"Madina's Excel page was right and nobody could update it. Power BI is right and the board will not open it. What the board opens is the deck. I want **a monthly figure pack as PNGs** — five charts, same size, same colours, a sentence on each — that I drop into slot four every month without touching a mouse. If your notebook makes them, I will run it. If it needs you, it is not a figure pack, it is a favour."* Jasur, from his desk: *"And read the SQL straight into pandas. Do not re-type a CTE you already have."*

## Today in 3 lines

- **The bridge:** `sqlite3.connect` + `pd.read_sql(query, con)` runs any week-3 SQL — the vintage CTE chain, the roll-rate `FULL OUTER JOIN` — and returns a DataFrame; the two worlds are one notebook.
- **matplotlib** (*библиотека matplotlib*) draws anything from a figure and an axes: `plot` (line), `bar` / `barh`, `hist`, `boxplot`, `scatter`; labels, a title that states the finding, a legend only when there is more than one series, big numbers formatted in bn; **seaborn** adds statistical charts on long-format data in one call (`barplot`, `lineplot`, `heatmap`, `boxplot`, `countplot`); `subplots` for a grid; `savefig` for the deck.
- The chart-choice rules are week 4's, unchanged; by evening Timur has `figures/01…05.png` and the code that makes them again next month.

**Homework:** nothing new today — HW 5.2 (Day 3's cleaning script) is due tomorrow, Day 5, in Day 3's 📎 box.

---

## 1. Learn — the figure, the axes, and what goes on them

Every concept below has the same five parts: what it is, how to write it (a box you can run — the chart appears under it), when you use it, the trap, and a small task. Run the boxes from top to bottom: the first box reads the data every later chart draws from.

### Figure and axes — the page and the chart on it

**What it is.** **matplotlib** (*библиотека matplotlib*) draws charts in two layers. The **figure** (*фигура*) is the page — its size, the file you save. The **axes** (*оси, область графика*) is one chart on that page — the lines, the bars, the title, the two axis scales. `fig, ax = plt.subplots()` makes one of each; everything you draw is a method of `ax`.

**How to write it.** The first box reads the two files of the day, then draws the simplest possible chart:

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path
# the folder the PNGs go to
Path("figures").mkdir(exist_ok=True)
# one grey for the data, one colour for the highlight
GREY, BLUE, RED = "#9ca3af", "#1d4ed8", "#dc2626"
# one row per loan: dpd, bucket, outstanding
status = pd.read_csv("../excel/loans_status.csv", parse_dates=["disbursed_at"])
# one row per month × product
md = pd.read_csv("../excel/monthly_disbursements.csv", parse_dates=["month"])
# drop October 2026: one day is not a month
md = md[md["month"] < "2026-10-01"]
# one row per month
monthly = md.groupby("month", as_index=False)[["loans", "amount"]].sum()

# a figure (the page) holding one axes (the chart area), 8 × 4 inches
fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(monthly["month"], monthly["amount"])  # draw on the axes: x, then y
ax.set_title("Disbursed per month")
```

The last three rows of `monthly`, the frame the chart draws:

| month | loans | amount |
|---|---|---|
| 2026-07-01 | 367 | 20 693 870 000 |
| 2026-08-01 | 358 | 22 290 210 000 |
| 2026-09-01 | 361 | 17 015 490 000 |

`monthly` has 33 rows, January 2024 to September 2026; the chart is one line through them, ending at 17.0 bn in September.

| | the figure `fig` | the axes `ax` |
|---|---|---|
| is | the page | one chart on the page |
| you set | the size (`figsize=`), a title over everything (`fig.suptitle`), a source line (`fig.text`) | the data (`ax.plot`, `ax.bar` …), `ax.set_title`, `ax.set_xlabel`, `ax.set_ylim` |
| you save | `fig.savefig("figures/01.png")` | — |

`plt.plot(...)` without `fig, ax` also draws — on "the current axes". That is fine for a quick look and confusing as soon as there are two charts. Write `fig, ax = plt.subplots()` every time.

**When you use it.**
- At the start of every chart: one `fig, ax`, then methods on `ax`.
- Whenever the chart is going into a file or a deck — the figure is what you save.

> ⚠️ **Watch out.** `ax.title("…")` raises `TypeError: 'Text' object is not callable`. On an axes the setters start with `set_`: `ax.set_title`, `ax.set_xlabel`, `ax.set_ylim`.

**Your turn.** Fill the three gaps of the smallest chart.

### Line chart — how a number moves over time

**What it is.** A **line chart** (*линейный график*) joins one point per period. Time runs left to right, so the eye reads the trend. A **rolling average** (*скользящее среднее*) — `rolling(3).mean()`, the average of this month and the two before — smooths the swings so the trend shows.

**How to write it.**

```python
# the 3-month average; the first two months have none (NaN)
monthly["ma3"] = monthly["amount"].rolling(3).mean()
fig, ax = plt.subplots(figsize=(10, 4))
# the raw months, thin and grey
ax.plot(monthly["month"], monthly["amount"], color=GREY, lw=1, label="month")
# the trend, thick and blue
ax.plot(monthly["month"], monthly["ma3"], color=BLUE, lw=2, label="3-month average")
# two lines → a legend says which is which
ax.legend(frameon=False)
monthly.tail(3)
```

| month | amount | ma3 |
|---|---|---|
| 2026-07-01 | 20 693 870 000 | 18 425 333 333 |
| 2026-08-01 | 22 290 210 000 | 19 678 126 667 |
| 2026-09-01 | 17 015 490 000 | 19 999 856 667 |

September alone fell to 17.0 bn, but the 3-month average still rose, to 20.0 bn: one weak month, not a turn in the trend.

`x` must be real dates (`datetime64` — `parse_dates=` did it here) so the months are spaced by time. `lw=` is the line width; `label=` is the text the legend shows.

**When you use it.**
- Any number per day, week or month: disbursements, collection rate per due month, PAR30 per month-end.
- Several series over the same time: one line each, at most four or five.

> ⚠️ **Watch out.** Leave the one-day October 2026 in and the last point is 0.85 bn — the line plunges, and the board reads a crash. A period that is not finished is dropped from a time series, or labelled "month to date".

**Your turn.** The 3-month average of September 2026, in bn.

### Bar and barh — how categories compare

**What it is.** A **bar chart** (*столбчатая диаграмма*) draws one bar per category; the bar's length is the number. `ax.bar` draws upright bars, `ax.barh` horizontal ones (*линейчатая диаграмма*) — better for rankings and long labels. A bar is read by its length, so **bars start at zero**.

**How to write it.**

```python
# the four late buckets, in their natural order
late = status["bucket"].value_counts().reindex(["1-30", "31-60", "61-90", "90+"])
fig, ax = plt.subplots(figsize=(8, 4))
# one highlight: 90+ in red
ax.bar(late.index, late.values, color=[RED if k == "90+" else GREY for k in late.index])
# from zero, with room above the tallest bar
ax.set_ylim(0, late.max() * 1.15)

# ascending: barh draws the last row on top
prod = status.groupby("product")["outstanding"].sum().sort_values()
fig, ax = plt.subplots(figsize=(8, 4))
ax.barh(prod.index, prod.values / 1e9, color=GREY)
ax.set_xlabel("outstanding, bn UZS")
late
```

| bucket | loans |
|---|---|
| 1-30 | 124 |
| 31-60 | 25 |
| 61-90 | 16 |
| 90+ | 234 |

The 90+ bar is the tallest: 234 of the 399 late loans are already more than 90 days late. In the second chart SME's bar is the longest, 125.9 bn of outstanding, and Micro's the shortest, 1.0 bn.

| | `ax.bar` | `ax.barh` |
|---|---|---|
| bars | upright | lying down |
| best for | few categories with a natural order: buckets, grades | rankings, long labels: products, branches, regions |
| order | the natural order (`reindex`) | sorted by value, largest on top (`sort_values()` ascending) |

**When you use it.**
- "How do these groups compare?" — loans per bucket, outstanding per product, loans per branch.
- A ranking: sort the bars by value, unless the categories have their own order (buckets, months).

> ⚠️ **Watch out.** A log scale or a y-axis that starts above zero makes bar lengths lie: a bar twice as long no longer means twice as much. When one bar dwarfs the rest (the 7 429 current loans), leave it out and say so in the axis label — do not squash the axis.

**Your turn.** One line on this chart breaks a rule that is not a matter of taste.

### Histogram and box plot — how one number is spread

**What it is.** A **histogram** (*гистограмма*) cuts a number's range into **bins** and draws one bar per bin: how many loans have a principal between 1 m and 1.3 m, between 1.3 m and 1.6 m, and so on. A **box plot** (*ящик с усами*) draws the same spread as five numbers per group: the median, the middle half (the box, from the 25th to the 75th percentile), the whiskers and the outliers.

**How to write it.**

```python
fig, ax = plt.subplots(figsize=(8, 4))
# 40 bins of equal width on a log scale, 100 000 to 1 000 000 000
ax.hist(status["principal"], bins=np.logspace(5, 9, 41), color=GREY)
ax.set_xscale("log")
ax.set_xlabel("principal, UZS (log scale)")

# products from the smallest median up
order = status.groupby("product")["principal"].median().sort_values().index
fig, ax = plt.subplots(figsize=(8, 4))
ax.boxplot([status.loc[status["product"] == p, "principal"] for p in order])
# the product names under the boxes (works in every matplotlib version)
ax.set_xticklabels(order)
ax.set_yscale("log")
status["principal"].describe()[["count", "mean", "50%", "max"]]
```

| principal | loans |
|---|---|
| 0.1 m – 1 m | 472 |
| 1 m – 10 m | 4 134 |
| 10 m – 100 m | 2 226 |
| 100 m – 1 bn | 996 |

Most of the 7 828 loans sit between 1 m and 10 m — the median is 5.79 m — while the mean is 51.7 m, pulled up by 996 loans of 100 m and more. On the log axis the histogram shows two humps: the small books (Micro, BNPL, Consumer) and the big ones (SME, Auto). The box plot puts SME's median at 314.8 m and Micro's at 2.7 m.

| | histogram | box plot |
|---|---|---|
| shows | the whole shape of one number | five numbers per group, side by side |
| best for | one group: "how is the principal spread?" | comparing groups: "principal per product" |
| you choose | the bins | nothing — the quartiles are fixed |

**When you use it.**
- Before you report a mean: is the number symmetric, skewed, or two groups mixed?
- DPD of the late loans, principal per product, ticket size per channel.

> ⚠️ **Watch out.** Money spans 300 000 to 599 060 000 — a 2 000× range. On a linear axis the histogram is one tall bar at the left and an invisible tail. Use a log axis (or `np.log10` first) and say "log scale" in the axis label.

**Your turn.** How many of the late loans are more than a year late? Draw their DPD as a histogram first.

### Scatter — two numbers per row

**What it is.** A **scatter plot** (*диаграмма рассеяния*) draws one dot per row, with one number on x and another on y. It shows whether the two move together, and which rows break the pattern.

**How to write it.**

```python
# 3 352 active loans
act = status[status["status"] == "active"]
fig, ax = plt.subplots(figsize=(6, 6))
# small, see-through dots
ax.scatter(act["principal"], act["outstanding"], s=8, alpha=0.3, color=BLUE)
# money on both axes → log
ax.set_xscale("log"); ax.set_yscale("log")
ax.set_xlabel("principal (log)"); ax.set_ylabel("outstanding (log)")
act[["principal", "outstanding"]].corr()
```

| | principal | outstanding |
|---|---|---|
| principal | 1.00 | 0.92 |
| outstanding | 0.92 | 1.00 |

3 352 dots; the correlation is 0.92 — a loan's outstanding follows its principal closely. Dots on the diagonal are young loans with nothing repaid; dots far below it are old loans almost paid off.

`s=` is the dot size, `alpha=` the opacity (0.3 = 30 %), so that thousands of dots on top of each other show as a darker cloud instead of one blob.

**When you use it.**
- "Do these two numbers move together?" — principal vs outstanding, income vs requested amount.
- Finding the rows that should not exist: a dot above the diagonal is a loan that owes more than it borrowed.

> ⚠️ **Watch out.** A correlation is one number for the whole cloud. It says nothing about the few dots that break the pattern — check those with a mask, not with your eyes.

**Your turn.** 3 352 dots at full size and full colour merge into one dark blob. Which change helps most?

### Labels, titles and number formats — a chart people can quote

**What it is.** The chart is finished when a reader can quote it without asking you. That takes a **title that states the finding** (*заголовок-вывод*), axis labels with the unit, numbers in a readable format (bn, not `2e10`), and a file saved at a fixed size. A **formatter** (`FuncFormatter`) rewrites every tick label of an axis; `fig.savefig` writes the PNG.

**How to write it.**

```python
from matplotlib.ticker import FuncFormatter
# every tick: 20000000000 → "20 bn"
bn = FuncFormatter(lambda x, _: f"{x / 1e9:,.0f} bn")
fig, ax = plt.subplots(figsize=(10, 4))
ax.plot(monthly["month"], monthly["ma3"], color=BLUE, lw=2)
ax.yaxis.set_major_formatter(bn)
# from zero; the top is automatic
ax.set_ylim(0, None)
last = monthly["ma3"].iloc[-1]
# the finding, computed from the data
ax.set_title(f"The 3-month average reached {last / 1e9:.1f} bn a month", loc="left")
ax.set_ylabel("disbursed per month, 3-month average")
# less ink: no frame on two sides
ax.spines[["top", "right"]].set_visible(False)
# the source line
fig.text(0.01, 0.01, "monthly_disbursements.csv · Jan 2024 – Sep 2026", fontsize=9, color="#6b7280")
# make room for every label
fig.tight_layout()
fig.savefig("figures/01_disbursements_ma3.png", dpi=150, facecolor="white")
```

The title reads "The 3-month average reached 20.0 bn a month", the y-axis runs from 0 bn to 20 bn, and the chart is saved as a 1 500 × 600 pixel PNG in `figures/`.

The twelve rules of week 4 Day 4, each as the line that implements it:

```python
# the four delinquent buckets, in order
late = status["bucket"].value_counts().reindex(["1-30", "31-60", "61-90", "90+"])
# 1  one chart, one message, a size that fits a slide
fig, ax = plt.subplots(figsize=(10, 5))
# 2  one colour + one highlight
ax.bar(late.index, late.values, color=[RED if k == "90+" else GREY for k in late.index])
# 3  bars from zero; headroom for labels
ax.set_ylim(0, late.max() * 1.15)
for i, v in enumerate(late.values):
    # 4  the number the reader will quote, formatted
    ax.text(i, v, f"{v:,}", ha="center", va="bottom")
# 5  the finding, left-aligned, not the chart's name
ax.set_title("399 loans are late; 234 are already 90+", loc="left")
# 6  the unit and the as-of
ax.set_ylabel("loans"); ax.set_xlabel("DPD bucket as of 2026-10-01")
# no ax.legend() call                                                      # 7 
# no legend for one series
# 8  less ink: no frame on two sides
ax.spines[["top", "right"]].set_visible(False)
ax.annotate("17 loans arrived from 61-90 this month", xy=(3, 234), xytext=(1.6, 200),
            # 9  one annotation for the point you talk about
            arrowprops=dict(arrowstyle="->", color=RED))
# 10 source line
fig.text(0.01, 0.01, "loans_status.csv · 7 828 loans · payments de-duplicated", fontsize=9, color="#6b7280")
# 11 nothing cut off
fig.tight_layout()
# 12 a file, not a screenshot
fig.savefig("figures/03_dpd_buckets.png", dpi=150, facecolor="white")
```

| `savefig` argument | does |
|---|---|
| `dpi=150` | pixels per inch: `figsize=(12, 5.4)` × 150 = 1 800 × 810 px, a 16:9 slide without rescaling |
| `facecolor="white"` | a white background — a transparent one turns black in some viewers |
| `bbox_inches="tight"` | trims the empty margin |
| `.svg` instead of `.png` | a vector file for a designer |
| `plt.close(fig)` after saving | frees the memory — needed when a loop saves dozens |

**When you use it.**
- Every chart that leaves your notebook: finding title, units, formatted numbers, source, saved file.
- Money axes: the `bn` formatter, or divide once in the data (`df["bn"] = df["outstanding"] / 1e9`) — never both.

> ⚠️ **Watch out.** `savefig` before `fig.tight_layout()` cuts long labels off the edge of the PNG. Call `tight_layout()` (or pass `bbox_inches="tight"`) last, just before saving.

**Your turn.** Fill the gaps of the bn formatter.

### Small multiples — one panel per group

**What it is.** **Small multiples** (*малые множественные графики*) are a grid of small charts of the same kind, one per group. `plt.subplots(rows, cols)` returns one figure and an array of axes; you draw one group on each. `sharey=True` gives every panel the same y-scale; `sharey=False` lets each panel use its own.

**How to write it.**

```python
# biggest product first
products = md.groupby("product")["amount"].sum().sort_values(ascending=False).index
# one row of five axes
fig, axes = plt.subplots(1, 5, figsize=(16, 3), sharey=False)
for ax, p in zip(axes, products):
    one = md[md["product"] == p]
    ax.plot(one["month"], one["amount"] / 1e9, color=BLUE)
    ax.set_title(p, loc="left", fontsize=10)
    ax.tick_params(axis="x", rotation=45)
fig.suptitle("Monthly disbursements by product, bn UZS — each panel on its own scale", x=0.01, ha="left")
fig.tight_layout()
md.groupby("product")["amount"].sum().div(1e9).round(1).sort_values(ascending=False)
```

| product | disbursed, Jan 2024 – Sep 2026, bn |
|---|---|
| Small business loan | 240.7 |
| Auto loan | 84.6 |
| Consumer loan | 65.0 |
| Micro loan | 7.2 |
| Buy now pay later | 6.5 |

SME lent 240.7 bn, BNPL 6.5 bn — 37 times less. On one shared axis BNPL would be a flat line at the bottom; in its own panel its shape — the months it grew — becomes visible.

| | `sharey=True` | `sharey=False` |
|---|---|---|
| the panels compare | levels: which group is bigger | shapes: how each group moves |
| small groups | flat lines | readable |
| say in the title | — | "each panel on its own scale" |

`axes` is an array: `axes[0]` for one row, `axes[0, 1]` for a 2-row grid, `for ax in axes.flat:` to loop over all of them.

**When you use it.**
- One series per group with very different sizes: products, regions, channels.
- Instead of five lines on one chart that cross and tangle.

> ⚠️ **Watch out.** With `sharey=False` two panels of the same height can differ by a factor of 37. Readers compare heights by habit — say "own scale" in the title, or use `sharey=True` when levels are the point.

**Your turn.** Bekzod asks: "which product grew fastest in 2026?" — not which is biggest. Which grid?

### What chart for what question

**What it is.** The chart type follows the **question**, not the data. Week 4's table and rules, unchanged — each row a matplotlib method you have now used.

**How to write it.**

| Question | chart | `ax.` method | Notes |
|---|---|---|---|
| How does it move over time? | line | `plot(x, y)` | x as real dates; one line per series |
| How do categories compare? | bar / barh | `bar` / `barh` | **from zero**; sorted by value unless the order is natural |
| How is one number spread? | histogram | `hist(values, bins=…)` | bins by hand; log axis for money |
| Spread per group | box plot | `boxplot([g1, g2, …])` | median, quartiles, whiskers |
| Two numbers per row | scatter | `scatter(x, y, s=8, alpha=0.3)` | log axes for money |
| A matrix: group × group | heatmap | `sns.heatmap(wide)` | vintage cohort × MOB, roll matrix |
| One series per group | small multiples | `plt.subplots(1, n)` | `sharey` decides what is compared |

The rules that are not a matter of taste: **no pie** beyond three slices, **no 3D**, **bars start at zero**, **sort by value** unless the order is natural, **one colour + one highlight**, **the title states the finding** (*"SME is 60 % of the book"*, not *"Outstanding by product"*), **no legend for one series**, **the unit on the axis or in the title**, a **source line**, **no second y-axis** (two lines on two scales cross wherever you like). An unfinished period — the one-day October 2026, 0.85 bn — is dropped from every time series. When one bar dwarfs the rest, as the 7 429 current loans do, it goes into the axis label, not onto a log scale.

**When you use it.**
- Before you write the first line of chart code: name the question, then pick the row.
- When a chart "looks wrong": usually it answers a different question than the one asked.

> 💡 **Key idea.** The chart is chosen by the **question**, and the title answers it. If you cannot write the finding as the title, you do not know yet what the chart is for.

**Your turn.** Put each question under the chart that answers it.

### pandas .plot — the five-second chart

**What it is.** Every DataFrame and Series has a **`.plot`** method: matplotlib underneath, with the **index on x** and one line per column. `.plot()` draws a line; `.plot.bar()`, `.plot.barh()`, `.plot.hist()`, `.plot.box()`, `.plot.scatter(x=, y=)` draw the rest. It returns the axes, so the decorations above still work.

**How to write it.**

```python
# WIDE: the month as index, one column per product
wide = md.pivot(index="month", columns="product", values="amount")
# one call: one line per column, the index on x
ax = wide.plot(figsize=(10, 4), title="Disbursed per month, by product")
# .plot returns the axes — decorate it as usual
ax.set_xlabel("")
wide.tail(3)
```

| month | Auto loan | Buy now pay later | Consumer loan | Micro loan | Small business loan |
|---|---|---|---|---|---|
| 2026-07-01 | 1 835 510 000 | 329 320 000 | 2 751 920 000 | 354 290 000 | 15 422 830 000 |
| 2026-08-01 | 5 377 060 000 | 315 360 000 | 2 607 640 000 | 336 950 000 | 13 653 200 000 |
| 2026-09-01 | 4 398 600 000 | 276 590 000 | 3 409 790 000 | 328 630 000 | 8 601 880 000 |

Five lines from one call, one per column. SME dominates every month — 8.6 bn of September's 17.0 bn — and the two smallest products sit near zero.

| you write | you get |
|---|---|
| `s.plot()` / `df.plot()` | line(s), index on x |
| `s.plot.barh()` | horizontal bars, one per index value |
| `s.plot.hist(bins=30)` | a histogram |
| `df.plot.scatter(x="principal", y="outstanding")` | a scatter |
| `df.plot(ax=ax)` | draws into an axes you made with `plt.subplots` |

**When you use it.**
- Exploring: a five-second look at a column or a pivot.
- Not for the deck: the formatter, the finding title and the size are easier through `fig, ax`.

> ⚠️ **Watch out.** `.plot()` puts the **index** on x and draws **every numeric column**. On a frame with a 0…n index and a `loan_id` column you get a line of loan ids. `set_index("month")` and pick the column first: `df.set_index("month")["amount"].plot()`.

**Your turn.** From `wide`, the SME total over the 33 months, in bn.

### seaborn — statistical charts from long data

**What it is.** **seaborn** (*библиотека seaborn*) sits on matplotlib and draws a whole statistical chart in one call from a DataFrame. Its gift is **`hue`**: a third column that becomes colour — one line or bar per value. `hue` wants **long** data (*длинный формат*: one row per month × product); `heatmap` wants **wide** data (*широкий формат*: a matrix, like `pivot` or `crosstab`).

**How to write it.**

```python
import seaborn as sns
# one look for every chart after this line
sns.set_theme(style="whitegrid")
fig, ax = plt.subplots(figsize=(10, 4))
# LONG data: hue = one line per product
sns.lineplot(data=md, x="month", y="amount", hue="product", ax=ax)
fig, ax = plt.subplots(figsize=(6, 3))
# a TOTAL per product
sns.barplot(data=status, x="outstanding", y="product", estimator=sum, errorbar=None, color=GREY, ax=ax)
# WIDE: products × grades
ct = pd.crosstab(status["product"], status["grade"])
fig, ax = plt.subplots(figsize=(6, 3))
# one coloured, numbered cell per pair
sns.heatmap(ct, annot=True, fmt="d", cmap="Reds", ax=ax)
ct
```

| product | A | B | C | D |
|---|---|---|---|---|
| Auto loan | 83 | 181 | 111 | 16 |
| Buy now pay later | 360 | 676 | 453 | 80 |
| Consumer loan | 548 | 1 043 | 718 | 109 |
| Micro loan | 655 | 1 154 | 777 | 83 |
| Small business loan | 175 | 350 | 205 | 51 |

The heatmap's darkest cell is Micro × B, 1 154 loans. Every product has roughly the same grade mix — about 23 / 44 / 29 / 4 % — so a product difference in risk is not a grade difference.

| seaborn call | data shape it wants | what it does | Nur Finance use |
|---|---|---|---|
| `lineplot(x, y, hue)` | long, one row per period × series | one line per `hue` value | monthly disbursement by product |
| `barplot(x, y, hue)` | long rows *or* pre-aggregated | **the mean** per category by default — pass `estimator=sum` | outstanding by product |
| `countplot(x, hue)` | raw rows | counts rows per category | loans per grade per product |
| `heatmap(matrix)` | **wide**: a `pivot` / `crosstab` | colours each cell, `annot=True` prints it | vintage cohort × MOB, roll matrix |
| `boxplot(x, y)` / `histplot(x, hue)` | raw rows | the spread, per group | principal by product |
| `relplot(…, col=)` | long | **small multiples**, one panel per `col` value | one panel per product |

Every call takes `ax=` and returns the axes, so titles and formatters work as before. `melt` turns wide into long, `pivot` long into wide (Day 3).

**When you use it.**
- A chart with `hue` (several groups in colour) or a heatmap — one call instead of a loop.
- `sns.set_theme()` once at the top gives a whole figure pack the same look.

> ⚠️ **Watch out.** `sns.barplot` on raw rows draws the **mean** per category, not the total. "Outstanding by product" without `estimator=sum` is quietly "average outstanding per loan" — SME's bar becomes 161 m instead of 125.9 bn.

**Your turn.** What would the default `barplot` draw for SME? Print SME's mean outstanding per loan, in m.

### sqlite3 and read_sql — the bridge

**What it is.** `sqlite3.connect(path)` opens a database file. **`pd.read_sql(query, con)`** runs any SQL in the database and returns the result as a DataFrame, with the columns of the `SELECT`. Every query from weeks 1–3 — joins, CTEs, window functions — lands in pandas without being re-typed. Values go in through **`params=`**, one `?` per value.

**How to write it.**

```python
import sqlite3
# the database is a file: no server, no password
con = sqlite3.connect("../raw/nur.db")
q = """SELECT strftime('%Y-%m', disbursed_at) AS month, COUNT(*) AS loans, SUM(principal) AS disbursed
       FROM loans WHERE disbursed_at < ? GROUP BY 1 ORDER BY 1"""
# the SQL runs in the database; a DataFrame comes back
by_month = pd.read_sql(q, con, params=("2026-10-01",))
fwd = pd.read_sql("SELECT COUNT(*) AS n FROM payments WHERE paid_at > ?", con, params=("2026-10-01",))
print(len(by_month), fwd["n"][0])
by_month.tail(3)
```

| month | loans | disbursed |
|---|---|---|
| 2026-07 | 367 | 20 693 870 000 |
| 2026-08 | 358 | 22 290 210 000 |
| 2026-09 | 361 | 17 015 490 000 |

33 months, the same numbers as the CSV above — the SQL and the file agree. The second query finds 24 payments dated after the as-of.

| you want | you write |
|---|---|
| open the database | `con = sqlite3.connect("../raw/nur.db")` |
| a query → a DataFrame | `pd.read_sql(sql, con)` |
| a value from Python in the query | `?` in the SQL + `params=(value,)` — the comma makes a tuple |
| dates as dates | `parse_dates=["disbursed_at"]` |
| a DataFrame → a table | `df.to_sql("name", con, if_exists="replace", index=False)` |
| SQL Server / PostgreSQL | `sqlalchemy.create_engine("mssql+pyodbc://…")`, then the same `read_sql` |

**When you use it.**
- Any number that is one `GROUP BY` or join over the big tables: let the database do it.
- A week-3 CTE chain (vintage, roll rate): paste it into `read_sql` unchanged.

> ⚠️ **Watch out.** Values go in `params=`, never into the SQL text. `f"… WHERE paid_at > '{as_of}'"` works today and breaks on the first value with a quote in it — and on a real server it is how an injection gets in.

**Your turn.** Fill the gaps of a safe query.

### When SQL, when pandas

**What it is.** One notebook holds both tools. **SQL** aggregates and joins inside the database, at the database's grain. **pandas** shapes, cuts, checks and charts what comes back. The split is a decision you make per step.

**How to write it.** The same count, both ways — they must agree:

```python
# aggregated in the database
sql_way = pd.read_sql("SELECT product_id, COUNT(*) AS loans FROM loans GROUP BY product_id", con)
# aggregated in memory
pandas_way = status["product"].value_counts()
print(sql_way["loans"].sum(), pandas_way.sum())
```

```text
7828 7828
```

Both give 7 828 loans: the database and the extract agree, so either can feed the chart.

| step | SQL | pandas |
|---|---|---|
| join 92 193 instalments to loans and products | ✔ one query, fast | possible, slower, more memory |
| a week-3 CTE chain (vintage, roll rate) | ✔ paste it into `read_sql` | rewrite needed |
| a definition several tools share (a view) | ✔ | — |
| reshape: `pivot`, `melt`, `rolling`, `pct_change` | awkward | ✔ |
| cut into buckets, merge two results, assert the counts | possible | ✔ shorter |
| a loop over months, a chart, a CSV / Excel / PNG | — | ✔ |

**When you use it.**
- Big aggregation or a shared definition → SQL, through `read_sql`.
- Everything after the aggregation — shape, check, chart, file → pandas.

> 💡 **Key idea.** Split the work by what each tool does well: the aggregation SQL does well (joins across 92 193 instalments, the DPD snapshots) stays in SQL; the shaping, cutting and plotting pandas does well happens after. Tomorrow's checkpoint asks you which was easier for which section — this is the vocabulary.

**Your turn.** Sort the steps.

### Putting it together

One figure for Timur's deck, every step of the day: **read_sql** for the aggregation (the as-of as a parameter), an **assert** before the chart, pandas for the **line**'s 3-month average, **labels and a formatter**, a **title computed from the data**, **savefig**.

```python
def fig_disbursements(con, as_of):
    """Figure 1: monthly disbursements and their 3-month average, for the months before as_of."""
    m = pd.read_sql("""SELECT strftime('%Y-%m', disbursed_at) AS month, SUM(principal) AS disbursed
                       FROM loans WHERE disbursed_at < ? GROUP BY 1 ORDER BY 1""", con, params=(as_of,))   # 1 SQL: the aggregation
    # 2 a check before the chart
    assert m["disbursed"].gt(0).all(), "a month with no lending — check the extract"
    # 3 pandas: types and the average
    m["month"] = pd.to_datetime(m["month"])
    m["ma3"] = m["disbursed"].rolling(3).mean()
    # 4 matplotlib: a 16:9 chart
    fig, ax = plt.subplots(figsize=(12, 5.4))
    ax.plot(m["month"], m["disbursed"], color=GREY, lw=1, label="month")
    ax.plot(m["month"], m["ma3"], color=BLUE, lw=2, label="3-month average")
    ax.yaxis.set_major_formatter(bn)
    ax.set_ylim(0, None)
    jan = m.loc[m["month"] == "2026-01-01", "ma3"].iloc[0]
    ax.set_title(f"The 3-month average rose from {jan / 1e9:.1f} to {m['ma3'].iloc[-1] / 1e9:.1f} bn a month in 2026", loc="left")
    ax.legend(frameon=False)
    fig.tight_layout()
    return fig

fig = fig_disbursements(con, "2026-10-01")
# 5 the file for the deck
fig.savefig("figures/01_disbursements_ma3.png", dpi=150, facecolor="white")
```

The title reads "The 3-month average rose from 16.6 to 20.0 bn a month in 2026". Next month Timur calls `fig_disbursements(con, "2026-11-01")` and the title, the line and the file update themselves. In a loop that saves many figures, add `plt.close(fig)` after each `savefig`.

**Your turn.** By how many percent did the 3-month average rise from January to September 2026?

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ matplotlib figure and axes — [Python for Data Analytics - Full Course for Beginners (Luke Barousse), 5:21:23](https://youtu.be/wUSDVGivd-8?t=19283&end=20081)
- ▶ Chart formatting / histograms / box plots — same course, [8:17:21](https://youtu.be/wUSDVGivd-8?t=29841&end=30606)
- ▶ seaborn — same course, [9:31:39](https://youtu.be/wUSDVGivd-8?t=34299&end=35140)
- ▶ seaborn (short single-topic) — [Seaborn Crash Course - Data Visualization in Python (NeuralNine), 08:16](https://youtu.be/rLVCSmtoA7U?t=496&end=840)
- ▶ pandas plotting shortcuts — [Creating Visualizations using Pandas Library (Alex The Analyst), 01:52](https://youtu.be/JpSMse3eVVg?t=112&end=192)
- ▶ `read_sql` — [SQL Databases with Pandas and Python - A Complete Guide (Rob Mulla), 08:35](https://youtu.be/DiQ5Hni6oRI?t=515&end=684)
- ▶ `read_sql` with SQLite (matches the page's `sqlite3.connect`) — [SQLite with Pandas (Code Adhyayana)](https://youtu.be/xcVXCK6U6LA)

- RU deck (TBC Data Analytics 2.0, if you have it) `4.5_Python.pdf`: matplotlib OO interface pp. 12–20, seaborn relational / categorical / distribution plots pp. 22–38 (long vs wide data p. 24), heatmap p. 36, pandas plotting pp. 47–55, chart choice and storytelling pp. 68–72. `4.4_Python.pdf`: DB-API and cursors pp. 7–28, `read_sql` / `to_sql` / chunking pp. 29–34, SQLAlchemy engines pp. 38–54 (for the day you connect to SQL Server).
- *Russian terms:* график = chart / plot, линейный график = line chart, столбчатая / линейчатая диаграмма = bar / barh, гистограмма = histogram, ящик с усами = boxplot, диаграмма рассеяния = scatter, тепловая карта = heatmap, подграфик = subplot, легенда = legend, ось = axis, длинный / широкий формат = long / wide format.

---

## 2. Worked example — figure 2 from query to PNG (15 min)

Outstanding mix by product, as a ranking, with shares as labels — the chart Madina's Excel page had, now reproducible. Each step uses one concept from section 1:

1. **Step 1 — read_sql, the bridge.** SQL joins the 92 193 instalments to loans and products and sums the principal not yet due, per product.
2. **Step 2 — an assert.** The total must be 208 723 504 430 before anything is drawn.
3. **Step 3 — pandas for the share.** One new column: outstanding ÷ total.
4. **Step 4 — barh, sorted, one highlight.** Five long labels, so horizontal bars, largest on top, SME in blue.
5. **Step 5 — labels, titles and number formats.** `bn · %` on every bar, the `bn` formatter on the axis, a title computed with an f-string.
6. **Step 6 — savefig.** `tight_layout`, then the PNG.

```python
mix = pd.read_sql("""
    SELECT p.name AS product, SUM(i.principal_due) AS outstanding
    FROM installments i JOIN loans l ON l.loan_id = i.loan_id JOIN products p ON p.product_id = l.product_id
    WHERE i.due_date > '2026-10-01' GROUP BY 1 ORDER BY 2""", con)                     # SQL does the 92 193-row join
# the extract still has the shape we know
assert mix["outstanding"].sum() == 208_723_504_430
# pandas does the share
mix["share"] = 100 * mix["outstanding"] / mix["outstanding"].sum()
fig, ax = plt.subplots(figsize=(10, 5))
ax.barh(mix["product"], mix["outstanding"], color=[BLUE if s == mix["share"].max() else GREY for s in mix["share"]])
for y, (v, s) in enumerate(zip(mix["outstanding"], mix["share"])):
    # the number the board will quote
    ax.text(v, y, f"  {v / 1e9:,.1f} bn · {s:.1f} %", va="center")
# room for the labels
ax.xaxis.set_major_formatter(bn); ax.set_xlim(0, mix["outstanding"].max() * 1.35)
ax.set_title(f"SME is {mix['share'].max():.0f} % of the {mix['outstanding'].sum() / 1e9:.1f} bn book on 10 % of the loans", loc="left")
fig.tight_layout(); fig.savefig("figures/02_outstanding_mix.png", dpi=150)
```

Output: SME 125.9 bn · 60.3 % (blue) · Auto 57.7 · 27.6 · Consumer 23.1 · 11.0 · BNPL 1.1 · 0.5 · Micro 1.0 · 0.5, smallest at the bottom because `ORDER BY 2` ascending puts the largest bar at the top of a `barh`. Six decisions, each a week-4 rule: barh because five long labels; sorted; from zero; one highlight; the share in the label rather than a second axis; the finding as the title.

> 💡 **Key idea.** A monthly figure must not go stale. The `assert` on the total stops the run when the November extract changes shape, and the title is **built from the data** with an f-string — "60 %" and "208.7 bn" are computed, so next month they are next month's numbers.

---

## 3. Practice (50 min)

Each editor opens `nur.db` or reads the extract; a chart appears under the editor when your code draws one. Print the number the task asks for, then ✔ Check — and write the finding you would put in the chart's title. In Jupyter, `data/python/day4_starter.ipynb` has the five pack figures; add your cells below and save every chart to `figures/`.

**P1.** *(figure, axes and a line chart)* `monthly` from the bridge: a line of the 33 months (October dropped) with pandas' `.plot()` in one line, then the same with `fig, ax` and the bn formatter. What does the one-liner lack for the deck? Print September 2026 in bn.

**P2.** *(bar and barh)* Outstanding by region as a sorted barh with bn labels; then the same for Tashkent's product mix. One finding title each. Print Tashkent's outstanding in bn.

**P3.** *(histogram)* Histogram of `principal` (all 7 828 loans) with 30 bins, then with `ax.set_xscale("log")` — or `np.log10` first. Which one shows the two books?

**P4.** *(box plot)* `sns.boxplot` of `principal` by `product`, products ordered by median (or `ax.boxplot` with one list per product). Read SME's box: print the medians.

**P5.** *(scatter)* Scatter of `principal` vs `outstanding` for active loans, `alpha=0.3`, both axes log. What is the correlation, and how many points sit *above* the diagonal (outstanding > principal)?

**P6.** *(labels, titles and number formats)* The four-bucket bar chart, finished: a data label on every bar (`f"{v:,}"`), the unit on the y-axis, a source line, and a title computed from the data — *"N loans are late; M of them are already 90+"*. Print the 90+ share of the late loans, in % with one decimal.

**P7.** *(small multiples)* A 2 × 2 grid: buckets (bar), outstanding mix (barh), monthly line, roll heatmap — one `fig.suptitle`, one source line, one PNG. Then say why this is *not* what Timur asked for.

**P8.** *(what chart for what question)* Nilufar wants the FPD30 rate for 4 grades × 3 channels on one slide, so the committee can see where the worst cell is. Which chart?

**P9.** *(pandas .plot vs seaborn)* `sns.lineplot` of monthly disbursements by product (`hue="product"`) from `monthly_disbursements.csv` — long data, October dropped. Then `pivot` to wide and `df.plot()` — same chart? Which product would someone ask to put on its own axis, and why do you refuse? Print SME's January–September 2026 total in bn.

**P10.** *(seaborn)* `sns.countplot(x="grade", hue="product")` — then the same information as a heatmap of `pd.crosstab(product, grade)`. Which reads better, and what is the finding? Print the crosstab.

**P11.** *(read_sql with params)* The bridge with parameters: a function `late_loans(con, as_of)` that runs the week-2 DPD logic in SQL with `params=` and returns the bucket counts. Call it for 1 September and 1 October.

> 🚀 **Stretch (optional, +5 XP).** **P12.** *(when SQL, when pandas)* `to_sql`: write `dpd_per_loan` (HW 5.2) into `nur.db` as a table `loan_dpd_pandas`, then `read_sql` a join of it with the week-2 DPD logic to count mismatches loan by loan. Then drop the table (`con.execute("DROP TABLE loan_dpd_pandas")`) — why drop it? How many mismatches?

### Mistakes that cost a point this week

- A title that names the chart instead of the finding; a legend on a single series.
- Bars not from zero, a log axis on bars, a pie of five products, a second y-axis.
- Twelve-digit tick labels (`2e11`) — no formatter.
- The October-2026 one-day point left in a time series.
- `sns.barplot` on raw rows without `estimator=sum` — a mean where a total was meant.
- SQL built with f-strings instead of `params=`.
- A PNG saved before `tight_layout()` — the labels are cut off.
- A hard-coded number in a title that the next month's data contradicts.

---

## 4. Self-check

---

## 5. Company corner <span class="badge company">The figure pack</span>

Five PNGs, one notebook, no mouse. Each figure: SQL for the heavy lifting through `read_sql`, pandas for the shape, matplotlib/seaborn for the picture, a finding in the title, `savefig` to `figures/`. The full code is in `day4_starter.ipynb` (executed, so the outputs are visible); the design of each:

| # | File | Data | Chart | Title (the finding, as of 2026-10-01) |
|---|---|---|---|---|
| 1 | `01_disbursements_ma3.png` | `GROUP BY month` on `loans` via `read_sql`; `rolling(3).mean()` | line, month in grey + 3-month average in blue; bn formatter; October dropped | *Disbursements climbed from 3.9 bn (Jan 2024) to a 20 bn run-rate — read the average, not the month* |
| 2 | `02_outstanding_mix.png` | instalments due after the as-of, joined to products, in SQL | barh sorted, largest on top, SME highlighted, `bn · %` labels | *SME is 60 % of the 208.7 bn book on 10 % of the loans* |
| 3 | `03_dpd_buckets.png` | `loans_status.csv` → `value_counts` | bar of the four delinquent buckets from zero, 90+ red, counts as labels; the 7 429 current loans (94.9 %) in the axis label | *399 loans are late; 234 of them are already 90+ — the risk is old debt, not a new wave* |
| 4 | `04_vintage_heatmap.png` | the week-3 vintage CTE chain, unchanged, via `read_sql`; `pivot(cohort × mob)` | `sns.heatmap`, Reds, annotated to one decimal, NaN cells blank | *October 2025 is the worst cohort: 6.9 % ever-30+ by month 3, 11.5 % by month 6* |
| 5 | `05_roll_rate.png` | the week-3 roll-rate CTE (two snapshots, `FULL OUTER JOIN`) via `read_sql`; `pivot` to a 5 × 5 matrix | `sns.heatmap` coloured by % of the from-bucket, annotated with counts | *1–30 cures 76 % and rolls 19.5 %; after 60 days nobody comes back* |

The numbers behind the titles, from the notebook's own output: figure 1's average rises from 16.6 bn (Jan 2026) to 20.0 bn (Sep 2026) while single months swing −32 % / +65 %; figure 2's shares 60.3 / 27.6 / 11.0 / 0.5 / 0.5 and total 208 723 504 430; figure 3's 124 / 25 / 16 / 234; figure 4's row 2025-10: 2.76 · 4.15 · **6.91** · 8.76 · 9.68 · **11.52** % against a pooled 2025 curve of 4.35 % at MOB 3 and 7.46 % at MOB 6; figure 5's matrix: from 1–30 → 0: 97, stays 6, → 31–60: 25 (19.5 %); 31–60 → 61–90: 16 of 23 (69.6 %); 61–90 → 90+: 17 of 17; 90+ → 90+: 217, plus 117 new entries into 1–30. Every one of these is a week-2/3 number the board has seen in a table; the pack is the same number in a form they will remember.

The driver that Timur runs — each figure is a function `(con, as_of) → fig`, the pack is a loop:

```python
# (shape only — not meant to run) … the five fig_* makers are in
# day4_starter.ipynb
FIGURES = {"01_disbursements_ma3": fig_disbursements, "02_outstanding_mix": fig_mix, "03_dpd_buckets": fig_buckets,
           "04_vintage_heatmap": fig_vintage, "05_roll_rate": fig_roll}

def figure_pack(con, as_of, out_dir="figures"):
    # figures/2026-10-01/
    out = Path(out_dir) / str(as_of.date()); out.mkdir(parents=True, exist_ok=True)
    for name, make in FIGURES.items():
        # every maker queries with params=(as_of,) and asserts its counts
        fig = make(con, as_of)
        fig.savefig(out / f"{name}.png", dpi=150, facecolor="white")
        plt.close(fig)
    return sorted(p.name for p in out.glob("*.png"))

figure_pack(con, pd.Timestamp("2026-10-01"))
# ['01_disbursements_ma3.png', '02_outstanding_mix.png', '03_dpd_buckets.png',
# '04_vintage_heatmap.png', '05_roll_rate.png']
```

> 💡 **Key idea.** **Reproducibility is the deliverable.** Three habits make the pack Timur's and not a favour: the as-of date is one variable used in every query (`params=(AS_OF,)`); every title that quotes a number computes it (`f"… {b['90+']:,} of them are already 90+ …"`); and an `assert` on each data frame before its chart (`assert b.sum() == 7828`) stops the run when the extract changes shape, instead of saving a wrong PNG. Next month: change `AS_OF`, Kernel → Restart & Run All, five new files in `figures/`.

**If `FULL OUTER JOIN` fails** (SQLite before 3.39): build the two snapshots in pandas with Day 3's `dpd_per_loan(inst, pay, as_of)` for 2026-09-01 and 2026-10-01, `merge(on="loan_id", how="outer").fillna(0)`, `pd.cut` both sides, `pd.crosstab(from, to)` — 526 loans delinquent on either date, the same 5 × 5 matrix.

> 🎯 **Interview version.** *"How would you build a monthly chart pack from a database?"* — one notebook; SQL for the aggregation through `read_sql` with the as-of as a parameter; pandas for shaping; a chart type chosen by the question (line for time, barh for rankings, heatmap for matrices); titles that state the finding and compute their own numbers; asserts on counts before each chart; `savefig` to a dated folder; Restart & Run All as the release test.

**Say it like in an interview.** Answer the question above in your own words, as you would say it aloud, with Nur Finance's pack as the example.

Tomorrow: the checkpoint — week 3's ten-section EDA report redone in pandas, each number set beside its SQL twin, with a verdict on which tool made which section easier.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

---

## Going further — automating the weekly report, and Git (optional, 40 min)

> STORY **Thursday, 16:00.** Bekzod stops by with his coffee. *"Every Monday you send me last week's numbers by hand: what we lent, by product, and what came back, against the week before. Next Monday you are on leave. I want them at 9:00 every Monday without you — the same sheets, the same chart, only the dates move."* Jasur, from his desk: *"And put the script in Git. When it breaks in March, I want to see what changed, and when."*

### A report as a script — one date in, the same report out

**What it is.** A **report script** (*скрипт отчёта*) builds the whole report from one **parameter** — the report date — with nothing typed by hand. The SQL runs through `read_sql` with the date in `params=`, pandas shapes the result, and the same checks run every week. Next week only the date changes.

**How to write it.** Bekzod's report: the week before a Monday, and the week before that.

```python
import sqlite3
import pandas as pd
con = sqlite3.connect("../raw/nur.db")
# loans paid out in [start, stop), by product
DISBURSED = """
SELECT p.name AS product, COUNT(*) AS loans, SUM(l.principal) AS disbursed
FROM loans l JOIN products p ON p.product_id = l.product_id
WHERE l.disbursed_at >= ? AND l.disbursed_at < ?
GROUP BY p.name ORDER BY disbursed DESC"""
# money received in [start, stop), duplicates removed as in week 3
COLLECTED = """
SELECT COUNT(*) AS payments, SUM(amount) AS collected
FROM (SELECT DISTINCT installment_id, paid_at, amount FROM payments)
WHERE paid_at >= ? AND paid_at < ?"""

def totals(con, start, stop):
    """One week: loans and money out, payments and money in."""
    d = pd.read_sql(DISBURSED, con, params=(start, stop))
    c = pd.read_sql(COLLECTED, con, params=(start, stop))
    return {"from": start, "loans": d["loans"].sum(), "disbursed": d["disbursed"].sum(),
            "payments": c["payments"][0], "collected": c["collected"][0]}

def weekly_report(con, report_date):
    """Bekzod's Monday report: the week before report_date and the week before that."""
    end = pd.Timestamp(report_date)
    # a week runs Monday to Sunday, so the report date is a Monday
    assert end.day_name() == "Monday", "report_date must be a Monday"
    mon = str((end - pd.Timedelta(days=7)).date())
    mon_before = str((end - pd.Timedelta(days=14)).date())
    summary = pd.DataFrame([totals(con, mon, report_date), totals(con, mon_before, mon)],
                           index=["this week", "last week"])
    by_product = pd.read_sql(DISBURSED, con, params=(mon, report_date))
    # the two tables must agree before anything is written
    assert by_product["loans"].sum() == summary.loc["this week", "loans"]
    return summary, by_product

REPORT_DATE = "2026-09-28"
summary, by_product = weekly_report(con, REPORT_DATE)
summary
```

| week | from | loans | collected |
|---|---|---|---|
| this week | 2026-09-21 | 81 | 3 683 149 376 |
| last week | 2026-09-14 | 87 | 3 930 504 321 |

Two rows. The week of 21–27 September lent 3 695 090 000 on 81 loans and collected 3 683 149 376 from 760 payments; the week before lent 3 554 960 000 on 87 loans and collected 3 930 504 321 from 751. `by_product` splits the 81 loans: Small business 8 loans for 1 964 920 000, then Auto, Consumer, Micro and Buy now pay later. Next Monday the same lines run as `weekly_report(con, "2026-10-05")`; our practice data stops on 1 October, so on this page try an earlier Monday.

**When you use it.**
- A report someone needs on a fixed rhythm — weekly, monthly — with the same shape every time.
- Any number you would otherwise copy from one tool into another by hand.

> ⚠️ **Watch out.** A date typed inside the SQL (`'2026-09-21'`) is a second parameter nobody remembers to change. Every date in the script comes from `report_date`; search the file for `2026` before you hand it over.

**Your turn.** Next Monday the report must cover 28 September to 4 October. What do you change?

### Writing it out — Excel sheets, CSV and a PNG

**What it is.** The report leaves the script as files. **`to_excel`** writes a DataFrame into a workbook; **`pd.ExcelWriter`** puts several of them into one file, one **sheet** each. **`to_csv`** writes a plain-text table that any tool can read, and **`savefig`** writes the chart. Each file name carries the report date, so one week never overwrites another.

**How to write it.** The workbook first — on the laptop:

```python
# (shape only — not meant to run) on the laptop: one workbook, one sheet per table
with pd.ExcelWriter(out / f"weekly_{REPORT_DATE}.xlsx") as xw:
    summary.to_excel(xw, sheet_name="summary")
    by_product.to_excel(xw, sheet_name="by_product", index=False)
```

`to_excel` needs the library **openpyxl**. Anaconda has it; the Python on this page does not, so here the box writes the other two files. Run the box above first:

```python
import matplotlib.pyplot as plt
from pathlib import Path
out = Path("reports")
out.mkdir(exist_ok=True)
# the by-product table as plain text, for any other tool
by_product.to_csv(out / f"by_product_{REPORT_DATE}.csv", index=False)
# the chart: money lent in each of the last 8 weeks
w = pd.read_sql("""SELECT disbursed_at, principal FROM loans
                   WHERE disbursed_at >= date(?, '-56 days') AND disbursed_at < ?""",
                con, params=(REPORT_DATE, REPORT_DATE), parse_dates=["disbursed_at"])
# one bar per week, each week ending on a Sunday
weeks = w.resample("W-SUN", on="disbursed_at")["principal"].sum() / 1e9
# grey bars, the report's own week in blue
colors = ["#9ca3af"] * (len(weeks) - 1) + ["#1d4ed8"]
fig, ax = plt.subplots(figsize=(8, 4))
ax.bar(weeks.index.strftime("%d %b"), weeks.values, color=colors)
last = f"{weeks.index[-1]:%d %b}"
ax.set_title(f"Lent per week, bn soum; the week to {last} in blue", loc="left")
fig.tight_layout()
fig.savefig(out / f"weekly_{REPORT_DATE}.png", dpi=150)
# read the CSV back, then list what the folder holds
print(len(pd.read_csv(out / f"by_product_{REPORT_DATE}.csv")), "rows in the CSV")
sorted(p.name for p in out.iterdir())
```

5 rows in the CSV, one per product, and two files in `reports/`: `by_product_2026-09-28.csv` and `weekly_2026-09-28.png`. On the laptop the workbook joins them, with two sheets of 2 and 5 rows. The chart has eight bars, from 3.2 to 6.5 bn a week; the week to 27 September, in blue, lent 3.7 bn, below the eight-week average of 4.5 bn.

| step | on this page | on your laptop |
|---|---|---|
| `to_csv`, `savefig` | files in the browser's memory, gone when the page closes | real files in `reports/` |
| `to_excel` | — (no openpyxl here) | ✔ |
| read the files back | ✔ (the last lines) | ✔ |
| `sys.argv`, a schedule, Git | — | ✔ (below) |

**When you use it.**
- Excel with sheets: a reader who filters and copies, like Bekzod.
- CSV: another program, or next month's script, reads it.
- PNG: a slide, an e-mail, a chat message.

> ⚠️ **Watch out.** `to_excel` without `index=False` adds a column of row numbers 0, 1, 2 … that the reader will ask about. Keep the index only where it carries a label, like `this week` / `last week` in `summary`.

**Your turn.** Fill the gaps: two tables, one workbook.

### Running it every week — Task Scheduler, cron, Power BI

**What it is.** A **scheduler** (*планировщик*) starts a program at set times without you. On Windows it is **Task Scheduler**; on Linux and most servers it is **cron**. The script must then run from top to bottom with nobody at the keyboard: it takes the date from the command line (or from the calendar), writes its files and stops.

**How to write it.** The laptop copy, `weekly_report.py`, ends with a few lines that only run when the file is started as a program:

```python
# (shape only — not meant to run) the end of weekly_report.py on the laptop
import sys
from datetime import date, timedelta

if __name__ == "__main__":
    # the date from the command line, or the Monday of this week
    if len(sys.argv) > 1:
        report_date = sys.argv[1]
    else:
        today = date.today()
        report_date = str(today - timedelta(days=today.weekday()))
    # paths built from the script's own folder, not from where it was started
    here = Path(__file__).parent
    con = sqlite3.connect(here.parent / "raw" / "nur.db")
    summary, by_product = weekly_report(con, report_date)
```

Started by hand, or by cron on a server:

```bash
# by hand, for one Monday
python weekly_report.py 2026-09-28
# cron: every Monday at 08:00
# (add the line with: crontab -e)
0 8 * * 1 cd /home/you/report && python weekly_report.py
```

On a Windows PC, Task Scheduler does the same with a form:

1. Start → **Task Scheduler** → **Create Basic Task** → a name, e.g. *Weekly report*.
2. Trigger: **Weekly**, Monday, 08:00.
3. Action: **Start a program**. Program: the full path of `python.exe` (in a terminal, `where python` prints it). Arguments: `weekly_report.py`. **Start in**: the folder that holds the script.
4. Finish. Right-click the task → **Run** once, and look for the new file in `reports/`.

When the report is a published Power BI page rather than a file, the schedule lives in the Power BI Service: the model's **Scheduled refresh** re-reads its sources (up to 8 times a day with Pro), and a database inside the company needs an on-premises data gateway. Week 7 Day 4 shows the steps.

**When you use it.**
- Task Scheduler: the script runs on your own Windows PC, which must be on at that hour.
- cron: a server that is always on — the usual home of a team's reports.
- Power BI scheduled refresh: the report is a published Power BI page, not a file.

> ⚠️ **Watch out.** A scheduler starts the script from another folder, so `"../raw/nur.db"` points nowhere, and the run fails at 08:00 with nobody watching. Build every path from the script's own folder (`Path(__file__).parent`) or fill in **Start in**, then run the task once by hand.

**Your turn.** Match each tool to what it does.

### Git — working folder, staging area, commit

**Before you read.** Guess first, then play with it — the explanation below will make more sense.

**What it is.** **Git** (*система контроля версий*) keeps the history of a folder's files. The folder becomes a **repository** (*репозиторий*). Your files live in the **working folder**. `git add` puts a change into the **staging area** — the list of what the next save will hold. `git commit` saves the staged files as one **commit** (*коммит*): a version with an id, an author, a time and a message. The history is the chain of commits.

```text
working folder   your files on disk
     │ git add
     ▼
staging area     the next commit
     │ git commit
     ▼
history          every saved version
```

**How to write it.** In a terminal, in the report's folder:

```bash
# once per project: make the folder a repository
git init
# what changed since the last commit
git status
# stage two files for the next commit
git add weekly_report.py README.md
# save the staged files as one version
git commit -m "Add the weekly report script"
# the history, one line per commit
git log --oneline
```

Before the `git add`, `git status` lists the two files as *untracked*; after it, under *Changes to be committed*; after the commit it says *nothing to commit, working tree clean*, and `git log --oneline` shows one line: a short id and the message. GitHub Desktop ([Tools at work](tools-at-work.md)) does the same with buttons: ticking a file is `git add`, **Commit to main** is `git commit`.

**When you use it.**
- Every file you will change again: SQL, notebooks, scripts, the data dictionary.
- Before a risky change: commit first, so there is a version to go back to.

> ⚠️ **Watch out.** A commit saves only what is staged. Edit a file and commit without `git add`, and Git answers *no changes added to commit* — the edit is still only in the folder. Run `git status` before each commit to see what goes in.

**Your turn.** A good **commit message** says what changed in one short line, as an instruction: *Add …*, *Fix …*, *Start …*. Which one will help Jasur in March?

### Branches and merge — try a change without breaking main

**What it is.** A **branch** (*ветка*) is a named line of commits. `main` holds the version that runs every Monday. A new branch, such as `fix-dates`, takes your commits without touching `main`. **`git switch`** moves between branches, and **`git merge`** brings a branch's commits into the one you are on, once they work.

**How to write it.**

```bash
# a new branch from here, and switch to it
git switch -c fix-dates
# change the script, then save it on the branch
git add weekly_report.py
git commit -m "Start the week on Monday"
# back to main, and bring the branch in
git switch main
git merge fix-dates
# merged: the branch name can go
git branch -d fix-dates
```

```text
main       o───o───────────o merge
                \         /
fix-dates        o───────o
```

`git switch -c fix-dates` is `git branch fix-dates` and `git switch fix-dates` in one step. If `main` got no new commit while you worked, the merge is a **fast-forward**: `main` simply moves up to the branch's last commit. If both branches moved, Git makes a **merge commit** with two parents, as in the picture.

**When you use it.**
- A change you are not sure of, while `main` must keep running every Monday.
- Two people at once: each works on a branch, and the branches are merged one after the other.

> ⚠️ **Watch out.** If both branches changed the same lines of one file, the merge stops with a **conflict**. Git marks the two versions in the file (`<<<<<<<`, `=======`, `>>>>>>>`) and waits until you keep the right lines, `git add` the file and `git commit`. Small branches merged soon rarely conflict.

**Your turn.** Put a branch's life in order.

### GitHub, push and pull — and what never goes in

**What it is.** **GitHub** keeps a copy of the repository online, called the **remote** (`origin`). **`git push`** sends your new commits to it; **`git pull`** brings the commits others pushed into your folder. A file named **`.gitignore`** lists what Git must never track: data, outputs and passwords.

**How to write it.**

```bash
# once: connect the folder to an empty GitHub repository
git remote add origin https://github.com/you/report.git
git push -u origin main
# every day: first get the others' commits, then send yours
git pull
git push
```

```text
# .gitignore: never in the repository
*.db
*.xlsx
*.csv
reports/
.env
```

With this `.gitignore`, `git status` stops listing `nur.db` (9 MB of customer data) and the weekly workbooks. The repository holds the code that makes them, so anyone with the data can run it again. Passwords go in `.env`, which the script reads and Git never sees. The course repository keeps its practice data in Git on purpose — Nur Finance is invented; at work, the data stays out.

**When you use it.**
- `git push`: at the end of a piece of work, so it is safe off your laptop and others can see it.
- `git pull`: before you start, so you work on the latest version.
- `.gitignore`: on day one, before the first `git add`.

> ⚠️ **Watch out.** A password committed once stays in the history, even after a later commit deletes the file — anyone with the repository can read the old version. Change the password at once, and keep secrets in `.env` from the first day.

**Your turn.**

### Try it on the real data

**T1.** Run the report for the Monday before: set `REPORT_DATE = "2026-09-21"` in the first box and run both boxes again. How much was collected in the week of 14–20 September, in millions of soum?

**T2. On your laptop.** Make the report a repository: `git init` in its folder, a `.gitignore`, two commits, then a branch committed on and merged back. Paste what `git log --oneline` prints, and tick what you did.

### In one minute

- A **report script** takes one date, runs its SQL through `read_sql` with `params=`, checks itself with `assert`, and writes the same tables and chart every week.
- `pd.ExcelWriter` with `to_excel(sheet_name=…)` makes sheets, `to_csv` serves other tools, `savefig` the chart; on the laptop all three land in `reports/` (this page has no openpyxl, so no Excel here).
- Task Scheduler or cron starts it every Monday; a published Power BI report uses the Service's scheduled refresh.
- **Git**: edit → `git add` → `git commit`; a branch for each risky change, merged back; `git push` / `git pull` with GitHub; data and passwords stay out through `.gitignore`.


=====
PAGE: Week 5 · Day 5 — Checkpoint: the EDA report, in pandas (weeks/week-05/day-5.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-05/day-5
=====

# Week 5 · Day 5 — Checkpoint: the EDA report, in pandas

<span class="badge">Report 150 min</span> <span class="badge">Interview 30 min</span> <span class="badge hw">Checkpoint · 100 points</span>

> STORY **Friday, 9:00.** Madina, Jasur and Bekzod at the same table. Madina: *"Three weeks ago you wrote the loan-book report in SQL. Today you write it **again, in a notebook** — same ten sections, same numbers — and under every section you tell me whether pandas matched the SQL, and if not, why."* Jasur: *"The point is not pandas. The point is that you now have two independent ways to get every number, and you know which one to reach for."* Bekzod: *"And charts. Four at least. The board does not read `DataFrame.head()`."*

## Today in 3 lines

- **Part A (80 pts):** `checkpoint.ipynb` from `data/python/checkpoint_template.ipynb` — the ten sections of week 3's EDA, each as code cell(s) + the week-3 SQL number (given in the template) + one Markdown line *match / mismatch and why* + a finding; at least four charts across the ten; a closing cell of five sentences on what pandas made easier and what SQL made easier.
- **Part B (20 pts):** eight interview questions on this week's material, in writing, 3–5 sentences each — in the boxes on this page, then in `interview.md`.
- Allowed: everything from weeks 1–5 — `pd.read_sql` on `nur.db` (the SQL *is* allowed; the section must still end in a DataFrame and a pandas step), the CSV extracts, your HW 5.2 functions. Closed: the model answers until you submit.

**What you hand in** — with the **📎 box at the end of this page**:

| File | Part | Points |
|---|---|---|
| `checkpoint.ipynb` — executed: Kernel → Restart & Run All, then save, so every output is inside the file | A — the report | 80 |
| `interview.md` — the definitions note, then your eight answers | B — interview questions | 20 |

Also due today: **HW 5.2**, in Day 3's hand-in box.

**Rules.**
1. **Open book.** Everything from weeks 1–5 is allowed; the model answers stay closed until you submit.
2. **Where.** Part A is a notebook file: write it in Jupyter or Colab (Day 1, "Where your code runs"). The editors on this page are only for checking your key numbers.
3. **Dates.** Every number is as of **2026-10-01**.
4. **Payments.** De-duplicated (your `clean_payments`) and cut at the as-of wherever they are summed.

**Working method — four things in every section.**
1. **Grain.** A comment that says what one row is.
2. **Code.** It ends in a DataFrame and a pandas step, even when the data came from `read_sql`. The first rows (`head()`) count as output.
3. **Check.** The week-3 number next to yours: an `assert` where it must be exact (counts, sums), a printed pair where rounding may differ (rates).
4. **Words.** A Markdown line *Match / Mismatch — why*, and one finding Bekzod can read aloud.

> 💡 **Key idea.** A *mismatch* is not a failure if the line under it says why — a half-open vs inclusive filter, dirty vs clean payments, a cohort cut. Only an *unexplained* mismatch costs the number points. Two tools that disagree, with a reason written down, is analysis; two tools that agree by luck is not.

**The shape of one section** (the template has it ten times — two cells, then a Markdown cell):

~~~markdown
## S5. Magnitude — by product
**Week 3 (SQL):** SME 781 loans / 241.1 bn / 59.6 % of money …
~~~

```python
# (shape only — not meant to run) … L is the loan frame read in S2
# grain: one row per loan (L, 7 828); products joined m:1 in the read_sql above
by_prod = L.groupby("code").agg(loans=("loan_id", "size"), disbursed=("principal", "sum"))
by_prod["amount_share"] = (100 * by_prod["disbursed"] / by_prod["disbursed"].sum()).round(1)
assert by_prod["loans"].sum() == 7828
by_prod.sort_values("disbursed", ascending=False)
```

~~~markdown
**Match:** identical to S5 (59.6 / 20.9 / 16.1 / 1.8 / 1.6).
**Finding.** Two books in one: 85 % of loans are Micro/Consumer/BNPL, 80 % of the money is SME/Auto.
~~~

Three cells per section, not thirty: the reviewer reads the finding, checks the match line, then the output, and opens the code only when a number is off. Charts go in the section they illustrate (`fig, ax` in the same cell as the data, `fig.savefig` optional) — four across the ten, with finding titles; S5, S7, S9 (two) are the natural homes.

**Where each pandas tool earns its section:**

| Section | The pandas idiom | The SQL twin |
|---|---|---|
| S1, S3 | `read_sql` + `.min()` / `.max()` | `COUNT(*)`, `MIN` / `MAX` |
| S2 | `value_counts(normalize=True)` | `COUNT(*) / SUM(COUNT(*)) OVER ()` |
| S4 | `drop_duplicates` + a mask + `.sum()` | `v_payments_clean` + `WHERE paid_at <=` |
| S5, S6 | `groupby().agg(named=...)`, `rank`, `nlargest` | `GROUP BY`, `RANK()`, `LIMIT` |
| S7 | `rolling(3).mean()`, `pct_change(12)` | `AVG() OVER (ROWS 2 PRECEDING)`, `LAG(x, 12)` |
| S8 | a loop over `period_range` + `.diff()` | recursive CTE + correlated `SUM` |
| S9 | `dpd_per_loan`, `pd.cut`, `pivot_table`, `merge(how="outer")` | the DPD CTE, `CASE`, `FULL OUTER JOIN` |
| S10 | `pd.cut(right=False)` + `crosstab` | `CASE WHEN income < …` + `SUM(CASE)` |

> 💡 **Key idea.** Aggregate and join in SQL at the database's grain; shape, cut, check and chart in pandas. The closing cell asks you to argue exactly this split with your own sections as evidence — notice, section by section, which tool made the work shorter or safer.

> ⚠️ **Watch out.** The common mistakes from this week each cost the number point: the default `how="inner"` where a `LEFT JOIN` was meant; `fillna(0)` on a money column that should stay NaN; `between` on a datetime; `pd.cut` with the first edge at 0; summing `principal` after merging instalments onto loans (Σ principal ×24.7, the week-2 fan-out — `validate="m:1"` would have caught it); a chart whose title names the chart.

---

## Part A — The report (150 min, 80 pts)

Eight points per section: 3 for code that runs and answers the heading, 3 for the numbers (matching or explained), 2 for the finding and the match line. The model answers are *an* answer; a different cut with correct numbers and a real finding scores the same. They run top to bottom (S1 opens the connection) — after you submit.

### S1. Database exploration — tables, row counts, grain

**Do.** List every table of `nur.db` with its row count and its grain (one row = …). **Compare with:** week 3 S1.

### S2. Dimensions — products, grades, channels, status

**Do.** Loans and their share (%) by product, grade, channel and status. **Compare with:** week 3 S2.

### S3. Date range — first/last disbursement, payments, as-of

**Do.** The first and last disbursement, the first and last payment, the last due date; count the payments dated after the as-of. **Compare with:** week 3 S3.

### S4. Key measures — the totals

**Do.** Eight tiles: loans, borrowers, disbursed, average ticket, average term, outstanding, collected, interest. **Compare with:** week 3 S4.

### S5. Magnitude — by product, by region

**Do.** Loans, money and both shares by product; the money share by region. **Chart:** one (by product, a sorted barh). **Compare with:** week 3 S5.

### S6. Ranking — top and bottom

**Do.** The ten branches ranked by 2026 disbursement (`rank(method="min")`), the top three borrowers by total principal, the largest loan of each product. **Compare with:** week 3 S6.

### S7. Change over time — monthly disbursements, 3-month average, mom %, yoy %

**Do.** Monthly disbursements with the 3-month average, month-on-month % and year-on-year %. **Chart:** the month and its 3-month average (Day 4, figure 1). **Compare with:** week 3 S7.

### S8. Cumulative — month-end outstanding 2026

**Do.** Month-end outstanding for January–September 2026 and the net growth of each month. **Compare with:** week 3 S8.

### S9. Performance — buckets, PAR30, NPL90, FPD30, roll rates

**Do.** DPD buckets with loans and outstanding, PAR30, NPL90; FPD30 by channel; roll rates. **Charts:** figures 3, 4, 5 of Day 4. **Compare with:** week 3 S9.

### S10. Part-to-whole and segmentation — income band × grade

**Do.** Loans by income band × grade with the C+D share per band — loans whose customer has no income included as an "unknown" band. **Chart:** one (a heatmap or stacked bars). **Compare with:** week 3 S10.

### The closing cell — what each tool made easier

**Do.** Five sentences: which sections pandas made easier or safer, which SQL did, and the split you would use next time — each sentence with a section as evidence.

---

## Part B — Eight interview questions (30 min, 20 pts)

**Do.**
1. Write each answer in its box below: 3–5 sentences, as you would say it aloud. **Compare** shows the model answer and the rubric — tick honestly.
2. Write the **definitions note** at the top of `interview.md`: as-of, DPD, FPD30, the dedup rule, outstanding (the flashcards below help).
3. Paste your eight answers under it and hand `interview.md` in with the 📎 box below — that file is what the mentor grades.

**Points.** 2 per question — 1 for correct and complete, 1 for a Nur Finance example with a number — plus 4 for the definitions note.

**B1.** `loc` vs `iloc` — what does each index by, and when does the difference bite?

**B2.** What does `validate=` do in `merge`, and which week-2 mistake does it prevent?

**B3.** `groupby().agg` vs `groupby().transform` — what shape comes back from each, and which SQL construct is each?

**B4.** How does pandas represent a missing value, how do aggregates treat it, and when is `fillna(0)` wrong?

**B5.** `pd.cut` vs a hand-written bucket function — when do you use which, and what are the two traps of `pd.cut`?

**B6.** When do you reach for pandas over SQL, and when the other way round?

**B7.** How do you choose a chart type, and name three rules that are not matters of taste.

**B8.** What makes a notebook reproducible, and how do you prove it before you submit?

---

## Scoring and what happens next

| Part | Points | Pass |
|---|---|---|
| A — report, 10 sections × 8 | 80 | |
| B — 8 questions × 2 + definitions note | 20 | |
| **Total** | **100** | **≥ 70 → on to Week 6** |

Below 70: feedback names the sections to redo (most often S8 — the month-end loop — and S9's FPD30 scope); re-submit before Week 6 starts. Points go to the [Progress page](progress.md).

> 🚀 **Stretch (optional, +5 XP).** Package the week: a file `nur.py` with `clean_customers`, `clean_payments`, `dpd_per_loan`, `portfolio_summary`, `fpd30_table` and `figure_pack(con, as_of, out_dir)`, imported by a ten-line `monthly.py` that writes the tiles, the buckets and the five PNGs for any `AS_OF`. Run it for 2026-09-01 and 2026-10-01 and diff the two bucket tables — the roll-rate matrix, from the command line. Paste the two bucket rows and one sentence on what moved.

Madina, 17:30: *"Jasur ran your notebook on his machine and got the same 399. Bekzod has his monthly file. Timur has five PNGs with titles he did not write. Next week is statistics — the week where you learn what 'the app channel is 0.66 points worse' is actually worth with 41 cases against 34."*

---

### Check your key numbers before you hand in

Paste the code of the section into its editor; the check compares what it prints with week 3's warehouse number.

**S4 — collected.** Σ amount of the de-duplicated payments paid on or before the as-of.

**S8 — month-end outstanding, September 2026.**

**S9 — PAR30**, in % with two decimals.

**S10 — loans in the "unknown" income band.**

### 📎 Hand in here

**Hand-in checklist:** `checkpoint.ipynb` (executed, 10 sections, ≥ 4 charts, the match line under each section, the five-sentence closing cell), `interview.md` (definitions note + 8 answers). Also due today: **HW 5.2** in Day 3's hand-in box (`clean_nur.py` or the executed `day3_starter.ipynb`, `customers_clean.csv`, `payments_clean.csv`, `dpd_per_loan.csv`).

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 5 · Day 6 — Section exam: Python and pandas (Week 5) (weeks/week-05/day-6.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-05/day-6
=====

# Week 5 · Day 6 — Section exam: Python and pandas (Week 5)

<span class="badge">Exam 60 min</span> <span class="badge">Interview 45 min</span> <span class="badge hw">Exam · 100 points</span>

> STORY **Exam day, 10:00.** Madina opens a notebook on your laptop and turns the screen towards you. *"A week of Python is behind you. Now I want to see that it sits next to the SQL and the Excel you already have, not instead of them. A written check first, then an interview. Bring your notes. Nobody types for you."*

## Today in 3 lines

- You show that you can read and write Python and pandas the way an analyst does: values, functions, DataFrames, groupby, merge, charts and queries from Python.
- **Part A (40 points):** 25 quick questions — about two thirds Python and pandas, the rest SQL and Excel — with the classic traps inside. It is marked on the spot.
- **Part B (60 points):** an interview — five questions you answer in words and three small tasks in pandas on the course data. Your mentor reads it.

---

## 1. How the exam works

- **Two parts.** Part A is a quiz: 25 questions, 40 points, marked at once. Part B is an interview: eight written answers, 60 points, marked by your mentor.
- **Pass mark.** You need 70 of 100 points. In Part A, 80 % right (20 of 25) counts as done. You can repeat Part A as often as you like, and your best attempt counts.
- **What it covers.** Week 5, Python and pandas, is the main part. About a third of the questions come from earlier sections: SQL (Day 0 and Weeks 1–3) and Excel (Week 4).
- **Open book.** The course pages, your own notes, your notebooks and the [SQL playground](playground.md) are allowed. Chatbots and asking other people are not. A real interview works the same way: you may bring notes, but nobody answers for you.
- **Time.** Plan 60 minutes for Part A and 45 minutes for Part B.
- **Deadline.** Part B is due at 23:59 on the day of Week 6 · Day 1 (the menu shows the date). Part A can be taken any time before that.
- **After the exam.** Your mentor reviews Part B and sends structured feedback.

---

## 2. Part A — Quick check (40 points)

25 questions in one quiz. Some have one right answer, some have several, some ask for a number or a word. Read the code first and decide what it does before you look at the options. First comes Python and pandas (Week 5), then SQL, then Excel. After each answer the quiz tells you why.

---

## 3. Part B — Interview (60 points)

Eight written answers. Write them as you would say them aloud to a hiring manager.

- **I1–I5 are interview questions.** Answer in 4–6 sentences and use one example from Nur Finance.
- **I6–I8 are small tasks in pandas** on the files in `data/excel/` and on `nur.db`. Put the code in a code block, then give the table or numbers you get and one sentence. Run the code in a notebook first. Every number is as of 2026-10-01.
- Write in your own words. Short and exact beats long.

### 📎 Hand in here

---

## 4. Scoring and what happens next

| Part | Points | Marked by |
|---|---|---|
| A — Quick check | 40 | automatic, your best attempt |
| B — Interview | 60 | your mentor |
| **Total** | **100** | **70 or more passes** |

A pass closes the Python block: you have shown that you can load, clean, join, summarise and chart data in code, and explain what you did. Below 70, the feedback names the topics to repeat, and you and your mentor decide when to try Part B again.

Your feedback arrives on the **[My feedback](feedback.md)** page and in the course bot. Your points go to the [Progress page](progress.md).


=====
PAGE: Week 6 · Day 1 — Probability and distributions: how random is a default? (weeks/week-06/day-1.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-06/day-1
=====

# Week 6 · Day 1 — Probability and distributions: how random is a default?

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 6.1 (due Day 3)</span> <span class="badge company">Company corner</span>

> STORY **Monday, 9:00.** Nilufar, risk, with a printout of week 5's FPD table and a red pen. *"Your 1.28 % is now in the monthly risk pack. Here is my problem. Next month we disburse about 400 loans. If 1.28 % of first instalments default, how many FPDs should I expect — and **when should I panic**? Last October I saw 7 in one vintage and called a meeting. Was that a signal or was I chasing noise? I want a number I can write on the wall: below it, relax; above it, phone me."* Jasur, passing: *"That is a binomial with n = 400. Show her the tail, not the mean."*

## Today in 3 lines

- Probability is the language of "how surprised should I be": **events** and **P(A)**, complement, union, intersection, **conditional probability** and **Bayes** (and the base-rate trap that makes a 90 %-accurate fraud rule wrong nine times in ten), independence, **random variables** with expectation, variance and standard deviation — and how to **describe data**: mean, median, mode, sd, percentiles, skew.
- Five shapes cover most of a lending analyst's life: **binomial** (defaults in a batch of loans), **Poisson** (applications per hour), **exponential** (minutes between applications), **uniform** (the minute within the hour), **normal** (credit scores) — each checked against Nur data, each with its `scipy.stats` line and its Excel formula; and **simulation** with `numpy` when no formula fits.
- Nilufar gets her wall number — **expect 5.1 FPDs in 400 loans, 1 to 10 is normal, 10 or more happens 3.6 % of the time, 12 or more 0.6 %** — and you start HW 6.1 (eight functions with asserts in `data/python/week6/day1_starter.ipynb`).

---

## 1. Learn — the language of chance

Seven short stories. Each one tells **one idea in small steps**: read a sentence, watch the picture change, press **Next**. A dotted word shows its meaning when you tap it. Tired of reading? Press **▶ Play as a video**: the page reads every step aloud and moves the picture for you.

The Python for each idea, and a few extra topics, are in **Going further — the full version** near the end of the page (optional).

### Chance is a share

(Animated explanation)
A jar of balls
- Here is a jar with 10 balls: 1 orange and 9 green. Close your eyes, pull out one ball, look at it and put it back.
- Do it many times and keep count. Tap **Draw 10** a few times: the share of orange jumps around — 0 %, 20 %, 10 %…
- Now draw a thousand. The orange line calms down near 1 in 10. **That settling number is the probability**: how often something happens when you repeat it many, many times.
- With a jar you don't even need to draw: count the orange balls and divide by all the balls. We write it **P(orange)** — P for probability.
- Your turn.
- Nur's loans work the same way. The jar is all 7 099 loans; an orange ball is a loan with an FPD. There were 91. Here: 1 000 dots, each about 7 loans, 13 of them orange.
- So the chance that a loan has an FPD is 91 ÷ 7 099 = 1.28 %: about 13 loans in 1 000.
- The chance it does **not** happen is all the rest: 1 − 0.0128 = 0.9872. A loan either has an FPD or it doesn't, so the two chances always add up to 1 (100 %).
- One more.

### Among those who — conditional probability

(Animated explanation)
Cover half the bank
- A small bank with 20 loans: 8 came through the **app**, 12 through a **branch**.
- 3 loans had an FPD: 2 app loans and 1 branch loan. Orange inside, the channel's colour round the edge.
- The chance of an FPD for any loan: 3 out of all 20 = 15 %.
- A new question: **among the app loans only**, how many had an FPD? Cover the branch loans with your hand: we look only at the 8 app loans.
- 2 of the 8: 2 ÷ 8 = 25 %. This is a conditional probability — the chance of an FPD **given** that the loan came through the app.
- The bar **|** reads “given” or “among”. It changes only the bottom of the fraction: from all 20 loans to the 8 app loans.
- Your turn — the picture already hides the app loans.
- Now flip it: **among the loans with an FPD**, how many came through the app? We look only at the 3 orange loans.
- 2 of the 3: about 67 %. The same 2 loans on top, a **different bottom**. P(app | FPD) and P(FPD | app) answer different questions.
- Nur's real numbers: 41 FPDs among 2 411 app loans → 1.70 %. And 41 of all 91 FPDs came through the app → 45 %. Before you say a percentage, say **among whom**.
- Last one.

> 🎬 **Didn't get "among those who"?** [StatQuest explains it · 4 min](https://youtu.be/_IgyaD7vOOA?t=71&end=285)

### The fraud-flag trap — Bayes' rule

(Animated explanation)
1 000 applicants and one rule
- Here are 1 000 people applying for a loan. Each dot is one person.
- Fraud is rare at Nur: about 6 in 1 000 applicants are fraudsters. Can you spot them?
- A vendor sells Nur a fraud rule. It catches 9 fraudsters in 10: here it flags 5 of the 6. One slips through (faded).
- But it also makes mistakes: it flags 5 honest people in 100. 5 % of the 994 honest people is about 50 — they light up blue.
- Guess before we count.
- Keep only the flagged people: 5 fraudsters and 50 honest people. 55 flags — and only 5 of them are real.
- A flag means fraud only about 1 time in 10. This counting is **Bayes' rule**: real flags ÷ all flags.
- Why so low, when the rule is good? Honest people are so many that even 5 % of them outnumber the fraudsters 10 to 1. This is the **base-rate trap**: the base rate matters as much as the rule.
- With Nur's exact numbers on 10 000 applicants: 56 fraudsters flagged, 497 honest people flagged. 56 ÷ 553 = 10.1 %.
- Last one — think with the picture.

> 🎬 **Didn't get Bayes' rule?** [StatQuest explains it · 4 min](https://youtu.be/9wCnvr7Xw4E?t=321&end=552)

**Now play.** The same idea with sliders — try the challenges.

### Average, middle and spread

(Animated explanation)
Eleven loans on a see-saw
- 11 real loans from one branch, in **million soum**. Each blue dot is one loan.
- The **average** (the mean): add all 11 loans and divide by 11 → 5.70 m. Picture the line as a see-saw: the average is the point where it balances.
- The **median** is the middle loan: line them up and take the one in the middle — the 6th of 11 → 3.50 m. Five loans are smaller, five are bigger.
- Why is the average so much bigger than the middle? One big loan, 22.42 m, sits far to the right and pulls the balance point towards it.
- Drag the orange loan to the right, or tap **+10 m**. The average runs after it. The middle loan does not move at all.
- Which number tells the truth about a typical loan?
- Now **spread**: how far the loans are from the average. Each purple line is one loan's distance from the average.
- The standard deviation is the typical length of those lines: ± 5.94 m. Square each distance, add them up, divide by 10 (one less than the 11 loans — pandas does the same), take the square root.
- Small sd: the loans sit close together. Big sd: they are all over the place. Two branches can have the same average and a very different sd.
- Percentiles say where a value stands in the line-up. The 90th percentile has 90 % of values below it. The median is simply the **50th percentile**.
- Last one.

**Now play.** The same idea with sliders — try the challenges.

### Nilufar's panic number — the binomial

(Animated explanation)
When should Nilufar panic?
- Next month Nur gives out about 400 loans, one dot each. From our data, each one has a 1.28 % chance of an FPD.
- How many FPDs should we expect? 400 × 0.0128 = 5.1. That is the expected value. We call the number of loans n and the chance p.
- But a real month is never exactly 5.1. Tap **Roll one month**: each of the 400 loans rolls its own dice.
- Roll a few more. Sometimes 3, sometimes 8. The count wobbles by luck alone, even when nothing has changed.
- Let's keep score. Each month drops into the bar of its count. Tap **1 month** a few times, then **100 months**.
- The bars make a shape: most months have 2 to 8 FPDs, a few have more. The shape has a name: the binomial distribution.
- Nilufar's question: when is a month **too high**? Put the alarm at 10. Look at the orange bars: only about 4 months in 100 reach 10 or more by luck.
- The binomial formula draws the exact bars: the dashed outlines. Your months land on them. It says: 10 or more happens in 3.6 % of months, 12 or more in 0.6 %.
- Nilufar gets her wall number.
- Double the book to 800 loans: you expect twice as many FPDs (10.3), but the wobble grows only about **1.4 times**. That is √2: the wobble grows like the **square root** of n. Big books are calmer.
- Every run gives different months. In Python you fix a seed, so a colleague who re-runs your notebook sees exactly your numbers.
- A Python tip for the homework: `X.sf(k)` gives P(**more than** k). So P(10 or more) is `X.sf(9)` — one less. This off-by-one catches everyone once.

**Now play.** The same idea with sliders — try the challenges.

### Counting per hour — the Poisson

(Animated explanation)
Applications, hour by hour
- Applications reach Nur's app one by one, all day — on average 1.44 per hour. Each bar counts hours.
- Some hours bring none, some bring 4 or 5. Tap **100 hours** and watch the shape.
- When things arrive one at a time, independently, at a steady average rate, the counts per hour follow the **Poisson distribution**. One number describes it: the average rate, called λ (lambda).
- The formula draws the exact bars (dashed). For example, an **empty hour** happens 24 % of the time — about one hour in four.
- Two facts to keep. For Poisson the **variance equals the average** — both are λ. And if counts per hour are Poisson, the **minutes between** applications follow the exponential distribution.
- Your turn.

> 🎬 **Didn't get the Poisson?** [zedstatistics explains it · 1 min](https://youtu.be/cPOChr_kuQs?t=135&end=188)

### The bell — the normal distribution

(Animated explanation)
Drop people on a bell
- Credit scores of Nur's applicants. Tap **Drop 100 people**: each dot is one person landing at their score (simulated with the real average and spread).
- Most people land near the middle, fewer at the edges. The pile takes the shape of a **bell**: the normal distribution.
- Two numbers set the bell: the middle, **μ** (mu) — the average, 659.6; and the width, **σ** (sigma) — the sd, 59.5.
- Between 600 and 719 — **one sd** either side of the average — sit about 68 % of people.
- Two sds either side (541 to 779): about 95 %.
- Three sds (481 to 838): 99.7 %. A score outside is very rare. This is the **68-95-99.7 rule**.
- Use the picture.
- Any range works. The bell puts 59 % of applicants between 600 and 700. In Excel it is the line in the strip — homework H2 asks exactly this.
- One warning: fit the bell to **all applicants**. Approved loans are a selection — the low scores were turned away — so their left side is cut off and the bell will not match them.

**Now play.** The same idea with sliders — try the challenges.

## 2. Worked example — Nilufar's wall number (15 min)

**Step 1 — probability as a long-run share, then the binomial model.** p = 91 / 7 099 = 1.282 % is the book's long-run FPD share. Each of next month's 400 loans is a Bernoulli trial with that p; assume **independence**; X = the number of FPDs ~ Bin(400, 0.01282).

**Step 2 — expected value and sd of the binomial.** E[X] = n·p = 400 × 0.01282 = **5.13**; sd = √(n·p·(1 − p)) = √(400 × 0.01282 × 0.98718) = **2.25**.

**Step 3 — percentiles: what an ordinary month looks like.** The middle 95 %: `X.ppf([0.025, 0.975])` → **1 to 10** (because counts are whole numbers, P(1 ≤ X ≤ 10) is 97.9 %, not exactly 95). Zero FPDs is itself unusual: P(X = 0) = 0.57 %.

**Step 4 — the binomial tail, P(X ≥ k).** P(X ≥ k) for k = 8 … 13: 14.6 %, 7.5 %, **3.6 %**, 1.6 %, **0.6 %**, 0.2 %. The smallest k with P(X ≥ k) ≤ 5 % is **10**; with ≤ 1 %, **12**. Excel: `=BINOM.INV(400, 91/7099, 0.95) + 1` → 10, `=BINOM.INV(400, 91/7099, 0.99) + 1` → 12.

**Step 5 — simulation, to check the formula.** 100 000 seeded months: mean 5.115, P(X ≥ 10) = 3.55 %, middle 95 % [1, 10] — the formula, twice.

**Step 6 — the answer, with the law of total probability as the caveat.** *"Expect about 5 FPDs in 400 loans; anything from 1 to 10 is ordinary noise. Ten or more happens in fewer than 4 months out of 100 if nothing has changed — look at it; twelve or more happens less than once in 100 months — phone me. The line assumes this month's mix is like the book's; if the 400 are mostly app loans (1.70 %), the expected count is 6.8 and 10 is no longer rare (14.8 %)."* The book's p is a weighted average of the channel rates, so a new mix means a new p.

**Step 7 — the binomial tail again, for last October.** 7 FPDs in 288 loans; P(X ≥ 7 | n = 288, p = 1.28 %) = **8.0 %**. Unusual, not alarming — and in a year of twelve vintages you should *expect* one at that level. Day 4 calls this the multiple-comparisons problem; today it is a reason not to call a meeting at the first 7.

---

## 3. Practice (50 min)

Every task has its own answer box, and the questions follow the order of section 1 — the concept is named in italics. All the Python boxes of this page share one session: the box just below loads `math`, `random`, `st`, `np`, `pd`, `NormalDist`, `pmf`, `cdf`, `at_least`, the frames `apps` and `loans` and the applicants' scores `s` — run it once before the first task. Answer, check, then open the fold for the full working. (The notebook `data/python/week6/day1_starter.ipynb` holds the same tools with `scipy`; you need it for the homework.)

**First, press ▶ Run on this box once.** It loads the tools and the data that every Python box below uses.

```python
# the tools and the data from the full version of section 1 — run once
import math, random
import statistics as st
import numpy as np
import pandas as pd
from statistics import NormalDist
apps  = pd.read_csv("data/raw/applications.csv")
loans = pd.read_csv("data/raw/loans.csv")
s = apps["credit_score"].dropna()
def pmf(k, n, p):
    return math.comb(n, k) * p**k * (1 - p)**(n - k)
def cdf(k, n, p):                     # P(X <= k)
    return sum(pmf(i, n, p) for i in range(k + 1))
def at_least(k, n, p):                # P(X >= k) = 1 - P(X <= k - 1)
    return 1 - cdf(k - 1, n, p)
random.seed(2026)
p_true = 91 / 7099
for n in (10, 100, 1_000, 10_000, 100_000):
    # True = this loan is an FPD
    k = sum(random.random() < p_true for _ in range(n))
    print(n, k, round(k / n, 4))
n, app, fpd, both = 7099, 2411, 91, 41
p_app, p_fpd = app / n, fpd / n
rate  = {"app": 41 / 2411,   "branch": 34 / 3263,   "partner": 16 / 1425}
share = {"app": 2411 / 7099, "branch": 3263 / 7099, "partner": 1425 / 7099}
N, prior, sens, fpr = 10_000, 44 / 7099, 0.90, 0.05
values = [0, 0.6 * 27_000_000]
probs  = [1 - 77 / 2418, 77 / 2418]
E   = sum(x * q for x, q in zip(values, probs))
Var = sum((x - E) ** 2 * q for x, q in zip(values, probs))
n, p = 400, 91 / 7099
lam, hours = 5102 / 3549, 3549
def pois(k, lam):               # P(X = k) for X ~ Poisson(lam)
    return math.exp(-lam) * lam**k / math.factorial(k)
mins = pd.to_datetime(apps["applied_at"]).dt.minute
mu, sd = s.mean(), s.std()
model = NormalDist(mu, sd)
q = np.sort(s.sample(2000, random_state=2026).to_numpy())
theory = [model.inv_cdf((i + 0.5) / len(q)) for i in range(len(q))]
for k in (1, 2, 3):
    # share of N(0, 1) within ±k
    rule = NormalDist().cdf(k) - NormalDist().cdf(-k)
    # share of applicants within ±k sd
    data = ((s - mu).abs() <= k * sd).mean()
    print(k, round(rule, 3), round(data, 3), round(mu - k * sd), round(mu + k * sd))
x = [2, 4, 5, 6, 33]
rng = np.random.default_rng(2026)
months = rng.binomial(400, 91 / 7099, size=100_000)
n, p_c = 400, 77 / 2418
lo = min(k for k in range(n + 1) if cdf(k, n, p_c) >= 0.025)
hi = min(k for k in range(n + 1) if cdf(k, n, p_c) >= 0.975)
print('ready')
```

**P1.** *(probability as a long-run share)* Draw one batch of 50 loans and one batch of 50 000 loans at p = 91 / 7 099, with `random.seed(1)` before the first. Print both shares. Which one would you report as "the FPD rate"?

**P2.** *(events: complement, AND, OR)* From the 7 099 loans in FPD scope: P(not FPD), P(partner), P(partner ∩ FPD), P(partner ∪ FPD). Check the union rule numerically.

**P3.** *(conditional probability)* P(FPD | partner) and P(partner | FPD). Which one does a partner manager care about, and which one does the collections team care about?

**P4.** *(independence)* Branch loans: 3 263 of the 7 099, and 34 of them are FPDs. Compute P(branch) · P(FPD) and P(branch ∩ FPD), in %. Are branch and FPD independent in this sample?

**P5.** *(law of total probability)* A month is planned as 100 app, 250 branch and 50 partner loans. From the three channel rates (app 41 / 2 411, branch 34 / 3 263, partner 16 / 1 425), what FPD rate should you expect, in %, to 2 decimals?

**P6.** *(Bayes)* Bayes on real data: flag = credit score below 600. Of the 6 907 FPD-scope loans that have a score, 89 are FPDs; 7 of those 89 and 300 of the other 6 818 score below 600. Compute the base rate, P(flag | FPD), P(flag | no FPD), then P(FPD | flag) by Bayes **and** by direct count. (Tomorrow's notebook builds the loan frame `f`; you can redo it there in three lines.)

**P7.** *(random variable, expected value)* One SME loan: EAD = the average SME principal (308.7 m), PD = 29 / 781 (SME loans in 90+), LGD 60 %. E[loss] and sd[loss]. Compare with the Consumer loan of Going further, 'Random variables, expected value and variance' (E 0.52 m, sd 2.84 m).

**P8.** *(binomial)* With X ~ Bin(400, 91/7099): P(X = 0), P(X ≤ 2). Write both in Python and in Excel. Is a month with 0–2 FPDs good news?

**P9.** *(binomial — a different p)* Next month's 400 loans are all grade C (FPD 44 / 2 034 = 2.16 %). Expected FPDs, the middle-95 % range, P(X ≥ 10) and P(X ≥ 12). What happens to Nilufar's wall number?

**P10.** *(Poisson)* Applications per hour, λ = 1.4376. P(an hour with no application), P(5 or more). Then a 13-hour day: λ_day = 13 × 1.4376 — the 95 % range for a day's applications.

**P11.** *(exponential)* No application has arrived for 30 minutes. By the exponential model (mean gap 39.34 minutes), what is the chance that the wait goes on for at least 60 more minutes, in %, to 1 decimal?

**P12.** *(uniform)* What share of applications arrives in the first half of the hour (minutes 0–29)? Compare it with U(0, 60).

**P13.** *(normal)* Normal model of applicants' scores (μ 659.6, σ 59.5). The grade-A cut is 720: what share of applicants does the model put at 720 or above, and what does the data say? The model's 5th percentile vs the data's.

**P14.** *(the 68-95-99.7 rule)* An applicant scores 520. How many sds from the mean is that (μ 659.6, σ 59.5), to 2 decimals? Is it inside or outside the band that holds 95 % of applicants?

**P15.** *(mean, median and mode)* Customers' monthly income (`data/raw/customers.csv`; 356 of 6 040 customers have none): the mean and the median, in m soum. Which one goes on a slide called "a typical customer"?

**P16.** *(variance and standard deviation)* Three loans of 10, 20 and 60 m soum. By hand: the mean, the deviations, their squares, the sample variance and the sd.

**P17.** *(percentiles and quartiles)* The interquartile range of applicants' credit scores, and their 90th percentile.

**P18.** *(skew)* Inside every product the skew of principal is between −0.04 and 0.10; for the whole book it is 2.93. Why?

**P19.** *(simulation)* Simulation vs formula for an all-app month: simulate 100 000 months of 400 loans at p = 41/2411 with `default_rng(2026)`; P(X ≥ 10) both ways.

> 🚀 **Stretch (optional, +5 XP).** **P20.** *(simulation — correlated defaults)* Correlated defaults. Suppose a month is "bad" with probability 10 % (p = 2.45 %) and "normal" otherwise (p = 1.15 %) — the average is still 1.28 %. Simulate 100 000 months of 400 loans (draw the month's p first, then the binomial). P(X ≥ 10) and P(X ≥ 12)? Then test the idea on Nur's own history: are the 31 monthly vintages with ≥ 50 loans more spread out than a binomial with p = 1.28 % allows?

### Mistakes people make

- `sf(10)` for "10 or more" — that is P(X > 10) = P(X ≥ 11). P(X ≥ k) = `sf(k − 1)` = `1 − BINOM.DIST(k − 1, …, TRUE)`.
- P(D | A) read as P(A | D): "45 % of FPDs are app loans" is not "app loans default 45 % of the time".
- An accurate rule judged without the base rate — 90 % sensitivity, 10 % precision.
- The binomial used for loans that default together (one employer, one region in a crisis): the mean is right, the tail is too thin.
- Mean ± 2 sd on a count near zero: 5.13 − 2 × 2.25 = 0.6 is fine here, but for p = 0.5 % and n = 100 it goes negative; use the binomial quantiles.
- A normal fitted to a **selected** sample (approved loans) and used for the population (applicants).
- Scores with NaN passed to `mean()` without saying so: pandas skips them silently; write "13 612 scored of 14 000".
- An unseeded simulation: your 3.55 % becomes the reviewer's 3.61 % and the conversation is about noise.
- The mean of a skewed column called "typical": the average loan is 51.7 m soum, the median 5.8 m. Report the median and the percentiles for money.

---

## 4. Homework <span class="badge hw">HW 6.1 — Due Day 3</span>

**Nilufar's toolkit.** Open `data/python/week6/day1_starter.ipynb`. Eight functions are stubs that raise `NotImplementedError`; under each is an assert cell. Replace each body until its assert cell runs silently, write the three-sentence answer to Nilufar in the last cell, then **Kernel → Restart & Run All** and hand in the executed notebook (`day1_starter.ipynb`) with the 📎 box below.

1. `prob_exactly(k, n, p)` — binomial P(X = k).
2. `prob_at_least(k, n, p)` — P(X ≥ k), the off-by-one done right.
3. `panic_threshold(n, p, alpha)` — the smallest k with P(X ≥ k) ≤ alpha (10 at 5 %, 12 at 1 %).
4. `expected_loss(book, lgd)` — Σ PD × LGD × EAD for a five-loan book (Company corner).
5. `bayes_posterior(prior, sensitivity, false_positive_rate)` — the vendor's fraud rule.
6. `simulate_defaults(n, p, months, seed)` — seeded simulation that must agree with the formula.
7. `hourly_rate(apps)` — λ from `applied_at`, empty hours included.
8. `share_between(a, b, mu, sigma)` — the normal model of scores between 600 and 700, checked against the data.

Graded on (20 points): (a) all eight assert cells pass after *Restart & Run All* (2 points each, 16), (b) every function returns a value and has a docstring in your words (2), (c) the three sentences for Nilufar give the expected count, the normal range and the alarm level with its probability (2).

**Check your functions here before you hand in** — three of their return values, and the note for Nilufar:

**H1.** What does your `panic_threshold(400, 91 / 7099, 0.01)` return?

**H2.** What share of applicants does `share_between(600, 700, 659.6, 59.5)` put between 600 and 700, in %, to 1 decimal?

**H3.** And `bayes_posterior(0.0062, 0.90, 0.05)` — the vendor's rule — in %, to 1 decimal?

**H4.** Your three sentences for Nilufar (the last cell of the notebook) — write them here too.

### 📎 Hand in here

---

## 5. Self-check

Three questions, one at a time. Wrong? The explanation points to the part of section 1 to reread.

---

## 6. Company corner <span class="badge company">Expected loss</span>

Every lender carries a number for "what this book will lose, on average": **expected loss** (*ожидаемые потери*).

- **PD — probability of default** (*вероятность дефолта*): the chance a loan defaults within a horizon (usually 12 months). Default = 90+ DPD or "unlikely to pay".
- **LGD — loss given default** (*уровень потерь при дефолте*): the share of the exposure lost **if** it defaults, after recoveries (collateral, collections, sale of the debt). Unsecured consumer loans: often 50–80 %.
- **EAD — exposure at default** (*сумма под риском на момент дефолта*): what is owed when it defaults — for an amortising loan, the outstanding principal.

**EL = PD × LGD × EAD.** It is the expected value of each loan's loss (a random variable — Going further, 'Random variables, expected value and variance'), summed over loans (expectations add, with or without independence).

A crude version for Nur, by grade, as of 2026-10-01: PD = the share of the grade's loans now in 90+; EAD = outstanding principal of the performing loans (not yet 90+); **LGD = 60 %, assumed**.

```python
# (shape only — not meant to run)
# week 5's dpd_per_loan + outstanding (principal due after the as-of)
L = loans_with_dpd_and_outstanding
L["d90"] = (L["dpd"] > 90).astype(int)
el = L.groupby("risk_grade").agg(loans=("loan_id", "size"), d90=("d90", "sum"))
el["PD"] = el["d90"] / el["loans"]
el["EAD"] = L[(L.d90 == 0) & (L.outstanding > 0)].groupby("risk_grade")["outstanding"].sum()
el["EL"] = el["PD"] * 0.60 * el["EAD"]
```

| grade | loans | in 90+ | PD | EAD (performing) | EL = PD × 0.6 × EAD | EL % of EAD |
|---|---|---|---|---|---|---|
| A | 1 821 | 17 | 0.93 % | 47.60 bn | 0.27 bn | 0.56 % |
| B | 3 404 | 64 | 1.88 % | 92.04 bn | 1.04 bn | 1.13 % |
| C | 2 264 | 116 | 5.12 % | 54.16 bn | 1.66 bn | 3.07 % |
| D | 339 | 37 | 10.91 % | 9.61 bn | 0.63 bn | 6.55 % |
| **book** | 7 828 | 234 | | **203.40 bn** | **3.60 bn** | **1.77 %** |

Grade C is 26.6 % of the exposure and **46.3 %** of the expected loss; grade D is 4.7 % of the exposure and 17.5 % of the loss. That is the sentence for the risk pack: *the loss lives in C and D, not where the money is.*

**This is a teaching simplification, and it says so.** The "PD" here is a lifetime-to-date share that mixes loans of every age (a loan disbursed last month has had no time to reach 90+; a closed loan never will), so it is neither a 12-month nor a lifetime PD. The LGD is a guess, and the same for every grade. Real banks estimate **PD** from scorecards and from vintage and roll-rate models (week 3) calibrated on a fixed horizon, **LGD** from the recoveries actually collected on past defaults over the workout period, discounted, and **EAD** from the amortisation schedule at the expected default date. Under **IFRS 9** (the accounting standard Uzbek banks report under) every loan carries an *expected credit loss* allowance: 12-month EL for performing loans (Stage 1), lifetime EL once credit risk has increased significantly — typically 30+ DPD (Stage 2) — and for defaulted loans (Stage 3), with PDs adjusted to forward-looking macroeconomic scenarios.

Match the three letters before you say them out loud:

> 🎯 **Interview version.** *"What is expected loss?"* — PD × LGD × EAD, summed over loans; the mean of the loss distribution, the cost of doing business that pricing must cover (unexpected loss — the tail — is what capital covers). Give a number: "on our book, a crude 1.8 % of the performing exposure, concentrated in grades C and D". Then say what is crude about it.

**Say it like in an interview.** *"What is expected loss, and what is it on our book?"* — answer in 3–5 sentences, as you would to an interviewer.

Tomorrow: the 1.28 % itself is an estimate from 7 099 loans — how sure are we of it? Samples, the central limit theorem, and the confidence interval Bekzod needs before he believes "app is worse".

---

## Going further — the full version, with Python (optional, 60 min)

The same ideas as the stories, written out in full with Python and Excel, plus independence, the law of total probability, the uniform and exponential distributions, skew and simulation. Optional: nothing here counts toward the day.

Press ▶ Run on this first box once. It loads the tools and the data for the whole page; every later box on this page, and every Practice box, reuses them.

```python
import math, random
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import statistics as st
# the normal distribution, from Python's standard library
from statistics import NormalDist

apps  = pd.read_csv("data/raw/applications.csv")
loans = pd.read_csv("data/raw/loans.csv")
# 13 612 scored applicants of 14 000 — say so
s = apps["credit_score"].dropna()

# binomial: P(X = k) for X ~ Bin(n, p)
def pmf(k, n, p):
    return math.comb(n, k) * p**k * (1 - p)**(n - k)
def cdf(k, n, p):                     # P(X <= k)
    return sum(pmf(i, n, p) for i in range(k + 1))
def at_least(k, n, p):                # P(X >= k) = 1 - P(X <= k - 1)
    return 1 - cdf(k - 1, n, p)

print(len(apps), len(loans), len(s))  # 14000 7828 13612
```

### Probability — a long-run share

**What it is.** The **probability** (*вероятность*) of an event A, written **P(A)**, is a number from 0 to 1: the share of times A happens when the same situation repeats very many times. In lending you never know it exactly. You estimate it from history: 91 first-payment defaults (FPD) in 7 099 first instalments give **P(FPD) ≈ 91 / 7 099 = 1.28 %**. A share from a few cases jumps around; a share from many cases settles down (the **law of large numbers** — tomorrow measures how fast).

**How to write it.** P(A) ≈ (times A happened) / (times you looked). The box draws fresh batches of loans whose true FPD rate is 1.28 % and prints each batch's share.

```python
# the same "random" draws on every run
random.seed(2026)
p_true = 91 / 7099                # the long-run share
# one fresh batch of n loans each time
for n in (10, 100, 1_000, 10_000, 100_000):
    # True = this loan is an FPD
    k = sum(random.random() < p_true for _ in range(n))
    print(n, k, round(k / n, 4))  # loans, FPDs, share
```

| loans in the batch | FPDs | share |
|---|---|---|
| 10 | 0 | 0.0000 |
| 100 | 0 | 0.0000 |
| 1 000 | 13 | 0.0130 |
| 10 000 | 127 | 0.0127 |
| 100 000 | 1 282 | 0.0128 |

Batches of 10 and 100 loans show 0 % — the true 1.28 % is invisible at that size; 100 000 loans show 1.28 %.

**When you use it.**
- Every rate in a report — FPD rate, approval rate, default rate — is an estimate of a probability.
- Before you trust a rate, look at its denominator: 2 of 20 is a hint; 91 of 7 099 is evidence.

> ⚠️ **Watch out.** A rate from a handful of cases can be 0 % or 10 % by luck alone. Say the count next to the rate: "1.28 % (91 of 7 099)".

**Your turn.** A new branch had 2 FPDs in its first 20 loans. Which statement is right?

### Events — complement, AND, OR

**What it is.** An **event** (*случайное событие*) is something that happens or does not happen for one case: D = "this loan's first instalment is 30+ days late" (an FPD), A = "this loan came through the app". From events you build new ones:

| Event | In words | Notation | Probability |
|---|---|---|---|
| **complement** (*противоположное событие*) | not D | D̄ | 1 − P(D) |
| **intersection** (*произведение событий*) | A and D | A ∩ D | count the cases that are both |
| **union** (*сумма событий*) | A or D, or both | A ∪ D | P(A) + P(D) − P(A ∩ D) |

**How to write it.** The 7 099 loans in FPD scope: 2 411 app loans, 91 FPDs, 41 loans that are both.

```text
             FPD     no FPD     total
app           41      2 370     2 411
not app       50      4 638     4 688
total         91      7 008     7 099
```

```python
n, app, fpd, both = 7099, 2411, 91, 41
print(round(1 - fpd / n, 4))  # not D:   0.9872
print(round(both / n, 4))     # A and D: 0.0058
# A or D:  0.3467 — the 41 are subtracted once
print(round((app + fpd - both) / n, 4))
```

The union is 2 461 loans — 2 411 app loans plus 91 FPDs minus the 41 that were counted twice — so P(A ∪ D) = 34.67 %.

Events that cannot happen together — "app" and "branch" for the same loan — are **mutually exclusive** (*несовместные*). Their intersection is empty, and their probabilities simply add.

**When you use it.**
- "What share is *not* …" → complement. "… *and* …" → intersection. "… *or* …" → union.

> ⚠️ **Watch out.** P(A or D) is P(A) + P(D) only when A and D cannot overlap. 33.96 % + 1.28 % counts the 41 app FPDs twice; subtract P(A ∩ D).

**Your turn.** Branch loans: 3 263 of the 7 099, and 34 of them are FPDs. What is P(branch ∪ FPD), in %, to 2 decimals?

### Conditional probability — "among those who…"

**What it is.** A **conditional probability** (*условная вероятность*) **P(D | A)** is the chance of D **among the cases where A happened**. Read the bar as "given". The condition shrinks the denominator: from all 7 099 loans to the 2 411 app loans.

**How to write it.** P(D | A) = P(A ∩ D) / P(A) = (count of both) / (count of A).

```python
# P(FPD | app) = 41 / 2 411 = 0.0170 — how risky is an app loan?
print(round(both / app, 4))
# P(app | FPD) = 41 / 91    = 0.4505 — where do our FPDs come from?
print(round(both / fpd, 4))
```

Same 41 loans, two denominators: 1.70 % of app loans have an FPD, and 45.1 % of all FPDs came through the app.

**When you use it.**

| | P(FPD given app) | P(app given FPD) |
|---|---|---|
| Denominator | 2 411 app loans | 91 FPDs |
| Value | 1.70 % | 45.1 % |
| Answers | how risky is an app loan? | where do our defaults come from? |
| In SQL | `WHERE channel = 'app'`, then the share of FPD | `WHERE fpd30 = 1`, then the share of app |

> ⚠️ **Watch out.** P(D | A) and P(A | D) share a numerator (the 41 loans) and nothing else. Before you say a percentage out loud, say its denominator: "of app loans…" (2 411) or "of FPDs…" (91).

**Your turn.** What is P(FPD | branch), in %, to 2 decimals? (34 FPDs among 3 263 branch loans.)

### Independence

**What it is.** Two events are **independent** (*независимые события*) when knowing one does not change the chance of the other: **P(D | A) = P(D)**. The same thing written another way: **P(A ∩ D) = P(A) · P(D)**.

**How to write it.** Compare the conditional rate with the overall rate, or the observed "both" share with the product.

```python
p_app, p_fpd = app / n, fpd / n
# P(D | A) = 0.0170   vs  P(D) = 0.0128
print(round(both / app, 4), round(p_fpd, 4))
# P(A ∩ D) = 0.00578 vs  P(A)·P(D) = 0.00435
print(round(both / n, 5), round(p_app * p_fpd, 5))
```

If channel did not matter, 0.435 % of the 7 099 loans — about 31 — would be app FPDs; there are 41. In this sample, channel and FPD are **not** independent.

**When you use it.**
- You may multiply probabilities ("both borrowers default = p × p") only for independent events.
- The binomial model below assumes it: one borrower's default does not change another's.

> ⚠️ **Watch out.** "Not independent in the sample" is not yet "not independent in reality": 10 extra loans can be luck, and Wednesday's test measures that. Also, independent is not mutually exclusive. Exclusive events are strongly dependent: if one happens, the other cannot.

**Your turn.** Partner loans: P(FPD | partner) = 16 / 1 425 = 1.12 %, and P(FPD) = 1.28 %. What do you conclude?

### The law of total probability — a rate as a weighted average

**What it is.** The **law of total probability** (*формула полной вероятности*) rebuilds an overall rate from groups that cover every case exactly once: **P(D) = Σ P(D | group) · P(group)**. The book's rate is a **weighted average** of the group rates; each group's weight is its share.

**How to write it.**

```python
# P(FPD | channel)
rate  = {"app": 41 / 2411,   "branch": 34 / 3263,   "partner": 16 / 1425}
# P(channel)
share = {"app": 2411 / 7099, "branch": 3263 / 7099, "partner": 1425 / 7099}
# 0.0128 — the book rate
print(round(sum(rate[c] * share[c] for c in rate), 4))
```

| channel | share P(channel) | FPD rate | share × rate |
|---|---|---|---|
| app | 0.3396 | 1.70 % | 0.58 % |
| branch | 0.4596 | 1.04 % | 0.48 % |
| partner | 0.2007 | 1.12 % | 0.23 % |
| **book** | 1 | | **1.28 %** |

The book's 1.28 % is three pieces, one per channel: 0.58 + 0.48 + 0.23 points.

**When you use it.**
- A new mix: next month's rate is Σ (new share × channel rate).
- The denominator of Bayes' rule (next subsection) is this law.

> ⚠️ **Watch out.** The groups must not overlap and must cover everyone. Channels do; "app" and "grade C" do not — an app loan of grade C would be counted twice.

**Your turn.** Next month is planned as 50 % app and 50 % branch loans. What FPD rate should you expect, in %, to 2 decimals?

### Bayes and the base-rate trap

**What it is.** **Bayes' rule** (*формула Байеса*) turns a conditional round: from P(flag | fraud) — how often a fraudster is flagged — to **P(fraud | flag)** — how often a flag is a fraudster. The answer depends heavily on the **base rate** (*базовая частота*): how common fraud is before any flag.

**How to write it.** In words: the flagged fraudsters divided by everyone flagged.

```text
P(fraud | flag) =
  P(flag | fraud) · P(fraud)
  / [ P(flag | fraud) · P(fraud)
    + P(flag | honest) · P(honest) ]
```

The easy way is **natural frequencies**: imagine 10 000 applicants. A vendor's rule catches 90 % of fraudsters (the **sensitivity**) and flags 5 % of honest applicants (the **false-positive rate**). Our base rate for first-payment fraud — a loan that never paid a single soum of its first instalment — is 44 of 7 099 = 0.62 %.

```python
N, prior, sens, fpr = 10_000, 44 / 7099, 0.90, 0.05
fraud  = N * prior            # fraudsters among 10 000 applicants
honest = N - fraud            # honest applicants
tp = sens * fraud             # fraudsters flagged
fp = fpr * honest             # honest applicants flagged
print(round(fraud), round(tp), round(honest), round(fp))   # 62 56 9938 497
# 0.101 = P(fraud | flag)
print(round(tp / (tp + fp), 3))
```

| of 10 000 applicants | flagged | not flagged | total |
|---|---|---|---|
| fraudsters | **56** | 6 | 62 |
| honest | **497** | 9 441 | 9 938 |
| total | **553** | 9 447 | 10 000 |

553 flags, and 56 of them are fraudsters: P(fraud | flag) = 56 / 553 = **10.1 %** — nine flags in ten are honest people. The rule is accurate; fraud is rare; that is the **base-rate trap**.

**When you use it.**
- Any screening rule, scorecard cut-off or alert: "when it fires, how often is it right?"
- Always together with the base rate. A 5 % false-positive rate is small only next to a big base rate.

> 💡 **Key idea.** How often a flag is right depends on how common the thing is. Turn every Bayes question into natural frequencies — "of 10 000 applicants…" — and the answer counts itself.

**Your turn.** Fill in Bayes' rule by tapping the pieces into place.

### Random variables, expected value and variance

**What it is.** A **random variable** (*случайная величина*) is a number that depends on chance: the loss on one loan, the number of FPDs next month. A **discrete** one (*дискретная*) takes values from a list, each with a probability; a **continuous** one (*непрерывная*) takes any value in a range. Three numbers describe it:
- the **expected value** (*математическое ожидание*) E[X] = Σ x · P(X = x) — the long-run average;
- the **variance** (*дисперсия*) Var(X) = Σ (x − E[X])² · P(X = x) — the average squared distance from E[X];
- the **standard deviation** (*стандартное отклонение*) sd = √Var — the spread in the variable's own units.

**How to write it.** One Consumer loan: 27 m soum lent, PD = 77 / 2 418 = 3.18 % (Consumer loans now in 90+), and 60 % of the money is lost if it defaults.

| loss L | P(L) |
|---|---|
| 0 | 0.9682 |
| 16.2 m soum (0.6 × 27 m) | 0.0318 |

```python
# the possible losses, soum
values = [0, 0.6 * 27_000_000]
# their probabilities (sum = 1)
probs  = [1 - 77 / 2418, 77 / 2418]
E   = sum(x * q for x, q in zip(values, probs))             # expected value
Var = sum((x - E) ** 2 * q for x, q in zip(values, probs))  # variance
print(round(E), round(math.sqrt(Var)))                      # 515881 2844492
```

The expected loss is 0.52 m soum and the sd is 2.84 m — the spread is five times the mean, so one loan is a lottery ticket.

Four rules you will use all week: E[aX + b] = a·E[X] + b; Var(aX + b) = a²·Var(X); expectations of a sum always add; variances add when the variables are independent. For 400 independent Consumer loans: E = 400 × 0.52 m = 206.4 m, sd = √400 × 2.84 m = 56.9 m.

**When you use it.**
- Expected loss, expected revenue, the expected number of defaults: E.
- How far the result can swing around E: the sd.

> 💡 **Key idea.** Expectations add always; variances add when the loans are independent. So the total grows like n and its spread like √n — the arithmetic behind "many small loans" and behind every standard error tomorrow.

**Your turn.** A loan loses 0 with probability 0.97 and 10 m soum with probability 0.03. What is E[L], in m soum?

### Bernoulli and binomial — defaults in a batch

**What it is.** A **Bernoulli** variable (*распределение Бернулли*) is one yes/no trial: 1 with probability p, 0 otherwise; E = p, Var = p(1 − p). The **binomial** (*биномиальное распределение*) **X ~ Bin(n, p)** counts the yeses in n **independent** Bernoulli trials with the same p — the FPDs among 400 loans.

**How to write it.** P(X = k) = C(n, k) · p^k · (1 − p)^(n − k): the number of orders C(n, k) times the probability of one order. E[X] = n·p, Var(X) = n·p·(1 − p). The helpers `pmf`, `cdf`, `at_least` are in the first box.

```python
n, p = 400, 91 / 7099
# 5.13 2.25 — mean and sd
print(round(n * p, 2), round(math.sqrt(n * p * (1 - p)), 2))
# P(X = 5)   = 0.1763   Excel: =BINOM.DIST(5, 400, 91/7099, FALSE)
print(round(pmf(5, n, p), 4))
# P(X <= 4)  = 0.4172   Excel: =BINOM.DIST(4, 400, 91/7099, TRUE)
print(round(cdf(4, n, p), 4))
# P(X >= 10) = 0.0357   Excel: =1 - BINOM.DIST(9, 400, 91/7099, TRUE)
print(round(at_least(10, n, p), 4))
# 9: the 95th percentile   Excel: =BINOM.INV(400, 91/7099, 0.95)
print(min(k for k in range(n + 1) if cdf(k, n, p) >= 0.95))
# the same in scipy (the notebook): X = scipy.stats.binom(400, p); X.mean(),
# X.std(), X.pmf(5), X.cdf(4), X.sf(9), X.ppf(0.95)
```

| FPDs k in 400 loans | 0 | 2 | 4 | 5 | 6 | 8 | 10 | 12 |
|---|---|---|---|---|---|---|---|---|
| P(X = k) | 0.006 | 0.077 | 0.171 | 0.176 | 0.151 | 0.070 | 0.020 | 0.004 |

Expect 5.13 FPDs, give or take 2.25; ten or more happens in 3.57 % of months.

**When you use it.**
- A fixed number n of yes/no cases with the same p, independent of each other: FPDs among next month's loans, approvals among 50 decided applications.
- "How many is unusual?" — the tail, P(X ≥ k).

> ⚠️ **Watch out.** "10 or more" is P(X ≥ 10) = 1 − P(X ≤ 9) = `sf(9)` in scipy, not `sf(10)`. The off-by-one is the trap of the day, in Excel too (`1 - BINOM.DIST(9, …, TRUE)`). And the model assumes independence: in a recession defaults move together and the binomial *understates* the tail (the Stretch measures how much).

**Your turn.**

### Poisson — applications per hour

**What it is.** The **Poisson** distribution (*распределение Пуассона*) counts events in a fixed window — an hour, a day — when they arrive independently at a constant average rate **λ**. It has one parameter, and **mean = variance = λ**. There is no fixed n: an hour can hold 0, 1, 2 … applications.

**How to write it.** P(X = k) = e^(−λ) · λ^k / k!. Nur's 2026 applications (1 Jan – 30 Sep, clock hours 08:00–20:59, empty hours counted): 5 102 applications in 3 549 hours.

```python
lam, hours = 5102 / 3549, 3549  # λ = 1.44 applications per hour
def pois(k, lam):               # P(X = k) for X ~ Poisson(lam)
    return math.exp(-lam) * lam**k / math.factorial(k)
# hours the model expects with 0, 1, … 6 applications
print([round(hours * pois(k, lam), 1) for k in range(7)])
# 0.2375: an empty hour   Excel: =POISSON.DIST(0, 1.4376, FALSE)
print(round(pois(0, lam), 4))
# 0.0158: 5 or more       Excel: =1 - POISSON.DIST(4, 1.4376, TRUE)
print(round(1 - sum(pois(k, lam) for k in range(5)), 4))
```

| applications in the hour | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7+ |
|---|---|---|---|---|---|---|---|---|
| hours observed | 850 | 1 204 | 863 | 420 | 163 | 38 | 8 | 3 |
| Poisson(1.44) expects | 842.9 | 1 211.7 | 871.0 | 417.4 | 150.0 | 43.1 | 10.3 | 2.6 |

The model expects 842.9 empty hours and 850 were observed; the data's mean and variance are both 1.44 — the Poisson fingerprint.

**When you use it.**
- Staffing: how many officers the 18:00 peak needs.
- Alerting: an hour with 8 applications (P ≈ 0.01 %) is a bot or a campaign.
- A shortcut for the binomial when n is large and p small: Poisson(5.13) gives P(X ≥ 10) = 3.67 % against the exact 3.57 %.

| | Binomial | Poisson |
|---|---|---|
| Counts | yeses in n trials | events in a window |
| Upper limit | n | none |
| Parameters | n, p | λ |
| Mean, variance | n·p, n·p·(1 − p) | λ, λ |

> ⚠️ **Watch out.** Check that the mean is close to the variance before you use Poisson. When events come in bursts (a marketing SMS, a holiday), the variance is far bigger and the Poisson understates the busy hours.

**Your turn.** With λ = 1.4376, what share of hours should have exactly 3 applications, in %, to 1 decimal?

### Exponential — minutes between applications

**What it is.** If arrivals are Poisson, the **gaps** between them follow the **exponential** distribution (*показательное распределение*). It is continuous — a gap can be 12.4 minutes — and has one parameter, the mean gap. Its odd property is **memorylessness** (*отсутствие последействия*): after 30 quiet minutes, the wait for the next application is still 39 minutes on average.

**How to write it.** P(gap > t) = e^(−t / mean gap).

```python
# minutes, the 4 829 gaps within 2026 working days
mean_gap = 39.34
# 0.2176: P(gap > 60 min); observed 0.2172   Excel: =1 - EXPON.DIST(60, 1/39.34,
# TRUE)
print(round(math.exp(-60 / mean_gap), 4))
# 0.4665: P(gap > 30 min); observed 0.4587
print(round(math.exp(-30 / mean_gap), 4))
```

The model says 21.8 % of gaps last more than an hour; the data say 21.7 %.

**When you use it.**
- Waiting times between independent arrivals: the next application, the next call to the call centre.

> ⚠️ **Watch out.** Memorylessness fits arrivals from many independent people. It does not fit things on a schedule: payments cluster at the due date, so the time to the next payment is not exponential.

**Your turn.** What share of gaps does the model put above 90 minutes, in %, to 1 decimal?

### Uniform — every value equally likely

**What it is.** The **uniform** distribution (*равномерное распределение*) gives every value in a range the same chance. **Discrete** uniform: a die, a loan id drawn at random from 1 to 7 828. **Continuous** uniform **U(a, b)**: every point between a and b is equally likely, and the density is a flat line at 1 / (b − a).

**How to write it.** For U(a, b): P(between c and d) = (d − c) / (b − a); mean = (a + b) / 2; sd = (b − a) / √12. The minute past the hour at which an application arrives should be U(0, 60):

```python
a, b = 0, 60
# 30.0 17.32 — the model's mean and sd
print((a + b) / 2, round((b - a) / math.sqrt(12), 2))
# minute past the hour, 14 000 applications
mins = pd.to_datetime(apps["applied_at"]).dt.minute
# 28.9 17.2 — the data's mean and sd
print(round(mins.mean(), 1), round(mins.std(), 1))
# 0.255 — the model says 15 / 60 = 0.25
print(round((mins < 15).mean(), 3))
# [2375, 2385, 2491, 2342, 2210, 2197]
print(mins.floordiv(10).value_counts().sort_index().tolist())
```

| minutes past the hour | 0–9 | 10–19 | 20–29 | 30–39 | 40–49 | 50–59 |
|---|---|---|---|---|---|---|
| applications | 2 375 | 2 385 | 2 491 | 2 342 | 2 210 | 2 197 |

Each 10-minute block holds between 2 197 and 2 491 applications; a perfectly flat line would be 2 333 each.

**When you use it.**
- Drawing a fair random sample, where every loan is equally likely — tomorrow starts here.
- A "know only the range" model.
- `random.random()` is U(0, 1): the first subsection used it to decide which loans default.

**Your turn.** What share of applications does U(0, 60) put in the last 10 minutes of an hour, in %, to 1 decimal?

### Normal — credit scores

**What it is.** The **normal** distribution (*нормальное распределение*) **N(μ, σ)** is the symmetric bell. The mean μ places its centre; the standard deviation σ sets its width. **Standardising** (*стандартизация*) **z = (x − μ) / σ** says how many sds a value sits from the mean, and puts every normal on one scale, N(0, 1).

**How to write it.** `NormalDist(mu, sd).cdf(x)` = P(X ≤ x). Nur's 13 612 scored applicants (388 have no score — `dropna` and say so):

```python
mu, sd = s.mean(), s.std()
model = NormalDist(mu, sd)
# 13612 659.6 59.5
print(len(s), round(mu, 1), round(sd, 1))
# -1.0: a score of 600 is one sd below the mean
print(round((600 - mu) / sd, 2))
# 0.1583 model, 0.1583 data   Excel: =NORM.DIST(600, 659.6, 59.5, TRUE)
print(round(model.cdf(600), 4), round((s < 600).mean(), 4))

fig, ax = plt.subplots(1, 2, figsize=(10, 3.6))
ax[0].hist(s, bins=40, density=True, color="#9bb7d4")  # the bars
grid = np.linspace(s.min(), s.max(), 200)
# the bell over the bars
ax[0].plot(grid, [model.pdf(v) for v in grid], color="#c0392b")
ax[0].set_title("Applicants' credit score + the normal curve")
# QQ plot: data quantiles vs normal quantiles
q = np.sort(s.sample(2000, random_state=2026).to_numpy())
theory = [model.inv_cdf((i + 0.5) / len(q)) for i in range(len(q))]
ax[1].scatter(theory, q, s=4); ax[1].plot(theory, theory, color="#c0392b")
ax[1].set_title("QQ plot (2 000 applicants): on the line = normal")
plt.tight_layout(); plt.show()
# scipy (the notebook): scipy.stats.norm.cdf(600, 659.6, 59.5),
# scipy.stats.probplot(s, dist="norm", plot=plt)
```

μ = 659.6, σ = 59.5; the model puts 15.83 % of applicants below 600, and the data say 15.83 %.

The **QQ plot** (*квантиль-квантильный график*) puts the data's quantiles against the normal's: points on the line mean normal; an S shape means heavy or light tails; a bend at one end means skew. Applicants' scores lie on the line.

**When you use it.**
- Measurements that pile up symmetrically around a centre: scores, and tomorrow the averages of samples.
- To turn a value into "how unusual is it?": its z.

> ⚠️ **Watch out.** Check *which* population you fitted. Approved loans' scores are not normal: 7 615 scored loans, μ = 680.8, σ = 52.6, and the left tail is cut — the model says 6.2 % below 600, the data 4.3 %, because the approval rule removed most of them. A **selected** sample is not the population it came from. Check every normal with two pictures — the bell over the histogram and the QQ plot — not one number.

**Your turn.** What is the z-score of a score of 720 (μ = 659.6, σ = 59.5)? Two decimals.

### The 68-95-99.7 rule — one, two, three sds

**What it is.** For any normal, about **68 %** of values lie within ±1 sd of the mean, **95 %** within ±2 sd (±1.96 sd exactly), and **99.7 %** within ±3 sd. It is the quickest check of "is this value unusual?".

**How to write it.** The rule comes from N(0, 1); the box checks it on the applicants' scores (`mu`, `sd` from the box above).

```python
for k in (1, 2, 3):
    # share of N(0, 1) within ±k
    rule = NormalDist().cdf(k) - NormalDist().cdf(-k)
    # share of applicants within ±k sd
    data = ((s - mu).abs() <= k * sd).mean()
    print(k, round(rule, 3), round(data, 3), round(mu - k * sd), round(mu + k * sd))
# 1.96   Excel: =NORM.S.INV(0.975)
print(round(NormalDist().inv_cdf(0.975), 2))
```

| within | the rule | applicants' scores | score range |
|---|---|---|---|
| ±1 sd | 68.3 % | 68.0 % | 600 – 719 |
| ±2 sd | 95.4 % | 95.4 % | 541 – 779 |
| ±3 sd | 99.7 % | 99.8 % | 481 – 838 |

95.4 % of applicants score between 541 and 779 — the rule, almost to the decimal.

**When you use it.**
- "Is a score of 800 unusual?" — (800 − 659.6) / 59.5 = 2.36 sd: outside the ±2 sd band, about 1 applicant in 110 scores higher.
- A quick range: mean ± 2 sd holds about 95 % of a normal column.

> ⚠️ **Watch out.** The rule needs a roughly normal shape. Loan principal has mean 51.7 m and sd 112.6 m, so "mean − 1 sd" is negative — no loan is. Check the shape first (Skew, below).

**Your turn.** Between which two scores does the normal model put the middle 95 % of applicants?

### Mean, median and mode — the centre of data

**What it is.** Three ways to say "a typical value" of a data column:
- the **mean** (*среднее арифметическое*) — the sum divided by the count;
- the **median** (*медиана*) — the middle value after sorting: half the values are below it, half above;
- the **mode** (*мода*) — the most frequent value.

**How to write it.** Five loans, principal in m soum: 2, 4, 5, 6, 33. The mean is 50 / 5 = 10. The median is 5, the third of five. One big loan pulls the mean to 10; the median stays at 5.

```python
x = [2, 4, 5, 6, 33]
print(st.mean(x), st.median(x))  # 10 5
# all 7 828 loans, soum
prin = loans["principal"]
# 51.71 5.79 (m soum)
print(round(prin.mean() / 1e6, 2), round(prin.median() / 1e6, 2))
# [6] 2483
print(loans["term_months"].mode().tolist(), (loans["term_months"] == 6).sum())
```

The average loan is 51.71 m soum, but half of all loans are below 5.79 m: a few large Auto and SME loans pull the mean up. The most common term is 6 months (2 483 loans).

**When you use it.**

| | mean | median | mode |
|---|---|---|---|
| Answers | the total ÷ the count | the typical case | the most common value |
| A few huge values | pull it | do not move it | do not move it |
| Good for | totals and budgets, symmetric data | money, incomes, days late | categories, terms, counts |

> ⚠️ **Watch out.** The mode of a continuous column is noise: the most common principal, 4 880 000 soum, belongs to only 17 loans. Use the mode for categories and whole-number columns.

**Your turn.** The median principal of Consumer loans (`product_id` 2), in soum.

### Variance and standard deviation of data

**What it is.** The **variance** (*дисперсия*) of a data column is the average squared distance from the mean. The **standard deviation** (*стандартное отклонение*) is its square root, back in the column's units. For a **sample** you divide by n − 1, not n — the **sample variance** (*выборочная дисперсия*). pandas `.std()` and Excel `STDEV.S` do this by default.

**How to write it.** The five loans 2, 4, 5, 6, 33 (mean 10):

| x | x − mean | (x − mean)² |
|---|---|---|
| 2 | −8 | 64 |
| 4 | −6 | 36 |
| 5 | −5 | 25 |
| 6 | −4 | 16 |
| 33 | 23 | 529 |
| **sum** | 0 | **670** |

Variance = 670 / (5 − 1) = 167.5; sd = √167.5 = 12.94.

```python
# 167.5 12.94   Excel: =VAR.S(…), =STDEV.S(…)
print(st.variance(x), round(st.stdev(x), 2))
# 59.5 points (scores), 112.6 m soum (principal)
print(round(s.std(), 1), round(prin.std() / 1e6, 1))
```

Scores swing about 59.5 points around 659.6; principals swing 112.6 m around 51.7 m — more than twice the mean.

**When you use it.**
- How spread out a column is, in its own units.
- Comparing the spread of two groups; tomorrow's standard error is sd / √n.

> ⚠️ **Watch out.** NumPy's `np.std(x)` divides by n; pandas `.std()` divides by n − 1. On 7 828 loans the gap is invisible; on the 5 values above it is 11.58 against 12.94. Write `ddof=1` in NumPy when you mean a sample.

**Your turn.** The standard deviation of the loan term, in months (sample, 2 decimals).

### Percentiles and quartiles — where a value stands

**What it is.** The **p-th percentile** (*перцентиль*, or *квантиль* of level p/100) is the value below which p % of the data lie. The 50th percentile is the median. The 25th and 75th are the **quartiles** (*квартили*) Q1 and Q3. Q3 − Q1 is the **interquartile range**, IQR (*межквартильный размах*) — the width of the middle half.

**How to write it.** `col.quantile(q)` with q between 0 and 1.

```python
# [2.88, 5.79, 34.71, 187.03] m soum
print((prin.quantile([0.25, 0.5, 0.75, 0.9]) / 1e6).round(2).tolist())
# [583.0, 660.0, 736.0]
print(s.quantile([0.1, 0.5, 0.9]).tolist())
# 15.8: a score of 600 sits at the 16th percentile
print(round(100 * (s < 600).mean(), 1))
```

| principal, m soum | Q1 (25 %) | median (50 %) | Q3 (75 %) | 90 % |
|---|---|---|---|---|
| all 7 828 loans | 2.88 | 5.79 | 34.71 | 187.03 |

A quarter of loans are below 2.88 m; the middle half lies between 2.88 m and 34.71 m (IQR 31.8 m); one loan in ten is above 187 m.

**When you use it.**
- "Where does this customer stand?" — the percentile rank.
- Cut-offs: the bottom 10 % of scores, the top 1 % of exposures.
- A spread that ignores outliers: the IQR does not move when the biggest loan doubles; the sd does.

> ⚠️ **Watch out.** pandas' default and Excel's `PERCENTILE.INC` agree; `PERCENTILE.EXC` and other methods give slightly different values on small data. Say which one you used when numbers must match.

**Your turn.** The 25th percentile (Q1) of applicants' credit scores.

### Skew — when the mean and the median disagree

**What it is.** **Skewness** (*асимметрия*) measures how lopsided a distribution is. **Right skew** (positive): a long tail of large values, so the mean is above the median — money, incomes, days late. **Left skew** (negative): a long tail of small values, mean below the median. Skew near 0: symmetric, mean ≈ median.

**How to write it.** pandas `.skew()`. Above about +1 or below −1 counts as strongly skewed.

```python
print(round(prin.skew(), 2), round(s.skew(), 2))  # 2.93 -0.04
# 8.9: the mean principal is almost nine times the median
print(round(prin.mean() / prin.median(), 1))
```

| column | mean | median | skew | shape |
|---|---|---|---|---|
| principal, m soum | 51.71 | 5.79 | 2.93 | long right tail |
| credit score | 659.6 | 660 | −0.04 | symmetric |

Principal is strongly right-skewed — many small Micro and BNPL loans, a few huge SME and Auto loans. The score is symmetric, which is why the normal fits it.

**When you use it.**
- Before you pick a centre: skewed → report the median and percentiles; symmetric → the mean is fine.
- Before you use the normal or the 68-95-99.7 rule — both need skew near 0.
- On Day 4: skew is the first reason a t-test can mislead.

> ⚠️ **Watch out.** A mix of groups can create the skew. Inside each product the principal is nearly symmetric (Consumer: mean 26.93 m, median 26.97 m); the whole book is not. When groups differ, describe each group.

**Your turn.** Customers' monthly income: mean 15.25 m soum, median 7.90 m soum. Which shape, and which number is "the typical customer's income"?

### Simulation — when the formula runs out

**What it is.** A **simulation** (*имитационное моделирование*) draws the random world many times with a computer and counts what happened. It answers questions no formula covers — a month that mixes products with different PDs, defaults that move together, a loss with a random LGD.

**How to write it.** Draw, count, compare with a formula where one exists.

```python
# seeded: the same "random" numbers on every run
rng = np.random.default_rng(2026)
# 100 000 simulated months of 400 loans
months = rng.binomial(400, 91 / 7099, size=100_000)
# 5.115, 0.0355 — the formula says 5.127, 0.0357
print(months.mean(), np.mean(months >= 10))
# [1, 10]: the middle 95 % of months
print(np.quantile(months, [0.025, 0.975]))
```

100 000 simulated months average 5.115 FPDs and reach 10 or more 3.55 % of the time — the formula's 5.127 and 3.57 %, within the simulation's noise.

**When you use it.**
- When the model has parts no textbook distribution covers.
- To check a formula you are not sure of.

> 💡 **Key idea.** A simulation is a formula you can always write: draw the world many times, count. Seed it so others get your numbers, and test it where a formula exists before you trust it where none does.

**Your turn.** Why `default_rng(2026)` and not `default_rng()`?

### Putting it together

One request, most of today's tools: *"400 Consumer loans next month — how many defaults, and how much money could we lose?"*

```python
# probability: PD of a Consumer loan, a long-run share
n, p_c = 400, 77 / 2418
# random variable: 16.2 m soum lost if one loan defaults
loss_if_default = 0.6 * 27_000_000
mean_d = n * p_c                                 # binomial: expected defaults
# and their sd (independence assumed)
sd_d = math.sqrt(n * p_c * (1 - p_c))
# binomial percentiles:
lo = min(k for k in range(n + 1) if cdf(k, n, p_c) >= 0.025)
# the middle 95 % of months
hi = min(k for k in range(n + 1) if cdf(k, n, p_c) >= 0.975)
print(round(mean_d, 1), round(sd_d, 2), lo, hi)  # 12.7 3.51 6 20
# 206.4: expected loss, m soum (expectations add)
print(round(mean_d * loss_if_default / 1e6, 1))
# 5.9 19.6: the normal shortcut, ±1.96 sd
print(round(mean_d - 1.96 * sd_d, 1), round(mean_d + 1.96 * sd_d, 1))
```

| step | the number | the concept |
|---|---|---|
| PD = 77 / 2 418 | 3.18 % | probability as a long-run share; conditional — P(90+ given Consumer) |
| loss of one loan | 0 or 16.2 m | random variable, Bernoulli |
| defaults among 400 | expect 12.7, sd 3.51 | binomial, independence |
| an ordinary month | 6 to 20 defaults | binomial percentiles |
| expected loss | 206.4 m soum | expected value — expectations add |
| the quick check | 5.9 to 19.6 | normal, 68-95-99.7 (±1.96 sd) |

Expect about 13 defaults and 206 m soum of loss; a month with 6 to 20 defaults (97 m to 324 m) is ordinary. The normal shortcut lands close to the exact binomial because n·p = 12.7 is large enough for the bell.

**Which distribution?** Four shapes and the uniform, five kinds of question — sort them.

**Words of the day.**

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Conditional probability, "among those who..." — [Conditional Probabilities, Clearly Explained!!! (StatQuest with Josh Starmer), 01:11](https://youtu.be/_IgyaD7vOOA?t=71&end=285)
- ▶ Bayes and the base-rate trap — [Bayes' Theorem, Clearly Explained!!!! (StatQuest), 05:21](https://youtu.be/9wCnvr7Xw4E?t=321&end=552)
- ▶ Binomial — [The Binomial Distribution and Test, Clearly Explained!!! (StatQuest)](https://youtu.be/J8jNoF-K8E8)
- ▶ Poisson — [Poisson Distribution EXPLAINED in UNDER 15 MINUTES! (zedstatistics), 02:15](https://youtu.be/cPOChr_kuQs?t=135&end=188)
- ▶ Normal distribution — [The Normal Distribution, Clearly Explained!!! (StatQuest)](https://youtu.be/rzFX5NWojp0)

- RU deck (TBC Data Analytics 2.0, if you have it) `5.1 Basics of Probability Theory.pdf`: events and operations pp. 9–17, classical / statistical probability pp. 32–43, conditional probability pp. 52–57, independence pp. 58–63, total probability pp. 64–70, Bayes pp. 71–76, random variables pp. 79–104, expectation pp. 119–127, variance pp. 128–134, skewness / kurtosis / median / quantile pp. 139–150. `5.2 Statistics & Probability Theory.pdf`: Bernoulli formula pp. 5–10, binomial pp. 26–31, Poisson pp. 32–36, exponential pp. 41–44, normal pp. 45–53.
- Notebooks: `MS1_probability_theory.ipynb` (conditional probability, Monty Hall, total probability and Bayes with three worked examples), `MS4_probability_theory_basics.ipynb` (every distribution of today drawn with `scipy.stats`, plus a call-centre binomial simulation).
- Visual: Seeing Theory (seeing-theory.brown.edu), chapters 1–3 — Basic Probability, Compound Probability, Probability Distributions.
- *Russian terms:* случайное событие = event, вероятность = probability, условная вероятность = conditional probability, независимые события = independent events, формула полной вероятности = law of total probability, формула Байеса = Bayes' rule, случайная величина = random variable, математическое ожидание (мат. ожидание) = expectation, дисперсия = variance, стандартное (среднеквадратическое) отклонение = standard deviation, распределение Бернулли / биномиальное / Пуассона / нормальное / показательное = Bernoulli / binomial / Poisson / normal / exponential distribution, функция распределения = cumulative distribution function, плотность = density, квантиль = quantile, ТВиМС = probability theory and mathematical statistics.

**Questions inside the videos.** Open a video from the panel: it stops at these points and asks one question about the bit you just watched.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 6 · Day 2 — Samples, the CLT and confidence intervals (weeks/week-06/day-2.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-06/day-2
=====

# Week 6 · Day 2 — Samples, the CLT and confidence intervals

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 6.2 (due Day 5)</span> <span class="badge company">Company corner</span>

> STORY **Tuesday, 9:10.** Bekzod, the portfolio manager (*портфельный менеджер*), holds up Timur's dashboard. *"App FPD 1.70 %, branch 1.04 %. Marketing says the app is the future; Nilufar says the app is a risk. I have seen these numbers move by half a point from one month to the next. So: **is app really worse, or is that noise?**"* Madina: *"Two steps. Today: how precisely do we know each number — a confidence interval for each channel. Tomorrow: the test that says whether the gap is real. Bekzod gets one sentence on each day."*

## Today in 3 lines

- A number computed from loans is a **sample estimate** with its own uncertainty: the **standard error** measures it, the **law of large numbers** says it shrinks, the **central limit theorem** says the estimate is approximately normal even when the data are not (loan principal: skew 2.9) — shown by simulation, not by proof.
- A **confidence interval** = estimate ± critical value × SE: **t** for a mean (z only when σ is known — never), **Wilson** for a proportion (the textbook **Wald** interval covers a 1.28 % rate only 73–88 % of the time at Nur's sample sizes), **Clopper–Pearson** when you must guarantee 95 %, the **bootstrap** when there is no formula — and what "95 %" does and does not promise.
- Bekzod's answer, part 1: a rate **with its interval** for each channel — how precisely we know app, branch and partner FPD — and you start HW 6.2: the same for every channel and grade, with a chart and five sentences.

---

## 1. Learn — from the sample to the process

Eight short stories. Each one tells **one idea in small steps**: read a sentence, watch the picture change, press **Next**. A dotted word shows its meaning when you tap it. Tired of reading? Press **▶ Play as a video**: the page reads every step aloud and moves the picture for you.

The Python for each idea, and the extra topics, are in **Going further — the full version** near the end of the page (optional).

### One handful — population, sample and sampling error

(Animated explanation)
One handful from the jar
- A jar of 10 balls, 1 of them orange. The jar is the population. Tap **Draw 10**: you pull ten balls, one at a time, and put each one back.
- Your ten balls are a sample. Their share of orange (under the jar: **share**) is an estimate: **p̂**, “p-hat”. The jar's true share, the dashed line, is the parameter: p.
- Put them back and draw another 10: a different share. The gap between an estimate and the truth is the sampling error. Every sample has one. It is not a mistake.
- Your turn.
- Nur's real book: all 7 828 loans, true average 51.71 m (a parameter). Five samples of 392 loans each — every 20th loan — gave five averages, the blue dots. Each misses by 2.8 to 8.5 m.
- In real work you see just **one** row and never know its error. Even all 2 411 app loans are one sample of the app's future: next year's loans aren't in the table. So the app's 1.70 % is an estimate.
- A different trap: someone took the orange ball out before you drew. Every handful now says 0 %, and more draws never fix it. That is bias — like judging all applicants by approved loans only.
- Back to the honest jar, and keep drawing. The orange line is the share so far. Tap **Draw 10** a few times, then **Draw 1 000**.
- At first the line swings wildly; then it settles near the true 10 % and stays there. That is the law of large numbers: more data, smaller sampling error.
- Nur's loans do the same. One shuffle of all 7 828: the average was 106.38 m after 10 loans, 35.06 m after 100, 52.06 m after 1 000 — and exactly 51.71 m at the end. One huge loan can double a 10-loan average.
- Your call.

### Many handfuls — the standard error, and how many loans you need

(Animated explanation)
Many handfuls
- Back to the jar: 1 ball in 10 is orange. A handful is now 100 draws, and its share of orange drops into its bar. Tap **1 handful** a few times.
- Now 100 handfuls. They pile up around the true 10 %, and their average (in the read-out) sits right on it. An estimate that is right on average is unbiased.
- But single handfuls land all over: 6 %, 12 %, 15 %… Their typical distance from the truth — the read-out's spread, about 3 points — is the standard error, **SE**.
- In real work you get one handful, not a hundred. A formula gives the spread without them, and draws the purple curve the pile follows: p is the share, n the handful's size.
- Guess before you look.
- Four times the draws, **half** the spread. The SE shrinks like 1 ÷ √n, and it keeps shrinking as n grows: the estimate is consistent.
- Nur: a branch-month of 400 loans with a true FPD rate of 1.28 %. By luck alone the month's rate moves by about 0.56 points. The app's 1.70 % on 2 411 loans moves by about 0.26.
- About 95 % of months land within 2 SEs of the truth (1.96, to be exact). That 1.96 × SE is the margin of error, **E**.
- Turn it around: how many loans for the margin you want? Solve E = 1.96 × SE for n. A rate near 1.28 % to within ±0.5 points takes 1 945 loans. Always round up.
- Halve the margin, **quadruple** the loans: ±0.25 points would take 7 779 loans, more than Nur's whole book. With no idea of p, use 0.5, the worst case: ±3 points takes 1 068, the “about a thousand” of opinion polls.
- Last one.

### A bell made of averages — the central limit theorem

(Animated explanation)
A bell made of averages
- Nur's loan amounts. Each tap draws one loan at random and drops it into the bar of its size. Tap **1 loan** a few times, then **500 loans**.
- A tall bar near zero, a long thin tail to the right: very skewed. A few SME loans reach almost 600 m. The average is 51.7 m, the middle loan only 5.8 m.
- Now each sample is **5 loans**, and we drop their **average**. Still lopsided, but the tail is already shorter.
- Averages of **30 loans**: almost a bell. Only the right side still sticks out a little.
- Averages of **100 loans**: a bell, and the purple curve fits it. This is the central limit theorem: the loans stay skewed, their **average** becomes a bell.
- Its width is known in advance: the loans' sd, σ = 112.6 m, divided by √n — the read-out's spread says the same. Keep the two apart: the **sd** describes the loans, the **SE** describes your average.
- Your turn.
- 95 % of the averages land within 2 SEs of the truth (shaded). But “n ≥ 30 is enough” is folklore: on money this skewed, a “95 %” interval catches 88.6 % at n = 30 and 95.2 % at n = 400.

**Now play.** The same idea with sliders — try the challenges.

### A net for the average — the t interval

(Animated explanation)
A net for the average
- Nur's 2 418 Consumer loans have a true average of 26.93 m — but pretend you can't see it. You get **50 loans** (simulated with their real average and spread). Tap: the blue dot is their average, your estimate.
- A dot alone hides its wobble. So throw a **net** around it: the average ± about 2 standard errors — the line through the dot. From the bell of averages, such a net catches the truth about 95 times in 100.
- The notebook's real 50 loans: average 27.49 m, and their own sd, s = 12.62 m. We don't know the true σ of all the loans, so s stands in: SE = s ÷ √50 = 1.78 m.
- The net: from 23.90 to 31.07 m, and the true 26.93 m is inside. Such a range is a confidence interval.
- Why 2.01, not 1.96? s is itself estimated from the 50 loans, so the net needs a little extra room: the multiplier comes from Student's t with n − 1 = 49 degrees of freedom.
- With only **10 loans** the nets are wide, and t = 2.26 makes them 15 % wider than z would. With few loans z is too narrow; t is the honest one. z only when the true σ is known — practically never.
- Your turn.
- One trap: s divides by **n − 1**, not n. Your loans sit closer to their own average than to the true one, so dividing by n comes out too small — the variance by 20 % at n = 5. n − 1 makes it unbiased.
- In code: pandas' `.std()` already divides by n − 1; numpy's `np.std(x)` divides by n unless you write `ddof=1`. In Excel: STDEV.S, not STDEV.P.

**Now check yourself.**

### A net for a rate — Wald breaks, Wilson holds

(Animated explanation)
A net for a rate
- Now a net for a **rate**. A branch-month: 400 loans, true FPD rate 1.28 %. The month's rate p̂ is the dot; the textbook net, the Wald interval, is the line.
- Draw 100 months and count the orange misses: about 12, not 5. A “95 %” Wald net near 1.28 % on 400 loans really catches only about **88 %**.
- Why? Near 0 % a rate can't go below zero but can run far above: no symmetric bell. At 100 loans it's worse: 27 % of months have **zero** FPDs, Wald's net shrinks to a point, and it catches only about 73 %.
- Real small branch-months. 2 FPDs in 150 loans: Wald says −0.50 % to 3.17 % — a negative default rate. 0 in 120: 0 % to 0 %, “certainly zero”.
- Is that honest?
- The fix is the Wilson interval. The same 400-loan months: about 96 in 100 nets catch the truth.
- Its trick: it centres the net as if you had seen about **2 more FPDs and 2 more good loans** — a small pull away from zero — and its width never drops to 0. k is the number of FPDs, n the loans.
- Wilson on the same months: 2 in 150 → 0.37 % to 4.73 %; 0 in 120 → 0 % to 3.10 %. Never negative, never a point. For the app, 41 in 2 411: 1.26–2.30 % — 0.44 below 1.70 and 0.60 above, lopsided the right way.
- Use Wilson for every rate — FPD, approval rate, PAR30 — at any n. In Python: `wilson(k, n)` from Going further, or statsmodels' `proportion_confint`. When an auditor wants 95 % **guaranteed**, report Clopper–Pearson.
- Last one.

### What the “95 %” promises — and an honest dashboard tile

(Animated explanation)
What “95 %” promises
- Every branch-month you throw one Wilson net. It either catches the true 1.28 % (blue) or misses it (orange). Holding one net, you never know which kind it is.
- Throw 100: about 95 catch it — 93 in one run, 98 in the next. **95 % is the catch rate of the method** over many samples: the confidence level.
- For the app's net, 1.26–2.30 %, say “95 % CI 1.26–2.30 %” or “the data are consistent with a true rate in that range”. Never “a 95 % probability the true rate is in there”: the true rate is fixed — this net caught it or not.
- Your turn.
- Drop the level to **80 %**: the nets get narrower — and about 1 in 5 misses. More confidence costs width. Stay at 95 % and say so; never switch to 90 % because 95 % “looked too wide”.
- Two channels: app 1.26–2.30 %, branch 0.75–1.45 %. Their nets overlap between 1.26 and 1.45 (shaded).
- The net for the **gap**, app − branch, runs from 0.05 to 1.33 points: it does not contain zero, although the two nets overlap. Compare two rates with a net for their difference — or with tomorrow's test.
- So every rate on a dashboard carries **three numbers**: the rate, n and the Wilson interval. Without n and the interval nobody can tell a signal from a small denominator. On a chart: a dot with whiskers, n in the label.

**Now play.** The same idea with sliders — try the challenges.

**Now check yourself.**

### A sample of your sample — the bootstrap

(Animated explanation)
A sample of your sample
- The 11 loans from one branch you met yesterday, in m soum. Their middle loan, the median, is 3.50 m (dashed). How precisely do we know it? A median has no simple SE formula.
- The trick: treat your sample as the jar. Draw 11 loans from it **with replacement** — some come twice (×2), some not at all (faded) — and take their median. It drops into the chart.
- Again and again: each resample gives its own median. They gather around your 3.50 but wander off.
- A thousand resamples. The pile shows how far the median could move if the branch's loans had come out differently.
- Keep the middle 95 % of those medians (shaded): about 2.30 to 6.74 m. That is a bootstrap interval: no formula, and lopsided like the money.
- Real numbers. A 200-loan sample's median, 5.69 m: bootstrap interval 4.54–8.27 m, and the true 5.79 m is inside. The app's FPD: bootstrap 1.20–2.24 %, close to Wilson's 1.26–2.30 %.
- But it can only reshuffle what it saw. A branch-week: 20 loans, no FPDs. Every resample has no FPDs either, so the bootstrap says “0 % to 0 %”. Wilson says 0 % to 16.1 %.
- Your turn.
- Three habits: resample **with replacement**, at the sample's own size, and fix a seed (`default_rng(2026)`) so a reviewer gets your interval exactly. Its home ground: a median, a percentile, a ratio of sums like the collection rate (Σ paid ÷ Σ due).

> 🎬 **Didn't get the bootstrap?** [StatQuest explains it · 2 min](https://youtu.be/Xz0x-8-cgaQ?t=400&end=493)

**Now check yourself.**

**Now check yourself.**

### Signal or noise? The worst branch

(Animated explanation)
Signal or noise? The worst branch
- Nur's ten branches, ranked by FPD rate, each with its Wilson net. Top: Bukhara, 14 FPDs in 586 loans = 2.39 %. Bottom: Nukus, 0.68 %. The green line is the whole book's 1.28 %.
- Your guess first.
- The luck world: a branch of 586 loans whose true rate is exactly the book's 1.28 %. Each tap gives it 586 fresh loans and drops its FPD rate into a bar. Tap a few times.
- A thousand ordinary branches. 95 % of them land between 0.51 % and 2.22 % (the dashed lines): the funnel limits for 586 loans.
- Now Bukhara's 2.39 %. Orange: ordinary branches that did as badly or worse by luck alone — about 2 in 100 (the read-out). Just outside its funnel: rare for one branch.
- But Nur has **ten** branches, each able to land outside its funnel by luck: one flag in ten is roughly what chance alone produces. Even if all ten were exactly 1.28 %, the top one would average 2.00 %. Somebody is always first.
- Your call.
- Why so noisy? To pin a rate near 1.28 % to ±0.5 points takes 1 945 loans; the largest branch has 921. So no league tables of rates below ~1 000 loans a row: a funnel instead, and pool thin months into quarters.

## 2. Worked example — Bekzod's channels (15 min)

**1. The sample — the counts** (week 5's FPD30 frame `f`): app 41 / 2 411, branch 34 / 3 263, partner 16 / 1 425. Each channel's loans are a sample of that channel's process, so each rate is an estimate.

**2. The method — the Wilson interval.** Rates near 1 % with n in the thousands: Wilson, not Wald. `wilson(k, n)` from the Practice setup box (written out in Going further), or `proportion_confint(k, n, alpha=0.05, method="wilson")`.

**3. The table — each estimate with its interval.**

| channel | FPD / n | rate | Wilson 95 % | Wald 95 % (for comparison) |
|---|---|---|---|---|
| app | 41 / 2 411 | 1.70 % | **1.26–2.30 %** | 1.18–2.22 % |
| branch | 34 / 3 263 | 1.04 % | **0.75–1.45 %** | 0.69–1.39 % |
| partner | 16 / 1 425 | 1.12 % | **0.69–1.82 %** | 0.58–1.67 % |

**4. Read it — the standard error and what 95 % means.** The app's interval sits higher, but it overlaps the branch's between 1.26 and 1.45 %. Each interval is about ±0.5 points — two standard errors, as large as the gap Bekzod is asking about. Overlap is not a test: the interval for the difference (Newcombe, app − branch) is 0.05 to 1.33 points — anything from almost no gap to 1.3 points. With these sample sizes, a 0.66-point difference is near the edge of what the data can resolve.

**5. What more data would buy — sample size.** To know the app's rate to ±0.25 points would take `n_for_rate(41 / 2411, 0.0025)` = 10 275 app loans, more than four times the channel's history. Precision will not come from waiting a month.

**6. The sentence for Bekzod (today's half).** *"App FPD is 1.70 % and we are 95 % confident the channel's true rate is between 1.26 and 2.30 %; branch is 1.04 % (0.75–1.45 %). The intervals overlap a little, so the gap may be real or partly noise — tomorrow's test answers that directly."* Not "app is worse", not "no difference": the honest state of knowledge on Tuesday.

---

## 3. Practice (50 min)

Every task has its own answer box. All the Python boxes of this page share one session: the box just below loads `loans`, `pop`, `cons`, `f` (with `channel`), `rng`, `wald`, `wilson`, `pmf` and `newcombe` — run it once before the first task. (`n_for_rate` and `bootstrap_ci` are written out in Going further.) The Excel task needs Excel or Google Sheets. For the homework, `data/python/week6/day2_starter.ipynb` builds the same frames (and `x`, the payments) with `scipy` and `statsmodels`.

**First, press ▶ Run on this box once.** It loads the tools and the data that every Python box below uses.

```python
# the tools and the data from the full version of section 1 — run once
import math
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
loans = pd.read_csv("data/raw/loans.csv")
pop = loans["principal"].to_numpy(dtype=float)
apps = pd.read_csv("data/raw/applications.csv")
s = apps["credit_score"].dropna().to_numpy(dtype=float)
f = pd.read_csv("data/powerbi/fct_first_instalment.csv")
f["channel"] = f["product"].map({"MICRO": "app", "BNPL": "partner"}).fillna("branch")
rng = np.random.default_rng(2026)
samples = np.array([rng.choice(s, 5, replace=False) for _ in range(20_000)])
mu = pop.mean()
for start in range(5):
    # every 20th loan: 392 loans
    part = loans["principal"].iloc[start::20]
    print(start + 1, len(part), round(part.mean() / 1e6, 2), round((part.mean() - mu) / 1e6, 2))
p = 41 / 2411
order = np.random.default_rng(2026).permutation(pop)
running = np.cumsum(order) / np.arange(1, len(order) + 1)
for n in (10, 100, 1000, 7828):
    # wild at first; exactly 51.71 m at 7 828
    print(n, round(running[n - 1] / 1e6, 2))
mu, sigma = pop.mean(), pop.std()
fig, axes = plt.subplots(1, 4, figsize=(14, 3))
for ax, n in zip(axes, (5, 30, 100, 1000)):
    # 2 000 sample means
    means = np.array([rng.choice(pop, n, replace=False).mean() for _ in range(2000)])
    ax.hist(means / 1e6, bins=40, color="#9bb7d4"); ax.axvline(mu / 1e6, color="#c0392b")
    ax.set_title(f"n = {n}: sd {means.std() / 1e6:.1f} m, SE {sigma / np.sqrt(n) / 1e6:.1f} m", fontsize=9)
cons = loans.loc[loans["product_id"] == 2, "principal"].to_numpy(dtype=float)
smp = rng.choice(cons, 50, replace=False)
m, s50, n = smp.mean(), smp.std(ddof=1), 50
def wald(k, n, z=1.96):                    # k events in n trials
    p = k / n                              # the estimate p̂
    half = z * math.sqrt(p * (1 - p) / n)  # critical value × standard error
    return p - half, p + half
for name, k, n in [("app", 41, 2411), ("2 in 150", 2, 150), ("0 in 120", 0, 120)]:
    print(name, [round(100 * v, 2) for v in wald(k, n)])
def wilson(k, n, z=1.96):
    p = k / n
    # pulled a little towards 50 %
    centre = (p + z**2 / (2 * n)) / (1 + z**2 / n)
    half = z * math.sqrt(p * (1 - p) / n + z**2 / (4 * n**2)) / (1 + z**2 / n)
    return centre - half, centre + half
def pmf(k, n, p):
    return math.comb(n, k) * p**k * (1 - p)**(n - k)
def newcombe(k1, n1, k2, n2):
    p1, p2 = k1 / n1, k2 / n2
    l1, u1 = wilson(k1, n1); l2, u2 = wilson(k2, n2)
    d = p1 - p2
    return d, d - math.sqrt((p1 - l1)**2 + (u2 - p2)**2), d + math.sqrt((u1 - p1)**2 + (p2 - l2)**2)
for name, k, n in [("app", 41, 2411), ("branch", 34, 3263), ("partner", 16, 1425), ("2 in 150", 2, 150), ("0 in 120", 0, 120)]:
    print(name, "Wilson", [round(100 * v, 2) for v in wilson(k, n)], "Wald", [round(100 * v, 2) for v in wald(k, n)])
hits = 0
for _ in range(100):                               # 100 samples of 400 loans
    x = rng.choice(pop, 400, replace=False)
    half = 1.966 * x.std(ddof=1) / math.sqrt(400)  # t(0.975, 399) × SE
    hits += (x.mean() - half <= pop.mean() <= x.mean() + half)
z = 1.96
k, n = 41, 2411
p = k / n
lo, hi = wilson(k, n)
print('ready')
```

**P1.** *(population and sample)* Nilufar takes all 7 099 loans in FPD scope and computes 91 / 7 099 = 1.28 %. She will use it to set next month's alarm. Which statement is right?

**P2.** *(unbiased estimate, n − 1)* A pilot gives five credit scores: 620, 655, 700, 590, 685. Compute the variance with ddof = 0 and with ddof = 1. Which one goes into an interval, and by what factor do they differ?

**P3.** *(sampling error)* Five more systematic samples: every 20th loan, starting at loans 6, 7, 8, 9 and 10. Print each sample's mean and its sampling error (mean − μ) in m soum. Which sample misses most, and by how many standard errors?

**P4.** *(standard error)* The SE of the mean principal of 100 loans (σ = 112.6 m soum), in m soum. How many loans would halve it?

**P5.** *(law of large numbers)* Shuffle the 7 099 FPD flags with a new seed and print the running FPD rate after 50, 500 and all 7 099 loans. Which numbers depend on the seed, and which one does not?

**P6.** *(central limit theorem)* The CLT table (Going further, 'The central limit theorem'): for n = 5, 30, 100, 1000 draw 5 000 samples of loan principal, report the sd and skew of the means against σ/√n. Explain the one row where sd < σ/√n.

**P7.** *(confidence interval for a mean)* Reproduce the notebook's 50-loan Consumer interval in Excel: paste the 50 principals into a column, then `AVERAGE`, `STDEV.S`, `CONFIDENCE.T`. Is the true mean inside? What would a 99 % interval be?

**P8.** *(t vs z)* Ten loans instead of fifty: `rng = np.random.default_rng(2026); s10 = rng.choice(cons, 10, replace=False)`. The z interval and the t interval. How much wider is t, and which one would you sign?

**P9.** *(Wald interval)* SE of the book's FPD rate (91 / 7 099); its Wald and Wilson 95 % intervals. Why are the two almost the same here and not at n = 400?

**P10.** *(Wilson interval)* Wald vs Wilson on two small branch-months: 2 FPDs in 150 loans, and 0 in 120. Which numbers would you put on a dashboard?

**P11.** *(Wilson interval — coverage)* Coverage experiment: with `default_rng(2026)`, draw 20 000 values of k ~ Bin(400, 0.01282) and compute the share of Wald, Wilson and Clopper–Pearson intervals that contain 0.01282. In the box below, do it without simulation noise: k can only be 0, 1, …, 400, so the **exact** coverage is the sum of P(X = k) over the k whose interval contains p. The starter does it for Wald; add Wilson.

**P12.** *(what 95 % means)* "95 %" by experiment: 100 samples of 400 loans, a t interval for the mean principal from each. How many contain 51.71 m? Then repeat 10 000 times at n = 30.

**P13.** *(sample size)* Sample size for a target precision: how many first instalments do you need to estimate a rate near 1.28 % to within ±0.25 points (95 %)? ±0.5 points? (Wald arithmetic is fine for planning: n = z² p(1 − p) / E².)

**P14.** *(bootstrap)* Bootstrap: 95 % CI for the app's FPD (10 000 resamples, seed 2026) next to Wilson; then for the **median** principal of a 200-loan random sample.

> 🚀 **Stretch (optional, +5 XP).** **P15.** *(law of large numbers — when it fails)* When the LLN fails. Draw 100 000 values from a Cauchy distribution (`rng.standard_cauchy`, seed 2026) and from a standard normal; print the running mean after 10, 100, 1 000, 10 000, 100 000 draws. What happens, why, and why does it matter for loan money even though no loan is Cauchy?

### Mistakes people make

- "The 95 % CI has a 95 % chance of containing the true value" — the procedure has; this interval either does or does not.
- The sd of the loans used where the SE of the estimate belongs (an interval for the mean that is as wide as the data).
- `STDEV.P` / `np.std()` (ddof 0) in a sample interval — numpy's default is the population formula; pass `ddof=1` (pandas' `.std()` already does).
- A Wald interval on a 1 % rate with a few hundred loans: 88 % coverage, negative limits, zero-width intervals at 0 events.
- "The intervals overlap, so no difference" — the test of the difference is tomorrow's tool, not the eye.
- A rate on a dashboard without n: 2.4 % from 586 loans and 2.4 % from 58 loans are different statements.
- The bootstrap on 5 events: it can only resample what it saw — too narrow.
- A random sample built with `random.sample` and no seed: nobody can reproduce your interval.

---

## 4. Homework <span class="badge hw">HW 6.2 — Due Day 5</span>

**Bekzod's error bars.** In `data/python/week6/day2_starter.ipynb` write `wald_ci`, `wilson_ci`, `bootstrap_ci` and `fpd_ci_table(f, by)`, run `fpd_ci_table` for **channel** and for **risk_grade**, and draw **one figure with two panels** (channel, grade): the rate as a dot, the Wilson interval as an error bar, the label `app (n = 2 411)`. Save it as `hw62_fpd_ci.png`. Under it, **five sentences** for Bekzod (the notebook lists what each must say). Hand in the executed notebook and the PNG with the 📎 box below.

Graded on (20 points): (a) the numbers — FPD, n, rate, Wilson and bootstrap limits for 3 channels and 4 grades, matching the asserts and the model (8), (b) the chart — dots with error bars from zero-free axes in %, n in every label, grades in order A → D, a title that states the finding (6), (c) the five sentences — the overlap read correctly, the widest interval explained by n, Wilson vs bootstrap, a dashboard proposal, the question for tomorrow (6). **Bonus +20:** `clopper_pearson(k, n)` from `scipy.stats.beta` (not statsmodels) passing its assert, with the exact interval added to both tables and one sentence on when you would report it instead of Wilson.

**Check your table here before you hand in.** The grade counts are A 10 / 1 667, B 30 / 3 084, C 44 / 2 034, D 7 / 314 (the `wilson` function of the Practice setup box works).

**H1.** The upper limit of grade D's Wilson 95 % interval, in %, to 2 decimals?

**H2.** The lower limit of grade A's Wilson 95 % interval, in %, to 2 decimals?

**H3.** Why is grade D's interval the widest?

**H4.** Your first two sentences for Bekzod: how to read the overlap of the app and branch intervals, and what a dashboard tile should show.

### 📎 Hand in here

---

## 5. Self-check

Three questions, one at a time. Wrong? The explanation points to the part of section 1 to reread.

---

## 6. Company corner <span class="badge company">Reporting a rate honestly</span>

Every rate on a dashboard is an estimate from n loans. The honest tile has **three numbers**: the rate, n, and the interval — `FPD30 1.70 % · n = 2 411 · 95 % CI 1.26–2.30 %`. Without n and the interval, the reader cannot tell a signal from a small denominator, and the most common decision in a lending company — **ranking branches** — becomes a ranking of luck.

FPD30 by branch (the branch the loan is booked to), Wilson 95 %, sorted by rate, with the **funnel limits**: the range a branch of that size would show 95 % of the time if its true rate were the book's 1.28 % (`stats.binom.ppf([0.025, 0.975], n, 91/7099) / n`):

| branch | FPD / n | rate | Wilson 95 % | funnel 95 % at 1.28 % | P(≥ this many \| 1.28 %) |
|---|---|---|---|---|---|
| Bukhara Central | 14 / 586 | **2.39 %** | 1.43–3.97 % | 0.51–2.22 % | 0.02 |
| Tashkent Central | 14 / 913 | 1.53 % | 0.92–2.56 % | 0.66–2.08 % | 0.29 |
| Tashkent South | 14 / 917 | 1.53 % | 0.91–2.55 % | 0.65–2.07 % | 0.29 |
| Samarkand Central | 10 / 782 | 1.28 % | 0.70–2.34 % | 0.51–2.17 % | 0.55 |
| Namangan Central | 8 / 634 | 1.26 % | 0.64–2.47 % | 0.47–2.21 % | 0.57 |
| Termez Central | 5 / 437 | 1.14 % | 0.49–2.65 % | 0.46–2.52 % | 0.66 |
| Fergana Central | 9 / 834 | 1.08 % | 0.57–2.04 % | 0.60–2.04 % | 0.74 |
| Andijan Central | 6 / 635 | 0.94 % | 0.43–2.05 % | 0.47–2.20 % | 0.82 |
| Tashkent North | 8 / 921 | 0.87 % | 0.44–1.70 % | 0.65–2.06 % | 0.90 |
| Nukus Central | 3 / 440 | **0.68 %** | 0.23–1.99 % | 0.45–2.50 % | 0.92 |

```python
# uses scipy and statsmodels: they load on the first ▶ Run (the notebook has
# them too)
p0 = 91 / 7099
b = f.groupby("branch_name")["fpd30"].agg(fpd="sum", n="size")
b[["lo", "hi"]] = [proportion_confint(k, n, method="wilson") for k, n in zip(b.fpd, b.n)]
b["funnel_lo"] = stats.binom.ppf(0.025, b.n, p0) / b.n
b["funnel_hi"] = stats.binom.ppf(0.975, b.n, p0) / b.n
# how surprising this many FPDs is at the book rate
b["p_ge"] = stats.binom.sf(b.fpd - 1, b.n, p0)
```

**The ranking trap.** The "worst" branch (Bukhara, 1.43–3.97 %) and the "best" (Nukus, 0.23–1.99 %) **overlap between 1.43 and 1.99 %**: the data cannot even put the top and the bottom of the league table in a reliable order. Simulate a book in which all ten branches have exactly 1.28 % (`default_rng(2026)`, 10 000 books, the same n's): the top branch averages **2.00 %**, exceeds Bukhara's 2.39 % in **10.5 %** of books, and the bottom branch is below Nukus's 0.68 % in **50 %** of books. Somebody is always first and last; a league table of rates guarantees a "worst branch" even when there is none.

What Bukhara's row does say: it is the one branch above its funnel (14 FPDs where 13 is the 97.5 % limit, P(≥ 14) = 0.02). One branch out of ten past a 95 % limit is roughly what chance produces — Thursday's multiple-comparisons day tests exactly this. The right action is to **watch** Bukhara (next quarter's vintages, the officer mix), not to punish it.

Rules for the risk pack, from today:

1. Every rate with n and a 95 % Wilson interval (a bar with whiskers, or a small grey "± 0.5 pt" next to the number).
2. No league tables of rates below ~1 000 loans per row; a **funnel plot** (rate vs n with the 95 % / 99.8 % limits around the book rate) instead — a branch is flagged by the funnel, not by its rank.
3. Thin cells (a vintage × channel with 67 loans) shown greyed with the count, never as a bare 5.97 %.
4. Pool to quarters when months are thin: a quarter of a branch has three times the n and a √3 narrower interval.

Put the steps of an honest branch review in order:

> 🎯 **Interview version.** *"Branch X has the highest default rate. What do you do?"* — Ask for n and the interval; compare it with the funnel limits for its size, not with the other branches' ranks; check whether one in ten branches past a 95 % limit is more than chance; then look for a cause (mix of products, officers, vintages) before anyone acts.

**Say it like in an interview.** *"Bukhara has the highest FPD rate of our ten branches. What do you do?"* — answer in 3–5 sentences, as you would to an interviewer.

Tomorrow: the test. Bekzod's question becomes H₀: p_app = p_branch, a z statistic, a p-value — and Nilufar's yes/no for the risk committee.

---

## Going further — the full version, with Python (optional, 60 min)

The same ideas as the stories, written out in full with Python and Excel, plus the n − 1 experiment, the finite-population correction, the Newcombe interval for a difference of two rates, Clopper–Pearson in Excel and a table of which interval to use when. Optional: nothing here counts toward the day.

### Population and sample — the process behind the table

**What it is.** The **population** (*генеральная совокупность*) is everything you want to talk about. The **sample** (*выборка*) is the part you observed. A **parameter** (*параметр*) is the population's true value — μ for a mean, p for a rate — and it is unknown. An **estimate** (*оценка*), or statistic, is the same quantity computed from the sample: x̄, p̂. One number is a **point estimate** (*точечная оценка*).

Even "all 2 411 app loans" is a sample when the question is about the **process**: *will* app loans default more? Next year's app loans are not in the table.

| | Population (unknown) | Sample (what you compute) |
|---|---|---|
| mean | μ | x̄ |
| standard deviation | σ | s |
| rate | p | p̂ |
| size | N | n |

**How to write it.** Press ▶ Run: this first block loads the tools and the data for the whole page. Every later block reuses them.

```python
import math
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

loans = pd.read_csv("data/raw/loans.csv")
# all 7 828 principals: the population of this page's experiments
pop = loans["principal"].to_numpy(dtype=float)
apps = pd.read_csv("data/raw/applications.csv")
# 13 612 applicants' credit scores
s = apps["credit_score"].dropna().to_numpy(dtype=float)
# week 5's FPD frame: 7 099 loans, fpd30 = 0/1
f = pd.read_csv("data/powerbi/fct_first_instalment.csv")
# app = Micro only, partner = BNPL only
f["channel"] = f["product"].map({"MICRO": "app", "BNPL": "partner"}).fillna("branch")
# seeded: the same "random" draws on every run
rng = np.random.default_rng(2026)

# 7828 51709668: N and μ — a parameter
print(len(pop), round(pop.mean()))
app = f[f["channel"] == "app"]
# 2411 41 1.7: n, FPDs and p̂ — an estimate
print(len(app), app["fpd30"].sum(), round(100 * app["fpd30"].mean(), 2))
```

The mean principal of all 7 828 loans, 51.71 m soum, is a parameter of the book: every loan is in it. The app's 1.70 % — 41 FPDs in 2 411 loans — is an estimate of the app process's true rate.

**When you use it.**
- Before a number goes into a report: say what the population is — the book as it stands, or the process that makes next month's loans.
- Whenever the question says "will", "is the app riskier", "does the channel": the table is a sample of a process.

**Your turn.** Bekzod asks: *"Will app loans default more than branch loans next year?"* What are the 2 411 app loans in the table?

### A good estimate — unbiased and consistent

**What it is.** A good estimate is **unbiased** (*несмещённая*): right on average over many samples. It is also **consistent** (*состоятельная*): closer to the truth as n grows. The sample variance divides by **n − 1**, not by n, so that it is unbiased.

**How to write it.** Sample variance = the sum of squared distances from the sample mean ÷ (n − 1). numpy: `x.var(ddof=1)`; pandas: `.var()`; Excel: `VAR.S`, `STDEV.S`. Check it by experiment — 20 000 samples of five scores, both formulas, averaged:

```python
# 20 000 samples, n = 5 each
samples = np.array([rng.choice(s, 5, replace=False) for _ in range(20_000)])
# 3543: the population variance of the 13 612 scores
print(round(s.var()))
# ≈ 2 862 (too small), ≈ 3 578 (right on average)
print(samples.var(axis=1, ddof=0).mean(), samples.var(axis=1, ddof=1).mean())
```

Dividing by n gives about 2 860 instead of 3 543 — 20 % too small at n = 5. Dividing by n − 1 lands near 3 543. The reason: the sample's own mean sits closer to its five points than the true mean does, so the squared distances come out too small by the factor (n − 1)/n. (The sd, √ of the variance, is still a little low on average — 56.2 against 59.5 here — and nobody minds.)

**When you use it.**
- Every sample sd or variance: `ddof=1`. At n = 5 (a pilot, a branch-week) the difference is 20 %; at n = 2 411 it is invisible.

> ⚠️ **Watch out.** `np.std(x)` and `np.var(x)` default to ddof = 0, the population formula; pandas' `.std()` uses ddof = 1. Pass `ddof=1` to numpy in every sample calculation.

**Your turn.** At n = 5, the variance divided by n is on average what share of the true variance? Give it as a decimal (like 0.5), not in %.

### Sampling error — every sample misses a little

**What it is.** **Sampling error** (*ошибка выборки*) is the gap between an estimate and the parameter: x̄ − μ. It comes from *which* units happened to land in the sample. It is not a mistake. Every sample has one, and another sample has another.

**How to write it.** Sampling error = estimate − parameter. Here we know μ, so we can see the errors. Five samples of 392 loans each — every 20th loan, starting at loan 1, 2, 3, 4 and 5 (a **systematic sample**):

```python
# 51.71 m: the parameter
mu = pop.mean()
for start in range(5):
    # every 20th loan: 392 loans
    part = loans["principal"].iloc[start::20]
    print(start + 1, len(part), round(part.mean() / 1e6, 2), round((part.mean() - mu) / 1e6, 2))
```

| sample starts at loan | n | mean, m soum | sampling error, m soum |
|---|---|---|---|
| 1 | 392 | 48.29 | −3.42 |
| 2 | 392 | 58.11 | +6.40 |
| 3 | 392 | 48.89 | −2.82 |
| 4 | 392 | 60.16 | +8.45 |
| 5 | 392 | 56.03 | +4.32 |

Five samples from one book give five different means; each misses 51.71 m by 2.8 to 8.5 million soum. In real work you see one row of this table, and you do not know its error.

**When you use it.**
- To explain why this month's rate differs from last month's when nothing in the process changed.
- As the reason every estimate needs an interval: the next subsections measure how big the error typically is.

> ⚠️ **Watch out.** Sampling error is not **bias** (*смещение*). A biased sample — approved loans only, one branch only — misses in the same direction every time, and a larger n does not fix it. Sampling error shrinks as n grows; bias does not.

**Your turn.** A branch's FPD rate was 1.1 % last quarter and 1.6 % this quarter. Nothing changed in the products, the officers or the rules. What is the most likely explanation?

### Standard error — how much an estimate moves

**What it is.** Draw sample after sample, and the estimate moves. Its distribution over repeated samples is the **sampling distribution** (*выборочное распределение*). The standard deviation of that distribution is the **standard error** (*стандартная ошибка*, SE) — the typical size of the sampling error.

**How to write it.**

```text
SE of a mean
  = s / √n
  (sd of the data ÷ square root
   of the sample size)
SE of a proportion
  = √( p̂ (1 − p̂) / n )
```

```python
# 5.69: SE of a 392-loan mean principal, m soum
print(round(pop.std() / math.sqrt(392) / 1e6, 2))
p = 41 / 2411
# 0.263: SE of the app FPD rate, in points
print(round(100 * math.sqrt(p * (1 - p) / 2411), 3))
```

A 392-loan mean principal moves by about 5.7 m from sample to sample — the size of the errors in the table above (−3.4 to +8.5 m). The app's 1.70 % moves by about 0.26 points.

**When you use it.**
- Inside every interval and every test this week: estimate ± critical value × SE.
- To plan: four times the loans halve the SE.

| | Standard deviation (sd) | Standard error (SE) |
|---|---|---|
| describes | the loans: how different they are | the estimate: how much it would move |
| with more loans | stays about the same | shrinks like 1 / √n |
| principal, n = 400 | 112.6 m | 112.6 / √400 = 5.63 m |

> ⚠️ **Watch out.** An interval built with the sd instead of the SE is as wide as the data — √n times too wide. The sd is about loans; the SE is about your number.

**Your turn.** The SE of the branch FPD rate, 34 FPDs in 3 263 loans, in percentage points, to 2 decimals?

### The law of large numbers — the average settles

**What it is.** The **law of large numbers** (*закон больших чисел*, ЗБЧ): as n grows, the sample mean gets closer to the population mean and stays there. It needs a finite mean — the Stretch shows a distribution that has none.

**How to write it.** Running mean after n draws = the sum of the first n values ÷ n.

```python
# the 7 828 principals in a random order
order = np.random.default_rng(2026).permutation(pop)
# the mean after 1, 2, 3, … loans
running = np.cumsum(order) / np.arange(1, len(order) + 1)
for n in (10, 100, 1000, 7828):
    # wild at first; exactly 51.71 m at 7 828
    print(n, round(running[n - 1] / 1e6, 2))
```

One shuffle gave **106.38 m** after 10 loans, **35.06 m** after 100, **52.06 m** after 1 000 and **51.71 m** after all 7 828. Early means swing because one SME loan (up to 599 m) outweighs ten Micro loans. The swings die out like 1 / √n.

**When you use it.**
- The reason a rate from 2 411 loans is worth more than a rate from 50.
- The reason not to judge a new branch on its first week: a running mean at n = 10 can be twice the truth.

**Your turn.** A new branch's average ticket after its first 10 loans is twice the book's. What does the law of large numbers tell you?

### The central limit theorem — the mean becomes a bell

**What it is.** The **central limit theorem** (*центральная предельная теорема*, ЦПТ): the mean of n independent draws is approximately **normal**, with mean μ and sd σ / √n, **whatever the shape of the data**, once n is large enough. It is shown here by simulation, not proved.

**How to write it.** Take many samples of n loans, keep each sample's mean, look at the means. Loan principal is about as skewed as money gets: mean 51.7 m, median 5.79 m, skew 2.92. The notebook's 5 000 samples per n (`default_rng(2026)`, without replacement):

| n | sd of the 5 000 means | SE = σ / √n | skew of the means | share within ±1.96 SE |
|---|---|---|---|---|
| 5 | 49.08 m | 50.35 m | 1.33 | 95.6 % |
| 30 | 20.47 m | 20.56 m | 0.57 | 95.8 % |
| 100 | 11.32 m | 11.26 m | 0.30 | 94.7 % |
| 1 000 | 3.33 m | 3.56 m | 0.09 | 96.0 % |

See it yourself — 2 000 samples per n (your numbers will sit close to the table's):

```python
# 51.71 m, 112.6 m — the population
mu, sigma = pop.mean(), pop.std()
fig, axes = plt.subplots(1, 4, figsize=(14, 3))
for ax, n in zip(axes, (5, 30, 100, 1000)):
    # 2 000 sample means
    means = np.array([rng.choice(pop, n, replace=False).mean() for _ in range(2000)])
    ax.hist(means / 1e6, bins=40, color="#9bb7d4"); ax.axvline(mu / 1e6, color="#c0392b")
    ax.set_title(f"n = {n}: sd {means.std() / 1e6:.1f} m, SE {sigma / np.sqrt(n) / 1e6:.1f} m", fontsize=9)
plt.tight_layout(); plt.show()
```

The spread of the means follows σ / √n, and their skew melts from 1.33 to 0.09: the bell appears. At n = 1 000 the spread is a little below σ / √n because we take 13 % of a finite population without replacement: × √((7 828 − 1 000) / 7 827) = 0.934 gives 3.32 m — the **finite-population correction**.

**When you use it.**
- It is why one t interval or one z-test works on money: they need the *mean* to be normal, not the loans.
- It warns you: the more skewed the data, the larger the n before a normal-based interval keeps its promise.

> ⚠️ **Watch out.** "n ≥ 30 is enough" is folklore. At n = 30 these means are still skewed (0.57), and an interval that assumes normality covers less than it promises (see "What 95 % means"). How many is "many" depends on the skew.

**Your turn.** According to the CLT, *what* becomes approximately normal?

### Confidence interval for a mean — t, not z

**What it is.** A **confidence interval** (*доверительный интервал*, CI) is a range of plausible values for a parameter: **estimate ± critical value × SE**. For a mean, the critical value comes from **Student's t** distribution (*распределение Стьюдента*) with n − 1 **degrees of freedom** (*степени свободы*), because s stands in for the unknown σ. The z value 1.96 is the limit of t as n grows.

**How to write it.** Mean ± t(0.975, n − 1) × s / √n.

| df | 4 | 9 | 29 | 49 | 99 | 999 | ∞ (z) |
|---|---|---|---|---|---|---|---|
| t₀.₉₇₅ | 2.776 | 2.262 | 2.045 | 2.010 | 1.984 | 1.962 | 1.960 |

```python
# the 2 418 Consumer loans (product_id 2 = CONS)
cons = loans.loc[loans["product_id"] == 2, "principal"].to_numpy(dtype=float)
# your 50 loans — the notebook's draw: mean 27 486 400, s 12 617 221
smp = rng.choice(cons, 50, replace=False)
# estimate, sample sd (ddof=1), size
m, s50, n = smp.mean(), smp.std(ddof=1), 50
# standard error — notebook: 1 784 345
se = s50 / np.sqrt(n)
# t(0.975, df = 49), from the table above — scipy.stats.t.ppf(0.975, 49)
t_crit = 2.0096
# t interval — notebook: 23 900 625 … 31 072 175
print(round(m - t_crit * se), round(m + t_crit * se))
# z: a little narrower (23 989 085 … 30 983 715)
print(round(m - 1.96 * se), round(m + 1.96 * se))
# the true Consumer mean: 26 926 915 — inside?
print(round(cons.mean()))
# scipy (the notebook): scipy.stats.t.interval(0.95, n - 1, loc=m, scale=se)
```

On the notebook's 50 loans the t interval is 23.90–31.07 m, and the true Consumer mean, 26.93 m, is inside. Excel: `=CONFIDENCE.T(0.05, STDEV.S(B2:B51), 50)` → half-width **3 585 775**; `=T.INV.2T(0.05, 49)` → 2.0096; `=NORM.S.INV(0.975)` → 1.96.

**When you use it.**
- An average with its precision: the average Consumer ticket, the average score of approved loans.

| | z interval | t interval |
|---|---|---|
| critical value | 1.96, always | t(0.975, n − 1): 2.262 at n = 10, 2.010 at n = 50 |
| assumes | σ is known | σ is estimated by s |
| width vs the other | narrower | 15 % wider at n = 10, 2.5 % at n = 50 |
| use it | practically never | always, for a mean |

**Your turn.** 400 loans: mean principal 51.7 m, s = 112.6 m, t(0.975, 399) = 1.966. The half-width of the 95 % t interval, in m soum, to 2 decimals?

### Confidence interval for a proportion — the Wald interval

**What it is.** The **Wald interval** is the textbook interval for a rate: p̂ ± 1.96 × √(p̂ (1 − p̂) / n). It assumes the rate's sampling distribution is a symmetric bell. Near 0 % it is not: a rate cannot go below zero but can go far above.

**How to write it.**

```python
def wald(k, n, z=1.96):                    # k events in n trials
    p = k / n                              # the estimate p̂
    half = z * math.sqrt(p * (1 - p) / n)  # critical value × standard error
    return p - half, p + half

for name, k, n in [("app", 41, 2411), ("2 in 150", 2, 150), ("0 in 120", 0, 120)]:
    print(name, [round(100 * v, 2) for v in wald(k, n)])
# app [1.18, 2.22] · 2 in 150 [-0.5, 3.17] · 0 in 120 [0.0, 0.0]
```

The app: 1.18–2.22 %. Two FPDs in 150 loans: −0.50 to 3.17 % — a negative default rate. Zero in 120: 0 to 0 — "certainly zero".

**When you use it.**
- A rate between about 20 % and 80 % on hundreds of cases (an approval rate on 2 000 applications).
- Quick planning arithmetic (sample size, below).

> ⚠️ **Watch out.** For a rate near 0 % — FPD, fraud, default — on a few hundred loans, Wald is too narrow, can go negative and collapses to zero width at 0 events. Default to Wilson (next).

**Your turn.** The upper limit of the Wald 95 % interval for the branch FPD rate, 34 / 3 263, in %, to 2 decimals?

### The Wilson interval — the right default for a rate

**What it is.** The **Wilson interval** (*интервал Уилсона*) is built by inverting the score test instead of assuming a bell around p̂. It is never negative, never zero-width, asymmetric in the right direction near 0 %, and covers close to 95 %. The **Clopper–Pearson** interval ("exact", *точный*) comes from the binomial itself; it guarantees *at least* 95 % and is therefore a little wide.

**How to write it.**

```text
centre
  = (p̂ + z²/2n) / (1 + z²/n)
half-width
  = z √( p̂(1 − p̂)/n + z²/4n² )
    / (1 + z²/n)
```

```python
def wilson(k, n, z=1.96):
    p = k / n
    # pulled a little towards 50 %
    centre = (p + z**2 / (2 * n)) / (1 + z**2 / n)
    half = z * math.sqrt(p * (1 - p) / n + z**2 / (4 * n**2)) / (1 + z**2 / n)
    return centre - half, centre + half
# binomial P(X = k), from Day 1 (Practice uses it)
def pmf(k, n, p):
    return math.comb(n, k) * p**k * (1 - p)**(n - k)
# 95 % CI for the difference p1 − p2
def newcombe(k1, n1, k2, n2):
    p1, p2 = k1 / n1, k2 / n2
    l1, u1 = wilson(k1, n1); l2, u2 = wilson(k2, n2)
    d = p1 - p2
    return d, d - math.sqrt((p1 - l1)**2 + (u2 - p2)**2), d + math.sqrt((u1 - p1)**2 + (p2 - l2)**2)

for name, k, n in [("app", 41, 2411), ("branch", 34, 3263), ("partner", 16, 1425), ("2 in 150", 2, 150), ("0 in 120", 0, 120)]:
    print(name, "Wilson", [round(100 * v, 2) for v in wilson(k, n)], "Wald", [round(100 * v, 2) for v in wald(k, n)])
# [0.66, 0.05, 1.33]
print("app − branch", [round(100 * v, 2) for v in newcombe(41, 2411, 34, 3263)])
```

App **1.26–2.30 %**, branch **0.75–1.45 %**, partner **0.69–1.82 %**; 2 in 150 → 0.37–4.73 %; 0 in 120 → 0–3.10 %. The app's interval reaches 0.44 points below 1.70 and 0.60 above: the right shape for a rate near zero. Excel has no Wilson function — with k in B1, n in B2, z in B3 (`=NORM.S.INV(0.975)`):

| Bound | Excel |
|---|---|
| Wilson, lower | `=(B1/B2 + B3^2/(2*B2) - B3*SQRT(B1/B2*(1-B1/B2)/B2 + B3^2/(4*B2^2))) / (1 + B3^2/B2)` |
| Wilson, upper | the same with `+` before `B3*SQRT` |
| Clopper–Pearson, lower | `=BETA.INV(0.025, B1, B2-B1+1)` |
| Clopper–Pearson, upper | `=BETA.INV(0.975, B1+1, B2-B1)` |

**When you use it.** Every rate, at any n — FPD, approval rate, PAR30. Clopper–Pearson when an auditor or a regulator wants 95 % guaranteed. For a **difference** of two rates, combine the two Wilson intervals (**Newcombe**): app − branch = 0.66 points, 95 % CI **0.05 to 1.33** points. Coverage of a "95 %" interval at the true rate 1.28 % (20 000 samples each, `proportion_confint(k, n, method=...)`, `default_rng(2026)`):

| n | Wald (`"normal"`) | Wilson (`"wilson"`) | Clopper–Pearson (`"beta"`) | samples with 0 FPDs |
|---|---|---|---|---|
| 100 | **72.7 %** | 95.9 % | 99.0 % | 27.1 % |
| 400 | **87.7 %** | 96.0 % | 98.0 % | 0.6 % |
| 2 000 | 94.0 % | 95.3 % | 96.3 % | 0 % |

A "95 %" Wald interval on a branch-month of 400 loans is really an 88 % interval. In Python all three are `proportion_confint(41, 2411, method="wilson" | "beta" | "normal")` from `statsmodels.stats.proportion`.

> ⚠️ **Watch out.** Two overlapping intervals are not a test of the difference. App (1.26–2.30 %) and branch (0.75–1.45 %) overlap, yet the Newcombe interval of their difference, 0.05 to 1.33 points, does not contain zero. Compare two rates with an interval for the difference — or tomorrow's test.

**Your turn.** The upper limit of the Wilson 95 % interval for the partner FPD rate, 16 / 1 425, in %, to 2 decimals?

### What 95 % means — and what it does not

**What it is.** 95 % is a property of the **procedure** (*уровень доверия*, confidence level): if you repeated the sampling many times, 95 % of the intervals built this way would contain the true value. This one interval either contains it or not.

**How to write it.** Run the procedure 100 times and count the hits:

```python
hits = 0
for _ in range(100):                               # 100 samples of 400 loans
    x = rng.choice(pop, 400, replace=False)
    half = 1.966 * x.std(ddof=1) / math.sqrt(400)  # t(0.975, 399) × SE
    hits += (x.mean() - half <= pop.mean() <= x.mean() + half)
print(hits)                                        # about 95 — one run gave 96
```

One run: **96 of the 100** intervals contain the true 51.71 m. With 100 intervals, anything from about 90 to 99 is normal — the count itself is Bin(100, 0.95).

| Right reading | Wrong reading |
|---|---|
| "We are 95 % confident: the method catches the true rate 95 times in 100." | "There is a 95 % probability that the true FPD is between 1.26 and 2.30 %." — the true value is fixed (that sentence is a Bayesian *credible* interval, Seeing Theory ch. 5) |
| "The data are consistent with a true rate between 1.26 and 2.30 %." | "95 % of app loans have an FPD rate in that range." — loans do not have rates; the interval is about the average |
| "Compare two rates with an interval for the difference." | "The intervals overlap, so there is no difference." |
| "95 % holds when the method's assumptions hold." | "95 % whatever the data." — t intervals on skewed principal cover **88.6 %** at n = 30, **93.0 %** at n = 100, **95.2 %** at n = 400 |

**When you use it.**
- Every time you say an interval out loud, in a meeting or in a note.

> ⚠️ **Watch out.** Never write "95 % probability the true rate is in 1.26–2.30 %". Write "95 % CI 1.26–2.30 %" or "the data are consistent with a true rate between 1.26 and 2.30 %".

### Sample size for a given margin

**What it is.** The **margin of error** (*предельная ошибка*) E is the half-width of the interval. The **sample size** (*объём выборки*) you need is the n that makes the margin no larger than E. Solve E = z × SE for n.

**How to write it.**

```text
for a rate:
  n = z² · p(1 − p) / E²
  p = your best guess; 0.5 if you
  have none (the worst case)
for a mean:
  n = (z · σ / E)²
  σ = from history or a pilot
always round up
```

```python
z = 1.96
# loans needed to estimate a rate near p to ± E
def n_for_rate(p, E):
    return math.ceil(z**2 * p * (1 - p) / E**2)
# cases needed to estimate a mean to ± E
def n_for_mean(sigma, E):
    return math.ceil((z * sigma / E) ** 2)

print(n_for_rate(91 / 7099, 0.005), n_for_rate(0.5, 0.03))  # 1945 1068
print(n_for_mean(112.6e6, 5e6))                             # 1949
```

A rate near 1.28 % to within ±0.5 points needs 1 945 loans. A rate you know nothing about, to ±3 points, needs 1 068 — the "about a thousand" of opinion polls. The mean principal to ±5 m soum needs 1 949 loans.

| margin for a rate near 1.28 % | ±1 point | ±0.5 point | ±0.25 point |
|---|---|---|---|
| loans needed | 487 | 1 945 | 7 779 |

Halve the margin, quadruple the loans.

**When you use it.**
- Before a pilot, an audit sample or a survey: how many cases do we need?
- To say what precision a segment can ever reach: a branch with 400 loans a year cannot pin FPD to ±0.25 points.

> ⚠️ **Watch out.** E is in the same units as p: ±0.5 points is E = 0.005, not 0.5. And the formula uses Wald arithmetic — for a rate near 0 % with a small n, check the result with a Wilson interval.

**Your turn.** Applicants' credit scores have σ = 59.5. How many applicants do you need to estimate the mean score to within ±2 points (95 %)?

### The bootstrap — an interval without a formula

**What it is.** The **bootstrap** (*бутстреп*) treats the sample as the population. It resamples the sample **with replacement** many times, computes the statistic each time, and reads the 2.5th and 97.5th percentiles: the **percentile bootstrap**.

**How to write it.**

```python
def bootstrap_ci(values, stat=np.mean, B=10_000, seed=2026):
    # its own seeded generator
    g = np.random.default_rng(seed)
    # B resamples, the statistic of each
    boot = [stat(g.choice(values, len(values), replace=True)) for _ in range(B)]
    # the middle 95 %
    return np.quantile(boot, [0.025, 0.975])
# ≈ 1.20 % … 2.24 %   (Wilson 1.26 … 2.30)
print(bootstrap_ci(f.loc[f.channel == "app", "fpd30"].to_numpy()))
```

The app's FPD: bootstrap ≈ 1.20–2.24 %, close to Wilson's 1.26–2.30 %. Its strength is a statistic with no SE formula: a 200-loan sample's **median** principal is 5.69 m, bootstrap 95 % CI **4.54–8.27 m** (true median 5.79 m).

**When you use it.**
- A median, a percentile, a ratio of sums (collection rate = Σ paid / Σ due), a difference of medians.
- A mean of very skewed money at small n, where the t interval undercovers.

> ⚠️ **Watch out.** With very few events the bootstrap is too narrow: it can only reshuffle what it saw. 7 FPDs in 314 grade-D loans: bootstrap 0.64–3.82 % against Wilson's 1.08–4.53 %. For rates near zero, Wilson; for medians and ratios, the bootstrap.

**Your turn.** Which estimate is the best job for the bootstrap?

### Putting it together

One request, every tool of the day: *"Describe the app channel's FPD honestly, and say what more data would buy."*

```python
# the sample: app loans in FPD scope
k, n = 41, 2411
p = k / n                        # the point estimate p̂
se = math.sqrt(p * (1 - p) / n)  # its standard error
# a rate near 0 % → Wilson, not Wald
lo, hi = wilson(k, n)
print(f"FPD30 {100*p:.2f} % · n = {n} · SE {100*se:.2f} pt · 95 % CI {100*lo:.2f}–{100*hi:.2f} %")
# loans needed for ±0.25 points
print(n_for_rate(p, 0.0025))
```

`FPD30 1.70 % · n = 2411 · SE 0.26 pt · 95 % CI 1.26–2.30 %`, and ±0.25 points would need **10 275** app loans — more than four times the channel's whole history. Read it with the subsections: the 2 411 loans are a sample of the app process; 1.70 % is an estimate with a sampling error; the SE says it typically moves by 0.26 points; the rate is near zero, so the interval is Wilson; "95 %" is the method's promise, not a probability about this range; and precision costs n quadratically.

**Which interval, when.**

| You estimate | Typical Nur example | Interval | Python | Excel |
|---|---|---|---|---|
| a mean, n ≥ ~30, not wildly skewed | average Consumer principal, average score | t | `stats.t.interval(0.95, n-1, m, s/√n)` | `CONFIDENCE.T` |
| a mean of very skewed money, small n | average SME ticket from 40 loans | bootstrap (or t on log values) | `bootstrap_ci(v)` | — |
| a rate, any n, especially near 0 % or 100 % | FPD, approval rate, PAR30 | Wilson | `proportion_confint(k, n, method="wilson")` | formula above |
| the difference of two rates | app − branch FPD | Newcombe | `newcombe(k1, n1, k2, n2)` | two Wilson formulas |
| a rate that must be *guaranteed* ≥ 95 % | regulatory / audit sample | Clopper–Pearson | `method="beta"` | `BETA.INV` |
| a median, a ratio of sums, a percentile | median ticket, collection rate | bootstrap | `bootstrap_ci(v, stat=np.median)` | — |
| a count per period | 5 102 applications in 3 549 hours | Poisson (exact) | `stats.chi2.ppf([0.025, 0.975], [2*k, 2*k + 2]) / 2`, then ÷ hours | `=CHISQ.INV(0.025, 2*k)/2` |

Default to a 95 % level and say so. Use 90 % only when a team agreed to it in advance — never because the 95 % interval "looked too wide".

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Standard error — [Standard Deviation vs Standard Error, Clearly Explained!!! (StatQuest), 01:12](https://youtu.be/A82brFpdr9g?t=72)
- ▶ Central limit theorem — [The Central Limit Theorem, Clearly Explained!!! (StatQuest), 00:42](https://youtu.be/YAlJCEDH2uY?t=42)
- ▶ Confidence intervals — [Confidence Intervals, Clearly Explained!!! (StatQuest), 02:55](https://youtu.be/TqOeMYtOc1w?t=175)
- ▶ Confidence interval for a mean, formula route — [Confidence Interval [Simply explained] (numiqo)](https://youtu.be/ENnlSlvQHO0)
- ▶ Bootstrap — [Bootstrapping Main Ideas!!! (StatQuest), 06:40](https://youtu.be/Xz0x-8-cgaQ?t=400&end=493)

- RU deck (TBC Data Analytics 2.0, if you have it) `5.2 Statistics & Probability Theory.pdf` pp. 68–73: law of large numbers and CLT. `MS_lecture3.pdf` (lesson 5.3): sample method and sample properties pp. 5–13, point estimates — unbiased, consistent, efficient pp. 14–18, method of moments and maximum likelihood pp. 19–27, confidence intervals (Fisher's lemma; the mean with σ known and unknown; the variance) pp. 28–35. The lesson's recording: `video1414856026.mp4`.
- Notebooks: `MS_5_statistics.ipynb` (LLN with a coin and a die, CLT from other distributions), `MS6_Точечное_оценивание.ipynb` (unbiasedness and consistency by simulation), `MS6_Интервальное_оценивание.ipynb` (exact vs asymptotic interval, coverage at n = 3 … 1 000 — the same experiment as our Wald/Wilson table), `HW_3_CI.ipynb` (an interval for an exponential mean).
- Visual: Seeing Theory, chapter 4 (Frequentist Inference: the CLT and confidence intervals, interactive).
- *Russian terms:* генеральная совокупность = population, выборка = sample, оценка = estimate, точечная / интервальная оценка = point / interval estimate, несмещённость = unbiasedness, состоятельность = consistency, стандартная ошибка = standard error, закон больших чисел (ЗБЧ) = law of large numbers, центральная предельная теорема (ЦПТ) = central limit theorem, доверительный интервал = confidence interval, уровень доверия = confidence level, распределение Стьюдента = t distribution, степени свободы = degrees of freedom, бутстреп = bootstrap, асимптотический = asymptotic.

**Questions inside the videos.** Open a video from the panel: it stops at these points and asks one question about the bit you just watched.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 6 · Day 3 — Hypothesis tests I: is the difference real? (weeks/week-06/day-3.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-06/day-3
=====

# Week 6 · Day 3 — Hypothesis tests I: is the difference real?

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 6.1 due · HW 6.2 (due Day 5)</span> <span class="badge company">Company corner</span>

> STORY **Wednesday, 9:00.** Nilufar again, this time with the risk-committee agenda for Friday. *"I read your intervals. Overlapping, not overlapping — the committee does not do 'a little'. **So is app worse? I need a yes or a no, with the evidence**, on half a page. If the answer is yes, marketing loses its favourite channel; if it is no and we are wrong, we lose money for a year. Whatever you write, I have to defend it."* Jasur: *"Then write down the probability of being wrong before you write the answer."*

## Today in 3 lines

- A test is a rule for deciding with a known error rate: **H₀ and H₁**, a **test statistic**, its distribution under H₀, the **p-value** (the precise definition — and the three wrong ones everyone uses), **α**, **type I and type II errors**, one- vs two-sided.
- The tests of the day on Nur data: **one-sample t** and **one-proportion z** (against a target), **z-test for two proportions** (app vs branch FPD: z = 2.15, **p = 0.032**), **chi-square** (FPD × channel: **p = 0.078**; late payment × grade: p ≈ 0), **t-test and Welch** (scores by channel), **paired vs independent** (the same ten branches, 2025 vs 2026), with the assumptions checked (Shapiro, QQ, Levene).
- **Significance ≠ importance**: every result reported with an **effect size** — difference in rates, relative risk, Cohen's d, *extra FPDs per 1 000 loans* — and Nilufar gets her six-line risk-committee note.

---

## 1. Learn — the logic of a test

Nine short stories. Each one tells **one idea in small steps**: read a sentence, watch the picture change, press **Next**. A dotted word shows its meaning when you tap it. Tired of reading? Press **▶ Play as a video**: the page reads every step aloud and moves the picture for you.

The Python for each idea, and the extra topics, are in **Going further — the full version** near the end of the page (optional).

### Innocent until proven guilty — H₀ and H₁

(Animated explanation)
Innocent until proven guilty
- Nilufar's question for Friday: are app loans riskier than branch loans? The orange bars are the real FPD rates: app 41 of 2 411 = 1.70 %, branch 34 of 3 263 = 1.04 %.
- The app is higher by 0.66 points. But counts wobble even when nothing changes — remember Nilufar's months on Day 1. So is this gap **real**, or **luck**?
- Two stories fit these bars. Story 1: the app really is riskier. Story 2: **nothing is going on** — both channels share one FPD chance (the dashed line), and the gap is luck.
- A court has the same problem. It starts from the boring story — **innocent** — and drops it only when the evidence would be very hard to explain that way.
- A test does the same. The boring story is the null hypothesis, written H₀. The test assumes it is true, as a court assumes innocence.
- The other story is the alternative hypothesis, H₁. H₀ always holds the **=** sign; H₁ says **≠**, “different”.
- Your turn.
- A trial ends in one of two verdicts. **Guilty**: the data are too odd for H₀, so we **reject H₀**. **Not guilty**: not enough evidence, so we **fail to reject H₀**.
- Partner against branch: 1.12 % vs 1.04 %. The test finds no evidence of a difference — we fail to reject. But “not guilty” is not “innocent”: 1 425 partner loans are just too few to tell the two apart.
- Last one.

> 🎬 **Didn't get H₀ and H₁?** [StatQuest explains it · 4 min](https://youtu.be/0oc49DyA3hU?t=591&end=824)

### A world where only luck works — the p-value

(Animated explanation)
A world where only luck works
- To judge the gap, we play H₀ out. If the channel doesn't matter, every loan has the same FPD chance: all FPDs ÷ all loans = 1.32 %, the dashed line.
- Tap **Play one luck world**: all 5 674 loans roll the same 1.32 % dice. This pretend world is a luck world; the blue bars show what it gave each channel.
- Read the line under the picture: this world's app count, its branch count and its **gap**. Play a few more. The channels are identical by design — yet the gap is never exactly 0.
- Now each world also drops its gap as a dot on the line below. Right of 0: app came out higher; left of 0: branch did. The small triangle marks the newest world.
- Play 100 worlds at once. The dots pile up around 0, and most land within half a point of it. That pile is **luck's own shape** for groups this size.
- A thousand dots won't fit, so we count them in bars. Each bar is how many luck worlds gave a gap in that range: the taller the bar, the more often luck gives that gap.
- How to read it: the middle, 0, means “no gap” — luck's most common result. The further from the middle, the shorter the bars. A gap beyond ±1 point almost never comes from luck.
- Now our real gap: the orange line at +0.66. Does it sit in the thick middle of luck's pile, or out on its thin edge?
- The dashed line at −0.66 is the same distance the other way: branch higher by as much. The orange bars are the luck worlds that went as far as ours or further — either way.
- Read their share under the picture: about 3 in 100. That share is the p-value; exactly, p = 0.032. If nothing were going on, a gap like ours would be rare.
- The question everyone gets wrong once.
- Keep the one right sentence: **if H₀ were true**, data this extreme would turn up 3.2 % of the time. The three wrong readings in the strip are everywhere — even in reports.

> 🎬 **Didn't get the p-value?** [StatQuest explains it · 3 min](https://youtu.be/vemZtEM63GY?t=272&end=427)

**Now play.** The same idea with sliders — try the challenges.

**Now check yourself.**

### A ruler made of noise — z, and one tail or two

(Animated explanation)
A ruler made of noise
- Back in the luck world. Counting thousands of worlds works, but there is a shortcut — and it starts with the **width** of this pile. Play the worlds first.
- The read-out gives the pile's spread: about 0.31 points. That is the typical size of a luck gap — the standard error. Within ±1 SE: about 68 % of worlds.
- Within ±2 SE: about 95 %. So beyond 2 SE, in either direction, land only about 5 % of luck worlds — 1 in 20.
- Now measure our 0.66 with that ruler: it is 2.15 SEs from zero. That distance, in units of noise, is the test statistic — here it is called **z**.
- A rule of thumb for z: below 1 is everyday luck, about 2 is unusual, 3 or more is very rare. Ours, 2.15, lies just outside the shaded ±2 SE.
- The shortcut: luck's pile has the shape of Day 1's bell. The bell's two tails beyond ±2.15 SE hold 3.2 % — the same p as counting, no simulation. Φ reads the bell.
- Try the ruler.
- Where does 0.307 come from, without simulating? From the luck world's one shared chance, the pooled rate. We call it p: 1.32 %.
- Then the noise of a gap between n₁ = 2 411 and n₂ = 3 263 loans comes from the formula in the strip: 0.307 points — the same width the bars showed.
- Gap ÷ SE = 2.15: that is the whole two-proportion z-test. Swap the order — branch − app — and z is −2.15: the sign only tells which group came first.
- So far we counted **both** tails: “different, either way”. A one-sided test asks just “is app higher?” and counts one tail: half the p, 0.016.
- Last one.

### False alarms and misses — α, errors and power

(Animated explanation)
False alarms and misses
- Nilufar needs a yes or a no. So **before** she sees any data she draws a line: she will say “app is different” only if the gap lands beyond ±0.60 points.
- Why 0.60? Only 5 % of luck worlds cross it (read-out). That 5 % is the significance level, **α**: the line sits 1.96 SE out on each side.
- Our gap, the purple line, lies just past the line. In p language: reject H₀ when p is below α. 0.032 is below 0.05, so at α = 5 % Nilufar's answer is **yes**.
- Now look at the orange bars. In these worlds nothing was going on — and the test still says “app is worse”. A false alarm: a type I error. It happens in α = 5 % of luck worlds, by design.
- Now the other world: suppose the app **really** is worse — 1.70 % against 1.04 %, exactly what we saw. Play it: the gaps now pile up around 0.66, not around 0.
- The orange bars cross the line: there the test catches the real difference. Their share is the power — only about 57 %!
- The blue bars are misses: the app really is worse, but the gap stayed inside the line. That is a type II error; its chance is called **β**, here about 43 %.
- Guess first.
- At α = 1 % the line moves out to 0.79. Power drops to about 34 %, two misses in three — and our own 0.66 is now inside the line: no longer a “yes”.
- The cure for misses without extra false alarms: **more data**. With twice the loans the pile is narrower, the 5 % line moves in to 0.43, and power jumps to about 85 %.
- One rule ties it together: α is fixed **before** the data. “p = 0.07, so let's use 10 %” turns the test into a story.

**Now play.** The same idea with sliders — try the challenges.

**Now check yourself.**

### Signal or noise? A game

(Animated explanation)
Signal or noise? A game
- A game in five rounds. Each shows two groups' FPDs; you guess **real** or **luck**; then 1 000 luck worlds answer. Round 1: two small branches, 200 loans each — 6 FPDs against 2.
- 1 000 worlds with one shared chance of 2 %. About 1 in 5 gives a gap of 2 points or more, either way. Small groups wobble a lot: **luck**.
- Round 2: our own channels — app 41 of 2 411, branch 34 of 3 263.
- Only about 3 in 100 luck worlds go this far: p ≈ 0.03, below α = 5 %. **Real** — but by a hair; a few loans more or less could flip it.
- Round 3: partner against branch — 16 of 1 425 and 34 of 3 263.
- About 80 in 100 luck worlds go this far or further: p ≈ 0.80. Easily **luck** — and, from story 1, still not proof that the two are equal.
- Round 4: FPD by risk grade — grade B 30 of 3 084, grade A 10 of 1 667. Grade B's rate is 1.6 times grade A's.
- About 18 in 100 luck worlds go this far: p ≈ 0.18. **Luck** — “1.6 times” means little when the counts are small.
- Round 5: loans with **any late payment** — grade B 1 511 of 3 246, grade A 516 of 1 741.
- Luck's gaps stay within about ±5 points; ours is 17. Not one of 1 000 luck worlds gets near it: p ≈ 0. **Real**, beyond doubt.
- The game's lesson: a gap's size alone tells you little — 2 points was luck, 0.66 was real. What decides is the gap **measured against luck's own wobble**, and that wobble shrinks as the groups grow.

### Still on target? — one group against a number

(Animated explanation)
Still on target?
- A new kind of question: one group against a **fixed number**. The 2026 budget assumed an FPD rate of 1.5 %. The 2026 loans show 25 FPDs in 2 322: 1.08 %. Below budget, or luck?
- The luck world here: H₀ is true, so each of the 2 322 loans rolls a 1.5 % dice. Each bar counts the worlds by the FPD share they gave — piled around 1.5 %.
- Our 1.08 % is the orange line; the dashed one is as far on the other side. The orange bars — worlds at least that far out, either way — are about 1 in 10.
- The shortcut needs the noise of one rate. If H₀ is true, it comes from p₀ = 1.5 %, the rate H₀ claims — **not** from our 1.08 %: 0.25 points, the shaded ±1 SE.
- z = −1.68: 1.68 SEs below budget, p = 0.093, above 0.05. The data don't yet show that 2026 runs below budget. This is the one-proportion z-test.
- Your turn.
- The same works for an **average**. The scorecard vendor says applicants average 660. The bars: averages of 5 361 applicants in worlds where 660 is still true.
- The 2026 applicants averaged 658.6 (orange line). Averages of 5 361 people wobble far less than single scores: their SE is the people's spread s divided by √n — 0.81.
- Our average is 1.74 SEs below 660: p = 0.083, no evidence at 5 % that it moved. When the spread is estimated from the data, the statistic is called **t** — the one-sample t-test.
- z or t? Same idea, different line. The purple lines are the 5 % lines at ±1.96 SE — ours is inside. With the spread estimated from a **small** n, luck wobbles more, so t's line sits further out.
- Last one.

### Two groups, or the same group twice? — Welch and paired

(Animated explanation)
Two groups, or the same group twice?
- Two groups' **averages** now: credit scores of approved loans — app 683.2, branch 679.8, a gap of 3.4 points. The bars: the gaps luck gives if both channels share one true average.
- The pile's width, the SE, comes from both groups, and each keeps **its own** spread s. That is Welch's t-test. Student's older version assumes equal spreads.
- Our gap is 2.48 SEs out: p = 0.013, significant at 5 %. Welch loses almost nothing when the spreads happen to be equal, so it is the default.
- But significant isn't **big**. The shaded ±1 SE is only about 1.4 points, while people's scores spread about 52. A 3.4-point gap is 0.06 of that: Cohen's d = 0.06 — nothing.
- A trap waits in any two-group test.
- A different shape of data: FPD of the **same ten branches**, in 2025 and in 2026. Seen as two separate groups, the dots overlap a lot.
- The averages fell from 1.61 % to 1.03 %. But branches differ from each other far more than that, so a test of two independent groups sees lots of noise: p = 0.055, not significant.
- But every 2025 dot has a **partner**: the same branch in 2026. Join them: 9 of 10 lines go down. Bukhara falls from 3.20 % to 1.99 % — and is still the highest.
- A paired test keeps only the changes (right). The big differences **between** branches drop out, and the fall stands clear: p = 0.031.
- Which test?
- The question to ask every time: does each value in one group have a **partner** in the other? Yes — paired. No — independent, and then Welch.

> 🎬 **Didn't get the t-test?** [numiqo explains it · 1 min](https://youtu.be/VekJxtk4BYM?t=105&end=148)

### Three channels at once — chi-square

(Animated explanation)
Three channels at once
- Nur has three channels, not two. A fair first question: does FPD depend on the channel **at all**? App 1.70 %, branch 1.04 %, partner 1.12 %.
- If the channel didn't matter, every channel would have the book's rate, 1.28 % (dashed). Its **expected** FPDs = its loans × 91 ÷ 7 099: app 30.9, branch 41.8, partner 18.3.
- Compare seen with expected in every cell of the table: the app's FPD cell gives (41 − 30.9)² ÷ 30.9 = 3.30. Add all six cells, FPD and no FPD: χ² = 5.11.
- Its own luck world says: with three channels, a χ² of 5.11 or more turns up 7.8 % of the time. p = 0.078: across all three, **not** significant at 5 %. (Degrees of freedom: 2.)
- Two tests, two answers?
- With just two groups the table is 2 × 2, and χ² is simply **z squared** — the same test, the same p. Grade A against grade B: z = −1.34, χ² = 1.80, p = 0.18 both ways.
- One trap: on a 2 × 2 table scipy's chi-square applies Yates' correction unless told not to. Same data, p = 0.042 instead of 0.032 — so name the version you report.
- Last one.

**Now check yourself.**

### Big enough to matter? — size, grain and the report

(Animated explanation)
Big enough to matter?
- One gap, 0.66 points, three sizes of data. First with **a tenth** of our loans: 241 app, 326 branch. Luck's pile is wide, and our gap sits inside it — about half of the luck worlds go further.
- Now our real loans: the pile is about three times narrower, and only about 3 in 100 worlds reach 0.66 — p = 0.032.
- With ten times the loans the pile is so thin that 0.66 lies far outside it: p < 0.001. The same gap, three verdicts.
- So p tells how **clearly** we can see a gap, never how **big** it is: with enough rows every tiny gap becomes “significant”. Next to every p goes an effect size.
- For rates, give the size in a committee's units. The **difference**, +0.66 points, comes with its interval; times 1 000 it is about 6.6 extra FPDs per 1 000 app loans — a number someone can price.
- Or as a ratio, the relative risk. Grade C against grade A: 2.16 % ÷ 0.60 % = 3.6 — grade C loans default 3.6 times as often.
- Test at the right **grain**. Late payment, grade A against B: on payments z = −15.45, on loans z = −11.59. One loan's payments are not independent, so counting each one separately pretends to have about 7 times the evidence.
- Check the grain.
- Finally, the report: **one sentence, six parts**, always in the order of the strip. A committee decides on the size; the p only says the size isn't luck.
- Filled in: “App 1.70 % vs branch 1.04 % (+0.66 points, 95 % CI +0.05 to +1.33); two-sided two-proportion z-test, z = 2.15, p = 0.032; at α = 5 % app is higher — about 7 extra FPDs per 1 000 loans.”
- Two small habits. Write **p < 0.001**, never “p = 0.000”. And a big p — partner vs branch, p = 0.80; three channels, p = 0.078 — is **absence of evidence**: never “proven no different”, never “FPD does not depend on channel”.
- Last one.

**Now check yourself.**

**And the words of the day.**

## 2. Worked example — Nilufar's yes/no (15 min)

**1. Question and hypotheses — *H₀ and H₁*, *two-sided*, *α*.** Is the app channel's FPD30 probability different from the branch's? H₀: p_app = p_branch; H₁: ≠ — two-sided, because a better app channel would also change policy. α = 0.05, fixed now, before any p-value.

**First, press ▶ Run on this box once.** It loads the tools and the data that every Python box below uses.

```python
# the tools and the data from the full version of section 1 — run once
import math
import numpy as np
import pandas as pd
from statistics import NormalDist
Phi = NormalDist().cdf
f = pd.read_csv("data/powerbi/fct_first_instalment.csv", parse_dates=["disbursed_at"])
f["channel"] = f["product"].map({"MICRO": "app", "BNPL": "partner"}).fillna("branch")
f["year"] = f["disbursed_at"].dt.year
apps = pd.read_csv("data/raw/applications.csv")
gap = 41 / 2411 - 34 / 3263
p0 = 75 / 5674
se = math.sqrt(p0 * (1 - p0) * (1 / 2411 + 1 / 3263))
z = (gap - 0) / se
p0 = 75 / 5674
p = 0.0318
z = 2.147
s26 = apps.loc[apps["applied_at"].str[:4] == "2026", "credit_score"].dropna()
mu0 = 660
se = s26.std() / math.sqrt(len(s26))
t = (s26.mean() - mu0) / se
def welch_t(a, b):
    # SE of the difference: each group keeps its own variance
    se = math.sqrt(a.var() / len(a) + b.var() / len(b))
    t = (a.mean() - b.mean()) / se
    # normal tail: fine with hundreds per group
    return t, 2 * (1 - Phi(abs(t)))
sa = apps.loc[apps["channel"] == "app", "credit_score"].dropna()
sb = apps.loc[apps["channel"] == "branch", "credit_score"].dropna()
loans = pd.read_csv("data/raw/loans.csv").merge(apps[["application_id", "channel", "credit_score"]], on="application_id")
la = loans.loc[loans["channel"] == "app", "credit_score"].dropna()
lb = loans.loc[loans["channel"] == "branch", "credit_score"].dropna()
w = f[f["year"].isin([2025, 2026])].pivot_table(index="branch_name", columns="year", values="fpd30", aggfunc="mean") * 100
d = w[2026] - w[2025]
def one_prop_z(k, n, p0):
    # the noise of a rate IF H0 (rate = p0) is true — p0, not k / n
    se = math.sqrt(p0 * (1 - p0) / n)
    z = (k / n - p0) / se
    return z, 2 * (1 - Phi(abs(z)))
def two_prop_z(k1, n1, k2, n2):
    # the pooled rate: what H0 says both channels share
    p = (k1 + k2) / (n1 + n2)
    se = math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2))
    z = (k1 / n1 - k2 / n2) / se
    # z and the two-sided p-value
    return z, 2 * (1 - Phi(abs(z)))
z, p = two_prop_z(41, 2411, 34, 3263)
from statsmodels.stats.proportion import proportions_ztest, confint_proportions_2indep
ct = pd.crosstab(f["channel"], f["fpd30"])
obs = ct.to_numpy()
expected = np.outer(obs.sum(axis=1), obs.sum(axis=0)) / obs.sum()
chi2 = ((obs - expected) ** 2 / expected).sum()
d = (la.mean() - lb.mean()) / math.sqrt((la.var() + lb.var()) / 2)
g = f.merge(pd.read_csv("data/raw/loans.csv")[["loan_id", "risk_grade"]], on="loan_id")
z, p = two_prop_z(10, 1667, 44, 2034)
print('ready')
```

**2. The data.** 41 / 2 411 vs 34 / 3 263 (week 5's FPD30, payments de-duplicated, first due date ≤ as-of − 30 days). Two separate groups of loans, so the samples are *independent*, not paired.

**3. The test — *two-proportion z-test*, its *statistic* and *p-value*.** Two independent rates, 34–41 events per group (expected counts far above 5): the two-proportion z-test fits. **z = 2.147, p = 0.032** < α, so H₀ is rejected. Fisher's exact test (tomorrow) agrees: p = 0.034.

```python
# uses scipy and statsmodels: they load on the first ▶ Run (the notebook has
# them too)
k, n = np.array([41, 34]), np.array([2411, 3263])
# 2.147, 0.0318
z, p = proportions_ztest(k, n)
# +0.0005, +0.0133
lo, hi = confint_proportions_2indep(41, 2411, 34, 3263, method="newcomb")
# 1.04, 2.56
rr_lo, rr_hi = confint_proportions_2indep(41, 2411, 34, 3263, compare="ratio", method="log")
# odds ratio 1.64, p = 0.0344
stats.fisher_exact([[41, 2370], [34, 3229]])
# 0.0778 — the three-channel check
stats.chi2_contingency(pd.crosstab(f.channel, f.fpd30))[1]
```

**4. The size — *effect size*.** +0.66 points (95 % CI +0.05 to +1.33); RR 1.63 (1.04–2.56); **6.6 extra FPDs per 1 000 app loans**. At the 2026 pace (1 036 app loans in January–September, ~1 381 a year) that is ~9 extra FPDs a year on loans averaging 2.69 m: ~25 m soum of exposure, ~15 m of expected loss at 60 % LGD.

**5. The caveats that go in the note — *chi-square* and *assumptions*.** (a) The three-channel χ² is not significant (p = 0.078) and app vs branch was chosen as the most extreme pair — the evidence is **moderate**, not overwhelming. (b) App loans are all Micro, branch loans are Auto / Consumer / SME: the gap is channel *and* product; the data cannot separate them. (c) The interval of the difference starts at +0.05 points — consistent with almost nothing.

**6. The answer — *reporting a result*.** *"Yes — at the 5 % level the app's FPD30 is higher than the branch's (1.70 % vs 1.04 %, p = 0.03), about 7 extra first-payment defaults per 1 000 loans. The evidence is moderate and the money is small (~15 m soum a year), so the action is a cheap fix and a re-test, not closing the channel."*

---

## 3. Practice (50 min)

Every task has its own answer box. All the Python boxes of this page share one session: the box in the worked example (section 2, after step 1) loads `two_prop_z`, `one_prop_z`, `welch_t`, `Phi`, `f` (with `channel` and `year`), `apps` and `loans` — run it once before the first task. The questions follow the order of section 1. `data/python/week6/day3_starter.ipynb` has the same frames plus `x` (the payments) and the three TODO functions (`two_prop_ztest`, `relative_risk`, `cohens_d`) that the checkpoint reuses.

**P1.** *(H₀ and H₁)* Write H₀ and H₁, one- or two-sided, for: (a) "Has grade D's late-payment rate changed since last year?" (b) "Marketing claims the new app screen raises approval; it ships only if it does." (c) "Is FPD independent of region?"

**P2.** *(test statistic and p-value)* One branch's FPD30 is 0.9 points above the rest of the network; under H₀ the standard error of that gap is 0.5 points. Compute z and the two-sided p-value. Then say in one sentence what the p-value means.

**P3.** *(α, type I and type II errors)* Nilufar moves α from 5 % to 1 % for the app-vs-branch decision. What happens?

**P4.** *(one-sided vs two-sided)* For app vs branch, the one-sided p-value, to 4 decimals. When would Nilufar be allowed to quote it?

**P5.** *(one-sample t-test)* The pricing plan assumes an average Micro ticket of 2.8 m soum. Test it on the Micro loans disbursed in 2026: n, mean, t, two-sided p, and the 95 % interval of the mean.

**P6.** *(Welch t-test)* Welch t-test of applicants' credit scores, partner vs branch; then the same on **approved loans**. Add Cohen's d (your TODO `cohens_d`).

**P7.** *(paired vs independent samples)* Paired vs independent on the ten branches (2025 vs 2026 FPD30): both tests, the mean change, and one sentence on why the p-values differ.

**P8.** *(one-proportion z-test)* The partner contract promises FPD30 **below** 1.5 %. Partner loans show 16 FPDs in 1 425. Write H₀ and H₁ (one-sided — the contract question has one direction), then z and the one-sided p. Can Nilufar tell the partner the contract is met?

**P9.** *(two-proportion z-test)* `two_prop_ztest` (your TODO 1) for app vs partner and partner vs branch. Which pairs differ at 5 %?

**P10.** *(chi-square test of independence)* χ² test of FPD30 × risk grade (4 × 2). Statistic, df, p, the smallest expected count. Then grade A vs grade C as a two-proportion z-test.

**P11.** *(chi-square on a 2 × 2 table)* Show that a 2 × 2 χ² without continuity correction equals z² for app vs branch. What does scipy do by default, and which p do you report?

**P12.** *(checking assumptions — independent rows)* Late payment, grade A vs grade B: z-test on payments, then on loans (any late payment). Why do the z values differ so much?

**P13.** *(effect size)* Effect sizes for app vs branch FPD: difference with its 95 % CI, RR with its CI, extra FPDs per 1 000. Then translate into soum per year for the app channel.

**P14.** *(reporting a result in one sentence)* Write the one-sentence report for P6's applicants' test (partner 657.2 vs branch 659.6, Welch t = −1.72, p = 0.086). The difference is −2.4 points with a 95 % CI of −5.1 to +0.3.

> 🚀 **Stretch (optional, +5 XP).** **P15.** *(effect size vs p-value)* p depends on n. Keep the app and branch FPD **rates** fixed and multiply both n's by 10, then by 0.1. Compute z and p each time. Then write the sentence that explains to Bekzod why "p = 0.000 000 01" on a 10-million-row table proves nothing about importance.

### Mistakes people make

- "p = 0.032 means a 3.2 % chance that app and branch are the same."
- "p = 0.078, so FPD does not depend on channel" — absence of evidence, small n.
- Switching to one-sided after seeing the direction; choosing the pair to test after looking at the table.
- Student's t with very different variances — use Welch (`equal_var=False`, `T.TEST(…, 3)`).
- An independent test on paired data (or the reverse).
- Testing payments when the unit is the loan — rows that are not independent inflate z.
- Shapiro on 50 000 rows, p ≈ 0, "so I cannot use a t-test" — the CLT cares about n, the QQ plot about shape.
- A significant result reported without its size, or a big-sounding RR without its interval (1.63, but 1.04–2.56).
- A test across confounded groups (channel = product) reported as a channel effect.
- A p-value printed as `0.000` — write p < 0.001, and give the effect next to it.

---

## 4. Homework

**HW 6.1 is due today** in Day 1's hand-in box. **HW 6.2** (intervals and the chart, Day 2) is due on Day 5. Today's TODO functions (`two_prop_ztest`, `relative_risk`, `cohens_d`) are practice, not graded, but the checkpoint uses them — finish them now and check two of their results here.

**H1.** What does your `relative_risk(41, 2411, 34, 3263)` return (2 decimals)?

**H2.** And `two_prop_ztest(10, 1667, 44, 2034)` — grade A vs grade C — the z statistic (2 decimals)?

---

## 5. Self-check

Three questions, one at a time. Wrong? The explanation points to the part of section 1 to reread.

---

## 6. Company corner <span class="badge company">The risk-committee note</span>

A committee reads six lines, in this order, and nothing else. Each line is a habit: the question before the answer, the definition before the number, the interval with the number, the test with its name, the size in the committee's units, a decision someone can act on.

| # | Line | Filled for app vs branch FPD30 |
|---|---|---|
| 1 | **Question** | Do loans originated in the app have a higher first-payment default rate than loans originated in branches? |
| 2 | **Metric definition** | FPD30 = first instalment not fully paid within 30 days of its due date; loans whose first due date ≤ 2026-09-01 (as of 2026-10-01); payments de-duplicated; channel = channel of the application. |
| 3 | **Numbers with 95 % CIs** | App 41 / 2 411 = **1.70 %** (Wilson 1.26–2.30 %); branch 34 / 3 263 = **1.04 %** (0.75–1.45 %); difference **+0.66 points** (+0.05 to +1.33). |
| 4 | **Test and p-value** | Two-sided two-proportion z-test: z = 2.15, **p = 0.032** (Fisher exact 0.034). Caveat: the three-channel χ² gives p = 0.078 and app vs branch is the most extreme pair. |
| 5 | **Effect in business terms** | **+6.6 FPDs per 1 000 app loans** (RR 1.63, CI 1.04–2.56) ≈ 9 extra FPDs a year at the 2026 pace, ~25 m soum exposure, ~15 m expected loss. App loans are all Micro: channel and product cannot be separated. |
| 6 | **Decision** | **Yes, app FPD is higher — moderately, and cheaply fixable.** Keep the channel; run a first-instalment reminder test on app loans (sample size by Thursday); re-test on Q4 2026 vintages; review in January. |

What the note does **not** say: "significant" without the size, "proved", "no difference in partner" (p = 0.80 is absence of evidence), or anything about Micro vs other products that the data cannot separate. And what Nilufar must be able to answer when the CFO asks *"so what is the chance you are wrong?"*: if there were no real difference, a gap this large would appear about 3 times in 100 — and the evidence that the gap is *big* is weak, which is why the decision is cheap and reversible.

Sort the sentences: which ones belong in the note?

> 🎯 **Interview version.** *"Two groups have default rates 1.70 % and 1.04 %. Is the difference significant?"* — Ask for n; with 2 411 and 3 263 loans, a two-proportion z-test (or χ² / Fisher) gives p ≈ 0.03; report the difference with its CI (+0.05 to +1.33 points) and in business units; mention whether the comparison was pre-specified and whether the groups differ in other ways (product mix) before calling it a channel effect.

**Say it like in an interview.** *"Two groups have default rates of 1.70 % and 1.04 %. Is the difference significant?"* — answer in 3–5 sentences, as you would to an interviewer.

Tomorrow: when the t-test's assumptions fail (skewed days-late, small branches), when you test ten things at once, and Jasur's question — is 2 000 loans enough to test the SMS reminder?

---

## Going further — the full version, with Python (optional, 60 min)

The same ideas as the stories, written out in full with Python and Excel, plus checking assumptions (QQ plot, Shapiro, Levene), the Excel layouts of each test and “putting it together” on grade A vs grade C. Optional: nothing here counts toward the day.

Press ▶ Run on this block first. It loads the data and the tools that every box on this page uses.

```python
import math
import numpy as np
import pandas as pd
from statistics import NormalDist
# the standard normal CDF, Φ — turns a z into a p-value
Phi = NormalDist().cdf

# week 5's FPD frame: 7 099 loans, fpd30 = 0/1
f = pd.read_csv("data/powerbi/fct_first_instalment.csv", parse_dates=["disbursed_at"])
# app = Micro only, partner = BNPL only
f["channel"] = f["product"].map({"MICRO": "app", "BNPL": "partner"}).fillna("branch")
f["year"] = f["disbursed_at"].dt.year
# 14 000 applications; 388 have no credit score
apps = pd.read_csv("data/raw/applications.csv")
# app 41 / 2 411 · branch 34 / 3 263 · partner 16 / 1 425
print(f.groupby("channel")["fpd30"].agg(["sum", "size"]))
```

Three channels, three FPD counts: app 41 of 2 411 loans (1.70 %), branch 34 of 3 263 (1.04 %), partner 16 of 1 425 (1.12 %). Most of this page asks one question about them: is the app's higher rate real, or noise?

### H₀ and H₁ — the courtroom logic

**What it is.** A **hypothesis test** (*проверка статистических гипотез*) is a rule for choosing between two statements about the population, with a known error rate. The **null hypothesis** H₀ (*нулевая гипотеза*) says "nothing is going on". The **alternative** H₁ (*альтернативная гипотеза*) is what you will claim if the data make H₀ hard to believe.

**How to write it.**

```text
H₀: p_app = p_branch
  "nothing is going on" —
  H₀ always holds the "="
H₁: p_app ≠ p_branch
  what you claim if H₀ falls
decision: reject H₀
  or fail to reject H₀
  — never "accept H₀"
```

A test works like a trial:

| Courtroom | Hypothesis test |
|---|---|
| presumed innocent | H₀ is assumed true |
| the evidence | the data |
| guilty beyond reasonable doubt | reject H₀: data like ours would be rare if H₀ were true |
| "not guilty" | fail to reject H₀ — not proven, which is not "innocent" |

For Nilufar: H₀ says the app and branch channels share one FPD rate; H₁ says they do not.

**When you use it.**
- Before every test: write H₀ and H₁ in words and in symbols, before you look at a p-value.
- "Is A different from B?", "Did X change?", "Is the rate still at target?" — each becomes an H₀ with an "=".

> ⚠️ **Watch out.** "Fail to reject H₀" never means "H₀ is true". Partner vs branch gives p = 0.80: with 1 425 partner loans the data cannot tell the two apart. That is not proof that they are equal.

**Your turn.** Bekzod asks: "Did FPD30 change between 2025 and 2026?" Which pair of hypotheses fits?

### The test statistic — distance from H₀ in units of noise

**What it is.** A **test statistic** (*статистика критерия*) is one number that says how far the data are from H₀, measured in units of the noise you would see if H₀ were true. Most of today's statistics have one shape: (what you observed − what H₀ says) / standard error.

**How to write it.** In words: the observed gap, minus the gap H₀ expects (zero), divided by the gap's standard error under H₀.

```python
# observed: app rate − branch rate
gap = 41 / 2411 - 34 / 3263
# the one rate H0 says both channels share (pooled)
p0 = 75 / 5674
# the noise of the gap if H0 were true (the two-proportion section explains it)
se = math.sqrt(p0 * (1 - p0) * (1 / 2411 + 1 / 3263))
z = (gap - 0) / se                                    # H0 says the gap is 0
print(round(gap * 100, 2), round(se * 100, 3), round(z, 2))   # 0.66 0.307 2.15
```

The gap is 0.66 points and the noise is 0.307 points, so the gap is 2.15 noise-units away from H₀: z = 2.15.

| \|z\| | how unusual if H₀ is true |
|---|---|
| below 1 | ordinary — happens all the time |
| about 2 | unusual — about 1 sample in 20 goes this far |
| 3 or more | very rare — about 3 samples in 1 000 |

**When you use it.**
- Every test turns the data into one statistic: z for rates, t for means, χ² for tables.
- A statistic near 0 agrees with H₀; a large one (either sign) argues against it.

**Your turn.** Two branches' FPD rates differ by 0.40 points; the standard error of that gap under H₀ is 0.25 points. What is z?

### The p-value — one right definition, three wrong ones

**What it is.** The **p-value** (*p-значение*) is *the probability, computed assuming H₀ is true, of getting a test statistic at least as extreme as the one observed.* Small p: data like ours would be rare in the H₀ world.

| The p-value says | The p-value does **not** say |
|---|---|
| how often data this extreme appear **if** H₀ is true | the probability that H₀ is true |
| | the probability that the result is "due to chance" |
| | how big or important the effect is |

**How to write it.** Two ways. The formula: two-sided p = 2 · (1 − Φ(|z|)). The definition: build the H₀ world by simulation and count how often it looks as extreme as ours.

```python
# 0.0318 — the formula: both tails beyond |z|
print(round(2 * (1 - Phi(abs(2.147))), 4))

# the H0 world: both channels at the pooled rate 1.322 %
rng = np.random.default_rng(2026)
p0 = 75 / 5674
diff = rng.binomial(2411, p0, 100_000) / 2411 - rng.binomial(3263, p0, 100_000) / 3263
# 0.0321 — the share of H0 samples with a gap ≥ 0.66 points either way
print(np.mean(np.abs(diff) >= 41/2411 - 34/3263))
```

If both channels had the same FPD rate, a gap of 0.66 points or more, in either direction, would appear in about 3.2 % of samples of this size: p = 0.032.

**When you use it.**
- To decide (next subsection: compare p with α).
- To say how surprising the data are under H₀ — never how likely H₀ is.

> ⚠️ **Watch out.** "p = 0.032" never means "a 3.2 % chance that H₀ is true" or "a 3.2 % chance it is luck". The condition comes first — *if* H₀ is true, data this extreme turn up 3.2 % of the time — exactly like P(D | A) on Day 1. And p > 0.05 is not proof of no difference.

### α, type I and type II errors, power

**What it is.** The **significance level** α (*уровень значимости*) is the false-alarm rate you accept, chosen **before** you see the data — 5 % by convention. You reject H₀ when p < α. Two mistakes are possible:

| | H₀ true (no real difference) | H₀ false (a real difference) |
|---|---|---|
| reject H₀ | **type I error** (*ошибка I рода*), probability α — "app is worse" when it is not | correct — probability = **power** (*мощность*) = 1 − β |
| fail to reject | correct | **type II error** (*ошибка II рода*), probability β — a real deterioration missed |

**Power** is the chance of catching a real effect. Day 4 shows how n, the effect size and α set it.

**How to write it.** The decision rule is one line:

```python
# fixed BEFORE looking at the data
alpha = 0.05
p = 0.0318                                      # app vs branch, two-sided
print("reject H0" if p < alpha else "fail to reject H0")   # reject H0
```

At α = 5 % the app-vs-branch p of 0.032 rejects H₀; at α = 1 % the same data would not.

**When you use it.**
- α = 5 % by default; 1 % when a false alarm is expensive (closing a channel); 10 % for a cheap first screen.
- Lowering α buys fewer false alarms with more misses. Only more data reduces both.

> ⚠️ **Watch out.** α chosen after seeing p is not α. "p = 0.07, so let us use 10 %" turns the test into a story.

### One-sided or two-sided

**What it is.** A **two-sided** test (*двусторонний критерий*) asks "different in either direction" and counts both tails. A **one-sided** test (*односторонний критерий*) asks only "higher" (or only "lower") and counts one tail, so its p-value is half as large.

**How to write it.**

```python
z = 2.147  # app vs branch
# 0.0159 — one-sided, H1: p_app > p_branch (upper tail only)
print(round(1 - Phi(z), 4))
# 0.0318 — two-sided, H1: p_app ≠ p_branch (both tails)
print(round(2 * (1 - Phi(abs(z))), 4))
```

The same z gives a one-sided p of 0.016 and a two-sided p of 0.032.

**When you use it.**

| | Two-sided | One-sided |
|---|---|---|
| H₁ | ≠ | > (or <) |
| use when | a result in either direction would change what you do | the other direction leads to the same action as "no difference", and you wrote that down **before** the data |
| Nilufar's committee | ✓ — a much *better* app channel would also change policy | ✗ |

> ⚠️ **Watch out.** Switching to one-sided after you see which group is higher halves the p-value for free. It is the cheapest form of p-hacking. Default to two-sided.

**Your turn.** When is a one-sided test allowed?

### One-sample test for a mean — z or t

**What it is.** A **one-sample test** (*одновыборочный критерий*) compares the mean of one sample with a fixed number μ₀: a target, a benchmark, a value from a contract. The statistic is **t = (x̄ − μ₀) / (s / √n)**. It is called **z** when the population σ is known (almost never) and **t** when you estimate it with the sample's s (always in practice); t has n − 1 **degrees of freedom**.

**How to write it.** In words: the sample mean minus the H₀ value, divided by the standard error of the mean. One line of context: the scorecard vendor says applicants average 660 points — is that still true in 2026?

```python
# 2026 applicants with a score
s26 = apps.loc[apps["applied_at"].str[:4] == "2026", "credit_score"].dropna()
# H0: the 2026 average is still 660
mu0 = 660
# standard error of the mean: s / √n
se = s26.std() / math.sqrt(len(s26))
t = (s26.mean() - mu0) / se  # the test statistic
print(len(s26), round(s26.mean(), 1), round(se, 2), round(t, 2), round(2 * (1 - Phi(abs(t))), 3))
# 5361 658.6 0.81 -1.74 0.083 — with 5 360 df the t tail and the normal tail are
# the same
# small n: stats.ttest_1samp(x, 660) uses the t distribution (scipy)   Excel:
# =T.DIST.2T(ABS(t), COUNT(r) - 1)
```

5 361 applicants average 658.6, which is 1.4 points below 660 — that is 1.74 standard errors, p = 0.083, so there is no evidence at 5 % that the average moved.

**When you use it.**
- "Is the average still at the target?" — average ticket against the plan, average score against the vendor's value, average days late against an SLA.
- z or t? The difference matters only at small n. Two-sided 5 % cut-offs:

| n | 5 | 10 | 30 | 100 | thousands |
|---|---|---|---|---|---|
| t cut-off (df = n − 1) | 2.78 | 2.26 | 2.05 | 1.98 | 1.96 = z |

> ⚠️ **Watch out.** With n = 10, using the normal's 1.96 instead of t's 2.26 makes you reject too often. Below about 30 per group use the t distribution (`stats.t`, `T.DIST.2T`) — and look at the data's shape (Day 4).

**Your turn.** Same question for 2026 **partner** applicants only: is their average credit score 660?

### Two-sample t-test — Welch by default

**What it is.** The **two-sample t-test** (*двухвыборочный t-критерий*) compares the means of two independent groups. **Student's** version (*t-критерий Стьюдента*) assumes both groups have the same variance. **Welch's** version (*t-критерий Уэлча*) does not, and loses almost nothing when they are equal — so use Welch by default.

**How to write it.** In words: the difference in means, divided by the standard error of that difference, where each group keeps its own variance: t = (x̄₁ − x̄₂) / √(s₁²/n₁ + s₂²/n₂).

```python
def welch_t(a, b):
    # SE of the difference: each group keeps its own variance
    se = math.sqrt(a.var() / len(a) + b.var() / len(b))
    t = (a.mean() - b.mean()) / se
    # normal tail: fine with hundreds per group
    return t, 2 * (1 - Phi(abs(t)))

# applicants, app
sa = apps.loc[apps["channel"] == "app", "credit_score"].dropna()
# applicants, branch
sb = apps.loc[apps["channel"] == "branch", "credit_score"].dropna()
# 661.0 659.6 [1.233, 0.218]
print(round(sa.mean(), 1), round(sb.mean(), 1), [round(float(v), 3) for v in welch_t(sa, sb)])

loans = pd.read_csv("data/raw/loans.csv").merge(apps[["application_id", "channel", "credit_score"]], on="application_id")
# approved loans, app
la = loans.loc[loans["channel"] == "app", "credit_score"].dropna()
# approved loans, branch
lb = loans.loc[loans["channel"] == "branch", "credit_score"].dropna()
# 683.2 679.8 [2.482, 0.013]
print(round(la.mean(), 1), round(lb.mean(), 1), [round(float(v), 3) for v in welch_t(la, lb)])
# scipy: stats.ttest_ind(sa, sb, equal_var=False)   Excel: =T.TEST(r1, r2, 2, 3)
# (2 = two-tailed, 3 = unequal variances)
```

| credit score | app | branch | Welch t | p |
|---|---|---|---|---|
| applicants | 661.0 | 659.6 | 1.23 | 0.218 |
| approved loans | 683.2 | 679.8 | 2.48 | 0.013 |

App and branch applicants arrive with the same scores (p = 0.22); among approved loans the app's 3.4-point lead is significant (p = 0.013), but on a scale whose sd is 52 it is tiny — the effect-size subsection measures it.

**When you use it.**
- "Is the average X different between two groups?" — scores, tickets, days late, two independent groups.
- Student vs Welch: always Welch (`equal_var=False`). It is right when variances differ and almost identical when they do not.

> ⚠️ **Watch out.** Welch on principal by channel gives t = −43, p ≈ 0 — and means nothing. App loans are all Micro, partner loans all BNPL, branch loans Auto, Consumer and SME: channel and product are **confounded** (*смешаны*), and no test separates them. Nilufar's FPD gap is also a Micro-vs-other-products gap.

**Your turn.** Approved loans: app mean 683.16 (sd 51.70, n = 2 598), branch mean 679.80 (sd 53.07, n = 3 491). Compute Welch's t from these summaries, to 2 decimals.

### Paired vs independent samples

**What it is.** **Paired samples** (*связанные (парные) выборки*) come in pairs: each value in one group has a partner in the other — the same branch in two years, the same customer before and after. A **paired t-test** works on the **differences** inside each pair. That removes the variation between units, which an independent test counts as noise.

**How to write it.** In words: compute one difference per pair, then run a one-sample t-test of those differences against 0. Example: FPD30 of the same ten branches, 2025 vintages vs 2026 vintages.

```python
w = f[f["year"].isin([2025, 2026])].pivot_table(index="branch_name", columns="year", values="fpd30", aggfunc="mean") * 100
# ten differences, one per branch
d = w[2026] - w[2025]
# -0.58 -2.56 — the paired t statistic
print(round(d.mean(), 2), round(d.mean() / (d.std() / math.sqrt(len(d))), 2))
# with only 9 df the p-value needs the t distribution — scipy (it loads on the
# first run):
print(stats.ttest_rel(w[2026], w[2025]))  # t = -2.56, p = 0.031
# t = -2.05, p = 0.055 — the wrong test throws away the pairing
print(stats.ttest_ind(w[2026], w[2025]))
```

The ten branches fell by 0.58 points on average; paired, that gives t = −2.56 and p = 0.031, while the unpaired test on the same numbers gives p = 0.055.

**When you use it.**

| | Paired | Independent |
|---|---|---|
| the data | the same units measured twice | two separate groups of units |
| example | ten branches, 2025 and 2026 | app loans vs branch loans |
| test | `ttest_rel`, `T.TEST(…, 2, 1)` | Welch, `T.TEST(…, 2, 3)` |

> ⚠️ **Watch out.** Running an independent test on paired data wastes the pairing: a branch with a high rate in 2025 tends to stay high, and that spread hides the change. Here it turns p = 0.031 into 0.055.

**Your turn.** Which comparison is paired?

### Test for one proportion — z

**What it is.** The **one-proportion z-test** (*z-критерий для одной доли*) compares a sample's rate p̂ = k / n with a fixed rate p₀: a budget, a target, a rate from a contract. The statistic is z = (p̂ − p₀) / √(p₀(1 − p₀) / n).

**How to write it.** In words: the observed rate minus the H₀ rate, divided by the noise a rate would have if H₀ were true. One line of context: the 2026 budget assumed FPD30 of 1.5 %; the 2026 vintages show 25 FPDs in 2 322 loans.

```python
def one_prop_z(k, n, p0):
    # the noise of a rate IF H0 (rate = p0) is true — p0, not k / n
    se = math.sqrt(p0 * (1 - p0) / n)
    z = (k / n - p0) / se
    return z, 2 * (1 - Phi(abs(z)))                # z and the two-sided p-value

print([round(v, 3) for v in one_prop_z(25, 2322, 0.015)])   # [-1.678, 0.093]
# Excel: =(25/2322 - 0.015) / SQRT(0.015*(1-0.015)/2322), then
# =2*(1-NORM.S.DIST(ABS(z),TRUE))
```

2026 runs at 1.08 %, 0.42 points under budget — 1.68 standard errors, p = 0.093, so the data do not yet show at 5 % that 2026 is below the 1.5 % budget.

**When you use it.**
- "Is this rate at the target?" — an FPD rate against the budget, an approval rate against a partner's contract, a fraud rate against the vendor's claim.
- It needs n·p₀ ≥ 10 and n·(1 − p₀) ≥ 10; with fewer expected events use the exact binomial (Day 1's `at_least`, Day 4).

> ⚠️ **Watch out.** The test's SE uses **p₀**, the rate H₀ claims. Yesterday's confidence interval used p̂. Mixing them gives a slightly wrong z — and a test that disagrees with its own H₀.

**Your turn.** Grade C was priced for an FPD30 of 1.5 %. It shows 44 FPDs in 2 034 loans. What is z, to 2 decimals?

### Test for two proportions — z

**What it is.** The **two-proportion z-test** (*z-критерий для двух долей*) compares the rates of two independent groups. Under H₀ both share one rate, so the SE uses the **pooled** rate of both groups together.

**How to write it.**

```text
pooled p = (k₁ + k₂) / (n₁ + n₂)
SE = √( p(1 − p) (1/n₁ + 1/n₂) )
z = (p̂₁ − p̂₂) / SE

app vs branch:
  pooled = 75 / 5 674 = 1.322 %
  SE = 0.307 points
  z = (1.700 − 1.042) / 0.307
    = 2.147
```

```python
def two_prop_z(k1, n1, k2, n2):
    # the pooled rate: what H0 says both channels share
    p = (k1 + k2) / (n1 + n2)
    se = math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2))
    z = (k1 / n1 - k2 / n2) / se
    # z and the two-sided p-value
    return z, 2 * (1 - Phi(abs(z)))

z, p = two_prop_z(41, 2411, 34, 3263)
print(round(z, 3), round(p, 4))  # 2.147 0.0318
```

App vs branch: z = 2.15, p = 0.032 — at α = 5 % the two FPD rates differ.

The same in statsmodels (optional: it loads an extra package on the first run):

```python
from statsmodels.stats.proportion import proportions_ztest, confint_proportions_2indep
z, p = proportions_ztest([41, 34], [2411, 3263])
# 2.147 0.0318
print(round(z, 3), round(p, 4))
lo, hi = confint_proportions_2indep(41, 2411, 34, 3263, method="newcomb")
# difference: +0.05 to +1.33 points
print(round(100 * lo, 2), round(100 * hi, 2))
```

In Excel, one row per channel and four formula cells:

| | A | B | C |
|---|---|---|---|
| 1 | | FPD | n |
| 2 | app | 41 | 2411 |
| 3 | branch | 34 | 3263 |
| 5 | pooled | `=(B2+B3)/(C2+C3)` → 0.01322 | |
| 6 | SE | `=SQRT(B5*(1-B5)*(1/C2+1/C3))` → 0.00307 | |
| 7 | z | `=(B2/C2-B3/C3)/B6` → 2.147 | |
| 8 | p (two-sided) | `=2*(1-NORM.S.DIST(ABS(B7),TRUE))` → 0.0318 | |

**When you use it.**
- "Is the rate different between two groups?" — FPD by channel, approval by product, conversion of A vs B.

| | One-proportion z | Two-proportion z |
|---|---|---|
| compares | one rate with a fixed number p₀ | two observed rates |
| SE uses | p₀ | the pooled rate of both groups |

> ⚠️ **Watch out.** "The two intervals overlap, so there is no difference" is wrong. Yesterday the Wilson intervals of app and branch overlapped (1.26–1.45 %), and still the difference is significant: the SE of a difference, √(SE₁² + SE₂²) = 0.318 points, is smaller than SE₁ + SE₂ = 0.441. Test the difference itself; its 95 % interval (+0.05 to +1.33 points) excludes 0.

**Your turn.** Grade A vs grade B: 10 FPDs in 1 667 loans against 30 in 3 084. What is z (2 decimals), and do they differ at 5 %?

### Chi-square test of independence

**What it is.** The **chi-square test of independence** (*критерий хи-квадрат Пирсона*) asks whether two categorical variables are related. It compares the counts in a **contingency table** (*таблица сопряжённости*) with the counts you would expect if they were independent.

**How to write it.** In words: expected count = row total × column total / grand total; χ² = Σ (observed − expected)² / expected; degrees of freedom = (rows − 1)(columns − 1).

```python
# app 2370/41 · branch 3229/34 · partner 1409/16
ct = pd.crosstab(f["channel"], f["fpd30"])
obs = ct.to_numpy()
# row total × column total / grand total
expected = np.outer(obs.sum(axis=1), obs.sum(axis=0)) / obs.sum()
chi2 = ((obs - expected) ** 2 / expected).sum()
print(expected.round(1))
# 5.108 0.0778 — with 2 df the p-value is e^(−χ²/2)
print(round(chi2, 3), round(math.exp(-chi2 / 2), 4))
# scipy (the notebook): chi2, p, dof, expected =
# scipy.stats.chi2_contingency(ct)   Excel: =CHISQ.TEST(observed_range,
# expected_range)
```

| channel | observed FPD | expected FPD | observed no FPD | expected no FPD | (O − E)² / E, FPD cell |
|---|---|---|---|---|---|
| app | 41 | 30.9 | 2 370 | 2 380.1 | 3.30 |
| branch | 34 | 41.8 | 3 229 | 3 221.2 | 1.46 |
| partner | 16 | 18.3 | 1 409 | 1 406.7 | 0.28 |

χ² = 5.11 on 2 df, p = 0.078: across all three channels, the FPD differences are not significant at 5 % — only the app's 41 against an expected 30.9 is far off, and that is not enough.

**When you use it.**
- "Does Y depend on X?" for two categorical variables: FPD × channel, late payment × grade, approval × region.
- Three or more groups at once. On a 2 × 2 table χ² *is* the two-proportion z-test: χ² = 4.610 = 2.147², same p = 0.0318.

| | χ² on the 3 × 2 table | z-test app vs branch |
|---|---|---|
| question | do the three channels differ at all? | do these two differ? |
| result | p = 0.078 | p = 0.032 |

The two do not contradict each other. The z-test answers a narrower question — and the pair (the two extremes) was chosen after seeing the table, which is why the evidence counts as moderate.

> ⚠️ **Watch out.** χ² needs expected counts of about 5 or more in every cell (else Fisher's exact test, Day 4). And scipy applies **Yates' correction** on a 2 × 2 table by default (p = 0.042 here instead of 0.032) — name the version you report.

**Your turn.** Under independence, how many FPDs would the partner channel be expected to have, to 1 decimal?

### Checking assumptions — normality of what, independence of what

**What it is.** Every test rests on **assumptions** (*предпосылки критерия*). Two matter most. **Independent rows**: one observation must not drive another. **Normality** — of the **sampling distribution of the mean**, not of the data (as the quiz of RU lesson 5.4 puts it: *normality of the statistic, e.g. the mean*). With n in the hundreds the CLT delivers it even for skewed data; with n = 10 and skewed money it does not.

**How to write it.** The tools: the **QQ plot** (always), **Shapiro–Wilk** `stats.shapiro` (*критерий Шапиро–Уилка*) on a sample of a few hundred, **Levene** `stats.levene` (*критерий Левена*) for equal variances — or skip it and use Welch.

```python
# (shape only — not meant to run)
pa = loans.loc[loans.channel == "app", "principal"]
# the picture first: an S with steps, not a line (flat, round tickets)
stats.probplot(pa, dist="norm", plot=plt)
# p = 1.2e-12: not normal — and with n = 2 669 the CLT does not care
stats.shapiro(pa.sample(500, random_state=2026))
# p = 0.77: equal variances (Welch would not have needed it)
stats.levene(sa, sb)
# 0.03, 2 669 — symmetric and many: the mean's interval is safe
stats.skew(pa), len(pa)
```

Shapiro says the app principals are not normal (p = 1.2 × 10⁻¹²), and the t-test on 2 669 of them is still fine: the mean of 2 669 values is normal enough.

**Independence on real data.** Late payment × grade on 52 850 clean payments: A 5.09 % · B 9.82 % · C 19.62 % · D 35.60 %, χ² = 2 595, df 3, p ≈ 0. But a loan contributes 7.1 payments on average, and payments of one loan are not independent. At the **loan** level (share of loans with any late payment: A 29.6 · B 46.5 · C 69.0 · D 85.6 %): χ² = 771, p ≈ 10⁻¹⁶⁷. Same verdict, honest grain.

**When you use it.**
- n large (hundreds per group) → t / Welch is fine for means, whatever Shapiro says.
- n small and the QQ plot bent, or a few huge values → Mann–Whitney or a permutation test (Day 4).
- The question is about a median or a "typical" value → not a t-test at all.

> ⚠️ **Watch out.** Shapiro on thousands of rows rejects deviations nobody cares about, and "p ≈ 0, so no t-test" is wrong. Look at the QQ plot and at n. And test at the unit that was sampled — the loan, not its payments.

**Your turn.** 2 669 app principals; Shapiro p = 1.2 × 10⁻¹². You want to test whether their mean equals 2.7 m. What do you do?

### Effect size — significance is not importance

**What it is.** A p-value says whether you can see an effect. An **effect size** (*размер эффекта*) says how big it is, in units that matter. For rates: the **difference**, the **relative risk** (*относительный риск*) and the business unit — extra events per 1 000. For means: **Cohen's d** = difference / pooled sd (0.2 small, 0.5 medium, 0.8 large). For a χ² table: **Cramér's V**.

**How to write it.**

```python
diff = 41 / 2411 - 34 / 3263  # difference in rates
# relative risk: how many times higher
rr = (41 / 2411) / (34 / 3263)
# 0.66 1.63 6.6 — points, ×, extra FPDs per 1 000
print(round(diff * 100, 2), round(rr, 2), round(diff * 1000, 1))
# Cohen's d: difference in sd units
d = (la.mean() - lb.mean()) / math.sqrt((la.var() + lb.var()) / 2)
# 0.06 — approved-loan scores, app vs branch: negligible
print(round(d, 2))
```

The app's FPD is 0.66 points higher (95 % CI +0.05 to +1.33), 1.63 times the branch rate (CI 1.04–2.56), about 6.6 extra FPDs per 1 000 loans. The significant score gap among approved loans is d = 0.06 — nothing. Late payment × grade has Cramér's V = 0.22, a moderate association.

**When you use it.**
- Next to every p-value — a committee decides on the size, not on p.
- To compare effects measured on different scales (d, V). Day 4 develops effect size and power together.

> ⚠️ **Watch out.** The same p-value can sit on a huge or a trivial effect; n decides which. p ≈ 0 on 52 850 rows (χ² = 2 595) says "clearly visible", not "important".

**Your turn.** Grade C has 44 FPDs in 2 034 loans, grade A 10 in 1 667. How many extra FPDs per 1 000 loans does grade C have, to 1 decimal?

### Reporting a result in one sentence

**What it is.** A test result is reported as **one sentence with six parts**, in a fixed order: the groups and their estimates, the difference with its interval, the test by name, the statistic, the p-value, the conclusion with the effect in business units.

**How to write it.** The template, then reading what scipy returns:

```text
[Group A] had [estimate] vs [estimate]
for [group B]
(difference [d], 95 % CI [lo, hi]);
a [named test] gives
[statistic] = [value], p = [value];
[conclusion at the α chosen in advance],
[effect in business units].
```

```python
# (shape only — not meant to run)
r = stats.ttest_ind(sa, sb, equal_var=False)
# 1.233, 0.218, 10 451 — Welch's df is fractional, that is normal
r.statistic, r.pvalue, r.df
# the interval of the difference in means: report it too
r.confidence_interval()
```

Filled for app vs branch: *"App loans had FPD30 1.70 % vs 1.04 % for branch loans (difference +0.66 points, 95 % CI +0.05 to +1.33); a two-sided two-proportion z-test gives z = 2.15, p = 0.032; at α = 5 % the app's rate is higher, about 7 extra FPDs per 1 000 loans."*

**When you use it.**
- Every time a test leaves your notebook: an email, a slide, a committee note, an exam answer.
- Round p to two significant digits (0.032, 0.00008); never "p = 0.000" — write "p < 0.001".

> ⚠️ **Watch out.** "Significant (p < 0.05)" with no size, no interval and no test name is not a result. The reader cannot tell 0.66 points from 6.6.

**Your turn.** Which sentence reports grade C vs grade A correctly?

### Putting it together

One request, every step of the day: *"Is FPD30 different between grade A and grade C?"*

```python
# 1 hypotheses  H0: p_A = p_C   H1: p_A ≠ p_C (two-sided)      2 alpha = 0.05,
# fixed now
g = f.merge(pd.read_csv("data/raw/loans.csv")[["loan_id", "risk_grade"]], on="loan_id")
# A 10 / 1 667 · B 30 / 3 084 · C 44 / 2 034 · D 7 / 314
print(g.groupby("risk_grade")["fpd30"].agg(["sum", "size"]))
# 3 two independent rates → two-proportion z-test
z, p = two_prop_z(10, 1667, 44, 2034)
# -3.95 7.9e-05      4 p < alpha → reject H0
print(round(z, 2), f"{p:.1e}")
# 15.6 3.6   5 the effect size
print(round((44 / 2034 - 10 / 1667) * 1000, 1), round((44 / 2034) / (10 / 1667), 1))
```

Read it with the day's questions: H₀ holds the "=", the test is two-sided because both directions would matter, α was fixed first, the data are two independent rates so the two-proportion z-test fits, p = 0.00008 is below 5 %, and the effect — 15.6 extra FPDs per 1 000 loans, 3.6 times the rate — is what goes into the sentence.

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ p-value (one right definition) — [p-values: What they are and how to interpret them (StatQuest), 04:32](https://youtu.be/vemZtEM63GY?t=272&end=427)
- ▶ H0 / H1 — [Hypothesis Testing and The Null Hypothesis, Clearly Explained!!! (StatQuest), 09:51](https://youtu.be/0oc49DyA3hU?t=591&end=824)
- ▶ z-test for two proportions — [Hypothesis Testing With Two Proportions (The Organic Chemistry Tutor)](https://youtu.be/pCbNUnZ98oE)
- ▶ Chi-square test of independence — [Chi-Square Test [Simply explained] (numiqo), 00:17](https://youtu.be/rpKzq64GA9Y?t=17)
- ▶ t-test (independent / paired / assumptions) — [t-Test - Full Course - Everything you need to know (numiqo), 01:45](https://youtu.be/VekJxtk4BYM?t=105&end=148)

- RU deck (TBC Data Analytics 2.0, if you have it) `Параметрические тесты (2).pdf` (lesson 5.4): the CLT and z-scores pp. 6–9, checking normality and log-transform pp. 10–12, p-value p. 13, type I/II errors p. 14, choosing a test pp. 15–16, assumptions of parametric tests p. 18, one-sample z pp. 19–21, two-sample z pp. 22–24, Student's t pp. 25–31 (paired pp. 30–31), Welch pp. 32–35, ANOVA pp. 36–46, Bonferroni and Tukey pp. 47–49, correlation and regression pp. 50–58.
- Notebook `примеры стат_тестов в python.ipynb`: one- and two-sample z, independent and paired t, Welch, ANOVA (scipy and statsmodels), Bonferroni, Tukey HSD — each on simulated data; rerun any of them on `f` or `x`.
- Visual: Seeing Theory, chapter 4 (hypothesis testing).
- *Russian terms:* нулевая / альтернативная гипотеза = null / alternative hypothesis, статистика критерия = test statistic, p-значение (p-value, p-уровень) = p-value, уровень значимости = significance level, ошибка I / II рода = type I / II error, мощность = power, одно- / двусторонний = one- / two-sided, критерий хи-квадрат = chi-square test, таблица сопряжённости = contingency table, t-критерий Стьюдента = Student's t-test, критерий Уэлча = Welch's test, связанные (парные) выборки = paired samples, критерий Шапиро–Уилка = Shapiro–Wilk, критерий Левена = Levene, размер эффекта = effect size, относительный риск = relative risk.

**Questions inside the videos.** Open a video from the panel: it stops at these points and asks one question about the bit you just watched.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 6 · Day 4 — Hypothesis tests II: non-parametric tests, multiple comparisons and power (weeks/week-06/day-4.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-06/day-4
=====

# Week 6 · Day 4 — Hypothesis tests II: non-parametric tests, multiple comparisons and power

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge">Reference card</span> <span class="badge hw">Checkpoint tomorrow</span> <span class="badge company">Company corner</span>

> STORY **Thursday, 9:00.** Jasur, laptop open, a slide from marketing on the screen: *"New SMS reminder three days before the first due date — cuts first-payment defaults!"* *"Your risk-committee note worked: Nilufar wants a fix for the app's FPD, and marketing has one. They want to send the SMS to **2 000 loans** and compare. My question is the one nobody in marketing asks: **is 2 000 enough?** If the SMS really takes FPD from 1.28 % to 1 %, what is the chance a test on 2 000 loans even notices? And while you are at it — Nilufar circled Bukhara as 'the worst branch'. Ten branches, ten tests. Tell me what that does to your 5 %."*

## Today in 3 lines

- When the t-test's assumptions break — skewed days late, a few huge values, tiny groups — use tests on **ranks** (**Mann–Whitney**, **Wilcoxon**, **Kruskal–Wallis**), a **permutation test** built by shuffling, and **Fisher's exact test** instead of χ² when expected counts fall below 5.
- Ten tests at α = 5 % give a **30–40 %** chance of at least one false alarm: **Bonferroni** and **Holm** fix the family-wise error — Bukhara's p = 0.020 becomes 0.199.
- **Power** decides whether a test can answer before you run it: detecting FPD 1.28 % → 1.00 % needs **22 481 loans per arm**; Jasur's 2 000 loans have **9 % power** (13 % even at 2 000 per arm) — and you leave with a one-page **test-choice card** for tomorrow's checkpoint.

---

## 1. Learn — when the textbook test does not fit

Eight short stories. Each one tells **one idea in small steps**: read a sentence, watch the picture change, press **Next**. A dotted word shows its meaning when you tap it. Tired of reading? Press **▶ Play as a video**: the page reads every step aloud and moves the picture for you.

The Python for each idea, and the extra topics, are in **Going further — the full version** near the end of the page (optional).

### One late payment and the average — when to use ranks

(Animated explanation)
One payment, 30 days late
- Ten payments, one dot each, placed by **days late** (below zero = paid early): 5 Auto payments and 5 SME payments. Most land near the due date. One SME payment came 30 days late.
- The averages are the triangles under the line: SME 6.4 days, Auto 1.4. SME looks 5 days later than Auto.
- Cover the 30-day payment with your finger: the other four SME payments average just 0.5 days. One payment makes the whole gap.
- Tap **+30 days** to make that payment even later. The SME average runs after it; Auto's stays put. The t-test compares exactly these averages — so one payment decides it.
- Your turn.
- Another way to look: line all ten payments up, smallest to largest, and number them 1 to 10. That number is the rank. The late payment is simply **rank 10**.
- Tap **+30 days** again. The dot flies right, but in the row nothing moves: it is still rank 10. Ranks ignore **how far** — only the order counts.
- Add up each group's ranks: SME 28, Auto 27. By ranks the two groups are alike. Tests that work on ranks are called non-parametric.
- Ranks also rescue data that only have an **order**: risk grade A < B < C < D, a 1–5 score. “B minus A” has no size, so an average grade means nothing — but the order is real.
- With thousands of values the CLT does rescue the average: 4 688 Auto and 8 222 SME payments are plenty for Welch. Then the **question** decides: the average, or the typical payment? Never run both and report the smaller p.

### Who wins more pairs — the Mann–Whitney test

(Animated explanation)
Who wins more pairs?
- Two small groups: A = 2, 5, 9 and B = 1, 3, 4, 7. Does A tend to have the bigger values?
- Play a tournament: every A against every B, 3 × 4 = **12 pairs**. Lined up in the row, a value beats everything to its left.
- Over each A: how many B values it beats. 2 beats 1 → +1; 5 beats 1, 3 and 4 → +3; 9 beats all four → +4. A wins **8** pairs in all. We call this count **U**.
- So a random A beats a random B 67 % of the time. The Mann–Whitney test asks: could that share really be ½ — the groups alike?
- Your turn.
- With thousands of values nobody counts pairs. Rank everything together instead: A holds ranks 2, 5 and 7. Their sum minus a fixed amount gives the same 8.
- Now the real payments, Auto vs SME: U ÷ (n₁ × n₂) = 0.495. A random Auto payment is later than a random SME one 49.5 % of the time — a coin toss. p = 0.32.
- Welch's t-test on the same payments says p = 0.0195: the **averages** differ, because SME has a slightly heavier tail of very late payments. Both are right — they answer different questions.
- Which one would you trust?
- Careful: Mann–Whitney is **not** a test of medians. Auto and SME have the same median (−1 day) and can still differ. Say it as: “a random X tends to be larger (or not) than a random Y”.
- Three groups or more? Rank everything together and compare the groups' average ranks: the Kruskal–Wallis test. Which product differs? Pairwise Mann–Whitney tests, with a correction (story 6).

### The same branches twice — the Wilcoxon test

(Animated explanation)
The same ten branches, twice
- Ten branches, each measured **twice**: the FPD of its 2026 loans minus its 2025 loans. Green: FPD fell. Orange: it rose — only Tashkent North, +0.99 points.
- The same branches twice are paired data: only the 10 differences matter. Most are below zero. More than luck?
- Line the changes up by **size**, ignoring the sign: the smallest change first, the biggest last.
- Number them 1 to 10. Samarkand's −0.11 is rank 1, Namangan's −1.46 is rank 10. Tashkent North's rise, +0.99, is the 7th-biggest change: rank 7.
- Add the ranks of the rises: W+ = 7. Of the falls: 48. If nothing had changed, rises and falls would mix: both sums near 27.5.
- Your turn.
- The luck world: if 2026 changed nothing, each sign is a coin toss. Tap **Flip the signs**: every change keeps its size and rank, but gets a random + or −.
- Flip 100 times. W+ piles up around 27.5. Ours, 7, sits far out on the left — few sign patterns are that lopsided.
- Ten signs have only 2¹⁰ = 1 024 patterns, so we can count them all (dashed). 38 are as lopsided as ours: p = 0.037. This is the Wilcoxon signed-rank test.
- The paired t-test gives p = 0.031 — the same verdict: 2026 loans are better. Wilcoxon only needs the differences to be roughly symmetric, not bell-shaped, so with ten branches it is the safer choice.
- Last one.

> 🎬 **Didn't get the Wilcoxon test?** [zedstatistics explains it · 9 min](https://youtu.be/IcLSKko2tsg?t=686&end=1230)

### Shuffle the labels — the permutation test and the bootstrap

(Animated explanation)
Shuffle the labels
- Story 1's ten payments again. SME's average is 5 days later than Auto's. Real, or luck?
- If the label meant nothing, any 5 of these payments could have been SME's. So keep the values and **shuffle the labels**: the colours jump, the dots stay. Each shuffle drops its gap into the chart below.
- Shuffle 100 times. The gaps pile up in **two humps**: whichever group gets the 30-day payment gets the big average.
- Guess, then look at the orange bars.
- Ten payments split 5 + 5 in only 252 ways, so we can count them all (dashed): 182 give a gap of 5 days or more, p = 0.72. This is the permutation test: the luck world, built from your data.
- Now real loans. App: 41 FPDs in 2 411 loans (1.70 %). Branch: 34 in 3 263 (1.04 %). The gap, +0.66 points, is the orange line.
- Shuffle the labels of all 5 674 loans: the 75 FPDs land on random loans. Each shuffle gives one gap; a thousand of them build the luck world.
- A gap of 0.66 points or more, either way, turns up in only about 3 shuffles in 100: p ≈ 0.03 (10 000 shuffles give 0.033) — the same answer as yesterday's z-test. Unlikely to be luck.
- The shuffle works for **any** number you can compute — a gap in medians, in the 90th percentile, in collection rates — with no formula. One assumption: without a real difference, any loan could have carried any label.
- A second tool, the bootstrap (Day 2): redraw the app loans from the app loans, the branch loans from the branch loans, recompute the gap. Tap the button.
- The shaded middle 95 % runs from about +0.05 to +1.30 points. **Zero is outside** → significant at 5 %. And unlike a p-value, the interval also says how big the gap could be.
- Partner vs branch: the interval runs from about −0.55 to +0.76 and **holds zero** (the green line) → not significant. But not “no difference”: the gap could still be as big as +0.76.

**Now check yourself.**

### Small tables — deal the FPDs again (Fisher)

(Animated explanation)
Six FPDs, dealt again
- The May 2026 vintage: 67 partner loans and 179 branch loans, one dot each. 6 FPDs: 4 in partner, 2 in branch. Partner looks five times worse — on six events.
- If channel made no difference, the 6 FPDs would split like the loans: partner holds 67 of the 246, so it should get about 1.63. That is the expected count.
- Yesterday's χ² test is a smooth approximation, and it needs every expected count to be **at least 5**. Here two are 1.63 and 4.37, and its two versions disagree: p = 0.028 and p = 0.083.
- Your turn.
- Fisher's idea: keep the totals — 6 FPDs, 67 + 179 loans — and **deal the 6 FPDs again**, at random. Tap **Deal the 6 FPDs** and count how many land in partner.
- Deal 1 000 times. Most deals put 0, 1 or 2 FPDs in partner. Ours — 4 or more — is rare: the orange bars.
- Fisher doesn't even deal: it counts every possible deal exactly (dashed). Deals as unlikely as ours, or more: 4.85 %. That is Fisher's exact test: p = 0.0485.
- Fisher is exact at any size: with an expected count below 5 you must use it, and with a computer you can simply use it for every 2 × 2 table.
- One more.
- And still: six FPDs are very few, p = 0.0485 is borderline, and this was one vintage and one channel pair out of many. The next story shows why “one out of many” matters.

**Now check yourself.**

### Many tests at once — Bonferroni, Holm, BH

(Animated explanation)
Twenty tests, nothing real
- Twenty tests at once — say, 20 customer segments, each compared with the rest. **Nothing is real**: in every test the two groups are truly the same. Still, each test has a 5 % chance of a false alarm.
- Tap **Run the 20 tests**: each dot rolls its own 5 % dice. Some runs stay clean; many light up one or two orange dots.
- Keep score: each run of 20 tests drops into the bar of its number of false alarms. Tap **100 runs**. Orange = at least one false alarm.
- Tap **1 000 runs**: about 64 in 100 have at least one false alarm. Each test is clean 95 % of the time; all 20 together, only 0.95²⁰ = 36 %. That 64 % is the family-wise error rate.
- Fewer tests: tap **1 000 runs** for 10 tests.
- Now Nilufar's ten branches, each tested against the other nine. Each bar is a p-value (short = strong evidence). Bukhara: p = 0.020 — below 0.05, “significant”! But it is one of ten tests, picked **because** it came out lowest.
- The simplest fix, Bonferroni: with 10 tests the line moves to 0.05 ÷ 10 = 0.005. Bukhara no longer passes. (Twenty nothing-tests at 0.0025 each raise an alarm only about 5 % of the time.)
- Holm is Bonferroni's smarter twin: the line climbs like a staircase. Same protection, never less power — the default. Bukhara still fails the first step.
- Yesterday's three channel pairs: one family of three tests.
- The corrected values sit on the right: as one of three tests, app vs branch is no longer below 0.05. Count **every** test you ran — including the ones you looked at and dropped.
- Three segment tests: p = 0.02, 0.03, 0.04. Holm: 0.02 × 3 = 0.06 fails at once — nothing flagged.
- Benjamini–Hochberg is softer: its line climbs up to α, and all three pass. Use it to screen hundreds of segments for leads; Holm when a wrong “yes” is costly.

### Peeking at a running test

(Animated explanation)
Peeking every month
- An SMS that does **nothing**: both arms 13.34 % late, 150 new loans per arm each month, for 12 months. The line shows the test's verdict month by month: inside the band p > 0.05, outside “significant”.
- Tap **Run one experiment**. The line wanders from month to month — pure luck, since the SMS does nothing.
- Run 500. Read **once**, at month 12: about 5 in 100 end outside the band. Those are the 5 % false alarms we agreed to when we chose α.
- Now an impatient analyst looks **every month** and stops at the first p < 0.05 (the big orange dot). That is peeking. Same experiments: about 21 in 100 “win”.
- Think about it.
- Peek less: only at months 6 and 12 (the dashed lines). Run 500: false wins drop to about 8 % — fewer looks, fewer accidents, but still above 5 %.
- The fix: write the sample size and the end date into the plan **before the first loan**, and read the result once. (Designs built for peeking come in week 7.)
- Your turn.
- A cousin of this check is the A/A test. On real Nur loans, 2 000 random A/A splits came out “significant” 4.9 % of the time — about α: the split and the test behave.
- Last one.

**Now play.** The same idea with sliders — try the challenges.

### Can the test see it? — power and sample size

(Animated explanation)
Can the test see it?
- Jasur's question: marketing hopes the SMS cuts FPD from 1.28 % to 1.00 %. First the **luck world**: the SMS does nothing, 2 000 loans per arm. Each experiment gives one gap between the arms.
- Run 1 000. The gaps pile up around 0. Only about 1 in 20 lands beyond ±0.66 points — so 0.66 is where this test starts to say “significant”.
- Now the **SMS world**: it really works, 1.28 % → 1.00 %. Run 1 000. The pile moves right — to about +0.28 points. But the line stays at 0.66.
- Only the orange part crosses the line: about **1 experiment in 8** (12–13 %). That share is the test's power. Seven times in eight, a working SMS comes back “not significant”.
- What would a “no” mean?
- More loans make the pile **narrow**. With about 22 500 loans per arm the line moves in to 0.20 points, and about 80 % of SMS-world experiments cross it. That is the usual target: 80 % power.
- A formula gives that number before any data: 1.96 is the 5 % line, 0.84 buys 80 % power, and h — Cohen's h — is the effect. Small h, huge n: 11 years of Nur's loans.
- And the other way round, from n to power: the bell's share of the SMS pile past the line, read with Φ. The second term is the tiny left tail. Your `power_at` computes exactly this.
- Four things set the power, all known in advance: **n**, the **effect** (a bigger cut moves the pile further), **α** (a looser line lets more through) and **how rare** the outcome is — a rare one needs far more loans.
- Your turn.
- Turn it round: with n fixed, the MDE says what the test **can** see. Jasur's 1 000 per arm only catch an SMS that cuts FPD by 80 % — no reminder does that.
- So, before any test, compute its power. Too low? Change the metric (a frequent one, like “first instalment paid late”, 13.3 %), the n, or decide on cost. Never read “not significant” from a weak test as “no effect”.

> 🎬 **Didn't get power?** [StatQuest explains it · 2 min](https://youtu.be/Rsc5znwR5FA?t=199&end=297)

> 🎬 **Didn't get the sample size?** [StatQuest explains it · 3 min](https://youtu.be/VX_M3tIyiYk?t=708&end=910)

**Now play.** The same idea with sliders — try the challenges.

**Now check yourself.**

**Now check yourself.**

## 2. Reference card — which test? (keep it open tomorrow)

| Outcome | Groups | Paired? | Test (Python) | When it breaks → instead |
|---|---|---|---|---|
| rate (yes/no) | 1 vs a known value | — | exact binomial `stats.binomtest` | — |
| rate | 2 | no | two-proportion z `proportions_ztest`, or χ² 2 × 2 | expected < 5 → **Fisher** `fisher_exact` |
| rate | 2 | yes (same loans, two moments) | **McNemar** `statsmodels.stats.contingency_tables.mcnemar` | — |
| rate | 3+ (or two categoricals) | no | **χ² of independence** `chi2_contingency` | thin cells → pool, or Fisher–Freeman–Halton / permutation |
| mean of a number | 1 vs a value | — | one-sample t `ttest_1samp` | skewed, small n → Wilcoxon signed-rank vs the value |
| number | 2 | no | **Welch t** `ttest_ind(equal_var=False)` | skewed + small n, outliers, "typical" question → **Mann–Whitney**; any statistic → permutation |
| number | 2 | yes | paired t `ttest_rel` | → **Wilcoxon** `wilcoxon` |
| number | 3+ | no | one-way ANOVA `f_oneway` (+ Tukey) | → **Kruskal–Wallis** `kruskal` (+ pairwise MW with Holm) |
| two numbers together | — | — | Pearson `pearsonr` | outliers, monotone not linear → Spearman `spearmanr` |
| median, ratio, percentile | any | either | bootstrap CI / permutation | — |
| many tests at once | — | — | add **Holm** (`multipletests`) | screening hundreds → BH (FDR) |
| before running anything | — | — | **power / sample size** `zt_ind_solve_power`, `TTestIndPower` | MDE too large → change the metric or the n |

Three questions pick the row: **what kind of outcome** (rate or number), **how many groups**, **same units twice or not**. Then the last column asks whether the default's assumptions hold.

---

## 3. Worked example — "Bukhara is the worst branch" (15 min)

**1. The claim.** Bukhara Central: 14 FPDs in 586 loans = 2.39 %, against 1.28 % for the book.

**2. One branch, small counts — Fisher's exact test.** Bukhara vs the other nine: 14 / 586 vs 77 / 6 513. The counts are small, so Fisher, not χ²: **p = 0.020** (odds ratio 2.05). Taken alone, "significant".

**3. Effect size — how big, if it is real.** 2.39 % against 1.18 % for the other nine: +1.21 points, RR 2.0. Large if real — and it rests on 14 FPDs.

**4. Multiple comparisons — it was chosen because it was the highest of ten.** Test all ten branches the same way (Going further, 'Multiple comparisons', the branch table) and correct with **Holm**: Bukhara's adjusted p is **0.199**; no other branch is below 0.27 even before the correction. The omnibus χ² across the ten branches agrees: **p = 0.35**.

**5. The family-wise error rate — what chance does.** In books where all ten branches share the same true rate, 31 % have at least one branch flagged at 5 % (the notebook's simulation); Tuesday's Company corner showed the top branch averaging 2.00 % by luck alone.

**6. Reporting the result — one sentence.** *"Bukhara's 2.39 % is the highest of ten branches, but once we account for testing ten branches it is within what chance produces (Holm-adjusted p = 0.20); we will watch its Q4 vintages and its product mix rather than act now."*

---

## 4. Practice (50 min)

Every task has its own answer box. All the Python boxes of this page share one session: the box just below loads `f`, `x`, `pmf`, `cdf`, `mann_whitney`, `fisher`, `holm`, `bh`, `cohens_d`, `cohens_h`, `n_per_arm`, `power_at`, `mde_rate`, `Phi` and `zq` — run it once before the first task. The days-late tasks use `x`, the 52 850 payments with `days_late`, which that box builds (the notebook `data/python/week6/day4_starter.ipynb` builds the same `f` and `x`, with `scipy`).

**First, press ▶ Run on this box once.** It loads the tools and the data that every Python box below uses.

```python
# the tools and the data from the full version of section 1 — run once
import math, sqlite3
import numpy as np
import pandas as pd
from statistics import NormalDist
Phi, zq = NormalDist().cdf, NormalDist().inv_cdf
def pmf(k, n, p):
    return math.comb(n, k) * p**k * (1 - p)**(n - k)
def cdf(k, n, p):  # binomial P(X <= k)
    return sum(pmf(i, n, p) for i in range(k + 1))
f = pd.read_csv("data/powerbi/fct_first_instalment.csv")
f["channel"] = f["product"].map({"MICRO": "app", "BNPL": "partner"}).fillna("branch")
con = sqlite3.connect("data/raw/nur.db")
x = pd.read_sql("""
    WITH pay AS (SELECT MIN(payment_id) AS payment_id, installment_id, paid_at, amount
                 FROM payments GROUP BY installment_id, paid_at, amount)      -- 52 850 clean payments, repeats removed
    SELECT p.payment_id, pr.code, l.risk_grade,
           CAST(julianday(date(p.paid_at)) - julianday(i.due_date) AS INTEGER) AS days_late
    FROM pay p
    JOIN installments i ON i.installment_id = p.installment_id
    JOIN loans l        ON l.loan_id = i.loan_id
    JOIN products pr    ON pr.product_id = l.product_id""", con)
two = x[x["code"].isin(["AUTO", "SME"])].groupby("code")["days_late"]
def mann_whitney(a, b):
    a, b = np.asarray(a, dtype=float), np.asarray(b, dtype=float)
    n1, n2 = len(a), len(b)
    pooled = pd.Series(np.concatenate([a, b]))
    # ranks of all values together; ties get the average rank
    r = pooled.rank().to_numpy()
    u = r[:n1].sum() - n1 * (n1 + 1) / 2  # U for group a
    n, t = n1 + n2, pooled.value_counts().to_numpy().astype(float)
    # the spread of U under H0
    sd = math.sqrt(n1 * n2 / 12 * ((n + 1) - (t**3 - t).sum() / (n * (n - 1))))
    # 0.5 = continuity correction
    z = (abs(u - n1 * n2 / 2) - 0.5) / sd
    # U, P(a random a > a random b), p-value
    return u, u / (n1 * n2), 2 * (1 - Phi(z))
f["year"] = pd.to_datetime(f["disbursed_at"]).dt.year
w = f[f.year.isin([2025, 2026])].pivot_table(index="branch_name", columns="year", values="fpd30", aggfunc="mean") * 100
d = (w[2026] - w[2025]).to_numpy()
d = d[d != 0]
r = pd.Series(np.abs(d)).rank().to_numpy()
def kruskal(groups):
    pooled = pd.concat(groups, ignore_index=True)
    r, n = pooled.rank().to_numpy(), len(pooled)
    h, start = 0.0, 0
    # each group's mean rank against the overall (n + 1) / 2
    for g in groups:
        rg = r[start:start + len(g)]; start += len(g)
        h += len(g) * (rg.mean() - (n + 1) / 2) ** 2
    h *= 12 / (n * (n + 1))
    t = pooled.value_counts().to_numpy().astype(float)
    return h / (1 - (t**3 - t).sum() / (n**3 - n))
H = kruskal([g["days_late"] for _, g in x.groupby("code")])
ab = f[f["channel"].isin(["app", "branch"])]
y, is_app = ab["fpd30"].to_numpy(), (ab["channel"] == "app").to_numpy()
g = np.random.default_rng(2026)
diffs = np.array([(lambda s: y[s].mean() - y[~s].mean())(g.permutation(is_app)) for _ in range(10_000)])
g = np.random.default_rng(2026)
a, b = f.loc[f.channel == "app", "fpd30"].to_numpy(), f.loc[f.channel == "branch", "fpd30"].to_numpy()
d = [g.choice(a, len(a)).mean() - g.choice(b, len(b)).mean() for _ in range(10_000)]
t = np.array([[4, 63], [2, 177]])
def fisher(a, b, c, d):
    r1, c1, n = a + b, a + c, a + b + c + d
    # P(k in the top-left cell) with the margins fixed
    def table_p(k):
        return math.comb(c1, k) * math.comb(n - c1, r1 - k) / math.comb(n, r1)
    p_obs = table_p(a)
    # every possible top-left count
    ks = range(max(0, r1 - (n - c1)), min(r1, c1) + 1)
    # tables as unlikely as ours, or more
    return sum(table_p(k) for k in ks if table_p(k) <= p_obs * (1 + 1e-7))
def holm(pvals):
    pvals = np.asarray(pvals, dtype=float)
    m, adj, run = len(pvals), np.empty(len(pvals)), 0.0
    for rank, i in enumerate(np.argsort(pvals)):     # smallest p first
        # × m, × (m − 1), … keeping the running maximum
        run = max(run, min(1.0, (m - rank) * pvals[i]))
        adj[i] = run
    return adj
def bh(pvals):
    pvals = np.asarray(pvals, dtype=float)
    m, adj, run = len(pvals), np.empty(len(pvals)), 1.0
    for k, i in enumerate(np.argsort(pvals)[::-1]):  # largest p first
        # × m / rank, keeping the running minimum
        run = min(run, pvals[i] * m / (m - k))
        adj[i] = run
    return adj
br = f.groupby("branch_name")["fpd30"].agg(["sum", "size"])
k_all, n_all = f["fpd30"].sum(), len(f)
br["p"] = [fisher(k, n - k, k_all - k, n_all - n - (k_all - k)) for k, n in zip(br["sum"], br["size"])]
br["bonferroni"] = np.minimum(1, br["p"] * len(br))
br["holm"], br["bh"] = holm(br["p"]), bh(br["p"])
g = np.random.default_rng(2026)
p_late, runs, per_month = 947 / 7099, 20_000, 150
ka = g.binomial(per_month, p_late, size=(runs, 12)).cumsum(axis=1)
kb = g.binomial(per_month, p_late, size=(runs, 12)).cumsum(axis=1)
n_arm = per_month * np.arange(1, 13)
pool = (ka + kb) / (2 * n_arm)
z = (ka - kb) / n_arm / np.sqrt(pool * (1 - pool) * 2 / n_arm)
def cohens_h(p1, p2):
    return 2 * math.asin(math.sqrt(p1)) - 2 * math.asin(math.sqrt(p2))
def n_per_arm(p1, p2, alpha=0.05, power=0.80):
    return 2 * ((zq(1 - alpha / 2) + zq(power)) / cohens_h(p1, p2)) ** 2
def power_at(p1, p2, n, alpha=0.05):
    h, za = abs(cohens_h(p1, p2)), zq(1 - alpha / 2)
    return Phi(h * math.sqrt(n / 2) - za) + Phi(-h * math.sqrt(n / 2) - za)
def mde_rate(p1, n, alpha=0.05, power=0.80):
    h = (zq(1 - alpha / 2) + zq(power)) * math.sqrt(2 / n)
    return math.sin(math.asin(math.sqrt(p1)) - h / 2) ** 2
def cohens_d(a, b):
    a, b = np.asarray(a, dtype=float), np.asarray(b, dtype=float)
    sp = math.sqrt(((len(a) - 1) * a.var(ddof=1) + (len(b) - 1) * b.var(ddof=1)) / (len(a) + len(b) - 2))
    return (a.mean() - b.mean()) / sp
gr = x.groupby("risk_grade")["days_late"]
g = np.random.default_rng(2026)
y_all, hits = f["fpd30"].to_numpy(), 0
for _ in range(2000):
    # 4 000 real loans: the first 2 000 are "A", the rest "A" again
    s = g.choice(y_all, 4000, replace=False)
    ka, kb = s[:2000].sum(), s[2000:].sum()
    pool = (ka + kb) / 4000
    hits += abs(ka - kb) / 2000 / math.sqrt(pool * (1 - pool) * 2 / 2000) > 1.96
micro = x.loc[x.code == "MICRO", "days_late"]
others = ["CONS", "BNPL", "AUTO", "SME"]
res = pd.DataFrame(
    [(c, *mann_whitney(micro, x.loc[x.code == c, "days_late"])[1:], cohens_d(micro, x.loc[x.code == c, "days_late"])) for c in others],
    columns=["vs", "P(Micro later)", "p", "d"])
print('ready')
```

**P1.** *(when the t-test is wrong)* For which two comparisons is Welch's t-test the wrong tool?

**P2.** *(Mann–Whitney U)* Auto vs SME days late: describe both (n, mean, median, share late, 99th percentile), then Welch and Mann–Whitney. Marketing asks "do SME borrowers pay later than Auto borrowers?" — which test answers that, and what is your answer?

**P3.** *(Wilcoxon signed-rank)* Wilcoxon signed-rank on the ten branches' FPD30, 2025 vs 2026, next to the paired t-test. Why might you prefer Wilcoxon here?

**P4.** *(Kruskal–Wallis)* Kruskal–Wallis on days late across the five products, then one-way ANOVA (`stats.f_oneway`). Which product drives the result?

**P5.** *(permutation test)* Permutation test for the difference in **mean** days late, Auto − SME (10 000 shuffles, `default_rng(2026)`). Compare with Welch.

**P6.** *(bootstrap as a test)* Bootstrap the difference in **mean** days late, Micro − Auto: 2 000 resamples, `default_rng(2026)`, the 95 % percentile interval. Is zero inside?

**P7.** *(chi-square or Fisher)* The 2026-05 vintage, partner vs branch (4 / 67 vs 2 / 179). Expected counts, χ² with and without Yates, Fisher. Which do you report, and what do you conclude?

**P8.** *(multiple comparisons)* Holm by hand (your TODO) on the three channel-pair p-values from yesterday: app–branch 0.0318, app–partner 0.153, partner–branch 0.804. Then Bonferroni.

**P9.** *(multiple comparisons: screening)* The vintage screen: test each of the 31 monthly vintages with ≥ 50 loans against the book rate 1.28 % (exact two-sided binomial). How many are "significant" at 5 %, how many would chance produce, and what survives Holm?

**P10.** *(peeking)* Marketing ran a reminder test for eight weeks, looked at the dashboard every Monday and stopped in week 3, when p = 0.04. What do you tell them?

**P11.** *(power and sample size)* Sample size for the SMS test with other settings: 90 % power; one-sided 80 %. And the achieved power of 1 000 vs 1 000.

**P12.** *(MDE)* MDE: with 1 000, 2 000 and 10 000 loans per arm (α 5 %, power 80 %), what FPD rate must the SMS reach to be detectable from 1.28 %? Use your `mde_rate`.

**P13.** *(effect size)* Cohen's d for days late, grade C vs grade A, with `cohens_d` from the setup box. Small, medium or large? Then the share of payments paid late in each grade.

**P14.** *(A/A test)* An A/A design on the share of payments paid late: the ten branches are split into two groups of five, nobody gets any treatment, and a payment-level two-proportion z-test compares the groups. Over all 252 possible splits, 42 (16.7 %) come out "significant" at 5 %. Why so many?

> 🚀 **Stretch (optional, +5 XP).** **P15.** *(power and sample size: choosing the metric)* Change the metric. "First instalment paid late at all" (any day after the due date, or not in full) is far more common than FPD30. Compute its rate on the 7 099 loans, the n per arm to detect a 20 % relative cut, the power of 1 000 vs 1 000, and confirm that power by simulation (20 000 runs, `default_rng(2026)`).

### Mistakes people make

- Mann–Whitney reported as "the medians differ" — it compares distributions; equal medians can still give p ≈ 0.
- Running t and Mann–Whitney and quoting the smaller p.
- χ² on a table with expected counts of 1–2 (use Fisher).
- Testing ten branches, quoting the one with p < 0.05, no correction — and then "investigating" the noise.
- Bonferroni when Holm gives the same guarantee with more power.
- Planning a test without a power calculation; reading "not significant" from an underpowered test as "no effect".
- Powering for the effect you *hope* for (−50 %) instead of the one that is plausible and worth money.
- An A/B test without an A/A check of the split.
- Peeking every month and stopping at the first p < 0.05 — a 5 % test becomes a 21 % one.

---

## 5. Homework

None today: **Checkpoint 6 is tomorrow** (intervals on Nur data, the test-choice quiz, interview questions). Finish the five TODO functions in `day4_starter.ipynb`; the checkpoint's power task uses them. **HW 6.2** is due tomorrow in Day 2's hand-in box. Check two of your functions here:

**H1.** Your `n_per_arm(0.0128, 0.010)` — loans per arm for 80 % power at α = 5 %, two-sided (rounded up)?

**H2.** And the power of 1 000 vs 1 000 for the same effect, in %, to 1 decimal?

---

## 6. Self-check

Three questions, one at a time. Wrong? The explanation points to the part of section 1 to reread.

---

## 7. Company corner <span class="badge company">Sample size for a risk experiment</span>

Jasur's question, answered before anyone sends an SMS.

**Design as proposed.** 2 000 loans: 1 000 get the SMS three days before the first due date, 1 000 do not (random split). Primary outcome: FPD30. Hoped-for effect: 1.28 % → 1.00 % (−22 %). α = 5 %, two-sided.

| Question | Answer | How |
|---|---|---|
| Loans needed per arm for 80 % power | **22 481** (44 962 in total) | `zt_ind_solve_power(proportion_effectsize(0.0128, 0.010), alpha=0.05, power=0.8)` |
| At Nur's pace (337 new loans a month, January–September 2026) | **133 months — 11 years** | 44 962 / 337 |
| Power of the proposed 1 000 vs 1 000 | **9.1 %** | `NormalIndPower().power(h, nobs1=1000, alpha=0.05)` |
| … even with 2 000 SMS vs 2 000 control | **13.3 %** (a 20 000-run simulation: 13.4 %) | `nobs1=2000` |
| What 1 000 per arm *can* detect (MDE) | FPD 1.28 → **0.26 %** (−80 %) | `mde_rate(0.0128, 1000)` |
| What 2 000 per arm can detect | 1.28 → **0.48 %** (−63 %) | `mde_rate(0.0128, 2000)` |

**The business reading.** As designed, the test has a 91 % chance of returning "not significant" **even if the SMS works exactly as marketing hopes** — and that result would then be used to kill a good idea. Four honest options for Nilufar and marketing:

1. **Change the primary metric** to a frequent one the SMS acts on: *first instalment paid late at all* (13.3 %). A 20 % cut needs 2 324 per arm — about 14 months of all new loans, or 1 000 + 1 000 with 45 % power. Keep FPD30 as a guardrail.
2. **Use a continuous outcome** (days late on the first instalment) with a t-test or Mann–Whitney — more information per loan than a yes/no.
3. **Run longer, on every new loan**, with a pre-registered stopping date, accepting that FPD30 is a 2027 answer.
4. **Do not test — decide on cost.** An SMS costs a few hundred soum; the 25 m-soum app FPD problem from yesterday's note is small. If the downside of sending it to everyone is negligible, roll it out and monitor; a test is worth its cost only when the decision is expensive to reverse.

What goes back to Jasur, in two sentences: *"2 000 loans give 9 % power for a 1.28 → 1.00 % FPD effect; you would need 22 481 per arm. Test 'first instalment paid late' instead (2 324 per arm for a 20 % cut) with FPD30 as a guardrail — or just send the SMS if it costs less than the analysis."*

Marketing's test plan has one fatal line — tap it:

> 🎯 **Interview version.** *"How would you size an experiment on default rates?"* — Fix α, power and the smallest effect worth acting on; compute Cohen's h and n per arm; translate n into calendar time at the real volume; if it is years, change the metric (a frequent leading indicator), the design (all traffic, longer) or the question — and never read a null result from an underpowered test as "no effect".

**Say it like in an interview.** *"Marketing wants to test an SMS reminder on 2 000 loans to cut first-payment defaults from 1.28 % to 1 %. Is that enough?"* — answer in 3–5 sentences, as you would to an interviewer.

Tomorrow: Checkpoint 6 — five analyses on Nur data, twelve test-choice scenarios, eight interview questions.

---

## Going further — the full version, with Python (optional, 60 min)

The same ideas as the stories, written out in full with Python, plus Kruskal–Wallis in detail, the power curve and the MDE table, effect size (Cohen's d), the A/A test and one request answered with all of today's tools. Optional: nothing here counts toward the day.

### When the t-test is wrong — skew, outliers, ordinal data

**What it is.** The **t-test** compares two **means**. It trusts the CLT to make the mean of each group roughly normal. It goes wrong in three situations:

1. **Skew with a small n.** The CLT has not had enough data yet, so the mean is not yet normal.
2. **Outliers.** A few extreme values move the mean, and the test moves with it.
3. **Ordinal data.** Risk grade A–D or a 1–5 satisfaction score: the distance between two values means nothing, so their average means nothing either.

The way out is a **non-parametric test** (*непараметрический критерий*). Most of them replace each value by its **rank** (*ранг*) — its position after sorting. Ranks need no normality, and an outlier is only "the highest rank".

**How to write it.** Look at the shape before you pick a test. Press ▶ Run: this first block loads the tools and two frames for the whole page — `f`, one row per first instalment (FPD30), and `x`, one row per clean payment with its days late.

```python
import math, sqlite3
import numpy as np
import pandas as pd
from statistics import NormalDist
# the normal CDF and its inverse (z for a probability)
Phi, zq = NormalDist().cdf, NormalDist().inv_cdf
# binomial P(X = k), from Day 1
def pmf(k, n, p):
    return math.comb(n, k) * p**k * (1 - p)**(n - k)
def cdf(k, n, p):  # binomial P(X <= k)
    return sum(pmf(i, n, p) for i in range(k + 1))

# 7 099 first instalments, fpd30 = 0/1
f = pd.read_csv("data/powerbi/fct_first_instalment.csv")
f["channel"] = f["product"].map({"MICRO": "app", "BNPL": "partner"}).fillna("branch")

con = sqlite3.connect("data/raw/nur.db")
x = pd.read_sql("""
    WITH pay AS (SELECT MIN(payment_id) AS payment_id, installment_id, paid_at, amount
                 FROM payments GROUP BY installment_id, paid_at, amount)      -- 52 850 clean payments, repeats removed
    SELECT p.payment_id, pr.code, l.risk_grade,
           CAST(julianday(date(p.paid_at)) - julianday(i.due_date) AS INTEGER) AS days_late
    FROM pay p
    JOIN installments i ON i.installment_id = p.installment_id
    JOIN loans l        ON l.loan_id = i.loan_id
    JOIN products pr    ON pr.product_id = l.product_id""", con)

two = x[x["code"].isin(["AUTO", "SME"])].groupby("code")["days_late"]
# 52850; AUTO 4688 −0.21 −1 5.85; SME 8222 0.04 −1 5.53
print(len(x), two.agg(["size", "mean", "median", "skew"]).round(2))
# share paid late: AUTO 0.101, SME 0.124
print(two.apply(lambda d: (d > 0).mean()).round(3))
```

| | n payments | mean days | median | skew | share paid late | share > 30 days | 99th percentile |
|---|---|---|---|---|---|---|---|
| Auto | 4 688 | −0.21 | −1 | 5.85 | 10.1 % | 0.85 % | 28 |
| SME | 8 222 | +0.04 | −1 | 5.53 | 12.4 % | 1.02 % | 31 |

Both products pay one day early in the middle (median −1), and both have a thin tail of 30-day payments that pulls the mean up — a skew near 6, where 0 is symmetric.

**When you use it.**

| Situation | Why the t-test is weak | Use instead |
|---|---|---|
| skewed data, fewer than ~30 per group | the mean is not normal yet | Mann–Whitney, permutation test |
| a few extreme values | they pull the mean | a rank test, or a bootstrap of the median |
| ordinal scale (grade, 1–5 score) | an average of labels has no meaning | a rank test |
| large n, a question about the average | the CLT works | Welch's t-test is fine |

> ⚠️ **Watch out.** With thousands of values, skew alone does not break Welch: 4 688 and 8 222 payments are plenty for the CLT. The real choice is the question — the **average** (t-test) or the **typical** value (rank test). Decide it first; never run both and report the smaller p.

**Your turn.** Which comparison should not use a t-test?

### Mann–Whitney U — two independent groups by ranks

**What it is.** The **Mann–Whitney U test** (*U-критерий Манна–Уитни*, also called the Wilcoxon rank-sum test) pools both groups, ranks every value and checks whether one group's ranks are systematically higher. **U** counts the pairs — one value from each group — in which the A value is larger (a tie counts ½). **U / (n₁·n₂)** is the probability that a random A beats a random B. H₀: that probability is ½.

**How to write it.** U = (sum of A's ranks) − n₁·(n₁ + 1) / 2. On a tiny example, A = [2, 5, 9] and B = [1, 3, 4, 7]:

| value | 1 | 2 | 3 | 4 | 5 | 7 | 9 |
|---|---|---|---|---|---|---|---|
| group | B | A | B | B | A | B | A |
| rank | 1 | 2 | 3 | 4 | 5 | 6 | 7 |

A's ranks add up to 2 + 5 + 7 = 14, so U = 14 − 3·4/2 = **8**: A wins 8 of the 3 × 4 = 12 pairs, a share of 0.67.

```python
# two-sided; normal approximation with the tie correction
def mann_whitney(a, b):
    a, b = np.asarray(a, dtype=float), np.asarray(b, dtype=float)
    n1, n2 = len(a), len(b)
    pooled = pd.Series(np.concatenate([a, b]))
    # ranks of all values together; ties get the average rank
    r = pooled.rank().to_numpy()
    u = r[:n1].sum() - n1 * (n1 + 1) / 2  # U for group a
    n, t = n1 + n2, pooled.value_counts().to_numpy().astype(float)
    # the spread of U under H0
    sd = math.sqrt(n1 * n2 / 12 * ((n + 1) - (t**3 - t).sum() / (n * (n - 1))))
    # 0.5 = continuity correction
    z = (abs(u - n1 * n2 / 2) - 0.5) / sd
    # U, P(a random a > a random b), p-value
    return u, u / (n1 * n2), 2 * (1 - Phi(z))

# [8.0, 0.667] — the small table
print([round(float(v), 3) for v in mann_whitney([2, 5, 9], [1, 3, 4, 7])[:2]])
auto, sme = x.loc[x.code == "AUTO", "days_late"], x.loc[x.code == "SME", "days_late"]
# [19075370.5, 0.495, 0.323]
print([round(float(v), 3) for v in mann_whitney(auto, sme)])
# scipy (the notebook): scipy.stats.mannwhitneyu(auto, sme) — the same U and p
```

U / (n₁n₂) = 0.495: a random Auto payment is later than a random SME payment 49.5 % of the time — a coin toss, and p = 0.32 says so.

**When you use it.**
- Two independent groups, a number or an ordered label, and the question "does one group tend to have larger values?".
- Small or skewed groups, or data with outliers.

| | Welch t-test | Mann–Whitney U |
|---|---|---|
| Asks | are the **averages** different? | does a random A tend to beat a random B? |
| Works on | the values | the ranks |
| A 60-day payment | pulls the mean | is only the top rank |
| Auto vs SME days late | t = −2.34, **p = 0.0195** | **p = 0.32** |

Both answers are right: the averages differ because SME has a slightly heavier late tail; the typical payment does not.

> ⚠️ **Watch out.** Mann–Whitney is not "a test of medians". Auto and SME have the same median (−1 day) and could still differ in the tail. Report it as "a random X tends to be larger (or not) than a random Y", with U / (n₁n₂).

**Your turn.** A = [3, 8, 10], B = [1, 2, 6, 9]. What is U for A? Count the pairs, or use `mann_whitney`.

### Wilcoxon signed-rank — the paired version

**What it is.** For **paired** data — the same unit measured twice — the **Wilcoxon signed-rank test** (*критерий Вилкоксона для связанных выборок*) works on the differences. Drop the zero differences, rank the rest by size, then add the ranks of the positive differences (**W+**) and of the negative ones (**W−**). Under H₀ the differences are symmetric around 0, so W+ and W− should be close. W is the smaller of the two.

**How to write it.** The same ten branches, FPD30 of their 2025 vintages against their 2026 vintages:

| branch | 2026 − 2025, points | rank of the size | sign |
|---|---|---|---|
| Samarkand Central | −0.11 | 1 | − |
| Fergana Central | −0.40 | 2 | − |
| Nukus Central | −0.46 | 3 | − |
| Tashkent Central | −0.49 | 4 | − |
| Tashkent South | −0.56 | 5 | − |
| Andijan Central | −0.68 | 6 | − |
| **Tashkent North** | **+0.99** | **7** | **+** |
| Bukhara Central | −1.21 | 8 | − |
| Termez Central | −1.37 | 9 | − |
| Namangan Central | −1.46 | 10 | − |

```python
f["year"] = pd.to_datetime(f["disbursed_at"]).dt.year
w = f[f.year.isin([2025, 2026])].pivot_table(index="branch_name", columns="year", values="fpd30", aggfunc="mean") * 100
d = (w[2026] - w[2025]).to_numpy()
# a zero difference has no sign
d = d[d != 0]
# rank the sizes of the differences
r = pd.Series(np.abs(d)).rank().to_numpy()
w_plus, w_minus = r[d > 0].sum(), r[d < 0].sum()
W = min(w_plus, w_minus)
# exact p-value: under H0 every pattern of + and − signs on the ranks is equally
# likely (2^10 = 1 024 patterns)
signs = (np.arange(2 ** len(d))[:, None] >> np.arange(len(d))) & 1
plus = signs @ r  # W+ of every pattern
# 7.0 48.0 0.037
print(w_plus, w_minus, np.mean(np.minimum(plus, r.sum() - plus) <= W))
# scipy (the notebook): scipy.stats.wilcoxon(w[2026], w[2025]) → W = 7, p =
# 0.037
```

W+ = 7: only Tashkent North got worse, and its rise is the 7th-largest change of ten; 38 of the 1 024 sign patterns are this lopsided, so p = 0.037.

**When you use it.**
- The same units twice (branches in two years, customers before and after), with few pairs or skewed differences.

| | paired t-test | Wilcoxon signed-rank |
|---|---|---|
| Works on | the mean difference | the ranks of the differences |
| Needs | differences roughly normal | differences roughly symmetric |
| Ten branches, 2025 vs 2026 | p = 0.031 | p = 0.037 |

**Your turn.** Five differences: +3, −1, −4, −2, −5. What is W+ (the sum of the ranks of the positive differences)?

### Kruskal–Wallis — three or more groups

**What it is.** The **Kruskal–Wallis test** (*критерий Краскела–Уоллиса*) is Mann–Whitney for k groups — the rank version of one-way ANOVA. In one line: rank everything together, and **H** measures how far each group's mean rank sits from the overall mean rank; under H₀ it follows χ² with k − 1 degrees of freedom.

**How to write it.** H = 12 / (n(n + 1)) · Σ nᵢ · (mean rank of group i − (n + 1)/2)², divided by a tie correction.

```python
def kruskal(groups):
    pooled = pd.concat(groups, ignore_index=True)
    r, n = pooled.rank().to_numpy(), len(pooled)
    h, start = 0.0, 0
    # each group's mean rank against the overall (n + 1) / 2
    for g in groups:
        rg = r[start:start + len(g)]; start += len(g)
        h += len(g) * (rg.mean() - (n + 1) / 2) ** 2
    h *= 12 / (n * (n + 1))
    t = pooled.value_counts().to_numpy().astype(float)
    return h / (1 - (t**3 - t).sum() / (n**3 - n))  # tie correction
H = kruskal([g["days_late"] for _, g in x.groupby("code")])
# 61.0 1.8e-12 — for 4 df, P(χ² > H) = e^(−H/2)·(1 + H/2)
print(round(H, 1), math.exp(-H / 2) * (1 + H / 2))
# Micro +0.56 stands out; the others −0.21 to +0.04
print(x.groupby("code")["days_late"].mean().round(2))
# scipy (the notebook): scipy.stats.kruskal(*groups); one-way ANOVA:
# scipy.stats.f_oneway(*groups) → F = 19.3
```

H = 61.0 on 4 degrees of freedom, p = 1.8 × 10⁻¹²: the days late of at least one product differ from the rest, and the means point at Micro.

**When you use it.**
- Three or more independent groups, skewed data or ordered labels.
- Then pairwise Mann–Whitney tests with a correction (Multiple comparisons, below) to say *which* groups differ.

> ⚠️ **Watch out.** A significant Kruskal–Wallis says "at least one group differs", not which one. Do not name a product until the pairwise tests and the correction are done.

**Your turn.** Kruskal–Wallis on days late across the five products gives H = 61.0, p = 1.8 × 10⁻¹². Which conclusion is right?

### Permutation test — build the null by shuffling

**What it is.** If H₀ is true, the group label carries no information, so shuffling it should often produce gaps as large as the real one. A **permutation test** (*перестановочный тест*) shuffles the labels many times, recomputes the statistic each time and reports p = the share of shuffles at least as extreme as the observed value.

**How to write it.** Observed statistic → shuffle the labels 10 000 times → recompute → count. App vs branch FPD:

```python
ab = f[f["channel"].isin(["app", "branch"])]
y, is_app = ab["fpd30"].to_numpy(), (ab["channel"] == "app").to_numpy()
# the real gap: +0.6586 points
obs = y[is_app].mean() - y[~is_app].mean()
# seeded, so you get the same shuffles
g = np.random.default_rng(2026)
diffs = np.array([(lambda s: y[s].mean() - y[~s].mean())(g.permutation(is_app)) for _ in range(10_000)])
# 0.6586 and p ≈ 0.033 (notebook 0.0326; z-test 0.0318, Fisher 0.0344)
print(round(100 * obs, 4), np.mean(np.abs(diffs) >= abs(obs)))
```

A gap of 0.66 points or more appeared in about 3.3 % of 10 000 shuffles, so p ≈ 0.033 — the same answer as yesterday's z-test.

**When you use it.**
- Any statistic with no formula: a difference in medians, in collection rates (Σ paid / Σ due), in the 90th percentile.
- Small or odd-shaped samples. The only assumption: under H₀ the units are exchangeable (any unit could have had any label).

### The bootstrap as a test — is zero in the interval?

**What it is.** The **bootstrap** (Day 2) resamples each group with replacement and recomputes the difference each time. As a test: build the 95 % interval of the difference and check whether **0** is inside. Zero outside → significant at 5 %.

**How to write it.** Resample each group → difference → repeat 10 000 times → 2.5th and 97.5th percentiles.

```python
g = np.random.default_rng(2026)
a, b = f.loc[f.channel == "app", "fpd30"].to_numpy(), f.loc[f.channel == "branch", "fpd30"].to_numpy()
d = [g.choice(a, len(a)).mean() - g.choice(b, len(b)).mean() for _ in range(10_000)]
# ≈ +0.0005 to +0.0130, i.e. +0.05 to +1.30 points — zero is outside; Newcombe
# gave +0.05 to +1.33
print(np.quantile(d, [0.025, 0.975]))
```

The app's FPD is higher by somewhere between 0.05 and 1.30 points; zero is outside, so the difference is significant at 5 %.

**When you use it.**

| | Permutation test | Bootstrap interval |
|---|---|---|
| Answers | could the labels be irrelevant? | how big is the difference, give or take? |
| Gives | a p-value | an interval (and "is 0 inside?") |
| Use for | a yes/no decision | the size you report |

> ⚠️ **Watch out.** Zero just inside the interval is "not significant", not "no difference". Report the interval itself; it shows how large the difference could be.

**Your turn.** A bootstrap interval for the difference in a late rate comes out as −0.4 to +1.1 points. What do you conclude?

### Chi-square or Fisher — small tables

**What it is.** The χ² test is an approximation. It needs every **expected count** (row total × column total / grand total) to be **at least 5**. **Fisher's exact test** (*точный критерий Фишера*) needs no approximation: it adds up the probabilities of every table with the same row and column totals that is as unlikely as the one you saw or more. It is exact at any n.

**How to write it.** The 2026-05 vintage, partner vs branch: 4 FPDs in 67 vs 2 in 179.

| | FPD | no FPD | total |
|---|---|---|---|
| partner | 4 (expected 1.63) | 63 | 67 |
| branch | 2 (expected 4.37) | 177 | 179 |
| total | 6 | 240 | 246 |

```python
# partner vs branch: FPD / no FPD
t = np.array([[4, 63], [2, 177]])
# [[1.63 65.37] [4.37 174.63]] — two cells below 5
print((np.outer(t.sum(axis=1), t.sum(axis=0)) / t.sum()).round(2))

# two-sided Fisher exact test for [[a, b], [c, d]]
def fisher(a, b, c, d):
    r1, c1, n = a + b, a + c, a + b + c + d
    # P(k in the top-left cell) with the margins fixed
    def table_p(k):
        return math.comb(c1, k) * math.comb(n - c1, r1 - k) / math.comb(n, r1)
    p_obs = table_p(a)
    # every possible top-left count
    ks = range(max(0, r1 - (n - c1)), min(r1, c1) + 1)
    # tables as unlikely as ours, or more
    return sum(table_p(k) for k in ks if table_p(k) <= p_obs * (1 + 1e-7))
print(round(fisher(4, 63, 2, 177), 4))  # 0.0485
# scipy (the notebook): scipy.stats.chi2_contingency(t)[1] → 0.083 (Yates),
# correction=False → 0.028; scipy.stats.fisher_exact(t) → p 0.0485
```

Two expected counts are below 5, the two χ² versions disagree (0.028 and 0.083), and Fisher gives the exact answer, p = 0.0485.

**When you use it.**
- Any 2 × 2 table with an expected count below 5: a vintage × channel, a branch-month, a small campaign.
- With a computer you can simply use Fisher for every 2 × 2.

**Your turn.** A branch-month: 3 FPDs in 40 app loans, 1 FPD in 120 branch loans. What is the expected number of FPDs in the app row?

### Multiple comparisons — Bonferroni, Holm, Benjamini–Hochberg

**What it is.** Each test at α = 5 % raises a false alarm 5 % of the time when nothing is real. Run m tests and the chance of **at least one** false alarm — the **family-wise error rate** (*групповая вероятность ошибки*, FWER) — is 1 − 0.95^m: **40 %** for 10 tests. **Corrections for multiple comparisons** (*поправки на множественные сравнения*) adjust the p-values:

- **Bonferroni** (*поправка Бонферрони*): multiply every p by m (cap at 1). Keeps FWER ≤ α; strict.
- **Holm**: sort p from smallest; multiply the smallest by m, the next by m − 1, … and keep the running maximum. The same guarantee, never less power — the default.
- **Benjamini–Hochberg** (*процедура Бенджамини–Хохберга*, BH): controls the **false discovery rate** (FDR) — the expected share of false alarms among the results you flag. Less strict; for screening hundreds of segments.

**How to write it.** Each branch against the other nine (Fisher), then the three corrections:

```python
# 0.401 — at least one false alarm in 10 tests
print(round(1 - 0.95 ** 10, 3))

def holm(pvals):
    pvals = np.asarray(pvals, dtype=float)
    m, adj, run = len(pvals), np.empty(len(pvals)), 0.0
    for rank, i in enumerate(np.argsort(pvals)):     # smallest p first
        # × m, × (m − 1), … keeping the running maximum
        run = max(run, min(1.0, (m - rank) * pvals[i]))
        adj[i] = run
    return adj
def bh(pvals):
    pvals = np.asarray(pvals, dtype=float)
    m, adj, run = len(pvals), np.empty(len(pvals)), 1.0
    for k, i in enumerate(np.argsort(pvals)[::-1]):  # largest p first
        # × m / rank, keeping the running minimum
        run = min(run, pvals[i] * m / (m - k))
        adj[i] = run
    return adj
# [0.0954 0.306 0.804] — yesterday's three channel pairs
print(holm([0.0318, 0.153, 0.804]))

br = f.groupby("branch_name")["fpd30"].agg(["sum", "size"])
k_all, n_all = f["fpd30"].sum(), len(f)              # 91 FPDs in 7 099 loans
br["p"] = [fisher(k, n - k, k_all - k, n_all - n - (k_all - k)) for k, n in zip(br["sum"], br["size"])]
br["bonferroni"] = np.minimum(1, br["p"] * len(br))
br["holm"], br["bh"] = holm(br["p"]), bh(br["p"])
print(br.sort_values("p").head(3).round(3))
# statsmodels (the notebook): statsmodels.stats.multitest.multipletests(p,
# method="holm") — also "bonferroni", "fdr_bh"
```

| branch | FPD / loans | p | Bonferroni | Holm | BH |
|---|---|---|---|---|---|
| Bukhara Central | 14 / 586 | **0.020** | 0.199 | **0.199** | 0.199 |
| Tashkent North | 8 / 921 | 0.273 | 1 | 1 | 0.869 |
| Nukus Central | 3 / 440 | 0.377 | 1 | 1 | 0.869 |

Bukhara's p = 0.020 looks "significant" alone; tested as one of ten, every correction puts it at 0.199. The omnibus χ² of FPD × branch agrees: χ² = 9.97 on 9 df, p = 0.35.

**When you use it.**
- Several branches, segments, products or KPIs tested at once: Holm.
- Hundreds of segments screened for leads to follow up: BH.
- One test chosen in advance: no correction.

> ⚠️ **Watch out.** Count every test you ran, including the ones you looked at and dropped. "We tested ten branches and report the one that came out" without a correction is the false alarm the correction exists to stop.

**Your turn.** Four segment tests give p = 0.01, 0.02, 0.03, 0.20. Run `holm()` and `bh()` on them in the box above. How many stay below 0.05 under BH?

### Peeking — multiple comparisons in time

**What it is.** **Peeking** (*подглядывание*) is testing a running experiment again and again as data arrive, and stopping at the first p < 0.05. Each look is another test, so the false-alarm rate grows like in the previous subsection.

**How to write it.** Simulate an SMS that does **nothing**: both arms 13.34 % late, 150 loans per arm per month, 12 months, 20 000 runs.

```python
g = np.random.default_rng(2026)
p_late, runs, per_month = 947 / 7099, 20_000, 150
# arm A: late first instalments so far, month by month
ka = g.binomial(per_month, p_late, size=(runs, 12)).cumsum(axis=1)
# arm B: identical — the SMS does nothing
kb = g.binomial(per_month, p_late, size=(runs, 12)).cumsum(axis=1)
# loans per arm after 1, 2, …, 12 months
n_arm = per_month * np.arange(1, 13)
pool = (ka + kb) / (2 * n_arm)
# the two-proportion z at every monthly look
z = (ka - kb) / n_arm / np.sqrt(pool * (1 - pool) * 2 / n_arm)
# ≈ 0.05 once at the end, ≈ 0.21 looking monthly
print(np.mean(np.abs(z[:, -1]) > 1.96), np.mean((np.abs(z) > 1.96).any(axis=1)))
```

Testing once at the end gives a false positive about 5 % of the time (the notebook: 5.05 %); looking every month and stopping at the first p < 0.05 gives about **21 %** (20.9 %) — a "winning" SMS one time in five, usually declared in month 3.

**When you use it.**
- Any experiment that runs for weeks or months, and any dashboard that people check while it runs.
- The fix: write the sample size and the end date into the plan before the first loan, and read the result once (or use a sequential design built for peeking — week 7).

> ⚠️ **Watch out.** "Let's check the dashboard every Monday and stop when it turns green" is peeking. It turns a 5 % test into a 21 % one.

**Your turn.** A team checks a test that changes nothing every month for a year and stops at the first p < 0.05. What happens to the 5 % false-positive rate?

### Power and sample size

**What it is.** **Power** (*мощность критерия*) = P(the test rejects H₀ | the effect is real) = 1 − β. It is fixed before any data exist, by five inputs: **α**, the **power** you want, the **baseline** rate, the **effect** you want to detect and **n**. Convention: plan for 80 % power at α = 5 %. For two rates the effect is measured by **Cohen's h** = 2·arcsin√p₁ − 2·arcsin√p₂, and the loans needed **per arm** are:

```
n per arm
  = 2 · ( (z for α/2
           + z for the power) / h )²

FPD 1.28 % → 1.00 %:
  h = 0.02642
  n = 2 · ((1.960 + 0.842) / 0.02642)²
    = 22 481
```

**How to write it.** One calculator for the whole page — sample size, power and (next subsection) MDE:

```python
# the effect size for two rates
def cohens_h(p1, p2):
    return 2 * math.asin(math.sqrt(p1)) - 2 * math.asin(math.sqrt(p2))
# loans needed in EACH group
def n_per_arm(p1, p2, alpha=0.05, power=0.80):
    return 2 * ((zq(1 - alpha / 2) + zq(power)) / cohens_h(p1, p2)) ** 2
# two-sided power with n loans per arm
def power_at(p1, p2, n, alpha=0.05):
    h, za = abs(cohens_h(p1, p2)), zq(1 - alpha / 2)
    return Phi(h * math.sqrt(n / 2) - za) + Phi(-h * math.sqrt(n / 2) - za)
# the lowest rate the treated arm must reach to be seen
def mde_rate(p1, n, alpha=0.05, power=0.80):
    h = (zq(1 - alpha / 2) + zq(power)) * math.sqrt(2 / n)
    return math.sin(math.asin(math.sqrt(p1)) - h / 2) ** 2

# 0.02642 22481 — the base case
print(round(cohens_h(0.0128, 0.010), 5), math.ceil(n_per_arm(0.0128, 0.010)))
# 33452 30096
print(math.ceil(n_per_arm(0.0128, 0.010, alpha=0.01)), math.ceil(n_per_arm(0.0128, 0.010, power=0.90)))
# 3541 2016
print(math.ceil(n_per_arm(0.0128, 0.0064)), math.ceil(n_per_arm(0.128, 0.100)))
# 0.091 — power with 1 000 per arm
print(round(power_at(0.0128, 0.010, 1000), 3))
# statsmodels (the notebook): proportion_effectsize(0.0128, 0.010);
# zt_ind_solve_power(effect_size=h, alpha=0.05, power=0.80)
# Excel:
# =2*((NORM.S.INV(0.975)+NORM.S.INV(0.8))/(2*ASIN(SQRT(0.0128))-2*ASIN(SQRT(0.01))))^2
# → 22 481
```

Change one input at a time from the base case (FPD 1.28 % → 1.00 %, α 5 %, power 80 %):

| Input changed | Loans per arm | What it does |
|---|---|---|
| none — the base case | **22 481** | — |
| α 1 % (stricter) | 33 452 | stricter α → more loans |
| α 10 % (= one-sided 5 %) | 17 709 | looser α → fewer loans |
| power 90 % | 30 096 | more power → more loans |
| effect twice as large: 1.28 → 0.64 % | 3 541 | bigger effect → far fewer (n ∝ 1 / h²) |
| a frequent outcome: 12.8 → 10.0 % (the same −22 %) | 2 016 | a rate far from 0 % → about 11 times fewer |
| n fixed at 1 000 per arm | power **9.1 %** | the test misses a real effect 91 times in 100 |

Detecting FPD falling from 1.28 % to 1.00 % needs 22 481 loans in each arm; with 1 000 per arm the test has a 9 % chance of noticing.

**When you use it.**
- Before every experiment: "how many loans do we need?" and "how long will that take at our volume?".
- Before reading a "not significant": was the test able to see the effect at all?

> ⚠️ **Watch out.** Rare outcomes are expensive to test. A −22 % effect on a 1.28 % rate needs 22 481 loans per arm; the same −22 % on a 12.8 % rate needs 2 016.

### MDE and the power curve — what can this test see?

**What it is.** Turn the sample-size question round. With n fixed, the **minimum detectable effect** (*минимальный детектируемый эффект*, MDE) is the smallest true change the test detects with 80 % power. The **power curve** shows power against n for one effect.

**How to write it.** `mde_rate` and `power_at` from the calculator:

```python
# [0.26, 0.48, 0.87, 1.0]
print([round(100 * mde_rate(0.0128, n), 2) for n in (1000, 2000, 10000, 22481)])
ns = [1000, 2000, 5000, 10000, 22481, 30000]
# FPD30 1.28 → 1.00 %
print([round(100 * power_at(0.0128, 0.010, n), 1) for n in ns])
# late at all 13.3 → 10.7 %
print([round(100 * power_at(947 / 7099, 0.8 * 947 / 7099, n), 1) for n in ns])
```

| loans per arm | 1 000 | 2 000 | 5 000 | 10 000 | 22 481 | 30 000 |
|---|---|---|---|---|---|---|
| MDE from 1.28 % FPD | 0.26 % | 0.48 % | 0.73 % | 0.87 % | 1.00 % | — |
| power, FPD30 1.28 → 1.00 % | 9.1 % | 13.3 % | 26.2 % | 46.4 % | **80.0 %** | 89.9 % |
| power, late at all 13.3 → 10.7 % | 45.2 % | **73.9 %** | 98.4 % | ≈ 100 % | ≈ 100 % | ≈ 100 % |

With 1 000 loans per arm the SMS must cut FPD from 1.28 % to 0.26 % — by 80 % — before the test reliably sees it.

**When you use it.**
- When n is fixed by the business (a month of loans, one region): say what the test *can* see before it runs.
- When you compare metrics: the same SMS judged on a frequent metric reaches 80 % power with ten times fewer loans.

> 💡 **Key idea.** If the MDE is larger than any effect the change could plausibly have, the test cannot succeed. A test with 9 % power is not a cheap test; it is a test whose "no effect" answer is already written.

**Your turn.** With 5 000 loans per arm, how low must the SMS arm's FPD rate fall to be detected (α 5 %, power 80 %)? Use `mde_rate`, answer in % to 2 decimals.

### Effect size — how big the difference is

**What it is.** An **effect size** (*размер эффекта*) says **how big** a difference is, in units that do not grow with n. A p-value says only whether the difference could be chance; with enough data a tiny difference becomes "significant".

- For means: **Cohen's d** (*d Коэна*) = difference of the means / pooled standard deviation. Rough guide: 0.2 small, 0.5 medium, 0.8 large.
- For rates: the **difference in points** (p₁ − p₂), the **relative risk** RR = p₁ / p₂ (*относительный риск*), and Cohen's h (for power).

**How to write it.**

```python
# difference of means in pooled standard deviations
def cohens_d(a, b):
    a, b = np.asarray(a, dtype=float), np.asarray(b, dtype=float)
    sp = math.sqrt(((len(a) - 1) * a.var(ddof=1) + (len(b) - 1) * b.var(ddof=1)) / (len(a) + len(b) - 2))
    return (a.mean() - b.mean()) / sp
# -0.042 — Welch p = 0.02, yet the effect is nothing
print(round(cohens_d(auto, sme), 3))
gr = x.groupby("risk_grade")["days_late"]
# 0.7 — grade D vs grade A: a real difference
print(round(cohens_d(gr.get_group("D"), gr.get_group("A")), 2))
pa, pb = f.loc[f.channel == "app", "fpd30"].mean(), f.loc[f.channel == "branch", "fpd30"].mean()
# 0.66 1.63 0.057
print(round(100 * (pa - pb), 2), round(pa / pb, 2), round(cohens_h(pa, pb), 3))
```

| Comparison | p-value | Effect size | Reading |
|---|---|---|---|
| days late, Auto vs SME | 0.0195 | d = −0.04 | significant, negligible |
| days late, grade D vs A | ≈ 0 | d = 0.70 | large |
| FPD, app vs branch | 0.032 | +0.66 points, RR 1.63 | 6.6 extra FPDs per 1 000 loans; 63 % more often |

Auto and SME differ by 0.04 standard deviations — significant only because there are 12 910 payments; grade D pays 0.7 standard deviations later than grade A, a difference a collector can feel.

**When you use it.**
- In every result you report, next to the p-value.
- In power calculations: the effect size is the input that drives n.

> ⚠️ **Watch out.** "Highly significant" is not "large". Report the difference in the business's units (days, points, soum, RR) with its interval; the p-value only says it is probably not chance.

**Your turn.** Grade C payments average +1.05 days late, grade B −0.31; the pooled standard deviation is 6.44 days. What is Cohen's d (C minus B), to 2 decimals?

### The A/A test

**What it is.** An **A/A test** (*A/A-тест*) splits units into two groups that get the **same** treatment and runs the planned analysis. With nothing different, it should come out "significant" about α of the time. It checks the experiment system — the random split, the logging, the metric pipeline, the test — before a real A/B test trusts it.

**How to write it.** Split real FPD loans into two random groups of 2 000, 2 000 times, and count the false alarms:

```python
g = np.random.default_rng(2026)
y_all, hits = f["fpd30"].to_numpy(), 0
for _ in range(2000):
    # 4 000 real loans: the first 2 000 are "A", the rest "A" again
    s = g.choice(y_all, 4000, replace=False)
    ka, kb = s[:2000].sum(), s[2000:].sum()
    pool = (ka + kb) / 4000
    hits += abs(ka - kb) / 2000 / math.sqrt(pool * (1 - pool) * 2 / 2000) > 1.96
# ≈ 0.05 (the notebook's run: 0.049) — about α, as it should be
print(hits / 2000)
```

About 5 % of the A/A splits come out "significant" (the notebook: 4.9 %) — that is α, so the split and the test behave.

**When you use it.**
- Before the first A/B test on a new system, and after any change to how units are assigned or logged.
- A false-positive rate well above α (say 15 %) means a broken split or a wrong test, not bad luck.

**Your turn.** An A/A test, run 1 000 times on the new experiment platform, comes out "significant" 15 % of the time. What does that mean?

### Putting it together

One request, several of today's tools. *"Micro payments look late. Is Micro really different from each other product, and by how much?"*

```python
micro = x.loc[x.code == "MICRO", "days_late"]
others = ["CONS", "BNPL", "AUTO", "SME"]
res = pd.DataFrame(
    [(c, *mann_whitney(micro, x.loc[x.code == c, "days_late"])[1:], cohens_d(micro, x.loc[x.code == c, "days_late"])) for c in others],
    columns=["vs", "P(Micro later)", "p", "d"])
# four pairwise tests → correct for four
res["holm"] = holm(res["p"])
# P 0.52–0.53, every Holm p below 1e-6, d 0.08–0.12
print(res.round({"P(Micro later)": 3, "d": 3}))
```

Read it with the questions from this section:

1. **Which test?** Days late are skewed and the question is about the typical payment → ranks. Five groups → **Kruskal–Wallis** first: H = 61.0, p = 1.8 × 10⁻¹² — some product differs.
2. **Which one?** Four pairwise **Mann–Whitney** tests, Micro against each other product.
3. **Four tests, one family** → **Holm**. All four stay below 10⁻⁶.
4. **How big?** **Effect size**: a Micro payment is later than another product's 52–53 % of the time, d = 0.08–0.12. Real, consistent and small: worth a reminder on Micro loans, not a pricing change.

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Mann–Whitney — [Mann-Whitney U Test [Simply explained] (numiqo), 00:23](https://youtu.be/LcxB56PzylA?t=23)
- ▶ Wilcoxon signed-rank and the other rank tests — [Non-parametric tests - Sign test, Wilcoxon signed rank, Mann-Whitney (zedstatistics), 11:26](https://youtu.be/IcLSKko2tsg?t=686&end=1230)
- ▶ Multiple comparisons — [The Bonferroni Correction - Clearly Explained (Steven Bradburn), 01:31](https://youtu.be/HLzS5wPqWR0?t=91)
- ▶ Multiple comparisons and false discovery rate — [False Discovery Rates, FDR, clearly explained (StatQuest), 12:28](https://youtu.be/K8LQSvtjcEo?t=748)
- ▶ Statistical power — [Statistical Power, Clearly Explained!!! (StatQuest), 03:19](https://youtu.be/Rsc5znwR5FA?t=199&end=297)
- ▶ Power and sample size calculation — [Power Analysis, Clearly Explained!!! (StatQuest), 11:48](https://youtu.be/VX_M3tIyiYk?t=708&end=910)
- ▶ Power calculations (also p-hacking) — [p-hacking and power calculations (StatQuest), 14:12](https://youtu.be/UFhJefdVCjE?t=852)

- RU deck (TBC Data Analytics 2.0, if you have it) `Непараметрические тесты_latest.pdf` (lesson 5.5): normality checks and log-transform pp. 9–12, which test to choose pp. 13–14, ranks and Mann–Whitney pp. 15–16, Wilcoxon for paired samples pp. 17–18, Kruskal–Wallis p. 19, bootstrap pp. 20–21, power p. 22, MDE p. 23, A/A tests p. 24. Multiple comparisons: `Параметрические тесты (2).pdf` pp. 47–49 (Bonferroni, Tukey HSD).
- Notebooks: `non-parametric.ipynb` (sample-mean normality, Mann–Whitney on exponential data, Wilcoxon, Kruskal–Wallis, bootstrap), `power.ipynb` (power by simulation: 1 000 t-tests on a 1 % shift — the same idea as our simulation cell). `стат_критерии.docx` is a reading list (Habr / YouTube articles on test choice, Mann–Whitney pitfalls, sample size); the card in section 2 is our own.
- *Russian terms:* непараметрический критерий = non-parametric test, ранг = rank, U-критерий Манна–Уитни = Mann–Whitney U, критерий Вилкоксона = Wilcoxon signed-rank, критерий Краскела–Уоллиса = Kruskal–Wallis, перестановочный тест = permutation test, точный критерий Фишера = Fisher's exact test, множественные сравнения = multiple comparisons, поправка Бонферрони / Холма = Bonferroni / Holm correction, мощность = power, объём выборки = sample size, MDE (минимальный детектируемый эффект) = minimum detectable effect, A/A-тест = A/A test.

**Questions inside the videos.** Open a video from the panel: it stops at these points and asks one question about the bit you just watched.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 6 · Day 5 — Checkpoint: intervals and the test-choice quiz (weeks/week-06/day-5.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-06/day-5
=====

# Week 6 · Day 5 — Checkpoint: intervals and the test-choice quiz

<span class="badge">Analyses 120 min</span> <span class="badge">Quiz 45 min</span> <span class="badge">Interview 30 min</span> <span class="badge hw">Checkpoint · 100 points</span>

> STORY **Friday, 9:00.** Madina, Nilufar and Jasur. Madina: *"This week you learned to say how sure you are. Today you prove it: five analyses on our own data, each with a number, an interval or a p-value, and two sentences a risk manager can repeat. Then twelve situations — you name the test before you touch the data. Then the questions every analyst interview asks about p-values."* Nilufar: *"And the committee note went down well. The committee asked for the same discipline on every number. That starts with you."* Jasur: *"No p-value without its effect size. I will check."*

## Today in 3 lines

- **Part A (50 pts):** `checkpoint.ipynb` from `data/python/week6/checkpoint_template.ipynb` — five analyses on Nur data (a t interval, Wilson intervals, a proportions test, a Mann–Whitney test, a power calculation), each with the result printed and a two-sentence interpretation.
- **Part B (30 pts):** the test-choice quiz — twelve short scenarios; for each, the test and one line of why.
- **Part C (20 pts):** eight interview questions, 3–5 sentences each. Parts B and C go into `quiz.md`.

**Rules.** Open book: this week's pages, your notebooks, the reference card (Day 4, section 2). Hand in with the **📎 box at the end of this page**: `checkpoint.ipynb` (executed — Kernel → Restart & Run All, then save) and `quiz.md`. Also due today: **HW 6.2**, in [Day 2's hand-in box](weeks/week-06/day-2.md). Data as of **2026-10-01**; the template's loader builds `loans`, `f` (FPD30 loans), `x` (52 850 clean payments with `days_late` and `late`) and `apps`. Closed: the model answers until you submit.

**What every Part A answer contains** (graded): the grain in a comment; the code; the output (numbers visible in the saved notebook); the method named (t, Wilson, z, Mann–Whitney, Cohen's h); and **two sentences**: what the number says, and what someone should do or not do with it. A correct number with no interpretation earns 6 of 10.

> 💡 **Key idea.** An answer this week has three parts: the number, how sure you are of it (interval or p-value, with the method named), and what someone should do with it. Drop any one and the reader cannot act.

**Plan for the day.**

| Time | What | Output |
|---|---|---|
| 9:00–9:15 | Read all three parts; open the template; Restart & Run All (the loader asserts 7 828 / 7 099 / 91 / 52 850) | a green first cell |
| 9:15–11:15 | Part A, A1 → A5, 20–25 min each | five result cells, five interpretations |
| 11:15–11:30 | Break; Restart & Run All; save; then the warm-up below Part A (six quick checks, not graded) | `checkpoint.ipynb` with outputs |
| 11:30–12:15 | Part B in `quiz.md` — name the test before you look anything up, then check the Day 4 card | twelve lines |
| 12:15–12:45 | Part C in `quiz.md` | eight short answers |
| 12:45–13:00 | The checklist at the end; hand in (box below) | done |

**The shape of one Part A answer** (Day 3's committee habit, shortened):

```python
# (shape only — not meant to run)
# A0 (example). FPD30, app vs branch — grain: one loan in FPD scope (f, 7 099
# rows)
k = f.groupby("channel")["fpd30"].agg(["sum", "size"]).loc[["app", "branch"]]
# (2.147, 0.0318)
print(proportions_ztest(k["sum"], k["size"]))
# (+0.0005, +0.0133)
print(confint_proportions_2indep(41, 2411, 34, 3263, method="newcomb"))
```

> **Interpretation.** App FPD30 is 1.70 % vs 1.04 % for branch (+0.66 points, 95 % CI +0.05 to +1.33; z-test p = 0.032), about 7 extra first-payment defaults per 1 000 loans. The gap is real at 5 % but small in money and confounded with product, so it supports a cheap fix and a re-test, not closing the channel.

Two sentences: the number with its uncertainty and test, then what it means for a decision. Nothing about "the null hypothesis is rejected" without saying which hypothesis, in business words.

Put the parts of one answer cell in the order a reviewer reads them:

One sentence of this A0 write-up would lose points — tap it:

---

## Part A — Five analyses on Nur data (120 min, 50 pts)

### A1. CI for the average principal by product (t interval) — 10 pts

- **Data.** `loans` — one row per loan (7 828), grouped by product (`code`).
- **Do.** For each of the five products: n, mean, sd (ddof = 1), the 95 % t interval, and the half-width as % of the mean.
- **Answer.** Which product's average do you know least precisely, and why — n or sd? In the box: that product's half-width as % of its mean, to 2 decimals.
- **Taught in.** Day 2, story "A net for the average — the t interval"; the Python in Going further, "Confidence interval for a mean — t, not z".

*Deductions seen most often:* `std()` from numpy (ddof 0) instead of `ddof=1`; a z value instead of t; the half-width given in soum only, so products cannot be compared; "Auto is least precise because its loans are big" (it is n and the relative spread, not the size).

### A2. CI for the approval rate by channel (Wilson) — 10 pts

- **Data.** `apps` — one row per application; keep the **decided** ones (status ≠ `cancelled`, 12 183 rows).
- **Do.** Approved = status starting with `approved`. Per channel: approved, decided, the rate and its Wilson 95 % interval.
- **Answer.** Do the app and branch intervals overlap, and what does that say about the gap? In the box: the app's lower Wilson limit, in % to 2 decimals.
- **Taught in.** Day 2, story "A net for a rate — Wald breaks, Wilson holds" and the Worked example; the Python in Going further, "The Wilson interval — the right default for a rate".

*Deductions seen most often:* cancelled applications left in the denominator (that gives 58.2 / 63.7 / 61.9 % — say which convention you use); `approved_not_disbursed` counted as not approved; a Wald interval; "they do not overlap, so app is worse" without a word on why.

**Excel cross-check (optional).** A1: `=AVERAGE(r)`, `=STDEV.S(r)`, `=CONFIDENCE.T(0.05, STDEV.S(r), COUNT(r))` per product from a pivot of `loans_status.csv`. A2: with k in B1, n in B2 and z in B3, the Wilson limits of Day 2's formula; Clopper–Pearson `=BETA.INV(0.025, B1, B2-B1+1)` and `=BETA.INV(0.975, B1+1, B2-B1)` as the conservative check. Matching Python to the third decimal is the point.

### A3. Test: late-payment rate, customer segment sme vs mass — 10 pts

- **Data.** `x` — the 52 850 clean payments; late = paid after the due date. The segment is the customer's (`customers.segment`, reached through `loans.customer_id`).
- **Do.** A two-proportion z-test (or χ² on the 2 × 2), sme vs mass, on payments. Then the loan-level check: any late payment per loan, same test.
- **Answer.** p, the difference in points, the relative risk — and one sentence on what the grain (payments, not loans) does to the test. In the box: z on payments, sme first, to 2 decimals.
- **Taught in.** Day 3, story "A ruler made of noise — z, and one tail or two", and Day 3 P12 (payments vs loans); the Python in Going further, "Test for two proportions — z".

*Deductions seen most often:* raw payments (52 875, with the 25 duplicates) instead of clean ones; "p = 0.21, so the two segments pay exactly the same" (absence of evidence, not proof); no relative risk; the grain sentence missing (payments of one loan are not independent; the loan-level check is the honest version).

### A4. Test: days late, Consumer loans of grade B vs grade C — 10 pts

- **Data.** `x` — the clean payments of Consumer loans (`code == "CONS"`), grade B and grade C.
- **Do.** First the shape of days late per grade: median, mean, skew, share paid late — and one sentence on why not a t-test. Then a two-sided Mann–Whitney U test, grade B first.
- **Answer.** The p-value and the probability of superiority U / (n₁·n₂). In the box: U / (n₁·n₂), to 3 decimals.
- **Taught in.** Day 4, story "Who wins more pairs — the Mann–Whitney test", and Day 4 P2; the Python in Going further, "Mann–Whitney U — two independent groups by ranks".

*Deductions seen most often:* "the medians differ" (they are equal); a t-test with no reason given; the effect size missing — a p of 10⁻²⁶ on 15 650 payments says nothing about size without the 45.0 %; all grade B and C payments used instead of the Consumer ones.

### A5. Power: loans needed to detect +2 pp on the app approval rate — 10 pts

- **Data.** The baseline is the app's decided approval rate from A2; `apps` gives the monthly volume of decided app applications in 2026 (whole months only).
- **Do.** Cohen's h for baseline + 2 points; α 0.05 two-sided, power 0.80 → decided applications per arm (round up).
- **Answer.** n per arm, n in total, and how many months of app traffic that is.
- **Taught in.** Day 4, story "Can the test see it? — power and sample size"; the Python in Going further, "Power and sample size".

*Deductions seen most often:* the all-applications rate (58.2 %) as the baseline instead of the decided one; n for both arms reported as "per arm"; a one-sided test without saying so; the one day of October counted as a month; no translation into months — the number that makes the decision.

**If you are stuck (hints, not answers).**

- A1: `loans.groupby("code")["principal"]`, then `stats.t.interval(0.95, n - 1, loc=mean, scale=sd / np.sqrt(n))` per group — Day 2, "Confidence interval for a mean".
- A2: filter `status != "cancelled"` first; `status.str.startswith("approved")` is the numerator; `proportion_confint(..., method="wilson")` — Day 2, worked example.
- A3: the segment comes from `customers` through `loans.customer_id` — merge it onto `x` by `loan_id`; then `pd.crosstab(…, x.late)` on the two segments; for the loan level, `groupby(["loan_id", "segment"]).late.max()` — Day 3, P12.
- A4: filter `x` on `code == "CONS"` and the grade first; describe (`median`, `mean`, `stats.skew`, `(v > 0).mean()`), then `stats.mannwhitneyu(..., alternative="two-sided")` — Day 4, P2.
- A5: your `n_per_arm` from Day 4 works with `p2 = p1 + 0.02`; the months are `2 * n / monthly_volume`, the volume from whole months only — Day 4, Company corner.

---

## Warm-up (not graded, 10 min) — six quick checks

A break between Part A and Part B: the statistics lessons of the RU decks end with short quizzes, and here are their best ideas, on our data. Six questions, one at a time; the fold below has the longer answers.

---

## Part B — The test-choice quiz (45 min, 30 pts)

### A game first — which test?

(Animated explanation)
Which test? A game
- Three questions pick almost every test: **what is measured**, **which groups**, and one **check** — is there enough data for the formula? Four quick cases. Answer, and the path lights up.
- **Case 1.** The May 2026 vintage: 4 FPDs in 67 partner loans, 2 in 179 branch loans. Does the channel matter?
- A rate. Next: who is compared with whom?
- The check: if the channel didn't matter, partner would expect only 1.63 FPDs — below 5. Too little for the formula.
- Rate → two independent groups → too little data → **Fisher**. Now the same question with plenty of data.
- **Case 2.** The whole book, app vs branch: 41 FPDs in 2 411 app loans, 34 in 3 263 branch loans. Same shape — a rate, two groups. The check now expects 31.9 FPDs in the app row.
- Rate → two independent groups → enough data → the **two-proportion z-test** (χ² on the 2 × 2 table gives the same p).
- **Case 3.** Risk grade (A, B, C, D) of app loans against branch loans. Are app borrowers in worse grades?
- An order, two independent groups.
- Order → two independent groups → **Mann–Whitney**, whatever the size. With three or more channels: Kruskal–Wallis.
- **Case 4.** The same 200 customers' credit scores, before and after a financial-literacy course. Did the course move them?
- A number, the same customers twice, plenty of data → the **paired t-test** (with few or skewed differences: Wilcoxon signed-rank). The same three questions every time — use them on the twelve scenarios below.

**Now the twelve scenarios.**

- **Do.** For each of the twelve scenarios, name **the test** — plus the correction or the follow-up, if one is needed.
- **Write.** One line of **why**: the outcome type (number or yes/no), the number of groups, paired or not, and what breaks the default test.
- **Where.** `quiz.md`, one line per scenario: `1. Test: … — Why: …`.
- **Points.** 2.5 each: the right test 1.5, the reason 1.

> ⚠️ **Watch out.** Name the test *before* you open the Day 4 card — the card is for checking your choice, not for making it. And watch for the two traps the scenarios hide: the same units measured twice (paired), and many tests at once (a correction).

1. Compare the average ticket across the five products.
2. Is FPD30 independent of the customer's region (eight regions)?
3. Forty collectors used the old call script in August and the new one in September; compare each collector's promise-to-pay rate before and after.
4. A pilot branch opened in June: 3 FPDs in its first 60 loans. Is it worse than the book (1.28 %)?
5. Do app applicants have a different average credit score from branch applicants (4 874 vs 6 049 scores)?
6. Does a typical Micro payment arrive later than a typical BNPL payment (days late per payment)?
7. The same 500 applications were scored by the old and the new scorecard; each gives approve / reject. Does the new one approve more?
8. Two collection strategies, 300 delinquent loans each: compare the collection rate Σ paid / Σ due.
9. Is a higher credit score associated with fewer days late (per loan, average days late)?
10. Timur's dashboard has 25 KPIs; he tests each month-on-month change at 5 % and colours the "significant" ones red.
11. Marketing will test a new app screen on approval rate next month. What do you do before the test starts?
12. Three call-centre scripts, ~400 calls each; outcome: promise to pay yes/no. Which script is best?

---

## Part C — Eight interview questions (30 min, 20 pts)

- **Do.** Answer each of the eight questions in 3–5 sentences: the definition, a Nur number that shows you have used it, the trap.
- **Where.** `quiz.md`, under `## Part C`.
- **Points.** 2.5 each: correct, in your own words, with a number or an example.

> 🎯 **Interview version.** Every answer has the same skeleton: the definition in one sentence, a Nur number that shows you have used it, and the trap people fall into. "p = 0.03 means… — for app vs branch FPD that was… — it is *not* the probability that…".

1. What does a p-value of 0.03 mean? Give the definition and two common misreadings.
2. What does a 95 % confidence interval mean — and what does it not mean?
3. Type I vs type II error: define both, give a lending example of each, and say which one α controls.
4. Why does an FPD rate of 1.28 % need a Wilson interval rather than "p ± 1.96 · SE", especially for a branch or a month?
5. State the central limit theorem in one sentence, and say why it matters for an analyst who works with very skewed loan amounts.
6. A result is "statistically significant". Why is that not enough — what do you report next to it?
7. You test ten branches and one is significant at 5 %. What is the problem and how do you handle it?
8. What is statistical power, what does it depend on, and why should you compute it *before* an experiment?

**Follow-ups an interviewer adds** (prepare one sentence each): *"Why n − 1 in the sample variance?"* (unbiased; Day 2) · *"When would you use a one-sided test?"* (pre-registered, one direction changes the action; Day 3) · *"Bootstrap or t-interval?"* (skewed statistic or no formula → bootstrap; Day 2) · *"What is an A/A test for?"* (the system; Day 4) · *"How do you choose α?"* (by the cost of a false alarm vs a miss, before the data) · *"What if the p-value is 0.051?"* (nothing magical happens at 0.05: report the effect and its interval, and the decision it supports).

---

## Before you submit

- [ ] Kernel → Restart & Run All finishes with no red cell; the loader's assert passed; the file is saved **after** the run.
- [ ] Every Part A cell prints its numbers (a DataFrame shown, or `print`) — the reviewer reads the saved outputs, not your code.
- [ ] Every rate has its n; every interval says its method (t, Wilson) and level (95 %).
- [ ] Every test names itself and gives the p-value to two significant digits (or "p < 0.001") **and** an effect size.
- [ ] A3 says what the payment grain does; A4 says why not a t-test; A5 converts loans into months.
- [ ] Ten interpretations, two per task: what the number says, what to do with it.
- [ ] `quiz.md` has twelve Part B lines (test + why) and eight Part C answers.

**`quiz.md` skeleton:**

```markdown
# Checkpoint 6 — quiz
## Part B
1. Test: … — Why: …
…
12. Test: … — Why: …
## Part C
1. p-value: …
…
8. Power: …

```

---

## Scoring and what happens next

| Part | Points | What earns them |
|---|---|---|
| A — five analyses | 50 | per task: correct method and numbers (6), two-sentence interpretation that says what to do (4) |
| B — test-choice quiz | 30 | 2.5 per scenario: the right test (1.5) and a reason that names outcome type, groups, pairing or the broken assumption (1) |
| C — interview | 20 | 2.5 per answer: correct, in your words, with a number or example |

**70 points** to move on. Below 70, the feedback lists the sections to redo (a focused redo, not the whole week). Points go to the [Progress page](progress.md). Next week the tests become **experiments**: A/B testing (randomisation, A/A, sequential looks, guardrails) on Nur's app funnel, and the first Power BI dashboard — where every rate gets its n and its interval.

**Week 6 in five sentences** (what you can now say in any meeting):

1. "Expect 5 FPDs in 400 loans; 10 or more happens 3.6 % of the time if nothing changed" — a binomial tail, not a gut feeling.
2. "App FPD is 1.70 %, 95 % CI 1.26–2.30 %, n = 2 411" — every rate with its n and its Wilson interval.
3. "App is higher than branch, p = 0.03, about 7 extra FPDs per 1 000 loans, ~15 m soum a year" — a test with its effect size and its money.
4. "Bukhara's p = 0.02 is one of ten tests; after Holm it is 0.20" — multiple comparisons before blame.
5. "2 000 loans give 9 % power for that SMS; measure lateness instead" — power before the experiment, not after.

> 💡 **Key idea.** All five sentences have the same shape: a number, its uncertainty, and the decision it supports. That shape is what next week's A/B tests and every Power BI tile will ask of you.

> 🚀 **Stretch (optional, +5 XP).** Write `nur_stats.py` with `wilson_table(df, by, outcome)`, `two_rates_note(k1, n1, k2, n2)` (prints the six-line committee note: rates with Wilson CIs, difference with Newcombe CI, z and Fisher p, RR, extra per 1 000) and `power_note(p1, p2, n_per_arm)` (power, n needed, MDE). Run `two_rates_note` on grade C vs D FPD30 (44 / 2 034 vs 7 / 314) and `power_note(0.0128, 0.010, 1000)`. One module, three functions, every committee question of this week answered in one line each.

---

### 📎 Hand in here

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 6 · Day 6 — Section exam: Statistics (Week 6) (weeks/week-06/day-6.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-06/day-6
=====

# Week 6 · Day 6 — Section exam: Statistics (Week 6)

<span class="badge">Exam 60 min</span> <span class="badge">Interview 45 min</span> <span class="badge hw">Exam · 100 points</span>

> STORY **Exam day, 10:00.** Madina and Nilufar sit across the desk. Madina: *"Week 6 was about saying how sure you are. Today I want to hear you do it. First a written check, with the traps inside. Then an interview, the way Nilufar's risk committee would run it. Your notes are welcome. Nobody answers for you."*

## Today in 3 lines

- You show that you can reason with numbers when you are not sure: probability, intervals, tests, corrections and power from Week 6.
- **Part A (40 points):** 25 quick questions with the classic traps inside. It is marked on the spot.
- **Part B (60 points):** an interview on the Nur Finance data — five questions you answer in words and three small tasks you work out. Your mentor reads it.

---

## 1. How the exam works

- **Two parts.** Part A is a quiz: 25 questions, 40 points, marked at once. Part B is an interview: eight written answers, 60 points, marked by your mentor.
- **Pass mark.** You need 70 of 100 points. In Part A, 80 % right (20 of 25) counts as done. You can repeat Part A as often as you like, and your best attempt counts.
- **What it covers.** All of Week 6: probability and distributions, samples and confidence intervals, and the two days of tests, corrections and power. About a third of the questions come from earlier sections (SQL, Excel and Python), because every statistic starts as a query or a table.
- **Open book.** The course pages, your own notes and the [SQL playground](playground.md) are allowed. Chatbots and asking other people are not. A real interview works the same way: you may bring notes, but nobody answers for you.
- **Time.** Plan 60 minutes for Part A and 45 minutes for Part B.
- **Deadline.** Part B is due at 23:59 on the day of Week 7 · Day 1 (the menu shows the date). Part A can be taken any time before that.
- **After the exam.** Your mentor reviews Part B and sends structured feedback.

---

## 2. Part A — Quick check (40 points)

25 questions in one quiz. Some have one right answer, some have several, some ask for a number or a word. A few say *run it*: use the [SQL playground](playground.md) for those. After each answer the quiz tells you why. Questions 1–16 are about Week 6, in the order of the week (Day 1 to Day 4). Questions 17–25 come from SQL, Excel and Python.

---

## 3. Part B — Interview (60 points)

Eight written answers. Write them as you would say them aloud to a hiring manager.

- **I1–I5 are interview questions.** Answer in 4–6 sentences and use one number from Nur Finance.
- **I6–I8 are small tasks on the data.** Write the query or the code, then the numbers you get and one sentence. Every number is as of 2026-10-01. For I7 and I8 use Week 6's FPD frame: the loans whose first instalment fell due on or before 2026-09-01 (the first cell of any Week 6 notebook builds it).
- Write in your own words. Short and exact beats long.

### 📎 Hand in here

---

## 4. Scoring and what happens next

| Part | Points | Marked by |
|---|---|---|
| A — Quick check | 40 | automatic, your best attempt |
| B — Interview | 60 | your mentor |
| **Total** | **100** | **70 or more passes** |

A pass closes the statistics block: you have shown that you can say how sure you are of a number and what to do with it. A/B tests and the first Power BI dashboard come next. Below 70, the feedback names the topics to repeat, and you and your mentor decide when to try Part B again.

Your feedback arrives on the **[My feedback](feedback.md)** page and in the course bot. Your points go to the [Progress page](progress.md).
