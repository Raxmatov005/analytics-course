# Week 5 · Day 4 — Charts and the SQL bridge: matplotlib, seaborn, read_sql

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge company">Company corner</span>

> STORY **Thursday, 9:00.** Timur, BI (*BI-специалист*), with the board deck template. *"Madina's Excel page was right and nobody could update it. Power BI is right and the board will not open it. What the board opens is the deck. I want **a monthly figure pack as PNGs** — five charts, same size, same colours, a sentence on each — that I drop into slot four every month without touching a mouse. If your notebook makes them, I will run it. If it needs you, it is not a figure pack, it is a favour."* Jasur, from his desk: *"And read the SQL straight into pandas. Do not re-type a CTE you already have."*

## Today in 3 lines

- **matplotlib** (*библиотека matplotlib*) draws anything from a figure and an axes: `plot` (line), `bar` / `barh`, `hist`, `boxplot`, `scatter`; labels, a title that states the finding, a legend only when there is more than one series, big numbers formatted in bn; **seaborn** adds statistical charts on long-format data in one call (`barplot`, `lineplot`, `heatmap`, `boxplot`, `countplot`); `subplots` for a grid; `savefig` for the deck.
- **The bridge:** `sqlite3.connect` + `pd.read_sql(query, con)` runs any week-3 SQL — the vintage CTE chain, the roll-rate `FULL OUTER JOIN` — and returns a DataFrame; the two worlds are one notebook.
- The chart-choice rules are week 4's, unchanged; by evening Timur has `figures/01…05.png` and the code that makes them again next month.

---

## 1. Learn — the figure, the axes, and what goes on them

### matplotlib: figure and axes

```python
import matplotlib.pyplot as plt
fig, ax = plt.subplots(figsize=(10, 5))          # a figure (the page) with one axes (the chart area)
ax.plot(x, y, color="#1d4ed8", lw=2, label="3-month average")
ax.set_title("Disbursements climbed to a 20 bn run-rate", loc="left")
ax.set_xlabel(""); ax.set_ylabel("UZS per month")
ax.legend(frameon=False)
fig.tight_layout()
fig.savefig("figures/01.png", dpi=150)
```

Always the **object interface**: `fig, ax = plt.subplots()`, then methods on `ax`. (`plt.plot(...)` also works and draws on "the current axes" — fine in a hurry, confusing with several charts.) The chart types, with the question each answers (week 4's table):

| Question | `ax.` method | Notes |
|---|---|---|
| How does it move over time? | `plot(x, y)` | x as real dates (`pd.to_datetime`), one line per series |
| How do categories compare? | `bar(labels, values)` / `barh` for long labels or rankings | **starts at zero**; sort by value unless the order is natural (months, buckets) |
| How is a number distributed? | `hist(values, bins=...)` | choose bins by hand; `log=True` for money |
| Distribution per group | `boxplot([g1, g2, ...], labels=...)` | median, quartiles, whiskers, outliers |
| Two numbers per row | `scatter(x, y, s=..., alpha=0.3)` | `alpha` for 7 828 points; `ax.set_xscale("log")` for money |

Decorations: `ax.set_title(text, loc="left")`, `ax.set_xlabel` / `set_ylabel`, `ax.set_ylim(0, …)`, `ax.text(x, y, label)` for data labels, `ax.axhline(y)` for a reference line, `ax.annotate` for an arrow to the point you talk about, `ax.tick_params(axis="x", rotation=45)`. Colours: pick one grey for the series and one colour for the highlight (`"#9ca3af"`, `"#1d4ed8"`, red `"#dc2626"` for 90+). `fig.tight_layout()` before saving, or labels fall off the page.

### The anatomy of an honest chart, in code

The twelve rules of week 4 Day 4, each as the line that implements it:

```python
fig, ax = plt.subplots(figsize=(10, 5))                                   # 1  one chart, one message, a size that fits a slide
ax.bar(late.index, late.values, color=[RED if k == "90+" else GREY for k in late.index])   # 2  one colour + one highlight
ax.set_ylim(0, late.max() * 1.15)                                         # 3  bars from zero; headroom for labels
for i, v in enumerate(late.values):
    ax.text(i, v, f"{v:,}", ha="center", va="bottom")                     # 4  the number the reader will quote, formatted
ax.set_title("399 loans are late; 234 are already 90+", loc="left")       # 5  the finding, left-aligned, not the chart's name
ax.set_ylabel("loans"); ax.set_xlabel("DPD bucket as of 2026-10-01")      # 6  the unit and the as-of
# no ax.legend() call                                                      # 7  no legend for one series
ax.spines[["top", "right"]].set_visible(False)                            # 8  less ink: no frame on two sides
ax.annotate("17 loans arrived from 61-90 this month", xy=(3, 234), xytext=(1.6, 200),
            arrowprops=dict(arrowstyle="->", color=RED))                  # 9  one annotation for the point you talk about
fig.text(0.01, 0.01, "loans_status.csv · 7 828 loans · payments de-duplicated", fontsize=9, color="#6b7280")  # 10 source line
fig.tight_layout()                                                         # 11 nothing cut off
fig.savefig("figures/03_dpd_buckets.png", dpi=150, facecolor="white")      # 12 a file, not a screenshot
```

A chart that follows these is boring to look at and impossible to misread — the right trade for a board deck.

### Big numbers in bn — the formatter

```python
from matplotlib.ticker import FuncFormatter
bn = FuncFormatter(lambda x, _: f"{x / 1e9:,.0f} bn")
ax.yaxis.set_major_formatter(bn)                 # 200000000000 → "200 bn"
ax.text(v, y, f"{v / 1e9:,.1f} bn", va="center") # a data label in billions
```

Soum amounts have twelve digits; a y-axis reading `2.0e11` is a chart nobody quotes. Divide at display time (the formatter) or once in the data (`df["bn"] = df["outstanding"] / 1e9`) — never both. Percentages: `PercentFormatter(100)` or `f"{v:.1f} %"`.

### seaborn: statistical charts on long data

```python
import seaborn as sns
sns.set_theme(style="whitegrid", context="talk")          # one theme for the whole pack — same fonts and gridlines on every PNG
sns.barplot(data=mix, x="outstanding", y="product", color="#9ca3af", ax=ax)
sns.lineplot(data=md, x="month", y="amount", hue="product", ax=ax)               # one line per product from LONG data
sns.heatmap(vint, annot=True, fmt=".1f", cmap="Reds", ax=ax)                     # a matrix: cohort × MOB
sns.boxplot(data=loans, x="product", y="principal", ax=ax)                        # distribution per group, from the raw rows
sns.countplot(data=loans, x="grade", hue="product", ax=ax)                        # value_counts as bars
```

seaborn (*библиотека seaborn*) sits on matplotlib: every call takes `ax=` and returns the axes, so the decorations above still apply. Its gift is **`hue`**: a third column that becomes colour, from **long** data (one row per month × product — `melt` from yesterday), so a five-line chart is one call. `barplot` *aggregates* (mean by default — pass `estimator=sum` or aggregate first); `countplot` counts rows; `heatmap` wants a wide matrix (a `pivot`); `boxplot` and `histplot` want the raw rows. `sns.set_theme()` once at the top gives the pack one look.

| seaborn call | Data shape it wants | What it does with it | Nur Finance use |
|---|---|---|---|
| `barplot(x, y, hue)` | long, one row per observation *or* pre-aggregated | aggregates (mean by default — pass `estimator=sum`) | outstanding by product (pre-aggregated) |
| `countplot(x, hue)` | raw rows | counts rows per category | loans per grade per product |
| `lineplot(x, y, hue)` | long, one row per period × series | one line per `hue` value | monthly disbursement by product |
| `heatmap(matrix)` | **wide**: a `pivot` / `crosstab` | colours each cell, `annot=True` prints it | vintage cohort × MOB, roll matrix |
| `boxplot(x, y)` / `violinplot` | raw rows | median, quartiles, whiskers per category | principal by product |
| `histplot(x, bins, hue)` / `kdeplot` | raw rows | distribution, optionally per group | DPD of late loans |
| `scatterplot(x, y, hue, size)` | raw rows | two measures per row | principal vs outstanding |
| `relplot(..., col=)` / `catplot` | long | **small multiples** — one panel per `col` value | one panel per product |

`melt` makes long from wide, `pivot` makes wide from long (Day 3): seaborn's `hue` wants long, `heatmap` wants wide — most "seaborn does not work" moments are the wrong shape, not the wrong call.

### subplots — the grid

```python
fig, axes = plt.subplots(2, 2, figsize=(14, 9))          # axes is a 2×2 array
axes[0, 0].bar(...); axes[0, 1].plot(...)
for ax in axes.flat: ax.set_xlabel("")
fig.suptitle("Nur Finance — portfolio, as of 2026-10-01", x=0.01, ha="left")
```

One figure, several axes — the one-pager of week 4 as a single PNG. `sharey=True` when the charts must be comparable; `axes.flat` to loop. Do not put five unrelated charts on one grid for the deck — Timur wants five files, one message each.

### Saving for the deck

```python
fig.savefig("figures/02_outstanding_mix.png", dpi=150, bbox_inches="tight", facecolor="white")
fig.savefig("figures/02_outstanding_mix.svg")          # vector, for a designer
plt.close(fig)                                          # free the memory when you make dozens in a loop
```

A 16:9 slide takes a `figsize=(12, 5.4)` figure at `dpi=150` (1 800 × 810 px) without rescaling; keep one size per chart type across the pack so the deck does not jump. `bbox_inches="tight"` trims the margins; `facecolor="white"` because a transparent background turns black in some viewers; `plt.close(fig)` after each save, or thirty open figures eat the kernel's memory and Jupyter warns `More than 20 figures have been opened`. Name files with a number so they sort in deck order (`01_…`, `02_…`) and never with a date — the folder is the dated thing.

### Chart-choice rules (week 4, unchanged)

Line for time (34 months), bar for categories, **barh** for rankings and long labels, heatmap for a matrix, box for a distribution per group; **no pie** beyond three slices, **no 3D**, **bars start at zero**, **sort by value** unless the order is natural, **one colour + one highlight**, **the title states the finding** (*"SME is 60 % of the book"*, not *"Outstanding by product"*), **no legend for one series**, **unit on the axis or in the title**, a **source line** (`fig.text(0.01, 0.01, "loans_status.csv · 7 828 loans · as of 2026-10-01", fontsize=9)`). The October-2026 point (one day, 0.85 bn) is dropped from every time series or it reads as a crash. A log axis on a bar chart breaks "bars start at zero": the 7 429 current loans go into the axis label, not onto a log scale.

### `pd.read_sql` — the bridge

```python
import sqlite3
con = sqlite3.connect("../raw/nur.db")
monthly = pd.read_sql("""
    SELECT strftime('%Y-%m', disbursed_at) AS month, COUNT(*) AS loans, SUM(principal) AS disbursed
    FROM loans WHERE disbursed_at < '2026-10-01' GROUP BY 1 ORDER BY 1""", con)
loans = pd.read_sql("SELECT * FROM loans", con, parse_dates=["disbursed_at"])
pd.read_sql("SELECT COUNT(*) AS n FROM payments WHERE paid_at > ?", con, params=("2026-10-01",))   # 24 — parameters, never f-strings
```

`sqlite3.connect(path)` opens the database file (SQL Server / PostgreSQL: `sqlalchemy.create_engine("mssql+pyodbc://…")` and the same `read_sql`); `pd.read_sql(sql, con)` runs the query and hands back a DataFrame with the column names of the `SELECT`. Any SQL the engine accepts works — CTEs, windows, the recursive calendar — so **nothing from weeks 1–3 is re-typed**: the aggregation that SQL does well (joins across 92 193 instalments, the DPD snapshots) stays in SQL; the shaping and plotting that pandas does well happens after. `params=` for values (dates, ids) — building SQL with f-strings is how you get a broken query or, on a real server, an injection. `df.to_sql("name", con, if_exists="replace", index=False)` goes the other way: a cleaned DataFrame becomes a table that Power BI can read.

Where the line is: a question that is one `GROUP BY` over big tables → SQL; a sequence of reshapes, a cut, a merge of two results, a chart → pandas. The checkpoint tomorrow asks you to say which was easier for which section — this is the vocabulary.

### pandas plotting shortcuts

```python
monthly.set_index("month")["disbursed"].plot(figsize=(10, 4), title="…")   # a line in one call (matplotlib underneath)
mix.set_index("product")["outstanding"].plot.barh()
loans["dpd"].plot.hist(bins=30)
ax = mix.plot.barh(x="product", y="outstanding", legend=False); ax.set_title(...)   # returns the axes — decorate as usual
```

`df.plot` / `Series.plot` is matplotlib with the index as x — perfect for a five-second look while exploring; for the deck, go through `fig, ax` so the title, formatter and size are yours.

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ matplotlib figure and axes — [Python for Data Analytics - Full Course for Beginners (Luke Barousse), 5:21:23](https://youtu.be/wUSDVGivd-8?t=19283)
- ▶ Chart formatting / histograms / box plots — same course, [8:17:21](https://youtu.be/wUSDVGivd-8?t=29841)
- ▶ seaborn — same course, [9:31:39](https://youtu.be/wUSDVGivd-8?t=34299)
- ▶ seaborn (short single-topic) — [Seaborn Crash Course - Data Visualization in Python (NeuralNine), 08:16](https://youtu.be/rLVCSmtoA7U?t=496)
- ▶ pandas plotting shortcuts — [Creating Visualizations using Pandas Library (Alex The Analyst), 01:52](https://youtu.be/JpSMse3eVVg?t=112)
- ▶ `read_sql` — [SQL Databases with Pandas and Python - A Complete Guide (Rob Mulla), 08:35](https://youtu.be/DiQ5Hni6oRI?t=515)
- ▶ `read_sql` with SQLite (matches the page's `sqlite3.connect`) — [SQLite with Pandas (Code Adhyayana)](https://youtu.be/xcVXCK6U6LA)

- RU deck `4.5_Python.pdf`: matplotlib OO interface pp. 12–20, seaborn relational / categorical / distribution plots pp. 22–38 (long vs wide data p. 24), heatmap p. 36, pandas plotting pp. 47–55, chart choice and storytelling pp. 68–72. `4.4_Python.pdf`: DB-API and cursors pp. 7–28, `read_sql` / `to_sql` / chunking pp. 29–34, SQLAlchemy engines pp. 38–54 (for the day you connect to SQL Server).
- *Russian terms:* график = chart / plot, линейный график = line chart, столбчатая / линейчатая диаграмма = bar / barh, гистограмма = histogram, ящик с усами = boxplot, диаграмма рассеяния = scatter, тепловая карта = heatmap, подграфик = subplot, легенда = legend, ось = axis, длинный / широкий формат = long / wide format.

---

## 2. Worked example — figure 2 from query to PNG (15 min)

Outstanding mix by product, as a ranking, with shares as labels — the chart Madina's Excel page had, now reproducible:

```python
mix = pd.read_sql("""
    SELECT p.name AS product, SUM(i.principal_due) AS outstanding
    FROM installments i JOIN loans l ON l.loan_id = i.loan_id JOIN products p ON p.product_id = l.product_id
    WHERE i.due_date > '2026-10-01' GROUP BY 1 ORDER BY 2""", con)                     # SQL does the 92 193-row join
mix["share"] = 100 * mix["outstanding"] / mix["outstanding"].sum()                      # pandas does the share
fig, ax = plt.subplots(figsize=(10, 5))
ax.barh(mix["product"], mix["outstanding"], color=[BLUE if s == mix["share"].max() else GREY for s in mix["share"]])
for y, (v, s) in enumerate(zip(mix["outstanding"], mix["share"])):
    ax.text(v, y, f"  {v / 1e9:,.1f} bn · {s:.1f} %", va="center")                     # the number the board will quote
ax.xaxis.set_major_formatter(bn); ax.set_xlim(0, mix["outstanding"].max() * 1.35)       # room for the labels
ax.set_title("SME is 60 % of the 208.7 bn book on 10 % of the loans", loc="left")
fig.tight_layout(); fig.savefig("figures/02_outstanding_mix.png", dpi=150)
```

Output: SME 125.9 bn · 60.3 % (blue) · Auto 57.7 · 27.6 · Consumer 23.1 · 11.0 · BNPL 1.1 · 0.5 · Micro 1.0 · 0.5, smallest at the bottom because `ORDER BY 2` ascending puts the largest bar at the top of a `barh`. Six decisions, each a week-4 rule: barh because five long labels; sorted; from zero; one highlight; the share in the label rather than a second axis; the finding as the title. The `assert abs(mix["outstanding"].sum() - 208_723_504_430) == 0` line above the chart is what makes it a *monthly* figure: when the November extract changes the total, the chart still draws — and the title's "208.7 bn" is now wrong. So compute the title: `f"SME is {mix.share.max():.0f} % of the {mix.outstanding.sum() / 1e9:.1f} bn book on 10 % of the loans"` — a title built from the data cannot go stale.

---

## 3. Practice (50 min)

Notebook `data/python/day4_starter.ipynb` (the five pack figures are in it; add your cells below). Save every chart you make to `figures/` and paste the finding you wrote as its title into the answer.

**P1.** `monthly` from the bridge: a line of the 33 months (October dropped) with pandas' `.plot()` in one line, then the same with `fig, ax` and the bn formatter. What does the one-liner lack for the deck?

<details><summary>Answer</summary>
Size, the formatter (it shows `1e10`), a left-aligned finding title, and the file. `monthly.set_index("month")["disbursed"].plot()` is for your eyes; the `fig, ax` version is figure 1 without the average. The line starts at 3.87 bn (Jan 2024) and ends at 17.0 bn (Sep 2026); the two Septembers (2025: 14.6 bn) show the +16 % yoy.
</details>

**P2.** Histogram of `principal` (all 7 828 loans) with 30 bins, then with `ax.set_xscale("log")` — or `np.log10` first. Which one shows the two books?

<details><summary>Answer</summary>
Linear: one bar at the left (median 5.79 m) and a long invisible tail to 599 m — useless. Log: two humps, one around 2–6 m (Micro / BNPL / Consumer) and one around 150–450 m (SME / Auto). The 10th percentile is 1.37 m, the 99th 531 m — a 400× range needs a log axis; say so on the axis label (*principal, log scale*).
</details>

**P3.** `sns.boxplot` of `principal` by `product`, products ordered by median. Read SME's box.

<details><summary>Answer</summary>
Medians: SME 314.8 m · Auto 214.8 m · Consumer 27.0 m · BNPL 4.18 m · Micro 2.70 m. SME's box runs 165 m (Q1) to 454 m (Q3), whiskers to the 600 m cap, no outliers — a flat, wide distribution up to the product limit. On one linear axis the three small products are a line at the bottom; use `ax.set_yscale("log")` or one subplot per product (`sharey=False`).
</details>

**P4.** `sns.countplot(x="grade", hue="product")` — then the same information as a heatmap of `pd.crosstab(product, grade)`. Which reads better, and what is the finding?

<details><summary>Answer</summary>
The heatmap (one number per cell; 20 bars in five colours is a legend-reading exercise). Micro: A 655 · B 1 154 · C 777 · D 83; SME: 175 · 350 · 205 · 51. Every product is roughly 23 / 44 / 29 / 4 % — the grade mix does not depend on the product, so a product's FPD difference is not a grade difference (week 2's finding, now a picture).
</details>

**P5.** Scatter of `principal` vs `outstanding` for active loans, `alpha=0.3`, both axes log. What is the correlation and what are the points below the diagonal?

<details><summary>Answer</summary>
Correlation 0.92 (`df[["principal", "outstanding"]].corr()`). Points on the diagonal are young loans (nothing repaid yet); points far below it are old loans nearly repaid. A point *above* should be impossible — and there are **19**, all BNPL loans disbursed in September 2026, above by 100–400 soum: the zero-rate schedule rounds the instalment up to the nearest 100 (`3 380 000 / 12 → 281 700 × 12 = 3 380 400`) and never trims the last one. Invisible on any axis, found by a mask (`(df.outstanding > df.principal).sum()`) — a one-line data-quality note for Jasur, and the reason you check the impossible before you trust the chart. The log–log view is the only one on which the 2 m and 500 m loans are both visible.
</details>

**P6.** Outstanding by region as a sorted barh with bn labels; then the same for Tashkent's product mix. One finding title each.

<details><summary>Answer</summary>
Tashkent 81.7 bn · Fergana 24.8 · Samarkand 24.7 · Andijan 19.8 · Namangan 18.7 · Bukhara 15.1 · Nukus 13.3 · Termez 10.7 — *"Tashkent's three branches hold 39 % of the book; the next two regions 24 %"*. Tashkent's mix: SME 58.6 % · Auto 30.0 · Consumer 10.4 · BNPL 0.5 · Micro 0.5 — *"Tashkent is the whole book in miniature"*. Sorted, from zero, one highlight (Tashkent).
</details>

**P7.** The bridge with parameters: a function `late_loans(con, as_of)` that runs the week-2 DPD CTE with `params=` and returns the bucket counts. Call it for 1 September and 1 October.

<details><summary>Answer</summary>
1 Sep: 128 / 23 / 17 / 217 (385 late, plus 13 with an instalment due that day at DPD 0); 1 Oct: 124 / 25 / 16 / 234 (399 late, plus 14 due that day). `params=(as_of, as_of)` fills two `?` placeholders (the instalment filter *and* the payment filter — week 3's lesson). Never `f"... <= '{as_of}'"`: it works today and breaks on the first value with a quote in it.
</details>

**P8.** `sns.lineplot` of monthly disbursements by product (`hue="product"`) from `monthly_disbursements.csv` — long data, October dropped. Then `pivot` to wide and `df.plot()` — same chart? Which product should be on its own axis and why do you refuse?

<details><summary>Answer</summary>
Same chart: seaborn takes long data with `hue`, pandas' `plot` takes wide data with one column per line. SME (94.8 bn in January–September 2026) and Auto (36.0) are readable; Consumer (25.5) is a low line; Micro (2.8) and BNPL (2.4) are flat at the bottom. The request for a second axis is the week-4 trap (two lines crossing on two scales tell a story that does not exist); give the small products their own small-multiple (`sns.relplot(..., col="product", facet_kws={"sharey": False})`) or a share chart.
</details>

**P9.** A 2 × 2 grid: buckets (bar), outstanding mix (barh), monthly line, roll heatmap — one `fig.suptitle`, one source line, one PNG. Then say why this is *not* what Timur asked for.

<details><summary>Answer</summary>
`fig, axes = plt.subplots(2, 2, figsize=(16, 10))`, each chart on `axes[i, j]`, `fig.suptitle("Nur Finance — loan book, as of 2026-10-01", x=0.01, ha="left")`, `fig.text(0.01, 0.005, "nur.db · 7 828 loans · payments de-duplicated", fontsize=9)`. It is the one-pager for a reader with a printout; the deck wants one chart per slide with one sentence — a 2 × 2 grid on a slide has four titles competing. Both are right for their reader.
</details>

<span class="badge stretch">Stretch</span> **P10.** `to_sql`: write `dpd_per_loan` (HW 5.2) into `nur.db` as a table `loan_dpd_pandas`, then `read_sql` a join of it with `loans` to count mismatches against week 3's bucket logic. Then drop the table (`con.execute("DROP TABLE loan_dpd_pandas")`) — why drop it?

<details><summary>Answer</summary>
`d.to_sql("loan_dpd_pandas", con, if_exists="replace", index=False)`; the join with the week-2 CTE gives **0** mismatches on 7 828 loans. Drop it because `nur.db` is the shared raw source for everyone's weeks 1–3 work — a derived table left inside it is the "clean the only copy" sin from week 1; derived tables belong in your own database file or a `pandas_` schema, documented.
</details>

### Mistakes that cost a point this week

- A title that names the chart instead of the finding; a legend on a single series.
- Bars not from zero, a log axis on bars, a pie of five products, a second y-axis.
- Twelve-digit tick labels (`2e11`) — no formatter.
- The October-2026 one-day point left in a time series.
- `sns.barplot` on raw rows without `estimator=sum` — a mean where a total was meant.
- SQL built with f-strings instead of `params=`.
- A PNG saved before `tight_layout()` — the labels are cut off.
- A hard-coded number in a title that the next month's data contradicts.

---

## 4. Self-check

1. Name three things `pd.read_sql` lets you avoid re-doing in pandas, and one thing you would still do in pandas afterwards. *(→ section 1, "pd.read_sql")*
2. seaborn's `lineplot` wants long data and pandas' `plot` wants wide. Which pandas call converts each way? *(→ section 1, "seaborn", Day 3 "pivot_table")*
3. Why does figure 3 draw four bars and put the fifth number in the axis label? *(→ section 1, "Chart-choice rules")*

---

## 5. Company corner <span class="badge company">The figure pack</span>

Five PNGs, one notebook, no mouse. Each figure: SQL for the heavy lifting through `read_sql`, pandas for the shape, matplotlib/seaborn for the picture, a finding in the title, `savefig` to `figures/`. The full code is in `day4_starter.ipynb` (executed, so the outputs are visible); the design of each:

| # | File | Data | Chart | Title (the finding, as of 2026-10-01) |
|---|---|---|---|---|
| 1 | `01_disbursements_ma3.png` | `GROUP BY month` on `loans` via `read_sql`; `rolling(3).mean()` | line, month in grey + 3-month average in blue; bn formatter; October dropped | *Disbursements climbed from 3.9 bn (Jan 2024) to a 20 bn run-rate — read the average, not the month* |
| 2 | `02_outstanding_mix.png` | instalments due after the as-of, joined to products, in SQL | barh sorted, largest on top, SME highlighted, `bn · %` labels | *SME is 60 % of the 208.7 bn book on 10 % of the loans* |
| 3 | `03_dpd_buckets.png` | `loans_status.csv` → `value_counts` | bar of the four delinquent buckets from zero, 90+ red, counts as labels; the 7 429 current loans (94.9 %) in the axis label | *399 loans are late; 234 of them are already 90+ — the risk is old debt, not a new wave* |
| 4 | `04_vintage_heatmap.png` | the week-3 vintage CTE chain, unchanged, via `read_sql`; `pivot(cohort × mob)` | `sns.heatmap`, Reds, annotated to one decimal, NaN cells blank | *October 2025 is the worst cohort: 6.9 % ever-30+ by month 3, 11.5 % by month 6* |
| 5 | `05_roll_rate.png` | the week-3 roll-rate CTE (two snapshots, `FULL OUTER JOIN`) via `read_sql`; `pivot` to a 5 × 5 matrix | `sns.heatmap` coloured by % of the from-bucket, annotated with counts | *1–30 cures 76 % and rolls 19.5 %; after 60 days nobody comes back* |

The numbers behind the titles, from the notebook's own output: figure 1's average rises from 16.6 bn (Jan 2026) to 20.0 bn (Sep 2026) while single months swing −32 % / +65 %; figure 2's shares 60.3 / 27.6 / 11.0 / 0.5 / 0.5 and total 208 723 504 430; figure 3's 124 / 25 / 16 / 234; figure 4's row 2025-10: 2.76 · 4.15 · **6.91** · 8.76 · 9.68 · **11.52** % against a pooled 2025 curve of 4.35 % at MOB 3 and 7.46 % at MOB 6; figure 5's matrix: from 1–30 → 0: 97, stays 6, → 31–60: 25 (19.5 %); 31–60 → 61–90: 16 of 23 (69.6 %); 61–90 → 90+: 17 of 17; 90+ → 90+: 217, plus 117 new entries into 1–30. Every one of these is a week-2/3 number the board has seen in a table; the pack is the same number in a form they will remember.

The driver that Timur runs — each figure is a function `(con, as_of) → fig`, the pack is a loop:

```python
FIGURES = {"01_disbursements_ma3": fig_disbursements, "02_outstanding_mix": fig_mix, "03_dpd_buckets": fig_buckets,
           "04_vintage_heatmap": fig_vintage, "05_roll_rate": fig_roll}

def figure_pack(con, as_of, out_dir="figures"):
    out = Path(out_dir) / str(as_of.date()); out.mkdir(parents=True, exist_ok=True)     # figures/2026-10-01/
    for name, make in FIGURES.items():
        fig = make(con, as_of)                       # every maker queries with params=(as_of,) and asserts its counts
        fig.savefig(out / f"{name}.png", dpi=150, facecolor="white")
        plt.close(fig)
    return sorted(p.name for p in out.glob("*.png"))

figure_pack(con, pd.Timestamp("2026-10-01"))
# ['01_disbursements_ma3.png', '02_outstanding_mix.png', '03_dpd_buckets.png', '04_vintage_heatmap.png', '05_roll_rate.png']
```

**Reproducibility is the deliverable.** Three habits make the pack Timur's and not a favour: the as-of date is one variable used in every query (`params=(AS_OF,)`); every title that quotes a number computes it (`f"… {b['90+']:,} of them are already 90+ …"`); and an `assert` on each data frame before its chart (`assert b.sum() == 7828`) stops the run when the extract changes shape, instead of saving a wrong PNG. Next month: change `AS_OF`, Kernel → Restart & Run All, five new files in `figures/`.

**If `FULL OUTER JOIN` fails** (SQLite before 3.39): build the two snapshots in pandas with Day 3's `dpd_per_loan(inst, pay, as_of)` for 2026-09-01 and 2026-10-01, `merge(on="loan_id", how="outer").fillna(0)`, `pd.cut` both sides, `pd.crosstab(from, to)` — 526 loans delinquent on either date, the same 5 × 5 matrix.

> Interview version: *"How would you build a monthly chart pack from a database?"* — one notebook; SQL for the aggregation through `read_sql` with the as-of as a parameter; pandas for shaping; a chart type chosen by the question (line for time, barh for rankings, heatmap for matrices); titles that state the finding and compute their own numbers; asserts on counts before each chart; `savefig` to a dated folder; Restart & Run All as the release test.

Tomorrow: the checkpoint — week 3's ten-section EDA report redone in pandas, each number set beside its SQL twin, with a verdict on which tool made which section easier.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w05d4", "pass": 0.8, "questions": [
  {"type": "single", "q": "Why does the figure pack use fig, ax = plt.subplots() instead of plt.plot()?", "options": ["Every title, label and formatter then belongs to a named chart — clear and safe when there are several", "plt.plot cannot draw lines", "Only a fig can be saved to PNG", "subplots draws faster"], "answer": 0, "explain": "plt.plot draws on 'the current axes', which gets confusing with several charts; the object interface makes the chart yours (→ section 1, 'matplotlib')."},
  {"type": "single", "q": "Each bar is meant to be the product's total outstanding. What does it show?", "code": "sns.barplot(data=loans, x=\"outstanding\", y=\"product\")", "options": ["The mean outstanding per loan of each product", "The number of loans", "The total", "The median"], "answer": 0, "explain": "seaborn's barplot aggregates with the mean by default — pass estimator=sum or aggregate first (→ section 1, 'seaborn')."},
  {"type": "single", "q": "sns.heatmap of a vintage matrix (cohort × MOB) needs which shape of data?", "options": ["A Series of percentages", "Wide: a pivot with cohorts as rows and MOB as columns", "Any shape", "Long: one row per cohort × MOB"], "answer": 1, "explain": "hue-based charts want long data (melt); heatmap wants a wide matrix (pivot) — most 'seaborn does not work' moments are the wrong shape (→ section 1, 'seaborn')."},
  {"type": "single", "q": "Both lines return the same count today. Which one belongs in the figure pack?", "code": "as_of = \"2026-10-01\"\nq1 = pd.read_sql(f\"SELECT COUNT(*) AS n FROM payments WHERE paid_at > '{as_of}'\", con)\nq2 = pd.read_sql(\"SELECT COUNT(*) AS n FROM payments WHERE paid_at > ?\", con, params=(as_of,))", "options": ["Neither — read the whole table and filter in pandas", "Either — they are identical", "q1 — easier to read", "q2 — params= passes the value safely; an f-string breaks on a quote and invites injection on a real server"], "answer": 3, "explain": "Values go in params=, never into the SQL text (→ section 1, 'pd.read_sql', P7)."},
  {"type": "number", "q": "On nur.db, what number does this query return?", "code": "pd.read_sql(\"SELECT COUNT(*) AS n FROM payments WHERE paid_at > ?\", con, params=(\"2026-10-01\",))", "answer": 24, "tol": 0, "explain": "24 forward-dated payments (53.4 m) — the rows every payment sum excludes with paid_at <= AS_OF (→ section 1, 'pd.read_sql')."},
  {"type": "multi", "q": "Which of these are chart rules, not matters of taste?", "options": ["No legend for a single series", "A log axis on a bar chart so small values show", "A second y-axis so two lines fit", "Drop the one-day October point from a time series", "Bars start at zero", "The title states the finding"], "answer": [0, 3, 4, 5], "explain": "A log axis breaks 'bars from zero', and two y-axes invent crossings; the October point (one day) reads as a crash (→ section 1, 'Chart-choice rules')."},
  {"type": "single", "q": "Figure 2's title says \"208.7 bn\". Next month the total changes. What is the lasting fix?", "options": ["Add a footnote with the date", "Build the title from the data with an f-string", "Edit the title by hand each month", "Remove all numbers from titles"], "answer": 1, "explain": "A title computed from the data cannot go stale; an assert above the chart catches a changed extract (→ section 2)."},
  {"type": "single", "q": "Company corner: what makes the figure pack Timur's and not a favour?", "options": ["One AS_OF used in every query, titles computed from the data, an assert before each chart — then Restart & Run All", "Five charts on one 2 × 2 grid", "Hand-picked colours each month", "Saving every chart as SVG"], "answer": 0, "explain": "Reproducibility is the deliverable: change AS_OF, run all, five new files (→ Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w05d4", "q": "Timur wants figure 1 to carry a year-ago comparison in its title. Read the monthly disbursed amount (SUM(principal) by month, disbursed before 2026-10-01) from nur.db with pd.read_sql, take the 3-month rolling average, and compare September 2026's average (Jul–Sep 2026) with September 2025's (Jul–Sep 2025). By how many percent is it higher? Give a percentage to 1 decimal.", "type": "number", "dp": 1, "h": ["76d786089690eeaf0c7f6726"], "hint": "Once the months are one row each in order, the year-ago value of any column is twelve rows up.", "sol": "Y29uID0gc3FsaXRlMy5jb25uZWN0KCIuLi9yYXcvbnVyLmRiIikKbSA9IHBkLnJlYWRfc3FsKCIiIlNFTEVDVCBzdHJmdGltZSgnJVktJW0nLCBkaXNidXJzZWRfYXQpIEFTIG1vbnRoLCBTVU0ocHJpbmNpcGFsKSBBUyBkaXNidXJzZWQKICAgICAgICAgICAgICAgICAgIEZST00gbG9hbnMgV0hFUkUgZGlzYnVyc2VkX2F0IDwgPyBHUk9VUCBCWSAxIE9SREVSIEJZIDEiIiIsIGNvbiwgcGFyYW1zPSgiMjAyNi0xMC0wMSIsKSkKbVsibWEzIl0gPSBtWyJkaXNidXJzZWQiXS5yb2xsaW5nKDMpLm1lYW4oKQptWyJtYTNfeW95Il0gPSAxMDAgKiAobVsibWEzIl0gLyBtWyJtYTMiXS5zaGlmdCgxMikgLSAxKQptLnRhaWwoMSkgICAgIyAyMDI2LTA5ICBtYTMgMTkgOTk5IDg1NiA2NjcgwrcgYSB5ZWFyIGVhcmxpZXIgMTUgNjM0IDIwNiA2NjcgwrcgKzI3LjkgJQoKKzI3LjkgJTogdGhlIDMtbW9udGggYXZlcmFnZSByZWFjaGVkIDIwLjAgYm4gaW4gU2VwdGVtYmVyIDIwMjYgYWdhaW5zdCAxNS42IGJuIGEgeWVhciBlYXJsaWVyIOKAlCBncm93dGgsIGJ1dCBtdWNoIHNsb3dlciB0aGFuIHRoZSArNDDigJM3MCAlIG9mIHRoZSBmaXJzdCBoYWxmIG9mIDIwMjYuClRoZSBzaW5nbGUgbW9udGggc2F5cyArMTYgJSAoMTcuMCB2cyAxNC42IGJuKSwgd2hpY2ggaXMgd2h5IHRoZSB0aXRsZSBzaG91bGQgcXVvdGUgdGhlIGF2ZXJhZ2U6IG9uZSB3ZWFrIFNlcHRlbWJlciBtb250aCB3b3VsZCBvdGhlcndpc2Ugc2V0IHRoZSBzdG9yeS4KRHJvcHBpbmcgT2N0b2JlciAyMDI2IG1hdHRlcnMgaGVyZSB0b286IHdpdGggdGhlIG9uZS1kYXkgbW9udGggbGVmdCBpbiwgdGhlIGxhc3Qgcm93IGlzIGEgY3Jhc2gsIG5vdCBTZXB0ZW1iZXIu"}
```

<!-- challenge:end -->
