# Week 4 · Day 4 — Pivot tables and charts: the one-page report

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge company">Company corner</span>

> STORY **Thursday, 9:00.** Madina, your manager (*руководитель*), with the board agenda. *"Monday, slot four, eight minutes. Bekzod's Excel is right now, but it is forty cells on three sheets. I want **one page**: outstanding by product, disbursements by month with a trend, the buckets, the top-5 branches — and the six numbers Timur's dashboard shows, as tiles, so the board sees the same figures in both places. Pivot tables, so I can click a product and the page follows; charts, so nobody has to read a table; and a title on every chart that says what it means, not what it is."*

## Today in 3 lines

- A **PivotTable** is `GROUP BY` with the mouse: drag fields to Rows / Columns / Values / Filters; **Show Values As** gives % of total, % of parent, running total and difference-from without a formula; **group** dates by month and quarter; **slicers** and **timelines** are the dropdowns of a page.
- **Charts**: column for categories, bar for rankings, line for time, combo for two measures, stacked for composition; no pie beyond three slices, no 3D, bars from zero; **the title states the finding**; sparklines for a trend in a cell.
- You have built Madina's page: four pivots, four charts, six tiles, one slicer — refreshable, with every number tied to week 3.

---

## 1. Learn — the pivot is GROUP BY you can drag

### PivotTables (*сводные таблицы*)

Click inside `tblLoans` → Insert → **PivotTable** → New Worksheet. The field list appears: drag `product` to **Rows**, `outstanding` to **Values** (it becomes *Sum of outstanding*), `loan_id` to **Values** (it becomes *Count of loan_id*). That is `SELECT product, SUM(outstanding), COUNT(*) FROM loans GROUP BY product`. Drag `bucket` to **Columns** for a cross-tab; `status` to **Filters** for a page-level `WHERE`. Four areas, one rule: a field in Rows or Columns is a `GROUP BY` key; a field in Values is an aggregate; a field in Filters is a `WHERE` the reader can change.

Google Sheets: select the data → Insert → **Pivot table**; the editor on the right has the same Rows / Columns / Values / Filters. Sheets' pivots cannot group dates by right-click — add a `month` column (`=EOMONTH(G2, -1)+1` or `TEXT`) to the data first, or use `QUERY` with `month(G)`.

**Value Field Settings** (right-click a value → *Value Field Settings*; Sheets: the *Summarize by* dropdown): **Sum / Count / Average / Max / Min / Count Numbers / StdDev**. Then the second tab, **Show Values As** (Sheets: *Show as*):

| Show Values As | Means | On our data |
|---|---|---|
| % of Grand Total | share of the whole table | SME outstanding 60.3 % |
| % of Column Total / % of Row Total | share within the column / row | within bucket 90+, which product |
| **% of Parent Row Total** | share within the row's parent group (region → branch) | Tashkent Central 35.2 % of Tashkent |
| **Running Total In** (a base field) | cumulative down the chosen field | disbursed 2026 year-to-date by month |
| **Difference From** / **% Difference From** (previous) | change against the previous item | February −5 558 520 000, −31.8 % |
| Rank Largest to Smallest | the `RANK()` window | branches 1–10 |

These are week 3's window functions as a dropdown — `SUM(SUM(x)) OVER ()`, `OVER (PARTITION BY region)`, `OVER (ORDER BY month ROWS UNBOUNDED PRECEDING)`, `LAG`. Put the same field in Values twice to show the number and its share side by side.

**Grouping dates** (*группировка*): put `disbursed_at` in Rows → Excel 365 groups it into Years / Quarters / Months automatically; right-click → **Group** to choose (Months + Years, or Quarters). Ungroup to get back to days. Grouping works only if every value in the column is a real date — one text date and the Group command greys out, which is yesterday's `DATEVALUE` lesson arriving as a symptom.

**Calculated fields** (PivotTable Analyze → Fields, Items & Sets → **Calculated Field**; Sheets: Values → Add → *Calculated field*): a new value computed from *sums* of other fields — `= outstanding * rate / 12` gives the interest run-rate per product (4 491 202 901 in total), `= paid / total_due` gives a collection rate per month that is a **ratio of sums**, correct. The trap: a calculated field is evaluated on the *aggregated* numbers, so `= principal / loans` works only if `loans` is a column of 1s you added to the data — there is no `COUNT` inside a calculated field. And never put an *Average* of a per-row *rate* in Values when you mean a ratio of totals: the average of 7 828 individual rates weights a 500 000 Micro loan like a 599 m SME loan.

**Slicers and timelines** (*срезы*): PivotTable Analyze → Insert **Slicer** → tick `product`, `region`: buttons that filter the pivot. Insert **Timeline** on `disbursed_at`: a date slider by month / quarter / year. Right-click a slicer → **Report Connections** → tick every pivot on the page, and one click filters all of them — that is what makes a page a dashboard. Sheets: one *Filter* control (Data → Add a slicer) per sheet, applied to all pivots and charts on it.

**GETPIVOTDATA** (*ПОЛУЧИТЬ.ДАННЫЕ.СВОДНОЙ.ТАБЛИЦЫ*): click a pivot cell from a formula and Excel writes `=GETPIVOTDATA("outstanding", $A$3, "product", "Small business loan")` — a lookup into the pivot by field names that survives re-sorting and re-filtering. Use it for **tiles** that must read what the pivot shows; turn it off (PivotTable Analyze → Options → *Generate GetPivotData*) when you want a plain `=B5` reference instead.

**Refresh and the cache.** A pivot reads a snapshot (the *pivot cache*) taken when it was created; new rows in `tblLoans` or a Power Query refresh do **not** appear until right-click → **Refresh** (or Data → Refresh All, which also refreshes queries). Build on a Table or a query output, never on a fixed range `A1:M7829` — the range does not grow. Preserve number formats: Value Field Settings → **Number Format** (`#,##0`, `0.0%`), not the cells, or the format vanishes on refresh. Design → Report Layout → **Tabular Form** and *Repeat All Item Labels* if the pivot feeds a chart or another formula.

**Formatting a pivot for a reader** (the eight clicks after the drag):

1. Design → Report Layout → **Tabular Form**, *Repeat All Item Labels* — one value per column, no indented outline.
2. Design → **Subtotals off**, **Grand Totals** on for columns only (a row total of shares is meaningless).
3. Value Field Settings → **Number Format** per value (`#,##0`, `0.0%`) — set here, not on the cells.
4. **Rename** the value headers in place: *Sum of outstanding* → *Outstanding, UZS*.
5. **Sort** by the main value, descending; drag an item to move it (buckets, grades) when the order is natural.
6. PivotTable Options → Layout → **untick Autofit column widths on update** — or every refresh resets the widths.
7. PivotTable Options → **For empty cells show** `0` — a blank cell in a cross-tab reads as "unknown", a 0 as "none".
8. **Freeze** the header row; a pivot of 34 months scrolls.

### Charts (*диаграммы*) — which one, and when it lies

The chart type is decided by the *question*, and most wrong charts are a wrong type for a right number:

| Question | Chart | Not |
|---|---|---|
| How do categories compare? (outstanding by product) | **column** (few, short labels) or **bar** (many, long labels; sorted descending) | pie — the eye cannot compare slices |
| How does something move over time? (disbursements by month) | **line** (34 months) or column (≤ 12 periods) | a bar chart with months as categories, unsorted |
| Two measures with different units on one timeline (count and amount) | **combo**: columns + line on a secondary axis — label both axes | two lines on one axis (the count flattens to zero) |
| How is a total composed, over categories? (buckets by product) | **stacked column**; **100 % stacked** when the mix matters more than the size | five pies |
| Part of a whole, 2–3 parts | pie or doughnut *allowed* | pie with 5+ slices, 3D pie (the front slice looks bigger), exploded pie |
| A ranking (top-5 branches) | horizontal **bar**, largest at the top | a column chart with rotated labels |
| A trend inside a table row | **sparkline** | a chart per row |

Rules that are not taste: **bars and columns start at zero** (a bar from 150 to 160 bn makes a 7 % growth look like doubling — truncating the axis is for lines, and even then say so); **no 3D** (depth adds nothing and distorts); **sort categories by value** unless they have a natural order (months, buckets); **one colour** for the series and **one highlight colour** for the point you talk about (90+ in red); **label the axis unit** (bn UZS, loans) or put it in the title; **the title states the finding** — *"SME is 60 % of the book on 10 % of the loans"*, not *"Outstanding by product"*; the data label is the number the board will quote, so format it (`0.0` bn). A legend is a failure of labelling when there is one series — delete it.

**Building one**: select the pivot (a **PivotChart** stays linked and obeys slicers) or a plain summary range → Insert → Recommended Charts → pick → Chart Design → Add Chart Element (data labels, axis titles) → right-click the axis → Format Axis (bounds, number format `#,##0,,,` for billions). **Sparklines**: Insert → Sparklines → Line / Column / Win-Loss, data range = the row of 2026 months, location = one cell; tick *High point* and *Low point*; set the same vertical axis for all rows (Sparkline → Axis → *Same for All Sparklines*) or SME's 15 bn and Micro's 0.35 bn look alike. Sheets: Insert → Chart, with *Chart type*, *Customize → Chart & axis titles*; sparklines are a function, `=SPARKLINE(B2:K2, {"charttype","column"})`.

### Google Sheets: pivot + charts + QUERY

Insert → Pivot table (Rows / Columns / Values / Filters, *Show as* for % of grand total / row / column — no % of parent or running total: add a helper or use `QUERY`), *Calculated field* under Values, Data → Add a slicer. Charts: Insert → Chart, and a pivot *chart* is just a chart whose range is the pivot's output. **`QUERY`** is the keyboard alternative when the pivot cannot do it: `=QUERY(Loans!A1:M, "select D, sum(K), count(A) group by D order by sum(K) desc label sum(K) 'outstanding', count(A) 'loans'", 1)`; date grouping with `month(G)+1` and `year(G)`; `pivot M` for a cross-tab; and the result range feeds a chart like any other.

### SQL → pivot, the translation table

| SQL (week 2–3) | Pivot |
|---|---|
| `GROUP BY product` | `product` in **Rows** |
| `GROUP BY product, bucket` as a cross-tab | `product` in Rows, `bucket` in **Columns** |
| `SUM(outstanding)`, `COUNT(*)`, `AVG(principal)`, `MAX(dpd)` | the field in **Values**, summarised by Sum / Count / Average / Max |
| `WHERE status = 'active'` (fixed) | `status` in **Filters**, or a slicer |
| `WHERE disbursed_at >= … AND < …` | a **timeline** on `disbursed_at`, or Date Filters on the row field |
| `100.0 * SUM(x) / SUM(SUM(x)) OVER ()` | Show Values As → **% of Grand Total** |
| `SUM(x) / SUM(SUM(x)) OVER (PARTITION BY region)` | **% of Parent Row Total** |
| `SUM(SUM(x)) OVER (ORDER BY month)` | **Running Total In** month |
| `SUM(x) - LAG(SUM(x)) OVER (ORDER BY month)` | **Difference From** previous |
| `RANK() OVER (ORDER BY SUM(x) DESC)` | **Rank Largest to Smallest**; sort descending |
| `ORDER BY SUM(x) DESC LIMIT 5` | sort + Value Filter → **Top 10** → 5 |
| `strftime('%Y-%m', d)` in `GROUP BY` | right-click the date field → **Group** → Months, Years |
| `SUM(a) / SUM(b)` | a **calculated field** `= a / b` |
| `HAVING COUNT(*) > 100` | Value Filter → Greater Than on the count |
| a `CREATE VIEW` the dashboard reads | the pivot on a **Table / query**, refreshed |

What a pivot cannot do that SQL can: a `JOIN` (merge first in Power Query, or add a lookup column to the data), a window over *rows* rather than groups (`ROW_NUMBER` per loan), a `COUNT(DISTINCT)` without the Data Model (tick *Add this data to the Data Model* when creating the pivot, then *Distinct Count* appears — the way to count borrowers from `Applications.customer_id`).

### The anatomy of an honest chart

1. **Title = the finding**, in the reader's words, with the number: *SME is 60 % of the book on 10 % of the loans.*
2. **Subtitle = the definition and the as-of**: *outstanding principal, bn UZS, as of 1 Oct 2026.*
3. **Axis from zero** for bars and columns; a truncated line axis is labelled as such.
4. **Units** on the axis or in the subtitle; data labels formatted (`125.9`, not `125892942411`).
5. **Sorted** by value unless the order is natural (time, buckets, grades).
6. **One colour** for the series, **one highlight** for the point the title is about, red reserved for *bad*.
7. **No legend** for a single series; a legend for a stacked chart, in the stack's order.
8. **No 3D, no gradients, no shadows, no gridlines you do not need.**
9. **Partial periods** (October) excluded or marked.
10. **Source line** under the chart: *tblLoans · 7 828 loans · Nur Finance.*

### Excel ↔ Google Sheets, today's tools

| Excel | Sheets | Note |
|---|---|---|
| Insert → PivotTable | Insert → Pivot table | same four areas |
| Value Field Settings → Show Values As | Values → *Show as* (% of grand total / row / column) | no % of parent, running total or difference-from — helper column or `QUERY` |
| right-click date → Group → Months | add a month column to the data (`=EOMONTH(G2,-1)+1`) | or `QUERY … group by year(G), month(G)` |
| Calculated Field | Values → Add → Calculated field | same ratio-of-sums behaviour |
| Slicer, Timeline, Report Connections | Data → Add a slicer (applies to the sheet) | one slicer filters every pivot and chart on that sheet |
| `GETPIVOTDATA` | `GETPIVOTDATA` | same arguments |
| Refresh / Refresh All | automatic (pivot follows the source range) | extend the source range to whole columns |
| PivotChart | Insert → Chart on the pivot's range | not linked to slicers by itself; the sheet slicer does it |
| Trendline → Moving Average | Customize → Series → Trendline → Moving average | |
| Insert → Sparklines | `=SPARKLINE(range, {"charttype","column"})` | a function, so it fills with the row |

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

---

## 2. Worked example — outstanding by product, the first quarter of the page (15 min)

Grain: one row per product. Insert → PivotTable from `tblLoans` on a new sheet `Report`, placed at `A20` (rows 1–18 are reserved for the tiles and the first charts). Rows `product`; Values `outstanding` (Sum, `#,##0`), `outstanding` again → Show Values As → **% of Grand Total** (`0.0%`), `loan_id` (Count), `loan_id` again → % of Grand Total. Sort: right-click a value → Sort → Largest to Smallest. Rename the headers in place (`Outstanding`, `Share`, `Loans`, `Loan share`).

| product | outstanding | share | loans | loan share |
|---|---|---|---|---|
| Small business loan | 125 892 942 411 | 60.3 % | 781 | 10.0 % |
| Auto loan | 57 684 271 333 | 27.6 % | 391 | 5.0 % |
| Consumer loan | 23 054 933 316 | 11.0 % | 2 418 | 30.9 % |
| Buy now pay later | 1 135 251 000 | 0.5 % | 1 569 | 20.0 % |
| Micro loan | 956 106 370 | 0.5 % | 2 669 | 34.1 % |
| **Grand Total** | **208 723 504 430** | 100 % | 7 828 | 100 % |

The Grand Total is the check — it must equal yesterday's `SUM(tblLoans[outstanding])`; if a pivot's total is 92 193 rows' worth, you built it on `Installments`. Now the chart: select the pivot → Insert → PivotChart → **Bar** (five long labels), sort order already descending so the largest is at the top (Format Axis → *Categories in reverse order* if Excel flips it). Delete the legend (one series), add data labels in billions (`#,##0.0,,,` → `125.9`), axis title *outstanding, bn UZS*, colour all bars grey and the SME bar the brand colour. Title: **"SME is 60 % of the book on 10 % of the loans."** Add the second series? No — the loan share belongs in the title, not on a second axis fighting for the same bars. Drag the chart to `A1:F18` later; for now it sits beside the pivot.

Then Insert → Slicer on `region`, Report Connections → this pivot. Click **Fergana**: SME 14 734 245 108 (the P5 lookup from Tuesday), total 24 797 334 197, the chart and its labels follow, the title does not — titles are static text, so write titles that stay true under the slicer ("by product" is safe; "60 %" is not) or link the title to a cell (select the chart title, type `=Report!$H$1` in the formula bar, and compute the sentence in `H1` with `TEXT`). Clear the slicer before you read the totals again.

Sheets: Insert → Pivot table on `Loans`, Rows `product`, Values `outstanding` (SUM) and `outstanding` *Show as % of grand total*, `loan_id` (COUNTA); sort by SUM of outstanding descending; Insert → Chart → Bar from the pivot range; Data → Add a slicer on `region`. The keyboard alternative, one cell:

```
=QUERY(Loans!A1:M,
  "select D, sum(K), count(A) where K > 0 or K = 0 group by D order by sum(K) desc
   label D 'product', sum(K) 'outstanding', count(A) 'loans'", 1)
```

and a share column beside it, `=B2/SUM(B$2:B$6)`. `QUERY` output is a plain range: a chart on it refreshes with the data, a slicer does not filter it — use the pivot when the page needs the slicer, `QUERY` when it needs a shape the pivot cannot make.

**Three charts that lie, from this very table.** (a) A **pie** of the five shares: BNPL and Micro are two 0.5 % slivers nobody can see, and the reader cannot tell 27.6 from 11.0 without labels — if you need labels to read a pie, it should be a bar. (b) A **column chart with the axis from 50 bn**: SME's bar is 76 units tall and Auto's 8 — the eye says "ten times", the numbers say 2.2 times. (c) **Count and outstanding on two axes**: Micro's 2 669 loans tower over SME's 781 while SME's money towers over Micro's; the two lines cross and the board reads a story about a crossing that does not exist. Two facts, two charts — or one fact in the title.

---

## 3. Practice (50 min)

File `week-04/day-4/practice.xlsx`, sheet `Pivots` for P1–P8, sheet `Charts` for P9–P10. Build every pivot on `tblLoans` (or the `monthly_disbursements.csv` table where said), so Refresh works.

**P1.** The worked-example pivot, plus **Average** of `principal` as a fifth value. Which product has the largest ticket, and why would "Average of outstanding" be the wrong number to show next to it?

<details><summary>Answer</summary>
SME 308 728 745 · Auto 216 858 133 · Consumer 26 926 915 · BNPL 4 170 880 · Micro 2 705 586 — 100 : 1 between SME and Micro. *Average of outstanding* divides by all loans including the 4 242 closed ones with 0 — a meaningless 26.7 m overall; filter `status = active` (60 681 393) or say "per loan with a balance". Averages in pivots are averages over the *rows in the group*, so the rows must be the right population.
</details>

**P2.** Disbursements by month of 2026: Rows `disbursed_at` grouped by **Months**, Values Count of `loan_id`, Sum of `principal`, then the same sum as **Running Total In** disbursed_at and as **Difference From** (previous). Filter the year to 2026.

<details><summary>Answer</summary>
Jan 287 / 17 452 370 000 … Sep 361 / 17 015 490 000, Oct 21 / 852 760 000; running total reaches **162 333 060 000** in October (161 480 300 000 at end-September). Differences: Feb **−5 558 520 000** (−31.8 %), Mar +7 763 560 000 (+65.3 %), Apr −1 762 440 000, May +636 860 000, Jun −2 481 530 000, Jul +4 643 570 000 (+28.9 %), Aug +1 596 340 000, Sep −5 274 720 000 (−23.7 %), Oct −16 162 730 000 (one day — never show a partial month in a difference column without saying so). Week 3 S7's `LAG`, as a dropdown.
</details>

**P3.** The bucket × status cross-tab as a pivot (Rows `bucket`, Columns `status`, Values Count), then with `bucket` filtered to exclude `0`. Read off the 90+ column and the "closed" row.

<details><summary>Answer</summary>
Row totals 7 429 / 124 / 25 / 16 / 234 = 7 828. 90+ = 44 default + 190 written_off; `closed` has 13 in 1-30 and 1 in 31-60 (14 of the 15 week-2 closed-but-owing loans; the fifteenth is in bucket 0). Buckets sort as text (`0`, `1-30`, `31-60`, `61-90`, `90+`) — which happens to be the right order here; for labels that do not sort naturally, drag rows by hand or add a sort-key column.
</details>

**P4.** Region → branch: Rows `region` then `branch`, Values Sum of `outstanding` twice, the second as **% of Parent Row Total**. What are Tashkent's three branches' shares of Tashkent, and what does the same column show on the region rows?

<details><summary>Answer</summary>
Tashkent Central **35.2 %**, Tashkent South 32.8 %, Tashkent North 32.0 % (of Tashkent's 81 679 738 071); every single-branch region shows 100 % under its branch. On the region rows the column shows the share of the **grand total** — Tashkent 39.1 %, Fergana 11.9 %, Samarkand 11.8 % … Termez 5.1 % — because the region's parent is the whole table. One field, two levels of `PARTITION BY`.
</details>

**P5.** Top-5 branches by outstanding: Rows `branch`, Value Filter → **Top 10** → Top 5 by Sum of outstanding, sorted descending; and the share of the book they carry (a formula on the pivot's total vs `SUM(tblLoans[outstanding])`).

<details><summary>Answer</summary>
Tashkent Central 28 716 674 373 · Tashkent South 26 787 392 136 · Tashkent North 26 175 671 562 · Fergana Central 24 797 334 197 · Samarkand Central 24 655 889 676; pivot total 131 132 961 944 = **62.8 %** of 208 723 504 430. A Top-N filtered pivot's Grand Total is the total of the *shown* rows — the reason the share needs the Table's sum in the denominator, not the pivot's.
</details>

**P6.** Add a slicer on `product` and a timeline on `disbursed_at`, connected to the P2 and P5 pivots. Set the timeline to **Q3 2026** and the slicer to **Small business loan**. Count and amount? Then clear both.

<details><summary>Answer</summary>
**114** SME loans in July–September 2026 (all products: 1 086); read the amount off your pivot. The P5 pivot re-ranks under the filter (Fergana Central climbs — SME-heavy, week 3 S6). Clear with the slicer's corner icon; a page left filtered is the most common "the numbers are wrong" call on a Monday morning. Slicers filter the pivot, not the Table, so a check on the Table cannot see them — put the pivot's grand total next to the Table's `SUM` as a visible pair: equal means unfiltered.
</details>

**P7.** A calculated field: with Tuesday's `rate` column on `tblLoans`, add `run_rate = outstanding * rate / 12` and show it by product. Then try `avg_ticket = principal / loan_id` — what happens, and what is the fix?

<details><summary>Answer</summary>
SME 2 727 680 419 · Auto 1 153 685 427 · Consumer 576 373 333 · Micro 33 463 723 · BNPL 0 — total **4 491 202 901** a month (Tuesday's `SUMPRODUCT`). `principal / loan_id` *divides the sum of principal by the sum of the ids* — nonsense without an error. Fix: a column `one` = 1 in the data and `= principal / one`, or just *Average of principal* in Values. Calculated fields see sums, never counts.
</details>

**P8.** Six `GETPIVOTDATA` cells above the pivots: total outstanding, SME outstanding, loans in 90+, Tashkent Central outstanding, September 2026 principal, 2026 running total. Then sort a pivot differently — do the cells survive?

<details><summary>Answer</summary>
`=GETPIVOTDATA("outstanding", $A$20)` → 208 723 504 430; `=GETPIVOTDATA("outstanding", $A$20, "product", "Small business loan")` → 125 892 942 411; `=GETPIVOTDATA("loan_id", $A$40, "bucket", "90+")` → 234; and so on — the first argument is the *field name*, the second any cell in the pivot. They survive sorting and filtering because they address by name, which a `=B22` reference does not. They break (`#REF!`) if the item is filtered out by a slicer — the honest result.
</details>

**P9.** Four charts for Madina from P1–P5: a sorted bar (outstanding by product), a line of monthly disbursements over all 34 months from `monthly_disbursements.csv` (pivot: month → Sum of amount) with a **3-month moving average** (Chart Design → Add Chart Element → Trendline → Moving Average, period 3), a stacked column of delinquent loans by product and bucket (dpd > 0), and a top-5 bar. Give each a finding title.

<details><summary>Answer</summary>
Titles, for example: *"SME is 60 % of the book on 10 % of the loans"*; *"Disbursements climbed from 3.9 bn (Jan 2024) to a 20 bn run-rate — read the 3-month average, not the month"*; *"Consumer and Micro carry most late loans; SME carries the money"* (90+: Consumer 77 · Micro 76 · BNPL 42 · SME 29 · Auto 10); *"Three Tashkent branches plus Fergana and Samarkand hold 63 % of outstanding"*. The line chart's **October** point must be dropped or marked (one day, 0.85 bn — it looks like a crash). Bars from zero; no legend on the single-series charts; red only for 90+.
</details>

**P10.** Sparklines: a pivot of `monthly_disbursements.csv` with products in Rows and 2026 months in Columns (Sum of amount), a sparkline per row with high and low points, same axis for all. Which product is most volatile, and which looks volatile only because its axis is its own?

<details><summary>Answer</summary>
SME swings 6.0 → 15.4 bn (Feb → Jul) — the most volatile and the biggest. With *Same for All Sparklines*, Micro (0.20–0.35 bn) and BNPL (0.19–0.33) flatten to a line; with each row on its own axis they look as jagged as SME. Auto 1.8–6.2 bn is the second mover. Sparklines compare *shape*; the axis setting decides whether they also compare *size* — state which in the column header.
</details>

<span class="badge stretch">Stretch</span> **P11.** On yesterday's merged `installments_paid` query, a pivot with `due_month` in Rows, Sum of `total_due`, Sum of `paid`, and a **calculated field** `rate = paid / total_due` (as `0.0%`). Does it reproduce the Company corner table? Add a slicer on `product` (merge it in from `Loans` first) — which product collects worst in September?

<details><summary>Answer</summary>
Yes: Jun 96.9 · Jul 96.7 · Aug 96.5 · **Sep 94.1 %** — a ratio of sums, so the calculated field is right here. By product in September, read your pivot: Micro and Consumer run below the book, SME above, BNPL (no interest) near the top — and quote the counts with the rates, because a product with 66 September instalments moves by a point when one is unpaid.
</details>

### Mistakes that cost a point this week

- A pivot on a fixed range — new rows never arrive; build on the Table or the query.
- Forgetting **Refresh** after a Power Query refresh — the pivot shows last week's cache.
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

1. Which Show Values As option gives a branch's share of its region, and what does it show on the region row itself? *(→ section 1, "Value Field Settings", P4)*
2. Why can a calculated field not compute an average ticket as `principal / count`? *(→ section 1, "Calculated fields", P7)*
3. Name three rules of chart honesty that are not matters of taste. *(→ section 1, "Charts")*

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
| 5 | **FPD30, last mature vintage** | on `installments_paid` (Day 3 P8) + a `first_paid` column (`MINIFS` of `paid_at` per instalment, ≤ as-of) + the loan's disbursement month (`XLOOKUP` from tblLoans): flag = `paid < total_due` OR `first_paid > due_date + 30`, for `installment_no = 1`; pivot by vintage month: Sum of flag / Count | July 2026: **4 of 367 = 1.09 %** (June 3/373 = 0.80 %, May 7/377 = 1.86 %; August has only 11 of 358 first instalments mature — not readable) |
| 6 | **Collection rate** | Day 3's Company corner pivot, September row | **94.1 %** (15 982 118 926 / 16 987 977 718) |

Tile 5 is the only one that needs three tables (installments, payments, loans); it is also the one a board member will ask about, so its definition line is the longest: *first instalment not fully paid, or first payment more than 30 days late; payments through 2026-10-01; vintage = month of disbursement; shown for the newest vintage whose first due dates are all ≥ 30 days old.* The other five fit in half a line each.

**Chart choice, with reasons** (the sentence you say if asked "why not a pie?"):

1. **Outstanding by product — horizontal bar, sorted.** Five categories with long names, one measure; the board compares lengths. A pie would hide the two 0.5 % products and invite "why is the pie not labelled". Title: *SME is 60 % of the book on 10 % of the loans.*
2. **Disbursements by month — line, 34 points, with a 3-month moving average.** Time on the x-axis is a line's job; the moving average is the trend and the monthly line is the noise. October is excluded (one day) and the exclusion is in the footnote. Secondary axis for the loan *count* only if the board asked for it; otherwise the count goes in a sparkline in the tile strip. Title: *From 4 bn to a 20 bn month in 33 months; 2026 has already out-lent 2025.*
3. **Delinquent loans by product and bucket — stacked column (dpd > 0 only).** Composition within a category; 90+ in red, the others in three greys. Showing bucket 0 would make the stack 7 429 tall and the rest invisible. Title: *Most late loans are Consumer and Micro; most late money is SME* (the money version is a second stacked column of outstanding, if there is room).
4. **Top-5 branches — horizontal bar.** A ranking; largest on top; the other five branches summed as *Others* so the bars add to the book. Title: *Three Tashkent branches, Fergana and Samarkand hold 63 % of outstanding.*

**Reading the page together** (the five sentences under the charts, Bekzod's script): the book is 208.7 bn and grows about 7 bn a month while 12–22 bn is disbursed monthly — short Micro/BNPL/Consumer terms repay fast; SME is 60 % of outstanding on 10 % of loans, so SME credit decisions drive the balance sheet; PAR30 3.1 % and NPL90 2.6 % are close, so the at-risk book is old debt (5.3 of 6.5 bn already 90+), not a new wave; FPD30 1.1 % on the July vintage is in line with the 1.28 % history; the September collection rate of 94.1 % means 5.9 % of what fell due is the inflow to the 1–30 bucket — Sevara's caseload next month.

Then the agreement check with Timur: six tiles, six view queries from week 3, six equal numbers. If one differs, the definition differs — find the word that is different (as-of, de-duplicated, due-in-month) before anyone touches a formula.

> Interview version: *"Put a lending portfolio on one page."* — Six tiles (outstanding, disbursements MTD + last full month, PAR30, NPL90, FPD30 of the last mature vintage, collection rate), each with its definition and as-of; four charts chosen by question (bar for categories, line + moving average for time, stacked for composition, bar for ranking), titles that state the finding, bars from zero; pivots on a data sheet, slicers connected, everything refreshable; and the numbers reconciled to the warehouse views.

Tomorrow: the checkpoint — clean both dirty files, build the page on the clean data, write the five findings, answer eight questions.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w04d4", "pass": 0.8, "questions": [
  {"type": "single", "q": "A pivot has region then branch in Rows, and Sum of outstanding shown as % of Parent Row Total. What does a branch row show?", "options": ["The branch's share of the whole book", "The branch's share of its own region", "The branch's running total", "The difference from the previous branch"], "answer": 1, "explain": "% of Parent Row Total is SUM(x) / SUM(SUM(x)) OVER (PARTITION BY region); on the region rows it shows the share of the grand total (→ section 1, Show Values As; P4)."},
  {"type": "single", "q": "You add this calculated field to get the average ticket per product. What do you get?", "code": "avg_ticket = principal / loan_id", "options": ["The average principal per loan", "The sum of principal divided by the sum of the loan ids — nonsense, with no error", "#DIV/0!", "The count of loans"], "answer": 1, "explain": "Calculated fields work on sums, never counts; use Average of principal in Values, or a column of 1s (→ section 1, Calculated fields; P7)."},
  {"type": "single", "q": "Which chart for disbursements by month over 34 months?", "options": ["A pie, one slice per month", "A line, with a 3-month moving average for the trend", "A 3D column chart", "A stacked bar sorted by amount"], "answer": 1, "explain": "Time on the x-axis is a line's job; the moving average is the trend, the monthly line the noise (→ section 1, Charts; section 6)."},
  {"type": "multi", "q": "Which chart rules are not matters of taste?", "options": ["Bars and columns start at zero", "No 3D", "The title states the finding", "Use a pie whenever you show shares", "Give every bar its own colour"], "answer": [0, 1, 2], "explain": "A pie hides small slices, and one colour plus one highlight keeps the eye on the point (→ section 1, Charts; The anatomy of an honest chart)."},
  {"type": "number", "q": "Two branches have 150 and 160 bn outstanding. The column chart's axis starts at 140 bn. How many times taller does the 160 bar LOOK than the 150 bar?", "code": "bar heights drawn: 160 − 140 and 150 − 140", "answer": 2, "explain": "20 vs 10 units: the eye reads 'twice as big' for a 7 % difference — bars start at zero (→ section 1, Charts; section 2, Three charts that lie)."},
  {"type": "single", "q": "Power Query refreshed this morning with new loans, but the pivot still shows last week's totals. Why?", "options": ["Pivots cannot read queries", "The pivot reads its own cache; it updates only on Refresh (or Refresh All)", "The slicer is hiding the new rows", "Pivots ignore rows added after creation"], "answer": 1, "explain": "Build on a Table or query output and refresh the pivot after the data (→ section 1, Refresh and the cache)."},
  {"type": "single", "q": "A pivot is filtered to the Top 5 branches. You divide its Grand Total by itself to get 'share of the book'. What is wrong?", "options": ["Nothing", "A filtered pivot's Grand Total is the total of the shown rows only, so the share comes out 100 %; divide by the Table's SUM instead", "Top-N filters do not change totals", "GETPIVOTDATA is required"], "answer": 1, "explain": "The denominator must come from the unfiltered book (→ P5)."},
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
