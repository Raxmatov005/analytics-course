# Week 6 · Day 2 — Samples, the CLT and confidence intervals

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 6.2 (due Day 5)</span> <span class="badge company">Company corner</span>

> STORY **Tuesday, 9:10.** Bekzod, the portfolio manager (*портфельный менеджер*), holds up Timur's dashboard. *"App FPD 1.70 %, branch 1.04 %. Marketing says the app is the future; Nilufar says the app is a risk. I have seen these numbers move by half a point from one month to the next. So: **is app really worse, or is that noise?**"* Madina: *"Two steps. Today: how precisely do we know each number — a confidence interval for each channel. Tomorrow: the test that says whether the gap is real. Bekzod gets one sentence on each day."*

## Today in 3 lines

- A number computed from loans is a **sample estimate** with its own uncertainty: the **standard error** measures it, the **law of large numbers** says it shrinks, the **central limit theorem** says the estimate is approximately normal even when the data are not (loan principal: skew 2.9) — shown by simulation, not by proof.
- A **confidence interval** = estimate ± critical value × SE: **t** for a mean (z only when σ is known — never), **Wilson** for a proportion (the textbook **Wald** interval covers a 1.28 % rate only 73–88 % of the time at Nur's sample sizes), **Clopper–Pearson** when you must guarantee 95 %, the **bootstrap** when there is no formula — and what "95 %" does and does not promise.
- Bekzod's answer, part 1: a rate **with its interval** for each channel — how precisely we know app, branch and partner FPD — and you start HW 6.2: the same for every channel and grade, with a chart and five sentences.

---

## 1. Learn — from the sample to the process

### Population and sample — the process behind the table

**What it is.** The **population** (*генеральная совокупность*) is everything you want to talk about. The **sample** (*выборка*) is the part you observed. A **parameter** (*параметр*) is the population's true value — μ for a mean, p for a rate — and it is unknown. An **estimate** (*оценка*), or statistic, is the same quantity computed from the sample: x̄, p̂. One number is a **point estimate** (*точечная оценка*).

Even "all 2 411 app loans" is a sample when the question is about the **process**: *will* app loans default more? Next year's app loans are not in the table.

| | Population (unknown) | Sample (what you compute) |
|---|---|---|
| mean | μ | x̄ |
| standard deviation | σ | s |
| rate | p | p̂ |
| size | N | n |

**How to write it.** Press ▶ Run: this first block loads the tools and the data for the whole page. Every later block reuses them.

```python
import math
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

loans = pd.read_csv("data/raw/loans.csv")
pop = loans["principal"].to_numpy(dtype=float)                 # all 7 828 principals: the population of this page's experiments
apps = pd.read_csv("data/raw/applications.csv")
s = apps["credit_score"].dropna().to_numpy(dtype=float)       # 13 612 applicants' credit scores
f = pd.read_csv("data/powerbi/fct_first_instalment.csv")      # week 5's FPD frame: 7 099 loans, fpd30 = 0/1
f["channel"] = f["product"].map({"MICRO": "app", "BNPL": "partner"}).fillna("branch")   # app = Micro only, partner = BNPL only
rng = np.random.default_rng(2026)                              # seeded: the same "random" draws on every run

print(len(pop), round(pop.mean()))                             # 7828 51709668: N and μ — a parameter
app = f[f["channel"] == "app"]
print(len(app), app["fpd30"].sum(), round(100 * app["fpd30"].mean(), 2))   # 2411 41 1.7: n, FPDs and p̂ — an estimate
```

The mean principal of all 7 828 loans, 51.71 m soum, is a parameter of the book: every loan is in it. The app's 1.70 % — 41 FPDs in 2 411 loans — is an estimate of the app process's true rate.

**When you use it.**
- Before a number goes into a report: say what the population is — the book as it stands, or the process that makes next month's loans.
- Whenever the question says "will", "is the app riskier", "does the channel": the table is a sample of a process.

**Your turn.** Bekzod asks: *"Will app loans default more than branch loans next year?"* What are the 2 411 app loans in the table?

```task
{"id": "w06d2-l1", "kind": "choice", "options": ["The population — they are all the app loans we have", "A sample of the app process — next year's loans are not in the table", "A parameter", "Neither — a table cannot be a sample"], "answer": 1, "explain": "The question is about the process that makes future app loans. The 2 411 loans we have are one sample of it, so 1.70 % is an estimate with its own uncertainty."}
```

### A good estimate — unbiased and consistent

**What it is.** A good estimate is **unbiased** (*несмещённая*): right on average over many samples. It is also **consistent** (*состоятельная*): closer to the truth as n grows. The sample variance divides by **n − 1**, not by n, so that it is unbiased.

**How to write it.** Sample variance = the sum of squared distances from the sample mean ÷ (n − 1). numpy: `x.var(ddof=1)`; pandas: `.var()`; Excel: `VAR.S`, `STDEV.S`. Check it by experiment — 20 000 samples of five scores, both formulas, averaged:

```python
samples = np.array([rng.choice(s, 5, replace=False) for _ in range(20_000)])   # 20 000 samples, n = 5 each
print(round(s.var()))                                                    # 3543: the population variance of the 13 612 scores
print(samples.var(axis=1, ddof=0).mean(), samples.var(axis=1, ddof=1).mean())   # ≈ 2 862 (too small), ≈ 3 578 (right on average)
```

Dividing by n gives about 2 860 instead of 3 543 — 20 % too small at n = 5. Dividing by n − 1 lands near 3 543. The reason: the sample's own mean sits closer to its five points than the true mean does, so the squared distances come out too small by the factor (n − 1)/n. (The sd, √ of the variance, is still a little low on average — 56.2 against 59.5 here — and nobody minds.)

**When you use it.**
- Every sample sd or variance: `ddof=1`. At n = 5 (a pilot, a branch-week) the difference is 20 %; at n = 2 411 it is invisible.

> ⚠️ **Watch out.** `np.std(x)` and `np.var(x)` default to ddof = 0, the population formula; pandas' `.std()` uses ddof = 1. Pass `ddof=1` to numpy in every sample calculation.

**Your turn.** At n = 5, the variance divided by n is on average what share of the true variance?

```task
{"id": "w06d2-l2", "kind": "number", "answer": 0.8, "dp": 2, "unit": "of the true variance", "hint": "The factor is (n − 1) / n.", "model": "(5 − 1) / 5 = 0.8 — the experiment's 2 862 / 3 543 ≈ 0.81. That is why a sample variance divides by n − 1."}
```

### Sampling error — every sample misses a little

**What it is.** **Sampling error** (*ошибка выборки*) is the gap between an estimate and the parameter: x̄ − μ. It comes from *which* units happened to land in the sample. It is not a mistake. Every sample has one, and another sample has another.

```pic
{"id": "w06d2-pic1", "title": "Five samples, five means, one true mean", "caption": "Every 20th loan, starting at loans 1 to 5: 392 loans each. Each dot misses the book's 51.71 m — by 2.8 to 8.5 million soum — and in real work you see only one of them.", "chart": {"type": "intervals", "rows": [{"label": "from loan 1", "lo": 48.29, "mid": 48.29, "hi": 48.29}, {"label": "from loan 2", "lo": 58.11, "mid": 58.11, "hi": 58.11}, {"label": "from loan 3", "lo": 48.89, "mid": 48.89, "hi": 48.89}, {"label": "from loan 4", "lo": 60.16, "mid": 60.16, "hi": 60.16}, {"label": "from loan 5", "lo": 56.03, "mid": 56.03, "hi": 56.03}], "ref": {"at": 51.71, "label": "μ = 51.71 m"}, "min": 40, "max": 65, "unit": " m"}}
```

**How to write it.** Sampling error = estimate − parameter. Here we know μ, so we can see the errors. Five samples of 392 loans each — every 20th loan, starting at loan 1, 2, 3, 4 and 5 (a **systematic sample**):

```python
mu = pop.mean()                                                 # 51.71 m: the parameter
for start in range(5):
    part = loans["principal"].iloc[start::20]                    # every 20th loan: 392 loans
    print(start + 1, len(part), round(part.mean() / 1e6, 2), round((part.mean() - mu) / 1e6, 2))
```

| sample starts at loan | n | mean, m soum | sampling error, m soum |
|---|---|---|---|
| 1 | 392 | 48.29 | −3.42 |
| 2 | 392 | 58.11 | +6.40 |
| 3 | 392 | 48.89 | −2.82 |
| 4 | 392 | 60.16 | +8.45 |
| 5 | 392 | 56.03 | +4.32 |

Five samples from one book give five different means; each misses 51.71 m by 2.8 to 8.5 million soum. In real work you see one row of this table, and you do not know its error.

**When you use it.**
- To explain why this month's rate differs from last month's when nothing in the process changed.
- As the reason every estimate needs an interval: the next subsections measure how big the error typically is.

> ⚠️ **Watch out.** Sampling error is not **bias** (*смещение*). A biased sample — approved loans only, one branch only — misses in the same direction every time, and a larger n does not fix it. Sampling error shrinks as n grows; bias does not.

**Your turn.** A branch's FPD rate was 1.1 % last quarter and 1.6 % this quarter. Nothing changed in the products, the officers or the rules. What is the most likely explanation?

```task
{"id": "w06d2-l3", "kind": "choice", "options": ["A data error", "Sampling error — two samples from the same process give different rates", "Bias in how the loans were chosen", "The process must have changed"], "answer": 1, "explain": "Two quarters are two samples of a few hundred loans each. Their rates differ even when the true rate is the same; the standard error (next) says by how much."}
```

### Standard error — how much an estimate moves

**What it is.** Draw sample after sample, and the estimate moves. Its distribution over repeated samples is the **sampling distribution** (*выборочное распределение*). The standard deviation of that distribution is the **standard error** (*стандартная ошибка*, SE) — the typical size of the sampling error.

**How to write it.**

```text
SE of a mean       = s / √n                (sd of the data ÷ square root of the sample size)
SE of a proportion = √( p̂ (1 − p̂) / n )
```

```python
print(round(pop.std() / math.sqrt(392) / 1e6, 2))             # 5.69: SE of a 392-loan mean principal, m soum
p = 41 / 2411
print(round(100 * math.sqrt(p * (1 - p) / 2411), 3))           # 0.263: SE of the app FPD rate, in points
```

A 392-loan mean principal moves by about 5.7 m from sample to sample — the size of the errors in the table above (−3.4 to +8.5 m). The app's 1.70 % moves by about 0.26 points.

**When you use it.**
- Inside every interval and every test this week: estimate ± critical value × SE.
- To plan: four times the loans halve the SE.

| | Standard deviation (sd) | Standard error (SE) |
|---|---|---|
| describes | the loans: how different they are | the estimate: how much it would move |
| with more loans | stays about the same | shrinks like 1 / √n |
| principal, n = 400 | 112.6 m | 112.6 / √400 = 5.63 m |

> ⚠️ **Watch out.** An interval built with the sd instead of the SE is as wide as the data — √n times too wide. The sd is about loans; the SE is about your number.

**Your turn.** The SE of the branch FPD rate, 34 FPDs in 3 263 loans, in percentage points?

```task
{"id": "w06d2-l4", "kind": "number", "answer": 0.18, "dp": 2, "unit": "points", "hint": "p̂ = 34 / 3 263; SE = √(p̂ (1 − p̂) / n), then × 100.", "model": "p̂ = 1.04 %; √(0.01042 × 0.98958 / 3 263) = 0.00178 = 0.18 points — smaller than the app's 0.26, because the branch has more loans."}
```

### The law of large numbers — the average settles

**What it is.** The **law of large numbers** (*закон больших чисел*, ЗБЧ): as n grows, the sample mean gets closer to the population mean and stays there. It needs a finite mean — the Stretch shows a distribution that has none.

**How to write it.** Running mean after n draws = the sum of the first n values ÷ n.

```python
order = np.random.default_rng(2026).permutation(pop)          # the 7 828 principals in a random order
running = np.cumsum(order) / np.arange(1, len(order) + 1)      # the mean after 1, 2, 3, … loans
for n in (10, 100, 1000, 7828):
    print(n, round(running[n - 1] / 1e6, 2))                   # wild at first; exactly 51.71 m at 7 828
```

One shuffle gave **106.38 m** after 10 loans, **35.06 m** after 100, **52.06 m** after 1 000 and **51.71 m** after all 7 828. Early means swing because one SME loan (up to 599 m) outweighs ten Micro loans. The swings die out like 1 / √n.

**When you use it.**
- The reason a rate from 2 411 loans is worth more than a rate from 50.
- The reason not to judge a new branch on its first week: a running mean at n = 10 can be twice the truth.

**Your turn.** A new branch's average ticket after its first 10 loans is twice the book's. What does the law of large numbers tell you?

```task
{"id": "w06d2-l5", "kind": "choice", "options": ["The branch lends twice as much — act now", "Ten loans are too few: a running mean swings until n is large, so wait for more loans", "The mean of 10 loans already equals the population mean", "The branch's data must be wrong"], "answer": 1, "explain": "The average settles only as n grows. On principal, one shuffle gave 106 m after 10 loans against the true 51.7 m."}
```

### The central limit theorem — the mean becomes a bell

**What it is.** The **central limit theorem** (*центральная предельная теорема*, ЦПТ): the mean of n independent draws is approximately **normal**, with mean μ and sd σ / √n, **whatever the shape of the data**, once n is large enough. It is shown here by simulation, not proved.

**How to write it.** Take many samples of n loans, keep each sample's mean, look at the means. Loan principal is about as skewed as money gets: mean 51.7 m, median 5.79 m, skew 2.92. The notebook's 5 000 samples per n (`default_rng(2026)`, without replacement):

| n | sd of the 5 000 means | SE = σ / √n | skew of the means | share within ±1.96 SE |
|---|---|---|---|---|
| 5 | 49.08 m | 50.35 m | 1.33 | 95.6 % |
| 30 | 20.47 m | 20.56 m | 0.57 | 95.8 % |
| 100 | 11.32 m | 11.26 m | 0.30 | 94.7 % |
| 1 000 | 3.33 m | 3.56 m | 0.09 | 96.0 % |

See it yourself — 2 000 samples per n (your numbers will sit close to the table's):

```python
mu, sigma = pop.mean(), pop.std()                                          # 51.71 m, 112.6 m — the population
fig, axes = plt.subplots(1, 4, figsize=(14, 3))
for ax, n in zip(axes, (5, 30, 100, 1000)):
    means = np.array([rng.choice(pop, n, replace=False).mean() for _ in range(2000)])   # 2 000 sample means
    ax.hist(means / 1e6, bins=40, color="#9bb7d4"); ax.axvline(mu / 1e6, color="#c0392b")
    ax.set_title(f"n = {n}: sd {means.std() / 1e6:.1f} m, SE {sigma / np.sqrt(n) / 1e6:.1f} m", fontsize=9)
plt.tight_layout(); plt.show()
```

The spread of the means follows σ / √n, and their skew melts from 1.33 to 0.09: the bell appears. At n = 1 000 the spread is a little below σ / √n because we take 13 % of a finite population without replacement: × √((7 828 − 1 000) / 7 827) = 0.934 gives 3.32 m — the **finite-population correction**.

**When you use it.**
- It is why one t interval or one z-test works on money: they need the *mean* to be normal, not the loans.
- It warns you: the more skewed the data, the larger the n before a normal-based interval keeps its promise.

> ⚠️ **Watch out.** "n ≥ 30 is enough" is folklore. At n = 30 these means are still skewed (0.57), and an interval that assumes normality covers less than it promises (see "What 95 % means"). How many is "many" depends on the skew.

**Your turn.** According to the CLT, *what* becomes approximately normal?

```task
{"id": "w06d2-l6", "kind": "choice", "options": ["The loan principals themselves, once n ≥ 30", "The mean of n loans, once n is large enough — later for skewed data", "Every sample, always", "Only data that were normal to begin with"], "answer": 1, "explain": "Loan amounts stay skewed forever. The average of many of them is close to normal — at n = 100 the means' skew is 0.30, at n = 1 000 it is 0.09."}
```

### Confidence interval for a mean — t, not z

**What it is.** A **confidence interval** (*доверительный интервал*, CI) is a range of plausible values for a parameter: **estimate ± critical value × SE**. For a mean, the critical value comes from **Student's t** distribution (*распределение Стьюдента*) with n − 1 **degrees of freedom** (*степени свободы*), because s stands in for the unknown σ. The z value 1.96 is the limit of t as n grows.

**How to write it.** Mean ± t(0.975, n − 1) × s / √n.

| df | 4 | 9 | 29 | 49 | 99 | 999 | ∞ (z) |
|---|---|---|---|---|---|---|---|
| t₀.₉₇₅ | 2.776 | 2.262 | 2.045 | 2.010 | 1.984 | 1.962 | 1.960 |

```python
cons = loans.loc[loans["product_id"] == 2, "principal"].to_numpy(dtype=float)   # the 2 418 Consumer loans (product_id 2 = CONS)
smp = rng.choice(cons, 50, replace=False)                     # your 50 loans — the notebook's draw: mean 27 486 400, s 12 617 221
m, s50, n = smp.mean(), smp.std(ddof=1), 50                   # estimate, sample sd (ddof=1), size
se = s50 / np.sqrt(n)                                         # standard error — notebook: 1 784 345
t_crit = 2.0096                                               # t(0.975, df = 49), from the table above — scipy.stats.t.ppf(0.975, 49)
print(round(m - t_crit * se), round(m + t_crit * se))         # t interval — notebook: 23 900 625 … 31 072 175
print(round(m - 1.96 * se), round(m + 1.96 * se))             # z: a little narrower (23 989 085 … 30 983 715)
print(round(cons.mean()))                                     # the true Consumer mean: 26 926 915 — inside?
# scipy (the notebook): scipy.stats.t.interval(0.95, n - 1, loc=m, scale=se)
```

On the notebook's 50 loans the t interval is 23.90–31.07 m, and the true Consumer mean, 26.93 m, is inside. Excel: `=CONFIDENCE.T(0.05, STDEV.S(B2:B51), 50)` → half-width **3 585 775**; `=T.INV.2T(0.05, 49)` → 2.0096; `=NORM.S.INV(0.975)` → 1.96.

**When you use it.**
- An average with its precision: the average Consumer ticket, the average score of approved loans.

| | z interval | t interval |
|---|---|---|
| critical value | 1.96, always | t(0.975, n − 1): 2.262 at n = 10, 2.010 at n = 50 |
| assumes | σ is known | σ is estimated by s |
| width vs the other | narrower | 15 % wider at n = 10, 2.5 % at n = 50 |
| use it | practically never | always, for a mean |

**Your turn.** 400 loans: mean principal 51.7 m, s = 112.6 m, t(0.975, 399) = 1.966. The half-width of the 95 % t interval, in m soum?

```task
{"id": "w06d2-l7", "kind": "number", "answer": 11.07, "dp": 2, "unit": "m soum", "hint": "SE = 112.6 / √400; half-width = 1.966 × SE.", "model": "SE = 112.6 / 20 = 5.63 m; 1.966 × 5.63 = 11.07 m, so the interval is about 40.6–62.8 m."}
```

### Confidence interval for a proportion — the Wald interval

**What it is.** The **Wald interval** is the textbook interval for a rate: p̂ ± 1.96 × √(p̂ (1 − p̂) / n). It assumes the rate's sampling distribution is a symmetric bell. Near 0 % it is not: a rate cannot go below zero but can go far above.

```pic
{"id": "w06d2-pic2", "title": "Near 0 %, the Wald interval breaks", "caption": "On 41 FPDs in 2 411 app loans Wald is fine — Wilson sits close. On 2 FPDs in 150 loans it reaches below zero, and on 0 in 120 it shrinks to a point at zero: the two red rows.", "chart": {"type": "intervals", "rows": [{"label": "app, Wald", "lo": 1.18, "mid": 1.7, "hi": 2.22, "miss": false}, {"label": "app, Wilson", "lo": 1.26, "mid": 1.7, "hi": 2.3, "miss": false}, {"label": "2/150, Wald", "lo": -0.5, "mid": 1.33, "hi": 3.17, "miss": true}, {"label": "0/120, Wald", "lo": 0, "mid": 0, "hi": 0, "miss": true}], "ref": {"at": 0, "label": "0 %"}, "min": -1, "max": 3.5, "unit": " %"}}
```

**How to write it.**

```python
def wald(k, n, z=1.96):                       # k events in n trials
    p = k / n                                 # the estimate p̂
    half = z * math.sqrt(p * (1 - p) / n)     # critical value × standard error
    return p - half, p + half

for name, k, n in [("app", 41, 2411), ("2 in 150", 2, 150), ("0 in 120", 0, 120)]:
    print(name, [round(100 * v, 2) for v in wald(k, n)])
# app [1.18, 2.22] · 2 in 150 [-0.5, 3.17] · 0 in 120 [0.0, 0.0]
```

The app: 1.18–2.22 %. Two FPDs in 150 loans: −0.50 to 3.17 % — a negative default rate. Zero in 120: 0 to 0 — "certainly zero".

**When you use it.**
- A rate between about 20 % and 80 % on hundreds of cases (an approval rate on 2 000 applications).
- Quick planning arithmetic (sample size, below).

> ⚠️ **Watch out.** For a rate near 0 % — FPD, fraud, default — on a few hundred loans, Wald is too narrow, can go negative and collapses to zero width at 0 events. Default to Wilson (next).

**Your turn.** The upper limit of the Wald 95 % interval for the branch FPD rate, 34 / 3 263, in %?

```task
{"id": "w06d2-l8", "kind": "number", "answer": 1.39, "dp": 2, "unit": "%", "hint": "wald(34, 3263), then × 100.", "model": "p̂ = 1.04 %, SE 0.18 points, half-width 0.35: 0.69–1.39 %."}
```

### The Wilson interval — the right default for a rate

**What it is.** The **Wilson interval** (*интервал Уилсона*) is built by inverting the score test instead of assuming a bell around p̂. It is never negative, never zero-width, asymmetric in the right direction near 0 %, and covers close to 95 %. The **Clopper–Pearson** interval ("exact", *точный*) comes from the binomial itself; it guarantees *at least* 95 % and is therefore a little wide.

**How to write it.**

```text
centre     = (p̂ + z²/2n) / (1 + z²/n)
half-width = z √( p̂(1 − p̂)/n + z²/4n² ) / (1 + z²/n)
```

```python
def wilson(k, n, z=1.96):
    p = k / n
    centre = (p + z**2 / (2 * n)) / (1 + z**2 / n)                     # pulled a little towards 50 %
    half = z * math.sqrt(p * (1 - p) / n + z**2 / (4 * n**2)) / (1 + z**2 / n)
    return centre - half, centre + half
def pmf(k, n, p):                                                      # binomial P(X = k), from Day 1 (Practice uses it)
    return math.comb(n, k) * p**k * (1 - p)**(n - k)
def newcombe(k1, n1, k2, n2):                                          # 95 % CI for the difference p1 − p2
    p1, p2 = k1 / n1, k2 / n2
    l1, u1 = wilson(k1, n1); l2, u2 = wilson(k2, n2)
    d = p1 - p2
    return d, d - math.sqrt((p1 - l1)**2 + (u2 - p2)**2), d + math.sqrt((u1 - p1)**2 + (p2 - l2)**2)

for name, k, n in [("app", 41, 2411), ("branch", 34, 3263), ("partner", 16, 1425), ("2 in 150", 2, 150), ("0 in 120", 0, 120)]:
    print(name, "Wilson", [round(100 * v, 2) for v in wilson(k, n)], "Wald", [round(100 * v, 2) for v in wald(k, n)])
print("app − branch", [round(100 * v, 2) for v in newcombe(41, 2411, 34, 3263)])   # [0.66, 0.05, 1.33]
```

App **1.26–2.30 %**, branch **0.75–1.45 %**, partner **0.69–1.82 %**; 2 in 150 → 0.37–4.73 %; 0 in 120 → 0–3.10 %. The app's interval reaches 0.44 points below 1.70 and 0.60 above: the right shape for a rate near zero. Excel has no Wilson function — with k in B1, n in B2, z in B3 (`=NORM.S.INV(0.975)`):

```
lower: =(B1/B2 + B3^2/(2*B2) - B3*SQRT(B1/B2*(1-B1/B2)/B2 + B3^2/(4*B2^2))) / (1 + B3^2/B2)
upper: same with + before B3*SQRT
Clopper–Pearson: =BETA.INV(0.025, B1, B2-B1+1)  and  =BETA.INV(0.975, B1+1, B2-B1)
```

**When you use it.** Every rate, at any n — FPD, approval rate, PAR30. Clopper–Pearson when an auditor or a regulator wants 95 % guaranteed. For a **difference** of two rates, combine the two Wilson intervals (**Newcombe**): app − branch = 0.66 points, 95 % CI **0.05 to 1.33** points. Coverage of a "95 %" interval at the true rate 1.28 % (20 000 samples each, `proportion_confint(k, n, method=...)`, `default_rng(2026)`):

| n | Wald (`"normal"`) | Wilson (`"wilson"`) | Clopper–Pearson (`"beta"`) | samples with 0 FPDs |
|---|---|---|---|---|
| 100 | **72.7 %** | 95.9 % | 99.0 % | 27.1 % |
| 400 | **87.7 %** | 96.0 % | 98.0 % | 0.6 % |
| 2 000 | 94.0 % | 95.3 % | 96.3 % | 0 % |

A "95 %" Wald interval on a branch-month of 400 loans is really an 88 % interval. In Python all three are `proportion_confint(41, 2411, method="wilson" | "beta" | "normal")` from `statsmodels.stats.proportion`.

> ⚠️ **Watch out.** Two overlapping intervals are not a test of the difference. App (1.26–2.30 %) and branch (0.75–1.45 %) overlap, yet the Newcombe interval of their difference, 0.05 to 1.33 points, does not contain zero. Compare two rates with an interval for the difference — or tomorrow's test.

**Your turn.** The upper limit of the Wilson 95 % interval for the partner FPD rate, 16 / 1 425, in %?

```task
{"id": "w06d2-l9", "kind": "number", "answer": 1.82, "dp": 2, "unit": "%", "hint": "wilson(16, 1425), then × 100.", "model": "Partner: 1.12 %, Wilson 0.69–1.82 % (Wald 0.58–1.67 %). Wilson sits higher and is wider above the estimate than below."}
```

### What 95 % means — and what it does not

**What it is.** 95 % is a property of the **procedure** (*уровень доверия*, confidence level): if you repeated the sampling many times, 95 % of the intervals built this way would contain the true value. This one interval either contains it or not.

```pic
{"id": "w06d2-pic3", "title": "19 of 20 intervals catch the true mean", "caption": "20 samples of 400 loans drawn by computer (seed 2026), each with its 95 % t interval for the mean principal. 19 cover the true 51.71 m; one, in red, misses — the 5 % the method allows.", "chart": {"type": "intervals", "rows": [{"label": "sample 1", "lo": 36.77, "mid": 46.89, "hi": 57.01, "miss": false}, {"label": "sample 2", "lo": 34.41, "mid": 43.66, "hi": 52.92, "miss": false}, {"label": "sample 3", "lo": 48.35, "mid": 60.68, "hi": 73.01, "miss": false}, {"label": "sample 4", "lo": 34.65, "mid": 44.44, "hi": 54.23, "miss": false}, {"label": "sample 5", "lo": 35.96, "mid": 46.43, "hi": 56.9, "miss": false}, {"label": "sample 6", "lo": 39.02, "mid": 49.98, "hi": 60.94, "miss": false}, {"label": "sample 7", "lo": 51.9, "mid": 64.88, "hi": 77.85, "miss": true}, {"label": "sample 8", "lo": 41.63, "mid": 52.95, "hi": 64.27, "miss": false}, {"label": "sample 9", "lo": 44.48, "mid": 55.55, "hi": 66.63, "miss": false}, {"label": "sample 10", "lo": 40.59, "mid": 51.98, "hi": 63.37, "miss": false}, {"label": "sample 11", "lo": 41.42, "mid": 53.1, "hi": 64.79, "miss": false}, {"label": "sample 12", "lo": 35.33, "mid": 45.43, "hi": 55.54, "miss": false}, {"label": "sample 13", "lo": 48.48, "mid": 60.93, "hi": 73.37, "miss": false}, {"label": "sample 14", "lo": 44.84, "mid": 56.52, "hi": 68.2, "miss": false}, {"label": "sample 15", "lo": 43.61, "mid": 54.85, "hi": 66.1, "miss": false}, {"label": "sample 16", "lo": 38.13, "mid": 49.0, "hi": 59.86, "miss": false}, {"label": "sample 17", "lo": 39.47, "mid": 50.19, "hi": 60.9, "miss": false}, {"label": "sample 18", "lo": 38.97, "mid": 50.53, "hi": 62.08, "miss": false}, {"label": "sample 19", "lo": 33.3, "mid": 43.07, "hi": 52.84, "miss": false}, {"label": "sample 20", "lo": 32.63, "mid": 42.35, "hi": 52.08, "miss": false}], "ref": {"at": 51.71, "label": "μ = 51.71 m"}, "min": 30, "max": 80, "unit": " m"}}
```

**How to write it.** Run the procedure 100 times and count the hits:

```python
hits = 0
for _ in range(100):                                          # 100 samples of 400 loans
    x = rng.choice(pop, 400, replace=False)
    half = 1.966 * x.std(ddof=1) / math.sqrt(400)             # t(0.975, 399) × SE
    hits += (x.mean() - half <= pop.mean() <= x.mean() + half)
print(hits)                                                   # about 95 — one run gave 96
```

One run: **96 of the 100** intervals contain the true 51.71 m. With 100 intervals, anything from about 90 to 99 is normal — the count itself is Bin(100, 0.95).

| Right reading | Wrong reading |
|---|---|
| "We are 95 % confident: the method catches the true rate 95 times in 100." | "There is a 95 % probability that the true FPD is between 1.26 and 2.30 %." — the true value is fixed (that sentence is a Bayesian *credible* interval, Seeing Theory ch. 5) |
| "The data are consistent with a true rate between 1.26 and 2.30 %." | "95 % of app loans have an FPD rate in that range." — loans do not have rates; the interval is about the average |
| "Compare two rates with an interval for the difference." | "The intervals overlap, so there is no difference." |
| "95 % holds when the method's assumptions hold." | "95 % whatever the data." — t intervals on skewed principal cover **88.6 %** at n = 30, **93.0 %** at n = 100, **95.2 %** at n = 400 |

**When you use it.**
- Every time you say an interval out loud, in a meeting or in a note.

> ⚠️ **Watch out.** Never write "95 % probability the true rate is in 1.26–2.30 %". Write "95 % CI 1.26–2.30 %" or "the data are consistent with a true rate between 1.26 and 2.30 %".

**Your turn.** One sentence in this note to Bekzod is wrong — tap it:

```game
{"type": "bug", "id": "w06d2-g2", "title": "Spot the misreading", "q": "One sentence misreads the interval.", "code": "App FPD30 is 1.70 % on 2 411 loans.\nThe 95 % Wilson interval is 1.26–2.30 %.\nSo there is a 95 % probability that the true app rate is between 1.26 and 2.30 %.\nThe interval is asymmetric because a rate near zero cannot go below zero.\nWith four times as many loans the interval would be about half as wide.", "answer": [2], "why": "The true rate is fixed; this interval either contains it or not. 95 % describes the procedure over repeated samples."}
```

### Sample size for a given margin

**What it is.** The **margin of error** (*предельная ошибка*) E is the half-width of the interval. The **sample size** (*объём выборки*) you need is the n that makes the margin no larger than E. Solve E = z × SE for n.

**How to write it.**

```text
for a rate:   n = z² · p(1 − p) / E²     p = your best guess; 0.5 if you have none (the worst case)
for a mean:   n = (z · σ / E)²          σ = from history or a pilot
always round up
```

```python
z = 1.96
def n_for_rate(p, E):                              # loans needed to estimate a rate near p to ± E
    return math.ceil(z**2 * p * (1 - p) / E**2)
def n_for_mean(sigma, E):                          # cases needed to estimate a mean to ± E
    return math.ceil((z * sigma / E) ** 2)

print(n_for_rate(91 / 7099, 0.005), n_for_rate(0.5, 0.03))   # 1945 1068
print(n_for_mean(112.6e6, 5e6))                                # 1949
```

A rate near 1.28 % to within ±0.5 points needs 1 945 loans. A rate you know nothing about, to ±3 points, needs 1 068 — the "about a thousand" of opinion polls. The mean principal to ±5 m soum needs 1 949 loans.

| margin for a rate near 1.28 % | ±1 point | ±0.5 point | ±0.25 point |
|---|---|---|---|
| loans needed | 487 | 1 945 | 7 779 |

Halve the margin, quadruple the loans.

**When you use it.**
- Before a pilot, an audit sample or a survey: how many cases do we need?
- To say what precision a segment can ever reach: a branch with 400 loans a year cannot pin FPD to ±0.25 points.

> ⚠️ **Watch out.** E is in the same units as p: ±0.5 points is E = 0.005, not 0.5. And the formula uses Wald arithmetic — for a rate near 0 % with a small n, check the result with a Wilson interval.

**Your turn.** Applicants' credit scores have σ = 59.5. How many applicants do you need to estimate the mean score to within ±2 points (95 %)?

```task
{"id": "w06d2-l10", "kind": "number", "answer": 3401, "dp": 0, "unit": "applicants", "hint": "n = (1.96 × 59.5 / 2)², then round up.", "model": "(1.96 × 59.5 / 2)² = 58.31² = 3 400.06 → 3 401 applicants. Within ±4 points it would be a quarter of that: 851."}
```

### The bootstrap — an interval without a formula

**What it is.** The **bootstrap** (*бутстреп*) treats the sample as the population. It resamples the sample **with replacement** many times, computes the statistic each time, and reads the 2.5th and 97.5th percentiles: the **percentile bootstrap**.

**How to write it.**

```python
def bootstrap_ci(values, stat=np.mean, B=10_000, seed=2026):
    g = np.random.default_rng(seed)                                       # its own seeded generator
    boot = [stat(g.choice(values, len(values), replace=True)) for _ in range(B)]   # B resamples, the statistic of each
    return np.quantile(boot, [0.025, 0.975])                              # the middle 95 %
print(bootstrap_ci(f.loc[f.channel == "app", "fpd30"].to_numpy()))      # ≈ 1.20 % … 2.24 %   (Wilson 1.26 … 2.30)
```

The app's FPD: bootstrap ≈ 1.20–2.24 %, close to Wilson's 1.26–2.30 %. Its strength is a statistic with no SE formula: a 200-loan sample's **median** principal is 5.69 m, bootstrap 95 % CI **4.54–8.27 m** (true median 5.79 m).

**When you use it.**
- A median, a percentile, a ratio of sums (collection rate = Σ paid / Σ due), a difference of medians.
- A mean of very skewed money at small n, where the t interval undercovers.

> ⚠️ **Watch out.** With very few events the bootstrap is too narrow: it can only reshuffle what it saw. 7 FPDs in 314 grade-D loans: bootstrap 0.64–3.82 % against Wilson's 1.08–4.53 %. For rates near zero, Wilson; for medians and ratios, the bootstrap.

**Your turn.** Which estimate is the best job for the bootstrap?

```task
{"id": "w06d2-l11", "kind": "choice", "options": ["The FPD rate of 2 411 app loans", "The median principal of 200 loans", "The mean score of 13 612 applicants", "A rate with 7 events in 314 loans"], "answer": 1, "explain": "A median has no simple SE formula — the bootstrap's home ground. Rates go to Wilson (especially with few events); a mean of 13 612 scores takes a t interval."}
```

### Putting it together

One request, every tool of the day: *"Describe the app channel's FPD honestly, and say what more data would buy."*

```python
k, n = 41, 2411                                       # the sample: app loans in FPD scope
p = k / n                                             # the point estimate p̂
se = math.sqrt(p * (1 - p) / n)                       # its standard error
lo, hi = wilson(k, n)                                 # a rate near 0 % → Wilson, not Wald
print(f"FPD30 {100*p:.2f} % · n = {n} · SE {100*se:.2f} pt · 95 % CI {100*lo:.2f}–{100*hi:.2f} %")
print(n_for_rate(p, 0.0025))                          # loans needed for ±0.25 points
```

`FPD30 1.70 % · n = 2411 · SE 0.26 pt · 95 % CI 1.26–2.30 %`, and ±0.25 points would need **10 275** app loans — more than four times the channel's whole history. Read it with the subsections: the 2 411 loans are a sample of the app process; 1.70 % is an estimate with a sampling error; the SE says it typically moves by 0.26 points; the rate is near zero, so the interval is Wilson; "95 %" is the method's promise, not a probability about this range; and precision costs n quadratically.

**Which interval, when.**

| You estimate | Typical Nur example | Interval | Python | Excel |
|---|---|---|---|---|
| a mean, n ≥ ~30, not wildly skewed | average Consumer principal, average score | t | `stats.t.interval(0.95, n-1, m, s/√n)` | `CONFIDENCE.T` |
| a mean of very skewed money, small n | average SME ticket from 40 loans | bootstrap (or t on log values) | `bootstrap_ci(v)` | — |
| a rate, any n, especially near 0 % or 100 % | FPD, approval rate, PAR30 | Wilson | `proportion_confint(k, n, method="wilson")` | formula above |
| the difference of two rates | app − branch FPD | Newcombe | `newcombe(k1, n1, k2, n2)` | two Wilson formulas |
| a rate that must be *guaranteed* ≥ 95 % | regulatory / audit sample | Clopper–Pearson | `method="beta"` | `BETA.INV` |
| a median, a ratio of sums, a percentile | median ticket, collection rate | bootstrap | `bootstrap_ci(v, stat=np.median)` | — |
| a count per period | 5 102 applications in 3 549 hours | Poisson (exact) | `stats.chi2.ppf([0.025, 0.975], [2*k, 2*k + 2]) / 2`, then ÷ hours | `=CHISQ.INV(0.025, 2*k)/2` |

Default to a 95 % level and say so. Use 90 % only when a team agreed to it in advance — never because the 95 % interval "looked too wide".

```game
{"type": "sort", "id": "w06d2-g3", "title": "Which interval?", "q": "Put each Nur estimate under the interval you would report.", "groups": {"t interval": ["average Consumer principal from 400 loans", "average credit score of approved loans"], "Wilson": ["FPD30 of one branch-month (400 loans)", "approval rate of the app channel"], "Clopper–Pearson": ["an audit sample the regulator wants guaranteed at 95 %"], "Bootstrap": ["median ticket of 200 loans", "collection rate Σ paid / Σ due"]}}
```

Put the steps from a table to an honest number in order:

```game
{"type": "order", "id": "w06d2-g5", "title": "From a sample to an honest number", "items": ["Say what the population is — the book or the process", "Compute the point estimate from the sample", "Compute its standard error", "Choose the interval that fits the estimate (t, Wilson, bootstrap)", "Build the 95 % interval", "Report the estimate with n and the interval, read the right way"], "why": "Each step uses the one before: no SE without an estimate, no interval without the right SE, no honest sentence without n and the interval."}
```

Flip through the words of the day:

```game
{"type": "flash", "id": "w06d2-g1", "title": "Samples and estimates", "cards": [["Population", "everything you want to talk about — often the process, not the table"], ["Sample", "what you actually observed"], ["Parameter", "the true value in the population (p, μ) — unknown"], ["Estimate (statistic)", "the number computed from the sample (p̂ = 41 / 2 411)"], ["Unbiased", "right on average over repeated samples"], ["Consistent", "gets closer to the truth as n grows"], ["Standard error", "the sd of an estimate over repeated samples: s / √n, √(p̂(1 − p̂)/n)"], ["Degrees of freedom", "n − 1 for a mean: one value is used up by the sample mean"]]}
```

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Standard error — [Standard Deviation vs Standard Error, Clearly Explained!!! (StatQuest), 01:12](https://youtu.be/A82brFpdr9g?t=72)
- ▶ Central limit theorem — [The Central Limit Theorem, Clearly Explained!!! (StatQuest), 00:42](https://youtu.be/YAlJCEDH2uY?t=42)
- ▶ Confidence intervals — [Confidence Intervals, Clearly Explained!!! (StatQuest), 02:55](https://youtu.be/TqOeMYtOc1w?t=175)
- ▶ Confidence interval for a mean, formula route — [Confidence Interval [Simply explained] (numiqo)](https://youtu.be/ENnlSlvQHO0)
- ▶ Bootstrap — [Bootstrapping Main Ideas!!! (StatQuest), 06:40](https://youtu.be/Xz0x-8-cgaQ?t=400&end=493)
- ▶ Confidence interval (RU) — [Доверительный интервал за 15 мин. Биостатистика. (Kirill Milchakov)](https://youtu.be/MstzroncW28)

- RU deck (TBC Data Analytics 2.0, if you have it) `5.2 Statistics & Probability Theory.pdf` pp. 68–73: law of large numbers and CLT. `MS_lecture3.pdf` (lesson 5.3): sample method and sample properties pp. 5–13, point estimates — unbiased, consistent, efficient pp. 14–18, method of moments and maximum likelihood pp. 19–27, confidence intervals (Fisher's lemma; the mean with σ known and unknown; the variance) pp. 28–35. The lesson's recording: `video1414856026.mp4`.
- Notebooks: `MS_5_statistics.ipynb` (LLN with a coin and a die, CLT from other distributions), `MS6_Точечное_оценивание.ipynb` (unbiasedness and consistency by simulation), `MS6_Интервальное_оценивание.ipynb` (exact vs asymptotic interval, coverage at n = 3 … 1 000 — the same experiment as our Wald/Wilson table), `HW_3_CI.ipynb` (an interval for an exponential mean).
- Visual: Seeing Theory, chapter 4 (Frequentist Inference: the CLT and confidence intervals, interactive).
- *Russian terms:* генеральная совокупность = population, выборка = sample, оценка = estimate, точечная / интервальная оценка = point / interval estimate, несмещённость = unbiasedness, состоятельность = consistency, стандартная ошибка = standard error, закон больших чисел (ЗБЧ) = law of large numbers, центральная предельная теорема (ЦПТ) = central limit theorem, доверительный интервал = confidence interval, уровень доверия = confidence level, распределение Стьюдента = t distribution, степени свободы = degrees of freedom, бутстреп = bootstrap, асимптотический = asymptotic.

**Questions inside the videos.** Open a video from the panel: it stops at these points and asks one question about the bit you just watched.

```videoquiz
{"video": "A82brFpdr9g", "stops": [
  {"at": 200, "q": "What does the standard deviation describe?", "options": ["How much the individual values spread around their mean", "How much the mean would move between samples", "The error of the measuring device", "The difference between two groups"], "answer": 0, "explain": "sd describes the loans: how different 2 411 app loans are from each other."},
  {"at": 450, "q": "And the standard error?", "options": ["The spread of the data", "The largest possible error", "The spread of the estimate (e.g. the mean) over repeated samples — sd / √n", "The sd divided by n"], "answer": 2, "explain": "SE describes your number: quadruple n to halve it."}]}
```

```videoquiz
{"video": "YAlJCEDH2uY", "stops": [
  {"at": 150, "q": "The central limit theorem is about the distribution of…", "options": ["the raw data", "the means of many samples", "the largest value", "the population"], "answer": 1, "explain": "Loan principals stay skewed; the means of samples of them become bell-shaped."},
  {"at": 400, "q": "Does the CLT need the original data to be normal?", "options": ["Yes, always", "Only for n < 30", "No — the means become approximately normal whatever the shape, once n is large enough", "Only for rates"], "answer": 2, "explain": "Whatever the shape — but the more skewed the data, the larger n must be (principal at n = 30 is still skewed)."}]}
```

```videoquiz
{"video": "TqOeMYtOc1w", "stops": [
  {"at": 300, "q": "A 95 % confidence interval is built so that…", "options": ["95 % of the data fall inside it", "95 % of intervals made this way contain the true value", "the true value is inside with probability 95 % for this interval", "it is 95 % of the mean"], "answer": 1, "explain": "A property of the procedure; this one interval either contains the truth or not."},
  {"at": 600, "q": "What makes a confidence interval narrower?", "options": ["A higher confidence level", "More data", "More spread in the data", "A smaller sample"], "answer": 1, "explain": "Width ∝ critical value × s / √n: more n narrows it, more confidence widens it."}]}
```

```videoquiz
{"video": "ENnlSlvQHO0", "stops": [
  {"at": 150, "q": "The interval for a mean is…", "options": ["mean ± critical value × standard error", "mean ± sd", "median ± IQR", "mean ± 1.96 × sd"], "answer": 0, "explain": "Estimate ± critical value × SE: with s / √n, not the sd of the data."},
  {"at": 400, "q": "When σ is unknown and estimated by s, the critical value comes from…", "options": ["the normal distribution, always 1.96", "Student's t with n − 1 degrees of freedom", "the chi-square distribution", "the binomial"], "answer": 1, "explain": "t₀.₉₇₅ with 49 df = 2.010; it approaches 1.96 as n grows."}]}
```

```videoquiz
{"video": "Xz0x-8-cgaQ", "stops": [
  {"at": 430, "q": "How does the bootstrap build an interval?", "options": ["From a formula for the SE", "Resample the sample with replacement many times, compute the statistic each time, read the middle 95 %", "Split the data into two halves", "Add normal noise to the data"], "answer": 1, "explain": "The percentile bootstrap: 10 000 resamples, the 2.5th and 97.5th percentiles."},
  {"at": 485, "q": "Why is the bootstrap useful?", "options": ["It works for statistics with no simple SE formula — a median, a ratio of sums", "It always gives narrower intervals", "It needs no data", "It fixes small samples"], "answer": 0, "explain": "Median ticket, collection rate — but with very few events (7 FPDs) it is too narrow."}]}
```

```videoquiz
{"video": "MstzroncW28", "stops": [
  {"at": 200, "q": "What does a confidence interval add to a point estimate?", "options": ["A range of plausible values that shows how precise the estimate is", "A correction of the bias", "The median", "The probability that the estimate is right"], "answer": 0, "explain": "1.70 % alone hides n; 1.26–2.30 % shows how much the data allow."},
  {"at": 450, "q": "With the same data, a 99 % interval compared with a 95 % one is…", "options": ["narrower", "the same", "wider", "shifted to the right"], "answer": 2, "explain": "More confidence costs width: the critical value grows from 1.96 to 2.58."}]}
```

---

## 2. Worked example — Bekzod's channels (15 min)

**1. The sample — the counts** (week 5's FPD30 frame `f`): app 41 / 2 411, branch 34 / 3 263, partner 16 / 1 425. Each channel's loans are a sample of that channel's process, so each rate is an estimate.

**2. The method — the Wilson interval.** Rates near 1 % with n in the thousands: Wilson, not Wald. `wilson(k, n)` from section 1, or `proportion_confint(k, n, alpha=0.05, method="wilson")`.

**3. The table — each estimate with its interval.**

| channel | FPD / n | rate | Wilson 95 % | Wald 95 % (for comparison) |
|---|---|---|---|---|
| app | 41 / 2 411 | 1.70 % | **1.26–2.30 %** | 1.18–2.22 % |
| branch | 34 / 3 263 | 1.04 % | **0.75–1.45 %** | 0.69–1.39 % |
| partner | 16 / 1 425 | 1.12 % | **0.69–1.82 %** | 0.58–1.67 % |

**4. Read it — the standard error and what 95 % means.** The app's interval sits higher, but it overlaps the branch's between 1.26 and 1.45 %. Each interval is about ±0.5 points — two standard errors, as large as the gap Bekzod is asking about. Overlap is not a test: the interval for the difference (Newcombe, app − branch) is 0.05 to 1.33 points — anything from almost no gap to 1.3 points. With these sample sizes, a 0.66-point difference is near the edge of what the data can resolve.

**5. What more data would buy — sample size.** To know the app's rate to ±0.25 points would take `n_for_rate(41 / 2411, 0.0025)` = 10 275 app loans, more than four times the channel's history. Precision will not come from waiting a month.

**6. The sentence for Bekzod (today's half).** *"App FPD is 1.70 % and we are 95 % confident the channel's true rate is between 1.26 and 2.30 %; branch is 1.04 % (0.75–1.45 %). The intervals overlap a little, so the gap may be real or partly noise — tomorrow's test answers that directly."* Not "app is worse", not "no difference": the honest state of knowledge on Tuesday.

---

## 3. Practice (50 min)

Every task has its own answer box. The Python boxes share the session of section 1's blocks: `loans`, `pop`, `cons`, `f` (with `channel`), `rng`, `wald`, `wilson`, `pmf`, `newcombe`, `n_for_rate` and `bootstrap_ci` are ready once you have pressed ▶ Run on those blocks. The Excel task needs Excel or Google Sheets. For the homework, `data/python/week6/day2_starter.ipynb` builds the same frames (and `x`, the payments) with `scipy` and `statsmodels`.

**P1.** *(population and sample)* Nilufar takes all 7 099 loans in FPD scope and computes 91 / 7 099 = 1.28 %. She will use it to set next month's alarm. Which statement is right?

```task
{"id": "w06d2-p11", "kind": "choice", "options": ["1.28 % describes the book as it stands, and it is an estimate of the process that makes next month's loans", "1.28 % is the exact FPD probability of next month's loans", "1.28 % is a sample only because 7 099 is less than 7 828", "A rate computed from every loan cannot have any uncertainty"], "answer": 0, "explain": "For the book as it stands, 1.28 % is a parameter. For next month's loans — the question Nilufar cares about — the 7 099 loans are a sample of the lending process, and 1.28 % is an estimate."}
```

<details><summary>Answer</summary>

Both readings exist; the question decides. "What share of the loans we made defaulted on the first instalment?" — 1.28 % is a fact about those 7 099 loans. "How likely is an FPD on a loan we make next month?" — the 7 099 loans are a sample of the process, and 1.28 % is an estimate with a standard error of 0.13 points. Every alarm, forecast or comparison is the second kind.

</details>

**P2.** *(unbiased estimate, n − 1)* A pilot gives five credit scores: 620, 655, 700, 590, 685. Compute the variance with ddof = 0 and with ddof = 1. Which one goes into an interval, and by what factor do they differ?

```task
{"id": "w06d2-p12", "kind": "python", "starter": "x = np.array([620, 655, 700, 590, 685])   # five scores from a pilot\nprint(x.var())                             # numpy's default: ddof = 0, the population formula\n# add the sample variance (ddof = 1), 1 decimal\n", "answer": 2062.5, "dp": 1, "model": "print(x.var(ddof=1))      # 2062.5 — ddof 0 gives 1650.0, smaller by the factor 4 / 5"}
```

<details><summary>Answer</summary>

```python
x = np.array([620, 655, 700, 590, 685])
print(x.var(), x.var(ddof=1), x.var() / x.var(ddof=1))     # 1650.0 2062.5 0.8
```
The mean is 650; the squared distances add up to 8 250. Divided by 5: **1 650**; divided by 4: **2 062.5**. The ratio is (n − 1)/n = 0.8. An interval uses ddof = 1 (Excel `VAR.S`); at n = 5 the population formula would understate the spread by 20 %.

</details>

**P3.** *(sampling error)* Five more systematic samples: every 20th loan, starting at loans 6, 7, 8, 9 and 10. Print each sample's mean and its sampling error (mean − μ) in m soum. Which sample misses most, and by how many standard errors?

```task
{"id": "w06d2-p13", "kind": "python", "starter": "mu = pop.mean()\nfor start in range(5, 10):\n    part = loans[\"principal\"].iloc[start::20]\n    print(start + 1, round(part.mean() / 1e6, 2))\n# add the sampling error (part.mean() - mu) in m soum, 2 decimals — which sample misses most?\n", "answer": 14.44, "dp": 2, "model": "for start in range(5, 10):\n    part = loans[\"principal\"].iloc[start::20]\n    print(start + 1, round(part.mean() / 1e6, 2), round((part.mean() - mu) / 1e6, 2))\n# 6: 66.15, +14.44 · 7: 51.01, −0.70 · 8: 60.53, +8.82 · 9: 53.56, +1.85 · 10: 56.07, +4.36"}
```

<details><summary>Answer</summary>

| sample starts at loan | n | mean, m | sampling error, m |
|---|---|---|---|
| 6 | 392 | 66.15 | **+14.44** |
| 7 | 392 | 51.01 | −0.70 |
| 8 | 392 | 60.53 | +8.82 |
| 9 | 391 | 53.56 | +1.85 |
| 10 | 391 | 56.07 | +4.36 |

The sample starting at loan 6 misses by 14.44 m — about 2.5 standard errors (SE ≈ 5.7 m). Nothing is wrong with it: a few large SME loans happened to land in it. That is sampling error at its most visible, and it is why one sample's mean is never quoted without its interval.

</details>

**P4.** *(standard error)* The SE of the mean principal of 100 loans (σ = 112.6 m soum), in m soum. How many loans would halve it?

```task
{"id": "w06d2-p14", "kind": "number", "answer": 11.26, "dp": 2, "unit": "m soum", "hint": "SE = σ / √n.", "model": "112.6 / √100 = 11.26 m. Halving it needs four times the loans: 400 (SE 5.63 m)."}
```

<details><summary>Answer</summary>

SE = 112.6 / 10 = **11.26 m** — the CLT table's 11.32 m for n = 100 is the same number, measured by simulation. Halving the SE needs **400** loans: SE ∝ 1 / √n, so twice the precision costs four times the data.

</details>

**P5.** *(law of large numbers)* Shuffle the 7 099 FPD flags with a new seed and print the running FPD rate after 50, 500 and all 7 099 loans. Which numbers depend on the seed, and which one does not?

```task
{"id": "w06d2-p15", "kind": "python", "starter": "order = np.random.default_rng(7).permutation(f[\"fpd30\"].to_numpy())\nrunning = np.cumsum(order) / np.arange(1, len(order) + 1)     # the FPD rate after 1, 2, 3, … loans\nfor n in (50, 500):\n    print(n, round(100 * running[n - 1], 2))\n# add the running rate after all 7 099 loans, in %, 2 decimals\n", "answer": 1.28, "dp": 2, "model": "print(7099, round(100 * running[-1], 2))     # 1.28 — every seed ends here: it is all 91 FPDs over all 7 099 loans"}
```

<details><summary>Answer</summary>

After 50 loans the rate can be 0 % or 4 % (one FPD more or less moves it by 2 points); after 500 it is usually within about one point of 1.28 %; after 7 099 it is **1.28 %** exactly, whatever the seed — the running mean has used every loan. The swings shrink like 1 / √n: the law of large numbers in a 0/1 column.

</details>

**P6.** *(central limit theorem)* The CLT table: for n = 5, 30, 100, 1000 draw 5 000 samples of loan principal, report the sd and skew of the means against σ/√n. Explain the one row where sd < σ/√n.

```task
{"id": "w06d2-p4", "kind": "choice", "options": ["At n = 1 000 the CLT stops working", "At n = 1 000 we draw 13 % of a finite population without replacement, so the means vary less — the finite-population correction √((N − n)/(N − 1)) = 0.934", "The seed was different for that row", "σ was computed with ddof = 0"], "answer": 1, "explain": "3.56 m × 0.934 = 3.32 m — the simulated sd. When a sample is a tiny share of the population, the correction is ≈ 1 and you can forget it."}
```

<details><summary>Answer</summary>

The notebook's chart titles: sd 49.1 / 20.5 / 11.3 / 3.3 m against SE 50.3 / 20.6 / 11.3 / 3.6 m; skew 1.33 / 0.57 / 0.30 / 0.09. At n = 1 000 we take 13 % of a population of 7 828 without replacement, so the means vary less than independent draws would: the finite-population correction √((N − n)/(N − 1)) = 0.934 brings 3.56 down to 3.32 m. In practice samples are a tiny share of the population and the correction is 1.

</details>

**P7.** *(confidence interval for a mean)* Reproduce the notebook's 50-loan Consumer interval in Excel: paste the 50 principals into a column, then `AVERAGE`, `STDEV.S`, `CONFIDENCE.T`. Is the true mean inside? What would a 99 % interval be?

```task
{"id": "w06d2-p2", "kind": "number", "answer": 4.78, "dp": 2, "unit": "m soum (99 % half-width)", "hint": "=CONFIDENCE.T(0.01, s, 50) — the t value for 99 % with 49 df is about 2.680; SE = 12 617 221 / √50.", "model": "SE = 12 617 221 / √50 = 1 784 345; 2.680 × 1 784 345 = 4.78 m, so the 99 % interval is 22.70–32.27 m against 23.90–31.07 m at 95 %. More confidence, more width."}
```

<details><summary>Answer</summary>

Mean 27 486 400, s 12 617 221, `=CONFIDENCE.T(0.05, s, 50)` = 3 585 775 → **23.90–31.07 m**, contains 26.93 m. 99 %: `=CONFIDENCE.T(0.01, s, 50)` = t₀.₉₉₅,₄₉ (2.680) × 1 784 345 = 4.78 m → 22.70–32.27 m. More confidence, wider interval — the trade you always make.

</details>

**P8.** *(t vs z)* Ten loans instead of fifty: `rng = np.random.default_rng(2026); s10 = rng.choice(cons, 10, replace=False)`. The z interval and the t interval. How much wider is t, and which one would you sign?

```task
{"id": "w06d2-p3", "kind": "choice", "options": ["The same — n does not change the critical value", "About 2.5 % wider; either is fine", "About 15 % wider (2.262 vs 1.96); sign the t interval", "About 50 % wider; sign the z interval because it is tighter"], "answer": 2, "explain": "t with 9 df is 2.262: 2.262 / 1.96 = 1.15. Only t has the coverage it claims at n = 10 (if the data are near normal)."}
```

<details><summary>Answer</summary>

Mean **31.34 m**; z: 23.07–39.60 m; t (2.262 instead of 1.96): **21.80–40.87 m**, 15 % wider. Only t has the coverage it claims at n = 10 (if the data were normal — Consumer principals are close to symmetric, skew small; for SME principals even t would undercover).

</details>

**P9.** *(Wald interval)* SE of the book's FPD rate (91 / 7 099); its Wald and Wilson 95 % intervals. Why are the two almost the same here and not at n = 400?

```task
{"id": "w06d2-p1", "kind": "python", "starter": "k, n = 91, 7099\np = k / n\nprint(round(100 * math.sqrt(p * (1 - p) / n), 3))     # SE, in points\n# add the Wald and the Wilson 95 % intervals, in %, 2 decimals\n", "answer": 1.57, "dp": 2, "model": "print([round(100 * v, 2) for v in wald(k, n)], [round(100 * v, 2) for v in wilson(k, n)])\n# [1.02, 1.54] [1.05, 1.57] — with 91 events the binomial is already close to normal"}
```

<details><summary>Answer</summary>

SE = √(0.01282 × 0.98718 / 7 099) = **0.134 points**. Wald **1.02–1.54 %**, Wilson **1.05–1.57 %**. With 91 events the binomial is already close to normal; at n = 400 there are only ~5 events and the skew near zero is what Wald ignores (88 % coverage).

</details>

**P10.** *(Wilson interval)* Wald vs Wilson on two small branch-months: 2 FPDs in 150 loans, and 0 in 120. Which numbers would you put on a dashboard?

```task
{"id": "w06d2-p5", "kind": "python", "starter": "for k, n in [(2, 150), (0, 120)]:\n    print(k, n, \"Wald\", [round(100 * v, 2) for v in wald(k, n)])\n# add the Wilson interval for both, in %, 2 decimals\n", "answer": 3.1, "dp": 2, "model": "for k, n in [(2, 150), (0, 120)]:\n    print(k, n, \"Wilson\", [round(100 * v, 2) for v in wilson(k, n)])\n# 2 150 Wilson [0.37, 4.73] · 0 120 Wilson [0.0, 3.1] — never negative, never zero-width"}
```

<details><summary>Answer</summary>

2 / 150: Wald **−0.50 % to 3.17 %** (statsmodels clips it to 0–3.17 and hides the problem), Wilson **0.37–4.73 %**, Clopper–Pearson 0.16–4.73 %. 0 / 120: Wald **0–0**, Wilson **0–3.10 %**, CP 0–3.03 %. Wilson: it says honestly "somewhere between almost nothing and about 3–5 %". The rule of three gives the same feel for zero events: the upper 95 % bound ≈ 3 / n = 2.5 %.

</details>

**P11.** *(Wilson interval — coverage)* Coverage experiment: with `default_rng(2026)`, draw 20 000 values of k ~ Bin(400, 0.01282) and compute the share of Wald, Wilson and Clopper–Pearson intervals that contain 0.01282. In the box below, do it without simulation noise: k can only be 0, 1, …, 400, so the **exact** coverage is the sum of P(X = k) over the k whose interval contains p. The starter does it for Wald; add Wilson.

```task
{"id": "w06d2-p6", "kind": "python", "starter": "p, n = 91 / 7099, 400\ncover = sum(pmf(k, n, p) for k in range(n + 1) if wald(k, n)[0] <= p <= wald(k, n)[1])\nprint(round(100 * cover, 1))      # Wald: the exact share of samples whose interval contains p\n# add the same for wilson(), in %, 1 decimal\n", "answer": 95.9, "dp": 1, "model": "cover = sum(pmf(k, n, p) for k in range(n + 1) if wilson(k, n)[0] <= p <= wilson(k, n)[1])\nprint(round(100 * cover, 1))      # 95.9 — Wald gives 88.1: a '95 %' interval that is really an 88 % one"}
```

<details><summary>Answer</summary>

```python
# uses statsmodels: it loads on the first ▶ Run (the notebook has it too)
rng = np.random.default_rng(2026); p = 91 / 7099
k = rng.binomial(400, p, 20_000)
for m in ("normal", "wilson", "beta"):
    lo, hi = proportion_confint(k, 400, method=m); print(m, np.mean((lo <= p) & (p <= hi)))
```
Run in the order of the table (n = 100 first, then 400, then 2 000, one generator): **87.7 % / 96.0 % / 98.0 %** at n = 400. Wald misses on the high side: in samples with 1–2 FPDs its upper limit is too low, and that is exactly the case where a small branch looks "safe".

</details>

**P12.** *(what 95 % means)* "95 %" by experiment: 100 samples of 400 loans, a t interval for the mean principal from each. How many contain 51.71 m? Then repeat 10 000 times at n = 30.

```task
{"id": "w06d2-p8", "kind": "choice", "options": ["Exactly 95 — otherwise the method is broken", "Anything from about 90 to 99 — the count itself is Bin(100, 0.95)", "Anything from 50 to 100", "Only 99 or 100"], "answer": 1, "explain": "96 of 100 is a pass. At n = 30 on skewed principal, though, 10 000 intervals cover only 88.6 %: the promise needs a near-normal mean."}
```

<details><summary>Answer</summary>

`rng = default_rng(2026)`: **96 of 100** — around 95, as promised (with 100 intervals, anything from about 90 to 99 is normal: Bin(100, 0.95)). At n = 30, 10 000 intervals: **88.6 %**. The procedure keeps its promise only when the sampling distribution is near normal; with skew 2.9 and n = 30 it is not. For money at small n: a larger n, a log scale, or the bootstrap — and say so.

</details>

**P13.** *(sample size)* Sample size for a target precision: how many first instalments do you need to estimate a rate near 1.28 % to within ±0.25 points (95 %)? ±0.5 points? (Wald arithmetic is fine for planning: n = z² p(1 − p) / E².)

```task
{"id": "w06d2-p9", "kind": "number", "answer": 7779, "dp": 0, "unit": "first instalments (±0.25 points)", "hint": "E = 0.0025, p = 91 / 7 099, z = 1.96; round up.", "model": "1.96² × 0.01282 × 0.98718 / 0.0025² = 7 778.9 → 7 779; for ±0.5 points 1 945 — halve the margin, quadruple the loans."}
```

<details><summary>Answer</summary>

1.96² × 0.01282 × 0.98718 / 0.0025² = **7 779** first instalments for ±0.25 points; **1 945** for ±0.5. Nur's whole book (7 099) is just short of the first: a channel- or branch-level FPD to a quarter of a point is out of reach for years. Precision costs n quadratically — halve the margin, quadruple the loans.

</details>

**P14.** *(bootstrap)* Bootstrap: 95 % CI for the app's FPD (10 000 resamples, seed 2026) next to Wilson; then for the **median** principal of a 200-loan random sample.

```task
{"id": "w06d2-p7", "kind": "choice", "options": ["A symmetric ± SE around the median, like for a mean", "An asymmetric interval (about −1.2 m / +2.6 m around 5.69 m) with no SE formula needed — money is skewed, so the interval is too", "No interval: a median has no uncertainty", "Exactly the Wilson interval"], "answer": 1, "explain": "Bootstrap median: 5.69 m, 95 % CI 4.54–8.27 m, the true 5.79 m inside. For the app's FPD the bootstrap (1.20–2.24 %) sits close to Wilson."}
```

<details><summary>Answer</summary>

App: bootstrap **1.20–2.24 %**, Wilson 1.26–2.30 % — close, the bootstrap slightly lower and narrower (it is symmetric around the sample's own 41 events). Median: `rng = default_rng(2026); s = rng.choice(pop, 200, replace=False)`, then 10 000 medians of resamples → sample median **5.69 m**, CI **4.54–8.27 m**, true median 5.79 m inside. Note the asymmetry (−1.2 m / +2.6 m): there is no "± SE" formula for a median, and the bootstrap does not need one.

</details>

> 🚀 **Stretch (optional, +5 XP).** **P15.** *(law of large numbers — when it fails)* When the LLN fails. Draw 100 000 values from a Cauchy distribution (`rng.standard_cauchy`, seed 2026) and from a standard normal; print the running mean after 10, 100, 1 000, 10 000, 100 000 draws. What happens, why, and why does it matter for loan money even though no loan is Cauchy?

```task
{"id": "w06d2-p10", "kind": "choice", "options": ["The Cauchy running mean settles at 0, only more slowly", "The Cauchy running mean keeps jumping, because the Cauchy has no finite mean — there is nothing to converge to", "Both settle at 0 after 1 000 draws", "The normal one jumps; the Cauchy one settles"], "answer": 1, "explain": "Cauchy: still 0.96 after 100 000 draws; normal: 0.000. Loan amounts are bounded, so the LLN holds — but heavy right tails make it slow.", "xp": 2}
```

<details><summary>Answer</summary>

Cauchy: −0.544, 0.554, −0.007, **1.058, 0.957** — still jumping at 100 000. Normal: −0.121, 0.045, 0.021, −0.002, −0.000 → 0. The Cauchy has no finite mean (its tails are so heavy that one draw can outweigh all the others), so there is nothing for the average to converge to — the RU deck `5.2 Statistics & Probability Theory.pdf` shows the Cauchy on pp. 54–57. Loan amounts are bounded (product limits), so the LLN and CLT do hold — but heavy right tails make them **slow**: SME principals need far larger n than Micro principals before an interval keeps its 95 %.

</details>

### Mistakes people make

- "The 95 % CI has a 95 % chance of containing the true value" — the procedure has; this interval either does or does not.
- The sd of the loans used where the SE of the estimate belongs (an interval for the mean that is as wide as the data).
- `STDEV.P` / `np.std()` (ddof 0) in a sample interval — numpy's default is the population formula; pass `ddof=1` (pandas' `.std()` already does).
- A Wald interval on a 1 % rate with a few hundred loans: 88 % coverage, negative limits, zero-width intervals at 0 events.
- "The intervals overlap, so no difference" — the test of the difference is tomorrow's tool, not the eye.
- A rate on a dashboard without n: 2.4 % from 586 loans and 2.4 % from 58 loans are different statements.
- The bootstrap on 5 events: it can only resample what it saw — too narrow.
- A random sample built with `random.sample` and no seed: nobody can reproduce your interval.

---

## 4. Homework <span class="badge hw">HW 6.2 — Due Day 5</span>

**Bekzod's error bars.** In `data/python/week6/day2_starter.ipynb` write `wald_ci`, `wilson_ci`, `bootstrap_ci` and `fpd_ci_table(f, by)`, run `fpd_ci_table` for **channel** and for **risk_grade**, and draw **one figure with two panels** (channel, grade): the rate as a dot, the Wilson interval as an error bar, the label `app (n = 2 411)`. Save it as `hw62_fpd_ci.png`. Under it, **five sentences** for Bekzod (the notebook lists what each must say). Hand in the executed notebook and the PNG with the 📎 box below.

Graded on (20 points): (a) the numbers — FPD, n, rate, Wilson and bootstrap limits for 3 channels and 4 grades, matching the asserts and the model (8), (b) the chart — dots with error bars from zero-free axes in %, n in every label, grades in order A → D, a title that states the finding (6), (c) the five sentences — the overlap read correctly, the widest interval explained by n, Wilson vs bootstrap, a dashboard proposal, the question for tomorrow (6). **Bonus +20:** `clopper_pearson(k, n)` from `scipy.stats.beta` (not statsmodels) passing its assert, with the exact interval added to both tables and one sentence on when you would report it instead of Wilson.

**Check your table here before you hand in.** The grade counts are A 10 / 1 667, B 30 / 3 084, C 44 / 2 034, D 7 / 314 (the `wilson` function from section 1 works).

**H1.** The upper limit of grade D's Wilson 95 % interval, in %?

```task
{"id": "w06d2-hw1", "kind": "number", "answer": 4.53, "dp": 2, "unit": "%", "hint": "wilson(7, 314) — then × 100.", "model": "Grade D: 7 / 314 = 2.23 %, Wilson 1.08–4.53 % — the widest interval of all seven rows."}
```

**H2.** The lower limit of grade A's Wilson 95 % interval, in %?

```task
{"id": "w06d2-hw2", "kind": "number", "answer": 0.33, "dp": 2, "unit": "%", "hint": "wilson(10, 1667) — then × 100.", "model": "Grade A: 10 / 1 667 = 0.60 %, Wilson 0.33–1.10 %. A's and C's intervals (1.62–2.89 %) do not overlap: the scorecard orders FPD."}
```

**H3.** Why is grade D's interval the widest?

```task
{"id": "w06d2-hw3", "kind": "choice", "options": ["Because grade D's rate is the highest", "Because it has the fewest loans (314) — and only 7 events, so the interval is wide and asymmetric", "Because Wilson is wrong for grade D", "Because grade D loans are larger"], "answer": 1, "explain": "Width is driven by n (and by how few events there are): 7 FPDs cannot pin a rate down. Grade C has a higher count and a much narrower interval."}
```

**H4.** Your first two sentences for Bekzod: how to read the overlap of the app and branch intervals, and what a dashboard tile should show.

```task
{"id": "w06d2-hw4", "kind": "free", "min": 30, "model": "App FPD30 is 1.70 % (95 % CI 1.26–2.30 %) and branch 1.04 % (0.75–1.45 %); the intervals overlap a little, which does not prove there is no difference — tomorrow's test of the difference answers that. Every FPD tile should show the rate, n and the Wilson interval, e.g. 'FPD30 1.70 % · n = 2 411 · 95 % CI 1.26–2.30 %', so nobody reads noise in a small denominator as a signal.", "rubric": ["gives both rates with their intervals", "says overlap is not a test of the difference", "proposes rate + n + interval on every tile", "uses Wilson (not Wald) and names it"]}
```

### 📎 Hand in here

```sqltask
{"check": "handin-W6D2", "lesson": "W6D2", "title": "HW 6.2", "why": "Bekzod will stop reading rates without error bars: this table and chart become the template for every FPD figure in the risk pack.", "graded": ["the numbers: FPD, n, rate, Wilson and bootstrap limits for 3 channels and 4 grades (8)", "the chart: dots with error bars, n in every label, grades A → D, a title that states the finding (6)", "the five sentences: overlap, widest interval, Wilson vs bootstrap, dashboard proposal, tomorrow's question (6)", "bonus +20: clopper_pearson from scipy.stats.beta with its assert and one sentence"], "tasks": [{"id": "day2_starter.ipynb", "file": "day2_starter.ipynb", "names": ["day2_starter.ipynb"], "upload": true, "accept": ".ipynb", "q": "Attach `day2_starter.ipynb` — what the page above asks for."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else the page lists (one more file, or a .zip of several)."}]}
```

---

## 5. Self-check

Three questions, one at a time. Wrong? The explanation points to the part of section 1 to reread.

```check
{"id": "w06d2-sc", "questions": [
  {"type": "single", "q": "A colleague: 'the 95 % CI for app FPD is 1.26–2.30 %, so there is a 95 % chance the true rate is in there.' What is the correct reading?", "options": ["Correct as said", "The method that built it catches the true rate in 95 % of repeated samples; this interval either contains it or not", "95 % of app loans have a rate in that range", "There is a 5 % chance the rate is 1.70 %"], "answer": 1, "explain": "95 % is a property of the procedure; the true rate is fixed (→ section 1, 'What 95 % means')."},
  {"type": "single", "q": "Why does a Wald interval for 2 FPDs in 150 loans go below zero?", "options": ["Because 150 is below 400", "Because Wald assumes the rate's sampling distribution is a symmetric bell, and near 0 % it is skewed — use Wilson", "Because of a rounding error", "Because the SE should use n − 1"], "answer": 1, "explain": "Wilson: 0.37–4.73 %, never negative and close to 95 % coverage (→ section 1, 'The Wilson interval', P10)."},
  {"type": "single", "q": "Loan principal has skew 2.9. When does a t interval for the MEAN principal keep its 95 % promise?", "options": ["Never — the data are not normal", "When n is large enough for the mean to be near-normal: about 95 % at n = 400, only 89 % at n = 30", "Only with ddof = 0", "Always, whatever n"], "answer": 1, "explain": "The CLT makes the mean normal, slowly for skewed money; at small n use more data, logs or the bootstrap (→ section 1, 'The central limit theorem', P12)."}
]}
```

---

## 6. Company corner <span class="badge company">Reporting a rate honestly</span>

Every rate on a dashboard is an estimate from n loans. The honest tile has **three numbers**: the rate, n, and the interval — `FPD30 1.70 % · n = 2 411 · 95 % CI 1.26–2.30 %`. Without n and the interval, the reader cannot tell a signal from a small denominator, and the most common decision in a lending company — **ranking branches** — becomes a ranking of luck.

FPD30 by branch (the branch the loan is booked to), Wilson 95 %, sorted by rate, with the **funnel limits**: the range a branch of that size would show 95 % of the time if its true rate were the book's 1.28 % (`stats.binom.ppf([0.025, 0.975], n, 91/7099) / n`):

| branch | FPD / n | rate | Wilson 95 % | funnel 95 % at 1.28 % | P(≥ this many \| 1.28 %) |
|---|---|---|---|---|---|
| Bukhara Central | 14 / 586 | **2.39 %** | 1.43–3.97 % | 0.51–2.22 % | 0.02 |
| Tashkent Central | 14 / 913 | 1.53 % | 0.92–2.56 % | 0.66–2.08 % | 0.29 |
| Tashkent South | 14 / 917 | 1.53 % | 0.91–2.55 % | 0.65–2.07 % | 0.29 |
| Samarkand Central | 10 / 782 | 1.28 % | 0.70–2.34 % | 0.51–2.17 % | 0.55 |
| Namangan Central | 8 / 634 | 1.26 % | 0.64–2.47 % | 0.47–2.21 % | 0.57 |
| Termez Central | 5 / 437 | 1.14 % | 0.49–2.65 % | 0.46–2.52 % | 0.66 |
| Fergana Central | 9 / 834 | 1.08 % | 0.57–2.04 % | 0.60–2.04 % | 0.74 |
| Andijan Central | 6 / 635 | 0.94 % | 0.43–2.05 % | 0.47–2.20 % | 0.82 |
| Tashkent North | 8 / 921 | 0.87 % | 0.44–1.70 % | 0.65–2.06 % | 0.90 |
| Nukus Central | 3 / 440 | **0.68 %** | 0.23–1.99 % | 0.45–2.50 % | 0.92 |

```python
# uses scipy and statsmodels: they load on the first ▶ Run (the notebook has them too)
p0 = 91 / 7099
b = f.groupby("branch_name")["fpd30"].agg(fpd="sum", n="size")
b[["lo", "hi"]] = [proportion_confint(k, n, method="wilson") for k, n in zip(b.fpd, b.n)]
b["funnel_lo"] = stats.binom.ppf(0.025, b.n, p0) / b.n
b["funnel_hi"] = stats.binom.ppf(0.975, b.n, p0) / b.n
b["p_ge"] = stats.binom.sf(b.fpd - 1, b.n, p0)          # how surprising this many FPDs is at the book rate
```

**The ranking trap.** The "worst" branch (Bukhara, 1.43–3.97 %) and the "best" (Nukus, 0.23–1.99 %) **overlap between 1.43 and 1.99 %**: the data cannot even put the top and the bottom of the league table in a reliable order. Simulate a book in which all ten branches have exactly 1.28 % (`default_rng(2026)`, 10 000 books, the same n's): the top branch averages **2.00 %**, exceeds Bukhara's 2.39 % in **10.5 %** of books, and the bottom branch is below Nukus's 0.68 % in **50 %** of books. Somebody is always first and last; a league table of rates guarantees a "worst branch" even when there is none.

What Bukhara's row does say: it is the one branch above its funnel (14 FPDs where 13 is the 97.5 % limit, P(≥ 14) = 0.02). One branch out of ten past a 95 % limit is roughly what chance produces — Thursday's multiple-comparisons day tests exactly this. The right action is to **watch** Bukhara (next quarter's vintages, the officer mix), not to punish it.

Rules for the risk pack, from today:

1. Every rate with n and a 95 % Wilson interval (a bar with whiskers, or a small grey "± 0.5 pt" next to the number).
2. No league tables of rates below ~1 000 loans per row; a **funnel plot** (rate vs n with the 95 % / 99.8 % limits around the book rate) instead — a branch is flagged by the funnel, not by its rank.
3. Thin cells (a vintage × channel with 67 loans) shown greyed with the count, never as a bare 5.97 %.
4. Pool to quarters when months are thin: a quarter of a branch has three times the n and a √3 narrower interval.

Put the steps of an honest branch review in order:

```game
{"type": "order", "id": "w06d2-g4", "title": "Before anyone ranks the branches", "items": ["Count FPDs and loans per branch", "Compute each rate with its n and its Wilson interval", "Draw the funnel limits around the book rate for each branch's n", "Flag only the branches outside the funnel", "Ask how many flags chance alone would produce", "Look for a cause (products, officers, vintages) before anyone acts"], "why": "A rank says who is first, not whether first means anything; the funnel and the count of flags do."}
```

> 🎯 **Interview version.** *"Branch X has the highest default rate. What do you do?"* — Ask for n and the interval; compare it with the funnel limits for its size, not with the other branches' ranks; check whether one in ten branches past a 95 % limit is more than chance; then look for a cause (mix of products, officers, vintages) before anyone acts.

**Say it like in an interview.** *"Bukhara has the highest FPD rate of our ten branches. What do you do?"* — answer in 3–5 sentences, as you would to an interviewer.

```task
{"id": "w06d2-cc", "kind": "free", "min": 30, "model": "First I ask for n and the interval: Bukhara is 14 FPDs in 586 loans, 2.39 % with a Wilson interval of 1.43–3.97 %, which overlaps even the 'best' branch's interval. Then I compare it with the funnel limits for a branch of its size at the book rate — it is just above (14 against a 97.5 % limit of 13) — and remember that with ten branches one past a 95 % limit is roughly what chance produces. So I would watch Bukhara's next vintages and its product and officer mix rather than act on the ranking.", "rubric": ["asks for n and the interval", "compares with a funnel limit for its size, not with ranks", "mentions that ten branches make one false flag likely", "proposes watching / finding a cause before acting"]}
```

Tomorrow: the test. Bekzod's question becomes H₀: p_app = p_branch, a z statistic, a p-value — and Nilufar's yes/no for the risk committee.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w06d2", "pass": 0.8, "questions": [
  {"type": "single", "q": "App FPD: 95 % CI 1.26–2.30 %. Which reading is correct?", "options": ["There is a 95 % probability the true app rate is between 1.26 and 2.30 %", "95 % of app loans have an FPD rate in that range", "The procedure captures the true rate in 95 % of repeated samples; this interval either contains it or not", "If two channels' intervals overlap, the channels do not differ"], "answer": 2, "explain": "95 % is a property of the procedure; the true rate is fixed, and overlap is not a test (→ section 1, 'What 95 % means')."},
  {"type": "single", "q": "Why Wilson rather than Wald for an FPD rate near 1.28 % on a branch-month of 400 loans?", "options": ["Near 0 % a rate's sampling distribution is skewed: a '95 %' Wald covers about 88 %, can go negative and collapses to zero width at 0 events", "Wald needs a seed", "Wilson works only for very large n", "Wilson is always narrower"], "answer": 0, "explain": "Wilson inverts the score test: never negative, asymmetric the right way, close to 95 % coverage (→ section 1, 'The Wilson interval')."},
  {"type": "single", "q": "Which line makes this interval slightly too narrow?", "code": "m = smp.mean()                                  # line 1\ns = np.std(smp)                                 # line 2\nse = s / np.sqrt(len(smp))                      # line 3\nstats.t.interval(0.95, len(smp) - 1, loc=m, scale=se)   # line 4", "options": ["line 1", "line 2 — numpy's std defaults to ddof=0, the population formula", "line 3", "line 4 — a z value is needed instead of t"], "answer": 1, "explain": "A sample interval needs ddof=1 (pandas' .std() already uses it; numpy does not) (→ Mistakes, section 1 'A good estimate')."},
  {"type": "number", "q": "How many first instalments do you need to estimate a rate near p = 91 / 7 099 to within ±0.5 points at 95 %? (n = z² p(1 − p) / E², round up)", "answer": 1945, "tol": 3, "explain": "1.96² × 0.01282 × 0.98718 / 0.005² ≈ 1 945; for ±0.25 points it is four times as many (→ section 1, 'Sample size for a given margin', P13)."},
  {"type": "multi", "q": "Which statements about the bootstrap are true?", "options": ["With 5 events it is reliable for a rate near 0 %", "It resamples the sample with replacement", "It needs normally distributed data", "It gives an interval for a median or a ratio of sums, where no SE formula exists", "Seed it so a reviewer gets your interval"], "answer": [1, 3, 4], "explain": "It can only reshuffle what it saw, so with few events it is too narrow — Wilson for rates near zero, bootstrap for medians and ratios (→ section 1, 'The bootstrap')."},
  {"type": "single", "q": "To halve the standard error of an estimate, the sample size must be…", "options": ["squared", "halved", "doubled", "quadrupled"], "answer": 3, "explain": "SE = s / √n, so halving it needs four times the n (→ section 1, 'Standard error')."},
  {"type": "single", "q": "By hand, Wald gives −0.50 % to 3.17 % for 2 FPDs in 150 loans. What goes on the dashboard?", "code": "proportion_confint(2, 150, method=\"normal\")   # Wald", "options": ["Wilson, about 0.37–4.73 %: never negative and close to 95 % coverage", "Wald as statsmodels prints it (clipped to 0–3.17 %)", "No interval — 150 loans is too few", "Only the rate, 1.33 %"], "answer": 0, "explain": "statsmodels clips the Wald limit and hides the problem; Wilson says honestly 'between almost nothing and about 5 %' (→ P10)."},
  {"type": "single", "q": "Company corner: Bukhara has the highest FPD30 of ten branches (14 / 586). What should the risk pack do?", "options": ["Show the rate with n and its Wilson interval and compare it with the funnel limits for its size; watch it rather than punish it", "Report the rate without n — n confuses readers", "Rank the branches and act on the worst", "Drop Bukhara from the book rate"], "answer": 0, "explain": "A league table guarantees a 'worst branch' even when all are equal; a funnel flags by size-adjusted limits, not by rank (→ Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w06d2", "q": "Bekzod hears that the app 'got better this year'. From the week's FPD frame f (7 099 loans in scope), take only the loans disbursed in 2026 and the app channel. What is the UPPER limit of the 95 % Wilson interval for their FPD30 rate? Give a percentage to 3 decimals.", "type": "number", "dp": 3, "python": true, "h": ["d140dc0d86cd3fe8d4ddba6b"], "hint": "Two conditions on f, then k and n — and the interval method that does not trust a normal shape near zero.", "sol": "ZnJvbSBzdGF0c21vZGVscy5zdGF0cy5wcm9wb3J0aW9uIGltcG9ydCBwcm9wb3J0aW9uX2NvbmZpbnQKZyA9IGZbKGZbImRpc2J1cnNlZF9hdCJdID49ICIyMDI2LTAxLTAxIikgJiAoZlsiY2hhbm5lbCJdID09ICJhcHAiKV0KaywgbiA9IGdbImZwZDMwIl0uc3VtKCksIGxlbihnKSAgICAgICAgICAgICAgICAgICAgICAgIyAxMCwgNzg3CnByb3BvcnRpb25fY29uZmludChrLCBuLCBhbHBoYT0wLjA1LCBtZXRob2Q9IndpbHNvbiIpICAjICgwLjAwNjkyLCAwLjAyMzIzKQoKMjAyNiBhcHAgbG9hbnM6IDEwIEZQRHMgaW4gNzg3ID0gMS4yNyAlLCBXaWxzb24gOTUgJSAwLjY54oCTMi4zMiAlLgpUaGUgcG9pbnQgZXN0aW1hdGUgaXMgbG93ZXIgdGhhbiB0aGUgd2hvbGUtaGlzdG9yeSBhcHAgcmF0ZSAoMS43MCAlKSwgYnV0IHRoZSBpbnRlcnZhbCBpcyB3aWRlIGVub3VnaCB0byBjb250YWluIGl0IGNvbWZvcnRhYmx5OiB3aXRoIDc4NyBsb2FucyB0aGUgZGF0YSBjYW5ub3QgdGVsbCAnYmV0dGVyJyBmcm9tICd0aGUgc2FtZScuClRoZSBzZW50ZW5jZSBmb3IgQmVrem9kOiAndGhlIDIwMjYgYXBwIHJhdGUgbG9va3MgbG93ZXIsIGJ1dCBvbiAxMCBkZWZhdWx0cyBpdCBjb3VsZCBiZSBhbnl3aGVyZSBmcm9tIDAuNyB0byAyLjMgJSDigJQgd2FpdCBmb3IgbW9yZSB2aW50YWdlcyBiZWZvcmUgY2FsbGluZyBpdCBhbiBpbXByb3ZlbWVudC4n"}
```

<!-- challenge:end -->
