# Week 7 · Day 1 — Designing an A/B test: before you touch the data

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 7.1 (due Day 3)</span> <span class="badge company">Company corner</span>

> STORY **Monday, 9:00.** A new face at the analytics desk: **Kamola**, product manager (*продакт-менеджер*) for the Nur app, with a phone showing two versions of the loan-offer screen. *"We redesigned the offer screen — the amount slider, the monthly payment in big letters, one button instead of three. Users love it in the interviews. **Can we just ship it on 1 September and compare September to August?** If conversion goes up, the design worked."* Madina, before you can answer: *"Last week you told Jasur that 2 000 loans cannot test an SMS. Tell Kamola what can test a screen."* Nilufar, passing: *"And if the new screen sells more loans to people who do not pay the first instalment, I want to know before it is in everyone's pocket."*

## Today in 3 lines

- Why a **randomised experiment** beats "September vs August": the only thing that differs between the groups is the screen. The design comes first — **hypothesis, primary metric, guardrails** (FPD!), **unit of randomisation**, **MDE, power, sample size and duration** with week 6's tools — you will work out how many users per arm the offer-screen test needs and how many days of app traffic that is.
- How the split is made — **hashing the user id with a salt** — and the two checks that catch a broken split before anyone reads a result: the **A/A test** and the **SRM chi-square** — you run both on our A/A data.
- The traps that are decided at design time: **peeking** (a look every day turns 5 % into **27 %** false wins), **novelty / primacy**, interference, and the **pre-registration** document that HW 7.1 asks you to write.

---

## 1. Learn — the experiment is designed, not found

The Python boxes on this page run here, in the page, in one shared namespace — like the cells of a notebook. Run them top to bottom; later boxes use what earlier ones defined.

### Why "September vs August" is not an experiment — confounding

**What it is.** **Confounding** (*смешение факторов*) means two things change at once, so you cannot tell which one moved the number. A **before/after comparison** (*сравнение до/после*) is always confounded: between August and September the screen changes, and so does the calendar — salary days, school fees, a marketing push, an app release, the approval policy, the mix of new and returning users.

```pic
{"id": "w07d1-pic1", "title": "With nothing changed, the rate still moves", "caption": "Nur's app approval rate by month of application, 2026, with no screen change at all: up to 71.4 % in July, down to 66.7 % in September — a swing of 4.7 points that would swallow a +0.9-point effect.", "chart": {"type": "intervals", "rows": [{"label": "June", "lo": 69.1, "mid": 69.1, "hi": 69.1}, {"label": "July", "lo": 71.4, "mid": 71.4, "hi": 71.4}, {"label": "August", "lo": 67.9, "mid": 67.9, "hi": 67.9}, {"label": "September", "lo": 66.7, "mid": 66.7, "hi": 66.7}], "min": 64, "max": 74, "unit": " %"}}
```

**How to see it.** Nur's own app channel, with **no** screen change at all, moved like this in 2026:

| applied in | app applications | decided | approved | approval rate |
|---|---|---|---|---|
| June | 236 | 204 | 141 | 69.1 % |
| July | 242 | 196 | 140 | **71.4 %** |
| August | 235 | 193 | 131 | 67.9 % |
| September | 224 | 192 | 128 | **66.7 %** |

From July to September the rate fell 4.7 points — with nothing changed. A screen that adds 0.9 points would be lost in that swing. An **A/B test** (*A/B-тест*) removes the calendar: over the same days, a random half of users sees the current screen and the other half the new one.

```text
before/after
  August:
    screen A + August's calendar
    → 67.9 %
  September:
    screen B + September's calendar
    → ?
  two things changed

A/B test
  1–28 Aug, random half:
    screen A + the same days
    → rate A
  1–28 Aug, other half:
    screen B + the same days
    → rate B
  one thing changed
```

The current screen is the **control** (A, *контрольная группа*); the new one is the **treatment** (B, *тестовая группа*). Because a coin decides who sees what, the two halves are alike in device, region, salary day and mood. A difference beyond chance is caused by the screen.

**When you use it.**
- Any "did our change work?" question. The answer is a concurrent, randomised control — not last month.
- A before/after chart is still useful to *spot* a change. It cannot *measure* one.

> 💡 **Key idea.** Randomise, and the only systematic difference between the groups is the thing you changed. A before/after comparison also changes the calendar — and the calendar alone moved Nur's approval rate by 4.7 points.

**Your turn.** Which comparison measures the effect of the new screen alone?

```task
{"id": "w07d1-l1", "kind": "choice", "options": ["Conversion in September (new screen) vs conversion in August (old screen)", "Conversion of app users vs branch customers in September", "Over 1–28 August, users split at random: half see the old screen, half the new one", "Conversion in September 2026 vs September 2025"], "answer": 2, "explain": "Only the concurrent random split changes one thing. The other three also change the calendar, the channel or the year — confounders that move conversion on their own."}
```

### The hypothesis — change, mechanism, measurable consequence

**What it is.** A **hypothesis** (*гипотеза*) is one sentence written before the test. It names the **change**, the **mechanism** (why it should work) and the **measurable consequence** (which number moves, in which direction).

**How to write it.**

| Template | Example |
|---|---|
| `If we <change>,` | show the monthly payment in large type and one "Get the money" button |
| `then <metric> will <go up / down>,` | conversion from first offer view to signed contract within 7 days goes up |
| `because <mechanism>.` | a clear monthly payment removes hesitation at the moment of decision |

**When you use it.**
- At the start of every test. The metric in the hypothesis becomes the primary metric (next subsection).
- When a result comes in: you check it against the prediction you made, not against a story invented afterwards.

> ⚠️ **Watch out.** "Users will like the new screen" is not a hypothesis — no number can prove it wrong. Name the metric and the direction.

**Your turn.** Which sentence is a testable hypothesis?

```task
{"id": "w07d1-l2", "kind": "choice", "options": ["The new screen is better", "Users will love the new design, as the interviews showed", "If the offer shows the monthly payment instead of the rate, more viewers sign within 7 days, because the cost is easier to judge", "We will see what changes after the release"], "answer": 2, "explain": "Only the third has a change, a mechanism and a number that can move (signed within 7 days). The others cannot be proven wrong by any result."}
```

### Primary metric, secondary metrics, guardrails

**What it is.** A test has three kinds of metric.
- The **primary metric** (*целевая метрика*) is **one** number the decision rests on. It has a numerator, a denominator and a time window.
- **Secondary metrics** (*вторичные метрики*) explain *where* the effect comes from: the funnel steps, the loan size. You read them; you do not decide on them.
- **Guardrail metrics** (*защитные метрики*) must **not** get worse, even when the primary improves. In lending the first guardrail is **FPD** (first-payment default).

| kind | the offer-screen test | job |
|---|---|---|
| primary | users who signed a contract within 7 days of their first offer view ÷ assigned users | the decision |
| secondary | started an application, submitted, approved (each ÷ the step before); principal per loan | the explanation |
| guardrail | FPD of the resulting loans; average principal; app crash rate; complaints | the brakes |

**How to write it.** The primary metric as code, on the July A/A users:

```python
import pandas as pd
# one row per assigned user (the denominator)
aa = pd.read_csv("data/ab/aa_users.csv", parse_dates=["assigned_at"])
# one row per app event
ev = pd.read_csv("data/ab/aa_events.csv", parse_dates=["event_time"])
signed = ev[ev["event_name"] == "contract_signed"].merge(aa[["user_id", "assigned_at"]], on="user_id")
in_window = signed[(signed["event_time"] >= signed["assigned_at"]) &
                   # the 7-day window
                   (signed["event_time"] <= signed["assigned_at"] + pd.Timedelta(days=7))]
# numerator ÷ denominator
conv = aa["user_id"].isin(in_window["user_id"]).mean()
# 8.19 % of 12 852
print(f"{conv:.2%} of {len(aa):,} users signed within 7 days")
```

8.19 % — 1 053 of 12 852 users signed within seven days. Why seven: 85 % of signings come within two days of the first view and 94 % within seven. A fixed window treats a user who arrived on 28 August the same as one from 1 August.

**When you use it.** Before the test: you write all three lists. After it: you decide on the primary, explain with the secondaries, and stop if a guardrail breaks.

> ⚠️ **Watch out.** Five "primary" metrics means you will report the one that moved. Pick one; move the others to secondary.

**Your turn.**

```game
{"type": "sort", "id": "w07d1-g3", "title": "Primary, guardrail, or a bad primary?", "q": "The offer-screen test. Put each metric where it belongs.", "groups": {"Primary (the decision)": ["Signed within 7 days of the first offer view ÷ assigned users"], "Guardrail (must not get worse)": ["FPD of the resulting loans", "Average principal per loan", "App crash rate", "Complaints"], "Bad primary (do not decide on it)": ["Clicks on 'Get the money'", "Signed contracts in total", "Conversion with no time window"]}, "why": "One primary with a numerator, a denominator and a window; guardrails with thresholds; clicks and totals move without meaning more good loans."}
```

### The unit of randomisation — user, session or loan

**What it is.** The **unit of randomisation** (*единица рандомизации*) is the thing that gets the coin flip: a **user**, a **session** or a **loan / application**. Choose the unit the primary metric counts, and the one that keeps each person's experience consistent.

| unit | fits | what breaks if it is the wrong one |
|---|---|---|
| **user** (our choice) | anything a person sees more than once; metrics per user | — |
| **session** | one-off pages with no memory (a search-results layout) | one person sees A on Monday and B on Tuesday; her sessions are not independent, so the test's n is inflated |
| **loan / application** | a rule applied once per application (a new cut-off, a new price) | one customer with two applications may get two prices — a fairness and complaint risk |

**How to write it.** One rule: **the unit of analysis equals the unit of randomisation.** Randomise users, count users — one row per user in the analysis table. Week 6 showed what happens otherwise: testing payments when the loan was the unit inflated z by a third.

**When you use it.** At design time, once per test. The choice fixes the denominator of every metric and the row of every table you analyse.

> ⚠️ **Watch out.** Interference: if B users can change A users' outcomes — a referral screen, a shared daily lending limit — A is no longer a clean control. Then randomise larger units: regions or time periods.

**Your turn.** A test randomises and analyses sessions, and people come back several times. What goes wrong?

```task
{"id": "w07d1-l3", "kind": "choice", "options": ["Nothing — more sessions give more power", "One person's sessions are counted as independent units, so n is inflated and the p-value is too small", "The hash stops working on sessions", "Conversion goes down"], "answer": 1, "explain": "Randomising and analysing sessions while the person comes back several times treats one person as several independent units. The test thinks it has more information than it has."}
```

### The minimum detectable effect (MDE)

**What it is.** The **minimum detectable effect** (*минимальный детектируемый эффект*, MDE) is the smallest true effect the test is built to find — with the chosen power, at the chosen α. It is a business number: the smallest lift worth a release. Say it two ways: **absolute** (points) and **relative** (% of the baseline).

**How to write it.**

```python
# today's 7-day conversion (Kamola's planning number)
baseline = 0.080
# +0.9 points: the smallest lift worth the release risk
mde_abs  = 0.009
# 8.9 %, 11.25 %
print(f"target {baseline + mde_abs:.1%}, relative lift {mde_abs / baseline:.2%}")
```

8.0 % → 8.9 % is +0.9 points absolute and +11.25 % relative. Both describe the same effect.

**When you use it.**
- Before the sample size: the MDE is its most powerful input (next subsection).
- When a result comes back flat: "the test could see +0.9; the interval excludes +0.9" is a finding.

> ⚠️ **Watch out.** Do not take the MDE from the lift you hope for (+30 %). A test planned for a hoped-for effect is too small to see the realistic one.

**Your turn.** Kamola says: "A 10 % relative lift on our 8.0 % is worth it." What is that MDE in points?

```task
{"id": "w07d1-l4", "kind": "number", "answer": 0.8, "dp": 1, "unit": "points", "hint": "Relative lift × baseline.", "model": "10 % × 8.0 % = 0.8 points: 8.0 → 8.8 %."}
```

### Sample size and duration — each input

**What it is.** The **sample size** (*объём выборки*) per arm comes from four inputs. The **duration** is that sample divided by your daily traffic, rounded up to whole weeks.

```pic
{"id": "w07d1-pic3", "title": "Halve the effect, quadruple the test", "caption": "Days the test needs at 1 000 offer viewers a day, for each MDE on top of 8.0 %. The plan's **+0.9 points** takes 30 days; +0.4 would take 148 — five months.", "chart": {"type": "bars", "labels": ["+0.4", "+0.5", "+0.9", "+1.2", "+1.6"], "values": [148, 95, 30, 17, 10], "hl": [2], "show": true, "note": "x: MDE, points · y: days at 1 000 viewers a day"}}
```

**How to write it.**

```python
from math import asin, sqrt, ceil
from statistics import NormalDist
z = NormalDist().inv_cdf                      # z(0.975) = 1.96, z(0.80) = 0.84

def n_per_arm(p1, p2, alpha=0.05, power=0.80, two_sided=True):
    """Users per arm to detect p1 -> p2 (Cohen's h: what statsmodels' zt_ind_solve_power returns)."""
    # the effect on the arcsine scale
    h = 2 * asin(sqrt(p2)) - 2 * asin(sqrt(p1))
    # how strict the "significant" line is
    z_a = z(1 - alpha / 2) if two_sided else z(1 - alpha)
    # how sure we want to be to cross it
    return 2 * ((z_a + z(power)) / h) ** 2

n = n_per_arm(0.080, 0.089)
# 14 982.2 -> 14 983
print(f"Cohen's h method: {n:.1f} -> {ceil(n)} users per arm")

p1, p2 = 0.080, 0.089
pbar = (p1 + p2) / 2
n_classic = (z(0.975) * sqrt(2 * pbar * (1 - pbar)) + z(0.80) * sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2 / (p2 - p1) ** 2
# 14 991.1 -> 14 992
print(f"classic formula:  {n_classic:.1f} -> {ceil(n_classic)}")
print(f"days at 1 000 viewers a day: {2 * ceil(n) / 1000:.0f}")    # 30
# In Jupyter with statsmodels:
# zt_ind_solve_power(effect_size=proportion_effectsize(0.089, 0.080),
# alpha=0.05, power=0.80)
```

14 983 users per arm — 29 966 viewers, 30 days at about 1 000 offer viewers a day. The classic formula gives 14 992: two methods, nine users apart. Name the one you used. Each input, moved one at a time:

| input | in the plan | moved to | users per arm |
|---|---|---|---|
| baseline p₁ (same +0.9 pt) | 8.0 % | 5 % · 12 % | 9 970 · 21 118 |
| MDE | +0.9 pt | +0.8 pt · +1.0 pt | 18 863 · 12 199 |
| α, two-sided | 5 % | 1 % | 22 294 |
| power | 80 % | 90 % | 20 057 |
| (all as planned) | | | **14 983** |

What the MDE costs, at 1 000 viewers a day:

| MDE (absolute) | relative | users per arm | days |
|---|---|---|---|
| +0.4 pt | 5.0 % | 73 844 | 148 |
| +0.5 pt | 6.2 % | 47 519 | 95 |
| +0.8 pt | 10.0 % | 18 863 | 38 |
| **+0.9 pt** | **11.2 %** | **14 983** | **30** |
| +1.2 pt | 15.0 % | 8 559 | 17 |
| +1.6 pt | 20.0 % | 4 912 | 10 |

```python
for mde in [0.004, 0.005, 0.008, 0.009, 0.012, 0.016]:
    n = ceil(n_per_arm(0.080, 0.080 + mde))
    print(f"+{mde * 100:.1f} pt   relative {mde / 0.080:5.1%}   {n:>7,} per arm   {2 * n / 1000:4.0f} days at 1 000/day")
```

**Duration rules** on top of the arithmetic:
1. Run **whole weeks** — weekday and weekend users differ, salary days differ. At least two weeks.
2. Never stop before the planned n.
3. If the duration is five months, the test is not feasible. Change the metric or the MDE, not the arithmetic.

Kamola's choice: **28 days**, about 14 000 per arm. That buys an MDE of +0.93 points and 77 % power for a true +0.9 — a trade written down before the start.

**When you use it.** Every test, before the start: it sets the dates. And after a flat result: was the test able to see the effect at all?

> 💡 **Key idea.** Halving the effect quadruples the sample. Choose the MDE from the business — the smallest lift worth a release — never from the lift you hope for.

**Your turn.** The risk team wants α = 1 % instead of 5 %. How many users per arm for 8.0 → 8.9 %, power 80 %?

```task
{"id": "w07d1-l5", "kind": "python", "starter": "from math import ceil\n# n_per_arm comes from the box above -- run it first\n# TODO: users per arm for 8.0 -> 8.9 % with alpha=0.01 (round up)\n", "answer": 22294, "dp": 0, "model": "ceil(n_per_arm(0.080, 0.089, alpha=0.01)) = 22 294 per arm — 49 % more than at 5 %, about 45 days at 1 000 viewers a day."}
```

### Randomisation and assignment — hashing the user id

**What it is.** **Randomisation** (*рандомизация*) decides each user's arm by chance. Production systems do not store a coin flip; they **compute** it. A **hash function** (*хеш-функция*) turns the text `salt + user_id` into a huge number; its remainder mod 2 is the arm.

```pic
{"id": "w07d1-pic2", "title": "The arm is computed: hash the salt and the id, take the remainder", "caption": "With the A/A test's salt, an even hash goes to A and an odd one to B: B, A, A, B, A, A, as the service logged them. Change the salt and the same users are drawn again — the highlighted cells changed arm.", "tables": [{"id": "aa", "name": "aa_users", "cols": ["user_id", "hash % 2", "variant"], "rows": [[925601, 1, "B"], [665666, 0, "A"], [652995, 0, "A"], [774155, 1, "B"], [376261, 0, "A"], [859393, 0, "A"]], "new": ["hash % 2"]}, {"id": "v2", "name": "result", "cols": ["user_id", "variant"], "rows": [[925601, "B"], [665666, "B"], [652995, "B"], [774155, "B"], [376261, "B"], [859393, "A"]], "cells": [[1, "variant"], [2, "variant"], [4, "variant"]], "via": "salt = offer_screen_v2"}]}
```

**How to write it.**

```python
import hashlib
def hash_variant(user_id, salt="offer_screen_v2"):
    # the hash, read as an integer
    h = int(hashlib.sha256(f"{salt}{user_id}".encode()).hexdigest(), 16)
    # even → A, odd → B
    return "A" if h % 2 == 0 else "B"

# B A A B A
print([hash_variant(u, "offer_screen_aa_2026_07") for u in [925601, 665666, 652995, 774155, 376261]])
# SQL Server: ABS(CHECKSUM(CONCAT('offer_screen_v2', user_id))) % 2
```

B, A, A, B, A — the first five A/A users, exactly as the experiment service logged them. Run the box twice: the same letters. Three properties make this work:

| property | what it means | why you need it |
|---|---|---|
| deterministic | the same id always gives the same arm | one user, one screen, on every visit and device |
| uniform | half the ids land in each arm, whatever they look like | the planned 50/50 |
| salted | the **salt** (*соль*) — the experiment's name — changes the mapping | users who were in B last time are not all in B again |

For an uneven split (90/10 for a risky change), read the hash as a number in [0, 1) and cut at 0.9.

**When you use it.** Every experiment. The hash also gives you a free check later: recompute each user's arm and compare it with the log (Day 2).

> ⚠️ **Watch out.** Re-using the previous test's salt puts the same users in B again. Their history follows them, and two tests run at once are perfectly correlated.

**Your turn.** Cut the A/A users 90/10 by the normalised hash. What share lands in B?

```task
{"id": "w07d1-l6", "kind": "python", "starter": "import hashlib\nimport pandas as pd\naa = pd.read_csv(\"data/ab/aa_users.csv\")\nsalt = \"offer_screen_aa_2026_07\"\nu01 = aa[\"user_id\"].map(lambda u: int(hashlib.sha256(f\"{salt}{u}\".encode()).hexdigest(), 16) / 2 ** 256)   # a number in [0, 1)\n# TODO: the share of users with u01 >= 0.9, in % (two decimals)\n", "answer": 9.82, "dp": 2, "model": "1 262 of 12 852 users: 9.82 % — close to the planned 10 %, as a uniform hash should be."}
```

### The sample-ratio mismatch (SRM) check

**What it is.** A **sample ratio mismatch** (*несоответствие соотношения выборок*, SRM) means the arms' sizes differ from the planned split by more than chance allows. It is the most common sign of a broken experiment: a redirect that loses B users, a client that crashes on one variant, a bug that re-assigns.

**How to write it.** A **chi-square goodness-of-fit** test against the planned shares:

```python
from math import sqrt
from statistics import NormalDist

def srm_pvalue(n_a, n_b, expected_share_b=0.5):
    """Chi-square goodness-of-fit for two groups (1 df): the same p as scipy.stats.chisquare."""
    n = n_a + n_b
    # the counts the plan expects
    e_a, e_b = n * (1 - expected_share_b), n * expected_share_b
    chi2 = (n_a - e_a) ** 2 / e_a + (n_b - e_b) ** 2 / e_b
    # with 1 df, chi2 is z squared
    return 2 * (1 - NormalDist().cdf(sqrt(chi2)))

# chi2 = 5.71, p = 0.017  -> look for the bug before reading anything
print(round(srm_pvalue(14200, 13800), 3))
print(round(srm_pvalue(14050, 13950), 2))  # chi2 = 0.36, p = 0.55   -> fine
# In Jupyter: scipy.stats.chisquare([14200, 13800], [14000, 14000]); Excel:
# =CHISQ.TEST({14200,13800},{14000,14000})
```

14 200 vs 13 800 is a 50.7 / 49.3 split of 28 000 users: p = 0.017, a split that chance produces less than twice in a hundred tests. 14 050 vs 13 950: p = 0.55, fine.

**When you use it.**
- The first number you look at, before any result.
- With two thresholds. **p < 0.001** is the automatic alarm that runs on every slice every day — strict, because it runs many times. A p of 0.017 on the one overall check does not trip it, but it is still far enough from 50/50 to look for the bug yourself.

> ⚠️ **Watch out.** An SRM is a bug to find, not a bias to correct. Do not reweight and do not drop users at random to get back to 50/50 — find where the users went, and do not read the result until you know.

**Your turn.** A test ends with 5 060 users in A and 4 940 in B (planned 50/50). What is the SRM p-value?

```task
{"id": "w07d1-l7", "kind": "number", "answer": 0.23, "dp": 2, "hint": "srm_pvalue(5060, 4940) in the box above.", "model": "chi2 = 1.44, p = 0.23: a 50.6 / 49.4 split of 10 000 users is well within chance. Still check it by slice (Day 2)."}
```

### The A/A test — test the system, not the screen

**What it is.** An **A/A test** (*A/A-тест*) splits users exactly as the real test will, shows both groups the **same** screen, and runs the planned analysis. Any "effect" it finds is the system's error. Nur ran one on 1–14 July 2026 (`data/ab/aa_users.csv`, `aa_events.csv`, salt `offer_screen_aa_2026_07`).

**How to write it.** Four checks — you compute them in HW 7.1:

| check | what you compute | "the system works" looks like |
|---|---|---|
| split | users per group, SRM p-value | a p-value far from the alarm |
| hash | each row's variant recomputed with `hash_variant` | every row matches its logged variant |
| metric | 7-day conversion per group | two rates that differ only by noise |
| test | B − A with its 95 % CI, z-test p | an interval that contains 0, p far from 0.05 |

One A/A run says little about a 5 % error rate. So re-split the same users at random 1 000 times and run the test each time. Ours: **4.0 %** of re-splits are "significant", and the p-values spread evenly from 0 to 1 — 92, 90, 110, 101, 115, 100, 99, 90, 101, 102 per tenth. The test keeps its 5 % promise on this data.

**When you use it.** Before the first experiment on a new system, and after any change to assignment or logging.

> ⚠️ **Watch out.** One A/A with p = 0.03 is not a failure: one run in twenty does that by chance. A failure repeats — an SRM, 15 % "wins" over re-splits, or events missing in one group.

**Your turn.** Re-splits of the A/A data come out "significant" 15 % of the time. What does that tell you?

```task
{"id": "w07d1-l8", "kind": "choice", "options": ["Nothing — 15 % is close enough to 5 %", "The test is wrong for this data, e.g. sessions counted as independent users: its 5 % promise does not hold", "B is better than A", "The salt must be changed"], "answer": 1, "explain": "Re-splits of an A/A test should be 'significant' about 5 % of the time. Three times that means the test's assumptions do not match the data — fix the analysis before the real test."}
```

### Novelty and learning effects

**What it is.** Users react to *change*, not only to the new screen. The **novelty effect** (*эффект новизны*): users click the new thing because it is new, and the lift fades within days. The **primacy effect** or learning effect (*эффект первичности*): returning users first resist the change, and the lift appears only after they learn it. Both make the first days unrepresentative.

**How to write it.** What a test reports is the average over its days. Suppose B's true lift is +2.0 points in week 1 and +0.5 afterwards:

```python
# novelty: big in week 1, small after
lift_by_day = [2.0] * 7 + [0.5] * 21
for days in (7, 14, 28):
    # 2.0 · 1.25 · 0.875
    print(days, "days:", round(sum(lift_by_day[:days]) / days, 3), "points")
```

A one-week test reports +2.0 — four times the lasting +0.5. Four weeks report +0.875, still above it.

**When you use it.** The design answers:
- run **whole weeks**, long enough for the first days to be a small part;
- plan a **daily lift chart** (B − A by day of assignment) and read it on Day 2;
- decide in the plan whether the first days are excluded;
- look at **new vs returning** users: new users have no habit to break.

> ⚠️ **Watch out.** Decide whether launch days are excluded before the test — never after you have seen whether they help or hurt.

**Your turn.** Change aversion: returning users' lift is −0.6 points in week 1 and +0.9 afterwards. What does a 14-day test report?

```task
{"id": "w07d1-l9", "kind": "number", "answer": 0.15, "dp": 2, "unit": "points", "hint": "(7 × −0.6 + 7 × 0.9) / 14.", "model": "(−4.2 + 6.3) / 14 = +0.15 points — the real +0.9 is hidden by the first week. A 28-day test would report (−4.2 + 21 × 0.9) / 28 = +0.53."}
```

### Peeking — why the end date is part of the design

**What it is.** **Peeking** (*подглядывание*) is looking at the p-value while the test runs and stopping at the first p < 0.05. A fixed-horizon test promises 5 % false positives **for one look at the planned n**. Every extra look is another chance for a null effect's wandering p-value to dip below 0.05.

**How to write it.** Simulate A/A tests (both arms 8 %, 500 users per arm a day, 28 days) and count false "wins" under each way of looking:

```python
import numpy as np
rng = np.random.default_rng(2026)
n_exp, days, per_day, p = 2000, 28, 500, 0.08
# cumulative conversions in A
conv_a = rng.binomial(per_day, p, size=(n_exp, days)).cumsum(axis=1)
# B has the same 8 %: an A/A test
conv_b = rng.binomial(per_day, p, size=(n_exp, days)).cumsum(axis=1)
# users per arm after each day
n = per_day * np.arange(1, days + 1)
pool = (conv_a + conv_b) / (2 * n)
z = (conv_b - conv_a) / n / np.sqrt(pool * (1 - pool) * 2 / n)
# "p < 0.05" on that day
sig = np.abs(z) > 1.96
# days 7, 14, 21, 28
weeks = [6, 13, 20, 27]
print(f"one look on day 28: {sig[:, -1].mean():.1%}")
print(f"weekly looks:       {sig[:, weeks].any(axis=1).mean():.1%}")
print(f"daily looks:        {sig.any(axis=1).mean():.1%}")
# p < 0.0182 at each look
print(f"weekly, Pocock:     {(np.abs(z[:, weeks]) > 2.361).any(axis=1).mean():.1%}")
first_win = sig.argmax(axis=1)[sig.any(axis=1)] + 1
print(f"median day of the first false win (daily looks): {np.median(first_win):.0f}")
```

This box runs 2 000 experiments; the notebook runs 5 000, so your shares may differ from the table by a point:

| how you look | A/A tests declared "significant" |
|---|---|
| once, on day 28 | **4.9 %** |
| every week, stop at p < 0.05 | **12.4 %** |
| every day, stop at p < 0.05 | **27.2 %** |
| every week, p < 0.0182 at each look (Pocock) | 4.8 % |

Daily looks turn a 5 % promise into 27 %: more than one null test in four "wins".

**When you use it.**
- Fix the sample size and the end date before the start, and read the result once.
- If the business must look early, choose a design built for it — **group-sequential** boundaries (Pocock: the same stricter threshold at each look; O'Brien–Fleming: very strict early, almost 0.05 at the end) — before the start.

> ⚠️ **Watch out.** A live p-value on a dashboard is for spotting bugs (SRM, crashes), never for the decision.

**Your turn.**

```game
{"type": "bug", "id": "w07d1-g2", "title": "Find the line that breaks the plan", "q": "Kamola's draft analysis plan. One line breaks the 5 % promise.", "code": "Primary: signed within 7 days of the first offer view, per assigned user\nSplit: 50/50, sha256(\"offer_screen_v2\" + user_id) mod 2\nSample: 14 983 users per arm, 1–28 August (four whole weeks)\nWe check the dashboard every morning and stop as soon as p < 0.05\nSRM alarm: p < 0.001, overall and by device and week\nDecision: ship if p < 0.05 and the FPD difference's upper 95 % bound < +1.25 pt", "answer": [3], "why": "Daily looks with a stop at the first p < 0.05 turn 5 % false wins into about 27 %. Fix the end date — or pre-register a sequential design (Pocock, O'Brien–Fleming)."}
```

### Pre-registration — the one-page test plan

**What it is.** **Pre-registration** (*предрегистрация*) is the test plan, written down and dated **before** the first user is assigned. It is the defence against every trap above at once: the metric chosen after the data, the segment that "worked", the extra week "because it was almost significant".

**How to write it.** One page, eight lines:

| Line | What goes in it |
|---|---|
| 1. Hypothesis | change → mechanism → measurable consequence |
| 2. Primary metric | numerator, denominator, window — and the code that computes it |
| 3. Guardrails | each with its definition and the threshold that stops a ship |
| 4. Unit and split | unit of randomisation; hash, salt, shares |
| 5. Sample size | baseline, MDE (absolute and relative), α, power, method → n per arm → days → dates |
| 6. Checks | A/A result; SRM alarm rule; novelty plan (daily lift, excluded days) |
| 7. Analysis plan | test, CI method, exclusions, segments (named, with the correction), the end date |
| 8. Decision rule | ship / do not ship / extend — written as conditions on the numbers |

The decision rule for the offer screen: *ship if the primary is significant at 5 % and the FPD difference's upper 95 % bound is below +1.25 points.* HW 7.1 is this page.

**When you use it.** Every test, before the start. On Day 2, every exclusion and every segment you report must already be on this page.

> 💡 **Key idea.** Write the metric, the n, the end date and the decision rule down before the first user is assigned. A plan written after the data can be bent to fit any result.

**Your turn.**

```game
{"type": "order", "id": "w07d1-g1", "title": "The design document, in order", "items": ["Hypothesis: change → mechanism → consequence", "Primary metric: one number, exact definition", "Guardrails: what must not get worse", "Unit of randomisation", "MDE, α, power → sample size → duration", "Analysis plan: test, exclusions, segments, stopping rule"], "why": "Each decision constrains the next: the metric fixes the unit, the unit and the MDE fix n, n fixes the dates — all written before any data."}
```

### Putting it together

One test, every decision of this section, in the order you make them:

| Decision | In this test |
|---|---|
| confounding | a concurrent random split, not September vs August |
| hypothesis | monthly payment + one button → more viewers sign within 7 days |
| metrics | primary: signed ≤ 7 days ÷ assigned · secondary: funnel steps · guardrail: FPD (+1.25 pt max) |
| unit | the user, assigned at the first offer view |
| MDE | +0.9 pt (8.0 → 8.9 %, +11 %) |
| sample size | 14 983 per arm → 30 days → 28 days chosen (power 77 %), 1–28 August |
| assignment | `sha256("offer_screen_v2" + user_id) mod 2` |
| checks | A/A in July passed · SRM alarm at p < 0.001 · daily lift chart for novelty |
| peeking | one look, on 28 August |
| plan | all of the above, dated, before 1 August |

**Your turn.** Each problem below is prevented by one decision. Match them.

```game
{"type": "sort", "id": "w07d1-g5", "title": "Which decision prevents it?", "q": "Put each problem under the design decision that prevents it.", "groups": {"A concurrent random control": ["September had a marketing push"], "The user as the unit": ["One person saw both screens on two visits"], "A fixed end date": ["The test was stopped on day 9 at p = 0.03"], "The SRM check": ["B lost 2 % of its users to a broken redirect"], "Whole weeks and a daily lift chart": ["The lift in week 1 was four times the lift in week 4"], "Pre-registration": ["The segment that 'worked' was chosen after the results"]}, "why": "Each trap of the day has its own guard; the pre-registration writes all of them down before the start."}
```

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ The design steps (problem, metrics, hypothesis, design, validity) — [A/B Testing in Data Science Interviews by a Google Data Scientist (DataInterview), 09:41](https://youtu.be/DUNk4GPZ9bw?t=581&end=694)
- ▶ Metrics, hypotheses, sample size, splitting users (RU) — [Самая ПОЛНАЯ и ПОНЯТНАЯ лекция по A/B тестам (Noukash), 04:45](https://youtu.be/FEI1OA-zgb8?t=285&end=498)
- ▶ Designing an A/B test with sample size and power (EN) — [Data Science Essentials - Crash Course in A/B Testing with Case Study (freeCodeCamp.org), 19:55](https://youtu.be/KZe0C0Qq4p0?t=1195&end=2276)
- ▶ Randomisation / user split — Noukash lecture, [24:42](https://youtu.be/FEI1OA-zgb8?t=1482&end=1638)
- ▶ SRM (sample ratio mismatch) — [Understanding SRM (Sample Ratio Mismatch) in A/B Testing (Lucia from The Initial)](https://youtu.be/sSi6h-PpXQI)
- ▶ Peeking — [Тонкости A/B тестирования: проблема подглядывания (Анатолий Карпов, karpov.courses)](https://youtu.be/jnFVmtaeSA0)
- ▶ A/A test / validity checks — DataInterview video, [12:32](https://youtu.be/DUNk4GPZ9bw?t=752&end=913)

- RU deck (TBC Data Analytics 2.0, if you have it) `6.1 Introduction.pdf` (lesson 6.1, Sanjar Khakimov, TBC): why A/B testing — asking clients vs testing pp. 4–6; examples pp. 7–10; definition p. 11; the **HADI** cycle (hypothesis → action → data → interpretation) pp. 12–16; what an experiment design contains (metric + MDE, criteria, split, A/A, simulated effect, power) pp. 18–21; metric types and relative vs absolute change pp. 23–26; how often and how long to test pp. 27–28; historical data and distributions pp. 29–31; MDE and minimum sample size pp. 32–33; the step-by-step approach (A/A → validate criteria → add effect → sample size) p. 34; reading results, and what an insignificant result means pp. 35–36.
- RU deck (TBC Data Analytics 2.0, if you have it) `6.2 A_B Testing.pdf`: hash functions pp. 4–7, salting a split pp. 8–9, uneven splits by normalised hash p. 10.
- Notebook `Lecture6.2 - Data Generation and Split.ipynb`: a synthetic user base (cell 4), the SHA-256 split function with a salt and group percentages (cells 7–11), visual homogeneity checks by group (cells 12–23), Kolmogorov–Smirnov and chi-square homogeneity tests (cells 24–28). Re-run its split function on `aa_users.csv` — it reproduces today's logic.
- *Russian terms:* A/B-тест = A/B test, контрольная / тестовая группа = control / treatment group, гипотеза = hypothesis, целевая (основная) метрика = primary metric, защитная (барьерная) метрика = guardrail metric, единица рандомизации = unit of randomisation, MDE = minimum detectable effect, мощность = power, объём выборки = sample size, хеш-функция = hash function, соль = salt, A/A-тест = A/A test, SRM (несоответствие соотношения выборок) = sample ratio mismatch, подглядывание = peeking, последовательное тестирование = sequential testing, эффект новизны = novelty effect, сетевой эффект = network effect, предрегистрация = pre-registration.

```videoquiz
{"video": "DUNk4GPZ9bw", "stops": [{"at": 615, "q": "In the interview framework, what do you settle before you design the experiment?", "options": ["Which segment will win", "The problem and the success metric", "The daily p-value threshold", "The dashboard layout"], "answer": 1, "explain": "First the business problem and the metric; unit, sample size and duration follow from them."}, {"at": 670, "q": "Why write the hypothesis down before the test starts?", "options": ["It makes the p-value smaller", "The hash function needs it", "So the result is checked against a prediction made in advance", "It is only for the slide"], "answer": 2, "explain": "A hypothesis fixed in advance is what stops the metric or the segment being chosen after the data."}, {"at": 800, "q": "What are validity (sanity) checks for?", "options": ["To check the experiment itself works — split, logging, invariant metrics — before reading the result", "To make the effect significant", "To pick the winning segment", "To end the test early"], "answer": 0, "explain": "They test the system, not the change — the same job as today's A/A test and SRM check.", "back": 60}, {"at": 880, "q": "Users per group (an invariant metric) differ far more than chance allows. What does it tell you?", "options": ["B is better", "Raise α", "The setup may be broken — investigate before reading any result", "Ignore it if the primary is significant"], "answer": 2, "explain": "That is a sample ratio mismatch: find the cause first."}]}
```

```videoquiz
{"video": "FEI1OA-zgb8", "stops": [{"at": 340, "q": "What has to be fixed before an A/B test starts?", "options": ["The metric, the hypothesis and the sample size", "Only the end date", "The winning variant", "Nothing — you decide after the data"], "answer": 0, "explain": "The design comes first: metric, hypothesis, MDE and n — today's six decisions."}, {"at": 450, "q": "What drives the sample size up most?", "options": ["A larger effect to detect", "A higher α", "A smaller effect you want to detect", "Fewer metrics"], "answer": 2, "explain": "n grows with the inverse square of the effect: half the MDE, four times the users."}, {"at": 1520, "q": "Why split users by a rule (a hash) rather than by hand?", "options": ["Hashes are faster to read", "The split is random, reproducible and the same user always gets the same group", "It guarantees B wins", "It removes the need for an A/A test"], "answer": 1, "explain": "Deterministic and uniform: the same user, the same screen, on every visit.", "back": 60}, {"at": 1600, "q": "What should the two groups look like after a good split?", "options": ["B has more active users", "A has the newer phones", "Alike in everything except the change", "Different sizes on purpose"], "answer": 2, "explain": "Comparable groups are the whole point: any difference beyond chance is then caused by the change."}]}
```

```videoquiz
{"video": "KZe0C0Qq4p0", "stops": [{"at": 1400, "q": "Which inputs does the sample-size calculation need?", "options": ["Baseline rate, MDE, α and power", "Only the baseline rate", "The result of the test", "The number of segments"], "answer": 0, "explain": "Baseline, smallest effect worth detecting, α and power — exactly what n_per_arm takes."}, {"at": 1750, "q": "What does 80 % power mean?", "options": ["80 % of users convert", "If the true effect equals the MDE, the test detects it 8 times out of 10", "The p-value will be 0.20", "B is better with 80 % probability"], "answer": 1, "explain": "Power is the chance of detecting an effect of the size you planned for."}, {"at": 2100, "q": "The computed duration is five months. What do you do?", "options": ["Run it and stop early if it looks good", "Change the arithmetic", "Rethink the metric or the MDE — the test as designed is not feasible", "Use a one-sided test silently"], "answer": 2, "explain": "Change the design, not the arithmetic — and never shorten it by peeking.", "back": 60}]}
```

```videoquiz
{"video": "sSi6h-PpXQI", "stops": [{"at": 120, "q": "What is a sample ratio mismatch?", "options": ["The groups' sizes differ from the planned split more than chance allows", "B has a higher conversion", "The test ran too long", "Too many metrics"], "answer": 0, "explain": "Planned 50/50, observed 50.7/49.3 on 28 000 users is already suspicious (p = 0.017)."}, {"at": 300, "q": "You find an SRM. What do you do?", "options": ["Reweight the groups to 50/50", "Read the result anyway", "Find the cause — redirects, crashes, bots, assignment bugs — before trusting the result", "Drop users at random"], "answer": 2, "explain": "An SRM is a bug to find, not a bias to correct.", "back": 60}]}
```

```videoquiz
{"video": "jnFVmtaeSA0", "stops": [{"at": 150, "q": "What is peeking?", "options": ["Looking at the results repeatedly and stopping when p < 0.05", "Checking the SRM daily", "Running an A/A test", "Reading the hypothesis"], "answer": 0, "explain": "Every extra look is another chance for a null effect to cross 0.05."}, {"at": 400, "q": "What happens to the false-positive rate if you peek every day?", "options": ["It stays at 5 %", "It goes down", "It grows well above 5 % — about 27 % in our 28-day simulation", "It becomes exactly 50 %"], "answer": 2, "explain": "Fix the end date, or pre-register a sequential design with stricter thresholds.", "back": 60}]}
```

---

## 2. Worked example — Kamola's answer, in numbers (15 min)

**Ask:** Kamola wants to ship the new screen on 1 September and compare September with August. Turn that into a test that can answer her — one decision per concept, in the order of section 1.

1. **Confounding — why not September vs August.** The app's approval rate moved 71.4 % → 67.9 % → 66.7 % over three months with no change at all. Seasonality, marketing and policy would all be credited to the screen. A concurrent random split answers in the same four weeks.
2. **Hypothesis.** A single button and the monthly payment in large type reduce hesitation, so more viewers sign within 7 days.
3. **Metrics.** Primary: signed within 7 days of the first offer view ÷ assigned users. Secondary: start, submit, approval and signing rates; principal per loan. Guardrail: FPD of the resulting loans, with a stop threshold of +1.25 points (the break-even in the Company corner).
4. **Unit of randomisation.** The user, assigned at the first offer view — she sees the screen many times and must always see the same one.
5. **MDE.** +0.9 points (8.0 → 8.9 %, +11 % relative): the smallest lift worth a release.
6. **Sample size and duration.** `n_per_arm(0.080, 0.089)` = 14 983 per arm → 30 days at ~1 000 viewers a day → four whole weeks, 1–28 August: about 14 000 per arm, power 77 %, accepted and written down.
7. **Assignment.** `sha256("offer_screen_v2" + user_id) mod 2` — deterministic, uniform, a new salt.
8. **SRM and A/A.** The July A/A passed (your HW 7.1 cell: split, hash, two rates, p-value; 4.0 % false positives over 1 000 re-splits). During the test an SRM alarm at p < 0.001, overall and by device and week.
9. **Novelty and peeking.** A daily lift chart; one look, on 28 August.
10. **Pre-registration.** All of it on one dated page:

| Decision | Choice | Why |
|---|---|---|
| unit | user (`user_id`), assigned at the first offer view | the screen is seen repeatedly; conversion is per user |
| split | 50/50, `sha256("offer_screen_v2" + user_id)` mod 2 | deterministic, salted |
| primary | signed within 7 days of assignment ÷ assigned users | one number, fixed window |
| guardrails | FPD on the resulting loans; average principal; crash rate | Company corner |
| α, power, MDE | 5 % two-sided, 80 %, +0.9 pt (8.0 → 8.9 %) | smallest lift worth a release |
| n, dates | 14 983 per arm → 1–28 August 2026 (four whole weeks, ~14 000 per arm, power 77 % — accepted) | traffic ~1 000/day |
| checks | A/A in July (passed); SRM daily with p < 0.001 alarm; daily lift chart for novelty | |
| decision rule | ship if primary p < 0.05 **and** the FPD difference's upper 95 % bound < +1.25 pt (break-even, Company corner) | written before the start |

**What goes back to Kamola**, in three sentences: *"Comparing September to August would mix the screen with everything else that changes between months — your own approval rate moved four points in a month with no change. Instead we show the new screen to a random half of app users for four weeks in August (about 14 000 per arm), which can detect a +0.9-point lift with 77 % power, and we decide on 28 August, not before. If conversion rises but first-payment defaults rise by more than 1.25 points, the screen loses money and we do not ship it as is."*

---

## 3. Practice (50 min)

Answer each question in the box under it. The ▶ Run boxes run Python right here, in the page, and see everything the Learn blocks above defined (`n_per_arm`, `hash_variant`, `srm_pvalue`, the peeking simulation) — run those blocks first. The notebook `day1_starter.ipynb` is for HW 7.1 (section 4); its Part 0 walks through the same steps if you prefer Jupyter.

**P1.** *(confounding)* Kamola's before/after idea. Name **four** things other than the screen that differ between August and September for app users, and use the table in section 1 to say how big a month-to-month change can be with no intervention.

```task
{"id": "w07d1-p1", "kind": "free", "min": 30, "rubric": ["names four factors other than the screen (season, marketing, product/policy, user mix)", "quotes a no-change swing from the table (−3.5 points July → August, 4.7 from July to September)", "says a +0.9-point effect would be lost in that noise"], "model": "Seasonality (school start, salary and holiday cycles), marketing (a campaign, an SMS blast, a partner promotion), product and policy (another app release, a scorecard cut-off change, a new price), and the user mix (more new users after a campaign; new users convert less). With no change, the app approval rate moved −3.5 points July → August (71.4 → 67.9 %) and the average Micro ticket swung from 2.59 m (June) to 2.90 m (July) and back to 2.59 m (August) — ±12 %. A +0.9-point screen effect is far inside that noise."}
```

**P2.** *(hypothesis, metrics)* Write the design's first three lines for the offer screen: hypothesis, primary metric (with its exact definition), two guardrails. Then a bad primary metric and why it is bad.

```task
{"id": "w07d1-p2", "kind": "free", "min": 40, "rubric": ["a hypothesis with change, mechanism and measurable consequence", "a primary with numerator, denominator and a 7-day window", "two guardrails, one of them FPD", "a bad primary (clicks, total contracts, no window) and why it is bad"], "model": "Hypothesis: a single button and the monthly payment in large type reduce hesitation, so more viewers sign. Primary: users with a contract_signed within 7 × 24 h of their first view_offer ÷ users assigned. Guardrails: FPD rate of the resulting loans (risk), average principal (revenue); also crash rate (quality). Bad primaries: clicks on the button (moves easily, may not become loans — a \"dark pattern\" wins), signed contracts in total (not a rate: more traffic in B by chance or by bug inflates it), conversion with no window (users assigned later have less time, and the arms may differ in timing)."}
```

**P3.** *(unit of randomisation)* For each change pick the unit — user, session or application — and one sentence why: (a) the offer screen; (b) a new interest-rate rule shown at the decision; (c) the order of products on the app's home screen for logged-out visitors; (d) an SMS reminder before the first due date (week 6).

```task
{"id": "w07d1-p3", "kind": "choice", "options": ["(a) session · (b) user · (c) user · (d) application", "(a) user · (b) application, all of one customer's applications in the same arm · (c) session or device cookie · (d) loan, hashed on customer_id", "(a) user · (b) session · (c) application · (d) user", "(a) application · (b) application · (c) session · (d) session"], "answer": 1, "explain": "(a) User — seen repeatedly; must be consistent. (b) Application, but with every application of the same customer forced into the same arm (hash the customer_id) — two prices for one person is a complaint and a fairness problem. (c) Session or a device cookie — no login, so no user id; accept the weaker consistency. (d) Loan (one SMS per loan; FPD is per loan) — but hashing customer_id again avoids one customer getting the SMS on one loan and not on another."}
```

**P4.** *(MDE, sample size)* Sample size with your `n_per_arm`: 8.0 → 8.9 % at 80 % and at 90 % power; one-sided at 80 %; and the days each needs at 1 000 users a day. When is the one-sided number legitimate?

```task
{"id": "w07d1-p4", "kind": "python", "starter": "from math import ceil\n# n_per_arm comes from the Learn block 'Sample size and duration' -- run it first\nfor power in (0.80, 0.90):\n    n = ceil(n_per_arm(0.080, 0.089, power=power))\n    print(power, n, round(2 * n / 1000, 1), \"days\")\n# TODO: the one-sided version at 80 % power (two_sided=False) -- print n and the days\n", "answer": 11802, "dp": 0, "model": "80 %: 14 983 per arm → 30.0 days. 90 %: 20 057 → 40.1 days. One-sided 80 %: 11 802 → 23.6 days. One-sided is legitimate only if \"B is worse\" and \"no difference\" lead to the same action (do not ship) and you wrote that down before the start — for a screen redesign that is arguable, but most teams keep two-sided so that a harmful screen is also detected, not just \"not shipped\"."}
```

**P5.** *(sample size, turned round)* Turn it round: with 28 days (~14 000 users per arm), what is the MDE, and what power does the test have for a true +0.9 point? With 10 000 per arm?

```task
{"id": "w07d1-p5", "kind": "python", "starter": "from math import asin, sqrt\nfrom statistics import NormalDist\nN = NormalDist()\n\ndef power_at(n, p1=0.080, p2=0.089, alpha=0.05):\n    h = 2 * asin(sqrt(p2)) - 2 * asin(sqrt(p1))\n    return N.cdf(abs(h) * sqrt(n / 2) - N.inv_cdf(1 - alpha / 2))\n\nprint(f\"14 000 per arm: power {power_at(14000):.1%}\")\n# TODO: the power with 10 000 per arm (print it in %)\n# TODO: the MDE at 14 000 -- try p2 = 0.0890, 0.0892, 0.0894 ... until the power reaches 80 %\n", "answer": 62.9, "dp": 1, "model": "14 000 per arm: MDE +0.93 pt (11.6 % relative), power for +0.9 pt 77.3 %. 10 000 per arm: MDE +1.11 pt (13.8 %), power for +0.9 pt 62.9 %. (NormalIndPower().power(h, nobs1=n, alpha=0.05), and a root-finder on the power for the MDE.) Four weeks is slightly short of 80 % — acceptable if written down; three weeks would not be."}
```

**P6.** *(randomisation by hash)* Hashing: compute `hash_variant` for the first five A/A users with the A/A salt and with the salt `"another_test"`. Check that all 12 852 A/A rows match their logged variant. Why must the salt change between experiments?

```task
{"id": "w07d1-p6", "kind": "python", "starter": "import pandas as pd\naa = pd.read_csv(\"data/ab/aa_users.csv\")\nfirst5 = aa[\"user_id\"].head()\n# hash_variant comes from the Learn block 'Randomisation by hashing'\nprint([hash_variant(u, \"offer_screen_aa_2026_07\") for u in first5])\nprint([hash_variant(u, \"another_test\") for u in first5])\n# TODO: recompute the variant of every row with the A/A salt and print how many rows match the logged variant\n", "answer": 12852, "dp": 0, "model": "With offer_screen_aa_2026_07: B, A, A, B, A (users 925601, 665666, 652995, 774155, 376261 — the notebook's table, which also shows the first 12 hex digits); with another_test: A, A, B, A, A. All 12 852 rows match. Without a new salt, every experiment would put the same users in B: their \"treated\" history (fatigue, earlier changes) would follow them, and two simultaneous tests would be perfectly correlated — the effects of the two could not be separated."}
```

**P7.** *(SRM)* SRM: your `srm_pvalue` for 14 200 vs 13 800, 14 050 vs 13 950, and 9 000 vs 1 000 for a planned 90/10 split. Which would you investigate, and what threshold do you use?

```task
{"id": "w07d1-p7", "kind": "python", "starter": "# srm_pvalue comes from the Learn block 'SRM'\n# TODO: print the p-value for 14 200 vs 13 800, for 14 050 vs 13 950,\n#       and for 9 000 vs 1 000 with expected_share_b=0.1 (three decimals)\n", "answer": 0.017, "dp": 3, "model": "0.017, 0.55, and 1.0 for 9 000 vs 1 000 (expected_share_b=0.1: exactly the plan). Investigate the first (a 50.7 / 49.3 split of 28 000 is unusual) — and with the usual production threshold of p < 0.001 it would not raise an automatic alarm, which is why you also check by day and segment (Day 2). The strict threshold exists because SRM checks are run many times; the response to an alarm is not a correction but a search for the bug."}
```

**P8.** *(A/A test)* The A/A check itself is HW 7.1 (section 4). Here, read the 1 000 re-splits in section 1 ("The A/A test"): 4.0 % false positives and flat deciles. Which of these would tell you that an A/A test — the system — has failed?

```task
{"id": "w07d1-p9", "kind": "multi", "options": ["SRM p < 0.001 on the split", "One A/A run with p = 0.03 that disappears on a re-split", "Re-splits 'significant' 15 % of the time instead of about 5 %", "One arm has no contract_signed events after a release", "p-values of 1 000 re-splits spread evenly from 0 to 1"], "answer": [0, 2, 3], "explain": "Re-splits: 4.0 % below 0.05; deciles 92, 90, 110, 101, 115, 100, 99, 90, 101, 102 (flat) — the test behaves on this data. Your own A/A cell should show the same shape as the table in section 1: an SRM p far from the alarm, every row matching the hash, two close rates, an interval of the difference that contains 0. Failing: an SRM (p < 0.001), a \"significant\" A/A difference that repeats on a re-run, a re-split false-positive rate well above 5 % (the test is wrong for the data, e.g. sessions counted as independent users), or one arm missing events (a logging bug)."}
```

> 🚀 **Stretch (optional, +5 XP).** **P9.** *(novelty)* Novelty arithmetic. Suppose B's true lift is **+3.4 points** on days 1–3 (novelty) and **+0.9** afterwards, with equal traffic every day and A at 8.0 %. What lift would a test that stops after 7 days report? After 14 and 28? What does that say about "we saw a big win in the first week, let us ship"?

```task
{"id": "w07d1-p10", "kind": "number", "answer": 1.17, "dp": 2, "unit": "points", "hint": "Enter the 28-day lift: (3 × 3.4 + 25 × 0.9) / 28.", "xp": 2, "model": "7 days: (3 × 3.4 + 4 × 0.9) / 7 = +1.97 pt (+24.6 % relative). 14 days: (10.2 + 11 × 0.9) / 14 = +1.44 pt. 28 days: (10.2 + 25 × 0.9) / 28 = +1.17 pt — and still above the steady +0.9. A first-week result overstates a novelty-driven change by more than double; the cure is whole weeks, the daily lift chart, and an analysis that excludes the novelty days (or reads only the last weeks) — decided in the pre-registration. (Day 2 will find exactly this pattern in the real data.)"}
```

**P10.** *(peeking)* Run the peeking simulation (the code block in section 1, "Peeking"). Report the false-positive rate for one look, weekly looks and daily looks, and the day on which half of the daily-peeking "wins" have already been declared.

```task
{"id": "w07d1-p8", "kind": "choice", "options": ["about 5 %", "about 12 %", "about 27 %", "about 50 %"], "answer": 2, "explain": "One look 4.9 %; weekly 12.4 %; daily 27.2 % — a null screen \"wins\" in more than one test in four. Half of the daily-peeking false wins are declared by day 6 (median first crossing), when the sample is smallest and the p-value most volatile; 15.9 % of all A/A runs have a false win within the first week. With Pocock's 0.0182 at four weekly looks the rate is back to 4.8 %."}
```

**P11.** *(pre-registration)* Which of these must be written in the plan **before** the first user is assigned? Tick every one.

```task
{"id": "w07d1-p11", "kind": "multi", "options": ["The primary metric with its window", "The planned n and the end date", "The segments you will report, with the correction", "Whether the launch days are excluded", "The segment that showed the biggest lift", "The decision rule as conditions on the numbers"], "answer": [0, 1, 2, 3, 5], "explain": "Everything that can be bent after seeing the data goes in the plan first: the metric, n and end date, the segments, the exclusions, the decision rule. 'The segment with the biggest lift' can only be known afterwards — choosing it then is exactly what pre-registration prevents."}
```

### Mistakes people make

- Before/after comparisons presented as "the effect" of a change.
- Choosing the primary metric after seeing the results — or keeping five "primaries" and reporting the one that moved.
- Randomising sessions and analysing users (or the reverse); counting payments when loans were randomised.
- No guardrail on risk: a conversion win shipped that raises first-payment defaults.
- A sample size computed for the hoped-for effect (+30 %) instead of the smallest worth acting on.
- Stopping on the first day the dashboard shows p < 0.05; extending "one more week" because it is almost significant.
- Ignoring an SRM because "it is only 50.7 / 49.3".
- Re-using the previous experiment's salt.
- Running a test for 9 days (a week and two weekend days) — weekday mix differs between arms' exposure periods.
- No A/A test before the first experiment on a new system.

---

## 4. Homework <span class="badge hw">HW 7.1 — Due Day 3</span>

**The pre-registration for the offer-screen test.** Hand in with the 📎 box below:

1. `experiment_design.md` — one page, using the template below, filled for Kamola's test (your own wording; the worked example is a model, not a text to copy).
2. `day1_starter.ipynb` — executed (Kernel → Restart & Run All, then save) with the five TODO functions passing their asserts, the sample-size cell, and the **A/A check** cell printing the split, the SRM p, the conversion per group, the difference with its CI and the p-value.

```markdown
# Experiment design — new loan-offer screen        (date, author)
1. Hypothesis: change → mechanism → measurable consequence
2. Primary metric: exact definition (numerator, denominator, window), the code that computes it
3. Guardrails: each with its definition and the threshold that stops a ship
4. Unit of randomisation and assignment rule (hash, salt, split)
5. Sample size: baseline, MDE (absolute and relative), alpha, power, method → n per arm; traffic → days; dates
6. Checks: A/A result (split, SRM p, difference, p); SRM monitoring rule; novelty plan
7. Analysis plan: test, CI method, exclusions, segments (named, with the correction), stopping rule
8. Decision rule: ship / do not ship / extend — written as conditions on the numbers

```

**Check your numbers before you hand in.** The site checks these four; your notebook must print the same.

**H1.** Users per arm for 8.0 → 8.9 %, α = 5 % two-sided, power 80 %, with Cohen's h (the statsmodels method).

```task
{"id": "w07d1-h1", "kind": "number", "answer": 14983, "dp": 0, "unit": "users per arm", "hint": "Round UP; the classic formula gives 14 992 — the box wants the Cohen's h number.", "model": "n_per_arm(0.080, 0.089) = 14 982.2 → 14 983 users per arm (classic formula: 14 991.1 → 14 992). Name the method you used in experiment_design.md."}
```

**H2.** The A/A split: users in A and B and the SRM p-value of the planned 50/50.

```task
{"id": "w07d1-h2", "kind": "python", "starter": "import pandas as pd\naa = pd.read_csv(\"data/ab/aa_users.csv\", parse_dates=[\"assigned_at\"])\nprint(aa[\"variant\"].value_counts())\n# TODO: the SRM p-value with srm_pvalue (Learn, 'SRM'), two decimals\n", "answer": 0.79, "dp": 2, "model": "A 6 411, B 6 441: srm_pvalue(6411, 6441) = 0.79 — far from any alarm."}
```

**H3.** The A/A conversion within 7 days per group (`contract_signed` within 7 × 24 h of `assigned_at`), in %.

```task
{"id": "w07d1-h3", "kind": "python", "starter": "ev = pd.read_csv(\"data/ab/aa_events.csv\", parse_dates=[\"event_time\"])\nsigned = ev[ev[\"event_name\"] == \"contract_signed\"].merge(aa[[\"user_id\", \"assigned_at\"]], on=\"user_id\")\nok = signed[(signed[\"event_time\"] >= signed[\"assigned_at\"]) &\n            (signed[\"event_time\"] <= signed[\"assigned_at\"] + pd.Timedelta(days=7))]\naa[\"conv\"] = aa[\"user_id\"].isin(ok[\"user_id\"]).astype(int)\n# TODO: conversion per variant in %, two decimals (A first)\n", "answer": 8.2, "dp": 2, "model": "A 526 / 6 411 = 8.20 %, B 527 / 6 441 = 8.18 % — two rates that differ only by noise."}
```

**H4.** The two-proportion z-test of B − A on the A/A data: the p-value.

```task
{"id": "w07d1-h4", "kind": "python", "starter": "from math import sqrt\nfrom statistics import NormalDist\nk = aa.groupby(\"variant\")[\"conv\"].agg([\"sum\", \"size\"])\nkA, nA, kB, nB = k.loc[\"A\", \"sum\"], k.loc[\"A\", \"size\"], k.loc[\"B\", \"sum\"], k.loc[\"B\", \"size\"]\n# TODO: pooled rate, z = (pB - pA) / sqrt(pool * (1 - pool) * (1/nA + 1/nB)), two-sided p (two decimals)\n", "answer": 0.96, "dp": 2, "model": "Difference −0.02 points (95 % CI −0.97 to +0.93), z = −0.05, p = 0.96: the interval contains 0, the p-value is far from 0.05 — the system works, for July."}
```

### 📎 Hand in here

```sqltask
{"check": "handin-W7D1", "lesson": "W7D1", "title": "HW 7.1", "tasks": [{"id": "experiment_design.md", "file": "experiment_design.md", "text": true, "minLines": 3, "q": "Write `experiment_design.md` here — what the page above asks for."}, {"id": "day1_starter.ipynb", "file": "day1_starter.ipynb", "names": ["day1_starter.ipynb"], "upload": true, "accept": ".ipynb", "q": "Attach `day1_starter.ipynb` — what the page above asks for."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else the page lists (one more file, or a .zip of several)."}], "why": "A design written after the data can be bent to fit any result. This one is dated before the first user is assigned, and the A/A numbers prove that the split, the logging and the test work.", "graded": ["Every number traceable: n per arm (14 983 or 14 992, method named), the A/A numbers matching the notebook and the checks above", "A guardrail with a quantified stop threshold and a reason (Company corner)", "A decision rule written as conditions someone else could apply without you", "The notebook runs top to bottom (Restart & Run All) with the five TODO functions passing their asserts"]}
```

---

## 5. Self-check

```check
{"id": "w07d1-sc", "questions": [{"type": "multi", "q": "Kamola: 'The test showed p = 0.03 on day 9, so we can stop.' Which are reasons not to?", "options": ["Stopping at the first p < 0.05 inflates false wins (peeking)", "Day 9 is before the planned n and not a whole number of weeks", "p = 0.03 is not below 0.05", "The first days may carry a novelty effect"], "answer": [0, 1, 3], "explain": "The 5 % promise holds for one look at the planned n; daily looks give about 27 % false wins (→ 'Peeking', 'Sample size and duration')."}, {"type": "single", "q": "A 50/50 experiment ends with 50.8 % of about 28 000 users in B. What do you do first?", "options": ["Reweight B down to 50 %", "Run the SRM test overall and by slice and look for the bug before reading the result", "Read the result — 0.8 points is nothing", "Drop B users at random until it is 50/50"], "answer": 1, "explain": "An SRM is a bug to find, not a bias to correct (→ 'SRM', P7)."}, {"type": "single", "q": "You randomise the offer screen by user but analyse sessions. What happens to the z-test?", "options": ["Nothing — more sessions give more power", "One person's sessions are not independent, so n is inflated and the p-value too small", "The hash stops working", "Conversion falls"], "answer": 1, "explain": "The unit of analysis must equal the unit of randomisation (→ 'The unit of randomisation', P3)."}]}
```

---

## 6. Company corner <span class="badge company">Guardrails in lending</span>

In e-commerce a conversion win is almost always money. In lending it is money **only if the extra borrowers repay**: a screen that makes borrowing easier can attract exactly the marginal users the scorecard approves with hesitation. So the offer-screen test has two questions — *more loans?* and *worse loans?* — and the answer to the second can cancel the first.

**A simple unit-economics formula** (per 1 000 offer viewers). Week 6's expected loss, EL = PD × LGD × EAD, with three simplifications for a short Micro loan: a loan with a first-payment default is treated as defaulted (PD ≈ FPD), EAD ≈ the principal, and every other loan pays its interest in full.

```
profit per 1 000 viewers
  = 1 000 × conversion
    × [ (1 − FPD) × I − FPD × LGD × P ]

Nur Micro:
  P = 2 705 586
    average principal
  I = 266 662
    interest over the life of a
    repaid loan
  LGD = 60 %
  → loss L = 1 623 352
```

| Scenario | conversion | FPD | profit per loan | profit per 1 000 viewers |
|---|---|---|---|---|
| A — today | 8.0 % | 1.7 % | 234 532 | **18 762 542** |
| B — more loans, same quality | 8.9 % | 1.7 % | 234 532 | 20 873 327 (+11.2 %) |
| B — more loans, FPD +0.5 pt | 8.9 % | 2.2 % | 225 082 | 20 032 271 (+6.8 %) |
| B — more loans, FPD +1.3 pt | 8.9 % | 3.0 % | 209 962 | **18 686 582 (−0.4 %)** |

**Break-even FPD for B** — solve profit_B = profit_A for FPD_B:

```
FPD_B* = ( I − (conv_A / conv_B)
           × (I − FPD_A × (I + L)) )
         / (I + L)
       = 2.95 %
→ B may raise FPD by at most
  +1.25 points
```

So **+0.9 points of conversion is worth +1.25 points of FPD** on Micro loans — and not more. Two lessons for the design: (1) the guardrail needs a **number** (the stop threshold is break-even, written in the pre-registration), not "FPD should not get worse"; (2) the guardrail test will be weak — about 1 100 loans per arm, FPD around 2 % — so the decision will rest on the **confidence interval's upper bound** compared with +1.25, not on a p-value. A risky change gets a staged rollout and an FPD watch even after "ship".

Where the simple formula is too simple (say so in the readout): FPD is not PD (some FPD loans cure, some non-FPD loans default later); interest is earned over months, so a time value applies; the funding cost and the cost of acquiring and servicing a loan are left out (they make each loan worth less and the break-even FPD lower); and a more careful bank would use the risk team's PD for the segments B attracts.

```game
{"type": "sort", "id": "w07d1-g4", "title": "More money than A, or less?", "q": "Screen B lifts conversion from 8.0 % to 8.9 %; A's FPD is 1.7 %. Sort each FPD outcome for B.", "groups": {"B earns more than A": ["B's FPD 1.7 % (unchanged)", "B's FPD 2.2 %", "B's FPD 2.9 %"], "B earns less than A": ["B's FPD 3.0 %", "B's FPD 3.5 %"]}, "why": "Break-even is FPD 2.95 % (+1.25 points over A): below it the extra loans pay for their losses, above it they do not."}
```

> 🎯 **Interview version.** *"Your test raised loan conversion by 11 %. Ship it?"* — Only after the guardrails: the new loans' early-default rate (FPD) and size. Translate both into money per viewer — interest on good loans minus PD × LGD × EAD on bad ones — find the break-even FPD increase (here about +1.25 points), and compare it with the upper end of the FPD difference's confidence interval; if the interval cannot exclude a loss, ship in stages with the guardrail monitored.

**Say it like in an interview.** *"Your test raised loan conversion by 11 %. Ship it?"* Answer in three to five sentences, with the numbers from today.

```task
{"id": "w07d1-ci", "kind": "free", "min": 30, "model": "Only after the guardrails. Conversion is money in lending only if the extra borrowers repay, so I would look at the first-payment-default rate and the size of the new loans. I would turn both into money per viewer — interest on the good loans minus PD × LGD × EAD on the bad ones — and find the break-even: here +0.9 points of conversion pays for at most +1.25 points of FPD. Then I compare that with the upper end of the FPD difference's confidence interval; if the interval cannot exclude a loss, I ship in stages with the guardrail monitored and a hold-out kept.", "rubric": ["checks the guardrails before shipping (FPD, loan size)", "turns them into money per viewer (interest minus PD × LGD × EAD)", "names a break-even FPD increase (about +1.25 points)", "compares it with the upper end of the FPD confidence interval and stages the rollout if a loss cannot be excluded"]}
```

Tomorrow: the data is in — 27 974 user rows, 67 215 events, 2 583 loans. Before the first z-test, three checks that every experiment deserves.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w07d1", "pass": 0.8, "questions": [
  {"type": "single", "q": "Why can 'September vs August' not tell Kamola whether the new screen works?", "options": ["The months have different lengths", "It can, if the change is large", "September has fewer users", "It changes two things at once — the screen and the calendar (season, marketing, policy, user mix)"], "answer": 3, "explain": "The app's approval rate moved four points between months with no change at all; a concurrent random control removes the calendar (→ section 1, 'Why September vs August is not an experiment')."},
  {"type": "single", "q": "For the offer screen you randomise by user. What breaks if you randomise and analyse sessions?", "options": ["Conversion becomes higher", "The hash cannot handle session ids", "Nothing — sessions are more numerous", "One person sees both screens, and her sessions are not independent, so the z-test's n is inflated"], "answer": 3, "explain": "The unit of analysis must equal the unit of randomisation (→ section 1, 'The unit of randomisation', P3)."},
  {"type": "single", "q": "The planned split is 50/50. What do you do with this result?", "code": "stats.chisquare([14200, 13800], [14000, 14000])   # p = 0.017", "options": ["Treat it as a sign of a broken split: look for the bug by day, device and segment before trusting any result", "Reweight B to 50 %", "Read the result — 50.7 / 49.3 is close enough", "Remove 400 users from A at random"], "answer": 0, "explain": "An SRM is not a bias to correct but a bug to find; check it overall and by slice (→ section 1, 'The sample-ratio mismatch (SRM) check', P7)."},
  {"type": "single", "q": "Why must the salt change between experiments?", "code": "def hash_variant(user_id, salt=\"offer_screen_v2\"):\n    h = int(hashlib.sha256(f\"{salt}{user_id}\".encode()).hexdigest(), 16)\n    return \"A\" if h % 2 == 0 else \"B\"", "options": ["SHA-256 runs out of values", "The salt encrypts the user id", "With the same salt the same users land in B every time — their history follows them and two tests are perfectly correlated", "To make the split exactly 50/50"], "answer": 2, "explain": "The salt (the experiment name) makes assignments independent across experiments (→ section 1, 'Randomisation and assignment', P6)."},
  {"type": "single", "q": "You halve the MDE (from +0.9 to +0.45 points). The sample size per arm becomes about…", "options": ["twice as large", "half as large", "the same", "four times as large"], "answer": 3, "explain": "n grows with the inverse square of the effect: halving the effect quadruples the sample (→ section 1, 'Sample size and duration')."},
  {"type": "multi", "q": "Which ways of looking keep an A/A test's false-positive rate near 5 %?", "options": ["One look at the planned n on the planned end date", "A live dashboard p-value used for the decision", "Four weekly looks with Pocock's p < 0.0182 at each, decided before the start", "O'Brien–Fleming boundaries decided before the start", "Weekly looks, stopping at the first p < 0.05"], "answer": [0, 2, 3], "explain": "Daily looks gave 27 % false wins, weekly 12 %; sequential boundaries chosen in advance bring it back to about 5 % (→ section 1, 'Peeking')."},
  {"type": "number", "q": "B's true lift is +3.4 points on days 1–3 (novelty) and +0.9 afterwards, with equal traffic each day. What lift does a test that stops after 7 days report, in points?", "answer": 1.97, "tol": 0.02, "explain": "(3 × 3.4 + 4 × 0.9) / 7 = 1.97 — more than double the steady +0.9; run whole weeks and plan a daily lift chart (→ P9)."},
  {"type": "single", "q": "Company corner: why does the guardrail decision rest on the FPD difference's confidence interval rather than its p-value?", "options": ["The CI is always narrower", "With about 1 100 loans per arm the FPD test is weak; you compare the CI's upper bound with the break-even increase (+1.25 points)", "Risk teams do not read p-values", "p-values do not exist for FPD"], "answer": 1, "explain": "A guardrail needs a number — the break-even written in the pre-registration — and a weak test cannot clear it by 'not significant' (→ Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w07d1", "q": "Kamola is nervous about the release and asks for a 90/10 split: only 10 % of viewers see screen B. Keep the rest of the design (8.0 → 8.9 %, Cohen's h, α 5 % two-sided, power 80 %). Solve for the B arm's size with zt_ind_solve_power (ratio = A users per B user = 9), round it UP to a whole user, give A nine times as many, and convert the total into days at 1 000 offer viewers a day. How many days? Give the number to 1 decimal.", "type": "number", "dp": 1, "h": ["4a82a9eb91e6ec2eebb6b2d5"], "hint": "In statsmodels nobs1 is the first group and ratio = nobs2 / nobs1; make the small arm the first group.", "sol": "ZnJvbSBzdGF0c21vZGVscy5zdGF0cy5wcm9wb3J0aW9uIGltcG9ydCBwcm9wb3J0aW9uX2VmZmVjdHNpemUKZnJvbSBzdGF0c21vZGVscy5zdGF0cy5wb3dlciBpbXBvcnQgenRfaW5kX3NvbHZlX3Bvd2VyLCBOb3JtYWxJbmRQb3dlcgpoID0gcHJvcG9ydGlvbl9lZmZlY3RzaXplKDAuMDg5LCAwLjA4MCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIDAuMDMyMzcKbl9iID0genRfaW5kX3NvbHZlX3Bvd2VyKGVmZmVjdF9zaXplPWgsIGFscGhhPTAuMDUsIHBvd2VyPTAuODAsIHJhdGlvPTkpICAgIyA4IDMyMy40IOKGkiA4IDMyNCBCIHVzZXJzCnRvdGFsID0gODMyNCAqIDEwICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgODMgMjQwIHZpZXdlcnMgKDc0IDkxNiBpbiBBKQp0b3RhbCAvIDEwMDAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIDgzLjIgZGF5cwojIGNoZWNrOiBOb3JtYWxJbmRQb3dlcigpLnBvd2VyKGgsIG5vYnMxPTgzMjQsIGFscGhhPTAuMDUsIHJhdGlvPTkpIOKGkiAwLjgwMAoKODMuMiBkYXlzIOKAlCBhbG1vc3QgdGhyZWUgbW9udGhzLCBhZ2FpbnN0IDMwIGRheXMgZm9yIHRoZSA1MC81MCBkZXNpZ24gKDE0IDk4MyBwZXIgYXJtLCAyOSA5NjYgdmlld2VycykuClRoZSBzbWFsbCBhcm0gc2V0cyB0aGUgcHJlY2lzaW9uLCBzbyBhIDkwLzEwIHNwbGl0IG5lZWRzIDIuOCB0aW1lcyB0aGUgdHJhZmZpYzogc2FmZXR5IGJvdWdodCB3aXRoIHRpbWUuClRoZSB1c3VhbCBjb21wcm9taXNlIGlzIGEgc2hvcnQgc3RhZ2VkIHJhbXAgKGEgZmV3IGRheXMgYXQgMTAgJSB0byBjYXRjaCBjcmFzaGVzIGFuZCBTUk0pIGZvbGxvd2VkIGJ5IHRoZSA1MC81MCB0ZXN0LCB3aXRoIHRoZSByYW1wIGRheXMgZXhjbHVkZWQgZnJvbSB0aGUgYW5hbHlzaXMg4oCUIHdyaXR0ZW4gaW4gdGhlIHByZS1yZWdpc3RyYXRpb24u", "python": true}
```

<!-- challenge:end -->
