# Week 5 · Day 3 — pandas II: groupby, merge and the cleaning pipeline

<span class="badge">Learn 60 min</span> <span class="badge">Detective 40 min</span> <span class="badge">Practice 45 min</span> <span class="badge hw">HW 5.1 due · HW 5.2 (due Day 5)</span> <span class="badge company">Company corner</span>

> STORY **Wednesday, 9:05.** Nilufar, risk (*риск-аналитик*), with Jasur behind her. *"Your Power Query pipeline works — on my laptop. Jasur's server has no Excel. He wants the same cleaning as a script he can schedule: `customers_dirty.csv` and `payments_dirty.csv` in, 6 000 people and 52 850 payments out, every Monday at 6:00, and a DPD per loan computed from the schedule so his model has a target."* Jasur: *"And I want to see the asserts. A pipeline that cannot prove its own counts is a pipeline I cannot trust at 6:00 in the morning."*

## Today in 3 lines

- **`groupby` / `agg`** is `GROUP BY` with named outputs; **`transform`** is the window function (a group total next to every row); **`merge`** is the join, with `how=`, `validate=` and `indicator=` as the safety belts you never had in SQL; `concat` is `UNION ALL`; `pivot_table` is the cross-tab.
- Cleaning is the same three repairs as week 4 — text (`.str.strip().str.lower()`, `replace`), dates (`to_datetime(errors="coerce")` **plus the business rule**), duplicates (`duplicated` / `drop_duplicates(subset=, keep=)` after a sort) — written once, checked with `assert`, re-run forever.
- You can reproduce every week-4 cleaning count in pandas — duplicate people (and the name-key trap), impossible birth dates, duplicate payments, method spellings — and compute **DPD for every loan** from `installments.csv` + payments, checked against the SQL column loan by loan.

---

## 1. Learn — several tables, one notebook

### Today's frames

Run this block first (▶ Run); every block below uses its five frames. `pay` is already de-duplicated and its `method` repaired — the two repairs you learn further down — so the numbers in the comments match the clean book; `pay_raw` keeps the file as recorded.

```python
import pandas as pd
import numpy as np
AS_OF = pd.Timestamp("2026-10-01")
pay_raw = pd.read_csv("../excel/payments_dirty.csv", parse_dates=["paid_at"])     # 52 875 rows, as recorded
pay = (pay_raw.sort_values("payment_id")
              .drop_duplicates(subset=["installment_id", "paid_at", "amount"])     # 52 850 — the dedup, explained below
              .assign(method=lambda d: d["method"].str.strip().str.lower().replace({"bank transfer": "transfer"})))
cust = pd.read_csv("../excel/customers_dirty.csv")                                 # 6 040 rows, dirty on purpose
inst = pd.read_csv("../excel/installments.csv", parse_dates=["due_date"])          # 92 193 instalments
loans = pd.read_csv("../excel/loans_status.csv", parse_dates=["disbursed_at"])     # 7 828 loans
len(pay_raw), len(pay), len(cust), len(inst), len(loans)
```

### groupby and agg — GROUP BY with names

```python
pay.groupby("region").agg(payments=("payment_id", "size"), total=("amount", "sum"), avg=("amount", "mean"))
#            payments        total      avg
# Tashkent      20437  102605410110  5020571
# Fergana        6334   34437790032  5436973 …
pay.groupby(["product", "method"]).size().unstack(fill_value=0)      # two keys → a cross-tab
pay.groupby("region")["amount"].sum().sort_values(ascending=False)   # one aggregate, one column
```

`groupby("key")` splits the frame into groups; `.agg(name=("column", "function"))` — **named aggregation** — computes one output per group and names it, like `SUM(amount) AS total`. Functions: `"size"` (rows, like `COUNT(*)`), `"count"` (non-null, like `COUNT(col)` — on `monthly_income` by segment: size 3 585, count 3 377), `"sum"`, `"mean"`, `"median"`, `"min"`, `"max"`, `"nunique"`, `"first"`, or your own function. The keys become the **index** of the result; `as_index=False` or `.reset_index()` turns them back into columns when you want to merge or plot. Several keys → a `MultiIndex`; `.unstack()` moves the last key into columns.

```game
{"type": "cloze", "id": "w05d3-g1", "title": "Total paid per region", "text": "pay.groupby({{0}})[{{1}}].{{2}}()     # Σ amount per region", "blanks": [["\"region\""], ["\"amount\""], ["sum"]], "distractors": ["\"payment_id\"", "transform", "mean"]}
```

> ⚠️ **Watch out.** `groupby` drops rows whose key is NaN — silently. Group customers by a column with blanks and the blank group is simply not in the result; pass `dropna=False` to see it as a row (week 2's NULL band again). And on a `category` key, pass `observed=True`, or pandas adds a row for every category that has no data.

### transform — the window function

```python
pay["loan_total"] = pay.groupby("loan_id")["amount"].transform("sum")   # SUM(amount) OVER (PARTITION BY loan_id)
pay["share"] = pay["amount"] / pay["loan_total"]                        # each payment's share of its loan's payments
cust["seg_median"] = cust.groupby("segment")["monthly_income"].transform("median")
above = (cust["monthly_income"] > cust["seg_median"]).sum()             # raw customers_dirty.csv: 2 841 earn above their segment's median
```

`transform` returns a value **per original row** aligned to the frame — week 3's `OVER (PARTITION BY …)`. Use it for shares of a group total, for "difference from the group mean", for `cumsum` running totals inside groups (`groupby("loan_id")["amount"].cumsum()`), for `rank` inside groups, and — the dedup trick — `groupby(key).cumcount()` is `ROW_NUMBER() OVER (PARTITION BY key)`.

> 💡 **Key idea.** `agg` collapses: **one row per group** (`GROUP BY`). `transform` keeps the shape: **one value per original row**, the group's number written next to every member (the window function). Ask "how many rows do I want back?" and the choice makes itself.

### merge — the join, with safety belts

```python
paid = pay[pay["paid_at"] <= AS_OF].groupby("installment_id", as_index=False).agg(paid=("amount", "sum"))
m = inst.merge(paid, on="installment_id", how="left", validate="1:1", indicator=True)
m["_merge"].value_counts()      # both · left_only · right_only — read the three counts (Detective step 5)
```

`left.merge(right, on="key", how=...)`: `"inner"`, `"left"`, `"right"`, `"outer"`. `left_on=` / `right_on=` when the names differ; `on=["a", "b"]` for a two-column key. Two arguments SQL never gave you: **`validate="1:1"` / `"m:1"` / `"1:m"`** raises `MergeError` if the key is not unique on the side you promised — the week-2 fan-out (Σ principal ×24.7 after joining instalments) becomes an error instead of a wrong number; **`indicator=True`** adds a `_merge` column saying where each row came from — the anti-join is `m[m["_merge"] == "left_only"]`. Columns with the same name on both sides get `_x` / `_y`; pass `suffixes=("", "_sql")` to control it. Count rows before and after, every time: a left merge must keep exactly `len(left)` rows.

> ⚠️ **Watch out.** The default is `how="inner"`, **not** `left`. A forgotten `how=` drops every instalment that has no payment — exactly the unpaid ones DPD is about — and nothing warns you. Write `how=` on every merge and follow it with `assert len(m) == len(inst)`.

| `how=` | SQL (week 2) | Power Query (week 4) | Rows kept |
|---|---|---|---|
| `"inner"` (default) | `INNER JOIN` | Inner | only matches — the instalments with a payment |
| `"left"` | `LEFT JOIN` | Left Outer | every left row — 92 193 instalments, `paid` NaN where none |
| `"right"` | `RIGHT JOIN` | Right Outer | every right row |
| `"outer"` | `FULL OUTER JOIN` | Full Outer | everything from both — the roll-rate join of two snapshots |
| `indicator=True` + `left_only` | `LEFT JOIN … WHERE right IS NULL` | Left Anti | the anti-join |

```game
{"type": "match", "id": "w05d3-g2", "title": "Which join is it?", "pairs": [["how=\"inner\"", "INNER JOIN — only the matches"], ["how=\"left\"", "LEFT JOIN — every left row, NaN where no match"], ["how=\"outer\"", "FULL OUTER JOIN — everything from both sides"], ["indicator=True + \"left_only\"", "the anti-join: LEFT JOIN … WHERE right IS NULL"], ["validate=\"m:1\"", "an error if the right-hand key is not unique"], ["pd.concat([a, b])", "UNION ALL — stack rows, match columns by name"]]}
```

### concat — UNION ALL; pivot_table — the cross-tab

```python
a = pay[pay["region"] == "Tashkent"]
b = pay[pay["region"] != "Tashkent"]
pd.concat([a, b])                                    # Tashkent + the rest = every row again, matched by column NAME
pd.concat([a, b], ignore_index=True)                 # renumber the index
pd.pivot_table(loans, index="bucket", columns="product", values="loan_id", aggfunc="count", fill_value=0, margins=True)
pd.crosstab(loans["grade"], loans["bucket"])         # counts only, shorter
```

`concat` stacks frames; it matches columns **by name**, so a column spelt `Amount` in one file becomes a second column full of NaN — week 4's Append lesson. `pivot_table(index, columns, values, aggfunc)` is Excel's PivotTable: `aggfunc="sum"` / `"mean"` / `"count"`, `margins=True` for the totals row, `fill_value=0` for empty cells. `pivot` (no aggregation) reshapes long → wide when each cell already has one value — `monthly_disbursements.csv` (170 rows) becomes 34 months × 5 products; `melt` goes back to long, which is the shape seaborn wants tomorrow.

### apply vs vectorised

```python
def dpd_bucket(dpd):                                     # HW 5.1's function, in one line
    return "0" if dpd <= 0 else "1-30" if dpd <= 30 else "31-60" if dpd <= 60 else "61-90" if dpd <= 90 else "90+"

inst["total"] = inst["principal_due"] + inst["interest_due"]                              # vectorised: 0.7 ms on 92 193 rows
inst["total"] = inst.apply(lambda r: r["principal_due"] + r["interest_due"], axis=1)      # row-wise apply: ~1 000× slower (seconds on the page)
loans["bucket_fn"] = loans["dpd"].apply(dpd_bucket)      # fine for a label function on one column (0.7 ms vs pd.cut's 0.4)
```

`apply` runs a Python function once per row (or per value) — a `for` loop in disguise. It is the right tool for a one-off label function or logic too twisted for arithmetic; it is the wrong tool whenever an arithmetic or `pd.cut` / `np.where` / `.str` spelling exists. The rule of thumb: if you wrote `axis=1`, ask whether column arithmetic would do.

### The `.str` accessor — text repair for a whole column

```python
cust["first_name"].str.strip()                           # TRIM            — the trailing spaces go
cust["first_name"].str.title()                           # PROPER          — 'MALIKA' → 'Malika'; also 'buy now pay later' → 'Buy Now Pay Later', so names only
pay_raw["method"].str.strip().str.lower()                # the week-2 LOWER(TRIM())
pay_raw["method"].str.strip().str.lower().replace({"bank transfer": "transfer"}).value_counts()   # whole-value replace (a dict) → 5 methods
# more: .str.contains(" "), .str.len(), .str.startswith("approved"), .str.split(" ").str[0], .str.replace(r"^998", "+998", regex=True)
```

`.str.<method>` applies a string method to every value and leaves NaN alone. `Series.replace(dict)` swaps whole values; `.str.replace(a, b)` edits inside the text (regex optional). Chain them in the order that reads like the change log: strip → lower → replace.

### Duplicates: find, look, then drop

```python
key = ["installment_id", "paid_at", "amount"]
dup_mask = pay_raw.duplicated(subset=key, keep=False)                    # True on ALL members of a group — 50 rows
pay_raw[dup_mask].sort_values(["installment_id", "payment_id"])          # look before you delete
pay_clean = pay_raw.sort_values("payment_id").drop_duplicates(subset=key, keep="first")   # keep the lowest payment_id → 52 850
```

`duplicated(subset=, keep=)`: `keep="first"` marks the later copies (the ones that will go), `keep=False` marks every member (for looking). `drop_duplicates` with the same arguments removes them, keeping the first row **in the current order** — so **sort first**: by `payment_id` to keep the earliest payment, by `registered_at` to keep the customer's original registration. Without `subset=` it compares all columns and finds 0 here, because the `payment_id` differs — week 4's "tick all columns" trap, in a parameter.

> 💡 **Key idea.** The key defines sameness; the sort defines the survivor; the assert on the count proves both.

### Dates that lie: `errors="coerce"` and the business rule

```python
cust["birth_date"] = pd.to_datetime(cust["birth_date"], errors="coerce")   # unparseable → NaT (not a crash) — count the NaT
bad = (cust["birth_date"] > AS_OF) | (cust["birth_date"] < "1920-01-01")   # the business rule finds what parsing cannot
cust["birth_date_invalid"] = bad
cust["birth_date_clean"] = cust["birth_date"].where(~bad)                   # keep the date where valid, NaT where not
```

`.where(cond)` keeps values where the condition holds and blanks the rest (`np.where(cond, a, b)` is the two-sided `IF`). Never replace a bad date with a plausible one — flag + blank, as in week 4.

> ⚠️ **Watch out.** `errors="coerce"` protects you from `"n/a"` and `"31.02.2026"`; it does **not** protect you from `2031-04-12`, a perfectly parseable lie. Parsing is syntax; validity is a business rule, and the rule is yours to write: not in the future, not before 1920.

### assert — the pipeline that checks itself

```python
assert len(pay_clean) == 52_850, f"expected 52 850 payments, got {len(pay_clean)}"
assert pay["method"].nunique() == 5
assert len(m) == len(inst)                           # a left merge keeps every instalment
assert (m["_merge"] != "right_only").all()           # no payment without an instalment
```

`assert condition, message` stops the notebook with `AssertionError` when the condition is False and does nothing otherwise. Put one after every step whose count you know — rows after dedup, rows after a left merge (`== len(left)`), a sum that must reconcile — and a Monday run either finishes or tells you exactly which step broke. This is what Jasur meant: the counts are *in* the script, not in your memory.

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

Reproduce week 4's counts step by step. Each step has an editor that loads the raw file; print the numbers, then ✔ Check. In Jupyter, `data/python/day3_starter.ipynb` has the walk-through cells in its first half.

**Step 1 — the dirt inventory on `customers_dirty.csv`** with `.str`: trailing spaces in `first_name`, all-caps first names, all-lower surnames, ids above 6 000.

```task
{"id": "w05d3-d1", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nc = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# your code\n", "answer": 18, "dp": 0, "hint": "The check looks for the number of first names with trailing spaces: compare the column with its .str.strip() version.", "model": "print((c.first_name != c.first_name.str.strip()).sum())    # 18\nprint(c.first_name.str.isupper().sum())                     # 22\nprint((c.last_name == c.last_name.str.lower()).sum())       # 40\nprint((c.customer_id > 6000).sum())                         # 40\n\nThe 22 + 18 land on the 40 lower-case surnames, ids 6001–6040 — the same suspicion as week 4, four lines instead of four SUMPRODUCTs."}
```

**Step 2 — prove the duplicates** three ways: `duplicated(subset=[normalised first, last, birth_date])`, `subset=["phone", "birth_date"]`, `subset=["phone"]`.

```task
{"id": "w05d3-d2", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nc = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# your code\n", "answer": 40, "dp": 0, "hint": "The check looks for the extras on phone + birth_date. duplicated(subset=[...]).sum() counts the later copies.", "model": "c[\"fn\"] = c.first_name.str.strip().str.lower(); c[\"ln\"] = c.last_name.str.strip().str.lower()\nprint(c.duplicated(subset=[\"fn\", \"ln\", \"birth_date\"]).sum())                  # 42\nprint(c.duplicated(subset=[\"first_name\", \"last_name\", \"birth_date\"]).sum())  # 2 — raw names hide 40\nprint(c.duplicated(subset=[\"phone\", \"birth_date\"]).sum())                     # 40\nprint(c.duplicated(subset=[\"phone\"]).sum())                                    # 43\n\nThe name key finds 42 — the 40 plus two namesakes (823/1197 Nodir Nazarov, 2460/5562 Eldor Karimov: different people). phone + birth_date finds exactly ids 6001–6040 (6001 MALIKA jalilova ↔ 4516 Malika Jalilova). phone alone: 43 — three family numbers. All 40 duplicates were registered after their original, so sort_values(\"registered_at\") + keep=\"first\" keeps the originals; \"registered in 2026\" falls 955 → 945."}
```

**Step 3 — the dates.** `pd.to_datetime(errors="coerce")`, count the NaT, then the business rule.

```task
{"id": "w05d3-d3", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\nc = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# your code\n", "answer": 7, "dp": 0, "hint": "The check looks for the dates the business rule rejects: after the as-of or before 1920-01-01.", "model": "c[\"birth_date\"] = pd.to_datetime(c[\"birth_date\"], errors=\"coerce\")\nprint(c[\"birth_date\"].isna().sum())                                            # 0 NaT\nbad = (c[\"birth_date\"] > AS_OF) | (c[\"birth_date\"] < \"1920-01-01\")\nprint(bad.sum())                                                                # 7\nprint(c.loc[bad, [\"customer_id\", \"birth_date\"]])\n\ncoerce alone finds nothing — every value is a valid ISO date. The rule finds 7: 927, 2338, 3380 (2031-04-12), 964 (2027-02-28), 957, 1020, 2934 (1900-01-01). Age as (AS_OF - birth_date).dt.days / 365.25 gives the same 7 as < 18 or > 100; valid customers average 45.7 years. Flag and blank with .where(~bad) — never a guess."}
```

**Step 4 — payments.** `method.value_counts()` raw and clean; `duplicated` on the three-column key; Σ of the extras.

```task
{"id": "w05d3-d4", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\npay_raw = pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\n\n# your code\n", "answer": 58397800, "dp": 0, "hint": "The check looks for the sum of the extra copies: duplicated(subset=key, keep=\"first\") marks exactly the rows that will go.", "model": "five = [\"card\", \"payme\", \"cash\", \"click\", \"transfer\"]\nprint(pay_raw[\"method\"].nunique(), (~pay_raw[\"method\"].isin(five)).sum())     # 10 spellings, 180 dirty rows\nclean = pay_raw[\"method\"].str.strip().str.lower().replace({\"bank transfer\": \"transfer\"})\nprint(clean.nunique())                                                           # 5\nkey = [\"installment_id\", \"paid_at\", \"amount\"]\nextra = pay_raw.sort_values(\"payment_id\").duplicated(subset=key, keep=\"first\")\nprint(extra.sum(), pay_raw.sort_values(\"payment_id\").loc[extra, \"amount\"].sum())  # 25 58397800\n\n25 extras, Σ 58 397 800 — Timur's 58 million; all 25 have payment_id > 52 850, and duplicated() without subset finds 0. After the dedup: 52 850 rows, Σ 255 114 772 176; 24 forward-dated rows (53 438 947) flagged, kept. Clean counts: card 17 612 · payme 8 897 · cash 8 788 · click 8 786 · transfer 8 767."}
```

**Step 5 — the merge that computes DPD** (the Company corner has the full version): aggregate clean payments `paid_at <= AS_OF` per instalment, left-merge onto `installments.csv` with `validate="1:1", indicator=True`. How many matured instalments are not fully paid?

```task
{"id": "w05d3-d5", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\ninst = pd.read_csv(\"../excel/installments.csv\", parse_dates=[\"due_date\"])\npay = (pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\n         .sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"]))\n\n# your code\n", "answer": 1784, "dp": 0, "hint": "The check looks for matured (due_date <= AS_OF) and paid < total_due. fillna(0) after the merge, not before.", "model": "paid = pay[pay[\"paid_at\"] <= AS_OF].groupby(\"installment_id\", as_index=False).agg(paid=(\"amount\", \"sum\"))\nm = inst.merge(paid, on=\"installment_id\", how=\"left\", validate=\"1:1\", indicator=True)\nprint(m[\"_merge\"].value_counts())                    # both 52826 · left_only 39367 · right_only 0\nm[\"paid\"] = m[\"paid\"].fillna(0)\nmatured = m[\"due_date\"] <= AS_OF\nprint(matured.sum(), (matured & (m[\"paid\"] < m[\"total_due\"])).sum())   # 54207 1784\n\n1 784 unpaid matured instalments, 403 of them partially paid — week 4 P8's numbers. (paid > total_due).sum() is 0 after the dedup and 25 before it: the duplicates were the only over-payments in the book. Loans with an unpaid matured instalment: 413; with dpd > 0: 399 (14 fell due on the as-of day itself, dpd 0)."}
```

---

## 3. Practice (45 min)

Each editor loads what the task needs — the payments starter gives you both `pay_raw` (as recorded) and `pay` (de-duplicated). Print the number, then ✔ Check. In Jupyter, add a cell per task to `day3_starter.ipynb`.

**P1.** Payments per `region`: count, total, average — on the dirty file and on the clean one. Which region lost the most money to the dedup?

```task
{"id": "w05d3-p1", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\npay_raw = pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\npay = pay_raw.sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"])   # clean: 52 850\n\n# your code\n", "answer": 24951300, "dp": 0, "hint": "The check looks for the largest loss in soum: total per region on the raw file minus total on the clean one.", "model": "g = lambda d: d.groupby(\"region\").agg(payments=(\"payment_id\", \"size\"), total=(\"amount\", \"sum\"), avg=(\"amount\", \"mean\"))\nprint(g(pay))\nlost = (g(pay_raw)[\"total\"] - g(pay)[\"total\"]).sort_values(ascending=False)\nprint(lost)        # Samarkand 24951300 · Fergana 17964000 · Andijan 7666600 · Tashkent 5247900 …\n\nClean: Tashkent 20 437 / 102 605 410 110 / 5.02 m · Fergana 6 334 / 34 437 790 032 · Samarkand 6 037 / 27 576 625 156 · Andijan 4 724 / 24 138 491 453 · Namangan 4 782 / 21 044 366 065 · Bukhara 4 088 / 16 162 119 575 · Termez 3 218 / 15 956 940 146 · Nukus 3 230 / 13 193 029 639. Samarkand lost most (24 951 300) on 3 rows; Tashkent had 7 of the 25 rows but lost only 5 247 900."}
```

**P2.** A cross-tab of clean payments: `product` × `method` counts with `groupby(...).size().unstack()`, then the same with `pivot_table`. Read SME's row.

```task
{"id": "w05d3-p2", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\npay_raw = pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\npay = pay_raw.sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"])   # clean: 52 850\npay[\"method\"] = pay[\"method\"].str.strip().str.lower().replace({\"bank transfer\": \"transfer\"})            # 5 methods\n\n# your code\n", "answer": 2701, "dp": 0, "hint": "The check looks for SME's card count.", "model": "ct = pay.groupby([\"product\", \"method\"]).size().unstack(fill_value=0)\nprint(ct.loc[\"Small business loan\"])     # card 2701 · cash 1334 · click 1390 · payme 1401 · transfer 1396\npt = pd.pivot_table(pay, index=\"product\", columns=\"method\", values=\"payment_id\", aggfunc=\"count\", fill_value=0)\nprint((ct == pt).all().all())            # True\n\nThe same 33 / 17 / 17 / 17 / 17 % mix as the whole book: method does not depend on product."}
```

**P3.** `transform`: add each customer's segment median income next to them; how many earn above it? Then `cumcount` per `phone` as the `ROW_NUMBER` of week 3 — how many rows get 1 or more?

```task
{"id": "w05d3-p3", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\ncust = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# your code\n", "answer": 2841, "dp": 0, "hint": "The check looks for the count above the segment median on the raw file.", "model": "cust[\"seg_median\"] = cust.groupby(\"segment\")[\"monthly_income\"].transform(\"median\")\nprint((cust[\"monthly_income\"] > cust[\"seg_median\"]).sum())              # 2841\nrn = cust.sort_values(\"registered_at\").groupby(\"phone\").cumcount()\nprint((rn >= 1).sum())                                                   # 43\n\nMedians mass 5.79 m · affluent 25.28 m · sme 33.21 m; the 356 NaN compare False. On the 6 000 clean customers (P6) the answer is 2 823 — say which frame you used. cumcount on phone gives 43 rows ≥ 1 — the 40 duplicates plus three family-shared numbers; with [\"phone\", \"birth_date\"] as the key, exactly 40. Sort by registered_at first or the \"0\" may be the later copy."}
```

**P4.** The inner-merge trap: repeat Step 5 with the default `how`. How many rows, and which loans would the DPD computation then miss?

```task
{"id": "w05d3-p4", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\ninst = pd.read_csv(\"../excel/installments.csv\", parse_dates=[\"due_date\"])\npay = (pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\n         .sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"]))\n\n# your code\n", "answer": 52826, "dp": 0, "hint": "The check looks for the row count of the merge without how=.", "model": "paid = pay[pay[\"paid_at\"] <= AS_OF].groupby(\"installment_id\", as_index=False).agg(paid=(\"amount\", \"sum\"))\nm = inst.merge(paid, on=\"installment_id\")\nprint(len(inst), len(m))     # 92193 52826\n\nEvery instalment with no payment disappears, so an instalment that was never paid is not \"unpaid\", it is absent, and every loan whose arrears are total (the 234 in 90+ with months of nothing) looks current. how=\"left\" + fillna(0) is the LEFT JOIN … COALESCE(SUM, 0) of week 2; assert len(m) == len(inst) after the merge is the belt."}
```

**P5.** `validate`: merge clean payments onto `loans_status.csv` (`loan_id`) with `validate="m:1"` — fine. Now merge `installments.csv` onto the **raw** payments with `validate="1:1"` (`pay_raw.merge(inst, on="installment_id", validate="1:1")`), then onto the **clean** payments — what happens each time?

```task
{"id": "w05d3-p5", "kind": "choice", "options": ["Both merges pass — validate only checks the column types", "Raw: MergeError, because 25 instalments carry two payment rows; clean: it passes, because after the dedup every instalment has at most one payment", "Both raise MergeError — a payment table is always m:1", "Raw passes, clean fails — the dedup broke the key"], "answer": 1, "explain": "Raw: MergeError: Merge keys are not unique in left dataset; not a one-to-one merge — the 25 duplicate pairs make raw payments → instalments m:1, and stating the wrong grain is caught before any number is wrong. Clean: it passes — the partials are single payments smaller than total_due (week 3 P11), not several payments. Keep validate=\"m:1\" in the script anyway: it is the grain the business allows, and it will not break the day a real split payment arrives. Write the validate you believe; a MergeError is a free lesson about the data."}
```

**P6.** Clean `customers_dirty.csv` end to end in one chain (strip + title, flags, sort, dedup) and `assert` the four counts: 6 000 rows, 7 invalid dates, 354 missing incomes, no id above 6 000. Why 354 and not 356?

```task
{"id": "w05d3-p6", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\ncust = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# your code — print the missing incomes after the dedup\n", "answer": 354, "dp": 0, "hint": "The check looks for monthly_income.isna().sum() on the clean frame. Dedup on [\"phone\", \"birth_date\"] after sort_values(\"registered_at\").", "model": "c = cust.copy()\nfor col in [\"first_name\", \"last_name\"]:\n    c[col] = c[col].str.strip().str.title()\nc[\"birth_date\"] = pd.to_datetime(c[\"birth_date\"], errors=\"coerce\")\nc[\"birth_date_invalid\"] = (c[\"birth_date\"] > AS_OF) | (c[\"birth_date\"] < \"1920-01-01\")\nc[\"birth_date_clean\"] = c[\"birth_date\"].where(~c[\"birth_date_invalid\"])\nc = (c.sort_values(\"registered_at\").drop_duplicates(subset=[\"phone\", \"birth_date\"], keep=\"first\")\n      .sort_values(\"customer_id\"))\nassert len(c) == 6000 and c[\"birth_date_invalid\"].sum() == 7\nassert (c[\"customer_id\"] <= 6000).all()\nprint(c[\"monthly_income\"].isna().sum())     # 354\n\nTwo of the 40 duplicate rows copied a customer whose income is blank, so dropping them removes 2 of the 356 NaN. This chain is clean_customers in the notebook."}
```

**P7.** Collection rate by due month for 2026 from the merged frame of Step 5: `due_month = due_date.dt.to_period("M")`, `groupby` → Σ due, Σ paid, rate. Compare September with week 4.

```task
{"id": "w05d3-p7", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\ninst = pd.read_csv(\"../excel/installments.csv\", parse_dates=[\"due_date\"])\npay = (pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\n         .sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"]))\n\n# your code\n", "answer": 94.1, "dp": 1, "hint": "The check looks for September 2026's rate in %, one decimal.", "model": "paid = pay[pay[\"paid_at\"] <= AS_OF].groupby(\"installment_id\", as_index=False).agg(paid=(\"amount\", \"sum\"))\nm = inst.merge(paid, on=\"installment_id\", how=\"left\", validate=\"1:1\").fillna({\"paid\": 0})\ny = m[(m[\"due_date\"] >= \"2026-01-01\") & (m[\"due_date\"] < \"2026-10-01\")].copy()\ny[\"due_month\"] = y[\"due_date\"].dt.to_period(\"M\")\ng = y.groupby(\"due_month\").agg(due=(\"total_due\", \"sum\"), paid=(\"paid\", \"sum\"))\ng[\"rate\"] = (100 * g[\"paid\"] / g[\"due\"]).round(1)\nprint(g)\n\nJan 97.3 % · Feb 97.0 · Mar 96.8 · Apr 96.9 · May 97.1 · Jun 96.9 · Jul 96.7 · Aug 96.5 · Sep 94.1 % (3 305 instalments, 16 987 977 718 due, 15 982 118 926 paid) — identical to the Power Query table because the payments are cut at the as-of inside paid."}
```

**P8.** `apply` vs vectorised: compute `total_due` from its two parts both ways on the 92 193 instalments and time them (`%%timeit` in Jupyter, or `time.perf_counter()`). Then apply `dpd_bucket` from HW 5.1 to `dpd` and compare with `pd.cut`. Which statement is right?

```task
{"id": "w05d3-p8", "kind": "choice", "options": ["apply(axis=1) is about as fast — pandas vectorises it for you", "Column arithmetic is about a thousand times faster than apply(axis=1); a one-column label function with apply is fine", "pd.cut is a thousand times faster than apply on one column", "apply gives different totals from the arithmetic"], "answer": 1, "explain": "Row-wise apply(axis=1) ≈ 0.7 s; inst.principal_due + inst.interest_due ≈ 0.7 ms — both equal total_due on every row. dpd.apply(dpd_bucket) and pd.cut give identical labels on 7 828 rows in about a millisecond each — for a label function on one column apply is fine; axis=1 is the one to avoid."}
```

**P9.** `concat`: split clean payments into Tashkent and the rest, add a `source` column to each, concat with `ignore_index=True`. Rows? Then rename `amount` to `Amount` in one half and concat again — what does the result look like?

```task
{"id": "w05d3-p9", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\npay = (pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\n         .sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"]))\n\n# your code\n", "answer": 52850, "dp": 0, "hint": "The check looks for the row count of the concat.", "model": "a = pay[pay[\"region\"] == \"Tashkent\"].assign(source=\"tashkent\")\nb = pay[pay[\"region\"] != \"Tashkent\"].assign(source=\"rest\")\nu = pd.concat([a, b], ignore_index=True)\nprint(len(a), len(b), len(u))                     # 20437 32413 52850\nbad = pd.concat([a, b.rename(columns={\"amount\": \"Amount\"})], ignore_index=True)\nprint(bad.shape, bad[\"amount\"].isna().sum(), bad[\"Amount\"].isna().sum())   # one column more; 32413 / 20437 NaN\n\nsource says which half each row came from (lineage for the twelve monthly files). With Amount in one half: still 52 850 rows but one column more, amount NaN in 32 413 rows and Amount NaN in 20 437 — no error, a split column; assert set(a.columns) == set(b.columns) before every concat."}
```

> 🚀 **Stretch (optional, +5 XP).** **P10.** Reshape: `monthly_disbursements.csv` (170 long rows) → `pivot` to 34 months × 5 products, add a `total` column and SME's share per month; then `melt` it back to long. Which month had SME's highest share, and what was it in September 2026?

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
  {"type": "single", "q": "agg vs transform — which one is the window function?", "options": ["agg: one row per group", "transform: one value per original row, aligned to the frame — SUM() OVER (PARTITION BY)", "Both are window functions", "Neither — pandas has no window functions"], "answer": 1, "explain": "agg collapses to one row per group (GROUP BY); transform writes the group's value next to every member (→ section 1, 'groupby', 'transform')."},
  {"type": "single", "q": "You merge payments onto instalments and get fewer rows than the 92 193 instalments. What did you forget?", "options": ["validate=", "how=\"left\" — the default inner merge drops the instalments without a payment; assert len(m) == len(inst) would have caught it", "sort=True", "indicator=True"], "answer": 1, "explain": "The unpaid instalments are exactly the ones DPD needs (→ section 1, 'merge', P4)."},
  {"type": "single", "q": "pd.to_datetime(errors=\"coerce\") found 0 bad birth dates. Are the dates clean?", "options": ["Yes — every value parsed", "No — 2031-04-12 parses fine; validity needs the business rule (not after the as-of, not before 1920), which finds 7", "Yes, if the dtype is datetime64", "No — coerce turned them into 1900-01-01"], "answer": 1, "explain": "Parsing is syntax; validity is a rule you write (→ section 1, 'Dates that lie', Detective step 3)."},
  {"type": "single", "q": "You group customers by a column that has blanks. Where are the customers with a blank key?", "options": ["In a group called NaN", "Nowhere — groupby drops NaN keys unless you pass dropna=False", "In the first group", "groupby raises an error"], "answer": 1, "explain": "The blank group silently disappears; dropna=False shows it as a row (→ section 1, 'groupby')."}
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
inst = pd.read_csv("../excel/installments.csv", parse_dates=["due_date"])            # grain: instalment, 92 193
pay  = (pd.read_csv("../excel/payments_dirty.csv", parse_dates=["paid_at"])          # clean_payments(): 52 850
          .sort_values("payment_id").drop_duplicates(subset=["installment_id", "paid_at", "amount"]))

paid = (pay[pay["paid_at"] <= AS_OF]                                                # 1. payments through the as-of …
        .groupby("installment_id", as_index=False).agg(paid=("amount", "sum")))     #    … aggregated per instalment
m = inst.merge(paid, on="installment_id", how="left", validate="1:1")               # 2. every instalment kept
assert len(m) == len(inst)
m["paid"] = m["paid"].fillna(0)                                                     #    no payment = 0 paid
m["unpaid"]  = m["paid"] < m["total_due"]                                           # 3. not fully paid
m["matured"] = m["due_date"] <= AS_OF                                               #    and already due
late = m[m["unpaid"] & m["matured"]]                                                #    1 784 instalments
dpd = (AS_OF - late.groupby("loan_id")["due_date"].min()).dt.days.rename("dpd")     # 4. per loan: as-of − oldest unpaid due date
loans = (pd.read_csv("../excel/loans_status.csv")[["loan_id"]]                      # 5. every loan, 0 when nothing is late
         .merge(dpd, on="loan_id", how="left").fillna({"dpd": 0}).astype({"dpd": int}))
loans["bucket"] = pd.cut(loans["dpd"], [-1, 0, 30, 60, 90, np.inf], labels=["0", "1-30", "31-60", "61-90", "90+"])
(loans["dpd"] > 0).sum(), loans["bucket"].value_counts().sort_index()
```

`(loans.dpd > 0).sum()` → **399**; `loans.bucket.value_counts().sort_index()` → **7 429 / 124 / 25 / 16 / 234**; merged against `loans_status.csv`, `(dpd == dpd_sql).all()` → **True** for all 7 828 loans. Same definition, same rows, third tool, same number — which is the only acceptable outcome.

> 💡 **Key idea.** Where the pandas version is *better* than the SQL: `validate="1:1"` and the `assert` make the grain explicit; `AS_OF` is one variable, so the 1 September snapshot for roll rates is the same function with another argument; and the 25 duplicates are handled by a named step (`clean_payments`) rather than a view somebody has to remember to use.

**FPD30 by vintage × channel = one `pivot_table`.** The first instalment per loan, in scope if its due date is ≤ as-of − 30 days; late if not fully paid within 30 days (`paid < total_due` or `first_paid − due_date > 30`); vintage = month of disbursement; channel from the product (Day 2 P7: app sells Micro, partner sells BNPL, the branch everything else — `loans_status.csv` has no channel column):

```python
ls = pd.read_csv("../excel/loans_status.csv", parse_dates=["disbursed_at"])
loan_channel = ls[["loan_id", "disbursed_at"]].assign(
    channel=ls["product"].map({"Micro loan": "app", "Buy now pay later": "partner"}).fillna("branch"))
first = inst[(inst["installment_no"] == 1) & (inst["due_date"] <= AS_OF - pd.Timedelta(days=30))]
paid1 = pay[pay["paid_at"] <= AS_OF].groupby("installment_id", as_index=False).agg(paid=("amount", "sum"), first_paid=("paid_at", "min"))
f = first.merge(paid1, on="installment_id", how="left").fillna({"paid": 0})
f["fpd30"] = ((f["paid"] < f["total_due"]) | ((f["first_paid"] - f["due_date"]).dt.days > 30)).astype(int)
f = f.merge(loan_channel, on="loan_id", validate="1:1")          # loan_id, disbursed_at, channel
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
  {"type": "single", "q": "You expected len(m) == 92 193. Why is it smaller?", "code": "m = inst.merge(paid, on=\"installment_id\")\nlen(inst), len(m)", "options": ["merge defaults to how=\"inner\", so instalments with no payment vanish", "paid has duplicate installment_ids", "installment_id is text in one of the tables", "merge drops rows with NaN in any column"], "answer": 0, "explain": "The default join is inner; use how=\"left\", fillna(0) after the merge, and assert len(m) == len(inst) (→ section 1, 'merge', P4)."},
  {"type": "number", "q": "inst has 10 instalments; paid has one row for each of the 6 instalments that received a payment. How many rows does m have?", "code": "m = inst.merge(paid, on=\"installment_id\")\nlen(m)", "answer": 6, "tol": 0, "explain": "The default join is inner: only instalments with a payment survive, and the 4 without a payment — exactly the ones DPD needs — vanish; how=\"left\" keeps all 10 (→ section 1, 'merge')."},
  {"type": "single", "q": "installments.merge(payments_raw, on=\"installment_id\", validate=\"1:1\") raises MergeError on the raw payments file. What does it tell you?", "options": ["pandas cannot validate more than 50 000 rows", "The merge must be rewritten as a loop", "Some instalments have more than one payment row (here the duplicate payments), so payments to instalments is m:1 — the grain you stated was wrong", "installment_id has NaN values"], "answer": 2, "explain": "validate turns a wrong belief about the grain into an error before any number is wrong — the week-2 fan-out, caught (→ section 1, 'merge', P5)."},
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
