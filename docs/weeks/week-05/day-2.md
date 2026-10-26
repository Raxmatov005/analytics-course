# Week 5 · Day 2 — pandas I: the DataFrame is a table you can talk to

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge company">Company corner</span>

> STORY **Tuesday, 9:10.** Bekzod, finance (*финансовый аналитик*), with last week's Excel open and a new worry. *"The one-pager worked. Then the October extract came and I spent two hours re-pasting, and one pivot pointed at the old range. Jasur says you can give me **the same portfolio numbers as week 4 in a notebook I re-run every month**: drop the new `loans_status.csv` in, press one button, six tiles and the buckets come out. Same numbers as the SQL — 208.7 bn, 3.12 %, 7 429 / 124 / 25 / 16 / 234 — or Timur will not sign it."*

## Today in 3 lines

- **pandas** (*библиотека pandas*) turns a CSV into a **DataFrame** — a table with named columns and typed values — and every SQL clause you know has a one-line pandas spelling: `WHERE` is a boolean mask, `ORDER BY` is `sort_values`, `SELECT` is `[ ]` / `.loc`, `CASE` for buckets is `pd.cut`.
- You learn the first-look toolkit (`head`, `shape`, `info`, `describe`, `dtypes`), filtering (`&`, `|`, `~`, `isin`, `between`, `str.contains`), new columns, `astype`, `to_datetime` and `.dt`, `value_counts`, `isna` / `fillna` / `dropna`, and writing results back (`to_csv`, `to_excel`).
- Bekzod's notebook exists: `portfolio_summary(df)` returns the six tiles, `pd.cut` returns the buckets, and both match week 3 to the soum.

---

## 1. Learn — one table, one variable

### Reading the file

```python
import pandas as pd
import numpy as np
loans = pd.read_csv("../excel/loans_status.csv", parse_dates=["disbursed_at"])
```

`pd.read_csv` reads the header as column names and **guesses a type per column**: whole numbers → `int64`, decimals → `float64`, everything else → `object` (text). Dates are text unless you say `parse_dates=[...]` — the week-4 "dates stored as text" lesson, now a parameter. Other parameters you will need: `sep=";"` for European CSVs, `decimal=","`, `dtype={"phone": str}` to stop a phone number becoming a float, `usecols=[...]` to load five columns of fifty, `nrows=1000` to peek at a huge file. Excel: `pd.read_excel("nur_week4_start.xlsx", sheet_name="Loans")`.

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

`NaN` (*пропуск*) is pandas' NULL: aggregates skip it, comparisons with it are False, `==` never finds it — use `isna()` / `notna()`. `fillna(0)` is a decision, not a cleaning step: for a *count* it is right, for an *income* it is a lie (the mean drops 0.9 m). `dropna()` with no arguments drops a row if *any* column is missing — on a wide table that can be most of the file; always pass `subset=`. `count()` gives non-null counts (5 684) while `len()` gives rows (6 040) — the difference *is* the NULL census.

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
summary.to_csv("portfolio_buckets.csv", index=False)                 # index=False or Excel gets a nameless first column
summary.to_excel("portfolio.xlsx", sheet_name="buckets", index=False)
with pd.ExcelWriter("portfolio.xlsx") as xw:                           # several sheets in one file
    tiles.to_excel(xw, sheet_name="tiles"); summary.to_excel(xw, sheet_name="buckets")
```

The DataFrame goes back to the world Bekzod lives in. `float_format="%.2f"` for decimals, `date_format="%Y-%m-%d"` for ISO dates, and the file is a plain CSV anyone can open — the last link in the re-runnable chain: CSV in, notebook, CSV out.

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

Every line is a SQL clause you have written: `len` is `COUNT(*)`, `(cond).sum()` is `SUM(CASE WHEN … THEN 1 END)`, `df.loc[mask, "col"].sum()` is `SUM(col) WHERE mask`. One number differs from week 4's tile on purpose: **3 030**, not 3 051 — this function uses the half-open `< AS_OF`, so the 21 loans disbursed on the as-of day itself (852 760 000) are out; week 4's `COUNTIFS` used `<=`. Neither is wrong; the function's docstring must say which. The `assert` cell in `day2_starter.ipynb` pins the six values — the regression test that makes "re-run every month" safe: if the November file has a new status spelling or a text date, the assert on `outstanding` fails before Bekzod sees a wrong tile.

---

## 3. Practice (50 min)

Notebook `data/python/day2_starter.ipynb` (the walk-through cells are in it; add a cell per task). Report the number or the first rows under each.

**P1.** Read `loans_status.csv` *without* `parse_dates`. What is the dtype of `disbursed_at`, and what does `loans["disbursed_at"].dt.year` do? Fix it two ways.

<details><summary>Answer</summary>

`object`; `.dt` raises `AttributeError: Can only use .dt accessor with datetimelike values`. Fix: `parse_dates=["disbursed_at"]` in `read_csv`, or `loans["disbursed_at"] = pd.to_datetime(loans["disbursed_at"])` afterwards. `info()` then shows `datetime64[ns]`.

</details>

**P2.** From `describe()` alone: median principal, mean principal, the 75th percentile of `dpd`, max `dpd`. What does the gap between mean and median tell you?

<details><summary>Answer</summary>

5 790 000 · 51 709 668 · 0 · 919. Mean nine times the median = a long right tail: a few SME/Auto loans carry the money (week 3's two-books finding). 75 % of loans have `dpd = 0`, so the 399 late loans are the top 5 %.

</details>

**P3.** How many loans are late (`dpd > 0`) per `status`? Which combination should not exist, and does it?

<details><summary>Answer</summary>

active 151 · closed 14 · default 44 · written_off 190 (`loans[loans["dpd"] > 0]["status"].value_counts()`). "Closed and late" looks impossible — 14 loans: closed because the last instalment's due date has passed, but with a payment short; week 2 found the same 14 (13 in 1–30, 1 in 31–60). Not a bug to fix in pandas — a question for Sevara.

</details>

**P4.** Three filters, three counts: SME or Auto (`isin`), principal between 10 m and 50 m (`between`), branch containing `Tashkent` (`str.contains`). Then the September-2026 loans with the half-open rule — and show that `between("2026-09-01", "2026-09-30")` happens to agree here, and why it would not on `applied_at`.

<details><summary>Answer</summary>

1 172 · 2 087 · 3 020; September 361 both ways. `disbursed_at` is a pure date, so the 30th at 00:00 is included; `applied_at` carries a time, and `between(…, "2026-09-30")` would drop everything after midnight on the 30th (week 1's 23 lost applications). Half-open, always.

</details>

**P5.** The three loans with the largest `outstanding`, with `loan_id`, `product`, `outstanding` only — once with `sort_values().head(3)`, once with `nlargest`. Then the three largest by `principal`.

<details><summary>Answer</summary>

Outstanding: 4597 (586 068 714) · 6478 (577 813 979) · 2936 (574 094 643), all SME. Principal: 2861 (599 060 000) · 4570 (598 450 000) · 4601 (597 540 000) — SME's `max_amount` is 600 m, and the biggest loans sit against it (week 3 S6).

</details>

**P6.** Add `year` and `month` columns from `disbursed_at`; count 2026 loans per month and per quarter.

<details><summary>Answer</summary>

Months: 287 · 265 · 330 · 312 · 377 · 373 · 367 · 358 · 361 (+ 21 on 1 October); quarters Q1 882 · Q2 1 062 · Q3 1 086 · Q4 21. `loans["disbursed_at"].dt.to_period("M").value_counts().sort_index()` — the `strftime('%Y-%m')` + `GROUP BY` of week 3 S7 in one line.

</details>

**P7.** Shares with `value_counts(normalize=True)`: products, grades, channels of *loans* (channel is not in the file — which week-3 fact lets you derive it from `product`?).

<details><summary>Answer</summary>

Products 34.1 / 30.9 / 20.0 / 10.0 / 5.0 %; grades B 43.5 · C 28.9 · A 23.3 · D 4.3. Each channel sells one product family (week 3 S2): app = Micro (34.1 %), partner = BNPL (20.0 %), branch = the rest (45.9 %) — so `loans["product"].map({...})` builds the channel column without a join.

</details>

**P8.** `pd.cut` on `dpd` with the standard edges; prove it equals the file's `bucket` column for all 7 828 rows. Then the mean and median `dpd` of the late loans — which one goes in the report?

<details><summary>Answer</summary>

`(loans["bucket_pd"].astype(str) == loans["bucket"]).all()` → `True` (the `astype(str)` matters: a category compared with text is otherwise a dtype mismatch). Late loans: mean 246 days, median 159 — the 234 write-offs at 500–900 days drag the mean; report the median, or better the buckets.

</details>

**P9.** `customers_dirty.csv`: how many `monthly_income` are missing, the mean with and without `fillna(0)`, the mean after a median fill, and the row count after `dropna()` with and without `subset`.

<details><summary>Answer</summary>

356 missing; mean 15 245 933 → 14 347 331 with zeros (−0.9 m) → 14 812 719 with the median. `dropna()` and `dropna(subset=["monthly_income"])` both give 5 684 here because income is the only column with gaps — on tomorrow's merged tables that luck ends. Never fill an income with 0; fill with a labelled estimate or keep the NaN and show the "unknown" band (week 3 S10: 466 loans).

</details>

**P10.** Build a frame `bucket · loans · outstanding · share_pct` (five rows, shares of total outstanding) and write it to `portfolio_buckets.csv` and to a sheet `buckets` of `portfolio.xlsx`. Open the Excel file and check the total.

<details><summary>Answer</summary>

0 → 7 429 / 197 486 207 578 / 94.62 % · 1–30 124 / 4 729 769 899 / 2.27 · 31–60 25 / 748 610 049 / 0.36 · 61–90 16 / 439 441 377 / 0.21 · 90+ 234 / 5 319 475 527 / 2.55 — week 3 S9's table. `index=False`, or the sheet gets a `0…4` column Bekzod will ask about. Σ outstanding 208 723 504 430.

</details>

<span class="badge stretch">Stretch</span> **P11.** PAR30 by product and by region in one line each (Σ outstanding where `dpd > 30` ÷ Σ outstanding, per group — you may peek at tomorrow's `groupby`). Which region would you flag, and what makes a small region's rate fragile?

<details><summary>Answer</summary>

Product: Auto 4.44 % · Consumer 3.09 · SME 2.55 · BNPL 1.28 · Micro 0.72. Region: Nukus **6.84 %** · Bukhara 4.81 · Andijan 4.02 · Tashkent 3.38 · Samarkand 3.04 · Namangan 1.71 · Fergana 0.69 · Termez 0.68. Nukus has 492 loans and 13.3 bn outstanding — one 500 m SME loan going 31+ moves its PAR30 by 3.8 points; quote the count and the amount next to the rate.

</details>

### Mistakes that cost a point this week

- `and` / `or` between masks, or missing brackets — `ValueError` or a silently wrong mask.
- `loc` with a position or `iloc` with a label after a filter — the wrong row, no error.
- `between` on a datetime with a time component — the last day's afternoon lost.
- `fillna(0)` on a money or income column — a confident wrong mean.
- `dropna()` without `subset` on a wide table — half the rows gone.
- `pd.cut` with the first edge at 0 — every `dpd = 0` loan becomes `NaN`.
- `to_csv` without `index=False` — the ghost first column.
- A notebook whose numbers are typed into the Markdown instead of printed by the code.

---

## 4. Self-check

1. `loans[loans["dpd"] > 0 & loans["status"] == "active"]` raises an error. Fix it and say why. *(→ section 1, "Filtering")*
2. After `late = loans[loans["dpd"] > 0]`, why can `late.loc[0]` fail while `late.iloc[0]` works? *(→ section 1, "loc and iloc")*
3. `pd.cut(loans["dpd"], [0, 30, 60, 90, np.inf])` gives 7 429 NaN. Why, and what is the fix? *(→ section 1, "pd.cut")*

---

## 5. Company corner <span class="badge company">Buckets and PAR in pandas</span>

The portfolio's three risk numbers, from `loans_status.csv`, each a one-liner once the vocabulary is in place:

```python
edges, labels = [-1, 0, 30, 60, 90, np.inf], ["0", "1-30", "31-60", "61-90", "90+"]
loans["bucket"] = pd.cut(loans["dpd"], bins=edges, labels=labels)
buckets = loans["bucket"].value_counts().sort_index()                 # 7429 · 124 · 25 · 16 · 234

total = loans["outstanding"].sum()                                    # 208 723 504 430
par30 = loans.loc[loans["dpd"] > 30, "outstanding"].sum() / total     # 6 507 526 953 / total = 3.12 %
npl90 = loans.loc[loans["dpd"] > 90, "outstanding"].sum() / total     # 5 319 475 527 / total = 2.55 %
```

**DPD buckets** (*корзины просрочки*): the five standard labels, **right-closed** so that day 30 is still early delinquency and day 31 is the first day of the next bucket — the definition the glossary states and `pd.cut`'s default; a company that uses 1–7 / 8–30 changes `edges`, nothing else. **PAR30** (*портфель под риском*) = outstanding of loans with `dpd > 30` ÷ total outstanding: 3.12 % — 275 loans in 31+ hold 6.51 bn of the 208.7 bn. **NPL90** = the same with `dpd > 90`: 2.55 %, 5.32 bn on 234 loans (44 in default, 190 written off). Note what the numerator is: the loan's **whole outstanding**, not the overdue instalments — a 500 m SME loan one day past 30 puts the full 500 m into PAR30. That is why PAR is a *portfolio* measure and why Nilufar's committee watches the bucket *counts* alongside it.

The function `portfolio_summary(df)` (section 2) returns the six tiles — loans 7 828 · active 3 352 · outstanding 208 723 504 430 · disbursed 2026 3 030 · PAR30 3.12 · NPL90 2.55 — and `buckets` the five rows; `to_excel` puts both on Bekzod's sheet. Three checks before it ships, as asserts in the notebook: `len(df) == df["loan_id"].nunique()` (grain: one row per loan), `(df["bucket"].astype(str) == df["bucket_file"]).all()` (our cut equals the extract's bucket), and `abs(par30 - 0.0312) < 0.0001` against the SQL. When the November file breaks one of them, the notebook stops with a red cell instead of a wrong tile — the property Bekzod asked for.

Two definitions that look like PAR30 and are not: **PAR30 by count** (275 / 7 828 = 3.5 % of loans) — a different, smaller number, sometimes quoted when the portfolio number looks bad; and **overdue ÷ outstanding** (7.65 bn of overdue instalments / 208.7 bn = 3.7 %) — the *arrears ratio*. Put "PAR30 = outstanding of loans > 30 DPD ÷ total outstanding" in the tile's footnote and the three stop being confused.

> Interview version: *"Compute PAR30 in pandas from a loan-level table."* — `df.loc[df.dpd > 30, "outstanding"].sum() / df.outstanding.sum()`; buckets with `pd.cut`, right-closed, first edge below zero; say the numerator is whole-loan outstanding; check the grain (one row per loan) and the total against the warehouse before dividing.

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
{"id": "w05d2", "q": "Bekzod asks whether last year's loans are ageing worse than the book. From data/excel/loans_status.csv, take only the loans disbursed in calendar 2025 and compute their PAR30 (outstanding of loans with dpd > 30 ÷ their total outstanding). Give a percentage to 3 decimals.", "type": "number", "dp": 3, "h": ["b3243ebce8f6158f049b7eba"], "hint": "First cut the frame to the 2025 loans with the half-open date rule; then it is the company-corner PAR30 one-liner on that smaller frame — both sums from the same frame.", "sol": "bG9hbnMgPSBwZC5yZWFkX2NzdigiLi4vZXhjZWwvbG9hbnNfc3RhdHVzLmNzdiIsIHBhcnNlX2RhdGVzPVsiZGlzYnVyc2VkX2F0Il0pCnYyNSA9IGxvYW5zWyhsb2Fuc1siZGlzYnVyc2VkX2F0Il0gPj0gIjIwMjUtMDEtMDEiKSAmIChsb2Fuc1siZGlzYnVyc2VkX2F0Il0gPCAiMjAyNi0wMS0wMSIpXQpsZW4odjI1KSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIDMwNDEKdG90YWwgPSB2MjVbIm91dHN0YW5kaW5nIl0uc3VtKCkgICAgICAgICAgICAgIyA2MyA5NjYgNTYyIDMyMgpwYXIzMCA9IHYyNS5sb2NbdjI1WyJkcGQiXSA+IDMwLCAib3V0c3RhbmRpbmciXS5zdW0oKSAvIHRvdGFsCnJvdW5kKDEwMCAqIHBhcjMwLCAzKSAgICAgICAgICAgICAgICAgICAgICAgICMgNC42MzgKCjQuNjM4ICU6IHRoZSAyMDI1IGxvYW5zIGhvbGQgNjQuMCBibiBvZiBvdXRzdGFuZGluZyBhbmQgNC42ICUgb2YgaXQgc2l0cyBpbiBsb2FucyBtb3JlIHRoYW4gMzAgZGF5cyBsYXRlIOKAlCB3ZWxsIGFib3ZlIHRoZSB3aG9sZSBib29rJ3MgMy4xMiAlLgpUaGUgdHJhcCBpcyB0aGUgZGVub21pbmF0b3I6IGRpdmlkaW5nIGJ5IHRoZSB3aG9sZSBib29rJ3MgMjA4LjcgYm4gZ2l2ZXMgMS40MiAlLCBhIHNoYXJlIG9mIHRoZSBwb3J0Zm9saW8sIG5vdCB0aGUgdmludGFnZSdzIG93biBQQVIzMC4KVGhlIDIwMjYgbG9hbnMgcnVuIGF0IDIuMzQgJSwgcGFydGx5IGJlY2F1c2UgdGhleSBhcmUgeW91bmcg4oCUIGEgbG9hbiBjYW5ub3QgYmUgMzEgZGF5cyBsYXRlIGJlZm9yZSBpdHMgZmlyc3QgZHVlIGRhdGUgaGFzIHBhc3NlZCwgc28gY29tcGFyZSB2aW50YWdlcyBhdCB0aGUgc2FtZSBhZ2UgKHRoZSB2aW50YWdlIGN1cnZlLCBEYXkgNCku"}
```

<!-- challenge:end -->
