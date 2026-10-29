# Week 9 · Day 4 — The cut-off and watching the model: approval, bad rate, profit, PSI

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 9.4 (due Day 5)</span> <span class="badge company">Company corner</span>

> STORY **Thursday, 9:00.** Nilufar read yesterday's page twice. *"Good — the score still ranks. Now the real question. Our decisions are a patchwork: we rejected 126 applicants with 720 or more and lent to 100 below 560. If you could draw one line, where would you draw it? And not the line with the lowest bad rate — the one that makes money. Then tell me how I will know, next month, that the applicants have changed under us."* Bekzod from finance, copied in: *"Use the budget's unit economics: 18 % funding, 60 % LGD."*

## Today in 3 lines

- A **cut-off** trades approvals for bad rate: approving 600 and above keeps 95.7 % of the loans at a 2.55 % bad rate, 660 and above keeps 66.7 % at 1.50 %. You count **bads avoided** and **goods turned away**, the **expected loss** per loan (PD × LGD × EAD, W6D1) and the **profit** with W8D2's unit economics: a good Consumer-sized loan leaves 1.45 m soum and a bad one costs 17.2 m, so a group is worth declining only when more than **7.79 %** of it goes bad.
- The profit peaks at **594 — 7.14 bn soum** against 6.91 bn for approving everyone; a 2 % bad-rate target (647) costs 1.02 bn of it, and at 22 % funding the best line jumps to 659. Then the rest of a credit policy: **swap-in and swap-out**, **policy rules**, **champion / challenger**.
- Watching the model: the **PSI** of 2026's applicants against 2024's is **0.0037** — stable (under 0.1 stable, 0.1–0.25 watch, over 0.25 act); the **CSI** of each characteristic; a **monthly monitoring view**, and what to do when it drifts. HW 9.4: the cut-off table in SQL and the PSI on ten bins in `data/python/week9/day4_starter.ipynb`.

---

## 1. Learn — the line, in money, and the watch on it

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

```task
{"id": "w09d4-l1", "kind": "number", "answer": 50.3, "dp": 1, "unit": "%", "hint": "at(680) in the box above.", "model": "3 833 of 7 615 = 50.3 % approved, with a bad rate of 1.46 % — half the business for 1.5 points of bad rate."}
```

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

```task
{"id": "w09d4-l2", "kind": "number", "answer": 13.9, "dp": 1, "unit": "goods per bad", "hint": "859 ÷ 62.", "model": "859 / 62 = 13.9 good customers for each bad loan avoided."}
```

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

```task
{"id": "w09d4-l3", "kind": "number", "answer": 312, "dp": 0, "unit": "thousand soum", "hint": "161 / 6 694 × 0.60 × 21 630 783, then ÷ 1 000.", "model": "0.02405 × 0.60 × 21 630 783 = 312 150 soum ≈ 312 thousand per approved loan."}
```

### Profit by cut-off — W8D2's unit economics

**Before you read.** Guess first, then play with it — the explanation below will make more sense.

```explore
{"id": "w09d4-x1", "type": "cutoff", "title": "Draw the line in money", "predict": {"q": "Approving every scored applicant would have earned **6.91 bn soum** at W8D2's prices. Which line earns the most?", "options": ["Approve everyone — every good loan earns money", "About 595: decline only the worst 4 %", "About 650: keep the bad rate under 2 %", "720: lend only to the safest 23 %"], "answer": 1, "why": "A good loan leaves 1.45 m soum and a bad one costs 17.2 m, so declining a group pays only if more than 7.79 % of it goes bad. Only the scores below about 600 (grade D, 11.2 % bad) are that bad: the best line is 594, with 7.14 bn."}, "from": 424, "n": [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 4, 0, 0, 0, 2, 2, 1, 1, 0, 1, 1, 0, 1, 1, 0, 2, 1, 0, 0, 1, 0, 5, 0, 2, 2, 2, 0, 4, 3, 1, 4, 0, 1, 1, 3, 1, 2, 6, 1, 5, 2, 2, 4, 1, 2, 1, 3, 3, 6, 4, 1, 1, 4, 3, 2, 2, 9, 6, 3, 1, 5, 3, 8, 4, 4, 6, 5, 4, 9, 2, 8, 9, 6, 4, 8, 9, 4, 10, 11, 3, 4, 5, 9, 11, 11, 7, 9, 4, 5, 6, 7, 22, 26, 22, 28, 28, 31, 24, 38, 28, 28, 26, 27, 34, 26, 32, 33, 27, 36, 34, 40, 27, 40, 40, 30, 34, 36, 44, 43, 30, 43, 48, 44, 26, 35, 45, 44, 43, 34, 41, 39, 31, 42, 36, 37, 40, 39, 44, 33, 45, 47, 51, 45, 56, 55, 48, 54, 45, 41, 34, 29, 66, 61, 61, 60, 74, 58, 59, 61, 59, 73, 70, 53, 71, 62, 53, 53, 61, 57, 58, 73, 47, 75, 72, 65, 59, 66, 58, 63, 50, 48, 64, 52, 52, 53, 52, 60, 48, 41, 44, 47, 57, 54, 54, 57, 56, 47, 52, 38, 42, 60, 48, 45, 45, 36, 37, 38, 40, 41, 54, 42, 43, 42, 38, 50, 43, 37, 35, 36, 46, 33, 31, 39, 37, 48, 46, 28, 29, 43, 35, 26, 25, 29, 33, 31, 24, 24, 26, 26, 30, 19, 28, 32, 23, 20, 28, 19, 19, 29, 18, 16, 12, 14, 22, 15, 18, 15, 13, 19, 20, 10, 14, 12, 12, 11, 11, 16, 12, 15, 9, 14, 14, 9, 10, 13, 10, 8, 5, 4, 8, 9, 5, 7, 2, 3, 5, 4, 7, 4, 5, 3, 2, 6, 5, 2, 2, 2, 1, 3, 4, 3, 4, 2, 4, 2, 1, 1, 6, 0, 2, 0, 3, 3, 2, 2, 0, 3, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 2, 3, 2, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 2, 7], "b": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 2, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 2, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 2, 3, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 2, 1, 2, 1, 3, 3, 1, 1, 0, 0, 1, 3, 1, 1, 2, 1, 1, 2, 4, 0, 1, 1, 4, 4, 2, 4, 0, 3, 0, 1, 3, 1, 1, 0, 0, 0, 3, 2, 2, 1, 3, 3, 2, 2, 2, 3, 6, 2, 3, 4, 5, 2, 2, 3, 3, 0, 0, 2, 1, 1, 1, 1, 0, 3, 0, 0, 0, 1, 2, 2, 0, 3, 1, 2, 0, 0, 1, 0, 1, 3, 0, 0, 2, 1, 0, 2, 0, 2, 1, 0, 0, 2, 0, 2, 0, 0, 2, 1, 2, 1, 0, 0, 2, 3, 1, 1, 1, 4, 0, 1, 0, 0, 0, 2, 1, 1, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "econ": {"interest": 5695580, "cof": 3417348, "opex": 823325, "ead": 21630783, "lgd": 0.6}, "funds": [0.14, 0.18, 0.22], "lo": 500, "hi": 760, "start": {"cut": 600, "fund": 0.18}, "challenges": [{"id": "c1", "text": "At 18 % funding, find the **most profitable** cut-off: the box *Below the top of this curve* says *at the top* within 5 m soum.", "when": {"gapBest": ["<=", 5000000], "fund": ["=", 0.18]}}, {"id": "c2", "text": "Find the **loosest** cut-off whose approved loans have a **bad rate of 2 % or less**. How much profit does that target cost?", "when": {"br": ["<=", 0.02], "cut": ["<=", 647]}}, {"id": "c3", "text": "Funding rises to **22 %**. Find the new most profitable cut-off — how far did the line move?", "when": {"gapBest": ["<=", 5000000], "fund": ["=", 0.22]}}]}
```

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

```task
{"id": "w09d4-l4", "kind": "number", "answer": 6.73, "dp": 2, "unit": "bn soum", "hint": "profit(620) / 1e9 in the box above.", "model": "6 533 goods × 1 454 907 − 161 bads × 17 219 143 = 6.73 bn — 0.39 bn less than at 600."}
```

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

```task
{"id": "w09d4-l5", "kind": "number", "answer": 3.72, "dp": 2, "unit": "%", "hint": "good ÷ (good + bad).", "model": "695 496 ÷ 18 674 050 = 3.72 %. Grade C (5.0 %) now loses money, so the line moves up to the C/B edge: 659."}
```

### A bad-rate target — and what it costs

**What it is.** Risk appetite is often written as a **bad-rate target** (*целевая доля плохих*): "the loans we approve must stay under 2 % bad". The loosest cut-off that meets it is rarely the most profitable one. The difference is the **price of the target** — a number the committee should see before it votes.

**How to write it.**

```python
ok = [c for c in cs if y[s >= c].mean() <= 0.02]
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

```task
{"id": "w09d4-l6", "kind": "choice", "options": ["Because the target is computed wrongly", "Because between 600 and 647 it declines grade C loans whose bad rate is below the 7.79 % break-even — each of them would have earned money", "Because bad loans earn more than good ones", "Because the approval rate rises"], "answer": 1, "explain": "A loan is worth declining only if its group goes bad more than 7.79 % of the time. Grade C goes bad at about 5 %: declining it gives up more interest than it saves in losses."}
```

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

```task
{"id": "w09d4-l7", "kind": "choice", "options": ["Because their scores are missing", "Because they were rejected, so they never got a loan whose outcome could be observed", "Because SQL cannot join applications to loans", "Because there are too few of them"], "answer": 1, "explain": "No loan, no outcome. That is the whole problem of reject inference: the past policy hides how the people it rejected would have paid."}
```

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

```task
{"id": "w09d4-l8", "kind": "number", "answer": 5.9, "dp": 1, "unit": "%", "hint": "126 ÷ 2 150.", "model": "126 / 2 150 = 5.9 % — rejected by something other than the score: a policy rule or an officer."}
```

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

```task
{"id": "w09d4-l9", "kind": "choice", "options": ["Because the two policies differ on only a few dozen applicants, so no test could see the difference in bad rate", "Because A/B tests are not allowed in lending", "Because 600 is always better", "Because a challenger must be a new scorecard"], "answer": 0, "explain": "The two lines disagree only on scores 594–599: 38 loans in our history. A difference that small needs the profit curve and judgement, not a test."}
```

### PSI — has the population moved?

**Before you read.** Guess first, then play with it — the explanation below will make more sense.

```explore
{"id": "w09d4-x2", "type": "psi", "title": "Has the population moved?", "predict": {"q": "Take 2026's applicants and lower **every score by 10 points**. What does the PSI against 2024 say?", "options": ["Under 0.1 — 'stable' (about 0.04)", "Between 0.1 and 0.25 — 'watch'", "Over 0.25 — 'act'", "PSI cannot see a change in the average"], "answer": 0, "why": "Ten points move each band's share by only one or two points: PSI 0.041, still green. The traffic light is built for big moves; a slow slide hides under 0.1 — so the monthly page also shows the average score."}, "from": 424, "edges": [560, 600, 640, 680, 720], "base": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 2, 0, 0, 0, 0, 0, 2, 0, 0, 1, 0, 1, 1, 1, 0, 2, 2, 2, 4, 0, 1, 0, 2, 0, 1, 2, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 2, 6, 1, 1, 2, 0, 3, 3, 1, 1, 4, 5, 3, 2, 4, 3, 1, 3, 1, 3, 5, 5, 2, 3, 1, 10, 1, 7, 7, 5, 2, 5, 7, 5, 6, 6, 7, 1, 5, 6, 5, 7, 2, 3, 5, 4, 4, 4, 10, 7, 11, 11, 4, 12, 10, 4, 6, 10, 16, 9, 9, 4, 11, 21, 8, 17, 10, 10, 8, 9, 16, 15, 14, 11, 10, 11, 16, 9, 15, 12, 13, 13, 8, 18, 16, 17, 9, 9, 20, 23, 23, 16, 14, 18, 20, 15, 11, 16, 14, 10, 19, 19, 21, 15, 12, 17, 16, 21, 14, 16, 14, 10, 11, 22, 17, 22, 25, 22, 13, 19, 21, 18, 18, 23, 24, 28, 19, 11, 18, 14, 18, 23, 16, 26, 16, 18, 19, 17, 19, 17, 26, 20, 20, 23, 20, 19, 19, 17, 23, 11, 32, 12, 15, 27, 15, 14, 27, 14, 19, 17, 16, 28, 16, 15, 18, 15, 28, 18, 15, 15, 13, 14, 17, 19, 17, 19, 21, 17, 25, 19, 20, 10, 13, 17, 9, 13, 12, 16, 14, 16, 15, 12, 17, 10, 19, 8, 10, 4, 10, 14, 10, 10, 7, 8, 12, 7, 7, 4, 19, 13, 4, 9, 6, 5, 6, 6, 5, 4, 8, 2, 5, 5, 5, 5, 5, 12, 7, 7, 7, 3, 7, 2, 3, 4, 4, 8, 5, 2, 10, 7, 1, 9, 3, 9, 4, 3, 2, 1, 3, 1, 6, 7, 3, 1, 3, 3, 4, 0, 1, 1, 2, 2, 3, 1, 1, 0, 0, 3, 2, 1, 2, 0, 0, 3, 1, 1, 1, 2, 0, 2, 1, 3, 0, 2, 1, 1, 0, 2, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 2, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2], "pops": [{"key": 2025, "label": "2025", "counts": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 3, 1, 1, 0, 1, 1, 2, 0, 1, 1, 0, 4, 1, 2, 4, 0, 1, 1, 2, 2, 1, 0, 1, 5, 5, 1, 2, 5, 1, 3, 1, 4, 0, 1, 4, 5, 2, 8, 2, 6, 1, 4, 2, 8, 6, 2, 9, 6, 6, 9, 3, 5, 6, 8, 6, 2, 8, 6, 4, 5, 6, 4, 5, 9, 5, 7, 12, 6, 11, 7, 8, 13, 12, 9, 7, 12, 20, 17, 16, 10, 13, 22, 10, 14, 16, 16, 16, 14, 14, 15, 16, 16, 25, 12, 10, 24, 23, 22, 20, 28, 19, 17, 20, 27, 19, 25, 17, 14, 13, 21, 23, 22, 25, 26, 23, 31, 27, 18, 21, 29, 32, 21, 23, 19, 29, 28, 35, 30, 32, 30, 30, 42, 34, 33, 37, 32, 27, 27, 28, 38, 32, 26, 34, 30, 31, 30, 38, 29, 28, 27, 30, 38, 35, 35, 31, 51, 41, 44, 30, 36, 31, 43, 33, 19, 30, 29, 29, 30, 41, 42, 33, 33, 31, 38, 43, 33, 30, 33, 35, 30, 30, 42, 38, 35, 28, 33, 39, 40, 41, 42, 28, 41, 33, 26, 26, 32, 24, 27, 30, 28, 25, 29, 26, 21, 26, 30, 21, 28, 23, 26, 23, 37, 27, 22, 29, 29, 29, 24, 17, 14, 33, 23, 27, 24, 20, 16, 17, 19, 23, 23, 22, 17, 22, 21, 14, 17, 13, 14, 24, 24, 13, 11, 18, 14, 18, 11, 19, 14, 17, 10, 14, 14, 12, 16, 10, 12, 9, 11, 8, 10, 5, 7, 15, 7, 6, 7, 8, 11, 10, 7, 8, 7, 9, 9, 6, 6, 5, 4, 2, 5, 11, 8, 4, 4, 4, 6, 5, 5, 6, 5, 3, 6, 1, 4, 4, 3, 1, 3, 2, 4, 3, 5, 0, 2, 1, 1, 6, 0, 1, 1, 1, 1, 1, 2, 0, 0, 1, 1, 0, 1, 1, 2, 0, 0, 0, 1, 1, 1, 1, 0, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 5]}, {"key": 2026, "label": "2026", "counts": [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 1, 0, 1, 0, 0, 2, 0, 2, 0, 1, 2, 2, 1, 1, 2, 2, 1, 1, 0, 0, 1, 2, 3, 0, 2, 1, 0, 2, 2, 5, 1, 4, 2, 1, 4, 3, 0, 4, 3, 0, 4, 3, 0, 2, 4, 1, 5, 3, 1, 2, 3, 6, 9, 8, 7, 5, 5, 6, 7, 8, 5, 5, 11, 5, 11, 4, 5, 4, 7, 2, 8, 5, 6, 7, 6, 3, 5, 6, 10, 8, 7, 9, 13, 12, 6, 15, 10, 11, 13, 8, 18, 13, 14, 15, 16, 8, 16, 16, 24, 21, 14, 22, 17, 15, 13, 12, 17, 27, 18, 23, 13, 16, 27, 19, 28, 28, 17, 16, 17, 34, 27, 28, 25, 28, 24, 24, 21, 24, 38, 17, 27, 27, 38, 41, 28, 35, 35, 30, 36, 23, 26, 23, 30, 31, 30, 38, 28, 39, 31, 26, 35, 33, 37, 27, 39, 32, 27, 34, 31, 27, 28, 36, 33, 37, 39, 40, 37, 34, 42, 44, 34, 39, 44, 33, 25, 29, 30, 39, 36, 30, 37, 29, 35, 34, 37, 45, 39, 27, 44, 35, 32, 41, 34, 25, 31, 39, 29, 43, 31, 35, 28, 30, 31, 32, 27, 28, 36, 30, 31, 26, 37, 34, 34, 23, 27, 31, 36, 40, 35, 32, 27, 19, 26, 19, 25, 30, 22, 23, 17, 19, 28, 15, 15, 19, 25, 21, 23, 19, 23, 23, 17, 18, 18, 14, 17, 17, 17, 24, 21, 23, 20, 10, 18, 13, 15, 13, 9, 11, 21, 11, 11, 11, 12, 7, 15, 9, 18, 29, 14, 12, 10, 13, 11, 12, 11, 8, 11, 7, 11, 4, 8, 7, 4, 3, 5, 9, 2, 4, 2, 6, 5, 5, 5, 12, 4, 6, 6, 3, 5, 6, 3, 2, 0, 3, 4, 4, 2, 4, 1, 1, 2, 2, 4, 2, 2, 2, 3, 1, 3, 0, 1, 1, 1, 3, 0, 2, 1, 2, 3, 2, 0, 0, 2, 0, 1, 0, 2, 2, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]}, {"key": 202610, "label": "Oct 2026 (129)", "counts": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 2, 1, 2, 0, 1, 1, 0, 0, 2, 1, 2, 0, 1, 1, 0, 1, 0, 0, 0, 2, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 3, 1, 2, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 2, 0, 0, 3, 0, 1, 3, 0, 1, 0, 2, 2, 0, 0, 0, 3, 0, 0, 1, 1, 0, 2, 0, 1, 1, 4, 0, 0, 1, 1, 1, 2, 2, 1, 1, 1, 0, 0, 2, 2, 2, 0, 1, 0, 3, 0, 1, 1, 2, 0, 2, 0, 1, 1, 0, 2, 1, 0, 0, 1, 1, 0, 0, 2, 0, 2, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}], "start": {"pre": 2025}, "challenges": [{"id": "c1", "text": "Pick **2026** — the year Nilufar asks about — with nothing moved, and read the real PSI.", "when": {"pre": ["=", 2026], "shift": ["=", 0], "spread": ["=", 1]}}, {"id": "c2", "text": "Move **only the level** of the scores (the first slider) until the PSI crosses **0.1** — watch. How many points did it take?", "when": {"psi": [">=", 0.1]}, "only": ["shift", "pre"]}, {"id": "c3", "text": "Put it back, then change **only the spread** until the PSI crosses **0.25** — act.", "when": {"psi": [">", 0.25]}, "only": ["spread", "pre"]}, {"id": "c4", "text": "Pick **October 2026**, nothing moved: only 129 applicants so far. Its PSI is 17 times 2026's — drift, or a small month?", "when": {"pre": ["=", 202610], "shift": ["=", 0], "spread": ["=", 1]}}]}
```

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

```task
{"id": "w09d4-l10", "kind": "number", "answer": 0.0027, "dp": 4, "hint": "Change 2026 to 2025 in the box above.", "model": "0.0027 — stable. 2025 and 2026 sit just as close to 2024; between themselves, PSI 0.0008."}
```

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

```task
{"id": "w09d4-l11", "kind": "choice", "options": ["Rebuild the scorecard at once", "The channel mix: a new partner or a campaign has changed who applies — check the bad rate by band in that channel", "Nothing: 0.18 is below 0.25", "The requested amount"], "answer": 1, "explain": "The CSI points at the input that moved. A new channel can bring applicants whose risk at a given score differs — the score may need a channel-specific cut-off."}
```

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

Every month is green; October's 0.062 comes from 129 applicants — a small month jumps. The Gini drifts from 0.42 to 0.39 over two years, and the 2026 vintages are too young: their bad rate is low because they are young, not because they are good.

**When you use it.**
- The risk committee's standing item: the same page, the same order, every month.
- A trend matters more than one month's colour.

> ⚠️ **Watch out.** A PSI on a few hundred applicants moves by chance. Read a month together with its size and the months around it; act on a trend, not on one partial month.

**Your turn.** October 2026 shows PSI 0.062 on 129 applicants, against 0.004–0.018 for every full month. What do you write?

```task
{"id": "w09d4-l12", "kind": "choice", "options": ["The population has shifted: rebuild", "October is a partial month of 129 applicants; its PSI is noisy and still green — look again when the month is complete", "PSI cannot be computed for October", "Average all ten months into one PSI and stop reporting months"], "answer": 1, "explain": "Fewer applicants, bigger random swings in each band's share. Still under 0.1; the full month will tell."}
```

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

**Your turn.**

```game
{"type": "sort", "id": "w09d4-g1", "title": "Signal → action", "q": "Put each finding under the action it calls for.", "groups": {"Note it, no action": ["PSI 0.004 and the Gini steady at 0.38"], "Find the cause (CSI)": ["PSI 0.17 after a new partner joined"], "Recalibrate or move the cut-off": ["bad rate up from 2.9 % to 4.1 %, Gini unchanged"], "Rebuild the scorecard": ["Gini down from 0.40 to 0.22 on two mature vintages", "PSI 0.31 after the product was opened to a new region"]}}
```

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

**Words of the day.**

```game
{"type": "match", "id": "w09d4-g2", "title": "Words of the day", "pairs": [["Cut-off", "the lowest score that is approved"], ["Break-even bad rate", "good ÷ (good + bad): above it, a group loses money"], ["Bad-rate target", "a ceiling on the approved loans' bad rate, set by risk appetite"], ["Swap-in", "rejected today, approved by the new rule — outcome unknown"], ["Swap-out", "approved today, declined by the new rule — outcome known"], ["Override", "a decision that goes against the score"], ["PSI", "how far the applicants' score shares moved from the reference"], ["CSI", "the same formula for one input of the decision"]]}
```

### Depth (optional)

- **Books.** Naeem Siddiqi, *Intelligent Credit Scoring* (Wiley, 2nd ed., 2017): the chapters on choosing cut-offs, swap sets, policy rules and the monitoring reports (population stability, characteristic analysis). Lyn Thomas, Jonathan Crook and David Edelman, *Credit Scoring and Its Applications* (SIAM, 2nd ed., 2017): cut-offs by profit, and reject inference.
- **Where the PSI comes from.** The PSI is the symmetric Kullback–Leibler divergence (Jeffreys' divergence) between the two band distributions: the sum of KL(actual ‖ expected) and KL(expected ‖ actual). That is why it is never negative and why swapping the two years gives the same number.
- **Cut-offs in practice.** Lenders often set the line by product and channel, add a "refer" zone around it for manual review, and keep a strategy table: cut-off, expected approval, bad rate and profit, signed by the risk committee.
- *Russian terms:* порог отсечения = cut-off, уровень одобрения = approval rate, безубыточная доля плохих = break-even bad rate, риск-аппетит = risk appetite, оценка отклонённых заявок = reject inference, стоп-факторы = hard policy rules, ручное решение (override) = override, чемпион / претендент = champion / challenger, индекс стабильности популяции = PSI, индекс стабильности характеристики = CSI, мониторинг модели = model monitoring, перекалибровка = recalibration.

---

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

Every task has its own answer box, and the questions follow the order of section 1 — the concept is named in italics. The Python boxes run in the same session as section 1, so `np`, `pd`, `plt`, the frames `S` and `A`, the arrays `s` and `y`, the numbers `I`, `COF`, `OPEX`, `EAD`, `LGD`, `good`, `bad`, the arrays `cs` and `pr`, `e`, `edges` and the functions `at`, `profit`, `shares` and `psi` are ready — if you came straight here, press ▶ Run on every box of section 1 from the first to the PSI box. (The notebook `data/python/week9/day4_starter.ipynb` holds the same tools; you need it for the homework.)

**P1.** *(the cut-off)* Write one SQL query that returns the approval rate and the bad rate for the cut-offs **580** and **700** — one row each. Use a small table of cut-offs: `WITH cuts(c) AS (VALUES (580), (700))`.

```task
{"id": "w09d4-p1", "kind": "sql", "model": "WITH cuts(c) AS (VALUES (580), (700)),\ns AS (\n  SELECT a.credit_score AS score, (l.status IN ('default', 'written_off')) AS bad\n  FROM loans l JOIN applications a ON a.application_id = l.application_id\n  WHERE a.credit_score IS NOT NULL)\nSELECT c,\n       ROUND(100.0 * SUM(score >= c) / COUNT(*), 1) AS approved_pct,\n       ROUND(100.0 * SUM(bad * (score >= c)) / SUM(score >= c), 2) AS bad_rate\nFROM cuts CROSS JOIN s\nGROUP BY c ORDER BY c;", "note": "580: 97.5 % approved, 2.73 % bad. 700: 35.7 %, 1.44 %."}
```

<details><summary>Answer</summary>

```sql
WITH cuts(c) AS (VALUES (580), (700)),
s AS (
  SELECT a.credit_score AS score, (l.status IN ('default', 'written_off')) AS bad
  FROM loans l JOIN applications a ON a.application_id = l.application_id
  WHERE a.credit_score IS NOT NULL)
SELECT c,
       ROUND(100.0 * SUM(score >= c) / COUNT(*), 1) AS approved_pct,
       ROUND(100.0 * SUM(bad * (score >= c)) / SUM(score >= c), 2) AS bad_rate
FROM cuts CROSS JOIN s
GROUP BY c ORDER BY c;
```
580: **97.5 %** approved, 2.73 % bad; 700: 35.7 %, 1.44 %. The `CROSS JOIN` pairs every loan with every cut-off, so one `GROUP BY c` gives the whole table — the shape of HW 9.4.

</details>

**P2.** *(bads avoided, goods turned away)* At the cut-off **700**: how many bads are avoided, how many goods turned away, and how many goods per bad avoided (1 decimal)?

```task
{"id": "w09d4-p2", "kind": "python", "starter": "keep = s >= 700\n# bads avoided, goods lost, and goods per bad\n", "answer": 25.6, "dp": 1, "model": "keep = s >= 700\navoided = y[~keep].sum()\nlost = (~keep & (y == 0)).sum()\nprint(avoided, lost, round(lost / avoided, 1))\n# 184 4714 25.6"}
```

<details><summary>Answer</summary>

```python
keep = s >= 700
avoided = y[~keep].sum()
lost = (~keep & (y == 0)).sum()
# 184 4714 25.6
print(avoided, lost, round(lost / avoided, 1))
```
184 bads avoided for 4 714 good customers lost: **25.6** goods per bad — three times the price at 600.

</details>

**P3.** *(expected loss)* The **total** expected loss of the approved loans — bads × LGD × EAD — approving everyone and at 660, in bn soum, to 2 decimals. What is it at 660?

```task
{"id": "w09d4-p3", "kind": "python", "starter": "for c in (424, 660):\n    # bads approved × LGD × EAD, in bn\n    ...\n", "answer": 0.99, "dp": 2, "model": "for c in (424, 660):\n    print(c, round(y[s >= c].sum() * LGD * EAD / 1e9, 2))\n# 424 2.89 · 660 0.99"}
```

<details><summary>Answer</summary>

```python
for c in (424, 660):
    print(c, round(y[s >= c].sum() * LGD * EAD / 1e9, 2))
```
2.89 bn approving everyone, **0.99 bn** at 660 — a third. Yet the profit at 660 is lower (5.97 against 6.91 bn): the 2 392 goods turned away took their interest with them.

</details>

**P4.** *(profit by cut-off)* Do it for **Micro** loans with **Micro's own** W8D2 numbers: interest 266 662, funding 114 284, operating cost 95 996, EAD 1 777 000, LGD 60 %. Which cut-off maximises Micro's profit?

```task
{"id": "w09d4-p4", "kind": "python", "starter": "m = (S[\"product\"] == \"MICRO\").to_numpy()\nsm, ym = s[m], y[m]\ng_m = 266_662 - 114_284 - 95_996\nb_m = 0.60 * 1_777_000 + 114_284 + 95_996\n# profit for each cut-off in cs, then the best one\n", "answer": 659, "dp": 0, "model": "m = (S[\"product\"] == \"MICRO\").to_numpy()\nsm, ym = s[m], y[m]\ng_m = 266_662 - 114_284 - 95_996\nb_m = 0.60 * 1_777_000 + 114_284 + 95_996\npm = np.array([g_m * ((sm >= c) & (ym == 0)).sum() - b_m * ((sm >= c) & (ym == 1)).sum() for c in cs])\nprint(cs[pm.argmax()], round(pm.max() / 1e6, 1), round(g_m / (g_m + b_m), 4))\n# 659 69.0 0.0423 — approving every Micro loan earns 49.2 m"}
```

<details><summary>Answer</summary>

```python
m = (S["product"] == "MICRO").to_numpy()
sm, ym = s[m], y[m]
g_m = 266_662 - 114_284 - 95_996
b_m = 0.60 * 1_777_000 + 114_284 + 95_996
pm = np.array([g_m * ((sm >= c) & (ym == 0)).sum() - b_m * ((sm >= c) & (ym == 1)).sum() for c in cs])
# 659 69.0 0.0423
print(cs[pm.argmax()], round(pm.max() / 1e6, 1), round(g_m / (g_m + b_m), 4))
```
Micro's best line is **659**: 69.0 m soum against 49.2 m approving every Micro loan. A Micro loan leaves only 56 382 soum when it is good, so its break-even bad rate is 4.23 % (W8D2's number) — grade C is already too risky for Micro. One product, one line.

</details>

**P5.** *(the break-even bad rate)* If LGD were **80 %** instead of 60 %, what would the break-even bad rate be (18 % funding), in %, to 2 decimals?

```task
{"id": "w09d4-p5", "kind": "number", "answer": 6.33, "dp": 2, "unit": "%", "hint": "bad = 0.80 × EAD + COF + OPEX; then good ÷ (good + bad).", "model": "bad = 17 304 626 + 3 417 348 + 823 325 = 21 545 299; 1 454 907 ÷ 23 000 206 = 6.33 %. Grade C (5.0 %) still pays and grade D (11.2 %) still does not, so the line stays near 600: a worse LGD moves it less than dearer funding."}
```

<details><summary>Answer</summary>

A bad loan now costs 0.80 × 21 630 783 + 3 417 348 + 823 325 = 21 545 299 soum. Break-even = 1 454 907 ÷ (1 454 907 + 21 545 299) = **6.33 %**. Both grade edges stay on the same side of it, so the best line hardly moves (599 instead of 594).

</details>

**P6.** *(a bad-rate target)* The committee asks for **1.5 %** instead of 2 %. What is the loosest cut-off that meets it?

```task
{"id": "w09d4-p6", "kind": "python", "starter": "ok = [c for c in cs if (s >= c).any() and y[s >= c].mean() <= 0.015]\n# the loosest line, its approval rate and its profit\n", "answer": 659, "dp": 0, "model": "ok = [c for c in cs if (s >= c).any() and y[s >= c].mean() <= 0.015]\nc3 = min(ok)\nprint(c3, round(100 * (s >= c3).mean(), 1), round(profit(c3) / 1e9, 2))\n# 659 67.0 6.01"}
```

<details><summary>Answer</summary>

```python
ok = [c for c in cs if (s >= c).any() and y[s >= c].mean() <= 0.015]
c3 = min(ok)
# 659 67.0 6.01
print(c3, round(100 * (s >= c3).mean(), 1), round(profit(c3) / 1e9, 2))
```
**659** — the C/B edge: 67.0 % approved, 6.01 bn soum, 1.13 bn below the best line. The target falls exactly where the bad rate drops in a step.

</details>

**P7.** *(swap-in and swap-out)* Run the swap query of section 1 for the line **640**. How many rejected applicants would be swapped **in**?

```task
{"id": "w09d4-p7", "kind": "number", "answer": 1376, "dp": 0, "unit": "applicants", "hint": "Replace 600 by 640 twice in the swap query.", "model": "1 376 swap-ins (rejected with 640 or more) and 1 842 swap-outs (approved below 640; 1 687 of them became loans, 94 bad)."}
```

<details><summary>Answer</summary>

With 640 in both places: **1 376** swap-ins, 1 842 swap-outs, 10 394 unchanged. Of the swap-outs, 1 687 became loans and 94 went bad — known. The swap-ins' risk is unknown.

</details>

**P8.** *(policy rules)* Among applicants scoring **below 600**, how many were **rejected**, and how many of the others became loans? Count rejected applications below 600.

```task
{"id": "w09d4-p8", "kind": "sql", "model": "SELECT status, COUNT(*) AS applications\nFROM applications\nWHERE credit_score < 600\nGROUP BY status\nORDER BY applications DESC;", "note": "rejected 1 185, cancelled 607, approved 336, approved_not_disbursed 27 — 2 155 applicants below 600."}
```

<details><summary>Answer</summary>

```sql
SELECT status, COUNT(*) AS applications
FROM applications
WHERE credit_score < 600
GROUP BY status
ORDER BY applications DESC;
```
Of 2 155 applicants below 600: **1 185 rejected**, 607 cancelled, 336 approved and 27 approved but not disbursed. The 336 approvals below 600 are where the floor of 600 would act — and the 331 loans among them are the swap-outs we can measure.

</details>

**P9.** *(champion / challenger)* How many loans per arm would a test need to see a fall from 2.93 % to **2.18 %** (the line at 640), at 80 % power and α = 5 %?

```task
{"id": "w09d4-p9", "kind": "python", "starter": "h = proportion_effectsize(0.0293, 0.0218)\n# solve for the loans per arm\n", "answer": 6911, "dp": 0, "model": "h = proportion_effectsize(0.0293, 0.0218)\nprint(round(NormalIndPower().solve_power(h, alpha=0.05, power=0.8)))\n# 6911"}
```

<details><summary>Answer</summary>

```python
h = proportion_effectsize(0.0293, 0.0218)
# 6911
print(round(NormalIndPower().solve_power(h, alpha=0.05, power=0.8)))
```
About **6 911** loans per arm — two years of Nur's lending for the challenger alone, then a year for the loans to mature.

</details>

**P10.** *(PSI)* Compute the PSI of **2026 against 2025** (not 2024), to 4 decimals.

```task
{"id": "w09d4-p10", "kind": "python", "starter": "e25 = shares(A.loc[yr == \"2025\", \"credit_score\"].to_numpy())\n# PSI of 2026's shares (a) against 2025's\n", "answer": 0.0008, "dp": 4, "model": "e25 = shares(A.loc[yr == \"2025\", \"credit_score\"].to_numpy())\nprint(round(psi(e25, a), 4))\n# 0.0008"}
```

<details><summary>Answer</summary>

```python
e25 = shares(A.loc[yr == "2025", "credit_score"].to_numpy())
# 0.0008
print(round(psi(e25, a), 4))
```
**0.0008**: the last two years are even closer to each other than to 2024. Name the reference with every PSI — "against 2024".

</details>

**P11.** *(CSI)* The CSI of the **term** (`applications.term_months`, one band per term), 2026 against 2024, to 4 decimals.

```task
{"id": "w09d4-p11", "kind": "python", "starter": "t = pd.read_sql(\"SELECT applied_at, term_months FROM applications\", con)\nt[\"yr\"] = t[\"applied_at\"].str[:4]\nmix = pd.crosstab(t[\"term_months\"], t[\"yr\"], normalize=\"columns\")\n# psi of the 2026 column against the 2024 column\n", "answer": 0.0033, "dp": 4, "model": "t = pd.read_sql(\"SELECT applied_at, term_months FROM applications\", con)\nt[\"yr\"] = t[\"applied_at\"].str[:4]\nmix = pd.crosstab(t[\"term_months\"], t[\"yr\"], normalize=\"columns\")\nprint(round(psi(mix[\"2024\"].to_numpy(), mix[\"2026\"].to_numpy()), 4))\n# 0.0033"}
```

<details><summary>Answer</summary>

```python
t = pd.read_sql("SELECT applied_at, term_months FROM applications", con)
t["yr"] = t["applied_at"].str[:4]
mix = pd.crosstab(t["term_months"], t["yr"], normalize="columns")
# 0.0033
print(round(psi(mix["2024"].to_numpy(), mix["2026"].to_numpy()), 4))
```
**0.0033** — stable. The seven terms (3 to 48 months) are the bands; `crosstab(..., normalize="columns")` gives each year's shares.

</details>

**P12.** *(the monitoring view)* Add the **average score** to the monthly view. In which full month of 2026 is it lowest, and by how much is it below 2024's 661.7?

```task
{"id": "w09d4-p12", "kind": "number", "answer": 7.0, "dp": 1, "unit": "points", "hint": "view[\"avg_score\"] for January to September; 2024's average is A.loc[yr == \"2024\", \"credit_score\"].mean().", "model": "July: 654.7, 7.0 points below 2024's 661.7 — and its PSI, 0.0174, is still green. A 7-point dip hides under 0.1; the average score is the line that shows it."}
```

<details><summary>Answer</summary>

```python
print(view["avg_score"].round(1))
print(round(A.loc[yr == "2024", "credit_score"].mean(), 1))
```
The lowest full month is **July: 654.7**, **7.0 points** below 2024's 661.7, with PSI 0.0174 — green. Put the average score next to the PSI: it moves first.

</details>

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

This homework is reviewed by the mentor: (a) the query runs on the practice database and returns 13 rows, (b) the five assert cells pass after *Restart & Run All*, (c) the ten-bin PSI is printed with its reading, (d) the note gives the six facts.

**Check your results here before you hand in:**

**H1.** In your SQL table, what is the approval rate at the cut-off **630**, in %, to 1 decimal?

```task
{"id": "w09d4-hw1", "kind": "number", "answer": 83.1, "dp": 1, "unit": "%", "hint": "Loans scoring 630 or more ÷ 7 615.", "model": "6 327 of 7 615 = 83.1 %, with a bad rate of 2.18 %."}
```

**H2.** And the profit at **630**, in bn soum, to 2 decimals?

```task
{"id": "w09d4-hw2", "kind": "number", "answer": 6.63, "dp": 2, "unit": "bn soum", "hint": "goods approved × 1 454 907 − bads approved × 17 219 143.", "model": "6 189 × 1 454 907 − 138 × 17 219 143 = 6.63 bn — half a billion below the line at 600."}
```

**H3.** What PSI do your ten bins give for 2026 against 2024, to 4 decimals?

```task
{"id": "w09d4-hw3", "kind": "number", "answer": 0.0038, "dp": 4, "hint": "Edges: np.quantile(2024's scores, np.arange(1, 10) / 10); shares with np.digitize (a score on an edge goes up); expected = 2024's ten shares.", "model": "0.0038 (0.0039 if a score on an edge goes into the bin below) — as stable as on the six bands. More bins, same verdict."}
```

**H4.** Your six-line note for Nilufar (the last cell of the notebook) — write it here too.

```task
{"id": "w09d4-hw4", "kind": "free", "min": 60, "model": "Set the floor at 600 and keep every policy rule above it. On the 7 615 scored loans it approves 95.7 % at a 2.55 % bad rate. At W8D2's prices it earns 7.12 bn soum, 0.21 bn more than approving everyone; the exact peak at 594 (7.14 bn) is no better within noise. A 2 % bad-rate target needs a line at 647 and costs about 1.0 bn. The applicants are stable: PSI 0.0037 on six bands and 0.0038 on ten. Revisit if funding rises above about 21 % or if any month's PSI passes 0.1.", "rubric": ["gives the line with its approval and bad rate", "gives its profit and how it compares with approving everyone", "gives the price of the 2 % target", "gives the PSI and one trigger to revisit"]}
```

### 📎 Hand in here

```sqltask
{"check": "handin-W9D4", "lesson": "W9D4", "title": "HW 9.4", "why": "This is the strategy table a risk committee signs: every line it might choose, what it approves, what it loses and what it earns — and the proof that the applicants it was computed on are still the ones applying.", "graded": ["the query runs and returns the 13 cut-offs with approval, bad rate, bads avoided, goods lost and profit", "the five assert cells pass after Restart & Run All", "the ten-bin PSI is printed with its reading", "the note gives the line, its numbers, the price of a 2 % target, the PSI and a trigger"], "tasks": [{"id": "cutoff_table.sql", "file": "cutoff_table.sql", "text": true, "minLines": 5, "q": "Write `cutoff_table.sql` here — the one query of Part A."}, {"id": "day4_starter.ipynb", "file": "day4_starter.ipynb", "names": ["day4_starter.ipynb"], "upload": true, "accept": ".ipynb", "q": "Attach `day4_starter.ipynb` — executed, with the outputs."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else (the profit chart as a picture, a .zip of several files)."}]}
```

---

## 5. Self-check

Three questions, one at a time. Wrong? The explanation points to the part of section 1 to reread.

```check
{"id": "w09d4-sc", "questions": [
  {"type": "single", "q": "A good loan leaves 1.45 m soum and a bad one costs 17.2 m. A group of applicants goes bad 6 % of the time. Decline it?", "options": ["No: 6 % is below the break-even 1.45 ÷ (1.45 + 17.2) = 7.8 %, so the group earns money", "Yes: any group with bads should be declined", "Yes: 6 % is above the book's 2.9 %", "It depends only on the Gini"], "answer": 0, "explain": "Decline a group when its bad rate is above good ÷ (good + bad). Compared with the book's average it may look risky, yet it still pays (→ section 1, 'The profit-maximising cut-off')."},
  {"type": "number", "q": "Expected shares 20 % and 80 %, actual 30 % and 70 %. What is the PSI, to 3 decimals?", "answer": 0.054, "tol": 0.0015, "explain": "(0.30 − 0.20) × ln(0.30 / 0.20) + (0.70 − 0.80) × ln(0.70 / 0.80) = 0.0405 + 0.0134 = 0.054 — stable, under 0.1 (→ section 1, 'PSI')."},
  {"type": "single", "q": "A new rule would approve 2 295 applicants Nur rejected before. What do you know about their bad rate?", "options": ["It equals the approved loans' bad rate at the same score", "Nothing from Nur's own data: they are swap-ins, and their outcomes were never observed", "It is zero", "It equals the book's 2.9 %"], "answer": 1, "explain": "No loan, no outcome. Reject inference can estimate it; the data cannot show it (→ section 1, 'Swap-in and swap-out')."}
]}
```

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

```game
{"type": "sort", "id": "w09d4-g3", "title": "Which part of the credit policy?", "q": "Put each line where it belongs in the credit policy.", "groups": {"Cut-offs": ["Consumer: approve 600 and above", "a refer zone of ± 10 points around each line"], "Policy rules": ["decline if a bureau loan is 90+ days late", "decline if payments would exceed half of the income"], "Limits and authority": ["an officer may approve up to 50 m soum alone"], "Monitoring triggers": ["back to the committee if the PSI passes 0.25"]}}
```

> 🎯 **Interview version.** *"How would you set the cut-off for a scorecard?"* — Not by the bad rate alone. Put a price on a good and on a bad loan from the unit economics, compute the profit of every possible line, and find where the loans just below it go bad more often than the break-even rate (good ÷ (good + bad)). Show the trade-off table, the price of any bad-rate target and the swap sets; keep the policy rules; and recompute when funding or LGD changes. Give a number: "on our book the profit peaks around 600 — about 0.2 bn above approving everyone; a 2 % target would cost about 1 bn."

**Say it like in an interview.** *"How would you set the approval cut-off, and how would you know it still works next year?"* — answer in 3–5 sentences.

```task
{"id": "w09d4-cc", "kind": "free", "min": 50, "model": "I would price a good and a bad loan from the unit economics — on our Consumer numbers a good loan leaves about 1.45 m soum and a bad one costs about 17.2 m — and compute the profit of every possible cut-off on past loans. The best line is where the loans just below it go bad more often than the break-even rate, good ÷ (good + bad), about 7.8 % here; on our book that is around 600, 0.2 bn above approving everyone. I would show the trade-off table, the cost of any bad-rate target and the swap-ins whose risk is unknown, and keep the policy rules. To know it still works I would watch every month the PSI of the applicants (0.004 today), the CSI of the main inputs, the Gini on mature vintages and the bad rate by vintage, with triggers that send the policy back to the committee.", "rubric": ["prices good and bad loans and maximises profit, not just the bad rate", "names the break-even bad rate", "mentions the swap sets or policy rules", "names the monitoring tools (PSI, CSI, Gini, bad rate by vintage) with a trigger"]}
```

Tomorrow: the checkpoint — the scorecard review for the risk committee, from this week's four days.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w09d4", "pass": 0.8, "questions": [
  {"type": "single", "q": "Raising the cut-off from 600 to 660 moves the approval rate from 95.7 % to 66.7 % and the bad rate from 2.55 % to 1.50 %. What does that show?", "options": ["The trade-off: a large loss of volume for a small fall in bad rate", "That 660 is the best line", "That the score is broken", "That the bad rate rises with the cut-off"], "answer": 0, "explain": "29 points of approvals for about one point of bad rate — whether it is worth it is a question of money (→ section 1, 'The cut-off')."},
  {"type": "number", "q": "A good loan leaves 1 454 907 soum, a bad one costs 17 219 143. What is the break-even bad rate, in %, to 2 decimals?", "answer": 7.79, "tol": 0.005, "explain": "1 454 907 ÷ 18 674 050 = 7.79 % — W8D2's break-even PD for a Consumer loan (→ section 1, 'The profit-maximising cut-off')."},
  {"type": "single", "q": "Funding rises from 18 % to 22 %. What happens to the profit-maximising cut-off?", "options": ["It moves up (594 → 659): a good loan leaves less, so fewer groups are worth lending to", "It moves down", "It stays: the cut-off depends only on the score", "There is no longer a best cut-off"], "answer": 0, "explain": "The break-even falls to 3.72 %, below grade C's 5 %: the line jumps to the C/B edge (→ section 1, explorer)."},
  {"type": "single", "q": "The committee wants approved loans under 2 % bad. The loosest such line is 647, earning 6.12 bn; the best line earns 7.14 bn. What do you tell them?", "options": ["The target costs about 1.0 bn of profit on this book — vote with that number in view", "647 is the best line", "The target is free", "Targets are not allowed"], "answer": 0, "explain": "The price of a target is a fact the committee needs before it votes (→ section 1, 'A bad-rate target')."},
  {"type": "single", "q": "Which applicants are swap-ins?", "options": ["Approved today and declined by the new rule", "Rejected today and approved by the new rule — their outcomes are unknown", "Applicants with no score", "Loans that were written off"], "answer": 1, "explain": "Swap-outs are known (Nur lent to them); swap-ins are not — reject inference (→ section 1, 'Swap-in and swap-out')."},
  {"type": "single", "q": "What does this print?", "code": "e = np.array([0.5, 0.5])\na = np.array([0.5, 0.5])\nnp.sum((a - e) * np.log(a / e))", "options": ["0.0 — identical shares, no shift", "1.0", "0.5", "An error"], "answer": 0, "explain": "Each band's term is (a − e) × ln(a / e) = 0 × ln 1 = 0 (→ section 1, 'PSI')."},
  {"type": "single", "q": "The PSI is 0.18. What is the reading, and the next step?", "options": ["Stable; nothing to do", "Watch: find which input moved with the CSIs and check the bad rate by band there", "Act: switch the scorecard off today", "PSI above 0.1 means the Gini has fallen"], "answer": 1, "explain": "0.1–0.25 is amber: investigate the cause before acting. PSI says the population moved, not that the ranking broke (→ section 1, 'CSI', 'What to do')."},
  {"type": "single", "q": "The bad rate of new vintages rises from 2.9 % to 4.1 % while the Gini and the PSI stay the same. What is the usual action?", "options": ["Rebuild the scorecard", "Recalibrate the PD levels and move the cut-off: the order is right, the level is not", "Ignore it", "Lower the cut-off"], "answer": 1, "explain": "Ranking intact, level shifted: recalibrate and reprice rather than rebuild (→ section 1, 'What to do when it drifts')."},
  {"type": "single", "q": "Company corner: where does an approved cut-off live?", "options": ["In the analyst's notebook", "In the credit policy, changed only by the risk committee", "In the bureau's database", "In each officer's head"], "answer": 1, "explain": "The policy holds the cut-offs, rules, limits, overrides and monitoring triggers; the committee changes it (→ Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak.

```challenge
{"id": "w09d4", "q": "At W8D2's prices, at what funding rate (% a year) does the score band 600–639 stop paying for itself — its bad rate equal to the break-even? Use the band's bad rate on our loans (57 bads of 1 356) and the Consumer numbers: interest 5 695 580, funding 3 417 348 at 18 % (it grows in proportion to the rate), operating cost 823 325, EAD 21 630 783, LGD 60 %. Give the rate in % to 1 decimal.", "type": "number", "dp": 1, "python": true, "h": ["285d16846d5d1b0de1c5c7e7"], "hint": "good(f) = I − COF × f / 0.18 − OPEX and bad(f) = LGD × EAD + COF × f / 0.18 + OPEX; their sum does not depend on f.", "sol": "cCA9IDU3IC8gMTM1NiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyB0aGUgYmFuZCA2MDDigJM2Mzk6IDQuMjAgJSBiYWQKSSwgQ09GMTgsIE9QRVgsIEVBRCwgTEdEID0gNV82OTVfNTgwLCAzXzQxN18zNDgsIDgyM18zMjUsIDIxXzYzMF83ODMsIDAuNjAKIyBnb29kKGYpICsgYmFkKGYpID0gSSArIExHRCDDlyBFQUQgZm9yIGV2ZXJ5IGZ1bmRpbmcgcmF0ZSBmCiMgdGhlIGJhbmQgc3RvcHMgcGF5aW5nIHdoZW4gcCA9IGdvb2QoZikgLyAoSSArIExHRCDDlyBFQUQpCmYgPSAwLjE4ICogKEkgLSBPUEVYIC0gcCAqIChJICsgTEdEICogRUFEKSkgLyBDT0YxOApwcmludChyb3VuZCgxMDAgKiBmLCAxKSkgICAgICAgICAgICAgICAgICAgICAjIDIxLjUKCjIxLjUgJTogYWJvdmUgaXQsIGEgNjAw4oCTNjM5IGxvYW4gbG9zZXMgbW9uZXkgb24gYXZlcmFnZSwgc28gYXQgMjIgJSB0aGUgYmVzdCBsaW5lIGp1bXBzIHBhc3QgdGhpcyBiYW5kIOKAlCB0aGUgZXhwbG9yZXIncyBtb3ZlIGZyb20gNTk0IHRvIDY1OS4gR3JhZGUgQyBhcyBhIHdob2xlICg0Ljk4ICUgYmFkKSBzdG9wcyBwYXlpbmcgYSBsaXR0bGUgZWFybGllciwgYXQgYWJvdXQgMjAuOCAlLgpUaGUgdHJhcDogbWFraW5nIHRoZSBiYWQgbG9hbiBkZWFyZXIgYnV0IGZvcmdldHRpbmcgdGhhdCB0aGUgZ29vZCBsb2FuJ3MgbWFyZ2luIHNocmlua3MgYnkgdGhlIHNhbWUgYW1vdW50IOKAlCB0aGUgYnJlYWstZXZlbiBmYWxscyBmYXN0IGJlY2F1c2UgYm90aCBtb3ZlLg=="}
```

<!-- challenge:end -->
