# Week 5 · Day 4 — Charts and the SQL bridge: matplotlib, seaborn, read_sql

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge company">Company corner</span>

> STORY **Thursday, 9:00.** Timur, BI (*BI-специалист*), with the board deck template. *"Madina's Excel page was right and nobody could update it. Power BI is right and the board will not open it. What the board opens is the deck. I want **a monthly figure pack as PNGs** — five charts, same size, same colours, a sentence on each — that I drop into slot four every month without touching a mouse. If your notebook makes them, I will run it. If it needs you, it is not a figure pack, it is a favour."* Jasur, from his desk: *"And read the SQL straight into pandas. Do not re-type a CTE you already have."*

## Today in 3 lines

- **The bridge:** `sqlite3.connect` + `pd.read_sql(query, con)` runs any week-3 SQL — the vintage CTE chain, the roll-rate `FULL OUTER JOIN` — and returns a DataFrame; the two worlds are one notebook.
- **matplotlib** (*библиотека matplotlib*) draws anything from a figure and an axes: `plot` (line), `bar` / `barh`, `hist`, `boxplot`, `scatter`; labels, a title that states the finding, a legend only when there is more than one series, big numbers formatted in bn; **seaborn** adds statistical charts on long-format data in one call (`barplot`, `lineplot`, `heatmap`, `boxplot`, `countplot`); `subplots` for a grid; `savefig` for the deck.
- The chart-choice rules are week 4's, unchanged; by evening Timur has `figures/01…05.png` and the code that makes them again next month.

---

## 1. Learn — the figure, the axes, and what goes on them

Every concept below has the same five parts: what it is, how to write it (a box you can run — the chart appears under it), when you use it, the trap, and a small task. Run the boxes from top to bottom: the first box reads the data every later chart draws from.

### Figure and axes — the page and the chart on it

**What it is.** **matplotlib** (*библиотека matplotlib*) draws charts in two layers. The **figure** (*фигура*) is the page — its size, the file you save. The **axes** (*оси, область графика*) is one chart on that page — the lines, the bars, the title, the two axis scales. `fig, ax = plt.subplots()` makes one of each; everything you draw is a method of `ax`.

**How to write it.** The first box reads the two files of the day, then draws the simplest possible chart:

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path
# the folder the PNGs go to
Path("figures").mkdir(exist_ok=True)
# one grey for the data, one colour for the highlight
GREY, BLUE, RED = "#9ca3af", "#1d4ed8", "#dc2626"
# one row per loan: dpd, bucket, outstanding
status = pd.read_csv("../excel/loans_status.csv", parse_dates=["disbursed_at"])
# one row per month × product
md = pd.read_csv("../excel/monthly_disbursements.csv", parse_dates=["month"])
# drop October 2026: one day is not a month
md = md[md["month"] < "2026-10-01"]
# one row per month
monthly = md.groupby("month", as_index=False)[["loans", "amount"]].sum()

# a figure (the page) holding one axes (the chart area), 8 × 4 inches
fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(monthly["month"], monthly["amount"])  # draw on the axes: x, then y
ax.set_title("Disbursed per month")
```

The last three rows of `monthly`, the frame the chart draws:

| month | loans | amount |
|---|---|---|
| 2026-07-01 | 367 | 20 693 870 000 |
| 2026-08-01 | 358 | 22 290 210 000 |
| 2026-09-01 | 361 | 17 015 490 000 |

`monthly` has 33 rows, January 2024 to September 2026; the chart is one line through them, ending at 17.0 bn in September.

| | the figure `fig` | the axes `ax` |
|---|---|---|
| is | the page | one chart on the page |
| you set | the size (`figsize=`), a title over everything (`fig.suptitle`), a source line (`fig.text`) | the data (`ax.plot`, `ax.bar` …), `ax.set_title`, `ax.set_xlabel`, `ax.set_ylim` |
| you save | `fig.savefig("figures/01.png")` | — |

`plt.plot(...)` without `fig, ax` also draws — on "the current axes". That is fine for a quick look and confusing as soon as there are two charts. Write `fig, ax = plt.subplots()` every time.

**When you use it.**
- At the start of every chart: one `fig, ax`, then methods on `ax`.
- Whenever the chart is going into a file or a deck — the figure is what you save.

> ⚠️ **Watch out.** `ax.title("…")` raises `TypeError: 'Text' object is not callable`. On an axes the setters start with `set_`: `ax.set_title`, `ax.set_xlabel`, `ax.set_ylim`.

**Your turn.** Fill the three gaps of the smallest chart.

```game
{"type": "cloze", "id": "w05d4-g5", "title": "The smallest chart", "text": "fig, ax = plt.{{0}}(figsize=(8, 4))\nax.{{1}}(monthly[\"month\"], monthly[\"amount\"])\nax.{{2}}(\"Disbursed per month\")", "blanks": [["subplots"], ["plot"], ["set_title"]], "distractors": ["figure", "title", "line"]}
```

### Line chart — how a number moves over time

**What it is.** A **line chart** (*линейный график*) joins one point per period. Time runs left to right, so the eye reads the trend. A **rolling average** (*скользящее среднее*) — `rolling(3).mean()`, the average of this month and the two before — smooths the swings so the trend shows.

```pic
{"id": "w05d4-pic1", "title": "A one-day month looks like a crash", "caption": "Disbursements per month in 2026, from `monthly_disbursements.csv` (bars here, one per month). October holds one day, 2026-10-01, so its bar is 0.85 bn: drop it, or label it \"month to date\".", "chart": {"type": "bars", "labels": ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct 1"], "values": [19.66, 17.89, 18.53, 16.05, 20.69, 22.29, 17.02, 0.85], "hl": [7], "show": true, "note": "disbursed per month, bn UZS"}}
```

**How to write it.**

```python
# the 3-month average; the first two months have none (NaN)
monthly["ma3"] = monthly["amount"].rolling(3).mean()
fig, ax = plt.subplots(figsize=(10, 4))
# the raw months, thin and grey
ax.plot(monthly["month"], monthly["amount"], color=GREY, lw=1, label="month")
# the trend, thick and blue
ax.plot(monthly["month"], monthly["ma3"], color=BLUE, lw=2, label="3-month average")
# two lines → a legend says which is which
ax.legend(frameon=False)
monthly.tail(3)
```

| month | amount | ma3 |
|---|---|---|
| 2026-07-01 | 20 693 870 000 | 18 425 333 333 |
| 2026-08-01 | 22 290 210 000 | 19 678 126 667 |
| 2026-09-01 | 17 015 490 000 | 19 999 856 667 |

September alone fell to 17.0 bn, but the 3-month average still rose, to 20.0 bn: one weak month, not a turn in the trend.

`x` must be real dates (`datetime64` — `parse_dates=` did it here) so the months are spaced by time. `lw=` is the line width; `label=` is the text the legend shows.

**When you use it.**
- Any number per day, week or month: disbursements, collection rate per due month, PAR30 per month-end.
- Several series over the same time: one line each, at most four or five.

> ⚠️ **Watch out.** Leave the one-day October 2026 in and the last point is 0.85 bn — the line plunges, and the board reads a crash. A period that is not finished is dropped from a time series, or labelled "month to date".

**Your turn.** The 3-month average of September 2026, in bn.

```task
{"id": "w05d4-l1", "kind": "python", "starter": "d = pd.read_csv(\"../excel/monthly_disbursements.csv\", parse_dates=[\"month\"])\nd = d[d[\"month\"] < \"2026-10-01\"]\nm = d.groupby(\"month\")[\"amount\"].sum()          # one value per month\n\n# your code: the 3-month rolling average; print its last value in bn, one decimal\n", "answer": 20.0, "dp": 1, "hint": "m.rolling(3).mean() gives the average; .iloc[-1] is the last month; divide by 1e9.", "model": "ma3 = m.rolling(3).mean()\nprint(round(ma3.iloc[-1] / 1e9, 1))     # 20.0\n\n(20 693 870 000 + 22 290 210 000 + 17 015 490 000) / 3 = 19 999 856 667 — July, August and September together."}
```

### Bar and barh — how categories compare

**What it is.** A **bar chart** (*столбчатая диаграмма*) draws one bar per category; the bar's length is the number. `ax.bar` draws upright bars, `ax.barh` horizontal ones (*линейчатая диаграмма*) — better for rankings and long labels. A bar is read by its length, so **bars start at zero**.

```pic
{"id": "w05d4-pic2", "title": "234 of the 399 late loans are already 90+", "caption": "The four late buckets in their natural order, from zero, with one highlight. The 7 429 current loans are left out (and the note says so), so the late buckets stay readable.", "chart": {"type": "bars", "labels": ["1-30", "31-60", "61-90", "90+"], "values": [124, 25, 16, 234], "hl": [3], "show": true, "note": "late loans per bucket (current loans not shown)"}}
```

**How to write it.**

```python
# the four late buckets, in their natural order
late = status["bucket"].value_counts().reindex(["1-30", "31-60", "61-90", "90+"])
fig, ax = plt.subplots(figsize=(8, 4))
# one highlight: 90+ in red
ax.bar(late.index, late.values, color=[RED if k == "90+" else GREY for k in late.index])
# from zero, with room above the tallest bar
ax.set_ylim(0, late.max() * 1.15)

# ascending: barh draws the last row on top
prod = status.groupby("product")["outstanding"].sum().sort_values()
fig, ax = plt.subplots(figsize=(8, 4))
ax.barh(prod.index, prod.values / 1e9, color=GREY)
ax.set_xlabel("outstanding, bn UZS")
late
```

| bucket | loans |
|---|---|
| 1-30 | 124 |
| 31-60 | 25 |
| 61-90 | 16 |
| 90+ | 234 |

The 90+ bar is the tallest: 234 of the 399 late loans are already more than 90 days late. In the second chart SME's bar is the longest, 125.9 bn of outstanding, and Micro's the shortest, 1.0 bn.

| | `ax.bar` | `ax.barh` |
|---|---|---|
| bars | upright | lying down |
| best for | few categories with a natural order: buckets, grades | rankings, long labels: products, branches, regions |
| order | the natural order (`reindex`) | sorted by value, largest on top (`sort_values()` ascending) |

**When you use it.**
- "How do these groups compare?" — loans per bucket, outstanding per product, loans per branch.
- A ranking: sort the bars by value, unless the categories have their own order (buckets, months).

> ⚠️ **Watch out.** A log scale or a y-axis that starts above zero makes bar lengths lie: a bar twice as long no longer means twice as much. When one bar dwarfs the rest (the 7 429 current loans), leave it out and say so in the axis label — do not squash the axis.

**Your turn.** One line on this chart breaks a rule that is not a matter of taste.

```game
{"type": "bug", "id": "w05d4-g2", "title": "Which line breaks a rule?", "q": "This bar chart of the late buckets runs without an error. One line breaks a chart rule that is not a matter of taste.", "code": "fig, ax = plt.subplots(figsize=(10, 5))\nax.bar(late.index, late.values, color=GREY)\nax.set_yscale(\"log\")\nax.set_title(\"399 loans are late; 234 are already 90+\", loc=\"left\")\nfig.tight_layout()", "answer": [2], "why": "A log axis on bars breaks 'bars start at zero': the bar lengths stop being proportional to the counts. Put big gaps in a label or a second chart, not on a log scale."}
```

### Histogram and box plot — how one number is spread

**What it is.** A **histogram** (*гистограмма*) cuts a number's range into **bins** and draws one bar per bin: how many loans have a principal between 1 m and 1.3 m, between 1.3 m and 1.6 m, and so on. A **box plot** (*ящик с усами*) draws the same spread as five numbers per group: the median, the middle half (the box, from the 25th to the 75th percentile), the whiskers and the outliers.

```pic
{"id": "w05d4-pic3", "title": "Most loans are small; the mean sits far right of the median", "caption": "Each bar counts the loans from its edge up to ten times it (0.1–1 m, 1–10 m, …), so the bins are equal on a log scale. The median, 5.79 m, is in the tallest bar; the mean, 51.7 m, is pulled into the next one by 996 loans of 100 m and more.", "chart": {"type": "bars", "labels": ["0.1", "1", "10", "100"], "values": [472, 4134, 2226, 996], "hl": [1], "show": true, "marks": [{"at": 1.263, "label": "median"}, {"at": 2.214, "label": "mean"}], "note": "loans by principal, from m UZS (log bins)"}}
```

**How to write it.**

```python
fig, ax = plt.subplots(figsize=(8, 4))
# 40 bins of equal width on a log scale, 100 000 to 1 000 000 000
ax.hist(status["principal"], bins=np.logspace(5, 9, 41), color=GREY)
ax.set_xscale("log")
ax.set_xlabel("principal, UZS (log scale)")

# products from the smallest median up
order = status.groupby("product")["principal"].median().sort_values().index
fig, ax = plt.subplots(figsize=(8, 4))
ax.boxplot([status.loc[status["product"] == p, "principal"] for p in order], labels=order)
ax.set_yscale("log")
status["principal"].describe()[["count", "mean", "50%", "max"]]
```

| principal | loans |
|---|---|
| 0.1 m – 1 m | 472 |
| 1 m – 10 m | 4 134 |
| 10 m – 100 m | 2 226 |
| 100 m – 1 bn | 996 |

Most of the 7 828 loans sit between 1 m and 10 m — the median is 5.79 m — while the mean is 51.7 m, pulled up by 996 loans of 100 m and more. On the log axis the histogram shows two humps: the small books (Micro, BNPL, Consumer) and the big ones (SME, Auto). The box plot puts SME's median at 314.8 m and Micro's at 2.7 m.

| | histogram | box plot |
|---|---|---|
| shows | the whole shape of one number | five numbers per group, side by side |
| best for | one group: "how is the principal spread?" | comparing groups: "principal per product" |
| you choose | the bins | nothing — the quartiles are fixed |

**When you use it.**
- Before you report a mean: is the number symmetric, skewed, or two groups mixed?
- DPD of the late loans, principal per product, ticket size per channel.

> ⚠️ **Watch out.** Money spans 300 000 to 599 060 000 — a 2 000× range. On a linear axis the histogram is one tall bar at the left and an invisible tail. Use a log axis (or `np.log10` first) and say "log scale" in the axis label.

**Your turn.** How many of the late loans are more than a year late? Draw their DPD as a histogram first.

```task
{"id": "w05d4-l2", "kind": "python", "starter": "s = pd.read_csv(\"../excel/loans_status.csv\")\nlate_dpd = s.loc[s[\"dpd\"] > 0, \"dpd\"]          # the 399 late loans\n\n# your code: a histogram of late_dpd (30 bins), then print how many are above 365\n", "answer": 120, "dp": 0, "hint": "fig, ax = plt.subplots(); ax.hist(late_dpd, bins=30); then (late_dpd > 365).sum().", "model": "fig, ax = plt.subplots(figsize=(8, 4))\nax.hist(late_dpd, bins=30, color=\"#9ca3af\")\nax.set_xlabel(\"days past due\")\nprint((late_dpd > 365).sum())     # 120\n\n120 of the 399 late loans are more than a year late; the median late loan is 159 days late and the oldest 919. The histogram has a heap at 1–30 days and a long flat tail of old debt."}
```

### Scatter — two numbers per row

**What it is.** A **scatter plot** (*диаграмма рассеяния*) draws one dot per row, with one number on x and another on y. It shows whether the two move together, and which rows break the pattern.

**How to write it.**

```python
# 3 352 active loans
act = status[status["status"] == "active"]
fig, ax = plt.subplots(figsize=(6, 6))
# small, see-through dots
ax.scatter(act["principal"], act["outstanding"], s=8, alpha=0.3, color=BLUE)
# money on both axes → log
ax.set_xscale("log"); ax.set_yscale("log")
ax.set_xlabel("principal (log)"); ax.set_ylabel("outstanding (log)")
act[["principal", "outstanding"]].corr()
```

| | principal | outstanding |
|---|---|---|
| principal | 1.00 | 0.92 |
| outstanding | 0.92 | 1.00 |

3 352 dots; the correlation is 0.92 — a loan's outstanding follows its principal closely. Dots on the diagonal are young loans with nothing repaid; dots far below it are old loans almost paid off.

`s=` is the dot size, `alpha=` the opacity (0.3 = 30 %), so that thousands of dots on top of each other show as a darker cloud instead of one blob.

**When you use it.**
- "Do these two numbers move together?" — principal vs outstanding, income vs requested amount.
- Finding the rows that should not exist: a dot above the diagonal is a loan that owes more than it borrowed.

> ⚠️ **Watch out.** A correlation is one number for the whole cloud. It says nothing about the few dots that break the pattern — check those with a mask, not with your eyes.

**Your turn.** 3 352 dots at full size and full colour merge into one dark blob. Which change helps most?

```task
{"id": "w05d4-l3", "kind": "choice", "options": ["A bigger figure, figsize=(20, 20)", "Smaller, see-through dots: s=8, alpha=0.3 — and log axes for money", "A legend", "Sorting the rows before plotting"], "answer": 1, "explain": "Overplotting is fixed by making each dot small and transparent, so density shows as darkness; log axes spread money values that span 300 000 to 600 m."}
```

### Labels, titles and number formats — a chart people can quote

**What it is.** The chart is finished when a reader can quote it without asking you. That takes a **title that states the finding** (*заголовок-вывод*), axis labels with the unit, numbers in a readable format (bn, not `2e10`), and a file saved at a fixed size. A **formatter** (`FuncFormatter`) rewrites every tick label of an axis; `fig.savefig` writes the PNG.

**How to write it.**

```python
from matplotlib.ticker import FuncFormatter
# every tick: 20000000000 → "20 bn"
bn = FuncFormatter(lambda x, _: f"{x / 1e9:,.0f} bn")
fig, ax = plt.subplots(figsize=(10, 4))
ax.plot(monthly["month"], monthly["ma3"], color=BLUE, lw=2)
ax.yaxis.set_major_formatter(bn)
# from zero; the top is automatic
ax.set_ylim(0, None)
last = monthly["ma3"].iloc[-1]
# the finding, computed from the data
ax.set_title(f"The 3-month average reached {last / 1e9:.1f} bn a month", loc="left")
ax.set_ylabel("disbursed per month, 3-month average")
# less ink: no frame on two sides
ax.spines[["top", "right"]].set_visible(False)
# the source line
fig.text(0.01, 0.01, "monthly_disbursements.csv · Jan 2024 – Sep 2026", fontsize=9, color="#6b7280")
# make room for every label
fig.tight_layout()
fig.savefig("figures/01_disbursements_ma3.png", dpi=150, facecolor="white")
```

The title reads "The 3-month average reached 20.0 bn a month", the y-axis runs from 0 bn to 20 bn, and the chart is saved as a 1 500 × 600 pixel PNG in `figures/`.

The twelve rules of week 4 Day 4, each as the line that implements it:

```python
# the four delinquent buckets, in order
late = status["bucket"].value_counts().reindex(["1-30", "31-60", "61-90", "90+"])
# 1  one chart, one message, a size that fits a slide
fig, ax = plt.subplots(figsize=(10, 5))
# 2  one colour + one highlight
ax.bar(late.index, late.values, color=[RED if k == "90+" else GREY for k in late.index])
# 3  bars from zero; headroom for labels
ax.set_ylim(0, late.max() * 1.15)
for i, v in enumerate(late.values):
    # 4  the number the reader will quote, formatted
    ax.text(i, v, f"{v:,}", ha="center", va="bottom")
# 5  the finding, left-aligned, not the chart's name
ax.set_title("399 loans are late; 234 are already 90+", loc="left")
# 6  the unit and the as-of
ax.set_ylabel("loans"); ax.set_xlabel("DPD bucket as of 2026-10-01")
# no ax.legend() call                                                      # 7 
# no legend for one series
# 8  less ink: no frame on two sides
ax.spines[["top", "right"]].set_visible(False)
ax.annotate("17 loans arrived from 61-90 this month", xy=(3, 234), xytext=(1.6, 200),
            # 9  one annotation for the point you talk about
            arrowprops=dict(arrowstyle="->", color=RED))
# 10 source line
fig.text(0.01, 0.01, "loans_status.csv · 7 828 loans · payments de-duplicated", fontsize=9, color="#6b7280")
# 11 nothing cut off
fig.tight_layout()
# 12 a file, not a screenshot
fig.savefig("figures/03_dpd_buckets.png", dpi=150, facecolor="white")
```

| `savefig` argument | does |
|---|---|
| `dpi=150` | pixels per inch: `figsize=(12, 5.4)` × 150 = 1 800 × 810 px, a 16:9 slide without rescaling |
| `facecolor="white"` | a white background — a transparent one turns black in some viewers |
| `bbox_inches="tight"` | trims the empty margin |
| `.svg` instead of `.png` | a vector file for a designer |
| `plt.close(fig)` after saving | frees the memory — needed when a loop saves dozens |

**When you use it.**
- Every chart that leaves your notebook: finding title, units, formatted numbers, source, saved file.
- Money axes: the `bn` formatter, or divide once in the data (`df["bn"] = df["outstanding"] / 1e9`) — never both.

> ⚠️ **Watch out.** `savefig` before `fig.tight_layout()` cuts long labels off the edge of the PNG. Call `tight_layout()` (or pass `bbox_inches="tight"`) last, just before saving.

**Your turn.** Fill the gaps of the bn formatter.

```game
{"type": "cloze", "id": "w05d4-g6", "title": "Twelve digits → bn", "text": "bn = FuncFormatter(lambda x, _: f\"{x / 1e9:{{0}}} bn\")\nax.yaxis.{{1}}(bn)\nfig.{{2}}()\nfig.savefig(\"figures/01.png\", dpi=150)", "blanks": [[",.0f"], ["set_major_formatter"], ["tight_layout"]], "distractors": [".2%", "set_ylabel", "close"]}
```

### Small multiples — one panel per group

**What it is.** **Small multiples** (*малые множественные графики*) are a grid of small charts of the same kind, one per group. `plt.subplots(rows, cols)` returns one figure and an array of axes; you draw one group on each. `sharey=True` gives every panel the same y-scale; `sharey=False` lets each panel use its own.

**How to write it.**

```python
# biggest product first
products = md.groupby("product")["amount"].sum().sort_values(ascending=False).index
# one row of five axes
fig, axes = plt.subplots(1, 5, figsize=(16, 3), sharey=False)
for ax, p in zip(axes, products):
    one = md[md["product"] == p]
    ax.plot(one["month"], one["amount"] / 1e9, color=BLUE)
    ax.set_title(p, loc="left", fontsize=10)
    ax.tick_params(axis="x", rotation=45)
fig.suptitle("Monthly disbursements by product, bn UZS — each panel on its own scale", x=0.01, ha="left")
fig.tight_layout()
md.groupby("product")["amount"].sum().div(1e9).round(1).sort_values(ascending=False)
```

| product | disbursed, Jan 2024 – Sep 2026, bn |
|---|---|
| Small business loan | 240.7 |
| Auto loan | 84.6 |
| Consumer loan | 65.0 |
| Micro loan | 7.2 |
| Buy now pay later | 6.5 |

SME lent 240.7 bn, BNPL 6.5 bn — 37 times less. On one shared axis BNPL would be a flat line at the bottom; in its own panel its shape — the months it grew — becomes visible.

| | `sharey=True` | `sharey=False` |
|---|---|---|
| the panels compare | levels: which group is bigger | shapes: how each group moves |
| small groups | flat lines | readable |
| say in the title | — | "each panel on its own scale" |

`axes` is an array: `axes[0]` for one row, `axes[0, 1]` for a 2-row grid, `for ax in axes.flat:` to loop over all of them.

**When you use it.**
- One series per group with very different sizes: products, regions, channels.
- Instead of five lines on one chart that cross and tangle.

> ⚠️ **Watch out.** With `sharey=False` two panels of the same height can differ by a factor of 37. Readers compare heights by habit — say "own scale" in the title, or use `sharey=True` when levels are the point.

**Your turn.** Bekzod asks: "which product grew fastest in 2026?" — not which is biggest. Which grid?

```task
{"id": "w05d4-l4", "kind": "choice", "options": ["One axes with five lines on the same scale", "Small multiples with sharey=True — the levels are what matters", "Small multiples with sharey=False and 'each panel on its own scale' in the title — the shape of each line is what matters", "A pie of 2026 totals"], "answer": 2, "explain": "Growth is a shape question. On one shared scale SME (94.8 bn in 2026) flattens BNPL (2.4 bn); own scales show each product's movement, and the title warns the reader not to compare heights."}
```

### What chart for what question

**What it is.** The chart type follows the **question**, not the data. Week 4's table and rules, unchanged — each row a matplotlib method you have now used.

**How to write it.**

| Question | chart | `ax.` method | Notes |
|---|---|---|---|
| How does it move over time? | line | `plot(x, y)` | x as real dates; one line per series |
| How do categories compare? | bar / barh | `bar` / `barh` | **from zero**; sorted by value unless the order is natural |
| How is one number spread? | histogram | `hist(values, bins=…)` | bins by hand; log axis for money |
| Spread per group | box plot | `boxplot([g1, g2, …])` | median, quartiles, whiskers |
| Two numbers per row | scatter | `scatter(x, y, s=8, alpha=0.3)` | log axes for money |
| A matrix: group × group | heatmap | `sns.heatmap(wide)` | vintage cohort × MOB, roll matrix |
| One series per group | small multiples | `plt.subplots(1, n)` | `sharey` decides what is compared |

The rules that are not a matter of taste: **no pie** beyond three slices, **no 3D**, **bars start at zero**, **sort by value** unless the order is natural, **one colour + one highlight**, **the title states the finding** (*"SME is 60 % of the book"*, not *"Outstanding by product"*), **no legend for one series**, **the unit on the axis or in the title**, a **source line**, **no second y-axis** (two lines on two scales cross wherever you like). An unfinished period — the one-day October 2026, 0.85 bn — is dropped from every time series. When one bar dwarfs the rest, as the 7 429 current loans do, it goes into the axis label, not onto a log scale.

**When you use it.**
- Before you write the first line of chart code: name the question, then pick the row.
- When a chart "looks wrong": usually it answers a different question than the one asked.

> 💡 **Key idea.** The chart is chosen by the **question**, and the title answers it. If you cannot write the finding as the title, you do not know yet what the chart is for.

**Your turn.** Put each question under the chart that answers it.

```game
{"type": "sort", "id": "w05d4-g3", "title": "Pick the chart", "q": "Put each question under the chart that answers it.", "groups": {"line": ["Monthly disbursements, 33 months", "Collection rate per due month"], "barh, sorted": ["Outstanding by region, ranked", "Top 10 branches by money disbursed"], "heatmap": ["Vintage: cohort × months on book", "Roll matrix: from-bucket × to-bucket"], "hist / box": ["DPD of the late loans", "Principal per product (spread)"]}}
```

### pandas .plot — the five-second chart

**What it is.** Every DataFrame and Series has a **`.plot`** method: matplotlib underneath, with the **index on x** and one line per column. `.plot()` draws a line; `.plot.bar()`, `.plot.barh()`, `.plot.hist()`, `.plot.box()`, `.plot.scatter(x=, y=)` draw the rest. It returns the axes, so the decorations above still work.

**How to write it.**

```python
# WIDE: the month as index, one column per product
wide = md.pivot(index="month", columns="product", values="amount")
# one call: one line per column, the index on x
ax = wide.plot(figsize=(10, 4), title="Disbursed per month, by product")
# .plot returns the axes — decorate it as usual
ax.set_xlabel("")
wide.tail(3)
```

| month | Auto loan | Buy now pay later | Consumer loan | Micro loan | Small business loan |
|---|---|---|---|---|---|
| 2026-07-01 | 1 835 510 000 | 329 320 000 | 2 751 920 000 | 354 290 000 | 15 422 830 000 |
| 2026-08-01 | 5 377 060 000 | 315 360 000 | 2 607 640 000 | 336 950 000 | 13 653 200 000 |
| 2026-09-01 | 4 398 600 000 | 276 590 000 | 3 409 790 000 | 328 630 000 | 8 601 880 000 |

Five lines from one call, one per column. SME dominates every month — 8.6 bn of September's 17.0 bn — and the two smallest products sit near zero.

| you write | you get |
|---|---|
| `s.plot()` / `df.plot()` | line(s), index on x |
| `s.plot.barh()` | horizontal bars, one per index value |
| `s.plot.hist(bins=30)` | a histogram |
| `df.plot.scatter(x="principal", y="outstanding")` | a scatter |
| `df.plot(ax=ax)` | draws into an axes you made with `plt.subplots` |

**When you use it.**
- Exploring: a five-second look at a column or a pivot.
- Not for the deck: the formatter, the finding title and the size are easier through `fig, ax`.

> ⚠️ **Watch out.** `.plot()` puts the **index** on x and draws **every numeric column**. On a frame with a 0…n index and a `loan_id` column you get a line of loan ids. `set_index("month")` and pick the column first: `df.set_index("month")["amount"].plot()`.

**Your turn.** From `wide`, the SME total over the 33 months, in bn.

```task
{"id": "w05d4-l5", "kind": "python", "starter": "d = pd.read_csv(\"../excel/monthly_disbursements.csv\", parse_dates=[\"month\"])\nd = d[d[\"month\"] < \"2026-10-01\"]\nw = d.pivot(index=\"month\", columns=\"product\", values=\"amount\")\n\n# your code: w.plot() for a look, then print SME's total in bn, one decimal\n", "answer": 240.7, "dp": 1, "hint": "w[\"Small business loan\"].sum() / 1e9.", "model": "w.plot(figsize=(10, 4))\nprint(round(w[\"Small business loan\"].sum() / 1e9, 1))     # 240.7\n\n240.7 bn of the 403.9 bn lent from January 2024 to September 2026 — 59.6 %."}
```

### seaborn — statistical charts from long data

**What it is.** **seaborn** (*библиотека seaborn*) sits on matplotlib and draws a whole statistical chart in one call from a DataFrame. Its gift is **`hue`**: a third column that becomes colour — one line or bar per value. `hue` wants **long** data (*длинный формат*: one row per month × product); `heatmap` wants **wide** data (*широкий формат*: a matrix, like `pivot` or `crosstab`).

**How to write it.**

```python
import seaborn as sns
# one look for every chart after this line
sns.set_theme(style="whitegrid")
fig, ax = plt.subplots(figsize=(10, 4))
# LONG data: hue = one line per product
sns.lineplot(data=md, x="month", y="amount", hue="product", ax=ax)
fig, ax = plt.subplots(figsize=(6, 3))
# a TOTAL per product
sns.barplot(data=status, x="outstanding", y="product", estimator=sum, errorbar=None, color=GREY, ax=ax)
# WIDE: products × grades
ct = pd.crosstab(status["product"], status["grade"])
fig, ax = plt.subplots(figsize=(6, 3))
# one coloured, numbered cell per pair
sns.heatmap(ct, annot=True, fmt="d", cmap="Reds", ax=ax)
ct
```

| product | A | B | C | D |
|---|---|---|---|---|
| Auto loan | 83 | 181 | 111 | 16 |
| Buy now pay later | 360 | 676 | 453 | 80 |
| Consumer loan | 548 | 1 043 | 718 | 109 |
| Micro loan | 655 | 1 154 | 777 | 83 |
| Small business loan | 175 | 350 | 205 | 51 |

The heatmap's darkest cell is Micro × B, 1 154 loans. Every product has roughly the same grade mix — about 23 / 44 / 29 / 4 % — so a product difference in risk is not a grade difference.

| seaborn call | data shape it wants | what it does | Nur Finance use |
|---|---|---|---|
| `lineplot(x, y, hue)` | long, one row per period × series | one line per `hue` value | monthly disbursement by product |
| `barplot(x, y, hue)` | long rows *or* pre-aggregated | **the mean** per category by default — pass `estimator=sum` | outstanding by product |
| `countplot(x, hue)` | raw rows | counts rows per category | loans per grade per product |
| `heatmap(matrix)` | **wide**: a `pivot` / `crosstab` | colours each cell, `annot=True` prints it | vintage cohort × MOB, roll matrix |
| `boxplot(x, y)` / `histplot(x, hue)` | raw rows | the spread, per group | principal by product |
| `relplot(…, col=)` | long | **small multiples**, one panel per `col` value | one panel per product |

Every call takes `ax=` and returns the axes, so titles and formatters work as before. `melt` turns wide into long, `pivot` long into wide (Day 3).

**When you use it.**
- A chart with `hue` (several groups in colour) or a heatmap — one call instead of a loop.
- `sns.set_theme()` once at the top gives a whole figure pack the same look.

> ⚠️ **Watch out.** `sns.barplot` on raw rows draws the **mean** per category, not the total. "Outstanding by product" without `estimator=sum` is quietly "average outstanding per loan" — SME's bar becomes 161 m instead of 125.9 bn.

**Your turn.** What would the default `barplot` draw for SME? Print SME's mean outstanding per loan, in m.

```task
{"id": "w05d4-l6", "kind": "python", "starter": "s = pd.read_csv(\"../excel/loans_status.csv\")\n\n# your code: mean outstanding per loan for each product; print SME's in m, one decimal\n", "answer": 161.2, "dp": 1, "hint": "s.groupby(\"product\")[\"outstanding\"].mean() — then [\"Small business loan\"] / 1e6.", "model": "mean_out = s.groupby(\"product\")[\"outstanding\"].mean()\nprint(round(mean_out[\"Small business loan\"] / 1e6, 1))     # 161.2\n\nThe default barplot draws 161.2 m for SME — the mean of 781 loans — while the total is 125 892 942 411. Same chart shape, a number 781 times smaller: estimator=sum, or aggregate first."}
```

### sqlite3 and read_sql — the bridge

**What it is.** `sqlite3.connect(path)` opens a database file. **`pd.read_sql(query, con)`** runs any SQL in the database and returns the result as a DataFrame, with the columns of the `SELECT`. Every query from weeks 1–3 — joins, CTEs, window functions — lands in pandas without being re-typed. Values go in through **`params=`**, one `?` per value.

**How to write it.**

```python
import sqlite3
# the database is a file: no server, no password
con = sqlite3.connect("../raw/nur.db")
q = """SELECT strftime('%Y-%m', disbursed_at) AS month, COUNT(*) AS loans, SUM(principal) AS disbursed
       FROM loans WHERE disbursed_at < ? GROUP BY 1 ORDER BY 1"""
# the SQL runs in the database; a DataFrame comes back
by_month = pd.read_sql(q, con, params=("2026-10-01",))
fwd = pd.read_sql("SELECT COUNT(*) AS n FROM payments WHERE paid_at > ?", con, params=("2026-10-01",))
print(len(by_month), fwd["n"][0])
by_month.tail(3)
```

| month | loans | disbursed |
|---|---|---|
| 2026-07 | 367 | 20 693 870 000 |
| 2026-08 | 358 | 22 290 210 000 |
| 2026-09 | 361 | 17 015 490 000 |

33 months, the same numbers as the CSV above — the SQL and the file agree. The second query finds 24 payments dated after the as-of.

| you want | you write |
|---|---|
| open the database | `con = sqlite3.connect("../raw/nur.db")` |
| a query → a DataFrame | `pd.read_sql(sql, con)` |
| a value from Python in the query | `?` in the SQL + `params=(value,)` — the comma makes a tuple |
| dates as dates | `parse_dates=["disbursed_at"]` |
| a DataFrame → a table | `df.to_sql("name", con, if_exists="replace", index=False)` |
| SQL Server / PostgreSQL | `sqlalchemy.create_engine("mssql+pyodbc://…")`, then the same `read_sql` |

**When you use it.**
- Any number that is one `GROUP BY` or join over the big tables: let the database do it.
- A week-3 CTE chain (vintage, roll rate): paste it into `read_sql` unchanged.

> ⚠️ **Watch out.** Values go in `params=`, never into the SQL text. `f"… WHERE paid_at > '{as_of}'"` works today and breaks on the first value with a quote in it — and on a real server it is how an injection gets in.

**Your turn.** Fill the gaps of a safe query.

```game
{"type": "cloze", "id": "w05d4-g1", "title": "Ask safely", "text": "pd.read_sql(\"SELECT COUNT(*) AS n FROM payments WHERE paid_at > {{0}}\", con, {{1}}=(AS_OF,))", "blanks": [["?"], ["params"]], "distractors": ["'{AS_OF}'", "values", "args"]}
```

### When SQL, when pandas

**What it is.** One notebook holds both tools. **SQL** aggregates and joins inside the database, at the database's grain. **pandas** shapes, cuts, checks and charts what comes back. The split is a decision you make per step.

**How to write it.** The same count, both ways — they must agree:

```python
# aggregated in the database
sql_way = pd.read_sql("SELECT product_id, COUNT(*) AS loans FROM loans GROUP BY product_id", con)
# aggregated in memory
pandas_way = status["product"].value_counts()
print(sql_way["loans"].sum(), pandas_way.sum())
```

```text
7828 7828
```

Both give 7 828 loans: the database and the extract agree, so either can feed the chart.

| step | SQL | pandas |
|---|---|---|
| join 92 193 instalments to loans and products | ✔ one query, fast | possible, slower, more memory |
| a week-3 CTE chain (vintage, roll rate) | ✔ paste it into `read_sql` | rewrite needed |
| a definition several tools share (a view) | ✔ | — |
| reshape: `pivot`, `melt`, `rolling`, `pct_change` | awkward | ✔ |
| cut into buckets, merge two results, assert the counts | possible | ✔ shorter |
| a loop over months, a chart, a CSV / Excel / PNG | — | ✔ |

**When you use it.**
- Big aggregation or a shared definition → SQL, through `read_sql`.
- Everything after the aggregation — shape, check, chart, file → pandas.

> 💡 **Key idea.** Split the work by what each tool does well: the aggregation SQL does well (joins across 92 193 instalments, the DPD snapshots) stays in SQL; the shaping, cutting and plotting pandas does well happens after. Tomorrow's checkpoint asks you which was easier for which section — this is the vocabulary.

**Your turn.** Sort the steps.

```game
{"type": "sort", "id": "w05d4-g7", "title": "SQL or pandas?", "q": "Put each step where it is shorter or safer.", "groups": {"SQL (read_sql)": ["Join instalments to loans and products and sum principal_due", "The week-3 vintage CTE chain", "A definition Power BI and the notebook both read"], "pandas": ["pivot the vintage result to cohort × MOB", "A 3-month rolling average and a chart", "assert the bucket counts before saving the PNG"]}}
```

### Putting it together

One figure for Timur's deck, every step of the day: **read_sql** for the aggregation (the as-of as a parameter), an **assert** before the chart, pandas for the **line**'s 3-month average, **labels and a formatter**, a **title computed from the data**, **savefig**.

```python
def fig_disbursements(con, as_of):
    """Figure 1: monthly disbursements and their 3-month average, for the months before as_of."""
    m = pd.read_sql("""SELECT strftime('%Y-%m', disbursed_at) AS month, SUM(principal) AS disbursed
                       FROM loans WHERE disbursed_at < ? GROUP BY 1 ORDER BY 1""", con, params=(as_of,))   # 1 SQL: the aggregation
    # 2 a check before the chart
    assert m["disbursed"].gt(0).all(), "a month with no lending — check the extract"
    # 3 pandas: types and the average
    m["month"] = pd.to_datetime(m["month"])
    m["ma3"] = m["disbursed"].rolling(3).mean()
    # 4 matplotlib: a 16:9 chart
    fig, ax = plt.subplots(figsize=(12, 5.4))
    ax.plot(m["month"], m["disbursed"], color=GREY, lw=1, label="month")
    ax.plot(m["month"], m["ma3"], color=BLUE, lw=2, label="3-month average")
    ax.yaxis.set_major_formatter(bn)
    ax.set_ylim(0, None)
    jan = m.loc[m["month"] == "2026-01-01", "ma3"].iloc[0]
    ax.set_title(f"The 3-month average rose from {jan / 1e9:.1f} to {m['ma3'].iloc[-1] / 1e9:.1f} bn a month in 2026", loc="left")
    ax.legend(frameon=False)
    fig.tight_layout()
    return fig

fig = fig_disbursements(con, "2026-10-01")
# 5 the file for the deck
fig.savefig("figures/01_disbursements_ma3.png", dpi=150, facecolor="white")
```

The title reads "The 3-month average rose from 16.6 to 20.0 bn a month in 2026". Next month Timur calls `fig_disbursements(con, "2026-11-01")` and the title, the line and the file update themselves. In a loop that saves many figures, add `plt.close(fig)` after each `savefig`.

**Your turn.** By how many percent did the 3-month average rise from January to September 2026?

```task
{"id": "w05d4-l7", "kind": "python", "starter": "con = sqlite3.connect(\"../raw/nur.db\")\nm = pd.read_sql(\"\"\"SELECT strftime('%Y-%m', disbursed_at) AS month, SUM(principal) AS disbursed\n                   FROM loans WHERE disbursed_at < ? GROUP BY 1 ORDER BY 1\"\"\", con, params=(\"2026-10-01\",))\n\n# your code: the 3-month average; print the rise from 2026-01 to 2026-09 in %, one decimal\n", "answer": 20.4, "dp": 1, "hint": "ma3 = m[\"disbursed\"].rolling(3).mean(); pick the rows where m[\"month\"] is \"2026-01\" and \"2026-09\"; 100 * (sep / jan - 1).", "model": "m[\"ma3\"] = m[\"disbursed\"].rolling(3).mean()\njan = m.loc[m[\"month\"] == \"2026-01\", \"ma3\"].iloc[0]\nsep = m.loc[m[\"month\"] == \"2026-09\", \"ma3\"].iloc[0]\nprint(round(100 * (sep / jan - 1), 1))     # 20.4\n\n16 605 040 000 → 19 999 856 667: +20.4 % in eight months. The month column from SQL is text ('2026-01'), so compare with text here, or convert it with pd.to_datetime first."}
```

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ matplotlib figure and axes — [Python for Data Analytics - Full Course for Beginners (Luke Barousse), 5:21:23](https://youtu.be/wUSDVGivd-8?t=19283&end=20081)
- ▶ Chart formatting / histograms / box plots — same course, [8:17:21](https://youtu.be/wUSDVGivd-8?t=29841&end=30606)
- ▶ seaborn — same course, [9:31:39](https://youtu.be/wUSDVGivd-8?t=34299&end=35140)
- ▶ seaborn (short single-topic) — [Seaborn Crash Course - Data Visualization in Python (NeuralNine), 08:16](https://youtu.be/rLVCSmtoA7U?t=496&end=840)
- ▶ pandas plotting shortcuts — [Creating Visualizations using Pandas Library (Alex The Analyst), 01:52](https://youtu.be/JpSMse3eVVg?t=112&end=192)
- ▶ `read_sql` — [SQL Databases with Pandas and Python - A Complete Guide (Rob Mulla), 08:35](https://youtu.be/DiQ5Hni6oRI?t=515&end=684)
- ▶ `read_sql` with SQLite (matches the page's `sqlite3.connect`) — [SQLite with Pandas (Code Adhyayana)](https://youtu.be/xcVXCK6U6LA)

- RU deck (TBC Data Analytics 2.0, if you have it) `4.5_Python.pdf`: matplotlib OO interface pp. 12–20, seaborn relational / categorical / distribution plots pp. 22–38 (long vs wide data p. 24), heatmap p. 36, pandas plotting pp. 47–55, chart choice and storytelling pp. 68–72. `4.4_Python.pdf`: DB-API and cursors pp. 7–28, `read_sql` / `to_sql` / chunking pp. 29–34, SQLAlchemy engines pp. 38–54 (for the day you connect to SQL Server).
- *Russian terms:* график = chart / plot, линейный график = line chart, столбчатая / линейчатая диаграмма = bar / barh, гистограмма = histogram, ящик с усами = boxplot, диаграмма рассеяния = scatter, тепловая карта = heatmap, подграфик = subplot, легенда = legend, ось = axis, длинный / широкий формат = long / wide format.

```videoquiz
{"video": "wUSDVGivd-8", "stops": [
  {"at": 19700, "q": "fig, ax = plt.subplots() gives you…", "options": ["a figure (the page) and an axes (the chart area) to draw on", "two separate charts", "a DataFrame", "a saved PNG"], "answer": 0, "explain": "The object interface: methods on ax draw and decorate one named chart — the safe way when there are several.", "back": 60},
  {"at": 30200, "q": "Which chart shows how one number is distributed?", "options": ["A line chart", "A histogram", "A pie", "A heatmap"], "answer": 1, "explain": "hist counts values per bin; choose the bins by hand, and use a log axis for money that spans 2 m to 600 m.", "back": 60},
  {"at": 34700, "q": "What does seaborn's hue= do?", "options": ["Sets one colour for every bar", "Turns a third column into colour — one line or bar per value, from long data", "Changes the theme", "Sorts the categories"], "answer": 1, "explain": "hue is seaborn's gift: a five-line chart is one call — if the data is long (one row per month × product).", "back": 60}]}
```

```videoquiz
{"video": "rLVCSmtoA7U", "stops": [
  {"at": 600, "q": "sns.barplot on raw rows draws, by default…", "options": ["the total per category", "the mean per category", "the count per category", "the median"], "answer": 1, "explain": "barplot aggregates with the mean; pass estimator=sum or aggregate first — countplot counts rows.", "back": 45},
  {"at": 760, "q": "sns.heatmap needs its data as…", "options": ["long: one row per cell", "wide: a matrix (pivot / crosstab)", "a list of dicts", "a single Series"], "answer": 1, "explain": "Rows and columns of the matrix become the heatmap's rows and columns — pivot first.", "back": 45}]}
```

```videoquiz
{"video": "JpSMse3eVVg", "stops": [
  {"at": 140, "q": "df.plot() uses what as the x-axis by default?", "options": ["The first column", "The index", "Row numbers always", "Nothing — you must pass x"], "answer": 1, "explain": "pandas plotting puts the index on x — so set_index(\"month\") before .plot().", "back": 30},
  {"at": 180, "q": "When is the pandas one-liner the right tool?", "options": ["For the board deck", "For a quick look while exploring; the deck goes through fig, ax", "Never", "Only for pies"], "answer": 1, "explain": "The one-liner has no formatter, no finding title, no size — fine for your eyes, not for Timur's slot four.", "back": 30}]}
```

```videoquiz
{"video": "DiQ5Hni6oRI", "stops": [
  {"at": 580, "q": "What does pd.read_sql(query, con) return?", "options": ["A cursor", "A list of tuples", "A DataFrame with the SELECT's column names", "A CSV file"], "answer": 2, "explain": "The query runs in the database and the result lands as a DataFrame — the bridge.", "back": 45},
  {"at": 660, "q": "How should a date from your code reach the SQL?", "options": ["Inside an f-string", "Through params= with a ? placeholder", "Typed by hand", "Through a global variable in the SQL"], "answer": 1, "explain": "params= passes values safely; f-strings break on quotes and invite injection.", "back": 45}]}
```

```videoquiz
{"video": "xcVXCK6U6LA", "stops": [
  {"at": 200, "q": "What does sqlite3.connect(\"nur.db\") open?", "options": ["A server on the network", "The database file itself — no server needed", "A CSV", "An Excel workbook"], "answer": 1, "explain": "SQLite is a file; the same read_sql works later against SQL Server through an SQLAlchemy engine.", "back": 45},
  {"at": 450, "q": "df.to_sql(\"name\", con, if_exists=\"replace\") does what?", "options": ["Reads a table", "Writes the DataFrame into the database as a table", "Deletes the database", "Prints the SQL"], "answer": 1, "explain": "to_sql goes the other way — handy, and a reason to keep derived tables out of the shared raw database.", "back": 45}]}
```

---

## 2. Worked example — figure 2 from query to PNG (15 min)

Outstanding mix by product, as a ranking, with shares as labels — the chart Madina's Excel page had, now reproducible. Each step uses one concept from section 1:

1. **Step 1 — read_sql, the bridge.** SQL joins the 92 193 instalments to loans and products and sums the principal not yet due, per product.
2. **Step 2 — an assert.** The total must be 208 723 504 430 before anything is drawn.
3. **Step 3 — pandas for the share.** One new column: outstanding ÷ total.
4. **Step 4 — barh, sorted, one highlight.** Five long labels, so horizontal bars, largest on top, SME in blue.
5. **Step 5 — labels, titles and number formats.** `bn · %` on every bar, the `bn` formatter on the axis, a title computed with an f-string.
6. **Step 6 — savefig.** `tight_layout`, then the PNG.

```python
mix = pd.read_sql("""
    SELECT p.name AS product, SUM(i.principal_due) AS outstanding
    FROM installments i JOIN loans l ON l.loan_id = i.loan_id JOIN products p ON p.product_id = l.product_id
    WHERE i.due_date > '2026-10-01' GROUP BY 1 ORDER BY 2""", con)                     # SQL does the 92 193-row join
# the extract still has the shape we know
assert mix["outstanding"].sum() == 208_723_504_430
# pandas does the share
mix["share"] = 100 * mix["outstanding"] / mix["outstanding"].sum()
fig, ax = plt.subplots(figsize=(10, 5))
ax.barh(mix["product"], mix["outstanding"], color=[BLUE if s == mix["share"].max() else GREY for s in mix["share"]])
for y, (v, s) in enumerate(zip(mix["outstanding"], mix["share"])):
    # the number the board will quote
    ax.text(v, y, f"  {v / 1e9:,.1f} bn · {s:.1f} %", va="center")
# room for the labels
ax.xaxis.set_major_formatter(bn); ax.set_xlim(0, mix["outstanding"].max() * 1.35)
ax.set_title(f"SME is {mix['share'].max():.0f} % of the {mix['outstanding'].sum() / 1e9:.1f} bn book on 10 % of the loans", loc="left")
fig.tight_layout(); fig.savefig("figures/02_outstanding_mix.png", dpi=150)
```

Output: SME 125.9 bn · 60.3 % (blue) · Auto 57.7 · 27.6 · Consumer 23.1 · 11.0 · BNPL 1.1 · 0.5 · Micro 1.0 · 0.5, smallest at the bottom because `ORDER BY 2` ascending puts the largest bar at the top of a `barh`. Six decisions, each a week-4 rule: barh because five long labels; sorted; from zero; one highlight; the share in the label rather than a second axis; the finding as the title.

> 💡 **Key idea.** A monthly figure must not go stale. The `assert` on the total stops the run when the November extract changes shape, and the title is **built from the data** with an f-string — "60 %" and "208.7 bn" are computed, so next month they are next month's numbers.

---

## 3. Practice (50 min)

Each editor opens `nur.db` or reads the extract; a chart appears under the editor when your code draws one. Print the number the task asks for, then ✔ Check — and write the finding you would put in the chart's title. In Jupyter, `data/python/day4_starter.ipynb` has the five pack figures; add your cells below and save every chart to `figures/`.

**P1.** *(figure, axes and a line chart)* `monthly` from the bridge: a line of the 33 months (October dropped) with pandas' `.plot()` in one line, then the same with `fig, ax` and the bn formatter. What does the one-liner lack for the deck? Print September 2026 in bn.

```task
{"id": "w05d4-p1", "kind": "python", "starter": "import sqlite3\nimport pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nfrom matplotlib.ticker import FuncFormatter\ncon = sqlite3.connect(\"../raw/nur.db\")\nmonthly = pd.read_sql(\"\"\"SELECT strftime('%Y-%m', disbursed_at) AS month, SUM(principal) AS disbursed\n                         FROM loans WHERE disbursed_at < '2026-10-01' GROUP BY 1 ORDER BY 1\"\"\", con)\n\n# your code\n", "answer": 17.0, "dp": 1, "hint": "The check looks for September 2026's disbursed amount in bn, one decimal: monthly[\"disbursed\"].iloc[-1] / 1e9.", "model": "monthly.set_index(\"month\")[\"disbursed\"].plot()                 # for your eyes\nfig, ax = plt.subplots(figsize=(10, 5))\nax.plot(pd.to_datetime(monthly[\"month\"]), monthly[\"disbursed\"], color=\"#1d4ed8\")\nax.yaxis.set_major_formatter(FuncFormatter(lambda x, _: f\"{x / 1e9:,.0f} bn\"))\nax.set_title(\"Disbursements rose from 3.9 bn to 17.0 bn a month in 33 months\", loc=\"left\")\nprint(len(monthly), round(monthly[\"disbursed\"].iloc[-1] / 1e9, 1))   # 33 17.0\n\nThe one-liner lacks the size, the formatter (it shows 1e10), a left-aligned finding title and the file. The line starts at 3.87 bn (Jan 2024) and ends at 17.0 bn (Sep 2026); the two Septembers (2025: 14.6 bn) show the +16 % yoy."}
```

**P2.** *(bar and barh)* Outstanding by region as a sorted barh with bn labels; then the same for Tashkent's product mix. One finding title each. Print Tashkent's outstanding in bn.

```task
{"id": "w05d4-p6", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nstatus = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code\n", "answer": 81.7, "dp": 1, "hint": "The check looks for Tashkent's outstanding in bn, one decimal.", "model": "reg = status.groupby(\"region\")[\"outstanding\"].sum().sort_values()\nprint((reg / 1e9).round(1))       # Tashkent 81.7 · Fergana 24.8 · Samarkand 24.7 · Andijan 19.8 · Namangan 18.7 · Bukhara 15.1 · Nukus 13.3 · Termez 10.7\nfig, ax = plt.subplots(figsize=(10, 5))\nax.barh(reg.index, reg.values, color=[\"#1d4ed8\" if r == \"Tashkent\" else \"#9ca3af\" for r in reg.index])\nfor y, v in enumerate(reg.values):\n    ax.text(v, y, f\"  {v / 1e9:.1f} bn\", va=\"center\")\nax.set_title(\"Tashkent's three branches hold 39 % of the book; the next two regions 24 %\", loc=\"left\")\n\nTashkent's mix: SME 58.6 % · Auto 30.0 · Consumer 10.4 · BNPL 0.5 · Micro 0.5 — \"Tashkent is the whole book in miniature\". Sorted, from zero, one highlight (Tashkent)."}
```

**P3.** *(histogram)* Histogram of `principal` (all 7 828 loans) with 30 bins, then with `ax.set_xscale("log")` — or `np.log10` first. Which one shows the two books?

```task
{"id": "w05d4-p2", "kind": "choice", "options": ["The linear one — every loan is visible", "The log one: two humps, 2–6 m (Micro / BNPL / Consumer) and 150–450 m (SME / Auto)", "Neither — a histogram cannot show groups", "Both look the same"], "answer": 1, "explain": "Linear: one bar at the left (median 5.79 m) and a long invisible tail to 599 m — useless. Log: two humps. The 10th percentile is 1.37 m, the 99th 531 m — a 400× range needs a log axis; say so on the axis label (principal, log scale). Bins on a log axis: np.logspace(6, 9, 30)."}
```

**P4.** *(box plot)* `sns.boxplot` of `principal` by `product`, products ordered by median (or `ax.boxplot` with one list per product). Read SME's box: print the medians.

```task
{"id": "w05d4-p3", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nstatus = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code\n", "answer": 314770000, "dp": 0, "hint": "The check looks for SME's median principal in soum: groupby(\"product\")[\"principal\"].median().", "model": "med = status.groupby(\"product\")[\"principal\"].median().sort_values(ascending=False)\nprint(med)                    # SME 314770000 · Auto 214840000 · Consumer 26965000 · BNPL 4180000 · Micro 2700000\nfig, ax = plt.subplots(figsize=(10, 5))\nax.boxplot([status.loc[status[\"product\"] == p, \"principal\"] for p in med.index], labels=med.index)\nax.set_yscale(\"log\"); ax.set_title(\"SME's middle half runs from 165 m to 454 m, up to the 600 m cap\", loc=\"left\")\n\nMedians: SME 314.8 m · Auto 214.8 m · Consumer 27.0 m · BNPL 4.18 m · Micro 2.70 m. SME's box runs 165 m (Q1) to 454 m (Q3), whiskers to the 600 m cap, no outliers — a flat, wide distribution up to the product limit. On one linear axis the three small products are a line at the bottom; use a log axis or one subplot per product (sharey=False). With seaborn: sns.boxplot(data=status, x=\"product\", y=\"principal\", order=med.index)."}
```

**P5.** *(scatter)* Scatter of `principal` vs `outstanding` for active loans, `alpha=0.3`, both axes log. What is the correlation, and how many points sit *above* the diagonal (outstanding > principal)?

```task
{"id": "w05d4-p5", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nstatus = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code\n", "answer": 19, "dp": 0, "hint": "The check looks for the count of active loans with outstanding > principal — a mask and .sum().", "model": "act = status[status[\"status\"] == \"active\"]\nfig, ax = plt.subplots(figsize=(7, 6))\nax.scatter(act[\"principal\"], act[\"outstanding\"], s=8, alpha=0.3)\nax.set_xscale(\"log\"); ax.set_yscale(\"log\")\nprint(round(act[[\"principal\", \"outstanding\"]].corr().iloc[0, 1], 2))    # 0.92\nabove = act[act[\"outstanding\"] > act[\"principal\"]]\nprint(len(above), above[\"product\"].unique())                           # 19 ['Buy now pay later']\n\nPoints on the diagonal are young loans (nothing repaid yet); points far below it are old loans nearly repaid. A point above should be impossible — and there are 19, all BNPL loans disbursed in September 2026, above by 100–400 soum: the zero-rate schedule rounds the instalment up to the nearest 100 (3 380 000 / 12 → 281 700 × 12 = 3 380 400) and never trims the last one. Invisible on any axis, found by a mask — a one-line data-quality note for Jasur, and the reason you check the impossible before you trust the chart."}
```

**P6.** *(labels, titles and number formats)* The four-bucket bar chart, finished: a data label on every bar (`f"{v:,}"`), the unit on the y-axis, a source line, and a title computed from the data — *"N loans are late; M of them are already 90+"*. Print the 90+ share of the late loans, in % with one decimal.

```task
{"id": "w05d4-l8", "kind": "python", "starter": "import pandas as pd\nimport matplotlib.pyplot as plt\nstatus = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\nlate = status[\"bucket\"].value_counts().reindex([\"1-30\", \"31-60\", \"61-90\", \"90+\"])\n\n# your code: the bar chart with labels and a computed title; print the 90+ share of late loans in %\n", "answer": 58.6, "dp": 1, "hint": "n, m = late.sum(), late[\"90+\"]; the title is f\"{n} loans are late; {m} of them are already 90+\"; the share is 100 * m / n.", "model": "n, m = late.sum(), late[\"90+\"]\nfig, ax = plt.subplots(figsize=(10, 5))\nax.bar(late.index, late.values, color=[\"#dc2626\" if k == \"90+\" else \"#9ca3af\" for k in late.index])\nfor i, v in enumerate(late.values):\n    ax.text(i, v, f\"{v:,}\", ha=\"center\", va=\"bottom\")\nax.set_ylim(0, late.max() * 1.15)\nax.set_ylabel(\"loans\")\nax.set_title(f\"{n} loans are late; {m} of them are already 90+\", loc=\"left\")\nfig.text(0.01, 0.01, \"loans_status.csv · as of 2026-10-01\", fontsize=9)\nfig.tight_layout()\nprint(round(100 * m / n, 1))     # 58.6\n\n399 late, 234 already 90+ — 58.6 % of the late loans are old debt. Because n and m are computed, next month's title is next month's numbers."}
```

**P7.** *(small multiples)* A 2 × 2 grid: buckets (bar), outstanding mix (barh), monthly line, roll heatmap — one `fig.suptitle`, one source line, one PNG. Then say why this is *not* what Timur asked for.

```task
{"id": "w05d4-p9", "kind": "free", "min": 25, "model": "fig, axes = plt.subplots(2, 2, figsize=(16, 10)), each chart on axes[i, j], fig.suptitle(\"Nur Finance — loan book, as of 2026-10-01\", x=0.01, ha=\"left\") and fig.text(0.01, 0.005, \"nur.db · 7 828 loans · payments de-duplicated\", fontsize=9). It is a one-pager for a reader with a printout. Timur's deck wants one chart per slide with one sentence each: a 2 × 2 grid on a slide has four titles competing and nothing big enough to read from the back of the room. Both are right for their reader — the grid for the printout, five files for the deck.", "rubric": ["Builds the grid with subplots(2, 2) and one suptitle / source line", "Says the deck needs one chart and one message per slide", "Names the reader each format is for (printout vs slide)"]}
```

**P8.** *(what chart for what question)* Nilufar wants the FPD30 rate for 4 grades × 3 channels on one slide, so the committee can see where the worst cell is. Which chart?

```task
{"id": "w05d4-l9", "kind": "choice", "options": ["A grouped bar chart of 12 bars in three colours", "A heatmap: grades as rows, channels as columns, each cell coloured and annotated with its rate", "Three pies, one per channel", "A line chart with the grades on x and one line per channel"], "answer": 1, "explain": "Grade × channel is a matrix question: a heatmap (sns.heatmap of a pivot_table) shows all 12 rates at once and the worst cell is the darkest. Twelve bars make the reader hunt through a legend; pies cannot compare rates; a line implies an order between grades that a reader will read as a trend."}
```

**P9.** *(pandas .plot vs seaborn)* `sns.lineplot` of monthly disbursements by product (`hue="product"`) from `monthly_disbursements.csv` — long data, October dropped. Then `pivot` to wide and `df.plot()` — same chart? Which product would someone ask to put on its own axis, and why do you refuse? Print SME's January–September 2026 total in bn.

```task
{"id": "w05d4-p8", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nmd = pd.read_csv(\"../excel/monthly_disbursements.csv\", parse_dates=[\"month\"])\n\n# your code\n", "answer": 94.8, "dp": 1, "hint": "The check looks for SME's 2026 total (January–September) in bn, one decimal.", "model": "md = md[md[\"month\"] < \"2026-10-01\"]                       # drop the one-day October\nwide = md.pivot(index=\"month\", columns=\"product\", values=\"amount\")\nwide.plot(figsize=(10, 5))                                  # pandas: wide, one column per line\n# seaborn: sns.lineplot(data=md, x=\"month\", y=\"amount\", hue=\"product\") — long, hue per product\ny26 = md[md[\"month\"] >= \"2026-01-01\"].groupby(\"product\")[\"amount\"].sum() / 1e9\nprint(y26.round(1))       # SME 94.8 · Auto 36.0 · Consumer 25.5 · Micro 2.8 · BNPL 2.4\n\nSame chart: seaborn takes long data with hue, pandas' plot takes wide data with one column per line. SME and Auto are readable; Consumer is a low line; Micro and BNPL are flat at the bottom. The request for a second axis is the week-4 trap (two lines crossing on two scales tell a story that does not exist); give the small products their own small multiple (sns.relplot(..., col=\"product\", facet_kws={\"sharey\": False})) or a share chart."}
```

**P10.** *(seaborn)* `sns.countplot(x="grade", hue="product")` — then the same information as a heatmap of `pd.crosstab(product, grade)`. Which reads better, and what is the finding? Print the crosstab.

```task
{"id": "w05d4-p4", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nstatus = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# your code\n", "answer": 1154, "dp": 0, "hint": "The check looks for Micro loans of grade B.", "model": "ct = pd.crosstab(status[\"product\"], status[\"grade\"])\nprint(ct)                                   # Micro: A 655 · B 1154 · C 777 · D 83\nprint(pd.crosstab(status[\"product\"], status[\"grade\"], normalize=\"index\").mul(100).round(0))\nfig, ax = plt.subplots(figsize=(7, 4))\nax.imshow(ct.values, cmap=\"Reds\")          # or sns.heatmap(ct, annot=True, fmt=\"d\", cmap=\"Reds\")\n\nThe heatmap reads better: one number per cell; 20 bars in five colours is a legend-reading exercise. Micro: A 655 · B 1 154 · C 777 · D 83; SME: 175 · 350 · 205 · 51. Every product is roughly 23 / 44 / 29 / 4 % — the grade mix does not depend on the product, so a product's FPD difference is not a grade difference (week 2's finding, now a picture)."}
```

**P11.** *(read_sql with params)* The bridge with parameters: a function `late_loans(con, as_of)` that runs the week-2 DPD logic in SQL with `params=` and returns the bucket counts. Call it for 1 September and 1 October.

```task
{"id": "w05d4-p7", "kind": "python", "starter": "import sqlite3\nimport pandas as pd\nimport numpy as np\ncon = sqlite3.connect(\"../raw/nur.db\")\n\n# your code: late_loans(con, as_of), then call it for \"2026-09-01\" and \"2026-10-01\"\n", "answer": 217, "dp": 0, "hint": "The check looks for the 90+ count on 1 September. Two ? placeholders: the payment cut and the matured-instalment cut both use the as-of.", "model": "def late_loans(con, as_of):\n    q = \"\"\"WITH pc AS (SELECT DISTINCT installment_id, paid_at, amount FROM payments),\n           paid AS (SELECT installment_id, SUM(amount) AS p FROM pc WHERE paid_at <= ? GROUP BY installment_id)\n           SELECT i.loan_id, MIN(i.due_date) AS oldest\n           FROM installments i LEFT JOIN paid ON paid.installment_id = i.installment_id\n           WHERE i.due_date <= ? AND COALESCE(paid.p, 0) < i.total_due\n           GROUP BY i.loan_id\"\"\"\n    d = pd.read_sql(q, con, params=(as_of, as_of), parse_dates=[\"oldest\"])\n    dpd = (pd.Timestamp(as_of) - d[\"oldest\"]).dt.days\n    return pd.cut(dpd, [0, 30, 60, 90, np.inf], labels=[\"1-30\", \"31-60\", \"61-90\", \"90+\"]).value_counts().sort_index()\nprint(late_loans(con, \"2026-09-01\"))   # 128 / 23 / 17 / 217\nprint(late_loans(con, \"2026-10-01\"))   # 124 / 25 / 16 / 234\n\n1 Sep: 385 late, plus 13 with an instalment due that day at DPD 0 (left out by the first edge 0 on purpose); 1 Oct: 399 late, plus 14. params=(as_of, as_of) fills the two ? — the payment filter and the instalment filter, week 3's lesson. Never f\"... <= '{as_of}'\": it works today and breaks on the first value with a quote in it."}
```

> 🚀 **Stretch (optional, +5 XP).** **P12.** *(when SQL, when pandas)* `to_sql`: write `dpd_per_loan` (HW 5.2) into `nur.db` as a table `loan_dpd_pandas`, then `read_sql` a join of it with the week-2 DPD logic to count mismatches loan by loan. Then drop the table (`con.execute("DROP TABLE loan_dpd_pandas")`) — why drop it? How many mismatches?

```task
{"id": "w05d4-p10", "kind": "number", "answer": 0, "dp": 0, "unit": "mismatches", "xp": 2, "hint": "d.to_sql(\"loan_dpd_pandas\", con, if_exists=\"replace\", index=False), then a LEFT JOIN against the SQL DPD and COUNT(*) WHERE the two differ.", "model": "0 mismatches on 7 828 loans — the pandas DPD and the SQL DPD agree loan by loan. Drop the table because nur.db is the shared raw source for everyone's weeks 1–3 work: a derived table left inside it is the \"clean the only copy\" sin from week 1. Derived tables belong in your own database file or a pandas_ schema, documented. (On the page you write into your own copy of nur.db, so nothing shared is touched — the habit still matters.)"}
```

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

```check
{"id": "w05d4-sc", "questions": [
  {"type": "multi", "q": "What does pd.read_sql let you avoid re-doing in pandas?", "options": ["The joins across 92 193 instalments", "The week-3 CTE chains (vintage, roll rate)", "The DPD snapshots computed in SQL", "The chart titles"], "answer": [0, 1, 2], "explain": "SQL keeps the aggregation it does well; pandas still does the shaping, the cut, the asserts and the chart (→ section 1, 'read_sql')."},
  {"type": "single", "q": "seaborn's lineplot with hue wants long data; pandas' plot wants wide. Which calls convert each way?", "options": ["melt makes long, pivot makes wide", "pivot makes long, melt makes wide", "groupby both ways", "concat and merge"], "answer": 0, "explain": "Day 3's reshaping pair: melt → long (one row per month × product), pivot → wide (one column per product) (→ section 1, 'seaborn')."},
  {"type": "single", "q": "Why does figure 3 draw four bars and put the 7 429 current loans in the axis label?", "options": ["matplotlib cannot draw five bars", "On one axis the 7 429 would flatten the four delinquent bars, and a log axis would break 'bars start at zero'", "The board asked for it", "Current loans are not in the file"], "answer": 1, "explain": "The fifth number goes into the label, not onto a log scale (→ section 1, 'What chart for what question')."},
  {"type": "single", "q": "A PNG comes out with the axis labels cut off. What was missing before savefig?", "options": ["plt.close(fig)", "fig.tight_layout() (or bbox_inches=\"tight\")", "dpi=300", "ax.legend()"], "answer": 1, "explain": "tight_layout makes room for labels and titles before the file is written (→ section 1, 'Labels, titles and number formats')."}
]}
```

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

```game
{"type": "match", "id": "w05d4-g4", "title": "Which chart for which figure?", "pairs": [["01 disbursements", "line: month in grey + 3-month average in blue"], ["02 outstanding mix", "barh, sorted, one highlight, bn · % labels"], ["03 DPD buckets", "bar from zero, 90+ in red"], ["04 vintage", "heatmap: cohort × months on book"], ["05 roll rate", "heatmap: from-bucket × to-bucket"]]}
```

The numbers behind the titles, from the notebook's own output: figure 1's average rises from 16.6 bn (Jan 2026) to 20.0 bn (Sep 2026) while single months swing −32 % / +65 %; figure 2's shares 60.3 / 27.6 / 11.0 / 0.5 / 0.5 and total 208 723 504 430; figure 3's 124 / 25 / 16 / 234; figure 4's row 2025-10: 2.76 · 4.15 · **6.91** · 8.76 · 9.68 · **11.52** % against a pooled 2025 curve of 4.35 % at MOB 3 and 7.46 % at MOB 6; figure 5's matrix: from 1–30 → 0: 97, stays 6, → 31–60: 25 (19.5 %); 31–60 → 61–90: 16 of 23 (69.6 %); 61–90 → 90+: 17 of 17; 90+ → 90+: 217, plus 117 new entries into 1–30. Every one of these is a week-2/3 number the board has seen in a table; the pack is the same number in a form they will remember.

The driver that Timur runs — each figure is a function `(con, as_of) → fig`, the pack is a loop:

```python
# (shape only — not meant to run) … the five fig_* makers are in
# day4_starter.ipynb
FIGURES = {"01_disbursements_ma3": fig_disbursements, "02_outstanding_mix": fig_mix, "03_dpd_buckets": fig_buckets,
           "04_vintage_heatmap": fig_vintage, "05_roll_rate": fig_roll}

def figure_pack(con, as_of, out_dir="figures"):
    # figures/2026-10-01/
    out = Path(out_dir) / str(as_of.date()); out.mkdir(parents=True, exist_ok=True)
    for name, make in FIGURES.items():
        # every maker queries with params=(as_of,) and asserts its counts
        fig = make(con, as_of)
        fig.savefig(out / f"{name}.png", dpi=150, facecolor="white")
        plt.close(fig)
    return sorted(p.name for p in out.glob("*.png"))

figure_pack(con, pd.Timestamp("2026-10-01"))
# ['01_disbursements_ma3.png', '02_outstanding_mix.png', '03_dpd_buckets.png',
# '04_vintage_heatmap.png', '05_roll_rate.png']
```

> 💡 **Key idea.** **Reproducibility is the deliverable.** Three habits make the pack Timur's and not a favour: the as-of date is one variable used in every query (`params=(AS_OF,)`); every title that quotes a number computes it (`f"… {b['90+']:,} of them are already 90+ …"`); and an `assert` on each data frame before its chart (`assert b.sum() == 7828`) stops the run when the extract changes shape, instead of saving a wrong PNG. Next month: change `AS_OF`, Kernel → Restart & Run All, five new files in `figures/`.

**If `FULL OUTER JOIN` fails** (SQLite before 3.39): build the two snapshots in pandas with Day 3's `dpd_per_loan(inst, pay, as_of)` for 2026-09-01 and 2026-10-01, `merge(on="loan_id", how="outer").fillna(0)`, `pd.cut` both sides, `pd.crosstab(from, to)` — 526 loans delinquent on either date, the same 5 × 5 matrix.

> 🎯 **Interview version.** *"How would you build a monthly chart pack from a database?"* — one notebook; SQL for the aggregation through `read_sql` with the as-of as a parameter; pandas for shaping; a chart type chosen by the question (line for time, barh for rankings, heatmap for matrices); titles that state the finding and compute their own numbers; asserts on counts before each chart; `savefig` to a dated folder; Restart & Run All as the release test.

**Say it like in an interview.** Answer the question above in your own words, as you would say it aloud, with Nur Finance's pack as the example.

```task
{"id": "w05d4-int", "kind": "free", "min": 30, "model": "I would build it as one notebook that anyone can re-run. The heavy aggregation stays in SQL — at Nur Finance the vintage chain and the roll-rate snapshots — read into pandas with read_sql and the as-of date passed as a parameter, never pasted into the SQL. pandas shapes each result (a pivot for the heatmaps, a rolling average for the trend), and an assert on the counts runs before every chart, so a changed extract stops the run instead of producing a wrong picture. Each chart type follows the question — a line for 33 months, a sorted barh for the product mix, heatmaps for vintage and roll rates — and each title states the finding with numbers computed from the data. Every figure is saved to a dated folder, and Restart & Run All is my release test: next month I change AS_OF and get five new PNGs.", "rubric": ["SQL for aggregation via read_sql with the as-of as a parameter", "Asserts on counts before the charts", "Chart type chosen by the question; titles state the finding, computed from data", "Re-runnable: one AS_OF, savefig to a folder, Restart & Run All"]}
```

Tomorrow: the checkpoint — week 3's ten-section EDA report redone in pandas, each number set beside its SQL twin, with a verdict on which tool made which section easier.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w05d4", "pass": 0.8, "questions": [
  {"type": "single", "q": "Why does the figure pack use fig, ax = plt.subplots() instead of plt.plot()?", "options": ["Every title, label and formatter then belongs to a named chart — clear and safe when there are several", "plt.plot cannot draw lines", "Only a fig can be saved to PNG", "subplots draws faster"], "answer": 0, "explain": "plt.plot draws on 'the current axes', which gets confusing with several charts; the object interface makes the chart yours (→ section 1, 'Figure and axes')."},
  {"type": "single", "q": "Each bar is meant to be the product's total outstanding. What does it show?", "code": "sns.barplot(data=loans, x=\"outstanding\", y=\"product\")", "options": ["The mean outstanding per loan of each product", "The number of loans", "The total", "The median"], "answer": 0, "explain": "seaborn's barplot aggregates with the mean by default — pass estimator=sum or aggregate first (→ section 1, 'seaborn')."},
  {"type": "single", "q": "sns.heatmap of a vintage matrix (cohort × MOB) needs which shape of data?", "options": ["A Series of percentages", "Wide: a pivot with cohorts as rows and MOB as columns", "Any shape", "Long: one row per cohort × MOB"], "answer": 1, "explain": "hue-based charts want long data (melt); heatmap wants a wide matrix (pivot) — most 'seaborn does not work' moments are the wrong shape (→ section 1, 'seaborn')."},
  {"type": "single", "q": "Both lines return the same count today. Which one belongs in the figure pack?", "code": "as_of = \"2026-10-01\"\nq1 = pd.read_sql(f\"SELECT COUNT(*) AS n FROM payments WHERE paid_at > '{as_of}'\", con)\nq2 = pd.read_sql(\"SELECT COUNT(*) AS n FROM payments WHERE paid_at > ?\", con, params=(as_of,))", "options": ["Neither — read the whole table and filter in pandas", "Either — they are identical", "q1 — easier to read", "q2 — params= passes the value safely; an f-string breaks on a quote and invites injection on a real server"], "answer": 3, "explain": "Values go in params=, never into the SQL text (→ section 1, 'read_sql', P11)."},
  {"type": "number", "q": "On nur.db, what number does this query return?", "code": "pd.read_sql(\"SELECT COUNT(*) AS n FROM payments WHERE paid_at > ?\", con, params=(\"2026-10-01\",))", "answer": 24, "tol": 0, "explain": "24 forward-dated payments (53.4 m) — the rows every payment sum excludes with paid_at <= AS_OF (→ section 1, 'read_sql')."},
  {"type": "multi", "q": "Which of these are chart rules, not matters of taste?", "options": ["No legend for a single series", "A log axis on a bar chart so small values show", "A second y-axis so two lines fit", "Drop the one-day October point from a time series", "Bars start at zero", "The title states the finding"], "answer": [0, 3, 4, 5], "explain": "A log axis breaks 'bars from zero', and two y-axes invent crossings; the October point (one day) reads as a crash (→ section 1, 'What chart for what question')."},
  {"type": "single", "q": "Figure 2's title says \"208.7 bn\". Next month the total changes. What is the lasting fix?", "options": ["Add a footnote with the date", "Build the title from the data with an f-string", "Edit the title by hand each month", "Remove all numbers from titles"], "answer": 1, "explain": "A title computed from the data cannot go stale; an assert above the chart catches a changed extract (→ section 2)."},
  {"type": "single", "q": "Company corner: what makes the figure pack Timur's and not a favour?", "options": ["One AS_OF used in every query, titles computed from the data, an assert before each chart — then Restart & Run All", "Five charts on one 2 × 2 grid", "Hand-picked colours each month", "Saving every chart as SVG"], "answer": 0, "explain": "Reproducibility is the deliverable: change AS_OF, run all, five new files (→ Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w05d4", "q": "Timur wants figure 1 to carry a year-ago comparison in its title. Read the monthly disbursed amount (SUM(principal) by month, disbursed before 2026-10-01) from nur.db with pd.read_sql, take the 3-month rolling average, and compare September 2026's average (Jul–Sep 2026) with September 2025's (Jul–Sep 2025). By how many percent is it higher? Give a percentage to 1 decimal.", "type": "number", "dp": 1, "python": true, "h": ["76d786089690eeaf0c7f6726"], "hint": "Once the months are one row each in order, the year-ago value of any column is twelve rows up.", "sol": "Y29uID0gc3FsaXRlMy5jb25uZWN0KCIuLi9yYXcvbnVyLmRiIikKbSA9IHBkLnJlYWRfc3FsKCIiIlNFTEVDVCBzdHJmdGltZSgnJVktJW0nLCBkaXNidXJzZWRfYXQpIEFTIG1vbnRoLCBTVU0ocHJpbmNpcGFsKSBBUyBkaXNidXJzZWQKICAgICAgICAgICAgICAgICAgIEZST00gbG9hbnMgV0hFUkUgZGlzYnVyc2VkX2F0IDwgPyBHUk9VUCBCWSAxIE9SREVSIEJZIDEiIiIsIGNvbiwgcGFyYW1zPSgiMjAyNi0xMC0wMSIsKSkKbVsibWEzIl0gPSBtWyJkaXNidXJzZWQiXS5yb2xsaW5nKDMpLm1lYW4oKQptWyJtYTNfeW95Il0gPSAxMDAgKiAobVsibWEzIl0gLyBtWyJtYTMiXS5zaGlmdCgxMikgLSAxKQptLnRhaWwoMSkgICAgIyAyMDI2LTA5ICBtYTMgMTkgOTk5IDg1NiA2NjcgwrcgYSB5ZWFyIGVhcmxpZXIgMTUgNjM0IDIwNiA2NjcgwrcgKzI3LjkgJQoKKzI3LjkgJTogdGhlIDMtbW9udGggYXZlcmFnZSByZWFjaGVkIDIwLjAgYm4gaW4gU2VwdGVtYmVyIDIwMjYgYWdhaW5zdCAxNS42IGJuIGEgeWVhciBlYXJsaWVyIOKAlCBncm93dGgsIGJ1dCBtdWNoIHNsb3dlciB0aGFuIHRoZSArNDDigJM3MCAlIG9mIHRoZSBmaXJzdCBoYWxmIG9mIDIwMjYuClRoZSBzaW5nbGUgbW9udGggc2F5cyArMTYgJSAoMTcuMCB2cyAxNC42IGJuKSwgd2hpY2ggaXMgd2h5IHRoZSB0aXRsZSBzaG91bGQgcXVvdGUgdGhlIGF2ZXJhZ2U6IG9uZSB3ZWFrIFNlcHRlbWJlciBtb250aCB3b3VsZCBvdGhlcndpc2Ugc2V0IHRoZSBzdG9yeS4KRHJvcHBpbmcgT2N0b2JlciAyMDI2IG1hdHRlcnMgaGVyZSB0b286IHdpdGggdGhlIG9uZS1kYXkgbW9udGggbGVmdCBpbiwgdGhlIGxhc3Qgcm93IGlzIGEgY3Jhc2gsIG5vdCBTZXB0ZW1iZXIu"}
```

<!-- challenge:end -->
