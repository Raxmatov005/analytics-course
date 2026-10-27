# Week 6 · Day 3 — Hypothesis tests I: is the difference real?

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 6.1 due · HW 6.2 (due Day 5)</span> <span class="badge company">Company corner</span>

> STORY **Wednesday, 9:00.** Nilufar again, this time with the risk-committee agenda for Friday. *"I read your intervals. Overlapping, not overlapping — the committee does not do 'a little'. **So is app worse? I need a yes or a no, with the evidence**, on half a page. If the answer is yes, marketing loses its favourite channel; if it is no and we are wrong, we lose money for a year. Whatever you write, I have to defend it."* Jasur: *"Then write down the probability of being wrong before you write the answer."*

## Today in 3 lines

- A test is a rule for deciding with a known error rate: **H₀ and H₁**, a **test statistic**, its distribution under H₀, the **p-value** (the precise definition — and the three wrong ones everyone uses), **α**, **type I and type II errors**, one- vs two-sided.
- The tests of the day on Nur data: **one-sample t** and **one-proportion z** (against a target), **z-test for two proportions** (app vs branch FPD: z = 2.15, **p = 0.032**), **chi-square** (FPD × channel: **p = 0.078**; late payment × grade: p ≈ 0), **t-test and Welch** (scores by channel), **paired vs independent** (the same ten branches, 2025 vs 2026), with the assumptions checked (Shapiro, QQ, Levene).
- **Significance ≠ importance**: every result reported with an **effect size** — difference in rates, relative risk, Cohen's d, *extra FPDs per 1 000 loans* — and Nilufar gets her six-line risk-committee note.

---

## 1. Learn — the logic of a test

Press ▶ Run on this block first. It loads the data and the tools that every box on this page uses.

```python
import math
import numpy as np
import pandas as pd
from statistics import NormalDist
Phi = NormalDist().cdf                                    # the standard normal CDF, Φ — turns a z into a p-value

f = pd.read_csv("data/powerbi/fct_first_instalment.csv", parse_dates=["disbursed_at"])   # week 5's FPD frame: 7 099 loans, fpd30 = 0/1
f["channel"] = f["product"].map({"MICRO": "app", "BNPL": "partner"}).fillna("branch")   # app = Micro only, partner = BNPL only
f["year"] = f["disbursed_at"].dt.year
apps = pd.read_csv("data/raw/applications.csv")           # 14 000 applications; 388 have no credit score
print(f.groupby("channel")["fpd30"].agg(["sum", "size"]))  # app 41 / 2 411 · branch 34 / 3 263 · partner 16 / 1 425
```

Three channels, three FPD counts: app 41 of 2 411 loans (1.70 %), branch 34 of 3 263 (1.04 %), partner 16 of 1 425 (1.12 %). Most of this page asks one question about them: is the app's higher rate real, or noise?

### H₀ and H₁ — the courtroom logic

**What it is.** A **hypothesis test** (*проверка статистических гипотез*) is a rule for choosing between two statements about the population, with a known error rate. The **null hypothesis** H₀ (*нулевая гипотеза*) says "nothing is going on". The **alternative** H₁ (*альтернативная гипотеза*) is what you will claim if the data make H₀ hard to believe.

**How to write it.**

```text
H₀: p_app = p_branch        "nothing is going on" — H₀ always holds the "="
H₁: p_app ≠ p_branch        what you claim if H₀ falls
decision: reject H₀   or   fail to reject H₀       — never "accept H₀"
```

A test works like a trial:

| Courtroom | Hypothesis test |
|---|---|
| presumed innocent | H₀ is assumed true |
| the evidence | the data |
| guilty beyond reasonable doubt | reject H₀: data like ours would be rare if H₀ were true |
| "not guilty" | fail to reject H₀ — not proven, which is not "innocent" |

For Nilufar: H₀ says the app and branch channels share one FPD rate; H₁ says they do not.

**When you use it.**
- Before every test: write H₀ and H₁ in words and in symbols, before you look at a p-value.
- "Is A different from B?", "Did X change?", "Is the rate still at target?" — each becomes an H₀ with an "=".

> ⚠️ **Watch out.** "Fail to reject H₀" never means "H₀ is true". Partner vs branch gives p = 0.80: with 1 425 partner loans the data cannot tell the two apart. That is not proof that they are equal.

**Your turn.** Bekzod asks: "Did FPD30 change between 2025 and 2026?" Which pair of hypotheses fits?

```task
{"id": "w06d3-l1", "kind": "choice", "options": ["H₀: the 2026 FPD30 rate is lower than 2025's; H₁: it is not", "H₀: the 2026 FPD30 rate equals 2025's; H₁: it differs", "H₀: the rates differ; H₁: they are equal", "H₀: the 2026 rate is 1.08 %; H₁: the 2025 rate is 1.55 %"], "answer": 1, "explain": "H₀ is the 'nothing changed' statement and holds the '='; H₁ is what you would claim if the data rule H₀ out."}
```

### The test statistic — distance from H₀ in units of noise

**What it is.** A **test statistic** (*статистика критерия*) is one number that says how far the data are from H₀, measured in units of the noise you would see if H₀ were true. Most of today's statistics have one shape: (what you observed − what H₀ says) / standard error.

**How to write it.** In words: the observed gap, minus the gap H₀ expects (zero), divided by the gap's standard error under H₀.

```python
gap = 41 / 2411 - 34 / 3263                           # observed: app rate − branch rate
p0 = 75 / 5674                                        # the one rate H0 says both channels share (pooled)
se = math.sqrt(p0 * (1 - p0) * (1 / 2411 + 1 / 3263)) # the noise of the gap if H0 were true (the two-proportion section explains it)
z = (gap - 0) / se                                    # H0 says the gap is 0
print(round(gap * 100, 2), round(se * 100, 3), round(z, 2))   # 0.66 0.307 2.15
```

The gap is 0.66 points and the noise is 0.307 points, so the gap is 2.15 noise-units away from H₀: z = 2.15.

| \|z\| | how unusual if H₀ is true |
|---|---|
| below 1 | ordinary — happens all the time |
| about 2 | unusual — about 1 sample in 20 goes this far |
| 3 or more | very rare — about 3 samples in 1 000 |

**When you use it.**
- Every test turns the data into one statistic: z for rates, t for means, χ² for tables.
- A statistic near 0 agrees with H₀; a large one (either sign) argues against it.

**Your turn.** Two branches' FPD rates differ by 0.40 points; the standard error of that gap under H₀ is 0.25 points. What is z?

```task
{"id": "w06d3-l2", "kind": "number", "answer": 1.6, "dp": 1, "unit": "z", "hint": "(observed gap − 0) / standard error.", "model": "z = 0.40 / 0.25 = 1.6 — the gap is 1.6 standard errors away from 'no difference'."}
```

### The p-value — one right definition, three wrong ones

**What it is.** The **p-value** (*p-значение*) is *the probability, computed assuming H₀ is true, of getting a test statistic at least as extreme as the one observed.* Small p: data like ours would be rare in the H₀ world.

| The p-value says | The p-value does **not** say |
|---|---|
| how often data this extreme appear **if** H₀ is true | the probability that H₀ is true |
| | the probability that the result is "due to chance" |
| | how big or important the effect is |

**How to write it.** Two ways. The formula: two-sided p = 2 · (1 − Φ(|z|)). The definition: build the H₀ world by simulation and count how often it looks as extreme as ours.

```python
print(round(2 * (1 - Phi(abs(2.147))), 4))                # 0.0318 — the formula: both tails beyond |z|

rng = np.random.default_rng(2026)                         # the H0 world: both channels at the pooled rate 1.322 %
p0 = 75 / 5674
diff = rng.binomial(2411, p0, 100_000) / 2411 - rng.binomial(3263, p0, 100_000) / 3263
print(np.mean(np.abs(diff) >= 41/2411 - 34/3263))          # 0.0321 — the share of H0 samples with a gap ≥ 0.66 points either way
```

If both channels had the same FPD rate, a gap of 0.66 points or more, in either direction, would appear in about 3.2 % of samples of this size: p = 0.032.

**When you use it.**
- To decide (next subsection: compare p with α).
- To say how surprising the data are under H₀ — never how likely H₀ is.

> ⚠️ **Watch out.** "p = 0.032" never means "a 3.2 % chance that H₀ is true" or "a 3.2 % chance it is luck". The condition comes first — *if* H₀ is true, data this extreme turn up 3.2 % of the time — exactly like P(D | A) on Day 1. And p > 0.05 is not proof of no difference.

**Your turn.** One sentence of this analysis misreads the p-value — tap it.

```game
{"type": "bug", "id": "w06d3-g2", "title": "Spot the wrong conclusion", "q": "One sentence misreads the p-value.", "code": "App FPD30 is 1.70 % (41 / 2 411) against 1.04 % for branch (34 / 3 263).\nA two-sided two-proportion z-test gives z = 2.15, p = 0.032.\nSo there is only a 3.2 % chance that the two channels have the same FPD rate.\nAt α = 5 %, fixed in advance, we reject H₀.\nThe difference is +0.66 points (95 % CI +0.05 to +1.33), about 7 extra FPDs per 1 000 loans.", "answer": [2], "why": "The p-value is computed assuming H₀ is true, so it cannot be the probability that H₀ is true."}
```

### α, type I and type II errors, power

**What it is.** The **significance level** α (*уровень значимости*) is the false-alarm rate you accept, chosen **before** you see the data — 5 % by convention. You reject H₀ when p < α. Two mistakes are possible:

| | H₀ true (no real difference) | H₀ false (a real difference) |
|---|---|---|
| reject H₀ | **type I error** (*ошибка I рода*), probability α — "app is worse" when it is not | correct — probability = **power** (*мощность*) = 1 − β |
| fail to reject | correct | **type II error** (*ошибка II рода*), probability β — a real deterioration missed |

**Power** is the chance of catching a real effect. Day 4 shows how n, the effect size and α set it.

**How to write it.** The decision rule is one line:

```python
alpha = 0.05                                    # fixed BEFORE looking at the data
p = 0.0318                                      # app vs branch, two-sided
print("reject H0" if p < alpha else "fail to reject H0")   # reject H0
```

At α = 5 % the app-vs-branch p of 0.032 rejects H₀; at α = 1 % the same data would not.

**When you use it.**
- α = 5 % by default; 1 % when a false alarm is expensive (closing a channel); 10 % for a cheap first screen.
- Lowering α buys fewer false alarms with more misses. Only more data reduces both.

> ⚠️ **Watch out.** α chosen after seeing p is not α. "p = 0.07, so let us use 10 %" turns the test into a story.

**Your turn.** Sort the outcomes.

```game
{"type": "sort", "id": "w06d3-g5", "title": "Which error?", "q": "Tap a situation, then the box it belongs in.", "groups": {"Type I error (false alarm)": ["The app's true FPD equals branch's, but the test says 'app is worse'", "A reminder SMS does nothing, but the test declares it a success"], "Type II error (a miss)": ["Grade D's FPD really rose, but the test says 'no evidence'", "The new scorecard really is better, but the small pilot fails to show it"], "Correct decision": ["A real rise in FPD is detected", "No real difference, and the test does not reject H₀"]}}
```

### One-sided or two-sided

**What it is.** A **two-sided** test (*двусторонний критерий*) asks "different in either direction" and counts both tails. A **one-sided** test (*односторонний критерий*) asks only "higher" (or only "lower") and counts one tail, so its p-value is half as large.

**How to write it.**

```python
z = 2.147                                        # app vs branch
print(round(1 - Phi(z), 4))                      # 0.0159 — one-sided, H1: p_app > p_branch (upper tail only)
print(round(2 * (1 - Phi(abs(z))), 4))           # 0.0318 — two-sided, H1: p_app ≠ p_branch (both tails)
```

The same z gives a one-sided p of 0.016 and a two-sided p of 0.032.

**When you use it.**

| | Two-sided | One-sided |
|---|---|---|
| H₁ | ≠ | > (or <) |
| use when | a result in either direction would change what you do | the other direction leads to the same action as "no difference", and you wrote that down **before** the data |
| Nilufar's committee | ✓ — a much *better* app channel would also change policy | ✗ |

> ⚠️ **Watch out.** Switching to one-sided after you see which group is higher halves the p-value for free. It is the cheapest form of p-hacking. Default to two-sided.

**Your turn.** When is a one-sided test allowed?

```task
{"id": "w06d3-l3", "kind": "choice", "options": ["Always — it gives a smaller p-value", "When the direction was decided before the data and the other direction would lead to the same action as 'no change'", "When the two-sided p is between 0.05 and 0.10", "When the samples are small"], "answer": 1, "explain": "One-sided is a promise made in advance: 'if it goes the other way, I act as if nothing happened'. Choosing it after looking is p-hacking."}
```

### One-sample test for a mean — z or t

**What it is.** A **one-sample test** (*одновыборочный критерий*) compares the mean of one sample with a fixed number μ₀: a target, a benchmark, a value from a contract. The statistic is **t = (x̄ − μ₀) / (s / √n)**. It is called **z** when the population σ is known (almost never) and **t** when you estimate it with the sample's s (always in practice); t has n − 1 **degrees of freedom**.

**How to write it.** In words: the sample mean minus the H₀ value, divided by the standard error of the mean. One line of context: the scorecard vendor says applicants average 660 points — is that still true in 2026?

```python
s26 = apps.loc[apps["applied_at"].str[:4] == "2026", "credit_score"].dropna()   # 2026 applicants with a score
mu0 = 660                                        # H0: the 2026 average is still 660
se = s26.std() / math.sqrt(len(s26))             # standard error of the mean: s / √n
t = (s26.mean() - mu0) / se                      # the test statistic
print(len(s26), round(s26.mean(), 1), round(se, 2), round(t, 2), round(2 * (1 - Phi(abs(t))), 3))
# 5361 658.6 0.81 -1.74 0.083 — with 5 360 df the t tail and the normal tail are the same
# small n: stats.ttest_1samp(x, 660) uses the t distribution (scipy)   Excel: =T.DIST.2T(ABS(t), COUNT(r) - 1)
```

5 361 applicants average 658.6, which is 1.4 points below 660 — that is 1.74 standard errors, p = 0.083, so there is no evidence at 5 % that the average moved.

**When you use it.**
- "Is the average still at the target?" — average ticket against the plan, average score against the vendor's value, average days late against an SLA.
- z or t? The difference matters only at small n. Two-sided 5 % cut-offs:

| n | 5 | 10 | 30 | 100 | thousands |
|---|---|---|---|---|---|
| t cut-off (df = n − 1) | 2.78 | 2.26 | 2.05 | 1.98 | 1.96 = z |

> ⚠️ **Watch out.** With n = 10, using the normal's 1.96 instead of t's 2.26 makes you reject too often. Below about 30 per group use the t distribution (`stats.t`, `T.DIST.2T`) — and look at the data's shape (Day 4).

**Your turn.** Same question for 2026 **partner** applicants only: is their average credit score 660?

```task
{"id": "w06d3-l4", "kind": "python", "starter": "p26 = apps.loc[(apps[\"applied_at\"].str[:4] == \"2026\") & (apps[\"channel\"] == \"partner\"), \"credit_score\"].dropna()\n# t = (mean − 660) / (sd / √n) — print t (2 decimals) and the two-sided p\n", "answer": -2.74, "dp": 2, "model": "t = (p26.mean() - 660) / (p26.std() / math.sqrt(len(p26)))\nprint(len(p26), round(p26.mean(), 1), round(t, 2), round(2 * (1 - Phi(abs(t))), 4))   # 1040 655.0 -2.74 0.0062"}
```

### Two-sample t-test — Welch by default

**What it is.** The **two-sample t-test** (*двухвыборочный t-критерий*) compares the means of two independent groups. **Student's** version (*t-критерий Стьюдента*) assumes both groups have the same variance. **Welch's** version (*t-критерий Уэлча*) does not, and loses almost nothing when they are equal — so use Welch by default.

**How to write it.** In words: the difference in means, divided by the standard error of that difference, where each group keeps its own variance: t = (x̄₁ − x̄₂) / √(s₁²/n₁ + s₂²/n₂).

```python
def welch_t(a, b):
    se = math.sqrt(a.var() / len(a) + b.var() / len(b))     # SE of the difference: each group keeps its own variance
    t = (a.mean() - b.mean()) / se
    return t, 2 * (1 - Phi(abs(t)))                         # normal tail: fine with hundreds per group

sa = apps.loc[apps["channel"] == "app", "credit_score"].dropna()       # applicants, app
sb = apps.loc[apps["channel"] == "branch", "credit_score"].dropna()    # applicants, branch
print(round(sa.mean(), 1), round(sb.mean(), 1), [round(v, 3) for v in welch_t(sa, sb)])   # 661.0 659.6 [1.233, 0.218]

loans = pd.read_csv("data/raw/loans.csv").merge(apps[["application_id", "channel", "credit_score"]], on="application_id")
la = loans.loc[loans["channel"] == "app", "credit_score"].dropna()     # approved loans, app
lb = loans.loc[loans["channel"] == "branch", "credit_score"].dropna()  # approved loans, branch
print(round(la.mean(), 1), round(lb.mean(), 1), [round(v, 3) for v in welch_t(la, lb)])   # 683.2 679.8 [2.482, 0.013]
# scipy: stats.ttest_ind(sa, sb, equal_var=False)   Excel: =T.TEST(r1, r2, 2, 3)  (2 = two-tailed, 3 = unequal variances)
```

| credit score | app | branch | Welch t | p |
|---|---|---|---|---|
| applicants | 661.0 | 659.6 | 1.23 | 0.218 |
| approved loans | 683.2 | 679.8 | 2.48 | 0.013 |

App and branch applicants arrive with the same scores (p = 0.22); among approved loans the app's 3.4-point lead is significant (p = 0.013), but on a scale whose sd is 52 it is tiny — the effect-size subsection measures it.

**When you use it.**
- "Is the average X different between two groups?" — scores, tickets, days late, two independent groups.
- Student vs Welch: always Welch (`equal_var=False`). It is right when variances differ and almost identical when they do not.

> ⚠️ **Watch out.** Welch on principal by channel gives t = −43, p ≈ 0 — and means nothing. App loans are all Micro, partner loans all BNPL, branch loans Auto, Consumer and SME: channel and product are **confounded** (*смешаны*), and no test separates them. Nilufar's FPD gap is also a Micro-vs-other-products gap.

**Your turn.** Approved loans: app mean 683.16 (sd 51.70, n = 2 598), branch mean 679.80 (sd 53.07, n = 3 491). Compute Welch's t from these summaries.

```task
{"id": "w06d3-l5", "kind": "number", "answer": 2.48, "dp": 2, "unit": "Welch t", "hint": "SE = √(51.70² / 2 598 + 53.07² / 3 491); t = (683.16 − 679.80) / SE.", "model": "SE = √(1.029 + 0.807) = 1.355; t = 3.36 / 1.355 = 2.48 — the approved-loan result in the table above."}
```

### Paired vs independent samples

**What it is.** **Paired samples** (*связанные (парные) выборки*) come in pairs: each value in one group has a partner in the other — the same branch in two years, the same customer before and after. A **paired t-test** works on the **differences** inside each pair. That removes the variation between units, which an independent test counts as noise.

**How to write it.** In words: compute one difference per pair, then run a one-sample t-test of those differences against 0. Example: FPD30 of the same ten branches, 2025 vintages vs 2026 vintages.

```python
w = f[f["year"].isin([2025, 2026])].pivot_table(index="branch_name", columns="year", values="fpd30", aggfunc="mean") * 100
d = w[2026] - w[2025]                                      # ten differences, one per branch
print(round(d.mean(), 2), round(d.mean() / (d.std() / math.sqrt(len(d))), 2))   # -0.58 -2.56 — the paired t statistic
# with only 9 df the p-value needs the t distribution — scipy (it loads on the first run):
print(stats.ttest_rel(w[2026], w[2025]))     # t = -2.56, p = 0.031
print(stats.ttest_ind(w[2026], w[2025]))     # t = -2.05, p = 0.055 — the wrong test throws away the pairing
```

The ten branches fell by 0.58 points on average; paired, that gives t = −2.56 and p = 0.031, while the unpaired test on the same numbers gives p = 0.055.

**When you use it.**

| | Paired | Independent |
|---|---|---|
| the data | the same units measured twice | two separate groups of units |
| example | ten branches, 2025 and 2026 | app loans vs branch loans |
| test | `ttest_rel`, `T.TEST(…, 2, 1)` | Welch, `T.TEST(…, 2, 3)` |

> ⚠️ **Watch out.** Running an independent test on paired data wastes the pairing: a branch with a high rate in 2025 tends to stay high, and that spread hides the change. Here it turns p = 0.031 into 0.055.

**Your turn.** Which comparison is paired?

```task
{"id": "w06d3-l6", "kind": "choice", "options": ["Credit scores of app applicants vs branch applicants", "Days late of 200 customers on their first loan and on their second loan", "FPD30 of grade A loans vs grade C loans", "Ticket sizes in Tashkent vs in Bukhara"], "answer": 1, "explain": "The same 200 customers are measured twice, so each first-loan value has a partner: paired. The other three compare two different sets of units."}
```

### Test for one proportion — z

**What it is.** The **one-proportion z-test** (*z-критерий для одной доли*) compares a sample's rate p̂ = k / n with a fixed rate p₀: a budget, a target, a rate from a contract. The statistic is z = (p̂ − p₀) / √(p₀(1 − p₀) / n).

**How to write it.** In words: the observed rate minus the H₀ rate, divided by the noise a rate would have if H₀ were true. One line of context: the 2026 budget assumed FPD30 of 1.5 %; the 2026 vintages show 25 FPDs in 2 322 loans.

```python
def one_prop_z(k, n, p0):
    se = math.sqrt(p0 * (1 - p0) / n)              # the noise of a rate IF H0 (rate = p0) is true — p0, not k / n
    z = (k / n - p0) / se
    return z, 2 * (1 - Phi(abs(z)))                # z and the two-sided p-value

print([round(v, 3) for v in one_prop_z(25, 2322, 0.015)])   # [-1.678, 0.093]
# Excel: =(25/2322 - 0.015) / SQRT(0.015*(1-0.015)/2322), then =2*(1-NORM.S.DIST(ABS(z),TRUE))
```

2026 runs at 1.08 %, 0.42 points under budget — 1.68 standard errors, p = 0.093, so the data do not yet show at 5 % that 2026 is below the 1.5 % budget.

**When you use it.**
- "Is this rate at the target?" — an FPD rate against the budget, an approval rate against a partner's contract, a fraud rate against the vendor's claim.
- It needs n·p₀ ≥ 10 and n·(1 − p₀) ≥ 10; with fewer expected events use the exact binomial (Day 1's `at_least`, Day 4).

> ⚠️ **Watch out.** The test's SE uses **p₀**, the rate H₀ claims. Yesterday's confidence interval used p̂. Mixing them gives a slightly wrong z — and a test that disagrees with its own H₀.

**Your turn.** Grade C was priced for an FPD30 of 1.5 %. It shows 44 FPDs in 2 034 loans. What is z?

```task
{"id": "w06d3-l7", "kind": "number", "answer": 2.46, "dp": 2, "unit": "z", "hint": "p̂ = 44 / 2 034; SE = √(0.015 × 0.985 / 2 034); z = (p̂ − 0.015) / SE.", "model": "p̂ = 2.16 %, SE = 0.270 points, z = (2.163 − 1.5) / 0.270 = 2.46, p = 0.014 — grade C runs above the 1.5 % its price assumed."}
```

### Test for two proportions — z

**What it is.** The **two-proportion z-test** (*z-критерий для двух долей*) compares the rates of two independent groups. Under H₀ both share one rate, so the SE uses the **pooled** rate of both groups together.

**How to write it.**

```text
pooled p = (k₁ + k₂) / (n₁ + n₂)      SE = √( p(1 − p) (1/n₁ + 1/n₂) )      z = (p̂₁ − p̂₂) / SE
app vs branch: pooled = 75 / 5 674 = 1.322 %;  SE = 0.307 points;  z = (1.700 − 1.042) / 0.307 = 2.147
```

```python
def two_prop_z(k1, n1, k2, n2):
    p = (k1 + k2) / (n1 + n2)                             # the pooled rate: what H0 says both channels share
    se = math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2))
    z = (k1 / n1 - k2 / n2) / se
    return z, 2 * (1 - Phi(abs(z)))                       # z and the two-sided p-value

z, p = two_prop_z(41, 2411, 34, 3263)
print(round(z, 3), round(p, 4))                           # 2.147 0.0318
```

App vs branch: z = 2.15, p = 0.032 — at α = 5 % the two FPD rates differ.

The same in statsmodels (optional: it loads an extra package on the first run):

```python
from statsmodels.stats.proportion import proportions_ztest, confint_proportions_2indep
print(proportions_ztest([41, 34], [2411, 3263]))                                  # (2.147, 0.0318)
print(confint_proportions_2indep(41, 2411, 34, 3263, method="newcomb"))           # difference: +0.05 to +1.33 points
```

In Excel, one row per channel and four formula cells:

| | A | B | C |
|---|---|---|---|
| 1 | | FPD | n |
| 2 | app | 41 | 2411 |
| 3 | branch | 34 | 3263 |
| 5 | pooled | `=(B2+B3)/(C2+C3)` → 0.01322 | |
| 6 | SE | `=SQRT(B5*(1-B5)*(1/C2+1/C3))` → 0.00307 | |
| 7 | z | `=(B2/C2-B3/C3)/B6` → 2.147 | |
| 8 | p (two-sided) | `=2*(1-NORM.S.DIST(ABS(B7),TRUE))` → 0.0318 | |

**When you use it.**
- "Is the rate different between two groups?" — FPD by channel, approval by product, conversion of A vs B.

| | One-proportion z | Two-proportion z |
|---|---|---|
| compares | one rate with a fixed number p₀ | two observed rates |
| SE uses | p₀ | the pooled rate of both groups |

> ⚠️ **Watch out.** "The two intervals overlap, so there is no difference" is wrong. Yesterday the Wilson intervals of app and branch overlapped (1.26–1.45 %), and still the difference is significant: the SE of a difference, √(SE₁² + SE₂²) = 0.318 points, is smaller than SE₁ + SE₂ = 0.441. Test the difference itself; its 95 % interval (+0.05 to +1.33 points) excludes 0.

**Your turn.** Grade A vs grade B: 10 FPDs in 1 667 loans against 30 in 3 084. What is z (2 decimals), and do they differ at 5 %?

```task
{"id": "w06d3-l8", "kind": "python", "starter": "# grade A: 10 FPDs in 1 667 loans · grade B: 30 in 3 084\nprint(two_prop_z(10, 1667, 30, 3084))\n", "answer": -1.34, "dp": 2, "model": "z, p = two_prop_z(10, 1667, 30, 3084)\nprint(round(z, 2), round(p, 3))   # -1.34 0.179 — grade A's 0.60 % vs grade B's 0.97 %: not significant at 5 %"}
```

### Chi-square test of independence

**What it is.** The **chi-square test of independence** (*критерий хи-квадрат Пирсона*) asks whether two categorical variables are related. It compares the counts in a **contingency table** (*таблица сопряжённости*) with the counts you would expect if they were independent.

**How to write it.** In words: expected count = row total × column total / grand total; χ² = Σ (observed − expected)² / expected; degrees of freedom = (rows − 1)(columns − 1).

```python
ct = pd.crosstab(f["channel"], f["fpd30"])                        # app 2370/41 · branch 3229/34 · partner 1409/16
obs = ct.to_numpy()
expected = np.outer(obs.sum(axis=1), obs.sum(axis=0)) / obs.sum()  # row total × column total / grand total
chi2 = ((obs - expected) ** 2 / expected).sum()
print(expected.round(1))
print(round(chi2, 3), round(math.exp(-chi2 / 2), 4))              # 5.108 0.0778 — with 2 df the p-value is e^(−χ²/2)
# scipy (the notebook): chi2, p, dof, expected = scipy.stats.chi2_contingency(ct)   Excel: =CHISQ.TEST(observed_range, expected_range)
```

| channel | observed FPD | expected FPD | observed no FPD | expected no FPD | (O − E)² / E, FPD cell |
|---|---|---|---|---|---|
| app | 41 | 30.9 | 2 370 | 2 380.1 | 3.30 |
| branch | 34 | 41.8 | 3 229 | 3 221.2 | 1.46 |
| partner | 16 | 18.3 | 1 409 | 1 406.7 | 0.28 |

χ² = 5.11 on 2 df, p = 0.078: across all three channels, the FPD differences are not significant at 5 % — only the app's 41 against an expected 30.9 is far off, and that is not enough.

**When you use it.**
- "Does Y depend on X?" for two categorical variables: FPD × channel, late payment × grade, approval × region.
- Three or more groups at once. On a 2 × 2 table χ² *is* the two-proportion z-test: χ² = 4.610 = 2.147², same p = 0.0318.

| | χ² on the 3 × 2 table | z-test app vs branch |
|---|---|---|
| question | do the three channels differ at all? | do these two differ? |
| result | p = 0.078 | p = 0.032 |

The two do not contradict each other. The z-test answers a narrower question — and the pair (the two extremes) was chosen after seeing the table, which is why the evidence counts as moderate.

> ⚠️ **Watch out.** χ² needs expected counts of about 5 or more in every cell (else Fisher's exact test, Day 4). And scipy applies **Yates' correction** on a 2 × 2 table by default (p = 0.042 here instead of 0.032) — name the version you report.

**Your turn.** Under independence, how many FPDs would the partner channel be expected to have?

```task
{"id": "w06d3-l9", "kind": "number", "answer": 18.3, "dp": 1, "unit": "expected FPDs", "hint": "Row total × column total / grand total: 1 425 partner loans × 91 FPDs / 7 099 loans.", "model": "1 425 × 91 / 7 099 = 18.3 — the FPDs partner would have if FPD did not depend on channel. It observed 16."}
```

### Checking assumptions — normality of what, independence of what

**What it is.** Every test rests on **assumptions** (*предпосылки критерия*). Two matter most. **Independent rows**: one observation must not drive another. **Normality** — of the **sampling distribution of the mean**, not of the data (as the quiz of RU lesson 5.4 puts it: *normality of the statistic, e.g. the mean*). With n in the hundreds the CLT delivers it even for skewed data; with n = 10 and skewed money it does not.

**How to write it.** The tools: the **QQ plot** (always), **Shapiro–Wilk** `stats.shapiro` (*критерий Шапиро–Уилка*) on a sample of a few hundred, **Levene** `stats.levene` (*критерий Левена*) for equal variances — or skip it and use Welch.

```python
# (shape only — not meant to run)
pa = loans.loc[loans.channel == "app", "principal"]
stats.probplot(pa, dist="norm", plot=plt)                         # the picture first: an S with steps, not a line (flat, round tickets)
stats.shapiro(pa.sample(500, random_state=2026))                  # p = 1.2e-12: not normal — and with n = 2 669 the CLT does not care
stats.levene(sa, sb)                                              # p = 0.77: equal variances (Welch would not have needed it)
stats.skew(pa), len(pa)                                           # 0.03, 2 669 — symmetric and many: the mean's interval is safe
```

Shapiro says the app principals are not normal (p = 1.2 × 10⁻¹²), and the t-test on 2 669 of them is still fine: the mean of 2 669 values is normal enough.

**Independence on real data.** Late payment × grade on 52 850 clean payments: A 5.09 % · B 9.82 % · C 19.62 % · D 35.60 %, χ² = 2 595, df 3, p ≈ 0. But a loan contributes 7.1 payments on average, and payments of one loan are not independent. At the **loan** level (share of loans with any late payment: A 29.6 · B 46.5 · C 69.0 · D 85.6 %): χ² = 771, p ≈ 10⁻¹⁶⁷. Same verdict, honest grain.

**When you use it.**
- n large (hundreds per group) → t / Welch is fine for means, whatever Shapiro says.
- n small and the QQ plot bent, or a few huge values → Mann–Whitney or a permutation test (Day 4).
- The question is about a median or a "typical" value → not a t-test at all.

> ⚠️ **Watch out.** Shapiro on thousands of rows rejects deviations nobody cares about, and "p ≈ 0, so no t-test" is wrong. Look at the QQ plot and at n. And test at the unit that was sampled — the loan, not its payments.

**Your turn.** 2 669 app principals; Shapiro p = 1.2 × 10⁻¹². You want to test whether their mean equals 2.7 m. What do you do?

```task
{"id": "w06d3-l10", "kind": "choice", "options": ["Use a t-test: with 2 669 loans the mean is normal by the CLT, whatever Shapiro says", "Never use a t-test when Shapiro rejects normality", "Take logs and test again until Shapiro passes", "Use a chi-square test instead"], "answer": 0, "explain": "The t-test needs the mean to be normal, not the data. With thousands of rows the CLT delivers that; Shapiro is only telling you the raw tickets are not bell-shaped."}
```

### Effect size — significance is not importance

**What it is.** A p-value says whether you can see an effect. An **effect size** (*размер эффекта*) says how big it is, in units that matter. For rates: the **difference**, the **relative risk** (*относительный риск*) and the business unit — extra events per 1 000. For means: **Cohen's d** = difference / pooled sd (0.2 small, 0.5 medium, 0.8 large). For a χ² table: **Cramér's V**.

**How to write it.**

```python
diff = 41 / 2411 - 34 / 3263                               # difference in rates
rr = (41 / 2411) / (34 / 3263)                             # relative risk: how many times higher
print(round(diff * 100, 2), round(rr, 2), round(diff * 1000, 1))   # 0.66 1.63 6.6 — points, ×, extra FPDs per 1 000
d = (la.mean() - lb.mean()) / math.sqrt((la.var() + lb.var()) / 2) # Cohen's d: difference in sd units
print(round(d, 2))                                         # 0.06 — approved-loan scores, app vs branch: negligible
```

The app's FPD is 0.66 points higher (95 % CI +0.05 to +1.33), 1.63 times the branch rate (CI 1.04–2.56), about 6.6 extra FPDs per 1 000 loans. The significant score gap among approved loans is d = 0.06 — nothing. Late payment × grade has Cramér's V = 0.22, a moderate association.

**When you use it.**
- Next to every p-value — a committee decides on the size, not on p.
- To compare effects measured on different scales (d, V). Day 4 develops effect size and power together.

> ⚠️ **Watch out.** The same p-value can sit on a huge or a trivial effect; n decides which. p = 10⁻⁶⁹ on 52 850 rows says "clearly visible", not "important".

**Your turn.** Grade C has 44 FPDs in 2 034 loans, grade A 10 in 1 667. How many extra FPDs per 1 000 loans does grade C have?

```task
{"id": "w06d3-l11", "kind": "number", "answer": 15.6, "dp": 1, "unit": "extra FPDs per 1 000 loans", "hint": "(44 / 2 034 − 10 / 1 667) × 1 000.", "model": "2.16 % − 0.60 % = 1.56 points = 15.6 extra FPDs per 1 000 grade C loans, compared with grade A (RR 3.6)."}
```

### Reporting a result in one sentence

**What it is.** A test result is reported as **one sentence with six parts**, in a fixed order: the groups and their estimates, the difference with its interval, the test by name, the statistic, the p-value, the conclusion with the effect in business units.

**How to write it.** The template, then reading what scipy returns:

```text
[Group A] had [estimate] vs [estimate] for [group B] (difference [d], 95 % CI [lo, hi]);
a [named test] gives [statistic] = [value], p = [value];
[conclusion at the α chosen in advance], [effect in business units].
```

```python
# (shape only — not meant to run)
r = stats.ttest_ind(sa, sb, equal_var=False)
r.statistic, r.pvalue, r.df          # 1.233, 0.218, 10 451 — Welch's df is fractional, that is normal
r.confidence_interval()              # the interval of the difference in means: report it too
```

Filled for app vs branch: *"App loans had FPD30 1.70 % vs 1.04 % for branch loans (difference +0.66 points, 95 % CI +0.05 to +1.33); a two-sided two-proportion z-test gives z = 2.15, p = 0.032; at α = 5 % the app's rate is higher, about 7 extra FPDs per 1 000 loans."*

**When you use it.**
- Every time a test leaves your notebook: an email, a slide, a committee note, an exam answer.
- Round p to two significant digits (0.032, 0.00008); never "p = 0.000" — write "p < 0.001".

> ⚠️ **Watch out.** "Significant (p < 0.05)" with no size, no interval and no test name is not a result. The reader cannot tell 0.66 points from 6.6.

**Your turn.** Which sentence reports grade C vs grade A correctly?

```task
{"id": "w06d3-l12", "kind": "choice", "options": ["The difference is significant (p = 0.000).", "Grade C had FPD30 2.16 % vs 0.60 % for grade A; a two-sided two-proportion z-test gives z = 3.95, p < 0.001; at α = 5 % grade C's rate is higher, about 16 extra FPDs per 1 000 loans.", "There is a 99.99 % chance that grade C is riskier than grade A.", "Grade C is 3.6 times riskier, so the scorecard works."], "answer": 1, "explain": "Estimates, the named test, the statistic, p written as < 0.001, the conclusion at α and the size in FPDs per 1 000. The other three miss the size, misread p, or skip the test."}
```

### Putting it together

One request, every step of the day: *"Is FPD30 different between grade A and grade C?"*

```python
# 1 hypotheses  H0: p_A = p_C   H1: p_A ≠ p_C (two-sided)      2 alpha = 0.05, fixed now
g = f.merge(pd.read_csv("data/raw/loans.csv")[["loan_id", "risk_grade"]], on="loan_id")
print(g.groupby("risk_grade")["fpd30"].agg(["sum", "size"]))     # A 10 / 1 667 · B 30 / 3 084 · C 44 / 2 034 · D 7 / 314
z, p = two_prop_z(10, 1667, 44, 2034)                              # 3 two independent rates → two-proportion z-test
print(round(z, 2), f"{p:.1e}")                                     # -3.95 7.9e-05      4 p < alpha → reject H0
print(round((44 / 2034 - 10 / 1667) * 1000, 1), round((44 / 2034) / (10 / 1667), 1))   # 15.6 3.6   5 the effect size
```

Read it with the day's questions: H₀ holds the "=", the test is two-sided because both directions would matter, α was fixed first, the data are two independent rates so the two-proportion z-test fits, p = 0.00008 is below 5 %, and the effect — 15.6 extra FPDs per 1 000 loans, 3.6 times the rate — is what goes into the sentence.

**The steps of a test, in order:**

```game
{"type": "order", "id": "w06d3-g1", "title": "The steps of a test", "items": ["Write the question in business words", "State H₀ and H₁ — one- or two-sided", "Fix α before looking at the result", "Choose the test from the outcome type, the groups and the pairing", "Compute the test statistic and its p-value", "Compare p with α and decide", "Report the effect size with its confidence interval"], "why": "α and the sidedness are fixed before the data speak; the effect size is what the decision is about."}
```

**Which test answers which question?**

```game
{"type": "sort", "id": "w06d3-g6", "title": "Which test?", "q": "Tap a question, then the test that answers it.", "groups": {"One-sample t": ["Do 2026 applicants still average a score of 660?"], "Welch t": ["Do app and branch applicants have different average scores?"], "Paired t": ["Did the same ten branches' FPD change from 2025 to 2026?"], "One-proportion z": ["Is grade C's FPD above the 1.5 % its price assumed?"], "Two-proportion z": ["Is the app's FPD rate different from branch's?"], "Chi-square": ["Does FPD depend on the channel, across all three channels?", "Does late payment depend on the risk grade (A–D)?"]}}
```

**The words of the day:**

```game
{"type": "match", "id": "w06d3-g3", "title": "Words of the test", "pairs": [["H₀", "'nothing is going on': p_app = p_branch"], ["p-value", "P(data at least this extreme | H₀ true)"], ["α", "the type I error rate you accept, fixed in advance"], ["Type I error", "rejecting a true H₀ — a false alarm"], ["Type II error", "missing a real effect"], ["Power", "1 − β: the chance of catching a real effect"], ["Effect size", "how big the difference is, in units that matter"]]}
```

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ p-value (one right definition) — [p-values: What they are and how to interpret them (StatQuest), 04:32](https://youtu.be/vemZtEM63GY?t=272&end=427)
- ▶ H0 / H1 — [Hypothesis Testing and The Null Hypothesis, Clearly Explained!!! (StatQuest), 09:51](https://youtu.be/0oc49DyA3hU?t=591&end=824)
- ▶ z-test for two proportions — [Hypothesis Testing With Two Proportions (The Organic Chemistry Tutor)](https://youtu.be/pCbNUnZ98oE)
- ▶ Chi-square test of independence — [Chi-Square Test [Simply explained] (numiqo), 00:17](https://youtu.be/rpKzq64GA9Y?t=17)
- ▶ t-test (independent / paired / assumptions) — [t-Test - Full Course - Everything you need to know (numiqo), 01:45](https://youtu.be/VekJxtk4BYM?t=105&end=148)
- ▶ Whole logic of a test in Russian, p-value and CI on a worked case — [Самая ПОЛНАЯ и ПОНЯТНАЯ лекция по A/B тестам (Noukash), 16:53](https://youtu.be/FEI1OA-zgb8?t=1013&end=1077)

- RU deck (TBC Data Analytics 2.0, if you have it) `Параметрические тесты (2).pdf` (lesson 5.4): the CLT and z-scores pp. 6–9, checking normality and log-transform pp. 10–12, p-value p. 13, type I/II errors p. 14, choosing a test pp. 15–16, assumptions of parametric tests p. 18, one-sample z pp. 19–21, two-sample z pp. 22–24, Student's t pp. 25–31 (paired pp. 30–31), Welch pp. 32–35, ANOVA pp. 36–46, Bonferroni and Tukey pp. 47–49, correlation and regression pp. 50–58.
- Notebook `примеры стат_тестов в python.ipynb`: one- and two-sample z, independent and paired t, Welch, ANOVA (scipy and statsmodels), Bonferroni, Tukey HSD — each on simulated data; rerun any of them on `f` or `x`.
- Visual: Seeing Theory, chapter 4 (hypothesis testing).
- *Russian terms:* нулевая / альтернативная гипотеза = null / alternative hypothesis, статистика критерия = test statistic, p-значение (p-value, p-уровень) = p-value, уровень значимости = significance level, ошибка I / II рода = type I / II error, мощность = power, одно- / двусторонний = one- / two-sided, критерий хи-квадрат = chi-square test, таблица сопряжённости = contingency table, t-критерий Стьюдента = Student's t-test, критерий Уэлча = Welch's test, связанные (парные) выборки = paired samples, критерий Шапиро–Уилка = Shapiro–Wilk, критерий Левена = Levene, размер эффекта = effect size, относительный риск = relative risk.

**Questions inside the videos.** Open a video from the panel: it stops at these points and asks one question about the bit you just watched.

```videoquiz
{"video": "vemZtEM63GY", "stops": [
  {"at": 330, "q": "A p-value is the probability of…", "options": ["H₀ being true", "results at least as extreme as ours, if H₀ were true", "the result being a fluke", "making a type II error"], "answer": 1, "explain": "Computed assuming H₀ — so it cannot be H₀'s own probability."},
  {"at": 410, "q": "With α = 0.05, a p-value of 0.24 means…", "options": ["H₀ is proven", "the groups are certainly the same", "the data do not give enough evidence to reject H₀", "the effect is 24 %"], "answer": 2, "explain": "Absence of evidence, not evidence of absence — partner vs branch, p = 0.80, is exactly this."}]}
```

```videoquiz
{"video": "0oc49DyA3hU", "stops": [
  {"at": 680, "q": "Why do we test a null hypothesis rather than 'prove' the alternative?", "options": ["H₀ gives one exact world to compute probabilities in; data can make it implausible", "H₀ is always true", "The alternative cannot be written down", "Statistics forbids proofs"], "answer": 0, "explain": "'Both channels share 1.322 %' is a world you can simulate; 'they differ' is not one number."},
  {"at": 800, "q": "If the data do not reject H₀, you…", "options": ["accept H₀ as proven", "fail to reject H₀ — it is not proven", "switch to a one-sided test", "double α"], "answer": 1, "explain": "Not guilty is not innocent."}]}
```

```videoquiz
{"video": "pCbNUnZ98oE", "stops": [
  {"at": 150, "q": "In a two-proportion z-test, the standard error under H₀ uses…", "options": ["each group's own rate", "the pooled rate of both groups together", "the larger rate", "a rate of 50 %"], "answer": 1, "explain": "Under H₀ both share one rate: (41 + 34) / (2 411 + 3 263) = 1.322 %."},
  {"at": 420, "q": "z = 2.15 in a two-sided test at α = 0.05: what do you conclude?", "options": ["Reject H₀: |z| > 1.96", "Fail to reject: z < 2.58", "Accept H₀", "Nothing — z must be above 3"], "answer": 0, "explain": "|z| > 1.96 ⇔ p < 0.05 two-sided; p = 0.032."}]}
```

```videoquiz
{"video": "rpKzq64GA9Y", "stops": [
  {"at": 150, "q": "What does the chi-square test of independence compare?", "options": ["Two means", "Observed counts in a table with the counts expected if the variables were independent", "Two variances", "Ranks of two groups"], "answer": 1, "explain": "Expected = row total × column total / grand total; χ² = Σ (O − E)² / E."},
  {"at": 400, "q": "The degrees of freedom for a 3 × 2 table are…", "options": ["6", "5", "2", "1"], "answer": 2, "explain": "(rows − 1)(columns − 1) = 2 × 1 = 2 — FPD × channel."}]}
```

```videoquiz
{"video": "VekJxtk4BYM", "stops": [
  {"at": 125, "q": "Which t-test fits 'the same ten branches in 2025 and in 2026'?", "options": ["Independent samples", "Paired samples", "One-sample against zero rates", "None — use chi-square"], "answer": 1, "explain": "Same units measured twice → paired, on the differences."},
  {"at": 146, "q": "What does a two-sample t-test compare?", "options": ["Two medians", "Two means", "Two proportions of categories", "Two distributions' shapes"], "answer": 1, "explain": "Means — and Welch's version does not need equal variances."}]}
```

```videoquiz
{"video": "FEI1OA-zgb8", "stops": [
  {"at": 1040, "q": "In an A/B comparison, the p-value is computed in which world?", "options": ["The world where the variants truly differ", "The world where H₀ is true — no difference", "The world of the observed sample only", "A world with α = 0"], "answer": 1, "explain": "Simulate that world (pooled rate) and count how often it looks as extreme as yours."},
  {"at": 1070, "q": "A confidence interval for the difference that excludes 0 corresponds to…", "options": ["p > α", "p < α in the matching two-sided test", "a type II error", "no information"], "answer": 1, "explain": "App − branch: +0.05 to +1.33 points excludes 0, and p = 0.032 < 0.05."}]}
```

---

## 2. Worked example — Nilufar's yes/no (15 min)

**1. Question and hypotheses — *H₀ and H₁*, *two-sided*, *α*.** Is the app channel's FPD30 probability different from the branch's? H₀: p_app = p_branch; H₁: ≠ — two-sided, because a better app channel would also change policy. α = 0.05, fixed now, before any p-value.

**2. The data.** 41 / 2 411 vs 34 / 3 263 (week 5's FPD30, payments de-duplicated, first due date ≤ as-of − 30 days). Two separate groups of loans, so the samples are *independent*, not paired.

**3. The test — *two-proportion z-test*, its *statistic* and *p-value*.** Two independent rates, 34–41 events per group (expected counts far above 5): the two-proportion z-test fits. **z = 2.147, p = 0.032** < α, so H₀ is rejected. Fisher's exact test (tomorrow) agrees: p = 0.034.

```python
# uses scipy and statsmodels: they load on the first ▶ Run (the notebook has them too)
k, n = np.array([41, 34]), np.array([2411, 3263])
z, p = proportions_ztest(k, n)                                                    # 2.147, 0.0318
lo, hi = confint_proportions_2indep(41, 2411, 34, 3263, method="newcomb")          # +0.0005, +0.0133
rr_lo, rr_hi = confint_proportions_2indep(41, 2411, 34, 3263, compare="ratio", method="log")   # 1.04, 2.56
stats.fisher_exact([[41, 2370], [34, 3229]])                                       # odds ratio 1.64, p = 0.0344
stats.chi2_contingency(pd.crosstab(f.channel, f.fpd30))[1]                         # 0.0778 — the three-channel check
```

**4. The size — *effect size*.** +0.66 points (95 % CI +0.05 to +1.33); RR 1.63 (1.04–2.56); **6.6 extra FPDs per 1 000 app loans**. At the 2026 pace (1 036 app loans in January–September, ~1 381 a year) that is ~9 extra FPDs a year on loans averaging 2.69 m: ~25 m soum of exposure, ~15 m of expected loss at 60 % LGD.

**5. The caveats that go in the note — *chi-square* and *assumptions*.** (a) The three-channel χ² is not significant (p = 0.078) and app vs branch was chosen as the most extreme pair — the evidence is **moderate**, not overwhelming. (b) App loans are all Micro, branch loans are Auto / Consumer / SME: the gap is channel *and* product; the data cannot separate them. (c) The interval of the difference starts at +0.05 points — consistent with almost nothing.

**6. The answer — *reporting a result*.** *"Yes — at the 5 % level the app's FPD30 is higher than the branch's (1.70 % vs 1.04 %, p = 0.03), about 7 extra first-payment defaults per 1 000 loans. The evidence is moderate and the money is small (~15 m soum a year), so the action is a cheap fix and a re-test, not closing the channel."*

---

## 3. Practice (50 min)

Every task has its own answer box. The Python boxes share the session of section 1's blocks: `two_prop_z`, `one_prop_z`, `welch_t`, `Phi`, `f` (with `channel` and `year`), `apps` and `loans` are ready once you have pressed ▶ Run on them. The questions follow the order of section 1. `data/python/week6/day3_starter.ipynb` has the same frames plus `x` (the payments) and the three TODO functions (`two_prop_ztest`, `relative_risk`, `cohens_d`) that the checkpoint reuses.

**P1.** *(H₀ and H₁)* Write H₀ and H₁, one- or two-sided, for: (a) "Has grade D's late-payment rate changed since last year?" (b) "Marketing claims the new app screen raises approval; it ships only if it does." (c) "Is FPD independent of region?"

```task
{"id": "w06d3-p1", "kind": "free", "min": 25, "model": "(a) H₀: p_D,2026 = p_D,2025; H₁: they differ — two-sided, because a rise and a fall both matter. (b) H₀: p_new ≤ p_old; H₁: p_new > p_old — one-sided is defensible, because 'worse' and 'no change' lead to the same action (do not ship), and it is written down before the test. (c) H₀: FPD and region are independent; H₁: they are not — a χ² test on the region × FPD table.", "rubric": ["(a) two-sided, with the reason", "(b) one-sided, justified by 'same action' and decided in advance", "(c) independence as H₀, χ² test named", "every H₀ is the 'nothing going on' statement"]}
```

<details><summary>Answer</summary>

(a) H₀: p_D,2026 = p_D,2025; H₁: ≠; two-sided — a fall or a rise both matter. (b) H₀: p_new ≤ p_old; H₁: p_new > p_old; one-sided is defensible because "worse" and "no change" lead to the same action (do not ship) — written down before the test. (c) H₀: FPD and region are independent; H₁: they are not; a χ² test on the region × FPD table (the χ² is "two-sided" by construction).

</details>

**P2.** *(test statistic and p-value)* One branch's FPD30 is 0.9 points above the rest of the network; under H₀ the standard error of that gap is 0.5 points. Compute z and the two-sided p-value. Then say in one sentence what the p-value means.

```task
{"id": "w06d3-p11", "kind": "python", "starter": "gap, se = 0.9, 0.5\nz = gap / se\n# print z and the two-sided p-value 2 * (1 - Phi(|z|)), rounded to 3 decimals\n", "answer": 0.072, "dp": 3, "model": "print(z, round(2 * (1 - Phi(abs(z))), 3))   # 1.8 0.072"}
```

<details><summary>Answer</summary>

z = 0.9 / 0.5 = **1.8**; two-sided p = 2 · (1 − Φ(1.8)) = **0.072**. *"If this branch's true rate were the same as the network's, a gap of 0.9 points or more, either way, would turn up in about 7 samples in 100."* It is not the probability that the branch is fine.

</details>

**P3.** *(α, type I and type II errors)* Nilufar moves α from 5 % to 1 % for the app-vs-branch decision. What happens?

```task
{"id": "w06d3-p12", "kind": "choice", "options": ["Fewer false alarms and more misses; p = 0.032 no longer rejects H₀", "Fewer false alarms and fewer misses; the test gets better in every way", "Nothing — α does not change the decision", "More false alarms; p = 0.032 now rejects H₀ more strongly"], "answer": 0, "explain": "A smaller α lowers the type I error rate and raises β, the chance of missing a real effect. 0.032 > 0.01, so H₀ stands. Only more data reduces both errors."}
```

<details><summary>Answer</summary>

A false alarm (type I) becomes rarer — 1 in 100 instead of 1 in 20 when there is no real difference — but a real difference is missed more often (type II, β rises, power falls). With α = 1 %, p = 0.032 is not below α, so the decision flips to "fail to reject". That is why α is fixed **before** the data: chosen afterwards, it decides the answer.

</details>

**P4.** *(one-sided vs two-sided)* For app vs branch, the one-sided p-value. When would Nilufar be allowed to quote it?

```task
{"id": "w06d3-p3", "kind": "number", "answer": 0.0159, "dp": 4, "unit": "one-sided p", "hint": "One-sided 'app is higher' takes only the upper tail: half the two-sided 0.0318, or 1 − Φ(2.147).", "model": "1 − Φ(2.147) = 0.0159. Quotable only if the committee had agreed in advance that a better app channel would change nothing — Bekzod's question came after looking at the dashboard, so the honest number is the two-sided 0.032."}
```

<details><summary>Answer</summary>

`proportions_ztest([41, 34], [2411, 3263], alternative="larger")` → **0.0159**. Only if the committee had agreed in advance that an app channel *better* than branch would change nothing — and Bekzod's question ("is app worse, or is that noise?") was asked after looking at the dashboard. Switching to one-sided after seeing the direction is the cheapest p-hacking there is.

</details>

**P5.** *(one-sample t-test)* The pricing plan assumes an average Micro ticket of 2.8 m soum. Test it on the Micro loans disbursed in 2026: n, mean, t, two-sided p, and the 95 % interval of the mean.

```task
{"id": "w06d3-p13", "kind": "python", "starter": "m26 = loans.loc[(loans[\"product_id\"] == 1) & (loans[\"disbursed_at\"].str[:4] == \"2026\"), \"principal\"]   # product 1 = MICRO\nprint(len(m26), round(m26.mean()))\n# t = (mean − 2 800 000) / (sd / √n) — print t (2 decimals) and the two-sided p\n", "answer": -2.63, "dp": 2, "model": "se = m26.std() / math.sqrt(len(m26))\nt = (m26.mean() - 2_800_000) / se\nprint(round(t, 2), round(2 * (1 - Phi(abs(t))), 4))                   # -2.63 0.0085\nprint(round(m26.mean() - 1.96 * se), round(m26.mean() + 1.96 * se))  # 2609593 2772130"}
```

<details><summary>Answer</summary>

1 045 Micro loans in 2026, mean **2.69 m** (sd 1.34 m); SE = 1.34 m / √1 045 = 41 464; t = (2 690 861 − 2 800 000) / 41 464 = **−2.63**, p = **0.0085**; 95 % interval 2.61–2.77 m. The 2026 average ticket is about 110 000 soum below the plan, and the interval excludes 2.8 m. With 1 044 df the normal tail equals the t tail; `stats.ttest_1samp(m26, 2_800_000)` gives the same.

</details>

**P6.** *(Welch t-test)* Welch t-test of applicants' credit scores, partner vs branch; then the same on **approved loans**. Add Cohen's d (your TODO `cohens_d`).

```task
{"id": "w06d3-p6", "kind": "python", "starter": "apps = pd.read_csv(\"data/raw/applications.csv\")\nsa = apps.loc[apps.channel == \"partner\", \"credit_score\"].dropna()\nsb = apps.loc[apps.channel == \"branch\", \"credit_score\"].dropna()\nprint(round(sa.mean(), 1), round(sb.mean(), 1))     # 657.2 659.6\n# Welch: t = (mean_a − mean_b) / √(var_a / n_a + var_b / n_b) — print t (2 decimals); then the p-value with 2 * (1 - Phi(abs(t)))\n", "answer": -1.72, "dp": 2, "model": "t = (sa.mean() - sb.mean()) / math.sqrt(sa.var() / len(sa) + sb.var() / len(sb))\nprint(round(t, 2), round(2 * (1 - Phi(abs(t))), 3))   # -1.72 0.086 — with thousands of scores the normal tail equals the t tail\nd = (sa.mean() - sb.mean()) / math.sqrt((sa.var() + sb.var()) / 2)\nprint(round(d, 2))                                     # Cohen's d = -0.04: nothing"}
```

<details><summary>Answer</summary>

Applicants: partner 657.2 vs branch 659.6, Welch t = −1.72, **p = 0.086**, d = −0.04. Approved loans: 678.8 vs 679.8, t = −0.59, **p = 0.554**, d = −0.02. None of these moves a decision: a 2-point score gap is a fifth of the width of one grade band. The applicants' pool is the same across channels; whatever makes app FPD higher is not the score at the door.

</details>

**P7.** *(paired vs independent samples)* Paired vs independent on the ten branches (2025 vs 2026 FPD30): both tests, the mean change, and one sentence on why the p-values differ.

```task
{"id": "w06d3-p7", "kind": "choice", "options": ["The paired test is wrong here; branches are independent", "Pairing compares each branch with itself, so the big differences between branches no longer count as noise — paired p = 0.031 vs 0.055 unpaired", "The paired test uses more data", "Both p-values should be the same; one is a rounding error"], "answer": 1, "explain": "Ten differences with mean −0.58 points and t = −2.56. Same unit measured twice → paired."}
```

<details><summary>Answer</summary>

Paired: t = **−2.56, p = 0.031**; independent: t = −2.05, p = 0.055; mean change −0.58 points (2025 average 1.61 %, 2026 1.03 %). Branch levels differ a lot (Bukhara 3.20 → 1.99, Samarkand 0.87 → 0.75); the paired test compares each branch with itself, so that between-branch spread no longer counts as noise. Use paired whenever the same unit is measured twice.

</details>

**P8.** *(one-proportion z-test)* The partner contract promises FPD30 **below** 1.5 %. Partner loans show 16 FPDs in 1 425. Write H₀ and H₁ (one-sided — the contract question has one direction), then z and the one-sided p. Can Nilufar tell the partner the contract is met?

```task
{"id": "w06d3-p14", "kind": "python", "starter": "k, n, p0 = 16, 1425, 0.015\nz, p_two = one_prop_z(k, n, p0)\n# H1: rate < 1.5 % — the one-sided p is the lower tail, Phi(z); print z and it, rounded to 3 decimals\n", "answer": 0.121, "dp": 3, "model": "print(round(z, 2), round(Phi(z), 3))   # -1.17 0.121 — 1.12 % is below 1.5 %, but not clearly enough"}
```

<details><summary>Answer</summary>

H₀: p_partner ≥ 1.5 %; H₁: p_partner < 1.5 %. p̂ = 1.12 %, SE = √(0.015 × 0.985 / 1 425) = 0.32 points, **z = −1.17**, one-sided p = Φ(−1.17) = **0.121**. Not below 5 %: the partner's rate *looks* under the cap, but 1 425 loans cannot yet show it. Honest wording: *"1.12 %, consistent with the 1.5 % cap; not yet enough loans to confirm it is below."*

</details>

**P9.** *(two-proportion z-test)* `two_prop_ztest` (your TODO 1) for app vs partner and partner vs branch. Which pairs differ at 5 %?

```task
{"id": "w06d3-p2", "kind": "python", "starter": "# counts: app 41 / 2411 · branch 34 / 3263 · partner 16 / 1425\nprint(two_prop_z(41, 2411, 34, 3263))     # app vs branch\n# add app vs partner and partner vs branch; print z and p\n", "answer": 0.153, "dp": 3, "model": "print(two_prop_z(41, 2411, 16, 1425))     # z 1.43, p 0.153\nprint(two_prop_z(16, 1425, 34, 3263))     # z 0.25, p 0.804 — only app vs branch is below 0.05"}
```

<details><summary>Answer</summary>

App vs partner: z = 1.43, **p = 0.153**; partner vs branch: z = 0.25, **p = 0.804**; app vs branch: z = 2.15, p = 0.032. Only one of three pairs, and the three-way χ² says p = 0.078 — the pattern "the extremes differ, nothing else does" is what a single moderate effect *or* chance plus selection would both produce. Thursday's Holm correction for three comparisons: 0.032 × 3 = 0.095.

</details>

**P10.** *(chi-square test of independence)* χ² test of FPD30 × risk grade (4 × 2). Statistic, df, p, the smallest expected count. Then grade A vs grade C as a two-proportion z-test.

```task
{"id": "w06d3-p4", "kind": "python", "starter": "loans = pd.read_csv(\"data/raw/loans.csv\")\ng = f.merge(loans[[\"loan_id\", \"risk_grade\"]], on=\"loan_id\")\nct = pd.crosstab(g[\"risk_grade\"], g[\"fpd30\"])\nprint(ct)                     # A 10 / 1 667 · B 30 / 3 084 · C 44 / 2 034 · D 7 / 314\n# expected counts, then chi2 = Σ (O − E)² / E — print chi2 (2 decimals) and the smallest expected count\n", "answer": 23.17, "dp": 2, "model": "obs = ct.to_numpy()\nexpected = np.outer(obs.sum(axis=1), obs.sum(axis=0)) / obs.sum()\nprint(round(((obs - expected) ** 2 / expected).sum(), 2), round(expected.min(), 1))   # 23.17 4.0 — df 3, p = 3.7e-05\nprint(two_prop_z(10, 1667, 44, 2034))                                                 # A vs C: z = -3.95, p = 7.9e-05"}
```

<details><summary>Answer</summary>

Counts A 10 / 1 667, B 30 / 3 084, C 44 / 2 034, D 7 / 314; **χ² = 23.17, df = 3, p = 3.7 × 10⁻⁵**. Smallest expected count: grade D's FPD cell, **4.0** — one cell of eight below 5 (under the usual 20 % limit, so χ² is acceptable; Fisher–Freeman–Halton would be the purist's choice). A vs C: z = −3.95, **p = 7.9 × 10⁻⁵**; RR 2.16 / 0.60 = 3.6. The scorecard orders FPD as well as lateness.

</details>

**P11.** *(chi-square on a 2 × 2 table)* Show that a 2 × 2 χ² without continuity correction equals z² for app vs branch. What does scipy do by default, and which p do you report?

```task
{"id": "w06d3-p5", "kind": "choice", "options": ["scipy uses no correction, so its p equals the z-test's 0.0318", "scipy applies Yates' continuity correction on a 2 × 2 by default (χ² = 4.12, p = 0.042); report one version and name it — here the uncorrected z-test and Fisher (0.034) agree", "χ² and z can never agree on a 2 × 2 table", "Report the smallest of the three p-values"], "answer": 1, "explain": "Without correction χ² = 4.610 = 2.147², p = 0.0318 identical; with Yates p = 0.042, more conservative. Picking the smallest p is p-hacking."}
```

<details><summary>Answer</summary>

`stats.chi2_contingency([[41, 2370], [34, 3229]], correction=False)` → χ² = **4.610** = 2.147², p = **0.0318**. The default (`correction=True`, Yates) gives χ² = 4.119, p = 0.042 — more conservative. Report one and name it; with these counts the z-test (no correction) and Fisher (0.034) agree, so the uncorrected value is fine.

</details>

**P12.** *(checking assumptions — independent rows)* Late payment, grade A vs grade B: z-test on payments, then on loans (any late payment). Why do the z values differ so much?

```task
{"id": "w06d3-p9", "kind": "choice", "options": ["Payments are more precise than loans", "A loan contributes about seven payments that are not independent, so the payment-level test pretends to have seven times the information and inflates z", "The loan-level test drops the late payments", "The z-test cannot be used on loans"], "answer": 1, "explain": "−15.45 on payments vs −11.59 on loans. Test at the unit that was sampled or randomised — the loan."}
```

<details><summary>Answer</summary>

Payments: 5.09 % vs 9.82 %, z = **−15.45**, p = 7.5 × 10⁻⁵⁴ (12 219 vs 23 561 payments). Loans: 29.6 % vs 46.5 %, z = **−11.59**, p = 4.6 × 10⁻³¹ (1 741 vs 3 246 loans). The payment-level test pretends to have 7 times as many independent observations as it has; its z is inflated. Here the conclusion survives; on a borderline question the wrong grain manufactures significance. Test at the unit that was randomised or sampled — the loan.

</details>

**P13.** *(effect size)* Effect sizes for app vs branch FPD: difference with its 95 % CI, RR with its CI, extra FPDs per 1 000. Then translate into soum per year for the app channel.

```task
{"id": "w06d3-p8", "kind": "number", "answer": 6.6, "dp": 1, "unit": "extra FPDs per 1 000 app loans", "hint": "(41 / 2 411 − 34 / 3 263) × 1 000.", "model": "17.0 − 10.4 = 6.6 per 1 000 (95 % CI 0.5–13.3); RR 1.63 (1.04–2.56). At ~1 381 app loans a year: ~9 extra FPDs × 2.69 m ≈ 25 m soum at risk, ~15 m expected loss at LGD 60 %."}
```

<details><summary>Answer</summary>

Difference **+0.66 points** (Newcombe CI +0.05 to +1.33); RR **1.63** (`confint_proportions_2indep(..., compare="ratio", method="log")` → 1.04–2.56); **6.6 per 1 000** (0.5–13.3). App volume 2026: 1 036 loans in January–September → ~1 381 a year → ~9 extra FPDs × 2.69 m average principal ≈ **25 m soum** at risk, ~15 m expected loss at LGD 60 %. Statistically "yes", financially a rounding error next to the 3.6 bn expected loss of the book (Day 1).

</details>

**P14.** *(reporting a result in one sentence)* Write the one-sentence report for P6's applicants' test (partner 657.2 vs branch 659.6, Welch t = −1.72, p = 0.086). The difference is −2.4 points with a 95 % CI of −5.1 to +0.3.

```task
{"id": "w06d3-p15", "kind": "free", "min": 30, "model": "Partner applicants had an average credit score of 657.2 vs 659.6 for branch applicants (difference −2.4 points, 95 % CI −5.1 to +0.3); a two-sided Welch t-test gives t = −1.72, p = 0.086; at α = 5 % we cannot say the channels attract applicants with different scores, and the gap is negligible anyway (Cohen's d = −0.04, a fifth of a grade band).", "rubric": ["both group estimates", "the difference with its 95 % CI", "the test named (Welch, two-sided) with t and p", "a conclusion at α that does not claim 'no difference'", "the size in a unit that matters (d or grade bands)"]}
```

<details><summary>Answer</summary>

*"Partner applicants had an average credit score of 657.2 vs 659.6 for branch applicants (difference −2.4 points, 95 % CI −5.1 to +0.3); a two-sided Welch t-test gives t = −1.72, p = 0.086; at α = 5 % we cannot say the two channels attract applicants with different scores, and the gap is negligible anyway (Cohen's d = −0.04)."* Not "the scores are the same" — p = 0.086 is absence of evidence.

</details>

> 🚀 **Stretch (optional, +5 XP).** **P15.** *(effect size vs p-value)* p depends on n. Keep the app and branch FPD **rates** fixed and multiply both n's by 10, then by 0.1. Compute z and p each time. Then write the sentence that explains to Bekzod why "p = 0.000 000 01" on a 10-million-row table proves nothing about importance.

```task
{"id": "w06d3-p10", "kind": "python", "starter": "for m in (0.1, 1, 10):\n    z, p = two_prop_z(41 * m, 2411 * m, 34 * m, 3263 * m)\n    print(m)          # add z (2 decimals) and p to this line\n", "answer": 6.79, "dp": 2, "model": "for m in (0.1, 1, 10):\n    z, p = two_prop_z(41 * m, 2411 * m, 34 * m, 3263 * m)\n    print(m, round(z, 2), p)\n# 0.1 0.68 0.50 · 1 2.15 0.032 · 10 6.79 1.1e-11 — the same +0.66-point effect, three verdicts: z grows with √n", "xp": 2}
```

<details><summary>Answer</summary>

×10 (410 / 24 110 vs 340 / 32 630): z = **6.79**, p = 1.1 × 10⁻¹¹. ×0.1: z = **0.68**, p = 0.50. ×1: z = 2.15, p = 0.032. Same effect (+0.66 points), three verdicts — z grows with √n. *"A p-value measures how clearly we can see a difference, not how big it is; with enough rows every difference is 'significant', so always read the effect size and its interval next to it."*

</details>

### Mistakes people make

- "p = 0.032 means a 3.2 % chance that app and branch are the same."
- "p = 0.078, so FPD does not depend on channel" — absence of evidence, small n.
- Switching to one-sided after seeing the direction; choosing the pair to test after looking at the table.
- Student's t with very different variances — use Welch (`equal_var=False`, `T.TEST(…, 3)`).
- An independent test on paired data (or the reverse).
- Testing payments when the unit is the loan — rows that are not independent inflate z.
- Shapiro on 50 000 rows, p ≈ 0, "so I cannot use a t-test" — the CLT cares about n, the QQ plot about shape.
- A significant result reported without its size, or a big-sounding RR without its interval (1.63, but 1.04–2.56).
- A test across confounded groups (channel = product) reported as a channel effect.
- A p-value printed as `0.000` — write p < 0.001, and give the effect next to it.

---

## 4. Homework

**HW 6.1 is due today** in Day 1's hand-in box. **HW 6.2** (intervals and the chart, Day 2) is due on Day 5. Today's TODO functions (`two_prop_ztest`, `relative_risk`, `cohens_d`) are practice, not graded, but the checkpoint uses them — finish them now and check two of their results here.

**H1.** What does your `relative_risk(41, 2411, 34, 3263)` return (2 decimals)?

```task
{"id": "w06d3-hw1", "kind": "number", "answer": 1.63, "dp": 2, "unit": "× (app rate / branch rate)", "hint": "(41 / 2 411) / (34 / 3 263).", "model": "1.700 % / 1.042 % = 1.63 — app loans have 1.63 times the branch FPD rate (95 % CI 1.04–2.56)."}
```

**H2.** And `two_prop_ztest(10, 1667, 44, 2034)` — grade A vs grade C — the z statistic (2 decimals)?

```task
{"id": "w06d3-hw2", "kind": "number", "answer": -3.95, "dp": 2, "unit": "z", "hint": "Pooled rate 54 / 3 701; z = (p̂_A − p̂_C) / SE. The sign follows the order A − C.", "model": "z = −3.95, p = 7.9 × 10⁻⁵: grade A's 0.60 % against grade C's 2.16 %, RR 3.6 — the scorecard orders FPD."}
```

---

## 5. Self-check

Three questions, one at a time. Wrong? The explanation points to the part of section 1 to reread.

```check
{"id": "w06d3-sc", "questions": [
  {"type": "multi", "q": "Which sentences correctly describe p = 0.032 for app vs branch?", "options": ["If both channels had the same true rate, a gap this large or larger would appear in about 3 % of samples this size", "There is a 3.2 % chance the channels have the same rate", "There is a 3.2 % chance the result is due to chance", "At α = 5 % fixed in advance, we reject H₀"], "answer": [0, 3], "explain": "The p-value is computed assuming H₀; the other two sentences are the classic misreadings (→ section 1, 'The p-value')."},
  {"type": "single", "q": "App vs branch: z-test p = 0.032; three-channel χ² p = 0.078. What is going on?", "options": ["One test is wrong", "They answer different questions: 'do the three differ at all?' vs a pair picked after seeing the table — the evidence is moderate", "χ² must always be smaller", "The z-test used Yates' correction"], "answer": 1, "explain": "That is why the committee note says 'moderate' (→ section 1, 'Chi-square', P9)."},
  {"type": "multi", "q": "A test on 52 850 payments gives p = 10⁻⁶⁹. What do you ask before you believe it matters?", "options": ["How big is the effect, with its interval?", "Was the test run at the right grain (loans, not payments)?", "Is α = 5 %?", "Was a seed set?"], "answer": [0, 1], "explain": "Huge n makes any gap significant; payments of one loan are not independent (→ section 1, 'Effect size', P12, P15)."}
]}
```

---

## 6. Company corner <span class="badge company">The risk-committee note</span>

A committee reads six lines, in this order, and nothing else. Each line is a habit: the question before the answer, the definition before the number, the interval with the number, the test with its name, the size in the committee's units, a decision someone can act on.

| # | Line | Filled for app vs branch FPD30 |
|---|---|---|
| 1 | **Question** | Do loans originated in the app have a higher first-payment default rate than loans originated in branches? |
| 2 | **Metric definition** | FPD30 = first instalment not fully paid within 30 days of its due date; loans whose first due date ≤ 2026-09-01 (as of 2026-10-01); payments de-duplicated; channel = channel of the application. |
| 3 | **Numbers with 95 % CIs** | App 41 / 2 411 = **1.70 %** (Wilson 1.26–2.30 %); branch 34 / 3 263 = **1.04 %** (0.75–1.45 %); difference **+0.66 points** (+0.05 to +1.33). |
| 4 | **Test and p-value** | Two-sided two-proportion z-test: z = 2.15, **p = 0.032** (Fisher exact 0.034). Caveat: the three-channel χ² gives p = 0.078 and app vs branch is the most extreme pair. |
| 5 | **Effect in business terms** | **+6.6 FPDs per 1 000 app loans** (RR 1.63, CI 1.04–2.56) ≈ 9 extra FPDs a year at the 2026 pace, ~25 m soum exposure, ~15 m expected loss. App loans are all Micro: channel and product cannot be separated. |
| 6 | **Decision** | **Yes, app FPD is higher — moderately, and cheaply fixable.** Keep the channel; run a first-instalment reminder test on app loans (sample size by Thursday); re-test on Q4 2026 vintages; review in January. |

What the note does **not** say: "significant" without the size, "proved", "no difference in partner" (p = 0.80 is absence of evidence), or anything about Micro vs other products that the data cannot separate. And what Nilufar must be able to answer when the CFO asks *"so what is the chance you are wrong?"*: if there were no real difference, a gap this large would appear about 3 times in 100 — and the evidence that the gap is *big* is weak, which is why the decision is cheap and reversible.

Sort the sentences: which ones belong in the note?

```game
{"type": "sort", "id": "w06d3-g4", "title": "In the note or not?", "q": "Tap a sentence, then where it belongs.", "groups": {"In the note": ["FPD30 = first instalment not fully paid within 30 days of its due date", "App 1.70 % (1.26–2.30 %) vs branch 1.04 % (0.75–1.45 %)", "Two-sided z-test: z = 2.15, p = 0.032", "+6.6 FPDs per 1 000 app loans, ~15 m soum a year", "Channel and product cannot be separated: app loans are all Micro"], "Not in the note": ["The difference is proven", "Partner is no different from branch (p = 0.80)", "p = 0.000", "Significant (no size given)"]}}
```

> 🎯 **Interview version.** *"Two groups have default rates 1.70 % and 1.04 %. Is the difference significant?"* — Ask for n; with 2 411 and 3 263 loans, a two-proportion z-test (or χ² / Fisher) gives p ≈ 0.03; report the difference with its CI (+0.05 to +1.33 points) and in business units; mention whether the comparison was pre-specified and whether the groups differ in other ways (product mix) before calling it a channel effect.

**Say it like in an interview.** *"Two groups have default rates of 1.70 % and 1.04 %. Is the difference significant?"* — answer in 3–5 sentences, as you would to an interviewer.

```task
{"id": "w06d3-cc", "kind": "free", "min": 30, "model": "It depends on n, so I would ask for it first. With 2 411 and 3 263 loans a two-sided two-proportion z-test gives z = 2.15, p = 0.032, so at α = 5 % the rates differ; the difference is +0.66 points with a 95 % CI of +0.05 to +1.33, about 7 extra defaults per 1 000 loans. I would also say whether this comparison was planned or picked after looking (the three-group χ² is p = 0.078), and check whether the groups differ in other ways — here app loans are all Micro — before calling it a channel effect.", "rubric": ["asks for n before answering", "names the test and gives z / p", "reports the difference with its CI and in business units", "mentions pre-specification or confounding (product mix)"]}
```

Tomorrow: when the t-test's assumptions fail (skewed days-late, small branches), when you test ten things at once, and Jasur's question — is 2 000 loans enough to test the SMS reminder?

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w06d3", "pass": 0.8, "questions": [
  {"type": "single", "q": "Which is the definition of a p-value?", "options": ["The probability, computed assuming H₀ is true, of a result at least as extreme as the one observed", "The probability that H₀ is true", "The size of the difference", "The probability that the result is due to chance"], "answer": 0, "explain": "It is computed assuming H₀, so it cannot be H₀'s probability, and it says nothing about size (→ section 1, 'The p-value')."},
  {"type": "single", "q": "App vs branch: z-test p = 0.032; the three-channel χ² gives p = 0.078. What is going on?", "options": ["Different questions: χ² asks whether the three channels differ at all; the z-test asks about the two extremes, a pair chosen after seeing the table", "The z-test used the wrong n", "A contradiction — one of the tests is wrong", "χ² is always less powerful, so ignore it"], "answer": 0, "explain": "That is why the committee note calls the evidence moderate (→ section 1, 'Chi-square', P9)."},
  {"type": "single", "q": "w holds the FPD30 % of the same ten branches in 2025 and 2026. Which test should replace this one?", "code": "stats.ttest_ind(w[2026], w[2025])", "options": ["stats.fisher_exact", "A chi-square test", "stats.ttest_rel — the same branches measured twice, so the test works on the differences", "Welch: equal_var=False"], "answer": 2, "explain": "Pairing removes the between-branch spread: p = 0.031 paired vs 0.055 unpaired (→ section 1, 'Paired vs independent')."},
  {"type": "number", "q": "A 2 × 2 χ² without continuity correction equals z². If z = 2.147, what is χ² (two decimals)?", "answer": 4.61, "tol": 0.01, "explain": "2.147² = 4.61 and the p-value is identical (0.0318); scipy's default Yates correction gives 4.12, p = 0.042 (→ section 1, 'Chi-square', P11)."},
  {"type": "multi", "q": "Which are good practice when reporting a test?", "options": ["Read p = 0.078 as 'FPD does not depend on channel'", "Write p < 0.001, never p = 0.000", "Report the effect size with its CI next to the p-value", "Test at the loan level when loans are the units, not at the payment level", "Switch to a one-sided test after seeing which group is higher"], "answer": [1, 2, 3], "explain": "Switching sides after looking is p-hacking, and p > 0.05 is absence of evidence (→ Mistakes, section 1 'Effect size')."},
  {"type": "single", "q": "Late payment, grade A vs B: z = −15.45 on payments, −11.59 on loans. Why so different?", "options": ["A loan contributes about seven payments that are not independent, so the payment-level test pretends to have more information and inflates z", "The loan test used Welch", "Loans were counted twice", "Payments are more accurate"], "answer": 0, "explain": "Test at the unit that was sampled — the loan; on a borderline question the wrong grain manufactures significance (→ P12)."},
  {"type": "single", "q": "Welch on principal by channel gives t = −43, p ≈ 0. What can you conclude about channels?", "code": "pd.crosstab(loans.channel, loans.product_id)\n# app -> 1 (MICRO) only · partner -> 3 (BNPL) only · branch -> 2, 4, 5 (CONS, AUTO, SME)", "options": ["A one-sided test is needed", "Nothing about channels: channel and product are confounded, and no test separates them", "App customers borrow less because of the app", "Variances must be equal first"], "answer": 1, "explain": "App = Micro only, partner = BNPL only; Nilufar's FPD gap is also, inevitably, a product gap (→ section 1, 'Two-sample t-test')."},
  {"type": "single", "q": "Company corner: which sentence must NOT appear in the risk-committee note?", "options": ["App loans: +6.6 FPDs per 1 000 (RR 1.63, CI 1.04–2.56)", "Keep the channel; run a reminder test and re-test on Q4 vintages", "FPD30 = first instalment not fully paid within 30 days of its due date", "Partner is proven no different from branch (p = 0.80)"], "answer": 3, "explain": "p = 0.80 is absence of evidence, not proof of no difference (→ Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w06d3", "q": "Nilufar wants to tell the committee that FPD30 'improved in 2026'. From the FPD frame f, compare all loans disbursed in 2025 with all loans disbursed in 2026 (every channel and branch pooled) with a two-sided two-proportion z-test, proportions_ztest, no continuity correction. What is the p-value? Give it to 3 decimals.", "type": "number", "dp": 3, "python": true, "h": ["d40b99d738ffcaa5fe739898"], "hint": "Count FPDs and loans per disbursement year first; the test takes the two counts and the two sizes as lists.", "sol": "ZnJvbSBzdGF0c21vZGVscy5zdGF0cy5wcm9wb3J0aW9uIGltcG9ydCBwcm9wb3J0aW9uc196dGVzdCwgY29uZmludF9wcm9wb3J0aW9uc18yaW5kZXAKZlsieWVhciJdID0gZlsiZGlzYnVyc2VkX2F0Il0uZHQueWVhcgp0ID0gZi5ncm91cGJ5KCJ5ZWFyIilbImZwZDMwIl0uYWdnKFsic3VtIiwgInNpemUiXSkgICAgICAjIDIwMjU6IDQ3IC8gMyAwNDEgwrcgMjAyNjogMjUgLyAyIDMyMgpwcm9wb3J0aW9uc196dGVzdChbNDcsIDI1XSwgWzMwNDEsIDIzMjJdKSAgICAgICAgICAgICAgICAgICMgeiA9IDEuNDc4LCBwID0gMC4xMzkKY29uZmludF9wcm9wb3J0aW9uc18yaW5kZXAoNDcsIDMwNDEsIDI1LCAyMzIyLCBtZXRob2Q9Im5ld2NvbWIiKSAgICMg4oiSMC4xNyB0byArMS4wOCBwb2ludHMKCnAgPSAwLjEzOTogMS41NSAlIGluIDIwMjUgYWdhaW5zdCAxLjA4ICUgaW4gMjAyNiBpcyBhIDAuNDctcG9pbnQgZmFsbCB0aGF0IGNoYW5jZSBhbG9uZSB3b3VsZCBwcm9kdWNlIGFib3V0IDE0IHRpbWVzIGluIDEwMCDigJQgbm90IHNpZ25pZmljYW50IGF0IDUgJSwgYW5kIHRoZSBpbnRlcnZhbCBvZiB0aGUgZGlmZmVyZW5jZSBpbmNsdWRlcyB6ZXJvLgpUaGUgcGFpcmVkIHRlc3Qgb24gdGhlIHRlbiBicmFuY2hlcyAoUDcpIHNhaWQgcCA9IDAuMDMxIGZvciB0aGUgc2FtZSB0d28geWVhcnM6IGl0IHJlbW92ZXMgdGhlIGJldHdlZW4tYnJhbmNoIHNwcmVhZCBhbmQgd2VpZ2hzIGV2ZXJ5IGJyYW5jaCBlcXVhbGx5LCBzbyBpdCBhbnN3ZXJzIGEgZGlmZmVyZW50IHF1ZXN0aW9uICgnZGlkIHRoZSB0eXBpY2FsIGJyYW5jaCBpbXByb3ZlPycpLgpGb3IgdGhlIGNvbW1pdHRlZTogJ0ZQRDMwIGxvb2tzIGxvd2VyIGluIDIwMjYsIGJ1dCBwb29sZWQgb3ZlciB0aGUgYm9vayB0aGUgZmFsbCBpcyB3aXRoaW4gbm9pc2U7IHRoZSBicmFuY2gtYnktYnJhbmNoIGNvbXBhcmlzb24gaXMgbW9yZSBlbmNvdXJhZ2luZyDigJQgcmUtdGVzdCB3aGVuIHRoZSBRNCB2aW50YWdlcyBoYXZlIG1hdHVyZWQuJw=="}
```

<!-- challenge:end -->
