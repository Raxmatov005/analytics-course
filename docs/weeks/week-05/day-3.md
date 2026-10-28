# Week 5 · Day 3 — pandas II: groupby, merge and the cleaning pipeline

<span class="badge">Learn 60 min</span> <span class="badge">Detective 40 min</span> <span class="badge">Practice 45 min</span> <span class="badge hw">HW 5.1 due · HW 5.2 (due Day 5)</span> <span class="badge company">Company corner</span>

> STORY **Wednesday, 9:05.** Nilufar, risk (*риск-аналитик*), with Jasur behind her. *"Your Power Query pipeline works — on my laptop. Jasur's server has no Excel. He wants the same cleaning as a script he can schedule: `customers_dirty.csv` and `payments_dirty.csv` in, 6 000 people and 52 850 payments out, every Monday at 6:00, and a DPD per loan computed from the schedule so his model has a target."* Jasur: *"And I want to see the asserts. A pipeline that cannot prove its own counts is a pipeline I cannot trust at 6:00 in the morning."*

## Today in 3 lines

- **`groupby` / `agg`** is `GROUP BY` with named outputs; **`transform`** is the window function (a group total next to every row); **`merge`** is the join, with `how=`, `validate=` and `indicator=` as the safety belts you never had in SQL; `concat` is `UNION ALL`; `pivot_table` is the cross-tab.
- Cleaning is the same three repairs as week 4 — text (`.str.strip().str.lower()`, `replace`), dates (`to_datetime(errors="coerce")` **plus the business rule**), duplicates (`duplicated` / `drop_duplicates(subset=, keep=)` after a sort) — written once, checked with `assert`, re-run forever.
- You can reproduce every week-4 cleaning count in pandas — duplicate people (and the name-key trap), impossible birth dates, duplicate payments, method spellings — and compute **DPD for every loan** from `installments.csv` + payments, checked against the SQL column loan by loan.

---

## 1. Learn — several tables, one notebook

Every concept below has the same five parts: what it is, how to write it (a box you can run), when you use it, the trap, and a small task. Run the boxes from top to bottom — they all use the frames of the first box.

### Today's frames

Run this block first (▶ Run); every block below uses its five frames. `pay` is already de-duplicated and its `method` repaired — the two repairs you learn further down — so the numbers in the comments match the clean book; `pay_raw` keeps the file as recorded.

```python
import pandas as pd
import numpy as np
AS_OF = pd.Timestamp("2026-10-01")
# 52 875 rows, as recorded
pay_raw = pd.read_csv("../excel/payments_dirty.csv", parse_dates=["paid_at"])
pay = (pay_raw.sort_values("payment_id")
              # 52 850 — the dedup, explained below
              .drop_duplicates(subset=["installment_id", "paid_at", "amount"])
              .assign(method=lambda d: d["method"].str.strip().str.lower().replace({"bank transfer": "transfer"})))
# 6 040 rows, dirty on purpose
cust = pd.read_csv("../excel/customers_dirty.csv")
# 92 193 instalments
inst = pd.read_csv("../excel/installments.csv", parse_dates=["due_date"])
# 7 828 loans
loans = pd.read_csv("../excel/loans_status.csv", parse_dates=["disbursed_at"])
len(pay_raw), len(pay), len(cust), len(inst), len(loans)
```

The box shows `(52875, 52850, 6040, 92193, 7828)`: the five row counts every block below starts from.

### groupby — one aggregate per group

**What it is.** `groupby` (*группировка*) splits a frame into groups by the values of a **key** column, computes one number per group, and puts the results together — one row per group. It is week 2's `GROUP BY`.

**How to write it.**

```python
by_region = pay.groupby("region")["amount"].sum()  # key → column → aggregate
by_region.sort_values(ascending=False).head()
```

| region | amount |
|---|---|
| Tashkent | 102 605 410 110 |
| Fergana | 34 437 790 032 |
| Samarkand | 27 576 625 156 |
| Andijan | 24 138 491 453 |
| Namangan | 21 044 366 065 |

Eight regions come back, one row each; Tashkent's customers paid 102.6 bn — three times Fergana's 34.4 bn.

The three steps, drawn on four payments:

```pic
{"id": "w05d3-pic1", "title": "Split by the key, sum each group, combine", "caption": "Each colour is one group. Tashkent's two payments add up to 400, Fergana's to 250, and the result has one row per region. The key becomes the index, sorted: Fergana before Tashkent.", "tables": [{"id": "src", "name": "pay", "cols": ["region", "amount"], "rows": [["Tashkent", 100], ["Fergana", 200], ["Tashkent", 300], ["Fergana", 50]], "tone": ["a", "b", "a", "b"]}, {"id": "res", "name": "result", "cols": ["region", "amount"], "rows": [["Fergana", 250], ["Tashkent", 400]], "tone": ["b", "a"], "tags": {"region": "index"}, "via": "groupby(\"region\") → sum"}]}
```

The functions you can name: `sum`, `mean`, `median`, `min`, `max`, `count`, `size`, `nunique`, `first`. The **key becomes the index** of the result; `.reset_index()` turns it back into a column.

**When you use it.**
- Any "per X" question: paid per region, loans per branch, outstanding per product.
- Before a chart: one bar per group.

> ⚠️ **Watch out.** `groupby` drops the rows whose key is NaN — silently. Group customers by a column with blanks and the blank group is simply missing; pass `dropna=False` to see it as a row (week 2's NULL band again). On a `category` key, pass `observed=True`, or pandas adds empty rows for categories with no data.

**Your turn.**

```game
{"type": "cloze", "id": "w05d3-g1", "title": "Total paid per region", "text": "pay.groupby({{0}})[{{1}}].{{2}}()     # Σ amount per region", "blanks": [["\"region\""], ["\"amount\""], ["sum"]], "distractors": ["\"payment_id\"", "transform", "mean"]}
```

### agg — several aggregates with names

**What it is.** `.agg(name=("column", "function"))` computes **several** numbers per group in one call and names each output. This is **named aggregation** (*именованная агрегация*) — `SUM(amount) AS total` with the `AS` built in.

**How to write it.**

```python
by_region = pay.groupby("region").agg(payments=("payment_id", "size"),
                                      total=("amount", "sum"),
                                      avg=("amount", "mean"))
by_region.sort_values("total", ascending=False).round(0).head(3)
```

| region | payments | total | avg |
|---|---|---|---|
| Tashkent | 20 437 | 102 605 410 110 | 5 020 571 |
| Fergana | 6 334 | 34 437 790 032 | 5 436 973 |
| Samarkand | 6 037 | 27 576 625 156 | 4 567 935 |

Tashkent has 20 437 payments averaging 5.02 m; Fergana has a third as many, but each is larger — 5.44 m.

**`size` vs `count`.** `size` counts rows; `count` counts non-empty values of the column — `COUNT(*)` against `COUNT(col)`:

```python
cust.groupby("segment").agg(customers=("customer_id", "size"), with_income=("monthly_income", "count"))
```

| segment | customers | with_income |
|---|---|---|
| affluent | 1 204 | 1 132 |
| mass | 3 585 | 3 377 |
| sme | 1 251 | 1 175 |

3 585 mass customers, but only 3 377 of them have an income on file: the 208 missing incomes are the difference.

**When you use it.**
- A summary table with several columns per group: count, total, average.
- Any time you would write two `groupby` lines on the same key.

> ⚠️ **Watch out.** `"count"` skips NaN; `"size"` does not. Count customers with `size` (or `count` on the id); count *answers* with `count` on the column. Mixing them makes a share that silently leaves the blanks out.

**Your turn.** How many affluent customers have no income on file?

```task
{"id": "w05d3-l1", "kind": "python", "starter": "import pandas as pd\nc3 = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# your code: per segment, rows (size) and incomes on file (count of monthly_income); print the gap for affluent\n", "answer": 72, "dp": 0, "hint": "g = c3.groupby(\"segment\").agg(n=(\"customer_id\", \"size\"), inc=(\"monthly_income\", \"count\")); then g[\"n\"] - g[\"inc\"].", "model": "g = c3.groupby(\"segment\").agg(n=(\"customer_id\", \"size\"), inc=(\"monthly_income\", \"count\"))\nprint(g[\"n\"] - g[\"inc\"])     # affluent 72 · mass 208 · sme 76\n\n72 + 208 + 76 = 356 — the missing incomes of the whole file."}
```

### groupby on two keys — and unstack

**What it is.** A list of keys groups by every **combination**: `groupby(["product", "method"])` makes one group per product-and-method pair. The result has a two-level index (a `MultiIndex`); `.unstack()` moves the last key into columns, which turns the list into a cross-tab.

**How to write it.**

```python
# one row per pair: 5 × 5 = 25 rows
pm = pay.groupby(["product", "method"]).size()
# the second key becomes the columns
pm.unstack(fill_value=0)
```

| product | card | cash | click | payme | transfer |
|---|---|---|---|---|---|
| Auto loan | 1 563 | 799 | 766 | 784 | 776 |
| Buy now pay later | 2 762 | 1 411 | 1 356 | 1 419 | 1 426 |
| Consumer loan | 7 154 | 3 596 | 3 556 | 3 667 | 3 501 |
| Micro loan | 3 432 | 1 648 | 1 718 | 1 626 | 1 668 |
| Small business loan | 2 701 | 1 334 | 1 390 | 1 401 | 1 396 |

25 cells, one per product and method; in every row card takes about a third and the four others a sixth each — the method does not depend on the product.

`as_index=False` (or `.reset_index()`) gives the keys back as ordinary columns — the shape you need before a `merge` or a chart.

**When you use it.**
- "Per X and Y": loans per region and status, payments per product and method.
- A cross-tab of counts or sums (`unstack`), or the long input of a seaborn chart (no `unstack`).

> ⚠️ **Watch out.** `unstack()` without `fill_value=0` writes NaN where a pair has no rows (no 61–90 SME loan, say). A NaN in a count table means "zero", so fill it.

**Your turn.** How many loans in Tashkent are written off?

```task
{"id": "w05d3-l2", "kind": "python", "starter": "import pandas as pd\nls3 = pd.read_csv(\"../excel/loans_status.csv\")\n\n# your code: loans per region and status as a cross-tab; print Tashkent's row\n", "answer": 73, "dp": 0, "hint": "ls3.groupby([\"region\", \"status\"]).size().unstack(fill_value=0).loc[\"Tashkent\"]", "model": "t = ls3.groupby([\"region\", \"status\"]).size().unstack(fill_value=0)\nprint(t.loc[\"Tashkent\"])     # active 1279 · closed 1650 · default 18 · written_off 73\n\n73 written-off loans out of Tashkent's 3 020; Termez has no default loan at all, so its cell is 0 only because of fill_value=0."}
```

### transform — the group's number on every row

**What it is.** `transform` computes a group's number and writes it **next to every row of the group**. The result has as many rows as the frame. It is week 3's window function `SUM(amount) OVER (PARTITION BY loan_id)`.

```pic
{"id": "w05d3-pic2", "title": "transform writes the group's total on every row", "caption": "Loan 1's 18 payments add up to 31 350 600, loan 2's 9 payments to 25 119 000. Each total sits on every row of its loan (same colour), so the frame keeps all its rows — `agg` would return one row per loan.", "tables": [{"id": "p", "name": "pay", "cols": ["payment_id", "loan_id", "amount", "loan_total"], "rows": [[1, 1, "1 741 700", "31 350 600"], [2, 1, "1 741 700", "31 350 600"], [19, 2, "2 791 000", "25 119 000"], [20, 2, "2 791 000", "25 119 000"]], "new": ["loan_total"], "tone": ["a", "a", "b", "b"], "more": "… more rows"}]}
```

**How to write it.**

```python
# SUM(amount) OVER (PARTITION BY loan_id)
pay["loan_total"] = pay.groupby("loan_id")["amount"].transform("sum")
# each payment's share of its loan's payments
pay["share"] = pay["amount"] / pay["loan_total"]
pay[["payment_id", "loan_id", "amount", "loan_total", "share"]].head(3).round(4)
```

| payment_id | loan_id | amount | loan_total | share |
|---|---|---|---|---|
| 1 | 1 | 1 741 700 | 31 350 600 | 0.0556 |
| 2 | 1 | 1 741 700 | 31 350 600 | 0.0556 |
| 3 | 1 | 1 741 700 | 31 350 600 | 0.0556 |

Loan 1's eighteen payments add up to 31 350 600, and that total sits on each of the 18 rows — so each payment is 1/18 of the loan's money (0.0556).

The same pattern answers "compared with my group": the segment's median income next to each customer, then a comparison on the row.

```python
cust["seg_median"] = cust.groupby("segment")["monthly_income"].transform("median")
# raw customers_dirty.csv: 2 841 earn above their segment's median
(cust["monthly_income"] > cust["seg_median"]).sum()
```

| | `agg` | `transform` |
|---|---|---|
| rows back | one per group | one per original row |
| SQL | `GROUP BY` | `… OVER (PARTITION BY …)` |
| use for | a summary table | a share of the group, a gap from the group mean, a rank inside the group |

`groupby(key).cumsum()` is a running total inside each group; `groupby(key).cumcount()` numbers the rows 0, 1, 2 … — `ROW_NUMBER() OVER (PARTITION BY key)`.

**When you use it.**
- Shares of a group total, a difference from the group average, a flag "above my segment".
- Ask "how many rows do I want back?" — the frame's count → `transform`; one per group → `agg`.

> ⚠️ **Watch out.** Assigning an `agg` result as a column (`pay["t"] = pay.groupby("loan_id")["amount"].sum()`) does not repeat it per row: pandas aligns it on the index, so most rows get NaN or a wrong loan's total. A per-row column needs `transform`.

**Your turn.** How many loans have more outstanding than the average loan of their own product?

```task
{"id": "w05d3-l3", "kind": "python", "starter": "import pandas as pd\nls3 = pd.read_csv(\"../excel/loans_status.csv\")\n\n# your code: the product's mean outstanding on every row (transform), then count the loans above it\n", "answer": 2286, "dp": 0, "hint": "ls3[\"prod_avg\"] = ls3.groupby(\"product\")[\"outstanding\"].transform(\"mean\"); then (ls3[\"outstanding\"] > ls3[\"prod_avg\"]).sum().", "model": "ls3[\"prod_avg\"] = ls3.groupby(\"product\")[\"outstanding\"].transform(\"mean\")\nprint((ls3[\"outstanding\"] > ls3[\"prod_avg\"]).sum())     # 2286\n\n2 286 of 7 828 loans — fewer than a third, because closed loans (outstanding 0) pull every product's mean down."}
```

### value_counts — the shortcut for counting

**What it is.** `col.value_counts()` counts the rows per value of one column, largest first. It is `groupby(col).size()` sorted — the most common `GROUP BY … COUNT(*)` in one word. `normalize=True` gives shares instead of counts.

**How to write it.**

```python
counts = pay["method"].value_counts()
shares = pay["method"].value_counts(normalize=True).mul(100).round(2)
pd.DataFrame({"payments": counts, "share_pct": shares})
```

| method | payments | share_pct |
|---|---|---|
| card | 17 612 | 33.32 |
| payme | 8 897 | 16.83 |
| cash | 8 788 | 16.63 |
| click | 8 786 | 16.62 |
| transfer | 8 767 | 16.59 |

Card carries a third of the 52 850 payments (17 612, 33.32 %); the other four methods split the rest almost evenly.

| you want | write |
|---|---|
| counts, largest first | `col.value_counts()` |
| shares | `col.value_counts(normalize=True)` |
| in the natural order (buckets) | `col.value_counts().sort_index()` |
| the blanks as a row | `col.value_counts(dropna=False)` |
| how many distinct values | `col.nunique()` |

**When you use it.**
- The first look at any text column: which values, how often, which spellings.
- A one-column count; for two columns or any other aggregate, `groupby`.

> ⚠️ **Watch out.** `value_counts()` hides NaN by default — 356 missing incomes would simply not be a row. Add `dropna=False` whenever blanks are possible.

**Your turn.** What share of loans is grade D, in % with two decimals?

```task
{"id": "w05d3-l4", "kind": "python", "starter": "import pandas as pd\nls3 = pd.read_csv(\"../excel/loans_status.csv\")\n\n# your code: the share of each grade, in %\n", "answer": 4.33, "dp": 2, "hint": "ls3[\"grade\"].value_counts(normalize=True).mul(100).round(2)", "model": "print(ls3[\"grade\"].value_counts(normalize=True).mul(100).round(2))\n# B 43.48 · C 28.92 · A 23.26 · D 4.33\n\n339 of 7 828 loans are grade D: 4.33 %."}
```

### merge — the join, and its four how=

**What it is.** `left.merge(right, on="key", how=...)` is the **join** (*соединение*): it puts the rows of two frames side by side where the key matches. `how=` decides what happens to a row with **no partner** — exactly week 2's INNER / LEFT / RIGHT / FULL.

```pic
{"id": "w05d3-pic3", "title": "how=\"left\" keeps every left row; no partner gives NaN", "caption": "Instalments 2 and 3 find a payment (same colour). Instalment 1 has none and stays, with **NaN** in `paid`; the stray payment 4 has no left row, so the left merge drops it (struck through).", "tables": [{"id": "sched", "name": "sched", "cols": ["installment_id", "total_due"], "rows": [[1, 100], [2, 100], [3, 100]]}, {"id": "got", "name": "got", "cols": ["installment_id", "paid"], "rows": [[2, 100], [3, 60], [4, 50]], "drop": [2]}, {"id": "res", "name": "result", "cols": ["installment_id", "total_due", "paid"], "rows": [[1, 100, "NaN"], [2, 100, 100], [3, 100, 60]], "cells": [[0, "paid"]], "via": "merge(got, how=\"left\")"}], "links": [{"from": ["sched", 1, "installment_id"], "to": ["got", 0, "installment_id"]}, {"from": ["sched", 2, "installment_id"], "to": ["got", 1, "installment_id"]}]}
```

**How to write it.** Two tiny frames first: three instalments, and payments for instalments 2, 3 and a stray 4.

```python
sched = pd.DataFrame({"installment_id": [1, 2, 3], "total_due": [100, 100, 100]})
got = pd.DataFrame({"installment_id": [2, 3, 4], "paid": [100, 60, 50]})
for how in ["inner", "left", "right", "outer"]:
    print(how, "\n", sched.merge(got, on="installment_id", how=how), "\n")
```

| `sched` | installment_id | total_due |
|---|---|---|
| | 1 | 100 |
| | 2 | 100 |
| | 3 | 100 |

| `got` | installment_id | paid |
|---|---|---|
| | 2 | 100 |
| | 3 | 60 |
| | 4 | 50 |

| `how=` | installment_id | total_due | paid | rows |
|---|---|---|---|---|
| `"inner"` (default) | 2, 3 | 100, 100 | 100, 60 | 2 — only matches |
| `"left"` | 1, 2, 3 | 100, 100, 100 | **NaN**, 100, 60 | 3 — every left row |
| `"right"` | 2, 3, 4 | 100, 100, **NaN** | 100, 60, 50 | 3 — every right row |
| `"outer"` | 1, 2, 3, 4 | 100, 100, 100, NaN | NaN, 100, 60, 50 | 4 — everything |

Instalment 1 has no payment: only `left` and `outer` keep it, with NaN in `paid`. The stray payment 4 survives only in `right` and `outer`.

On the real data:

```python
paid = pay[pay["paid_at"] <= AS_OF].groupby("installment_id", as_index=False).agg(paid=("amount", "sum"))
len(paid), len(inst.merge(paid, on="installment_id")), len(inst.merge(paid, on="installment_id", how="left"))
```

The box shows `(52826, 52826, 92193)`: 52 826 instalments have a payment; the inner merge keeps only them, the left merge keeps all 92 193 instalments.

| `how=` | SQL (week 2) | Power Query (week 4) |
|---|---|---|
| `"inner"` (default) | `INNER JOIN` | Inner |
| `"left"` | `LEFT JOIN` | Left Outer |
| `"right"` | `RIGHT JOIN` | Right Outer |
| `"outer"` | `FULL OUTER JOIN` | Full Outer |

**When you use it.**
- Columns from two tables in one row: the instalment with what was paid on it, the payment with its loan's product.
- `how="left"` whenever the left table is "the list that must be complete" — all instalments, all loans.

> ⚠️ **Watch out.** The default is `how="inner"`, **not** `left`. A forgotten `how=` drops every instalment that has no payment — exactly the unpaid ones DPD is about — and nothing warns you. Write `how=` on every merge and count the rows after it.

**Your turn.** With a left merge of `paid` onto `inst`, how many instalments have no payment at all through the as-of?

```task
{"id": "w05d3-l5", "kind": "python", "starter": "import pandas as pd\nAS_OF = pd.Timestamp(\"2026-10-01\")\ni3 = pd.read_csv(\"../excel/installments.csv\", parse_dates=[\"due_date\"])\np3 = (pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\n        .sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"]))\npd3 = p3[p3[\"paid_at\"] <= AS_OF].groupby(\"installment_id\", as_index=False).agg(paid=(\"amount\", \"sum\"))\n\n# your code: left-merge pd3 onto i3, then count the rows where paid is NaN\n", "answer": 39367, "dp": 0, "hint": "m = i3.merge(pd3, on=\"installment_id\", how=\"left\"); m[\"paid\"].isna().sum()", "model": "m = i3.merge(pd3, on=\"installment_id\", how=\"left\")\nprint(len(m), m[\"paid\"].isna().sum())     # 92193 39367\n\n39 367 instalments with no payment — most of them are simply not due yet (the schedules run to 2030)."}
```

### Merge keys — on, left_on / right_on, suffixes

**What it is.** The **key** is the column that must match. `on="loan_id"` when both frames call it the same; `left_on=` / `right_on=` when the names differ; `on=["a", "b"]` for a key of two columns. Columns that exist on both sides and are not the key get the **suffixes** `_x` / `_y`.

**How to write it.**

```python
prod = pd.DataFrame({"name": ["Micro loan", "Consumer loan", "Buy now pay later", "Auto loan", "Small business loan"],
                     # products.annual_rate
                     "annual_rate": [0.42, 0.30, 0.0, 0.24, 0.26]})
# different names on each side
lr = loans.merge(prod, left_on="product", right_on="name", how="left")
print(len(lr), round(lr["annual_rate"].mean(), 4))
both = pay.merge(loans[["loan_id", "product", "region"]], on="loan_id", how="left")
print([c for c in both.columns if c[:7] in ("product", "region_")])
```

```text
7828 0.2738
['product_x', 'region_x', 'product_y', 'region_y']
```

Every one of the 7 828 loans found its product's rate, and the average loan costs 27.38 % a year. Payments and loans both carry `product` and `region`, so the merge keeps both copies as `_x` (left) and `_y` (right).

| you have | write |
|---|---|
| the same key name on both sides | `on="loan_id"` |
| different names | `left_on="product", right_on="name"` |
| a key of two columns | `on=["loan_id", "installment_no"]` |
| clashing column names | `suffixes=("", "_loan")` — keep the left name, mark the right |

**When you use it.**
- Every merge: name the key on purpose, never rely on pandas finding a shared column.
- `suffixes=` whenever both frames carry the same descriptive columns.

> ⚠️ **Watch out.** A key that looks the same but has a different type does not match: `loan_id` as `int64` on one side and as text on the other raises `ValueError: You are trying to merge on int64 and object columns`. Check `dtypes` and convert one side before the merge.

**Your turn.** The average annual rate over all 7 828 loans, in % with two decimals.

```task
{"id": "w05d3-l6", "kind": "python", "starter": "import pandas as pd\nls3 = pd.read_csv(\"../excel/loans_status.csv\")\nrates = pd.DataFrame({\"name\": [\"Micro loan\", \"Consumer loan\", \"Buy now pay later\", \"Auto loan\", \"Small business loan\"],\n                      \"annual_rate\": [0.42, 0.30, 0.0, 0.24, 0.26]})\n\n# your code: merge the rate onto every loan (the key has different names), then the mean rate in %\n", "answer": 27.38, "dp": 2, "hint": "ls3.merge(rates, left_on=\"product\", right_on=\"name\", how=\"left\")[\"annual_rate\"].mean() * 100", "model": "m = ls3.merge(rates, left_on=\"product\", right_on=\"name\", how=\"left\")\nprint(len(m), round(100 * m[\"annual_rate\"].mean(), 2))     # 7828 27.38\n\nThe row count stays 7 828: each loan finds exactly one product."}
```

### validate= and indicator= — the safety belts

**What it is.** Two arguments SQL never gave you. **`validate=`** states the grain you expect — `"1:1"`, `"m:1"` or `"1:m"` — and raises `MergeError` if a key is not unique on the side you promised. **`indicator=True`** adds a column `_merge` that says where each row came from: `both`, `left_only` or `right_only`.

**How to write it.**

```python
m = inst.merge(paid, on="installment_id", how="left", validate="1:1", indicator=True)
m["_merge"].value_counts()
```

| _merge | count |
|---|---|
| both | 52 826 |
| left_only | 39 367 |
| right_only | 0 |

52 826 instalments matched a payment total, 39 367 had none, and no payment total pointed at an instalment that does not exist. `validate="1:1"` passed: each instalment appears once on each side.

The **anti-join** is one filter on that column: `m[m["_merge"] == "left_only"]` — the instalments with no payment, week 2's `LEFT JOIN … WHERE right IS NULL`.

| argument | what it checks | the week-2 mistake it stops |
|---|---|---|
| `validate="m:1"` | the right key is unique | the fan-out: Σ principal ×24.7 after joining instalments |
| `validate="1:1"` | both keys are unique | a duplicate row on either side |
| `indicator=True` | where each row came from | an anti-join written by hand, or rows lost without a trace |

**When you use it.**
- `validate=` on every merge whose grain you "know" — the merge then proves it.
- `indicator=True` when you need the rows without a partner, or to check that none exist.

> ⚠️ **Watch out.** `validate=` costs nothing and is skipped by everyone. Without it, a duplicate key on the right multiplies rows and every sum after it is too big — with no error. Write the grain you believe; a `MergeError` is a free lesson about the data.

**Your turn.** You merge loans onto payments: `pay.merge(loans, on="loan_id", how="left", validate=…)`. Which grain is true?

```task
{"id": "w05d3-l7", "kind": "choice", "options": ["\"1:1\" — one payment per loan", "\"m:1\" — many payments per loan, each loan once in loans", "\"1:m\" — one payment, many loans", "No validate is possible on this merge"], "answer": 1, "explain": "A loan has many payments (left side repeats loan_id), and loans has one row per loan (right side unique): m:1. \"1:1\" would raise MergeError on the first loan with two payments."}
```

### concat — stacking frames (UNION ALL)

**What it is.** `pd.concat([a, b])` stacks frames **on top of each other**: the rows of `a`, then the rows of `b`. Columns are matched **by name**. It is SQL's `UNION ALL` and week 4's Append.

**How to write it.**

```python
a = pay[pay["region"] == "Tashkent"].assign(source="tashkent")
b = pay[pay["region"] != "Tashkent"].assign(source="rest")
u = pd.concat([a, b], ignore_index=True)  # renumber the index 0 … n-1
len(a), len(b), len(u)
```

| frame | rows |
|---|---|
| `a` (Tashkent) | 20 437 |
| `b` (the rest) | 32 413 |
| `pd.concat([a, b])` | 52 850 |

20 437 + 32 413 = 52 850: the two halves stack back into the whole clean book. The `source` column records which half each row came from.

| | `concat` | `merge` |
|---|---|---|
| puts frames | on top of each other (rows) | side by side (columns) |
| matches | columns by name | rows by a key |
| SQL | `UNION ALL` | `JOIN` |

**When you use it.**
- Twelve monthly files into one frame; this month's extract under last month's.
- Add a `source` column first, so every row remembers its file.

> ⚠️ **Watch out.** A column spelt differently in one frame (`Amount` vs `amount`) does not raise an error: the result gets **two** columns, each NaN in the other frame's rows. Check `set(a.columns) == set(b.columns)` before every concat.

**Your turn.**

```game
{"type": "match", "id": "w05d3-g2", "title": "Which join is it?", "pairs": [["how=\"inner\"", "INNER JOIN — only the matches"], ["how=\"left\"", "LEFT JOIN — every left row, NaN where no match"], ["how=\"outer\"", "FULL OUTER JOIN — everything from both sides"], ["indicator=True + \"left_only\"", "the anti-join: LEFT JOIN … WHERE right IS NULL"], ["validate=\"m:1\"", "an error if the right-hand key is not unique"], ["pd.concat([a, b])", "UNION ALL — stack rows, match columns by name"]]}
```

### pivot_table — the cross-tab (and pivot / melt)

**What it is.** `pd.pivot_table` is Excel's PivotTable: values of one column become the rows (`index=`), values of another the columns (`columns=`), and each cell is an aggregate (`aggfunc=`) of a third (`values=`). `margins=True` adds the totals row and column (*сводная таблица*).

**How to write it.**

```python
pd.pivot_table(loans, index="bucket", columns="product", values="loan_id",
               aggfunc="count", fill_value=0, margins=True)
```

| bucket | Auto loan | Buy now pay later | Consumer loan | Micro loan | Small business loan | All |
|---|---|---|---|---|---|---|
| 0 | 362 | 1 505 | 2 280 | 2 548 | 734 | 7 429 |
| 1-30 | 14 | 16 | 50 | 28 | 16 | 124 |
| 61-90 | 2 | 2 | 4 | 8 | 0 | 16 |
| 90+ | 10 | 42 | 77 | 76 | 29 | 234 |
| All | 391 | 1 569 | 2 418 | 2 669 | 781 | 7 828 |

(The 31-60 row — 25 loans — is left out of the picture.) Of the 234 loans in 90+, 77 are Consumer and 76 Micro; the SME 61-90 cell is 0 only because `fill_value=0` filled an empty pair.

Two relatives:

| call | does | use for |
|---|---|---|
| `pd.crosstab(a, b)` | counts only, shorter | grade × bucket counts |
| `df.pivot(index=, columns=, values=)` | reshape long → wide, **no** aggregation | `monthly_disbursements.csv`: 170 rows → 34 months × 5 products |
| `df.melt(id_vars=, var_name=, value_name=)` | wide → long | the shape seaborn wants (Day 4) |

**When you use it.**
- A two-way table of counts, sums or means for a reader: bucket × product, region × status.
- `pivot` / `melt` when the data is already one value per cell and only the shape is wrong.

> ⚠️ **Watch out.** `pivot` (without `_table`) raises `ValueError: Index contains duplicate entries` when two rows share a row-and-column pair — it cannot add them up. When pairs repeat, you need `pivot_table` with an `aggfunc`.

**Your turn.** Outstanding (sum) by region × product: how much SME outstanding sits in Tashkent?

```task
{"id": "w05d3-l8", "kind": "python", "starter": "import pandas as pd\nls3 = pd.read_csv(\"../excel/loans_status.csv\")\n\n# your code: pivot_table of outstanding, sum, region × product; print Tashkent's SME cell\n", "answer": 47901694555, "dp": 0, "hint": "pt = pd.pivot_table(ls3, index=\"region\", columns=\"product\", values=\"outstanding\", aggfunc=\"sum\", fill_value=0); pt.loc[\"Tashkent\", \"Small business loan\"]", "model": "pt = pd.pivot_table(ls3, index=\"region\", columns=\"product\", values=\"outstanding\", aggfunc=\"sum\", fill_value=0)\nprint(pt.loc[\"Tashkent\", \"Small business loan\"])     # 47901694555\n\n47.9 bn — more than a fifth of the whole 208.7 bn book sits in Tashkent's SME loans."}
```

### Text repair with .str — strip, lower, replace

**What it is.** `col.str.<method>` applies a string method to **every value** of a text column and leaves NaN alone: `.str.strip()`, `.str.lower()`, `.str.title()`, `.str.contains()`, `.str.startswith()`, `.str.replace()`. `col.replace({old: new})` swaps **whole values**.

**How to write it.**

```python
raw = pay_raw["method"].value_counts()
clean = pay_raw["method"].str.strip().str.lower().replace({"bank transfer": "transfer"}).value_counts()
raw.head(10), clean
```

| raw spelling | rows | | clean | rows |
|---|---|---|---|---|
| card | 17 564 | | card | 17 621 |
| Card | 57 | | payme | 8 900 |
| Click | 36 | | cash | 8 790 |
| PayMe | 30 | | click | 8 790 |
| `CASH ` | 30 | | transfer | 8 774 |
| bank transfer | 27 | | | |

Ten raw spellings — 180 rows outside the five clean ones — collapse into five methods. (These counts are on the raw 52 875 rows; the de-duplicated `pay` has card 17 612.)

| week 4 (Excel / Power Query) | pandas |
|---|---|
| `TRIM` | `.str.strip()` |
| `LOWER` / `PROPER` | `.str.lower()` / `.str.title()` |
| `SUBSTITUTE` inside the text | `.str.replace("a", "b")` |
| Replace Values (whole cell) | `.replace({"bank transfer": "transfer"})` |
| text contains | `.str.contains("Tashkent")` |

**When you use it.**
- Any text key before you group or merge on it: spaces and case split one group into several.
- Names for a report: `.str.strip().str.title()`.

> ⚠️ **Watch out.** Chain in the order of the change log: strip → lower → replace. Replacing `"bank transfer"` before lowering misses `"Bank Transfer"`; lowering before stripping is fine, but `"cash "` with its space still is not `"cash"` until you strip.

**Your turn.** How many raw payment rows have a method that is not one of the five clean spellings?

```task
{"id": "w05d3-l9", "kind": "python", "starter": "import pandas as pd\npr3 = pd.read_csv(\"../excel/payments_dirty.csv\")\nfive = [\"card\", \"payme\", \"cash\", \"click\", \"transfer\"]\n\n# your code: count the rows whose method is not in five; then show that after strip/lower/replace none is left\n", "answer": 180, "dp": 0, "hint": "(~pr3[\"method\"].isin(five)).sum(); then the same test on the cleaned column.", "model": "print((~pr3[\"method\"].isin(five)).sum())     # 180\nclean = pr3[\"method\"].str.strip().str.lower().replace({\"bank transfer\": \"transfer\"})\nprint((~clean.isin(five)).sum())             # 0"}
```

### Dates that lie — to_datetime(errors=) and the business rule

**What it is.** `pd.to_datetime(col, errors="coerce")` turns text into dates and writes **NaT** (*Not a Time*, the date NULL) wherever a value cannot be parsed — instead of stopping. Parsing checks the **syntax**. Whether a date is possible — not in the future, not before 1920 — is a **business rule** you write yourself.

**How to write it.**

```python
# unparseable → NaT (not a crash)
cust["birth_date"] = pd.to_datetime(cust["birth_date"], errors="coerce")
# the business rule finds what parsing cannot
bad = (cust["birth_date"] > AS_OF) | (cust["birth_date"] < "1920-01-01")
cust["birth_date_invalid"] = bad
# keep the date where valid, NaT where not
cust["birth_date_clean"] = cust["birth_date"].where(~bad)
print(cust["birth_date"].isna().sum(), bad.sum())
cust.loc[bad, ["customer_id", "birth_date"]].head()
```

| customer_id | birth_date |
|---|---|
| 927 | 2031-04-12 |
| 957 | 1900-01-01 |
| 964 | 2027-02-28 |
| 1020 | 1900-01-01 |
| 2338 | 2031-04-12 |

Parsing finds 0 bad values — every birth date is a valid ISO date — but the rule finds 7: three in 2031, one in 2027, three on 1900-01-01 (two more, 2934 and 3380, are below the five shown).

| `errors=` | on `"n/a"` or `"2026-02-31"` |
|---|---|
| `"raise"` (default) | stops with an error |
| `"coerce"` | NaT — count them with `.isna().sum()` |

`.where(cond)` keeps the values where the condition holds and blanks the rest; `np.where(cond, a, b)` is the two-sided `IF`.

**When you use it.**
- Every date column from a file you did not make: parse with `coerce`, count the NaT, then apply the rule.
- Flag and blank a bad date; never replace it with a plausible one.

> ⚠️ **Watch out.** `errors="coerce"` protects you from `"n/a"` and `"31.02.2026"`; it does **not** protect you from `2031-04-12`, a perfectly parseable lie. Parsing is syntax; validity is a rule, and the rule is yours to write.

**Your turn.** The average age of the customers whose birth date is valid, on the as-of, in years with one decimal.

```task
{"id": "w05d3-l10", "kind": "python", "starter": "import pandas as pd\nAS_OF = pd.Timestamp(\"2026-10-01\")\nc3 = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# your code: parse birth_date (coerce), keep the valid ones (not after AS_OF, not before 1920), age = days / 365.25\n", "answer": 45.7, "dp": 1, "hint": "b = pd.to_datetime(c3[\"birth_date\"], errors=\"coerce\"); ok = (b <= AS_OF) & (b >= \"1920-01-01\"); ((AS_OF - b[ok]).dt.days / 365.25).mean()", "model": "b = pd.to_datetime(c3[\"birth_date\"], errors=\"coerce\")\nok = (b <= AS_OF) & (b >= \"1920-01-01\")\nprint(ok.sum(), round(((AS_OF - b[ok]).dt.days / 365.25).mean(), 1))     # 6033 45.7\n\nWith the 7 impossible dates left in, the 1900 birthdays add 126-year-olds and the 2031 ones negative ages — the mean moves for no real reason."}
```

### Duplicates — find, look, then drop

**What it is.** `duplicated(subset=, keep=)` marks the rows that repeat an earlier row on the **key** columns of `subset`. `drop_duplicates(subset=, keep=)` removes them. `keep="first"` keeps the first row of each group **in the current order** — so the sort before it decides which row survives.

**How to write it.**

```python
key = ["installment_id", "paid_at", "amount"]
# True on ALL members of a group
dup_mask = pay_raw.duplicated(subset=key, keep=False)
print(dup_mask.sum())
# look before you delete
pay_raw[dup_mask].sort_values(["installment_id", "payment_id"]).head(2)
```

| payment_id | loan_id | installment_id | paid_at | amount | method |
|---|---|---|---|---|---|
| 110 | 18 | 174 | 2025-05-28 | 663 300 | click |
| 52869 | 18 | 174 | 2025-05-28 | 663 300 | click |

50 rows belong to a duplicate group — 25 pairs. Payment 52869 repeats payment 110 to the day and the soum: the same instalment of loan 18, the same date and amount, recorded twice.

```python
# keep the lowest payment_id
pay_clean = pay_raw.sort_values("payment_id").drop_duplicates(subset=key, keep="first")
# 52 850
len(pay_clean)
```

| `keep=` | `duplicated` marks | `drop_duplicates` keeps |
|---|---|---|
| `"first"` | every later copy | the first row of each group |
| `"last"` | every earlier copy | the last row of each group |
| `False` | **every** member (for looking) | none of the members |

**When you use it.**
- Payments recorded twice, people registered twice, an extract loaded twice.
- Always in three steps: `keep=False` to look, a sort to choose the survivor, `drop_duplicates` to remove.

> 💡 **Key idea.** The key defines sameness; the sort defines the survivor; the assert on the count proves both.

> ⚠️ **Watch out.** Without `subset=`, pandas compares **all** columns and finds 0 duplicates here, because `payment_id` differs on every row — week 4's "tick all columns" trap, in a parameter.

**Your turn.** In `customers_dirty.csv`, how many rows belong to a duplicate group on `phone` + `birth_date` (every member counted)?

```task
{"id": "w05d3-l11", "kind": "python", "starter": "import pandas as pd\nc3 = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# your code: duplicated with keep=False on [\"phone\", \"birth_date\"]\n", "answer": 80, "dp": 0, "hint": "c3.duplicated(subset=[\"phone\", \"birth_date\"], keep=False).sum()", "model": "print(c3.duplicated(subset=[\"phone\", \"birth_date\"], keep=False).sum())     # 80\nprint(c3.duplicated(subset=[\"phone\", \"birth_date\"]).sum())                 # 40\n\n80 rows in 40 pairs: keep=False marks both members, keep=\"first\" only the 40 later copies."}
```

### Buckets with pd.cut — categories from numbers

**What it is.** `pd.cut(col, bins=edges, labels=names)` puts each number into an interval and returns its label. The result is a **category** column with the labels in order. It is week 2's `CASE WHEN dpd <= 30 THEN …` in one line.

**How to write it.**

```python
edges = [0, 5e6, 10e6, 20e6, np.inf]
bands = pd.cut(cust["monthly_income"], bins=edges, labels=["<5m", "5-10m", "10-20m", "20m+"], right=False)
bands.value_counts(dropna=False).sort_index()
```

| band | customers |
|---|---|
| <5m | 1 281 |
| 5-10m | 2 198 |
| 10-20m | 576 |
| 20m+ | 1 629 |
| NaN | 356 |

2 198 customers earn 5–10 m a month, the largest band; 356 have no income and land in NaN — visible only because of `dropna=False`.

| argument | means | example |
|---|---|---|
| default (`right=True`) | intervals `(a, b]` — the right edge belongs in | DPD: `[-1, 0, 30, 60, 90, np.inf]`, so 30 is `1-30` |
| `right=False` | intervals `[a, b)` — the left edge belongs in | income: `< 5 000 000` is the rule |
| first edge | must be *below* the smallest value | `-1` for DPD, or `dpd = 0` becomes NaN |
| `np.inf` | an open top | `90+`, `20m+` |

`pd.qcut(col, 10)` cuts into ten groups of equal size (deciles) — week 3's `NTILE(10)`.

**When you use it.**
- Any band defined by edges: DPD buckets, income bands, ticket sizes.
- Before a `groupby` or a `crosstab` by band; the category keeps the bands in order for charts.

> ⚠️ **Watch out.** With the first edge at 0 and the default right-closed intervals, `(0, 30]` does not contain 0: every `dpd = 0` loan — 7 429 of them — becomes NaN. Start DPD edges at −1.

**Your turn.** How many customers fall in the `20m+` band?

```task
{"id": "w05d3-l12", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nc3 = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# your code: cut monthly_income into <5m / 5-10m / 10-20m / 20m+ with right=False, then count per band\n", "answer": 1629, "dp": 0, "hint": "pd.cut(c3[\"monthly_income\"], [0, 5e6, 10e6, 20e6, np.inf], labels=[\"<5m\", \"5-10m\", \"10-20m\", \"20m+\"], right=False).value_counts()", "model": "b = pd.cut(c3[\"monthly_income\"], [0, 5e6, 10e6, 20e6, np.inf], labels=[\"<5m\", \"5-10m\", \"10-20m\", \"20m+\"], right=False)\nprint(b.value_counts(dropna=False).sort_index())     # 1281 · 2198 · 576 · 1629 · NaN 356"}
```

### apply vs vectorised

**What it is.** **Vectorised** code works on whole columns at once: `a + b`, `pd.cut`, `.str`, `np.where`. `apply` runs a Python function **once per value** (or once per row with `axis=1`) — a `for` loop in disguise. Both give the same answer; the speed differs by up to a thousand times.

**How to write it.**

```python
# HW 5.1's function, in one line
def dpd_bucket(dpd):
    return "0" if dpd <= 0 else "1-30" if dpd <= 30 else "31-60" if dpd <= 60 else "61-90" if dpd <= 90 else "90+"

# vectorised: milliseconds on 92 193 rows
inst["total"] = inst["principal_due"] + inst["interest_due"]
# row-wise apply: ~1 000× slower (seconds on the page)
inst["total"] = inst.apply(lambda r: r["principal_due"] + r["interest_due"], axis=1)
# fine for a label function on one column
loans["bucket_fn"] = loans["dpd"].apply(dpd_bucket)
(inst["total"] == inst["total_due"]).all(), (loans["bucket_fn"] == loans["bucket"].astype(str)).all()
```

The box shows `(True, True)`: both ways rebuild `total_due` on all 92 193 instalments, and the label function gives the file's bucket for all 7 828 loans.

| | vectorised | `apply` on one column | `apply(axis=1)` |
|---|---|---|---|
| runs | once, on the column | once per value | once per row |
| speed | the fastest | one Python call per value | one Python call per row — about 1 000× slower than vectorised |
| use for | arithmetic, `pd.cut`, `.str`, `np.where` | a label function with logic | logic that needs several columns and has no column spelling |

**When you use it.**
- Vectorised first, always, when a spelling exists.
- `apply` for a one-off function too twisted for arithmetic; if you wrote `axis=1`, ask whether column arithmetic would do.

> ⚠️ **Watch out.** `apply(axis=1)` feels natural after yesterday's loops, and it is the slowest line in most beginner notebooks. On ten million rows it is the difference between a second and an hour.

**Your turn.**

```game
{"type": "build", "id": "w05d3-g4", "title": "The vectorised total", "q": "Rebuild total_due on every instalment without apply.", "tokens": ["inst[\"total\"] =", "inst[\"principal_due\"]", "+", "inst[\"interest_due\"]"], "distractors": [".apply(", "axis=1", "for r in inst"]}
```

### assert — the pipeline that checks itself

**What it is.** `assert condition, message` stops the notebook with `AssertionError: message` when the condition is `False`, and does nothing when it is `True`. An assert after each step turns the counts you know into checks the code runs every time.

**How to write it.**

```python
assert len(pay_clean) == 52_850, f"expected 52 850 payments, got {len(pay_clean)}"
assert pay["method"].nunique() == 5
# a left merge keeps every instalment
assert len(m) == len(inst)
# no payment without an instalment
assert (m["_merge"] != "right_only").all()
print("all checks passed")
```

```text
all checks passed
```

Four facts proven in four lines: 52 850 payments after the dedup, 5 methods, 92 193 instalments kept by the left merge, no orphan payment.

| put an assert after | check |
|---|---|
| a dedup | the row count (`== 52_850`) |
| a left merge | `len(m) == len(left)` |
| a cleaning step | the number of distinct values (`nunique() == 5`) |
| a total | the sum against the warehouse (`== 255_114_772_176`) |

**When you use it.**
- After every step whose result you know — then a Monday run either finishes or names the step that broke.
- Before you hand a number to anyone: the assert is the proof.

> ⚠️ **Watch out.** An assert on a float never uses `==`: `assert abs(par30 - 0.0312) < 0.0001`. Two floats computed in different orders differ in the last digits.

**Your turn.** Assert the clean book's size, then print the money paid on or before the as-of.

```task
{"id": "w05d3-l13", "kind": "python", "starter": "import pandas as pd\nAS_OF = pd.Timestamp(\"2026-10-01\")\np3 = (pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\n        .sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"]))\n\n# your code: assert there are 52 850 rows, then print the sum of amount where paid_at <= AS_OF\n", "answer": 255061333229, "dp": 0, "hint": "assert len(p3) == 52_850; then p3.loc[p3[\"paid_at\"] <= AS_OF, \"amount\"].sum()", "model": "assert len(p3) == 52_850, len(p3)\nprint(p3.loc[p3[\"paid_at\"] <= AS_OF, \"amount\"].sum())     # 255061333229\n\nThe 24 forward-dated rows (53 438 947) are the difference from the whole clean sum, 255 114 772 176."}
```

### Putting it together

One question, most of the day's tools: *how much money is owed on matured instalments, per product?* De-duplicated payments with clean methods (**.str**, **duplicates**), paid per instalment (**groupby + agg**), a left **merge** with **validate** and an **assert**, NaN filled after the merge, the product joined by **key** (`m:1`), then **agg** per product.

```python
paid = pay[pay["paid_at"] <= AS_OF].groupby("installment_id", as_index=False).agg(paid=("amount", "sum"))
m = inst.merge(paid, on="installment_id", how="left", validate="1:1")
assert len(m) == len(inst)
# no payment = 0 paid, AFTER the merge
m["paid"] = m["paid"].fillna(0)
# matured and not fully paid
open_ = m[(m["due_date"] <= AS_OF) & (m["paid"] < m["total_due"])].copy()
open_["owed"] = open_["total_due"] - open_["paid"]
open_ = open_.merge(loans[["loan_id", "product"]], on="loan_id", how="left", validate="m:1")
owed = (open_.groupby("product").agg(instalments=("installment_id", "size"), owed=("owed", "sum"))
             .sort_values("owed", ascending=False))
owed
```

| product | instalments | owed |
|---|---|---|
| Small business loan | 299 | 4 873 942 406 |
| Consumer loan | 804 | 1 336 020 831 |
| Auto loan | 149 | 1 163 781 535 |
| Micro loan | 301 | 181 751 727 |
| Buy now pay later | 231 | 97 031 242 |

1 784 matured instalments are not fully paid, and 7.65 bn is still owed on them. SME has only 299 of those instalments but 4.87 bn of the money; Consumer has the most instalments, 804, for 1.34 bn.

**Your turn.** What share of the money owed sits on SME loans, in % with one decimal?

```task
{"id": "w05d3-l14", "kind": "python", "starter": "# runs after the Putting it together box above (it uses owed)\n\n# your code: SME's owed as a % of the total owed\n", "answer": 63.7, "dp": 1, "hint": "100 * owed.loc[\"Small business loan\", \"owed\"] / owed[\"owed\"].sum()", "model": "print(round(100 * owed.loc[\"Small business loan\", \"owed\"] / owed[\"owed\"].sum(), 1))     # 63.7\n\n63.7 % of the arrears on 17 % of the open instalments: the big loans decide the money, the small ones the caseload."}
```

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ groupby and agg — [Complete Python Pandas Data Science Tutorial! (2025 Updated Edition) (Keith Galli), 1:05:47](https://youtu.be/2uvysYbKdjM?t=3947&end=4104)
- ▶ groupby, short single-topic — [Group By and Aggregate Functions in Pandas (Alex The Analyst), 01:20](https://youtu.be/VRmXto2YA2I?t=80&end=188)
- ▶ merge / concat — Keith Galli same video, [50:42](https://youtu.be/2uvysYbKdjM?t=3042&end=3513)
- ▶ Cleaning (duplicates, strip, replace, fill nulls) — [Data Cleaning in Pandas (Alex The Analyst), 02:34](https://youtu.be/bDhvCp3_lYw?t=154&end=221)
- ▶ Same topic inside the big course — [Python for Data Analytics (Luke Barousse), Merge 7:15:37](https://youtu.be/wUSDVGivd-8?t=26137&end=26753)

- RU deck (TBC Data Analytics 2.0, if you have it) `4.3_Python.pdf` pp. 82–103: `groupby` and `.agg` pp. 82–87, pivot tables pp. 88–91, `pd.merge` / `join` / `concat` pp. 92–103; `.apply` / `.map` pp. 74–81. `4.4_Python.pdf` is tomorrow's bridge (DB-API, `read_sql`, SQLAlchemy).
- *Russian terms:* группировка = groupby, агрегация = aggregation, именованная агрегация = named aggregation, оконная функция = window function (`transform`), слияние / соединение = merge / join, конкатенация = concat, сводная таблица = pivot table, дубликаты = duplicates, очистка данных = data cleaning, утверждение / проверка = assert.

```videoquiz
{"video": "2uvysYbKdjM", "stops": [
  {"at": 3200, "q": "Which merge keeps every row of the left table, with NaN where the right has no match?", "options": ["how=\"inner\"", "how=\"left\"", "how=\"right\"", "the default"], "answer": 1, "explain": "The default is inner — only matches; left keeps all left rows. For DPD the left table is the instalments.", "back": 60},
  {"at": 3450, "q": "pd.concat([a, b]) lines the columns up by…", "options": ["position", "name", "dtype", "it does not — it raises an error on any difference"], "answer": 1, "explain": "By name: a column spelt differently in one frame becomes a second column full of NaN, without an error.", "back": 60},
  {"at": 4020, "q": "df.groupby(\"region\")[\"amount\"].sum() returns…", "options": ["one value per original row", "one row per region", "the grand total", "a sorted copy of df"], "answer": 1, "explain": "groupby + an aggregate collapses to one row per group — GROUP BY; transform would keep one value per row.", "back": 60}]}
```

```videoquiz
{"video": "VRmXto2YA2I", "stops": [
  {"at": 120, "q": "In groupby, what becomes the index of the result?", "options": ["The row numbers", "The grouping column(s)", "The aggregated column", "Nothing — there is no index"], "answer": 1, "explain": "The keys become the index; as_index=False or reset_index() turns them back into columns.", "back": 40},
  {"at": 170, "q": "You want several statistics per group in one call. Which method?", "options": [".agg(...)", ".apply(print)", ".head()", ".pivot()"], "answer": 0, "explain": "agg takes several functions or named outputs: agg(total=(\"amount\", \"sum\"), avg=(\"amount\", \"mean\")).", "back": 40}]}
```

```videoquiz
{"video": "bDhvCp3_lYw", "stops": [
  {"at": 180, "q": "drop_duplicates() without subset= compares…", "options": ["the first column only", "every column", "the index", "text columns only"], "answer": 1, "explain": "All columns must match — so two payments that differ only by payment_id are not duplicates; name the key with subset=.", "back": 30},
  {"at": 210, "q": "Which call removes spaces at both ends of every value in a text column?", "options": ["col.strip()", "col.str.strip()", "col.replace(' ', '')", "col.trim()"], "answer": 1, "explain": ".str applies the string method to every value; replace(' ', '') would also delete the spaces inside a name.", "back": 30}]}
```

```videoquiz
{"video": "wUSDVGivd-8", "stops": [
  {"at": 26350, "q": "Two tables share a key column. Which pandas call joins them?", "options": ["pd.concat", "df.merge(other, on=\"key\")", "df.append", "df.groupby"], "answer": 1, "explain": "merge is the join; concat stacks rows (UNION ALL).", "back": 60},
  {"at": 26600, "q": "After a left merge, how many rows should the result have if the right key is unique?", "options": ["Exactly as many as the left table", "As many as the right table", "The sum of both", "It depends on the column order"], "answer": 0, "explain": "A left merge onto a unique key keeps len(left) rows — assert it; more rows means the key was not unique (fan-out).", "back": 60}]}
```

---

## 2. Worked example — Nilufar's files, in pandas (detective, 40 min)

Reproduce week 4's counts step by step. Each step names the concept from section 1 it uses, in the order you learned them. Each step has an editor that loads the raw file; print the numbers, then ✔ Check. In Jupyter, `data/python/day3_starter.ipynb` has the walk-through cells in its first half.

**Step 1 — text repair with `.str`, because the dirt is in spaces and case.** The inventory on `customers_dirty.csv`: trailing spaces in `first_name`, all-caps first names, all-lower surnames, ids above 6 000.

```task
{"id": "w05d3-d1", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nc = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# your code\n", "answer": 18, "dp": 0, "hint": "The check looks for the number of first names with trailing spaces: compare the column with its .str.strip() version.", "model": "print((c.first_name != c.first_name.str.strip()).sum())    # 18\nprint(c.first_name.str.isupper().sum())                     # 22\nprint((c.last_name == c.last_name.str.lower()).sum())       # 40\nprint((c.customer_id > 6000).sum())                         # 40\n\nThe 22 + 18 land on the 40 lower-case surnames, ids 6001–6040 — the same suspicion as week 4, four lines instead of four SUMPRODUCTs."}
```

**Step 2 — `duplicated` with `subset=`, because "the same person" is whatever the key says.** Prove the duplicates three ways: `duplicated(subset=[normalised first, last, birth_date])`, `subset=["phone", "birth_date"]`, `subset=["phone"]`.

```task
{"id": "w05d3-d2", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nc = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# your code\n", "answer": 40, "dp": 0, "hint": "The check looks for the extras on phone + birth_date. duplicated(subset=[...]).sum() counts the later copies.", "model": "c[\"fn\"] = c.first_name.str.strip().str.lower(); c[\"ln\"] = c.last_name.str.strip().str.lower()\nprint(c.duplicated(subset=[\"fn\", \"ln\", \"birth_date\"]).sum())                  # 42\nprint(c.duplicated(subset=[\"first_name\", \"last_name\", \"birth_date\"]).sum())  # 2 — raw names hide 40\nprint(c.duplicated(subset=[\"phone\", \"birth_date\"]).sum())                     # 40\nprint(c.duplicated(subset=[\"phone\"]).sum())                                    # 43\n\nThe name key finds 42 — the 40 plus two namesakes (823/1197 Nodir Nazarov, 2460/5562 Eldor Karimov: different people). phone + birth_date finds exactly ids 6001–6040 (6001 MALIKA jalilova ↔ 4516 Malika Jalilova). phone alone: 43 — three family numbers. All 40 duplicates were registered after their original, so sort_values(\"registered_at\") + keep=\"first\" keeps the originals; \"registered in 2026\" falls 955 → 945."}
```

**Step 3 — `to_datetime(errors="coerce")` plus the business rule, because parsing alone finds nothing.** Count the NaT, then apply the rule.

```task
{"id": "w05d3-d3", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\nc = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# your code\n", "answer": 7, "dp": 0, "hint": "The check looks for the dates the business rule rejects: after the as-of or before 1920-01-01.", "model": "c[\"birth_date\"] = pd.to_datetime(c[\"birth_date\"], errors=\"coerce\")\nprint(c[\"birth_date\"].isna().sum())                                            # 0 NaT\nbad = (c[\"birth_date\"] > AS_OF) | (c[\"birth_date\"] < \"1920-01-01\")\nprint(bad.sum())                                                                # 7\nprint(c.loc[bad, [\"customer_id\", \"birth_date\"]])\n\ncoerce alone finds nothing — every value is a valid ISO date. The rule finds 7: 927, 2338, 3380 (2031-04-12), 964 (2027-02-28), 957, 1020, 2934 (1900-01-01). Age as (AS_OF - birth_date).dt.days / 365.25 gives the same 7 as < 18 or > 100; valid customers average 45.7 years. Flag and blank with .where(~bad) — never a guess."}
```

**Step 4 — `value_counts`, `.str` and `duplicated` on payments, because the 58 million are copies with a shared key.** `method.value_counts()` raw and clean; `duplicated` on the three-column key; Σ of the extras.

```task
{"id": "w05d3-d4", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\npay_raw = pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\n\n# your code\n", "answer": 58397800, "dp": 0, "hint": "The check looks for the sum of the extra copies: duplicated(subset=key, keep=\"first\") marks exactly the rows that will go.", "model": "five = [\"card\", \"payme\", \"cash\", \"click\", \"transfer\"]\nprint(pay_raw[\"method\"].nunique(), (~pay_raw[\"method\"].isin(five)).sum())     # 10 spellings, 180 dirty rows\nclean = pay_raw[\"method\"].str.strip().str.lower().replace({\"bank transfer\": \"transfer\"})\nprint(clean.nunique())                                                           # 5\nkey = [\"installment_id\", \"paid_at\", \"amount\"]\nextra = pay_raw.sort_values(\"payment_id\").duplicated(subset=key, keep=\"first\")\nprint(extra.sum(), pay_raw.sort_values(\"payment_id\").loc[extra, \"amount\"].sum())  # 25 58397800\n\n25 extras, Σ 58 397 800 — Timur's 58 million; all 25 have payment_id > 52 850, and duplicated() without subset finds 0. After the dedup: 52 850 rows, Σ 255 114 772 176; 24 forward-dated rows (53 438 947) flagged, kept. Clean counts: card 17 612 · payme 8 897 · cash 8 788 · click 8 786 · transfer 8 767."}
```

**Step 5 — `groupby` + `agg`, then a left `merge` with `validate=` and `indicator=`, because every instalment must stay** (the Company corner has the full version): aggregate clean payments `paid_at <= AS_OF` per instalment, left-merge onto `installments.csv` with `validate="1:1", indicator=True`. How many matured instalments are not fully paid?

```task
{"id": "w05d3-d5", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\ninst = pd.read_csv(\"../excel/installments.csv\", parse_dates=[\"due_date\"])\npay = (pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\n         .sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"]))\n\n# your code\n", "answer": 1784, "dp": 0, "hint": "The check looks for matured (due_date <= AS_OF) and paid < total_due. fillna(0) after the merge, not before.", "model": "paid = pay[pay[\"paid_at\"] <= AS_OF].groupby(\"installment_id\", as_index=False).agg(paid=(\"amount\", \"sum\"))\nm = inst.merge(paid, on=\"installment_id\", how=\"left\", validate=\"1:1\", indicator=True)\nprint(m[\"_merge\"].value_counts())                    # both 52826 · left_only 39367 · right_only 0\nm[\"paid\"] = m[\"paid\"].fillna(0)\nmatured = m[\"due_date\"] <= AS_OF\nprint(matured.sum(), (matured & (m[\"paid\"] < m[\"total_due\"])).sum())   # 54207 1784\n\n1 784 unpaid matured instalments, 403 of them partially paid — week 4 P8's numbers. (paid > total_due).sum() is 0 after the dedup and 25 before it: the duplicates were the only over-payments in the book. Loans with an unpaid matured instalment: 413; with dpd > 0: 399 (14 fell due on the as-of day itself, dpd 0)."}
```

---

## 3. Practice (45 min)

Each editor loads what the task needs — the payments starter gives you both `pay_raw` (as recorded) and `pay` (de-duplicated). Print the number, then ✔ Check. In Jupyter, add a cell per task to `day3_starter.ipynb`.

**P1.** *(groupby — one aggregate)* Money paid on or before the as-of, per `method` (clean payments), largest first. How much came by card?

```task
{"id": "w05d3-l15", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\npay = (pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\n         .sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"]))   # clean: 52 850\npay[\"method\"] = pay[\"method\"].str.strip().str.lower().replace({\"bank transfer\": \"transfer\"})\n\n# your code\n", "answer": 84744713422, "dp": 0, "hint": "pay[pay[\"paid_at\"] <= AS_OF].groupby(\"method\")[\"amount\"].sum().sort_values(ascending=False)", "model": "s = pay[pay[\"paid_at\"] <= AS_OF].groupby(\"method\")[\"amount\"].sum().sort_values(ascending=False)\nprint(s)     # card 84744713422 · transfer 43028739812 · click 42938566151 · payme 42922172076 · cash 41427141768\n\nCard brings a third of the money as well as a third of the payments: 84.7 bn of 255.1 bn."}
```

**P2.** *(several aggregates with agg)* Payments per `region`: count, total, average — on the dirty file and on the clean one. Which region lost the most money to the dedup?

```task
{"id": "w05d3-p1", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\npay_raw = pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\npay = pay_raw.sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"])   # clean: 52 850\n\n# your code\n", "answer": 24951300, "dp": 0, "hint": "The check looks for the largest loss in soum: total per region on the raw file minus total on the clean one.", "model": "g = lambda d: d.groupby(\"region\").agg(payments=(\"payment_id\", \"size\"), total=(\"amount\", \"sum\"), avg=(\"amount\", \"mean\"))\nprint(g(pay))\nlost = (g(pay_raw)[\"total\"] - g(pay)[\"total\"]).sort_values(ascending=False)\nprint(lost)        # Samarkand 24951300 · Fergana 17964000 · Andijan 7666600 · Tashkent 5247900 …\n\nClean: Tashkent 20 437 / 102 605 410 110 / 5.02 m · Fergana 6 334 / 34 437 790 032 · Samarkand 6 037 / 27 576 625 156 · Andijan 4 724 / 24 138 491 453 · Namangan 4 782 / 21 044 366 065 · Bukhara 4 088 / 16 162 119 575 · Termez 3 218 / 15 956 940 146 · Nukus 3 230 / 13 193 029 639. Samarkand lost most (24 951 300) on 3 rows; Tashkent had 7 of the 25 rows but lost only 5 247 900."}
```

**P3.** *(groupby on two keys)* A cross-tab of clean payments: `product` × `method` counts with `groupby(...).size().unstack()`, then the same with `pivot_table`. Read SME's row.

```task
{"id": "w05d3-p2", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\npay_raw = pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\npay = pay_raw.sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"])   # clean: 52 850\npay[\"method\"] = pay[\"method\"].str.strip().str.lower().replace({\"bank transfer\": \"transfer\"})            # 5 methods\n\n# your code\n", "answer": 2701, "dp": 0, "hint": "The check looks for SME's card count.", "model": "ct = pay.groupby([\"product\", \"method\"]).size().unstack(fill_value=0)\nprint(ct.loc[\"Small business loan\"])     # card 2701 · cash 1334 · click 1390 · payme 1401 · transfer 1396\npt = pd.pivot_table(pay, index=\"product\", columns=\"method\", values=\"payment_id\", aggfunc=\"count\", fill_value=0)\nprint((ct == pt).all().all())            # True\n\nThe same 33 / 17 / 17 / 17 / 17 % mix as the whole book: method does not depend on product."}
```

**P4.** *(transform)* Add each customer's segment median income next to them; how many earn above it? Then `cumcount` per `phone` as the `ROW_NUMBER` of week 3 — how many rows get 1 or more?

```task
{"id": "w05d3-p3", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\ncust = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# your code\n", "answer": 2841, "dp": 0, "hint": "The check looks for the count above the segment median on the raw file.", "model": "cust[\"seg_median\"] = cust.groupby(\"segment\")[\"monthly_income\"].transform(\"median\")\nprint((cust[\"monthly_income\"] > cust[\"seg_median\"]).sum())              # 2841\nrn = cust.sort_values(\"registered_at\").groupby(\"phone\").cumcount()\nprint((rn >= 1).sum())                                                   # 43\n\nMedians mass 5.79 m · affluent 25.28 m · sme 33.21 m; the 356 NaN compare False. On the 6 000 clean customers (P6) the answer is 2 823 — say which frame you used. cumcount on phone gives 43 rows ≥ 1 — the 40 duplicates plus three family-shared numbers; with [\"phone\", \"birth_date\"] as the key, exactly 40. Sort by registered_at first or the \"0\" may be the later copy."}
```

**P5.** *(value_counts)* Grades of the 234 loans in 90+: the share of each, in %. Which grade holds half of them, and how does that compare with its share of the whole book?

```task
{"id": "w05d3-l16", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code\n", "answer": 49.6, "dp": 1, "hint": "loans.loc[loans[\"dpd\"] > 90, \"grade\"].value_counts(normalize=True).mul(100).round(1)", "model": "print(loans.loc[loans[\"dpd\"] > 90, \"grade\"].value_counts(normalize=True).mul(100).round(1))\n# C 49.6 · B 27.4 · D 15.8 · A 7.3\n\nGrade C is 28.9 % of all loans but 49.6 % of the 90+ loans; D is 4.3 % of the book and 15.8 % of 90+. The grades do rank risk."}
```

**P6.** *(merge — how=)* The inner-merge trap: repeat Step 5 with the default `how`. How many rows, and which loans would the DPD computation then miss?

```task
{"id": "w05d3-p4", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\ninst = pd.read_csv(\"../excel/installments.csv\", parse_dates=[\"due_date\"])\npay = (pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\n         .sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"]))\n\n# your code\n", "answer": 52826, "dp": 0, "hint": "The check looks for the row count of the merge without how=.", "model": "paid = pay[pay[\"paid_at\"] <= AS_OF].groupby(\"installment_id\", as_index=False).agg(paid=(\"amount\", \"sum\"))\nm = inst.merge(paid, on=\"installment_id\")\nprint(len(inst), len(m))     # 92193 52826\n\nEvery instalment with no payment disappears, so an instalment that was never paid is not \"unpaid\", it is absent, and every loan whose arrears are total (the 234 in 90+ with months of nothing) looks current. how=\"left\" + fillna(0) is the LEFT JOIN … COALESCE(SUM, 0) of week 2; assert len(m) == len(inst) after the merge is the belt."}
```

**P7.** *(merge keys)* Total paid per loan (clean payments, any date), merged onto every loan of `loans_status.csv` on `loan_id`. How many loans have no payment at all?

```task
{"id": "w05d3-l17", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\npay = (pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\n         .sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"]))   # clean: 52 850\npay[\"method\"] = pay[\"method\"].str.strip().str.lower().replace({\"bank transfer\": \"transfer\"})\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code\n", "answer": 392, "dp": 0, "hint": "per_loan = pay.groupby(\"loan_id\", as_index=False).agg(paid=(\"amount\", \"sum\")); then loans.merge(per_loan, on=\"loan_id\", how=\"left\", validate=\"1:1\") and count paid.isna()", "model": "per_loan = pay.groupby(\"loan_id\", as_index=False).agg(paid=(\"amount\", \"sum\"))\nm = loans.merge(per_loan, on=\"loan_id\", how=\"left\", validate=\"1:1\")\nprint(len(m), m[\"paid\"].isna().sum())     # 7828 392\n\n392 loans have never paid anything — week 2's anti-join number: new loans whose first instalment is not due yet, and the worst defaulters."}
```

**P8.** *(validate= and indicator=)* Merge clean payments onto `loans_status.csv` (`loan_id`) with `validate="m:1"` — fine. Now merge `installments.csv` onto the **raw** payments with `validate="1:1"` (`pay_raw.merge(inst, on="installment_id", validate="1:1")`), then onto the **clean** payments — what happens each time?

```task
{"id": "w05d3-p5", "kind": "choice", "options": ["Both merges pass — validate only checks the column types", "Raw: MergeError, because 25 instalments carry two payment rows; clean: it passes, because after the dedup every instalment has at most one payment", "Both raise MergeError — a payment table is always m:1", "Raw passes, clean fails — the dedup broke the key"], "answer": 1, "explain": "Raw: MergeError: Merge keys are not unique in left dataset; not a one-to-one merge — the 25 duplicate pairs make raw payments → instalments m:1, and stating the wrong grain is caught before any number is wrong. Clean: it passes — the partials are single payments smaller than total_due (week 3 P11), not several payments. Keep validate=\"m:1\" in the script anyway: it is the grain the business allows, and it will not break the day a real split payment arrives. Write the validate you believe; a MergeError is a free lesson about the data."}
```

**P9.** *(concat)* Split clean payments into Tashkent and the rest, add a `source` column to each, concat with `ignore_index=True`. Rows? Then rename `amount` to `Amount` in one half and concat again — what does the result look like?

```task
{"id": "w05d3-p9", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\npay = (pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\n         .sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"]))\n\n# your code\n", "answer": 52850, "dp": 0, "hint": "The check looks for the row count of the concat.", "model": "a = pay[pay[\"region\"] == \"Tashkent\"].assign(source=\"tashkent\")\nb = pay[pay[\"region\"] != \"Tashkent\"].assign(source=\"rest\")\nu = pd.concat([a, b], ignore_index=True)\nprint(len(a), len(b), len(u))                     # 20437 32413 52850\nbad = pd.concat([a, b.rename(columns={\"amount\": \"Amount\"})], ignore_index=True)\nprint(bad.shape, bad[\"amount\"].isna().sum(), bad[\"Amount\"].isna().sum())   # one column more; 32413 / 20437 NaN\n\nsource says which half each row came from (lineage for the twelve monthly files). With Amount in one half: still 52 850 rows but one column more, amount NaN in 32 413 rows and Amount NaN in 20 437 — no error, a split column; assert set(a.columns) == set(b.columns) before every concat."}
```

**P10.** *(pivot_table)* `pivot_table` of `outstanding` (sum) by `bucket` × `product` with `margins=True`. Read the `All` column: how much outstanding sits in 90+?

```task
{"id": "w05d3-l18", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code\n", "answer": 5319475527, "dp": 0, "hint": "pt = pd.pivot_table(loans, index=\"bucket\", columns=\"product\", values=\"outstanding\", aggfunc=\"sum\", fill_value=0, margins=True); pt.loc[\"90+\", \"All\"]", "model": "pt = pd.pivot_table(loans, index=\"bucket\", columns=\"product\", values=\"outstanding\", aggfunc=\"sum\", fill_value=0, margins=True)\nprint(pt[\"All\"])     # 0 197486207578 · 1-30 4729769899 · 31-60 748610049 · 61-90 439441377 · 90+ 5319475527 · All 208723504430\n\n5.32 bn in 90+ of the 208.7 bn book — NPL90 = 2.55 %; the All row and column reconcile the total."}
```

**P11.** *(text repair with .str)* `applications.csv`: how many statuses begin with `approved` (`.str.startswith`), and how many contain `not` (`.str.contains`)?

```task
{"id": "w05d3-l19", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\napps = pd.read_csv(\"../excel/applications.csv\")\n\n# your code\n", "answer": 8595, "dp": 0, "hint": "apps[\"status\"].str.startswith(\"approved\").sum(), then apps[\"status\"].str.contains(\"not\").sum()", "model": "print(apps[\"status\"].str.startswith(\"approved\").sum())     # 8595\nprint(apps[\"status\"].str.contains(\"not\").sum())         # 678\n\n8 595 approvals in two spellings; the 678 approved_not_disbursed rows are exactly the ones == \"approved\" would lose."}
```

**P12.** *(dates: errors= and the business rule)* Parse `birth_date` with `errors="coerce"`, apply the business rule, and count the valid customers aged 60 or more on the as-of (age = days / 365.25).

```task
{"id": "w05d3-l20", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\nc = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# your code\n", "answer": 1384, "dp": 0, "hint": "b = pd.to_datetime(c[\"birth_date\"], errors=\"coerce\"); ok = (b <= AS_OF) & (b >= \"1920-01-01\"); age = (AS_OF - b).dt.days / 365.25; (ok & (age >= 60)).sum()", "model": "b = pd.to_datetime(c[\"birth_date\"], errors=\"coerce\")\nok = (b <= AS_OF) & (b >= \"1920-01-01\")\nage = (AS_OF - b).dt.days / 365.25\nprint((ok & (age >= 60)).sum())     # 1384\n\nWithout the rule the three 1900-01-01 birthdays would add three 126-year-olds to the count: 1 387."}
```

**P13.** *(duplicates)* Sort `customers_dirty.csv` by `registered_at` and drop duplicates on `phone` + `birth_date` — once with `keep="first"`, once with `keep="last"`. How many customer ids above 6 000 survive each time?

```task
{"id": "w05d3-l21", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nc = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# your code\n", "answer": 40, "dp": 0, "hint": "s = c.sort_values(\"registered_at\"), then for each keep: (s.drop_duplicates(subset=[\"phone\", \"birth_date\"], keep=keep)[\"customer_id\"] > 6000).sum()", "model": "s = c.sort_values(\"registered_at\")\nfor keep in [\"first\", \"last\"]:\n    d = s.drop_duplicates(subset=[\"phone\", \"birth_date\"], keep=keep)\n    print(keep, len(d), (d[\"customer_id\"] > 6000).sum())\n# first 6000 0 · last 6000 40\n\nBoth keep 6 000 rows — the count cannot tell the survivor. keep=\"last\" keeps the 40 later registrations (ids 6001–6040) and throws away the originals; the sort plus keep is the decision."}
```

**P14.** *(buckets with pd.cut)* `pd.cut` on `dpd` with the edges `[-1, 0, 30, 60, 90, np.inf]` and the five labels. How many loans are more than 30 days late (the last three buckets)? Then try the first edge at 0 — how many NaN?

```task
{"id": "w05d3-l22", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code\n", "answer": 275, "dp": 0, "hint": "b = pd.cut(loans[\"dpd\"], [-1, 0, 30, 60, 90, np.inf], labels=[\"0\", \"1-30\", \"31-60\", \"61-90\", \"90+\"]); b.isin([\"31-60\", \"61-90\", \"90+\"]).sum()", "model": "b = pd.cut(loans[\"dpd\"], [-1, 0, 30, 60, 90, np.inf], labels=[\"0\", \"1-30\", \"31-60\", \"61-90\", \"90+\"])\nprint(b.value_counts().sort_index())                 # 7429 · 124 · 25 · 16 · 234\nprint(b.isin([\"31-60\", \"61-90\", \"90+\"]).sum())       # 275\nprint(pd.cut(loans[\"dpd\"], [0, 30, 60, 90, np.inf]).isna().sum())   # 7429\n\n275 loans past 30 days carry PAR30's 6.51 bn. With the first edge at 0, all 7 429 current loans fall out as NaN."}
```

**P15.** *(apply vs vectorised)* Compute `total_due` from its two parts both ways on the 92 193 instalments and time them (`%%timeit` in Jupyter, or `time.perf_counter()`). Then apply `dpd_bucket` from HW 5.1 to `dpd` and compare with `pd.cut`. Which statement is right?

```task
{"id": "w05d3-p8", "kind": "choice", "options": ["apply(axis=1) is about as fast — pandas vectorises it for you", "Column arithmetic is about a thousand times faster than apply(axis=1); a one-column label function with apply is fine", "pd.cut is a thousand times faster than apply on one column", "apply gives different totals from the arithmetic"], "answer": 1, "explain": "Row-wise apply(axis=1) ≈ 0.7 s; inst.principal_due + inst.interest_due ≈ 0.7 ms — both equal total_due on every row. dpd.apply(dpd_bucket) and pd.cut give identical labels on 7 828 rows in about a millisecond each — for a label function on one column apply is fine; axis=1 is the one to avoid."}
```

**P16.** *(assert — the whole cleaning chain)* Clean `customers_dirty.csv` end to end in one chain (strip + title, flags, sort, dedup) and `assert` the four counts: 6 000 rows, 7 invalid dates, 354 missing incomes, no id above 6 000. Why 354 and not 356?

```task
{"id": "w05d3-p6", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\ncust = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# your code — print the missing incomes after the dedup\n", "answer": 354, "dp": 0, "hint": "The check looks for monthly_income.isna().sum() on the clean frame. Dedup on [\"phone\", \"birth_date\"] after sort_values(\"registered_at\").", "model": "c = cust.copy()\nfor col in [\"first_name\", \"last_name\"]:\n    c[col] = c[col].str.strip().str.title()\nc[\"birth_date\"] = pd.to_datetime(c[\"birth_date\"], errors=\"coerce\")\nc[\"birth_date_invalid\"] = (c[\"birth_date\"] > AS_OF) | (c[\"birth_date\"] < \"1920-01-01\")\nc[\"birth_date_clean\"] = c[\"birth_date\"].where(~c[\"birth_date_invalid\"])\nc = (c.sort_values(\"registered_at\").drop_duplicates(subset=[\"phone\", \"birth_date\"], keep=\"first\")\n      .sort_values(\"customer_id\"))\nassert len(c) == 6000 and c[\"birth_date_invalid\"].sum() == 7\nassert (c[\"customer_id\"] <= 6000).all()\nprint(c[\"monthly_income\"].isna().sum())     # 354\n\nTwo of the 40 duplicate rows copied a customer whose income is blank, so dropping them removes 2 of the 356 NaN. This chain is clean_customers in the notebook."}
```

**P17.** *(putting it together)* Collection rate by due month for 2026 from the merged frame of Step 5: `due_month = due_date.dt.to_period("M")`, `groupby` → Σ due, Σ paid, rate. Compare September with week 4.

```task
{"id": "w05d3-p7", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\ninst = pd.read_csv(\"../excel/installments.csv\", parse_dates=[\"due_date\"])\npay = (pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\n         .sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"]))\n\n# your code\n", "answer": 94.1, "dp": 1, "hint": "The check looks for September 2026's rate in %, one decimal.", "model": "paid = pay[pay[\"paid_at\"] <= AS_OF].groupby(\"installment_id\", as_index=False).agg(paid=(\"amount\", \"sum\"))\nm = inst.merge(paid, on=\"installment_id\", how=\"left\", validate=\"1:1\").fillna({\"paid\": 0})\ny = m[(m[\"due_date\"] >= \"2026-01-01\") & (m[\"due_date\"] < \"2026-10-01\")].copy()\ny[\"due_month\"] = y[\"due_date\"].dt.to_period(\"M\")\ng = y.groupby(\"due_month\").agg(due=(\"total_due\", \"sum\"), paid=(\"paid\", \"sum\"))\ng[\"rate\"] = (100 * g[\"paid\"] / g[\"due\"]).round(1)\nprint(g)\n\nJan 97.3 % · Feb 97.0 · Mar 96.8 · Apr 96.9 · May 97.1 · Jun 96.9 · Jul 96.7 · Aug 96.5 · Sep 94.1 % (3 305 instalments, 16 987 977 718 due, 15 982 118 926 paid) — identical to the Power Query table because the payments are cut at the as-of inside paid."}
```

> 🚀 **Stretch (optional, +5 XP).** **P18.** *(pivot and melt)* `monthly_disbursements.csv` (170 long rows) → `pivot` to 34 months × 5 products, add a `total` column and SME's share per month; then `melt` it back to long. Which month had SME's highest share, and what was it in September 2026?

```task
{"id": "w05d3-p10", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nmd = pd.read_csv(\"../excel/monthly_disbursements.csv\")\n\n# your code\n", "answer": 77.2, "dp": 1, "xp": 2, "hint": "The check looks for SME's highest monthly share in %, one decimal.", "model": "w = md.pivot(index=\"month\", columns=\"product\", values=\"amount\")\nprint(w.shape)                                                   # (34, 5)\nw[\"total\"] = w.sum(axis=1)\nw[\"sme_share\"] = 100 * w[\"Small business loan\"] / w[\"total\"]\nprint(w[\"sme_share\"].idxmax(), round(w[\"sme_share\"].max(), 1))   # 2024-07-01 77.2\nprint(round(w.loc[\"2026-09-01\", \"sme_share\"], 1))                # 50.6\nlong = w.drop(columns=[\"total\", \"sme_share\"]).reset_index().melt(id_vars=\"month\", var_name=\"product\", value_name=\"amount\")\nprint(len(long))                                                 # 170\n\nSME's share peaks in July 2024 at 77.2 %; in September 2026 it is 50.6 % of 17.0 bn (8.60 bn). Wide for reading and Excel, long for groupby and seaborn — tomorrow's lineplot wants the long shape."}
```

### Mistakes that cost a point this week

- `merge` without `how=` — inner by default; the unpaid instalments vanish.
- No `validate=` on a join whose grain you "know" — the week-2 fan-out, unflagged.
- `drop_duplicates` without `subset=` (0 removed) or without a sort first (the wrong survivor kept).
- `errors="coerce"` taken as validation — 7 impossible dates pass.
- `fillna` before the merge instead of after — the NaN that marks "no payment" is lost.
- `groupby` on a key with blanks without `dropna=False` — a group silently missing.
- A row-wise `apply(axis=1)` where column arithmetic exists.
- `concat` of frames with differently spelt columns — a silent split.
- Counts that live in your head instead of in `assert` lines.

---

## 4. Homework <span class="badge hw">HW 5.2 — Due Day 5</span>

**Jasur's Monday script.** Hand in `clean_nur.py` (or the executed `day3_starter.ipynb` with the three TODO functions filled in) and the three CSVs it writes, in the 📎 box below:

1. **`customers_clean.csv`** — 6 000 rows from `customers_dirty.csv`: names stripped and title-cased, duplicates removed on `phone` + `birth_date` keeping the earliest `registered_at`, `birth_date_invalid` (7 True), `birth_date_clean` (NaT when invalid), `monthly_income` NaN kept as NaN (354).
2. **`payments_clean.csv`** — 52 850 rows: `method` in 5 values, duplicates removed on `installment_id` + `paid_at` + `amount` keeping the lowest `payment_id`, `is_forward_dated` (24 True, rows kept). Σ `amount` 255 114 772 176.
3. **`dpd_per_loan.csv`** — one row per loan (7 828): `loan_id`, `dpd`, `bucket`, computed from `installments.csv` + your clean payments as in the Company corner; 399 loans with `dpd > 0`, buckets 7 429 / 124 / 25 / 16 / 234, equal to `loans_status.csv`'s `dpd` for every loan.
4. **Asserts** on every count above inside the script, plus `len(merged) == len(installments)` after the merge; running `python clean_nur.py` prints nothing but the three file names when all is well.

**Paths.** Your mentor runs your script in a folder that has the raw files in a `data/excel/` folder next to it. So read them as `Path("data/excel/customers_dirty.csv")` (put the downloaded files in a `data/excel/` folder next to your script to test it), and write the three CSVs into the current folder (`customers_clean.csv`, not a path elsewhere). The editors below read the course copies with the page's own path (`../excel/…`) — only the read line differs. Also due today: **HW 5.1**, in Day 1's hand-in box.

**Check your key numbers before you hand in.** Paste each of your functions into its editor; the check compares what it prints with the warehouse.

```task
{"id": "w05d3-hw1", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\n\n# paste your clean_customers(df) here\n\n\nc = clean_customers(pd.read_csv(\"../excel/customers_dirty.csv\"))\nprint(len(c), c[\"birth_date_invalid\"].sum(), c[\"monthly_income\"].isna().sum())\n", "answer": 6000, "dp": 0, "hint": "Sort by registered_at before drop_duplicates on [\"phone\", \"birth_date\"], or the wrong survivor stays.", "model": "6 000 rows, 7 invalid birth dates, 354 missing incomes; every customer_id ≤ 6 000."}
```

```task
{"id": "w05d3-hw2", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\n\n# paste your clean_payments(df) here\n\n\np = clean_payments(pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"]))\nprint(len(p), p[\"method\"].nunique(), p[\"is_forward_dated\"].sum())\nprint(p[\"amount\"].sum())\n", "answer": 255114772176, "dp": 0, "hint": "Dedup on installment_id + paid_at + amount after sort_values(\"payment_id\"); flag paid_at > AS_OF but keep the rows.", "model": "52 850 rows, 5 methods, 24 forward-dated rows, Σ amount 255 114 772 176."}
```

```task
{"id": "w05d3-hw3", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\n\n# paste clean_payments(df) and dpd_per_loan(inst, pay, as_of) here\n\n\ninst = pd.read_csv(\"../excel/installments.csv\", parse_dates=[\"due_date\"])\npay = clean_payments(pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"]))\nd = dpd_per_loan(inst, pay, AS_OF)\nprint(len(d), (d[\"dpd\"] > 0).sum())\nprint(d[\"bucket\"].value_counts().sort_index())\n", "answer": 399, "dp": 0, "hint": "Left-merge, fillna(0) after the merge, matured and not fully paid, AS_OF − the oldest such due date per loan, then every loan of loans_status.csv with 0 where nothing is late.", "model": "7 828 loans, 399 with dpd > 0; buckets 7 429 / 124 / 25 / 16 / 234."}
```

### 📎 Hand in here

```sqltask
{"check": "handin-W5D3", "lesson": "W5D3", "title": "HW 5.2", "why": "This is the script Jasur schedules for Monday 6:00: the same three repairs as week 4, but written once, proven by its own asserts and re-run without anyone at the keyboard — and its DPD becomes the target of his model.", "graded": ["The counts: 6 000 / 7 / 52 850 / 5 / 24 / 399 and the five buckets", "The asserts are present and the script runs top to bottom from the raw files — the reviewer deletes the CSVs and re-runs it", "The dedup keeps the right survivor (originals ≤ 6 000; lowest payment_id) and the DPD matches the SQL for all 7 828 loans"], "tasks": [{"id": "clean_nur.py", "file": "clean_nur.py", "names": ["clean_nur.py", "day3_starter.ipynb"], "upload": true, "accept": ".ipynb,.py", "q": "Attach `clean_nur.py` or `day3_starter.ipynb` — what the page above asks for."}, {"id": "customers_clean.csv", "file": "customers_clean.csv", "names": ["customers_clean.csv"], "upload": true, "accept": ".csv", "q": "Attach `customers_clean.csv` (6 000 rows)."}, {"id": "payments_clean.csv", "file": "payments_clean.csv", "names": ["payments_clean.csv"], "upload": true, "accept": ".csv", "q": "Attach `payments_clean.csv` (52 850 rows)."}, {"id": "dpd_per_loan.csv", "file": "dpd_per_loan.csv", "names": ["dpd_per_loan.csv"], "upload": true, "accept": ".csv", "q": "Attach `dpd_per_loan.csv` (7 828 rows)."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else the page lists (one more file, or a .zip of several)."}]}
```

---

## 5. Self-check

```check
{"id": "w05d3-sc", "questions": [
  {"type": "single", "q": "agg vs transform — which one is the window function?", "options": ["agg: one row per group", "transform: one value per original row, aligned to the frame — SUM() OVER (PARTITION BY)", "Both are window functions", "Neither — pandas has no window functions"], "answer": 1, "explain": "agg collapses to one row per group (GROUP BY); transform writes the group's value next to every member (→ section 1, 'agg', 'transform')."},
  {"type": "single", "q": "You merge payments onto instalments and get fewer rows than the 92 193 instalments. What did you forget?", "options": ["validate=", "how=\"left\" — the default inner merge drops the instalments without a payment; assert len(m) == len(inst) would have caught it", "sort=True", "indicator=True"], "answer": 1, "explain": "The unpaid instalments are exactly the ones DPD needs (→ section 1, 'merge', P6)."},
  {"type": "single", "q": "pd.to_datetime(errors=\"coerce\") found 0 bad birth dates. Are the dates clean?", "options": ["Yes — every value parsed", "No — 2031-04-12 parses fine; validity needs the business rule (not after the as-of, not before 1920), which finds 7", "Yes, if the dtype is datetime64", "No — coerce turned them into 1900-01-01"], "answer": 1, "explain": "Parsing is syntax; validity is a rule you write (→ section 1, 'Dates that lie', Detective step 3)."},
  {"type": "single", "q": "You group customers by a column that has blanks. Where are the customers with a blank key?", "options": ["In a group called NaN", "Nowhere — groupby drops NaN keys unless you pass dropna=False", "In the first group", "groupby raises an error"], "answer": 1, "explain": "The blank group silently disappears; dropna=False shows it as a row (→ section 1, 'groupby — one aggregate per group')."}
]}
```

---

## 6. Company corner <span class="badge company">DPD in pandas</span>

The week-2 DPD block, the week-3 `v_loan_status`, the week-4 Power Query merge — now as the function Jasur schedules. Grain discipline is the whole method: instalment → loan.

```game
{"type": "order", "id": "w05d3-g3", "title": "The DPD pipeline, in order", "items": ["De-duplicate payments and cut them at the as-of", "Sum paid per instalment", "Left-merge onto instalments with validate=\"1:1\"", "Assert the row count, then fillna(0)", "Keep matured instalments that are not fully paid", "Per loan: as-of − the oldest unpaid due date", "pd.cut into buckets and reconcile with the SQL"], "why": "Each step changes the grain or the meaning of a NaN — the order is what makes the 399 come out right."}
```

```python
AS_OF = pd.Timestamp("2026-10-01")
# grain: instalment, 92 193
inst = pd.read_csv("../excel/installments.csv", parse_dates=["due_date"])
# clean_payments(): 52 850
pay  = (pd.read_csv("../excel/payments_dirty.csv", parse_dates=["paid_at"])
          .sort_values("payment_id").drop_duplicates(subset=["installment_id", "paid_at", "amount"]))

# 1. payments through the as-of …
paid = (pay[pay["paid_at"] <= AS_OF]
        # … aggregated per instalment
        .groupby("installment_id", as_index=False).agg(paid=("amount", "sum")))
# 2. every instalment kept
m = inst.merge(paid, on="installment_id", how="left", validate="1:1")
assert len(m) == len(inst)
# no payment = 0 paid
m["paid"] = m["paid"].fillna(0)
# 3. not fully paid
m["unpaid"]  = m["paid"] < m["total_due"]
# and already due
m["matured"] = m["due_date"] <= AS_OF
# 1 784 instalments
late = m[m["unpaid"] & m["matured"]]
# 4. per loan: as-of − oldest unpaid due date
dpd = (AS_OF - late.groupby("loan_id")["due_date"].min()).dt.days.rename("dpd")
# 5. every loan, 0 when nothing is late
loans = (pd.read_csv("../excel/loans_status.csv")[["loan_id"]]
         .merge(dpd, on="loan_id", how="left").fillna({"dpd": 0}).astype({"dpd": int}))
loans["bucket"] = pd.cut(loans["dpd"], [-1, 0, 30, 60, 90, np.inf], labels=["0", "1-30", "31-60", "61-90", "90+"])
(loans["dpd"] > 0).sum(), loans["bucket"].value_counts().sort_index()
```

`(loans.dpd > 0).sum()` → **399**; `loans.bucket.value_counts().sort_index()` → **7 429 / 124 / 25 / 16 / 234**; merged against `loans_status.csv`, `(dpd == dpd_sql).all()` → **True** for all 7 828 loans. Same definition, same rows, third tool, same number — which is the only acceptable outcome.

> 💡 **Key idea.** Where the pandas version is *better* than the SQL: `validate="1:1"` and the `assert` make the grain explicit; `AS_OF` is one variable, so the 1 September snapshot for roll rates is the same function with another argument; and the 25 duplicates are handled by a named step (`clean_payments`) rather than a view somebody has to remember to use.

**FPD30 by vintage × channel = one `pivot_table`.** The first instalment per loan, in scope if its due date is ≤ as-of − 30 days; late if not fully paid within 30 days (`paid < total_due` or `first_paid − due_date > 30`); vintage = month of disbursement; channel from the product (Day 2 P11: app sells Micro, partner sells BNPL, the branch everything else — `loans_status.csv` has no channel column):

```python
ls = pd.read_csv("../excel/loans_status.csv", parse_dates=["disbursed_at"])
loan_channel = ls[["loan_id", "disbursed_at"]].assign(
    channel=ls["product"].map({"Micro loan": "app", "Buy now pay later": "partner"}).fillna("branch"))
first = inst[(inst["installment_no"] == 1) & (inst["due_date"] <= AS_OF - pd.Timedelta(days=30))]
paid1 = pay[pay["paid_at"] <= AS_OF].groupby("installment_id", as_index=False).agg(paid=("amount", "sum"), first_paid=("paid_at", "min"))
f = first.merge(paid1, on="installment_id", how="left").fillna({"paid": 0})
f["fpd30"] = ((f["paid"] < f["total_due"]) | ((f["first_paid"] - f["due_date"]).dt.days > 30)).astype(int)
# loan_id, disbursed_at, channel
f = f.merge(loan_channel, on="loan_id", validate="1:1")
f["vintage"] = f["disbursed_at"].dt.to_period("M").astype(str)
pd.pivot_table(f, index="vintage", columns="channel", values="fpd30", aggfunc="mean").mul(100).round(2)
```

In scope **7 099**, FPD30 **91 = 1.28 %**; by channel app 41 / 2 411 = **1.70 %**, partner 16 / 1 425 = 1.12 %, branch 34 / 3 263 = 1.04 % — week 2's table, cell for cell. The pivot's last rows: 2026-05 app 0.76 / branch 1.12 / partner 5.97 (4 of 67 — too small to read); 2026-06 0.74 / 0.62 / 1.33; 2026-07 1.64 / 0.62 / 1.19; 2026-08 is 11 loans in scope and partner is NaN — an empty cell, not a 0. Swap `columns="channel"` for `"grade"` (A 0.60 · B 0.97 · C 2.16 · D 2.23 %, after adding `grade` to `loan_channel`) or `aggfunc=["sum", "count"]` to show the counts next to the rates, and group by quarter (`dt.to_period("Q")`) when the monthly cells are this thin. The unpaid-only definition (`paid < total_due` alone) gives app 1.04 % — Timur's tile; one boolean term is the whole 0.66-point argument between two departments.

> 🎯 **Interview version.** *"Compute DPD per loan in pandas from a schedule and a payments table."* — de-duplicate and cut payments at the as-of; `groupby(installment_id).sum()`; left-merge onto instalments with `validate="1:1"` and assert the row count; unpaid = paid < due, matured = due ≤ as-of; per loan `as_of − min(due_date)` of unpaid matured rows; `pd.cut` for buckets; reconcile the 399 and the bucket counts against the warehouse before anyone uses it as a model target.

**Say it like in an interview.** Answer the question above in your own words, as you would say it aloud, with Nur Finance's numbers.

```task
{"id": "w05d3-int", "kind": "free", "min": 30, "model": "I start from the payments: remove the duplicate rows on instalment, date and amount — 25 of them at Nur Finance — and keep only payments made on or before the as-of. Then I sum what was paid per instalment and left-merge that onto the full schedule with validate=\"1:1\", asserting the row count stays 92 193 and only then filling the missing paid amounts with 0. An instalment is late if it is matured and paid is less than due; per loan, DPD is the as-of minus the oldest such due date, and every other loan gets 0. I bucket it with pd.cut and reconcile before anyone uses it: 399 loans late, buckets 7 429 / 124 / 25 / 16 / 234, equal to the SQL loan by loan.", "rubric": ["De-duplicates payments and cuts them at the as-of", "Left merge (not inner) with validate and a row-count assert; fillna after the merge", "DPD = as-of − the oldest unpaid matured due date, 0 otherwise", "Reconciles against the warehouse (399 / buckets) before use"]}
```

Tomorrow: the numbers become pictures — matplotlib, seaborn, and `pd.read_sql`, which lets every week-3 CTE land straight in a DataFrame. Timur's figure pack.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w05d3", "pass": 0.8, "questions": [
  {"type": "single", "q": "You need each payment's share of its loan's total, on every payment row. Which call gives the loan total per row?", "options": ["pay.pivot_table(index=\"loan_id\", values=\"amount\")", "pay.groupby(\"loan_id\")[\"amount\"].transform(\"sum\")", "pay.groupby(\"loan_id\")[\"amount\"].agg(\"sum\")", "pay[\"amount\"].sum()"], "answer": 1, "explain": "agg returns one row per group; transform returns one value per original row — the window function SUM() OVER (PARTITION BY) (→ section 1, 'transform')."},
  {"type": "single", "q": "You expected len(m) == 92 193. Why is it smaller?", "code": "m = inst.merge(paid, on=\"installment_id\")\nlen(inst), len(m)", "options": ["merge defaults to how=\"inner\", so instalments with no payment vanish", "paid has duplicate installment_ids", "installment_id is text in one of the tables", "merge drops rows with NaN in any column"], "answer": 0, "explain": "The default join is inner; use how=\"left\", fillna(0) after the merge, and assert len(m) == len(inst) (→ section 1, 'merge', P6)."},
  {"type": "number", "q": "inst has 10 instalments; paid has one row for each of the 6 instalments that received a payment. How many rows does m have?", "code": "m = inst.merge(paid, on=\"installment_id\")\nlen(m)", "answer": 6, "tol": 0, "explain": "The default join is inner: only instalments with a payment survive, and the 4 without a payment — exactly the ones DPD needs — vanish; how=\"left\" keeps all 10 (→ section 1, 'merge')."},
  {"type": "single", "q": "installments.merge(payments_raw, on=\"installment_id\", validate=\"1:1\") raises MergeError on the raw payments file. What does it tell you?", "options": ["pandas cannot validate more than 50 000 rows", "The merge must be rewritten as a loop", "Some instalments have more than one payment row (here the duplicate payments), so payments to instalments is m:1 — the grain you stated was wrong", "installment_id has NaN values"], "answer": 2, "explain": "validate turns a wrong belief about the grain into an error before any number is wrong — the week-2 fan-out, caught (→ section 1, 'validate= and indicator=', P8)."},
  {"type": "multi", "q": "Which statements about duplicated / drop_duplicates are true?", "options": ["Without subset= it compares all columns, and finds 0 payment duplicates because payment_id differs", "subset= defines what 'the same' means", "drop_duplicates keeps the first row in the current order, so sort first", "duplicated(keep=False) marks every member of a duplicate group", "It always keeps the row with the lowest id, whatever the order"], "answer": [0, 1, 2, 3], "explain": "The key defines sameness, the sort defines the survivor, the assert proves both (→ section 1, 'Duplicates')."},
  {"type": "single", "q": "pd.to_datetime(birth_date, errors=\"coerce\") produces 0 NaT. Are the birth dates clean?", "options": ["Yes, if the dtype is datetime64", "No — parsing is syntax; 2031-04-12 parses fine and still breaks the business rule", "No — coerce silently turns bad dates into 1900-01-01", "Yes — every value parsed"], "answer": 1, "explain": "Validity is a rule you write (not in the future, not before 1920); flag and blank with .where, never guess a date (→ section 1, 'Dates that lie')."},
  {"type": "single", "q": "What does the concat produce?", "code": "a = pay[pay[\"region\"] == \"Tashkent\"]\nb = pay[pay[\"region\"] != \"Tashkent\"].rename(columns={\"amount\": \"Amount\"})\npd.concat([a, b])", "options": ["All rows and one column more: amount is NaN in b's rows, Amount is NaN in a's", "An error: the column names differ", "Only the columns both frames share", "One amount column — pandas ignores case"], "answer": 0, "explain": "concat matches columns by name, without an error; assert set(a.columns) == set(b.columns) before every concat (→ section 1, 'concat', P9)."},
  {"type": "single", "q": "Company corner: in the DPD function, a late loan's DPD is…", "options": ["as-of − the due date of its oldest matured instalment that is not fully paid", "as-of − the disbursement date", "the number of unpaid instalments × 30", "as-of − the due date of its most recent unpaid instalment"], "answer": 0, "explain": "Per loan: AS_OF − min(due_date) over instalments that are matured and not fully paid; 0 when nothing is late (→ Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w05d3", "q": "Sevara wants the collections ranking for the last quarter by branch. Take the instalments due from 1 July to 30 September 2026 (installments.csv), what was paid on each through the as-of 2026-10-01 (payments_dirty.csv, de-duplicated as in today's Detective), and the loan's branch from loans_status.csv. Collection rate = Σ paid ÷ Σ total_due. What is the rate of the WORST branch? Give a percentage to 2 decimals.", "type": "number", "dp": 2, "python": true, "h": ["8aa6be7c2de4b2c386aeab63"], "hint": "Today's Company corner already builds the instalment-level frame with paid next to total_due; one more merge brings the branch — check its grain with validate before you group.", "sol": "QVNfT0YgPSBwZC5UaW1lc3RhbXAoIjIwMjYtMTAtMDEiKQppbnN0ID0gcGQucmVhZF9jc3YoIi4uL2V4Y2VsL2luc3RhbGxtZW50cy5jc3YiLCBwYXJzZV9kYXRlcz1bImR1ZV9kYXRlIl0pCnBheSA9IHBkLnJlYWRfY3N2KCIuLi9leGNlbC9wYXltZW50c19kaXJ0eS5jc3YiLCBwYXJzZV9kYXRlcz1bInBhaWRfYXQiXSkKcGF5ID0gcGF5LnNvcnRfdmFsdWVzKCJwYXltZW50X2lkIikuZHJvcF9kdXBsaWNhdGVzKHN1YnNldD1bImluc3RhbGxtZW50X2lkIiwgInBhaWRfYXQiLCAiYW1vdW50Il0pICAgIyA1MiA4NTAKcGFpZCA9IHBheVtwYXlbInBhaWRfYXQiXSA8PSBBU19PRl0uZ3JvdXBieSgiaW5zdGFsbG1lbnRfaWQiLCBhc19pbmRleD1GYWxzZSkuYWdnKHBhaWQ9KCJhbW91bnQiLCAic3VtIikpCm0gPSBpbnN0Lm1lcmdlKHBhaWQsIG9uPSJpbnN0YWxsbWVudF9pZCIsIGhvdz0ibGVmdCIsIHZhbGlkYXRlPSIxOjEiKS5maWxsbmEoeyJwYWlkIjogMH0pCmxvYW5zID0gcGQucmVhZF9jc3YoIi4uL2V4Y2VsL2xvYW5zX3N0YXR1cy5jc3YiKQptID0gbS5tZXJnZShsb2Fuc1tbImxvYW5faWQiLCAiYnJhbmNoIl1dLCBvbj0ibG9hbl9pZCIsIGhvdz0ibGVmdCIsIHZhbGlkYXRlPSJtOjEiKQpxMyA9IG1bKG1bImR1ZV9kYXRlIl0gPj0gIjIwMjYtMDctMDEiKSAmIChtWyJkdWVfZGF0ZSJdIDwgIjIwMjYtMTAtMDEiKV0KZyA9IHEzLmdyb3VwYnkoImJyYW5jaCIpLmFnZyhkdWU9KCJ0b3RhbF9kdWUiLCAic3VtIiksIHBhaWQ9KCJwYWlkIiwgInN1bSIpKQpnWyJyYXRlIl0gPSAxMDAgKiBnWyJwYWlkIl0gLyBnWyJkdWUiXQpnLnNvcnRfdmFsdWVzKCJyYXRlIikuaGVhZCgzKQojIEJ1a2hhcmEgQ2VudHJhbCA5Mi44MCDCtyBUYXNoa2VudCBTb3V0aCA5My4zNSDCtyBOYW1hbmdhbiBDZW50cmFsIDkzLjU0IOKApiBiZXN0IFRlcm1leiBDZW50cmFsIDk4LjQ5Cgo5Mi44MCAlOiBCdWtoYXJhIENlbnRyYWwgY29sbGVjdGVkIDMuMTggYm4gb2YgdGhlIDMuNDMgYm4gdGhhdCBmZWxsIGR1ZSBpbiBRMyDigJQgdGhlIHdvcnN0IG9mIHRoZSB0ZW4gYnJhbmNoZXMsIGFsbW9zdCBzaXggcG9pbnRzIGJlaGluZCBUZXJtZXogQ2VudHJhbC4KVGhlIHR3byB0cmFwcyBhcmUgYW4gaW5uZXIgbWVyZ2UgKHRoZSB1bnBhaWQgaW5zdGFsbWVudHMgdmFuaXNoIGFuZCBldmVyeSByYXRlIGNsaW1icyB0b3dhcmRzIDEwMCAlKSBhbmQgdGhlIGR1cGxpY2F0ZSBwYXltZW50cyAobGVmdCBpbiwgdGhleSBhZGQgMzguMyBtIHRvIHRoZSBRMyBpbnN0YWxtZW50cyDigJQgNTguNCBtIG92ZXIgdGhlIHdob2xlIGJvb2sg4oCUIHRoYXQgd2FzIG5ldmVyIHBhaWQgdHdpY2UpLgpTZXB0ZW1iZXIgaW5zdGFsbWVudHMgaGF2ZSBoYWQgbGl0dGxlIHRpbWUgdG8gYmUgcGFpZCwgc28gYWxsIGJyYW5jaGVzIGxvb2sgd29yc2UgdGhhbiBpbiBKdWx5OyB0aGUgcmFua2luZywgbm90IHRoZSBsZXZlbCwgaXMgdGhlIGZpbmRpbmcu"}
```

<!-- challenge:end -->
