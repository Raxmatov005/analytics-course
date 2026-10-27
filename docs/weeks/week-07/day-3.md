# Week 7 · Day 3 — Power BI I: get data, Power Query, the model

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 60 min</span> <span class="badge hw">HW 7.1 due · HW 7.2 (due Day 5)</span> <span class="badge company">Company corner</span>

> STORY **Wednesday, 9:00.** Timur, BI (*BI-специалист*), closes the experiment readout and opens a different file: Bekzod's Excel one-pager from week 4, with three cells highlighted in red. *"This broke again on Monday. Someone pasted September under August, the pivot range stopped at row 1 700, and the board saw August's outstanding twice. Every month a person rebuilds it by hand and every month something breaks. **Rebuild it in Power BI, on the views you wrote in week 3, so that it refreshes** — one click, or no click at all. Today: the data and the model. Tomorrow: the measures and the pages. If the model is wrong, nothing tomorrow will be right."*

## Today in 3 lines

- What a **BI tool** is and why the banks in the region mostly run **Power BI**; its parts (**Desktop** — free, Windows — **Service**, **Mobile**, **Report Server**) and the build process: get data → transform → model → measures → visuals → publish.
- **Get data** from CSV (`data/powerbi/`) or from SQL Server (the optional `nur` database from [Tools at work](tools-at-work.md)), **Power Query** in Power BI (the same editor as Excel's in week 4: types, cleaning, merge, append; M in one paragraph), Import vs DirectQuery.
- The **star schema** in the Model view — facts `v_loan_status`, `v_payments_clean`, `v_portfolio_monthly` (+ four small facts), dimensions date / product / branch / customer — **one-to-many, single direction**, `dim_date` marked as the date table; and the first look at **calculated columns vs measures**. The first card shows **208 723 504 430**.

---

## 1. Learn — from a file that breaks to a model that refreshes

> 🧭 **Before you start.** Today you build in **Power BI Desktop** (free, Windows; on a Mac, a Windows virtual machine) — Power BI cannot run inside this page. Download the files from `data/powerbi` (every file name with a ⬇ button saves it): for the worked example `data/powerbi/v_loan_status.csv`, `data/powerbi/products.csv`, `data/powerbi/branches.csv` and `data/powerbi/dim_date.csv`; for Practice the rest of the folder, including `data/powerbi/customer_id_map.csv` and `data/powerbi/README.md` (the relationships). Keep them in one folder. **End state today:** one file `nur_week7.pbix` with the 14 tables loaded, a star in the Model view (every line 1 : *, single direction), `dim_date` marked as the date table, and a card that shows **208 723 504 430**. The boxes on this page check the numbers you read off your visuals. Click paths are for the current Desktop release; menu names move between versions, the steps do not.

### What a BI tool does — and why Power BI

**What it is.** **Business intelligence** (*бизнес-аналитика*, BI) is the layer between the data and the people who decide: a **model** of the business data, a set of agreed calculations (**measures**), and **reports** that refresh from the source. Excel can do each step once. A BI tool makes it **repeatable**: the same definitions every month, no pasted ranges, a refresh instead of a rebuild.

**How it looks.** The build process, always in this order:

```text
get data  →  transform (Power Query)  →  model (relationships)  →  measures (DAX)  →  visuals  →  publish
  CSV, SQL      types, cleaning            the star                  Outstanding, PAR30   cards, lines   Service, PDF
```

| Tool | Who makes it / licence | Known for |
|---|---|---|
| **Power BI** | Microsoft; Desktop free, sharing needs Pro / Premium | Excel-like Power Query, DAX, Microsoft integration |
| **Tableau** | Salesforce; paid | visual exploration, polished charts |
| **Looker** / Looker Studio | Google | a modelling language on cloud warehouses |
| **Apache Superset**, **Metabase** | open source | SQL-first dashboards on your own server |

**When you use it.** When a report is rebuilt by hand every month, or when two people get two numbers for "outstanding". The banks in the region mostly run **Power BI**: their data sit in SQL Server and Excel, staff sign in with Microsoft accounts, Desktop is free, and **Report Server** keeps data inside the bank. The ideas of today — model, grain, measures — carry over to every tool on the list.

**Your turn.** What does a BI tool add that Bekzod's Excel one-pager lacks?

```task
{"id": "w07d3-l1", "kind": "choice", "options": ["Prettier charts", "Repeatable definitions and a refresh from the source, instead of a monthly rebuild by hand", "The ability to sum a column", "Pivot tables"], "answer": 1, "explain": "Excel can compute every number once. The one-pager broke because a person pasted data and extended ranges each month; a model that reads the source and refreshes removes that step."}
```

### Power BI Desktop — the Report, Table and Model views

**What it is.** **Power BI Desktop** is the free Windows program where you build everything. It has views on its left edge: **Report** (the canvas with visuals), **Table** (the data row by row — older versions call it **Data**), **Model** (tables and their relationships), and in newer versions **DAX query**. The other parts of Power BI only share what Desktop builds:

| part | what you do there | what you need |
|---|---|---|
| **Desktop** | data, Power Query, model, DAX, report pages | Windows; free |
| **Service** (app.powerbi.com) | publish, share, schedule refresh, apps | a work or school account; Pro to share |
| **Mobile** | read reports on a phone | the Service |
| **Report Server** | the Service on the bank's own servers | a server licence |

**How to use it.** Each view answers one question:

| question | view |
|---|---|
| Did all 7 828 rows arrive? Is `bucket` text? | **Table** |
| Is every relationship 1 : *, single direction? | **Model** |
| Does the card show 208 723 504 430? | **Report** |

**When you use it.** All three, in a loop: load in Power Query, check rows in Table, relate in Model, show in Report.

**Your turn.** Which view do you open to draw a relationship between two tables?

```task
{"id": "w07d3-l2", "kind": "text", "answer": ["Model", "Model view", "the Model view"], "hint": "Tables and the lines between them.", "model": "The Model view: drag a dimension's key onto the fact's column, then check the dialog."}
```

### Get Data — connecting to the source

**What it is.** **Get Data** (*получить данные*) connects Power BI to a source and opens the import. The source is read, not pasted, so the next refresh reads it again.

**How to write it.**
1. Home → **Get data** → **Text/CSV** → `data/powerbi/v_loan_status.csv`.
2. In the preview, click **Transform data** — not Load. You check the types first.
3. Repeat per file. For a folder of **same-shaped** files (one CSV per month): Get data → **Folder** → *Combine & Transform*. Power BI stacks them and picks up next month's file on refresh.
4. For **SQL Server**: Get data → SQL Server → Server `localhost` (or `.\SQLEXPRESS`), Database `nur` → tick the views `v_loan_status`, `v_portfolio_monthly`, `v_payments_clean`. *Advanced options* accepts a SQL statement instead: `SELECT loan_id, product, branch_name, outstanding, dpd FROM v_loan_status` — only the columns you need.

**When you use it.**
- **Text/CSV** — the course files, one-off exports.
- **Folder** — a monthly export of the same shape.
- **SQL Server** — the bank's database: the definitions stay in the SQL views, Power BI only reads them.

> ⚠️ **Watch out.** The file path in the source is absolute. Move the folder and the refresh breaks on Timur's PC. Make the folder a **parameter** (Home → Manage parameters) and point every query at it.

**Your turn.** Finance drops one CSV per month, always with the same columns, into a shared folder. Which connector?

```task
{"id": "w07d3-l3", "kind": "choice", "options": ["Text/CSV, once per file, every month", "Folder, then Combine & Transform", "SQL Server", "Copy and paste into Excel first"], "answer": 1, "explain": "Folder stacks every same-shaped file it finds. Next month's file is picked up by Refresh with no change to the report — exactly what the monthly paste should have been."}
```

### Import or DirectQuery — where the data live

**What it is.** The **storage mode** (*режим хранения*) decides where the data sit. **Import** copies them into the `.pbix`, compressed in memory. **DirectQuery** leaves them in the database and sends a query for every visual.

**How to read it.**

| storage mode | data live | visual speed | freshness | use when |
|---|---|---|---|---|
| **Import** | inside the `.pbix` | fastest | as of the last refresh (up to 8 a day on Pro) | almost always — our case |
| **DirectQuery** | in the source database | as fast as the database | live | very large or must-be-live tables |
| **Composite** | some tables each way | mixed | mixed | a big live fact with small imported dimensions |

**When you use it.** Import for the Nur reports: 14 tables, the biggest 92 193 rows, refreshed once a day. DirectQuery when the table is too big to copy or the number must be current to the minute; some DAX is limited there.

**Your turn.** The board pack shows month-end figures and is read once a week. Which mode?

```task
{"id": "w07d3-l4", "kind": "choice", "options": ["DirectQuery — always live", "Import — the data are small, visuals are fast, all DAX works, and a scheduled refresh is fresh enough", "Composite — always best", "It does not matter"], "answer": 1, "explain": "A weekly board pack does not need minute-by-minute data. Import is faster and supports every DAX function; DirectQuery is for tables too big to copy or data that must be live."}
```

### Power Query — the Applied Steps

**What it is.** *Transform data* opens **Power Query** — the same editor you used in Excel in week 4. Every click is recorded as a step in **Applied Steps** (*применённые шаги*), and every **Refresh** replays them from the source. Behind the steps is **M** (*язык M*), Power Query's formula language: a `let` block where each step builds on the one before.

**How to write it.**
1. **Types** — `principal`, `outstanding`, `dpd` Whole number; `disbursed_at`, `month`, `paid_at`, `due_date` Date; `bucket`, `vintage`, `product`, `branch_name` **Text**.
2. **Profile** — View → *Column quality*, *Column distribution*, *Column profile*. Switch the status bar from "first 1 000 rows" to **entire data set**.
3. **Replace / fix** — values and keys (the 48 loans whose customer was removed in week 4 — Practice).
4. **Close & Apply** — the result loads into the model.

What the clicks wrote, in *Advanced Editor*:

```
let
    Source   = Csv.Document(File.Contents("C:\...\data\powerbi\v_loan_status.csv"), [Delimiter = ",", Encoding = 65001]),   // the file
    Promoted = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),                                                    // first row = headers
    Typed    = Table.TransformColumnTypes(Promoted, {{"loan_id", Int64.Type}, {"disbursed_at", type date},                  // the types
                   {"principal", Int64.Type}, {"outstanding", Int64.Type}, {"dpd", Int64.Type}, {"bucket", type text}})
in
    Typed                                                                                                                   // the last step is the table
```

**When you use it.** For every table, before it enters the model. M shapes tables **before** they are loaded; DAX (tomorrow) calculates numbers **after**.

> ⚠️ **Watch out.** Wrong types are the most common reason a total is wrong or a relationship refuses to be created. `bucket` holds "1-30" — a label that only looks like a range; typed as a number, those rows become errors.

**Your turn.** Which data type do you give the column `bucket`?

```task
{"id": "w07d3-l5", "kind": "text", "answer": ["Text", "text", "Text type"], "hint": "Its values are \"0\", \"1-30\", \"31-60\", \"61-90\", \"90+\".", "model": "Text. \"1-30\" and \"90+\" are labels, not numbers; as Whole number they turn into errors and the slicer breaks."}
```

### Merge and Append — a lookup and a stack

**What it is.** **Merge Queries** (*слияние запросов*) adds columns from another table by a key — Power Query's VLOOKUP. **Append Queries** (*добавление запросов*) stacks tables of the same shape — more rows, same columns.

**How to write it.** Merge `v_payments_clean` ← `v_loan_status` on `loan_id`:
1. Select `v_payments_clean` → Home → **Merge Queries**.
2. Second table `v_loan_status`; click `loan_id` in both; Join kind **Left Outer**.
3. Expand the new column and tick **only** `product` and `branch_name`.

| `v_payments_clean` | payment_id | loan_id | amount | ← | `v_loan_status` | loan_id | product |
|---|---|---|---|---|---|---|---|
| | 1 | 1 | 1 741 700 | | | 1 | CONS |
| | 2 | 1 | 1 741 700 | | | 3 | MICRO |

| result | payment_id | loan_id | amount | product |
|---|---|---|---|---|
| | 1 | 1 | 1 741 700 | CONS |
| | 2 | 1 | 1 741 700 | CONS |

Rows stay 52 850 — one per payment — because `loan_id` is unique in `v_loan_status`. **Append**: Home → Append Queries → pick tables with the same columns (two years of exports). The Folder connector is an automatic append.

**When you use it.**

| | Merge | Append |
|---|---|---|
| adds | columns | rows |
| needs | a key, unique on the other side | the same columns |
| example | product and branch onto each payment | 2025 and 2026 exports into one table |

> ⚠️ **Watch out.** Expand only descriptive columns. Expanding `outstanding` here copies each loan's balance onto every one of its payments — summed, it becomes 1.5 trillion (Company corner).

**Your turn.** `v_payments_clean` has 52 850 rows and `loan_id` is unique in `v_loan_status`. How many rows after the merge?

```task
{"id": "w07d3-l6", "kind": "number", "answer": 52850, "dp": 0, "unit": "rows", "hint": "A Left Outer merge on a unique key is a lookup.", "model": "52 850 — still one row per payment. More rows would mean the right-hand table has duplicate keys."}
```

### The star schema — fact tables and dimension tables

**What it is.** A **star schema** (*схема «звезда»*) puts **fact tables** (*таблицы фактов*) in the centre and **dimension tables** (*таблицы измерений*) around them. A fact holds events or states at a stated **grain** — numbers to add up and keys pointing out. A dimension holds one row per thing you slice by.

**How to write it.** Our model, drawn the way the Model view shows it:

```text
              dim_date (1 461 days)
                     │ 1
                     ▼ *
products (5) ──1──▶ v_loan_status (7 828 loans) ◀──1── branches (10)
                     ▲ *
                     │ 1
              customers_clean (6 000)
```

| fact (grain) | rows | dimensions it uses |
|---|---|---|
| `v_loan_status` (one loan, as of 2026-10-01) | 7 828 | date (disbursed_at), product, branch, customer |
| `v_portfolio_monthly` (month × product × branch) | 1 700 | date (month), product, branch |
| `v_payments_clean` (one payment) | 52 850 | date (paid_at); product, branch after the merge |
| `fct_installments` (one scheduled instalment) | 92 193 | date (due_date), product, branch |
| `fct_first_instalment` (one loan in FPD scope) | 7 099 | date (disbursed_at), product, branch |
| `fct_applications` (one application) | 14 000 | date (applied_date), product, branch, customer |
| `fct_collections_actions` (one action) | 9 361 | date (action_date), product, branch, collector |

Dimensions: `dim_date` (1 461 days), `products` (5), `branches` (10), `customers_clean` (6 000), `staff_collectors` (30). `data/powerbi/README.md` lists every relationship.

**When you use it.** Every model. Each fact keeps its own grain; facts never connect to each other — they meet through the shared dimensions.

> ⚠️ **Watch out.** Never relate two facts directly (loans ↔ payments). A filter on a product reaches both through `products`.

**Your turn.**

```game
{"type": "sort", "id": "w07d3-g5", "title": "Fact or dimension?", "q": "Sort each table of the Nur model.", "groups": {"Fact (events at a grain, numbers to add)": ["v_loan_status", "v_payments_clean", "fct_installments", "fct_collections_actions"], "Dimension (one row per thing you slice by)": ["products", "branches", "dim_date", "customers_clean"]}, "why": "Facts hold loans, payments, instalments and actions with amounts; dimensions hold one row per product, branch, day and customer."}
```

### Cardinality — the "1" and the "*" of a relationship

**What it is.** A **relationship** (*связь*) connects a dimension's key to a fact's column. Its **cardinality** (*кардинальность*) says how many rows match on each side. The star uses **one-to-many (1 : *)**: the key is unique in the dimension (the "1") and repeats in the fact (the "*").

**How to write it.**
1. Model view → drag `products[code]` onto `v_loan_status[product]` (or Modeling → Manage relationships → New).
2. The dialog proposes **Many to one (*:1)** — the same relationship seen from the fact. Check it, then OK.
3. Repeat for every line in the README.

| `products` (1 side) | code | | `v_loan_status` (* side) | loan_id | product |
|---|---|---|---|---|---|
| | SME | | | 2861 | SME |
| | MICRO | | | 4570 | SME |
| | | | | 1 | CONS |

**When you use it.** Every relationship you create — read the dialog before clicking OK. The symptoms of a broken relationship in a visual:

| what the table by product shows | the cause |
|---|---|
| the same number in every row | no relationship (or an inactive one) — no filter reaches the fact |
| a (Blank) row | fact keys with no match in the dimension |
| a total far bigger than the source | a wrong grain (a merge that copied rows) |

> ⚠️ **Watch out.** If Power BI proposes **many-to-many**, the "1" side is not unique — a duplicate key, a trailing space, a type mismatch. Fix the data; never accept many-to-many to make the warning go away.

**Your turn.** In the relationship `products[code]` → `v_loan_status[product]`, which table is on the "1" side?

```task
{"id": "w07d3-l7", "kind": "text", "answer": ["products", "products table", "the products table"], "hint": "Where is each code written exactly once?", "model": "products — five rows, each code once. v_loan_status repeats each code on many loans: the \"*\" side."}
```

### Cross-filter direction — single, from the dimension to the fact

**What it is.** The **cross-filter direction** (*направление кросс-фильтрации*) says which way a filter travels along a relationship. **Single**: from the dimension to the fact — a product slicer filters loans. **Both**: also from the fact back to the dimension, and from there on to other facts.

**How to write it.** Double-click a relationship line → *Cross filter direction* → **Single**. In the Model view the line carries one arrow, pointing at the fact.

```text
single:  products ──▶ v_loan_status            a product slicer filters loans; loans do not filter products
both:    products ◀─▶ v_loan_status ◀─▶ customers_clean ...   a segment slicer now filters products, then every other fact
```

**When you use it.** Single everywhere. With `customers_clean ↔ v_loan_status` set to Both, a segment slicer on "sme" filters `products` and `branches` to those sme customers use, and through them `fct_installments` to *every* loan of those products — not to sme customers' loans. The numbers look plausible and are wrong.

> ⚠️ **Watch out.** Never switch a relationship to Both to make a slicer "work". When one measure needs the other direction, ask for it inside that measure (`CROSSFILTER`, tomorrow).

**Your turn.** A slicer on customer segment does not change a table built on `fct_installments`. What do you do?

```task
{"id": "w07d3-l8", "kind": "choice", "options": ["Set customers_clean ↔ v_loan_status to Both", "Nothing is broken: fct_installments has no customer key, so the model cannot filter it by segment; add customer_id to the fact in Power Query if the question needs it", "Relate fct_installments directly to v_loan_status", "Accept a many-to-many relationship"], "answer": 1, "explain": "A slicer reaches only facts that hold the dimension's key. Both would make it reach them through products and branches — the wrong loans. The fix belongs in the data, not in the direction."}
```

### Active and inactive relationships

**What it is.** Between two tables only **one active** path may exist. A second relationship — say a second date column — is created **inactive** (*неактивная связь*): drawn dashed, ignored by visuals, used only by a measure that asks for it with `USERELATIONSHIP`.

**How to write it.** `fct_first_instalment` has two dates: `disbursed_at` (active, solid line) and `first_due_date`.
1. Model view → drag `dim_date[date]` onto `fct_first_instalment[first_due_date]`. Power BI creates it dashed.
2. A measure that uses the dashed line:

```dax
FPD Loans by Due Date =
CALCULATE (
    COUNTROWS ( fct_first_instalment ),                                       -- what to count
    USERELATIONSHIP ( dim_date[date], fct_first_instalment[first_due_date] )  -- use the dashed line, for this measure only
)
```

| month on the axis | `COUNTROWS` (active: disbursed in) | `FPD Loans by Due Date` (inactive: first due in) |
|---|---|---|
| June 2026 | 373 | 377 |
| July 2026 | 367 | 373 |
| August 2026 | 11 | 367 |

August 2026: 11 loans were disbursed and are already in scope, but 367 loans had their first instalment due.

**When you use it.** A fact with two or more dates: applied vs decided, disbursed vs first due, due vs paid. One date is the default (active); the others are available per measure.

> ⚠️ **Watch out.** An unintended dashed line is a missing relationship in disguise: visuals ignore it, and every row shows the same number.

**Your turn.** How many loans in `fct_first_instalment` had their **first instalment due** in July 2026?

```task
{"id": "w07d3-l9", "kind": "number", "answer": 373, "dp": 0, "unit": "loans", "hint": "The inactive relationship, read in the table above.", "model": "373 by first due date (the July row of FPD Loans by Due Date), against 367 disbursed in July. Two dates, two correct answers to two questions."}
```

### A date table — and marking it

**What it is.** A **date table** (*таблица дат*) is a dimension with **one row per day**, no gaps, covering every date in the facts. `dim_date` runs 2024-01-01 … 2027-12-31 and has columns for year, quarter, month, month name, `year_month`. **Marking** it tells Power BI to use it for time intelligence and to switch off its hidden automatic date tables.

**How to write it.**
1. Select `dim_date` → Table tools → **Mark as date table** → column `date`.
2. Relate `dim_date[date]` to each fact's date column (README).
3. **Sort by column** (Column tools): `month_name` by `month`, `year_month` by `month_start` — or the axis reads April, August, December…

| date | year | month | month_name | year_month |
|---|---|---|---|---|
| 2026-09-30 | 2026 | 9 | September | 2026-09 |
| 2026-10-01 | 2026 | 10 | October | 2026-10 |

**When you use it.** Every model with a date. Tomorrow's `TOTALYTD`, `SAMEPERIODLASTYEAR` and `DATEADD` need it marked.

> ⚠️ **Watch out.** Slicing by a fact's own date column next to `dim_date` gives two calendars and two answers. Use `dim_date` on every axis and slicer.

**Your turn.** How many rows must `dim_date` have to cover 2024-01-01 to 2027-12-31 with no gaps?

```task
{"id": "w07d3-l10", "kind": "number", "answer": 1461, "dp": 0, "unit": "days", "hint": "Four years, one of them a leap year.", "model": "1 461 = 365 × 3 + 366 (2024 is a leap year). Fewer rows mean a gap, and time intelligence silently goes wrong."}
```

### Data types and formatting in the model

**What it is.** After loading, each column has a **data type**, a **format** and a **default summarization** (*агрегирование по умолчанию*) — what Power BI does when the column is dropped into a visual. Set them once in the model; every visual inherits them.

**How to write it.** Select a column → **Column tools**:
1. **Data type** — the same as in Power Query; change it there if you can.
2. **Format** — Whole number with a thousands separator for soum; Percentage for rates; a date format for dates.
3. **Summarization** — *Don't summarize* for ids, `year`, `dpd` and codes; Sum only for amounts.
4. **Data category** — e.g. *City* for a region column, so a map can read it.

| column | type | format | summarization |
|---|---|---|---|
| `outstanding` | Whole number | 208,723,504,430 | Sum |
| `loan_id` | Whole number | 1234 | Don't summarize |
| `year` | Whole number | 2026 | Don't summarize |
| `bucket` | Text | — | — |

**When you use it.** Right after Close & Apply, before the first visual.

> ⚠️ **Watch out.** "Sum of loan_id" or "Sum of year" in a visual means the summarization was left on Sum. The number is meaningless — set *Don't summarize*.

**Your turn.** A table visual on `dim_date` shows a column "Sum of year" with 2 959 254. What is the fix?

```task
{"id": "w07d3-l11", "kind": "choice", "options": ["Delete the year column", "Column tools → Summarization → Don't summarize, so year is used as a label", "Change year to Text in every visual", "Divide by 2026"], "answer": 1, "explain": "year is a label, not an amount. With summarization Don't summarize, dropping it into a visual groups by year instead of adding the years up."}
```

### Hiding keys — what the report author should not see

**What it is.** A fact's key columns (`product`, `branch_name`, `customer_id`, `disbursed_at`) exist only to carry relationships. **Hiding** them (*скрыть в представлении отчёта*) removes them from the Fields pane, so authors slice by the dimension's columns instead. Hidden columns still work in relationships and DAX.

**How to write it.**
1. Model view → right-click the column `v_loan_status[product]` → **Hide in report view**. Or click the eye icon in the Data pane.
2. Repeat for every fact-side key and every technical column (`customer_id_master`, `Source.Name`).
3. Keep visible: the dimension columns (`products[product_name]`, `branches[branch_name]`, `dim_date[year_month]`) and the measures.

| table | visible | hidden |
|---|---|---|
| `products` | code, product_name, annual_rate | — |
| `v_loan_status` | (measures) | product, branch_name, customer_id, disbursed_at |

**When you use it.** Before anyone else builds on your model. A slicer on `v_loan_status[product]` filters only loans; a slicer on `products[code]` filters every fact.

> ⚠️ **Watch out.** A slicer built on a fact's key column filters that one fact — the other pages silently ignore it.

**Your turn.** Which columns do you hide? Tick every one.

```task
{"id": "w07d3-l12", "kind": "multi", "options": ["v_loan_status[product]", "products[product_name]", "v_payments_clean[loan_id]", "dim_date[year_month]", "fct_installments[branch_name]"], "answer": [0, 2, 4], "explain": "Fact-side keys are hidden: authors slice by products, branches and dim_date. Dimension columns that people read (product_name, year_month) stay visible."}
```

### Calculated column vs measure — a first look

**What it is.** Two ways to add a calculation. A **calculated column** (*вычисляемый столбец*) is computed once per row at refresh and stored. A **measure** (*мера*) is computed when a visual asks, once per cell, after the filters.

**How to write it.**

```dax
par30_outstanding = IF ( v_loan_status[dpd] > 30, v_loan_status[outstanding], 0 )             -- column: one value per loan
Outstanding       = SUM ( v_loan_status[outstanding] )                                         -- measure: one value per cell
PAR30 %           = DIVIDE ( SUM ( v_loan_status[par30_outstanding] ), [Outstanding] )         -- measure: a ratio of sums
```

| | calculated column | measure |
|---|---|---|
| computed | once per row, at refresh; stored | at query time, for each cell |
| sees | the current row | the filters of the cell |
| use for | a value you slice or filter by, a key | every number on a card, axis or matrix |

Card `Outstanding`: 208 723 504 430. Card `PAR30 %`: 3.12 %.

**When you use it.** Tomorrow's whole lesson. Today one rule: **ratios are measures** — a ratio of sums, computed after the filters, never an average of row-level ratios.

> 💡 **Key idea.** Ratios are measures: a ratio of sums, computed after the filters — never an average of row-level ratios or flags.

**Your turn.**

```game
{"type": "sort", "id": "w07d3-g2", "title": "Calculated column or measure?", "q": "Put each item where it belongs.", "groups": {"Calculated column": ["An age band per customer", "\"Is this loan 90+\" flag", "A key used in a relationship", "par30_outstanding per loan"], "Measure": ["PAR30 %", "Collection rate", "Outstanding on a card", "Average ticket"]}, "why": "Columns are values you slice or filter by, one per row; every number a visual aggregates — and every ratio — is a measure."}
```

### Putting it together

Week 4's one-pager already had every idea; Power BI gives each one a home that survives next month.

| Excel one-pager (week 4) | Power BI | concept |
|---|---|---|
| CSV pasted under last month's rows | Get data → CSV / Folder / SQL Server, **Refresh** | Get Data |
| Power Query in the workbook | the same Power Query, Applied Steps | Power Query |
| VLOOKUP between sheets | **relationships** in the Model view | star, cardinality, direction |
| a pivot's Sum of `outstanding` | a **measure** `Outstanding = SUM(...)` | measure |
| a timeline on `disbursed_at` | `dim_date`, marked, and a date slicer | date table |
| "Data as of" typed by hand | a measure or the refresh time | measure |

**What Refresh does**, in order: re-runs every query's Applied Steps from the source, re-applies the types, rebuilds the tables and calculated columns, redraws every visual. If a step fails (a renamed column, a moved file), the refresh stops and names the query and the step.

**Check the model before any visual** — two minutes, every time:
1. Row counts in Table view match the README.
2. The card `Outstanding` = 208 723 504 430.
3. Every relationship 1 : *, single, no dashed line you did not intend.
4. `dim_date` marked; months sorted by number.
5. A table by product shows different numbers per row and no (Blank) row.

> 💡 **Key idea.** The first test of any BI model is that it reproduces the SQL: the card says 208 723 504 430, like the week-3 tile.

**Your turn.** Match each Excel habit with its Power BI home — then review the words of the day.

```game
{"type": "match", "id": "w07d3-g3", "title": "Excel one-pager → Power BI", "pairs": [["VLOOKUP between sheets", "a relationship in the Model view"], ["Sum of outstanding in a pivot", "a measure Outstanding = SUM(...)"], ["CSV pasted under last month's rows", "Get data + Refresh"], ["Report Connections on slicers", "Sync slicers across pages"], ["A timeline on disbursed_at", "dim_date + a date slicer"], ["\"Data as of\" typed by hand", "a measure or the refresh time"]]}
```

```game
{"type": "flash", "id": "w07d3-g1", "title": "Power BI words of the day", "cards": [["Star schema", "facts in the centre, dimensions around them, each fact related to each dimension one-to-many"], ["Fact table", "events or states at a stated grain, with numbers to add up and keys pointing out (v_loan_status, v_payments_clean)"], ["Dimension table", "one row per thing you slice by (products, branches, dim_date)"], ["Cardinality 1 : *", "the dimension's key is unique, the fact repeats it"], ["Cross-filter direction: single", "filters flow from the dimension to the fact, not back"], ["Inactive relationship", "a dashed line, used only when a measure asks with USERELATIONSHIP"], ["Measure", "computed at query time for every cell, in its filter context; stores nothing"], ["Calculated column", "computed once per row at refresh and stored; sees the current row"], ["Import", "the data are copied into the .pbix: fast, all DAX, refreshed on a schedule"], ["DirectQuery", "the data stay in the database; every visual sends a query"], ["Applied Steps", "Power Query's recorded clicks, replayed by every Refresh"], ["M", "Power Query's language: shapes tables before they are loaded"]]}
```

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Get Data + first Power Query transform — [Power BI Tutorial for Beginners (Step-by-Step in 30 Minutes) (Guy in a Cube), 05:04](https://youtu.be/OmW9YvxSl1E?t=304&end=447)
- ▶ Power Query in Power BI — [Learn Power BI in Under 3 Hours (Alex The Analyst), 11:59](https://youtu.be/I0vQ_VLZTWg?t=719&end=1454)
- ▶ Power Query in Power BI (short single-topic) — [How to use Power Query in Power BI (Alex The Analyst), 01:45](https://youtu.be/gP-AxNi6uxo?t=105&end=152)
- ▶ Star schema / data model — [Learn Data Modelling & Star Schema for Power BI in 20 minutes (Chandoo), 02:18](https://youtu.be/4ePNrdxWtY0?t=138&end=580)
- ▶ Relationships (cardinality, filter direction, active) — [How to Create and Manage Relationships in Power BI (Alex The Analyst), 03:45](https://youtu.be/sW5LoDA1ssM?t=225&end=272)
- ▶ Relationships, fuller — Alex's 3-hour course, [24:14](https://youtu.be/I0vQ_VLZTWg?t=1454&end=1917)
- ▶ (RU) Power Query + Power BI data model — [Power Query для Excel и Power BI. ПОЛНЫЙ БАЗОВЫЙ КУРС (ПРО ДАННЫЕ), 05:02](https://youtu.be/pAn4FLC5nEU?t=302&end=359)

- RU deck (TBC Data Analytics 2.0, if you have it) `7_1_Introduction_to_BI_tools,_Importing_data,_Transforming_Data.pptx` (lesson 7.1, Javokhir Tashbaev, TBC × Payme): what BI is and its benefits — slides 4–5; why Power BI and its parts (Desktop / Service / Mobile) — slides 6–8; the process of building a report — slide 9; Desktop's Report, Data and Model sections — slides 10–12; Power Query as an ETL tool — slide 13; the homework — slide 14.
- RU deck (TBC Data Analytics 2.0, if you have it) `Power BI 7.2.pptx`: data model, star and snowflake schemas — slides 3–5; relationships: cardinality, cross-filter direction, active property — slides 6–8.
- `Power BI 7.1.pbix` — the lecture's report file. It is a binary Power BI file: it cannot be read here, open it in Power BI Desktop to see the lecturer's queries and model.
- `HW 7.1_Sales_Data_Practice.xlsx` — the original course's Power Query homework (optional extra): a sales export with a title and empty rows on top, "Конец" at the bottom, category codes to replace from a `Categories` sheet, names to split, a `Returned` column of "No" and errors to turn into 0/1, dates to split into day / month / year — eight steps, all from week 4.
- DAX guide `Подробное руководство по DAX.pdf` (Russo & Ferrari; PDF page = book page): chapter 1, the data model and relationship direction, pp. 27–42 (direction pp. 29–35); chapter 15, relationships in depth, pp. 514–566 (one-to-many p. 538, many-to-many pp. 540–553, ambiguity pp. 559–566).
- *Russian terms:* бизнес-аналитика (BI) = business intelligence, отчёт = report, дашборд = dashboard, источник данных = data source, импорт / DirectQuery = import / DirectQuery, обновление по расписанию = scheduled refresh, редактор Power Query = Power Query editor, применённые шаги = applied steps, слияние / добавление запросов = merge / append queries, модель данных = data model, схема «звезда» = star schema, таблица фактов / измерений = fact / dimension table, связь = relationship, кардинальность = cardinality, направление кросс-фильтрации = cross-filter direction, таблица дат = date table, вычисляемый столбец = calculated column, мера = measure.

```videoquiz
{"video": "OmW9YvxSl1E", "stops": [{"at": 340, "q": "You connect to a CSV. Why click Transform data rather than Load?", "options": ["Load is slower", "To check and set the column types before the data enter the model", "Transform deletes empty rows automatically", "Load does not work for CSV"], "answer": 1, "explain": "Wrong types are the most common reason a total is wrong or a relationship refuses to be created."}, {"at": 420, "q": "What happens to the steps you click in Power Query?", "options": ["They are lost on save", "They change the source file", "They are recorded as Applied Steps and replayed on every Refresh", "They run once"], "answer": 2, "explain": "That is why the report refreshes instead of being rebuilt.", "back": 40}]}
```

```videoquiz
{"video": "I0vQ_VLZTWg", "stops": [{"at": 900, "q": "Power Query in Power BI is…", "options": ["the same editor you used in Excel in week 4", "a DAX editor", "a chart designer", "only for SQL Server"], "answer": 0, "explain": "Same editor, same Applied Steps; its output feeds every visual."}, {"at": 1250, "q": "A numeric-looking code such as bucket '1-30' should be typed as…", "options": ["Whole number", "Date", "Text", "Decimal"], "answer": 2, "explain": "It is a label that only looks like a range; as a number it breaks.", "back": 60}, {"at": 1600, "q": "You create a relationship. Which side must be unique?", "options": ["The fact side", "Both sides", "Neither", "The dimension side — the 'one' of one-to-many"], "answer": 3, "explain": "If Power BI proposes many-to-many, the 'one' side is not unique: fix the data."}, {"at": 1850, "q": "Which cross-filter direction is the safe default?", "options": ["Both", "Single — from the dimension to the fact", "None", "Whatever Power BI suggests"], "answer": 1, "explain": "Both makes slicers filter other dimensions and facts: plausible-looking wrong numbers.", "back": 60}]}
```

```videoquiz
{"video": "gP-AxNi6uxo", "stops": [{"at": 125, "q": "What does Power Query do with your data?", "options": ["Draws the charts", "Cleans and shapes it before it is loaded", "Writes DAX measures", "Publishes the report"], "answer": 1, "explain": "M shapes tables before loading; DAX calculates numbers after."}, {"at": 148, "q": "Where do you see what each click did?", "options": ["In Applied Steps", "In the Report view", "In the Service", "Nowhere"], "answer": 0, "explain": "Every step is listed and can be edited or deleted.", "back": 30}]}
```

```videoquiz
{"video": "4ePNrdxWtY0", "stops": [{"at": 220, "q": "What does a fact table hold?", "options": ["One row per product", "Events or states at a stated grain, with numbers and keys", "Only dates", "Report settings"], "answer": 1, "explain": "v_loan_status: one loan; v_payments_clean: one payment."}, {"at": 380, "q": "What does a dimension table hold?", "options": ["One row per thing you slice by", "Every transaction", "Measures", "Only numbers"], "answer": 0, "explain": "products (5 rows), branches (10), dim_date (1 461)."}, {"at": 540, "q": "Why one flat table is a bad model for several facts", "options": ["It cannot be loaded", "Facts with different grains multiply each other's numbers when joined", "Flat tables have no columns", "DAX needs exactly two tables"], "answer": 1, "explain": "Each fact at its grain, related through shared dimensions.", "back": 60}]}
```

```videoquiz
{"video": "sW5LoDA1ssM", "stops": [{"at": 240, "q": "Where do you create or edit relationships?", "options": ["In the Report view's format pane", "In the Model view (or Manage relationships)", "In Power Query only", "In the Service"], "answer": 1, "explain": "Drag a dimension key onto the fact column, then check cardinality and direction."}, {"at": 265, "q": "A relationship line is dashed. What does that mean?", "options": ["It is broken", "It is inactive — used only when a measure asks with USERELATIONSHIP", "It is bidirectional", "It is many-to-many"], "answer": 1, "explain": "Only one active path may connect two tables.", "back": 25}]}
```

```videoquiz
{"video": "pAn4FLC5nEU", "stops": [{"at": 320, "q": "What is Power Query for, in Excel and Power BI alike?", "options": ["Repeatable loading and cleaning of data", "Drawing charts", "Writing VBA", "Sharing reports"], "answer": 0, "explain": "The same steps every month — that is what makes a report refresh."}, {"at": 352, "q": "After loading, what turns separate tables into a model?", "options": ["Copying them onto one sheet", "Relationships between their keys", "Formatting", "Pivot tables"], "answer": 1, "explain": "Relationships replace VLOOKUP: one definition used by every visual.", "back": 30}]}
```

---

## 2. Worked example — the first card that refreshes (15 min)

**Ask:** Timur's test of a model — one card that shows the week-3 outstanding and refreshes. Each step names the concept of section 1 it uses.

1. **Get Data** — Home → Get data → Text/CSV → `data/powerbi/v_loan_status.csv` → **Transform data**.
2. **Power Query** — check the types (`bucket` must be Text); Close & Apply. **Table view**: **7 828 rows**.
3. **Get Data** again — `products.csv`, `branches.csv`, `dim_date.csv` (`date` as Date).
4. **Star schema, cardinality, direction** — Model view: drag `products[code]` onto `v_loan_status[product]` → the dialog says *Many to one (*:1)*, *Single* → OK. Same for `branches[branch_name]` → `v_loan_status[branch_name]` and `dim_date[date]` → `v_loan_status[disbursed_at]`.
5. **Date table** — mark `dim_date` as the date table; sort `month_name` by `month`.
6. **Formatting and hiding keys** — hide `v_loan_status[product]`, `[branch_name]`, `[disbursed_at]`; set *Don't summarize* on `loan_id`.
7. **Measure** — Home → New measure: `Outstanding = SUM ( v_loan_status[outstanding] )`; Measure tools → Format: Whole number, thousands separator.
8. **Report view** — a **Card** with `Outstanding` → **208 723 504 430**. A **Slicer** with `products[product_name]` → *Small business loan* → **125 892 942 411**. A **Table** with `branches[branch_name]` and `Outstanding`, sorted descending → Tashkent Central **28 716 674 373** at the top, Termez Central 10 670 177 559 at the bottom.
9. **Refresh** — save as `nur_week7.pbix`. Next month, *Refresh* re-reads the CSVs (or the SQL views): no pasting, no ranges, no "August twice". The card's number is the week-3 tile — the model reproduces the SQL, which is the first test of any BI model.

---

## 3. Practice (60 min)

Power BI Desktop, one `.pbix` for the whole week (`nur_week7.pbix`). Keep a short log of what you clicked — it becomes your HW 7.2 notes. Under each question, type the number (or word) your visual shows: the box checks it and then shows the model answer.

**P1.** *(Get Data · Table view)* Load `v_loan_status`, `v_portfolio_monthly`, `v_payments_clean` through *Transform data*. Report the row count of each in Table view and the totals of `outstanding`, `disbursed_amount` and `amount`.

```task
{"id": "w07d3-p1", "kind": "number", "answer": 404783280000, "dp": 0, "unit": "soum", "hint": "Enter Σ disbursed_amount of v_portfolio_monthly (all 34 months).", "model": "7 828 · 1 700 · 52 850 rows. Σ outstanding 208 723 504 430; Σ disbursed_amount (all 34 months) 404 783 280 000 (2024 86 522 990 000 · 2025 155 927 230 000 · 2026 162 333 060 000); Σ amount 255 114 772 176 — the week-3 checks, unchanged. If a count is short, Power Query probably dropped a header or split a row; if a total is off, look for a column typed as Text (it will not sum) or Decimal with rounding."}
```

**P2.** *(Import or DirectQuery)* Timur's colleague asks: "Why not DirectQuery to the SQL Server views — then the board always sees live numbers?" Pick the answer you would give.

```task
{"id": "w07d3-p12", "kind": "choice", "options": ["DirectQuery is always better", "The board reads month-end and as-of numbers once a week; Import is faster, supports all DAX, and a scheduled refresh keeps it current enough — DirectQuery would make every visual wait for the database", "Import cannot read SQL Server", "DirectQuery cannot show cards"], "answer": 1, "explain": "Live data matter for an operations screen, not for a board pack. Import with a daily refresh gives the same numbers, faster, with every DAX function; DirectQuery is for tables too big to copy or data that must be current to the minute."}
```

**P3.** *(Power Query — profile)* Profile `v_loan_status` in Power Query (Column quality / distribution / profile, on the entire data set). How many distinct buckets, how many loans with zero outstanding, the largest outstanding and its loan? What changes if the profile stays on the first 1 000 rows?

```task
{"id": "w07d3-p2", "kind": "number", "answer": 4419, "dp": 0, "unit": "loans", "hint": "Enter the number of loans with outstanding = 0.", "model": "5 buckets (0 · 1-30 · 31-60 · 61-90 · 90+); 4 419 loans with outstanding = 0 (closed, written off, or fully due — 7 828 − 3 409); maximum 586 068 714, loan 4597 (SME, Bukhara Central). On the first 1 000 rows the profile shows only what those loans have (947 in bucket 0, 32 in 90+) — a profile is a sample until you tell it not to be."}
```

**P4.** *(Merge)* Merge `v_payments_clean` with `v_loan_status` on `loan_id` (Left Outer), expanding only `product` and `branch_name`. Check the row count, then relate payments to `products` and show **collected in September 2026 by product**.

```task
{"id": "w07d3-p4", "kind": "number", "answer": 9865366314, "dp": 0, "unit": "soum", "hint": "Enter SME's collected amount, paid_at in September 2026.", "model": "Still 52 850 rows, no blanks (every payment's loan exists). Collected (paid_at in September 2026, Collected Amount = SUM(v_payments_clean[amount])): SME 9 865 366 314 · AUTO 2 988 980 257 · CONS 2 872 046 580 · MICRO 344 950 525 · BNPL 267 479 531 — total 16 338 823 207. A row count above 52 850 would mean the right-hand table had duplicate loan_ids: a merge is only a lookup when the other side is unique."}
```

**P5.** *(star schema · cardinality)* Build every relationship in the README. Then a table visual by `products[code]` with `Outstanding` and `Disbursed Count = COUNTROWS(v_loan_status)`. What does the Model view's diagram look like, and what does each line's "1" and "*" mean?

```task
{"id": "w07d3-p5", "kind": "number", "answer": 2669, "dp": 0, "unit": "loans", "hint": "Enter Disbursed Count for MICRO.", "model": "SME 125 892 942 411 / 781 · AUTO 57 684 271 333 / 391 · CONS 23 054 933 316 / 2 418 · BNPL 1 135 251 000 / 1 569 · MICRO 956 106 370 / 2 669 (total 7 828). The diagram: five dimensions around seven facts, every line with 1 at the dimension and * at the fact, a single arrow pointing to the fact; no line between two facts. \"1\" = each key appears once there; \"\" = many rows per key."}
```

**P6.** *(relationships — the missing one)* The missing-relationship symptom. Before relating `v_payments_clean` to `products`, put `products[code]` and `Collected Amount` in a table. What do you see, and what does it tell you?

```task
{"id": "w07d3-p6", "kind": "choice", "options": ["A missing (or inactive) relationship: no filter can travel from products to the payments", "A wrong grain: a merge duplicated the payments", "Keys that do not match", "The measure lacks DIVIDE"], "answer": 0, "explain": "Every product shows the same number — 255 114 772 176, the grand total — because no filter can travel from products to the payments. \"The same value in every row\" is the signature of a missing (or inactive) relationship; \"a total bigger than it should be\" is the signature of a wrong grain (Company corner); \"(Blank)\" as a category is the signature of keys that do not match (P7)."}
```

**P7.** *(keys that do not match)* Relate `customers_clean` to `v_loan_status` and show `Outstanding` by `customers_clean[segment]`. Explain the extra row, then fix it with `customer_id_map.csv` in Power Query.

```task
{"id": "w07d3-p8", "kind": "number", "answer": 1563976162, "dp": 0, "unit": "soum", "hint": "Enter the outstanding of the (Blank) row, before the fix.", "model": "A (Blank) row with 1 563 976 162 — 48 loans (week 4's 40 removed duplicates) whose customer_id is no longer in the dimension. Fix: merge v_loan_status with customer_id_map on customer_id (Left Outer), add a column customer_id_master ?? customer_id (M's \"if null, use\"), relate that column instead. After: affluent 44 253 773 349 · mass 118 769 279 493 · sme 45 700 451 588, no blank, total still 208 723 504 430. The blank row is a data-quality finding — report it, do not hide it with a visual-level filter."}
```

**P8.** *(cross-filter direction)* Set `customers_clean ↔ v_loan_status` to **Both**, put a slicer on `customers_clean[segment]` = sme, and look at a table of `products[code]` with `COUNTROWS(fct_installments)`. What happened, and what do you set back?

```task
{"id": "w07d3-p13", "kind": "choice", "options": ["The table now shows sme customers' instalments — Both is correct", "The slicer filtered products to those sme customers have, and fct_installments to every instalment of those products — not sme customers' instalments; set the relationship back to Single", "Nothing changes", "Power BI refuses Both"], "answer": 1, "explain": "With Both, the filter travels loans → products → every other fact. fct_installments has no customer key, so it gets the instalments of whole products. The numbers look plausible and are wrong; single direction everywhere."}
```

**P9.** *(active and inactive relationships)* Create the inactive relationship `dim_date[date]` → `fct_first_instalment[first_due_date]` and the measure `FPD Loans by Due Date` (section 1). In a table by `dim_date[year_month]`, how many loans had their first instalment due in **May 2026**?

```task
{"id": "w07d3-p14", "kind": "number", "answer": 313, "dp": 0, "unit": "loans", "hint": "The USERELATIONSHIP measure in the 2026-05 row.", "model": "313 by first due date, against 377 disbursed in May (the active relationship). A loan disbursed late in a month has its first instalment due the next month — the two dates answer two different questions."}
```

**P10.** *(date table)* Mark `dim_date` as the date table and set the sort orders. Then `Disbursed Amount = SUM(v_loan_status[principal])` by `dim_date[year_month]` for 2026. Report January, August and September.

```task
{"id": "w07d3-p7", "kind": "number", "answer": 22290210000, "dp": 0, "unit": "soum", "hint": "Enter Disbursed Amount for August 2026.", "model": "January 17 452 370 000 (287 loans) · August 22 290 210 000 (358) · September 17 015 490 000 (361); October shows 852 760 000 (21 loans, one day). If you see the months in the order 2026-01, 2026-02… you sorted right; if a visual by month_name starts with April, the sort-by column is missing."}
```

**P11.** *(data types · sort by column)* Load the four other facts and the five dimensions (`data/powerbi/README.md`). Which file needs a type you would not guess, and which column of `dim_date` must be sorted by another?

```task
{"id": "w07d3-p3", "kind": "text", "answer": ["month", "dim_date[month]", "the month column", "month number"], "hint": "Type the column you sort month_name by.", "model": "Row counts: fct_installments 92 193, fct_first_instalment 7 099, fct_applications 14 000, fct_collections_actions 9 361, dim_date 1 461, products 5, branches 10, customers_clean 6 000, staff_collectors 30. Watch fct_applications: applied_at has a time, the relationship uses applied_date (Date); fct_first_instalment[vintage] (\"2026-07\") should stay Text. Sort month_name by month and year_month by month_start."}
```

**P12.** *(hiding keys)* Bekzod built a slicer on `v_loan_status[branch_name]`. The loans table on his page reacts; the payments table next to it does not. Why, and what is the fix?

```task
{"id": "w07d3-p15", "kind": "choice", "options": ["The payments table is broken", "The slicer is on a fact's key column, so it filters only that fact; hide the fact keys and slice by branches[branch_name], which reaches every related fact", "Set the payments relationship to Both", "Payments cannot be filtered by branch"], "answer": 1, "explain": "A filter on v_loan_status[branch_name] stays inside v_loan_status. The dimension column branches[branch_name] reaches every fact related to branches. Hiding fact keys stops this mistake before it is made."}
```

**P13.** *(calculated column vs measure)* Calculated column vs measure. Create the column `par30_outstanding = IF(v_loan_status[dpd] > 30, v_loan_status[outstanding], 0)` and the measure `PAR30 % = DIVIDE(SUM(v_loan_status[par30_outstanding]), SUM(v_loan_status[outstanding]))`. Then try two wrong versions: the **average** of a column `is_par30 = IF(v_loan_status[dpd] > 30, 1, 0)` on all loans, and on loans with outstanding > 0. Which number is PAR30?

```task
{"id": "w07d3-p9", "kind": "choice", "options": ["3.12 % — the measure: a ratio of sums of money", "3.51 % — the average of is_par30 on all loans", "2.85 % — the average of is_par30 on loans with outstanding", "All three: they are the same idea"], "answer": 0, "explain": "Measure: 3.12 % (6 507 526 953 / 208 723 504 430). Average of the flag on all loans: 3.51 % (275 / 7 828 — a count share, and it includes closed loans); on loans with outstanding: 2.85 % (97 / 3 409). PAR30 is a share of money, so only the ratio of sums is right; the averages answer other questions (\"what share of loans is 30+ late?\"). Ratios are measures."}
```

**P14.** *(putting it together — grain)* Grain detective. In Power Query, merge `fct_installments` with `v_loan_status` and expand `outstanding` onto the instalments. Load it as a test table and sum `outstanding`. What happened?

```task
{"id": "w07d3-p10", "kind": "number", "answer": 6186108589284, "dp": 0, "unit": "soum", "hint": "Enter Σ outstanding of the test table.", "model": "6 186 108 589 284 — 29.6 times the book. Each loan's outstanding was copied onto each of its instalments (11.8 per loan on average) and then summed. The model's answer is never to bring a loan-level number down to a finer grain; both facts relate to the same dimensions instead (Company corner). Delete the test table."}
```

> 🚀 **Stretch (optional, +5 XP).** **P15.** *(Get Data — Folder)* The Folder connector. With pandas, split `v_portfolio_monthly.csv` into three files by year in a new folder (`pm_2024.csv`, `pm_2025.csv`, `pm_2026.csv`). In Power BI: Get data → Folder → *Combine & Transform*. Check rows and the disbursed total, then add a fourth file and refresh. (Or, instead: connect to your SQL Server `nur` database and load the three views by SQL statement.)

```task
{"id": "w07d3-p11", "kind": "number", "answer": 1700, "dp": 0, "unit": "rows", "hint": "Enter the rows after Combine & Transform (three files).", "xp": 2, "model": "Rows 600 + 600 + 500 = 1 700, Σ disbursed_amount 404 783 280 000 — the same as the single file; Power BI adds a Source.Name column with the file name. A fourth file dropped into the folder appears after Refresh with no change to the report — that is exactly what Bekzod's monthly paste should have been. (SQL Server: the same totals; SELECT … FROM v_loan_status in Advanced options puts the query text in the M step Sql.Database(…, [Query = \"…\"]).)"}
```

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

## 4. Homework <span class="badge hw">HW 7.2 — Due Day 5</span>

**HW 7.1** is due today in Day 1's hand-in box. **HW 7.2 — the model and six base measures.** Hand in with the 📎 box below:

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

The formulas are in `data/powerbi/measures.dax` (⬇ Download it; Day 4 explains every one). The table above gives the totals; the boxes below check four cells it does not show — read them off your `measures.png` table.

**H1.** Disbursed Amount for AUTO.

```task
{"id": "w07d3-h1", "kind": "number", "answer": 84791530000, "dp": 0, "unit": "soum", "model": "AUTO 84 791 530 000 (391 loans). If yours is larger, look for a Both relationship or a merge that copied rows; if it is blank, the products relationship is missing."}
```

**H2.** PAR30 % for CONS (two decimals).

```task
{"id": "w07d3-h2", "kind": "number", "answer": 3.09, "dp": 2, "unit": "%", "model": "CONS 3.09 % — DIVIDE(SUM(par30_outstanding), SUM(outstanding)) in the CONS row. An average of a row-level flag would give a share of loans, not of money."}
```

**H3.** NPL90 % for BNPL (two decimals).

```task
{"id": "w07d3-h3", "kind": "number", "answer": 0.48, "dp": 2, "unit": "%", "model": "BNPL 0.48 % (PAR30 1.28 %)."}
```

**H4.** Avg Ticket for AUTO (whole soum).

```task
{"id": "w07d3-h4", "kind": "number", "answer": 216858133, "dp": 0, "unit": "soum", "model": "AUTO 216 858 133 = 84 791 530 000 / 391 — DIVIDE([Disbursed Amount], [Disbursed Count])."}
```

### 📎 Hand in here

```sqltask
{"check": "handin-W7D3", "lesson": "W7D3", "title": "HW 7.2", "tasks": [{"id": "nur_week7.pbix", "file": "nur_week7.pbix", "names": ["nur_week7.pbix"], "upload": true, "accept": ".pbix", "q": "Attach `nur_week7.pbix` — what the page above asks for."}, {"id": "model.png", "file": "model.png", "names": ["model.png"], "upload": true, "accept": ".png", "q": "Attach `model.png` — the Model view with every relationship line visible."}, {"id": "measures.png", "file": "measures.png", "names": ["measures.png"], "upload": true, "accept": ".png", "q": "Attach `measures.png` — the table by products[code] with the six measures and the total row."}, {"id": "notes.md", "file": "notes.md", "text": true, "minLines": 2, "q": "Write `notes.md` here — how you fixed the 48 loans whose customer is missing (which merge, which column, which relationship)."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else the page lists (one more file, or a .zip of several)."}], "why": "A model that reproduces the SQL is the foundation of every page tomorrow: if the star is wrong, no measure on it can be right.", "graded": ["The six totals and the SME / MICRO columns match the table (and the checks above)", "A clean star: no fact-to-fact relationship, no Both, no many-to-many, dim_date marked, sort orders set", "The 48-loan (Blank) fixed in Power Query, not hidden, with a short note on how", "model.png shows every relationship line"]}
```

---

## 5. Self-check

```check
{"id": "w07d3-sc", "questions": [{"type": "single", "q": "A table by product shows the same number in every row. Where do you look first?", "options": ["The measure's format string", "The Model view: is there an active relationship from products to that fact?", "The number of rows in the visual", "The colour theme"], "answer": 1, "explain": "Same value everywhere = no filter reaches the fact (→ P6, 'Cardinality')."}, {"type": "single", "q": "Why must bucket be a Text column?", "options": ["Text sorts faster", "'1-30' is a label that only looks like a range; typed as a number it errors or turns into a date, and slicing breaks", "Numbers cannot be sliced", "Power BI requires text keys"], "answer": 1, "explain": "Wrong types are the most common reason a total is wrong or a relationship fails (→ 'Power Query — the Applied Steps', P11)."}, {"type": "multi", "q": "Which of these should be calculated columns (not measures)?", "options": ["An age band per customer", "The collection rate", "\"Is this loan 90+\"", "PAR30 %"], "answer": [0, 2], "explain": "Values you slice by are columns; ratios are measures (→ 'Calculated column vs measure', P13)."}]}
```

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

```game
{"type": "sort", "id": "w07d3-g4", "title": "Keeps the grain, or breaks it?", "q": "Loans (one row per loan) and payments (one row per payment). Sort each way of bringing them together.", "groups": {"Keeps each fact at its grain": ["Relate loans and payments to the same products table", "Sum payments per loan first, then relate the result as a loan-level column", "Merge payments with loans, expanding only product and branch_name"], "Breaks the grain": ["Merge payments with loans and expand outstanding", "Relate v_loan_status directly to v_payments_clean", "One flat table of every instalment with its loan's outstanding"]}, "why": "A loan-level number copied onto finer rows is summed once per row: 1.5 trillion instead of 209 billion."}
```

> 🎯 **Interview version.** *"Why not just join all tables into one big flat table for Power BI?"* — Because facts with different grains multiply each other's numbers when joined: a loan's balance repeated on every payment summed to 1.5 trillion instead of 209 billion. A star schema keeps each fact at its grain, relates every fact to shared dimensions (one-to-many, single direction), and lets measures aggregate each fact separately; a filter on a dimension reaches all facts consistently.

**Say it like in an interview.** *"Why not just join all the tables into one big flat table for Power BI?"* Answer in three to five sentences, with one number from today.

```task
{"id": "w07d3-ci", "kind": "free", "min": 30, "model": "Because facts with different grains multiply each other's numbers when they are joined: a loan's outstanding repeated on each of its payments summed to 1.5 trillion instead of 209 billion, and loans with no payment yet disappear from an inner join. A star schema keeps each fact at its own grain — one row per loan, one per payment — and relates every fact to shared dimensions such as products, branches and dates, one-to-many and single direction. Each measure aggregates its own table, and a slicer on a dimension reaches all facts consistently. When a question really needs both grains, I aggregate to the coarser grain first, never merge raw rows.", "rubric": ["says that different grains multiply numbers when joined", "gives a number (1.5 trillion vs 209 billion, ×7.3)", "describes the star: facts at their grain, shared dimensions, one-to-many, single direction", "explains how a slicer reaches every fact through the dimensions"]}
```

Tomorrow: DAX — `CALCULATE`, filter context, time intelligence — and the three pages Bekzod will show the board.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w07d3", "pass": 0.8, "questions": [
  {"type": "single", "q": "A table by product shows the same number in every row. What is the most likely cause?", "options": ["The measure uses DIVIDE", "Too many rows", "A missing or inactive relationship — no filter can travel from products to that fact", "A wrong data type"], "answer": 2, "explain": "Same value everywhere = missing relationship; a too-big total = wrong grain; (Blank) = keys that do not match (→ P6)."},
  {"type": "single", "q": "Power BI proposes a many-to-many relationship between products and a fact. What do you do?", "options": ["Set cross-filter to Both", "Accept it — it works", "Find why the 'one' side is not unique (a duplicate key, a trailing space, a type mismatch) and fix the data", "Delete the dimension"], "answer": 2, "explain": "The dimension side must be unique; never accept many-to-many to make the warning go away (→ section 1, 'Cardinality')."},
  {"type": "single", "q": "Why are bidirectional (Both) relationships dangerous?", "options": ["They duplicate rows", "They are slower but correct", "They cannot be used with dates", "A slicer then filters other dimensions and, through them, other facts — plausible-looking wrong numbers and ambiguous paths"], "answer": 3, "explain": "Single direction everywhere; when one measure needs the other direction, ask for it inside that measure (CROSSFILTER) (→ section 1, 'Cross-filter direction')."},
  {"type": "single", "q": "A card shows the Average of this column. What does it show?", "code": "is_par30 = IF ( v_loan_status[dpd] > 30, 1, 0 )      -- calculated column", "options": ["NPL90", "PAR30", "Blank", "The share of loans, by count and closed loans included, that are more than 30 days late — not a share of money"], "answer": 3, "explain": "PAR30 is a ratio of sums of money — a measure with DIVIDE(SUM, SUM); ratios are measures, never averages of row-level flags (→ section 1, 'Calculated column vs measure', P13)."},
  {"type": "number", "q": "v_payments_clean has 52 850 rows and loan_id is unique in v_loan_status. How many rows after this merge?", "code": "Merge Queries: v_payments_clean <- v_loan_status on loan_id, Left Outer\nExpand: product, branch_name only", "answer": 52850, "tol": 0, "explain": "A merge is a lookup only when the right side is unique: rows stay 52 850; more rows would mean duplicate keys (→ section 1, 'Merge and Append', P4)."},
  {"type": "multi", "q": "Which belong to the two-minute model check before any visual?", "options": ["dim_date marked as the date table", "Every relationship 1 : *, single direction, no unintended dashed line", "Cross-filter set to Both so slicers reach everything", "Row counts in Table view against the README", "Load instead of Transform data, to save time"], "answer": [0, 1, 3], "explain": "Load skips the type check, and Both makes numbers silently wrong (→ section 1, 'Putting it together')."},
  {"type": "single", "q": "Which storage mode fits the Nur reports, and why?", "options": ["Live connection to Excel", "Composite — always best", "Import — the data are copied into the .pbix, visuals are fast, all DAX works, and a refresh re-reads the views", "DirectQuery — always live"], "answer": 2, "explain": "DirectQuery is for tables too big to copy or data that must be live (→ section 1, 'Import or DirectQuery')."},
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
