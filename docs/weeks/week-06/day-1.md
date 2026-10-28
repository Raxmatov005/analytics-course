# Week 6 · Day 1 — Probability and distributions: how random is a default?

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 6.1 (due Day 3)</span> <span class="badge company">Company corner</span>

> STORY **Monday, 9:00.** Nilufar, risk, with a printout of week 5's FPD table and a red pen. *"Your 1.28 % is now in the monthly risk pack. Here is my problem. Next month we disburse about 400 loans. If 1.28 % of first instalments default, how many FPDs should I expect — and **when should I panic**? Last October I saw 7 in one vintage and called a meeting. Was that a signal or was I chasing noise? I want a number I can write on the wall: below it, relax; above it, phone me."* Jasur, passing: *"That is a binomial with n = 400. Show her the tail, not the mean."*

## Today in 3 lines

- Probability is the language of "how surprised should I be": **events** and **P(A)**, complement, union, intersection, **conditional probability** and **Bayes** (and the base-rate trap that makes a 90 %-accurate fraud rule wrong nine times in ten), independence, **random variables** with expectation, variance and standard deviation — and how to **describe data**: mean, median, mode, sd, percentiles, skew.
- Five shapes cover most of a lending analyst's life: **binomial** (defaults in a batch of loans), **Poisson** (applications per hour), **exponential** (minutes between applications), **uniform** (the minute within the hour), **normal** (credit scores) — each checked against Nur data, each with its `scipy.stats` line and its Excel formula; and **simulation** with `numpy` when no formula fits.
- Nilufar gets her wall number — **expect 5.1 FPDs in 400 loans, 1 to 10 is normal, 10 or more happens 3.6 % of the time, 12 or more 0.6 %** — and you start HW 6.1 (eight functions with asserts in `data/python/week6/day1_starter.ipynb`).

---

## 1. Learn — the language of chance

Press ▶ Run on this first box once. It loads the tools and the data for the whole page; every later box on this page, and every Practice box, reuses them.

```python
import math, random
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import statistics as st
# the normal distribution, from Python's standard library
from statistics import NormalDist

apps  = pd.read_csv("data/raw/applications.csv")
loans = pd.read_csv("data/raw/loans.csv")
# 13 612 scored applicants of 14 000 — say so
s = apps["credit_score"].dropna()

# binomial: P(X = k) for X ~ Bin(n, p)
def pmf(k, n, p):
    return math.comb(n, k) * p**k * (1 - p)**(n - k)
def cdf(k, n, p):                     # P(X <= k)
    return sum(pmf(i, n, p) for i in range(k + 1))
def at_least(k, n, p):                # P(X >= k) = 1 - P(X <= k - 1)
    return 1 - cdf(k - 1, n, p)

print(len(apps), len(loans), len(s))  # 14000 7828 13612
```

### Probability — a long-run share

**What it is.** The **probability** (*вероятность*) of an event A, written **P(A)**, is a number from 0 to 1: the share of times A happens when the same situation repeats very many times. In lending you never know it exactly. You estimate it from history: 91 first-payment defaults (FPD) in 7 099 first instalments give **P(FPD) ≈ 91 / 7 099 = 1.28 %**. A share from a few cases jumps around; a share from many cases settles down (the **law of large numbers** — tomorrow measures how fast).

**How to write it.** P(A) ≈ (times A happened) / (times you looked). The box draws fresh batches of loans whose true FPD rate is 1.28 % and prints each batch's share.

```python
# the same "random" draws on every run
random.seed(2026)
p_true = 91 / 7099                # the long-run share
# one fresh batch of n loans each time
for n in (10, 100, 1_000, 10_000, 100_000):
    # True = this loan is an FPD
    k = sum(random.random() < p_true for _ in range(n))
    print(n, k, round(k / n, 4))  # loans, FPDs, share
```

| loans in the batch | FPDs | share |
|---|---|---|
| 10 | 0 | 0.0000 |
| 100 | 0 | 0.0000 |
| 1 000 | 13 | 0.0130 |
| 10 000 | 127 | 0.0127 |
| 100 000 | 1 282 | 0.0128 |

Batches of 10 and 100 loans show 0 % — the true 1.28 % is invisible at that size; 100 000 loans show 1.28 %.

**When you use it.**
- Every rate in a report — FPD rate, approval rate, default rate — is an estimate of a probability.
- Before you trust a rate, look at its denominator: 2 of 20 is a hint; 91 of 7 099 is evidence.

> ⚠️ **Watch out.** A rate from a handful of cases can be 0 % or 10 % by luck alone. Say the count next to the rate: "1.28 % (91 of 7 099)".

**Your turn.** A new branch had 2 FPDs in its first 20 loans. Which statement is right?

```task
{"id": "w06d1-l1", "kind": "choice", "options": ["The branch's FPD probability is 10 %", "10 % is a noisy estimate from 20 loans — the share settles only as the count grows; report it as '2 of 20'", "Its FPD probability is 0 %, because most batches of 20 loans have no FPD", "A share from 20 loans and a share from 7 099 loans are equally reliable"], "answer": 1, "explain": "A probability is a long-run share. 20 loans are far too few for the share to settle: the table above shows batches of 100 reading 0 % while the truth is 1.28 %."}
```

### Events — complement, AND, OR

**What it is.** An **event** (*случайное событие*) is something that happens or does not happen for one case: D = "this loan's first instalment is 30+ days late" (an FPD), A = "this loan came through the app". From events you build new ones:

| Event | In words | Notation | Probability |
|---|---|---|---|
| **complement** (*противоположное событие*) | not D | D̄ | 1 − P(D) |
| **intersection** (*произведение событий*) | A and D | A ∩ D | count the cases that are both |
| **union** (*сумма событий*) | A or D, or both | A ∪ D | P(A) + P(D) − P(A ∩ D) |

**How to write it.** The 7 099 loans in FPD scope: 2 411 app loans, 91 FPDs, 41 loans that are both.

```text
             FPD     no FPD     total
app           41      2 370     2 411
not app       50      4 638     4 688
total         91      7 008     7 099
```

```python
n, app, fpd, both = 7099, 2411, 91, 41
print(round(1 - fpd / n, 4))  # not D:   0.9872
print(round(both / n, 4))     # A and D: 0.0058
# A or D:  0.3467 — the 41 are subtracted once
print(round((app + fpd - both) / n, 4))
```

The union is 2 461 loans — 2 411 app loans plus 91 FPDs minus the 41 that were counted twice — so P(A ∪ D) = 34.67 %.

Events that cannot happen together — "app" and "branch" for the same loan — are **mutually exclusive** (*несовместные*). Their intersection is empty, and their probabilities simply add.

**When you use it.**
- "What share is *not* …" → complement. "… *and* …" → intersection. "… *or* …" → union.

> ⚠️ **Watch out.** P(A or D) is P(A) + P(D) only when A and D cannot overlap. 33.96 % + 1.28 % counts the 41 app FPDs twice; subtract P(A ∩ D).

**Your turn.** Branch loans: 3 263 of the 7 099, and 34 of them are FPDs. What is P(branch ∪ FPD), in %, to 2 decimals?

```task
{"id": "w06d1-l2", "kind": "number", "answer": 46.77, "dp": 2, "unit": "%", "hint": "P(branch) + P(FPD) − P(branch ∩ FPD): (3 263 + 91 − 34) / 7 099.", "model": "(3 263 + 91 − 34) / 7 099 = 3 320 / 7 099 = 46.77 %. The 34 branch FPDs are in both counts, so they are subtracted once."}
```

### Conditional probability — "among those who…"

**What it is.** A **conditional probability** (*условная вероятность*) **P(D | A)** is the chance of D **among the cases where A happened**. Read the bar as "given". The condition shrinks the denominator: from all 7 099 loans to the 2 411 app loans.

**How to write it.** P(D | A) = P(A ∩ D) / P(A) = (count of both) / (count of A).

```python
# P(FPD | app) = 41 / 2 411 = 0.0170 — how risky is an app loan?
print(round(both / app, 4))
# P(app | FPD) = 41 / 91    = 0.4505 — where do our FPDs come from?
print(round(both / fpd, 4))
```

Same 41 loans, two denominators: 1.70 % of app loans have an FPD, and 45.1 % of all FPDs came through the app.

**When you use it.**

| | P(FPD given app) | P(app given FPD) |
|---|---|---|
| Denominator | 2 411 app loans | 91 FPDs |
| Value | 1.70 % | 45.1 % |
| Answers | how risky is an app loan? | where do our defaults come from? |
| In SQL | `WHERE channel = 'app'`, then the share of FPD | `WHERE fpd30 = 1`, then the share of app |

> ⚠️ **Watch out.** P(D | A) and P(A | D) share a numerator (the 41 loans) and nothing else. Before you say a percentage out loud, say its denominator: "of app loans…" (2 411) or "of FPDs…" (91).

**Your turn.** What is P(FPD | branch), in %, to 2 decimals? (34 FPDs among 3 263 branch loans.)

```task
{"id": "w06d1-l3", "kind": "number", "answer": 1.04, "dp": 2, "unit": "%", "hint": "Divide by the condition: the branch loans.", "model": "34 / 3 263 = 1.04 % — the FPD rate of a branch loan. 34 / 91 = 37.4 % would be P(branch | FPD), a different question."}
```

### Independence

**What it is.** Two events are **independent** (*независимые события*) when knowing one does not change the chance of the other: **P(D | A) = P(D)**. The same thing written another way: **P(A ∩ D) = P(A) · P(D)**.

**How to write it.** Compare the conditional rate with the overall rate, or the observed "both" share with the product.

```python
p_app, p_fpd = app / n, fpd / n
# P(D | A) = 0.0170   vs  P(D) = 0.0128
print(round(both / app, 4), round(p_fpd, 4))
# P(A ∩ D) = 0.00578 vs  P(A)·P(D) = 0.00435
print(round(both / n, 5), round(p_app * p_fpd, 5))
```

If channel did not matter, 0.435 % of the 7 099 loans — about 31 — would be app FPDs; there are 41. In this sample, channel and FPD are **not** independent.

**When you use it.**
- You may multiply probabilities ("both borrowers default = p × p") only for independent events.
- The binomial model below assumes it: one borrower's default does not change another's.

> ⚠️ **Watch out.** "Not independent in the sample" is not yet "not independent in reality": 10 extra loans can be luck, and Wednesday's test measures that. Also, independent is not mutually exclusive. Exclusive events are strongly dependent: if one happens, the other cannot.

**Your turn.** Partner loans: P(FPD | partner) = 16 / 1 425 = 1.12 %, and P(FPD) = 1.28 %. What do you conclude?

```task
{"id": "w06d1-l4", "kind": "choice", "options": ["Partner and FPD are exactly independent", "Close to independent: 1.12 % against 1.28 %, a gap of about 2 loans (16 seen, 18.3 expected) — much smaller than the app's gap", "Strongly dependent: partner loans never default", "They are mutually exclusive"], "answer": 1, "explain": "Under independence 1 425 × 91 / 7 099 = 18.3 partner loans would be FPDs; 16 are. Close, not exact — and real data are never exactly independent."}
```

### The law of total probability — a rate as a weighted average

**What it is.** The **law of total probability** (*формула полной вероятности*) rebuilds an overall rate from groups that cover every case exactly once: **P(D) = Σ P(D | group) · P(group)**. The book's rate is a **weighted average** of the group rates; each group's weight is its share.

**How to write it.**

```python
# P(FPD | channel)
rate  = {"app": 41 / 2411,   "branch": 34 / 3263,   "partner": 16 / 1425}
# P(channel)
share = {"app": 2411 / 7099, "branch": 3263 / 7099, "partner": 1425 / 7099}
# 0.0128 — the book rate
print(round(sum(rate[c] * share[c] for c in rate), 4))
```

| channel | share P(channel) | FPD rate | share × rate |
|---|---|---|---|
| app | 0.3396 | 1.70 % | 0.58 % |
| branch | 0.4596 | 1.04 % | 0.48 % |
| partner | 0.2007 | 1.12 % | 0.23 % |
| **book** | 1 | | **1.28 %** |

The book's 1.28 % is three pieces, one per channel: 0.58 + 0.48 + 0.23 points.

**When you use it.**
- A new mix: next month's rate is Σ (new share × channel rate).
- The denominator of Bayes' rule (next subsection) is this law.

> ⚠️ **Watch out.** The groups must not overlap and must cover everyone. Channels do; "app" and "grade C" do not — an app loan of grade C would be counted twice.

**Your turn.** Next month is planned as 50 % app and 50 % branch loans. What FPD rate should you expect, in %, to 2 decimals?

```task
{"id": "w06d1-l5", "kind": "number", "answer": 1.37, "dp": 2, "unit": "%", "hint": "0.5 × P(FPD | app) + 0.5 × P(FPD | branch).", "model": "0.5 × 1.70 % + 0.5 × 1.04 % = 1.37 % — the new weights move the book rate up from 1.28 %."}
```

### Bayes and the base-rate trap

**What it is.** **Bayes' rule** (*формула Байеса*) turns a conditional round: from P(flag | fraud) — how often a fraudster is flagged — to **P(fraud | flag)** — how often a flag is a fraudster. The answer depends heavily on the **base rate** (*базовая частота*): how common fraud is before any flag.

```pic
{"id": "w06d1-pic1", "title": "Of 553 flags, only 56 are fraudsters", "caption": "Of 10 000 applicants, the rule flags 56 of the 62 fraudsters (red) and 497 honest people (blue). Fraud is rare, so the honest flags outnumber the true ones about nine to one.", "chart": {"type": "bars", "labels": ["fraud", "honest"], "values": [56, 497], "tone": ["d", "e"], "show": true, "note": "y: flagged applicants, of 10 000"}}
```

**How to write it.** In words: the flagged fraudsters divided by everyone flagged.

```text
P(fraud | flag) =
  P(flag | fraud) · P(fraud)
  / [ P(flag | fraud) · P(fraud)
    + P(flag | honest) · P(honest) ]
```

The easy way is **natural frequencies**: imagine 10 000 applicants. A vendor's rule catches 90 % of fraudsters (the **sensitivity**) and flags 5 % of honest applicants (the **false-positive rate**). Our base rate for first-payment fraud — a loan that never paid a single soum of its first instalment — is 44 of 7 099 = 0.62 %.

```python
N, prior, sens, fpr = 10_000, 44 / 7099, 0.90, 0.05
fraud  = N * prior            # fraudsters among 10 000 applicants
honest = N - fraud            # honest applicants
tp = sens * fraud             # fraudsters flagged
fp = fpr * honest             # honest applicants flagged
print(round(fraud), round(tp), round(honest), round(fp))   # 62 56 9938 497
# 0.101 = P(fraud | flag)
print(round(tp / (tp + fp), 3))
```

| of 10 000 applicants | flagged | not flagged | total |
|---|---|---|---|
| fraudsters | **56** | 6 | 62 |
| honest | **497** | 9 441 | 9 938 |
| total | **553** | 9 447 | 10 000 |

553 flags, and 56 of them are fraudsters: P(fraud | flag) = 56 / 553 = **10.1 %** — nine flags in ten are honest people. The rule is accurate; fraud is rare; that is the **base-rate trap**.

**When you use it.**
- Any screening rule, scorecard cut-off or alert: "when it fires, how often is it right?"
- Always together with the base rate. A 5 % false-positive rate is small only next to a big base rate.

> 💡 **Key idea.** How often a flag is right depends on how common the thing is. Turn every Bayes question into natural frequencies — "of 10 000 applicants…" — and the answer counts itself.

**Your turn.** Fill in Bayes' rule by tapping the pieces into place.

```game
{"type": "cloze", "id": "w06d1-g1", "title": "Bayes' rule, piece by piece", "text": "P(fraud | flag) = {{0}} · {{1}} / ( P(flag | fraud) · P(fraud) + {{2}} · {{3}} )", "blanks": [["P(flag | fraud)", "P(fraud)"], ["P(fraud)", "P(flag | fraud)"], ["P(flag | honest)", "P(honest)"], ["P(honest)", "P(flag | honest)"]], "distractors": ["P(fraud | flag)", "P(honest | flag)"], "why": "Numerator: the flagged fraudsters. Denominator: everyone flagged — fraudsters plus honest people caught by the false-positive rate."}
```

### Random variables, expected value and variance

**What it is.** A **random variable** (*случайная величина*) is a number that depends on chance: the loss on one loan, the number of FPDs next month. A **discrete** one (*дискретная*) takes values from a list, each with a probability; a **continuous** one (*непрерывная*) takes any value in a range. Three numbers describe it:
- the **expected value** (*математическое ожидание*) E[X] = Σ x · P(X = x) — the long-run average;
- the **variance** (*дисперсия*) Var(X) = Σ (x − E[X])² · P(X = x) — the average squared distance from E[X];
- the **standard deviation** (*стандартное отклонение*) sd = √Var — the spread in the variable's own units.

**How to write it.** One Consumer loan: 27 m soum lent, PD = 77 / 2 418 = 3.18 % (Consumer loans now in 90+), and 60 % of the money is lost if it defaults.

| loss L | P(L) |
|---|---|
| 0 | 0.9682 |
| 16.2 m soum (0.6 × 27 m) | 0.0318 |

```python
# the possible losses, soum
values = [0, 0.6 * 27_000_000]
# their probabilities (sum = 1)
probs  = [1 - 77 / 2418, 77 / 2418]
E   = sum(x * q for x, q in zip(values, probs))             # expected value
Var = sum((x - E) ** 2 * q for x, q in zip(values, probs))  # variance
print(round(E), round(math.sqrt(Var)))                      # 515881 2844492
```

The expected loss is 0.52 m soum and the sd is 2.84 m — the spread is five times the mean, so one loan is a lottery ticket.

Four rules you will use all week: E[aX + b] = a·E[X] + b; Var(aX + b) = a²·Var(X); expectations of a sum always add; variances add when the variables are independent. For 400 independent Consumer loans: E = 400 × 0.52 m = 206.4 m, sd = √400 × 2.84 m = 56.9 m.

**When you use it.**
- Expected loss, expected revenue, the expected number of defaults: E.
- How far the result can swing around E: the sd.

> 💡 **Key idea.** Expectations add always; variances add when the loans are independent. So the total grows like n and its spread like √n — the arithmetic behind "many small loans" and behind every standard error tomorrow.

**Your turn.** A loan loses 0 with probability 0.97 and 10 m soum with probability 0.03. What is E[L], in m soum?

```task
{"id": "w06d1-l6", "kind": "number", "answer": 0.3, "dp": 2, "unit": "m soum", "hint": "Σ value × probability: 0 × 0.97 + 10 × 0.03.", "model": "E[L] = 0 × 0.97 + 10 m × 0.03 = 0.3 m soum. No single loan ever loses 0.3 m — it loses 0 or 10 m; 0.3 m is the long-run average per loan."}
```

### Bernoulli and binomial — defaults in a batch

**What it is.** A **Bernoulli** variable (*распределение Бернулли*) is one yes/no trial: 1 with probability p, 0 otherwise; E = p, Var = p(1 − p). The **binomial** (*биномиальное распределение*) **X ~ Bin(n, p)** counts the yeses in n **independent** Bernoulli trials with the same p — the FPDs among 400 loans.

```pic
{"id": "w06d1-pic2", "title": "FPDs in a batch of 400 loans: about 5, rarely 10", "caption": "The exact Bin(400, 1.28 %) probabilities: the bars pile up around the mean of 5.13 FPDs. The dark bar is the tail, **10 or more** FPDs: 3.57 % of months.", "chart": {"type": "bars", "labels": ["0–1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"], "values": [3.55, 7.72, 13.3, 17.14, 17.63, 15.07, 11.01, 7.03, 3.97, 3.57], "hl": [9], "marks": [{"at": 4.13, "label": "mean 5.13"}], "note": "x: FPDs among 400 loans · y: probability"}}
```

**How to write it.** P(X = k) = C(n, k) · p^k · (1 − p)^(n − k): the number of orders C(n, k) times the probability of one order. E[X] = n·p, Var(X) = n·p·(1 − p). The helpers `pmf`, `cdf`, `at_least` are in the first box.

```python
n, p = 400, 91 / 7099
# 5.13 2.25 — mean and sd
print(round(n * p, 2), round(math.sqrt(n * p * (1 - p)), 2))
# P(X = 5)   = 0.1763   Excel: =BINOM.DIST(5, 400, 91/7099, FALSE)
print(round(pmf(5, n, p), 4))
# P(X <= 4)  = 0.4172   Excel: =BINOM.DIST(4, 400, 91/7099, TRUE)
print(round(cdf(4, n, p), 4))
# P(X >= 10) = 0.0357   Excel: =1 - BINOM.DIST(9, 400, 91/7099, TRUE)
print(round(at_least(10, n, p), 4))
# 9: the 95th percentile   Excel: =BINOM.INV(400, 91/7099, 0.95)
print(min(k for k in range(n + 1) if cdf(k, n, p) >= 0.95))
# the same in scipy (the notebook): X = scipy.stats.binom(400, p); X.mean(),
# X.std(), X.pmf(5), X.cdf(4), X.sf(9), X.ppf(0.95)
```

| FPDs k in 400 loans | 0 | 2 | 4 | 5 | 6 | 8 | 10 | 12 |
|---|---|---|---|---|---|---|---|---|
| P(X = k) | 0.006 | 0.077 | 0.171 | 0.176 | 0.151 | 0.070 | 0.020 | 0.004 |

Expect 5.13 FPDs, give or take 2.25; ten or more happens in 3.57 % of months.

**When you use it.**
- A fixed number n of yes/no cases with the same p, independent of each other: FPDs among next month's loans, approvals among 50 decided applications.
- "How many is unusual?" — the tail, P(X ≥ k).

> ⚠️ **Watch out.** "10 or more" is P(X ≥ 10) = 1 − P(X ≤ 9) = `sf(9)` in scipy, not `sf(10)`. The off-by-one is the trap of the day, in Excel too (`1 - BINOM.DIST(9, …, TRUE)`). And the model assumes independence: in a recession defaults move together and the binomial *understates* the tail (the Stretch measures how much).

**Your turn.**

```game
{"id": "w06d1-g5", "type": "bug", "title": "The alarm that rings one late", "q": "Nilufar wants P(10 or more FPDs) in 400 loans. One line answers a different question.", "code": "n, p = 400, 91 / 7099\n# P(10 or more FPDs)\ntail = 1 - cdf(10, n, p)\nprint(round(tail, 4))", "answer": [2], "why": "1 − cdf(10) is 1 − P(X ≤ 10) = P(X ≥ 11). '10 or more' is 1 − cdf(9, n, p), which is at_least(10, n, p) = 0.0357."}
```

### Poisson — applications per hour

**What it is.** The **Poisson** distribution (*распределение Пуассона*) counts events in a fixed window — an hour, a day — when they arrive independently at a constant average rate **λ**. It has one parameter, and **mean = variance = λ**. There is no fixed n: an hour can hold 0, 1, 2 … applications.

**How to write it.** P(X = k) = e^(−λ) · λ^k / k!. Nur's 2026 applications (1 Jan – 30 Sep, clock hours 08:00–20:59, empty hours counted): 5 102 applications in 3 549 hours.

```python
lam, hours = 5102 / 3549, 3549  # λ = 1.44 applications per hour
def pois(k, lam):               # P(X = k) for X ~ Poisson(lam)
    return math.exp(-lam) * lam**k / math.factorial(k)
# hours the model expects with 0, 1, … 6 applications
print([round(hours * pois(k, lam), 1) for k in range(7)])
# 0.2375: an empty hour   Excel: =POISSON.DIST(0, 1.4376, FALSE)
print(round(pois(0, lam), 4))
# 0.0158: 5 or more       Excel: =1 - POISSON.DIST(4, 1.4376, TRUE)
print(round(1 - sum(pois(k, lam) for k in range(5)), 4))
```

| applications in the hour | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7+ |
|---|---|---|---|---|---|---|---|---|
| hours observed | 850 | 1 204 | 863 | 420 | 163 | 38 | 8 | 3 |
| Poisson(1.44) expects | 842.9 | 1 211.7 | 871.0 | 417.4 | 150.0 | 43.1 | 10.3 | 2.6 |

The model expects 842.9 empty hours and 850 were observed; the data's mean and variance are both 1.44 — the Poisson fingerprint.

**When you use it.**
- Staffing: how many officers the 18:00 peak needs.
- Alerting: an hour with 8 applications (P ≈ 0.01 %) is a bot or a campaign.
- A shortcut for the binomial when n is large and p small: Poisson(5.13) gives P(X ≥ 10) = 3.67 % against the exact 3.57 %.

| | Binomial | Poisson |
|---|---|---|
| Counts | yeses in n trials | events in a window |
| Upper limit | n | none |
| Parameters | n, p | λ |
| Mean, variance | n·p, n·p·(1 − p) | λ, λ |

> ⚠️ **Watch out.** Check that the mean is close to the variance before you use Poisson. When events come in bursts (a marketing SMS, a holiday), the variance is far bigger and the Poisson understates the busy hours.

**Your turn.** With λ = 1.4376, what share of hours should have exactly 3 applications, in %, to 1 decimal?

```task
{"id": "w06d1-l7", "kind": "number", "answer": 11.8, "dp": 1, "unit": "%", "hint": "e^(−λ) · λ³ / 3!  — or pois(3, lam) in the box above.", "model": "e^(−1.4376) × 1.4376³ / 6 = 0.1176 → 11.8 % of hours; × 3 549 hours = 417.4, against 420 observed."}
```

### Exponential — minutes between applications

**What it is.** If arrivals are Poisson, the **gaps** between them follow the **exponential** distribution (*показательное распределение*). It is continuous — a gap can be 12.4 minutes — and has one parameter, the mean gap. Its odd property is **memorylessness** (*отсутствие последействия*): after 30 quiet minutes, the wait for the next application is still 39 minutes on average.

**How to write it.** P(gap > t) = e^(−t / mean gap).

```python
# minutes, the 4 829 gaps within 2026 working days
mean_gap = 39.34
# 0.2176: P(gap > 60 min); observed 0.2172   Excel: =1 - EXPON.DIST(60, 1/39.34,
# TRUE)
print(round(math.exp(-60 / mean_gap), 4))
# 0.4665: P(gap > 30 min); observed 0.4587
print(round(math.exp(-30 / mean_gap), 4))
```

The model says 21.8 % of gaps last more than an hour; the data say 21.7 %.

**When you use it.**
- Waiting times between independent arrivals: the next application, the next call to the call centre.

> ⚠️ **Watch out.** Memorylessness fits arrivals from many independent people. It does not fit things on a schedule: payments cluster at the due date, so the time to the next payment is not exponential.

**Your turn.** What share of gaps does the model put above 90 minutes, in %, to 1 decimal?

```task
{"id": "w06d1-l8", "kind": "number", "answer": 10.1, "dp": 1, "unit": "%", "hint": "e^(−90 / 39.34).", "model": "e^(−90 / 39.34) = 0.1015 → 10.1 %; the data show 10.5 %."}
```

### Uniform — every value equally likely

**What it is.** The **uniform** distribution (*равномерное распределение*) gives every value in a range the same chance. **Discrete** uniform: a die, a loan id drawn at random from 1 to 7 828. **Continuous** uniform **U(a, b)**: every point between a and b is equally likely, and the density is a flat line at 1 / (b − a).

**How to write it.** For U(a, b): P(between c and d) = (d − c) / (b − a); mean = (a + b) / 2; sd = (b − a) / √12. The minute past the hour at which an application arrives should be U(0, 60):

```python
a, b = 0, 60
# 30.0 17.32 — the model's mean and sd
print((a + b) / 2, round((b - a) / math.sqrt(12), 2))
# minute past the hour, 14 000 applications
mins = pd.to_datetime(apps["applied_at"]).dt.minute
# 28.9 17.2 — the data's mean and sd
print(round(mins.mean(), 1), round(mins.std(), 1))
# 0.255 — the model says 15 / 60 = 0.25
print(round((mins < 15).mean(), 3))
# [2375, 2385, 2491, 2342, 2210, 2197]
print(mins.floordiv(10).value_counts().sort_index().tolist())
```

| minutes past the hour | 0–9 | 10–19 | 20–29 | 30–39 | 40–49 | 50–59 |
|---|---|---|---|---|---|---|
| applications | 2 375 | 2 385 | 2 491 | 2 342 | 2 210 | 2 197 |

Each 10-minute block holds between 2 197 and 2 491 applications; a perfectly flat line would be 2 333 each.

**When you use it.**
- Drawing a fair random sample, where every loan is equally likely — tomorrow starts here.
- A "know only the range" model.
- `random.random()` is U(0, 1): the first subsection used it to decide which loans default.

**Your turn.** What share of applications does U(0, 60) put in the last 10 minutes of an hour, in %, to 1 decimal?

```task
{"id": "w06d1-l9", "kind": "number", "answer": 16.7, "dp": 1, "unit": "%", "hint": "(d − c) / (b − a) = (60 − 50) / 60.", "model": "10 / 60 = 16.7 %. The data show 2 197 / 14 000 = 15.7 % — slightly fewer applications at the end of the hour."}
```

### Normal — credit scores

**What it is.** The **normal** distribution (*нормальное распределение*) **N(μ, σ)** is the symmetric bell. The mean μ places its centre; the standard deviation σ sets its width. **Standardising** (*стандартизация*) **z = (x − μ) / σ** says how many sds a value sits from the mean, and puts every normal on one scale, N(0, 1).

**How to write it.** `NormalDist(mu, sd).cdf(x)` = P(X ≤ x). Nur's 13 612 scored applicants (388 have no score — `dropna` and say so):

```python
mu, sd = s.mean(), s.std()
model = NormalDist(mu, sd)
# 13612 659.6 59.5
print(len(s), round(mu, 1), round(sd, 1))
# -1.0: a score of 600 is one sd below the mean
print(round((600 - mu) / sd, 2))
# 0.1583 model, 0.1583 data   Excel: =NORM.DIST(600, 659.6, 59.5, TRUE)
print(round(model.cdf(600), 4), round((s < 600).mean(), 4))

fig, ax = plt.subplots(1, 2, figsize=(10, 3.6))
ax[0].hist(s, bins=40, density=True, color="#9bb7d4")  # the bars
grid = np.linspace(s.min(), s.max(), 200)
# the bell over the bars
ax[0].plot(grid, [model.pdf(v) for v in grid], color="#c0392b")
ax[0].set_title("Applicants' credit score + the normal curve")
# QQ plot: data quantiles vs normal quantiles
q = np.sort(s.sample(2000, random_state=2026).to_numpy())
theory = [model.inv_cdf((i + 0.5) / len(q)) for i in range(len(q))]
ax[1].scatter(theory, q, s=4); ax[1].plot(theory, theory, color="#c0392b")
ax[1].set_title("QQ plot (2 000 applicants): on the line = normal")
plt.tight_layout(); plt.show()
# scipy (the notebook): scipy.stats.norm.cdf(600, 659.6, 59.5),
# scipy.stats.probplot(s, dist="norm", plot=plt)
```

μ = 659.6, σ = 59.5; the model puts 15.83 % of applicants below 600, and the data say 15.83 %.

The **QQ plot** (*квантиль-квантильный график*) puts the data's quantiles against the normal's: points on the line mean normal; an S shape means heavy or light tails; a bend at one end means skew. Applicants' scores lie on the line.

**When you use it.**
- Measurements that pile up symmetrically around a centre: scores, and tomorrow the averages of samples.
- To turn a value into "how unusual is it?": its z.

> ⚠️ **Watch out.** Check *which* population you fitted. Approved loans' scores are not normal: 7 615 scored loans, μ = 680.8, σ = 52.6, and the left tail is cut — the model says 6.2 % below 600, the data 4.3 %, because the approval rule removed most of them. A **selected** sample is not the population it came from. Check every normal with two pictures — the bell over the histogram and the QQ plot — not one number.

**Your turn.** What is the z-score of a score of 720 (μ = 659.6, σ = 59.5)? Two decimals.

```task
{"id": "w06d1-l10", "kind": "number", "answer": 1.02, "dp": 2, "unit": "sd", "hint": "z = (x − μ) / σ.", "model": "(720 − 659.6) / 59.5 = 1.02: a score of 720 sits about one sd above the average applicant."}
```

### The 68-95-99.7 rule — one, two, three sds

**What it is.** For any normal, about **68 %** of values lie within ±1 sd of the mean, **95 %** within ±2 sd (±1.96 sd exactly), and **99.7 %** within ±3 sd. It is the quickest check of "is this value unusual?".

```pic
{"id": "w06d1-pic3", "title": "Two thirds of applicants within one sd, 95 % within two", "caption": "Applicants' credit scores in bands of one sd around the mean 659.6 (σ = 59.5). The two teal bars hold **68.0 %** of the 13 612 scored applicants; add the two amber bars and it is **95.4 %**.", "chart": {"type": "bars", "labels": ["<−2", "−2…−1", "−1…0", "0…1", "1…2", ">2"], "values": [2.4, 13.85, 33.41, 34.54, 13.63, 2.17], "tone": [null, "b", "a", "a", "b", null], "marks": [{"at": 2.5, "label": "mean 659.6"}], "note": "x: sds from the mean · y: share of applicants"}}
```

**How to write it.** The rule comes from N(0, 1); the box checks it on the applicants' scores (`mu`, `sd` from the box above).

```python
for k in (1, 2, 3):
    # share of N(0, 1) within ±k
    rule = NormalDist().cdf(k) - NormalDist().cdf(-k)
    # share of applicants within ±k sd
    data = ((s - mu).abs() <= k * sd).mean()
    print(k, round(rule, 3), round(data, 3), round(mu - k * sd), round(mu + k * sd))
# 1.96   Excel: =NORM.S.INV(0.975)
print(round(NormalDist().inv_cdf(0.975), 2))
```

| within | the rule | applicants' scores | score range |
|---|---|---|---|
| ±1 sd | 68.3 % | 68.0 % | 600 – 719 |
| ±2 sd | 95.4 % | 95.4 % | 541 – 779 |
| ±3 sd | 99.7 % | 99.8 % | 481 – 838 |

95.4 % of applicants score between 541 and 779 — the rule, almost to the decimal.

**When you use it.**
- "Is a score of 800 unusual?" — (800 − 659.6) / 59.5 = 2.36 sd: outside the ±2 sd band, about 1 applicant in 110 scores higher.
- A quick range: mean ± 2 sd holds about 95 % of a normal column.

> ⚠️ **Watch out.** The rule needs a roughly normal shape. Loan principal has mean 51.7 m and sd 112.6 m, so "mean − 1 sd" is negative — no loan is. Check the shape first (Skew, below).

**Your turn.** Between which two scores does the normal model put the middle 95 % of applicants?

```task
{"id": "w06d1-l11", "kind": "choice", "options": ["Between 600 and 719", "Between 541 and 779 — the mean ± 2 sd", "Between 481 and 838", "Between 560 and 760"], "answer": 1, "explain": "The middle 95 % of a normal is mean ± 2 sd (± 1.96 sd exactly: 543 to 776). 600–719 is ±1 sd (68 %); 481–838 is ±3 sd (99.7 %)."}
```

### Mean, median and mode — the centre of data

**What it is.** Three ways to say "a typical value" of a data column:
- the **mean** (*среднее арифметическое*) — the sum divided by the count;
- the **median** (*медиана*) — the middle value after sorting: half the values are below it, half above;
- the **mode** (*мода*) — the most frequent value.

**How to write it.** Five loans, principal in m soum: 2, 4, 5, 6, 33. The mean is 50 / 5 = 10. The median is 5, the third of five. One big loan pulls the mean to 10; the median stays at 5.

```python
x = [2, 4, 5, 6, 33]
print(st.mean(x), st.median(x))  # 10 5
# all 7 828 loans, soum
prin = loans["principal"]
# 51.71 5.79 (m soum)
print(round(prin.mean() / 1e6, 2), round(prin.median() / 1e6, 2))
# [6] 2483
print(loans["term_months"].mode().tolist(), (loans["term_months"] == 6).sum())
```

The average loan is 51.71 m soum, but half of all loans are below 5.79 m: a few large Auto and SME loans pull the mean up. The most common term is 6 months (2 483 loans).

**When you use it.**

| | mean | median | mode |
|---|---|---|---|
| Answers | the total ÷ the count | the typical case | the most common value |
| A few huge values | pull it | do not move it | do not move it |
| Good for | totals and budgets, symmetric data | money, incomes, days late | categories, terms, counts |

> ⚠️ **Watch out.** The mode of a continuous column is noise: the most common principal, 4 880 000 soum, belongs to only 17 loans. Use the mode for categories and whole-number columns.

**Your turn.** The median principal of Consumer loans (`product_id` 2), in soum.

```task
{"id": "w06d1-l12", "kind": "python", "starter": "cons = loans.loc[loans[\"product_id\"] == 2, \"principal\"]    # Consumer loans\n# print the median principal, in soum\n", "answer": 26965000, "dp": 0, "model": "print(cons.median(), round(cons.mean()))   # 26965000.0 26926915 — inside one product the mean and the median almost agree"}
```

### Variance and standard deviation of data

**What it is.** The **variance** (*дисперсия*) of a data column is the average squared distance from the mean. The **standard deviation** (*стандартное отклонение*) is its square root, back in the column's units. For a **sample** you divide by n − 1, not n — the **sample variance** (*выборочная дисперсия*). pandas `.std()` and Excel `STDEV.S` do this by default.

**How to write it.** The five loans 2, 4, 5, 6, 33 (mean 10):

| x | x − mean | (x − mean)² |
|---|---|---|
| 2 | −8 | 64 |
| 4 | −6 | 36 |
| 5 | −5 | 25 |
| 6 | −4 | 16 |
| 33 | 23 | 529 |
| **sum** | 0 | **670** |

Variance = 670 / (5 − 1) = 167.5; sd = √167.5 = 12.94.

```python
# 167.5 12.94   Excel: =VAR.S(…), =STDEV.S(…)
print(st.variance(x), round(st.stdev(x), 2))
# 59.5 points (scores), 112.6 m soum (principal)
print(round(s.std(), 1), round(prin.std() / 1e6, 1))
```

Scores swing about 59.5 points around 659.6; principals swing 112.6 m around 51.7 m — more than twice the mean.

**When you use it.**
- How spread out a column is, in its own units.
- Comparing the spread of two groups; tomorrow's standard error is sd / √n.

> ⚠️ **Watch out.** NumPy's `np.std(x)` divides by n; pandas `.std()` divides by n − 1. On 7 828 loans the gap is invisible; on the 5 values above it is 11.58 against 12.94. Write `ddof=1` in NumPy when you mean a sample.

**Your turn.** The standard deviation of the loan term, in months (sample, 2 decimals).

```task
{"id": "w06d1-l13", "kind": "python", "starter": "t = loans[\"term_months\"]\n# print the sample standard deviation of the term, rounded to 2 decimals\n", "answer": 10.18, "dp": 2, "model": "print(round(t.std(), 2), round(t.mean(), 2))   # 10.18 11.78 — terms swing about 10 months around a 12-month average"}
```

### Percentiles and quartiles — where a value stands

**What it is.** The **p-th percentile** (*перцентиль*, or *квантиль* of level p/100) is the value below which p % of the data lie. The 50th percentile is the median. The 25th and 75th are the **quartiles** (*квартили*) Q1 and Q3. Q3 − Q1 is the **interquartile range**, IQR (*межквартильный размах*) — the width of the middle half.

**How to write it.** `col.quantile(q)` with q between 0 and 1.

```python
# [2.88, 5.79, 34.71, 187.03] m soum
print((prin.quantile([0.25, 0.5, 0.75, 0.9]) / 1e6).round(2).tolist())
# [583.0, 660.0, 736.0]
print(s.quantile([0.1, 0.5, 0.9]).tolist())
# 15.8: a score of 600 sits at the 16th percentile
print(round(100 * (s < 600).mean(), 1))
```

| principal, m soum | Q1 (25 %) | median (50 %) | Q3 (75 %) | 90 % |
|---|---|---|---|---|
| all 7 828 loans | 2.88 | 5.79 | 34.71 | 187.03 |

A quarter of loans are below 2.88 m; the middle half lies between 2.88 m and 34.71 m (IQR 31.8 m); one loan in ten is above 187 m.

**When you use it.**
- "Where does this customer stand?" — the percentile rank.
- Cut-offs: the bottom 10 % of scores, the top 1 % of exposures.
- A spread that ignores outliers: the IQR does not move when the biggest loan doubles; the sd does.

> ⚠️ **Watch out.** pandas' default and Excel's `PERCENTILE.INC` agree; `PERCENTILE.EXC` and other methods give slightly different values on small data. Say which one you used when numbers must match.

**Your turn.** The 25th percentile (Q1) of applicants' credit scores.

```task
{"id": "w06d1-l14", "kind": "python", "starter": "# s = the 13 612 applicants' scores (first box)\n# print the 25th percentile\n", "answer": 619, "dp": 0, "model": "print(s.quantile(0.25), s.quantile(0.75))   # 619.0 700.0 — the middle half of applicants scores 619 to 700"}
```

### Skew — when the mean and the median disagree

**What it is.** **Skewness** (*асимметрия*) measures how lopsided a distribution is. **Right skew** (positive): a long tail of large values, so the mean is above the median — money, incomes, days late. **Left skew** (negative): a long tail of small values, mean below the median. Skew near 0: symmetric, mean ≈ median.

**How to write it.** pandas `.skew()`. Above about +1 or below −1 counts as strongly skewed.

```python
print(round(prin.skew(), 2), round(s.skew(), 2))  # 2.93 -0.04
# 8.9: the mean principal is almost nine times the median
print(round(prin.mean() / prin.median(), 1))
```

| column | mean | median | skew | shape |
|---|---|---|---|---|
| principal, m soum | 51.71 | 5.79 | 2.93 | long right tail |
| credit score | 659.6 | 660 | −0.04 | symmetric |

Principal is strongly right-skewed — many small Micro and BNPL loans, a few huge SME and Auto loans. The score is symmetric, which is why the normal fits it.

**When you use it.**
- Before you pick a centre: skewed → report the median and percentiles; symmetric → the mean is fine.
- Before you use the normal or the 68-95-99.7 rule — both need skew near 0.
- On Day 4: skew is the first reason a t-test can mislead.

> ⚠️ **Watch out.** A mix of groups can create the skew. Inside each product the principal is nearly symmetric (Consumer: mean 26.93 m, median 26.97 m); the whole book is not. When groups differ, describe each group.

**Your turn.** Customers' monthly income: mean 15.25 m soum, median 7.90 m soum. Which shape, and which number is "the typical customer's income"?

```task
{"id": "w06d1-l15", "kind": "choice", "options": ["Symmetric; either number", "Right-skewed; the median, 7.90 m", "Right-skewed; the mean, 15.25 m", "Left-skewed; the median, 7.90 m"], "answer": 1, "explain": "Mean almost twice the median → a long tail of high incomes (skew 1.32). Half of customers earn less than 7.90 m, so the median is the typical customer; the mean is pulled up by a few high earners."}
```

### Simulation — when the formula runs out

**What it is.** A **simulation** (*имитационное моделирование*) draws the random world many times with a computer and counts what happened. It answers questions no formula covers — a month that mixes products with different PDs, defaults that move together, a loss with a random LGD.

**How to write it.** Draw, count, compare with a formula where one exists.

```python
# seeded: the same "random" numbers on every run
rng = np.random.default_rng(2026)
# 100 000 simulated months of 400 loans
months = rng.binomial(400, 91 / 7099, size=100_000)
# 5.115, 0.0355 — the formula says 5.127, 0.0357
print(months.mean(), np.mean(months >= 10))
# [1, 10]: the middle 95 % of months
print(np.quantile(months, [0.025, 0.975]))
```

100 000 simulated months average 5.115 FPDs and reach 10 or more 3.55 % of the time — the formula's 5.127 and 3.57 %, within the simulation's noise.

**When you use it.**
- When the model has parts no textbook distribution covers.
- To check a formula you are not sure of.

> 💡 **Key idea.** A simulation is a formula you can always write: draw the world many times, count. Seed it so others get your numbers, and test it where a formula exists before you trust it where none does.

**Your turn.** Why `default_rng(2026)` and not `default_rng()`?

```task
{"id": "w06d1-l16", "kind": "choice", "options": ["To make the simulation run faster", "So that anyone who re-runs the box gets exactly your numbers", "To make the random numbers more random", "Because NumPy refuses to run without one"], "answer": 1, "explain": "An unseeded run gives 3.55 % for you and 3.61 % for the reviewer, and the meeting is about noise. default_rng(2026) fixes the draws."}
```

### Putting it together

One request, most of today's tools: *"400 Consumer loans next month — how many defaults, and how much money could we lose?"*

```python
# probability: PD of a Consumer loan, a long-run share
n, p_c = 400, 77 / 2418
# random variable: 16.2 m soum lost if one loan defaults
loss_if_default = 0.6 * 27_000_000
mean_d = n * p_c                                 # binomial: expected defaults
# and their sd (independence assumed)
sd_d = math.sqrt(n * p_c * (1 - p_c))
# binomial percentiles:
lo = min(k for k in range(n + 1) if cdf(k, n, p_c) >= 0.025)
# the middle 95 % of months
hi = min(k for k in range(n + 1) if cdf(k, n, p_c) >= 0.975)
print(round(mean_d, 1), round(sd_d, 2), lo, hi)  # 12.7 3.51 6 20
# 206.4: expected loss, m soum (expectations add)
print(round(mean_d * loss_if_default / 1e6, 1))
# 5.9 19.6: the normal shortcut, ±1.96 sd
print(round(mean_d - 1.96 * sd_d, 1), round(mean_d + 1.96 * sd_d, 1))
```

| step | the number | the concept |
|---|---|---|
| PD = 77 / 2 418 | 3.18 % | probability as a long-run share; conditional — P(90+ given Consumer) |
| loss of one loan | 0 or 16.2 m | random variable, Bernoulli |
| defaults among 400 | expect 12.7, sd 3.51 | binomial, independence |
| an ordinary month | 6 to 20 defaults | binomial percentiles |
| expected loss | 206.4 m soum | expected value — expectations add |
| the quick check | 5.9 to 19.6 | normal, 68-95-99.7 (±1.96 sd) |

Expect about 13 defaults and 206 m soum of loss; a month with 6 to 20 defaults (97 m to 324 m) is ordinary. The normal shortcut lands close to the exact binomial because n·p = 12.7 is large enough for the bell.

**Which distribution?** Four shapes and the uniform, five kinds of question — sort them.

```game
{"type": "sort", "id": "w06d1-g3", "title": "Which distribution?", "q": "Put each Nur question under the distribution that models it.", "groups": {"Binomial": ["FPDs among next month's 400 loans", "approved applications out of 50 decided"], "Poisson": ["applications arriving in one clock hour", "calls to the call centre in one minute"], "Normal": ["applicants' credit scores", "the z-score of one applicant's score"], "Exponential": ["minutes between two applications", "the wait after 30 quiet minutes"], "Uniform": ["the minute past the hour an application arrives", "a loan id drawn at random for an audit"]}}
```

**Words of the day.**

```game
{"type": "match", "id": "w06d1-g2", "title": "Words of the day", "pairs": [["Complement", "not A — its probability is 1 − P(A)"], ["Intersection A ∩ D", "A and D both happen"], ["Conditional probability P(D | A)", "the chance of D among the cases where A happened"], ["Independent events", "knowing A does not change the chance of D"], ["Expectation E[X]", "the long-run average of a random variable"], ["Standard deviation", "the spread, in the variable's own units"], ["Median", "the middle value: half the data below, half above"], ["Right skew", "a long tail of large values — the mean above the median"]]}
```

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Conditional probability, "among those who..." — [Conditional Probabilities, Clearly Explained!!! (StatQuest with Josh Starmer), 01:11](https://youtu.be/_IgyaD7vOOA?t=71&end=285)
- ▶ Bayes and the base-rate trap — [Bayes' Theorem, Clearly Explained!!!! (StatQuest), 05:21](https://youtu.be/9wCnvr7Xw4E?t=321&end=552)
- ▶ Binomial — [The Binomial Distribution and Test, Clearly Explained!!! (StatQuest)](https://youtu.be/J8jNoF-K8E8)
- ▶ Binomial (RU) — [Биномиальное распределение. Вероятности вероятностей. Математика для аналитика #2 (Skypro)](https://youtu.be/VJTQNc8eliY)
- ▶ Poisson — [Poisson Distribution EXPLAINED in UNDER 15 MINUTES! (zedstatistics), 02:15](https://youtu.be/cPOChr_kuQs?t=135&end=188)
- ▶ Normal distribution — [The Normal Distribution, Clearly Explained!!! (StatQuest)](https://youtu.be/rzFX5NWojp0)

- RU deck (TBC Data Analytics 2.0, if you have it) `5.1 Basics of Probability Theory.pdf`: events and operations pp. 9–17, classical / statistical probability pp. 32–43, conditional probability pp. 52–57, independence pp. 58–63, total probability pp. 64–70, Bayes pp. 71–76, random variables pp. 79–104, expectation pp. 119–127, variance pp. 128–134, skewness / kurtosis / median / quantile pp. 139–150. `5.2 Statistics & Probability Theory.pdf`: Bernoulli formula pp. 5–10, binomial pp. 26–31, Poisson pp. 32–36, exponential pp. 41–44, normal pp. 45–53.
- Notebooks: `MS1_probability_theory.ipynb` (conditional probability, Monty Hall, total probability and Bayes with three worked examples), `MS4_probability_theory_basics.ipynb` (every distribution of today drawn with `scipy.stats`, plus a call-centre binomial simulation).
- Visual: Seeing Theory (seeing-theory.brown.edu), chapters 1–3 — Basic Probability, Compound Probability, Probability Distributions.
- *Russian terms:* случайное событие = event, вероятность = probability, условная вероятность = conditional probability, независимые события = independent events, формула полной вероятности = law of total probability, формула Байеса = Bayes' rule, случайная величина = random variable, математическое ожидание (мат. ожидание) = expectation, дисперсия = variance, стандартное (среднеквадратическое) отклонение = standard deviation, распределение Бернулли / биномиальное / Пуассона / нормальное / показательное = Bernoulli / binomial / Poisson / normal / exponential distribution, функция распределения = cumulative distribution function, плотность = density, квантиль = quantile, ТВиМС = probability theory and mathematical statistics.

**Questions inside the videos.** Open a video from the panel: it stops at these points and asks one question about the bit you just watched.

```videoquiz
{"video": "_IgyaD7vOOA", "stops": [
  {"at": 150, "q": "What does the bar in P(A | B) mean?", "options": ["'Given': the chance of A counted only among the cases where B happened", "'Or': A or B happens", "'Divided by': P(A) / P(B)", "'Not': A without B"], "answer": 0, "explain": "The condition shrinks the world to B; the new denominator is B's count — 2 411 app loans, not 7 099."},
  {"at": 260, "q": "How is a conditional probability computed from a table of counts?", "options": ["Both together, divided by the grand total", "The condition's count divided by the grand total", "Both together, divided by the count of the condition", "Multiply the two shares"], "answer": 2, "explain": "P(D | A) = P(A ∩ D) / P(A): 41 / 2 411 = 1.70 %. Divide by the grand total and you get the intersection, 0.58 %."}]}
```

```videoquiz
{"video": "9wCnvr7Xw4E", "stops": [
  {"at": 400, "q": "Bayes' rule turns which probability round?", "options": ["P(B | A) into P(A | B)", "P(A) into P(not A)", "P(A ∩ B) into P(A ∪ B)", "A mean into a median"], "answer": 0, "explain": "From 'how often is a fraudster flagged' to 'how often is a flag a fraudster' — the question the committee actually asks."},
  {"at": 520, "q": "What does the denominator of Bayes' rule add up?", "options": ["Only the true cases", "Every way to get the evidence: true cases flagged plus other cases flagged", "The prior twice", "The false positives only"], "answer": 1, "explain": "That is the law of total probability: 56 fraudsters flagged + 497 honest people flagged = 553 flags."}]}
```

```videoquiz
{"video": "J8jNoF-K8E8", "stops": [
  {"at": 150, "q": "What do you need to fix before a binomial probability can be computed?", "options": ["The mean and the standard deviation", "The rate per hour λ", "Only the number of 'yes' answers", "The number of trials n and the probability p of a 'yes' in each"], "answer": 3, "explain": "X ~ Bin(n, p): next month's n = 400 loans, p = 91 / 7 099 per loan."},
  {"at": 420, "q": "Why does the binomial formula contain C(n, k), 'n choose k'?", "options": ["k 'yes' answers can sit in many different orders, and each order has the same probability", "To make the probabilities add up to n", "To correct for small samples", "It turns counts into percentages"], "answer": 0, "explain": "p^k (1 − p)^(n − k) is one order; C(n, k) counts the orders."}]}
```

```videoquiz
{"video": "VJTQNc8eliY", "stops": [
  {"at": 150, "q": "Which situation is binomial?", "options": ["A fixed number of independent yes/no trials with the same p", "Events per hour with no upper limit", "Waiting time until the next event", "A score measured on a continuous scale"], "answer": 0, "explain": "400 loans, each FPD or not, same p — the model of Nilufar's wall number."},
  {"at": 420, "q": "The expected number of 'yes' in Bin(n, p) is…", "options": ["p / n", "n · p · (1 − p)", "n · p", "√(n · p)"], "answer": 2, "explain": "E = n·p = 400 × 1.28 % = 5.13; n·p·(1 − p) is the variance."}]}
```

```videoquiz
{"video": "cPOChr_kuQs", "stops": [
  {"at": 158, "q": "What must be true for counts per window to be Poisson?", "options": ["Events arrive independently at a constant average rate", "Exactly n trials happen", "The counts are normally distributed", "Each window has at least one event"], "answer": 0, "explain": "Applications per clock hour: independent arrivals at λ = 1.44 per hour."},
  {"at": 182, "q": "The Poisson distribution has one parameter λ. What is it?", "options": ["Its maximum", "Both its mean and its variance", "Its median only", "The number of trials"], "answer": 1, "explain": "Mean = variance = λ — the fingerprint you checked on Nur's 3 549 hours."}]}
```

```videoquiz
{"video": "rzFX5NWojp0", "stops": [
  {"at": 150, "q": "What do the mean and the standard deviation do to a normal curve?", "options": ["The mean places the centre, the sd sets the width", "The mean sets the width, the sd the height", "Both shift it left", "Neither — a normal curve has one shape"], "answer": 0, "explain": "N(659.6, 59.5²): centred at 659.6, about 68 % within ±59.5."},
  {"at": 400, "q": "About what share of a normal distribution lies within ±2 sd of the mean?", "options": ["About 68 %", "About 50 %", "About 95 %", "About 99.7 %"], "answer": 2, "explain": "68 / 95 / 99.7 % within 1 / 2 / 3 sd — applicants' scores: 68.0 / 95.4 / 99.8 %."}]}
```

---

## 2. Worked example — Nilufar's wall number (15 min)

**Step 1 — probability as a long-run share, then the binomial model.** p = 91 / 7 099 = 1.282 % is the book's long-run FPD share. Each of next month's 400 loans is a Bernoulli trial with that p; assume **independence**; X = the number of FPDs ~ Bin(400, 0.01282).

**Step 2 — expected value and sd of the binomial.** E[X] = n·p = 400 × 0.01282 = **5.13**; sd = √(n·p·(1 − p)) = √(400 × 0.01282 × 0.98718) = **2.25**.

**Step 3 — percentiles: what an ordinary month looks like.** The middle 95 %: `X.ppf([0.025, 0.975])` → **1 to 10** (because counts are whole numbers, P(1 ≤ X ≤ 10) is 97.9 %, not exactly 95). Zero FPDs is itself unusual: P(X = 0) = 0.57 %.

**Step 4 — the binomial tail, P(X ≥ k).** P(X ≥ k) for k = 8 … 13: 14.6 %, 7.5 %, **3.6 %**, 1.6 %, **0.6 %**, 0.2 %. The smallest k with P(X ≥ k) ≤ 5 % is **10**; with ≤ 1 %, **12**. Excel: `=BINOM.INV(400, 91/7099, 0.95) + 1` → 10, `=BINOM.INV(400, 91/7099, 0.99) + 1` → 12.

**Step 5 — simulation, to check the formula.** 100 000 seeded months: mean 5.115, P(X ≥ 10) = 3.55 %, middle 95 % [1, 10] — the formula, twice.

**Step 6 — the answer, with the law of total probability as the caveat.** *"Expect about 5 FPDs in 400 loans; anything from 1 to 10 is ordinary noise. Ten or more happens in fewer than 4 months out of 100 if nothing has changed — look at it; twelve or more happens less than once in 100 months — phone me. The line assumes this month's mix is like the book's; if the 400 are mostly app loans (1.70 %), the expected count is 6.8 and 10 is no longer rare (14.8 %)."* The book's p is a weighted average of the channel rates, so a new mix means a new p.

**Step 7 — the binomial tail again, for last October.** 7 FPDs in 288 loans; P(X ≥ 7 | n = 288, p = 1.28 %) = **8.0 %**. Unusual, not alarming — and in a year of twelve vintages you should *expect* one at that level. Day 4 calls this the multiple-comparisons problem; today it is a reason not to call a meeting at the first 7.

---

## 3. Practice (50 min)

Every task has its own answer box, and the questions follow the order of section 1 — the concept is named in italics. The Python boxes run in the same session as section 1, so `math`, `random`, `st`, `np`, `pd`, `NormalDist`, `pmf`, `cdf`, `at_least`, the frames `apps` and `loans` and the applicants' scores `s` are ready — if you came straight here, press ▶ Run on the first box of section 1. Answer, check, then open the fold for the full working. (The notebook `data/python/week6/day1_starter.ipynb` holds the same tools with `scipy`; you need it for the homework.)

**P1.** *(probability as a long-run share)* Draw one batch of 50 loans and one batch of 50 000 loans at p = 91 / 7 099, with `random.seed(1)` before the first. Print both shares. Which one would you report as "the FPD rate"?

```task
{"id": "w06d1-p11", "kind": "python", "starter": "random.seed(1)\np_true = 91 / 7099\nfor n in (50, 50_000):\n    k = sum(random.random() < p_true for _ in range(n))\n    # print n, k and the share k / n rounded to 4 decimals\n", "answer": 0.0135, "dp": 4, "model": "random.seed(1)\np_true = 91 / 7099\nfor n in (50, 50_000):\n    k = sum(random.random() < p_true for _ in range(n))\n    print(n, k, round(k / n, 4))   # 50 1 0.02, then 50000 675 0.0135 — the big batch lands within 0.07 points of 1.28 %; the small one says 2 %, by luck"}
```

<details><summary>Answer</summary>

```python
random.seed(1)
for n in (50, 50_000):
    k = sum(random.random() < 91 / 7099 for _ in range(n))
    print(n, k, round(k / n, 4))      # 50 1 0.02, then 50000 675 0.0135
```
50 loans: 1 FPD, **2 %**. 50 000 loans: 675 FPDs, **1.35 %**. Report the big batch. A share from 50 loans can read 0 %, 2 % or 4 % by luck alone; a share from 50 000 settles near the long-run 1.28 %.

</details>

**P2.** *(events: complement, AND, OR)* From the 7 099 loans in FPD scope: P(not FPD), P(partner), P(partner ∩ FPD), P(partner ∪ FPD). Check the union rule numerically.

```task
{"id": "w06d1-p1", "kind": "python", "starter": "n = 7099; fpd = 91; partner = 1425; both = 16\n# print P(not FPD), P(partner), P(partner ∩ FPD), P(partner ∪ FPD), each rounded to 4 decimals\nprint(round(1 - fpd / n, 4))\n", "answer": 0.2113, "dp": 4, "model": "print(round(1 - fpd / n, 4), round(partner / n, 4), round(both / n, 4), round((partner + fpd - both) / n, 4))\n# 0.9872 0.2007 0.0023 0.2113 — the union subtracts the 16 loans that are both"}
```

<details><summary>Answer</summary>

```python
n = 7099; fpd = 91; partner = 1425; both = 16
print(1 - fpd / n, partner / n, both / n, (partner + fpd - both) / n)
# 0.98718 0.20073 0.00225 0.21208
```
P(not FPD) = 98.72 %, P(partner) = 20.07 %, P(partner ∩ FPD) = 0.23 %, P(partner ∪ FPD) = 1 500 / 7 099 = 21.21 %. Counting the 1 500 loans directly gives the same — the rule just stops you counting the 16 twice.

</details>

**P3.** *(conditional probability)* P(FPD | partner) and P(partner | FPD). Which one does a partner manager care about, and which one does the collections team care about?

```task
{"id": "w06d1-p2", "kind": "choice", "options": ["P(FPD | partner) = 1.12 % is the partner's quality (the partner manager's number); P(partner | FPD) = 17.6 % is the partners' share of the collections workload", "P(FPD | partner) = 17.6 % for the partner manager; P(partner | FPD) = 1.12 % for collections", "Both equal 16 / 1 425 = 1.12 % — the order of the bar does not matter", "Both equal 16 / 7 099 = 0.23 %"], "answer": 0, "explain": "Same 16 loans, two denominators: 1 425 partner loans (how risky is a partner loan?) and 91 FPDs (where does collections' work come from?)."}
```

<details><summary>Answer</summary>

P(FPD | partner) = 16 / 1 425 = **1.12 %** — the partner's quality, what the partner manager negotiates on. P(partner | FPD) = 16 / 91 = **17.6 %** — the share of the collections workload that comes from partners. Same 16 loans, two denominators, two different meetings.

</details>

**P4.** *(independence)* Branch loans: 3 263 of the 7 099, and 34 of them are FPDs. Compute P(branch) · P(FPD) and P(branch ∩ FPD), in %. Are branch and FPD independent in this sample?

```task
{"id": "w06d1-p12", "kind": "number", "answer": 0.59, "dp": 2, "unit": "% (the product P(branch) · P(FPD))", "hint": "(3 263 / 7 099) × (91 / 7 099), then compare with 34 / 7 099.", "model": "P(branch) · P(FPD) = 0.4596 × 0.01282 = 0.59 % (41.8 loans); observed P(branch ∩ FPD) = 34 / 7 099 = 0.48 % (34 loans). Fewer branch FPDs than independence predicts: P(FPD | branch) = 1.04 % against P(FPD) = 1.28 %."}
```

<details><summary>Answer</summary>

P(branch) · P(FPD) = 0.4596 × 0.0128 = **0.59 %** — if channel did not matter, 41.8 of the 7 099 loans would be branch FPDs. Observed: 34 / 7 099 = **0.48 %**. Not independent in the sample: a branch loan is a little safer than average (1.04 % against 1.28 %). Whether 34 against 41.8 is more than luck is Wednesday's question.

</details>

**P5.** *(law of total probability)* A month is planned as 100 app, 250 branch and 50 partner loans. From the three channel rates (app 41 / 2 411, branch 34 / 3 263, partner 16 / 1 425), what FPD rate should you expect, in %, to 2 decimals?

```task
{"id": "w06d1-p13", "kind": "number", "answer": 1.22, "dp": 2, "unit": "%", "hint": "Σ (channel's share of the month) × (channel's FPD rate) — the shares are 100/400, 250/400, 50/400.", "model": "(100 × 1.70 % + 250 × 1.04 % + 50 × 1.12 %) / 400 = 1.22 % — 4.9 FPDs expected in 400 loans. A branch-heavy month is safer than the book's 1.28 %."}
```

<details><summary>Answer</summary>

```python
rate = {"app": 41 / 2411, "branch": 34 / 3263, "partner": 16 / 1425}
plan = {"app": 100, "branch": 250, "partner": 50}
print(round(100 * sum(plan[c] * rate[c] for c in rate) / 400, 2))     # 1.22
```
**1.22 %**, about 4.9 FPDs in 400 loans. The rate of a month is the weighted average of the channel rates with *that month's* weights — so Nilufar's wall number should be recomputed whenever the mix moves.

</details>

**P6.** *(Bayes)* Bayes on real data: flag = credit score below 600. Of the 6 907 FPD-scope loans that have a score, 89 are FPDs; 7 of those 89 and 300 of the other 6 818 score below 600. Compute the base rate, P(flag | FPD), P(flag | no FPD), then P(FPD | flag) by Bayes **and** by direct count. (Tomorrow's notebook builds the loan frame `f`; you can redo it there in three lines.)

```task
{"id": "w06d1-p8", "kind": "python", "starter": "base, sens, fpr = 89 / 6907, 7 / 89, 300 / 6818\n# P(FPD | flag) by Bayes, in %, 2 decimals — then the direct count 7 / (7 + 300)\n", "answer": 2.28, "dp": 2, "model": "post = sens * base / (sens * base + fpr * (1 - base))\nprint(round(100 * post, 2), round(100 * 7 / 307, 2))   # 2.28 2.28 — the formula is the count, reorganised"}
```

<details><summary>Answer</summary>

```python
base, sens, fpr = 89 / 6907, 7 / 89, 300 / 6818
# 0.0228 0.0228
print(sens * base / (sens * base + fpr * (1 - base)), 7 / (7 + 300))
# on the frame: g = f.dropna(subset=["credit_score"]); flag = g.credit_score <
# 600; g[flag].fpd30.mean()
```
Base **1.289 %**, sensitivity **7.9 %**, false-positive rate **4.4 %**; Bayes **2.28 %**, direct 7 / 307 = **2.28 %** — the formula is just the count, reorganised. A flag that lifts risk 1.8× still leaves 98 % of flagged loans paying: score < 600 is a pricing signal, not a fraud signal.

</details>

**P7.** *(random variable, expected value)* One SME loan: EAD = the average SME principal (308.7 m), PD = 29 / 781 (SME loans in 90+), LGD 60 %. E[loss] and sd[loss]. Compare with the Consumer loan of section 1.

```task
{"id": "w06d1-p7", "kind": "number", "answer": 6.88, "dp": 2, "unit": "m soum (expected loss)", "hint": "Loss if it defaults = 0.6 × 308.7 m; the expected loss is PD times that.", "model": "Loss if default = 0.6 × 308.7 m = 185.2 m; PD = 29 / 781 = 3.71 %; E = 0.0371 × 185.2 m = 6.88 m; sd = √(0.0371 × 0.9629) × 185.2 m = 35.0 m — against 0.52 m and 2.84 m for the Consumer loan."}
```

<details><summary>Answer</summary>

Loss if default = 0.6 × 308.7 m = 185.2 m; PD = 3.71 %; **E = 6.88 m, sd = 35.0 m**. The Consumer loan: E 0.52 m, sd 2.84 m. One SME default costs as much as eleven Consumer defaults, so 781 SME loans carry more risk than 2 418 Consumer ones — counts of defaults (FPD rates, 90+ shares) hide this; money-weighted measures (Company corner) show it.

</details>

**P8.** *(binomial)* With X ~ Bin(400, 91/7099): P(X = 0), P(X ≤ 2). Write both in Python and in Excel. Is a month with 0–2 FPDs good news?

```task
{"id": "w06d1-p3", "kind": "python", "starter": "n, p = 400, 91 / 7099\nprint(round(pmf(0, n, p), 4))      # P(X = 0)\n# add P(X <= 2), rounded to 4 decimals\n", "answer": 0.1128, "dp": 4, "model": "print(round(pmf(0, n, p), 4), round(cdf(2, n, p), 4))   # 0.0057 0.1128\n# Excel: =BINOM.DIST(0, 400, 91/7099, FALSE), =BINOM.DIST(2, 400, 91/7099, TRUE)"}
```

<details><summary>Answer</summary>

```python
# 0.0057 0.1128
print(round(pmf(0, 400, 91 / 7099), 4), round(cdf(2, 400, 91 / 7099), 4))
# scipy.stats.binom(400, 91 / 7099).pmf(0), .cdf(2)    Excel: =BINOM.DIST(0,
# 400, 91/7099, FALSE), =BINOM.DIST(2, 400, 91/7099, TRUE)
```
0.57 % and 11.3 %. Two or fewer happens in one month in nine by luck alone, so a 0–2 month is not evidence that anything improved. Zero is rare enough (0.6 %) to check the data first: a month with no FPDs is more often a broken join or a vintage not yet 30 days past its first due date than a miracle.

</details>

**P9.** *(binomial — a different p)* Next month's 400 loans are all grade C (FPD 44 / 2 034 = 2.16 %). Expected FPDs, the middle-95 % range, P(X ≥ 10) and P(X ≥ 12). What happens to Nilufar's wall number?

```task
{"id": "w06d1-p4", "kind": "python", "starter": "n, p = 400, 44 / 2034\nprint(round(n * p, 2))        # expected FPDs\n# add P(X >= 10) and P(X >= 12) with at_least(), rounded to 3 decimals\n", "answer": 0.366, "dp": 3, "model": "print(round(at_least(10, n, p), 3), round(at_least(12, n, p), 3))   # 0.366 0.162\n# middle 95 %: 3 to 15 — at grade C, 10 FPDs is an ordinary month"}
```

<details><summary>Answer</summary>

E = **8.65**, sd 2.91, middle 95 % **3 to 15**, P(X ≥ 10) = **36.6 %**, P(X ≥ 12) = **16.2 %**. The wall number belongs to a mix: if the mix moves towards grade C, 10 FPDs is an ordinary month. Write the alarm per segment, or recompute p from next month's actual mix (`Σ n_g · p_g`) before you read the count.

</details>

**P10.** *(Poisson)* Applications per hour, λ = 1.4376. P(an hour with no application), P(5 or more). Then a 13-hour day: λ_day = 13 × 1.4376 — the 95 % range for a day's applications.

```task
{"id": "w06d1-p5", "kind": "python", "starter": "lam = 1.4376\ndef pois(k, lam):                        # P(X = k) for X ~ Poisson(lam)\n    return math.exp(-lam) * lam**k / math.factorial(k)\nprint(round(pois(0, lam), 4))           # an hour with no application\n# add P(5 or more) = 1 - P(0) - ... - P(4), rounded to 4 decimals\n", "answer": 0.0158, "dp": 4, "model": "print(round(1 - sum(pois(k, lam) for k in range(5)), 4))   # 0.0158 (observed 0.0138)"}
```

<details><summary>Answer</summary>

```python
def pois(k, lam):
    return math.exp(-lam) * lam**k / math.factorial(k)
# 0.2375 0.0158   observed 0.2395, 0.0138
print(round(pois(0, 1.4376), 4), round(1 - sum(pois(k, 1.4376) for k in range(5)), 4))
# 18.69
lam_day = 13 * 1.4376
c = np.cumsum([pois(k, lam_day) for k in range(60)])
# 11 28   scipy.stats.poisson.interval(0.95, lam_day)
print(int(np.argmax(c >= 0.025)), int(np.argmax(c >= 0.975)))
```
Excel: `=POISSON.DIST(0, 1.4376, FALSE)`, `=1 - POISSON.DIST(4, 1.4376, TRUE)`. A day with 11–28 applications is ordinary; a day below 11 is worth a look at the app's error log before anyone talks about demand.

</details>

**P11.** *(exponential)* No application has arrived for 30 minutes. By the exponential model (mean gap 39.34 minutes), what is the chance that the wait goes on for at least 60 more minutes, in %, to 1 decimal?

```task
{"id": "w06d1-p14", "kind": "number", "answer": 21.8, "dp": 1, "unit": "%", "hint": "Memoryless: the 30 quiet minutes do not count. P(gap > 60).", "model": "e^(−60 / 39.34) = 21.8 %, the same as for a fresh gap. Check: P(gap > 90) / P(gap > 30) = 0.1015 / 0.4665 = 0.2176."}
```

<details><summary>Answer</summary>

**21.8 %**. The exponential forgets: P(gap > 30 + 60 | gap > 30) = P(gap > 90) / P(gap > 30) = e^(−90/39.34) / e^(−30/39.34) = e^(−60/39.34) = 0.2176. After a quiet half hour an officer should not expect the next application to be "due" — the wait starts again.

</details>

**P12.** *(uniform)* What share of applications arrives in the first half of the hour (minutes 0–29)? Compare it with U(0, 60).

```task
{"id": "w06d1-p15", "kind": "python", "starter": "mins = pd.to_datetime(apps[\"applied_at\"]).dt.minute\n# print the data's share of minutes 0–29 (3 decimals) and the model's 30 / 60\n", "answer": 0.518, "dp": 3, "model": "print(round((mins < 30).mean(), 3), 30 / 60)   # 0.518 0.5"}
```

<details><summary>Answer</summary>

Data **51.8 %**, model **50 %**. Close to flat, slightly front-loaded: 1.8 points more applications in the first half of the hour. For staffing within an hour, the uniform is good enough.

</details>

**P13.** *(normal)* Normal model of applicants' scores (μ 659.6, σ 59.5). The grade-A cut is 720: what share of applicants does the model put at 720 or above, and what does the data say? The model's 5th percentile vs the data's.

```task
{"id": "w06d1-p6", "kind": "python", "starter": "model = NormalDist(659.6, 59.5)\n# the model's share of applicants at 720 or above, in %, 1 decimal\n# then the same share in the data (s from section 1), and both 5th percentiles\n", "answer": 15.5, "dp": 1, "model": "print(round(100 * (1 - model.cdf(720)), 1), round(100 * (s >= 720).mean(), 1))   # 15.5 15.8\nprint(round(model.inv_cdf(0.05), 1), s.quantile(0.05))                           # 561.7 562.0"}
```

<details><summary>Answer</summary>

`stats.norm.sf(720, 659.6, 59.5)` → **15.5 %**, data **15.8 %**; `stats.norm.ppf(0.05, 659.6, 59.5)` → **561.7**, data `s.quantile(0.05)` → **562**. Excel: `=1 - NORM.DIST(720, 659.6, 59.5, TRUE)`, `=NORM.INV(0.05, 659.6, 59.5)`. The normal is an excellent model of applicants' scores — and a poor one of approved loans' scores (section 1), which is the population most analyses use.

</details>

**P14.** *(the 68-95-99.7 rule)* An applicant scores 520. How many sds from the mean is that (μ 659.6, σ 59.5), to 2 decimals? Is it inside or outside the band that holds 95 % of applicants?

```task
{"id": "w06d1-p16", "kind": "number", "answer": -2.35, "dp": 2, "unit": "sd", "hint": "z = (x − μ) / σ, then compare with ±2.", "model": "(520 − 659.6) / 59.5 = −2.35: outside the ±2 sd band, so among the lowest 2.5 % — about 1 applicant in 100 scores lower (Φ(−2.35) = 0.94 %)."}
```

<details><summary>Answer</summary>

z = (520 − 659.6) / 59.5 = **−2.35**. Outside ±2 sd (541 to 779), so the applicant is in the bottom 2.5 %; `NormalDist().cdf(-2.35)` = 0.94 % — about one applicant in a hundred scores lower.

</details>

**P15.** *(mean, median and mode)* Customers' monthly income (`data/raw/customers.csv`; 356 of 6 040 customers have none): the mean and the median, in m soum. Which one goes on a slide called "a typical customer"?

```task
{"id": "w06d1-p17", "kind": "python", "starter": "inc = pd.read_csv(\"data/raw/customers.csv\")[\"monthly_income\"].dropna()   # 5 684 incomes\n# print the mean and the median in m soum, 2 decimals\n", "answer": 7.9, "dp": 2, "model": "print(round(inc.mean() / 1e6, 2), round(inc.median() / 1e6, 2))   # 15.25 7.9"}
```

<details><summary>Answer</summary>

Mean **15.25 m**, median **7.90 m**. The median goes on the slide: half of the 5 684 customers earn less than 7.90 m. The mean is almost twice as high because a few high incomes pull it up — and say "5 684 of 6 040 customers have an income on file".

</details>

**P16.** *(variance and standard deviation)* Three loans of 10, 20 and 60 m soum. By hand: the mean, the deviations, their squares, the sample variance and the sd.

```task
{"id": "w06d1-p18", "kind": "number", "answer": 26.46, "dp": 2, "unit": "m soum (the sd)", "hint": "Mean 30; deviations −20, −10, 30; divide the sum of squares by n − 1 = 2.", "model": "Mean 30; squares 400, 100, 900, sum 1 400; variance 1 400 / 2 = 700; sd = √700 = 26.46 m. Check: st.stdev([10, 20, 60])."}
```

<details><summary>Answer</summary>

| x | x − 30 | (x − 30)² |
|---|---|---|
| 10 | −20 | 400 |
| 20 | −10 | 100 |
| 60 | 30 | 900 |
| sum | 0 | 1 400 |

Variance = 1 400 / (3 − 1) = **700**; sd = √700 = **26.46 m**. `st.stdev([10, 20, 60])` agrees; `st.pstdev` (divide by n) gives 21.60.

</details>

**P17.** *(percentiles and quartiles)* The interquartile range of applicants' credit scores, and their 90th percentile.

```task
{"id": "w06d1-p19", "kind": "python", "starter": "q1, q3 = s.quantile(0.25), s.quantile(0.75)\n# print the IQR (q3 - q1), then the 90th percentile\n", "answer": 81, "dp": 0, "model": "print(q3 - q1, s.quantile(0.9))   # 81.0 736.0"}
```

<details><summary>Answer</summary>

Q1 = 619, Q3 = 700, **IQR = 81** points: the middle half of applicants is 81 points wide. The 90th percentile is **736** — one applicant in ten scores above it. Excel: `=QUARTILE.INC(range, 3) - QUARTILE.INC(range, 1)`, `=PERCENTILE.INC(range, 0.9)`.

</details>

**P18.** *(skew)* Inside every product the skew of principal is between −0.04 and 0.10; for the whole book it is 2.93. Why?

```task
{"id": "w06d1-p20", "kind": "choice", "options": ["The book mixes products of very different sizes: many small Micro and BNPL loans and a few huge SME and Auto loans", "pandas computes skew wrongly on large data", "Every product has a few extreme outliers", "The book has more loans than any product"], "answer": 0, "explain": "Each product's loans sit symmetrically around their own centre (Micro 2.7 m, SME 309 m). Put together, the many small loans make a peak on the left and the few big ones a long right tail."}
```

<details><summary>Answer</summary>

```python
# [0.03, -0.02, -0.01, 0.1, -0.04]
print(loans.groupby("product_id")["principal"].skew().round(2).tolist())
# 2.93
print(round(loans["principal"].skew(), 2))
```
The skew comes from the **mix**, not from any product. Report principal per product (mean ≈ median inside each), or report the book's median and percentiles — never the book's mean as "a typical loan".

</details>

**P19.** *(simulation)* Simulation vs formula for an all-app month: simulate 100 000 months of 400 loans at p = 41/2411 with `default_rng(2026)`; P(X ≥ 10) both ways.

```task
{"id": "w06d1-p9", "kind": "python", "starter": "rng = np.random.default_rng(2026)\np_app = 41 / 2411\nmonths = rng.binomial(400, p_app, size=100_000)\nprint(round(np.mean(months >= 10), 4))      # the simulation\n# add the formula: at_least(10, 400, p_app), rounded to 4 decimals\n", "answer": 0.1482, "dp": 4, "model": "print(round(at_least(10, 400, p_app), 4))   # 0.1482 — the simulation's 0.1469 is within its own noise (± 0.0011)"}
```

<details><summary>Answer</summary>

Simulation **14.69 %** (mean 6.79), formula `at_least(10, 400, 41/2411)` (scipy: `stats.binom.sf(9, 400, 41/2411)`) = **14.82 %**. The 0.13-point gap is simulation noise: with 100 000 draws the standard error of a 15 % share is √(0.15 × 0.85 / 100 000) = 0.11 points. Simulated answers have their own ± — quote them to the precision the run supports.

</details>

> 🚀 **Stretch (optional, +5 XP).** **P20.** *(simulation — correlated defaults)* Correlated defaults. Suppose a month is "bad" with probability 10 % (p = 2.45 %) and "normal" otherwise (p = 1.15 %) — the average is still 1.28 %. Simulate 100 000 months of 400 loans (draw the month's p first, then the binomial). P(X ≥ 10) and P(X ≥ 12)? Then test the idea on Nur's own history: are the 31 monthly vintages with ≥ 50 loans more spread out than a binomial with p = 1.28 % allows?

```task
{"id": "w06d1-p10", "kind": "choice", "options": ["P(X ≥ 12) stays about 0.6 % — the average p did not change", "P(X ≥ 12) about doubles, to 1.2 %", "P(X ≥ 12) is about five times larger, 3.0 %", "P(X ≥ 12) falls — good and bad months cancel out"], "answer": 2, "explain": "Simulation: P(X ≥ 12) = 3.0 % against 0.6 % for the plain binomial (exact mixture: 0.1 × P at 2.45 % + 0.9 × P at 1.15 % = 3.03 %). Correlation leaves the mean alone and fattens the tail.", "xp": 2}
```

<details><summary>Answer</summary>

```python
rng = np.random.default_rng(2026)
pm = np.where(rng.random(100_000) < 0.1, 0.0245, 0.0115)
sims = rng.binomial(400, pm)
# 5.11, 2.74, 0.0683, 0.0300
print(sims.mean(), sims.std(), np.mean(sims >= 10), np.mean(sims >= 12))
```
Same mean, wider spread (sd 2.74 vs 2.25), and the tail is **twice** (≥ 10: 6.8 % vs 3.6 %) to **five times** (≥ 12: 3.0 % vs 0.6 %) heavier: correlation hides in the tail, never in the mean. Nur's history: Σ (k − np)² / Σ np(1 − p) over 31 vintages = **1.23** (1.0 = pure binomial), χ² = 36.6 on 30 df, p = **0.19** — no evidence yet of a common "bad month" factor, the largest z being 2025-04 (7 of 225, z = 2.44). Banks model this with a single "economy" factor (the Vasicek model behind Basel capital); the binomial is the calm-weather special case.

</details>

### Mistakes people make

- `sf(10)` for "10 or more" — that is P(X > 10) = P(X ≥ 11). P(X ≥ k) = `sf(k − 1)` = `1 − BINOM.DIST(k − 1, …, TRUE)`.
- P(D | A) read as P(A | D): "45 % of FPDs are app loans" is not "app loans default 45 % of the time".
- An accurate rule judged without the base rate — 90 % sensitivity, 10 % precision.
- The binomial used for loans that default together (one employer, one region in a crisis): the mean is right, the tail is too thin.
- Mean ± 2 sd on a count near zero: 5.13 − 2 × 2.25 = 0.6 is fine here, but for p = 0.5 % and n = 100 it goes negative; use the binomial quantiles.
- A normal fitted to a **selected** sample (approved loans) and used for the population (applicants).
- Scores with NaN passed to `mean()` without saying so: pandas skips them silently; write "13 612 scored of 14 000".
- An unseeded simulation: your 3.55 % becomes the reviewer's 3.61 % and the conversation is about noise.
- The mean of a skewed column called "typical": the average loan is 51.7 m soum, the median 5.8 m. Report the median and the percentiles for money.

---

## 4. Homework <span class="badge hw">HW 6.1 — Due Day 3</span>

**Nilufar's toolkit.** Open `data/python/week6/day1_starter.ipynb`. Eight functions are stubs that raise `NotImplementedError`; under each is an assert cell. Replace each body until its assert cell runs silently, write the three-sentence answer to Nilufar in the last cell, then **Kernel → Restart & Run All** and hand in the executed notebook (`day1_starter.ipynb`) with the 📎 box below.

1. `prob_exactly(k, n, p)` — binomial P(X = k).
2. `prob_at_least(k, n, p)` — P(X ≥ k), the off-by-one done right.
3. `panic_threshold(n, p, alpha)` — the smallest k with P(X ≥ k) ≤ alpha (10 at 5 %, 12 at 1 %).
4. `expected_loss(book, lgd)` — Σ PD × LGD × EAD for a five-loan book (Company corner).
5. `bayes_posterior(prior, sensitivity, false_positive_rate)` — the vendor's fraud rule.
6. `simulate_defaults(n, p, months, seed)` — seeded simulation that must agree with the formula.
7. `hourly_rate(apps)` — λ from `applied_at`, empty hours included.
8. `share_between(a, b, mu, sigma)` — the normal model of scores between 600 and 700, checked against the data.

Graded on (20 points): (a) all eight assert cells pass after *Restart & Run All* (2 points each, 16), (b) every function returns a value and has a docstring in your words (2), (c) the three sentences for Nilufar give the expected count, the normal range and the alarm level with its probability (2).

**Check your functions here before you hand in** — three of their return values, and the note for Nilufar:

**H1.** What does your `panic_threshold(400, 91 / 7099, 0.01)` return?

```task
{"id": "w06d1-hw1", "kind": "number", "answer": 12, "dp": 0, "unit": "FPDs", "hint": "The smallest k with P(X ≥ k) ≤ 1 % — and P(X ≥ k) is sf(k − 1).", "model": "P(X ≥ 11) = 1.55 %, P(X ≥ 12) = 0.62 % → 12. At alpha = 0.05 the same function returns 10."}
```

**H2.** What share of applicants does `share_between(600, 700, 659.6, 59.5)` put between 600 and 700, in %, to 1 decimal?

```task
{"id": "w06d1-hw2", "kind": "number", "answer": 59.3, "dp": 1, "unit": "%", "hint": "NormalDist(mu, sigma).cdf(b) − NormalDist(mu, sigma).cdf(a), or stats.norm.cdf in the notebook.", "model": "Φ((700 − 659.6) / 59.5) − Φ((600 − 659.6) / 59.5) = 0.7514 − 0.1582 = 59.3 %. Compare it with the data's share in the notebook."}
```

**H3.** And `bayes_posterior(0.0062, 0.90, 0.05)` — the vendor's rule — in %, to 1 decimal?

```task
{"id": "w06d1-hw3", "kind": "number", "answer": 10.1, "dp": 1, "unit": "%", "hint": "sensitivity × prior / (sensitivity × prior + false-positive rate × (1 − prior)).", "model": "0.90 × 0.0062 / (0.90 × 0.0062 + 0.05 × 0.9938) = 10.1 % — nine flags in ten are honest people."}
```

**H4.** Your three sentences for Nilufar (the last cell of the notebook) — write them here too.

```task
{"id": "w06d1-hw4", "kind": "free", "min": 30, "model": "Expect about 5 FPDs in 400 loans; anything from 1 to 10 is ordinary noise. Ten or more happens in fewer than 4 months out of 100 if nothing has changed (3.6 %) — look at it; twelve or more happens in fewer than 1 month in 100 (0.6 %) — phone me. The line assumes next month's mix is like the book's; recompute it if the mix moves to app or grade C.", "rubric": ["gives the expected count (about 5)", "gives the normal range (1 to 10)", "gives the alarm level with its probability (10+ at 3.6 %, or 12+ at 0.6 %)", "says the line depends on the mix of loans"]}
```

### 📎 Hand in here

```sqltask
{"check": "handin-W6D1", "lesson": "W6D1", "title": "HW 6.1", "why": "Nilufar will reuse these eight functions every month: the wall number, the alarm, the expected loss and the fraud-rule check are one call each.", "graded": ["all eight assert cells pass after Restart & Run All (16)", "every function returns a value and has a docstring in your words (2)", "the three sentences give the expected count, the normal range and the alarm level with its probability (2)"], "tasks": [{"id": "day1_starter.ipynb", "file": "day1_starter.ipynb", "names": ["day1_starter.ipynb"], "upload": true, "accept": ".ipynb", "q": "Attach `day1_starter.ipynb` — what the page above asks for."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else the page lists (one more file, or a .zip of several)."}]}
```

---

## 5. Self-check

Three questions, one at a time. Wrong? The explanation points to the part of section 1 to reread.

```check
{"id": "w06d1-sc", "questions": [
  {"type": "single", "q": "45 % of FPDs came through the app. Which calculation gives the chance that an app loan has an FPD?", "options": ["P(app ∩ FPD) / P(app) = 41 / 2 411 = 1.70 %", "P(app ∩ FPD) / P(FPD) = 41 / 91 = 45 %", "P(app) · P(FPD) = 0.43 %", "41 / 7 099 = 0.58 %"], "answer": 0, "explain": "Divide by the condition: among app loans. 41 / 91 answers 'where do FPDs come from' (→ section 1, 'Conditional probability')."},
  {"type": "number", "q": "A rule catches 80 % of frauds and flags 1 % of honest applicants; fraud is 0.2 % of applications. What share of flags are fraud, in %?", "answer": 13.8, "tol": 0.3, "explain": "0.8 × 0.002 / (0.8 × 0.002 + 0.01 × 0.998) = 13.8 %: of 10 000 applicants, 16 flagged fraudsters and 100 flagged honest people (→ section 1, 'Bayes', P6)."},
  {"type": "single", "q": "Which scipy call answers 'P(10 or more FPDs)' for X = scipy.stats.binom(400, p)?", "options": ["X.sf(10)", "X.sf(9)", "X.cdf(10)", "1 - X.pmf(10)"], "answer": 1, "explain": "sf(k) = P(X > k), so 'k or more' is sf(k − 1); sf(10) is 11 or more (→ section 1, 'Bernoulli and binomial', Mistakes)."}
]}
```

---

## 6. Company corner <span class="badge company">Expected loss</span>

Every lender carries a number for "what this book will lose, on average": **expected loss** (*ожидаемые потери*).

- **PD — probability of default** (*вероятность дефолта*): the chance a loan defaults within a horizon (usually 12 months). Default = 90+ DPD or "unlikely to pay".
- **LGD — loss given default** (*уровень потерь при дефолте*): the share of the exposure lost **if** it defaults, after recoveries (collateral, collections, sale of the debt). Unsecured consumer loans: often 50–80 %.
- **EAD — exposure at default** (*сумма под риском на момент дефолта*): what is owed when it defaults — for an amortising loan, the outstanding principal.

**EL = PD × LGD × EAD.** It is the expectation of section 1's random variable, summed over loans (expectations add, with or without independence).

A crude version for Nur, by grade, as of 2026-10-01: PD = the share of the grade's loans now in 90+; EAD = outstanding principal of the performing loans (not yet 90+); **LGD = 60 %, assumed**.

```python
# (shape only — not meant to run)
# week 5's dpd_per_loan + outstanding (principal due after the as-of)
L = loans_with_dpd_and_outstanding
L["d90"] = (L["dpd"] > 90).astype(int)
el = L.groupby("risk_grade").agg(loans=("loan_id", "size"), d90=("d90", "sum"))
el["PD"] = el["d90"] / el["loans"]
el["EAD"] = L[(L.d90 == 0) & (L.outstanding > 0)].groupby("risk_grade")["outstanding"].sum()
el["EL"] = el["PD"] * 0.60 * el["EAD"]
```

| grade | loans | in 90+ | PD | EAD (performing) | EL = PD × 0.6 × EAD | EL % of EAD |
|---|---|---|---|---|---|---|
| A | 1 821 | 17 | 0.93 % | 47.60 bn | 0.27 bn | 0.56 % |
| B | 3 404 | 64 | 1.88 % | 92.04 bn | 1.04 bn | 1.13 % |
| C | 2 264 | 116 | 5.12 % | 54.16 bn | 1.66 bn | 3.07 % |
| D | 339 | 37 | 10.91 % | 9.61 bn | 0.63 bn | 6.55 % |
| **book** | 7 828 | 234 | | **203.40 bn** | **3.60 bn** | **1.77 %** |

Grade C is 26.6 % of the exposure and **46.3 %** of the expected loss; grade D is 4.7 % of the exposure and 17.5 % of the loss. That is the sentence for the risk pack: *the loss lives in C and D, not where the money is.*

**This is a teaching simplification, and it says so.** The "PD" here is a lifetime-to-date share that mixes loans of every age (a loan disbursed last month has had no time to reach 90+; a closed loan never will), so it is neither a 12-month nor a lifetime PD. The LGD is a guess, and the same for every grade. Real banks estimate **PD** from scorecards and from vintage and roll-rate models (week 3) calibrated on a fixed horizon, **LGD** from the recoveries actually collected on past defaults over the workout period, discounted, and **EAD** from the amortisation schedule at the expected default date. Under **IFRS 9** (the accounting standard Uzbek banks report under) every loan carries an *expected credit loss* allowance: 12-month EL for performing loans (Stage 1), lifetime EL once credit risk has increased significantly — typically 30+ DPD (Stage 2) — and for defaulted loans (Stage 3), with PDs adjusted to forward-looking macroeconomic scenarios.

Match the three letters before you say them out loud:

```game
{"type": "match", "id": "w06d1-g4", "title": "The expected-loss alphabet", "pairs": [["PD", "the chance a loan defaults within the horizon"], ["LGD", "the share of the exposure lost if it defaults, after recoveries"], ["EAD", "what is owed at the moment of default"], ["EL", "PD × LGD × EAD — the average loss, covered by pricing"], ["Unexpected loss", "the tail of the loss distribution, covered by capital"], ["IFRS 9 Stage 2", "credit risk up significantly (typically 30+ DPD): lifetime EL"]]}
```

> 🎯 **Interview version.** *"What is expected loss?"* — PD × LGD × EAD, summed over loans; the mean of the loss distribution, the cost of doing business that pricing must cover (unexpected loss — the tail — is what capital covers). Give a number: "on our book, a crude 1.8 % of the performing exposure, concentrated in grades C and D". Then say what is crude about it.

**Say it like in an interview.** *"What is expected loss, and what is it on our book?"* — answer in 3–5 sentences, as you would to an interviewer.

```task
{"id": "w06d1-cc", "kind": "free", "min": 30, "model": "Expected loss is PD × LGD × EAD summed over the loans — the mean of the loss distribution, the cost of doing business that pricing has to cover, while the tail (unexpected loss) is what capital covers. On Nur's book a crude version is about 3.6 bn soum, 1.8 % of the 203 bn performing exposure, and almost two thirds of it sits in grades C and D. It is crude because the 'PD' mixes loans of every age and the 60 % LGD is an assumption; a bank would use calibrated 12-month PDs, observed recoveries and IFRS 9 stages.", "rubric": ["defines EL = PD × LGD × EAD, summed over loans", "says it is the mean loss, covered by pricing (the tail by capital)", "gives a number for the book (≈ 1.8 % of performing exposure, concentrated in C and D)", "says what is crude about it (PD mixes ages, LGD assumed)"]}
```

Tomorrow: the 1.28 % itself is an estimate from 7 099 loans — how sure are we of it? Samples, the central limit theorem, and the confidence interval Bekzod needs before he believes "app is worse".

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w06d1", "pass": 0.8, "questions": [
  {"type": "single", "q": "45.1 % of all FPDs came through the app. What is the FPD rate of an app loan?", "options": ["1.70 % — P(FPD | app) = 41 / 2 411, a different denominator", "33.96 %", "0.58 %", "45.1 %"], "answer": 0, "explain": "P(app | FPD) answers 'where do defaults come from'; P(FPD | app) answers 'how risky is an app loan' (→ section 1, 'Conditional probability')."},
  {"type": "single", "q": "What does the second line return?", "code": "X = stats.binom(400, 91 / 7099)\nX.sf(10)", "options": ["P(X ≥ 10)", "P(X = 10)", "P(X > 10), i.e. P(X ≥ 11)", "P(X ≤ 10)"], "answer": 2, "explain": "sf(k) is P(X > k); 'k or more' is sf(k − 1) — the off-by-one of the day (→ section 1, 'Bernoulli and binomial')."},
  {"type": "number", "q": "A rule catches 95 % of frauds and flags 2 % of honest applicants; fraud is 0.5 % of applications. What share of flagged applications are fraud, in %?", "answer": 19.3, "tol": 0.3, "explain": "0.95 × 0.005 / (0.95 × 0.005 + 0.02 × 0.995) = 19.3 %: four flags in five are honest people — the base-rate trap (→ section 1, 'Bayes')."},
  {"type": "multi", "q": "Which statements describe the Poisson distribution?", "options": ["If arrivals are Poisson, the gaps between them are exponential", "Its mean equals its variance (λ)", "It can never exceed a fixed n", "It is a symmetric bell for any λ", "It counts events in a fixed window arriving independently at a constant rate"], "answer": [0, 1, 4], "explain": "Applications per hour: λ = 1.44, variance 1.44 — the Poisson fingerprint; the minutes between them are exponential (→ section 1, 'Poisson', 'Exponential')."},
  {"type": "single", "q": "For 400 independent loans the expected total loss grows like n. Its standard deviation grows like…", "options": ["n", "it stays the same", "n²", "√n"], "answer": 3, "explain": "Variances add, so the sd grows like √n — the total becomes relatively steadier, which is why a lender wants many small loans (→ section 1, 'Random variables')."},
  {"type": "single", "q": "A normal fitted to approved loans' scores puts 6.2 % below 600; the data say 4.3 %. Why?", "options": ["The approval rule cut the left tail — a selected sample is not the applicant population", "Too few loans", "The sd used ddof=0", "Scores follow a Poisson"], "answer": 0, "explain": "Applicants' scores are close to normal; approved loans are a selection, and every model fitted on them inherits that (→ section 1, 'Normal')."},
  {"type": "single", "q": "A reviewer re-runs your cell and gets 3.61 % instead of your 3.55 %. What is missing?", "code": "rng = np.random.default_rng()\nmonths = rng.binomial(400, 91 / 7099, size=100_000)\nnp.mean(months >= 10)", "options": ["A seed: np.random.default_rng(2026)", ">= should be >", "size must be at least 1 000 000", "months must be floats"], "answer": 0, "explain": "An unseeded simulation gives different numbers on every run; seed it, and check it against the formula where one exists (→ section 1, 'Simulation')."},
  {"type": "single", "q": "Company corner: why is the crude EL table's 'PD' a teaching simplification?", "options": ["It uses 90+ instead of 30+", "LGD should be 100 %", "It is a share of loans now 90+ that mixes loans of every age — a loan disbursed last month had no time to default — so it is neither a 12-month nor a lifetime PD", "EAD should be the original principal"], "answer": 2, "explain": "Real PDs come from scorecards and vintage / roll-rate models on a fixed horizon; the 60 % LGD is a guess too (→ Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w06d1", "q": "Nilufar's wall number assumed the book's mix. Next month's 400 loans are planned as 200 app, 150 branch and 50 partner, with each channel's FPD30 rate from the 7 099 loans in scope (app 41/2 411, branch 34/3 263, partner 16/1 425). Model the month as one binomial with n = 400 and p = the mix-weighted rate. What is P(10 or more FPDs)? Give a percentage to 2 decimals.", "type": "number", "dp": 2, "python": true, "h": ["fda6217e4b7cae0dac5abece"], "hint": "The survival function gives P(X > k), not P(X ≥ k).", "sol": "ZnJvbSBzY2lweSBpbXBvcnQgc3RhdHMKcCA9ICgyMDAgKiA0MSAvIDI0MTEgKyAxNTAgKiAzNCAvIDMyNjMgKyA1MCAqIDE2IC8gMTQyNSkgLyA0MDAgICAgICMgMC4wMTM4MQo0MDAgKiBwICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIDUuNTMgRlBEcyBleHBlY3RlZAoxMDAgKiBzdGF0cy5iaW5vbS5zZig5LCA0MDAsIHApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIDUuMzgKRXhjZWw6ID0xIC0gQklOT00uRElTVCg5LCA0MDAsIHAsIFRSVUUpCgo1LjM4ICU6IHdpdGggaGFsZiB0aGUgbW9udGggY29taW5nIHRocm91Z2ggdGhlIGFwcCwgMTAgRlBEcyBpcyBubyBsb25nZXIgYSBiZWxvdy00ICUgZXZlbnQgKDMuNTcgJSBhdCB0aGUgYm9vaydzIG1peCkg4oCUIGl0IG5vdyBoYXBwZW5zIGluIG1vcmUgdGhhbiBvbmUgbW9udGggaW4gdHdlbnR5LCBzbyB0aGUgNSAlIHdhbGwgbGluZSBtb3ZlcyB1cCB0byAxMS4KVGhlIHRyYXBzIGFyZSBzZigxMCkgKHRoYXQgaXMgMTEgb3IgbW9yZSwgMi41MSAlKSBhbmQgdXNpbmcgdGhlIHBsYWluIGF2ZXJhZ2Ugb2YgdGhlIHRocmVlIGNoYW5uZWwgcmF0ZXMgaW5zdGVhZCBvZiB0aGUgbWl4LXdlaWdodGVkIG9uZS4KQWRkaW5nIHRocmVlIHNlcGFyYXRlIGJpbm9taWFscyBleGFjdGx5IChucC5jb252b2x2ZSBvZiB0aGUgdGhyZWUgcG1mcykgZ2l2ZXMgNS4zNzcgJSDigJQgdGhlIHNhbWUgdG8gdHdvIGRlY2ltYWxzLCBzbyBvbmUgYmlub21pYWwgYXQgdGhlIG1peGVkIHAgaXMgYSBmYWlyIHNob3J0Y3V0IGhlcmUu"}
```

<!-- challenge:end -->
