# Week 8 · Day 2 — Product analytics II and the company day: unit economics, storytelling, the job

<span class="badge">Unit economics 60 min</span> <span class="badge">Practice 45 min</span> <span class="badge">Storytelling 20 min</span> <span class="badge">The company day 60 min</span> <span class="badge">CV 20 min</span> <span class="badge hw">HW 8.1 due Day 3</span> <span class="badge company">Company corner</span>

> STORY **Tuesday, 9:00.** Bekzod has the 2027 budget template open, a column per product, every cell empty. *"Finance wants a number per product: **what does one loan earn us after we pay for the money, for the losses and for selling it?** Kamola wants more Micro, Nilufar wants less BNPL, and I want to know which of them is right before I sign the plan."* Madina, putting a printed job advert on your desk: *"And this afternoon we do something else. Next week you will be in interviews, not in my team. I will walk you through this company from the board to the collections desk — what every desk asks, what every dashboard shows, who reports what to the central bank — and you will write your CV tonight."*

## Today in 3 lines

- You compute the **unit economics of a loan by product** — interest over the schedule, minus the cost of funds, minus expected loss, minus the cost of acquiring and servicing it — per loan and per 1 000 soum lent, with every assumption written down; then **LTV/CAC** for an app customer who comes back, and a **sensitivity**: at what default rate does a product stop paying.
- You learn to **tell it**: the answer first (the pyramid), titles that say "so what", one chart per message, the 10-slide analytical deck, and a page a busy executive reads in two minutes.
- **The company day:** a guided tour of a lending company end to end — departments, who asks the analyst what, a week in the life of five analyst roles, regulators and IFRS 9 in plain words, how to read a company you interview at — and your **CV** with a portfolio built from this course (HW 8.1).

---

## 1. Learn — unit economics of a loan

**Unit economics** (*юнит-экономика*) answers "does one unit make money?" For a lender the unit is **one loan** (or one customer, below). Five lines, each from a table you know:

| Line | What | From | Our assumption |
|---|---|---|---|
| **Interest income** | interest the borrower pays over the schedule | `installments.interest_due`, summed per loan | a defaulting loan pays no interest (conservative); others pay all of it |
| **− Cost of funds** (*стоимость фондирования*) | what Nur pays its own lenders for the money while it is out | the outstanding balance before each instalment × monthly funding rate | **18 % a year**, i.e. 1.5 % a month, on the scheduled balance |
| **− Expected loss** | week 6's EL = PD × LGD × EAD | `v_loan_status` (DPD), `installments` | **PD** = the product's share of loans now 90+ (week 6's crude PD); **LGD = 60 %**; **EAD** = principal × the product's average share of principal still owed at the first unpaid instalment, measured on its 90+ loans |
| **− Acquisition cost** (*стоимость привлечения*) | marketing, the officer's time, the bureau check, the partner's commission | not in the data — ask Finance | **app 60 000**, **branch 450 000**, **partner 100 000** soum per loan |
| **− Servicing cost** | statements, SMS, payment processing, IT, per month of the schedule | not in the data | **app 8 000**, **branch 25 000**, **partner 8 000** soum per month |
| **= Net contribution per loan** | before overheads, tax and capital | | also **per 1 000 soum lent** = net ÷ principal × 1 000 |

Products sell through one channel each (`products.channel`): MICRO in the app, CONS, AUTO and SME at branches, BNPL through partners. The acquisition and servicing figures are **ours**: plausible orders of magnitude, not Nur's books. A unit-economics table without its assumptions printed underneath is a guess dressed as a fact; with them, Finance can replace each one with the real figure and rerun.

> 💡 **Key idea.** Unit economics is five lines — interest, minus funding, minus expected loss, minus the cost of selling, minus the cost of servicing — and every line you did not measure is an **assumption printed under the table**. The table is only as honest as that footnote.

**Cost of funds on a schedule.** For an annuity, the balance falls each month. The interest the *borrower* pays is computed on that balance; so is the interest *Nur* pays on the money it borrowed. Per loan: CoF = Σₖ (balance before instalment k) × 0.18 ÷ 12, where balance before k = principal − principal repaid in instalments 1 … k−1. The difference between the two rates (here 30 % vs 18 % on a Consumer loan) is the **net interest margin** the loan has to cover risk and costs from.

**Per loan vs per soum.** Per loan says which product is worth a salesperson's afternoon; **per 1 000 soum lent** says where the next billion of funding earns most. They can rank products differently: a large loan can earn a lot per loan and little per soum.

> 💡 **Key idea.** Per loan answers "which sale is worth an afternoon"; **per 1 000 soum lent** answers "where does the next billion of funding earn most". Say which question you are answering before you rank anything.

**Sensitivity.** A result that depends on a guess is reported with the **break-even** of that guess: solve net = 0 for one input, holding the others. For risk: net(PD) = (1 − PD) × I − CoF − PD × LGD × EAD − acq − serv = 0 → **PD\* = (I − CoF − acq − serv) ÷ (I + LGD × EAD)**. To speak in FPD (the number risk watches weekly), translate with the product's observed PD ÷ FPD ratio, or with week 7's simplification (every FPD loan defaults, EAD ≈ principal) — and say which.

```game
{"type": "cloze", "id": "w08d2-g1", "title": "Net contribution of one loan", "text": "net = (1 − {{0}}) × interest − {{1}} − PD × {{2}} × EAD − {{3}} − servicing", "code": false, "blanks": [["PD"], ["cost of funds"], ["LGD"], ["acquisition"]], "distractors": ["FPD", "principal", "approval rate", "CAC ÷ LTV"]}
```

**LTV and CAC.** **CAC** (customer acquisition cost) = what it costs to win a *new* borrower. **LTV** (lifetime value) = the contribution that borrower brings over a horizon — the first loan *and* the repeats (Day 1: a large share come back), each repeat costing far less to sell because the customer is already known. **LTV ÷ CAC > 1** means acquisition pays for itself; product people like 3+. Fix the horizon (here 24 months, so the cohort must be at least 24 months old) and say whether cross-sold products count.

> ⚠️ **Watch out.** Three LTV/CAC traps: an LTV built from **revenue** instead of contribution (funding and losses left out), a horizon longer than the cohort has lived (unobservable repeats counted as zero — or worse, extrapolated), and an **average** lifted by a few huge cross-sold loans presented as what a typical customer is worth. Show the median customer next to the average.

### Data storytelling — the answer first

The board will not read your notebook. Four rules:

1. **The pyramid** (*принцип пирамиды*, Barbara Minto): the **answer** at the top, then the 2–4 **reasons**, then the **evidence** for each. Not "first we loaded the data, then…" — the reader gets the conclusion in the first sentence and stops reading when they believe you.
2. **So-what titles.** A slide title is a sentence that says what the reader should conclude: not *"Unit economics by product"* but *"SME and Auto earn 60–73 soum per 1 000 lent; BNPL loses 108"*. If you cannot write the sentence, the slide has no message yet.
3. **One chart, one message.** One chart per slide, the message in the title, the definition and source in a footnote, the number that matters labelled (week 5's chart rules). A second message = a second slide.
4. **Write for a busy executive:** short sentences, numbers rounded to what matters (60 m, not 60 281 093), units on every number, the decision you want in bold, the risks and assumptions in one line each at the end.

```game
{"type": "bug", "id": "w08d2-g2", "title": "Find the line that breaks the pyramid", "q": "Your executive summary for Bekzod. One line does not belong where it is.", "code": "Grow SME and Auto; renegotiate BNPL's merchant fee or slow it.\nSME and Auto earn 60–73 soum per 1 000 lent; BNPL loses 108.\nFirst we loaded seven tables, cleaned the payments and joined the schedules.\nMicro earns 7 per 1 000, but a new app customer pays back the acquisition on the first loan.\nAssumptions: funding 18 %, LGD 60 %, acquisition and servicing costs per channel (ours).", "answer": [2], "why": "The method is not a reason and does not belong in the summary: answer, reasons with numbers, assumptions — the 'how we did it' goes to the appendix."}
```

**The 10-slide analytical deck** (also the capstone's shape):

| # | Slide | Content |
|---|---|---|
| 1 | Title | the question, your name, as-of date, data source |
| 2 | **Executive summary** | the answer in 3 bullets + the decision you recommend |
| 3 | Context | the 3–4 numbers everyone needs (portfolio, growth, PAR30, FPD) |
| 4–8 | **One finding each** | so-what title, one chart, two lines of "why it matters" |
| 9 | Recommendations | what to do, who owns it, by when, what it is worth |
| 10 | Risks, assumptions, next steps | what could make you wrong; what you would analyse next |
| — | Appendix | definitions, method, extra cuts — for questions, never presented |

A **memo** (2 pages) has the same order: answer, reasons with numbers, recommendation, assumptions.

```game
{"type": "order", "id": "w08d2-g3", "title": "The analytical deck, in order", "q": "Put the parts of the 10-slide deck in order.", "items": ["Title: the question, your name, as-of date, source", "Executive summary: the answer in 3 bullets + the decision", "Context: the 3–4 numbers everyone needs", "Findings: one so-what title and one chart each", "Recommendations: what, who, by when, worth", "Risks, assumptions, next steps", "Appendix: definitions and method — never presented"], "why": "The answer comes second, right after the title; the method comes last, in the appendix, for questions."}
```

> ⚠️ **Watch out.** The classic storytelling mistakes: topic titles ("Funnel", "Retention") that make the reader hunt for the message; the method before the answer; a chart with two messages; a number without a unit or a comparison; 25 slides "to be safe". Each one costs you the executive's attention before you reach the recommendation.

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
{"video": "X4asNCIMBRg", "stops": [{"at": 550, "q": "What is CAC?", "options": ["Revenue per customer", "What it costs to acquire one new customer", "The cost of funds", "Customer satisfaction"], "answer": 1, "explain": "For Nur: marketing, the officer's time, the bureau check, the partner's commission — app 60 000, branch 450 000 soum per loan (our assumption)."}, {"at": 595, "q": "LTV ÷ CAC above 1 means…", "options": ["Customers leave quickly", "Acquisition pays for itself over the horizon", "The product loses money on every loan", "Marketing spend should be cut"], "answer": 1, "explain": "A first Micro loan already pays back its 60 000 CAC; the repeats are the profit (P8).", "back": 40}]}
```

---

## 2. Worked example — one Consumer loan (15 min)

Loan 1 (week 1): Consumer, **31 150 000** soum, 24 months, 30 % a year, annuity 1 741 700 a month, branch channel. ▶ Run the block: it reads the loan's schedule from the course database.

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

| Line | Computation | Soum |
|---|---|---|
| interest income | (1 − PD) × I = (1 − 0.0318) × 10 650 293 — CONS PD = 77 of 2 418 loans in 90+ | 10 311 140 |
| − cost of funds | 18 % a year on the average balance of 17 750 489 for 24 months | −6 390 176 |
| − expected loss | PD × 60 % × EAD; EAD = 31 150 000 × 0.8033 (CONS 90+ loans owed 80.3 % of principal when they stopped paying) = 25 023 249 | −478 112 |
| − acquisition | branch | −450 000 |
| − servicing | 25 000 × 24 months | −600 000 |
| **= net contribution** | | **2 392 852** |
| per 1 000 soum lent | 2 392 852 ÷ 31 150 000 × 1 000 | **76.8** |

**The sentence:** *"Loan 1 earns about 2.4 m soum over two years — 77 soum per 1 000 lent — after funding at 18 %, an expected loss of 0.5 m and 1.05 m of selling and servicing; funding takes 60 % of its interest."* The last clause is the one Finance remembers: on a lender's loan, the largest cost is usually the money itself.

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

**P1.** Per product: loans, average principal and term, interest over the schedule, cost of funds — and the cost of funds as a **share of the interest**. Which product's interest does funding eat most of? Finish the code and print that share in %.

```task
{"id": "w08d2-p1", "kind": "python", "starter": "g = ue.groupby(\"product\")\np1 = pd.DataFrame({\"loans\": g.size(),\n                   \"principal\": g[\"principal\"].mean(),\n                   \"term\": g[\"term\"].mean(),\n                   \"interest\": g[\"interest\"].mean(),\n                   \"cof\": g[\"bal_months\"].mean() * COF / 12})   # balance-months x 1.5 % a month\n# TODO: p1[\"cof_share_pct\"] = 100 x cost of funds / interest\n#       then print(p1.round(1))\n", "answer": 75.0, "dp": 1, "model": "AUTO 391 loans · 216 858 133 · 36.2 months · I 90 816 842 · CoF 68 112 632 · 75 %. BNPL 1 569 · 4 170 880 · 7.0 · 0 · 249 053 · — (no interest). CONS 2 418 · 26 926 915 · 14.9 · 5 695 580 · 3 417 348 · 60 %. MICRO 2 669 · 2 705 586 · 4.5 · 266 662 · 114 284 · 43 %. SME 781 · 308 728 745 · 24.3 · 92 835 258 · 64 270 563 · 69 %. AUTO's 24 % leaves only 6 points over the 18 % funding rate: three quarters of its interest goes to funding. BNPL charges the customer nothing — Nur pays for the money from the first day."}
```

**P2.** Expected loss per loan: PD = the product's share of loans now 90+, the EAD ratio measured on each product's 90+ loans, EL = PD × 60 % × EAD ratio × average principal. Print AUTO's EL per loan in whole soum.

```task
{"id": "w08d2-p2", "kind": "python", "starter": "bad = ue[ue[\"dpd\"] > 90].copy()                       # loans now 90+ (week 6's crude PD)\nbad[\"ead_ratio\"] = bad[\"ead\"] / bad[\"principal\"]      # share of principal still owed at the first unpaid instalment\np2 = pd.DataFrame({\"bad\": bad.groupby(\"product\").size(),\n                   \"pd\": (ue[\"dpd\"] > 90).groupby(ue[\"product\"]).mean(),\n                   \"ead_ratio\": bad.groupby(\"product\")[\"ead_ratio\"].mean()})\nprint(p2.round(4))\n# TODO: p2[\"el\"] = p2[\"pd\"] x LGD x p2[\"ead_ratio\"] x p1[\"principal\"]\n#       then print(round(p2.loc[\"AUTO\", \"el\"]))\n", "answer": 3213904, "dp": 0, "model": "AUTO 10 / 391 = 2.56 % · EAD ratio 0.966 · EL 3 213 904. BNPL 42 / 1 569 = 2.68 % · 0.661 · 44 260. CONS 77 / 2 418 = 3.18 % · 0.803 · 413 293. MICRO 76 / 2 669 = 2.85 % · 0.657 · 30 360. SME 29 / 781 = 3.71 % · 0.792 · 5 447 028. AUTO borrowers who default stop almost at once (they still owe 97 % of the principal); short products default with a third already repaid. AUTO's ratio rests on 10 loans — a fragile number; say so."}
```

**P3.** The full table: income, minus cost of funds, expected loss, acquisition and servicing = **net contribution per loan**, and **per 1 000 soum lent**. Print the net per 1 000 for every product.

```task
{"id": "w08d2-p3", "kind": "python", "starter": "p3 = p1[[\"principal\", \"term\", \"interest\", \"cof\"]].join(p2[[\"pd\", \"ead_ratio\"]])\nchannel = ue.groupby(\"product\")[\"channel\"].first()          # one channel per product\np3[\"income\"] = (1 - p3[\"pd\"]) * p3[\"interest\"]                # a defaulting loan pays no interest\np3[\"el\"] = p3[\"pd\"] * LGD * p3[\"ead_ratio\"] * p3[\"principal\"]\np3[\"acq\"] = channel.map(ACQ)\np3[\"serv\"] = channel.map(SERV) * p3[\"term\"]\n# TODO: p3[\"net\"] = income - cof - el - acq - serv\n#       p3[\"per_1000\"] = net / principal x 1 000\n#       then print(p3[[\"net\", \"per_1000\"]].round(1))\n", "answer": -107.7, "dp": 1, "model": "net per loan · per 1 000 lent: AUTO 15 813 021 · 72.9; BNPL −449 053 · −107.7; CONS 860 241 · 31.9; MICRO 18 430 · 6.8; SME 18 612 452 · 60.3. (Income AUTO 88 494 161, CONS 5 514 207, MICRO 259 069, SME 89 388 110; servicing AUTO 904 604, BNPL 55 740, CONS 373 325, MICRO 35 996, SME 608 067.) 2026 loans × net: AUTO 165 → 2.61 bn, BNPL 595 → −0.27 bn, CONS 941 → 0.81 bn, MICRO 1 045 → 0.02 bn, SME 305 → 5.68 bn."}
```

**P3 — read it.** Which product makes the most money **per loan**, and which **per soum lent**?

```task
{"id": "w08d2-p3b", "kind": "choice", "options": ["SME per loan and per soum", "SME per loan (18.6 m), AUTO per soum (72.9 per 1 000)", "AUTO per loan, CONS per soum", "MICRO per soum — it has the highest rate"], "answer": 1, "explain": "Per loan: SME (18.6 m) and AUTO (15.8 m). Per soum: AUTO (72.9), then SME (60.3), CONS (31.9); MICRO barely positive (6.8); BNPL loses 108 soum per 1 000 lent. SME alone is about 64 % of the five products' 2026 contribution (5.68 of 8.85 bn). The ranking of SME/AUTO/CONS above MICRO/BNPL survives any reasonable change of the cost figures; the exact numbers do not."}
```

**P4.** BNPL charges the customer 0 %. Partners (shops) usually pay the lender a **merchant fee** for each sale financed; it is not in our data. What fee, as a percentage of principal, makes an average BNPL loan break even? (From P3: net −449 053 on an average principal of 4 170 880.)

```task
{"id": "w08d2-p4", "kind": "number", "answer": 10.8, "dp": 1, "unit": "% of principal", "hint": "The fee has to cover the loss: −net ÷ principal.", "model": "Fee* = 449 053 ÷ 4 170 880 = 10.8 % of principal. Below it, BNPL loses money on every loan; above it, it earns. The question goes to Finance / the partnerships team: \"What do our partner agreements pay per financed sale, and are they the same for 3, 6 and 12 months?\" (a 12-month BNPL costs four times the funding of a 3-month one). Until that answer exists, \"Nilufar wants less BNPL\" has no money behind it either way — say exactly that."}
```

**P5.** Micro's sensitivity. Net per loan at PD 0, 1, 5, 8 %; then the **break-even PD** for a **first** Micro loan (acquisition 60 000) and for a **repeat** loan (acquisition 20 000: the bureau check and an SMS) with section 1's formula. Print the first-loan break-even PD in %.

```task
{"id": "w08d2-p5", "kind": "python", "starter": "m = p3.loc[\"MICRO\"]\nead_m = m[\"ead_ratio\"] * m[\"principal\"]            # EAD of an average Micro loan\n\ndef net_at(pd_, acq=ACQ[\"app\"]):                  # pd_, not pd: pd is pandas\n    return (1 - pd_) * m[\"interest\"] - m[\"cof\"] - pd_ * LGD * ead_m - acq - m[\"serv\"]\n\nfor x in (0, 0.01, m[\"pd\"], 0.05, 0.08):\n    print(f\"PD {x:.2%}: net per first loan {net_at(x):,.0f}\")\n# TODO: break-even PD = (I - CoF - acq - serv) / (I + LGD x EAD)\n#       for acq = 60 000 (first loan) and acq = 20 000 (repeat loan); print both in % to two decimals\n", "answer": 4.23, "dp": 2, "model": "Net per first loan: PD 0 % → 56 383; 1 % → 43 054; 2.85 % (today) → 18 430; 5 % → −10 260; 8 % → −50 246. A repeat loan earns 40 000 more at every PD. Break-even PD: first loan 4.23 %, repeat 7.23 %."}
```

**P5 — read it.** Risk watches FPD30 weekly, not PD. Today's Micro FPD30 is 41 of 2 411 = 1.70 %, and Micro's PD ÷ FPD = 2.85 ÷ 1.70 = 1.67. At what **FPD30** does a new Micro customer stop paying for itself? (%, one decimal)

```task
{"id": "w08d2-p5b", "kind": "number", "answer": 2.5, "dp": 1, "unit": "% FPD30", "hint": "Divide the first-loan break-even PD by Micro's PD ÷ FPD ratio.", "model": "4.23 % ÷ 1.67 = 2.53 % (repeat loan: 7.23 % → 4.32 %); with week 7's simplification (PD = FPD, EAD = principal) 2.98 % and 5.10 % — say which translation you used. Micro stops paying on a new customer if its FPD30 rises from 1.7 % to about 2.5 % — less than a point of headroom. That is the guardrail number for Kamola's next app experiment, and it is tighter than week 7's +1.25 points because funding and acquisition are now in."}
```

**P6.** The funding rate is our guess. Net per 1 000 soum lent at 14 %, 18 % and 22 %. Which product is most exposed to the cost of money? Print AUTO's per 1 000 at 22 %.

```task
{"id": "w08d2-p6", "kind": "python", "starter": "for rate in (0.14, 0.18, 0.22):\n    cof_r = p3[\"cof\"] / COF * rate               # cost of funds is a straight line in the rate\n    # TODO: net at this rate = income - cof_r - el - acq - serv   (the columns of p3)\n    #       per 1 000 = net / principal x 1 000;  print(rate, per_1000.round(1).to_dict())\n", "answer": 3.1, "dp": 1, "model": "per 1 000 at 14 / 18 / 22 %: AUTO 142.7 / 72.9 / 3.1 · SME 106.5 / 60.3 / 14.0 · CONS 60.1 / 31.9 / 3.7 · MICRO 16.2 / 6.8 / −2.6 · BNPL −94.4 / −107.7 / −120.9. AUTO swings most: it is long (36 months) and priced closest to the funding rate. Per soum it is the best product at 18 % and nearly worthless at 22 %. A lender's product ranking is a statement about its funding cost — put the rate on the slide."}
```

**P7.** The crude PD mixes young and old loans. Recompute PD on **matured** loans only (the last instalment due on or before 2026-10-01) and rerun net per 1 000. Keep AUTO's crude PD — 0 of 23 matured loans is too few to use. Print SME's new per 1 000.

```task
{"id": "w08d2-p7", "kind": "python", "starter": "matured = ue[ue[\"last_due\"] <= \"2026-10-01\"]\nbad_m = (matured[\"dpd\"] > 90).groupby(matured[\"product\"])\nprint(pd.DataFrame({\"bad\": bad_m.sum(), \"matured\": bad_m.size(), \"pd_pct\": (100 * bad_m.mean()).round(2)}))\npd7 = bad_m.mean()\npd7[\"AUTO\"] = p3.loc[\"AUTO\", \"pd\"]                 # too few matured AUTO loans\n# TODO: with pd7 instead of p3[\"pd\"], recompute income = (1 - pd7) x interest and el = pd7 x LGD x ead_ratio x principal,\n#       then net and per 1 000 (cof, acq, serv do not change); print the per 1 000 rounded to 1 decimal\n", "answer": 19.4, "dp": 1, "model": "Matured PD: SME 16 / 178 = 8.99 % (vs 3.71 %), CONS 38 / 1 020 = 3.73 %, MICRO 76 / 2 103 = 3.61 %, BNPL 36 / 1 095 = 3.29 %; AUTO 0 / 23. Net per 1 000: SME 19.4 (from 60.3), CONS 28.2, MICRO 3.0, BNPL −110.1, AUTO 72.9 (unchanged). Long products look safer than they are while most of their loans are young — a two-year SME loan disbursed in 2026 has not had time to default. SME's per-soum lead over CONS disappears at its matured PD; with ~180 matured loans the 9 % itself is uncertain (week 6: an interval, please). Slide line: \"SME's margin depends on a default rate we have not yet observed; read its 2024 vintage before growing it.\""}
```

**P8.** LTV/CAC for an app customer. Take customers whose **first** loan was Micro and was disbursed before October 2024 (so 24 months are observable) and their loans within 24 months, by product. LTV = Σ contribution **before acquisition** of those loans, minus 20 000 per repeat loan, ÷ customers; CAC = 60 000. Print the Micro-only LTV/CAC.

```task
{"id": "w08d2-p8", "kind": "python", "starter": "q = \"\"\"\nWITH ranked AS (\n  SELECT l.customer_id, l.disbursed_at, p.code,\n         ROW_NUMBER() OVER (PARTITION BY l.customer_id ORDER BY l.disbursed_at, l.loan_id) AS n\n  FROM loans l JOIN products p ON p.product_id = l.product_id),\nfirsts AS (SELECT customer_id, disbursed_at AS first_at FROM ranked\n           WHERE n = 1 AND code = 'MICRO' AND disbursed_at < '2024-10-01')\nSELECT r.code AS product, COUNT(*) AS loans, COUNT(DISTINCT r.customer_id) AS customers\nFROM firsts f JOIN ranked r ON r.customer_id = f.customer_id AND r.disbursed_at <= date(f.first_at, '+24 months')\nGROUP BY r.code\"\"\"\nltv = pd.read_sql(q, con).set_index(\"product\")\ncustomers = ltv.loc[\"MICRO\", \"customers\"]           # every one of them has a first Micro loan\nltv[\"contrib\"] = p3[\"income\"] - p3[\"cof\"] - p3[\"el\"] - p3[\"serv\"]   # before acquisition\nprint(customers, \"customers\"); print(ltv)\n# TODO: Micro only: LTV = (Micro loans x Micro contrib - 20 000 x (Micro loans - customers)) / customers\n#       print LTV and LTV / 60 000 (two decimals)\n", "answer": 1.6, "dp": 1, "model": "344 customers, 665 loans in 24 months (1.93 each): 447 MICRO (1.30 each), 96 CONS, 74 BNPL, 32 SME, 16 AUTO. Contribution before acquisition: MICRO 78 430 per loan (net 18 430 + 60 000), CONS 1 310 241, BNPL −349 053, AUTO 16 263 021, SME 19 062 452. Micro only: LTV 95 925 soum, LTV/CAC = 1.6 — a first Micro loan already pays back its CAC (78 430 > 60 000); the repeats are the profit. All products: LTV 2 903 483, LTV/CAC ≈ 48 — but about 87 % of it comes from 48 SME and AUTO loans among 344 customers. Report it as \"Micro customers who later take a branch loan are very valuable\", not as an average every app customer delivers; the median customer's LTV is the Micro one."}
```

**P9.** Storytelling. Rewrite these three titles as so-what titles, using your numbers: (a) "Unit economics by product", (b) "Micro sensitivity", (c) "App customers over 24 months".

```task
{"id": "w08d2-p9", "kind": "free", "min": 30, "rubric": ["each title is a full sentence, not a topic", "each has a number and a comparison", "(a) ranks the products per 1 000 lent and names BNPL's loss", "(b) gives the FPD30 at which a new Micro customer stops paying (about 2.5 % vs 1.7 % today)", "(c) separates the typical app customer (LTV/CAC 1.6) from the few cross-sold ones"], "model": "(a) \"SME and Auto earn 60–73 soum per 1 000 lent; Consumer 32; Micro 7; BNPL loses 108 unless partners pay ~11 %.\" (b) \"A new Micro customer stops paying for itself if FPD30 rises from 1.7 % to 2.5 %.\" (c) \"An app borrower takes 1.3 Micro loans in two years — LTV/CAC 1.6 — and the few who later take branch loans lift the average LTV thirtyfold.\" Each is a sentence, has a number and a comparison, and could stand alone in an e-mail."}
```

> 🚀 **Stretch (optional, +5 XP).** **P10.** Unit economics by **risk grade** inside Consumer loans: PD and EAD ratio per grade, everything else as CONS (branch: acquisition 450 000, servicing 25 000 a month). Which grade does not pay? Print its net per 1 000, then write the one-line pricing recommendation in a comment.

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
  {"type": "single", "q": "A product earns the most per loan and the least per soum. Finance is planning next year's funding. Which number do you show?", "options": ["Net per loan", "Net per 1 000 soum lent — where the next billion earns most", "Interest income per loan", "The number of loans"], "answer": 1, "explain": "Per soum for funding decisions; per loan for the head of sales deciding where an afternoon goes (→ 'Per loan vs per soum', P3)."},
  {"type": "single", "q": "Your PD is the share of loans now 90+. For which products does that understate the risk, and how do you check?", "options": ["Short products; drop their young loans", "Long, young products such as SME; recompute PD on matured loans only", "BNPL; add the merchant fee", "None — the crude PD is unbiased"], "answer": 1, "explain": "Most SME loans have not had time to default: matured PD 9.0 % against 3.7 % crude, and its margin per soum falls from 60 to 19 (→ P7)."},
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
  {"type": "single", "q": "Finance asks where the next billion of funding earns most. Which number do you show?", "options": ["The number of loans", "Net contribution per 1 000 soum lent", "Interest income per loan", "Net contribution per loan"], "answer": 1, "explain": "Per loan says which product is worth a salesperson's afternoon; per soum says where money earns most — they can rank products differently (→ section 1, 'Per loan vs per soum')."},
  {"type": "single", "q": "Which line misstates loan 1's cost of funds, and how?", "code": "I   = inst[\"interest_due\"].sum()           # line 1: 10 650 293\ncof = 31_150_000 * 0.18 / 12 * 24            # line 2\nnet = (1 - PD) * I - cof - el - acq - serv   # line 3", "options": ["line 1 — interest must be (1 − PD) × I", "No line — it is correct", "line 3 — EL should be added, not subtracted", "line 2 — it charges funding on the original principal for 24 months; it should be on the falling balance before each instalment (6.39 m, not 11.21 m)"], "answer": 3, "explain": "Both the borrower's interest and Nur's funding cost run on the falling annuity balance (→ section 1, 'Cost of funds on a schedule', section 2)."},
  {"type": "number", "q": "Loan 1 earns a net contribution of 2 392 852 soum on a principal of 31 150 000. What is that per 1 000 soum lent (one decimal)?", "answer": 76.8, "tol": 0.1, "explain": "2 392 852 ÷ 31 150 000 × 1 000 = 76.8 soum per 1 000 lent (→ section 2)."},
  {"type": "single", "q": "This crude PD is computed on all loans of each product. For which products does it understate risk most?", "code": "PD = (ls[\"dpd\"] > 90).groupby(ls[\"code\"]).mean()     # share of loans now 90+, all ages", "options": ["Short products like Micro", "None — it is unbiased", "Long, young products like SME — most of their loans have not had time to default", "BNPL, because it charges 0 %"], "answer": 2, "explain": "Recompute PD on matured loans (last instalment due by the as-of): SME's rises from 3.7 % to about 9 % and its margin per soum falls by two thirds (→ P7)."},
  {"type": "single", "q": "LTV/CAC for app customers is about 48 on average, but most of the LTV comes from a few SME and Auto loans. How do you report it?", "options": ["Drop the SME loans as outliers", "Separately: the typical (Micro-only) LTV/CAC is about 1.6; the few who later take branch loans are very valuable", "Report the median CAC", "'Every app customer is worth 48 times their CAC'"], "answer": 1, "explain": "An average lifted by a few huge cross-sold loans is not what a typical customer delivers (→ P8)."},
  {"type": "single", "q": "Which is a so-what title?", "options": ["Product analysis, Q3", "SME and Auto earn 60–73 soum per 1 000 lent; BNPL loses 108", "Unit economics by product", "Methodology and data sources"], "answer": 1, "explain": "A title is a sentence with a number and a comparison that says what to conclude (→ section 1, 'Data storytelling')."},
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
