# Week 7 · Day 4 — Power BI II: DAX and visuals that tell the story

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 60 min</span> <span class="badge hw">HW 7.2 due tomorrow</span> <span class="badge company">Company corner</span>

> STORY **Thursday, 9:00.** Bekzod, portfolio manager (*портфельный менеджер*), with last quarter's board pack: forty Excel screenshots in a PowerPoint. *"Timur says your model is clean. Good — then I want the **board pack in Power BI: a portfolio page, a risk page, a collections page.** Same numbers as the week-3 tiles, so nobody asks why they differ. Every number a board member can click into: which branch, which product, which month. And Sevara wants the collections page for herself every Monday — **her branch managers should see only their own branch.**"* Timur: *"Measures first. Every card is a measure, and every measure is one sentence of DAX — if you understand `CALCULATE`."*

## Today in 3 lines

- **DAX** in one idea: a measure is evaluated in a **filter context** (the slicers, the row and column of the cell); **`CALCULATE`** changes that context. Around it: row context vs filter context, `FILTER`, `ALL` / `ALLEXCEPT` / `REMOVEFILTERS` / `ALLSELECTED`, `DIVIDE`, `VAR … RETURN`, time intelligence (`TOTALYTD`, `SAMEPERIODLASTYEAR`, `DATEADD`), `RANKX`, `SWITCH`, dynamic titles — each with the number it must show (`data/powerbi/measures.dax`, 32 measures).
- **Visuals that tell the story**: cards, line, clustered bar, a matrix with conditional formatting, slicers, drill-through, a tooltip page, bookmarks; the layout rules (top-left = most important, ≤ 7 visuals a page, one colour for "bad").
- **Sharing**: publish to the Power BI Service and schedule a refresh (needs a work account — or share the `.pbix` / a PDF export), and **row-level security** so a branch manager sees one branch. The Company corner specifies the three board pages with every card's expected number.

---

## 1. Learn — one function to understand

### Measures, columns and the two contexts

Yesterday: a **calculated column** is computed once per row and stored; a **measure** is computed for every cell of every visual. They live in two different worlds:

- **Row context** (*контекст строки*) — "the current row". It exists in a calculated column (and inside iterators such as `SUMX`, `FILTER`, `RANKX`). In a column on `v_loan_status`, `v_loan_status[outstanding]` means *this loan's* outstanding: loan 1 → 9 593 064.
- **Filter context** (*контекст фильтра*) — "which rows are visible". It is made by everything around a measure: slicers, the visual's rows and columns, page and report filters, relationships carrying those filters from dimensions to facts. In a table by product, the SME row's filter context is `products[code] = "SME"` (plus any slicer), and `SUM(v_loan_status[outstanding])` adds up only SME loans: 125 892 942 411.

The famous trap: in a **column**, `SUM(v_loan_status[outstanding])` ignores the row — a column has no filter context, so the sum is the whole table. `share = v_loan_status[outstanding] / SUM(v_loan_status[outstanding])` gives loan 1 **0.0046 %** of the book: correct, but only because "the whole table" is what we wanted. Wrap the same sum in `CALCULATE` inside the column and it returns **the row's own value** (9 593 064 for loan 1): `CALCULATE` turns the row context into a filter context — **context transition** (*преобразование контекста*). That one sentence explains half of all DAX surprises.

### CALCULATE — evaluate an expression in a modified filter context

```
CALCULATE ( <expression>, <filter 1>, <filter 2>, ... )
```

1. take the filter context of the cell; 2. apply the filter arguments — each **replaces** any existing filter on the same column, different columns are combined with AND; 3. evaluate the expression there.

```
Outstanding DPD30+ = CALCULATE ( [Outstanding], v_loan_status[dpd] > 30 )          -- 6 507 526 953
PAR30 %            = DIVIDE ( [Outstanding DPD30+], [Outstanding] )                -- 3.12 %
NPL90 %            = DIVIDE ( CALCULATE ( [Outstanding], v_loan_status[dpd] > 90 ), [Outstanding] )   -- 2.55 %
Loans 90+          = CALCULATE ( COUNTROWS ( v_loan_status ), v_loan_status[bucket] = "90+" )        -- 234
```

In a table by product, the SME row computes PAR30 with *both* filters — `product = SME` from the row, `dpd > 30` from `CALCULATE` — over SME's outstanding: **2.55 %**; AUTO **4.44 %**, MICRO **0.72 %**. Week 3's SQL `SUM(CASE WHEN dpd > 30 THEN outstanding END) / SUM(outstanding)` is exactly this, written once.

**"Replaces" in practice.** A matrix by `bucket` with `CALCULATE([Outstanding], v_loan_status[bucket] = "90+")` shows **5 319 475 527 in every row** — the measure's own filter on `bucket` overrides the row's. Wrap the filter in `KEEPFILTERS(...)` and it intersects instead: 90+ shows 5 319 475 527, the other rows are blank. When a `CALCULATE` measure shows the same number everywhere, ask *which column does my filter replace?*

### FILTER — when the condition is not a simple column test

A boolean filter (`v_loan_status[dpd] > 30`) is shorthand for `FILTER(ALL(v_loan_status[dpd]), v_loan_status[dpd] > 30)`. Use an explicit **`FILTER`** when the condition involves a measure or several columns: `CALCULATE([Outstanding], FILTER(v_loan_status, v_loan_status[dpd] > 30 && v_loan_status[product] <> "MICRO"))`. `FILTER` iterates a table row by row (row context) and returns the rows that pass — powerful and slower; filter a column, not the whole fact table, when you can.

### ALL, ALLEXCEPT, REMOVEFILTERS, ALLSELECTED — the denominators

| Function | Removes | Typical use | With a branch slicer on Tashkent Central, the SME row shows |
|---|---|---|---|
| `ALL ( products )` / `REMOVEFILTERS ( products )` | filters on `products` only | share of product within whatever else is filtered | **55.30 %** (SME's share of Tashkent Central) |
| `ALL ( v_loan_status )` | all filters reaching the fact — including those from its dimensions | share of the whole book | **7.61 %** (Tashkent Central SME ÷ the whole book) |
| `ALLEXCEPT ( v_loan_status, branches[branch_name] )` | everything except the branch | "branch total" in a branch × product matrix | 55.30 % |
| `ALLSELECTED ( products )` | the row's product filter, keeps slicer selections | "share of what the user selected" | depends on the product slicer |

```
Outstanding Share of Total = DIVIDE ( [Outstanding], CALCULATE ( [Outstanding], ALL ( products ) ) )
-- no slicer: SME 60.32 % · AUTO 27.64 % · CONS 11.05 % · BNPL 0.54 % · MICRO 0.46 %
```

`REMOVEFILTERS` is the readable synonym of `ALL` inside `CALCULATE`. And `CROSSFILTER(…, BOTH)` inside one measure is how you get yesterday's bidirectional filtering for one calculation without making the model ambiguous.

### DIVIDE and VAR … RETURN

**`DIVIDE(a, b)`** returns blank (or a third argument) when b is 0 or blank — `a / b` returns Infinity (or NaN for 0 / 0), which shows up as "Infinity" on a card and wrecks totals and charts. Always `DIVIDE` for ratios.

**Variables** (*переменные*) name an intermediate result, compute it **once** in the current context, and make long measures readable:

```
Running Outstanding =
VAR CurrentOutstanding = [Outstanding]                              -- evaluated in the row's context (this branch)
RETURN
    CALCULATE ( [Outstanding], FILTER ( ALL ( branches[branch_name] ), [Outstanding] >= CurrentOutstanding ) )
-- Pareto by branch: Tashkent Central 28.72 bn (13.76 %), + Tashkent South 26.59 %, + Tashkent North 39.13 %, + Fergana 51.01 %
```

Without the variable, `[Outstanding]` inside `FILTER` would be evaluated per iterated branch and compare each branch with itself. A variable is a constant once defined — that is the point.

### Time intelligence — needs the marked date table

```
YTD Disbursed        = TOTALYTD ( [Disbursed Amount], dim_date[date] )                         -- Sep 2026: 161 480 300 000
Disbursed SPLY       = CALCULATE ( [Disbursed Amount], SAMEPERIODLASTYEAR ( dim_date[date] ) ) -- Sep 2026: 14 644 540 000
Disbursed YoY %      = DIVIDE ( [Disbursed Amount] - [Disbursed SPLY], [Disbursed SPLY] )      -- Sep 2026: +16.19 %
Disbursed Prev Month = CALCULATE ( [Disbursed Amount], DATEADD ( dim_date[date], -1, MONTH ) ) -- Sep 2026: 22 290 210 000
Disbursed MoM %      = DIVIDE ( [Disbursed Amount] - [Disbursed Prev Month], [Disbursed Prev Month] )   -- Sep 2026: -23.66 %
```

Each function **returns a set of dates** and `CALCULATE` uses it as the filter: `SAMEPERIODLASTYEAR` shifts the visible dates back a year, `DATEADD` by any number of days / months / quarters / years, `TOTALYTD` widens them to 1 January of the same year. They work only if `dim_date` is contiguous (every day, no gaps — ours runs 2024-01-01 … 2027-12-31) and **marked** as the date table, and only for facts related to it. YTD by month in 2026: January 17 452 370 000 · March 49 003 630 000 · June 101 480 730 000 · **September 161 480 300 000**; the same point last year 110 929 400 000: YTD **+45.6 %**.

**Snapshots are not flows.** `Outstanding` is a balance; you cannot add balances over months. `v_portfolio_monthly` has a month-end outstanding per month; a plain `SUM` over 2026 gives 1 808 092 257 935 — eight balances added up. The **semi-additive** measure takes the last month of the period:

```
Outstanding Month-End =
VAR LastMonth = CALCULATE ( MAX ( v_portfolio_monthly[month] ) )
RETURN CALCULATE ( SUM ( v_portfolio_monthly[outstanding_month_end] ), v_portfolio_monthly[month] = LastMonth )
-- Jan 2026 151 807 386 149 · Aug 203 830 205 928 · Sep 208 243 879 623 · year 2026: the October row 196 392 195 577 (show months up to Sep)
```

And remember yesterday's dating: `v_loan_status` is dated by **disbursement**. A month slicer on the card `Outstanding` shows the outstanding of loans disbursed that month (September 2026: 16 965 990 458), not the book at the end of September. Put the Month-End measure on the trend line, the as-of `Outstanding` on the card, and label both.

### RANKX and SWITCH

```
Branch Rank = IF ( HASONEVALUE ( branches[branch_name] ), RANKX ( ALL ( branches[branch_name] ), [Outstanding], , DESC, DENSE ) )
```

`RANKX` iterates the table in its first argument (all ten branches — `ALL` removes the row's own branch filter, otherwise every branch ranks 1 among itself), evaluates `[Outstanding]` for each, and returns the position of the current one: Tashkent Central 1 … Bukhara Central 8 … Termez Central 10. `HASONEVALUE` blanks the total row. A product slicer on SME re-ranks: Tashkent South 1, Tashkent Central 2, Samarkand Central 3.

**`SWITCH(TRUE(), …)`** is DAX's `CASE WHEN`: the first true condition wins. As a calculated column it rebuilds the bucket (`measures.dax`, end); as a measure it picks a text or a colour:

```
PAR30 Colour = SWITCH ( TRUE (), [PAR30 %] >= 0.05, "#C0392B", [PAR30 %] >= 0.03, "#E67E22", "#7F8C8D" )
```

### Dynamic titles

A title that says what is selected stops screenshots from lying:

```
Dynamic Title = "Outstanding - " & SELECTEDVALUE ( products[product_name], "all products" )
              & " · as of 1 Oct 2026: " & FORMAT ( [Outstanding] / 1e9, "#,0.0" ) & " bn soum"
```

No selection: *"Outstanding - all products · as of 1 Oct 2026: 208.7 bn soum"*; SME selected: *"… Small business loan … 125.9 bn soum"*. Use it in any visual's title: Format → Title → **fx** → Field value → `Dynamic Title`.

### Visuals — pick by the question (week 4's table, in Power BI)

| Question | Visual | Settings that matter |
|---|---|---|
| one number now | **Card** (or multi-row card / the new card visual) | the measure's format; a subtitle with the definition |
| a trend | **Line chart** on `dim_date[year_month]` | Month-End measure for balances; a constant line for a target |
| compare categories | **Clustered bar** (horizontal, sorted) | data labels; no 3D, no pie with 5+ slices |
| two dimensions at once | **Matrix** with **conditional formatting** | background colour by rules or by the `PAR30 Colour` measure (Format → Cell elements → fx) |
| let the reader choose | **Slicer** (dropdown or list), *Sync slicers* across pages | one date slicer per page, same position on every page |
| detail on demand | **Drill-through** page (a branch page: right-click a branch → Drill through) | put `branches[branch_name]` in the page's drill-through well; add a Back button |
| context on hover | **Tooltip page** (Page information → Allow use as tooltip; small canvas) | assign it in the visual's Tooltip settings |
| a guided story | **Bookmarks** (View → Bookmarks) + buttons | a few "views" (e.g. 'All' vs 'Delinquent only'); keep them few |

**Layout rules** (the 7.3 deck's top-middle-bottom): the **top-left** holds the most important number (the eye starts there); **top row** = cards (KPIs), **middle** = trends, **bottom** = detail tables; **≤ 7 visuals a page**; **one colour for "bad"** (red only for what is bad — never as a series colour), the rest in greys and one accent; every visual titled with what it **means** ("PAR30 is highest in Nukus SME"), not what it is ("PAR30 by branch"); the same slicers in the same place on every page; the as-of date visible.

### Publish, refresh, share

**Publish**: Home → Publish → a workspace in the **Power BI Service** (needs a work or school Microsoft account; personal Gmail / Mail.ru accounts are not accepted). In the Service: the semantic model (dataset) → Settings → **Scheduled refresh** (Pro: up to 8 a day). A model that reads files on your PC or a SQL Server inside the bank needs an **on-premises data gateway** installed on a machine that can see them; cloud sources do not. Then share: a **workspace** for builders, an **app** for readers, **dashboards** (pinned tiles from several reports) for executives. **Without a work account** (the course default): share the `.pbix` (anyone with Desktop opens it and clicks Refresh), or **File → Export → Export to PDF** — every page as a PDF, the board-pack format. Both are honest options; say which you used.

**Row-level security** (*безопасность на уровне строк*, RLS). In Desktop, Modeling → **Manage roles** → a role *Branch manager — Bukhara* with the DAX filter `branches[branch_name] = "Bukhara Central"` on the `branches` table; the filter flows through the relationships to every fact. Test it with **View as** → the role: Outstanding **15 116 046 338**, PAR30 **4.81 %**, NPL90 4.48 %, FPD30 2.39 % (14 / 586), September collection rate 92.31 %. One role per branch does not scale; the dynamic version uses one role and a mapping table of e-mail → branch: `branches[branch_name] = LOOKUPVALUE ( map[branch_name], map[email], USERPRINCIPALNAME () )`. Roles are assigned to people in the Service (dataset → Security); in Desktop you can only test them. Two consequences to remember: a measure with `ALL(branches)` under RLS still sees only the allowed branch (**Branch Rank shows 1**), and RLS restricts **rows**, not pages — a page a manager should not see is a separate report.

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

- RU deck `Power BI 7.2.pptx`: M vs DAX — slide 9; DAX syntax, types, operators — slides 10–12; the most used functions (math and statistics, `DIVIDE`; logical `IF`, `AND`, `OR`) — slides 13–14; links — slide 15. RU deck `Power BI 7.3.pptx`: why visualise and visual categories — slides 3–6; **allocation of visuals (top / middle / bottom)** — slide 7; publishing to the web, refresh settings — slides 8–9; dashboards vs reports, sharing — slides 10–12; homework — slide 13.
- `Power BI 7.2.pbix`, `Power BI 7.3.pbix` — the lecture files (binary; open them in Power BI Desktop, not readable here). `Homework.zip` — the 7.3 homework: `flights.csv` (72 MB, US flights), `airline_carriers.csv` and a task list: load and relate, a calculated column *Delay / On-Time* (`DepDelay` or `ArrDelay` > 0), a visual of the % share of each status, flights by carrier name, then a **Top N** filter to the top 5 carriers. A good extra hour on someone else's data with exactly today's tools.
- DAX guide `Подробное руководство по DAX.pdf` (PDF page = book page): calculated columns vs measures pp. 51–56, variables p. 56; `ALL` / `ALLEXCEPT` pp. 90–104; **evaluation contexts** pp. 105–141 (filter context p. 106, row context p. 112); **`CALCULATE`** pp. 142–205 (context transition pp. 177–193, modifiers pp. 194–203); variables pp. 206–218; iterators and **`RANKX`** pp. 219–248 (`RANKX` p. 235); **time intelligence** pp. 249–312; working with the filter context pp. 348–380. Read chapters 4 and 5 once; come back to 8 when a YTD looks wrong.
- *Russian terms:* мера = measure, вычисляемый столбец = calculated column, контекст строки / фильтра = row / filter context, преобразование контекста = context transition, итератор = iterator, переменная = variable, логика операций со временем = time intelligence, нарастающий итог с начала года = year-to-date, аналогичный период прошлого года = same period last year, полуаддитивная мера = semi-additive measure, ранжирование = ranking, условное форматирование = conditional formatting, срез = slicer, детализация = drill-through, всплывающая подсказка = tooltip, закладка = bookmark, публикация = publish, шлюз данных = data gateway, безопасность на уровне строк = row-level security.

---

## 2. Worked example — the PAR30 card that answers the next question (15 min)

1. `Outstanding DPD30+ = CALCULATE ( [Outstanding], v_loan_status[dpd] > 30 )` and `PAR30 % = DIVIDE ( [Outstanding DPD30+], [Outstanding] )`, format Percentage, 2 decimals. Card: **3.12 %**.
2. A matrix: rows `branches[branch_name]`, columns `products[code]`, value `PAR30 %`; Format → Cell elements → Background colour → fx → Format style *Field value* → `PAR30 Colour`. The red cells: **Nukus Central SME 9.02 %** (the darkest), Samarkand Central AUTO 7.02 %, Tashkent North CONS 6.84 %, Bukhara Central CONS 6.26 %. Row totals: Nukus Central **6.84 %**, Bukhara Central 4.81 %, … Termez Central 0.68 %.
3. Title by measure: `"PAR30 " & FORMAT([PAR30 %], "0.00%") & " — highest: Nukus Central"` — or keep it static and true: *"PAR30 is concentrated in Nukus SME and Bukhara"*.
4. Drill-through: a page *Branch detail* with `branches[branch_name]` in the drill-through well, cards for Outstanding, PAR30 %, NPL90 %, Loans 90+, and a table of the branch's 90+ loans. Right-click Bukhara Central → Drill through → Outstanding 15 116 046 338, PAR30 4.81 %, NPL90 4.48 %, Loans 90+ **23** (of 650 loans).
5. The answer to the board member's next question ("why Nukus?") is now one click away: the drill-through shows that Nukus's 910 474 902 at risk is mostly **two SME loans** (452 263 008 at 96 days and 243 287 174 at 246 days: 76 % of it) — a concentration, not a trend.

---

## 3. Practice (60 min)

Continue in `nur_week7.pbix`. Paste the measures from `data/powerbi/measures.dax` as you need them, but **type** the ones named in each task — you learn DAX by writing it.

**P1.** Row vs filter context. Add two calculated columns on `v_loan_status`: `share = v_loan_status[outstanding] / SUM(v_loan_status[outstanding])` and `own = CALCULATE(SUM(v_loan_status[outstanding]))`. What do they show for loan 1, and why are they different?

<details><summary>Answer</summary>
`share` = 9 593 064 / 208 723 504 430 = **0.0046 %** — `SUM` in a column sees the whole table (no filter context). `own` = **9 593 064** — `CALCULATE` performs context transition: the row (loan 1) becomes a filter, so the sum covers that row only. Delete both columns afterwards; a share of total belongs in a measure.
</details>

**P2.** Type `Outstanding DPD30+`, `PAR30 %`, `NPL90 %`, `Loans 90+` and put them in a table by product. Check against week 3.

<details><summary>Answer</summary>
PAR30 / NPL90: AUTO **4.44 / 2.98 %**, BNPL 1.28 / 0.48 %, CONS 3.09 / 2.13 %, MICRO 0.72 / **0.00 %**, SME 2.55 / 2.47 %; total **3.12 / 2.55 %**. Loans 90+: CONS 77, MICRO 76, BNPL 42, SME 29, AUTO 10 — total 234. MICRO has 76 loans in 90+ but 0 % NPL90: their remaining principal is already *due*, and week 3's outstanding counts only principal due after the as-of date — a definition worth a footnote on the risk page.
</details>

**P3.** A matrix by `v_loan_status[bucket]` with `Outstanding` and `M90 = CALCULATE([Outstanding], v_loan_status[bucket] = "90+")`. Then change it to `CALCULATE([Outstanding], KEEPFILTERS(v_loan_status[bucket] = "90+"))`. Explain both.

<details><summary>Answer</summary>
`Outstanding` by bucket: 0 197 486 207 578 · 1-30 4 729 769 899 · 31-60 748 610 049 · 61-90 439 441 377 · 90+ 5 319 475 527. `M90` shows **5 319 475 527 in every row** — the filter argument replaces the row's filter on the same column. With `KEEPFILTERS` the two filters intersect: 5 319 475 527 in the 90+ row, blank elsewhere.
</details>

**P4.** `Outstanding Share of Total` with `ALL(products)`, then a version with `ALL(v_loan_status)`. Add a branch slicer on Tashkent Central. What does the SME row show in each, and which question does each answer?

<details><summary>Answer</summary>
No slicer: both give SME **60.32 %**. Tashkent Central selected: `ALL(products)` → **55.30 %** (SME's share of Tashkent Central's 28 716 674 373: AUTO 34.23 %, CONS 9.52 %, BNPL 0.49 %, MICRO 0.46 %); `ALL(v_loan_status)` → **7.61 %** (Tashkent Central's SME as a share of the whole book — `ALL` on the fact removes the filters arriving from its dimensions too). The first answers "what is this branch's mix?", the second "how much of the company sits here?" — name the denominator in the title.
</details>

**P5.** Time intelligence: `YTD Disbursed`, `Disbursed SPLY`, `Disbursed YoY %`, `Disbursed Prev Month`, `Disbursed MoM %` in a table by `dim_date[year_month]`. Report September 2026; then unmark the date table and say what breaks.

<details><summary>Answer</summary>
September 2026: Disbursed 17 015 490 000 · **YTD 161 480 300 000** · SPLY 14 644 540 000 · **YoY +16.19 %** · Prev Month 22 290 210 000 · **MoM −23.66 %**. YTD at September 2025: 110 929 400 000 (YTD growth +45.6 %). Unmarked, `TOTALYTD` still works if `dim_date[date]` is a true date column with no gaps — but Power BI keeps its auto-date tables, a visual using `disbursed_at`'s own hierarchy ignores `dim_date`, and time intelligence on a text "date" fails. Mark it and use `dim_date` everywhere.
</details>

**P6.** `Branch Rank` with `RANKX`. Show it for all products, then with a product slicer on SME. Then remove `ALL` from the formula and explain the result.

<details><summary>Answer</summary>
All products: Tashkent Central 1, Tashkent South 2, Tashkent North 3, Fergana Central 4, Samarkand Central 5, Andijan Central 6, Namangan Central 7, **Bukhara Central 8**, Nukus Central 9, Termez Central 10; total row blank. SME: **Tashkent South 1** (16 650 742 813), Tashkent Central 2, Samarkand Central 3. Without `ALL`, each row's table holds only its own branch, so **every branch ranks 1**.
</details>

**P7.** Type `Running Outstanding` with `VAR … RETURN` and `Running Outstanding %`; show them by branch sorted by Outstanding. How many branches hold half the book? Then rewrite without the variable and compare.

<details><summary>Answer</summary>
Tashkent Central 13.76 % · Tashkent South 26.59 % · Tashkent North 39.13 % · **Fergana Central 51.01 %** · Samarkand Central 62.83 % · Andijan 72.31 % · Namangan **81.27 %** · Bukhara 88.51 % · Nukus 94.89 % · Termez 100 %. Four of ten branches hold half. Without the variable, `[Outstanding] >= [Outstanding]` inside `FILTER` compares each iterated branch with itself — always true — so every row shows 208 723 504 430 (100 %).
</details>

**P8.** Balances over time: `Outstanding Month-End` and a plain `SUM(v_portfolio_monthly[outstanding_month_end])` in a table by month, then by year. What do the totals show?

<details><summary>Answer</summary>
By month both agree: Jan 2026 151 807 386 149 … Aug 203 830 205 928 · **Sep 208 243 879 623**. The **2026 total**: plain `SUM` **1 808 092 257 935** (ten balances added — meaningless); Month-End **196 392 195 577** — the last month in the filter, October (instalments due from 1 November). Filter the visual to months ≤ September 2026 and the year shows 208 243 879 623. September's month-end differs from the as-of card (208 723 504 430) by about 480 m: week 3's P8 — one is "due after 30 Sep", the other "due after 1 Oct".
</details>

**P9.** The risk matrix (worked example) plus a line of `FPD30 %` by `fct_first_instalment[vintage]` for 2025–2026, with `FPD30 Loans in Scope` in the tooltip. Which vintages should not be on the chart, and what are the highest points?

<details><summary>Answer</summary>
August 2026 has **11 loans in scope** (0 %) — not readable; hide vintages with fewer than 50 loans (a visual-level filter on `FPD30 Loans in Scope` ≥ 50). Highest: **April 2025 3.11 %** (7 / 225), March 2025 2.82 %, October 2025 2.43 %; lowest March 2026 0.00 % (0 / 330, week 6's suspicious month). 2025 vintages 1.55 % vs 2026 1.08 % overall. With 200–380 loans per vintage the intervals are wide — July 2026's 4 / 367 = 1.09 % has a Wilson interval of 0.42–2.77 %: the tooltip with n stops people reading noise as a trend.
</details>

**P10.** Row-level security: create the role *Branch manager — Bukhara* (`branches[branch_name] = "Bukhara Central"`), then Modeling → **View as** the role. Report the risk cards, then look at `Branch Rank` and `Outstanding Share of Total`.

<details><summary>Answer</summary>
Outstanding **15 116 046 338** · PAR30 **4.81 %** · NPL90 4.48 % · FPD30 **2.39 %** (14 / 586) · collection rate (due in Sep 2026) **92.31 %** · Loans 90+ 23. **Branch Rank = 1** and the shares are of Bukhara only: RLS removes the other branches' rows before any measure runs, so `ALL(branches)` sees one branch. If the manager should see her rank among all branches, compute it upstream (a column in the view) — RLS cannot be bypassed by DAX, which is the point.
</details>

<span class="badge stretch">Stretch</span> **P11.** The collections page measures: `Actions`, `Contact Rate`, `Promise-to-Pay Rate`, `Paid-on-Action Rate` for September 2026, by action type and by collector; put a **Top N** filter (Filters pane → Filter type *Top N*, by `Actions`) on the collector table to show the five busiest. What would you tell Sevara, and what would you not?

<details><summary>Answer</summary>
September 2026: **651** actions, contact **72.81 %**, PTP **28.57 %**, paid **22.73 %**. By type: call 216 (contact 82.4 %, PTP 29.2 %, paid 28.7 %), SMS 216 (63.9 %, 38.0 %, **13.0 %**), visit 111 (68.5 %, 20.7 %, 26.1 %), restructure offer 108 (75.9 %, 16.7 %, 26.9 %). Top 5 by actions: Nilufar Jalilov 52 (paid 21.2 %), Bekzod Mirzaev 39 (17.9 %), Bobur Tashkentov 38 (31.6 %), Malika Jalilov 37 (27.0 %), Ilhom Qodirov 32 (28.1 %). Tell her: SMS promises the most and pays the least — promises from SMS need a follow-up call. Do not tell her collector X is better: 30–50 actions each, different loans and buckets — week 6's lesson (9 payments out of 40 actions = 22.5 %, Wilson 12.3–37.5 %) applies to people too.
</details>

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

**HW 7.2** (the model and six base measures) is due **tomorrow** in `submissions/week-07/day-3/`. Tomorrow's checkpoint Part B is the three pages below — build what you can today: the measures are all in `measures.dax`.

---

## 5. Self-check

1. In one sentence each: what does `CALCULATE` do to the filter context, and what is context transition? *(→ "Measures, columns and the two contexts", "CALCULATE", P1)*
2. Why does `SUM(outstanding_month_end)` over 2026 make no sense, and what does the Month-End measure do instead? *(→ "Time intelligence", P8)*
3. A branch manager sees "Branch Rank = 1" under RLS. Bug or feature, and what would you do? *(→ "Publish, refresh, share", P10)*

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

> Interview version: *"Design a dashboard for a lending portfolio."* — Three questions, three pages: how big and growing (outstanding, disbursements, ticket, mix), how risky (PAR30, NPL90, FPD by vintage, roll rates), how well collected (collection rate, effort and outcome). KPI cards top-left, trends in the middle, detail at the bottom, ≤ 7 visuals a page, one colour for bad, synced slicers, an as-of date and the definitions on the page; each number a measure that reconciles with the SQL source, and RLS so branch managers see their own branch.

Tomorrow: Checkpoint 7 — the A/B notebook with its decision memo, these three pages as a `.pbix` and a PDF, and eight interview questions.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w07d4", "pass": 0.8, "questions": [
  {"type": "single", "q": "In a matrix with one row per bucket, what does M90 show?", "code": "M90 = CALCULATE ( [Outstanding], v_loan_status[bucket] = \"90+\" )", "options": ["Each bucket's own outstanding", "90+'s outstanding in the 90+ row, blank elsewhere", "90+'s outstanding in every row — the filter argument replaces the row's filter on bucket", "An error"], "answer": 2, "explain": "A CALCULATE filter replaces existing filters on the same column; KEEPFILTERS intersects instead (→ section 1, 'CALCULATE', P3)."},
  {"type": "single", "q": "For loan 1, what does this calculated column hold?", "code": "own = CALCULATE ( SUM ( v_loan_status[outstanding] ) )      -- calculated column on v_loan_status", "options": ["The whole book's outstanding", "Blank", "Loan 1's own outstanding — CALCULATE turns the row context into a filter (context transition)", "An error: CALCULATE works only in measures"], "answer": 2, "explain": "Without CALCULATE, SUM in a column sees the whole table; with it, the row becomes a filter (→ section 1, 'Measures, columns and the two contexts', P1)."},
  {"type": "single", "q": "A branch slicer is set to Tashkent Central. Which denominator gives SME's share of the whole company's book?", "options": ["CALCULATE ( [Outstanding], ALL ( products ) )", "[Outstanding]", "CALCULATE ( [Outstanding], ALLSELECTED ( products ) )", "CALCULATE ( [Outstanding], ALL ( v_loan_status ) )"], "answer": 3, "explain": "ALL(products) removes only the product filter (share within the branch); ALL on the fact removes the filters arriving from its dimensions too (→ section 1, 'ALL, ALLEXCEPT…', P4)."},
  {"type": "single", "q": "You remove ALL from the RANKX branch rank. What happens?", "options": ["The total row shows 1", "Nothing changes", "Every branch ranks 1 — each row's table holds only its own branch", "Ranks reverse"], "answer": 2, "explain": "RANKX must iterate all branches; ALL removes the row's own branch filter (→ section 1, 'RANKX and SWITCH', P6)."},
  {"type": "single", "q": "Company corner: which measure goes on the Portfolio page's monthly trend line?", "options": ["Outstanding Month-End — the last month's balance in the period, not a sum of balances", "SUM of outstanding_month_end", "Disbursed Amount", "Outstanding (the as-of card measure)"], "answer": 0, "explain": "Outstanding is a balance dated by disbursement; balances are semi-additive, so the trend uses the month-end measure (→ section 1, 'Time intelligence', Company corner)."},
  {"type": "multi", "q": "What does time intelligence (TOTALYTD, SAMEPERIODLASTYEAR) need?", "options": ["Dates stored as text", "Each fact's own automatic date hierarchy", "The fact related to dim_date", "dim_date marked as the date table", "dim_date contiguous — every day, no gaps"], "answer": [2, 3, 4], "explain": "Use dim_date everywhere; auto-date tables give a second calendar and a second answer (→ section 1, 'Time intelligence', P5)."},
  {"type": "single", "q": "Under the role 'Branch manager — Bukhara', the Branch Rank card shows 1. Bug or feature?", "options": ["A bug in RANKX", "The model is missing a relationship", "The card is not synced", "A feature: RLS removes other branches' rows before any measure runs, so ALL(branches) sees one branch; compute the rank upstream if she must see it"], "answer": 3, "explain": "RLS cannot be bypassed by DAX — that is the point (→ section 1, 'Publish, refresh, share', P10)."},
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
