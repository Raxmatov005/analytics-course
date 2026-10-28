# Week 4 · Day 1 — Excel for analysts: the sheet is a table

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge">Homework</span> <span class="badge company">Company corner</span>

> STORY **Monday, 9:00.** Bekzod, the portfolio manager (*портфельный менеджер*), with the board pack open on his laptop. *"Friday's EDA was good. Now the problem: the board does not read SQL, the CFO does not open a database, and the pack is an Excel file that twelve people edit. I need the portfolio numbers — active loans, outstanding, this year's disbursements, the buckets — **in Excel**, as formulas that still work when the data is refreshed, not as numbers pasted from a query. And the approval rate by channel, because Marketing has their own version again."*

## Today in 3 lines

- Most of the company lives in Excel and Google Sheets; your SQL results have to arrive there as **formulas on a table**, not as pasted numbers.
- An Excel **Table** (Ctrl+T) is your `FROM`; **SUMIFS / COUNTIFS / AVERAGEIFS / MAXIFS** are your `WHERE` + `GROUP BY`; **IF / IFS** is `CASE`; **TRIM / PROPER / LEFT / TEXT** are week 2's string functions with new names.
- By evening you reproduce the week-3 numbers (3 352 active · 208 723 504 430 outstanding · 2026: 3 051 loans / 162 333 060 000) and the approval rate by channel, in cells.

**Today's file:** `data/excel/nur_week4_start.xlsx` — press **⬇ Download** next to the name, then save a copy as `week-04/day-1/practice.xlsx` before you type anything (never work in the original). Google Sheets: import the five CSVs from `data/excel/`, one tab each. **Done today** = the Worked example's check cell shows 208 723 504 430, every Practice box below is ✓, the Quick check is answered, the day quiz is passed — and `functions_pack.xlsx` (HW 4.1) is on its way (due Day 3).

---

## 1. Learn — the sheet is a table, if you make it one

Every number from weeks 1–3 ends up in a spreadsheet: the board pack, the budget, Sevara's printed collections list. The analyst's rule in Excel (*Эксель*) is the same as in SQL: **one definition, computed from the data, reproducible**. A pasted number is wrong the day the data changes; a formula on a table is not.

Open `data/excel/nur_week4_start.xlsx` (built from `nur.db`; `data/excel/README.md` describes every column). It has five data sheets — **Loans**, **Payments**, **Customers**, **Applications**, **Installments** — and a **Lookup** sheet. `Loans` is week 3's `v_loan_status` with fewer columns: one row per loan, as of 2026-10-01. Google Sheets: File → Import each CSV from `data/excel/` into one spreadsheet, one tab per file.

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

> ⚠️ **Watch out.** A total row typed inside the data is counted twice by every `SUM` below it. Keep totals outside the table — Excel Tables have a separate *Total Row* for this.

**Your turn.** Look at the left block above. Which of these break the table rules?

```task
{"id": "w04d1-l1", "kind": "multi", "options": ["The region name is in a merged cell above its numbers", "The months run across the header (Aug, Sep) instead of down a month column", "There is a blank row between Tashkent and Fergana", "Every column has a header", "A Total row sits inside the data"], "answer": [0, 1, 2, 4], "explain": "Merged cells, months across the header, a blank row and a total inside the data all break the rules. A header on every column is rule 1 — that one is right."}
```

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

```task
{"id": "w04d1-l2", "kind": "choice", "options": ["=SUM(Loans!K2:K7829)", "=SUM(Loans!$K$2:$K$7829)", "=SUM(tblLoans[outstanding])", "=SUBTOTAL(9, Loans!K2:K7829)"], "answer": 2, "explain": "Only the Table column grows with the Table. Every fixed range stops at row 7 829, with or without $."}
```

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

```task
{"id": "w04d1-l3", "kind": "choice", "options": ["=$A3*B$2", "=$A5*D$2", "=$A5*D$4", "=$C5*D$2"], "answer": 1, "explain": "B3 → D5 is 2 columns right and 2 rows down. $A3 keeps column A, so only the row moves: $A5. B$2 keeps row 2, so only the column moves: D$2."}
```

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

```task
{"id": "w04d1-l4", "kind": "number", "answer": 356, "dp": 0, "unit": "customers", "hint": "Rows minus rows that have a number: COUNTA on the id column, COUNT on the income column.", "model": "=COUNTA(tblCustomers[customer_id]) - COUNT(tblCustomers[monthly_income]) → 6 040 − 5 684 = 356. =COUNTBLANK(tblCustomers[monthly_income]) gives the same 356."}
```

### COUNTIFS, SUMIFS, AVERAGEIFS — an aggregate with a condition

**What it is.** These functions add up, count or average only the rows that meet a **criterion** (*условие*). `SUMIFS` is `SELECT SUM(x) FROM t WHERE …` in one cell. `MAXIFS` and `MINIFS` work the same way.

```pic
{"id": "w04d1-pic1", "title": "SUMIFS adds only the rows that meet the criterion", "caption": "The criterion `\"active\"` is checked in column C. Green rows pass and their `outstanding` is added: 100 + 50 + 30 = **180**; struck-through rows are skipped. COUNTIFS counts the same three rows; AVERAGEIFS divides 180 by 3.", "tables": [{"id": "src", "name": "A1:F6", "label": "small table", "cols": ["loan_id", "status", "dpd", "outstanding"], "rows": [[101, "active", 0, 100], [102, "active", 12, 50], [103, "default", 95, 40], [104, "active", 45, 30], [105, "closed", 0, 0]], "tags": {"status": "C: criterion", "outstanding": "F: summed"}, "keep": [0, 1, 3], "drop": [2, 4]}, {"id": "res", "name": "result", "cols": ["COUNTIFS", "SUMIFS", "AVERAGEIFS"], "rows": [[3, 180, 60]], "via": "C2:C6 = \"active\""}]}
```

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

```task
{"id": "w04d1-l5", "kind": "number", "answer": 3586, "dp": 0, "unit": "loans", "hint": "The criterion is \"<>closed\" — the operator inside the quotes.", "model": "=COUNTIFS(tblLoans[status], \"<>closed\") → 3 586 = 3 352 active + 44 default + 190 written_off."}
```

### Several criteria — every pair is one more AND

**What it is.** `SUMIFS`, `COUNTIFS` and `AVERAGEIFS` take up to 127 **pairs** of (criteria range, criterion). A row is counted only when it meets **every** pair. Each pair is one more `AND` in the `WHERE`.

```pic
{"id": "w04d1-pic2", "title": "Two pairs: a row must pass both", "caption": "Loan 101 is active but not late; 103 is late but not active; 105 is neither — all three are dropped. Only 102 and 104 pass **both** pairs: 50 + 30 = **80**.", "tables": [{"id": "src", "name": "A1:F6", "label": "small table", "cols": ["loan_id", "status", "dpd", "outstanding"], "rows": [[101, "active", 0, 100], [102, "active", 12, 50], [103, "default", 95, 40], [104, "active", 45, 30], [105, "closed", 0, 0]], "tags": {"status": "C: \"active\"", "dpd": "E: \">0\""}, "keep": [1, 3], "drop": [0, 2, 4]}, {"id": "res", "name": "result", "cols": ["COUNTIFS", "SUMIFS"], "rows": [[2, 80]], "via": "\"active\" AND \">0\""}]}
```

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

```game
{"type": "cloze", "id": "w04d1-g2", "code": true, "title": "Fill the SUMIFS: outstanding of active loans more than 30 days late", "text": "=SUMIFS({{0}}, tblLoans[status], {{1}}, tblLoans[dpd], {{2}})", "blanks": [["tblLoans[outstanding]"], ["\"active\""], ["\">30\""]], "distractors": ["tblLoans[status]", ">30", "\"<>active\"", "\">=30\""]}
```

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

> ⚠️ **Watch out.** Wildcards work in `COUNTIFS`/`SUMIFS` criteria (and in tomorrow's `XLOOKUP` with match mode 2). They do **not** work with `=`: `=B2="Tashkent*"` looks for a real star in the text.

**Your turn.** How many loans were made by a branch whose name ends in `Central`?

```task
{"id": "w04d1-l6", "kind": "number", "answer": 5809, "dp": 0, "unit": "loans", "hint": "The star goes in front: \"*Central\".", "model": "=COUNTIFS(tblLoans[branch], \"*Central\") → 5 809. The other 2 019 are Tashkent North (1 007) and Tashkent South (1 012)."}
```

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

> ⚠️ **Watch out.** A date stored as **text** looks like a date but is skipped by every date criterion — your count comes out low and nothing turns red. In a date column `=ISNUMBER(D2)` must say TRUE. Wednesday fixes the ones that do not.

**Your turn.** How many loans were disbursed in calendar year **2025**?

```task
{"id": "w04d1-l7", "kind": "number", "answer": 3041, "dp": 0, "unit": "loans", "hint": "Two pairs on disbursed_at: \">=\"&DATE(2025,1,1) and \"<\"&DATE(2026,1,1).", "model": "=COUNTIFS(tblLoans[disbursed_at], \">=\"&DATE(2025,1,1), tblLoans[disbursed_at], \"<\"&DATE(2026,1,1)) → 3 041 loans; the same pairs in SUMIFS on principal give 155 927 230 000."}
```

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

```task
{"id": "w04d1-l8", "kind": "choice", "options": ["=COUNTIFS(tblLoans[outstanding], \">\"&tblLoans[principal]/2)", "=SUMPRODUCT(--(tblLoans[outstanding] > tblLoans[principal]/2))", "=SUM(tblLoans[outstanding] > tblLoans[principal]/2)", "=COUNTIFS(tblLoans[outstanding], \">principal/2\")"], "answer": 1, "explain": "The test compares two columns row by row, which a COUNTIFS criterion cannot do. SUMPRODUCT(--(…)) turns the TRUE/FALSE column into 1/0 and adds it up."}
```

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

```task
{"id": "w04d1-l9", "kind": "choice", "options": ["\"ok\"", "\"low\"", "#VALUE!", "an empty cell"], "answer": 1, "explain": "An empty cell is 0 in a comparison, and 0 < 600 is TRUE. A missing score is reported as a low one — 388 applications have no score, so test for \"\" first."}
```

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

```task
{"id": "w04d1-l10", "kind": "number", "answer": 40, "dp": 0, "unit": "loans", "hint": "A calculated column with IF(AND(…)), then COUNTIFS on it — or COUNTIFS with two pairs.", "model": "=IF(AND([@status]=\"active\", [@dpd]>30), \"watch\", \"\") and =COUNTIFS(tblLoans[watch], \"watch\") → 40 = 24 in 31-60 + 16 in 61-90. The same as =COUNTIFS(tblLoans[status], \"active\", tblLoans[dpd], \">30\")."}
```

### IFS — many branches, the first TRUE wins

**What it is.** **IFS** (*ЕСЛИМН*) takes pairs of (test, value) and returns the value of the **first** TRUE test. It reads top-down, exactly like `CASE WHEN … WHEN … END`. The last pair `TRUE, value` is the `ELSE`.

```pic
{"id": "w04d1-pic3", "title": "IFS reads the tests top-down and stops at the first TRUE", "caption": "dpd 45 fails `=0` and `<=30`, passes `<=60`: **31-60**. dpd 95 passes no test until the final `TRUE`: **90+**. A row and the test it stopped at share a colour.", "tables": [{"id": "tests", "name": "IFS", "label": "tests in order", "cols": ["test", "value"], "rows": [["dpd=0", "0"], ["dpd<=30", "1-30"], ["dpd<=60", "31-60"], ["dpd<=90", "61-90"], ["TRUE", "90+"]], "tone": ["a", "b", "c", "e", "d"]}, {"id": "src", "name": "A1:F6", "label": "small table", "cols": ["loan_id", "dpd", "bucket"], "rows": [[101, 0, "0"], [102, 12, "1-30"], [103, 95, "90+"], [104, 45, "31-60"], [105, 0, "0"]], "new": ["bucket"], "tone": ["a", "b", "d", "c", "a"]}]}
```

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

```game
{"type": "bug", "id": "w04d1-g1", "title": "Find the broken branch", "q": "This calculated column should reproduce the shipped bucket column, but the mismatch check returns 7 429. Tap the line that breaks it.", "code": "=IFS([@dpd]=0, 0,\n    [@dpd]<=30, \"1-30\",\n    [@dpd]<=60, \"31-60\",\n    [@dpd]<=90, \"61-90\",\n    TRUE, \"90+\")", "answer": [0], "why": "The first branch returns the number 0, but the bucket column holds the text \"0\". The two look identical and are not equal, so all 7 429 current loans mismatch. Write \"0\" in quotes."}
```

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

```task
{"id": "w04d1-l11", "kind": "text", "answer": ["Termez-C"], "model": "Termez-C — the region, the hyphen in quotes, the grade. No spaces, because none were typed."}
```

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

```task
{"id": "w04d1-l12", "kind": "choice", "options": ["\"MALIKA\"", "\"Malika\"", "\" Malika \"", "\"malika\""], "answer": 1, "explain": "TRIM removes the spaces at both ends, then PROPER makes the first letter capital and the rest small."}
```

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

```task
{"id": "w04d1-l13", "kind": "text", "answer": ["Samarkand"], "model": "Samarkand — the space is character 10, so LEFT takes 10 − 1 = 9 characters."}
```

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

```task
{"id": "w04d1-l14", "kind": "text", "answer": ["2026-10"], "model": "2026-10 — four digits of the year, a hyphen, two digits of the month."}
```

### Number formats vs values — the display changes, the value does not

**What it is.** A **number format** (*формат ячеек*) changes how a cell *shows* its value. The value itself does not change. Ctrl+1 → Number opens the formats. A **date** is a number with a date format: `DATE(2026,10,1)` is the number 46 296.

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

```task
{"id": "w04d1-l15", "kind": "number", "answer": 46296, "dp": 0, "hint": "A date is a count of days since 1900.", "model": "46 296 — 1 October 2026 is day 46 296 of Excel's calendar. That is why \">=\"&DATE(2026,1,1) can compare dates: it compares numbers."}
```

### Russian Excel — the same functions, other names

**What it is.** Excel in Russian shows Russian function names (`СУММЕСЛИМН` for `SUMIFS`) and separates arguments with `;` instead of `,`. The file stores the formula in one internal form, so it opens correctly in either language.

**How to write it.**

| Excel | Formula |
|---|---|
| English Excel | `=SUMIFS(tblLoans[outstanding], tblLoans[status], "active")` |
| Russian Excel | `=СУММЕСЛИМН(tblLoans[outstanding]; tblLoans[status]; "active")` |

**When you use it.** When a colleague's screen or a Russian tutorial shows the Russian names. Switch Office to English if you can (File → Options → Language): every interview and most tutorials use the English names.

**Your turn.**

```game
{"type": "flash", "id": "w04d1-g3", "title": "English ↔ Russian Excel names", "cards": [["SUMIFS", "СУММЕСЛИМН"], ["COUNTIFS", "СЧЁТЕСЛИМН"], ["AVERAGEIFS", "СРЗНАЧЕСЛИМН"], ["IF", "ЕСЛИ"], ["IFS", "ЕСЛИМН"], ["TRIM", "СЖПРОБЕЛЫ"], ["LEFT", "ЛЕВСИМВ"], ["LEN", "ДЛСТР"], ["PROPER", "ПРОПНАЧ"], ["TEXT", "ТЕКСТ"]]}
```

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
| `GROUP BY region` | a column of region labels + one formula filled down (today) or a pivot (Thursday) |
| `CASE WHEN … END` | `IF` / `IFS` in a calculated column |
| `SUM(CASE WHEN dpd > 30 THEN outstanding ELSE 0 END)` | `=SUMPRODUCT((tblLoans[dpd]>30)*tblLoans[outstanding])` |
| `first_name \|\| ' ' \|\| last_name` | `=[@first_name]&" "&[@last_name]` |
| `LOWER(TRIM(method))` | `=LOWER(TRIM([@method]))` |
| `strftime('%Y-%m', d)` / `FORMAT(d, 'yyyy-MM')` | `=TEXT([@disbursed_at], "yyyy-mm")` |
| `ROUND(100.0 * a / b, 1)` | `=a/b` formatted `0.0%` |
| `JOIN` | tomorrow: `XLOOKUP` / `INDEX-MATCH`; Wednesday: Power Query *Merge* |
| `SELECT DISTINCT`, `ORDER BY`, `LIMIT` | tomorrow: `UNIQUE`, `SORT`, `TAKE` |

**When you use it.** Every time you know the SQL and need the cell.

> ⚠️ **Watch out.** Two differences bite. Excel text comparison is **case-insensitive** (SQL's was not). And Excel has **no NULL**: an empty cell is skipped by `AVERAGE` and `COUNT`, but counted by `COUNTIFS(range, "")`.

**Your turn.**

```game
{"type": "match", "id": "w04d1-g4", "title": "SQL → Excel: match the spelling", "pairs": [["SUM(x) … WHERE …", "SUMIFS"], ["COUNT(*) … WHERE …", "COUNTIFS"], ["CASE WHEN … END", "IFS"], ["LIKE 'approved%'", "\"approved*\""], ["status <> 'cancelled'", "\"<>cancelled\""], ["strftime('%Y-%m', d)", "TEXT(d, \"yyyy-mm\")"]]}
```

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

```game
{"type": "sort", "id": "w04d1-g6", "title": "Which function?", "q": "Drop each question into the function that answers it in one cell.", "groups": {"COUNTIFS": ["How many active loans are late?", "How many applications were approved (any approved status)?"], "SUMIFS": ["Outstanding of Tashkent loans in 90+", "Principal lent in September 2026"], "IFS": ["A bucket label for each loan from its dpd"], "TEXT": ["A yyyy-mm month label from a date"], "TRIM + PROPER": ["A clean full name from 'MALIKA' and 'jalilova '"]}}
```

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

```videoquiz
{"video": "pCJ15nGFgVg", "stops": [{"at": 14100, "q": "What does Ctrl+T turn a range into?", "options": ["A pivot table", "An Excel Table with a name, filter buttons and banded rows", "A chart", "A named cell"], "answer": 1, "explain": "A Table is a named, self-expanding range — the thing every formula this week reads."}, {"at": 14450, "q": "You paste new rows directly under a Table. What happens to formulas that use its columns?", "options": ["They must be edited by hand", "They include the new rows automatically", "They return #REF!", "They ignore the new rows until you sort"], "answer": 1, "explain": "Auto-expansion is the refresh problem solved: no K2:K7829 that stops at the old end."}, {"at": 14850, "q": "What does a structured reference such as tblLoans[outstanding] point at?", "options": ["The first cell of the column", "The whole column of the Table, however many rows", "Only the rows visible after a filter", "The fixed range K2:K7829"], "answer": 1, "explain": "A column is a column — which is also why structured references need no $.", "back": 60}]}
```

```videoquiz
{"video": "Y8xhrUa3KH4", "stops": [{"at": 560, "q": "You copy =B2*C2 one row down. What does it become?", "options": ["=B2*C2", "=B3*C3", "=C2*D2", "#REF!"], "answer": 1, "explain": "Relative references move with the formula; a $ is what stops them.", "back": 40}, {"at": 1915, "q": "Which function removes the spaces at the ends of a name?", "options": ["PROPER", "LEN", "TRIM", "LEFT"], "answer": 2, "explain": "TRIM — and in Excel it also collapses double spaces inside.", "back": 25}, {"at": 2480, "q": "IF(test, a, b) returns b when…", "options": ["the test is TRUE", "the test is FALSE", "a is empty", "always"], "answer": 1, "explain": "Two branches, like CASE WHEN … ELSE … END; IFS adds more branches.", "back": 40}]}
```

```videoquiz
{"video": "FRu48zy-Djk", "stops": [{"at": 150, "q": "In $F5, what stays fixed when you copy the formula?", "options": ["The row 5", "The column F", "Both", "Neither"], "answer": 1, "explain": "$ before the letter pins the column; the row is free to move — the $A3 of the bucket matrix.", "back": 30}, {"at": 172, "q": "What does F4 do on a selected reference?", "options": ["Recalculates the sheet", "Cycles it through $F$5, F$5, $F5, F5", "Opens Format Cells", "Fills the formula down"], "answer": 1, "explain": "F4 is the fastest way to place the $ signs; same key in Sheets.", "back": 25}]}
```

```videoquiz
{"video": "AZuBNWMh7VM", "stops": [{"at": 250, "q": "In SUMIFS, which argument comes first?", "options": ["The first criteria range", "The range to add up", "The criterion", "The sheet name"], "answer": 1, "explain": "Sum range first, then (criteria range, criterion) pairs — the opposite of SUMIF's old order."}, {"at": 310, "q": "Two criteria in one SUMIFS combine as…", "options": ["OR — either may be true", "AND — a row must meet both", "only the first one counts", "XOR"], "answer": 1, "explain": "Every pair is one more AND in the WHERE clause.", "back": 40}, {"at": 670, "q": "How does COUNTIFS differ from SUMIFS?", "options": ["It has no sum range — it counts the rows that meet every criterion", "It adds up text", "It needs sorted data", "It ignores blank criteria cells only"], "answer": 0, "explain": "Same pairs, no first argument: COUNT(*) … WHERE …", "back": 30}]}
```

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

```task
{"id": "w04d1-p12", "kind": "multi", "options": ["Unmerge the regions and repeat the region name on every row, in a region column", "Turn the month columns into one month column and one loans column (one row per region × month)", "Delete the Total rows and the blank rows inside the data", "Colour the header row", "Sort the rows by region"], "answer": [0, 1, 2], "explain": "Rules 5, 3 and 4: no merged cells, one column per field, nothing inside the block that is not data. Colour and sort order do not matter to a formula — a SUMIFS reads an unsorted, uncoloured table perfectly well."}
```

**P2.** *(Excel Tables · SUM, COUNTA · COUNTIFS)* Four cells from `tblLoans`: number of loans, number of active loans, total outstanding, number of loans with dpd > 0. *In the box: the number of loans with dpd > 0.*

```task
{"id": "w04d1-p1", "kind": "number", "answer": 399, "dp": 0, "unit": "loans", "hint": "COUNTIFS on the dpd column with the criterion \">0\" — in quotes.", "explain": "=COUNTA(tblLoans[loan_id]) → 7 828 · =COUNTIFS(tblLoans[status],\"active\") → 3 352 · =SUM(tblLoans[outstanding]) → 208 723 504 430 · =COUNTIFS(tblLoans[dpd],\">0\") → 399. All four are week-3 numbers; if one differs, the file is not the shipped one."}
```

**P3.** *(SUMIFS, AVERAGEIFS, MAXIFS · absolute references)* A five-row product table: loans, outstanding, share of outstanding (`0.0%`, dividing by a `$`-pinned total), average principal, largest principal. Which product is 60 % of the book and 10 % of the loans? *In the box: pick the product.*

```task
{"id": "w04d1-p3", "kind": "choice", "options": ["Consumer loan", "Micro loan", "Small business loan", "Auto loan"], "answer": 2, "explain": "COUNTIFS / SUMIFS / =C3/SUM($C$3:$C$7) / AVERAGEIFS / MAXIFS per product. Small business loan 781 loans · 125 892 942 411 · 60.3 % · average 308 728 745 · largest 599 060 000; Auto 391 · 57 684 271 333 · 27.6 %; Consumer 2 418 · 23 054 933 316 · 11.0 %; Micro 2 669 · 956 106 370 · 0.5 %; BNPL 1 569 · 1 135 251 000 · 0.5 %. The largest loans sit just under the product limits in Lookup!E3:E7."}
```

**P4.** *(several criteria · mixed references)* The status × bucket cross-tab for delinquent loans only (dpd > 0): one `COUNTIFS` with three pairs, filled across and down. Which statuses appear in 90+, and how many "closed" loans are late? *In the box: how many closed loans are late.*

```task
{"id": "w04d1-p5", "kind": "number", "answer": 14, "dp": 0, "unit": "loans", "explain": "Rows active / closed / default / written_off, columns 1-30 … 90+: =COUNTIFS(tblLoans[status],$A3,tblLoans[bucket],B$2,tblLoans[dpd],\">0\"). 90+ = 44 default + 190 written_off and nothing else; closed: 13 in 1-30 + 1 in 31-60 = 14 — week 2's finding (the fifteenth is at dpd 0 on the as-of day). Active: 111 / 24 / 16 / 0."}
```

**P5.** *(AVERAGEIFS and MAXIFS with several criteria)* Average DPD and maximum DPD of *active* delinquent loans, and the average outstanding of an active loan. *In the box: the average DPD of active late loans, 1 decimal.*

```task
{"id": "w04d1-p6", "kind": "number", "answer": 22.7, "dp": 1, "unit": "days", "hint": "AVERAGEIFS with two pairs: status = active and dpd > 0.", "explain": "=AVERAGEIFS(tblLoans[dpd],tblLoans[status],\"active\",tblLoans[dpd],\">0\") → 22.7; =MAXIFS(tblLoans[dpd],tblLoans[status],\"active\") → 89 (no active loan is past 90 — those are default); =AVERAGEIFS(tblLoans[outstanding],tblLoans[status],\"active\") → 60 681 393. The \">0\" pair is what turns \"average over all active loans\" into \"average over the late ones\"."}
```

**P6.** *(wildcards)* Two counts with a wildcard on `branch`: the loans of the three Tashkent branches together, and the loans of the branches that are **not** called "… Central". *In the box: the loans of the branches not called "… Central".*

```task
{"id": "w04d1-p13", "kind": "number", "answer": 2019, "dp": 0, "unit": "loans", "hint": "Not-equal and a wildcard can share one criterion: \"<>*Central\".", "explain": "=COUNTIFS(tblLoans[branch], \"Tashkent*\") → 3 020 · =COUNTIFS(tblLoans[branch], \"<>*Central\") → 2 019 = Tashkent North 1 007 + Tashkent South 1 012. Check: 2 019 + 5 809 (\"*Central\") = 7 828."}
```

**P7.** *(dates in criteria)* Loans and principal disbursed in 2026 (through the as-of date), then the same for September 2026 only, with the half-open filter. *In the box: the principal disbursed in September 2026, in soum.*

```task
{"id": "w04d1-p2", "kind": "number", "answer": 17015490000, "dp": 0, "unit": "UZS", "hint": "Two pairs on disbursed_at: \">=\"&DATE(2026,9,1) and \"<\"&DATE(2026,10,1).", "explain": "2026: =COUNTIFS(tblLoans[disbursed_at],\">=\"&DATE(2026,1,1)) → 3 051 and the SUMIFS of principal → 162 333 060 000. September: add the pair tblLoans[disbursed_at],\"<\"&DATE(2026,10,1) and start at DATE(2026,9,1) → 361 loans / 17 015 490 000. The 21 loans of 1 October (852 760 000) are inside the first pair and outside the second."}
```

**P8.** *(criteria ignore case, not spaces)* Payments by method **as recorded**: a `COUNTIFS` for each of the five clean names (`card`, `cash`, `transfer`, `payme`, `click`) on `tblPayments`. Why do the five not add up to 52 875, and which 57 rows did Excel miss? *In the box: how many rows the five counts miss.*

```task
{"id": "w04d1-p8", "kind": "number", "answer": 57, "dp": 0, "unit": "rows", "explain": "card 17 621 · cash 8 760 · transfer 8 747 · payme 8 900 · click 8 790 = 52 818; missing 57 = 30 'CASH ' (trailing space) + 27 'bank transfer'. Excel's criteria ignore case, so \"card\" already includes the 57 'Card' rows that week 2's raw GROUP BY kept apart (PayMe, Click likewise) — but a space or a different word still counts as a different value. Σ amount for \"card\": 84 774 870 979 = 33.2 % of the 255 173 169 976 recorded."}
```

**P9.** *(IF · AND / OR)* A calculated column `flag` on `tblLoans`: `bad` when the status is `default` **or** `written_off`; `watch` when the loan is `active` **and** more than 30 days late; empty otherwise. One nested `IF` with `OR` and `AND`, then a `COUNTIFS` per flag. *In the box: the number of `watch` loans.*

```task
{"id": "w04d1-p14", "kind": "number", "answer": 40, "dp": 0, "unit": "loans", "hint": "=IF(OR(…), \"bad\", IF(AND(…), \"watch\", \"\")) — the OR test comes first.", "explain": "=IF(OR([@status]=\"default\",[@status]=\"written_off\"),\"bad\",IF(AND([@status]=\"active\",[@dpd]>30),\"watch\",\"\")). =COUNTIFS(tblLoans[flag],\"bad\") → 234; =COUNTIFS(tblLoans[flag],\"watch\") → 40 (24 in 31-60 + 16 in 61-90). The order matters only when a row could meet both tests; here none can, because a bad loan is never active."}
```

**P10.** *(IFS · SUMPRODUCT)* Add a calculated column `my_bucket` to `tblLoans` with `IFS` on `dpd`, then prove it equals the shipped `bucket` column with one `SUMPRODUCT` (count of mismatches). *In the box: the mismatch count.*

```task
{"id": "w04d1-p4", "kind": "number", "answer": 0, "dp": 0, "hint": "=SUMPRODUCT(--(tblLoans[my_bucket]<>tblLoans[bucket])). Got 7 429? Look at the bug game in Learn, under IFS.", "explain": "The IFS from Learn in a new column; =SUMPRODUCT(--(tblLoans[my_bucket]<>tblLoans[bucket])) → 0. If you get 7 429, your first branch returned the number 0 while the shipped column holds the text \"0\": write it as \"0\". -- turns TRUE/FALSE into 1/0 — the Excel idiom for SUM(CASE WHEN … THEN 1 ELSE 0 END)."}
```

**P11.** *(& · TRIM, PROPER · EXACT)* On `tblCustomers`, a `full_name` column = `PROPER(TRIM([@first_name]))&" "&PROPER(TRIM([@last_name]))`, and three count cells: first names with a stray space (`LEN` vs `LEN(TRIM)`), surnames that are all lower-case, phones that are not 13 characters long. *In the box: the number of surnames written all in lower case.*

```task
{"id": "w04d1-p7", "kind": "number", "answer": 40, "dp": 0, "hint": "= ignores case in Excel. Which function compares text case-sensitively?", "explain": "=SUMPRODUCT(--EXACT(tblCustomers[last_name],LOWER(tblCustomers[last_name]))) → 40 — EXACT is the one case-sensitive comparison in Excel; with = every surname 'equals' its lower-case copy and you get 6 040. Stray spaces in first_name: =SUMPRODUCT(--(LEN(tblCustomers[first_name])<>LEN(TRIM(tblCustomers[first_name])))) → 18; phones not 13 long → 0. Row 6001 becomes Malika Jalilova — identical to row 4516. Wednesday finishes this."}
```

**P12.** *(LEFT, MID, SEARCH)* Two calculated columns on `tblLoans`: `city` = the word before the space in `branch`, `part` = everything after it. Check that `city` always equals `region` (a `SUMPRODUCT` of mismatches), then count the loans per `part`. *In the box: the number of loans whose `part` is `South`.*

```task
{"id": "w04d1-p15", "kind": "number", "answer": 1012, "dp": 0, "unit": "loans", "hint": "=MID([@branch], SEARCH(\" \", [@branch]) + 1, 50), then COUNTIFS on the new column.", "explain": "city =LEFT([@branch], SEARCH(\" \", [@branch]) - 1), part =MID([@branch], SEARCH(\" \", [@branch]) + 1, 50). =SUMPRODUCT(--(tblLoans[city]<>tblLoans[region])) → 0: every branch name starts with its region. Parts: Central 5 809 · North 1 007 · South 1 012."}
```

**P13.** *(TEXT · a running total with `$`)* Month labels without a pivot: a column `month` on `tblLoans` as `=TEXT([@disbursed_at],"yyyy-mm")`, then a 2026 table of month → loans, principal, running total of principal (a `SUM` with a `$`-pinned start). *In the box: the running total in the 2026-09 row.*

```task
{"id": "w04d1-p10", "kind": "number", "answer": 161480300000, "dp": 0, "unit": "UZS", "explain": "=COUNTIFS(tblLoans[month],A3), =SUMIFS(tblLoans[principal],tblLoans[month],A3), running =SUM($C$3:C3). 2026-01 287 / 17 452 370 000 → … → 2026-09 361 / 17 015 490 000, running 161 480 300 000; 2026-10 21 / 852 760 000, running 162 333 060 000 = P7. Quarters with a quarter column: Q1 49.00 bn · Q2 52.48 · Q3 60.00 bn. The TEXT month is text, so it sorts correctly and matches COUNTIFS exactly."}
```

**P14.** *(number formats)* Bekzod's ten-cell summary with number formats: the P2 and P7 numbers plus Σ principal ever lent (404 783 280 000), average ticket (51 709 668) and PAR30 as a percentage — in `#,##0`, `#,##0,,," bn"` and `0.00%`, each cell labelled. *In the box: PAR30 as a percentage, 2 decimals.*

```task
{"id": "w04d1-p9", "kind": "number", "answer": 3.12, "dp": 2, "unit": "%", "hint": "SUMPRODUCT((tblLoans[dpd]>30)*tblLoans[outstanding]) divided by the total outstanding.", "explain": "=SUMPRODUCT((tblLoans[dpd]>30)*tblLoans[outstanding])/SUM(tblLoans[outstanding]) → 0.0312 → 3.12 % in 0.00%. The bn format shows 404.8 bn, 208.7 bn, 162.3 bn; =TEXT(K3,\"#,##0,,,\")&\" bn\" makes the same display as text for a title cell. Rule: formats on numbers you compute with, TEXT() only on labels."}
```

> 🚀 **Stretch (optional, +5 XP).** **P15.** *(dates in criteria · SUMIFS on another table)* Week 3's `v_portfolio_monthly` had month-end outstanding. Reproduce **September 2026 month-end** from `Installments` + `Loans` with `SUMIFS` only: principal due on or after 2026-10-01 for loans disbursed before 2026-10-01. Why is it not 208 723 504 430? *In the box: the September month-end outstanding.*

```task
{"id": "w04d1-p11", "kind": "number", "answer": 208243879623, "dp": 0, "unit": "UZS", "xp": 2, "hint": "Bring disbursed_at onto tblInstallments with =INDEX(tblLoans[disbursed_at], MATCH([@loan_id], tblLoans[loan_id], 0)) — tomorrow's lookup, used once today.", "explain": "=SUMIFS(tblInstallments[principal_due], tblInstallments[due_date], \">=\"&DATE(2026,10,1), tblInstallments[disbursed], \"<\"&DATE(2026,10,1)) → 208 243 879 623. It is not 208 723 504 430 because the 21 loans of 1 October (852 760 000) are excluded, while instalments due on 1 October itself (not yet due at midnight on 30 September) are included — week 3 P8's two definitions, now in Excel."}
```

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

```task
{"id": "w04d1-hw1", "kind": "number", "answer": 305, "dp": 0, "unit": "loans", "explain": "=COUNTIFS(tblLoans[product],\"Small business loan\",tblLoans[disbursed_at],\">=\"&DATE(2026,1,1)) → 305. Same pairs inside AVERAGEIFS give cell 9: 312 246 230."}
```

**K2.** Their principal in total, in soum (the numerator behind cell 9).

```task
{"id": "w04d1-hw2", "kind": "number", "answer": 95235100000, "dp": 0, "unit": "UZS", "explain": "=SUMIFS(tblLoans[principal],tblLoans[product],\"Small business loan\",tblLoans[disbursed_at],\">=\"&DATE(2026,1,1)) → 95 235 100 000; ÷ 305 = 312 246 230 — cell 9 checks itself."}
```

**K3.** The approval rate of all three channels together, all-applications convention, as a percentage with 1 decimal — the total row under cell 10.

```task
{"id": "w04d1-hw3", "kind": "number", "answer": 61.4, "dp": 1, "unit": "%", "hint": "Sum the counts, divide once — never average the three rates.", "explain": "8 595 approved* ÷ 14 000 applications = 61.4 %. The average of 58.2, 63.7 and 61.9 is 61.3 — the mix error."}
```

**K4.** On your `Buckets` sheet: how many *active* loans are late (1-30, 31-60 and 61-90 together)?

```task
{"id": "w04d1-hw4", "kind": "number", "answer": 151, "dp": 0, "unit": "loans", "explain": "Active row: 111 + 24 + 16 = 151 (and 0 in 90+). If you get 165, you counted the closed 14 too."}
```

### 📎 Hand in here

```sqltask
{"check": "handin-W4D1", "lesson": "W4D1", "title": "HW 4.1", "why": "A board pack with typed numbers is wrong the day the data changes; ten formulas that tie to the SQL numbers are the habit every Excel report this week builds on.", "graded": ["all ten values equal the SQL numbers (a =B3=C3 check column showing TRUE is welcome)", "every cell is a formula on tblLoans / tblApplications with structured references or $-pinned ranges", "formats: money with thousands separators, rates as percentages, dates as yyyy-mm-dd", "the Buckets sheet: bold frozen header, #,##0, column totals 7 429 / 124 / 25 / 16 / 234"], "tasks": [{"id": "functions_pack.xlsx", "file": "functions_pack.xlsx", "names": ["functions_pack.xlsx"], "upload": true, "accept": ".xlsx", "q": "Attach `functions_pack.xlsx` — what the page above asks for."}, {"id": "notes.md", "file": "notes.md", "text": true, "minLines": 2, "q": "Two lines: which of your ten cells disagreed with the SQL value first, and what you changed to fix it."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else the page lists (one more file, or a .zip of several)."}]}
```

---

## 5. Self-check

```check
{"id": "w04d1-sc", "questions": [
  {"type": "single", "q": "You paste 120 new loans under tblLoans. Which formula includes them without any edit?", "options": ["=SUM(Loans!K2:K7829)", "=SUM(tblLoans[outstanding])", "=SUM(Loans!$K$2:$K$7829)", "=SUBTOTAL(9, Loans!K2:K7829)"], "answer": 1, "explain": "A Table column grows with the Table; every fixed range stops at row 7 829, $ or no $ (→ section 1, Excel Tables)."},
  {"type": "single", "q": "Which formula gives the principal disbursed in September 2026 with the half-open filter?", "options": ["=SUMIFS(tblLoans[principal], tblLoans[disbursed_at], \">=\"&DATE(2026,9,1), tblLoans[disbursed_at], \"<\"&DATE(2026,10,1))", "=SUMIFS(tblLoans[disbursed_at], tblLoans[principal], \">=\"&DATE(2026,9,1))", "=SUMIFS(tblLoans[principal], tblLoans[disbursed_at], \">=DATE(2026,9,1)\")", "=SUMIFS(tblLoans[principal], tblLoans[disbursed_at], \"<=\"&DATE(2026,9,30))"], "answer": 0, "explain": "Sum range first, two pairs on the date, the operator glued to DATE() with & (→ section 1, Dates in criteria; P7)."},
  {"type": "multi", "q": "COUNTIFS(method, \"card\") returns 17 621 while SQL's GROUP BY said 17 564. Which kinds of dirt does Excel still NOT absorb?", "options": ["Upper and lower case (Card vs card)", "A trailing space ('CASH ')", "A different word ('bank transfer' vs 'transfer')", "None — Excel absorbs all three"], "answer": [1, 2], "explain": "Criteria ignore case, so Card is already inside 17 621; spaces and synonyms need TRIM and SUBSTITUTE — Wednesday (→ P8)."},
  {"type": "number", "q": "How many loans does this return on the shipped file?", "code": "=COUNTIFS(tblLoans[status], \"active\", tblLoans[dpd], \">0\")", "answer": 151, "explain": "Active and late: 111 in 1-30 + 24 in 31-60 + 16 in 61-90 = 151; no active loan is 90+ (→ P4)."}
]}
```

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

```game
{"type": "sort", "id": "w04d1-g5", "title": "Numerator, denominator, or out?", "q": "Where does each application status go in the decided-convention approval rate?", "groups": {"Approved — numerator and denominator": ["approved", "approved_not_disbursed"], "Decided, not approved — denominator only": ["rejected"], "Not decided — left out": ["cancelled"]}}
```

Three things to check before it goes into the pack. **The wildcard:** `"approved*"` counts `approved` and `approved_not_disbursed` — 7 917 + 678 = 8 595 — because an approval is a decision whether or not the money was taken; `"approved"` alone gives 7 917 and an approval rate of 56.6 %, Marketing's number. **The total row** is a `SUM` of the counts, never an average of the rates (the simple average of 58.2 / 63.7 / 61.9 is 61.3, not 61.4 — mix matters). **The convention** is written in the header, `rate (all)` / `rate (decided)`, exactly as week 2's `rate_all` / `rate_decided`; a column called just `approval rate` is the reason two departments disagree.

The app is 4–5 points below the branch under either convention — the same gap SQL showed, now in a file the board can click. Add a note cell: *approved = status beginning "approved"; decided = all but cancelled; source tblApplications, 14 000 rows as of 2026-10-01.* That one sentence is what makes the sheet a report and not a guess.

> 🎯 **Interview version.** *"How do you compute an approval rate in Excel, and what do you check?"* — `COUNTIFS` with a wildcard on the status for the numerator, two denominators (all / decided) as two columns, rates as `=num/den` formatted `0.0%`; check the counts add to 14 000, never average the rates, and name the convention in the header.

**Say it like in an interview.** Bekzod forwards Marketing's slide: *"Approval rate 56.6 %. Your sheet says 61.4 %. Which one is wrong?"* Answer him in 30 words or more, the way you would say it in the meeting.

```task
{"id": "w04d1-cc", "kind": "free", "min": 30, "model": "Neither is wrong — they count different things. Marketing counts only status 'approved' over all 14 000 applications: 7 917, 56.6 %. I count 'approved*' — approved plus approved_not_disbursed, 8 595 — because an approval is a decision whether or not the client took the money: 61.4 %. Leaving out the 1 817 cancelled applications gives 70.5 %. I'd keep both conventions as named columns and agree which one goes on the board.", "rubric": ["names the numerator difference: approved vs approved* (approved_not_disbursed)", "names the denominator: all applications vs decided only", "quotes at least one number from the sheet (56.6 / 61.4 / 70.5 %)", "proposes writing the convention into the header instead of declaring a winner"]}
```

Tomorrow: joining in Excel — VLOOKUP and its traps, INDEX/MATCH, XLOOKUP against the Lookup sheet, and the dynamic arrays (FILTER, UNIQUE, SORT) that make a dropdown-driven branch report.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w04d1", "pass": 0.8, "questions": [
  {"type": "single", "q": "You type this in B3 and fill it right to F3 and down to row 10. What does $A3 do?", "code": "=SUMIFS(tblLoans[outstanding], tblLoans[region], $A3, tblLoans[bucket], B$2)", "options": ["Nothing — $ only matters in VBA", "Keeps column A fixed while the row moves, so every cell reads its region from column A", "Keeps row 3 fixed while the column moves", "Pins the single cell A3 for every copy"], "answer": 1, "explain": "$ before the letter pins the column, before the number pins the row; B$2 does the opposite for the bucket labels (→ section 1, Relative and absolute references; Worked example)."},
  {"type": "single", "q": "Which criterion counts both approved and approved_not_disbursed applications?", "options": ["\"approved\"", "\"approved*\"", "\"=approved\"", "\"<>rejected\""], "answer": 1, "explain": "* is any characters, like LIKE 'approved%'; \"approved\" alone is Marketing's lower rate, and <>rejected also lets cancelled in (→ section 1, Wildcards in criteria; section 6)."},
  {"type": "number", "q": "The method column of a small table holds these five values. What does the formula return?", "code": "method: card | Card | CARD | 'card ' (trailing space) | cash\n\n=COUNTIFS(tblPayments[method], \"card\")", "answer": 3, "explain": "Excel criteria ignore case, so card, Card and CARD all match; a trailing space is still a different value (→ section 1, COUNTIFS, SUMIFS, AVERAGEIFS; P8)."},
  {"type": "multi", "q": "What does an Excel Table (Ctrl+T) give your formulas that a plain range like K2:K7829 does not?", "options": ["Structured references such as tblLoans[outstanding] that mean the whole column", "Auto-expansion: new rows pasted under the table are included", "Calculated columns: one formula fills every row", "Case-sensitive text comparison", "NULL values like SQL"], "answer": [0, 1, 2], "explain": "Excel stays case-insensitive and has no NULL, Table or not (→ section 1, Excel Tables)."},
  {"type": "single", "q": "B2 may hold the bucket label as the number 0, while tblLoans[bucket] holds the text \"0\". Which formula is a reliable test that B2 is the wrong type?", "options": ["=ISTEXT(B2) — FALSE means B2 is a number, not the text \"0\"", "=COUNTIFS(tblLoans[bucket], B2) — a non-zero result proves B2 is text", "=LEN(B2) — 1 means it is text", "=SUM(B2) — 0 means it is text"], "answer": 0, "explain": "ISTEXT / ISNUMBER test the type, and = or SUMPRODUCT(--(a<>b)) compare strictly; COUNTIFS and SUMIFS may treat number-like text as numbers, so they are not a safe test. Type the label as '0 (→ section 2, Worked example; Mistakes that cost a point)."},
  {"type": "single", "q": "A1 = 1 and A2 = 4. A cell holds =100*A1/A2 and is formatted 0.0%. What does it show?", "options": ["25.0%", "2500.0%", "0.3%", "#VALUE!"], "answer": 1, "explain": "The % format already multiplies by 100; write =A1/A2 and let the format do it (→ section 1, Number formats vs values; Mistakes that cost a point)."},
  {"type": "single", "q": "You want to count surnames written entirely in lower case. Why does =SUMPRODUCT(--(tblCustomers[last_name]=LOWER(tblCustomers[last_name]))) fail?", "options": ["SUMPRODUCT cannot compare text", "= ignores case in Excel, so every surname equals its lower-case copy; use EXACT", "LOWER does not exist in Excel", "-- turns the text into errors"], "answer": 1, "explain": "EXACT is the one case-sensitive comparison in Excel (→ section 1, TRIM, UPPER, LOWER, PROPER; P11)."},
  {"type": "single", "q": "Your Approval sheet has three channel rows. How do you fill the total row's approval rate?", "options": ["The average of the three channel rates", "Sum the approved counts and the application counts, then divide once", "The highest of the three rates", "Type the company figure from last week's SQL"], "answer": 1, "explain": "Averaging rates ignores that channels differ in size (mix); sum the counts, divide once (→ section 6, Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w04d1", "q": "Nilufar's approval-rate sheet has a gap: applications with no credit score. On the Applications sheet (tblApplications), compute the approval rate of branch-channel applications whose credit_score is blank, on the decided convention (cancelled left out; approved_not_disbursed counts as approved). Percentage to 1 decimal.", "type": "number", "dp": 1, "h": ["8519d6e37c49a0119f2ea356"], "hint": "COUNTIFS can test for an empty cell — find the criterion that means blank.", "sol": "QXBwcm92ZWQgKHRoZSB3aWxkY2FyZCBjYXRjaGVzIGJvdGggYXBwcm92ZWQgc3RhdHVzZXMpOgo9Q09VTlRJRlModGJsQXBwbGljYXRpb25zW2NoYW5uZWxdLCJicmFuY2giLHRibEFwcGxpY2F0aW9uc1tjcmVkaXRfc2NvcmVdLCIiLHRibEFwcGxpY2F0aW9uc1tzdGF0dXNdLCJhcHByb3ZlZCoiKSAgIOKGkiAxMDYKRGVjaWRlZDoKPUNPVU5USUZTKHRibEFwcGxpY2F0aW9uc1tjaGFubmVsXSwiYnJhbmNoIix0YmxBcHBsaWNhdGlvbnNbY3JlZGl0X3Njb3JlXSwiIix0YmxBcHBsaWNhdGlvbnNbc3RhdHVzXSwiPD5jYW5jZWxsZWQiKSAgIOKGkiAxNTIKUmF0ZTogPTEwNi8xNTIg4oaSIDY5LjcgJSAoZm9ybWF0IDAuMCUpLiBHb29nbGUgU2hlZXRzOiB0aGUgc2FtZSBmb3JtdWxhcy4KVGhlIGNyaXRlcmlvbiAiIiBtYXRjaGVzIGVtcHR5IGNlbGxzOyB0d28gQ09VTlRJRlMgZm9yICJhcHByb3ZlZCIgYW5kICJhcHByb3ZlZF9ub3RfZGlzYnVyc2VkIiBhZGRlZCB0b2dldGhlciB3b3JrIGFzIHdlbGwgYXMgdGhlIHdpbGRjYXJkLiBPZiB0aGUgMTc0IHNjb3JlLWxlc3MgYnJhbmNoIGFwcGxpY2F0aW9ucywgMjIgd2VyZSBjYW5jZWxsZWQ7IG9uIHRoZSBhbGwtYXBwbGljYXRpb25zIGNvbnZlbnRpb24gdGhlIHJhdGUgaXMgNjAuOSAlLgpCcmFuY2ggYXBwbGljYXRpb25zIHdpdGggYSBzY29yZSBhcmUgYXBwcm92ZWQgYXQgNzIuNSAlIChkZWNpZGVkKSwgc28gdGhlIHNjb3JlLWxlc3Mgb25lcyBhcmUgYXBwcm92ZWQgYWxtb3N0IGFzIG9mdGVuIOKAlCBzb21lb25lIGRlY2lkZXMgdGhlbSBieSBoYW5kLiBXb3J0aCBhc2tpbmcgTmlsdWZhciB3aGljaCBydWxlIHRob3NlIG9mZmljZXJzIGZvbGxvdy4="}
```

<!-- challenge:end -->
