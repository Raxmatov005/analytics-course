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

```excel
=SUMPRODUCT(--(LEN(B2:B6041)<>LEN(TRIM(B2:B6041))))     stray spaces → 18
=SUMPRODUCT(--EXACT(C2:C6041, LOWER(C2:C6041)))         written all lower case → 40
=ROWS(UNIQUE(F2:F52876))                                distinct raw methods (Payments)
=COUNTBLANK(I2:I6041)                                   blanks in monthly_income → 356
=SUMPRODUCT(--ISTEXT(E2:E6041))                         dates stored as text → must be 0
```

**When you use it.**
- First thing with any new file: count each kind, write the counts down. They become your change log.
- After cleaning: the same formulas on the clean table must say 0.

**Your turn.** Sort the dirty values into their kind.

```game
{"type": "sort", "id": "w04d3-g6", "title": "Which kind of dirt?", "q": "Drop each value from the Monday files into the kind of problem it shows.", "groups": {"Stray spaces": ["first_name 'Yulduz ' (trailing space)", "method 'CASH '"], "Case": ["first_name 'MALIKA'", "method 'PayMe'"], "Synonym": ["method 'bank transfer'"], "Duplicate": ["payment 52859 = payment 7172"], "Impossible value": ["birth_date 2031-04-12", "registered_at 2027-01-09"], "Blank": ["monthly_income empty"]}}
```

### Find & Replace — Ctrl+H

**What it is.** **Find & Replace** (*найти и заменить*) changes every occurrence of one text into another, in the selection, the sheet or the workbook. It is a one-time edit: nothing is recorded, and the next file does not get it.

**How to write it.**

```text
Ctrl+H
  Find what:     bank transfer
  Replace with:  transfer
  Options ▸  Match case                    off: card also finds Card and CARD
             Match entire cell contents    on:  card does not find discard
             Within: Sheet / Workbook
  Replace All  →  "We made 27 replacements"   ← write this number down
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

```task
{"id": "w04d3-l1", "kind": "choice", "options": ["Malika Jalilova", "MalikaJalilova", "Malika  Jalilova", "#VALUE!"], "answer": 1, "explain": "Find & Replace removes every space, the one between the words too. To remove only the spaces at the ends and the doubled ones, use TRIM."}
```

### Text to Columns — split one column into several

**What it is.** **Text to Columns** (*текст по столбцам*) splits each cell of one column into several columns, at a **delimiter** (a space, a comma, `|`) or at fixed widths. Data → Text to Columns. It is a one-time edit on the sheet.

**How to write it.**

```text
select applied_at → Data → Text to Columns
  Step 1  Delimited                      (or Fixed width)
  Step 2  Delimiter: Space
  Step 3  column 1 → Date: YMD           column 2 → General
          Destination: an EMPTY column   (the split overwrites the columns to the right)
```

| applied_at (before) | → date | → time |
|---|---|---|
| 2025-06-02 10:35:00 | 2025-06-02 | 10:35:00 |
| 2026-09-30 21:36:00 | 2026-09-30 | 21:36:00 |

On `applications.csv` the 14 000 `applied_at` values become a date column and a time column. With the date on its own, `<= DATE(2026,9,30)` no longer loses the applications sent during the evening of 30 September.

**When you use it.**
- A date and a time glued together; a `"region|product"` key; a full name to split into first and last.
- Sheets: Data → Split text to columns, or the formula `=SPLIT(G2, " ")`, which re-runs.

> ⚠️ **Watch out.** The split writes into the columns to the right. Excel asks *"replace the contents of the destination cells?"* once, and one click on OK overwrites them. Insert empty columns first, or set *Destination* to an empty area.

**Your turn.** In `applications.csv`, `applied_at` is column G and `decided_at` is column H. You split G by space with the default destination. What happens to `decided_at`?

```task
{"id": "w04d3-l2", "kind": "choice", "options": ["Nothing — Excel inserts a new column", "It is overwritten by the time part of applied_at", "Excel refuses to split", "The time part goes to the end of the sheet"], "answer": 1, "explain": "The second part goes into the next column, H, and replaces decided_at after one OK on the warning. Insert an empty column first."}
```

### Flash Fill — Excel guesses the pattern

**What it is.** **Flash Fill** (*мгновенное заполнение*, Ctrl+E) fills a column from one or two examples you type. Excel infers the pattern and writes **values**, not formulas.

**How to write it.**

```text
B: first_name   H (new column)
MALIKA          Malika        ← you type this one example
Yulduz␣         Yulduz        ← Ctrl+E fills the rest
Nodir           Nodir
```

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

```task
{"id": "w04d3-l3", "kind": "choice", "options": ["The cleaned name — Flash Fill re-runs", "Nothing — Flash Fill wrote values, so new rows get no rule", "#N/A", "A copy of the row above"], "answer": 1, "explain": "Flash Fill leaves values, not a formula. A Table copies formulas to new rows, never values."}
```

### TRIM, CLEAN, SUBSTITUTE — repairing text with formulas

**What it is.** Text repair as a formula on a clean tab, so it re-runs. **TRIM** (*СЖПРОБЕЛЫ*) removes spaces at the ends and doubled spaces inside. **CLEAN** (*ПЕЧСИМВ*) removes non-printing characters — line breaks and tabs from a copy-paste. **SUBSTITUTE** (*ПОДСТАВИТЬ*) replaces one text with another inside a cell. **LOWER**, **UPPER** and **PROPER** fix case (Day 1).

**How to write it.**

```excel
=TRIM(B2)                                        "Yulduz "  → "Yulduz"
=CLEAN(B2)                                       removes line breaks and tabs
=SUBSTITUTE(text, old, new)                      every "old" inside text becomes "new"
=LOWER(TRIM(F2))                                 "CASH "  → "cash";  "PayMe" → "payme"
=SUBSTITUTE(LOWER(TRIM(F2)), "bank transfer", "transfer")              one synonym
=SUBSTITUTE(SUBSTITUTE(LOWER(TRIM(F2)), "bank transfer", "transfer"), "pay me", "payme")
                                                 nested: the inner result goes into the outer one
=TRIM(CLEAN(SUBSTITUTE(B2, CHAR(160), " ")))     non-breaking spaces (CHAR 160) survive TRIM
```

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

> ⚠️ **Watch out.** `PROPER` capitalises after every non-letter: `"payme"` → `"Payme"`, `"o'neil"` → `"O'Neil"`. Use it for people's names, not for codes.

**Your turn.** On `tblPayments`, how many distinct values does `=LOWER(TRIM([@method]))` leave, before any `SUBSTITUTE`?

```task
{"id": "w04d3-l4", "kind": "number", "answer": 6, "dp": 0, "unit": "values", "hint": "Case and spaces are gone; one synonym is still there.", "model": "6: card, cash, transfer, payme, click — and bank transfer, which only SUBSTITUTE can merge into transfer. 10 raw → 6 → 5."}
```

### Dates stored as text — ISNUMBER, DATEVALUE, locale

**What it is.** A real date is a number (Day 1). A **date stored as text** (*дата в текстовом формате*) only looks like one: it sits left-aligned, sorts as text and is skipped by every date criterion. **DATEVALUE** (*ДАТАЗНАЧ*) turns date-text into a real date. **ISNUMBER** / **ISTEXT** tell you which one a cell holds.

**How to write it.**

```excel
=ISNUMBER(E2)                    TRUE = a real date, FALSE = text
=DATEVALUE(E2)                   "1981-08-15" → 29813 (format the cell as a date → 1981-08-15)
=VALUE(E2)                       the same
=SUMPRODUCT(--ISTEXT(E2:E6041))  text dates in the whole column — must be 0
```

How Excel reads typed text depends on the **locale** (the Windows regional setting):

| typed | US locale (month first) | day-first locale (Russia, UK) |
|---|---|---|
| `2026-03-14` | 14 March 2026 | 14 March 2026 |
| `03/04/2026` | 4 March 2026 | 3 April 2026 |
| `14/03/2026` | **text** — there is no month 14 | 14 March 2026 |
| `14.03.2026` | **text** | 14 March 2026 |

Only ISO `yyyy-mm-dd` reads the same everywhere. Our CSVs use it.

**Impossible dates** are real dates that cannot be true. In `customers_dirty.csv`, **7** birth dates are impossible: four in the future (`2031-04-12`, `2027-02-28`) and three at `1900-01-01`, a "no date" placeholder. **5** customers were registered after the as-of date 2026-10-01.

**When you use it.**
- Every date column of an imported file: `ISNUMBER` on the whole column before any date formula.
- Impossible dates: blank them and add a flag column. Never invent a plausible date.

> ⚠️ **Watch out.** The worst case is a column that is **half** converted: in a US locale `03/04/2026` becomes a date and `14/03/2026` stays text. Totals are low by exactly the text rows, and the sheet looks fine.

**Your turn.** A colleague in a US-locale Excel types four dates. Which one stays **text**?

```task
{"id": "w04d3-l5", "kind": "choice", "options": ["2026-03-14", "03/14/2026", "14/03/2026", "3/14/2026"], "answer": 2, "explain": "US Excel reads month/day/year, and there is no month 14, so 14/03/2026 stays text. ISO 2026-03-14 is read correctly everywhere."}
```

### A matching key — one text that means "the same person"

**What it is.** A **matching key** (*ключ сопоставления*) is one text built from the columns that identify a row, cleaned so that equal things give equal keys: trimmed, one case, joined with a **separator**.

**How to write it.**

```excel
=LOWER(TRIM(B2)) & "|" & LOWER(TRIM(C2)) & "|" & TEXT(E2, "yyyy-mm-dd")
 first_name         sep    last_name         sep    birth_date as text
```

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

```game
{"type": "cloze", "id": "w04d3-g1", "code": true, "title": "Fill the matching key for a person", "text": "=LOWER({{0}}(B2))&{{1}}&LOWER(TRIM(C2))&\"|\"&{{2}}(E2,\"yyyy-mm-dd\")", "blanks": [["TRIM"], ["\"|\""], ["TEXT"]], "distractors": ["PROPER", "\"\"", "VALUE", "CLEAN"]}
```

### COUNTIFS on the key — find duplicates before you remove them

**What it is.** Two `COUNTIFS` columns on the key show every duplicate **before** anything is deleted. **n** = how many rows share this key. **rank** = which copy this row is: 1 for the first, 2 for the repeat — Excel's `ROW_NUMBER() OVER (PARTITION BY key)`.

**How to write it.**

```excel
L2  key    =LOWER(TRIM(B2))&"|"&LOWER(TRIM(C2))&"|"&TEXT(E2,"yyyy-mm-dd")
M2  n      =COUNTIFS($L$2:$L$6041, L2)        the whole column: how many share the key
N2  rank   =COUNTIFS($L$2:L2, L2)             a growing range: pinned start, free end
```

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

```game
{"type": "bug", "id": "w04d3-g2", "title": "Which column lies?", "q": "The rank column should say 1 for the first occurrence and 2 for the repeat, but it shows 2 on both rows of every pair. Tap the broken line.", "code": "L2  key   =LOWER(TRIM(B2))&\"|\"&LOWER(TRIM(C2))&\"|\"&TEXT(E2,\"yyyy-mm-dd\")\nM2  n     =COUNTIFS($L$2:$L$6041, L2)\nN2  rank  =COUNTIFS($L$2:$L$6041, L2)", "answer": [2], "why": "rank needs a growing range, $L$2:L2 — pinned start, free end — so it counts only the rows so far. With the whole range it is just n again."}
```

### Remove Duplicates — and why it lies

**What it is.** **Remove Duplicates** (*удалить дубликаты*, Data → Remove Duplicates) deletes rows that are equal on the columns you tick. It keeps the **first** row of each group and reports only *how many* it removed. It compares **case-insensitively** but **space-sensitively**.

**How to write it.**

```text
select the table → Data → Remove Duplicates
  ☑ installment_id   ☑ paid_at   ☑ amount     ← the columns that define "the same"
  ☐ payment_id ☐ method …                      ← leave out what always differs
  OK → "25 duplicate values found and removed; 52 850 unique values remain"
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

```task
{"id": "w04d3-l6", "kind": "choice", "options": ["52859 — the newer one", "7172 — the first one in the sheet", "Both — the payment_ids differ", "Neither"], "answer": 1, "explain": "Remove Duplicates keeps the first row of each group in the current order. Sort first if a particular copy must survive."}
```

### Power Query — load, steps, load back

**What it is.** **Power Query** (*Получить и преобразовать*, Get & Transform) imports a file and cleans it with **recorded steps**. Every click becomes a step in the **Applied Steps** pane. **Refresh** re-reads the file and replays every step. It is the Excel version of a SQL view.

**How to write it.**

```text
Data → Get Data → From File → From Text/CSV → payments_dirty.csv → Transform Data
                                                                        │
   Power Query editor ─────────────────────────────────────────────────┘
     preview of the rows            Applied Steps (right pane)
                                      Source
                                      Promoted Headers
                                      Changed Type
                                      … one step per click …
   Home → Close & Load  →  a Table on a new sheet
```

Each step is one line of **M**, the query language, shown in the formula bar — a shape, not to type:

```text
= Table.SelectRows(#"Changed Type", each [paid_at] <= #date(2026, 10, 1))
  function          previous step        the condition
```

You do not need to write M. You need to read it enough to see what a step does. Right-click a step → *Rename* so the pane reads like a change log: `Trim method`, `bank transfer → transfer`, `Drop 25 duplicates`.

**When you use it.**
- Any file that arrives again: the Monday export, the monthly bank file.
- Power Query needs Excel for Windows or Microsoft 365. **Sheets** has none: its pipeline is a clean tab of formulas (`ARRAYFORMULA`, `UNIQUE`, `QUERY`), re-run by importing the new CSV over the raw tab.

> ⚠️ **Watch out.** Steps run in order, top to bottom. Insert a step in the middle and every later step works on its result — check the row count at the last step after any change.

**Your turn.** Which tools leave a recipe that re-runs on the next file?

```game
{"type": "sort", "id": "w04d3-g3", "title": "Discover, or deliver?", "q": "Which tools leave a re-runnable recipe behind, and which are a one-time edit?", "groups": {"One-time edit — fine for a look, never for Monday's file": ["Find & Replace (Ctrl+H)", "Flash Fill (Ctrl+E)", "the Remove Duplicates button", "Text to Columns on the raw sheet"], "Recorded — re-runs on the next file": ["Power Query: Replace Values step", "Power Query: Remove Duplicates step", "=TRIM(…) on a clean tab", "Sheets: QUERY over the raw tab"]}}
```

### Change Type — the first step after the headers

**What it is.** **Change Type** sets the type of each column: Whole Number, Decimal, Date, Text. It is SQL's `CAST`. Power Query guesses types on import; you check every guess.

**How to write it.**

```text
click the type icon in the column header (ABC / 123 / calendar) → choose
M: = Table.TransformColumnTypes(#"Promoted Headers", {{"paid_at", type date}, {"amount", Int64.Type}, {"phone", type text}})
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

**Your turn.** Power Query types `phone` as Whole Number. What does the first customer's phone `+998902031105` become?

```task
{"id": "w04d3-l7", "kind": "choice", "options": ["+998902031105", "998902031105 — the + is lost", "an error in every row", "9.98902E+11 stored as text"], "answer": 1, "explain": "A number cannot hold a +, so it is dropped. Type identifiers — phones, codes, account numbers — as Text."}
```

### Filter Rows — WHERE in Power Query

**What it is.** **Filter Rows** keeps the rows that meet a condition. It is SQL's `WHERE`. Click the arrow in a column header.

**How to write it.**

```text
paid_at header ▾ → Date Filters → Before… / On or before… → 2026-10-01
M: = Table.SelectRows(#"Changed Type", each [paid_at] <= #date(2026, 10, 1))
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

```task
{"id": "w04d3-l8", "kind": "number", "answer": 52851, "dp": 0, "unit": "rows", "hint": "All rows minus the forward-dated ones.", "model": "52 875 − 24 = 52 851. After the duplicates are removed the same filter keeps 52 826."}
```

### Split Column — Text to Columns, recorded

**What it is.** **Split Column** cuts one column into several, by a delimiter or by a number of characters. It is Text to Columns as a recorded step: next Monday's file is split too.

**How to write it.**

```text
select applied_at → Home → Split Column → By Delimiter → Space → At the left-most delimiter
M: = Table.SplitColumn(#"Changed Type", "applied_at", Splitter.SplitTextByEachDelimiter({" "}), {"applied_at.1", "applied_at.2"})
then Change Type: applied_at.1 → Date, applied_at.2 → Time
```

| applied_at | applied_at.1 | applied_at.2 |
|---|---|---|
| 2025-06-02 10:35:00 | 2025-06-02 | 10:35:00 |

**When you use it.**
- The same cases as Text to Columns, on a file that comes back.
- Split never overwrites a neighbour: Power Query adds new columns.

**Your turn.** After the split, which type should `applied_at.1` get?

```task
{"id": "w04d3-l9", "kind": "choice", "options": ["Text", "Date", "Whole Number", "Date/Time"], "answer": 1, "explain": "It holds only the day now. As a Date it filters and groups by month; as Text it would sort but never compare as a date."}
```

### Replace Values, Trim, lowercase — text steps

**What it is.** The text repairs of this page as steps. **Transform → Format** has Trim, Clean, lowercase, UPPERCASE and Capitalize Each Word (= `PROPER`). **Replace Values** is `SUBSTITUTE`.

**How to write it.**

```text
select method → Transform → Format → Trim                M: Table.TransformColumns(…, {{"method", Text.Trim}})
select method → Transform → Format → lowercase           M: Text.Lower
select method → Transform → Replace Values
     Value To Find: bank transfer   Replace With: transfer
     Advanced ▸ ☑ Match entire cell contents              M: Table.ReplaceValue(…, "bank transfer", "transfer", Replacer.ReplaceValue, {"method"})
```

| method (raw) | after Trim + lowercase + Replace |
|---|---|
| `CASH␣` | cash |
| PayMe | payme |
| bank transfer | transfer |

**When you use it.**
- Every text column you will group, filter or join on.
- Capitalize Each Word on name columns only.

> ⚠️ **Watch out.** Without *Match entire cell contents*, Replace Values works inside the text: replacing `card` with `bank card` would also turn `discard` into `disbank card`.

**Your turn.** Which of these steps must **not** run on `method`?

```task
{"id": "w04d3-l10", "kind": "choice", "options": ["Trim", "lowercase", "Capitalize Each Word", "Replace Values bank transfer → transfer"], "answer": 2, "explain": "Capitalize Each Word turns payme into Payme and creates new spellings. It is for people's names."}
```

### Remove Duplicates — the recorded step

**What it is.** The same deletion as the button, as a step. Select the key columns, then Home → Remove Rows → Remove Duplicates. It keeps the first row of each group, like `ROW_NUMBER() … WHERE rn = 1`.

**How to write it.**

```text
Ctrl+click installment_id, paid_at, amount → Home → Remove Rows → Remove Duplicates
M: = Table.Distinct(#"Replaced Value", {"installment_id", "paid_at", "amount"})
```

On `payments_dirty.csv`: 52 875 → **52 850** rows, 25 removed, Σ amount down by 58 397 800. Rename the step `Drop 25 duplicates`.

**When you use it.**
- The delivered version of the deletion you checked with `COUNTIFS`.
- Sort first (a *Sorted Rows* step) when a particular copy must be kept — the earlier `registered_at`, the lower `payment_id`.

> ⚠️ **Watch out.** Selecting **all** columns removes nothing: `payment_id` differs on every row. A duplicate agrees on what matters, not on everything.

**Your turn.** You select **every** column of `payments_dirty.csv` before Remove Duplicates. How many rows are left?

```task
{"id": "w04d3-l11", "kind": "number", "answer": 52875, "dp": 0, "unit": "rows", "hint": "Is any pair of rows equal on payment_id?", "model": "52 875 — nothing goes, because no two rows share a payment_id. Select installment_id, paid_at and amount to get 52 850."}
```

### Add Column — a calculated column

**What it is.** **Add Column** creates a new column from the others: **Custom Column** takes a formula in M, **Conditional Column** is a `CASE` built with a form, **Date → Month → Start of Month** derives a month. It is a calculated column in `SELECT`.

**How to write it.**

```text
Add Column → Custom Column
  name:     birth_date_invalid
  formula:  [birth_date] > #date(2026,10,1) or [birth_date] < #date(1920,1,1)
M: = Table.AddColumn(#"Removed Duplicates", "birth_date_invalid", each [birth_date] > #date(2026,10,1) or [birth_date] < #date(1920,1,1))
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

```task
{"id": "w04d3-l12", "kind": "number", "answer": 5, "dp": 0, "unit": "customers", "hint": "Change Type on registered_at to Date first.", "model": "5 — customers 6005, 6006, 6022, 6039 and 6040, all among the duplicate rows 6001–6040. A registration after the as-of date is an impossible value."}
```

### Group By — GROUP BY in Power Query

**What it is.** **Group By** (Transform → Group By) folds the rows into one row per key, with aggregates: Sum, Count Rows, Min, Max, Average. It is SQL's `GROUP BY`.

**How to write it.**

```text
Transform → Group By → Advanced
  group by:  method
  new column: payments = Count Rows
  new column: amount   = Sum of amount
M: = Table.Group(#"Removed Duplicates", {"method"}, {{"payments", each Table.RowCount(_)}, {"amount", each List.Sum([amount])}})
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

```task
{"id": "w04d3-l13", "kind": "number", "answer": 52826, "dp": 0, "unit": "rows", "hint": "How many payments does one instalment have in this data?", "model": "52 826 — the same as the filtered payment rows, because after the dedup no instalment has two payments. Grouping still matters: next month's file may hold a split payment."}
```

### Unpivot — wide columns into rows

**What it is.** **Unpivot** (*отменить свёртывание столбцов*) turns many value columns into two columns — **Attribute** (the old header) and **Value** — one row per old cell. It makes a report back into a proper table (Day 1).

**How to write it.**

```text
select the label column (region) → Transform → Unpivot Columns ▾ → Unpivot Other Columns
M: = Table.UnpivotOtherColumns(#"Changed Type", {"region"}, "Attribute", "Value")
then rename Attribute → bucket, Value → outstanding
```

| region | 0 | 1-30 | → | region | bucket | outstanding |
|---|---|---|---|---|---|---|
| Andijan | a | b | | Andijan | 0 | a |
| Bukhara | c | d | | Andijan | 1-30 | b |
| | | | | Bukhara | 0 | c |
| | | | | Bukhara | 1-30 | d |

Rows after unpivot = label rows × value columns: 2 × 2 = 4.

**When you use it.**
- A file with months, products or buckets across the header — the "not a table" of Day 1.
- *Unpivot Other Columns* (select the labels) keeps working when next month adds a column; *Unpivot Columns* (select the values) does not.

**Your turn.** A sheet has 5 product rows and 34 month columns. You select `product` and choose Unpivot Other Columns. How many rows come out?

```task
{"id": "w04d3-l14", "kind": "number", "answer": 170, "dp": 0, "unit": "rows", "hint": "One row per old cell.", "model": "5 × 34 = 170 — exactly the shape of monthly_disbursements.csv: one row per month × product."}
```

### Merge Queries — a JOIN

**What it is.** **Merge Queries** (*объединить запросы*) joins two queries on a key. It is SQL's `JOIN`; the **Join Kind** dropdown holds week 2's whole chapter.

**How to write it.**

```text
Home → Merge Queries (as New)
  top table:    installments        click installment_id
  bottom table: paid_by_installment click installment_id
  Join Kind:    Left Outer
→ a new column of nested tables → click its expand icon → tick paid
M: = Table.NestedJoin(installments, {"installment_id"}, paid_by_installment, {"installment_id"}, "paid", JoinKind.LeftOuter)
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

> ⚠️ **Watch out.** If the bottom table has two rows for one key, the merge **multiplies** the top rows — the one-to-many trap of week 2. Group By the bottom table to one row per key first.

**Your turn.** Which Join Kind finds the instalments that have **no** payment?

```task
{"id": "w04d3-l15", "kind": "choice", "options": ["Inner", "Left Outer", "Left Anti", "Full Outer"], "answer": 2, "explain": "Left Anti keeps the top rows with no match — the anti-join of week 2, in one dropdown."}
```

### Append Queries — a UNION ALL

**What it is.** **Append Queries** (*добавить запросы*) stacks the rows of two or more queries into one. It is SQL's `UNION ALL`: duplicates stay, and columns are matched **by name**.

**How to write it.**

```text
Home → Append Queries (as New) → Two tables / Three or more → pick the queries
M: = Table.Combine({payments_tashkent, payments_other})
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

```task
{"id": "w04d3-l16", "kind": "choice", "options": ["6 rows, one amount column", "6 rows, two columns amount and Amount, each with 3 nulls", "3 rows — duplicates are removed", "An error"], "answer": 1, "explain": "Append matches columns by name, and M names are case-sensitive. Rename one header first."}
```

### Close & Load, and Refresh

**What it is.** **Close & Load** writes the query's result to the workbook. **Refresh** (Data → Refresh All, Ctrl+Alt+F5) re-reads the source file and replays every step.

**How to write it.**

```text
Home → Close & Load To…
  ◉ Table, New worksheet          → a Table you can SUM, chart, pivot      (like CREATE TABLE AS)
  ◉ Only Create Connection        → no sheet; other queries can use it      (like CREATE VIEW)
  ☐ Add this data to the Data Model
Data → Refresh All                → every query re-reads its Source and re-runs
Data → Queries & Connections → right-click → Properties → Refresh data when opening the file
```

`payments_clean` loads as a 52 850-row Table. Next Monday you save the new export over `payments_dirty.csv`, press Refresh All, and the Table, its formulas and its pivots update.

**When you use it.**
- Load the tables people read; keep helper queries (`paid_by_installment`) as connections only.
- When the file moves: Data → Get Data → Data Source Settings → Change Source, once.

> ⚠️ **Watch out.** A formula typed *inside* a loaded Table next to the query columns stays, but values typed into the query's own columns are overwritten on the next refresh. Never edit a loaded table by hand.

**Your turn.** `paid_by_installment` is only needed to feed the merge. How do you load it?

```task
{"id": "w04d3-l17", "kind": "choice", "options": ["Table on a new worksheet", "Only Create Connection", "Copy and paste as values", "Do not load it — the merge cannot use it then"], "answer": 1, "explain": "Connection only: the query exists and other queries can merge it, but it adds no sheet — a view, not a table."}
```

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

```text
Source                    From Text/CSV → payments_dirty.csv             Power Query: load
Promoted Headers
Changed Type              ids, amount → Whole Number; paid_at → Date      Change Type
Trim method               Transform → Format → Trim                       text steps (TRIM)
Lowercase method          Transform → Format → lowercase                  text steps (LOWER)
bank transfer → transfer  Replace Values, match entire cell               text steps (SUBSTITUTE)
Drop 25 duplicates        installment_id + paid_at + amount               Remove Duplicates (checked with COUNTIFS first)
is_forward_dated          Custom Column [paid_at] > #date(2026,10,1)      Add Column
Close & Load To           Table payments_clean                            Close & Load; Refresh next Monday
```

Read the result with the checklist from the top of the page: spaces 0, case 0, synonyms 0 — `UNIQUE(method)` gives 5; duplicates 0 — 52 850 rows; the 24 forward-dated rows kept and flagged. Section 2 builds exactly this.

**Put the steps in order.**

```game
{"type": "order", "id": "w04d3-g7", "title": "Order the payments pipeline", "items": ["Source: From Text/CSV", "Promoted Headers", "Changed Type", "Trim method", "Lowercase method", "Replace bank transfer → transfer", "Remove Duplicates on installment_id, paid_at, amount", "Close & Load as payments_clean"], "why": "Types first, then text repairs, so the duplicate step compares cleaned values; load last."}
```

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Text repair (TRIM, PROPER, Find & Replace, Text to Columns) — [Master Data Cleaning Essentials on Excel in Just 10 Minutes (Kenji Explains), 03:39](https://youtu.be/jxq4-KSB_OA?t=219&end=350)
- ▶ Remove Duplicates (button, UNIQUE, Power Query; "what counts as a duplicate row") — [Three EASY Ways to Find and Remove Duplicates in Excel (Leila Gharani), 01:15](https://youtu.be/ADArCWLz55Y?t=75&end=146)
- ▶ Power Query (where it is, connect, Applied Steps) — [Power Query for Beginners: Automate Your Excel Work in 25 Mins (Leila Gharani), 04:45](https://youtu.be/x7mzOYEn0XA?t=285&end=402)
- ▶ Power Query (second option, shorter, Get data -> Transform -> Close & Load) — [How to use Microsoft Power Query (Kevin Stratvert), 05:26](https://youtu.be/0aeZX1l4JT4?t=326&end=420)
- ▶ Data cleaning block inside one longer Excel course — [Learn Excel in Under 3 Hours (Alex The Analyst), 1:39:03](https://youtu.be/zXnQNytHCPM?t=5943&end=7066)

- RU workbook `HW 3.1 Excel.xlsx` and `HW_2_Module_3.xlsx` — the original course's cleaning homework (text functions and lookups on a shop file); ours uses the same functions on Nur Finance data.
- *Russian terms:* очистка данных = data cleaning, удалить дубликаты = Remove Duplicates, текст по столбцам = Text to Columns, мгновенное заполнение = Flash Fill, Power Query / Получить и преобразовать = Get & Transform, объединение запросов = Merge Queries, добавление запросов = Append, обновить = Refresh, журнал изменений = change log.

```videoquiz
{"video": "jxq4-KSB_OA", "stops": [{"at": 250, "q": "What does TRIM remove?", "options": ["Every space in the text", "Capital letters", "Spaces at the ends (and doubled spaces inside)", "Line breaks only"], "answer": 2, "explain": "Ends and doubles, not the single spaces between words — Find & Replace on \" \" would remove those too.", "back": 30}, {"at": 300, "q": "Find & Replace with Match entire cell contents ticked: which cells does a search for card leave alone?", "options": ["Cells in capitals", "Cells where card is only part of the text, like discard", "Formulas", "None"], "answer": 1, "explain": "Without that box, card inside discard would be edited too."}, {"at": 345, "q": "What does Text to Columns do?", "options": ["Joins several columns into one", "Converts text to numbers only", "Sorts the column", "Splits one column into several, by a delimiter or fixed width"], "answer": 3, "explain": "applied_at → a date and a time; set the date column's type to YMD on step 3.", "back": 40}]}
```

```videoquiz
{"video": "ADArCWLz55Y", "stops": [{"at": 100, "q": "Remove Duplicates finds two equal rows. Which one stays?", "options": ["The last one", "The first one it meets", "A random one", "Neither"], "answer": 1, "explain": "The first — which is why you sort before the step so the right row comes first.", "back": 25}, {"at": 140, "q": "What decides whether two rows count as duplicates?", "options": ["Always every column", "Only the first column", "The columns you tick", "The cell colour"], "answer": 2, "explain": "Sameness is your definition: tick the identifying columns (phone + birth date), not all of them.", "back": 30}]}
```

```videoquiz
{"video": "x7mzOYEn0XA", "stops": [{"at": 320, "q": "Where does Power Query record what you do?", "options": ["In a macro", "In the Applied Steps pane", "In the Undo list", "Nowhere"], "answer": 1, "explain": "Every click becomes a step, in order, replayed on refresh."}, {"at": 390, "q": "Next Monday's file arrives. What re-runs all the cleaning?", "options": ["Redoing every step by hand", "Copy-paste from last week", "Refresh (Refresh All)", "Ctrl+Z"], "answer": 2, "explain": "Refresh re-reads the file at the Source path and replays the steps.", "back": 40}]}
```

```videoquiz
{"video": "0aeZX1l4JT4", "stops": [{"at": 350, "q": "Get Data → From Text/CSV shows a preview. Which button takes you into the Power Query editor?", "options": ["Load", "Transform Data", "Cancel", "Save As"], "answer": 1, "explain": "Load skips the editor; Transform Data opens it so you can add steps first."}, {"at": 410, "q": "What does Close & Load do?", "options": ["Deletes the query", "Writes the query's result to a sheet (or keeps it as a connection)", "Saves the CSV", "Closes Excel"], "answer": 1, "explain": "Loaded = CREATE TABLE AS; connection only = CREATE VIEW.", "back": 40}]}
```

```videoquiz
{"video": "zXnQNytHCPM", "stops": [{"at": 6200, "q": "Why clean a copy rather than the raw data?", "options": ["Copies open faster", "Excel requires it", "So the raw stays as evidence and the cleaning can be redone", "To save disk space"], "answer": 2, "explain": "Raw stays raw — week 1's rule, again."}, {"at": 6600, "q": "Which function turns jalilova into Jalilova?", "options": ["UPPER", "TRIM", "LEN", "PROPER"], "answer": 3, "explain": "PROPER — for names only; it also turns payme into Payme."}, {"at": 7000, "q": "You have just removed duplicates. What do you check before anything else?", "options": ["The row count before and after, against what you expected", "The font", "The column widths", "Nothing — the tool is reliable"], "answer": 0, "explain": "6 040 → 6 000 means exactly 40 went; 5 998 means two real people did.", "back": 60}]}
```

---

## 2. Worked example — Nilufar's two files (detective, 40 min)

Work on `customers_dirty.csv` and `payments_dirty.csv` from `data/excel/` (the same rows as the `Customers` and `Payments` sheets, as raw files so Power Query has something to import). Grain of each: a customer *row* and a payment *row* — the question is how many *people* and *payments* they represent. The steps follow the order of Learn.

**Step 1 — the dirty-data checklist on Customers**, four formulas on the raw sheet (stray spaces with `LEN`/`TRIM`, case with `EXACT`). *In the box: first names written in ALL CAPS.*

```task
{"id": "w04d3-d1", "kind": "number", "answer": 22, "dp": 0, "hint": "EXACT against UPPER, inside SUMPRODUCT(--…).", "explain": "=SUMPRODUCT(--EXACT(B2:B6041, UPPER(B2:B6041))) → 22. With = instead of EXACT every name would 'equal' its upper-case copy."}
```

<details><summary>Result</summary>

Trailing spaces in `first_name` `=SUMPRODUCT(--(LEN(B2:B6041)<>LEN(TRIM(B2:B6041))))` → **18**; all-caps first names `=SUMPRODUCT(--EXACT(B2:B6041, UPPER(B2:B6041)))` → **22**; all-lower surnames `=SUMPRODUCT(--EXACT(C2:C6041, LOWER(C2:C6041)))` → **40**; ids above 6 000 → **40**. The 22 + 18 = 40 first-name oddities and the 40 lower-case surnames land on the same 40 rows — ids 6001–6040. Suspicious; not yet proof.

</details>

**Step 2 — prove the duplicates** with a **matching key** and **COUNTIFS on the key** (n and rank), first on names, then a second key on `phone|birth_date`. *In the box: how many pairs the phone|birth_date key finds.*

```task
{"id": "w04d3-d2", "kind": "number", "answer": 40, "dp": 0, "unit": "pairs", "explain": "Phone key: 80 rows with n = 2, i.e. 40 pairs — ids 6001–6040 and their originals. The name key finds 42: the two extra pairs are namesakes."}
```

<details><summary>Result</summary>

Name key: 84 rows in 42 pairs. Phone key: 80 rows in **40** pairs — exactly ids 6001–6040 paired with their originals (6001 `MALIKA jalilova` ↔ 4516 `Malika Jalilova`, same phone +998908981002, same birth date 1981-08-15, same income). The two name-only pairs (823/1197, 2460/5562) have different phones and regions — namesakes, keep both. Ten of the 40 duplicates were registered in 2026, so "new customers 2026" (955 by `registered_at`) is overstated by 10 — week 1's memo line, now a filter.

</details>

**Step 3 — impossible dates.** A column `age` `=DATEDIF(E2, DATE(2026,10,1), "y")` (Sheets: same), then filter `age < 18` or `age > 100` — the **dates** subsection's impossible values. *In the box: how many impossible birth dates.*

```task
{"id": "w04d3-d3", "kind": "number", "answer": 7, "dp": 0, "hint": "DATEDIF returns #NUM! for a birth date in the future — count the errors too.", "explain": "4 in the future (927, 2338, 3380, 964) + 3 at 1900-01-01 (957, 1020, 2934)."}
```

<details><summary>Result</summary>

**7** rows: four in the future (ids 927, 2338, 3380 born 2031-04-12 → age −5; 964 born 2027-02-28 → −1) and three at 1900-01-01 (957, 1020, 2934 → age 126). `DATEDIF` with a future date returns `#NUM!`, so in Excel the −5 shows as an error — filter errors with `ISERROR`, or use `=YEARFRAC(E2, DATE(2026,10,1))` which goes negative. Valid customers average 45.2 years. Fix: blank the seven dates and add a flag column `birth_date_invalid` = TRUE — never invent a date.

</details>

**Step 4 — Payments: a key, n and rank, and the text inventory.** Key `=C2&"|"&TEXT(D2,"yyyy-mm-dd")&"|"&E2` (instalment, day, amount), `n` and `rank` columns (**COUNTIFS on the key**); and the method inventory with `=UNIQUE(F2:F52876)` before and after **TRIM / LOWER / SUBSTITUTE**. *In the box: Σ amount of the extra (rank = 2) rows, in soum.*

```task
{"id": "w04d3-d4", "kind": "number", "answer": 58397800, "dp": 0, "unit": "UZS", "hint": "SUMIFS on amount with the rank column = 2.", "explain": "25 extra rows, Σ 58 397 800 — the gap on Timur's tile."}
```

<details><summary>Result</summary>

`n > 1` → **50** rows in **25** pairs; `rank = 2` → the 25 extra rows, Σ amount **58 397 800** — the gap on Timur's tile. All 25 repeats are `payment_id` 52 851–52 875 — they were appended to the export in one batch. Do not rely on that: sameness is the three columns, not the id range. Methods: **10** distinct raw (`card`, `cash`, `transfer`, `payme`, `click`, `Card` 57, `Click` 36, `PayMe` 30, `CASH ` 30, `bank transfer` 27 — the **180** dirty rows); `UNIQUE(LOWER(TRIM(…)))` → 6; with the `bank transfer` replacement → **5**: card 17 621 · payme 8 900 · click 8 790 · cash 8 790 · transfer 8 774.

</details>

**Step 5 — build it once in Power Query** (the worked pipeline for `payments_dirty.csv`; `Customers` is HW 4.2). Each line is one step from Learn — **Change Type**, the **text steps**, **Remove Duplicates**, **Close & Load**:

```text
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

`=ROWS(payments_clean)` → **52 850**; `=SUM(payments_clean[amount])` → **255 114 772 176** (raw was 255 173 169 976; difference 58 397 800); `=ROWS(UNIQUE(payments_clean[method]))` → **5**; `=COUNTIFS(payments_clean[paid_at], ">"&DATE(2026,10,1))` → 24 forward-dated rows (53 438 947) — *not* removed here (they are real payments recorded with a future date; filter them where an as-of matters, as week 3 did). Change the Remove Duplicates step to all columns and the count is 52 875 again — the pane lets you try and undo. Then Data → **Refresh All** with the file untouched: the same 52 850. That is the deliverable.

</details>

---

## 3. Practice (45 min)

File `week-04/day-3/practice.xlsx`: raw sheets untouched, a sheet per task or a Power Query per task. State the count you got next to each. Then type the count in the box under the question; it checks it and shows the full answer. The questions follow the order of Learn.

**P1.** *(the dirty-data checklist)* On a copy of `Payments`, list the raw spellings of `method` with `=UNIQUE(tblPayments[method])` and count each with `COUNTIFS`. *In the box: how many distinct raw spellings.*

```task
{"id": "w04d3-p12", "kind": "number", "answer": 10, "dp": 0, "unit": "spellings", "explain": "10: card 17 564 · payme 8 870 · cash 8 760 · click 8 754 · transfer 8 747 · Card 57 · Click 36 · PayMe 30 · CASH  30 · bank transfer 27. Note that COUNTIFS(…, \"card\") returns 17 621 for both card and Card — criteria ignore case, so count with EXACT if you need the raw split. Five clean values hide behind ten spellings: case (123 rows), a stray space (30) and a synonym (27) = the 180 dirty rows."}
```

**P2.** *(Find & Replace)* Ctrl+H on a *copy* of `Payments`: replace `bank transfer` with `transfer` (match entire cell). How many replacements? Then try `PayMe` → `payme` with and without *Match case*. Why does the second run report 8 900 without it? *In the box: replacements in the first run.*

```task
{"id": "w04d3-p1", "kind": "number", "answer": 27, "dp": 0, "explain": "27. Without Match case, payme matches PayMe and the 8 870 payme rows — Excel replaces all 8 900 (harmless here, but 8 900 lines in a log for 30 real changes). Tick Match case → 30. Find & Replace ignores case by default, like the rest of Excel."}
```

**P3.** *(Text to Columns · Split Column)* Text to Columns on a copy of `applications.csv`'s `applied_at`: date and time in two columns, the date typed YMD. Count applications submitted in September 2026 from the date column with the half-open filter — and with `BETWEEN`-style `<= 30 Sep`. *In the box: September 2026 applications on the date column.*

```task
{"id": "w04d3-p2", "kind": "number", "answer": 621, "dp": 0, "unit": "applications", "explain": "621 both ways now — the time is split off, so <= DATE(2026,9,30) is safe on the date column. On the original datetime column <= DATE(2026,9,30) gives 598: 23 applications after midnight on the 30th are lost. The half-open form works on both columns; use it everywhere. In Power Query the same cut is Split Column → By Delimiter → Space, and it re-runs."}
```

**P4.** *(Flash Fill)* Next to `first_name`, type the cleaned name for row 6001 (`Malika`) and press Ctrl+E. Check the column against `=PROPER(TRIM(B2))` with a mismatch count. What did Flash Fill guess wrong, if anything, and why would you not ship it? *In the box: your mismatch count, and in one or two sentences why you would not ship Flash Fill.*

```task
{"id": "w04d3-p5", "kind": "free", "min": 20, "model": "Usually 0–3 mismatches (it may keep 'Bobur ' with its space, or capitalise after an apostrophe differently). Even at 0 there is no formula behind the cells, so next Monday's file gets nothing — Flash Fill is for a one-off column you paste as values and never update.", "rubric": ["gives a mismatch count from your own sheet", "says no formula or step is left behind", "says the next file would not be cleaned"]}
```

**P5.** *(TRIM, SUBSTITUTE)* On `tblPayments`, a calculated column `method_clean` = `=SUBSTITUTE(LOWER(TRIM([@method])), "bank transfer", "transfer")`, then a `COUNTIFS` per clean value. *In the box: how many rows say `cash` in `method_clean`.*

```task
{"id": "w04d3-p13", "kind": "number", "answer": 8790, "dp": 0, "unit": "rows", "hint": "TRIM is what brings the 'CASH ' rows in.", "explain": "8 790 = 8 760 'cash' + 30 'CASH '. A plain COUNTIFS(tblPayments[method], \"cash\") gives 8 760: it ignores case but not the trailing space. transfer: 8 747 + 27 = 8 774. These counts still include the 25 duplicate payments — the clean table has cash 8 788."}
```

**P6.** *(dates stored as text · DATEVALUE)* Paste `1981-08-15` as text into a cell (type an apostrophe first), prove it is text with `ISTEXT`, convert with `DATEVALUE`, and compute the age. Then try `15.08.1981` and `08/15/1981` — which converts on your machine? *In the box: the age on 2026-10-01.*

```task
{"id": "w04d3-p3", "kind": "number", "answer": 45, "dp": 0, "unit": "years", "explain": "ISTEXT → TRUE; =DATEVALUE(A1) → 29 813 (format as a date → 1981-08-15); =DATEDIF(DATEVALUE(A1), DATE(2026,10,1), \"y\") → 45. Which of 15.08.1981 and 08/15/1981 converts depends on your Windows regional format — one returns #VALUE!. That is why ISO is the export rule."}
```

**P7.** *(a matching key · COUNTIFS on the key)* On `Customers`, a third key on `phone` alone, with an `n` column. Compare with the `phone|birth_date` key of the Worked example. *In the box: how many rows have n > 1 on the phone-only key.*

```task
{"id": "w04d3-p14", "kind": "number", "answer": 86, "dp": 0, "unit": "rows", "hint": "=COUNTIFS($K$2:$K$6041, K2) on the phone column, then count the rows where it is above 1.", "explain": "86 rows in 43 pairs: the 40 true duplicates (80 rows) plus 3 phone numbers shared by two different people — family members with different birth dates. phone|birth_date finds 80 rows; the name key finds 84 (two namesake pairs). Every key has false positives; the one built on identifying fields has the fewest."}
```

**P8.** *(Remove Duplicates)* The three Remove Duplicates runs on copies of `Customers` from Learn (raw names; trimmed names; phone + birth date). Report the three "removed" counts and which run deletes real people. *In the box: the count Excel reports for the first run (raw names).*

```task
{"id": "w04d3-p4", "kind": "number", "answer": 24, "dp": 0, "unit": "removed", "explain": "24 / 42 / 40. Run 1 misses the trailing-space duplicates; run 2 also deletes the two namesakes (1197 and 5562 go — the tool keeps the first of each pair); only run 3 removes exactly the 40 true duplicates. Sameness is defined on identifying fields, checked with a count before deletion, and executed as a recorded step."}
```

**P9.** *(Power Query: Change Type, text steps, Add Column, Remove Duplicates)* Power Query on `customers_dirty.csv`: types (phone as Text), Trim + Capitalize Each Word on the names, a custom column `birth_date_invalid` = `[birth_date] > #date(2026,10,1) or [birth_date] < #date(1920,1,1)`, then Remove Duplicates on `phone`, `birth_date`. Load and count. *In the box: distinct phones in customers_clean.*

```task
{"id": "w04d3-p6", "kind": "number", "answer": 5997, "dp": 0, "explain": "6 000 rows; =COUNTIFS(customers_clean[birth_date_invalid], TRUE) → 7; =ROWS(UNIQUE(customers_clean[phone])) → 5 997 (three family numbers). Capitalize Each Word gives Malika Jalilova — apply it to the name columns only. Add birth_date_clean = null when invalid, so the age band gets a blank, not −5."}
```

**P10.** *(Filter Rows)* On `payments_clean`, add a step Filter Rows → `paid_at` on or before 2026-10-01. *In the box: the rows the filter keeps.*

```task
{"id": "w04d3-p15", "kind": "number", "answer": 52826, "dp": 0, "unit": "rows", "explain": "52 850 − 24 forward-dated rows = 52 826. Filter in a duplicate of the query (right-click → Reference) so payments_clean itself keeps the 24 rows with their is_forward_dated flag; the as-of cut belongs to the reports that need it, like paid_by_installment in P13."}
```

**P11.** *(Group By · QUERY)* Group By in Power Query on `payments_clean`: method → count and sum. Then the same with `QUERY` in Sheets (or `COUNTIFS`/`SUMIFS` on the loaded table). Five rows? *In the box: the card count.*

```task
{"id": "w04d3-p7", "kind": "number", "answer": 17612, "dp": 0, "unit": "payments", "explain": "card 17 612 / 84 747 182 579 · payme 8 897 / 42 929 061 915 · cash 8 788 / 41 431 864 371 · click 8 786 / 42 977 555 023 · transfer 8 767 / 43 029 108 288; Σ 52 850 / 255 114 772 176. Same shares as week 2, but each count a few rows lower: today you also removed the 25 duplicate payments."}
```

**P12.** *(Unpivot)* Monday's bucket matrix (Day 1's Worked example: 8 regions down, 5 buckets across) arrives as a sheet. Load it into Power Query, select `region`, Unpivot Other Columns, rename the columns `bucket` and `outstanding`. *In the box: how many rows come out.*

```task
{"id": "w04d3-p16", "kind": "number", "answer": 40, "dp": 0, "unit": "rows", "hint": "One row per cell of the matrix — leave the total row and column out.", "explain": "8 regions × 5 buckets = 40 rows; Σ outstanding still 208 723 504 430. If you got 54, the total column and the total row came along: 9 rows × 6 columns. Delete totals before unpivoting — they are not data."}
```

**P13.** *(Merge Queries = join)* A query `paid_by_installment` = `payments_clean` filtered `paid_at <= 2026-10-01`, grouped by `installment_id` → `paid`; merge it into `installments.csv` (Left Outer, key `installment_id`), expand `paid`, replace null with 0, and name the merged query `installments_paid` (tomorrow and Friday reuse it). Count matured instalments (`due_date <= 2026-10-01`) with `paid < total_due`. *In the box: matured instalments not fully paid.*

```task
{"id": "w04d3-p8", "kind": "number", "answer": 1784, "dp": 0, "hint": "Check the row count after the merge first: it must still be 92 193.", "explain": "92 193 rows after the merge (Left Outer keeps every instalment; Inner would drop the unpaid ones, which are the point). Matured: 54 207; 1 784 not fully paid, 403 of them partly paid. Instalments with paid > total_due: 0 after the dedup, 25 before it — the duplicates were the only over-payments in the book."}
```

**P14.** *(Append Queries = union)* Split `payments_clean` into two queries by region (Tashkent / everyone else), then Append them back. Rows? Now add a `source` column to each before appending — what is that for? *In the box: the Tashkent query's rows.*

```task
{"id": "w04d3-p9", "kind": "number", "answer": 20437, "dp": 0, "unit": "rows", "explain": "20 437 + 32 413 = 52 850 (7 of the 25 duplicates were Tashkent's). Append is UNION ALL: it does not deduplicate and it matches columns by name — Amount in one file and amount in the other become two columns full of nulls. The source column tells you which monthly file a row came from after twelve appends."}
```

**P15.** *(Close & Load, Refresh)* Refresh test: with the pipeline loaded, open `payments_dirty.csv` in a text editor, duplicate the **last line** once more, save, Refresh All. What do the counts do? Undo the edit and refresh again. *In the box: payments_clean rows after the refresh with the extra line.*

```task
{"id": "w04d3-p10", "kind": "number", "answer": 52850, "dp": 0, "unit": "rows", "explain": "Raw 52 876, clean still 52 850 — the new line is a third copy of a known duplicate, Σ unchanged. Undo, refresh → 52 875 / 52 850. The cleaning is a property of the query, not of the file."}
```

> 🚀 **Stretch (optional, +5 XP).** **P16.** *(Add Column · Group By on a merged query)* Group By month on the merged `installments_paid` query from P13: Σ `total_due`, Σ `paid`, and a rate column — the collection rate for every month of 2026. Where does it drop and why is the September figure *expected* to be lower? *In the box: September's rate, % with 1 decimal.*

```task
{"id": "w04d3-p11", "kind": "number", "answer": 94.1, "dp": 1, "unit": "%", "xp": 2, "explain": "Jan 97.3 % · Feb 97.0 · Mar 96.8 · Apr 96.9 · May 97.1 · Jun 96.9 · Jul 96.7 · Aug 96.5 · Sep 94.1 %. September's instalments had at most 30 days to be paid by 1 October, the others 60–270: the latest month always reads low until it matures — compare months at the same age, or wait a month."}
```

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

```task
{"id": "w04d3-hw1", "kind": "number", "answer": 5997, "dp": 0, "explain": "=ROWS(UNIQUE(customers_clean[phone])) → 5 997: three phone numbers are shared by family members, which is why phone alone is not the key — phone + birth_date is."}
```

**K2.** In `customers_clean`: how many blank `monthly_income` cells?

```task
{"id": "w04d3-hw2", "kind": "number", "answer": 354, "dp": 0, "hint": "COUNTBLANK. If you get 0, your blanks became zeros.", "explain": "356 in the raw file, 354 after the dedup — two blanks belonged to removed duplicates. 0 means the type step turned blanks into 0: a zero income is a statement, a blank is a gap."}
```

**K3.** In `payments_clean`: Σ amount of the rows flagged `is_forward_dated`.

```task
{"id": "w04d3-hw3", "kind": "number", "answer": 53438947, "dp": 0, "unit": "UZS", "explain": "24 rows, Σ 53 438 947 — kept and flagged, excluded only where an as-of date matters."}
```

**K4.** In `payments_clean`: how many `cash` payments?

```task
{"id": "w04d3-hw4", "kind": "number", "answer": 8788, "dp": 0, "explain": "8 760 'cash' + 30 'CASH ' = 8 790 before the dedup; two of the 25 duplicates were cash → 8 788. If you get 8 760, Trim or lowercase did not run before the count."}
```

### 📎 Hand in here

```sqltask
{"check": "handin-W4D3", "lesson": "W4D3", "title": "HW 4.2", "why": "The export arrives dirty every Monday; a pipeline that cleans it on Refresh — with a log Timur can rebuild it from — replaces an afternoon of hand edits nobody can check.", "graded": ["counts match: 6 000 customers, 7 invalid birth dates, 52 850 payments, 5 methods, 25 duplicates removed", "Refresh All reproduces them from the CSVs — the reviewer will refresh", "the change log is specific enough to rebuild the pipeline without opening the file"], "tasks": [{"id": "cleaning.xlsx", "file": "cleaning.xlsx", "names": ["cleaning.xlsx"], "upload": true, "accept": ".xlsx", "q": "Attach `cleaning.xlsx` — what the page above asks for."}, {"id": "change_log.md", "file": "change_log.md", "text": true, "minLines": 3, "q": "Write `change_log.md` here — what the page above asks for."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else the page lists (one more file, or a .zip of several)."}]}
```

---

## 5. Self-check

```check
{"id": "w04d3-sc", "questions": [
  {"type": "multi", "q": "Remove Duplicates on first_name, last_name, birth_date removes 24 rows on the raw sheet and 42 after TRIM; the truth is 40. Which two facts explain it?", "options": ["It compares spaces exactly, so trailing-space duplicates survive on the raw names", "Name + birth date also matches two pairs of different people (namesakes)", "It is case-sensitive", "It only looks at the first ticked column"], "answer": [0, 1], "explain": "Space-sensitive and case-insensitive; a loose key deletes real people (→ section 1, Remove Duplicates — and why it lies; P8)."},
  {"type": "single", "q": "Which Power Query step is a LEFT JOIN, and what do you check right after it?", "options": ["Append Queries; the column count", "Merge Queries with Left Outer; that the row count still equals the left table's (92 193 instalments)", "Group By; the sum", "Merge Queries with Inner; that unpaid instalments are gone"], "answer": 1, "explain": "Count rows after every merge; Inner would drop exactly the unpaid instalments you are looking for (→ section 1, Merge Queries; P13)."},
  {"type": "single", "q": "A date column is left-aligned and \">=\"&DATE(2026,1,1) finds nothing. What happened?", "options": ["The dates are stored as text — convert with DATEVALUE/VALUE, Text to Columns (YMD) or Changed Type → Date", "The column is filtered", "The criterion needs quotes around DATE", "Excel cannot compare dates"], "answer": 0, "explain": "Text never compares as a date; test with ISTEXT / ISNUMBER (→ section 1, Dates stored as text)."},
  {"type": "number", "q": "Column L holds the keys A, B, A, C, A in L2:L6. What does the rank formula in N4 return?", "code": "N4: =COUNTIFS($L$2:L4, L4)", "answer": 2, "explain": "$L$2:L4 holds A, B, A — the second A so far (→ section 1, COUNTIFS on the key)."}
]}
```

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

```game
{"type": "order", "id": "w04d3-g5", "title": "Put the collection-rate pipeline in order", "items": ["Filter payments_clean to paid_at <= 2026-10-01", "Group By installment_id: paid = Sum(amount)", "Merge into installments (Left Outer on installment_id)", "Replace null paid with 0", "Add due_month = Start of Month(due_date)", "Group By due_month: Σ total_due, Σ paid", "rate = paid ÷ due"], "why": "Cut at the as-of before summing, keep every instalment in the join, and divide sums — never average rates."}
```

**My number: 94.1 %** for September 2026 — identical to week 3's SQL, as it must be: same rows, same rule, different tool. Three alternatives give different numbers, and each is a defensible *other* definition, not an error — as long as it is written down:

- Use the **dirty** payments (duplicates in): 15 982 758 126 → still 94.1 % (one duplicated September payment, 639 200). Harmless this month; 58 m over the book.
- **Received in the month ÷ due in the month** (cash-basis — all September payments, whatever instalment they belong to): 16 338 823 207 / 16 987 977 718 = **96.2 %**. Higher, because September received early payments of October instalments and late payments of August ones. Finance often means this one.
- Collected **through today** rather than through the as-of: the 24 forward-dated rows lift August to 96.8 % and leave June, July and September unchanged at one decimal — small here, but a report "as of" a date must not contain payments dated after it.

Which one goes on the board? The first, with its as-of, because it answers "of what fell due, how much came in" — the inflow to Sevara's 1–30 bucket is the 5.9 % that did not. The cash-basis one answers "how much money arrived" — Finance's cash-flow question. Put the definition in the tile's footnote: *collected by 2026-10-01 on instalments due in the month ÷ total due; payments de-duplicated.* One sentence, and Finance and Collections stop arguing about 2.1 points.

The Sheets version: a `Clean` tab for payments, a tab `Inst` with `=SUMIFS(Clean!E:E, Clean!C:C, A2, Clean!D:D, "<="&DATE(2026,10,1))` per instalment (slow on 92 193 rows — do it once, paste values, note it in the log), then `=QUERY(Inst!A1:I, "select H, sum(G), sum(I) group by H", 1)` on a `due_month` column.

> 🎯 **Interview version.** *"What is a collection rate and how do you compute it from payments and a schedule?"* — Σ paid ÷ Σ due for instalments due in the period; paid comes from de-duplicated payments joined on the instalment id with an as-of cut-off; say whether it is instalment-basis or cash-basis; expect the latest month to read low until it matures; reconcile the join by row count (every instalment kept) before dividing.

**Say it like in an interview.** The CFO, in the corridor: *"Collections say September was 94.1 %, Finance says 96.2 %. Which is the collection rate?"* Answer in 30 words or more.

```task
{"id": "w04d3-cc", "kind": "free", "min": 30, "model": "Both, on two bases. 94.1 % is instalment basis: of the 16.99 bn that fell due in September, 15.98 bn was paid by 1 October, de-duplicated payments only. 96.2 % is cash basis: all money received in September, including early October and late August instalments, over the same amount due. Collections need the first — the unpaid 5.9 % is next month's 1–30 bucket; Finance's cash flow needs the second. I'd show one with its definition under the tile.", "rubric": ["names both bases: instalment basis vs cash basis", "explains what each numerator contains", "says which question each answers (collections inflow vs cash received)", "proposes writing the definition under the tile"]}
```

Tomorrow: PivotTables and charts — Madina's one page for the board, built on the clean tables.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w04d3", "pass": 0.8, "questions": [
  {"type": "single", "q": "You tick first_name, last_name, birth_date on the raw Customers sheet and run Remove Duplicates. Why does it miss some true duplicates?", "options": ["It only checks the first 1 000 rows", "It ignores case but not spaces, so 'Bobur ' and 'Bobur' stay different rows", "It is case-sensitive, so MALIKA and Malika stay apart", "It removes the first copy instead of the second"], "answer": 1, "explain": "Remove Duplicates compares exactly as displayed, case-insensitively and space-sensitively; TRIM before matching (→ section 1, Remove Duplicates — and why it lies; P8)."},
  {"type": "single", "q": "Why does the matching key put a separator between the parts?", "code": "=LOWER(TRIM(B2))&\"|\"&LOWER(TRIM(C2))&\"|\"&TEXT(E2,\"yyyy-mm-dd\")", "options": ["Excel needs it to join text", "Without it, different names can glue into the same key: 'Ali'&'Nazarov' = 'Alin'&'azarov'", "It makes the key case-insensitive", "COUNTIFS cannot read keys without |"], "answer": 1, "explain": "A separator keeps the parts apart, so only true matches share a key (→ section 1, A matching key)."},
  {"type": "single", "q": "In N2, filled down the sheet, what does this formula return?", "code": "=COUNTIFS($L$2:L2, L2)          (column L holds the key)", "options": ["How many rows in the whole sheet share the key", "1 for the first occurrence of a key, 2 for the second, … — Excel's ROW_NUMBER() OVER (PARTITION BY key)", "The row number", "TRUE when the key is unique"], "answer": 1, "explain": "The range grows row by row ($L$2 pinned, L2 free), so it counts how many times the key has appeared so far; filter rank = 2 to look at the extras before deleting (→ section 1, COUNTIFS on the key)."},
  {"type": "single", "q": "On Payments you tick ALL columns in Remove Duplicates 'to be safe'. Why is nothing removed?", "options": ["Payments has no duplicates", "payment_id differs on every row, so no two rows are equal on all columns; sameness must be defined on installment_id, paid_at and amount", "Remove Duplicates does not work on numbers", "The table must be sorted first"], "answer": 1, "explain": "A duplicate is two rows that agree on everything that matters, not on everything (→ section 1, Remove Duplicates — the recorded step; Mistakes that cost a point)."},
  {"type": "multi", "q": "Which Power Query steps are matched with the right SQL idea?", "options": ["Merge Queries, join kind Left Outer = LEFT JOIN", "Append Queries = UNION ALL", "Merge Queries, join kind Left Anti = rows with no match (anti-join)", "Append Queries removes duplicate rows, like UNION", "Changed Type = WHERE"], "answer": [0, 1, 2], "explain": "Append keeps every row and matches columns by name; Changed Type is CAST (→ section 1, Merge Queries, Append Queries; P14)."},
  {"type": "number", "q": "A customer was born on 2000-10-02. What age does the formula give as of 2026-10-01?", "code": "=DATEDIF(DATE(2000,10,2), DATE(2026,10,1), \"y\")", "answer": 25, "explain": "\"y\" counts completed years; the 26th birthday is one day after the as-of date (→ section 2, step 3; P6)."},
  {"type": "single", "q": "A customer's birth date is 2031-04-12. What goes into customers_clean?", "options": ["A plausible date such as 1981-04-12", "The birth date left blank, with birth_date_invalid = TRUE", "Delete the customer", "Today's date"], "answer": 1, "explain": "Blank + flag, never a guess: an invented date would flow into age bands as if it were real (→ section 2, step 3; P9)."},
  {"type": "single", "q": "The collection rate for instalments due in September (as of 1 October) is lower than for June–August. Why is that expected?", "options": ["September is always a bad month", "September's instalments have had at most 30 days to be paid, the earlier months much longer; the latest month reads low until it matures", "Duplicates were removed only for September", "The cash-basis rate was used for September"], "answer": 1, "explain": "Compare months at the same age, or wait a month (→ section 6, Company corner; P16)."}
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
