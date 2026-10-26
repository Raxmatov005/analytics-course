# Week 6 · Day 2 — Samples, the CLT and confidence intervals

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 6.2 (due Day 5)</span> <span class="badge company">Company corner</span>

> STORY **Tuesday, 9:10.** Bekzod, the portfolio manager (*портфельный менеджер*), holds up Timur's dashboard. *"App FPD 1.70 %, branch 1.04 %. Marketing says the app is the future; Nilufar says the app is a risk. I have seen these numbers move by half a point from one month to the next. So: **is app really worse, or is that noise?**"* Madina: *"Two steps. Today: how precisely do we know each number — a confidence interval for each channel. Tomorrow: the test that says whether the gap is real. Bekzod gets one sentence on each day."*

## Today in 3 lines

- A number computed from loans is a **sample estimate** with its own uncertainty: the **standard error** measures it, the **law of large numbers** says it shrinks, the **central limit theorem** says the estimate is approximately normal even when the data are not (loan principal: skew 2.9) — shown by simulation, not by proof.
- A **confidence interval** = estimate ± critical value × SE: **t** for a mean (z only when σ is known — never), **Wilson** for a proportion (the textbook **Wald** interval covers a 1.28 % rate only 73–88 % of the time at Nur's sample sizes), **Clopper–Pearson** when you must guarantee 95 %, the **bootstrap** when there is no formula — and what "95 %" does and does not promise.
- Bekzod's answer, part 1: a rate **with its interval** for each channel — how precisely we know app, branch and partner FPD — and you start HW 6.2: the same for every channel and grade, with a chart and five sentences.

---

## 1. Learn — from the sample to the process

### Population, sample, estimate

The **population** (*генеральная совокупность*) is everything you want to talk about; the **sample** (*выборка*) is what you observed. Careful: even "all 2 411 app loans in FPD scope" is a sample when the question is about the **process** — *will* app loans default more? — because next year's app loans are not in the table. A **parameter** (*параметр*) is the population's true value (the app channel's real FPD probability, p); a **statistic** or **estimate** (*оценка*) is computed from the sample (p̂ = 41 / 2 411 = 1.70 %). A **point estimate** (*точечная оценка*) is one number; good ones are **unbiased** (*несмещённая* — right on average over samples) and **consistent** (*состоятельная* — closer as n grows). The sample variance divides by n − 1 (`ddof=1`, Excel `VAR.S` / `STDEV.S`) exactly to be unbiased — check it rather than believe it:

```python
s = apps["credit_score"].dropna().to_numpy(dtype=float)      # 13 612 applicants: the "population", variance 3 542.5
rng = np.random.default_rng(2026)
samples = np.array([rng.choice(s, 5, replace=False) for _ in range(20_000)])
samples.var(axis=1, ddof=0).mean(), samples.var(axis=1, ddof=1).mean()      # 2 862.2 (too small by 1/n), 3 577.8 (right)
```

Dividing by n underestimates by the factor (n − 1)/n = 0.8 at n = 5: the sample's own mean sits closer to its points than the true mean does. At n = 2 411 the difference is invisible; at n = 5 (a branch-week, a pilot) it is 20 %. The *standard deviation* with `ddof=1` is still slightly low on average (56.2 vs 59.5 here) — unbiased variance does not make an unbiased sd, and nobody minds.

### The sampling distribution and the standard error

Draw another 2 411 app loans from the same process and p̂ would not be 1.70 % again. The distribution of an estimate over repeated samples is its **sampling distribution** (*выборочное распределение*); its standard deviation is the **standard error** (*стандартная ошибка*, SE):

```
SE(mean) = s / √n                 SE(proportion) = √( p̂ (1 − p̂) / n )
app FPD: √(0.0170 × 0.9830 / 2411) = 0.263 points        400 loans' mean principal: 112.6 m / 20 = 5.63 m
```

The sd describes the **loans** (how different they are); the SE describes the **estimate** (how much it would move). Quadruple n to halve the SE.

### The law of large numbers

The **law of large numbers** (*закон больших чисел*, ЗБЧ): the sample mean converges to the population mean as n grows. Shuffle the 7 828 principals with `default_rng(2026)` and take the running mean: after 10 loans **106.38 m**, after 100 **35.06 m**, after 1 000 **52.06 m**, after all 7 828 **51.71 m**. Early numbers swing because one SME loan (up to 599 m) dominates ten Micro loans; the swings die out like 1/√n. The LLN needs a finite mean — the Stretch shows a distribution for which it fails.

### The central limit theorem — shown, not proved

The **CLT** (*центральная предельная теорема*, ЦПТ): the mean of n independent draws is approximately normal with mean μ and sd σ/√n, **whatever the shape of the data**, once n is large enough. Loan principal is about as non-normal as money gets — mean 51.7 m, median 5.79 m, skew 2.92. Draw 5 000 samples of n loans each and look at their means (the notebook's first chart; `rng = default_rng(2026)`, sampling without replacement):

| n | sd of the 5 000 means | SE = σ/√n | skew of the means | share within ±1.96 SE |
|---|---|---|---|---|
| 5 | 49.08 m | 50.35 m | 1.33 | 95.6 % |
| 30 | 20.47 m | 20.56 m | 0.57 | 95.8 % |
| 100 | 11.32 m | 11.26 m | 0.30 | 94.7 % |
| 1 000 | 3.33 m | 3.56 m | 0.09 | 96.0 % |

The spread follows σ/√n; the skew melts towards 0 — the bell appears. (At n = 1 000 the spread is smaller than σ/√n because we sample 13 % of a finite population without replacement: × √((7 828 − 1 000)/7 827) = 0.934 gives 3.32 m — the **finite-population correction**.) "n ≥ 30 is enough" is folklore: at n = 30 these means are still skewed (0.57), and an interval that assumes normality covers less than it promises (section "What 95 % means").

### Confidence interval for a mean: z or t

A **confidence interval** (*доверительный интервал*, CI) is **estimate ± critical value × SE**. For a mean, the critical value comes from **Student's t** distribution (*распределение Стьюдента*) with n − 1 degrees of freedom (*степени свободы*), because we plug in s for the unknown σ; the z value 1.96 is the limit as n → ∞:

| df | 4 | 9 | 29 | 49 | 99 | 999 | ∞ (z) |
|---|---|---|---|---|---|---|---|
| t₀.₉₇₅ | 2.776 | 2.262 | 2.045 | 2.010 | 1.984 | 1.962 | 1.960 |

```python
smp = rng.choice(cons, 50, replace=False)                     # the notebook's 50 Consumer loans
m, s, n = smp.mean(), smp.std(ddof=1), 50                     # 27 486 400 · 12 617 221
se = s / np.sqrt(n)                                           # 1 784 345
stats.t.interval(0.95, n - 1, loc=m, scale=se)                # (23 900 625, 31 072 175)  — z gives 23 989 085 … 30 983 715
```

Excel: `=CONFIDENCE.T(0.05, STDEV.S(B2:B51), 50)` → half-width **3 585 775**; `=T.INV.2T(0.05, 49)` → 2.0096; `=NORM.S.INV(0.975)` → 1.96. The true Consumer mean (26 926 915) is inside. With n = 50 the t interval is 2.5 % wider than z; with n = 10, 15 % — use t always and the question disappears.

### Confidence interval for a proportion: Wald, Wilson, Clopper–Pearson

The **Wald** interval is the textbook one: p̂ ± 1.96 √(p̂(1 − p̂)/n). For the app: 1.70 % ± 0.52 → **1.18–2.22 %**. It assumes p̂ is normal — and near 0 % the sampling distribution of a rate is skewed (it cannot go below zero but can go far above). Measure it: draw 20 000 samples at the true rate 1.28 % and count how often each interval contains 1.28 % (`proportion_confint(k, n, method=...)`, `default_rng(2026)`):

| n | Wald (`"normal"`) | Wilson (`"wilson"`) | Clopper–Pearson (`"beta"`) | samples with 0 FPDs |
|---|---|---|---|---|
| 100 | **72.7 %** | 95.9 % | 99.0 % | 27.1 % |
| 400 | **87.7 %** | 96.0 % | 98.0 % | 0.6 % |
| 2 000 | 94.0 % | 95.3 % | 96.3 % | 0 % |

A "95 %" Wald interval on a branch-month of 400 loans is really an 88 % interval. Two failures you can see with your own eyes: **2 FPDs in 150 loans** → Wald −0.50 % to 3.17 % (a negative default rate); **0 in 120** → Wald 0 to 0 ("certainly zero"). The **Wilson** interval (*интервал Уилсона*) inverts the score test instead, so it is never negative, never zero-width, and covers close to 95 %:

```
centre = (p̂ + z²/2n) / (1 + z²/n)        half-width = z √( p̂(1 − p̂)/n + z²/4n² ) / (1 + z²/n)
```

App **1.26–2.30 %**, branch **0.75–1.45 %**, partner **0.69–1.82 %**, book **1.05–1.57 %**; 0 in 120 → 0–3.10 %. Note the asymmetry: the app's interval reaches 0.44 below 1.70 and 0.60 above — the right shape for a rate near zero. The **Clopper–Pearson** ("exact", *точный*) interval comes from the binomial itself (`stats.beta.ppf`); it guarantees *at least* 95 % and is therefore a little wide (99 % at n = 100) — the one an auditor or a regulator asks for. In Python all three are `proportion_confint(41, 2411, method="wilson" | "beta" | "normal")` from `statsmodels.stats.proportion`. Excel has no Wilson function — with k in B1, n in B2, z in B3 (`=NORM.S.INV(0.975)`):

```
lower: =(B1/B2 + B3^2/(2*B2) - B3*SQRT(B1/B2*(1-B1/B2)/B2 + B3^2/(4*B2^2))) / (1 + B3^2/B2)
upper: same with + before B3*SQRT
Clopper–Pearson: =BETA.INV(0.025, B1, B2-B1+1)  and  =BETA.INV(0.975, B1+1, B2-B1)
```

### The bootstrap — an interval without a formula

The **bootstrap** (*бутстреп*): treat the sample as the population, resample it **with replacement** many times, compute the statistic each time, read the 2.5th and 97.5th percentiles (the *percentile* bootstrap).

```python
def bootstrap_ci(values, stat=np.mean, B=10_000, seed=2026):
    g = np.random.default_rng(seed)
    boot = [stat(g.choice(values, len(values), replace=True)) for _ in range(B)]
    return np.quantile(boot, [0.025, 0.975])
bootstrap_ci(f.loc[f.channel == "app", "fpd30"].to_numpy())       # 1.20 % … 2.24 %   (Wilson 1.26 … 2.30)
```

Its strength is statistics with no SE formula — a **median**, a ratio of sums (collection rate), a difference of medians: a 200-loan sample's median principal is 5.69 m, bootstrap 95 % CI **4.54–8.27 m** (true median 5.79 m). Its weakness is small counts: with 7 FPDs in 314 grade-D loans the percentile bootstrap gives 0.64–3.82 % against Wilson's 1.08–4.53 % — too narrow, because it can only reshuffle the 7 defaults it saw. For rates near zero, Wilson; for medians and ratios, bootstrap.

### What "95 %" means — and what it does not

95 % is a property of the **procedure**: if you repeated the sampling many times, 95 % of the intervals built this way would contain the true value. Draw 100 samples of 400 loans and build a t interval for the mean principal from each: **96 of the 100** contain the true 51.71 m. It does **not** mean:

- "there is a 95 % probability that the true FPD is between 1.26 and 2.30 %" — the true value is fixed; this interval either contains it or not (that sentence is a *Bayesian* credible interval — Seeing Theory ch. 5);
- "95 % of app loans have an FPD rate in that range" — loans do not have rates; the interval is about the average;
- "the intervals overlap, so there is no difference" — overlapping 95 % intervals can still differ significantly (tomorrow);
- "95 % whatever the data" — the coverage holds only when the method's assumptions do. t intervals on skewed principal, 10 000 repeats each: **88.6 %** at n = 30, **93.0 %** at n = 100, **95.2 %** at n = 400.

### Which interval, when

| You estimate | Typical Nur example | Interval | Python | Excel |
|---|---|---|---|---|
| a mean, n ≥ ~30, not wildly skewed | average Consumer principal, average score | t | `stats.t.interval(0.95, n-1, m, s/√n)` | `CONFIDENCE.T` |
| a mean of very skewed money, small n | average SME ticket from 40 loans | bootstrap (or t on log values) | `bootstrap_ci(v)` | — |
| a rate, any n, especially near 0 % or 100 % | FPD, approval rate, PAR30 | Wilson | `proportion_confint(k, n, method="wilson")` | formula above |
| a rate that must be *guaranteed* ≥ 95 % | regulatory / audit sample | Clopper–Pearson | `method="beta"` | `BETA.INV` |
| a median, a ratio of sums, a percentile | median ticket, collection rate | bootstrap | `bootstrap_ci(v, stat=np.median)` | — |
| a count per period | 5 102 applications in 3 549 hours | Poisson (exact) | `stats.chi2.ppf([0.025, 0.975], [2*k, 2*k + 2]) / 2`, then ÷ hours | `=CHISQ.INV(0.025, 2*k)/2` |

Default to a 95 % level and say so; use 90 % only when a team has agreed to it in advance, never because the 95 % interval "looked too wide".

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Standard error — [Standard Deviation vs Standard Error, Clearly Explained!!! (StatQuest), 01:12](https://youtu.be/A82brFpdr9g?t=72)
- ▶ Central limit theorem — [The Central Limit Theorem, Clearly Explained!!! (StatQuest), 00:42](https://youtu.be/YAlJCEDH2uY?t=42)
- ▶ Confidence intervals — [Confidence Intervals, Clearly Explained!!! (StatQuest), 02:55](https://youtu.be/TqOeMYtOc1w?t=175)
- ▶ Confidence interval for a mean, formula route — [Confidence Interval [Simply explained] (numiqo)](https://youtu.be/ENnlSlvQHO0)
- ▶ Bootstrap — [Bootstrapping Main Ideas!!! (StatQuest), 06:40](https://youtu.be/Xz0x-8-cgaQ?t=400)
- ▶ Confidence interval (RU) — [Доверительный интервал за 15 мин. Биостатистика. (Kirill Milchakov)](https://youtu.be/MstzroncW28)

- RU deck `5.2 Statistics & Probability Theory.pdf` pp. 68–73: law of large numbers and CLT. `MS_lecture3.pdf` (lesson 5.3): sample method and sample properties pp. 5–13, point estimates — unbiased, consistent, efficient pp. 14–18, method of moments and maximum likelihood pp. 19–27, confidence intervals (Fisher's lemma; the mean with σ known and unknown; the variance) pp. 28–35. The lesson's recording: `video1414856026.mp4`.
- Notebooks: `MS_5_statistics.ipynb` (LLN with a coin and a die, CLT from other distributions), `MS6_Точечное_оценивание.ipynb` (unbiasedness and consistency by simulation), `MS6_Интервальное_оценивание.ipynb` (exact vs asymptotic interval, coverage at n = 3 … 1 000 — the same experiment as our Wald/Wilson table), `HW_3_CI.ipynb` (an interval for an exponential mean).
- Visual: Seeing Theory, chapter 4 (Frequentist Inference: the CLT and confidence intervals, interactive).
- *Russian terms:* генеральная совокупность = population, выборка = sample, оценка = estimate, точечная / интервальная оценка = point / interval estimate, несмещённость = unbiasedness, состоятельность = consistency, стандартная ошибка = standard error, закон больших чисел (ЗБЧ) = law of large numbers, центральная предельная теорема (ЦПТ) = central limit theorem, доверительный интервал = confidence interval, уровень доверия = confidence level, распределение Стьюдента = t distribution, степени свободы = degrees of freedom, бутстреп = bootstrap, асимптотический = asymptotic.

---

## 2. Worked example — Bekzod's channels (15 min)

**1. The counts** (week 5's FPD30 frame `f`): app 41 / 2 411, branch 34 / 3 263, partner 16 / 1 425.

**2. The method.** Rates near 1 % with n in the thousands: Wilson. `proportion_confint(k, n, alpha=0.05, method="wilson")`.

**3. The table.**

| channel | FPD / n | rate | Wilson 95 % | Wald 95 % (for comparison) |
|---|---|---|---|---|
| app | 41 / 2 411 | 1.70 % | **1.26–2.30 %** | 1.18–2.22 % |
| branch | 34 / 3 263 | 1.04 % | **0.75–1.45 %** | 0.69–1.39 % |
| partner | 16 / 1 425 | 1.12 % | **0.69–1.82 %** | 0.58–1.67 % |

**4. Read it.** The app's interval sits higher, but it overlaps the branch's between 1.26 and 1.45 %. Each interval is about ±0.5 points — as large as the gap Bekzod is asking about. With these sample sizes, a 0.66-point difference is near the edge of what the data can resolve.

**5. The sentence for Bekzod (today's half).** *"App FPD is 1.70 % and we are 95 % confident the channel's true rate is between 1.26 and 2.30 %; branch is 1.04 % (0.75–1.45 %). The intervals overlap a little, so the gap may be real or partly noise — tomorrow's test answers that directly."* Not "app is worse", not "no difference": the honest state of knowledge on Tuesday.

---

## 3. Practice (50 min)

Open `data/python/week6/day2_starter.ipynb`, run Part 0 (the loader builds `loans`, `f` and `x`, and the CLT chart). Add a cell per task.

**P1.** SE of the book's FPD rate (91 / 7 099); its Wald and Wilson 95 % intervals. Why are the two almost the same here and not at n = 400?

<details><summary>Answer</summary>
SE = √(0.01282 × 0.98718 / 7 099) = **0.133 points**. Wald **1.02–1.54 %**, Wilson **1.05–1.57 %**. With 91 events the binomial is already close to normal; at n = 400 there are only ~5 events and the skew near zero is what Wald ignores (88 % coverage).
</details>

**P2.** Reproduce the notebook's 50-loan Consumer interval in Excel: paste the 50 principals into a column, then `AVERAGE`, `STDEV.S`, `CONFIDENCE.T`. Is the true mean inside? What would a 99 % interval be?

<details><summary>Answer</summary>
Mean 27 486 400, s 12 617 221, `=CONFIDENCE.T(0.05, s, 50)` = 3 585 775 → **23.90–31.07 m**, contains 26.93 m. 99 %: `=CONFIDENCE.T(0.01, s, 50)` = t₀.₉₉₅,₄₉ (2.680) × 1 784 345 = 4.78 m → 22.70–32.27 m. More confidence, wider interval — the trade you always make.
</details>

**P3.** Ten loans instead of fifty: `rng = np.random.default_rng(2026); s10 = rng.choice(cons, 10, replace=False)`. The z interval and the t interval. How much wider is t, and which one would you sign?

<details><summary>Answer</summary>
Mean **31.34 m**; z: 23.07–39.60 m; t (2.262 instead of 1.96): **21.80–40.87 m**, 15 % wider. Only t has the coverage it claims at n = 10 (if the data were normal — Consumer principals are close to symmetric, skew small; for SME principals even t would undercover).
</details>

**P4.** The CLT table: for n = 5, 30, 100, 1000 draw 5 000 samples of loan principal, report the sd and skew of the means against σ/√n. Explain the one row where sd < σ/√n.

<details><summary>Answer</summary>
The notebook's chart titles: sd 49.1 / 20.5 / 11.3 / 3.3 m against SE 50.3 / 20.6 / 11.3 / 3.6 m; skew 1.33 / 0.57 / 0.30 / 0.09. At n = 1 000 we take 13 % of a population of 7 828 without replacement, so the means vary less than independent draws would: the finite-population correction √((N − n)/(N − 1)) = 0.934 brings 3.56 down to 3.32 m. In practice samples are a tiny share of the population and the correction is 1.
</details>

**P5.** Wald vs Wilson on two small branch-months: 2 FPDs in 150 loans, and 0 in 120. Which numbers would you put on a dashboard?

<details><summary>Answer</summary>
2 / 150: Wald **−0.50 % to 3.17 %** (statsmodels clips it to 0–3.17 and hides the problem), Wilson **0.37–4.73 %**, Clopper–Pearson 0.16–4.73 %. 0 / 120: Wald **0–0**, Wilson **0–3.10 %**, CP 0–3.03 %. Wilson: it says honestly "somewhere between almost nothing and about 3–5 %". The rule of three gives the same feel for zero events: the upper 95 % bound ≈ 3 / n = 2.5 %.
</details>

**P6.** Coverage experiment: with `default_rng(2026)`, draw 20 000 values of k ~ Bin(400, 0.01282) and compute the share of Wald, Wilson and Clopper–Pearson intervals that contain 0.01282.

<details><summary>Answer</summary>

```python
rng = np.random.default_rng(2026); p = 91 / 7099
k = rng.binomial(400, p, 20_000)
for m in ("normal", "wilson", "beta"):
    lo, hi = proportion_confint(k, 400, method=m); print(m, np.mean((lo <= p) & (p <= hi)))
```
Run in the order of the table (n = 100 first, then 400, then 2 000, one generator): **87.7 % / 96.0 % / 98.0 %** at n = 400. Wald misses on the high side: in samples with 1–2 FPDs its upper limit is too low, and that is exactly the case where a small branch looks "safe".
</details>

**P7.** Bootstrap: 95 % CI for the app's FPD (10 000 resamples, seed 2026) next to Wilson; then for the **median** principal of a 200-loan random sample.

<details><summary>Answer</summary>
App: bootstrap **1.20–2.24 %**, Wilson 1.26–2.30 % — close, the bootstrap slightly lower and narrower (it is symmetric around the sample's own 41 events). Median: `rng = default_rng(2026); s = rng.choice(pop, 200, replace=False)`, then 10 000 medians of resamples → sample median **5.69 m**, CI **4.54–8.27 m**, true median 5.79 m inside. Note the asymmetry (−1.2 m / +2.6 m): there is no "± SE" formula for a median, and the bootstrap does not need one.
</details>

**P8.** "95 %" by experiment: 100 samples of 400 loans, a t interval for the mean principal from each. How many contain 51.71 m? Then repeat 10 000 times at n = 30.

<details><summary>Answer</summary>
`rng = default_rng(2026)`: **96 of 100** — around 95, as promised (with 100 intervals, anything from about 91 to 99 is normal: Bin(100, 0.95)). At n = 30, 10 000 intervals: **88.6 %**. The procedure keeps its promise only when the sampling distribution is near normal; with skew 2.9 and n = 30 it is not. For money at small n: a larger n, a log scale, or the bootstrap — and say so.
</details>

**P9.** Sample size for a target precision: how many first instalments do you need to estimate a rate near 1.28 % to within ±0.25 points (95 %)? ±0.5 points? (Wald arithmetic is fine for planning: n = z² p(1 − p) / E².)

<details><summary>Answer</summary>
1.96² × 0.01282 × 0.98718 / 0.0025² = **7 778** first instalments for ±0.25 points; **1 945** for ±0.5. Nur's whole book (7 099) is just short of the first: a channel- or branch-level FPD to a quarter of a point is out of reach for years. Precision costs n quadratically — halve the margin, quadruple the loans.
</details>

<span class="badge stretch">Stretch</span> **P10.** When the LLN fails. Draw 100 000 values from a Cauchy distribution (`rng.standard_cauchy`, seed 2026) and from a standard normal; print the running mean after 10, 100, 1 000, 10 000, 100 000 draws. What happens, why, and why does it matter for loan money even though no loan is Cauchy?

<details><summary>Answer</summary>
Cauchy: −0.544, 0.554, −0.007, **1.058, 0.957** — still jumping at 100 000. Normal: −0.121, 0.045, 0.021, −0.002, −0.000 → 0. The Cauchy has no finite mean (its tails are so heavy that one draw can outweigh all the others), so there is nothing for the average to converge to — the original course's HW 5.2 made the same point, and the 5.2 deck has the Cauchy on pp. 54–57. Loan amounts are bounded (product limits), so the LLN and CLT do hold — but heavy right tails make them **slow**: SME principals need far larger n than Micro principals before an interval keeps its 95 %.
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

**Bekzod's error bars.** In `data/python/week6/day2_starter.ipynb` write `wald_ci`, `wilson_ci`, `bootstrap_ci` and `fpd_ci_table(f, by)`, run `fpd_ci_table` for **channel** and for **risk_grade**, and draw **one figure with two panels** (channel, grade): the rate as a dot, the Wilson interval as an error bar, the label `app (n = 2 411)`. Save it as `hw62_fpd_ci.png`. Under it, **five sentences** for Bekzod (the notebook lists what each must say). Submit the executed notebook and the PNG to `submissions/week-06/day-2/`.

Graded on (20 points): (a) the numbers — FPD, n, rate, Wilson and bootstrap limits for 3 channels and 4 grades, matching the asserts and the model (8), (b) the chart — dots with error bars from zero-free axes in %, n in every label, grades in order A → D, a title that states the finding (6), (c) the five sentences — the overlap read correctly, the widest interval explained by n, Wilson vs bootstrap, a dashboard proposal, the question for tomorrow (6). **Bonus +20:** `clopper_pearson(k, n)` from `scipy.stats.beta` (not statsmodels) passing its assert, with the exact interval added to both tables and one sentence on when you would report it instead of Wilson.

### 📎 Hand in here

```sqltask
{"check": "handin-W6D2", "lesson": "W6D2", "title": "HW 6.2", "tasks": [{"id": "day2_starter.ipynb", "file": "day2_starter.ipynb", "names": ["day2_starter.ipynb"], "upload": true, "accept": ".ipynb", "q": "Attach `day2_starter.ipynb` — what the page above asks for."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else the page lists (one more file, or a .zip of several)."}]}
```

---

## 5. Self-check

1. A colleague says: "the 95 % CI for app FPD is 1.26–2.30 %, so there is a 95 % chance the true rate is in there." What is the correct reading? *(→ section 1, "What 95 % means")*
2. Why does a Wald interval for 2 FPDs in 150 loans go below zero, and what do you use instead? *(→ section 1, "Wald, Wilson, Clopper–Pearson", P5)*
3. The data are very skewed; why can you still build an interval for the **mean** with a t value, and when does that break? *(→ section 1, "The central limit theorem", P8)*

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

> Interview version: *"Branch X has the highest default rate. What do you do?"* — Ask for n and the interval; compare it with the funnel limits for its size, not with the other branches' ranks; check whether one in ten branches past a 95 % limit is more than chance; then look for a cause (mix of products, officers, vintages) before anyone acts.

Tomorrow: the test. Bekzod's question becomes H₀: p_app = p_branch, a z statistic, a p-value — and Nilufar's yes/no for the risk committee.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w06d2", "pass": 0.8, "questions": [
  {"type": "single", "q": "App FPD: 95 % CI 1.26–2.30 %. Which reading is correct?", "options": ["There is a 95 % probability the true app rate is between 1.26 and 2.30 %", "95 % of app loans have an FPD rate in that range", "The procedure captures the true rate in 95 % of repeated samples; this interval either contains it or not", "If two channels' intervals overlap, the channels do not differ"], "answer": 2, "explain": "95 % is a property of the procedure; the true rate is fixed, and overlap is not a test (→ section 1, 'What 95 % means')."},
  {"type": "single", "q": "Why Wilson rather than Wald for an FPD rate near 1.28 % on a branch-month of 400 loans?", "options": ["Near 0 % a rate's sampling distribution is skewed: a '95 %' Wald covers about 88 %, can go negative and collapses to zero width at 0 events", "Wald needs a seed", "Wilson works only for very large n", "Wilson is always narrower"], "answer": 0, "explain": "Wilson inverts the score test: never negative, asymmetric the right way, close to 95 % coverage (→ section 1, 'Wald, Wilson, Clopper–Pearson')."},
  {"type": "single", "q": "Which line makes this interval slightly too narrow?", "code": "m = smp.mean()                                  # line 1\ns = np.std(smp)                                 # line 2\nse = s / np.sqrt(len(smp))                      # line 3\nstats.t.interval(0.95, len(smp) - 1, loc=m, scale=se)   # line 4", "options": ["line 1", "line 2 — numpy's std defaults to ddof=0, the population formula", "line 3", "line 4 — a z value is needed instead of t"], "answer": 1, "explain": "A sample interval needs ddof=1 (pandas' .std() already uses it; numpy does not) (→ Mistakes, section 1 'Population, sample, estimate')."},
  {"type": "number", "q": "How many first instalments do you need to estimate a rate near p = 91 / 7 099 to within ±0.5 points at 95 %? (n = z² p(1 − p) / E², round up)", "answer": 1945, "tol": 3, "explain": "1.96² × 0.01282 × 0.98718 / 0.005² ≈ 1 945; for ±0.25 points it is four times as many (→ P9)."},
  {"type": "multi", "q": "Which statements about the bootstrap are true?", "options": ["With 5 events it is reliable for a rate near 0 %", "It resamples the sample with replacement", "It needs normally distributed data", "It gives an interval for a median or a ratio of sums, where no SE formula exists", "Seed it so a reviewer gets your interval"], "answer": [1, 3, 4], "explain": "It can only reshuffle what it saw, so with few events it is too narrow — Wilson for rates near zero, bootstrap for medians and ratios (→ section 1, 'The bootstrap')."},
  {"type": "single", "q": "To halve the standard error of an estimate, the sample size must be…", "options": ["squared", "halved", "doubled", "quadrupled"], "answer": 3, "explain": "SE = s / √n, so halving it needs four times the n (→ section 1, 'The sampling distribution')."},
  {"type": "single", "q": "By hand, Wald gives −0.50 % to 3.17 % for 2 FPDs in 150 loans. What goes on the dashboard?", "code": "proportion_confint(2, 150, method=\"normal\")   # Wald", "options": ["Wilson, about 0.37–4.73 %: never negative and close to 95 % coverage", "Wald as statsmodels prints it (clipped to 0–3.17 %)", "No interval — 150 loans is too few", "Only the rate, 1.33 %"], "answer": 0, "explain": "statsmodels clips the Wald limit and hides the problem; Wilson says honestly 'between almost nothing and about 5 %' (→ P5)."},
  {"type": "single", "q": "Company corner: Bukhara has the highest FPD30 of ten branches (14 / 586). What should the risk pack do?", "options": ["Show the rate with n and its Wilson interval and compare it with the funnel limits for its size; watch it rather than punish it", "Report the rate without n — n confuses readers", "Rank the branches and act on the worst", "Drop Bukhara from the book rate"], "answer": 0, "explain": "A league table guarantees a 'worst branch' even when all are equal; a funnel flags by size-adjusted limits, not by rank (→ Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w06d2", "q": "Bekzod hears that the app 'got better this year'. From the week's FPD frame f (7 099 loans in scope), take only the loans disbursed in 2026 and the app channel. What is the UPPER limit of the 95 % Wilson interval for their FPD30 rate? Give a percentage to 3 decimals.", "type": "number", "dp": 3, "h": ["d140dc0d86cd3fe8d4ddba6b"], "hint": "Two conditions on f, then k and n — and the interval method that does not trust a normal shape near zero.", "sol": "ZnJvbSBzdGF0c21vZGVscy5zdGF0cy5wcm9wb3J0aW9uIGltcG9ydCBwcm9wb3J0aW9uX2NvbmZpbnQKZyA9IGZbKGZbImRpc2J1cnNlZF9hdCJdID49ICIyMDI2LTAxLTAxIikgJiAoZlsiY2hhbm5lbCJdID09ICJhcHAiKV0KaywgbiA9IGdbImZwZDMwIl0uc3VtKCksIGxlbihnKSAgICAgICAgICAgICAgICAgICAgICAgIyAxMCwgNzg3CnByb3BvcnRpb25fY29uZmludChrLCBuLCBhbHBoYT0wLjA1LCBtZXRob2Q9IndpbHNvbiIpICAjICgwLjAwNjkyLCAwLjAyMzIzKQoKMjAyNiBhcHAgbG9hbnM6IDEwIEZQRHMgaW4gNzg3ID0gMS4yNyAlLCBXaWxzb24gOTUgJSAwLjY54oCTMi4zMiAlLgpUaGUgcG9pbnQgZXN0aW1hdGUgaXMgbG93ZXIgdGhhbiB0aGUgd2hvbGUtaGlzdG9yeSBhcHAgcmF0ZSAoMS43MCAlKSwgYnV0IHRoZSBpbnRlcnZhbCBpcyB3aWRlIGVub3VnaCB0byBjb250YWluIGl0IGNvbWZvcnRhYmx5OiB3aXRoIDc4NyBsb2FucyB0aGUgZGF0YSBjYW5ub3QgdGVsbCAnYmV0dGVyJyBmcm9tICd0aGUgc2FtZScuClRoZSBzZW50ZW5jZSBmb3IgQmVrem9kOiAndGhlIDIwMjYgYXBwIHJhdGUgbG9va3MgbG93ZXIsIGJ1dCBvbiAxMCBkZWZhdWx0cyBpdCBjb3VsZCBiZSBhbnl3aGVyZSBmcm9tIDAuNyB0byAyLjMgJSDigJQgd2FpdCBmb3IgbW9yZSB2aW50YWdlcyBiZWZvcmUgY2FsbGluZyBpdCBhbiBpbXByb3ZlbWVudC4n"}
```

<!-- challenge:end -->
