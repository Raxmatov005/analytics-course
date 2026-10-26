# Week 5 · Day 5 — Checkpoint: the EDA report, in pandas

<span class="badge">Report 150 min</span> <span class="badge">Interview 30 min</span> <span class="badge hw">Checkpoint · 100 points</span>

> STORY **Friday, 9:00.** Madina, Jasur and Bekzod at the same table. Madina: *"Three weeks ago you wrote the loan-book report in SQL. Today you write it **again, in a notebook** — same ten sections, same numbers — and under every section you tell me whether pandas matched the SQL, and if not, why."* Jasur: *"The point is not pandas. The point is that you now have two independent ways to get every number, and you know which one to reach for."* Bekzod: *"And charts. Four at least. The board does not read `DataFrame.head()`."*

## Today in 3 lines

- **Part A (80 pts):** `checkpoint.ipynb` from `data/python/checkpoint_template.ipynb` — the ten sections of week 3's EDA, each as code cell(s) + the week-3 SQL number (given in the template) + one Markdown line *match / mismatch and why* + a finding; at least four charts across the ten; a closing cell of five sentences on what pandas made easier and what SQL made easier.
- **Part B (20 pts):** eight interview questions on this week's material, in writing, 3–5 sentences each.
- Allowed: everything from weeks 1–5 — `pd.read_sql` on `nur.db` (the SQL *is* allowed; the section must still end in a DataFrame and a pandas step), the CSV extracts, your HW 5.2 functions. Closed: the model answers until you submit.

**Rules.** Open book. Submit to **`submissions/week-05/day-5/`**: `checkpoint.ipynb` (executed — Kernel → Restart & Run All, then save, so every output is inside the file), `interview.md`. Also due today: **HW 5.2** in `day-3/`. All numbers as of **2026-10-01**; payments de-duplicated (your `clean_payments`) and cut at the as-of wherever they are summed.

**Working method.** Per section: the grain in a comment; the code; the first rows (`head()` is an output — it counts); the week-3 number next to yours, as an `assert` where it must be exact (counts, sums) and as a printed pair where rounding may differ (rates); one finding Bekzod can read aloud. A *mismatch* is not a failure if the line under it says why (a half-open vs inclusive filter, dirty vs clean payments, a cohort cut) — an *unexplained* mismatch costs the number points.

**The shape of one section** (the template has it ten times — two cells, then a Markdown cell):

~~~markdown
## S5. Magnitude — by product
**Week 3 (SQL):** SME 781 loans / 241.1 bn / 59.6 % of money …
~~~

```python
# grain: one row per loan (L, 7 828); products joined m:1 in the read_sql above
by_prod = L.groupby("code").agg(loans=("loan_id", "size"), disbursed=("principal", "sum"))
by_prod["amount_share"] = (100 * by_prod["disbursed"] / by_prod["disbursed"].sum()).round(1)
assert by_prod["loans"].sum() == 7828
by_prod.sort_values("disbursed", ascending=False)
```

~~~markdown
**Match:** identical to S5 (59.6 / 20.9 / 16.1 / 1.8 / 1.6).
**Finding.** Two books in one: 85 % of loans are Micro/Consumer/BNPL, 80 % of the money is SME/Auto.
~~~

Three cells per section, not thirty: the reviewer reads the finding, checks the match line, then the output, and opens the code only when a number is off. Charts go in the section they illustrate (`fig, ax` in the same cell as the data, `fig.savefig` optional) — four across the ten, with finding titles; S5, S7, S9 (two) are the natural homes.

**Where each pandas tool earns its section:**

| Section | The pandas idiom | The SQL twin |
|---|---|---|
| S1, S3 | `read_sql` + `.min()` / `.max()` | `COUNT(*)`, `MIN` / `MAX` |
| S2 | `value_counts(normalize=True)` | `COUNT(*) / SUM(COUNT(*)) OVER ()` |
| S4 | `drop_duplicates` + a mask + `.sum()` | `v_payments_clean` + `WHERE paid_at <=` |
| S5, S6 | `groupby().agg(named=...)`, `rank`, `nlargest` | `GROUP BY`, `RANK()`, `LIMIT` |
| S7 | `rolling(3).mean()`, `pct_change(12)` | `AVG() OVER (ROWS 2 PRECEDING)`, `LAG(x, 12)` |
| S8 | a loop over `period_range` + `.diff()` | recursive CTE + correlated `SUM` |
| S9 | `dpd_per_loan`, `pd.cut`, `pivot_table`, `merge(how="outer")` | the DPD CTE, `CASE`, `FULL OUTER JOIN` |
| S10 | `pd.cut(right=False)` + `crosstab` | `CASE WHEN income < …` + `SUM(CASE)` |

**Common mistakes from this week** (each costs the number point): the default `how="inner"` where a `LEFT JOIN` was meant; `fillna(0)` on a money column that should stay NaN; `between` on a datetime; `pd.cut` with the first edge at 0; summing `principal` after merging instalments onto loans (Σ principal ×24.7, the week-2 fan-out — `validate="m:1"` would have caught it); a chart whose title names the chart.

---

## Part A — The report (150 min, 80 pts)

Eight points per section: 3 for code that runs and answers the heading, 3 for the numbers (matching or explained), 2 for the finding and the match line. The model answers are *an* answer; a different cut with correct numbers and a real finding scores the same.

### S1. Database exploration — tables, row counts, grain

<details><summary>Model answer</summary>

```python
con = sqlite3.connect("../raw/nur.db")
tables = pd.read_sql("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name", con)["name"]
counts = pd.DataFrame({"table": tables, "rows": [pd.read_sql(f"SELECT COUNT(*) AS n FROM {t}", con)["n"][0] for t in tables]})
```

| table | rows | grain (one row =) |
|---|---|---|
| customers | 6 040 | a person (40 duplicates → 6 000, HW 5.2) |
| applications | 14 000 | a loan request |
| loans | 7 828 | a disbursed loan |
| installments | 92 193 | a scheduled payment |
| payments | 52 875 | money received (52 850 after `drop_duplicates`) |
| collections_actions / app_events | 9 361 / 22 784 | a contact / an in-app event |
| branches / products / staff / dim_date | 10 / 5 / 100 / 1 461 | dimensions |

**Match:** all eleven counts equal week 3 S1. **Finding.** Same database, same grains; pandas adds nothing here except the loop — `read_sql` on `sqlite_master` replaced eleven `UNION ALL`s. The f-string on a table *name* is acceptable only because the names come from the catalogue, not from a user.
</details>

### S2. Dimensions — products, grades, channels, status

<details><summary>Model answer</summary>

```python
L = pd.read_sql("""SELECT l.*, p.code, a.channel, b.region FROM loans l
                   JOIN products p ON p.product_id = l.product_id
                   JOIN applications a ON a.application_id = l.application_id
                   JOIN branches b ON b.branch_id = l.branch_id""", con, parse_dates=["disbursed_at"])
for col in ["code", "risk_grade", "channel", "status"]:
    print(pd.concat([L[col].value_counts(), L[col].value_counts(normalize=True).mul(100).round(1)], axis=1, keys=["loans", "share_pct"]))
```

Products MICRO 2 669 (34.1 %) · CONS 2 418 (30.9) · BNPL 1 569 (20.0) · SME 781 (10.0) · AUTO 391 (5.0); grades B 3 404 (43.5) · C 2 264 (28.9) · A 1 821 (23.3) · D 339 (4.3); channels branch 3 590 (45.9) · app 2 669 (34.1) · partner 1 569 (20.0); status closed 4 242 · active 3 352 · written_off 190 · default 44; customer segments mass 3 585 · sme 1 251 · affluent 1 204.

**Match:** identical to week 3 S2. **Finding.** `value_counts(normalize=True)` is the `COUNT(*) / SUM(COUNT(*)) OVER ()` of week 3 — four blocks in a loop instead of four `UNION ALL` branches. App = Micro and partner = BNPL cell for cell: channel and product remain one cut, not two.
</details>

### S3. Date range — first/last disbursement, payments, as-of

<details><summary>Model answer</summary>

```python
pay = pd.read_sql("SELECT * FROM payments", con, parse_dates=["paid_at"])
inst = pd.read_sql("SELECT * FROM installments", con, parse_dates=["due_date"])
print(L["disbursed_at"].min(), L["disbursed_at"].max(), pay["paid_at"].min(), pay["paid_at"].max(), inst["due_date"].max())
# 2024-01-02 · 2026-10-01 · 2024-01-31 · 2026-11-24 · 2030-10-01
(pay["paid_at"] > AS_OF).sum()      # 24 forward-dated rows, 53 438 947
```

**Match:** identical. **Finding.** 33 months of lending, a schedule to October 2030, and `MAX(paid_at)` after the as-of — the 24 rows that every payment sum below excludes with `pay["paid_at"] <= AS_OF`. In pandas the five extremes are five method calls on typed columns; the `parse_dates=` argument is where the typing happens, and forgetting it turns `.max()` into a string comparison that still "works".
</details>

### S4. Key measures — the totals

<details><summary>Model answer</summary>

```python
pc = pay.sort_values("payment_id").drop_duplicates(subset=["installment_id", "paid_at", "amount"])
outstanding = inst.loc[inst["due_date"] > AS_OF, "principal_due"].sum()
collected = pc.loc[pc["paid_at"] <= AS_OF, "amount"].sum()
tiles = {"loans": len(L), "borrowers": L["customer_id"].nunique(), "disbursed": L["principal"].sum(),
         "avg_ticket": round(L["principal"].mean()), "avg_term": round(L["term_months"].mean(), 1),
         "outstanding": outstanding, "collected": collected, "interest": inst["interest_due"].sum()}
# 7828 · 4335 · 404 783 280 000 · 51 709 668 · 11.8 · 208 723 504 430 · 255 061 333 229 · 122 497 355 801
assert tiles["outstanding"] == 208_723_504_430 and tiles["collected"] == 255_061_333_229
```

**Match:** all eight. **Finding.** Collected through the clean, as-of-cut payments is 255 061 333 229 (52 826 rows) against a raw 255 173 169 976: 58.4 m of duplicates and 53.4 m of forward-dated rows out — the two filters are one `sort_values().drop_duplicates()` and one mask. 73 % of loans go to repeat borrowers (`(L.groupby("customer_id").size() > 1)` weighted by loans); the book has lent 404.8 bn and still carries 208.7 bn.
</details>

### S5. Magnitude — by product, by region

<details><summary>Model answer</summary>

```python
by_prod = L.groupby("code").agg(loans=("loan_id", "size"), disbursed=("principal", "sum"), avg_ticket=("principal", "mean"))
by_prod["loan_share"] = 100 * by_prod["loans"] / by_prod["loans"].sum()
by_prod["amount_share"] = 100 * by_prod["disbursed"] / by_prod["disbursed"].sum()
by_prod.sort_values("disbursed", ascending=False).round(1)
# SME 781 / 241 117 150 000 / 308 728 745 / 10.0 / 59.6 · AUTO 391 / 84 791 530 000 / 216 858 133 / 5.0 / 20.9 · CONS 2418 / 65 109 280 000 / 30.9 / 16.1 · MICRO 2669 / 7 221 210 000 / 34.1 / 1.8 · BNPL 1569 / 6 544 110 000 / 20.0 / 1.6
by_region = L.groupby("region")["principal"].sum().pipe(lambda s: (100 * s / s.sum()).round(1)).sort_values(ascending=False)
# Tashkent 39.7 · Fergana 12.7 · Samarkand 11.2 · Andijan 9.5 · Namangan 8.6 · Bukhara 6.9 · Nukus 5.8 · Termez 5.7
```

Chart: the Day-4 barh of outstanding by product (60.3 / 27.6 / 11.0 / 0.5 / 0.5). **Match:** identical to week 3 S5. **Finding.** Two books in one — 85 % of loans are Micro/Consumer/BNPL, 80 % of the money is SME/Auto; the ticket ratio SME : Micro is 114 : 1 (308.7 m vs 2.7 m). `agg` with named outputs then two share columns is the whole of week 3's window-over-`GROUP BY`.
</details>

### S6. Ranking — top and bottom

<details><summary>Model answer</summary>

```python
y26 = L[(L["disbursed_at"] >= "2026-01-01") & (L["disbursed_at"] < "2026-10-01")]
br = pd.read_sql("SELECT branch_id, branch_name FROM branches", con)
rank = (y26.merge(br, on="branch_id", validate="m:1").groupby("branch_name")
           .agg(loans=("loan_id", "size"), disbursed_2026=("principal", "sum")).sort_values("disbursed_2026", ascending=False))
rank["rk"] = rank["disbursed_2026"].rank(method="min", ascending=False).astype(int)
# 1 Tashkent South 381 / 21 380 780 000 · 2 Fergana Central 315 / 19 742 090 000 · 3 Samarkand Central 344 / 19 440 640 000 … 10 Termez Central 184 / 8 120 400 000
cust = pd.read_sql("SELECT customer_id, first_name || ' ' || last_name AS customer, segment FROM customers", con)
top = (L.groupby("customer_id").agg(loans=("loan_id", "size"), total=("principal", "sum")).nlargest(3, "total")
        .merge(cust, on="customer_id"))
# Murod Yusupov (sme) 5 / 1 258 430 000 · Ulugbek Nazarov (sme) 2 / 1 023 170 000 · Ulugbek Mirzaev (mass) 3 / 971 810 000
L.groupby("code")["principal"].max()     # AUTO 399 530 000 · BNPL 7 990 000 · CONS 49 990 000 · MICRO 4 990 000 · SME 599 060 000
```

**Match:** identical. **Finding.** Fergana Central is second by money with fewer loans than four other branches — SME-heavy; Termez is last at 38 % of the leader. Every product's biggest loan sits at its `max_amount`. `rank(method="min")` is `RANK()`; `nlargest` is `ORDER BY … LIMIT`; the one place to be careful is the branch join — `validate="m:1"` says a loan has one branch.
</details>

### S7. Change over time — monthly disbursements, 3-month average, mom %, yoy %

<details><summary>Model answer</summary>

```python
m = (L[L["disbursed_at"] < "2026-10-01"].groupby(L["disbursed_at"].dt.to_period("M"))
       .agg(loans=("loan_id", "size"), disbursed=("principal", "sum")))
m["ma3"] = m["disbursed"].rolling(3).mean().round()
m["mom_pct"] = m["disbursed"].pct_change().mul(100).round(1)
m["yoy_pct"] = m["disbursed"].pct_change(12).mul(100).round(1)
m.loc["2026-01":]
```

| month | loans | disbursed | ma3 | mom % | yoy % |
|---|---|---|---|---|---|
| 2026-01 | 287 | 17 452 370 000 | 16 605 040 000 | −1.5 | +72.8 |
| 2026-02 | 265 | 11 893 850 000 | 15 689 990 000 | −31.8 | +20.0 |
| … | | | | | |
| 2026-08 | 358 | 22 290 210 000 | 19 678 126 667 | +7.7 | +26.2 |
| 2026-09 | 361 | 17 015 490 000 | 19 999 856 667 | −23.7 | +16.2 |

Chart: Day-4 figure 1 (month in grey, average in blue). **Match:** all 33 rows identical to week 3 S7, including yoy for January 2025 onwards. **Finding.** The 3-month average rose from 16.6 to 20.0 bn in nine months (+20 %) while single months swing ±30 %. The pandas version has no `LAG` trap: `pct_change(12)` runs on the full 33-row frame and the display filter (`.loc["2026-01":]`) comes *after* — but if you filter the frame first and then call `pct_change(12)`, every yoy is NaN, exactly week 3's mistake in a new spelling.
</details>

### S8. Cumulative — month-end outstanding 2026

<details><summary>Model answer</summary>

```python
rows = []
for ms in pd.period_range("2026-01", "2026-09", freq="M"):
    nxt = (ms + 1).to_timestamp()                                   # first day of the next month
    live = L.loc[L["disbursed_at"] < nxt, "loan_id"]                # loans that existed at month end
    bal = inst[(inst["due_date"] >= nxt) & inst["loan_id"].isin(live)]
    rows.append((str(ms), bal["principal_due"].sum(), bal["loan_id"].nunique()))
s8 = pd.DataFrame(rows, columns=["month", "outstanding", "loans_with_balance"])
s8["net_growth"] = s8["outstanding"].diff()
# 2026-01 151 807 386 149 (2 579) · 02 154 145 984 724 (+2.3 bn) · 03 163 974 316 812 (+9.8) · … · 08 203 830 205 928 (+10.2) · 09 208 243 879 623 (+4.4 bn, 3 392 loans)
```

**Match:** all nine month-ends equal week 3 S8 (`v_portfolio_monthly` / the recursive calendar). **Finding.** +56 bn (+37 %) in nine months while 161.5 bn was disbursed: two thirds of new lending replaces repayments. This is the one section where pandas is *clearer* than SQL — a nine-step loop with a readable condition replaces a recursive CTE plus a correlated aggregate — and also the one where it is slowest (nine passes over 92 193 rows; still under a second).
</details>

### S9. Performance — buckets, PAR30, NPL90, FPD30, roll rates

<details><summary>Model answer</summary>

```python
d = dpd_per_loan(inst, pc, AS_OF)                                               # HW 5.2: loan_id, dpd, bucket
st = d.merge(inst[inst["due_date"] > AS_OF].groupby("loan_id")["principal_due"].sum().rename("outstanding"), on="loan_id", how="left").fillna({"outstanding": 0})
b = st.groupby("bucket", observed=True).agg(loans=("loan_id", "size"), outstanding=("outstanding", "sum"))
b["share_pct"] = (100 * b["outstanding"] / b["outstanding"].sum()).round(2)
# 0 7429 / 197 486 207 578 / 94.62 · 1-30 124 / 4 729 769 899 / 2.27 · 31-60 25 / 748 610 049 / 0.36 · 61-90 16 / 439 441 377 / 0.21 · 90+ 234 / 5 319 475 527 / 2.55
par30 = st.loc[st["dpd"] > 30, "outstanding"].sum() / st["outstanding"].sum()   # 3.12 %
npl90 = st.loc[st["dpd"] > 90, "outstanding"].sum() / st["outstanding"].sum()   # 2.55 %
```

FPD30: Day 3's pivot — 91 / 7 099 = **1.28 %**, app 1.70 · partner 1.12 · branch 1.04 %, grades A 0.60 · B 0.97 · C 2.16 · D 2.23. Roll rates: Day 4's `read_sql` matrix or two `dpd_per_loan` snapshots merged `how="outer"` — 1–30 → 31–60 **19.5 %** (25 of 128), cure 75.8 %, 31–60 → 61–90 69.6 %, 61–90 → 90+ 100 %, 117 new entries. Vintage: the Day-4 heatmap — 2025-10 at 6.91 % (MOB 3) / 11.52 % (MOB 6) vs pooled 2025 4.35 / 7.46. Charts: figures 3, 4, 5.

**Match:** buckets, PAR, NPL, FPD30, roll and vintage all equal week 3 S9. **Finding.** 5.4 % of outstanding is delinquent and 2.55 of the 3.12 PAR30 points are already 90+; the live caseload (1–90 DPD, 165 loans, 5.9 bn) cures three times in four in the first bucket and never after 60 days. One number to explain if yours differs: PAR30 uses whole-loan outstanding, not overdue amount (the arrears ratio would be 3.7 %).
</details>

### S10. Part-to-whole and segmentation — income band × grade

<details><summary>Model answer</summary>

```python
inc = pd.read_sql("SELECT customer_id, monthly_income FROM customers", con)
lc = L.merge(inc, on="customer_id", how="left", validate="m:1")
lc["band"] = (pd.cut(lc["monthly_income"], [0, 5e6, 10e6, 20e6, np.inf], labels=["<5m", "5-10m", "10-20m", "20m+"], right=False)
                .astype(str).replace("nan", "unknown"))
ct = pd.crosstab(lc["band"], lc["risk_grade"])
ct["loans"] = ct.sum(axis=1); ct["cd_share_pct"] = (100 * (ct["C"] + ct["D"]) / ct["loans"]).round(1)
ct["avg_ticket"] = lc.groupby("band")["principal"].mean().round()
# unknown 466 / 116 201 132 17 / 32.0 % · <5m 1670 / 33.0 · 5-10m 2781 / 32.8 · 10-20m 774 / 34.8 · 20m+ 2137 / 33.7
```

Concentration (pandas): top-3 branches 39.1 % of outstanding, top decile of borrowers 49.1 % (`sort_values().head(len // 10).sum()`). Chart: a heatmap of the crosstab or a stacked bar of grade shares per band.

**Match:** identical to week 3 S10 — because `right=False` makes `pd.cut` read `[5m, 10m)` exactly as `WHEN monthly_income < 10000000`; with the default right-closed intervals a customer earning exactly 5 000 000 moves bands and the counts drift by a few. **Finding.** Income does not predict grade: C+D is 32–35 % in every band including the 466 "unknown" loans, which pandas shows only because `.astype(str).replace("nan", "unknown")` turns the NaN band into a row — `pd.cut` alone would have dropped it silently from the crosstab, the week-2 NULL-band lesson one more time.
</details>

### The closing cell — what each tool made easier

<details><summary>Model answer (five sentences, yours will differ)</summary>

1. pandas made S8 easier: a nine-step loop with a plain condition (`due_date >= next month`, loan disbursed before it) replaced a recursive CTE and a correlated aggregate, and `diff()` gave net growth in one call. 2. pandas made S7 and S9 safer: `pct_change(12)` runs on the whole frame before the display filter, `validate="1:1"` and an `assert` after the merge made the grain explicit, and `pd.cut` replaced four `CASE` branches. 3. SQL made S1–S3 and the vintage matrix easier: one `read_sql` of a CTE chain over 92 193 instalments is shorter and faster than the same joins in pandas, and the catalogue (`sqlite_master`) is a query. 4. SQL kept the definition in one place: `v_loan_status` once, read by Excel, Power BI and the notebook, whereas a pandas function lives in one notebook until someone packages it. 5. The right split: aggregate and join in SQL at the database's grain, then shape, cut, check and chart in pandas — and run the asserts in both, because the number that matters is the one both tools agree on.
</details>

---

## Part B — Eight interview questions (30 min, 20 pts)

Answer in writing, 3–5 sentences each, as you would say it aloud: 2 points per question (1 correct and complete, 1 with a Nur Finance example and number) plus 4 for the "definitions I used" note at the top of `interview.md` (as-of, DPD, FPD30, the dedup rule, outstanding).

1. `loc` vs `iloc` — what does each index by, and when does the difference bite?
2. What does `validate=` do in `merge`, and which week-2 mistake does it prevent?
3. `groupby().agg` vs `groupby().transform` — what shape comes back from each, and which SQL construct is each?
4. How does pandas represent a missing value, how do aggregates treat it, and when is `fillna(0)` wrong?
5. `pd.cut` vs a hand-written bucket function — when do you use which, and what are the two traps of `pd.cut`?
6. When do you reach for pandas over SQL, and when the other way round?
7. How do you choose a chart type, and name three rules that are not matters of taste.
8. What makes a notebook reproducible, and how do you prove it before you submit?

<details><summary>Model answers (open after submitting)</summary>

1. `loc` selects by **label** (index value, column name) and accepts boolean masks; `iloc` by **integer position**. They agree on a fresh `RangeIndex` and part ways after a filter or a sort: `late = loans[loans.dpd > 0]; late.loc[0]` raises `KeyError` (label 0 is not a late loan) while `late.iloc[0]` is the first late row. Rule: `loc` for conditions and names, `iloc` for "the first n", `reset_index(drop=True)` when you need them to agree again.
2. `validate="1:1" / "m:1" / "1:m"` makes `merge` raise `MergeError` when a key is not unique on the side you promised. It prevents the silent fan-out: joining instalments onto loans and summing `principal` gave ×24.7 in week 2 (11.8 rows per loan, more on the big long loans); with `validate="1:1"` the merge of 92 193 instalments onto 52 826 per-instalment payment sums is proven one-to-one before any sum. Add `indicator=True` to see `left_only` rows — the anti-join.
3. `agg` returns **one row per group** (`GROUP BY`): payments per region, 8 rows. `transform` returns **one value per original row**, aligned to the frame — the window function `SUM(amount) OVER (PARTITION BY loan_id)`: each payment's share of its loan's total, 52 850 rows. `cumcount()` after a sort is `ROW_NUMBER() OVER (PARTITION BY …)` — the dedup tool.
4. `NaN` (`NaT` for dates); `sum`, `mean`, `count` skip it like SQL's NULL (`cust.monthly_income.mean()` = 15.2 m over 5 684 values), `==` never finds it (`isna()` does), and `len` ≠ `count`. `fillna(0)` is right for a count (no payment → 0 paid) and wrong for a measurement: it drops the mean income to 14.3 m and invents 356 zero earners; impute with a labelled estimate or keep the NaN and show the "unknown" band (466 loans in S10).
5. `pd.cut` for numeric ranges that are a definition (DPD buckets, income bands): one line, ordered category, vectorised, `right=False` when the rule is `<`. A function + `apply` when the label depends on several columns or on text logic. Traps: the first edge must be *below* the smallest value (`-1`, or every `dpd = 0` becomes NaN — 7 429 rows), and the result is a category — compare with `.astype(str)` and use `observed=True` in `groupby`.
6. SQL when the question is one aggregation or join over the database's big tables at its own grain (the vintage CTE, the DPD snapshots — `read_sql` and done), when the result must be shared by several tools (a view), or when the data does not fit in memory. pandas for the chain of reshapes after that — cut, merge of two results, rolling, pivot, charts — for anything iterative (S8's loop), for the asserts, and for the output (CSV, Excel, PNG). The notebook holds both: aggregate in SQL, shape and check in pandas.
7. By the **question**: time → line (34 months), categories → bar / barh for rankings and long labels, a matrix → heatmap (vintage, roll), distribution per group → boxplot, two numbers per row → scatter. Not taste: bars start at zero (no log axis on bars), sort categories by value unless the order is natural, no pie beyond three slices and no 3D, one colour plus one highlight (90+ red), the title states the finding, no legend for one series, unit on the axis — and drop the one-day October point.
8. Inputs by path, not by hand; the as-of as one variable; every number printed by code, never typed into Markdown; asserts on known counts (6 000 / 52 850 / 399 / 208 723 504 430) so a changed extract stops the run; no cell depends on being run twice. Proof: **Kernel → Restart & Run All** finishes top to bottom with every assert green — then save, so the outputs are inside the `.ipynb` the reviewer opens.
</details>

---

## Scoring and what happens next

| Part | Points | Pass |
|---|---|---|
| A — report, 10 sections × 8 | 80 | |
| B — 8 questions × 2 + definitions note | 20 | |
| **Total** | **100** | **≥ 70 → Week 6 on Monday** |

Below 70: feedback names the sections to redo (most often S8 — the month-end loop — and S9's FPD30 scope); re-submit Monday morning before Week 6. Points go to `docs/progress.md`.

**Submission checklist** — `submissions/week-05/day-5/`: `checkpoint.ipynb` (executed, 10 sections, ≥ 4 charts, the match line under each section, the five-sentence closing cell), `interview.md` (definitions note + 8 answers). Also due today: **HW 5.2** in `day-3/` (`clean_nur.py` or the executed `day3_starter.ipynb`, `customers_clean.csv`, `payments_clean.csv`, `dpd_per_loan.csv`).

<span class="badge stretch">Stretch</span> Package the week: a file `nur.py` with `clean_customers`, `clean_payments`, `dpd_per_loan`, `portfolio_summary`, `fpd30_table` and `figure_pack(con, as_of, out_dir)`, imported by a ten-line `monthly.py` that writes the tiles, the buckets and the five PNGs for any `AS_OF`. Run it for 2026-09-01 and 2026-10-01 and diff the two bucket tables — the roll-rate matrix, from the command line.

Madina, 17:30: *"Jasur ran your notebook on his machine and got the same 399. Bekzod has his monthly file. Timur has five PNGs with titles he did not write. Monday is statistics — the week where you learn what 'the app channel is 0.66 points worse' is actually worth with 41 cases against 34."*

---

### 📎 Hand in here

Write or attach each part, then **📤 Submit** — no GitHub needed. (Prefer GitHub? Push to `submissions/week-05/day-5/` and tap 📤 I pushed my homework in the bot — both count.)

```sqltask
{"check": "handin-W5D5", "lesson": "W5D5", "title": "Checkpoint 5", "tasks": [{"id": "checkpoint.ipynb", "file": "checkpoint.ipynb", "names": ["checkpoint.ipynb"], "upload": true, "accept": ".ipynb", "q": "Attach `checkpoint.ipynb` — what the page above asks for."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else the page lists (one more file, or a .zip of several)."}]}
```

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w05d5", "pass": 0.8, "questions": [
  {"type": "single", "q": "Every yoy_pct value comes out NaN. Why?", "code": "m26 = m.loc[\"2026-01\":]\nm26[\"yoy_pct\"] = m26[\"disbursed\"].pct_change(12) * 100", "options": ["rolling(3) must run first", "pct_change needs dates as text", "The frame was cut to 2026 before pct_change(12), so no row is 12 months back", "pct_change works only on integers"], "answer": 2, "explain": "Compute on the full 33-month frame and filter for display afterwards — week 3's LAG trap in a new spelling (→ S7)."},
  {"type": "single", "q": "Where are the loans whose customer has no income?", "code": "lc[\"band\"] = pd.cut(lc[\"monthly_income\"], [0, 5e6, 10e6, 20e6, np.inf], right=False)\npd.crosstab(lc[\"band\"], lc[\"risk_grade\"])", "options": ["In the <5m row", "In a row called NaN", "pd.cut raises an error on NaN", "Nowhere — the NaN band is dropped from the crosstab silently"], "answer": 3, "explain": "Turn the NaN band into a row (astype(str).replace(\"nan\", \"unknown\")) — the week-2 NULL-band lesson (→ S10)."},
  {"type": "single", "q": "Why right=False in the income cut?", "options": ["pd.cut requires it for money", "It makes the cut faster", "It keeps NaN as a band", "So that [5m, 10m) matches SQL's WHEN monthly_income < 10000000 — a customer earning exactly 5 000 000 stays in the same band as in week 3"], "answer": 3, "explain": "pd.cut is right-closed by default; the SQL rule was '<', so right=False reproduces it (→ S10)."},
  {"type": "single", "q": "Summing principal after merging instalments onto loans gives ×24.7. Which merge argument would have stopped it?", "options": ["indicator=True", "how=\"left\"", "sort=False", "validate= with the grain you expect (e.g. \"m:1\")"], "answer": 3, "explain": "validate raises MergeError when a key is not unique where you promised — the week-2 fan-out becomes an error (→ 'Common mistakes')."},
  {"type": "single", "q": "You forgot parse_dates=, yet L[\"disbursed_at\"].max() still returns a value. What is wrong?", "options": ["Nothing", "It is a string comparison that works on ISO text by luck; .dt and date arithmetic are unavailable", "max() returned NaN", "pandas converted the column automatically"], "answer": 1, "explain": "parse_dates= is where the typing happens; without it .max() compares text and still 'works' (→ S3)."},
  {"type": "multi", "q": "Which belong in every checkpoint section?", "options": ["The week-3 number next to yours — an assert where it must be exact, a printed pair where rounding may differ", "One finding Bekzod can read aloud", "The grain in a comment", "Thirty cells showing every attempt", "A match / mismatch line that says why"], "answer": [0, 1, 2, 4], "explain": "Three cells per section, not thirty: the reviewer reads the finding, checks the match line, then the output (→ 'Working method')."},
  {"type": "text", "q": "Which Jupyter command proves the notebook is reproducible before you submit? (Kernel → …)", "answer": ["restart & run all", "restart and run all", "kernel → restart & run all", "kernel > restart & run all", "kernel -> restart & run all", "restart & run all cells"], "explain": "Restart & Run All runs every cell from a clean kernel; then save, so the outputs are inside the file (→ 'Rules')."},
  {"type": "single", "q": "Your pandas number differs from week 3 and the line under it explains why (half-open vs inclusive filter). What does it cost?", "options": ["Half the section's points", "Nothing — only an unexplained mismatch costs the number points", "The finding points", "The whole section"], "answer": 1, "explain": "A mismatch is not a failure if the line under it says why (→ 'Working method')."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w05d5", "q": "Nilufar's committee wants last month's NPL90 next to this month's 2.55 %. Recompute it as of 2026-09-01 with the week's pipeline: loans disbursed on or before 2026-09-01; DPD from the instalments and the de-duplicated payments paid on or before 2026-09-01; outstanding = principal_due of instalments due after 2026-09-01. NPL90 = outstanding of loans with dpd > 90 ÷ total outstanding. Give a percentage to 3 decimals.", "type": "number", "dp": 3, "h": ["6c06ef3fdea33478da9c0a73"], "hint": "Your dpd_per_loan already takes the as-of as an argument — the as-of must move in three places, not one.", "sol": "QVMgPSBwZC5UaW1lc3RhbXAoIjIwMjYtMDktMDEiKQpwYyA9IHBheS5zb3J0X3ZhbHVlcygicGF5bWVudF9pZCIpLmRyb3BfZHVwbGljYXRlcyhzdWJzZXQ9WyJpbnN0YWxsbWVudF9pZCIsICJwYWlkX2F0IiwgImFtb3VudCJdKQpwYWlkID0gcGNbcGNbInBhaWRfYXQiXSA8PSBBU10uZ3JvdXBieSgiaW5zdGFsbG1lbnRfaWQiLCBhc19pbmRleD1GYWxzZSkuYWdnKHBhaWQ9KCJhbW91bnQiLCAic3VtIikpCm0gPSBpbnN0Lm1lcmdlKHBhaWQsIG9uPSJpbnN0YWxsbWVudF9pZCIsIGhvdz0ibGVmdCIsIHZhbGlkYXRlPSIxOjEiKS5maWxsbmEoeyJwYWlkIjogMH0pCmxhdGUgPSBtWyhtWyJwYWlkIl0gPCBtWyJ0b3RhbF9kdWUiXSkgJiAobVsiZHVlX2RhdGUiXSA8PSBBUyldCmRwZCA9IChBUyAtIGxhdGUuZ3JvdXBieSgibG9hbl9pZCIpWyJkdWVfZGF0ZSJdLm1pbigpKS5kdC5kYXlzLnJlbmFtZSgiZHBkIikKb3V0ID0gaW5zdFtpbnN0WyJkdWVfZGF0ZSJdID4gQVNdLmdyb3VwYnkoImxvYW5faWQiKVsicHJpbmNpcGFsX2R1ZSJdLnN1bSgpLnJlbmFtZSgib3V0IikKcyA9IChMLmxvY1tMWyJkaXNidXJzZWRfYXQiXSA8PSBBUywgWyJsb2FuX2lkIl1dCiAgICAgICAubWVyZ2UoZHBkLCBvbj0ibG9hbl9pZCIsIGhvdz0ibGVmdCIpLm1lcmdlKG91dCwgb249ImxvYW5faWQiLCBob3c9ImxlZnQiKS5maWxsbmEoeyJkcGQiOiAwLCAib3V0IjogMH0pKQpsZW4ocyksIHNbIm91dCJdLnN1bSgpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIDcgNDY0IGxvYW5zLCAyMDQgODM4IDk4NiA4NjMKMTAwICogcy5sb2Nbc1siZHBkIl0gPiA5MCwgIm91dCJdLnN1bSgpIC8gc1sib3V0Il0uc3VtKCkgICAgICMgNCA3MjggMDQ3IDcwNSAvIDIwNCA4MzggOTg2IDg2MyA9IDIuMzA4ICUKCk5QTDkwIHdhcyAyLjMwOCAlIG9uIDEgU2VwdGVtYmVyICgyMTcgbG9hbnMgaW4gOTArLCB0aGUgRGF5LTQgUDcgY291bnQpIGFuZCAyLjU1ICUgb24gMSBPY3RvYmVyOiArMC4yNCBwb2ludHMgaW4gb25lIG1vbnRoLCB3aGlsZSBQQVIzMCBiYXJlbHkgbW92ZWQgKDMuMTAg4oaSIDMuMTIgJSkuClRoZSAxNyBsb2FucyB0aGF0IHJvbGxlZCBmcm9tIDYx4oCTOTAgaW50byA5MCsgZXhwbGFpbiB0aGUganVtcCDigJQgdGhlIHJpc2sgaXMgbWlncmF0aW5nIGludG8gdGhlIG9sZGVzdCBidWNrZXQsIG5vdCBhcnJpdmluZyBhcyBhIG5ldyB3YXZlLgpUaGUgdHJhcHM6IGxlYXZpbmcgdGhlIHBheW1lbnRzIGN1dCBhdCAxIE9jdG9iZXIgKGV2ZXJ5IFNlcHRlbWJlciBwYXltZW50IHRoZW4gJ2N1cmVzJyBsb2FucyBlYXJseSksIG9yIGtlZXBpbmcgdGhlIGxvYW5zIGRpc2J1cnNlZCBhZnRlciAxIFNlcHRlbWJlciBpbiB0aGUgZGVub21pbmF0b3Iu"}
```

<!-- challenge:end -->
