# Week 5 · Day 3 — pandas II: groupby, merge and the cleaning pipeline

<span class="badge">Learn 60 min</span> <span class="badge">Detective 40 min</span> <span class="badge">Practice 45 min</span> <span class="badge hw">HW 5.1 due · HW 5.2 (due Day 5)</span> <span class="badge company">Company corner</span>

> STORY **Wednesday, 9:05.** Nilufar, risk (*риск-аналитик*), with Jasur behind her. *"Your Power Query pipeline works — on my laptop. Jasur's server has no Excel. He wants the same cleaning as a script he can schedule: `customers_dirty.csv` and `payments_dirty.csv` in, 6 000 people and 52 850 payments out, every Monday at 6:00, and a DPD per loan computed from the schedule so his model has a target."* Jasur: *"And I want to see the asserts. A pipeline that cannot prove its own counts is a pipeline I cannot trust at 6:00 in the morning."*

## Today in 3 lines

- **`groupby` / `agg`** is `GROUP BY` with named outputs; **`transform`** is the window function (a group total next to every row); **`merge`** is the join, with `how=`, `validate=` and `indicator=` as the safety belts you never had in SQL; `concat` is `UNION ALL`; `pivot_table` is the cross-tab.
- Cleaning is the same three repairs as week 4 — text (`.str.strip().str.lower()`, `replace`), dates (`to_datetime(errors="coerce")` **plus the business rule**), duplicates (`duplicated` / `drop_duplicates(subset=, keep=)` after a sort) — written once, checked with `assert`, re-run forever.
- You can reproduce every week-4 cleaning count in pandas — duplicate people (and the name-key trap), impossible birth dates, duplicate payments, method spellings — and compute **DPD for every loan** from `installments.csv` + payments, checked against the SQL column loan by loan.

---

## 1. Learn — several tables, one notebook

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

### transform — the window function

```python
pay["loan_total"] = pay.groupby("loan_id")["amount"].transform("sum")   # SUM(amount) OVER (PARTITION BY loan_id)
pay["share"] = pay["amount"] / pay["loan_total"]                        # each payment's share of its loan's payments
cust["seg_median"] = cust.groupby("segment")["monthly_income"].transform("median")
above = (cust["monthly_income"] > cust["seg_median"]).sum()             # raw customers_dirty.csv: 2 841 earn above their segment's median
```

`agg` collapses to one row per group; `transform` returns a value **per original row** aligned to the frame — week 3's `OVER (PARTITION BY …)`. Use it for shares of a group total, for "difference from the group mean", for `cumsum` running totals inside groups (`groupby("loan_id")["amount"].cumsum()`), for `rank` inside groups, and — the dedup trick — `groupby(key).cumcount()` is `ROW_NUMBER() OVER (PARTITION BY key)`.

### merge — the join, with safety belts

```python
m = inst.merge(paid, on="installment_id", how="left", validate="1:1", indicator=True)
m["_merge"].value_counts()      # both · left_only · right_only — read the three counts (Detective step 5)
```

`left.merge(right, on="key", how=...)`: `"inner"` (default — **not** `left`; a forgotten `how=` drops the unpaid instalments, which are the point), `"left"`, `"right"`, `"outer"`. `left_on=` / `right_on=` when the names differ; `on=["a", "b"]` for a two-column key. Two arguments SQL never gave you: **`validate="1:1"` / `"m:1"` / `"1:m"`** raises `MergeError` if the key is not unique on the side you promised — the week-2 fan-out (Σ principal ×24.7 after joining instalments) becomes an error instead of a wrong number; **`indicator=True`** adds a `_merge` column saying where each row came from — the anti-join is `m[m["_merge"] == "left_only"]`. Columns with the same name on both sides get `_x` / `_y`; pass `suffixes=("", "_sql")` to control it. Count rows before and after, every time: a left merge must keep exactly `len(left)` rows.

| `how=` | SQL (week 2) | Power Query (week 4) | Rows kept |
|---|---|---|---|
| `"inner"` (default) | `INNER JOIN` | Inner | only matches — the instalments with a payment |
| `"left"` | `LEFT JOIN` | Left Outer | every left row — 92 193 instalments, `paid` NaN where none |
| `"right"` | `RIGHT JOIN` | Right Outer | every right row |
| `"outer"` | `FULL OUTER JOIN` | Full Outer | everything from both — the roll-rate join of two snapshots |
| `indicator=True` + `left_only` | `LEFT JOIN … WHERE right IS NULL` | Left Anti | the anti-join |

### concat — UNION ALL; pivot_table — the cross-tab

```python
pd.concat([pay[pay.region == "Tashkent"], pay[pay.region != "Tashkent"]])           # Tashkent + the rest = every row again, matched by column NAME
pd.concat([a, b], ignore_index=True)                                                 # renumber the index
pd.pivot_table(loans, index="bucket", columns="product", values="loan_id", aggfunc="count", fill_value=0, margins=True)
pd.crosstab(loans["grade"], loans["bucket"])                                         # counts only, shorter
```

`concat` stacks frames; it matches columns **by name**, so a column spelt `Amount` in one file becomes a second column full of NaN — week 4's Append lesson. `pivot_table(index, columns, values, aggfunc)` is Excel's PivotTable: `aggfunc="sum"` / `"mean"` / `"count"`, `margins=True` for the totals row, `fill_value=0` for empty cells. `pivot` (no aggregation) reshapes long → wide when each cell already has one value — `monthly_disbursements.csv` (170 rows) becomes 34 months × 5 products; `melt` goes back to long, which is the shape seaborn wants tomorrow.

### apply vs vectorised

```python
inst["total"] = inst["principal_due"] + inst["interest_due"]                              # vectorised: 0.7 ms on 92 193 rows
inst["total"] = inst.apply(lambda r: r["principal_due"] + r["interest_due"], axis=1)      # row-wise apply: 720 ms — 1 000× slower
loans["bucket"] = loans["dpd"].apply(dpd_bucket)      # fine for a label function on one column (0.7 ms vs pd.cut's 0.4)
```

`apply` runs a Python function once per row (or per value) — a `for` loop in disguise. It is the right tool for a one-off label function or logic too twisted for arithmetic; it is the wrong tool whenever an arithmetic or `pd.cut` / `np.where` / `.str` spelling exists. The rule of thumb: if you wrote `axis=1`, ask whether column arithmetic would do.

### The `.str` accessor — text repair for a whole column

```python
cust["first_name"].str.strip()                           # TRIM            — the trailing spaces go
cust["first_name"].str.title()                           # PROPER          — 'MALIKA' → 'Malika'; also 'buy now pay later' → 'Buy Now Pay Later', so names only
pay["method"].str.strip().str.lower()                    # the week-2 LOWER(TRIM())
pay["method"].replace({"bank transfer": "transfer"})     # whole-value replace (a dict)
cust["first_name"].str.contains(" "), .str.len(), .str.startswith("approved"), .str.split(" ").str[0], .str.replace(r"^998", "+998", regex=True)
```

`.str.<method>` applies a string method to every value and leaves NaN alone. `Series.replace(dict)` swaps whole values; `.str.replace(a, b)` edits inside the text (regex optional). Chain them in the order that reads like the change log: strip → lower → replace.

### Duplicates: find, look, then drop

```python
dup_mask = pay.duplicated(subset=["installment_id", "paid_at", "amount"], keep=False)   # True on ALL members of a group
pay[dup_mask].sort_values(["installment_id", "payment_id"])                            # look before you delete
pay_clean = pay.sort_values("payment_id").drop_duplicates(subset=[...], keep="first")  # keep the lowest payment_id
```

`duplicated(subset=, keep=)`: `keep="first"` marks the later copies (the ones that will go), `keep=False` marks every member (for looking). `drop_duplicates` with the same arguments removes them, keeping the first row **in the current order** — so **sort first**: by `payment_id` to keep the earliest payment, by `registered_at` to keep the customer's original registration. Without `subset=` it compares all columns and finds 0 here, because the `payment_id` differs — week 4's "tick all columns" trap, in a parameter. The key defines sameness; the sort defines the survivor; the assert on the count proves both.

### Dates that lie: `errors="coerce"` and the business rule

```python
cust["birth_date"] = pd.to_datetime(cust["birth_date"], errors="coerce")   # unparseable → NaT (not a crash) — count the NaT
bad = (cust["birth_date"] > AS_OF) | (cust["birth_date"] < "1920-01-01")   # the business rule finds what parsing cannot
cust["birth_date_invalid"] = bad
cust["birth_date_clean"] = cust["birth_date"].where(~bad)                   # keep the date where valid, NaT where not
```

`errors="coerce"` protects you from `"n/a"` and `"31.02.2026"`; it does **not** protect you from `2031-04-12`, a perfectly parseable lie. Parsing is syntax; validity is a business rule, and the rule is yours to write: not in the future, not before 1920. `.where(cond)` keeps values where the condition holds and blanks the rest (`np.where(cond, a, b)` is the two-sided `IF`). Never replace a bad date with a plausible one — flag + blank, as in week 4.

### assert — the pipeline that checks itself

```python
assert len(cust_clean) == 6000, f"expected 6000 customers, got {len(cust_clean)}"
assert pay_clean["method"].nunique() == 5
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

---

## 2. Detective — Nilufar's files, in pandas (40 min)

Open `data/python/day3_starter.ipynb`; the walk-through cells are the first half. Reproduce week 4's counts step by step — the folds hold the numbers; get yours first.

**Step 1 — the dirt inventory on `customers_dirty.csv`** with `.str`: trailing spaces in `first_name`, all-caps first names, all-lower surnames, ids above 6 000.

<details><summary>Result</summary>

`(c.first_name != c.first_name.str.strip()).sum()` → **18**; `c.first_name.str.isupper().sum()` → **22**; `(c.last_name == c.last_name.str.lower()).sum()` → **40**; `(c.customer_id > 6000).sum()` → **40**. The 22 + 18 land on the 40 lower-case surnames, ids 6001–6040 — the same suspicion as week 4, four lines instead of four `SUMPRODUCT`s.

</details>

**Step 2 — prove the duplicates** three ways: `duplicated(subset=[normalised first, last, birth_date])`, `subset=["phone", "birth_date"]`, `subset=["phone"]`.

<details><summary>Result</summary>

Name key (after `.str.strip().str.lower()`): **42** extras in 84 rows — the two namesakes again (823/1197 *Nodir Nazarov* 1997-04-28, Tashkent vs Samarkand; 2460/5562 *Eldor Karimov* 1963-04-06, different phones). Raw names without normalising: only **2** (the case and the space hide the other 40 — `duplicated` is exact-match, like Remove Duplicates). `phone + birth_date`: **40**, exactly ids 6001–6040 (6001 `MALIKA jalilova` ↔ 4516 `Malika Jalilova`, phone 998908981002, 1981-08-15, income 5 419 072). `phone` alone: **43** — three family numbers. All 40 duplicates were registered *after* their original, so `sort_values("registered_at")` + `keep="first"` keeps the originals: `(clean.customer_id <= 6000).all()` → True. "Registered in 2026" falls 955 → 945.

</details>

**Step 3 — the dates.** `pd.to_datetime(errors="coerce")`, count the NaT, then the business rule.

<details><summary>Result</summary>

NaT after coerce: **0** — every value is a valid ISO date, so `coerce` alone finds nothing. The rule `> AS_OF or < 1920-01-01` finds **7**: 927, 2338, 3380 (2031-04-12), 964 (2027-02-28), 957, 1020, 2934 (1900-01-01). Age as `(AS_OF - birth_date).dt.days / 365.25` → the same 7 are `< 18 or > 100`; valid customers average 45.7 years. `birth_date_clean = birth_date.where(~bad)` and the flag column — never a guess.

</details>

**Step 4 — payments.** `method.value_counts()` raw and clean; `duplicated` on the three-column key; Σ of the extras.

<details><summary>Result</summary>

Raw: 10 spellings, **180** dirty rows (`~method.isin(five)`); `.str.strip().str.lower()` → 6 (`bank transfer` survives); `.replace({"bank transfer": "transfer"})` → **5**. Duplicates: 50 rows in 25 groups, **25** extras, Σ **58 397 800** — Timur's 58 million; all 25 extras have `payment_id` > 52 850, and `duplicated()` without `subset` finds 0. After `sort_values("payment_id").drop_duplicates(...)`: 52 850 rows, Σ 255 114 772 176; 24 forward-dated rows (53 438 947) flagged, kept. Clean counts per method: card 17 612 · payme 8 897 · cash 8 788 · click 8 786 · transfer 8 767 (the five sum to 52 850 — the 25 removed rows were 9 card, 3 payme, 2 cash, 4 click, 7 transfer).

</details>

**Step 5 — the merge that computes DPD** (the Company corner has the full version): aggregate clean payments `paid_at <= AS_OF` per instalment, left-merge onto `installments.csv` with `validate="1:1", indicator=True`.

<details><summary>Result</summary>

52 826 instalments with a payment, 39 367 without, 0 payments without an instalment. Matured (`due_date <= AS_OF`): **54 207**; matured and `paid < total_due`: **1 784**, 403 of them partially paid — week 4 P8's numbers. `(paid > total_due).sum()` → **0** after dedup, **25** before it: the duplicates were the only over-payments in the book, which is the cleanest proof that they were duplicates and not real second payments. Loans with an unpaid matured instalment: 413; with `dpd > 0`: **399** (14 fell due on the as-of day itself, dpd 0).

</details>

---

## 3. Practice (45 min)

Add a cell per task to `day3_starter.ipynb`; print the number or the frame.

**P1.** Payments per `region`: count, total, average — on the dirty file and on the clean one. Which region lost the most money to the dedup?

<details><summary>Answer</summary>

Clean: Tashkent 20 437 / 102 605 410 110 / 5.02 m · Fergana 6 334 / 34 437 790 032 · Samarkand 6 037 / 27 576 625 156 · Andijan 4 724 / 24 138 491 453 · Namangan 4 782 / 21 044 366 065 · Bukhara 4 088 / 16 162 119 575 · Termez 3 218 / 15 956 940 146 · Nukus 3 230 / 13 193 029 639. Samarkand lost most (24 951 300), Tashkent 7 of the 25 rows (5 247 900). `agg(payments=("payment_id", "size"), total=("amount", "sum"), avg=("amount", "mean"))`.

</details>

**P2.** A cross-tab of clean payments: `product` × `method` counts with `groupby(...).size().unstack()`, then the same with `pivot_table`. Read SME's row.

<details><summary>Answer</summary>

SME: card 2 701 · cash 1 334 · click 1 390 · payme 1 401 · transfer 1 396 — the same 33 / 17 / 17 / 17 / 17 % mix as the whole book; `method` does not depend on `product`. `pd.pivot_table(pay, index="product", columns="method", values="payment_id", aggfunc="count", fill_value=0)` gives the identical frame.

</details>

**P3.** `transform`: add each customer's segment median income next to them; how many earn above it? Then `cumcount` per `phone` as the `ROW_NUMBER` of week 3 — how many rows get 1 or more?

<details><summary>Answer</summary>

On the raw `customers_dirty.csv`: 2 841 above their segment median (mass 5.79 m · affluent 25.28 m · sme 33.21 m; the 356 NaN compare False). On the 6 000 clean customers (P6): 2 823 (medians 5.80 / 25.18 / 33.24 m) — say which frame you used. `cust.groupby("phone").cumcount()` → 43 rows ≥ 1 — the 40 duplicates plus the three family-shared numbers; with `["phone", "birth_date"]` as the key, exactly 40. Sort by `registered_at` before `cumcount` or the "0" may be the later copy.

</details>

**P4.** The inner-merge trap: repeat Step 5 with the default `how`. How many rows, and which loans would the DPD computation then miss?

<details><summary>Answer</summary>

52 826 rows — every instalment with **no** payment disappears, so an instalment that was never paid is not "unpaid", it is absent, and every loan whose arrears are total (the 234 in 90+ with months of nothing) looks current. `how="left"` + `fillna(0)` is the `LEFT JOIN … COALESCE(SUM, 0)` of week 2; an `assert len(m) == len(inst)` after the merge is the belt.

</details>

**P5.** `validate`: merge clean payments onto `loans_status.csv` (`loan_id`) with `validate="m:1"` — fine. Now merge `installments.csv` onto the **raw** payments with `validate="1:1"`, then onto the **clean** payments — what happens each time, and what does the message tell you about the grain?

<details><summary>Answer</summary>

Raw: `MergeError: Merge keys are not unique in left dataset; not a one-to-one merge` — the 25 duplicate pairs put two payment rows on 25 instalments, so raw payments → instalments is **m:1**; stating the wrong grain is caught before any number is wrong. Clean: the merge passes — after the dedup every instalment has at most one payment (week 3 P11: the partials are single payments smaller than `total_due`, not several payments). Keep `validate="m:1"` in the script anyway: it is the grain the business allows, and it will not break the day a real split payment arrives. Rule: write the `validate` you *believe*; a `MergeError` is a free lesson about the data.

</details>

**P6.** Clean `customers_dirty.csv` end to end in one chain (strip + title, flags, sort, dedup) and `assert` the four counts: 6 000 rows, 7 invalid dates, 354 missing incomes, no id above 6 000. Why 354 and not 356?

<details><summary>Answer</summary>

Two of the 40 duplicate rows copied a customer whose income is blank, so dropping them removes 2 of the 356 NaN. The chain is `clean_customers` in the notebook: `.str.strip().str.title()` on the two name columns → `birth_date_invalid` → `birth_date_clean = birth_date.where(~invalid)` → `sort_values("registered_at").drop_duplicates(subset=["phone", "birth_date"], keep="first")` → `sort_values("customer_id")`.

</details>

**P7.** Collection rate by due month for 2026 from the merged frame of Step 5: `due_month = due_date.dt.to_period("M")`, `groupby` → Σ due, Σ paid, rate. Compare September with week 4.

<details><summary>Answer</summary>

Jan 97.3 % · Feb 97.0 · Mar 96.8 · Apr 96.9 · May 97.1 · Jun 96.9 · Jul 96.7 · Aug 96.5 · **Sep 94.1 %** (3 305 instalments, 16 987 977 718 due, 15 982 118 926 paid) — identical to the Power Query table because the payments are cut at the as-of inside `paid`. `m[(m.due_date >= "2026-01-01") & (m.due_date < "2026-10-01")].groupby("due_month").agg(due=("total_due", "sum"), paid=("paid", "sum"))` then `rate = paid / due`.

</details>

**P8.** `apply` vs vectorised: compute `total_due` from its two parts both ways on the 92 193 instalments and time them with `%%timeit` (or `time.perf_counter()`). Then apply `dpd_bucket` from HW 5.1 to `dpd` and compare with `pd.cut`.

<details><summary>Answer</summary>

Row-wise `apply(axis=1)` ≈ 0.7 s; `inst.principal_due + inst.interest_due` ≈ 0.7 ms — a thousand times; both equal `total_due` for every row (the file is consistent). `dpd.apply(dpd_bucket)` and `pd.cut` give identical labels on 7 828 rows and both run in about a millisecond — for a label function on one column, `apply` is fine; `axis=1` is the one to avoid.

</details>

**P9.** `concat`: split clean payments into Tashkent and the rest, add a `source` column to each, concat with `ignore_index=True`. Rows? Then rename `amount` to `Amount` in one half and concat again — what does the result look like?

<details><summary>Answer</summary>

20 437 + 32 413 = **52 850**, `source` says which half each row came from (lineage for the twelve monthly files). With `Amount` in one half: still 52 850 rows but **one column more**, `amount` NaN in 20 437 rows and `Amount` NaN in 32 413 — no error, a split column; `assert set(a.columns) == set(b.columns)` before every `concat`.

</details>

<span class="badge stretch">Stretch</span> **P10.** Reshape: `monthly_disbursements.csv` (170 long rows) → `pivot` to 34 months × 5 products, add a `total` column and SME's share per month; then `melt` it back to long. Which month had SME's highest share, and what was it in September 2026?

<details><summary>Answer</summary>

`md.pivot(index="month", columns="product", values="amount")` → (34, 5); SME's highest share is **2024-07, 77.2 %**; it is 50.6 % of September 2026's 17.0 bn (8.60 bn). `w.reset_index().melt(id_vars="month", var_name="product", value_name="amount")` → 170 rows again. Wide for reading and Excel, long for `groupby` and seaborn — tomorrow's lineplot wants the long shape.

</details>

### Mistakes that cost a point this week

- `merge` without `how=` — inner by default; the unpaid instalments vanish.
- No `validate=` on a join whose grain you "know" — the week-2 fan-out, unflagged.
- `drop_duplicates` without `subset=` (0 removed) or without a sort first (the wrong survivor kept).
- `errors="coerce"` taken as validation — 7 impossible dates pass.
- `fillna` before the merge instead of after — the NaN that marks "no payment" is lost.
- A row-wise `apply(axis=1)` where column arithmetic exists.
- `concat` of frames with differently spelt columns — a silent split.
- Counts that live in your head instead of in `assert` lines.

---

## 4. Homework <span class="badge hw">HW 5.2 — Due Day 5</span>

**Jasur's Monday script.** Hand in `clean_nur.py` (📎 box below) (or the executed `day3_starter.ipynb` with the three TODO functions filled in) and the three CSVs it writes:

1. **`customers_clean.csv`** — 6 000 rows from `customers_dirty.csv`: names stripped and title-cased, duplicates removed on `phone` + `birth_date` keeping the earliest `registered_at`, `birth_date_invalid` (7 True), `birth_date_clean` (NaT when invalid), `monthly_income` NaN kept as NaN (354).
2. **`payments_clean.csv`** — 52 850 rows: `method` in 5 values, duplicates removed on `installment_id` + `paid_at` + `amount` keeping the lowest `payment_id`, `is_forward_dated` (24 True, rows kept). Σ `amount` 255 114 772 176.
3. **`dpd_per_loan.csv`** — one row per loan (7 828): `loan_id`, `dpd`, `bucket`, computed from `installments.csv` + your clean payments as in the Company corner; 399 loans with `dpd > 0`, buckets 7 429 / 124 / 25 / 16 / 234, equal to `loans_status.csv`'s `dpd` for every loan.
4. **Asserts** on every count above inside the script, plus `len(merged) == len(installments)` after the merge; running `python clean_nur.py` prints nothing but the three file names when all is well.

**Paths.** Your mentor runs your script in a folder that has the raw files in a `data/excel/` folder next to it. So read them as `Path("data/excel/customers_dirty.csv")` (put the downloaded files in a `data/excel/` folder next to your script to test it), and write the three CSVs into the current folder (`customers_clean.csv`, not a path elsewhere). If you hand in the notebook instead of the script, attach the three CSVs too.

Graded on: (a) the counts (6 000 / 7 / 52 850 / 5 / 24 / 399 and the buckets), (b) the asserts are present and the script runs top to bottom from the raw files — the reviewer deletes the CSVs and re-runs it, (c) the dedup keeps the right survivor (originals ≤ 6 000; lowest `payment_id`) and the DPD matches the SQL for all 7 828 loans. Also due today: **HW 5.1** in `day-1/`.

### 📎 Hand in here

```sqltask
{"check": "handin-W5D3", "lesson": "W5D3", "title": "HW 5.2", "tasks": [{"id": "clean_nur.py", "file": "clean_nur.py", "names": ["clean_nur.py", "day3_starter.ipynb"], "upload": true, "accept": ".ipynb,.py", "q": "Attach `clean_nur.py` or `day3_starter.ipynb` — what the page above asks for."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else the page lists (one more file, or a .zip of several)."}]}
```

---

## 5. Self-check

1. `agg` vs `transform` — which returns one row per group, which one per original row, and which is the window function? *(→ section 1, "groupby", "transform")*
2. You merge payments onto instalments and get fewer rows than the 92 193 instalments. What did you forget, and which `assert` would have caught it? *(→ section 1, "merge", P4)*
3. `pd.to_datetime(errors="coerce")` found 0 bad birth dates. Are the dates clean? *(→ section 1, "Dates that lie", Detective step 3)*

---

## 6. Company corner <span class="badge company">DPD in pandas</span>

The week-2 DPD block, the week-3 `v_loan_status`, the week-4 Power Query merge — now as the function Jasur schedules. Grain discipline is the whole method: instalment → loan.

```python
AS_OF = pd.Timestamp("2026-10-01")
inst = pd.read_csv("../excel/installments.csv", parse_dates=["due_date"])            # grain: instalment, 92 193
pay  = clean_payments(pd.read_csv("../excel/payments_dirty.csv", parse_dates=["paid_at"]))   # 52 850

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
```

`(loans.dpd > 0).sum()` → **399**; `loans.bucket.value_counts().sort_index()` → **7 429 / 124 / 25 / 16 / 234**; merged against `loans_status.csv`, `(dpd == dpd_sql).all()` → **True** for all 7 828 loans. Same definition, same rows, third tool, same number — which is the only acceptable outcome. Where the pandas version is *better* than the SQL: `validate="1:1"` and the `assert` make the grain explicit; `AS_OF` is one variable, so the 1 September snapshot for roll rates is the same function with another argument; and the 25 duplicates are handled by a named step (`clean_payments`) rather than a view somebody has to remember to use.

**FPD30 by vintage × channel = one `pivot_table`.** The first instalment per loan, in scope if its due date is ≤ as-of − 30 days; late if not fully paid within 30 days (`paid < total_due` or `first_paid − due_date > 30`); vintage = month of disbursement; channel from `applications` via `nur.db` (`loans_status.csv` has no channel):

```python
first = inst[(inst["installment_no"] == 1) & (inst["due_date"] <= AS_OF - pd.Timedelta(days=30))]
paid1 = pay[pay["paid_at"] <= AS_OF].groupby("installment_id", as_index=False).agg(paid=("amount", "sum"), first_paid=("paid_at", "min"))
f = first.merge(paid1, on="installment_id", how="left").fillna({"paid": 0})
f["fpd30"] = ((f["paid"] < f["total_due"]) | ((f["first_paid"] - f["due_date"]).dt.days > 30)).astype(int)
f = f.merge(loan_channel, on="loan_id", validate="1:1")          # loan_id, disbursed_at, channel from nur.db
f["vintage"] = f["disbursed_at"].dt.to_period("M").astype(str)
pd.pivot_table(f, index="vintage", columns="channel", values="fpd30", aggfunc="mean").mul(100).round(2)
```

In scope **7 099**, FPD30 **91 = 1.28 %**; by channel app 41 / 2 411 = **1.70 %**, partner 16 / 1 425 = 1.12 %, branch 34 / 3 263 = 1.04 % — week 2's table, cell for cell. The pivot's last rows: 2026-05 app 0.76 / branch 1.12 / partner 5.97 (4 of 67 — too small to read); 2026-06 0.74 / 0.62 / 1.33; 2026-07 1.64 / 0.62 / 1.19; 2026-08 is 11 loans in scope and partner is NaN — an empty cell, not a 0. Swap `columns="channel"` for `"risk_grade"` (A 0.60 · B 0.97 · C 2.16 · D 2.23 %) or `aggfunc=["sum", "count"]` to show the counts next to the rates, and group by quarter (`dt.to_period("Q")`) when the monthly cells are this thin. The unpaid-only definition (`paid < total_due` alone) gives app 1.04 % — Timur's tile; one boolean term is the whole 0.66-point argument between two departments.

> Interview version: *"Compute DPD per loan in pandas from a schedule and a payments table."* — de-duplicate and cut payments at the as-of; `groupby(installment_id).sum()`; left-merge onto instalments with `validate="1:1"` and assert the row count; unpaid = paid < due, matured = due ≤ as-of; per loan `as_of − min(due_date)` of unpaid matured rows; `pd.cut` for buckets; reconcile the 399 and the bucket counts against the warehouse before anyone uses it as a model target.

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
{"id": "w05d3", "q": "Sevara wants the collections ranking for the last quarter by branch. Take the instalments due from 1 July to 30 September 2026 (installments.csv), what was paid on each through the as-of 2026-10-01 (payments_dirty.csv, de-duplicated as in today's Detective), and the loan's branch from loans_status.csv. Collection rate = Σ paid ÷ Σ total_due. What is the rate of the WORST branch? Give a percentage to 2 decimals.", "type": "number", "dp": 2, "h": ["8aa6be7c2de4b2c386aeab63"], "hint": "Today's Company corner already builds the instalment-level frame with paid next to total_due; one more merge brings the branch — check its grain with validate before you group.", "sol": "QVNfT0YgPSBwZC5UaW1lc3RhbXAoIjIwMjYtMTAtMDEiKQppbnN0ID0gcGQucmVhZF9jc3YoIi4uL2V4Y2VsL2luc3RhbGxtZW50cy5jc3YiLCBwYXJzZV9kYXRlcz1bImR1ZV9kYXRlIl0pCnBheSA9IHBkLnJlYWRfY3N2KCIuLi9leGNlbC9wYXltZW50c19kaXJ0eS5jc3YiLCBwYXJzZV9kYXRlcz1bInBhaWRfYXQiXSkKcGF5ID0gcGF5LnNvcnRfdmFsdWVzKCJwYXltZW50X2lkIikuZHJvcF9kdXBsaWNhdGVzKHN1YnNldD1bImluc3RhbGxtZW50X2lkIiwgInBhaWRfYXQiLCAiYW1vdW50Il0pICAgIyA1MiA4NTAKcGFpZCA9IHBheVtwYXlbInBhaWRfYXQiXSA8PSBBU19PRl0uZ3JvdXBieSgiaW5zdGFsbG1lbnRfaWQiLCBhc19pbmRleD1GYWxzZSkuYWdnKHBhaWQ9KCJhbW91bnQiLCAic3VtIikpCm0gPSBpbnN0Lm1lcmdlKHBhaWQsIG9uPSJpbnN0YWxsbWVudF9pZCIsIGhvdz0ibGVmdCIsIHZhbGlkYXRlPSIxOjEiKS5maWxsbmEoeyJwYWlkIjogMH0pCmxvYW5zID0gcGQucmVhZF9jc3YoIi4uL2V4Y2VsL2xvYW5zX3N0YXR1cy5jc3YiKQptID0gbS5tZXJnZShsb2Fuc1tbImxvYW5faWQiLCAiYnJhbmNoIl1dLCBvbj0ibG9hbl9pZCIsIGhvdz0ibGVmdCIsIHZhbGlkYXRlPSJtOjEiKQpxMyA9IG1bKG1bImR1ZV9kYXRlIl0gPj0gIjIwMjYtMDctMDEiKSAmIChtWyJkdWVfZGF0ZSJdIDwgIjIwMjYtMTAtMDEiKV0KZyA9IHEzLmdyb3VwYnkoImJyYW5jaCIpLmFnZyhkdWU9KCJ0b3RhbF9kdWUiLCAic3VtIiksIHBhaWQ9KCJwYWlkIiwgInN1bSIpKQpnWyJyYXRlIl0gPSAxMDAgKiBnWyJwYWlkIl0gLyBnWyJkdWUiXQpnLnNvcnRfdmFsdWVzKCJyYXRlIikuaGVhZCgzKQojIEJ1a2hhcmEgQ2VudHJhbCA5Mi44MCDCtyBUYXNoa2VudCBTb3V0aCA5My4zNSDCtyBOYW1hbmdhbiBDZW50cmFsIDkzLjU0IOKApiBiZXN0IFRlcm1leiBDZW50cmFsIDk4LjQ5Cgo5Mi44MCAlOiBCdWtoYXJhIENlbnRyYWwgY29sbGVjdGVkIDMuMTggYm4gb2YgdGhlIDMuNDMgYm4gdGhhdCBmZWxsIGR1ZSBpbiBRMyDigJQgdGhlIHdvcnN0IG9mIHRoZSB0ZW4gYnJhbmNoZXMsIGFsbW9zdCBzaXggcG9pbnRzIGJlaGluZCBUZXJtZXogQ2VudHJhbC4KVGhlIHR3byB0cmFwcyBhcmUgYW4gaW5uZXIgbWVyZ2UgKHRoZSB1bnBhaWQgaW5zdGFsbWVudHMgdmFuaXNoIGFuZCBldmVyeSByYXRlIGNsaW1icyB0b3dhcmRzIDEwMCAlKSBhbmQgdGhlIGR1cGxpY2F0ZSBwYXltZW50cyAobGVmdCBpbiwgdGhleSBhZGQgMzguMyBtIHRvIHRoZSBRMyBpbnN0YWxtZW50cyDigJQgNTguNCBtIG92ZXIgdGhlIHdob2xlIGJvb2sg4oCUIHRoYXQgd2FzIG5ldmVyIHBhaWQgdHdpY2UpLgpTZXB0ZW1iZXIgaW5zdGFsbWVudHMgaGF2ZSBoYWQgbGl0dGxlIHRpbWUgdG8gYmUgcGFpZCwgc28gYWxsIGJyYW5jaGVzIGxvb2sgd29yc2UgdGhhbiBpbiBKdWx5OyB0aGUgcmFua2luZywgbm90IHRoZSBsZXZlbCwgaXMgdGhlIGZpbmRpbmcu"}
```

<!-- challenge:end -->
