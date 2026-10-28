# Week 7 · Day 4 — Power BI II: DAX and visuals that tell the story

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 60 min</span> <span class="badge hw">HW 7.2 due tomorrow</span> <span class="badge company">Company corner</span>

> STORY **Thursday, 9:00.** Bekzod, portfolio manager (*портфельный менеджер*), with last quarter's board pack: forty Excel screenshots in a PowerPoint. *"Timur says your model is clean. Good — then I want the **board pack in Power BI: a portfolio page, a risk page, a collections page.** Same numbers as the week-3 tiles, so nobody asks why they differ. Every number a board member can click into: which branch, which product, which month. And Sevara wants the collections page for herself every Monday — **her branch managers should see only their own branch.**"* Timur: *"Measures first. Every card is a measure, and every measure is one sentence of DAX — if you understand `CALCULATE`."*

## Today in 3 lines

- **DAX** in one idea: a measure is evaluated in a **filter context** (the slicers, the row and column of the cell); **`CALCULATE`** changes that context. Around it: row context vs filter context, `FILTER`, `ALL` / `ALLEXCEPT` / `REMOVEFILTERS` / `ALLSELECTED`, `DIVIDE`, `VAR … RETURN`, time intelligence (`TOTALYTD`, `SAMEPERIODLASTYEAR`, `DATEADD`), `RANKX`, `SWITCH`, dynamic titles — each with the number it must show (`data/powerbi/measures.dax`, 32 measures).
- **Visuals that tell the story**: cards, line, clustered bar, a matrix with conditional formatting, slicers, drill-through, a tooltip page, bookmarks; the layout rules (top-left = most important, ≤ 7 visuals a page, one colour for "bad").
- **Sharing**: publish to the Power BI Service and schedule a refresh (needs a work account — or share the `.pbix` / a PDF export), and **row-level security** so a branch manager sees one branch. The Company corner specifies the three board pages with every card's expected number.

---

## 1. Learn — one function to understand

> 🧭 **Before you start.** Open yesterday's `nur_week7.pbix` in Power BI Desktop — today builds on that model (if HW 7.2 is not finished, do Day 3's worked example first). Download `data/powerbi/measures.dax` (all 32 measures, to paste from) and, if they are not in your model yet, `data/powerbi/fct_collections_actions.csv`, `data/powerbi/staff_collectors.csv` and `data/powerbi/roll_rates.csv`. The DAX on this page goes into Power BI's formula bar (Home → New measure) — it does not run in the page, and the boxes check the numbers your visuals show. **End state today:** the measures of Practice in the model, the risk matrix with conditional formatting, a drill-through page, a role tested with View as — the raw material for tomorrow's three pages.

### Measure vs calculated column — two contexts

**What it is.** **DAX** (*Data Analysis Expressions*) is Power BI's formula language. It has two homes. A **calculated column** (*вычисляемый столбец*) is computed once per row at refresh, in a **row context** (*контекст строки*): "this row". A **measure** (*мера*) is computed for every cell of every visual, in a **filter context** (*контекст фильтра*): "the rows the filters leave visible".

**How to write it.** Home → **New column** for a column, Home → **New measure** for a measure; the formula bar takes `Name = expression`.

```dax
is_90plus   = IF ( v_loan_status[dpd] > 90, "yes", "no" )     -- column: one value per loan, read in this row
Outstanding = SUM ( v_loan_status[outstanding] )              -- measure: one value per cell, over the visible rows
```

| | calculated column | measure |
|---|---|---|
| computed | once per row, at refresh; stored | at query time, for each cell; stores nothing |
| context | row context: this row | filter context: the slicers, the row and column of the cell |
| use for | values you slice or filter by (a band, a flag, a key) | every number a visual shows, every ratio |
| loan 1 | `is_90plus` = "no" | — (a measure has no value per row) |

**When you use it.** Ask: "will I slice by it, or show it as a number?" Slice → column. Show → measure.

> ⚠️ **Watch out.** In a column, `SUM ( v_loan_status[outstanding] )` ignores the row — a column has no filter context, so it sums the whole table: 208 723 504 430 on every row.

**Your turn.** Nilufar needs a "90+ or not" field to slice by, and the NPL90 % on a card. Which is which?

```task
{"id": "w07d4-l1", "kind": "choice", "options": ["Both columns", "Both measures", "The 90+ flag is a column (a value per loan to slice by); NPL90 % is a measure (a ratio computed in each cell)", "The flag is a measure; NPL90 % is a column"], "answer": 2, "explain": "A slicer needs a stored value per row. A ratio must be computed after the filters, as a ratio of sums — that is a measure."}
```

### The first measures — SUM, COUNTROWS, DIVIDE

**What it is.** Three functions make most measures. **SUM** adds a column over the visible rows. **COUNTROWS** counts the visible rows of a table. **DIVIDE** divides and returns blank (or a value you choose) when the denominator is 0 or blank.

**How to write it.**

```dax
Disbursed Amount = SUM ( v_loan_status[principal] )                     -- SUM ( table[column] )
Disbursed Count  = COUNTROWS ( v_loan_status )                          -- COUNTROWS ( table )
Avg Ticket       = DIVIDE ( [Disbursed Amount], [Disbursed Count] )     -- DIVIDE ( numerator, denominator [, if zero] )
```

| measure | no filter | SME | MICRO |
|---|---|---|---|
| Disbursed Amount | 404 783 280 000 | 241 117 150 000 | 7 221 210 000 |
| Disbursed Count | 7 828 | 781 | 2 669 |
| Avg Ticket | 51 709 668 | 308 728 745 | 2 705 586 |

Avg Ticket for the whole book: 404 783 280 000 ÷ 7 828 = 51 709 668 soum. A measure can use other measures (`[Disbursed Amount]`) — write each definition once.

**When you use it.** Every card and every value in a table. Then format the measure once (Measure tools → Format) and every visual inherits it.

> ⚠️ **Watch out.** Write ratios with `DIVIDE`, never `/`. `a / b` with b = 0 shows "Infinity" on a card and breaks totals and charts.

**Your turn.** What does `Avg Ticket` show for CONS?

```task
{"id": "w07d4-l2", "kind": "number", "answer": 26926915, "dp": 0, "unit": "soum", "hint": "A table by products[code] with Avg Ticket — or 65 109 280 000 ÷ 2 418.", "model": "26 926 915 = 65 109 280 000 / 2 418 loans. The same measure gives a different number in each row because each row has its own filter context."}
```

### Filter context in one picture

**What it is.** A measure has no value of its own — only a value **in a cell**. The cell's filters are its filter context: the slicers on the page, the visual's row and column, page and report filters. Relationships carry them from the dimensions to the fact. Then the measure runs over the rows that are left.

```pic
{"id": "w07d4-pic1", "title": "A cell's filters keep some rows; the measure sums those", "caption": "The cell \"Bukhara Central × SME\": the row filter and the column filter reach `v_loan_status` through the relationships. Green rows pass both, struck-through rows fail one; `SUM` over all 59 green loans gives the cell's number.", "tables": [{"id": "f", "name": "v_loan_status", "cols": ["branch_name", "product", "outstanding"], "rows": [["Bukhara Central", "AUTO", "312 219 576"], ["Bukhara Central", "SME", "20 361 906"], ["Bukhara Central", "SME", "432 365 031"], ["Termez Central", "SME", "270 179 178"], ["Bukhara Central", "SME", "227 514 450"], ["Termez Central", "AUTO", "164 572 698"]], "tags": {"branch_name": "row", "product": "column"}, "keep": [1, 2, 4], "drop": [0, 3, 5], "more": "… 7 828 loans"}, {"id": "c", "name": "cell", "cols": ["loans", "Outstanding"], "rows": [[59, "10 343 220 604"]], "new": ["Outstanding"], "via": "SUM over the green rows"}], "stack": true}
```

**How to read it.** A matrix: rows `branches[branch_name]`, columns `products[code]`, value `Outstanding`.

| | AUTO | SME | Total |
|---|---|---|---|
| Bukhara Central | 2 658 012 650 | **10 343 220 604** | 15 116 046 338 |
| Termez Central | 2 425 978 081 | 6 532 445 882 | 10 670 177 559 |
| Total | 57 684 271 333 | 125 892 942 411 | 208 723 504 430 |

```text
cell "Bukhara Central × SME"
  filter 1: branches[branch_name] = "Bukhara Central"    ← the row
  filter 2: products[code] = "SME"                         ← the column
  (+ every slicer on the page)
        │ relationships carry both to v_loan_status
        ▼
  SUM ( v_loan_status[outstanding] ) over Bukhara's SME loans  =  10 343 220 604
```

The total row has only the column filter; the grand total has none.

**When you use it.** Every time a number surprises you: list the cell's filters first, then read the formula.

> 💡 **Key idea.** A measure has no value of its own — only a value in a filter context. Change the context and the same formula gives a different number.

**Your turn.** In the matrix above, which filters make the cell "Termez Central × AUTO"?

```task
{"id": "w07d4-l3", "kind": "choice", "options": ["Only products[code] = \"AUTO\"", "branches[branch_name] = \"Termez Central\" and products[code] = \"AUTO\", plus any slicer", "No filters: measures ignore the matrix", "Only the slicers"], "answer": 1, "explain": "The row gives the branch, the column gives the product, slicers add theirs; relationships carry all of them to v_loan_status — 2 425 978 081."}
```

### CALCULATE — change the filter context

**What it is.** **CALCULATE** evaluates an expression in a **modified** filter context. It is the function behind every "of which" number: outstanding *at more than 30 DPD*, loans *in bucket 90+*.

**How to write it.**

```dax
CALCULATE ( <expression>, <filter 1>, <filter 2>, ... )
--          what to compute   how to change the cell's filters

Outstanding DPD30+ = CALCULATE ( [Outstanding], v_loan_status[dpd] > 30 )                    -- 6 507 526 953
PAR30 %            = DIVIDE ( [Outstanding DPD30+], [Outstanding] )                          -- 3.12 %
NPL90 %            = DIVIDE ( CALCULATE ( [Outstanding], v_loan_status[dpd] > 90 ), [Outstanding] )   -- 2.55 %
Loans 90+          = CALCULATE ( COUNTROWS ( v_loan_status ), v_loan_status[bucket] = "90+" )        -- 234
```

Three steps, always: (1) take the cell's filter context; (2) apply each filter argument — it **replaces** any existing filter on the same column, and different columns combine with AND; (3) evaluate the expression there. In the SME row, PAR30 uses both filters — `product = SME` from the row, `dpd > 30` from CALCULATE: **2.55 %**; AUTO **4.44 %**, MICRO **0.72 %**. Week 3's SQL `SUM(CASE WHEN dpd > 30 THEN outstanding END) / SUM(outstanding)` is exactly this.

When the condition involves a measure or several columns, write the filter as a table with **FILTER**: `CALCULATE ( [Outstanding], FILTER ( v_loan_status, v_loan_status[dpd] > 30 && v_loan_status[product] <> "MICRO" ) )`. FILTER walks the table row by row — powerful and slower; filter a column, not the whole fact, when you can.

**When you use it.** Any measure that needs a subset (a bucket, a status, a period) or a different set of rows from the cell's (a total, last year).

> ⚠️ **Watch out.** A filter on a column **replaces** the visual's filter on that column. `CALCULATE ( [Outstanding], v_loan_status[bucket] = "90+" )` in a matrix by bucket shows 5 319 475 527 in **every** row. Wrap it in `KEEPFILTERS ( … )` to intersect instead: 90+ keeps its number, the other rows go blank.

**Your turn.** Fill in PAR30.

```game
{"type": "cloze", "id": "w07d4-g2", "title": "Fill in PAR30", "text": "PAR30 % = {{0}} ( {{1}} ( [Outstanding], v_loan_status[dpd] {{2}} 30 ), [Outstanding] )", "blanks": [["DIVIDE"], ["CALCULATE"], [">"]], "distractors": ["SUM", "FILTER", ">=", "AVERAGE"]}
```

### Context transition — CALCULATE inside a row

**What it is.** Inside a calculated column (or an iterator such as `SUMX`), CALCULATE turns the **current row** into a filter. This is **context transition** (*преобразование контекста*): the row context becomes a filter context.

**How to write it.** Two columns on `v_loan_status`, read for loan 1:

```dax
share = v_loan_status[outstanding] / SUM ( v_loan_status[outstanding] )   -- SUM sees the whole table
own   = CALCULATE ( SUM ( v_loan_status[outstanding] ) )                   -- CALCULATE makes "loan 1" a filter
```

| loan_id | outstanding | share | own |
|---|---|---|---|
| 1 | 9 593 064 | 0.0046 % | 9 593 064 |

`share`: 9 593 064 ÷ 208 723 504 430 — the whole book is the denominator. `own`: the sum over the rows that match loan 1 — just loan 1.

**When you use it.** You rarely write it on purpose; you meet it whenever a measure is called inside a column or an iterator (`[Outstanding]` in a column means `CALCULATE ( SUM ( … ) )`). It explains half of all DAX surprises.

> ⚠️ **Watch out.** A measure used in a calculated column is evaluated per row with context transition — on a large fact that is slow. Keep row-by-row logic in columns of plain values; keep aggregations in measures.

**Your turn.** In a calculated column on `v_loan_status`, what does `CALCULATE ( COUNTROWS ( v_loan_status ) )` return on each row?

```task
{"id": "w07d4-l4", "kind": "number", "answer": 1, "dp": 0, "unit": "row", "hint": "Context transition: the current row becomes the filter.", "model": "1 — each row filters the table down to itself (loan_id is unique). Without CALCULATE, COUNTROWS would return 7 828 on every row."}
```

### ALL and its relatives — the denominators

**What it is.** A share needs a denominator with **fewer** filters than the cell. **ALL** removes filters inside CALCULATE. Its relatives remove different amounts:

| function | removes | with a branch slicer on Tashkent Central, the SME row shows |
|---|---|---|
| `ALL ( products )` = `REMOVEFILTERS ( products )` | filters on `products` only | **55.30 %** (SME's share of Tashkent Central) |
| `ALL ( v_loan_status )` | every filter reaching the fact, including those from its dimensions | **7.61 %** (Tashkent Central SME ÷ the whole book) |
| `ALLEXCEPT ( v_loan_status, branches[branch_name] )` | everything except the branch | 55.30 % |
| `ALLSELECTED ( products )` | the row's product filter; keeps the user's slicer selections | depends on the product slicer |

**How to write it.**

```dax
Outstanding Share of Total =
DIVIDE (
    [Outstanding],                                         -- the cell's own outstanding
    CALCULATE ( [Outstanding], ALL ( products ) )          -- the same, with the product filter removed
)
-- no slicer: SME 60.32 % · AUTO 27.64 % · CONS 11.05 % · BNPL 0.54 % · MICRO 0.46 % · total 100 %
```

```pic
{"id": "w07d4-pic2", "title": "ALL removes the row's filter from the denominator", "caption": "Each row's own outstanding over the same row with the product filter removed: the denominator column is the whole book in every row, 208.7 bn, and the shares add up to 100 %.", "tables": [{"name": "products × Outstanding", "cols": ["code", "bn", "ALL(products)", "share"], "rows": [["SME", "125.9", "208.7", "60.32 %"], ["AUTO", "57.7", "208.7", "27.64 %"], ["CONS", "23.1", "208.7", "11.05 %"], ["BNPL", "1.1", "208.7", "0.54 %"], ["MICRO", "1.0", "208.7", "0.46 %"]], "new": ["ALL(products)", "share"], "cells": [[0, "share"]]}]}
```

**When you use it.** Any "share of" or "% of total": name the denominator first ("of this branch", "of the whole book", "of what the user selected"), then pick the function.

> ⚠️ **Watch out.** `CROSSFILTER ( …, BOTH )` inside one measure is how you get bidirectional filtering for one calculation — never by switching the model's relationship to Both.

**Your turn.**

```game
{"type": "build", "id": "w07d4-g3", "title": "Build the share of the whole product mix", "q": "Write the measure that gives each product's share of outstanding, whatever the product row says.", "tokens": ["Outstanding Share of Total =", "DIVIDE (", "[Outstanding],", "CALCULATE ( [Outstanding],", "ALL ( products ) ) )"], "distractors": ["ALLSELECTED ( v_loan_status ) ) )", "SUM ("]}
```

### Time intelligence — TOTALYTD, SAMEPERIODLASTYEAR, DATEADD

**What it is.** **Time intelligence** (*логика операций со временем*) functions return **a set of dates**, and CALCULATE uses that set as the filter. They work only with a marked, gap-free date table related to the fact (Day 3).

**How to write it.**

```dax
YTD Disbursed        = TOTALYTD ( [Disbursed Amount], dim_date[date] )                          -- 1 January → the cell's last date
Disbursed SPLY       = CALCULATE ( [Disbursed Amount], SAMEPERIODLASTYEAR ( dim_date[date] ) )  -- the same dates, a year back
Disbursed Prev Month = CALCULATE ( [Disbursed Amount], DATEADD ( dim_date[date], -1, MONTH ) )  -- shift by any number of days / months / years
Disbursed YoY %      = DIVIDE ( [Disbursed Amount] - [Disbursed SPLY], [Disbursed SPLY] )
Disbursed MoM %      = DIVIDE ( [Disbursed Amount] - [Disbursed Prev Month], [Disbursed Prev Month] )
```

| `dim_date[year_month]` | Disbursed | YTD | SPLY | YoY % | Prev Month | MoM % |
|---|---|---|---|---|---|---|
| 2026-08 | 22 290 210 000 | 144 464 810 000 | 17 667 620 000 | +26.16 % | 20 693 870 000 | +7.71 % |
| 2026-09 | 17 015 490 000 | 161 480 300 000 | 14 644 540 000 | +16.19 % | 22 290 210 000 | −23.66 % |

September 2026: 17.0 bn disbursed, 16.2 % more than September 2025 but 23.7 % less than August. YTD at September: 161.5 bn, against 110.9 bn at the same point last year (+45.6 %).

**When you use it.** Every "so far this year", "same month last year", "previous month" on a card or a table — on the `dim_date` axis.

> ⚠️ **Watch out.** Without a marked, contiguous `dim_date`, or with a visual on the fact's own date column, these functions return blanks or wrong periods without an error.

**Your turn.** What does `Disbursed Prev Month` show in the August 2026 row?

```task
{"id": "w07d4-l5", "kind": "number", "answer": 20693870000, "dp": 0, "unit": "soum", "hint": "DATEADD shifts August back one month: July 2026's Disbursed Amount.", "model": "20 693 870 000 — July 2026. MoM for August: (22 290 210 000 − 20 693 870 000) / 20 693 870 000 = +7.71 %."}
```

### Balances over time — semi-additive measures

**What it is.** A **flow** (disbursed, collected) adds up over time. A **balance** (outstanding) does not: the book at the end of the year is the last month's balance, not the sum of twelve. A measure that sums over everything except time and takes the **last period** is **semi-additive** (*полуаддитивная мера*).

```pic
{"id": "w07d4-pic3", "title": "A year's balance is its last month, not the sum of twelve", "caption": "Month-end outstanding of 2026 from `v_portfolio_monthly`, bn soum. `Outstanding Month-End` for the year shows the last bar, October's 196.4 bn; a plain `SUM` adds all ten bars into 1 808.1 bn — a book that never existed.", "chart": {"type": "bars", "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"], "values": [151.8, 154.1, 164.0, 171.7, 179.7, 184.6, 193.7, 203.8, 208.2, 196.4], "hl": [9], "show": true, "note": "y: month-end outstanding, bn soum, 2026"}}
```

**How to write it.**

```dax
Outstanding Month-End =
VAR LastMonth = CALCULATE ( MAX ( v_portfolio_monthly[month] ) )          -- the last month visible in the cell
RETURN
    CALCULATE ( SUM ( v_portfolio_monthly[outstanding_month_end] ),
                v_portfolio_monthly[month] = LastMonth )                   -- sum products and branches, for that month only
```

| period | plain `SUM` of month-end | `Outstanding Month-End` |
|---|---|---|
| Aug 2026 | 203 830 205 928 | 203 830 205 928 |
| Sep 2026 | 208 243 879 623 | 208 243 879 623 |
| year 2026 (Jan–Oct) | **1 808 092 257 935** — ten balances added | 196 392 195 577 — October, the last month |
| year 2026, months ≤ Sep | — | **208 243 879 623** |

**When you use it.** Every balance on a trend line or a year total: outstanding, number of active loans, headcount.

> ⚠️ **Watch out.** `v_loan_status` is dated by **disbursement**. A month slicer on the card `Outstanding` shows the outstanding of loans disbursed that month (September 2026: 16 965 990 458), not the book at September's end. The trend line uses `Outstanding Month-End`; the card says "as of 1 Oct 2026".

**Your turn.** Which measure goes on a monthly line chart of the book?

```task
{"id": "w07d4-l6", "kind": "choice", "options": ["Outstanding (the as-of card measure)", "SUM ( v_portfolio_monthly[outstanding_month_end] )", "Outstanding Month-End", "Disbursed Amount"], "answer": 2, "explain": "Month by month a plain SUM happens to agree, but any period longer than a month adds balances. The as-of Outstanding is dated by disbursement. Outstanding Month-End takes the last month of each period."}
```

### Variables — VAR … RETURN

**What it is.** A **variable** (*переменная*) names an intermediate result inside a measure. It is evaluated **once**, in the context where it is defined, and then stays a constant. `RETURN` gives the result.

**How to write it.** A Pareto curve by branch: each branch's outstanding plus every larger branch's.

```dax
Running Outstanding =
VAR CurrentOutstanding = [Outstanding]                                     -- this branch's outstanding, computed once
RETURN
    CALCULATE (
        [Outstanding],
        FILTER ( ALL ( branches[branch_name] ),                            -- walk all ten branches
                 [Outstanding] >= CurrentOutstanding )                     -- keep those at least as large
    )
Running Outstanding % = DIVIDE ( [Running Outstanding], CALCULATE ( [Outstanding], ALL ( branches ) ) )
```

| branch (sorted by Outstanding) | Outstanding | Running Outstanding % |
|---|---|---|
| Tashkent Central | 28 716 674 373 | 13.76 % |
| Tashkent South | 26 787 392 136 | 26.59 % |
| Tashkent North | 26 175 671 562 | 39.13 % |
| Fergana Central | 24 797 334 197 | **51.01 %** |

Four of ten branches hold half the book.

**When you use it.** Whenever a value is needed twice, or must be fixed before the context changes. It also makes long measures readable.

> ⚠️ **Watch out.** Without the variable, `[Outstanding]` inside FILTER is evaluated for each iterated branch — every branch compares itself with itself, and every row shows 100 %.

**Your turn.** One line of this measure breaks the Pareto curve.

```game
{"type": "bug", "id": "w07d4-g5", "title": "The curve that is 100 % everywhere", "q": "Every branch row shows 208 723 504 430. Tap the line that causes it.", "code": "Running Outstanding =\nCALCULATE (\n    [Outstanding],\n    FILTER ( ALL ( branches[branch_name] ),\n             [Outstanding] >= [Outstanding] )\n)", "answer": [4], "why": "Inside FILTER both sides are evaluated for the iterated branch, so the test is always true. Store the row's value first — VAR CurrentOutstanding = [Outstanding] — and compare with the variable."}
```

### RANKX — a rank inside a filter context

**What it is.** **RANKX** walks a table, evaluates an expression for each row, and returns the position of the current cell's value among them.

**How to write it.**

```dax
Branch Rank =
IF (
    HASONEVALUE ( branches[branch_name] ),                 -- only in rows with one branch (blank on the total)
    RANKX ( ALL ( branches[branch_name] ),                 -- rank among all ten branches
            [Outstanding], , DESC, DENSE )                 -- by Outstanding, largest first
)
```

Tashkent Central 1, Tashkent South 2, … Bukhara Central 8, Nukus Central 9, Termez Central 10. A product slicer on SME re-ranks: Tashkent South 1, Tashkent Central 2, Samarkand Central 3.

**When you use it.** Top-N lists, "where does this branch stand", league tables that follow the slicers.

> ⚠️ **Watch out.** Without `ALL`, each row's table holds only its own branch, and every branch ranks 1.

**Your turn.** What is Bukhara Central's `Branch Rank` with no slicer?

```task
{"id": "w07d4-l7", "kind": "number", "answer": 8, "dp": 0, "unit": "", "hint": "Outstanding 15 116 046 338; count the branches above it.", "model": "8 — seven branches have more outstanding (Tashkent Central … Namangan Central); Nukus and Termez have less."}
```

### Choosing visuals by the question

**What it is.** Each visual answers one kind of question. Pick the question first, then the visual — week 4's table, in Power BI.

**How to write it.** Insert from the **Visualizations** pane; drag fields into its wells (Axis, Values, Rows, Columns).

| question | visual | settings that matter |
|---|---|---|
| one number now | **Card** (or the new card visual) | the measure's format; a subtitle with the definition |
| a trend | **Line chart** on `dim_date[year_month]` | the Month-End measure for balances |
| compare categories | **Clustered bar** (horizontal, sorted) | data labels; no 3D, no pie with 5+ slices |
| two dimensions at once | **Matrix** with conditional formatting | colour by a rule or a colour measure |
| a share of a whole, ≤ 3 parts | **Donut / pie**, or a 100 % bar | otherwise a sorted bar |

**When you use it.** Every visual you add. If you cannot say its question in one sentence, it does not belong on the page.

> ⚠️ **Watch out.** A pie of five products makes 0.46 % and 0.54 % unreadable. A sorted bar shows the same shares and the order.

**Your turn.**

```game
{"type": "sort", "id": "w07d4-g6", "title": "Which visual?", "q": "Put each question under the visual that answers it.", "groups": {"Card": ["What is PAR30 today?", "How much was disbursed in September 2026?"], "Line chart": ["How has the book grown month by month in 2026?"], "Clustered bar": ["Which branch has the best collection rate?", "How is outstanding split between the five products?"], "Matrix with conditional formatting": ["Where is PAR30 high — which branch and which product?"]}, "why": "One number → card; a trend → line; categories → a sorted bar; two dimensions → a matrix. Five products are a bar, not a pie."}
```

### Slicers, drill-through and tooltips

**What it is.** Three ways to let the reader ask the next question. A **slicer** (*срез*) filters the page. **Drill-through** (*детализация*) jumps from a value to a detail page for it. A **tooltip page** (*всплывающая подсказка*) shows a small page when the reader hovers.

**How to write it.**
1. **Slicer**: add a Slicer visual with `products[code]`. View → **Sync slicers** to make it filter other pages too.
2. **Drill-through**: a new page *Branch detail*; drag `branches[branch_name]` into its **Drill through** well; add cards and a table of the branch's 90+ loans. Power BI adds a Back button.
3. **Use it**: right-click Bukhara Central in any visual → Drill through → *Branch detail* → Outstanding 15 116 046 338, PAR30 4.81 %, Loans 90+ 23 (of 650 loans).
4. **Tooltip page**: a new page → Page information → **Allow use as tooltip**, small canvas; then in a visual's Format → Tooltip → Page → that page.
5. **Bookmarks** (View → Bookmarks) save a view of the page — e.g. "all loans" vs "delinquent only" — for a guided story. Keep them few.

**When you use it.**

| the reader wants… | use |
|---|---|
| to choose a product, branch or month | slicer (synced across pages) |
| the detail behind one value | drill-through |
| context (n, a definition) without leaving the chart | tooltip page |

> ⚠️ **Watch out.** A slicer that is not synced filters one page only — the next page silently shows the unfiltered book.

**Your turn.** A board member wants to right-click Nukus Central in the risk matrix and see that branch's 90+ loans. What do you build?

```task
{"id": "w07d4-l8", "kind": "choice", "options": ["A second slicer", "A drill-through page with branches[branch_name] in its Drill through well", "A bookmark per branch", "A tooltip on the matrix"], "answer": 1, "explain": "Drill-through jumps from a value to a detail page filtered to it. A tooltip shows context on hover but cannot hold a long table; ten bookmarks do not scale."}
```

### Formatting that respects the reader

**What it is.** Formatting is part of the message. A page is read **top-left first**; a colour means something only if it is used for one thing.

**How to write it.**
1. **Layout** — top row: cards (KPIs), the most important top-left; middle: trends; bottom: detail tables. At most **7 visuals** a page.
2. **Colour** — one colour for "bad" (red), greys and one accent for everything else. Red is never a series colour.
3. **Conditional formatting** by a colour measure: Format → Cell elements → Background colour → **fx** → Format style *Field value* → the measure.

```dax
PAR30 Colour =
SWITCH ( TRUE (),                                   -- the first true condition wins, like CASE WHEN
    [PAR30 %] >= 0.05, "#C0392B",                   -- 5 % and above: red
    [PAR30 %] >= 0.03, "#E67E22",                   -- 3–5 %: amber
    "#7F8C8D" )                                     -- otherwise: grey
```

4. **Titles that state the finding** — "PAR30 is concentrated in Nukus SME and Bukhara", not "PAR30 by branch". A **dynamic title** says what is selected:

```dax
Dynamic Title = "Outstanding - " & SELECTEDVALUE ( products[product_name], "all products" )   -- the selection, or a default
              & " · as of 1 Oct 2026: " & FORMAT ( [Outstanding] / 1e9, "#,0.0" ) & " bn soum"
-- no selection: "Outstanding - all products · as of 1 Oct 2026: 208.7 bn soum"
```

Use it: Format → Title → **fx** → Field value → `Dynamic Title`.

5. **As-of date and definitions** on every page, the same slicers in the same place.

**When you use it.** Before anyone else sees the page — and again before the PDF export.

> ⚠️ **Watch out.** A screenshot of a filtered page without a dynamic title or a visible slicer lies: it looks like the whole book.

**Your turn.** Which choices respect the reader? Tick every one.

```task
{"id": "w07d4-l9", "kind": "multi", "options": ["The PAR30 card top-left", "Red for the AUTO series, green for SME", "A title: \"PAR30 is concentrated in Nukus SME and Bukhara\"", "Eleven visuals on the risk page", "\"Data as of 1 Oct 2026\" in the top strip", "A matrix coloured by PAR30 Colour"], "answer": [0, 2, 4, 5], "explain": "The key number top-left, a title that states the finding, the as-of date, red only for what is bad. Red as a series colour and eleven visuals break the rules."}
```

### Publish and refresh

**What it is.** **Publishing** (*публикация*) uploads the `.pbix` to the **Power BI Service**, where a **scheduled refresh** (*обновление по расписанию*) re-reads the sources and people open the report in a browser.

**How to write it.**
1. Home → **Publish** → a workspace (needs a work or school Microsoft account; personal Gmail / Mail.ru accounts are not accepted).
2. In the Service: the semantic model (dataset) → Settings → **Scheduled refresh** (Pro: up to 8 a day).
3. Files on your PC or a SQL Server inside the bank need an **on-premises data gateway** (*шлюз данных*) installed on a machine that can see them.
4. Share: a **workspace** for builders, an **app** for readers, a **dashboard** (pinned tiles) for executives.
5. **Without a work account** (the course default): share the `.pbix`, or File → Export → **Export to PDF** — every page, the board-pack format. Say which you used.

**When you use it.** Once the numbers match the SQL and the pages pass the formatting check.

> ⚠️ **Watch out.** A scheduled refresh of a report that reads `C:\…\data\powerbi\` fails in the Service unless a gateway can reach that folder.

**Your turn.** The report is published; its scheduled refresh fails with "data source unreachable". The sources are CSVs on your laptop. What is missing?

```task
{"id": "w07d4-l10", "kind": "choice", "options": ["A Pro licence for every reader", "An on-premises data gateway on a machine that can see the folder (or move the files to a cloud location the Service can read)", "A marked date table", "Row-level security"], "answer": 1, "explain": "The Service runs in the cloud; it cannot see your C: drive. A gateway is the bridge to on-premises sources — files and the bank's SQL Server alike."}
```

### Row-level security

**What it is.** **Row-level security** (*безопасность на уровне строк*, RLS) gives a role a DAX filter. A user in the role sees only the rows the filter leaves — on every page, in every measure.

**How to write it.**
1. Modeling → **Manage roles** → New role *Branch manager — Bukhara*.
2. On the `branches` table, the filter:

```dax
[branch_name] = "Bukhara Central"                                         -- a static role: one per branch
-- dynamic, one role for all managers, with a mapping table of e-mail → branch:
-- [branch_name] = LOOKUPVALUE ( map[branch_name], map[email], USERPRINCIPALNAME () )
```

3. Modeling → **View as** → the role. The filter flows through the relationships to every fact:

| card | as yourself | View as *Branch manager — Bukhara* |
|---|---|---|
| Outstanding | 208 723 504 430 | 15 116 046 338 |
| PAR30 % | 3.12 % | 4.81 % |
| Branch Rank | — | 1 |

4. In the Service: semantic model → Security → add people to the role. In Desktop you can only test.

**When you use it.** Whenever one report serves people who may see only part of the data — Sevara's branch managers.

> ⚠️ **Watch out.** RLS removes rows before any measure runs: `ALL ( branches )` cannot escape it, so a rank under RLS is always 1. And RLS restricts rows, not pages — a page a manager must not see belongs in a separate report.

**Your turn.** Viewed as *Branch manager — Bukhara*, what does the card `Loans 90+` show?

```task
{"id": "w07d4-l11", "kind": "number", "answer": 23, "dp": 0, "unit": "loans", "hint": "Loans 90+ counts v_loan_status rows in bucket 90+; the role keeps Bukhara Central's rows.", "model": "23 of Bukhara Central's 650 loans are 90+. The same number the drill-through showed — RLS and drill-through both filter branches."}
```

### Putting it together

One card, every concept of the section:

```text
measure vs column   → PAR30 % is a measure; par30_outstanding is not needed — CALCULATE does it
first measures      → Outstanding = SUM ( … ); DIVIDE for the ratio
filter context      → each matrix cell: branch × product (+ slicers)
CALCULATE           → Outstanding DPD30+ = CALCULATE ( [Outstanding], dpd > 30 )
ALL                 → a share of the whole book next to it
time intelligence   → the PAR30 trend uses dim_date; balances use Month-End
VAR, RANKX          → the worst branch named by rank
visuals             → a card top-left, a matrix with PAR30 Colour, a drill-through to the branch
publish, RLS        → a PDF for the board; each manager sees her branch
```

The worked example below builds exactly this card and its next question.

**Your turn.** Review the words of the day.

```game
{"type": "flash", "id": "w07d4-g1", "title": "DAX words of the day", "cards": [["Row context", "the current row: exists in calculated columns and inside iterators (SUMX, FILTER, RANKX)"], ["Filter context", "which rows a measure sees: slicers, the visual's row and column, page filters, carried by relationships"], ["Context transition", "CALCULATE turns the current row into a filter"], ["CALCULATE", "evaluates an expression in a modified filter context; a filter argument replaces the filters on the same column"], ["KEEPFILTERS", "makes a CALCULATE filter intersect with the existing one instead of replacing it"], ["ALL ( products )", "removes the filters on products only"], ["ALL ( v_loan_status )", "removes every filter reaching the fact, including those coming from its dimensions"], ["ALLSELECTED", "removes the row's own filter but keeps the user's slicer selections"], ["DIVIDE", "a / b that returns blank when b is 0 or blank"], ["Semi-additive measure", "a balance: take the last period's value, never sum it over time"]]}
```

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Measures vs columns — [Learn 80% of DAX in an Hour (Chandoo), 13:39](https://youtu.be/lD7TvkoQ6rY?t=819&end=908)
- ▶ CALCULATE — [Learn 80% of DAX in an Hour (Chandoo), 34:18](https://youtu.be/lD7TvkoQ6rY?t=2058&end=2541)
- ▶ CALCULATE (short, one idea) — [DAX CALCULATE Function Made Easy to Understand (Leila Gharani), 00:38](https://youtu.be/40xO1MD_CCs?t=38&end=241)
- ▶ Time intelligence — [Time Intelligence DAX | Current, Previous & SamePeriodLastYear | MTD QTD YTD | MoM QoQ YoY POWER BI (Rahim Zulfiqar Ali), 13:07](https://youtu.be/WsWDjH-CgHg?t=787&end=969)
- ▶ Time intelligence, needs the marked date table — [My number 1 trick for TIME INTELLIGENCE (How to Power BI), 00:30](https://youtu.be/I8Y5fBGwqeQ?t=30&end=66)
- ▶ Visuals — [Power BI for Data Analytics - Full Course for Beginners (Luke Barousse), 1:13:27](https://youtu.be/FwjaHCVNBWA?t=4407&end=5536)
- ▶ Visuals and the full project — [Learn Power BI in Under 3 Hours (Alex The Analyst), 1:09:26](https://youtu.be/I0vQ_VLZTWg?t=4166&end=4960)
- ▶ (RU) DAX basics — [Power BI с нуля — полный гайд | Часть 1 (MrAnalitik), 39:33](https://youtu.be/A2r6or-Dm28?t=2373&end=4004)

- RU deck (TBC Data Analytics 2.0, if you have it) `Power BI 7.2.pptx`: M vs DAX — slide 9; DAX syntax, types, operators — slides 10–12; the most used functions (math and statistics, `DIVIDE`; logical `IF`, `AND`, `OR`) — slides 13–14; links — slide 15. RU deck (TBC Data Analytics 2.0, if you have it) `Power BI 7.3.pptx`: why visualise and visual categories — slides 3–6; **allocation of visuals (top / middle / bottom)** — slide 7; publishing to the web, refresh settings — slides 8–9; dashboards vs reports, sharing — slides 10–12; homework — slide 13.
- `Power BI 7.2.pbix`, `Power BI 7.3.pbix` — the lecture files (binary; open them in Power BI Desktop, not readable here). `Homework.zip` — the 7.3 homework: `flights.csv` (72 MB, US flights), `airline_carriers.csv` and a task list: load and relate, a calculated column *Delay / On-Time* (`DepDelay` or `ArrDelay` > 0), a visual of the % share of each status, flights by carrier name, then a **Top N** filter to the top 5 carriers. A good extra hour on someone else's data with exactly today's tools.
- DAX guide `Подробное руководство по DAX.pdf` (PDF page = book page): calculated columns vs measures pp. 51–56, variables p. 56; `ALL` / `ALLEXCEPT` pp. 90–104; **evaluation contexts** pp. 105–141 (filter context p. 106, row context p. 112); **`CALCULATE`** pp. 142–205 (context transition pp. 177–193, modifiers pp. 194–203); variables pp. 206–218; iterators and **`RANKX`** pp. 219–248 (`RANKX` p. 235); **time intelligence** pp. 249–312; working with the filter context pp. 348–380. Read chapters 4 and 5 once; come back to 8 when a YTD looks wrong.
- *Russian terms:* мера = measure, вычисляемый столбец = calculated column, контекст строки / фильтра = row / filter context, преобразование контекста = context transition, итератор = iterator, переменная = variable, логика операций со временем = time intelligence, нарастающий итог с начала года = year-to-date, аналогичный период прошлого года = same period last year, полуаддитивная мера = semi-additive measure, ранжирование = ranking, условное форматирование = conditional formatting, срез = slicer, детализация = drill-through, всплывающая подсказка = tooltip, закладка = bookmark, публикация = publish, шлюз данных = data gateway, безопасность на уровне строк = row-level security.

```videoquiz
{"video": "lD7TvkoQ6rY", "stops": [{"at": 850, "q": "What is the difference between a measure and a calculated column?", "options": ["A column is computed per row and stored; a measure is computed for each cell of a visual at query time", "A measure is stored, a column is not", "Columns cannot use DAX", "None"], "answer": 0, "explain": "Ratios and totals are measures; values you slice by are columns."}, {"at": 2200, "q": "What does CALCULATE do?", "options": ["Sums a column", "Evaluates an expression in a modified filter context", "Creates a table", "Formats a number"], "answer": 1, "explain": "Its filter arguments replace the filters on the same columns and add the rest.", "back": 60}, {"at": 2450, "q": "A CALCULATE filter on bucket shows the same number in every bucket row. Why?", "options": ["The visual is not refreshed", "DIVIDE is missing", "A bug in Power BI", "The filter argument replaces the row's filter on the same column"], "answer": 3, "explain": "Use KEEPFILTERS to intersect instead of replace."}]}
```

```videoquiz
{"video": "40xO1MD_CCs", "stops": [{"at": 100, "q": "CALCULATE ( [Outstanding], v_loan_status[dpd] > 30 ) in the SME row computes…", "options": ["An error", "All 30+ DPD outstanding in the book", "SME outstanding at more than 30 DPD", "SME outstanding"], "answer": 2, "explain": "The row's product filter stays; the dpd filter is added: both apply."}, {"at": 200, "q": "Which part of CALCULATE changes the context?", "options": ["The filter arguments", "The measure name", "The format", "The expression"], "answer": 0, "explain": "Expression first, then any number of filters.", "back": 50}]}
```

```videoquiz
{"video": "WsWDjH-CgHg", "stops": [{"at": 850, "q": "SAMEPERIODLASTYEAR returns…", "options": ["A number", "A set of dates shifted back one year, used by CALCULATE as a filter", "Last year's total", "A table of products"], "answer": 1, "explain": "Time-intelligence functions return dates; CALCULATE evaluates the measure on them."}, {"at": 940, "q": "YoY % should be written as…", "options": ["SUM(this) − SUM(last)", "AVERAGE of monthly growth", "(this − last) / last with /", "DIVIDE ( this − last, last )"], "answer": 3, "explain": "DIVIDE returns blank when last year is empty instead of Infinity.", "back": 50}]}
```

```videoquiz
{"video": "I8Y5fBGwqeQ", "stops": [{"at": 50, "q": "What does time intelligence need?", "options": ["DirectQuery", "Dates as text", "A contiguous date table, marked as the date table and related to the fact", "Auto date/time on every column"], "answer": 2, "explain": "Mark dim_date and use it everywhere: one calendar, one answer."}, {"at": 64, "q": "Why switch off Power BI's automatic date tables once dim_date is marked?", "options": ["Each date column gets its own hidden calendar — two calendars, two answers", "They break relationships", "They cannot be sorted", "They are slower but give the same answer"], "answer": 0, "explain": "Marking dim_date switches them off for the model's dates.", "back": 25}]}
```

```videoquiz
{"video": "FwjaHCVNBWA", "stops": [{"at": 4700, "q": "Which visual answers \"one number now\"?", "options": ["A line chart", "A card", "A pie", "A scatter"], "answer": 1, "explain": "Cards on top, the most important one top-left."}, {"at": 5100, "q": "What is the right visual for a trend over months?", "options": ["Card", "Table sorted by name", "Pie", "Line chart on the date dimension"], "answer": 3, "explain": "For balances, use the Month-End measure on the line.", "back": 60}, {"at": 5450, "q": "How do you show two dimensions at once with a colour for 'bad'?", "options": ["Ten cards", "Two pies", "A matrix with conditional formatting", "A 3D column chart"], "answer": 2, "explain": "PAR30 by branch × product, red only for what is bad."}]}
```

```videoquiz
{"video": "I0vQ_VLZTWg", "stops": [{"at": 4400, "q": "What makes a report page readable?", "options": ["A few visuals, the key number top-left, titles that say what the chart means", "Every colour of the theme", "3D effects", "As many visuals as fit"], "answer": 0, "explain": "≤ 7 visuals a page; one colour for bad."}, {"at": 4800, "q": "A slicer should affect several pages. What do you use?", "options": ["Copy it to every page and set each by hand", "Sync slicers", "Bookmarks only", "A measure"], "answer": 1, "explain": "View → Sync slicers keeps product, branch and month the same across pages.", "back": 60}]}
```

```videoquiz
{"video": "A2r6or-Dm28", "stops": [{"at": 2700, "q": "Where do you create a measure?", "options": ["In the Service", "In the CSV", "In Power Query", "Home → New measure, in the formula bar"], "answer": 3, "explain": "Measures live in the model, not in a visual."}, {"at": 3300, "q": "Why prefer DIVIDE to the / operator?", "options": ["It is required for SUM", "It is faster", "It returns blank (or a chosen value) when the denominator is 0 or blank", "It rounds"], "answer": 2, "explain": "a / b shows Infinity on a card and breaks totals.", "back": 60}, {"at": 3900, "q": "A measure is evaluated…", "options": ["for every cell of every visual, in that cell's filter context", "only on cards", "once per table", "once at refresh"], "answer": 0, "explain": "That is filter context — today's one idea."}]}
```

---

## 2. Worked example — the PAR30 card that answers the next question (15 min)

**Ask:** Bekzod's risk page needs PAR30 on a card — and the board's next question ("where?", then "why there?") one click away. Each step names the concept it uses.

1. **First measures + CALCULATE** — `Outstanding DPD30+ = CALCULATE ( [Outstanding], v_loan_status[dpd] > 30 )` and `PAR30 % = DIVIDE ( [Outstanding DPD30+], [Outstanding] )`, format Percentage, 2 decimals. Card, top-left: **3.12 %**.
2. **Filter context, choosing the visual** — a **matrix**: rows `branches[branch_name]`, columns `products[code]`, value `PAR30 %`. Each cell is PAR30 in its own branch × product context.
3. **Formatting** — Format → Cell elements → Background colour → fx → Format style *Field value* → `PAR30 Colour`. The red cells: **Nukus Central SME 9.02 %** (the darkest), Samarkand Central AUTO 7.02 %, Tashkent North CONS 6.84 %, Bukhara Central CONS 6.26 %. Row totals: Nukus Central **6.84 %**, Bukhara Central 4.81 %, … Termez Central 0.68 %.
4. **A title that states the finding** — static and true: *"PAR30 is concentrated in Nukus SME and Bukhara"*; or by measure: `"PAR30 " & FORMAT ( [PAR30 %], "0.00%" ) & " — highest: Nukus Central"`.
5. **Drill-through** — a page *Branch detail* with `branches[branch_name]` in the drill-through well, cards for Outstanding, PAR30 %, NPL90 %, Loans 90+, and a table of the branch's 90+ loans. Right-click Bukhara Central → Drill through → Outstanding 15 116 046 338, PAR30 4.81 %, NPL90 4.48 %, Loans 90+ **23** (of 650 loans).
6. **The next question** — "why Nukus?" is now one click away: the drill-through shows that Nukus's 910 474 902 at risk is mostly **two SME loans** (452 263 008 at 96 days and 243 287 174 at 246 days: 76 % of it) — a concentration, not a trend.

---

## 3. Practice (60 min)

Continue in `nur_week7.pbix`. Paste the measures from `data/powerbi/measures.dax` as you need them, but **type** the ones named in each task — you learn DAX by writing it. Type the number (or name) your visual shows into the box under each question; it checks it and then shows the model answer.

**P1.** *(measure vs calculated column)* A colleague added a calculated column `rate = DIVIDE ( fct_installments[paid_to_asof], fct_installments[total_due] )` and shows its **Average** on the collections card as "collection rate". What is wrong, and what replaces it?

```task
{"id": "w07d4-p12", "kind": "choice", "options": ["Nothing: the average of row rates is the collection rate", "An average of row-level rates weights a 100 000 instalment like a 10 000 000 one; the collection rate is a ratio of sums — a measure DIVIDE ( SUM ( paid_to_asof ), SUM ( total_due ) )", "It should use / instead of DIVIDE", "It should be a calculated column on v_loan_status"], "answer": 1, "explain": "Ratios are measures: sum the numerator and the denominator in the cell's filter context, then divide. A column stores one rate per instalment; averaging them answers a different question."}
```

**P2.** *(SUM, COUNTROWS, DIVIDE)* Type `Disbursed Amount`, `Disbursed Count` and `Avg Ticket`. Put a month slicer on September 2026. What does the card `Avg Ticket` show?

```task
{"id": "w07d4-p13", "kind": "number", "answer": 47134321, "dp": 0, "unit": "soum", "hint": "DIVIDE ( [Disbursed Amount], [Disbursed Count] ) with the slicer on 2026-09.", "model": "47 134 321 = 17 015 490 000 / 361 loans (all time: 51 709 668). The slicer changes the filter context; the three measures are the same formulas."}
```

**P3.** *(filter context, CALCULATE)* Type `Outstanding DPD30+`, `PAR30 %`, `NPL90 %`, `Loans 90+` and put them in a table by product. Check against week 3.

```task
{"id": "w07d4-p2", "kind": "number", "answer": 4.44, "dp": 2, "unit": "%", "hint": "Enter PAR30 % for AUTO.", "model": "PAR30 / NPL90: AUTO 4.44 / 2.98 %, BNPL 1.28 / 0.48 %, CONS 3.09 / 2.13 %, MICRO 0.72 / 0.00 %, SME 2.55 / 2.47 %; total 3.12 / 2.55 %. Loans 90+: CONS 77, MICRO 76, BNPL 42, SME 29, AUTO 10 — total 234. MICRO has 76 loans in 90+ but 0 % NPL90: their remaining principal is already due, and week 3's outstanding counts only principal due after the as-of date — a definition worth a footnote on the risk page."}
```

**P4.** *(CALCULATE — replace or KEEPFILTERS)* A matrix by `v_loan_status[bucket]` with `Outstanding` and `M90 = CALCULATE([Outstanding], v_loan_status[bucket] = "90+")`. Then change it to `CALCULATE([Outstanding], KEEPFILTERS(v_loan_status[bucket] = "90+"))`. Explain both.

```task
{"id": "w07d4-p3", "kind": "choice", "options": ["M90 shows each bucket's own outstanding; KEEPFILTERS changes nothing", "M90 shows 5 319 475 527 in every row because its filter replaces the row's filter on bucket; with KEEPFILTERS the filters intersect, so only the 90+ row has a value", "M90 is blank everywhere except 90+; KEEPFILTERS fills every row", "Both versions give an error"], "answer": 1, "explain": "Outstanding by bucket: 0 197 486 207 578 · 1-30 4 729 769 899 · 31-60 748 610 049 · 61-90 439 441 377 · 90+ 5 319 475 527. M90 shows 5 319 475 527 in every row — the filter argument replaces the row's filter on the same column. With KEEPFILTERS the two filters intersect: 5 319 475 527 in the 90+ row, blank elsewhere."}
```

**P5.** *(context transition)* Row vs filter context. Add two calculated columns on `v_loan_status`: `share = v_loan_status[outstanding] / SUM(v_loan_status[outstanding])` and `own = CALCULATE(SUM(v_loan_status[outstanding]))`. What do they show for loan 1, and why are they different?

```task
{"id": "w07d4-p1", "kind": "number", "answer": 9593064, "dp": 0, "unit": "soum", "hint": "Enter the value of the column own for loan 1.", "model": "share = 9 593 064 / 208 723 504 430 = 0.0046 % — SUM in a column sees the whole table (no filter context). own = 9 593 064 — CALCULATE performs context transition: the row (loan 1) becomes a filter, so the sum covers that row only. Delete both columns afterwards; a share of total belongs in a measure."}
```

**P6.** *(ALL and its relatives)* `Outstanding Share of Total` with `ALL(products)`, then a version with `ALL(v_loan_status)`. Add a branch slicer on Tashkent Central. What does the SME row show in each, and which question does each answer?

```task
{"id": "w07d4-p4", "kind": "number", "answer": 7.61, "dp": 2, "unit": "%", "hint": "Enter the SME row with ALL(v_loan_status), Tashkent Central selected.", "model": "No slicer: both give SME 60.32 %. Tashkent Central selected: ALL(products) → 55.30 % (SME's share of Tashkent Central's 28 716 674 373: AUTO 34.23 %, CONS 9.52 %, BNPL 0.49 %, MICRO 0.46 %); ALL(v_loan_status) → 7.61 % (Tashkent Central's SME as a share of the whole book — ALL on the fact removes the filters arriving from its dimensions too). The first answers \"what is this branch's mix?\", the second \"how much of the company sits here?\" — name the denominator in the title."}
```

**P7.** *(time intelligence)* Time intelligence: `YTD Disbursed`, `Disbursed SPLY`, `Disbursed YoY %`, `Disbursed Prev Month`, `Disbursed MoM %` in a table by `dim_date[year_month]`. Report September 2026; then unmark the date table and say what breaks.

```task
{"id": "w07d4-p5", "kind": "number", "answer": 161480300000, "dp": 0, "unit": "soum", "hint": "Enter YTD Disbursed for September 2026.", "model": "September 2026: Disbursed 17 015 490 000 · YTD 161 480 300 000 · SPLY 14 644 540 000 · YoY +16.19 % · Prev Month 22 290 210 000 · MoM −23.66 %. YTD at September 2025: 110 929 400 000 (YTD growth +45.6 %). Unmarked, TOTALYTD still works if dim_date[date] is a true date column with no gaps — but Power BI keeps its auto-date tables, a visual using disbursed_at's own hierarchy ignores dim_date, and time intelligence on a text \"date\" fails. Mark it and use dim_date everywhere."}
```

**P8.** *(balances over time)* Balances over time: `Outstanding Month-End` and a plain `SUM(v_portfolio_monthly[outstanding_month_end])` in a table by month, then by year. What do the totals show?

```task
{"id": "w07d4-p8", "kind": "number", "answer": 1808092257935, "dp": 0, "unit": "soum", "hint": "Enter the plain SUM's total for the year 2026.", "model": "By month both agree: Jan 2026 151 807 386 149 … Aug 203 830 205 928 · Sep 208 243 879 623. The 2026 total: plain SUM 1 808 092 257 935 (ten balances added — meaningless); Month-End 196 392 195 577 — the last month in the filter, October (instalments due from 1 November). Filter the visual to months ≤ September 2026 and the year shows 208 243 879 623. September's month-end differs from the as-of card (208 723 504 430) by about 480 m: week 3's P8 — one is \"due after 30 Sep\", the other \"due after 1 Oct\"."}
```

**P9.** *(VAR … RETURN)* Type `Running Outstanding` with `VAR … RETURN` and `Running Outstanding %`; show them by branch sorted by Outstanding. How many branches hold half the book? Then rewrite without the variable and compare.

```task
{"id": "w07d4-p7", "kind": "number", "answer": 4, "dp": 0, "unit": "branches", "hint": "Enter how many branches, largest first, hold at least half the book.", "model": "Tashkent Central 13.76 % · Tashkent South 26.59 % · Tashkent North 39.13 % · Fergana Central 51.01 % · Samarkand Central 62.83 % · Andijan 72.31 % · Namangan 81.27 % · Bukhara 88.51 % · Nukus 94.89 % · Termez 100 %. Four of ten branches hold half. Without the variable, [Outstanding] >= [Outstanding] inside FILTER compares each iterated branch with itself — always true — so every row shows 208 723 504 430 (100 %)."}
```

**P10.** *(RANKX)* `Branch Rank` with `RANKX`. Show it for all products, then with a product slicer on SME. Then remove `ALL` from the formula and explain the result.

```task
{"id": "w07d4-p6", "kind": "text", "answer": ["Tashkent South", "Tashkent South branch"], "hint": "Type the branch that ranks 1 with the product slicer on SME.", "model": "All products: Tashkent Central 1, Tashkent South 2, Tashkent North 3, Fergana Central 4, Samarkand Central 5, Andijan Central 6, Namangan Central 7, Bukhara Central 8, Nukus Central 9, Termez Central 10; total row blank. SME: Tashkent South 1 (16 650 742 813), Tashkent Central 2, Samarkand Central 3. Without ALL, each row's table holds only its own branch, so every branch ranks 1."}
```

**P11.** *(choosing visuals, tooltips, formatting)* The risk matrix (worked example) plus a line of `FPD30 %` by `fct_first_instalment[vintage]` for 2025–2026, with `FPD30 Loans in Scope` in the tooltip. Which vintages should not be on the chart, and what are the highest points?

```task
{"id": "w07d4-p9", "kind": "text", "answer": ["2025-04", "April 2025", "Apr 2025", "2025-4"], "hint": "Type the vintage with the highest FPD30 % among vintages with at least 50 loans (YYYY-MM).", "model": "August 2026 has 11 loans in scope (0 %) — not readable; hide vintages with fewer than 50 loans (a visual-level filter on FPD30 Loans in Scope ≥ 50). Highest: April 2025 3.11 % (7 / 225), March 2025 2.82 %, October 2025 2.43 %; lowest March 2026 0.00 % (0 / 330, week 6's suspicious month). 2025 vintages 1.55 % vs 2026 1.08 % overall. With 200–380 loans per vintage the intervals are wide — July 2026's 4 / 367 = 1.09 % has a Wilson interval of 0.42–2.77 %: the tooltip with n stops people reading noise as a trend."}
```

**P12.** *(drill-through)* Build the *Branch detail* drill-through page (worked example, step 5) and drill through from **Nukus Central**. How many of its loans are 90+?

```task
{"id": "w07d4-p14", "kind": "number", "answer": 11, "dp": 0, "unit": "loans", "hint": "The Loans 90+ card on the drill-through page, for Nukus Central.", "model": "11 of Nukus Central's 492 loans are 90+; its outstanding is 13 309 138 567 and 910 474 902 of it is at more than 30 DPD (PAR30 6.84 %) — mostly two SME loans."}
```

**P13.** *(publish and refresh)* You have no work or school account. How do you deliver the board pack so that Bekzod can read it and Timur can refresh it?

```task
{"id": "w07d4-p15", "kind": "choice", "options": ["Publish to the Service with a personal Gmail account", "File → Export → Export to PDF for the board, and the .pbix (with a folder parameter) for Timur, who opens it in Desktop and clicks Refresh", "Screenshots in PowerPoint", "Nothing can be shared without the Service"], "answer": 1, "explain": "The Service needs a work or school account. Without one, the PDF is the publication for readers and the .pbix is the model for builders — say which you used in the README."}
```

**P14.** *(row-level security)* Row-level security: create the role *Branch manager — Bukhara* (`branches[branch_name] = "Bukhara Central"`), then Modeling → **View as** the role. Report the risk cards, then look at `Branch Rank` and `Outstanding Share of Total`.

```task
{"id": "w07d4-p10", "kind": "number", "answer": 15116046338, "dp": 0, "unit": "soum", "hint": "Enter Outstanding as seen through the Bukhara role.", "model": "Outstanding 15 116 046 338 · PAR30 4.81 % · NPL90 4.48 % · FPD30 2.39 % (14 / 586) · collection rate (due in Sep 2026) 92.31 % · Loans 90+ 23. Branch Rank = 1 and the shares are of Bukhara only: RLS removes the other branches' rows before any measure runs, so ALL(branches) sees one branch. If the manager should see her rank among all branches, compute it upstream (a column in the view) — RLS cannot be bypassed by DAX, which is the point."}
```

> 🚀 **Stretch (optional, +5 XP).** **P15.** *(putting it together — the collections page)* The collections page measures: `Actions`, `Contact Rate`, `Promise-to-Pay Rate`, `Paid-on-Action Rate` for September 2026, by action type and by collector; put a **Top N** filter (Filters pane → Filter type *Top N*, by `Actions`) on the collector table to show the five busiest. What would you tell Sevara, and what would you not?

```task
{"id": "w07d4-p11", "kind": "number", "answer": 651, "dp": 0, "unit": "actions", "hint": "Enter Actions in September 2026.", "xp": 2, "model": "September 2026: 651 actions, contact 72.81 %, PTP 28.57 %, paid 22.73 %. By type: call 216 (contact 82.4 %, PTP 29.2 %, paid 28.7 %), SMS 216 (63.9 %, 38.0 %, 13.0 %), visit 111 (68.5 %, 20.7 %, 26.1 %), restructure offer 108 (75.9 %, 16.7 %, 26.9 %). Top 5 by actions: Nilufar Jalilov 52 (paid 21.2 %), Bekzod Mirzaev 39 (17.9 %), Bobur Tashkentov 38 (31.6 %), Malika Jalilov 37 (27.0 %), Ilhom Qodirov 32 (28.1 %). Tell her: SMS promises the most and pays the least — promises from SMS need a follow-up call. Do not tell her collector X is better: 30–50 actions each, different loans and buckets — week 6's lesson (9 payments out of 40 actions = 22.5 %, Wilson 12.3–37.5 %) applies to people too."}
```

### Mistakes people make

- `SUM` in a calculated column expecting the row's group total; a ratio as a column.
- A `CALCULATE` filter that silently replaces the visual's filter on the same column (same number in every row).
- `a / b` instead of `DIVIDE`; percentages averaged across rows instead of a ratio of sums.
- Summing balances over months (Outstanding over a year); putting the as-of `Outstanding` on a monthly trend line.
- Time intelligence without a marked, gap-free date table — or on the fact's own date column.
- `RANKX` without `ALL`; rank shown on the total row.
- Ten visuals, four colours for categories and red for one of them; titles that name the chart instead of the finding.
- A slicer on one page that does not sync to the others; no "as of" on the page.
- Testing RLS only as yourself; expecting `ALL` to escape it.

---

## 4. Homework

**HW 7.2** (the model and six base measures) is due **tomorrow** in Day 3's hand-in box. Tomorrow's checkpoint Part B is the three pages below — build what you can today: the measures are all in `measures.dax`.

---

## 5. Self-check

```check
{"id": "w07d4-sc", "questions": [{"type": "single", "q": "Which pair of sentences is right?", "options": ["CALCULATE sums a column; context transition is a refresh", "CALCULATE evaluates an expression in a modified filter context; context transition turns the current row into a filter", "CALCULATE removes all filters; context transition sorts the rows", "CALCULATE works only in columns; context transition only in measures"], "answer": 1, "explain": "That is why own = CALCULATE(SUM(...)) in a column returns the row's own value (→ 'Context transition', P5)."}, {"type": "single", "q": "Why does SUM(outstanding_month_end) over 2026 make no sense?", "options": ["It double-counts products", "Balances are semi-additive: adding month-end balances gives ten balances, not one; the Month-End measure takes the last month in the period", "It ignores branches", "SUM does not work on months"], "answer": 1, "explain": "1 808 092 257 935 is meaningless; 208 243 879 623 at September is the book (→ 'Balances over time', P8)."}, {"type": "single", "q": "A branch manager sees Branch Rank = 1 under RLS. Bug or feature?", "options": ["A bug in RANKX", "A feature: RLS removes the other branches before any measure runs, so ALL sees one branch; compute the rank upstream if she must see it", "A missing relationship", "A sync-slicers problem"], "answer": 1, "explain": "RLS cannot be bypassed by DAX — that is the point (→ 'Row-level security', P14)."}]}
```

---

## 6. Company corner <span class="badge company">The three-page lending dashboard</span>

The board pack Bekzod asked for. Every page: the same top strip — title, "Data as of 1 Oct 2026", slicers for **product**, **branch (or region)** and **month** (synced across pages) — then ≤ 7 visuals, top to bottom: cards, trend, detail. Numbers below are with **no slicer selected** unless the card says otherwise; they are the values `measures.dax` produces from `data/powerbi/`.

**Page 1 — Portfolio** *("How big is the book, and where is it growing?")*

| Visual | Measure(s) | Expected |
|---|---|---|
| Card | `Outstanding` (+ `Loans Outstanding` in the subtitle) | **208 723 504 430** · 3 409 loans |
| Card | `Disbursed Amount`, `Disbursed Count` — month filter Sep 2026 | **17 015 490 000** · 361 loans |
| Card | `YTD Disbursed` at Sep 2026, `YoY` on YTD | **161 480 300 000** · +45.6 % vs 110 929 400 000 |
| Card | `Avg Ticket`, Sep 2026 | **47 134 321** (all time 51 709 668) |
| Line | `Outstanding Month-End` by month, Jan–Sep 2026 | 151 807 386 149 → **208 243 879 623** |
| Clustered column | `Disbursed Amount` by month 2026, `Disbursed MoM %` in the tooltip | Jul 20.69 bn · Aug 22.29 bn · **Sep 17.02 bn (−23.66 %)** |
| Clustered bar | `Outstanding` and `Outstanding Share of Total` by product | SME 125.89 bn (60.32 %) · AUTO 27.64 % · CONS 11.05 % · BNPL 0.54 % · MICRO 0.46 % |
| Matrix (or the drill-through) | `Outstanding`, `Branch Rank`, `Running Outstanding %` by branch | Tashkent Central 1 (13.76 %) … 4 branches = 51.01 % |

**Page 2 — Risk** *("Is the book getting worse, and where?")*

| Visual | Measure(s) | Expected |
|---|---|---|
| Card | `PAR30 %` (+ `Outstanding DPD30+`) | **3.12 %** · 6 507 526 953 |
| Card | `NPL90 %` (+ `Loans 90+`) | **2.55 %** · 234 loans |
| Card | `FPD30 %`, last mature vintage (Jul 2026) | **1.09 %** (4 / 367); all vintages 1.28 % (91 / 7 099) |
| Card | `Cure Rate 1-30` / `Roll Forward 1-30` (1 Sep → 1 Oct) | **75.78 %** / 19.53 % |
| Matrix, conditional formatting | `PAR30 %` by branch × product | worst cell Nukus Central SME **9.02 %**; worst branch Nukus 6.84 %; best Termez 0.68 % |
| Line | `FPD30 %` by vintage (n ≥ 50), n in the tooltip | Apr 2025 3.11 % peak; 2026 vintages 0.00–1.86 % |
| Matrix | `roll_rates[loans]` from × to bucket, % of row total | 1-30: 97 → 0, 6 stay, 25 → 31-60; 61-90 → 90+ 17 of 17 |

**Page 3 — Collections** *("Is the money coming in, and is the effort working?")*

| Visual | Measure(s) | Expected |
|---|---|---|
| Card | `Collection Rate`, due in Sep 2026 (Aug in the subtitle) | **94.08 %** (Aug 96.52 %) |
| Card | `Collected Amount`, paid in Sep 2026 | **16 338 823 207** |
| Card | `Actions`, `Contact Rate`, Sep 2026 | **651** · 72.81 % |
| Card | `Promise-to-Pay Rate` / `Paid-on-Action Rate`, Sep 2026 | **28.57 %** / 22.73 % |
| Clustered bar, sorted | `Collection Rate` by branch, Sep 2026 | Termez 97.68 % … Bukhara 92.31 %, Namangan 91.48 %, **Tashkent South 91.44 %** |
| Stacked bar | `Actions` by action type × outcome, Sep 2026 | SMS: most promises (38.0 %), fewest payments (13.0 %); calls paid 28.7 % |
| Table, Top N = 5 by `Actions` | collector, `Actions`, `Contact Rate`, `Paid-on-Action Rate` | Nilufar Jalilov 52 · Bekzod Mirzaev 39 · Bobur Tashkentov 38 · Malika Jalilov 37 · Ilhom Qodirov 32 |

**The definitions line.** Under each page, one line of small text: *Outstanding = principal due after 1 Oct 2026 (week 3); PAR30 / NPL90 = share of outstanding with DPD > 30 / > 90; FPD30 = first instalment not fully paid within 30 days; Collection rate = paid by 1 Oct ÷ due, instalments due in the month.* A board member who asks "how is this calculated?" gets the answer without a meeting — and the numbers are the same as the week-3 tiles because they come from the same views.

```game
{"type": "sort", "id": "w07d4-g4", "title": "Which page?", "q": "Put each visual on the page whose question it answers.", "groups": {"Portfolio — how big, growing where?": ["Card: Outstanding 208 723 504 430", "Card: YTD Disbursed at Sep 2026", "Line: Outstanding Month-End by month"], "Risk — getting worse, where?": ["Matrix: PAR30 % by branch × product", "Line: FPD30 % by vintage (n ≥ 50)", "Card: Cure / Roll forward 1-30"], "Collections — is the money coming in?": ["Bar: Collection rate by branch", "Stacked bar: actions by type × outcome", "Table: top 5 collectors by actions"]}, "why": "Three questions, three pages; cards on top, trend in the middle, detail at the bottom."}
```

> 🎯 **Interview version.** *"Design a dashboard for a lending portfolio."* — Three questions, three pages: how big and growing (outstanding, disbursements, ticket, mix), how risky (PAR30, NPL90, FPD by vintage, roll rates), how well collected (collection rate, effort and outcome). KPI cards top-left, trends in the middle, detail at the bottom, ≤ 7 visuals a page, one colour for bad, synced slicers, an as-of date and the definitions on the page; each number a measure that reconciles with the SQL source, and RLS so branch managers see their own branch.

**Say it like in an interview.** *"Design a dashboard for a lending portfolio."* Answer in four to six sentences, naming the pages, the layout rules and how you keep the numbers right.

```task
{"id": "w07d4-ci", "kind": "free", "min": 30, "model": "Three questions, three pages. Portfolio: how big and where is it growing — outstanding (208.7 bn), disbursements with YTD and year-on-year, average ticket, the product mix. Risk: is it getting worse — PAR30 and NPL90, FPD by vintage with n in the tooltip, roll rates, a branch × product matrix with one colour for bad. Collections: is the money coming in — collection rate, effort and outcome by action type and collector. On each page the KPI cards go top-left, the trend in the middle, the detail at the bottom, at most seven visuals, synced slicers, an as-of date and a definitions line. Every number is a measure that reconciles with the SQL views, and row-level security lets each branch manager see only her branch.", "rubric": ["three pages tied to three questions (size/growth, risk, collections)", "names concrete measures for each page", "layout rules: cards top-left, trend middle, detail bottom, ≤ 7 visuals, one colour for bad", "numbers reconcile with the SQL source; definitions and as-of date on the page", "row-level security for branch managers"]}
```

Tomorrow: Checkpoint 7 — the A/B notebook with its decision memo, these three pages as a `.pbix` and a PDF, and eight interview questions.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w07d4", "pass": 0.8, "questions": [
  {"type": "single", "q": "In a matrix with one row per bucket, what does M90 show?", "code": "M90 = CALCULATE ( [Outstanding], v_loan_status[bucket] = \"90+\" )", "options": ["Each bucket's own outstanding", "90+'s outstanding in the 90+ row, blank elsewhere", "90+'s outstanding in every row — the filter argument replaces the row's filter on bucket", "An error"], "answer": 2, "explain": "A CALCULATE filter replaces existing filters on the same column; KEEPFILTERS intersects instead (→ section 1, 'CALCULATE', P4)."},
  {"type": "single", "q": "For loan 1, what does this calculated column hold?", "code": "own = CALCULATE ( SUM ( v_loan_status[outstanding] ) )      -- calculated column on v_loan_status", "options": ["The whole book's outstanding", "Blank", "Loan 1's own outstanding — CALCULATE turns the row context into a filter (context transition)", "An error: CALCULATE works only in measures"], "answer": 2, "explain": "Without CALCULATE, SUM in a column sees the whole table; with it, the row becomes a filter (→ section 1, 'Context transition', P5)."},
  {"type": "single", "q": "A branch slicer is set to Tashkent Central. Which denominator gives SME's share of the whole company's book?", "options": ["CALCULATE ( [Outstanding], ALL ( products ) )", "[Outstanding]", "CALCULATE ( [Outstanding], ALLSELECTED ( products ) )", "CALCULATE ( [Outstanding], ALL ( v_loan_status ) )"], "answer": 3, "explain": "ALL(products) removes only the product filter (share within the branch); ALL on the fact removes the filters arriving from its dimensions too (→ section 1, 'ALL and its relatives', P6)."},
  {"type": "single", "q": "You remove ALL from the RANKX branch rank. What happens?", "options": ["The total row shows 1", "Nothing changes", "Every branch ranks 1 — each row's table holds only its own branch", "Ranks reverse"], "answer": 2, "explain": "RANKX must iterate all branches; ALL removes the row's own branch filter (→ section 1, 'RANKX', P10)."},
  {"type": "single", "q": "Company corner: which measure goes on the Portfolio page's monthly trend line?", "options": ["Outstanding Month-End — the last month's balance in the period, not a sum of balances", "SUM of outstanding_month_end", "Disbursed Amount", "Outstanding (the as-of card measure)"], "answer": 0, "explain": "Outstanding is a balance dated by disbursement; balances are semi-additive, so the trend uses the month-end measure (→ section 1, 'Balances over time', Company corner)."},
  {"type": "multi", "q": "What does time intelligence (TOTALYTD, SAMEPERIODLASTYEAR) need?", "options": ["Dates stored as text", "Each fact's own automatic date hierarchy", "The fact related to dim_date", "dim_date marked as the date table", "dim_date contiguous — every day, no gaps"], "answer": [2, 3, 4], "explain": "Use dim_date everywhere; auto-date tables give a second calendar and a second answer (→ section 1, 'Time intelligence', P7)."},
  {"type": "single", "q": "Under the role 'Branch manager — Bukhara', the Branch Rank card shows 1. Bug or feature?", "options": ["A bug in RANKX", "The model is missing a relationship", "The card is not synced", "A feature: RLS removes other branches' rows before any measure runs, so ALL(branches) sees one branch; compute the rank upstream if she must see it"], "answer": 3, "explain": "RLS cannot be bypassed by DAX — that is the point (→ section 1, 'Row-level security', P14)."},
  {"type": "number", "q": "What does this measure show for September 2026, in % (two decimals)?", "code": "Disbursed YoY % = DIVIDE ( [Disbursed Amount] - [Disbursed SPLY], [Disbursed SPLY] )\n-- Sep 2026: Disbursed Amount 17 015 490 000 · Disbursed SPLY 14 644 540 000", "answer": 16.19, "tol": 0.02, "explain": "(17 015 490 000 − 14 644 540 000) / 14 644 540 000 = +16.19 %; DIVIDE returns blank instead of an error when last year is empty (→ section 1, 'Time intelligence')."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w07d4", "q": "Bekzod wants a card on page 1: 'SME book, growth in a year'. Write a measure that compares Outstanding Month-End with the same measure one year earlier (SAMEPERIODLASTYEAR), as a % change with DIVIDE. With the month slicer on September 2026 and the product slicer on SME, what does it show? Give a percentage to 2 decimals.", "type": "number", "dp": 2, "h": ["75a5c4186b1bc3b5cc9fc580"], "hint": "The year-ago value is the same semi-additive measure evaluated in a shifted date set — wrap the measure, do not rebuild a SUM.", "sol": "T3V0c3RhbmRpbmcgTW9udGgtRW5kIFlvWSAlID0KVkFSIE5vdyA9IFtPdXRzdGFuZGluZyBNb250aC1FbmRdClZBUiBZZWFyQWdvID0gQ0FMQ1VMQVRFICggW091dHN0YW5kaW5nIE1vbnRoLUVuZF0sIFNBTUVQRVJJT0RMQVNUWUVBUiAoIGRpbV9kYXRlW2RhdGVdICkgKQpSRVRVUk4gRElWSURFICggTm93IC0gWWVhckFnbywgWWVhckFnbyApCgpwYW5kYXMgY2hlY2s6CnAgPSBwZC5yZWFkX2Nzdigidl9wb3J0Zm9saW9fbW9udGhseS5jc3YiLCBwYXJzZV9kYXRlcz1bIm1vbnRoIl0pCnMgPSBwW3BbInByb2R1Y3QiXSA9PSAiU01FIl0uZ3JvdXBieSgibW9udGgiKVsib3V0c3RhbmRpbmdfbW9udGhfZW5kIl0uc3VtKCkKMTAwICogKHNbIjIwMjYtMDktMDEiXSAvIHNbIjIwMjUtMDktMDEiXSAtIDEpICAgICAgICAjIDY3LjI4CgorNjcuMjggJTogdGhlIFNNRSBib29rIGF0IHRoZSBlbmQgb2YgU2VwdGVtYmVyIDIwMjYgaXMgdHdvIHRoaXJkcyBsYXJnZXIgdGhhbiBhIHllYXIgZWFybGllciAodGhlIHdob2xlIGJvb2s6IDIwOC4yIGJuIHZzIDEyMy45IGJuLCArNjguMCAlKS4KVGhlIHRyYXAgaXMgYSBwbGFpbiBTVU0gb2Ygb3V0c3RhbmRpbmdfbW9udGhfZW5kOiB3aXRoIGEgd2hvbGUgeWVhciBzZWxlY3RlZCBpdCBhZGRzIHR3ZWx2ZSBiYWxhbmNlczsgd2l0aCBvbmUgbW9udGggc2VsZWN0ZWQgaXQgaGFwcGVucyB0byB3b3JrLCB3aGljaCBpcyB3aHkgaXQgc3Vydml2ZXMgdW50aWwgc29tZW9uZSBwaWNrcyBhIHF1YXJ0ZXIuClRoZSBhcy1vZiBjYXJkIE91dHN0YW5kaW5nIGNhbm5vdCBkbyB0aGlzIGNvbXBhcmlzb24gYXQgYWxsOiB2X2xvYW5fc3RhdHVzIGlzIGRhdGVkIGJ5IGRpc2J1cnNlbWVudCwgc28gaXRzICdTZXB0ZW1iZXInIGlzIHRoZSBsb2FucyBkaXNidXJzZWQgaW4gU2VwdGVtYmVyLg=="}
```

<!-- challenge:end -->
