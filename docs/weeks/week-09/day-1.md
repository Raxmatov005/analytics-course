# Week 9 · Day 1 — Correlation and linear regression: what moves the monthly payment?

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 9.1 (due Day 3)</span> <span class="badge company">Company corner</span>

> STORY **Monday, 9:00.** Nilufar, risk, puts a folder marked *Scorecard 2024* on your desk. *"Our application scorecard was built two years ago. Does it still work, and is our approval cut-off in the right place? That is your week. But a scorecard is a statement about relationships — a higher score, fewer bad loans — so first I want you to read a relationship properly: how strong it is, what a line through it means in soum, and what you may **not** say from it. Two warm-ups from my inbox. Sales says rich customers ask for bigger loans — true? And the affordability team wants a quick rule for the monthly payment from the amount and the term. Do the SME version with me today; the Consumer one is your homework."*

## Today in 3 lines

- A relationship between two numbers, read four ways: the **scatter plot**, **Pearson's r** (and why r = 0.002 between income and the requested amount means "no straight line", not "no link"), **Spearman's** rank correlation for skewed money columns, and the **correlation matrix** — with the two traps: **correlation is not causation**, and a correlation across groups can flip inside them.
- The **least-squares line**: slope and intercept in soum, fitted with numpy, scipy and Excel; **R²**; **residuals** and the residual plot; **outliers and leverage**; **several predictors** and a **product dummy**; prediction against explanation, and the **extrapolation** trap.
- The SME desk gets its rule — and learns that inside one term the payment is an exact straight line — and you start HW 9.1 (the Consumer rule, in `data/python/week9/day1_starter.ipynb`).

---

## 1. Learn — two numbers that move together

Press ▶ Run on this first box once. It loads the tools and the data for the whole page; every later box on this page, and every Practice box, reuses them.

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy import stats

loans = pd.read_csv("data/raw/loans.csv")
apps = pd.read_csv("data/raw/applications.csv")
cust = pd.read_csv("data/raw/customers.csv")
# bad = the loan defaulted or was written off
bad = loans["status"].isin(["default", "written_off"])
loans["bad"] = bad.astype(int)
# principal in millions of soum, payment in thousands
loans["pm"] = loans["principal"] / 1e6
loans["pay_k"] = loans["monthly_payment"] / 1e3
# product 4 = Auto loans
auto = loans[loans["product_id"] == 4].copy()
print(len(loans), len(auto), loans["bad"].sum())
# 7828 391 234
```

7 828 loans, 391 of them Auto loans, and 234 loans that went bad. Most examples below use the Auto loans: one product, one interest rate (24 %), three terms.

### The scatter plot — one dot per loan

**What it is.** A **scatter plot** (*диаграмма рассеяния*) puts one dot per case at (x, y). The **x** is the number you think explains (here the principal); the **y** is the number you want to understand (the monthly payment). Read four things: the **direction** (up or down), the **form** (straight or curved), the **strength** (a tight band or a loose cloud) and anything odd (groups, far-out points).

**How to write it.** `plt.scatter(x, y)`; colour the dots by a third column with `c=`.

```python
plt.scatter(auto["pm"], auto["pay_k"], c=auto["term_months"], s=10)
plt.colorbar(label="term, months")
plt.xlabel("principal, m soum")
plt.ylabel("monthly payment, thousand soum")
```

```text
20 |                              o o
   |                           o
   |                      o
   |                   o        x xxx
10 |             o o   ++  xx
   |           oo + ++x x
   |      o o+++x+
   |    ++x+
 0 |
   +---------------------------------
    0      100     200     300     400
y: payment, m soum a month
x: principal, m soum
o 24 months   + 36   x 48
```

391 Auto loans: the payment rises with the principal, and the dots split into three fans — one per term. At the same principal, the 24-month loans pay the most.

**When you use it.**
- Always first, before any number: a correlation or a line hides what the picture shows at once.
- To spot groups (here: the terms) and far-out points before you fit anything.

> ⚠️ **Watch out.** All 7 828 loans in one scatter squash Micro loans (0.5–5 m) into a dot next to SME loans (up to 600 m). Plot one product at a time, or use a log scale (`plt.xscale("log")`).

**Your turn.** At the same principal, which Auto loans pay the most each month?

```task
{"id": "w09d1-l1", "kind": "choice", "options": ["The 24-month loans: the shorter the term, the bigger each payment", "The 48-month loans: a longer loan costs more interest, so it pays more each month", "All three terms pay the same at the same principal", "You cannot tell from a scatter plot"], "answer": 0, "explain": "The same principal repaid over 24 months instead of 48 means bigger instalments: the 'o' fan sits on top. More interest in total does not mean a bigger monthly payment."}
```

### Pearson's correlation r — how close to a straight line

**Before you read.** Guess first, then play with it — the explanation below will make more sense.

```explore
{"id": "w09d1-x2", "type": "guessr", "title": "Guess the correlation", "predict": {"q": "Two scatters of 40 loans. **A**: the dots lie almost exactly on a gentle line — each extra 1 m soum adds only 10 000 soum a month. **B**: the dots rise steeply — each extra 1 m adds 400 000 soum — but they are scattered widely. Which has the **larger r**?", "options": ["A — the tight, gentle one", "B — the steep, scattered one", "The same: both rise", "You need the slopes to know"], "answer": 0, "why": "r measures how closely the dots hug a straight line, not how steep the line is. A tight gentle line has r near 1; a steep loose cloud has a smaller r. Play a few rounds: some clouds are drawn tall, some flat, and the height tells you nothing."}, "n": 40, "seed": 17, "challenges": [{"id": "c1", "text": "Play **5 rounds**.", "when": {"rounds": [">=", 5]}}, {"id": "c2", "text": "Land one guess within **0.05** of the true r.", "when": {"best": ["<=", 0.05]}}, {"id": "c3", "text": "Bring the **average error of your last 5 rounds** under **0.10**.", "when": {"avg5": ["<", 0.1]}}]}
```

**What it is.** **Pearson's correlation coefficient** *r* (*коэффициент корреляции Пирсона*) is a number from −1 to +1. Its **sign** is the direction: + when y rises with x, − when it falls. Its **size** is how close the dots lie to a straight line: ±1 is a perfect line, 0 is no straight-line pattern. It has no units and does not care which column is x.

**How to write it.** r is the sum of the products of the two deviations, divided so that it stays between −1 and +1:

```text
r = Σ (x − x̄)(y − ȳ)
    / √[ Σ (x − x̄)² · Σ (y − ȳ)² ]
```

```python
x, y = auto["pm"], auto["pay_k"]
dx, dy = x - x.mean(), y - y.mean()
r = (dx * dy).sum() / np.sqrt((dx**2).sum() * (dy**2).sum())
print(round(r, 4))
# 0.8926
# the same with numpy, with pandas, and on the whole book
print(round(np.corrcoef(x, y)[0, 1], 4), round(x.corr(y), 4))
print(round(loans["pm"].corr(loans["pay_k"]), 3))
# 0.8926 0.8926
# 0.904
```

```excel
=CORREL(B2:B392, C2:C392)
=PEARSON(B2:B392, C2:C392)
```

r = 0.893 for the 391 Auto loans: a strong rising pattern, the dots close to a straight line. On all 7 828 loans it is 0.904.

**When you use it.** A rough scale for |r| (a habit, not a law):

| \|r\| | in words |
|---|---|
| below 0.1 | no straight-line link |
| 0.1 – 0.3 | weak |
| 0.3 – 0.7 | moderate |
| above 0.7 | strong |

- "Do these two numbers move together, and in which direction?"
- A quick screen of which characteristics might matter before you model anything.

> ⚠️ **Watch out.** r with a yes/no column is small when the "yes" is rare. Credit score against bad (1 = bad) gives r = −0.115 on 7 615 scored loans — "weak" on the scale above — yet tomorrow the same score sorts bad loans well. For a yes/no outcome, judge the score with the tools of Days 2 and 3, not with r.

**Your turn.** What is r between `term_months` and `principal` on all 7 828 loans? Print it to 3 decimals.

```task
{"id": "w09d1-l2", "kind": "python", "starter": "# r between the term and the principal, all loans\n", "answer": 0.581, "dp": 3, "model": "print(round(loans[\"term_months\"].corr(loans[\"principal\"]), 3))\n# 0.581 — moderate: longer loans tend to be bigger loans (Auto and SME are both long and big)"}
```

### Correlation is not causation — the third variable

**What it is.** A correlation says two numbers move together. It does not say that one moves the other. A **third variable** (a **confounder**, *вмешивающаяся переменная*) can drive both. It can even make a correlation across groups point the other way from the correlation inside every group — **Simpson's paradox** (*парадокс Симпсона*).

**How to write it.** Across the book, do longer loans have bigger payments? Then look inside each product.

```python
print(round(loans["term_months"].corr(loans["pay_k"]), 3))
# 0.335
for p, g in loans.groupby("product_id"):
    print(p, round(g["term_months"].corr(g["pay_k"]), 3))
# 1 -0.51
# 2 -0.621
# 3 -0.62
# 4 -0.389
# 5 -0.537
```

| product | loans | r(term, payment) |
|---|---|---|
| all loans | 7 828 | **+0.335** |
| Micro | 2 669 | −0.510 |
| Consumer | 2 418 | −0.621 |
| BNPL | 1 569 | −0.620 |
| Auto | 391 | −0.389 |
| SME | 781 | −0.537 |

Across the book, longer loans pay more each month (+0.335). Inside every product they pay less. The confounder is the product: Auto and SME loans are both long and big, so they pull the book's correlation up.

**When you use it.**
- Before you write "X drives Y": name the third variables that could drive both, and look inside groups.
- Whenever someone acts on a correlation ("lengthen the terms and payments will rise") — here the action would do the opposite.

> ⚠️ **Watch out.** The direction can run backwards too: loans with many collection calls go bad more often, but the calls do not cause the defaults — late payment causes the calls.

**Your turn.** Sales reads r = +0.335 and proposes longer terms "to raise the monthly payments". What do you tell them?

```task
{"id": "w09d1-l3", "kind": "choice", "options": ["Lengthening a loan raises its payment — the book-wide r = +0.335 proves it", "The +0.335 comes from mixing products: big products are also long ones; inside each product a longer term means a smaller payment", "r = +0.335 is too weak to mean anything", "Within-product correlations are wrong because the groups are smaller"], "answer": 1, "explain": "The product is the confounder. Hold it fixed and the sign flips: for the same product (and the same amount), more months means smaller instalments."}
```

### r = 0 — no straight line, not no link

**What it is.** An r near 0 says there is **no straight-line pattern**. It does not prove the two numbers are unrelated: a U-shape or an arch can have r = 0. And r skips the rows where either value is missing — say how many rows it used.

**How to write it.** Sales says rich customers ask for bigger loans. Each application has a requested amount; each customer has a monthly income (838 applications belong to customers with no income on file).

```python
a = apps.merge(cust[["customer_id", "monthly_income"]], on="customer_id")
a = a.dropna(subset=["monthly_income"])
print(len(a), round(a["monthly_income"].corr(a["requested_amount"]), 3))
# 13162 0.002
# a perfect curve can still give r = 0
u = np.arange(-3, 4)
print(np.corrcoef(u, u**2)[0, 1])
# 0.0
```

r = 0.002 on 13 162 applications: the requested amount does not rise with income at all. The second print is the warning: y = x² is a perfect relationship, yet its r is 0.0, because the left half falls and the right half rises.

**When you use it.**
- To test a story ("rich customers ask for more"): on our data, no.
- Always next to a scatter plot — the picture shows a curve that r misses.

> ⚠️ **Watch out.** "r = 0, so income does not matter" is too strong. It says only that the amount does not rise with income in a straight line. Income can still matter for whether a loan is repaid — a different question.

**Your turn.** Which sentence can you write in Nilufar's note?

```task
{"id": "w09d1-l4", "kind": "choice", "options": ["Income and the requested amount are independent — proven", "On 13 162 applications with an income, the amount does not rise or fall with income in a straight line; the scatter could still hide a curve, and income may still matter for repayment", "Income should be dropped from every model", "r is wrong because 838 applications have no income"], "answer": 1, "explain": "r = 0 rules out a straight-line link only. Say the row count, look at the scatter, and keep 'does it predict repayment?' as a separate question."}
```

### Spearman's rank correlation — for skewed data and outliers

**What it is.** **Spearman's correlation** ρ (*коэффициент ранговой корреляции Спирмена*) is Pearson's r computed on the **ranks** (1st, 2nd, 3rd…) instead of the values. It measures whether y keeps rising (or keeps falling) as x rises — a **monotonic** pattern, straight or curved. One huge value is just "the largest rank", so it cannot dominate.

**How to write it.** `x.corr(y, method="spearman")`, or `stats.spearmanr(x, y)`. Principal is very skewed (skewness 2.9: many small loans, a few huge ones).

```python
x, y = loans["term_months"], loans["principal"]
print(round(x.corr(y), 3), round(x.corr(y, method="spearman"), 3))
# 0.581 0.713
# five loans on a line, and one typo
t = pd.Series([1, 2, 3, 4, 5, 6])
v = pd.Series([1.2, 1.9, 3.1, 3.9, 5.2, 60.0])
print(round(t.corr(v), 3), t.corr(v, method="spearman"))
# 0.699 1.0
```

Term and principal: Pearson 0.581, Spearman 0.713 — the ranks see a cleaner "longer goes with bigger" than the skewed values do. In the toy, one typo (60.0) drags Pearson down to 0.699; Spearman stays at 1.0, because the order is still perfect.

**When you use it.**

| | Pearson r | Spearman ρ |
|---|---|---|
| measures | a straight line | always up (or always down) |
| uses | the values | the ranks |
| one huge value | can move it a lot | counts as one rank |
| use it for | roughly symmetric numbers | money, counts, scores, grades |

> ⚠️ **Watch out.** Spearman gives no slope: it tells you *that* y rises, not by how many soum. Excel has no SPEARMAN function: rank both columns with `RANK.AVG`, then `CORREL` the ranks.

**Your turn.** Income (skewness 1.3) against the number of loans a customer has taken: which correlation do you report first?

```task
{"id": "w09d1-l5", "kind": "choice", "options": ["Pearson — it uses the real values", "Spearman — income is a skewed money column, and a few very high incomes should not decide the answer", "Neither: correlation needs normal data", "Both give the same number on any data"], "answer": 1, "explain": "Money columns are skewed; ranks stop a handful of very large values from steering the coefficient. Report Pearson next to it if the reader expects it."}
```

### The correlation matrix — every pair at once

**What it is.** A **correlation matrix** (*корреляционная матрица*) is a table of r for every pair of columns. The diagonal is 1 (each column with itself); the table is symmetric.

**How to write it.** `df[cols].corr()` (add `method="spearman"` for ranks).

```python
cols = ["principal", "term_months", "monthly_payment"]
loans[cols].corr().round(3)
```

| | principal | term | payment |
|---|---|---|---|
| principal | 1 | 0.581 | 0.904 |
| term | 0.581 | 1 | 0.335 |
| payment | 0.904 | 0.335 | 1 |

(term = `term_months`, payment = `monthly_payment`.) The payment follows the principal most closely (0.904); the term is linked to both, more loosely.

**When you use it.**
- The first look at a new table of characteristics, before a model.
- To catch two columns that say the same thing: in the next box, the requested amount and the disbursed principal.

```python
m = loans.merge(apps[["application_id", "requested_amount"]], on="application_id")
print(round(m["requested_amount"].corr(m["principal"]), 3))
# 1.0
```

> ⚠️ **Watch out.** An r of 1.000 between two columns usually means one number stored twice (here every loan was paid out exactly as requested). Keep one of them: two copies in one model make its coefficients meaningless (the regression subsections below).

**Your turn.** In the 3 × 3 matrix, which pair has the weakest straight-line link?

```task
{"id": "w09d1-l6", "kind": "choice", "options": ["principal and monthly_payment (0.904)", "principal and term_months (0.581)", "term_months and monthly_payment (0.335)", "Every pair is equally strong"], "answer": 2, "explain": "0.335 is the smallest off-diagonal value — and the Simpson subsection showed it is a mix of products, not a real 'longer means bigger payment' effect."}
```

### The least-squares line — slope and intercept

**What it is.** A **regression line** (*линия регрессии*) ŷ = a + b·x turns the pattern into a rule. The **slope** b (*наклон*) is how much y changes when x grows by one unit. The **intercept** a (*свободный член*) is ŷ at x = 0. **Least squares** (*метод наименьших квадратов*) picks the a and b that make the sum of squared vertical gaps Σ (y − ŷ)² as small as possible.

**How to write it.** Two lines of arithmetic: b = r · s_y / s_x and a = ȳ − b·x̄ (s = standard deviation).

```python
x, y = auto["pm"], auto["pay_k"]
b = x.corr(y) * y.std() / x.std()
a = y.mean() - b * x.mean()
print(round(b, 2), round(a, 1))
# 41.49 -12.1
# the payment of a 200 m Auto loan, by the line
print(round(a + b * 200))
# 8286
```

b = 41.49: each extra 1 m soum of principal adds 41 490 soum to the monthly payment. a = −12.1 thousand soum is the "payment of a 0-soum car loan" — no such loan exists (Auto loans start at 50 m), so the intercept only places the line. A 200 m Auto loan: about 8.29 m soum a month.

**When you use it.**
- "How much does y move when x moves by one unit?" — the slope, with its units.
- A quick rule of thumb from history: payment ≈ a + b × amount.

> ⚠️ **Watch out.** Always say the slope's units. Here: thousand soum of payment per 1 m soum of principal. The same line in plain soum has b = 0.0415 — the number changes, the line does not.

**Your turn.** With a = −12.1 and b = 41.49 (thousand soum per 1 m), what monthly payment does the line give for a 300 m Auto loan, in thousand soum?

```task
{"id": "w09d1-l7", "kind": "number", "answer": 12435, "dp": 0, "unit": "thousand soum", "hint": "ŷ = a + b × 300.", "model": "−12.1 + 41.49 × 300 = 12 434.9 ≈ 12 435 thousand soum, about 12.4 m soum a month."}
```

### Fitting it — numpy, scipy and Excel

**What it is.** Three tools that give the same least-squares line: `np.polyfit` (a polynomial of degree 1), `scipy.stats.linregress` (the line plus r, the slope's standard error and its p-value), and Excel's `SLOPE`, `INTERCEPT`, `RSQ` and `LINEST`.

**How to write it.**

```python
b, a = np.polyfit(auto["pm"], auto["pay_k"], 1)
print(round(b, 2), round(a, 1))
# 41.49 -12.1
fit = stats.linregress(auto["pm"], auto["pay_k"])
print(round(fit.slope, 2), round(fit.intercept, 1), round(fit.rvalue, 4))
# 41.49 -12.1 0.8926
# the slope's standard error; is the slope surely not 0?
print(round(fit.stderr, 2), fit.pvalue < 0.001)
# 1.06 True
```

```excel
=SLOPE(C2:C392, B2:B392)
=INTERCEPT(C2:C392, B2:B392)
=RSQ(C2:C392, B2:B392)
=LINEST(C2:C392, B2:B392, TRUE, TRUE)
```

Column B is the principal (x), column C the payment (y). For a chart: select both columns → Insert → Scatter; right-click a dot → **Add Trendline** → Linear → tick "Display Equation" and "Display R-squared value".

The three tools agree: slope 41.49, intercept −12.1. The slope's standard error is 1.06, so a 95 % interval is about 41.49 ± 2 × 1.06 = 39.4 to 43.6 — a slope this far from 0 is not luck (the p-value is far below 0.001).

**When you use it.**
- `polyfit` for the two numbers; `linregress` when you also want r and the uncertainty; Excel for a sheet a manager will open.
- `LINEST(…, TRUE, TRUE)` returns the full table (slope, intercept, their standard errors, R²) as an array.

> ⚠️ **Watch out.** The argument order differs. numpy and scipy take **x first**: `polyfit(x, y, 1)`. Excel takes **y first**: `SLOPE(known_y's, known_x's)`. Swap them and you get the slope of x on y — a different line.

**Your turn.**

```game
{"type": "bug", "id": "w09d1-g1", "title": "The line drawn the wrong way round", "q": "Nilufar wants the payment (y) explained by the principal (x). One line fits the wrong regression.", "code": "x = auto[\"pm\"]\ny = auto[\"pay_k\"]\nb, a = np.polyfit(y, x, 1)\nprint(round(b, 4), round(a, 1))", "answer": [2], "why": "polyfit takes x first: np.polyfit(x, y, 1). polyfit(y, x, 1) regresses the principal on the payment and returns 0.0192 m per thousand soum — not the inverse of 41.49, because least squares on x minimises a different set of gaps."}
```

### R² — the share of the spread the line explains

**What it is.** **R²** (the **coefficient of determination**, *коэффициент детерминации*) is the share of the variation of y that the line accounts for: R² = 1 − SS_res / SS_tot, where SS_res = Σ (y − ŷ)² is what is left after the line and SS_tot = Σ (y − ȳ)² is the variation around the plain mean. It runs from 0 (the line is no better than the mean) to 1 (every dot on the line). With one x, R² = r².

**How to write it.**

```python
yhat = a + b * auto["pm"]
ss_res = ((auto["pay_k"] - yhat) ** 2).sum()
ss_tot = ((auto["pay_k"] - auto["pay_k"].mean()) ** 2).sum()
print(round(1 - ss_res / ss_tot, 4), round(fit.rvalue ** 2, 4))
# 0.7967 0.7967
```

R² = 0.797: the principal alone explains 79.7 % of the spread of Auto payments. The other 20.3 % is mostly the term — the next subsections find it.

**When you use it.**
- To compare models of the **same** y on the **same** rows: "adding the term lifts R² from 0.797 to 0.961".
- To say how much of the story one number tells.

> ⚠️ **Watch out.** A high R² does not mean the line is the right shape (the residual plot says that), nor that x causes y. Adding any column never lowers R², even a column of noise — compare models with **adjusted R²** (`m.rsquared_adj` in statsmodels), which charges for each extra column.

**Your turn.** For Micro loans, r between principal and payment is 0.8156. What share of the spread of Micro payments does the principal explain, in %, to 1 decimal?

```task
{"id": "w09d1-l9", "kind": "number", "answer": 66.5, "dp": 1, "unit": "%", "hint": "With one x, R² = r².", "model": "0.8156² = 0.665 → 66.5 %. The rest is mostly the term again: Micro loans run 3 or 6 months."}
```

### Residuals and the residual plot

**What it is.** A **residual** (*остаток*) is what the line misses for one case: e = y − ŷ. Above the line it is positive, below it negative. A **residual plot** puts the residuals against x (or against ŷ). A good fit leaves a shapeless band around 0. A pattern — a curve, a fan, separate groups — means the model is missing something.

**How to write it.**

```python
auto["res"] = auto["pay_k"] - (a + b * auto["pm"])
plt.scatter(auto["pm"], auto["res"], c=auto["term_months"], s=10)
plt.axhline(0, color="grey")
auto.groupby("term_months")["res"].mean().round(0)
```

| term | loans | average residual, thousand soum |
|---|---|---|
| 24 months | 131 | +2 480 |
| 36 months | 123 | −467 |
| 48 months | 137 | −1 952 |

The residuals average 0 over all 391 loans, but not by term: 24-month loans sit 2.48 m soum above the line on average, 48-month loans 1.95 m below. The line is missing the term.

**When you use it.**
- After every fit, before you trust R² or a prediction.
- To decide what to add next: residuals that differ by group point to that group.

> ⚠️ **Watch out.** The residuals of a least-squares line always average exactly 0 over the rows it was fitted on, so "the average error is 0" proves nothing. Look at the shape, and at the averages by group.

**Your turn.** In the residual plot of the Auto line, the three term groups spread further apart as the principal grows. What pattern is that?

```task
{"id": "w09d1-l10", "kind": "choice", "options": ["A shapeless band around 0 — the line is fine", "Residuals that fan out: small around small loans, large around large loans — the error grows with the amount", "All residuals are positive", "The residual plot is the same as the scatter plot"], "answer": 1, "explain": "A fan says the gap between the groups grows with x: a payment is principal × a term factor, so terms differ by a share of the amount, not by a fixed sum. A fixed shift per term will not fix it completely — the worked example shows what does."}
```

### Outliers and leverage

**Before you read.** Guess first, then play with it — the explanation below will make more sense.

```explore
{"id": "w09d1-x1", "type": "regress", "title": "Drag a loan, watch the line", "predict": {"q": "Two Auto loans get the same typo: the payment entered **12 m soum** too high. One is a **220 m** loan (the middle of the range), the other a **380 m** loan (the far right). Which typo moves the slope more?", "options": ["The 220 m loan's", "The 380 m loan's", "Both the same — the error is the same 12 m", "Neither — 25 loans outvote one"], "answer": 1, "why": "The typo on the 220 m loan leaves the slope where it was (+0.05 %): that loan sits at the average principal. The same typo at 380 m tilts the line by 18 %. A point far from the average x has leverage — it works the line like a long lever."}, "points": [[312.2, 16.51, 24], [161.2, 8.52, 24], [172.1, 6.75, 36], [65.9, 2.59, 36], [243.1, 12.85, 24], [249.6, 13.2, 24], [308.4, 10.05, 48], [128.6, 5.05, 36], [221.5, 7.22, 48], [289.9, 15.33, 24], [249.1, 8.12, 48], [50.3, 1.97, 36], [255.8, 10.03, 36], [77.4, 2.52, 48], [140.3, 7.42, 24], [380.6, 12.41, 48], [144.0, 5.65, 36], [202.4, 7.94, 36], [335.7, 17.75, 24], [211.8, 11.2, 24], [354.8, 18.76, 24], [128.5, 5.04, 36], [197.1, 10.42, 24], [379.6, 20.07, 24], [267.7, 10.5, 36]], "typo": [395, 2.0], "xmax": 420, "ymax": 30, "challenges": [{"id": "c1", "text": "Drag **one** loan until R² falls below **0.5**: one wrong number, and the line explains far less.", "when": {"moved": ["=", 1], "added": ["=", 0], "r2": ["<", 0.5]}}, {"id": "c2", "text": "**Start again**, then drag a loan from the **middle** (200–250 m) up or down by **12 m** or more: the slope moves by **under 5 %**.", "when": {"moved": ["=", 1], "x": ["between", 195, 255], "shift": [">=", 12], "slopeChg": ["<", 0.05]}}, {"id": "c3", "text": "**Start again**, then drag one of the two loans at the **far right** (about 380 m) by **12 m** or more: the slope moves by **over 15 %**.", "when": {"moved": ["=", 1], "x": [">=", 370], "shift": [">=", 12], "slopeChg": [">", 0.15]}}, {"id": "c4", "text": "**Start again**, add the **typo loan** (395 m, payment 2.0 m: typed ten times too small), then drag **it** onto the line until R² is back **above 0.82**. A far point that sits on the line does no harm.", "when": {"added": ["=", 1], "moved": ["=", 0], "r2": [">", 0.82]}}]}
```

**What it is.** An **outlier** (*выброс*) is a case far from the line: a large residual. **Leverage** (*рычаг*) is how far a case's x is from the average x: h = 1/n + (x − x̄)² / Σ (x − x̄)². A high-leverage case can pull the line towards itself. An **influential** case is one whose removal changes the slope a lot: usually an outlier **with** high leverage.

**How to write it.** The leverage of each Auto loan, then a typo on the loan with the largest principal.

```python
x = auto["pm"]
lev = 1 / len(x) + (x - x.mean()) ** 2 / ((x - x.mean()) ** 2).sum()
print(round(lev.max(), 4), round(lev.min(), 4))
# 0.0116 0.0026
# the biggest loan's payment typed ten times too small
y2 = auto["pay_k"].copy()
i = x.idxmax()
y2[i] = y2[i] / 10
print(round(stats.linregress(x, y2).slope, 2))
# 40.55
```

The loan of 399.5 m has 4.5 times the leverage of a loan at the average. Its typo moves the slope from 41.49 to 40.55, by 2.3 %. In the 25-loan explorer the same kind of point moved it by 18 %: leverage matters most when there are few cases.

**When you use it.**
- Before you trust a line from a small sample — a branch, a month, a new product.
- When a slope looks odd: find the high-leverage cases (a common flag is h > 2 × (number of coefficients) / n) and check their raw data.

> ⚠️ **Watch out.** Do not delete a point because it spoils the fit. Find out what it is: a typo (fix it), another product mixed in (filter it), or a real case (keep it). Fit with and without it, and report both.

**Your turn.** Which of these four Auto loans changes the slope most if you delete it?

```task
{"id": "w09d1-l11", "kind": "choice", "options": ["The 50 m loan with a normal payment", "The 400 m loan whose payment is 10 times too small", "The 220 m loan whose payment is 10 times too small", "A 220 m loan with a normal payment"], "answer": 1, "explain": "Influence needs both: far from the line (an outlier) and far from the average principal (leverage). The 220 m typo is an outlier with almost no leverage; the 400 m typo has both."}
```

### Several predictors — payment ~ principal + term

**What it is.** **Multiple regression** (*множественная регрессия*) fits ŷ = a + b₁·x₁ + b₂·x₂ + … by least squares. Each coefficient is the change in y for one unit of its x **with the other x's held fixed**. That is what a single correlation cannot do: it separates the principal's effect from the term's.

**How to write it.** A table X with a column of 1s (the intercept) and one column per predictor; `np.linalg.lstsq` solves it.

```python
X = np.column_stack([np.ones(len(auto)), auto["pm"], auto["term_months"]])
coef, *_ = np.linalg.lstsq(X, auto["pay_k"], rcond=None)
print(coef.round(2))
# [6581.94   41.83 -184.3 ]
yhat2 = X @ coef
print(round(1 - ((auto["pay_k"] - yhat2) ** 2).sum() / ss_tot, 3))
# 0.961
```

The same model in statsmodels (it loads one more package on its first run) prints the full table — coefficients, standard errors, p-values, R² and adjusted R²:

```python
import statsmodels.formula.api as smf
m = smf.ols("pay_k ~ pm + term_months", data=auto).fit()
print(round(m.rsquared, 3), round(m.rsquared_adj, 3))
# 0.961 0.961
```

payment ≈ 6 582 + 41.83 × principal − 184.3 × term (thousand soum, principal in m, term in months). With the term held fixed, 1 m more principal adds 41 830 soum. With the principal held fixed, one month longer lowers the payment by 184 300 soum. R² rises from 0.797 to 0.961.

**When you use it.**
- When two predictors are linked to each other (here the product mix links term and principal across the book) and you want each one's own effect.
- To raise R² honestly: add a predictor the residual plot asked for.

> ⚠️ **Watch out.** Two predictors that carry the same number (requested amount and principal, r = 1.000) cannot be separated: the coefficients become huge, unstable or arbitrary (**multicollinearity**, *мультиколлинеарность*). Drop one. And the model above is still a straight-line approximation of a curved formula — the residuals by size still fan out.

**Your turn.** With coefficients 6 581.94, 41.83 and −184.30, what monthly payment does the model give for a 200 m Auto loan over 48 months, in thousand soum?

```task
{"id": "w09d1-l12", "kind": "number", "answer": 6102, "dp": 0, "unit": "thousand soum", "hint": "6 581.94 + 41.83 × 200 − 184.30 × 48.", "model": "6 581.94 + 8 366 − 8 846.4 = 6 101.5 ≈ 6 102 thousand soum (6 102 with the unrounded coefficients too). The true annuity at 24 % over 48 months is 6.52 m — the straight-line model is about 0.4 m low here."}
```

### A product dummy — a yes/no column in the model

**What it is.** A **dummy variable** (*фиктивная переменная*) is a 0/1 column: 1 for "this group", 0 for the others. Its coefficient is the shift in y between the group and the **reference** group (the one coded 0), with the other predictors held fixed. A column with k groups needs k − 1 dummies.

**How to write it.** Micro loans (42 % interest) against BNPL loans (0 %), on the 3- and 6-month loans both products offer.

```python
mb = loans[loans["product_id"].isin([1, 3]) & loans["term_months"].isin([3, 6])].copy()
mb["micro"] = (mb["product_id"] == 1).astype(int)
X = np.column_stack([np.ones(len(mb)), mb["pm"], mb["term_months"], mb["micro"]])
coef, *_ = np.linalg.lstsq(X, mb["pay_k"], rcond=None)
print(len(mb), coef.round(1))
# 3719 [ 738.9  263.7 -174.2   67.2]
```

On 3 719 loans: a Micro loan pays 67 200 soum a month more than a BNPL loan of the same amount and term — the price of its interest. BNPL is the reference group (micro = 0).

**When you use it.**
- Product, channel, region, grade: any category in a regression.
- `pd.get_dummies(df["channel"], drop_first=True)` makes k − 1 dummy columns at once.

> ⚠️ **Watch out.** k dummies for k groups plus an intercept is the **dummy trap**: the dummies add up to the column of 1s, and the model cannot be solved uniquely. Leave one group out — it becomes the reference. And a dummy shifts the line by a fixed amount; here the true gap grows with the amount (the interest is a share), which needs an interaction term (Depth).

**Your turn.** A model of the payment on all five products: how many product dummies does it need?

```task
{"id": "w09d1-l13", "kind": "choice", "options": ["5 — one per product", "4 — one product is the reference group", "1 — a single column with the codes 1 to 5", "2 — products and the intercept"], "answer": 1, "explain": "k groups → k − 1 dummies; the left-out product is the reference, and every dummy's coefficient is the gap to it. A single column of codes 1–5 would claim that SME (5) is 'five times' Micro (1)."}
```

### Prediction against explanation, and the extrapolation trap

**What it is.** A model can serve two jobs. **Prediction** (*прогноз*): a good ŷ for a new case like the ones it was fitted on. **Explanation** (*объяснение*): what each coefficient says about how the world works. A model can predict well and explain badly (the straight line through a curved annuity), or the other way round. **Extrapolation** (*экстраполяция*) — predicting outside the range of x the model has seen — is where both break.

**How to write it.** The Micro line, asked about a 300 m loan:

```python
micro = loans[loans["product_id"] == 1]
b1, a1 = np.polyfit(micro["pm"], micro["pay_k"], 1)
print(micro["pm"].min(), micro["pm"].max())
# 0.5 4.99
print(round(a1 + b1 * 300))
# 81475
sme300 = loans[(loans["product_id"] == 5) & loans["pm"].between(280, 320)]
print(round(sme300["pay_k"].median()))
# 16012
```

The Micro line was fitted on loans of 0.5 to 5 m soum. Asked about 300 m, it says 81.5 m soum a month; real SME loans of about 300 m pay a median of 16.0 m. Outside its range the line is not a rule, it is a guess.

**When you use it.**
- Before every prediction: is the new case inside the data's range — every predictor, and the combination (a 10 m loan over 48 months exists in no product)?
- When a manager reads a coefficient as a lever ("raise x by 1 and y rises by b"): only safe if the data come from changing x, which observational data rarely do.

> ⚠️ **Watch out.** A high R² inside the range says nothing outside it. Say the range next to every rule: "for Auto loans of 50–400 m over 24–48 months".

**Your turn.** The Auto model (R² 0.961) is offered as a calculator for a 10 m loan over 6 months. What do you say?

```task
{"id": "w09d1-l14", "kind": "choice", "options": ["Use it — R² is 0.961", "Do not: 10 m and 6 months are outside the Auto data (50–400 m, 24–48 months); the model would say 5.9 m a month for a 10 m loan", "Use it, but round the answer", "Add 1.96 standard errors and use it"], "answer": 1, "explain": "6 581.94 + 41.83 × 10 − 184.30 × 6 = 5 894 thousand soum a month for a 10 m loan — more than half the principal every month. The model never saw such a loan; R² inside the range does not carry outside it."}
```

### Putting it together

The whole chain on one picture, in the order you will use it at work.

| step | the tool | on Auto loans |
|---|---|---|
| 1 | scatter plot | three fans, one per term |
| 2 | r, Spearman | 0.893; Spearman 0.921 |
| 3 | a third variable? | the product across the book; the term inside Auto |
| 4 | least-squares line | 41.49 thousand per 1 m, intercept meaningless |
| 5 | R² | 0.797 |
| 6 | residual plot | +2.48 m (24 months) to −1.95 m (48) |
| 7 | leverage | largest 0.0116, no single loan decides |
| 8 | add the term | R² 0.961; −184 300 soum per month of term |
| 9 | predict | only inside 50–400 m and 24–48 months |

**The workflow in order.**

```game
{"type": "order", "id": "w09d1-g2", "title": "From two columns to a rule", "items": ["Draw the scatter plot", "Compute r (and Spearman for money columns)", "Ask what third variable could drive both", "Fit the least-squares line and read the slope in its units", "Read R²", "Draw the residual plot", "Check the high-leverage points", "Add the predictor the residuals ask for", "Predict only inside the data's range"]}
```

**Words of the day.**

```game
{"type": "match", "id": "w09d1-g3", "title": "Words of the day", "pairs": [["Pearson's r", "how close the dots lie to a straight line, from −1 to +1"], ["Spearman's ρ", "Pearson's r on the ranks: always up or always down"], ["Confounder", "a third variable that drives both x and y"], ["Slope", "the change in y for one unit of x"], ["R²", "the share of the spread of y the model explains"], ["Residual", "y minus the model's ŷ for one case"], ["Leverage", "how far a case's x is from the average x"], ["Extrapolation", "predicting outside the range the model has seen"]]}
```

### Depth (optional)

- **Why the fans?** The annuity formula: payment = principal × r / (1 − (1 + r)^−n), with r the monthly rate and n the term. For one product and one term the factor is fixed, so payment is an exact line through 0. Across terms the factor changes, so the principal's effect *multiplies* with the term. A model that adds them can only approximate it.
- **Interactions.** `smf.ols("pay_k ~ pm * C(term_months)", data=auto)` gives each term its own slope (`pm:C(term_months)[T.36]` is the change in slope against 24 months). On the Micro–BNPL data, `pay_k ~ pm + pm:micro` with one term fixed recovers the interest exactly: R² = 1.000.
- **Logs.** `np.log(pay) ~ np.log(principal) + np.log(term)` turns a product into a sum; the principal's coefficient comes out close to 1 (the payment is proportional to the principal).
- **The slope's interval.** `fit.slope ± t₀.₉₇₅ · fit.stderr` (Week 6's t interval) — and the **prediction interval** for one new loan is much wider than the interval for the line itself, because one loan scatters around the line.
- *Russian terms:* диаграмма рассеяния = scatter plot, коэффициент корреляции Пирсона = Pearson's r, ранговая корреляция Спирмена = Spearman's rank correlation, ложная корреляция = spurious correlation, вмешивающаяся (скрытая) переменная = confounder, парадокс Симпсона = Simpson's paradox, линейная регрессия = linear regression, метод наименьших квадратов (МНК) = least squares, наклон / свободный член = slope / intercept, коэффициент детерминации R² = R², остатки = residuals, выброс = outlier, точка с большим рычагом = high-leverage point, мультиколлинеарность = multicollinearity, фиктивная переменная = dummy variable, экстраполяция = extrapolation.

---

## 2. Worked example — the SME payment rule (15 min)

*"The SME desk wants a quick estimate of the monthly payment from the amount and the term, before the pricing system runs."* 781 SME loans: 20–600 m soum, 12, 24 or 36 months, all at 26 %.

**Step 1 — the scatter plot.** Payment against principal: a rising cloud split into three fans, the 12-month loans on top.

**Step 2 — r and Spearman.** r = 0.778, Spearman 0.843. Strong, and the ranks agree more than the values (the principal is skewed).

**Step 3 — a third variable?** The term is the obvious one: within SME, the term does not depend on the amount (r between them −0.002), so it will not bias the slope, but it adds spread.

**Step 4 — the least-squares line.** `stats.linregress(sme.pm, sme.pay_k)`: slope **62.08** thousand soum per 1 m, intercept 238.3 thousand. A 300 m loan: 238.3 + 62.08 × 300 = 18 861 thousand, 18.9 m a month.

**Step 5 — R².** 0.778² = **0.605**: the principal alone explains 60 % of the spread.

**Step 6 — the residual plot.** The average residual by term: 12 months **+10 192**, 24 months **−2 725**, 36 months **−7 011** thousand soum. The line is far off for every term, and the gaps fan out with the amount.

**Step 7 — leverage.** The largest leverage is 0.0052 among 781 loans: no single loan steers the line.

**Step 8 — several predictors.** `pay_k ~ pm + term_months`: 17 588 + 62.00 × principal − 712.3 × term, R² **0.891**. For a 300 m loan over 24 months: 19 092 thousand. The 22 real SME loans of 280–320 m over 24 months pay 15 167 to 17 029 thousand (median 15 874). The two-predictor model is still about 3 m soum too high: the fan (Step 6) says the term multiplies, it does not add.

**Step 9 — fit inside one term.** Only the 246 loans of 24 months: slope **53.87** thousand per 1 m, intercept 0.0, **R² = 1.000**. Inside one product and one term the payment is an exact straight line through 0: the regression has found the annuity factor (26 % a year, 24 months → 53.87 thousand soum per 1 m soum). 300 m over 24 months → **16 162** thousand soum.

**Step 10 — prediction, not extrapolation.** *"For SME loans of 20–600 m: payment ≈ principal × 95.53 thousand per 1 m over 12 months, 53.87 over 24, 40.29 over 36. A 300 m loan over 24 months pays 16.2 m soum a month. Outside 20–600 m, or for another term, ask pricing — the rule has not seen those loans."*

What the steps taught: the correlation (0.778) and even R² 0.891 looked good, but the residual plot sent us to the right model.

---

## 3. Practice (50 min)

Every task has its own answer box, and the questions follow the order of section 1 — the concept is named in italics. The Python boxes run in the same session as section 1, so `np`, `pd`, `plt`, `stats`, the frames `loans`, `apps`, `cust` and `auto`, and the columns `pm` (principal, m soum), `pay_k` (payment, thousand soum) and `bad` are ready — if you came straight here, press ▶ Run on the first box of section 1. Answer, check, then open the fold for the full working. (The notebook `data/python/week9/day1_starter.ipynb` holds the same tools; you need it for the homework.)

**P1.** *(scatter plot)* BNPL loans carry 0 % interest, so the payment is the principal divided by the term (3, 6 or 12 months). What does their scatter of payment against principal look like?

```task
{"id": "w09d1-p1", "kind": "choice", "options": ["One round cloud", "Three straight lines from 0, the steepest for 3 months (a third of the principal each month)", "One straight line, because there is no interest", "A U-shape"], "answer": 1, "explain": "payment = principal ÷ term: three lines through 0 with slopes 1/3, 1/6 and 1/12 (333, 167 and 83 thousand soum per 1 m). The scatter shows three exact rules; one line through all of them cannot."}
```

<details><summary>Answer</summary>

Three straight lines from the origin, one per term: 333 thousand soum per 1 m over 3 months, 167 over 6, 83 over 12. Mixing the three in one regression gives a moderate r (next task), although each group follows its rule exactly.

</details>

**P2.** *(Pearson's r)* What is r between the principal and the payment for the 1 569 BNPL loans, to 3 decimals?

```task
{"id": "w09d1-p2", "kind": "python", "starter": "bnpl = loans[loans[\"product_id\"] == 3]\n# r between pm and pay_k, rounded to 3 decimals\n", "answer": 0.662, "dp": 3, "model": "bnpl = loans[loans[\"product_id\"] == 3]\nprint(round(bnpl[\"pm\"].corr(bnpl[\"pay_k\"]), 3))\n# 0.662 — moderate, although every loan follows an exact rule: three lines mixed make one loose cloud"}
```

<details><summary>Answer</summary>

```python
bnpl = loans[loans["product_id"] == 3]
print(round(bnpl["pm"].corr(bnpl["pay_k"]), 3))
# 0.662
```
**0.662**: moderate on the rough scale. A modest r does not mean a weak rule — here it means three exact rules mixed together.

</details>

**P3.** *(correlation is not causation)* Loans with more collection calls go bad more often. A manager proposes fewer calls "to cut defaults". What is wrong?

```task
{"id": "w09d1-p3", "kind": "choice", "options": ["Nothing — fewer calls, fewer defaults", "The arrow runs the other way: late payment causes the calls; cutting calls would leave the late loans alone and probably raise losses", "The correlation is too weak", "Calls and defaults are independent"], "answer": 1, "explain": "Reverse causation: the calls are a response to arrears. A correlation never tells you which way the arrow points; the timeline and the process do."}
```

<details><summary>Answer</summary>

The calls follow arrears: a loan is called because it is late. The correlation is real, the causal reading is backwards. The test of a lever is an experiment (Week 7: call some late loans and not others, at random), not a correlation.

</details>

**P4.** *(r = 0)* Join the loans to their customers' monthly income. On the loans with an income, what is r between income and principal, to 3 decimals? Print the row count too.

```task
{"id": "w09d1-p4", "kind": "python", "starter": "li = loans.merge(cust[[\"customer_id\", \"monthly_income\"]], on=\"customer_id\")\n# keep the rows with an income, then print their count and r(income, principal) to 3 decimals\n", "answer": 0.004, "dp": 3, "model": "li = loans.merge(cust[[\"customer_id\", \"monthly_income\"]], on=\"customer_id\")\nli = li.dropna(subset=[\"monthly_income\"])\nprint(len(li), round(li[\"monthly_income\"].corr(li[\"principal\"]), 3))\n# 7362 0.004 — no straight-line link on 7 362 loans"}
```

<details><summary>Answer</summary>

```python
li = loans.merge(cust[["customer_id", "monthly_income"]], on="customer_id")
li = li.dropna(subset=["monthly_income"])
print(len(li), round(li["monthly_income"].corr(li["principal"]), 3))
# 7362 0.004
```
**0.004** on **7 362** loans (466 have no income on file). The disbursed amount, like the requested one, does not move with income.

</details>

**P5.** *(Spearman)* For the BNPL loans, Spearman's correlation between principal and payment, to 3 decimals?

```task
{"id": "w09d1-p5", "kind": "python", "starter": "bnpl = loans[loans[\"product_id\"] == 3]\n# Spearman between pm and pay_k, rounded to 3 decimals\n", "answer": 0.737, "dp": 3, "model": "print(round(bnpl[\"pm\"].corr(bnpl[\"pay_k\"], method=\"spearman\"), 3))\n# 0.737, against Pearson's 0.662"}
```

<details><summary>Answer</summary>

```python
print(round(bnpl["pm"].corr(bnpl["pay_k"], method="spearman"), 3))
# 0.737
```
**0.737** against Pearson's 0.662: the order agrees more than the straight line does.

</details>

**P6.** *(correlation matrix)* In a matrix of application columns you see r = 1.000 between `requested_amount` and the loan's `principal`. What do you do before building a model?

```task
{"id": "w09d1-p6", "kind": "choice", "options": ["Use both — two strong predictors are better than one", "Keep one: they are the same number twice (every loan was paid as requested), and together they make the coefficients meaningless", "Drop both", "Average them"], "answer": 1, "explain": "r = 1.000 means one column is a copy (or a rescaling) of the other. Two copies in one regression are perfect multicollinearity."}
```

<details><summary>Answer</summary>

Keep one. With r = 1.000 the two columns carry one number; in a model together they have no unique coefficients.

</details>

**P7.** *(the least-squares line)* Micro loans: r = 0.8156, the principal's standard deviation is 1.3228 m soum, the payment's 440.51 thousand soum. What is the slope, in thousand soum per 1 m, to 1 decimal?

```task
{"id": "w09d1-p7", "kind": "number", "answer": 271.6, "dp": 1, "unit": "thousand soum per 1 m", "hint": "b = r × s_y / s_x.", "model": "0.8156 × 440.51 / 1.3228 = 271.6 thousand soum per 1 m: every extra million soum of a Micro loan adds about 272 000 soum a month (Micro loans are short: 3 or 6 months)."}
```

<details><summary>Answer</summary>

b = 0.8156 × 440.51 / 1.3228 = **271.6** thousand soum per 1 m soum. Compare Auto's 41.49: a short loan repays each million much faster.

</details>

**P8.** *(fitting it)* Fit the BNPL line with `np.polyfit`. Print the slope and the intercept to 1 decimal.

```task
{"id": "w09d1-p8", "kind": "python", "starter": "bnpl = loans[loans[\"product_id\"] == 3]\n# slope and intercept of pay_k on pm, to 1 decimal\n", "answer": 199.4, "dp": 1, "model": "b, a = np.polyfit(bnpl[\"pm\"], bnpl[\"pay_k\"], 1)\nprint(round(b, 1), round(a, 1))\n# 199.4 -11.2"}
```

<details><summary>Answer</summary>

```python
b, a = np.polyfit(bnpl["pm"], bnpl["pay_k"], 1)
print(round(b, 1), round(a, 1))
# 199.4 -11.2
```
Slope **199.4** thousand soum per 1 m — between the three true slopes (333, 167, 83), weighted by how many loans each term has.

</details>

**P9.** *(R²)* For BNPL, r = 0.662. What R², in %, to 1 decimal?

```task
{"id": "w09d1-p9", "kind": "number", "answer": 43.8, "dp": 1, "unit": "%", "hint": "R² = r² with one x.", "model": "0.662² = 0.438 → 43.8 %. The term explains most of the rest."}
```

<details><summary>Answer</summary>

0.662² = **43.8 %**. The principal alone explains less than half of the BNPL payments — the term is missing.

</details>

**P10.** *(residuals)* Residuals of the BNPL line from P8: what is the average residual of the 3-month loans, in thousand soum, to 1 decimal?

```task
{"id": "w09d1-p10", "kind": "python", "starter": "bnpl = loans[loans[\"product_id\"] == 3].copy()\nb, a = np.polyfit(bnpl[\"pm\"], bnpl[\"pay_k\"], 1)\n# residual = pay_k - (a + b * pm); then its mean by term_months\n", "answer": 583.5, "dp": 1, "model": "bnpl[\"res\"] = bnpl[\"pay_k\"] - (a + b * bnpl[\"pm\"])\nprint(bnpl.groupby(\"term_months\")[\"res\"].mean().round(1))\n# 3: 583.5, 6: -120.6, 12: -477.7"}
```

<details><summary>Answer</summary>

```python
bnpl["res"] = bnpl["pay_k"] - (a + b * bnpl["pm"])
print(bnpl.groupby("term_months")["res"].mean().round(1))
# 3: 583.5   6: -120.6   12: -477.7
```
3-month loans sit **583.5** thousand soum above the line on average, 12-month loans 477.7 below: the residuals ask for the term.

</details>

**P11.** *(leverage)* Repeat the Auto typo (the largest loan's payment divided by 10). By how many % does the slope change, to 1 decimal?

```task
{"id": "w09d1-p11", "kind": "python", "starter": "x = auto[\"pm\"]\ny2 = auto[\"pay_k\"].copy()\ni = x.idxmax()\ny2[i] = y2[i] / 10\n# slope with the typo, slope without; print the change in %\n", "answer": -2.3, "dp": 1, "model": "s1 = stats.linregress(x, y2).slope\ns0 = stats.linregress(x, auto[\"pay_k\"]).slope\nprint(round((s1 / s0 - 1) * 100, 1))\n# -2.3"}
```

<details><summary>Answer</summary>

```python
s1 = stats.linregress(x, y2).slope
s0 = stats.linregress(x, auto["pay_k"]).slope
print(round((s1 / s0 - 1) * 100, 1))
# -2.3
```
**−2.3 %**: among 391 loans even the highest-leverage one moves the slope only a little. In a sample of 25 the same typo moved it by about 18 %.

</details>

**P12.** *(several predictors)* For BNPL, fit payment ~ principal + term with `np.linalg.lstsq`. What is the term's coefficient, in thousand soum per month, to 1 decimal?

```task
{"id": "w09d1-p12", "kind": "python", "starter": "bnpl = loans[loans[\"product_id\"] == 3]\n# X = 1s, pm, term_months; then lstsq; print the coefficients rounded to 1 decimal\n", "answer": -109.9, "dp": 1, "model": "X = np.column_stack([np.ones(len(bnpl)), bnpl[\"pm\"], bnpl[\"term_months\"]])\ncoef, *_ = np.linalg.lstsq(X, bnpl[\"pay_k\"], rcond=None)\nprint(coef.round(1))\n# [ 757.   198.9 -109.9] — R² rises from 0.438 to 0.820"}
```

<details><summary>Answer</summary>

```python
X = np.column_stack([np.ones(len(bnpl)), bnpl["pm"], bnpl["term_months"]])
coef, *_ = np.linalg.lstsq(X, bnpl["pay_k"], rcond=None)
print(coef.round(1))
# [ 757.   198.9 -109.9]
```
**−109.9**: one month longer, 109 900 soum less a month for the same amount. R² goes from 0.438 to 0.820.

</details>

**P13.** *(a dummy)* Only the **6-month** Micro and BNPL loans: fit payment ~ principal + micro (micro = 1 for Micro). What is the micro coefficient, in thousand soum, to 1 decimal?

```task
{"id": "w09d1-p13", "kind": "python", "starter": "m6 = loans[loans[\"product_id\"].isin([1, 3]) & (loans[\"term_months\"] == 6)].copy()\nm6[\"micro\"] = (m6[\"product_id\"] == 1).astype(int)\n# X = 1s, pm, micro; lstsq; print the coefficients to 1 decimal\n", "answer": 70.3, "dp": 1, "model": "X = np.column_stack([np.ones(len(m6)), m6[\"pm\"], m6[\"micro\"]])\ncoef, *_ = np.linalg.lstsq(X, m6[\"pay_k\"], rcond=None)\nprint(len(m6), coef.round(1))\n# 1852 [-40.6 176.8  70.3]"}
```

<details><summary>Answer</summary>

```python
X = np.column_stack([np.ones(len(m6)), m6["pm"], m6["micro"]])
coef, *_ = np.linalg.lstsq(X, m6["pay_k"], rcond=None)
print(len(m6), coef.round(1))
# 1852 [-40.6 176.8  70.3]
```
On 1 852 six-month loans a Micro loan pays **70.3** thousand soum a month more than a BNPL loan of the same amount. On a 2.7 m Micro loan (the average) that is the interest: 2.7 m × (0.1877 − 0.1667) ≈ 57 thousand — the fixed shift is an average over amounts.

</details>

**P14.** *(extrapolation)* The Micro line (slope 271.6, intercept 0.7, thousand soum per 1 m) is used to price a 50 m Consumer loan. What would it say, and should anyone use it?

```task
{"id": "w09d1-p14", "kind": "choice", "options": ["13.6 m a month — use it, R² is 0.665", "13.6 m a month — do not use it: 50 m is ten times the largest Micro loan, and a 50 m Consumer loan really pays about 2.8 m (24 months) to 9.1 m (6 months)", "0.7 m a month — the intercept", "It cannot be computed"], "answer": 1, "explain": "0.7 + 271.6 × 50 = 13 581 thousand soum. The Micro line encodes 3- and 6-month terms at 42 %; outside 0.5–5 m it is a guess, and here a bad one."}
```

<details><summary>Answer</summary>

0.7 + 271.6 × 50 = **13 581** thousand soum a month — about a quarter of the loan, every month. The Micro data stop at 5 m; the real annuity for 50 m at 30 % is about 9.1 m (6 months) down to 2.8 m (24 months). Never use a line outside its range.

</details>

### Mistakes people make

- A correlation read as a cause: "longer terms raise payments" (r = +0.335 across products; inside every product the sign is negative).
- r = 0 read as "no relationship" — a curve can have r = 0; say "no straight-line link".
- Pearson on a skewed money column without a look at Spearman or the scatter.
- `np.polyfit(y, x, 1)` or `SLOPE(x, y)` — the arguments swapped, a different line.
- A slope reported without units ("41.49" of what?) or an intercept read as a real payment.
- R² compared across different y's or different rows, or raised by adding columns of noise (use adjusted R²).
- No residual plot: R² 0.891 looked fine for SME while every term was off by millions.
- An outlier deleted because it was inconvenient, not because it was wrong.
- Two copies of one number in a model (requested amount and principal), or k dummies for k groups.
- A rule used outside the range it was fitted on.

---

## 4. Homework <span class="badge hw">HW 9.1 — Due Day 3</span>

**The Consumer payment rule.** Open `data/python/week9/day1_starter.ipynb`. Part 0 repeats today's Auto walk-through. Then five functions are stubs that raise `NotImplementedError`; under each is an assert cell. Replace each body until its assert cell runs silently. Then do the Consumer part: the line, R², the two-predictor model, the residual plot by term, one prediction, and three sentences for the affordability team in the last cell. **Kernel → Restart & Run All**, then hand in the executed notebook with the 📎 box below.

1. `pearson_r(x, y)` — by the formula, no `corr`.
2. `fit_line(x, y)` — slope and intercept from b = r · s_y / s_x.
3. `r_squared(y, y_hat)` — 1 − SS_res / SS_tot.
4. `leverage(x)` — one number per row.
5. `fit_ols(X, y)` — the coefficients of a multiple regression with `np.linalg.lstsq`.

**What the mentor checks** (this week the homework is reviewed by the mentor, with no points): all five assert cells pass after *Restart & Run All*; every function has a docstring in your words; the Consumer numbers are right; the three sentences give the rule, how well it fits, and where it must not be used.

**Check your numbers here before you hand in.**

**H1.** The Consumer line, payment (thousand soum) on principal (m soum): what is the slope, to 1 decimal?

```task
{"id": "w09d1-hw1", "kind": "number", "answer": 103.7, "dp": 1, "unit": "thousand soum per 1 m", "hint": "fit_line on the 2 418 Consumer loans (product_id 2), x = pm, y = pay_k.", "model": "103.7 thousand soum per 1 m soum (intercept −31.9): each extra million soum of a Consumer loan adds about 104 000 soum a month."}
```

**H2.** And its R², to 3 decimals?

```task
{"id": "w09d1-hw2", "kind": "number", "answer": 0.472, "dp": 3, "hint": "r² — or r_squared(y, a + b × x).", "model": "R² = 0.472 (r = 0.687): the principal alone explains under half of the spread. With the term added, R² = 0.835."}
```

**H3.** With payment ~ principal + term on the Consumer loans, what payment does the model give for a 30 m loan over 12 months, in thousand soum?

```task
{"id": "w09d1-hw3", "kind": "number", "answer": 3611, "dp": 0, "unit": "thousand soum", "hint": "fit_ols with the columns 1, pm, term_months; then 1 · c0 + 30 · c1 + 12 · c2.", "model": "2 776.6 + 101.21 × 30 − 183.51 × 12 = 3 611 thousand soum. The 46 real 12-month Consumer loans of 28–32 m pay 2 732 to 3 120 (mean 2 907): the additive model is about 0.7 m too high — the same fan as in the SME example."}
```

**H4.** Your three sentences for the affordability team (the last cell of the notebook) — write them here too.

```task
{"id": "w09d1-hw4", "kind": "free", "min": 30, "model": "For Consumer loans the payment rises by about 104 000 soum a month for every extra million soum lent, but the principal alone explains only 47 % of the spread; adding the term lifts R² to 0.84. The straight-line rule is still about 0.7 m too high for a 30 m, 12-month loan (3.61 m against about 2.9 m paid), because the term multiplies the payment rather than adding to it — a separate rule per term (or the annuity formula) is exact. Use it only for Consumer loans of 3–50 m over 6–24 months.", "rubric": ["gives the slope with its units (about 104 000 soum per extra 1 m)", "says how well it fits (R² 0.47 alone, about 0.84 with the term)", "names a weakness the residuals show (the term multiplies; the additive model misses by about 0.7 m at 30 m / 12 months)", "states the range where the rule may be used"]}
```

### 📎 Hand in here

```sqltask
{"check": "handin-W9D1", "lesson": "W9D1", "title": "HW 9.1", "why": "The affordability team will use this rule in their pre-screen, so the slope, the fit and the limits all have to be right — and the five functions come back on Day 2 and in the checkpoint.", "graded": ["all five assert cells pass after Restart & Run All", "every function has a docstring in your words", "the Consumer slope, R² and the prediction are right", "the three sentences give the rule, how well it fits and where it must not be used"], "tasks": [{"id": "day1_starter.ipynb", "file": "day1_starter.ipynb", "names": ["day1_starter.ipynb"], "upload": true, "accept": ".ipynb", "q": "Attach `day1_starter.ipynb` — what the page above asks for."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else the page lists (one more file, or a .zip of several)."}]}
```

---

## 5. Self-check

Three questions, one at a time. Wrong? The explanation points to the part of section 1 to reread.

```check
{"id": "w09d1-sc", "questions": [
  {"type": "single", "q": "Two scatters: A has r = 0.95 and slope 10 000 soum per 1 m; B has r = 0.60 and slope 400 000 soum per 1 m. Which is the stronger straight-line relationship?", "options": ["A — r measures how close the dots lie to a line", "B — its slope is forty times larger", "They are equal", "You need R² to say"], "answer": 0, "explain": "Strength is r, steepness is the slope; they are different numbers (b = r · s_y / s_x) (→ section 1, 'Pearson's correlation r')."},
  {"type": "number", "q": "A line has r = −0.7. What share of the spread of y does it explain, in %?", "answer": 49, "tol": 0.5, "explain": "R² = r² = 0.49: the sign of r drops out of R² (→ section 1, 'R²')."},
  {"type": "single", "q": "The residuals of a line average exactly 0. What does that tell you?", "options": ["The line fits well", "Nothing about the fit — least-squares residuals always average 0 on the fitted rows; look at their shape and their averages by group", "The model has no outliers", "R² is 1"], "answer": 1, "explain": "The average is 0 by construction; patterns in the residual plot (fans, curves, groups) are what tell you about the fit (→ section 1, 'Residuals')."}
]}
```

---

## 6. Company corner <span class="badge company">Affordability: payment to income</span>

Before a lender approves a loan, it asks whether the customer can carry the payment. The usual ratio is **payment-to-income** (**PTI**, *отношение платежа к доходу*): the new monthly payment divided by the customer's monthly income. Its wider cousin, **debt-to-income** (**DTI**), puts every monthly debt payment (ours and other lenders', from the credit bureau) in the numerator. Many regulators cap it; in Uzbekistan the Central Bank sets a limit on the borrower's **debt burden ratio** (*показатель долговой нагрузки*) for consumer loans — check the current rule before you quote a number.

Today's regression is the affordability team's first tool: it estimates the payment of a requested loan before pricing runs, and PTI follows.

```python
li = loans.merge(cust[["customer_id", "monthly_income"]], on="customer_id")
li = li.dropna(subset=["monthly_income"])
li["pti"] = li["monthly_payment"] / li["monthly_income"]
li.groupby("product_id")["pti"].median().round(3)
```

| product | median PTI | share above 50 % |
|---|---|---|
| Micro | 6.6 % | 0.7 % |
| Consumer | 20.5 % | 24.5 % |
| BNPL | 5.9 % | 2.3 % |
| Auto | 91 % | 67.8 % |
| SME | 151 % | 78.0 % |

Two lessons. First, the denominator must fit the loan: an SME loan is repaid from the **business's** cash flow, so the owner's personal income makes PTI meaningless (151 %). Second, in our practice data PTI does not separate the loans that went bad (r = −0.006 with bad on 7 362 loans). In a real book a rising PTI usually comes with a rising bad rate — check yours before you set a cap, and check it by product.

Match the affordability words:

```game
{"type": "match", "id": "w09d1-g4", "title": "Affordability words", "pairs": [["PTI", "the new loan's monthly payment ÷ monthly income"], ["DTI", "all monthly debt payments ÷ monthly income"], ["Debt burden cap", "a regulator's limit on what share of income can go to debt"], ["Credit bureau", "where the other lenders' debts come from"], ["Business cash flow", "what an SME loan is really repaid from"], ["Payment estimate", "today's regression, used before pricing runs"]]}
```

> 🎯 **Interview version.** *"How would you check whether a customer can afford a loan?"* — estimate the monthly payment (from the pricing engine, or a regression on past loans of the same product and term), divide by verified income (PTI) or add every other debt from the bureau (DTI), and compare with the policy cap and the regulator's limit. Then check that the ratio actually ranks risk on your own data, by product — on ours it does not.

**Say it like in an interview.** *"How would you check whether a customer can afford a loan, and what did you find on our book?"* — answer in 3–5 sentences.

```task
{"id": "w09d1-cc", "kind": "free", "min": 30, "model": "I would estimate the new loan's monthly payment — from pricing, or from a regression on past loans of the same product and term, where the payment is almost an exact line of the principal — and divide it by the customer's verified monthly income (PTI), or add every other monthly debt from the bureau (DTI), then compare it with our cap and the regulator's limit. On our book the median Consumer PTI is about 20 %, and a quarter of Consumer loans are above 50 %. For SME loans personal income is the wrong denominator: the business repays them. And on our data PTI does not separate bad loans, so I would not set a cap from it without checking a real book by product.", "rubric": ["defines PTI (or DTI) correctly", "says where the payment estimate comes from (pricing or a per-product, per-term regression)", "gives a number from our book (Consumer median about 20 %)", "says when the ratio is meaningless (SME: business income) or that it must be checked against bad rates"]}
```

Tomorrow: the outcome becomes a yes/no — good or bad — and a straight line stops working. Logistic regression turns a credit score into a probability of going bad, and the scorecard turns that probability back into points.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w09d1", "pass": 0.8, "questions": [
  {"type": "single", "q": "What does Pearson's r measure?", "options": ["How steep the line is", "How closely the dots lie to a straight line, and its direction", "Whether x causes y", "The share of y explained, in %"], "answer": 1, "explain": "r is direction and closeness to a line, from −1 to +1; steepness is the slope, and the share explained is R² (→ section 1, 'Pearson's correlation r')."},
  {"type": "single", "q": "Across all loans r(term, payment) = +0.335; inside every product it is negative. Why?", "options": ["The book-wide number is wrong", "The product is a confounder: Auto and SME loans are both long and big, so mixing products makes 'longer' look like 'bigger payment'", "Small groups always give negative r", "Payments are rounded"], "answer": 1, "explain": "Simpson's paradox: a third variable can flip a correlation between the pooled data and every group (→ section 1, 'Correlation is not causation')."},
  {"type": "number", "q": "A line has r = 0.6. What R², in %?", "answer": 36, "tol": 0.5, "explain": "R² = r² = 0.36 → 36 % (→ section 1, 'R²')."},
  {"type": "single", "q": "Principal has skewness 2.9. Term against principal: Pearson 0.581, Spearman 0.713. Which statement is right?", "options": ["Spearman is wrong because it ignores the values", "The ranks show a cleaner 'longer goes with bigger' than the skewed values; report Spearman for money columns", "Pearson is always better", "The two must be equal"], "answer": 1, "explain": "Spearman uses ranks, so a handful of huge loans cannot drag it; it measures a monotonic pattern (→ section 1, 'Spearman')."},
  {"type": "single", "q": "What is wrong with this cell, meant to explain the payment by the principal?", "code": "b, a = np.polyfit(auto[\"pay_k\"], auto[\"pm\"], 1)", "options": ["Nothing", "x and y are swapped: polyfit takes x first, so this regresses the principal on the payment", "The degree should be 2", "polyfit needs a constant column"], "answer": 1, "explain": "np.polyfit(x, y, 1); Excel's SLOPE takes y first. Swapped arguments give a different line (→ section 1, 'Fitting it')."},
  {"type": "single", "q": "The residual plot of payment ~ principal shows three bands, one per term. What does it mean?", "options": ["The line is perfect", "The model is missing the term: add it as a predictor (or fit each term separately)", "Delete the 24-month loans", "R² must be 1"], "answer": 1, "explain": "Residuals that differ by group point to the missing variable (→ section 1, 'Residuals', worked example Step 6)."},
  {"type": "single", "q": "Which loan pulls the Auto line most if its payment is mistyped?", "options": ["One at the average principal", "One with the largest principal — the highest leverage", "Any loan equally", "The one with the smallest payment"], "answer": 1, "explain": "Leverage grows with (x − x̄)²; an error far from the average x tilts the line most (→ section 1, 'Outliers and leverage')."},
  {"type": "single", "q": "The Micro line (fitted on 0.5–5 m loans) says a 300 m loan pays 81.5 m a month. What is the problem?", "options": ["None — R² is 0.665", "Extrapolation: 300 m is far outside the range the line was fitted on", "The slope is negative", "The intercept is too large"], "answer": 1, "explain": "A line is a rule only inside the data's range; real 300 m SME loans pay about 16 m (→ section 1, 'Extrapolation')."},
  {"type": "single", "q": "Company corner: why is PTI on the owner's personal income meaningless for SME loans?", "options": ["SME loans have no payment", "The business repays them from its cash flow, so personal income is the wrong denominator (median PTI 151 %)", "SME incomes are not recorded", "PTI only works for 0 % loans"], "answer": 1, "explain": "A ratio needs the right denominator; for a business loan it is the business's cash flow (→ Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak.

```challenge
{"id": "w09d1", "q": "A common flag for a high-leverage point is h > 2p / n, where p is the number of coefficients (2 for a line: intercept and slope) and n the number of rows. For the line of payment on principal fitted on all 391 Auto loans, how many loans have leverage above 2p / n?", "type": "number", "dp": 0, "python": true, "h": ["4bd0ca350e8389c78a6807d8"], "hint": "h = 1/n + (x − x̄)² / Σ(x − x̄)², with x the principal of each Auto loan; the threshold is 4 / 391.", "sol": "eCA9IGF1dG9bInBtIl0KbiA9IGxlbih4KQpoID0gMSAvIG4gKyAoeCAtIHgubWVhbigpKSAqKiAyIC8gKCh4IC0geC5tZWFuKCkpICoqIDIpLnN1bSgpCnByaW50KHJvdW5kKDQgLyBuLCA1KSwgKGggPiA0IC8gbikuc3VtKCkpCiMgMC4wMTAyMyAxMwoKMTMgQXV0byBsb2FucyBhcmUgYWJvdmUgdGhlIGZsYWcgMnAgLyBuID0gNCAvIDM5MSA9IDAuMDEwMiDigJQgYWxsIG9mIHRoZW0gdGhlIGxhcmdlc3QgbG9hbnMsIDM4NSB0byA0MDAgbSBzb3VtLgpOb25lIG9mIHRoZSBzbWFsbGVzdCBsb2FucyBpcyBmbGFnZ2VkOiB0aGUgYXZlcmFnZSBwcmluY2lwYWwgaXMgMjE3IG0sIHNvIGEgNDAwIG0gbG9hbiBzaXRzIDE4MyBtIGZyb20gaXQgYW5kIGEgNTAgbSBsb2FuIG9ubHkgMTY3IG0uClRoZSBoaWdoZXN0IGxldmVyYWdlIGlzIDAuMDExNiwganVzdCAxLjEzIHRpbWVzIHRoZSBmbGFnLCBzbyBubyBzaW5nbGUgbG9hbiBkb21pbmF0ZXMgdGhlIGxpbmUg4oCUIHdoaWNoIGlzIHdoeSB0aGUgdHlwbyBvbiB0aGUgMzk5LjUgbSBsb2FuIG1vdmVkIHRoZSBzbG9wZSBieSBvbmx5IDIuMyAlLgpUaGUgZmxhZyBpcyBhIGxpc3Qgb2YgbG9hbnMgdG8gbG9vayBhdCAoY2hlY2sgdGhlaXIgcmF3IHJvd3MpLCBub3QgYSBsaXN0IHRvIGRlbGV0ZS4="}
```

<!-- challenge:end -->
