# Week 4 · Day 2 — Lookups and dynamic arrays: joining in Excel

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge company">Company corner</span>

> STORY **Tuesday, 9:10.** Sevara, head of collections (*руководитель по взысканию*), with yesterday's `Loans` sheet printed and highlighted by hand. *"I did this with a marker for Tashkent South last night. I want the file to do it: **colour every loan by its bucket** — red for 90+, orange, yellow — and give me a **dropdown** at the top where I pick a branch and the sheet shows only that branch's late loans, worst first, with the count and the money. And put the product's interest rate next to each loan; the rate lives on another sheet and I am not retyping it 7 828 times."*

## Today in 3 lines

- A **lookup** is a join: `VLOOKUP` (and its four traps), `INDEX/MATCH`, and `XLOOKUP` — exact match for keys, **approximate match** for buckets and bands, not-found text instead of `#N/A`.
- **Dynamic arrays** — `FILTER`, `UNIQUE`, `SORT`, `SORTBY`, `SEQUENCE` — return many cells from one formula (a *spill*); with a **data-validation dropdown** they make a report the reader drives.
- **Conditional formatting** turns a bucket column into colour; you have built Sevara's sheet and reproduced the bucket counts 7 429 / 124 / 25 / 16 / 234 with an approximate lookup against the `Lookup` table.

**Today's file:** `data/excel/nur_week4_start.xlsx` again — press **⬇ Download** if you need a fresh copy and save it as `week-04/day-2/practice.xlsx` (yesterday's copy works too). `FILTER`, `UNIQUE`, `SORT` and `XLOOKUP` need Excel 365 / 2021 or Google Sheets; in Excel 2016/2019 use `INDEX/MATCH` and leave the spills for Thursday's pivots. **Done today** = Sevara's `Collections` sheet answers to its dropdown (Tashkent South → 59 late loans), every Practice box is ✓, the Quick check is answered and the day quiz is passed. No new homework — HW 4.1 is due tomorrow.

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

```text
what      the key in this row                 B2  ("Micro loan")
where     the column to search for the key    E2:E4
return    the column to bring back            F2:F4
```

The picture — the loans table with the looked-up rate added:

```pic
{"id": "w04d2-pic1", "title": "A lookup brings one column across, like a LEFT JOIN", "caption": "Same colour, same product: the key is found in `rates` and its `rate` comes back into the loan's row. `Car lease` has no row in `rates` — look at the circled cell.", "tables": [{"id": "loans", "name": "A1:D5", "label": "loans", "cols": ["loan_id", "product", "outstanding", "rate"], "rows": [[101, "Micro loan", 4, "0.42"], [102, "Auto loan", 200, "0.24"], [103, "Car lease", 90, "#N/A"], [104, "Micro loan", 2, "0.42"]], "new": ["rate"], "cells": [[2, "rate"]]}, {"id": "rates", "name": "E1:F4", "label": "rates", "cols": ["product", "rate"], "rows": [["Micro loan", "0.42"], ["Auto loan", "0.24"], ["Consumer loan", "0.30"]], "tags": {"product": "key"}}], "links": [{"from": ["loans", 0, "product"], "to": ["rates", 0, "product"]}, {"from": ["loans", 1, "product"], "to": ["rates", 1, "product"]}, {"from": ["loans", 3, "product"], "to": ["rates", 0, "product"]}]}
```

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

> ⚠️ **Watch out.** A lookup returns only the **first** match. If the key repeats on the lookup side — a customer *name* instead of an id — you silently get one arbitrary row. Look up on ids.

**Your turn.** Each loan needs its product's annual rate. What are the key and the table you search?

```task
{"id": "w04d2-l1", "kind": "choice", "options": ["Key loan_id, search tblLoans", "Key product, search the product column of Lookup (A3:A7), return annual_rate", "Key annual_rate, search tblLoans", "Key branch, search Lookup"], "answer": 1, "explain": "The fact (the rate) lives on Lookup, one row per product. The loan carries the product name, so product is the key that connects the two."}
```

### VLOOKUP and its four traps

**What it is.** **VLOOKUP** (*ВПР*) finds `what` in the **first column** of a range and returns the value from the n-th column of the same row. It is the oldest and most used lookup in finance — and the easiest to get wrong.

**How to write it.**

```excel
=VLOOKUP(what, where, column_number, FALSE)
=VLOOKUP(B2, $E$2:$F$4, 2, FALSE)          what = this row's product · where = the whole rates table
                                            2 = its 2nd column · FALSE = exact match
```

On the small table it returns 0.42, 0.24, `#N/A`, 0.42. On the real workbook:

```excel
=VLOOKUP([@product], Lookup!$A$3:$F$7, 3, FALSE)     → 0.30 for a Consumer loan
```

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

```game
{"type": "bug", "id": "w04d2-g1", "title": "Spot the trap", "q": "This rate column is filled down all 7 828 loans. The range is pinned, yet some products get another product's rate. Tap the line that causes it.", "code": "=VLOOKUP(\n    [@product],\n    Lookup!$A$3:$F$7,\n    3)", "answer": [3], "why": "The fourth argument is missing, so VLOOKUP runs an approximate match that assumes the product column is sorted. It is not — write 3, FALSE)."}
```

### INDEX / MATCH — find the position, then take the value

**What it is.** **MATCH** (*ПОИСКПОЗ*) returns the **position** of a value in one column. **INDEX** (*ИНДЕКС*) returns the value at a position in another column. Together they are a lookup that can return any column — left or right of the key — and that does not break when columns are inserted.

**How to write it.**

```excel
=MATCH(what, one_column, 0)                    0 = exact match → a position (1, 2, 3 …)
=INDEX(one_column, position)                   the value at that position
=INDEX(return_column, MATCH(what, key_column, 0))
```

On the small table: `=MATCH("Auto loan", E2:E4, 0)` → **2**; `=INDEX(F2:F4, 2)` → **0.24**. Together: `=INDEX($F$2:$F$4, MATCH(B3, $E$2:$E$4, 0))` → 0.24.

On the real workbook:

```excel
=INDEX(Lookup!$C$3:$C$7, MATCH([@product], Lookup!$A$3:$A$7, 0))     → the rate
=INDEX(Lookup!$A$3:$A$7, MATCH("SME", Lookup!$B$3:$B$7, 0))           → "Small business loan" (looking left)
```

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

```task
{"id": "w04d2-l2", "kind": "number", "answer": 0.24, "dp": 2, "hint": "Auto loan is the 4th product on Lookup; column C is annual_rate.", "model": "0.24 — MATCH finds Auto loan in position 4 of A3:A7; INDEX takes position 4 of C3:C7."}
```

### XLOOKUP — exact match and "not found"

**What it is.** **XLOOKUP** (*ПРОСМОТРX*) is the modern lookup (Excel 2021 / Microsoft 365, Google Sheets). It takes the key column and the return column separately, matches exactly by default, and has its own argument for "not found".

**How to write it.**

```excel
=XLOOKUP(what, lookup_column, return_column, [if_not_found], [match_mode], [search_mode])
=XLOOKUP(B2, $E$2:$E$4, $F$2:$F$4, "not found")
```

On the small table it returns 0.42, 0.24, `not found`, 0.42 — row 103 reads `not found` instead of `#N/A`.

On the real workbook:

```excel
=XLOOKUP([@product], Lookup!$A$3:$A$7, Lookup!$C$3:$C$7)              exact by default; #N/A if missing
=XLOOKUP($B$1, tblLoans[loan_id], tblLoans[customer], "not found")
```

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

```game
{"type": "cloze", "id": "w04d2-g2", "code": true, "title": "Build Sevara's loan finder: type a loan_id in B1, get the customer", "text": "=XLOOKUP({{0}}, {{1}}, {{2}}, {{3}})", "blanks": [["$B$1"], ["tblLoans[loan_id]"], ["tblLoans[customer]"], ["\"not found\""]], "distractors": ["FALSE", "-1", "tblLoans[branch]", "3"]}
```

### XLOOKUP for bands — approximate and wildcard match

**What it is.** The 5th argument, **match_mode**, changes how XLOOKUP compares. `-1` finds the exact value **or the next smaller** one — the rule for a **band table** (*таблица диапазонов*) whose key column holds lower edges. `2` lets the key contain wildcards `*` and `?`.

**How to write it.**

```excel
match_mode   0 exact (default) · -1 exact or next smaller · 1 exact or next larger · 2 wildcard
=XLOOKUP([@dpd], Lookup!$A$11:$A$15, Lookup!$B$11:$B$15, , -1)       the empty 4th argument: no not-found text
```

The band table on `Lookup` and what three dpd values get:

```pic
{"id": "w04d2-pic2", "title": "match_mode -1: the largest edge not above the value", "caption": "Each dpd goes to the band whose `dpd_from` is the largest one ≤ dpd (same colour): 45 → 31 → **31-60**, 919 → 91 → **90+**.", "tables": [{"id": "dpd", "name": "tblLoans", "cols": ["dpd", "bucket"], "rows": [[0, "0"], [45, "31-60"], [919, "90+"]], "new": ["bucket"]}, {"id": "band", "name": "Lookup!A11:B15", "cols": ["dpd_from", "bucket"], "rows": [[0, "0"], [1, "1-30"], [31, "31-60"], [61, "61-90"], [91, "90+"]], "tags": {"dpd_from": "lower edge"}}], "links": [{"from": ["dpd", 0, "dpd"], "to": ["band", 0, "dpd_from"]}, {"from": ["dpd", 1, "dpd"], "to": ["band", 2, "dpd_from"]}, {"from": ["dpd", 2, "dpd"], "to": ["band", 4, "dpd_from"]}]}
```

dpd takes 258 different values, from 0 to 919; five rows of edges cover all of them. On `tblLoans` this formula reproduces the shipped `bucket` column exactly. The same rule in older spellings: `=VLOOKUP([@dpd], Lookup!$A$11:$B$15, 2, TRUE)` or `=INDEX(Lookup!$B$11:$B$15, MATCH([@dpd], Lookup!$A$11:$A$15, 1))`.

Wildcard: `=XLOOKUP("Small*", Lookup!$A$3:$A$7, Lookup!$C$3:$C$7, , 2)` → **0.26**.

**When you use it.**
- Any band: dpd → bucket, income → band, score → grade, amount → fee tier.
- A boundary change becomes one cell on `Lookup`, not an edit to every formula.

| Key column holds | Use |
|---|---|
| lower edges (0, 1, 31, 61, 91) | match_mode `-1` (`VLOOKUP … TRUE`, `MATCH … 1`) |
| upper edges (0, 30, 60, 90, 9999) | match_mode `1` |

> ⚠️ **Watch out.** Lower edges with `1`, or upper edges with `-1`, shift every boundary value into the wrong band — dpd 31 lands in `1-30` — with no error. And `VLOOKUP … TRUE` and `MATCH … 1` need the edges sorted ascending.

**Your turn.** Which bucket does `=XLOOKUP(61, Lookup!$A$11:$A$15, Lookup!$B$11:$B$15, , -1)` return?

```task
{"id": "w04d2-l3", "kind": "text", "answer": ["61-90"], "model": "61-90 — 61 is itself an edge, so the exact match wins before \"next smaller\" is needed."}
```

### XLOOKUP from the end — the last match

**What it is.** The 6th argument, **search_mode**, sets the direction. `1` (default) searches from the top and returns the **first** match. `-1` searches from the bottom and returns the **last** match.

**How to write it.**

```excel
search_mode   1 first to last (default) · -1 last to first
=XLOOKUP(4567, tblPayments[loan_id], tblPayments[paid_at], , 0, -1)      the bottom row of loan 4567
```

Loan 4567 has three payment rows: 2026-04-07, 2026-05-06, 2026-06-09. From the top the formula would return 2026-04-07; from the bottom it returns **2026-06-09** (format the cell `yyyy-mm-dd`).

**When you use it.**
- "The latest X of each Y" when the table is in date order: the last payment of a loan, the last status of an application.
- With `MAXIFS` as the check: `=MAXIFS(tblPayments[paid_at], tblPayments[loan_id], 4567)` returns the latest date whatever the row order.

> ⚠️ **Watch out.** `-1` gives the last **row**, not the latest **date**. In `tblPayments`, for 80 of the 7 436 loans with payments the bottom row is not the latest date (duplicates and late entries sit at the end). For "latest", use `MAXIFS` on the date.

**Your turn.** What does `=XLOOKUP(4567, tblPayments[loan_id], tblPayments[paid_at], , 0, 1)` return — the same formula searching from the top?

```task
{"id": "w04d2-l4", "kind": "choice", "options": ["2026-04-07 — the first row of loan 4567", "2026-06-09 — the last row", "#N/A — search_mode 1 is not allowed", "All three dates, spilled"], "answer": 0, "explain": "search_mode 1 searches top-down and stops at the first match: the first payment row of loan 4567."}
```

### Two-key lookups

**What it is.** A **two-key lookup** finds the row where **two** columns match at once — a join on two columns. The usual way: glue the two keys into one with `&` and look that up.

**How to write it.** Three ways, best first:

```excel
1. helper key column    [@loan_id]&"|"&[@installment_no]   in the lookup table, then an exact lookup on it
2. glue inside          =XLOOKUP(k1&"|"&k2, col1&"|"&col2, return_column)
3. classic array        =INDEX(return_column, MATCH(1, (col1=k1)*(col2=k2), 0))    old Excel: Ctrl+Shift+Enter

```

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

```task
{"id": "w04d2-l5", "kind": "choice", "options": ["XLOOKUP with a glued key region&\"|\"&product", "SUMIFS with two pairs (region, product)", "VLOOKUP with FALSE", "INDEX/MATCH on product only"], "answer": 1, "explain": "95 loans match both keys and you want their sum — a group, not a row. A lookup would return the first loan's outstanding only."}
```

### IFERROR — a replacement for an expected error

**What it is.** **IFERROR** (*ЕСЛИОШИБКА*) returns the formula's result, or a second value when the formula returns any error. It is how `VLOOKUP` and `INDEX/MATCH` show "not found" instead of `#N/A`.

**How to write it.**

```excel
=IFERROR(formula, value_if_error)
=IFERROR(INDEX($F$2:$F$4, MATCH(B4, $E$2:$E$4, 0)), "not found")      → "not found" for Car lease
```

On the real workbook: `=IFERROR(INDEX(tblLoans[customer], MATCH($B$1, tblLoans[loan_id], 0)), "not found")` returns the same as the XLOOKUP loan finder above — `not found` for 99999.

**When you use it.**
- A miss that is **expected** and a replacement that **means** something: `"not found"`, `""`, sometimes `0`.
- With a check cell that counts the misses: `=COUNTIF(rate_column, "not found")` must be 0 when every product is on `Lookup`.

| `IFERROR(x, …)` | `XLOOKUP(…, "not found")` |
|---|---|
| catches **every** error: `#N/A`, `#REF!`, `#VALUE!`, `#DIV/0!` | replaces only "no match" |
| hides a broken formula | a broken formula still shows its error |

> ⚠️ **Watch out.** `IFERROR(…, 0)` around a lookup with a `SUM` under it turns every miss into a zero — the total looks complete and is short. Never wrap a formula you do not understand: an `IFERROR` around a `#REF!` is a blank cell on the board slide.

**Your turn.** Three loans have a trailing space in `product`, and the rate column is `=IFERROR(VLOOKUP([@product], Lookup!$A$3:$F$7, 3, FALSE), 0)`. What does the run-rate total under it show?

```task
{"id": "w04d2-l6", "kind": "choice", "options": ["#N/A, so you notice", "A total that looks complete but leaves out those three loans' interest", "The right total — IFERROR trims the key", "An empty cell"], "answer": 1, "explain": "The three misses become rate 0, so their interest disappears from the sum without a sign. Let #N/A show, or count the misses in a check cell."}
```

### Dynamic arrays — one formula, many cells (a spill)

**What it is.** In Excel 365 / 2021 and Sheets a formula can return many values. They **spill** (*разлив*) into the cells below and to the right, outlined in blue. The formula lives in the top-left cell only. `A3#` means "the whole spill that starts in A3".

**How to write it.**

```excel
A3:   =UNIQUE(tblLoans[branch])         one formula → 10 cells, A3:A12
B3:   =ROWS(A3#)                         → 10     # = all of A3's spill, however long
```

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

```task
{"id": "w04d2-l7", "kind": "choice", "options": ["Whether any loan matches the condition", "Whether something is typed in the cells below or to the right of A6", "Whether the file is in Excel 2016", "Whether the condition uses * for AND"], "answer": 1, "explain": "#SPILL! means \"no room\". No match shows FILTER's if_empty text (or #CALC!), and an unknown function shows #NAME?."}
```

### UNIQUE — the distinct values

**What it is.** **UNIQUE** (*УНИК*) returns each distinct value of a range once. It is `SELECT DISTINCT` in a cell.

**How to write it.**

```excel
=UNIQUE(range)
=UNIQUE(tblLoans[region])          → 8 rows, one per region
=ROWS(UNIQUE(tblLoans[branch]))    → 10   a count of distinct values
```

On the small loans table: `=UNIQUE(B2:B5)` → `Micro loan`, `Auto loan`, `Car lease` — three rows, Micro once.

**When you use it.**
- The labels of a summary table: `A3 =UNIQUE(tblLoans[branch])`, then `B3 =SUMIFS(tblLoans[outstanding], tblLoans[branch], A3#)` spills one total per branch.
- The source list of a dropdown.
- A distinct count: `ROWS(UNIQUE(…))` = `COUNT(DISTINCT …)`.

> ⚠️ **Watch out.** A distinct count of a **name** column is not a count of people: two people can share a name, and one person can be typed two ways. Count distinct **ids**.

**Your turn.** How many distinct products does `=ROWS(UNIQUE(tblLoans[product]))` return?

```task
{"id": "w04d2-l8", "kind": "number", "answer": 5, "dp": 0, "unit": "products", "model": "5 — Micro, Consumer, Buy now pay later, Small business, Auto; the same five rows as Lookup!A3:A7."}
```

### FILTER — the rows that meet a condition

**What it is.** **FILTER** (*ФИЛЬТР*) returns the rows of a range where a condition is TRUE. It is `SELECT … WHERE …` in a cell.

```pic
{"id": "w04d2-pic3", "title": "FILTER spills the rows where the condition is TRUE", "caption": "The condition is a column of TRUE/FALSE, one per row. Rows 101 and 104 say TRUE (green) and spill into the result; the formula lives in its top-left cell only.", "tables": [{"id": "src", "name": "A1:C5", "label": "loans", "cols": ["loan_id", "product", "outstanding"], "rows": [[101, "Micro loan", 4], [102, "Auto loan", 200], [103, "Car lease", 90], [104, "Micro loan", 2]], "tags": {"product": "condition"}, "keep": [0, 3], "drop": [1, 2]}, {"id": "res", "name": "FILTER(…)", "label": "spill", "cols": ["loan_id", "product", "outstanding"], "rows": [[101, "Micro loan", 4], [104, "Micro loan", 2]], "via": "B2:B5=\"Micro loan\""}]}
```

**How to write it.**

```excel
=FILTER(range, condition, [if_empty])
=FILTER(tblLoans, (tblLoans[branch]=$B$1)*(tblLoans[dpd]>0), "no late loans")
         rows      AND = multiply: (a)*(b)                       text when nothing matches
```

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

```game
{"type": "cloze", "id": "w04d2-g6", "code": true, "title": "Active loans in bucket 61-90", "text": "=FILTER(tblLoans, ({{0}}=\"active\"){{1}}(tblLoans[bucket]={{2}}), \"none\")", "blanks": [["tblLoans[status]"], ["*"], ["\"61-90\""]], "distractors": ["+", "AND", "61-90", "tblLoans[dpd]"]}
```

### SORT and SORTBY — order a list

**What it is.** **SORT** (*СОРТ*) returns a range sorted by one of its own columns. **SORTBY** sorts a range by **another** range of the same length. They are `ORDER BY` in a cell.

**How to write it.**

```excel
=SORT(range, [column_number], [order])        order: 1 ascending (default), -1 descending
=SORTBY(range, by_range, [order])
=SORT(FILTER(tblLoans, …), 12, -1)            by the 12th column of tblLoans (dpd), worst first
=SORTBY(tblLoans[loan_id], tblLoans[outstanding], -1)
```

On the small loans table: `=SORTBY(A2:A5, C2:C5, -1)` → 102, 103, 101, 104 (by outstanding 200, 90, 4, 2).

On the real workbook: `=SORTBY(tblLoans[loan_id], tblLoans[outstanding], -1)` starts with **4597** — the largest outstanding, 586 068 714 — then 6478 and 2936. `=SORT(UNIQUE(tblLoans[region]))` lists the regions from Andijan to Termez.

**When you use it.**
- A ranked list: worst loans first, biggest branches first.
- `SORT` when the sort column is inside the range; `SORTBY` when it is not, or when you sort a spill by another spill (`=SORTBY(A3#, B3#, -1)`).
- Top n: `=TAKE(SORT(…), 5)` in Excel 365.

> ⚠️ **Watch out.** `SORT`'s column number counts from the range's first column, not from column A of the sheet. In `tblLoans`, `dpd` is the 12th column.

**Your turn.** In `=SORT(FILTER(tblLoans, …), 11, -1)`, which column of `tblLoans` sorts the list?

```task
{"id": "w04d2-l9", "kind": "choice", "options": ["dpd", "outstanding", "status", "principal"], "answer": 1, "explain": "The columns are loan_id, customer, region, product, branch, grade, disbursed_at, principal, term, status, outstanding, dpd, bucket — the 11th is outstanding."}
```

### SEQUENCE — a column of numbers

**What it is.** **SEQUENCE** (*ПОСЛЕДОВ*) returns a list of numbers: 1, 2, … n. Used inside another function it builds a list of dates or labels.

**How to write it.**

```excel
=SEQUENCE(rows, [columns], [start], [step])
=SEQUENCE(5)                       → 1, 2, 3, 4, 5
=DATE(2026, SEQUENCE(10), 1)       → 2026-01-01, 2026-02-01, … 2026-10-01
```

With the dates in A3#, `B3 =COUNTIFS(tblLoans[disbursed_at], ">="&A3#, tblLoans[disbursed_at], "<"&EDATE(A3#, 1))` spills one count per month. January 2026 has **287** loans.

**When you use it.**
- A calendar of months or days to count against — including the months with zero loans.
- Row numbers and ranks next to a sorted spill.

**Your turn.** What is the last date in the spill of `=DATE(2026, SEQUENCE(10), 1)`?

```task
{"id": "w04d2-l10", "kind": "text", "answer": ["2026-10-01", "01.10.2026", "1 October 2026"], "model": "2026-10-01 — SEQUENCE(10) gives months 1 to 10, so the last row is DATE(2026, 10, 1)."}
```

### Data validation — a dropdown the reader picks from

**What it is.** **Data validation** (*проверка данных*) limits what can be typed in a cell. Its **List** type makes a **dropdown** (*выпадающий список*). Every formula that reads the cell changes when the reader picks another value — the Excel version of a query parameter.

**How to write it.**

```text
Select B1 → Data → Data Validation → Allow: List → Source: =Helper!$A$2#
Helper!A2:   =SORT(UNIQUE(tblLoans[branch]))          the list, spilled on a helper sheet
Sheets:      Data → Data validation → Dropdown (from a range) → Helper!A2:A11
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

```task
{"id": "w04d2-l11", "kind": "choice", "options": ["=tblLoans[branch]", "=Helper!$A$2# where Helper!A2 holds =SORT(UNIQUE(tblLoans[branch]))", "=UNIQUE(tblLoans[branch]) typed into the Source box", "The word branch"], "answer": 1, "explain": "The List source must be a range. A spilled UNIQUE on a helper sheet, referred to with #, is a range that also grows when a branch opens."}
```

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

```excel
=$M2="90+"          $M = always column M (bucket) · 2 = the row moves with each row
```

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

```task
{"id": "w04d2-l12", "kind": "choice", "options": ["=$M$6=\"90+\"", "=$M6=\"90+\"", "=M$6=\"90+\"", "=$M2=\"90+\""], "answer": 1, "explain": "The rule is written for the first row of the selection (row 6), with the column pinned and the row free. $M2 would make each row read the bucket four rows above it."}
```

### Reading the errors

**What it is.** An error value tells you *what kind* of thing went wrong. Read it before you fix — or hide — anything.

**How to write it.** The six you will meet this week:

| Error | Means | First check |
|---|---|---|
| `#N/A` | the lookup found nothing | a space or case difference in the key (`"Micro loan "`), a number stored as text (`"2167"` vs 2167 — `VALUE()` one side) |
| `#REF!` | a reference points at deleted cells, or `VLOOKUP`'s column number is bigger than the range | the range width; what was deleted |
| `#VALUE!` | wrong type of argument (text where a number is needed; ranges of different sizes) | `SUMIFS` ranges of equal length; dates as text |
| `#NAME?` | Excel does not know the function (XLOOKUP in Excel 2016) or a name is misspelt | the Excel version; quotes around text |
| `#SPILL!` | a dynamic array has no room | clear the cells below / right of the formula |
| `#DIV/0!` | a share with an empty denominator | an empty group; `IF(den=0, "", num/den)` |

**When you use it.** Every time a cell shows `#`. `IFERROR` hides all six alike — that is why it is for *expected* misses only.

**Your turn.**

```game
{"type": "match", "id": "w04d2-g4", "title": "Read the error", "pairs": [["#N/A", "the lookup found nothing (a space, or a number stored as text)"], ["#REF!", "points at deleted cells, or a column number past the range"], ["#VALUE!", "wrong argument type, or ranges of different sizes"], ["#NAME?", "Excel does not know the function (XLOOKUP in Excel 2016)"], ["#SPILL!", "a dynamic array has no room"], ["#DIV/0!", "a share with an empty denominator"]]}
```

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
| Distinct values of a column | `UNIQUE` | Remove Duplicates on a copy (Wednesday: it lies) |
| Last occurrence (latest payment of a loan) | `XLOOKUP … , , , -1` on a date-ordered table, or `MAXIFS` on the date | `VLOOKUP` (first match only) |

**When you use it.** Before you write the formula: name the shape of the answer first.

**Your turn.**

```game
{"type": "sort", "id": "w04d2-g3", "title": "Which tool for which question?", "q": "Drop each of Sevara's and Bekzod's questions into the tool that answers it.", "groups": {"Exact lookup (XLOOKUP / INDEX-MATCH)": ["loan 2167 → its customer", "product → annual rate"], "Approximate lookup on a sorted band table": ["dpd 45 → bucket", "credit score → grade"], "SUMIFS — a group, not a row": ["Fergana + SME → total outstanding"], "FILTER (+ SORT)": ["all late loans of Tashkent South, worst first"]}}
```

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

```task
{"id": "w04d2-l13", "kind": "choice", "options": ["=FILTER(Loans!A2:M, Loans!E2:E=B1, Loans!L2:L>0)", "=FILTER(Loans!A2:M, AND(Loans!E2:E=B1, Loans!L2:L>0))", "=QUERY(B1)", "Sheets has no FILTER"], "answer": 0, "explain": "Sheets takes each condition as its own argument; they combine as AND. AND() fails in both programs."}
```

### Putting it together

Sevara's question in one block: *"the late loans of the branch I pick, worst first, each with its product's rate"*.

```excel
B1:  dropdown — Data Validation, List, source =Helper!$A$2#   (Helper!A2: =SORT(UNIQUE(tblLoans[branch])))
A6:  =SORT(FILTER(tblLoans, (tblLoans[branch]=$B$1)*(tblLoans[dpd]>0), "no late loans"), 12, -1)
N6:  =XLOOKUP(INDEX(A6#, , 4), Lookup!$A$3:$A$7, Lookup!$C$3:$C$7)
```

1. **UNIQUE** + **SORT** make the branch list; **data validation** turns `B1` into a dropdown.
2. **FILTER** keeps the rows of that branch with dpd > 0 — two conditions multiplied for AND.
3. **SORT** on column 12 (`dpd`), `-1`, puts the worst loan first. The result is a **spill**: `A6#`.
4. **XLOOKUP** brings each row's rate: `INDEX(A6#, , 4)` is the spill's 4th column, `product`.
5. A **conditional-formatting** formula rule `=$M6="90+"` on A6:N2000 colours the rows.

Pick Tashkent South: 59 rows, and the first is loan 7339 at 902 days. The Worked example builds this sheet step by step.

**Put the formula together.**

```game
{"type": "build", "id": "w04d2-g7", "title": "Build Sevara's list", "q": "The late loans of the branch in B1, worst first.", "tokens": ["=SORT(", "FILTER(", "tblLoans,", "(tblLoans[branch]=$B$1)*(tblLoans[dpd]>0)", "),", "12,", "-1)"], "distractors": ["AND(", "11,", "(tblLoans[branch]=B1)+(tblLoans[dpd]>0)"]}
```

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

```videoquiz
{"video": "TDphx23AtqM", "stops": [{"at": 250, "q": "What should VLOOKUP's last argument be when you look up a key such as a product name?", "options": ["TRUE", "FALSE (or 0)", "Leave it out", "1"], "answer": 1, "explain": "FALSE = exact match. Leaving it out means TRUE, approximate — trap 1.", "back": 30}, {"at": 280, "q": "Why lock the table range with $ before filling the formula down?", "options": ["So the range does not slide down one row per row", "So it calculates faster", "So it can look left", "So it becomes case-sensitive"], "answer": 0, "explain": "An unpinned range walks — trap 4; A3:F7 becomes A4:F8 and the last product stops matching.", "back": 30}]}
```

```videoquiz
{"video": "F264FpBDX28", "stops": [{"at": 430, "q": "What does MATCH return?", "options": ["The value it found", "The position of the value in the range", "TRUE or FALSE", "The sheet's row number"], "answer": 1, "explain": "A position; INDEX then turns the position into a value from any column."}, {"at": 480, "q": "What can INDEX/MATCH do that VLOOKUP cannot?", "options": ["Return a value from a column to the left of the key", "Add up a group", "Sort the result", "Hide errors"], "answer": 0, "explain": "The return column is separate from the key column — trap 3 gone.", "back": 40}]}
```

```videoquiz
{"video": "6JhbY8Mku1A", "stops": [{"at": 400, "q": "Which match type tells MATCH to find an exact match?", "options": ["1", "0", "-1", "2"], "answer": 1, "explain": "0 = exact, in any order; 1 and −1 need a sorted column."}, {"at": 500, "q": "The reader picks another item in the dropdown. What changes in an INDEX/MATCH report?", "options": ["The formula text", "The MATCH key, so INDEX returns another row", "The lookup range", "Nothing until you press Refresh"], "answer": 1, "explain": "Every formula reads the dropdown cell — Excel's version of a query parameter.", "back": 50}]}
```

```videoquiz
{"video": "4c0CLUER6nw", "stops": [{"at": 110, "q": "XLOOKUP's default match mode is…", "options": ["approximate", "exact", "wildcard", "next larger"], "answer": 1, "explain": "Exact by default — the opposite of VLOOKUP."}, {"at": 170, "q": "What does the if_not_found argument replace?", "options": ["Wrapping the lookup in IFERROR / IFNA", "The return column", "The sort order", "The $ signs"], "answer": 0, "explain": "\"not found\" for an expected miss — and it does not hide #REF! or #VALUE!.", "back": 40}]}
```

```videoquiz
{"video": "HXU7lsd0ftA", "stops": [{"at": 120, "q": "Which three arguments does XLOOKUP need at minimum?", "options": ["lookup value, lookup array, return array", "table, column number, TRUE", "sum range, criteria range, criterion", "value, row, column"], "answer": 0, "explain": "What, where to look, what to bring back."}, {"at": 190, "q": "Can XLOOKUP return a column that sits to the left of the lookup column?", "options": ["No", "Yes — the return array can be anywhere", "Only with match mode −1", "Only in Google Sheets"], "answer": 1, "explain": "Look-left is free in XLOOKUP and INDEX/MATCH."}, {"at": 250, "q": "What is search_mode −1 good for?", "options": ["Searching from the bottom up — the latest payment of a loan", "Sorting descending", "Returning the next smaller value", "Skipping blank cells"], "answer": 0, "explain": "Last occurrence in one formula; match_mode −1 is a different argument (next smaller).", "back": 50}]}
```

```videoquiz
{"video": "2USJsIyIzvo", "stops": [{"at": 175, "q": "What does UNIQUE return?", "options": ["The distinct values, spilled down", "Only the values that appear once", "A count of values", "The first value"], "answer": 0, "explain": "The DISTINCT of Excel — and on a name column it is not a count of people.", "back": 25}, {"at": 270, "q": "A FILTER formula shows #SPILL!. What does that mean?", "options": ["No rows matched", "Something is in the way of the cells it needs", "FILTER does not exist in this Excel", "The condition has the wrong type"], "answer": 1, "explain": "Clear the cells below and to the right; no match shows the if_empty text instead."}, {"at": 295, "q": "How do you combine two FILTER conditions with AND?", "options": ["(a)*(b)", "(a)+(b)", "a AND b", "a; b"], "answer": 0, "explain": "Multiply for AND, add for OR — each condition is a column of 1s and 0s.", "back": 40}]}
```

```videoquiz
{"video": "XHT4paRaY4g", "stops": [{"at": 80, "q": "To colour a whole row by one column's value, the rule's formula is written as…", "options": ["=$M2=\"90+\"", "=$M$2=\"90+\"", "=M2=\"90+\"", "=M$2=\"90+\""], "answer": 0, "explain": "Column pinned, row free: every cell of the row looks at that row's bucket.", "back": 25}, {"at": 103, "q": "Which row should the rule's formula refer to?", "options": ["The first row of the selected range", "The last row", "Any row", "The header row"], "answer": 0, "explain": "Excel writes the rule for the top-left cell and shifts it for the rest.", "back": 25}]}
```

```videoquiz
{"video": "zXnQNytHCPM", "stops": [{"at": 300, "q": "Which conditional format draws a bar inside each cell?", "options": ["Data bars", "Colour scale", "Icon set", "Highlight cell rule"], "answer": 0, "explain": "Data bars: the chart you get for free in a table."}, {"at": 700, "q": "For a quantity like outstanding, which colour scale is safe?", "options": ["Red–green", "Two colours, white → blue", "Rainbow", "Random colours"], "answer": 1, "explain": "Red means bad in a lending file, and red–green fails colour-blind readers."}, {"at": 1100, "q": "Where do you see every rule on the sheet and fix their order?", "options": ["Conditional Formatting → Manage Rules", "Name Manager", "Data Validation", "Format Painter"], "answer": 0, "explain": "One rule per meaning; forty overlapping rules make a slow, unreadable sheet.", "back": 60}]}
```

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

```excel
A2  "Late loans"   B2  =IF(A6="no late loans", 0, COUNTA(INDEX(A6#, , 1)))     count of filtered rows
C2  "Outstanding"  D2  =SUM(INDEX(A6#, , 11))                                   11th column = outstanding
```

   Pick **Tashkent South**: B2 → **59** late loans, D2 → **1 566 587 839** — the outstanding *of the late loans only*. The branch's whole book (`=SUMIFS(tblLoans[outstanding], tblLoans[branch], $B$1)`) is **26 787 392 136**. Put both on the sheet with their labels: Sevara's "the money" means the late money, Bekzod's means the book. The first row is the branch's worst loan — loan 7339 at 902 DPD, written off; 39 of the 59 are 90+, so the live caseload is 20 loans. The `IF` guard matters: with no match, A6 shows `no late loans` and a bare `COUNTA` would say 1.
6. **XLOOKUP — the rate.** `N6` = `=XLOOKUP(INDEX(A6#, , 4), Lookup!$A$3:$A$7, Lookup!$C$3:$C$7)` (column 4 = product) spills one rate per row. No `IFERROR`: every product exists on `Lookup`, and if one day it does not, `#N/A` is the right signal.
7. **Conditional formatting — the colour.** Select the area generously (`A6:N2000`), New Rule → formula `=$M6="90+"` red fill; `=$M6="61-90"` orange; `=$M6="31-60"` yellow; `=$M6="1-30"` pale yellow. Pin the column, free the row.
8. **Check by changing the input.** Pick **Namangan Central**: 35 late loans, 1 060 265 022. The list shrinks, the colours follow the rows, the count changes — nothing to redo.

**Excel ↔ Sheets.** The same sheet in Google Sheets — `FILTER` takes the conditions as separate arguments, `SORT`'s third argument is TRUE/FALSE, and `ARRAYFORMULA` fills the rate column:

```
B1   dropdown  — Data validation → Dropdown (from a range) → Helper!A2:A11, where Helper!A2 = SORT(UNIQUE(Loans!E2:E))
B2   =COUNTA(A6:A)                                            rows in the spill (blank tail ignored by COUNTA)
D2   =SUM(K6:K)                                               outstanding column of the spill
A5   =Loans!A1:M1                                             header row
A6   =SORT(FILTER(Loans!A2:M, Loans!E2:E=B1, Loans!L2:L>0), 12, FALSE)
N6   =ARRAYFORMULA(IF(D6:D="", "", XLOOKUP(D6:D, Lookup!A3:A7, Lookup!C3:C7)))     rate per filtered row
Format → Conditional formatting → Custom formula is  =$M6="90+"  on A6:N
```

`IF(D6:D="", "", …)` keeps the rate column blank below the spill — without it `ARRAYFORMULA` fills 1 000 rows of `#N/A`.

---

## 3. Practice (50 min)

Copy `nur_week4_start.xlsx` to `week-04/day-2/practice.xlsx`. Add columns to `tblLoans` where the task says; otherwise work on a sheet `Practice`, one block per task with the formula as text beside the value. Each question says what goes **in the box**; the box checks it and then shows the formula. The questions follow the order of Learn.

**P1.** *(the lookup problem)* You add a `rate` column to `tblLoans` by looking up `product` on `Lookup!A3:A7`. How many rows does `tblLoans` have afterwards, and why? *In the box: pick the answer.*

```task
{"id": "w04d2-p12", "kind": "choice", "options": ["7 828 — a lookup adds a column, never rows; each loan finds at most one product row", "39 140 — 7 828 loans × 5 products", "5 — one row per product", "Fewer than 7 828 — loans without a match are dropped"], "answer": 0, "explain": "A lookup is a LEFT JOIN that brings one column: every loan stays, each gets the first matching rate (or #N/A). It never multiplies rows, because it returns one match only."}
```

**P2.** *(VLOOKUP)* Add `rate` to `tblLoans` with `VLOOKUP` (exact), then the portfolio's **monthly interest run-rate**: Σ outstanding × rate ÷ 12, one `SUMPRODUCT`. *In the box: the monthly run-rate, in soum.*

```task
{"id": "w04d2-p1", "kind": "number", "answer": 4491202901, "dp": 0, "unit": "UZS a month", "hint": "SUMPRODUCT takes two columns and multiplies them row by row; divide by 12 at the end.", "explain": "=VLOOKUP([@product], Lookup!$A$3:$F$7, 3, FALSE); =SUMPRODUCT(tblLoans[outstanding], tblLoans[rate])/12 → 4 491 202 901 a month (~4.5 bn). BNPL adds 0 (rate 0); SME's 125.9 bn × 26 % / 12 is 2.7 bn of it."}
```

**P3.** *(VLOOKUP's traps)* Show trap 1: the same `VLOOKUP` without `FALSE` for a Micro loan and for a Small business loan. What comes back, and why is one of them *correct by accident*? *In the box: pick the explanation.*

```task
{"id": "w04d2-p2", "kind": "choice", "options": ["VLOOKUP without FALSE always returns #N/A, so the error is easy to spot", "Without FALSE it binary-searches a column it assumes is sorted; ours is in product_id order, so some products get another product's rate or #N/A — and a correct one is correct only because the search happened to stop on its row", "Without FALSE VLOOKUP becomes case-sensitive", "Without FALSE VLOOKUP returns the first row of the table"], "answer": 1, "explain": "Write down what your Excel returned for each of the five products — the exact wrong values depend on where the binary search lands. The point is that there is no error message: a wrong rate flows into the run-rate silently. Put \"VLOOKUP exact only\" in your header, and sort the lookup table anyway."}
```

**P4.** *(INDEX/MATCH — two-way)* A region × product outstanding matrix (`SUMIFS`, yesterday), then a two-way `INDEX/MATCH/MATCH` that returns one cell for a region and a product typed in two input cells. Fergana × Small business loan? *In the box: Fergana × Small business loan, in soum.*

```task
{"id": "w04d2-p5", "kind": "number", "answer": 14734245108, "dp": 0, "unit": "UZS", "explain": "=INDEX($B$3:$F$10, MATCH($I$1, $A$3:$A$10, 0), MATCH($I$2, $B$2:$F$2, 0)) → 14 734 245 108 (95 loans). Same as =SUMIFS(tblLoans[outstanding], tblLoans[region], $I$1, tblLoans[product], $I$2) directly — the matrix + INDEX/MATCH way is for when the matrix is the report and you need one number from it for a title or a tile."}
```

**P5.** *(XLOOKUP — exact, not found)* A lookup cell: type a `loan_id` in B1 and show customer, branch, status, dpd, outstanding with `XLOOKUP` (or `INDEX/MATCH`), `not found` for a missing id. Test with 2167, 1 and 99999. *In the box: the customer of loan 2167, as the sheet shows it.*

```task
{"id": "w04d2-p3", "kind": "text", "answer": ["Dilnoza Abdullaeva"], "model": "=XLOOKUP($B$1, tblLoans[loan_id], tblLoans[customer], \"not found\") and four more with other return columns (or one XLOOKUP returning tblLoans[[customer]:[outstanding]] that spills across). 2167 → Dilnoza Abdullaeva · Tashkent North · written_off · 919 · 0; 1 → Gulbahor Sobirova · Termez Central · active · 0 · 9 593 064; 99999 → not found ×5. INDEX/MATCH: =IFERROR(INDEX(tblLoans[customer], MATCH($B$1, tblLoans[loan_id], 0)), \"not found\")."}
```

**P6.** *(XLOOKUP — approximate match for bands)* Add `lk_bucket` to `tblLoans` by **approximate** lookup against `Lookup!A11:B15` (`XLOOKUP … -1`, or `VLOOKUP … TRUE`, or `INDEX/MATCH(…,1)`); count mismatches against `bucket`, then the five bucket counts. *In the box: the mismatch count.*

```task
{"id": "w04d2-p4", "kind": "number", "answer": 0, "dp": 0, "hint": "Lower edges in the key column → match mode −1 (next smaller).", "explain": "=XLOOKUP([@dpd], Lookup!$A$11:$A$15, Lookup!$B$11:$B$15, , -1) ≡ =VLOOKUP([@dpd], Lookup!$A$11:$B$15, 2, TRUE) ≡ =INDEX(Lookup!$B$11:$B$15, MATCH([@dpd], Lookup!$A$11:$A$15, 1)). Mismatches =SUMPRODUCT(--(tblLoans[lk_bucket]<>tblLoans[bucket])) → 0; counts 7 429 / 124 / 25 / 16 / 234. The approximate match needs dpd_from sorted ascending and the lower edge as the key; an upper-edge table (30, 60, 90) needs match mode 1. A boundary change is now one cell on Lookup, not 7 828 IFS edits."}
```

**P7.** *(XLOOKUP — search from the end)* On `tblPayments`, the amount of the **last** payment row of loan 4567 with `search_mode -1`, and its date. Then check the date with `MAXIFS`. *In the box: the amount of that last payment, in soum.*

```task
{"id": "w04d2-p13", "kind": "number", "answer": 20109500, "dp": 0, "unit": "UZS", "hint": "=XLOOKUP(4567, tblPayments[loan_id], tblPayments[amount], , 0, -1)", "explain": "=XLOOKUP(4567, tblPayments[loan_id], tblPayments[amount], , 0, -1) → 20 109 500; the same with tblPayments[paid_at] → 2026-06-09, and =MAXIFS(tblPayments[paid_at], tblPayments[loan_id], 4567) agrees. Loan 4567 paid three equal instalments (April, May, June) and nothing after — 84 days late on 2026-10-01."}
```

**P8.** *(two-key lookups)* One `XLOOKUP` on `tblInstallments` with a glued key `loan_id&"|"&installment_no`: the `principal_due` of loan 1's 12th instalment. *In the box: that principal_due, in soum.*

```task
{"id": "w04d2-p14", "kind": "number", "answer": 1263474, "dp": 0, "unit": "UZS", "hint": "=XLOOKUP(1&\"|\"&12, tblInstallments[loan_id]&\"|\"&tblInstallments[installment_no], tblInstallments[principal_due])", "explain": "→ 1 263 474, due 2026-03-28. The instalment is always 1 741 700; the principal part grows each month as the interest part shrinks (962 950 in the first). On 92 193 rows a helper key column in tblInstallments is faster than gluing inside the formula."}
```

**P9.** *(IFERROR)* Which of these four uses of `IFERROR` is the right one? *In the box: pick it.*

```task
{"id": "w04d2-p15", "kind": "choice", "options": ["=IFERROR(SUM(tblLoans[outstanding])/B2, 0) where B2 sometimes shows #REF!", "=IFERROR(INDEX(tblLoans[customer], MATCH($B$1, tblLoans[loan_id], 0)), \"not found\") on a lookup cell where people type ids, plus a note that not found means no such loan", "=IFERROR(VLOOKUP([@product], Lookup!$A$3:$F$7, 3, FALSE), 0) in the rate column under a run-rate SUM", "=IFERROR(any formula, \"\") on every cell of the board pack so it looks clean"], "answer": 1, "explain": "A miss is expected (people mistype ids) and the replacement means something. Wrapping a #REF! hides a broken sheet; a 0 rate silently shrinks the run-rate; blanking every error hides every bug."}
```

**P10.** *(a spill · UNIQUE)* `UNIQUE` counts: branches, regions, statuses, products — and `customer`. Which of the five is not a count of anything real, and what would you need to count borrowers? *In the box: pick the one that counts nothing real.*

```task
{"id": "w04d2-p6", "kind": "choice", "options": ["branch", "region", "status", "product", "customer"], "answer": 4, "explain": "=ROWS(UNIQUE(tblLoans[branch])) → 10 · regions 8 · statuses 4 · products 5 · customers 747. The book has 4 335 borrowers but only 747 distinct names; loans_status carries the name, not the id, so you need customer_id (it is in Applications). A lookup or UNIQUE on names is never a people count."}
```

**P11.** *(FILTER · SORTBY)* `FILTER` the active loans in bucket 61-90, sorted by outstanding descending (`SORTBY`): how many, how much, and which one should Sevara visit first? *In the box: the loan_id Sevara visits first.*

```task
{"id": "w04d2-p7", "kind": "number", "answer": 4567, "dp": 0, "explain": "=SORTBY(FILTER(tblLoans, (tblLoans[status]=\"active\")*(tblLoans[bucket]=\"61-90\")), FILTER(tblLoans[outstanding], (tblLoans[status]=\"active\")*(tblLoans[bucket]=\"61-90\")), -1) → 16 rows, Σ outstanding 439 441 377. First row: loan 4567, Auto loan, Tashkent Central, 84 DPD, 301 482 053 — 69 % of the bucket's money in one car loan. Then 2147 (Auto, Tashkent South, 46.6 m) and 4984 (Consumer, Tashkent North, 36.9 m)."}
```

**P12.** *(UNIQUE · SORTBY on spills · which tool when)* Top-5 branches by outstanding with `UNIQUE` + `SUMIFS` on the spill + `SORTBY`, and their combined share of the book. *In the box: the top-5 share, % with 1 decimal.*

```task
{"id": "w04d2-p8", "kind": "number", "answer": 62.8, "dp": 1, "unit": "%", "explain": "A3 =UNIQUE(tblLoans[branch]), B3 =SUMIFS(tblLoans[outstanding], tblLoans[branch], A3#), D3 =SORTBY(A3#, B3#, -1), E3 =SORTBY(B3#, B3#, -1). Tashkent Central 28 716 674 373 · Tashkent South 26 787 392 136 · Tashkent North 26 175 671 562 · Fergana Central 24 797 334 197 · Samarkand Central 24 655 889 676; =SUM(E3:E7)/SUM(B3#) → 62.8 %. A branch total is a group, so it is SUMIFS — not a lookup."}
```

**P13.** *(SEQUENCE)* `SEQUENCE`: the ten first-of-month dates of 2026 in one formula, then `COUNTIFS`/`SUMIFS` per month with the half-open filter using `EDATE`. *In the box: the loan count in the August 2026 row.*

```task
{"id": "w04d2-p9", "kind": "number", "answer": 358, "dp": 0, "unit": "loans", "explain": "A3 =DATE(2026, SEQUENCE(10), 1); B3 =COUNTIFS(tblLoans[disbursed_at], \">=\"&A3, tblLoans[disbursed_at], \"<\"&EDATE(A3, 1)) filled down; C3 the SUMIFS. Jan 287 / 17 452 370 000 … Aug 358 / 22 290 210 000 · Sep 361 / 17 015 490 000 · Oct 21 / 852 760 000; SUM(C3#) = 162 333 060 000. EDATE(d, 1) is DATEADD(month, 1, d)."}
```

**P14.** *(data validation)* Build the branch dropdown in `B1` (source: a spilled `SORT(UNIQUE(…))` on a helper sheet) and a cell `=COUNTIFS(tblLoans[branch], $B$1, tblLoans[dpd], ">0")` under it. Pick Bukhara Central. *In the box: the number of late loans it shows.*

```task
{"id": "w04d2-p16", "kind": "number", "answer": 38, "dp": 0, "unit": "loans", "explain": "Bukhara Central → 38 late loans, 1 079 389 406 of late outstanding out of a 15 116 046 338 book. Tashkent South shows 59, Termez Central 22 — one sheet, ten branches."}
```

**P15.** *(conditional formatting)* Conditional formatting on `Loans`: a formula rule red for 90+, orange 61-90, yellow 31-60; a colour scale on `outstanding`; data bars on `dpd`. Then one cell that says how many rows are red. *In the box: how many rows are red.*

```task
{"id": "w04d2-p10", "kind": "number", "answer": 234, "dp": 0, "unit": "rows", "explain": "Rules on A2:M7829 with =$M2=\"90+\" etc. Red rows: =COUNTIFS(tblLoans[bucket], \"90+\") → 234 — conditional formatting has no count of its own, so the rule and the COUNTIFS share one condition. Colour scale: the largest outstanding glows (586 068 714 — loan 4597, Bukhara, disbursed 2026-09-08). Data bars make 919 the full bar and every active loan a sliver — a scale problem Thursday names."}
```

**P16.** *(reading the errors)* Sevara types `2167` into B1, but the cell was formatted as Text first, and the loan finder shows `#N/A`. What happened? *In the box: pick the cause.*

```task
{"id": "w04d2-p17", "kind": "choice", "options": ["Loan 2167 does not exist", "B1 holds the text \"2167\" and tblLoans[loan_id] holds numbers — text never equals a number in a lookup", "XLOOKUP needs match mode -1", "The Table is filtered"], "answer": 1, "explain": "#N/A = no match, and the first check is the type. Format B1 as General and retype, or look up VALUE($B$1)."}
```

**P17.** *(Excel ↔ Sheets)* Your Excel formula `=SORT(FILTER(tblLoans, (tblLoans[branch]=$B$1)*(tblLoans[dpd]>0)), 12, -1)` must run in Google Sheets on a `Loans` tab. Which is the Sheets version? *In the box: pick it.*

```task
{"id": "w04d2-p18", "kind": "choice", "options": ["=SORT(FILTER(Loans!A2:M, Loans!E2:E=$B$1, Loans!L2:L>0), 12, FALSE)", "=SORT(FILTER(Loans!A2:M, AND(Loans!E2:E=$B$1, Loans!L2:L>0)), 12, -1)", "=SORTBY(FILTER(tblLoans, …), 12)", "=QUERY(tblLoans, 12, FALSE)"], "answer": 0, "explain": "No Tables in Sheets (open-ended ranges instead), conditions as separate arguments, and FALSE for descending."}
```

> 🚀 **Stretch (optional, +5 XP).** **P18.** *(data validation · UNIQUE · COUNTIFS on a spill)* A dropdown for `grade` (A–D) and a spilled table under it: product → loans, loans in 90+, share in 90+ (`0.0%`), all driven by the chosen grade. What is the 90+ share by grade over all products? *In the box: the 90+ share of grade D, % with 1 decimal.*

```task
{"id": "w04d2-p11", "kind": "number", "answer": 10.9, "dp": 1, "unit": "%", "xp": 2, "explain": "UNIQUE(tblLoans[product]) down, COUNTIFS(tblLoans[product], A3#, tblLoans[grade], $B$1), the same with tblLoans[bucket], \"90+\", and the ratio. Over all products: A 0.9 % (17 of 1 821) · B 1.9 % (64 of 3 404) · C 5.1 % (116 of 2 264) · D 10.9 % (37 of 339). Monotonic in the grade — week 2's scorecard check, now a dropdown Nilufar can click."}
```

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

```check
{"id": "w04d2-sc", "questions": [
  {"type": "single", "q": "Someone inserts a new column B on the Lookup sheet. Which rate formula now silently returns the wrong column?", "options": ["=VLOOKUP([@product], Lookup!$A$3:$F$7, 3, FALSE)", "=INDEX(Lookup!$C$3:$C$7, MATCH([@product], Lookup!$A$3:$A$7, 0))", "=XLOOKUP([@product], Lookup!$A$3:$A$7, Lookup!$C$3:$C$7)", "All three"], "answer": 0, "explain": "VLOOKUP's 3 is a count — trap 2. INDEX/MATCH and XLOOKUP point at the column itself, which moves with the insert (→ section 1, VLOOKUP and its four traps)."},
  {"type": "single", "q": "The bucket table has dpd_from 0 / 1 / 31 / 61 / 91. What must be true of that column for XLOOKUP(…, -1) to work?", "options": ["Sorted ascending, lower edges", "Sorted descending", "Any order — XLOOKUP sorts it", "Stored as text"], "answer": 0, "explain": "Match mode −1 takes the largest edge ≤ dpd; with unsorted or text edges it returns a wrong band without an error (→ section 1, XLOOKUP for bands; P6)."},
  {"type": "text", "q": "Which bucket label does this return for dpd = 61?", "code": "=XLOOKUP(61, Lookup!$A$11:$A$15, Lookup!$B$11:$B$15, , -1)", "answer": ["61-90"], "explain": "61 is itself an edge, so the exact match wins: 61-90 (→ section 1, XLOOKUP for bands)."},
  {"type": "single", "q": "Every loan gets =IFERROR(XLOOKUP(…), 0) and a SUM sits under the column. Three keys have a trailing space. What does the total show?", "options": ["#N/A, so you notice", "A total that looks complete but is short by three loans' values", "The right total — IFERROR fixes the key", "An empty cell"], "answer": 1, "explain": "The misses become zeros; count them in a check cell or let #N/A show (→ section 1, IFERROR)."}
]}
```

---

## 6. Company corner <span class="badge company">DPD buckets in Excel</span>

Week 2 computed DPD and buckets in SQL; week 3 put them in a view; today the bucket **table** moves to `Lookup!A10:C15` and the bucket **rule** becomes one approximate lookup — the same separation of definition and data, in Excel.

```
Loans, new column   lk_bucket  =XLOOKUP([@dpd], Lookup!$A$11:$A$15, Lookup!$B$11:$B$15, , -1)
Summary sheet       A3:A7      0 · 1-30 · 31-60 · 61-90 · 90+  (text — '0)
                    B3         =COUNTIFS(tblLoans[lk_bucket], A3)
                    C3         =SUMIFS(tblLoans[outstanding], tblLoans[lk_bucket], A3)
                    D3         =C3/SUM($C$3:$C$7)                    → 0.00%
                    B8, C8     =SUM(B3:B7), =SUM(C3:C7)             → 7 828 · 208 723 504 430
```

| bucket | loans | outstanding | share of outstanding |
|---|---|---|---|
| 0 | **7 429** | 197 486 207 578 | 94.62 % |
| 1-30 | **124** | 4 729 769 899 | 2.27 % |
| 31-60 | **25** | 748 610 049 | 0.36 % |
| 61-90 | **16** | 439 441 377 | 0.21 % |
| 90+ | **234** | 5 319 475 527 | **2.55 %** |

```game
{"type": "build", "id": "w04d2-g5", "title": "Build the lk_bucket formula", "q": "Put the pieces in order: this loan's dpd → its bucket label, from the lower-edge table on Lookup.", "tokens": ["=XLOOKUP(", "[@dpd],", "Lookup!$A$11:$A$15,", "Lookup!$B$11:$B$15,", ", -1)"], "distractors": [", 1)", "[@bucket],", "FALSE)"]}
```

Then two tiles under it: **PAR30** `=SUMIFS(tblLoans[outstanding], tblLoans[dpd], ">30")/C8` → **3.12 %** and **NPL90** `=C7/C8` → **2.55 %** — the same 6 507 526 953 and 5 319 475 527 as week 3's view. Conditional formatting on `Loans`: `=$O2="90+"` (the new `lk_bucket` column — O if P2's `rate` sits in N; use the letter your column has) red — **234** rows light up, and they are exactly the 44 `default` + 190 `written_off` loans (`=COUNTIFS(tblLoans[lk_bucket], "90+", tblLoans[status], "active")` → 0, the status check from week 2, in one cell).

Why the table and not the `IFS`: when Risk moves to 1–7 / 8–30 buckets (the glossary's **[varies]**), you add a row to `Lookup` and every formula, colour and count follows. The `IFS` version is the pasted-DPD-logic problem Timur had last Thursday, one sheet at a time. And why approximate match and not exact: dpd takes 258 different values, from 0 to 919; a band is a *range*, and `match_mode −1` against the lower edges is the Excel spelling of `CASE WHEN dpd <= 30`.

One more check Sevara will ask for: bucket **0** carries 53 m of "overdue" in SQL (the 14 instalments due on the as-of morning) but shows dpd 0 here, as it should — DPD counts *days*, and a payment due today is 0 days late. Put the as-of date (`Lookup!B17`) on the summary sheet; every bucket number is wrong without it.

> 🎯 **Interview version.** *"How would you bucket DPD in Excel?"* — A sorted band table (lower edge, label) on a lookup sheet; `XLOOKUP` with match mode −1 (or `VLOOKUP … TRUE`, `MATCH … 1`) per loan; `COUNTIFS`/`SUMIFS` per bucket with a total that ties to the loan count and the book; conditional formatting from the same column; the as-of date on the sheet. Change a boundary in one cell, never in a formula.

**Say it like in an interview.** Sevara: *"Why build a table on another sheet? Just write the buckets into one IFS formula and be done."* Convince her in 30 words or more.

```task
{"id": "w04d2-cc", "kind": "free", "min": 30, "model": "Because the definition changes and the data does not. With a band table on Lookup and one XLOOKUP with match mode −1, moving to 1–7 / 8–30 buckets is one new row: every formula, colour and count follows. An IFS has the edges typed into it, copied onto every sheet that needs buckets — the pasted-logic problem. And the table can be checked: the counts tie to 7 828 loans and the book to 208.7 bn, with the as-of date on the sheet.", "rubric": ["a boundary change is one cell / one row, not an edit to every formula", "names approximate match on sorted lower edges (match mode −1, VLOOKUP TRUE or MATCH 1)", "mentions a check that ties to a known total (7 828 loans or 208.7 bn)", "mentions the as-of date belonging on the sheet"]}
```

Tomorrow: the detective day — `customers_dirty` and `payments_dirty`, from Find & Replace and Remove Duplicates to a Power Query pipeline that cleans them every time you press Refresh.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w04d2", "pass": 0.8, "questions": [
  {"type": "single", "q": "Lookup!A3:A7 lists the products in product_id order, not alphabetically. What can this return?", "code": "=VLOOKUP(\"Micro loan\", Lookup!$A$3:$F$7, 3)", "options": ["Always Micro's rate — the key is exact", "Another product's rate or #N/A, with no warning", "A #REF! error, always", "The whole row"], "answer": 1, "explain": "Without FALSE, VLOOKUP does an approximate match that assumes a sorted first column; always write FALSE (or 0) for keys (→ section 1, VLOOKUP and its four traps; P3)."},
  {"type": "multi", "q": "Which VLOOKUP traps does XLOOKUP remove?", "options": ["Approximate match by default", "The column number is a count that breaks when a column is inserted", "It can only return values to the right of the key", "A relative range walks when the formula is copied down"], "answer": [0, 1, 2], "explain": "XLOOKUP is exact by default and takes a return column anywhere; you still pin ranges with $ or use a Table (→ section 1, XLOOKUP — exact match)."},
  {"type": "text", "q": "The bucket table has lower edges 0, 1, 31, 61, 91 with labels 0, 1-30, 31-60, 61-90, 90+. Which label does this return for dpd = 45?", "code": "=XLOOKUP(45, Lookup!$A$11:$A$15, Lookup!$B$11:$B$15, , -1)", "answer": ["31-60"], "explain": "Match mode −1 takes the largest lower edge ≤ 45, which is 31 (→ section 1, XLOOKUP for bands; P6)."},
  {"type": "single", "q": "Your band table is keyed on the UPPER edges (0, 30, 60, 90, 9999). Which match mode puts dpd 31 in 31-60?", "options": ["0 — exact", "−1 — exact or next smaller", "1 — exact or next larger", "2 — wildcard"], "answer": 2, "explain": "Upper edges need the next larger edge; −1 on upper edges drops every dpd of 31 into 1-30 (→ Mistakes that cost a point; P6)."},
  {"type": "single", "q": "You select A2:M7829 and add a formula rule to colour 90+ rows red. Which formula is right?", "options": ["=$M$2=\"90+\"", "=$M2=\"90+\"", "=M$2=\"90+\"", "=M2:M7829=\"90+\""], "answer": 1, "explain": "$ on the column, not on the row: every cell of a row looks at that row's bucket; $M$2 colours every row by row 2 (→ section 1, Conditional formatting)."},
  {"type": "single", "q": "=ROWS(UNIQUE(tblLoans[customer])) returns 747, but the book has 4 335 borrowers. Why?", "options": ["UNIQUE drops blanks", "customer is a name, not an id: many borrowers share a name", "The Table is filtered", "UNIQUE stops at 1 000 rows"], "answer": 1, "explain": "Keys are ids; a lookup or distinct count on a name column is never a people count (→ section 1, UNIQUE; P10)."},
  {"type": "single", "q": "When is IFERROR around a lookup the right choice?", "options": ["Always — it keeps the sheet clean", "When a miss is expected, the replacement is meaningful, and a check cell counts the misses", "Whenever you see #REF!", "Around every SUM"], "answer": 1, "explain": "IFERROR(…, 0) under a SUM turns misses into zeros and the total looks complete (→ section 1, IFERROR)."},
  {"type": "single", "q": "Risk moves to 1–7 / 8–30 buckets. Why does the bucket rule live in a sorted table on Lookup, read by an approximate XLOOKUP, rather than in an IFS formula?", "options": ["IFS cannot handle five branches", "You add a row to the table and every formula, colour and count follows — no formula to edit", "XLOOKUP is faster than IFS on 7 828 rows", "IFS does not work in Google Sheets"], "answer": 1, "explain": "Definition and data stay separate: change a boundary in one cell, never in a formula (→ section 6, Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w04d2", "q": "Bekzod's treasury forecast: how much is scheduled to come in during October 2026 (total_due of instalments with due_date from 1 to 31 October 2026) from loans that are active and current (status active and dpd 0 on the Loans sheet)? Bring status and dpd onto the Installments table with a lookup. Answer in soum, whole number.", "type": "number", "dp": 0, "h": ["d8c94773b50e0f0acc7f6fd5"], "hint": "The instalment is the row you sum; the loan's status and dpd travel to it on loan_id.", "sol": "SW4gdGJsSW5zdGFsbG1lbnRzIGFkZCB0d28gY29sdW1uczoKICBzdGF0dXMgID1YTE9PS1VQKFtAbG9hbl9pZF0sIHRibExvYW5zW2xvYW5faWRdLCB0YmxMb2Fuc1tzdGF0dXNdKQogIGRwZCAgICAgPVhMT09LVVAoW0Bsb2FuX2lkXSwgdGJsTG9hbnNbbG9hbl9pZF0sIHRibExvYW5zW2RwZF0pCihJTkRFWC9NQVRDSDogPUlOREVYKHRibExvYW5zW3N0YXR1c10sIE1BVENIKFtAbG9hbl9pZF0sIHRibExvYW5zW2xvYW5faWRdLCAwKSk7IFZMT09LVVAgd2l0aCBGQUxTRSBhbHNvIHdvcmtzLCBsb2FuX2lkIGJlaW5nIHRoZSBmaXJzdCBjb2x1bW4gb2YgdGJsTG9hbnMuKQpUaGVuOgo9U1VNSUZTKHRibEluc3RhbGxtZW50c1t0b3RhbF9kdWVdLCB0YmxJbnN0YWxsbWVudHNbZHVlX2RhdGVdLCAiPj0iJkRBVEUoMjAyNiwxMCwxKSwgdGJsSW5zdGFsbG1lbnRzW2R1ZV9kYXRlXSwgIjwiJkRBVEUoMjAyNiwxMSwxKSwgdGJsSW5zdGFsbG1lbnRzW3N0YXR1c10sICJhY3RpdmUiLCB0YmxJbnN0YWxsbWVudHNbZHBkXSwgMCkK4oaSIDE2IDI0NyA4OTYgMzg5IG9uIDMgMTgwIGluc3RhbG1lbnRzLgpBbGwgT2N0b2JlciBpbnN0YWxtZW50cyB0b2dldGhlciBhcmUgMTcgMTg1IDMxNiAyMDEuIFRoZSBvdGhlciAwLjk0IGJuIHNpdHMgb24gbG9hbnMgYWxyZWFkeSBsYXRlICgwLjU1IGJuIG9uIGFjdGl2ZSBsb2FucyB3aXRoIGRwZCA+IDApLCBkZWZhdWx0ZWQgb3Igd3JpdHRlbiBvZmYgKDAuMzggYm4pLCBwbHVzIGZvdXIgaW5zdGFsbWVudHMgb24gImNsb3NlZCIgbG9hbnMg4oCUIG1vbmV5IGEgZm9yZWNhc3Qgc2hvdWxkIG5vdCBjb3VudCBvbiBhdCBmYWNlIHZhbHVlLiBGb3IgRmluYW5jZTogYWJvdXQgMTYuMiBibiBvZiBjdXJyZW50LWxvYW4gaW5zdGFsbWVudHMgaW4gT2N0b2JlciwgYmVmb3JlIGFueSBuZXcgbGVuZGluZy4="}
```

<!-- challenge:end -->
