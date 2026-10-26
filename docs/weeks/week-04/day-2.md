# Week 4 · Day 2 — Lookups and dynamic arrays: joining in Excel

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge company">Company corner</span>

> STORY **Tuesday, 9:10.** Sevara, head of collections (*руководитель по взысканию*), with yesterday's `Loans` sheet printed and highlighted by hand. *"I did this with a marker for Tashkent South last night. I want the file to do it: **colour every loan by its bucket** — red for 90+, orange, yellow — and give me a **dropdown** at the top where I pick a branch and the sheet shows only that branch's late loans, worst first, with the count and the money. And put the product's interest rate next to each loan; the rate lives on another sheet and I am not retyping it 7 828 times."*

## Today in 3 lines

- A **lookup** is a join: `VLOOKUP` (and its four traps), `INDEX/MATCH`, and `XLOOKUP` — exact match for keys, **approximate match** for buckets and bands, not-found text instead of `#N/A`.
- **Dynamic arrays** — `FILTER`, `UNIQUE`, `SORT`, `SORTBY`, `SEQUENCE` — return many cells from one formula (a *spill*); with a **data-validation dropdown** they make a report the reader drives.
- **Conditional formatting** turns a bucket column into colour; you have built Sevara's sheet and reproduced the bucket counts 7 429 / 124 / 25 / 16 / 234 with an approximate lookup against the `Lookup` table.

---

## 1. Learn — a lookup is a join with one row

### VLOOKUP (*ВПР*) and its four traps

`VLOOKUP(what, where, column_number, [approximate])` finds `what` in the **first column** of `where` and returns the value from the n-th column of the same row. Our `Lookup` sheet has products in `A3:F7` (product, code, annual_rate, min, max, channel):

```
=VLOOKUP([@product], Lookup!$A$3:$F$7, 3, FALSE)        → 0.30 for a Consumer loan
```

It is the most used and most mis-used function in finance. The four traps, each of which has produced a wrong board number somewhere:

1. **The fourth argument defaults to TRUE = approximate match.** `=VLOOKUP("Micro loan", Lookup!A3:F7, 3)` does not return 0.42 — with approximate match Excel assumes the first column is *sorted* and returns the last row that is ≤ the value alphabetically; on our unsorted product list that is a wrong rate with no error. **Always write `FALSE`** (or `0`) for keys.
2. **The column number is a count, not a name.** Insert a column in `Lookup` and every `3` now points at `code`. `INDEX/MATCH` and `XLOOKUP` do not have this problem.
3. **It looks only to the right.** The key must be in the first column of `where`; you cannot return `product` from a `code` unless the table is arranged that way.
4. **A relative range walks.** `Lookup!A3:F7` copied down becomes `A4:F8` and the last row stops matching — yesterday's `$`. Use `$A$3:$F$7`, or better, a Table name.

`HLOOKUP` is the same thing sideways (keys in the first *row*); you will meet it in old files and never need to write it.

### INDEX / MATCH (*ИНДЕКС / ПОИСКПОЗ*) — two functions, no traps 2–3

`MATCH(what, one_column, 0)` returns the **position** of a value in a column (0 = exact). `INDEX(one_column, position)` returns the value at a position. Together they are a lookup that can look left, right, or anywhere:

```
=INDEX(Lookup!$C$3:$C$7, MATCH([@product], Lookup!$A$3:$A$7, 0))      → the rate
=INDEX(Lookup!$A$3:$A$7, MATCH("SME", Lookup!$B$3:$B$7, 0))            → "Small business loan" (looking left)
```

`MATCH`'s third argument is the **match type**: `0` exact (any order); `1` largest value ≤ `what` (column sorted **ascending**) — the bucket case; `−1` smallest value ≥ `what` (sorted descending). A two-way lookup is `INDEX(matrix, MATCH(row_key, row_labels, 0), MATCH(col_key, col_labels, 0))` — picking one cell out of yesterday's region × bucket table.

### XLOOKUP (*ПРОСМОТРX*) — the one to use when you have it

Excel 2021 / Microsoft 365 and Google Sheets: `XLOOKUP(what, lookup_column, return_column, [if_not_found], [match_mode], [search_mode])`.

```
=XLOOKUP([@product], Lookup!$A$3:$A$7, Lookup!$C$3:$C$7)                     exact by default; #N/A if missing
=XLOOKUP(B1, tblLoans[loan_id], tblLoans[customer], "not found")               loan 2167 → Dilnoza Abdullaeva; 99999 → not found
=XLOOKUP([@dpd], Lookup!$A$11:$A$15, Lookup!$B$11:$B$15, , -1)                 approximate: next smaller → the bucket
```

Exact match is the **default** (trap 1 gone); columns are named, not counted (trap 2 gone); the return column can be anywhere (trap 3 gone); `if_not_found` replaces `IFERROR` wrapping. **match_mode** `0` exact · `−1` exact or next *smaller* · `1` exact or next *larger* · `2` wildcard. For a bucket table with the *lower* edge in the key column (`dpd_from` = 0, 1, 31, 61, 91), `−1` is the rule: dpd 45 → the largest `dpd_from` ≤ 45 is 31 → `31-60`. **search_mode** `−1` searches from the bottom — "last payment of this loan" in one formula. In Excel 2016/2019 there is no XLOOKUP; write `INDEX/MATCH` and say so in the header.

### Two-key lookups

A join on two columns. Three ways, best first: (1) **a helper key** — a column `key` = `[@region]&"|"&[@product]` in both tables and an exact lookup on it; (2) `XLOOKUP(key1&"|"&key2, col1&"|"&col2, return)` — concatenate inside the formula (it is an array operation; fine on 7 828 rows, slow on 92 193); (3) `INDEX(return, MATCH(1, (col1=key1)*(col2=key2), 0))` — the classic, which older Excel needs as an array formula (Ctrl+Shift+Enter). When the two keys define a *group* and you want a *sum*, it is not a lookup at all — it is `SUMIFS` with two pairs (yesterday).

### IFERROR (*ЕСЛИОШИБКА*)

`=IFERROR(VLOOKUP(…), "not found")` returns the second value when the first errors. Use it to replace `#N/A` on a legitimate miss — and **never** to hide a `#REF!` or `#VALUE!` you do not understand: an `IFERROR` around a broken formula is a blank cell that looks fine on the board slide. Rule: `IFERROR` only where a miss is *expected* and the replacement is *meaningful* (`0`, `"not found"`, `""`), and count the misses in a check cell.

### Dynamic arrays (*динамические массивы*) — formulas that return a table

Excel 365 / 2021 and Sheets: a formula can return many values; they **spill** into the cells below and to the right, outlined in blue. Refer to the whole spill with `#`: if `A3` spills, `A3#` is all of it. `#SPILL!` means something is in the way — clear the cells.

| Function | Returns | Example |
|---|---|---|
| `UNIQUE(column)` | distinct values (the `DISTINCT` of Excel) | `=UNIQUE(tblLoans[branch])` → 10 rows |
| `FILTER(table, condition, [if_empty])` | the rows where the condition is TRUE (`WHERE`) | `=FILTER(tblLoans, (tblLoans[branch]=$B$1)*(tblLoans[dpd]>0), "none")` |
| `SORT(range, [col], [−1])` | the range sorted by its n-th column, −1 = descending | `=SORT(FILTER(…), 12, -1)` — by dpd (12th column of `tblLoans`) |
| `SORTBY(range, by_range, −1)` | sorted by *another* column | `=SORTBY(A3#, B3#, -1)` — branches by their outstanding |
| `SEQUENCE(n)` | 1, 2, … n down a column | `=DATE(2026, SEQUENCE(10), 1)` → the ten first-of-month dates of 2026 |
| `COUNTA(spill#)`, `SUM(INDEX(spill#, , 11))` | aggregate over the spill | the count and the money of the filtered list |

Conditions inside `FILTER` are multiplied for AND — `(a)*(b)` — and added for OR — `(a)+(b)`; each is a column of TRUE/FALSE turned into 1/0. `UNIQUE` on `tblLoans[customer]` returns **747**, not 4 335: names are not ids — a lookup or a distinct count on a *name* column undercounts people with common names (and overcounts a person spelt two ways, Wednesday).

Older Excel has none of these; the same results come from a pivot (Thursday) or Advanced Filter. **Sheets** has `FILTER`, `UNIQUE`, `SORT`, `SORTN`, `SEQUENCE` natively and spills the same way; the extra tool is **`ARRAYFORMULA(…)`**, which makes any ordinary formula fill a column (`=ARRAYFORMULA(IF(L2:L="", "", IFS(L2:L=0,"0", …)))`) — Sheets' substitute for a Table's calculated column.

### Data validation (*проверка данных*) — the dropdown

Select the cell (`B1`), Data → Data Validation → Allow: **List**, Source: a range. The source must be a range, not a Table column name — point it at a spilled `UNIQUE` on a helper sheet (`=Helper!$A$2#`) or at the typed branch list. Sheets: Data → Data validation → *Dropdown (from a range)*. Every formula on the sheet reads `$B$1`; the reader changes one cell and the report changes. That is the Excel version of a parameter.

### Conditional formatting (*условное форматирование*) — data that colours itself

Home → Conditional Formatting (Sheets: Format → Conditional formatting). Four kinds you will use:

- **Highlight cell rules** — `greater than 90` on the `dpd` column → red fill. Fine for one threshold.
- **Colour scales** — a gradient from min to max on `outstanding`: the eye finds the big loans. Two-colour scale, white → blue; never red-green for a quantity (colour-blind readers, and red means *bad* in a lending file).
- **Data bars** — an in-cell bar proportional to the value, the chart you get for free in a table.
- **Use a formula to determine which cells to format** — the rule you will write most: select `A2:M7829`, formula `=$M2="90+"`, red fill. The `$` on the column and not on the row is the whole trick: every cell in a row looks at *that row's* bucket. Add rules for `"61-90"` (orange), `"31-60"` (yellow), `"1-30"` (light yellow); order them and tick *Stop if true*.

Rules apply to the range you selected when you created them — a Table extends them to new rows, a plain range does not. Manage Rules → *This Worksheet* shows every rule; a sheet with forty overlapping rules is slow and unreadable, so one rule per meaning.

### Which lookup, when

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
| Last occurrence (latest payment of a loan) | `XLOOKUP … , , , -1` (search from the end) or `MAXIFS` on the date | `VLOOKUP` (first match only) |

### Reading the errors

| Error | Means | First check |
|---|---|---|
| `#N/A` | the lookup found nothing | a space or case difference in the key (`"Micro loan "`), a number stored as text (`"2167"` vs 2167 — `VALUE()` one side) |
| `#REF!` | a reference points at deleted cells, or `VLOOKUP`'s column number is bigger than the range | the range width; what was deleted |
| `#VALUE!` | wrong type of argument (text where a number is needed; ranges of different sizes) | `SUMIFS` ranges of equal length; dates as text |
| `#NAME?` | Excel does not know the function (XLOOKUP in Excel 2016) or a name is misspelt | the Excel version; quotes around text |
| `#SPILL!` | a dynamic array has no room | clear the cells below / right of the formula |
| `#DIV/0!` | a share with an empty denominator | an empty group; `IF(den=0, "", num/den)` |

`IFERROR` hides every one of these alike; that is why it is for *expected* misses only.

### Excel ↔ Google Sheets, today's functions

| Excel | Sheets | Note |
|---|---|---|
| `XLOOKUP(what, keys, values, "n/a", -1)` | same | Sheets added XLOOKUP in 2022, same arguments |
| `tblLoans[dpd]` | `Loans!L2:L` | open-ended column; `FILTER` ignores the blank tail only if you filter it out (`Loans!A2:A<>""`) |
| `[@dpd]` in a calculated column | `ARRAYFORMULA(IFS(L2:L=0, "0", …))` in row 2 | one formula fills the column |
| `FILTER(range, (a)*(b))` | `FILTER(range, a, b)` | conditions as separate arguments; `(a)+(b)` for OR works in both |
| `SORT(range, 12, -1)` | `SORT(range, 12, FALSE)` | FALSE = descending |
| `SORTBY(range, by, -1)` | `SORT(range, by, FALSE)` | Sheets' `SORT` takes a range to sort by directly |
| `TAKE(range, 5)` | `SORTN(range, 5, 0, by, FALSE)` | top-n in one function in Sheets |
| Data Validation → List | Data validation → Dropdown (from a range) | same idea; Sheets colours chips |
| Conditional Formatting → formula rule | Format → Conditional formatting → Custom formula is | same `$M2="90+"` form |

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ VLOOKUP and its traps (exact match FALSE, locking the table, no look-left, IFNA/IFERROR) — [The Only VLOOKUP Guide You'll Ever Need (Leila Gharani), 03:46](https://youtu.be/TDphx23AtqM?t=226)
- ▶ INDEX / MATCH — [How to use Excel Index Match (the right way) (Leila Gharani), 06:37](https://youtu.be/F264FpBDX28?t=397)
- ▶ INDEX / MATCH (alternative, longer, with a drop-down example) — [INDEX MATCH Excel Tutorial (Kevin Stratvert), 05:36](https://youtu.be/6JhbY8Mku1A?t=336)
- ▶ XLOOKUP — [How to Use XLOOKUP in Excel (5 Practical Examples) (Leila Gharani), 01:12](https://youtu.be/4c0CLUER6nw?t=72)
- ▶ XLOOKUP (second option) — [XLOOKUP in Excel Tutorial (Kevin Stratvert), 01:13](https://youtu.be/HXU7lsd0ftA?t=73)
- ▶ UNIQUE — [Excel Dynamic Arrays (How they will change EVERYTHING!) (Leila Gharani), 02:33](https://youtu.be/2USJsIyIzvo?t=153)
- ▶ FILTER — [Excel Dynamic Arrays (How they will change EVERYTHING!) (Leila Gharani), 04:06](https://youtu.be/2USJsIyIzvo?t=246)
- ▶ Conditional formatting (formula rule) — [Excel Conditional Formatting with Formula | Highlight Rows based on a cell value (Leila Gharani), 01:03](https://youtu.be/XHT4paRaY4g?t=63)
- ▶ Conditional formatting (basics) — [Learn Excel in Under 3 Hours | Pivot Tables, Lookups, Data Cleaning (Alex The Analyst), 00:37](https://youtu.be/zXnQNytHCPM?t=37)

- RU workbook `3.2 Lookups.xlsx` — sheets *VLOOKUP – Exact Match*, *VLOOKUP – Approx Match* (the grade table, the "lookup table should be sorted" note), *MATCH* (the three match types), *INDEX*, *Xlookup*; and *Cell Referrence* for the `$` multiplication table.
- *Russian terms:* ВПР = VLOOKUP, ПОИСКПОЗ = MATCH, ИНДЕКС = INDEX, ПРОСМОТРX = XLOOKUP, точное / приближённое совпадение = exact / approximate match, проверка данных = data validation, условное форматирование = conditional formatting, выпадающий список = dropdown.

---

## 2. Worked example — Sevara's sheet (15 min)

Sheet `Collections`. Grain of the main block: one row per **delinquent loan of the chosen branch**.

```
A1  "Branch:"      B1  dropdown — Data Validation, List, source = Helper!$A$2#  where Helper!A2 = SORT(UNIQUE(tblLoans[branch]))
A2  "Late loans"   B2  =COUNTA(INDEX(A6#, , 1))            count of filtered rows (first column of the spill)
C2  "Outstanding"  D2  =SUM(INDEX(A6#, , 11))              11th column of tblLoans = outstanding
A5  =tblLoans[#Headers]                                     the header row, spilled
A6  =SORT(FILTER(tblLoans, (tblLoans[branch]=$B$1)*(tblLoans[dpd]>0), "no late loans"), 12, -1)
```

Pick **Tashkent South**: B2 → **59** late loans, D2 → **1 566 587 839** — the spill's 11th column summed is the outstanding *of the late loans only*; the branch's whole book (`=SUMIFS(tblLoans[outstanding], tblLoans[branch], $B$1)`) is **26 787 392 136**. Put both on the sheet with their labels, because Sevara's "the money" means the late money and Bekzod's means the book. The first row of the spill is the branch's worst loan (highest dpd — loan 7339 at 902 DPD, written off), as a `SORT(…, 12, -1)` on column 12 = `dpd`; 39 of the 59 are 90+, so the live caseload is 20 loans.

Then a column `rate` next to the spill — `=XLOOKUP(INDEX(A6#, , 4), Lookup!$A$3:$A$7, Lookup!$C$3:$C$7)` (column 4 = product) — spills a rate per filtered row; `IFERROR` is not needed: every product exists in `Lookup`, and if one day it does not, `#N/A` is the right signal.

Colour: select the spill area generously (`A6:N2000`), Conditional Formatting → New Rule → formula `=$M6="90+"` red fill; `=$M6="61-90"` orange; `=$M6="31-60"` yellow; `=$M6="1-30"` pale yellow. Change the dropdown to **Namangan Central**: 35 late loans, 1 060 265 022 — the list shrinks, the colours follow the rows, the count changes, nothing to redo. Check: with the dropdown empty or set to a branch with no late loans, A6 shows `no late loans` and B2 shows 1 (it counts the message) — guard it: `=IF(A6="no late loans", 0, COUNTA(INDEX(A6#, , 1)))`.

Sheets: the same with `=SORT(FILTER(Loans!A2:M, Loans!E2:E=B1, Loans!L2:L>0), 12, FALSE)` — `FILTER` takes conditions as separate arguments, `SORT`'s third argument is TRUE/FALSE for ascending — and a *Dropdown (from a range)*. The whole sheet in Sheets:

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

Copy `nur_week4_start.xlsx` to `week-04/day-2/practice.xlsx`. Add columns to `tblLoans` where the task says; otherwise work on a sheet `Practice`, one block per task with the formula as text beside the value.

**P1.** Add `rate` to `tblLoans` with `VLOOKUP` (exact), then the portfolio's **monthly interest run-rate**: Σ outstanding × rate ÷ 12, one `SUMPRODUCT`.

<details><summary>Answer</summary>
`=VLOOKUP([@product], Lookup!$A$3:$F$7, 3, FALSE)`; `=SUMPRODUCT(tblLoans[outstanding], tblLoans[rate])/12` → **4 491 202 901** a month (~4.5 bn). BNPL contributes 0 (rate 0); SME 125.9 bn × 26 % / 12 is 2.7 bn of it.
</details>

**P2.** Show trap 1: the same `VLOOKUP` without `FALSE` for a Micro loan and for a Small business loan. What comes back, and why is one of them *correct by accident*?

<details><summary>Answer</summary>
Approximate match assumes the key column is sorted ascending and does a binary search for the last row ≤ the key. Our product column is in `product_id` order (Micro, Consumer, BNPL, Auto, SME), not alphabetical, so the search jumps to the wrong half of the list: some products return another product's rate, some return `#N/A`, and which is which depends on where the binary search lands — write down what *your* Excel returned for each of the five. The one that comes back right is right by accident (the search happened to stop on its row). The point is not the particular wrong value; it is that **there is no error message** — a wrong rate flows into the interest run-rate silently. Add the sentence to your header: "VLOOKUP exact only"; sort the lookup table anyway.
</details>

**P3.** A lookup cell: type a `loan_id` in B1 and show customer, branch, status, dpd, outstanding with `XLOOKUP` (or `INDEX/MATCH`), `not found` for a missing id. Test with 2167, 1 and 99999.

<details><summary>Answer</summary>
`=XLOOKUP($B$1, tblLoans[loan_id], tblLoans[customer], "not found")` and four more with other return columns (or one `XLOOKUP` returning `tblLoans[[customer]:[outstanding]]` that spills across). 2167 → Dilnoza Abdullaeva · Tashkent North · written_off · 919 · 0; 1 → Gulbahor Sobirova · Termez Central · active · 0 · 9 593 064; 99999 → not found ×5. `INDEX/MATCH` version: `=IFERROR(INDEX(tblLoans[customer], MATCH($B$1, tblLoans[loan_id], 0)), "not found")`.
</details>

**P4.** Add `lk_bucket` to `tblLoans` by **approximate** lookup against `Lookup!A11:B15` (`XLOOKUP … -1`, or `VLOOKUP … TRUE`, or `INDEX/MATCH(…,1)`); count mismatches against `bucket`, then the five bucket counts.

<details><summary>Answer</summary>
`=XLOOKUP([@dpd], Lookup!$A$11:$A$15, Lookup!$B$11:$B$15, , -1)` ≡ `=VLOOKUP([@dpd], Lookup!$A$11:$B$15, 2, TRUE)` ≡ `=INDEX(Lookup!$B$11:$B$15, MATCH([@dpd], Lookup!$A$11:$A$15, 1))`. Mismatches `=SUMPRODUCT(--(tblLoans[lk_bucket]<>tblLoans[bucket]))` → **0**; `COUNTIFS(tblLoans[lk_bucket], "0")` … → **7 429 / 124 / 25 / 16 / 234**. The approximate match needs `dpd_from` sorted ascending (it is) and the *lower* edge as the key; a table keyed on the upper edge (30, 60, 90) needs `match_mode 1` instead. Changing a bucket boundary is now a one-cell edit on `Lookup`, not 7 828 `IFS` edits — the reason bands live in a table.
</details>

**P5.** A region × product outstanding matrix (`SUMIFS`, yesterday), then a two-way `INDEX/MATCH/MATCH` that returns one cell for a region and a product typed in two input cells. Fergana × Small business loan?

<details><summary>Answer</summary>
`=INDEX($B$3:$F$10, MATCH($I$1, $A$3:$A$10, 0), MATCH($I$2, $B$2:$F$2, 0))` → **14 734 245 108** (95 loans). Same as `=SUMIFS(tblLoans[outstanding], tblLoans[region], $I$1, tblLoans[product], $I$2)` directly — the matrix + `INDEX/MATCH` way is for when the matrix *is* the report and you need one number pulled from it for a title or a tile.
</details>

**P6.** `UNIQUE` counts: branches, regions, statuses, products — and `customer`. Which of the five is not a count of anything real, and what would you need to count borrowers?

<details><summary>Answer</summary>
`=ROWS(UNIQUE(tblLoans[branch]))` → 10 · regions 8 · statuses 4 · products 5 · customers **747**. The data has 4 335 borrowers (week 3 S4) but only 747 distinct *names*; `loans_status.csv` carries the name, not the id, so you cannot count borrowers from it — you would need `customer_id` (it is in `Applications`). A lookup or a `UNIQUE` on names is never a people count.
</details>

**P7.** `FILTER` the active loans in bucket 61-90, sorted by outstanding descending (`SORTBY`): how many, how much, and which one should Sevara visit first?

<details><summary>Answer</summary>
`=SORTBY(FILTER(tblLoans, (tblLoans[status]="active")*(tblLoans[bucket]="61-90")), FILTER(tblLoans[outstanding], (tblLoans[status]="active")*(tblLoans[bucket]="61-90")), -1)` → **16** rows, Σ outstanding **439 441 377**. First row: loan **4567**, Auto loan, Tashkent Central, 84 DPD, 301 482 053 outstanding — 69 % of the bucket's money in one car loan. Then 2147 (Auto, Tashkent South, 46.6 m) and 4984 (Consumer, Tashkent North, 36.9 m). `(tblLoans[status]="active")` changes nothing here (all 16 are active) but is the honest filter.
</details>

**P8.** Top-5 branches by outstanding with `UNIQUE` + `SUMIFS` on the spill + `SORTBY`, and their combined share of the book.

<details><summary>Answer</summary>
`A3 =UNIQUE(tblLoans[branch])`, `B3 =SUMIFS(tblLoans[outstanding], tblLoans[branch], A3#)` (spills alongside), `D3 =SORTBY(A3#, B3#, -1)`, `E3 =SORTBY(B3#, B3#, -1)`. Tashkent Central 28 716 674 373 · Tashkent South 26 787 392 136 · Tashkent North 26 175 671 562 · Fergana Central 24 797 334 197 · Samarkand Central 24 655 889 676; `=SUM(E3:E7)/SUM(B3#)` → **62.8 %**. Older Excel / no spill: a pivot sorted descending with a Top 10 filter (Thursday).
</details>

**P9.** `SEQUENCE`: the ten first-of-month dates of 2026 in one formula, then `COUNTIFS`/`SUMIFS` per month with the half-open filter using `EDATE`.

<details><summary>Answer</summary>
`A3 =DATE(2026, SEQUENCE(10), 1)`; `B3 =COUNTIFS(tblLoans[disbursed_at], ">="&A3, tblLoans[disbursed_at], "<"&EDATE(A3, 1))` filled down (or `A3#` inside for a spilling version); `C3` the `SUMIFS`. Jan 287 / 17 452 370 000 … Aug 358 / 22 290 210 000 · Sep 361 / 17 015 490 000 · Oct 21 / 852 760 000; `SUM(C3#)` = 162 333 060 000. `EDATE(d, 1)` is `DATEADD(month, 1, d)`; the half-open pair works for 28- and 31-day months alike.
</details>

**P10.** Conditional formatting on `Loans`: a formula rule red for 90+, orange 61-90, yellow 31-60; a colour scale on `outstanding`; data bars on `dpd`. Then one cell that says how many rows are red.

<details><summary>Answer</summary>
Rules on `A2:M7829` with `=$M2="90+"` etc. (Table rows extend them). Red rows `=COUNTIFS(tblLoans[bucket], "90+")` → **234** — conditional formatting has no count of its own; the rule and the `COUNTIFS` share the condition, so write the condition once in a cell and point both at it when you can. Colour scale: the 2026 SME loans glow (586 068 714 is the largest outstanding — loan 4597, Bukhara, disbursed 2026-09-08). Data bars make 919 the full bar and everything active a sliver — a scale problem Thursday's chart chapter names.
</details>

<span class="badge stretch">Stretch</span> **P11.** A dropdown for `grade` (A–D) and a spilled table under it: product → loans, loans in 90+, share in 90+ (`0.0%`), all driven by the chosen grade. What is the 90+ share by grade over all products?

<details><summary>Answer</summary>
`UNIQUE(tblLoans[product])` down, `COUNTIFS(tblLoans[product], A3#, tblLoans[grade], $B$1)`, same with `tblLoans[bucket], "90+"`, and the ratio. Over all products: A **0.9 %** (17 of 1 821) · B 1.9 % (64 of 3 404) · C 5.1 % (116 of 2 264) · D 10.9 % (37 of 339). Monotonic in the grade — week 2's scorecard check, now a dropdown Nilufar can click. Sheets: the same with `ARRAYFORMULA(COUNTIFS(…))`.
</details>

### Mistakes that cost a point this week

- `VLOOKUP` without `FALSE` — a wrong rate with no error (P2).
- A lookup on `customer` (a name) to fetch anything — 747 names for 4 335 people; keys are ids.
- Bucket table keyed on the upper edge (30, 60, 90) with match mode −1 — every dpd of 31 lands in `1-30`. Lower edges with −1, or upper edges with 1.
- `IFERROR(…, 0)` around a lookup and a `SUM` under it — the misses become zeros and the total looks complete.
- A data-validation list pointing at a Table column by name — Excel refuses; point it at a spilled `UNIQUE` range or a plain list.
- Conditional-formatting formula with `$M$2` (both pinned) — every row is coloured by row 2's bucket.
- `FILTER` on a Table but `SORT` by the wrong column number — count the columns from the Table's first column, not from A.
- A spill inside a Table — Tables cannot hold spilled arrays; put `FILTER`/`UNIQUE` on a plain sheet.

---

## 4. Homework

No new homework. **HW 4.1** (yesterday's functions pack) is due tomorrow — add to it, if you like, the `lk_bucket` column from P4 as proof that the bucket table on `Lookup` reproduces the shipped buckets.

---

## 5. Self-check

1. Name the four VLOOKUP traps and say which of them XLOOKUP removes. *(→ section 1, "VLOOKUP", "XLOOKUP")*
2. A bucket table with `dpd_from` 0 / 1 / 31 / 61 / 91: which XLOOKUP match mode, and what must be true of the key column? *(→ section 1, "XLOOKUP", P4)*
3. Why is `IFERROR(…, "")` around a lookup dangerous, and when is it right? *(→ section 1, "IFERROR")*

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

Then two tiles under it: **PAR30** `=SUMIFS(tblLoans[outstanding], tblLoans[dpd], ">30")/C8` → **3.12 %** and **NPL90** `=C7/C8` → **2.55 %** — the same 6 507 526 953 and 5 319 475 527 as week 3's view. Conditional formatting on `Loans`: `=$O2="90+"` (the new `lk_bucket` column — O if P1's `rate` sits in N; use the letter your column has) red — **234** rows light up, and they are exactly the 44 `default` + 190 `written_off` loans (`=COUNTIFS(tblLoans[lk_bucket], "90+", tblLoans[status], "active")` → 0, the status check from week 2, in one cell).

Why the table and not the `IFS`: when Risk moves to 1–7 / 8–30 buckets (the glossary's **[varies]**), you add a row to `Lookup` and every formula, colour and count follows. The `IFS` version is the pasted-DPD-logic problem Timur had last Thursday, one sheet at a time. And why approximate match and not exact: dpd takes 900 different values; a band is a *range*, and `match_mode −1` against the lower edges is the Excel spelling of `CASE WHEN dpd <= 30`.

One more check Sevara will ask for: bucket **0** carries 53 m of "overdue" in SQL (the 14 instalments due on the as-of morning) but shows dpd 0 here, as it should — DPD counts *days*, and a payment due today is 0 days late. Put the as-of date (`Lookup!B17`) on the summary sheet; every bucket number is wrong without it.

> Interview version: *"How would you bucket DPD in Excel?"* — A sorted band table (lower edge, label) on a lookup sheet; `XLOOKUP` with match mode −1 (or `VLOOKUP … TRUE`, `MATCH … 1`) per loan; `COUNTIFS`/`SUMIFS` per bucket with a total that ties to the loan count and the book; conditional formatting from the same column; the as-of date on the sheet. Change a boundary in one cell, never in a formula.

Tomorrow: the detective day — `customers_dirty` and `payments_dirty`, from Find & Replace and Remove Duplicates to a Power Query pipeline that cleans them every time you press Refresh.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w04d2", "pass": 0.8, "questions": [
  {"type": "single", "q": "Lookup!A3:A7 lists the products in product_id order, not alphabetically. What can this return?", "code": "=VLOOKUP(\"Micro loan\", Lookup!$A$3:$F$7, 3)", "options": ["Always Micro's rate — the key is exact", "Another product's rate or #N/A, with no warning", "A #REF! error, always", "The whole row"], "answer": 1, "explain": "Without FALSE, VLOOKUP does an approximate match that assumes a sorted first column; always write FALSE (or 0) for keys (→ section 1, VLOOKUP and its four traps; P2)."},
  {"type": "multi", "q": "Which VLOOKUP traps does XLOOKUP remove?", "options": ["Approximate match by default", "The column number is a count that breaks when a column is inserted", "It can only return values to the right of the key", "A relative range walks when the formula is copied down"], "answer": [0, 1, 2], "explain": "XLOOKUP is exact by default and takes a return column anywhere; you still pin ranges with $ or use a Table (→ section 1, XLOOKUP)."},
  {"type": "text", "q": "The bucket table has lower edges 0, 1, 31, 61, 91 with labels 0, 1-30, 31-60, 61-90, 90+. Which label does this return for dpd = 45?", "code": "=XLOOKUP(45, Lookup!$A$11:$A$15, Lookup!$B$11:$B$15, , -1)", "answer": ["31-60"], "explain": "Match mode −1 takes the largest lower edge ≤ 45, which is 31 (→ section 1, XLOOKUP; P4)."},
  {"type": "single", "q": "Your band table is keyed on the UPPER edges (0, 30, 60, 90, 9999). Which match mode puts dpd 31 in 31-60?", "options": ["0 — exact", "−1 — exact or next smaller", "1 — exact or next larger", "2 — wildcard"], "answer": 2, "explain": "Upper edges need the next larger edge; −1 on upper edges drops every dpd of 31 into 1-30 (→ Mistakes that cost a point; P4)."},
  {"type": "single", "q": "You select A2:M7829 and add a formula rule to colour 90+ rows red. Which formula is right?", "options": ["=$M$2=\"90+\"", "=$M2=\"90+\"", "=M$2=\"90+\"", "=M2:M7829=\"90+\""], "answer": 1, "explain": "$ on the column, not on the row: every cell of a row looks at that row's bucket; $M$2 colours every row by row 2 (→ section 1, Conditional formatting)."},
  {"type": "single", "q": "=ROWS(UNIQUE(tblLoans[customer])) returns 747, but the book has 4 335 borrowers. Why?", "options": ["UNIQUE drops blanks", "customer is a name, not an id: many borrowers share a name", "The Table is filtered", "UNIQUE stops at 1 000 rows"], "answer": 1, "explain": "Keys are ids; a lookup or distinct count on a name column is never a people count (→ section 1, Dynamic arrays; P6)."},
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
