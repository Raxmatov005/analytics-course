# Week 7 · Day 2 — Analysing the A/B test: the result, the traps, the decision

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 60 min</span> <span class="badge hw">HW 7.1 due tomorrow</span> <span class="badge company">Company corner</span>

> STORY **Tuesday, 9:00.** The offer-screen test closed on 28 August; the follow-up on the loans is in. Kamola, beaming, with a screenshot from the experiment dashboard: *"**B wins: 9.37 % against 8.28 %, plus 13 %, p = 0.001.** Can we ship on Thursday?"* Nilufar, one seat further: *"Thirteen per cent more loans. Of which how many pay the first instalment? I sign off on nothing that I have not seen the FPD for."* Jasur, not looking up from his laptop: *"The dashboard counts rows. Has anybody checked that the rows are users?"* Madina: *"You have the data and until tomorrow noon. Kamola gets a decision, Nilufar gets the guardrail, and both get the same one slide."*

## Today in 3 lines

- **Clean before you test.** You run three sanity checks — users in more than one variant, the sample ratio overall *and by segment and week*, and the lift day by day — and find out whether Kamola's dashboard can be trusted. Section 1 walks you through the three checks on this very export — run each one yourself before reading what it finds.
- You compute the **primary result** on the population you have decided is clean — difference in points with a 95 % CI, p-value, relative lift — and compare it with the dashboard's number: does the conclusion survive, and how much does the size change?
- You finish the **readout**: the funnel by step, principal (Mann–Whitney, bootstrap), the **FPD guardrail** with its power, segments with a **Holm** correction — and a decision memo Kamola and Nilufar can both sign.

---

## 1. Learn — the order of an analysis

An analysis has a fixed order, and it is the order of the readout: **(1) is the experiment sound? (2) the primary result, (3) secondary metrics and guardrails, (4) segments, (5) the decision.** A result read before step 1 is a number from a possibly broken machine. Every box below runs here, in the page, in one shared namespace (the same code is in `day2_starter.ipynb`). Run them in order. Conversion = signed within 7 days of the user's first `assigned_at`.

> 💡 **Key idea.** Read the result last, not first: rows = users, the split by slice and the hash come before any p-value — and today two of those checks fail.

### The data layout — one row per unit

**What it is.** The analysis table has **one row per unit of randomisation** — here, per user — with the arm, the user's attributes and one column per outcome. The export arrives at three different grains: `users` (one row per assignment), `events` (one row per app event), `loans` (one row per signed loan). Your first job is to fold them into one row per user.

```pic
{"id": "w07d2-pic1", "title": "A user in both arms leaves both arms", "caption": "User 265913 was assigned to B on 1 August and to A on 4 August: both screens. Both rows go (struck through), as do the rows of the other 299 users assigned twice; everyone else keeps one row.", "tables": [{"name": "users", "cols": ["user_id", "assigned_at", "variant"], "rows": [[844122, "2026-08-01", "B"], [639643, "2026-08-01", "B"], [564185, "2026-08-01", "A"], [265913, "2026-08-01", "B"], [265913, "2026-08-04", "A"]], "keep": [0, 1, 2], "drop": [3, 4], "more": "… 27 974 rows, 27 674 users"}]}
```

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

```task
{"id": "w07d2-l1", "kind": "number", "answer": 27374, "dp": 0, "unit": "rows", "hint": "len(ud) — or 27 974 − 600.", "model": "27 374 — one row per user, after dropping all 600 rows of the 300 users who were in both arms."}
```

### Sanity check 1 — the sample ratio, overall and by slice

**Before you read.** Guess first, then play with it — the explanation below will make more sense.

```explore
{"id": "w07d2-x1", "type": "srm", "title": "Is this split chance?", "predict": {"q": "Overall, **13 545** users landed in A and **13 829** in B. Inside them is one slice — iOS users of week 4 — that went **537 / 822**. The automatic SRM alarm fires at p < 0.001. Which one sets it off?", "options": ["both", "only the overall split — it has 20 times the users", "only the iOS week-4 slice", "neither — both are within chance"], "why": "The overall split is 50.5 / 49.5 of 27 374 users: p = 0.086, within chance — the broken cell is averaged away. The slice is 60.5 / 39.5: p ≈ 10⁻¹⁴, a split chance does not make. What decides is the imbalance **and** the number of users, together.", "answer": 2}, "start": {"a": 13545, "b": 13829}, "alarm": 0.001, "presets": [{"label": "All users", "a": 13545, "b": 13829}, {"label": "iOS, week 4", "a": 537, "b": 822}], "challenges": [{"id": "c1", "text": "At our **27 374** users, move only **B's share**: what is the smallest imbalance that trips the **p < 0.001** alarm?", "when": {"p": ["<", 0.001], "dev": ["between", 0.0095, 0.0105]}, "only": ["share"]}, {"id": "c2", "text": "A “tiny” **50.5 / 49.5** split: keep it and add users. How many before the alarm fires?", "when": {"dev": ["between", 0.0045, 0.0055], "p": ["<", 0.001]}}, {"id": "c3", "text": "Now the other way: find a split of **55 / 45** or worse that the check still calls chance (**p above 0.05**).", "when": {"dev": [">=", 0.0499], "p": [">", 0.05]}}]}
```

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

```task
{"id": "w07d2-l2", "kind": "choice", "options": ["The split is fine: the overall p is above 0.05", "One cell of the experiment is broken; find out why before reading any result", "B is better on iOS", "Reweight the iOS users back to 50/50"], "answer": 1, "explain": "A slice with p ≈ 10⁻¹⁴ is not chance. The overall test averaged the broken cell away. The next check (the hash) shows what went wrong."}
```

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

```task
{"id": "w07d2-l3", "kind": "python", "starter": "# bad and dup_ids come from the box above\n# TODO: print how many rows of bad are NOT in dup_ids\n", "answer": 131, "dp": 0, "model": "131 — all iOS, all assigned 22–28 August, all logged B with a hash that says A: the client bug, located by the data."}
```

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

```task
{"id": "w07d2-l4", "kind": "choice", "options": ["iOS users prefer the new screen", "Assignment did not work like a coin for some iOS users; the arms are not comparable until that cell is found and removed", "Nothing: 1.9 points is small", "B should be reweighted by device"], "answer": 1, "explain": "Device is fixed before assignment, so a real gap can only come from the split itself. Here it is the same iOS week-4 bug the SRM and the hash found."}
```

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

```task
{"id": "w07d2-l5", "kind": "number", "answer": 3.9, "dp": 1, "unit": "points", "hint": "The lift column of daily.head(5), third row.", "model": "12.09 − 8.19 = +3.90 points — the third launch day in a row near +4, against about +0.9 afterwards."}
```

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

```task
{"id": "w07d2-l6", "kind": "python", "starter": "x2 = with_conversion(ud2, events)\nk2 = x2.groupby(\"variant\")[\"conv\"].agg([\"sum\", \"size\"])\n# TODO: z and p with z_test, B minus A (print z with two decimals)\n", "answer": 3.43, "dp": 2, "model": "A 1 038 / 13 008 = 7.98 %, B 1 193 / 13 007 = 9.17 %: z = 3.43, p = 0.0006. The novelty days make B look much stronger — the clean population (from 4 August) gives z = 2.41."}
```

### The confidence interval for the lift — absolute and relative

**What it is.** The p-value says *whether*; the **confidence interval** (*доверительный интервал*) says *how much*. Report the lift two ways: **absolute** (points, B − A) and **relative** (%, B ÷ A − 1), each with its 95 % interval.

```pic
{"id": "w07d2-pic2", "title": "Two arms, two intervals — and the difference has its own", "caption": "Conversion of the clean users with 95 % Wilson intervals: A 915 / 11 472 = 7.98 %, B 1 013 / 11 434 = 8.86 %. The two intervals almost touch, yet the interval of the difference, **+0.16 to +1.60** points, leaves zero out: compare the difference, not the overlap.", "chart": {"type": "intervals", "rows": [{"label": "A, control", "lo": 7.49, "mid": 7.98, "hi": 8.49}, {"label": "B, treatment", "lo": 8.35, "mid": 8.86, "hi": 9.39}], "min": 7, "max": 10, "unit": " %"}}
```

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

```task
{"id": "w07d2-l7", "kind": "number", "answer": 21.0, "dp": 1, "unit": "%", "hint": "The third line of the readout: rel hi %.", "model": "+21.0 % — the ratio's upper limit 1.210, minus 1. Dividing the difference's limit by A's rate would give 20.1 %."}
```

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

```task
{"id": "w07d2-l8", "kind": "number", "answer": 1.9, "dp": 1, "unit": "points", "hint": "41.6 % − 39.7 %, from the box (1 194 / 2 871 and 1 124 / 2 832).", "model": "+1.9 points (41.6 % vs 39.7 %, p = 0.14): within noise, but the one step a risk manager watches — it would mean B brings in different applicants."}
```

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

```task
{"id": "w07d2-l9", "kind": "python", "starter": "# h comes from the box above\nn = 3000\n# TODO: power = N.cdf(abs(h) * sqrt(n / 2) - 1.96); print it in % (no decimals)\n", "answer": 54, "dp": 0, "model": "About 54 % — three times the loans and still a coin flip. Risk guardrails need hold-outs that run for months, not the A/B window."}
```

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

```task
{"id": "w07d2-l10", "kind": "number", "answer": 0.28, "dp": 2, "hint": "Second smallest of seven: 0.047 × 6, and at least the previous adjusted value (0.21).", "model": "0.047 × 6 = 0.28 — far from significant. The slide may not say 'it works for affluent users'."}
```

### Simpson's paradox — when the total and the segments disagree

**What it is.** **Simpson's paradox** (*парадокс Симпсона*): B wins in every segment and loses in the total — or the reverse. It happens when the arms have **different mixes** of segments that convert differently. In an A/B test the usual cause is a split that changed during the test (a 90/10 ramp-up, then 50/50), or a slice removed from one arm only.

```pic
{"id": "w07d2-pic3", "title": "B wins both periods and loses the total", "caption": "A ramp-up sent 90 % of week 1's users to A, and week 1 converts better. B is ahead inside each period (highlighted), but 47 % of A's users come from week 1 against 9 % of B's, so A's total is pulled up.", "tables": [{"id": "per", "name": "simpson", "cols": ["period", "variant", "conv / users", "rate"], "rows": [["week 1", "A", "90 / 900", "10.0 %"], ["week 1", "B", "11 / 100", "11.0 %"], ["weeks 2–4", "A", "50 / 1 000", "5.0 %"], ["weeks 2–4", "B", "55 / 1 000", "5.5 %"]], "tone": ["a", "a", "b", "b"], "cells": [[1, "rate"], [3, "rate"]]}, {"id": "tot", "name": "total", "cols": ["variant", "conv / users", "rate"], "rows": [["A", "140 / 1 900", "7.37 %"], ["B", "66 / 1 100", "6.00 %"]], "cells": [[0, "rate"]], "via": "add the periods up"}]}
```

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

```task
{"id": "w07d2-l11", "kind": "choice", "options": ["B is worse: trust the total", "B is better in each period; the total is distorted because A has far more users from the high-converting week", "The data are wrong", "Average the two periods' rates"], "answer": 1, "explain": "The arms have different mixes of periods. Comparisons inside each period are fair; the pooled total is not. Fix the design (no pooling across splits) rather than the arithmetic."}
```

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

**Your turn.** Tap every line of this readout that would not survive review.

```game
{"type": "bug", "id": "w07d2-g2", "title": "Three lines that would not survive Jasur", "q": "The dashboard's readout of the offer-screen test. Tap every line that is wrong.", "code": "Design: user-level 50/50 hash split, 1–28 August, primary = signed within 7 days.\nSanity: 13 845 vs 14 129 rows, overall SRM p = 0.09 — the split is fine.\nPrimary on the cleaned users: 8.86 % vs 7.98 %, +0.88 points (95 % CI +0.16 to +1.60), two-proportion z-test, two-sided.\nGuardrail: FPD difference not significant (p = 0.23) — passed.\nSegments: affluent +1.7 points, p = 0.047 — target affluent users first.\nNext: decision memo for Kamola and Nilufar.", "answer": [1, 3, 4], "why": "Rows are not users and the SRM must be checked by slice (iOS week 4 was 60/40); a guardrail test with 23 % power is unresolved, not passed; affluent is the best of seven segments before Holm (0.28 after)."}
```

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

**Your turn.** Sort the situations by the decision each one leads to.

```game
{"type": "sort", "id": "w07d2-g3", "title": "Which decision?", "q": "Put each situation under the decision it leads to.", "groups": {"Ship": ["Sound test, primary significant, every guardrail interval inside the safe zone"], "Ship in stages, keep a hold-out": ["Primary significant, the FPD interval crosses the break-even"], "Do not ship": ["Primary not significant, MDE was realistic, the interval excludes the MDE"], "Extend to the planned n": ["Primary not significant, interval wide — the test is underpowered"], "Do not read: fix and re-run": ["An SRM or a leak you cannot explain"]}, "why": "Today's test is the second row: a screen change is cheap to reverse, FPD is a two-month-late signal."}
```

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

**Your turn.** Put the analysis in order.

```game
{"type": "order", "id": "w07d2-g1", "title": "The order of an analysis", "items": ["Is the experiment sound? Rows = users, SRM by slice, the hash, novelty", "The primary result with its confidence interval", "Secondary metrics and guardrails", "Pre-registered segments, with a correction", "The decision: ship, stage, don't, or extend"], "why": "A result read before the sanity checks is a number from a possibly broken machine.", "alts": [["Is the experiment sound? Rows = users, SRM by slice, the hash, novelty", "The primary result with its confidence interval", "Pre-registered segments, with a correction", "Secondary metrics and guardrails", "The decision: ship, stage, don't, or extend"]]}
```

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Primary result: p-value and confidence interval — [Самая ПОЛНАЯ и ПОНЯТНАЯ лекция по A/B тестам (Noukash), 30:47](https://youtu.be/FEI1OA-zgb8?t=1847&end=1980)
- ▶ Analysing results in Python — [Data Science Essentials - Crash Course in A/B Testing with Case Study (freeCodeCamp.org), 39:22](https://youtu.be/KZe0C0Qq4p0?t=2362&end=3660)
- ▶ Validity check and launch decision — [A/B Testing in Data Science Interviews by a Google Data Scientist (DataInterview), 12:32](https://youtu.be/DUNk4GPZ9bw?t=752&end=913)
- ▶ Common problems (RU) — Noukash lecture, [35:37](https://youtu.be/FEI1OA-zgb8?t=2137&end=2301)

- RU deck (TBC Data Analytics 2.0, if you have it) `6.2 A_B Testing.pdf` (lesson 6.2): pp. 4–10 — hashing, salting, uneven splits (the logic behind the hash check).
- Notebook `Lecture6.2 - Tests.ipynb`: the t-test step by step and with scipy (cells 3–19), "was it profitable?" — a skewed revenue metric and the Mann–Whitney U test (cells 20–40), **A/A tests and added-effect checks** — simulate many A/A splits, check the p-values are uniform, add an artificial effect and check the test finds it (cells 41–62), multiple comparisons (cell 63). Run its A/A loop on our `users` + `events` instead of the generated data.
- `Howework_AB.ipynb` — the original course's A/B homework: a "For you" page recommendation test in an online shop; hypothesis + metric + criterion, split, comparability, a synthetic dataset, a power-vs-sample-size plot at MDE 5 %; then the same for profitability. Today's analysis is the next step after that design.
- *Russian terms:* очистка данных эксперимента = experiment data cleaning, утечка в назначении = assignment leak, пересечение групп = group overlap, воронка = funnel, конверсия = conversion, относительный прирост (лифт) = relative lift, бутстрап = bootstrap, барьерная метрика = guardrail, взаимодействие = interaction, поэтапный запуск = staged rollout, контрольная (отложенная) группа = hold-out.

```videoquiz
{"video": "FEI1OA-zgb8", "stops": [{"at": 1880, "q": "The p-value is 0.016. What does it say?", "options": ["B is better with 98.4 % probability", "If the screens did not differ, a gap this large would appear in about 1.6 % of such experiments", "1.6 % of users prefer B", "The effect is 1.6 %"], "answer": 1, "explain": "A p-value is computed assuming no difference; it is not the probability that B is better."}, {"at": 1950, "q": "Why report a confidence interval and not only p?", "options": ["It shows how big the effect plausibly is — +0.16 to +1.60 points here", "It is always narrower", "It replaces the sanity checks", "Only to decorate the slide"], "answer": 0, "explain": "The interval carries the size and its uncertainty; the decision needs both."}, {"at": 2180, "q": "Which is a common problem that breaks a test's result?", "options": ["Using a 7-day window", "Users who end up in both groups", "A pre-registered plan", "Hashing user ids"], "answer": 1, "explain": "Today's 300 leaked users saw both screens: they belong to neither arm.", "back": 60}, {"at": 2260, "q": "The groups' sizes differ more than chance allows. What do you do?", "options": ["Reweight", "Report the result with a footnote", "Find the broken cell and remove it from both arms, or re-run", "Ignore it if p < 0.05"], "answer": 2, "explain": "An SRM is a bug to find; here the iOS cell of week 4 was removed from both arms."}]}
```

```videoquiz
{"video": "KZe0C0Qq4p0", "stops": [{"at": 2600, "q": "What do you compute first when the experiment's data arrive?", "options": ["Segment results", "The sanity checks: one row per user, the split", "The relative lift", "The decision"], "answer": 1, "explain": "Sanity before results — the order of today's analysis."}, {"at": 3100, "q": "Conversion is a 0/1 outcome per user. Which test fits two groups' conversion rates?", "options": ["A two-proportion z-test", "A paired t-test", "Correlation", "Chi-square on the means"], "answer": 0, "explain": "Two independent proportions: the two-proportion z-test (or chi-square on the 2 × 2 table).", "back": 60}, {"at": 3500, "q": "The result is significant. What else goes into the recommendation?", "options": ["Nothing", "Only the p-value", "The size with its interval, the guardrails and whether it is worth it", "The segment that won most"], "answer": 2, "explain": "Statistical significance is not the business decision: size, guardrails and cost decide."}]}
```

```videoquiz
{"video": "DUNk4GPZ9bw", "stops": [{"at": 790, "q": "What does a validity check look at before the launch decision?", "options": ["Invariant metrics such as group sizes, and whether the setup worked", "Only the primary metric", "The best segment", "The dashboard colours"], "answer": 0, "explain": "If the invariants are off, the comparison is not trustworthy."}, {"at": 880, "q": "The primary metric improves but a guardrail gets worse. What is the launch decision?", "options": ["Launch — the primary won", "A trade-off: quantify both, and launch only if the gain outweighs the cost (or launch in stages)", "Never launch", "Re-run until the guardrail is fine"], "answer": 1, "explain": "Today's FPD: compare the interval's upper end with the break-even; stage the rollout when it crosses.", "back": 60}]}
```

---

## 2. Worked example — the primary result, end to end (15 min)

**Ask:** Kamola's dashboard says "B wins: 9.37 % against 8.28 %, p = 0.001". Produce the number she can actually promise — each step is one concept of section 1, in its order.

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

Answer each question in its box. The Python boxes run here and see `users`, `events`, `loans`, `ud`, `ud2`, `clean`, `dup_ids` and the helpers from section 1 (`srm_p`, `srm_by`, `hash_variant`, `balance`, `with_conversion`, `z_test`, `welch`, `ab_test`, `ab_readout`, `holm`) — run section 1's blocks first. In Jupyter, `day2_starter.ipynb` has the same data and asks you to write `srm_by`, `clean_users` and `ab_readout` yourself; the checkpoint on Day 5 is easier if you do.

**P1.** *(data layout)* The naive result: conversion per variant on every row, z, p, relative lift. Then two reasons why this cannot go to Kamola yet.

```task
{"id": "w07d2-p1", "kind": "python", "starter": "raw = with_conversion(users, events)          # every row, as the dashboard counts them\nprint(raw.groupby(\"variant\")[\"conv\"].agg([\"sum\", \"size\"]))\n# TODO: ab_readout(raw) -- B's rate, z, p and the relative lift\n", "answer": 3.2, "dp": 2, "model": "A 1 147 / 13 845 = 8.28 %, B 1 324 / 14 129 = 9.37 %, z = 3.20, p = 0.0014, +13.1 %. Not yet: nobody has checked that rows are users (they are not: 27 974 rows, 27 674 users) or that the split is the planned 50/50 in every part of the experiment — a broken split makes the comparison non-random, and then a p-value means nothing."}
```

**P2.** *(data layout — one row per user)* Duplicates: how many users appear more than once, in which variants, how far apart? Why remove all their rows rather than keep the first assignment?

```task
{"id": "w07d2-p2", "kind": "python", "starter": "c = users[\"user_id\"].value_counts()\nd = users[users[\"user_id\"].isin(c[c > 1].index)].sort_values([\"user_id\", \"assigned_at\"])\nprint(d.head(6))\n# TODO: how many users? in how many variants each? first variant A vs B?\n#       days between the two assignments (min, mean, max)?\n", "answer": 300, "dp": 0, "model": "300 users, 600 rows, every one of them in both A and B; first assignment A for 182, B for 118; second assignment 1.0–5.0 days later (mean 3.0). After the second assignment they saw the other screen — their outcome is caused by a mix of A and B, and their events (no variant column) would be counted in both arms. Keeping the first row would still attribute a mixed outcome to one screen; dropping them costs 1 % of the sample and removes the doubt."}
```

**P3.** *(sanity check 1: SRM by slice)* SRM with your `srm_by`: overall (rows and de-duplicated users), by device, by week, by device × week, by day. Which cell is broken, and why did the overall and the daily checks miss it?

```task
{"id": "w07d2-p3", "kind": "python", "starter": "# srm_by and ud come from section 1, 'Sanity check 1'\n# TODO: srm_by(ud, [\"device\"]), then [\"week\"], then [\"device\", \"week\"]\n# TODO: by day -- ud[\"day\"] = ud[\"assigned_at\"].dt.date; how many of 28 days have SRM p < 0.05?\n", "answer": 822, "dp": 0, "model": "Overall rows 13 845 / 14 129, p = 0.090; users 13 545 / 13 829, p = 0.086. Device: iOS p = 2.2 × 10⁻⁵; week 4 p = 0.0019; iOS × week 4: 537 / 822 = 60.5 % B, p = 1.1 × 10⁻¹⁴. By day only 2 of 28 days below 0.05 (smallest 0.024, 22 August). The broken cell is 1 359 of 27 374 users — 5 % of the data, diluted overall; and a day has only ~980 users, so a 60/40 split of its ~50 iOS users is invisible. Slice by how the software ships: client × release period."}
```

**P4.** *(sanity check 2: the hash)* The hash check: recompute every row's variant from `sha256("offer_screen_v2" + user_id)`. How many rows disagree, and how do they split between the two problems?

```task
{"id": "w07d2-p4", "kind": "python", "starter": "expected = users[\"user_id\"].map(lambda u: hash_variant(u, \"offer_screen_v2\"))\nbad = users[users[\"variant\"] != expected]\n# TODO: how many rows disagree? how many of them belong to the leaked users (dup_ids)?\n#       the rest by device, variant and assignment week\n", "answer": 431, "dp": 0, "model": "431 rows disagree: 300 are the leaked users' re-assignments, 131 are non-duplicate iOS users assigned 22–28 August, all logged B although their hash says A. So the SRM is not \"B got extra users from somewhere\": specific A users were pushed into B — a bug in the iOS client (timeouts defaulting to B), not in the assignment service."}
```

**P5.** *(sanity check 3: balance)* Run `balance` on the **clean** population. Are the arms alike? Enter the p-value for the share of new users.

```task
{"id": "w07d2-p12", "kind": "python", "starter": "# balance comes from section 1, 'Sanity check 3'\n# TODO: print(balance(clean)) and read the p-value of new_vs_returning = new\n", "answer": 0.19, "dp": 2, "model": "iOS 16.73 vs 17.25 % (p = 0.30), new 44.37 vs 45.22 % (p = 0.19), affluent 20.26 vs 19.84 % (p = 0.42), Tashkent 40.00 vs 40.16 % (p = 0.81). Every gap is under a point and no p-value is small: the clean arms are comparable, and the readout can say so in one line."}
```

**P6.** *(the daily lift)* Novelty: daily conversion by variant (de-duplicated), the lift on 1–3 August, a test on days 1–3 alone, and the weekly table with iOS week 4 removed. What does the pre-registered plan say you do?

```task
{"id": "w07d2-p5", "kind": "python", "starter": "x = with_conversion(ud, events)\nearly = x[x[\"assigned_at\"] < \"2026-08-04\"]\n# TODO: ab_readout(early) -- the lift on days 1-3 alone\n# TODO: the weekly table without iOS week 4: groupby([\"week\", \"variant\"])[\"conv\"].mean().unstack()\n", "answer": 3.44, "dp": 2, "model": "Days 1–3: A 7.85 / 7.94 / 8.19 %, B 11.90 / 10.33 / 12.09 % → lifts +4.0, +2.4, +3.9; pooled days 1–3: 8.01 % vs 11.44 %, +3.44 points, p = 0.0012. Weekly: A 8.38 / 8.56 / 7.20 / 7.59 %, B 10.12 / 9.75 / 8.02 / 8.44 % — week 1 carries the spike. Plan: steady state (from 4 August) is the primary, the full period a sensitivity line. Leaving the spike in would sell Kamola a lift that the screen will not keep."}
```

**P7.** *(primary test, confidence interval)* The clean primary result with your `ab_readout`, then the cleaning-ladder table (raw → − leak → − iOS week 4 → − days 1–3). Which step changes the answer most?

```task
{"id": "w07d2-p6", "kind": "python", "starter": "steps = with_conversion(users, events)\n# TODO: ab_readout after each step and compare the difference in points:\n#   raw -> minus dup_ids -> minus iOS on/after 2026-08-22 -> minus days before 2026-08-04 (clean)\n", "answer": 0.88, "dp": 2, "model": "Clean: 7.98 % vs 8.86 %, +0.88 points (+0.16 to +1.60), p = 0.016, +11.1 % (+2.0 to +21.0). Ladder: +1.09 (p 0.0014) → +1.11 (0.0010) → +1.19 (0.00059) → +0.88 (0.016). The novelty exclusion moves it most (−0.31 points); the leak and the SRM each push B up a little. The conclusion holds throughout; the size drops by a fifth and the p-value rises tenfold."}
```

**P8.** *(secondary metrics — the funnel)* The funnel by variant on the clean users: step rates and a two-proportion test per step. Where does the lift come from, and which step would worry a risk manager?

```task
{"id": "w07d2-p7", "kind": "choice", "options": ["More users start an application; the start step worries risk", "Starters finish a little more often at every later step; the approval step — the scorecard's decision — worries risk", "Only the signing step moves; nothing worries risk", "More users view the offer; the signing step worries risk"], "answer": 1, "explain": "Start 33.6 vs 33.7 % (p 0.91); submit 73.4 vs 74.5 % of starters (0.27); approved 39.7 vs 41.6 % of submitted (0.14); signed 88.4 vs 90.1 % of approved (0.17). The lift is not at the door but in finishing — small gains at every later step. The approval step worries risk: a higher approval share in B could mean different applicants; here it is within noise, so it goes on the watch list, not into the conclusion."}
```

**P9.** *(secondary metrics — the money)* Principal per loan: describe both arms, Mann–Whitney, a bootstrap CI of the mean difference (10 000 resamples, `default_rng(2026)`). Then disbursed principal per viewer with its bootstrap CI.

```task
{"id": "w07d2-p8", "kind": "python", "starter": "lc = loans.merge(clean[[\"user_id\", \"variant\", \"conv\"]], on=\"user_id\")      # loans of clean users: 993 / 1 076\nprint(lc.groupby(\"variant\")[\"principal\"].describe())\n# TODO: mean difference B - A (soum)\n# TODO: bootstrap 95 % CI of it: rng = np.random.default_rng(2026), 10 000 resamples of each arm\n# (Mann-Whitney needs scipy: in Jupyter, scipy.stats.mannwhitneyu)\n", "answer": -69172, "dp": 0, "model": "A 993 loans, mean 2 563 847, median 2 270 000, sd 1 248 912; B 1 076, 2 494 675, 2 245 000, 1 197 935. Mann–Whitney p = 0.32 (P(B > A) = 0.487); mean difference −69 172 (95 % CI −174 910 to +35 635), −2.7 %. Per viewer: A 203 824, B 220 024 (+7.9 %), CI of the difference −4 423 to +36 856 — 203.8 m vs 220.0 m per 1 000 viewers, not distinguishable from zero. More contracts, possibly smaller ones."}
```

**P10.** *(guardrails)* The FPD guardrail: rates with Wilson intervals, z-test and Fisher, the CI of the difference, the power this test had, and the loans per arm needed. What sentence goes to Nilufar?

```task
{"id": "w07d2-p9", "kind": "python", "starter": "lc = loans.merge(clean[[\"user_id\", \"variant\"]], on=\"user_id\")\nlc[\"fpd\"] = 1 - lc[\"first_instalment_paid_within_30d\"]\nf = lc.groupby(\"variant\")[\"fpd\"].agg([\"sum\", \"size\"])\nprint(f)\n# TODO: ab_test(kA, nA, kB, nB) on the FPD counts -- print the p-value and the difference's CI\n# (ab_test gives a Wald interval, -0.44 to +1.88; Newcombe, used on the page, gives -0.49 to +1.94)\n", "answer": 0.23, "dp": 2, "model": "A 15 / 993 = 1.51 % (0.92–2.48), B 24 / 1 076 = 2.23 % (1.50–3.30); z-test p = 0.23, Fisher 0.26; difference +0.72 points (−0.49 to +1.94). Power for a true +0.72 points: 23 %; 80 % needs 5 508 loans per arm. \"FPD is 0.7 points higher in B, which is within chance, but this test could not have detected a difference of that size; the interval runs up to +1.9 points, beyond the +0.9 to +1.25 points at which B stops paying for itself — so the guardrail is not cleared, it is unknown.\""}
```

**P11.** *(segments, Holm)* Segments: lift by device, new vs returning and segment, raw and Holm-adjusted p-values; then the interaction test new vs returning. Which sentence about segments is allowed on the slide?

```task
{"id": "w07d2-p10", "kind": "python", "starter": "rows = []\nfor col in [\"device\", \"new_vs_returning\", \"segment\"]:\n    for val, g in clean.groupby(col):\n        k = g.groupby(\"variant\")[\"conv\"].agg([\"sum\", \"size\"])\n        r = ab_test(k.loc[\"A\", \"sum\"], k.loc[\"A\", \"size\"], k.loc[\"B\", \"sum\"], k.loc[\"B\", \"size\"])\n        rows.append((val, round(r[\"diff pt\"], 2), r[\"p\"]))\nseg = pd.DataFrame(rows, columns=[\"segment\", \"lift pt\", \"p\"]).sort_values(\"p\").reset_index(drop=True)\n# TODO: Holm -- multiply the i-th smallest p (i = 0, 1, ...) by (7 - i), keep the running maximum, cap at 1\nseg\n", "answer": 0.21, "dp": 2, "model": "Lifts +0.87 (Android, p 0.030), +0.94 (iOS, 0.31), +0.85 (new, 0.093), +0.96 (returning, 0.068), +1.71 (affluent, 0.047), +0.63 (mass, 0.17), +0.87 (sme, 0.30); Holm: smallest 0.21 — none significant. Interaction new vs returning: z = −0.15, p = 0.88. Allowed: \"The lift is positive in every pre-registered segment and we find no evidence that it differs between segments.\" Not allowed: \"it works for affluent users\" or \"it works on Android only\"."}
```

**P12.** *(Simpson's paradox)* A colleague "fixes" the broken iOS cell by deleting its users from **B only**, so that the arms are 50/50 again. Why is that worse than removing the cell from both arms?

```task
{"id": "w07d2-p13", "kind": "choice", "options": ["It is not worse: the split is 50/50 again", "A keeps the iOS week-4 users and B does not, so the arms now have different mixes of device and week — the setting for a Simpson's-paradox distortion", "It lowers the power", "B's conversion goes up"], "answer": 1, "explain": "Removing a slice from one arm changes that arm's mix. iOS users convert a little better than Android users, and week 4 converts worse than week 1, so the totals compare different mixes. Remove a broken cell from both arms, or analyse within slices."}
```

**P13.** *(the result in one paragraph)* Write the six-part result paragraph for the **sensitivity** population (leak out, days 1–3 out, iOS kept): 24 265 users, A 968 / 12 009 = 8.06 %, B 1 088 / 12 256 = 8.88 %, +0.82 points (95 % CI +0.12 to +1.52), z = 2.28, p = 0.022, relative +10.1 % (+1.4 % to +19.6 %). End with what this line adds to the readout.

```task
{"id": "w07d2-p14", "kind": "free", "min": 40, "rubric": ["what was compared and on which population (what was removed and what was kept)", "the effect in points with its CI, and the relative lift", "the test with z and p", "a decision-relevant reading: the verdict holds without the iOS removal", "says the primary result stays the clean one, as pre-registered"], "model": "With the leaked users and the three novelty days removed but the iOS week-4 cell kept (24 265 users), users who saw the new screen signed within 7 days 8.88 % of the time against 8.06 % (difference +0.82 points, 95 % CI +0.12 to +1.52; relative +10.1 %, +1.4 % to +19.6 %); a two-sided two-proportion z-test gives z = 2.28, p = 0.022. The verdict does not depend on removing the broken cell — it holds either way, about 8 more contracts per 1 000 viewers. The primary result remains the clean population (+0.88), as the plan says; this line shows the decision is not an artefact of the cleaning."}
```

**P14.** *(a flat result)* A test of a new reminder text ends with a lift of +0.1 points (95 % CI −0.3 to +0.5) on a planned MDE of +1.0 point. What goes in the memo?

```task
{"id": "w07d2-p15", "kind": "choice", "options": ["Extend the test: p is not below 0.05", "A precise flat result: the interval excludes the +1.0 MDE, so there is no effect worth having — do not ship for conversion", "The text works a little: ship it", "The test is broken"], "answer": 1, "explain": "The interval is narrow and its upper end (+0.5) is below the MDE: the test could have seen +1.0 and did not. That is a finding, not a failure. Extending is for wide intervals that still include the MDE."}
```

> 🚀 **Stretch (optional, +5 XP).** **P15.** *(putting it together — the money)* Redo Day 1's unit economics with today's numbers (conversion, average principal per arm, FPD per arm; interest = 9.856 % of principal, i.e. 266 662 ÷ 2 705 586 as on Nur's Micro book; LGD 60 %). Profit per 1 000 viewers per arm; B's break-even FPD; B's profit if its FPD were at the upper end of the CI. In the box: B's break-even FPD in %, to 2 decimals.

```task
{"id": "w07d2-p11", "kind": "number", "answer": 2.45, "dp": 2, "unit": "%", "hint": "Enter B's break-even FPD in % (A's profit per 1 000 viewers = B's, solved for B's FPD).", "xp": 2, "model": "A: conversion 7.98 %, principal 2 563 847 → I = 252 692, L = 1 538 308, FPD 1.51 % → 225 638 per loan → 17 996 742 per 1 000 viewers. B: 8.86 %, 2 494 675 → I = 245 875, L = 1 496 805, FPD 2.23 % → 207 004 per loan → 18 339 646 (+1.9 %). Break-even FPD for B: 2.45 %, i.e. +0.94 points over A (smaller than Day 1's +1.25 because B's loans are slightly smaller). At the CI's upper end (A + 1.94 = 3.45 %): 16 454 966, 8.6 % below A. Expected gain small and positive; the bad case is bigger than the good one — exactly why the rollout is staged."}
```

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

```check
{"id": "w07d2-sc", "questions": [{"type": "single", "q": "The overall SRM p-value is 0.09. Is the split fine?", "options": ["Yes — p is above 0.05", "Not shown: a broken cell with a few per cent of users is diluted overall; check by device × release week", "No — p must be above 0.5", "Only if every single day passes too"], "answer": 1, "explain": "Overall 0.09 hid iOS week 4 at 60/40 (p ≈ 10⁻¹⁴); a day is too thin to show it (→ 'Sanity check 1', P3)."}, {"type": "single", "q": "The FPD difference has p = 0.23, and the test had 23 % power. Can Nilufar sign off the guardrail?", "options": ["Yes — not significant means no harm", "No: it is unresolved; the interval's upper end (+1.94) is above the break-even (+0.94), so ship in stages with a hold-out", "No: FPD is proven worse", "Yes, after Holm"], "answer": 1, "explain": "'Not significant' from a weak test means 'unknown' (→ 'Guardrails', P10)."}, {"type": "multi", "q": "Which make excluding days 1–3 legitimate?", "options": ["The exclusion rule was in the pre-registration", "A known mechanism: returning users exploring a new screen", "The days make the result look worse", "Three consecutive launch days far above the rest", "One day showed +5.2 points"], "answer": [0, 1, 3], "explain": "The plan decides exclusions, not the data; one high day is noise (→ 'The daily lift', P6, Mistakes)."}]}
```

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

```game
{"type": "order", "id": "w07d2-g4", "title": "The readout slide, top to bottom", "items": ["Hypothesis", "Design", "Sanity checks", "Primary result", "Guardrails", "Segments", "Decision", "What we learned"], "why": "Kamola reads the first and the last line, Nilufar the guardrails, Jasur the sanity checks — each finds hers in the same place every time."}
```

> 🎯 **Interview version.** *"Walk me through how you analyse an A/B test."* — Sanity first: one row per unit, the sample ratio overall and by the slices the software ships in, units in both arms, the assignment rule recomputed; then the primary metric with a CI and a test, as decided before the start; then guardrails (with their power) and the money; then pre-registered segments with a correction; then a decision — ship, don't, extend, or ship in stages — and what we learned for the next test.

**Say it like in an interview.** *"Walk me through how you analyse an A/B test."* Answer in four to six sentences, with one number from today for each step.

```task
{"id": "w07d2-ci", "kind": "free", "min": 30, "model": "Sanity first: one row per user (we found 300 users in both arms and removed them), the sample ratio overall and by the slices the software ships in (iOS in the last week was 60/40, so that cell went from both arms), and the assignment recomputed from the hash. Then the primary metric as pre-registered, with a confidence interval: +0.88 points, 95 % CI +0.16 to +1.60, p = 0.016. Then the guardrails with their power: FPD +0.72 points with 23 % power, unresolved against a +0.94-point break-even. Then the pre-registered segments with Holm — none significant. Then one decision — here, ship in stages with a hold-out — and what we learned for the next test.", "rubric": ["starts with sanity checks: rows = users, SRM by slice, the hash", "the primary metric with a CI and a test, as pre-registered", "guardrails with their power or interval, translated into a decision", "segments with a multiple-comparison correction", "ends with one decision (ship / stage / don't / extend)"]}
```

Tomorrow: the numbers move to Power BI. Bekzod's Excel one-pager from week 4 breaks every month; the dashboard should refresh itself.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w07d2", "pass": 0.8, "questions": [
  {"type": "single", "q": "What do you check next?", "code": "len(users), users[\"user_id\"].nunique()\n# (10000, 9900)", "options": ["Which user ids have several rows, and whether those users were assigned to both variants", "Drop the second row of each repeated user and move on", "Reweight the arms", "Nothing — 1 % is noise"], "answer": 0, "explain": "One row must be one user; a user who saw both screens belongs to neither arm, and events without a variant column would be counted in both (→ section 1, 'The data layout')."},
  {"type": "multi", "q": "Which checks belong to step 1, before the primary result is read?", "options": ["One row per user (rows vs unique ids)", "The sample ratio overall and by the slices the software ships in (client × release week)", "The daily lift chart for novelty", "Holm-corrected segment results", "Recompute every row's variant from the hash"], "answer": [0, 1, 2, 4], "explain": "Segments are step 4; a result read before the sanity checks is a number from a possibly broken machine (→ section 1, 'The order of an analysis')."},
  {"type": "single", "q": "The overall SRM p-value is 0.09. Is the split fine?", "options": ["Not shown: a broken cell holding a few per cent of users is diluted overall; check by device × week and other release slices", "Yes — p is above 0.05", "No — p must be above 0.5", "Only if every single day is fine too"], "answer": 0, "explain": "Slice by how the software ships; a daily check is too thin to see a small cell (→ section 1, 'Sanity check 1', P3)."},
  {"type": "single", "q": "You find a slice whose split is clearly broken. What do you do?", "options": ["Remove its B users only", "Keep it — the overall split is fine", "Remove it from both arms, report the exclusion and its size — or re-run if it is large", "Reweight it back to 50/50"], "answer": 2, "explain": "Within a broken cell the arms are not comparable; reweighting hides the bug instead of finding it (→ section 1, 'Sanity check 2', Mistakes)."},
  {"type": "single", "q": "How do you get the 95 % CI of the relative lift?", "code": "lo, hi   = confint_proportions_2indep(kB, nB, kA, nA, method=\"newcomb\")                  # difference B − A\nrlo, rhi = confint_proportions_2indep(kB, nB, kA, nA, compare=\"ratio\", method=\"log\")    # ratio B / A", "options": ["Divide lo and hi by A's rate", "(hi − lo) / 2", "A relative lift has no interval", "rlo − 1 and rhi − 1, from the ratio's interval"], "answer": 3, "explain": "The relative interval comes from the ratio's CI (log method) minus 1, not from dividing the difference's limits by the control rate (→ section 1, 'The confidence interval for the lift', Mistakes)."},
  {"type": "single", "q": "A guardrail test on FPD gives p = 0.30, and its power was 25 %. What can you say?", "options": ["Unresolved: compare the upper end of the difference's CI with the break-even; if it crosses, ship in stages with a hold-out", "The guardrail passed", "FPD got worse", "Extend the test until p < 0.05"], "answer": 0, "explain": "'Not significant' from an underpowered test means almost nothing (→ section 1, 'Guardrails', 'The result in one paragraph')."},
  {"type": "number", "q": "Seven pre-registered segments; the smallest raw p-value is 0.030. What is its Holm-adjusted p-value?", "answer": 0.21, "tol": 0.005, "explain": "Holm multiplies the smallest p by the number of tests: 0.030 × 7 = 0.21 — not significant; a segment difference also needs an interaction test (→ section 1, 'Segments')."},
  {"type": "single", "q": "Company corner: on the one-slide readout, which line comes right before the primary result?", "options": ["What we learned", "Sanity checks — what was removed and why, and the split after cleaning", "The decision", "Segments"], "answer": 1, "explain": "Hypothesis, design, sanity checks, primary, guardrails, segments, decision, learned — a slide that says what was removed survives the CFO (→ Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w07d2", "q": "Someone wants 'the new screen works best for affluent customers' on Kamola's slide. On the clean population (22 906 users, as in today's worked example), test whether the lift differs between the affluent and the mass segment: lift = B rate − A rate in each segment, z = (lift_affluent − lift_mass) / √(sum of the four p(1−p)/n terms), two-sided normal p-value. What is the p-value? Give it to 3 decimals.", "type": "number", "dp": 3, "h": ["3856b54f1bed84556d3b839e"], "hint": "Each segment's lift has its own unpooled variance; the variance of a difference of two independent lifts is the sum of the two.", "sol": "ZGVmIGxpZnQoZCk6CiAgICBnID0gZC5ncm91cGJ5KCJ2YXJpYW50IilbImNvbnYiXS5hZ2coWyJtZWFuIiwgInNpemUiXSkKICAgIHBhLCBuYSwgcGIsIG5iID0gZy5sb2NbIkEiLCAibWVhbiJdLCBnLmxvY1siQSIsICJzaXplIl0sIGcubG9jWyJCIiwgIm1lYW4iXSwgZy5sb2NbIkIiLCAic2l6ZSJdCiAgICByZXR1cm4gcGIgLSBwYSwgcGEgKiAoMSAtIHBhKSAvIG5hICsgcGIgKiAoMSAtIHBiKSAvIG5iCmQxLCB2MSA9IGxpZnQoY1tjWyJzZWdtZW50Il0gPT0gImFmZmx1ZW50Il0pICAgICAjICsxLjcxIHB0CmQyLCB2MiA9IGxpZnQoY1tjWyJzZWdtZW50Il0gPT0gIm1hc3MiXSkgICAgICAgICAjICswLjYzIHB0CnogPSAoZDEgLSBkMikgLyBucC5zcXJ0KHYxICsgdjIpICAgICAgICAgICAgICAgICAgIyAxLjExCjIgKiBzdGF0cy5ub3JtLnNmKGFicyh6KSkgICAgICAgICAgICAgICAgICAgICAgICAgIyAwLjI2NwoKcCA9IDAuMjY3OiB0aGUgYWZmbHVlbnQgbGlmdCAoKzEuNzEgcG9pbnRzKSBpcyBsYXJnZXIgdGhhbiB0aGUgbWFzcyBsaWZ0ICgrMC42MyksIGJ1dCBhIGdhcCBvZiB0aGF0IHNpemUgYmV0d2VlbiB0d28gc2VnbWVudHMgd291bGQgYXBwZWFyIGJ5IGNoYW5jZSBhYm91dCBvbmUgdGltZSBpbiBmb3VyLgonU2lnbmlmaWNhbnQgaW4gYWZmbHVlbnQgKHAgPSAwLjA0NyksIG5vdCBpbiBtYXNzIChwID0gMC4xNyknIGlzIG5vdCBldmlkZW5jZSB0aGF0IHRoZSBlZmZlY3QgZGlmZmVycyDigJQgb25seSB0aGUgaW50ZXJhY3Rpb24gdGVzdCBhbnN3ZXJzIHRoYXQsIGFuZCBpdCBzYXlzIG5vLgpUaGUgc2xpZGUga2VlcHMgdGhlIGFsbG93ZWQgc2VudGVuY2U6IHRoZSBsaWZ0IGlzIHBvc2l0aXZlIGluIGV2ZXJ5IHNlZ21lbnQgYW5kIHdlIGZpbmQgbm8gZXZpZGVuY2UgdGhhdCBpdCBkaWZmZXJzIGJldHdlZW4gdGhlbS4gKFRoZSBzYW1lIGZvcm11bGEgZ2l2ZXMgcCA9IDAuODggZm9yIG5ldyB2cyByZXR1cm5pbmcsIGFzIG9uIHRoZSBwYWdlLik=", "python": true}
```

<!-- challenge:end -->
