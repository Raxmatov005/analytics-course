# Week 5 · Day 2 — pandas I: the DataFrame is a table you can talk to

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge company">Company corner</span>

> STORY **Tuesday, 9:10.** Bekzod, the portfolio manager (*портфельный менеджер*), with last week's Excel open and a new worry. *"The one-pager worked. Then the October extract came and I spent two hours re-pasting, and one pivot pointed at the old range. Jasur says you can give me **the same portfolio numbers as week 4 in a notebook I re-run every month**: drop the new `loans_status.csv` in, press one button, six tiles and the buckets come out. Same numbers as the SQL — 208.7 bn, 3.12 %, 7 429 / 124 / 25 / 16 / 234 — or Timur will not sign it."*

## Today in 3 lines

- **pandas** (*библиотека pandas*) turns a CSV into a **DataFrame** — a table with named columns and typed values — and every SQL clause you know has a one-line pandas spelling: `WHERE` is a boolean mask, `ORDER BY` is `sort_values`, `SELECT` is `[ ]` / `.loc`, `CASE` for buckets is `pd.cut`.
- You learn the first-look toolkit (`head`, `shape`, `info`, `describe`, `dtypes`), filtering (`&`, `|`, `~`, `isin`, `between`, `str.contains`), new columns, `astype`, `to_datetime` and `.dt`, `value_counts`, `isna` / `fillna` / `dropna`, and writing results back (`to_csv`, `to_excel`).
- Bekzod's notebook exists: `portfolio_summary(df)` returns the six tiles, `pd.cut` returns the buckets, and both match week 3 to the soum.

---

## 1. Learn — one table, one variable

Every concept below has the same five parts: what it is, how to write it (a box you can run), when you use it, the trap, and a small task. Run the boxes from top to bottom: the first box reads the `loans` table, and every later box uses it. The same cells are in `data/python/day2_starter.ipynb` if you work in Jupyter.

### Series and DataFrame — the two objects of pandas

**What it is.** **pandas** (*библиотека pandas*) keeps a table in a **DataFrame** (*датафрейм*): named columns, one type per column, and an **index** (*индекс*) — a label for every row. One column on its own is a **Series** (*серия*): a list of values with the same index.

**How to write it.** The first box loads the libraries and the loan table; then a three-row DataFrame built by hand, from a dict of columns:

```python
import pandas as pd
import numpy as np
# the table every box below uses
loans = pd.read_csv("../excel/loans_status.csv", parse_dates=["disbursed_at"])

small = pd.DataFrame({"loan_id": [1, 2, 3],
                      "product": ["Consumer loan", "Consumer loan", "Micro loan"],
                      "principal": [31_150_000, 40_060_000, 1_590_000]})
small
```

| (index) | loan_id | product | principal |
|---|---|---|---|
| 0 | 1 | Consumer loan | 31150000 |
| 1 | 2 | Consumer loan | 40060000 |
| 2 | 3 | Micro loan | 1590000 |

Three rows, three columns. The bold-looking first column, 0 · 1 · 2, is the index — row labels, not data.

```python
col = small["principal"]                       # one column → a Series
print(type(small).__name__, type(col).__name__)
print(col.sum(), col.max(), small.columns.tolist(), small.index.tolist())
```

```output
DataFrame Series
72800000 40060000 ['loan_id', 'product', 'principal'] [0, 1, 2]
```

The column is a Series: it adds up to 72 800 000 and its largest value is loan 2's 40 060 000 — one method call each, no loop.

| Day 1 (plain Python) | pandas |
|---|---|
| a list of values | a **Series** — a list with an index |
| a dict of lists | a **DataFrame** — a dict of Series that share one index |
| `for` + `total += x` | `col.sum()` — the loop runs inside pandas |

**When you use it.**
- A DataFrame for any table: a file, a query result, a summary you build.
- A Series for one column, or one row, or the result of a count.

> ⚠️ **Watch out.** The index is not a column. It is a label that stays with the row when you filter or sort — so after a filter, row label 0 may be gone. Section *loc and iloc* below shows where this bites.

**Your turn.** Build a DataFrame of the five DPD buckets and their loan counts, and print the total number of loans.

```task
{"id": "w05d2-l1", "kind": "python", "starter": "import pandas as pd\n\n# your code: a DataFrame with a column bucket (\"0\", \"1-30\", \"31-60\", \"61-90\", \"90+\")\n# and a column loans (7429, 124, 25, 16, 234); then print the sum of loans\n", "answer": 7828, "dp": 0, "hint": "pd.DataFrame({\"bucket\": [...], \"loans\": [...]}), then b[\"loans\"].sum().", "model": "b = pd.DataFrame({\"bucket\": [\"0\", \"1-30\", \"31-60\", \"61-90\", \"90+\"],\n                  \"loans\": [7429, 124, 25, 16, 234]})\nprint(b[\"loans\"].sum())     # 7828\n\nEvery loan is in exactly one bucket, so the counts add up to the 7 828 loans of the book."}
```

### read_csv — a file into a DataFrame (parse_dates, dtype)

**What it is.** `pd.read_csv(path)` reads a CSV into a DataFrame. It takes the header line as column names and **guesses a type** (*dtype*) for every column: whole numbers → `int64`, decimals → `float64`, anything else → `object` (text). Two parameters correct the guess: `parse_dates=[…]` makes date columns real dates, `dtype={…}` forces a type.

**How to write it.**

```python
raw = pd.read_csv("../excel/loans_status.csv")  # no parse_dates
print(raw["disbursed_at"].dtype, loans["disbursed_at"].dtype)
cust = pd.read_csv("../excel/customers_dirty.csv")
print(cust["phone"].dtype, cust["phone"][0], cust["monthly_income"].dtype)
cust_txt = pd.read_csv("../excel/customers_dirty.csv", dtype={"phone": str})
print(cust_txt["phone"].dtype, cust_txt["phone"][0])
```

| column | default guess | with the parameter |
|---|---|---|
| `disbursed_at` | `object` — text | `datetime64[ns]` with `parse_dates=["disbursed_at"]` |
| `phone` | `int64` — `998902031105`, the `+` lost | `object` — `"+998902031105"` with `dtype={"phone": str}` |
| `monthly_income` | `float64` — whole numbers, but 356 blanks | (a blank is `NaN`, and `NaN` is a float) |

The date comes back as text unless you ask for dates; the phone becomes the number 998 902 031 105 and loses its `+` unless you ask for text.

Other parameters you will need:

| parameter | does | example |
|---|---|---|
| `sep=";"` | another separator | European CSVs |
| `decimal=","` | comma as the decimal mark | `"3,12"` → 3.12 |
| `usecols=[…]` | load only these columns | 5 columns of 50 |
| `nrows=1000` | load only the first rows | a peek at a huge file |
| `pd.read_excel(path, sheet_name="Loans")` | the same for Excel | week 4's workbook |

**When you use it.**
- At the top of every notebook: one `read_csv` per input file, with its `parse_dates`.
- Whenever an id, a phone or a code must keep its leading `+` or `0`: `dtype=str`.

> ⚠️ **Watch out.** A whole-number column with a single blank becomes `float64`, because `NaN` is a float — `monthly_income` prints as `3894708.0`. Run `dtypes` before you trust a column.

**Your turn.** Read only three columns of `customers_dirty.csv` and keep the phone as text.

```task
{"id": "w05d2-l2", "kind": "python", "starter": "import pandas as pd\n\n# your code: read ../excel/customers_dirty.csv with usecols=[\"customer_id\", \"phone\", \"monthly_income\"]\n# and dtype={\"phone\": str}; print the shape and the dtypes\n", "answer": 6040, "dp": 0, "hint": "pd.read_csv(path, usecols=[...], dtype={\"phone\": str}); then .shape and .dtypes.", "model": "c3 = pd.read_csv(\"../excel/customers_dirty.csv\", usecols=[\"customer_id\", \"phone\", \"monthly_income\"], dtype={\"phone\": str})\nprint(c3.shape)      # (6040, 3)\nprint(c3.dtypes)     # customer_id int64 · phone object · monthly_income float64\n\n6 040 rows, 3 columns; the phone keeps its +."}
```

### First look — shape, head, info, describe

**What it is.** Five calls you run on every new table before any analysis: `shape` (rows, columns), `head()` (the first rows), `dtypes` and `info()` (a type and a non-null count per column — the NULL census), `describe()` (count, mean, spread and quartiles of every numeric column).

**How to write it.**

```python
print(loans.shape)  # (rows, columns)
loans.head()        # the first 5 rows; head(10) for ten, tail() for the last 5
```

`(7828, 13)`, then (7 of the 13 columns):

| (index) | loan_id | product | disbursed_at | principal | status | outstanding | dpd |
|---|---|---|---|---|---|---|---|
| 0 | 1 | Consumer loan | 2025-03-28 | 31150000 | active | 9593064 | 0 |
| 1 | 2 | Consumer loan | 2025-12-05 | 40060000 | active | 22246389 | 0 |
| 2 | 3 | Micro loan | 2026-03-28 | 1590000 | closed | 0 | 0 |
| 3 | 4 | Micro loan | 2026-08-23 | 2520000 | active | 1708700 | 0 |
| 4 | 5 | Small business loan | 2024-05-22 | 25590000 | active | 7498297 | 0 |

7 828 rows and 13 columns — one row per loan, the grain of the extract.

```python
loans.info()             # dtype and non-null count per column
```

```output
RangeIndex: 7828 entries, 0 to 7827
 #   Column        Non-Null Count  Dtype
 0   loan_id       7828 non-null   int64
 1   customer      7828 non-null   object
 6   disbursed_at  7828 non-null   datetime64[ns]
 7   principal     7828 non-null   int64
 12  bucket        7828 non-null   object
dtypes: datetime64[ns](1), int64(5), object(7)
```

(five of the 13 lines shown.) Every column has 7 828 non-null values: this extract has no blanks. Five columns are whole numbers, one is a date, seven are text.

```python
loans.describe()  # numeric columns: count, mean, std, min, quartiles, max
```

| | principal | outstanding | dpd |
|---|---|---|---|
| count | 7 828 | 7 828 | 7 828 |
| mean | 51 709 668 | 26 663 708 | 12.6 |
| 25% | 2 880 000 | 0 | 0 |
| 50% (median) | 5 790 000 | 0 | 0 |
| 75% | 34 712 500 | 7 552 471 | 0 |
| max | 599 060 000 | 586 068 714 | 919 |

(three of the columns, `std` and `min` left out.) The mean principal is 51.7 m but the median is 5.79 m: most loans are small and a few are very large — week 3's two books in one line. Three loans in four have `dpd = 0`; the worst is 919 days late.

`describe(include="object")` does the same for text: number of distinct values, the most common one and its count. `loans["product"].nunique()` is `COUNT(DISTINCT product)` — 5.

**When you use it.**
- On every new file, before any filter: is the grain right, are the types right, where are the blanks?
- `describe()` to see the shape of a number — skew, outliers, impossible values.

> ⚠️ **Watch out.** `head()` shows only the top of the file, which is often the cleanest part. Use `info()` for the blanks and `describe()` for the extremes — the problems live in the middle and at the edges.

**Your turn.** Print the number of rows and columns, and the largest `dpd`.

```task
{"id": "w05d2-l3", "kind": "python", "starter": "import pandas as pd\nlo = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code: the shape, then the maximum dpd\n", "answer": 919, "dp": 0, "hint": "lo.shape, then lo[\"dpd\"].max() — or read the max row of lo.describe().", "model": "print(lo.shape)            # (7828, 13)\nprint(lo[\"dpd\"].max())     # 919\n\n919 days — a written-off Micro loan, more than two and a half years past due."}
```

### Selecting columns — one bracket or two

**What it is.** `df["name"]` with **one** pair of brackets returns one column as a **Series**. `df[["a", "b"]]` with **two** pairs — a list of names inside the brackets — returns a **DataFrame** with those columns, in that order. It is `SELECT loan_id, product, dpd`.

**How to write it.**

```python
print(type(loans["product"]).__name__)        # one column → Series
loans[["loan_id", "product", "dpd"]].head(3)  # a list of columns → DataFrame
```

| (index) | loan_id | product | dpd |
|---|---|---|---|
| 0 | 1 | Consumer loan | 0 |
| 1 | 2 | Consumer loan | 0 |
| 2 | 3 | Micro loan | 0 |

The first line prints `Series`; the second returns a three-column table — the same 7 828 rows, only the columns you named.

More ways: `loans.columns.tolist()` lists the names; `loans.drop(columns=["customer"])` leaves one out; `loans.rename(columns={"dpd": "days_past_due"})` renames. `loans.product` (a dot) also works for simple names, but not for names with spaces or that clash with a method — brackets always work.

| you write | you get |
|---|---|
| `loans["dpd"]` | a Series — one column |
| `loans[["dpd"]]` | a DataFrame with one column |
| `loans[["loan_id", "dpd"]]` | a DataFrame with two columns |

**When you use it.**
- Before showing or saving a table: keep only the columns a reader needs.
- One column as a Series for a calculation: `loans["outstanding"].sum()`.

> ⚠️ **Watch out.** `loans["loan_id", "dpd"]` — two names in *one* pair of brackets — raises `KeyError: ('loan_id', 'dpd')`: pandas looks for one column with that two-part name. A list of columns needs its own brackets: `loans[["loan_id", "dpd"]]`.

**Your turn.** Which line returns a DataFrame with the columns `customer` and `outstanding`?

```task
{"id": "w05d2-l4", "kind": "choice", "options": ["loans[\"customer\", \"outstanding\"]", "loans[[\"customer\", \"outstanding\"]]", "loans(\"customer\", \"outstanding\")", "loans[\"customer\"][\"outstanding\"]"], "answer": 1, "explain": "A list of names — [\"customer\", \"outstanding\"] — inside the selection brackets. One pair of brackets with two names raises KeyError; round brackets call the frame like a function."}
```

### Selecting rows — the boolean mask (&, |, ~, isin, between, str.contains)

**What it is.** A comparison on a column, `loans["dpd"] > 0`, returns a **boolean mask** (*булева маска*): a Series of `True` / `False`, one per row. `loans[mask]` keeps the rows where the mask is `True`. Every `WHERE` you wrote in weeks 1–3 is a mask. Masks combine with `&` (and), `|` (or) and `~` (not).

```pic
{"id": "w05d2-pic1", "title": "A mask is a True/False column; [ ] keeps the True rows", "caption": "`mask = loans[\"dpd\"] > 0` gives one True or False per row. `loans[mask]` keeps the True rows (green) and drops the rest; the kept rows keep their index labels 277, 280, 281. 399 of the 7 828 loans pass.", "tables": [{"id": "src", "name": "loans", "cols": ["(index)", "loan_id", "dpd", "mask"], "rows": [[277, 282, 79, "True"], [278, 283, 0, "False"], [279, 284, 0, "False"], [280, 285, 11, "True"], [281, 286, 379, "True"], [282, 287, 0, "False"]], "new": ["mask"], "keep": [0, 3, 4], "drop": [1, 2, 5], "more": "… 7 828 rows"}, {"id": "res", "name": "loans[mask]", "cols": ["(index)", "loan_id", "dpd"], "rows": [[277, 282, 79], [280, 285, 11], [281, 286, 379]], "via": "loans[mask]", "more": "… 399 rows"}]}
```

**How to write it.**

```python
mask = loans["dpd"] > 90  # one True/False per row
print(mask.sum())         # True counts as 1: how many rows pass
loans[mask][["loan_id", "product", "dpd", "status"]].head(3)
```

| (index) | loan_id | product | dpd | status |
|---|---|---|---|---|
| 20 | 22 | Micro loan | 627 | written_off |
| 85 | 88 | Buy now pay later | 422 | written_off |
| 125 | 128 | Consumer loan | 405 | written_off |

234 loans are more than 90 days late; the first three in the file are all written off, and their index labels (20, 85, 125) are the ones they had in `loans`.

The other filters, each with its row count on `loans_status.csv`:

```python
# WHERE status = 'active'
active      = loans[loans["status"] == "active"]
# AND — a bracket round each condition
late_active = loans[(loans["dpd"] > 0) & (loans["status"] == "active")]
# IN (…)
big         = loans[loans["product"].isin(["Small business loan", "Auto loan"])]
# BETWEEN, both ends included
mid         = loans[loans["principal"].between(10_000_000, 50_000_000)]
# LIKE '%Tashkent%'
tash        = loans[loans["branch"].str.contains("Tashkent")]
# NOT
not_closed  = loans[~(loans["status"] == "closed")]
# OR
either      = loans[(loans["dpd"] > 90) | (loans["status"] == "written_off")]
# a half-open period
sept        = loans[(loans["disbursed_at"] >= "2026-09-01") & (loans["disbursed_at"] < "2026-10-01")]
[len(x) for x in [active, late_active, big, mid, tash, not_closed, either, sept]]
```

| SQL | pandas | rows |
|---|---|---|
| `WHERE status = 'active'` | `loans["status"] == "active"` | 3 352 |
| `… AND …` | `(loans["dpd"] > 0) & (loans["status"] == "active")` | 151 |
| `IN ('SME', 'AUTO')` | `loans["product"].isin([…])` | 1 172 |
| `BETWEEN 10 m AND 50 m` | `loans["principal"].between(10_000_000, 50_000_000)` | 2 087 |
| `LIKE '%Tashkent%'` | `loans["branch"].str.contains("Tashkent")` | 3 020 |
| `NOT (status = 'closed')` | `~(loans["status"] == "closed")` | 3 586 |
| `… OR …` | `(loans["dpd"] > 90) \| (loans["status"] == "written_off")` | 234 |
| September 2026 | `(d >= "2026-09-01") & (d < "2026-10-01")` | 361 |

151 active loans are late; 361 loans were disbursed in September 2026. `loans.query("dpd > 90 and product == 'Micro loan'")` is a readable alternative for long conditions (76 rows), with `and` / `or` allowed inside the string.

> 💡 **Key idea.** A filter is two steps: build a column of True/False (the mask), then keep the True rows with `[ ]`. `&`, `|`, `~` combine masks, one bracket per condition.

**When you use it.**
- Every `WHERE`: a status, a period, a product list, a text search.
- `mask.sum()` alone, when the question is "how many?" — `True` counts as 1.

> ⚠️ **Watch out.** Write `&`, `|`, `~` — never `and`, `or`, `not`, which raise `ValueError: The truth value of a Series is ambiguous`. Put **brackets round every condition**: `&` binds tighter than `>`, so `loans["dpd"] > 0 & loans["status"] == "active"` is read wrongly. And `between` includes both ends — on a column with times, use `>=` and `<` (the half-open rule).

**Your turn.**

```game
{"type": "bug", "id": "w05d2-g1", "title": "Find the broken line", "q": "Line by line this should count the late loans, then the late loans that are still active. One line raises an error.", "code": "late = loans[loans[\"dpd\"] > 0]\nactive_late = loans[loans[\"dpd\"] > 0 and loans[\"status\"] == \"active\"]\nprint(len(late), len(active_late))", "answer": [1], "why": "and works on single values, not on a whole column: pandas raises ValueError: The truth value of a Series is ambiguous. Write (loans[\"dpd\"] > 0) & (loans[\"status\"] == \"active\") — & with a bracket round each condition."}
```

### loc and iloc — rows by label, rows by position

**What it is.** `.loc[rows, columns]` selects by **label**: the index label of a row, the name of a column, or a mask. `.iloc[rows, columns]` selects by **position**: 0 is the first row, whatever its label. On a fresh frame the labels are 0, 1, 2 … and the two agree; after a filter or a sort they do not.

**How to write it.**

```python
# the filter keeps the original labels
late = loans[loans["dpd"] > 0]
# the labels of the first three late loans
print(late.index[:3].tolist())
# position 0 and label 20: the same row
print(late.iloc[0]["loan_id"], late.loc[20, "loan_id"])
# loc = a mask + a column list
late.loc[late["dpd"] > 400, ["loan_id", "product", "dpd"]].head(3)
```

```text
[20, 54, 85]
22 22
```

```pic
{"id": "w05d2-pic2", "title": "One row, two addresses: position for iloc, label for loc", "caption": "After the filter, loan 22 sits at **position** 0 of `late` but keeps its **label** 20 from `loans`. `late.iloc[0]` and `late.loc[20]` point at the same row; `late.loc[0]` raises `KeyError`.", "tables": [{"id": "late", "name": "late", "cols": ["position", "label", "loan_id", "dpd"], "rows": [[0, 20, 22, 627], [1, 54, 57, 46], [2, 85, 88, 422]], "tags": {"position": "iloc", "label": "loc"}, "cells": [[0, "position"], [0, "label"]], "more": "… 399 rows"}]}
```

The first late loan sits at **position** 0 of `late` but keeps its **label** 20 from `loans`; both point at loan 22. The last line returns loans 22, 88 and 128 — the first three more than 400 days late.

| | `.loc` | `.iloc` |
|---|---|---|
| selects by | label, column name, mask | integer position |
| `x.loc[0]` / `x.iloc[0]` | the row whose label is 0 (`KeyError` if it was filtered out) | the first row, always |
| slice `[0:3]` | labels 0 **to 3 included** | positions 0, 1, 2 (3 excluded) |
| typical use | `loans.loc[loans["dpd"] > 90, ["loan_id", "dpd"]]` | `loans.iloc[:5]`, `loans.iloc[-1]` |

**When you use it.**
- `loc` for conditions and names: the `SELECT … WHERE` in one call, and for writing values (`loans.loc[mask, "flag"] = 1`).
- `iloc` for "the first n rows" or "the last row".
- `reset_index(drop=True)` when you want positions and labels to agree again.

> ⚠️ **Watch out.** `late.loc[0]` raises `KeyError: 0` — label 0 is loan 1, which is not late. Positions are `iloc`; labels are `loc`. After a filter, mixing them gives the wrong row or an error.

**Your turn.** The `loan_id` of the tenth late loan in the file (position 9 of the late loans).

```task
{"id": "w05d2-l5", "kind": "python", "starter": "import pandas as pd\nlo = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code: keep the late loans (dpd > 0), then take position 9 with iloc and print its loan_id\n", "answer": 243, "dp": 0, "hint": "lt = lo[lo[\"dpd\"] > 0]; then lt.iloc[9][\"loan_id\"].", "model": "lt = lo[lo[\"dpd\"] > 0]\nprint(lt.iloc[9][\"loan_id\"])     # 243\nprint(lt.index[9])                # 239 — its label, not its position\n\nPosition 9 is the tenth late row; its label is 239 and its loan_id 243. Three different numbers for one row — that is why loc and iloc are two methods."}
```

### Sorting — sort_values and nlargest

**What it is.** `df.sort_values("col")` returns the rows in the order of a column — `ORDER BY`. `ascending=False` sorts largest first; a list of columns sorts by several keys. `df.nlargest(n, "col")` is the shortcut for "the top n".

**How to write it.**

```python
# ORDER BY outstanding DESC
top = loans.sort_values("outstanding", ascending=False)
top[["loan_id", "product", "outstanding", "dpd"]].head(3)  # … LIMIT 3
```

| (index) | loan_id | product | outstanding | dpd |
|---|---|---|---|---|
| 4549 | 4597 | Small business loan | 586068714 | 0 |
| 6405 | 6478 | Small business loan | 577813979 | 0 |
| 2905 | 2936 | Small business loan | 574094643 | 0 |

The three largest balances are SME loans of 574–586 m, all current. The index labels are scrambled now: a sort moves rows, labels and all.

```python
# the shortcut
print(loans.nlargest(3, "principal")["loan_id"].tolist())
# two keys
loans.sort_values(["product", "dpd"], ascending=[True, False])[["product", "dpd"]].head(3)
```

`[2861, 4570, 4601]` — the three largest principals, 599.06 / 598.45 / 597.54 m. The two-key sort puts products A→Z and, inside each product, the latest loan first: Auto loans at 771, then 739 days.

**When you use it.**
- Rankings and top-n lists: the largest balances, the latest loans.
- A natural order before printing: months, buckets (`sort_index()` sorts by the index instead).

> ⚠️ **Watch out.** `sort_values` returns a **new** frame. `loans.sort_values("dpd")` on its own line changes nothing in `loans` — keep the result: `top = loans.sort_values(…)`.

**Your turn.** The `loan_id` of the Auto loan with the largest outstanding.

```task
{"id": "w05d2-l6", "kind": "python", "starter": "import pandas as pd\nlo = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code: keep the Auto loans, sort by outstanding largest first, print the first loan_id\n", "answer": 2283, "dp": 0, "hint": "auto = lo[lo[\"product\"] == \"Auto loan\"]; then auto.sort_values(\"outstanding\", ascending=False) or auto.nlargest(1, \"outstanding\").", "model": "auto = lo[lo[\"product\"] == \"Auto loan\"]\nprint(auto.nlargest(3, \"outstanding\")[[\"loan_id\", \"branch\", \"outstanding\"]])\n# 2283 Andijan Central 377 609 094 · 4696 Tashkent South 376 857 800 · 3209 Tashkent South 375 525 938\n\nA filter, then a sort: WHERE product = 'Auto loan' ORDER BY outstanding DESC LIMIT 3."}
```

### New columns — vectorised arithmetic and astype

**What it is.** `df["new"] = expression` adds a column. The expression works on **whole columns at once** (*векторизация*, vectorised): `loans["outstanding"] / 1e9` divides all 7 828 values in one step, with no loop. `astype` converts a column's type — the `CAST` of SQL.

**How to write it.**

```python
# every row at once
loans["outstanding_bn"] = loans["outstanding"] / 1e9
# two columns, row by row
loans["repaid_share"] = 1 - loans["outstanding"] / loans["principal"]
# a boolean column
loans["is_late"] = loans["dpd"] > 0
print(round(loans["outstanding_bn"].sum(), 1), loans["is_late"].sum())
loans[["loan_id", "principal", "outstanding", "repaid_share", "is_late"]].head()
```

| (index) | loan_id | principal | outstanding | repaid_share | is_late |
|---|---|---|---|---|---|
| 0 | 1 | 31150000 | 9593064 | 0.692036 | False |
| 1 | 2 | 40060000 | 22246389 | 0.444673 | False |
| 2 | 3 | 1590000 | 0 | 1.000000 | False |
| 3 | 4 | 2520000 | 1708700 | 0.321944 | False |
| 4 | 5 | 25590000 | 7498297 | 0.706983 | False |

`208.7 399`: the book is 208.7 bn and 399 loans are late. Loan 1 has repaid 69 % of its principal; loan 3, closed, 100 %.

Types: `astype(int)`, `astype(float)`, `astype(str)`, `astype("category")` (text with few values: less memory and an order), `astype(bool)`. For text that may be garbage, `pd.to_numeric(col, errors="coerce")` turns what it cannot read into `NaN` instead of crashing:

```python
print(loans["term"].astype(str).head(3).tolist())              # int → text
pd.to_numeric(pd.Series(["658", "", "n/a"]), errors="coerce")  # 658.0, NaN, NaN
```

The term becomes the text `['24', '18', '3']`; the scores `"658"`, `""`, `"n/a"` become 658.0, NaN, NaN.

**When you use it.**
- Every derived number: a share, a ratio, a flag, an amount in bn.
- `astype` after reading, when the guess was wrong; `to_numeric(errors="coerce")` on dirty text.

> ⚠️ **Watch out.** Assign through `.loc`, never through two brackets in a row. `loans[loans["dpd"] > 90]["flag"] = 1` (chained indexing) writes into a temporary **copy** and changes nothing in `loans` — pandas only warns `SettingWithCopyWarning`. Write `loans.loc[loans["dpd"] > 90, "flag"] = 1`. When you cut a frame to keep working on it, take a copy on purpose: `late = loans[loans["dpd"] > 0].copy()`.

**Your turn.** Add a column `paid` = principal − outstanding and print its total in bn, one decimal.

```task
{"id": "w05d2-l7", "kind": "python", "starter": "import pandas as pd\nlo = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code: lo[\"paid\"] = …, then the sum in bn with one decimal\n", "answer": 196.1, "dp": 1, "hint": "lo[\"paid\"] = lo[\"principal\"] - lo[\"outstanding\"]; round(lo[\"paid\"].sum() / 1e9, 1).", "model": "lo[\"paid\"] = lo[\"principal\"] - lo[\"outstanding\"]\nprint(round(lo[\"paid\"].sum() / 1e9, 1))     # 196.1\n\n404.8 bn lent − 208.7 bn still outstanding = 196.1 bn of principal already repaid (interest not counted)."}
```

### Dates — the .dt accessor

**What it is.** Once a column is `datetime64`, **`.dt`** (*аксессор .dt*) opens the calendar for every value at once: `.dt.year`, `.dt.month`, `.dt.quarter`, `.dt.day_name()`, `.dt.to_period("M")` (the month). Subtracting two dates gives a duration; `.dt.days` turns it into a number.

**How to write it.**

```python
AS_OF = pd.Timestamp("2026-10-01")
loans["year"] = loans["disbursed_at"].dt.year
# week 3's strftime('%Y-%m')
loans["month"] = loans["disbursed_at"].dt.to_period("M")
loans["days_on_book"] = (AS_OF - loans["disbursed_at"]).dt.days
print(loans["year"].value_counts().to_dict())
loans[["loan_id", "disbursed_at", "year", "month", "days_on_book"]].head()
```

| (index) | loan_id | disbursed_at | year | month | days_on_book |
|---|---|---|---|---|---|
| 0 | 1 | 2025-03-28 | 2025 | 2025-03 | 552 |
| 1 | 2 | 2025-12-05 | 2025 | 2025-12 | 300 |
| 2 | 3 | 2026-03-28 | 2026 | 2026-03 | 187 |
| 3 | 4 | 2026-08-23 | 2026 | 2026-08 | 39 |
| 4 | 5 | 2024-05-22 | 2024 | 2024-05 | 862 |

`{2026: 3051, 2025: 3041, 2024: 1736}`: as many loans in nine months of 2026 as in all of 2025. Loan 1 has been on the book 552 days on the as-of date.

| you want | `.dt` | SQL (week 3) |
|---|---|---|
| the year | `.dt.year` | `strftime('%Y', d)` |
| the month as a period | `.dt.to_period("M")` | `strftime('%Y-%m', d)` |
| the quarter | `.dt.quarter` | `(month + 2) / 3` |
| the weekday | `.dt.day_name()` | `strftime('%w', d)` |
| days between | `(a - b).dt.days` | `julianday(a) - julianday(b)` |

A datetime column compares with a text date directly: `loans["disbursed_at"] >= "2026-09-01"` works — pandas reads the string as a date.

**When you use it.**
- Grouping by period: per month, per quarter, per year.
- Ages and durations: days on book, days past due, age at application.

> ⚠️ **Watch out.** `.dt` works only on `datetime64`. On a column read without `parse_dates` it raises `AttributeError: Can only use .dt accessor with datetimelike values`. Fix it once, at the top: `parse_dates=[…]` or `pd.to_datetime(col)`.

**Your turn.** The average days on book of the **active** loans, rounded to a whole day.

```task
{"id": "w05d2-l8", "kind": "python", "starter": "import pandas as pd\nlo = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\nAS_OF = pd.Timestamp(\"2026-10-01\")\n\n# your code: days on book = AS_OF − disbursed_at in days; the mean over the active loans\n", "answer": 221, "dp": 0, "hint": "(AS_OF - lo[\"disbursed_at\"]).dt.days, then a mask status == \"active\" and .mean().", "model": "lo[\"days_on_book\"] = (AS_OF - lo[\"disbursed_at\"]).dt.days\nprint(round(lo.loc[lo[\"status\"] == \"active\", \"days_on_book\"].mean()))     # 221\n\nThe active book is young: on average about seven months old, because 2026 lent as much as all of 2025."}
```

### value_counts — count per value

**What it is.** `col.value_counts()` counts the rows for each distinct value — `GROUP BY col` with `COUNT(*)` for one column. `normalize=True` gives shares instead of counts; `nunique()` counts the distinct values.

**How to write it.**

```python
print(loans["product"].nunique())  # COUNT(DISTINCT product)
loans["status"].value_counts()     # largest first
```

| status | count |
|---|---|
| closed | 4242 |
| active | 3352 |
| written_off | 190 |
| default | 44 |

5 products; 4 242 loans are closed, 3 352 active, 190 written off and 44 in default.

```python
loans["product"].value_counts(normalize=True).mul(100).round(1)    # shares in %
```

Micro 34.1 % · Consumer 30.9 · BNPL 20.0 · SME 10.0 · Auto 5.0 — the shares of the loan count, adding to 100.

| option | does |
|---|---|
| `normalize=True` | shares instead of counts |
| `.sort_index()` after it | the natural order of the labels (buckets 0 … 90+) instead of by count |
| `dropna=False` | shows `NaN` as a row of its own |

**When you use it.**
- The first question about any text column: which values, how many of each?
- Shares of a whole: product mix, status mix.

> ⚠️ **Watch out.** By default `value_counts` drops `NaN` silently — the blanks are not in the list, and the shares are shares of the non-blank rows. Pass `dropna=False` to see them.

**Your turn.** The share of written-off loans, in % with two decimals.

```task
{"id": "w05d2-l9", "kind": "python", "starter": "import pandas as pd\nlo = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code: value_counts of status with normalize=True; print the written_off share in %\n", "answer": 2.43, "dp": 2, "hint": "lo[\"status\"].value_counts(normalize=True)[\"written_off\"] * 100.", "model": "shares = lo[\"status\"].value_counts(normalize=True)\nprint(round(100 * shares[\"written_off\"], 2))     # 2.43\n\n190 of 7 828 loans. A value_counts result is a Series indexed by the values, so [\"written_off\"] picks one."}
```

### Missing values — isna, fillna, dropna

**What it is.** **`NaN`** (*пропуск*) is pandas' NULL: a cell with no value (`NaT` for a date). Aggregates skip it, like SQL's `AVG`. `isna()` finds it, `fillna(x)` writes a value into the gaps, `dropna()` removes the rows that have it.

**How to write it.**

```python
cust = pd.read_csv("../excel/customers_dirty.csv")
inc = cust["monthly_income"]
# columns with blanks, and how many
print(cust.isna().sum()[lambda s: s > 0])
print(len(inc), inc.count())  # rows vs non-blank values
print(round(inc.mean()), round(inc.fillna(0).mean()), round(inc.fillna(inc.median()).mean()))
print(len(cust.dropna(subset=["monthly_income"])))
```

| | value |
|---|---|
| missing `monthly_income` | 356 (the only column with blanks) |
| rows / non-blank incomes | 6 040 / 5 684 |
| `mean()` — blanks skipped | 15 245 933 |
| `fillna(0).mean()` | 14 347 331 |
| `fillna(median).mean()` | 14 812 719 |
| rows after `dropna(subset=["monthly_income"])` | 5 684 |

356 customers have no income. The plain mean, over the 5 684 known incomes, is 15.2 m; filling the gaps with 0 drops it to 14.3 m, because it invents 356 people who earn nothing.

| call | does |
|---|---|
| `col.isna()` / `col.notna()` | the mask of blanks / non-blanks |
| `col.count()` vs `len(col)` | non-blank values vs rows — the difference is the NULL census |
| `col.fillna(0)` | 0 into the gaps — `COALESCE(x, 0)` |
| `df.dropna(subset=["col"])` | drop the rows where *that* column is blank |
| `df.dropna()` | drop a row if **any** column is blank |

**When you use it.**
- `isna().sum()` on every new table, next to `info()`.
- `fillna(0)` only where a blank truly means zero: no payment → 0 paid.

> 💡 **Key idea.** `fillna(0)` is a decision, not a cleaning step. For a *count* (no payment → 0 paid) it is right; for an *income* it is a lie that drops the mean by 0.9 m. Keep the NaN and show an "unknown" band, or fill with a labelled estimate.

> ⚠️ **Watch out.** `col == np.nan` never finds a blank — `NaN` is not equal to anything, itself included. Use `col.isna()`. And `dropna()` with no `subset=` drops a row when *any* column is blank — on a wide table that can be most of the file.

**Your turn.** How many customers have a known income?

```task
{"id": "w05d2-l10", "kind": "python", "starter": "import pandas as pd\ncu = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# your code: the number of non-blank monthly_income values (two ways: count() and notna().sum())\n", "answer": 5684, "dp": 0, "hint": "cu[\"monthly_income\"].count() or cu[\"monthly_income\"].notna().sum().", "model": "print(cu[\"monthly_income\"].count(), cu[\"monthly_income\"].notna().sum())     # 5684 5684\n\n6 040 customers − 356 blanks = 5 684."}
```

### pd.cut — buckets without a CASE

**What it is.** `pd.cut(col, bins=edges, labels=…)` puts every number into an interval and returns its label — the `CASE WHEN dpd <= 30 THEN …` of week 2 in one line. Intervals are **right-closed** by default: `(30, 60]` contains 60 but not 30.

```pic
{"id": "w05d2-pic3", "title": "Right-closed: 60 is in (30, 60], 61 is not", "caption": "Six real loans near the edges. Loan 1997 is exactly 60 days late and lands in **31-60**; loan 7286, one day more, starts **61-90** (both circled). Same colour, same bucket.", "tables": [{"id": "l", "name": "loans", "cols": ["loan_id", "dpd", "interval", "bucket_pd"], "rows": [[1, 0, "(−1, 0]", "0"], [6227, 29, "(0, 30]", "1-30"], [5613, 31, "(30, 60]", "31-60"], [1997, 60, "(30, 60]", "31-60"], [7286, 61, "(60, 90]", "61-90"], [22, 627, "(90, ∞]", "90+"]], "new": ["bucket_pd"], "tone": ["a", "b", "c", "c", "d", "e"], "cells": [[3, "dpd"], [4, "dpd"]]}]}
```

**How to write it.**

```python
edges  = [-1, 0, 30, 60, 90, np.inf]
labels = ["0", "1-30", "31-60", "61-90", "90+"]
loans["bucket_pd"] = pd.cut(loans["dpd"], bins=edges, labels=labels)
loans["bucket_pd"].value_counts().sort_index()
```

| bucket_pd | count |
|---|---|
| 0 | 7429 |
| 1-30 | 124 |
| 31-60 | 25 |
| 61-90 | 16 |
| 90+ | 234 |

7 429 loans are current and 234 are past 90 days — the same five numbers as the SQL `CASE` of week 2 and the file's own `bucket` column.

| `dpd` | interval | label |
|---|---|---|
| 0 | (−1, 0] | 0 |
| 30 | (0, 30] | 1-30 |
| 31 | (30, 60] | 31-60 |
| 91 | (90, ∞] | 90+ |

`right=False` flips to left-closed intervals, `[0, 5 m)` — for rules written with `<`, like income bands. `pd.qcut(col, 10)` cuts into ten groups of equal size — week 3's `NTILE(10)`. The result is a `category` with the labels in order, so `sort_index()` gives 0 … 90+.

**When you use it.**
- Numeric ranges that are a definition: DPD buckets, income bands, ticket sizes.

> ⚠️ **Watch out.** The first edge must be **below** the smallest value. With edges `[0, 30, …]` the first interval is `(0, 30]`, which does not contain 0 — all 7 429 loans with `dpd = 0` become `NaN`. Start at −1.

**Your turn.** Cut `monthly_income` into the bands `<5m`, `5-10m`, `10-20m`, `20m+` with `right=False`. How many customers are in `<5m`?

```task
{"id": "w05d2-l11", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\ncu = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# your code: pd.cut with edges [0, 5e6, 10e6, 20e6, np.inf], the four labels, right=False; then value_counts\n", "answer": 1281, "dp": 0, "hint": "pd.cut(cu[\"monthly_income\"], [0, 5e6, 10e6, 20e6, np.inf], labels=[\"<5m\", \"5-10m\", \"10-20m\", \"20m+\"], right=False).", "model": "band = pd.cut(cu[\"monthly_income\"], [0, 5e6, 10e6, 20e6, np.inf],\n              labels=[\"<5m\", \"5-10m\", \"10-20m\", \"20m+\"], right=False)\nprint(band.value_counts(dropna=False).sort_index())\n# <5m 1281 · 5-10m 2198 · 10-20m 576 · 20m+ 1629 · NaN 356\n\nright=False makes [5m, 10m): exactly 5 000 000 is in 5-10m, as in SQL's monthly_income < 5000000. The 356 blank incomes stay NaN — dropna=False shows them."}
```

### SQL ↔ pandas — the translation table

**What it is.** Every SQL clause you know has a pandas spelling. This table is today's vocabulary in one place, with week 4's Excel in the middle.

**How to write it.**

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

Sixteen rows, one meaning each. The pandas column is the only one of the three that is a *file you can re-run on a new input*.

**When you use it.**
- When you know the SQL and need the pandas: find the row, copy the spelling.
- Reading someone else's notebook: translate back to the SQL you can check.

**Your turn.**

```game
{"type": "match", "id": "w05d2-g2", "title": "SQL → pandas", "pairs": [["WHERE dpd > 0 AND status = 'active'", "loans[(loans.dpd > 0) & (loans.status == \"active\")]"], ["IN ('SME', 'AUTO')", ".isin([...])"], ["LIKE '%Tashkent%'", ".str.contains(\"Tashkent\")"], ["ORDER BY outstanding DESC", ".sort_values(\"outstanding\", ascending=False)"], ["COUNT(DISTINCT region)", ".nunique()"], ["COALESCE(x, 0)", ".fillna(0)"], ["GROUP BY status + COUNT(*)", ".value_counts()"], ["CASE WHEN dpd <= 30 …", "pd.cut(dpd, edges, labels=...)"]]}
```

### Putting it together

One request, every tool of the day: *the late active loans of the Tashkent branches — largest balance first, with days on book and bucket — saved as a CSV for the collections team.* A **mask** with three conditions, **`loc`** with a column list, a **new column** from **dates**, **`pd.cut`**, a **sort**, then **`to_csv`** to write it back.

```python
AS_OF = pd.Timestamp("2026-10-01")
cond = (loans["status"] == "active") & (loans["dpd"] > 0) & loans["branch"].str.contains("Tashkent")
watch = loans.loc[cond, ["loan_id", "branch", "product", "disbursed_at", "outstanding", "dpd"]].copy()
watch["days_on_book"] = (AS_OF - watch["disbursed_at"]).dt.days
watch["bucket"] = pd.cut(watch["dpd"], [-1, 0, 30, 60, 90, np.inf], labels=["0", "1-30", "31-60", "61-90", "90+"])
watch = watch.sort_values("outstanding", ascending=False)
# index=False, or Excel gets a nameless first column
watch.to_csv("tashkent_watchlist.csv", index=False)
print(len(watch), watch["outstanding"].sum())
watch.head()
```

| (index) | loan_id | branch | product | outstanding | dpd | days_on_book | bucket |
|---|---|---|---|---|---|---|---|
| 4519 | 4567 | Tashkent Central | Auto loan | 301482053 | 84 | 206 | 61-90 |
| 280 | 285 | Tashkent North | Small business loan | 296861300 | 11 | 134 | 1-30 |
| 429 | 434 | Tashkent Central | Small business loan | 264936631 | 21 | 205 | 1-30 |
| 5356 | 5418 | Tashkent South | Auto loan | 254851103 | 26 | 238 | 1-30 |
| 3790 | 3827 | Tashkent North | Auto loan | 205320039 | 48 | 109 | 31-60 |

61 loans, 2 718 083 360 soum outstanding. The top of the list is an Auto loan of 301 m that is already 84 days late — one step from 90+.

`.copy()` after the `loc` makes `watch` a frame of its own, so the new columns do not trigger the copy warning. `to_csv(…, index=False)` writes the file Bekzod opens; `to_excel("f.xlsx", sheet_name="…", index=False)` does the same for Excel (it needs the `openpyxl` package, which Anaconda has).

**Your turn.** The same list for the Samarkand branch: how much outstanding does it hold?

```task
{"id": "w05d2-l12", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nlo = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code: active, dpd > 0, branch containing \"Samarkand\"; print the number of loans and the sum of outstanding\n", "answer": 1098615809, "dp": 0, "hint": "The same three-condition mask with \"Samarkand\" instead of \"Tashkent\"; then len() and [\"outstanding\"].sum().", "model": "cond = (lo[\"status\"] == \"active\") & (lo[\"dpd\"] > 0) & lo[\"branch\"].str.contains(\"Samarkand\")\nw = lo.loc[cond].sort_values(\"outstanding\", ascending=False)\nprint(len(w), w[\"outstanding\"].sum())     # 17 1098615809\n\n17 loans, 1.10 bn; the largest is loan 1175, an SME loan of 458.8 m that is 12 days late."}
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

Bekzod's tiles from week 4 Day 1, as a function of the DataFrame, so that next month is `portfolio_summary(pd.read_csv("loans_status_2026-11.csv"))`. Each step uses one concept from section 1, in the order you learned them.

1. **Step 1 — read_csv with parse_dates.** The function takes the `loans` frame read in section 1. Its dates are real dates, so they compare with `AS_OF`.
2. **Step 2 — boolean masks.** `df["status"] == "active"` and the two-condition period `in_2026` (half-open: `>=` 1 January, `<` the as-of). `.sum()` counts the `True` rows.
3. **Step 3 — loc with a mask and a column.** `df.loc[df["dpd"] > 30, "outstanding"].sum()` is `SUM(outstanding) WHERE dpd > 30`.
4. **Step 4 — vectorised arithmetic, inside a function.** Each ratio is two column sums divided once; `def` and `return` (Day 1) make the six tiles one call you can re-run.

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
# {'loans': 7828, 'active': 3352, 'outstanding': 208723504430, 'disbursed_2026':
# 3030, 'par30_pct': 3.12, 'npl90_pct': 2.55}
```

Every line is a SQL clause you have written: `len` is `COUNT(*)`, `(cond).sum()` is `SUM(CASE WHEN … THEN 1 END)`, `df.loc[mask, "col"].sum()` is `SUM(col) WHERE mask`. One number differs from week 4's tile on purpose: **3 030**, not 3 051 — this function uses the half-open `< AS_OF`, so the 21 loans disbursed on the as-of day itself (852 760 000) are out; week 4's `COUNTIFS` used `<=`. Neither is wrong; the function's docstring must say which.

> 💡 **Key idea.** A monthly notebook is safe only with an **assert** pinning the known values: `assert portfolio_summary(loans)["outstanding"] == 208_723_504_430`. If the November file has a new status spelling or a text date, the assert fails before Bekzod sees a wrong tile — `day2_starter.ipynb` pins all six.

---

## 3. Practice (50 min)

Each task's editor already loads `loans_status.csv` with `parse_dates` (P12 loads `customers_dirty.csv`). Write your code under `# your code`, **▶ Run**, then **✔ Check** — print the number the task asks for. In Jupyter, `data/python/day2_starter.ipynb` has the walk-through cells; add a cell per task.

**P1.** *(Series and DataFrame)* Make a **Series** of the five bucket counts (7 429, 124, 25, 16, 234) with the labels `0` … `90+` as its index (`pd.Series(values, index=labels)`). Print the 90+ count by its label, the total, and the 90+ share of all loans in %.

```task
{"id": "w05d2-l13", "kind": "python", "starter": "import pandas as pd\n\n# your code: s = pd.Series([...], index=[...]); then s[\"90+\"], s.sum() and the 90+ share in %\n", "answer": 2.99, "dp": 2, "hint": "pd.Series([7429, 124, 25, 16, 234], index=[\"0\", \"1-30\", \"31-60\", \"61-90\", \"90+\"]); round(100 * s[\"90+\"] / s.sum(), 2).", "model": "s = pd.Series([7429, 124, 25, 16, 234], index=[\"0\", \"1-30\", \"31-60\", \"61-90\", \"90+\"])\nprint(s[\"90+\"], s.sum(), round(100 * s[\"90+\"] / s.sum(), 2))     # 234 7828 2.99\n\nA Series is looked up by its index label, like a dict: s[\"90+\"]. 3 % of loans by count — but 2.55 % of the money (NPL90, Company corner)."}
```

**P2.** *(read_csv)* Read `loans_status.csv` *without* `parse_dates`. What is the dtype of `disbursed_at`, and what does `loans["disbursed_at"].dt.year` do? Fix it two ways.

```task
{"id": "w05d2-p1", "kind": "choice", "options": ["datetime64[ns] — pandas recognises ISO dates by itself", "object (text) — and .dt raises AttributeError until you convert it", "int64 — the dates are stored as numbers", "category — dates repeat, so pandas compresses them"], "answer": 1, "explain": "Without parse_dates the column is text: .dt raises AttributeError: Can only use .dt accessor with datetimelike values. Fix: parse_dates=[\"disbursed_at\"] in read_csv, or loans[\"disbursed_at\"] = pd.to_datetime(loans[\"disbursed_at\"]) afterwards; info() then shows datetime64[ns]."}
```

**P3.** *(first look)* From `describe()` alone: median principal, mean principal, the 75th percentile of `dpd`, max `dpd`. What does the gap between mean and median tell you? Type the median principal.

```task
{"id": "w05d2-p2", "kind": "number", "answer": 5790000, "dp": 0, "unit": "soum", "hint": "The median is the 50% row of loans[\"principal\"].describe().", "model": "Median 5 790 000 · mean 51 709 668 · 75th percentile of dpd 0 · max dpd 919. A mean nine times the median is a long right tail: a few SME/Auto loans carry the money (week 3's two-books finding). 75 % of loans have dpd = 0, so the 399 late loans are the top 5 %."}
```

**P4.** *(selecting columns)* Select the two money columns, `principal` and `outstanding`, as a DataFrame and print their sums in one call. How much was lent in total?

```task
{"id": "w05d2-l14", "kind": "python", "starter": "import pandas as pd\nlo = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code: the two columns (double brackets), then .sum()\n", "answer": 404783280000, "dp": 0, "hint": "lo[[\"principal\", \"outstanding\"]].sum().", "model": "print(lo[[\"principal\", \"outstanding\"]].sum())\n# principal 404783280000 · outstanding 208723504430\n\n.sum() on a DataFrame sums every column and returns a Series indexed by the column names: 404.8 bn lent, 208.7 bn still outstanding."}
```

**P5.** *(boolean masks)* Three filters, three counts: SME or Auto (`isin`), principal between 10 m and 50 m (`between`), branch containing `Tashkent` (`str.contains`). Then the September-2026 loans with the half-open rule — and show that `between("2026-09-01", "2026-09-30")` happens to agree here, and why it would not on `applied_at`.

```task
{"id": "w05d2-p4", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code — print the September count last\n", "answer": 361, "dp": 0, "hint": "The check looks for the September 2026 count: >= \"2026-09-01\" and < \"2026-10-01\", each in brackets, joined with &.", "model": "print(loans[\"product\"].isin([\"Small business loan\", \"Auto loan\"]).sum())     # 1172\nprint(loans[\"principal\"].between(10_000_000, 50_000_000).sum())                # 2087\nprint(loans[\"branch\"].str.contains(\"Tashkent\").sum())                          # 3020\nd = loans[\"disbursed_at\"]\nprint(((d >= \"2026-09-01\") & (d < \"2026-10-01\")).sum())                         # 361\nprint(d.between(\"2026-09-01\", \"2026-09-30\").sum())                             # 361\n\ndisbursed_at is a pure date, so the 30th at 00:00 is included; applied_at carries a time, and between(…, \"2026-09-30\") would drop everything after midnight on the 30th (week 1's 23 lost applications). Half-open, always."}
```

**P6.** *(loc and iloc)* With `loc`, show the `customer`, `status` and `outstanding` of loan 4570 (a mask on `loan_id` plus a column list). With `iloc`, print the `loan_id` of the last row of the file. Why is it not 7 828?

```task
{"id": "w05d2-l15", "kind": "python", "starter": "import pandas as pd\nlo = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code: lo.loc[mask, [columns]] for loan 4570; then the loan_id of lo.iloc[-1]\n", "answer": 7917, "dp": 0, "hint": "lo.loc[lo[\"loan_id\"] == 4570, [\"customer\", \"status\", \"outstanding\"]]; lo.iloc[-1][\"loan_id\"].", "model": "print(lo.loc[lo[\"loan_id\"] == 4570, [\"customer\", \"status\", \"outstanding\"]])   # Umida Khasanova, closed, 0\nprint(lo.iloc[-1][\"loan_id\"], len(lo))                                            # 7917 7828\n\nThe last row is loan 7917 although there are 7 828 rows: some loan ids are missing from the sequence. So the index label (7827), the position (−1) and the loan_id (7917) are three different numbers — never use a label as a loan_id."}
```

**P7.** *(sorting)* The three loans with the largest `outstanding`, with `loan_id`, `product`, `outstanding` only — once with `sort_values().head(3)`, once with `nlargest`. Then the three largest by `principal`.

```task
{"id": "w05d2-p5", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code\n", "answer": 4597, "dp": 0, "hint": "The check looks for the loan_id with the largest outstanding.", "model": "cols = [\"loan_id\", \"product\", \"outstanding\"]\nprint(loans.sort_values(\"outstanding\", ascending=False)[cols].head(3))\nprint(loans.nlargest(3, \"outstanding\")[cols])\nprint(loans.nlargest(3, \"principal\")[[\"loan_id\", \"product\", \"principal\"]])\n\nOutstanding: 4597 (586 068 714) · 6478 (577 813 979) · 2936 (574 094 643), all SME. Principal: 2861 (599 060 000) · 4570 (598 450 000) · 4601 (597 540 000) — SME's max_amount is 600 m, and the biggest loans sit against it (week 3 S6)."}
```

**P8.** *(new columns)* Add `repaid_share = 1 − outstanding ÷ principal`. How many **active** loans have already repaid more than half of their principal?

```task
{"id": "w05d2-l16", "kind": "python", "starter": "import pandas as pd\nlo = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code: the new column, then a mask (active and repaid_share > 0.5) and .sum()\n", "answer": 1072, "dp": 0, "hint": "lo[\"repaid_share\"] = 1 - lo[\"outstanding\"] / lo[\"principal\"]; then ((lo[\"status\"] == \"active\") & (lo[\"repaid_share\"] > 0.5)).sum().", "model": "lo[\"repaid_share\"] = 1 - lo[\"outstanding\"] / lo[\"principal\"]\nprint(((lo[\"status\"] == \"active\") & (lo[\"repaid_share\"] > 0.5)).sum())     # 1072\n\n1 072 of the 3 352 active loans are past the halfway mark. The column is computed for all 7 828 rows in one step; the mask then picks the ones you count."}
```

**P9.** *(dates)* Add `year` and `month` columns from `disbursed_at`; count 2026 loans per month and per quarter.

```task
{"id": "w05d2-p6", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code\n", "answer": 1086, "dp": 0, "hint": "The check looks for the Q3 2026 count. .dt.year, .dt.month, .dt.quarter, then value_counts().sort_index().", "model": "loans[\"year\"] = loans[\"disbursed_at\"].dt.year\nloans[\"month\"] = loans[\"disbursed_at\"].dt.month\ny26 = loans[loans[\"year\"] == 2026]\nprint(y26[\"month\"].value_counts().sort_index())\nprint(y26[\"disbursed_at\"].dt.quarter.value_counts().sort_index())\n\nMonths: 287 · 265 · 330 · 312 · 377 · 373 · 367 · 358 · 361 (+ 21 on 1 October); quarters Q1 882 · Q2 1 062 · Q3 1 086 · Q4 21. loans[\"disbursed_at\"].dt.to_period(\"M\").value_counts().sort_index() is the strftime('%Y-%m') + GROUP BY of week 3 S7 in one line."}
```

**P10.** *(value_counts)* How many loans are late (`dpd > 0`) per `status`? Which combination should not exist, and does it?

```task
{"id": "w05d2-p3", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code\n", "answer": 14, "dp": 0, "hint": "Filter the late loans, then value_counts the status. The check looks for the combination that looks impossible.", "model": "print(loans[loans[\"dpd\"] > 0][\"status\"].value_counts())\n# written_off 190 · active 151 · default 44 · closed 14\n\n\"Closed and late\" looks impossible — 14 loans: closed because the last instalment's due date has passed, but with a payment short; week 2 found the same 14 (13 in 1–30, 1 in 31–60). Not a bug to fix in pandas — a question for Sevara."}
```

**P11.** *(value_counts)* Shares with `value_counts(normalize=True)`: products, grades, channels of *loans* (channel is not in the file — which week-3 fact lets you derive it from `product`?).

```task
{"id": "w05d2-p7", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code\n", "answer": 45.9, "dp": 1, "hint": "The check looks for the branch channel's share in %, one decimal. Map each product to its channel with a dict.", "model": "print(loans[\"product\"].value_counts(normalize=True).mul(100).round(1))\nprint(loans[\"grade\"].value_counts(normalize=True).mul(100).round(1))\nchannel = loans[\"product\"].map({\"Micro loan\": \"app\", \"Buy now pay later\": \"partner\",\n                                 \"Consumer loan\": \"branch\", \"Small business loan\": \"branch\", \"Auto loan\": \"branch\"})\nprint(channel.value_counts(normalize=True).mul(100).round(1))\n\nProducts 34.1 / 30.9 / 20.0 / 10.0 / 5.0 %; grades B 43.5 · C 28.9 · A 23.3 · D 4.3. Each channel sells one product family (week 3 S2): app = Micro (34.1 %), partner = BNPL (20.0 %), branch = the rest (45.9 %) — so map builds the channel column without a join."}
```

**P12.** *(missing values)* `customers_dirty.csv`: how many `monthly_income` are missing, the mean with and without `fillna(0)`, the mean after a median fill, and the row count after `dropna()` with and without `subset`.

```task
{"id": "w05d2-p9", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\ncust = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# your code\n", "answer": 14347331, "dp": 0, "hint": "The check looks for the mean after fillna(0), rounded to the soum.", "model": "inc = cust[\"monthly_income\"]\nprint(inc.isna().sum())                         # 356\nprint(round(inc.mean()))                        # 15245933\nprint(round(inc.fillna(0).mean()))              # 14347331\nprint(round(inc.fillna(inc.median()).mean()))   # 14812719\nprint(len(cust.dropna()), len(cust.dropna(subset=[\"monthly_income\"])))   # 5684 5684\n\nThe zeros pull the mean down 0.9 m. dropna() and dropna(subset=...) agree here only because income is the only column with gaps — on tomorrow's merged tables that luck ends. Never fill an income with 0; fill with a labelled estimate or keep the NaN and show the \"unknown\" band (week 3 S10: 466 loans)."}
```

**P13.** *(pd.cut)* `pd.cut` on `dpd` with the standard edges; prove it equals the file's `bucket` column for all 7 828 rows. Then the mean and median `dpd` of the late loans — which one goes in the report?

```task
{"id": "w05d2-p8", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code\n", "answer": 159, "dp": 0, "hint": "The check looks for the median dpd of the late loans.", "model": "edges, labels = [-1, 0, 30, 60, 90, np.inf], [\"0\", \"1-30\", \"31-60\", \"61-90\", \"90+\"]\nloans[\"bucket_pd\"] = pd.cut(loans[\"dpd\"], bins=edges, labels=labels)\nprint((loans[\"bucket_pd\"].astype(str) == loans[\"bucket\"]).all())   # True\nlate = loans.loc[loans[\"dpd\"] > 0, \"dpd\"]\nprint(round(late.mean()), late.median())                              # 246 159.0\n\nThe astype(str) matters: a category compared with text is otherwise a dtype mismatch. The 234 write-offs at 500–900 days drag the mean; report the median, or better the buckets."}
```

**P14.** *(SQL ↔ pandas)* Which pandas line returns what this SQL returns? `SELECT loan_id, outstanding FROM loans WHERE region = 'Nukus' AND dpd > 30 ORDER BY outstanding DESC LIMIT 5`

```task
{"id": "w05d2-l17", "kind": "choice", "options": ["loans[loans.region == \"Nukus\" and loans.dpd > 30][[\"loan_id\", \"outstanding\"]].sort_values(\"outstanding\").head(5)", "loans.loc[(loans[\"region\"] == \"Nukus\") & (loans[\"dpd\"] > 30), [\"loan_id\", \"outstanding\"]].sort_values(\"outstanding\", ascending=False).head(5)", "loans.loc[(loans[\"region\"] == \"Nukus\") & (loans[\"dpd\"] > 30), \"loan_id\", \"outstanding\"].nlargest(5)", "loans[[\"loan_id\", \"outstanding\"]].sort_values(\"outstanding\", ascending=False).head(5)"], "answer": 1, "explain": "WHERE → a mask with & and a bracket per condition; SELECT → the column list inside loc; ORDER BY … DESC → sort_values(ascending=False); LIMIT 5 → head(5). The first uses and (ValueError) and sorts the wrong way; the third passes the columns without a list; the fourth forgets the WHERE."}
```

**P15.** *(putting it together)* Build a frame `bucket · loans · outstanding · share_pct` (five rows, shares of total outstanding) and write it to `portfolio_buckets.csv` (in Jupyter, also to a sheet `buckets` of `portfolio.xlsx`, then open it and check the total).

```task
{"id": "w05d2-p10", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code\n", "answer": 2.55, "dp": 2, "hint": "The check looks for the 90+ share of outstanding, in % with two decimals.", "model": "summary = (loans.groupby(\"bucket\").agg(loans=(\"loan_id\", \"size\"), outstanding=(\"outstanding\", \"sum\"))\n                .reindex([\"0\", \"1-30\", \"31-60\", \"61-90\", \"90+\"]).reset_index())\nsummary[\"share_pct\"] = (100 * summary[\"outstanding\"] / summary[\"outstanding\"].sum()).round(2)\nsummary.to_csv(\"portfolio_buckets.csv\", index=False)\nprint(summary)\n\n0 → 7 429 / 197 486 207 578 / 94.62 % · 1–30 124 / 4 729 769 899 / 2.27 · 31–60 25 / 748 610 049 / 0.36 · 61–90 16 / 439 441 377 / 0.21 · 90+ 234 / 5 319 475 527 / 2.55 — week 3 S9's table. value_counts gives the loans column; the sums are tomorrow's groupby (used here once). index=False, or the sheet gets a 0…4 column Bekzod will ask about. Σ outstanding 208 723 504 430."}
```

> 🚀 **Stretch (optional, +5 XP).** **P16.** *(putting it together)* PAR30 by product and by region in one line each (Σ outstanding where `dpd > 30` ÷ Σ outstanding, per group — you may peek at tomorrow's `groupby`). Which region would you flag, and what makes a small region's rate fragile?

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
  {"type": "single", "q": "loans[loans[\"dpd\"] > 0 & loans[\"status\"] == \"active\"] raises an error. What is the fix?", "options": ["Replace & with and", "Put each condition in brackets: (loans[\"dpd\"] > 0) & (loans[\"status\"] == \"active\")", "Convert dpd to int", "Use iloc"], "answer": 1, "explain": "& binds tighter than > and ==, so 0 & loans[\"status\"] is evaluated first; one bracket per condition (→ section 1, 'Selecting rows')."},
  {"type": "single", "q": "After late = loans[loans[\"dpd\"] > 0], why can late.loc[0] fail while late.iloc[0] works?", "options": ["loc only works on columns", "loc looks for the index LABEL 0, which belonged to a loan that is not late; iloc takes POSITION 0", "iloc is faster", "The filter reset the index"], "answer": 1, "explain": "A filter keeps the original labels; reset_index(drop=True) makes positions and labels agree again (→ section 1, 'loc and iloc')."},
  {"type": "single", "q": "pd.cut(loans[\"dpd\"], [0, 30, 60, 90, np.inf]) gives 7 429 NaN. Why?", "options": ["np.inf is not allowed", "Intervals are right-closed: the first is (0, 30], which does not contain 0 — start the edges at -1", "dpd is text", "pd.cut needs labels="], "answer": 1, "explain": "The first edge must be below the smallest value (→ section 1, 'pd.cut')."},
  {"type": "single", "q": "loans[loans[\"dpd\"] > 90][\"flag\"] = 1 runs with only a warning, but loans has no flag column afterwards. Why?", "options": ["flag is a reserved word", "Chained indexing: the first [ ] returns a copy, the assignment lands on the copy — write loans.loc[loans[\"dpd\"] > 90, \"flag\"] = 1", "The mask is empty", "pandas needs inplace=True"], "answer": 1, "explain": "Assign through .loc with the mask and the column in one call (→ section 1, 'New columns')."}
]}
```

---

## 5. Company corner <span class="badge company">Buckets and PAR in pandas</span>

The portfolio's three risk numbers, from `loans_status.csv`, each a one-liner once the vocabulary is in place:

```python
edges, labels = [-1, 0, 30, 60, 90, np.inf], ["0", "1-30", "31-60", "61-90", "90+"]
loans["bucket_pd"] = pd.cut(loans["dpd"], bins=edges, labels=labels)
# 7429 · 124 · 25 · 16 · 234
buckets = loans["bucket_pd"].value_counts().sort_index()

# 208 723 504 430
total = loans["outstanding"].sum()
# 6 507 526 953 / total = 3.12 %
par30 = loans.loc[loans["dpd"] > 30, "outstanding"].sum() / total
# 5 319 475 527 / total = 2.55 %
npl90 = loans.loc[loans["dpd"] > 90, "outstanding"].sum() / total
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
  {"type": "single", "q": "This line raises an error. What is the fix?", "code": "loans[loans[\"dpd\"] > 0 & loans[\"status\"] == \"active\"]", "options": ["Write and instead of &", "Put brackets around each condition: (loans[\"dpd\"] > 0) & (loans[\"status\"] == \"active\")", "Convert dpd to int first", "Use loans.iloc instead"], "answer": 1, "explain": "& binds tighter than > and ==, so every condition needs its own brackets; and / or do not work on a whole Series (→ section 1, 'Selecting rows')."},
  {"type": "single", "q": "What happens to the 7 429 loans with dpd = 0?", "code": "pd.cut(loans[\"dpd\"], bins=[0, 30, 60, 90, np.inf])", "options": ["pd.cut raises an error", "They become NaN — intervals are right-closed, and (0, 30] does not contain 0", "They land in (0, 30]", "pd.cut creates a '0' bucket for them"], "answer": 1, "explain": "The first edge must be below the smallest value (-1 for DPD); np.inf closes the top (→ section 1, 'pd.cut')."},
  {"type": "number", "q": "On loans_status.csv, what does this give, in % with two decimals?", "code": "100 * loans.loc[loans[\"dpd\"] > 30, \"outstanding\"].sum() / loans[\"outstanding\"].sum()", "answer": 3.12, "tol": 0.01, "explain": "Outstanding of loans with dpd > 30 ÷ total outstanding = 6.51 bn of 208.7 bn = PAR30 (→ Company corner)."},
  {"type": "multi", "q": "Which statements about missing values in pandas are true?", "options": ["fillna(0) on monthly_income gives a lower, wrong mean", "mean() skips NaN, like SQL's AVG", "dropna() without subset= drops a row if any column is missing", "col == np.nan finds the missing rows", "count() counts every row, NaN included"], "answer": [0, 1, 2], "explain": "NaN is pandas' NULL: aggregates skip it, == never finds it (use isna()), and fillna(0) on an income is a decision that invents zero earners (→ section 1, 'Missing values')."},
  {"type": "single", "q": "You count September applications on applied_at, which holds a date and a time. Which filter is right?", "options": ["applied_at <= \"2026-09-30\"", "applied_at.between(\"2026-09-01\", \"2026-09-30\")", "(applied_at >= \"2026-09-01\") & (applied_at < \"2026-10-01\")", "applied_at.dt.month == 9"], "answer": 2, "explain": "between is inclusive and \"2026-09-30\" means midnight, so the 30th's afternoon is lost; dt.month == 9 also catches September 2025. Half-open, always (→ section 1, 'Selecting rows', P5)."},
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
