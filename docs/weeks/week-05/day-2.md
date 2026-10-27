# Week 5 · Day 2 — pandas I: the DataFrame is a table you can talk to

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge company">Company corner</span>

> STORY **Tuesday, 9:10.** Bekzod, the portfolio manager (*портфельный менеджер*), with last week's Excel open and a new worry. *"The one-pager worked. Then the October extract came and I spent two hours re-pasting, and one pivot pointed at the old range. Jasur says you can give me **the same portfolio numbers as week 4 in a notebook I re-run every month**: drop the new `loans_status.csv` in, press one button, six tiles and the buckets come out. Same numbers as the SQL — 208.7 bn, 3.12 %, 7 429 / 124 / 25 / 16 / 234 — or Timur will not sign it."*

## Today in 3 lines

- **pandas** (*библиотека pandas*) turns a CSV into a **DataFrame** — a table with named columns and typed values — and every SQL clause you know has a one-line pandas spelling: `WHERE` is a boolean mask, `ORDER BY` is `sort_values`, `SELECT` is `[ ]` / `.loc`, `CASE` for buckets is `pd.cut`.
- You learn the first-look toolkit (`head`, `shape`, `info`, `describe`, `dtypes`), filtering (`&`, `|`, `~`, `isin`, `between`, `str.contains`), new columns, `astype`, `to_datetime` and `.dt`, `value_counts`, `isna` / `fillna` / `dropna`, and writing results back (`to_csv`, `to_excel`).
- Bekzod's notebook exists: `portfolio_summary(df)` returns the six tiles, `pd.cut` returns the buckets, and both match week 3 to the soum.

---

## 1. Learn — one table, one variable

Run the blocks on this page from top to bottom (▶ Run): each one uses the `loans` frame the first block reads. The same cells are in `data/python/day2_starter.ipynb` if you work in Jupyter.

### Reading the file

```python
import pandas as pd
import numpy as np
loans = pd.read_csv("../excel/loans_status.csv", parse_dates=["disbursed_at"])
```

`pd.read_csv` reads the header as column names and **guesses a type per column**: whole numbers → `int64`, decimals → `float64`, everything else → `object` (text). Dates are text unless you say `parse_dates=[...]` — the week-4 "dates stored as text" lesson, now a parameter. Other parameters you will need: `sep=";"` for European CSVs, `decimal=","`, `dtype={"phone": str}` to stop a phone number becoming a number, `usecols=[...]` to load five columns of fifty, `nrows=1000` to peek at a huge file. Excel: `pd.read_excel("nur_week4_start.xlsx", sheet_name="Loans")`.

> ⚠️ **Watch out.** The type guess has surprises. A whole-number column with a single blank becomes `float64` (NaN is a float), so `monthly_income` comes back as `15245932.7…`-style floats; a phone or an id with a leading zero loses it unless you pass `dtype=str`; a date without `parse_dates` is `object` and `.dt` refuses it. Run `dtypes` before you trust a column.

### First look — the five commands you run on every new table

```python
loans.shape            # (7828, 13)  — rows, columns; grain check: one row per loan?
loans.head()           # first 5 rows (head(10) for ten); .tail() the last 5
loans.dtypes           # a type per column: 5 int64, 1 datetime64, 7 object
loans.info()           # dtypes + non-null counts + memory — the NULL census in one call
loans.describe()       # count / mean / std / min / quartiles / max for the numeric columns
loans.describe(include="object")   # unique / top / freq for text: customer has 747 distinct values, product 5
```

`describe()` already tells a story: `principal` mean 51.7 m, median (`50%`) 5.79 m — a book of small loans and a few very large ones (week 3 S4's two-books finding, in one line); `dpd` has a 75th percentile of 0 and a max of 919. `info()` shows `7828 non-null` in every column here — `loans_status.csv` is the clean extract; tomorrow's files are not.

### Selecting columns, `loc` and `iloc`

```python
loans["product"]                          # one column → a Series (a list with an index)
loans[["loan_id", "product", "dpd"]]       # several columns → a DataFrame (note the double brackets)
loans.loc[2, "product"]                    # by LABEL: the row whose index label is 2, column "product" → 'Micro loan'
loans.iloc[0:3, 0:4]                       # by POSITION: first three rows, first four columns
loans.loc[loans["dpd"] > 90, ["loan_id", "dpd"]]   # loc with a condition and a column list — the SELECT … WHERE
```

`loc` is by name (row label, column name), `iloc` by integer position. The index here is 0…7827 by default, so the two look alike — until you filter or sort: after `late = loans[loans["dpd"] > 0]`, `late.iloc[0]` is the first late loan but `late.loc[0]` is the loan whose *label* is 0 (which may not be in `late` at all → `KeyError`). Rule: `loc` for conditions and names, `iloc` for "the first n rows"; `reset_index(drop=True)` when you want positions and labels to agree again.

### Filtering — the boolean mask

```python
active = loans[loans["status"] == "active"]                              # WHERE status = 'active'          → 3352 rows
late_active = loans[(loans["dpd"] > 0) & (loans["status"] == "active")]  # AND — each condition in brackets  → 151
big = loans[loans["product"].isin(["Small business loan", "Auto loan"])] # IN (...)                          → 1172
mid = loans[loans["principal"].between(10_000_000, 50_000_000)]          # BETWEEN (inclusive both ends)     → 2087
tash = loans[loans["branch"].str.contains("Tashkent")]                   # LIKE '%Tashkent%'                 → 3020
not_closed = loans[~(loans["status"] == "closed")]                       # NOT                               → 3586
either = loans[(loans["dpd"] > 90) | (loans["status"] == "written_off")] # OR                                → 234
```

`loans["dpd"] > 0` is a **Series of True/False**, one per row — yesterday's list comprehension condition, vectorised. Put it in `[ ]` and only the True rows stay. Three spellings that bite: `&` / `|` / `~`, never `and` / `or` / `not` (those work on single values and raise `ValueError: The truth value of a Series is ambiguous`); **brackets around every condition**, because `&` binds tighter than `>`; and `between` is inclusive — for dates use two comparisons with `<` on the right (the half-open rule), `loans[(loans["disbursed_at"] >= "2026-09-01") & (loans["disbursed_at"] < "2026-10-01")]` → 361 September loans. `loans.query("dpd > 90 and product == 'Micro loan'")` is the readable alternative for long conditions (76 rows), with `and`/`or` allowed inside the string.

> 💡 **Key idea.** A filter is two steps: build a column of True/False (the mask), then keep the True rows with `[ ]`. Every `WHERE` you wrote in weeks 1–3 is a mask — `&`, `|`, `~` combine masks, one bracket per condition.

```game
{"type": "bug", "id": "w05d2-g1", "title": "Find the broken line", "q": "Line by line this should count the late loans, then the late loans that are still active. One line raises an error.", "code": "late = loans[loans[\"dpd\"] > 0]\nactive_late = loans[loans[\"dpd\"] > 0 and loans[\"status\"] == \"active\"]\nprint(len(late), len(active_late))", "answer": [1], "why": "and works on single values, not on a whole column: pandas raises ValueError: The truth value of a Series is ambiguous. Write (loans[\"dpd\"] > 0) & (loans[\"status\"] == \"active\") — & with a bracket round each condition."}
```

### Sorting, new columns, types

```python
loans.sort_values("outstanding", ascending=False).head(3)      # ORDER BY … DESC LIMIT 3 → loans 4597, 6478, 2936
loans.sort_values(["product", "dpd"], ascending=[True, False]) # two keys
loans.nlargest(3, "principal")                                 # the shortcut: 2861, 4570, 4601 (599.06 / 598.45 / 597.54 m)
loans["outstanding_bn"] = loans["outstanding"] / 1e9           # a new column, computed for every row at once
loans["is_late"] = loans["dpd"] > 0                            # a boolean column — .sum() counts the Trues: 399
loans["term"] = loans["term"].astype(str)                      # CAST: int → text ('24')
loans["product"] = loans["product"].astype("category")         # text with 5 values → category: 487 KB → 8 KB
```

A new column is `df["name"] = expression`; the expression runs on whole columns — no loop. `astype` is `CAST`: `int`, `float`, `str`, `"category"` (for low-cardinality text, saves memory and gives an order to buckets), `bool`. `pd.to_numeric(col, errors="coerce")` converts text to numbers and turns garbage into `NaN` rather than crashing — tomorrow's `to_datetime(errors="coerce")` for dates.

> ⚠️ **Watch out.** Assign through `.loc`, never through two brackets in a row. `loans[loans["dpd"] > 90]["flag"] = 1` (chained indexing) writes into a temporary **copy** and changes nothing in `loans` — pandas only warns `SettingWithCopyWarning`. Write `loans.loc[loans["dpd"] > 90, "flag"] = 1`. And when you cut a frame to keep working on it, take a copy on purpose: `late = loans[loans["dpd"] > 0].copy()`.

### Dates: `to_datetime` and the `.dt` accessor

```python
loans["disbursed_at"] = pd.to_datetime(loans["disbursed_at"])   # if you forgot parse_dates
loans["disbursed_at"].dt.year                                   # 2024 / 2025 / 2026 → value_counts: 1736 / 3041 / 3051
loans["disbursed_at"].dt.to_period("M")                          # 2026-09 — the strftime('%Y-%m') of week 3
loans["disbursed_at"].dt.quarter, loans["disbursed_at"].dt.day_name()
(pd.Timestamp("2026-10-01") - loans["disbursed_at"]).dt.days     # days on book — active loans average 221
```

Once a column is `datetime64`, `.dt` opens the calendar: `.year`, `.month`, `.day`, `.quarter`, `.dayofweek`, `.to_period("M")`, `.strftime("%Y-%m")`. Date arithmetic gives a `Timedelta`; `.dt.days` makes it a number. Comparing a datetime column to the string `"2026-10-01"` works — pandas parses the string.

### `value_counts` — the GROUP BY … COUNT(*) of one column

```python
loans["status"].value_counts()                   # closed 4242 · active 3352 · written_off 190 · default 44
loans["product"].value_counts(normalize=True)    # shares: Micro 34.1 % · Consumer 30.9 · BNPL 20.0 · SME 10.0 · Auto 5.0
loans["bucket"].value_counts().sort_index()      # sorted by label instead of by count
loans["region"].nunique()                        # 8 — COUNT(DISTINCT)
```

Sorted by count by default; `sort_index()` for the natural order; `normalize=True` for shares; `dropna=False` to see the NaN as a row — the week-2 NULL band lesson. Tomorrow's `groupby` is `value_counts` for several columns and any aggregate.

### Missing values: `isna`, `fillna`, `dropna`

```python
cust = pd.read_csv("../excel/customers_dirty.csv")
cust.isna().sum()                                     # per column: monthly_income 356, the rest 0
cust["monthly_income"].mean()                         # 15 245 933 — NaN is skipped, like SQL's AVG
cust["monthly_income"].fillna(0).mean()               # 14 347 331 — the wrong number, confidently
cust["monthly_income"].fillna(cust["monthly_income"].median())   # a defensible imputation (7 895 896.5) — label it
cust.dropna(subset=["monthly_income"])                # 5 684 rows: drop only when THAT column is missing
```

`NaN` (*пропуск*) is pandas' NULL: aggregates skip it, comparisons with it are False, `==` never finds it — use `isna()` / `notna()`. `dropna()` with no arguments drops a row if *any* column is missing — on a wide table that can be most of the file; always pass `subset=`. `count()` gives non-null counts (5 684) while `len()` gives rows (6 040) — the difference *is* the NULL census.

> 💡 **Key idea.** `fillna(0)` is a decision, not a cleaning step. For a *count* (no payment → 0 paid) it is right; for an *income* it is a lie that invents 356 zero earners and drops the mean by 0.9 m. Keep the NaN and show an "unknown" band, or fill with a labelled estimate.

### `pd.cut` — buckets without a CASE

```python
edges  = [-1, 0, 30, 60, 90, np.inf]
labels = ["0", "1-30", "31-60", "61-90", "90+"]
loans["bucket_pd"] = pd.cut(loans["dpd"], bins=edges, labels=labels)
loans["bucket_pd"].value_counts().sort_index()        # 7429 / 124 / 25 / 16 / 234
```

`pd.cut` assigns each value to an interval; intervals are **right-closed** by default: `(-1, 0]`, `(0, 30]`, `(30, 60]` … so 30 lands in `1-30` and 31 in `31-60`, exactly the week-2 `CASE WHEN dpd <= 30`. The first edge must be *below* the smallest value (`-1`, because `(0, 0]` is empty); `np.inf` closes the top. `right=False` flips to `[0, 5m)` — the income bands of week 3 S10 where `< 5 000 000` is the rule. The result is a `category` with the labels in order, so `sort_index()` gives 0 … 90+ and a bar chart comes out ordered. `pd.qcut(x, 10)` cuts into deciles by count — week 3's `NTILE`.

### Writing back

```python
# (shape only — not meant to run) … summary and tiles are built in Practice P10 and the worked example
summary.to_csv("portfolio_buckets.csv", index=False)                 # index=False or Excel gets a nameless first column
summary.to_excel("portfolio.xlsx", sheet_name="buckets", index=False)
with pd.ExcelWriter("portfolio.xlsx") as xw:                           # several sheets in one file
    tiles.to_excel(xw, sheet_name="tiles"); summary.to_excel(xw, sheet_name="buckets")
```

The DataFrame goes back to the world Bekzod lives in. `float_format="%.2f"` for decimals, `date_format="%Y-%m-%d"` for ISO dates, and the file is a plain CSV anyone can open — the last link in the re-runnable chain: CSV in, notebook, CSV out. (`to_excel` needs the `openpyxl` package, which Anaconda has; on the page, practise with `to_csv`.)

### SQL ↔ Excel ↔ pandas, today's vocabulary

| You want | SQL (weeks 1–3) | Excel (week 4) | pandas |
|---|---|---|---|
| the table | `SELECT * FROM loans` | the sheet / `tblLoans` | `loans = pd.read_csv(...)` |
| some columns | `SELECT loan_id, dpd` | hide columns | `loans[["loan_id", "dpd"]]` |
| a filter | `WHERE dpd > 0 AND status = 'active'` | Filter / `COUNTIFS` | `loans[(loans.dpd > 0) & (loans.status == "active")]` |
| a list filter | `IN ('SME', 'AUTO')` | Filter, tick two | `.isin([...])` |
| text search | `LIKE '%Tashkent%'` | `SEARCH` / Filter → contains | `.str.contains("Tashkent")` |
| sort | `ORDER BY outstanding DESC` | Sort Z→A | `.sort_values("outstanding", ascending=False)` |
| top n | `LIMIT 3` / `TOP 3` | — | `.head(3)` / `.nlargest(3, "col")` |
| a computed column | `principal / 1e9 AS bn` | a formula column | `loans["bn"] = loans.principal / 1e9` |
| convert type | `CAST(x AS TEXT)` | `TEXT` / `VALUE` / `DATEVALUE` | `.astype(str)` / `pd.to_numeric` / `pd.to_datetime` |
| month of a date | `strftime('%Y-%m', d)` | `TEXT(d, "yyyy-mm")` | `.dt.to_period("M")` |
| count per value | `GROUP BY status` + `COUNT(*)` | `COUNTIFS` / pivot | `.value_counts()` |
| distinct count | `COUNT(DISTINCT region)` | `ROWS(UNIQUE(...))` | `.nunique()` |
| NULL test | `IS NULL` | `ISBLANK` / `COUNTBLANK` | `.isna()` |
| replace NULL | `COALESCE(x, 0)` | `IF(ISBLANK(x), 0, x)` | `.fillna(0)` |
| buckets | `CASE WHEN dpd <= 30 …` | nested `IF` / `XLOOKUP` approximate | `pd.cut(dpd, edges, labels=...)` |
| save | `CREATE TABLE AS` / export | Save As CSV | `.to_csv("f.csv", index=False)` |

Same questions, same answers, a third spelling — and the only one of the three that is a *file you can re-run on a new input*.

```game
{"type": "match", "id": "w05d2-g2", "title": "SQL → pandas", "pairs": [["WHERE dpd > 0 AND status = 'active'", "loans[(loans.dpd > 0) & (loans.status == \"active\")]"], ["IN ('SME', 'AUTO')", ".isin([...])"], ["LIKE '%Tashkent%'", ".str.contains(\"Tashkent\")"], ["ORDER BY outstanding DESC", ".sort_values(\"outstanding\", ascending=False)"], ["COUNT(DISTINCT region)", ".nunique()"], ["COALESCE(x, 0)", ".fillna(0)"], ["GROUP BY status + COUNT(*)", ".value_counts()"], ["CASE WHEN dpd <= 30 …", "pd.cut(dpd, edges, labels=...)"]]}
```

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Read a file into a DataFrame — [Complete Python Pandas Data Science Tutorial! (2025 Updated Edition) (Keith Galli), 08:25](https://youtu.be/2uvysYbKdjM?t=505&end=822)
- ▶ Selecting columns, loc / iloc — same video, [15:28](https://youtu.be/2uvysYbKdjM?t=928&end=1160)
- ▶ Sorting — same video, [21:11](https://youtu.be/2uvysYbKdjM?t=1271&end=1381)
- ▶ Filtering (boolean mask, multiple conditions) — same video, [24:12](https://youtu.be/2uvysYbKdjM?t=1452&end=1678)
- ▶ New columns and dates (`pd.to_datetime`, `.dt`) — same video, [41:40](https://youtu.be/2uvysYbKdjM?t=2500&end=2798)
- ▶ Dates in depth — [Python Pandas Tutorial (Part 10): Working with Dates and Time Series Data (Corey Schafer), 03:35](https://youtu.be/UFuo7EHI8zc?t=215)
- ▶ Missing values (isna, fillna, dropna) — Keith Galli same video, [58:33](https://youtu.be/2uvysYbKdjM?t=3513&end=3845)
- ▶ Missing values (alternative, slower) — [Python Pandas Tutorial 5: Handle Missing Data: fillna, dropna, interpolate (codebasics), 04:10](https://youtu.be/EaGbS7eWSs0?t=250&end=455)

- RU deck (TBC Data Analytics 2.0, if you have it) `4.3_Python.pdf`: Series and DataFrame pp. 10–15, dtypes and `astype` / `to_numeric` pp. 14–22, reading and writing pp. 23–30, first look pp. 31–37, `loc` / `iloc` / boolean indexing pp. 38–44, missing values pp. 45–52, `.str` pp. 55–67, categorical pp. 68–72, sorting pp. 104–108. (pp. 82–103 are tomorrow.)
- *Russian terms:* датафрейм = DataFrame, серия = Series, индекс = index, булева маска = boolean mask, фильтрация = filtering, пропущенные значения / NaN = missing values, приведение типов = type casting, категориальный тип = category dtype, биннинг / разбиение на корзины = `pd.cut`.

```videoquiz
{"video": "2uvysYbKdjM", "stops": [
  {"at": 700, "q": "What does pd.read_csv give you back?", "options": ["A list of dicts", "A DataFrame — named columns with a type each", "A text string", "An Excel workbook"], "answer": 1, "explain": "read_csv reads the header as column names and guesses a type per column — run dtypes to see the guesses.", "back": 60},
  {"at": 1080, "q": "loc and iloc differ how?", "options": ["loc is by label (index value, column name), iloc by integer position", "loc is faster", "iloc works only on columns", "There is no difference"], "answer": 0, "explain": "They agree on a fresh 0…n index and part ways after a filter or a sort — loc for names and conditions, iloc for 'the first n'.", "back": 60},
  {"at": 1600, "q": "How do you combine two conditions in a pandas filter?", "options": ["cond1 and cond2", "(cond1) & (cond2)", "cond1 & cond2 without brackets", "cond1, cond2"], "answer": 1, "explain": "& | ~ with a bracket round each condition; and/or raise 'truth value of a Series is ambiguous'.", "back": 60},
  {"at": 3700, "q": "What does fillna(0) on an income column do to the mean?", "options": ["Nothing — mean skips NaN anyway", "Lowers it: every missing income becomes a zero earner", "Raises it", "Raises an error"], "answer": 1, "explain": "mean() skips NaN; fillna(0) turns them into zeros that are counted — 15.2 m becomes 14.3 m on customers_dirty.csv.", "back": 60}]}
```

```videoquiz
{"video": "UFuo7EHI8zc", "stops": [
  {"at": 400, "q": "A date column was read as text. What turns it into real dates?", "options": ["astype(int)", "pd.to_datetime(col) — or parse_dates= in read_csv", "str.split('-')", "sort_values()"], "answer": 1, "explain": "Until the dtype is datetime64, .dt and date arithmetic do not work.", "back": 60},
  {"at": 650, "q": "Once the column is datetime64, how do you get the weekday name?", "options": ["col.weekday", "col.dt.day_name()", "col.str.day()", "pd.weekday(col)"], "answer": 1, "explain": "The .dt accessor opens the calendar: .dt.year, .dt.month, .dt.to_period(\"M\"), .dt.day_name().", "back": 60}]}
```

```videoquiz
{"video": "EaGbS7eWSs0", "stops": [
  {"at": 330, "q": "Which call replaces the missing values in a column?", "options": ["dropna()", "fillna(value)", "isna()", "notna()"], "answer": 1, "explain": "fillna writes a value into the gaps — a decision you have to defend, not a cleaning step.", "back": 45},
  {"at": 420, "q": "df.dropna() with no arguments drops…", "options": ["only rows where every column is missing", "every row where any column is missing", "the missing columns", "nothing"], "answer": 1, "explain": "Any gap in any column drops the row — on a wide table that can be most of it; pass subset= to name the column that matters.", "back": 45}]}
```

---

## 2. Worked example — the six tiles in one function (15 min)

Bekzod's tiles from week 4 Day 1, as a function of the DataFrame, so that next month is `portfolio_summary(pd.read_csv("loans_status_2026-11.csv"))`:

```python
AS_OF = pd.Timestamp("2026-10-01")

def portfolio_summary(df):
    out = df["outstanding"].sum()
    in_2026 = (df["disbursed_at"] >= "2026-01-01") & (df["disbursed_at"] < AS_OF)
    return {
        "loans": len(df),
        "active": (df["status"] == "active").sum(),
        "outstanding": out,
        "disbursed_2026": in_2026.sum(),
        "par30_pct": round(100 * df.loc[df["dpd"] > 30, "outstanding"].sum() / out, 2),
        "npl90_pct": round(100 * df.loc[df["dpd"] > 90, "outstanding"].sum() / out, 2),
    }

portfolio_summary(loans)
# {'loans': 7828, 'active': 3352, 'outstanding': 208723504430, 'disbursed_2026': 3030, 'par30_pct': 3.12, 'npl90_pct': 2.55}
```

Every line is a SQL clause you have written: `len` is `COUNT(*)`, `(cond).sum()` is `SUM(CASE WHEN … THEN 1 END)`, `df.loc[mask, "col"].sum()` is `SUM(col) WHERE mask`. One number differs from week 4's tile on purpose: **3 030**, not 3 051 — this function uses the half-open `< AS_OF`, so the 21 loans disbursed on the as-of day itself (852 760 000) are out; week 4's `COUNTIFS` used `<=`. Neither is wrong; the function's docstring must say which.

> 💡 **Key idea.** A monthly notebook is safe only with an **assert** pinning the known values: `assert portfolio_summary(loans)["outstanding"] == 208_723_504_430`. If the November file has a new status spelling or a text date, the assert fails before Bekzod sees a wrong tile — `day2_starter.ipynb` pins all six.

---

## 3. Practice (50 min)

Each task's editor already loads `loans_status.csv` with `parse_dates` (P9 loads `customers_dirty.csv`). Write your code under `# your code`, **▶ Run**, then **✔ Check** — print the number the task asks for. In Jupyter, `data/python/day2_starter.ipynb` has the walk-through cells; add a cell per task.

**P1.** Read `loans_status.csv` *without* `parse_dates`. What is the dtype of `disbursed_at`, and what does `loans["disbursed_at"].dt.year` do? Fix it two ways.

```task
{"id": "w05d2-p1", "kind": "choice", "options": ["datetime64[ns] — pandas recognises ISO dates by itself", "object (text) — and .dt raises AttributeError until you convert it", "int64 — the dates are stored as numbers", "category — dates repeat, so pandas compresses them"], "answer": 1, "explain": "Without parse_dates the column is text: .dt raises AttributeError: Can only use .dt accessor with datetimelike values. Fix: parse_dates=[\"disbursed_at\"] in read_csv, or loans[\"disbursed_at\"] = pd.to_datetime(loans[\"disbursed_at\"]) afterwards; info() then shows datetime64[ns]."}
```

**P2.** From `describe()` alone: median principal, mean principal, the 75th percentile of `dpd`, max `dpd`. What does the gap between mean and median tell you? Type the median principal.

```task
{"id": "w05d2-p2", "kind": "number", "answer": 5790000, "dp": 0, "unit": "soum", "hint": "The median is the 50% row of loans[\"principal\"].describe().", "model": "Median 5 790 000 · mean 51 709 668 · 75th percentile of dpd 0 · max dpd 919. A mean nine times the median is a long right tail: a few SME/Auto loans carry the money (week 3's two-books finding). 75 % of loans have dpd = 0, so the 399 late loans are the top 5 %."}
```

**P3.** How many loans are late (`dpd > 0`) per `status`? Which combination should not exist, and does it?

```task
{"id": "w05d2-p3", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code\n", "answer": 14, "dp": 0, "hint": "Filter the late loans, then value_counts the status. The check looks for the combination that looks impossible.", "model": "print(loans[loans[\"dpd\"] > 0][\"status\"].value_counts())\n# written_off 190 · active 151 · default 44 · closed 14\n\n\"Closed and late\" looks impossible — 14 loans: closed because the last instalment's due date has passed, but with a payment short; week 2 found the same 14 (13 in 1–30, 1 in 31–60). Not a bug to fix in pandas — a question for Sevara."}
```

**P4.** Three filters, three counts: SME or Auto (`isin`), principal between 10 m and 50 m (`between`), branch containing `Tashkent` (`str.contains`). Then the September-2026 loans with the half-open rule — and show that `between("2026-09-01", "2026-09-30")` happens to agree here, and why it would not on `applied_at`.

```task
{"id": "w05d2-p4", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code — print the September count last\n", "answer": 361, "dp": 0, "hint": "The check looks for the September 2026 count: >= \"2026-09-01\" and < \"2026-10-01\", each in brackets, joined with &.", "model": "print(loans[\"product\"].isin([\"Small business loan\", \"Auto loan\"]).sum())     # 1172\nprint(loans[\"principal\"].between(10_000_000, 50_000_000).sum())                # 2087\nprint(loans[\"branch\"].str.contains(\"Tashkent\").sum())                          # 3020\nd = loans[\"disbursed_at\"]\nprint(((d >= \"2026-09-01\") & (d < \"2026-10-01\")).sum())                         # 361\nprint(d.between(\"2026-09-01\", \"2026-09-30\").sum())                             # 361\n\ndisbursed_at is a pure date, so the 30th at 00:00 is included; applied_at carries a time, and between(…, \"2026-09-30\") would drop everything after midnight on the 30th (week 1's 23 lost applications). Half-open, always."}
```

**P5.** The three loans with the largest `outstanding`, with `loan_id`, `product`, `outstanding` only — once with `sort_values().head(3)`, once with `nlargest`. Then the three largest by `principal`.

```task
{"id": "w05d2-p5", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code\n", "answer": 4597, "dp": 0, "hint": "The check looks for the loan_id with the largest outstanding.", "model": "cols = [\"loan_id\", \"product\", \"outstanding\"]\nprint(loans.sort_values(\"outstanding\", ascending=False)[cols].head(3))\nprint(loans.nlargest(3, \"outstanding\")[cols])\nprint(loans.nlargest(3, \"principal\")[[\"loan_id\", \"product\", \"principal\"]])\n\nOutstanding: 4597 (586 068 714) · 6478 (577 813 979) · 2936 (574 094 643), all SME. Principal: 2861 (599 060 000) · 4570 (598 450 000) · 4601 (597 540 000) — SME's max_amount is 600 m, and the biggest loans sit against it (week 3 S6)."}
```

**P6.** Add `year` and `month` columns from `disbursed_at`; count 2026 loans per month and per quarter.

```task
{"id": "w05d2-p6", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code\n", "answer": 1086, "dp": 0, "hint": "The check looks for the Q3 2026 count. .dt.year, .dt.month, .dt.quarter, then value_counts().sort_index().", "model": "loans[\"year\"] = loans[\"disbursed_at\"].dt.year\nloans[\"month\"] = loans[\"disbursed_at\"].dt.month\ny26 = loans[loans[\"year\"] == 2026]\nprint(y26[\"month\"].value_counts().sort_index())\nprint(y26[\"disbursed_at\"].dt.quarter.value_counts().sort_index())\n\nMonths: 287 · 265 · 330 · 312 · 377 · 373 · 367 · 358 · 361 (+ 21 on 1 October); quarters Q1 882 · Q2 1 062 · Q3 1 086 · Q4 21. loans[\"disbursed_at\"].dt.to_period(\"M\").value_counts().sort_index() is the strftime('%Y-%m') + GROUP BY of week 3 S7 in one line."}
```

**P7.** Shares with `value_counts(normalize=True)`: products, grades, channels of *loans* (channel is not in the file — which week-3 fact lets you derive it from `product`?).

```task
{"id": "w05d2-p7", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code\n", "answer": 45.9, "dp": 1, "hint": "The check looks for the branch channel's share in %, one decimal. Map each product to its channel with a dict.", "model": "print(loans[\"product\"].value_counts(normalize=True).mul(100).round(1))\nprint(loans[\"grade\"].value_counts(normalize=True).mul(100).round(1))\nchannel = loans[\"product\"].map({\"Micro loan\": \"app\", \"Buy now pay later\": \"partner\",\n                                 \"Consumer loan\": \"branch\", \"Small business loan\": \"branch\", \"Auto loan\": \"branch\"})\nprint(channel.value_counts(normalize=True).mul(100).round(1))\n\nProducts 34.1 / 30.9 / 20.0 / 10.0 / 5.0 %; grades B 43.5 · C 28.9 · A 23.3 · D 4.3. Each channel sells one product family (week 3 S2): app = Micro (34.1 %), partner = BNPL (20.0 %), branch = the rest (45.9 %) — so map builds the channel column without a join."}
```

**P8.** `pd.cut` on `dpd` with the standard edges; prove it equals the file's `bucket` column for all 7 828 rows. Then the mean and median `dpd` of the late loans — which one goes in the report?

```task
{"id": "w05d2-p8", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code\n", "answer": 159, "dp": 0, "hint": "The check looks for the median dpd of the late loans.", "model": "edges, labels = [-1, 0, 30, 60, 90, np.inf], [\"0\", \"1-30\", \"31-60\", \"61-90\", \"90+\"]\nloans[\"bucket_pd\"] = pd.cut(loans[\"dpd\"], bins=edges, labels=labels)\nprint((loans[\"bucket_pd\"].astype(str) == loans[\"bucket\"]).all())   # True\nlate = loans.loc[loans[\"dpd\"] > 0, \"dpd\"]\nprint(round(late.mean()), late.median())                              # 246 159.0\n\nThe astype(str) matters: a category compared with text is otherwise a dtype mismatch. The 234 write-offs at 500–900 days drag the mean; report the median, or better the buckets."}
```

**P9.** `customers_dirty.csv`: how many `monthly_income` are missing, the mean with and without `fillna(0)`, the mean after a median fill, and the row count after `dropna()` with and without `subset`.

```task
{"id": "w05d2-p9", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\ncust = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# your code\n", "answer": 14347331, "dp": 0, "hint": "The check looks for the mean after fillna(0), rounded to the soum.", "model": "inc = cust[\"monthly_income\"]\nprint(inc.isna().sum())                         # 356\nprint(round(inc.mean()))                        # 15245933\nprint(round(inc.fillna(0).mean()))              # 14347331\nprint(round(inc.fillna(inc.median()).mean()))   # 14812719\nprint(len(cust.dropna()), len(cust.dropna(subset=[\"monthly_income\"])))   # 5684 5684\n\nThe zeros pull the mean down 0.9 m. dropna() and dropna(subset=...) agree here only because income is the only column with gaps — on tomorrow's merged tables that luck ends. Never fill an income with 0; fill with a labelled estimate or keep the NaN and show the \"unknown\" band (week 3 S10: 466 loans)."}
```

**P10.** Build a frame `bucket · loans · outstanding · share_pct` (five rows, shares of total outstanding) and write it to `portfolio_buckets.csv` (in Jupyter, also to a sheet `buckets` of `portfolio.xlsx`, then open it and check the total).

```task
{"id": "w05d2-p10", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code\n", "answer": 2.55, "dp": 2, "hint": "The check looks for the 90+ share of outstanding, in % with two decimals.", "model": "summary = (loans.groupby(\"bucket\").agg(loans=(\"loan_id\", \"size\"), outstanding=(\"outstanding\", \"sum\"))\n                .reindex([\"0\", \"1-30\", \"31-60\", \"61-90\", \"90+\"]).reset_index())\nsummary[\"share_pct\"] = (100 * summary[\"outstanding\"] / summary[\"outstanding\"].sum()).round(2)\nsummary.to_csv(\"portfolio_buckets.csv\", index=False)\nprint(summary)\n\n0 → 7 429 / 197 486 207 578 / 94.62 % · 1–30 124 / 4 729 769 899 / 2.27 · 31–60 25 / 748 610 049 / 0.36 · 61–90 16 / 439 441 377 / 0.21 · 90+ 234 / 5 319 475 527 / 2.55 — week 3 S9's table. value_counts gives the loans column; the sums are tomorrow's groupby (used here once). index=False, or the sheet gets a 0…4 column Bekzod will ask about. Σ outstanding 208 723 504 430."}
```

> 🚀 **Stretch (optional, +5 XP).** **P11.** PAR30 by product and by region in one line each (Σ outstanding where `dpd > 30` ÷ Σ outstanding, per group — you may peek at tomorrow's `groupby`). Which region would you flag, and what makes a small region's rate fragile?

```task
{"id": "w05d2-p11", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code\n", "answer": 6.84, "dp": 2, "xp": 2, "hint": "The check looks for the highest regional PAR30, in % with two decimals. Make a column that is outstanding where dpd > 30 and 0 elsewhere, then sum both per group.", "model": "loans[\"out30\"] = loans[\"outstanding\"].where(loans[\"dpd\"] > 30, 0)\nfor key in [\"product\", \"region\"]:\n    g = loans.groupby(key)[[\"out30\", \"outstanding\"]].sum()\n    print((100 * g[\"out30\"] / g[\"outstanding\"]).round(2).sort_values(ascending=False))\n\nProduct: Auto 4.44 % · Consumer 3.09 · SME 2.55 · BNPL 1.28 · Micro 0.72. Region: Nukus 6.84 % · Bukhara 4.81 · Andijan 4.02 · Tashkent 3.38 · Samarkand 3.04 · Namangan 1.71 · Fergana 0.69 · Termez 0.68. Nukus has 492 loans and 13.3 bn outstanding — one 500 m SME loan going 31+ moves its PAR30 by 3.8 points; quote the count and the amount next to the rate."}
```

### Mistakes that cost a point this week

- `and` / `or` between masks, or missing brackets — `ValueError` or a silently wrong mask.
- `loc` with a position or `iloc` with a label after a filter — the wrong row, no error.
- Chained indexing (`df[mask]["col"] = …`) — the assignment lands on a copy.
- `between` on a datetime with a time component — the last day's afternoon lost.
- `fillna(0)` on a money or income column — a confident wrong mean.
- `dropna()` without `subset` on a wide table — half the rows gone.
- `pd.cut` with the first edge at 0 — every `dpd = 0` loan becomes `NaN`.
- `to_csv` without `index=False` — the ghost first column.
- A notebook whose numbers are typed into the Markdown instead of printed by the code.

---

## 4. Self-check

```check
{"id": "w05d2-sc", "questions": [
  {"type": "single", "q": "loans[loans[\"dpd\"] > 0 & loans[\"status\"] == \"active\"] raises an error. What is the fix?", "options": ["Replace & with and", "Put each condition in brackets: (loans[\"dpd\"] > 0) & (loans[\"status\"] == \"active\")", "Convert dpd to int", "Use iloc"], "answer": 1, "explain": "& binds tighter than > and ==, so 0 & loans[\"status\"] is evaluated first; one bracket per condition (→ section 1, 'Filtering')."},
  {"type": "single", "q": "After late = loans[loans[\"dpd\"] > 0], why can late.loc[0] fail while late.iloc[0] works?", "options": ["loc only works on columns", "loc looks for the index LABEL 0, which belonged to a loan that is not late; iloc takes POSITION 0", "iloc is faster", "The filter reset the index"], "answer": 1, "explain": "A filter keeps the original labels; reset_index(drop=True) makes positions and labels agree again (→ section 1, 'loc and iloc')."},
  {"type": "single", "q": "pd.cut(loans[\"dpd\"], [0, 30, 60, 90, np.inf]) gives 7 429 NaN. Why?", "options": ["np.inf is not allowed", "Intervals are right-closed: the first is (0, 30], which does not contain 0 — start the edges at -1", "dpd is text", "pd.cut needs labels="], "answer": 1, "explain": "The first edge must be below the smallest value (→ section 1, 'pd.cut')."},
  {"type": "single", "q": "loans[loans[\"dpd\"] > 90][\"flag\"] = 1 runs with only a warning, but loans has no flag column afterwards. Why?", "options": ["flag is a reserved word", "Chained indexing: the first [ ] returns a copy, the assignment lands on the copy — write loans.loc[loans[\"dpd\"] > 90, \"flag\"] = 1", "The mask is empty", "pandas needs inplace=True"], "answer": 1, "explain": "Assign through .loc with the mask and the column in one call (→ section 1, 'Sorting, new columns, types')."}
]}
```

---

## 5. Company corner <span class="badge company">Buckets and PAR in pandas</span>

The portfolio's three risk numbers, from `loans_status.csv`, each a one-liner once the vocabulary is in place:

```python
edges, labels = [-1, 0, 30, 60, 90, np.inf], ["0", "1-30", "31-60", "61-90", "90+"]
loans["bucket_pd"] = pd.cut(loans["dpd"], bins=edges, labels=labels)
buckets = loans["bucket_pd"].value_counts().sort_index()              # 7429 · 124 · 25 · 16 · 234

total = loans["outstanding"].sum()                                    # 208 723 504 430
par30 = loans.loc[loans["dpd"] > 30, "outstanding"].sum() / total     # 6 507 526 953 / total = 3.12 %
npl90 = loans.loc[loans["dpd"] > 90, "outstanding"].sum() / total     # 5 319 475 527 / total = 2.55 %
```

```game
{"type": "build", "id": "w05d2-g3", "title": "Build PAR30", "q": "Assemble PAR30: outstanding of loans more than 30 days late ÷ total outstanding.", "tokens": ["loans.loc[", "loans[\"dpd\"] > 30", ",", "\"outstanding\"", "].sum()", "/", "loans[\"outstanding\"].sum()"], "distractors": ["loans[\"dpd\"] > 0", "len(loans)"]}
```

**DPD buckets** (*корзины просрочки*): the five standard labels, **right-closed** so that day 30 is still early delinquency and day 31 is the first day of the next bucket — the definition the glossary states and `pd.cut`'s default; a company that uses 1–7 / 8–30 changes `edges`, nothing else. **PAR30** (*портфель под риском*) = outstanding of loans with `dpd > 30` ÷ total outstanding: 3.12 % — 275 loans in 31+ hold 6.51 bn of the 208.7 bn. **NPL90** = the same with `dpd > 90`: 2.55 %, 5.32 bn on 234 loans (44 in default, 190 written off).

> 💡 **Key idea.** The numerator of PAR30 is the loan's **whole outstanding**, not the overdue instalments — a 500 m SME loan one day past 30 puts the full 500 m into PAR30. That is why PAR is a *portfolio* measure and why Nilufar's committee watches the bucket *counts* alongside it.

The function `portfolio_summary(df)` (section 2) returns the six tiles — loans 7 828 · active 3 352 · outstanding 208 723 504 430 · disbursed 2026 3 030 · PAR30 3.12 · NPL90 2.55 — and `buckets` the five rows; `to_excel` puts both on Bekzod's sheet. Three checks before it ships, as asserts in the notebook: `len(df) == df["loan_id"].nunique()` (grain: one row per loan), `(df["bucket_pd"].astype(str) == df["bucket"]).all()` (our cut equals the extract's bucket), and `abs(par30 - 0.0312) < 0.0001` against the SQL. When the November file breaks one of them, the notebook stops with a red cell instead of a wrong tile — the property Bekzod asked for.

Two definitions that look like PAR30 and are not: **PAR30 by count** (275 / 7 828 = 3.5 % of loans) — a different, smaller number, sometimes quoted when the portfolio number looks bad; and **overdue ÷ outstanding** (7.65 bn of overdue instalments / 208.7 bn = 3.7 %) — the *arrears ratio*. Put "PAR30 = outstanding of loans > 30 DPD ÷ total outstanding" in the tile's footnote and the three stop being confused.

> 🎯 **Interview version.** *"Compute PAR30 in pandas from a loan-level table."* — `df.loc[df.dpd > 30, "outstanding"].sum() / df.outstanding.sum()`; buckets with `pd.cut`, right-closed, first edge below zero; say the numerator is whole-loan outstanding; check the grain (one row per loan) and the total against the warehouse before dividing.

**Say it like in an interview.** Answer the question above in your own words, as you would say it aloud, with Nur Finance's numbers.

```task
{"id": "w05d2-int", "kind": "free", "min": 30, "model": "First I check the grain: one row per loan, so len(df) equals the number of distinct loan_ids, and the total outstanding matches the warehouse — 208.7 bn at Nur Finance. PAR30 is the outstanding of loans more than 30 days past due divided by total outstanding: df.loc[df.dpd > 30, \"outstanding\"].sum() / df.outstanding.sum(), which is 3.12 % here. The numerator is the whole loan's outstanding, not the overdue instalments — that would be the arrears ratio, 3.7 % — and the count share (3.5 % of loans) is a third, different number. For the buckets I use pd.cut with right-closed edges starting at -1, so 30 days is still 1–30 and dpd = 0 is not lost.", "rubric": ["Gives the formula: outstanding where dpd > 30 ÷ total outstanding", "Says the numerator is whole-loan outstanding (not overdue amount, not a count)", "Checks the grain / reconciles the total before dividing", "Mentions pd.cut buckets with the right edges or quotes 3.12 %"]}
```

Tomorrow: `groupby`, `merge`, and Nilufar's two dirty files cleaned in pandas — the 40 duplicate people and the 25 duplicate payments, for the last time.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w05d2", "pass": 0.8, "questions": [
  {"type": "single", "q": "The loan with index label 0 has dpd = 0. What does the second line do?", "code": "late = loans[loans[\"dpd\"] > 0]\nlate.loc[0]", "options": ["Returns an empty Series", "Returns the first late loan", "Returns loan 0 anyway", "Raises KeyError — label 0 is not in late"], "answer": 3, "explain": "loc selects by label, iloc by position; after a filter they differ — late.iloc[0] is 'the first late loan' (→ section 1, 'loc and iloc')."},
  {"type": "single", "q": "This line raises an error. What is the fix?", "code": "loans[loans[\"dpd\"] > 0 & loans[\"status\"] == \"active\"]", "options": ["Write and instead of &", "Put brackets around each condition: (loans[\"dpd\"] > 0) & (loans[\"status\"] == \"active\")", "Convert dpd to int first", "Use loans.iloc instead"], "answer": 1, "explain": "& binds tighter than > and ==, so every condition needs its own brackets; and / or do not work on a whole Series (→ section 1, 'Filtering')."},
  {"type": "single", "q": "What happens to the 7 429 loans with dpd = 0?", "code": "pd.cut(loans[\"dpd\"], bins=[0, 30, 60, 90, np.inf])", "options": ["pd.cut raises an error", "They become NaN — intervals are right-closed, and (0, 30] does not contain 0", "They land in (0, 30]", "pd.cut creates a '0' bucket for them"], "answer": 1, "explain": "The first edge must be below the smallest value (-1 for DPD); np.inf closes the top (→ section 1, 'pd.cut')."},
  {"type": "number", "q": "On loans_status.csv, what does this give, in % with two decimals?", "code": "100 * loans.loc[loans[\"dpd\"] > 30, \"outstanding\"].sum() / loans[\"outstanding\"].sum()", "answer": 3.12, "tol": 0.01, "explain": "Outstanding of loans with dpd > 30 ÷ total outstanding = 6.51 bn of 208.7 bn = PAR30 (→ Company corner)."},
  {"type": "multi", "q": "Which statements about missing values in pandas are true?", "options": ["fillna(0) on monthly_income gives a lower, wrong mean", "mean() skips NaN, like SQL's AVG", "dropna() without subset= drops a row if any column is missing", "col == np.nan finds the missing rows", "count() counts every row, NaN included"], "answer": [0, 1, 2], "explain": "NaN is pandas' NULL: aggregates skip it, == never finds it (use isna()), and fillna(0) on an income is a decision that invents zero earners (→ section 1, 'Missing values')."},
  {"type": "single", "q": "You count September applications on applied_at, which holds a date and a time. Which filter is right?", "options": ["applied_at <= \"2026-09-30\"", "applied_at.between(\"2026-09-01\", \"2026-09-30\")", "(applied_at >= \"2026-09-01\") & (applied_at < \"2026-10-01\")", "applied_at.dt.month == 9"], "answer": 2, "explain": "between is inclusive and \"2026-09-30\" means midnight, so the 30th's afternoon is lost; dt.month == 9 also catches September 2025. Half-open, always (→ section 1, 'Filtering', P4)."},
  {"type": "single", "q": "portfolio_summary counts 3 030 loans disbursed in 2026; week 4's tile said 3 051. Why?", "options": ["parse_dates shifts every date by a day", "The function uses < AS_OF, so the 21 loans disbursed on 1 October itself are out", "pandas drops rows with NaN dates", "Week 4 counted duplicate loans"], "answer": 1, "explain": "Half-open < AS_OF excludes the as-of day; neither convention is wrong, but the docstring must say which (→ section 2)."},
  {"type": "single", "q": "Company corner: what is the numerator of PAR30?", "options": ["The whole outstanding of loans with dpd > 30", "The number of loans with dpd > 30", "The outstanding of loans in the 31-60 bucket only", "The overdue instalments of loans more than 30 days late"], "answer": 0, "explain": "A 500 m loan one day past 30 puts the full 500 m into PAR30; overdue ÷ outstanding is the arrears ratio and the count share is another number (→ Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w05d2", "q": "Bekzod asks whether last year's loans are ageing worse than the book. From data/excel/loans_status.csv, take only the loans disbursed in calendar 2025 and compute their PAR30 (outstanding of loans with dpd > 30 ÷ their total outstanding). Give a percentage to 3 decimals.", "type": "number", "dp": 3, "python": true, "h": ["b3243ebce8f6158f049b7eba"], "hint": "First cut the frame to the 2025 loans with the half-open date rule; then it is the company-corner PAR30 one-liner on that smaller frame — both sums from the same frame.", "sol": "bG9hbnMgPSBwZC5yZWFkX2NzdigiLi4vZXhjZWwvbG9hbnNfc3RhdHVzLmNzdiIsIHBhcnNlX2RhdGVzPVsiZGlzYnVyc2VkX2F0Il0pCnYyNSA9IGxvYW5zWyhsb2Fuc1siZGlzYnVyc2VkX2F0Il0gPj0gIjIwMjUtMDEtMDEiKSAmIChsb2Fuc1siZGlzYnVyc2VkX2F0Il0gPCAiMjAyNi0wMS0wMSIpXQpsZW4odjI1KSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIDMwNDEKdG90YWwgPSB2MjVbIm91dHN0YW5kaW5nIl0uc3VtKCkgICAgICAgICAgICAgIyA2MyA5NjYgNTYyIDMyMgpwYXIzMCA9IHYyNS5sb2NbdjI1WyJkcGQiXSA+IDMwLCAib3V0c3RhbmRpbmciXS5zdW0oKSAvIHRvdGFsCnJvdW5kKDEwMCAqIHBhcjMwLCAzKSAgICAgICAgICAgICAgICAgICAgICAgICMgNC42MzgKCjQuNjM4ICU6IHRoZSAyMDI1IGxvYW5zIGhvbGQgNjQuMCBibiBvZiBvdXRzdGFuZGluZyBhbmQgNC42ICUgb2YgaXQgc2l0cyBpbiBsb2FucyBtb3JlIHRoYW4gMzAgZGF5cyBsYXRlIOKAlCB3ZWxsIGFib3ZlIHRoZSB3aG9sZSBib29rJ3MgMy4xMiAlLgpUaGUgdHJhcCBpcyB0aGUgZGVub21pbmF0b3I6IGRpdmlkaW5nIGJ5IHRoZSB3aG9sZSBib29rJ3MgMjA4LjcgYm4gZ2l2ZXMgMS40MiAlLCBhIHNoYXJlIG9mIHRoZSBwb3J0Zm9saW8sIG5vdCB0aGUgdmludGFnZSdzIG93biBQQVIzMC4KVGhlIDIwMjYgbG9hbnMgcnVuIGF0IDIuMzQgJSwgcGFydGx5IGJlY2F1c2UgdGhleSBhcmUgeW91bmcg4oCUIGEgbG9hbiBjYW5ub3QgYmUgMzEgZGF5cyBsYXRlIGJlZm9yZSBpdHMgZmlyc3QgZHVlIGRhdGUgaGFzIHBhc3NlZCwgc28gY29tcGFyZSB2aW50YWdlcyBhdCB0aGUgc2FtZSBhZ2UgKHRoZSB2aW50YWdlIGN1cnZlLCBEYXkgNCku"}
```

<!-- challenge:end -->
