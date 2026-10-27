# Week 6 · Day 3 — Hypothesis tests I: is the difference real?

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 6.1 due · HW 6.2 (due Day 5)</span> <span class="badge company">Company corner</span>

> STORY **Wednesday, 9:00.** Nilufar again, this time with the risk-committee agenda for Friday. *"I read your intervals. Overlapping, not overlapping — the committee does not do 'a little'. **So is app worse? I need a yes or a no, with the evidence**, on half a page. If the answer is yes, marketing loses its favourite channel; if it is no and we are wrong, we lose money for a year. Whatever you write, I have to defend it."* Jasur: *"Then write down the probability of being wrong before you write the answer."*

## Today in 3 lines

- A test is a rule for deciding with a known error rate: **H₀ and H₁**, a **test statistic**, its distribution under H₀, the **p-value** (the precise definition — and the three wrong ones everyone uses), **α**, **type I and type II errors**, one- vs two-sided.
- The tests of the day on Nur data: **z-test for two proportions** (app vs branch FPD: z = 2.15, **p = 0.032**), **chi-square** (FPD × channel: **p = 0.078**; late payment × grade: p ≈ 0), **t-test and Welch** (scores by channel), **paired vs independent** (the same ten branches, 2025 vs 2026), with the assumptions checked (Shapiro, QQ, Levene).
- **Significance ≠ importance**: every result reported with an **effect size** — difference in rates, relative risk, Cohen's d, *extra FPDs per 1 000 loans* — and Nilufar gets her six-line risk-committee note.

---

## 1. Learn — the logic of a test

### H₀, H₁ and the courtroom

A **hypothesis test** (*проверка статистических гипотез*) starts from a **null hypothesis** H₀ (*нулевая гипотеза*) — "nothing is going on": p_app = p_branch. The **alternative** H₁ (*альтернативная гипотеза*) is what you would conclude otherwise: p_app ≠ p_branch. You compute a **test statistic** (*статистика критерия*) that measures how far the data are from H₀ in units of noise, and ask how unusual that value would be **if H₀ were true**. If it would be very unusual, you **reject H₀**; otherwise you **fail to reject** it. It is a trial: H₀ is "innocent", the data are the evidence, and "not guilty" means "not proven", never "proven innocent".

Every test you will run this week follows the same steps — put them in order:

```game
{"type": "order", "id": "w06d3-g1", "title": "The steps of a test", "items": ["Write the question in business words", "State H₀ and H₁ — one- or two-sided", "Fix α before looking at the result", "Choose the test from the outcome type, the groups and the pairing", "Compute the test statistic and its p-value", "Compare p with α and decide", "Report the effect size with its confidence interval"], "why": "α and the sidedness are fixed before the data speak; the effect size is what the decision is about."}
```

### The p-value — one right definition, three wrong ones

**p-value** (*p-значение*): *the probability, computed assuming H₀ is true, of getting a test statistic at least as extreme as the one observed.* For app vs branch: if both channels had the same true FPD rate, a gap of 0.66 points or more (in either direction) would appear in **3.2 %** of samples of this size.

What it is **not**:

1. **Not** "the probability that H₀ is true" (3.2 % chance the channels are equal). The p-value is computed *assuming* H₀; it cannot also be its probability.
2. **Not** "the probability the result is due to chance". Same mistake, friendlier words.
3. **Not** a measure of the effect's size or importance. p = 0.0001 can come from a trivial gap measured on a million rows (P10).

And p > 0.05 is **not** "proof of no difference" — it is "the data do not rule out no difference", which with small n is a weak statement.

> ⚠️ **Watch out.** "p = 0.032" never means "3.2 % chance that H₀ is true" or "3.2 % chance it is luck". It means: *if* the channels were equal, data this extreme would turn up 3.2 % of the time. The condition comes first — exactly like P(D | A) on Day 1.

One sentence of this analysis is wrong — tap it:

```game
{"type": "bug", "id": "w06d3-g2", "title": "Spot the wrong conclusion", "q": "One sentence misreads the p-value.", "code": "App FPD30 is 1.70 % (41 / 2 411) against 1.04 % for branch (34 / 3 263).\nA two-sided two-proportion z-test gives z = 2.15, p = 0.032.\nSo there is only a 3.2 % chance that the two channels have the same FPD rate.\nAt α = 5 %, fixed in advance, we reject H₀.\nThe difference is +0.66 points (95 % CI +0.05 to +1.33), about 7 extra FPDs per 1 000 loans.", "answer": [2], "why": "The p-value is computed assuming H₀ is true, so it cannot be the probability that H₀ is true."}
```

### α, the two errors, power

Before looking, choose the **significance level** α (*уровень значимости*), the type I error rate you accept — 5 % by convention. Reject H₀ when p < α.

| | H₀ true (no real difference) | H₀ false (a real difference) |
|---|---|---|
| reject H₀ | **type I error** (*ошибка I рода*), probability α — "app is worse" when it is not: marketing loses a good channel | correct — probability = **power** (*мощность*) = 1 − β |
| fail to reject | correct | **type II error** (*ошибка II рода*), probability β — a real deterioration missed for a year |

Lowering α to 1 % buys fewer false alarms with more misses. Only more data reduces both — Thursday's power calculation decides how much.

> 💡 **Key idea.** A test trades two mistakes: crying wolf (type I, α) and missing the wolf (type II, β). α is the one you choose; β is the one you pay for with n.

```game
{"type": "match", "id": "w06d3-g3", "title": "Words of the test", "pairs": [["H₀", "'nothing is going on': p_app = p_branch"], ["p-value", "P(data at least this extreme | H₀ true)"], ["α", "the type I error rate you accept, fixed in advance"], ["Type I error", "rejecting a true H₀ — a false alarm"], ["Type II error", "missing a real effect"], ["Power", "1 − β: the chance of catching a real effect"], ["Effect size", "how big the difference is, in units that matter"]]}
```

### One- or two-sided

A **two-sided** test (*двусторонний*) asks "different in either direction"; a **one-sided** test (*односторонний*) asks "higher" only and halves the p-value: app vs branch two-sided **0.0318**, one-sided 0.0159. Use one-sided only if a result in the other direction would lead to exactly the same action as "no difference" **and** you wrote that down before seeing the data. A risk committee acts in both directions (a much *better* app channel would also change policy), so the default is two-sided.

### z-test for two proportions

```
pooled p = (k₁ + k₂) / (n₁ + n₂)            SE = √( p(1 − p) (1/n₁ + 1/n₂) )            z = (p̂₁ − p̂₂) / SE
app vs branch: pooled = 75 / 5 674 = 1.322 %;  SE = 0.307 points;  z = (1.700 − 1.042) / 0.307 = 2.147;  p = 2·(1 − Φ(2.147)) = 0.0318
```

Press ▶ Run: this first block loads the tools for the whole page and writes the z-test in six lines.

```python
import math
import numpy as np
import pandas as pd
from statistics import NormalDist
Phi = NormalDist().cdf                                    # the standard normal CDF, Φ

def two_prop_z(k1, n1, k2, n2):
    p = (k1 + k2) / (n1 + n2)                             # the pooled rate: what H0 says both channels share
    se = math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2))
    z = (k1 / n1 - k2 / n2) / se
    return z, 2 * (1 - Phi(abs(z)))                       # z and the two-sided p-value

z, p = two_prop_z(41, 2411, 34, 3263)
print(round(z, 3), round(p, 4))                           # 2.147 0.0318
```

The same in statsmodels (optional here: it loads an extra package on the first run; the notebook has it):

```python
from statsmodels.stats.proportion import proportions_ztest, confint_proportions_2indep
print(proportions_ztest([41, 34], [2411, 3263]))                                  # (2.147, 0.0318)
print(confint_proportions_2indep(41, 2411, 34, 3263, method="newcomb"))           # difference: +0.05 to +1.33 points
```

**What p = 0.032 looks like.** Simulate H₀ directly: give both channels the pooled rate 1.322 %, draw 100 000 pairs of samples of 2 411 and 3 263 loans, and count how often the gap is at least 0.66 points either way.

```python
rng = np.random.default_rng(2026)
p0 = 75 / 5674
diff = rng.binomial(2411, p0, 100_000) / 2411 - rng.binomial(3263, p0, 100_000) / 3263
print(np.mean(np.abs(diff) >= 41/2411 - 34/3263))          # 0.0321 — the z-test's 0.0318, by brute force
print(np.quantile(diff, [0.025, 0.975]))                   # ±0.60 points: the gap chance alone produces 95 % of the time
```

That is all a p-value is: the share of the H₀ world that looks at least as extreme as ours. The z formula is the shortcut; the simulation is the definition.

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

The 95 % interval of the **difference** excludes 0, which is the same verdict as p < 0.05. Yesterday the two Wilson intervals overlapped (1.26–1.45 %) — and still the difference is significant: the SE of a difference is √(SE₁² + SE₂²) = 0.318 points, smaller than SE₁ + SE₂ = 0.441. Overlap of two 95 % intervals is a much stricter rule than a 5 % test; never use the eye for a test.

> ⚠️ **Watch out.** "The intervals overlap, so there is no difference" is wrong in one direction only: non-overlapping intervals do mean a significant difference, overlapping ones may or may not. Test the difference itself.

### Chi-square test of independence

The **chi-square test** (*критерий хи-квадрат Пирсона*) compares a contingency table with the counts expected if the two variables were independent: expected = row total × column total / grand total; χ² = Σ (observed − expected)² / expected, with (rows − 1)(cols − 1) degrees of freedom.

```python
f = pd.read_csv("data/powerbi/fct_first_instalment.csv")          # week 5's FPD frame: 7 099 loans, fpd30 = 0/1
f["channel"] = f["product"].map({"MICRO": "app", "BNPL": "partner"}).fillna("branch")   # app = Micro only, partner = BNPL only
ct = pd.crosstab(f["channel"], f["fpd30"])                        # app 2370/41 · branch 3229/34 · partner 1409/16
obs = ct.to_numpy()
expected = np.outer(obs.sum(axis=1), obs.sum(axis=0)) / obs.sum()  # row total × column total / grand total
chi2 = ((obs - expected) ** 2 / expected).sum()
print(expected.round(1))
print(round(chi2, 3), round(math.exp(-chi2 / 2), 4))              # 5.108 0.0778 — with 2 df the p-value is e^(−χ²/2)
# scipy (the notebook): chi2, p, dof, expected = scipy.stats.chi2_contingency(ct)
```

| channel | observed FPD | expected FPD | observed no FPD | expected no FPD | (O − E)² / E, FPD cell |
|---|---|---|---|---|---|
| app | 41 | 30.9 | 2 370 | 2 380.1 | 3.30 |
| branch | 34 | 41.8 | 3 229 | 3 221.2 | 1.46 |
| partner | 16 | 18.3 | 1 409 | 1 406.7 | 0.28 |

**FPD × channel, all three channels: p = 0.078 — not significant at 5 %.** The expected FPDs under independence are 30.9 / 41.8 / 18.3; the app's 41 is the only cell far from its expectation, and spread over two degrees of freedom it is not enough. This is not a contradiction of the z-test: the χ² answers "do the three channels differ at all?", the z-test answers a narrower question you chose after seeing the table (app vs branch — the two extremes). On a 2 × 2 table the χ² *is* the z-test: without continuity correction χ² = 4.610 = 2.147², p = 0.0318 identical; with Yates' correction (scipy's default on 2 × 2) p = 0.042. Excel: `=CHISQ.TEST(observed_range, expected_range)`. Rule of thumb: all expected counts ≥ 5 (else Fisher, tomorrow).

**Late payment × grade** (52 850 clean payments; late = paid after the due date): A 5.09 % · B 9.82 % · C 19.62 % · D 35.60 %; χ² = 2 595, df 3, p ≈ 0; **Cramér's V** = √(χ² / (n · (min(r, c) − 1))) = **0.22**, a moderate association. One honest caveat: the test assumes independent rows, and a loan contributes 7.1 payments on average — payments of one loan are not independent. Re-run at the **loan** level (share of loans with any late payment: A 29.6 · B 46.5 · C 69.0 · D 85.6 %): χ² = 771, p ≈ 10⁻¹⁶⁷. Same verdict, honest grain.

### t-test and Welch — comparing means

The **two-sample t-test** (*t-критерий Стьюдента*) compares two means: t = (x̄₁ − x̄₂) / SE. Student's version assumes equal variances; **Welch's** (*критерий Уэлча*) does not and loses almost nothing when they are equal — use Welch by default (`equal_var=False`; Excel `=T.TEST(r1, r2, 2, 3)`, where 2 = two-tailed, 3 = unequal variances).

- **Applicants' credit scores, app vs branch**: 661.0 vs 659.6, Welch t = 1.23, **p = 0.218** — no evidence the app attracts different applicants. Levene p = 0.77 (equal variances), Shapiro on 500 app applicants p = 0.70.
- **Approved loans' scores, app vs branch**: 683.2 vs 679.8, t = 2.48, **p = 0.013** — significant, and 3.4 points on a scale whose sd is 52: Cohen's d = 0.06, nothing.
- **The trap: principal by channel.** Welch t = −43.3, p ≈ 0. Meaningless: `pd.crosstab(loans.channel, loans.code)` shows app = Micro only, partner = BNPL only, branch = Auto + Consumer + SME. Channel and product are **confounded** (*смешаны*); no test separates them. Nilufar's FPD gap is also, inevitably, a *Micro-via-app* vs *other-products-via-branch* gap — the note must say so.

### Paired vs independent samples

**Paired** (*связанные / зависимые выборки*) means each value in one group has a partner in the other — the same branch in two years, the same customer before and after. The paired test works on the **differences** and removes the between-unit variation. FPD30 of the same ten branches, 2025 vintages vs 2026 vintages:

```python
f["year"] = pd.to_datetime(f["disbursed_at"]).dt.year
w = f[f.year.isin([2025, 2026])].pivot_table(index="branch_name", columns="year", values="fpd30", aggfunc="mean") * 100
d = w[2026] - w[2025]                                      # the paired test works on these ten differences
print(round(d.mean(), 2), round(d.mean() / (d.std() / math.sqrt(len(d))), 2))   # -0.58 -2.56 — the paired t statistic
# the p-values need scipy (optional here; it loads on the first run):
print(stats.ttest_rel(w[2026], w[2025]))     # t = -2.56, p = 0.031
print(stats.ttest_ind(w[2026], w[2025]))     # t = -2.05, p = 0.055 — the wrong test throws away the pairing
```

Nine of ten branches improved; Tashkent North went from 0.55 to 1.54 %. Pairing turned "borderline" into "significant" because a branch with a high rate in 2025 tends to stay high. Excel: `=T.TEST(r2025, r2026, 2, 1)` (type 1 = paired).

### Checking assumptions — normality of what?

The t-test needs the **sampling distribution of the mean** to be normal, not the data (as the quiz of RU lesson 5.4 puts it: *normality of the statistic, e.g. the mean*). With n in the hundreds the CLT delivers it even for skewed data; with n = 10 and skewed money it does not. Tools: the **QQ plot** (always), **Shapiro–Wilk** `stats.shapiro` (*критерий Шапиро–Уилка*) on a sample of a few hundred — on thousands of rows it rejects deviations nobody cares about (500 app principals: p = 1.2 × 10⁻¹², because Micro tickets are spread flat between the product limits in round 10 000s, and the t-test on 2 669 of them is still fine), **Levene** `stats.levene` for equal variances (or skip it and use Welch). When the assumptions fail at small n — tomorrow's non-parametric tests.

```python
# (shape only — not meant to run)
la = loans.loc[loans.channel == "app", "principal"]
stats.probplot(la, dist="norm", plot=plt)                         # the picture first: an S with steps, not a line (flat, round tickets)
stats.shapiro(la.sample(500, random_state=2026))                  # p = 1.2e-12: not normal — and with n = 2 669 the CLT does not care
stats.levene(sa, sb)                                              # p = 0.77: equal variances (Welch would not have needed it)
stats.skew(la), len(la)                                           # 0.03, 2 669 — symmetric and many: the mean's interval is safe
```

The decision rule you will use: **n large (hundreds per group) → t / Welch is fine for means whatever Shapiro says; n small and the QQ plot bent or a few huge values → Mann–Whitney or a permutation test (Day 4); the question is about a median or "typical" value → not a t-test at all.**

### Effect size — significance is not importance

A p-value says whether you can see an effect; an **effect size** (*размер эффекта*) says whether it matters. For rates: the **difference** (app − branch = **+0.66 points**, 95 % CI +0.05 to +1.33), the **relative risk** (1.70 / 1.04 = **1.63**, CI 1.04–2.56), and the business unit — **extra FPDs per 1 000 loans: 6.6** (CI 0.5–13.3). For means: **Cohen's d** = difference / pooled sd (0.2 small, 0.5 medium, 0.8 large). Same p-value can sit on a huge or a trivial effect; n decides which.

> 💡 **Key idea.** The p-value answers "can we see it?"; the effect size answers "does it matter?". A committee decides on the second — so every p goes out with a difference, an interval and a number in soum or FPDs per 1 000.

### Reading a result, writing a result

Every scipy / statsmodels test returns the same two things — the statistic and the p-value (sometimes df, sometimes an interval):

```python
# (shape only — not meant to run)
r = stats.ttest_ind(sa, sb, equal_var=False)
r.statistic, r.pvalue, r.df          # 1.233, 0.218, 10 451 — Welch's df is fractional, that is normal
r.confidence_interval()              # the interval of the difference in means: report it too
```

Then one sentence with six parts, in this order — it is the sentence an examiner and a committee both want: *"[Group A] had [estimate] vs [estimate] for [group B] (difference [d], 95 % CI [lo, hi]); a [named test] gives [statistic] = [value], p = [value]; [conclusion at the α chosen in advance], [effect in business units]."* For example: *"App loans had FPD30 1.70 % vs 1.04 % for branch loans (difference +0.66 points, 95 % CI +0.05 to +1.33); a two-sided two-proportion z-test gives z = 2.15, p = 0.032; at α = 5 % the app's rate is higher, about 7 extra FPDs per 1 000 loans."* Round p to two significant digits (0.032, 0.00008), never "p = 0.000"; write "p < 0.001" when it is that small.

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

**1. Question and hypotheses.** Is the app channel's FPD30 probability different from the branch's? H₀: p_app = p_branch; H₁: ≠ (two-sided); α = 0.05, fixed now.

**2. The data.** 41 / 2 411 vs 34 / 3 263 (week 5's FPD30, payments de-duplicated, first due date ≤ as-of − 30 days).

**3. The test.** Two independent proportions, 34–41 events per group (expected counts far above 5): two-proportion z-test. **z = 2.147, p = 0.032.** Fisher's exact test (tomorrow) agrees: p = 0.034.

```python
# uses scipy and statsmodels: they load on the first ▶ Run (the notebook has them too)
k, n = np.array([41, 34]), np.array([2411, 3263])
z, p = proportions_ztest(k, n)                                                    # 2.147, 0.0318
lo, hi = confint_proportions_2indep(41, 2411, 34, 3263, method="newcomb")          # +0.0005, +0.0133
rr_lo, rr_hi = confint_proportions_2indep(41, 2411, 34, 3263, compare="ratio", method="log")   # 1.04, 2.56
stats.fisher_exact([[41, 2370], [34, 3229]])                                       # odds ratio 1.64, p = 0.0344
stats.chi2_contingency(pd.crosstab(f.channel, f.fpd30))[1]                         # 0.0778 — the three-channel check
```

**4. The size.** +0.66 points (95 % CI +0.05 to +1.33); RR 1.63 (1.04–2.56); **6.6 extra FPDs per 1 000 app loans**. At the 2026 pace (1 036 app loans in January–September, ~1 381 a year) that is ~9 extra FPDs a year on loans averaging 2.69 m: ~25 m soum of exposure, ~15 m of expected loss at 60 % LGD.

**5. The caveats that go in the note.** (a) The three-channel χ² is not significant (p = 0.078) and app vs branch was chosen as the most extreme pair — the evidence is **moderate**, not overwhelming. (b) App loans are all Micro, branch loans are Auto / Consumer / SME: the gap is channel *and* product; the data cannot separate them. (c) The interval of the difference starts at +0.05 points — consistent with almost nothing.

**6. The answer.** *"Yes — at the 5 % level the app's FPD30 is higher than the branch's (1.70 % vs 1.04 %, p = 0.03), about 7 extra first-payment defaults per 1 000 loans. The evidence is moderate and the money is small (~15 m soum a year), so the action is a cheap fix and a re-test, not closing the channel."*

---

## 3. Practice (50 min)

Every task has its own answer box. The Python boxes share the session of section 1's blocks: `two_prop_z`, `Phi`, `f` (with `channel` and `year`) are ready once you have pressed ▶ Run on them. `data/python/week6/day3_starter.ipynb` has the same frames plus `x` (the payments) and the three TODO functions (`two_prop_ztest`, `relative_risk`, `cohens_d`) that the checkpoint reuses.

**P1.** Write H₀ and H₁, one- or two-sided, for: (a) "Has grade D's late-payment rate changed since last year?" (b) "Marketing claims the new app screen raises approval; it ships only if it does." (c) "Is FPD independent of region?"

```task
{"id": "w06d3-p1", "kind": "free", "min": 25, "model": "(a) H₀: p_D,2026 = p_D,2025; H₁: they differ — two-sided, because a rise and a fall both matter. (b) H₀: p_new ≤ p_old; H₁: p_new > p_old — one-sided is defensible, because 'worse' and 'no change' lead to the same action (do not ship), and it is written down before the test. (c) H₀: FPD and region are independent; H₁: they are not — a χ² test on the region × FPD table.", "rubric": ["(a) two-sided, with the reason", "(b) one-sided, justified by 'same action' and decided in advance", "(c) independence as H₀, χ² test named", "every H₀ is the 'nothing going on' statement"]}
```

<details><summary>Answer</summary>

(a) H₀: p_D,2026 = p_D,2025; H₁: ≠; two-sided — a fall or a rise both matter. (b) H₀: p_new ≤ p_old; H₁: p_new > p_old; one-sided is defensible because "worse" and "no change" lead to the same action (do not ship) — written down before the test. (c) H₀: FPD and region are independent; H₁: they are not; a χ² test on the region × FPD table (the χ² is "two-sided" by construction).

</details>

**P2.** `two_prop_ztest` (your TODO 1) for app vs partner and partner vs branch. Which pairs differ at 5 %?

```task
{"id": "w06d3-p2", "kind": "python", "starter": "# counts: app 41 / 2411 · branch 34 / 3263 · partner 16 / 1425\nprint(two_prop_z(41, 2411, 34, 3263))     # app vs branch\n# add app vs partner and partner vs branch; print z and p\n", "answer": 0.153, "dp": 3, "model": "print(two_prop_z(41, 2411, 16, 1425))     # z 1.43, p 0.153\nprint(two_prop_z(16, 1425, 34, 3263))     # z 0.25, p 0.804 — only app vs branch is below 0.05"}
```

<details><summary>Answer</summary>

App vs partner: z = 1.43, **p = 0.153**; partner vs branch: z = 0.25, **p = 0.804**; app vs branch: z = 2.15, p = 0.032. Only one of three pairs, and the three-way χ² says p = 0.078 — the pattern "the extremes differ, nothing else does" is what a single moderate effect *or* chance plus selection would both produce. Thursday's Holm correction for three comparisons: 0.032 × 3 = 0.095.

</details>

**P3.** For app vs branch, the one-sided p-value. When would Nilufar be allowed to quote it?

```task
{"id": "w06d3-p3", "kind": "number", "answer": 0.0159, "dp": 4, "unit": "one-sided p", "hint": "One-sided 'app is higher' takes only the upper tail: half the two-sided 0.0318, or 1 − Φ(2.147).", "model": "1 − Φ(2.147) = 0.0159. Quotable only if the committee had agreed in advance that a better app channel would change nothing — Bekzod's question came after looking at the dashboard, so the honest number is the two-sided 0.032."}
```

<details><summary>Answer</summary>

`proportions_ztest([41, 34], [2411, 3263], alternative="larger")` → **0.0159**. Only if the committee had agreed in advance that an app channel *better* than branch would change nothing — and Bekzod's question ("is app worse, or is that noise?") was asked after looking at the dashboard. Switching to one-sided after seeing the direction is the cheapest p-hacking there is.

</details>

**P4.** χ² test of FPD30 × risk grade (4 × 2). Statistic, df, p, the smallest expected count. Then grade A vs grade C as a two-proportion z-test.

```task
{"id": "w06d3-p4", "kind": "python", "starter": "loans = pd.read_csv(\"data/raw/loans.csv\")\ng = f.merge(loans[[\"loan_id\", \"risk_grade\"]], on=\"loan_id\")\nct = pd.crosstab(g[\"risk_grade\"], g[\"fpd30\"])\nprint(ct)                     # A 10 / 1 667 · B 30 / 3 084 · C 44 / 2 034 · D 7 / 314\n# expected counts, then chi2 = Σ (O − E)² / E — print chi2 (2 decimals) and the smallest expected count\n", "answer": 23.17, "dp": 2, "model": "obs = ct.to_numpy()\nexpected = np.outer(obs.sum(axis=1), obs.sum(axis=0)) / obs.sum()\nprint(round(((obs - expected) ** 2 / expected).sum(), 2), round(expected.min(), 1))   # 23.17 4.0 — df 3, p = 3.7e-05\nprint(two_prop_z(10, 1667, 44, 2034))                                                 # A vs C: z = -3.95, p = 7.9e-05"}
```

<details><summary>Answer</summary>

Counts A 10 / 1 667, B 30 / 3 084, C 44 / 2 034, D 7 / 314; **χ² = 23.17, df = 3, p = 3.7 × 10⁻⁵**. Smallest expected count: grade D's FPD cell, **4.0** — one cell of eight below 5 (under the usual 20 % limit, so χ² is acceptable; Fisher–Freeman–Halton would be the purist's choice). A vs C: z = −3.95, **p = 7.9 × 10⁻⁵**; RR 2.16 / 0.60 = 3.6. The scorecard orders FPD as well as lateness.

</details>

**P5.** Show that a 2 × 2 χ² without continuity correction equals z² for app vs branch. What does scipy do by default, and which p do you report?

```task
{"id": "w06d3-p5", "kind": "choice", "options": ["scipy uses no correction, so its p equals the z-test's 0.0318", "scipy applies Yates' continuity correction on a 2 × 2 by default (χ² = 4.12, p = 0.042); report one version and name it — here the uncorrected z-test and Fisher (0.034) agree", "χ² and z can never agree on a 2 × 2 table", "Report the smallest of the three p-values"], "answer": 1, "explain": "Without correction χ² = 4.610 = 2.147², p = 0.0318 identical; with Yates p = 0.042, more conservative. Picking the smallest p is p-hacking."}
```

<details><summary>Answer</summary>

`stats.chi2_contingency([[41, 2370], [34, 3229]], correction=False)` → χ² = **4.610** = 2.147², p = **0.0318**. The default (`correction=True`, Yates) gives χ² = 4.119, p = 0.042 — more conservative. Report one and name it; with these counts the z-test (no correction) and Fisher (0.034) agree, so the uncorrected value is fine.

</details>

**P6.** Welch t-test of applicants' credit scores, partner vs branch; then the same on **approved loans**. Add Cohen's d (your TODO `cohens_d`).

```task
{"id": "w06d3-p6", "kind": "python", "starter": "apps = pd.read_csv(\"data/raw/applications.csv\")\nsa = apps.loc[apps.channel == \"partner\", \"credit_score\"].dropna()\nsb = apps.loc[apps.channel == \"branch\", \"credit_score\"].dropna()\nprint(round(sa.mean(), 1), round(sb.mean(), 1))     # 657.2 659.6\n# Welch: t = (mean_a − mean_b) / √(var_a / n_a + var_b / n_b) — print t (2 decimals); then the p-value with 2 * (1 - Phi(abs(t)))\n", "answer": -1.72, "dp": 2, "model": "t = (sa.mean() - sb.mean()) / math.sqrt(sa.var() / len(sa) + sb.var() / len(sb))\nprint(round(t, 2), round(2 * (1 - Phi(abs(t))), 3))   # -1.72 0.086 — with thousands of scores the normal tail equals the t tail\nd = (sa.mean() - sb.mean()) / math.sqrt((sa.var() + sb.var()) / 2)\nprint(round(d, 2))                                     # Cohen's d = -0.04: nothing"}
```

<details><summary>Answer</summary>

Applicants: partner 657.2 vs branch 659.6, Welch t = −1.72, **p = 0.086**, d = −0.04. Approved loans: 678.8 vs 679.8, t = −0.59, **p = 0.554**, d = −0.02. None of these moves a decision: a 2-point score gap is a fifth of the width of one grade band. The applicants' pool is the same across channels; whatever makes app FPD higher is not the score at the door.

</details>

**P7.** Paired vs independent on the ten branches (2025 vs 2026 FPD30): both tests, the mean change, and one sentence on why the p-values differ.

```task
{"id": "w06d3-p7", "kind": "choice", "options": ["The paired test is wrong here; branches are independent", "Pairing compares each branch with itself, so the big differences between branches no longer count as noise — paired p = 0.031 vs 0.055 unpaired", "The paired test uses more data", "Both p-values should be the same; one is a rounding error"], "answer": 1, "explain": "Ten differences with mean −0.58 points and t = −2.56. Same unit measured twice → paired."}
```

<details><summary>Answer</summary>

Paired: t = **−2.56, p = 0.031**; independent: t = −2.05, p = 0.055; mean change −0.58 points (2025 average 1.61 %, 2026 1.03 %). Branch levels differ a lot (Bukhara 3.20 → 1.99, Samarkand 0.87 → 0.75); the paired test compares each branch with itself, so that between-branch spread no longer counts as noise. Use paired whenever the same unit is measured twice.

</details>

**P8.** Effect sizes for app vs branch FPD: difference with its 95 % CI, RR with its CI, extra FPDs per 1 000. Then translate into soum per year for the app channel.

```task
{"id": "w06d3-p8", "kind": "number", "answer": 6.6, "dp": 1, "unit": "extra FPDs per 1 000 app loans", "hint": "(41 / 2 411 − 34 / 3 263) × 1 000.", "model": "17.0 − 10.4 = 6.6 per 1 000 (95 % CI 0.5–13.3); RR 1.63 (1.04–2.56). At ~1 381 app loans a year: ~9 extra FPDs × 2.69 m ≈ 25 m soum at risk, ~15 m expected loss at LGD 60 %."}
```

<details><summary>Answer</summary>

Difference **+0.66 points** (Newcombe CI +0.05 to +1.33); RR **1.63** (`confint_proportions_2indep(..., compare="ratio", method="log")` → 1.04–2.56); **6.6 per 1 000** (0.5–13.3). App volume 2026: 1 036 loans in January–September → ~1 381 a year → ~9 extra FPDs × 2.69 m average principal ≈ **25 m soum** at risk, ~15 m expected loss at LGD 60 %. Statistically "yes", financially a rounding error next to the 3.6 bn expected loss of the book (Day 1).

</details>

**P9.** Late payment, grade A vs grade B: z-test on payments, then on loans (any late payment). Why do the z values differ so much?

```task
{"id": "w06d3-p9", "kind": "choice", "options": ["Payments are more precise than loans", "A loan contributes about seven payments that are not independent, so the payment-level test pretends to have seven times the information and inflates z", "The loan-level test drops the late payments", "The z-test cannot be used on loans"], "answer": 1, "explain": "−15.45 on payments vs −11.59 on loans. Test at the unit that was sampled or randomised — the loan."}
```

<details><summary>Answer</summary>

Payments: 5.09 % vs 9.82 %, z = **−15.45**, p = 7.5 × 10⁻⁵⁴ (12 219 vs 23 561 payments). Loans: 29.6 % vs 46.5 %, z = **−11.59**, p = 4.6 × 10⁻³¹ (1 741 vs 3 246 loans). The payment-level test pretends to have 7 times as many independent observations as it has; its z is inflated. Here the conclusion survives; on a borderline question the wrong grain manufactures significance. Test at the unit that was randomised or sampled — the loan.

</details>

> 🚀 **Stretch (optional, +5 XP).** **P10.** p depends on n. Keep the app and branch FPD **rates** fixed and multiply both n's by 10, then by 0.1. Compute z and p each time. Then write the sentence that explains to Bekzod why "p = 0.000 000 01" on a 10-million-row table proves nothing about importance.

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
  {"type": "single", "q": "App vs branch: z-test p = 0.032; three-channel χ² p = 0.078. What is going on?", "options": ["One test is wrong", "They answer different questions: 'do the three differ at all?' vs a pair picked after seeing the table — the evidence is moderate", "χ² must always be smaller", "The z-test used Yates' correction"], "answer": 1, "explain": "That is why the committee note says 'moderate' (→ section 1, 'Chi-square', P2)."},
  {"type": "multi", "q": "A test on 52 850 payments gives p = 10⁻⁶⁹. What do you ask before you believe it matters?", "options": ["How big is the effect, with its interval?", "Was the test run at the right grain (loans, not payments)?", "Is α = 5 %?", "Was a seed set?"], "answer": [0, 1], "explain": "Huge n makes any gap significant; payments of one loan are not independent (→ section 1, 'Effect size', P9, P10)."}
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
  {"type": "single", "q": "App vs branch: z-test p = 0.032; the three-channel χ² gives p = 0.078. What is going on?", "options": ["Different questions: χ² asks whether the three channels differ at all; the z-test asks about the two extremes, a pair chosen after seeing the table", "The z-test used the wrong n", "A contradiction — one of the tests is wrong", "χ² is always less powerful, so ignore it"], "answer": 0, "explain": "That is why the committee note calls the evidence moderate (→ section 1, 'Chi-square', P2)."},
  {"type": "single", "q": "w holds the FPD30 % of the same ten branches in 2025 and 2026. Which test should replace this one?", "code": "stats.ttest_ind(w[2026], w[2025])", "options": ["stats.fisher_exact", "A chi-square test", "stats.ttest_rel — the same branches measured twice, so the test works on the differences", "Welch: equal_var=False"], "answer": 2, "explain": "Pairing removes the between-branch spread: p = 0.031 paired vs 0.055 unpaired (→ section 1, 'Paired vs independent')."},
  {"type": "number", "q": "A 2 × 2 χ² without continuity correction equals z². If z = 2.147, what is χ² (two decimals)?", "answer": 4.61, "tol": 0.01, "explain": "2.147² = 4.61 and the p-value is identical (0.0318); scipy's default Yates correction gives 4.12, p = 0.042 (→ section 1, 'Chi-square', P5)."},
  {"type": "multi", "q": "Which are good practice when reporting a test?", "options": ["Read p = 0.078 as 'FPD does not depend on channel'", "Write p < 0.001, never p = 0.000", "Report the effect size with its CI next to the p-value", "Test at the loan level when loans are the units, not at the payment level", "Switch to a one-sided test after seeing which group is higher"], "answer": [1, 2, 3], "explain": "Switching sides after looking is p-hacking, and p > 0.05 is absence of evidence (→ Mistakes, section 1 'Effect size')."},
  {"type": "single", "q": "Late payment, grade A vs B: z = −15.45 on payments, −11.59 on loans. Why so different?", "options": ["A loan contributes about seven payments that are not independent, so the payment-level test pretends to have more information and inflates z", "The loan test used Welch", "Loans were counted twice", "Payments are more accurate"], "answer": 0, "explain": "Test at the unit that was sampled — the loan; on a borderline question the wrong grain manufactures significance (→ P9)."},
  {"type": "single", "q": "Welch on principal by channel gives t = −43, p ≈ 0. What can you conclude about channels?", "code": "pd.crosstab(loans.channel, loans.code)\n# app -> MICRO only · partner -> BNPL only · branch -> AUTO, CONS, SME", "options": ["A one-sided test is needed", "Nothing about channels: channel and product are confounded, and no test separates them", "App customers borrow less because of the app", "Variances must be equal first"], "answer": 1, "explain": "App = Micro only, partner = BNPL only; Nilufar's FPD gap is also, inevitably, a product gap (→ section 1, 't-test and Welch')."},
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
