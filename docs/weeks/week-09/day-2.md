# Week 9 · Day 2 — Logistic regression and the scorecard: from a score to a probability of going bad

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 9.2 (due Day 4)</span> <span class="badge company">Company corner</span>

> STORY **Tuesday, 9:00.** Nilufar has yesterday's note on her desk and a new question. *"Good — you can read a relationship. Now the real one. The scorecard gives every applicant a number from 424 to 850. The committee does not approve numbers, it approves risk: **what is the chance that a 600 goes bad? And a 700?** And the contract prints a grade, A to D — does the grade tell the same story as the score? A straight line will not do it; going bad is a yes or a no."* Jasur, passing: *"Logistic regression. And when you have it, check that the probabilities come true — a model that says 2 % where 4 % go bad is worse than no model."*

## Today in 3 lines

- From yes/no to a number you can model: **probability, odds and log-odds**; why a **straight line fails** for a yes/no outcome (it predicts −3.3 % for a score of 850); the **logistic curve**, fitted by **maximum likelihood** in Python (statsmodels, or a few lines of numpy), judged by **log-loss**, and read as **odds ratios**.
- From the model to the business: **bad rate by score band** in SQL, the **scorecard** (points, base score, **PDO** — points to double the odds), **risk grades A–D as score bands**, **calibration** (predicted against actual), and the **3 % problem** — class imbalance.
- Nilufar's answer — **a 600 goes bad about 6.5 % of the time, a 700 about 1.9 %; the odds halve every 54 points** — and HW 9.2: the same model on the Consumer loans, with a calibration table (`data/python/week9/day2_starter.ipynb`).

---

## 1. Learn — from a score to a probability

Press ▶ Run on this first box once. It loads the data for the whole page; every later box on this page, and every Practice box, reuses it.

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

loans = pd.read_csv("data/raw/loans.csv")
apps = pd.read_csv("data/raw/applications.csv")
# bad = the loan defaulted or was written off
bad = loans["status"].isin(["default", "written_off"])
loans["bad"] = bad.astype(int)
cols = ["application_id", "credit_score"]
df = loans.merge(apps[cols], on="application_id")
# the loans whose application had a credit score
S = df.dropna(subset=["credit_score"]).copy()
print(len(df), df["bad"].sum(), len(S), S["bad"].sum())
# 7828 234 7615 223
```

7 828 loans, 234 of them bad (2.99 %). 7 615 loans came from an application with a credit score, and 223 of those went bad. The 213 loans without a score are left out of every model on this page — say so whenever you quote a number.

### Probability, odds and log-odds

**What it is.** Three ways to write the same chance. The **probability** p (*вероятность*) is the share: 234 bad of 7 828. The **odds** (*шансы*) compare the two outcomes: p / (1 − p), "bad loans per good loan". The **log-odds** or **logit** (*логарифм шансов, логит*) is ln(odds). Probability lives between 0 and 1; odds between 0 and infinity; log-odds anywhere from −∞ to +∞ — which is what makes them easy to model.

**How to write it.**

```python
p = df["bad"].mean()
odds = p / (1 - p)
print(round(p, 4), round(odds, 4), round(np.log(odds), 2))
# 0.0299 0.0308 -3.48
print(round(1 / odds, 1))
# 32.5
```

| probability | odds | log-odds |
|---|---|---|
| 50 % | 1 (one to one) | 0 |
| 10 % | 0.111 (1 to 9) | −2.20 |
| 2.99 % | 0.0308 (1 to 32.5) | −3.48 |
| 1 % | 0.0101 (1 to 99) | −4.60 |

The book: p = 2.99 %, odds 0.0308 — one bad loan for every 32.5 good ones — and log-odds −3.48.

**When you use it.**
- Probability: what the committee reads ("3 in 100 go bad").
- Odds: how a scorecard is scaled ("good:bad odds of 50:1 at 600").
- Log-odds: what logistic regression models as a straight line.

> ⚠️ **Watch out.** Odds are not a probability. Odds of 0.25 mean 1 bad per 4 good — a probability of 1 / 5 = 20 %, not 25 %. The two are close only for rare events (2.99 % against 3.08 %).

**Your turn.** Grade D: 37 bad loans among 339. What are the odds of bad (bad per good), to 3 decimals?

```task
{"id": "w09d2-l1", "kind": "number", "answer": 0.123, "dp": 3, "hint": "odds = bad ÷ good = 37 ÷ (339 − 37).", "model": "37 / 302 = 0.123 — about one bad loan per 8 good ones. The probability is 37 / 339 = 10.9 %."}
```

### Why a straight line fails for yes/no

**What it is.** Yesterday's least-squares line can be fitted to a 0/1 column — it is called the **linear probability model** (*линейная вероятностная модель*). Its ŷ reads as a probability. But a straight line runs on forever: at one end it predicts probabilities below 0, at the other above 1. And it changes the probability by the same amount per point everywhere, while real risk falls fast at low scores and slowly at high ones.

**How to write it.**

```python
b, a = np.polyfit(S["credit_score"], S["bad"], 1)
for s in (424, 600, 700, 850):
    print(s, round(100 * (a + b * s), 1))
# 424 12.4
# 600 5.9
# 700 2.2
# 850 -3.3
print(round(-a / b))
# 760
```

The line crosses 0 at a score of 760. Above it — 6.7 % of our scored loans — it promises a **negative** chance of going bad, and a score of 850 gets −3.3 %.

**When you use it.**
- As a quick first look ("each point lowers the bad rate by about 0.04 percentage points"), never as the model.
- To explain to a manager why we need a curve.

> ⚠️ **Watch out.** A probability below 0 or above 1 is not a rounding problem; it is the wrong shape. Any model whose output you will call "a probability" must stay between 0 and 1 by construction.

**Your turn.** With the linear model bad ≈ 0.2809 − 0.00036960 × score, what "probability" does it give for a score of 800, in %, to 1 decimal?

```task
{"id": "w09d2-l2", "kind": "number", "answer": -1.5, "dp": 1, "unit": "%", "hint": "0.2809 − 0.00036960 × 800, times 100.", "model": "0.2809 − 0.2957 = −0.0148 → −1.5 %: an impossible probability, from a straight line run past 760."}
```

### The logistic curve

**Before you read.** Guess first, then play with it — the explanation below will make more sense.

```explore
{"id": "w09d2-x1", "type": "logit", "title": "Bend the curve through the bands", "predict": {"q": "A score of **600** against a score of **700**. How many times more likely is the 600 to go bad?", "options": ["About 1.2 times — 100 points is a small step", "About 3.5 times", "About 10 times", "The same: both are approved"], "answer": 1, "why": "The fitted curve says 6.4 % at 600 and 1.9 % at 700: about 3.5 times. Each 100 points multiplies the odds of going bad by about 0.28. Move the two sliders until the curve passes through the dots."}, "bins": [[424.0, 1, 0], [448.0, 1, 0], [486.0, 1, 0], [494.5, 4, 0], [507.0, 7, 2], [515.2, 8, 0], [524.0, 6, 1], [534.7, 23, 5], [545.8, 22, 3], [554.9, 27, 1], [565.0, 36, 6], [574.8, 53, 2], [584.3, 68, 8], [594.1, 74, 9], [604.8, 275, 14], [614.8, 315, 11], [624.7, 367, 23], [634.5, 399, 9], [644.7, 394, 23], [654.1, 458, 30], [664.5, 632, 9], [674.5, 611, 11], [684.3, 603, 10], [694.2, 513, 7], [704.3, 517, 13], [714.5, 426, 10], [724.3, 403, 4], [734.3, 362, 6], [744.3, 267, 0], [754.1, 232, 3], [764.5, 158, 0], [774.5, 126, 0], [783.9, 90, 1], [794.4, 45, 1], [804.2, 30, 0], [813.5, 22, 1], [823.1, 16, 0], [835.4, 12, 0], [845.8, 4, 0], [850.0, 7, 0]], "bands": [["<560", 100, 12, 534.4], ["560–599", 231, 25, 582.2], ["600–639", 1356, 57, 621.2], ["640–679", 2095, 73, 661.4], ["680–719", 2059, 40, 698.1], ["720+", 1774, 16, 750.1]], "start": {"a": -3.48, "b": 0, "cur": 750}, "challenges": [{"id": "c1", "text": "Fit it by hand: bring the log-loss within **0.0002** of the best.", "when": {"gap": ["<", 0.0002]}}, {"id": "c2", "text": "Keep a fit that close and put the marker on **600**: read the PD.", "when": {"gap": ["<", 0.0002], "cur": ["=", 600]}}, {"id": "c3", "text": "Same fit, marker on **700**. How many times safer is a 700 than a 600?", "when": {"gap": ["<", 0.0002], "cur": ["=", 700]}}, {"id": "c4", "text": "**PDO:** with a near-best fit, find the score where the odds of going bad are **half** those at 600 (×0.47 to ×0.53). Its distance from 600 is the points to double the odds.", "when": {"gap": ["<", 0.0005], "ratio": ["between", 0.47, 0.53]}}]}
```

**What it is.** **Logistic regression** (*логистическая регрессия*) fits a straight line to the **log-odds**, not to the probability: z = β₀ + β₁ · score. Then the **logistic function** (the **sigmoid**, *сигмоида*) turns z back into a probability: p = 1 / (1 + e^−z). Whatever z is, p stays between 0 and 1, and the curve has the S-shape real risk has: steep in the middle, flat at both ends.

**How to write it.**

```text
z  = β0 + β1 · score      (log-odds)
p  = 1 / (1 + e^(−z))     (probability)
z  = ln( p / (1 − p) )    (and back)
```

```python
def sigmoid(z):
    return 1 / (1 + np.exp(-z))
for z in (-4, -2, 0, 2, 4):
    print(z, round(sigmoid(z), 3))
# -4 0.018
# -2 0.119
# 0 0.5
# 2 0.881
# 4 0.982
```

z = 0 is a 50 % chance; every step of 2 in z moves the odds e² ≈ 7.4 times. Our loans live far down the curve: the book's log-odds are −3.48, a probability of 3 %.

**When you use it.**
- Any yes/no outcome: bad or good, fraud or not, approved or rejected, responded or not.
- When you need a probability per case, not only an order.

> ⚠️ **Watch out.** β₁ is a change in **log-odds** per point, not in probability. Near p = 3 % one point of score changes the probability by much less than near p = 50 %. Read coefficients as odds ratios (two subsections down).

**Your turn.** A model gives z = −3 for an applicant. What probability of going bad is that, in %, to 2 decimals?

```task
{"id": "w09d2-l3", "kind": "number", "answer": 4.74, "dp": 2, "unit": "%", "hint": "p = 1 / (1 + e³).", "model": "1 / (1 + e³) = 1 / 21.09 = 4.74 %. Odds e^−3 = 0.0498: one bad per 20 good."}
```

### Fitting it — maximum likelihood and log-loss

**What it is.** A logistic regression is fitted by **maximum likelihood** (*метод максимального правдоподобия*): it picks the β₀ and β₁ that give the outcomes we actually saw the highest probability. Equivalently, it makes the **log-loss** (*логарифмическая функция потерь*) as small as possible: the average of −ln(p) over the bad loans and −ln(1 − p) over the good ones. A confident wrong answer costs a lot; a confident right one costs almost nothing.

**How to write it.** statsmodels prints the usual regression table (it loads one more package on its first run).

```python
import statsmodels.api as sm
X = sm.add_constant(S["credit_score"])
fit = sm.Logit(S["bad"], X).fit(disp=0)
b0, b1 = fit.params
print(round(b0, 4), round(b1, 6))
# 5.0677 -0.012903
for s in (600, 700):
    print(s, round(100 * sigmoid(b0 + b1 * s), 2))
# 600 6.45
# 700 1.86
```

The same fit with numpy alone — Newton's method, the way statsmodels does it inside:

```python
y = S["bad"].to_numpy()
Xn = np.column_stack([np.ones(len(S)), S["credit_score"]])
beta = np.zeros(2)
for step in range(25):
    q = sigmoid(Xn @ beta)
    grad = Xn.T @ (y - q)
    hess = Xn.T @ (Xn * (q * (1 - q))[:, None])
    beta = beta + np.linalg.solve(hess, grad)
print(beta.round(6))
# [ 5.067707 -0.012903]
```

And the log-loss of the model against a flat line at the book's bad rate:

```python
q = sigmoid(b0 + b1 * S["credit_score"])
ll = -(y * np.log(q) + (1 - y) * np.log(1 - q)).mean()
p0 = y.mean()
ll0 = -(p0 * np.log(p0) + (1 - p0) * np.log(1 - p0))
print(round(ll, 4), round(ll0, 4))
# 0.1256 0.1322
```

log-odds of bad = 5.0677 − 0.012903 × score. A score of 600 → 6.45 %; 700 → 1.86 %. The log-loss drops from 0.1322 (everyone at 2.93 %) to 0.1256.

**When you use it.**
- `sm.Logit` (or `smf.logit("bad ~ credit_score", data=S)`) when you want the table: coefficients, standard errors, p-values.
- scikit-learn's `LogisticRegression(penalty=None)` gives the same β in a prediction pipeline; its default adds a penalty that shrinks them.

> ⚠️ **Watch out.** Log-loss has no "good" value on its own: 0.1256 means little until you compare it with the flat line (0.1322) on the same loans. And it is an average over cases — the 3 % that are bad drive most of it.

**Your turn.** Which pair of numbers does a logistic regression make as small as possible?

```task
{"id": "w09d2-l4", "kind": "choice", "options": ["The squared gaps between y and ŷ, like a least-squares line", "The log-loss: −ln(p) for each bad loan and −ln(1 − p) for each good one, averaged", "The number of loans it gets wrong at a 50 % cut-off", "The difference between the mean PD and the bad rate"], "answer": 1, "explain": "Maximum likelihood = minimum log-loss. Counting mistakes at 50 % would be useless here: no loan has a PD above 40 %."}
```

### A coefficient as an odds ratio

**What it is.** e^β₁ is an **odds ratio** (*отношение шансов*): the factor by which the odds of bad are multiplied for one more point of score. Over k points the factor is e^(k·β₁). A dummy's e^β is the odds ratio of its group against the reference group.

**How to write it.**

```python
for k in (1, 10, 50, 100):
    print(k, round(np.exp(b1 * k), 3))
# 1 0.987
# 10 0.879
# 50 0.525
# 100 0.275
print(round(np.log(2) / -b1, 1))
# 53.7
```

One point of score multiplies the odds of going bad by 0.987; 100 points by 0.275 — a 700 has about a quarter of a 600's odds. The odds halve every **53.7 points**.

The grades as dummies, with A as the reference:

```python
import statsmodels.formula.api as smf
g = smf.logit("bad ~ C(risk_grade)", data=df).fit(disp=0)
print(np.exp(g.params).round(2))
```

| grade | odds ratio against A |
|---|---|
| A | 1 (reference) |
| B | 2.03 |
| C | 5.73 |
| D | 13.00 |

A grade D loan has 13 times the odds of going bad of a grade A loan.

**When you use it.**
- To say a coefficient in plain words: "every 50 points roughly halves the odds".
- To compare groups: "D has 13 times A's odds".

> ⚠️ **Watch out.** An odds ratio is not a ratio of probabilities. D's bad rate is 10.9 % and A's 0.93 %: 11.7 times. The odds ratio is 13.0. For rare events the two are close; for common ones they drift apart — say which one you mean.

**Your turn.** With β₁ = −0.012903 per point, by what factor are the odds of bad multiplied over **50** points? Give 3 decimals.

```task
{"id": "w09d2-l5", "kind": "number", "answer": 0.525, "dp": 3, "hint": "e^(50 × −0.012903).", "model": "e^(−0.645) = 0.525: 50 more points, a little over half the odds of going bad."}
```

### Bad rate by score band

**What it is.** A **score band** (*диапазон скоринга*) groups the scores (here by 40 points) and reports each group's bad rate. It is the model-free picture of the curve: the logistic regression should pass close to every band's rate.

**How to write it.** In SQL, a `CASE` makes the band; `SUM(status IN (…))` counts the bad loans (a true condition counts as 1 in SQLite).

```sql
SELECT CASE
         WHEN a.credit_score < 560 THEN '1: <560'
         WHEN a.credit_score < 600 THEN '2: 560-599'
         WHEN a.credit_score < 640 THEN '3: 600-639'
         WHEN a.credit_score < 680 THEN '4: 640-679'
         WHEN a.credit_score < 720 THEN '5: 680-719'
         ELSE '6: 720+'
       END AS band,
       COUNT(*) AS loans,
       SUM(l.status IN ('default', 'written_off')) AS bads,
       ROUND(100.0 * SUM(l.status IN ('default', 'written_off'))
             / COUNT(*), 2) AS bad_pct
FROM loans l
JOIN applications a ON a.application_id = l.application_id
WHERE a.credit_score IS NOT NULL
GROUP BY band
ORDER BY band;
```

| band | loans | bads | bad_pct |
|---|---|---|---|
| 1: <560 | 100 | 12 | 12.00 |
| 2: 560-599 | 231 | 25 | 10.82 |
| 3: 600-639 | 1 356 | 57 | 4.20 |
| 4: 640-679 | 2 095 | 73 | 3.48 |
| 5: 680-719 | 2 059 | 40 | 1.94 |
| 6: 720+ | 1 774 | 16 | 0.90 |

From 12.0 % below 560 to 0.9 % at 720 and above: the bad rate falls in every band. The two lowest bands are small (100 and 231 loans), so their rates are the least sure.

**When you use it.**
- The first table of any scorecard review: does the bad rate fall band by band (**monotonic**)?
- Bands are how policy is written ("decline below 560") and how a committee reads a model.

> ⚠️ **Watch out.** Put the number of loans next to every rate. 12 of 100 is a much shakier 12 % than 57 of 1 356 is 4.2 %. And the SQL Server spelling of `SUM(condition)` is `SUM(CASE WHEN … THEN 1 ELSE 0 END)`.

**Your turn.** In which band does one extra bad loan move the bad rate the most?

```task
{"id": "w09d2-l6", "kind": "choice", "options": ["<560 — 100 loans: one more bad loan adds a whole point", "640-679 — the biggest band", "720+ — the safest band", "All bands equally"], "answer": 0, "explain": "One loan is 1 / 100 = 1 point in the smallest band, 1 / 2 095 = 0.05 points in the biggest. Small bands have noisy rates."}
```

### The scorecard — points, base score and PDO

**What it is.** A **scorecard** (*скоринговая карта*) turns the model's log-odds into points that are easy to read and add. Three numbers fix the scale: a **base score** at **base odds** (for example 600 points = good:bad odds of 50 to 1) and the **PDO** — the **points to double the odds** (*баллы удвоения шансов*): every PDO points more, the good:bad odds double.

**How to write it.** score = offset + factor × ln(good:bad odds), with factor = PDO / ln 2 and offset = base score − factor × ln(base odds).

```python
pdo, base_score, base_odds = 20, 600, 50
factor = pdo / np.log(2)
offset = base_score - factor * np.log(base_odds)
print(round(factor, 2), round(offset, 2))
# 28.85 487.12
for odds_good in (25, 50, 100, 200):
    print(odds_good, round(offset + factor * np.log(odds_good)))
# 25 580
# 50 600
# 100 620
# 200 640
```

On that common scale, 600 points mean 50:1 and each 20 points doubles the odds. Our score has its own scale, read off the fitted model:

```python
for s in (600, 650, 700):
    q = sigmoid(b0 + b1 * s)
    print(s, round((1 - q) / q, 1))
# 600 14.5
# 650 27.6
# 700 52.7
```

On our scorecard a 600 has good:bad odds of 14.5 to 1, a 700 of 52.7 to 1, and the odds double every 53.7 points (ln 2 ÷ 0.012903).

**When you use it.**
- To read a score as risk: "a 650 is 27.6 good loans for every bad one".
- When a scorecard has many characteristics: each attribute (an age band, an income band) gets points = factor × its share of the log-odds, and the applicant's score is the sum. Adding points is adding log-odds.

> ⚠️ **Watch out.** Points are not percentages: 20 more points does not mean "20 % safer". It means "the odds doubled" on a PDO-20 card — and on ours it takes 53.7 points to do the same. Always ask a scorecard for its PDO before comparing scores.

**Your turn.** On a card scaled to 600 = 50:1 with PDO 20, what score has good:bad odds of 400:1?

```task
{"id": "w09d2-l7", "kind": "number", "answer": 660, "dp": 0, "unit": "points", "hint": "400 = 50 × 2³: three doublings.", "model": "50 → 100 → 200 → 400 is three doublings, 3 × 20 = 60 points: 600 + 60 = 660."}
```

### Risk grades A–D as score bands

**What it is.** A **risk grade** (*класс риска*) is a label for a range of scores, so that policy, pricing and reports speak in four words instead of four hundred numbers. Good grades have a bad rate that rises from A to D, with clear gaps.

**How to write it.**

```python
S.groupby("risk_grade")["credit_score"].agg(["min", "max", "count"])
```

| grade | scores | loans | bad rate (all loans) |
|---|---|---|---|
| A | 720 – 850 | 1 821 | 0.93 % |
| B | 660 – 719 | 3 404 | 1.88 % |
| C | 600 – 659 | 2 264 | 5.12 % |
| D | 424 – 599 | 339 | 10.91 % |

At Nur the grade is exactly a score band: A from 720, B 660–719, C 600–659, D below 600. The bad rate doubles or more at every step down. (The loan counts include the 213 loans without a score, which have a grade too.)

**When you use it.**
- Pricing and limits by grade; the risk pack's grade mix; a quick check that the grades still separate risk.
- Every grade boundary is a cut-off in disguise — Day 4 moves one.

> ⚠️ **Watch out.** A grade throws away detail: a 601 and a 659 are both C, though their PDs are 6.4 % and 3.1 %. Use the score (or its PD) for decisions near a boundary, the grade for reporting.

**Your turn.** An applicant scores 655. Which grade, and what does the model say about the PD?

```task
{"id": "w09d2-l8", "kind": "choice", "options": ["B, about 2 %", "C, about 3.3 % — near the top of C, safer than C's average of 5.1 %", "C, exactly 5.12 %, the grade's bad rate", "D, because it is below 660"], "answer": 1, "explain": "655 is in C (600–659). The curve gives 1 / (1 + e^−(5.0677 − 0.012903 × 655)) = 3.3 %; 5.12 % is the grade's average, pulled up by scores near 600."}
```

### Calibration — predicted against actual

**What it is.** A model is **calibrated** (*откалиброван*) when its probabilities come true: among loans it gives 5 %, about 5 % go bad. **Calibration** is checked band by band: the average predicted PD next to the actual bad rate. Ranking well (Day 3) and being calibrated are two different qualities.

**How to write it.**

```python
bins = [0, 560, 600, 640, 680, 720, 1000]
S["band"] = pd.cut(S["credit_score"], bins, right=False)
S["pd"] = sigmoid(b0 + b1 * S["credit_score"])
cal = S.groupby("band", observed=True).agg(
    loans=("bad", "size"), actual=("bad", "mean"), predicted=("pd", "mean"))
(100 * cal[["actual", "predicted"]]).round(2)
```

| band | loans | actual | predicted |
|---|---|---|---|
| <560 | 100 | 12.00 % | 14.24 % |
| 560-599 | 231 | 10.82 % | 8.04 % |
| 600-639 | 1 356 | 4.20 % | 5.03 % |
| 640-679 | 2 095 | 3.48 % | 3.06 % |
| 680-719 | 2 059 | 1.94 % | 1.93 % |
| 720+ | 1 774 | 0.90 % | 1.03 % |

Across all scored loans the average PD equals the bad rate exactly (2.93 %): a logistic regression with an intercept always does that on the data it was fitted on. Band by band it is close in the big bands; the 560–599 band runs hotter than predicted (10.8 % against 8.0 %), on only 231 loans.

**When you use it.**
- Before a PD goes into pricing, expected loss (Week 6) or provisions: those need the level right, not just the order.
- Every month in monitoring: calibration drifts before ranking does.

> ⚠️ **Watch out.** "Calibrated in total" is automatic on the fitting data and proves nothing. Check by band, on **new** loans (out of time, Day 3), with the count next to each band.

**Your turn.** For grade D the model predicts 9.91 % on average and 11.18 % go bad (331 scored loans). What do you report?

```task
{"id": "w09d2-l9", "kind": "choice", "options": ["The model is useless for grade D", "The model under-predicts D by about 1.3 points (9.9 % against 11.2 %) on 331 loans — within what chance can do, but worth watching", "The model is perfect", "Grade D should be deleted"], "answer": 1, "explain": "37 bad loans of 331: one or two loans move the rate by 0.3–0.6 points. Report the gap with the count, and watch it on the next months."}
```

### 3 % bads — class imbalance

**What it is.** Our outcome is **imbalanced** (*несбалансированные классы*): 97 of 100 loans are good. Two consequences. **Accuracy** (*доля верных ответов*) is useless: a "model" that says *everyone is good* is right 97.07 % of the time and catches no bad loan. And no loan gets a PD above 50 %, so a 50 % cut-off flags nobody.

**How to write it.**

```python
print(round(100 * (1 - S["bad"].mean()), 2))
# 97.07
print((S["pd"] > 0.5).sum(), round(S["pd"].max(), 3))
# 0 0.401
```

97.07 % "accuracy" for doing nothing; the riskiest scored applicant has a PD of 40 %, so a 50 % cut-off would approve everyone.

**When you use it.**

| | what it answers | fine with 3 % bads? |
|---|---|---|
| accuracy | share of right yes/no calls | no |
| log-loss | how good the probabilities are | yes |
| calibration by band | do the PDs come true? | yes |
| AUC / Gini (Day 3) | does the score rank bad below good? | yes |

> ⚠️ **Watch out.** If you oversample the bad loans or give them more weight (common tricks to "balance" the data), the model's PDs are inflated: the intercept must be corrected before the PDs are used. And the cut-off is a business decision about cost (Day 4), not 50 %.

**Your turn.** A vendor's model is "97 % accurate" on our loans. What do you ask?

```task
{"id": "w09d2-l10", "kind": "choice", "options": ["Nothing — 97 % is excellent", "How it ranks and how calibrated it is: saying 'good' to everyone already scores 97.07 % here", "Whether it uses Python", "For 99 %"], "answer": 1, "explain": "With 2.93 % bad, accuracy rewards doing nothing. Ask for AUC / Gini, calibration by band and log-loss against the flat line."}
```

### Putting it together

Nilufar's question, the chain of today's tools:

| step | the tool | the answer |
|---|---|---|
| 1 | probability → odds → log-odds | 2.99 % → 0.0308 → −3.48 |
| 2 | why not a line | it says −3.3 % at 850 |
| 3 | the logistic curve | p = 1 / (1 + e^−(5.0677 − 0.012903 · score)) |
| 4 | maximum likelihood | log-loss 0.1256 against 0.1322 |
| 5 | odds ratio | ×0.275 per 100 points; odds halve every 53.7 |
| 6 | band table | 12.0 % down to 0.9 %, monotonic |
| 7 | the scorecard's scale | 600 = 14.5:1, 700 = 52.7:1 |
| 8 | grades | A 0.93 % … D 10.91 % |
| 9 | calibration | close in big bands; 560–599 hot |
| 10 | imbalance | judge by log-loss and calibration, not accuracy |

**Words of the day.**

```game
{"type": "match", "id": "w09d2-g1", "title": "Words of the day", "pairs": [["Odds", "p / (1 − p): bad loans per good loan"], ["Log-odds", "ln of the odds: the scale logistic regression keeps straight"], ["Sigmoid", "1 / (1 + e^−z): turns log-odds into a probability"], ["Log-loss", "what maximum likelihood makes small"], ["Odds ratio", "e^β: how much one step multiplies the odds"], ["PDO", "the points that double the good:bad odds"], ["Calibration", "the predicted PDs come true, band by band"], ["Class imbalance", "one outcome is rare, so accuracy misleads"]]}
```

**From a score to a decision, in order.**

```game
{"type": "order", "id": "w09d2-g2", "title": "From a score to a PD", "items": ["Define bad (default or written off) and keep the scored loans", "Look at the bad rate by score band", "Fit the logistic regression by maximum likelihood", "Read the coefficient as an odds ratio and the PDO", "Turn the score into a PD with the sigmoid", "Check calibration band by band", "Judge it by log-loss and calibration, not accuracy"]}
```

### Depth (optional)

**Weight of evidence and information value.** Scorecard builders turn every characteristic into bands and give each band its **weight of evidence** (*весомость признака*): WoE = ln(share of all goods in the band ÷ share of all bads in the band). Positive WoE = safer than average. The **information value** IV = Σ (share of goods − share of bads) × WoE measures how well the characteristic separates (rules of thumb: under 0.02 useless, 0.1–0.3 medium, above 0.3 strong).

```python
t = S.groupby("band", observed=True)["bad"].agg(["size", "sum"])
good = t["size"] - t["sum"]
woe = np.log((good / good.sum()) / (t["sum"] / t["sum"].sum()))
iv = ((good / good.sum() - t["sum"] / t["sum"].sum()) * woe).sum()
print(woe.round(2).tolist(), round(iv, 2))
# [-1.51, -1.39, -0.37, -0.18, 0.42, 1.2] 0.46
```

The score's six bands have IV 0.46: strong. The WoE rises band by band, as a good characteristic's should. A logistic regression on WoE-coded characteristics, scaled with factor and offset, is the classic application scorecard.

**Reject inference.** We see outcomes only for **approved** applicants. The 600s we approved were the 600s that passed every other check; the rejected ones never had the chance to go bad. A model fitted on approved loans can look better than it is on the whole applicant flow. **Reject inference** (*восстановление по отказам*) tries to guess what the rejected would have done (by parcelling them by score, by giving them the PD of similar approved loans, or by approving a small random sample on purpose). No method is free; a small random "below cut-off" sample is the only one that measures instead of guessing.

*Russian terms:* вероятность = probability, шансы = odds, логарифм шансов (логит) = log-odds, логистическая регрессия = logistic regression, сигмоида = sigmoid, метод максимального правдоподобия = maximum likelihood, логарифмическая функция потерь (log-loss) = log-loss, отношение шансов = odds ratio, скоринговая карта = scorecard, баллы удвоения шансов (PDO) = PDO, класс риска = risk grade, калибровка = calibration, несбалансированные классы = class imbalance, WoE (весомость признака) = weight of evidence, IV (информационная ценность) = information value, reject inference (восстановление по отказам) = reject inference.

---

## 2. Worked example — what a 600 and a 700 mean (15 min)

*"What is the chance that a 600 goes bad? And a 700? Does the grade say the same?"*

**Step 1 — probability, odds, log-odds.** Bad = default or written off; 223 bad among the 7 615 scored loans: p = 2.93 %, odds 0.0302, log-odds −3.50.

**Step 2 — not a straight line.** The linear model goes below 0 at 760; Nilufar needs probabilities for the whole range up to 850.

**Step 3 — the logistic curve.** log-odds of bad = β₀ + β₁ · score; PD = the sigmoid of it.

**Step 4 — maximum likelihood.** `sm.Logit`: β₀ = **5.0677**, β₁ = **−0.012903** per point (standard error 0.00129, so the 95 % interval is −0.0154 to −0.0104 — clearly below 0). Log-loss 0.1256 against 0.1322 for the flat line.

**Step 5 — the odds ratio.** e^(100 × −0.012903) = **0.275**: 100 more points, about a quarter of the odds. ln 2 ÷ 0.012903 = **53.7** points halve them.

**Step 6 — the bands.** 12.0 / 10.8 / 4.2 / 3.5 / 1.9 / 0.9 % from the lowest band up: monotonic, the curve passes close to every band.

**Step 7 — the two PDs.** 600 → **6.45 %** (good:bad 14.5 to 1); 700 → **1.86 %** (52.7 to 1). A 600 is 3.5 times as likely to go bad as a 700.

**Step 8 — the grades.** 600 is the bottom of grade C (600–659), 700 the middle of B (660–719). The grades' bad rates — C 5.12 %, B 1.88 % — are averages over the band; the curve says more for one applicant.

**Step 9 — calibration.** In the 600–639 band the model predicts 5.03 %, 4.20 % happened (1 356 loans); in 680–719, 1.93 % against 1.94 % (2 059 loans). Good enough to quote, with the 560–599 band flagged (10.8 % against 8.0 %).

**Step 10 — the answer, with the caveat.** *"A 600 goes bad about 6.5 % of the time, a 700 about 1.9 % — 3.5 times less. Every 54 points halves the odds. Grades agree in order, but within a grade the score matters: C runs from 6.5 % at 600 to 3.1 % at 659. These are PDs for loans like the ones we approved in 2024–2026, measured as 'ever defaulted or written off so far'; tomorrow I check how well the score ranks, and on Thursday where the cut-off should be."*

---

## 3. Practice (50 min)

Every task has its own answer box, and the questions follow the order of section 1 — the concept is named in italics. The Python boxes run in the same session as section 1, so `np`, `pd`, `plt`, `df` (all loans with their score), `S` (the scored loans, with `band` and `pd` once you ran the calibration box), `sigmoid`, `b0` and `b1` are ready — if you came straight here, press ▶ Run all above on the last box of section 1. SQL boxes run on your practice copy of the database. (The notebook `data/python/week9/day2_starter.ipynb` holds the same tools; you need it for the homework.)

**P1.** *(odds and log-odds)* Grade C: 116 bad loans among 2 264. What are the log-odds of bad, to 2 decimals?

```task
{"id": "w09d2-p1", "kind": "number", "answer": -2.92, "dp": 2, "hint": "ln( 116 ÷ (2 264 − 116) ).", "model": "odds = 116 / 2 148 = 0.0540; ln 0.0540 = −2.92. The book is at −3.48: grade C's log-odds are 0.56 higher, odds e^0.56 = 1.75 times the book's."}
```

<details><summary>Answer</summary>

odds = 116 / 2 148 = 0.0540, log-odds = ln 0.0540 = **−2.92**. Probability 5.12 %, odds 5.40 % — close, because the event is rare.

</details>

**P2.** *(why a straight line fails)* Fit the linear probability model on the scored loans (`np.polyfit` of `bad` on `credit_score`). What share of the scored loans gets a **negative** "probability", in %, to 1 decimal?

```task
{"id": "w09d2-p2", "kind": "python", "starter": "b_lin, a_lin = np.polyfit(S[\"credit_score\"], S[\"bad\"], 1)\n# the share of loans with a + b * score < 0, in %, to 1 decimal\n", "answer": 6.7, "dp": 1, "model": "neg = (a_lin + b_lin * S[\"credit_score\"]) < 0\nprint(round(100 * neg.mean(), 1))\n# 6.7 — every loan scored above 760"}
```

<details><summary>Answer</summary>

```python
neg = (a_lin + b_lin * S["credit_score"]) < 0
print(round(100 * neg.mean(), 1))
# 6.7
```
**6.7 %** of the scored loans — everyone above 760 — would get a negative chance of going bad.

</details>

**P3.** *(the logistic curve)* With β₀ = 5.0677 and β₁ = −0.012903, what is the PD of a score of 560, in %, to 1 decimal?

```task
{"id": "w09d2-p3", "kind": "number", "answer": 10.4, "dp": 1, "unit": "%", "hint": "z = 5.0677 − 0.012903 × 560, then 1 / (1 + e^−z).", "model": "z = 5.0677 − 7.2257 = −2.158; 1 / (1 + e^2.158) = 10.4 %. The band 560–599 actually ran at 10.8 %."}
```

<details><summary>Answer</summary>

z = 5.0677 − 0.012903 × 560 = −2.158; PD = 1 / (1 + e^2.158) = **10.4 %**.

</details>

**P4.** *(fitting it)* Fit `smf.logit("bad ~ credit_score", data=S)`. Print the slope to 6 decimals and McFadden's pseudo-R² (`fit.prsquared`) to 3 decimals.

```task
{"id": "w09d2-p4", "kind": "python", "starter": "import statsmodels.formula.api as smf\nm = smf.logit(\"bad ~ credit_score\", data=S).fit(disp=0)\n# print the credit_score coefficient (6 dp) and m.prsquared (3 dp)\n", "answer": 0.05, "dp": 3, "model": "print(round(m.params[\"credit_score\"], 6), round(m.prsquared, 3))\n# -0.012903 0.05 — the log-likelihood is 5 % better than the flat line's"}
```

<details><summary>Answer</summary>

```python
print(round(m.params["credit_score"], 6), round(m.prsquared, 3))
# -0.012903 0.05
```
The same β₁ as `sm.Logit`; pseudo-R² = 1 − ln L(model) / ln L(flat) = **0.050**. Small numbers are normal for a rare outcome — it is not R² and is not read like it.

</details>

**P5.** *(odds ratio)* Grade D has odds of 37 / 302, grade A 17 / 1 804. What is D's odds ratio against A, to 1 decimal?

```task
{"id": "w09d2-p5", "kind": "number", "answer": 13.0, "dp": 1, "hint": "(37 ÷ 302) ÷ (17 ÷ 1 804).", "model": "0.1225 / 0.00942 = 13.0 — the same as e^β of the D dummy in the grade logit. The ratio of bad rates is 10.91 / 0.93 = 11.7."}
```

<details><summary>Answer</summary>

(37 / 302) / (17 / 1 804) = 0.1225 / 0.00942 = **13.0**. The dummy's e^β in `bad ~ C(risk_grade)` is exactly this: with one categorical predictor, logistic regression reproduces each group's odds.

</details>

**P6.** *(bad rate by band)* Bad rate by **channel**: one row per channel with loans, bads and the bad rate in % to 2 decimals, the riskiest first.

```task
{"id": "w09d2-p6", "kind": "sql", "model": "SELECT a.channel,\n       COUNT(*) AS loans,\n       SUM(l.status IN ('default', 'written_off')) AS bads,\n       ROUND(100.0 * SUM(l.status IN ('default', 'written_off')) / COUNT(*), 2) AS bad_pct\nFROM loans l\nJOIN applications a ON a.application_id = l.application_id\nGROUP BY a.channel\nORDER BY bad_pct DESC;", "note": "branch 3 590 loans, 116 bad, 3.23 %; app 2 669, 76, 2.85 %; partner 1 569, 42, 2.68 %."}
```

<details><summary>Answer</summary>

```sql
SELECT a.channel,
       COUNT(*) AS loans,
       SUM(l.status IN ('default', 'written_off')) AS bads,
       ROUND(100.0 * SUM(l.status IN ('default', 'written_off'))
             / COUNT(*), 2) AS bad_pct
FROM loans l
JOIN applications a ON a.application_id = l.application_id
GROUP BY a.channel
ORDER BY bad_pct DESC;
```
branch **3.23 %** (116 of 3 590), app 2.85 % (76 of 2 669), partner 2.68 % (42 of 1 569). The gaps are small next to the score bands' 12 % to 0.9 %.

</details>

**P7.** *(the scorecard)* Our score's PDO is 53.7 points and a 600 has good:bad odds of 14.5. Roughly what good:bad odds does a 707 have (two PDOs higher)?

```task
{"id": "w09d2-p7", "kind": "number", "answer": 58, "dp": 0, "unit": "to 1", "hint": "Two doublings: 14.5 × 2 × 2.", "model": "600 + 2 × 53.7 = 707.4: odds 14.5 × 4 = 58 to 1 (PD about 1.7 %)."}
```

<details><summary>Answer</summary>

Two PDOs = two doublings: 14.5 × 4 = **58** good loans per bad one at about 707 — a PD of 1 / 59 = 1.7 %.

</details>

**P8.** *(risk grades)* A loan has a score of 599. What grade does Nur print, and what does that say about grade boundaries?

```task
{"id": "w09d2-p8", "kind": "choice", "options": ["C — 599 rounds to 600", "D — D is everything below 600; a 599 and a 600 differ by one point but by a whole grade (PD 6.5 % against 6.4 %)", "B", "No grade: D starts at 424"], "answer": 1, "explain": "Grades are cut-offs: neighbours across a boundary have almost the same PD but different labels, prices and limits."}
```

<details><summary>Answer</summary>

**D**: grade D is every score below 600. The model's PD is 6.53 % at 599 and 6.45 % at 600 — one point, one grade apart.

</details>

**P9.** *(calibration)* Average predicted PD and actual bad rate for grade **C** (scored loans), in %. Print both to 2 decimals.

```task
{"id": "w09d2-p9", "kind": "python", "starter": "S[\"pd\"] = sigmoid(b0 + b1 * S[\"credit_score\"])\nc = S[S[\"risk_grade\"] == \"C\"]\n# print 100 × the mean of pd and 100 × the mean of bad, to 2 decimals\n", "answer": 4.98, "dp": 2, "model": "print(round(100 * c[\"pd\"].mean(), 2), round(100 * c[\"bad\"].mean(), 2))\n# 4.44 4.98 — 2 208 loans: C runs about half a point hotter than predicted"}
```

<details><summary>Answer</summary>

```python
print(round(100 * c["pd"].mean(), 2), round(100 * c["bad"].mean(), 2))
# 4.44 4.98
```
Predicted **4.44 %**, actual **4.98 %** on 2 208 loans: C goes bad a little more often than the score alone says.

</details>

**P10.** *(class imbalance)* A model flags a loan as "bad" when its PD is above 5 %. On the scored loans, how many loans does it flag, and what share of all bad loans are among them (in %, to 1 decimal)?

```task
{"id": "w09d2-p10", "kind": "python", "starter": "flag = S[\"pd\"] > 0.05\n# print the number flagged and 100 × (bad loans flagged) / (all bad loans), to 1 decimal\n", "answer": 28.3, "dp": 1, "model": "print(flag.sum(), round(100 * S.loc[flag, \"bad\"].sum() / S[\"bad\"].sum(), 1))\n# 948 28.3 — the loans scored below 621"}
```

<details><summary>Answer</summary>

```python
print(flag.sum(), round(100 * S.loc[flag, "bad"].sum() / S["bad"].sum(), 1))
# 948 28.3
```
A 5 % threshold (not 50 %) flags the 948 loans scored below 621 and catches 28.3 % of the bad ones (63 of 223). Which threshold is right is a cost question — Day 4.

</details>

### Mistakes people make

- A straight line fitted to a 0/1 outcome and its ŷ called a probability (−3.3 % at 850).
- β₁ read as "−1.3 % per point": it is a change in log-odds; say the odds ratio.
- Odds and probability mixed up: odds 0.25 = probability 20 %.
- An odds ratio quoted as a risk ratio (13.0 against 11.7 for D vs A).
- A rate without its count: 12 % "of the lowest band" is 12 loans of 100.
- Calibration "checked" on the total, where it is exact by construction.
- Accuracy reported for a 3 % outcome; a 50 % cut-off that flags nobody.
- An oversampled model's PDs used without correcting the intercept.
- Scores compared across scorecards with different PDOs.
- The 213 loans with no score silently dropped and not mentioned.

---

## 4. Homework <span class="badge hw">HW 9.2 — Due Day 4</span>

**The Consumer PD.** Open `data/python/week9/day2_starter.ipynb`. Part 0 repeats today's model on all scored loans. Then four functions are stubs with assert cells: `sigmoid(z)`, `log_odds(p)`, `fit_logit(x, y)` (Newton's method in numpy) and `log_loss(y, p)`. Then the Consumer part: the bad rate by score band from SQL, the logistic fit on the 2 350 scored Consumer loans, the PD for scores 600 and 700, a calibration table by band, and three sentences for Nilufar in the last cell. **Kernel → Restart & Run All**, then hand in the executed notebook with the 📎 box below.

Graded on (20 points): (a) all four assert cells pass after *Restart & Run All* (2 points each, 8), (b) the band table comes from SQL (3), (c) the fit, the two PDs and the calibration table are right (5), (d) the three sentences give the two PDs, how well the model is calibrated, and one caveat (4).

**Check your numbers here before you hand in.**

**H1.** Consumer loans, band 640–679: what is the bad rate, in %, to 2 decimals?

```task
{"id": "w09d2-hw1", "kind": "number", "answer": 4.33, "dp": 2, "unit": "%", "hint": "Today's band query with AND l.product_id = 2 in the WHERE.", "model": "28 bad of 646 = 4.33 % — higher than the 600–639 band's 4.15 %: on 2 350 loans the Consumer bands are not perfectly monotonic."}
```

**H2.** The logistic regression of bad on credit_score, Consumer loans only: what PD does it give for a score of **600**, in %, to 2 decimals?

```task
{"id": "w09d2-hw2", "kind": "number", "answer": 6.51, "dp": 2, "unit": "%", "hint": "fit_logit on the 2 350 scored Consumer loans; then sigmoid(b0 + b1 × 600).", "model": "β0 = 4.5863, β1 = −0.012083: PD(600) = 6.51 %."}
```

**H3.** And for **700**, in %, to 2 decimals?

```task
{"id": "w09d2-hw3", "kind": "number", "answer": 2.04, "dp": 2, "unit": "%", "hint": "sigmoid(b0 + b1 × 700) with the Consumer coefficients.", "model": "PD(700) = 2.04 % — 3.2 times lower than at 600 (PDO 57 points), close to the whole book's curve."}
```

**H4.** Your three sentences for Nilufar (the last cell of the notebook) — write them here too.

```task
{"id": "w09d2-hw4", "kind": "free", "min": 30, "model": "On 2 350 scored Consumer loans (73 bad, 3.1 %) a score of 600 goes bad about 6.5 % of the time and a 700 about 2.0 %, three times less; the odds halve every 57 points. By band the model is close where the counts are large (680–719: 2.1 % predicted, 1.6 % actual on 635 loans), but the 640–679 band runs hotter than predicted (4.3 % against 3.2 %). The bands below 600 have only 104 loans, so their rates are shaky, and these PDs count 'ever bad so far' on loans of different ages.", "rubric": ["gives the two PDs (about 6.5 % and 2.0 %)", "says how well the PDs come true by band, with a count", "names a band or a group where the model is off", "gives one caveat (small bands, the bad definition, loan age, approved loans only)"]}
```

### 📎 Hand in here

```sqltask
{"check": "handin-W9D2", "lesson": "W9D2", "title": "HW 9.2", "why": "Day 3 judges the score's ranking and Day 4 sets the cut-off on top of these PDs, so the Consumer fit and its calibration have to be right first.", "graded": ["all four assert cells pass after Restart & Run All (8)", "the band table comes from SQL (3)", "the fit, PD(600), PD(700) and the calibration table are right (5)", "the three sentences give the two PDs, the calibration and one caveat (4)"], "tasks": [{"id": "day2_starter.ipynb", "file": "day2_starter.ipynb", "names": ["day2_starter.ipynb"], "upload": true, "accept": ".ipynb", "q": "Attach `day2_starter.ipynb` — what the page above asks for."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else the page lists (one more file, or a .zip of several)."}]}
```

---

## 5. Self-check

Three questions, one at a time. Wrong? The explanation points to the part of section 1 to reread.

```check
{"id": "w09d2-sc", "questions": [
  {"type": "single", "q": "The probability of bad is 20 %. What are the odds?", "options": ["0.20", "0.25 — one bad per four good", "0.80", "4"], "answer": 1, "explain": "odds = p / (1 − p) = 0.2 / 0.8 = 0.25 (→ section 1, 'Probability, odds and log-odds')."},
  {"type": "number", "q": "β₁ = −0.02 per point. By what factor are the odds of bad multiplied over 50 points? (2 decimals)", "answer": 0.37, "tol": 0.005, "explain": "e^(50 × −0.02) = e^−1 = 0.37 (→ section 1, 'A coefficient as an odds ratio')."},
  {"type": "single", "q": "On the loans it was fitted on, the model's average PD equals the bad rate exactly. What does that prove?", "options": ["The model is calibrated", "Nothing much — with an intercept it is true by construction; check calibration band by band, on new loans", "The model ranks well", "There is no class imbalance"], "answer": 1, "explain": "Calibration in total is automatic in-sample; the test is band by band and out of time (→ section 1, 'Calibration')."}
]}
```

---

## 6. Company corner <span class="badge company">How a scorecard is built and kept</span>

An application scorecard is not one regression in a notebook. At a lender it is a small project with a life cycle, and the risk committee — Nilufar's meeting on Friday — signs off each stage.

1. **Definition.** What is "bad" (here: default or written off; often 90+ days past due within 12 months), what is the **performance window** (how long a loan is watched), and which loans are excluded (fraud, deaths, too young to judge).
2. **Development sample.** Applications from a past period with known outcomes, plus an **out-of-time** sample held back for validation.
3. **Characteristics.** Bureau data, application data, behaviour; each binned, with WoE and IV (today's Depth), weak or unstable ones dropped.
4. **The model.** Logistic regression on WoE-coded characteristics, chosen for being explainable: every point on the card can be justified to a customer and a regulator.
5. **Scaling.** Base score, base odds and PDO turn the log-odds into points.
6. **Validation.** Ranking (Gini, KS — tomorrow), calibration (today), stability (PSI — Thursday), on the out-of-time sample.
7. **Cut-off and policy.** Where to approve and on what terms (Thursday).
8. **Monitoring and redevelopment.** Monthly reports; a rebuild when Gini falls or the population shifts — which is exactly Nilufar's question about a two-year-old card.

```game
{"type": "match", "id": "w09d2-g3", "title": "A scorecard's life", "pairs": [["Bad definition", "which outcome counts as bad, within which window"], ["Development sample", "past applications with known outcomes, used to fit"], ["Out-of-time sample", "a later period held back to test the model"], ["WoE binning", "turning each characteristic into bands with weights"], ["Scaling", "base score, base odds and PDO turn log-odds into points"], ["Calibration", "the PDs come true band by band"], ["Monitoring", "monthly checks of ranking, calibration and stability"], ["Redevelopment", "rebuilding the card when it no longer works"]]}
```

> 🎯 **Interview version.** *"How do you turn a logistic regression into a scorecard?"* — fit log-odds of bad on WoE-coded characteristics; choose a base score, base odds and PDO; factor = PDO / ln 2, offset = base score − factor × ln(base odds); each attribute's points are −factor × β × WoE (plus its share of the offset), and the score is the sum. Then say how you would validate it: ranking, calibration, stability, out of time.

**Say it like in an interview.** *"How do you turn a logistic regression into a scorecard, and how would you know it still works?"* — answer in 3–5 sentences.

```task
{"id": "w09d2-cc", "kind": "free", "min": 30, "model": "I fit a logistic regression of the log-odds of bad on the characteristics, usually binned and WoE-coded so each band has one weight. Then I pick the scale — for example 600 points at good:bad odds of 50:1 and 20 points to double the odds — so factor = PDO / ln 2 and offset = 600 − factor × ln 50, and each attribute's points come from its coefficient times its WoE times the factor; the applicant's score is the sum. To know it still works I check ranking (Gini, KS), calibration by band and stability (PSI) on recent, out-of-time loans; on our book the score's odds halve every 54 points and the PDs are close to the actual bad rates in the big bands.", "rubric": ["logistic regression on (WoE-coded) characteristics", "the scaling: base score, base odds, PDO, factor and offset", "points per attribute add up to the score", "validation: ranking, calibration and stability, out of time"]}
```

Tomorrow: Nilufar's first question — does the scorecard still work? — measured: the confusion matrix, the ROC curve, AUC, Gini and KS, and how our two-year-old score compares with what application scorecards usually reach.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w09d2", "pass": 0.8, "questions": [
  {"type": "number", "q": "The probability of bad is 10 %. What are the odds of bad? (3 decimals)", "answer": 0.111, "tol": 0.001, "explain": "0.1 / 0.9 = 0.111: one bad per nine good (→ section 1, 'Probability, odds and log-odds')."},
  {"type": "single", "q": "Why not fit a straight line to bad (0/1) against the score?", "options": ["It is too slow", "It predicts impossible probabilities — below 0 above a score of 760 — and assumes the same change per point everywhere", "It cannot use scores", "It always gives R² = 0"], "answer": 1, "explain": "The linear probability model runs out of [0, 1]: −3.3 % at 850 (→ section 1, 'Why a straight line fails')."},
  {"type": "single", "q": "In logistic regression, what is a straight line in the score?", "options": ["The probability", "The log-odds of bad", "The odds", "The bad count"], "answer": 1, "explain": "z = β₀ + β₁ · score is the log-odds; the sigmoid turns it into a probability (→ section 1, 'The logistic curve')."},
  {"type": "single", "q": "What does maximum likelihood make as small as possible?", "options": ["The squared residuals", "The log-loss", "The number of wrong calls at 50 %", "The PDO"], "answer": 1, "explain": "Highest likelihood = lowest log-loss: −ln p for bad loans, −ln(1 − p) for good ones (→ section 1, 'Fitting it')."},
  {"type": "single", "q": "e^(100 · β₁) = 0.275 for our score. What does it mean?", "options": ["100 more points lower the PD by 27.5 points", "100 more points multiply the odds of going bad by 0.275 — about a quarter", "27.5 % of loans go bad", "The PDO is 27.5"], "answer": 1, "explain": "An odds ratio multiplies odds; the odds halve every ln 2 / 0.012903 = 53.7 points (→ section 1, 'A coefficient as an odds ratio')."},
  {"type": "number", "q": "A card has 600 points at good:bad odds of 50:1 and PDO 20. What odds does 640 have, good per bad?", "answer": 200, "tol": 0.5, "explain": "Two PDOs, two doublings: 50 × 4 = 200 (→ section 1, 'The scorecard')."},
  {"type": "single", "q": "Which statement about Nur's grades is right?", "options": ["They are separate from the score", "They are score bands: A 720+, B 660–719, C 600–659, D below 600, with bad rates 0.93 / 1.88 / 5.12 / 10.91 %", "D is the safest grade", "Grades have no bad rate"], "answer": 1, "explain": "Every grade boundary is a cut-off on the score (→ section 1, 'Risk grades A–D')."},
  {"type": "single", "q": "A vendor's model is '97 % accurate' on our loans. Why is that no news?", "options": ["Saying 'good' to everyone is 97.07 % accurate when 2.93 % go bad", "97 % is low", "Accuracy is always 97 %", "Vendors cannot measure accuracy"], "answer": 0, "explain": "With a rare outcome, judge ranking, calibration and log-loss, not accuracy (→ section 1, '3 % bads')."},
  {"type": "single", "q": "Company corner: what is an out-of-time sample for?", "options": ["Fitting the model faster", "Testing the model on a later period it never saw, as it will be used", "Removing old loans", "Choosing the PDO"], "answer": 1, "explain": "A scorecard is used on future applicants; validation on a later period is the honest test (→ Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak.

```challenge
{"id": "w09d2", "q": "Nilufar asks: at what credit score does our fitted model's PD fall to exactly 5 %? Fit the logistic regression of bad on credit_score on the 7 615 scored loans (bad = default or written off), solve for the score where the PD is 5 %, and round to a whole point.", "type": "number", "dp": 0, "python": true, "h": ["7e477b8fc65ae64e8458e5d6"], "hint": "Turn 5 % into log-odds first: ln(0.05 / 0.95). Then solve β₀ + β₁ · score = that.", "sol": "aW1wb3J0IHN0YXRzbW9kZWxzLmFwaSBhcyBzbQpmaXQgPSBzbS5Mb2dpdChTWyJiYWQiXSwgc20uYWRkX2NvbnN0YW50KFNbImNyZWRpdF9zY29yZSJdKSkuZml0KGRpc3A9MCkKYjAsIGIxID0gZml0LnBhcmFtcwp0YXJnZXQgPSBucC5sb2coMC4wNSAvIDAuOTUpCnByaW50KHJvdW5kKHRhcmdldCwgNCksIHJvdW5kKCh0YXJnZXQgLSBiMCkgLyBiMSwgMikpCiMgLTIuOTQ0NCA2MjAuOTQKCjYyMTogYXQgYSBzY29yZSBvZiBhYm91dCA2MjEgdGhlIG1vZGVsJ3MgUEQgaXMgNSAlLgpsb2ctb2RkcyBvZiA1ICUgPSBsbigwLjA1IC8gMC45NSkgPSDiiJIyLjk0NDQ7IDUuMDY3NyDiiJIgMC4wMTI5MDMgw5cgc2NvcmUgPSDiiJIyLjk0NDQg4oaSIHNjb3JlID0gOC4wMTIxIC8gMC4wMTI5MDMgPSA2MjAuOS4KQ2hlY2s6IDEgLyAoMSArIGVe4oiSKDUuMDY3NyDiiJIgMC4wMTI5MDMgw5cgNjIxKSkgPSA1LjAgJS4KU28gdGhlIGJvdHRvbSBvZiBncmFkZSBDICg2MDDigJM2NTkpIHNpdHMgb24gdGhlICJyaXNraWVyIHRoYW4gNSAlIiBzaWRlOiBzY29yZXMgNjAw4oCTNjIwIGhhdmUgUERzIGZyb20gNi41ICUgZG93biB0byA1ICUuClRoZSB0cmFwIGlzIHNvbHZpbmcgd2l0aCB0aGUgcHJvYmFiaWxpdHkgaXRzZWxmICjOsuKCgCArIM6y4oKBIMK3IHNjb3JlID0gMC4wNSk6IHRoZSBsaW5lIGlzIGluIGxvZy1vZGRzLCBzbyB0aGUgdGFyZ2V0IG11c3QgYmUgaW4gbG9nLW9kZHMgdG9vLg=="}
```

<!-- challenge:end -->
