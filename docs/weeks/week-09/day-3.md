# Week 9 · Day 3 — Is the scorecard any good? ROC, AUC, Gini, KS and lift

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 9.3 (due Day 5)</span> <span class="badge company">Company corner</span>

> STORY **Wednesday, 9:00.** Nilufar has the scorecard's build report on her desk, dated October 2024, with a coffee ring on the cover. *"Two years, 7 828 loans and 234 bads later — does this score still separate good borrowers from bad ones, or are we approving on a number that has gone stale? I need one page: how well does it rank, is that normal for an application scorecard, and is it worse on the new loans?"* Jasur, from the doorway: *"Give her the ROC curve and the KS, and split it by year. And please don't tell her the accuracy."*

## Today in 3 lines

- A scorecard is judged on how it **ranks**. At one cut-off: the **confusion matrix** (bads caught, goods turned away), **TPR** and **FPR** — and why **accuracy** misleads when only 3 % go bad. Across every cut-off: the **ROC curve** and its area, the **AUC** (the chance a random good scores above a random bad), **Gini** = 2·AUC − 1, the **KS** (the widest gap between the bads' and goods' cumulative curves), and **lift and gains** for the worst-scored loans.
- You compute each one on Nur's 7 615 scored loans, in Python (by ranks, with numpy and scipy) and in SQL (from a table of counts per score); you compare the score with the risk grade and validate **out of time** on the loans made after the scorecard's first year.
- Nilufar's answer: **AUC 0.689, Gini 0.377, KS 0.34 at a score of 658; the worst 10 % of scores hold 25 % of the bads.** The score still ranks, but below the 0.4–0.6 usual for an application scorecard. HW 9.3 splits it by product and year in `data/python/week9/day3_starter.ipynb`.

---

## 1. Learn — judging a ranking

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

```task
{"id": "w09d3-l1", "kind": "number", "answer": 2.93, "dp": 2, "unit": "%", "hint": "223 bads among 7 615 scored loans.", "model": "223 / 7 615 = 2.93 %. On all 7 828 loans it is 234 / 7 828 = 2.99 %: the 213 unscored loans include 11 bads, a bad rate of 5.2 %."}
```

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

```task
{"id": "w09d3-l2", "kind": "number", "answer": 37, "dp": 0, "unit": "bads", "hint": "Count the bads with a score below 600: change `cut` in the box above.", "model": "37 bads — 12 below 560 and 25 from 560 to 599. They cost 294 good loans turned away."}
```

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

```task
{"id": "w09d3-l3", "kind": "number", "answer": 3.98, "dp": 2, "unit": "%", "hint": "Goods with a score below 600, divided by all 7 392 goods.", "model": "294 / 7 392 = 3.98 %. The cut-off 600 turns away 4 % of the goods to catch 16.6 % of the bads."}
```

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

```task
{"id": "w09d3-l4", "kind": "choice", "options": ["Because the score is useless", "Because 97 % of the loans are good, so calling every loan good is right 97 % of the time", "Because accuracy counts only the bads", "Because the cut-off 640 is too low"], "answer": 1, "explain": "With 2.93 % bads, the 'always good' answer is right 7 392 times out of 7 615. Accuracy rewards the big class; TPR and FPR look at each class separately."}
```

### The ROC curve — every cut-off at once

**Before you read.** Guess first, then play with it — the explanation below will make more sense.

```explore
{"id": "w09d3-x1", "type": "roc", "title": "One cut-off, then all of them", "predict": {"q": "Pick one **good** and one **bad** borrower at random from our 7 615 scored loans. How often does the good one have the higher credit score?", "options": ["About 50 % — a score is mostly noise", "About 69 %", "About 90 %", "About 97 % — almost every borrower is good"], "answer": 1, "why": "About 69 % (a tie counts half): that share is the AUC, 0.689. The 97 % is the share of goods — a different question. Shade the area under the curve below and the same number appears."}, "from": 424, "n": [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 4, 0, 0, 0, 2, 2, 1, 1, 0, 1, 1, 0, 1, 1, 0, 2, 1, 0, 0, 1, 0, 5, 0, 2, 2, 2, 0, 4, 3, 1, 4, 0, 1, 1, 3, 1, 2, 6, 1, 5, 2, 2, 4, 1, 2, 1, 3, 3, 6, 4, 1, 1, 4, 3, 2, 2, 9, 6, 3, 1, 5, 3, 8, 4, 4, 6, 5, 4, 9, 2, 8, 9, 6, 4, 8, 9, 4, 10, 11, 3, 4, 5, 9, 11, 11, 7, 9, 4, 5, 6, 7, 22, 26, 22, 28, 28, 31, 24, 38, 28, 28, 26, 27, 34, 26, 32, 33, 27, 36, 34, 40, 27, 40, 40, 30, 34, 36, 44, 43, 30, 43, 48, 44, 26, 35, 45, 44, 43, 34, 41, 39, 31, 42, 36, 37, 40, 39, 44, 33, 45, 47, 51, 45, 56, 55, 48, 54, 45, 41, 34, 29, 66, 61, 61, 60, 74, 58, 59, 61, 59, 73, 70, 53, 71, 62, 53, 53, 61, 57, 58, 73, 47, 75, 72, 65, 59, 66, 58, 63, 50, 48, 64, 52, 52, 53, 52, 60, 48, 41, 44, 47, 57, 54, 54, 57, 56, 47, 52, 38, 42, 60, 48, 45, 45, 36, 37, 38, 40, 41, 54, 42, 43, 42, 38, 50, 43, 37, 35, 36, 46, 33, 31, 39, 37, 48, 46, 28, 29, 43, 35, 26, 25, 29, 33, 31, 24, 24, 26, 26, 30, 19, 28, 32, 23, 20, 28, 19, 19, 29, 18, 16, 12, 14, 22, 15, 18, 15, 13, 19, 20, 10, 14, 12, 12, 11, 11, 16, 12, 15, 9, 14, 14, 9, 10, 13, 10, 8, 5, 4, 8, 9, 5, 7, 2, 3, 5, 4, 7, 4, 5, 3, 2, 6, 5, 2, 2, 2, 1, 3, 4, 3, 4, 2, 4, 2, 1, 1, 6, 0, 2, 0, 3, 3, 2, 2, 0, 3, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 2, 3, 2, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 2, 7], "b": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 2, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 2, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 2, 3, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 2, 1, 2, 1, 3, 3, 1, 1, 0, 0, 1, 3, 1, 1, 2, 1, 1, 2, 4, 0, 1, 1, 4, 4, 2, 4, 0, 3, 0, 1, 3, 1, 1, 0, 0, 0, 3, 2, 2, 1, 3, 3, 2, 2, 2, 3, 6, 2, 3, 4, 5, 2, 2, 3, 3, 0, 0, 2, 1, 1, 1, 1, 0, 3, 0, 0, 0, 1, 2, 2, 0, 3, 1, 2, 0, 0, 1, 0, 1, 3, 0, 0, 2, 1, 0, 2, 0, 2, 1, 0, 0, 2, 0, 2, 0, 0, 2, 1, 2, 1, 0, 0, 2, 3, 1, 1, 1, 4, 0, 1, 0, 0, 0, 2, 1, 1, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "start": {"cut": 640}, "challenges": [{"id": "c1", "text": "Find the cut-off where the **KS gap is widest** — where our score separates bads from goods best.", "when": {"ks": [">=", 0.3395], "model": ["=", 0]}}, {"id": "c2", "text": "Find the **loosest** cut-off that still declines **at least half the bads**. How many goods does it turn away?", "when": {"tpr": [">=", 0.5], "cut": ["<=", 648], "model": ["=", 0]}}, {"id": "c3", "text": "**Shade the area** under our score's curve: that area is the AUC.", "when": {"area": ["=", 1], "model": ["=", 0]}}, {"id": "c4", "text": "Switch to **a coin toss** with the area shaded: the curve falls onto the diagonal and the area is exactly one half.", "when": {"model": ["=", 1], "area": ["=", 1]}}]}
```

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

```task
{"id": "w09d3-l5", "kind": "choice", "options": ["A cut-off below the lowest score: everyone is approved, no bad is caught, no good is turned away", "A cut-off above the highest score: everyone is declined", "The cut-off with the widest KS gap", "The point (0, 0) is not on the curve"], "answer": 0, "explain": "Approve everyone: TPR = 0 and FPR = 0. Decline everyone: TPR = FPR = 1, the top-right corner."}
```

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

```task
{"id": "w09d3-l6", "kind": "choice", "options": ["68.9 % of the loans are classified correctly", "In 68.9 % of good–bad pairs, the good loan scores higher (ties counted half)", "68.9 % of the bads score below 640", "The score is right about a bad 68.9 % of the time"], "answer": 1, "explain": "AUC is a statement about pairs, not about one cut-off or about accuracy: 1 648 416 pairs, the good one ahead in 68.9 % of them."}
```

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

```task
{"id": "w09d3-l7", "kind": "number", "answer": 0.44, "dp": 2, "hint": "Gini = 2 × AUC − 1.", "model": "2 × 0.72 − 1 = 0.44 — inside the usual 0.4–0.6, and above our 0.377. Before believing it, ask on which loans and with which definition of bad."}
```

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

```task
{"id": "w09d3-l8", "kind": "number", "answer": 25.9, "dp": 1, "unit": "points", "hint": "Share of bads scoring ≤ 649 minus the share of goods scoring ≤ 649, × 100.", "model": "117 / 223 = 52.5 % of bads, 1 964 / 7 392 = 26.6 % of goods: a gap of 25.9 points — less than the 34.0 at 658."}
```

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

```task
{"id": "w09d3-l9", "kind": "number", "answer": 1.96, "dp": 2, "hint": "Gain of the worst 30 % divided by 30 %.", "model": "58.7 % / 30 % = 1.96: the worst three deciles go bad at about twice the average rate."}
```

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

SQL gives AUC 0.689 and KS 0.3395 — the Python numbers, from 427 rows of counts.

**When you use it.**
- When the loans live in a database and the monthly report is a query, not a notebook.
- Grouping by a band instead of the score gives the AUC of the band table (Practice P10).

**Your turn.**

```game
{"type": "cloze", "id": "w09d3-g1", "title": "AUC from counts per score", "text": "AUC = SUM( {{0}} × ( {{1}} + 0.5 × {{2}} ) ) ÷ ( all goods × {{3}} )", "code": false, "blanks": [["goods at the score"], ["bads below the score"], ["bads at the score"], ["all bads"]], "distractors": ["all loans", "bads above the score", "the cut-off"]}
```

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

**Your turn.** How can four grades rank better than 427 different score values?

```task
{"id": "w09d3-l10", "kind": "choice", "options": ["They cannot: more values always rank better", "The grade uses information the score does not have", "If inside each band the finer score ranks no better (or worse) than chance, the extra detail adds noise, and cutting it away at the right edges raises the Gini", "The grade's Gini is computed on more loans"], "answer": 2, "explain": "The grade is the score in four bands — no extra information. Inside B and C a higher score does not mean fewer bads, so the detail there only shuffles the ranking."}
```

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

```task
{"id": "w09d3-l11", "kind": "choice", "options": ["The scorecard has broken: rebuild it now", "It still ranks on new loans, a little less well; with 155 bads the drop is within noise — keep watching it, and plan a rebuild review", "The newer loans are better borrowers", "Out-of-time numbers are always lower, so ignore them"], "answer": 1, "explain": "The intervals 0.28–0.54 and 0.28–0.45 overlap; the point estimate is lower. That is a 'watch', not an alarm — Day 4 builds the monthly view that will show it."}
```

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

**Which measure answers the question?**

```game
{"type": "sort", "id": "w09d3-g2", "title": "Which measure?", "q": "Put each question under the measure that answers it.", "groups": {"Confusion matrix": ["How many bads would declining below 620 have stopped?"], "AUC / Gini": ["How well does the score rank overall, whatever the cut-off?", "Is the new vendor score better than ours on the same loans?"], "KS": ["At which score do bads and goods separate best?"], "Lift / gains": ["If collections call the worst 10 % of the book, what share of the bads do they reach?"], "Out-of-time": ["Does the score still work on the loans made since it was built?"]}}
```

**Words of the day.**

```game
{"type": "match", "id": "w09d3-g3", "title": "Words of the day", "pairs": [["TPR (recall)", "the share of all bads the cut-off declines"], ["FPR", "the share of all goods the cut-off declines"], ["ROC curve", "(FPR, TPR) for every cut-off"], ["AUC", "the chance a random good scores above a random bad"], ["Gini", "2 × AUC − 1"], ["KS", "the widest gap between the bads' and goods' cumulative curves"], ["Lift", "how many times a group's bad rate exceeds the average"], ["Out-of-time validation", "measuring the score on loans from after its build period"]]}
```

### Depth (optional)

- **Books.** Naeem Siddiqi, *Intelligent Credit Scoring* (Wiley, 2nd ed., 2017): the chapters on scorecard validation and on choosing a cut-off. Lyn Thomas, Jonathan Crook and David Edelman, *Credit Scoring and Its Applications* (SIAM, 2nd ed., 2017): ROC, Gini and KS for credit scoring, and why they agree or disagree.
- **The meaning of the AUC.** J. A. Hanley and B. J. McNeil, "The meaning and use of the area under a receiver operating characteristic (ROC) curve", *Radiology* 143 (1982): the AUC as the Mann–Whitney statistic, with a formula for its standard error.
- **Regulators.** Basel Committee on Banking Supervision, *Studies on the Validation of Internal Rating Systems* (Working Paper 14, 2005): the CAP curve, the accuracy ratio (= Gini) and the ROC, as banks use them.
- **At work in Python:** `from sklearn.metrics import roc_auc_score, roc_curve` — the same numbers as today's ranks, with the minus sign for a "high is good" score.
- *Russian terms:* скоринговая карта = scorecard, порог отсечения (cut-off) = cut-off, матрица ошибок = confusion matrix, чувствительность / полнота = sensitivity / recall, доля ложноположительных = false positive rate, ROC-кривая = ROC curve, площадь под кривой = AUC, коэффициент Джини = Gini, статистика Колмогорова–Смирнова = KS, лифт = lift, кривая прироста = gains chart, проверка на отложенной выборке / периоде = out-of-sample / out-of-time validation.

---

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

Every task has its own answer box, and the questions follow the order of section 1 — the concept is named in italics. The Python boxes run in the same session as section 1, so `np`, `pd`, `plt`, `stats`, the frames `L` and `S`, the arrays `s` and `y` and the function `gini_of` are ready — if you came straight here, press ▶ Run on the first box of section 1, then on the box with `gini_of`. Answer, check, then open the fold for the full working. (The notebook `data/python/week9/day3_starter.ipynb` holds the same tools; you need it for the homework.)

**P1.** *(bad and good)* Of the 223 bads with a score, how many are `written_off` (the rest are `default`)?

```task
{"id": "w09d3-p1", "kind": "python", "starter": "# count the statuses of the scored bads\nprint(S.loc[S.bad == 1, \"status\"].value_counts())\n", "answer": 183, "dp": 0, "model": "print(S.loc[S.bad == 1, \"status\"].value_counts())\n# written_off 183, default 40"}
```

<details><summary>Answer</summary>

```python
print(S.loc[S.bad == 1, "status"].value_counts())
```
**183** written off and 40 in default. Most bads have already been written off — their loss is final, which is why both statuses count as bad.

</details>

**P2.** *(the confusion matrix)* Write the SQL that returns the four counts at the cut-off **620**: one row per decision (`declined` / `approved`) with its bads and goods.

```task
{"id": "w09d3-p2", "kind": "sql", "model": "SELECT CASE WHEN a.credit_score < 620 THEN 'declined' ELSE 'approved' END AS decision,\n       SUM(l.status IN ('default', 'written_off')) AS bads,\n       SUM(l.status NOT IN ('default', 'written_off')) AS goods\nFROM loans l\nJOIN applications a ON a.application_id = l.application_id\nWHERE a.credit_score IS NOT NULL\nGROUP BY decision\nORDER BY decision;", "note": "Declined: 62 bads, 859 goods (TP, FP). Approved: 161 bads, 6 533 goods (FN, TN)."}
```

<details><summary>Answer</summary>

```sql
SELECT CASE WHEN a.credit_score < 620 THEN 'declined' ELSE 'approved' END AS decision,
       SUM(l.status IN ('default', 'written_off')) AS bads,
       SUM(l.status NOT IN ('default', 'written_off')) AS goods
FROM loans l
JOIN applications a ON a.application_id = l.application_id
WHERE a.credit_score IS NOT NULL
GROUP BY decision
ORDER BY decision;
```
Declined: **62 bads (TP) and 859 goods (FP)**; approved: 161 bads (FN) and 6 533 goods (TN). In SQLite a comparison is 1 or 0, so `SUM(condition)` counts the rows where it holds.

</details>

**P3.** *(TPR and FPR)* Write `rates(cut)` that returns (TPR, FPR) for "decline below cut". Print the TPR at **680**, in %, to 1 decimal.

```task
{"id": "w09d3-p3", "kind": "python", "starter": "def rates(cut):\n    # TPR: share of bads below cut; FPR: share of goods below cut\n    ...\n\nprint(rates(680))\n", "answer": 74.9, "dp": 1, "model": "def rates(cut):\n    return (s[y == 1] < cut).mean(), (s[y == 0] < cut).mean()\n\ntpr, fpr = rates(680)\nprint(round(100 * tpr, 1), round(100 * fpr, 1))\n# 74.9 48.9"}
```

<details><summary>Answer</summary>

```python
def rates(cut):
    return (s[y == 1] < cut).mean(), (s[y == 0] < cut).mean()

tpr, fpr = rates(680)
# 74.9 48.9
print(round(100 * tpr, 1), round(100 * fpr, 1))
```
At 680 the score catches **74.9 %** of the bads — and turns away 48.9 % of the goods, almost half of Nur's good customers.

</details>

**P4.** *(accuracy)* What is the accuracy of the cut-off **560**, in %, to 2 decimals? Is it better or worse than "approve everyone"?

```task
{"id": "w09d3-p4", "kind": "number", "answer": 96.07, "dp": 2, "unit": "%", "hint": "(TP + TN) / 7 615 at 560: TP = 12, FP = 88.", "model": "(12 + 7 304) / 7 615 = 96.07 % — below the 97.07 % of approving everyone, although this cut-off catches 12 bads. Accuracy punishes every cut-off that turns goods away."}
```

<details><summary>Answer</summary>

At 560: TP = 12, FN = 211, FP = 88, TN = 7 304. Accuracy = (12 + 7 304) / 7 615 = **96.07 %** — lower than 97.07 % for "approve everyone". By accuracy, every real cut-off looks worse than no scorecard at all; that is why scorecards are never judged by it.

</details>

**P5.** *(the ROC curve)* Draw the ROC curve and mark the three grade edges (cut-offs 600, 660, 720) as dots. What is the FPR at **660**, in %, to 2 decimals?

```task
{"id": "w09d3-p5", "kind": "python", "starter": "plt.plot(fpr_all, tpr_all)\nplt.plot([0, 1], [0, 1], \"--\")\nfor c in (600, 660, 720):\n    # TODO: the TPR and FPR at c, a dot, and print the FPR in %\n    ...\nplt.show()\n", "answer": 32.36, "dp": 2, "model": "plt.plot(fpr_all, tpr_all)\nplt.plot([0, 1], [0, 1], \"--\")\nfor c in (600, 660, 720):\n    t, f = (s[y == 1] < c).mean(), (s[y == 0] < c).mean()\n    plt.plot(f, t, \"o\")\n    print(c, round(100 * f, 2), round(100 * t, 1))\nplt.show()\n# 600 3.98 16.6 · 660 32.36 65.9 · 720 76.22 92.8"}
```

<details><summary>Answer</summary>

```python
plt.plot(fpr_all, tpr_all)
plt.plot([0, 1], [0, 1], "--")
for c in (600, 660, 720):
    t, f = (s[y == 1] < c).mean(), (s[y == 0] < c).mean()
    plt.plot(f, t, "o")
    print(c, round(100 * f, 2), round(100 * t, 1))
plt.show()
```
600: (3.98 %, 16.6 %); 660: (**32.36 %**, 65.9 %); 720: (76.22 %, 92.8 %). Between 600 and 660 the curve climbs steeply — that is where the score earns its keep.

</details>

**P6.** *(AUC)* Check the AUC by its definition: compare **every** good score with **every** bad score (1 648 416 pairs) with numpy broadcasting, a tie counting half. Print it to 3 decimals.

```task
{"id": "w09d3-p6", "kind": "python", "starter": "good, bad = s[y == 0], s[y == 1]\n# a 7 392 x 223 table of comparisons: good[:, None] > bad[None, :]\n", "answer": 0.689, "dp": 3, "model": "good, bad = s[y == 0], s[y == 1]\nwins = (good[:, None] > bad[None, :]).mean()\nties = (good[:, None] == bad[None, :]).mean()\nprint(round(wins + 0.5 * ties, 3), round(wins, 4), round(ties, 4))\n# 0.689 0.6863 0.0048"}
```

<details><summary>Answer</summary>

```python
good, bad = s[y == 0], s[y == 1]
wins = (good[:, None] > bad[None, :]).mean()
ties = (good[:, None] == bad[None, :]).mean()
# 0.689 0.6863 0.0048
print(round(wins + 0.5 * ties, 3), round(wins, 4), round(ties, 4))
```
The good loan wins 68.63 % of the pairs outright and ties 0.48 %; with half the ties, **0.689** — the ranks' answer, from 1.6 million comparisons.

</details>

**P7.** *(Gini)* Give the 213 unscored loans the **worst** possible score (0) and compute the Gini on all 7 828 loans. Then give them the **best** (900). To 3 decimals, the "worst" version?

```task
{"id": "w09d3-p7", "kind": "python", "starter": "yy = L[\"bad\"].to_numpy()\nfor fill in (0, 900):\n    x = L[\"score\"].fillna(fill).to_numpy()\n    # print fill and the Gini, with gini_of\n", "answer": 0.371, "dp": 3, "model": "yy = L[\"bad\"].to_numpy()\nfor fill in (0, 900):\n    x = L[\"score\"].fillna(fill).to_numpy()\n    print(fill, round(gini_of(x, yy), 3))\n# 0 0.371 · 900 0.33"}
```

<details><summary>Answer</summary>

```python
yy = L["bad"].to_numpy()
for fill in (0, 900):
    x = L["score"].fillna(fill).to_numpy()
    print(fill, round(gini_of(x, yy), 3))
```
As the worst: **0.371**; as the best: 0.330. The unscored loans go bad at 5.2 %, so ranking them last costs almost nothing, and ranking them first costs 0.04 of Gini. A Gini always names its population: "0.377 on the 7 615 scored loans".

</details>

**P8.** *(KS)* Compute the KS of the **grade** (A = 4 … D = 1) the same way as the score's. Which is larger?

```task
{"id": "w09d3-p8", "kind": "python", "starter": "g = S[\"risk_grade\"].map({\"A\": 4, \"B\": 3, \"C\": 2, \"D\": 1}).to_numpy()\nxs = np.unique(g)\n# the gap between the bads' and goods' cumulative shares at each grade value\n", "answer": 0.336, "dp": 3, "model": "g = S[\"risk_grade\"].map({\"A\": 4, \"B\": 3, \"C\": 2, \"D\": 1}).to_numpy()\nxs = np.unique(g)\ngap = [(g[y == 1] <= x).mean() - (g[y == 0] <= x).mean() for x in xs]\nprint(round(max(gap), 3))\n# 0.336 at grade C or worse — the score's KS is 0.340"}
```

<details><summary>Answer</summary>

```python
g = S["risk_grade"].map({"A": 4, "B": 3, "C": 2, "D": 1}).to_numpy()
xs = np.unique(g)
gap = [(g[y == 1] <= x).mean() - (g[y == 0] <= x).mean() for x in xs]
print(round(max(gap), 3))
```
The grade's KS is **0.336**, reached at "C or worse" (scores below 660) — just under the score's 0.340 at 658. The two measures can disagree: the grade wins on Gini, the score by a hair on KS, because KS looks at one point only.

</details>

**P9.** *(lift and gains)* Build the gains table in pandas: sort by score, cut into ten deciles with `pd.qcut(S["score"].rank(method="first"), 10, labels=False)`, then the share of all bads in the worst **two** deciles, in %, to 1 decimal.

```task
{"id": "w09d3-p9", "kind": "python", "starter": "dec = pd.qcut(S[\"score\"].rank(method=\"first\"), 10, labels=False)\ngains = S.groupby(dec)[\"bad\"].sum().cumsum() / S[\"bad\"].sum()\n# print the gains in %\n", "answer": 41.7, "dp": 1, "model": "dec = pd.qcut(S[\"score\"].rank(method=\"first\"), 10, labels=False)\ngains = S.groupby(dec)[\"bad\"].sum().cumsum() / S[\"bad\"].sum()\nprint((100 * gains).round(1).tolist())\n# [25.1, 41.7, 58.7, 70.0, 75.3, ...] — the worst two deciles hold 41.7 %"}
```

<details><summary>Answer</summary>

```python
dec = pd.qcut(S["score"].rank(method="first"), 10, labels=False)
gains = S.groupby(dec)["bad"].sum().cumsum() / S["bad"].sum()
print((100 * gains).round(1).tolist())
```
The worst two deciles hold **41.7 %** of the bads (lift 2.08). `rank(method="first")` breaks ties in row order, as `loan_id` did in the SQL, so both give the same deciles.

</details>

**P10.** *(AUC in SQL)* Take the SQL of "AUC and KS in SQL" and group by the **six bands** of the first subsection instead of the score. What AUC does the band table give, to 3 decimals?

```task
{"id": "w09d3-p10", "kind": "number", "answer": 0.673, "dp": 3, "hint": "Replace a.credit_score in SELECT and GROUP BY by the band number (1 … 6) and order the windows by it.", "model": "0.673 (Gini 0.347): inside a band every good–bad pair counts as a tie, so the six bands rank less well than the 427 scores — and less well than the four grades (0.396), whose edges fall where the bad rate jumps."}
```

<details><summary>Answer</summary>

```sql
WITH s AS (
  SELECT CASE WHEN a.credit_score < 560 THEN 1 WHEN a.credit_score < 600 THEN 2
              WHEN a.credit_score < 640 THEN 3 WHEN a.credit_score < 680 THEN 4
              WHEN a.credit_score < 720 THEN 5 ELSE 6 END AS band,
         SUM(l.status IN ('default', 'written_off')) AS bads,
         SUM(l.status NOT IN ('default', 'written_off')) AS goods
  FROM loans l JOIN applications a ON a.application_id = l.application_id
  WHERE a.credit_score IS NOT NULL
  GROUP BY band),
c AS (SELECT band, bads, goods, SUM(bads) OVER (ORDER BY band) - bads AS bads_below FROM s)
SELECT ROUND(SUM(goods * (bads_below + 0.5 * bads))
             / ((SELECT SUM(goods) FROM s) * (SELECT SUM(bads) FROM s)), 3) AS auc
FROM c;
```
**0.673** — Gini 0.347. Banding throws ranking away, unless the edges sit exactly where the risk changes: the four grades (0.396) beat both the six bands and the raw score.

</details>

**P11.** *(score or grade)* The grade has only four values. What share of all good–bad pairs are **ties** on the grade (same grade), in %, to 1 decimal?

```task
{"id": "w09d3-p11", "kind": "python", "starter": "g = S[\"risk_grade\"].map({\"A\": 4, \"B\": 3, \"C\": 2, \"D\": 1}).to_numpy()\ngood, bad = g[y == 0], g[y == 1]\n# the share of pairs with the same grade\n", "answer": 28.2, "dp": 1, "model": "g = S[\"risk_grade\"].map({\"A\": 4, \"B\": 3, \"C\": 2, \"D\": 1}).to_numpy()\ngood, bad = g[y == 0], g[y == 1]\nprint(round(100 * (good[:, None] == bad[None, :]).mean(), 1))\n# 28.2 — more than a quarter of the pairs are ties, each worth half"}
```

<details><summary>Answer</summary>

```python
g = S["risk_grade"].map({"A": 4, "B": 3, "C": 2, "D": 1}).to_numpy()
good, bad = g[y == 0], g[y == 1]
print(round(100 * (good[:, None] == bad[None, :]).mean(), 1))
```
**28.2 %** of the pairs share a grade and count as half. The score has only 0.5 % ties — yet the grade still wins on Gini, because the pairs the score *does* separate inside a grade it often gets wrong.

</details>

**P12.** *(out-of-time validation)* Bootstrap the **difference** Gini(2024) − Gini(2025–26): 1 000 resamples of each group with `np.random.default_rng(2026)`. What share of the differences is 0 or less, in %, to 1 decimal?

```task
{"id": "w09d3-p12", "kind": "python", "starter": "rng = np.random.default_rng(2026)\na, b = S[yr == \"2024\"], S[yr != \"2024\"]\ns1, y1 = a[\"score\"].to_numpy(), a[\"bad\"].to_numpy()\ns2, y2 = b[\"score\"].to_numpy(), b[\"bad\"].to_numpy()\ndiffs = []\nfor _ in range(1000):\n    i = rng.integers(0, len(s1), len(s1))\n    j = rng.integers(0, len(s2), len(s2))\n    # TODO: append gini_of(...) - gini_of(...)\n", "answer": 25.2, "dp": 1, "model": "rng = np.random.default_rng(2026)\na, b = S[yr == \"2024\"], S[yr != \"2024\"]\ns1, y1 = a[\"score\"].to_numpy(), a[\"bad\"].to_numpy()\ns2, y2 = b[\"score\"].to_numpy(), b[\"bad\"].to_numpy()\ndiffs = []\nfor _ in range(1000):\n    i = rng.integers(0, len(s1), len(s1))\n    j = rng.integers(0, len(s2), len(s2))\n    diffs.append(gini_of(s1[i], y1[i]) - gini_of(s2[j], y2[j]))\nd = np.array(diffs)\nprint(round(100 * (d <= 0).mean(), 1), np.percentile(d, [2.5, 97.5]).round(2))\n# 25.2 [-0.11  0.2 ]"}
```

<details><summary>Answer</summary>

```python
rng = np.random.default_rng(2026)
a, b = S[yr == "2024"], S[yr != "2024"]
s1, y1 = a["score"].to_numpy(), a["bad"].to_numpy()
s2, y2 = b["score"].to_numpy(), b["bad"].to_numpy()
diffs = []
for _ in range(1000):
    i = rng.integers(0, len(s1), len(s1))
    j = rng.integers(0, len(s2), len(s2))
    diffs.append(gini_of(s1[i], y1[i]) - gini_of(s2[j], y2[j]))
d = np.array(diffs)
# 25.2 [-0.11  0.2 ]
print(round(100 * (d <= 0).mean(), 1), np.percentile(d, [2.5, 97.5]).round(2))
```
In **25.2 %** of the resamples the newer loans rank as well or better; the 95 % interval of the fall, −0.11 to 0.20, holds zero. The fall of 0.05 is not evidence yet — the monthly view (Day 4) keeps watching.

</details>

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

This homework is reviewed by the mentor: (a) the six assert cells pass after *Restart & Run All*, (b) every function has a docstring in your words, (c) the two tables are printed, (d) the five sentences give the Gini, the KS with its score, the weakest product, the out-of-time picture and one recommendation.

**Check your results here before you hand in:**

**H1.** In your table by product, what is the Gini of the score for **MICRO** loans, to 3 decimals?

```task
{"id": "w09d3-hw1", "kind": "number", "answer": 0.419, "dp": 3, "hint": "validation_table(S, \"product\") — the MICRO row; Gini = 2 × AUC − 1 on that product's scored loans only.", "model": "0.419 on 2 598 Micro loans with 73 bads — above the book's 0.377."}
```

**H2.** Which product has the **lowest** Gini?

```task
{"id": "w09d3-hw2", "kind": "choice", "options": ["AUTO", "BNPL", "CONS", "MICRO", "SME"], "answer": 4, "explain": "SME: 0.298 on 756 loans with 27 bads. Its big loans are judged on much more than an application score — and 27 bads make any Gini shaky."}
```

**H3.** In your table by year, what is the Gini of the loans disbursed in **2025**, to 3 decimals?

```task
{"id": "w09d3-hw3", "kind": "number", "answer": 0.396, "dp": 3, "hint": "validation_table(S.assign(year=S.disbursed_at.str[:4]), \"year\") — the 2025 row.", "model": "0.396 on 2 956 loans with 124 bads. 2026's loans are too young to say much: 31 bads so far."}
```

**H4.** Your five sentences for Nilufar (the last cell of the notebook) — write them here too.

```task
{"id": "w09d3-hw4", "kind": "free", "min": 50, "model": "The application score still ranks risk: Gini 0.377 (AUC 0.689) on 7 615 scored loans and KS 0.34 at a score of 658, below the 0.4–0.6 usual for an application scorecard. It ranks best for Auto and Micro and worst for SME (Gini 0.30, only 27 bads). By year the Gini moves from 0.41 (2024) to 0.40 (2025) and 0.29 (2026), but the 2026 loans are young and have only 31 bads, so that last number is not evidence yet. The worst tenth of scores holds a quarter of all bads. I recommend keeping the score, adding its Gini and the population stability to the monthly pack, and opening a rebuild review against the grade bands.", "rubric": ["gives the Gini (or AUC) and the KS with its score", "names the weakest product with its number", "describes the out-of-time picture and says why 2026 is uncertain", "ends with one recommendation"]}
```

### 📎 Hand in here

```sqltask
{"check": "handin-W9D3", "lesson": "W9D3", "title": "HW 9.3", "why": "Nilufar takes this pack to the risk committee: one table by product and one by year tell her where the scorecard still works and where it does not.", "graded": ["the six assert cells pass after Restart & Run All", "every function has a docstring in your words", "the tables by product and by year are printed", "the five sentences give the Gini and KS, the weakest product, the out-of-time picture and a recommendation"], "tasks": [{"id": "day3_starter.ipynb", "file": "day3_starter.ipynb", "names": ["day3_starter.ipynb"], "upload": true, "accept": ".ipynb", "q": "Attach `day3_starter.ipynb` — executed, with the outputs."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else (the ROC chart as a picture, a .zip of several files)."}]}
```

---

## 5. Self-check

Three questions, one at a time. Wrong? The explanation points to the part of section 1 to reread.

```check
{"id": "w09d3-sc", "questions": [
  {"type": "single", "q": "A cut-off declines 94 of 223 bads and 1 593 of 7 392 goods. What are the TPR and the FPR?", "options": ["TPR 42.2 %, FPR 21.6 %", "TPR 5.6 %, FPR 94.4 %", "TPR 77.4 %, FPR 22.6 %", "TPR 21.6 %, FPR 42.2 %"], "answer": 0, "explain": "TPR = 94 / 223 (of the bads), FPR = 1 593 / 7 392 (of the goods): each rate has its own group as denominator (→ section 1, 'TPR and FPR')."},
  {"type": "number", "q": "A scorecard has an AUC of 0.81. What is its Gini?", "answer": 0.62, "tol": 0.005, "explain": "2 × 0.81 − 1 = 0.62 (→ section 1, 'Gini')."},
  {"type": "single", "q": "The KS of 0.34 is reached at 658. What does that say?", "options": ["34 % of loans score below 658", "At 658, 65.9 % of the bads and 32.0 % of the goods score at or below it — the widest gap between the two groups", "The best cut-off in money is 658", "34 % of the bads are caught at every cut-off"], "answer": 1, "explain": "KS is the largest distance between the cumulative curves; whether 658 is a good cut-off in soum is Day 4's question (→ section 1, 'KS')."}
]}
```

---

## 6. Company corner <span class="badge company">Who validates a scorecard</span>

A bank does not let the people who built a model be the only ones to judge it. **Model validation** (*валидация моделей*) is an independent check, repeated at least once a year and whenever something big changes. A validator asks three questions, in this order:

- **Does it rank?** — discrimination: Gini, KS, the ROC curve, in time and out of time, by segment (today).
- **Does it predict the right level?** — calibration: predicted PD against the actual bad rate per band (Day 2).
- **Is it stable?** — the population it scores today against the one it was built on: PSI and CSI (Day 4).

The answers go into a **validation report** with a traffic light for each test and an owner for each finding. Typical findings: a Gini that fell by more than an agreed margin, a segment where the score does not work (our SME), a population shift, overrides that ignore the score. A red light can mean recalibrating (shift the PD levels), redeveloping (a new scorecard) or restricting the score's use to the segments where it still works.

In larger banks this is formal **model risk management**: a register of every model, its owner, its last validation date and its limits. Lenders that use internal models for regulatory capital (the Basel IRB approach) must show regulators this cycle; a lender like Nur needs it for itself, because a cut-off on a broken score approves the wrong people quietly.

Match the validator's question to the test:

```game
{"type": "match", "id": "w09d3-g4", "title": "The validator's three questions", "pairs": [["Does it rank?", "Gini, KS, ROC — in and out of time"], ["Does it predict the right level?", "predicted PD vs actual bad rate per band"], ["Is it stable?", "PSI on the score, CSI on each characteristic"], ["Does it work for everyone?", "the same tests by product, channel or region"], ["Is it used as designed?", "the override rate and the reasons given"]]}
```

> 🎯 **Interview version.** *"How do you evaluate a credit scorecard?"* — Three questions: does it rank (Gini or AUC, KS, the ROC curve, out of time and by segment), does it predict the right level (calibration by band), is it stable (PSI). Never accuracy: with 3 % bads it rewards approving everyone. Give numbers: "on our application score, Gini 0.38 and KS 0.34 at 658 — below the usual 0.4–0.6, with no clear fall out of time".

**Say it like in an interview.** *"How would you check whether our two-year-old scorecard still works?"* — answer in 3–5 sentences.

```task
{"id": "w09d3-cc", "kind": "free", "min": 40, "model": "I would measure how well it ranks on the loans made since it was built: the Gini (or AUC) and the KS, on the same definition of bad, with a bootstrap interval because bads are few. I would compare that with the build sample and split it by product and by year, since a score can hold overall and fail in one segment. I would check calibration — predicted against actual bad rate per band — and stability, with the PSI of today's applicants against the build period. I would not use accuracy: with 3 % bads it rewards approving everyone. On our book the score still ranks, Gini 0.38, KS 0.34 at 658, below the usual 0.4–0.6.", "rubric": ["names the ranking tests (Gini or AUC, KS) on loans after the build", "splits by segment or by time, with uncertainty", "mentions calibration and stability (PSI)", "rules out accuracy and gives a number"]}
```

Tomorrow: the score ranks — so where should the line go? The cut-off in soum, with W8D2's unit economics, and the monthly view that tells Nilufar when the population has moved (PSI).

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w09d3", "pass": 0.8, "questions": [
  {"type": "single", "q": "Only 2.93 % of Nur's scored loans are bad. Why is accuracy a poor way to judge the scorecard?", "options": ["Approving everyone is already 97.07 % accurate, while catching no bad at all", "Accuracy cannot be computed for scores", "Accuracy is always below 50 %", "Accuracy needs a perfect scorecard"], "answer": 0, "explain": "The big class dominates: 'every loan is good' is right 7 392 times in 7 615. Use TPR and FPR at a cut-off, AUC or Gini for the ranking (→ section 1, 'Accuracy')."},
  {"type": "single", "q": "At a cut-off, the score declines 37 bads (of 223) and 294 goods (of 7 392). Which point is that on the ROC curve?", "options": ["(16.6 %, 4.0 %)", "(4.0 %, 16.6 %)", "(11.2 %, 88.8 %)", "(37, 294)"], "answer": 1, "explain": "The ROC curve plots (FPR, TPR): FPR = 294 / 7 392 = 4.0 %, TPR = 37 / 223 = 16.6 % (→ section 1, 'The ROC curve')."},
  {"type": "single", "q": "What does an AUC of 0.5 mean?", "options": ["Half the loans are approved", "The score ranks no better than a coin toss — its ROC curve is the diagonal", "Half the bads are caught", "The Gini is 0.5"], "answer": 1, "explain": "A random good outscores a random bad half the time; Gini = 2 × 0.5 − 1 = 0 (→ section 1, 'AUC', 'Gini')."},
  {"type": "number", "q": "Our score's AUC is 0.689. What is its Gini, to 3 decimals?", "answer": 0.377, "tol": 0.0015, "explain": "2 × 0.689 − 1 = 0.377 — below the 0.4–0.6 usual for an application scorecard (→ section 1, 'Gini')."},
  {"type": "single", "q": "What does this print for our loans (a high score means a good loan)?", "code": "from sklearn.metrics import roc_auc_score\nroc_auc_score(y, s)", "options": ["0.689", "0.311 — the AUC of the score read backwards", "0.377", "An error"], "answer": 1, "explain": "roc_auc_score expects a higher value for the positive class (bad). Pass -s to get 0.689 (→ section 1, 'AUC')."},
  {"type": "single", "q": "KS is the…", "options": ["Area under the ROC curve", "Widest gap between the cumulative shares of bads and goods, max(TPR − FPR)", "Bad rate of the worst decile", "Share of correct decisions"], "answer": 1, "explain": "Ours: 0.34 at 658, where 65.9 % of bads and 32.0 % of goods score at or below (→ section 1, 'KS')."},
  {"type": "number", "q": "The worst 10 % of scores hold 25.1 % of the bads. What is their lift, to 2 decimals?", "answer": 2.51, "tol": 0.005, "explain": "Gain ÷ share of loans = 25.1 / 10 = 2.51: their bad rate is two and a half times the average (→ section 1, 'Lift and gains')."},
  {"type": "single", "q": "2024 loans: Gini 0.415 (95 % interval 0.28–0.54). 2025–26 loans: 0.365 (0.28–0.45). What is the fair reading?", "options": ["The score has failed and must be replaced", "Lower on the new loans, but well within noise: keep monitoring", "The new loans are safer", "The intervals prove there is no change at all"], "answer": 1, "explain": "Overlapping intervals are no proof of a fall — and no proof of 'no change' either: the honest word is 'watch' (→ section 1, 'Out-of-time validation')."},
  {"type": "single", "q": "Company corner: a validator's three questions, in order, are…", "options": ["Accuracy, precision, recall", "Does it rank, does it predict the right level, is it stable", "Gini, Gini by product, Gini by year", "Who built it, when, with what tool"], "answer": 1, "explain": "Discrimination (Gini, KS), calibration (predicted vs actual by band), stability (PSI) (→ Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak.

```challenge
{"id": "w09d3", "q": "Section 1 said that inside a grade a higher score does not mean fewer bads. Measure it: among the scored loans of grade C only (scores 600–659; bad = default or written_off), what is the Gini of the credit score, with a tie counted half? Give it to 3 decimals — the sign matters.", "type": "number", "dp": 3, "python": true, "h": ["4f81ecb6618ddff1a744a8ad"], "hint": "Filter S to risk_grade == \"C\" first, then 2 × AUC − 1 from the ranks, as in 'AUC — the chance a good outscores a bad'.", "sol": "YyA9IFNbUy5yaXNrX2dyYWRlID09ICJDIl0KeCwgYiA9IGNbInNjb3JlIl0udG9fbnVtcHkoKSwgY1siYmFkIl0udG9fbnVtcHkoKQpyID0gc3RhdHMucmFua2RhdGEoeCkKbmcsIG5iID0gKGIgPT0gMCkuc3VtKCksIGIuc3VtKCkKYXVjID0gKHJbYiA9PSAwXS5zdW0oKSAtIG5nICogKG5nICsgMSkgLyAyKSAvIChuZyAqIG5iKQpwcmludChsZW4oYyksIG5iLCByb3VuZCgyICogYXVjIC0gMSwgMykpICAgICAjIDIyMDggMTEwIC0wLjA3NAoK4oiSMC4wNzQ6IGluc2lkZSBncmFkZSBDIHRoZSBzY29yZSByYW5rcyBzbGlnaHRseSB0aGUgd3Jvbmcgd2F5IOKAlCBhIHJhbmRvbSBnb29kIEMgbG9hbiBzY29yZXMgYWJvdmUgYSByYW5kb20gYmFkIG9uZSBvbmx5IDQ2ICUgb2YgdGhlIHRpbWUuIEdyYWRlIEIgZ2l2ZXMg4oiSMC4wOTAuIEFsbCB0aGUgc2NvcmUncyByYW5raW5nIGNvbWVzIGZyb20gd2hpY2ggZ3JhZGUgYSBsb2FuIGZhbGxzIGluLCB3aGljaCBpcyB3aHkgdGhlIGZvdXIgZ3JhZGVzIChHaW5pIDAuMzk2KSBiZWF0IHRoZSA0Mjcgc2NvcmUgdmFsdWVzICgwLjM3NykuClRoZSB0cmFwczogY29tcHV0aW5nIGl0IG9uIGFsbCBsb2FucyAoMC4zNzcpLCBvciBkcm9wcGluZyB0aGUgc2lnbiBhbmQgcmVwb3J0aW5nIDAuMDc0Lg=="}
```

<!-- challenge:end -->
