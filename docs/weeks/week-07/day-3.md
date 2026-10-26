# Week 7 · Day 3 — Power BI I: get data, Power Query, the model

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 60 min</span> <span class="badge hw">HW 7.1 due · HW 7.2 (due Day 5)</span> <span class="badge company">Company corner</span>

> STORY **Wednesday, 9:00.** Timur, BI (*BI-специалист*), closes the experiment readout and opens a different file: Bekzod's Excel one-pager from week 4, with three cells highlighted in red. *"This broke again on Monday. Someone pasted September under August, the pivot range stopped at row 1 700, and the board saw August's outstanding twice. Every month a person rebuilds it by hand and every month something breaks. **Rebuild it in Power BI, on the views you wrote in week 3, so that it refreshes** — one click, or no click at all. Today: the data and the model. Tomorrow: the measures and the pages. If the model is wrong, nothing tomorrow will be right."*

## Today in 3 lines

- What a **BI tool** is and why the banks in the region mostly run **Power BI**; its parts (**Desktop** — free, Windows — **Service**, **Mobile**, **Report Server**) and the build process: get data → transform → model → measures → visuals → publish.
- **Get data** from CSV (`data/powerbi/`) or from SQL Server (your week-1 Nur database), **Power Query** in Power BI (the same editor as Excel's in week 4: types, cleaning, merge, append; M in one paragraph), Import vs DirectQuery.
- The **star schema** in the Model view — facts `v_loan_status`, `v_payments_clean`, `v_portfolio_monthly` (+ four small facts), dimensions date / product / branch / customer — **one-to-many, single direction**, `dim_date` marked as the date table; and the first look at **calculated columns vs measures**. The first card shows **208 723 504 430**.

---

## 1. Learn — from a file that breaks to a model that refreshes

### What BI is, and which tool

**Business intelligence** (*бизнес-аналитика*, BI) is the layer between the data and the people who decide: a model of the business data, a set of agreed calculations (measures), and reports that refresh from the source on a schedule. Excel can do each step once; a BI tool makes it **repeatable** — the same definitions every month, no pasted ranges, a refresh instead of a rebuild, one version of "outstanding" for everyone.

| Tool | Who makes it / licence | Where it runs | Known for |
|---|---|---|---|
| **Power BI** | Microsoft; Desktop free, sharing needs Pro / Premium (Fabric) licences | Windows Desktop + cloud Service; Report Server on-premises | Excel-like Power Query, DAX, deep Microsoft integration (SQL Server, Excel, Teams, company accounts) |
| **Tableau** | Salesforce; paid | Desktop (Windows, Mac) + Server / Cloud | visual exploration, polished charts |
| **Looker** (and Looker Studio, the free Google tool) | Google | browser, cloud | a modelling language (LookML) on top of cloud warehouses |
| **Apache Superset** | open source | your own server, browser | SQL-first dashboards on any database; free, needs engineers |
| **Metabase** | open source (+ paid cloud) | your own server, browser | the quickest "ask a question" tool for small teams |

**Why the banks in the region mostly use Power BI**: their data already sits in Microsoft SQL Server and Excel; staff sign in with Microsoft company accounts, so access rights come with them; Desktop is free, so analysts can start without a purchase; regulators and security teams often want the data inside the bank, and **Power BI Report Server** runs on the bank's own servers; and the job adverts ask for it (and for the Microsoft **PL-300** certification the deck's author holds). That is a description of the market, not a ranking — the ideas of today (model, grain, measures) carry over to every tool on the list.

### The parts of Power BI

| Part | What you do there | What you need |
|---|---|---|
| **Power BI Desktop** | everything you build: data, Power Query, model, DAX, report pages | Windows; free (Microsoft Store — updates itself — or Microsoft's download page). On a Mac: a Windows virtual machine |
| **Power BI Service** (app.powerbi.com) | publish, share, schedule refresh, dashboards, apps, row-level security for users | a **work or school** account; Pro (or Premium / Fabric capacity) to share |
| **Power BI Mobile** | read reports on a phone | the Service |
| **Report Server** | the on-premises Service, for data that may not leave the bank | a server licence |

Desktop has four views on the left edge: **Report** (the canvas), **Table** (the data, row by row — older versions call it Data view), **Model** (tables and relationships), and **DAX query** (newer versions). Desktop is released every month; **the click paths on these pages are for the current Desktop release and may differ slightly in yours** — menu names move, the steps do not.

### Get data

- **Text/CSV** — Home → Get data → Text/CSV → `data/powerbi/v_loan_status.csv` → the preview → **Transform data** (always, not Load: you check types first). Repeat per file, or use the next one.
- **Folder** — Get data → Folder → a folder of **same-shaped** files (one CSV per month) → *Combine & Transform*: Power BI stacks them, adds the file name, and next month's file is picked up by the refresh. Our 14 files have different shapes, so for them Folder only lists the files; it is the right connector for monthly exports (Stretch).
- **SQL Server** — Get data → SQL Server → Server `localhost` (or `.\SQLEXPRESS`), Database `nur` (the database you created from `data/sql/sqlserver.sql` in week 1, with week 3's views from HW 3.2) → choose the views `v_loan_status`, `v_portfolio_monthly`, `v_payments_clean` in the Navigator. *Advanced options* lets you paste a SQL statement instead (`SELECT loan_id, product, branch_name, outstanding, dpd FROM v_loan_status`) — habit 1 of week 3: only the columns you need. SQLite (`nur.db`) needs an ODBC driver; for the course, the CSVs are its exports.
- **Import vs DirectQuery.** *Import* copies the data into the `.pbix` (fast visuals, all DAX, refreshed on a schedule — our choice); *DirectQuery* leaves it in the database and sends a query for every visual (always current, slower, some DAX limits — for tables too big to copy or data that must be live). The Import refresh re-runs the views: definitions live in SQL, Power BI only reads them.

| Storage mode | Data lives | Visual speed | Freshness | Use when |
|---|---|---|---|---|
| **Import** | inside the `.pbix` (compressed, in memory) | fastest | as of the last refresh (up to 8 a day on Pro, more on Premium) | almost always — our case |
| **DirectQuery** | in the source database | as fast as the database | live | very large or must-be-live tables |
| **Composite** | some tables imported, some DirectQuery | mixed | mixed | a big live fact with small imported dimensions |

**The BI specialist's job** (Timur's role in the glossary's sense): own the model and the measures, not every chart. Analysts ask *"what is PAR30 for Bukhara SME?"*; Timur makes sure there is exactly one `PAR30 %`, that it reconciles with the SQL view, and that it refreshes. A typical request: *"the board pack in Power BI by Friday"* — and his first question back is always *"which definitions, from which tables, as of when?"*

### Power Query in Power BI — week 4, again

*Transform data* opens the **same Power Query editor** you used in Excel: Applied Steps on the right, every click a step, Refresh replays them. Today's steps, all familiar:

1. **Types** — `principal`, `outstanding`, `dpd` Whole number; `disbursed_at`, `month`, `paid_at`, `due_date` Date; `bucket`, `vintage`, `product`, `branch_name` **Text** (`bucket` holds "1-30", a text that only looks like a range). Wrong types are the most common reason a total is wrong or a relationship refuses to be created.
2. **Profile** — View → *Column quality*, *Column distribution*, *Column profile*. The profile is computed on the **first 1 000 rows** unless you switch the status-bar setting to *entire data set*: `outstanding` in the first 1 000 rows is not the same as in 7 828.
3. **Merge** (Home → Merge Queries) — a lookup: `v_payments_clean` ← `v_loan_status` on `loan_id`, *Left Outer*, expand **only** `product` and `branch_name`. Rows stay 52 850. Expanding `outstanding` here would copy a loan's balance onto each of its payments (Company corner).
4. **Append** (Home → Append Queries) — stacking same-shaped tables (two years of exports); the Folder connector is an automatic append.
5. **Replace / fix keys** — the 48 loans whose customer was removed as a duplicate in week 4 (P8).

**M in one paragraph.** Every query is a little program in **M** (*язык M*, Power Query's formula language), visible in *Advanced Editor*: a `let` block where each step is a named variable built from the previous one, and `in` returns the last. You rarely write M; you read it to see what the clicks did, and you copy it between files. DAX (tomorrow) is the other language: M shapes **tables before they are loaded**, DAX calculates **numbers after**.

```
let
    Source   = Csv.Document(File.Contents("C:\...\data\powerbi\v_loan_status.csv"), [Delimiter = ",", Encoding = 65001]),
    Promoted = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),
    Typed    = Table.TransformColumnTypes(Promoted, {{"loan_id", Int64.Type}, {"disbursed_at", type date},
                   {"principal", Int64.Type}, {"outstanding", Int64.Type}, {"dpd", Int64.Type}, {"bucket", type text}})
in
    Typed
```

**One trap for a refreshing report**: the file path in `Source` is absolute. Move the folder and the refresh breaks; make the folder a *parameter* (Home → Manage parameters) and every query uses it.

### The model — a star, drawn in the Model view

Week 1 drew a star schema on paper; the Model view is where it becomes real. **Fact tables** (*таблицы фактов*) hold events or states at a stated grain, with numbers to add up and keys pointing out; **dimension tables** (*таблицы измерений*) hold one row per thing you slice by.

| Fact (grain) | Rows | Dimensions it uses |
|---|---|---|
| `v_loan_status` (one loan, as of 2026-10-01) | 7 828 | date (disbursed_at), product, branch, customer |
| `v_portfolio_monthly` (month × product × branch) | 1 700 | date (month), product, branch |
| `v_payments_clean` (one payment) | 52 850 | date (paid_at); product, branch after the merge |
| `fct_installments` (one scheduled instalment) | 92 193 | date (due_date), product, branch |
| `fct_first_instalment` (one loan in FPD scope) | 7 099 | date (disbursed_at), product, branch |
| `fct_applications` (one application) | 14 000 | date (applied_date), product, branch, customer |
| `fct_collections_actions` (one action) | 9 361 | date (action_date), product, branch, collector |

Dimensions: `dim_date` (1 461 days), `products` (5), `branches` (10), `customers_clean` (6 000), `staff_collectors` (30). `data/powerbi/README.md` lists every relationship. Drag a dimension's key onto the fact's column (or Modeling → Manage relationships → New) and check the dialog:

- **Cardinality** (*кардинальность*) **one-to-many (1 : *)**: the dimension side is unique (`products[code]`), the fact side repeats. If Power BI proposes *many-to-many*, the "unique" side is not unique — a duplicate key, a trailing space, a type mismatch. Fix the data; never accept many-to-many to make the warning go away.
- **Cross-filter direction** (*направление кросс-фильтрации*) **single**: filters flow from the dimension to the fact. A product slicer filters `v_loan_status`; `v_loan_status` does not filter `products`.
- **Active** (*активная связь*): only one active path may connect two tables; an extra one is drawn dashed (inactive) and used only on request (`USERELATIONSHIP` in DAX).

**Why bidirectional is dangerous.** *Both* lets filters flow fact → dimension too. Set `customers_clean ↔ v_loan_status` to Both and a customer-segment slicer on "sme" now filters `products` and `branches` to *the products and branches sme customers have loans in*, and through them every other fact — `fct_installments`, `fct_collections_actions` — to all loans of those products and branches, not to sme customers' loans. The numbers look plausible and are wrong. With two Both relationships Power BI also refuses ambiguous paths, makes some inactive without asking, and gets slower. Rule: **single direction everywhere**; when a measure really needs the other direction, ask for it inside that measure (`CROSSFILTER`, tomorrow's lesson), not in the model.

**Mark `dim_date` as the date table** — select it, Table tools → *Mark as date table* → column `date`. Power BI then trusts it for time intelligence (`TOTALYTD`, `SAMEPERIODLASTYEAR`, tomorrow) and switches off its own hidden auto-date tables. And sort the text columns by their numbers (Column tools → *Sort by column*): `month_name` by `month`, `year_month` by `month_start` — or the axis reads April, August, December…

### Calculated columns vs measures — a first look

| | Calculated column (*вычисляемый столбец*) | Measure (*мера*) |
|---|---|---|
| computed | once per row, at refresh; stored in the model | at query time, for each cell of each visual |
| sees | the current row (row context) | the filters of the cell (filter context) |
| use for | a value you slice or filter by (age band, "is PAR30"), a key | every number on a card, axis or matrix |
| example | `par30_outstanding = IF(v_loan_status[dpd] > 30, v_loan_status[outstanding], 0)` | `PAR30 % = DIVIDE(SUM(v_loan_status[par30_outstanding]), SUM(v_loan_status[outstanding]))` |

The rule that saves most mistakes: **ratios are measures** — a ratio of sums, computed after the filters, never an average of row-level ratios (P9). A column costs memory for every row; a measure costs nothing until a visual asks.

### From Bekzod's one-pager to Power BI — the translation table

Week 4's one-pager already had every idea; Power BI gives each one a home that survives next month.

| Excel one-pager (week 4) | Power BI | Why it no longer breaks |
|---|---|---|
| CSV pasted under last month's rows | Get data → CSV / Folder / SQL Server, **Refresh** | the source is read, not pasted |
| Power Query in the workbook | the same Power Query, Applied Steps | identical; but every visual reads its output |
| `tblLoans`, `payments_clean` sheets | tables in the model (Table view) | no ranges to extend |
| VLOOKUP / XLOOKUP between sheets | **relationships** in the Model view | one definition, used by every visual |
| a pivot's Sum of `outstanding` | a **measure** `Outstanding = SUM(...)` | written once, reused on every page |
| calculated field `= a / b` in a pivot | a measure with `DIVIDE` | ratio of sums, by construction |
| slicers + Report Connections | slicers (filter every visual on the page; *Sync slicers* across pages) | no connections to forget |
| timeline on `disbursed_at` | `dim_date` + a date slicer, time-intelligence measures | YTD, last year, previous month for free |
| the six tiles typed as formulas | **cards** on measures | the number and the visual cannot disagree |
| "Data as of" typed by hand | a measure or the refresh time (Service) | it changes when the data changes |
| e-mailing the file | publishing to the Service, an app, a PDF export (tomorrow) | one copy, access by account |

**What Refresh does**, in order: re-runs every query's Applied Steps from the source (the CSV or the SQL view), re-applies the types, rebuilds the model's tables and calculated columns, and redraws every visual — measures are recalculated on demand. If a step fails (a renamed column in the source, a moved file), the refresh stops and says which query and step: read the message, open that query, fix that step.

**Check the model before any visual** (two minutes, every time): (1) row counts in Table view against the README; (2) the card `Outstanding` = 208 723 504 430; (3) every relationship 1 : *, single, and no dashed line you did not intend; (4) `dim_date` marked; (5) a table by product shows different numbers in different rows and no (Blank) row.

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Get Data + first Power Query transform — [Power BI Tutorial for Beginners (Step-by-Step in 30 Minutes) (Guy in a Cube), 05:04](https://youtu.be/OmW9YvxSl1E?t=304)
- ▶ Power Query in Power BI — [Learn Power BI in Under 3 Hours (Alex The Analyst), 11:59](https://youtu.be/I0vQ_VLZTWg?t=719)
- ▶ Power Query in Power BI (short single-topic) — [How to use Power Query in Power BI (Alex The Analyst), 01:45](https://youtu.be/gP-AxNi6uxo?t=105)
- ▶ Star schema / data model — [Learn Data Modelling & Star Schema for Power BI in 20 minutes (Chandoo), 02:18](https://youtu.be/4ePNrdxWtY0?t=138)
- ▶ Relationships (cardinality, filter direction, active) — [How to Create and Manage Relationships in Power BI (Alex The Analyst), 03:45](https://youtu.be/sW5LoDA1ssM?t=225)
- ▶ Relationships, fuller — Alex's 3-hour course, [24:14](https://youtu.be/I0vQ_VLZTWg?t=1454)
- ▶ (RU) Power Query + Power BI data model — [Power Query для Excel и Power BI. ПОЛНЫЙ БАЗОВЫЙ КУРС (ПРО ДАННЫЕ), 05:02](https://youtu.be/pAn4FLC5nEU?t=302)

- RU deck `7_1_Introduction_to_BI_tools,_Importing_data,_Transforming_Data.pptx` (lesson 7.1, Javokhir Tashbaev, TBC × Payme): what BI is and its benefits — slides 4–5; why Power BI and its parts (Desktop / Service / Mobile) — slides 6–8; the process of building a report — slide 9; Desktop's Report, Data and Model sections — slides 10–12; Power Query as an ETL tool — slide 13; the homework — slide 14.
- RU deck `Power BI 7.2.pptx`: data model, star and snowflake schemas — slides 3–5; relationships: cardinality, cross-filter direction, active property — slides 6–8.
- `Power BI 7.1.pbix` — the lecture's report file. It is a binary Power BI file: it cannot be read here, open it in Power BI Desktop to see the lecturer's queries and model.
- `HW 7.1_Sales_Data_Practice.xlsx` — the original course's Power Query homework (optional extra): a sales export with a title and empty rows on top, "Конец" at the bottom, category codes to replace from a `Categories` sheet, names to split, a `Returned` column of "No" and errors to turn into 0/1, dates to split into day / month / year — eight steps, all from week 4.
- DAX guide `Подробное руководство по DAX.pdf` (Russo & Ferrari; PDF page = book page): chapter 1, the data model and relationship direction, pp. 27–42 (direction pp. 29–35); chapter 15, relationships in depth, pp. 514–566 (one-to-many p. 538, many-to-many pp. 540–553, ambiguity pp. 559–566).
- *Russian terms:* бизнес-аналитика (BI) = business intelligence, отчёт = report, дашборд = dashboard, источник данных = data source, импорт / DirectQuery = import / DirectQuery, обновление по расписанию = scheduled refresh, редактор Power Query = Power Query editor, применённые шаги = applied steps, слияние / добавление запросов = merge / append queries, модель данных = data model, схема «звезда» = star schema, таблица фактов / измерений = fact / dimension table, связь = relationship, кардинальность = cardinality, направление кросс-фильтрации = cross-filter direction, таблица дат = date table, вычисляемый столбец = calculated column, мера = measure.

---

## 2. Worked example — the first card that refreshes (15 min)

1. Home → Get data → Text/CSV → `data/powerbi/v_loan_status.csv` → **Transform data**. Check the types (list above); `bucket` must be Text. *Close & Apply*. Table view: **7 828 rows**.
2. Same for `products.csv`, `branches.csv`, `dim_date.csv` (`date` as Date).
3. Model view: drag `products[code]` onto `v_loan_status[product]` → the dialog says *Many to one (*:1)*, *Single* → OK. Same for `branches[branch_name]` → `v_loan_status[branch_name]` and `dim_date[date]` → `v_loan_status[disbursed_at]`. Mark `dim_date` as the date table.
4. Home → New measure: `Outstanding = SUM ( v_loan_status[outstanding] )`; Measure tools → Format: Whole number, thousands separator.
5. Report view: a **Card** with `Outstanding` → **208 723 504 430**. A **Slicer** with `products[product_name]` → *Small business loan* → **125 892 942 411**. A **Table** with `branches[branch_name]` and `Outstanding`, sorted descending → Tashkent Central **28 716 674 373** at the top, Termez Central 10 670 177 559 at the bottom.
6. Save as `nur_week7.pbix`. Next month, *Refresh* re-reads the CSVs (or the SQL views): no pasting, no ranges, no "August twice". The card's number is the week-3 tile — the model reproduces the SQL, which is the first test of any BI model.

---

## 3. Practice (60 min)

Power BI Desktop, one `.pbix` for the whole week (`nur_week7.pbix`). Keep a short log of what you clicked — it becomes your HW 7.2 notes.

**P1.** Load `v_loan_status`, `v_portfolio_monthly`, `v_payments_clean` through *Transform data*. Report the row count of each in Table view and the totals of `outstanding`, `disbursed_amount` and `amount`.

<details><summary>Answer</summary>
**7 828 · 1 700 · 52 850** rows. Σ `outstanding` **208 723 504 430**; Σ `disbursed_amount` (all 34 months) **404 783 280 000** (2024 86 522 990 000 · 2025 155 927 230 000 · 2026 162 333 060 000); Σ `amount` **255 114 772 176** — the week-3 checks, unchanged. If a count is short, Power Query probably dropped a header or split a row; if a total is off, look for a column typed as Text (it will not sum) or Decimal with rounding.
</details>

**P2.** Profile `v_loan_status` in Power Query (Column quality / distribution / profile, on the entire data set). How many distinct buckets, how many loans with zero outstanding, the largest outstanding and its loan? What changes if the profile stays on the first 1 000 rows?

<details><summary>Answer</summary>
5 buckets (0 · 1-30 · 31-60 · 61-90 · 90+); **4 419** loans with `outstanding` = 0 (closed, written off, or fully due — 7 828 − 3 409); maximum **586 068 714**, loan 4597 (SME, Bukhara Central). On the first 1 000 rows the profile shows only what those loans have (947 in bucket 0, 32 in 90+) — a profile is a sample until you tell it not to be.
</details>

**P3.** Load the four other facts and the five dimensions (`data/powerbi/README.md`). Which file needs a type you would not guess, and which column of `dim_date` must be sorted by another?

<details><summary>Answer</summary>
Row counts: `fct_installments` 92 193, `fct_first_instalment` 7 099, `fct_applications` 14 000, `fct_collections_actions` 9 361, `dim_date` 1 461, `products` 5, `branches` 10, `customers_clean` 6 000, `staff_collectors` 30. Watch `fct_applications`: `applied_at` has a time, the relationship uses `applied_date` (Date); `fct_first_instalment[vintage]` ("2026-07") should stay Text. Sort `month_name` by `month` and `year_month` by `month_start`.
</details>

**P4.** Merge `v_payments_clean` with `v_loan_status` on `loan_id` (Left Outer), expanding only `product` and `branch_name`. Check the row count, then relate payments to `products` and show **collected in September 2026 by product**.

<details><summary>Answer</summary>
Still **52 850** rows, no blanks (every payment's loan exists). Collected (paid_at in September 2026, `Collected Amount = SUM(v_payments_clean[amount])`): SME **9 865 366 314** · AUTO 2 988 980 257 · CONS 2 872 046 580 · MICRO 344 950 525 · BNPL 267 479 531 — total **16 338 823 207**. A row count above 52 850 would mean the right-hand table had duplicate `loan_id`s: a merge is only a lookup when the other side is unique.
</details>

**P5.** Build every relationship in the README. Then a table visual by `products[code]` with `Outstanding` and `Disbursed Count = COUNTROWS(v_loan_status)`. What does the Model view's diagram look like, and what does each line's "1" and "*" mean?

<details><summary>Answer</summary>
SME 125 892 942 411 / 781 · AUTO 57 684 271 333 / 391 · CONS 23 054 933 316 / 2 418 · BNPL 1 135 251 000 / 1 569 · MICRO 956 106 370 / 2 669 (total 7 828). The diagram: five dimensions around seven facts, every line with **1** at the dimension and **\*** at the fact, a single arrow pointing to the fact; no line between two facts. "1" = each key appears once there; "*" = many rows per key.
</details>

**P6.** The missing-relationship symptom. Before relating `v_payments_clean` to `products`, put `products[code]` and `Collected Amount` in a table. What do you see, and what does it tell you?

<details><summary>Answer</summary>
Every product shows the same number — **255 114 772 176**, the grand total — because no filter can travel from `products` to the payments. "The same value in every row" is the signature of a missing (or inactive) relationship; "a total bigger than it should be" is the signature of a wrong grain (Company corner); "(Blank)" as a category is the signature of keys that do not match (P8).
</details>

**P7.** Mark `dim_date` as the date table and set the sort orders. Then `Disbursed Amount = SUM(v_loan_status[principal])` by `dim_date[year_month]` for 2026. Report January, August and September.

<details><summary>Answer</summary>
January **17 452 370 000** (287 loans) · August **22 290 210 000** (358) · September **17 015 490 000** (361); October shows 852 760 000 (21 loans, one day). If you see the months in the order 2026-01, 2026-02… you sorted right; if a visual by `month_name` starts with April, the sort-by column is missing.
</details>

**P8.** Relate `customers_clean` to `v_loan_status` and show `Outstanding` by `customers_clean[segment]`. Explain the extra row, then fix it with `customer_id_map.csv` in Power Query.

<details><summary>Answer</summary>
A **(Blank)** row with **1 563 976 162** — 48 loans (week 4's 40 removed duplicates) whose `customer_id` is no longer in the dimension. Fix: merge `v_loan_status` with `customer_id_map` on `customer_id` (Left Outer), add a column `customer_id_master ?? customer_id` (M's "if null, use"), relate that column instead. After: affluent **44 253 773 349** · mass **118 769 279 493** · sme **45 700 451 588**, no blank, total still 208 723 504 430. The blank row is a data-quality finding — report it, do not hide it with a visual-level filter.
</details>

**P9.** Calculated column vs measure. Create the column `par30_outstanding = IF(v_loan_status[dpd] > 30, v_loan_status[outstanding], 0)` and the measure `PAR30 % = DIVIDE(SUM(v_loan_status[par30_outstanding]), SUM(v_loan_status[outstanding]))`. Then try two wrong versions: the **average** of a column `is_par30 = IF(v_loan_status[dpd] > 30, 1, 0)` on all loans, and on loans with outstanding > 0. Which number is PAR30?

<details><summary>Answer</summary>
Measure: **3.12 %** (6 507 526 953 / 208 723 504 430). Average of the flag on all loans: **3.51 %** (275 / 7 828 — a *count* share, and it includes closed loans); on loans with outstanding: **2.85 %** (97 / 3 409). PAR30 is a share of **money**, so only the ratio of sums is right; the averages answer other questions ("what share of loans is 30+ late?"). Ratios are measures.
</details>

**P10.** Grain detective. In Power Query, merge `fct_installments` with `v_loan_status` and expand `outstanding` onto the instalments. Load it as a test table and sum `outstanding`. What happened?

<details><summary>Answer</summary>
**6 186 108 589 284** — 29.6 times the book. Each loan's outstanding was copied onto each of its instalments (11.8 per loan on average) and then summed. The model's answer is never to bring a loan-level number down to a finer grain; both facts relate to the same dimensions instead (Company corner). Delete the test table.
</details>

<span class="badge stretch">Stretch</span> **P11.** The Folder connector. With pandas, split `v_portfolio_monthly.csv` into three files by year in a new folder (`pm_2024.csv`, `pm_2025.csv`, `pm_2026.csv`). In Power BI: Get data → Folder → *Combine & Transform*. Check rows and the disbursed total, then add a fourth file and refresh. (Or, instead: connect to your SQL Server `nur` database and load the three views by SQL statement.)

<details><summary>Answer</summary>
Rows **600 + 600 + 500 = 1 700**, Σ `disbursed_amount` **404 783 280 000** — the same as the single file; Power BI adds a `Source.Name` column with the file name. A fourth file dropped into the folder appears after Refresh with no change to the report — that is exactly what Bekzod's monthly paste should have been. (SQL Server: the same totals; `SELECT … FROM v_loan_status` in *Advanced options* puts the query text in the M step `Sql.Database(…, [Query = "…"])`.)
</details>

### Mistakes people make

- *Load* instead of *Transform data* — the types are guessed and never checked.
- `bucket`, `vintage` or ids typed as numbers; dates as text — relationships fail or totals are wrong.
- Accepting a many-to-many relationship because "it worked"; setting cross-filter to Both "to make the slicer work".
- Relating two fact tables directly (loans ↔ payments) or merging a loan-level number into a payment-level table.
- No date table, or the date table not marked — time intelligence silently wrong tomorrow.
- Months sorted alphabetically.
- An absolute file path in the source, so the refresh fails on Timur's PC.
- A calculated column for every ratio (or an average of row-level ratios presented as a portfolio ratio).
- Hiding a (Blank) category with a filter instead of fixing the key.
- Reading Column profile on the default first 1 000 rows and concluding "no nulls, no outliers".
- Using the automatic date hierarchy of each date column next to `dim_date` — two calendars, two answers.

---

## 4. Homework <span class="badge hw">HW 7.2 — due Day 5</span>

**HW 7.1** is due today in `submissions/week-07/day-1/`. **HW 7.2 — the model and six base measures.** Submit to `submissions/week-07/day-3/`:

1. `nur_week7.pbix` — the data from `data/powerbi/` (CSV or SQL Server), types set, every README relationship (1 : *, single), `dim_date` marked, sort orders set, the 48-loan fix applied.
2. `model.png` — a screenshot of the Model view where every relationship line is visible.
3. `measures.png` — a table visual by `products[code]` with the six measures below and their total row.

| Measure | Total (no filter) | SME | MICRO |
|---|---|---|---|
| Outstanding | **208 723 504 430** | 125 892 942 411 | 956 106 370 |
| Disbursed Amount | **404 783 280 000** | 241 117 150 000 | 7 221 210 000 |
| Disbursed Count | **7 828** | 781 | 2 669 |
| Avg Ticket | **51 709 668** | 308 728 745 | 2 705 586 |
| PAR30 % | **3.12 %** | 2.55 % | 0.72 % |
| NPL90 % | **2.55 %** | 2.47 % | 0.00 % |

The formulas are in `data/powerbi/measures.dax` (section 1). Graded on: (a) the six totals and the two product columns match; (b) the model is a clean star — no fact-to-fact relationship, no Both, no many-to-many, date table marked; (c) the 48-loan blank is fixed in Power Query (not hidden), and a short note in `notes.md` says how.

---

## 5. Self-check

1. A table by product shows the same number in every row. What is wrong, and where do you look? *(→ P6, "The model")*
2. Why is `bucket` a Text column, and what goes wrong if Power BI types it as a number? *(→ "Power Query in Power BI", P2)*
3. Calculated column or measure: (a) an age band per customer, (b) the collection rate, (c) "is this loan 90+". *(→ "Calculated columns vs measures", P9)*

---

## 6. Company corner <span class="badge company">Grain and relationships</span>

Two facts with different grains — a **loan** (one row per loan, `outstanding` as of today) and a **payment** (one row per payment, `amount` on a date) — describe the same business but cannot be joined into one table without breaking one of them. Loan 1 (Termez Central, Consumer) has one row in `v_loan_status` and several in `v_payments_clean`; merge them and its 9 593 064 outstanding appears once **per payment**.

| What was built | Σ outstanding | SME outstanding | Why |
|---|---|---|---|
| `v_loan_status` alone (right) | **208 723 504 430** | **125 892 942 411** | one row per loan |
| payments merged with loans, outstanding expanded (wrong) | 1 527 946 681 726 (×7.3) | 897 676 451 249 (×7.1) | 52 850 payment rows; 7 436 loans have payments, 7.1 each on average |
| instalments merged with loans (wrong) | 6 186 108 589 284 (×29.6) | — | 92 193 instalment rows, 11.8 per loan |

The wrong totals are not even "wrong by a constant": loans with many payments (long SME and Auto terms) are multiplied more, loans with none (392 with no payment yet) vanish from an inner join. No later formula can repair it. And `SELECT DISTINCT` or `Remove duplicates` on the merged table does not repair it either (week 3, habit 4).

**The bridge is the dimensions.** Keep each fact at its own grain; give both the same keys — `product`, `branch_name`, a date — and relate both to the same `products`, `branches`, `dim_date`. A visual by product then asks each fact its own question and puts the answers side by side:

| product | Outstanding (loan fact) | Collected all-time (payment fact) | Collected in Sep 2026 |
|---|---|---|---|
| SME | 125 892 942 411 | 150 391 108 583 | 9 865 366 314 |
| AUTO | 57 684 271 333 | 42 277 105 907 | 2 988 980 257 |
| CONS | 23 054 933 316 | 50 413 160 274 | 2 872 046 580 |
| BNPL | 1 135 251 000 | 5 312 805 543 | 267 479 531 |
| MICRO | 956 106 370 | 6 720 591 869 | 344 950 525 |
| **total** | **208 723 504 430** | **255 114 772 176** | **16 338 823 207** |

Both columns are right, because each measure aggregates its own table and the slicer reaches both through `products`. The same holds for the **date**: `v_loan_status` is dated by disbursement, payments by payment day, instalments by due day — a September filter means three different things in three facts, and each is correct for its question (tomorrow's measures say which). The one thing the star cannot answer by itself is a question that truly needs both grains at once ("collected per loan of each DPD bucket"): then the answer is an aggregate at the coarser grain (payments summed **per loan** in SQL or Power Query, then related as a loan-level column), never the raw merge.

> Interview version: *"Why not just join all tables into one big flat table for Power BI?"* — Because facts with different grains multiply each other's numbers when joined: a loan's balance repeated on every payment summed to 1.5 trillion instead of 209 billion. A star schema keeps each fact at its grain, relates every fact to shared dimensions (one-to-many, single direction), and lets measures aggregate each fact separately; a filter on a dimension reaches all facts consistently.

Tomorrow: DAX — `CALCULATE`, filter context, time intelligence — and the three pages Bekzod will show the board.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w07d3", "pass": 0.8, "questions": [
  {"type": "single", "q": "A table by product shows the same number in every row. What is the most likely cause?", "options": ["The measure uses DIVIDE", "Too many rows", "A missing or inactive relationship — no filter can travel from products to that fact", "A wrong data type"], "answer": 2, "explain": "Same value everywhere = missing relationship; a too-big total = wrong grain; (Blank) = keys that do not match (→ P6)."},
  {"type": "single", "q": "Power BI proposes a many-to-many relationship between products and a fact. What do you do?", "options": ["Set cross-filter to Both", "Accept it — it works", "Find why the 'one' side is not unique (a duplicate key, a trailing space, a type mismatch) and fix the data", "Delete the dimension"], "answer": 2, "explain": "The dimension side must be unique; never accept many-to-many to make the warning go away (→ section 1, 'The model')."},
  {"type": "single", "q": "Why are bidirectional (Both) relationships dangerous?", "options": ["They duplicate rows", "They are slower but correct", "They cannot be used with dates", "A slicer then filters other dimensions and, through them, other facts — plausible-looking wrong numbers and ambiguous paths"], "answer": 3, "explain": "Single direction everywhere; when one measure needs the other direction, ask for it inside that measure (CROSSFILTER) (→ section 1, 'Why bidirectional is dangerous')."},
  {"type": "single", "q": "A card shows the Average of this column. What does it show?", "code": "is_par30 = IF ( v_loan_status[dpd] > 30, 1, 0 )      -- calculated column", "options": ["NPL90", "PAR30", "Blank", "The share of loans, by count and closed loans included, that are more than 30 days late — not a share of money"], "answer": 3, "explain": "PAR30 is a ratio of sums of money — a measure with DIVIDE(SUM, SUM); ratios are measures, never averages of row-level flags (→ section 1, 'Calculated columns vs measures', P9)."},
  {"type": "number", "q": "v_payments_clean has 52 850 rows and loan_id is unique in v_loan_status. How many rows after this merge?", "code": "Merge Queries: v_payments_clean <- v_loan_status on loan_id, Left Outer\nExpand: product, branch_name only", "answer": 52850, "tol": 0, "explain": "A merge is a lookup only when the right side is unique: rows stay 52 850; more rows would mean duplicate keys (→ section 1, 'Power Query', P4)."},
  {"type": "multi", "q": "Which belong to the two-minute model check before any visual?", "options": ["dim_date marked as the date table", "Every relationship 1 : *, single direction, no unintended dashed line", "Cross-filter set to Both so slicers reach everything", "Row counts in Table view against the README", "Load instead of Transform data, to save time"], "answer": [0, 1, 3], "explain": "Load skips the type check, and Both makes numbers silently wrong (→ section 1, 'Check the model before any visual')."},
  {"type": "single", "q": "Which storage mode fits the Nur reports, and why?", "options": ["Live connection to Excel", "Composite — always best", "Import — the data are copied into the .pbix, visuals are fast, all DAX works, and a refresh re-reads the views", "DirectQuery — always live"], "answer": 2, "explain": "DirectQuery is for tables too big to copy or data that must be live (→ section 1, 'Get data')."},
  {"type": "single", "q": "Company corner: why not merge everything into one flat table for Power BI?", "options": ["DAX needs at least two tables", "Power BI cannot read flat tables", "Flat tables refresh more slowly", "Facts with different grains multiply each other's numbers: a loan's outstanding repeated on each payment sums to about 7 times the book"], "answer": 3, "explain": "Keep each fact at its grain and relate all facts to shared dimensions (→ Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w07d3", "q": "Nilufar asks whether loans to small-business owners as PEOPLE are riskier. In your model (the 48-loan key fix applied, customers_clean related to v_loan_status), put PAR30 % = DIVIDE(SUM(par30_outstanding), SUM(outstanding)) in a table by customers_clean[segment]. What does it show for the segment \"sme\"? Give a percentage to 2 decimals.", "type": "number", "dp": 2, "h": ["ff02958aed6109f9f071f6a2"], "hint": "If your table still has a (Blank) row, the answer will be a few hundredths off — the key fix decides which segment those loans belong to.", "sol": "REFYIChvbiB2X2xvYW5fc3RhdHVzLCBhZnRlciB0aGUgUG93ZXIgUXVlcnkgbWVyZ2Ugd2l0aCBjdXN0b21lcl9pZF9tYXAgYW5kIHRoZSBjb2x1bW4gY3VzdG9tZXJfaWRfbWFzdGVyID8/IGN1c3RvbWVyX2lkIHJlbGF0ZWQgdG8gY3VzdG9tZXJzX2NsZWFuKToKcGFyMzBfb3V0c3RhbmRpbmcgPSBJRiAoIHZfbG9hbl9zdGF0dXNbZHBkXSA+IDMwLCB2X2xvYW5fc3RhdHVzW291dHN0YW5kaW5nXSwgMCApICAgICAgLS0gY2FsY3VsYXRlZCBjb2x1bW4KUEFSMzAgJSA9IERJVklERSAoIFNVTSAoIHZfbG9hbl9zdGF0dXNbcGFyMzBfb3V0c3RhbmRpbmddICksIFNVTSAoIHZfbG9hbl9zdGF0dXNbb3V0c3RhbmRpbmddICkgKQoKcGFuZGFzIGNoZWNrOgpsID0gcGQucmVhZF9jc3YoInZfbG9hbl9zdGF0dXMuY3N2IikubWVyZ2UocGQucmVhZF9jc3YoImN1c3RvbWVyX2lkX21hcC5jc3YiKSwgb249ImN1c3RvbWVyX2lkIiwgaG93PSJsZWZ0IikKbFsiY2lkIl0gPSBsWyJjdXN0b21lcl9pZF9tYXN0ZXIiXS5maWxsbmEobFsiY3VzdG9tZXJfaWQiXSkuYXN0eXBlKGludCkKYyA9IHBkLnJlYWRfY3N2KCJjdXN0b21lcnNfY2xlYW4uY3N2IilbWyJjdXN0b21lcl9pZCIsICJzZWdtZW50Il1dLnJlbmFtZShjb2x1bW5zPXsiY3VzdG9tZXJfaWQiOiAiY2lkIn0pCnggPSBsLm1lcmdlKGMsIG9uPSJjaWQiLCBob3c9ImxlZnQiLCB2YWxpZGF0ZT0ibToxIikKcyA9IHhbeFsic2VnbWVudCJdID09ICJzbWUiXQoxMDAgKiBzLmxvY1tzWyJkcGQiXSA+IDMwLCAib3V0c3RhbmRpbmciXS5zdW0oKSAvIHNbIm91dHN0YW5kaW5nIl0uc3VtKCkgICAgICMgNS40MgoKc21lIDUuNDIgJSAoYWZmbHVlbnQgMi45NCAlLCBtYXNzIDIuMzAgJSkgb24gNDUuNyBibiBvZiBvdXRzdGFuZGluZzogdGhlIHBlb3BsZSB3aG8gcnVuIHNtYWxsIGJ1c2luZXNzZXMgY2FycnkgUEFSMzAgbW9yZSB0aGFuIHR3aWNlIHRoZSBtYXNzIHNlZ21lbnQncy4KV2l0aG91dCB0aGUga2V5IGZpeCB0aGUgKEJsYW5rKSByb3cga2VlcHMgNDggbG9hbnMgd2l0aCBQQVIzMCA4LjQ1ICUgYW5kIHNtZSBzaG93cyA1LjM4ICUg4oCUIGEgc21hbGwgc2hpZnQgaGVyZSwgYnV0IGEgYmxhbmsgcm93IGlzIGEgd3JvbmcgYW5zd2VyIHRoYXQgbG9va3MgcmlnaHQuCk5vdGUgdGhlIGRpZmZlcmVuY2UgZnJvbSB0aGUgU01FIHByb2R1Y3QgKFBBUjMwIDIuNTUgJSk6IHRoZSBjdXN0b21lcidzIHNlZ21lbnQgYW5kIHRoZSBsb2FuJ3MgcHJvZHVjdCBhcmUgdHdvIGRpZmZlcmVudCBjdXRzLCBhbmQgaGVyZSB0aGV5IHBvaW50IGluIG9wcG9zaXRlIGRpcmVjdGlvbnMu"}
```

<!-- challenge:end -->
