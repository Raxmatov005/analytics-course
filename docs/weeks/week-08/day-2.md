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

**What it is.** **Revenue per loan** is what the borrower (or a partner) pays Nur for the loan: **interest** over the schedule plus any **fees**. The principal is not revenue — it is Nur's own money coming back.

**How to write it.**

```sql
SELECT p.code, p.annual_rate,
       COUNT(*)                     AS loans,
       ROUND(AVG(l.principal))      AS avg_principal,
       ROUND(AVG(s.interest))       AS interest_per_loan,                       -- revenue: interest over the schedule
       ROUND(1000.0 * AVG(s.interest) / AVG(l.principal), 1) AS interest_per_1000_lent
FROM loans l
JOIN products p ON p.product_id = l.product_id
JOIN (SELECT loan_id, SUM(interest_due) AS interest                            -- one row per loan
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

```task
{"id": "w08d2-l1", "kind": "number", "answer": 211.5, "dp": 1, "unit": "soum per 1 000", "hint": "Read the CONS row of the query above.", "model": "5 695 580 ÷ 26 926 915 × 1 000 = 211.5 soum of interest for every 1 000 soum lent — about twice Micro's 98.6, because a Consumer loan is outstanding for 15 months instead of 4.5."}
```

### Cost of funds — paying for the money

**What it is.** **Cost of funds** (*стоимость фондирования*) is what Nur pays its own lenders for the money while it is out with the borrower. It is charged on the **balance still owed**, which falls with every instalment. Our assumption: **18 % a year**, 1.5 % a month.

**How to write it.**

```text
cost of funds per loan = Σ over instalments (balance owed before instalment k) × 0.18 ÷ 12
balance before k        = principal − principal repaid in instalments 1 … k−1
```

```sql
WITH sched AS (                                              -- each instalment with the balance owed before it
  SELECT i.loan_id,
         l.principal - COALESCE(SUM(i.principal_due) OVER (PARTITION BY i.loan_id ORDER BY i.installment_no
                       ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 0) AS bal_before,
         i.interest_due
  FROM installments i JOIN loans l ON l.loan_id = i.loan_id),
per_loan AS (
  SELECT loan_id, SUM(bal_before) AS bal_months, SUM(interest_due) AS interest
  FROM sched GROUP BY loan_id)
SELECT p.code,
       ROUND(AVG(pl.bal_months) * 0.18 / 12)                         AS cost_of_funds,     -- 1.5 % a month on the balance
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

```task
{"id": "w08d2-l2", "kind": "number", "answer": 152379, "dp": 0, "unit": "soum", "hint": "Cost of funds is a straight line in the rate: × 24 ÷ 18.", "model": "114 284 × 24 ÷ 18 = 152 379 soum. The balance-months do not change; only the price of each soum-month does."}
```

### Cost of risk — expected loss = PD × LGD × EAD

**What it is.** The **cost of risk** of a loan is its **expected loss** (*ожидаемый убыток*, EL): the loss you expect on average, priced in before anyone defaults. Three plain-word parts: **PD** — how likely the borrower stops paying; **LGD** — what share of the debt is lost if they do; **EAD** — how much they still owe when they stop.

**How to write it.**

```python
# EL = PD × LGD × EAD — an average Consumer loan
pd_cons   = 77 / 2418                # PD: 77 of 2 418 Consumer loans are now 90+ days past due (week 6's crude PD)
lgd       = 0.60                     # LGD: 60 % of what is owed is lost (our assumption)
ead_cons  = 21_630_783              # EAD: Consumer loans in 90+ still owed 80.33 % of the 26 926 915 principal when they stopped
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

```task
{"id": "w08d2-l3", "kind": "number", "answer": 30387, "dp": 0, "unit": "soum", "tol": 50, "hint": "0.0285 × 0.60 × 1 777 000.", "model": "0.0285 × 0.60 × 1 777 000 = 30 387 soum — about 30 000 of expected loss on an average Micro loan (the exact figure in P2 is 30 360)."}
```

### Operating cost per loan — selling it and servicing it

**What it is.** **Operating cost per loan** is what it costs to **acquire** the loan (marketing, the officer's time, the bureau check, the partner's commission) plus what it costs to **service** it each month (statements, SMS, payment processing, IT). Neither is in our data: they are assumptions you write under the table.

**How to write it.**

```sql
SELECT p.code, p.channel,
       ROUND(AVG(l.term_months), 2)                                         AS avg_term,
       CASE p.channel WHEN 'app' THEN 60000 WHEN 'branch' THEN 450000 ELSE 100000 END AS acquisition,  -- ours
       CASE p.channel WHEN 'app' THEN 8000  WHEN 'branch' THEN 25000  ELSE 8000   END AS servicing_month, -- ours
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

```task
{"id": "w08d2-l4", "kind": "number", "answer": 750000, "dp": 0, "unit": "soum", "hint": "450 000 + 25 000 × 12.", "model": "450 000 to sell it + 25 000 × 12 months to service it = 750 000 soum."}
```

### Contribution margin per loan — what one loan leaves behind

**What it is.** The **contribution** (*маржинальный доход*) of a loan is revenue minus every cost the loan itself causes: funding, expected loss, acquisition and servicing. **Contribution margin** is that contribution as a share of revenue. It is before overheads (head office, rent), tax and capital.

**How to write it.**

```python
# an average Consumer loan, every line from the subsections above
interest, pd_c, cof = 5_695_580, 77 / 2418, 3_417_348
el, acq, serv       = 413_293, 450_000, 25_000 * 14.933
income = (1 - pd_c) * interest                    # a defaulting loan pays no interest
net    = income - cof - el - acq - serv           # contribution per loan
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

```game
{"type": "cloze", "id": "w08d2-g1", "title": "Net contribution of one loan", "text": "net = (1 − {{0}}) × interest − {{1}} − PD × {{2}} × EAD − {{3}} − servicing", "code": false, "blanks": [["PD"], ["cost of funds"], ["LGD"], ["acquisition"]], "distractors": ["FPD", "principal", "approval rate", "CAC ÷ LTV"]}
```

### Break-even — the value at which a loan stops paying

**What it is.** A **break-even** is the value of one input at which the contribution is exactly zero, with every other input held. Above it (or below it) the loan loses money. It turns a guess into a guardrail: "we are fine while PD stays under X".

**How to write it.** Set net = 0 and solve for the input. For PD:

```text
net(PD) = (1 − PD) × I − CoF − PD × LGD × EAD − acq − serv = 0
PD*     = (I − CoF − acq − serv) ÷ (I + LGD × EAD)
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

```task
{"id": "w08d2-l5", "kind": "choice", "options": ["About 1 %", "About 11 %", "About 45 %", "No fee can — BNPL has no interest"], "answer": 1, "explain": "The fee must cover the loss: 449 053 ÷ 4 170 880 = 10.8 % of principal. P5 asks what it means for the partner contracts."}
```

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

```task
{"id": "w08d2-l6", "kind": "choice", "options": ["PD, one point up", "The funding rate, four points up", "LGD, ten points up", "Acquisition, half as much again"], "answer": 1, "explain": "−759 411 from four points of funding, against −186 740 for a point of PD and −68 882 for ten points of LGD. A lender's ranking of products is a statement about its funding cost (P7)."}
```

### CAC and payback — winning a new borrower

**What it is.** **CAC** (*customer acquisition cost*, стоимость привлечения клиента) is what it costs to win one **new** borrower. **Payback** is the number of months of contribution needed to earn the CAC back. Here CAC is the acquisition cost of the first loan: app 60 000, branch 450 000, partner 100 000 soum.

**How to write it.**

```text
payback (months) = CAC ÷ (contribution before acquisition ÷ term in months)
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

**Your turn.** A Consumer loan sold through the app instead (CAC 60 000), same 87 741 a month. Payback in months?

```task
{"id": "w08d2-l7", "kind": "number", "answer": 0.7, "dp": 1, "unit": "months", "hint": "60 000 ÷ 87 741.", "model": "60 000 ÷ 87 741 = 0.7 months — the channel, not the product, decides most of the payback."}
```

### LTV and LTV/CAC — what a customer is worth

**What it is.** **LTV** (*lifetime value*, пожизненная ценность клиента) is the contribution a customer brings over a fixed **horizon**: the first loan and every repeat, each repeat cheaper to sell because the customer is known. **LTV ÷ CAC** above 1 means acquiring the customer pays for itself; product teams like 3 or more.

**How to write it.** Count the loans each new customer took within the horizon, then price them:

```sql
WITH ranked AS (
  SELECT l.customer_id, l.disbursed_at, p.code,
         ROW_NUMBER() OVER (PARTITION BY l.customer_id ORDER BY l.disbursed_at, l.loan_id) AS n
  FROM loans l JOIN products p ON p.product_id = l.product_id),
firsts AS (                                                   -- new app customers with 12 observable months
  SELECT customer_id, disbursed_at AS first_at FROM ranked
  WHERE n = 1 AND code = 'MICRO' AND disbursed_at < '2025-10-01')
SELECT COUNT(DISTINCT f.customer_id) AS customers,
       COUNT(*)                      AS micro_loans_in_12m
FROM firsts f
JOIN ranked r ON r.customer_id = f.customer_id AND r.code = 'MICRO'
             AND r.disbursed_at <= date(f.first_at, '+12 months');
```

```python
customers, loans = 903, 1069                       # from the query above
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

```task
{"id": "w08d2-l8", "kind": "number", "answer": 1.11, "dp": 2, "hint": "89 171 ÷ 80 000.", "model": "89 171 ÷ 80 000 = 1.11 — still above 1, but with almost no room: a few points of extra FPD would turn it below."}
```

### The one-page P&L of a product

**What it is.** A **product P&L** (*отчёт о прибылях и убытках продукта*) puts the per-loan lines on one page, multiplied by the volume: revenue, minus funding, risk and operating costs, equals the product's contribution for the period. Every assumption sits in a footnote on the same page.

**How to write it.**

```python
loans_2026 = 1045                                    # Micro loans disbursed January–September 2026
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

| Micro, Jan–Sep 2026 (1 045 loans) | m soum |
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

```task
{"id": "w08d2-l9", "kind": "number", "answer": 2.61, "dp": 2, "unit": "bn soum", "hint": "165 × 15 813 021.", "model": "165 × 15 813 021 = 2 609 148 465 soum = 2.61 bn — 135 times Micro's 19.3 m from a sixth of the loans."}
```

### Telling it — the answer first

**What it is.** The **pyramid principle** (*принцип пирамиды*, Barbara Minto) puts the **answer** at the top, then the 2–4 **reasons**, then the **evidence** for each. A **so-what title** is a slide title written as the sentence the reader should conclude.

**How to write it.**

```text
answer      Grow SME and Auto; renegotiate BNPL's merchant fee or slow it.
reasons     SME and Auto earn 60–73 soum per 1 000 lent; BNPL loses 108.
            A new Micro customer pays back the acquisition on the first loan.
evidence    the per-product table, the sensitivity, the LTV — one chart each
assumptions funding 18 %, LGD 60 %, acquisition and servicing per channel (ours)
```

Four rules: the answer in the first sentence; titles that are sentences with a number (not *"Unit economics by product"* but *"SME and Auto earn 60–73 soum per 1 000 lent; BNPL loses 108"*); one chart per message; numbers rounded to what matters, with units, the decision in bold.

**When you use it.** Every result you hand over — a slide, a memo, a message to Bekzod. The 10-slide analytical deck: title · executive summary · context · 4–5 findings, one each · recommendations · risks and next steps · appendix (never presented).

> ⚠️ **Watch out.** The method before the answer ("first we loaded seven tables…") spends the executive's attention before you reach the recommendation. The method goes to the appendix.

**Your turn.**

```game
{"type": "bug", "id": "w08d2-g2", "title": "Find the line that breaks the pyramid", "q": "Your executive summary for Bekzod. One line does not belong where it is.", "code": "Grow SME and Auto; renegotiate BNPL's merchant fee or slow it.\nSME and Auto earn 60–73 soum per 1 000 lent; BNPL loses 108.\nFirst we loaded seven tables, cleaned the payments and joined the schedules.\nMicro earns 7 per 1 000, but a new app customer pays back the acquisition on the first loan.\nAssumptions: funding 18 %, LGD 60 %, acquisition and servicing costs per channel (ours).", "answer": [2], "why": "The method is not a reason and does not belong in the summary: answer, reasons with numbers, assumptions — the 'how we did it' goes to the appendix."}
```

```game
{"type": "order", "id": "w08d2-g3", "title": "The analytical deck, in order", "q": "Put the parts of the 10-slide deck in order.", "items": ["Title: the question, your name, as-of date, source", "Executive summary: the answer in 3 bullets + the decision", "Context: the 3–4 numbers everyone needs", "Findings: one so-what title and one chart each", "Recommendations: what, who, by when, worth", "Risks, assumptions, next steps", "Appendix: definitions and method — never presented"], "why": "The answer comes second, right after the title; the method comes last, in the appendix, for questions."}
```

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

```game
{"id": "w08d2-g5", "type": "sort", "title": "Which concept?", "groups": {"Cost of funds": ["Why does Auto keep only a quarter of its interest?"], "Cost of risk": ["What does a 3 % default rate cost per loan?"], "Contribution margin": ["Which product leaves the most per 1 000 lent?"], "Break-even": ["What merchant fee would make BNPL pay?"], "Sensitivity": ["Which of our guesses matters most?"], "CAC and payback": ["How fast does a new app customer earn back the marketing?"], "LTV and LTV/CAC": ["Is a new Micro customer worth more than they cost over a year?"]}}
```

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Answer first, one focal point, never a single number — [7 Effective Tips for Presenting Data at Work! (Jeff Su), 00:45](https://youtu.be/jizZKNnx9wA?t=45&end=97)
- ▶ Structuring a narrative — [Storytelling with Data (Cole Nussbaumer Knaflic, Talks at Google), 22:19](https://youtu.be/8EMW7io4rSI?t=1339&end=1537)
- ▶ Presenting a story (from the data team's own webinar) — [How to turn data into stories (storytelling with data), 25:54](https://youtu.be/Hfx1X9WSGYQ?t=1554&end=2138)
- ▶ Unit economics (CAC, LTV/CAC, payback; the page's loan unit-economics section) (RU) — [Все продуктовые метрики за 15 минут (Аналитика без воды), 08:45](https://youtu.be/X4asNCIMBRg?t=525&end=609)

```videoquiz
{"video": "jizZKNnx9wA", "stops": [{"at": 60, "q": "What should the first thing you say about your data be?", "options": ["How you collected it", "The answer — the conclusion you want the audience to take away", "A list of every chart", "The data sources"], "answer": 1, "explain": "Answer first: the reader stops when they believe you, so give them the conclusion at once."}, {"at": 90, "q": "Why never show a single number on its own?", "options": ["It looks too simple", "Without a comparison (last year, target, the book) nobody knows whether it is good or bad", "Charts are always better", "Executives dislike numbers"], "answer": 1, "explain": "'72.9 per 1 000 lent' means little; 'ten times Micro' means a decision.", "back": 30}]}
```

```videoquiz
{"video": "8EMW7io4rSI", "stops": [{"at": 1400, "q": "What gives a data presentation its structure?", "options": ["The order in which the analysis was done", "A narrative: a beginning that sets the question, a middle with the evidence, an end with the call to action", "One chart per table in the notebook", "Alphabetical order of the topics"], "answer": 1, "explain": "The story runs from the question to the action — not from the first query to the last."}, {"at": 1510, "q": "What should every slide title do?", "options": ["Name the topic", "State the point the reader should take away", "Repeat the chart's axis labels", "Stay short at any cost, even without a message"], "answer": 1, "explain": "A so-what title: read the titles alone and you have the story.", "back": 60}]}
```

```videoquiz
{"video": "Hfx1X9WSGYQ", "stops": [{"at": 1700, "q": "Before you build the story, what must you know?", "options": ["Which chart type is newest", "Who the audience is and what you want them to do", "How many slides the template has", "The colour palette"], "answer": 1, "explain": "Audience and action first: Bekzod needs a number per product for the budget, not your method."}, {"at": 1900, "q": "Your analysis produced forty tables. What goes into the story?", "options": ["All forty, in an appendix order", "Only what supports the message — the rest goes to the appendix or is cut", "The ten largest tables", "Whatever looks most impressive"], "answer": 1, "explain": "Exploratory work is for you; explanatory work is for them."}, {"at": 2100, "q": "How do you end a data story?", "options": ["With 'Questions?'", "With the method", "With the call to action: what to decide, who owns it, what it is worth", "With a summary of the data sources"], "answer": 2, "explain": "The deck's slide 9: recommendations with an owner, a date and a value.", "back": 60}]}
```

```videoquiz
{"video": "X4asNCIMBRg", "stops": [{"at": 550, "q": "What is CAC?", "options": ["Revenue per customer", "What it costs to acquire one new customer", "The cost of funds", "Customer satisfaction"], "answer": 1, "explain": "For Nur: marketing, the officer's time, the bureau check, the partner's commission — app 60 000, branch 450 000 soum per loan (our assumption)."}, {"at": 595, "q": "LTV ÷ CAC above 1 means…", "options": ["Customers leave quickly", "Acquisition pays for itself over the horizon", "The product loses money on every loan", "Marketing spend should be cut"], "answer": 1, "explain": "A first Micro loan already pays back its 60 000 CAC; the repeats are the profit (P10).", "back": 40}]}
```

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
I   = inst["interest_due"].sum()                 # 10 650 293  interest over the schedule
cof = inst["bal_before"].sum() * 0.18 / 12       # 426 011 732 balance-months × 1.5 % = 6 390 176
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
COF, LGD = 0.18, 0.60                                           # funding rate per year · loss given default (ours)
ACQ  = {"app": 60_000, "branch": 450_000, "partner": 100_000}   # acquisition cost per loan, soum (ours)
SERV = {"app": 8_000, "branch": 25_000, "partner": 8_000}       # servicing cost per month of the schedule (ours)
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
print(len(ue), "loans")                      # 7828
ue.head()
```

**P1.** *(revenue per loan · cost of funds)* Per product: loans, average principal and term, interest over the schedule, cost of funds — and the cost of funds as a **share of the interest**. Which product's interest does funding eat most of? Finish the code and print that share in %.

```task
{"id": "w08d2-p1", "kind": "python", "starter": "g = ue.groupby(\"product\")\np1 = pd.DataFrame({\"loans\": g.size(),\n                   \"principal\": g[\"principal\"].mean(),\n                   \"term\": g[\"term\"].mean(),\n                   \"interest\": g[\"interest\"].mean(),\n                   \"cof\": g[\"bal_months\"].mean() * COF / 12})   # balance-months x 1.5 % a month\n# TODO: p1[\"cof_share_pct\"] = 100 x cost of funds / interest\n#       then print(p1.round(1))\n", "answer": 75.0, "dp": 1, "model": "AUTO 391 loans · 216 858 133 · 36.2 months · I 90 816 842 · CoF 68 112 632 · 75 %. BNPL 1 569 · 4 170 880 · 7.0 · 0 · 249 053 · — (no interest). CONS 2 418 · 26 926 915 · 14.9 · 5 695 580 · 3 417 348 · 60 %. MICRO 2 669 · 2 705 586 · 4.5 · 266 662 · 114 284 · 43 %. SME 781 · 308 728 745 · 24.3 · 92 835 258 · 64 270 563 · 69 %. AUTO's 24 % leaves only 6 points over the 18 % funding rate: three quarters of its interest goes to funding. BNPL charges the customer nothing — Nur pays for the money from the first day."}
```

**P2.** *(cost of risk)* Expected loss per loan: PD = the product's share of loans now 90+, the EAD ratio measured on each product's 90+ loans, EL = PD × 60 % × EAD ratio × average principal. Print AUTO's EL per loan in whole soum.

```task
{"id": "w08d2-p2", "kind": "python", "starter": "bad = ue[ue[\"dpd\"] > 90].copy()                       # loans now 90+ (week 6's crude PD)\nbad[\"ead_ratio\"] = bad[\"ead\"] / bad[\"principal\"]      # share of principal still owed at the first unpaid instalment\np2 = pd.DataFrame({\"bad\": bad.groupby(\"product\").size(),\n                   \"pd\": (ue[\"dpd\"] > 90).groupby(ue[\"product\"]).mean(),\n                   \"ead_ratio\": bad.groupby(\"product\")[\"ead_ratio\"].mean()})\nprint(p2.round(4))\n# TODO: p2[\"el\"] = p2[\"pd\"] x LGD x p2[\"ead_ratio\"] x p1[\"principal\"]\n#       then print(round(p2.loc[\"AUTO\", \"el\"]))\n", "answer": 3213904, "dp": 0, "model": "AUTO 10 / 391 = 2.56 % · EAD ratio 0.966 · EL 3 213 904. BNPL 42 / 1 569 = 2.68 % · 0.661 · 44 260. CONS 77 / 2 418 = 3.18 % · 0.803 · 413 293. MICRO 76 / 2 669 = 2.85 % · 0.657 · 30 360. SME 29 / 781 = 3.71 % · 0.792 · 5 447 028. AUTO borrowers who default stop almost at once (they still owe 97 % of the principal); short products default with a third already repaid. AUTO's ratio rests on 10 loans — a fragile number; say so."}
```

**P3.** *(operating cost per loan)* Acquisition plus servicing per loan, by product, and the same **per 1 000 soum lent**. Use `ACQ`, `SERV`, each product's channel and its average term. Print the per-1 000 figure for every product.

```task
{"id": "w08d2-p11", "kind": "python", "starter": "channel = ue.groupby(\"product\")[\"channel\"].first()          # one channel per product\nopex = pd.DataFrame({\"acq\": channel.map(ACQ),\n                     \"serv\": channel.map(SERV) * p1[\"term\"]})\n# TODO: opex[\"total\"] = acq + serv;  opex[\"per_1000\"] = total / p1[\"principal\"] x 1 000\n#       then print(opex.round(1))\n", "answer": 35.5, "dp": 1, "model": "opex[\"total\"] = opex[\"acq\"] + opex[\"serv\"]\nopex[\"per_1000\"] = opex[\"total\"] / p1[\"principal\"] * 1000\nprint(opex.round(1))\n# total per loan · per 1 000 lent: AUTO 1 354 604 · 6.2; BNPL 155 740 · 37.3; CONS 823 325 · 30.6; MICRO 95 996 · 35.5; SME 1 058 067 · 3.4.\n# Per loan the big branch products cost most; per soum lent the small ones do — Micro and BNPL spend 35–37 soum of every 1 000 on selling and servicing, SME 3.4."}
```

**P4.** *(contribution margin)* The full table: income, minus cost of funds, expected loss, acquisition and servicing = **net contribution per loan**, and **per 1 000 soum lent**. Print the net per 1 000 for every product.

```task
{"id": "w08d2-p3", "kind": "python", "starter": "p3 = p1[[\"principal\", \"term\", \"interest\", \"cof\"]].join(p2[[\"pd\", \"ead_ratio\"]])\nchannel = ue.groupby(\"product\")[\"channel\"].first()          # one channel per product\np3[\"income\"] = (1 - p3[\"pd\"]) * p3[\"interest\"]                # a defaulting loan pays no interest\np3[\"el\"] = p3[\"pd\"] * LGD * p3[\"ead_ratio\"] * p3[\"principal\"]\np3[\"acq\"] = channel.map(ACQ)\np3[\"serv\"] = channel.map(SERV) * p3[\"term\"]\n# TODO: p3[\"net\"] = income - cof - el - acq - serv\n#       p3[\"per_1000\"] = net / principal x 1 000\n#       then print(p3[[\"net\", \"per_1000\"]].round(1))\n", "answer": -107.7, "dp": 1, "model": "net per loan · per 1 000 lent: AUTO 15 813 021 · 72.9; BNPL −449 053 · −107.7; CONS 860 241 · 31.9; MICRO 18 430 · 6.8; SME 18 612 452 · 60.3. (Income AUTO 88 494 161, CONS 5 514 207, MICRO 259 069, SME 89 388 110; servicing AUTO 904 604, BNPL 55 740, CONS 373 325, MICRO 35 996, SME 608 067.) 2026 loans × net: AUTO 165 → 2.61 bn, BNPL 595 → −0.27 bn, CONS 941 → 0.81 bn, MICRO 1 045 → 0.02 bn, SME 305 → 5.68 bn."}
```

**P4 — read it.** Which product makes the most money **per loan**, and which **per soum lent**?

```task
{"id": "w08d2-p3b", "kind": "choice", "options": ["SME per loan and per soum", "SME per loan (18.6 m), AUTO per soum (72.9 per 1 000)", "AUTO per loan, CONS per soum", "MICRO per soum — it has the highest rate"], "answer": 1, "explain": "Per loan: SME (18.6 m) and AUTO (15.8 m). Per soum: AUTO (72.9), then SME (60.3), CONS (31.9); MICRO barely positive (6.8); BNPL loses 108 soum per 1 000 lent. SME alone is about 64 % of the five products' 2026 contribution (5.68 of 8.85 bn). The ranking of SME/AUTO/CONS above MICRO/BNPL survives any reasonable change of the cost figures; the exact numbers do not."}
```

**P5.** *(break-even)* BNPL charges the customer 0 %. Partners (shops) usually pay the lender a **merchant fee** for each sale financed; it is not in our data. What fee, as a percentage of principal, makes an average BNPL loan break even? (From P4: net −449 053 on an average principal of 4 170 880.)

```task
{"id": "w08d2-p4", "kind": "number", "answer": 10.8, "dp": 1, "unit": "% of principal", "hint": "The fee has to cover the loss: −net ÷ principal.", "model": "Fee* = 449 053 ÷ 4 170 880 = 10.8 % of principal. Below it, BNPL loses money on every loan; above it, it earns. The question goes to Finance / the partnerships team: \"What do our partner agreements pay per financed sale, and are they the same for 3, 6 and 12 months?\" (a 12-month BNPL costs four times the funding of a 3-month one). Until that answer exists, \"Nilufar wants less BNPL\" has no money behind it either way — say exactly that."}
```

**P6.** *(break-even · sensitivity)* Micro's sensitivity. Net per loan at PD 0, 1, 5, 8 %; then the **break-even PD** for a **first** Micro loan (acquisition 60 000) and for a **repeat** loan (acquisition 20 000: the bureau check and an SMS) with section 1's formula. Print the first-loan break-even PD in %.

```task
{"id": "w08d2-p5", "kind": "python", "starter": "m = p3.loc[\"MICRO\"]\nead_m = m[\"ead_ratio\"] * m[\"principal\"]            # EAD of an average Micro loan\n\ndef net_at(pd_, acq=ACQ[\"app\"]):                  # pd_, not pd: pd is pandas\n    return (1 - pd_) * m[\"interest\"] - m[\"cof\"] - pd_ * LGD * ead_m - acq - m[\"serv\"]\n\nfor x in (0, 0.01, m[\"pd\"], 0.05, 0.08):\n    print(f\"PD {x:.2%}: net per first loan {net_at(x):,.0f}\")\n# TODO: break-even PD = (I - CoF - acq - serv) / (I + LGD x EAD)\n#       for acq = 60 000 (first loan) and acq = 20 000 (repeat loan); print both in % to two decimals\n", "answer": 4.23, "dp": 2, "model": "Net per first loan: PD 0 % → 56 383; 1 % → 43 054; 2.85 % (today) → 18 430; 5 % → −10 260; 8 % → −50 246. A repeat loan earns 40 000 more at every PD. Break-even PD: first loan 4.23 %, repeat 7.23 %."}
```

**P6 — read it.** Risk watches FPD30 weekly, not PD. Today's Micro FPD30 is 41 of 2 411 = 1.70 %, and Micro's PD ÷ FPD = 2.85 ÷ 1.70 = 1.67. At what **FPD30** does a new Micro customer stop paying for itself? (%, one decimal)

```task
{"id": "w08d2-p5b", "kind": "number", "answer": 2.5, "dp": 1, "unit": "% FPD30", "hint": "Divide the first-loan break-even PD by Micro's PD ÷ FPD ratio.", "model": "4.23 % ÷ 1.67 = 2.53 % (repeat loan: 7.23 % → 4.32 %); with week 7's simplification (PD = FPD, EAD = principal) 2.98 % and 5.10 % — say which translation you used. Micro stops paying on a new customer if its FPD30 rises from 1.7 % to about 2.5 % — less than a point of headroom. That is the guardrail number for Kamola's next app experiment, and it is tighter than week 7's +1.25 points because funding and acquisition are now in."}
```

**P7.** *(sensitivity — the funding rate)* The funding rate is our guess. Net per 1 000 soum lent at 14 %, 18 % and 22 %. Which product is most exposed to the cost of money? Print AUTO's per 1 000 at 22 %.

```task
{"id": "w08d2-p6", "kind": "python", "starter": "for rate in (0.14, 0.18, 0.22):\n    cof_r = p3[\"cof\"] / COF * rate               # cost of funds is a straight line in the rate\n    # TODO: net at this rate = income - cof_r - el - acq - serv   (the columns of p3)\n    #       per 1 000 = net / principal x 1 000;  print(rate, per_1000.round(1).to_dict())\n", "answer": 3.1, "dp": 1, "model": "per 1 000 at 14 / 18 / 22 %: AUTO 142.7 / 72.9 / 3.1 · SME 106.5 / 60.3 / 14.0 · CONS 60.1 / 31.9 / 3.7 · MICRO 16.2 / 6.8 / −2.6 · BNPL −94.4 / −107.7 / −120.9. AUTO swings most: it is long (36 months) and priced closest to the funding rate. Per soum it is the best product at 18 % and nearly worthless at 22 %. A lender's product ranking is a statement about its funding cost — put the rate on the slide."}
```

**P8.** *(sensitivity — the PD)* The crude PD mixes young and old loans. Recompute PD on **matured** loans only (the last instalment due on or before 2026-10-01) and rerun net per 1 000. Keep AUTO's crude PD — 0 of 23 matured loans is too few to use. Print SME's new per 1 000.

```task
{"id": "w08d2-p7", "kind": "python", "starter": "matured = ue[ue[\"last_due\"] <= \"2026-10-01\"]\nbad_m = (matured[\"dpd\"] > 90).groupby(matured[\"product\"])\nprint(pd.DataFrame({\"bad\": bad_m.sum(), \"matured\": bad_m.size(), \"pd_pct\": (100 * bad_m.mean()).round(2)}))\npd7 = bad_m.mean()\npd7[\"AUTO\"] = p3.loc[\"AUTO\", \"pd\"]                 # too few matured AUTO loans\n# TODO: with pd7 instead of p3[\"pd\"], recompute income = (1 - pd7) x interest and el = pd7 x LGD x ead_ratio x principal,\n#       then net and per 1 000 (cof, acq, serv do not change); print the per 1 000 rounded to 1 decimal\n", "answer": 19.4, "dp": 1, "model": "Matured PD: SME 16 / 178 = 8.99 % (vs 3.71 %), CONS 38 / 1 020 = 3.73 %, MICRO 76 / 2 103 = 3.61 %, BNPL 36 / 1 095 = 3.29 %; AUTO 0 / 23. Net per 1 000: SME 19.4 (from 60.3), CONS 28.2, MICRO 3.0, BNPL −110.1, AUTO 72.9 (unchanged). Long products look safer than they are while most of their loans are young — a two-year SME loan disbursed in 2026 has not had time to default. SME's per-soum lead over CONS disappears at its matured PD; with ~180 matured loans the 9 % itself is uncertain (week 6: an interval, please). Slide line: \"SME's margin depends on a default rate we have not yet observed; read its 2024 vintage before growing it.\""}
```

**P9.** *(CAC and payback)* For each product: contribution **before** acquisition per month of the term, and the payback of the acquisition cost in months. Which product never pays back? Print every payback.

```task
{"id": "w08d2-p12", "kind": "python", "starter": "pb = p3[[\"net\", \"acq\", \"term\"]].copy()\npb[\"before_acq\"] = pb[\"net\"] + pb[\"acq\"]          # contribution before acquisition\n# TODO: pb[\"per_month\"] = before_acq / term;  pb[\"payback_months\"] = acq / per_month\n#       then print(pb.round(2))\n", "answer": 1.0, "dp": 1, "model": "pb[\"per_month\"] = pb[\"before_acq\"] / pb[\"term\"]\npb[\"payback_months\"] = pb[\"acq\"] / pb[\"per_month\"]\nprint(pb.round(2))\n# payback: SME 0.57, AUTO 1.00, MICRO 3.44, CONS 5.13 months; BNPL never — its contribution before acquisition is negative (−349 053), so there is nothing to pay the 100 000 back with.\n# Big loans pay back their 450 000 in a month; a Micro loan needs most of its 4.5-month term."}
```

**P10.** *(LTV and LTV/CAC)* LTV/CAC for an app customer. Take customers whose **first** loan was Micro and was disbursed before October 2024 (so 24 months are observable) and their loans within 24 months, by product. LTV = Σ contribution **before acquisition** of those loans, minus 20 000 per repeat loan, ÷ customers; CAC = 60 000. Print the Micro-only LTV/CAC.

```task
{"id": "w08d2-p8", "kind": "python", "starter": "q = \"\"\"\nWITH ranked AS (\n  SELECT l.customer_id, l.disbursed_at, p.code,\n         ROW_NUMBER() OVER (PARTITION BY l.customer_id ORDER BY l.disbursed_at, l.loan_id) AS n\n  FROM loans l JOIN products p ON p.product_id = l.product_id),\nfirsts AS (SELECT customer_id, disbursed_at AS first_at FROM ranked\n           WHERE n = 1 AND code = 'MICRO' AND disbursed_at < '2024-10-01')\nSELECT r.code AS product, COUNT(*) AS loans, COUNT(DISTINCT r.customer_id) AS customers\nFROM firsts f JOIN ranked r ON r.customer_id = f.customer_id AND r.disbursed_at <= date(f.first_at, '+24 months')\nGROUP BY r.code\"\"\"\nltv = pd.read_sql(q, con).set_index(\"product\")\ncustomers = ltv.loc[\"MICRO\", \"customers\"]           # every one of them has a first Micro loan\nltv[\"contrib\"] = p3[\"income\"] - p3[\"cof\"] - p3[\"el\"] - p3[\"serv\"]   # before acquisition\nprint(customers, \"customers\"); print(ltv)\n# TODO: Micro only: LTV = (Micro loans x Micro contrib - 20 000 x (Micro loans - customers)) / customers\n#       print LTV and LTV / 60 000 (two decimals)\n", "answer": 1.6, "dp": 1, "model": "344 customers, 665 loans in 24 months (1.93 each): 447 MICRO (1.30 each), 96 CONS, 74 BNPL, 32 SME, 16 AUTO. Contribution before acquisition: MICRO 78 430 per loan (net 18 430 + 60 000), CONS 1 310 241, BNPL −349 053, AUTO 16 263 021, SME 19 062 452. Micro only: LTV 95 925 soum, LTV/CAC = 1.6 — a first Micro loan already pays back its CAC (78 430 > 60 000); the repeats are the profit. All products: LTV 2 903 483, LTV/CAC ≈ 48 — but about 87 % of it comes from 48 SME and AUTO loans among 344 customers. Report it as \"Micro customers who later take a branch loan are very valuable\", not as an average every app customer delivers; the median customer's LTV is the Micro one."}
```

**P11.** *(the one-page P&L)* The 2026 P&L of the whole book: for each product, the loans disbursed January–September 2026 × each per-loan line of `p3` (income, cost of funds, expected loss, acquisition, servicing, contribution), in billions of soum, plus a total row. Print the total contribution in bn soum, two decimals.

```task
{"id": "w08d2-p13", "kind": "python", "starter": "n26 = ue[ue[\"disbursed_at\"] >= \"2026-01-01\"].groupby(\"product\").size()\nlines = [\"income\", \"cof\", \"el\", \"acq\", \"serv\", \"net\"]\npl = p3[lines].mul(n26, axis=0) / 1e9                  # bn soum\n# TODO: add a total row (pl.loc[\"TOTAL\"] = pl.sum()), print(pl.round(2)),\n#       then print the total contribution, round(pl.loc[\"TOTAL\", \"net\"], 2)\n", "answer": 8.85, "dp": 2, "model": "pl.loc[\"TOTAL\"] = pl.sum()\nprint(pl.round(2))\nprint(round(pl.loc[\"TOTAL\", \"net\"], 2))\n# contribution 2026 (bn): SME 5.68, AUTO 2.61, CONS 0.81, MICRO 0.02, BNPL −0.27 → total 8.85.\n# Income 47.32 bn, cost of funds 34.32 bn: funding takes 73 % of the book's income. SME alone is 64 % of the contribution.\n# Footnote: 2026 volume × the per-loan averages of all loans; funding 18 %, LGD 60 %, acquisition and servicing per channel (ours)."}
```

**P12.** *(telling it)* Storytelling. Rewrite these three titles as so-what titles, using your numbers: (a) "Unit economics by product", (b) "Micro sensitivity", (c) "App customers over 24 months".

```task
{"id": "w08d2-p9", "kind": "free", "min": 30, "rubric": ["each title is a full sentence, not a topic", "each has a number and a comparison", "(a) ranks the products per 1 000 lent and names BNPL's loss", "(b) gives the FPD30 at which a new Micro customer stops paying (about 2.5 % vs 1.7 % today)", "(c) separates the typical app customer (LTV/CAC 1.6) from the few cross-sold ones"], "model": "(a) \"SME and Auto earn 60–73 soum per 1 000 lent; Consumer 32; Micro 7; BNPL loses 108 unless partners pay ~11 %.\" (b) \"A new Micro customer stops paying for itself if FPD30 rises from 1.7 % to 2.5 %.\" (c) \"An app borrower takes 1.3 Micro loans in two years — LTV/CAC 1.6 — and the few who later take branch loans lift the average LTV thirtyfold.\" Each is a sentence, has a number and a comparison, and could stand alone in an e-mail."}
```

> 🚀 **Stretch (optional, +5 XP).** **P13.** *(contribution by risk grade)* Unit economics by **risk grade** inside Consumer loans: PD and EAD ratio per grade, everything else as CONS (branch: acquisition 450 000, servicing 25 000 a month). Which grade does not pay? Print its net per 1 000, then write the one-line pricing recommendation in a comment.

```task
{"id": "w08d2-p10", "kind": "python", "xp": 2, "starter": "c = ue[ue[\"product\"] == \"CONS\"]\nbad_c = c[c[\"dpd\"] > 90]\ng = c.groupby(\"risk_grade\")\ngr = pd.DataFrame({\"loans\": g.size(),\n                   \"principal\": g[\"principal\"].mean(),\n                   \"term\": g[\"term\"].mean(),\n                   \"interest\": g[\"interest\"].mean(),\n                   \"cof\": g[\"bal_months\"].mean() * COF / 12,\n                   \"pd\": (c[\"dpd\"] > 90).groupby(c[\"risk_grade\"]).mean(),\n                   \"ead_ratio\": (bad_c[\"ead\"] / bad_c[\"principal\"]).groupby(bad_c[\"risk_grade\"]).mean()})\nprint(gr.round(3))\n# TODO: income, el, acquisition 450 000, servicing 25 000 x term, net and net per 1 000 by grade\n", "answer": -5.7, "dp": 1, "model": "Grade A: 548 loans, PD 1.46 %, net 1 161 093, 43.0 per 1 000. B: 1 043, 1.63 %, 1 129 509, 41.7. C: 718, 5.85 %, 386 160, 14.7. D: 109, PD 9.17 % (10 loans in 90+), net −164 941, −5.7 per 1 000. Grade D does not pay at 450 000 acquisition: it needs a higher rate or a lower limit — or a cut-off that stops lending to it. One line: \"Consumer grade D loses 6 soum per 1 000 lent at its 9 % PD; price it up or stop approving it.\" EAD per grade is fine here (8–42 loans in 90+ per grade); with fewer, use the product's."}
```

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

```task
{"id": "w08d2-c1", "kind": "free", "min": 15, "rubric": ["starts with an action verb (built, found, computed…)", "names the tool (SQL, pandas)", "has a result with a number", "has the size of the data (sessions, loans, products)"], "model": "\"Built the app funnel for 5 006 loan applications in SQL and found that 7.6 % of signed contracts were never paid out — a loss invisible in the event dashboard\" — or — \"Computed per-product unit economics for 7 828 loans in pandas (funding, expected loss, acquisition) and showed BNPL loses 108 soum per 1 000 lent unless partners pay an ~11 % fee.\""}
```

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

```sqltask
{"check": "handin-W8D2", "lesson": "W8D2", "title": "HW 8.1", "why": "Next week you are in interviews. A recruiter spends about thirty seconds on a CV; what makes them stop is a result with a number from real work — and this course is your real work, if you say what you found, with what, and how big it was.", "graded": ["Achievements are specific and true — tool + action + result + size, every number traceable to your own submissions", "Focus: the CV fits the one chosen role, and job_ad.md maps every requirement to a deliverable or a story", "Form: one page (two at most), no typos, consistent formatting, links that open", "portfolio.md says the data are synthetic and gives four deliverables with link, question, method and result"], "tasks": [{"id": "cv.pdf", "file": "cv.pdf", "names": ["cv.pdf"], "upload": true, "accept": ".pdf", "q": "Attach your CV as a PDF (name it for the role, e.g. `cv_risk_analyst.pdf`; the source `.docx` / `.md` can go in Extra)."}, {"id": "portfolio.md", "file": "portfolio.md", "text": true, "minLines": 3, "q": "Write `portfolio.md` here: the line that the data are synthetic, then your four best deliverables — link, question, method, result."}, {"id": "job_ad.md", "file": "job_ad.md", "text": true, "minLines": 3, "q": "Write `job_ad.md` here: the job advert (text or link), and next to each requirement the deliverable or story that answers it."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "The CV's source file, or anything else (one more file, or a .zip of several)."}]}
```

---

## 6. Self-check

```check
{"id": "w08d2-sc", "questions": [
  {"type": "single", "q": "A product earns the most per loan and the least per soum. Finance is planning next year's funding. Which number do you show?", "options": ["Net per loan", "Net per 1 000 soum lent — where the next billion earns most", "Interest income per loan", "The number of loans"], "answer": 1, "explain": "Per soum for funding decisions; per loan for the head of sales deciding where an afternoon goes (→ 'Contribution margin per loan', P4)."},
  {"type": "single", "q": "Your PD is the share of loans now 90+. For which products does that understate the risk, and how do you check?", "options": ["Short products; drop their young loans", "Long, young products such as SME; recompute PD on matured loans only", "BNPL; add the merchant fee", "None — the crude PD is unbiased"], "answer": 1, "explain": "Most SME loans have not had time to default: matured PD 9.0 % against 3.7 % crude, and its margin per soum falls from 60 to 19 (→ P8)."},
  {"type": "multi", "q": "Which describe how IFRS 9 provisions loans?", "options": ["Healthy loans carry 12 months of expected loss", "Loans whose risk has grown significantly carry lifetime expected loss", "Defaulted loans carry lifetime loss on a defaulted exposure", "A provision is booked only after a loss has happened"], "answer": [0, 1, 2], "explain": "IFRS 9 provisions for the loss we expect, so a rise in 1–30 DPD costs money this month (→ 'Regulators and reporting')."}
]}
```

---

## 7. Company corner <span class="badge company">Ten questions on lending metrics</span>

The whole Company & metrics track, as a self-test. Say each answer out loud in two or three sentences **before** you flip the card — the [interview bank](company/interview.md) has thirty more.

```game
{"type": "flash", "id": "w08d2-g4", "title": "Ten questions on lending metrics", "cards": [["What is DPD, and how do you compute it for a loan with three instalments, the second unpaid?", "As-of date − due date of the OLDEST unpaid instalment (0 if nothing is overdue): here as-of − the second's due date, whatever happened to the third. Nur on 2026-10-01: 399 loans with DPD > 0; 1–30 / 31–60 / 61–90 / 90+ = 124 / 25 / 16 / 234."], ["FPD30 vs PAR30: what does each measure, and which moves first?", "FPD30 = share of NEW loans whose first instalment was not paid within 30 days — a cohort property, known two months after disbursement (Nur 91 / 7 099 = 1.28 %). PAR30 = outstanding with DPD > 30 ÷ all outstanding — the whole book today (3.12 %). FPD moves first."], ["PAR90 and NPL — the same thing?", "Often the same 90-day threshold, but NPL is a classification that can include restructured or 'unlikely to pay' loans (and 60 days under some regulators); PAR90 is pure DPD. Nur NPL90 = 2.55 % (234 loans, 5.32 bn). Say which you use."], ["What is a roll rate, and what does a 1–30 → 31–60 roll of 19.5 % tell collections?", "The share of loans in one bucket at month-end that are in the next bucket a month later. 19.5 % of September's 1–30 loans were 31–60 on 1 October; 75.8 % cured. One in five early-late loans keeps sliding — the early bucket is where contact pays most."], ["Why vintages, and why must some cells be blank?", "A vintage follows loans disbursed in the same month by age (MOB), so cohorts are compared at the same age. A cell is blank until every loan of the cohort has reached that age (+30 days): a 0 there is 'not measured'. Nur's worst: 2025-10, 6.91 % ever-30+ at MOB 3."], ["Two teams report 68 % and 58 % approval for the app. Who is right?", "Probably both: 68.2 % = approved ÷ decided (risk convention); 58.2 % = approved ÷ app sessions (funnel from the top); 84.5 % = approved ÷ submitted forms. Ask for the denominator, then write it under every number."], ["Expected loss for a book: the formula, and one reason the crude version understates it.", "EL = Σ PD × LGD × EAD. Nur's crude version (PD = share now 90+, LGD 60 %) = 3.60 bn, 1.77 % of performing exposure. It understates young, long loans: they have not had time to default (SME matured PD ≈ 9 % vs 3.7 % crude)."], ["Cost of risk vs expected loss.", "EL is a stock — the provision you should hold now. Cost of risk is a flow — the period's P&L charge: change in provisions + write-offs − recoveries, usually ÷ average portfolio, annualised. A jump in 1–30 entries costs money this month, before any default."], ["Collection rate: definition and Nur's number.", "Paid ÷ due, on instalments due in the period, payments counted to a cut-off. Nur, September 2026: 15 982 118 926 ÷ 16 987 977 718 = 94.1 % by 1 October, on de-duplicated payments (raw payments overstate it)."], ["What does a portfolio manager want on one page?", "Size and growth (outstanding 208.7 bn, disbursements per month), mix (product, branch, grade), quality (PAR30 3.12 %, NPL 2.55 %, FPD of the newest mature vintage), and the movers since last month — each tile with its definition and as-of date."]]}
```

> 🎯 **Interview version.** *"What is the difference between FPD and PAR30, and which would you watch after a policy change?"* — FPD30 is a property of a cohort of new loans: the share whose first instalment was not paid within 30 days, known about two months after disbursement. PAR30 is the state of the whole book today: outstanding of loans more than 30 days late over all outstanding. After a policy change I watch FPD of the new vintages, because PAR30 moves months later and is diluted by the old book — at Nur, FPD30 is 1.28 % and PAR30 3.12 %.

**Say it like in an interview.** *"A loan earns 30 % a year. Is it profitable?"* Answer in four or five sentences, with Day 2's numbers.

```task
{"id": "w08d2-ci", "kind": "free", "min": 40, "rubric": ["says the rate alone does not decide it: funding, expected loss, acquisition and servicing come off", "computes funding on the falling balance, not on the original principal", "names expected loss as PD × LGD × EAD and says PD for young long loans is understated", "gives Nur numbers (e.g. loan 1: 2.4 m net, 77 per 1 000; funding takes 60 % of the interest)", "reports per loan and per 1 000 soum lent, with the assumptions printed"], "model": "Not by the rate alone. From the interest over the schedule I take off the cost of funds — computed on the falling balance before each instalment, not on the original principal — the expected loss, PD × LGD × EAD, and the cost of selling and servicing the loan. For Nur's loan 1, a 31 m Consumer loan at 30 %, interest is 10.65 m; funding at 18 % takes 6.39 m — 60 % of it — expected loss 0.48 m, and selling and servicing 1.05 m, which leaves about 2.4 m, or 77 soum per 1 000 lent. I would report it per loan and per 1 000 soum, print the assumptions underneath, and show the break-even — for example the PD or the funding rate at which it stops paying — because the funding rate and the costs are our guesses."}
```

Tomorrow: the capstone. Madina's brief for the board — three days, four deliverables, your recommendations.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w08d2", "pass": 0.8, "questions": [
  {"type": "single", "q": "Finance asks where the next billion of funding earns most. Which number do you show?", "options": ["The number of loans", "Net contribution per 1 000 soum lent", "Interest income per loan", "Net contribution per loan"], "answer": 1, "explain": "Per loan says which product is worth a salesperson's afternoon; per soum says where money earns most — they can rank products differently (→ section 1, 'Contribution margin per loan')."},
  {"type": "single", "q": "Which line misstates loan 1's cost of funds, and how?", "code": "I   = inst[\"interest_due\"].sum()           # line 1: 10 650 293\ncof = 31_150_000 * 0.18 / 12 * 24            # line 2\nnet = (1 - PD) * I - cof - el - acq - serv   # line 3", "options": ["line 1 — interest must be (1 − PD) × I", "No line — it is correct", "line 3 — EL should be added, not subtracted", "line 2 — it charges funding on the original principal for 24 months; it should be on the falling balance before each instalment (6.39 m, not 11.21 m)"], "answer": 3, "explain": "Both the borrower's interest and Nur's funding cost run on the falling annuity balance (→ section 1, 'Cost of funds', section 2)."},
  {"type": "number", "q": "Loan 1 earns a net contribution of 2 392 852 soum on a principal of 31 150 000. What is that per 1 000 soum lent (one decimal)?", "answer": 76.8, "tol": 0.1, "explain": "2 392 852 ÷ 31 150 000 × 1 000 = 76.8 soum per 1 000 lent (→ section 2)."},
  {"type": "single", "q": "This crude PD is computed on all loans of each product. For which products does it understate risk most?", "code": "PD = (ls[\"dpd\"] > 90).groupby(ls[\"code\"]).mean()     # share of loans now 90+, all ages", "options": ["Short products like Micro", "None — it is unbiased", "Long, young products like SME — most of their loans have not had time to default", "BNPL, because it charges 0 %"], "answer": 2, "explain": "Recompute PD on matured loans (last instalment due by the as-of): SME's rises from 3.7 % to about 9 % and its margin per soum falls by two thirds (→ P8)."},
  {"type": "single", "q": "LTV/CAC for app customers is about 48 on average, but most of the LTV comes from a few SME and Auto loans. How do you report it?", "options": ["Drop the SME loans as outliers", "Separately: the typical (Micro-only) LTV/CAC is about 1.6; the few who later take branch loans are very valuable", "Report the median CAC", "'Every app customer is worth 48 times their CAC'"], "answer": 1, "explain": "An average lifted by a few huge cross-sold loans is not what a typical customer delivers (→ P10)."},
  {"type": "single", "q": "Which is a so-what title?", "options": ["Product analysis, Q3", "SME and Auto earn 60–73 soum per 1 000 lent; BNPL loses 108", "Unit economics by product", "Methodology and data sources"], "answer": 1, "explain": "A title is a sentence with a number and a comparison that says what to conclude (→ section 1, 'Telling it — the answer first')."},
  {"type": "multi", "q": "Which statements about IFRS 9 and cost of risk are true?", "options": ["Cost of risk is mostly the change in provisions plus write-offs minus recoveries", "Defaulted loans (usually 90+ DPD) carry lifetime loss on a defaulted exposure", "Healthy loans carry 12 months of expected loss", "Loans whose risk grew significantly (often 30+ DPD) carry lifetime expected loss", "A provision is booked only once a loss has happened"], "answer": [0, 1, 2, 3], "explain": "IFRS 9 provisions for the loss we expect, so a rise in 1–30 DPD costs money this month (→ section 4, 'Regulators and reporting')."},
  {"type": "single", "q": "Company corner: FPD30 or PAR30 — which moves first when new loans get worse?", "options": ["PAR30 — it covers the whole book", "Neither — only NPL moves", "They move together", "FPD30 — a property of a cohort of new loans, known two months after disbursement; PAR30 moves months later, diluted by the old book"], "answer": 3, "explain": "FPD is the leading signal; PAR30 is the state of the whole book today (→ Company corner, question 2)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w08d2", "python": true, "q": "Treasury warns that funding may get dearer. Keep every other assumption of today's table (crude PD, LGD 60 %, EAD ratio from the 90+ loans, app acquisition 60 000 and servicing 8 000 a month) and find the annual funding rate at which an average MICRO loan's net contribution is exactly zero. Give the rate as a percentage to 2 decimals.", "type": "number", "dp": 2, "h": ["0c485fe5d1058605c1dcacd9"], "hint": "Only one line of the table depends on the rate, and it depends on it in a straight line — so net(rate) has one root you can solve for directly.", "sol": "Q29zdCBvZiBmdW5kcyBpcyBsaW5lYXIgaW4gdGhlIHJhdGU6IENvRihyKSA9IGJhbGFuY2UtbW9udGhzIMOXIHIgLyAxMiwgc28gbmV0KHIpID0gbmV0KDApIOKIkiBiYWxhbmNlLW1vbnRocyDDlyByIC8gMTIuCk1JQ1JPIGF2ZXJhZ2VzOiBpbnRlcmVzdCAyNjYgNjYyIMK3IGJhbGFuY2UtbW9udGhzIDcgNjE4IDkyNiDCtyBQRCAyLjg1ICUgwrcgRUwgMzAgMzYwIMK3IGFjcXVpc2l0aW9uIDYwIDAwMCDCtyBzZXJ2aWNpbmcgOCAwMDAgw5cgNC41MCA9IDM1IDk5NgpuZXQoMCkgPSAoMSDiiJIgMC4wMjg0OCkgw5cgMjY2IDY2MiDiiJIgMzAgMzYwIOKIkiA2MCAwMDAg4oiSIDM1IDk5NiA9IDEzMiA3MTMgICAoPSB0b2RheSdzIG5ldCAxOCA0MzAgKyBDb0YgMTE0IDI4NCkKciogPSAxMiDDlyAxMzIgNzEzIC8gNyA2MTggOTI2ID0gMC4yMDkwICAg4oaSIDIwLjkwICUKCnVlID0gdW5pdF9lY29ub21pY3MoaW5zdCwgbHMpOyBtID0gdWUubG9jWyJNSUNSTyJdCnJfc3RhciA9IDEyICogKG1bIm5ldCJdICsgbVsiY29mIl0pIC8gYmFsYW5jZV9tb250aHNfbWljcm8gICAgICAjIGJhbGFuY2UtbW9udGhzID0gY29mIC8gQ09GICogMTIKCjIwLjkwICU6IE1pY3JvIHN0b3BzIGVhcm5pbmcgb24gYSBuZXcgY3VzdG9tZXIgaWYgZnVuZGluZyByaXNlcyBieSBsZXNzIHRoYW4gMyBwb2ludHMg4oCUIHRoZSBmaXJzdCBwcm9kdWN0IHRvIGJyZWFrIGV2ZW4gKENPTlMgMjIuNTMgJSwgQVVUTyAyMi4xOCAlLCBTTUUgMjMuMjEgJTsgQk5QTCBuZXZlciBlYXJucykuCkl0IGlzIHNob3J0LCBzbyBmdW5kaW5nIGlzIGEgc21hbGwgc2hhcmUgb2YgaXRzIGNvc3Qg4oCUIGJ1dCBpdHMgbWFyZ2luIGlzIHNvIHRoaW4gdGhhdCBldmVuIHRoYXQgc2hhcmUgZGVjaWRlcyBpdC4KVGhlIHNsaWRlIGxpbmU6ICdBdCAyMSAlIGZ1bmRpbmcgdGhlIGFwcCdzIE1pY3JvIGJvb2sgZWFybnMgbm90aGluZyBvbiBmaXJzdCBsb2FuczsgcmVwZWF0IGxvYW5zICgyMCAwMDAgYWNxdWlzaXRpb24pIGtlZXAgaXQgcG9zaXRpdmUgdXAgdG8gYWJvdXQgMjcgJScg4oCUIGFuZCBzYXkgdGhhdCB0aGUgcmF0ZSBpcyBvdXIgYXNzdW1wdGlvbi4="}
```

<!-- challenge:end -->
