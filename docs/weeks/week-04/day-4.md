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
  [x] product  [x] outstanding  [ ] region  [ ] status …     the source table's columns
  Filters: (empty)                Columns: (empty)
  Rows:    product                Values:  Sum of outstanding
```

The picture — six source rows become three pivot rows and a total:

```text
SOURCE: 6 rows                     PIVOT: Rows product, Values Sum of outstanding
product    outstanding             Row Labels     Sum of outstanding
SME        300                     Consumer        40
Micro        5            →        Micro           10
SME        150                     SME            450
Micro        5                     Grand Total    500
Consumer    40
Micro        0
```

On `tblLoans`, the same drag gives five product rows and a **Grand Total of 208 723 504 430** — the whole book, the same number as `=SUM(tblLoans[outstanding])`. The Grand Total is the pivot's check.

**Sheets:** select the data → Insert → **Pivot table**; the editor on the right has the same four areas.

**When you use it.**
- Any "per group" question: per product, per region, per month.
- When the reader wants to re-cut the numbers by clicking, not by asking you for a new formula.

| `SUMIFS` per label (Monday) | Pivot (today) |
|---|---|
| you type the labels, one formula per cell | the labels appear by themselves |
| any layout, any formula | rows × columns, built-in aggregates |
| recalculates at once | needs **Refresh** after the data changes |

**Your turn.** You build a pivot on `tblLoans` with `region` in Rows and Sum of `outstanding` in Values. How many rows does it have, not counting the Grand Total?

```task
{"id": "w04d4-l1", "kind": "number", "answer": 8, "dp": 0, "unit": "rows", "hint": "One row per distinct value of the Rows field.", "model": "8 — one row per region (Tashkent, Fergana, Samarkand, Andijan, Namangan, Bukhara, Nukus, Termez). A pivot row is a GROUP BY group."}
```

### Rows and Values — the group and the aggregate

**What it is.** A field in **Rows** (*Строки*) is a `GROUP BY` key: each distinct value becomes one row. A field in **Values** (*Значения*) is aggregated per row. A number field becomes *Sum of …*; a text field becomes *Count of …*.

**How to write it.**

```text
Rows:    product                     → GROUP BY product
Values:  outstanding  (Sum)          → SUM(outstanding)
         loan_id      (Count)        → COUNT(*)        drag a field to Values twice to see it twice
```

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

```task
{"id": "w04d4-l2", "kind": "choice", "options": ["Nothing — the sum of the ids is the number of loans", "Change it to Count in Value Field Settings: an id is a label, and adding ids means nothing", "Move loan_id to Rows", "Delete the pivot and use COUNTIFS"], "answer": 1, "explain": "Excel sums every number field by default. An id is a name for a row, so the meaningful aggregate is Count: 7 828."}
```

### Columns and Filters — the cross-tab and the page WHERE

**What it is.** A field in **Columns** (*Столбцы*) is a second `GROUP BY` key spread across the top: the pivot becomes a **cross-tab**. A field in **Filters** (*Фильтры*) is a `WHERE` the reader can change: it sits above the pivot as a dropdown and decides which source rows are used at all.

**How to write it.**

```text
Filters: status = active             → WHERE status = 'active'
Rows:    product                     → GROUP BY product,
Columns: region                      →          region   (as a cross-tab)
Values:  outstanding  (Sum)
```

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

```game
{"type": "sort", "id": "w04d4-g5", "title": "Which area does it?", "q": "SELECT product, bucket, COUNT(*) FROM loans WHERE status = 'active' GROUP BY product, bucket — as a cross-tab with products down the side.", "groups": {"Rows": ["product (down the side)"], "Columns": ["bucket (across the top)"], "Values": ["COUNT(*) — Count of loan_id"], "Filters": ["WHERE status = 'active'"]}}
```

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

```task
{"id": "w04d4-l3", "kind": "choice", "options": ["5", "3.3", "10", "2.5"], "answer": 1, "explain": "Micro has three rows: 5, 5 and 0. (5 + 5 + 0) ÷ 3 = 3.3. The closed loan at 0 pulls the average down — the trap in the Watch out."}
```

### Show Values As — % of Grand Total, of Column, of Row, of Parent

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

```task
{"id": "w04d4-l4", "kind": "choice", "options": ["% of Grand Total", "% of Column Total", "% of Row Total", "% of Parent Row Total"], "answer": 2, "explain": "Fergana is a row; the share is taken within that row, across the buckets. % of Column Total would answer 'of the 90+ loans, what share is Fergana's'."}
```

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

```game
{"type": "match", "id": "w04d4-g1", "title": "Show Values As ↔ the SQL you wrote in week 3", "pairs": [["% of Grand Total", "SUM(x) / SUM(SUM(x)) OVER ()"], ["% of Parent Row Total", "SUM(x) / SUM(SUM(x)) OVER (PARTITION BY region)"], ["Running Total In", "SUM(SUM(x)) OVER (ORDER BY month)"], ["Difference From (previous)", "SUM(x) − LAG(SUM(x)) OVER (ORDER BY month)"], ["Rank Largest to Smallest", "RANK() OVER (ORDER BY SUM(x) DESC)"]]}
```

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

```task
{"id": "w04d4-l5", "kind": "choice", "options": ["Only January 2026", "January of every year in the data — 2024, 2025 and 2026 added together", "An error", "Only the first January in the data"], "answer": 1, "explain": "Months without Years groups by the month name alone, so three Januaries are added up. Tick Years too."}
```

### Slicers and timelines — filters the reader clicks

**What it is.** A **slicer** (*Срез*) is a panel of buttons that filters a pivot by one field. A **timeline** (*Временная шкала*) is a slider that filters by a date range: months, quarters or years. One slicer can drive several pivots at once — that is what makes a page a dashboard.

**How to write it.**

```text
Click a pivot → PivotTable Analyze → Insert Slicer → tick region → OK
Click a pivot → PivotTable Analyze → Insert Timeline → tick disbursed_at → OK
Right-click the slicer → Report Connections → tick every pivot it must filter
Clear: the funnel-with-a-cross icon in the slicer's corner
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

```task
{"id": "w04d4-l6", "kind": "choice", "options": ["Insert a second slicer and click both", "Right-click the slicer → Report Connections → tick the second pivot", "Put region in the second pivot's Filters", "Group the two pivots"], "answer": 1, "explain": "Report Connections lists every pivot built on the same source; ticked ones obey the slicer."}
```

### A calculated field — a ratio of sums

**What it is.** A **calculated field** (*Вычисляемое поле*) is a new Values field computed from the **sums** of other fields: `= outstanding / principal` is `SUM(outstanding) / SUM(principal)` per row of the pivot. That is a **ratio of sums** — the correct way to show a rate for a group.

**How to write it.**

```text
PivotTable Analyze → Fields, Items & Sets → Calculated Field
  Name:     share_left
  Formula:  = outstanding / principal          field names; each one means "the SUM of this field in this row"
  → Add → OK, then format it 0.0% in Value Field Settings
```

On the small table, Rows `product`:

| product | Σ outstanding | Σ principal | calculated `share_left` (ratio of sums) | Average of per-loan ratios |
|---|---|---|---|---|
| Micro | 10 | 24 | **41.7 %** | 37.5 % (50 %, 62.5 %, 0 %) |
| SME | 450 | 600 | **75.0 %** | 75.0 % |
| Consumer | 40 | 50 | **80.0 %** | 80.0 % |

The Average of per-loan ratios weights a 6-million loan like a 10-million one. The ratio of sums weights each loan by its size.

On `tblLoans`, with Tuesday's `rate` column: a calculated field `run_rate = outstanding * rate / 12` by product adds up to **4 491 202 901** soum of interest a month — the same as Tuesday's `SUMPRODUCT`. **Sheets:** Values → Add → *Calculated field*.

**When you use it.**
- A rate for a group: collected ÷ due, outstanding ÷ principal, interest ÷ outstanding.
- Any time the sentence says "rate" or "share" of totals.

> ⚠️ **Watch out.** A calculated field sees **sums only** — there is no `COUNT` inside it. `avg_ticket = principal / loan_id` divides the sum of principal by the **sum of the ids**: on the small table, Micro gives 24 ÷ (2 + 4 + 6) = 2 instead of 8. No error appears. Use *Average of principal* in Values instead.

**Your turn.** On the small table, what does the calculated field `avg_ticket = principal / loan_id` show in the SME row (loans 1 and 3)?

```task
{"id": "w04d4-l7", "kind": "number", "answer": 150, "dp": 0, "hint": "Sum of principal ÷ sum of loan_id, for the SME rows only.", "model": "150 = (400 + 200) ÷ (1 + 3). The real average ticket is 300. The field divided by the sum of the ids, not by the number of loans — and showed no error."}
```

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

```task
{"id": "w04d4-l8", "kind": "choice", "options": ["One loan", "One instalment", "One payment", "One customer"], "answer": 1, "explain": "92 193 is the number of scheduled instalments. Count of loan_id counts rows, so every loan is counted once per instalment; for the number of loans use tblLoans (7 828)."}
```

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

```task
{"id": "w04d4-l9", "kind": "number", "answer": 13612, "dp": 0, "unit": "applications", "hint": "Count of a field skips its empty cells. 388 scores are blank.", "model": "13 612 = 14 000 − 388. Count of application_id would give all 14 000."}
```

### Refresh, the pivot cache and formats that survive it

**What it is.** A pivot reads a snapshot of its source, the **pivot cache**, taken when it was built. New rows, changed values and a Power Query refresh do **not** appear until you **Refresh** the pivot. Formats set on pivot cells are lost on refresh; formats set in Value Field Settings are kept.

**How to write it.**

```text
Right-click the pivot → Refresh                     one pivot
Data → Refresh All (Ctrl+Alt+F5)                    every query, then every pivot
PivotTable Analyze → Change Data Source → tblLoans  build on the Table, never on A1:M7829
Value Field Settings → Number Format → #,##0         the format that survives a refresh
```

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

```task
{"id": "w04d4-l10", "kind": "choice", "options": ["Ctrl+1 on the cells again after every refresh", "Value Field Settings → Number Format", "Home → Cell Styles", "On the source column in tblLoans only"], "answer": 1, "explain": "A format set in Value Field Settings belongs to the field and survives every refresh; a cell format belongs to cells the pivot redraws."}
```

### GETPIVOTDATA — reading a pivot from a formula

**What it is.** **GETPIVOTDATA** (*ПОЛУЧИТЬ.ДАННЫЕ.СВОДНОЙ.ТАБЛИЦЫ*) returns one value of a pivot by **field and item names**, not by cell address. It keeps returning the right number after the pivot is sorted, filtered or moved.

**How to write it.**

```excel
=GETPIVOTDATA("outstanding", $A$20)                                   data field, any cell of the pivot → the Grand Total
=GETPIVOTDATA("outstanding", $A$20, "product", "Small business loan") + a field and an item → one cell
```

Type `=` and click a value cell of the pivot: Excel writes the formula for you. On the small table's product pivot, `=GETPIVOTDATA("outstanding", $A$3, "product", "SME")` → **450**.

On `tblLoans`, the product pivot at `A20`: `=GETPIVOTDATA("outstanding", $A$20)` → **208 723 504 430**; with `"product", "Small business loan"` → **125 892 942 411**.

**When you use it.**
- Tiles above a page that must show what the pivot shows.
- A check cell: `=GETPIVOTDATA("outstanding", $A$20) = SUM(tblLoans[outstanding])` must say TRUE.

> ⚠️ **Watch out.** If a slicer filters the item out, GETPIVOTDATA returns `#REF!`. To get a plain `=B22` reference instead, turn it off: PivotTable Analyze → Options → untick *Generate GetPivotData*.

**Your turn.** Complete the tile: the outstanding of Auto loans, read from the pivot at `A20`.

```game
{"type": "cloze", "id": "w04d4-g6", "code": true, "title": "A tile that reads the pivot", "text": "=GETPIVOTDATA({{0}}, {{1}}, {{2}}, {{3}})", "blanks": [["\"outstanding\""], ["$A$20"], ["\"product\""], ["\"Auto loan\""]], "distractors": ["\"Sum of outstanding\"", "B22", "tblLoans[product]"]}
```

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

```game
{"type": "sort", "id": "w04d4-g2", "title": "Which chart for which question?", "q": "Madina's page asks five questions. Drop each into the chart that answers it.", "groups": {"Line": ["disbursements by month, 34 months", "collection rate by due month"], "Horizontal bar, sorted": ["outstanding by product (five long names)", "top-5 branches"], "Stacked column": ["late loans by product and bucket"], "Sparkline": ["a trend inside each product's row of a table"]}}
```

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

```game
{"type": "bug", "id": "w04d4-g3", "title": "Which setting makes this chart lie?", "q": "Five branches, outstanding in bn UZS. One setting turns a 7 % gap into 'twice as big'. Tap it.", "code": "Chart type: clustered column\nCategories: 5 branches, sorted by value\nVertical axis: minimum 25 bn\nTitle: Tashkent Central leads with 28.7 bn\nData labels: #,##0.0,,, (bn)", "answer": [2], "why": "Bars and columns start at zero: the eye compares lengths, so an axis starting at 25 bn turns Tashkent South 26.8 vs Tashkent Central 28.7 (7 % apart) into bars of 1.8 and 3.7 — twice as long. Set the minimum to 0."}
```

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

```task
{"id": "w04d4-l11", "kind": "choice", "options": ["A pie with 8 slices", "A 3D pie, so the small regions are visible", "A horizontal bar, sorted, with % labels", "A line chart"], "answer": 2, "explain": "Eight parts are too many for angles; a sorted bar lets the eye compare lengths — Tashkent 39.1 % on top, Termez 5.1 % at the bottom."}
```

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

```task
{"id": "w04d4-l12", "kind": "choice", "options": ["Two lines on one axis — the count flattens to zero next to billions", "A combo with a secondary axis and no axis titles", "Two charts on the same months, side by side (or a combo with both axes titled, if she insists)", "A pie per month"], "answer": 2, "explain": "Two units are two facts. Separate charts cannot invent a crossing; a combo is acceptable only with both axes labelled."}
```

### Building an honest chart — title, labels, sparklines

**What it is.** An **honest chart** cannot be misread. Its title states the finding, its axis starts at zero (for bars), its units are written, and nothing on it is decoration. A **sparkline** (*спарклайн*) is a tiny chart inside one cell: a trend in a table row.

**How to write it.**

```text
Chart Design → Add Chart Element → Data Labels / Axis Titles
Format Axis → Number → #,##0,,,  (billions)          Format Axis → Bounds → Minimum 0
Click the legend → Delete                            (one series needs no legend)
Insert → Sparklines → Line → data range B5:K5 → location L5 → tick High Point, Low Point
Sparkline → Axis → Same for All Sparklines           (otherwise each row has its own scale)
Sheets:  =SPARKLINE(B5:K5, {"charttype","column"})
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

```task
{"id": "w04d4-l13", "kind": "choice", "options": ["Outstanding by product", "Chart 1", "SME is 60 % of the book on 10 % of the loans", "Product mix (see table)"], "answer": 2, "explain": "A title states the finding, with its number. 'Outstanding by product' names the chart; the reader still has to find the point."}
```

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

```task
{"id": "w04d4-l14", "kind": "choice", "options": ["Rows region, Values Count of loan_id, Filters status = active, Value Filters → Greater Than 300", "Rows status, Columns region, Values Sum of loan_id", "Rows region, Values Count of loan_id, Filters status = active, Top 10 → 300", "Columns region, Filters loan_id > 300"], "answer": 0, "explain": "GROUP BY → Rows; COUNT(*) → Count in Values; WHERE → Filters; HAVING → a Value Filter on the count."}
```

### Putting it together

One pivot, one slicer, one chart, from the tools above: *"For each product, what share of its loans is 90+ — and does it change by region?"*

```text
Source:   tblLoans                                  (a Table, so Refresh picks up new rows)
Rows:     product                                   GROUP BY product
Columns:  bucket                                    the cross-tab
Values:   loan_id — Count, Show Values As % of Row Total     each product's loans spread over the buckets
Filters:  status = (All)
Slicer:   region, connected to this pivot only
Chart:    100 % stacked bar, 90+ in red, the rest grey; title linked to a cell
Check:    =GETPIVOTDATA("loan_id", $A$3) next to =COUNTA(tblLoans[loan_id]) → 7 828 = 7 828
```

Read the `90+` column: SME **3.7 %**, Consumer 3.2 %, Micro 2.8 %, BNPL 2.7 %, Auto 2.6 %. Click **Fergana** on the slicer and every share is recomputed for Fergana's loans; the check cell shows the Grand Total is no longer 7 828 — the page is filtered, and it says so.

**Put the steps of the page in order.**

```game
{"type": "order", "id": "w04d4-g7", "title": "Build the page, in order", "items": ["Say the question and the grain (one row of tblLoans = one loan)", "Insert a PivotTable from tblLoans", "Drag product to Rows, bucket to Columns, Count of loan_id to Values", "Show Values As → % of Row Total; number format 0.0% in Value Field Settings", "Insert a slicer on region and connect it with Report Connections", "Insert a 100 % stacked bar; 90+ in red; finding title", "Add the check cell: GETPIVOTDATA total = COUNTA(tblLoans[loan_id])"]}
```

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ PivotTables — [Pivot Table Excel | Step-by-Step Tutorial (Kevin Stratvert), 00:49](https://youtu.be/dvbLrwD2SpA?t=49&end=93)
- ▶ Slicers and pivot charts — [Pivot Table Excel | Step-by-Step Tutorial (Kevin Stratvert), 07:08](https://youtu.be/dvbLrwD2SpA?t=428&end=485)
- ▶ Charts — [Learn Excel in Under 3 Hours (Alex The Analyst), 35:57](https://youtu.be/zXnQNytHCPM?t=2157&end=2962)
- ▶ One-page dashboard (pivot tables + charts + timeline/slicers) — [How to Build Excel Interactive Dashboards (Kevin Stratvert), 00:52](https://youtu.be/MTlQvyNQ3PM?t=52&end=85)
- ▶ (RU, optional) Pivot tables from scratch — [Сводные таблицы Excel с нуля до профи за полчаса + Дэшборды! (Билял Хасенов)](https://youtu.be/4roVtL2mynA)
- ▶ (RU, optional) Core analyst formulas incl. pivots in 10 minutes — [EXCEL для начинающих аналитиков (Noukash), 05:40](https://youtu.be/snqGcBdTgCU?t=340&end=418)

- RU workbook `3.3 Pivot.xlsx` — sheets *Introduction*, *Building a Pivot table*, *Filtering*, *Calculations in Pivot Table*; the employee/store data shows the same Rows–Values–Filters mechanics.
- *Russian terms:* сводная таблица = PivotTable, срез = slicer, временная шкала = timeline, вычисляемое поле = calculated field, группировка по месяцам = group by months, % от родительской строки = % of parent row total, нарастающий итог = running total, гистограмма / линейчатая / график / комбинированная / с накоплением = column / bar / line / combo / stacked chart, спарклайн = sparkline, обновить = refresh.

```videoquiz
{"video": "dvbLrwD2SpA", "stops": [{"at": 75, "q": "What does a PivotTable do with 7 828 loan rows?", "options": ["Copies them to a new sheet", "Groups them by the fields you drag to Rows/Columns and aggregates the Values", "Sorts them", "Deletes duplicates"], "answer": 1, "explain": "GROUP BY with the mouse.", "back": 25}, {"at": 450, "q": "What does a slicer do?", "options": ["Filters the connected pivots with buttons", "Splits a column", "Adds a calculated field", "Refreshes the cache"], "answer": 0, "explain": "A WHERE the reader can click; Report Connections decides which pivots obey it."}, {"at": 480, "q": "Why use a PivotChart rather than a chart on a copied range?", "options": ["It is prettier", "It stays linked to the pivot, so it follows slicers and refreshes", "It cannot be filtered", "It needs no data"], "answer": 1, "explain": "Linked charts are what make a page a dashboard.", "back": 40}]}
```

```videoquiz
{"video": "zXnQNytHCPM", "stops": [{"at": 2300, "q": "You want to show disbursements over 34 months. Which chart?", "options": ["Pie", "Line", "Stacked bar", "Doughnut"], "answer": 1, "explain": "Time on the x-axis is a line's job."}, {"at": 2600, "q": "Where do you add axis titles and data labels?", "options": ["Chart Design → Add Chart Element", "Data → Sort", "Home → Conditional Formatting", "File → Options"], "answer": 0, "explain": "Units on the axis, numbers the board will quote on the labels."}, {"at": 2900, "q": "A chart has one series. What do you do with its legend?", "options": ["Keep it, always", "Delete it — the title and axis say what the bars are", "Move it to the top", "Make it bigger"], "answer": 1, "explain": "A legend for one series is a failure of labelling.", "back": 60}]}
```

```videoquiz
{"video": "MTlQvyNQ3PM", "stops": [{"at": 65, "q": "One slicer should filter all four pivots on the page. What connects them?", "options": ["Report Connections on the slicer", "Copying the slicer four times", "Grouping the pivots", "Protect Sheet"], "answer": 0, "explain": "Right-click the slicer → Report Connections → tick every pivot.", "back": 20}, {"at": 82, "q": "Where should the pivots live on a dashboard workbook?", "options": ["On the printed page, under the charts", "On a separate data sheet, read by charts and tiles", "In a different file", "Nowhere — paste values"], "answer": 1, "explain": "The page shows charts and tiles; the Data sheet holds the machinery.", "back": 20}]}
```

```videoquiz
{"video": "4roVtL2mynA", "stops": [{"at": 120, "q": "You drag a numeric field into Values. What appears?", "options": ["The raw rows", "Its aggregate per group — Sum by default", "A chart", "An error"], "answer": 1, "explain": "Value Field Settings switches Sum to Count, Average, Max…"}, {"at": 300, "q": "Which area of the field list acts like a WHERE for the whole pivot?", "options": ["Rows", "Values", "Filters", "Columns"], "answer": 2, "explain": "Filters (or a slicer) narrow the rows before they are grouped."}, {"at": 540, "q": "You added rows to the source table. What must you do before the pivot shows them?", "options": ["Nothing", "Refresh the pivot", "Rebuild it from scratch", "Sort the source"], "answer": 1, "explain": "The pivot reads its cache until you refresh.", "back": 60}]}
```

```videoquiz
{"video": "snqGcBdTgCU", "stops": [{"at": 370, "q": "Which summary is a pivot table built to give you in seconds?", "options": ["Totals per category without writing a formula", "A cleaned copy of the data", "A lookup of one value", "A forecast"], "answer": 0, "explain": "Category → aggregate: the analyst's most frequent question."}, {"at": 410, "q": "The source data changed. Will a pivot's numbers change by themselves in Excel?", "options": ["Yes, instantly", "No — refresh it", "Only after saving", "Only in Google Sheets"], "answer": 1, "explain": "Excel pivots read a cache; Sheets pivots follow their source range.", "back": 40}]}
```

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
8. **A slicer.** Insert → Slicer on `region`, Report Connections → this pivot. Click **Fergana**: SME 14 734 245 108 (the P4 lookup from Tuesday), total 24 797 334 197. The chart and its labels follow; the title does not — titles are static text. Write titles that stay true under the slicer ("by product" is safe; "60 %" is not) or link the title to a cell (select the chart title, type `=Report!$H$1` in the formula bar, and build the sentence in `H1` with `TEXT`). Clear the slicer before you read the totals again — the check in `H20` turns FALSE while it is on.

Sheets: Insert → Pivot table on `Loans`, Rows `product`, Values `outstanding` (SUM) and `outstanding` *Show as % of grand total*, `loan_id` (COUNTA); sort by SUM of outstanding descending; Insert → Chart → Bar from the pivot range; Data → Add a slicer on `region`. The keyboard alternative, one cell:

```
=QUERY(Loans!A1:M,
  "select D, sum(K), count(A) where K > 0 or K = 0 group by D order by sum(K) desc
   label D 'product', sum(K) 'outstanding', count(A) 'loans'", 1)
```

and a share column beside it, `=B2/SUM(B$2:B$6)`. `QUERY` output is a plain range: a chart on it refreshes with the data, a slicer does not filter it — use the pivot when the page needs the slicer, `QUERY` when it needs a shape the pivot cannot make.

9. **Three charts that lie, from this very table** — the three **chart traps**. (a) A **pie** of the five shares: BNPL and Micro are two 0.5 % slivers nobody can see, and the reader cannot tell 27.6 from 11.0 without labels — if you need labels to read a pie, it should be a bar. (b) A **column chart with the axis from 50 bn**: SME's bar is 76 units tall and Auto's 8 — the eye says "ten times", the numbers say 2.2 times. (c) **Count and outstanding on two axes**: Micro's 2 669 loans tower over SME's 781 while SME's money towers over Micro's; the two lines cross and the board reads a story about a crossing that does not exist. Two facts, two charts — or one fact in the title.

---

## 3. Practice (50 min)

File `week-04/day-4/practice.xlsx`, sheet `Pivots` for P1–P11, sheet `Charts` for P12–P14. Build every pivot on `tblLoans` (or the `monthly_disbursements.csv` table where said), so Refresh works. Read the asked number off your pivot into the box under each question. The questions follow the order of Learn.

**P1.** *(Rows and Values · Summarize by: Average)* The worked-example pivot, plus **Average** of `principal` as a fifth value. Which product has the largest ticket, and why would "Average of outstanding" be the wrong number to show next to it? *In the box: the largest average ticket, in soum.*

```task
{"id": "w04d4-p1", "kind": "number", "answer": 308728745, "dp": 0, "unit": "UZS", "explain": "SME 308 728 745 · Auto 216 858 133 · Consumer 26 926 915 · BNPL 4 170 880 · Micro 2 705 586 — 100 : 1 between SME and Micro. Average of outstanding divides by all loans, including the 4 242 closed ones at 0 — a meaningless 26.7 m overall; filter status = active (60 681 393) or say 'per loan with a balance'. A pivot's average is over the rows in the group, so the rows must be the right population."}
```

**P2.** *(Columns and Filters)* The bucket × status cross-tab as a pivot (Rows `bucket`, Columns `status`, Values Count), then with `bucket` filtered to exclude `0`. Read off the 90+ column and the "closed" row. *In the box: how many default loans sit in 90+.*

```task
{"id": "w04d4-p3", "kind": "number", "answer": 44, "dp": 0, "unit": "loans", "explain": "Row totals 7 429 / 124 / 25 / 16 / 234 = 7 828. 90+ = 44 default + 190 written_off; closed has 13 in 1-30 and 1 in 31-60. Buckets sort as text (0, 1-30, 31-60, 61-90, 90+), which happens to be the right order here; for labels that do not sort naturally, drag rows or add a sort-key column."}
```

**P3.** *(% of Parent Row Total)* Region → branch: Rows `region` then `branch`, Values Sum of `outstanding` twice, the second as **% of Parent Row Total**. What are Tashkent's three branches' shares of Tashkent, and what does the same column show on the region rows? *In the box: Tashkent Central's share of Tashkent, % with 1 decimal.*

```task
{"id": "w04d4-p4", "kind": "number", "answer": 35.2, "dp": 1, "unit": "%", "explain": "Tashkent Central 35.2 %, South 32.8 %, North 32.0 % of Tashkent's 81 679 738 071; every single-branch region shows 100 % under its branch. On the region rows the column shows the share of the grand total — Tashkent 39.1 %, Fergana 11.9 % … Termez 5.1 % — because a region's parent is the whole table."}
```

**P4.** *(% of Grand Total · Top 10 filter)* Top-5 branches by outstanding: Rows `branch`, Value Filters → **Top 10** → Top 5 by Sum of outstanding, sorted descending; and the share of the book they carry (a formula on the pivot's total vs `SUM(tblLoans[outstanding])`). *In the box: the pivot's Grand Total with the Top-5 filter on.*

```task
{"id": "w04d4-p5", "kind": "number", "answer": 131132961944, "dp": 0, "unit": "UZS", "explain": "Tashkent Central 28 716 674 373 · Tashkent South 26 787 392 136 · Tashkent North 26 175 671 562 · Fergana Central 24 797 334 197 · Samarkand Central 24 655 889 676 = 131 132 961 944 = 62.8 % of 208 723 504 430. A Top-N pivot's Grand Total is the total of the shown rows, so the share needs the Table's SUM as its denominator — % of Grand Total inside the filtered pivot would say 100 %."}
```

**P5.** *(grouping dates · Running Total · Difference From)* Disbursements by month of 2026: Rows `disbursed_at` grouped by **Months** and Years, Values Count of `loan_id`, Sum of `principal`, then the same sum as **Running Total In** disbursed_at and as **Difference From** (previous). Filter the year to 2026. *In the box: February's Difference From value (with its sign).*

```task
{"id": "w04d4-p2", "kind": "number", "answer": -5558520000, "dp": 0, "unit": "UZS", "explain": "Jan 287 / 17 452 370 000 … Sep 361 / 17 015 490 000, Oct 21 / 852 760 000; the running total reaches 162 333 060 000 in October (161 480 300 000 at end-September). Differences: Feb −5 558 520 000 (−31.8 %), Mar +7 763 560 000, … Sep −5 274 720 000, Oct −16 162 730 000 — one day; never show a partial month in a difference column without saying so."}
```

**P6.** *(slicers and timelines)* Add a slicer on `product` and a timeline on `disbursed_at`, connected to the P5 and P4 pivots. Set the timeline to **Q3 2026** and the slicer to **Small business loan**. Count and amount? Then clear both. *In the box: the number of SME loans in Q3 2026.*

```task
{"id": "w04d4-p6", "kind": "number", "answer": 114, "dp": 0, "unit": "loans", "explain": "114 SME loans in July–September 2026, 37 677 910 000 (all products: 1 086 loans). The P4 pivot re-ranks under the filter — Fergana Central jumps to first (5.91 bn of SME outstanding). Clear both with the slicer's corner icon: a page left filtered is Monday's most common 'the numbers are wrong' call. Put the pivot's Grand Total next to the Table's SUM — equal means unfiltered."}
```

**P7.** *(a calculated field)* With Tuesday's `rate` column on `tblLoans`, add `run_rate = outstanding * rate / 12` and show it by product. Then try `avg_ticket = principal / loan_id` — what happens, and what is the fix? *In the box: SME's run_rate, in soum a month.*

```task
{"id": "w04d4-p7", "kind": "number", "answer": 2727680419, "dp": 0, "unit": "UZS a month", "explain": "SME 2 727 680 419 · Auto 1 153 685 427 · Consumer 576 373 333 · Micro 33 463 723 · BNPL 0 — total 4 491 202 901, Tuesday's SUMPRODUCT. principal / loan_id divides the sum of principal by the sum of the ids — nonsense without an error. Fix: a column of 1s and principal / one, or just Average of principal in Values. Calculated fields see sums, never counts."}
```

**P8.** *(double counting)* Bring `principal` onto each instalment (a lookup from `tblLoans` in a new column of `tblInstallments`, or yesterday's merge), then pivot that table: Rows `product`, Values Sum of `principal`. Compare the SME row with the same pivot on `tblLoans`. *In the box: SME's principal as it should be, from `tblLoans`, in soum.*

```task
{"id": "w04d4-p13", "kind": "number", "answer": 241117150000, "dp": 0, "unit": "UZS", "hint": "One row of tblLoans = one loan. Sum principal there, not on the instalment table.", "explain": "On tblLoans: SME 241 117 150 000 lent on 781 loans. On the instalment-level table every principal is repeated once per instalment: SME 5 862 295 560 000, all products 9 981 530 850 000 instead of 404 783 280 000 — 24.7 times. The pivot is right about the rows it got; the grain was wrong."}
```

**P9.** *((blank) labels and empty cells)* On `tblCustomers`: Rows `segment`, Values Count of `customer_id` and Count of `monthly_income`. Why do the two columns differ, and by how much in total? *In the box: Count of monthly_income in the `mass` row.*

```task
{"id": "w04d4-p14", "kind": "number", "answer": 3377, "dp": 0, "unit": "customers", "hint": "Count of a field skips its empty cells; 208 mass customers have no income on file.", "explain": "mass 3 585 customers, 3 377 with an income (208 blank); sme 1 251 / 1 175 (76 blank); affluent 1 204 / 1 132 (72 blank). In total 356 blanks — Monday's number. For 'how many customers', count the id column."}
```

**P10.** *(refresh and the pivot cache)* A colleague's pivot was built on `Loans!$A$1:$M$7829`. Friday's file adds 120 loans to `tblLoans`, and she presses Refresh All. *In the box: pick what the pivot shows, and the fix.*

```task
{"id": "w04d4-p12", "kind": "choice", "options": ["7 948 loans — Refresh All reads the whole sheet", "Still 7 828 loans: the new rows are outside the fixed range; PivotTable Analyze → Change Data Source → tblLoans, then Refresh", "#REF! until the pivot is rebuilt", "7 948 loans, but only after saving the file"], "answer": 1, "explain": "Refresh re-reads the source as it is defined. A fixed range does not grow; a Table does. Change the source once, and every later refresh follows the data."}
```

**P11.** *(GETPIVOTDATA)* Six `GETPIVOTDATA` cells above the pivots: total outstanding, SME outstanding, loans in 90+, Tashkent Central outstanding, September 2026 principal, 2026 running total. Then sort a pivot differently — do the cells survive? *In the box: pick what happens.*

```task
{"id": "w04d4-p8", "kind": "choice", "options": ["They break — any re-sort moves the cells", "They survive sorting and filtering, because they address the pivot by field and item names; they show #REF! only if a slicer filters their item out", "They turn into typed values", "They survive only if the pivot is on the same sheet"], "answer": 1, "explain": "=GETPIVOTDATA(\"outstanding\", $A$20) → 208 723 504 430; with \"product\", \"Small business loan\" → 125 892 942 411; =GETPIVOTDATA(\"loan_id\", $A$40, \"bucket\", \"90+\") → 234. First argument = field name, second = any cell in the pivot. A =B22 reference does not survive a re-sort."}
```

**P12.** *(which chart · an honest chart)* Four charts for Madina from your pivots: a sorted bar (outstanding by product), a line of monthly disbursements over all 34 months from `monthly_disbursements.csv` (pivot: month → Sum of amount) with a **3-month moving average** (Chart Design → Add Chart Element → Trendline → Moving Average, period 3), a stacked column of delinquent loans by product and bucket (dpd > 0), and a top-5 bar. Give each a finding title. *In the box: your four titles, one per line.*

```task
{"id": "w04d4-p9", "kind": "free", "min": 25, "model": "SME is 60 % of the book on 10 % of the loans · Disbursements climbed from 3.9 bn (Jan 2024) to a 20 bn run-rate — read the 3-month average, not the month · Consumer and Micro carry most late loans; SME carries the money (90+: Consumer 77 · Micro 76 · BNPL 42 · SME 29 · Auto 10) · Three Tashkent branches plus Fergana and Samarkand hold 63 % of outstanding. October's one-day point is dropped or marked; bars from zero; no legend on single-series charts; red only for 90+.", "rubric": ["each title states a finding, not the chart's name", "each title carries a number", "October's partial month is dropped or marked on the line chart", "bars start at zero and red is kept for 90+"]}
```

**P13.** *(chart traps)* Timur sends four drafts for the page. (1) A column chart of the top-5 branches with the axis from 24 bn. (2) A pie of the 8 regions' outstanding. (3) A combo: loans by product as columns, outstanding by product as a line on a second axis. (4) A sorted bar of outstanding by product, from zero, with the title *SME is 60 % of the book on 10 % of the loans*. *In the box: tick every draft that misleads.*

```task
{"id": "w04d4-p15", "kind": "multi", "options": ["(1) columns from 24 bn", "(2) a pie of 8 regions", "(3) loans and outstanding on two axes", "(4) the sorted bar from zero with a finding title"], "answer": [0, 1, 2], "explain": "(1) truncated axis: Tashkent Central's column looks about 7 times Samarkand Central's for a 16 % gap. (2) eight angles cannot be ranked; Termez's 5.1 % and Nukus's 6.4 % look alike. (3) the crossing of count and money is an artefact of the two scales. (4) is the honest one."}
```

**P14.** *(sparklines)* A pivot of `monthly_disbursements.csv` with products in Rows and 2026 months in Columns (Sum of amount), a sparkline per row with high and low points, same axis for all. Which product is most volatile, and which looks volatile only because its axis is its own? *In the box: the most volatile product.*

```task
{"id": "w04d4-p10", "kind": "choice", "options": ["Micro loan", "Buy now pay later", "Consumer loan", "Auto loan", "Small business loan"], "answer": 4, "explain": "SME swings 6.0 → 15.4 bn (Feb → Jul) — the most volatile and the biggest. With Same for All Sparklines, Micro (0.20–0.35 bn) and BNPL (0.19–0.33) flatten to a line; each on its own axis they look as jagged as SME. Auto 1.8–6.2 bn is the second mover. State in the header whether the sparklines compare shape only or size too."}
```

**P15.** *(SQL → pivot)* Build this query as a pivot: `SELECT region, COUNT(*) FROM loans WHERE status = 'active' GROUP BY region HAVING COUNT(*) > 300`. *In the box: how many regions remain.*

```task
{"id": "w04d4-p16", "kind": "number", "answer": 4, "dp": 0, "unit": "regions", "hint": "Filters status = active; Rows region; Count of loan_id; Value Filters → Greater Than 300.", "explain": "Active loans: Tashkent 1 279 · Samarkand 396 · Fergana 373 · Andijan 334 pass; Namangan 287 · Bukhara 270 · Nukus 213 · Termez 200 drop out. The Grand Total under a Value Filter is the total of the four shown rows (2 382), not of all 3 352 active loans."}
```

> 🚀 **Stretch (optional, +5 XP).** **P16.** *(a calculated field on a merged query)* On yesterday's merged `installments_paid` query, a pivot with `due_month` in Rows, Sum of `total_due`, Sum of `paid`, and a **calculated field** `rate = paid / total_due` (as `0.0%`). Does it reproduce Wednesday's Company corner table? Add a slicer on `product` (merge it in from `Loans` first) — which product collects worst in September? *In the box: the product that collects worst in September.*

```task
{"id": "w04d4-p11", "kind": "choice", "options": ["Small business loan", "Buy now pay later", "Consumer loan", "Auto loan", "Micro loan"], "answer": 4, "xp": 2, "explain": "Yes, it reproduces Jun 96.9 · Jul 96.7 · Aug 96.5 · Sep 94.1 % — a ratio of sums, so the calculated field is right here. September by product: Micro 91.5 % (548 instalments) · Auto 92.7 % (351) · Consumer 93.4 % (1 345) · BNPL 94.2 % (473) · SME 94.8 % (588), against 94.1 % for the book. Quote the counts with the rates: Auto's 351 instalments move by a point on a handful of large unpaid ones."}
```

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

```check
{"id": "w04d4-sc", "questions": [
  {"type": "number", "q": "Tashkent has 81.68 bn outstanding and Tashkent South 26.79 bn. What does % of Parent Row Total show on the Tashkent South row? (%, 1 decimal)", "answer": 32.8, "explain": "26 787 392 136 / 81 679 738 071 = 32.8 % — the share within its region, not of the book (→ section 1, Show Values As — % of Parent; P3)."},
  {"type": "single", "q": "Which of these belongs in a calculated field?", "options": ["paid / total_due per month — a ratio of sums", "the number of loans per product", "the average of the per-loan interest rates", "a join to the Lookup sheet"], "answer": 0, "explain": "Calculated fields work on sums; counts belong in Values (Count), joins in Power Query (→ section 1, A calculated field; P7)."},
  {"type": "single", "q": "Your 34-month line ends with October 2026: one day, 0.85 bn. What do you do?", "options": ["Leave it — the data is the data", "Drop it from the series (or mark it) and say so in the footnote", "Multiply it by 31", "Switch to a pie"], "answer": 1, "explain": "A partial period plotted as a month looks like a crash (→ section 1, Building an honest chart)."},
  {"type": "single", "q": "A pivot on a merge of installments_paid with tblLoans shows Sum of principal ≈ 10 trillion UZS. Why?", "options": ["Principal is stored in tiyin", "The grain is one row per instalment, so each loan's principal is counted once per instalment", "The pivot needs a refresh", "The slicer is on"], "answer": 1, "explain": "Know the grain; loan-level sums come from tblLoans, not from an instalment-level table (→ section 1, Pivot trap: double counting; P8)."}
]}
```

---

## 6. Company corner <span class="badge company">The portfolio one-pager</span>

Week 3 Day 4 defined the **six tiles** on the first page of a lending dashboard and computed them from Timur's views. Today the same six, in Excel, on one sheet — the board's version of the dashboard, and the proof that the two agree.

```
 A          B          C          D          E          F          G …  L
1  Nur Finance — portfolio as of 1 Oct 2026                         source · refreshed
3  OUTSTANDING   DISBURSED MTD   PAR30      NPL90      FPD30 Jul-26   COLLECTION Sep-26
4  208.7 bn      0.85 bn · 21    3.12 %     2.55 %     1.09 %         94.1 %
5  principal due after as-of · 1 day; Sep 17.0 bn / 361 · >30 DPD ÷ total · >90 DPD, 234 loans · 4 of 367 · paid by as-of ÷ due
8  ┌ bar: outstanding by product ──────────┐   ┌ line: disbursements by month, 3-mo avg ┐
24 └──────────────────────────────────────┘   └────────────────────────────────────────┘
26 ┌ stacked: late loans by product × bucket ┐  ┌ bar: top-5 branches + Others ───────────┐
41 └──────────────────────────────────────┘   └────────────────────────────────────────┘
43 Findings — five sentences
49 Definitions — DPD · de-dup rule · as-of · October excluded · UZS
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

```game
{"type": "match", "id": "w04d4-g4", "title": "Match each tile to its definition", "pairs": [["Outstanding", "principal due after the as-of date, all loans"], ["PAR30", "outstanding of loans > 30 DPD ÷ total outstanding"], ["NPL90", "outstanding of loans > 90 DPD ÷ total outstanding"], ["FPD30", "first instalment unpaid or paid > 30 days late, per vintage"], ["Collection rate", "paid by the as-of on instalments due in the month ÷ due"], ["Disbursements MTD", "loans and principal since the 1st, with the last full month beside"]]}
```

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

```task
{"id": "w04d4-cc", "kind": "free", "min": 30, "model": "Because two of the five products are 0.5 % each — on a pie they are invisible slivers, and the eye cannot tell 27.6 % from 11 % without labels. A sorted bar from zero lets you compare lengths at a glance: SME 125.9 bn on top, then Auto 57.7, Consumer 23.1, BNPL and Micro about 1 bn each. The title carries the point: SME is 60 % of the book on 10 % of the loans. A pie is fine for two or three parts, not five.", "rubric": ["names the problem with small slices (two products at 0.5 %)", "says bars compare lengths, sorted and from zero", "quotes a number from the page (60 %, 125.9 bn …)", "puts the finding in the title"]}
```

Tomorrow: the checkpoint — clean both dirty files, build the page on the clean data, write the five findings, answer eight questions.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w04d4", "pass": 0.8, "questions": [
  {"type": "single", "q": "A pivot has region then branch in Rows, and Sum of outstanding shown as % of Parent Row Total. What does a branch row show?", "options": ["The branch's share of the whole book", "The branch's share of its own region", "The branch's running total", "The difference from the previous branch"], "answer": 1, "explain": "% of Parent Row Total is SUM(x) / SUM(SUM(x)) OVER (PARTITION BY region); on the region rows it shows the share of the grand total (→ section 1, Show Values As — % of Parent; P3)."},
  {"type": "single", "q": "You add this calculated field to get the average ticket per product. What do you get?", "code": "avg_ticket = principal / loan_id", "options": ["The average principal per loan", "The sum of principal divided by the sum of the loan ids — nonsense, with no error", "#DIV/0!", "The count of loans"], "answer": 1, "explain": "Calculated fields work on sums, never counts; use Average of principal in Values, or a column of 1s (→ section 1, A calculated field; P7)."},
  {"type": "single", "q": "Which chart for disbursements by month over 34 months?", "options": ["A pie, one slice per month", "A line, with a 3-month moving average for the trend", "A 3D column chart", "A stacked bar sorted by amount"], "answer": 1, "explain": "Time on the x-axis is a line's job; the moving average is the trend, the monthly line the noise (→ section 1, Which chart for which question; section 6)."},
  {"type": "multi", "q": "Which chart rules are not matters of taste?", "options": ["Bars and columns start at zero", "No 3D", "The title states the finding", "Use a pie whenever you show shares", "Give every bar its own colour"], "answer": [0, 1, 2], "explain": "A pie hides small slices, and one colour plus one highlight keeps the eye on the point (→ section 1, Chart trap: the pie with many slices; Building an honest chart)."},
  {"type": "number", "q": "Two branches have 150 and 160 bn outstanding. The column chart's axis starts at 140 bn. How many times taller does the 160 bar LOOK than the 150 bar?", "code": "bar heights drawn: 160 − 140 and 150 − 140", "answer": 2, "explain": "20 vs 10 units: the eye reads 'twice as big' for a 7 % difference — bars start at zero (→ section 1, Chart trap: the truncated axis; section 2, step 9)."},
  {"type": "single", "q": "Power Query refreshed this morning with new loans, but the pivot still shows last week's totals. Why?", "options": ["Pivots cannot read queries", "The pivot reads its own cache; it updates only on Refresh (or Refresh All)", "The slicer is hiding the new rows", "Pivots ignore rows added after creation"], "answer": 1, "explain": "Build on a Table or query output and refresh the pivot after the data (→ section 1, Refresh, the pivot cache and formats that survive it; P10)."},
  {"type": "single", "q": "A pivot is filtered to the Top 5 branches. You divide its Grand Total by itself to get 'share of the book'. What is wrong?", "options": ["Nothing", "A filtered pivot's Grand Total is the total of the shown rows only, so the share comes out 100 %; divide by the Table's SUM instead", "Top-N filters do not change totals", "GETPIVOTDATA is required"], "answer": 1, "explain": "The denominator must come from the unfiltered book (→ P4)."},
  {"type": "single", "q": "On 1 October the Disbursements MTD tile shows 21 loans, 0.85 bn. What belongs on the tile?", "options": ["Only those numbers", "Those numbers labelled as one day, with the last full month (September) beside them", "Replace them with September's numbers silently", "Hide the tile until the month ends"], "answer": 1, "explain": "A partial period must be marked, never compared with full months without a note (→ section 6, Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w04d4", "q": "Madina wants one year-on-year number for the board. From monthly_disbursements.csv build a pivot with month grouped by Years and Quarters and Sum of amount. By how many percent did Small business loan disbursements in Q3 2026 exceed Q3 2025? Percentage to 1 decimal.", "type": "number", "dp": 1, "h": ["544ab8b5347350c19650a025"], "hint": "Filter the pivot to one product first; Show Values As can compare a period with the one before, or read two cells and divide.", "sol": "UGl2b3Qgb24gbW9udGhseV9kaXNidXJzZW1lbnRzIChsb2FkZWQgYXMgYSBUYWJsZSBvciBhIHF1ZXJ5KTogRmlsdGVycyBwcm9kdWN0ID0gU21hbGwgYnVzaW5lc3MgbG9hbjsgUm93cyBtb250aCBncm91cGVkIGJ5IFllYXJzIGFuZCBRdWFydGVyczsgVmFsdWVzIFN1bSBvZiBhbW91bnQuClEzIDIwMjUgPSAzMCA4NDQgMDEwIDAwMDsgUTMgMjAyNiA9IDM3IDY3NyA5MTAgMDAwLgo9Mzc2Nzc5MTAwMDAvMzA4NDQwMTAwMDAtMSDihpIgMjIuMiAlLiAoT3IgcHV0IFllYXJzIGluIENvbHVtbnMgYW5kIFF1YXJ0ZXJzIGluIFJvd3MsIHRoZW4gU2hvdyBWYWx1ZXMgQXMg4oaSICUgRGlmZmVyZW5jZSBGcm9tIOKGkiBCYXNlIGZpZWxkIFllYXJzLCBCYXNlIGl0ZW0gKHByZXZpb3VzKS4pCkdvb2dsZSBTaGVldHM6IGEgaGVscGVyIGNvbHVtbiA9WUVBUihBMikmIi1RIiZST1VORFVQKE1PTlRIKEEyKS8zLDApIGFzIHRoZSBwaXZvdCdzIHJvd3MsIHRoZW4gdGhlIHNhbWUgZGl2aXNpb24uClNNRSBncmV3IDIyICUgeWVhciBvbiB5ZWFyIHdoaWxlIHRoZSB3aG9sZSBjb21wYW55J3MgUTMgZ3JldyAyNy45ICUgKDQ2LjkgYm4g4oaSIDYwLjAgYm4pIGFuZCBBdXRvIGdyZXcgNDcuNiAlLiBUaGUgYmlnZ2VzdCBwcm9kdWN0IGlzIHRoZSBzbG93ZXN0LWdyb3dpbmcg4oCUIHNheSBib3RoIG51bWJlcnMgb24gdGhlIHNsaWRlLCBvciAiU01FICsyMiAlIiByZWFkcyBhcyB0aGUgY29tcGFueSdzIHN0b3J5Lg=="}
```

<!-- challenge:end -->
