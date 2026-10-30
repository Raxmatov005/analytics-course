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

```game
{"type": "order", "id": "w09d5-g1", "title": "The memo, in the committee's order", "items": ["The answer in three lines: does it rank, is it stable, where the cut-off goes", "Performance: AUC, Gini and KS — overall, by grade, out of time — each with its n and bads", "Stability: the PSI of applicants' scores, with the traffic light", "The recommendation: the cut-off, its approval share and bad rate, its profit", "Risks: who is refused, what is not known yet, the date of the next read", "Definitions and assumptions: bad, the as-of date, Week 8 Day 2's unit economics"], "why": "The answer first (Week 8's pyramid); the definitions last, but always on the page — a member who disagrees with a number starts there."}
```

One line of this A0 write-up would be marked wrong — tap it:

```game
{"type": "bug", "id": "w09d5-g2", "title": "Spot the wrong line", "q": "One line would be marked wrong.", "code": "# A0. The score on Consumer loans — 2 350 loans with a score, 73 bad\nGini 0.366 (AUC 0.683): a random good loan outscores a random bad one 68 % of the time.\nKS 0.37 at score 657: the widest gap between the bads' and the goods' cumulative shares.\nSo the score predicts the right outcome for 68 % of Consumer loans.\nWorking but weak (usual: 0.4–0.6): fine for a cut-off, not alone for a large loan.", "answer": [3], "why": "The AUC is about pairs — one good loan and one bad loan — not about the share of loans classified right. With 3 % bads, \"approve everyone\" is right for 97 % of loans and ranks nothing."}
```

---

## Part A — Performance: does the score still rank? (75 min)

### A1. AUC, Gini and KS of the credit score — all loans

- **Data.** `sc` — one row per loan with a score (7 615 loans, 223 bad).
- **Do.** The AUC (the share of good–bad pairs in which the good loan has the higher score, ties counted half), the Gini = 2 · AUC − 1, and the KS — the largest gap between the cumulative share of bads and the cumulative share of goods, read from the lowest score up — with the score where it happens.
- **Answer.** How good is the ranking against the range usual for application scorecards (Gini 0.4–0.6)? In the box: the Gini, to 3 decimals.
- **Taught in.** Day 3 (ROC, AUC, Gini, KS).

```task
{"id": "w09d5-a1", "kind": "number", "answer": 0.377, "dp": 3, "unit": "Gini, all scored loans", "hint": "AUC = U / (n_good · n_bad) from stats.mannwhitneyu(good, bad) — the goods first, because a higher score means a safer loan; then Gini = 2 · AUC − 1. Day 3."}
```

<details><summary>Model answer (open after submitting)</summary>

```python
# (shape only — not meant to run)
# grain: one loan with a score (7 615 loans, 223 bad)
def auc(t, col="credit_score"):
    good = t.loc[t["bad"] == 0, col]
    bad = t.loc[t["bad"] == 1, col]
    return stats.mannwhitneyu(good, bad).statistic / (len(good) * len(bad))


def ks(t, col="credit_score"):
    g = t.groupby(col)["bad"].agg(bads="sum", n="size")
    g["goods"] = g["n"] - g["bads"]
    # cumulative shares, from the lowest score up
    gap = (g["bads"].cumsum() / g["bads"].sum()
           - g["goods"].cumsum() / g["goods"].sum())
    return gap.max(), gap.idxmax()


a = auc(sc)
# AUC 0.689 · Gini 0.377 · KS 0.339 at 658.0
print(round(a, 3), round(2 * a - 1, 3), ks(sc))
# at 658: 147 of 223 bads (65.9 %) and 2 363 of 7 392 goods (32.0 %)
# score at or below it
```

*Interpretation.* On 7 615 loans with 223 bads, the score's Gini is 0.377 (AUC 0.689): a random good loan outscores a random bad one 69 % of the time, and the KS is 0.34 at score 658, where two thirds of the bads but only a third of the goods sit at or below. It ranks, but weakly — just under the 0.4–0.6 usual for application scorecards — so it is fit to draw a cut-off and to set grades, and a rebuild with more information (income, the product, the customer's own history) belongs on the list as a challenger, not as an emergency.

</details>

*Mistakes seen most often:* the AUC turned upside down — `roc_auc_score(bad, score)` gives one minus the AUC, because a higher score means a *safer* loan (use `1 - bad`, or `-score`); the Gini reported as the AUC; the KS read as a score ("KS = 658"); no n and no bads in the sentence.

### A2. By grade — four steps of the same score

- **Data.** `sc`, with `risk_grade` (A–D).
- **Do.** First each grade's loans, bads, bad rate and score range (min, max). Then two kinds of Gini: the grade's own — the grade used as a four-step score (A = 4, B = 3, C = 2, D = 1) on the same 7 615 loans — and the score's Gini *inside* each grade.
- **Answer.** Where does the score's ranking power live — in the steps between grades, or in the exact score inside a grade? What does that mean for a cut-off moved by 10 points? In the box: the grade's own Gini, to 3 decimals.
- **Taught in.** Day 2 (risk grades as score bands) and Day 3 (the score's Gini against the grade's).

```task
{"id": "w09d5-a2", "kind": "number", "answer": 0.396, "dp": 3, "unit": "Gini of the grade (A = 4 … D = 1)", "hint": "Turn the grade into numbers with higher = safer, as the score is; mannwhitneyu already counts ties as half. Use the 7 615 loans with a score, so that the two Ginis compare."}
```

<details><summary>Model answer (open after submitting)</summary>

```python
# (shape only — not meant to run)
# grain: one loan with a score (7 615)
print(sc.groupby("risk_grade")["credit_score"].agg(["min", "max"]))
# A 720–850 · B 660–719 · C 600–659 · D 424–599:
# the grades are bands of the score
num = {"A": 4, "B": 3, "C": 2, "D": 1}
g = sc.assign(grade_num=sc["risk_grade"].map(num))
# 0.396: the four steps alone
print(round(2 * auc(g, "grade_num") - 1, 3))
# the score inside each grade
{k: round(2 * auc(t) - 1, 3) for k, t in sc.groupby("risk_grade")}
```

| Grade | Loans (bad) | Bad rate | Gini inside |
|---|---|---|---|
| A | 1 774 (16) | 0.90 % | 0.135 |
| B | 3 302 (60) | 1.82 % | −0.090 |
| C | 2 208 (110) | 4.98 % | −0.074 |
| D | 331 (37) | 11.18 % | 0.067 |

The bootstrap 95 % interval of the Gini inside a grade: B −0.24 to 0.06, C −0.20 to 0.04.

*Interpretation.* The grades are the score cut in four (A ≥ 720, B 660–719, C 600–659, D < 600), with bad rates of 0.9 %, 1.8 %, 5.0 % and 11.2 %; the four steps alone have a Gini of 0.396 — a little above the full score's 0.377 — while inside grades B and C the exact score ranks no better than a coin (Gini −0.09 and −0.07 on 60 and 110 bads, intervals around zero). So the score's power sits in the jumps between grades, above all at 660, where the bad rate falls from 5.0 % to 1.8 %: a cut-off moved by 10 points inside a grade changes little, and a cut-off moved across a grade boundary changes a lot (Part C).

</details>

*Mistakes seen most often:* the grade mapped the wrong way round (A = 1 gives a negative Gini); the grade's Gini computed on all 7 828 loans (0.389) and compared with the score's on 7 615 — not the same loans; the bad rates by grade on all loans (0.93 / 1.88 / 5.12 / 10.91 %) mixed with the Ginis on scored loans without saying so; "the score is useless inside B" as a fact, with no interval.

### A3. Out of time — older loans against 2026

- **Data.** `sc` split by the year of disbursement: 2024–2025 (the older loans) and 2026.
- **Do.** For each period: loans, bads, the bad rate, the AUC, the Gini and the KS. Then a bootstrap 95 % interval for each Gini (1 000 resamples of loans, `np.random.default_rng(2026)`), and the 2026 bads by month of disbursement.
- **Answer.** Has the score got worse in 2026, or can the data not tell yet — and why? In the box: the 2026 Gini, to 3 decimals.
- **Taught in.** Day 3 (out-of-time validation); the bootstrap from Week 6 Day 2.

```task
{"id": "w09d5-a3", "kind": "number", "answer": 0.287, "dp": 3, "unit": "Gini, loans paid out in 2026", "hint": "Split sc on year < 2026 and year == 2026 and use A1's AUC on each part."}
```

<details><summary>Model answer (open after submitting)</summary>

```python
# (shape only — not meant to run)
# grain: one loan with a score — 2024-2025: 4 655 (192 bad),
# 2026: 2 960 (31 bad)
old, new = sc[sc["year"] < 2026], sc[sc["year"] == 2026]
r = np.random.default_rng(2026)
for name, t in [("2024-2025", old), ("2026", new)]:
    boot = [2 * auc(t.iloc[r.integers(0, len(t), len(t))]) - 1
            for _ in range(1000)]
    print(name, round(2 * auc(t) - 1, 3), ks(t),
          np.percentile(boot, [2.5, 97.5]).round(2))
new.groupby(new["disbursed_at"].dt.month)["bad"].sum()
```

| Paid out | Loans (bad) | Bad rate | Gini (95 %) |
|---|---|---|---|
| 2024–2025 | 4 655 (192) | 4.12 % | 0.404 (0.33–0.47) |
| 2026 | 2 960 (31) | 1.05 % | 0.287 (0.06–0.51) |

KS: 0.355 for the older loans, 0.305 for 2026. The 2026 bads by month paid out: January 9, February 5, March 8, April 7, May 2, June to October 0.

*Interpretation.* The 2026 Gini is lower — 0.287 against 0.404 for the older loans — but it rests on 31 bads, all from loans paid out in January–May: the loans from June on are too young to have gone bad, which is also why 2026's bad rate (1.05 %) is a quarter of the older loans' (4.12 %). The bootstrap interval of the 2026 Gini (about 0.06 to 0.51; a different seed moves the ends by a few hundredths) covers the older loans' whole interval (0.33 to 0.47), so the data cannot yet say the score got worse: report "no evidence of decay yet, on young loans", and read it again as the 2026 loans reach 12 months on book.

</details>

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

```task
{"id": "w09d5-b1", "kind": "number", "answer": 0.004, "dp": 3, "unit": "PSI, applicants, 2026 against 2024", "hint": "Use the unrounded shares (value_counts(normalize=True)), not percentages rounded to one decimal; the six parts add up to the PSI. Day 4."}
```

<details><summary>Model answer (open after submitting)</summary>

```python
# (shape only — not meant to run)
# grain: one application with a score (13 612)
def psi(base, cur):
    e = base.value_counts(normalize=True).sort_index()
    o = cur.value_counts(normalize=True).sort_index()
    return float(((o - e) * np.log(o / e)).sum())


a = apps.dropna(subset=["credit_score"])
y = a["year"]
# 2025: 0.0027 · 2026: 0.0037
print(round(psi(a.loc[y == 2024, "band"], a.loc[y == 2025, "band"]), 4),
      round(psi(a.loc[y == 2024, "band"], a.loc[y == 2026, "band"]), 4))
```

| Band | 2024 | 2026 | Part |
|---|---|---|---|
| <560 | 4.7 % | 4.6 % | 0.0000 |
| 560-599 | 10.5 % | 11.2 % | 0.0005 |
| 600-639 | 20.0 % | 21.7 % | 0.0014 |
| 640-679 | 25.8 % | 26.0 % | 0.0000 |
| 680-719 | 22.7 % | 20.8 % | 0.0016 |
| 720+ | 16.2 % | 15.6 % | 0.0002 |

*Interpretation.* The PSI of applicants' scores is 0.0037 for 2026 against 2024 (0.0027 for 2025): almost 30 times below the 0.1 line, so the people applying today score the way they did two years ago. The largest move is about two points of applicants sliding from 680–719 to 600–639 — a line to watch on the monthly view, not a reason to act.

</details>

> ⚠️ **Watch out.** One month is a small sample: against 2024, each 2026 month of about 600 applications has a PSI of up to about 0.02 from sampling alone. On the monthly view, compare a month with that range, not with zero.

*Mistakes seen most often:* the shares rounded to one decimal before the formula (that moves the PSI); counts used instead of shares; "the PSI is near zero, so the scorecard still works" — a PSI says nothing about ranking (that was Part A); the year taken from the loans (that is B2's question) instead of the applications.

### B2. Two more views — the product mix, and the approved loans

- **Data.** `apps` (all 14 000 applications, by `product`) and `sc` (the loans, by `band` and year of disbursement).
- **Do.** (1) The CSI of the product mix of applicants, 2026 against 2024 — B1's formula on the product shares. (2) The same PSI on the **approved loans** (`sc`), 2026 against 2024, with the band shares of both years.
- **Answer.** Why is the loans' PSI larger than the applicants', and which of the two belongs in the committee's stability line? In the box: the loans' PSI, to 3 decimals.
- **Taught in.** Day 4 (PSI and CSI).

```task
{"id": "w09d5-b2", "kind": "number", "answer": 0.014, "dp": 3, "unit": "PSI, approved loans, 2026 against 2024", "hint": "B1's function on sc's band, split by the year of disbursement: 1 699 loans in 2024, 2 960 in 2026."}
```

<details><summary>Model answer (open after submitting)</summary>

```python
# (shape only — not meant to run)
# (1) grain: one application (14 000) — CSI of the product mix
y = apps["year"]
# 0.0005
print(round(psi(apps.loc[y == 2024, "product"],
                apps.loc[y == 2026, "product"]), 4))
# (2) grain: one loan with a score — 2024: 1 699 · 2026: 2 960
# 0.0139
print(round(psi(sc.loc[sc["year"] == 2024, "band"],
                sc.loc[sc["year"] == 2026, "band"]), 4))
```

The approved loans' shares in the bands that moved most:

| Band | 2024 | 2026 |
|---|---|---|
| 600-639 | 15.5 % | 19.1 % |
| 640-679 | 26.9 % | 28.5 % |
| 680-719 | 28.7 % | 25.7 % |
| 720+ | 24.1 % | 22.7 % |

*Interpretation.* The product mix of applicants has not moved (CSI 0.0005), and the approved loans' PSI is 0.014 — still stable, but almost four times the applicants' 0.0037, because between the applicant and the loan sits the decision: the share of 600–639 among new loans rose from 15.5 % to 19.1 %, while among applicants it rose only from 20.0 % to 21.7 % (58 % of decided 600–639 applications became loans in 2026, against 53 % in 2024). The committee's stability line uses the applicants — what the scorecard sees; the loans' shift is a question about the approval decisions, and it leads straight into Part C.

</details>

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

```task
{"id": "w09d5-c1", "kind": "number", "answer": 2.55, "dp": 2, "unit": "% bad rate of the loans kept (score ≥ 600)", "hint": "Keep the loans with score ≥ 600 (7 284 of them); the bad rate is their bads ÷ their loans, not ÷ all 7 615. Day 4."}
```

<details><summary>Model answer (open after submitting)</summary>

```sql
-- grain: one loan with a score (7 615 loans, 223 bad)
WITH s AS (
  SELECT a.credit_score AS score,
         CASE WHEN l.status IN ('default', 'written_off')
              THEN 1 ELSE 0 END AS bad
  FROM loans l
  JOIN applications a ON a.application_id = l.application_id
  WHERE a.credit_score IS NOT NULL),
c(cut) AS (VALUES (560), (600), (620), (640), (660))
SELECT c.cut,
       ROUND(100.0 * SUM(s.score >= c.cut) / COUNT(*), 1) AS kept_pct,
       ROUND(100.0 * SUM(CASE WHEN s.score >= c.cut THEN s.bad END)
             / SUM(s.score >= c.cut), 2) AS bad_rate_pct,
       SUM(CASE WHEN s.score < c.cut THEN s.bad ELSE 0 END) AS bads_avoided
FROM c CROSS JOIN s
GROUP BY c.cut
ORDER BY c.cut;
```

Five rows, one per cut-off: 560 keeps 98.7 % at 2.81 % (12 bads avoided), 600 keeps 95.7 % at 2.55 % (37), 620 keeps 87.9 % at 2.41 % (62), 640 keeps 77.8 % at 2.18 % (94), 660 keeps 66.7 % at 1.50 % (147).

*Interpretation.* Moving from no cut-off (a bad rate of 2.93 %) to 600 refuses 4.3 % of the loans and avoids 37 of the 223 bads; going on to 660 refuses a third of the loans and avoids 147. The biggest step is again the grade boundary: from 640 to 660 the bad rate falls from 2.18 % to 1.50 % for 11 points of loans — whether any of this is worth it depends on what the refused loans would have earned, which is C2.

</details>

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

```task
{"id": "w09d5-c2", "kind": "number", "answer": 660, "dp": 0, "unit": "approve score ≥ this", "hint": "np.where(bad == 1, −LGD × ead, interest) minus the three costs; add it up over the loans with credit_score ≥ c for each c, then take the c with the largest total."}
```

<details><summary>Model answer (open after submitting)</summary>

```python
# (shape only — not meant to run)
# grain: one Micro loan with a score (2 598 loans, 73 bad)
m = sc[sc["product"] == "MICRO"].copy()
m["cof"] = m["bal_months"] * COF / 12
m["acq"] = m["channel"].map(ACQ)
m["serv"] = m["channel"].map(SERV) * m["term"]
# a bad loan pays no interest and loses LGD × EAD
m["net"] = (np.where(m["bad"] == 1, -LGD * m["ead"], m["interest"])
            - m["cof"] - m["acq"] - m["serv"])
rows = []
for c in [0] + list(range(540, 730, 10)):
    k = m[m["credit_score"] >= c]
    rows.append([c, len(k) / len(m), k["bad"].mean(),
                 m["bad"].sum() - k["bad"].sum(), k["net"].sum() / 1e6])
cols = ["cut", "kept", "bad_rate", "avoided", "profit_m"]
c2 = pd.DataFrame(rows, columns=cols).set_index("cut")
# 660
c2["profit_m"].idxmax()
```

| Cut-off | Kept | Bad rate | Profit, m |
|---|---|---|---|
| none | 100.0 % | 2.81 % | 48.1 |
| 600 | 96.9 % | 2.50 % | 57.6 |
| 640 | 78.8 % | 2.05 % | 61.5 |
| 650 | 73.7 % | 1.88 % | 62.7 |
| 660 | 67.6 % | 1.31 % | 70.6 |
| 670 | 59.9 % | 1.28 % | 62.3 |
| 700 | 37.6 % | 1.02 % | 42.8 |
| 720 | 24.7 % | 0.62 % | 29.7 |

Bads avoided, of 73: 10 at 600, 31 at 640, 50 at 660, 69 at 720.

```pic
{"id": "w09d5-pic1", "title": "Micro: what each cut-off would have earned", "caption": "The 2 598 scored Micro loans of 2024–2026, contribution per loan from Week 8 Day 2, added up over the loans each cut-off keeps. The peak (amber) is 660; to its right, the refused loans would mostly have paid.", "chart": {"type": "bars", "labels": ["none", "600", "640", "660", "680", "720"], "values": [48.1, 57.6, 61.5, 70.6, 54.6, 29.7], "tone": ["a", "a", "a", "b", "a", "a"], "show": true, "note": "x: approve score ≥ · y: million soum"}}
```

*Interpretation.* For Micro, profit peaks at a cut-off of 660: the 2 598 scored loans of 2024–2026 would have earned 70.6 m soum instead of 48.1 m (+22.5 m), keeping 67.6 % of the loans at a bad rate of 1.31 % instead of 2.81 % and avoiding 50 of the 73 bads. Above 660 the profit falls fast (54.6 m at 680, 29.7 m at 720), because nearly every loan refused there would have paid: the best cut-off is where the band you drop stops losing money, not where the bad rate is lowest.

</details>

*Mistakes seen most often:* interest counted for the bad loans; the cost of funds on the full principal instead of the falling balance; the cut-off read off the bad rate ("720 — the lowest bad rate"); one cut-off for the whole book with BNPL in it (it has no interest in our data, so every BNPL loan "loses" — Week 8 Day 2); a profit table with no assumptions printed under it.

### C3. Who the new cut-off refuses — the swap set and the recommendation

- **Data.** `m` from C2.
- **Do.** The **swap-out set** of your C2 cut-off — the Micro loans it would have refused: loans, bads, bad rate and contribution, by grade and in total. Compare each grade's bad rate with Week 8 Day 2's Micro break-even PD: 4.23 % for a first loan, 7.23 % for a repeat loan.
- **Answer.** Your recommendation in three sentences: the cut-off, what it gains and what it costs, and how you would roll it out (all at once, or as a challenger first). In the box: the bad rate of that swap-out set, in % to 2 decimals.
- **Taught in.** Day 4 (swap-in and swap-out, champion / challenger); Week 8 Day 2 (break-even).

```task
{"id": "w09d5-c3", "kind": "number", "answer": 5.95, "dp": 2, "unit": "% bad rate of the loans your C2 cut-off refuses", "hint": "The swap-out set is m[m[\"credit_score\"] < c], with c your C2 cut-off: its bads ÷ its loans."}
```

<details><summary>Model answer (open after submitting)</summary>

```python
# (shape only — not meant to run)
# grain: one Micro loan a 660 cut-off refuses (841 loans, 50 bad)
out = m[m["credit_score"] < 660]
out.groupby("risk_grade").agg(
    loans=("bad", "size"), bads=("bad", "sum"),
    bad_rate=("bad", "mean"),
    net_m=("net", lambda v: v.sum() / 1e6),
    per_loan=("net", "mean"))
```

| Grade | Loans (bad) | Bad rate | Net, m (a loan) |
|---|---|---|---|
| C | 761 (40) | 5.26 % | −13.0 (−17 053) |
| D | 80 (10) | 12.50 % | −9.5 (−119 320) |
| all | 841 (50) | 5.95 % | −22.5 |

*Interpretation.* A 660 cut-off refuses 841 Micro loans — all of grade C (761) and grade D (80) — and they went bad 5.95 % of the time, above Micro's break-even PD of 4.23 % for a first loan, so on average each of them lost money (grade C −17 053 soum a loan, grade D −119 320). **Recommendation:** refuse grade D in the app now — 12.5 % bad, above even the 7.23 % break-even of a repeat loan, +9.5 m soum — and move the rest of the way to 660 as a challenger on half of new app applications for six months, because grade C's 5.26 % sits between the two break-evens, the refusal costs a third of the app's Micro loans, and the 2026 bads are not all in yet.

</details>

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

<details><summary>Model answer (open after submitting)</summary>

**Application scorecard review — data as of 2026-10-01**

**Answer.** The application score still ranks borrowers, weakly but steadily (Gini 0.38); the people applying have not changed (PSI 0.004); the app should stop approving grade D Micro loans now, and test a 660 cut-off as a challenger.

**1. Does it still rank?** On all 7 615 scored loans (223 bad): AUC 0.689, Gini 0.377, KS 0.34 at score 658 — just under the 0.4–0.6 usual for application scorecards. The grades are bands of the score (A ≥ 720 … D < 600), with bad rates of 0.9 / 1.8 / 5.0 / 11.2 %; the grade alone has a Gini of 0.396, and inside a grade the exact score adds nothing. Out of time: 0.404 on 2024–2025 loans (192 bad), 0.287 on 2026 loans (31 bad, bootstrap 0.06–0.51) — no evidence of decay yet; the 2026 loans are young.

**2. Are we scoring the same people?** Yes. The PSI of applicants' scores, 2026 against 2024, is 0.0037 (2025: 0.0027), far below 0.1; the product mix did not move (CSI 0.0005). The approved loans moved more (PSI 0.014: more 600–639 loans) — a change in decisions, not in applicants.

**3. Where the app's cut-off should sit** (Micro, 2 598 scored loans, 73 bad). Profit peaks at 660: 70.6 m soum against 48.1 m with no cut-off (+22.5 m), with 67.6 % of the loans kept and the bad rate down from 2.81 % to 1.31 %. The 841 loans it refuses went bad 5.95 % of the time, above the 4.23 % break-even of a first Micro loan. We recommend refusing grade D (below 600) from Monday (+9.5 m; 12.5 % bad) and running 660 as a challenger on half of new app applications for six months.

**4. Risks and the next read.** 660 refuses a third of the app's Micro loans — Marketing should see that number before the test. The 2026 bads are not all in: we read the Gini and the bad rate by vintage again each month as the 2026 loans reach 12 months on book. Monthly: the applicants' PSI (one month's noise is 0.004–0.018), the Gini on mature loans and the approval rate.

**Definitions and assumptions.** Bad = status `default` or `written_off`. Score bands: <560, 560–599, 600–639, 640–679, 680–719, 720+. Contribution per loan (Week 8 Day 2): funding 18 % a year on the falling balance; LGD 60 % of the balance at the first unpaid instalment; app acquisition 60 000 and servicing 8 000 soum a month; a bad loan earns no interest. Profits are totals over 2024–2026, not a year.

</details>

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

```task
{"id": "w09d5-st", "kind": "choice", "options": ["None — every grade pays", "Only grade D", "Grades C and D, as for Micro", "Grades B, C and D"], "answer": 1, "explain": "Only grade D: 104 scored Consumer loans, 9.62 % bad, −10.8 m soum (−104 036 a loan). Grade C earns +310.3 m at 5.74 % bad, because Consumer's break-even PD is 7.79 % (Week 8 Day 2) against Micro's 4.23 %. So Consumer's line sits at 600, while Micro's thinner margin needs a stricter one (C2): the cut-off follows the product's margin, not the score alone. With EAD = the whole principal the answer is the same (D −42.9 m, C +174.9 m)."}
```

---

### 📎 Hand in here

```sqltask
{"check": "handin-W9D5", "lesson": "W9D5", "title": "Checkpoint 9", "why": "This is the review a risk team asks of its analyst every year: does the model still rank, is it scoring the same people, and where should the line sit — each answer with its n, its money and the decision it supports.", "graded": ["Part A — performance: AUC, Gini and KS with the score's direction right; by grade and out of time, each with its n and bads and two sentences (30)", "Part B — stability: the PSI on unrounded shares, the traffic light read, applicants against loans explained (20)", "Part C — the cut-off: the trade-off table, the contribution per loan with Week 8's assumptions, the best cut-off, the swap-out set against the break-even, a rollout (30)", "Part D — the memo: the answer first, every number with its n, the definitions on the page, one page (20)"], "tasks": [{"id": "checkpoint.ipynb", "file": "checkpoint.ipynb", "names": ["checkpoint.ipynb"], "upload": true, "accept": ".ipynb", "q": "Attach `checkpoint.ipynb` — executed (Restart & Run All, then save), each task with its output and its two sentences."}, {"id": "memo.md", "file": "memo.md", "text": true, "minLines": 10, "q": "Write `memo.md` here — the one-page memo of Part D."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else (a chart, or a .zip of several files)."}]}
```

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w09d5", "pass": 0.8, "questions": [
  {"type": "number", "q": "A scorecard's AUC is 0.72. What is its Gini (2 decimals)?", "answer": 0.44, "tol": 0.005, "explain": "Gini = 2 × AUC − 1 = 2 × 0.72 − 1 = 0.44; a coin has AUC 0.5 and Gini 0 (→ A1)."},
  {"type": "single", "q": "Our score: a higher score means a safer loan. This prints 0.311. What went wrong?", "code": "from sklearn.metrics import roc_auc_score\nroc_auc_score(sc[\"bad\"], sc[\"credit_score\"])", "options": ["Nothing — the score ranks worse than a coin", "roc_auc_score needs probabilities, not scores", "The direction: it asks how well a HIGH score finds a BAD loan; with 1 − bad (or −score) it becomes 1 − 0.311", "The loans without a score"], "answer": 2, "explain": "The same score read the other way round gives one minus the AUC; check the direction before you report (→ A1, mistakes)."},
  {"type": "single", "q": "A scorecard has KS = 0.30 at score 650. What does that say?", "options": ["30 % of the loans score below 650", "At 650 the share of bads scoring at or below it exceeds the share of goods by 30 points — the widest gap anywhere", "650 is the cut-off that earns most", "30 % of the bads are refused at 650"], "answer": 1, "explain": "KS is the widest gap between two cumulative curves; the cut-off that earns most is a different question, answered with money (→ A1, C2)."},
  {"type": "single", "q": "The 2026 loans give a lower Gini than the older loans — on a few dozen bads, all from loans of the first months of the year. What do you tell the committee?", "options": ["The scorecard broke in 2026 — rebuild it", "2026 borrowers are safer, so the Gini fell", "No evidence of decay yet: few bads on young loans and a wide interval — read it again when they reach 12 months on book", "Out-of-time checks cannot be done on a live portfolio"], "answer": 2, "explain": "Out of time, compare loans of the same age, and give every Gini its bads and its interval (→ A3)."},
  {"type": "single", "q": "This month's applicants against the development sample: PSI = 0.18. What do you do?", "options": ["Nothing — it is under 0.25", "Watch: find which characteristic moved (CSI) and why, check the Gini on recent mature loans, keep the cut-off under review", "Rebuild the scorecard today", "Lower the cut-off to approve more"], "answer": 1, "explain": "0.1–0.25 is 'watch': a shift to explain, not yet a broken model (→ B1)."},
  {"type": "single", "q": "Why does the committee's stability line use the applicants' scores, not the approved loans'?", "options": ["Loans have no scores", "Applicants are what the scorecard sees; the loans have passed the decision, so their shift mixes the population with the approval policy", "The applicants' PSI is always smaller", "Applicants are more numerous, so their PSI is exact"], "answer": 1, "explain": "Between the applicant and the loan sits the decision; a change in it moves the loans' PSI with no change in who applies (→ B2)."},
  {"type": "single", "q": "A product's break-even PD is 6 %. One score band goes bad 8 % of the time; the band above it, 4 %. Where does the profit-maximising cut-off go?", "options": ["Below both bands — approve everyone", "Between them: refuse the 8 % band, keep the 4 % band", "Above both bands — the lower the bad rate, the better", "It cannot be told without the Gini"], "answer": 1, "explain": "Drop a band while it loses money (its bad rate above the break-even); above that, nearly every refused loan would have paid (→ C2, C3)."},
  {"type": "multi", "q": "Which belong in the memo's cut-off recommendation?", "options": ["The cut-off, with its approval share and bad rate", "The profit change, with the assumptions under it", "Who is refused (the swap-out set) and what that costs", "The full Python code", "How it is rolled out and when it is read again", "The cut-off with the lowest bad rate, whatever it costs"], "answer": [0, 1, 2, 4], "explain": "A decision, its money, its cost in customers and its rollout; the code stays in the notebook (→ Part D)."},
  {"type": "text", "q": "The policy that keeps running for most applicants while a new one is tried on a random share is called the … (one word).", "answer": ["champion", "the champion"], "explain": "Champion / challenger: the challenger runs on a random share, and both are read on loans of the same age (→ C3, Day 4)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak.

```challenge
{"id": "w09d5", "python": true, "q": "Nilufar's follow-up: \"If we approve only grades A and B, next year's validation will only see those loans. What Gini will it show?\" Take the scored loans of grades A and B, as if that rule had always applied (all products: 5 076 loans, 76 bad), and compute the Gini of credit_score on them — 2 · AUC − 1, a higher score meaning a safer loan, ties counted half. Give it to 3 decimals.", "type": "number", "dp": 3, "h": ["33e8cffbba4675d18f101efc"], "hint": "The editor reads nur.db: join loans to applications for the score, bad = status default or written_off, keep the scored loans with risk_grade A or B, then A1's AUC.", "sol": "aW1wb3J0IHNxbGl0ZTMKaW1wb3J0IHBhbmRhcyBhcyBwZApmcm9tIHNjaXB5IGltcG9ydCBzdGF0cwpjb24gPSBzcWxpdGUzLmNvbm5lY3QoImRhdGEvcmF3L251ci5kYiIpCnMgPSBwZC5yZWFkX3NxbCgiIiJTRUxFQ1QgYS5jcmVkaXRfc2NvcmUsIGwucmlza19ncmFkZSwKICBDQVNFIFdIRU4gbC5zdGF0dXMgSU4gKCdkZWZhdWx0JywgJ3dyaXR0ZW5fb2ZmJykgVEhFTiAxIEVMU0UgMCBFTkQgQVMgYmFkCkZST00gbG9hbnMgbCBKT0lOIGFwcGxpY2F0aW9ucyBhIE9OIGEuYXBwbGljYXRpb25faWQgPSBsLmFwcGxpY2F0aW9uX2lkCldIRVJFIGEuY3JlZGl0X3Njb3JlIElTIE5PVCBOVUxMIiIiLCBjb24pCmsgPSBzW3NbInJpc2tfZ3JhZGUiXS5pc2luKFsiQSIsICJCIl0pXQpnb29kID0gay5sb2Nba1siYmFkIl0gPT0gMCwgImNyZWRpdF9zY29yZSJdCmJhZCA9IGsubG9jW2tbImJhZCJdID09IDEsICJjcmVkaXRfc2NvcmUiXQphdWMgPSBzdGF0cy5tYW5ud2hpdG5leXUoZ29vZCwgYmFkKS5zdGF0aXN0aWMgLyAobGVuKGdvb2QpICogbGVuKGJhZCkpCiMgNTA3NiA3NiAwLjEwNQpwcmludChsZW4oayksIGtbImJhZCJdLnN1bSgpLCByb3VuZCgyICogYXVjIC0gMSwgMykpCgowLjEwNTogb24gdGhlIGxvYW5zIG9mIGdyYWRlcyBBIGFuZCBCIGFsb25lLCB0aGUgc2FtZSBzY29yZSBsb29rcyBhbG1vc3QgdXNlbGVzcyDigJQgYWdhaW5zdCAwLjM3NyBvbiB0aGUgd2hvbGUgYm9vay4KVGhlIHNjb3JlIGRpZCBub3QgZ2V0IHdvcnNlOiB0aGUgY3V0LW9mZiByZW1vdmVkIHRoZSBsb3cgc2NvcmVzIHRoYXQgY2FycmllZCBtb3N0IG9mIHRoZSByYW5raW5nLCBhbmQgaW5zaWRlIGdyYWRlcyBBIGFuZCBCIHRoZSBzY29yZSBzZXBhcmF0ZXMgbGl0dGxlIChBMikuClNvIGEgdmFsaWRhdGlvbiBhZnRlciBhIGN1dC1vZmYgb3IgZ3JhZGUgcnVsZSBjaGFuZ2VzIGNvbXBhcmVzIGxpa2Ugd2l0aCBsaWtlICh0aGUgc2FtZSBzY29yZSByYW5nZSBpbiBib3RoIHBlcmlvZHMpLCBhbmQgb25seSBhIGNoYWxsZW5nZXIgYXJtIOKAlCBvciBhIHNtYWxsIHJhbmRvbSBzaGFyZSBhcHByb3ZlZCBiZWxvdyB0aGUgbGluZSDigJQga2VlcHMgdGVsbGluZyB5b3Ugd2hhdCB0aGUgcmVmdXNlZCBsb2FucyB3b3VsZCBoYXZlIGRvbmUu"}
```

<!-- challenge:end -->
