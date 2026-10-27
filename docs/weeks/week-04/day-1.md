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

### Why analysts still live in Excel

Every number you computed in weeks 1–3 ends up in a spreadsheet: the board pack, the budget, the collections list Sevara prints, the risk committee's slide. Excel (*Эксель*) is where non-analysts *read* and *edit* data, and it is the one tool every colleague has. It is also a trap: a workbook with pasted numbers is wrong the day after the data changes, and nobody knows. The analyst's job in Excel is the same as in SQL — **one definition, computed from the data, reproducible** — the tools just look different.

Open `data/excel/nur_week4_start.xlsx` (built from `nur.db`; `data/excel/README.md` describes every column). Five data sheets (**Loans**, **Payments**, **Customers**, **Applications**, **Installments**) and a **Lookup** sheet. `Loans` is week 3's `v_loan_status` with fewer columns: one row per loan, as of 2026-10-01. Google Sheets users: File → Import each CSV from `data/excel/` into one spreadsheet, one tab per file.

### Tables (*умные таблицы*) — Ctrl+T

A range becomes a **Table** with Ctrl+T (Insert → Table). Ours already are: `tblLoans`, `tblPayments`, `tblCustomers`, `tblApplications`, `tblInstallments` (Table Design → Table Name). A Table gives you four things a plain range does not:

| What | Why it matters |
|---|---|
| **Structured references** — `tblLoans[outstanding]` means "the whole outstanding column, however many rows" | formulas survive new rows; no `K2:K7829` that silently stops at the old end |
| **Auto-expanding** — paste 100 new loans under the table, every formula includes them | the refresh problem solved |
| **Filter buttons and banded rows** | sort/filter without selecting anything |
| **Calculated columns** — type one formula in a new column, it fills every row | the Excel equivalent of adding a column to a `SELECT` |

```
=SUM(tblLoans[outstanding])                → 208 723 504 430   (plain range: =SUM(Loans!K2:K7829))
=COUNTA(tblLoans[loan_id])                 → 7 828
```

> 💡 **Key idea.** A Table column is the whole column, however long it gets: `tblLoans[outstanding]` still means every loan after Friday's refresh, while `K2:K7829` means 7 828 rows forever. Build every formula this week on a Table (or, in Sheets, a whole-column reference).

Click inside a Table and the header row replaces the column letters when you scroll — but still **freeze** the header on long sheets: View → Freeze Panes → Freeze Top Row (*закрепить области*). Sort and filter from the header arrows: filter `status` = active, and the status bar shows *Count: 3 353* (3 352 rows + the header — read the row count from a formula, not the status bar). Clear a filter before you trust a `SUM` of a selected range; `SUBTOTAL(109, …)` sums only visible rows, `SUM` sums all.

**Google Sheets** has no Tables of this kind (its *Convert to table* is formatting plus a filter). Use whole-column references instead — `Loans!K:K` — and **named ranges** (Data → Named ranges) when a formula should read as a sentence. Freeze is View → Freeze → 1 row.

### Absolute and relative references — the `$`

A formula copied one cell right moves its references one column right; copied one row down, one row down. `$` pins a part: `$K$2` never moves, `$A3` keeps the column but lets the row move, `B$2` keeps the row but lets the column move. The whole skill of a two-way summary table (regions down, buckets across) is three `$` signs:

```
=SUMIFS(tblLoans[outstanding], tblLoans[region], $A3, tblLoans[bucket], B$2)
```

Type it once in B3, fill right and down, and every cell reads its region from column A and its bucket from row 2. F4 cycles a reference through `$A$3 → A$3 → $A3 → A3`. Structured references do not need `$` — a column is a column — which is one more reason to use Tables.

> ⚠️ **Watch out.** Forget one `$` and the formula still returns numbers — just the wrong ones. Without the `$` in `$A3`, filling right turns it into `B3`, `C3` …, and every column reads a bucket *amount* as if it were a region name. Before you trust forty cells, click one in the middle and press F2: the coloured boxes show exactly which cells it reads.

### Logic — IF, AND, OR, IFS (*ЕСЛИ, И, ИЛИ, ЕСЛИМН*)

`IF(test, if_true, if_false)` is a two-branch `CASE`. Nest for more branches, or use `IFS(test1, value1, test2, value2, …)` — read top-down, first true wins, exactly like `CASE WHEN`:

```
=IF([@dpd]=0, "0", IF([@dpd]<=30, "1-30", IF([@dpd]<=60, "31-60", IF([@dpd]<=90, "61-90", "90+"))))
=IFS([@dpd]=0, "0", [@dpd]<=30, "1-30", [@dpd]<=60, "31-60", [@dpd]<=90, "61-90", TRUE, "90+")
```

```game
{"type": "bug", "id": "w04d1-g1", "title": "Find the broken branch", "q": "This calculated column should reproduce the shipped bucket column, but the mismatch check returns 7 429. Tap the line that breaks it.", "code": "=IFS([@dpd]=0, 0,\n    [@dpd]<=30, \"1-30\",\n    [@dpd]<=60, \"31-60\",\n    [@dpd]<=90, \"61-90\",\n    TRUE, \"90+\")", "answer": [0], "why": "The first branch returns the number 0, but the bucket column holds the text \"0\". The two look identical and are not equal, so all 7 429 current loans mismatch. Write \"0\" in quotes."}
```

`[@dpd]` is "this row's dpd" inside a Table (Sheets: `L2` and fill down, or `ARRAYFORMULA` — tomorrow). The `TRUE, "90+"` at the end is `ELSE`. `AND(a, b)`, `OR(a, b)`, `NOT(a)` combine tests: `=IF(AND([@status]="active", [@dpd]>60), "visit", "")`. Text comparisons in Excel are **case-insensitive** (`"Card"="card"` is TRUE) — remember this on Wednesday; SQL was strict, Excel is not.

### Conditional aggregates — SUMIFS, COUNTIFS, AVERAGEIFS, MAXIFS, MINIFS

These five are `SELECT SUM(x) FROM t WHERE a = 1 AND b >= 2` in one cell. The argument order: **sum range first**, then pairs of (criteria range, criterion). `COUNTIFS` has no sum range.

```
=COUNTIFS(tblLoans[status], "active")                                     → 3 352
=SUMIFS(tblLoans[outstanding], tblLoans[status], "active")                → 203 404 028 903
=COUNTIFS(tblLoans[disbursed_at], ">="&DATE(2026,1,1))                     → 3 051   (through 2026-10-01)
=SUMIFS(tblLoans[principal], tblLoans[disbursed_at], ">="&DATE(2026,1,1))  → 162 333 060 000
=AVERAGEIFS(tblLoans[principal], tblLoans[product], "Small business loan") → 308 728 745
=MAXIFS(tblLoans[dpd], tblLoans[status], "active")                         → 89
```

> 💡 **Key idea.** `SUMIFS` is `SELECT SUM(x) … WHERE …` in one cell: the range to add up first, then (column, condition) pairs — every extra pair is one more `AND`. `COUNTIFS` is the same without the first argument.

Criteria are **text**, even for numbers: `">0"`, `"<=30"`, `"<>cancelled"`. To compare against a cell or a date, glue the operator to it with `&`: `">="&$B$1`, `"<"&EDATE($B$1,1)`. The half-open period filter from week 2 is two pairs: `tblLoans[disbursed_at], ">="&DATE(2026,9,1), tblLoans[disbursed_at], "<"&DATE(2026,10,1)` → 361 loans, 17 015 490 000. Wildcards: `"approved*"` matches `approved` and `approved_not_disbursed` (that is `LIKE 'approved%'`); `"?"` is one character. All criteria are case-insensitive: `COUNTIFS(tblPayments[method], "card")` → **17 621**, both `card` and `Card` — Excel did part of Wednesday's cleaning for you, but `"CASH "` with its space and `"bank transfer"` are still separate.

```game
{"type": "cloze", "id": "w04d1-g2", "title": "Fill the SUMIFS: outstanding of active loans more than 30 days late", "text": "=SUMIFS({{0}}, tblLoans[status], {{1}}, tblLoans[dpd], {{2}})", "blanks": [["tblLoans[outstanding]"], ["\"active\""], ["\">30\""]], "distractors": ["tblLoans[status]", ">30", "\"=active\"", "\"active*\""]}
```

`SUMPRODUCT` is the escape hatch when a criterion is not a simple comparison — `=SUMPRODUCT((tblLoans[dpd]>30)*tblLoans[outstanding])` → 6 507 526 953, the PAR30 numerator. Sheets: identical functions, identical syntax.

### Text functions (*текстовые функции*) — week 2 with new names

| Does | Excel / Sheets | On our data |
|---|---|---|
| remove spaces at the ends (and doubles inside) | `TRIM(s)` (*СЖПРОБЕЛЫ*) | `TRIM("Bobur ")` → `Bobur` — Excel's TRIM also collapses double spaces inside, SQL's does not |
| length | `LEN(s)` (*ДЛСТР*) | `LEN(Customers!J2)` → 13 for every phone |
| first / last / middle n characters | `LEFT(s,n)`, `RIGHT(s,n)`, `MID(s,start,n)` | `LEFT(TEXT([@disbursed_at],"yyyy-mm-dd"),7)` → `2025-03` |
| case | `UPPER`, `LOWER`, `PROPER(s)` (*ПРОПНАЧ*) | `PROPER("jalilova")` → `Jalilova`; `PROPER("MALIKA")` → `Malika` |
| replace text | `SUBSTITUTE(s, old, new)` | `SUBSTITUTE(LOWER(TRIM(F2)), "bank transfer", "transfer")` — week 2's expression |
| number → formatted text | `TEXT(x, "format")` | `TEXT([@disbursed_at], "yyyy-mm")` → `2026-09`; `TEXT(K2, "#,##0")` |
| text → number | `VALUE(s)` | `VALUE("17 015")` → 17015 (needed when numbers arrive as text — a green triangle in the corner) |
| join with a separator | `TEXTJOIN(", ", TRUE, range)`; `&` for two values | `=B2&" "&C2` → full name; `TEXTJOIN(", ", TRUE, UNIQUE(tblLoans[region]))` lists the 8 regions |
| find a position | `FIND` (case-sensitive) / `SEARCH` (not) | `SEARCH(" ", B2)` → position of the space in a full name |

Russian Excel names the functions in Russian (`ЕСЛИ`, `СУММЕСЛИМН`, `СЧЁТЕСЛИМН`, `СРЗНАЧЕСЛИМН`, `СЖПРОБЕЛЫ`, `ЛЕВСИМВ`, `ПРАВСИМВ`, `ДЛСТР`) and separates arguments with `;` not `,`. Switch Office's display language to English (File → Options → Language) if you can — every tutorial and every interview uses the English names; the formulas themselves translate automatically when a file is opened elsewhere.

```game
{"type": "flash", "id": "w04d1-g3", "title": "English ↔ Russian Excel names", "cards": [["SUMIFS", "СУММЕСЛИМН"], ["COUNTIFS", "СЧЁТЕСЛИМН"], ["AVERAGEIFS", "СРЗНАЧЕСЛИМН"], ["IF", "ЕСЛИ"], ["IFS", "ЕСЛИМН"], ["TRIM", "СЖПРОБЕЛЫ"], ["LEFT", "ЛЕВСИМВ"], ["LEN", "ДЛСТР"], ["PROPER", "ПРОПНАЧ"], ["TEXT", "ТЕКСТ"]]}
```

### Number formats (*формат ячеек*) — the value does not change, the display does

Ctrl+1 → Number. `#,##0` shows 208723504430 as `208,723,504,430`; `#,##0,,," bn"` shows it as `209 bn` (each trailing comma divides the display by a thousand); `0.0%` shows 0.0312 as `3.1%`; `yyyy-mm-dd` shows a date as text you can sort. The cell still holds the full number — `TEXT()` is the function that *converts* it. Dates in Excel are numbers (days since 1900-01-00: `DATE(2026,10,1)` = 46 296), which is why `">="&DATE(2026,1,1)` works and why a date stored as *text* (Wednesday) does not compare. Sheets: Format → Number → Custom number format, same codes.

> ⚠️ **Watch out.** A date stored as **text** looks exactly like a real one, but it sits left-aligned and `">="&DATE(2026,1,1)` silently skips it — your 2026 count comes out low and nothing turns red. `=ISNUMBER(G2)` must say TRUE in a date column. Wednesday fixes the ones that do not.

### Google Sheets differences, collected

Same functions (`SUMIFS`, `COUNTIFS`, `IFS`, `MAXIFS`, `TEXTJOIN`, `PROPER` …) and the same `$` logic. Differences you will meet this week: no Tables (whole-column refs and named ranges instead), `ARRAYFORMULA` to fill a column with one formula, `QUERY` (an SQL-like function Excel does not have — Wednesday), Freeze under View, and Sheets recalculates everything in the cloud so 92 000-row `SUMIFS` over `Installments` is slow — summarise with a pivot there instead.

### SQL → Excel, the translation table

You already know what you want to compute; today is only new spelling. Keep this table open until it is memory:

| SQL (weeks 1–3) | Excel / Sheets |
|---|---|
| `FROM loans` | the Table `tblLoans` (Sheets: `Loans!A:M`) |
| `SELECT COUNT(*) FROM loans WHERE status = 'active'` | `=COUNTIFS(tblLoans[status], "active")` |
| `SELECT SUM(outstanding) FROM loans WHERE region = 'Tashkent' AND bucket = '90+'` | `=SUMIFS(tblLoans[outstanding], tblLoans[region], "Tashkent", tblLoans[bucket], "90+")` |
| `AVG(x) WHERE …`, `MAX(x) WHERE …` | `AVERAGEIFS`, `MAXIFS` / `MINIFS` |
| `WHERE d >= '2026-09-01' AND d < '2026-10-01'` | two pairs: `tblLoans[disbursed_at], ">="&DATE(2026,9,1), tblLoans[disbursed_at], "<"&DATE(2026,10,1)` |
| `WHERE status LIKE 'approved%'` | `"approved*"` |
| `WHERE status <> 'cancelled'` | `"<>cancelled"` |
| `GROUP BY region` | a column of region labels + one formula filled down (today) or a pivot (Thursday) |
| `CASE WHEN … END` | `IF` / `IFS` in a calculated column |
| `SUM(CASE WHEN dpd > 30 THEN outstanding ELSE 0 END)` | `=SUMPRODUCT((tblLoans[dpd]>30)*tblLoans[outstanding])` |
| `LOWER(TRIM(method))` | `=LOWER(TRIM([@method]))` |
| `strftime('%Y-%m', d)` / `FORMAT(d, 'yyyy-MM')` | `=TEXT([@disbursed_at], "yyyy-mm")` |
| `ROUND(100.0 * a / b, 1)` | `=a/b` formatted `0.0%` (no `100 *` — the format does it) |
| `JOIN` | tomorrow: `XLOOKUP` / `INDEX-MATCH`; Wednesday: Power Query *Merge* |
| `SELECT DISTINCT` | tomorrow: `UNIQUE` |
| `ORDER BY`, `LIMIT 5` | tomorrow: `SORT` / `SORTBY`, `TAKE`; or the Table's sort arrow |

```game
{"type": "match", "id": "w04d1-g4", "title": "SQL → Excel: match the spelling", "pairs": [["SUM(x) … WHERE …", "SUMIFS"], ["COUNT(*) … WHERE …", "COUNTIFS"], ["CASE WHEN … END", "IFS"], ["LIKE 'approved%'", "\"approved*\""], ["status <> 'cancelled'", "\"<>cancelled\""], ["strftime('%Y-%m', d)", "TEXT(d, \"yyyy-mm\")"]]}
```

Two differences that bite: Excel text comparison is **case-insensitive** (SQL was not, unless the collation said so), and Excel has **no NULL** — an empty cell is ignored by `AVERAGEIFS` and `COUNT` but counted by `COUNTA` and by `COUNTIFS(range, "")`; `monthly_income` blanks on `Customers` (356 of them) behave like week 2's NULLs for averages and like empty text for counts.

### Shortcuts that pay for themselves this week

| Keys (Windows) | Does | Sheets |
|---|---|---|
| Ctrl+T | make the selection a Table | — (Format → Convert to table) |
| Ctrl+Arrow / Ctrl+Shift+Arrow | jump to / select to the edge of the data | same |
| Ctrl+Shift+L | filter arrows on / off | Ctrl+Shift+L |
| F4 | cycle `$` on the selected reference | F4 |
| Ctrl+1 | Format Cells | Ctrl+1 (number format menu) |
| Ctrl+` | show formulas instead of values (check a sheet in one glance) | Ctrl+` |
| Alt+= | AutoSum | Alt+= |
| Ctrl+D / Ctrl+R | fill down / fill right | Ctrl+D / Ctrl+R |
| Ctrl+; | today's date as a value | Ctrl+; |
| Alt+W, F, R | View → Freeze → Freeze Top Row | — |
| Ctrl+Shift+5 / 1 | percent / thousands format | Ctrl+Shift+5 / 1 |

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

Grain: one cell = one region × one bucket; the value is the sum of `outstanding`. New sheet `Summary`. Row 2 has the five buckets `0`, `1-30`, `31-60`, `61-90`, `90+` in B2:F2 (type them as text — `'0`, with an apostrophe — so they are the same type as the text `bucket` column; `=ISTEXT(B2)` must say TRUE. Do not test this with `COUNTIFS`: `COUNTIFS`/`SUMIFS` may treat number-like text as numbers, so a wrong-type label can still look fine there); column A has the eight regions in A3:A10 (copy from a filtered `Loans` sheet, or `=UNIQUE(tblLoans[region])` — tomorrow's tool).

```
B3:  =SUMIFS(tblLoans[outstanding], tblLoans[region], $A3, tblLoans[bucket], B$2)
G3:  =SUM(B3:F3)                      row total
B11: =SUM(B3:B10)                     column total
G11: =SUM(G3:G10)                     → must be 208 723 504 430
```

Fill B3 right to F3 and down to row 10: forty cells, one formula. Checks, in this order: G11 = **208 723 504 430** (the grand total ties to the Loans sheet — if not, a region is misspelt or a label carries a stray space — check the labels with `ISTEXT` and `LEN`); row Tashkent = 81 679 738 071 (39.1 % — `=G3/$G$11` formatted `0.0%`); column `90+` = 5 319 475 527 (the NPL90 numerator, 2.55 %). Tashkent's 90+ cell: 1 920 943 970.

Now the *count* version: replace `SUMIFS(tblLoans[outstanding], …)` with `COUNTIFS(…)` (same pairs, no sum range) → column totals **7 429 / 124 / 25 / 16 / 234**, grand total 7 828. Two tables, one formula each, both tied to a total you know. That is the Excel version of week 3's "every view ships with its check query": **every summary table ends in a cell that must equal a number you can defend.**

> 💡 **Key idea.** Every summary table ends in a check cell that must equal a number you can defend — here 208 723 504 430 and 7 828. If the check is off, fix the labels before you touch the formula.

Finish with the display: select B3:G11, Ctrl+1, custom `#,##0,,," bn"` — `81.7 bn` reads; `81679738071` does not. The cell still holds every soum, so the check still works.

---

## 3. Practice (50 min)

Work in a **copy** of `nur_week4_start.xlsx` named `week-04/day-1/practice.xlsx`, one sheet `Practice`, one labelled block per task (A: the question, B: the formula as text — prefix with an apostrophe, C: the value). Sheets users: one tab, same layout. Each question says what goes **in the box** under it; type the value your formula returns and press ✔ — the box checks it and then shows the formulas and the other numbers.

**P1.** Four cells from `Loans`: number of loans, number of active loans, total outstanding, number of loans with dpd > 0. *In the box: the number of loans with dpd > 0.*

```task
{"id": "w04d1-p1", "kind": "number", "answer": 399, "dp": 0, "unit": "loans", "hint": "COUNTIFS on the dpd column with the criterion \">0\" — in quotes.", "explain": "=COUNTA(tblLoans[loan_id]) → 7 828 · =COUNTIFS(tblLoans[status],\"active\") → 3 352 · =SUM(tblLoans[outstanding]) → 208 723 504 430 · =COUNTIFS(tblLoans[dpd],\">0\") → 399. All four are week-3 numbers; if one differs, the file is not the shipped one."}
```

**P2.** Loans and principal disbursed in 2026 (through the as-of date), then the same for September 2026 only, with the half-open filter. *In the box: the principal disbursed in September 2026, in soum.*

```task
{"id": "w04d1-p2", "kind": "number", "answer": 17015490000, "dp": 0, "unit": "UZS", "hint": "Two pairs on disbursed_at: \">=\"&DATE(2026,9,1) and \"<\"&DATE(2026,10,1).", "explain": "2026: =COUNTIFS(tblLoans[disbursed_at],\">=\"&DATE(2026,1,1)) → 3 051 and the SUMIFS of principal → 162 333 060 000. September: add the pair tblLoans[disbursed_at],\"<\"&DATE(2026,10,1) and start at DATE(2026,9,1) → 361 loans / 17 015 490 000. The 21 loans of 1 October (852 760 000) are inside the first pair and outside the second."}
```

**P3.** A five-row product table: loans, outstanding, share of outstanding (`0.0%`), average principal, largest principal. Which product is 60 % of the book and 10 % of the loans? *In the box: pick the product.*

```task
{"id": "w04d1-p3", "kind": "choice", "options": ["Consumer loan", "Micro loan", "Small business loan", "Auto loan"], "answer": 2, "explain": "COUNTIFS / SUMIFS / =C3/SUM($C$3:$C$7) / AVERAGEIFS / MAXIFS per product. Small business loan 781 loans · 125 892 942 411 · 60.3 % · average 308 728 745 · largest 599 060 000; Auto 391 · 57 684 271 333 · 27.6 %; Consumer 2 418 · 23 054 933 316 · 11.0 %; Micro 2 669 · 956 106 370 · 0.5 %; BNPL 1 569 · 1 135 251 000 · 0.5 %. The largest loans sit just under the product limits in Lookup!E3:E7."}
```

**P4.** Add a calculated column `my_bucket` to `tblLoans` with `IFS` on `dpd`, then prove it equals the shipped `bucket` column with one `SUMPRODUCT` (count of mismatches). *In the box: the mismatch count.*

```task
{"id": "w04d1-p4", "kind": "number", "answer": 0, "dp": 0, "hint": "=SUMPRODUCT(--(tblLoans[my_bucket]<>tblLoans[bucket])). Got 7 429? Look at the bug game above.", "explain": "The IFS from section 1 in a new column; =SUMPRODUCT(--(tblLoans[my_bucket]<>tblLoans[bucket])) → 0. If you get 7 429, your first branch returned the number 0 while the shipped column holds the text \"0\": write it as \"0\". -- turns TRUE/FALSE into 1/0 — the Excel idiom for SUM(CASE WHEN … THEN 1 ELSE 0 END)."}
```

**P5.** The status × bucket cross-tab for delinquent loans only (dpd > 0): a `COUNTIFS` with three pairs. Which statuses appear in 90+ and how many "closed" loans are late? *In the box: how many closed loans are late.*

```task
{"id": "w04d1-p5", "kind": "number", "answer": 14, "dp": 0, "unit": "loans", "explain": "Rows active / closed / default / written_off, columns 1-30 … 90+: =COUNTIFS(tblLoans[status],$A3,tblLoans[bucket],B$2,tblLoans[dpd],\">0\"). 90+ = 44 default + 190 written_off and nothing else; closed: 13 in 1-30 + 1 in 31-60 = 14 — week 2's finding (the fifteenth is at dpd 0 on the as-of day). Active: 111 / 24 / 16 / 0."}
```

**P6.** Average DPD and maximum DPD of *active* delinquent loans, and the average outstanding of an active loan. *In the box: the average DPD of active late loans, 1 decimal.*

```task
{"id": "w04d1-p6", "kind": "number", "answer": 22.7, "dp": 1, "unit": "days", "hint": "AVERAGEIFS with two pairs: status = active and dpd > 0.", "explain": "=AVERAGEIFS(tblLoans[dpd],tblLoans[status],\"active\",tblLoans[dpd],\">0\") → 22.7; =MAXIFS(tblLoans[dpd],tblLoans[status],\"active\") → 89 (no active loan is past 90 — those are default); =AVERAGEIFS(tblLoans[outstanding],tblLoans[status],\"active\") → 60 681 393. The \">0\" pair is what turns \"average over all active loans\" into \"average over the late ones\"."}
```

**P7.** Text: on `Customers`, a `full_name` column = `PROPER(TRIM(first))&" "&PROPER(TRIM(last))`, and three count cells: first names with a trailing space (`LEN` vs `LEN(TRIM)`), surnames that are all lower-case, phones that are not 13 characters long. *In the box: the number of surnames written all in lower case.*

```task
{"id": "w04d1-p7", "kind": "number", "answer": 40, "dp": 0, "hint": "= ignores case in Excel. Which function compares text case-sensitively?", "explain": "=SUMPRODUCT(--EXACT(tblCustomers[last_name],LOWER(tblCustomers[last_name]))) → 40 — EXACT is the one case-sensitive comparison in Excel; with = every surname 'equals' its lower-case copy and you get 6 040. Trailing spaces in first_name: =SUMPRODUCT(--(LEN(tblCustomers[first_name])<>LEN(TRIM(tblCustomers[first_name])))) → 18; phones not 13 long → 0. Row 6001 becomes Malika Jalilova — identical to row 4516. Wednesday finishes this."}
```

**P8.** Payments by method **as recorded**: a `COUNTIFS` for each of the five clean names (`card`, `cash`, `transfer`, `payme`, `click`). Why do the five not add up to 52 875, and which 57 rows did Excel count that SQL did not? *In the box: how many rows the five counts miss.*

```task
{"id": "w04d1-p8", "kind": "number", "answer": 57, "dp": 0, "unit": "rows", "explain": "card 17 621 · cash 8 760 · transfer 8 747 · payme 8 900 · click 8 790 = 52 818; missing 57 = 30 'CASH ' (trailing space) + 27 'bank transfer'. Excel's criteria ignore case, so \"card\" already includes the 57 'Card' rows that week 2's raw GROUP BY kept apart (PayMe, Click likewise) — but a space or a different word still counts as a different value. Σ amount for \"card\": 84 774 870 979 = 33.2 % of the 255 173 169 976 recorded."}
```

**P9.** Bekzod's ten-cell summary with number formats: the P1 and P2 numbers plus Σ principal ever lent (404 783 280 000), average ticket (51 709 668) and PAR30 as a percentage — in `#,##0`, `#,##0,,," bn"` and `0.00%`, each cell labelled. *In the box: PAR30 as a percentage, 2 decimals.*

```task
{"id": "w04d1-p9", "kind": "number", "answer": 3.12, "dp": 2, "unit": "%", "hint": "SUMPRODUCT((tblLoans[dpd]>30)*tblLoans[outstanding]) divided by the total outstanding.", "explain": "=SUMPRODUCT((tblLoans[dpd]>30)*tblLoans[outstanding])/SUM(tblLoans[outstanding]) → 0.0312 → 3.12 % in 0.00%. The bn format shows 404.8 bn, 208.7 bn, 162.3 bn; =TEXT(K3,\"#,##0,,,\")&\" bn\" makes the same display as text for a title cell. Rule: formats on numbers you compute with, TEXT() only on labels."}
```

**P10.** Month labels without a pivot: a column `month` on `tblLoans` as `=TEXT([@disbursed_at],"yyyy-mm")`, then a 2026 table of month → loans, principal, running total of principal (a `SUM` with a `$`-pinned start). *In the box: the running total in the 2026-09 row.*

```task
{"id": "w04d1-p10", "kind": "number", "answer": 161480300000, "dp": 0, "unit": "UZS", "explain": "=COUNTIFS(tblLoans[month],A3), =SUMIFS(tblLoans[principal],tblLoans[month],A3), running =SUM($C$3:C3). 2026-01 287 / 17 452 370 000 → … → 2026-09 361 / 17 015 490 000, running 161 480 300 000; 2026-10 21 / 852 760 000, running 162 333 060 000 = P2. Quarters with a quarter column: Q1 49.00 bn · Q2 52.48 · Q3 60.00 bn. The TEXT month is text, so it sorts correctly and matches COUNTIFS exactly."}
```

> 🚀 **Stretch (optional, +5 XP).** **P11.** Week 3's `v_portfolio_monthly` had month-end outstanding. Reproduce **September 2026 month-end** from `Installments` + `Loans` with `SUMIFS` only: principal due on or after 2026-10-01 for loans disbursed before 2026-10-01. Why is it not 208 723 504 430? *In the box: the September month-end outstanding.*

```task
{"id": "w04d1-p11", "kind": "number", "answer": 208243879623, "dp": 0, "unit": "UZS", "xp": 2, "hint": "Bring disbursed_at onto tblInstallments with =INDEX(tblLoans[disbursed_at], MATCH([@loan_id], tblLoans[loan_id], 0)) — tomorrow's lookup, used once today.", "explain": "=SUMIFS(tblInstallments[principal_due], tblInstallments[due_date], \">=\"&DATE(2026,10,1), tblInstallments[disbursed], \"<\"&DATE(2026,10,1)) → 208 243 879 623. It is not 208 723 504 430 because the 21 loans of 1 October (852 760 000) are excluded, while instalments due on 1 October itself (not yet due at midnight on 30 September) are included — week 3 P8's two definitions, now in Excel."}
```

### Mistakes that cost a point this week

- A typed number next to formulas (`3352` pasted from SQL "because it was right") — it is right until Friday's refresh. Every number in the pack is a formula.
- `SUM(K2:K7829)` instead of `SUM(tblLoans[outstanding])` — the 7 829th row is the first one the pack misses.
- The bucket label `0` typed as a number next to a text `bucket` column — two types that look identical. `=` and `SUMPRODUCT(--(a<>b))` compare strictly and show it (P4); `COUNTIFS`/`SUMIFS` may treat number-like text as numbers, so they are not a safe test. Check labels with `ISTEXT` / `ISNUMBER`.
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

Plus the P5 status × bucket cross-tab on a second sheet `Buckets` — this time for all loans, without the `dpd > 0` pair — formatted (`#,##0`, header bold, frozen), with the five column totals 7 429 / 124 / 25 / 16 / 234.

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
  {"type": "single", "q": "You paste 120 new loans under tblLoans. Which formula includes them without any edit?", "options": ["=SUM(Loans!K2:K7829)", "=SUM(tblLoans[outstanding])", "=SUM(Loans!$K$2:$K$7829)", "=SUBTOTAL(9, Loans!K2:K7829)"], "answer": 1, "explain": "A Table column grows with the Table; every fixed range stops at row 7 829, $ or no $ (→ section 1, Tables)."},
  {"type": "single", "q": "Which formula gives the principal disbursed in September 2026 with the half-open filter?", "options": ["=SUMIFS(tblLoans[principal], tblLoans[disbursed_at], \">=\"&DATE(2026,9,1), tblLoans[disbursed_at], \"<\"&DATE(2026,10,1))", "=SUMIFS(tblLoans[disbursed_at], tblLoans[principal], \">=\"&DATE(2026,9,1))", "=SUMIFS(tblLoans[principal], tblLoans[disbursed_at], \">=DATE(2026,9,1)\")", "=SUMIFS(tblLoans[principal], tblLoans[disbursed_at], \"<=\"&DATE(2026,9,30))"], "answer": 0, "explain": "Sum range first, two pairs on the date, the operator glued to DATE() with & (→ section 1, Conditional aggregates; P2)."},
  {"type": "multi", "q": "COUNTIFS(method, \"card\") returns 17 621 while SQL's GROUP BY said 17 564. Which kinds of dirt does Excel still NOT absorb?", "options": ["Upper and lower case (Card vs card)", "A trailing space ('CASH ')", "A different word ('bank transfer' vs 'transfer')", "None — Excel absorbs all three"], "answer": [1, 2], "explain": "Criteria ignore case, so Card is already inside 17 621; spaces and synonyms need TRIM and SUBSTITUTE — Wednesday (→ P8)."},
  {"type": "number", "q": "How many loans does this return on the shipped file?", "code": "=COUNTIFS(tblLoans[status], \"active\", tblLoans[dpd], \">0\")", "answer": 151, "explain": "Active and late: 111 in 1-30 + 24 in 31-60 + 16 in 61-90 = 151; no active loan is 90+ (→ P5)."}
]}
```

---

## 6. Company corner <span class="badge company">Approval rate by channel, in cells</span>

Week 2's **approval rate by channel** (*уровень одобрения по каналам*) under both conventions — all applications, and decided only (cancelled out) — as `COUNTIFS` on `tblApplications`. Marketing's version differs from Nilufar's because they use different denominators; your sheet shows both and says which is which.

Sheet `Approval`: channels in A3:A5 (`app`, `branch`, `partner`), then:

```
B3 applications    =COUNTIFS(tblApplications[channel], $A3)
C3 approved        =COUNTIFS(tblApplications[channel], $A3, tblApplications[status], "approved*")
D3 decided         =COUNTIFS(tblApplications[channel], $A3, tblApplications[status], "<>cancelled")
E3 rate, all       =C3/B3        → 0.0%
F3 rate, decided   =C3/D3        → 0.0%
```

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
  {"type": "single", "q": "You type this in B3 and fill it right to F3 and down to row 10. What does $A3 do?", "code": "=SUMIFS(tblLoans[outstanding], tblLoans[region], $A3, tblLoans[bucket], B$2)", "options": ["Nothing — $ only matters in VBA", "Keeps column A fixed while the row moves, so every cell reads its region from column A", "Keeps row 3 fixed while the column moves", "Pins the single cell A3 for every copy"], "answer": 1, "explain": "$ before the letter pins the column, before the number pins the row; B$2 does the opposite for the bucket labels (→ section 1, Absolute and relative references)."},
  {"type": "single", "q": "Which criterion counts both approved and approved_not_disbursed applications?", "options": ["\"approved\"", "\"approved*\"", "\"=approved\"", "\"<>rejected\""], "answer": 1, "explain": "* is any characters, like LIKE 'approved%'; \"approved\" alone is Marketing's lower rate, and <>rejected also lets cancelled in (→ section 1, Conditional aggregates; section 6)."},
  {"type": "number", "q": "The method column of a small table holds these five values. What does the formula return?", "code": "method: card | Card | CARD | 'card ' (trailing space) | cash\n\n=COUNTIFS(tblPayments[method], \"card\")", "answer": 3, "explain": "Excel criteria ignore case, so card, Card and CARD all match; a trailing space is still a different value (→ section 1, Conditional aggregates; P8)."},
  {"type": "multi", "q": "What does an Excel Table (Ctrl+T) give your formulas that a plain range like K2:K7829 does not?", "options": ["Structured references such as tblLoans[outstanding] that mean the whole column", "Auto-expansion: new rows pasted under the table are included", "Calculated columns: one formula fills every row", "Case-sensitive text comparison", "NULL values like SQL"], "answer": [0, 1, 2], "explain": "Excel stays case-insensitive and has no NULL, Table or not (→ section 1, Tables)."},
  {"type": "single", "q": "B2 may hold the bucket label as the number 0, while tblLoans[bucket] holds the text \"0\". Which formula is a reliable test that B2 is the wrong type?", "options": ["=ISTEXT(B2) — FALSE means B2 is a number, not the text \"0\"", "=COUNTIFS(tblLoans[bucket], B2) — a non-zero result proves B2 is text", "=LEN(B2) — 1 means it is text", "=SUM(B2) — 0 means it is text"], "answer": 0, "explain": "ISTEXT / ISNUMBER test the type, and = or SUMPRODUCT(--(a<>b)) compare strictly; COUNTIFS and SUMIFS may treat number-like text as numbers, so they are not a safe test. Type the label as '0 (→ section 2, Worked example; Mistakes that cost a point)."},
  {"type": "single", "q": "A1 = 1 and A2 = 4. A cell holds =100*A1/A2 and is formatted 0.0%. What does it show?", "options": ["25.0%", "2500.0%", "0.3%", "#VALUE!"], "answer": 1, "explain": "The % format already multiplies by 100; write =A1/A2 and let the format do it (→ section 1, SQL → Excel translation table; Mistakes that cost a point)."},
  {"type": "single", "q": "You want to count surnames written entirely in lower case. Why does =SUMPRODUCT(--(tblCustomers[last_name]=LOWER(tblCustomers[last_name]))) fail?", "options": ["SUMPRODUCT cannot compare text", "= ignores case in Excel, so every surname equals its lower-case copy; use EXACT", "LOWER does not exist in Excel", "-- turns the text into errors"], "answer": 1, "explain": "EXACT is the one case-sensitive comparison in Excel (→ P7)."},
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
