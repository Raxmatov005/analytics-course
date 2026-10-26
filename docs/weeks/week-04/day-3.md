# Week 4 · Day 3 — Cleaning dirty data: Find & Replace to Power Query

<span class="badge">Learn 60 min</span> <span class="badge">Detective 40 min</span> <span class="badge">Practice 45 min</span> <span class="badge">Homework</span> <span class="badge company">Company corner</span>

> STORY **Wednesday, 9:05.** Nilufar, risk (*риск-аналитик*), with two printouts. *"My age-band table for the scorecard has a customer aged **−5** and one aged **126**. HR says we have 6 000 customers, my sheet says 6 040 — the same forty we argued about in week 1, and they are still there. And Timur's payments tile is tens of millions above Finance's. I get `customers_dirty.csv` and `payments_dirty.csv` from the export every Monday; I need them **clean every Monday**, not once by hand."* Timur, passing: *"If you build it in Power Query I can refresh it. If you build it with the mouse I cannot."*

## Today in 3 lines

- **By hand first**, so you know what the tools do: `TRIM`/`CLEAN`/`PROPER`, Find & Replace, Text to Columns, `DATEVALUE` for dates stored as text, `COUNTIFS` to *find* duplicates, and why **Remove Duplicates** is dangerous (exact match only — and it still lies both ways).
- **Then Power Query** (*Get & Transform*): import the CSV, promote headers, set types, trim / clean / lowercase, replace values, remove duplicates, group by, **merge** (= a join), append, load — and **Refresh** does it all again next Monday.
- You have found the four kinds of problem hiding in the export — duplicate people, impossible birth dates, duplicate payments, inconsistent `method` spellings — and you can say exactly how many of each there are (the counts are in the folds; do not peek before you have your own).

---

## 1. Learn — cleaning is a pipeline, even when it is a formula

### The cleaning rule from week 1, again

Never clean the only copy. In SQL you cleaned *on the way out* (a view); in Excel the equivalent is a **clean sheet built from the raw sheet** by formulas or a query — the raw sheet stays as evidence, and the cleaning is re-runnable. Anything you do with the mouse on the raw data (Find & Replace, Remove Duplicates, Text to Columns, Flash Fill) is a one-time edit: fine for a look, wrong for a Monday file. Today's structure: hand tools to *discover*, Power Query to *deliver*.

### Text repair — TRIM, CLEAN, PROPER, SUBSTITUTE

```
=TRIM(B2)                          "Bobur "  → "Bobur"        (also collapses doubled inner spaces)
=CLEAN(B2)                         removes non-printing characters (line breaks, tabs from a copy-paste)
=PROPER(TRIM(C2))                  "jalilova" → "Jalilova";  "MALIKA" → "Malika"
=LOWER(TRIM(F2))                   "CASH "  → "cash";  "PayMe" → "payme"
=SUBSTITUTE(LOWER(TRIM(F2)), "bank transfer", "transfer")      week 2's expression, Excel spelling
=TRIM(CLEAN(SUBSTITUTE(x, CHAR(160), " ")))                     the full armour: non-breaking spaces (CHAR 160) survive TRIM
```

`PROPER` capitalises after every non-letter — `"o'neil"` → `"O'Neil"` but also `"payme"` → `"Payme"` and `"bnpl"` → `"Bnpl"` — so it is for *names*, not for codes. A **normalised key** for matching people is lower-case, trimmed, concatenated with a separator: `=LOWER(TRIM(B2))&"|"&LOWER(TRIM(C2))&"|"&TEXT(E2,"yyyy-mm-dd")`. The separator matters: without it `"Ali"&"Nazarov"` and `"Alin"&"azarov"` collide.

### Find & Replace (*найти и заменить*) — Ctrl+H

Ctrl+H, *Find what* `bank transfer`, *Replace with* `transfer`, **Options**: *Match case*, *Match entire cell contents*, scope *Sheet* or *Workbook*. Replace All reports how many — write the count down. Three cautions: it also edits formulas that contain the text; without *Match entire cell contents* a search for `card` edits `discard`; and it is not recorded anywhere — write the count in your change log by hand. Wildcards: `*` any text, `?` one character, `~*` a literal asterisk. Find & Replace on `" "` (a space) with nothing is **not** TRIM — it removes the spaces inside names too.

### Text to Columns (*текст по столбцам*) and Flash Fill

Data → Text to Columns: split one column by a delimiter (space, comma, `|`) or at fixed widths. `applied_at` = `2026-09-30 21:36:00` → a date and a time in two columns, each with a type you choose on step 3 (set the date column to **YMD** or Excel reads `2026-09-30` wrong in some locales). **Flash Fill** (Ctrl+E): type the result you want in the first cell (`Jalilova` next to `jalilova`), press Ctrl+E, Excel infers the pattern for the column — handy for a look, not reproducible (no formula is left behind; the next file does not get it). Sheets: Data → Split text to columns; no Flash Fill (use `SPLIT()`).

### Dates stored as text (*даты в текстовом формате*)

A date that is text is left-aligned, does not sort as a date, and `">="&DATE(…)` never matches it. Our CSVs carry `2026-09-30` as text; Excel converts it on open in most locales, Sheets usually too, Power Query always asks. If a column is text: `=DATEVALUE(E2)` turns `"1981-08-15"` into the date number 29 812 (format the cell as a date to see it); `=VALUE(E2)` does the same; Text to Columns with type *Date YMD* converts a whole column in place. Test with `=ISTEXT(E2)` / `=ISNUMBER(E2)`. The trap the other way: `14/03/2026` in a US locale becomes text (there is no 14th month) while `03/04/2026` becomes 4 March — half a column converts and half does not. ISO `yyyy-mm-dd` is the only safe exchange format; insist on it from whoever exports.

### Finding duplicates before removing them — COUNTIFS on a key

```
L2  key      =LOWER(TRIM(B2))&"|"&LOWER(TRIM(C2))&"|"&TEXT(E2,"yyyy-mm-dd")
M2  n        =COUNTIFS($L$2:$L$6041, L2)                 how many rows share this key
N2  rank     =COUNTIFS($L$2:L2, L2)                       1 for the first occurrence, 2 for the repeat  — ROW_NUMBER()
```

Filter `n > 1` to see the groups and `rank = 2` for the "extra" rows, then compare the count with week 1's 40 duplicates — if they differ, read the extra pairs before you decide anything (Detective step 2). Build a second key on `phone|birth_date` and a third on `phone` alone and compare the three counts. Every key has false positives; the `rank` column is the Excel `ROW_NUMBER() OVER (PARTITION BY key ORDER BY row)` and lets you *look* before you delete. The `$L$2:L2` growing range is slow on 50 000 rows — Power Query below does the same in a second.

### Remove Duplicates (*удалить дубликаты*) — and why it lies

Data → Remove Duplicates, tick the columns that define sameness, OK; Excel reports *n duplicate values removed*. It compares the ticked columns **exactly as displayed**, case-**in**sensitively, space-**sensitively**, and keeps the **first** row. Three runs on `Customers` show the problem:

| Columns ticked | What can happen |
|---|---|
| first_name, last_name, birth_date (raw) | case is ignored, spaces are not: a duplicate whose name ends in a space survives |
| the same after TRIM | every true duplicate goes — **and so does any pair of different people** who share a name and a birth date |
| phone, birth_date | the identifying key, the one nobody ticks first — compare its count with week 1's |

So it under-removes on raw text and over-removes on a loose key, says nothing about *which* rows went, and leaves no formula. On `Payments`: tick `installment_id`, `paid_at`, `amount` and compare the count with week 3's duplicate payments; tick all columns and nothing goes (the `payment_id` differs). Use it to *check a number* on a copy; deliver the result with Power Query, where the step is recorded and re-runs.

### Power Query (*Get & Transform*) — the recorded pipeline

Data → **Get Data** → From File → From Text/CSV (Sheets has no Power Query; see below). The editor opens: a preview, the **Applied Steps** pane on the right — every click becomes a step, in order, re-run on Refresh. The steps you will use:

| Step | Where | Equivalent |
|---|---|---|
| **Source** / **Promoted Headers** | automatic; Home → Use First Row as Headers if not | reading the CSV |
| **Changed Type** | click the icon in each header: Whole Number, Decimal, Date, Text | `CAST`; set `paid_at` to Date, amounts to Whole Number, ids to Whole Number, phone to **Text** |
| **Trim / Clean / lowercase / Capitalize Each Word** | Transform → Format | `TRIM`, `CLEAN`, `LOWER`, `PROPER` |
| **Replace Values** | Transform → Replace Values (`bank transfer` → `transfer`; tick *Match entire cell contents*) | `REPLACE`, `SUBSTITUTE` |
| **Remove Duplicates** | select the key columns → Home → Remove Rows → Remove Duplicates | `ROW_NUMBER … WHERE rn = 1` (keeps the first) |
| **Filter Rows** | the header arrow → Date Filters → Before… | `WHERE paid_at <= '2026-10-01'` |
| **Add Column → Custom / Conditional / Date → Month → Start of Month** | | a calculated column, `CASE`, `date(d, 'start of month')` |
| **Group By** | Transform → Group By; one or more keys, aggregations Sum / Count / Min / Max | `GROUP BY` |
| **Merge Queries** | Home → Merge Queries; pick the two tables, click the key columns, choose the **Join Kind** | `JOIN`: Left Outer / Right Outer / Full Outer / Inner / Left Anti / Right Anti — week 2's whole chapter in a dropdown |
| **Append Queries** | Home → Append | `UNION ALL` |
| **Close & Load To…** | Table on a new sheet / Only Create Connection / Add to Data Model | `CREATE VIEW` (connection only) or `CREATE TABLE AS` (loaded) |

Each step has a line of **M** (the query language) in the formula bar — `= Table.Distinct(#"Lowercased Text", {"installment_id", "paid_at", "amount"})`. You do not need to write M; you need to read it enough to see what a step does. Right-click a step → *Rename* so the pane reads like a change log: `Trim method`, `Lowercase method`, `bank transfer → transfer`, `Drop 25 duplicates`. **Refresh All** (Data → Refresh All, Ctrl+Alt+F5) re-reads the CSV from the path in *Source* and re-runs every step — change the path once (Data Source Settings) when the file moves.

Two habits. **Count at every step**: the status bar shows the row count of the preview; for the real count, a Group By step with *Count Rows* on a duplicate of the query, or load and `=ROWS(tbl)`. **Types before text transforms**: a `Trim` on a column typed as number does nothing, a Date filter on a text column fails.

### Google Sheets: formulas, the Remove duplicates tool, and QUERY

Sheets has no Power Query. The reproducible way is a **clean tab built by formulas** from the raw tab: `=ARRAYFORMULA(TRIM(Raw!B2:B))`, `PROPER`, `SUBSTITUTE`, and a `UNIQUE` over the key columns to deduplicate. Data → Data cleanup → **Remove duplicates** and **Trim whitespace** are the one-time tools, same caveats as Excel's. Then **`QUERY`** — the SQL you already speak, as a function:

```
=QUERY(Payments!A1:H, "select F, count(A), sum(E) group by F order by count(A) desc", 1)
=QUERY(Clean!A1:H, "select G, sum(E) where D >= date '2026-09-01' and D < date '2026-10-01' group by G", 1)
```

Column letters instead of names, `label` to rename, `pivot` for a cross-tab (`select G, sum(E) group by G pivot H`). Importing the CSV through File → Import with *Replace data at selected cell* re-reads the Monday file; the formulas re-run — Sheets' version of Refresh.

### Excel ↔ Google Sheets, today's tools

| Excel | Sheets | Note |
|---|---|---|
| `TRIM`, `CLEAN`, `PROPER`, `SUBSTITUTE`, `DATEVALUE` | same | identical names and arguments |
| Ctrl+H Find & Replace (Match case / entire cell) | Ctrl+H (Match case / Match entire cell contents / regex) | Sheets adds regular expressions — `^bank transfer$` |
| Data → Text to Columns | Data → Split text to columns; `=SPLIT(G2, " ")` | the formula version is reproducible |
| Flash Fill (Ctrl+E) | — ; Smart Fill suggestions | neither leaves a formula |
| Data → Remove Duplicates | Data → Data cleanup → Remove duplicates | same exact-match caveats; Sheets is case-sensitive here |
| — | Data → Data cleanup → Trim whitespace | one-time, like Find & Replace |
| Power Query (Get & Transform), Applied Steps, Refresh All | formula tab + `UNIQUE`/`FILTER`/`ARRAYFORMULA`; re-import to refresh | no recorded pipeline in Sheets — the formulas *are* the pipeline |
| Merge Queries (join kinds) | `XLOOKUP` / `VLOOKUP` column, or `QUERY` on one tab | Sheets `QUERY` cannot join two tabs; join first with a lookup |
| Group By | `QUERY(…, "select … group by …")` or a pivot | |
| Append | `={Tab1!A2:H; Tab2!A2:H}` (array literal with `;`) | `UNION ALL` by position, not by name |

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

## 2. Detective — Nilufar's two files (40 min)

Work on `customers_dirty.csv` and `payments_dirty.csv` from `data/excel/` (the same rows as the `Customers` and `Payments` sheets, as raw files so Power Query has something to import). Grain of each: a customer *row* and a payment *row* — the question is how many *people* and *payments* they represent.

**Step 1 — the dirt inventory on Customers**, four formulas on the raw sheet:

<details><summary>Result</summary>
Trailing spaces in `first_name` `=SUMPRODUCT(--(LEN(B2:B6041)<>LEN(TRIM(B2:B6041))))` → **18**; all-caps first names `=SUMPRODUCT(--EXACT(B2:B6041, UPPER(B2:B6041)))` → **22**; all-lower surnames `=SUMPRODUCT(--EXACT(C2:C6041, LOWER(C2:C6041)))` → **40**; ids above 6 000 → **40**. The 22 + 18 = 40 first-name oddities and the 40 lower-case surnames land on the same 40 rows — ids 6001–6040. Suspicious; not yet proof.
</details>

**Step 2 — prove the duplicates** with the key + `COUNTIFS` block from section 1, then a second key on `phone|birth_date`.

<details><summary>Result</summary>
Name key: 84 rows in 42 pairs. Phone key: 80 rows in **40** pairs — exactly ids 6001–6040 paired with their originals (6001 `MALIKA jalilova` ↔ 4516 `Malika Jalilova`, same phone +998908981002, same birth date 1981-08-15, same income). The two name-only pairs (823/1197, 2460/5562) have different phones and regions — namesakes, keep both. Ten of the 40 duplicates were registered in 2026, so "new customers 2026" (955 by `registered_at`) is overstated by 10 — week 1's memo line, now a filter.
</details>

**Step 3 — the ages.** A column `age` `=DATEDIF(E2, DATE(2026,10,1), "y")` (Sheets: same), then filter `age < 18` or `age > 100`.

<details><summary>Result</summary>
**7** rows: four in the future (ids 927, 2338, 3380 born 2031-04-12 → age −5; 964 born 2027-02-28 → −1) and three at 1900-01-01 (957, 1020, 2934 → age 126). `DATEDIF` with a future date returns `#NUM!`, so in Excel the −5 shows as an error — filter errors with `ISERROR`, or use `=YEARFRAC(E2, DATE(2026,10,1))` which goes negative. Valid customers average 45.2 years. Fix: blank the seven dates and add a flag column `birth_date_invalid` = TRUE — never invent a date.
</details>

**Step 4 — Payments.** Key `=C2&"|"&TEXT(D2,"yyyy-mm-dd")&"|"&E2` (installment, day, amount), `n` and `rank` columns; and the method inventory with `=UNIQUE(F2:F52876)`.

<details><summary>Result</summary>
`n > 1` → **50** rows in **25** pairs; `rank = 2` → the 25 extra rows, Σ amount **58 397 800** — the gap on Timur's tile. All 25 repeats are `payment_id` 52 851–52 875 — they were appended to the export in one batch. Do not rely on that: sameness is the three columns, not the id range. Methods: **10** distinct raw (`card`, `cash`, `transfer`, `payme`, `click`, `Card` 57, `Click` 36, `PayMe` 30, `CASH ` 30, `bank transfer` 27 — the **180** dirty rows); `UNIQUE(LOWER(TRIM(…)))` → 6; with the `bank transfer` replacement → **5**: card 17 621 · payme 8 900 · click 8 790 · cash 8 790 · transfer 8 774.
</details>

**Step 5 — build it once in Power Query** (the worked pipeline for `payments_dirty.csv`; `Customers` is HW 4.2):

```
Source               From Text/CSV → data/excel/payments_dirty.csv
Promoted Headers
Changed Type         payment_id, loan_id, installment_id, amount → Whole Number; paid_at → Date; method, product, region → Text
Trim method          Transform → Format → Trim        (select method first)
Lowercase method     Transform → Format → lowercase
bank transfer → transfer   Replace Values, match entire cell
Drop duplicates      select installment_id, paid_at, amount → Remove Duplicates          52 875 → 52 850
Close & Load To      Table "payments_clean" on a new sheet
```

<details><summary>Checks after loading</summary>
`=ROWS(payments_clean)` → **52 850**; `=SUM(payments_clean[amount])` → **255 114 772 176** (raw was 255 173 169 976; difference 58 397 800); `=ROWS(UNIQUE(payments_clean[method]))` → **5**; `=COUNTIFS(payments_clean[paid_at], ">"&DATE(2026,10,1))` → 24 forward-dated rows (53 438 947) — *not* removed here (they are real payments recorded with a future date; filter them where an as-of matters, as week 3 did). Change the Remove Duplicates step to all columns and the count is 52 875 again — the pane lets you try and undo. Then Data → Refresh All with the file untouched: the same 52 850. That is the deliverable.
</details>

---

## 3. Practice (45 min)

File `week-04/day-3/practice.xlsx`: raw sheets untouched, a sheet per task or a Power Query per task. State the count you got next to each.

**P1.** Ctrl+H on a *copy* of `Payments`: replace `bank transfer` with `transfer` (match entire cell). How many replacements? Then try `PayMe` → `payme` with and without *Match case*. Why does the second run report 8 900 without it?

<details><summary>Answer</summary>
27. Without *Match case*, `payme` matches `PayMe` *and* the 8 870 `payme` rows — Excel replaces all 8 900 (harmlessly here, but it would be 8 900 lines in the log for 30 real changes). Tick *Match case* → 30. Find & Replace is case-insensitive by default, like the rest of Excel.
</details>

**P2.** Text to Columns on a copy of `applications.csv`'s `applied_at`: date and time in two columns, the date typed YMD. Count applications submitted in September 2026 from the date column with the half-open filter — and with `BETWEEN`-style `<= 30 Sep`.

<details><summary>Answer</summary>
621 both ways *now* — because the time has been split off, the date column has no 21:36 to lose, and `<= DATE(2026,9,30)` is safe. On the original datetime column `<= DATE(2026,9,30)` gives **598**: 23 applications after midnight on the 30th lost — week 1 B10 / week 2 P4, in Excel. The half-open form works on both columns; use it everywhere and you never have to remember which column has a time.
</details>

**P3.** `DATEVALUE`: paste `1981-08-15` as text into a cell (type an apostrophe first), prove it is text with `ISTEXT`, convert with `DATEVALUE`, and compute the age. Then try `15.08.1981` and `08/15/1981` — which converts on your machine?

<details><summary>Answer</summary>
`ISTEXT` → TRUE; `=DATEVALUE(A1)` → 29 812 (format as date → 1981-08-15); `=DATEDIF(DATEVALUE(A1), DATE(2026,10,1), "y")` → 45. Which of the two other spellings converts depends on your Windows regional format — one of them returns `#VALUE!`. That is why ISO is the export rule and why Power Query's *Changed Type with Locale* exists.
</details>

**P4.** The three Remove Duplicates runs on copies of `Customers` from section 1 (raw names; trimmed names; phone + birth date). Report the three "removed" counts and which run deletes real people.

<details><summary>Answer</summary>
**24 / 42 / 40.** The second deletes the two namesakes (1197 and 5562 go, because the tool keeps the first of each pair); only the third removes exactly the 40 true duplicates. Lesson written for Nilufar: *sameness must be defined on identifying fields (phone + birth date), checked with a count before deletion, and executed as a recorded step.*
</details>

**P5.** Flash Fill: next to `first_name`, type the cleaned name for row 6001 (`Malika`) and press Ctrl+E. Check the column against `=PROPER(TRIM(B2))` with a mismatch count. What did Flash Fill guess wrong, if anything, and why would you not ship it?

<details><summary>Answer</summary>
Usually 0–3 mismatches (it may keep `Bobur ` with its space, or capitalise after an apostrophe differently) — read your own count. Even at 0 mismatches: there is no formula behind the cells, so next Monday's file gets nothing. Flash Fill is for a one-off reshaping of a column you will paste as values and never update.
</details>

**P6.** Power Query on `customers_dirty.csv`: types, Trim + Capitalize Each Word on the names, a custom column `birth_date_invalid` = `[birth_date] > #date(2026,10,1) or [birth_date] < #date(1920,1,1)`, then Remove Duplicates on `phone`, `birth_date`. Load and count.

<details><summary>Answer</summary>
6 000 rows; `=COUNTIFS(customers_clean[birth_date_invalid], TRUE)` → **7**; `=ROWS(UNIQUE(customers_clean[phone]))` → 5 997 (the three family numbers). Capitalize Each Word gives `Malika Jalilova` — and `Buy Now Pay Later` if you let it touch `product` elsewhere; apply it to the name columns only. Add a conditional column `birth_date_clean` = null when invalid, else `[birth_date]`, so the age band gets a blank, not −5.
</details>

**P7.** Group By in Power Query on `payments_clean`: method → count and sum. Then the same with `QUERY` in Sheets (or `COUNTIFS`/`SUMIFS` on the loaded table). Five rows?

<details><summary>Answer</summary>
card 17 612 / 84 747 182 579 · payme 8 897 / 42 929 061 915 · cash 8 788 / 41 431 864 371 · click 8 786 / 42 977 555 023 · transfer 8 767 / 43 029 108 288; Σ = 52 850 / 255 114 772 176. Shares 33.3 / 16.8 / 16.6 / 16.6 / 16.6 % — the same shares as week 2's Step 3 table, but each count is a few rows lower: week 2 cleaned the spelling only, today you also removed the 25 duplicate payments. Sheets: `=QUERY(Clean!A1:H, "select F, count(A), sum(E) group by F", 1)`.
</details>

**P8.** **Merge** = join: a query `paid_by_installment` = `payments_clean` filtered `paid_at <= 2026-10-01`, grouped by `installment_id` → `paid`; merge it into `installments.csv` (Left Outer, key `installment_id`), expand `paid`, replace null with 0. Count matured instalments (`due_date <= 2026-10-01`) with `paid < total_due`.

<details><summary>Answer</summary>
92 193 rows after the merge (Left Outer keeps every instalment — check it; an Inner join would drop the unpaid ones, which are the point). Matured: 54 207; **1 784** not fully paid, 403 of them with a partial payment — week 2's `unpaid` CTE, built with a dropdown. (Week 2 counted 427 partials because it did not cut payments at the as-of date: 24 more instalments have a forward-dated payment.) Bonus check: instalments with `paid > total_due` → **0** after dedup, **25** before it — the duplicates were the only over-payments in the book.
</details>

**P9.** Append: split `payments_clean` into two queries by region (Tashkent / everyone else), then Append them back. Rows? Now add a `source` column to each before appending — what is that for?

<details><summary>Answer</summary>
20 437 + 32 413 = 52 850 (Tashkent carries 38.7 % of payment rows; 7 of the 25 duplicates were Tashkent's). `Append` is `UNION ALL`: it does not deduplicate, and it matches columns **by name** — a column spelt `Amount` in one file and `amount` in the other becomes two columns with nulls. The `source` column is how you know which monthly file a row came from after twelve appends — the lineage you will want the first time a total is wrong.
</details>

**P10.** Refresh test: with the pipeline loaded, open `payments_dirty.csv` in a text editor, duplicate the **last line** once more, save, Refresh All. What do the counts do? Undo the edit and refresh again.

<details><summary>Answer</summary>
Raw rows 52 876, clean rows still **52 850** (the new line is a third copy of a known duplicate), Σ unchanged. Undo, refresh → 52 875 / 52 850. You have just demonstrated the deliverable Timur asked for: the cleaning is a property of the *query*, not of the *file*. (Sheets: re-import with *Replace data at selected cell*; the formula tab follows.)
</details>

<span class="badge stretch">Stretch</span> **P11.** Group By month on the merged `installments` query from P8: Σ `total_due`, Σ `paid`, and a rate column — the collection rate for every month of 2026. Where does it drop and why is the September figure *expected* to be lower?

<details><summary>Answer</summary>
Jan 97.3 % · Feb 97.0 · Mar 96.8 · Apr 96.9 · May 97.1 · Jun 96.9 · Jul 96.7 · Aug 96.5 · **Sep 94.1 %**. September's instalments have had at most 30 days to be paid (as of 1 October), the others 60–270 — the rate for the latest month is always lower until it matures; compare months at the same age or wait a month. The Company corner states the definition.
</details>

### Mistakes that cost a point this week

- Cleaning the raw sheet in place and saving — the evidence is gone; raw stays raw.
- Remove Duplicates on all columns ("to be safe") — 0 removed, because ids differ.
- Remove Duplicates on a loose key without a count first — real people deleted (P4).
- `TRIM` not applied before matching — the trailing-space duplicates survive.
- Text transforms on a column still typed as a number in Power Query — nothing happens, no error.
- A Merge with the default Left Outer when you meant Inner (or vice versa) — count rows after every merge.
- Replacing a date you cannot trust with a plausible one — blank + flag, never a guess.
- A change log that lists tools ("used Power Query") instead of changes ("removed 25 duplicate payments on installment_id + paid_at + amount, Σ 58 397 800").

---

## 4. Homework <span class="badge hw">HW 4.2 — Due Day 5</span>

**Nilufar's Monday pipeline.** Submit `submissions/week-04/day-3/cleaning.xlsx` (Power Query inside) — or, in Sheets, a spreadsheet with raw and clean tabs exported to `.xlsx` plus the formulas visible — and `change_log.md`:

1. **`customers_clean`** — 6 000 rows: names trimmed and capitalised, duplicates removed on `phone` + `birth_date` (keep the earlier `registered_at` — sort before Remove Duplicates), `birth_date_invalid` flag (7 TRUE) and `birth_date_clean` (blank when invalid), `monthly_income` typed as number with its blanks kept as null — not 0 (356 in the raw file, 354 after the dedup: two blanks belonged to removed duplicates).
2. **`payments_clean`** — 52 850 rows: `method` in 5 values, duplicates removed on `installment_id` + `paid_at` + `amount`, a column `is_forward_dated` (TRUE for the 24 rows after 2026-10-01; keep the rows).
3. **`checks`** sheet — `ROWS`, `SUM`, `UNIQUE` counts for both tables against the known numbers (6 000 / 7; 52 850 / 255 114 772 176 / 5 / 24), each with a TRUE/FALSE cell.
4. **`change_log.md`** — ten lines, one per change: *what, on which columns, how many rows affected, the money if any, why* (e.g. *removed 25 duplicate payments on installment_id + paid_at + amount, Σ 58 397 800, keeping the lower payment_id*). The Applied Steps pane, renamed, is your draft.

Graded on: (a) counts match (6 000 / 7 / 52 850 / 5 / 25 removed), (b) Refresh All reproduces them from the CSVs — the reviewer will refresh, (c) the change log is specific enough that Timur could rebuild the pipeline from it without opening the file.

### 📎 Hand in here

```sqltask
{"check": "handin-W4D3", "lesson": "W4D3", "title": "HW 4.2", "tasks": [{"id": "cleaning.xlsx", "file": "cleaning.xlsx", "names": ["cleaning.xlsx"], "upload": true, "accept": ".xlsx", "q": "Attach `cleaning.xlsx` — what the page above asks for."}, {"id": "change_log.md", "file": "change_log.md", "text": true, "minLines": 3, "q": "Write `change_log.md` here — what the page above asks for."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else the page lists (one more file, or a .zip of several)."}]}
```

---

## 5. Self-check

1. Remove Duplicates on raw `first_name, last_name, birth_date` removes fewer rows than there are true duplicates, and after `TRIM` it removes too many. Name the two reasons. *(→ section 1, "Remove Duplicates", P4)*
2. What is the Power Query equivalent of a `LEFT JOIN`, and what row count must you check after it? *(→ section 1, "Power Query", P8)*
3. A column of dates is left-aligned and `">="&DATE(2026,1,1)` finds nothing. What happened and which two fixes exist? *(→ section 1, "Dates stored as text")*

---

## 6. Company corner <span class="badge company">Collection rate by month</span>

**Collection rate** (*уровень сбора*) = amount **collected** ÷ amount **due** in a period. Week 3 gave September 2026 as 94.1 % from `v_payments_clean` + `installments`; today you reproduce it from the cleaned files, in Power Query (or a pivot on the merged table), and write the definition under it.

**Definition (ours):** for instalments **due in the month** (`due_date` in the month, half-open), collected = payments on those instalments with `paid_at <= 2026-10-01` from `payments_clean` (duplicates removed, forward-dated rows excluded by the as-of filter); rate = Σ collected ÷ Σ `total_due`.

```
Query  paid_by_installment   payments_clean → Filter paid_at <= 2026-10-01 → Group By installment_id: paid = Sum(amount)
Query  installments_paid     installments.csv → Merge paid_by_installment (Left Outer, installment_id) → expand paid → Replace null → 0
                             → Add Column → Date → Month → Start of Month (from due_date) as due_month
Query  collection_by_month   installments_paid → Group By due_month: due = Sum(total_due), paid = Sum(paid), instalments = Count Rows
                             → Add Column → Custom: rate = [paid] / [due]      → Close & Load
```

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

> Interview version: *"What is a collection rate and how do you compute it from payments and a schedule?"* — Σ paid ÷ Σ due for instalments due in the period; paid comes from de-duplicated payments joined on the instalment id with an as-of cut-off; say whether it is instalment-basis or cash-basis; expect the latest month to read low until it matures; reconcile the join by row count (every instalment kept) before dividing.

Tomorrow: PivotTables and charts — Madina's one page for the board, built on the clean tables.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w04d3", "pass": 0.8, "questions": [
  {"type": "single", "q": "You tick first_name, last_name, birth_date on the raw Customers sheet and run Remove Duplicates. Why does it miss some true duplicates?", "options": ["It only checks the first 1 000 rows", "It ignores case but not spaces, so 'Bobur ' and 'Bobur' stay different rows", "It is case-sensitive, so MALIKA and Malika stay apart", "It removes the first copy instead of the second"], "answer": 1, "explain": "Remove Duplicates compares exactly as displayed, case-insensitively and space-sensitively; TRIM before matching (→ section 1, Remove Duplicates — and why it lies; P4)."},
  {"type": "single", "q": "Why does the matching key put a separator between the parts?", "code": "=LOWER(TRIM(B2))&\"|\"&LOWER(TRIM(C2))&\"|\"&TEXT(E2,\"yyyy-mm-dd\")", "options": ["Excel needs it to join text", "Without it, different names can glue into the same key: 'Ali'&'Nazarov' = 'Alin'&'azarov'", "It makes the key case-insensitive", "COUNTIFS cannot read keys without |"], "answer": 1, "explain": "A separator keeps the parts apart, so only true matches share a key (→ section 1, Text repair)."},
  {"type": "single", "q": "In N2, filled down the sheet, what does this formula return?", "code": "=COUNTIFS($L$2:L2, L2)          (column L holds the key)", "options": ["How many rows in the whole sheet share the key", "1 for the first occurrence of a key, 2 for the second, … — Excel's ROW_NUMBER() OVER (PARTITION BY key)", "The row number", "TRUE when the key is unique"], "answer": 1, "explain": "The range grows row by row ($L$2 pinned, L2 free), so it counts how many times the key has appeared so far; filter rank = 2 to look at the extras before deleting (→ section 1, Finding duplicates before removing them)."},
  {"type": "single", "q": "On Payments you tick ALL columns in Remove Duplicates 'to be safe'. Why is nothing removed?", "options": ["Payments has no duplicates", "payment_id differs on every row, so no two rows are equal on all columns; sameness must be defined on installment_id, paid_at and amount", "Remove Duplicates does not work on numbers", "The table must be sorted first"], "answer": 1, "explain": "A duplicate is two rows that agree on everything that matters, not on everything (→ section 1, Remove Duplicates; Mistakes that cost a point)."},
  {"type": "multi", "q": "Which Power Query steps are matched with the right SQL idea?", "options": ["Merge Queries, join kind Left Outer = LEFT JOIN", "Append Queries = UNION ALL", "Merge Queries, join kind Left Anti = rows with no match (anti-join)", "Append Queries removes duplicate rows, like UNION", "Changed Type = WHERE"], "answer": [0, 1, 2], "explain": "Append keeps every row and matches columns by name; Changed Type is CAST (→ section 1, Power Query; P9)."},
  {"type": "number", "q": "A customer was born on 2000-10-02. What age does the formula give as of 2026-10-01?", "code": "=DATEDIF(DATE(2000,10,2), DATE(2026,10,1), \"y\")", "answer": 25, "explain": "\"y\" counts completed years; the 26th birthday is one day after the as-of date (→ section 2, step 3; P3)."},
  {"type": "single", "q": "A customer's birth date is 2031-04-12. What goes into customers_clean?", "options": ["A plausible date such as 1981-04-12", "The birth date left blank, with birth_date_invalid = TRUE", "Delete the customer", "Today's date"], "answer": 1, "explain": "Blank + flag, never a guess: an invented date would flow into age bands as if it were real (→ section 2, step 3; P6)."},
  {"type": "single", "q": "The collection rate for instalments due in September (as of 1 October) is lower than for June–August. Why is that expected?", "options": ["September is always a bad month", "September's instalments have had at most 30 days to be paid, the earlier months much longer; the latest month reads low until it matures", "Duplicates were removed only for September", "The cash-basis rate was used for September"], "answer": 1, "explain": "Compare months at the same age, or wait a month (→ section 6, Company corner; P11)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w04d3", "q": "Sevara is asked how much of the money now arrives in cash. From payments_dirty.csv, clean the data as today (method trimmed, lower-cased, 'bank transfer' → 'transfer'; exact duplicates on installment_id + paid_at + amount removed), then take the payments dated 1 July to 30 September 2026. What share of the amount was paid in cash? Percentage to 1 decimal.", "type": "number", "dp": 1, "h": ["fad2aafd4c9fc414be900231"], "hint": "Two kinds of dirt both touch this number — look at every spelling of cash, and count the rows before and after the duplicate step.", "sol": "UG93ZXIgUXVlcnk6IHRoZSBwYXltZW50c19jbGVhbiBwaXBlbGluZSBmcm9tIHNlY3Rpb24gMiAoQ2hhbmdlZCBUeXBlLCBUcmltLCBsb3dlcmNhc2UsIFJlcGxhY2UgVmFsdWVzICdiYW5rIHRyYW5zZmVyJyDihpIgJ3RyYW5zZmVyJywgUmVtb3ZlIER1cGxpY2F0ZXMgb24gaW5zdGFsbG1lbnRfaWQgKyBwYWlkX2F0ICsgYW1vdW50IOKGkiA1MiA4NTAgcm93cyksIGxvYWRlZCBhcyBhIFRhYmxlLiBUaGVuOgo9U1VNSUZTKHBheW1lbnRzX2NsZWFuW2Ftb3VudF0sIHBheW1lbnRzX2NsZWFuW21ldGhvZF0sICJjYXNoIiwgcGF5bWVudHNfY2xlYW5bcGFpZF9hdF0sICI+PSImREFURSgyMDI2LDcsMSksIHBheW1lbnRzX2NsZWFuW3BhaWRfYXRdLCAiPCImREFURSgyMDI2LDEwLDEpKQogLyBTVU1JRlMocGF5bWVudHNfY2xlYW5bYW1vdW50XSwgcGF5bWVudHNfY2xlYW5bcGFpZF9hdF0sICI+PSImREFURSgyMDI2LDcsMSksIHBheW1lbnRzX2NsZWFuW3BhaWRfYXRdLCAiPCImREFURSgyMDI2LDEwLDEpKQrihpIgNyA1MzEgNDE4IDkxNSAvIDQ3IDI4NyAwOTUgMTUyID0gMTUuOSAlLgpPbiB0aGUgcmF3IGZpbGUgKGR1cGxpY2F0ZXMgaW4sICdDQVNIICcgd2l0aCBpdHMgdHJhaWxpbmcgc3BhY2Ugbm90IG1hdGNoZWQpIHRoZSBzYW1lIGZvcm11bGEgZ2l2ZXMgMTUuOCAlOiBzbWFsbCwgYnV0IHRoZSB0d28ga2luZHMgb2YgZGlydCBwdWxsIGluIHRoZSBzYW1lIGRpcmVjdGlvbiBhbmQgdGhlIHRpbGUgd291bGQgYmUgd3JvbmcgaW4gdGhlIGZpcnN0IGRlY2ltYWwuCkNhc2ggaXMgYWJvdXQgb25lIHNvdW0gaW4gc2l4OyBjYXJkIGJyaW5ncyBhIHRoaXJkICgzMy4wICUpLiBJZiBTZXZhcmEgcGxhbnMgY2FzaC1oYW5kbGluZyBlZmZvcnQsIGl0IGNvdmVycyBhIHNpeHRoIG9mIHRoZSBtb25leSwgbm90IHRoZSBidWxrIG9mIGl0Lg=="}
```

<!-- challenge:end -->
