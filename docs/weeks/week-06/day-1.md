# Week 6 · Day 1 — Probability and distributions: how random is a default?

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 6.1 (due Day 3)</span> <span class="badge company">Company corner</span>

> STORY **Monday, 9:00.** Nilufar, risk, with a printout of week 5's FPD table and a red pen. *"Your 1.28 % is now in the monthly risk pack. Here is my problem. Next month we disburse about 400 loans. If 1.28 % of first instalments default, how many FPDs should I expect — and **when should I panic**? Last October I saw 7 in one vintage and called a meeting. Was that a signal or was I chasing noise? I want a number I can write on the wall: below it, relax; above it, phone me."* Jasur, passing: *"That is a binomial with n = 400. Show her the tail, not the mean."*

## Today in 3 lines

- Probability is the language of "how surprised should I be": **events** and **P(A)**, complement, union, intersection, **conditional probability** and **Bayes** (and the base-rate trap that makes a 90 %-accurate fraud rule wrong nine times in ten), independence, **random variables** with expectation, variance and standard deviation.
- Four shapes cover most of a lending analyst's life: **binomial** (defaults in a batch of loans), **Poisson** (applications per hour), **normal** (credit scores), **exponential** (minutes between applications) — each checked against Nur data, each with its `scipy.stats` line and its Excel formula; and **simulation** with `numpy` when no formula fits.
- Nilufar gets her wall number — **expect 5.1 FPDs in 400 loans, 1 to 10 is normal, 10 or more happens 3.6 % of the time, 12 or more 0.6 %** — and you start HW 6.1 (eight functions with asserts in `data/python/week6/day1_starter.ipynb`).

---

## 1. Learn — the language of chance

### Events and P(A)

An **experiment** has outcomes; the set of all outcomes is the **sample space** Ω (*пространство элементарных исходов*); an **event** (*случайное событие*) is a set of outcomes — "the first instalment of loan 4 512 is not paid within 30 days" is an event. **P(A)** (*вероятность*) is a number between 0 and 1. Two ways to get it: the **classical** one counts equally likely outcomes (a die: P(six) = 1/6), the **statistical** one (*статистическая вероятность*) is a long-run frequency — **91 FPDs in 7 099 first instalments, P(FPD) ≈ 1.28 %**. Everything in lending is the second kind: an estimate from history, with the uncertainty that tomorrow's page measures.

Three operations, on the 7 099 loans in FPD scope (A = "came through the app", D = "FPD30"):

| | Set notation | Count | Probability |
|---|---|---|---|
| not D — **complement** (*противоположное событие*) | D̄ | 7 008 | 1 − 0.0128 = **0.9872** |
| A and D — **intersection** (*произведение событий*) | A ∩ D | 41 | 41 / 7 099 = **0.58 %** |
| A or D — **union** (*сумма событий*) | A ∪ D | 2 411 + 91 − 41 = 2 461 | **34.67 %** |

The union rule is **P(A ∪ D) = P(A) + P(D) − P(A ∩ D)** = 33.96 + 1.28 − 0.58: subtract the overlap or you count the 41 app FPDs twice. Events that cannot happen together (app and branch for one loan) are **mutually exclusive** (*несовместные*): their intersection is empty and the probabilities simply add.

### Conditional probability — "among those who…"

**P(D | A) = P(A ∩ D) / P(A)** — the probability of D *inside* A (*условная вероятность*): 41 / 2 411 = **1.70 %**, the app's FPD rate. Turn it round: **P(A | D)** = 41 / 91 = **45.1 %** — almost half of all FPDs came through the app. The two answer different questions ("how risky is an app loan?" vs "where do our defaults come from?") and confusing them is the commonest probability mistake in meetings. In SQL you already wrote both: `WHERE channel = 'app'` then the share of FPD, versus `WHERE fpd30 = 1` then the share of app.

> ⚠️ **Watch out.** P(D | A) and P(A | D) share a numerator (the 41 loans) and nothing else. Before you say a percentage out loud, say its denominator: "of app loans…" (2 411) or "of FPDs…" (91).

### Independence

A and D are **independent** (*независимые события*) if knowing A does not change the chance of D: **P(D | A) = P(D)**, equivalently **P(A ∩ D) = P(A) · P(D)**. Here P(A) · P(D) = 0.3396 × 0.0128 = 0.435 %, but we observe 0.578 %; P(D | A) = 1.70 % ≠ 1.28 %. In this sample, channel and FPD are *not* independent. Whether the gap is bigger than chance would produce in 2 411 loans is Wednesday's test — today, just note that "not independent in the sample" and "not independent in reality" are different claims.

### Total probability and Bayes — the base-rate trap

The **law of total probability** (*формула полной вероятности*) splits an event over a complete set of cases: P(D) = P(D | app)·P(app) + P(D | branch)·P(branch) + P(D | partner)·P(partner) = 0.0170·0.3396 + 0.0104·0.4596 + 0.0112·0.2007 = **1.28 %** — the book rate is a weighted average of the channel rates. **Bayes' rule** (*формула Байеса*) turns a conditional round:

```
P(H | flag) = P(flag | H) · P(H) / [ P(flag | H) · P(H) + P(flag | not H) · P(not H) ]
```

A vendor offers a fraud rule: *"catches 90 % of fraudsters, flags only 5 % of honest applicants"*. Our best proxy for first-payment fraud is a loan that never paid **a single soum** of its first instalment: **44 of 7 099 = 0.62 %**. Then P(fraud | flag) = 0.90 × 0.0062 / (0.90 × 0.0062 + 0.05 × 0.9938) = **10.1 %**. In natural frequencies (the way to explain it to a committee): of 10 000 applicants, 62 are fraudsters and 56 of them are flagged; of the 9 938 honest ones, 497 are flagged. **553 flags, 56 fraudsters — nine flags in ten are honest people.** The rule is accurate; the base rate is tiny; that is the **base-rate trap**. A 5 % false-positive rate is only "small" next to a big base rate.

> 💡 **Key idea.** How often a flag is right depends on how common the thing is. Turn every Bayes question into natural frequencies — "of 10 000 applicants…" — and the answer counts itself.

Fill in Bayes' rule by tapping the pieces into place:

```game
{"type": "cloze", "id": "w06d1-g1", "title": "Bayes' rule, piece by piece", "text": "P(fraud | flag) = {{0}} · {{1}} / ( P(flag | fraud) · P(fraud) + {{2}} · {{3}} )", "blanks": [["P(flag | fraud)"], ["P(fraud)"], ["P(flag | honest)"], ["P(honest)"]], "distractors": ["P(fraud | flag)", "P(honest | flag)"], "why": "Numerator: the flagged fraudsters. Denominator: everyone flagged — fraudsters plus honest people caught by the false-positive rate."}
```

### Random variables, expectation, variance

A **random variable** (*случайная величина*) is a number that depends on chance: the loss on one loan, the number of FPDs next month. A **discrete** one (*дискретная*) has a list of values with probabilities; a **continuous** one (*непрерывная*) has a density. Its **expectation** (*математическое ожидание*) E[X] = Σ x·P(X = x) is the long-run average; its **variance** (*дисперсия*) Var(X) = E[(X − E[X])²] measures spread; the **standard deviation** (*стандартное отклонение*) σ = √Var is the spread in the original units.

One Consumer loan: EAD 27 m soum, PD = 77 / 2 418 = 3.18 % (Consumer loans in 90+), LGD 60 %. The loss L is 0 with probability 0.9682 and 0.6 × 27 m = 16.2 m with probability 0.0318. **E[L] = 0.0318 × 16.2 m = 515 881 soum; sd = √(0.0318 × 0.9682) × 16.2 m = 2.84 m.** The expected loss is small, the spread is five times larger: one loan is a lottery ticket. For 400 independent such loans expectations add (E = 206.4 m) and **variances** add (sd = √400 × 2.84 m = 56.9 m): the total grows like n, its spread only like √n — which is why a bank wants many small loans. Rules you will use all week: E[aX + b] = aE[X] + b; Var(aX + b) = a²Var(X); for independent X, Y: Var(X + Y) = Var(X) + Var(Y).

> 💡 **Key idea.** Expectations add always; variances add when the loans are independent. So the total grows like n and its spread like √n — the arithmetic behind "many small loans" and behind every standard error tomorrow.

```game
{"type": "match", "id": "w06d1-g2", "title": "Words of the day", "pairs": [["Complement", "not A — its probability is 1 − P(A)"], ["Intersection A ∩ D", "A and D both happen"], ["Conditional probability P(D | A)", "the chance of D among the cases where A happened"], ["Independent events", "knowing A does not change the chance of D"], ["Expectation E[X]", "the long-run average of a random variable"], ["Standard deviation", "the spread, in the variable's own units"]]}
```

### Bernoulli and binomial — defaults in a batch

A **Bernoulli** variable (*распределение Бернулли*) is one yes/no trial: 1 with probability p, else 0; E = p, Var = p(1 − p). The sum of n **independent** Bernoullis with the same p is **binomial** (*биномиальное распределение*), X ~ Bin(n, p):

```
P(X = k) = C(n, k) · p^k · (1 − p)^(n − k)        E[X] = n·p        Var(X) = n·p·(1 − p)
```

Press ▶ Run: this first block loads the tools for the whole page (every later block on this page reuses them) and writes the binomial in five lines of plain Python.

```python
import math
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from statistics import NormalDist           # the normal distribution, from Python's standard library

def pmf(k, n, p):                           # P(X = k) for X ~ Bin(n, p)
    return math.comb(n, k) * p**k * (1 - p)**(n - k)
def cdf(k, n, p):                           # P(X <= k)
    return sum(pmf(i, n, p) for i in range(k + 1))
def at_least(k, n, p):                      # P(X >= k) = 1 - P(X <= k - 1)
    return 1 - cdf(k - 1, n, p)

n, p = 400, 91 / 7099
print(round(n * p, 2), round(math.sqrt(n * p * (1 - p)), 2))     # 5.13 2.25 — mean and sd
print(round(pmf(5, n, p), 4))          # P(X = 5)   = 0.1763   Excel: =BINOM.DIST(5, 400, 91/7099, FALSE)
print(round(cdf(4, n, p), 4))          # P(X <= 4)  = 0.4172   Excel: =BINOM.DIST(4, 400, 91/7099, TRUE)
print(round(at_least(10, n, p), 4))    # P(X >= 10) = 0.0357   Excel: =1 - BINOM.DIST(9, 400, 91/7099, TRUE)
print(min(k for k in range(n + 1) if cdf(k, n, p) >= 0.95))      # 9: the 95th percentile   Excel: =BINOM.INV(400, 91/7099, 0.95)
# the same in scipy (the notebook): X = scipy.stats.binom(400, p); X.mean(), X.std(), X.pmf(5), X.cdf(4), X.sf(9), X.ppf(0.95)
```

In scipy, `X.sf(k)` is the **survival function**, P(X > k) — so P(X ≥ 10) is `sf(9)`; our `at_least` does the − 1 for you. The model's assumption is **independence**: one borrower's default does not change another's. In a calm month that is fair; in a recession defaults move together and the binomial *understates* the tail (the Stretch measures how much).

> ⚠️ **Watch out.** "10 or more" is P(X ≥ 10) = 1 − P(X ≤ 9) = `sf(9)`, not `sf(10)`. The off-by-one is the trap of the day — in scipy and in Excel (`1 - BINOM.DIST(9, …, TRUE)`).

### Poisson — applications per hour

The **Poisson** distribution (*распределение Пуассона*) counts events in a fixed window when they arrive independently at a constant rate λ: P(X = k) = e^(−λ) λ^k / k!, and **E = Var = λ**. Nur's 2026 applications (1 Jan – 30 Sep, clock hours 08:00–20:59, empty hours counted): **5 102 applications in 3 549 hours, λ = 1.44 per hour, variance 1.44** — mean equal to variance is the Poisson fingerprint.

| applications in the hour | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7+ |
|---|---|---|---|---|---|---|---|---|
| hours observed | 850 | 1 204 | 863 | 420 | 163 | 38 | 8 | 3 |
| Poisson(1.44) expects | 842.9 | 1 211.7 | 871.0 | 417.4 | 150.0 | 43.1 | 10.3 | 2.6 |

`stats.poisson.pmf(0, 1.4376)` = 23.7 % of hours are empty (observed 23.9 %); P(5 or more) = `stats.poisson.sf(4, 1.4376)` = 1.58 % (observed 1.38 %). Excel: `=POISSON.DIST(0, 1.4376, FALSE)`, `=1 - POISSON.DIST(4, 1.4376, TRUE)`. Use it for staffing (how many officers for the 18:00 peak), for alerting (an hour with 8 applications, P ≈ 0.01 %, is a bot or a campaign), and as the binomial's shortcut when n is large and p small: Poisson(5.13) gives P(X ≥ 10) = 3.67 % against the exact 3.57 %.

### Normal — credit scores

The **normal** distribution (*нормальное распределение*) N(μ, σ²) is the bell: symmetric, 68 % within ±1σ, 95 % within ±1.96σ, 99.7 % within ±3σ. **Standardising** (*стандартизация*) z = (x − μ)/σ puts any normal on one scale. Nur's **13 612 scored applicants** (388 have no score — `dropna` and say so): **μ = 659.6, σ = 59.5**; within ±1/2/3 σ: **68.0 / 95.4 / 99.8 %**. A score of 600 is z = −1.00; the model says 15.83 % of applicants score below 600, and the data say **15.83 %**. Two checks, always both:

```python
apps = pd.read_csv("data/raw/applications.csv")
s = apps["credit_score"].dropna()                                # 13 612 scored of 14 000 — say so
mu, sd = s.mean(), s.std()
model = NormalDist(mu, sd)
print(len(s), round(mu, 1), round(sd, 1))                        # 13612 659.6 59.5
print(round(model.cdf(600), 4), round((s < 600).mean(), 4))      # 0.1583 model, 0.1583 data   Excel: =NORM.DIST(600, 659.6, 59.5, TRUE)
print(round(NormalDist().inv_cdf(0.975), 2))                     # 1.96   Excel: =NORM.S.INV(0.975)

fig, ax = plt.subplots(1, 2, figsize=(10, 3.6))
ax[0].hist(s, bins=40, density=True, color="#9bb7d4")            # the bars
grid = np.linspace(s.min(), s.max(), 200)
ax[0].plot(grid, [model.pdf(v) for v in grid], color="#c0392b")  # the bell over the bars
ax[0].set_title("Applicants' credit score + the normal curve")
q = np.sort(s.sample(2000, random_state=2026).to_numpy())        # QQ plot: data quantiles vs normal quantiles
theory = [model.inv_cdf((i + 0.5) / len(q)) for i in range(len(q))]
ax[1].scatter(theory, q, s=4); ax[1].plot(theory, theory, color="#c0392b")
ax[1].set_title("QQ plot (2 000 applicants): on the line = normal")
plt.tight_layout(); plt.show()
# scipy (the notebook): scipy.stats.norm.cdf(600, 659.6, 59.5), scipy.stats.probplot(s, dist="norm", plot=plt)
```

The **QQ plot** (*квантиль-квантильный график*) puts the data's quantiles against the normal's: on a line → normal; an S → heavy or light tails; a bend at one end → skew. Applicants' scores lie on the line. **The approved loans' scores do not**: 7 615 scored loans, μ = 680.8, σ = 52.6, and the left tail is cut — the model says 6.2 % below 600, reality 4.3 %, because the approval rule removed most of them. A **selected** sample is not the population it came from; every model fitted on approved loans inherits that.

> ⚠️ **Watch out.** Check a normal model with two pictures, not one number: the bell over the histogram *and* the QQ plot. And check *which* population you fitted — applicants or approved loans — before you use it for the other.

### Exponential — minutes between applications

If arrivals are Poisson, the **gaps** between them are **exponential** (*показательное распределение*): P(gap > t) = e^(−t/mean). Within each 2026 working day the 4 829 gaps average **39.3 minutes**; the model predicts P(gap > 60 min) = e^(−60/39.3) = **21.8 %**, observed **21.7 %**. Its odd property is **memorylessness**: after 30 quiet minutes the wait for the next application is still 39 minutes on average. Excel: `=1 - EXPON.DIST(60, 1/39.3, TRUE)`.

Four shapes, four questions — sort them before you go on:

```game
{"type": "sort", "id": "w06d1-g3", "title": "Which distribution?", "q": "Put each Nur question under the distribution that models it.", "groups": {"Binomial": ["FPDs among next month's 400 loans", "approved applications out of 50 decided"], "Poisson": ["applications arriving in one clock hour", "calls to the call centre in one minute"], "Normal": ["applicants' credit scores", "the z-score of one applicant's score"], "Exponential": ["minutes between two applications", "the wait after 30 quiet minutes"]}}
```

### Simulation — when the formula runs out

```python
rng = np.random.default_rng(2026)                 # seeded: the same "random" numbers on every run
months = rng.binomial(400, 91 / 7099, size=100_000)
print(months.mean(), np.mean(months >= 10))       # 5.115, 0.0355 — the formula says 5.127, 0.0357
print(np.quantile(months, [0.025, 0.975]))        # [1, 10]
```

Simulation answers questions no textbook formula covers — a month that mixes products with different PDs, defaults that move together, a loss that is PD × LGD × EAD with a random LGD. Seed it (`default_rng(2026)`) so a reviewer gets your numbers; check it against a formula where one exists, as above, before you trust it where none does.

> 💡 **Key idea.** A simulation is a formula you can always write: draw the world many times, count. Seed it so others get your numbers, and test it where a formula exists before you trust it where none does.

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

**1. The model.** Each of next month's 400 loans is a Bernoulli trial with p = 91 / 7 099 = 1.282 %; assume independence; X = number of FPDs ~ Bin(400, 0.01282).

**2. The centre.** E[X] = 400 × 0.01282 = **5.13**; sd = √(400 × 0.01282 × 0.98718) = **2.25**.

**3. What is normal.** The middle 95 %: `X.ppf([0.025, 0.975])` → **1 to 10** (because counts are whole numbers, P(1 ≤ X ≤ 10) is 97.9 %, not exactly 95). Zero FPDs is itself unusual: P(X = 0) = 0.57 %.

**4. The alarm.** P(X ≥ k) for k = 8 … 13: 14.6 %, 7.5 %, **3.6 %**, 1.6 %, **0.6 %**, 0.2 %. The smallest k with P(X ≥ k) ≤ 5 % is **10**; with ≤ 1 %, **12**. Excel: `=BINOM.INV(400, 91/7099, 0.95) + 1` → 10, `=BINOM.INV(400, 91/7099, 0.99) + 1` → 12.

**5. Check by simulation.** 100 000 seeded months: mean 5.115, P(X ≥ 10) = 3.55 %, middle 95 % [1, 10] — the formula, twice.

**6. The answer, three sentences.** *"Expect about 5 FPDs in 400 loans; anything from 1 to 10 is ordinary noise. Ten or more happens in fewer than 4 months out of 100 if nothing has changed — look at it; twelve or more happens less than once in 100 months — phone me. The line assumes this month's mix is like the book's; if the 400 are mostly app loans (1.70 %), the expected count is 6.8 and 10 is no longer rare (14.8 %)."*

Last October's vintage: 7 FPDs in 288 loans; P(X ≥ 7 | n = 288, p = 1.28 %) = **8.0 %**. Unusual, not alarming — and in a year of twelve vintages you should *expect* one at that level. Day 4 calls this the multiple-comparisons problem; today it is a reason not to call a meeting at the first 7.

---

## 3. Practice (50 min)

Every task has its own answer box. The Python boxes run in the same session as the blocks in section 1, so `math`, `np`, `pd`, `NormalDist`, `pmf`, `cdf`, `at_least` and the applicants' scores `s` are ready — if you came straight here, press ▶ Run on section 1's blocks first. Answer, check, then open the fold for the full working. (The notebook `data/python/week6/day1_starter.ipynb` holds the same tools with `scipy`; you need it for the homework.)

**P1.** From the 7 099 loans in FPD scope: P(not FPD), P(partner), P(partner ∩ FPD), P(partner ∪ FPD). Check the union rule numerically.

```task
{"id": "w06d1-p1", "kind": "python", "starter": "n = 7099; fpd = 91; partner = 1425; both = 16\n# print P(not FPD), P(partner), P(partner ∩ FPD), P(partner ∪ FPD), each rounded to 4 decimals\nprint(round(1 - fpd / n, 4))\n", "answer": 0.2121, "dp": 4, "model": "print(round(1 - fpd / n, 4), round(partner / n, 4), round(both / n, 4), round((partner + fpd - both) / n, 4))\n# 0.9872 0.2007 0.0023 0.2121 — the union subtracts the 16 loans that are both"}
```

<details><summary>Answer</summary>

```python
n = 7099; fpd = 91; partner = 1425; both = 16
print(1 - fpd / n, partner / n, both / n, (partner + fpd - both) / n)
# 0.98718 0.20073 0.00225 0.21208
```
P(not FPD) = 98.72 %, P(partner) = 20.07 %, P(partner ∩ FPD) = 0.23 %, P(partner ∪ FPD) = 1 500 / 7 099 = 21.21 %. Counting the 1 500 loans directly gives the same — the rule just stops you counting the 16 twice.

</details>

**P2.** P(FPD | partner) and P(partner | FPD). Which one does a partner manager care about, and which one does the collections team care about?

```task
{"id": "w06d1-p2", "kind": "choice", "options": ["P(FPD | partner) = 1.12 % is the partner's quality (the partner manager's number); P(partner | FPD) = 17.6 % is the partners' share of the collections workload", "P(FPD | partner) = 17.6 % for the partner manager; P(partner | FPD) = 1.12 % for collections", "Both equal 16 / 1 425 = 1.12 % — the order of the bar does not matter", "Both equal 16 / 7 099 = 0.23 %"], "answer": 0, "explain": "Same 16 loans, two denominators: 1 425 partner loans (how risky is a partner loan?) and 91 FPDs (where does collections' work come from?)."}
```

<details><summary>Answer</summary>

P(FPD | partner) = 16 / 1 425 = **1.12 %** — the partner's quality, what the partner manager negotiates on. P(partner | FPD) = 16 / 91 = **17.6 %** — the share of the collections workload that comes from partners. Same 16 loans, two denominators, two different meetings.

</details>

**P3.** With X ~ Bin(400, 91/7099): P(X = 0), P(X ≤ 2). Write both in Python and in Excel. Is a month with 0–2 FPDs good news?

```task
{"id": "w06d1-p3", "kind": "python", "starter": "n, p = 400, 91 / 7099\nprint(round(pmf(0, n, p), 4))      # P(X = 0)\n# add P(X <= 2), rounded to 4 decimals\n", "answer": 0.1128, "dp": 4, "model": "print(round(pmf(0, n, p), 4), round(cdf(2, n, p), 4))   # 0.0057 0.1128\n# Excel: =BINOM.DIST(0, 400, 91/7099, FALSE), =BINOM.DIST(2, 400, 91/7099, TRUE)"}
```

<details><summary>Answer</summary>

```python
print(round(pmf(0, 400, 91 / 7099), 4), round(cdf(2, 400, 91 / 7099), 4))   # 0.0057 0.1128
# scipy.stats.binom(400, 91 / 7099).pmf(0), .cdf(2)    Excel: =BINOM.DIST(0, 400, 91/7099, FALSE), =BINOM.DIST(2, 400, 91/7099, TRUE)
```
0.57 % and 11.3 %. Two or fewer happens in one month in nine by luck alone, so a 0–2 month is not evidence that anything improved. Zero is rare enough (0.6 %) to check the data first: a month with no FPDs is more often a broken join or a vintage not yet 30 days past its first due date than a miracle.

</details>

**P4.** Next month's 400 loans are all grade C (FPD 44 / 2 034 = 2.16 %). Expected FPDs, the middle-95 % range, P(X ≥ 10) and P(X ≥ 12). What happens to Nilufar's wall number?

```task
{"id": "w06d1-p4", "kind": "python", "starter": "n, p = 400, 44 / 2034\nprint(round(n * p, 2))        # expected FPDs\n# add P(X >= 10) and P(X >= 12) with at_least(), rounded to 3 decimals\n", "answer": 0.366, "dp": 3, "model": "print(round(at_least(10, n, p), 3), round(at_least(12, n, p), 3))   # 0.366 0.162\n# middle 95 %: 3 to 15 — at grade C, 10 FPDs is an ordinary month"}
```

<details><summary>Answer</summary>

E = **8.65**, sd 2.91, middle 95 % **3 to 15**, P(X ≥ 10) = **36.6 %**, P(X ≥ 12) = **16.2 %**. The wall number belongs to a mix: if the mix moves towards grade C, 10 FPDs is an ordinary month. Write the alarm per segment, or recompute p from next month's actual mix (`Σ n_g · p_g`) before you read the count.

</details>

**P5.** Applications per hour, λ = 1.4376. P(an hour with no application), P(5 or more). Then a 13-hour day: λ_day = 13 × 1.4376 — the 95 % range for a day's applications.

```task
{"id": "w06d1-p5", "kind": "python", "starter": "lam = 1.4376\ndef pois(k, lam):                        # P(X = k) for X ~ Poisson(lam)\n    return math.exp(-lam) * lam**k / math.factorial(k)\nprint(round(pois(0, lam), 4))           # an hour with no application\n# add P(5 or more) = 1 - P(0) - ... - P(4), rounded to 4 decimals\n", "answer": 0.0158, "dp": 4, "model": "print(round(1 - sum(pois(k, lam) for k in range(5)), 4))   # 0.0158 (observed 0.0138)"}
```

<details><summary>Answer</summary>

```python
def pois(k, lam):
    return math.exp(-lam) * lam**k / math.factorial(k)
print(round(pois(0, 1.4376), 4), round(1 - sum(pois(k, 1.4376) for k in range(5)), 4))   # 0.2375 0.0158   observed 0.2395, 0.0138
lam_day = 13 * 1.4376                                                                   # 18.69
c = np.cumsum([pois(k, lam_day) for k in range(60)])
print(int(np.argmax(c >= 0.025)), int(np.argmax(c >= 0.975)))                           # 11 28   scipy.stats.poisson.interval(0.95, lam_day)
```
Excel: `=POISSON.DIST(0, 1.4376, FALSE)`, `=1 - POISSON.DIST(4, 1.4376, TRUE)`. A day with 11–28 applications is ordinary; a day below 11 is worth a look at the app's error log before anyone talks about demand.

</details>

**P6.** Normal model of applicants' scores (μ 659.6, σ 59.5). The grade-A cut is 720: what share of applicants does the model put at 720 or above, and what does the data say? The model's 5th percentile vs the data's.

```task
{"id": "w06d1-p6", "kind": "python", "starter": "model = NormalDist(659.6, 59.5)\n# the model's share of applicants at 720 or above, in %, 1 decimal\n# then the same share in the data (s from section 1), and both 5th percentiles\n", "answer": 15.5, "dp": 1, "model": "print(round(100 * (1 - model.cdf(720)), 1), round(100 * (s >= 720).mean(), 1))   # 15.5 15.8\nprint(round(model.inv_cdf(0.05), 1), s.quantile(0.05))                           # 561.7 562.0"}
```

<details><summary>Answer</summary>

`stats.norm.sf(720, 659.6, 59.5)` → **15.5 %**, data **15.8 %**; `stats.norm.ppf(0.05, 659.6, 59.5)` → **561.7**, data `s.quantile(0.05)` → **562**. Excel: `=1 - NORM.DIST(720, 659.6, 59.5, TRUE)`, `=NORM.INV(0.05, 659.6, 59.5)`. The normal is an excellent model of applicants' scores — and a poor one of approved loans' scores (section 1), which is the population most analyses use.

</details>

**P7.** One SME loan: EAD = the average SME principal (308.7 m), PD = 29 / 781 (SME loans in 90+), LGD 60 %. E[loss] and sd[loss]. Compare with the Consumer loan of section 1.

```task
{"id": "w06d1-p7", "kind": "number", "answer": 6.88, "dp": 2, "unit": "m soum (expected loss)", "hint": "Loss if it defaults = 0.6 × 308.7 m; the expected loss is PD times that.", "model": "Loss if default = 0.6 × 308.7 m = 185.2 m; PD = 29 / 781 = 3.71 %; E = 0.0371 × 185.2 m = 6.88 m; sd = √(0.0371 × 0.9629) × 185.2 m = 35.0 m — against 0.52 m and 2.84 m for the Consumer loan."}
```

<details><summary>Answer</summary>

Loss if default = 0.6 × 308.7 m = 185.2 m; PD = 3.71 %; **E = 6.88 m, sd = 35.0 m**. The Consumer loan: E 0.52 m, sd 2.84 m. One SME default costs as much as eleven Consumer defaults, so 781 SME loans carry more risk than 2 418 Consumer ones — counts of defaults (FPD rates, 90+ shares) hide this; money-weighted measures (Company corner) show it.

</details>

**P8.** Bayes on real data: flag = credit score below 600. Of the 6 907 FPD-scope loans that have a score, 89 are FPDs; 7 of those 89 and 300 of the other 6 818 score below 600. Compute the base rate, P(flag | FPD), P(flag | no FPD), then P(FPD | flag) by Bayes **and** by direct count. (Tomorrow's notebook builds the loan frame `f`; you can redo it there in three lines.)

```task
{"id": "w06d1-p8", "kind": "python", "starter": "base, sens, fpr = 89 / 6907, 7 / 89, 300 / 6818\n# P(FPD | flag) by Bayes, in %, 2 decimals — then the direct count 7 / (7 + 300)\n", "answer": 2.28, "dp": 2, "model": "post = sens * base / (sens * base + fpr * (1 - base))\nprint(round(100 * post, 2), round(100 * 7 / 307, 2))   # 2.28 2.28 — the formula is the count, reorganised"}
```

<details><summary>Answer</summary>

```python
base, sens, fpr = 89 / 6907, 7 / 89, 300 / 6818
print(sens * base / (sens * base + fpr * (1 - base)), 7 / (7 + 300))     # 0.0228 0.0228
# on the frame: g = f.dropna(subset=["credit_score"]); flag = g.credit_score < 600; g[flag].fpd30.mean()
```
Base **1.289 %**, sensitivity **7.9 %**, false-positive rate **4.4 %**; Bayes **2.28 %**, direct 7 / 307 = **2.28 %** — the formula is just the count, reorganised. A flag that lifts risk 1.8× still leaves 98 % of flagged loans paying: score < 600 is a pricing signal, not a fraud signal.

</details>

**P9.** Simulation vs formula for an all-app month: simulate 100 000 months of 400 loans at p = 41/2411 with `default_rng(2026)`; P(X ≥ 10) both ways.

```task
{"id": "w06d1-p9", "kind": "python", "starter": "rng = np.random.default_rng(2026)\np_app = 41 / 2411\nmonths = rng.binomial(400, p_app, size=100_000)\nprint(round(np.mean(months >= 10), 4))      # the simulation\n# add the formula: at_least(10, 400, p_app), rounded to 4 decimals\n", "answer": 0.1482, "dp": 4, "model": "print(round(at_least(10, 400, p_app), 4))   # 0.1482 — the simulation's 0.1469 is within its own noise (± 0.0011)"}
```

<details><summary>Answer</summary>

Simulation **14.69 %** (mean 6.79), formula `at_least(10, 400, 41/2411)` (scipy: `stats.binom.sf(9, 400, 41/2411)`) = **14.82 %**. The 0.13-point gap is simulation noise: with 100 000 draws the standard error of a 15 % share is √(0.15 × 0.85 / 100 000) = 0.11 points. Simulated answers have their own ± — quote them to the precision the run supports.

</details>

> 🚀 **Stretch (optional, +5 XP).** **P10.** Correlated defaults. Suppose a month is "bad" with probability 10 % (p = 2.45 %) and "normal" otherwise (p = 1.15 %) — the average is still 1.28 %. Simulate 100 000 months of 400 loans (draw the month's p first, then the binomial). P(X ≥ 10) and P(X ≥ 12)? Then test the idea on Nur's own history: are the 31 monthly vintages with ≥ 50 loans more spread out than a binomial with p = 1.28 % allows?

```task
{"id": "w06d1-p10", "kind": "choice", "options": ["P(X ≥ 12) stays about 0.6 % — the average p did not change", "P(X ≥ 12) about doubles, to 1.2 %", "P(X ≥ 12) is about five times larger, 3.0 %", "P(X ≥ 12) falls — good and bad months cancel out"], "answer": 2, "explain": "Simulation: P(X ≥ 12) = 3.0 % against 0.6 % for the plain binomial (exact mixture: 0.1 × P at 2.45 % + 0.9 × P at 1.15 % = 3.03 %). Correlation leaves the mean alone and fattens the tail.", "xp": 2}
```

<details><summary>Answer</summary>

```python
rng = np.random.default_rng(2026)
pm = np.where(rng.random(100_000) < 0.1, 0.0245, 0.0115)
sims = rng.binomial(400, pm)
print(sims.mean(), sims.std(), np.mean(sims >= 10), np.mean(sims >= 12))      # 5.11, 2.74, 0.0683, 0.0300
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

**H2.** What share of applicants does `share_between(600, 700, 659.6, 59.5)` put between 600 and 700, in %?

```task
{"id": "w06d1-hw2", "kind": "number", "answer": 59.3, "dp": 1, "unit": "%", "hint": "NormalDist(mu, sigma).cdf(b) − NormalDist(mu, sigma).cdf(a), or stats.norm.cdf in the notebook.", "model": "Φ((700 − 659.6) / 59.5) − Φ((600 − 659.6) / 59.5) = 0.7514 − 0.1582 = 59.3 %. Compare it with the data's share in the notebook."}
```

**H3.** And `bayes_posterior(0.0062, 0.90, 0.05)` — the vendor's rule — in %?

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
  {"type": "number", "q": "A rule catches 80 % of frauds and flags 1 % of honest applicants; fraud is 0.2 % of applications. What share of flags are fraud, in %?", "answer": 13.8, "tol": 0.3, "explain": "0.8 × 0.002 / (0.8 × 0.002 + 0.01 × 0.998) = 13.8 %: of 10 000 applicants, 16 flagged fraudsters and 100 flagged honest people (→ section 1, 'Bayes', P8)."},
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
L = loans_with_dpd_and_outstanding                       # week 5's dpd_per_loan + outstanding (principal due after the as-of)
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
