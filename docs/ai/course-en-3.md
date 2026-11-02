The Analytics Learning course — the full text for an AI helper. Answers to the tasks are deliberately left out.
Part 3 of 3: weeks 7–9.


=====
PAGE: Week 7 · Day 1 — Designing an A/B test: before you touch the data (weeks/week-07/day-1.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-07/day-1
=====

# Week 7 · Day 1 — Designing an A/B test: before you touch the data

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 7.1 (due Day 3)</span> <span class="badge company">Company corner</span>

> STORY **Monday, 9:00.** A new face at the analytics desk: **Kamola**, product manager (*продакт-менеджер*) for the Nur app, with a phone showing two versions of the loan-offer screen. *"We redesigned the offer screen — the amount slider, the monthly payment in big letters, one button instead of three. Users love it in the interviews. **Can we just ship it on 1 September and compare September to August?** If conversion goes up, the design worked."* Madina, before you can answer: *"Last week you told Jasur that 2 000 loans cannot test an SMS. Tell Kamola what can test a screen."* Nilufar, passing: *"And if the new screen sells more loans to people who do not pay the first instalment, I want to know before it is in everyone's pocket."*

## Today in 3 lines

- Why a **randomised experiment** beats "September vs August": the only thing that differs between the groups is the screen. The design comes first — **hypothesis, primary metric, guardrails** (FPD!), **unit of randomisation**, **MDE, power, sample size and duration** with week 6's tools — you will work out how many users per arm the offer-screen test needs and how many days of app traffic that is.
- How the split is made — **hashing the user id with a salt** — and the two checks that catch a broken split before anyone reads a result: the **A/A test** and the **SRM chi-square** — you run both on our A/A data.
- The traps that are decided at design time: **peeking** (a look every day turns 5 % into **27 %** false wins), **novelty / primacy**, interference, and the **pre-registration** document that HW 7.1 asks you to write.

---

## 1. Learn — the experiment is designed, not found

Eight short stories. Each one tells **one idea in small steps**: read a sentence, watch the picture change, press **Next**. A dotted word shows its meaning when you tap it. Tired of reading? Press **▶ Play as a video**: the page reads every step aloud and moves the picture for you.

The Python for each idea, and the extra topics, are in **Going further — the full version** near the end of the page (optional).

### September or a coin? — confounding and the A/B test

(Animated explanation)
September or a coin?
- Nur's app, 2026: the share of applications approved, month by month. **Nothing was changed in the app** — no new screen, no new rule. Yet each blue dot sits somewhere else.
- From July to September the rate fell 4.7 points on its own. Salary days, school fees, a marketing push, a different mix of new users — the calendar moves the number.
- Kamola's plan: ship the new offer screen on 1 September and compare September with August. But between those months **two things** change — the screen **and** the calendar. That is confounding.
- Think with the dots.
- The fix: **the same days, and a coin decides**. From 1 to 28 August every user who opens the offer is sent, by a coin, to screen A or screen B. This is an A/B test.
- Because a coin decides, the halves come out alike in everything else: here 3 iPhone users landed on each side — by chance, not by plan. The same goes for region, salary day and mood.
- So the only **systematic** difference between the halves is the screen. A gap bigger than chance allows was caused by the screen — no calendar in the way.
- One more trap.
- Keep it as a rule: a before/after chart can **spot** that something changed; only a concurrent random split can **measure** what one change did.

### One number decides — hypothesis, primary metric, guardrails

(Animated explanation)
One number decides
- Here are 100 users who opened Kamola's offer screen. Before any of them is split, she writes one sentence: the hypothesis.
- Filled in: a change, a mechanism and a number that can move. If the number does not move, the sentence was wrong — that is what makes it testable.
- Your turn.
- The number in the hypothesis becomes the primary metric. 8 of these 100 signed within 7 days of their first offer view: 8 % — Kamola's planning number.
- Why a 7-day window? Every user gets the same time to sign, whether she came on 1 or on 28 August (94 % of signings come within 7 days). The faded dot signed on day 10 — outside the window, not counted.
- Pick **one** primary. With five “primaries” you will end up reporting the one that moved. The rest become secondary metrics.
- Spot the bad primary.
- Nilufar's worry is the third kind: a guardrail. More loans are money only if they are repaid. The Company corner finds the line: B may raise FPD by at most +1.25 points.
- But the guardrail test is weak: about 1 100 loans per arm. Even if B changed nothing, the interval would run ±1.17 points — nearly the whole safe zone. So the plan writes a **number**, and the decision reads the interval's upper end.
- Last one.

> 🎬 **Didn't get the design steps?** [DataInterview explains it · 2 min](https://youtu.be/DUNk4GPZ9bw?t=581&end=694)

**Now check yourself.**

### Who gets the coin? — the unit of randomisation

(Animated explanation)
Who gets the coin?
- Four users. Each opens the offer screen three times this week; each dot is one visit — one session.
- Flip the coin on every **session**: user 1 sees A on Monday, B on Tuesday, A again on Friday. If she signs, which screen did it?
- Flip it once per **user**: every person sees one screen on every visit and every phone. The thing that gets the coin is the unit of randomisation.
- The second trap is counting. The 12 dots look like 12 pieces of evidence, but they are 4 people, and one person's visits behave alike. Count sessions and the test believes it has 3 times the information it has.
- One rule: **count what you flipped**. Randomise users → one row per user in the analysis table, and every metric per user.
- Your turn.
- When is the unit something else? A new price applied once per **application** → the application is the unit, but hash the customer id, so one person never gets two prices. A screen with no login → a session or device cookie.
- And watch for interference: if B can reach A, A is no longer a clean control. Then randomise bigger units — regions or time periods.

### How many users, how many days? — MDE, power, sample size

(Animated explanation)
How many users, how many days?
- Kamola: “the smallest lift worth a release is +0.9 points”. That is the MDE — said two ways: **absolute** (points) and **relative** (% of the 8.0 % baseline).
- Quick one.
- Now a world where the screens **don't differ**: both arms 8 %, 2 000 users each. Play it: each world gives a gap B − A by luck alone, and the bars pile up around 0.
- The test says “B is different” only beyond the orange lines, ±1.68 points. Only 5 % of luck worlds cross them — that 5 % is α, the false alarms we accept.
- Now give B Kamola's real +0.9 and play again. The pile moves to +0.9 — but most of it stays inside the line. Only about 1 world in 5 crosses: this test would usually **miss** a lift that is really there.
- The same +0.9 with **15 000 users per arm**: the pile is far narrower, the line moves in to 0.61, and about 8 worlds in 10 cross. That share is the power: 80 %.
- So n is grown until power reaches 80 %. The formula skips the playing: 1.96 from α = 5 %, 0.84 from 80 % power, p(1 − p) the noise of one user (p ≈ 8.5 %), and the MDE squared at the bottom.
- Use the bottom of the formula.
- Each input, moved one at a time (users per arm): a smaller MDE, more power, a stricter α or a noisier baseline (12 % instead of 8 %) — each one costs more users.
- The **duration** is both arms ÷ daily traffic: about 1 000 users a day see the offer → 30 days. Run whole weeks: Kamola picks 28 days and writes down the price — power 77 %.
- Two rules on top: never stop before the planned n; and if the arithmetic says five months, change the metric or the MDE — not the arithmetic.

> 🎬 **Didn't get power, significance level and MDE?** [freeCodeCamp explains it · 7 min](https://youtu.be/KZe0C0Qq4p0?t=1271&end=1664)

> 🎬 **Didn't get how to calculate the sample size?** [freeCodeCamp explains it · 6 min](https://youtu.be/KZe0C0Qq4p0?t=1664&end=2022)

> 🎬 **Didn't get how long to run the test?** [freeCodeCamp explains it · 3 min](https://youtu.be/KZe0C0Qq4p0?t=2098&end=2288)

**Now play.** The same idea with sliders — try the challenges.

### The arm is computed, not stored — hashing with a salt

(Animated explanation)
The arm is computed, not stored
- Nobody stores a coin flip. The arm is **computed**: glue the test's name to the user id and feed it to a hash function — here sha256. These are Nur's July A/A users.
- User 925601: the hash is a 64-character number in hex. Its last character, 1, is odd → arm B. (Even or odd is decided by the last character alone, so it is all we need to look at.)
- Compute all six — B, A, A, B, A, A: exactly what the experiment service logged in July. Then press **Compute again**: the same arms, every time. The hash is deterministic.
- Your turn.
- Read the **whole** hash as a number between 0 and 1. Here are the first 100 A/A users: they spread evenly along the line, about half left of 0.5 (A) and half right (B). The hash is uniform.
- A risky change? Cut at 0.9: only users right of it see B — a 90 / 10 split. Here 13 of 100; on all 12 852 A/A users it comes out close to 10 %.
- A new test gets a new salt: offer_screen_v2. The same six users, a fresh draw — the lit rows changed arm.
- Last one.

### Test the machine first — the SRM check and the A/A test

(Animated explanation)
Test the machine first
- A test ends with 28 000 users, split 50 / 50 by the hash. Even a perfect split never gives exactly 14 000 each. Play 2 000 fair splits: B's share wobbles around 50 %.
- Ours: B 14 200, A 13 800 — 50.7 %. Only about 2 fair splits in 100 land this far from 50 %, either way. A split chance rarely makes is a sample ratio mismatch.
- The check is a chi-square test: the plan expects 14 000 in each arm. One line of code in the homework (`srm_pvalue` in the full version).
- Another test: B 14 050, A 13 950 — 50.2 %. Fair splits go this far all the time: p = 0.55. Fine.
- Two thresholds. The automatic alarm runs every day on every slice, so it is strict: **p < 0.001**. Our p = 0.017 does not trip it — but 50.7 / 49.3 on 28 000 users is odd enough to go and look yourself.
- Your turn.
- Before the real test, test the machine. In July Nur ran an A/A test: 12 852 users, two arms, the same old screen.
- Four checks — all of them in HW 7.1: the split (the SRM p), the hash recomputed for every row, the 7-day conversion in each arm, and Week 6's two-proportion z-test of B − A, with the pooled rate inside the SE.
- But one run says little: 1 A/A run in 20 looks “significant” by luck. So re-split the same users at random 1 000 times: the orange share should be near 5 %. Nur's: 4.0 %.
- Last one.

> 🎬 **Didn't get the validity checks (A/A, SRM)?** [DataInterview explains it · 3 min](https://youtu.be/DUNk4GPZ9bw?t=752&end=913)

### Two traps in time — novelty and peeking

(Animated explanation)
Two traps in time: novelty and peeking
- Users react to **change**, not only to the new screen. Suppose B's true lift is +2.0 points in week 1 — they try the new thing because it is new — and only +0.5 after. That first-week bump is the novelty effect.
- A test reports the **average over its days** — the purple line. Stop it after one week: +2.0, four times the lasting +0.5. Try the other stops.
- Four weeks still read about +0.9, above the lasting +0.5 — but now the first week is a small part. The opposite also happens: the primacy effect hides a real lift in week 1.
- Count it out.
- The design's answers: **whole weeks**, long enough that the first days are a small part; a **daily lift chart** for Day 2; launch-day exclusion decided in the plan, never after the result; new and returning users looked at apart.
- The second trap. An A/A test — both arms 8 %, 500 users per arm a day, 28 days; the line is its z after each day. **Read once, on day 28**: about 5 % of such tests cross the orange lines, as promised.
- Now peeking: look every morning and stop at the first p < 0.05. The wandering line dips past a line far more often than once in twenty.
- Simulated 5 000 times (the full version): daily looks turn the 5 % promise into 27 % — more than one no-effect test in four “wins”. Most false wins come early, when the sample is small.
- Must the business look early? Then plan the looks **before the start**, with stricter lines: Pocock's p < 0.0182 at each of four weekly looks keeps 4.8 %; O'Brien–Fleming is very strict early and almost 0.05 at the end.
- Last one.

**Now check yourself.**

### Is this a real experiment? A game — and the one-page plan

(Animated explanation)
Is this a real experiment? A game
- A game in four rounds. Each round is a plan for testing Kamola's screen; the lit chips are its design. Round 1 — her first idea: ship on 1 September, compare September's users with August's, read the result once.
- Two things changed at once — the screen and the calendar, which alone moved the approval rate by 4.7 points.
- Round 2: hash the user id with a new salt, 1–28 August, both screens on the same days, read the result once on 28 August.
- One thing changed: the screen. A gap beyond chance is the screen's doing.
- Round 3: the same hash, but on the **session** id — and people come back several times a week.
- Randomised, but at the wrong unit: mixed screens per person, and an n that is inflated.
- Round 4: hash by user, same days — but the dashboard is checked every morning, and the test stops at the first p < 0.05.
- A fair split read the wrong way: a screen that does nothing would “win” in about one test in four.
- Every choice of today goes on one page, written and dated **before** the first user is assigned: the pre-registration. HW 7.1 is this page.
- Last one.

**Now check yourself.**

**Now check yourself.**

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

**What goes back to Kamola**, in three sentences: *"Comparing September to August would mix the screen with everything else that changes between months — your own approval rate fell 3.5 points from July to August, and 4.7 by September, with no change at all. Instead we show the new screen to a random half of app users for four weeks in August (about 14 000 per arm), which can detect a +0.9-point lift with 77 % power, and we decide on 28 August, not before. If conversion rises but first-payment defaults rise by more than 1.25 points, the screen loses money and we do not ship it as is."*

---

## 3. Practice (50 min)

Answer each question in the box under it. The ▶ Run boxes run Python right here, in the page, and see everything the setup box below defines (`n_per_arm`, `hash_variant`, `srm_pvalue`, the peeking simulation) — run it once first. The notebook `day1_starter.ipynb` is for HW 7.1 (section 4); its Part 0 walks through the same steps if you prefer Jupyter.

**First, press ▶ Run on this box once.** It loads the tools and the data that every Python box below uses.

```python
# the tools and the data from the full version of section 1 — run once
import pandas as pd
aa = pd.read_csv("data/ab/aa_users.csv", parse_dates=["assigned_at"])
ev = pd.read_csv("data/ab/aa_events.csv", parse_dates=["event_time"])
signed = ev[ev["event_name"] == "contract_signed"].merge(aa[["user_id", "assigned_at"]], on="user_id")
in_window = signed[(signed["event_time"] >= signed["assigned_at"]) &
                   # the 7-day window
                   (signed["event_time"] <= signed["assigned_at"] + pd.Timedelta(days=7))]
conv = aa["user_id"].isin(in_window["user_id"]).mean()
from math import asin, sqrt, ceil
from statistics import NormalDist
z = NormalDist().inv_cdf
def n_per_arm(p1, p2, alpha=0.05, power=0.80, two_sided=True):
    """Users per arm to detect p1 -> p2 (Cohen's h: what statsmodels' zt_ind_solve_power returns)."""
    # the effect on the arcsine scale
    h = 2 * asin(sqrt(p2)) - 2 * asin(sqrt(p1))
    # how strict the "significant" line is
    z_a = z(1 - alpha / 2) if two_sided else z(1 - alpha)
    # how sure we want to be to cross it
    return 2 * ((z_a + z(power)) / h) ** 2
n = n_per_arm(0.080, 0.089)
p1, p2 = 0.080, 0.089
for mde in [0.004, 0.005, 0.008, 0.009, 0.012, 0.016]:
    n = ceil(n_per_arm(0.080, 0.080 + mde))
    print(f"+{mde * 100:.1f} pt   relative {mde / 0.080:5.1%}   {n:>7,} per arm   {2 * n / 1000:4.0f} days at 1 000/day")
import hashlib
def hash_variant(user_id, salt="offer_screen_v2"):
    # the hash, read as an integer
    h = int(hashlib.sha256(f"{salt}{user_id}".encode()).hexdigest(), 16)
    # even → A, odd → B
    return "A" if h % 2 == 0 else "B"
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
lift_by_day = [2.0] * 7 + [0.5] * 21
for days in (7, 14, 28):
    # 2.0 · 1.25 · 0.875
    print(days, "days:", round(sum(lift_by_day[:days]) / days, 3), "points")
import numpy as np
rng = np.random.default_rng(2026)
n_exp, days, per_day, p = 5000, 28, 500, 0.08
conv_a = rng.binomial(per_day, p, size=(n_exp, days)).cumsum(axis=1)
conv_b = rng.binomial(per_day, p, size=(n_exp, days)).cumsum(axis=1)
n = per_day * np.arange(1, days + 1)
pool = (conv_a + conv_b) / (2 * n)
z = (conv_b - conv_a) / n / np.sqrt(pool * (1 - pool) * 2 / n)
weeks = [6, 13, 20, 27]
print('ready')
```

**P1.** *(confounding)* Kamola's before/after idea. Name **four** things other than the screen that differ between August and September for app users, and use the monthly approval rates of section 1's first story (the full table is in Going further) to say how big a month-to-month change can be with no intervention.

**P2.** *(hypothesis, metrics)* Write the design's first three lines for the offer screen: hypothesis, primary metric (with its exact definition), two guardrails. Then a bad primary metric and why it is bad.

**P3.** *(unit of randomisation)* For each change pick the unit — user, session or application — and one sentence why: (a) the offer screen; (b) a new interest-rate rule shown at the decision; (c) the order of products on the app's home screen for logged-out visitors; (d) an SMS reminder before the first due date (week 6).

**P4.** *(MDE, sample size)* Sample size with your `n_per_arm`: 8.0 → 8.9 % at 80 % and at 90 % power; one-sided at 80 %; and the days each needs at 1 000 users a day. When is the one-sided number legitimate?

**P5.** *(sample size, turned round)* Turn it round: with 28 days (~14 000 users per arm), what is the MDE, and what power does the test have for a true +0.9 point? With 10 000 per arm?

**P6.** *(randomisation by hash)* Hashing: compute `hash_variant` for the first five A/A users with the A/A salt and with the salt `"another_test"`. Check that all 12 852 A/A rows match their logged variant. Why must the salt change between experiments?

**P7.** *(SRM)* SRM: your `srm_pvalue` for 14 200 vs 13 800, 14 050 vs 13 950, and 9 000 vs 1 000 for a planned 90/10 split. Which would you investigate, and what threshold do you use?

**P8.** *(A/A test)* The A/A check itself is HW 7.1 (section 4). Here, read the 1 000 re-splits in Going further ("The A/A test"): 4.0 % false positives and flat deciles. Which of these would tell you that an A/A test — the system — has failed?

> 🚀 **Stretch (optional, +5 XP).** **P9.** *(novelty)* Novelty arithmetic. Suppose B's true lift is **+3.4 points** on days 1–3 (novelty) and **+0.9** afterwards, with equal traffic every day and A at 8.0 %. What lift would a test that stops after 7 days report? After 14 and 28 (the box takes the 28-day lift, to 2 decimals)? What does that say about "we saw a big win in the first week, let us ship"?

**P10.** *(peeking)* Run the peeking simulation (the code box in Going further, "Peeking"). Report the false-positive rate for one look, weekly looks and daily looks, and the day on which half of the daily-peeking "wins" have already been declared. The box below asks for the **daily-looks** rate.

**P11.** *(pre-registration)* Which of these must be written in the plan **before** the first user is assigned? Tick every one.

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

**H2.** The A/A split: users in A and B and the SRM p-value of the planned 50/50.

**H3.** The A/A conversion within 7 days per group (`contract_signed` within 7 × 24 h of `assigned_at`), in %.

**H4.** The two-proportion z-test of B − A on the A/A data: the p-value.

### 📎 Hand in here

---

## 5. Self-check

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

> 🎯 **Interview version.** *"Your test raised loan conversion by 11 %. Ship it?"* — Only after the guardrails: the new loans' early-default rate (FPD) and size. Translate both into money per viewer — interest on good loans minus PD × LGD × EAD on bad ones — find the break-even FPD increase (here about +1.25 points), and compare it with the upper end of the FPD difference's confidence interval; if the interval cannot exclude a loss, ship in stages with the guardrail monitored.

**Say it like in an interview.** *"Your test raised loan conversion by 11 %. Ship it?"* Answer in three to five sentences, with the numbers from today.

Tomorrow: the data is in — 27 974 user rows, 67 215 events, 2 583 loans. Before the first z-test, three checks that every experiment deserves.

---

## Going further — the full version, with Python (optional, 60 min)

The same ideas as the stories, written out in full with Python: the primary metric as code, `n_per_arm` with Cohen's h and the classic formula, every input moved one at a time, `hash_variant`, `srm_pvalue`, the A/A check table, the novelty arithmetic, the peeking simulation, the eight-line plan and the Depth videos. Optional: nothing here counts toward the day.

The Python boxes on this page run here, in the page, in one shared namespace — like the cells of a notebook. Run them top to bottom; later boxes use what earlier ones defined.

### Why "September vs August" is not an experiment — confounding

**What it is.** **Confounding** (*смешение факторов*) means two things change at once, so you cannot tell which one moved the number. A **before/after comparison** (*сравнение до/после*) is always confounded: between August and September the screen changes, and so does the calendar — salary days, school fees, a marketing push, an app release, the approval policy, the mix of new and returning users.

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

**Your turn.** The sorting game "Primary, guardrail, or a bad primary?" is in section 1, after the story "One number decides".

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

> 🎬 **Didn't get power, significance level and MDE?** [A short explanation · 7 min](https://youtu.be/KZe0C0Qq4p0?t=1271&end=1664)

### Sample size and duration — each input

**What it is.** The **sample size** (*объём выборки*) per arm comes from four inputs. The **duration** is that sample divided by your daily traffic, rounded up to whole weeks.

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

> 🎬 **Didn't get how to calculate the sample size?** [A short explanation · 6 min](https://youtu.be/KZe0C0Qq4p0?t=1664&end=2022)

> 🎬 **Didn't get how long to run the test?** [A short explanation · 3 min](https://youtu.be/KZe0C0Qq4p0?t=2098&end=2288)

### Randomisation and assignment — hashing the user id

**What it is.** **Randomisation** (*рандомизация*) decides each user's arm by chance. Production systems do not store a coin flip; they **compute** it. A **hash function** (*хеш-функция*) turns the text `salt + user_id` into a huge number; its remainder mod 2 is the arm.

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

### Peeking — why the end date is part of the design

**What it is.** **Peeking** (*подглядывание*) is looking at the p-value while the test runs and stopping at the first p < 0.05. A fixed-horizon test promises 5 % false positives **for one look at the planned n**. Every extra look is another chance for a null effect's wandering p-value to dip below 0.05.

**How to write it.** Simulate A/A tests (both arms 8 %, 500 users per arm a day, 28 days) and count false "wins" under each way of looking:

```python
import numpy as np
rng = np.random.default_rng(2026)
n_exp, days, per_day, p = 5000, 28, 500, 0.08
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

This box runs the notebook's 5 000 experiments with the same seed, so it prints the table's numbers:

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

**Your turn.** The game "Find the line that breaks the plan" is in section 1, after the story "Two traps in time".

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

**Your turn.** The game "The design document, in order" is in section 1, after the story "Is this a real experiment?".

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

**Your turn.** Each problem is prevented by one decision: the game "Which decision prevents it?" in section 1, at the end of its last story, matches them.

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ The design steps (problem, metrics, hypothesis, design, validity) — [A/B Testing in Data Science Interviews by a Google Data Scientist (DataInterview), 09:41](https://youtu.be/DUNk4GPZ9bw?t=581&end=694)
- ▶ Designing an A/B test with sample size and power (EN) — [Data Science Essentials - Crash Course in A/B Testing with Case Study (freeCodeCamp.org), 19:55](https://youtu.be/KZe0C0Qq4p0?t=1195&end=2276)
- ▶ SRM (sample ratio mismatch) — [Understanding SRM (Sample Ratio Mismatch) in A/B Testing (Lucia from The Initial)](https://youtu.be/sSi6h-PpXQI)
- ▶ A/A test / validity checks — DataInterview video, [12:32](https://youtu.be/DUNk4GPZ9bw?t=752&end=913)

- RU deck (TBC Data Analytics 2.0, if you have it) `6.1 Introduction.pdf` (lesson 6.1, Sanjar Khakimov, TBC): why A/B testing — asking clients vs testing pp. 4–6; examples pp. 7–10; definition p. 11; the **HADI** cycle (hypothesis → action → data → interpretation) pp. 12–16; what an experiment design contains (metric + MDE, criteria, split, A/A, simulated effect, power) pp. 18–21; metric types and relative vs absolute change pp. 23–26; how often and how long to test pp. 27–28; historical data and distributions pp. 29–31; MDE and minimum sample size pp. 32–33; the step-by-step approach (A/A → validate criteria → add effect → sample size) p. 34; reading results, and what an insignificant result means pp. 35–36.
- RU deck (TBC Data Analytics 2.0, if you have it) `6.2 A_B Testing.pdf`: hash functions pp. 4–7, salting a split pp. 8–9, uneven splits by normalised hash p. 10.
- Notebook `Lecture6.2 - Data Generation and Split.ipynb`: a synthetic user base (cell 4), the SHA-256 split function with a salt and group percentages (cells 7–11), visual homogeneity checks by group (cells 12–23), Kolmogorov–Smirnov and chi-square homogeneity tests (cells 24–28). Re-run its split function on `aa_users.csv` — it reproduces today's logic.
- *Russian terms:* A/B-тест = A/B test, контрольная / тестовая группа = control / treatment group, гипотеза = hypothesis, целевая (основная) метрика = primary metric, защитная (барьерная) метрика = guardrail metric, единица рандомизации = unit of randomisation, MDE = minimum detectable effect, мощность = power, объём выборки = sample size, хеш-функция = hash function, соль = salt, A/A-тест = A/A test, SRM (несоответствие соотношения выборок) = sample ratio mismatch, подглядывание = peeking, последовательное тестирование = sequential testing, эффект новизны = novelty effect, сетевой эффект = network effect, предрегистрация = pre-registration.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 7 · Day 2 — Analysing the A/B test: the result, the traps, the decision (weeks/week-07/day-2.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-07/day-2
=====

# Week 7 · Day 2 — Analysing the A/B test: the result, the traps, the decision

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 60 min</span> <span class="badge hw">HW 7.1 due tomorrow</span> <span class="badge company">Company corner</span>

> STORY **Tuesday, 9:00.** The offer-screen test closed on 28 August; the follow-up on the loans is in. Kamola, beaming, with a screenshot from the experiment dashboard: *"**B wins: 9.37 % against 8.28 %, plus 13 %, p = 0.001.** Can we ship on Thursday?"* Nilufar, one seat further: *"Thirteen per cent more loans. Of which how many pay the first instalment? I sign off on nothing that I have not seen the FPD for."* Jasur, not looking up from his laptop: *"The dashboard counts rows. Has anybody checked that the rows are users?"* Madina: *"You have the data and until tomorrow noon. Kamola gets a decision, Nilufar gets the guardrail, and both get the same one slide."*

## Today in 3 lines

- **Clean before you test.** You run three sanity checks — users in more than one variant, the sample ratio overall *and by segment and week*, and the lift day by day — and find out whether Kamola's dashboard can be trusted. Section 1 walks you through the three checks on this very export, story by story; the Python for each one is in Going further.
- You compute the **primary result** on the population you have decided is clean — difference in points with a 95 % CI, p-value, relative lift — and compare it with the dashboard's number: does the conclusion survive, and how much does the size change?
- You finish the **readout**: the funnel by step, principal (Mann–Whitney, bootstrap), the **FPD guardrail** with its power, segments with a **Holm** correction — and a decision memo Kamola and Nilufar can both sign.

---

## 1. Learn — the order of an analysis

Eight short stories. Each one tells **one idea in small steps**: read a sentence, watch the picture change, press **Next**. A dotted word shows its meaning when you tap it. Tired of reading? Press **▶ Play as a video**: the page reads every step aloud and moves the picture for you.

The Python for each idea, and the extra topics, are in **Going further — the full version** near the end of the page (optional).

### Rows are not users — one row per unit, and the order of an analysis

(Animated explanation)
Rows are not users
- The test closed on 28 August. Kamola's dashboard: “B wins, 9.37 % against 8.28 %, p = 0.001.” But the dashboard counts **rows** — one per assignment. Here are 12 rows: 6 in A, 6 in B.
- Two of these rows are the **same person**, ringed: user 265913, assigned to B on 1 August and to A on 4 August — the app was reinstalled and asked again. She saw both screens.
- In the real export: 27 974 rows, but 27 674 users. 300 users were assigned twice, 1 to 5 days apart — every one of them once to A and once to B.
- Your turn.
- So **every** row of such a user goes: 600 rows, 300 people. One more reason: `events` has no variant column, so a naive merge would count her events in A **and** in B.
- Day 1's rule, now as a check: the analysis table has **one row per unit** — per user — with the arm, the user's attributes and one column per outcome. Count rows and unique users first; if they differ, find out why.
- Check it.
- That was the first check of step (1). An analysis always runs in this order: a result read before the checks is a number from a possibly broken machine — and today two more checks fail.

> 🎬 **Didn't get the experiment data?** [freeCodeCamp explains it · 6 min](https://youtu.be/KZe0C0Qq4p0?t=2493&end=2849)

### Is this split chance? — the sample ratio, overall and by slice

(Animated explanation)
Is this split chance?
- Day 1's SRM check, on the real users: 13 545 in A, 13 829 in B. Play 2 000 fair 50 / 50 splits of 27 374 people first.
- B's share: 50.5 %. About 9 fair splits in 100 land this far from 50 % or further: p = 0.086. Overall, nothing alarming.
- Now cut the users into **slices** — a device, a release week. Each bar is where a fair split's B share stays 95 % of the time **for that slice's size**: small slices get wide bars. The dot is B's real share.
- Three dots fall outside their bars: iOS (52.8 %), week 4 (52.0 %) — and iOS in week 4: 60.5 %. A split chance makes once in a hundred trillion tries: one cell of the experiment is broken.
- Think with the bars.
- Slice the way the software **ships**: client × release week. And keep the strict alarm, p < 0.001: with eleven slices, one or two land below 0.05 by luck alone.
- Last one.

**Now play.** The same idea with sliders — try the challenges.

### Who pushed them into B? — the hash recomputed, and balance

(Animated explanation)
Who pushed them into B?
- Day 1's free check: the arm is a function, so recompute it for every row and compare it with the arm the service **logged**. Five users from the export; compute their arms.
- Three rows agree. The last two — iOS users assigned on 22 August — were logged B although their hash says A (ringed).
- In the whole export 431 rows disagree. 300 are the users in both arms. The other 131 are all iOS, all 22–28 August: the iOS client put users in B when the assignment call timed out. The data found the bug.
- Your turn.
- The cell leaves **both** arms: 13 008 against 13 007, SRM p = 0.995. The split is now what the plan promised.
- Check three: balance. Each bar: B − A in that share, with its 95 % interval. Before the fix, B has 1.9 points more iOS users, and that interval misses 0.
- After removing the cell, every interval straddles 0: the arms are alike in device, user type, segment and region. The readout can say so in one line.
- Last one.

> 🎬 **Didn't get the validity checks?** [DataInterview explains it · 3 min](https://youtu.be/DUNk4GPZ9bw?t=752&end=913)

### The first three days — novelty in the daily lift

(Animated explanation)
The first three days
- Day 1 planned a **daily lift chart**; here it is. Each bar: B minus A conversion among the users assigned that day — about 490 per arm per day.
- Look at the first three days: +4.0, +2.4, +3.9 points. Afterwards: +1.2, −0.3, +0.4, … — single days swing by ±3 points either way.
- Your turn.
- Days 1–3 together: +3.44 points — B converted 1.4 times as often as A. From day 4: +0.88. Three launch days far above the rest, with a mechanism (returning users exploring a new screen): that is Day 1's novelty, in the data.
- The pre-registered plan said it in advance: the **steady state from day 4** is the primary result; the full period is a sensitivity line. So days 1–3 are set aside (faded).
- Last one.

### Real — and how big? — the z-test and the lift's interval

(Animated explanation)
Real — and how big?
- The clean users at last: A 915 of 11 472 = 7.98 %, B 1 013 of 11 434 = 8.86 % — a gap of +0.88 points. Real, or luck? Play the luck world: one shared rate for both arms.
- Our +0.88 sits out on the thin edge: only about 1.6 luck worlds in 100 land this far, either way.
- That is Week 6's two-proportion z-test: the pile's width is SE = 0.367 points, our gap is 2.41 SEs out, p = 0.016. Say the order: B − A, so z > 0 means B is higher.
- Read it right.
- The p-value says **whether**; the confidence interval says **how much**. Each arm's rate with its 95 % interval: the two bars almost touch.
- Compare the **difference**, not the overlap: +0.88 points, 95 % CI +0.16 to +1.60. It leaves 0 out — the effect is real — but its lower end is close to nothing: the size is uncertain.
- Kamola speaks in %: the relative lift is B ÷ A − 1 = +11.1 %. Its interval comes from the **ratio's** interval, minus 1: +2.0 % to +21.0 %. Dividing the difference's limits by A's rate (grey) ignores the wobble in A's own rate.
- Your turn.
- Each cleaning step, B − A with its interval. The verdict “B converts better” survives every one; the size Kamola can promise falls from +1.09 to +0.88 points. Cleaning is not a way to move the lift — it is the condition for reading it.

> 🎬 **Didn't get the two-proportion z-test?** [freeCodeCamp explains it · 10 min](https://youtu.be/KZe0C0Qq4p0?t=2849&end=3464)

> 🎬 **Didn't get the confidence interval and practical significance?** [freeCodeCamp explains it · 3 min](https://youtu.be/KZe0C0Qq4p0?t=3459&end=3651)

### More loans — worse loans? — the funnel, the money and the FPD guardrail

(Animated explanation)
More loans — worse loans?
- Where does the lift come from? Secondary metrics: the funnel, B − A at each step, each as a share of the step before. The new screen does **not** make more people start (+0.07).
- But starters finish a little more often at **every** later step: none significant alone, all in the same direction. That fits the hypothesis: a clear monthly payment means fewer surprises at submission and signing.
- A risk question.
- The money: B's loans are 69 172 soum smaller on average, but the interval runs from −174 910 to +35 635 — Week 6's Welch t-test gives p = 0.20. More loans, perhaps slightly smaller ones: the data cannot tell.
- Now Nilufar's guardrail: the FPD rate of the new loans. A: 1.51 %, B: 2.23 % — each with its 95 % interval. Higher in B; the bars overlap a lot.
- The difference: +0.72 points, p = 0.23 — “not significant”. But the interval runs up to +1.94, past the +0.94 break-even (Day 1's +1.25, redone with today's slightly smaller loans). The data cannot rule out that B loses money.
- How often could this test catch a **real** +0.72? Play 2 000 worlds where it is real: only about 1 in 4 crosses the 5 % line. The test's power: 23 %.
- So “not significant” here means **unknown**, not safe. 80 % power would need 5 508 loans per arm — some four months of traffic. Risk guardrails need hold-outs that run for months, not the A/B window.
- Last one.

### Seven segments, one honest answer — Holm, and Simpson's trap

(Animated explanation)
Seven segments, one honest answer
- Seven pre-registered segments, the same z-test inside each. Without a correction two light up: Android, p = 0.030 and affluent, p = 0.047. Someone writes on the slide: “target affluent users first!”
- Seven tests are seven chances for luck. Even if the screen worked the same for everyone, about 3 times in 10 one segment would look “special”.
- Holm's correction: the orange staircase. Nothing gets under it — the smallest corrected p is 0.21.
- Your turn.
- Every lift is positive and near the total. “Works for X but not Y” is a different question — an interaction test: new vs returning, p = 0.88. The slide may say: “positive in every segment, no evidence it differs”.
- One more trap: Simpson's paradox. A ramp-up sends 90 % of week 1 to A, and week 1 converts better. B wins **both** periods: 11.0 vs 10.0, 5.5 vs 5.0…
- …and loses the total, 6.00 % against 7.37 %: 47 % of A's users come from the strong week 1, only 9 % of B's. That is why a broken cell leaves **both** arms, and why the balance check comes before the result.
- Last one.

**Now check yourself.**

### Ship it or not? A game — the decision, the paragraph and the slide

(Animated explanation)
Ship it or not? A game
- A game in five rounds: each shows a test's evidence, you pick the decision. Round 1 — our test: conversion +0.88 (+0.16 to +1.60); FPD +0.72 (−0.49 to +1.94) against a +0.94 break-even.
- Round 2 — the same lift, but suppose FPD had come out **equal** in both arms on 5 508 loans each: the interval −0.46 to +0.46, entirely below the break-even.
- Round 3 — suppose the **start rate** had been the primary, with an MDE of +2.0 points: the interval −1.16 to +1.29. Narrow, around 0 — a precise flat result?
- Round 4 — the same +0.88, but read on only the first 2 000 users per arm: the interval −0.84 to +2.60. Wide, and it still includes the MDE.
- Round 5 — the morning before the cleaning: one slice's split is 60 / 40, far outside its chance band, and nobody can explain it yet.
- Fixed rules make it the same decision whoever writes the readout. And “the results are interesting” is never a decision: ship, stages, don't, extend, or re-run.
- The readout ends in **one paragraph**, six parts: what was compared, the effect with its interval, the test, the population (22 906 users, and what was removed), the decision, and the money — about 9 more contracts per 1 000 viewers.
- And **one slide**, eight lines, always in this order. Kamola reads the first and the last; Nilufar the guardrails; Jasur the sanity checks — what was removed and why.
- Last one.

**Now check yourself.**

**Now check yourself.**

## 2. Worked example — the primary result, end to end (15 min)

**Ask:** Kamola's dashboard says "B wins: 9.37 % against 8.28 %, p = 0.001". Produce the number she can actually promise — each step is one concept of section 1, in its order.

**First, press ▶ Run on this box once.** It loads the tools and the data that every Python box below uses.

```python
# the tools and the data from the full version of section 1 — run once
import pandas as pd, numpy as np, hashlib
from math import sqrt, exp
from statistics import NormalDist
N = NormalDist()
users  = pd.read_csv("data/ab/users.csv", parse_dates=["assigned_at"])
events = pd.read_csv("data/ab/events.csv", parse_dates=["event_time"])
loans  = pd.read_csv("data/ab/loans_followup.csv", parse_dates=["signed_at"])
def with_conversion(users, events, window_days=7):
    """Adds conv = 1 if the user signed within window_days of their first assignment."""
    first = users.groupby("user_id")["assigned_at"].min().rename("first_at").reset_index()
    s = events[events["event_name"] == "contract_signed"].merge(first, on="user_id")
    ok = s[(s["event_time"] >= s["first_at"]) & (s["event_time"] <= s["first_at"] + pd.Timedelta(days=window_days))]
    return users.assign(conv=users["user_id"].isin(ok["user_id"]).astype(int))
dup = users[users["user_id"].duplicated(keep=False)]
dup_ids = dup["user_id"].unique()
ud = users[~users["user_id"].isin(dup_ids)].copy()
def srm_p(n_a, n_b, share_b=0.5):
    n = n_a + n_b
    chi2 = (n_a - n * (1 - share_b)) ** 2 / (n * (1 - share_b)) + (n_b - n * share_b) ** 2 / (n * share_b)
    return 2 * (1 - N.cdf(sqrt(chi2)))
ud["week"] = (ud["assigned_at"] - pd.Timestamp("2026-08-01")).dt.days // 7 + 1
for name, d in [("rows", users), ("users", ud)]:
    n = d["variant"].value_counts()
    # rows 13 845 / 14 129, p = 0.090 · users 13 545 / 13 829, p = 0.086
    print(name, n["A"], n["B"], round(srm_p(n["A"], n["B"]), 3))
def srm_by(df, cols):
    """One row per slice: users per arm, B's share, the SRM p-value."""
    t = df.groupby(cols + ["variant"]).size().unstack("variant", fill_value=0)
    t["B share"] = (t["B"] / (t["A"] + t["B"])).round(3)
    t["SRM p"] = [srm_p(a, b) for a, b in zip(t["A"], t["B"])]
    return t
def hash_variant(user_id, salt="offer_screen_v2"):  # Day 1
    h = int(hashlib.sha256(f"{salt}{user_id}".encode()).hexdigest(), 16)
    return "A" if h % 2 == 0 else "B"
users["expected"] = users["user_id"].map(lambda u: hash_variant(u, "offer_screen_v2"))
bad = users[users["variant"] != users["expected"]]
ud2 = ud[~((ud["device"] == "iOS") & (ud["assigned_at"] >= "2026-08-22"))]
n = ud2["variant"].value_counts()
def two_prop_p(k1, n1, k2, n2):
    """Two-sided p-value for two shares (the same z-test the primary result uses)."""
    pool = (k1 + k2) / (n1 + n2)
    z = (k2 / n2 - k1 / n1) / sqrt(pool * (1 - pool) * (1 / n1 + 1 / n2))
    return 2 * (1 - N.cdf(abs(z)))
def balance(df):
    rows = []
    for col, val in [("device", "iOS"), ("new_vs_returning", "new"), ("segment", "affluent"), ("region", "Tashkent")]:
        k = df.assign(x=(df[col] == val)).groupby("variant")["x"].agg(["sum", "size"])
        rows.append((f"{col} = {val}", 100 * k.loc["A", "sum"] / k.loc["A", "size"], 100 * k.loc["B", "sum"] / k.loc["B", "size"],
                     two_prop_p(k.loc["A", "sum"], k.loc["A", "size"], k.loc["B", "sum"], k.loc["B", "size"])))
    return pd.DataFrame(rows, columns=["attribute", "A %", "B %", "p"]).round(4)
x = with_conversion(ud, events)
daily = x.groupby([x["assigned_at"].dt.date, "variant"])["conv"].mean().unstack() * 100
daily["lift"] = daily["B"] - daily["A"]
clean = with_conversion(users, events)
clean = clean[~clean["user_id"].isin(dup_ids)]
clean = clean[~((clean["device"] == "iOS") & (clean["assigned_at"] >= "2026-08-22"))]
clean = clean[clean["assigned_at"] >= "2026-08-04"]
def z_test(kA, nA, kB, nB):
    """Two-proportion z-test, B minus A: z > 0 means B is higher."""
    # the shared rate if the screens did not differ
    pool = (kA + kB) / (nA + nB)
    z = (kB / nB - kA / nA) / sqrt(pool * (1 - pool) * (1 / nA + 1 / nB))
    # two-sided p
    return z, 2 * (1 - N.cdf(abs(z)))
k = clean.groupby("variant")["conv"].agg(["sum", "size"])
z, p = z_test(k.loc["A", "sum"], k.loc["A", "size"], k.loc["B", "sum"], k.loc["B", "size"])
def welch(x, y):
    """Welch's t for two means, y minus x (normal p: fine with hundreds of rows per arm)."""
    t = (y.mean() - x.mean()) / sqrt(x.var() / len(x) + y.var() / len(y))
    return t, 2 * (1 - N.cdf(abs(t)))
lc = loans.merge(clean[["user_id", "variant"]], on="user_id")
t, p = welch(lc.loc[lc["variant"] == "A", "principal"], lc.loc[lc["variant"] == "B", "principal"])
def ab_test(kA, nA, kB, nB):
    """B vs A: z-test, the difference with a 95 % CI, the relative lift with a log-ratio CI."""
    pA, pB = kA / nA, kB / nB
    z, p = z_test(kA, nA, kB, nB)
    # standard error of the difference
    se = sqrt(pA * (1 - pA) / nA + pB * (1 - pB) / nB)
    # standard error of log(pB / pA)
    se_log = sqrt(1 / kB - 1 / nB + 1 / kA - 1 / nA)
    r = pB / pA
    return {"A %": 100 * pA, "B %": 100 * pB, "diff pt": 100 * (pB - pA),
            "lo pt": 100 * (pB - pA - 1.96 * se), "hi pt": 100 * (pB - pA + 1.96 * se),
            "z": z, "p": p,
            "rel %": 100 * (r - 1), "rel lo %": 100 * (r * exp(-1.96 * se_log) - 1), "rel hi %": 100 * (r * exp(1.96 * se_log) - 1)}
def ab_readout(df):
    k = df.groupby("variant")["conv"].agg(["sum", "size"])
    r = ab_test(k.loc["A", "sum"], k.loc["A", "size"], k.loc["B", "sum"], k.loc["B", "size"])
    print(f"A {k.loc['A', 'sum']} / {k.loc['A', 'size']} = {r['A %']:.2f} %  ·  B {k.loc['B', 'sum']} / {k.loc['B', 'size']} = {r['B %']:.2f} %")
    print(f"diff {r['diff pt']:+.2f} pt (95 % CI {r['lo pt']:+.2f} to {r['hi pt']:+.2f})  ·  z = {r['z']:.2f}, p = {r['p']:.4f}")
    print(f"relative {r['rel %']:+.1f} % (95 % CI {r['rel lo %']:+.1f} to {r['rel hi %']:+.1f})")
    return r
r = ab_readout(clean)
prev = clean[["user_id", "variant"]]
for step in ["start_application", "submit_application", "approved", "contract_signed"]:
    who = set(events.loc[events["event_name"] == step, "user_id"])
    # users of the previous step who reached this one
    reached = prev[prev["user_id"].isin(who)]
    kA, nA = (reached["variant"] == "A").sum(), (prev["variant"] == "A").sum()
    kB, nB = (reached["variant"] == "B").sum(), (prev["variant"] == "B").sum()
    z, p = z_test(kA, nA, kB, nB)
    print(f"{step:20} A {kA / nA:6.1%}  B {kB / nB:6.1%}  p = {p:.2f}")
    prev = reached
from math import asin
lc["fpd"] = 1 - lc["first_instalment_paid_within_30d"]
f = lc.groupby("variant")["fpd"].agg(["sum", "size"])
r = ab_test(f.loc["A", "sum"], f.loc["A", "size"], f.loc["B", "sum"], f.loc["B", "size"])
h = 2 * asin(sqrt(r["B %"] / 100)) - 2 * asin(sqrt(r["A %"] / 100))
def holm(pvals):
    """Holm: the i-th smallest p (i = 0, 1, ...) times (m - i), running maximum, capped at 1."""
    order = sorted(range(len(pvals)), key=lambda i: pvals[i])
    adj, running = [0.0] * len(pvals), 0.0
    for rank, i in enumerate(order):
        running = max(running, min(1.0, pvals[i] * (len(pvals) - rank)))
        adj[i] = running
    return adj
rows = []
for col in ["device", "new_vs_returning", "segment"]:
    for val, g in clean.groupby(col):
        k = g.groupby("variant")["conv"].agg(["sum", "size"])
        r = ab_test(k.loc["A", "sum"], k.loc["A", "size"], k.loc["B", "sum"], k.loc["B", "size"])
        rows.append((val, r["A %"], r["B %"], r["diff pt"], r["p"]))
seg = pd.DataFrame(rows, columns=["segment", "A %", "B %", "lift pt", "p"])
seg["Holm"] = holm(list(seg["p"]))
for name, (lo, hi), mde in [("start rate (if it were the primary)", (-1.16, 1.29), 2.0),
                            ("FPD guardrail", (-0.49, 1.94), 0.94)]:
    verdict = "precise flat: no effect of that size" if hi < mde else "underpowered: cannot tell"
    print(f"{name:36} CI {lo:+.2f} to {hi:+.2f}, threshold {mde:+.2f} -> {verdict}")
print('ready')
```

```python
# data layout: conv = signed within 7 days
x = with_conversion(users, events)
# data layout: 300 users in both arms
dup_ids = users.loc[users["user_id"].duplicated(), "user_id"].unique()
# 27 374 — one row per user
c = x[~x["user_id"].isin(dup_ids)]
# SRM + hash: the broken cell out of both arms — 26 015, SRM p = 0.995
c = c[~((c["device"] == "iOS") & (c["assigned_at"] >= "2026-08-22"))]
# daily lift: novelty days out, as planned — 22 906, the clean population
c = c[c["assigned_at"] >= "2026-08-04"]
k = c.groupby("variant")["conv"].agg(["sum", "size"])
# primary test + CI
r = ab_test(k.loc["A", "sum"], k.loc["A", "size"], k.loc["B", "sum"], k.loc["B", "size"])
# z = 2.408, p = 0.0160 (B minus A: z > 0 means B is higher)
print({key: round(float(v), 4) for key, v in r.items()})
```

1. **Data layout.** 27 974 rows, 27 674 users: 300 users were in both arms. All 600 of their rows go.
2. **Sanity check 1 — SRM by slice.** Overall p = 0.086, but iOS × week 4 is 537 vs 822 (p ≈ 10⁻¹⁴).
3. **Sanity check 2 — the hash.** 131 iOS week-4 users were logged B with a hash that says A. The cell leaves both arms: 13 008 vs 13 007.
4. **Sanity check 3 — balance.** After the fix, device, user type, segment and region differ by less than a point between arms.
5. **The daily lift.** Days 1–3 run at +4.0, +2.4, +3.9 points; the plan excludes them. 22 906 clean users remain.
6. **The primary test.** z = 2.41, p = 0.016.
7. **The confidence interval.** +0.88 points (+0.16 to +1.60); relative +11.1 % (+2.0 % to +21.0 %).
8. **Guardrail.** FPD +0.72 points (−0.49 to +1.94), power 23 %: unresolved against the +0.94 break-even.
9. **Segments.** All seven lifts positive; the smallest Holm p is 0.21.
10. **The result in one paragraph:** *"Users who saw the new screen signed within 7 days 8.86 % of the time against 7.98 % with the current screen (difference +0.88 points, 95 % CI +0.16 to +1.60; relative +11 %, CI +2 % to +21 %); a two-sided two-proportion z-test gives z = 2.41, p = 0.016 on 22 906 users after removing 300 users assigned to both screens, the mis-assigned iOS week and the three novelty days; at α = 5 % the new screen converts better — about 9 more contracts per 1 000 viewers."* Decision: ship in stages with a hold-out, because the guardrail is unresolved.

---

## 3. Practice (60 min)

Answer each question in its box. The Python boxes run here and see `users`, `events`, `loans`, `ud`, `ud2`, `clean`, `dup_ids` and the helpers (`srm_p`, `srm_by`, `hash_variant`, `balance`, `with_conversion`, `z_test`, `welch`, `ab_test`, `ab_readout`, `holm`) from the setup box at the top of section 2 — run it once first. In Jupyter, `day2_starter.ipynb` has the same data and asks you to write `srm_by`, `clean_users` and `ab_readout` yourself; the checkpoint on Day 5 is easier if you do.

**P1.** *(data layout)* The naive result: conversion per variant on every row, z, p, relative lift. Then two reasons why this cannot go to Kamola yet.

**P2.** *(data layout — one row per user)* Duplicates: how many users appear more than once, in which variants, how far apart? Why remove all their rows rather than keep the first assignment?

**P3.** *(sanity check 1: SRM by slice)* SRM with your `srm_by`: overall (rows and de-duplicated users), by device, by week, by device × week, by day. Which cell is broken, and why did the overall and the daily checks miss it?

**P4.** *(sanity check 2: the hash)* The hash check: recompute every row's variant from `sha256("offer_screen_v2" + user_id)`. How many rows disagree, and how do they split between the two problems?

**P5.** *(sanity check 3: balance)* Run `balance` on the **clean** population. Are the arms alike? Enter the p-value for the share of new users.

**P6.** *(the daily lift)* Novelty: daily conversion by variant (de-duplicated), the lift on 1–3 August, a test on days 1–3 alone, and the weekly table with iOS week 4 removed. What does the pre-registered plan say you do?

**P7.** *(primary test, confidence interval)* The clean primary result with your `ab_readout`, then the cleaning-ladder table (raw → − leak → − iOS week 4 → − days 1–3). Which step changes the answer most?

**P8.** *(secondary metrics — the funnel)* The funnel by variant on the clean users: step rates and a two-proportion test per step. Where does the lift come from, and which step would worry a risk manager?

**P9.** *(secondary metrics — the money)* Principal per loan: describe both arms, Mann–Whitney, a bootstrap CI of the mean difference (10 000 resamples, `default_rng(2026)`). Then disbursed principal per viewer with its bootstrap CI.

**P10.** *(guardrails)* The FPD guardrail: rates with Wilson intervals, z-test and Fisher, the CI of the difference, the power this test had, and the loans per arm needed. What sentence goes to Nilufar?

**P11.** *(segments, Holm)* Segments: lift by device, new vs returning and segment, raw and Holm-adjusted p-values; then the interaction test new vs returning. Which sentence about segments is allowed on the slide?

**P12.** *(Simpson's paradox)* A colleague "fixes" the broken iOS cell by deleting its users from **B only**, so that the arms are 50/50 again. Why is that worse than removing the cell from both arms?

**P13.** *(the result in one paragraph)* Write the six-part result paragraph for the **sensitivity** population (leak out, days 1–3 out, iOS kept): 24 265 users, A 968 / 12 009 = 8.06 %, B 1 088 / 12 256 = 8.88 %, +0.82 points (95 % CI +0.12 to +1.52), z = 2.28, p = 0.022, relative +10.1 % (+1.4 % to +19.6 %). End with what this line adds to the readout.

**P14.** *(a flat result)* A test of a new reminder text ends with a lift of +0.1 points (95 % CI −0.3 to +0.5) on a planned MDE of +1.0 point. What goes in the memo?

> 🚀 **Stretch (optional, +5 XP).** **P15.** *(putting it together — the money)* Redo Day 1's unit economics with today's numbers (conversion, average principal per arm, FPD per arm; interest = 9.856 % of principal, i.e. 266 662 ÷ 2 705 586 as on Nur's Micro book; LGD 60 %). Profit per 1 000 viewers per arm; B's break-even FPD; B's profit if its FPD were at the upper end of the CI. In the box: B's break-even FPD in %, to 2 decimals.

### Mistakes people make

- Reading the dashboard's p-value before checking that rows are users and that the split is 50/50 everywhere.
- Checking SRM only overall (p = 0.09 "fine") — or only by day — and never by client × period.
- "Correcting" an SRM by reweighting instead of finding the bug and removing the broken cell.
- Keeping users who saw both variants ("only 1 %").
- Including the launch-day spike; or, the opposite, removing days **because** they hurt the result (exclusions must follow the pre-registered rule).
- A relative-lift CI computed by dividing the difference's CI by the control rate.
- A t-test on skewed money with the conclusion "loans are smaller" from p = 0.20.
- "FPD not significant, guardrail passed" from a test with 23 % power.
- Quoting the best segment (affluent +1.7, p = 0.047) without Holm, or "works on Android but not iOS" without an interaction test.
- A decision memo with no decision — "the results are interesting" is not ship, don't or extend.

---

## 4. Homework

**HW 7.1** (the design document + the A/A check, Day 1) is due **tomorrow** in Day 1's hand-in box. Today's three TODO functions are practice, not graded — but the checkpoint (Day 5, Part A) is this analysis written up in full, so keep the notebook.

---

## 5. Self-check

---

## 6. Company corner <span class="badge company">The experiment readout</span>

Every experiment ends on **one slide** with eight lines in this order. Kamola reads the first and the last; Nilufar the guardrails; Jasur the sanity checks; the line nobody reads is the one that will be asked about in three months. Here it is twice — as the dashboard would have filled it, and after the cleaning.

| # | Line | Dashboard version (raw rows) | **Clean version** |
|---|---|---|---|
| 1 | **Hypothesis** | A single button and the monthly payment in large type make more viewers sign a contract. | same |
| 2 | **Design** | user-level 50/50 hash split (`offer_screen_v2`), 1–28 Aug 2026, primary = signed within 7 days, α 5 % two-sided, MDE +0.9 pt, power 77 % at ~14 000/arm | same |
| 3 | **Sanity checks** | "split 49.5 / 50.5, OK" | **300 users in both variants removed; SRM in iOS 22–28 Aug (537 / 822, p ≈ 10⁻¹⁴: client bug) — cell removed from both arms; novelty spike on 1–3 Aug (+3.4 pt) — excluded as pre-registered.** After cleaning: 11 472 / 11 434, SRM p = 0.80 |
| 4 | **Primary result** | 8.28 % → 9.37 %, +1.09 pt (+0.42 to +1.75), p = 0.0014, **+13.1 %** | 7.98 % → 8.86 %, **+0.88 pt (+0.16 to +1.60), p = 0.016, +11.1 % (+2.0 to +21.0)** |
| 5 | **Guardrails** | FPD 1.66 % → 2.64 % (19 / 1 147 vs 35 / 1 324: loans of every raw row that converted within 7 days, leaked users in both arms), p = 0.094 — "almost significantly worse" | FPD 1.51 % → 2.23 %, +0.72 pt (−0.49 to +1.94), p = 0.23, **power 23 %**; break-even +0.94 pt — **not cleared, not failed: unknown**. Principal −2.7 % (MW p = 0.32) |
| 6 | **Segments** | "affluent +1.7 pt, p = 0.047!" | 7 pre-registered cuts, all positive, none after Holm (min 0.21); no interaction (new vs returning p = 0.88) |
| 7 | **Decision** | "ship" (or, from line 5, a panic) | **Ship B in stages:** 100 % of offer views with a **10 % hold-out on A** for ten weeks; stop and roll back if B's FPD exceeds A's by more than 0.94 pt on ≥ 2 000 matured B loans |
| 8 | **What we learned** | — | The lift is in *finishing* (submit → signed), not in starting; novelty is real in this app (on the first 3 days B converted 1.4 times as often as A); the iOS client must log assignment failures — **fix before the next test**; a guardrail test on FPD needs ~5 500 loans per arm, so risk guardrails need hold-outs, not the A/B window |

**How the conclusion changes.** The direction does not: B is better on conversion in every version. Three things change: the **size** (+1.09 → +0.88 points; +13 % → +11 %, and the lower end of the interval from +0.42 to +0.16), the **guardrail story** (raw: FPD p = 0.094, which would have started an argument about a "nearly significant" risk increase; clean: an honest "we cannot tell, so we keep a hold-out"), and the **credibility**: a slide that says *what was removed and why* survives the first question from the CFO; the dashboard's version does not survive Jasur.

> 🎯 **Interview version.** *"Walk me through how you analyse an A/B test."* — Sanity first: one row per unit, the sample ratio overall and by the slices the software ships in, units in both arms, the assignment rule recomputed; then the primary metric with a CI and a test, as decided before the start; then guardrails (with their power) and the money; then pre-registered segments with a correction; then a decision — ship, don't, extend, or ship in stages — and what we learned for the next test.

**Say it like in an interview.** *"Walk me through how you analyse an A/B test."* Answer in four to six sentences, with one number from today for each step.

Tomorrow: the numbers move to Power BI. Bekzod's Excel one-pager from week 4 breaks every month; the dashboard should refresh itself.

---

## Going further — the full version, with Python (optional, 60 min)

The same ideas as the stories, written out in full with Python and Excel: `with_conversion`, `srm_by` and the slice table, the hash check, `balance`, the daily lift, `z_test`, `welch`, `ab_test` and `ab_readout`, the funnel, the FPD guardrail with its power, `holm` and the interaction test, Simpson's table, the decision rules, flat results and the cleaning ladder. Optional: nothing here counts toward the day.

An analysis has a fixed order, and it is the order of the readout: **(1) is the experiment sound? (2) the primary result, (3) secondary metrics and guardrails, (4) segments, (5) the decision.** A result read before step 1 is a number from a possibly broken machine. Every box below runs here, in the page, in one shared namespace (the same code is in `day2_starter.ipynb`). Run them in order. Conversion = signed within 7 days of the user's first `assigned_at`.

> 💡 **Key idea.** Read the result last, not first: rows = users, the split by slice and the hash come before any p-value — and today two of those checks fail.

### The data layout — one row per unit

**What it is.** The analysis table has **one row per unit of randomisation** — here, per user — with the arm, the user's attributes and one column per outcome. The export arrives at three different grains: `users` (one row per assignment), `events` (one row per app event), `loans` (one row per signed loan). Your first job is to fold them into one row per user.

**How to write it.**

```python
import pandas as pd, numpy as np, hashlib
from math import sqrt, exp
from statistics import NormalDist
N = NormalDist()

# one row per assignment
users  = pd.read_csv("data/ab/users.csv", parse_dates=["assigned_at"])
# one row per app event
events = pd.read_csv("data/ab/events.csv", parse_dates=["event_time"])
# one row per signed loan
loans  = pd.read_csv("data/ab/loans_followup.csv", parse_dates=["signed_at"])
# 27974 67215 2583
print(len(users), len(events), len(loans))

def with_conversion(users, events, window_days=7):
    """Adds conv = 1 if the user signed within window_days of their first assignment."""
    first = users.groupby("user_id")["assigned_at"].min().rename("first_at").reset_index()
    s = events[events["event_name"] == "contract_signed"].merge(first, on="user_id")
    ok = s[(s["event_time"] >= s["first_at"]) & (s["event_time"] <= s["first_at"] + pd.Timedelta(days=window_days))]
    return users.assign(conv=users["user_id"].isin(ok["user_id"]).astype(int))

# the analysis table
print(with_conversion(users, events).head(6))
# 27 974 rows, 27 674 users
print(len(users), users["user_id"].nunique())
# 600 rows = 300 users
dup = users[users["user_id"].duplicated(keep=False)]
dup_ids = dup["user_id"].unique()
# 600 300 True
print(len(dup), len(dup_ids), dup.groupby("user_id")["variant"].nunique().eq(2).all())
# 27 374 users, one row each
ud = users[~users["user_id"].isin(dup_ids)].copy()
```

The analysis table, first rows:

| user_id | assigned_at | variant | device | segment | conv |
|---|---|---|---|---|---|
| 844122 | 2026-08-01 00:02:57 | B | Android | mass | 0 |
| 639643 | 2026-08-01 00:06:35 | B | Android | affluent | 0 |
| 660041 | 2026-08-01 00:08:34 | B | Android | affluent | 0 |
| 564185 | 2026-08-01 00:11:22 | A | Android | mass | 0 |
| 721201 | 2026-08-01 00:13:50 | B | iOS | sme | 0 |
| 775068 | 2026-08-01 00:28:01 | B | Android | affluent | 1 |

27 974 rows but 27 674 users: **300 users were assigned twice**, each once to A and once to B, 1 to 5 days apart. The app was reinstalled and asked again. They saw **both** screens, so they belong to neither arm. And `events` has no variant column, so a naive merge counts their events in A **and** in B. The rule: drop **every** row of a user who is in both arms — 600 rows go, 27 374 users remain (`ud`).

**When you use it.** First, on every experiment export: count rows and unique units. If they differ, find out why before anything else.

> ⚠️ **Watch out.** "Keep the first assignment" does not fix a user in both arms: after the second assignment her behaviour is a mix of A and B. Remove her entirely and report how many.

**Your turn.** How many rows does `ud` have?

> 🎬 **Didn't get the experiment data (clicks per group)?** [A short explanation · 6 min](https://youtu.be/KZe0C0Qq4p0?t=2493&end=2849)

### Sanity check 1 — the sample ratio, overall and by slice

**What it is.** Day 1's **SRM** check, now on real data — overall **and by slice**. A slice is a part of the users that the software treats differently: a device, a release week, a day.

**How to write it.**

```python
# Day 1's srm_pvalue: chi-square, 1 df
def srm_p(n_a, n_b, share_b=0.5):
    n = n_a + n_b
    chi2 = (n_a - n * (1 - share_b)) ** 2 / (n * (1 - share_b)) + (n_b - n * share_b) ** 2 / (n * share_b)
    return 2 * (1 - N.cdf(sqrt(chi2)))

ud["week"] = (ud["assigned_at"] - pd.Timestamp("2026-08-01")).dt.days // 7 + 1
for name, d in [("rows", users), ("users", ud)]:
    n = d["variant"].value_counts()
    # rows 13 845 / 14 129, p = 0.090 · users 13 545 / 13 829, p = 0.086
    print(name, n["A"], n["B"], round(srm_p(n["A"], n["B"]), 3))

def srm_by(df, cols):
    """One row per slice: users per arm, B's share, the SRM p-value."""
    t = df.groupby(cols + ["variant"]).size().unstack("variant", fill_value=0)
    t["B share"] = (t["B"] / (t["A"] + t["B"])).round(3)
    t["SRM p"] = [srm_p(a, b) for a, b in zip(t["A"], t["B"])]
    return t

# iOS week 4: 537 / 822, p ≈ 1e-14
srm_by(ud, ["device", "week"])
```

Overall: p = 0.086, unremarkable. By slice, on the de-duplicated users:

| slice | A | B | B share | SRM p |
|---|---|---|---|---|
| Android | 10 745 | 10 702 | 49.9 % | 0.77 |
| **iOS** | 2 800 | 3 127 | 52.8 % | **2.2 × 10⁻⁵** |
| week 1 / 2 / 3 | 3 866 / 3 389 / 3 262 | 3 892 / 3 345 / 3 317 | 50.2 / 49.7 / 50.4 % | 0.77 / 0.59 / 0.50 |
| week 4 (Aug 22–28) | 3 028 | 3 275 | 52.0 % | 0.0019 |
| iOS × weeks 1–3 | 857 / 720 / 686 | 835 / 728 / 742 | 49.3 / 50.3 / 52.0 % | 0.59 / 0.83 / 0.14 |
| **iOS × week 4** | **537** | **822** | **60.5 %** | **1.1 × 10⁻¹⁴** |
| new / returning | 5 998 / 7 547 | 6 253 / 7 576 | 51.0 / 50.1 % | 0.021 / 0.81 |
| mass / affluent / sme | 8 076 / 2 741 / 2 728 | 8 330 / 2 748 / 2 751 | 50.8 / 50.1 / 50.2 % | 0.047 / 0.92 / 0.76 |

One cell is broken: **iOS users assigned 22–28 August went 60 / 40 to B**. The overall test could not see it: 1 359 users out of 27 374. A daily check could not either: about 980 users a day, and only 2 of 28 days have p < 0.05. The slice that matches how the software ships — client × release week — found it. The other two "significant" slices (new p = 0.021, mass p = 0.047) are what eleven checks produce by chance; with the p < 0.001 alarm they do not fire.

**When you use it.** Before any result, on every slice the software ships in: device or client, app version, release week, country.

> ⚠️ **Watch out.** An overall SRM check (p = 0.09 here) can hide a broken cell with 5 % of the users, and a daily check is too thin to see it. Slice the way the software ships: client × release week.

**Your turn.** The overall p is 0.086; the iOS × week-4 cell has p ≈ 10⁻¹⁴. What do you conclude?

### Sanity check 2 — the hash recomputed

**What it is.** With a hash-based split, each user's arm is not a stored opinion — it is a function you can recompute. Recompute it for every row and compare it with the logged variant. Every mismatch is a bug, and the mismatches say *where*.

**How to write it.**

```python
def hash_variant(user_id, salt="offer_screen_v2"):  # Day 1
    h = int(hashlib.sha256(f"{salt}{user_id}".encode()).hexdigest(), 16)
    return "A" if h % 2 == 0 else "B"

users["expected"] = users["user_id"].map(lambda u: hash_variant(u, "offer_screen_v2"))
bad = users[users["variant"] != users["expected"]]
# 431, of which 300: the leaked users' second assignments
print(len(bad), bad["user_id"].isin(dup_ids).sum())
# iOS / B: 131, all in Aug 22-28
print(bad[~bad["user_id"].isin(dup_ids)].groupby(["device", "variant"]).size())

# the broken cell, out of BOTH arms
ud2 = ud[~((ud["device"] == "iOS") & (ud["assigned_at"] >= "2026-08-22"))]
n = ud2["variant"].value_counts()
# 26 015 users: 13 008 / 13 007, p = 0.995
print(len(ud2), n["A"], n["B"], round(srm_p(n["A"], n["B"]), 3))
```

431 rows disagree. 300 are the leaked users' second assignments. The other **131 are iOS users from week 4, logged as B although their hash says A**: the iOS client defaulted to B when the assignment call timed out. The cell is removed from **both** arms — inside it, B holds users who should be in A, and whoever times out is not a random user (slow phones, bad networks). After removal: 13 008 vs 13 007, SRM p = 0.995.

**When you use it.** On every hash-based experiment, right after the SRM check. If the broken cell were large, the honest answer would be "re-run that week", not "remove it".

> ⚠️ **Watch out.** Remove a broken cell from both arms. Removing only the mis-assigned B users leaves A with the slow phones and B without them.

**Your turn.** How many rows disagree with the hash and do **not** belong to the leaked users?

### Sanity check 3 — balance of the arms

**What it is.** Randomisation makes the arms alike in everything fixed before assignment: device, new vs returning, segment, region. These are **covariates** (*ковариаты*). A **balance check** compares their shares in A and B. A real gap means the arms are not comparable.

**How to write it.**

```python
def two_prop_p(k1, n1, k2, n2):
    """Two-sided p-value for two shares (the same z-test the primary result uses)."""
    pool = (k1 + k2) / (n1 + n2)
    z = (k2 / n2 - k1 / n1) / sqrt(pool * (1 - pool) * (1 / n1 + 1 / n2))
    return 2 * (1 - N.cdf(abs(z)))

def balance(df):
    rows = []
    for col, val in [("device", "iOS"), ("new_vs_returning", "new"), ("segment", "affluent"), ("region", "Tashkent")]:
        k = df.assign(x=(df[col] == val)).groupby("variant")["x"].agg(["sum", "size"])
        rows.append((f"{col} = {val}", 100 * k.loc["A", "sum"] / k.loc["A", "size"], 100 * k.loc["B", "sum"] / k.loc["B", "size"],
                     two_prop_p(k.loc["A", "sum"], k.loc["A", "size"], k.loc["B", "sum"], k.loc["B", "size"])))
    return pd.DataFrame(rows, columns=["attribute", "A %", "B %", "p"]).round(4)

# iOS 20.67 % vs 22.61 %, p = 0.0001: the broken cell, seen from another side
print(balance(ud))
print(balance(ud2))  # iOS 17.40 % vs 17.72 %, p = 0.49: alike
```

| attribute | A (`ud`) | B (`ud`) | p | A (`ud2`) | B (`ud2`) | p |
|---|---|---|---|---|---|---|
| iOS | 20.67 % | 22.61 % | **0.0001** | 17.40 % | 17.72 % | 0.49 |
| new users | 44.28 % | 45.22 % | 0.12 | 44.33 % | 45.21 % | 0.15 |
| affluent | 20.24 % | 19.87 % | 0.45 | 20.12 % | 19.99 % | 0.79 |
| Tashkent | 40.06 % | 40.28 % | 0.71 | 40.12 % | 40.21 % | 0.89 |

Before the fix, B has 1.9 points more iOS users — the 131 pushed users and their cell. After it, every share differs by less than a point and no p-value is small.

**When you use it.** After the SRM and hash checks, on the population you will analyse. It also tells you which attributes to name in the readout ("the arms were alike in device, user type, segment and region").

> ⚠️ **Watch out.** Check only attributes fixed **before** assignment. A gap in "started an application" is not imbalance — it may be the effect itself.

**Your turn.** A balance table shows B with 1.9 points more iOS users than A (p = 0.0001). What does it mean?

### The daily lift — novelty in the data

**What it is.** Day 1 planned a **daily lift chart**: B − A conversion by day of assignment. Now you read it. A run of launch days far above the rest, with a known mechanism, is the novelty pattern.

**How to write it.**

```python
import matplotlib.pyplot as plt
x = with_conversion(ud, events)
daily = x.groupby([x["assigned_at"].dt.date, "variant"])["conv"].mean().unstack() * 100
daily["lift"] = daily["B"] - daily["A"]
# days 1-3: +4.0, +2.4, +3.9 points
print(daily.head(5).round(2))
ax = daily["lift"].plot(marker="o", title="B - A by day of assignment, points")
_ = ax.axhline(0, color="grey")
```

On 1–3 August, A converts 7.85 / 7.94 / 8.19 % and B **11.90 / 10.33 / 12.09 %**: a lift of +4.0, +2.4, +3.9 points. Afterwards: +1.2, −0.3, +0.4, +1.1, … — single days swing by ±3 points, with about 490 users per arm per day. Days 1–3 together: 8.01 % vs 11.44 %, +3.44 points; from 4 August: +0.88. One day at +5.2 (14 August) proves nothing. **Three consecutive launch days** far above the rest, with a mechanism (returning users exploring a new screen), is novelty. The pre-registered plan says: the **steady state from day 4** is the primary result; the full period is a sensitivity line.

**When you use it.** Every test that changes something users already know. Read it before the primary result, and apply only the exclusion the plan wrote down.

> ⚠️ **Watch out.** Exclude launch days because the pre-registration says so — never because they hurt (or help) the result. One high day is noise, not novelty.

**Your turn.** From the box: what is the lift on 3 August, in points?

### The primary test — the two-proportion z-test (and Welch's t for means)

**What it is.** The primary metric is a 0/1 outcome per user, so the arms are two proportions: the **two-proportion z-test** (*z-тест для двух долей*). For a metric that is a mean of amounts (principal per loan), the test is **Welch's t-test**. Both are week 6's tests, now on the **clean population**: de-duplicated, iOS week 4 out, assigned from 4 August.

**How to write it.**

```python
clean = with_conversion(users, events)
# - the leak
clean = clean[~clean["user_id"].isin(dup_ids)]
# - the broken iOS cell
clean = clean[~((clean["device"] == "iOS") & (clean["assigned_at"] >= "2026-08-22"))]
# - novelty days: 22 906 users
clean = clean[clean["assigned_at"] >= "2026-08-04"]

def z_test(kA, nA, kB, nB):
    """Two-proportion z-test, B minus A: z > 0 means B is higher."""
    # the shared rate if the screens did not differ
    pool = (kA + kB) / (nA + nB)
    z = (kB / nB - kA / nA) / sqrt(pool * (1 - pool) * (1 / nA + 1 / nB))
    # two-sided p
    return z, 2 * (1 - N.cdf(abs(z)))

# A 915 / 11 472 · B 1 013 / 11 434
k = clean.groupby("variant")["conv"].agg(["sum", "size"])
z, p = z_test(k.loc["A", "sum"], k.loc["A", "size"], k.loc["B", "sum"], k.loc["B", "size"])
# z = 2.41, p = 0.0160
print(f"z = {z:.2f}, p = {p:.4f}")

def welch(x, y):
    """Welch's t for two means, y minus x (normal p: fine with hundreds of rows per arm)."""
    t = (y.mean() - x.mean()) / sqrt(x.var() / len(x) + y.var() / len(y))
    return t, 2 * (1 - N.cdf(abs(t)))

# loans of clean users: 993 / 1 076
lc = loans.merge(clean[["user_id", "variant"]], on="user_id")
t, p = welch(lc.loc[lc["variant"] == "A", "principal"], lc.loc[lc["variant"] == "B", "principal"])
# t = -1.28, p = 0.20
print(f"principal per loan: t = {t:.2f}, p = {p:.2f}")
# In Jupyter: statsmodels' proportions_ztest; scipy.stats.ttest_ind(...,
# equal_var=False)
```

Conversion: 915 of 11 472 in A (7.98 %), 1 013 of 11 434 in B (8.86 %); z = 2.41, p = 0.016. If the screens did not differ, a gap this large would appear in about 1.6 % of such experiments. Principal per loan: B's loans are 69 172 soum smaller on average, t = −1.28, p = 0.20 — no evidence of a difference. The same z-test in Excel, one row per variant:

| | A | B | C |
|---|---|---|---|
| 1 | | converted | users |
| 2 | A | 915 | 11472 |
| 3 | B | 1013 | 11434 |
| 5 | pooled | `=(B2+B3)/(C2+C3)` → 0.08417 | |
| 6 | z | `=(B3/C3-B2/C2)/SQRT(B5*(1-B5)*(1/C2+1/C3))` → 2.408 | |
| 7 | p (two-sided) | `=2*(1-NORM.S.DIST(ABS(B6),TRUE))` → 0.0160 | |

**When you use it.**

| the metric per user is… | the test |
|---|---|
| 0/1 (converted, defaulted) | two-proportion z-test (or chi-square on the 2 × 2 table) |
| an amount (principal, revenue) | Welch's t-test; Mann–Whitney or a bootstrap when it is very skewed |

> ⚠️ **Watch out.** Say which arm comes first. `proportions_ztest([kA, kB], …)` measures A − B, so a better B gives a negative z. List B first, or say the order.

**Your turn.** Run `z_test` on `ud2` — the population before the novelty days are removed. What is z?

> 🎬 **Didn't get the two-proportion z-test?** [A short explanation · 10 min](https://youtu.be/KZe0C0Qq4p0?t=2849&end=3464)

### The confidence interval for the lift — absolute and relative

**What it is.** The p-value says *whether*; the **confidence interval** (*доверительный интервал*) says *how much*. Report the lift two ways: **absolute** (points, B − A) and **relative** (%, B ÷ A − 1), each with its 95 % interval.

**How to write it.**

```python
def ab_test(kA, nA, kB, nB):
    """B vs A: z-test, the difference with a 95 % CI, the relative lift with a log-ratio CI."""
    pA, pB = kA / nA, kB / nB
    z, p = z_test(kA, nA, kB, nB)
    # standard error of the difference
    se = sqrt(pA * (1 - pA) / nA + pB * (1 - pB) / nB)
    # standard error of log(pB / pA)
    se_log = sqrt(1 / kB - 1 / nB + 1 / kA - 1 / nA)
    r = pB / pA
    return {"A %": 100 * pA, "B %": 100 * pB, "diff pt": 100 * (pB - pA),
            "lo pt": 100 * (pB - pA - 1.96 * se), "hi pt": 100 * (pB - pA + 1.96 * se),
            "z": z, "p": p,
            "rel %": 100 * (r - 1), "rel lo %": 100 * (r * exp(-1.96 * se_log) - 1), "rel hi %": 100 * (r * exp(1.96 * se_log) - 1)}

def ab_readout(df):
    k = df.groupby("variant")["conv"].agg(["sum", "size"])
    r = ab_test(k.loc["A", "sum"], k.loc["A", "size"], k.loc["B", "sum"], k.loc["B", "size"])
    print(f"A {k.loc['A', 'sum']} / {k.loc['A', 'size']} = {r['A %']:.2f} %  ·  B {k.loc['B', 'sum']} / {k.loc['B', 'size']} = {r['B %']:.2f} %")
    print(f"diff {r['diff pt']:+.2f} pt (95 % CI {r['lo pt']:+.2f} to {r['hi pt']:+.2f})  ·  z = {r['z']:.2f}, p = {r['p']:.4f}")
    print(f"relative {r['rel %']:+.1f} % (95 % CI {r['rel lo %']:+.1f} to {r['rel hi %']:+.1f})")
    return r

r = ab_readout(clean)
# A 915 / 11472 = 7.98 % · B 1013 / 11434 = 8.86 % · diff +0.88 pt (+0.16 to
# +1.60) · z = 2.41, p = 0.0160 · relative +11.1 % (+2.0 to +21.0)
# In Jupyter: confint_proportions_2indep(kB, nB, kA, nA, method="newcomb");
# compare="ratio", method="log" for the relative CI
```

**+0.88 points (95 % CI +0.16 to +1.60)**: about 9 more contracts per 1 000 viewers, and the data are compatible with anything from 1.6 to 16. **Relative: +11.1 % (95 % CI +2.0 % to +21.0 %).** The lower ends are close to nothing — the effect is real but its size is uncertain.

**When you use it.** In every readout, next to the p-value. A decision needs the size and its uncertainty: "+0.88, at least +0.16" is a business statement; "p = 0.016" is not.

> ⚠️ **Watch out.** Do not divide the difference's limits by A's rate (0.16 / 7.98 = 2.1 %, 1.60 / 7.98 = 20.1 %). That ignores the uncertainty in A's own rate. The relative interval comes from the ratio's interval (log method), minus 1.

**Your turn.** From `ab_readout(clean)`: what is the upper end of the relative lift's 95 % CI, in %?

> 🎬 **Didn't get the confidence interval and practical significance?** [A short explanation · 3 min](https://youtu.be/KZe0C0Qq4p0?t=3459&end=3651)

### Secondary metrics — the funnel and the money

**What it is.** Secondary metrics explain *where* the primary effect comes from. Here: the **funnel** (start → submit → approved → signed, each as a share of the step before) and **the money** (principal per loan).

**How to write it.**

```python
prev = clean[["user_id", "variant"]]
for step in ["start_application", "submit_application", "approved", "contract_signed"]:
    who = set(events.loc[events["event_name"] == step, "user_id"])
    # users of the previous step who reached this one
    reached = prev[prev["user_id"].isin(who)]
    kA, nA = (reached["variant"] == "A").sum(), (prev["variant"] == "A").sum()
    kB, nB = (reached["variant"] == "B").sum(), (prev["variant"] == "B").sum()
    z, p = z_test(kA, nA, kB, nB)
    print(f"{step:20} A {kA / nA:6.1%}  B {kB / nB:6.1%}  p = {p:.2f}")
    prev = reached
```

| step (clean users) | A | B | B − A | p |
|---|---|---|---|---|
| started an application (of viewers) | 3 858 · 33.6 % | 3 853 · 33.7 % | +0.1 pt | 0.91 |
| submitted (of starters) | 2 832 · 73.4 % | 2 871 · 74.5 % | +1.1 pt | 0.27 |
| approved (of submitted) | 1 124 · 39.7 % | 1 194 · 41.6 % | +1.9 pt | 0.14 |
| signed, any time (of approved) | 993 · 88.3 % | 1 076 · 90.1 % | +1.8 pt | 0.17 |

The new screen does **not** make more people start. The starters finish a little more often at every later step — none significant alone, all in the same direction. That fits the hypothesis: a clear monthly payment means fewer surprises at submission and signing. The money: principal per loan is A 2 563 847 (median 2 270 000) vs B 2 494 675 (median 2 245 000); Mann–Whitney p = 0.32; a bootstrap of the mean difference gives −69 172 soum (95 % CI −174 910 to +35 635). More loans, perhaps slightly smaller ones — the data cannot tell.

**When you use it.** After the primary result, to explain it. One step needs a risk eye: **approval** is the scorecard's decision; if B's applicants were approved more often, B might attract different people. Here the gap is within noise (p = 0.14): note it, do not build a story on it.

> ⚠️ **Watch out.** A funnel explains a primary result; it does not replace it. Five steps are five more tests — read them as one picture, not as five findings.

**Your turn.** B − A in the share of submitted applications that were approved, in points?

### Guardrails — FPD, with its power

**What it is.** The guardrail test asks *did B make something worse?* Here: the **FPD rate** of the resulting loans. A guardrail result has three parts: the difference with its interval, the test's **power** for that difference, and a comparison with the **break-even** (Day 1's Company corner).

**How to write it.**

```python
from math import asin
lc["fpd"] = 1 - lc["first_instalment_paid_within_30d"]
# A 15 / 993 · B 24 / 1 076
f = lc.groupby("variant")["fpd"].agg(["sum", "size"])
r = ab_test(f.loc["A", "sum"], f.loc["A", "size"], f.loc["B", "sum"], f.loc["B", "size"])
print(f"FPD A {r['A %']:.2f} %, B {r['B %']:.2f} %, diff {r['diff pt']:+.2f} pt (95 % CI {r['lo pt']:+.2f} to {r['hi pt']:+.2f}), p = {r['p']:.2f}")
# the effect, Cohen's h
h = 2 * asin(sqrt(r["B %"] / 100)) - 2 * asin(sqrt(r["A %"] / 100))
power = N.cdf(abs(h) / sqrt(1 / f.loc["A", "size"] + 1 / f.loc["B", "size"]) - 1.96)
# 23 %; 5 508
print(f"power for a true {r['diff pt']:+.2f} pt: {power:.0%};  loans per arm for 80 %: {2 * ((1.96 + 0.8416) / h) ** 2:,.0f}")
```

| | A | B |
|---|---|---|
| loans of clean users | 993 | 1 076 |
| first-payment defaults | 15 | 24 |
| FPD rate (Wilson 95 %) | **1.51 %** (0.92–2.48) | **2.23 %** (1.50–3.30) |

Difference **+0.72 points**, p = 0.23. The box's simple interval is −0.44 to +1.88; the Newcombe method used in the readout gives **−0.49 to +1.94**. And the power: with about 1 000 loans per arm, this test detects a true +0.72 points only **23 %** of the time; 80 % power needs **5 508 loans per arm** — some four months of traffic. So "not significant" here means "unknown". The decision compares the interval with the break-even: the point estimate (+0.72) is below today's +0.94 break-even; the upper end (+1.94) is above it. The data cannot rule out that B loses money.

**When you use it.** For every guardrail in the plan, with the stop threshold the plan wrote down.

> 💡 **Key idea.** "Not significant" from a test with 23 % power means "unknown", not "safe". The guardrail decision compares the interval's upper end with the break-even.

**Your turn.** With the same FPD rates, what power would the test have with **3 000** loans per arm, in %?

### Segments — many comparisons, one correction

**What it is.** A **segment** result is the same test run on a part of the users (Android, new users, affluent). Seven segments are seven tests: by chance alone, one of them may show p < 0.05. A **multiple-comparison correction** (*поправка на множественные сравнения*) — here **Holm's** — raises each p-value so the whole family keeps its 5 %. A different question — *does the lift differ between segments?* — needs an **interaction test**.

**How to write it.**

```python
def holm(pvals):
    """Holm: the i-th smallest p (i = 0, 1, ...) times (m - i), running maximum, capped at 1."""
    order = sorted(range(len(pvals)), key=lambda i: pvals[i])
    adj, running = [0.0] * len(pvals), 0.0
    for rank, i in enumerate(order):
        running = max(running, min(1.0, pvals[i] * (len(pvals) - rank)))
        adj[i] = running
    return adj

rows = []
# the seven pre-registered cuts
for col in ["device", "new_vs_returning", "segment"]:
    for val, g in clean.groupby(col):
        k = g.groupby("variant")["conv"].agg(["sum", "size"])
        r = ab_test(k.loc["A", "sum"], k.loc["A", "size"], k.loc["B", "sum"], k.loc["B", "size"])
        rows.append((val, r["A %"], r["B %"], r["diff pt"], r["p"]))
seg = pd.DataFrame(rows, columns=["segment", "A %", "B %", "lift pt", "p"])
seg["Holm"] = holm(list(seg["p"]))
# smallest Holm p: 0.21 (Android)
print(seg.round(3))
```

| segment | A | B | lift | p | Holm |
|---|---|---|---|---|---|
| Android | 7.86 % | 8.73 % | +0.87 | 0.030 | 0.21 |
| iOS | 8.55 % | 9.48 % | +0.94 | 0.31 | 0.61 |
| new users | 6.54 % | 7.39 % | +0.85 | 0.093 | 0.37 |
| returning users | 9.12 % | 10.08 % | +0.96 | 0.068 | 0.34 |
| affluent | 8.56 % | 10.27 % | +1.71 | 0.047 | 0.28 |
| mass | 7.52 % | 8.14 % | +0.63 | 0.17 | 0.52 |
| sme | 8.74 % | 9.62 % | +0.87 | 0.30 | 0.61 |

Nothing survives Holm, and every lift is positive and close to the total. "Affluent +1.7, p = 0.047" is the most extreme of seven, before correction. The interaction test compares two lifts:

```text
z = (lift₁ − lift₂) / √(var₁ + var₂)
var of each segment
  = pA(1 − pA)/nA + pB(1 − pB)/nB

new +0.85 vs returning +0.96:
  z = −0.15,  p = 0.88
  → no evidence that the lift differs
```

**When you use it.** Only for segments named in the plan, always with the correction. "Significant in Android, not in iOS" does not mean the screen works only on Android: iOS has a fifth of the users, so its test is weaker.

> ⚠️ **Watch out.** Segments found after looking (a single region, a weekday) are not results — they are new hypotheses for the next test.

**Your turn.** What is the Holm-adjusted p-value of the **affluent** segment?

### Simpson's paradox — when the total and the segments disagree

**What it is.** **Simpson's paradox** (*парадокс Симпсона*): B wins in every segment and loses in the total — or the reverse. It happens when the arms have **different mixes** of segments that convert differently. In an A/B test the usual cause is a split that changed during the test (a 90/10 ramp-up, then 50/50), or a slice removed from one arm only.

**How to write it.** A ramp-up: week 1 sends 10 % to B, weeks 2–4 split 50/50, and week 1 users convert better.

```python
simpson = pd.DataFrame({"period": ["week 1 (90/10)", "week 1 (90/10)", "weeks 2-4 (50/50)", "weeks 2-4 (50/50)"],
                        "variant": ["A", "B", "A", "B"], "users": [900, 100, 1000, 1000], "conv": [90, 11, 50, 55]})
simpson["rate %"] = 100 * simpson["conv"] / simpson["users"]
# B wins both periods: 11.0 vs 10.0, 5.5 vs 5.0
print(simpson.pivot(index="period", columns="variant", values="rate %"))
total = simpson.groupby("variant")[["conv", "users"]].sum()
# ... and loses in total: A 7.37, B 6.00
print((100 * total["conv"] / total["users"]).round(2))
```

| | A | B | B − A |
|---|---|---|---|
| week 1 (90/10 ramp) | 90 / 900 = 10.0 % | 11 / 100 = 11.0 % | +1.0 |
| weeks 2–4 (50/50) | 50 / 1 000 = 5.0 % | 55 / 1 000 = 5.5 % | +0.5 |
| **total** | 140 / 1 900 = **7.37 %** | 66 / 1 100 = **6.00 %** | **−1.37** |

B is better in both periods. But 47 % of A's users come from the high-converting week 1, against 9 % of B's — so A's total is pulled up.

**When you use it.** Whenever the share of a segment differs between arms: a ramp-up, a broken cell, an exclusion applied to one arm. It is why today's cleaning removes the iOS cell from **both** arms, and why the balance check comes before the result.

> ⚠️ **Watch out.** With a ramp-up, never pool the periods. Analyse only the period with the final split, or compare within each period and combine those comparisons.

**Your turn.** How do you read the table above?

### The result in one paragraph — decision and uncertainty

**What it is.** The readout of a test ends in **one paragraph** with six parts: what was compared, the effect with its interval, the test and its p-value, the population (what was removed), the decision, and what it means in business units.

**How to write it.**

| Line | What it says |
|---|---|
| 1. compared | users who saw the new screen vs the current one |
| 2. effect + CI | 8.86 % vs 7.98 %: +0.88 points (95 % CI +0.16 to +1.60); relative +11 % (+2 % to +21 %) |
| 3. test | two-sided two-proportion z-test, z = 2.41, p = 0.016 |
| 4. population | 22 906 users after removing 300 users in both arms, the mis-assigned iOS week and the three novelty days |
| 5. decision | the new screen converts better at α = 5 % — ship in stages, because the FPD guardrail is unresolved |
| 6. in money | about 9 more contracts per 1 000 viewers |

The decision follows from the evidence by fixed rules:

| If | Then |
|---|---|
| sound experiment, primary significant, guardrails' intervals inside the safe zone | **ship** |
| primary significant, a guardrail's interval crosses the break-even | **ship in stages** (e.g. 50 % → 100 %) with the guardrail monitored and a hold-out kept, or **extend** if the change is expensive to reverse |
| primary not significant, the interval excludes the MDE | **do not ship** (no effect worth having) |
| primary not significant, interval wide (underpowered) | **extend** to the planned n — never "it works a bit" |
| SRM or leak you cannot explain | **do not read the result**; fix and re-run |

Here: row two. A screen change is cheap to reverse; FPD is a two-month-late signal. Ship B to 100 % of new offer views **except a 10 % hold-out on A** for ten weeks, and read FPD on both when ~5 000 B loans have matured.

**When you use it.** At the end of every analysis: the paragraph is what Kamola reads, and the decision table is what makes it the same decision whoever writes it.

> ⚠️ **Watch out.** "The results are interesting" is not a decision. Every readout ends in ship, ship in stages, do not ship, extend, or re-run.

**Your turn.** Tap every line of a readout that would not survive review: the game "Three lines that would not survive Jasur" in section 1, after the story "Seven segments, one honest answer".

### What to do when the result is flat

**What it is.** A **flat result** (*нулевой результат*) is an interval that contains 0. There are two kinds, and they lead to opposite decisions:
- **precise flat** — the interval is narrow and excludes the MDE: there is no effect worth having;
- **underpowered flat** — the interval is wide and includes the MDE: the test cannot tell.

**How to write it.** Compare the interval with the MDE, not the p-value with 0.05:

```python
for name, (lo, hi), mde in [("start rate (if it were the primary)", (-1.16, 1.29), 2.0),
                            ("FPD guardrail", (-0.49, 1.94), 0.94)]:
    verdict = "precise flat: no effect of that size" if hi < mde else "underpowered: cannot tell"
    print(f"{name:36} CI {lo:+.2f} to {hi:+.2f}, threshold {mde:+.2f} -> {verdict}")
```

| result | 95 % CI | threshold | reading |
|---|---|---|---|
| start rate, B − A | −1.16 to +1.29 pt | MDE +2.0 pt (if it were the primary) | precise flat: B does not raise starts by 2 points |
| FPD, B − A | −0.49 to +1.94 pt | break-even +0.94 pt | underpowered: a harmful rise is still possible |

**When you use it.** Every time p > 0.05. A precise flat result is a finding ("the screen does not change starts"); an underpowered one is a reason to extend to the planned n — or, for a slow guardrail, to keep a hold-out.

> ⚠️ **Watch out.** "Not significant, so no effect" is the most common misreading of a test. Never say it without the interval.

**Your turn.** Sort the situations by the decision each one leads to: the game "Which decision?" in section 1, after the story "Ship it or not?".

### Putting it together

The whole analysis, as one table: how each step of the order changed the answer.

| population | A | B | difference (95 % CI) | p | relative lift (95 % CI) |
|---|---|---|---|---|---|
| raw rows (the dashboard) | 8.28 % (13 845) | 9.37 % (14 129) | +1.09 (+0.42 to +1.75) | 0.0014 | +13.1 % (+4.9 to +22.0) |
| − 300 users in both arms (data layout) | 8.05 % | 9.17 % | +1.11 (+0.45 to +1.78) | 0.0010 | +13.8 % (+5.4 to +23.0) |
| − iOS 22–28 Aug (SRM, hash, balance) | 7.98 % | 9.17 % | +1.19 (+0.51 to +1.87) | 0.00059 | +14.9 % (+6.2 to +24.5) |
| **− days 1–3 (daily lift) = clean** | **7.98 %** (11 472) | **8.86 %** (11 434) | **+0.88 (+0.16 to +1.60)** | **0.016** | **+11.1 % (+2.0 to +21.0)** |
| sensitivity: − leak, − days 1–3, iOS kept | 8.06 % | 8.88 % | +0.82 | 0.022 | +10.1 % |

The verdict "B converts better" survives every version. The size Kamola can promise is **+0.9 points, not +1.1**, with a lower end close to nothing. Then the guardrail (unresolved, 23 % power), the segments (nothing after Holm) and the decision (ship in stages with a hold-out).

> 💡 **Key idea.** Cleaning is not a way to make the lift bigger or smaller; it is the condition for reading it. Here the verdict survived every step and the size fell from +1.09 to +0.88 points.

**Your turn.** Put the analysis in order: the game "The order of an analysis" at the end of section 1.

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Analysing results in Python — [Data Science Essentials - Crash Course in A/B Testing with Case Study (freeCodeCamp.org), 39:22](https://youtu.be/KZe0C0Qq4p0?t=2362&end=3660)
- ▶ Validity check and launch decision — [A/B Testing in Data Science Interviews by a Google Data Scientist (DataInterview), 12:32](https://youtu.be/DUNk4GPZ9bw?t=752&end=913)

- RU deck (TBC Data Analytics 2.0, if you have it) `6.2 A_B Testing.pdf` (lesson 6.2): pp. 4–10 — hashing, salting, uneven splits (the logic behind the hash check).
- Notebook `Lecture6.2 - Tests.ipynb`: the t-test step by step and with scipy (cells 3–19), "was it profitable?" — a skewed revenue metric and the Mann–Whitney U test (cells 20–40), **A/A tests and added-effect checks** — simulate many A/A splits, check the p-values are uniform, add an artificial effect and check the test finds it (cells 41–62), multiple comparisons (cell 63). Run its A/A loop on our `users` + `events` instead of the generated data.
- `Howework_AB.ipynb` — the original course's A/B homework: a "For you" page recommendation test in an online shop; hypothesis + metric + criterion, split, comparability, a synthetic dataset, a power-vs-sample-size plot at MDE 5 %; then the same for profitability. Today's analysis is the next step after that design.
- *Russian terms:* очистка данных эксперимента = experiment data cleaning, утечка в назначении = assignment leak, пересечение групп = group overlap, воронка = funnel, конверсия = conversion, относительный прирост (лифт) = relative lift, бутстрап = bootstrap, барьерная метрика = guardrail, взаимодействие = interaction, поэтапный запуск = staged rollout, контрольная (отложенная) группа = hold-out.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 7 · Day 3 — Power BI I: get data, Power Query, the model (weeks/week-07/day-3.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-07/day-3
=====

# Week 7 · Day 3 — Power BI I: get data, Power Query, the model

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 60 min</span> <span class="badge hw">HW 7.1 due · HW 7.2 (due Day 5)</span> <span class="badge company">Company corner</span>

> STORY **Wednesday, 9:00.** Timur, BI (*BI-специалист*), closes the experiment readout and opens a different file: Bekzod's Excel one-pager from week 4, with three cells highlighted in red. *"This broke again on Monday. Someone pasted September under August, the pivot range stopped at row 1 700, and the board saw August's outstanding twice. Every month a person rebuilds it by hand and every month something breaks. **Rebuild it in Power BI, on the views you wrote in week 3, so that it refreshes** — one click, or no click at all. Today: the data and the model. Tomorrow: the measures and the pages. If the model is wrong, nothing tomorrow will be right."*

## Today in 3 lines

- What a **BI tool** is and why the banks in the region mostly run **Power BI**; its parts (**Desktop** — free, Windows — **Service**, **Mobile**, **Report Server**) and the build process: get data → transform → model → measures → visuals → publish.
- **Get data** from CSV (`data/powerbi/`) or from SQL Server (the optional `nur` database from [Tools at work](tools-at-work.md)), **Power Query** in Power BI (the same editor as Excel's in week 4: types, cleaning, merge, append; M in one paragraph), Import vs DirectQuery.
- The **star schema** in the Model view — facts `v_loan_status`, `v_payments_clean`, `v_portfolio_monthly` (+ four small facts), dimensions date / product / branch / customer — **one-to-many, single direction**, `dim_date` marked as the date table; and the first look at **calculated columns vs measures**. The first card shows **208 723 504 430**.

---

## 1. Learn — from a file that breaks to a model that refreshes

> 🧭 **Before you start.** Today you build in **Power BI Desktop** (free, Windows; on a Mac, a Windows virtual machine) — Power BI cannot run inside this page. Download the files from `data/powerbi` (every file name with a ⬇ button saves it): for the worked example `data/powerbi/v_loan_status.csv`, `data/powerbi/products.csv`, `data/powerbi/branches.csv` and `data/powerbi/dim_date.csv`; for Practice the rest of the folder, including `data/powerbi/customer_id_map.csv` and `data/powerbi/README.md` (the relationships). Keep them in one folder. **End state today:** one file `nur_week7.pbix` with the 14 tables loaded, a star in the Model view (every line 1 : *, single direction), `dim_date` marked as the date table, and a card that shows **208 723 504 430**. The boxes on this page check the numbers you read off your visuals. Click paths are for the current Desktop release; menu names move between versions, the steps do not.

### What a BI tool does — and why Power BI

**What it is.** **Business intelligence** (*бизнес-аналитика*, BI) is the layer between the data and the people who decide: a **model** of the business data, a set of agreed calculations (**measures**), and **reports** that refresh from the source. Excel can do each step once. A BI tool makes it **repeatable**: the same definitions every month, no pasted ranges, a refresh instead of a rebuild.

**How it looks.** The build process, always in this order:

```text
get data
  CSV, SQL
   ▼
transform (Power Query)
  types, cleaning
   ▼
model (relationships)
  the star
   ▼
measures (DAX)
  Outstanding, PAR30
   ▼
visuals
  cards, lines
   ▼
publish
  Service, PDF
```

| Tool | Who makes it / licence | Known for |
|---|---|---|
| **Power BI** | Microsoft; Desktop free, sharing needs Pro / Premium | Excel-like Power Query, DAX, Microsoft integration |
| **Tableau** | Salesforce; paid | visual exploration, polished charts |
| **Looker** / Looker Studio | Google | a modelling language on cloud warehouses |
| **Apache Superset**, **Metabase** | open source | SQL-first dashboards on your own server |

**When you use it.** When a report is rebuilt by hand every month, or when two people get two numbers for "outstanding". The banks in the region mostly run **Power BI**: their data sit in SQL Server and Excel, staff sign in with Microsoft accounts, Desktop is free, and **Report Server** keeps data inside the bank. The ideas of today — model, grain, measures — carry over to every tool on the list.

**Your turn.** What does a BI tool add that Bekzod's Excel one-pager lacks?

### Power BI Desktop — the Report, Table and Model views

**What it is.** **Power BI Desktop** is the free Windows program where you build everything. It has views on its left edge: **Report** (the canvas with visuals), **Table** (the data row by row — older versions call it **Data**), **Model** (tables and their relationships), and in newer versions **DAX query**. The other parts of Power BI only share what Desktop builds:

| part | what you do there | what you need |
|---|---|---|
| **Desktop** | data, Power Query, model, DAX, report pages | Windows; free |
| **Service** (app.powerbi.com) | publish, share, schedule refresh, apps | a work or school account; Pro to share |
| **Mobile** | read reports on a phone | the Service |
| **Report Server** | the Service on the bank's own servers | a server licence |

**How to use it.** Each view answers one question:

| question | view |
|---|---|
| Did all 7 828 rows arrive? Is `bucket` text? | **Table** |
| Is every relationship 1 : *, single direction? | **Model** |
| Does the card show 208 723 504 430? | **Report** |

**When you use it.** All three, in a loop: load in Power Query, check rows in Table, relate in Model, show in Report.

**Your turn.** Which view do you open to draw a relationship between two tables?

### Get Data — connecting to the source

**What it is.** **Get Data** (*получить данные*) connects Power BI to a source and opens the import. The source is read, not pasted, so the next refresh reads it again.

**How to write it.**
1. Home → **Get data** → **Text/CSV** → `data/powerbi/v_loan_status.csv`.
2. In the preview, click **Transform data** — not Load. You check the types first.
3. Repeat per file. For a folder of **same-shaped** files (one CSV per month): Get data → **Folder** → *Combine & Transform*. Power BI stacks them and picks up next month's file on refresh.
4. For **SQL Server**: Get data → SQL Server → Server `localhost` (or `.\SQLEXPRESS`), Database `nur` → tick the views `v_loan_status`, `v_portfolio_monthly`, `v_payments_clean`. *Advanced options* accepts a SQL statement instead: `SELECT loan_id, product, branch_name, outstanding, dpd FROM v_loan_status` — only the columns you need.

**When you use it.**
- **Text/CSV** — the course files, one-off exports.
- **Folder** — a monthly export of the same shape.
- **SQL Server** — the bank's database: the definitions stay in the SQL views, Power BI only reads them.

> ⚠️ **Watch out.** The file path in the source is absolute. Move the folder and the refresh breaks on Timur's PC. Make the folder a **parameter** (Home → Manage parameters) and point every query at it.

**Your turn.** Finance drops one CSV per month, always with the same columns, into a shared folder. Which connector?

### Import or DirectQuery — where the data live

**What it is.** The **storage mode** (*режим хранения*) decides where the data sit. **Import** copies them into the `.pbix`, compressed in memory. **DirectQuery** leaves them in the database and sends a query for every visual.

**How to read it.**

| storage mode | data live | visual speed | freshness | use when |
|---|---|---|---|---|
| **Import** | inside the `.pbix` | fastest | as of the last refresh (up to 8 a day on Pro) | almost always — our case |
| **DirectQuery** | in the source database | as fast as the database | live | very large or must-be-live tables |
| **Composite** | some tables each way | mixed | mixed | a big live fact with small imported dimensions |

**When you use it.** Import for the Nur reports: 14 tables, the biggest 92 193 rows, refreshed once a day. DirectQuery when the table is too big to copy or the number must be current to the minute; some DAX is limited there.

**Your turn.** The board pack shows month-end figures and is read once a week. Which mode?

### Power Query — the Applied Steps

**What it is.** *Transform data* opens **Power Query** — the same editor you used in Excel in week 4. Every click is recorded as a step in **Applied Steps** (*применённые шаги*), and every **Refresh** replays them from the source. Behind the steps is **M** (*язык M*), Power Query's formula language: a `let` block where each step builds on the one before.

**How to write it.**
1. **Types** — `principal`, `outstanding`, `dpd` Whole number; `disbursed_at`, `month`, `paid_at`, `due_date` Date; `bucket`, `vintage`, `product`, `branch_name` **Text**.
2. **Profile** — View → *Column quality*, *Column distribution*, *Column profile*. Switch the status bar from "first 1 000 rows" to **entire data set**.
3. **Replace / fix** — values and keys (the 48 loans whose customer was removed in week 4 — Practice).
4. **Close & Apply** — the result loads into the model.

What the clicks wrote, in *Advanced Editor*:

```powerquery
let
  // the file
  Source = Csv.Document(
    File.Contents(
      "C:\...\data\powerbi\v_loan_status.csv"
    ),
    [Delimiter = ",", Encoding = 65001]
  ),
  // first row = headers
  Promoted = Table.PromoteHeaders(
    Source, [PromoteAllScalars = true]
  ),
  // the types
  Typed = Table.TransformColumnTypes(
    Promoted, {
      {"loan_id", Int64.Type},
      {"disbursed_at", type date},
      {"principal", Int64.Type},
      {"outstanding", Int64.Type},
      {"dpd", Int64.Type},
      {"bucket", type text}
    }
  )
in
  // the last step is the table
  Typed
```

**When you use it.** For every table, before it enters the model. M shapes tables **before** they are loaded; DAX (tomorrow) calculates numbers **after**.

> ⚠️ **Watch out.** Wrong types are the most common reason a total is wrong or a relationship refuses to be created. `bucket` holds "1-30" — a label that only looks like a range; typed as a number, those rows become errors.

**Your turn.** Which data type do you give the column `bucket`?

### Merge and Append — a lookup and a stack

**What it is.** **Merge Queries** (*слияние запросов*) adds columns from another table by a key — Power Query's VLOOKUP. **Append Queries** (*добавление запросов*) stacks tables of the same shape — more rows, same columns.

**How to write it.** Merge `v_payments_clean` ← `v_loan_status` on `loan_id`:
1. Select `v_payments_clean` → Home → **Merge Queries**.
2. Second table `v_loan_status`; click `loan_id` in both; Join kind **Left Outer**.
3. Expand the new column and tick **only** `product` and `branch_name`.

| `v_payments_clean` | payment_id | loan_id | amount | ← | `v_loan_status` | loan_id | product |
|---|---|---|---|---|---|---|---|
| | 1 | 1 | 1 741 700 | | | 1 | CONS |
| | 2 | 1 | 1 741 700 | | | 3 | MICRO |

| result | payment_id | loan_id | amount | product |
|---|---|---|---|---|
| | 1 | 1 | 1 741 700 | CONS |
| | 2 | 1 | 1 741 700 | CONS |

Rows stay 52 850 — one per payment — because `loan_id` is unique in `v_loan_status`. **Append**: Home → Append Queries → pick tables with the same columns (two years of exports). The Folder connector is an automatic append.

**When you use it.**

| | Merge | Append |
|---|---|---|
| adds | columns | rows |
| needs | a key, unique on the other side | the same columns |
| example | product and branch onto each payment | 2025 and 2026 exports into one table |

> ⚠️ **Watch out.** Expand only descriptive columns. Expanding `outstanding` here copies each loan's balance onto every one of its payments — summed, it becomes 1.5 trillion (Company corner).

**Your turn.** `v_payments_clean` has 52 850 rows and `loan_id` is unique in `v_loan_status`. How many rows after the merge?

### The star schema — fact tables and dimension tables

**What it is.** A **star schema** (*схема «звезда»*) puts **fact tables** (*таблицы фактов*) in the centre and **dimension tables** (*таблицы измерений*) around them. A fact holds events or states at a stated **grain** — numbers to add up and keys pointing out. A dimension holds one row per thing you slice by.

**How to write it.** Our model, drawn the way the Model view shows it:

```text
v_loan_status (7 828 loans)
   ▲ *
   │
   ├─1── dim_date (1 461 days)
   ├─1── products (5)
   ├─1── branches (10)
   └─1── customers_clean (6 000)
```

| fact (grain) | rows | dimensions it uses |
|---|---|---|
| `v_loan_status` (one loan, as of 2026-10-01) | 7 828 | date (disbursed_at), product, branch, customer |
| `v_portfolio_monthly` (month × product × branch) | 1 700 | date (month), product, branch |
| `v_payments_clean` (one payment) | 52 850 | date (paid_at); product, branch after the merge |
| `fct_installments` (one scheduled instalment) | 92 193 | date (due_date), product, branch |
| `fct_first_instalment` (one loan in FPD scope) | 7 099 | date (disbursed_at), product, branch |
| `fct_applications` (one application) | 14 000 | date (applied_date), product, branch, customer |
| `fct_collections_actions` (one action) | 9 361 | date (action_date), product, branch, collector |

Dimensions: `dim_date` (1 461 days), `products` (5), `branches` (10), `customers_clean` (6 000), `staff_collectors` (30). `data/powerbi/README.md` lists every relationship.

**When you use it.** Every model. Each fact keeps its own grain; facts never connect to each other — they meet through the shared dimensions.

> ⚠️ **Watch out.** Never relate two facts directly (loans ↔ payments). A filter on a product reaches both through `products`.

**Your turn.**

### Cardinality — the "1" and the "*" of a relationship

**What it is.** A **relationship** (*связь*) connects a dimension's key to a fact's column. Its **cardinality** (*кардинальность*) says how many rows match on each side. The star uses **one-to-many (1 : *)**: the key is unique in the dimension (the "1") and repeats in the fact (the "*").

**How to write it.**
1. Model view → drag `products[code]` onto `v_loan_status[product]` (or Modeling → Manage relationships → New).
2. The dialog proposes **Many to one (*:1)** — the same relationship seen from the fact. Check it, then OK.
3. Repeat for every line in the README.

| `products` (1 side) | code | | `v_loan_status` (* side) | loan_id | product |
|---|---|---|---|---|---|
| | SME | | | 2861 | SME |
| | MICRO | | | 4570 | SME |
| | | | | 1 | CONS |

**When you use it.** Every relationship you create — read the dialog before clicking OK. The symptoms of a broken relationship in a visual:

| what the table by product shows | the cause |
|---|---|
| the same number in every row | no relationship (or an inactive one) — no filter reaches the fact |
| a (Blank) row | fact keys with no match in the dimension |
| a total far bigger than the source | a wrong grain (a merge that copied rows) |

> ⚠️ **Watch out.** If Power BI proposes **many-to-many**, the "1" side is not unique — a duplicate key, a trailing space, a type mismatch. Fix the data; never accept many-to-many to make the warning go away.

**Your turn.** In the relationship `products[code]` → `v_loan_status[product]`, which table is on the "1" side?

### Cross-filter direction — single, from the dimension to the fact

**What it is.** The **cross-filter direction** (*направление кросс-фильтрации*) says which way a filter travels along a relationship. **Single**: from the dimension to the fact — a product slicer filters loans. **Both**: also from the fact back to the dimension, and from there on to other facts.

**How to write it.** Double-click a relationship line → *Cross filter direction* → **Single**. In the Model view the line carries one arrow, pointing at the fact.

```text
single:
  products ──▶ v_loan_status
  a product slicer filters loans;
  loans do not filter products

both:
  products ◀─▶ v_loan_status
    ◀─▶ customers_clean ...
  a segment slicer now filters
  products, then every other fact
```

**When you use it.** Single everywhere. With `customers_clean ↔ v_loan_status` set to Both, a segment slicer on "sme" filters `products` and `branches` to those sme customers use, and through them `fct_installments` to *every* loan of those products — not to sme customers' loans. The numbers look plausible and are wrong.

> ⚠️ **Watch out.** Never switch a relationship to Both to make a slicer "work". When one measure needs the other direction, ask for it inside that measure (`CROSSFILTER`, tomorrow).

**Your turn.** A slicer on customer segment does not change a table built on `fct_installments`. What do you do?

### Active and inactive relationships

**What it is.** Between two tables only **one active** path may exist. A second relationship — say a second date column — is created **inactive** (*неактивная связь*): drawn dashed, ignored by visuals, used only by a measure that asks for it with `USERELATIONSHIP`.

**How to write it.** `fct_first_instalment` has two dates: `disbursed_at` (active, solid line) and `first_due_date`.
1. Model view → drag `dim_date[date]` onto `fct_first_instalment[first_due_date]`. Power BI creates it dashed.
2. A measure that uses the dashed line:

```dax
FPD Loans by Due Date =
CALCULATE (
    -- what to count
    COUNTROWS ( fct_first_instalment ),
    -- use the dashed line, for this measure only
    USERELATIONSHIP ( dim_date[date], fct_first_instalment[first_due_date] )
)
```

| month on the axis | `COUNTROWS` (active: disbursed in) | `FPD Loans by Due Date` (inactive: first due in) |
|---|---|---|
| June 2026 | 373 | 377 |
| July 2026 | 367 | 373 |
| August 2026 | 11 | 367 |

August 2026: 11 loans were disbursed and are already in scope, but 367 loans had their first instalment due.

**When you use it.** A fact with two or more dates: applied vs decided, disbursed vs first due, due vs paid. One date is the default (active); the others are available per measure.

> ⚠️ **Watch out.** An unintended dashed line is a missing relationship in disguise: visuals ignore it, and every row shows the same number.

**Your turn.** How many loans in `fct_first_instalment` had their **first instalment due** in July 2026?

### A date table — and marking it

**What it is.** A **date table** (*таблица дат*) is a dimension with **one row per day**, no gaps, covering every date in the facts. `dim_date` runs 2024-01-01 … 2027-12-31 and has columns for year, quarter, month, month name, `year_month`. **Marking** it tells Power BI to use it for time intelligence and to switch off its hidden automatic date tables.

**How to write it.**
1. Select `dim_date` → Table tools → **Mark as date table** → column `date`.
2. Relate `dim_date[date]` to each fact's date column (README).
3. **Sort by column** (Column tools): `month_name` by `month`, `year_month` by `month_start` — or the axis reads April, August, December…

| date | year | month | month_name | year_month |
|---|---|---|---|---|
| 2026-09-30 | 2026 | 9 | September | 2026-09 |
| 2026-10-01 | 2026 | 10 | October | 2026-10 |

**When you use it.** Every model with a date. Tomorrow's `TOTALYTD`, `SAMEPERIODLASTYEAR` and `DATEADD` need it marked.

> ⚠️ **Watch out.** Slicing by a fact's own date column next to `dim_date` gives two calendars and two answers. Use `dim_date` on every axis and slicer.

**Your turn.** How many rows must `dim_date` have to cover 2024-01-01 to 2027-12-31 with no gaps?

### Data types and formatting in the model

**What it is.** After loading, each column has a **data type**, a **format** and a **default summarization** (*агрегирование по умолчанию*) — what Power BI does when the column is dropped into a visual. Set them once in the model; every visual inherits them.

**How to write it.** Select a column → **Column tools**:
1. **Data type** — the same as in Power Query; change it there if you can.
2. **Format** — Whole number with a thousands separator for soum; Percentage for rates; a date format for dates.
3. **Summarization** — *Don't summarize* for ids, `year`, `dpd` and codes; Sum only for amounts.
4. **Data category** — e.g. *City* for a region column, so a map can read it.

| column | type | format | summarization |
|---|---|---|---|
| `outstanding` | Whole number | 208,723,504,430 | Sum |
| `loan_id` | Whole number | 1234 | Don't summarize |
| `year` | Whole number | 2026 | Don't summarize |
| `bucket` | Text | — | — |

**When you use it.** Right after Close & Apply, before the first visual.

> ⚠️ **Watch out.** "Sum of loan_id" or "Sum of year" in a visual means the summarization was left on Sum. The number is meaningless — set *Don't summarize*.

**Your turn.** A table visual on `dim_date` shows a column "Sum of year" with 2 959 254. What is the fix?

### Hiding keys — what the report author should not see

**What it is.** A fact's key columns (`product`, `branch_name`, `customer_id`, `disbursed_at`) exist only to carry relationships. **Hiding** them (*скрыть в представлении отчёта*) removes them from the Fields pane, so authors slice by the dimension's columns instead. Hidden columns still work in relationships and DAX.

**How to write it.**
1. Model view → right-click the column `v_loan_status[product]` → **Hide in report view**. Or click the eye icon in the Data pane.
2. Repeat for every fact-side key and every technical column (`customer_id_master`, `Source.Name`).
3. Keep visible: the dimension columns (`products[product_name]`, `branches[branch_name]`, `dim_date[year_month]`) and the measures.

| table | visible | hidden |
|---|---|---|
| `products` | code, product_name, annual_rate | — |
| `v_loan_status` | (measures) | product, branch_name, customer_id, disbursed_at |

**When you use it.** Before anyone else builds on your model. A slicer on `v_loan_status[product]` filters only loans; a slicer on `products[code]` filters every fact.

> ⚠️ **Watch out.** A slicer built on a fact's key column filters that one fact — the other pages silently ignore it.

**Your turn.** Which columns do you hide? Tick every one.

### Calculated column vs measure — a first look

**What it is.** Two ways to add a calculation. A **calculated column** (*вычисляемый столбец*) is computed once per row at refresh and stored. A **measure** (*мера*) is computed when a visual asks, once per cell, after the filters.

**How to write it.**

```dax
-- column: one value per loan
par30_outstanding = IF ( v_loan_status[dpd] > 30, v_loan_status[outstanding], 0 )
-- measure: one value per cell
Outstanding       = SUM ( v_loan_status[outstanding] )
-- measure: a ratio of sums
PAR30 %           = DIVIDE ( SUM ( v_loan_status[par30_outstanding] ), [Outstanding] )
```

| | calculated column | measure |
|---|---|---|
| computed | once per row, at refresh; stored | at query time, for each cell |
| sees | the current row | the filters of the cell |
| use for | a value you slice or filter by, a key | every number on a card, axis or matrix |

Card `Outstanding`: 208 723 504 430. Card `PAR30 %`: 3.12 %.

**When you use it.** Tomorrow's whole lesson. Today one rule: **ratios are measures** — a ratio of sums, computed after the filters, never an average of row-level ratios.

> 💡 **Key idea.** Ratios are measures: a ratio of sums, computed after the filters — never an average of row-level ratios or flags.

**Your turn.**

### Putting it together

Week 4's one-pager already had every idea; Power BI gives each one a home that survives next month.

| Excel one-pager (week 4) | Power BI | concept |
|---|---|---|
| CSV pasted under last month's rows | Get data → CSV / Folder / SQL Server, **Refresh** | Get Data |
| Power Query in the workbook | the same Power Query, Applied Steps | Power Query |
| VLOOKUP between sheets | **relationships** in the Model view | star, cardinality, direction |
| a pivot's Sum of `outstanding` | a **measure** `Outstanding = SUM(...)` | measure |
| a timeline on `disbursed_at` | `dim_date`, marked, and a date slicer | date table |
| "Data as of" typed by hand | a measure or the refresh time | measure |

**What Refresh does**, in order: re-runs every query's Applied Steps from the source, re-applies the types, rebuilds the tables and calculated columns, redraws every visual. If a step fails (a renamed column, a moved file), the refresh stops and names the query and the step.

**Check the model before any visual** — two minutes, every time:
1. Row counts in Table view match the README.
2. The card `Outstanding` = 208 723 504 430.
3. Every relationship 1 : *, single, no dashed line you did not intend.
4. `dim_date` marked; months sorted by number.
5. A table by product shows different numbers per row and no (Blank) row.

> 💡 **Key idea.** The first test of any BI model is that it reproduces the SQL: the card says 208 723 504 430, like the week-3 tile.

**Your turn.** Match each Excel habit with its Power BI home — then review the words of the day.

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Get Data + first Power Query transform — [Power BI Tutorial for Beginners (Step-by-Step in 30 Minutes) (Guy in a Cube), 05:04](https://youtu.be/OmW9YvxSl1E?t=304&end=447)
- ▶ Power Query in Power BI — [Learn Power BI in Under 3 Hours (Alex The Analyst), 11:59](https://youtu.be/I0vQ_VLZTWg?t=719&end=1454)
- ▶ Power Query in Power BI (short single-topic) — [How to use Power Query in Power BI (Alex The Analyst), 01:45](https://youtu.be/gP-AxNi6uxo?t=105&end=152)
- ▶ Star schema / data model — [Learn Data Modelling & Star Schema for Power BI in 20 minutes (Chandoo), 02:18](https://youtu.be/4ePNrdxWtY0?t=138&end=580)
- ▶ Relationships (cardinality, filter direction, active) — [How to Create and Manage Relationships in Power BI (Alex The Analyst), 03:45](https://youtu.be/sW5LoDA1ssM?t=225&end=272)
- ▶ Relationships, fuller — Alex's 3-hour course, [24:14](https://youtu.be/I0vQ_VLZTWg?t=1454&end=1917)

- RU deck (TBC Data Analytics 2.0, if you have it) `7_1_Introduction_to_BI_tools,_Importing_data,_Transforming_Data.pptx` (lesson 7.1, Javokhir Tashbaev, TBC × Payme): what BI is and its benefits — slides 4–5; why Power BI and its parts (Desktop / Service / Mobile) — slides 6–8; the process of building a report — slide 9; Desktop's Report, Data and Model sections — slides 10–12; Power Query as an ETL tool — slide 13; the homework — slide 14.
- RU deck (TBC Data Analytics 2.0, if you have it) `Power BI 7.2.pptx`: data model, star and snowflake schemas — slides 3–5; relationships: cardinality, cross-filter direction, active property — slides 6–8.
- `Power BI 7.1.pbix` — the lecture's report file. It is a binary Power BI file: it cannot be read here, open it in Power BI Desktop to see the lecturer's queries and model.
- `HW 7.1_Sales_Data_Practice.xlsx` — the original course's Power Query homework (optional extra): a sales export with a title and empty rows on top, "Конец" at the bottom, category codes to replace from a `Categories` sheet, names to split, a `Returned` column of "No" and errors to turn into 0/1, dates to split into day / month / year — eight steps, all from week 4.
- DAX guide `Подробное руководство по DAX.pdf` (Russo & Ferrari; PDF page = book page): chapter 1, the data model and relationship direction, pp. 27–42 (direction pp. 29–35); chapter 15, relationships in depth, pp. 514–566 (one-to-many p. 538, many-to-many pp. 540–553, ambiguity pp. 559–566).
- *Russian terms:* бизнес-аналитика (BI) = business intelligence, отчёт = report, дашборд = dashboard, источник данных = data source, импорт / DirectQuery = import / DirectQuery, обновление по расписанию = scheduled refresh, редактор Power Query = Power Query editor, применённые шаги = applied steps, слияние / добавление запросов = merge / append queries, модель данных = data model, схема «звезда» = star schema, таблица фактов / измерений = fact / dimension table, связь = relationship, кардинальность = cardinality, направление кросс-фильтрации = cross-filter direction, таблица дат = date table, вычисляемый столбец = calculated column, мера = measure.

---

## 2. Worked example — the first card that refreshes (15 min)

**Ask:** Timur's test of a model — one card that shows the week-3 outstanding and refreshes. Each step names the concept of section 1 it uses.

1. **Get Data** — Home → Get data → Text/CSV → `data/powerbi/v_loan_status.csv` → **Transform data**.
2. **Power Query** — check the types (`bucket` must be Text); Close & Apply. **Table view**: **7 828 rows**.
3. **Get Data** again — `products.csv`, `branches.csv`, `dim_date.csv` (`date` as Date).
4. **Star schema, cardinality, direction** — Model view: drag `products[code]` onto `v_loan_status[product]` → the dialog says *Many to one (*:1)*, *Single* → OK. Same for `branches[branch_name]` → `v_loan_status[branch_name]` and `dim_date[date]` → `v_loan_status[disbursed_at]`.
5. **Date table** — mark `dim_date` as the date table; sort `month_name` by `month`.
6. **Formatting and hiding keys** — hide `v_loan_status[product]`, `[branch_name]`, `[disbursed_at]`; set *Don't summarize* on `loan_id`.
7. **Measure** — Home → New measure: `Outstanding = SUM ( v_loan_status[outstanding] )`; Measure tools → Format: Whole number, thousands separator.
8. **Report view** — a **Card** with `Outstanding` → **208 723 504 430**. A **Slicer** with `products[product_name]` → *Small business loan* → **125 892 942 411**. A **Table** with `branches[branch_name]` and `Outstanding`, sorted descending → Tashkent Central **28 716 674 373** at the top, Termez Central 10 670 177 559 at the bottom.
9. **Refresh** — save as `nur_week7.pbix`. Next month, *Refresh* re-reads the CSVs (or the SQL views): no pasting, no ranges, no "August twice". The card's number is the week-3 tile — the model reproduces the SQL, which is the first test of any BI model.

---

## 3. Practice (60 min)

Power BI Desktop, one `.pbix` for the whole week (`nur_week7.pbix`). Keep a short log of what you clicked — it becomes your HW 7.2 notes. Under each question, type the number (or word) your visual shows: the box checks it and then shows the model answer.

**P1.** *(Get Data · Table view)* Load `v_loan_status`, `v_portfolio_monthly`, `v_payments_clean` through *Transform data*. Report the row count of each in Table view and the totals of `outstanding`, `disbursed_amount` and `amount`. In the box: Σ disbursed_amount of v_portfolio_monthly (all 34 months).

**P2.** *(Import or DirectQuery)* Timur's colleague asks: "Why not DirectQuery to the SQL Server views — then the board always sees live numbers?" Pick the answer you would give.

**P3.** *(Power Query — profile)* Profile `v_loan_status` in Power Query (Column quality / distribution / profile, on the entire data set). How many distinct buckets, how many loans with zero outstanding, the largest outstanding and its loan? What changes if the profile stays on the first 1 000 rows? In the box: the number of loans with outstanding = 0.

**P4.** *(Merge)* Merge `v_payments_clean` with `v_loan_status` on `loan_id` (Left Outer), expanding only `product` and `branch_name`. Check the row count, then relate payments to `products` and show **collected in September 2026 by product**. In the box: SME's collected amount, paid_at in September 2026.

**P5.** *(star schema · cardinality)* Build every relationship in the README. Then a table visual by `products[code]` with `Outstanding` and `Disbursed Count = COUNTROWS(v_loan_status)`. What does the Model view's diagram look like, and what does each line's "1" and "*" mean? In the box: Disbursed Count for MICRO.

**P6.** *(relationships — the missing one)* The missing-relationship symptom. Before relating `v_payments_clean` to `products`, put `products[code]` and `Collected Amount` in a table. What do you see, and what does it tell you?

**P7.** *(keys that do not match)* Relate `customers_clean` to `v_loan_status` and show `Outstanding` by `customers_clean[segment]`. Explain the extra row, then fix it with `customer_id_map.csv` in Power Query. In the box: the outstanding of the (Blank) row, before the fix.

**P8.** *(cross-filter direction)* Set `customers_clean ↔ v_loan_status` to **Both**, put a slicer on `customers_clean[segment]` = sme, and look at a table of `products[code]` with `COUNTROWS(fct_installments)`. What happened, and what do you set back?

**P9.** *(active and inactive relationships)* Create the inactive relationship `dim_date[date]` → `fct_first_instalment[first_due_date]` and the measure `FPD Loans by Due Date` (section 1). In a table by `dim_date[year_month]`, how many loans had their first instalment due in **May 2026**?

**P10.** *(date table)* Mark `dim_date` as the date table and set the sort orders. Then `Disbursed Amount = SUM(v_loan_status[principal])` by `dim_date[year_month]` for 2026. Report January, August and September. In the box: Disbursed Amount for August 2026.

**P11.** *(data types · sort by column)* Load the four other facts and the five dimensions (`data/powerbi/README.md`). Which file needs a type you would not guess, and by which `dim_date` column do you sort `month_name` (Sort by column)?

**P12.** *(hiding keys)* Bekzod built a slicer on `v_loan_status[branch_name]`. The loans table on his page reacts; the payments table next to it does not. Why, and what is the fix?

**P13.** *(calculated column vs measure)* Calculated column vs measure. Create the column `par30_outstanding = IF(v_loan_status[dpd] > 30, v_loan_status[outstanding], 0)` and the measure `PAR30 % = DIVIDE(SUM(v_loan_status[par30_outstanding]), SUM(v_loan_status[outstanding]))`. Then try two wrong versions: the **average** of a column `is_par30 = IF(v_loan_status[dpd] > 30, 1, 0)` on all loans, and on loans with outstanding > 0. Which number is PAR30?

**P14.** *(putting it together — grain)* Grain detective. In Power Query, merge `fct_installments` with `v_loan_status` and expand `outstanding` onto the instalments. Load it as a test table and sum `outstanding`. What happened? In the box: Σ outstanding of the test table.

> 🚀 **Stretch (optional, +5 XP).** **P15.** *(Get Data — Folder)* The Folder connector. With pandas, split `v_portfolio_monthly.csv` into three files by year in a new folder (`pm_2024.csv`, `pm_2025.csv`, `pm_2026.csv`). In Power BI: Get data → Folder → *Combine & Transform*. Check rows and the disbursed total, then add a fourth file and refresh. (Or, instead: connect to your SQL Server `nur` database and load the three views by SQL statement.) In the box: the rows after Combine & Transform (three files).

### Mistakes people make

- *Load* instead of *Transform data* — the types are guessed and never checked.
- `bucket`, `vintage` or ids typed as numbers; dates as text — relationships fail or totals are wrong.
- Accepting a many-to-many relationship because "it worked"; setting cross-filter to Both "to make the slicer work".
- Relating two fact tables directly (loans ↔ payments) or merging a loan-level number into a payment-level table.
- No date table, or the date table not marked — time intelligence silently wrong tomorrow.
- Months sorted alphabetically.
- An absolute file path in the source, so the refresh fails on Timur's PC.
- A calculated column for every ratio (or an average of row-level ratios presented as a portfolio ratio).
- Hiding a (Blank) category with a filter instead of fixing the key.
- Reading Column profile on the default first 1 000 rows and concluding "no nulls, no outliers".
- Using the automatic date hierarchy of each date column next to `dim_date` — two calendars, two answers.

---

## 4. Homework <span class="badge hw">HW 7.2 — Due Day 5</span>

**HW 7.1** is due today in Day 1's hand-in box. **HW 7.2 — the model and six base measures.** Hand in with the 📎 box below:

1. `nur_week7.pbix` — the data from `data/powerbi/` (CSV or SQL Server), types set, every README relationship (1 : *, single), `dim_date` marked, sort orders set, the 48-loan fix applied.
2. `model.png` — a screenshot of the Model view where every relationship line is visible.
3. `measures.png` — a table visual by `products[code]` with the six measures below and their total row.

| Measure | Total (no filter) | SME | MICRO |
|---|---|---|---|
| Outstanding | **208 723 504 430** | 125 892 942 411 | 956 106 370 |
| Disbursed Amount | **404 783 280 000** | 241 117 150 000 | 7 221 210 000 |
| Disbursed Count | **7 828** | 781 | 2 669 |
| Avg Ticket | **51 709 668** | 308 728 745 | 2 705 586 |
| PAR30 % | **3.12 %** | 2.55 % | 0.72 % |
| NPL90 % | **2.55 %** | 2.47 % | 0.00 % |

The formulas are in `data/powerbi/measures.dax` (⬇ Download it; Day 4 explains every one). The table above gives the totals; the boxes below check four cells it does not show — read them off your `measures.png` table.

**H1.** Disbursed Amount for AUTO.

**H2.** PAR30 % for CONS (two decimals).

**H3.** NPL90 % for BNPL (two decimals).

**H4.** Avg Ticket for AUTO (whole soum).

### 📎 Hand in here

---

## 5. Self-check

---

## 6. Company corner <span class="badge company">Grain and relationships</span>

Two facts with different grains — a **loan** (one row per loan, `outstanding` as of today) and a **payment** (one row per payment, `amount` on a date) — describe the same business but cannot be joined into one table without breaking one of them. Loan 1 (Termez Central, Consumer) has one row in `v_loan_status` and several in `v_payments_clean`; merge them and its 9 593 064 outstanding appears once **per payment**.

| What was built | Σ outstanding | SME outstanding | Why |
|---|---|---|---|
| `v_loan_status` alone (right) | **208 723 504 430** | **125 892 942 411** | one row per loan |
| payments merged with loans, outstanding expanded (wrong) | 1 527 946 681 726 (×7.3) | 897 676 451 249 (×7.1) | 52 850 payment rows; 7 436 loans have payments, 7.1 each on average |
| instalments merged with loans (wrong) | 6 186 108 589 284 (×29.6) | — | 92 193 instalment rows, 11.8 per loan |

The wrong totals are not even "wrong by a constant": loans with many payments (long SME and Auto terms) are multiplied more, loans with none (392 with no payment yet) vanish from an inner join. No later formula can repair it. And `SELECT DISTINCT` or `Remove duplicates` on the merged table does not repair it either (week 3, habit 4).

**The bridge is the dimensions.** Keep each fact at its own grain; give both the same keys — `product`, `branch_name`, a date — and relate both to the same `products`, `branches`, `dim_date`. A visual by product then asks each fact its own question and puts the answers side by side:

| product | Outstanding (loan fact) | Collected all-time (payment fact) | Collected in Sep 2026 |
|---|---|---|---|
| SME | 125 892 942 411 | 150 391 108 583 | 9 865 366 314 |
| AUTO | 57 684 271 333 | 42 277 105 907 | 2 988 980 257 |
| CONS | 23 054 933 316 | 50 413 160 274 | 2 872 046 580 |
| BNPL | 1 135 251 000 | 5 312 805 543 | 267 479 531 |
| MICRO | 956 106 370 | 6 720 591 869 | 344 950 525 |
| **total** | **208 723 504 430** | **255 114 772 176** | **16 338 823 207** |

Both columns are right, because each measure aggregates its own table and the slicer reaches both through `products`. The same holds for the **date**: `v_loan_status` is dated by disbursement, payments by payment day, instalments by due day — a September filter means three different things in three facts, and each is correct for its question (tomorrow's measures say which). The one thing the star cannot answer by itself is a question that truly needs both grains at once ("collected per loan of each DPD bucket"): then the answer is an aggregate at the coarser grain (payments summed **per loan** in SQL or Power Query, then related as a loan-level column), never the raw merge.

> 🎯 **Interview version.** *"Why not just join all tables into one big flat table for Power BI?"* — Because facts with different grains multiply each other's numbers when joined: a loan's balance repeated on every payment summed to 1.5 trillion instead of 209 billion. A star schema keeps each fact at its grain, relates every fact to shared dimensions (one-to-many, single direction), and lets measures aggregate each fact separately; a filter on a dimension reaches all facts consistently.

**Say it like in an interview.** *"Why not just join all the tables into one big flat table for Power BI?"* Answer in three to five sentences, with one number from today.

Tomorrow: DAX — `CALCULATE`, filter context, time intelligence — and the three pages Bekzod will show the board.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 7 · Day 4 — Power BI II: DAX and visuals that tell the story (weeks/week-07/day-4.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-07/day-4
=====

# Week 7 · Day 4 — Power BI II: DAX and visuals that tell the story

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 60 min</span> <span class="badge hw">HW 7.2 due tomorrow</span> <span class="badge company">Company corner</span>

> STORY **Thursday, 9:00.** Bekzod, portfolio manager (*портфельный менеджер*), with last quarter's board pack: forty Excel screenshots in a PowerPoint. *"Timur says your model is clean. Good — then I want the **board pack in Power BI: a portfolio page, a risk page, a collections page.** Same numbers as the week-3 tiles, so nobody asks why they differ. Every number a board member can click into: which branch, which product, which month. And Sevara wants the collections page for herself every Monday — **her branch managers should see only their own branch.**"* Timur: *"Measures first. Every card is a measure, and every measure is one sentence of DAX — if you understand `CALCULATE`."*

## Today in 3 lines

- **DAX** in one idea: a measure is evaluated in a **filter context** (the slicers, the row and column of the cell); **`CALCULATE`** changes that context. Around it: row context vs filter context, `FILTER`, `ALL` / `ALLEXCEPT` / `REMOVEFILTERS` / `ALLSELECTED`, `DIVIDE`, `VAR … RETURN`, time intelligence (`TOTALYTD`, `SAMEPERIODLASTYEAR`, `DATEADD`), `RANKX`, `SWITCH`, dynamic titles — each with the number it must show (`data/powerbi/measures.dax`, 32 measures).
- **Visuals that tell the story**: cards, line, clustered bar, a matrix with conditional formatting, slicers, drill-through, a tooltip page, bookmarks; the layout rules (top-left = most important, ≤ 7 visuals a page, one colour for "bad").
- **Sharing**: publish to the Power BI Service and schedule a refresh (needs a work account — or share the `.pbix` / a PDF export), and **row-level security** so a branch manager sees one branch. The Company corner specifies the three board pages with every card's expected number.

---

## 1. Learn — one function to understand

> 🧭 **Before you start.** Open yesterday's `nur_week7.pbix` in Power BI Desktop — today builds on that model (if HW 7.2 is not finished, do Day 3's worked example first). Download `data/powerbi/measures.dax` (all 32 measures, to paste from) and, if they are not in your model yet, `data/powerbi/fct_collections_actions.csv`, `data/powerbi/staff_collectors.csv` and `data/powerbi/roll_rates.csv`. The DAX on this page goes into Power BI's formula bar (Home → New measure) — it does not run in the page, and the boxes check the numbers your visuals show. **End state today:** the measures of Practice in the model, the risk matrix with conditional formatting, a drill-through page, a role tested with View as — the raw material for tomorrow's three pages.

### Measure vs calculated column — two contexts

**What it is.** **DAX** (*Data Analysis Expressions*) is Power BI's formula language. It has two homes. A **calculated column** (*вычисляемый столбец*) is computed once per row at refresh, in a **row context** (*контекст строки*): "this row". A **measure** (*мера*) is computed for every cell of every visual, in a **filter context** (*контекст фильтра*): "the rows the filters leave visible".

**How to write it.** Home → **New column** for a column, Home → **New measure** for a measure; the formula bar takes `Name = expression`.

```dax
-- column: one value per loan, read in this row
is_90plus   = IF ( v_loan_status[dpd] > 90, "yes", "no" )
-- measure: one value per cell, over the visible rows
Outstanding = SUM ( v_loan_status[outstanding] )
```

| | calculated column | measure |
|---|---|---|
| computed | once per row, at refresh; stored | at query time, for each cell; stores nothing |
| context | row context: this row | filter context: the slicers, the row and column of the cell |
| use for | values you slice or filter by (a band, a flag, a key) | every number a visual shows, every ratio |
| loan 1 | `is_90plus` = "no" | — (a measure has no value per row) |

**When you use it.** Ask: "will I slice by it, or show it as a number?" Slice → column. Show → measure.

> ⚠️ **Watch out.** In a column, `SUM ( v_loan_status[outstanding] )` ignores the row — a column has no filter context, so it sums the whole table: 208 723 504 430 on every row.

**Your turn.** Nilufar needs a "90+ or not" field to slice by, and the NPL90 % on a card. Which is which?

### The first measures — SUM, COUNTROWS, DIVIDE

**What it is.** Three functions make most measures. **SUM** adds a column over the visible rows. **COUNTROWS** counts the visible rows of a table. **DIVIDE** divides and returns blank (or a value you choose) when the denominator is 0 or blank.

**How to write it.**

```dax
-- SUM ( table[column] )
Disbursed Amount = SUM ( v_loan_status[principal] )
-- COUNTROWS ( table )
Disbursed Count  = COUNTROWS ( v_loan_status )
-- DIVIDE ( numerator, denominator [, if zero] )
Avg Ticket       = DIVIDE ( [Disbursed Amount], [Disbursed Count] )
```

| measure | no filter | SME | MICRO |
|---|---|---|---|
| Disbursed Amount | 404 783 280 000 | 241 117 150 000 | 7 221 210 000 |
| Disbursed Count | 7 828 | 781 | 2 669 |
| Avg Ticket | 51 709 668 | 308 728 745 | 2 705 586 |

Avg Ticket for the whole book: 404 783 280 000 ÷ 7 828 = 51 709 668 soum. A measure can use other measures (`[Disbursed Amount]`) — write each definition once.

**When you use it.** Every card and every value in a table. Then format the measure once (Measure tools → Format) and every visual inherits it.

> ⚠️ **Watch out.** Write ratios with `DIVIDE`, never `/`. `a / b` with b = 0 shows "Infinity" on a card and breaks totals and charts.

**Your turn.** What does `Avg Ticket` show for CONS?

### Filter context in one picture

**What it is.** A measure has no value of its own — only a value **in a cell**. The cell's filters are its filter context: the slicers on the page, the visual's row and column, page and report filters. Relationships carry them from the dimensions to the fact. Then the measure runs over the rows that are left.

**How to read it.** A matrix: rows `branches[branch_name]`, columns `products[code]`, value `Outstanding`.

| | AUTO | SME | Total |
|---|---|---|---|
| Bukhara Central | 2 658 012 650 | **10 343 220 604** | 15 116 046 338 |
| Termez Central | 2 425 978 081 | 6 532 445 882 | 10 670 177 559 |
| Total | 57 684 271 333 | 125 892 942 411 | 208 723 504 430 |

```text
cell "Bukhara Central × SME"
  filter 1:
    branches[branch_name]
      = "Bukhara Central"
    ← the row
  filter 2:
    products[code] = "SME"
    ← the column
  (+ every slicer on the page)
        │
        │ relationships carry both
        │ to v_loan_status
        ▼
  SUM ( v_loan_status[outstanding] )
  over Bukhara's SME loans
  = 10 343 220 604
```

The total row has only the column filter; the grand total has none.

**When you use it.** Every time a number surprises you: list the cell's filters first, then read the formula.

> 💡 **Key idea.** A measure has no value of its own — only a value in a filter context. Change the context and the same formula gives a different number.

**Your turn.** In the matrix above, which filters make the cell "Termez Central × AUTO"?

### CALCULATE — change the filter context

**What it is.** **CALCULATE** evaluates an expression in a **modified** filter context. It is the function behind every "of which" number: outstanding *at more than 30 DPD*, loans *in bucket 90+*.

**How to write it.**

```dax
CALCULATE ( <expression>, <filter 1>, <filter 2>, ... )
--          what to compute   how to change the cell's filters

-- 6 507 526 953
Outstanding DPD30+ = CALCULATE ( [Outstanding], v_loan_status[dpd] > 30 )
-- 3.12 %
PAR30 %            = DIVIDE ( [Outstanding DPD30+], [Outstanding] )
-- 2.55 %
NPL90 %            = DIVIDE ( CALCULATE ( [Outstanding], v_loan_status[dpd] > 90 ), [Outstanding] )
-- 234
Loans 90+          = CALCULATE ( COUNTROWS ( v_loan_status ), v_loan_status[bucket] = "90+" )
```

Three steps, always: (1) take the cell's filter context; (2) apply each filter argument — it **replaces** any existing filter on the same column, and different columns combine with AND; (3) evaluate the expression there. In the SME row, PAR30 uses both filters — `product = SME` from the row, `dpd > 30` from CALCULATE: **2.55 %**; AUTO **4.44 %**, MICRO **0.72 %**. Week 3's SQL `SUM(CASE WHEN dpd > 30 THEN outstanding END) / SUM(outstanding)` is exactly this.

When the condition involves a measure or several columns, write the filter as a table with **FILTER**: `CALCULATE ( [Outstanding], FILTER ( v_loan_status, v_loan_status[dpd] > 30 && v_loan_status[product] <> "MICRO" ) )`. FILTER walks the table row by row — powerful and slower; filter a column, not the whole fact, when you can.

**When you use it.** Any measure that needs a subset (a bucket, a status, a period) or a different set of rows from the cell's (a total, last year).

> ⚠️ **Watch out.** A filter on a column **replaces** the visual's filter on that column. `CALCULATE ( [Outstanding], v_loan_status[bucket] = "90+" )` in a matrix by bucket shows 5 319 475 527 in **every** row. Wrap it in `KEEPFILTERS ( … )` to intersect instead: 90+ keeps its number, the other rows go blank.

**Your turn.** Fill in PAR30.

### Context transition — CALCULATE inside a row

**What it is.** Inside a calculated column (or an iterator such as `SUMX`), CALCULATE turns the **current row** into a filter. This is **context transition** (*преобразование контекста*): the row context becomes a filter context.

**How to write it.** Two columns on `v_loan_status`, read for loan 1:

```dax
-- SUM sees the whole table
share = v_loan_status[outstanding] / SUM ( v_loan_status[outstanding] )
-- CALCULATE makes "loan 1" a filter
own   = CALCULATE ( SUM ( v_loan_status[outstanding] ) )
```

| loan_id | outstanding | share | own |
|---|---|---|---|
| 1 | 9 593 064 | 0.0046 % | 9 593 064 |

`share`: 9 593 064 ÷ 208 723 504 430 — the whole book is the denominator. `own`: the sum over the rows that match loan 1 — just loan 1.

**When you use it.** You rarely write it on purpose; you meet it whenever a measure is called inside a column or an iterator (`[Outstanding]` in a column means `CALCULATE ( SUM ( … ) )`). It explains half of all DAX surprises.

> ⚠️ **Watch out.** A measure used in a calculated column is evaluated per row with context transition — on a large fact that is slow. Keep row-by-row logic in columns of plain values; keep aggregations in measures.

**Your turn.** In a calculated column on `v_loan_status`, what does `CALCULATE ( COUNTROWS ( v_loan_status ) )` return on each row?

### ALL and its relatives — the denominators

**What it is.** A share needs a denominator with **fewer** filters than the cell. **ALL** removes filters inside CALCULATE. Its relatives remove different amounts:

| function | removes | with a branch slicer on Tashkent Central, the SME row shows |
|---|---|---|
| `ALL ( products )` = `REMOVEFILTERS ( products )` | filters on `products` only | **55.30 %** (SME's share of Tashkent Central) |
| `ALL ( v_loan_status )` | every filter reaching the fact, including those from its dimensions | **7.61 %** (Tashkent Central SME ÷ the whole book) |
| `ALLEXCEPT ( v_loan_status, branches[branch_name] )` | everything except the branch | 55.30 % |
| `ALLSELECTED ( products )` | the row's product filter; keeps the user's slicer selections | depends on the product slicer |

**How to write it.**

```dax
Outstanding Share of Total =
DIVIDE (
    -- the cell's own outstanding
    [Outstanding],
    -- the same, with the product filter removed
    CALCULATE ( [Outstanding], ALL ( products ) )
)
-- no slicer: SME 60.32 % · AUTO 27.64 % · CONS 11.05 % · BNPL 0.54 % · MICRO
-- 0.46 % · total 100 %
```

**When you use it.** Any "share of" or "% of total": name the denominator first ("of this branch", "of the whole book", "of what the user selected"), then pick the function.

> ⚠️ **Watch out.** `CROSSFILTER ( …, BOTH )` inside one measure is how you get bidirectional filtering for one calculation — never by switching the model's relationship to Both.

**Your turn.**

### Time intelligence — TOTALYTD, SAMEPERIODLASTYEAR, DATEADD

**What it is.** **Time intelligence** (*логика операций со временем*) functions return **a set of dates**, and CALCULATE uses that set as the filter. They work only with a marked, gap-free date table related to the fact (Day 3).

**How to write it.**

```dax
-- 1 January → the cell's last date
YTD Disbursed        = TOTALYTD ( [Disbursed Amount], dim_date[date] )
-- the same dates, a year back
Disbursed SPLY       = CALCULATE ( [Disbursed Amount], SAMEPERIODLASTYEAR ( dim_date[date] ) )
-- shift by any number of days / months / years
Disbursed Prev Month = CALCULATE ( [Disbursed Amount], DATEADD ( dim_date[date], -1, MONTH ) )
Disbursed YoY %      = DIVIDE ( [Disbursed Amount] - [Disbursed SPLY], [Disbursed SPLY] )
Disbursed MoM %      = DIVIDE ( [Disbursed Amount] - [Disbursed Prev Month], [Disbursed Prev Month] )
```

| `dim_date[year_month]` | Disbursed | YTD | SPLY | YoY % | Prev Month | MoM % |
|---|---|---|---|---|---|---|
| 2026-08 | 22 290 210 000 | 144 464 810 000 | 17 667 620 000 | +26.16 % | 20 693 870 000 | +7.71 % |
| 2026-09 | 17 015 490 000 | 161 480 300 000 | 14 644 540 000 | +16.19 % | 22 290 210 000 | −23.66 % |

September 2026: 17.0 bn disbursed, 16.2 % more than September 2025 but 23.7 % less than August. YTD at September: 161.5 bn, against 110.9 bn at the same point last year (+45.6 %).

**When you use it.** Every "so far this year", "same month last year", "previous month" on a card or a table — on the `dim_date` axis.

> ⚠️ **Watch out.** Without a marked, contiguous `dim_date`, or with a visual on the fact's own date column, these functions return blanks or wrong periods without an error.

**Your turn.** What does `Disbursed Prev Month` show in the August 2026 row?

### Balances over time — semi-additive measures

**What it is.** A **flow** (disbursed, collected) adds up over time. A **balance** (outstanding) does not: the book at the end of the year is the last month's balance, not the sum of twelve. A measure that sums over everything except time and takes the **last period** is **semi-additive** (*полуаддитивная мера*).

**How to write it.**

```dax
Outstanding Month-End =
-- the last month visible in the cell
VAR LastMonth = CALCULATE ( MAX ( v_portfolio_monthly[month] ) )
RETURN
    CALCULATE ( SUM ( v_portfolio_monthly[outstanding_month_end] ),
                -- sum products and branches, for that month only
                v_portfolio_monthly[month] = LastMonth )
```

| period | plain `SUM` of month-end | `Outstanding Month-End` |
|---|---|---|
| Aug 2026 | 203 830 205 928 | 203 830 205 928 |
| Sep 2026 | 208 243 879 623 | 208 243 879 623 |
| year 2026 (Jan–Oct) | **1 808 092 257 935** — ten balances added | 196 392 195 577 — October, the last month |
| year 2026, months ≤ Sep | — | **208 243 879 623** |

**When you use it.** Every balance on a trend line or a year total: outstanding, number of active loans, headcount.

> ⚠️ **Watch out.** `v_loan_status` is dated by **disbursement**. A month slicer on the card `Outstanding` shows the outstanding of loans disbursed that month (September 2026: 16 965 990 458), not the book at September's end. The trend line uses `Outstanding Month-End`; the card says "as of 1 Oct 2026".

**Your turn.** Which measure goes on a monthly line chart of the book?

### Variables — VAR … RETURN

**What it is.** A **variable** (*переменная*) names an intermediate result inside a measure. It is evaluated **once**, in the context where it is defined, and then stays a constant. `RETURN` gives the result.

**How to write it.** A Pareto curve by branch: each branch's outstanding plus every larger branch's.

```dax
Running Outstanding =
-- this branch's outstanding, computed once
VAR CurrentOutstanding = [Outstanding]
RETURN
    CALCULATE (
        [Outstanding],
        -- walk all ten branches
        FILTER ( ALL ( branches[branch_name] ),
                 -- keep those at least as large
                 [Outstanding] >= CurrentOutstanding )
    )
Running Outstanding % = DIVIDE ( [Running Outstanding], CALCULATE ( [Outstanding], ALL ( branches ) ) )
```

| branch (sorted by Outstanding) | Outstanding | Running Outstanding % |
|---|---|---|
| Tashkent Central | 28 716 674 373 | 13.76 % |
| Tashkent South | 26 787 392 136 | 26.59 % |
| Tashkent North | 26 175 671 562 | 39.13 % |
| Fergana Central | 24 797 334 197 | **51.01 %** |

Four of ten branches hold half the book.

**When you use it.** Whenever a value is needed twice, or must be fixed before the context changes. It also makes long measures readable.

> ⚠️ **Watch out.** Without the variable, `[Outstanding]` inside FILTER is evaluated for each iterated branch — every branch compares itself with itself, and every row shows 100 %.

**Your turn.** One line of this measure breaks the Pareto curve.

### RANKX — a rank inside a filter context

**What it is.** **RANKX** walks a table, evaluates an expression for each row, and returns the position of the current cell's value among them.

**How to write it.**

```dax
Branch Rank =
IF (
    -- only in rows with one branch (blank on the total)
    HASONEVALUE ( branches[branch_name] ),
    -- rank among all ten branches
    RANKX ( ALL ( branches[branch_name] ),
            -- by Outstanding, largest first
            [Outstanding], , DESC, DENSE )
)
```

Tashkent Central 1, Tashkent South 2, … Bukhara Central 8, Nukus Central 9, Termez Central 10. A product slicer on SME re-ranks: Tashkent South 1, Tashkent Central 2, Samarkand Central 3.

**When you use it.** Top-N lists, "where does this branch stand", league tables that follow the slicers.

> ⚠️ **Watch out.** Without `ALL`, each row's table holds only its own branch, and every branch ranks 1.

**Your turn.** What is Bukhara Central's `Branch Rank` with no slicer?

### Choosing visuals by the question

**What it is.** Each visual answers one kind of question. Pick the question first, then the visual — week 4's table, in Power BI.

**How to write it.** Insert from the **Visualizations** pane; drag fields into its wells (Axis, Values, Rows, Columns).

| question | visual | settings that matter |
|---|---|---|
| one number now | **Card** (or the new card visual) | the measure's format; a subtitle with the definition |
| a trend | **Line chart** on `dim_date[year_month]` | the Month-End measure for balances |
| compare categories | **Clustered bar** (horizontal, sorted) | data labels; no 3D, no pie with 5+ slices |
| two dimensions at once | **Matrix** with conditional formatting | colour by a rule or a colour measure |
| a share of a whole, ≤ 3 parts | **Donut / pie**, or a 100 % bar | otherwise a sorted bar |

**When you use it.** Every visual you add. If you cannot say its question in one sentence, it does not belong on the page.

> ⚠️ **Watch out.** A pie of five products makes 0.46 % and 0.54 % unreadable. A sorted bar shows the same shares and the order.

**Your turn.**

> 🎬 **Didn't get which visual to choose?** [A short explanation · 4 min](https://youtu.be/FwjaHCVNBWA?t=4410&end=4640)

> 🎬 **Didn't get stacked and 100% stacked bars?** [A short explanation · 4 min](https://youtu.be/FwjaHCVNBWA?t=5270&end=5530)

### Slicers, drill-through and tooltips

**What it is.** Three ways to let the reader ask the next question. A **slicer** (*срез*) filters the page. **Drill-through** (*детализация*) jumps from a value to a detail page for it. A **tooltip page** (*всплывающая подсказка*) shows a small page when the reader hovers.

**How to write it.**
1. **Slicer**: add a Slicer visual with `products[code]`. View → **Sync slicers** to make it filter other pages too.
2. **Drill-through**: a new page *Branch detail*; drag `branches[branch_name]` into its **Drill through** well; add cards and a table of the branch's 90+ loans. Power BI adds a Back button.
3. **Use it**: right-click Bukhara Central in any visual → Drill through → *Branch detail* → Outstanding 15 116 046 338, PAR30 4.81 %, Loans 90+ 23 (of 650 loans).
4. **Tooltip page**: a new page → Page information → **Allow use as tooltip**, small canvas; then in a visual's Format → Tooltip → Page → that page.
5. **Bookmarks** (View → Bookmarks) save a view of the page — e.g. "all loans" vs "delinquent only" — for a guided story. Keep them few.

**When you use it.**

| the reader wants… | use |
|---|---|
| to choose a product, branch or month | slicer (synced across pages) |
| the detail behind one value | drill-through |
| context (n, a definition) without leaving the chart | tooltip page |

> ⚠️ **Watch out.** A slicer that is not synced filters one page only — the next page silently shows the unfiltered book.

**Your turn.** A board member wants to right-click Nukus Central in the risk matrix and see that branch's 90+ loans. What do you build?

### Formatting that respects the reader

**What it is.** Formatting is part of the message. A page is read **top-left first**; a colour means something only if it is used for one thing.

**How to write it.**
1. **Layout** — top row: cards (KPIs), the most important top-left; middle: trends; bottom: detail tables. At most **7 visuals** a page.
2. **Colour** — one colour for "bad" (red), greys and one accent for everything else. Red is never a series colour.
3. **Conditional formatting** by a colour measure: Format → Cell elements → Background colour → **fx** → Format style *Field value* → the measure.

```dax
PAR30 Colour =
-- the first true condition wins, like CASE WHEN
SWITCH ( TRUE (),
    [PAR30 %] >= 0.05, "#C0392B",  -- 5 % and above: red
    [PAR30 %] >= 0.03, "#E67E22",  -- 3–5 %: amber
    "#7F8C8D" )                    -- otherwise: grey
```

4. **Titles that state the finding** — "PAR30 is concentrated in Nukus SME and Bukhara", not "PAR30 by branch". A **dynamic title** says what is selected:

```dax
-- the selection, or a default
Dynamic Title = "Outstanding - " & SELECTEDVALUE ( products[product_name], "all products" )
              & " · as of 1 Oct 2026: " & FORMAT ( [Outstanding] / 1e9, "#,0.0" ) & " bn soum"
-- no selection: "Outstanding - all products · as of 1 Oct 2026: 208.7 bn soum"
```

Use it: Format → Title → **fx** → Field value → `Dynamic Title`.

5. **As-of date and definitions** on every page, the same slicers in the same place.

**When you use it.** Before anyone else sees the page — and again before the PDF export.

> ⚠️ **Watch out.** A screenshot of a filtered page without a dynamic title or a visible slicer lies: it looks like the whole book.

**Your turn.** Which choices respect the reader? Tick every one.

### Publish and refresh

**What it is.** **Publishing** (*публикация*) uploads the `.pbix` to the **Power BI Service**, where a **scheduled refresh** (*обновление по расписанию*) re-reads the sources and people open the report in a browser.

**How to write it.**
1. Home → **Publish** → a workspace (needs a work or school Microsoft account; personal Gmail / Mail.ru accounts are not accepted).
2. In the Service: the semantic model (dataset) → Settings → **Scheduled refresh** (Pro: up to 8 a day).
3. Files on your PC or a SQL Server inside the bank need an **on-premises data gateway** (*шлюз данных*) installed on a machine that can see them.
4. Share: a **workspace** for builders, an **app** for readers, a **dashboard** (pinned tiles) for executives.
5. **Without a work account** (the course default): share the `.pbix`, or File → Export → **Export to PDF** — every page, the board-pack format. Say which you used.

**When you use it.** Once the numbers match the SQL and the pages pass the formatting check.

> ⚠️ **Watch out.** A scheduled refresh of a report that reads `C:\…\data\powerbi\` fails in the Service unless a gateway can reach that folder.

**Your turn.** The report is published; its scheduled refresh fails with "data source unreachable". The sources are CSVs on your laptop. What is missing?

### Row-level security

**What it is.** **Row-level security** (*безопасность на уровне строк*, RLS) gives a role a DAX filter. A user in the role sees only the rows the filter leaves — on every page, in every measure.

**How to write it.**
1. Modeling → **Manage roles** → New role *Branch manager — Bukhara*.
2. On the `branches` table, the filter:

```dax
-- a static role: one per branch
[branch_name] = "Bukhara Central"
-- dynamic, one role for all managers, with a mapping table of e-mail → branch:
-- [branch_name] = LOOKUPVALUE ( map[branch_name], map[email], USERPRINCIPALNAME
-- () )
```

3. Modeling → **View as** → the role. The filter flows through the relationships to every fact:

| card | as yourself | View as *Branch manager — Bukhara* |
|---|---|---|
| Outstanding | 208 723 504 430 | 15 116 046 338 |
| PAR30 % | 3.12 % | 4.81 % |
| Branch Rank | — | 1 |

4. In the Service: semantic model → Security → add people to the role. In Desktop you can only test.

**When you use it.** Whenever one report serves people who may see only part of the data — Sevara's branch managers.

> ⚠️ **Watch out.** RLS removes rows before any measure runs: `ALL ( branches )` cannot escape it, so a rank under RLS is always 1. And RLS restricts rows, not pages — a page a manager must not see belongs in a separate report.

**Your turn.** Viewed as *Branch manager — Bukhara*, what does the card `Loans 90+` show?

### Putting it together

One card, every concept of the section:

| Concept | On this card |
|---|---|
| measure vs column | PAR30 % is a measure; par30_outstanding is not needed — CALCULATE does it |
| first measures | `Outstanding = SUM ( … )`; DIVIDE for the ratio |
| filter context | each matrix cell: branch × product (+ slicers) |
| CALCULATE | `Outstanding DPD30+ = CALCULATE ( [Outstanding], dpd > 30 )` |
| ALL | a share of the whole book next to it |
| time intelligence | the PAR30 trend uses dim_date; balances use Month-End |
| VAR, RANKX | the worst branch named by rank |
| visuals | a card top-left, a matrix with PAR30 Colour, a drill-through to the branch |
| publish, RLS | a PDF for the board; each manager sees her branch |

The worked example below builds exactly this card and its next question.

**Your turn.** Review the words of the day.

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Measures vs columns — [Learn 80% of DAX in an Hour (Chandoo), 13:39](https://youtu.be/lD7TvkoQ6rY?t=819&end=908)
- ▶ CALCULATE — [Learn 80% of DAX in an Hour (Chandoo), 34:18](https://youtu.be/lD7TvkoQ6rY?t=2058&end=2541)
- ▶ CALCULATE (short, one idea) — [DAX CALCULATE Function Made Easy to Understand (Leila Gharani), 00:38](https://youtu.be/40xO1MD_CCs?t=38&end=241)
- ▶ Time intelligence — [Time Intelligence DAX | Current, Previous & SamePeriodLastYear | MTD QTD YTD | MoM QoQ YoY POWER BI (Rahim Zulfiqar Ali), 13:07](https://youtu.be/WsWDjH-CgHg?t=787&end=969)
- ▶ Time intelligence, needs the marked date table — [My number 1 trick for TIME INTELLIGENCE (How to Power BI), 00:30](https://youtu.be/I8Y5fBGwqeQ?t=30&end=66)
- ▶ Visuals — [Power BI for Data Analytics - Full Course for Beginners (Luke Barousse), 1:13:27](https://youtu.be/FwjaHCVNBWA?t=4407&end=5536)
- ▶ Visuals and the full project — [Learn Power BI in Under 3 Hours (Alex The Analyst), 1:09:26](https://youtu.be/I0vQ_VLZTWg?t=4166&end=4960)

- RU deck (TBC Data Analytics 2.0, if you have it) `Power BI 7.2.pptx`: M vs DAX — slide 9; DAX syntax, types, operators — slides 10–12; the most used functions (math and statistics, `DIVIDE`; logical `IF`, `AND`, `OR`) — slides 13–14; links — slide 15. RU deck (TBC Data Analytics 2.0, if you have it) `Power BI 7.3.pptx`: why visualise and visual categories — slides 3–6; **allocation of visuals (top / middle / bottom)** — slide 7; publishing to the web, refresh settings — slides 8–9; dashboards vs reports, sharing — slides 10–12; homework — slide 13.
- `Power BI 7.2.pbix`, `Power BI 7.3.pbix` — the lecture files (binary; open them in Power BI Desktop, not readable here). `Homework.zip` — the 7.3 homework: `flights.csv` (72 MB, US flights), `airline_carriers.csv` and a task list: load and relate, a calculated column *Delay / On-Time* (`DepDelay` or `ArrDelay` > 0), a visual of the % share of each status, flights by carrier name, then a **Top N** filter to the top 5 carriers. A good extra hour on someone else's data with exactly today's tools.
- DAX guide `Подробное руководство по DAX.pdf` (PDF page = book page): calculated columns vs measures pp. 51–56, variables p. 56; `ALL` / `ALLEXCEPT` pp. 90–104; **evaluation contexts** pp. 105–141 (filter context p. 106, row context p. 112); **`CALCULATE`** pp. 142–205 (context transition pp. 177–193, modifiers pp. 194–203); variables pp. 206–218; iterators and **`RANKX`** pp. 219–248 (`RANKX` p. 235); **time intelligence** pp. 249–312; working with the filter context pp. 348–380. Read chapters 4 and 5 once; come back to 8 when a YTD looks wrong.
- *Russian terms:* мера = measure, вычисляемый столбец = calculated column, контекст строки / фильтра = row / filter context, преобразование контекста = context transition, итератор = iterator, переменная = variable, логика операций со временем = time intelligence, нарастающий итог с начала года = year-to-date, аналогичный период прошлого года = same period last year, полуаддитивная мера = semi-additive measure, ранжирование = ranking, условное форматирование = conditional formatting, срез = slicer, детализация = drill-through, всплывающая подсказка = tooltip, закладка = bookmark, публикация = publish, шлюз данных = data gateway, безопасность на уровне строк = row-level security.

---

## 2. Worked example — the PAR30 card that answers the next question (15 min)

**Ask:** Bekzod's risk page needs PAR30 on a card — and the board's next question ("where?", then "why there?") one click away. Each step names the concept it uses.

1. **First measures + CALCULATE** — `Outstanding DPD30+ = CALCULATE ( [Outstanding], v_loan_status[dpd] > 30 )` and `PAR30 % = DIVIDE ( [Outstanding DPD30+], [Outstanding] )`, format Percentage, 2 decimals. Card, top-left: **3.12 %**.
2. **Filter context, choosing the visual** — a **matrix**: rows `branches[branch_name]`, columns `products[code]`, value `PAR30 %`. Each cell is PAR30 in its own branch × product context.
3. **Formatting** — Format → Cell elements → Background colour → fx → Format style *Field value* → `PAR30 Colour`. Eight cells turn red (5 % and above); the highest: **Nukus Central SME 9.02 %**, Samarkand Central AUTO 7.02 %, Tashkent North CONS 6.84 %, Bukhara Central CONS 6.26 %. Row totals: Nukus Central **6.84 %**, Bukhara Central 4.81 %, … Termez Central 0.68 %.
4. **A title that states the finding** — static and true: *"PAR30 is concentrated in Nukus SME and Bukhara"*; or by measure: `"PAR30 " & FORMAT ( [PAR30 %], "0.00%" ) & " — highest: Nukus Central"`.
5. **Drill-through** — a page *Branch detail* with `branches[branch_name]` in the drill-through well, cards for Outstanding, PAR30 %, NPL90 %, Loans 90+, and a table of the branch's 90+ loans. Right-click Bukhara Central → Drill through → Outstanding 15 116 046 338, PAR30 4.81 %, NPL90 4.48 %, Loans 90+ **23** (of 650 loans).
6. **The next question** — "why Nukus?" is now one click away: the drill-through shows that Nukus's 910 474 902 at risk is mostly **two SME loans** (452 263 008 at 96 days and 243 287 174 at 246 days: 76 % of it) — a concentration, not a trend.

---

## 3. Practice (60 min)

Continue in `nur_week7.pbix`. Paste the measures from `data/powerbi/measures.dax` as you need them, but **type** the ones named in each task — you learn DAX by writing it. Type the number (or name) your visual shows into the box under each question; it checks it and then shows the model answer.

**P1.** *(measure vs calculated column)* A colleague added a calculated column `rate = DIVIDE ( fct_installments[paid_to_asof], fct_installments[total_due] )` and shows its **Average** on the collections card as "collection rate". What is wrong, and what replaces it?

**P2.** *(SUM, COUNTROWS, DIVIDE)* Type `Disbursed Amount`, `Disbursed Count` and `Avg Ticket`. Put a month slicer on September 2026. What does the card `Avg Ticket` show?

**P3.** *(filter context, CALCULATE)* Type `Outstanding DPD30+`, `PAR30 %`, `NPL90 %`, `Loans 90+` and put them in a table by product. Check against week 3. In the box: PAR30 % for AUTO, to 2 decimals.

**P4.** *(CALCULATE — replace or KEEPFILTERS)* A matrix by `v_loan_status[bucket]` with `Outstanding` and `M90 = CALCULATE([Outstanding], v_loan_status[bucket] = "90+")`. Then change it to `CALCULATE([Outstanding], KEEPFILTERS(v_loan_status[bucket] = "90+"))`. Explain both.

**P5.** *(context transition)* Row vs filter context. Add two calculated columns on `v_loan_status`: `share = v_loan_status[outstanding] / SUM(v_loan_status[outstanding])` and `own = CALCULATE(SUM(v_loan_status[outstanding]))`. What do they show for loan 1, and why are they different? In the box: the value of the column own for loan 1.

**P6.** *(ALL and its relatives)* `Outstanding Share of Total` with `ALL(products)`, then a version with `ALL(v_loan_status)`. Add a branch slicer on Tashkent Central. What does the SME row show in each, and which question does each answer? In the box: the SME row with ALL(v_loan_status), Tashkent Central selected, to 2 decimals.

**P7.** *(time intelligence)* Time intelligence: `YTD Disbursed`, `Disbursed SPLY`, `Disbursed YoY %`, `Disbursed Prev Month`, `Disbursed MoM %` in a table by `dim_date[year_month]`. Report September 2026; then unmark the date table and say what breaks. In the box: YTD Disbursed for September 2026.

**P8.** *(balances over time)* Balances over time: `Outstanding Month-End` and a plain `SUM(v_portfolio_monthly[outstanding_month_end])` in a table by month, then by year. What do the totals show? In the box: the plain SUM's total for the year 2026.

**P9.** *(VAR … RETURN)* Type `Running Outstanding` with `VAR … RETURN` and `Running Outstanding %`; show them by branch sorted by Outstanding. How many branches hold half the book? Then rewrite without the variable and compare. In the box: how many branches, largest first, hold at least half the book.

**P10.** *(RANKX)* `Branch Rank` with `RANKX`. Show it for all products, then with a product slicer on SME. Then remove `ALL` from the formula and explain the result. In the box: the branch that ranks 1 with the product slicer on SME.

**P11.** *(choosing visuals, tooltips, formatting)* The risk matrix (worked example) plus a line of `FPD30 %` by `fct_first_instalment[vintage]` for 2025–2026, with `FPD30 Loans in Scope` in the tooltip. Which vintages should not be on the chart, and what are the highest points? In the box: the vintage with the highest FPD30 % among vintages with at least 50 loans (YYYY-MM).

**P12.** *(drill-through)* Build the *Branch detail* drill-through page (worked example, step 5) and drill through from **Nukus Central**. How many of its loans are 90+?

**P13.** *(publish and refresh)* You have no work or school account. How do you deliver the board pack so that Bekzod can read it and Timur can refresh it?

**P14.** *(row-level security)* Row-level security: create the role *Branch manager — Bukhara* (`branches[branch_name] = "Bukhara Central"`), then Modeling → **View as** the role. Report the risk cards, then look at `Branch Rank` and `Outstanding Share of Total`. In the box: Outstanding as seen through the Bukhara role.

> 🚀 **Stretch (optional, +5 XP).** **P15.** *(putting it together — the collections page)* The collections page measures: `Actions`, `Contact Rate`, `Promise-to-Pay Rate`, `Paid-on-Action Rate` for September 2026, by action type and by collector; put a **Top N** filter (Filters pane → Filter type *Top N*, by `Actions`) on the collector table to show the five busiest (group by staff_collectors[collector_id] with the name next to it: two different collectors, in Tashkent Central and Namangan Central, are both called Nilufar Jalilov, and a table on the name alone merges them into one row of 52). What would you tell Sevara, and what would you not? In the box: Actions in September 2026.

### Mistakes people make

- `SUM` in a calculated column expecting the row's group total; a ratio as a column.
- A `CALCULATE` filter that silently replaces the visual's filter on the same column (same number in every row).
- `a / b` instead of `DIVIDE`; percentages averaged across rows instead of a ratio of sums.
- Summing balances over months (Outstanding over a year); putting the as-of `Outstanding` on a monthly trend line.
- Time intelligence without a marked, gap-free date table — or on the fact's own date column.
- `RANKX` without `ALL`; rank shown on the total row.
- Ten visuals, four colours for categories and red for one of them; titles that name the chart instead of the finding.
- A slicer on one page that does not sync to the others; no "as of" on the page.
- Testing RLS only as yourself; expecting `ALL` to escape it.

---

## 4. Homework

**HW 7.2** (the model and six base measures) is due **tomorrow** in Day 3's hand-in box. Tomorrow's checkpoint Part B is the three pages below — build what you can today: the measures are all in `measures.dax`.

---

## 5. Self-check

---

## 6. Company corner <span class="badge company">The three-page lending dashboard</span>

The board pack Bekzod asked for. Every page: the same top strip — title, "Data as of 1 Oct 2026", slicers for **product**, **branch (or region)** and **month** (synced across pages) — then ≤ 7 visuals, top to bottom: cards, trend, detail. Numbers below are with **no slicer selected** unless the card says otherwise; they are the values `measures.dax` produces from `data/powerbi/`.

**Page 1 — Portfolio** *("How big is the book, and where is it growing?")*

| Visual | Measure(s) | Expected |
|---|---|---|
| Card | `Outstanding` (+ `Loans Outstanding` in the subtitle) | **208 723 504 430** · 3 409 loans |
| Card | `Disbursed Amount`, `Disbursed Count` — month filter Sep 2026 | **17 015 490 000** · 361 loans |
| Card | `YTD Disbursed` at Sep 2026, `YoY` on YTD | **161 480 300 000** · +45.6 % vs 110 929 400 000 |
| Card | `Avg Ticket`, Sep 2026 | **47 134 321** (all time 51 709 668) |
| Line | `Outstanding Month-End` by month, Jan–Sep 2026 | 151 807 386 149 → **208 243 879 623** |
| Clustered column | `Disbursed Amount` by month 2026, `Disbursed MoM %` in the tooltip | Jul 20.69 bn · Aug 22.29 bn · **Sep 17.02 bn (−23.66 %)** |
| Clustered bar | `Outstanding` and `Outstanding Share of Total` by product | SME 125.89 bn (60.32 %) · AUTO 27.64 % · CONS 11.05 % · BNPL 0.54 % · MICRO 0.46 % |
| Matrix (or the drill-through) | `Outstanding`, `Branch Rank`, `Running Outstanding %` by branch | Tashkent Central 1 (13.76 %) … 4 branches = 51.01 % |

**Page 2 — Risk** *("Is the book getting worse, and where?")*

| Visual | Measure(s) | Expected |
|---|---|---|
| Card | `PAR30 %` (+ `Outstanding DPD30+`) | **3.12 %** · 6 507 526 953 |
| Card | `NPL90 %` (+ `Loans 90+`) | **2.55 %** · 234 loans |
| Card | `FPD30 %`, last mature vintage (Jul 2026) | **1.09 %** (4 / 367); all vintages 1.28 % (91 / 7 099) |
| Card | `Cure Rate 1-30` / `Roll Forward 1-30` (1 Sep → 1 Oct) | **75.78 %** / 19.53 % |
| Matrix, conditional formatting | `PAR30 %` by branch × product | worst cell Nukus Central SME **9.02 %**; worst branch Nukus 6.84 %; best Termez 0.68 % |
| Line | `FPD30 %` by vintage (n ≥ 50), n in the tooltip | Apr 2025 3.11 % peak; 2026 vintages 0.00–1.86 % |
| Matrix | `roll_rates[loans]` from × to bucket, % of row total | 1-30: 97 → 0, 6 stay, 25 → 31-60; 61-90 → 90+ 17 of 17 |

**Page 3 — Collections** *("Is the money coming in, and is the effort working?")*

| Visual | Measure(s) | Expected |
|---|---|---|
| Card | `Collection Rate`, due in Sep 2026 (Aug in the subtitle) | **94.08 %** (Aug 96.52 %) |
| Card | `Collected Amount`, paid in Sep 2026 | **16 338 823 207** |
| Card | `Actions`, `Contact Rate`, Sep 2026 | **651** · 72.81 % |
| Card | `Promise-to-Pay Rate` / `Paid-on-Action Rate`, Sep 2026 | **28.57 %** / 22.73 % |
| Clustered bar, sorted | `Collection Rate` by branch, Sep 2026 | Termez 97.68 % … Bukhara 92.31 %, Namangan 91.48 %, **Tashkent South 91.44 %** |
| Stacked bar | `Actions` by action type × outcome, Sep 2026 | SMS: most promises (38.0 %), fewest payments (13.0 %); calls paid 28.7 % |
| Table, Top N = 5 by `Actions` | collector (`collector_id` and name: two collectors are called Nilufar Jalilov), `Actions`, `Contact Rate`, `Paid-on-Action Rate` | Bekzod Mirzaev 39 · Bobur Tashkentov 38 · Malika Jalilov 37 · Nilufar Jalilov (Tashkent Central) 34 · Ilhom Qodirov 32 |

**The definitions line.** Under each page, one line of small text: *Outstanding = principal due after 1 Oct 2026 (week 3); PAR30 / NPL90 = share of outstanding with DPD > 30 / > 90; FPD30 = first instalment not fully paid within 30 days; Collection rate = paid by 1 Oct ÷ due, instalments due in the month.* A board member who asks "how is this calculated?" gets the answer without a meeting — and the numbers are the same as the week-3 tiles because they come from the same views.

> 🎯 **Interview version.** *"Design a dashboard for a lending portfolio."* — Three questions, three pages: how big and growing (outstanding, disbursements, ticket, mix), how risky (PAR30, NPL90, FPD by vintage, roll rates), how well collected (collection rate, effort and outcome). KPI cards top-left, trends in the middle, detail at the bottom, ≤ 7 visuals a page, one colour for bad, synced slicers, an as-of date and the definitions on the page; each number a measure that reconciles with the SQL source, and RLS so branch managers see their own branch.

**Say it like in an interview.** *"Design a dashboard for a lending portfolio."* Answer in four to six sentences, naming the pages, the layout rules and how you keep the numbers right.

Tomorrow: Checkpoint 7 — the A/B notebook with its decision memo, these three pages as a `.pbix` and a PDF, and eight interview questions.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 7 · Day 5 — Checkpoint: A/B notebook + 3-page dashboard (weeks/week-07/day-5.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-07/day-5
=====

# Week 7 · Day 5 — Checkpoint: A/B notebook + 3-page dashboard

<span class="badge">A/B analysis 120 min</span> <span class="badge">Dashboard 120 min</span> <span class="badge">Interview 30 min</span> <span class="badge hw">Checkpoint · 100 points</span>

> STORY **Friday, 9:00.** Five people, two deliverables. Kamola and Nilufar: *"Tuesday's readout was for the whole app. The rollout starts in the regions, and the regional sales head wants his own — the seven regions outside Tashkent, as a notebook anyone can re-run, with the decision memo at the end. If the iOS bug or the leak touches his users, it must be in it."* Bekzod and Timur: *"The board pack: three pages, the numbers from the week-3 tiles, a PDF for the board and the `.pbix` for us. Timur will open it and press Refresh; if anything breaks, it is not done."* Madina: *"And eight questions every analyst interview asks this year. A/B testing and Power BI are on every job advert in this city."*

## Today in 3 lines

- **Part A (40 pts):** `checkpoint_ab.ipynb` from `data/python/week7/checkpoint_ab_template.ipynb` — the full offer-screen analysis on `data/ab/` for the users outside Tashkent: sanity checks, novelty, the primary result, funnel and money, the FPD guardrail with unit economics, segments with Holm, and the **decision memo**.
- **Part B (40 pts):** the **3-page Power BI dashboard** (Portfolio, Risk, Collections) on `data/powerbi/` — `nur_dashboard.pbix`, a PDF export, a screenshot of each page; graded by the numbers each card must show.
- **Part C (20 pts):** eight interview questions (SRM, peeking, MDE, guardrails, A/A, `CALCULATE` and filter context, measure vs calculated column, the star schema in Power BI), 3–5 sentences each, in `quiz.md`.

**Rules.**

- **Open book:** this week's pages, your notebooks, `data/ab/README.md`, `data/powerbi/README.md`, `measures.dax`.
- **Closed:** the model answers, until you submit.
- **Hand in** with the **📎 box at the end of this page**: `checkpoint_ab.ipynb` (executed — Kernel → Restart & Run All, then save), `nur_dashboard.pbix`, `nur_dashboard.pdf`, `page1_portfolio.png`, `page2_risk.png`, `page3_collections.png`, `quiz.md`.
- **Also due today:** **HW 7.2** in Day 3's box.
- **Power BI click paths** are for the current Desktop release; if a menu has moved in yours, the result is graded, not the path.

**Plan for the day.**

| Time | What | Output |
|---|---|---|
| 9:00–9:15 | The warm-up below (six quick checks); read all three parts; open the template; Restart & Run All (the loader asserts 27 974 / 67 215 / 2 583) | a green first cell |
| 9:15–11:15 | Part A, A1 → A6, then the memo | six result cells, six interpretations, one memo |
| 11:15–11:30 | Break; Restart & Run All; save | `checkpoint_ab.ipynb` with outputs |
| 11:30–13:30 | Part B: the three pages on yesterday's model; check every card against the checklist | `.pbix`, PDF, three PNGs |
| 13:30–14:00 | Part C in `quiz.md` | eight answers |
| 14:00–14:15 | The checklist at the end; hand in (box below) | done |

---

## Warm-up (not graded, 10 min) — six quick checks

Ten minutes before the notebook: six quick checks that wake up Days 1–4. Answer each in its box — nothing here is graded.

**W1.** An experiment ends with 14 050 users in A and 13 950 in B (planned 50/50). What is the SRM p-value?

**W2.** Kamola wants to detect +0.5 points on a baseline of 8 % (α 5 % two-sided, power 80 %, Cohen's h). How many users per arm?

**W3.** Your A/A test gives p = 0.03 once. Is the system broken?

**W4.** A card shows Outstanding = 1 527 946 681 726. What happened in Power Query?

**W5.** `YTD Disbursed` at September 2026 is 161 480 300 000. What does it show at October 2026?

**W6.** Conversion goes from 8.0 % to 8.9 %. What is the relative lift, in %, to 2 decimals?

---

## Part A — The offer-screen A/B analysis, the regional readout (120 min, 40 pts)

> 💡 **Key idea.** The plan, not the data, decides: the same pre-registered checks, exclusions and segments as Tuesday, on a new population. Filter the regions first, then run every Day-2 check on what is left.

**The population is new.** Tuesday's readout was for every app user. The rollout will start in the regions, and the regional sales head wants a readout of his own: **users in the seven regions outside Tashkent** (`users["region"] != "Tashkent"` — 16 738 of the 27 974 rows). Same experiment, same pre-registered plan (7-day conversion, novelty days excluded, the same seven segments), new numbers: none of them is on Tuesday's page. A user's region never changes, so you can filter first and then run every check of Day 2 on what is left.

Every task: code with printed output, then **two sentences** for Kamola (product) and Nilufar (risk). A correct number with no interpretation earns 60 % of the task. Conversion = `contract_signed` within 7 × 24 h of `assigned_at` (the template's `with_conversion`).

### A1. Sanity checks before any result — 8 pts

**Task.** Rows vs users; SRM overall (rows and users) and by device, week, device × week, with your threshold stated; the hash check; users in both variants. Every problem with its size.

*Deductions seen most often:* SRM checked only overall, or only by week; the duplicates noticed but only the second row removed; reweighting the iOS cell instead of removing it; the Tashkent users left in.

### A2. Novelty — 4 pts

**Task.** Daily conversion by variant (de-duplicated users) with a chart of the lift; the lift on 1–3 August and a test on those days; the weekly table with iOS week 4 out. Say what the pre-registered plan does with days 1–3.

*Deductions seen most often:* days 1–3 kept "because the spike is small here" (the plan, not the data, decides exclusions); one high day (14 August) called novelty; no chart.

### A3. The primary result — 8 pts

**Task.** Clean population: conversion per variant, the difference with a 95 % CI, the p-value, the relative lift with its CI; then the same on raw data.

*Deductions seen most often:* the relative CI computed by dividing the difference's CI by 7.70 %; z with the arms in the wrong order (negative z for a positive lift, unexplained); no raw-vs-clean comparison; "p = 0.025 means a 97.5 % chance B is better".

### A4. Funnel and money — 6 pts

**Task.** The funnel step rates by variant with a test per step; principal per loan (Mann–Whitney and a bootstrap CI of the mean difference); disbursed principal per viewer with its bootstrap CI.

*Deductions seen most often:* a t-test on principal with "loans are smaller" from p = 0.15; disbursed per viewer averaged over converters only; five funnel p-values read as five findings.

### A5. The guardrail — 8 pts

**Task.** FPD per variant with Wilson intervals; the z-test and Fisher; the CI of the difference; the power for the observed difference and the loans per arm for 80 %. Then the unit economics: profit per 1 000 viewers per arm and B's break-even FPD, recomputed on the regional numbers.

*Deductions seen most often:* "FPD not significant — guardrail passed"; the break-even from Day 1 (+1.25) or Day 2 (+0.94) copied without recomputing on the regional principal and FPD; no power statement; FPD on all loans including the leaked users.

### A6. Segments — 6 pts

**Task.** The lift by device, new vs returning and customer segment, with raw and Holm-adjusted p-values; the interaction test new vs returning.

*Deductions seen most often:* no correction; "works on iOS"; segments invented after looking (single regions, day of week) presented as pre-registered.

### The decision memo (inside the 40 points)

**Task.** One decision word first (ship / ship in stages / do not ship / extend), then the eight readout lines of Day 2's Company corner, each with its numbers.

**If you are stuck (hints, not answers).**

- A1: filter `region != "Tashkent"` first; then `duplicated(keep=False)`; your Day-2 `srm_by` on `["device", "week"]`; Day 1's `hash_variant` with the salt from `data/ab/README.md` — Day 2, 'The data layout' and 'Sanity check 1–3'.
- A2: `groupby([assigned_at.dt.date, "variant"])["conv"].mean().unstack()`, then a line chart — Day 2, 'The daily lift', P6.
- A3: your `clean_users` and `ab_readout` on the regional rows; `compare="ratio", method="log"` for the relative CI — Day 2, worked example.
- A4: one `isin` per event name for the funnel; `stats.mannwhitneyu`; a bootstrap loop with `default_rng(2026)` — Day 2, 'Secondary metrics', P8–P9.
- A5: `proportion_confint(..., method="wilson")`, `NormalIndPower().power(...)`, `zt_ind_solve_power(...)`; the break-even formula from Day 1's Company corner with the regional principal and FPD — Day 2, 'Guardrails', P10 and P15.
- A6: a loop over three columns, then `multipletests(p, method="holm")`; the interaction as a z on the difference of two differences — Day 2, 'Segments', P11.

**Check your key numbers before you hand in.** The site checks these five; the model answers above stay closed until you submit.

**K1.** Regional users assigned to both variants.

**K2.** Users in the clean regional population (leak out, iOS 22–28 August out, assigned from 4 August).

**K3.** The clean primary difference B − A, in points (two decimals).

**K4.** B's FPD on the loans of clean regional users, in %, to 2 decimals.

**K5.** The smallest Holm-adjusted p-value of the seven segments.

---

## Part B — The 3-page dashboard (120 min, 40 pts)

Build on yesterday's model (`nur_week7.pbix` → save as `nur_dashboard.pbix`). Three pages as specified in Day 4's Company corner; the same top strip on each (title, "Data as of 1 Oct 2026", synced slicers for product, branch, month); ≤ 7 visuals per page; titles that state the finding; one colour for bad; the definitions line at the bottom. Export: File → Export → **Export to PDF** (all pages) and a PNG screenshot of each page with **no slicer selected**.

**Required on every page** (graded inside each page's "layout" line):

- the title as a finding, not a label ("PAR30 3.12 %: concentrated in Nukus SME and Bukhara");
- "Data as of 1 Oct 2026" in the top strip, and the definitions line at the bottom;
- the same three slicers in the same place, synced (View → Sync slicers);
- cards in the top row, the trend in the middle, the detail at the bottom; at most seven visuals;
- one colour for "bad" (red), greys and one accent for everything else; no pie with more than three slices;
- tooltips with n wherever a rate is shown for a small group (vintages, collectors, branches).

**Grading checklist — what each card must show** (no slicer, unless stated):

| Page | Card / visual | Must show | Pts |
|---|---|---|---|
| Portfolio | Outstanding | **208 723 504 430** (3 409 loans) | 2 |
| | Disbursed, Sep 2026 | **17 015 490 000** · 361 | 2 |
| | YTD Disbursed at Sep 2026 | **161 480 300 000** (YoY +45.6 %) | 2 |
| | Avg Ticket, Sep 2026 | **47 134 321** | 1 |
| | Month-end trend Jan–Sep 2026 | 151.8 → **208.2 bn** (no October point, no summed balances) | 2 |
| | Outstanding by product with share | SME **60.32 %** … MICRO 0.46 % | 1 |
| | Layout, titles, slicers, as-of | top-left KPI, ≤ 7 visuals, synced slicers | 2 |
| Risk | PAR30 % · NPL90 % | **3.12 %** · **2.55 %** (234 loans 90+) | 3 |
| | FPD30 %, Jul 2026 vintage | **1.09 %** (4 / 367); vintages with n < 50 hidden | 2 |
| | Cure / roll forward 1-30 | **75.78 %** / 19.53 % | 2 |
| | Matrix PAR30 branch × product, conditional formatting | Nukus SME **9.02 %** the highest red cell; Nukus 6.84 %, Termez 0.68 % | 3 |
| | Layout, titles, definitions line | as above | 2 |
| Collections | Collection rate, due Sep 2026 | **94.08 %** (Aug 96.52 %) | 2 |
| | Collected, Sep 2026 | **16 338 823 207** | 2 |
| | Actions / contact / PTP / paid, Sep 2026 | **651** · 72.81 % · 28.57 % · 22.73 % | 2 |
| | Collection rate by branch | Termez 97.68 % top, Tashkent South 91.44 % bottom | 2 |
| | Collector table, Top N 5, one row per `collector_id` | Bekzod Mirzaev 39 … Ilhom Qodirov 32 (not "Nilufar Jalilov 52": two collectors share that name) | 2 |
| All | Files: `.pbix` refreshes on Timur's PC (relative folder or a parameter), PDF, three PNGs | | 3 |
| All | Model hygiene: star, single direction, date table marked, no (Blank) segment | | 3 |
| | | **total** | **40** |

*Spot checks the reviewer will make after Refresh:* product slicer SME → Outstanding **125 892 942 411**, PAR30 **2.55 %**, `Dynamic Title` *"Outstanding - Small business loan · as of 1 Oct 2026: 125.9 bn soum"*; branch slicer Bukhara Central → Outstanding **15 116 046 338**, PAR30 **4.81 %**, collection rate Sep **92.31 %**; month slicer Aug 2026 on page 1 → Disbursed **22 290 210 000**.

*Deductions seen most often:* the as-of `Outstanding` on a monthly trend line (it is dated by disbursement); Month-End summed over the year; FPD by vintage including August 2026 (11 loans, 0 %); a pie with five products; red used as a series colour; a slicer that does not reach the Collections page; an absolute file path, so the refresh fails elsewhere.

**If you are stuck (hints).** Build page 1 completely before starting page 2 — copy the page (right-click its tab → Duplicate) to keep the top strip. A card shows the wrong number → check the slicers on the page and *Edit interactions* first, then the measure's filter context (Day 4, P4), then the relationship (Day 3, P6). Month-end trend → `Outstanding Month-End` and a visual filter `year_month` ≤ 2026-09. Top N → the Filters pane on the table visual, *Filter type: Top N*, by `Actions`. PDF export exports what is on screen: clear the slicers first.

**No work account?** Then the `.pbix` and the PDF *are* the publication — say so in a one-line `README.md` in the folder. If you do have one: publish to a workspace, set a scheduled refresh (it needs a gateway for files on your PC) and add the link to the README — a bonus mention, no points.

> ⚠️ **Watch out.** The as-of `Outstanding` is dated by disbursement — it never goes on a monthly trend line, and Month-End balances are never summed over a year. Check every card against the checklist with no slicer selected, then once more after Refresh.

---

## Part C — Eight interview questions (30 min, 20 pts)

> 💡 **Key idea.** A strong interview answer has three parts: the definition, one number from this week, and what you do about it.

Answer in `quiz.md`, 3–5 sentences each, with a number from this week where it helps. 2.5 points each.

1. What is a sample ratio mismatch, how do you test for it, and what do you do when you find one?
2. Why does checking an A/B test's p-value every day and stopping when it is below 0.05 break the test? What can you do instead?
3. What is the MDE, how is it related to the sample size, and how do you choose it?
4. What is a guardrail metric? Give a lending example and explain how you decide whether it has been "passed".
5. What is an A/A test, what does it check, and what would a failed one look like?
6. Explain filter context and what `CALCULATE` does to it, with an example.
7. Measure or calculated column: what is the difference, and when do you use each?
8. What is a star schema in Power BI, and why are relationships one-to-many and single-direction?

**Follow-ups an interviewer adds** (one sentence each): *"Why randomise by user and not session?"* (consistency, independence; Day 1) · *"What is a novelty effect and how do you see it?"* (daily lift chart; Day 2) · *"How would you test a change whose effect on defaults takes months to see?"* (a leading metric + a hold-out; Day 2) · *"Import or DirectQuery?"* (Day 3) · *"What does `ALL` do inside `CALCULATE`?"* (Day 4) · *"How do branch managers see only their branch?"* (RLS; Day 4).

---

## Before you submit

- [ ] `checkpoint_ab.ipynb`: Restart & Run All finishes with no red cell; saved after the run; every task prints its numbers.
- [ ] A1 names every problem with its size (users in both variants, the iOS week-4 cell and its hash mismatches); A3 shows clean and raw side by side; A5 states the power and the break-even; A6 has Holm.
- [ ] The memo starts with one decision word and states its conditions as numbers.
- [ ] `nur_dashboard.pbix` refreshes from a folder path someone else can change (a parameter or a relative location noted in the README); the three pages match the checklist with no slicer selected.
- [ ] `nur_dashboard.pdf` and three PNGs; every page shows "Data as of 1 Oct 2026" and a definitions line.
- [ ] `quiz.md` has eight answers with at least four numbers from this week.
- [ ] A one-line `README.md` says how the dashboard was shared (`.pbix` + PDF, or a Service link) and which Desktop version you used.
- [ ] HW 7.2 (model screenshot + six measures) is handed in (Day 3's box).

---

## Scoring and what happens next

| Part | Points | What earns them |
|---|---|---|
| A — A/B analysis | 40 | per task: correct method and numbers (60 %), two-sentence interpretation that says what to do (40 %); the memo is part of A3–A6's interpretation marks |
| B — dashboard | 40 | the checklist above |
| C — interview | 20 | 2.5 per answer: correct, in your words, with a number or example |

**70 points** to move on. Below 70, the feedback lists the sections to redo. Points go to the [Progress page](progress.md). Next week, the last: **product analytics** (funnels, cohorts, retention, unit economics) on the app events, and the **capstone** — three days, one dataset, a decision for Nur's management, and a mock interview.

**Week 7 in five sentences** (what you can now say in any meeting):

1. "Before/after is not an experiment; a 50/50 hash split over the same weeks is — 14 983 users per arm for +0.9 points."
2. "The split looked fine overall and was 60/40 in iOS last week — check the sample ratio by slice before reading any result."
3. "The new screen adds +0.88 points (CI +0.16 to +1.60), not the +1.09 the dashboard showed; the first three days were novelty."
4. "FPD +0.7 points with 23 % power is unknown, not safe — ship with a hold-out."
5. "One model, one definition per measure, refreshed from the views: PAR30 is 3.12 % on the card, in the SQL and in the PDF."

> 🚀 **Stretch (optional, +5 XP).** **S1.** Write `nur_ab.py` with `readout(users, events, window_days=7, exclude=None)` (sanity checks + primary + relative lift, returning a one-row DataFrame) and `guardrail(loans, users, break_even_pt)` (rates, test, CI, power, verdict "pass / fail / unresolved"). Run both on the clean population and on the raw data and paste the two rows into your memo. Then add a fourth page to the dashboard: **Experiments**, with `users.csv` and `loans_followup.csv` loaded, a measure `Conversion 7d` and a line of daily conversion by variant — the novelty spike, visible to Kamola without Python.

---

### 📎 Hand in here

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

The editor below runs Python in this page. This block loads the data and Day 2's `with_conversion` — run it first, then clean and test in the editor:

```python
import pandas as pd
from math import sqrt
from statistics import NormalDist
users  = pd.read_csv("data/ab/users.csv", parse_dates=["assigned_at"])
events = pd.read_csv("data/ab/events.csv", parse_dates=["event_time"])

def with_conversion(users, events, window_days=7):
    first = users.groupby("user_id")["assigned_at"].min().rename("first_at").reset_index()
    s = events[events["event_name"] == "contract_signed"].merge(first, on="user_id")
    ok = s[(s["event_time"] >= s["first_at"]) & (s["event_time"] <= s["first_at"] + pd.Timedelta(days=window_days))]
    return users.assign(conv=users["user_id"].isin(ok["user_id"]).astype(int))

dup_ids = users.loc[users["user_id"].duplicated(), "user_id"].unique()
print(len(users), len(events), len(dup_ids))  # 27974 67215 300
```


=====
PAGE: Week 7 · Day 6 — Section exam: A/B tests and Power BI (Week 7) (weeks/week-07/day-6.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-07/day-6
=====

# Week 7 · Day 6 — Section exam: A/B tests and Power BI (Week 7)

<span class="badge">Exam 60 min</span> <span class="badge">Interview 45 min</span> <span class="badge hw">Exam · 100 points</span>

> STORY **Exam day, 10:00.** Madina brings Kamola and Timur into the meeting room. Kamola: *"Last week you read an experiment and built a dashboard. Today you do the whole loop: how we would test a change, how we would read the result, how we would show it."* Timur: *"And the dashboard questions are real. I get them every Monday. Notes are welcome. Nobody answers for you."*

## Today in 3 lines

- You show that you can design, check and read an A/B test, and that you can build a Power BI model and measures that give the right number.
- **Part A (40 points):** 25 quick questions with the classic traps inside. It is marked on the spot.
- **Part B (60 points):** an interview on the Nur Finance data — five questions you answer in words and three small tasks you work out. Your mentor reads it.

---

## 1. How the exam works

- **Two parts.** Part A is a quiz: 25 questions, 40 points, marked at once. Part B is an interview: eight written answers, 60 points, marked by your mentor.
- **Pass mark.** You need 70 of 100 points. In Part A, 80 % right (20 of 25) counts as done. You can repeat Part A as often as you like, and your best attempt counts.
- **What it covers.** All of Week 7: A/B tests (design, sanity checks, reading the result) and Power BI (the model, Power Query, DAX and visuals). About a third of the questions come from earlier sections, mostly statistics from Week 6, because an experiment is a test with a plan.
- **Open book.** The course pages, your own notes and the [SQL playground](playground.md) are allowed. Chatbots and asking other people are not. A real interview works the same way: you may bring notes, but nobody answers for you.
- **Time.** Plan 60 minutes for Part A and 45 minutes for Part B.
- **Deadline.** Part B is due at 23:59 on the day of Week 8 · Day 1 (the menu shows the date). Part A can be taken any time before that.
- **After the exam.** Your mentor reviews Part B and sends structured feedback.

---

## 2. Part A — Quick check (40 points)

25 questions in one quiz. Some have one right answer, some have several, some ask for a number or a word. A few say *run it*: use the [SQL playground](playground.md) for those. After each answer the quiz tells you why. Questions 1–16 are about Week 7: A/B tests first, then Power BI. Questions 17–25 come from statistics, SQL, Excel and Python.

---

## 3. Part B — Interview (60 points)

Eight written answers. Write them as you would say them aloud to a hiring manager.

- **I1–I5 are interview questions.** Answer in 4–6 sentences and use one number from Nur Finance.
- **I6–I8 are small tasks on the data.** Write the query, the code or the measure, then the numbers you get and one sentence. Every number is as of 2026-10-01.
- Write in your own words. Short and exact beats long.

### 📎 Hand in here

---

## 4. Scoring and what happens next

| Part | Points | Marked by |
|---|---|---|
| A — Quick check | 40 | automatic, your best attempt |
| B — Interview | 60 | your mentor |
| **Total** | **100** | **70 or more passes** |

A pass closes the experiments and dashboards block: you have shown that you can plan a test, trust its result and put a number on a card. Product analytics and the job come next. Below 70, the feedback names the topics to repeat, and you and your mentor decide when to try Part B again.

Your feedback arrives on the **[My feedback](feedback.md)** page and in the course bot. Your points go to the [Progress page](progress.md).


=====
PAGE: Week 8 · Day 1 — Product analytics I: metrics that matter, funnels and retention (weeks/week-08/day-1.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-08/day-1
=====

# Week 8 · Day 1 — Product analytics I: metrics that matter, funnels and retention

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 60 min</span> <span class="badge company">Company corner</span>

> STORY **Monday, 9:00.** The last week. Kamola, the product manager for the app (*продакт-менеджер*), puts her phone on the desk with the app open. *"Two questions, and I have been asking them since spring. **Where do we lose people in the app — and do borrowers come back?** The marketing deck has one conversion number, a slide from last quarter has another, and somebody showed me that most of our applicants never even open the app. They cannot all be true."* Madina: *"Product analytics is the same SQL you already write, asked by a different person. Before you answer Kamola, decide what each number is a share **of**. Tomorrow you put money on it, and from Wednesday you build the board review."*

## Today in 3 lines

- You place a business goal on a **metric tree**: decompose "monthly disbursed amount" into factors whose product is the total, tell **input** from **output** and **leading** from **lagging** metrics, and say which factor moved when the total moves.
- You build the **app funnel** from `app_events` — sessions, step conversion, drop-off, by device and app version — and you decide, before you divide anything, **who is in the denominator** (one population in this table is not what it seems; find it before you divide anything).
- You measure **retention the lending way**: cohorts by first-loan month, the share who take a second loan within 3, 6 and 12 months, a cohort triangle with honest blank cells, and DAU/MAU — with a sentence on why it is the wrong headline for a lender.

---

## 1. Learn — product metrics: definitions, funnels and retention

### What a metric is — numerator, denominator, filter, period

**What it is.** A **metric** (*метрика*) is a number defined so exactly that two analysts get the same value. A rate-type metric has four parts: the **numerator** (the units that did the thing), the **denominator** (every unit that could have), the **filter** (which units count at all) and the **period** (when).

**How to write it.**

```sql
-- shape of every rate metric
-- the units that did it
SELECT SUM(CASE WHEN <did the thing> THEN 1 ELSE 0 END) AS numerator,
       -- every unit that could have
       COUNT(*)                                          AS denominator,
       ROUND(100.0 * SUM(CASE WHEN <did the thing> THEN 1 ELSE 0 END) / COUNT(*), 1) AS rate_pct
FROM <one row per unit>
-- which units count at all
WHERE <filter>
  AND <date> >= '<start>' AND <date> < '<end>';
  -- the period, start included, end excluded
```

The approval rate of app applications in September 2026:

```sql
-- numerator
SELECT SUM(CASE WHEN status IN ('approved', 'approved_not_disbursed') THEN 1 ELSE 0 END) AS approved,
       -- denominator
       COUNT(*)                                                                           AS decided,
       ROUND(100.0 * SUM(CASE WHEN status IN ('approved', 'approved_not_disbursed') THEN 1 ELSE 0 END) / COUNT(*), 1) AS approval_pct
FROM applications
-- filter: app channel, decided applications only
WHERE channel = 'app' AND status <> 'cancelled'
  AND applied_at >= '2026-09-01' AND applied_at < '2026-10-01';
  -- period: applied in September 2026
```

128 approved of 192 decided: 66.7 %. Written as a definition card, it reads:

| part | approval rate, app, September 2026 |
|---|---|
| numerator | applications with status `approved` or `approved_not_disbursed` — 128 |
| denominator | decided applications: every status except `cancelled` — 192 |
| filter | `channel = 'app'` |
| period | `applied_at` in September 2026 |

**When you use it.**
- Before you compute any number someone asked for: write the four parts first.
- When two reports disagree about "the same" number: compare their four parts, one by one.

> ⚠️ **Watch out.** The same name can hide two denominators. Divide by all 224 app applications (cancelled included) and the "approval rate" is 57.1 %, not 66.7 %. Write the definition card under every number you show.

**Your turn.** The same metric for the **branch** channel: approved ÷ decided, applied in September 2026, in %. Change one word of the query above.

### A metric tree — from the North Star to its drivers

**What it is.** A **North Star metric** (*метрика «Полярная звезда»*) is the one number that best shows the value a company creates. For a lender it is usually the amount disbursed per month. A **metric tree** (*дерево метрик*) splits that number into **drivers** — factors that multiply back to it, each one something a team can move.

**How to write it.** Each factor's denominator is the previous factor's numerator, so the product cancels down to the total:

```text
amount disbursed
  =  applications
       (how many ask)
  ×  approved ÷ applications
       (approval rate)
  ×  loans ÷ approved
       (take-up)
  ×  amount ÷ loans
       (average ticket)
```

On the applications made in September 2026:

```sql
WITH m AS (
  SELECT COUNT(*)                                                                         AS applications,
         SUM(CASE WHEN a.status IN ('approved', 'approved_not_disbursed') THEN 1 ELSE 0 END) AS approved,
         COUNT(l.loan_id)                                                                  AS loans,
         SUM(l.principal)                                                                  AS amount
  FROM applications a
  -- the loan, if the application became one
  LEFT JOIN loans l ON l.application_id = a.application_id
  WHERE a.applied_at >= '2026-09-01' AND a.applied_at < '2026-10-01')
SELECT applications,
       ROUND(100.0 * approved / applications, 2) AS approval_pct,  -- driver 2
       ROUND(100.0 * loans / approved, 2)        AS take_up_pct,   -- driver 3
       ROUND(1.0 * amount / loans)                AS avg_ticket,   -- driver 4
       ROUND(applications * (1.0 * approved / applications) * (1.0 * loans / approved) * (1.0 * amount / loans)) AS product,
       amount
FROM m;
```

621 applications × 61.67 % approved × 87.21 % taken up × 43 732 545 soum per loan = 14 606 670 000 soum — the product lands exactly on the amount.

**When you use it.**
- The total moved: walk down the tree and find the driver that moved.
- A team asks for a target: give it the driver it can push, not the total.

| | Input metric | Output metric |
|---|---|---|
| What it is | a driver a team pushes directly | the result the board reads |
| Example | applications, approval rate, take-up | amount disbursed, profit |
| | **Leading metric** (*опережающая*) — moves first | **Lagging metric** (*запаздывающая*) — confirms later |
| Example | applications this week, FPD30 | NPL90 after a year, write-offs |

> ⚠️ **Watch out.** Put the risk report's approval rate (approved ÷ decided) in the middle of the chain and the product no longer equals the total. Inside a tree, every denominator must be the previous numerator.

**Your turn.**

### The lending funnel — visit → application → approval → disbursement → repayment

**What it is.** A **funnel** (*воронка*) is an ordered list of steps and the number of units that reached each one. A lender's funnel ends at money coming back: **visit → application → approval → disbursement → repayment**. **Step conversion** (*конверсия шага*) = reached this step ÷ reached the previous step. **Conversion from the top** = reached this step ÷ reached step 1.

**How to write it.** One row per unit with a 0/1 flag per step, then one sum per step:

```sql
-- shape
WITH u AS (
  SELECT <unit id>,
         -- 1 if this unit reached step 1
         MAX(CASE WHEN <step 1 happened> THEN 1 ELSE 0 END) AS step1,
         MAX(CASE WHEN <step 2 happened> THEN 1 ELSE 0 END) AS step2
  FROM <events> GROUP BY <unit id>)
SELECT SUM(step1), SUM(step2) FROM u;
-- units that reached each step
```

The unit here is an **app session** (`application_id` in `app_events`). Sessions opened January–June 2026, followed to the first instalment:

```sql
-- one row per app session
WITH s AS (
  SELECT application_id, MIN(event_time) AS opened_at,
         MAX(CASE WHEN event_name = 'app_open'           THEN 1 ELSE 0 END) AS visit,
         MAX(CASE WHEN event_name = 'submit_application' THEN 1 ELSE 0 END) AS application,
         MAX(CASE WHEN event_name = 'approved'           THEN 1 ELSE 0 END) AS approval
  FROM app_events GROUP BY application_id),
-- the first instalment of every loan and when it was paid
first_inst AS (
  SELECT i.loan_id, i.due_date, MIN(p.paid_at) AS paid_at
  FROM installments i LEFT JOIN payments p ON p.installment_id = i.installment_id
  WHERE i.installment_no = 1
  GROUP BY i.loan_id, i.due_date)
SELECT SUM(s.visit)                                             AS visit,
       SUM(s.application)                                       AS application,
       SUM(s.approval)                                          AS approval,
       COUNT(l.loan_id)                                         AS disbursement,
       -- first instalment paid on time
       SUM(CASE WHEN f.paid_at <= f.due_date THEN 1 ELSE 0 END) AS repayment
FROM s
LEFT JOIN loans l      ON l.application_id = s.application_id
LEFT JOIN first_inst f ON f.loan_id = l.loan_id
WHERE s.opened_at >= '2026-01-01' AND s.opened_at < '2026-07-01';
```

| step | sessions | step conversion | from the top |
|---|---|---|---|
| visit (`app_open`) | 1 252 | — | 100 % |
| application (`submit_application`) | 854 | 68.2 % | 68.2 % |
| approval (`approved`) | 719 | 84.2 % | 57.4 % |
| disbursement (a row in `loans`) | 659 | 91.7 % | 52.6 % |
| repayment (first instalment on time) | 549 | 83.3 % | 43.8 % |

1 252 sessions started; 549 of them, 43.8 %, became a loan whose first instalment came back on time. The first half of 2026 is chosen on purpose: every first instalment of these loans fell due by 2 August, before the as-of date (2026-10-01).

**When you use it.**
- "Where do we lose people?" — read the step conversions.
- "How many visits does one good loan cost?" — read the conversion from the top (1 252 ÷ 549 ≈ 2.3 visits).

> ⚠️ **Watch out.** "Reached" means *the unit has the event*, counted once per unit. `COUNT(*)` of events counts clicks, and a session that opened the form twice would count twice.

**Your turn.**

Then read the table above: what is the step conversion from **approval to disbursement**, in %?

### Leaky steps — where to look

**What it is.** A **leaky step** is the step that loses the most units — in count (**drop-off**, *отвал*) or in step conversion. Finding it is half the job; the other half is checking that the leak is real and naming who can fix it.

**How to write it.** Split the big steps into their sub-steps and put the drop-off next to each one. `LAG` reads the previous step's count:

```sql
-- every app session, one row each
WITH s AS (
  SELECT application_id,
         MAX(CASE WHEN event_name = 'app_open'           THEN 1 ELSE 0 END) AS opened,
         MAX(CASE WHEN event_name = 'view_offer'         THEN 1 ELSE 0 END) AS viewed,
         MAX(CASE WHEN event_name = 'start_application'  THEN 1 ELSE 0 END) AS started,
         MAX(CASE WHEN event_name = 'submit_application' THEN 1 ELSE 0 END) AS submitted,
         MAX(CASE WHEN event_name = 'approved'           THEN 1 ELSE 0 END) AS approved,
         MAX(CASE WHEN event_name = 'contract_signed'    THEN 1 ELSE 0 END) AS signed
  FROM app_events GROUP BY application_id),
steps AS (
  SELECT 1 AS k, 'app_open' AS step, SUM(opened) AS n FROM s UNION ALL
  SELECT 2, 'view_offer',         SUM(viewed)    FROM s UNION ALL
  SELECT 3, 'start_application',  SUM(started)   FROM s UNION ALL
  SELECT 4, 'submit_application', SUM(submitted) FROM s UNION ALL
  SELECT 5, 'approved',           SUM(approved)  FROM s UNION ALL
  SELECT 6, 'contract_signed',    SUM(signed)    FROM s UNION ALL
  SELECT 7, 'disbursed', COUNT(*) FROM s JOIN loans l ON l.application_id = s.application_id)
SELECT k, step, n,
       -- drop-off at this step
       LAG(n) OVER (ORDER BY k) - n                    AS lost,
       -- step conversion
       ROUND(100.0 * n / LAG(n) OVER (ORDER BY k), 1)  AS step_pct
FROM steps ORDER BY k;
```

5 006 sessions open the app. The steps lose 512, 491, 552, 536, 0 and 246 sessions. The largest user-side loss is the form (start → submit: 552, step conversion 86.2 %). The 536 at approval are the scorecard's decision, not a user leaving.

**Where to look, in this order:**

| # | Check | Nur example |
|---|---|---|
| 1 | Is the denominator the right population? | `app_events` exists only for app applications — branch and partner customers have no app steps to lose |
| 2 | Split the leaky step into its sub-steps | "application" = view offer → start form → submit |
| 3 | Segment by an attribute of the **unit** | device of the session's `app_open`, not of each event |
| 4 | User action or business decision? | `approved` is the scorecard: Risk owns it, not the app team |
| 5 | Has the last step had time to happen? | approvals of the last days of a month are still waiting for money |

**When you use it.**
- A funnel is on the table and someone asks "so what do we fix?"
- Before you report a leak: run the five checks, so the leak survives the first question.

> ⚠️ **Watch out.** A step that looks like a cliff is often a population, not a behaviour. Dividing app steps by all 14 000 applications would "show" that 64 % of applicants never open the app — they applied at a branch.

**Your turn.** Submit → approved loses 536 sessions. Who owns that step?

### Retention — coming back for another loan

**What it is.** **Retention** (*удержание*) is the share of a group that comes back after a time N. A social app counts people who open it again on day 7. A lender counts borrowers who take **another loan**: retention at N months = customers with a second loan within N months of the first ÷ customers in the group.

**How to write it.**

```text
retention(N) =
  customers whose 2nd loan is
  disbursed ≤ N months after their 1st
  ÷
  customers whose 1st loan is in
  the group
```

Customers whose first loan was disbursed in January 2025, N = 6 months:

```sql
-- number each customer's loans 1, 2, 3 … by date
WITH ranked AS (
  SELECT customer_id, disbursed_at,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY disbursed_at, loan_id) AS n
  FROM loans),
-- one row per customer: first and second loan dates
pairs AS (
  SELECT f.customer_id, f.disbursed_at AS first_at, s.disbursed_at AS second_at
  FROM ranked f
  LEFT JOIN ranked s ON s.customer_id = f.customer_id AND s.n = 2
  WHERE f.n = 1)
SELECT COUNT(*)                                                                  AS customers,
       SUM(CASE WHEN second_at <= date(first_at, '+6 months') THEN 1 ELSE 0 END) AS came_back,
       ROUND(100.0 * SUM(CASE WHEN second_at <= date(first_at, '+6 months') THEN 1 ELSE 0 END) / COUNT(*), 1) AS retention_6m_pct
FROM pairs
WHERE first_at >= '2025-01-01' AND first_at < '2025-02-01';
```

141 customers took their first loan in January 2025; 38 of them took a second one within six months — 27.0 %.

**When you use it.**
- "Do borrowers come back?" — Kamola's question.
- Repeat borrowers cost less to acquire, so retention feeds tomorrow's lifetime value.

| | Social app | Lender |
|---|---|---|
| "Came back" means | opened the app again | took another loan |
| Typical N | day 1, 7, 30 | 3, 6, 12 months |

> ⚠️ **Watch out.** The denominator is everyone who started, not the people still here. Divide by today's active borrowers and you measure survivors, who always look loyal — **survivorship bias** (*ошибка выжившего*): the customers who left are no longer in the table to be counted.

**Your turn.** The same January 2025 group: retention at **12** months, in %.

### Cohort by month — grouping people by when they started

**What it is.** A **cohort** (*когорта*) is a group of customers who started in the same period. For a lender, "started" means the first loan, so the **cohort month** is the month of the customer's first disbursement. It never changes, however many loans follow.

**How to write it.**

```sql
WITH first_loan AS (
  -- the start: the first disbursement
  SELECT customer_id, MIN(disbursed_at) AS first_at
  FROM loans GROUP BY customer_id)
-- SQL Server: FORMAT(first_at, 'yyyy-MM')
SELECT strftime('%Y-%m', first_at) AS cohort,
       COUNT(*)                    AS customers
FROM first_loan
GROUP BY cohort ORDER BY cohort;
```

34 cohorts. The first, January 2024, has 79 customers; the monthly cohorts then grow to 130–165. The last row, October 2026, has 9 customers — it is one day old.

**When you use it.**
- Compare like with like: customers of the same age, in different months.
- Whenever the question has "after N months" in it.

| | Calendar month | Cohort month |
|---|---|---|
| A row holds | everyone active in that month, new and old | the same customers, followed over time |
| Answers | "how much happened in May?" | "how do May's new borrowers behave as they age?" |

> ⚠️ **Watch out.** Our data start in January 2024. A "first loan" in early 2024 is the first loan *in our data*, not in the customer's life. Say so under any chart with the 2024 cohorts.

**Your turn.** How many customers are in the **June 2025** cohort?

### The retention table and the retention curve

**What it is.** A **retention table** puts cohorts in rows and the age N in columns; each cell is that cohort's retention at that age. A cell exists only when **every** customer of the cohort has had N months; otherwise it stays blank. Such a cell is **right-censored** (*цензурировано справа*): the answer exists, but the data end before we can see it — "not measured yet", never 0. A **retention curve** draws one row of the table as a line over N.

**How to write it.** The retention query from above, grouped by cohort, with the blank rule wrapped around each cell:

```sql
WITH ranked AS (
  SELECT customer_id, disbursed_at,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY disbursed_at, loan_id) AS n
  FROM loans),
pairs AS (
  SELECT f.disbursed_at AS first_at, s.disbursed_at AS second_at,
         strftime('%Y', f.disbursed_at) || 'Q' || ((CAST(strftime('%m', f.disbursed_at) AS INTEGER) + 2) / 3) AS cohort
  FROM ranked f LEFT JOIN ranked s ON s.customer_id = f.customer_id AND s.n = 2
  WHERE f.n = 1)
SELECT cohort, COUNT(*) AS customers,
       -- blank unless every customer had 3 months
       CASE WHEN MAX(date(first_at, '+3 months')) <= '2026-10-01'
            THEN ROUND(100.0 * SUM(CASE WHEN second_at <= date(first_at, '+3 months') THEN 1 ELSE 0 END) / COUNT(*), 1) END AS m3,
       CASE WHEN MAX(date(first_at, '+6 months')) <= '2026-10-01'
            THEN ROUND(100.0 * SUM(CASE WHEN second_at <= date(first_at, '+6 months') THEN 1 ELSE 0 END) / COUNT(*), 1) END AS m6,
       CASE WHEN MAX(date(first_at, '+12 months')) <= '2026-10-01'
            THEN ROUND(100.0 * SUM(CASE WHEN second_at <= date(first_at, '+12 months') THEN 1 ELSE 0 END) / COUNT(*), 1) END AS m12
FROM pairs
WHERE first_at >= '2025-01-01' AND first_at < '2026-07-01'
GROUP BY cohort ORDER BY cohort;
```

| cohort | customers | m3 | m6 | m12 |
|---|---|---|---|---|
| 2025Q1 | 375 | 18.4 | 28.8 | 44.5 |
| 2025Q2 | 414 | 23.7 | 32.4 | 44.7 |
| 2025Q3 | 450 | 22.4 | 32.4 | 45.6 |
| 2025Q4 | 443 | 25.1 | 36.1 | |
| 2026Q1 | 399 | 30.8 | 38.3 | |
| 2026Q2 | 463 | 33.0 | | |

Read **down** a column to compare cohorts at the same age: at 6 months, retention rises from 28.8 % (2025Q1) to 38.3 % (2026Q1). Read **across** a row to follow one cohort as it ages. The empty cells form a triangle — those ages have not happened yet.

The curve, drawn in Python from the same data:

```python
import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

con = sqlite3.connect("data/raw/nur.db")
pairs = pd.read_sql("""
    WITH ranked AS (SELECT customer_id, disbursed_at,
                           ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY disbursed_at, loan_id) AS n
                    FROM loans)
    SELECT f.disbursed_at AS first_at, s.disbursed_at AS second_at
    FROM ranked f LEFT JOIN ranked s ON s.customer_id = f.customer_id AND s.n = 2
    WHERE f.n = 1""", con, parse_dates=["first_at", "second_at"])
pairs["cohort"] = pairs["first_at"].dt.to_period("Q").astype(str)
as_of = pd.Timestamp("2026-10-01")

for cohort in ["2024Q1", "2024Q3", "2025Q1", "2025Q3", "2026Q1"]:
    g = pairs[pairs["cohort"] == cohort]
    ages, values = [], []
    for n in range(1, 25):
        # not every customer has had n months: stop
        if g["first_at"].max() + pd.DateOffset(months=n) > as_of:
            break
        ages.append(n)
        values.append(100 * (g["second_at"] <= g["first_at"] + pd.DateOffset(months=n)).mean())
    plt.plot(ages, values, marker="o", markersize=3, label=cohort)
    print(cohort, len(g), "customers, last age", ages[-1], "months:", round(values[-1], 1), "%")

plt.xlabel("months since the first loan")
plt.ylabel("% with a second loan")
plt.title("Later cohorts come back sooner")
plt.legend()
plt.show()
```

Each line is one cohort. At one month, 2024Q1 starts at 6.0 % and 2026Q1 at 22.8 %; at six months they are at 22.3 % and 38.3 %. Later lines start higher and climb faster: newer borrowers come back sooner. A newer cohort also has a shorter line — 2024Q1 reaches 24 months (68.8 %), 2026Q1 only 6.

**When you use it.**
- The table: to compare cohorts at the same age (down a column).
- The curve: to show the shape — how fast retention climbs and where it flattens.

> ⚠️ **Watch out.** A blank cell is "not measured yet", never "did not come back". Fill it with a number and the newest cohorts look worse — or, with a naive query, show the same value at 3, 6 and 12 months.

**Your turn.** In the table above, what is the 6-month retention of the **2025Q4** cohort, in %?

### Churn — the customers who leave

**What it is.** **Churn** (*отток*) is the share of customers who stop being customers. A lender's customer can only leave after repaying. So: a customer **churns** when a loan closes, no other loan is running, and no new loan follows within a window (here 6 months). **Churn rate** = churned ÷ customers who could have churned.

**How to write it.** Customers whose loan closed in the first quarter of 2026:

```sql
-- customers who repaid a loan in Q1 2026
WITH closers AS (
  SELECT customer_id, MAX(closed_at) AS closed_at
  FROM loans
  WHERE status = 'closed' AND closed_at >= '2026-01-01' AND closed_at < '2026-04-01'
  GROUP BY customer_id),
-- had another loan running on that day: cannot churn
still_borrowing AS (
  SELECT DISTINCT c.customer_id
  FROM closers c
  JOIN loans l ON l.customer_id = c.customer_id
              AND l.disbursed_at <= c.closed_at AND (l.closed_at IS NULL OR l.closed_at > c.closed_at)),
base AS (
  SELECT * FROM closers WHERE customer_id NOT IN (SELECT customer_id FROM still_borrowing)),
-- the first loan after the closing, if any
next_loan AS (
  SELECT b.customer_id, MIN(l.disbursed_at) AS next_at
  FROM base b JOIN loans l ON l.customer_id = b.customer_id AND l.disbursed_at > b.closed_at
  GROUP BY b.customer_id)
SELECT COUNT(*)                                                                               AS could_churn,
       SUM(CASE WHEN n.next_at <= date(b.closed_at, '+6 months') THEN 1 ELSE 0 END)           AS came_back,
       SUM(CASE WHEN n.next_at IS NULL OR n.next_at > date(b.closed_at, '+6 months') THEN 1 ELSE 0 END) AS churned,
       ROUND(100.0 * SUM(CASE WHEN n.next_at IS NULL OR n.next_at > date(b.closed_at, '+6 months') THEN 1 ELSE 0 END) / COUNT(*), 1) AS churn_pct
FROM base b LEFT JOIN next_loan n ON n.customer_id = b.customer_id;
```

600 customers repaid a loan in Q1 2026; 220 of them still had another loan running, so 380 could churn. 72 came back within six months and 308 did not: churn 81.1 %.

**When you use it.**
- "How many customers do we lose after they repay?" — the question retention does not ask.
- To size a win-back campaign: the 308 are its list.

| | Retention | Churn |
|---|---|---|
| Starts the clock at | the first loan | the end of a loan |
| Counts | who came back | who did not |
| Equals 1 − the other | only for the same group and the same window | |

> ⚠️ **Watch out.** Churn needs a finished window. A customer who repaid in September 2026 has had no time to come back; calling them "churned" inflates the rate. Q1 2026 is used here because its six months ended by 30 September.

**Your turn.** The same customers with a **3-month** window: churn in %.

### Active users — DAU, MAU and what "active" means here

**What it is.** An **active user** did a defined action in the period. **DAU** counts distinct active users per day, **MAU** per month. **Stickiness** (*липкость*) = average DAU ÷ MAU: how many days of the month a typical user is active. The action that makes a user "active" is a choice you must write down.

**How to write it.** September 2026, under two definitions of "active":

```sql
SELECT (SELECT COUNT(DISTINCT customer_id) FROM app_events
         -- opened the app
         WHERE event_time >= '2026-09-01' AND event_time < '2026-10-01')        AS app_mau,
       (SELECT COUNT(*) FROM (SELECT DISTINCT date(event_time), customer_id FROM app_events
         -- 30 days in September
         WHERE event_time >= '2026-09-01' AND event_time < '2026-10-01')) / 30.0 AS app_avg_dau,
       (SELECT COUNT(DISTINCT customer_id) FROM loans
         WHERE status IN ('active', 'default'))                                   AS borrowers_now;
         -- a loan running on 2026-10-01
```

201 customers opened the app in September; on an average day, 7.43 did. Stickiness is 7.43 ÷ 201 = 3.7 %. Under the second definition, 2 526 customers have a loan running — twelve times more "active" people.

**When you use it.**
- An app team tracks the habit of opening the app: DAU, MAU, stickiness.
- A lender's book is "active" through its loans: borrowers with a running loan.

> ⚠️ **Watch out.** Our event log records only sessions that create an application, so app MAU here is close to "app applicants". A low stickiness (3–4 %) is normal for a lender: a customer opens the app when they need money.

**Your turn.** App MAU for **August 2026** (distinct customers with an app event in August).

### Vanity metrics vs actionable metrics

**What it is.** A **vanity metric** (*метрика тщеславия*) goes up whatever you do, and no decision follows from it: total registered customers, all loans ever, app installs. An **actionable metric** can fall, has an owner, and a change in it tells someone what to do.

**How to write it.** The same new customers, two ways:

```sql
WITH monthly AS (
  SELECT strftime('%Y-%m', registered_at) AS month, COUNT(*) AS new_customers
  FROM customers GROUP BY month),
-- vanity: the running total can only go up
running AS (
  SELECT month, new_customers, SUM(new_customers) OVER (ORDER BY month) AS all_customers
  FROM monthly),
first_loan AS (
  SELECT customer_id, MIN(disbursed_at) AS first_at FROM loans GROUP BY customer_id),
-- actionable: new customers with a first loan within 60 days
activated AS (
  SELECT strftime('%Y-%m', c.registered_at) AS month,
         ROUND(100.0 * SUM(CASE WHEN f.first_at >= date(c.registered_at)
                                 AND f.first_at <= date(c.registered_at, '+60 days') THEN 1 ELSE 0 END) / COUNT(*), 1) AS loan_in_60d_pct
  FROM customers c LEFT JOIN first_loan f ON f.customer_id = c.customer_id
  GROUP BY month)
SELECT r.month, r.new_customers, r.all_customers, a.loan_in_60d_pct
FROM running r JOIN activated a ON a.month = r.month
WHERE r.month >= '2026-01' AND r.month <= '2026-07'
ORDER BY r.month;
```

"All customers" rises every month, from 5 183 to 5 820 — even in June, when new registrations fell from 119 to 104. The share of new customers with a first loan within 60 days moved from 52.0 % in January to 78.2 % in July: that number can fall, and if it does, someone has to act.

**When you use it.**
- When someone proposes a KPI: ask "if this falls, who does what?" No answer → vanity.
- When a dashboard shows a cumulative line: replace it with the monthly rate behind it.

| Vanity | Actionable twin |
|---|---|
| total registered customers | % of new customers with a first loan within 60 days |
| app installs | app sessions that reach a submitted application |
| approval rate pushed up by a looser cut-off | approval rate **and** FPD30 of the approved |

**Your turn.**

### Putting it together

Kamola asks: *"Is the app getting better at turning visits into lasting customers?"* Four of today's concepts answer it in one query — app sessions by quarter of 2025, followed to money:

```sql
-- funnel unit: the app session
WITH s AS (
  SELECT application_id, MIN(event_time) AS opened_at,
         MAX(CASE WHEN event_name = 'submit_application' THEN 1 ELSE 0 END) AS submitted
  FROM app_events GROUP BY application_id)
-- period
SELECT strftime('%Y', s.opened_at) || 'Q' || ((CAST(strftime('%m', s.opened_at) AS INTEGER) + 2) / 3) AS quarter,
       -- denominator
       COUNT(*)                                                    AS sessions,
       ROUND(100.0 * SUM(s.submitted) / COUNT(*), 1)               AS visit_to_application_pct,
       -- the end of the funnel
       ROUND(100.0 * COUNT(l.loan_id) / COUNT(*), 1)               AS visit_to_money_pct
FROM s LEFT JOIN loans l ON l.application_id = s.application_id
-- filter: closed quarters
WHERE s.opened_at >= '2025-01-01' AND s.opened_at < '2026-01-01'
GROUP BY quarter ORDER BY quarter;
```

Sessions grow from 373 to 526 a quarter; visit → money is 51.7 %, 54.0 %, 52.1 % and 56.7 % — the best quarter is the last. Read it with the section's questions. *Definition:* sessions are the denominator, the quarter is the period. *Funnel:* the two rates are conversion from the top to two steps. *Leaky steps:* if visit → application falls while visit → money holds, the form is leaking, not the scorecard. *Retention:* the funnel only covers the first loan; the retention table says whether those borrowers come back (2025Q1: 44.5 % within a year).

**Which concept answers which question?**

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Metric trees (EN, long) — [Analytics for Product Managers Masterclass (HelloPM), 1:17:30](https://youtu.be/N-Igkw7__z0?t=4650&end=4810)
- ▶ Cohorts, how to read the chart — [What is a Cohort? How to Read a Cohort Analysis Chart... (Peel), 01:21](https://youtu.be/mb2_kskQDDU?t=81)
- ▶ Retention by cohort, calculated — [Customer Retention & Cohort Analysis (Eric Andrews), 04:11](https://youtu.be/OwCATJh4lNg?t=251&end=434)

- RU deck (TBC Data Analytics 2.0, if you have it) `8.1 Product Analytics.pptx` (lesson 8.1): slides 4–6 — what a metric is and why it exists; slides 7–11 — how to build one: goal → product initiatives → business questions → the metric (the Amplitude pyramid on 8–10, the one-line definition on 11: a metric tells you how what you do affects your goal); slides 12–18 — a case: MAU growing while revenue flattens (13–14), product vs growth metrics (15), a monthly KPI table with MoM and YoY (16), **cohort retention curves against a benchmark** (17), a daily product dashboard split into financial, growth and performance metrics (18); slide 19 — the summary grid (question, how, goal, metric; growth, financial, efficiency metrics). Mostly pictures: read them next to this page.
- *Russian terms:* продуктовая аналитика = product analytics, дерево метрик = metric tree, входная / выходная метрика = input / output metric, опережающая / запаздывающая = leading / lagging, воронка = funnel, конверсия шага = step conversion, отвал = drop-off, когорта = cohort, удержание = retention, отток = churn, повторный займ = repeat loan, липкость = stickiness.

---

## 2. Worked example — the metric tree for August 2026 (15 min)

**Ask:** Bekzod wants August's disbursements explained as a chain of drivers, each with an owner.

**Step 1 — the metric definitions.** Before any query, write a definition card for every factor. The **period** is August 2026. The **cohort** is the applications made in August, followed to disbursement (even if the money went out in September). **Active customer**: a customer who, during the month, applied in any channel, opened the app, or had a loan outstanding.

**Step 2 — the metric tree.** Five drivers whose denominators chain: active customers × application rate × approval rate × take-up × average ticket. One query returns every numerator:

```sql
WITH act AS (
  SELECT customer_id FROM applications WHERE applied_at >= '2026-08-01' AND applied_at < '2026-09-01'
  UNION SELECT customer_id FROM app_events WHERE event_time >= '2026-08-01' AND event_time < '2026-09-01'
  UNION SELECT customer_id FROM loans
        WHERE disbursed_at < '2026-09-01' AND (closed_at IS NULL OR closed_at >= '2026-08-01')),
apps AS (
  SELECT a.application_id, a.status, l.principal
  FROM applications a LEFT JOIN loans l ON l.application_id = a.application_id
  WHERE a.applied_at >= '2026-08-01' AND a.applied_at < '2026-09-01')
-- 2 846
SELECT (SELECT COUNT(*) FROM act)                                            AS active_customers,
       -- 649
       COUNT(*)                                                              AS applications,
       -- 392
       SUM(CASE WHEN status IN ('approved', 'approved_not_disbursed') THEN 1 ELSE 0 END) AS approved,
       -- 363
       COUNT(principal)                                                      AS loans,
       -- 23 335 710 000
       SUM(principal)                                                        AS disbursed
FROM apps;
```

**Step 3 — check that the tree multiplies back.** Each factor is a numerator ÷ the previous numerator, so the product must equal the total:

| factor | definition | August 2026 |
|---|---|---|
| active customers | as above | 2 846 |
| application rate | 649 ÷ 2 846 | 22.80 % |
| approval rate (tree) | 392 ÷ 649 | 60.40 % |
| take-up | 363 ÷ 392 | 92.60 % |
| average ticket | 23 335 710 000 ÷ 363 | 64 285 702 |
| **product** | 2 846 × 0.2280 × 0.6040 × 0.9260 × 64 285 702 | **23 335 710 000** ✓ |

The product equals the disbursed amount of August's applications to the soum.

**Step 4 — the funnel inside the tree.** Approval and take-up are two steps of the **lending funnel**. The risk report would say approval = 392 ÷ 566 decided = 69.3 %; the tree uses 60.4 %. The gap is the 83 cancelled applications — a **leaky step** that sits inside "approval" in the tree. Same name, two denominators: write the definition card under both.

**Step 5 — the sentence.** *"August's applications produced 363 loans and 23.3 bn soum: 2 846 active customers, 22.8 % of whom applied; 60.4 % of applications were approved and 92.6 % of approvals were disbursed, at an average ticket of 64.3 m."*

`closed_at` is empty for 15 closed loans (week 3), so those customers count as "outstanding" forever in this definition; at most 15 people in a base of thousands — note it, do not let it stop you.

---

## 3. Practice (60 min)

Every question has a box. SQL boxes run on the course database right here (the same `nur.db`); ✔ Check compares your result with the model answer without showing it. Most questions come in two steps: **compute** (a query) and **read it** (what the number means). Prefer pandas? `data/python/week8/day1_starter.ipynb` loads the tables and has a cell per task — the answers are the same, and the "read it" boxes still check you.

**P1.** *(metric definition)* The metric tree for **September 2026** (the worked example's definitions). Change the dates in the worked example's query and add one column: the number of **decided** applications (not cancelled), which the risk report's approval rate needs.

**P1 — read it.** From your row: the tree's approval rate for September (approved ÷ all applications), in %, two decimals. Then multiply all five factors and check that the product lands on the disbursed amount.

**P2.** *(metric tree)* September's applications produced less money than August's. By how much, and which factor explains most of the fall? Finish the code: print each factor's change and its **share of the log change** (section 1, 'A metric tree'). Which factor's share is largest, in %?

**P2 — read it.** Take-up is in second place (+12.8 % of the fall: 92.6 % → 87.2 %). Is that a real change?

**P3.** *(lending funnel)* Kamola's first question. Build the app funnel: one row per session (`application_id`) with a 0/1 flag per step (`MAX(CASE …)`), then the number of sessions that reached each step. Add **disbursed** from `loans` (a `LEFT JOIN` on `application_id`).

**P3 — read it.** Compute step conversion (k ÷ k−1), conversion from the top and drop-off from your seven counts. Where does the app lose the most people **on the user's side**?

**P4.** *(leaky steps — the population)* The other claim Kamola heard: "most applicants never open the app". Reproduce it: for **all** applications, left-join the sessions that have an `app_open` and count, by channel, the applications and how many of them have one; add the share in %.

**P4 — read it.** Write Kamola two or three sentences: what "most applicants never open the app" really shows, what "funnel conversion" means for a branch or partner customer, and which funnel those customers *do* have.

**P5.** *(leaky steps — segment by the unit)* The funnel by **device**. First check: is `device` constant inside a session? (`COUNT(DISTINCT device)` per `application_id` — try it in the box.) Then build the funnel by session, taking each session's device **from its `app_open` event**: sessions and step conversion at every step, plus open → disbursed.

**P5 — read it.** Grouping **events** by their own device gives approved ÷ submitted 82.4 % on Android and 88.9 % on iOS. Your session table gives 84.2 % and 85.0 %. Which reading is right, and is any device worse?

**P6.** *(leaky steps — a business decision)* The funnel says approved ÷ submitted for the app is 84.5 %; week 1's approval rate for the app channel (approved ÷ decided) is another number. Explain the difference with a cross-tab: for app applications, by `applications.status`, the number of applications and how many of them have a `submit_application` event.

**P6 — read it.** How many app applications were **rejected without ever being submitted**?

**P7.** *(leaky steps — the last step)* The last step. Sessions with a `contract_signed` event but no loan: how many, by `applications.status`, and when were they decided (earliest and latest `decided_at`)?

**P7 — read it.** Which part is a final loss and which part is just the as-of date? Give the **real** post-signature loss as a share of signed contracts, in %, one decimal.

**P8.** *(retention · cohort by month)* Kamola's second question. One row per customer: first and second loan dates (`ROW_NUMBER` by `disbursed_at`, `loan_id` to break ties). For each first-loan month: customers, % with a second loan within 3, 6 and 12 months. Run the plain version first (below) and look at the cohorts of 2026 — then fix it: a cell gets a number only when **every** first loan of the cohort is at least N months old on 2026-10-01, otherwise `NULL`.

```sql
WITH ranked AS (
  SELECT customer_id, disbursed_at,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY disbursed_at, loan_id) AS n
  FROM loans),
pairs AS (
  SELECT f.customer_id, f.disbursed_at AS first_at, s.disbursed_at AS second_at
  FROM ranked f LEFT JOIN ranked s ON s.customer_id = f.customer_id AND s.n = 2
  WHERE f.n = 1)
SELECT strftime('%Y-%m', first_at) AS cohort, COUNT(*) AS customers,
       ROUND(100.0 * SUM(CASE WHEN second_at <= date(first_at, '+3 months')  THEN 1 ELSE 0 END) / COUNT(*), 1) AS m3,
       ROUND(100.0 * SUM(CASE WHEN second_at <= date(first_at, '+6 months')  THEN 1 ELSE 0 END) / COUNT(*), 1) AS m6,
       ROUND(100.0 * SUM(CASE WHEN second_at <= date(first_at, '+12 months') THEN 1 ELSE 0 END) / COUNT(*), 1) AS m12
FROM pairs GROUP BY 1 ORDER BY 1;
```

**P8 — read it.** With the rule, what is the **last** cohort that has a 12-month number? (YYYY-MM)

**P9.** *(retention table and curve)* The cohort triangle by **quarter** of the first loan, columns at 1, 2, 3, 6, 9, 12, 18, 24 months, only observable cells. Tip: cross-join the cohorts with a small table of the eight N values, compute each cell once, then pivot with `MAX(CASE WHEN m = … THEN pct END)`.

**P9 — read it.** Read the triangle **down** the columns (same age, later cohorts) and **across** a row. What is Kamola's answer to "do borrowers come back?" — and what does the triangle *not* tell her?

**P10.** *(churn)* Churn for the customers who repaid a loan in the **fourth quarter of 2025** (`closed_at` from 2025-10-01 to 2025-12-31), with a 6-month window. Start from the churn query in section 1 and change the dates. Return: customers who closed a loan, customers who could churn, came back within 6 months, churned, churn in %.

**P10 — read it.** Q1 2026's churn was 81.1 %. What is Q4 2025's, in %? And can you compare the two?

**P11.** *(active users)* DAU, MAU and stickiness from `app_events` for the twelve months October 2025 – September 2026: distinct customers per day and per month; average DAU over **all calendar days** of the month (a day with no events counts as 0 — `dim_date` has every day); stickiness = average DAU ÷ MAU.

**P11 — read it.** One sentence for Kamola: why is DAU/MAU not the app's North Star?

**P12.** *(vanity vs actionable)* Bekzod's draft first page for the board has three numbers: *"6 040 customers registered"*, *"7 828 loans disbursed since 2024"* and *"approval rate up 5 points this year"*. For each: vanity or actionable, and what you would show instead. Use section 1's test: *if it falls, who does what?*

> 🚀 **Stretch (optional, +5 XP).** **P13.** *(retention by first product)* Repeat borrowing by the **product of the first loan** (`products.code`), for customers whose first loan was before October 2025 — so 12 months are observable for all of them. Does the first product matter for coming back? Then, in the same box, count which product the second loan is.

### Mistakes people make

- A metric tree whose factors do not multiply back to the total (different month, different status list, approval excluding cancelled in the middle of the chain).
- Reading the last factor of a month that ended yesterday (take-up "falls" because approvals are still waiting for money).
- Explaining a fall in the total with the factor that moved most in **percent** instead of its share of the **log** change — and missing a mix effect in the average ticket.
- Calling `app_events` "the funnel" for all customers; dividing app steps by all applications or all customers.
- Grouping events by an attribute logged per event (device, version) instead of per session.
- Ending the funnel at `contract_signed` — the money is in `loans`.
- A cohort table with numbers in cells that cannot be observed yet (m12 for a three-month-old cohort).
- Calling a customer "churned" before the window has ended, or comparing churn rates with different windows.
- DAU/MAU as the North Star of a lender.
- A running total (all customers, all loans ever) on the first page: it can only go up.

---

## 4. Homework

None today. **HW 8.1** (your CV draft and a one-page portfolio index) is set tomorrow, due Day 3. Keep today's queries: the boxes above keep them in this browser, but copy **P3** (funnel), **P7** (signed, never paid out) and **P9** (cohort triangle) into a file now — the capstone (Days 3–5) asks for all three again.

---

## 5. Self-check

---

## 6. Company corner <span class="badge company">The metric tree of a lending company</span>

Disbursement is the product team's North Star; the **board's** is net income. Its tree, with the owner of each branch (see [Who does what](company/roles.md)):

- **NET INCOME (before tax)** — *CFO / Finance (FP&A)*
  - **+ interest income** = average portfolio × yield — *Finance*
    - average portfolio ← disbursements − repayments − write-offs — *Portfolio manager (Bekzod)*
      - disbursements = active customers × application rate × approval × take-up × ticket
        - active customers, application rate, take-up — *Product (Kamola), marketing, branch managers*
        - approval rate — *Risk (Nilufar): scorecard and cut-off*
        - average ticket — *Portfolio manager: product limits, mix*
    - yield ← annual rate, term mix, prepayments, fees — *Product + Finance (pricing)*
  - **− cost of funds** = average portfolio × funding rate — *Treasury / Finance*
  - **− cost of risk** = provisions (expected loss) + write-offs − recoveries — *Risk + Collections*
    - PD ← approval policy, grade mix, FPD (the leading signal), roll rates — *Risk (Nilufar)*
    - LGD ← cure rate, recoveries, restructuring — *Collections (Sevara)*
    - EAD ← ticket, term, amortisation — *Portfolio manager*
  - **− operating expenses** ← acquisition cost per loan (by channel), servicing, collections staff, IT — *Finance, Operations*

What the tree is for: **every request you get is a node on it.** Kamola's funnel is the left end of disbursements; Nilufar's FPD is the leading edge of PD; Sevara's cure rate is LGD; Timur's dashboard is the tree drawn as pages. When a number at the top moves, you walk down until one child explains the change — exactly the log decomposition of P2, one level at a time.

Two September 2026 numbers to see the size of the branches (scheduled interest as a proxy for interest income; the funding rate is our assumption, 18 % a year, used again tomorrow): interest scheduled on instalments due in September **4.39 bn soum**, average outstanding (31 August and 30 September month-ends) **206.0 bn** → an annualised yield of **25.5 %**; funding at 18 % costs **3.09 bn** of that a month. The spread before risk and costs is about **7.5 points** — and week 6's crude expected loss is 1.77 % of the performing exposure. Most of a lender's profit is decided in the risk and cost branches, which is why a product team that grows approvals without watching FPD can grow the top of the tree and shrink the bottom.

| Branch of the tree | Leading metric | Lagging metric | Who asks you |
|---|---|---|---|
| Disbursements | applications, app funnel, approvals this week | disbursed amount, outstanding | Kamola, Bekzod |
| Yield | rate and term mix of new loans | interest income | Finance |
| Cost of risk | FPD30, 1–30 entries, roll 1–30 → 31–60 | NPL90, write-offs, provisions | Nilufar |
| LGD / recoveries | contact rate, promises kept, cure rate | recoveries after write-off | Sevara |
| Opex | cost per application, per loan by channel | operating expenses | Finance, Operations |

> 🎯 **Interview version.** *"How would you build a metric tree for a lender?"* — Start from net income: interest income minus cost of funds, cost of risk and opex. Interest income is average portfolio times yield; the portfolio grows with disbursements, which decompose into active customers × application rate × approval × take-up × ticket — each a team's input metric. Cost of risk decomposes into PD (watched early through FPD), LGD and EAD. Then name an owner per branch and check that the factors multiply back to the total.

**Say it like in an interview.** *"How would you build a metric tree for a lender?"* Answer in four or five sentences, with one Nur number.

Tomorrow: money. Which product earns how much per loan once funding, risk and the cost of selling it are taken out — and the company day.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

---

## Going further — trends and a simple forecast (optional, 40 min)

> STORY **Monday, 17:00.** Bekzod leans over the desk with Wednesday's board agenda. *"One line is still empty: **what will we disburse next quarter?** Last year the plan for the fourth quarter just copied the fourth quarter of the year before — and we disbursed 52 % more. Can you do better than a guess?"* Madina: *"You can test any guess on months that already happened. Hide the last ones, forecast them from the rest, measure the miss. Then give Bekzod a range, not one number."*

### Growth — month on month and year on year

**What it is.** **Month-on-month growth** (MoM, *рост к предыдущему месяцу*) compares a month with the month before. **Year-on-year growth** (YoY, *рост к прошлому году*) compares it with the same month a year before. YoY is the fair comparison when months differ: the same month has the same number of days, the same holidays and the same season.

**How to write it.**

```text
MoM = this month ÷ the month before − 1
YoY = this month ÷ the same month
      a year before − 1
```

`LAG(x)` reads the month before and `LAG(x, 12)` the month 12 rows back (W3D2). The last six closed months:

```sql
-- closed months only: October 2026 has one day so far
WITH m AS (
  SELECT strftime('%Y-%m', disbursed_at) AS month,
         SUM(principal)                  AS disbursed
  FROM loans
  WHERE disbursed_at < '2026-10-01'
  GROUP BY 1),
g AS (
  SELECT month, ROUND(disbursed / 1e9, 2) AS bn,
         -- month on month: the row above
         ROUND(100.0 * (disbursed - LAG(disbursed) OVER (ORDER BY month))
               / LAG(disbursed) OVER (ORDER BY month), 1) AS mom_pct,
         -- year on year: 12 rows above
         ROUND(100.0 * (disbursed - LAG(disbursed, 12) OVER (ORDER BY month))
               / LAG(disbursed, 12) OVER (ORDER BY month), 1) AS yoy_pct
  FROM m)
-- the display filter outside, so LAG still sees 2025
SELECT * FROM g WHERE month >= '2026-04' ORDER BY month;
```

Six rows. Month on month changes sign four times, from −23.7 % (September) to +28.9 % (July). Year on year is positive in every row, from +16.2 % to +114.4 %. The +114.4 % of May says as much about May 2025, a weak month, as about May 2026.

The same in pandas: `pct_change()` for the row above, `shift(12)` for the row 12 above (W5D4).

```python
import sqlite3
import pandas as pd

con = sqlite3.connect("data/raw/nur.db")
m = pd.read_sql("""
    SELECT strftime('%Y-%m', disbursed_at) AS month,
           SUM(principal) AS disbursed, COUNT(*) AS loans
    FROM loans WHERE disbursed_at < '2026-10-01'
    GROUP BY 1 ORDER BY 1""", con, index_col="month")
# month on month: the row above
m["mom_pct"] = (m["disbursed"].pct_change() * 100).round(1)
# year on year: the row 12 above
m["yoy_pct"] = ((m["disbursed"] / m["disbursed"].shift(12) - 1) * 100).round(1)
m.loc["2026-04":]
```

The same six months and the same two columns, plus the loan count, which the next task needs.

**When you use it.**
- "Are we growing?" — year on year, month by month.
- "Did something break last month?" — month on month, read next to year on year.

| | Month on month | Year on year |
|---|---|---|
| Compares with | the month before | the same month a year before |
| Moved by | the season, the days in the month, one big loan | a year of growth, and last year's own noise |

> ⚠️ **Watch out.** October 2026 has one day of loans so far: 21 loans, 0.85 bn. Kept in, it reads −95.0 % month on month. Use closed months only: `disbursed_at < '2026-10-01'`.

**Your turn.** Year-on-year growth of the **number of loans** in September 2026, in %.

### Seasonality — the same months high or low every year

**What it is.** **Seasonality** (*сезонность*) is a pattern that repeats with the calendar: the same months high or low every year. A **seasonal index** (*сезонный индекс*) puts a number on it: the month's average ÷ the average of all months. An index of 1.10 means "usually 10 % above a typical month"; 0.90 means 10 % below.

**How to write it.**

```text
seasonal index (March)
  = average of the Marches
  ÷ average of all months
```

Nur grows about 47 % a year, so divide out the growth first. Compare each month with **the 12 months around it**: six before, the month itself, five after. Every calendar month is in that window once, so its average carries the level, not the season. Then average the ratios of each calendar month:

```sql
WITH m AS (
  SELECT strftime('%Y-%m', disbursed_at) AS month,
         SUM(principal)                  AS disbursed
  FROM loans
  WHERE disbursed_at < '2026-10-01'
  GROUP BY 1),
w AS (
  SELECT month, disbursed,
         -- the level: the 12 months around this one
         AVG(disbursed) OVER (ORDER BY month ROWS BETWEEN 6 PRECEDING AND 5 FOLLOWING) AS level,
         COUNT(*)       OVER (ORDER BY month ROWS BETWEEN 6 PRECEDING AND 5 FOLLOWING) AS months_in
  FROM m)
-- one row per calendar month
SELECT substr(month, 6, 2)              AS mo,
       COUNT(*)                         AS years,
       ROUND(MIN(disbursed / level), 2) AS lowest,
       ROUND(MAX(disbursed / level), 2) AS highest,
       ROUND(AVG(disbursed / level), 2) AS seasonal_index
FROM w
-- full windows only
WHERE months_in = 12
GROUP BY mo ORDER BY mo;
```

| month | lowest | highest | index |
|---|---|---|---|
| 01 | 1.03 | 1.08 | 1.06 |
| 02 | 0.72 | 0.96 | **0.84** |
| 03 | 1.11 | 1.16 | **1.13** |
| 04 | 1.04 | 1.07 | 1.05 |
| 05 (one year) | 0.73 | 0.73 | 0.73 |
| 06 (one year) | 0.86 | 0.86 | 0.86 |
| 07 | 1.12 | 1.13 | **1.13** |
| 08 | 1.00 | 1.30 | 1.15 |
| 09 | 1.01 | 1.06 | 1.04 |
| 10 | 0.88 | 1.25 | 1.06 |
| 11 | 0.99 | 1.23 | 1.11 |
| 12 | 0.77 | 1.13 | 0.95 |

Only 22 months have a full window, so most calendar months have two years and May and June only one. Two months are high in both years by more than 10 %: March and July. February is low in both. In August, October, November and December the two years disagree by 0.24 to 0.37, so those indexes are noise. The season in the amount is **weak**: a few large SME loans move a single month more than the calendar does. (A library function, statsmodels' `seasonal_decompose`, centres the window exactly; its indexes differ from these by 0.02 at most.)

**When you use it.**
- Before you call a month bad: was the same month low last year too?
- Before you choose a seasonal forecast: a weak season adds noise, not accuracy.

> ⚠️ **Watch out.** On a growing series the plain index mixes the growth into the season. January's three values run from 3.9 to 17.5 bn because the company grew, not because of January: its plain index is 0.86, and 1.06 once the growth is divided out. Divide by the level first.

**Your turn.** Run the query on the **number of loans**: replace `SUM(principal)` with `COUNT(*)`. What is February's seasonal index?

### Moving average — smoother, and a month late

**What it is.** A **moving average** (*скользящее среднее*, W3D1) replaces each month with the average of it and the months just before. A 3-month average irons out most of the single-month noise. It looks only backwards, so it **lags**: it turns about a month after the real line.

**How to write it.**

```text
3-month average (September)
  = (July + August + September) ÷ 3
```

```sql
WITH m AS (
  SELECT strftime('%Y-%m', disbursed_at) AS month,
         SUM(principal)                  AS disbursed
  FROM loans
  WHERE disbursed_at < '2026-10-01'
  GROUP BY 1),
a AS (
  SELECT month, ROUND(disbursed / 1e9, 2) AS bn,
         -- this month and the two before
         ROUND(AVG(disbursed) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) / 1e9, 2) AS ma3_bn
  FROM m)
SELECT * FROM a WHERE month BETWEEN '2025-07' AND '2025-12' ORDER BY month;
```

In pandas it is `m["disbursed"].rolling(3).mean()` (W5D4).

| month | bn | 3-month avg | turning point |
|---|---|---|---|
| 2025-07 | 14.59 | 11.24 | |
| 2025-08 | **17.67** | 14.25 | the month's top |
| 2025-09 | 14.64 | **15.63** | the average's top |
| 2025-10 | **12.64** | 14.98 | the month's low |
| 2025-11 | 14.64 | **13.97** | the average's low |
| 2025-12 | 17.72 | 15.00 | |

The month tops out in August and bottoms out in October; the average does both a month later. It is also much calmer: in 2026 single months moved between −31.8 % and +65.3 % month on month, the 3-month average between −6.4 % and +13.4 %.

**When you use it.**
- The trend line on a chart: the month in grey, the average in colour (W4D4, W5D4).
- Not to catch a turn early: the average confirms a turn about a month late.

> ⚠️ **Watch out.** The first two months have no full window: `AVG` over the frame quietly averages one month in January 2024 and two in February. Show `COUNT(*)` over the same frame next to it (W3D1), or leave those months out.

**Your turn.** Show **2026** instead: change the last line to `WHERE month >= '2026-01'`. The month itself tops out in August 2026 (22.29 bn). In which month is the 3-month average highest?

### A simple forecast — and the test that keeps it honest

**Before you read.** Guess first, then play with it — the explanation below will make more sense.

**What it is.** A **forecast** (*прогноз*) guesses future months from past ones. Four simple methods: **naive** (every month ahead = the last month seen), **seasonal naive** (each month = the same month a year before), **the average of the last 3**, and a **straight-line trend** (the line that passes closest to the past months, continued). The **holdout test** (*проверка на отложенных данных*) hides the last months, forecasts them from the months before and measures the miss: **MAE** is the average miss in soum, **MAPE** the average miss as a % of the actual.

**How to write it.**

```text
miss = forecast − actual
MAE  = average of |miss|
MAPE = average of |miss| ÷ actual
```

Hide April–September 2026 and let the four methods forecast them from the 27 months before:

```python
import sqlite3
import numpy as np
import pandas as pd

con = sqlite3.connect("data/raw/nur.db")
m = pd.read_sql("""
    SELECT strftime('%Y-%m', disbursed_at) AS month,
           SUM(principal) AS disbursed
    FROM loans WHERE disbursed_at < '2026-10-01'
    GROUP BY 1 ORDER BY 1""", con)
y = m["disbursed"].to_numpy() / 1e9
# hide the last H months: the test
H = 6
train, test = y[:-H], y[-H:]
n = len(train)
# the straight line through the training months
slope, start = np.polyfit(np.arange(n), train, 1)
forecasts = {
    "naive": np.repeat(train[-1], H),
    "seasonal naive": y[n - 12:n - 12 + H],
    "average of last 3": np.repeat(train[-3:].mean(), H),
    "straight line": start + slope * np.arange(n, n + H),
}
mape = {}
for name, f in forecasts.items():
    mae = np.mean(np.abs(f - test))
    mape[name] = np.mean(np.abs(f - test) / test) * 100
    print(f"{name:18} MAE {mae:.2f} bn   MAPE {mape[name]:.1f} %")
```

The straight line wins: it misses by 9.5 % a month on average (1.76 bn). Naive misses by 11.8 %, the average of the last 3 by 12.4 %. Seasonal naive is last with 30.4 %, and all six of its months are too low: last year's month is a year of growth behind.

The winner, fitted on all 33 months and continued three months:

```python
# needs y and mape from the box above
slope, start = np.polyfit(np.arange(len(y)), y, 1)
q4 = start + slope * np.arange(len(y), len(y) + 3)
total = q4.sum()
# ± the line's miss on the 6 hidden months
miss = mape["straight line"] / 100
print("Oct, Nov, Dec 2026:", q4.round(2))
print(f"Q4 2026: {total:.1f} bn, range {total * (1 - miss):.1f}–{total * (1 + miss):.1f} bn")
```

20.50, 20.98 and 21.47 bn: **62.9 bn** for the quarter, with a range of 56.9–68.9 bn. The range is a teaching simplification: ± the miss the method made on the test. A statistical model gives a proper interval, which widens with each month ahead.

**When you use it.**
- Bekzod's "what will we disburse next quarter?": a tested method, a number and a range.
- Choosing a method: the smallest miss on hidden months, tested on several months, not one.

| Method | Assumes | Breaks when |
|---|---|---|
| naive | next month = this month | the series grows or swings |
| seasonal naive | next month = a year ago | the business grows (Nur: +47 % a year) |
| average of the last 3 | next = the recent level | the series trends: it sits behind |
| straight line | growth goes on at the same pace | growth bends, or a shock arrives |

> ⚠️ **Watch out.** Test on several months, never one. Hide only September 2026 and seasonal naive wins (13.9 %); hide six months and it comes last (30.4 %). One month is luck.

**Your turn.** In the first box set `H = 3` (hide July–September 2026). What is the **smallest** MAPE of the four, in %?

### Try it on the real data

**T1.** Bekzod's quarter is a sum of three months. Hide **July–September 2026**, fit the straight line on the 30 months before and forecast the **quarter's total**. Print the forecast in bn (one decimal), the actual total and the miss in %.

A second opinion, built from the first concept. The quarters, each with the same quarter a year before:

```sql
-- disbursed per quarter, closed quarters only
WITH q AS (
  SELECT strftime('%Y', disbursed_at) || 'Q' ||
         ((CAST(strftime('%m', disbursed_at) AS INTEGER) + 2) / 3) AS quarter,
         SUM(principal) AS disbursed
  FROM loans
  WHERE disbursed_at < '2026-10-01'
  GROUP BY 1)
SELECT quarter,
       ROUND(disbursed / 1e9, 2)                                 AS bn,
       -- the same quarter a year before: 4 rows above
       ROUND(LAG(disbursed, 4) OVER (ORDER BY quarter) / 1e9, 2) AS year_before_bn
FROM q
ORDER BY quarter;
```

**T2.** Take the fourth quarter of 2025 and grow it by the year-on-year growth of the last closed quarter (2026Q3 ÷ 2025Q3). What does that give for Q4 2026, in bn?

### In one minute

- **Growth:** compare a month with the same month a year before; month on month swings with the calendar and single big loans. Closed months only: October 2026 has one day.
- **Seasonality** counts only if it repeats. In Nur's amount it is weak: March and July high, February low (partly a 28-day month), the rest flips from year to year.
- **A 3-month average** smooths the noise and turns about a month after the real line.
- **A forecast** is tested on hidden months before anyone trusts it. On April–September 2026 the straight line missed by 9.5 %, seasonal naive by 30.4 %. Answer with a range: Q4 2026 ≈ 62.9 bn, 56.9–68.9 bn.


=====
PAGE: Week 8 · Day 2 — Product analytics II and the company day: unit economics, storytelling, the job (weeks/week-08/day-2.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-08/day-2
=====

# Week 8 · Day 2 — Product analytics II and the company day: unit economics, storytelling, the job

<span class="badge">Unit economics 60 min</span> <span class="badge">Practice 45 min</span> <span class="badge">Storytelling 20 min</span> <span class="badge">The company day 60 min</span> <span class="badge">CV 20 min</span> <span class="badge hw">HW 8.1 due Day 3</span> <span class="badge company">Company corner</span>

> STORY **Tuesday, 9:00.** Bekzod has the 2027 budget template open, a column per product, every cell empty. *"Finance wants a number per product: **what does one loan earn us after we pay for the money, for the losses and for selling it?** Kamola wants more Micro, Nilufar wants less BNPL, and I want to know which of them is right before I sign the plan."* Madina, putting a printed job advert on your desk: *"And this afternoon we do something else. Next week you will be in interviews, not in my team. I will walk you through this company from the board to the collections desk — what every desk asks, what every dashboard shows, who reports what to the central bank — and you will write your CV tonight."*

## Today in 3 lines

- You compute the **unit economics of a loan by product** — interest over the schedule, minus the cost of funds, minus expected loss, minus the cost of acquiring and servicing it — per loan and per 1 000 soum lent, with every assumption written down; then **LTV/CAC** for an app customer who comes back, and a **sensitivity**: at what default rate does a product stop paying.
- You learn to **tell it**: the answer first (the pyramid), titles that say "so what", one chart per message, the 10-slide analytical deck, and a page a busy executive reads in two minutes.
- **The company day:** a guided tour of a lending company end to end — departments, who asks the analyst what, a week in the life of five analyst roles, regulators and IFRS 9 in plain words, how to read a company you interview at — and your **CV** with a portfolio built from this course (HW 8.1).

---

## 1. Learn — unit economics of a loan

**Unit economics** (*юнит-экономика*) answers one question: does one unit make money? For a lender the unit is **one loan**, and later one customer. Each subsection below adds one line of the loan's profit and loss; together they make the table Bekzod's budget needs. The numbers are averages per product, over all 7 828 loans.

### Revenue per loan — interest and fees

(Animated explanation)
Where a loan's money comes from
- An average Consumer loan: Nur hands out 26 926 915 soum. Picture that money leaving Nur's pocket.
- Over about 15 months the borrower pays all of it back, 26 926 915. That only brings Nur back to zero: the principal is Nur's own money returning, not revenue.
- On top comes the interest: 5 695 580 soum. That is the loan's revenue.
- Fees count too, but our database has no fee column. BNPL's revenue is a merchant fee the shop pays: write “fees: not in the data” rather than showing BNPL with no revenue.
- Products differ hugely in size, so compare interest **per 1 000 soum lent**. Auto earns 418.8; Micro, with the highest rate (42 % a year), only 98.6.
- Why?

**What it is.** **Revenue per loan** is what the borrower (or a partner) pays Nur for the loan: **interest** over the schedule plus any **fees**. The principal is not revenue — it is Nur's own money coming back.

**How to write it.**

```sql
SELECT p.code, p.annual_rate,
       COUNT(*)                     AS loans,
       ROUND(AVG(l.principal))      AS avg_principal,
       -- revenue: interest over the schedule
       ROUND(AVG(s.interest))       AS interest_per_loan,
       ROUND(1000.0 * AVG(s.interest) / AVG(l.principal), 1) AS interest_per_1000_lent
FROM loans l
JOIN products p ON p.product_id = l.product_id
-- one row per loan
JOIN (SELECT loan_id, SUM(interest_due) AS interest
      FROM installments GROUP BY loan_id) s ON s.loan_id = l.loan_id
GROUP BY p.code, p.annual_rate
ORDER BY interest_per_loan DESC;
```

An average SME loan brings 92 835 258 soum of interest, an Auto loan 90 816 842, a Consumer loan 5 695 580, a Micro loan 266 662. BNPL brings 0: the customer pays no interest. Per 1 000 soum lent, Auto earns the most interest (418.8): it is outstanding for 36 months. Micro charges the highest rate, 42 % a year, but for 4.5 months only, so it earns 98.6.

**When you use it.**
- The top line of any per-loan or per-product profit table.
- Comparing products of very different sizes: use interest **per 1 000 soum lent**.

> ⚠️ **Watch out.** Our database has no fee column. BNPL's revenue is a **merchant fee** the shop pays Nur for each sale it finances — it exists in the partner contracts, not in `loans`. Write "fees: not in the data" under the table rather than letting BNPL look like a product with no revenue.

**Your turn.** Interest per 1 000 soum lent for **Consumer** loans (one decimal).

### Cost of funds — paying for the money

(Animated explanation)
Renting the money
- Loan 8: a 6-month Micro loan of 3 360 000 soum. Each bar is what the borrower still owes before each instalment — it falls every month.
- Nur borrows this money itself and pays for it: 18 % a year, 1.5 % a month, on what is **still out**. That is the cost of funds.
- Month by month: 1.5 % of 3 360 000 is 50 400, then 1.5 % of 2 847 000 is 42 705, and so on. Add the six: 181 445 soum.
- Your turn.
- For an average Consumer loan the funding costs 3 417 348 soum — 60.0 % of its interest. For most products it is the biggest cost.
- What is left after funding comes from the gap between the loan's rate and the funding rate, the net interest margin. Here 2 278 232 soum, to pay for losses and for selling the loan.

**What it is.** **Cost of funds** (*стоимость фондирования*) is what Nur pays its own lenders for the money while it is out with the borrower. It is charged on the **balance still owed**, which falls with every instalment. Our assumption: **18 % a year**, 1.5 % a month.

**How to write it.**

```text
cost of funds per loan
  = Σ over instalments
    (balance owed before
     instalment k) × 0.18 ÷ 12

balance before k
  = principal − principal repaid
    in instalments 1 … k−1
```

```sql
-- each instalment with the balance owed before it
WITH sched AS (
  SELECT i.loan_id,
         l.principal - COALESCE(SUM(i.principal_due) OVER (PARTITION BY i.loan_id ORDER BY i.installment_no
                       ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 0) AS bal_before,
         i.interest_due
  FROM installments i JOIN loans l ON l.loan_id = i.loan_id),
per_loan AS (
  SELECT loan_id, SUM(bal_before) AS bal_months, SUM(interest_due) AS interest
  FROM sched GROUP BY loan_id)
SELECT p.code,
       -- 1.5 % a month on the balance
       ROUND(AVG(pl.bal_months) * 0.18 / 12)                         AS cost_of_funds,
       ROUND(100.0 * AVG(pl.bal_months) * 0.18 / 12 / AVG(pl.interest), 1) AS share_of_interest_pct
FROM per_loan pl
JOIN loans l    ON l.loan_id = pl.loan_id
JOIN products p ON p.product_id = l.product_id
GROUP BY p.code ORDER BY share_of_interest_pct DESC;
```

Funding eats 75.0 % of an Auto loan's interest, 69.2 % of SME's, 60.0 % of Consumer's and 42.9 % of Micro's. BNPL's share is empty: it has a cost of funds (249 053 soum per loan) and no interest to divide by.

**When you use it.**
- Every lending P&L: for most products it is the largest cost.
- The gap between the loan's rate and the funding rate is the **net interest margin** — what is left to pay for risk and costs.

> ⚠️ **Watch out.** Funding on the **original principal** for the whole term doubles the cost of an annuity loan: half way through, the borrower owes about half. Always use the falling balance.

**Your turn.** Micro's cost of funds is 114 284 soum per loan at 18 %. What would it be at **24 %** a year? (whole soum)

### Cost of risk — expected loss = PD × LGD × EAD

(Animated explanation)
100 loans, about 3 go bad
- 100 average Consumer loans. From Week 6: 77 of 2 418 Consumer loans are now 90+ days late — a PD of 3.18 %, about 3 in 100.
- When a borrower stops, part of the loan is still owed: on average 21 630 783 soum, 80 % of the 26.9 m lent. That is the EAD.
- Collections get some of it back; Nur assumes 60 % is lost for good, the LGD. One default loses 12 978 470 soum.
- Spread over all the loans, each one carries an expected loss of 413 293 soum: how likely × how much is lost × of how much.
- Your turn.
- A defaulting loan also stops paying interest, so the revenue line becomes (1 − PD) × interest: 5 514 207 instead of 5 695 580.
- One trap: a PD counted on **all** loans mixes in young loans that have not had time to default. For long products (SME, Auto) it understates the risk — recompute it on matured loans.

**What it is.** The **cost of risk** of a loan is its **expected loss** (*ожидаемый убыток*, EL): the loss you expect on average, priced in before anyone defaults. Three plain-word parts: **PD** — how likely the borrower stops paying; **LGD** — what share of the debt is lost if they do; **EAD** — how much they still owe when they stop.

**How to write it.**

```python
# EL = PD × LGD × EAD — an average Consumer loan
# PD: 77 of 2 418 Consumer loans are now 90+ days past due (week 6's crude PD)
pd_cons   = 77 / 2418
# LGD: 60 % of what is owed is lost (our assumption)
lgd       = 0.60
# EAD: Consumer loans in 90+ still owed 80.33 % of the 26 926 915 principal when
# they stopped
ead_cons  = 21_630_783
el_cons   = pd_cons * lgd * ead_cons
print(f"PD {pd_cons:.2%} · EAD {ead_cons:,.0f} · EL {el_cons:,.0f} soum per loan")
```

PD 3.18 % × LGD 60 % × EAD 21 630 783 = 413 293 soum per loan. A defaulting loan also stops paying interest, so the revenue line becomes (1 − PD) × interest.

**When you use it.**
- The risk line of every per-loan P&L.
- Comparing products: EL per 1 000 lent is 11 for Micro, 15 for Consumer, 18 for SME.

| Part | Plain words | Nur's source |
|---|---|---|
| PD | how likely the loan defaults | share of the product's loans now 90+ DPD |
| LGD | share of the debt lost after default | 60 %, our assumption (collections would know) |
| EAD | what is owed at the moment of default | balance at the first unpaid instalment |

> ⚠️ **Watch out.** A PD measured on all loans mixes young loans that have not had time to default with old ones. For long products (SME, Auto) it understates the risk; recompute it on matured loans (P8) before you trust a long product's margin.

**Your turn.** A Micro loan: PD 2.85 %, LGD 60 %, EAD 1 777 000 soum. Expected loss in whole soum?

### Operating cost per loan — selling it and servicing it

**What it is.** **Operating cost per loan** is what it costs to **acquire** the loan (marketing, the officer's time, the bureau check, the partner's commission) plus what it costs to **service** it each month (statements, SMS, payment processing, IT). Neither is in our data: they are assumptions you write under the table.

**How to write it.**

```sql
SELECT p.code, p.channel,
       ROUND(AVG(l.term_months), 2)                                         AS avg_term,
       -- ours
       CASE p.channel WHEN 'app' THEN 60000 WHEN 'branch' THEN 450000 ELSE 100000 END AS acquisition,
       -- ours
       CASE p.channel WHEN 'app' THEN 8000  WHEN 'branch' THEN 25000  ELSE 8000   END AS servicing_month,
       ROUND(CASE p.channel WHEN 'app' THEN 60000 WHEN 'branch' THEN 450000 ELSE 100000 END
           + CASE p.channel WHEN 'app' THEN 8000  WHEN 'branch' THEN 25000  ELSE 8000   END * AVG(l.term_months)) AS opex_per_loan
FROM loans l JOIN products p ON p.product_id = l.product_id
GROUP BY p.code, p.channel ORDER BY opex_per_loan DESC;
```

An Auto loan costs 1 354 604 soum to sell and service, SME 1 058 067, Consumer 823 325, BNPL 155 740, Micro 95 996. Per 1 000 lent the order turns over: SME 3.4, Auto 6.2 — but Consumer 30.6, Micro 35.5, BNPL 37.3.

**When you use it.**
- The cost lines between expected loss and the contribution.
- Channel decisions: a branch sale (450 000) costs 7.5 app sales (60 000).

> ⚠️ **Watch out.** These are **our** orders of magnitude, not Nur's books. A cost table without the assumption printed underneath is a guess dressed as a fact; with it, Finance can replace each figure with the real one and rerun.

**Your turn.** A 12-month Consumer loan sold at a branch: operating cost in soum?

### Contribution margin per loan — what one loan leaves behind

(Animated explanation)
One loan's money, line by line
- One average Consumer loan as a waterfall. It starts with its interest: 5 695 580 soum.
- 3.18 % of such loans default and stop paying interest: on average −181 373. What really comes in: 5 514 207.
- The rent on the money, funding at 18 %: −3 417 348.
- The expected loss, PD × LGD × EAD: −413 293.
- Selling it at a branch: −450 000. Servicing it for its 15 months at 25 000 a month: −373 325. Together, the operating cost.
- What is left is the loan's contribution: 860 241 soum.
- As a share of the income it is the contribution margin: 15.6 %. Per 1 000 soum lent: 31.9.
- Look at the bars.
- The contribution comes before overheads (head office, rent), tax and capital. Say first whether you rank products per loan or per 1 000 soum lent: a big loan can win one and lose the other.

**What it is.** The **contribution** (*маржинальный доход*) of a loan is revenue minus every cost the loan itself causes: funding, expected loss, acquisition and servicing. **Contribution margin** is that contribution as a share of revenue. It is before overheads (head office, rent), tax and capital.

**How to write it.**

```python
# an average Consumer loan, every line from the subsections above
interest, pd_c, cof = 5_695_580, 77 / 2418, 3_417_348
el, acq, serv       = 413_293, 450_000, 25_000 * 14.933
# a defaulting loan pays no interest
income = (1 - pd_c) * interest
net    = income - cof - el - acq - serv  # contribution per loan
print(f"income {income:,.0f} · contribution {net:,.0f} · margin {net / income:.1%} · per 1 000 lent {net / 26_926_915 * 1000:.1f}")
```

A Consumer loan leaves 860 241 soum: 15.6 % of its income, or 31.9 soum for every 1 000 soum lent.

**When you use it.**
- "Which product earns most?" — but say first whether you mean per loan or per soum.

| | Per loan | Per 1 000 soum lent |
|---|---|---|
| Answers | which sale is worth a salesperson's afternoon | where the next billion of funding earns most |
| Leader at Nur | SME, 18.6 m per loan | Auto, 72.9 per 1 000 |

> ⚠️ **Watch out.** A large loan can earn a lot per loan and little per soum. Say which question you are answering before you rank anything.

**Your turn.**

### Break-even — the value at which a loan stops paying

(Animated explanation)
A good loan, a bad loan — and the break-even
- Split the loans into two kinds. One that **pays**: interest in, funding and operating cost out. It leaves 1 454 907 soum.
- One that **defaults**: no interest, the same funding and operating cost, and 60 % of the 21 630 783 it owes lost. It costs 17 219 143 soum.
- If a share PD of the loans goes bad, one loan leaves on average: good − PD × (good + bad). At 3.18 %: 860 241 — the waterfall's number again.
- Each extra point of PD costs 186 740 soum per loan (1 % of 18 674 050). Where does the line cross zero?
- At PD = 7.79 % a loan leaves exactly nothing: the break-even PD. Today's 3.18 % leaves 4.6 points of headroom.
- Your turn.
- Week 9 uses exactly these two numbers to draw the line on the credit score: decline a group only when it goes bad more often than 7.79 %.
- Every guessed input has a break-even — the funding rate, the LGD, a merchant fee. Report it next to the result: “we are fine while PD stays under 7.79 %”.

**What it is.** A **break-even** is the value of one input at which the contribution is exactly zero, with every other input held. Above it (or below it) the loan loses money. It turns a guess into a guardrail: "we are fine while PD stays under X".

**How to write it.** Set net = 0 and solve for the input. For PD:

```text
net(PD) = (1 − PD) × I − CoF
          − PD × LGD × EAD
          − acq − serv = 0
PD* = (I − CoF − acq − serv)
      ÷ (I + LGD × EAD)
```

```python
I, cof, acq, serv = 5_695_580, 3_417_348, 450_000, 25_000 * 14.933
lgd, ead = 0.60, 21_630_783
pd_star = (I - cof - acq - serv) / (I + lgd * ead)
print(f"Consumer break-even PD {pd_star:.2%}  (today 3.18 %)")
```

A Consumer loan breaks even at a PD of 7.79 %. Today's 3.18 % leaves 4.6 points of headroom.

**When you use it.**
- Any input you guessed: report its break-even next to the result.
- Pricing: the fee or rate at which a losing product starts to pay (BNPL's merchant fee, P5).

**Your turn.** BNPL loses 449 053 soum on an average loan of 4 170 880. What merchant fee, in % of principal, makes it break even?

### Sensitivity — what moves the margin most

**What it is.** A **sensitivity** analysis (*анализ чувствительности*) moves one input at a time by a plausible amount and records how much the result changes. The inputs that move it most are the ones to measure properly — or to watch.

**How to write it.**

```python
I, pd_c, cof, lgd = 5_695_580, 77 / 2418, 3_417_348, 0.60
ead, acq, serv = 21_630_783, 450_000, 25_000 * 14.933

def net(pd_=pd_c, fund=0.18, lgd_=lgd, acq_=acq, serv_=serv, rate_x=1.0):
    return (1 - pd_) * I * rate_x - cof / 0.18 * fund - pd_ * lgd_ * ead - acq_ - serv_

base = net()
moves = {"funding 18 % → 22 %": net(fund=0.22),
         "loan rate −10 %": net(rate_x=0.9),
         "acquisition +50 %": net(acq_=acq * 1.5),
         "PD +1 point": net(pd_=pd_c + 0.01),
         "servicing +50 %": net(serv_=serv * 1.5),
         "LGD 60 % → 70 %": net(lgd_=0.70)}
for name, value in sorted(moves.items(), key=lambda kv: kv[1]):
    print(f"{name:22s} net {value:12,.0f}   change {value - base:12,.0f}")
```

From a base of 860 241 soum, four points of funding cost take 759 411; a 10 % lower loan rate takes 551 421; half as much again on acquisition takes 225 000; one point of PD takes 186 740; ten points of LGD take 68 882. For a Consumer loan, the price of money matters four times more than the PD.

**When you use it.**
- Before you defend a result built on assumptions: know which one it hangs on.
- To decide what to measure next (here: the real funding rate, before a better LGD).

> ⚠️ **Watch out.** Move each input by a **plausible** amount, not by the same percentage. "PD +10 %" is 0.3 points; "funding +10 %" is 1.8 points — not comparable. Write the range you used next to each line.

**Your turn.** For a Consumer loan, which input moves the contribution most?

### CAC and payback — winning a new borrower

(Animated explanation)
Is a new customer worth winning?
- Winning one new app borrower costs Nur 60 000 soum: marketing, the bureau check. That is the CAC.
- Her first Micro loan earns 78 430 before that cost, over 4.5 months: about 17 429 a month. Month by month the hole fills up.
- The 60 000 is back after 3.4 months — inside the first loan's own 4.5-month term. That is the payback.
- Use the contribution **before** acquisition (78 430, not 18 430). Subtracting the CAC twice — once in the contribution, again in the payback — makes every channel look worse.
- Your turn.
- But she may come back. 903 new app customers took 1 069 Micro loans in their first 12 months: 1.18 each. A repeat is cheaper to sell — 20 000 instead of 60 000.
- The contribution a customer brings over a fixed horizon is her LTV: 89 171 soum.
- Above 1, winning her pays for itself; product teams like 3 or more. Micro's 1.49 pays, with little room.
- Three traps: an LTV built from revenue instead of contribution; a horizon longer than the customers have lived; an average lifted by a few huge loans — show the median customer too.

**What it is.** **CAC** (*customer acquisition cost*, стоимость привлечения клиента) is what it costs to win one **new** borrower. **Payback** is the number of months of contribution needed to earn the CAC back. Here CAC is the acquisition cost of the first loan: app 60 000, branch 450 000, partner 100 000 soum.

**How to write it.**

```text
payback (months)
  = CAC ÷ (contribution before
    acquisition ÷ term in months)
```

```python
cac_micro, contrib_before_acq_micro, term_micro = 60_000, 18_430 + 60_000, 4.50
cac_cons,  contrib_before_acq_cons,  term_cons  = 450_000, 860_241 + 450_000, 14.933
for name, cac, c, t in [("Micro", cac_micro, contrib_before_acq_micro, term_micro),
                        ("Consumer", cac_cons, contrib_before_acq_cons, term_cons)]:
    per_month = c / t
    print(f"{name:9s} earns {per_month:,.0f} a month before acquisition → payback {cac / per_month:.1f} months")
```

A Micro loan earns 17 429 soum a month before acquisition, so its 60 000 CAC is back after 3.4 months — inside its own 4.5-month term. A Consumer loan earns 87 741 a month and pays back 450 000 in 5.1 months.

**When you use it.**
- "Can we afford to spend more on marketing?" — only if payback stays inside the first loan's term.
- Comparing channels: a cheap channel with a short payback beats an expensive one with a long one.

> ⚠️ **Watch out.** Use the contribution **before** acquisition. Subtracting the CAC twice — once in the contribution and again in the payback — makes every channel look worse.

**Your turn.** A Consumer loan sold through the app instead (CAC 60 000), same 87 741 a month. Payback in months, to 1 decimal?

### LTV and LTV/CAC — what a customer is worth

**What it is.** **LTV** (*lifetime value*, пожизненная ценность клиента) is the contribution a customer brings over a fixed **horizon**: the first loan and every repeat, each repeat cheaper to sell because the customer is known. **LTV ÷ CAC** above 1 means acquiring the customer pays for itself; product teams like 3 or more.

**How to write it.** Count the loans each new customer took within the horizon, then price them:

```sql
WITH ranked AS (
  SELECT l.customer_id, l.disbursed_at, p.code,
         ROW_NUMBER() OVER (PARTITION BY l.customer_id ORDER BY l.disbursed_at, l.loan_id) AS n
  FROM loans l JOIN products p ON p.product_id = l.product_id),
-- new app customers with 12 observable months
firsts AS (
  SELECT customer_id, disbursed_at AS first_at FROM ranked
  WHERE n = 1 AND code = 'MICRO' AND disbursed_at < '2025-10-01')
SELECT COUNT(DISTINCT f.customer_id) AS customers,
       COUNT(*)                      AS micro_loans_in_12m
FROM firsts f
JOIN ranked r ON r.customer_id = f.customer_id AND r.code = 'MICRO'
             AND r.disbursed_at <= date(f.first_at, '+12 months');
```

```python
customers, loans = 903, 1069  # from the query above
contrib_before_acq, repeat_cost, cac = 78_430, 20_000, 60_000
ltv = (loans * contrib_before_acq - repeat_cost * (loans - customers)) / customers
print(f"{loans / customers:.2f} Micro loans per customer · LTV {ltv:,.0f} · LTV/CAC {ltv / cac:.2f}")
```

903 customers took 1 069 Micro loans in their first 12 months: 1.18 each. LTV = 89 171 soum against a CAC of 60 000: LTV/CAC = 1.49.

**When you use it.**
- "How much can we pay to win a customer?" — up to the LTV, and less if you want a margin.
- Comparing acquisition channels or first products.

> ⚠️ **Watch out.** Three traps: an LTV built from **revenue** instead of contribution; a horizon longer than the cohort has lived; and an **average** lifted by a few huge cross-sold loans. Show the median customer next to the average (P10).

**Your turn.** If the app's CAC rose to 80 000 soum, what would LTV/CAC be? (two decimals)

### The one-page P&L of a product

**What it is.** A **product P&L** (*отчёт о прибылях и убытках продукта*) puts the per-loan lines on one page, multiplied by the volume: revenue, minus funding, risk and operating costs, equals the product's contribution for the period. Every assumption sits in a footnote on the same page.

**How to write it.**

```python
# Micro loans disbursed in 2026, 1 January to the as-of date 1 October
loans_2026 = 1045
per_loan = {"interest income (1 − PD) × I": 259_069,
            "− cost of funds (18 %)":       -114_284,
            "− expected loss":              -30_360,
            "− acquisition (app)":          -60_000,
            "− servicing (8 000 a month)":  -35_996}
total = 0
for line, value in per_loan.items():
    total += value * loans_2026
    print(f"{line:32s} {value * loans_2026 / 1e6:8.1f} m soum")
print(f"{'= contribution':32s} {total / 1e6:8.1f} m soum   ({total / (2_705_586 * loans_2026) * 1000:.1f} per 1 000 lent)")
print("Assumptions: funding 18 %, LGD 60 %, acquisition and servicing per channel (ours); averages over all Micro loans.")
```

| Micro, 2026 to 1 October (1 045 loans) | m soum |
|---|---|
| interest income | 270.7 |
| − cost of funds | −119.4 |
| − expected loss | −31.7 |
| − acquisition | −62.7 |
| − servicing | −37.6 |
| **= contribution** | **19.3** |

1 045 Micro loans earned 270.7 m soum of interest and left 19.3 m after every cost — 6.8 soum per 1 000 lent.

**When you use it.**
- A budget, a product review, a "should we grow it?" question.
- When a single per-loan number needs its scale: 19.3 m for Micro against 5.68 bn for SME.

**Your turn.** Auto had 165 loans in 2026 with a contribution of 15 813 021 soum each. Its 2026 contribution, in billions of soum (two decimals)?

### Telling it — the answer first

**What it is.** The **pyramid principle** (*принцип пирамиды*, Barbara Minto) puts the **answer** at the top, then the 2–4 **reasons**, then the **evidence** for each. A **so-what title** is a slide title written as the sentence the reader should conclude.

**How to write it.**

| Line | What it says |
|---|---|
| answer | Grow SME and Auto; renegotiate BNPL's merchant fee or slow it. |
| reasons | SME and Auto earn 60–73 soum per 1 000 lent; BNPL loses 108. A new Micro customer pays back the acquisition on the first loan. |
| evidence | the per-product table, the sensitivity, the LTV — one chart each |
| assumptions | funding 18 %, LGD 60 %, acquisition and servicing per channel (ours) |

Four rules: the answer in the first sentence; titles that are sentences with a number (not *"Unit economics by product"* but *"SME and Auto earn 60–73 soum per 1 000 lent; BNPL loses 108"*); one chart per message; numbers rounded to what matters, with units, the decision in bold.

**When you use it.** Every result you hand over — a slide, a memo, a message to Bekzod. The 10-slide analytical deck: title · executive summary · context · 4–5 findings, one each · recommendations · risks and next steps · appendix (never presented).

> ⚠️ **Watch out.** The method before the answer ("first we loaded seven tables…") spends the executive's attention before you reach the recommendation. The method goes to the appendix.

**Your turn.**

### Putting it together

Bekzod's question — *which product earns what per loan?* — is the subsections in a row. Revenue (interest, plus fees where they exist) → minus cost of funds on the falling balance → minus expected loss PD × LGD × EAD → minus acquisition and servicing → **contribution**, per loan and per 1 000 lent. Then the guardrails: the **break-even** of every guessed input and a **sensitivity** that shows which guess matters. Then the customer view: **CAC, payback, LTV/CAC**. Then the **P&L** at the year's volume, told **answer first**.

| per average loan | AUTO | SME | CONS | MICRO | BNPL |
|---|---|---|---|---|---|
| interest income (1 − PD) × I | 88 494 161 | 89 388 110 | 5 514 207 | 259 069 | 0 |
| − cost of funds | 68 112 632 | 64 270 563 | 3 417 348 | 114 284 | 249 053 |
| − expected loss | 3 213 904 | 5 447 028 | 413 293 | 30 360 | 44 260 |
| − acquisition + servicing | 1 354 604 | 1 058 067 | 823 325 | 95 996 | 155 740 |
| **= contribution** | **15 813 021** | **18 612 452** | **860 241** | **18 430** | **−449 053** |
| per 1 000 lent | 72.9 | 60.3 | 31.9 | 6.8 | −107.7 |

You build this table yourself in P1–P4.

**Which line answers which question?**

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Answer first, one focal point, never a single number — [7 Effective Tips for Presenting Data at Work! (Jeff Su), 00:45](https://youtu.be/jizZKNnx9wA?t=45&end=97)
- ▶ Structuring a narrative — [Storytelling with Data (Cole Nussbaumer Knaflic, Talks at Google), 22:19](https://youtu.be/8EMW7io4rSI?t=1339&end=1537)
- ▶ Presenting a story (from the data team's own webinar) — [How to turn data into stories (storytelling with data), 25:54](https://youtu.be/Hfx1X9WSGYQ?t=1554&end=2138)

---

## 2. Worked example — one Consumer loan (15 min)

**Ask:** Finance wants to see one real loan taken through every line. Loan 1 (week 1): Consumer, **31 150 000** soum, 24 months, 30 % a year, annuity 1 741 700 a month, branch channel.

**Step 1 — revenue per loan.** The interest over the schedule, read from `installments`. **Step 2 — cost of funds**, on the balance before each instalment. ▶ Run the block: it reads the loan's schedule from the course database.

```python
import sqlite3
import pandas as pd
con = sqlite3.connect("data/raw/nur.db")
inst = pd.read_sql("SELECT installment_no, principal_due, interest_due FROM installments WHERE loan_id = 1 ORDER BY installment_no", con)
inst["bal_before"] = 31_150_000 - (inst["principal_due"].cumsum() - inst["principal_due"])
# 10 650 293  interest over the schedule
I   = inst["interest_due"].sum()
# 426 011 732 balance-months × 1.5 % = 6 390 176
cof = inst["bal_before"].sum() * 0.18 / 12
print(f"interest {I:,.0f} · balance-months {inst['bal_before'].sum():,.0f} · cost of funds {cof:,.0f}")
```

The loan brings 10 650 293 soum of interest; funding it costs 6 390 176 — on an average balance of 17 750 489 for 24 months.

**Step 3 — cost of risk.** EL = PD × LGD × EAD with Consumer's PD (77 of 2 418 loans in 90+ = 3.18 %), LGD 60 % and EAD = 80.33 % of the principal. The revenue line becomes (1 − PD) × I. **Step 4 — operating cost:** branch acquisition 450 000 plus servicing 25 000 × 24 months. **Step 5 — contribution margin**, per loan and per 1 000 lent:

| Line | Computation | Soum |
|---|---|---|
| interest income | (1 − PD) × I = (1 − 0.0318) × 10 650 293 | 10 311 140 |
| − cost of funds | 18 % a year on the average balance of 17 750 489 for 24 months | −6 390 176 |
| − expected loss | PD × 60 % × EAD; EAD = 31 150 000 × 0.8033 = 25 023 249 | −478 112 |
| − acquisition | branch | −450 000 |
| − servicing | 25 000 × 24 months | −600 000 |
| **= contribution** | | **2 392 852** |
| per 1 000 soum lent | 2 392 852 ÷ 31 150 000 × 1 000 | **76.8** |

**Step 6 — tell it, answer first.** *"Loan 1 earns about 2.4 m soum over two years — 77 soum per 1 000 lent — after funding at 18 %, an expected loss of 0.5 m and 1.05 m of selling and servicing; funding takes 60 % of its interest."* The last clause is the one Finance remembers: on a lender's loan, the largest cost is usually the money itself — which is also what the **sensitivity** says.

---

## 3. Practice (45 min)

The boxes run Python right here, in the page, and share one namespace in page order. ▶ Run the block below **first**: it puts the assumptions in one place and loads one row per loan — interest over the schedule, balance-months (for the cost of funds), today's DPD and the balance still owed at the first unpaid instalment (for EAD). Every box after it builds on `ue` and on the box before it. Averages are over **all 7 828 loans** of each product. Prefer Jupyter? `data/python/week8/day2_starter.ipynb` is the same work with a `unit_economics()` function to write.

```python
import sqlite3
import pandas as pd
con = sqlite3.connect("data/raw/nur.db")
# funding rate per year · loss given default (ours)
COF, LGD = 0.18, 0.60
# acquisition cost per loan, soum (ours)
ACQ  = {"app": 60_000, "branch": 450_000, "partner": 100_000}
# servicing cost per month of the schedule (ours)
SERV = {"app": 8_000, "branch": 25_000, "partner": 8_000}
ue = pd.read_sql("""
WITH pay AS (                                -- v_payments_clean: exact duplicate payments dropped
  SELECT installment_id, paid_at, amount FROM (
    SELECT installment_id, paid_at, amount,
           ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn
    FROM payments) WHERE rn = 1),
sched AS (                                   -- each instalment with the balance owed before it
  SELECT i.loan_id, i.installment_no, i.installment_id, i.due_date, i.total_due, i.interest_due,
         l.principal - COALESCE(SUM(i.principal_due) OVER (PARTITION BY i.loan_id ORDER BY i.installment_no
                       ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 0) AS bal_before
  FROM installments i JOIN loans l ON l.loan_id = i.loan_id),
unpaid AS (                                  -- instalments due by the as-of date and not paid in full
  SELECT s.installment_id, s.loan_id, s.installment_no, s.due_date
  FROM sched s LEFT JOIN pay p ON p.installment_id = s.installment_id AND p.paid_at <= '2026-10-01'
  WHERE s.due_date <= '2026-10-01'
  GROUP BY s.installment_id, s.loan_id, s.installment_no, s.due_date, s.total_due
  HAVING COALESCE(SUM(p.amount), 0) < s.total_due),
first_unpaid AS (SELECT loan_id, MIN(installment_no) AS k, MIN(due_date) AS due FROM unpaid GROUP BY loan_id)
SELECT l.loan_id, pr.code AS product, pr.channel, l.risk_grade, l.principal, l.term_months AS term, l.disbursed_at,
       SUM(s.interest_due) AS interest, SUM(s.bal_before) AS bal_months,
       COALESCE(CAST(julianday('2026-10-01') - julianday(f.due) AS INTEGER), 0) AS dpd,
       MAX(CASE WHEN s.installment_no = f.k THEN s.bal_before END) AS ead,
       MAX(s.due_date) AS last_due
FROM loans l JOIN products pr ON pr.product_id = l.product_id
JOIN sched s ON s.loan_id = l.loan_id
LEFT JOIN first_unpaid f ON f.loan_id = l.loan_id
GROUP BY l.loan_id, pr.code, pr.channel, l.risk_grade, l.principal, l.term_months, l.disbursed_at, f.due
""", con)
print(len(ue), "loans")  # 7828
ue.head()
```

**P1.** *(revenue per loan · cost of funds)* Per product: loans, average principal and term, interest over the schedule, cost of funds — and the cost of funds as a **share of the interest**. Which product's interest does funding eat most of? Finish the code and print that share in %.

**P2.** *(cost of risk)* Expected loss per loan: PD = the product's share of loans now 90+, the EAD ratio measured on each product's 90+ loans, EL = PD × 60 % × EAD ratio × average principal. Print AUTO's EL per loan in whole soum.

**P3.** *(operating cost per loan)* Acquisition plus servicing per loan, by product, and the same **per 1 000 soum lent**. Use `ACQ`, `SERV`, each product's channel and its average term. Print the per-1 000 figure for every product.

**P4.** *(contribution margin)* The full table: income, minus cost of funds, expected loss, acquisition and servicing = **net contribution per loan**, and **per 1 000 soum lent**. Print the net per 1 000 for every product.

**P4 — read it.** Which product makes the most money **per loan**, and which **per soum lent**?

**P5.** *(break-even)* BNPL charges the customer 0 %. Partners (shops) usually pay the lender a **merchant fee** for each sale financed; it is not in our data. What fee, as a percentage of principal, makes an average BNPL loan break even, to 1 decimal? (From P4: net −449 053 on an average principal of 4 170 880.)

**P6.** *(break-even · sensitivity)* Micro's sensitivity. Net per loan at PD 0, 1, 5, 8 %; then the **break-even PD** for a **first** Micro loan (acquisition 60 000) and for a **repeat** loan (acquisition 20 000: the bureau check and an SMS) with section 1's formula. Print the first-loan break-even PD in %.

**P6 — read it.** Risk watches FPD30 weekly, not PD. Today's Micro FPD30 is 41 of 2 411 = 1.70 %, and Micro's PD ÷ FPD = 2.85 ÷ 1.70 = 1.67. At what **FPD30** does a new Micro customer stop paying for itself? (%, one decimal)

**P7.** *(sensitivity — the funding rate)* The funding rate is our guess. Net per 1 000 soum lent at 14 %, 18 % and 22 %. Which product is most exposed to the cost of money? Print AUTO's per 1 000 at 22 %.

**P8.** *(sensitivity — the PD)* The crude PD mixes young and old loans. Recompute PD on **matured** loans only (the last instalment due on or before 2026-10-01) and rerun net per 1 000. Keep AUTO's crude PD — 0 of 23 matured loans is too few to use. Print SME's new per 1 000.

**P9.** *(CAC and payback)* For each product: contribution **before** acquisition per month of the term, and the payback of the acquisition cost in months. Which product never pays back? Print every payback.

**P10.** *(LTV and LTV/CAC)* LTV/CAC for an app customer. Take customers whose **first** loan was Micro and was disbursed before October 2024 (so 24 months are observable) and their loans within 24 months, by product. LTV = Σ contribution **before acquisition** of those loans, minus 20 000 per repeat loan, ÷ customers; CAC = 60 000. Print the Micro-only LTV/CAC.

**P11.** *(the one-page P&L)* The 2026 P&L of the whole book: for each product, the loans disbursed in 2026 (to the as-of date, 1 October — the starter's filter) × each per-loan line of `p3` (income, cost of funds, expected loss, acquisition, servicing, contribution), in billions of soum, plus a total row. Print the total contribution in bn soum, two decimals.

**P12.** *(telling it)* Storytelling. Rewrite these three titles as so-what titles, using your numbers: (a) "Unit economics by product", (b) "Micro sensitivity", (c) "App customers over 24 months".

> 🚀 **Stretch (optional, +5 XP).** **P13.** *(contribution by risk grade)* Unit economics by **risk grade** inside Consumer loans: PD and EAD ratio per grade, everything else as CONS (branch: acquisition 450 000, servicing 25 000 a month). Which grade does not pay? Print its net per 1 000, then write the one-line pricing recommendation in a comment.

### Mistakes people make

- Profit per loan with no funding cost (a lender's biggest cost), or funding on the original principal instead of the falling balance.
- An expected loss with EAD = principal for every product (overstates the short ones) or with the crude PD for long products without a caveat (understates them).
- Assumptions in your head instead of under the table.
- Ranking products per loan when the question is where the next billion goes (per soum), or the other way round.
- "BNPL loses money" without the merchant fee question.
- LTV averaged over a few huge cross-sold loans and presented as the typical customer.
- A deck whose titles are topics ("Funnel", "Retention") — the reader has to find the message.

---

## 4. The company day — a lending company end to end (60 min)

Read it as a tour with Madina. Every desk below is a person you will meet in an interview loop.

### The departments and what they ask the analyst

| Department | Its job | What it asks the analyst | What its dashboard shows |
|---|---|---|---|
| **Board / CEO** | strategy, capital, the annual plan | "Where do we grow, where do we stop?" (the capstone) | the one-page KPI pack: portfolio, growth, PAR30, NPL, cost of risk, net income vs plan |
| **Finance / FP&A** | budget, P&L, pricing with product | "Interest income and cost of risk by product; unit economics" | P&L by product, yield, net interest margin, budget vs actual |
| **Treasury** | funding: borrowing from banks and investors | "Expected repayments by month for the next 12 months" | cash-flow ladder, cost of funds, liquidity |
| **Risk** (Nilufar) | scorecards, approval policy, provisions | "FPD by vintage and channel; did the cut-off change help?" | approval rate, FPD/SPD by vintage, vintage curves, roll rates, PD by grade, provisions |
| **Collections** (Sevara) | getting late money back | "Contact and cure rate per collector; which actions work?" | buckets, roll rates, cure, promises kept, collector league, recoveries |
| **Portfolio management** (Bekzod) | size, mix and quality of the book | "Outstanding by product and branch; where did PAR30 move?" | outstanding, disbursements, mix, PAR30 by branch |
| **Product / digital** (Kamola) | the app and its offers | "Where do we lose people? Do they come back?" | funnel, conversion by step, repeat borrowing, experiments |
| **Sales / branch network** | branches and officers | "My officers' approvals and FPD this quarter" | applications and disbursements per officer, FPD per officer |
| **Marketing** | campaigns, partners | "Cost per application by channel; which campaign brought good borrowers?" | spend, CAC, applications and FPD by source |
| **Compliance, AML and internal audit** | rules, money laundering, checks | "All loans above X to related parties"; "prove this report's numbers" | exceptions lists, audit trails |
| **Data / BI team** (Timur, Jasur) | warehouse, pipelines, dashboards | "Specify the grain and refresh of what you need" | data freshness, failed loads |

### A week in the life

**Portfolio analyst.** *Monday:* refresh the weekly pack (outstanding, disbursements, PAR30 by product and branch), check it reconciles with Finance's balance. *Tuesday:* Bekzod asks why one region grew twice as fast as the others — split growth into new customers vs bigger tickets. *Wednesday:* month-end close prep, the board KPI page. *Thursday:* an ad-hoc for treasury — expected principal repayments for six months. *Friday:* document the week's definitions; fix a branch mapping someone changed.
**Risk analyst.** *Monday:* FPD and SPD for the newest vintages, by channel and grade. *Tuesday:* roll rates month-end; the 1–30 entries. *Wednesday:* a policy simulation — "if the cut-off rose by 20 points, how many approvals and how much FPD would we lose?" *Thursday:* the scorecard monitoring report (does it still rank risk?). *Friday:* the risk-committee note (week 6), half a page, with a yes or a no.
**BI specialist.** *Monday:* a refresh failed overnight — find the source table that changed. *Tuesday:* a new DAX measure for collection rate that works at any date. *Wednesday:* row-level security so each branch manager sees only their branch. *Thursday:* performance — the risk page takes 20 s. *Friday:* release notes, and a training session for a new user.
**Product analyst.** *Monday:* the weekly funnel and experiment monitor (SRM check first). *Tuesday:* design the next A/B test with Kamola — metric, guardrail, sample size. *Wednesday:* a cohort question — do customers who came through a campaign come back? *Thursday:* event-tracking spec for a new screen with the engineers. *Friday:* the experiment readout, one slide.
**Collections analyst.** *Monday:* the early-bucket list — who to call first today (score × amount). *Tuesday:* collector performance with the caseload difficulty adjusted. *Wednesday:* strategy test — SMS on day 1 vs a call on day 3. *Thursday:* restructuring offers: who accepted, who cured. *Friday:* recoveries on written-off loans for Finance.

> 💡 **Key idea.** Every analyst desk has the same three jobs: a **recurring** pack that must be right every time, **ad-hoc** questions that must be fast, and **documentation** nobody asks for until something breaks. In an interview, have one story for each.

### Regulators and reporting, in plain words

- **The central bank** (in Uzbekistan the Central Bank of the Republic of Uzbekistan supervises banks and also non-bank lenders such as microfinance organisations) receives regular **prudential reports**: loan portfolio by quality class, overdue and non-performing loans, provisions, capital adequacy, large exposures, interest rates. The numbers must match the accounting ledger to the soum, by a fixed deadline; the analyst's job is usually the reconciliation and the explanations ("why did NPL rise in Termez?").
- **The credit bureau** receives every loan and every payment status; a lender also *reads* it at application (the "bureau check" in the acquisition cost). Wrong data sent to the bureau harms a real person's credit history — this is why loan-status definitions are not a matter of taste.
- **IFRS 9** (*МСФО 9*), the accounting standard for loan losses, in three sentences: every loan carries a **provision** (*резерв*) for the loss we *expect*, not only the loss that already happened. Healthy loans (**Stage 1**) carry 12 months of expected loss; loans whose risk has grown significantly — usually 30+ DPD or a big score drop — (**Stage 2**) carry **lifetime** expected loss; defaulted loans, usually 90+ DPD (**Stage 3**), carry lifetime loss on a defaulted exposure. Expected loss = PD × LGD × EAD (week 6), with PDs adjusted for the economic outlook. **Cost of risk** in the P&L is mostly the *change* in these provisions plus write-offs net of recoveries — which is why a rise in 1–30 DPD costs money this month, before anyone has lost anything.
- **Local rules vs IFRS.** The central bank's own classification and provisioning rules can differ from IFRS 9; many lenders run both and explain the difference. In an interview, "which definition does the regulator use, and which does the board pack use?" is a very good question.

### How to read a company you interview at

1. **The annual report / financial statements** (banks publish them; look for "IFRS financial statements"): size of the loan book and its growth, net interest margin, cost of risk, NPL ratio, Stage 2 and 3 shares, provisions coverage. Three numbers you can quote in the interview: *portfolio growth, cost of risk, NPL*.
2. **The products page:** what they lend (cards, micro, auto, mortgage, SME), through which channel (app, branch, partners) — this tells you which metrics they live by (an app lender: funnel, FPD, repeat borrowing; an SME lender: vintage, collateral, concentration).
3. **The job description:** translate every line into a metric and a table. "Monitor portfolio quality" → PAR30, roll rates, vintages. "Support product decisions" → funnel, A/B, unit economics. "Build reporting" → Power BI, definitions, refresh. Prepare one story from this course for each line.
4. **Their app** (if they have one): install it, go through the offer screens, note the steps — you have just mapped their funnel.

### Your CV for an analyst role

From the RU soft-skills deck (`Soft Skills Как прокачать резюме.pptx`, slides 4–8): four principles — **brief, specific, true, selective** (*краткость, конкретность, правдивость, избирательность*); the structure — **personal details** (name, city, phone, e-mail, LinkedIn/GitHub), **experience** (jobs, internships, *projects*), **education**, **professional skills and achievements**, **additional** (languages); the mistakes — no focus, overloaded, several roles in one CV, spelling and grammar, informal language, outdated data, broken formatting; and the checks — clean structure, a professional font, contacts visible at the top, nothing superfluous, **adapted to each vacancy**, proofread. Slide 6 shows a real junior-analyst CV from a job site: a list of courses and tools with no results — exactly what yours must not look like.

What turns a list into a CV is **achievements with numbers**: the action, the tool, the result, the size.

| Weak | Strong |
|---|---|
| "Know SQL, Python, Power BI" | "Built a 3-page Power BI portfolio dashboard (star schema, 6 DAX measures) on a 7 800-loan lending dataset" |
| "Did an A/B test" | "Analysed a 28 000-user A/B test: found an assignment leak and a client bug, cut the reported lift from +13 % to +11 % and recommended a staged rollout with an FPD guardrail" |
| "Data cleaning" | "Found and removed 25 duplicate payments (58 m soum double-counted) and published a de-duplicated SQL view for reporting" |

**C1.** Your turn, before the homework: rewrite *"Did product analytics"* as one CV line about **today's or yesterday's** work — action, tool, result, size.

**Your portfolio is this course.** It runs on a synthetic dataset of a fictional company — say so on the index page and in the interview; what you show is the method, and the method is real. Candidates, best first:

| Deliverable | Week | Shows |
|---|---|---|
| Capstone: notebook + dashboard + deck (from Friday) | 8 | end-to-end analysis, storytelling |
| A/B notebook + decision memo (checkpoint 7, Part A) | 7 | statistics, experiment hygiene, decisions |
| 3-page Power BI dashboard (checkpoint 7, Part B) | 7 | BI, data modelling, DAX |
| EDA report on the loan book in SQL (checkpoint 3) + `views.sql` (HW 3.2) | 3 | SQL depth: windows, CTEs, vintages, views |
| Week-3 EDA redone in pandas (checkpoint 5) | 5 | Python, charts |
| Cleaned dataset + pivot one-pager (checkpoint 4) | 4 | Excel, Power Query |
| Risk-committee note (week 6) | 6 | writing for a manager |

---

## 5. Homework <span class="badge hw">HW 8.1 — Due Day 3</span>

**HW 8.1 — CV draft + portfolio index.** Hand in with the 📎 box below:

1. `cv.pdf` (and the source, `.docx` or `.md`) — one page (two at most), for **one** target role (say which in the file name: `cv_risk_analyst.pdf`). Contacts at the top; a two-line profile; **projects** from this course with at least **three achievements with numbers**; skills grouped (SQL, Python, Excel, Power BI, statistics); education; languages.
2. `portfolio.md` — one page: a line saying the data are synthetic (fictional lender, 2024–2026); then your **4 best deliverables**, each with the link to the file in your repository (or its file name, if you hand in only through the 📎 boxes), one sentence on the question it answers, one on the method, one result.
3. `job_ad.md` — one real job advert you would apply to (copy the text or link), and next to each requirement the course deliverable or story that answers it.

### 📎 Hand in here

---

## 6. Self-check

---

## 7. Company corner <span class="badge company">Ten questions on lending metrics</span>

The whole Company & metrics track, as a self-test. Say each answer out loud in two or three sentences **before** you flip the card — the [interview bank](company/interview.md) has thirty more.

> 🎯 **Interview version.** *"What is the difference between FPD and PAR30, and which would you watch after a policy change?"* — FPD30 is a property of a cohort of new loans: the share whose first instalment was not paid within 30 days, known about two months after disbursement. PAR30 is the state of the whole book today: outstanding of loans more than 30 days late over all outstanding. After a policy change I watch FPD of the new vintages, because PAR30 moves months later and is diluted by the old book — at Nur, FPD30 is 1.28 % and PAR30 3.12 %.

**Say it like in an interview.** *"A loan earns 30 % a year. Is it profitable?"* Answer in four or five sentences, with Day 2's numbers.

Tomorrow: the capstone. Madina's brief for the board — three days, four deliverables, your recommendations.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

---

## Going further — IFRS 9 provisions (optional, 40 min)

> STORY **Tuesday, 17:30.** Nilufar from Risk puts last month's risk pack on your desk: one table, three rows — *Stage 1, Stage 2, Stage 3*. *"Finance closes September on Monday and needs our IFRS 9 numbers: the provision by stage, the coverage and the cost of risk. Last month the board asked why the provision jumped when only a few dozen loans were a couple of days later. Rebuild the table from the loan data, so that next time we answer with numbers."*

### Why provisions exist — the balance sheet and the monthly charge

**What it is.** A **provision** (*резерв*; IFRS 9 calls it the *loss allowance*) is the part of the loans Nur does not expect to get back, set aside today for losses that will show later. It lives in two places. On the **balance sheet** it is a stock on one date: gross loans minus the provision = **net loans**. In the **P&L** its movement over a month is a cost, the **provision charge** — the *cost of risk* of section 4 ("Regulators and reporting").

**How to write it.**

```text
balance sheet, 1 October 2026
  gross loans     207.00 bn
− provision         5.75 bn
= net loans       201.26 bn

P&L, September 2026
  charge = closing provision
         − opening provision
         + written off
         − recovered
         = 5.75 − 5.60
           + 0.48 − 0.03
         = 0.60 bn
```

On 1 October the 3 396 loans on Nur's balance sheet owe 207.00 bn, 5.75 bn of it is provided for, and September cost 0.60 bn: the provision grew from 5.60 to 5.75 bn, 0.48 bn of loans more than 180 days late were written off, and 0.03 bn came back on older write-offs. The next three subsections build every one of these numbers from the loan table.

**When you use it.**
- Every month-end: Finance books the charge, Risk explains it.
- Reading a lender's accounts: "loans to customers" is shown net of the provision; the "impairment" line of the P&L is the charge.

> ⚠️ **Watch out.** A provision is not cash. Nothing is paid when it is booked: it lowers the value of the loans and the month's profit. Cash moves only when borrowers pay — or do not.

**Your turn.** Suppose October closes with a provision of 6.10 bn, after 0.40 bn was written off and 0.05 bn recovered on old write-offs. October opens with September's closing 5.75 bn. What is October's charge, in bn?

### The three stages — staging the book by days past due

**What it is.** On every reporting date IFRS 9 puts each loan on the balance sheet into one of three **stages** (*стадии*):
- **Stage 1 — performing.** Its credit risk has not grown much since the loan was made. It carries **12 months** of expected loss.
- **Stage 2 — significant increase in credit risk** (*SICR*). Its risk has grown a lot. **More than 30 days past due** always counts: it is the standard's **backstop**. It carries **lifetime** expected loss.
- **Stage 3 — credit-impaired.** The loan is in default: as in week 6, **more than 90 days past due**. It carries lifetime loss with a PD of 100 %.

Our data has no other warning sign, so here the stage comes from DPD alone. That is a teaching simplification: a real lender also moves a loan to stage 2 on a big score drop, a restructuring or a watch list, before it is 30 days late.

**How to write it.** The stage is a CASE on the course's DPD (W3D4), with the course's buckets:

```text
DPD on the date   bucket   stage
0                 0        1
1–30              1-30     1
31–90             31-60,   2
                  61-90
91–180            90+      3
over 180          written off:
                  off the balance
                  sheet (glossary)
```

The box builds `my_book` in your practice copy: every loan on four dates (1 October 2025, 1 August, 1 September and 1 October 2026) with its DPD, its **balance** — the principal not yet repaid: week 3's `outstanding` plus the principal of the overdue instalments — its stage, and whether it is on the balance sheet that day. Then it stages the September pack. The boxes below read `my_book`, so run this one first.

```sql
-- my_book: every loan on four month-start dates
DROP TABLE IF EXISTS my_book;
CREATE TABLE my_book AS
WITH rd(d) AS (VALUES ('2025-10-01'), ('2026-08-01'),
                      ('2026-09-01'), ('2026-10-01')),
-- payments without the duplicates (W3D4's v_payments_clean)
pay AS (
  SELECT installment_id, paid_at, amount,
         ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount
                            ORDER BY payment_id) AS rn
  FROM payments),
-- on each date: instalments due and not fully paid by then
unpaid AS (
  SELECT rd.d, i.loan_id, i.due_date, i.principal_due
  FROM installments i
  JOIN rd ON i.due_date <= rd.d
  LEFT JOIN pay p ON p.installment_id = i.installment_id
                 AND p.rn = 1 AND p.paid_at <= rd.d
  GROUP BY rd.d, i.installment_id, i.loan_id, i.due_date,
           i.principal_due, i.total_due
  HAVING COALESCE(SUM(p.amount), 0) < i.total_due),
-- DPD: days since the oldest of them (the course's rule)
late AS (
  SELECT d, loan_id,
         CAST(julianday(d) - julianday(MIN(due_date)) AS INTEGER) AS dpd,
         SUM(principal_due) AS overdue_principal
  FROM unpaid GROUP BY d, loan_id),
-- week 3's outstanding: principal due after the date
ahead AS (
  SELECT rd.d, i.loan_id, SUM(i.principal_due) AS outstanding
  FROM installments i JOIN rd ON i.due_date > rd.d
  GROUP BY rd.d, i.loan_id),
snap AS (
  SELECT rd.d, l.loan_id, p.code AS product, l.status,
         l.disbursed_at, l.closed_at,
         COALESCE(t.dpd, 0) AS dpd,
         -- balance: principal still owed, overdue or not
         COALESCE(a.outstanding, 0)
           + COALESCE(t.overdue_principal, 0) AS balance
  FROM loans l
  CROSS JOIN rd
  JOIN products p ON p.product_id = l.product_id
  LEFT JOIN late t  ON t.loan_id = l.loan_id AND t.d = rd.d
  LEFT JOIN ahead a ON a.loan_id = l.loan_id AND a.d = rd.d)
SELECT d, loan_id, product, dpd, balance,
       CASE WHEN dpd <= 30 THEN 1
            WHEN dpd <= 90 THEN 2 ELSE 3 END AS stage,
       -- on the balance sheet: lent, not closed, still owing,
       -- not yet written off (more than 180 days late)
       (disbursed_at <= d AND (status <> 'closed' OR closed_at > d)
        AND balance > 0 AND dpd <= 180) AS on_book
FROM snap;

-- the September pack: the book on 1 October, by stage
SELECT stage, COUNT(*) AS loans,
       ROUND(SUM(balance) / 1e9, 2) AS balance_bn
FROM my_book
WHERE d = '2026-10-01' AND on_book
GROUP BY stage;
```

3 396 loans owe 207.00 bn on 1 October: 3 312 in stage 1 (202.61 bn, 97.9 % of the money), 40 in stage 2 (1.32 bn, 0.6 %) and 44 in stage 3 (3.07 bn, 1.5 %) — the 3 352 active loans and the 44 in default, while all 190 written-off loans are more than 180 days late and off the balance sheet.

**When you use it.**
- The first table of every IFRS 9 pack: loans and balance by stage, this month against last.
- An early warning: stage 2 fills up before stage 3 does.

> ⚠️ **Watch out.** 207.00 bn is not week 3's 208.72 bn "outstanding", and both are right for their question. 208.72 bn is the principal still **scheduled** on every loan, written-off ones included; the balance sheet leaves out the 3.09 bn scheduled on written-off loans and adds the 1.37 bn of principal already **overdue**: 208.72 − 3.09 + 1.37 = 207.00. Say which one a table uses.

**Your turn.** On the reporting date a loan is exactly 30 days past due. Which stage is it in?

### Twelve months or a lifetime — the cliff at 30 days

**Before you read.** Guess first, then play with it — the explanation below will make more sense.

**What it is.** The provision of a loan is its **expected credit loss** (*ожидаемые кредитные убытки*, ECL): week 6's PD × LGD × EAD, where the stage sets how far ahead the PD looks.
- **12-month ECL** (stage 1): PD = the chance of a default within the next 12 months.
- **Lifetime ECL** (stage 2): PD = the chance of a default at any time until the loan ends.
- Stage 3: the default has happened, so PD = 100 % and ECL = LGD × balance.

The **cliff** (*эффект обрыва*) is the jump in a loan's provision when it crosses 30 days: its PD switches to a lifetime, and it joins a much riskier group of loans.

**How to write it.**

```text
ECL = PD × LGD × EAD
EAD = the balance
LGD = 60 % (our assumption)
PD  = stage 1: 12 months
      stage 2: lifetime
      stage 3: 100 %
```

A 12-month PD is measured the way it is defined: take the loans as they stood a year ago and count those in default a year later. The box reads `my_book`.

```sql
-- a year ago (o) and today (n), loan by loan
SELECT o.stage AS stage_then,
       COUNT(*)                 AS loans,
       SUM(n.dpd > 90)          AS in_90_plus_now,
       ROUND(100.0 * SUM(n.dpd > 90) / COUNT(*), 2) AS pd_pct
FROM my_book o
JOIN my_book n ON n.loan_id = o.loan_id AND n.d = '2026-10-01'
WHERE o.d = '2025-10-01' AND o.on_book AND o.stage < 3
GROUP BY o.stage;
```

Of the 2 154 loans in stage 1 on 1 October 2025, 57 were more than 90 days late a year later — a 12-month PD of **2.65 %**; of the 21 loans in stage 2, 18 were — **85.7 %**.

With LGD 60 %, stage 1 provides 2.65 % × 60 % = 1.59 % of its balance, stage 2 85.7 % × 60 % = 51.4 % and stage 3 60 %: 3.22 + 0.68 + 1.84 = 5.75 bn on 1 October. Stages 1 and 2 together hold 3.90 bn, close to week 6's crude expected loss of 3.60 bn on the performing loans; stage 3 adds the loans already in default.

This is a teaching model, and it says so: one PD per stage, from one cohort (the four quarterly cohorts before it give 2.3–2.9 % for stage 1 and, on only 7–25 loans each, 76–93 % for stage 2). Stage 2's lifetime PD is measured over 12 months: a loan already a month late almost always settles within the year (week 3's roll rates: 70 % of 31–60 rolled on in one month, all of 61–90). A real IFRS 9 model gives each loan its own PD from its score and history, discounts the losses and adjusts the PDs to the economic outlook.

**When you use it.**
- "Why did the provision jump when only a few loans got later?" — the cliff: at Nur a loan crossing 30 days goes from 1.59 % to 51.4 % provided, ×32.
- "How much of that is the longer horizon?" If a loan's risk stayed at 2.65 % a year, its lifetime PD over T months would be 1 − (1 − 0.0265)^(T/12). The average soum in stage 1 has 22 months to run: 4.8 %, only ×1.8. The rest of the ×32 is risk: late loans at Nur do default.

| | 12-month ECL | lifetime ECL |
|---|---|---|
| Stage | 1 | 2 (3 with PD 100 %) |
| Defaults it counts | in the next 12 months | until the loan ends |
| Nur, 1 October | 1.59 % of 202.61 bn | 51.4 % of 1.32 bn |

> ⚠️ **Watch out.** For a loan with less than 12 months to run, 12 months already is its lifetime. Nur's stage-1 Micro loans have 3 months left on average and BNPL 5: for them the switch to lifetime adds nothing, and the whole cliff is risk.

**Your turn.** A stage-1 Auto loan has 30 months to run. If its risk stayed at 2.65 % a year, what would its lifetime PD be (in %, two decimals)?

### Coverage and cost of risk — reading the monthly risk pack

**What it is.** Two ratios turn the provision into numbers that compare months and lenders.
- **Coverage ratio** (*коэффициент покрытия*) = provision ÷ gross loans, for the book and for each stage: how much of every soum owed is provided for.
- **Cost of risk** = the period's provision charge ÷ the period's average gross loans, **annualised**: what the month's credit losses cost per soum lent, as a yearly rate.

**How to write it.**

```text
coverage = provision ÷ balance

cost of risk, one month
  = charge × 12
    ÷ average balance
average balance
  = (opening + closing) ÷ 2
```

The box prices both ends of September with the PDs and LGD above, finds the loans written off in the month (on the balance sheet on 1 September, more than 180 days late on 1 October) and the money recovered on older write-offs.

```sql
-- the month: its opening and closing dates
WITH m(d0, d1) AS (VALUES ('2026-09-01', '2026-10-01')),
-- the provision on each loan: PD of its stage x LGD 60 % x balance
prov AS (
  SELECT d, balance,
         balance * 0.60 * CASE stage WHEN 1 THEN 0.0265
                                     WHEN 2 THEN 0.857 ELSE 1.0 END AS ecl
  FROM my_book WHERE on_book),
o AS (SELECT SUM(balance) AS gross, SUM(ecl) AS p
      FROM prov CROSS JOIN m WHERE prov.d = m.d0),
c AS (SELECT SUM(balance) AS gross, SUM(ecl) AS p
      FROM prov CROSS JOIN m WHERE prov.d = m.d1),
-- written off: on the opening book, past 180 days at the close
w AS (SELECT COALESCE(SUM(a.balance), 0) AS amt
      FROM my_book a
      JOIN my_book z ON z.loan_id = a.loan_id
      CROSS JOIN m
      WHERE a.d = m.d0 AND a.on_book AND z.d = m.d1 AND z.dpd > 180),
-- recovered: paid in the month on loans written off before it
-- (none of the 25 duplicate payments falls here)
r AS (SELECT COALESCE(SUM(p.amount), 0) AS amt
      FROM payments p
      JOIN my_book a ON a.loan_id = p.loan_id
      CROSS JOIN m
      WHERE a.d = m.d0 AND a.dpd > 180
        AND p.paid_at > m.d0 AND p.paid_at <= m.d1)
SELECT ROUND(o.p / 1e9, 2)    AS opening_bn,
       ROUND(c.p / 1e9, 2)    AS closing_bn,
       ROUND(w.amt / 1e9, 2)  AS written_off_bn,
       ROUND(r.amt / 1e9, 3)  AS recovered_bn,
       ROUND((c.p - o.p + w.amt - r.amt) / 1e9, 2) AS charge_bn,
       -- x 12 for a year, over the average book
       ROUND(100 * 12 * (c.p - o.p + w.amt - r.amt)
             / ((o.gross + c.gross) / 2), 2) AS cor_pct
FROM o, c, w, r;
```

September: the provision went from 5.60 to 5.75 bn, 0.48 bn was written off and 0.028 bn recovered — a charge of 0.60 bn, a cost of risk of **3.50 %** a year on an average book of 205.14 bn.

The pack's stage table on 1 October, with the coverage:

| Stage | Balance | Provision | Coverage |
|---|---|---|---|
| 1 | 202.61 bn | 3.22 bn | 1.59 % |
| 2 | 1.32 bn | 0.68 bn | 51.4 % |
| 3 | 3.07 bn | 1.84 bn | 60.0 % |
| **Book** | **207.00 bn** | **5.75 bn** | **2.78 %** |

Stage 1 is 97.9 % of the money and holds 56 % of the provision; stage 3 is 1.5 % of the money and holds 32 %.

**When you use it.**
- Coverage per stage: is each stage provided for in line with its risk? A stage-3 coverage far below the loss that collections actually see is an auditor's first question.
- Cost of risk against the margin: at 3.50 % a year, September's credit losses take almost half of the 7.5-point spread between Nur's yield and its funding (week 8, Day 1).

> ⚠️ **Watch out.** A falling provision is not a cheap month. A big write-off takes its provision with it, so the stock can fall in a month that cost a lot. Read the charge, never the change in the stock alone.

**Your turn.** Move the box to August: write `('2026-08-01', '2026-09-01')` in its first line and run it. What was August's cost of risk (in %, two decimals)?

### Try it on the real data

**X1.** *(the stages, a month earlier)* Stage the book on 1 September 2026: change the date in the last SELECT of the `my_book` box. How many loans were in stage 3?

**X2.** *(coverage by product)* On 1 October, group `my_book` by `product` and divide each product's provision — `SUM(balance * 0.60 * CASE stage WHEN 1 THEN 0.0265 WHEN 2 THEN 0.857 ELSE 1.0 END)` — by its balance. Which product has the highest coverage?

### In one minute

- A **provision** is the loss Nur expects on the loans it still holds: on the balance sheet a stock (207.00 bn gross − 5.75 bn = 201.26 bn net); in the P&L its change plus write-offs, less recoveries — 0.60 bn in September.
- **Stages** by DPD: 0–30 stage 1 (12-month ECL), 31–90 stage 2 (lifetime ECL, the 30-day backstop), 91–180 stage 3 (default, PD 100 %); past 180 days a loan is written off.
- **The cliff:** a loan crossing 30 days goes from 1.59 % to 51.4 % provided (×32) — only ×1.8 from the longer horizon, the rest because late loans at Nur do default (85.7 % within a year).
- **The pack:** coverage per stage and in total (2.78 %), and cost of risk = charge × 12 ÷ average book — 3.50 % a year in September, 4.26 % in August while the provision fell.


=====
PAGE: Week 8 · Day 3 — Capstone I: the brief and the analysis (weeks/week-08/day-3.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-08/day-3
=====

# Week 8 · Day 3 — Capstone I: the brief and the analysis

<span class="badge">The brief 30 min</span> <span class="badge">Framing 40 min</span> <span class="badge">Data checks 40 min</span> <span class="badge">First analyses 70 min</span> <span class="badge hw">HW 8.1 due today · Capstone (due Day 5)</span>

> STORY **Wednesday, 9:00.** Madina closes the door. *"The board meets on Friday at eleven. The chairman asked for one thing: **'The 2026 portfolio review: where do we grow, where do we stop, and what would you change?'** Every head of department will be in the room and every one of them has a favourite answer. Bekzod wants more SME, Kamola more app, Nilufar fewer partners, Sevara more collectors. You are the only person in the building who has looked at all of it with the same definitions. Ten minutes, ten slides, a dashboard they can click, and a notebook Jasur can re-run. Today you decide what to look at and you make sure the numbers are right. Do not draw a single chart before lunch."*

## Today in 3 lines

- You read the **brief**, the five required questions, the deliverables, the rubric and the three-day plan, and you pick **one deep-dive** of your own.
- You **frame** the problem as an **issue tree** — the board's question split into sub-questions you can answer with a table each — with a hypothesis per branch and the definition of every metric you will show.
- You **check the data** against the known problems and the **sanity numbers** below (reproduce them before anything else), then run the first analyses: growth, risk and collections — and end the day with the checkpoint list ticked.

---

## 1. Learn — how a capstone analysis is done

A capstone is one large request handled from start to finish. The six subsections below are the six moves of the first day, in the order you make them. Sections 2–8 then apply them to the board's brief.

### Reading a brief — the question behind the question

**What it is.** A **brief** (*бриф*, *техническое задание*) is the request in writing: the question, the **as-of date**, the audience, the deliverables and the deadline. Behind every brief sits a **decision** someone must make; that decision — **the question behind the question** — tells you what to look at and what to leave out.

**How to write it.** Rewrite the request into six lines before you open the data:

| Line | What it holds | Example |
|---|---|---|
| Decision | what will someone do differently after reading you? | set 2027 lending limits per product |
| Question | the request as one sentence with a question mark | |
| As of | the date your numbers describe | 2026-10-01 |
| Audience | who is in the room, and what each of them owns | |
| Deliverables | what they receive, in which format, by when | |
| Out of scope | what you will not answer this time | |

Then check the as-of date against the data itself:

```sql
SELECT (SELECT MAX(applied_at)   FROM applications)        AS last_application,
       (SELECT MAX(disbursed_at) FROM loans)               AS last_loan,
       (SELECT MAX(event_time)   FROM app_events)          AS last_app_event,
       -- later than the as-of date
       (SELECT MAX(paid_at)      FROM payments)            AS last_payment,
       (SELECT MAX(action_date)  FROM collections_actions) AS last_action;
       -- later too
```

Applications, loans and app events end on 1 October 2026 — the as-of date. Payments run to 24 November and collections actions to 4 October: rows dated after the as-of date exist, and every query must cut them off.

**When you use it.**
- At the start of any request bigger than one number.
- When a request is vague ("look at the portfolio"): ask for the decision, not for more detail.

> ⚠️ **Watch out.** Answering the literal question can miss the decision. "How many SME loans did we give?" from a budget owner means "should SME get more money next year?" — and that needs SME's risk and margin, not only its count.

**Your turn.** Bekzod asks: *"How much did SME grow this year?"* He is writing the 2027 budget. What is the question behind the question?

### The issue tree — breaking the question into MECE branches

**What it is.** An **issue tree** (*дерево проблем*) splits the big question into sub-questions, and those into smaller ones, until each leaf can be answered with one table. The branches must be **MECE** — *mutually exclusive, collectively exhaustive*: no overlaps (nothing counted twice) and no gaps (nothing left out).

**How to write it.**

```text
Where do we grow, where do we stop,
what do we change?
├── 1. Where is the money made?
│      → contribution per product
├── 2. Where did we grow, and how?
│      → growth by product / channel /
│        region; count vs ticket
├── 3. Where is the risk?
│      → FPD, vintages, PAR30
├── 4. Where do we lose value?
│      → app funnel leaks,
│        collections coverage
└── 5. What would change the answer?
       → the assumptions, the deep-dive
```

When a branch splits a number, MECE has a test you can run: the parts must add back to the whole.

```sql
SELECT p.channel, COUNT(*) AS loans, SUM(l.principal) AS amount  -- the branches
FROM loans l JOIN products p ON p.product_id = l.product_id
WHERE l.disbursed_at >= '2026-01-01' AND l.disbursed_at < '2026-10-01'
GROUP BY p.channel
UNION ALL
SELECT 'TOTAL', COUNT(*), SUM(principal)                         -- the whole
FROM loans
WHERE disbursed_at >= '2026-01-01' AND disbursed_at < '2026-10-01';
```

Branch 1 403 loans, app 1 036 and partner 591 add up to the 3 030 loans of the total; 156 258 020 000 + 2 791 240 000 + 2 431 040 000 = 161 480 300 000 soum. Every loan has exactly one channel, so the split is MECE.

**When you use it.**
- To decide what you will **not** analyse: a cut that answers no branch is cut.
- To split the work into pieces of one table each, with a time box per branch.

> ⚠️ **Watch out.** "Best region" next to "growth" and "risk" is an overlap: it re-cuts the same tables. Fold it into a sub-question of one branch ("is the risk where the growth is?").

**Your turn.** Which split of "2026 disbursements" is MECE?

### Sanity checks — prove the data before you analyse it

**What it is.** A **sanity check** (*проверка на здравый смысл*) is a quick test that the data and your query are right before you build on them. Two kinds: **health checks** on the tables (row counts, duplicate keys, empty columns, dates after the as-of date) and **control totals** — numbers the company already trusts, which you must reproduce.

**How to write it.** One query, one row, every check a column:

```sql
SELECT (SELECT COUNT(*) FROM loans)                                   AS loans,
       -- equal: no duplicate keys
       (SELECT COUNT(DISTINCT loan_id) FROM loans)                    AS distinct_loan_ids,
       (SELECT COUNT(*) FROM loans WHERE status = 'closed' AND closed_at IS NULL) AS closed_without_date,
       (SELECT COUNT(*) - COUNT(DISTINCT installment_id || '|' || paid_at || '|' || amount)
          FROM payments)                                              AS duplicate_payments,
       (SELECT COUNT(*) FROM payments WHERE paid_at > '2026-10-01')   AS payments_after_as_of,
       (SELECT COUNT(*) FROM applications WHERE credit_score IS NULL) AS applications_without_score;
```

7 828 loans and 7 828 distinct ids: no duplicate keys. 15 closed loans have no closing date, 25 payment rows are exact duplicates, 24 payments are dated after the as-of date and 388 applications have no credit score. Each number is a line in the notebook's data-checks section, with its handling.

**When you use it.**
- First thing after reading the brief — before any chart.
- Whenever your number and someone else's differ: the usual culprits are raw payments instead of clean ones, `BETWEEN` on a date-time column, a different status list, and loans too young for the metric.

| Health check | Control total |
|---|---|
| tests the **tables** | tests **your query** |
| duplicates, NULLs, dates out of range, keys that do not join | outstanding 208 723 504 430 · PAR30 3.12 % · FPD30 1.28 % |

> ⚠️ **Watch out.** A control total that does not match is a bug in **your** query until you can prove otherwise. Find it now, on a number you know, not on Friday in front of the board.

**Your turn.** How many **collections actions** are dated after the as-of date (`action_date > '2026-10-01'`)?

### The analysis plan — which table, which grain, which metric

**What it is.** An **analysis plan** gives each leaf of the tree five things: the **table(s)**, the **grain** (what one row is), the **metric** (its definition card from Day 1), the **cut** (by what) and the **comparison** (against what). The grain is the trap: a join to a "many" table changes what one row is.

**How to write it.**

| Leaf | Table(s) | Grain | Metric | Cut | Comparison |
|---|---|---|---|---|---|
| Q1 growth | `loans`, `products` | one loan | amount and count disbursed | product, channel, region | Jan–Sep 2026 vs Jan–Sep 2025 |
| Q2 risk | `installments`, clean payments | one first instalment | FPD30 (due ≤ 2026-09-01) | channel, grade, quarter | the book |
| Q3 collections | DPD chain, `collections_actions` | one delinquent loan | share contacted in September | DPD bucket | across buckets |

Check the grain before you sum anything:

```sql
-- one row per instalment, not per loan
SELECT COUNT(*)                AS rows_after_join,
       COUNT(DISTINCT l.loan_id) AS loans,
       -- wrong: each principal counted once per instalment
       SUM(l.principal)        AS principal_summed_per_row
FROM loans l
JOIN installments i ON i.loan_id = l.loan_id
WHERE l.disbursed_at >= '2026-01-01' AND l.disbursed_at < '2026-10-01';
```

36 408 rows for 3 030 loans: after the join, one row is an instalment. Summing principal there gives 4.15 trillion soum instead of 161.48 bn — 26 times too much.

**When you use it.**
- Before writing the first query of each leaf: fill the row of the plan.
- When a total looks too big: ask "what is one row now?"

> ⚠️ **Watch out.** A plan without a **comparison** produces facts, not findings. "SME disbursed 94.8 bn" says nothing until it sits next to last year or the book.

**Your turn.** For the leaf "FPD30 by channel", what is one row?

### A finding — number, comparison, so-what

**What it is.** A **finding** is one sentence with three parts: a **number**, a **comparison** that makes the number mean something, and a **so-what** that says why it matters for the decision. A table is not a finding; the sentence under it is.

**How to write it.**

```text
finding = number + comparison
          + so-what
  = "Disbursements grew 45.6 %
     in Jan–Sep 2026"
  + "against Jan–Sep 2025, and the
     count grew 40.3 %"
  + "so the growth is more borrowers,
     not a few large loans"
```

```sql
SELECT SUM(CASE WHEN disbursed_at >= '2025-01-01' AND disbursed_at < '2025-10-01' THEN 1 ELSE 0 END)         AS loans_2025,
       SUM(CASE WHEN disbursed_at >= '2026-01-01' AND disbursed_at < '2026-10-01' THEN 1 ELSE 0 END)         AS loans_2026,
       SUM(CASE WHEN disbursed_at >= '2025-01-01' AND disbursed_at < '2025-10-01' THEN principal ELSE 0 END) AS amount_2025,
       SUM(CASE WHEN disbursed_at >= '2026-01-01' AND disbursed_at < '2026-10-01' THEN principal ELSE 0 END) AS amount_2026
FROM loans;
```

2 159 loans and 110 929 400 000 soum in January–September 2025; 3 030 loans and 161 480 300 000 in 2026. Count +40.3 %, amount +45.6 %: the two grew together, so the growth is broad.

**When you use it.**
- Under every table of the notebook — the sentence is the candidate slide title.
- To test a result: if you cannot write the so-what, the table has no message yet.

> ⚠️ **Watch out.** "Amount grew 46 %" alone can hide a few huge loans. Put count and amount side by side whenever you report growth.

**Your turn.**

### Logging assumptions — the choices you made

**What it is.** An **assumption** is any choice the data did not make for you: a definition, a cost figure, a cut-off date, how a data problem is handled. An **assumption log** (*журнал допущений*) lists each one with what you chose, why, and what changes if it is wrong.

**How to write it.**

| # | Assumption | Why | If it is wrong |
|---|---|---|---|
| A1 | `approved_not_disbursed` counts as approved | the decision was yes | approval falls from 70.55 % to 64.98 % |
| A2 | funding costs 18 % a year | Finance's rough figure | Auto's margin per 1 000 goes from 72.9 to 3.1 at 22 % |
| A3 | rows dated after 2026-10-01 are ignored | the as-of date | totals include future rows |

Show the effect of an assumption with a query, not a guess:

```sql
SELECT ROUND(100.0 * SUM(CASE WHEN status IN ('approved', 'approved_not_disbursed') THEN 1 ELSE 0 END)
             -- with assumption A1
             / SUM(CASE WHEN status <> 'cancelled' THEN 1 ELSE 0 END), 2) AS approval_a1,
       ROUND(100.0 * SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END)
             / SUM(CASE WHEN status <> 'cancelled' THEN 1 ELSE 0 END), 2) AS approval_without_a1
FROM applications;
```

With A1 the approval rate is 70.55 % (8 595 of 12 183 decided); without it, 64.98 %. Five and a half points hang on one line of the log.

**When you use it.**
- Every time you choose: write the line at once, not on Friday.
- In the deck: the log becomes the "assumptions and risks" slide and the appendix.

> ⚠️ **Watch out.** An assumption nobody wrote down becomes a "fact" by Friday. When Nilufar asks why your approval rate differs from hers, the log line is the answer.

**Your turn.** Which assumption-log entry is complete?

### Putting it together

One leaf, the six moves. *Brief:* the decision is where to put next year's lending. *Tree:* branch 2, "where did we grow, and how?". *Sanity:* the totals match sanity 5 (3 030 loans, 161 480 300 000). *Plan:* `loans` + `products`, one row per loan, count and amount, by channel, against 2025:

```sql
SELECT p.channel,
       SUM(CASE WHEN l.disbursed_at >= '2025-01-01' AND l.disbursed_at < '2025-10-01' THEN 1 ELSE 0 END) AS loans_2025,
       SUM(CASE WHEN l.disbursed_at >= '2026-01-01' AND l.disbursed_at < '2026-10-01' THEN 1 ELSE 0 END) AS loans_2026,
       ROUND(100.0 * SUM(CASE WHEN l.disbursed_at >= '2026-01-01' AND l.disbursed_at < '2026-10-01' THEN l.principal ELSE 0 END)
             / SUM(CASE WHEN l.disbursed_at >= '2025-01-01' AND l.disbursed_at < '2025-10-01' THEN l.principal ELSE 0 END) - 100, 1) AS amount_growth_pct
FROM loans l JOIN products p ON p.product_id = l.product_id
GROUP BY p.channel ORDER BY amount_growth_pct DESC;
```

Branch grew 45.9 % in amount (982 → 1 403 loans), the app 45.1 % (725 → 1 036), partners 27.8 % (452 → 591). *Finding:* "Branches and the app grew about 45 % in amount and 43 % in count; partners grew 28 % — BNPL is the slow part of the book." *Assumption:* the channel is the product's channel (`products.channel`), which here equals the application's channel.

**The six moves, in order:**

---

## 2. The brief

> **To:** Analyst, Nur Finance  **From:** Madina (Head of Analytics)  **Date:** Wednesday
> **Subject:** Board, Friday 11:00 — the 2026 portfolio review
>
> The board wants three answers about Nur Finance's 2026 lending, as of **1 October 2026**: **where we should grow**, **where we should stop or slow down**, and **what we should change** (policy, process, product, pricing). Each recommendation must have the number behind it, an owner and what it is worth or what it protects. The room: the CEO; Bekzod (portfolio), Nilufar (risk), Sevara (collections), Kamola (product, app). Use the definitions we use in the course; where you choose one, write it down.
>
> **Deliverables** (all in Day 5's hand-in box by 9:00 on Day 5, the board's Friday):
> - **(a) Analysis notebook** — `capstone.ipynb` (SQL through `read_sql` or pandas), from `data/python/week8/capstone_template.ipynb`; Restart & Run All must work on a fresh copy of the data; one section per question; every number on a slide comes from a cell.
> - **(b) Dashboard, 2 pages** — Power BI (`capstone.pbix` + `capstone_dashboard.pdf`) or Excel (`capstone.xlsx` + `capstone_dashboard.pdf`): page 1 *Growth & mix*, page 2 *Risk & collections*; slicers for product, channel, region; definitions in a text box.
> - **(c) A 10-slide deck** (`capstone_deck.pdf`, from PowerPoint or Google Slides) **or** a 2-page memo (`capstone_memo.pdf`, attached in the deck's place in Day 5's box) with the recommendations.
> - **(d) A 10-minute presentation** on Day 5 — a recording (`capstone_talk.mp4`, a phone is fine) or full speaker notes (`speaker_notes.md`) if you present live to the mentor.

The arc of the three days: **brief → analysis (today, Day 3) → dashboard and story (Day 4) → the ten minutes (Day 5)**. Each section below ends with a line *Done looks like* — tick it before you move on.

**P1.** *(reading a brief)* Restate the brief in **one sentence**, with the as-of date and who is in the room. It becomes the first line of your notebook.

*Done looks like:* you can say the question, the date, the room and the four deliverables in two sentences without looking.

---

## 3. What the board must hear about — five required questions

Five required questions and one of your own (Q6). Each is a section of the notebook and at least one slide. Suggested cuts; you choose the ones that carry a message.

| # | Question | Minimum analysis | Course tools |
|---|---|---|---|
| Q1 | **Growth** — where did the book grow in 2026, and is the growth healthy? | disbursements (count, amount) and outstanding Jan–Sep 2026 vs Jan–Sep 2025 by **product, channel, region**; mix shift; average ticket | week 2 aggregates, week 3 `v_portfolio_monthly` |
| Q2 | **Risk** — which vintages, grades and channels are riskiest, and is it getting better or worse? | FPD30 by channel, product, grade and disbursement period; vintage curves (ever 30+ by MOB, blanks where unobservable) by channel and grade; PAR30 and NPL by product and region; one roll-rate matrix | weeks 2–3, week 6 intervals and tests |
| Q3 | **Collections efficiency** — is effort where the money is? | delinquent loans and balance by bucket; share contacted in September by bucket; actions by bucket; recorded outcome vs actual payment after the action; cure and roll from week 3 | weeks 2–3 |
| Q4 | **The app funnel** — where does the app lose people, and do they come back? | Day 1's funnel (sessions, app only, ending at money), by device/version; repeat borrowing by first-loan cohort | Day 1 |
| Q5 | **Unit economics** — which product makes money per loan and per soum lent? | Day 2's table with the assumptions printed; one sensitivity that matters for a recommendation | Day 2 |
| Q6 | **Your deep-dive** — one question you choose (below) | one analysis, one slide, one recommendation | any |

**Deep-dive ideas** (pick one, or propose your own to the mentor before noon):
- **Regional growth vs risk:** which regions grew fastest, and did their risk follow? Is it one branch, one officer, one product?
- **SME underwriting:** SME is the largest product by balance; what do its *matured* loans say about its default rate, and what does that do to its margin?
- **BNPL and the partners:** which partners/terms lose most; what merchant fee would make it pay; what would stopping it cost in customers who later borrow elsewhere at Nur?
- **The early bucket:** a collections strategy for 1–30 DPD — who to contact first (balance × risk), what it would save if the roll rate fell by a third.
- **Repeat borrowers' risk:** is the FPD of a customer's second loan lower or higher than of the first? Should the app make repeat loans easier?
- **Signed but never paid out:** the app contracts that never became loans — how many, since when, which device/version, what they would have been worth.

**P2.** *(the question behind the question)* Choose your deep-dive and write it as **one question** a board member would ask, plus the one table that would answer it.

*Done looks like:* the deep-dive is one sentence with a question mark, and you know which tables answer it.

---

## 4. The plan — three days

| Day | Morning | Afternoon | End-of-day output |
|---|---|---|---|
| **Day 3 (today)** | brief, issue tree, definitions | data checks, sanity numbers, Q1–Q3 first pass | checkpoint list (section 8) ticked; `issue_tree.md` + notebook draft saved |
| **Day 4** | Q4–Q6; **storyline: slide titles first** (Day 4) | dashboard pages; draft deck; peer-review checklist against your own work | full draft deck; dashboard 2 pages |
| **Day 5** | rehearse twice (timer), final checks, Restart & Run All, export PDFs | present (10 min + questions); then the mock interview | everything in Day 5's hand-in box |

Time box it: if a cut has not produced a message in 30 minutes, write down what you tried and move on. The board needs five clear answers more than one perfect one.

---

## 5. Grading rubric (100 points)

| Criterion | Points | Full marks look like | Common deductions |
|---|---|---|---|
| **Analysis** | 30 | all five questions + a deep-dive answered with the right cut, a comparison (vs last year, vs the book, vs a benchmark) and a "so what" for each | a table with no comparison; a deep-dive that repeats a required question; findings with no recommendation |
| **Correctness** | 20 | the sanity numbers reproduced; definitions written; known data problems handled (and said); denominators right; unobservable cells blank; intervals where n is small | approval with a different denominator per slide; raw payments; FPD on immature loans; a funnel on all customers |
| **Dashboard** | 15 | 2 pages, the board's numbers match the notebook, slicers work, definitions and as-of date on the page, readable at a glance | 12 visuals per page; totals that change with the slicer in the wrong way; no date |
| **Story / deck** | 20 | executive summary with the answer first; so-what titles; one chart per message; 3–5 recommendations with owner and value; assumptions and risks | topic titles; the method before the answer; charts without units; 25 slides |
| **Presentation** | 15 | 10 minutes ±1; the answer in the first minute; each board member hears their part; questions answered with a number or "I will check" | reading the slides; running out of time before the recommendations; arguing with a board member |

---

## 6. Framing — the issue tree (40 min)

An **issue tree** (*дерево проблем*) breaks the question into sub-questions that are **mutually exclusive and collectively exhaustive** (MECE): no overlaps, no gaps. Each leaf is a question one table can answer. One possible start (make it yours):

```
Where do we grow, where do we stop,
what do we change?
├── 1. Where is the money made?
│      → unit economics per product
│        (Q5), contribution 2026,
│        sensitivity
├── 2. Where did we grow, and how?
│      → product / channel / region
│        growth; new vs repeat;
│        ticket vs count (Q1)
├── 3. Where is the risk?
│      → FPD and vintages by channel,
│        grade, product; PAR30 by
│        region (Q2)
│      └── is the risk where the
│          growth is?
│            → growth × PAR30 by
│              region / product
├── 4. Do we lose value in the
│      process?
│      → app funnel leaks,
│        signed-not-disbursed (Q4);
│        collections coverage (Q3)
└── 5. What would change the answer?
       → assumptions (funding rate,
         costs, PD of young
         products), the deep-dive
         (Q6)
```

For every branch write one **hypothesis** before you look ("SME grows fastest and earns most per soum") and the **test** that could break it ("unless its matured default rate is much higher"). A hypothesis you can not break is an opinion. Save it as `issue_tree.md` (it goes in with Day 5's hand-in), with a **definitions block**: outstanding, PAR30, NPL90, FPD30 (maturity rule), approval rate (denominator), collection rate, active customer, funnel step, repeat borrowing, net contribution — one line each, the same as the course's unless you say why.

> 💡 **Key idea.** The tree decides what you will **not** do. A cut that answers no branch is interesting, not useful — and with three days, every interesting cut is time taken from a recommendation.

**P3.** *(issue tree)* Your issue tree: five branches, and for each a **hypothesis** and the **test** that could break it. Copy it into `issue_tree.md` afterwards.

*Done looks like:* `issue_tree.md` with five branches, a hypothesis and a test each, the deep-dive placed in one of them, and the ten definitions.

---

## 7. Data checks and the sanity numbers (40 min)

### Known problems — decide how each is handled, and write it in the notebook's first section

| Problem | Where | Your handling (typical) |
|---|---|---|
| duplicate people with a new `customer_id` (name casing, spaces) | customers | note; affects counts of customers and repeat borrowing slightly |
| impossible birth dates; missing income; missing credit scores | customers, applications | exclude from age/income cuts, say how many |
| loans disbursed before their application date | loans | keep in money totals; exclude from time-to-disburse |
| exact duplicate payments; method spelling | payments | `v_payments_clean` everywhere money is summed |
| closed loans without `closed_at` | loans | use `status` and the schedule, not `closed_at`, for "live" |
| `app_events` exist only for app applications; device/version logged per event | app_events | app-only funnel; session attributes from `app_open` |
| approvals of the last days not yet disbursed | applications | do not read take-up of the last week |
| immature loans | installments | FPD only for first instalments due on or before 2026-09-01; vintage blanks |

### Sanity numbers — reproduce these first

If your number differs, find out why **before** you build on it (usually: raw payments instead of clean, `BETWEEN` on a datetime, a different status list, an immature loan in the denominator). All as of 2026-10-01.

| # | Metric | Value |
|---|---|---|
| 1 | Outstanding (principal due after the as-of) | **208 723 504 430** soum on **3 409** loans |
| 2 | PAR30 · NPL90 | **3.12 %** (6 507 526 953) · **2.55 %** (5 319 475 527; 234 loans) |
| 3 | Buckets 0 / 1–30 / 31–60 / 61–90 / 90+ (loans; here 0 = every loan with DPD 0, including the 14 whose instalment falls due on the as-of day — week 2 listed only those 14) | 7 429 / 124 / 25 / 16 / 234 |
| 4 | FPD30 (first instalment due ≤ 2026-09-01, unpaid in full after 30 days, clean payments) | **91 / 7 099 = 1.28 %**; app 1.70 · branch 1.04 · partner 1.12 % |
| 5 | Disbursed Jan–Sep 2026 vs Jan–Sep 2025 | **3 030** loans, **161 480 300 000** vs 2 159, 110 929 400 000 |
| 6 | Disbursed in September 2026 | 361 loans, 17 015 490 000 |
| 7 | Approval rate, approved ÷ decided, all applications | **70.55 %**; Jan–Sep 2026: branch 72.3 · partner 70.4 · app 67.9 % |
| 8 | Collection rate, instalments due in September, paid by 1 October | 15 982 118 926 / 16 987 977 718 = **94.1 %** |
| 9 | Worst vintage at MOB 3 (ever 30+, term ≥ 6, cohorts 2025-01…2026-03) | **2025-10: 15 / 217 = 6.91 %**; at MOB 6 11.52 % |
| 10 | Roll 1–30 on 1 Sep → 1 Oct | to 31–60 **19.5 %**, cured 75.8 % |
| 11 | Duplicate payments | 25 rows, 58 397 800 soum; clean payments 52 850 |
| 12 | App sessions · disbursed from the app | 5 006 · 2 669 |
| 13 | Repeat borrowing, January 2024 cohort, within 6 months | 16 / 79 = 20.3 % |
| 14 | Unit economics, Day 2 assumptions (CoF 18 %, LGD 60 %, costs by channel) | net per 1 000 lent: AUTO 72.9 · SME 60.3 · CONS 31.9 · MICRO 6.8 · BNPL −107.7 |
| 15 | Expected loss, crude (week 6) | 3.60 bn = 1.77 % of 203.40 bn performing exposure |

> 💡 **Key idea.** A sanity number that does not match is a bug in **your** query until you can prove otherwise. Find it now, on a number you know, not on Friday in front of Nilufar.

> ⚠️ **Watch out.** The four usual culprits, in order: raw `payments` instead of the de-duplicated ones; `BETWEEN '…-01' AND '…-30'` on a column with a time; a different status list (is `approved_not_disbursed` approved?); and loans too young for the metric in the denominator.

**P4.** *(sanity checks)* One more health check before you trust `applications`: how many applications have a decision dated **after** the as-of date (`decided_at >= '2026-10-02'`)? Then say in the notebook how you handle them.

### Reproduce them here

`v_loan_status` and `v_payments_clean` are not tables in `nur.db` — the capstone template creates them as TEMP views in its own connection. In these boxes, write the same logic as CTEs at the top of your query. The chain below gives every loan its outstanding and DPD on 2026-10-01 (▶ Run it, then build on `ls`):

```sql
-- v_payments_clean: exact duplicates dropped
WITH pay AS (
  SELECT installment_id, paid_at, amount FROM (
    SELECT installment_id, paid_at, amount,
           ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn
    FROM payments) WHERE rn = 1),
-- instalments due by the as-of date and not paid in full
unpaid AS (
  SELECT i.loan_id, i.due_date FROM installments i
  LEFT JOIN pay p ON p.installment_id = i.installment_id AND p.paid_at <= '2026-10-01'
  WHERE i.due_date <= '2026-10-01'
  GROUP BY i.installment_id, i.loan_id, i.due_date, i.total_due
  HAVING COALESCE(SUM(p.amount), 0) < i.total_due),
dpd AS (SELECT loan_id, CAST(julianday('2026-10-01') - julianday(MIN(due_date)) AS INTEGER) AS dpd
        FROM unpaid GROUP BY loan_id),
outst AS (SELECT loan_id, SUM(principal_due) AS outstanding FROM installments
          WHERE due_date > '2026-10-01' GROUP BY loan_id),
ls AS (SELECT l.loan_id, COALESCE(o.outstanding, 0) AS outstanding, COALESCE(d.dpd, 0) AS dpd
       FROM loans l LEFT JOIN dpd d ON d.loan_id = l.loan_id LEFT JOIN outst o ON o.loan_id = l.loan_id)
SELECT * FROM ls ORDER BY dpd DESC LIMIT 10;
```

Each box below runs your query on an untouched copy of the data and checks the numbers in your result without showing them. Save the queries as `sanity.sql` — the notebook's section 2 needs the same numbers. This box is today's check, not the capstone hand-in: submit it if you want the mentor to see your sanity numbers early; the capstone itself goes into Day 5's 📎 box.

*Done looks like:* all ten boxes ✅, and for the five numbers the boxes do not check (6, 9, 10, 14, 15) a cell in the notebook that prints them — or a written reason for any difference.

---

## 8. First analyses (70 min) and the end-of-day checkpoint

Run Q1, Q2 and Q3 at the level of the "minimum analysis" column. For each table write, in the notebook, **one sentence** that would be a slide title if it survived tomorrow. Do not format anything yet.

Useful starting points: growth by product is week 2 with two `CASE WHEN` columns (2025 and 2026, Jan–Sep each); by region join `customers` (or `branches`; here they agree); vintages are week 3 Day 3's chain with `GROUP BY` channel or grade; collections coverage is the DPD chain of section 7 left-joined to the loans with a `collections_actions` row in September. In the notebook, `v_loan_status` exists (the template creates it), so the same queries are shorter there.

**P5.** *(the analysis plan)* Q1, first cut: by product, loans and amount disbursed January–September 2025 and January–September 2026, and the growth of the amount in %. Largest 2026 amount first.

**P6.** *(the analysis plan — the grain)* Q3, first cut: for loans 1–90 days past due on 2026-10-01, by bucket — loans, how many had **any** collections action in September 2026, and their outstanding. Start from the DPD chain of section 7.

**P7.** *(a finding)* Under each of your Q1, Q2 and Q3 tables, one sentence that would be a slide title if it survived tomorrow. Write the three here.

**P8.** *(logging assumptions)* Start your assumption log: five lines from today, each with the assumption, why you chose it, and what changes if it is wrong. Copy it into the notebook's first section.

**Checkpoint — tick before you stop** (keep `issue_tree.md` and the `capstone.ipynb` draft on your computer — Day 5's hand-in box takes the final versions):

- [ ] The brief restated in one sentence at the top of the notebook, with the as-of date.
- [ ] Issue tree with a hypothesis and a test per branch; your deep-dive chosen and written as a question.
- [ ] Definitions block (ten metrics, one line each).
- [ ] Data-checks section: every known problem with its handling and the number of rows affected.
- [ ] Assumption log started (P8): each choice, why, and what changes if it is wrong.
- [ ] The ten sanity boxes of section 7 ✅, all 15 sanity numbers in notebook cells (or a written reason for any difference).
- [ ] Q1, Q2, Q3: one table each, one candidate title sentence each.
- [ ] A list of the three questions you most expect from the board (Day 4 prepares them).

---

## 9. Common pitfalls

- **Charts before questions.** The tree first; a chart that answers no branch is cut.
- **Growth without risk, risk without size.** "Region X grew most" and "region X has the highest PAR30" are two halves of one sentence — put them on one slide.
- **Different definitions on different slides** — approval with and without cancelled, FPD with and without the maturity rule.
- **Amount growth explained by demand** when it is a few large SME loans (count and amount, always both).
- **Collections judged by recorded outcomes** ("paid") instead of the payments table.
- **Unit economics as fact.** Your cost figures are assumptions; the recommendation must survive them (show one sensitivity).
- **Twenty recommendations.** Three to five, each with an owner and what it is worth.
- **Hiding the data problems.** One line each in the appendix makes the deck *more* credible, not less.

---

## 10. Self-check

---

## 11. Company corner <span class="badge company">How a board request travels</span>

At a lender the board pack is not one analyst's afternoon. A request like the chairman's moves through people, and each step exists because someone was burned once:

> 🎯 **Interview version.** *"The CEO gives you an open question — 'where should we grow?' — and three days. How do you start?"* — I restate it as a brief: the decision it serves, the as-of date, who is in the room, what they will receive. Then an issue tree — money, growth, risk, process losses, what would change the answer — with a hypothesis and a test per branch, and the definitions agreed with the data owners. Before any chart I reproduce a few numbers the company already trusts, so that my outstanding and PAR30 match Finance's. Only then the analysis, time-boxed per branch, and every finding written as one sentence with a number.

**Say it like in an interview.** *"Walk me through a project you did end to end."* Use this capstone: the question, how you framed it, one number you checked, one finding, one recommendation.

Tomorrow: from tables to a story — slide titles first, then the dashboard, then the questions each board member will ask.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 8 · Day 4 — Capstone II: dashboard and story (weeks/week-08/day-4.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-08/day-4
=====

# Week 8 · Day 4 — Capstone II: dashboard and story

<span class="badge">Storyline 60 min</span> <span class="badge">Dashboard 75 min</span> <span class="badge">Deck 45 min</span> <span class="badge">Review + rehearsal 40 min</span> <span class="badge hw">Capstone (due Day 5)</span>

> STORY **Thursday, 9:00.** Your notebook has forty tables. Madina scrolls through it in silence, then turns the laptop back to you. *"Good work, and the board will see none of it. The chairman reads the first slide and maybe the last. Bekzod will look for his product, Nilufar for the number she can attack, Sevara for whether you understand her team, Kamola for the app. **Write me ten sentences — just the slide titles — before you open PowerPoint.** If the ten sentences read like a memo, you have a deck. If they read like a table of contents, you have a notebook."*

## Today in 3 lines

- You turn the analysis into a **storyline**: the answer first (the pyramid), **slide titles written before any slide**, the evidence each title needs, and the right chart for each message.
- You build the **two dashboard pages** the board can click, and you review deck and dashboard against a **checklist** as if they were somebody else's.
- You **rehearse the ten minutes** and prepare for the questions each board member — Bekzod, Nilufar, Sevara, Kamola — is going to ask.

---

## 1. Learn — from analysis to a story and a dashboard

Yesterday produced findings. Today they become something a busy board can act on in ten minutes. The eight subsections are the eight moves, in the order you make them; sections 2–8 then apply them to your capstone.

### The audience and the one decision

**What it is.** The **audience** is who will read or hear you, and what each of them owns. **The one decision** is what the meeting must decide when you stop talking. Every slide either serves that decision or goes to the appendix.

**How to write it.** One row per person in the room, before any slide:

| Person | Owns | Will look for | Their number |
|---|---|---|---|
| CEO | the whole plan | the decision and what it is worth | — |
| Bekzod | portfolio, product limits | growth and his products | outstanding |
| Nilufar | risk policy | the number she can attack | approval rate, FPD |
| Sevara | collections | whether you understand her team | actions in September |
| Kamola | the app | the funnel | app sessions that reach money |

```sql
-- Bekzod
SELECT (SELECT SUM(principal_due) FROM installments WHERE due_date > '2026-10-01')        AS outstanding,
       (SELECT ROUND(100.0 * SUM(CASE WHEN status IN ('approved', 'approved_not_disbursed') THEN 1 ELSE 0 END)
               / SUM(CASE WHEN status <> 'cancelled' THEN 1 ELSE 0 END), 1)
          -- Nilufar
          FROM applications WHERE applied_at >= '2026-01-01' AND applied_at < '2026-10-01') AS approval_2026_pct,
       (SELECT COUNT(*) FROM collections_actions
         -- Sevara
         WHERE action_date >= '2026-09-01' AND action_date < '2026-10-01')                AS actions_september,
       (SELECT ROUND(100.0 * COUNT(l.loan_id) / COUNT(*), 1)
          FROM (SELECT DISTINCT application_id FROM app_events) s
          LEFT JOIN loans l ON l.application_id = s.application_id)                       AS app_to_money_pct;
          -- Kamola
```

Bekzod's book is 208 723 504 430 soum. Nilufar's approval rate for 2026 is 70.4 %. Sevara's team logged 651 actions in September. Kamola's app turns 53.3 % of sessions into money. Know each of these before you walk in.

**When you use it.**
- Before the storyline: the decision decides which findings make the deck.
- Before the questions: each person's number is where their question will come from.

> ⚠️ **Watch out.** A deck written for "the board" in general is written for nobody. Name the people; a finding that none of them owns goes to the appendix.

**Your turn.** The chairman asked "where do we grow, where do we stop, what do we change?". What is the one decision the meeting must take?

### The governing thought — the pyramid principle

**What it is.** The **governing thought** (*главная мысль*) is one sentence that answers the question you were asked. The **pyramid principle** puts it at the top, the reasons under it, and the evidence under each reason: the reader gets the answer first and stops when they believe you.

**How to write it.**

```text
governing thought
  "Grow X and Y, slow Z until …,
   change A — worth about N"
   │
   ├── key line 1
   │     evidence
   ├── key line 2
   │     evidence
   └── key line 3
         evidence

key line: the reasons, one sentence each
evidence: one chart + one table each
```

On the capstone: *"Grow branch lending and repeat app loans, slow BNPL and the riskiest region until they are explained, and move collections effort to the first month of delinquency."* It names products, a region and a process, and every part can be checked against a number.

**When you use it.**
- The first slide after the title, and the first sentence you say.
- As a test: if you cannot write it, you do not have an answer yet — go back to the issue tree.

> ⚠️ **Watch out.** "We analysed the portfolio from five angles" is an agenda, not a governing thought. It answers nothing.

**Your turn.** Which sentence is a governing thought?

### The storyline — three to five key lines that are sentences

**What it is.** The **storyline** is the three to five **key lines** under the governing thought — the reasons. Each is a full sentence with a number and a comparison. Read in order, they make the argument without any chart.

**How to write it.**

```text
key line = what + number
  + comparison + so what
```

| Key line | Example |
|---|---|
| 1. Money | "Per 1 000 soum lent, Auto (73) and SME (60) earn most; BNPL loses 108." |
| 2. Risk | "Our fastest-growing region, Nukus (+90 %), carries the highest PAR30, 6.8 %." |
| 3. Process | "Only 13 of 124 early-late loans were contacted in September; almost all effort went to loans already lost." |

The three key lines map to the three parts of the governing thought: what to grow, what to slow, what to change.

**When you use it.**
- To pick the slides: each key line becomes one or two finding slides.
- To check the logic: if a key line does not support the governing thought, one of them is wrong.

> ⚠️ **Watch out.** Five key lines that are five topics ("Growth", "Risk", "Collections", "App", "Money") are a table of contents. Write sentences.

**Your turn.** Which is a key line?

### The ghost deck — every slide title before any slide

**What it is.** A **ghost deck** (*черновик из заголовков*) is the whole deck as titles only, in order, before any slide is built. Read aloud in one go it takes about a minute. If the titles alone read like a memo, the deck works.

**How to write it.** Ten lines, in the order of the analytical deck from Day 2:

| # | Part | Content |
|---|---|---|
| 1 | title | 2026 portfolio review — where to grow, where to slow, what to change (as of 1 October 2026) |
| 2 | summary | the governing thought + three bullets |
| 3 | context | Disbursements grew 46 % in January–September; the book stands at 208.7 bn with PAR30 at 3.1 % |
| 4–8 | findings | one key line each, as a sentence with a number |
| 9 | recommend. | Five changes, owners and what they are worth |
| 10 | risks | What could make us wrong, and what we analyse next |

**When you use it.**
- Before you open PowerPoint: a weak title is cheap to fix as a line, expensive as a finished slide.
- Before Madina reviews the deck: send her the ten lines first.

> ⚠️ **Watch out.** The chairman reads slide 2 and the last slide. If either is a topic ("Summary", "Next steps"), he has read nothing.

**Your turn.** A ghost deck is good when…

### Choosing the chart — a recap

**What it is.** The chart follows the **type of message**: change over time, comparison, part of a whole, two measures per category, a funnel, cohorts, a bridge, one number. Week 5's chart rules, applied to the deck.

**How to write it.** The slide-6 message — *"the fastest-growing region carries the highest risk"* — has two measures per category, so it is a scatter with labelled points:

```python
import matplotlib.pyplot as plt

regions = ["Nukus", "Namangan", "Bukhara", "Andijan", "Samarkand", "Tashkent", "Fergana", "Termez"]
# disbursed Jan–Sep 2026 vs 2025, %  (P7)
growth  = [89.7, 83.4, 76.4, 61.2, 58.6, 38.3, 26.1, -9.1]
# PAR30 on 2026-10-01, % of outstanding
par30   = [6.8, 1.7, 4.8, 4.0, 3.0, 3.4, 0.7, 0.7]

# one colour for the point, grey for context
colours = ["#c0392b" if r == "Nukus" else "#9aa0a6" for r in regions]
plt.scatter(growth, par30, c=colours, s=60)
for r, x, y in zip(regions, growth, par30):
    plt.annotate(r, (x, y), textcoords="offset points", xytext=(5, 4), fontsize=8)
plt.xlabel("disbursement growth, Jan–Sep 2026 vs 2025 (%)")
plt.ylabel("PAR30 (%)")
plt.title("The fastest-growing region carries the highest risk")
plt.show()
```

Nukus sits alone in the top-right corner: +89.7 % growth and 6.8 % PAR30. Namangan, almost as fast (+83.4 %), sits at 1.7 % — the counter-example that keeps the slide honest.

**When you use it.**

| Message | Chart |
|---|---|
| change over time | line (bars if few periods) |
| compare categories | horizontal bars, sorted |
| two measures per category | scatter with labelled points |
| a funnel | horizontal bars with step conversion |
| cohorts / vintages | lines that stop where months are not observed |
| what explains a change | waterfall |
| one number | big number + comparison |

> ⚠️ **Watch out.** A dual-axis line invents crossings; a vintage line that continues into unobserved months drops to 0 and looks like an improvement. If a chart needs a sentence to explain how to read it, change the chart.

**Your turn.** The message is *"SME is 58.7 % of 2026 disbursements"*. Which chart?

### Dashboard layout — the top-left rule, one question per tile

**What it is.** A dashboard page is read like a page of text: top-left first, then right, then down. The **top-left rule**: the most important number goes top-left. **One question per tile**: each card, chart or table answers exactly one question, which you can write above it.

**How to write it.** Draw the page as boxes, each with its question, before you build anything:

```text
cards: "how big?", "how fast?"
┌─────────────────┬─────────────────┐
│ Outstanding     │ Disbursed       │
│ 208.7 bn        │ Jan–Sep 2026    │
├─────────────────┼─────────────────┤
│ Growth vs       │ Average         │
│ Jan–Sep 2025    │ ticket          │
└─────────────────┴─────────────────┘
"when?" and "what?"
┌─────────────────┬─────────────────┐
│ Disbursed by    │ Disbursed by    │
│ month, 2025 vs  │ product, sorted,│
│ 2026 (line)     │ with growth %   │
└─────────────────┴─────────────────┘
"where?" and "which mix?"
┌─────────────────┬─────────────────┐
│ Region table:   │ Mix: share of   │
│ disbursed,      │ each product    │
│ growth %, PAR30 │                 │
└─────────────────┴─────────────────┘
slicers: product · channel · region ·
period
as of 2026-10-01 · definitions in
tooltips
```

The top row's four cards, from one query:

```sql
SELECT (SELECT SUM(principal_due) FROM installments WHERE due_date > '2026-10-01')        AS outstanding,
       SUM(CASE WHEN disbursed_at >= '2026-01-01' AND disbursed_at < '2026-10-01' THEN principal ELSE 0 END) AS disbursed_2026,
       ROUND(100.0 * SUM(CASE WHEN disbursed_at >= '2026-01-01' AND disbursed_at < '2026-10-01' THEN principal ELSE 0 END)
             / SUM(CASE WHEN disbursed_at >= '2025-01-01' AND disbursed_at < '2025-10-01' THEN principal ELSE 0 END) - 100, 1) AS growth_pct
FROM loans;
```

Outstanding 208 723 504 430 soum top-left; 161 480 300 000 disbursed in January–September 2026, +45.6 % against the same months of 2025. The fourth card, the average ticket, is P6.

**When you use it.**
- Before you open Power BI or Excel: the sketch is the spec.
- When a page feels busy: any tile whose question you cannot write goes.

> ⚠️ **Watch out.** Twelve visuals on one page means twelve questions and no answer. Six to eight tiles is a page; more is two pages.

**Your turn.** Which tile goes top-left on page 2, *Risk & collections*?

### Annotation — numbers that are read aloud

**What it is.** An **annotation** is text on the chart that states the point: the number that matters, labelled where the eye already is. Numbers on slides are **rounded to what can be said aloud** — "208.7 bn", not 208 723 504 430 — with a unit and a comparison.

**How to write it.**

```python
def say(x, unit="soum"):
    """Round a number the way you would say it in a meeting."""
    for size, word in [(1e12, "trn"), (1e9, "bn"), (1e6, "m"), (1e3, "k")]:
        if abs(x) >= size:
            return f"{x / size:.1f} {word} {unit}"
    return f"{x:.0f} {unit}"

print(say(208_723_504_430))                 # the book
print(say(161_480_300_000))                 # disbursed Jan–Sep 2026
print(say(53_293_828))                      # average ticket
print(f"PAR30 {6_507_526_953 / 208_723_504_430:.1%}")
```

The four numbers become "208.7 bn soum", "161.5 bn soum", "53.3 m soum" and "PAR30 3.1 %". On the scatter above, the annotation is one line next to the red point: *"Nukus: +90 % growth, PAR30 6.8 % — highest of eight regions"*.

**When you use it.**
- On every chart in the deck: label the point that matters, not every point.
- In every spoken sentence: say the rounded number, never "as you can see".

> ⚠️ **Watch out.** Rounding must not change the message. 1.70 % vs 1.04 % may be said as "1.7 against 1.0", not as "about 1 % both".

**Your turn.** Say 94 774 300 000 soum (SME's 2026 disbursements) as on a slide: in bn, one decimal.

### Rehearsing — the first minute, then the questions

**What it is.** **Rehearsal** is saying the talk aloud, standing, with a timer. The **first minute** carries the question, the answer and three reasons. After the talk come the **questions**: prepare one sentence and one number for each person in the room, and answer a challenge by agreeing with what is true, quantifying, and offering a check.

**How to write it.** Spoken English runs at about 130–150 words a minute. Count the words of your opening before you rehearse it:

```python
opening = """The board asked where Nur Finance should grow, where it should slow down and what it should change,
as of the first of October. My answer: grow branch lending and repeat app loans, slow BNPL and Nukus until we
understand them, and move collections effort to the first month of delinquency."""
words = len(opening.split())
print(words, "words ≈", round(words / 140 * 60), "seconds at 140 words a minute")
```

The two opening sentences are 51 words: about 22 seconds. Three reasons with one number each fill the rest of the minute.

**When you use it.**
- Twice before the meeting, the second time recorded.
- For the questions: the audience table from the first subsection tells you who asks what.

> ⚠️ **Watch out.** "Today I will talk about…" spends the first ten seconds on nothing. Start with the question or the answer.

**Your turn.** Your opening is 210 words. At 140 words a minute, how many seconds does it take?

### Putting it together

One slide, built with every move. *Audience:* Nilufar and Bekzod. *Governing thought:* "…slow the riskiest region until it is explained…". *Key line:* "Our fastest-growing region, Nukus, carries the highest PAR30." *Ghost deck:* it is title 6. *Chart:* a scatter, growth against PAR30, Nukus in colour. *Dashboard:* the same numbers sit in page 1's region table. *Annotation:* "Nukus: +90 % growth, PAR30 6.8 %". *Rehearsal:* the spoken line is the title, then one number — "ninety percent growth, six point eight percent at risk" — then the ask: "a cut by product and officer before next quarter's targets".

**Which move fixes which mistake?**

---

## 2. From analysis to the pyramid (20 min)

Four steps, on paper:

1. **Sort the findings by the board's three questions.** Every finding from yesterday goes under *grow*, *stop/slow* or *change* — or into the appendix. A finding that answers none of them is interesting, not useful.
2. **Write the governing thought**: one sentence that answers the chairman's question. *"Grow X and Y, slow Z until …, and change A and B — worth about N."* If you cannot write it, you do not have an answer yet: go back to the tree, not to PowerPoint.
3. **Three to five key lines** under it — the reasons. Each must be a sentence with a number and a comparison.
4. **Evidence under each key line**: the one chart and the one table that prove it, with the definition.

The test of a pyramid: read only the top and the key lines. Does the chairman know what to decide? Read only one branch. Does Nilufar find her number and its definition?

> 💡 **Key idea.** If you cannot write the governing thought in one sentence, you do not have an answer yet — and no amount of formatting will give you one. Go back to the tree.

**P1.** *(the audience and the one decision)* Fill the audience table for the board meeting (Day 5): for each of the five people in the room, what they own, what they will look for, and the one number of yours they will check first.

**P2.** *(the governing thought)* Your governing thought: one sentence that answers *where do we grow, where do we stop, what do we change* — with what it is worth.

**P3.** *(the storyline)* Under your governing thought, write the three to five key lines — the reasons — each a full sentence with a number and a comparison.

*Done looks like:* one sentence on a sticky note, and three to five key lines under it, each with a number.

## 3. Slide titles first (20 min)

A **ghost deck** (*черновик из заголовков*): ten empty slides with only the titles, in order. Read them aloud in one go — about a minute. That minute is your presentation's skeleton; the rest of the ten minutes is evidence.

Good title rules (Day 2): a full sentence, a number, a comparison, the "so what". Weak → strong:

| Topic title (weak) | So-what title (strong) |
|---|---|
| "Growth by region" | "The fastest-growing region also carries the highest PAR30" |
| "Collections activity" | "Collections effort goes to loans already lost; the early bucket is barely called" |
| "Unit economics" | "Per 1 000 soum lent, Auto and SME earn ten times Micro; BNPL loses money" |

For each title, write under it: *the evidence* (which table/chart from the notebook), *the definition* (footnote), *the owner* of the action.

> ⚠️ **Watch out.** A deck whose titles read like a table of contents ("Overview", "Risk", "Collections", "Next steps") is a notebook in slide form. The chairman reads slide 2 and the last one; if those are topics, he has read nothing.

**P4.** *(the ghost deck)* Your ghost deck: the ten titles, in order, one per line. Read them aloud — about a minute.

*Done looks like:* ten sentences that read like a memo when you read them in one go.

## 4. Choosing the chart (20 min)

| Message | Chart | Avoid |
|---|---|---|
| change over time (disbursement, FPD by month) | line; bars if few periods | pie, 3D |
| compare categories (product, region) | horizontal bars, sorted | unsorted bars, pie with 8 slices |
| part of a whole that matters (mix) | 100 % stacked bar, or one bar highlighted | pie with similar slices |
| two measures per category (growth vs PAR30 by region) | scatter, labelled points; or two aligned bar columns | dual-axis line chart |
| a funnel | horizontal bars with step conversion labels | a funnel graphic without numbers |
| cohorts / vintages | lines by cohort vs MOB, or a heat-mapped table with blanks | lines that continue into unobservable months |
| a bridge (what explains a change) | waterfall | a table of percentages |
| one number | big number + comparison ("3.12 % PAR30, +0.3 pt vs June") | a gauge |

One colour for "the point", grey for context; label the bar that matters, not all of them; units in the title or axis; source and definition in a footnote; as-of date on every page. (Week 5's chart rules.)

> ⚠️ **Watch out.** Three charts that mislead without lying: a **dual-axis** line that invents crossings, vintage lines that **continue into months not yet observed** (the line drops to 0 and looks like an improvement), and a **pie** with five similar slices. If the chart needs a sentence to explain how to read it, change the chart.

**P5.** *(choosing the chart)* Slide 6 says *"the fastest-growing region carries the highest risk"*. Which chart carries it? Then, in your notes, do the same for two more of your findings: message type → chart → the one point in colour.

## 5. The dashboard — two pages (75 min)

Power BI on week 7's model (`data/powerbi/`), or Excel on week 4's pivots. Slicers on both pages: **product, channel, region, disbursement period**.

**Page 1 — Growth & mix.** Top row, four cards: outstanding; disbursed Jan–Sep 2026; growth vs Jan–Sep 2025; average ticket. Middle: disbursed by month (line, 2025 vs 2026); disbursed by product (sorted bars) with growth %. Bottom: region table (disbursed 2026, growth %, PAR30) with conditional formatting; a small mix chart (share of SME / AUTO / CONS / MICRO / BNPL).
**Page 2 — Risk & collections.** Cards: PAR30, NPL90, FPD30 (mature loans), collection rate (last month). Middle: vintage curves by channel (ever 30+ by MOB, MOB 1–6); FPD30 by grade and channel (matrix). Bottom: buckets with balance and **share contacted in the last 30 days**; actions by bucket.

Every card shows its definition in a tooltip or a text box; numbers on the dashboard equal the notebook's (check five of them — the sanity table is your test). Export a PDF of both pages.

> 💡 **Key idea.** The dashboard and the deck are two views of **one** set of numbers. Before you format anything, put five dashboard numbers next to the notebook's — any difference is a filter or a definition you have not written down.

**P6.** *(dashboard layout)* Page 1's fourth card: the **average ticket** of loans disbursed January–September 2026 (sanity 5: 3 030 loans, 161 480 300 000 soum). Whole soum.

**P7.** *(dashboard layout — one question per tile)* Page 1's region table: by branch region, disbursed January–September 2026, growth of that amount vs January–September 2025 in %, and PAR30 in % of today's outstanding. Fastest growth first.

**P7 — read it.** Which region would you put on slide 6, and why?

**P8.** *(annotation)* Write the annotation for the Nukus point on your slide-6 scatter, and the footnote under the chart (definition, source, as-of date). Numbers rounded as you would say them.

*Done looks like:* two pages, PDF exported, and five numbers on them that you have checked against the notebook.

## 6. Review your own work — the checklist (20 min)

Print it, tick it, fix what fails. Do it at the end of today, not on the morning of Day 5.

**Deck / memo**
- [ ] Slide 2 answers the chairman's question in three bullets; a reader who stops there knows the decision.
- [ ] Every title is a sentence with a number; reading the titles alone tells the story.
- [ ] One message per slide; every chart has units, a source and an as-of date.
- [ ] Each recommendation has an **owner**, a **date** and **what it is worth** (or protects).
- [ ] Assumptions (funding rate, costs, LGD) and data problems on one slide or in the appendix.
- [ ] No number appears with two values in two places.

**Dashboard**
- [ ] Two pages; the main numbers match the notebook; slicers change what they should and nothing else.
- [ ] Definitions and as-of date visible; nothing needs scrolling.

**Notebook**
- [ ] Restart & Run All on a fresh copy works; the sanity numbers are in cells; every slide number is in a cell.
- [ ] Each section ends with a sentence of interpretation.

**Correctness traps** (week by week): clean payments for money; FPD on mature loans only; approval rate with its denominator written; vintage blanks; funnel = app sessions only, ending at disbursed; repeat borrowing with unobservable cells blank; intervals where n is small.

## 7. Rehearse the ten minutes (20 min)

| Minute | What | Slides |
|---|---|---|
| 0:00–1:00 | the question and **the answer** (governing thought + three bullets) | 1–2 |
| 1:00–2:00 | context: size, growth, quality in four numbers | 3 |
| 2:00–7:30 | the findings, about one minute each — title first, then the one number on the chart that proves it | 4–8 |
| 7:30–9:00 | recommendations: what, who, by when, worth | 9 |
| 9:00–10:00 | risks and assumptions; what you would do next; "questions?" | 10 |

Rehearse twice with a timer, standing, out loud; record the second one (that may be your Day 5 submission). Cut words, not slides. Say each title as the first sentence of each slide. When you point at a chart, say the number, not "as you can see".

**P9.** *(rehearsing — the first minute)* Write your first minute — slides 1 and 2 — exactly as you will say it. No "today I will talk about".

*Done looks like:* two timed rehearsals, the second recorded, 10 minutes ± 1, the answer said before the first minute is over.

## 8. The questions each board member will ask

Prepare one sentence and one number for each. Write your answer in the box **before** you compare it with the model — the model is how the course's numbers would answer, and yours may lead with a different number.

> 🎯 **Interview version.** *"A senior manager attacks your number in front of everyone. What do you do?"* — Agree with what is true in the challenge first, then restate the definition behind my number, give the one figure that shows how much the answer depends on it, and offer the check that would settle it — with a time. I never argue about a number whose definition we have not agreed, and if I do not have the cut, I say "I don't have that here; I will send it today" and write it down.

**P10.** *(rehearsing — the questions)* Bekzod: *"If we slow BNPL, how much volume do we lose — and what happens to the customers?"* · *"Is SME growth sustainable, or are we just lending bigger?"*

**P11.** *(rehearsing — the questions)* Nilufar: *"Your PD is crude. Why should I believe your margins?"* · *"Is the app really riskier, or is that noise?"* · *"Why is that region's PAR30 so high?"*

**P12.** *(rehearsing — the questions)* Sevara: *"My team makes six hundred contacts a month. Are you saying they call the wrong people?"*

**P13.** *(rehearsing — the questions)* Kamola: *"So what do I fix first in the app?"* · *"Can I grow Micro?"*

**P14.** *(rehearsing — the questions)* The CEO: *"If you could do one thing, what would it be?"* — one answer, the one with the largest value and the clearest owner, in one sentence.

**Say it like in an interview.** *"Tell me about a time someone disagreed with your analysis."* Use one of today's five — what they said, what you did, what happened.

---

## 9. One possible storyline

Built from the course's numbers; **yours may differ** — a different deep-dive, a different emphasis, different words. Use it to check that your deck has the same *shape*: an answer, findings that each carry one number, recommendations with owners. Open it only after your own ten titles are written.

---

## 10. Self-check

Tomorrow: you present, and then the mentor interviews you — 60 minutes, live SQL included.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 8 · Day 5 — Presentation day, the mock interview, and what next (weeks/week-08/day-5.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-08/day-5
=====

# Week 8 · Day 5 — Presentation day, the mock interview, and what next

<span class="badge">Final checks 60 min</span> <span class="badge">Presentation 10 min + questions</span> <span class="badge">Mock interview 60 min</span> <span class="badge">What next 30 min</span> <span class="badge hw">Capstone · 100 points</span> <span class="badge hw">Mock interview · 50 points</span>

> STORY **Friday, 9:00.** The meeting room is booked from eleven. Madina, at the door: *"Two things today, and the second matters more than you think. At eleven you present to the board — ten minutes, then their questions. After lunch I stop being your manager and become an interviewer from another bank. Sixty minutes: your CV, live SQL on our database, a case, quick questions, and then your questions to me. Treat it as real. Most people fail the first interview not on SQL but on the case and on 'do you have any questions for us?'."*

## Today in 3 lines

- **Part A:** you submit and present the capstone — notebook, two-page dashboard, deck or memo, and the recording or speaker notes — and answer the board's questions with numbers.
- **Part B:** you go through a **60-minute mock interview**: CV walk, four live SQL tasks of rising difficulty on `nur.db`, a 15-minute case, a metrics rapid-fire, and your own questions to the company.
- **Part C:** you leave with a **30/60/90-day plan** for your first analyst job, a list of free resources to keep learning, and the checklist of what you can now do.

---

## Part A — The capstone presentation (100 points)

**Hand in by 9:00** with the 📎 box below:

| File | What |
|---|---|
| `capstone.ipynb` | executed (Kernel → Restart & Run All, then save); the sanity numbers in cells; one section per question; an interpretation sentence under each table |
| `capstone.pbix` + `capstone_dashboard.pdf` (or `capstone.xlsx` + PDF) | two pages: Growth & mix, Risk & collections |
| `capstone_deck.pdf` (10 slides) **or** `capstone_memo.pdf` (2 pages, attached in the deck's place) | answer first, so-what titles, 3–5 recommendations with owner and value |
| `capstone_talk.mp4` **or** `speaker_notes.md` | 10 minutes; notes = what you say per slide, in full sentences (a recording over 5 MB goes to the course bot — see [How to submit](homework/how-to-submit.md)) |
| `issue_tree.md` | from Day 3, updated if your tree changed |

**The rubric** (as on Day 3):

| Criterion | Points | The question the mentor asks |
|---|---|---|
| Analysis | 30 | Are all five questions and the deep-dive answered with a comparison and a "so what"? |
| Correctness | 20 | Do the sanity numbers reproduce; are definitions written and denominators right; are data problems handled and said? |
| Dashboard | 15 | Two clean pages; do the numbers match the notebook; do slicers work; definitions and date visible? |
| Story / deck | 20 | Answer first; can the titles alone be read as a memo; one chart per message; recommendations with owner and value? |
| Presentation | 15 | 10 minutes ±1; the answer in the first minute; questions answered with a number or "I will check"? |

**The ten minutes.** Start with the answer, not with "today I will talk about". Say every title as the first sentence of its slide. When you are asked something you do not know: *"I don't have that cut here; I will send it today"* — and write it down. When a board member disagrees: thank, restate their point, give your number and its definition, offer the check that would settle it. Never argue about a number whose definition you have not agreed.

> 💡 **Key idea.** The first minute decides the next nine: if the board has your answer by 0:60, every slide after it is evidence they are already weighing; if not, they spend the ten minutes guessing where you are going.

> ⚠️ **Watch out.** The presentation mistakes that cost the most points: reading the slides aloud, running out of time before the recommendations, "as you can see" instead of the number, and defending a number against a board member instead of agreeing its definition first. Rehearse with a timer until slide 9 starts before minute 8.

*Done looks like:* everything in the 📎 box at the bottom of the page by 9:00, and the ten minutes delivered with the answer in the first one.

---

## Part B — The mock interview (60 minutes, 50 points)

Run by the mentor as an interviewer from another lender. The structure is the one most analyst interviews in banks and fintechs follow. Before the real thing, go through every block below **on your own, against the clock**: each question has a box; write the answer you would say, then compare it with the model.

| Block | Minutes | Points | What is tested |
|---|---|---|---|
| B1. Intro and CV walk | 10 | 5 | a 2-minute story of yourself; one project told with STAR and numbers |
| B2. Live SQL on `nur.db` | 20 | 20 | four tasks, rising difficulty; you talk while you write |
| B3. Case | 15 | 10 | structure, hypotheses, data you would pull, a recommendation |
| B4. Metrics rapid-fire | 10 | 10 | ten questions from the interview bank, ~1 minute each |
| B5. Your questions | 5 | 5 | do you ask about the job, the data, the team? |

> 💡 **Key idea.** Interviewers score the **process** as much as the result: restate the question, name the tables and the grain, check the answer against a number you know, say the trap out loud. A right query in silence scores less than a nearly-right one explained.

Three methods carry most of the interview. Learn them here, in the course's shape, then use them in B1–B5.

### The STAR answer — situation, task, action, result

**What it is.** **STAR** is the shape of a story about your work: **S**ituation (who needed what, and why), **T**ask (what exactly you had to deliver), **A**ction (what you did — the method, not only the tool), **R**esult (a number, and what changed because of it). Interviewers use it to score "tell me about a time…" and the CV walk.

**How to write it.** One sentence per letter; the result carries a number you can prove:

| Letter | Sentence |
|---|---|
| S | Bekzod's outstanding did not match Finance's ledger. |
| T | Find the difference before the month-end pack went out. |
| A | Reconciled payments to instalments; found rows identical in instalment, date and amount; built a clean view. |
| R | 25 duplicate rows, 58 397 800 soum counted twice; every report since uses the clean payments. |

The R line comes from a query, not from memory:

```sql
SELECT COUNT(*) AS duplicate_rows, SUM(amount) AS counted_twice
FROM (SELECT amount,
             ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn
      FROM payments)
WHERE rn > 1;  -- every copy after the first
```

25 rows and 58 397 800 soum: the result line of the story, exact to the soum.

**When you use it.**
- "Tell me about yourself", "walk me through a project", "a time you disagreed", "a time you made a mistake".
- On the CV: each portfolio line is a compressed STAR — action verb, method, result with a number.

> ⚠️ **Watch out.** "I used pandas and Power BI" is a list of tools, not an action, and has no result. Say what you found and what changed.

**Your turn.** Which line is a **Result**?

### Live SQL habits — think aloud, check, name the trap

**What it is.** In a live SQL task the interviewer scores the **process** as much as the query. Five habits: **restate** the task and ask one clarifying question; **name the tables and the grain**; **write in small steps** and run each; **check** the result against a number you already know; **say the trap** you avoided.

**How to write it.** Add the check to the query itself, so it is on the screen when you say it:

```sql
-- task: loans and amount disbursed in September 2026 by channel
-- grain: one loan, tables: loans → applications (for the channel)
SELECT a.channel, COUNT(*) AS loans, SUM(l.principal) AS disbursed
FROM loans l JOIN applications a ON a.application_id = l.application_id
-- half-open: no BETWEEN on dates
WHERE l.disbursed_at >= '2026-09-01' AND l.disbursed_at < '2026-10-01'
GROUP BY a.channel
UNION ALL
-- the check: September's known total
SELECT 'TOTAL', COUNT(*), SUM(principal)
FROM loans
WHERE disbursed_at >= '2026-09-01' AND disbursed_at < '2026-10-01';
```

Branch 172 loans, app 123, partner 66; the total row says 361 loans and 17 015 490 000 soum — sanity number 6, so the join lost nothing.

**When you use it.** Every live task, from T1 to T4. Say each habit aloud as you do it:

| Habit | What you say |
|---|---|
| restate | "So: one row per channel, September 2026, count and amount — loans, not applications?" |
| grain | "One row of the result is a channel; one row before grouping is a loan." |
| small steps | "First the filter alone, then the join, then the GROUP BY." |
| check | "361 loans in total — that matches September." |
| trap | "I used a half-open date range, because `BETWEEN` loses the last day's times." |

> ⚠️ **Watch out.** A query that runs but answers a different question scores 0. Ask before you write: "loans or applications?", "by disbursement month or by application month?"

**Your turn.** The interviewer says: *"Approval rate by month for the app."* What do you do first?

### The case method — is it real, how big, where, why, what now

**What it is.** A **case** is an open business question ("FPD doubled — what do you do?"). The **case method** answers it in five steps, in this order: **is it real?** (same definition, same period, enough loans), **how big?** (counts, not only rates), **where?** (a MECE split: product, channel, grade, version, region, officer), **why?** (an event: a policy change, an outage, a campaign, fraud), **what now?** (a recommendation and a monitor).

**How to write it.** The first two steps are a query. App FPD30 by the month the first instalment fell due:

```sql
WITH pay AS (  -- clean payments
  SELECT installment_id, paid_at, amount FROM (
    SELECT installment_id, paid_at, amount,
           ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn
    FROM payments) WHERE rn = 1),
-- first instalments old enough to judge
first_inst AS (
  SELECT i.loan_id, i.due_date, i.total_due, COALESCE(SUM(p.amount), 0) AS paid_in_30
  FROM installments i
  LEFT JOIN pay p ON p.installment_id = i.installment_id
                 AND p.paid_at <= date(i.due_date, '+30 days') AND p.paid_at <= '2026-10-01'
  WHERE i.installment_no = 1 AND i.due_date <= '2026-09-01'
  GROUP BY i.loan_id, i.due_date, i.total_due)
SELECT strftime('%Y-%m', f.due_date) AS due_month,
       COUNT(*)                                                         AS loans,
       SUM(CASE WHEN f.paid_in_30 < f.total_due THEN 1 ELSE 0 END)      AS fpd30,
       ROUND(100.0 * SUM(CASE WHEN f.paid_in_30 < f.total_due THEN 1 ELSE 0 END) / COUNT(*), 2) AS fpd30_pct
FROM first_inst f
JOIN loans l    ON l.loan_id = f.loan_id
JOIN products p ON p.product_id = l.product_id
WHERE p.channel = 'app' AND f.due_date >= '2026-03-01'
GROUP BY due_month ORDER BY due_month;
```

FPD30 "doubled" from July to August: 0.74 % to 1.64 %. In counts it is 1 loan of 136 against 2 of 122. One extra default on a hundred loans is not a crisis — it is a reason to keep watching, with an interval.

**When you use it.**
- B3, and every "X went up/down — what do you do?" question.
- In the job: half of the "crises" in a lender's week are one extra default, a definition change or a payment outage.

> ⚠️ **Watch out.** Jumping to "why" ("the new app version is buggy") before "is it real" and "how big" is the most common way to fail a case. Check the counts first, out loud.

**Your turn.** *"Approval in the app fell from 70 % to 62 % last week."* What is your first move?

### Putting it together

One interview, three methods. B1 and the CV walk are **STAR** stories, each ending with a number from a query. B2 is the **live SQL habits**, said aloud while you type. B3 is the **case method**, step by step. B4 is definitions with one number or one trap each; B5 is your questions. The same discipline runs through all of them: say the definition, give the count, name the trap.

### B1. Intro and CV walk (10 min)

*"Tell me about yourself"* in two minutes: who you are (one line), what you learned and built (the course, framed as projects), the role you want and why this company. Then the interviewer picks one CV line — have STAR for each of your four portfolio deliverables (HW 8.1). The trap: describing the tools ("I used pandas") instead of the result ("I found 300 users in both arms and the iOS bug, and the lift went from 13 % to 11 %").

**B1.1.** *(STAR — the two-minute version)* *"Tell me about yourself."* Write the two minutes as you would say them.

**B1.2.** *(STAR)* The interviewer points at one CV line: *"Tell me more about this one."* Tell one deliverable with **STAR** — situation, task, action, result — and a number in the result.

### B2. Live SQL (20 min) — four tasks

Think aloud: restate the task, name the tables and the grain, write, run, **check the result makes sense** (a total you know, a row count). Ask clarifying questions — interviewers reward them. Each box runs on the course database, like DBeaver on `data/raw/nur.db` would; give yourself the minutes in brackets.

**T1 (easy, 3 min).** *(live SQL habits)* Loans and amount disbursed in September 2026 by product, with the average ticket, largest amount first.

<details><summary>What earns the points (open after you have checked)</summary>

SME 30 · 8 601 880 000 · 286 729 333; AUTO 21 · 4 398 600 000; CONS 121 · 3 409 790 000; MICRO 123 · 328 630 000; BNPL 66 · 276 590 000. Check aloud: **361 loans, 17 015 490 000** in total — the September figure you know. Say: half-open date range, not `BETWEEN`.

</details>

**T2 (medium, 5 min).** *(live SQL habits)* Monthly approval rate of the **app** channel, April–September 2026, cancelled applications excluded; show the cancelled count too.

**T2 — the follow-up.** *"September is the lowest month (66.7 %). Is that a problem?"*

**T3 (harder, 6 min).** *(live SQL habits)* For each branch, the loan officer with the most approved applications in January–September 2026 (all channels). Show ties.

<details><summary>What earns the points (open after you have checked)</summary>

11 rows for 10 branches: Fergana has a **tie** (Sanjar Ergashev and Bobur Ergashev, 62 each) — `RANK` keeps both, `ROW_NUMBER` would silently pick one. Two "Sanjar Ergashev" are **different people** (different `staff_id`, Fergana and Namangan): group by the id, display the name. Top of the table: Tashkent South, Gulbahor Ismoilov, 92.

</details>

**T3 — the follow-up.** *"So is the top officer the best?"*

**T4 (hardest, 6 min).** *(live SQL habits)* Repeat borrowing: for customers whose first loan was in 2025, by quarter of the first loan — customers, how many took a second loan within 6 months of the first, and the rate.

<details><summary>What earns the points (open after you have checked)</summary>

2025-Q1 375 · 108 · 28.8 %; Q2 414 · 134 · 32.4 %; Q3 450 · 146 · 32.4 %; Q4 443 · 160 · 36.1 %. The first loan is found **before** filtering to 2025 (filter inside `ranked` and every customer's first 2025 loan looks like a first loan); `loan_id` breaks ties on the same day; the `LEFT JOIN` keeps customers with no second loan; and the observability check said aloud — even a first loan of 31 December 2025 reaches 6 months on 30 June 2026, before the as-of, so every cell is complete. SQL Server: `DATEADD(month, 6, first_at)`, `DATEPART(quarter, first_at)`.

</details>

**Scoring B2 (20):** T1 3, T2 5, T3 6, T4 6. Each: correct result (60 %), the check said aloud (20 %), the trap named (20 %). A query that runs but answers a different question scores 0 for that task — ask before you write.

### B3. The case (15 min): *"FPD in the app doubled last month. What do you do?"*

Five minutes to structure aloud, eight to go through it, two for the recommendation. The interviewer answers your data questions.

> 🎯 **Interview version.** Open every case with **"is it real, and how big?"** before **"why?"**: the definition, the period, the denominator and the counts. Half of the "crises" in a lender's week are one extra default on a small vintage, a definition change or a payment outage — and the candidate who checks that first is the one who gets hired.

**B3.** *(the case method)* Your answer to the case: structure it aloud, then write it here — what you check first, where you look, how you separate mix from rate, and what you recommend.

**Scoring B3 (10):** checks reality and size before causes (3); a structure that is MECE (3); names the data and tables (2); ends with a recommendation and a monitor (2).

### B4. Metrics rapid-fire (10 min)

Ten questions from the [interview bank](company/interview.md), about a minute each, no notes. Say each answer aloud first, then write it — 1 point each for a correct definition with one number or one trap.

**R1.** *What is the difference between DPD and FPD?* (A1)

**R2.** *PAR30 vs NPL — what is the difference?* (A2)

**R3.** *What is a roll rate and how do you use it?* (A3)

**R4.** *How do you compute approval rate? Why do two teams get different numbers?* (A5)

**R5.** *What is expected loss?* (A6)

**R6.** *Explain IFRS 9 provisions in plain words.* (A7)

**R7.** *What is cost of risk?* (A9)

**R8.** *Measure vs calculated column in Power BI?* (C3)

**R9.** *What is a p-value?* (D1)

**R10.** *What is a sample ratio mismatch and what do you do when you find one?* (D4)

### B5. Your questions to the company (5 min)

Ask two or three. Good questions show you thought about the job, the data and the team:

- *"What would a successful first three months look like in this role?"*
- *"Which metrics does this team own, and which definition of approval rate / NPL do you use in the board pack?"*
- *"Where does the data live — a warehouse, which tools — and who do I go to when a number looks wrong?"*
- *"What is the most recent analysis from this team that changed a decision?"*
- *"How are requests prioritised — who are the main internal clients?"*
- *"What is the biggest data-quality problem the team lives with today?"*
- *"How does the team review each other's work before it goes to management?"*

Avoid as first questions: salary and holidays (later, with HR), "what does the company do?" (you should know), and "no questions".

> ⚠️ **Watch out.** "No questions" scores zero in B5 — and it is the most common answer from nervous candidates. Write your three questions before the interview, and add one that follows from something the interviewer said.

**B5.** Your three questions for this interviewer — and, for one of them, why you are asking it.

**Scoring B5 (5):** at least two questions (2), about the work rather than the perks (2), one that follows from something said in the interview (1).

---

## Part C — What next

### A 30/60/90-day plan for your first analyst job

| Days | Goal | Concretely |
|---|---|---|
| **1–30: learn** | the business and the data | meet every internal client (the roles page is your list); get access to the warehouse and the dashboards; write your own glossary of *their* definitions (approval, DPD, NPL, active customer) and where each differs from the course; rebuild one existing recurring report and reconcile it to the soum |
| **31–60: deliver** | own something small, end to end | take over one recurring report or dashboard; answer ad-hoc requests with the four steps (metric + definition, grain, tables, check against a trusted number); find and document one data-quality problem with its size and a fix |
| **61–90: improve** | one piece of analysis that changes a decision | pick a question from your metric tree that nobody owns (an early-bucket strategy, a funnel leak, a product's unit economics); deliver it as a one-page memo with a recommendation, an owner and a value; automate one manual step you inherited |

**C1.** Your own 30/60/90 for the job in your `job_ad.md` (HW 8.1): one concrete line per period — who you will meet, what you will own, which question you will answer.

### How to keep learning (free)

- **SQL practice:** SQLBolt (interactive basics), the **Mode SQL Tutorial** (mode.com/sql-tutorial — analytics SQL with window functions), HackerRank and LeetCode "Database" problems (interview-style), StrataScratch (free questions from real company interviews); and Data with Baraa's full course (the course's SQL backbone) for review.
- **Python:** Kaggle Learn (kaggle.com/learn — Pandas, Data Visualization, Intro to Machine Learning), then a public Kaggle dataset per month analysed end to end as a notebook.
- **Statistics:** **StatQuest** with Josh Starmer (YouTube) — p-values, confidence intervals, power, logistic regression explained visually.
- **Power BI:** Microsoft Learn's **Power BI Data Analyst** learning path (learn.microsoft.com — the free path behind the PL-300 certificate), and its DAX modules.
- **Lending:** the annual reports (IFRS financial statements) of two or three local banks each year — read the credit-risk note; the central bank's published statistics on the loan market.
- **Habit:** one question a week answered on your own data, written in five sentences. The writing is the skill that stays rare.

### You can now…

- [ ] explain how a lending company works from application to write-off, and who owns each step;
- [ ] design a small database from a brief and query it in SQL — joins, aggregates, dates, CASE, windows, CTEs, views;
- [ ] compute every core lending metric — DPD and buckets, FPD, PAR30, NPL, roll rates, vintages, approval rate, collection rate, expected loss — and say where companies define them differently;
- [ ] clean data in Excel and Power Query, and build pivot reports;
- [ ] analyse data in Python with pandas and charts, in a notebook someone else can re-run;
- [ ] put a confidence interval on a rate, choose and run a test, report an effect size, and explain a p-value to a manager;
- [ ] design and analyse an A/B test, including the checks that catch a broken experiment and the guardrail that protects risk;
- [ ] build a Power BI model with a star schema, DAX measures and a dashboard that refreshes;
- [ ] build a metric tree, a funnel, a cohort analysis and the unit economics of a loan;
- [ ] turn an analysis into a ten-slide story with the answer first, and present it in ten minutes;
- [ ] go into an analyst interview with a CV, a portfolio, thirty prepared answers and good questions of your own.

---

## Scoring and what happens next

| Item | Points |
|---|---|
| Capstone (Part A) | 100 |
| Mock interview (Part B) | 50 |

The mentor's written feedback comes in 📤 Homework — the capstone by rubric line, the interview block by block with the two things to practise first. Points are added to the [progress page](progress.md). Then the real ones: send the CV, keep the portfolio link in it, and keep the [interview bank](company/interview.md) open the evening before every interview.

---

### 📎 Hand in here

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.


=====
PAGE: Week 8 · Day 6 — Section exam: Product analytics and the job (Week 8) (weeks/week-08/day-6.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-08/day-6
=====

# Week 8 · Day 6 — Section exam: Product analytics and the job (Week 8)

<span class="badge">Exam 60 min</span> <span class="badge">Interview 45 min</span> <span class="badge hw">Exam · 100 points</span>

> STORY **Exam day, 10:00.** Bekzod, the portfolio manager, asked to run this one himself. Bekzod: *"Week 8 was the job itself: metrics, the economics of a loan, the capstone and the interview. So today I ask what I ask every candidate. Metric trees, funnels, the margin of one loan, a number that disagrees with another number. Bring your notes. Nobody answers for you."* Madina takes notes at the end of the table.

## Today in 3 lines

- You show that you can think like a product and portfolio analyst: metric trees, funnels, retention, the economics of one loan and how you tell the story.
- **Part A (40 points):** 25 quick questions with the classic traps inside. It is marked on the spot.
- **Part B (60 points):** an interview on the Nur Finance data — five questions you answer in words and three small tasks you work out. Your mentor reads it.

---

## 1. How the exam works

- **Two parts.** Part A is a quiz: 25 questions, 40 points, marked at once. Part B is an interview: eight written answers, 60 points, marked by your mentor.
- **Pass mark.** You need 70 of 100 points. In Part A, 80 % right (20 of 25) counts as done. You can repeat Part A as often as you like, and your best attempt counts.
- **What it covers.** All of Week 8: product metrics, funnels and retention, the unit economics of a loan, the capstone and the interview. About a third of the questions come from earlier sections: statistics, A/B tests, Power BI, SQL, Excel and Python.
- **Open book.** The course pages, your own notes and the [SQL playground](playground.md) are allowed. Chatbots and asking other people are not. A real interview works the same way: you may bring notes, but nobody answers for you.
- **Time.** Plan 60 minutes for Part A and 45 minutes for Part B.
- **Deadline.** Part B is due at 23:59 on the day of Week 9 · Day 1 (the menu shows the date). Part A can be taken any time before that.
- **After the exam.** Your mentor reviews Part B and sends structured feedback.

---

## 2. Part A — Quick check (40 points)

25 questions in one quiz. Some have one right answer, some have several, some ask for a number or a word. A few say *run it*: use the [SQL playground](playground.md) for those. After each answer the quiz tells you why. Questions 1–16 are about Week 8. Questions 17–25 come from earlier weeks: statistics, A/B tests, Power BI, SQL, Excel and Python.

---

## 3. Part B — Interview (60 points)

Eight written answers. Write them as you would say them aloud to a hiring manager.

- **I1–I5 are interview questions.** Answer in 4–6 sentences and use one number from Nur Finance.
- **I6–I8 are small tasks on the data.** Write the query or the code, then the numbers you get and one sentence. Every number is as of 2026-10-01.
- Write in your own words. Short and exact beats long.

### 📎 Hand in here

---

## 4. Scoring and what happens next

| Part | Points | Marked by |
|---|---|---|
| A — Quick check | 40 | automatic, your best attempt |
| B — Interview | 60 | your mentor |
| **Total** | **100** | **70 or more passes** |

A pass closes the product block: you have shown that you can read a business in metrics, price one loan and tell the story. Credit risk, the last week, comes next, and then the final exam. Below 70, the feedback names the topics to repeat, and you and your mentor decide when to try Part B again.

Your feedback arrives on the **[My feedback](feedback.md)** page and in the course bot. Your points go to the [Progress page](progress.md).


=====
PAGE: Week 9 · Day 1 — Correlation and linear regression: what moves the monthly payment? (weeks/week-09/day-1.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-09/day-1
=====

# Week 9 · Day 1 — Correlation and linear regression: what moves the monthly payment?

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 9.1 (due Day 3)</span> <span class="badge company">Company corner</span>

> STORY **Monday, 9:00.** Nilufar, risk, puts a folder marked *Scorecard 2024* on your desk. *"Our application scorecard was built two years ago. Does it still work, and is our approval cut-off in the right place? That is your week. But a scorecard is a statement about relationships — a higher score, fewer bad loans — so first I want you to read a relationship properly: how strong it is, what a line through it means in soum, and what you may **not** say from it. Two warm-ups from my inbox. Sales says rich customers ask for bigger loans — true? And the affordability team wants a quick rule for the monthly payment from the amount and the term. Do the SME version with me today; the Consumer one is your homework."*

## Today in 3 lines

- A relationship between two numbers, read four ways: the **scatter plot**, **Pearson's r** (and why r = 0.002 between income and the requested amount means "no straight line", not "no link"), **Spearman's** rank correlation for skewed money columns, and the **correlation matrix** — with the two traps: **correlation is not causation**, and a correlation across groups can flip inside them.
- The **least-squares line**: slope and intercept in soum, fitted with numpy, scipy and Excel; **R²**; **residuals** and the residual plot; **outliers and leverage**; **several predictors** and a **product dummy**; prediction against explanation, and the **extrapolation** trap.
- The SME desk gets its rule — and learns that inside one term the payment is an exact straight line — and you start HW 9.1 (the Consumer rule, in `data/python/week9/day1_starter.ipynb`).

---

## 1. Learn — two numbers that move together

Eight short stories. Each one tells **one idea in small steps**: read a sentence, watch the picture change, press **Next**. A dotted word shows its meaning when you tap it. Tired of reading? Press **▶ Play as a video**: the page reads every step aloud and moves the picture for you.

The Python for each idea, and the extra topics, are in **Going further — the full version** near the end of the page (optional).

### Two numbers, one picture — the scatter plot

(Animated explanation)
Six loans on a grid
- Each dot is one of Nur's Auto loans. How far **right** a dot sits is its principal — the amount lent. How **high** it sits is its monthly payment.
- Another one: 354.8 m lent, 18.76 m a month. One dot per case, one number across and one up: that picture is a scatter plot.
- Put the number that you think explains across — x, the principal — and the number you want to understand up — y, the payment. Here: the further right, the higher.
- 25 real Auto loans. Read four things: the **direction** (up or down), the **form** (straight or curved), the **strength** (a tight band or a loose cloud) and anything **odd**.
- Something odd: colour each loan by its term and the cloud splits into three fans. At the same principal, the 24-month loans pay the most.
- Your turn — use the colours.
- All 391 Auto loans: the same three fans. Draw the picture before any number — and one product at a time: next to SME loans (up to 600 m), Micro loans (0.5–5 m) would shrink to one dot.

### How close to a line — Pearson's r

(Animated explanation)
How close to a line?
- Twelve made-up dots exactly on a rising line. We want one number for **how close to a straight line** dots lie; we call it r. On the line, r = 1.
- Shake the dots off the line a little: r drops to 0.80. Still a clear rising band.
- Shake them a lot: r = 0.30. A rise is still there, but weak — a loose cloud.
- Make them fall instead: r = −0.90. The **sign** of r is the direction: + up, − down. Its **size** is how close the dots lie to a line.
- Your turn.
- Steep is not strong. These dots barely rise, yet they lie tight on their line: r = 0.97.
- These rise steeply but scatter widely: r = 0.62. How steep a line is, is the slope's job (later). r measures only how close the dots are to a line.
- How is r counted? Back to six Auto loans. The purple cross marks the **average loan**: the average principal x̄ (“x-bar”) across, the average payment ȳ up.
- Multiply each dot's two distances from the cross (Σ means “add them all up”). In the green corners both distances share a sign: the product is +. In the orange corners it is −.
- Add the products: five pluses and one small minus make a big plus. The bottom of the fraction only rescales the sum, so that r stays between −1 and +1: here r = 0.891.
- Check yourself on the cross.
- All 391 Auto loans: r = 0.893; on all 7 828 loans, 0.904. A rough scale for the size of r (a habit, not a law) is in the strip.

**Now play.** The same idea with sliders — try the challenges.

### Cause or coincidence? A game

(Animated explanation)
Cause or coincidence? A game
- Three rounds. Each: a real link from Nur's data and a claim; you decide if it is a cause. Round 1: each dot is one product and one term, with its typical (median) payment.
- Longer terms, bigger payments: r = 0.61 here, +0.335 on all 7 828 loans. Sales: “Lengthen the loans and the payments will rise.”
- Colour by product: inside **every** product the line **falls** — a longer term, a smaller payment. On all loans, inside the products r runs from −0.39 to −0.62.
- The product drives both: Auto loans are long **and** big. A third thing behind both is a confounder; a link that flips inside every group is Simpson's paradox.
- Round 2. Loans with more collection calls go bad more often. A manager: “Call less, and fewer loans will default.”
- Being late comes first: it brings the calls, and it leads to default. Calling less would leave the late loans alone — and probably raise the losses.
- Round 3. Bigger Auto loans, bigger payments: r = 0.90 on these 25 loans.
- A cause is shown by a mechanism (the pricing formula) or by an experiment (Week 7: change x at random, watch y). A correlation alone never shows it.
- Before you write “X drives Y”, ask the three questions under the picture.

### When r is fooled — curves, typos and Spearman's ranks

(Animated explanation)
When r is fooled
- Seven made-up dots on a perfect U: each y is x × x. Every y is fully decided by its x — and yet r = 0.
- Why? The left half falls and the right half rises. The pluses and the minuses of the corners cancel out exactly.
- So r = 0 means **no straight-line** link — not “no link”. Always look at the picture next to r.
- Sales say rich customers ask for bigger loans. On 13 162 applications with an income on file: r = 0.002.
- Another trap. Six loans on a neat rising line — but the sixth has a typo: 60.0. One wrong value, and r falls to 0.70.
- Drag the orange dot down, or tap **Fix the typo**: r jumps back to almost 1. One far-out value can drag Pearson's r a long way.
- Keep the typo, but replace each value by its **rank**: 1 for the smallest, 2, 3… The typo becomes just “the largest”, rank 6 — and the ranks lie on a perfect line.
- r on the ranks is Spearman's correlation: here 1.0. It asks only whether y keeps rising as x rises — straight or curved.
- Your turn.
- On real loans, principal is very skewed: many small loans, a few huge ones. Term against principal: Pearson 0.581, Spearman 0.713. For money columns, report Spearman next to Pearson.

### The line that misses least — slope, intercept and least squares

(Animated explanation)
Draw the best line
- Six Auto loans again. Lay a ruler through them: drag the two round ends of the teal line until it looks right to you.
- Each dashed line is what your line misses for one loan: the dot's payment y minus the line's payment ŷ (“y-hat”). It is called a residual.
- Square every miss — the orange squares. Big misses make huge squares. Their total is your line's score: smaller is better. Drag the ends and watch it.
- Exactly one line has the smallest total. Tap **Find the best line**: that is the least-squares line.
- Read it in words. The **slope**: 100 m more principal, and the line rises 4.44 m a month — 44.4 thousand soum per 1 m. We call the slope b.
- The **intercept** is where the line meets x = 0: −0.54 m, the “payment of a 0-soum loan”. No such loan exists — it only places the line. We call it a.
- Use the line.
- Two lines of arithmetic give the same line: the slope b = r × s_y ÷ s_x (s), and a = ȳ − b × x̄. So the line always passes through the average loan.
- All 391 Auto loans: slope 41.49 thousand soum per 1 m, intercept −12.1 thousand. Always say the slope with its units: “41 490 soum more a month for every extra 1 m lent”.
- A tip for the code: numpy takes **x first** — `np.polyfit(x, y, 1)`; Excel's `SLOPE` takes **y first**. Swap them and you get this: the principal explained by the payment — another line.

**Now check yourself.**

### What the line explains — R² and the residual plot

(Animated explanation)
What share does the line explain?
- Without any line, the best single guess for every payment is the average — the flat purple line. Square the dashed gaps and add them: 153.9, all the spread there is (SS_tot).
- Now the least-squares line. Its misses are much shorter: squared and added, only 31.6 — what is left after the line (SS_res).
- The line removed 1 − 31.6 ÷ 153.9 = 79 % of the spread. That share is R².
- With one x there is a shortcut: R² = r × r. Here 0.891² = 0.794. The sign drops out: r = −0.7 explains 49 %, just like +0.7.
- Your turn.
- All 391 Auto loans: R² = 0.797. The principal alone explains 79.7 % of the spread of the payments. What explains the other 20 %?
- Lay the line flat: plot each loan's **residual** against its principal — a residual plot. The purple 0 is the line itself.
- Colour by term: three bands. The 24-month loans sit 2.48 m above the line on average, the 48-month ones 1.95 m below. The line is missing the term.
- Look at the right end of the picture.
- One trap: the residuals of a least-squares line always average exactly 0 — over all 391 loans too. So “the average error is 0” proves nothing; look at the shape and the averages by group.

### One loan can tilt the line — outliers and leverage

(Animated explanation)
One loan pulls the line
- 25 real Auto loans and their least-squares line: slope 47.9 thousand soum per 1 m. A dashed grey copy stays where the line started.
- A typo: this loan's payment entered 12 m too high. It sits in the **middle** of the principals. Tap **Typo: +12 m** (or drag it): the line barely moves.
- Start again. The same typo on a loan at the **far right** (380.6 m): the slope jumps by about 18 %.
- Why? The line pivots round the average loan. A loan near it sits on the pivot; one far away works the line like a long lever. That distance is its leverage.
- Think with the cross.
- Check it: give the 50 m loan the same typo. The slope falls by about 20 % — the 50 m loan has the most leverage of all 25.
- A loan far from the line (a long dash) is an outlier. One whose removal moves the slope a lot is influential — it needs both.
- With many loans one lever matters less. All 391 Auto loans: the biggest (399.5 m) with its payment typed ten times too small moves the slope only from 41.49 to 40.55 — −2.3 %.
- A slope looks odd and you find that loan.

**Now play.** The same idea with sliders — try the challenges.

### A rule you can use — more predictors, and where the rule stops

(Animated explanation)
A rule, and where it stops
- One straight line through three fans: R² = 0.797. The residuals asked for the term.
- Give the model the term too. A fit with two x's — multiple regression — draws one line per term, all with one slope. R² rises to 0.961.
- Each coefficient is the change in y for one unit of its x **with the others held fixed**. Same term, 1 m more principal: +41 830 soum. Same principal, one month longer: −184 300 soum a month.
- To predict, put the loan's numbers in. A 300 m Auto loan over 36 months: 6 582 + 41.83 × 300 − 184.3 × 36 ≈ 12 496 thousand soum, 12.5 m a month.
- A tip for the homework: the computer finds a, b₁ and b₂ with `np.linalg.lstsq(X, y)`. X is a table: a column of 1s (for a), then one column per x.
- A yes / no column can join too: a dummy. Three terms need only **two** dummies; the term left out is the reference the others are compared with.
- Never put two copies of one number in. The requested amount and the principal have r = 1.000 — every loan was paid as asked. Together they make the coefficients meaningless: keep one.
- The Micro line was fitted on loans of 0.5 to 5 m — the thin strip on the left. Ask it about 300 m: 81.5 m a month. Real SME loans of about 300 m pay a median 16.0 m.
- Using a rule outside the range it has seen is extrapolation. A high R² inside the range says nothing outside it.

**Now check yourself.**

**Now check yourself.**

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

Every task has its own answer box, and the questions follow the order of section 1 — the concept is named in italics. The setup box just below loads everything the Python boxes need: `np`, `pd`, `stats`, the frames `loans`, `apps`, `cust` and `auto`, and the columns `pm` (principal, m soum), `pay_k` (payment, thousand soum) and `bad` — run it once before the first task (and again after you reload the page). Answer, check, then open the fold for the full working. (The notebook `data/python/week9/day1_starter.ipynb` holds the same tools; you need it for the homework.)

**First, press ▶ Run on this box once.** It loads the tools and the data that every Python box below uses.

```python
# the tools and the data from the full version of section 1 — run once
import numpy as np
import pandas as pd
from scipy import stats
loans = pd.read_csv("data/raw/loans.csv")
apps = pd.read_csv("data/raw/applications.csv")
cust = pd.read_csv("data/raw/customers.csv")
bad = loans["status"].isin(["default", "written_off"])
loans["bad"] = bad.astype(int)
loans["pm"] = loans["principal"] / 1e6
loans["pay_k"] = loans["monthly_payment"] / 1e3
auto = loans[loans["product_id"] == 4].copy()
x, y = auto["pm"], auto["pay_k"]
dx, dy = x - x.mean(), y - y.mean()
r = (dx * dy).sum() / np.sqrt((dx**2).sum() * (dy**2).sum())
a = apps.merge(cust[["customer_id", "monthly_income"]], on="customer_id")
a = a.dropna(subset=["monthly_income"])
x, y = loans["term_months"], loans["principal"]
x, y = auto["pm"], auto["pay_k"]
b = x.corr(y) * y.std() / x.std()
a = y.mean() - b * x.mean()
b, a = np.polyfit(auto["pm"], auto["pay_k"], 1)
auto["res"] = auto["pay_k"] - (a + b * auto["pm"])
x = auto["pm"]
y2 = auto["pay_k"].copy()
i = x.idxmax()
y2[i] = y2[i] / 10
X = np.column_stack([np.ones(len(auto)), auto["pm"], auto["term_months"]])
coef, *_ = np.linalg.lstsq(X, auto["pay_k"], rcond=None)
mb = loans[loans["product_id"].isin([1, 3]) & loans["term_months"].isin([3, 6])].copy()
mb["micro"] = (mb["product_id"] == 1).astype(int)
X = np.column_stack([np.ones(len(mb)), mb["pm"], mb["term_months"], mb["micro"]])
coef, *_ = np.linalg.lstsq(X, mb["pay_k"], rcond=None)
micro = loans[loans["product_id"] == 1]
print('ready')
```

**P1.** *(scatter plot)* BNPL loans carry 0 % interest, so the payment is the principal divided by the term (3, 6 or 12 months). What does their scatter of payment against principal look like?

**P2.** *(Pearson's r)* What is r between the principal and the payment for the 1 569 BNPL loans, to 3 decimals?

**P3.** *(correlation is not causation)* Loans with more collection calls go bad more often. A manager proposes fewer calls "to cut defaults". What is wrong?

**P4.** *(r = 0)* Join the loans to their customers' monthly income. On the loans with an income, what is r between income and principal, to 3 decimals? Print the row count too.

**P5.** *(Spearman)* For the BNPL loans, Spearman's correlation between principal and payment, to 3 decimals?

**P6.** *(correlation matrix)* In a matrix of application columns you see r = 1.000 between `requested_amount` and the loan's `principal`. What do you do before building a model?

**P7.** *(the least-squares line)* Micro loans: r = 0.8156, the principal's standard deviation is 1.3228 m soum, the payment's 440.51 thousand soum. What is the slope, in thousand soum per 1 m, to 1 decimal?

**P8.** *(fitting it)* Fit the BNPL line with `np.polyfit`. Print the slope and the intercept to 1 decimal.

**P9.** *(R²)* For BNPL, r = 0.662. What R², in %, to 1 decimal?

**P10.** *(residuals)* Residuals of the BNPL line from P8: what is the average residual of the 3-month loans, in thousand soum, to 1 decimal?

**P11.** *(leverage)* Repeat the Auto typo (the largest loan's payment divided by 10). By how many % does the slope change, to 1 decimal?

**P12.** *(several predictors)* For BNPL, fit payment ~ principal + term with `np.linalg.lstsq`. What is the term's coefficient, in thousand soum per month, to 1 decimal?

**P13.** *(a dummy)* Only the **6-month** Micro and BNPL loans: fit payment ~ principal + micro (micro = 1 for Micro). What is the micro coefficient, in thousand soum, to 1 decimal?

**P14.** *(extrapolation)* The Micro line (slope 271.6, intercept 0.7, thousand soum per 1 m) is used to price a 50 m Consumer loan. What would it say, and should anyone use it?

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

Graded on (20 points): (a) all five assert cells pass after *Restart & Run All* (2 points each, 10), (b) every function has a docstring in your words (2), (c) the Consumer numbers are right (4), (d) the three sentences give the rule, how well it fits, and where it must not be used (4).

**Check your numbers here before you hand in.**

**H1.** The Consumer line, payment (thousand soum) on principal (m soum): what is the slope, to 1 decimal?

**H2.** And its R², to 3 decimals?

**H3.** With payment ~ principal + term on the Consumer loans, what payment does the model give for a 30 m loan over 12 months, in thousand soum?

**H4.** Your three sentences for the affordability team (the last cell of the notebook) — write them here too.

### 📎 Hand in here

---

## 5. Self-check

Three questions, one at a time. Wrong? The explanation points to the part of section 1 to reread.

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

> 🎯 **Interview version.** *"How would you check whether a customer can afford a loan?"* — estimate the monthly payment (from the pricing engine, or a regression on past loans of the same product and term), divide by verified income (PTI) or add every other debt from the bureau (DTI), and compare with the policy cap and the regulator's limit. Then check that the ratio actually ranks risk on your own data, by product — on ours it does not.

**Say it like in an interview.** *"How would you check whether a customer can afford a loan, and what did you find on our book?"* — answer in 3–5 sentences.

Tomorrow: the outcome becomes a yes/no — good or bad — and a straight line stops working. Logistic regression turns a credit score into a probability of going bad, and the scorecard turns that probability back into points.

---

## Going further — the full version, with Python (optional, 60 min)

The same ideas as the stories, written out in full with Python and Excel, plus the correlation matrix, fitting with numpy, scipy and Excel, a product dummy in code, prediction against explanation, and the Depth notes (the annuity behind the fans, interactions, logs). Optional: nothing here counts toward the day.

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

### Pearson's correlation r — how close to a straight line

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

### Outliers and leverage

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

### Depth (optional)

- **Why the fans?** The annuity formula: payment = principal × r / (1 − (1 + r)^−n), with r the monthly rate and n the term. For one product and one term the factor is fixed, so payment is an exact line through 0. Across terms the factor changes, so the principal's effect *multiplies* with the term. A model that adds them can only approximate it.
- **Interactions.** `smf.ols("pay_k ~ pm * C(term_months)", data=auto)` gives each term its own slope (`pm:C(term_months)[T.36]` is the change in slope against 24 months). On the Micro–BNPL data, `pay_k ~ pm + pm:micro` with one term fixed recovers the interest exactly: R² = 1.000.
- **Logs.** `np.log(pay) ~ np.log(principal) + np.log(term)` turns a product into a sum; the principal's coefficient comes out close to 1 (the payment is proportional to the principal).
- **The slope's interval.** `fit.slope ± t₀.₉₇₅ · fit.stderr` (Week 6's t interval) — and the **prediction interval** for one new loan is much wider than the interval for the line itself, because one loan scatters around the line.
- *Russian terms:* диаграмма рассеяния = scatter plot, коэффициент корреляции Пирсона = Pearson's r, ранговая корреляция Спирмена = Spearman's rank correlation, ложная корреляция = spurious correlation, вмешивающаяся (скрытая) переменная = confounder, парадокс Симпсона = Simpson's paradox, линейная регрессия = linear regression, метод наименьших квадратов (МНК) = least squares, наклон / свободный член = slope / intercept, коэффициент детерминации R² = R², остатки = residuals, выброс = outlier, точка с большим рычагом = high-leverage point, мультиколлинеарность = multicollinearity, фиктивная переменная = dummy variable, экстраполяция = extrapolation.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak.


=====
PAGE: Week 9 · Day 2 — Logistic regression and the scorecard: from a score to a probability of going bad (weeks/week-09/day-2.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-09/day-2
=====

# Week 9 · Day 2 — Logistic regression and the scorecard: from a score to a probability of going bad

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 9.2 (due Day 4)</span> <span class="badge company">Company corner</span>

> STORY **Tuesday, 9:00.** Nilufar has yesterday's note on her desk and a new question. *"Good — you can read a relationship. Now the real one. The scorecard gives every applicant a number from 424 to 850. The committee does not approve numbers, it approves risk: **what is the chance that a 600 goes bad? And a 700?** And the contract prints a grade, A to D — does the grade tell the same story as the score? A straight line will not do it; going bad is a yes or a no."* Jasur, passing: *"Logistic regression. And when you have it, check that the probabilities come true — a model that says 2 % where 4 % go bad is worse than no model."*

## Today in 3 lines

- From yes/no to a number you can model: **probability, odds and log-odds**; why a **straight line fails** for a yes/no outcome (it predicts −3.3 % for a score of 850); the **logistic curve**, fitted by **maximum likelihood** in Python (statsmodels, or a few lines of numpy), judged by **log-loss**, and read as **odds ratios**.
- From the model to the business: **bad rate by score band** in SQL, the **scorecard** (points, base score, **PDO** — points to double the odds), **risk grades A–D as score bands**, **calibration** (predicted against actual), and the **3 % problem** — class imbalance.
- Nilufar's answer — **a 600 goes bad about 6.5 % of the time, a 700 about 1.9 %; the odds halve every 54 points** — and HW 9.2: the same model on the Consumer loans, with a calibration table (`data/python/week9/day2_starter.ipynb`).

---

## 1. Learn — from a score to a probability

Eight short stories. Each one tells **one idea in small steps**: read a sentence, watch the picture change, press **Next**. A dotted word shows its meaning when you tap it. Tired of reading? Press **▶ Play as a video**: the page reads every step aloud and moves the picture for you.

The Python for each idea, and the extra topics, are in **Going further — the full version** near the end of the page (optional).

### One chance, three rulers — probability, odds and log-odds

(Animated explanation)
Three ways to say one chance
- Four loans: 1 went bad, 3 did not. The **probability** of bad is the share: 1 of 4 = 25 %. We call it p.
- The **odds** compare the two outcomes instead: bad ÷ good = 1 ÷ 3 = 0.33 — “1 bad for every 3 good”. The second ruler shows them.
- A fair coin: 2 bad, 2 good. Probability 50 %, odds 1 — one to one.
- Your turn.
- Odds have no ceiling: 3 bad and 1 good give odds of 3; 99 bad and 1 good, 99. Probability stops at 100 %, odds run on to infinity.
- The third ruler takes the natural logarithm of the odds: the **log-odds**. Odds of 1 sit at 0; odds of 1 to 3 at −1.10.
- Drag the yellow marker, or tap the buttons. Probability lives between 0 and 1, odds between 0 and ∞, log-odds anywhere from −∞ to +∞ — the only ruler a straight line can run along forever.
- Nur's book: 234 bad of 7 828 loans. Probability 2.99 %, odds 0.0308 — 1 bad per 32.5 good — log-odds −3.48.
- Last one: from odds back to a probability.

### Yes or no on a ruler — why the straight line breaks

(Animated explanation)
A ruler through yes and no
- 16 toy loans by credit score. A loan that went bad sits at 1, at the top; a good one at 0, at the bottom. Low scores go bad more often.
- Yesterday's tool: the least-squares line through the 0s and 1s — the linear probability model. Read its height as a chance… and it leaves the band at both ends.
- Read the marker.
- Nur's 7 615 scored loans; each bubble is a score band's bad rate. The straight line says −3.3 % at 850 and reaches 0 at 760: above it, 6.7 % of the loans get a **negative** chance.
- And a line drops by the same 0.04 points per point of score everywhere. The bubbles fall fast at low scores and slowly at high ones. We need a curve that stays between 0 and 1.

### The S-curve — a straight line, bent into a probability

(Animated explanation)
A machine that bends a line
- A machine: put in any number z, from −∞ to +∞; out comes a chance between 0 and 1. At z = 0 it gives 50 %. It is the sigmoid.
- Move the marker: z = 2 gives 88 %, z = −2 gives 12 %, z = −4 only 1.8 %. However far you go, the curve never leaves 0 to 1.
- Read it backwards: z is the **log-odds** of the chance — the third ruler of the first story. Below, z on its own ruler is a straight line; the machine bends it into the S.
- So draw a **straight line** for z — z = β₀ + β₁ × score, with β₀, β₁ (“beta”) playing yesterday's a and b — and let the machine bend it. That is logistic regression.
- Nur's fitted curve. Above: the curve through the bands' bubbles. Below: the same thing in log-odds — a straight line, the bubbles close to it.
- A score of 600 → 6.45 %; a 700 → 1.86 %. Our loans live far down the S: the whole book sits near log-odds −3.5.
- Look at the two panels.

### The least surprised curve — maximum likelihood and log-loss

(Animated explanation)
The least surprised curve
- How do we find the best curve? Think of a weather app. It says 90 % rain and it rains: you are hardly surprised. It says 10 % and it rains: you are very surprised.
- We score a curve the same way: each loan's **surprise** is −ln of the chance the curve gave to what really happened. The bars under the picture show it, one per loan.
- Start flat: every loan gets the toy book's rate, 44 %. The average surprise is 0.685. That average is the log-loss.
- Bend the curve with the buttons. When it gives low scores a high chance and high scores a low one, most bars shrink — and the average surprise falls.
- Tap **Best fit**: the curve with the smallest average surprise, 0.436. Choosing the curve under which what happened is least surprising is maximum likelihood.
- A confident wrong answer costs the most: the two tall bars are the good loan at 500 and the bad loan at 640 — both against the curve's bet.
- How does the computer find it? It starts flat and steps downhill on the average surprise, a few times — Newton's method, the loop of the homework's `fit_logit`.
- On Nur's 7 615 scored loans the curve's average surprise is 0.1256, the flat line's 0.1322. Log-loss has no “good” value on its own: compare it with the flat line.
- Your turn.

### Every 54 points — odds ratios and the PDO

(Animated explanation)
Every 54 points, half the odds
- Two applicants: 600 and 700. Their chances of going bad: 6.45 % and 1.86 %. Their odds: 0.0690 and 0.0190.
- Divide the odds: 0.0190 ÷ 0.0690 = 0.275. 100 more points multiply the odds of going bad by 0.275 — about a quarter. That factor is an odds ratio.
- On the bottom panel the same 100 points are a fixed drop of the straight line: −1.29 in log-odds, anywhere along it. A fixed step in log-odds is a fixed **factor** on the odds.
- 50 points: the odds × 0.525, a little over half. One point: × 0.987.
- At 53.7 points the odds are exactly halved. Our scorecard's PDO is 53.7.
- Think in factors.
- Groups work the same way. Grade D's odds of going bad are 13.0 times grade A's; the ratio of their chances is 11.7. Close for rare events, never the same: say which one you mean.

**Now play.** The same idea with sliders — try the challenges.

### Bands and grades — the bad rate you can count

(Animated explanation)
Bubbles by band, grades by letter
- No model at all: cut the scores into bands of 40 points and count. Each bubble is one band at its bad rate; its size is its number of loans (above it).
- The bad rate falls in every band: 12.0 % below 560 down to 0.9 % at 720 and above. A rate that only ever falls is monotonic — the first check of any scorecard review.
- Always write the count next to a rate. The lowest band is 12 of 100: one more bad loan moves it a whole point. In the biggest band (2 095 loans), 0.05 points.
- Your turn.
- The logistic curve should pass close to every bubble: the bands are the model-free picture of it. Here it does.
- Nur's grades are score bands too: D below 600, C 600–659, B 660–719, A from 720. Their bad rates (the purple steps): 10.91, 5.12, 1.88 and 0.93 %.
- A grade throws detail away: 601 and 659 are both C, but the curve gives them 6.4 % and 3.1 %. Use the score near a boundary, the grade for reports.
- Find it on the picture.

### From log-odds to points — the scorecard's scale

(Animated explanation)
Points that double the odds
- A scorecard speaks in points. Pick a **base**: 600 points means good : bad odds of 50 to 1 — 50 good loans for every bad one.
- Pick the PDO: here 20. So 620 means 100 to 1, 640 means 200 to 1 — each 20 points, × 2.
- Your turn — use the ruler.
- The bottom ruler is ln(odds): every 20 points add the same 0.69 (that is ln 2). Points are just log-odds on a friendlier scale — stretched by a **factor**, shifted by an **offset**.
- That is why points **add up**: a scorecard gives each answer (an age band, an income band) its own points, and the sum is the score. Adding points is adding log-odds.
- Our score has its own scale, read off the fitted curve: 600 means 14.5 to 1, 700 means 52.7 to 1, and the odds double every 53.7 points.
- Last one.

### Do the chances come true? — calibration and the 3 % problem

(Animated explanation)
Do the chances come true?
- A model is calibrated when its chances come true. Check band by band: the bubble is what happened, the purple bar what the model predicted.
- 680–719: predicted 1.93 %, happened 1.94 %, on 2 059 loans — spot on. The big bands are close.
- 560–599 runs hot: 10.8 % happened against 8.0 % predicted — on only 231 loans. Flag it and watch it.
- In total, the average prediction equals the bad rate exactly: 2.93 %. A logistic regression always does that on the loans it was fitted on — so it proves nothing. Check by band, on **new** loans.
- Your turn.
- Now the 3 % problem. In 100 of our loans, about 3 go bad. A “model” that says **everyone is good** is right 97 times in 100.
- Its accuracy on our scored loans: 97.07 % — and it catches no bad loan at all. With a rare outcome, accuracy rewards doing nothing.
- And a 50 % cut-off flags nobody: the riskiest scored applicant (424 points) has a chance of only 40 %. Where to cut is a business decision about cost (Day 4), not 50 %.
- A vendor brings a model.

**Now check yourself.**

**Now check yourself.**

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

**Step 9 — calibration.** In the 600–639 band the model predicts 5.03 %, 4.20 % happened (1 356 loans); in 680–719, 1.93 % against 1.94 % (2 059 loans). Good enough to quote, with the 560–599 band flagged: 8.0 % predicted, 10.8 % happened (231 loans).

**Step 10 — the answer, with the caveat.** *"A 600 goes bad about 6.5 % of the time, a 700 about 1.9 % — 3.5 times less. Every 54 points halves the odds. Grades agree in order, but within a grade the score matters: C runs from 6.5 % at 600 to 3.1 % at 659. These are PDs for loans like the ones we approved in 2024–2026, measured as 'ever defaulted or written off so far'; tomorrow I check how well the score ranks, and on Thursday where the cut-off should be."*

---

## 3. Practice (50 min)

Every task has its own answer box, and the questions follow the order of section 1 — the concept is named in italics. The setup box just below loads everything the Python boxes need: `np`, `pd`, `df` (all loans with their score), `S` (the scored loans, with their score `band` and the model's `pd`), `sigmoid`, `b0` and `b1` — run it once before the first task (and again after you reload the page). SQL boxes run on your practice copy of the database. (The notebook `data/python/week9/day2_starter.ipynb` holds the same tools; you need it for the homework.)

**First, press ▶ Run on this box once.** It loads the tools and the data that every Python box below uses.

```python
# the tools and the data from the full version of section 1 — run once
import numpy as np
import pandas as pd
loans = pd.read_csv("data/raw/loans.csv")
apps = pd.read_csv("data/raw/applications.csv")
bad = loans["status"].isin(["default", "written_off"])
loans["bad"] = bad.astype(int)
cols = ["application_id", "credit_score"]
df = loans.merge(apps[cols], on="application_id")
S = df.dropna(subset=["credit_score"]).copy()
b, a = np.polyfit(S["credit_score"], S["bad"], 1)
def sigmoid(z):
    return 1 / (1 + np.exp(-z))
for z in (-4, -2, 0, 2, 4):
    print(z, round(sigmoid(z), 3))
import statsmodels.api as sm
X = sm.add_constant(S["credit_score"])
fit = sm.Logit(S["bad"], X).fit(disp=0)
b0, b1 = fit.params
import statsmodels.formula.api as smf
bins = [0, 560, 600, 640, 680, 720, 1000]
S["band"] = pd.cut(S["credit_score"], bins, right=False)
S["pd"] = sigmoid(b0 + b1 * S["credit_score"])
print('ready')
```

**P1.** *(odds and log-odds)* Grade C: 116 bad loans among 2 264. What are the log-odds of bad, to 2 decimals?

**P2.** *(why a straight line fails)* Fit the linear probability model on the scored loans (`np.polyfit` of `bad` on `credit_score`). What share of the scored loans gets a **negative** "probability", in %, to 1 decimal?

**P3.** *(the logistic curve)* With β₀ = 5.0677 and β₁ = −0.012903, what is the PD of a score of 560, in %, to 1 decimal?

**P4.** *(fitting it)* Fit `smf.logit("bad ~ credit_score", data=S)`. Print the slope to 6 decimals and McFadden's pseudo-R² (`fit.prsquared`) to 3 decimals.

**P5.** *(odds ratio)* Grade D has odds of 37 / 302, grade A 17 / 1 804. What is D's odds ratio against A, to 1 decimal?

**P6.** *(bad rate by band)* Bad rate by **channel**: one row per channel with loans, bads and the bad rate in % to 2 decimals, the riskiest first.

**P7.** *(the scorecard)* Our score's PDO is 53.7 points and a 600 has good:bad odds of 14.5. Roughly what good:bad odds does a 707 have (two PDOs higher)?

**P8.** *(risk grades)* A loan has a score of 599. What grade does Nur print, and what does that say about grade boundaries?

**P9.** *(calibration)* Average predicted PD and actual bad rate for grade **C** (scored loans), in %. Print both to 2 decimals.

**P10.** *(class imbalance)* A model flags a loan as "bad" when its PD is above 5 %. On the scored loans, how many loans does it flag, and what share of all bad loans are among them (in %, to 1 decimal)?

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

**H2.** The logistic regression of bad on credit_score, Consumer loans only: what PD does it give for a score of **600**, in %, to 2 decimals?

**H3.** And for **700**, in %, to 2 decimals?

**H4.** Your three sentences for Nilufar (the last cell of the notebook) — write them here too.

### 📎 Hand in here

---

## 5. Self-check

Three questions, one at a time. Wrong? The explanation points to the part of section 1 to reread.

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

> 🎯 **Interview version.** *"How do you turn a logistic regression into a scorecard?"* — fit log-odds of bad on WoE-coded characteristics; choose a base score, base odds and PDO; factor = PDO / ln 2, offset = base score − factor × ln(base odds); each attribute's points are −factor × β × WoE (plus its share of the offset), and the score is the sum. Then say how you would validate it: ranking, calibration, stability, out of time.

**Say it like in an interview.** *"How do you turn a logistic regression into a scorecard, and how would you know it still works?"* — answer in 3–5 sentences.

Tomorrow: Nilufar's first question — does the scorecard still work? — measured: the confusion matrix, the ROC curve, AUC, Gini and KS, and how our two-year-old score compares with what application scorecards usually reach.

---

## Going further — the full version, with Python (optional, 60 min)

The same ideas as the stories, written out in full with Python and SQL: the fits with statsmodels and with numpy (Newton's method), the log-loss by hand, the grade dummies, the band query, the scorecard's scaling, the calibration table, and the Depth notes (weight of evidence, information value, reject inference). Optional: nothing here counts toward the day.

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

### The logistic curve

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

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak.


=====
PAGE: Week 9 · Day 3 — Is the scorecard any good? ROC, AUC, Gini, KS and lift (weeks/week-09/day-3.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-09/day-3
=====

# Week 9 · Day 3 — Is the scorecard any good? ROC, AUC, Gini, KS and lift

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 9.3 (due Day 5)</span> <span class="badge company">Company corner</span>

> STORY **Wednesday, 9:00.** Nilufar has the scorecard's build report on her desk, dated October 2024, with a coffee ring on the cover. *"Two years, 7 828 loans and 234 bads later — does this score still separate good borrowers from bad ones, or are we approving on a number that has gone stale? I need one page: how well does it rank, is that normal for an application scorecard, and is it worse on the new loans?"* Jasur, from the doorway: *"Give her the ROC curve and the KS, and split it by year. And please don't tell her the accuracy."*

## Today in 3 lines

- A scorecard is judged on how it **ranks**. At one cut-off: the **confusion matrix** (bads caught, goods turned away), **TPR** and **FPR** — and why **accuracy** misleads when only 3 % go bad. Across every cut-off: the **ROC curve** and its area, the **AUC** (the chance a random good scores above a random bad), **Gini** = 2·AUC − 1, the **KS** (the widest gap between the bads' and goods' cumulative curves), and **lift and gains** for the worst-scored loans.
- You compute each one on Nur's 7 615 scored loans, in Python (by ranks, with numpy and scipy) and in SQL (from a table of counts per score); you compare the score with the risk grade and validate **out of time** on the loans made after the scorecard's first year.
- Nilufar's answer: **AUC 0.689, Gini 0.377, KS 0.34 at a score of 658; the worst 10 % of scores hold 25 % of the bads.** The score still ranks, but below the 0.4–0.6 usual for an application scorecard. HW 9.3 splits it by product and year in `data/python/week9/day3_starter.ipynb`.

---

## 1. Learn — judging a ranking

Eight short stories. Each one tells **one idea in small steps**: read a sentence, watch the picture change, press **Next**. A dotted word shows its meaning when you tap it. Tired of reading? Press **▶ Play as a video**: the page reads every step aloud and moves the picture for you.

The Python for each idea, and the extra topics, are in **Going further — the full version** near the end of the page (optional).

### What a scorecard is for — bads at the bottom

(Animated explanation)
What a scorecard is for
- Here are 20 toy loans, placed by their **credit score**: low on the left, high on the right. 15 were paid as agreed; 5 went bad.
- A scorecard gives every applicant one number before the loan. Its whole job: put the bads low and the goods high.
- At Nur a loan is **bad** when it ended in `default` or `written_off`; every other loan is good. The bad is the positive class: the thing we try to catch.
- Look at the dots first.
- Now Nur's real 7 615 scored loans, in six score bands. The bad rate falls from 12.0 % below 560 to 0.9 % at 720 and above: the score ranks.
- Altogether 223 of the 7 615 loans went bad: 2.93 %, about 3 in 100. 213 loans have no score, so always name the group: “223 bads among 7 615 scored loans”.
- One warning before any number: a loan made last month has had no time to go bad. Young loans look good because they are young — say how old the loans are.
- Last one.

### One line, four kinds of loan — the confusion matrix, TPR and FPR

(Animated explanation)
One line, four kinds of loan
- To decide, Nur draws a line: approve 620 and above, decline below. That line is the cut-off.
- Now every loan lands in one of four boxes. Declined and bad: caught (3). Declined but good: turned away (2). Approved and bad: **missed** (2). Approved and good: fine (13).
- This 2 × 2 table is the confusion matrix. Its cells have nicknames: TP (caught), FP (turned away), FN (missed), TN (fine).
- Your turn.
- Counts are hard to compare, so turn them into shares. The share of **all bads** the line catches: 3 of 5 = 60 %. Its nickname: TPR.
- The price: the share of **all goods** the line turns away, 2 of 15 = 13 %. Its nickname: FPR.
- Mind the bottoms of the fractions: TPR divides by the bads (5), FPR by the goods (15). Each group is judged against itself.
- Nur's real loans with the line at 640. Bars above the line: the bads' scores; below: the goods'. Declined: 94 of 223 bads and 1 593 of 7 392 goods.
- 21.6 % sounds small, yet it is 1 593 people — seventeen times the 94 bads caught. Say the counts together with the rates.
- Drag the line, or tap **−20** / **+20**. Both rates move together: catch more bads, and you turn away more goods.
- Last one.

### The 97 % trap — why accuracy misleads

(Animated explanation)
The 97 % trap
- 100 loans, as Nur makes them: about 3 go bad (2.93 %) and 97 are paid.
- A lazy rule: **approve everyone**. It is right about every good loan, 97 of 100. The share of right decisions is called accuracy: 97 %.
- And it catches **no bad at all**: all 3 slip through.
- Now a real line, like Nur's at 640. It declines 1 of the 3 bads — and 21 goods with it (in the dashed frames).
- Right decisions now: the 1 bad caught plus the 76 goods approved, 77 of 100. Accuracy 77 % — lower than approving everyone!
- Think before you answer.
- Nur's real loans tell the same story: the line at 640 is right 77.4 % of the time, approving everyone 97.07 %.
- So a scorecard is never judged by accuracy. At one line: TPR and FPR. For the whole ranking: one number that does not depend on any line — next story.

### Every line at once — the ROC curve

(Animated explanation)
Every line at once — the ROC curve
- Each line gives two numbers: goods turned away (FPR, across) and bads caught (TPR, up). Below every score nobody is declined: the dot sits at (0, 0).
- Move the line up 10 points at a time (tap **+10**). A bad crosses: the dot steps **up** by 1/5. A good crosses: it steps **right** by 1/15.
- Tap **Sweep**: the line slides from the lowest score to the top, and the dot leaves a path. That path is the ROC curve.
- At the top everyone is declined: all bads caught, all goods turned away — the corner (1, 1).
- A score that knows nothing — a coin toss — declines bads and goods at the same rate. Its path runs along the dashed diagonal.
- Your turn.
- Nur's real score, every possible line at once. At 640 the dot sits at (21.6 %, 42.2 %).
- At 600: 294 goods and 37 bads declined. Always in this order: goods turned away across, bads caught up.
- Drag the line: the dot runs along the curve. It stays above the diagonal everywhere — at every line the score beats a coin.
- The ROC curve shows ranking only. It says nothing about money — and a bad costs far more than a good earns. Day 4 puts the line in soum.

**Now play.** The same idea with sliders — try the challenges.

### A good against a bad — AUC and Gini

(Animated explanation)
A good against a bad — AUC and Gini
- A game: pick one good loan and one bad loan at random. Which one has the higher score? Tap **Draw a pair** a few times.
- Blue arc: the good one is higher — the score was right. Orange: the bad one is higher. Draw many pairs and watch the share.
- With 15 goods and 5 bads there are exactly 75 pairs. The good one is higher in 60 of them: 0.80.
- That share is the AUC, because it equals the shaded area under the ROC curve: 0.800.
- Check the idea.
- Nur's real score: 7 392 goods × 223 bads = 1 648 416 pairs. Draw pairs: the share settles near 68.9 % — the shaded area. A tie counts half.
- Counting every pair without drawing: for each good, count the bads **below** its score (a bad on the same score counts half), add it all up, divide by all pairs. SQL does it this way, from a table of counts per score.
- Banks rescale it as the Gini: a coin toss gets 0, a perfect score 1, Nur's score 0.377.
- An application scorecard often reaches 0.4–0.6 (the shaded band). Nur's 0.377 is far better than a coin and a little below the usual.
- Your turn.
- Direction matters. A tool that expects **high = bad**, given our score (high = good), reports 1 − 0.689 = 0.311 — the score read backwards. In Python pass `-s`: `roc_auc_score(y, -s)`.
- The homework's way: number the 20 loans from the lowest score, 1 to 20 — their ranks. Add the goods' ranks, subtract the smallest sum they could have: 60, the pairs the goods win.

**Now check yourself.**

### The widest gap — KS

(Animated explanation)
The widest gap — KS
- Same 20 loans, a new picture. For every score: what share of the bads score this or lower, and what share of the goods. Two cumulative curves.
- At 610 or lower: 3 of 5 bads (60 %) but only 2 of 15 goods (13 %). The two curves are 47 points apart.
- Slide along and the gap changes. It is widest at 640: 80 % of the bads against 27 % of the goods — 53 points.
- That widest gap is the KS. Written as a share: 0.53.
- Nur's real loans: the gap is widest at 658. 65.9 % of the bads score 658 or lower, against 32.0 % of the goods: KS = 0.34.
- Drag the line: everywhere else the gap is smaller — 20.6 points at 639 or lower, 26.0 at 679 or lower.
- On the ROC square the same gap is the curve's greatest height above the diagonal: the largest TPR − FPR.
- Report KS with the score where it is reached: “0.34 at 658”. Whether 658 is also a good line in soum is Day 4's question.
- Last one.

### Where are the bads? — lift and gains

(Animated explanation)
Where are the bads? — lift and gains
- Sort all 7 615 loans from the worst score to the best and deal them into 10 equal piles of about 762: deciles. Each bar is one pile's bad rate.
- The dashed line is the average, 2.93 %. The worst pile goes bad at 7.35 %, the best at 0.79 %.
- The worst pile holds 56 of the 223 bads: 25.1 %. That share is its gain.
- It is 10 % of the loans but holds 25.1 % of the bads: 2.51 times its fair share. That is its lift.
- Check the idea.
- Add the piles one by one: the gains chart. The worst 30 % hold 58.7 % of the bads; a coin toss would give 30 %, the diagonal.
- Read it off the curve.
- One detail for the homework: many loans share a score, so sort by the score **and** the loan id. Then the piles come out the same on every run.

### Does it still work? — grade, time and segments

(Animated explanation)
Does it still work?
- Nur's risk grade is the score in four bands. Same loans, same bads — and the grade's Gini is 0.396, above the score's 0.377!
- The bad rate falls in clean steps at the grade edges. But **inside** B and C a higher score does not mean fewer bads (6.6 % at 650–659, 1.4 % at 660–669): the fine detail only shuffles the ranking.
- Your turn.
- A score looks best on the loans it was built on. Out-of-time validation: it was built in 2024, so 2025–26 loans are out of time. Gini 0.415 → 0.365.
- With only 68 and 155 bads every Gini is shaky, so each gets a bootstrap interval (Week 6): resample the loans 1 000 times and keep the middle 95 %. The two intervals overlap almost completely.
- Decide.
- Mind the age: many 2026 loans have not had time to go bad yet. A Gini on young loans measures who went bad *fast* — compare vintages at the same age, or wait.
- The homework splits the same measures by product and by year: one row per group with its loans, bads, AUC, Gini and KS. Next to every Gini, say how many bads stand behind it.
- Nilufar's page in one line: the score still ranks — clearly better than a coin, a little below the usual 0.4–0.6, with no clear fall yet on the new loans.

**Now check yourself.**

**Now check yourself.**

## 2. Worked example — one page for Nilufar (15 min)

**Step 1 — bad and good.** Bad = `default` or `written_off`. 234 of 7 828 loans; on the 7 615 with a score, **223 bads (2.93 %)**. The 213 unscored loans are left out and named.

**Step 2 — one cut-off, as a confusion matrix.** At 640 the score would have declined 94 bads and 1 593 goods: **TPR 42.2 %, FPR 21.6 %**. Accuracy is not reported — "approve everyone" would win it with 97.1 %.

**Step 3 — every cut-off: the ROC curve and its area.** The curve stays above the diagonal everywhere. **AUC 0.689**: in 69 of 100 good–bad pairs the good loan has the higher score. **Gini 0.377**, below the 0.4–0.6 that application scorecards often reach.

**Step 4 — KS.** The cumulative curves are furthest apart at **658: KS 0.34** (65.9 % of bads, 32.0 % of goods at or below it).

**Step 5 — lift.** The worst 10 % of scores (424–615) hold **25.1 % of the bads**, a lift of 2.51.

**Step 6 — score against grade.** The four grades rank slightly better (Gini 0.396 on the same loans): inside grades B and C, the finer score adds nothing.

**Step 7 — out of time.** 2024 loans: Gini 0.415 (0.28–0.54); 2025–26 loans: 0.365 (0.28–0.45). Lower, within noise.

**Step 8 — the page, answer first.** *"The application score still ranks risk: AUC 0.689, Gini 0.377, KS 0.34 at 658, and the worst tenth of scores holds a quarter of the bads. That is below the 0.4–0.6 usual for an application scorecard. On loans made since 2024 the Gini is 0.37 against 0.42, a fall we cannot yet tell from noise (155 bads). Inside grades B and C a higher score does not mean a lower risk. Recommendation: keep it, monitor the Gini and the population every month, and start a rebuild review in which the grade bands, not the raw score, are the benchmark to beat."*

---

## 3. Practice (50 min)

Every task has its own answer box, and the questions follow the order of section 1 — the concept is named in italics. The setup box just below loads everything the Python boxes need: `np`, `pd`, `plt`, `stats`, the frames `L` and `S`, the arrays `s` and `y` and the function `gini_of` — run it once before the first task (and again after you reload the page). Answer, check, then open the fold for the full working. (The notebook `data/python/week9/day3_starter.ipynb` holds the same tools; you need it for the homework.)

**First, press ▶ Run on this box once.** It loads the tools and the data that every Python box below uses.

```python
# the tools and the data from the full version of section 1 — run once
import sqlite3
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy import stats
con = sqlite3.connect("data/raw/nur.db")
L = pd.read_sql("""
SELECT l.loan_id, l.disbursed_at, l.risk_grade, l.status,
       p.code AS product, a.credit_score AS score,
       CASE WHEN l.status IN ('default', 'written_off')
            THEN 1 ELSE 0 END AS bad
FROM loans l
JOIN applications a ON a.application_id = l.application_id
JOIN products p ON p.product_id = l.product_id""", con)
S = L.dropna(subset=["score"])
s, y = S["score"].to_numpy(), S["bad"].to_numpy()
cut = 640
TP = ((s < cut) & (y == 1)).sum()
FP = ((s < cut) & (y == 0)).sum()
FN = ((s >= cut) & (y == 1)).sum()
TN = ((s >= cut) & (y == 0)).sum()
tpr = TP / (TP + FN)
fpr = FP / (FP + TN)
cuts = np.arange(s.min(), s.max() + 2)
tpr_all = np.array([(s[y == 1] < c).mean() for c in cuts])
fpr_all = np.array([(s[y == 0] < c).mean() for c in cuts])
r = stats.rankdata(s)
xs = np.unique(s)
cum_bad = np.array([(s[y == 1] <= x).mean() for x in xs])
cum_good = np.array([(s[y == 0] <= x).mean() for x in xs])
gap = cum_bad - cum_good
def gini_of(x, y):
    r = stats.rankdata(x)
    nb, ng = y.sum(), (y == 0).sum()
    return 2 * (r[y == 0].sum() - ng * (ng + 1) / 2) / (ng * nb) - 1
g = S["risk_grade"].map({"A": 4, "B": 3, "C": 2, "D": 1}).to_numpy()
yr = S["disbursed_at"].str[:4]
rng = np.random.default_rng(2026)
for name, d in [("2024", S[yr == "2024"]), ("2025-26", S[yr != "2024"])]:
    x, b = d["score"].to_numpy(), d["bad"].to_numpy()
    boot = []
    for _ in range(1000):
        i = rng.integers(0, len(x), len(x))
        boot.append(gini_of(x[i], b[i]))
    lo, hi = np.percentile(boot, [2.5, 97.5])
    print(name, len(x), b.sum(), round(gini_of(x, b), 3), round(lo, 2), round(hi, 2))
print('ready')
```

**P1.** *(bad and good)* Of the 223 bads with a score, how many are `written_off` (the rest are `default`)?

**P2.** *(the confusion matrix)* Write the SQL that returns the four counts at the cut-off **620**: one row per decision (`declined` / `approved`) with its bads and goods.

**P3.** *(TPR and FPR)* Write `rates(cut)` that returns (TPR, FPR) for "decline below cut". Print the TPR at **680**, in %, to 1 decimal.

**P4.** *(accuracy)* What is the accuracy of the cut-off **560**, in %, to 2 decimals? Is it better or worse than "approve everyone"?

**P5.** *(the ROC curve)* Draw the ROC curve and mark the three grade edges (cut-offs 600, 660, 720) as dots. What is the FPR at **660**, in %, to 2 decimals?

**P6.** *(AUC)* Check the AUC by its definition: compare **every** good score with **every** bad score (1 648 416 pairs) with numpy broadcasting, a tie counting half. Print it to 3 decimals.

**P7.** *(Gini)* Give the 213 unscored loans the **worst** possible score (0) and compute the Gini on all 7 828 loans. Then give them the **best** (900). To 3 decimals, the "worst" version?

**P8.** *(KS)* Compute the KS of the **grade** (A = 4 … D = 1) the same way as the score's. Which is larger?

**P9.** *(lift and gains)* Build the gains table in pandas: sort by score, cut into ten deciles with `pd.qcut(S["score"].rank(method="first"), 10, labels=False)`, then the share of all bads in the worst **two** deciles, in %, to 1 decimal.

**P10.** *(AUC in SQL)* Take the SQL of "AUC and KS in SQL" (in Going further, near the end of the page) and group by the **six score bands** (<560, 560–599, 600–639, 640–679, 680–719, 720+) instead of the score. What AUC does the band table give, to 3 decimals?

**P11.** *(score or grade)* The grade has only four values. What share of all good–bad pairs are **ties** on the grade (same grade), in %, to 1 decimal?

**P12.** *(out-of-time validation)* Bootstrap the **difference** Gini(2024) − Gini(2025–26): 1 000 resamples of each group with `np.random.default_rng(2026)`. What share of the differences is 0 or less, in %, to 1 decimal?

### Mistakes people make

- Reporting **accuracy** for a scorecard: with 3 % bads, "approve everyone" scores 97 %.
- The AUC read **backwards**: `roc_auc_score(y, s)` with "high = good" gives 0.311; use `-s`, or say which way the score runs.
- A Gini **without its population**: 0.377 on the scored loans, 0.371 with the unscored ones put last, 0.330 with them put first.
- KS quoted without the score where it is reached, or as if it were a cut-off already tested in money.
- Comparing the score's Gini on one set of loans with the grade's on another.
- Judging a new vintage's Gini before its loans have had time to go bad.
- An out-of-time drop called a "fall" without its interval: with 155 bads, ± 0.08 is normal noise.
- Lift computed on deciles with unstable ties: sort by the score **and** a key (`loan_id`).

---

## 4. Homework <span class="badge hw">HW 9.3 — Due Day 5</span>

**The validation pack.** Open `data/python/week9/day3_starter.ipynb`. Six functions are stubs that raise `NotImplementedError`; under each is an assert cell that checks your result without showing it. Replace each body until its assert cell runs silently, run the two tables at the end (by product and by year), write the five sentences for Nilufar in the last cell, then **Kernel → Restart & Run All** and hand in the executed notebook with the 📎 box below.

1. `confusion_at(score, bad, cut)` — (TP, FP, FN, TN) for "decline below cut".
2. `roc_points(score, bad)` — the arrays FPR and TPR over every cut-off.
3. `auc_by_ranks(score, bad)` — the AUC from ranks, a tie counted half.
4. `ks_stat(score, bad)` — the KS and the score where it is reached.
5. `gains_table(frame, groups=10)` — loans, bads, gain and lift per decile (ties broken by `loan_id`).
6. `validation_table(frame, by)` — loans, bads, AUC, Gini and KS for each value of a column; run it by `product` and by year of disbursal.

Graded on (20 points): (a) the six assert cells pass after *Restart & Run All* (2 points each, 12), (b) every function has a docstring in your words (2), (c) the two tables are printed (2), (d) the five sentences give the Gini, the KS with its score, the weakest product, the out-of-time picture and one recommendation (4).

**Check your results here before you hand in:**

**H1.** In your table by product, what is the Gini of the score for **MICRO** loans, to 3 decimals?

**H2.** Which product has the **lowest** Gini?

**H3.** In your table by year, what is the Gini of the loans disbursed in **2025**, to 3 decimals?

**H4.** Your five sentences for Nilufar (the last cell of the notebook) — write them here too.

### 📎 Hand in here

---

## 5. Self-check

Three questions, one at a time. Wrong? The explanation points to the part of section 1 to reread.

---

## 6. Company corner <span class="badge company">Who validates a scorecard</span>

A bank does not let the people who built a model be the only ones to judge it. **Model validation** (*валидация моделей*) is an independent check, repeated at least once a year and whenever something big changes. A validator asks three questions, in this order:

- **Does it rank?** — discrimination: Gini, KS, the ROC curve, in time and out of time, by segment (today).
- **Does it predict the right level?** — calibration: predicted PD against the actual bad rate per band (Day 2).
- **Is it stable?** — the population it scores today against the one it was built on: PSI and CSI (Day 4).

The answers go into a **validation report** with a traffic light for each test and an owner for each finding. Typical findings: a Gini that fell by more than an agreed margin, a segment where the score does not work (our SME), a population shift, overrides that ignore the score. A red light can mean recalibrating (shift the PD levels), redeveloping (a new scorecard) or restricting the score's use to the segments where it still works.

In larger banks this is formal **model risk management**: a register of every model, its owner, its last validation date and its limits. Lenders that use internal models for regulatory capital (the Basel IRB approach) must show regulators this cycle; a lender like Nur needs it for itself, because a cut-off on a broken score approves the wrong people quietly.

Match the validator's question to the test:

> 🎯 **Interview version.** *"How do you evaluate a credit scorecard?"* — Three questions: does it rank (Gini or AUC, KS, the ROC curve, out of time and by segment), does it predict the right level (calibration by band), is it stable (PSI). Never accuracy: with 3 % bads it rewards approving everyone. Give numbers: "on our application score, Gini 0.38 and KS 0.34 at 658 — below the usual 0.4–0.6, with no clear fall out of time".

**Say it like in an interview.** *"How would you check whether our two-year-old scorecard still works?"* — answer in 3–5 sentences.

Tomorrow: the score ranks — so where should the line go? The cut-off in soum, with W8D2's unit economics, and the monthly view that tells Nilufar when the population has moved (PSI).

---

## Going further — the full version, with Python (optional, 60 min)

The same ideas as the stories, written out in full with Python and SQL: the band table, the confusion matrix and its rates, the ROC curve, the AUC by ranks and by trapezoids, Gini, KS, the gains table, AUC and KS in SQL from counts per score, score against grade, and the out-of-time bootstrap. Optional: nothing here counts toward the day.

Press ▶ Run on this first box once. It loads every scored loan with its bad flag; every later box on this page, and every Practice box, reuses it.

```python
import sqlite3
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy import stats

con = sqlite3.connect("data/raw/nur.db")
L = pd.read_sql("""
SELECT l.loan_id, l.disbursed_at, l.risk_grade, l.status,
       p.code AS product, a.credit_score AS score,
       CASE WHEN l.status IN ('default', 'written_off')
            THEN 1 ELSE 0 END AS bad
FROM loans l
JOIN applications a ON a.application_id = l.application_id
JOIN products p ON p.product_id = l.product_id""", con)
# 213 loans have no score: today's numbers are about the 7 615 that do
S = L.dropna(subset=["score"])
s, y = S["score"].to_numpy(), S["bad"].to_numpy()
# 7828 234 7615 223
print(len(L), L.bad.sum(), len(S), y.sum())
```

### Bad, good and what a scorecard is for

**What it is.** A **scorecard** (*скоринговая карта*) gives each applicant a **score**: the higher the score, the lower the chance the loan goes **bad**. At Nur a loan is **bad** when its status is `default` or `written_off`; every other loan (active or closed) is **good**. The bad is the **positive** class — the event the score tries to catch. Judging a scorecard means judging its **ranking**: do the bads sit at the bottom of the list?

**How to write it.** A bad rate per score band shows the ranking at a glance.

```sql
SELECT CASE WHEN a.credit_score < 560 THEN '1: <560'
            WHEN a.credit_score < 600 THEN '2: 560-599'
            WHEN a.credit_score < 640 THEN '3: 600-639'
            WHEN a.credit_score < 680 THEN '4: 640-679'
            WHEN a.credit_score < 720 THEN '5: 680-719'
            ELSE '6: 720+' END AS band,
       COUNT(*) AS loans,
       SUM(l.status IN ('default', 'written_off')) AS bads,
       ROUND(100.0 * SUM(l.status IN ('default', 'written_off'))
             / COUNT(*), 2) AS bad_rate
FROM loans l
JOIN applications a ON a.application_id = l.application_id
WHERE a.credit_score IS NOT NULL
GROUP BY band ORDER BY band;
```

The bad rate falls from 12.0 % below 560 (12 of 100 loans) to 0.9 % at 720 and above (16 of 1 774): the score ranks. Today puts one number on *how well*.

**When you use it.**
- Every validation opens with the definition of bad and the count: "223 bads among 7 615 scored loans".
- The band table is the first picture for a risk committee; the summary numbers come after it.

> ⚠️ **Watch out.** A loan disbursed last month has had no time to go bad. Young loans look good because they are young — say how old the loans are before you compare groups (the out-of-time subsection below).

**Your turn.** What share of the 7 615 scored loans is bad, in %, to 2 decimals?

### The confusion matrix at one cut-off

**What it is.** A **cut-off** (*порог отсечения*) turns the score into a decision: approve a score of c or more, decline below c. The **confusion matrix** (*матрица ошибок*) crosses that decision with what really happened. With the bad as the positive class it has four cells:

```text
              bad          good
declined   TP: caught   FP: turned away
approved   FN: missed   TN: approved ok
```

**How to write it.** The cut-off 640: decline every score below 640.

```python
cut = 640
TP = ((s < cut) & (y == 1)).sum()
FP = ((s < cut) & (y == 0)).sum()
FN = ((s >= cut) & (y == 1)).sum()
TN = ((s >= cut) & (y == 0)).sum()
# 94 1593 129 5799
print(TP, FP, FN, TN)
```

At 640 the score declines 94 of the 223 bads and 1 593 of the 7 392 goods; 129 bads still get a loan.

**When you use it.**
- Any "what if we declined below c?" question: one cut-off, four counts.
- Talking to the business: "we would have avoided 94 bad loans and turned away 1 593 good customers".

> ⚠️ **Watch out.** These are loans Nur already made. The applicants Nur rejected are not in `loans`, so the matrix can only show what a *tighter* cut-off would have done (Day 4: swap-in and swap-out).

**Your turn.** At the cut-off 600, how many bads would have been declined (TP)?

### TPR and FPR — two rates from the matrix

**What it is.** Two rates turn the counts into shares of each group. The **true positive rate**, **TPR** (*доля истинно положительных*; also sensitivity or recall), is the share of all bads that the cut-off declines. The **false positive rate**, **FPR** (*доля ложноположительных*), is the share of all goods that it declines too.

**How to write it.**

```text
TPR = TP / (TP + FN)   bads caught
FPR = FP / (FP + TN)   goods turned away
```

```python
tpr = TP / (TP + FN)
fpr = FP / (FP + TN)
# 0.4215 0.2155
print(round(tpr, 4), round(fpr, 4))
```

At 640 the score catches 42.2 % of the bads and turns away 21.6 % of the goods.

**When you use it.**

| Rate | Formula | At 640 |
|---|---|---|
| TPR, recall | TP / all bads | 42.2 % |
| FPR | FP / all goods | 21.6 % |
| specificity | TN / all goods = 1 − FPR | 78.4 % |
| precision | TP / all declined | 5.6 % |

> ⚠️ **Watch out.** TPR and FPR have different denominators: 223 bads and 7 392 goods. 21.6 % of goods is 1 593 people — seventeen times more than the 94 bads caught.

**Your turn.** What is the FPR at the cut-off 600, in %, to 2 decimals?

### Accuracy — why it misleads at 3 % bads

**What it is.** **Accuracy** (*доля верных ответов*) is the share of all decisions that were right: (TP + TN) / everyone. With only 2.93 % bads, a rule that approves everyone is right 97.07 % of the time — and catches no bad at all.

**How to write it.**

```python
acc_640 = (TP + TN) / len(y)
acc_all = (y == 0).mean()
# 0.7739 0.9707
print(round(acc_640, 4), round(acc_all, 4))
```

The cut-off 640 is right 77.4 % of the time; "approve everyone" is right 97.1 % of the time. By accuracy, the score that catches 94 bads looks worse than doing nothing.

**When you use it.**
- Almost never for a scorecard. Report TPR and FPR at a cut-off, and AUC or Gini for the ranking.
- Accuracy is fine only when the two classes are about equally common.

**Your turn.** Why does "approve everyone" have the best accuracy on our loans?

### The ROC curve — every cut-off at once

**What it is.** The **ROC curve** (*ROC-кривая*) draws the point (FPR, TPR) for every possible cut-off and joins them. Approve everyone: (0, 0). Decline everyone: (1, 1). A score that knows nothing — a coin toss — runs along the diagonal. The better the score, the more its curve bows towards the top-left corner: many bads caught, few goods turned away.

**How to write it.** One cut-off per score, from the lowest to above the highest.

```python
cuts = np.arange(s.min(), s.max() + 2)
tpr_all = np.array([(s[y == 1] < c).mean() for c in cuts])
fpr_all = np.array([(s[y == 0] < c).mean() for c in cuts])
plt.plot(fpr_all, tpr_all, label="credit score")
plt.plot([0, 1], [0, 1], "--", label="coin toss")
plt.xlabel("FPR: goods turned away")
plt.ylabel("TPR: bads caught")
plt.legend(); plt.show()
```

The curve passes (21.6 %, 42.2 %) at 640 and (32.0 %, 65.9 %) at 659; it stays above the diagonal everywhere.

**When you use it.**
- To see the whole trade-off before anyone picks a cut-off.
- To compare two scorecards on the same loans: the higher curve wins at every FPR.

> ⚠️ **Watch out.** The ROC curve shows ranking only. It says nothing about money — a bad costs far more than a good earns. Day 4 puts the cut-off in soum.

**Your turn.** Which cut-off gives the point (0, 0) — the bottom-left corner?

### AUC — the chance a good outscores a bad

**What it is.** The **AUC** (*area under the curve*, площадь под ROC-кривой) is the area under the ROC curve, from 0.5 (a coin toss) to 1 (perfect). It has a plain meaning: pick one good and one bad loan at random — the AUC is the chance that the good one has the higher score, with a tie counted as half. That makes it the **Mann–Whitney** statistic divided by the number of good–bad pairs.

**How to write it.** Rank every score together, add up the goods' ranks, and subtract the smallest sum they could have.

```python
r = stats.rankdata(s)
n_bad, n_good = y.sum(), (y == 0).sum()
U = r[y == 0].sum() - n_good * (n_good + 1) / 2
auc = U / (n_good * n_bad)
# 0.689 1648416
print(round(auc, 3), n_good * n_bad)
# the same from scipy, and as the area by trapezoids
u = stats.mannwhitneyu(s[y == 0], s[y == 1]).statistic
area = np.sum(np.diff(fpr_all) * (tpr_all[1:] + tpr_all[:-1]) / 2)
print(round(u / (n_good * n_bad), 3), round(area, 3))
```

AUC = 0.689: in 68.9 % of the 1 648 416 good–bad pairs, the good loan has the higher score. Three ways, one number.

**When you use it.**
- One number for the whole ranking, independent of any cut-off.
- At work, `sklearn.metrics.roc_auc_score(y, -s)` gives the same 0.689 (the minus sign because a *high* score means *good*).

> ⚠️ **Watch out.** The direction matters. Here a high score means a good loan, so `roc_auc_score(y, s)` returns 0.311 — the AUC of the score read backwards. An AUC below 0.5 usually means the sign is wrong.

**Your turn.** An AUC of 0.689 means…

### Gini — the AUC on a scale from 0 to 1

**What it is.** The **Gini coefficient** (*коэффициент Джини*) of a scorecard is **2·AUC − 1**: 0 for a coin toss, 1 for a perfect ranking, below 0 for a score that ranks backwards. Banks quote it more often than the AUC; it is also called the **accuracy ratio**. Typical values: an **application scorecard** (*скоринг заявки*, scored at the first loan) often reaches 0.4–0.6; a behavioural score, which knows the customer's own payments, often more.

**How to write it.**

```python
gini = 2 * auc - 1
# 0.377
print(round(gini, 3))
```

Gini = 0.377: the score is far better than a coin toss, and somewhat below the 0.4–0.6 that is usual for an application scorecard.

**When you use it.**
- The headline number of every scorecard report and every monthly monitoring pack.
- Comparing scorecards, products or years — on the same definition of bad.

> ⚠️ **Watch out.** A benchmark is a hint, not a pass mark. The Gini depends on the population: on a book that was already cut at a high score, every scorecard looks weaker. Compare like with like — the same loans, the same bad.

**Your turn.** A vendor's scorecard claims an AUC of 0.72 on loans like ours. What is its Gini, to 2 decimals?

### KS — the widest gap between the two cumulative curves

**What it is.** For every score x, take the share of bads that score x or less and the share of goods that score x or less: two **cumulative curves** (*кумулятивные кривые*). The **Kolmogorov–Smirnov statistic**, **KS** (*статистика Колмогорова–Смирнова*), is the widest gap between them. On the ROC picture it is the greatest height of the curve above the diagonal: max(TPR − FPR).

**How to write it.**

```python
xs = np.unique(s)
cum_bad = np.array([(s[y == 1] <= x).mean() for x in xs])
cum_good = np.array([(s[y == 0] <= x).mean() for x in xs])
gap = cum_bad - cum_good
# 0.34 658.0
print(round(gap.max(), 2), xs[gap.argmax()])
```

| score up to | bads | goods | gap |
|---|---|---|---|
| 559 | 5.4 % | 1.2 % | 4.2 |
| 599 | 16.6 % | 4.0 % | 12.6 |
| 639 | 42.2 % | 21.6 % | 20.6 |
| **658** | **65.9 %** | **32.0 %** | **34.0** |
| 679 | 74.9 % | 48.9 % | 26.0 |
| 719 | 92.8 % | 76.2 % | 16.6 |

KS = 0.34 at 658: two thirds of the bads score 658 or less, against one third of the goods.

**When you use it.**
- A second headline number next to the Gini; many credit teams report both.
- It names the score where the two groups separate best — a natural first candidate for a cut-off (Day 4 checks it in money).

> ⚠️ **Watch out.** KS is measured at one score only; two scorecards with the same KS can rank very differently elsewhere. Report it with its score ("0.34 at 658"), and with the Gini.

**Your turn.** What is the gap at the score 649 (score 649 or less), in points, to 1 decimal?

### Lift and gains — what the worst-scored loans hold

**What it is.** Sort the loans from the worst score to the best and cut them into ten equal groups, **deciles** (*децили*). The **gain** (*прирост*) of the worst x % is the share of all bads it holds. The **lift** (*лифт*) is how many times its bad rate exceeds the average: gain ÷ x.

**How to write it.** `NTILE(10)` deals the sorted loans into ten groups; the `loan_id` breaks ties so the groups are the same on every run.

```sql
WITH s AS (
  SELECT l.loan_id, a.credit_score AS score,
         (l.status IN ('default', 'written_off')) AS bad
  FROM loans l
  JOIN applications a ON a.application_id = l.application_id
  WHERE a.credit_score IS NOT NULL),
d AS (
  SELECT *, NTILE(10) OVER (ORDER BY score, loan_id) AS decile
  FROM s)
SELECT decile, COUNT(*) AS loans,
       MIN(score) || '-' || MAX(score) AS scores,
       SUM(bad) AS bads,
       ROUND(100.0 * SUM(SUM(bad)) OVER (ORDER BY decile)
             / (SELECT SUM(bad) FROM s), 1) AS gain_pct
FROM d GROUP BY decile ORDER BY decile;
```

| decile | scores | bads | gain |
|---|---|---|---|
| 1 (worst) | 424–615 | 56 | 25.1 % |
| 2 | 615–635 | 37 | 41.7 % |
| 3 | 635–653 | 38 | 58.7 % |
| 4 | 653–668 | 25 | 70.0 % |
| 5 | 668–680 | 12 | 75.3 % |
| 10 (best) | 749–850 | 6 | 100 % |

The worst 10 % of scores hold 25.1 % of the bads — a lift of 2.51: their bad rate, 7.35 %, is two and a half times the average 2.93 %.

**When you use it.**
- "If collections can call only 10 % of the book, how many future bads do they reach?" — the gain of the first decile.
- A picture managers read without any statistics: the gains chart.

**Your turn.** What is the **cumulative lift** of the worst 30 % of scores, to 2 decimals?

### AUC and KS in SQL — from a table of counts per score

**What it is.** AUC and KS need only the count of bads and goods at each score. SQL builds that table with `GROUP BY credit_score`; window sums add the bads below each score. A tie — a good and a bad on the same score — counts as half, as in the AUC's definition.

**How to write it.**

```sql
-- one row per score: its bads and goods
WITH s AS (
  SELECT a.credit_score AS score,
         SUM(l.status IN ('default', 'written_off')) AS bads,
         SUM(l.status NOT IN ('default', 'written_off')) AS goods
  FROM loans l
  JOIN applications a ON a.application_id = l.application_id
  WHERE a.credit_score IS NOT NULL
  GROUP BY a.credit_score),
-- the bads below each score, and both cumulative shares
c AS (
  SELECT score, bads, goods,
         SUM(bads) OVER (ORDER BY score) - bads AS bads_below,
         1.0 * SUM(bads) OVER (ORDER BY score)
             / (SELECT SUM(bads) FROM s) AS cum_bad,
         1.0 * SUM(goods) OVER (ORDER BY score)
             / (SELECT SUM(goods) FROM s) AS cum_good
  FROM s)
SELECT ROUND(SUM(goods * (bads_below + 0.5 * bads))
             / ((SELECT SUM(goods) FROM s)
                * (SELECT SUM(bads) FROM s)), 3) AS auc,
       ROUND(MAX(cum_bad - cum_good), 4) AS ks
FROM c;
```

SQL gives AUC 0.689 and KS 0.3395 — the Python numbers, from 327 rows of counts (one per score that occurs).

**When you use it.**
- When the loans live in a database and the monthly report is a query, not a notebook.
- Grouping by a band instead of the score gives the AUC of the band table (Practice P10).

### Score or grade — comparing two rankings on the same loans

**What it is.** Any ordered column can be judged with the same tools. Nur's **risk grade** is the score cut into four bands: A 720+, B 660–719, C 600–659, D below 600. Comparing their Gini on the **same loans** shows whether the fine detail of the score adds anything.

**How to write it.** Turn the grade into numbers with A best, then reuse the rank AUC.

```python
def gini_of(x, y):
    r = stats.rankdata(x)
    nb, ng = y.sum(), (y == 0).sum()
    return 2 * (r[y == 0].sum() - ng * (ng + 1) / 2) / (ng * nb) - 1

g = S["risk_grade"].map({"A": 4, "B": 3, "C": 2, "D": 1}).to_numpy()
# 0.377 0.396
print(round(gini_of(s, y), 3), round(gini_of(g, y), 3))
```

| grade | scores | loans | bad rate |
|---|---|---|---|
| A | 720+ | 1 774 | 0.90 % |
| B | 660–719 | 3 302 | 1.82 % |
| C | 600–659 | 2 208 | 4.98 % |
| D | below 600 | 331 | 11.18 % |

The four grades reach Gini 0.396, more than the score's 0.377. The bad rate falls in steps at the grade edges — 6.6 % at 650–659, 1.4 % at 660–669 — while inside a grade a higher score does not mean fewer bads.

**When you use it.**
- "Is the new score better than the old one?" — on the same loans, same bad, side by side.
- "Does the fine score add anything to the grade?" — compare them, then look inside a grade (the daily challenge).

> ⚠️ **Watch out.** Compare on the same loans. The grade on all 7 828 loans has Gini 0.389; on the 7 615 scored ones, 0.396. A difference of 0.007 can be nothing more than a different population.

**Your turn.** How can four grades rank better than 327 different score values?

### Out-of-time validation — does it still rank on new loans?

**What it is.** A scorecard looks best on the loans it was built on. **Out-of-time validation** (*проверка на отложенном периоде*) measures it on loans from **after** that period. Our scorecard dates from 2024, so 2024's loans are its own time, and 2025–2026 are out of time. Few bads make any Gini uncertain, so it comes with an interval — a **bootstrap** (W6D2): resample the loans, recompute, read the middle 95 %.

**How to write it.**

```python
yr = S["disbursed_at"].str[:4]
rng = np.random.default_rng(2026)
for name, d in [("2024", S[yr == "2024"]), ("2025-26", S[yr != "2024"])]:
    x, b = d["score"].to_numpy(), d["bad"].to_numpy()
    boot = []
    for _ in range(1000):
        i = rng.integers(0, len(x), len(x))
        boot.append(gini_of(x[i], b[i]))
    lo, hi = np.percentile(boot, [2.5, 97.5])
    print(name, len(x), b.sum(), round(gini_of(x, b), 3), round(lo, 2), round(hi, 2))
```

| loans | count | bads | Gini (95 % interval) |
|---|---|---|---|
| 2024 | 1 699 | 68 | 0.415 (0.28 to 0.54) |
| 2025–26 | 5 916 | 155 | 0.365 (0.28 to 0.45) |

The newer loans rank a little less well, 0.365 against 0.415, but the intervals overlap almost completely: with 68 and 155 bads, the data cannot yet tell a real fall from noise.

**When you use it.**
- Before trusting any build report: "and on the loans since?"
- Every quarter, as part of monitoring (Day 4).

> ⚠️ **Watch out.** The 2026 loans are young: many have not had the time to go bad. A Gini on immature loans measures who went bad *fast*. Compare vintages at the same age, or wait.

**Your turn.** The out-of-time Gini is 0.365 against 0.415 in time. What do you tell Nilufar?

### Putting it together

Nilufar's question, one tool per line: what is bad → one cut-off as a confusion matrix → TPR and FPR (not accuracy) → every cut-off as the ROC curve → its area, the AUC → Gini against the benchmark → KS and the score where it is reached → lift for the worst decile → the same in SQL → score against grade → out of time.

| measure | answers | Nur's score |
|---|---|---|
| TPR, FPR | what one cut-off does | 42.2 %, 21.6 % at 640 |
| AUC | P(a good outscores a bad) | 0.689 |
| Gini | the AUC on a 0–1 scale | 0.377 |
| KS | the best single separation | 0.34 at 658 |
| gain, lift | what the worst decile holds | 25.1 %, 2.51 |
| out of time | does it last | 0.415 → 0.365 |

The score still ranks — clearly better than a coin toss, a little below the usual 0.4–0.6, and no clear sign yet of a fall on the new loans.

### Depth (optional)

- **Books.** Naeem Siddiqi, *Intelligent Credit Scoring* (Wiley, 2nd ed., 2017): the chapters on scorecard validation and on choosing a cut-off. Lyn Thomas, Jonathan Crook and David Edelman, *Credit Scoring and Its Applications* (SIAM, 2nd ed., 2017): ROC, Gini and KS for credit scoring, and why they agree or disagree.
- **The meaning of the AUC.** J. A. Hanley and B. J. McNeil, "The meaning and use of the area under a receiver operating characteristic (ROC) curve", *Radiology* 143 (1982): the AUC as the Mann–Whitney statistic, with a formula for its standard error.
- **Regulators.** Basel Committee on Banking Supervision, *Studies on the Validation of Internal Rating Systems* (Working Paper 14, 2005): the CAP curve, the accuracy ratio (= Gini) and the ROC, as banks use them.
- **At work in Python:** `from sklearn.metrics import roc_auc_score, roc_curve` — the same numbers as today's ranks, with the minus sign for a "high is good" score.
- *Russian terms:* скоринговая карта = scorecard, порог отсечения (cut-off) = cut-off, матрица ошибок = confusion matrix, чувствительность / полнота = sensitivity / recall, доля ложноположительных = false positive rate, ROC-кривая = ROC curve, площадь под кривой = AUC, коэффициент Джини = Gini, статистика Колмогорова–Смирнова = KS, лифт = lift, кривая прироста = gains chart, проверка на отложенной выборке / периоде = out-of-sample / out-of-time validation.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak.


=====
PAGE: Week 9 · Day 4 — The cut-off and watching the model: approval, bad rate, profit, PSI (weeks/week-09/day-4.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-09/day-4
=====

# Week 9 · Day 4 — The cut-off and watching the model: approval, bad rate, profit, PSI

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 9.4 (due Day 5)</span> <span class="badge company">Company corner</span>

> STORY **Thursday, 9:00.** Nilufar read yesterday's page twice. *"Good — the score still ranks. Now the real question. Our decisions are a patchwork: we rejected 126 applicants with 720 or more and lent to 100 below 560. If you could draw one line, where would you draw it? And not the line with the lowest bad rate — the one that makes money. Then tell me how I will know, next month, that the applicants have changed under us."* Bekzod from finance, copied in: *"Use the budget's unit economics: 18 % funding, 60 % LGD."*

## Today in 3 lines

- A **cut-off** trades approvals for bad rate: approving 600 and above keeps 95.7 % of the loans at a 2.55 % bad rate, 660 and above keeps 66.7 % at 1.50 %. You count **bads avoided** and **goods turned away**, the **expected loss** per loan (PD × LGD × EAD, W6D1) and the **profit** with W8D2's unit economics: a good Consumer-sized loan leaves 1.45 m soum and a bad one costs 17.2 m, so a group is worth declining only when more than **7.79 %** of it goes bad.
- The profit peaks at **594 — 7.14 bn soum** against 6.91 bn for approving everyone; a 2 % bad-rate target (647) costs 1.02 bn of it, and at 22 % funding the best line jumps to 659. Then the rest of a credit policy: **swap-in and swap-out**, **policy rules**, **champion / challenger**.
- Watching the model: the **PSI** of 2026's applicants against 2024's is **0.0037** — stable (under 0.1 stable, 0.1–0.25 watch, over 0.25 act); the **CSI** of each characteristic; a **monthly monitoring view**, and what to do when it drifts. HW 9.4: the cut-off table in SQL and the PSI on ten bins in `data/python/week9/day4_starter.ipynb`.

---

## 1. Learn — the line, in money, and the watch on it

Eight short stories. Each one tells **one idea in small steps**: read a sentence, watch the picture change, press **Next**. A dotted word shows its meaning when you tap it. Tired of reading? Press **▶ Play as a video**: the page reads every step aloud and moves the picture for you.

The Python for each idea, and the extra topics, are in **Going further — the full version** near the end of the page (optional).

### One line, two numbers — approval, bad rate, bads avoided

(Animated explanation)
One line, two numbers
- Back to Day 3's 20 toy loans. Approve everyone: 20 approved, 5 of them bad — a bad rate of 25 %. The share approved is the approval rate.
- Approve from 620: 15 approved (75 %), and only 2 of them bad — 13 %.
- From 650: 12 approved (60 %), 1 of them bad — 8 %. Raise the line and **both** numbers fall: fewer approvals, and fewer bads among them.
- Your turn.
- Nur's real loans, every line from 540 to 760: blue = the share approved, orange = their bad rate. Approve from 600: 95.7 % approved at 2.55 % bad.
- From 660: 66.7 % approved at 1.50 %. 29 points of volume for about one point of bad rate — whether that pays is a question of money.
- Drag the line, or tap **−20** / **+20**, and watch the two curves fall together.
- Moving up from “approve everyone” declines two kinds of people: bads avoided and goods turned away. At 600: 37 and 294.
- At 640: 94 bads avoided, 1 593 goods lost — 16.9 good customers for each bad. Between 600 and 640 the price doubles.
- These are loans Nur already made. A line **below** today's practice would approve people Nur never lent to, whose bad rate is unknown (swap-ins, later today).

### What one approved loan is expected to lose

(Animated explanation)
What one approved loan is expected to lose
- From Week 8: a loan's expected loss is PD × LGD × EAD. For an average Consumer loan: 21 630 783 soum still owed at default (EAD), 60 % of it lost (LGD).
- At a cut-off, the PD of an approved loan is the bad rate of the approved group. Approve everyone: 2.93 % → 380 065 soum per loan.
- Approve from 600: the bad rate falls to 2.55 %, and the expected loss per loan to 331 411 soum.
- From 660: 194 319 per loan — half the risk of “everyone”, for two thirds of the volume.
- Think in money.
- The total expected loss falls from 2.89 bn to 0.99 bn soum between “everyone” and 660 — but 2 392 good loans and their interest are gone too. Only money on both sides decides.

### A good loan, a bad loan — the profit of a line

(Animated explanation)
A good loan, a bad loan — the profit of a line
- Put a price on each loan with Week 8's average Consumer loan. A good loan pays its interest: 5 695 580 soum.
- It costs its funding (3 417 348) and its selling and servicing (823 325). It leaves 1 454 907 soum.
- A bad loan pays no interest (Week 8's simplification), still costs the funding and the operating cost, and loses 60 % of the 21 630 783 it owes: it costs 17 219 143 soum.
- Guess first.
- The profit of a line: the goods it approves times what each leaves, minus the bads it approves times what each costs. Approve everyone: 6.91 bn soum.
- Approve from 600: 7.12 bn — declining the 331 loans below 600 adds 0.21 bn.
- From 660: 5.97 bn. Tightening from 600 to 660 throws away 1.16 bn: those goods earned more than their bads cost.
- Drag the line and find the top of the curve yourself.
- This is Week 8's contribution per loan, added up over the book. One caveat: every loan here is priced like an average Consumer loan; a real policy prices each product with its own numbers.

### Where would you put the line? — the break-even and the best cut-off

(Animated explanation)
Where would you put the line?
- A group of loans is worth declining only if it loses money: if more of it goes bad than the break-even bad rate, 7.79 % — Week 8's break-even PD.
- Each bar is a 20-point band of scores with its bad rate; the dashed line is 7.79 %. Four rounds: keep the band, or decline it?
- Round 1.
- Round 2.
- Round 3.
- Colour every band: orange above the line (decline), green below (keep). Everything below 600 is orange, everything from 600 up is green.
- Now try every line in money: the profit peaks at 594 — 7.14 bn soum, 0.23 bn more than approving everyone. Every line from 593 to 600 is within 0.3 % of it.
- The top is flat and a little jagged, so 594 is partly noise. Recommend a round line you can explain — 600, the edge of grade D — and give the range.
- Round 4. Funding rises to 22 %: a good loan now leaves only 695 496 soum, and the break-even falls to 3.72 %.
- Decide.
- In money: at 22 % everything from 600 to 659 stops paying, and the best line jumps from 594 to 659, the C/B edge.
- Last round, in your head.

**Now play.** The same idea with sliders — try the challenges.

### A 2 % target — and its price

(Animated explanation)
A 2 % target — and its price
- Risk appetite is often written as a bad-rate target: “the loans we approve must stay under 2 % bad”.
- The loosest line that meets it is 647: 74.3 % approved at a 1.997 % bad rate, earning 6.12 bn soum.
- The best line earns 7.14 bn, so the target costs 1.02 bn of profit on this book — and 0.79 bn below even approving everyone.
- Why?
- The lowest bad rate is not a goal: approve only 720 and above and the bad rate is 0.90 % — and the profit 2.28 bn, a third of the best.
- So when a committee proposes a target, show it two numbers before it votes: the line the target implies, and the money it costs.

### Who changes sides — swap-ins, swap-outs, rules and tests

(Animated explanation)
Who changes sides
- A rule, “approve 600 and above”, against today's decisions on 13 612 scored applications (one dot ≈ 136). Most decisions stay the same; two groups change sides.
- Swap-outs: 363 applications. 331 became loans and 37 of those went bad — Nur **knows**, because it lent to them.
- Swap-ins: 2 295 applicants. Nobody knows how they would have paid.
- Your turn.
- Guessing it is reject inference. Beware: swap-ins were often rejected by a rule, not the score, so treating them like approved people usually underestimates their risk.
- The share rejected by score band. It falls with the score but never reaches zero — 5.9 % even at 720+. Policy rules and overrides decide too.
- So a cut-off study keeps the policy rules fixed — otherwise it promises swap-ins the rules would reject anyway. The override rate shows whether people trust the scorecard.
- To test a policy for real: champion / challenger — Week 7's A/B test. But bads are rare: seeing 2.93 % → 2.55 % needs about 28 936 loans per arm.
- Last one.

### Has the crowd moved? — PSI

(Animated explanation)
Has the crowd moved? — PSI
- The scorecard was built on one crowd of applicants. Is today's crowd the same? A toy with two bands: last year 25 % low, 75 % high; this month 35 % and 65 %.
- For each band: (today's share − last year's) × ln(today ÷ last year). The low band: 0.10 × ln 1.4 = 0.0336.
- The high band: −0.10 × ln 0.867 = 0.0143, positive too — a fall and its log share the sign. Add the bands: the PSI = 0.048.
- Read it with a traffic light: under 0.1 stable, 0.1–0.25 watch, over 0.25 act. 0.048 is stable.
- Check the formula.
- Nur: 2024's applicants, the scorecard's first year, against 2026's, on six score bands. The bars almost match: PSI = 0.0037, stable.
- Each band's part is tiny; the biggest, 680–719 (22.70 % → 20.82 %), adds only 0.0016.
- A slow slide hides, though: lower every 2026 score by 10 points and the PSI is only 0.041 — still green. That is why the monthly page also shows the average score.
- Lower them by 20 and the PSI reaches 0.136: watch. By 30 it would be 0.28: act.
- A detail for the homework: a score exactly on an edge belongs to the band **above** it — 600 goes into 600–639, not into 560–599.
- Two practical rules. An empty band makes ln(0) blow up: floor every share at a tiny value (0.01 %) or merge the band with its neighbour. More bands give the same verdict — the homework uses ten, cut at 2024's deciles.
- And a stable PSI says only that the **applicants** have not moved — not that the score still ranks. That is the Gini's job.

**Now play.** The same idea with sliders — try the challenges.

### Watching every month — CSI and what to do

(Animated explanation)
Watching every month
- The same PSI for each month of 2026 against 2024. Every month is green, from 0.004 to 0.018…
- …and October: 0.062, 17 times 2026's PSI. But October has only 129 applicants so far, and in a small month each band's share jumps by chance.
- Your turn.
- When the PSI rises, find **which input** moved: the CSI — the same formula on one input instead of the score. Nur's are all tiny.
- Find the cause.
- Each signal has its usual action. Under 0.1: note it. 0.1–0.25: find the moved input and adjust its cut-off. Over 0.25: a new population — restrict the score, recalibrate or rebuild.
- The bad rate rises while the Gini and the PSI stay put? The **order** is right, the **level** is not: recalibrate the PD, move the cut-off, reprice.
- The Gini falls beyond its interval? The score ranks worse: review it and rebuild with recent loans.
- The monthly page, always in the same order: **population** (PSI, average score), **ranking** (Gini on mature vintages), **outcome** (bad rate by vintage at the same age), **policy** (approval rate, overrides). It ends with one line: signal → action → owner → date.

**Now check yourself.**

**Now check yourself.**

## 2. Worked example — where to draw the line (15 min)

**Step 1 — the trade-off.** On the 7 615 scored loans: approve from 600 → 95.7 % approved, 2.55 % bad; from 660 → 66.7 %, 1.50 %.

**Step 2 — who is declined.** At 600: 37 bads avoided and 294 goods turned away, 7.9 goods per bad. At 640 the price is 16.9 goods per bad.

**Step 3 — expected loss.** Per approved loan: 380 065 soum approving everyone, 331 411 at 600 (PD × 60 % × 21 630 783).

**Step 4 — profit.** A good loan leaves 1 454 907 soum, a bad one costs 17 219 143. Approving everyone earns 6.91 bn; from 600, 7.12 bn.

**Step 5 — the best line.** The profit peaks at **594 (7.14 bn)**; 593–600 are all within 0.3 % of it. The break-even bad rate is 7.79 %: grade D (11.2 %) is above it, grade C (5.0 %) below. Recommended line: **600**, the edge of grade D, because it is round, explainable and almost as profitable.

**Step 6 — what the 2 % target would cost.** Its line, 647, earns 6.12 bn: **1.02 bn less** than the best, for 0.57 points less bad rate.

**Step 7 — swap sets and rules.** A pure "600 and above" rule would swap out 331 loans (37 bad) and swap in 2 295 rejected applicants with unknown risk. The recommendation keeps every policy rule and applies 600 only as a floor: decline below 600, and keep today's rules above it.

**Step 8 — stability.** PSI 2026 vs 2024 = **0.0037**, every CSI under 0.01, every 2026 month green. The cut-off was computed on a population that has not moved.

**Step 9 — the note, answer first.** *"Set the floor at 600 and keep every policy rule above it. On our loans that would have approved 95.7 % at a 2.55 % bad rate and earned 7.12 bn soum at W8D2's prices, 0.21 bn more than approving every scored applicant; the exact peak, 594, is no better within noise. A 2 % bad-rate target would cost about 1 bn of this book's profit. The applicants are stable (PSI 0.004). Two triggers to revisit: funding above about 21 %, where grade C stops paying, and any month with PSI over 0.1."*

---

## 3. Practice (50 min)

Every task has its own answer box, and the questions follow the order of section 1 — the concept is named in italics. The setup box just below loads everything the Python boxes need: `np`, `pd`, the frames `S` and `A`, the arrays `s` and `y`, the numbers `I`, `COF`, `OPEX`, `EAD`, `LGD`, `good`, `bad`, the arrays `cs` and `pr`, `e`, `edges` and the functions `at`, `profit`, `shares` and `psi` — run it once before the first task (and again after you reload the page). (The notebook `data/python/week9/day4_starter.ipynb` holds the same tools; you need it for the homework.)

**First, press ▶ Run on this box once.** It loads the tools and the data that every Python box below uses.

```python
# the tools and the data from the full version of section 1 — run once
import sqlite3
import numpy as np
import pandas as pd
con = sqlite3.connect("data/raw/nur.db")
S = pd.read_sql("""
SELECT l.loan_id, l.disbursed_at, p.code AS product,
       a.credit_score AS score,
       CASE WHEN l.status IN ('default', 'written_off')
            THEN 1 ELSE 0 END AS bad
FROM loans l
JOIN applications a ON a.application_id = l.application_id
JOIN products p ON p.product_id = l.product_id
WHERE a.credit_score IS NOT NULL""", con)
s, y = S["score"].to_numpy(), S["bad"].to_numpy()
I, COF, OPEX = 5_695_580, 3_417_348, 823_325
EAD, LGD = 21_630_783, 0.60
def at(c):
    keep = s >= c
    return keep.mean(), y[keep].mean(), keep.sum(), y[keep].sum()
for c in (560, 600, 620, 640, 660):
    share, br, n, b = at(c)
    print(c, round(100 * share, 1), round(100 * br, 2), n, b)
for c in (560, 600, 640, 660):
    keep = s >= c
    avoided = y[~keep].sum()
    lost = (~keep & (y == 0)).sum()
    print(c, avoided, lost, round(lost / avoided, 1))
for c in (424, 600, 640, 660):
    pd_c = y[s >= c].mean()
    print(c, round(pd_c * LGD * EAD))
good = float(I - COF - OPEX)
bad = LGD * EAD + COF + OPEX
def profit(c):
    keep = s >= c
    return good * (keep & (y == 0)).sum() - bad * (keep & (y == 1)).sum()
for c in (424, 560, 600, 640, 660, 700):
    print(c, round(profit(c) / 1e9, 2))
cs = np.arange(424, 852)
pr = np.array([profit(c) for c in cs])
best = cs[pr.argmax()]
ok = [c for c in cs if (s >= c).any() and y[s >= c].mean() <= 0.02]
c2 = min(ok)
share, br, n, b = at(c2)
from statsmodels.stats.proportion import proportion_effectsize
from statsmodels.stats.power import NormalIndPower
for p2 in (0.0255, 0.0200):
    h = proportion_effectsize(0.0293, p2)
    n = NormalIndPower().solve_power(h, alpha=0.05, power=0.8)
    print(p2, round(n))
A = pd.read_sql("""SELECT applied_at, credit_score FROM applications
                   WHERE credit_score IS NOT NULL""", con)
edges = [560, 600, 640, 680, 720]
def shares(x):
    band = np.searchsorted(edges, x, side="right")
    return np.bincount(band, minlength=6) / len(x)
def psi(e, a):
    return np.sum((a - e) * np.log(a / e))
yr = A["applied_at"].str[:4]
e = shares(A.loc[yr == "2024", "credit_score"].to_numpy())
a = shares(A.loc[yr == "2026", "credit_score"].to_numpy())
A["ym"] = A["applied_at"].str[:7]
m = A[yr == "2026"].groupby("ym")["credit_score"]
view = m.agg(applicants="size", avg_score="mean")
view["psi"] = m.apply(lambda x: psi(e, shares(x.to_numpy())))
print('ready')
```

**P1.** *(the cut-off)* Write one SQL query that returns the approval rate and the bad rate for the cut-offs **580** and **700** — one row each. Use a small table of cut-offs: `WITH cuts(c) AS (VALUES (580), (700))`.

**P2.** *(bads avoided, goods turned away)* At the cut-off **700**: how many bads are avoided, how many goods turned away, and how many goods per bad avoided (1 decimal)?

**P3.** *(expected loss)* The **total** expected loss of the approved loans — bads × LGD × EAD — approving everyone and at 660, in bn soum, to 2 decimals. What is it at 660?

**P4.** *(profit by cut-off)* Do it for **Micro** loans with **Micro's own** W8D2 numbers: interest 266 662, funding 114 284, operating cost 95 996, EAD 1 777 000, LGD 60 %. Which cut-off maximises Micro's profit?

**P5.** *(the break-even bad rate)* If LGD were **80 %** instead of 60 %, what would the break-even bad rate be (18 % funding), in %, to 2 decimals?

**P6.** *(a bad-rate target)* The committee asks for **1.5 %** instead of 2 %. What is the loosest cut-off that meets it?

**P7.** *(swap-in and swap-out)* Run the swap query of "Swap-in and swap-out" (in Going further, near the end of the page) for the line **640**. How many rejected applicants would be swapped **in**?

**P8.** *(policy rules)* Among applicants scoring **below 600**, how many were **rejected**, and how many of the others became loans? Count rejected applications below 600.

**P9.** *(champion / challenger)* How many loans per arm would a test need to see a fall from 2.93 % to **2.18 %** (the line at 640), at 80 % power and α = 5 %?

**P10.** *(PSI)* Compute the PSI of **2026 against 2025** (not 2024), to 4 decimals.

**P11.** *(CSI)* The CSI of the **term** (`applications.term_months`, one band per term), 2026 against 2024, to 4 decimals.

**P12.** *(the monitoring view)* Add the **average score** to the monthly view. In which full month of 2026 is it lowest, and by how much is it below 2024's 661.7?

### Mistakes people make

- Choosing the line with the **lowest bad rate**: approving only 720+ gives 0.90 % and a third of the profit.
- A profit curve priced with **one product's** numbers and applied to every product without saying so.
- Reading the **exact** peak (594) as a finding: the top is flat; report the range and a round line.
- A cut-off study that forgets the **swap-ins**, or assumes they behave like approved applicants.
- Comparing approval rates **without the policy rules**: the score is not the only thing that declines people.
- Planning a champion / challenger test **without a sample size**: 0.4 points of bad rate need 29 000 loans an arm.
- PSI with an **empty band** (ln 0), or without naming the reference period.
- Reacting to one **small month's** PSI; ignoring a slow fall of the average score that stays under 0.1.

---

## 4. Homework <span class="badge hw">HW 9.4 — Due Day 5</span>

**The cut-off note.** Two parts, one 📎 box.

**Part A — SQL.** Write `cutoff_table.sql`: one query that returns, for the cut-offs **580, 590, …, 700**, the loans approved, the approval rate (%), the bads approved, the bad rate (%), the bads avoided, the goods turned away and the profit in bn soum with W8D2's numbers (a good loan 1 454 907, a bad one 17 219 143). Use the `WITH cuts(c) AS (VALUES …)` shape of Practice P1.

**Part B — Python.** Open `data/python/week9/day4_starter.ipynb`. Five functions are stubs; under each is an assert cell that checks your result without showing it:

1. `cutoff_row(score, bad, cut, econ)` — approval, bad rate, bads avoided, goods lost and profit at one cut-off.
2. `best_cutoff(score, bad, econ)` — the profit-maximising cut-off and its profit.
3. `shares(x, edges)` — each bin's share; a value equal to an edge goes into the bin above (`np.digitize`).
4. `psi(expected, actual, floor=0.0001)` — the PSI, with empty bins floored.
5. `monthly_psi(frame, edges, ref)` — the PSI of each month against the reference shares.

Then compute the PSI of 2026 against 2024 on **ten bins**: the edges are the nine deciles of 2024's scores (`np.quantile(..., [0.1, …, 0.9])`). Write the six-line note for Nilufar in the last cell: the line, its approval and bad rate, its profit, the price of a 2 % target, the PSI, and one trigger to revisit.

Graded on (20 points): (a) the query runs on the practice database and returns 13 rows (4), (b) the five assert cells pass after *Restart & Run All* (2 points each, 10), (c) the ten-bin PSI is printed with its reading (3), (d) the note gives the six facts (3).

**Check your results here before you hand in:**

**H1.** In your SQL table, what is the approval rate at the cut-off **630**, in %, to 1 decimal?

**H2.** And the profit at **630**, in bn soum, to 2 decimals?

**H3.** What PSI do your ten bins give for 2026 against 2024, to 4 decimals?

**H4.** Your six-line note for Nilufar (the last cell of the notebook) — write it here too.

### 📎 Hand in here

---

## 5. Self-check

Three questions, one at a time. Wrong? The explanation points to the part of section 1 to reread.

---

## 6. Company corner <span class="badge company">The credit policy and the risk committee</span>

A cut-off does not live in a notebook. It lives in the **credit policy** (*кредитная политика*), the document that says who Nur lends to, and it changes only when the **risk committee** (*кредитный комитет / комитет по рискам*) votes for it. A typical credit policy holds:

- **The score cut-offs**, by product and channel, often with a **refer zone** around each line where an officer decides by hand.
- **The policy rules** — the stop factors that decline whatever the score: age, income proof, payment-to-income limits, bureau delinquencies, fraud and blacklists.
- **Limits** — the largest loan per grade and product, and how much an officer may approve alone (**delegated authority**).
- **Overrides** — when an officer may go against the score, who signs, and the override rate that triggers a review.
- **Monitoring triggers** — the PSI, Gini and bad-rate levels at which the policy must come back to the committee.

The analyst's part is the paper the committee votes on: the **strategy table** (every candidate line with its approval, bad rate and profit — HW 9.4), the swap sets, the monitoring page, and a recommendation written answer first. The committee balances it against things that are not in the table: the sales plan, the funding plan, the regulator's view, the reputation of declining a large share of applicants.

Put the parts of the policy in place:

> 🎯 **Interview version.** *"How would you set the cut-off for a scorecard?"* — Not by the bad rate alone. Put a price on a good and on a bad loan from the unit economics, compute the profit of every possible line, and find where the loans just below it go bad more often than the break-even rate (good ÷ (good + bad)). Show the trade-off table, the price of any bad-rate target and the swap sets; keep the policy rules; and recompute when funding or LGD changes. Give a number: "on our book the profit peaks around 600 — about 0.2 bn above approving everyone; a 2 % target would cost about 1 bn."

**Say it like in an interview.** *"How would you set the approval cut-off, and how would you know it still works next year?"* — answer in 3–5 sentences.

Tomorrow: the checkpoint — the scorecard review for the risk committee, from this week's four days.

---

## Going further — the full version, with Python (optional, 60 min)

The same ideas as the stories, written out in full with Python and SQL: the trade-off table, bads avoided and goods lost, the expected loss per loan, the profit curve and its best point, the price of a bad-rate target, the swap query, policy rules, the champion / challenger power calculation, PSI and CSI, the monthly view and the decision table. Optional: nothing here counts toward the day.

Press ▶ Run on this first box once. It loads the scored loans and W8D2's numbers for an average Consumer loan; every later box on this page, and every Practice box, reuses them.

```python
import sqlite3
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

con = sqlite3.connect("data/raw/nur.db")
S = pd.read_sql("""
SELECT l.loan_id, l.disbursed_at, p.code AS product,
       a.credit_score AS score,
       CASE WHEN l.status IN ('default', 'written_off')
            THEN 1 ELSE 0 END AS bad
FROM loans l
JOIN applications a ON a.application_id = l.application_id
JOIN products p ON p.product_id = l.product_id
WHERE a.credit_score IS NOT NULL""", con)
s, y = S["score"].to_numpy(), S["bad"].to_numpy()
# W8D2's average Consumer loan, soum: interest, funding at 18 %,
# selling and servicing, exposure at default; LGD is ours
I, COF, OPEX = 5_695_580, 3_417_348, 823_325
EAD, LGD = 21_630_783, 0.60
# 7615 223
print(len(S), y.sum())
```

### The cut-off — one line, two numbers that move together

**What it is.** The **cut-off** (*порог отсечения*) is the lowest score Nur approves. Raising it declines more people: the **approval rate** (*уровень одобрения*) falls, and so does the **bad rate** of the loans that are still approved. Choosing a cut-off means choosing a point on that trade-off.

**How to write it.**

```python
def at(c):
    keep = s >= c
    return keep.mean(), y[keep].mean(), keep.sum(), y[keep].sum()

for c in (560, 600, 620, 640, 660):
    share, br, n, b = at(c)
    print(c, round(100 * share, 1), round(100 * br, 2), n, b)
```

| approve from | approved | bad rate | loans |
|---|---|---|---|
| 560 | 98.7 % | 2.81 % | 7 515 |
| 600 | 95.7 % | 2.55 % | 7 284 |
| 620 | 87.9 % | 2.41 % | 6 694 |
| 640 | 77.8 % | 2.18 % | 5 928 |
| 660 | 66.7 % | 1.50 % | 5 076 |

From 560 to 660 the approval rate falls by 32 points and the bad rate by 1.3 points: the business pays a lot of volume for a little risk.

**When you use it.**
- Sales asks for more approvals, risk asks for fewer bads — the table puts both on one line.
- Before any money: the first view of what a proposed cut-off does.

> ⚠️ **Watch out.** These are loans Nur already made under its old decisions. A cut-off below today's practice would approve people Nur never lent to, whose bad rate is unknown (swap-in, below).

**Your turn.** What share of the scored loans does the cut-off **680** keep, in %, to 1 decimal?

### Bads avoided and goods turned away

**What it is.** Moving the line up from "approve everyone" declines two kinds of people. **Bads avoided** are the loans that would have gone bad. **Goods turned away** are good customers lost — revenue that never comes. Their ratio, goods per bad avoided, is the price of a tighter line.

**How to write it.**

```python
for c in (560, 600, 640, 660):
    keep = s >= c
    avoided = y[~keep].sum()
    lost = (~keep & (y == 0)).sum()
    print(c, avoided, lost, round(lost / avoided, 1))
```

| approve from | bads avoided | goods lost | goods per bad |
|---|---|---|---|
| 560 | 12 | 88 | 7.3 |
| 600 | 37 | 294 | 7.9 |
| 640 | 94 | 1 593 | 16.9 |
| 660 | 147 | 2 392 | 16.3 |

Below 600, each bad avoided costs about 8 good customers; between 600 and 640 the price doubles to about 17.

**When you use it.**
- "How many good customers do we lose to stop one bad?" — the question every sales director asks.
- The input for money: each side has a price (next subsections).

**Your turn.** At the cut-off 620 (62 bads avoided, 859 goods lost), how many goods are turned away per bad avoided, to 1 decimal?

### Expected loss per approved loan — PD, LGD and EAD at a cut-off

**What it is.** From W6D1: the **expected loss** (*ожидаемые потери*) of a loan is **PD × LGD × EAD**. At a cut-off, the PD of an approved loan is the bad rate of the approved group. With W8D2's Consumer EAD (21 630 783 soum) and our LGD of 60 %, each cut-off has its own expected loss per loan.

**How to write it.**

```python
for c in (424, 600, 640, 660):
    pd_c = y[s >= c].mean()
    print(c, round(pd_c * LGD * EAD))
```

Approving everyone, the expected loss is 380 065 soum per loan; at 600 it is 331 411, at 640 282 426, at 660 194 319 — half the risk per loan, for two thirds of the volume.

**When you use it.**
- Pricing: the expected loss is the part of the rate that pays for defaults.
- Explaining a cut-off to finance in their units.

> ⚠️ **Watch out.** A lower loss per loan is not more profit: the book also shrinks. The total expected loss falls from 2.89 bn to 0.99 bn soum between "everyone" and 660, but so does the interest. Only the next subsection weighs both.

**Your turn.** The cut-off 620 approves 6 694 loans, 161 of them bad. Its expected loss per approved loan, in **thousand** soum (whole number)?

### Profit by cut-off — W8D2's unit economics

**What it is.** Put a price on both kinds of loan with W8D2's average Consumer loan. A **good** loan pays its interest, 5 695 580, and costs its funding, 3 417 348, and its selling and servicing, 823 325: it leaves **1 454 907 soum**. A **bad** loan pays no interest (W8D2's simplification), still costs the funding and the operating cost, and loses 60 % of its exposure, 12 978 470: it costs **17 219 143 soum**. The profit of a cut-off is the goods it approves times the first number, minus the bads it approves times the second.

**How to write it.**

```python
good = float(I - COF - OPEX)
bad = LGD * EAD + COF + OPEX
def profit(c):
    keep = s >= c
    return good * (keep & (y == 0)).sum() - bad * (keep & (y == 1)).sum()

# 1454907 17219143
print(round(good), round(bad))
for c in (424, 560, 600, 640, 660, 700):
    print(c, round(profit(c) / 1e9, 2))
```

| approve from | profit, bn soum |
|---|---|
| everyone (424) | 6.91 |
| 560 | 6.99 |
| 600 | 7.12 |
| 640 | 6.22 |
| 660 | 5.97 |
| 700 | 3.22 |

Declining the scores below 600 adds 0.21 bn soum; tightening on to 660 throws away 1.16 bn of it.

**When you use it.**
- Every cut-off proposal: the line in money, not only in bad rate.
- It is W8D2's contribution per loan, summed: (1 − PD) × interest − funding − PD × LGD × EAD − operating cost.

> ⚠️ **Watch out.** Every loan here is priced like an average Consumer loan — one product's money on the whole book's scores. A real policy prices each product with its own numbers, and gets a different line for each (Practice P4: Micro's line sits at 659).

**Your turn.** What is the profit at the cut-off **620**, in bn soum, to 2 decimals?

### The profit-maximising cut-off and the break-even bad rate

**What it is.** Raising the line by one point declines the loans at that score. That adds money when those loans would have lost it — when their bad rate is above the **break-even bad rate** (*безубыточная доля плохих*): good ÷ (good + bad) = 1 454 907 ÷ 18 674 050 = **7.79 %**, W8D2's break-even PD for a Consumer loan. The **profit-maximising cut-off** (*порог максимальной прибыли*) sits where the loans just below it go bad more often than that and the loans above it less often.

**How to write it.** Try every cut-off and keep the best.

```python
cs = np.arange(424, 852)
pr = np.array([profit(c) for c in cs])
best = cs[pr.argmax()]
# 594 7.14 0.0779
print(best, round(pr.max() / 1e9, 2), round(good / (good + bad), 4))
plt.plot(cs, pr / 1e9)
plt.axvline(best, ls="--")
plt.xlabel("approve from score"); plt.ylabel("profit, bn soum")
plt.show()
```

The best line is **594**, with 7.14 bn soum: 0.23 bn more than approving everyone. Every cut-off from 593 to 600 is within 0.3 % of it. Below 600 sit grade D's loans, 11.2 % bad — above the break-even; above it, grade C's, at 5.0 % — below it.

**When you use it.**
- The starting point of a cut-off recommendation.
- Again whenever the money changes: funding cost, LGD, the product's rate (the explorer's 22 % moves the line to 659).

> ⚠️ **Watch out.** The top of the curve is flat and jagged; the single best point (594) is partly noise. Recommend a round line you can explain — 600, the edge of grade D — and give the range.

**Your turn.** At 22 % funding, a good loan leaves 695 496 soum and a bad one costs 17 978 554. What is the break-even bad rate, in %, to 2 decimals?

### A bad-rate target — and what it costs

**What it is.** Risk appetite is often written as a **bad-rate target** (*целевая доля плохих*): "the loans we approve must stay under 2 % bad". The loosest cut-off that meets it is rarely the most profitable one. The difference is the **price of the target** — a number the committee should see before it votes.

**How to write it.**

```python
ok = [c for c in cs if (s >= c).any() and y[s >= c].mean() <= 0.02]
c2 = min(ok)
share, br, n, b = at(c2)
# 647 74.3 1.997 6.12
print(c2, round(100 * share, 1), round(100 * br, 3), round(profit(c2) / 1e9, 2))
```

The loosest line under 2 % is **647**: 74.3 % approved at a 1.997 % bad rate, and 6.12 bn soum — 1.02 bn less than the best line, and 0.79 bn less than approving everyone.

**When you use it.**
- A committee proposes a target → you show the line it implies and the money it costs.
- Comparing two policies with the same bad rate: prefer the one that keeps more goods.

> ⚠️ **Watch out.** The lowest bad rate is not a goal. Approving only 720 and above gives 0.90 % — and 2.28 bn soum, a third of the best.

**Your turn.** Why can the line under the 2 % target earn less than approving everyone?

### Swap-in and swap-out — what a new line changes

**What it is.** A new policy changes decisions both ways compared with today's. **Swap-outs** (*swap-out*) are applicants approved today and declined by the new rule: Nur knows how their loans went. **Swap-ins** (*swap-in*) are applicants rejected today and approved by the new rule: nobody knows, because Nur never lent to them. Guessing how they would have behaved is **reject inference** (*оценка отклонённых заявок*).

**How to write it.** A pure "approve 600 and above" rule against today's decisions:

```sql
SELECT CASE WHEN status = 'rejected' AND credit_score >= 600
            THEN 'swap-in'
            WHEN status IN ('approved', 'approved_not_disbursed')
                 AND credit_score < 600
            THEN 'swap-out'
            ELSE 'same' END AS change,
       COUNT(*) AS applications
FROM applications
WHERE credit_score IS NOT NULL
GROUP BY change;
```

The rule would swap out 363 approved applications (331 of them became loans, and 37 of those went bad — known) and swap in 2 295 rejected applicants whose bad rate nobody knows.

**When you use it.**
- Every policy change: show both sets, with what is known and what is guessed.
- Loosening a cut-off is the dangerous direction: it lives on swap-ins.

> ⚠️ **Watch out.** Swap-ins were rejected for a reason — often a policy rule, not the score. Assuming they behave like approved applicants with the same score usually underestimates their risk.

**Your turn.** Why can't you compute the bad rate of the 2 295 swap-ins from Nur's data?

### Policy rules besides the score

**What it is.** A credit decision is the score **and** the **policy rules** (*кредитная политика, стоп-факторы*): hard rules that decline whatever the score says — age, income, the share of income going to payments, recent delinquencies at the bureau, fraud flags, a blacklist — and **overrides** (*ручные решения*), where a credit officer goes against the score. That is how Nur rejected applicants with 720 and lent below 560.

**How to write it.** The rejection rate by grade band:

```sql
SELECT CASE WHEN credit_score < 600 THEN '1: below 600'
            WHEN credit_score < 660 THEN '2: 600-659'
            WHEN credit_score < 720 THEN '3: 660-719'
            ELSE '4: 720+' END AS band,
       COUNT(*) AS applications,
       ROUND(100.0 * SUM(status = 'rejected') / COUNT(*), 1)
         AS rejected_pct
FROM applications
WHERE credit_score IS NOT NULL
GROUP BY band ORDER BY band;
```

Below 600, 55.0 % of applicants are rejected; 600–659, 31.6 %; 660–719, 15.2 %; 720 and above, 5.9 %. Rejection falls with the score but never reaches zero: other rules decide too.

**When you use it.**
- A cut-off study must keep the policy rules fixed — or it promises swap-ins the rules would reject anyway.
- Monitoring: the **override rate** (decisions against the score) shows whether people trust the scorecard.

**Your turn.** Of 2 150 applicants with 720 or more, 126 were rejected. What share, in %, to 1 decimal?

### Champion / challenger — testing a new line

**What it is.** **Champion / challenger** (*чемпион / претендент*) is W7's A/B test applied to credit decisions. The current policy, the champion, decides most applications; a random share goes through the new one, the challenger. When the loans have matured, the two groups' bad rates and profits are compared.

**How to write it.** How many loans does each arm need to see a lower bad rate? W7's power calculation:

```python
from statsmodels.stats.proportion import proportion_effectsize
from statsmodels.stats.power import NormalIndPower

for p2 in (0.0255, 0.0200):
    h = proportion_effectsize(0.0293, p2)
    n = NormalIndPower().solve_power(h, alpha=0.05, power=0.8)
    print(p2, round(n))
```

To see a fall from 2.93 % to 2.55 % (the line at 600) each arm needs about 28 936 loans — more than Nur has made in its life (7 828). A fall to 2.00 % needs about 4 325.

**When you use it.**
- A big change with a big expected effect: a new scorecard, a new product rule.
- Not for small cut-off moves: judge those on the swap sets and the profit curve, and read an early indicator (FPD30, W5) instead of the final bad rate.

> ⚠️ **Watch out.** Bad loans take months to show. Fix the test's length and its sample before it starts and do not stop at the first good month (W7's peeking).

**Your turn.** Why is champion / challenger a poor tool to choose between the lines 594 and 600?

### PSI — has the population moved?

**What it is.** The **population stability index**, **PSI** (*индекс стабильности популяции*), compares how this period's applicants spread over the score bands with how the reference period's did — here 2024, the scorecard's first year. For each band, (actual share − expected share) × ln(actual share ÷ expected share); add the bands up. The usual reading: **under 0.1 stable, 0.1–0.25 watch, over 0.25 act**.

**How to write it.**

```python
A = pd.read_sql("""SELECT applied_at, credit_score FROM applications
                   WHERE credit_score IS NOT NULL""", con)
edges = [560, 600, 640, 680, 720]
def shares(x):
    band = np.searchsorted(edges, x, side="right")
    return np.bincount(band, minlength=6) / len(x)
def psi(e, a):
    return np.sum((a - e) * np.log(a / e))

yr = A["applied_at"].str[:4]
e = shares(A.loc[yr == "2024", "credit_score"].to_numpy())
a = shares(A.loc[yr == "2026", "credit_score"].to_numpy())
# 0.0037
print(round(psi(e, a), 4))
```

| band | 2024 | 2026 | its part |
|---|---|---|---|
| below 560 | 4.71 % | 4.64 % | 0.0000 |
| 560–599 | 10.52 % | 11.25 % | 0.0005 |
| 600–639 | 20.03 % | 21.73 % | 0.0014 |
| 640–679 | 25.84 % | 25.97 % | 0.0000 |
| 680–719 | 22.70 % | 20.82 % | 0.0016 |
| 720+ | 16.19 % | 15.59 % | 0.0002 |

PSI = 0.0037: 2026's applicants spread over the bands almost exactly like 2024's. The population is stable.

**When you use it.**
- Every month, for every scorecard in use.
- Before reusing last year's cut-off on this year's applicants.

> ⚠️ **Watch out.** An empty band makes ln(0) blow up: floor every share at a tiny value (0.01 %) or merge the band with its neighbour. And a stable PSI says only that the *population* has not moved — not that the score still ranks (that is the Gini's job).

**Your turn.** What is the PSI of 2025's applicants against 2024's, to 4 decimals?

### CSI — which characteristic moved

**What it is.** The **characteristic stability index**, **CSI** (*индекс стабильности характеристики*), is the same formula on one input instead of the score: the channel, the product, the requested amount, the term. When the PSI rises, the CSIs show which input moved.

**How to write it.** Bands of the requested amount from 2024's quintiles, then the same `psi`:

```python
B = pd.read_sql("SELECT applied_at, requested_amount FROM applications", con)
by = B["applied_at"].str[:4]
r24 = B.loc[by == "2024", "requested_amount"].to_numpy()
r26 = B.loc[by == "2026", "requested_amount"].to_numpy()
q = np.quantile(r24, [0.2, 0.4, 0.6, 0.8])
def share_q(x):
    return np.bincount(np.searchsorted(q, x, side="right"), minlength=5) / len(x)
# 0.0033
print(round(psi(share_q(r24), share_q(r26)), 4))
```

| characteristic | CSI 2026 vs 2024 |
|---|---|
| channel | 0.0001 |
| product | 0.0005 |
| term in months | 0.0033 |
| requested amount | 0.0033 |

Every input is stable. The largest move: 22.0 % of 2026's applicants ask for 2.41 m soum or less, against 19.9 % in 2024.

**When you use it.**
- Right after an amber or red PSI, to find the cause.
- Before a product launch or a new partner: expect the channel's CSI to jump.

**Your turn.** The PSI is 0.18 and the channel's CSI is 0.15; every other CSI is under 0.01. What do you look at first?

### The monthly monitoring view

**What it is.** A **monitoring report** (*мониторинг модели*) is one page a month, always the same four blocks: the **population** (PSI of the month's applicants, the average score), the **ranking** (Gini on vintages old enough to judge), the **outcome** (bad rate by vintage, compared at the same age), and the **policy** (approval rate, overrides).

**How to write it.** The PSI of each month of 2026 against 2024:

```python
A["ym"] = A["applied_at"].str[:7]
m = A[yr == "2026"].groupby("ym")["credit_score"]
view = m.agg(applicants="size", avg_score="mean")
view["psi"] = m.apply(lambda x: psi(e, shares(x.to_numpy())))
view.round(4)
```

| month | applicants | PSI |
|---|---|---|
| 2026-01 | 505 | 0.0179 |
| 2026-03 | 593 | 0.0079 |
| 2026-05 | 618 | 0.0040 |
| 2026-07 | 634 | 0.0174 |
| 2026-09 | 609 | 0.0115 |
| 2026-10 | 129 | 0.0617 |

The box prints all ten months; the table shows every other one and October. Below, the loans by half-year of disbursal:

| vintage | loans | bad rate | Gini |
|---|---|---|---|
| 2024 H1 | 667 | 4.05 % | 0.42 |
| 2024 H2 | 1 032 | 3.97 % | 0.41 |
| 2025 H1 | 1 297 | 4.01 % | 0.41 |
| 2025 H2 | 1 659 | 4.34 % | 0.39 |
| 2026 H1 | 1 884 | 1.65 % | 0.29 |
| 2026 H2 | 1 076 | 0.00 % | — (no bad yet) |

Every month is green; October's 0.062 comes from 129 applicants — a small month jumps. The Gini drifts from 0.42 to 0.39 over two years, and the 2026 vintages are too young: their bad rate is low because they are young, not because they are good.

**When you use it.**
- The risk committee's standing item: the same page, the same order, every month.
- A trend matters more than one month's colour.

> ⚠️ **Watch out.** A PSI on a few hundred applicants moves by chance. Read a month together with its size and the months around it; act on a trend, not on one partial month.

**Your turn.** October 2026 shows PSI 0.062 on 129 applicants, against 0.004–0.018 for every full month. What do you write?

### What to do when it drifts

**What it is.** Each signal has its own usual cause and action. The monitoring page ends with a decision, not with a chart.

**How to write it.**

| signal | usual cause | action |
|---|---|---|
| PSI < 0.1, Gini steady | nothing moved | note it; next month |
| PSI 0.1–0.25 | the mix moved (a channel, a product, a campaign) | CSIs; bad rate by band in the moved group; adjust its cut-off |
| PSI > 0.25 | a new population | restrict the score, recalibrate or rebuild |
| Gini falls beyond its interval | the score ranks worse | review; rebuild with recent loans |
| bad rate up, Gini steady | the level moved, the order did not | recalibrate the PD; move the cut-off; reprice |

Nur today sits in the first row: PSI 0.0037, every CSI under 0.01, the Gini a little lower out of time but within noise.

**When you use it.** At the end of every monitoring report: one line, "signal → action → owner → date".

### Putting it together

Nilufar's two questions, one tool per line. **Where to draw the line:** the trade-off table → bads avoided against goods lost → expected loss per loan → profit with W8D2's prices → the best line where the loans below it go bad more than 7.79 % → what a 2 % target costs → the swap sets → the policy rules → why a test cannot settle a 6-point move. **How to know it still holds:** PSI → CSI → the monthly page → the decision table.

| question | tool | Nur |
|---|---|---|
| what does a line do | approval, bad rate | 600: 95.7 %, 2.55 % |
| what does it earn | profit by cut-off | best 594: 7.14 bn |
| what does 2 % cost | the target's line | 647: −1.02 bn |
| who changes | swap-in, swap-out | 2 295 in, 363 out at 600 |
| has the population moved | PSI | 0.0037, stable |
| which input moved | CSI | all under 0.01 |

### Depth (optional)

- **Books.** Naeem Siddiqi, *Intelligent Credit Scoring* (Wiley, 2nd ed., 2017): the chapters on choosing cut-offs, swap sets, policy rules and the monitoring reports (population stability, characteristic analysis). Lyn Thomas, Jonathan Crook and David Edelman, *Credit Scoring and Its Applications* (SIAM, 2nd ed., 2017): cut-offs by profit, and reject inference.
- **Where the PSI comes from.** The PSI is the symmetric Kullback–Leibler divergence (Jeffreys' divergence) between the two band distributions: the sum of KL(actual ‖ expected) and KL(expected ‖ actual). That is why it is never negative and why swapping the two years gives the same number.
- **Cut-offs in practice.** Lenders often set the line by product and channel, add a "refer" zone around it for manual review, and keep a strategy table: cut-off, expected approval, bad rate and profit, signed by the risk committee.
- *Russian terms:* порог отсечения = cut-off, уровень одобрения = approval rate, безубыточная доля плохих = break-even bad rate, риск-аппетит = risk appetite, оценка отклонённых заявок = reject inference, стоп-факторы = hard policy rules, ручное решение (override) = override, чемпион / претендент = champion / challenger, индекс стабильности популяции = PSI, индекс стабильности характеристики = CSI, мониторинг модели = model monitoring, перекалибровка = recalibration.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak.


=====
PAGE: Week 9 · Day 5 — Checkpoint: the scorecard review for the risk committee (weeks/week-09/day-5.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-09/day-5
=====

# Week 9 · Day 5 — Checkpoint: the scorecard review for the risk committee

<span class="badge">Performance 75 min</span> <span class="badge">Stability 45 min</span> <span class="badge">Cut-off 75 min</span> <span class="badge">Memo 45 min</span> <span class="badge hw">Checkpoint · 100 points</span>

> STORY **Friday, 9:00.** Nilufar, Madina and Jasur. Nilufar: *"Our application scorecard was built two years ago. On Monday the risk committee will ask me two things: does it still work, and is our approval cut-off in the right place? I want the answer on one page."* Madina: *"Three parts, in the order the committee reads them: how well the score ranks, whether the people applying have changed, and where the app's cut-off should sit — with its bad rate and its money."* Jasur: *"And every Gini with its number of bads. A Gini on thirty bads is not a Gini on two hundred."*

## Today in 3 lines

- **Part A — performance (30 pts):** in `checkpoint.ipynb` (the template is `data/python/week9/checkpoint.ipynb`), the AUC, Gini and KS of the credit score — on all loans, by risk grade, and out of time (older loans against 2026).
- **Part B — stability (20 pts):** the PSI of applicants' scores, 2026 against 2024; then the product mix and the approved loans.
- **Part C — the cut-off (30 pts):** the table of approval against bad rate, the profit of each cut-off for Micro loans with Week 8 Day 2's unit economics, the loans a new cut-off would refuse — and **the one-page memo** for the committee (`memo.md`, Part D, 20 pts).

**Rules.** Open book: this week's pages and notebooks, and [Week 8 · Day 2](weeks/week-08/day-2.md) for the unit economics. Hand in with the **📎 box at the end of this page**: `checkpoint.ipynb` (executed — Kernel → Restart & Run All, then save) and `memo.md`. Data as of **2026-10-01**. The template's loader builds `loans` (7 828 loans: the score at the door, `bad`, the year, the score band and Week 8 Day 2's per-loan economics), `sc` (the 7 615 loans with a score) and `apps` (14 000 applications with the applicant's score and band). Closed: the model answers until you submit.

**Bad**, as all week: a loan whose status is `default` or `written_off` — 234 of the 7 828 loans (2.99 %), and 223 of the 7 615 loans with a score.

**What every answer contains** (the mentor checks it): the population in a comment (which loans, how many, how many bads); the code; the output (numbers visible in the saved notebook); the method named (AUC from Mann–Whitney, KS on the cumulative shares, PSI by band, the contribution per loan); and **two sentences**: what the number says, with its n — and what the committee should do with it. A right number without the two sentences is half an answer.

> 💡 **Key idea.** A scorecard review answers three questions in order: does the score still rank (performance), is it still scoring the same people (stability), and is the line drawn in the right place (the cut-off). A good answer to one does not answer the next.

**Plan for the day.**

| Time | What | Output |
|---|---|---|
| 9:00–9:15 | Read all four parts; open the template; Restart & Run All (the loader asserts 7 828 / 234 / 7 615 / 223 / 14 000) | a green first cell |
| 9:15–10:30 | Part A, A1 → A3 | three results, three interpretations |
| 10:30–11:15 | Part B, B1 → B2 | two results, two interpretations |
| 11:15–11:30 | Break; Restart & Run All; save | `checkpoint.ipynb` with outputs |
| 11:30–12:45 | Part C, C1 → C3 | the table, the profit by cut-off, the recommendation |
| 12:45–13:30 | Part D, the memo | `memo.md` |
| 13:30–14:00 | The checklist and the day quiz; hand in (box below) | done |

**The shape of one answer** (the habit of the week, shortened):

```python
# (shape only — not meant to run)
# A0 (example). The score on Consumer loans — grain: one loan with a
# score (2 350 Consumer loans, 73 bad)
cs = sc[sc["product"] == "CONS"]
good = cs.loc[cs["bad"] == 0, "credit_score"]
bad = cs.loc[cs["bad"] == 1, "credit_score"]
# AUC = U / (n_good · n_bad): the share of good–bad pairs that the
# score puts in the right order, ties counted half
auc = stats.mannwhitneyu(good, bad).statistic / (len(good) * len(bad))
# 0.683 0.366
print(round(auc, 3), round(2 * auc - 1, 3))
```

> **Interpretation.** On 2 350 Consumer loans with 73 bads, the score's Gini is 0.366 (AUC 0.683; KS 0.37 at score 657): a random good loan outscores a random bad one 68 % of the time. It ranks, but weakly — below the 0.4–0.6 usual for an application scorecard — so it can draw a cut-off, but it should not decide a large Consumer loan on its own.

Two sentences: the number with its n and its method, then what it means for a decision. Never "the model is 68 % accurate": the AUC is about pairs of loans, not about loans classified right.

Put the memo's parts in the order the committee reads them:

One line of this A0 write-up would be marked wrong — tap it:

---

## Part A — Performance: does the score still rank? (75 min)

### A1. AUC, Gini and KS of the credit score — all loans

- **Data.** `sc` — one row per loan with a score (7 615 loans, 223 bad).
- **Do.** The AUC (the share of good–bad pairs in which the good loan has the higher score, ties counted half), the Gini = 2 · AUC − 1, and the KS — the largest gap between the cumulative share of bads and the cumulative share of goods, read from the lowest score up — with the score where it happens.
- **Answer.** How good is the ranking against the range usual for application scorecards (Gini 0.4–0.6)? In the box: the Gini, to 3 decimals.
- **Taught in.** Day 3 (ROC, AUC, Gini, KS).

*Mistakes seen most often:* the AUC turned upside down — `roc_auc_score(bad, score)` gives one minus the AUC, because a higher score means a *safer* loan (use `1 - bad`, or `-score`); the Gini reported as the AUC; the KS read as a score ("KS = 658"); no n and no bads in the sentence.

### A2. By grade — four steps of the same score

- **Data.** `sc`, with `risk_grade` (A–D).
- **Do.** First each grade's loans, bads, bad rate and score range (min, max). Then two kinds of Gini: the grade's own — the grade used as a four-step score (A = 4, B = 3, C = 2, D = 1) on the same 7 615 loans — and the score's Gini *inside* each grade.
- **Answer.** Where does the score's ranking power live — in the steps between grades, or in the exact score inside a grade? What does that mean for a cut-off moved by 10 points? In the box: the grade's own Gini, to 3 decimals.
- **Taught in.** Day 2 (risk grades as score bands) and Day 3 (the score's Gini against the grade's).

*Mistakes seen most often:* the grade mapped the wrong way round (A = 1 gives a negative Gini); the grade's Gini computed on all 7 828 loans (0.389) and compared with the score's on 7 615 — not the same loans; the bad rates by grade on all loans (0.93 / 1.88 / 5.12 / 10.91 %) mixed with the Ginis on scored loans without saying so; "the score is useless inside B" as a fact, with no interval.

### A3. Out of time — older loans against 2026

- **Data.** `sc` split by the year of disbursement: 2024–2025 (the older loans) and 2026.
- **Do.** For each period: loans, bads, the bad rate, the AUC, the Gini and the KS. Then a bootstrap 95 % interval for each Gini (1 000 resamples of loans, `np.random.default_rng(2026)`), and the 2026 bads by month of disbursement.
- **Answer.** Has the score got worse in 2026, or can the data not tell yet — and why? In the box: the 2026 Gini, to 3 decimals.
- **Taught in.** Day 3 (out-of-time validation); the bootstrap from Week 6 Day 2.

*Mistakes seen most often:* "the scorecard broke in 2026" from a point estimate on 31 bads; 2026's low bad rate read as "2026 borrowers are safer" (they are younger); no interval and no n; the months from June pooled in without a word that they have no bads yet.

**If you are stuck (hints, not answers).**

- A1: `stats.mannwhitneyu(good, bad).statistic / (len(good) * len(bad))` is the AUC, with the goods first; the KS comes from `groupby("credit_score")` and two `cumsum()` — Day 3.
- A2: start with `sc.groupby("risk_grade")["credit_score"].agg(["min", "max"])`; then turn the grade into numbers with `map()` (higher = safer, as the score) and use A1's function on that column — Day 3.
- A3: `sc[sc["year"] < 2026]` and `sc[sc["year"] == 2026]`; one bootstrap resample is `t.iloc[rng.integers(0, len(t), len(t))]` — Week 6 Day 2.

---

## Part B — Stability: are we scoring the same people? (45 min)

### B1. PSI of applicants' scores — 2026 against 2024

- **Data.** `apps` — one row per application; keep the ones with a score (2024: 2 995, 2025: 5 256, 2026: 5 361), in the six bands of the week (`band`).
- **Do.** Each year's share of applicants per band; each band's part (actual − expected) × ln(actual ÷ expected), with 2024 as the expected; the PSI is the sum of the six parts. For 2025 and for 2026.
- **Answer.** Is the population stable on the usual traffic light (below 0.1 stable, 0.1–0.25 watch, above 0.25 act)? Which band moved most? In the box: the PSI of 2026 against 2024, to 3 decimals.
- **Taught in.** Day 4 (PSI).

> ⚠️ **Watch out.** One month is a small sample: against 2024, each 2026 month of about 600 applications has a PSI of up to about 0.02 from sampling alone. On the monthly view, compare a month with that range, not with zero.

*Mistakes seen most often:* the shares rounded to one decimal before the formula (that moves the PSI); counts used instead of shares; "the PSI is near zero, so the scorecard still works" — a PSI says nothing about ranking (that was Part A); the year taken from the loans (that is B2's question) instead of the applications.

### B2. Two more views — the product mix, and the approved loans

- **Data.** `apps` (all 14 000 applications, by `product`) and `sc` (the loans, by `band` and year of disbursement).
- **Do.** (1) The CSI of the product mix of applicants, 2026 against 2024 — B1's formula on the product shares. (2) The same PSI on the **approved loans** (`sc`), 2026 against 2024, with the band shares of both years.
- **Answer.** Why is the loans' PSI larger than the applicants', and which of the two belongs in the committee's stability line? In the box: the loans' PSI, to 3 decimals.
- **Taught in.** Day 4 (PSI and CSI).

*Mistakes seen most often:* the stability line built on loans only, so a change in who gets approved is read as a change in who applies; the CSI on the product of the *loans*; no sentence on what sits between the two populations.

**If you are stuck (hints, not answers).**

- B1: `value_counts(normalize=True).sort_index()` per year gives the shares in band order; then `((o - e) * np.log(o / e)).sum()` — Day 4.
- B2: the same function on `apps["product"]`, and on `sc["band"]` split by `sc["year"]` — Day 4.

---

## Part C — The cut-off: where should the line sit? (75 min)

Today Nur has no hard score cut-off: officers and the app approve some applicants at every score — about a quarter of the decided applications below 600 (24 % under 560, 23 % at 560–599). "Approve score ≥ c" is the policy the committee can set.

### C1. The trade-off — loans kept against bad rate

- **Data.** `sc` (7 615 loans with a score, 223 bad) — or the same population in SQL, from `loans` and `applications`.
- **Do.** For the cut-offs 560, 600, 620, 640 and 660 ("approve score ≥ c"): the share of loans kept, their bad rate, and the bads avoided.
- **Answer.** What does each step of the cut-off buy in bads, and what does it cost in loans — and where is the biggest step? In the box: the bad rate of the loans kept at a cut-off of 600, in % to 2 decimals.
- **Taught in.** Day 4 (approval against bad rate).

*Mistakes seen most often:* the bad rate of the kept loans divided by all 7 615 loans; "bads avoided" counted among the kept loans; the 213 loans with no score left in (they have no score to cut on — say they are decided another way).

### C2. Profit by cut-off — Micro, the app's own decision

The app decides Micro loans without an officer, so its cut-off is one number the committee can change on Monday. Use Week 8 Day 2's unit economics, loan by loan:

```text
contribution of one loan
  good: + interest over the schedule
  bad:  − LGD × EAD (and no interest)
  both: − balance-months × COF ÷ 12
        − ACQ[channel]
        − SERV[channel] × term
```

- **Data.** `sc` where `product == "MICRO"` (2 598 loans, 73 bad), with `interest`, `bal_months`, `ead`, `channel` and `term`; the assumptions `COF`, `LGD`, `ACQ` and `SERV` from the loader.
- **Do.** Each loan's contribution, as in the box above. Then, for no cut-off and for every 10 points from 540 to 720: the share of loans kept, their bad rate, the bads avoided and the total contribution in million soum.
- **Answer.** Which cut-off earns most, and what are its approval share, bad rate and profit against no cut-off? Why does the profit fall again above it? In the box: the profit-maximising cut-off.
- **Day 4 vs here.** Day 4's P4 found 659 with Micro's *average* numbers, trying every single point. Here each loan carries its own interest and balance, and you step by 10 points — so expect a close neighbour, not a contradiction.
- **Taught in.** Day 4 (profit by cut-off); Week 8 Day 2 (the contribution of one loan).

*Mistakes seen most often:* interest counted for the bad loans; the cost of funds on the full principal instead of the falling balance; the cut-off read off the bad rate ("720 — the lowest bad rate"); one cut-off for the whole book with BNPL in it (it has no interest in our data, so every BNPL loan "loses" — Week 8 Day 2); a profit table with no assumptions printed under it.

### C3. Who the new cut-off refuses — the swap set and the recommendation

- **Data.** `m` from C2.
- **Do.** The **swap-out set** of your C2 cut-off — the Micro loans it would have refused: loans, bads, bad rate and contribution, by grade and in total. Compare each grade's bad rate with Week 8 Day 2's Micro break-even PD: 4.23 % for a first loan, 7.23 % for a repeat loan.
- **Answer.** Your recommendation in three sentences: the cut-off, what it gains and what it costs, and how you would roll it out (all at once, or as a challenger first). In the box: the bad rate of that swap-out set, in % to 2 decimals.
- **Taught in.** Day 4 (swap-in and swap-out, champion / challenger); Week 8 Day 2 (break-even).

*Mistakes seen most often:* the swap set taken from all products; "the new cut-off avoids so many bads" with no word about the good loans it also refuses; a recommendation with no rollout and no date for the next read.

**If you are stuck (hints, not answers).**

- C1: a `VALUES` list of cut-offs `CROSS JOIN` the loans, then `SUM(score >= cut)` counts the kept loans — or a loop over the cut-offs in pandas — Day 4.
- C2: `np.where(m["bad"] == 1, -LGD * m["ead"], m["interest"])` minus the three costs; then one row per cut-off, and `idxmax()` on the profit — Week 8 Day 2 and Day 4.
- C3: `m[m["credit_score"] < c].groupby("risk_grade")`, with c your C2 cut-off; the two break-evens are in Week 8 Day 2, P5.

---

## Part D — The memo for the committee (45 min)

- **Do.** One page for the risk committee, 250–400 words: the answer first, in three lines; then performance, stability, the recommendation, the risks with the date of the next read, and the definitions. Every rate and every Gini with its n.
- **Where.** `memo.md`, written in the 📎 box below.
- **Shape.** Week 8's pyramid: the answer, then the reasons, then the evidence — a member who reads only the first three lines must still know what to decide.

```markdown
# Application scorecard review — data as of 2026-10-01
**Answer.** …
## 1. Does it still rank?
## 2. Are we scoring the same people?
## 3. Where the app's cut-off should sit
## 4. Risks and the next read
## Definitions and assumptions
```

**Questions the committee will ask** (prepare one sentence each): *"Why is our Gini below 0.4?"* (the scorecard sees little information; a challenger built with more characteristics, chosen with WoE and IV — Day 2) · *"Is 2026 worse?"* (few bads on young loans, a wide interval — A3) · *"Why not 700 — even fewer bads?"* (profit falls: refusing good customers costs more than the bads it avoids — C2) · *"What do we lose with the new cut-off?"* (the refused loans and their customers — C3) · *"When do we rebuild the scorecard?"* (a PSI above 0.25, or a Gini on mature loans below the floor the committee sets — Day 4) · *"How will we know the new cut-off works?"* (champion / challenger: the bad rate by vintage at six months, the approval rate every month — Day 4).

---

## Before you submit

- [ ] Kernel → Restart & Run All finishes with no red cell; the loader's asserts passed; the file is saved **after** the run.
- [ ] Every task cell prints its numbers (a table shown, or `print`) — the reviewer reads the saved outputs, not your code.
- [ ] Every Gini and every bad rate has its n — and its bads.
- [ ] The AUC has the right direction: a higher score means a safer loan (A1 above 0.5).
- [ ] A3 says why 2026 cannot be judged yet; B2 says what sits between applicants and loans; C2 prints its assumptions.
- [ ] Sixteen sentences: two per task, what the number says and what to do with it.
- [ ] `memo.md` starts with the answer and fits on one page.

---

## What the mentor checks and what happens next

| Part | Points | What the mentor checks |
|---|---|---|
| A — performance | 30 | AUC, Gini and KS right, with the score's direction right; by grade and out of time, each with its n and bads |
| B — stability | 20 | the PSI on unrounded shares; the traffic light read; applicants against loans explained |
| C — the cut-off | 30 | the trade-off table; the contribution per loan with Week 8's assumptions; the best cut-off; the swap-out set against the break-even; a rollout |
| D — the memo | 20 | the answer first; every number with its n; the definitions on the page; one page |

**The voucher.** Pass with 70 % or more and Checkpoint 9 wins a fixed voucher of **200 000 soum** — 250 000 at 90 %+, and 10 % more after a week with all five daily challenges. It sits outside the doubling chain, so a miss here does not step the chain back ([Progress & rewards](progress.md)).

The mentor reviews the notebook and the memo and writes back part by part in 📤 Homework; anything to redo comes as a short list of tasks, not the whole week. The memo is a portfolio piece: keep it next to your Week 8 capstone, and before an interview at a bank go through the credit-risk questions of the [interview bank](company/interview.md) (F1–F5).

<details><summary>Week 9 in five sentences (open after submitting)</summary>

1. "The score ranks with a Gini of 0.38 on 7 615 loans and 223 bads" — every Gini with its n and its bads.
2. "The grade is the score in four steps, and the steps carry the ranking" — so a cut-off moved inside a grade changes little.
3. "2026 looks lower, on 31 bads of young loans" — out of time, compare loans of the same age before you call it decay.
4. "The applicants' PSI is 0.004: we are scoring the same people" — stability is measured on applicants, not on the loans we chose.
5. "For Micro, 660 earns most but refuses a third of the loans: grade D out now, 660 as a challenger" — a cut-off with its profit, its cost and its rollout.

</details>

> 💡 **Key idea.** The five sentences have the shape of the whole course — a number, its n, and the decision it supports — now said about a model instead of a metric.

> 🚀 **Stretch (optional).** One cut-off for every product is the wrong question. Redo C2's contribution for **Consumer** loans (branch: acquisition 450 000, servicing 25 000 a month) and add it up by grade. Which grades lose money?

---

### 📎 Hand in here

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak.


=====
PAGE: Week 9 · Day 6 — Final exam: credit risk and the whole course (weeks/week-09/day-6.md)
LINK: https://raxmatov005.github.io/analytics-course/#/weeks/week-09/day-6
=====

# Week 9 · Day 6 — Final exam: credit risk and the whole course

<span class="badge">Exam 60 min</span> <span class="badge">Interview 45 min</span> <span class="badge hw">Final exam · 100 points</span>

> STORY **Final exam day, 10:00.** The whole team is in the room: Madina, Bekzod, Nilufar and Jasur. Madina: *"This is the last page of the course. Nine weeks ago you could not write a JOIN. Today we ask what we ask a new analyst: first the credit risk of this week, then everything that came before it."* Nilufar: *"Credit risk first, because it is what we do all day."* Jasur: *"Bring your notes. Nobody answers for you."*

## Today in 3 lines

- You show that you can judge a scorecard (correlation and regression, logistic regression, AUC, Gini and KS, the cut-off, PSI) and that you still have the whole course in your hands.
- **Part A (40 points):** 25 quick questions with the classic traps inside: 15 on Week 9 and 10 from the rest of the course. It is marked on the spot.
- **Part B (60 points):** the final interview on the Nur Finance data — five questions you answer in words and three small tasks you work out. Your mentor reads it.

---

## 1. How the exam works

- **Two parts.** Part A is a quiz: 25 questions, 40 points, marked at once. Part B is an interview: eight written answers, 60 points, marked by your mentor.
- **Pass mark.** You need 70 of 100 points. In Part A, 80 % right (20 of 25) counts as done. You can repeat Part A as often as you like, and your best attempt counts.
- **What it covers.** Week 9 first: correlation and regression, logistic regression and the scorecard, AUC, Gini and KS, the cut-off and the PSI. Then the whole course, from Day 0 to Week 8: about two questions in five come from there.
- **Open book.** The course pages, your own notes and the [SQL playground](playground.md) are allowed. Chatbots and asking other people are not. A real interview works the same way: you may bring notes, but nobody answers for you.
- **Time.** Plan 60 minutes for Part A and 45 minutes for Part B.
- **Deadline.** Like every hand-in, the exam closes at 23:59 today.
- **After the exam.** Your mentor reviews Part B and sends structured feedback.

---

## 2. Part A — Quick check (40 points)

25 questions in one quiz. Some have one right answer, some have several, some ask for a number or a word. After each answer the quiz tells you why. Questions 1–15 are about Week 9: correlation and regression first, then the scorecard, its quality, the cut-off and the PSI. Questions 16–25 come from the whole course, from SQL to Week 8.

---

## 3. Part B — Interview (60 points)

Eight written answers. Write them as you would say them aloud to a hiring manager.

- **I1–I5 are interview questions.** Answer in 4–6 sentences and use one number from Nur Finance.
- **I6–I8 are small tasks on the data.** Write the query or the code, then the numbers you get and one sentence. Every number is as of 2026-10-01. A loan is *bad* if its status is 'default' or 'written_off'. The *scored* loans are the ones whose application has a credit score.
- Write in your own words. Short and exact beats long.

### 📎 Hand in here

---

## 4. Scoring and what happens next

| Part | Points | Marked by |
|---|---|---|
| A — Quick check | 40 | automatic, your best attempt |
| B — Interview | 60 | your mentor |
| **Total** | **100** | **70 or more passes** |

A pass completes the course. You have shown that you can query, clean, test, run an experiment, build a dashboard, tell the story and judge a scorecard: the work of a junior analyst at a lender. Below 70, the feedback names the topics to repeat, and you and your mentor decide when to try Part B again.

Your feedback arrives on the **[My feedback](feedback.md)** page and in the course bot. Your points go to the [Progress page](progress.md).


=====
PAGE: Glossary — lending and product metrics (company/glossary.md)
LINK: https://raxmatov005.github.io/analytics-course/#/company/glossary
=====

# Glossary — lending and product metrics

Standard definitions, with the places where companies differ marked **[varies]**. Each term says the week where you compute it on Nur Finance data. Russian terms in italics.

> 🧭 **What this page is for.** The words every request at Nur Finance is made of. Learn the sixteen cards first; come back to the full list whenever a day uses a term you cannot define in one line.

Start with the cards: read the term, say its meaning out loud, flip, and mark **Knew it** or **Again**. The cards you miss come back.

## The loan and its life

- **Application** (*заявка*) — a request for a loan. Status: approved / rejected / cancelled / approved but not disbursed. (W1)
- **Approval rate** (*уровень одобрения*) — approved ÷ decided applications. **[varies]** whether cancelled ones are in the denominator; say which you use. (W1 D2)
- **Disbursement** (*выдача*) — paying out the loan; also the sum paid out in a period ("disbursements in September"). (W1, W2)
- **Principal** (*основной долг, тело кредита*) — the amount lent, before interest.
- **Installment / instalment** (*платёж по графику*) — one scheduled payment: principal part + interest part. An **annuity** schedule keeps the total equal every month.
- **Outstanding balance / exposure** (*остаток долга*) — principal not yet repaid. The **portfolio** is the sum of outstanding over all live loans. (W2, W3)
- **Portfolio** (*портфель*) — all loans currently outstanding, taken together; sliced by product, branch, vintage, grade.
- **Vintage / cohort** (*винтаж, когорта*) — the loans disbursed in the same month, followed over time. Vintage curves compare months at the same age. (W3, W8)
- **Risk grade / score** (*скоринговый балл*) — the model's estimate of the borrower's risk at decision time; A–D here, as bands of the score. (W9)

## Delinquency

- **DPD — days past due** (*дней просрочки*) — today minus the due date of the **oldest unpaid** instalment, for a loan. 0 if nothing is overdue. (W1 D3, W2)
- **DPD buckets** — 0 · 1–30 · 31–60 · 61–90 · 90+. **[varies]** some use 1–7 / 8–30, or 180+.
- **FPD / SPD / TPD — first / second / third payment default** — the 1st / 2nd / 3rd instalment was not paid within X days of its due date. **[varies]** X = 30 is common; some use 7 or 10 for FPD. FPD is the earliest signal of a bad decision or fraud, so it is watched per vintage and per channel. (W1 D3, W2 D4, W6)
- **PAR30 / PAR90 — portfolio at risk** — outstanding of loans with DPD > 30 (or 90) ÷ total outstanding. (W2 D3, W3)
- **NPL — non-performing loans** (*просроченные / проблемные кредиты*) — loans with DPD > 90 (**[varies]**: 60 in some regimes); the NPL ratio is their outstanding ÷ total.
- **Roll rate** (*миграция*) — share of loans moving from one bucket to the next between two months (e.g. 1–30 → 31–60). (W3)
- **Cure rate** — share of delinquent loans that return to DPD 0.
- **Write-off** (*списание*) — removing a loan from the live portfolio as a loss, usually at 180+ DPD **[varies]**. **Recovery** — money collected after write-off.
- **PD — probability of default** (*вероятность дефолта*) — the chance a loan defaults (usually 90+ DPD) within a horizon, typically 12 months. (W6 D1)
- **LGD — loss given default** (*потери при дефолте*) — the share of the exposure lost if the loan defaults, after recoveries. Often 50–80 % for unsecured consumer loans. (W6 D1)
- **EAD — exposure at default** — what is owed at the moment of default; for an amortising loan, roughly the outstanding balance. (W6 D1)
- **EL — expected loss** (*ожидаемые потери*) — PD × LGD × EAD; the basis of provisions. Under **IFRS 9** banks hold 12-month EL for healthy loans and lifetime EL for loans whose risk has grown significantly. **[varies]** how each PD and LGD is estimated. (W6 D1)
- **Cost of risk** — provisions (or losses) in a period ÷ average portfolio.
- **Collection rate** — amount collected ÷ amount due in the period.

## Money and performance

- **Yield / APR** — interest earned ÷ average outstanding; the rate charged.
- **Average ticket** (*средний чек*) — average principal per loan.
- **Term** (*срок*) — months of the schedule.
- **Unit economics** — revenue and cost per loan or per customer; whether a product makes money after losses and acquisition cost. (W8)
- **LTV / CAC** — lifetime value of a customer vs the cost to acquire one. (W8)

## Product and app metrics

- **Funnel** (*воронка*) — the steps from app open to the money — signed contract, then the disbursed loan — and the share that survives each step; end it at the table that books the money. (W8)
- **Conversion** — share moving from one step to the next.
- **Activation** — first meaningful action (here: first disbursed loan).
- **Retention / churn** (*удержание / отток*) — share of a cohort still active after N months; churn is the opposite. (W8)
- **DAU / MAU** — daily / monthly active users; the ratio is "stickiness".
- **NPS** — net promoter score, promoters − detractors.

## Credit risk models

- **Correlation** (*корреляция*) — how closely two numbers move together, from −1 to +1; 0 means no straight-line relation. It is not causation. (W9 D1)
- **Pearson r / Spearman ρ** (*коэффициент корреляции Пирсона / Спирмена*) — Pearson measures a straight-line relation on the values (principal and monthly payment: r = 0.90); Spearman does the same on the ranks, so it suits skewed data and any relation that only rises or only falls. (W9 D1)
- **Linear regression** (*линейная регрессия*) — the straight line y = intercept + slope × x that makes the squared vertical distances from the points as small as possible (least squares); with several predictors, one slope per predictor. (W9 D1)
- **Slope / intercept** (*наклон / свободный член*) — the slope is how much y changes for one unit of x (soum of payment per soum of principal); the intercept is y at x = 0, often outside the data and meaningless on its own. (W9 D1)
- **R²** (*коэффициент детерминации*) — the share of the variation in y the model explains, from 0 to 1; with one predictor it equals r². A high R² proves neither a cause nor a good prediction outside the data. (W9 D1)
- **Residual** (*остаток*) — actual minus predicted, for one row. A residual plot with a pattern says the line misses something. (W9 D1)
- **Logistic regression** (*логистическая регрессия*) — a model for a yes/no outcome: a straight line in the log-odds, turned into a probability between 0 and 1 by the S-shaped logistic curve. Each coefficient, exponentiated, is an odds ratio. (W9 D2)
- **Odds / log-odds** (*шансы / логарифм шансов*) — odds = p ÷ (1 − p): a 2.99 % bad rate is odds of about 1 to 32; log-odds = ln(odds), the scale on which logistic regression is a straight line. (W9 D2)
- **Scorecard** (*скоринговая карта*) — a model turned into points: each characteristic adds points, and the total score ranks applicants (here, higher = safer). **[varies]** the scale (300–850, 0–1 000) and its direction. (W9 D2)
- **PDO — points to double the odds** — how many points of score double the odds of a good loan (often 20); with a base score at base odds it fixes the scorecard's scale. (W9 D2)
- **Calibration** (*калибровка*) — whether predicted probabilities match observed rates: in a band where the model says 4 %, about 4 % should go bad. A model can rank well and still be badly calibrated. (W9 D2)
- **Confusion matrix** (*матрица ошибок*) — at one cut-off, the 2 × 2 count of the decision (refused / approved) against the outcome (bad / good); here "bad" is the positive class. (W9 D3)
- **ROC curve** (*ROC-кривая*) — the true-positive rate (share of bads refused) against the false-positive rate (share of goods refused), one point per cut-off. (W9 D3)
- **AUC — area under the ROC curve** — the chance that a random good loan scores higher than a random bad one, ties counted half: 0.5 is a coin, 1 is perfect. It is about pairs, not about the share of loans classified right. (W9 D3)
- **Gini** (*коэффициент Джини*) — 2 × AUC − 1, from 0 (a coin) to 1 (perfect): the number credit teams quote. Application scorecards are often 0.4–0.6 **[varies]**. Always give it with its number of bads. (W9 D3)
- **KS — Kolmogorov–Smirnov statistic** — the largest gap between the cumulative share of bads and the cumulative share of goods across the scores, with the score where it happens. (W9 D3)
- **Lift / gains** (*лифт / кривая выигрыша*) — lift: how many times more bads the worst-scored X % of loans hold than an average X % would; gains: the share of all bads caught as you refuse more of the lowest scores. (W9 D3)
- **Out-of-time validation** (*проверка вне периода*) — testing a model on loans from a later period than the ones it was built on. Compare loans of the same age: young loans have not had time to go bad. (W9 D3)
- **Cut-off** (*порог отсечения*) — the score below which an application is refused ("approve score ≥ c"). It trades approvals against the bad rate; the best one is set with money, not with the bad rate alone. (W9 D4)
- **Swap set** (*swap-набор*) — the applicants whose decision changes when the cut-off or the model changes: **swap-out** (approved before, refused now) and **swap-in** (refused before, approved now). (W9 D4)
- **PSI — population stability index** (*индекс стабильности популяции*) — Σ (actual share − expected share) × ln(actual ÷ expected) over the score bands: below 0.1 stable, 0.1–0.25 watch, above 0.25 act **[varies]**. Measured on applicants, not on approved loans. (W9 D4)
- **CSI — characteristic stability index** — the PSI formula on one input of the model (income band, product, age), to find which characteristic moved. (W9 D4)
- **Champion / challenger** (*чемпион / претендент*) — the current model or policy (champion) keeps most applicants while a new one (challenger) runs on a random share; both are read on loans of the same age before the challenger may replace it. (W9 D4)

## Trends and forecasting

- **Month-on-month / year-on-year growth (MoM / YoY)** (*рост к прошлому месяцу / году*) — this period ÷ the one before (or the same period a year before) − 1. YoY is the fair comparison when months differ by season. (W8D1, Going further)
- **Seasonality / seasonal index** (*сезонность / сезонный индекс*) — a pattern that repeats with the calendar; the index is a month's value ÷ its level around it, averaged over the years. Check it on at least two years before you claim it. (W8D1, Going further)
- **Moving average** (*скользящее среднее*) — the average of the last n months; it smooths the noise and turns a month late. (W8D1, Going further)
- **Naive / seasonal naive forecast** (*наивный / сезонный наивный прогноз*) — next month = this month; or = the same month a year before. The baseline any smarter method must beat. (W8D1, Going further)
- **Holdout test** (*проверка на отложенных данных*) — hide the last months, forecast them with what came before, measure the miss. (W8D1, Going further)
- **MAE / MAPE** — the average absolute miss, in units / as a % of the actual. (W8D1, Going further)

## IFRS 9 provisions

- **Provision / loss allowance** (*резерв под ожидаемые кредитные убытки*) — the loss the lender expects on the loans it still holds: a stock on the balance sheet (gross loans − provision = net loans); its change in a month, plus write-offs minus recoveries, is that month's charge — the cost of risk. (W8D2, Going further)
- **IFRS 9 stages** (*стадии по МСФО 9*) — 1 performing (12-month expected loss), 2 significant increase in credit risk (lifetime), 3 credit-impaired (default, PD 100 %). (W8D2, Going further)
- **SICR and the 30-day backstop** (*значительное увеличение кредитного риска; критерий 30 дней*) — whatever else the bank looks at, more than 30 days past due puts a loan in stage 2; more than 90, in stage 3. (W8D2, Going further)
- **12-month vs lifetime ECL** (*ОКУ за 12 месяцев и за весь срок*) — the expected loss from defaults in the next year vs until the loan ends. (W8D2, Going further)
- **Cliff effect** (*эффект обрыва*) — the jump in a loan's provision when it moves from stage 1 to stage 2 and its horizon goes from a year to a lifetime. (W8D2, Going further)
- **Coverage ratio** (*коэффициент покрытия резервами*) — provision ÷ gross loans, for the book and per stage. (W8D2, Going further)

## Working tools

- **Data dictionary** (*словарь данных*) — per table its grain, key, rows and source; per column its type, meaning, allowed values, an example and its owner. (W3D4, Going further)
- **Data profiling** (*профилирование данных*) — measuring what a column really holds: rows, distinct values, NULL share, min / max, the values and their counts. (W3D4, Going further)
- **Scheduler** (*планировщик*) — Task Scheduler on Windows or cron on Linux: starts a script at set times, such as the weekly report every Monday. (W5D4, Going further)
- **Commit / staging area** (*коммит / область подготовки*) — `git add` puts a change in the staging area; `git commit` saves what is staged as one version with a message. (W5D4, Going further)
- **Branch / merge** (*ветка / слияние*) — a named line of commits; a merge brings its commits into another branch. (W5D4, Going further)
- **.gitignore** — the file listing what Git must never keep: data, outputs, passwords. (W5D4, Going further)

## Data words

- **OLTP / OLAP**, **fact / dimension**, **star schema**, **grain** — see Week 1 Day 4.
- **KPI** — a metric someone is accountable for; a **metric tree** shows how KPIs decompose (W8).
- **As-of date** — the date a snapshot describes. Nur Finance data is as of **2026-10-01**.


=====
PAGE: The interview bank — 38 questions with model answers (company/interview.md)
LINK: https://raxmatov005.github.io/analytics-course/#/company/interview
=====

# The interview bank — 38 questions with model answers

Thirty-five questions an analyst interview at a bank or lending company asks, grouped as the interviews are: **lending & metrics (10), SQL (6), Excel/BI (4), statistics & A/B (6), behavioural and case (4), credit risk (5)**. Every question has an answer box. Use it like a flash card: answer **out loud** in 60–90 seconds, write the skeleton of that answer in the box (25 words or more), tap **Compare**, then tick the rubric lines you covered. The numbers are Nur Finance's (synthetic data, as of 2026-10-01) — in a real interview, use them as *"in my portfolio project, on a 7 800-loan book…"*. Every SQL answer runs on `data/raw/nur.db` and shows its real result.

How a good answer is built: **definition → how you compute it → a number → a trap or a company difference.** The fourth part is what the interviewer remembers.

---

## A. Lending and metrics

**A1.** **What is the difference between DPD and FPD?**

**A2.** **PAR30 vs NPL — what is the difference?**

**A3.** **What is a roll rate and how do you use it?**

**A4.** **What is vintage analysis?**

**A5.** **How do you compute approval rate? Why do two teams get different numbers?**

**A6.** **What is expected loss?**

**A7.** **Explain IFRS 9 provisions in plain words.**

**A8.** **What does a portfolio manager want from you?**

**A9.** **What is cost of risk?**

**A10.** **What is collection rate, and how can it mislead?**

---

## B. SQL

Write how you would answer: the query in words or in SQL, and the number you expect. The model answer describes the query and its result; the full query (SQLite, as in the course; SQL Server differences in comments) and its real result on `nur.db` are in the fold under each box — open it after you compare and press ▶ Run.

**B1.** **Approval rate by channel for January–September 2026, cancelled applications excluded.**

<details><summary>The query and its result</summary>

```sql
SELECT channel,
       COUNT(*) AS applications,
       SUM(CASE WHEN status IN ('approved', 'approved_not_disbursed') THEN 1 ELSE 0 END) AS approved,
       SUM(CASE WHEN status <> 'cancelled' THEN 1 ELSE 0 END) AS decided,
       ROUND(100.0 * SUM(CASE WHEN status IN ('approved', 'approved_not_disbursed') THEN 1 ELSE 0 END)
             / SUM(CASE WHEN status <> 'cancelled' THEN 1 ELSE 0 END), 1) AS approval_rate_pct
FROM applications
-- not BETWEEN: applied_at has a time
WHERE applied_at >= '2026-01-01' AND applied_at < '2026-10-01'
GROUP BY channel
ORDER BY approval_rate_pct DESC;
```

| channel | applications | approved | decided | approval_rate_pct |
|---|---|---|---|---|
| branch | 2 396 | 1 527 | 2 113 | 72.3 |
| partner | 1 045 | 646 | 917 | 70.4 |
| app | 1 953 | 1 118 | 1 647 | 67.9 |

Say the two choices out loud: "approved includes approved-not-disbursed; cancelled are out of the denominator". `100.0 *` avoids integer division.

</details>

**B2.** **Top 3 branches by amount disbursed in January–September 2026, with their share of the total.**

<details><summary>The query and its result</summary>

```sql
WITH b AS (
  SELECT br.branch_name, SUM(l.principal) AS disbursed
  FROM loans l JOIN branches br ON br.branch_id = l.branch_id
  WHERE l.disbursed_at >= '2026-01-01' AND l.disbursed_at < '2026-10-01'
  GROUP BY br.branch_name)
SELECT branch_name, disbursed,
       -- window over the whole result
       ROUND(100.0 * disbursed / SUM(disbursed) OVER (), 1) AS share_pct,
       RANK() OVER (ORDER BY disbursed DESC) AS rnk
FROM b
ORDER BY disbursed DESC
LIMIT 3;
-- SQL Server: SELECT TOP 3
```

| branch_name | disbursed | share_pct | rnk |
|---|---|---|---|
| Tashkent South | 21 380 780 000 | 13.2 | 1 |
| Fergana Central | 19 742 090 000 | 12.2 | 2 |
| Samarkand Central | 19 440 640 000 | 12.0 | 3 |

The point being tested: `SUM(…) OVER ()` computes the total before `LIMIT` cuts the rows, so the share is of all ten branches, not of the three shown.

</details>

**B3.** **How many customers applied but never received a loan?**

<details><summary>The query and its result</summary>

```sql
SELECT COUNT(DISTINCT a.customer_id) AS applied_never_borrowed
FROM applications a
WHERE NOT EXISTS (SELECT 1 FROM loans l WHERE l.customer_id = a.customer_id);
```

Result: **1 118**. Why `NOT EXISTS` and not `NOT IN`: if the subquery's column can be NULL, `NOT IN` returns nothing at all; `NOT EXISTS` compares row by row. The `LEFT JOIN … WHERE l.loan_id IS NULL` anti-join gives the same 1 118.

</details>

**B4.** **Month-over-month growth of disbursed amount in 2026.**

<details><summary>The query and its result</summary>

```sql
WITH m AS (
  -- SQL Server: FORMAT(disbursed_at, 'yyyy-MM')
  SELECT strftime('%Y-%m', disbursed_at) AS month, COUNT(*) AS loans, SUM(principal) AS amount
  FROM loans
  WHERE disbursed_at >= '2026-01-01' AND disbursed_at < '2026-10-01'
  GROUP BY 1)
SELECT month, loans, amount,
       ROUND(100.0 * (amount - LAG(amount) OVER (ORDER BY month)) / LAG(amount) OVER (ORDER BY month), 1) AS mom_pct
FROM m ORDER BY month;
```

| month | loans | amount | mom_pct |
|---|---|---|---|
| 2026-01 | 287 | 17 452 370 000 | — |
| 2026-02 | 265 | 11 893 850 000 | −31.8 |
| 2026-03 | 330 | 19 657 410 000 | 65.3 |
| 2026-04 | 312 | 17 894 970 000 | −9.0 |
| 2026-05 | 377 | 18 531 830 000 | 3.6 |
| 2026-06 | 373 | 16 050 300 000 | −13.4 |
| 2026-07 | 367 | 20 693 870 000 | 28.9 |
| 2026-08 | 358 | 22 290 210 000 | 7.7 |
| 2026-09 | 361 | 17 015 490 000 | −23.7 |

Add the comment an analyst adds: the number of loans is stable (312–377 a month since March); the amount swings with a handful of SME loans — month-over-month on amount is a mix story, not a demand story.

</details>

**B5.** **Find duplicate payments: same instalment, same day, same amount. How many extra rows, how much money?**

<details><summary>The query and its result</summary>

```sql
WITH r AS (
  SELECT payment_id, amount,
         ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn
  FROM payments)
SELECT COUNT(*) AS duplicate_rows, SUM(amount) AS double_counted
FROM r WHERE rn > 1;
```

Result: **25** rows, **58 397 800** soum. Then the part that gets the job: you do not `DELETE` — you show the owner, check the effect downstream (DPD unchanged, collections overstated), publish a de-duplicated view for reporting and propose a unique constraint at load.

</details>

**B6.** **FPD30 by channel.**

<details><summary>The query and its result</summary>

```sql
-- de-duplicated payments, as in B5
WITH clean_pay AS (
  SELECT * FROM (
    SELECT p.*, ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn
    FROM payments p) WHERE rn = 1),
first_inst AS (
  SELECT i.loan_id, i.total_due,
         -- half-open: up to day 30 included; DATEADD(day, 31, i.due_date)
         COALESCE(SUM(CASE WHEN p.paid_at < date(i.due_date, '+31 days') THEN p.amount END), 0) AS paid_30
  FROM installments i
  LEFT JOIN clean_pay p ON p.installment_id = i.installment_id
  -- only loans whose 30 days have passed
  WHERE i.installment_no = 1 AND i.due_date <= '2026-09-01'
  GROUP BY i.loan_id, i.total_due)
SELECT a.channel, COUNT(*) AS loans,
       SUM(CASE WHEN f.paid_30 < f.total_due THEN 1 ELSE 0 END) AS fpd30,
       ROUND(100.0 * SUM(CASE WHEN f.paid_30 < f.total_due THEN 1 ELSE 0 END) / COUNT(*), 2) AS fpd30_pct
FROM first_inst f
JOIN loans l        ON l.loan_id = f.loan_id
JOIN applications a ON a.application_id = l.application_id
GROUP BY a.channel ORDER BY fpd30_pct DESC;
```

| channel | loans | fpd30 | fpd30_pct |
|---|---|---|---|
| app | 2 411 | 41 | 1.70 |
| partner | 1 425 | 16 | 1.12 |
| branch | 3 263 | 34 | 1.04 |

Four things to say: clean payments (a duplicated payment would count twice towards the instalment), the maturity filter (a loan whose first instalment fell due last week cannot have an FPD30 yet), the partial-payment rule (paid in full, not "any payment"), and that app vs branch is a statistical question — z = 2.15, p = 0.032 in week 6.

</details>

---

## C. Excel and BI

**C1.** **VLOOKUP vs XLOOKUP vs INDEX/MATCH — and the classic lookup bug.**

**C2.** **You receive a messy export every month. How do you clean it so that next month takes one click?**

**C3.** **Measure vs calculated column in Power BI?**

**C4.** **What does CALCULATE do, and why does a star schema matter for it?**

---

## C2. Python and pandas

**P1.** **A merge turned 1 000 loans into 1 450 rows. What happened, and how do you stop it?**

**P2.** **NaN in pandas and NULL in SQL look alike. Name three places where they bite.**

**P3.** **`df[df['amount'] > 0]['flag'] = 1` printed a warning and the flag did not change. Why, and what is the right line?**

---

## D. Statistics and A/B testing

**D1.** **What is a p-value?**

**D2.** **How would you put a confidence interval on an FPD rate of 1.28 % (91 of 7 099)?**

**D3.** **Statistically significant but not important — give an example.**

**D4.** **What is a sample ratio mismatch and what do you do when you find one?**

**D5.** **Why is peeking at an A/B test every day a problem?**

**D6.** **How do you choose the sample size, and why are risk guardrails hard to test?**

---

## E. Behavioural and case

**E1.** **"Tell me about a time your number disagreed with the report."**

**E2.** **"The board asks why FPD rose. What do you do?"**

**E3.** **15-minute case: "Approval rate dropped 5 points last week. Investigate."**

**E4.** **"Explain a p-value to a manager."**

---

## F. Credit risk

**F1.** **What do AUC, Gini and KS tell you about a scorecard?**

**F2.** **How do you choose an approval cut-off?**

**F3.** **What is a PSI, and what do you do when it is high?**

**F4.** **How do you validate a scorecard out of time — and what is the trap?**

**F5.** **What is a champion / challenger test, and how would you run one for a new cut-off?**

---

Related: the [glossary](company/glossary.md) for every definition, [Who does what](company/roles.md) for who asks what. [Week 8 · Day 5](weeks/week-08/day-5.md) runs a mock interview with ten of these questions as a rapid-fire round.


=====
PAGE: Who does what in a lending company (company/roles.md)
LINK: https://raxmatov005.github.io/analytics-course/#/company/roles
=====

# Who does what in a lending company

Learn the people before the metrics: every request you will ever get comes from one of these desks. For each: what they own, what they ask the analyst, and which Nur Finance tables answer it.

| Role | Owns | A typical request to you | Tables |
|---|---|---|---|
| **Portfolio manager** (Bekzod) | the size, mix and quality of the loan book | "Outstanding by product and branch, this month vs last; where did PAR30 move?" | loans, installments, payments, products, branches |
| **Risk / credit analyst** (Nilufar) | the scoring rules and approval policy | "FPD by vintage and channel for the last 6 months — did the June rule change help?" | applications, loans, installments, payments |
| **Collections head** (Sevara) | getting late money back | "Contact rate and cure rate per collector; which actions actually lead to payment?" | collections_actions, staff, payments, installments |
| **BI / dashboard specialist** (Timur) | the company's dashboards and their refresh | "Build a measure for DPD buckets that works at any date, and document the grain." | all, through a warehouse model |
| **Product analyst** | the app and its funnel | "Where do we lose people between 'view offer' and 'submit'? By device and version." | app_events, applications, customers |
| **Finance / FP&A** | revenue, cost, provisions | "Interest income by month and product; cost of risk." | installments, payments, loans |
| **Data engineer** | the pipelines that fill the tables | "Which source fields do you need daily, and at what grain?" | — (they build what you specify) |
| **Data scientist** (Jasur) | the scoring model | "Pull a labelled sample: loans with 90+ DPD within 12 months, with features at application time." | applications, loans, installments, payments, customers |
| **Branch manager** | one office's sales and staff | "My officers' approvals and FPD, this quarter." | applications, staff, loans |

**Who asks for what?** Eight requests landed in your inbox on Monday. Sort each one to the desk that sent it — the words in the request give it away.

## How a request becomes work

1. **Restate it as a metric with a definition** ("PAR30 = outstanding of loans with DPD > 30 ÷ total outstanding, as of month-end").
2. **Find the grain** (one row per loan? per month per product?).
3. **Name the tables and the joins.**
4. **Compute, check against a number they already trust, then present** — a table or chart with the definition written under it.

Step 4's check is what separates an analyst from a query writer: if your approval rate is 71 % and the monthly report says 64 %, you found either a definition difference (cancelled in the denominator?) or a bug — both are worth a sentence to the requester.

## Russian terms

портфельный менеджер — portfolio manager · риск-аналитик / кредитный аналитик — risk analyst · взыскание — collections · BI-аналитик / дашборд-специалист — BI specialist · продуктовый аналитик — product analyst · дата-инженер — data engineer · скоринг — scoring.
