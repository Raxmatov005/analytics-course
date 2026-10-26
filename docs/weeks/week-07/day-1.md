# Week 7 · Day 1 — Designing an A/B test: before you touch the data

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 7.1 (due Day 3)</span> <span class="badge company">Company corner</span>

> STORY **Monday, 9:00.** A new face at the analytics desk: **Kamola**, product manager (*продакт-менеджер*) for the Nur app, with a phone showing two versions of the loan-offer screen. *"We redesigned the offer screen — the amount slider, the monthly payment in big letters, one button instead of three. Users love it in the interviews. **Can we just ship it on 1 September and compare September to August?** If conversion goes up, the design worked."* Madina, before you can answer: *"Last week you told Jasur that 2 000 loans cannot test an SMS. Tell Kamola what can test a screen."* Nilufar, passing: *"And if the new screen sells more loans to people who do not pay the first instalment, I want to know before it is in everyone's pocket."*

## Today in 3 lines

- Why a **randomised experiment** beats "September vs August": the only thing that differs between the groups is the screen. The design comes first — **hypothesis, primary metric, guardrails** (FPD!), **unit of randomisation**, **MDE, power, sample size and duration** with week 6's tools — you will work out how many users per arm the offer-screen test needs and how many days of app traffic that is.
- How the split is made — **hashing the user id with a salt** — and the two checks that catch a broken split before anyone reads a result: the **A/A test** and the **SRM chi-square** — you run both on our A/A data.
- The traps that are decided at design time: **peeking** (a look every day turns 5 % into **27 %** false wins), **novelty / primacy**, interference, and the **pre-registration** document that HW 7.1 asks you to write.

---

## 1. Learn — the experiment is designed, not found

### Why "September vs August" cannot answer Kamola

A **before/after comparison** (*сравнение до/после*) changes two things at once: the screen and the calendar. Everything else that moved between August and September is mixed into the answer — salary days, school fees, a marketing push, an app release, the approval policy, the mix of new and returning users. Nur's own app channel, with **no** screen change at all, moved like this in 2026:

| applied in | app applications | decided | approved | approval rate |
|---|---|---|---|---|
| June | 236 | 204 | 141 | 69.1 % |
| July | 242 | 196 | 140 | **71.4 %** |
| August | 235 | 193 | 131 | 67.9 % |
| September | 224 | 192 | 128 | **66.7 %** |

Four points between two neighbouring months, from nothing. A new screen that adds one point would be invisible in that noise — or a seasonal dip would be blamed on it. An **A/B test** (*A/B-тест*) removes the calendar: during the same days, a random half of users sees the current screen (**control**, A, *контрольная группа*) and the other half the new one (**treatment**, B, *тестовая группа*). Because the split is random, the halves are alike in everything — device, region, salary day, mood — except the screen. Any difference beyond chance is caused by the screen. That is the whole idea; the rest of the day is how not to break it.

### The design document — six decisions before any data

1. **Hypothesis** (*гипотеза*) — a change, a mechanism and a measurable consequence: *"Showing the monthly payment instead of the rate and a single 'Get the money' button reduces hesitation, so more users who open the offer sign a contract."*
2. **Primary metric** (*целевая / основная метрика*) — **one** number the decision is based on. Here: **conversion from first offer view to signed contract within 7 days**, per assigned user. Why 7 days: in the July A/A run 85 % of signings came within two days of the first view and 94 % within seven; a fixed window treats a user who arrived on 28 August the same as one from 1 August.
3. **Guardrail metrics** (*защитные метрики*) — numbers that must **not** get worse, even if the primary improves: **FPD** (first-payment default — week 2's flag on the first instalment), average principal (smaller loans = less interest), app crash rate, complaints. In lending the guardrail is not decoration: a screen that persuades marginal borrowers raises conversion **and** losses (Company corner).
4. **Unit of randomisation** (*единица рандомизации*) — what gets a coin flip: the **user**, the **session**, or the **loan**. Use the unit the metric is defined on and the one that keeps the experience consistent (below).
5. **MDE, α, power → sample size → duration** — week 6, Day 4, unchanged.
6. **Analysis plan** — the test (two-proportion z-test), α = 5 % two-sided, the window, what gets excluded and why, the segments you will look at (few, named in advance), the stopping rule (a fixed end date).

### The unit: user, session or loan

| Unit | When it fits | What breaks if you choose it wrongly |
|---|---|---|
| **user** (our choice) | anything a person sees more than once; metrics per user (conversion, FPD per user's loan) | — |
| **session** | one-off pages with no memory (a search-results layout) | the same person sees A on Monday and B on Tuesday: confusion, and her sessions are not independent — the z-test's n is inflated |
| **loan / application** | a decision rule applied once per application (a new cut-off, a new price) | a customer with two applications could get two different prices — a fairness and complaint risk |

Rule: the unit of **analysis** must equal the unit of **randomisation** (week 6, P9: testing payments when the loan was the unit inflated z by a third). If you randomise users, you count users.

### Sample size and duration

Baseline: Kamola's planning number is **8.0 %** converted within 7 days (HW 7.1 checks it against the July A/A run). Smallest effect worth acting on (MDE, *минимальный детектируемый эффект*): **+0.9 points** (8.0 → 8.9 %, +11 % relative) — below that the screen is not worth the release risk. α = 5 % two-sided, power 80 %:

```python
from statsmodels.stats.proportion import proportion_effectsize
from statsmodels.stats.power import zt_ind_solve_power
h = proportion_effectsize(0.089, 0.080)                          # Cohen's h = 0.03237
zt_ind_solve_power(effect_size=h, alpha=0.05, power=0.80)        # 14 982.2 -> 14 983 users per arm
# classic formula: n = (z_a·√(2·p̄(1−p̄)) + z_b·√(p1(1−p1) + p2(1−p2)))² / (p2 − p1)²  -> 14 991.1 -> 14 992
```

Two methods, nine users apart — either is fine; name the one you used. **29 966 users** at about **1 000 offer viewers a day** is **30 days**. What the MDE costs:

| MDE (absolute) | relative | users per arm | days at 1 000/day |
|---|---|---|---|
| +0.4 pt | 5.0 % | 73 844 | 148 |
| +0.5 pt | 6.2 % | 47 519 | 95 |
| +0.8 pt | 10.0 % | 18 863 | 38 |
| **+0.9 pt** | **11.2 %** | **14 983** | **30** |
| +1.2 pt | 15.0 % | 8 559 | 17 |
| +1.6 pt | 20.0 % | 4 912 | 10 |

Halving the effect quadruples the sample. **Duration rules** on top of the arithmetic: run **whole weeks** (weekday and weekend users differ; salary days differ) — at least two; never stop before the planned n; and if the computed duration is 5 months, the test is not feasible — change the metric or the MDE, not the arithmetic. With **28 days** Kamola gets ~14 000 per arm: MDE **+0.93 pt**, power for a true +0.9 pt **77 %** — a conscious, written-down trade.

### Randomisation by hashing the user id

A coin flip stored in a table works but is fragile (lost tables, two services flipping twice). Production systems compute the group: **hash** (*хеш-функция*) the string `salt + user_id` with SHA-256 (or MD5, MurmurHash), read the result as a big integer, take the remainder mod 2: even → A, odd → B.

```python
import hashlib
def hash_variant(user_id, salt="offer_screen_v2"):
    h = int(hashlib.sha256(f"{salt}{user_id}".encode()).hexdigest(), 16)
    return "A" if h % 2 == 0 else "B"
```

Properties you rely on: **deterministic** (the same user gets the same screen on every visit and every device that knows the id), **uniform** (half the users, whatever the ids look like), **independent across experiments** because of the **salt** (*соль*) — the experiment name — so the users who were in B last time are not all in B again. Uneven splits (90/10 for a risky change): normalise the hash to [0, 1) and cut at 0.9; on our A/A users a 90/10 cut sends **9.75 %** to B. In Excel the idea is the same with a deterministic random number per id; in SQL Server `ABS(CHECKSUM(CONCAT('offer_screen_v2', user_id))) % 2`.

### The A/A test — test the system, not the screen

An **A/A test** (*A/A-тест*) splits users exactly as the real test will, shows both groups the **same** screen, and runs the planned analysis. It checks the pipe: the split (50/50?), the logging (do both groups' events arrive?), the metric query, the test itself (false positives at ~5 %?). Nur ran one on 1–14 July 2026 (`data/ab/aa_users.csv`, `aa_events.csv`). The planned analysis, run on it, is four numbers — and you compute them yourself in HW 7.1:

| check | what you compute | what "the system works" looks like |
|---|---|---|
| split | users per group, SRM p-value | a p-value far from the alarm threshold |
| hash | the variant recomputed from `sha256(salt + user_id)` | every row matches its logged variant |
| metric | conversion within 7 days per group | two rates that differ only by noise |
| test | difference B − A with its 95 % CI, z-test p | an interval that contains 0, a p-value far from 0.05 |

And because one A/A says little about a 5 % error rate, re-split the same users at random 1 000 times: **4.0 %** of re-splits are "significant" and the p-values spread evenly from 0 to 1 (92, 90, 110, 101, 115, 100, 99, 90, 101, 102 per decile; KS test against uniform p = 0.46) — the deck's *"p-value distribution check"*. A broken system shows up as 15 % "wins" or a pile of p-values near 0.

### SRM — the first number you look at

**Sample ratio mismatch** (*несоответствие соотношения выборок*, SRM): the groups' sizes differ from the planned split by more than chance allows. It is the single most common sign of a broken experiment — a redirect that loses some B users, a client that crashes on one variant, a bug that re-assigns. The check is a **chi-square goodness-of-fit** test against the planned shares:

```python
from scipy import stats
stats.chisquare([14200, 13800], [14000, 14000])     # chi2 = 5.71, p = 0.017  -> look for the bug before reading anything
stats.chisquare([14050, 13950], [14000, 14000])     # chi2 = 0.36, p = 0.55   -> fine
```

A 50.7 / 49.3 split of 28 000 users is already suspicious. Use a **strict threshold** (p < 0.001 is common) because you will check the ratio overall, by day, by device, by week — many checks — and an SRM means *do not read the result until you know why*; it is not "a small bias to correct". The two thresholds do different jobs: p < 0.001 is the **automatic alarm** that runs on every slice every day, so it must rarely fire by chance; a p of 0.017 on the one overall check you planned does not trip that alarm, but it is still far enough from 50/50 that you look for the bug yourself before reading the result. Excel: `=CHISQ.TEST({14200,13800},{14000,14000})`.

### Peeking — why the end date is part of the design

A fixed-horizon test promises a 5 % false-positive rate **for one look at the planned n**. Look every day and stop at the first p < 0.05 and the promise is broken (week 6 showed it for a monthly look). The day-1 notebook simulates 5 000 A/A experiments (both arms 8 %, 500 users per arm per day, 28 days):

| How you look | Share of A/A tests declared "significant" |
|---|---|
| once, on day 28 | **4.9 %** |
| every week (days 7, 14, 21, 28), stop at p < 0.05 | **12.4 %** |
| every day, stop at p < 0.05 | **27.2 %** |
| every week, but p < 0.0182 at each look (Pocock) | 4.8 % |

The p-value of a null experiment wanders up and down; with enough looks it dips below 0.05 somewhere. If the business needs to look early, use a design built for it — **group-sequential** boundaries (Pocock: the same stricter threshold at each look; O'Brien–Fleming: very strict early, almost 0.05 at the end — 4.8 % in the same simulation) or always-valid sequential tests — decided **before** the start. A dashboard with the live p-value is fine for spotting bugs (SRM, crashes), never for the decision.

### Novelty, primacy and interference

- **Novelty effect** (*эффект новизны*): users click the new thing because it is new; the lift fades in days. **Primacy effect** (*эффект первичности*, change aversion): returning users first resist the change; the lift grows later. Both make the first days unrepresentative. Design answer: run whole weeks, plan a **daily lift chart**, decide in advance whether the first days are excluded, and look at **new vs returning** users separately (new users have no habit to break).
- **Interference / network effects** (*сетевой эффект*): one unit's treatment affects another's outcome — a referral screen (B users invite A users), a shared budget (if B sells more loans, the daily lending limit runs out for A). Then A is not a clean control. For a personal offer screen the risk is small; for marketplace, referral or limit changes, randomise by region or time instead (cluster / switchback designs).
- **Seasonality and external events** affect both arms equally — that is the point of a concurrent control — but they can change the *size* of the effect; a test that ran only in a holiday week may not generalise.

### Pre-registration

Write the design down — dated, in the repo — **before** the test starts: hypothesis, metric definitions with the SQL or pandas that computes them, guardrails with their "stop" thresholds, unit, split, sample size and dates, analysis plan, segments, the decision rule ("ship if the primary is significant at 5 % and FPD's 95 % CI upper bound is below +1.25 points"). **Pre-registration** (*предрегистрация*) is the defence against every week-6 trap at once: the metric chosen after seeing the data, the segment that "worked", the extra week "because it was almost significant". HW 7.1 is this document.

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ The design steps (problem, metrics, hypothesis, design, validity) — [A/B Testing in Data Science Interviews by a Google Data Scientist (DataInterview), 09:41](https://youtu.be/DUNk4GPZ9bw?t=581)
- ▶ Metrics, hypotheses, sample size, splitting users (RU) — [Самая ПОЛНАЯ и ПОНЯТНАЯ лекция по A/B тестам (Noukash), 04:45](https://youtu.be/FEI1OA-zgb8?t=285)
- ▶ Designing an A/B test with sample size and power (EN) — [Data Science Essentials - Crash Course in A/B Testing with Case Study (freeCodeCamp.org), 19:55](https://youtu.be/KZe0C0Qq4p0?t=1195)
- ▶ Randomisation / user split — Noukash lecture, [24:42](https://youtu.be/FEI1OA-zgb8?t=1482)
- ▶ SRM (sample ratio mismatch) — [Understanding SRM (Sample Ratio Mismatch) in A/B Testing (Lucia from The Initial)](https://youtu.be/sSi6h-PpXQI)
- ▶ Peeking — [Тонкости A/B тестирования: проблема подглядывания (Анатолий Карпов, karpov.courses)](https://youtu.be/jnFVmtaeSA0)
- ▶ A/A test / validity checks — DataInterview video, [12:32](https://youtu.be/DUNk4GPZ9bw?t=752)

- RU deck `6.1 Introduction.pdf` (lesson 6.1, Sanjar Khakimov, TBC): why A/B testing — asking clients vs testing pp. 4–6; examples pp. 7–10; definition p. 11; the **HADI** cycle (hypothesis → action → data → interpretation) pp. 12–16; what an experiment design contains (metric + MDE, criteria, split, A/A, simulated effect, power) pp. 18–21; metric types and relative vs absolute change pp. 23–26; how often and how long to test pp. 27–28; historical data and distributions pp. 29–31; MDE and minimum sample size pp. 32–33; the step-by-step approach (A/A → validate criteria → add effect → sample size) p. 34; reading results, and what an insignificant result means pp. 35–36.
- RU deck `6.2 A_B Testing.pdf`: hash functions pp. 4–7, salting a split pp. 8–9, uneven splits by normalised hash p. 10.
- Notebook `Lecture6.2 - Data Generation and Split.ipynb`: a synthetic user base (cell 4), the SHA-256 split function with a salt and group percentages (cells 7–11), visual homogeneity checks by group (cells 12–23), Kolmogorov–Smirnov and chi-square homogeneity tests (cells 24–28). Re-run its split function on `aa_users.csv` — it reproduces today's logic.
- *Russian terms:* A/B-тест = A/B test, контрольная / тестовая группа = control / treatment group, гипотеза = hypothesis, целевая (основная) метрика = primary metric, защитная (барьерная) метрика = guardrail metric, единица рандомизации = unit of randomisation, MDE = minimum detectable effect, мощность = power, объём выборки = sample size, хеш-функция = hash function, соль = salt, A/A-тест = A/A test, SRM (несоответствие соотношения выборок) = sample ratio mismatch, подглядывание = peeking, последовательное тестирование = sequential testing, эффект новизны = novelty effect, сетевой эффект = network effect, предрегистрация = pre-registration.

---

## 2. Worked example — Kamola's answer, in numbers (15 min)

**1. Why not September vs August.** The app's approval rate alone moved 71.4 % → 67.9 % → 66.7 % over three months with no change; seasonality, marketing and policy would all be credited to the screen. An experiment over the same days answers in the same time.

**2. The design in one table.**

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

**3. The A/A evidence that the system works.** The split's SRM p-value, the hash check, the two conversion rates and the test's p-value from the July run (your HW 7.1 cell), and 4.0 % false positives over 1 000 re-splits. If all four look like the right-hand column of the table in section 1, the split and the metric pipeline can be trusted — for July.

**4. What goes back to Kamola**, in three sentences: *"Comparing September to August would mix the screen with everything else that changes between months — your own approval rate moved four points in a month with no change. Instead we show the new screen to a random half of app users for four weeks in August (about 14 000 per arm), which can detect a +0.9-point lift with 77 % power, and we decide on 28 August, not before. If conversion rises but first-payment defaults rise by more than 1.25 points, the screen loses money and we do not ship it as is."*

---

## 3. Practice (50 min)

Open `data/python/week7/day1_starter.ipynb`. Part 0 is a walk-through; then the five TODO functions of HW 7.1. Add a cell per task.

**P1.** Kamola's before/after idea. Name **four** things other than the screen that differ between August and September for app users, and use the table in section 1 to say how big a month-to-month change can be with no intervention.

<details><summary>Answer</summary>
Seasonality (school start, salary and holiday cycles), marketing (a campaign, an SMS blast, a partner promotion), product and policy (another app release, a scorecard cut-off change, a new price), and the user mix (more new users after a campaign; new users convert less). With no change, the app approval rate moved **−3.5 points** July → August (71.4 → 67.9 %) and the average Micro ticket swung from 2.59 m (June) to 2.90 m (July) and back to 2.59 m (August) — ±12 %. A +0.9-point screen effect is far inside that noise.
</details>

**P2.** Write the design's first three lines for the offer screen: hypothesis, primary metric (with its exact definition), two guardrails. Then a bad primary metric and why it is bad.

<details><summary>Answer</summary>
Hypothesis: *a single button and the monthly payment in large type reduce hesitation, so more viewers sign.* Primary: users with a `contract_signed` within 7 × 24 h of their first `view_offer` ÷ users assigned. Guardrails: FPD rate of the resulting loans (risk), average principal (revenue); also crash rate (quality). Bad primaries: **clicks on the button** (moves easily, may not become loans — a "dark pattern" wins), **signed contracts in total** (not a rate: more traffic in B by chance or by bug inflates it), **conversion with no window** (users assigned later have less time, and the arms may differ in timing).
</details>

**P3.** For each change pick the unit — user, session or application — and one sentence why: (a) the offer screen; (b) a new interest-rate rule shown at the decision; (c) the order of products on the app's home screen for logged-out visitors; (d) an SMS reminder before the first due date (week 6).

<details><summary>Answer</summary>
(a) **User** — seen repeatedly; must be consistent. (b) **Application**, but with every application of the same customer forced into the same arm (hash the `customer_id`) — two prices for one person is a complaint and a fairness problem. (c) **Session** or a device cookie — no login, so no user id; accept the weaker consistency. (d) **Loan** (one SMS per loan; FPD is per loan) — but hashing `customer_id` again avoids one customer getting the SMS on one loan and not on another.
</details>

**P4.** Sample size with your `n_per_arm`: 8.0 → 8.9 % at 80 % and at 90 % power; one-sided at 80 %; and the days each needs at 1 000 users a day. When is the one-sided number legitimate?

<details><summary>Answer</summary>
80 %: **14 983** per arm → 30.0 days. 90 %: **20 057** → 40.1 days. One-sided 80 %: **11 802** → 23.6 days. One-sided is legitimate only if "B is worse" and "no difference" lead to the same action (do not ship) **and** you wrote that down before the start — for a screen redesign that is arguable, but most teams keep two-sided so that a harmful screen is also *detected*, not just "not shipped".
</details>

**P5.** Turn it round: with 28 days (~14 000 users per arm), what is the MDE, and what power does the test have for a true +0.9 point? With 10 000 per arm?

<details><summary>Answer</summary>
14 000 per arm: MDE **+0.93 pt** (11.6 % relative), power for +0.9 pt **77.3 %**. 10 000 per arm: MDE +1.11 pt (13.8 %), power for +0.9 pt 62.9 %. (`NormalIndPower().power(h, nobs1=n, alpha=0.05)`, and a root-finder on the power for the MDE.) Four weeks is slightly short of 80 % — acceptable if written down; three weeks would not be.
</details>

**P6.** Hashing: compute `hash_variant` for the first five A/A users with the A/A salt and with the salt `"another_test"`. Check that all 12 852 A/A rows match their logged variant. Why must the salt change between experiments?

<details><summary>Answer</summary>
With `offer_screen_aa_2026_07`: B, A, A, B, A (users 925601, 665666, 652995, 774155, 376261 — the notebook's table, which also shows the first 12 hex digits); with `another_test`: A, A, B, A, A. **All 12 852** rows match. Without a new salt, every experiment would put the same users in B: their "treated" history (fatigue, earlier changes) would follow them, and two simultaneous tests would be perfectly correlated — the effects of the two could not be separated.
</details>

**P7.** SRM: your `srm_pvalue` for 14 200 vs 13 800, 14 050 vs 13 950, and 9 000 vs 1 000 for a planned 90/10 split. Which would you investigate, and what threshold do you use?

<details><summary>Answer</summary>
**0.017**, **0.55**, and **1.0** for 9 000 vs 1 000 (`expected_share_b=0.1`: exactly the plan). Investigate the first (a 50.7 / 49.3 split of 28 000 is unusual) — and with the usual production threshold of p < 0.001 it would not raise an automatic alarm, which is why you also check by day and segment (Day 2). The strict threshold exists because SRM checks are run many times; the response to an alarm is not a correction but a search for the bug.
</details>

**P8.** Run the peeking simulation (section 0c). Report the false-positive rate for one look, weekly looks and daily looks, and the day on which half of the daily-peeking "wins" have already been declared.

<details><summary>Answer</summary>
One look **4.9 %**; weekly **12.4 %**; daily **27.2 %** — a null screen "wins" in more than one test in four. Half of the daily-peeking false wins are declared by **day 6** (median first crossing), when the sample is smallest and the p-value most volatile; 15.9 % of all A/A runs have a false win within the first week. With Pocock's 0.0182 at four weekly looks the rate is back to 4.8 %.
</details>

**P9.** The A/A check is HW 7.1 — compute it there, not here. Here: read the 1 000 re-splits (the notebook's bonus cell), the false-positive share and the decile counts. What would a failing A/A look like?

<details><summary>Answer</summary>
Re-splits: **4.0 %** below 0.05; deciles 92, 90, 110, 101, 115, 100, 99, 90, 101, 102 (flat) — the test behaves on this data. Your own A/A cell should show the same shape as the table in section 1: an SRM p far from the alarm, every row matching the hash, two close rates, an interval of the difference that contains 0. Failing: an SRM (p < 0.001), a "significant" A/A difference that repeats on a re-run, a re-split false-positive rate well above 5 % (the test is wrong for the data, e.g. sessions counted as independent users), or one arm missing events (a logging bug).
</details>

<span class="badge stretch">Stretch</span> **P10.** Novelty arithmetic. Suppose B's true lift is **+3.4 points** on days 1–3 (novelty) and **+0.9** afterwards, with equal traffic every day and A at 8.0 %. What lift would a test that stops after 7 days report? After 14 and 28? What does that say about "we saw a big win in the first week, let us ship"?

<details><summary>Answer</summary>
7 days: (3 × 3.4 + 4 × 0.9) / 7 = **+1.97 pt** (+24.6 % relative). 14 days: (10.2 + 11 × 0.9) / 14 = **+1.44 pt**. 28 days: (10.2 + 25 × 0.9) / 28 = **+1.17 pt** — and still above the steady +0.9. A first-week result overstates a novelty-driven change by more than double; the cure is whole weeks, the daily lift chart, and an analysis that excludes the novelty days (or reads only the last weeks) — decided in the pre-registration. (Day 2 will find exactly this pattern in the real data.)
</details>

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

## 4. Homework <span class="badge hw">HW 7.1 — due Day 3</span>

**The pre-registration for the offer-screen test.** Submit to `submissions/week-07/day-1/`:

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

Graded on: (a) every number traceable — n per arm (14 983 or 14 992, with the method named), the A/A numbers matching the notebook; (b) a guardrail with a **quantified** threshold and a reason (Company corner); (c) the decision rule written as conditions someone else could apply without you.

### 📎 Hand in here

```sqltask
{"check": "handin-W7D1", "lesson": "W7D1", "title": "HW 7.1", "tasks": [{"id": "experiment_design.md", "file": "experiment_design.md", "text": true, "minLines": 3, "q": "Write `experiment_design.md` here — what the page above asks for."}, {"id": "day1_starter.ipynb", "file": "day1_starter.ipynb", "names": ["day1_starter.ipynb"], "upload": true, "accept": ".ipynb", "q": "Attach `day1_starter.ipynb` — what the page above asks for."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else the page lists (one more file, or a .zip of several)."}]}
```

---

## 5. Self-check

1. Kamola says: "The test showed p = 0.03 on day 9, so we can stop." Give two reasons why not. *(→ section 1, "Peeking"; "Sample size and duration")*
2. An experiment has 50.8 % of users in B. What is the first thing you do, and what do you not do? *(→ section 1, "SRM", P7)*
3. Why randomise by user and not by session for the offer screen — and what happens to the z-test if you analyse sessions? *(→ section 1, "The unit", P3)*

---

## 6. Company corner <span class="badge company">Guardrails in lending</span>

In e-commerce a conversion win is almost always money. In lending it is money **only if the extra borrowers repay**: a screen that makes borrowing easier can attract exactly the marginal users the scorecard approves with hesitation. So the offer-screen test has two questions — *more loans?* and *worse loans?* — and the answer to the second can cancel the first.

**A simple unit-economics formula** (per 1 000 offer viewers). Week 6's expected loss, EL = PD × LGD × EAD, with three simplifications for a short Micro loan: a loan with a first-payment default is treated as defaulted (PD ≈ FPD), EAD ≈ the principal, and every other loan pays its interest in full.

```
profit per 1 000 viewers = 1 000 × conversion × [ (1 − FPD) × I − FPD × LGD × P ]
Nur Micro (week 6): P = 2 705 586 average principal · I = 266 662 interest over the life of a repaid loan · LGD = 60 % → loss L = 1 623 352
```

| Scenario | conversion | FPD | profit per loan | profit per 1 000 viewers |
|---|---|---|---|---|
| A — today | 8.0 % | 1.7 % | 234 532 | **18 762 542** |
| B — more loans, same quality | 8.9 % | 1.7 % | 234 532 | 20 873 327 (+11.2 %) |
| B — more loans, FPD +0.5 pt | 8.9 % | 2.2 % | 225 082 | 20 032 271 (+6.8 %) |
| B — more loans, FPD +1.3 pt | 8.9 % | 3.0 % | 209 962 | **18 686 582 (−0.4 %)** |

**Break-even FPD for B** — solve profit_B = profit_A for FPD_B:

```
FPD_B* = ( I − (conv_A / conv_B) × (I − FPD_A × (I + L)) ) / (I + L)  =  2.95 %     → B may raise FPD by at most +1.25 points
```

So **+0.9 points of conversion is worth +1.25 points of FPD** on Micro loans — and not more. Two lessons for the design: (1) the guardrail needs a **number** (the stop threshold is break-even, written in the pre-registration), not "FPD should not get worse"; (2) the guardrail test will be weak — about 1 100 loans per arm, FPD around 2 % — so the decision will rest on the **confidence interval's upper bound** compared with +1.25, not on a p-value. A risky change gets a staged rollout and an FPD watch even after "ship".

Where the simple formula is too simple (say so in the readout): FPD is not PD (some FPD loans cure, some non-FPD loans default later); interest is earned over months, so a time value applies; the funding cost and the cost of acquiring and servicing a loan are left out (they make each loan worth less and the break-even FPD lower); and a more careful bank would use the risk team's PD for the segments B attracts.

> Interview version: *"Your test raised loan conversion by 11 %. Ship it?"* — Only after the guardrails: the new loans' early-default rate (FPD) and size. Translate both into money per viewer — interest on good loans minus PD × LGD × EAD on bad ones — find the break-even FPD increase (here about +1.25 points), and compare it with the upper end of the FPD difference's confidence interval; if the interval cannot exclude a loss, ship in stages with the guardrail monitored.

Tomorrow: the data is in — 27 974 user rows, 67 215 events, 2 583 loans. Before the first z-test, three checks that every experiment deserves.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w07d1", "pass": 0.8, "questions": [
  {"type": "single", "q": "Why can 'September vs August' not tell Kamola whether the new screen works?", "options": ["The months have different lengths", "It can, if the change is large", "September has fewer users", "It changes two things at once — the screen and the calendar (season, marketing, policy, user mix)"], "answer": 3, "explain": "The app's approval rate moved four points between months with no change at all; a concurrent random control removes the calendar (→ section 1, 'Why September vs August')."},
  {"type": "single", "q": "For the offer screen you randomise by user. What breaks if you randomise and analyse sessions?", "options": ["Conversion becomes higher", "The hash cannot handle session ids", "Nothing — sessions are more numerous", "One person sees both screens, and her sessions are not independent, so the z-test's n is inflated"], "answer": 3, "explain": "The unit of analysis must equal the unit of randomisation (→ section 1, 'The unit', P3)."},
  {"type": "single", "q": "The planned split is 50/50. What do you do with this result?", "code": "stats.chisquare([14200, 13800], [14000, 14000])   # p = 0.017", "options": ["Treat it as a sign of a broken split: look for the bug by day, device and segment before trusting any result", "Reweight B to 50 %", "Read the result — 50.7 / 49.3 is close enough", "Remove 400 users from A at random"], "answer": 0, "explain": "An SRM is not a bias to correct but a bug to find; check it overall and by slice (→ section 1, 'SRM', P7)."},
  {"type": "single", "q": "Why must the salt change between experiments?", "code": "def hash_variant(user_id, salt=\"offer_screen_v2\"):\n    h = int(hashlib.sha256(f\"{salt}{user_id}\".encode()).hexdigest(), 16)\n    return \"A\" if h % 2 == 0 else \"B\"", "options": ["SHA-256 runs out of values", "The salt encrypts the user id", "With the same salt the same users land in B every time — their history follows them and two tests are perfectly correlated", "To make the split exactly 50/50"], "answer": 2, "explain": "The salt (the experiment name) makes assignments independent across experiments (→ section 1, 'Randomisation by hashing', P6)."},
  {"type": "single", "q": "You halve the MDE (from +0.9 to +0.45 points). The sample size per arm becomes about…", "options": ["twice as large", "half as large", "the same", "four times as large"], "answer": 3, "explain": "n grows with the inverse square of the effect: halving the effect quadruples the sample (→ section 1, 'Sample size and duration')."},
  {"type": "multi", "q": "Which ways of looking keep an A/A test's false-positive rate near 5 %?", "options": ["One look at the planned n on the planned end date", "A live dashboard p-value used for the decision", "Four weekly looks with Pocock's p < 0.0182 at each, decided before the start", "O'Brien–Fleming boundaries decided before the start", "Weekly looks, stopping at the first p < 0.05"], "answer": [0, 2, 3], "explain": "Daily looks gave 27 % false wins, weekly 12 %; sequential boundaries chosen in advance bring it back to about 5 % (→ section 1, 'Peeking')."},
  {"type": "number", "q": "B's true lift is +3.4 points on days 1–3 (novelty) and +0.9 afterwards, with equal traffic each day. What lift does a test that stops after 7 days report, in points?", "answer": 1.97, "tol": 0.02, "explain": "(3 × 3.4 + 4 × 0.9) / 7 = 1.97 — more than double the steady +0.9; run whole weeks and plan a daily lift chart (→ P10)."},
  {"type": "single", "q": "Company corner: why does the guardrail decision rest on the FPD difference's confidence interval rather than its p-value?", "options": ["The CI is always narrower", "With about 1 100 loans per arm the FPD test is weak; you compare the CI's upper bound with the break-even increase (+1.25 points)", "Risk teams do not read p-values", "p-values do not exist for FPD"], "answer": 1, "explain": "A guardrail needs a number — the break-even written in the pre-registration — and a weak test cannot clear it by 'not significant' (→ Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w07d1", "q": "Kamola is nervous about the release and asks for a 90/10 split: only 10 % of viewers see screen B. Keep the rest of the design (8.0 → 8.9 %, Cohen's h, α 5 % two-sided, power 80 %). Solve for the B arm's size with zt_ind_solve_power (ratio = A users per B user = 9), round it UP to a whole user, give A nine times as many, and convert the total into days at 1 000 offer viewers a day. How many days? Give the number to 1 decimal.", "type": "number", "dp": 1, "h": ["4a82a9eb91e6ec2eebb6b2d5"], "hint": "In statsmodels nobs1 is the first group and ratio = nobs2 / nobs1; make the small arm the first group.", "sol": "ZnJvbSBzdGF0c21vZGVscy5zdGF0cy5wcm9wb3J0aW9uIGltcG9ydCBwcm9wb3J0aW9uX2VmZmVjdHNpemUKZnJvbSBzdGF0c21vZGVscy5zdGF0cy5wb3dlciBpbXBvcnQgenRfaW5kX3NvbHZlX3Bvd2VyLCBOb3JtYWxJbmRQb3dlcgpoID0gcHJvcG9ydGlvbl9lZmZlY3RzaXplKDAuMDg5LCAwLjA4MCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIDAuMDMyMzcKbl9iID0genRfaW5kX3NvbHZlX3Bvd2VyKGVmZmVjdF9zaXplPWgsIGFscGhhPTAuMDUsIHBvd2VyPTAuODAsIHJhdGlvPTkpICAgIyA4IDMyMy40IOKGkiA4IDMyNCBCIHVzZXJzCnRvdGFsID0gODMyNCAqIDEwICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgODMgMjQwIHZpZXdlcnMgKDc0IDkxNiBpbiBBKQp0b3RhbCAvIDEwMDAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIDgzLjIgZGF5cwojIGNoZWNrOiBOb3JtYWxJbmRQb3dlcigpLnBvd2VyKGgsIG5vYnMxPTgzMjQsIGFscGhhPTAuMDUsIHJhdGlvPTkpIOKGkiAwLjgwMAoKODMuMiBkYXlzIOKAlCBhbG1vc3QgdGhyZWUgbW9udGhzLCBhZ2FpbnN0IDMwIGRheXMgZm9yIHRoZSA1MC81MCBkZXNpZ24gKDE0IDk4MyBwZXIgYXJtLCAyOSA5NjYgdmlld2VycykuClRoZSBzbWFsbCBhcm0gc2V0cyB0aGUgcHJlY2lzaW9uLCBzbyBhIDkwLzEwIHNwbGl0IG5lZWRzIDIuOCB0aW1lcyB0aGUgdHJhZmZpYzogc2FmZXR5IGJvdWdodCB3aXRoIHRpbWUuClRoZSB1c3VhbCBjb21wcm9taXNlIGlzIGEgc2hvcnQgc3RhZ2VkIHJhbXAgKGEgZmV3IGRheXMgYXQgMTAgJSB0byBjYXRjaCBjcmFzaGVzIGFuZCBTUk0pIGZvbGxvd2VkIGJ5IHRoZSA1MC81MCB0ZXN0LCB3aXRoIHRoZSByYW1wIGRheXMgZXhjbHVkZWQgZnJvbSB0aGUgYW5hbHlzaXMg4oCUIHdyaXR0ZW4gaW4gdGhlIHByZS1yZWdpc3RyYXRpb24u"}
```

<!-- challenge:end -->
